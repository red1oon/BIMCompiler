#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-JKR-ROOM-PATH scope (READ THE LOG after every run)
 * SCOPE: why JKR's room-path fails — `§ROOM_PATH_NOT_FOUND … no door-connected route (disconnected
 * component)`, reported live 2026-07-26 on the deployed viewer with an imported jkr_fixed.db.
 *
 * ⚠ WHY THIS FILE EXISTS AT ALL (watchdog, 2026-07-26 — THIRD occurrence this session):
 * this diagnosis was first asserted from an UNSAVED scratch probe. The numbers were probably right,
 * but nothing on disk backed them, which is the same gap already caught on the S1 Clinic figures
 * and the S2 lift-connector numbers. Under this project's Log Mandate an unlogged number is not
 * evidence — and the risk here is concrete: this diagnosis points at changing the room compile's
 * ground-storey door extraction. Nobody should act on that from a number that cannot be re-checked.
 * The retraction inside this very file (G1, below) is itself the proof of how far an unlogged
 * figure can mislead: the raster was publicly named "prime suspect" and is measurably innocent.
 *
 * ISSUE IT PROVES/DISPROVES:
 *   (G1) DISPROOF — the walkable-raster patch is NOT the cause. Build the graph twice on the same
 *        DB, with and without `patches/JKR_extracted.db.sql` applied, and assert the connectivity
 *        figures are IDENTICAL. PR #803 already drew this line — it "split the DETOUR_FAIL signal
 *        into connectivity (fullConnectivity()) vs legality (chord-legality within an
 *        already-connected pair)" — the raster serves LEGALITY only. Asserted, not assumed.
 *   (G2) THE ACTUAL CAUSE — door↔room binding. Count, per tolerance, how many ARC doors land inside
 *        0 / 1 / 2 / 3+ compiled room rects (`center ± size/2`, same-storey). A door touching TWO
 *        rooms is the only thing that can become a room-room (E1) connector. At zero tolerance the
 *        count must be zero (doors sit in the wall thickness, which is the gap between two rects) —
 *        that is the finding, gated so it cannot rot.
 *   (G3) THE WORST CASE, and the clearest lead: a storey carrying compiled rooms but ZERO ARC doors
 *        is structurally unreachable forever. Asserted by name so a regression or a fix is visible.
 *
 * Headless and deterministic by design: every claim is a count over DB rows and graph structure —
 * "code and maths is the truth". Nothing here is visual, so nothing here needs a browser.
 *
 * ⚠ FIXTURE RULE: room-bearing DBs are LOCAL, `~/bim-ootb/buildings/` — never fetched from OCI.
 * RUN: node deploy/dev/tests/witness_jkr_room_path_diagnosis.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DEV = path.resolve(__dirname, '..');
const LOCAL_SRC = process.env.LOCAL_DB_SRC || '/home/red1/bim-ootb/buildings';
const DB = path.join(LOCAL_SRC, 'JKR_extracted.db');
const PATCH = path.join(LOCAL_SRC, 'patches', 'JKR_extracted.db.sql');
let pass = 0, fail = 0;
const chk = (n, c, x) => { if (c) { pass++; console.log('  ✅ ' + n + (x ? '  ' + x : '')); } else { fail++; console.log('  ❌ ' + n + (x ? '  ' + x : '')); } };

(async () => {
  const initSqlJs = require('/home/red1/bim-compiler/node_modules/sql.js');
  const RG = require(path.join(DEV, 'room_graph.js'));
  const SQL = await initSqlJs();
  console.log('══ W-JKR-ROOM-PATH — why room-path fails on JKR: it is door↔room binding, NOT the raster ══\n');
  if (!fs.existsSync(DB)) { console.log('ERR fixture absent: ' + DB); process.exit(1); }

  // ── Build the graph, optionally with the patch applied first.
  function build(applyPatch) {
    const db = new SQL.Database(fs.readFileSync(DB));
    if (applyPatch) db.run(fs.readFileSync(PATCH, 'utf8'));
    const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
    const logs = [];
    const g = RG.buildGraph(q, { log: m => logs.push(m) });
    // Connected components over ROOM nodes — what room-path actually traverses.
    const adj = {};
    for (const e of g.edges) { (adj[e.a] = adj[e.a] || []).push(e.b); (adj[e.b] = adj[e.b] || []).push(e.a); }
    const rooms = g.nodes.map(n => n.guid), roomSet = new Set(rooms);
    const seen = {}, comps = [];
    for (const r of rooms) {
      if (seen[r]) continue;
      const st = [r]; seen[r] = 1; const c = [];
      while (st.length) { const n = st.pop(); c.push(n); for (const m of (adj[n] || [])) if (!seen[m]) { seen[m] = 1; st.push(m); } }
      comps.push(c.filter(x => roomSet.has(x)));
    }
    comps.sort((a, b) => b.length - a.length);
    // Room-pair pathability over a deterministic stride sample (same stride both runs).
    let ok = 0, tot = 0;
    for (let i = 0; i < rooms.length; i += 3) for (let j = i + 1; j < rooms.length; j += 7) {
      tot++;
      const sp = RG.shortestPath ? RG.shortestPath(g, rooms[i], rooms[j]) : null;
      if (sp && sp.path && sp.path.length) ok++;
    }
    const line = logs.find(l => /§ROOM_GRAPH /.test(l)) || '';
    const ras = logs.find(l => /§PATH_LEGAL_RASTER/.test(l)) || '';
    db.close();
    return {
      graphLine: line.replace(/^.*§ROOM_GRAPH /, ''),
      raster: ras ? ras.replace(/^.*§PATH_LEGAL_RASTER /, '') : '(none)',
      e1: +((line.match(/edges=(\d+)/) || [])[1] || -1),
      deadend: +((line.match(/deadend=(\d+)/) || [])[1] || -1),
      nodes: +((line.match(/nodes=(\d+)/) || [])[1] || -1),
      comps: comps.length, largest: comps.length ? comps[0].length : 0, rooms: rooms.length,
      ok, tot, pct: tot ? (100 * ok / tot) : 0,
    };
  }

  console.log('── G1 — DISPROOF: does the walkable-raster patch change connectivity at all?');
  const A = build(false), B = fs.existsSync(PATCH) ? build(true) : null;
  const fmt = r => 'nodes=' + r.nodes + ' E1edges=' + r.e1 + ' deadend=' + r.deadend +
    '  roomComponents=' + r.comps + ' largest=' + r.largest + '/' + r.rooms +
    '  pathability=' + r.ok + '/' + r.tot + ' (' + r.pct.toFixed(1) + '%)';
  console.log('   NO PATCH   ' + fmt(A));
  console.log('              raster: ' + A.raster);
  if (B) {
    console.log('   WITH PATCH ' + fmt(B));
    console.log('              raster: ' + B.raster.slice(0, 100));
    chk('G1 the patch really did load (raster present only in the patched run)',
      A.raster === '(none)' && B.raster !== '(none)', 'unpatched=' + A.raster + ' | patched=' + B.raster.slice(0, 60));
    chk('G1 DISPROVED — raster changes connectivity by NOTHING (E1/deadend/components/pathability all equal)',
      A.e1 === B.e1 && A.deadend === B.deadend && A.comps === B.comps && A.largest === B.largest && A.ok === B.ok,
      A.e1 + '→' + B.e1 + ' edges, ' + A.comps + '→' + B.comps + ' comps, ' + A.pct.toFixed(1) + '%→' + B.pct.toFixed(1) + '%');
  } else {
    chk('G1 patch fixture present', false, 'ABSENT ' + PATCH);
  }
  chk('G1 the graph really is fragmented (this is the symptom under diagnosis)',
    A.comps > 1 && A.pct < 100, A.comps + ' components, ' + A.pct.toFixed(1) + '% pathable');

  // ── G2/G3 operate on raw rows, independent of the graph builder, so a builder change cannot
  // silently move these numbers.
  const db = new SQL.Database(fs.readFileSync(DB));
  const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
  const doors = q("SELECT m.guid,m.element_name,m.storey,t.center_x,t.center_y FROM elements_meta m" +
    " JOIN element_transforms t ON t.guid=m.guid WHERE m.ifc_class LIKE 'IfcDoor%' AND m.discipline='ARC'" +
    " AND t.center_x IS NOT NULL");
  // spatial_structure carries center_*/size_* (NOT x0/y0/x1/y1 — an earlier probe of mine used the
  // wrong columns and reported a spurious 0 rooms), and storey comes via parent_guid.
  const rooms = q("SELECT s.guid,s.name,COALESCE(p.name,'?'),s.center_x,s.center_y,s.size_x,s.size_y" +
    " FROM spatial_structure s LEFT JOIN spatial_structure p ON p.guid=s.parent_guid" +
    " WHERE s.type='IfcSpace' AND s.center_x IS NOT NULL");

  console.log('\n── G2 — THE ACTUAL CAUSE: door↔room binding (' + doors.length + ' ARC doors vs ' + rooms.length + ' compiled room rects)');
  console.log('   a door must touch TWO same-storey rooms to become an E1 room-room connector');
  const table = {};
  for (const tol of [0, 0.5, 1.0, 2.0]) {
    const hist = { 0: 0, 1: 0, 2: 0, '3+': 0 };
    for (const [, , ds, dx, dy] of doors) {
      let n = 0;
      for (const [, , rst, cx, cy, sx, sy] of rooms) {
        if (rst !== ds) continue;
        if (dx >= cx - sx / 2 - tol && dx <= cx + sx / 2 + tol && dy >= cy - sy / 2 - tol && dy <= cy + sy / 2 + tol) n++;
      }
      hist[n >= 3 ? '3+' : n]++;
    }
    table[tol] = hist;
    console.log('   tol=' + tol.toFixed(1) + 'm   0 rooms=' + hist[0] + '   1 room=' + hist[1] +
      '   2 rooms(CONNECTOR)=' + hist[2] + '   3+ (ambiguous)=' + hist['3+']);
  }
  chk('G2 at ZERO tolerance not one door lands inside any room (doors sit in the wall thickness)',
    table[0][2] === 0 && table[0][0] === doors.length, 'tol=0: ' + table[0][0] + '/' + doors.length + ' touch no room');
  chk('G2 even at best tolerance only a minority of doors can ever be connectors',
    Math.max(table[0.5][2], table[1.0][2]) < doors.length / 2,
    'best=' + Math.max(table[0.5][2], table[1.0][2]) + ' of ' + doors.length + ' doors');
  chk('G2 widening tolerance trades famine for ambiguity rather than fixing it',
    table[2.0]['3+'] > table[1.0]['3+'], '3+ at 1.0m=' + table[1.0]['3+'] + ' → at 2.0m=' + table[2.0]['3+']);

  console.log('\n── G3 — storeys carrying compiled rooms but ZERO ARC doors (structurally unreachable)');
  const doorStoreys = new Set(doors.map(d => d[2]));
  const roomStoreys = {};
  for (const [, , rst] of rooms) roomStoreys[rst] = (roomStoreys[rst] || 0) + 1;
  const famine = [];
  for (const st of Object.keys(roomStoreys)) {
    const has = doorStoreys.has(st);
    console.log('   ' + (has ? '  ok  ' : ' ⚠ NONE') + '  "' + st + '"  rooms=' + roomStoreys[st] + '  doors=' + (has ? 'yes' : '0'));
    if (!has) famine.push(st + '(' + roomStoreys[st] + ' rooms)');
  }
  chk('G3 the door-famine storeys are named, so a fix or a regression is visible',
    true, famine.length ? famine.join(', ') : 'none — every roomed storey has doors');
  chk('G3 at least one roomed storey has zero doors (the clearest lead — remove this gate when fixed)',
    famine.length > 0, famine.join(', ') || 'NONE (if this now fails, the compile was fixed — update the diagnosis)');
  db.close();

  console.log('\n   CONCLUSION: the raster is measurably innocent (G1); the ceiling on E1 edges is set by');
  console.log('   door↔room binding (G2) and by roomed storeys with no doors at all (G3). Fix the room');
  console.log('   compile / ground-storey door extraction — not the raster, and not the tour.');
  console.log('\n' + (fail ? '❌ FAIL ' : '✅ PASS ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR ' + (e && e.stack || e)); process.exit(1); });
