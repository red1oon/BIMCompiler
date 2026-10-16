#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-S2-LIFT-SHAFT scope (READ THE LOG after every run)
 * SCOPE: prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §STAKEHOLDER_STROLL S2 — lifts as real vertical
 * connectors. `IfcTransportElement` = 0 rows fleet-wide, so there is no lift ELEMENT to read; the
 * lift DOORS are real and they group into a shaft. §LIFT-SHAFT builds `liftwp` nodes per storey at
 * the shaft plus RIDE edges, weighted so the stair/lift choice falls out of Dijkstra rather than a
 * storey threshold.
 *
 * This witness is HEADLESS BY DESIGN, not for convenience: every claim here is graph structure and
 * arithmetic (node kinds, edge counts, weights, elected connector), which is exactly the "code and
 * maths is the truth" evidence the project requires. Nothing here is a visual claim, so nothing here
 * needs a browser. The tour-level behaviour it feeds is covered by W-S3-SCENE-BUDGET's real ✈ press.
 *
 * ISSUE IT PROVES/DISPROVES:
 *   (G1) The MEASURED BASIS is re-verified, not quoted: Terminal has exactly one shaft — 5
 *        lift-named doors, ≥2 distinct storeys, horizontal spread far inside the grouping distance.
 *   (G2) Those doors produce `liftwp` NODES (one per served storey), each carrying a `storey` field.
 *        The missing-storey case is not hypothetical: §PATH_LEGAL_STAIRWP_STOREY was a real bug
 *        where a waypoint without `storey` made _legalizePath silently skip legality-testing on
 *        every chord touching it.
 *   (G3) ZERO `exit` nodes, on EVERY building. This is the #1014 fence, ported here as an assertion.
 *        ⚠ The spec asked to "re-run witness_exit_not_a_lift.js (45/45) unchanged". That witness
 *        lives in bim-ootb (repo root, on origin/main) and tests BIM-OOTB's common/room_graph.js —
 *        it would pass or fail regardless of this change, which is in bim-compiler's deploy/dev
 *        copy. Re-running it would be evidence about the wrong tree. Its load-bearing assertion is
 *        therefore reproduced here against the tree S2 actually modifies. Stated, not silently
 *        substituted.
 *   (G4) THE FENCE HOLDS: a building with no lift doors gets no shaft and no ride edge. Never
 *        synthesise a vertical connector.
 *   (G5) NO BUILDING LOSES A STAIR ROUTE IT ALREADY HAD — E3 stair-edge counts are compared against
 *        the PRE-S2 room_graph.js, resolved from git by content marker (never `HEAD:`, which becomes
 *        the post-S2 file the moment S2 is committed and would compare S2 against itself).
 *   (G6) The choice is EXPRESSED AS EDGE WEIGHT, not a storey threshold, and is auditable: stairs
 *        win a one-storey hop, the lift wins the full span, and both weights are reported in the log
 *        as the convention-priors they are.
 *
 * ⚠ FIXTURE RULE: room-bearing DBs are LOCAL, `~/bim-ootb/buildings/` — never fetched from OCI.
 *
 * RUN: node deploy/dev/tests/witness_s2_lift_shaft.js
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = '/home/red1/bim-compiler';
const DEV = path.resolve(__dirname, '..');
const LOCAL_SRC = process.env.LOCAL_DB_SRC || '/home/red1/bim-ootb/buildings';
let pass = 0, fail = 0;
const chk = (n, c, x) => { if (c) { pass++; console.log('  ✅ ' + n + (x ? '  ' + x : '')); } else { fail++; console.log('  ❌ ' + n + (x ? '  ' + x : '')); } };

const S2_MARKER = '§LIFT-SHAFT';
// JKR added 2026-07-26 (watchdog: it was in no witness's fixture list despite being a real local
// fixture). It is the fleet's UNSEEN-CONVENTION case, not just another building: 21 storeys, 7
// disciplines (ARC/PLB/MEP/STR/ACMV/FP/ELEC), authored by a different firm with its own naming
// prefix — i.e. the one fixture that tests whether this generalises past our own modelling habits.
const BUILDINGS = ['Terminal', 'Hospital', 'Clinic', 'LTU_AHouse', 'JKR'];

// Same technique as W-S3-SCENE-BUDGET, same reason: find the newest revision of room_graph.js that
// does NOT carry the S2 marker. `HEAD:` would silently become the post-S2 file after the commit,
// making the before/after compare S2 against itself and report green while testing nothing.
function baselineModule() {
  const shas = execFileSync('git', ['-C', REPO, 'log', '--format=%H', '--', 'deploy/dev/room_graph.js'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n').filter(Boolean);
  for (const sha of shas) {
    let blob;
    try { blob = execFileSync('git', ['-C', REPO, 'show', sha + ':deploy/dev/room_graph.js'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); }
    catch (e) { continue; }
    if (blob.indexOf(S2_MARKER) < 0) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws2-baseline-'));
      // room_graph.js reads window.StoreyRaster / window.RoomHabitability at its own top level, so
      // the baseline copy needs its siblings beside it — symlink them rather than copy.
      for (const e of ['storey_raster.js', 'room_habitability.js', 'hallway_backbone.js']) {
        try { fs.symlinkSync(path.join(DEV, e), path.join(dir, e)); } catch (e2) {}
      }
      fs.writeFileSync(path.join(dir, 'room_graph.js'), blob);
      return { sha, dir };
    }
  }
  throw new Error('no pre-S2 room_graph.js revision found (every revision carries ' + S2_MARKER + ')');
}

function loadRG(dir) {
  // The engines are browser-IIFE modules that publish onto a ROOT object; require() them in a fresh
  // module registry so the baseline and the working copy cannot contaminate each other.
  for (const k of Object.keys(require.cache)) if (/room_graph|storey_raster|room_habitability|hallway_backbone/.test(k)) delete require.cache[k];
  require(path.join(dir, 'storey_raster.js'));
  require(path.join(dir, 'room_habitability.js'));
  const RG = require(path.join(dir, 'room_graph.js'));
  try { require(path.join(dir, 'hallway_backbone.js')); } catch (e) {}
  return RG;
}

(async () => {
  const initSqlJs = require('/home/red1/bim-compiler/node_modules/sql.js');
  const SQL = await initSqlJs();
  console.log('══ W-S2-LIFT-SHAFT — lift doors become a measured vertical connector, and nothing else moves ══\n');

  const base = baselineModule();
  console.log('   baseline room_graph.js = newest revision without ' + S2_MARKER + ': ' + base.sha.slice(0, 9) + '\n');

  function build(RG, dbFile) {
    const db = new SQL.Database(fs.readFileSync(dbFile));
    const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
    const logs = [];
    const g = RG.buildGraph(q, { log: m => logs.push(m) });
    const kinds = {};
    for (const k of Object.keys(g.nodesByGuid)) { const kd = g.nodesByGuid[k].kind; kinds[kd] = (kinds[kd] || 0) + 1; }
    const ec = {};
    for (const e of g.edges) ec[e.kind] = (ec[e.kind] || 0) + 1;
    const liftwps = Object.keys(g.nodesByGuid).map(k => g.nodesByGuid[k]).filter(n => n.kind === 'liftwp');
    db.close();
    return { g, logs, kinds, ec, liftwps };
  }

  const RGnew = loadRG(DEV);
  for (const b of BUILDINGS) {
    const dbFile = path.join(LOCAL_SRC, b + '_extracted.db');
    if (!fs.existsSync(dbFile)) { console.log('⚠ fixture absent: ' + dbFile); continue; }
    console.log('── ' + b);
    const after = build(RGnew, dbFile);
    const RGold = loadRG(base.dir);
    const before = build(RGold, dbFile);

    const shaftLines = after.logs.filter(l => /§LIFT_SHAFT /.test(l));
    const summary = after.logs.find(l => /§LIFT_SHAFTS /.test(l)) || '';
    const connectors = after.logs.filter(l => /§LIFT_CONNECTOR/.test(l));
    for (const l of shaftLines) console.log('   ' + l);
    // Print EVERY §LIFT_CONNECTOR line, not a sample. The stair/lift crossover is the headline claim
    // of S2, and a claim whose worked numbers are not in the saved log is not evidence under the Log
    // Mandate — the same catch that landed on S1's Clinic figures. Anything quoted about the
    // crossover must be quotable FROM HERE, not recomputed by hand from the constants.
    for (const l of connectors) console.log('   ' + l);
    console.log('   ' + summary);
    console.log('   nodes liftwp=' + (after.kinds.liftwp || 0) + ' exit=' + (after.kinds.exit || 0) +
      '   edges E3(stair)=' + (after.ec.E3 || 0) + ' [pre-S2 ' + (before.ec.E3 || 0) + ']' +
      ' E10(ride)=' + (after.ec.E10 || 0) + ' E11(board)=' + (after.ec.E11 || 0));

    // G3 + G4 + G5 apply to EVERY building; G1/G2/G6 only where a shaft is measured to exist.
    chk('G3 ' + b + ': ZERO exit nodes (#1014 fence — a lift door must never become an exit)',
      !after.kinds.exit, 'exit=' + (after.kinds.exit || 0));
    chk('G5 ' + b + ': no stair route lost (E3 count identical to pre-S2)',
      (after.ec.E3 || 0) === (before.ec.E3 || 0), (before.ec.E3 || 0) + ' → ' + (after.ec.E3 || 0));
    chk('G5 ' + b + ': no pre-existing edge class changed count',
      ['E1', 'E2', 'E5', 'E6', 'E7', 'E8', 'E9'].every(k => (after.ec[k] || 0) === (before.ec[k] || 0)),
      ['E1', 'E2', 'E5', 'E6', 'E7', 'E8', 'E9'].map(k => k + ':' + (before.ec[k] || 0) + '→' + (after.ec[k] || 0)).join(' '));
    chk('G6 ' + b + ': weights reported as convention-priors in the log',
      /wait=\d+ ridePerM=[\d.]+ \(both CONVENTION-PRIORS, not measured\)/.test(summary), summary ? 'logged' : 'MISSING');

    const shafts = +((summary.match(/shafts=(\d+)/) || [])[1] || 0);
    if (shafts > 0) {
      const m = (shaftLines[0] || '').match(/storeys=(\d+) doors=(\d+).*spread=([\d.]+)m/);
      chk('G1 ' + b + ': one shaft, measured from real door positions', shafts === 1 && !!m,
        m ? 'storeys=' + m[1] + ' doors=' + m[2] + ' spread=' + m[3] + 'm' : 'unparsed');
      chk('G1 ' + b + ': the shaft spans ≥2 storeys (the fence it must clear)', !!m && +m[1] >= 2, m ? 'storeys=' + m[1] : 'n/a');
      chk('G1 ' + b + ': door spread far inside the 2m grouping distance (not a merge of two shafts)',
        !!m && +m[3] < 2, m ? 'spread=' + m[3] + 'm' : 'n/a');
      chk('G2 ' + b + ': one liftwp node per served storey', after.liftwps.length === (m ? +m[1] : -1),
        'liftwp=' + after.liftwps.length + ' storeys=' + (m ? m[1] : '?'));
      chk('G2 ' + b + ': every liftwp carries a storey field (§PATH_LEGAL_STAIRWP_STOREY)',
        after.liftwps.length > 0 && after.liftwps.every(n => n.storey != null && n.cx != null && n.cz != null),
        after.liftwps.map(n => n.storey).join(','));
      chk('G2 ' + b + ': the shaft is boarded from circulation, not an island (E11 per storey)',
        (after.ec.E11 || 0) === after.liftwps.length, 'E11=' + (after.ec.E11 || 0) + ' liftwp=' + after.liftwps.length);
      // G6 — the no-threshold claim, checked as arithmetic on the real weights.
      const oneStorey = connectors.filter(l => /elected=STAIR\(cheaper\)/.test(l));
      const longSpan = connectors.filter(l => /elected=LIFT/.test(l));
      chk('G6 ' + b + ': stairs still win a short hop (no lift for one storey)', oneStorey.length > 0,
        oneStorey.length + ' pair(s), e.g. ' + (oneStorey[0] || '').replace(/^.*§LIFT_CONNECTOR /, '').slice(0, 80));
      chk('G6 ' + b + ': the lift wins where climbing would be ridiculous', longSpan.length > 0,
        longSpan.length + ' pair(s), e.g. ' + (longSpan[0] || '').replace(/^.*§LIFT_CONNECTOR /, '').slice(0, 80));
      chk('G6 ' + b + ': every storey pair reported one elected connector (auditable, not asserted)',
        connectors.length === (m ? (+m[1] * (+m[1] - 1)) / 2 : -1),
        connectors.length + ' lines for ' + (m ? m[1] : '?') + ' storeys');
    } else {
      // G4 — the fence, on every building that has no lift doors.
      chk('G4 ' + b + ': no lift doors ⇒ no shaft synthesised', shafts === 0 && !(after.ec.E10 || 0) && !after.liftwps.length,
        'shafts=0 E10=' + (after.ec.E10 || 0) + ' liftwp=' + after.liftwps.length);
      chk('G4 ' + b + ': graph otherwise byte-identical in node count to pre-S2',
        Object.keys(after.g.nodesByGuid).length === Object.keys(before.g.nodesByGuid).length,
        Object.keys(before.g.nodesByGuid).length + ' → ' + Object.keys(after.g.nodesByGuid).length);
    }
  }

  try { fs.rmSync(base.dir, { recursive: true, force: true }); } catch (e) {}
  console.log('\n' + (fail ? '❌ FAIL ' : '✅ PASS ') + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR ' + (e && e.stack || e)); process.exit(1); });
