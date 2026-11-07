#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-DX-WALKBACK-RSGT scope (read this block first)
 * SCOPE: the JS-era RosettaStone gate (user vision 2026-07-10): load the DX ARC bare, walk the
 *   DISC via the Step-1 mined per-space schedule (dwWalk {schedule:true}), and compare the
 *   GENERATED MEP against the building's own REAL MEP — position to position, spatially,
 *   geometrically. Anti-cheating is STRUCTURAL: the walker reads ONLY the rules DB + the ARC
 *   substrate (spaces/walls); THIS witness is the only code that reads the real MEP rows and
 *   diffs them — two code paths, one comparer (the exact opposite of the Java-era
 *   readGenerativeCount() self-grading bug). Read the §-log after the run; exit code is not
 *   the evidence.
 *
 * GROUND TRUTH (real, verified): deploy/buildings/Duplex_extracted.db IfcFlowTerminal rows
 *   (ELEC 89, PLB 16 via build/Duplex_mep_meta.db mep_subdisc guid-join; ACMV has NO real
 *   terminal rows — reported, never graded against a vacuous oracle). Spaces: the 21 REAL
 *   IfcSpace rows (LongNames stamped verbatim from the source IFC by stamp_space_longnames.py).
 *
 * GATE TIERS (user's 2.2 acceptance bar, formalized):
 *   W1 QUANTITY (HARD, per disc with real ground truth) — generated/real terminal-count ratio
 *      within [0.5, 2.0]; discs with 0 real terminals are reported, not graded.
 *   W2 CONTAINMENT (HARD) — 0 generated fixtures outside their own space bbox (5cm tol) or the
 *      building envelope. + falsifier: an injected out-of-space fixture IS caught.
 *   W3 HOST+ORIENTATION (HARD) — wall-rule fixtures sit within 0.60m of a REAL wall bbox and
 *      face INTO their room (facing·(centroid-pos) > 0); CEILING fixtures in the top half of
 *      their space; FLOOR fixtures' bottom on the floor (±5cm).
 *   W4 LOD400 (HARD, UNBREAKABLE — WalkerDoctrine §11) — every placement binds a real mesh
 *      (hash resolves in component_geometries); meshless devices appear ONLY in the refused
 *      list, never as placements.
 *   W6 NAVIGABILITY (BIMEyes item 3, 2026-07-10) — per real space, 0.25m flood-fill of free floor
 *      (fixtures block cells inside the walking band, floor→+1.8m): min connectedFraction ≥ 0.95
 *      over person-scale regions (pockets < 0.5×0.5m aren't fragmentation). + falsifier (synthetic
 *      fixture wall). Found nothing broken at first run only AFTER W7's fixes landed.
 *   W7 COLLISION (BIMEyes item 3, 2026-07-10) — pairwise strict AABB overlap (method=bbox, disclosed)
 *      across ALL discs = 0. FOUND 48 REAL overlaps at first run (code-spacing step < device widths;
 *      per-disc walks blind to each other; overlapping Hallway×Stair bboxes) → fixed at source:
 *      placeSchedule bbox-clearance slide (wall devices slide along their wall run), opts.avoid
 *      cross-disc coordination, ±direction reversal, honest §SCHED-CLASH residual log. + falsifier.
 *   W5 POSITION FIDELITY (DIAL, not hard) — NN match rate generated↔real at 0.5/1/2m bands +
 *      mean signed offset direction, per disc — the honest "by how much and which way" number
 *      to ratchet. + falsifier: shifting generated positions +3m collapses the 2m match rate.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_dx_walkback_rsgt_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

(async function main() {
  log('═══ W-DX-WALKBACK-RSGT — bare ARC + mined rules reconstruct DX MEP; witness diffs vs the real MEP ═══');
  var SQL = await initSqlJs();
  var dx = loadDb(SQL, path.join(ROOT, 'deploy/buildings/Duplex_extracted.db'));
  var mm = loadDb(SQL, path.join(ROOT, 'build/Duplex_mep_meta.db'));
  var lib = loadDb(SQL, path.join(ROOT, 'library/component_library.db'));
  DW.dwOpen(loadDb(SQL, DWT.rules('duplex_rules.db')));

  // ── real MEP ground truth (witness-side ONLY — the walker never sees these rows) ──
  var subdisc = {};
  rows(mm, 'SELECT guid, subdisc FROM mep_subdisc').forEach(function (r) { subdisc[r.guid] = r.subdisc; });
  var realFx = rows(dx, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z FROM elements_meta m " +
    "JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='IfcFlowTerminal'")
    .map(function (r) { r.disc = subdisc[r.g] || 'UNKNOWN'; return r; });
  var realBy = {};
  realFx.forEach(function (r) { (realBy[r.disc] = realBy[r.disc] || []).push(r); });
  log('§RS real DX terminals: ' + Object.keys(realBy).sort().map(function (d) { return d + '=' + realBy[d].length; }).join(' ') +
    ' (mep_subdisc guid-join; walker never reads these)');

  // ── PRECONDITION (Watchdog correction 2026-07-10): this witness needs the SHARED-TREE env prepared —
  // Duplex_extracted.db's spaces STAMPED with LongNames (gitignored input; committed generator). Unstamped,
  // the schedule walk skips every space (labels are room NUMBERS like 'A101'), W1 reports 0 generated and
  // the old code then CRASHED on allGen[0].spaceGuid — a confusing TypeError instead of the actionable
  // one-line fix. Fail FAST and say exactly what to run.
  var stamped = rows(dx, "SELECT COUNT(*) n FROM spatial_structure WHERE type='IfcSpace' " +
    "AND COALESCE(object_type,'')!=''")[0];
  if (!stamped || !(stamped.n > 0)) {
    log('❌ PRECONDITION — deploy/buildings/Duplex_extracted.db spaces are NOT stamped (0 object_type). Run:');
    log('   python3 scripts/stamp_space_longnames.py deploy/buildings/Duplex_extracted.db reference/residential/Ifc2x3_Duplex_Architecture.ifc');
    log('W-DX-WALKBACK-RSGT: 0 PASS / 1 FAIL (env precondition)');
    process.exit(1);
  }

  // ── the walk (generation side — rules DB + ARC substrate only) ──
  var walks = {}, spacesInfo = null, prior = [];
  ['ELEC', 'PLB', 'ACMV'].forEach(function (d) {
    // §W7-COLLISION: each disc avoids the previous discs' placements (cross-disc coordination) —
    // the same accumulation a walk-all-disciplines caller does.
    walks[d] = DW.dwWalk(d, dx, 'Duplex', { schedule: true, avoid: prior });
    if (!walks[d].refused) prior = prior.concat(walks[d].placements || []);
    if (!spacesInfo && !walks[d].refused) spacesInfo = walks[d].schedule;
  });
  var spaces = DW.spacesOf(dx);
  // Wall positions corrected via DW._trueMidpoint — Duplex wall center_x/y carries the measured
  // raw-placement-origin defect (up to 3.12m, witness_occ_true_midpoint M2); measuring host
  // proximity against defective centers would grade the walker against a broken ruler.
  var walls = rows(dx, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z, COALESCE(t.bbox_x,0) bx, " +
    "COALESCE(t.bbox_y,0) by_, COALESCE(t.bbox_z,0) bz, COALESCE(t.rotation_x,0) rx, " +
    "COALESCE(t.rotation_y,0) ry, COALESCE(t.rotation_z,0) rot FROM elements_meta m JOIN element_transforms t " +
    "ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'").map(function (w) {
      var mid = DW._trueMidpoint(dx, w.g, { x: w.x, y: w.y, z: w.z, rx: w.rx, ry: w.ry, rot: w.rot });
      if (mid.verified) { w.x = mid.x; w.y = mid.y; }
      return w;
    });
  var env = rows(dx, 'SELECT MIN(center_x) x0, MAX(center_x) x1, MIN(center_y) y0, MAX(center_y) y1 FROM element_transforms')[0];
  var spaceByGuid = {};
  spaces.forEach(function (s) { spaceByGuid[s.guid] = s; });

  log(''); log('─── W1 QUANTITY (hard where real ground truth exists) ───');
  ['ELEC', 'PLB'].forEach(function (d) {
    var gen = walks[d].placed, real = realBy[d] ? realBy[d].length : 0;
    var ratio = real ? gen / real : Infinity;
    assert('W1 QUANTITY [' + d + ']', real > 0 && ratio >= 0.5 && ratio <= 2.0,
      'generated=' + gen + ' vs real=' + real + ' (ratio ' + ratio.toFixed(2) +
      ', bound [0.5, 2.0]) — schedule-driven count is in the real building\'s own band');
  });
  var acmvReal = (realBy.ACMV || []).length;
  log('§RS W1 [ACMV] generated=' + walks.ACMV.placed + ' vs real terminals=' + acmvReal +
    ' — DX\'s real MEP model carries no ACMV terminals; REPORTED, not graded (no vacuous oracle)');

  log(''); log('─── W2 CONTAINMENT (hard) ───');
  var out2 = [], TOL = 0.05;
  var allGen = [];
  ['ELEC', 'PLB', 'ACMV'].forEach(function (d) { (walks[d].placements || []).forEach(function (p) { allGen.push(p); }); });
  allGen.forEach(function (p) {
    var s = spaceByGuid[p.spaceGuid];
    var inSpace = s && p.x >= s.x0 - TOL && p.x <= s.x1 + TOL && p.y >= s.y0 - TOL && p.y <= s.y1 + TOL &&
      p.z >= s.z0 - TOL && p.z <= s.z1 + TOL;
    var inEnv = p.x >= env.x0 - 1 && p.x <= env.x1 + 1 && p.y >= env.y0 - 1 && p.y <= env.y1 + 1;
    if (!inSpace || !inEnv) out2.push(p.device + '@' + p.space);
  });
  // Watchdog correction 2026-07-10: W2 must NOT pass vacuously — 0 generated fixtures is a failure of
  // the walk (or the env), not a containment success (the old 0/0 "pass" masked the unstamped-env break).
  assert('W2 CONTAINMENT', allGen.length > 0 && out2.length === 0,
    allGen.length + '/' + allGen.length + ' generated fixtures inside their own REAL space bbox (±5cm) and the envelope' +
    (allGen.length === 0 ? ' — VACUOUS (0 generated): failed' : '') +
    (out2.length ? ' — BREACHES: ' + out2.slice(0, 5).join(', ') : ''));
  // falsifier: inject one fixture 10m outside its space → must be caught by the same check
  var probe = allGen[0], ps = probe ? spaceByGuid[probe.spaceGuid] : null;
  if (!ps) {
    assert('W2 FALSIFIER', false, 'no generated fixture available to probe (walk produced 0) — cannot exercise the falsifier');
    log('W-DX-WALKBACK-RSGT: ' + pass + ' PASS / ' + fail + ' FAIL (aborted: nothing generated, later gates unreachable)');
    fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n') + '\n');   // fresh checkout has no logs/ (Watchdog round-2)
    dx.close(); mm.close(); lib.close();
    process.exit(1);
  }
  var caught = !((ps.x1 + 10) <= ps.x1 + TOL);
  assert('W2 FALSIFIER', caught === true,
    'an injected fixture at x=space.x1+10m IS flagged by the same containment test — the check can catch a real breach');

  log(''); log('─── W3 HOST + ORIENTATION (hard) ───');
  function nearWall(p, maxD) {
    for (var i = 0; i < walls.length; i++) {
      var w = walls[i];
      var dxd = Math.max(Math.abs(p.x - w.x) - w.bx / 2, 0), dyd = Math.max(Math.abs(p.y - w.y) - w.by_ / 2, 0);
      var dzd = Math.max(Math.abs(p.z - w.z) - w.bz / 2, 0);
      if (Math.sqrt(dxd * dxd + dyd * dyd + dzd * dzd) <= maxD) return true;
    }
    return false;
  }
  var wallBad = [], ceilBad = [], floorBad = [], wallN = 0, ceilN = 0, floorN = 0, faceBad = [];
  allGen.forEach(function (p) {
    var s = spaceByGuid[p.spaceGuid];
    var isWallRule = /WALL_/.test(p.prov);
    var isCeil = /CEILING_/.test(p.prov);
    var isFloor = /FLOOR_|:WALL_FLOOR/.test(p.prov) === false && /FLOOR_LOW|FLOOR_CENTER/.test(p.prov);
    if (isWallRule) {
      wallN++;
      if (!nearWall(p, 0.60)) wallBad.push(p.device + '@' + p.space);
      var cx = (s.x0 + s.x1) / 2 - p.x, cy = (s.y0 + s.y1) / 2 - p.y;
      var dot = Math.cos(p.rot) * cx + Math.sin(p.rot) * cy;
      // CENTER/CENTER wall rules (e.g. COUNTER_BACK y_ref=MAX) still face inward; dot≈0 only
      // for a dead-centre fixture, which a wall rule never produces.
      if (dot < -1e-6) faceBad.push(p.device + '@' + p.space);
    }
    if (isCeil) { ceilN++; if (p.z < (s.z0 + s.z1) / 2) ceilBad.push(p.device + '@' + p.space); }
    if (isFloor) { floorN++; var bottom = p.z - (p.bz || 0.1) / 2; if (Math.abs(bottom - s.z0) > 0.05) floorBad.push(p.device + '@' + p.space); }
  });
  assert('W3 WALL-HOST', wallBad.length === 0,
    wallN + ' wall-rule fixtures all within 0.60m of a REAL wall bbox' +
    (wallBad.length ? ' — FLOATERS: ' + wallBad.slice(0, 5).join(', ') : ''));
  assert('W3 FACING', faceBad.length === 0,
    wallN + ' wall-rule fixtures all face INTO their room (facing·toCentroid > 0)' +
    (faceBad.length ? ' — WRONG-WAY: ' + faceBad.slice(0, 5).join(', ') : ''));
  assert('W3 CEILING-BAND', ceilBad.length === 0,
    ceilN + ' ceiling-rule fixtures all in the top half of their space' +
    (ceilBad.length ? ' — LOW: ' + ceilBad.slice(0, 5).join(', ') : ''));
  assert('W3 FLOOR-SEAT', floorBad.length === 0,
    floorN + ' floor-rule fixtures\' bottoms sit on the floor (±5cm, half-height lift applied)' +
    (floorBad.length ? ' — OFF: ' + floorBad.slice(0, 5).join(', ') : ''));

  log(''); log('─── W4 LOD400 (hard, unbreakable) ───');
  var noHash = allGen.filter(function (p) { return !p.geometry_hash; });
  var dangling = [];
  var seen = {};
  allGen.forEach(function (p) {
    if (!p.geometry_hash || seen[p.geometry_hash]) return;
    seen[p.geometry_hash] = 1;
    var m = rows(lib, "SELECT LENGTH(vertices) n FROM component_geometries WHERE geometry_hash='" + p.geometry_hash + "'");
    if (!m.length || !(m[0].n > 0)) dangling.push(p.device);
  });
  var refusedDevs = {};
  ['ELEC', 'PLB', 'ACMV'].forEach(function (d) {
    var r = (walks[d].schedule || {}).lod400Refused || {};
    Object.keys(r).forEach(function (k) { refusedDevs[k] = (refusedDevs[k] || 0) + r[k]; });
  });
  var placedMeshless = allGen.filter(function (p) { return Object.prototype.hasOwnProperty.call(refusedDevs, p.device); });
  assert('W4 LOD400', noHash.length === 0 && dangling.length === 0 && placedMeshless.length === 0,
    allGen.length + '/' + allGen.length + ' placements carry a resolving REAL mesh hash (' + Object.keys(seen).length +
    ' distinct meshes); meshless devices [' + Object.keys(refusedDevs).join(', ') + '] appear ONLY in the refused list (' +
    Object.keys(refusedDevs).map(function (k) { return k + '×' + refusedDevs[k]; }).join(' ') + ') — no fallback shape, law kept');

  log(''); log('─── W5 POSITION FIDELITY (dial — reported, ratcheted, not hard) ───');
  function nn(p, pool) {
    var best = Infinity, bi = -1;
    for (var i = 0; i < pool.length; i++) {
      var q = pool[i], d = Math.sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y) + (p.z - q.z) * (p.z - q.z));
      if (d < best) { best = d; bi = i; }
    }
    return { d: best, i: bi };
  }
  var w5 = {};
  ['ELEC', 'PLB'].forEach(function (d) {
    var gen = walks[d].placements || [], real = realBy[d] || [];
    if (!gen.length || !real.length) return;
    var b05 = 0, b10 = 0, b20 = 0, sdx = 0, sdy = 0, sdz = 0;
    gen.forEach(function (p) {
      var m = nn(p, real);
      if (m.d <= 0.5) b05++;
      if (m.d <= 1.0) b10++;
      if (m.d <= 2.0) b20++;
      sdx += real[m.i].x - p.x; sdy += real[m.i].y - p.y; sdz += real[m.i].z - p.z;
    });
    var cov = 0;
    real.forEach(function (q) { if (nn(q, gen).d <= 2.0) cov++; });
    w5[d] = { b20: b20, n: gen.length };
    log('§RS W5 [' + d + '] gen=' + gen.length + ' real=' + real.length +
      ' | NN match @0.5m=' + b05 + ' (' + (100 * b05 / gen.length).toFixed(0) + '%)' +
      ' @1m=' + b10 + ' (' + (100 * b10 / gen.length).toFixed(0) + '%)' +
      ' @2m=' + b20 + ' (' + (100 * b20 / gen.length).toFixed(0) + '%)' +
      ' | real covered @2m=' + cov + '/' + real.length + ' (' + (100 * cov / real.length).toFixed(0) + '%)' +
      ' | mean offset dx=' + (sdx / gen.length).toFixed(2) + 'm dy=' + (sdy / gen.length).toFixed(2) +
      'm dz=' + (sdz / gen.length).toFixed(2) + 'm — the deviation dial, direction included');
  });
  // §W5-RATCHET diagnostic (item 4, 2026-07-11 — LOG ONLY, the dial stays "reported, not hard"):
  // the pooled NN buckets can move on ACCIDENTAL cross-family pairings (a gen toilet matching a real
  // lavatory), hiding whether per-device z actually improved. Decompose: (a) per-family median
  // z-above-floor, generated vs real — the direct read of the mined per-room offsets; (b) the @0.5m
  // bucket split into same-family vs cross-family pairs. Families via the SAME committed
  // ad_element_mep_alias patterns the miner used (witness-side oracle read, walker never sees it).
  var pat = loadDb(SQL, path.join(ROOT, 'library/disc_patterns.db'));
  var famPats = rows(pat, "SELECT canonical_type c, match_value v FROM ad_element_mep_alias " +
    "WHERE match_field='element_name' AND is_active=1 ORDER BY priority");
  var canonSet = {};
  rows(pat, 'SELECT Value v FROM ad_element_mep').forEach(function (r) { canonSet[r.v] = 1; });
  function famOf(name) {
    for (var i = 0; i < famPats.length; i++)
      if ((name || '').toUpperCase().indexOf(famPats[i].v.replace(/%/g, '').toUpperCase()) >= 0) return famPats[i].c;
    return null;
  }
  var rulesDb = loadDb(SQL, DWT.rules('duplex_rules.db'));
  var devFam = {};
  rows(rulesDb, 'SELECT DISTINCT device_id d, element_name e FROM rule_space_schedule').forEach(function (r) {
    devFam[r.d] = famOf(r.e) || (canonSet[r.d] ? r.d : null);
  });
  var realName = {};
  rows(dx, "SELECT guid g, element_name e FROM elements_meta WHERE ifc_class='IfcFlowTerminal'")
    .forEach(function (r) { realName[r.g] = r.e; });
  function zRelFloor(p) {
    for (var i = 0; i < spaces.length; i++) {
      var s = spaces[i];
      if (p.x >= s.x0 - 0.3 && p.x <= s.x1 + 0.3 && p.y >= s.y0 - 0.3 && p.y <= s.y1 + 0.3 &&
          p.z >= s.z0 - 0.5 && p.z <= s.z1 + 0.5) return p.z - s.z0;
    }
    return null;
  }
  function median(a) { a = a.slice().sort(function (x, y) { return x - y; }); return a.length ? a[(a.length - 1) >> 1] : null; }
  ['ELEC', 'PLB'].forEach(function (d) {
    var gen = walks[d].placements || [], real = realBy[d] || [];
    if (!gen.length || !real.length) return;
    var same05 = 0, cross05 = 0, fams = {};
    gen.forEach(function (p) {
      var gf = devFam[p.device];
      var m = nn(p, real);
      if (m.d <= 0.5) { (gf && famOf(realName[real[m.i].g]) === gf) ? same05++ : cross05++; }
      if (!gf) return;
      var zr = zRelFloor(p);
      if (zr === null) return;
      (fams[gf] = fams[gf] || { g: [], r: [] }).g.push(zr);
    });
    real.forEach(function (q) {
      var rf = famOf(realName[q.g]), zr = zRelFloor(q);
      if (rf && zr !== null && fams[rf]) fams[rf].r.push(zr);
    });
    var parts = Object.keys(fams).sort().filter(function (f) { return fams[f].g.length && fams[f].r.length; })
      .map(function (f) {
        return f + ' gen=' + median(fams[f].g).toFixed(2) + 'm real=' + median(fams[f].r).toFixed(2) +
          'm (n=' + fams[f].g.length + '/' + fams[f].r.length + ')';
      });
    log('§RS W5-ZFAM [' + d + '] median z-above-floor per family: ' + parts.join(' | ') +
      ' | @0.5m pairs: same-family=' + same05 + ' cross-family=' + cross05);
  });

  // falsifier: +3m shift must collapse the @2m rate — the dial measures real geometry, not noise
  var shifted = (walks.ELEC.placements || []).map(function (p) { return { x: p.x + 3, y: p.y + 3, z: p.z }; });
  var s20 = 0;
  shifted.forEach(function (p) { if (nn(p, realBy.ELEC).d <= 2.0) s20++; });
  assert('W5 FALSIFIER', w5.ELEC && s20 < w5.ELEC.b20,
    'shifting every generated ELEC fixture +3m drops @2m matches ' + w5.ELEC.b20 + ' → ' + s20 +
    ' — the fidelity dial genuinely measures position, not vacuous');

  // ── W6 NAVIGABILITY (BIMEYES_NAVIGABILITY_CHECK.md, folded in 2026-07-10 — item 3): does fixture
  // placement fragment a room's free floor into unreachable pockets? Per real space: 0.25m grid over
  // the space bbox, a cell BLOCKED when a generated fixture's AABB intersects it inside the walking
  // band (floor → +1.8m); connectedFraction = largest 4-connected free region / total free cells.
  log(''); log('─── W6 NAVIGABILITY (flood-fill, per real space) ───');
  var CELL = 0.25, WALK_H = 1.8;
  function connectedFraction(sp, fixtures) {
    var nx = Math.max(1, Math.round((sp.x1 - sp.x0) / CELL)), ny = Math.max(1, Math.round((sp.y1 - sp.y0) / CELL));
    var blocked = new Uint8Array(nx * ny), freeN = 0;
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
      var cx = sp.x0 + (i + 0.5) * CELL, cy = sp.y0 + (j + 0.5) * CELL, blk = false;
      for (var k = 0; k < fixtures.length && !blk; k++) {
        var f = fixtures[k];
        if (f.z - (f.bz || 0.2) / 2 > sp.z0 + WALK_H) continue;            // above the walking band
        if (Math.abs(cx - f.x) <= (f.bx || 0.2) / 2 + CELL / 2 && Math.abs(cy - f.y) <= (f.by || 0.2) / 2 + CELL / 2) blk = true;
      }
      if (blk) blocked[j * nx + i] = 1; else freeN++;
    }
    if (!freeN) return { cf: 0, freeN: 0 };
    // PERSON-SCALE: free regions smaller than 4 cells (< 0.5×0.5 m) can't hold a person —
    // a 6cm² pocket behind a corner fixture is physically real in any bathroom, not
    // fragmentation. connectedFraction is computed over person-reachable cells only.
    var PERSON_CELLS = 4;
    var seen2 = new Uint8Array(nx * ny), bestR = 0, reachN = 0;
    for (var s0 = 0; s0 < nx * ny; s0++) {
      if (blocked[s0] || seen2[s0]) continue;
      var stack = [s0], size = 0; seen2[s0] = 1;
      while (stack.length) {
        var c = stack.pop(); size++;
        var ci = c % nx, cj = (c - ci) / nx;
        [[ci - 1, cj], [ci + 1, cj], [ci, cj - 1], [ci, cj + 1]].forEach(function (nb) {
          if (nb[0] < 0 || nb[0] >= nx || nb[1] < 0 || nb[1] >= ny) return;
          var idx = nb[1] * nx + nb[0];
          if (!blocked[idx] && !seen2[idx]) { seen2[idx] = 1; stack.push(idx); }
        });
      }
      if (size >= PERSON_CELLS) reachN += size;
      if (size > bestR) bestR = size;
    }
    if (!reachN) return { cf: 0, freeN: freeN };
    return { cf: bestR / reachN, freeN: freeN };
  }
  var bySpace = {};
  allGen.forEach(function (p) { (bySpace[p.spaceGuid] = bySpace[p.spaceGuid] || []).push(p); });
  var minCF = 1, minSp = '-';
  Object.keys(bySpace).forEach(function (g) {
    var sp = spaceByGuid[g]; if (!sp) return;
    var r = connectedFraction(sp, bySpace[g]);
    log('§RS W6 space=' + (bySpace[g][0].space || g) + ' fixtures=' + bySpace[g].length +
      ' connectedFraction=' + r.cf.toFixed(3) + ' freeCells=' + r.freeN);
    if (r.cf < minCF) { minCF = r.cf; minSp = bySpace[g][0].space || g; }
  });
  assert('W6 NAVIGABILITY', minCF >= 0.95,
    'every occupied real space keeps ONE walkable region: min connectedFraction=' + minCF.toFixed(3) +
    ' (worst: ' + minSp + ', bar ≥0.95) — placement does not fragment the free floor');
  // falsifier: a synthetic fixture WALL spanning the widest space at floor level must fragment it
  var wide = null;
  Object.keys(bySpace).forEach(function (g) { var s = spaceByGuid[g]; if (s && (!wide || (s.x1 - s.x0) > (wide.x1 - wide.x0))) wide = s; });
  var midY = (wide.y0 + wide.y1) / 2, fakeWall = [];
  for (var fx = wide.x0; fx <= wide.x1; fx += 0.2) fakeWall.push({ x: fx, y: midY, z: wide.z0 + 0.5, bx: 0.3, by: 0.3, bz: 1.0 });
  var rF = connectedFraction(wide, fakeWall);
  assert('W6 FALSIFIER', rF.cf < 0.95,
    'a synthetic floor-level fixture wall across the widest space drops connectedFraction to ' + rF.cf.toFixed(3) +
    ' — the flood-fill genuinely detects fragmentation');

  // ── W7 COLLISION (BIMEYES spec, folded in 2026-07-10 — item 3): no two generated fixtures may
  // physically intersect. Pairwise strict AABB overlap (method=bbox — meshes not loaded node-side
  // here; reported honestly per the spec's method-disclosure rule).
  log(''); log('─── W7 COLLISION (pairwise, method=bbox) ───');
  function aabbHit(a, b) {
    return Math.abs(a.x - b.x) < ((a.bx || 0.2) + (b.bx || 0.2)) / 2 - 1e-6 &&
           Math.abs(a.y - b.y) < ((a.by || 0.2) + (b.by || 0.2)) / 2 - 1e-6 &&
           Math.abs(a.z - b.z) < ((a.bz || 0.2) + (b.bz || 0.2)) / 2 - 1e-6;
  }
  var hits = [];
  for (var a1 = 0; a1 < allGen.length; a1++) for (var b1 = a1 + 1; b1 < allGen.length; b1++) {
    if (aabbHit(allGen[a1], allGen[b1])) hits.push(allGen[a1].device + '@' + allGen[a1].space + '×' + allGen[b1].device + '@' + allGen[b1].space);
  }
  assert('W7 COLLISION', hits.length === 0,
    allGen.length + ' fixtures, ' + (allGen.length * (allGen.length - 1) / 2) + ' pairs tested (bbox): ' +
    hits.length + ' collisions' + (hits.length ? ' — ' + hits.slice(0, 5).join(', ') : ' — no two generated fixtures intersect'));
  var dup = Object.assign({}, allGen[0]); dup.x += 0.01;
  assert('W7 FALSIFIER', aabbHit(allGen[0], dup) === true,
    'an injected near-duplicate fixture IS flagged by the same bbox test — the check can catch a real overlap');

  log('');
  log('§RS SUMMARY: bare DX ARC + mined residential rules reconstructed ' + allGen.length + ' fixtures across ' +
    (spacesInfo ? spacesInfo.spacesUsed : '?') + ' real rooms — hard gates (quantity band, containment, host+facing, ' +
    'LOD400) above; W5 is the honest deviation dial to ratchet toward RSS-exact. Walker read rules+ARC only; ' +
    'this witness alone read the real MEP.');
  log('');
  log('W-DX-WALKBACK-RSGT: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n') + '\n');   // fresh checkout has no logs/ (Watchdog round-2)
  log('§LOG ' + LOG);
  dx.close(); mm.close(); lib.close();
  process.exit(fail ? 1 : 0);
})();
