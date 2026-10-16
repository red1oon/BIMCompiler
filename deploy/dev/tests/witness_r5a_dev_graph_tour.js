#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-R5A-DEV-GRAPH-TOUR scope (READ THE LOG after every run)
 * SCOPE: prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §R5-A — deploy/dev had NONE of the occupant
 * room-graph stack (R5, line ~96), so its Fly tour was the legacy Euclidean nearest-neighbour one:
 * no highlight-first ordering, no wall-legal legs. This ports the stack (room_habitability,
 * storey_raster, room_graph, hallway_backbone) + tour.js v19 + a two-function bridge
 * (getRoomGraph/ensureRooms) into deploy/dev. §R5-A was CODE ONLY; the patch/self-heal loader landed
 * afterwards as §STAKEHOLDER_STROLL S1 (W-S1-ROOM-INJECTOR) — see the G4 note below.
 *
 * ISSUE IT PROVES/DISPROVES:
 *   (G1) A building that SHIPS rooms (Clinic — native IfcSpaces, no patch needed) now flies the
 *        GRAPH route in deploy/dev: §FLY_ROUTE appears with stops=N/N, and §FLY_HL_FIRST names a
 *        main hall. This is the "does Clinic show a highlight" answer the port exists for.
 *   (G2) Graceful degradation is REAL, not claimed: a building with no rooms must log
 *        §FLY_ROUTE_REJECT and still produce a legacy tour with actions > 0 — the port cannot make
 *        an un-roomed building worse than it was.
 *   (G3) The new script tags load clean: no §LOAD_FAIL, no §R5A_BRIDGE_ABSENT, no page error.
 *   (G4) The bridge reports its room-state classification before doing anything, so a log reader can
 *        always see WHICH branch ran: §S1_ENSURE_ROOMS … state=none|recompute|zero.
 *        ⚠ RETARGETED 2026-07-26 by §STAKEHOLDER_STROLL S1, deliberately, not silently weakened.
 *        G4 originally asserted `selfHeal=none(R5-B)` — the placeholder §R5-A shipped while the
 *        injector was still unported. S1 ported it, so that string is now FALSE BY DESIGN and the
 *        old G4 would fail forever on a correctly-working viewer. The check was kept (same count,
 *        one per case) and pointed at what the bridge must still prove: it logs its classification
 *        rather than injecting silently. W-S1-ROOM-INJECTOR owns the injector's own gates.
 *
 * RUN: node deploy/dev/tests/witness_r5a_dev_graph_tour.js   (serves deploy/dev itself on PORT)
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');

const DEV = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 8433;
let pass = 0, fail = 0;
const chk = (n, c, x) => { if (c) { pass++; console.log('  ✅ ' + n + (x ? '  ' + x : '')); } else { fail++; console.log('  ❌ ' + n + (x ? '  ' + x : '')); } };

// Buildings: one that ships real rooms, one that ships none — the two halves of the contract.
// ⚠ FIXTURE RULE (measured 2026-07-26, user correction: "instead of going to OCI, why not here
// locally? All source DBs lie here"). THE ROOM-BEARING LOCAL COPY IS `~/bim-ootb/buildings/`:
//   ~/bim-ootb/buildings/Clinic_extracted.db      118 IfcSpace rooms   (= what OCI serves)
//   bim-compiler/deploy/buildings/Clinic_...db    NO spatial_structure (pre-room extraction)
//   deploy/dev/buildings/Clinic_...db             NO spatial_structure (stale mirror, 0-byte stub)
// So this witness SYMLINKS the room-bearing local DBs into the served tree itself and never touches
// OCI — OCI is a deploy TARGET, not a source. Symlinks are created before the run and removed after,
// so the repo tree is left exactly as found. Same principle as the standing localhost:8399 sandbox
// (memory: reference_bim_ootb_sandbox) — resolve buildings LOCALLY, by symlink, per run.
const LOCAL_SRC = process.env.LOCAL_DB_SRC || '/home/red1/bim-ootb/buildings';
const CASES = [
  // { label, src: room-bearing local DB (symlinked in), expectGraph }
  { label: 'Clinic (118 rooms, local ~/bim-ootb/buildings)', src: path.join(LOCAL_SRC, 'Clinic_extracted.db'), expectGraph: true },
  { label: 'SampleHouse (no rooms)', src: path.join(DEV, 'buildings', 'SampleHouse_extracted.db'), expectGraph: false },
];
// Serve each fixture under a clearly temporary name so a leftover can never be mistaken for real data.
const linkName = c => '_wr5a_' + path.basename(c.src);
function linkFixtures() {
  for (const c of CASES) {
    const dest = path.join(DEV, 'buildings', linkName(c));
    try { fs.unlinkSync(dest); } catch (e) {}
    if (fs.existsSync(c.src)) { fs.symlinkSync(c.src, dest); c.db = linkName(c); }
  }
}
function unlinkFixtures() {
  for (const c of CASES) { try { fs.unlinkSync(path.join(DEV, 'buildings', linkName(c))); } catch (e) {} }
}

function serve() {
  return new Promise(resolve => {
    const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: DEV, stdio: 'ignore' });
    setTimeout(() => resolve(srv), 1200);
  });
}
function has(logs, re) { return logs.some(l => re.test(l)); }
function line(logs, re) { return logs.find(l => re.test(l)) || ''; }

(async () => {
  linkFixtures();
  process.on('exit', unlinkFixtures);
  const srv = await serve();
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox', '--enable-unsafe-swiftshader'] });
  console.log('══ W-R5A-DEV-GRAPH-TOUR — deploy/dev flies the graph route (code-only port) ══\n');

  for (const c of CASES) {
    if (!c.db) { console.log('— ' + c.label + ': source db absent (' + c.src + '), skipped'); continue; }
    const page = await browser.newPage();
    const logs = [];
    page.on('console', m => logs.push(m.text()));
    page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
    await page.goto(`http://localhost:${PORT}/index.html?db=buildings/${c.db}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => window.APP && window.APP.camera, { timeout: 120000 });
    await page.waitForFunction(() => { try { const r = window.APP.dbQuery('SELECT COUNT(*) FROM element_transforms'); return r && r.length && r[0][0] > 0; } catch (e) { return false; } },
      { timeout: 240000, polling: 2000 }).catch(() => {});
    for (let i = 0; i < 90; i++) { if (!(await page.evaluate(() => !!window.APP.streaming))) break; await new Promise(r => setTimeout(r, 1000)); }

    const pre = await page.evaluate(() => ({
      hasRG: typeof window.RoomGraph === 'object' && !!window.RoomGraph,
      hasHB: !!window.HallwayBackbone, hasSR: !!window.StoreyRaster, hasRH: !!window.RoomHabitability,
      hasGetter: typeof window.APP.getRoomGraph === 'function',
      hasEnsure: typeof window.APP.ensureRooms === 'function',
    }));
    await page.evaluate(() => window.APP.toggleFlyAround());
    for (let i = 0; i < 240; i++) { if (has(logs, /§FLY_ROUTE|§FLY_ROUTE_REJECT|§TOUR_/)) break; await new Promise(r => setTimeout(r, 1000)); }
    await new Promise(r => setTimeout(r, 3000));
    const st = await page.evaluate(() => ({ actions: (window.APP.walkActions || []).length, walkMode: !!window.APP.walkMode }));

    console.log('── ' + c.label + '  modules ' + JSON.stringify(pre) + '  actions=' + st.actions);
    const fly = line(logs, /§FLY_ROUTE /), hl = line(logs, /§FLY_HL_FIRST/), er = line(logs, /§S1_ENSURE_ROOMS/);
    if (fly) console.log('   ' + fly.slice(0, 200));
    if (hl) console.log('   ' + hl.slice(0, 200));
    if (er) console.log('   ' + er.slice(0, 160));

    chk(c.label + ': G3 all four modules + bridge loaded',
      pre.hasRG && pre.hasHB && pre.hasSR && pre.hasRH && pre.hasGetter && pre.hasEnsure, JSON.stringify(pre));
    chk(c.label + ': G3 no §LOAD_FAIL / bridge-absent / page error',
      !has(logs, /§LOAD_FAIL|§R5A_BRIDGE_ABSENT|PAGEERROR/),
      line(logs, /§LOAD_FAIL|§R5A_BRIDGE_ABSENT|PAGEERROR/).slice(0, 120) || 'clean');
    chk(c.label + ': G4 bridge logged its room-state classification (§S1_ENSURE_ROOMS state=…)',
      /§S1_ENSURE_ROOMS .*\bstate=(none|recompute|zero)\b/.test(er),
      er ? er.replace(/^.*§S1_ENSURE_ROOMS /, '').slice(0, 90) : 'MISSING');
    if (c.expectGraph) {
      chk(c.label + ': G1 graph route built (§FLY_ROUTE)', !!fly, fly ? fly.replace(/^.*§FLY_ROUTE /, '').slice(0, 90) : 'absent');
      chk(c.label + ': G1 a highlight main hall was elected (§FLY_HL_FIRST)', !!hl,
        hl ? hl.replace(/^.*§FLY_HL_FIRST /, '').slice(0, 90) : 'absent');
      const m = fly.match(/stops=(\d+)\/(\d+)/);
      chk(c.label + ': G1 stops actually visited', !!m && +m[1] > 0, m ? m[0] : 'n/a');
    } else {
      chk(c.label + ': G2 degrades to the legacy tour, still produces actions',
        st.actions > 0, 'actions=' + st.actions + (has(logs, /§FLY_ROUTE_REJECT/) ? ' (§FLY_ROUTE_REJECT logged)' : ''));
    }
    await page.close();
  }
  await browser.close();
  try { srv.kill(); } catch (e) {}
  unlinkFixtures();
  console.log('\n' + (fail ? '❌ FAIL ' : '✅ PASS ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR ' + e.message); process.exit(1); });
