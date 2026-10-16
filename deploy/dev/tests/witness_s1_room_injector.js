#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-S1-ROOM-INJECTOR scope (READ THE LOG after every run)
 * SCOPE: prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §STAKEHOLDER_STROLL S1 — port the room injector
 * into deploy/dev. §R5-A shipped room_graph_bridge.js CODE-ONLY (`selfHeal=none(R5-B)`), so every
 * un-roomed building fell to the legacy tour and could never be strolled at all. S1 lands the
 * patch source + the lazy lib/room_walker.js walk + the rooms_meta stamp + the IDB persist.
 *
 * ISSUE IT PROVES/DISPROVES — the three gates the spec names, in its own words:
 *   (G1) "SampleHouse goes legacy → §FLY_ROUTE with rooms>0". SampleHouse ships ZERO rooms (it has
 *        no spatial_structure table at all). The injector must compile rooms from its walls/doors
 *        and the tour must then fly the GRAPH route, not the legacy centroid one.
 *   (G2) "Clinic's 10/10 stays green" — the §R5-A witness is re-run as a child process, so its own
 *        checks (not a re-implementation of them) are what pass or fail. ⚠ ONE of its ten checks was
 *        RETARGETED by this work, and that is stated rather than hidden: its G4 asserted the literal
 *        string `selfHeal=none(R5-B)`, the placeholder §R5-A shipped while the injector was still
 *        unported. S1 ports it, so that string is false BY DESIGN; G4 now asserts the bridge still
 *        logs its state classification. Ten checks in, ten checks out — see that file's own header.
 *   (G3) THE ONE THAT TESTS THE FIX THIS PORT SHIPS. Run the injector against Duplex (which ships
 *        21 authored IfcSpaces: A101…A205, each with a real IFC guid 0BTBFw6f90Nf…) and assert all
 *        21 survive BY NAME AND BY GUID, and that ZERO of them were replaced by an `RM_` guid or an
 *        "≈ Level N Rk" name. FAIL = the clobber is back.
 *        G3 is measured at TWO depths, because one of them is the actual load-bearing claim:
 *          G3a — the injector's STATE MACHINE: 21 authored rows classify as state='none', so the
 *                walker is never invoked (§S1_AUTHORED_KEEP logged, §S1_INJECT absent) — even under
 *                {force:true}, because the 'none' branch returns above the force check.
 *          G3b — DEFENCE IN DEPTH, node-side, no browser: call RoomWalker.walk() DIRECTLY on the
 *                21-room db, bypassing the state machine entirely, and assert the 21 authored rows
 *                still survive. This answers the spec's own "honest limit": it settles whether the
 *                walker itself is destructive, instead of arguing from file archaeology.
 *
 * ⚠ FIXTURE RULE (same as W-R5A-DEV-GRAPH-TOUR, measured 2026-07-26): room-bearing DBs are LOCAL,
 * `~/bim-ootb/buildings/` — never fetched from OCI. Duplex is the inverted case in that map: the
 * 21-authored-room copy is bim-compiler's OWN `deploy/dev/buildings/Duplex_extracted.db`
 * (9,625,600 B, 21 IfcSpaces), while `~/bim-ootb/buildings/Duplex_extracted.db` holds 5 RM_ rows
 * and zero authored names. G3 deliberately runs against the 21-room copy — that is the fixture
 * with something to lose.
 *
 * RUN: node deploy/dev/tests/witness_s1_room_injector.js   (serves deploy/dev itself on PORT)
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');

const DEV = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 8434;
let pass = 0, fail = 0;
const chk = (n, c, x) => { if (c) { pass++; console.log('  ✅ ' + n + (x ? '  ' + x : '')); } else { fail++; console.log('  ❌ ' + n + (x ? '  ' + x : '')); } };

const DUPLEX = path.join(DEV, 'buildings', 'Duplex_extracted.db');
const SAMPLEHOUSE = path.join(DEV, 'buildings', 'SampleHouse_extracted.db');

function serve() {
  return new Promise(resolve => {
    const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: DEV, stdio: 'ignore' });
    setTimeout(() => resolve(srv), 1200);
  });
}
const has = (logs, re) => logs.some(l => re.test(l));
const line = (logs, re) => logs.find(l => re.test(l)) || '';

// Wait for the viewer to be up and its db queryable, then for streaming to settle — same shape as
// the §R5-A witness, so a difference between the two runs is a real difference, not a timing one.
async function openBuilding(browser, dbRel) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
  await page.goto(`http://localhost:${PORT}/index.html?db=${dbRel}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.APP && window.APP.camera, { timeout: 120000 });
  await page.waitForFunction(() => { try { const r = window.APP.dbQuery('SELECT COUNT(*) FROM element_transforms'); return r && r.length && r[0][0] > 0; } catch (e) { return false; } },
    { timeout: 240000, polling: 2000 }).catch(() => {});
  for (let i = 0; i < 90; i++) { if (!(await page.evaluate(() => !!window.APP.streaming))) break; await new Promise(r => setTimeout(r, 1000)); }
  return { page, logs };
}

// The authored-room census: every IfcSpace row that is NOT compiler-owned, by guid AND name.
// Compiler-owned = an RM_/STC_ guid (room_walker.js's own convention) — the same test the injector
// itself uses, so the witness and the code under test agree on what "authored" means.
const CENSUS_SQL = "SELECT guid, name FROM spatial_structure WHERE type='IfcSpace' ORDER BY guid";
function splitCensus(rows) {
  const authored = [], compiled = [];
  for (const [guid, name] of rows) {
    if (/^(RM_|STC_)/.test(guid)) compiled.push([guid, name]); else authored.push([guid, name]);
  }
  return { authored, compiled };
}

(async () => {
  console.log('══ W-S1-ROOM-INJECTOR — deploy/dev can stroll an un-roomed building, without clobbering an authored one ══\n');

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // G3b FIRST, node-side, no browser: is the WALKER itself destructive to authored rooms?
  // This runs on a COPY in a temp dir — the repo fixture is never written to.
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  console.log('── G3b — RoomWalker.walk() called DIRECTLY on the 21-room Duplex (state machine bypassed)');
  {
    const initSqlJs = require('/home/red1/bim-compiler/node_modules/sql.js');
    const RW = require(path.join(DEV, 'lib', 'room_walker.js'));
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DUPLEX));
    const before = splitCensus(db.exec(CENSUS_SQL)[0].values);
    let walkErr = null;
    try { RW.walk(db, { write: true }); } catch (e) { walkErr = e.message; }
    const after = splitCensus(db.exec(CENSUS_SQL)[0].values);
    const beforeKeys = before.authored.map(r => r[0] + '|' + r[1]);
    const afterKeys = new Set(after.authored.map(r => r[0] + '|' + r[1]));
    const lost = beforeKeys.filter(k => !afterKeys.has(k));
    console.log('   before: authored=' + before.authored.length + ' compiled=' + before.compiled.length +
      '  →  after: authored=' + after.authored.length + ' compiled=' + after.compiled.length +
      (walkErr ? '  walkErr=' + walkErr : ''));
    console.log('   authored sample: ' + before.authored.slice(0, 4).map(r => r[1] + '(' + r[0].slice(0, 12) + '…)').join(', '));
    chk('G3b fixture really carries 21 authored IfcSpaces', before.authored.length === 21, 'authored=' + before.authored.length);
    chk('G3b walker did not delete any authored room (guid+name both intact)', lost.length === 0,
      lost.length ? 'LOST ' + lost.slice(0, 5).join(', ') : 'all ' + beforeKeys.length + ' survive');
    chk('G3b no authored row was renamed to an "≈ Level N Rk" form',
      !after.authored.some(r => /^≈ /.test(r[1] || '')),
      after.authored.filter(r => /^≈ /.test(r[1] || '')).map(r => r[1]).join(',') || 'none');
    db.close();
  }

  const srv = await serve();
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox', '--enable-unsafe-swiftshader'] });

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // G3a — the injector's own state machine, in the browser, on the real page.
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  console.log('\n── G3a — A.ensureRooms({force:true}) on Duplex (21 authored IfcSpaces)');
  {
    const { page, logs } = await openBuilding(browser, 'buildings/Duplex_extracted.db');
    const before = splitCensus(await page.evaluate(sql => window.APP.dbQuery(sql), CENSUS_SQL));
    // force:true is the HARSHEST call the UI can make (the needle's recompute press). If anything
    // is going to clobber authored rooms, this is it.
    const res = await page.evaluate(() => window.APP.ensureRooms({ force: true }));
    const after = splitCensus(await page.evaluate(sql => window.APP.dbQuery(sql), CENSUS_SQL));

    const beforeKeys = before.authored.map(r => r[0] + '|' + r[1]);
    const afterKeys = new Set(after.authored.map(r => r[0] + '|' + r[1]));
    const lost = beforeKeys.filter(k => !afterKeys.has(k));
    const keep = line(logs, /§S1_AUTHORED_KEEP/), ens = line(logs, /§S1_ENSURE_ROOMS/);
    if (ens) console.log('   ' + ens.slice(0, 170));
    if (keep) console.log('   ' + keep.slice(0, 170));
    console.log('   ensureRooms → ' + JSON.stringify(res) + '   authored ' + before.authored.length + '→' + after.authored.length +
      '  compiled ' + before.compiled.length + '→' + after.compiled.length);

    chk('G3a all 21 authored IfcSpaces survive by name AND guid', before.authored.length === 21 && lost.length === 0,
      lost.length ? 'LOST ' + lost.slice(0, 5).join(', ') : before.authored.length + '/21 intact');
    chk('G3a the authored names are the real ones (A101…A205)',
      ['A101', 'A102', 'A201'].every(n => after.authored.some(r => r[1] === n)),
      after.authored.slice(0, 6).map(r => r[1]).join(','));
    chk('G3a zero authored rooms replaced by an RM_*/"≈ Level N Rk" row',
      after.compiled.length === 0 && !after.authored.some(r => /^≈ /.test(r[1] || '')),
      'compiled=' + after.compiled.length);
    chk('G3a the injector reported the protective branch (§S1_AUTHORED_KEEP)', !!keep, keep ? 'logged' : 'MISSING');
    chk('G3a the walker never ran on this building (§S1_INJECT absent)', !has(logs, /§S1_INJECT /),
      line(logs, /§S1_INJECT /).slice(0, 100) || 'absent, as required');
    chk('G3a ensureRooms returned present/real (not injected)',
      res && res.status === 'present' && res.real === true, JSON.stringify(res));
    chk('G3a no page error', !has(logs, /PAGEERROR|§LOAD_FAIL/), line(logs, /PAGEERROR|§LOAD_FAIL/).slice(0, 120) || 'clean');
    await page.close();
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // G1 — SampleHouse: zero rooms today, must be strollable after the port. REAL USER PATH (press ✈).
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  console.log('\n── G1 — SampleHouse (ships ZERO rooms, no spatial_structure table at all), press ✈');
  {
    const { page, logs } = await openBuilding(browser, 'buildings/SampleHouse_extracted.db');
    const roomsBefore = await page.evaluate(() => {
      try { return window.APP.dbQuery("SELECT COUNT(*) FROM spatial_structure WHERE type='IfcSpace'")[0][0]; } catch (e) { return 'no-table'; }
    });
    await page.evaluate(() => window.APP.toggleFlyAround());
    for (let i = 0; i < 240; i++) { if (has(logs, /§FLY_ROUTE |§FLY_ROUTE_REJECT|§TOUR_/)) break; await new Promise(r => setTimeout(r, 1000)); }
    await new Promise(r => setTimeout(r, 3000));
    const st = await page.evaluate(() => ({
      actions: (window.APP.walkActions || []).length,
      rooms: (() => { try { return window.APP.dbQuery("SELECT COUNT(*) FROM spatial_structure WHERE type='IfcSpace'")[0][0]; } catch (e) { return 0; } })(),
      nodes: (() => { try { const g = window.APP.getRoomGraph(); return g ? g.nodes.length : -1; } catch (e) { return -1; } })(),
    }));
    const inj = line(logs, /§S1_INJECT /), flyInj = line(logs, /§FLY_INJECT/), fly = line(logs, /§FLY_ROUTE /),
          persist = line(logs, /§S1_PERSIST/), stamp = line(logs, /§S1_STAMP /);
    for (const l of [line(logs, /§S1_ENSURE_ROOMS/), inj, stamp, persist, flyInj, fly].filter(Boolean)) console.log('   ' + l.slice(0, 190));
    console.log('   rooms before=' + roomsBefore + '  after=' + st.rooms + '  graphNodes=' + st.nodes + '  actions=' + st.actions);

    chk('G1 fixture really ships zero rooms', roomsBefore === 'no-table' || roomsBefore === 0, 'before=' + roomsBefore);
    chk('G1 the injector compiled rooms (§S1_INJECT rooms>0)',
      !!inj && +(inj.match(/rooms=(\d+)/) || [0, 0])[1] > 0, inj ? inj.replace(/^.*§S1_INJECT /, '').slice(0, 90) : 'MISSING');
    chk('G1 the rooms are in the live db after injection', st.rooms > 0, 'rooms=' + st.rooms);
    chk('G1 the tour flew the GRAPH route (§FLY_ROUTE, not a reject)', !!fly,
      fly ? fly.replace(/^.*§FLY_ROUTE /, '').slice(0, 90) : (line(logs, /§FLY_ROUTE_REJECT/).slice(0, 120) || 'absent'));
    chk('G1 tour.js saw the injection (§FLY_INJECT status=injected)', /status=injected/.test(flyInj),
      flyInj ? flyInj.replace(/^.*§FLY_INJECT /, '').slice(0, 90) : 'MISSING');
    chk('G1 rooms_meta was stamped (§S1_STAMP)', !!stamp, stamp ? stamp.replace(/^.*§S1_STAMP /, '').slice(0, 80) : 'MISSING');
    chk('G1 injected bytes persisted to the IDB cache slot (§S1_PERSIST idb=ok)', /idb=ok/.test(persist),
      persist ? persist.replace(/^.*§S1_PERSIST /, '').slice(0, 70) : 'MISSING');
    chk('G1 the tour still produces actions', st.actions > 0, 'actions=' + st.actions);
    chk('G1 no page error', !has(logs, /PAGEERROR|§LOAD_FAIL/), line(logs, /PAGEERROR|§LOAD_FAIL/).slice(0, 120) || 'clean');
    await page.close();
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // G2b — Clinic's ROOM-SET CHANGE, measured and asserted here rather than eyeballed.
  // ⚠ WHY THIS BLOCK EXISTS (watchdog finding, 2026-07-26): S1's first report cited Clinic moving
  // 118→207 rooms and its main hall 323.4→111.2 m² from a scratchpad probe and terminal output —
  // no §-line in any saved log. Under this project's Log Mandate that is not evidence. The numbers
  // are real, so the fix is to make the witness produce them: measure before/after, capture the
  // §S1_VERSION_STALE line that causes the recompile, and print the elected hall's area.
  // The MECHANISM is asserted; the exact counts/areas are PRINTED, not hardcoded — pinning 207 or
  // 111.2 would make the gate fail on any legitimate walker improvement, which is not what it is
  // for. The mechanism is the claim: no rooms_meta ⇒ version-stale ⇒ recompile ⇒ a bigger room set.
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  console.log('\n── G2b — Clinic (118 shipped compiled rooms, local ~/bim-ootb/buildings), press ✈');
  {
    const CLINIC_SRC = process.env.LOCAL_DB_SRC ? path.join(process.env.LOCAL_DB_SRC, 'Clinic_extracted.db')
                                                : '/home/red1/bim-ootb/buildings/Clinic_extracted.db';
    const clinicLink = path.join(DEV, 'buildings', '_ws1_Clinic_extracted.db');
    if (!fs.existsSync(CLINIC_SRC)) {
      chk('G2b Clinic fixture present', false, 'ABSENT ' + CLINIC_SRC + ' — cannot measure');
    } else {
      try { fs.unlinkSync(clinicLink); } catch (e) {}
      fs.symlinkSync(CLINIC_SRC, clinicLink);
      try {
        const { page, logs } = await openBuilding(browser, 'buildings/_ws1_Clinic_extracted.db');
        const before = await page.evaluate(() => {
          const q = s => { try { return window.APP.dbQuery(s); } catch (e) { return null; } };
          const c = q("SELECT COUNT(*), COUNT(CASE WHEN guid LIKE 'RM\\_%' ESCAPE '\\' THEN 1 END) FROM spatial_structure WHERE type='IfcSpace'");
          return { total: c ? c[0][0] : -1, compiled: c ? c[0][1] : -1, meta: q("SELECT version FROM rooms_meta WHERE id=1") };
        });
        await page.evaluate(() => window.APP.toggleFlyAround());
        for (let i = 0; i < 240; i++) { if (has(logs, /§FLY_ROUTE |§FLY_ROUTE_REJECT/)) break; await new Promise(r => setTimeout(r, 1000)); }
        await new Promise(r => setTimeout(r, 3000));
        const after = await page.evaluate(() => {
          try { const c = window.APP.dbQuery("SELECT COUNT(*), COUNT(DISTINCT room_guid) FROM spatial_structure WHERE type='IfcSpace'");
                return { rects: c[0][0], rooms: c[0][1] }; } catch (e) { return { rects: -1, rooms: -1 }; }
        });
        const stale = line(logs, /§S1_VERSION_STALE/), inj = line(logs, /§S1_INJECT /),
              hl = line(logs, /§FLY_HL_FIRST/), fly = line(logs, /§FLY_ROUTE /);
        // Every line the claim rests on, printed in full so it lands in the saved log verbatim.
        for (const l of [line(logs, /§S1_ENSURE_ROOMS/), stale, inj, line(logs, /§S1_STAMP /), fly, hl].filter(Boolean)) {
          console.log('   ' + l.slice(0, 240));
        }
        const hallArea = (hl.match(/area=([\d.]+)/) || [])[1];
        const hallName = (hl.match(/mainHall="([^"]*)"/) || [])[1];
        console.log('   MEASURED: shipped ' + before.total + ' IfcSpace rows (' + before.compiled + ' compiled, rooms_meta=' +
          (before.meta && before.meta.length ? before.meta[0][0] : 'ABSENT') + ')  →  after recompile ' +
          after.rooms + ' rooms / ' + after.rects + ' rects;  elected mainHall=' + (hallName || '?') + ' area=' + (hallArea || '?') + ' m²');

        chk('G2b Clinic ships an all-compiled room set (the recompile precondition)',
          before.total > 0 && before.total === before.compiled, 'total=' + before.total + ' compiled=' + before.compiled);
        chk('G2b that shipped set carries NO rooms_meta stamp (this is WHY it is stale)',
          !before.meta || before.meta.length === 0, before.meta && before.meta.length ? 'stamped=' + before.meta[0][0] : 'absent');
        chk('G2b the version check fired with stored=null (§S1_VERSION_STALE)',
          /§S1_VERSION_STALE/.test(stale) && /stored=null/.test(stale),
          stale ? stale.replace(/^.*§S1_VERSION_STALE /, '').slice(0, 110) : 'MISSING');
        chk('G2b it recompiled to a LARGER room set than shipped (§S1_INJECT)',
          !!inj && after.rooms > before.total, before.total + ' → ' + after.rooms + ' rooms / ' + after.rects + ' rects');
        chk('G2b the tour still routes on the recompiled set (§FLY_ROUTE)', !!fly,
          fly ? fly.replace(/^.*§FLY_ROUTE /, '').slice(0, 80) : (line(logs, /§FLY_ROUTE_REJECT/).slice(0, 110) || 'absent'));
        chk('G2b a main hall was still elected, with a measured area (§FLY_HL_FIRST)',
          !!hallArea && +hallArea > 0, hallName ? hallName + ' area=' + hallArea + ' m²' : 'MISSING');
        chk('G2b no page error', !has(logs, /PAGEERROR|§LOAD_FAIL/), line(logs, /PAGEERROR|§LOAD_FAIL/).slice(0, 120) || 'clean');
        await page.close();
      } finally { try { fs.unlinkSync(clinicLink); } catch (e) {} }
    }
  }

  await browser.close();
  try { srv.kill(); } catch (e) {}
  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // G2 — the §R5-A witness, re-run as a child process (rather than re-implementing its checks,
  // which is what makes the "Clinic is unaffected" claim honest). Its G4 was retargeted by S1 —
  // reason in both headers; the other nine checks are untouched and still 10 checks total.
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  console.log('\n── G2 — re-running W-R5A-DEV-GRAPH-TOUR (Clinic 10/10 must stay green; its G4 retargeted by S1)');
  const r5a = spawnSync('node', [path.join(__dirname, 'witness_r5a_dev_graph_tour.js')],
    { encoding: 'utf8', timeout: 900000, env: Object.assign({}, process.env, { PORT: '8433' }) });
  const r5aOut = (r5a.stdout || '') + (r5a.stderr || '');
  // ⚠ FULL child stdout, not a 3-line tail (watchdog finding, 2026-07-26: the tail dropped every
  // Clinic-specific §-line the child printed — §FLY_ROUTE, §FLY_HL_FIRST and its area — so the
  // saved log could not back a single number quoted from this gate). Echoing the whole child run
  // is the point of running it as a child at all: its evidence must reach THIS witness's log.
  console.log('   ┌─ child stdout (W-R5A-DEV-GRAPH-TOUR) ─────────────────────────────────────────');
  for (const l of r5aOut.replace(/\s+$/, '').split('\n')) console.log('   │ ' + l);
  console.log('   └───────────────────────────────────────────────────────────────────────────────');
  const m10 = r5aOut.match(/(\d+) passed, (\d+) failed/);
  chk('G2 §R5-A witness green', r5a.status === 0 && !!m10 && +m10[2] === 0, m10 ? m10[0] : 'no result line');
  chk('G2 §R5-A witness still 10/10 (no check silently lost)', !!m10 && +m10[1] === 10, m10 ? m10[1] + ' passed' : 'n/a');

  console.log('\n' + (fail ? '❌ FAIL ' : '✅ PASS ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR ' + (e && e.stack || e)); process.exit(1); });
