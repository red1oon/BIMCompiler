#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-HOSTBIND-AGNOSTIC scope (read this block first)
 * SCOPE: Prove that `disc_walker.hostBind` is now HOST-TYPE-AGNOSTIC — it drives the host class + mount face from
 *   the shim percept instead of hard-targeting walls — by witnessing it on TWO real host types in ONE run:
 *     (A) ELEC outlets → IfcWall, mount=SIDE   (the SH anti-float fix, via the GENERALIZED path = regression).
 *     (B) SC vent grilles → IfcWindow, mount=CENTER  (the 13 real `vent. rooster` IfcDistributionElement on
 *         SampleCastle, host-bound to their same-storey window + a MEASURED vertical rise).
 *   This is the resolution of the §SC fork (RESUME_DISC_WALKER_ENVELOPE_BOUND.md §SC ADDENDUM 2026-06-30): SC is
 *   NOT a networked (class-1) ACMV oracle — there is no duct↔grille topology in the source — but its 13 grilles
 *   ARE a host-bound-standalone (class-2) PLACEMENT oracle. No vent extraction, no fabricated ducts.
 *
 *   NON-INVENT: walls & windows are REAL target geometry. The grille→window rule (host=IfcWindow, mount=CENTER,
 *   offset, same_storey) is MINED from the 13 real grilles, then APPLIED to reproduce them — this is SELF-
 *   CONSISTENCY (mined-then-applied-to-same), the SAME honesty status as the routing rules; reported as such,
 *   NOT cross-building generalization. A grille with no same-storey window in reach is REFUSED (counted), never
 *   forced onto a window. Read the §-log after the run; exit code is not the evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   H0 MINED-RULE      — the grille→window mount rule (mount face + offset) is MINED from the 13 real grilles with
 *                        a TIGHT spread (MAD≈0), not a hand-picked constant. Records VENT_WINDOW_SHIM for promotion (disc-mapping deferred to the rule_shim projection).
 *   H1 WALL-REGRESSION — the generalized hostBind reproduces the wall/SIDE result UNCHANGED (SH ELEC: 36 bound,
 *                        median ≤ wall thickness, float→0). Generalization didn't break class-2-wall.
 *   H2 WINDOW-ASSOC    — the 13 grilles ARE host-bound to windows: N/13 sit within reach of a same-storey window
 *                        in plan (measured; honest count, the rest are not window-co-located → refused).
 *   H3 REPRODUCE       — host-binding the window-associated grilles reproduces their REAL position (XY + Z) within
 *                        tolerance (self-consistency walk-back against the real grilles).
 *   H4 NON-INVENT      — every bound grille carries a REAL window guid + snapDist ≤ reach; 0 fabricated hosts.
 *   H5 REFUSE          — grilles with no same-storey window in reach are REFUSED (counted), never forced.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var DISC_PATTERNS = path.join(ROOT, 'library/ERP.db'); // disc_patterns.db (physically library/ERP.db until rename slice)
var RULES = DWT.rules('duplex_rules.db');
var TERMINAL_RULES = DWT.rules('terminal_rules.db');
var SH = path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db');
var SC = path.join(ROOT, 'deploy/buildings/SampleCastle_extracted.db');
var LOG = path.join(ROOT, 'logs', 'witness_hostbind_agnostic_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function rows(db, sql) {
  var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function median(a) { if (!a.length) return Infinity; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
function mad(a) { var m = median(a); return median(a.map(function (v) { return Math.abs(v - m); })); }
// §BUG-A-TRUE-MIDPOINT: element_transforms.center is NOT a reliable wall midpoint (RESUME_DISC_WALKER_
// ENVELOPE_BOUND.md) -- ground truth here must use the TRUE (mesh-reconstructed) midpoint via
// DW._trueMidpoint, same as hostBind() itself now does, or this checker stale-compares the FIXED code's
// output against the OLD/wrong wall line (verify-the-checker, not just the code under test).
function distToWalls(p, walls, bdb) {
  var best = Infinity;
  for (var i = 0; i < walls.length; i++) {
    var w = walls[i], horiz = w.bx >= w.by_ ? 0 : 1, hlen = (horiz === 0 ? w.bx : w.by_) / 2;
    var mid = (bdb && DW._trueMidpoint) ? DW._trueMidpoint(bdb, w.g, w) : { x: w.x, y: w.y };
    var a = [mid.x, mid.y], b = [mid.x, mid.y]; a[horiz] -= hlen; b[horiz] += hlen;
    var abx = b[0] - a[0], aby = b[1] - a[1], l2 = abx * abx + aby * aby;
    var t = l2 > 0 ? ((p.x - a[0]) * abx + (p.y - a[1]) * aby) / l2 : 0; t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var d = Math.hypot(p.x - (a[0] + t * abx), p.y - (a[1] + t * aby));
    if (d < best) best = d;
  }
  return best;
}

(async function main() {
  log('═══ W-HOSTBIND-AGNOSTIC — host-type-agnostic hostBind on TWO real host types (ELEC→wall SIDE, grille→window CENTER) ═══');
  var SQL = await initSqlJs();

  // ════════════════════════════════════════════════════════════════════════════════════
  // (A) ELEC → WALL (SIDE) — regression of W-ELEC-HOSTBIND through the GENERALIZED path
  // ════════════════════════════════════════════════════════════════════════════════════
  var dp = loadDb(SQL, DISC_PATTERNS);
  var wshim = rows(dp, "SELECT * FROM _shim_attributes WHERE product_value LIKE 'ELEC%WALL%'")[0];
  dp.close();
  var shimWall = {
    host_ifc_class: wshim ? wshim.host_ifc_class : 'IfcWall',
    mount: wshim ? wshim.mount : 'SIDE',
    offset_m: wshim && wshim.offset_mm != null ? wshim.offset_mm / 1000 : 0,
    height_m: wshim && wshim.height_mm ? wshim.height_mm / 1000 : null,
    reach_m: 6
  };
  var rdb = loadDb(SQL, RULES), sh = loadDb(SQL, SH);
  DW.dwOpen(rdb);
  var sub = DW.substrate(sh);
  var storeyZ = {}; sub.forEach(function (st) { storeyZ[st.name] = st.z; });
  var placedElec = DW.place('ELEC', sub, sh).map(function (p) { p.storeyZ = storeyZ[p.storey]; return p; });
  var shWalls = rows(sh, "SELECT m.guid g, t.center_x x, t.center_y y, t.bbox_x bx, t.bbox_y by_, t.rotation_x rx, t.rotation_y ry, t.rotation_z rot FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'");
  var wallThick = median(shWalls.map(function (w) { return Math.min(w.bx, w.by_); }));
  var beforeD = placedElec.map(function (p) { return distToWalls(p, shWalls, sh); });
  var beforeFloat = beforeD.filter(function (d) { return d > 0.6; }).length;
  var hbW = DW.hostBind(placedElec, sh, shimWall);
  var afterD = hbW.bound.map(function (p) { return distToWalls(p, shWalls, sh); });
  var afterFloat = afterD.filter(function (d) { return d > 0.6; }).length;
  var afterMedW = median(afterD);
  var shWallGuids = {};
  rows(sh, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Wall%'").forEach(function (r) { shWallGuids[r.g] = 1; });
  var badW = hbW.bound.filter(function (p) { return !p.host || !shWallGuids[p.host]; }).length;
  log('§HBA-WALL host=' + shimWall.host_ifc_class + ' mount=' + shimWall.mount + ' · ELEC placed=' + placedElec.length +
    ' float=' + beforeFloat + ' → bound=' + hbW.bound.length + ' refused=' + hbW.refused +
    ' afterFloat=' + afterFloat + ' median=' + afterMedW.toFixed(3) + 'm (wall½=' + (wallThick / 2).toFixed(3) + 'm)');
  // §BUG-A-OCC-SCOPE (2026-07-09): re-baselined 36→37 bound. disc_walker.occupancy() now corrects element
  // centres via true-midpoint (the same fix as hostBind's own SIDE branch), which moves the floating ELEC
  // density-placement positions; one fixture that previously fell >6m from any TRUE wall line now falls
  // within reach of a real one. count-preserved (bound+refused=placed, 37+1=38 same as 36+2=38 before) and
  // still 0 fabricated (badW===0) — a real host newly in reach, not a broken invariant.
  // Re-baselined 37→17 (MODELLER_MASTER §WITNESS-REPOINT): the shipped walker's §STOREY-UNKNOWN-EXCLUDE (no fake 'Unknown' storey, placed 38→28) and §STOREY-ZBAND (a wall must meet the
  // device's mount height, refused 1→11), both bim-ootb 0885b742, witness W-DW-STOREY-BAND. This witness never saw them because it tested the older build/ copy. Still an exact count.
  assert('H1 WALL-REGRESSION',
    hbW.bound.length === 17 && afterFloat === 0 && afterMedW <= wallThick && badW === 0 &&
    (hbW.bound.length + hbW.refused) === placedElec.length,
    'generalized hostBind reproduces wall/SIDE: ' + hbW.bound.length + ' bound (=17), float ' + beforeFloat + '→0, median ' +
    afterMedW.toFixed(3) + 'm ≤ wall thickness ' + wallThick.toFixed(3) + 'm, 0 fabricated, bound+refused=placed');
  rdb.close(); sh.close();

  // ════════════════════════════════════════════════════════════════════════════════════
  // (B) SC VENT GRILLES → WINDOW (CENTER) — class-2 host-bound PLACEMENT walk-back
  // ════════════════════════════════════════════════════════════════════════════════════
  var sc = loadDb(SQL, SC);
  var grilles = rows(sc, "SELECT m.guid g, m.storey st, t.center_x x, t.center_y y, t.center_z z, " +
    "COALESCE(t.rotation_x,0) rx, COALESCE(t.rotation_y,0) ry, COALESCE(t.rotation_z,0) rot " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='IfcDistributionElement'");
  var scWins = rows(sc, "SELECT m.guid g, m.storey st, t.center_x x, t.center_y y, t.center_z z, t.bbox_z bz, " +
    "COALESCE(t.rotation_x,0) rx, COALESCE(t.rotation_y,0) ry, COALESCE(t.rotation_z,0) rot " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='IfcWindow'");
  // §BUG-A-OCC-SCOPE (2026-07-09): MEASURED the raw center_z is NOT reliable even on point-like hosts (windows) --
  // the 7 SC grille-associated windows carry a real, consistent true-midpoint Z defect (true_z = raw_z-0.0835m,
  // MAD≈0). Mine off the TRUE z (same DW._trueMidpoint recovery hostBind's CENTER branch now applies) so the
  // mined VENT_WINDOW_SHIM offset and its apply-side consumer stay self-consistent.
  grilles.forEach(function (g) { var m = DW._trueMidpoint(sc, g.g, g); g.tz = m.verified ? m.z : g.z; });
  scWins.forEach(function (w) { var m = DW._trueMidpoint(sc, w.g, w); w.tz = m.verified ? m.z : w.z; });
  var winGuids = {}; scWins.forEach(function (w) { winGuids[w.g] = w; });
  log('§HBA-GRILLE SC grilles(vent. rooster)=' + grilles.length + ' · windows=' + scWins.length);

  // ── H0 MINE the rule from the real grilles: nearest SAME-STOREY window in plan, measure dz to its TRUE centre ──
  var REACH = 0.6;
  var assoc = [], dzC = [], xySnap = [];
  grilles.forEach(function (gr) {
    var best = Infinity, bw = null;
    scWins.forEach(function (w) { if (w.st !== gr.st) return; var d = Math.hypot(gr.x - w.x, gr.y - w.y); if (d < best) { best = d; bw = w; } });
    if (bw && best <= REACH) { assoc.push({ gr: gr, w: bw, xy: best }); dzC.push(gr.tz - bw.tz); xySnap.push(best); }
  });
  var offCenter = median(dzC), spread = mad(dzC);
  log('§HBA-GRILLE MINED rule: host=IfcWindow mount=CENTER same_storey · ' + assoc.length + '/' + grilles.length +
    ' window-associated (XY≤' + REACH + 'm, median snap=' + median(xySnap).toFixed(3) + 'm) · z-rise off window centre median=' +
    offCenter.toFixed(3) + 'm MAD=' + spread.toFixed(3) + 'm');
  assert('H0 MINED-RULE',
    assoc.length >= 5 && spread <= 0.01 && isFinite(offCenter),
    'the grille→window rise is a TIGHT measured rule (' + assoc.length + ' samples, offset=' + offCenter.toFixed(3) +
    'm, MAD=' + spread.toFixed(3) + 'm ≤ 0.01) — VENT_WINDOW_SHIM | IfcWindow | CENTER | ' + Math.round(offCenter * 1000) + 'mm (promote to _shim_attributes)');

  // ── H2 WINDOW-ASSOC (count is the honest measured association) ──
  assert('H2 WINDOW-ASSOC',
    assoc.length > 0 && assoc.length <= grilles.length,
    assoc.length + '/' + grilles.length + ' grilles are window-co-located on their own storey (median plan snap ' +
    median(xySnap).toFixed(3) + 'm); the other ' + (grilles.length - assoc.length) + ' are not → will be refused (honest)');

  // ── APPLY the mined rule: feed the grilles' real XY+storey (known at placement) with z STRIPPED; hostBind recomputes z ──
  var shimWin = { host_ifc_class: 'IfcWindow', mount: 'CENTER', offset_m: offCenter, same_storey: true, reach_m: REACH };
  var placements = grilles.map(function (gr) { return { disc: 'ACMV', ifc_class: 'IfcDistributionElement', x: gr.x, y: gr.y, z: null, storey: gr.st, _truth: gr }; });
  var hbG = DW.hostBind(placements, sc, shimWin);
  log('§HBA-GRILLE hostBind: host=' + hbG.hostClass + ' mount=' + hbG.mount + ' → ' + hbG.bound.length + ' bound, ' + hbG.refused + ' refused');

  // ── H3 REPRODUCE — bound grille position matches the real grille (XY co-located + Z within tol) ──
  // match each bound result back to its truth grille by (host window + nearest real grille xy)
  var truthByXY = grilles.slice();
  var resid = [];
  hbG.bound.forEach(function (b) {
    var best = Infinity, tg = null;
    truthByXY.forEach(function (gr) { if (gr.st !== b.storey) return; var d = Math.hypot(gr.x - b.x, gr.y - b.y); if (d < best) { best = d; tg = gr; } });
    if (tg) resid.push({ xy: Math.hypot(tg.x - b.x, tg.y - b.y), dz: Math.abs(tg.z - b.z) });
  });
  var medXY = median(resid.map(function (r) { return r.xy; }));
  var medDZ = median(resid.map(function (r) { return r.dz; }));
  var maxDZ = Math.max.apply(null, resid.map(function (r) { return r.dz; }));
  log('§HBA-GRILLE REPRODUCE: bound vs real grilles — median XY resid=' + medXY.toFixed(3) + 'm, median |Δz|=' +
    medDZ.toFixed(3) + 'm, max |Δz|=' + maxDZ.toFixed(3) + 'm (self-consistency: mined-then-applied-to-same)');
  assert('H3 REPRODUCE',
    hbG.bound.length > 0 && medXY <= 0.05 && maxDZ <= 0.05,
    'host-bind reproduces the ' + hbG.bound.length + ' window-grilles: XY resid ' + medXY.toFixed(3) + 'm ≤ 0.05, max |Δz| ' +
    maxDZ.toFixed(3) + 'm ≤ 0.05 (SELF-CONSISTENCY — same status as mined-then-applied routing rules, NOT cross-building)');

  // ── H4 NON-INVENT — every bound grille carries a real window guid within reach ──
  var badG = hbG.bound.filter(function (b) { return !b.host || !winGuids[b.host] || b.snapDist > REACH; }).length;
  log('§HBA-GRILLE NON-INVENT: ' + (hbG.bound.length - badG) + '/' + hbG.bound.length + ' bound grilles carry a REAL window guid ≤ reach');
  assert('H4 NON-INVENT',
    badG === 0 && hbG.bound.length > 0,
    'every bound grille traces a real IfcWindow guid + snapDist ≤ ' + REACH + 'm (' + badG + ' bad); zero fabricated windows');

  // ── H5 REFUSE — non-window-co-located grilles refused, never forced ──
  log('§HBA-GRILLE REFUSE: ' + hbG.refused + ' grilles had no same-storey window ≤ ' + REACH + 'm → refused (counted, not forced onto a window)');
  assert('H5 REFUSE',
    (hbG.bound.length + hbG.refused) === grilles.length && hbG.refused === (grilles.length - assoc.length),
    'bound + refused = grilles (' + hbG.bound.length + '+' + hbG.refused + '=' + grilles.length + '); refusals == non-associated (' +
    (grilles.length - assoc.length) + '), never fabricated');
  sc.close();

  // ════════════════════════════════════════════════════════════════════════════════════
  // (C) §DE-VENT — the mislabeled VENT_WINDOW_SHIM (RESUME_DISC_WALKER_ENVELOPE_BOUND.md's
  //   2026-07-10 correction) is now a real ACMV_WINDOW_SHIM row, PROJECTED into duplex_rules.db's
  //   first-class `rule_shim` table (not just a caller-passed percept as (B) mines/applies above).
  //   NON-INVENT: read the row exactly as project_rule_shim.py wrote it — no re-derivation here.
  // ════════════════════════════════════════════════════════════════════════════════════
  var rdb2 = loadDb(SQL, RULES);
  var acmvShims = rows(rdb2, "SELECT * FROM rule_shim WHERE disc='ACMV' ORDER BY rowid");
  rdb2.close();
  var winRow = acmvShims.filter(function (r) { return r.host_ifc_class === 'IfcWindow'; })[0];
  log('§HBA-DEVENT rule_shim(disc=ACMV): ' + acmvShims.map(function (r) { return r.host_ifc_class + '/' + r.mount + '(prio=' + r.priority + ')'; }).join(', '));
  assert('H6 RELABEL',
    !!winRow && winRow.offset_m != null,
    'ACMV_WINDOW_SHIM is reachable under its REAL discipline (disc=ACMV, was orphaned disc=VENT — no walkable rule ever matched it) — row: host=' +
    (winRow && winRow.host_ifc_class) + ' mount=' + (winRow && winRow.mount) + ' offset_m=' + (winRow && winRow.offset_m));

  // H7 PROJECTION-CONSISTENCY — the STORED offset (mined+corrected in a prior session, projected here) must still
  // agree with a FRESH re-mine off the same real grilles/windows (H0 above) — catches drift between the pattern
  // store and its projection, not just a label typo. NOT a same-unit diff: the stored row is mount=TOP
  // (offset from the window's TOP FACE, per hostBind's `pz = tz + bz/2 + off` for TOP), while H0 mines
  // mount=CENTER (offset from the window CENTRE). Convert TOP→CENTER via the associated windows' own REAL
  // half-height (measured, not assumed) before comparing — an apples-to-oranges raw diff would falsely FAIL a
  // correct row (caught by first running this straight, Δ=0.927m ≈ the real window half-height, not drift).
  var winBzMed = median(assoc.map(function (a) { return a.w.bz; }));
  var winRowAsCenter = winRow ? winRow.offset_m + winBzMed / 2 : null;
  assert('H7 PROJECTION-CONSISTENCY',
    !!winRow && Math.abs(winRowAsCenter - offCenter) <= 0.005,
    'projected rule_shim offset_m=' + (winRow && winRow.offset_m.toFixed(3)) + 'm(TOP) + window half-height ' +
    (winBzMed / 2).toFixed(3) + 'm = ' + (winRowAsCenter && winRowAsCenter.toFixed(3)) + 'm(CENTER-equiv) vs fresh re-mine=' +
    offCenter.toFixed(3) + 'm (Δ=' + (winRowAsCenter != null ? Math.abs(winRowAsCenter - offCenter).toFixed(3) : 'n/a') +
    'm ≤ 0.005) — no store/projection drift once the mount-convention (TOP vs CENTER) is accounted for');

  // APPLY hostBind using the PROJECTED row verbatim (not the hand-built shimWin from (B)) — proves the FIRST-CLASS
  // table, not just the caller-passed percept, drives a correct IfcWindow bind end-to-end.
  var shimWinProjected = { host_ifc_class: winRow.host_ifc_class, mount: winRow.mount, offset_m: winRow.offset_m, same_storey: !!winRow.same_storey, reach_m: REACH };
  var sc2 = loadDb(SQL, SC);
  var placementsP = grilles.map(function (gr) { return { disc: 'ACMV', ifc_class: 'IfcDistributionElement', x: gr.x, y: gr.y, z: null, storey: gr.st, _truth: gr }; });
  var hbGP = DW.hostBind(placementsP, sc2, shimWinProjected);
  sc2.close();
  assert('H8 PROJECTED-APPLY',
    hbGP.bound.length === hbG.bound.length && hbGP.refused === hbG.refused,
    'hostBind driven by the PROJECTED rule_shim row reproduces the hand-mined-shim result exactly: ' +
    hbGP.bound.length + ' bound / ' + hbGP.refused + ' refused (same as (B)) — the projection, not just the caller override, now resolves IfcWindow correctly');

  // H9 NAMED GAP (do not overstate H6-H8) — the disc-LEVEL fallback (no per-fixture rule_shim row exists for
  // (ACMV, IfcDistributionElement) because Duplex — the mining source for duplex_rules.db's rule_placement — has
  // no grille class to make it WALKABLE, see project_rule_shim.py's `walkable` gate) is AMBIGUOUS: ACMV now has
  // TWO disc-level candidates tied at priority=1 (CEILING for real ducts, WINDOW for grilles). `_shimForDisc`'s
  // stable sort keeps insertion order on a tie → CEILING wins. This means dwWalk('ACMV', ...) does NOT
  // automatically route a floating IfcDistributionElement to the window shim today — H6-H8 prove the row is
  // correctly labeled and functionally correct WHEN SELECTED (by a caller, as here), not that dwWalk selects it
  // by default. Closing this needs a real measured (disc,IfcDistributionElement)→walkable rule_placement row
  // (none exists — SC's grilles were never mined into rule_placement, by design, no fabricated ducts) — not
  // something to invent to make the default path "work".
  var ceilRow = acmvShims.filter(function (r) { return r.host_ifc_class === 'IfcCovering'; })[0];
  var tieWins = acmvShims.slice().sort(function (a, b) { return (a.priority != null ? a.priority : 9) - (b.priority != null ? b.priority : 9); })[0];
  log('§HBA-DEVENT H9 disc-level fallback tie: CEILING prio=' + (ceilRow && ceilRow.priority) + ', WINDOW prio=' +
    (winRow && winRow.priority) + ' → default pick=' + (tieWins && tieWins.host_ifc_class) +
    ' (dwWalk only reaches IfcWindow via an explicit caller percept or a future per-fixture row, NOT by default yet)');
  assert('H9 NAMED-GAP-NOT-CLOSED',
    tieWins.host_ifc_class === 'IfcCovering',
    'confirms (not hides) the open gap: disc-level fallback still resolves to ' + tieWins.host_ifc_class +
    ' on a tie — IfcWindow hostBind is PROVEN REACHABLE (H6-H8) but NOT yet dwWalk-default-selected (separate claims, per Watchdog checklist)');

  // H10 CROSS-PROJECTION SYNC (added after an independent review caught this exact gap 2026-07-10: H6-H9 above
  // only checked duplex_rules.db — terminal_rules.db is a SEPARATE projection of the SAME disc_patterns.db
  // source and was found still carrying the stale disc='VENT'/offset=-0.513 row, unfixed by the duplex-only
  // re-projection). Checks BOTH *_rules.db projections stay in sync with the source — this is what would have
  // caught the gap the first time, not just this one row's re-check.
  var trdb = loadDb(SQL, TERMINAL_RULES);
  var termAcmvShims = rows(trdb, "SELECT * FROM rule_shim WHERE disc='ACMV' ORDER BY rowid");
  var termVentRows = rows(trdb, "SELECT * FROM rule_shim WHERE disc='VENT' OR product_value LIKE '%VENT%'");
  trdb.close();
  var termWinRow = termAcmvShims.filter(function (r) { return r.host_ifc_class === 'IfcWindow'; })[0];
  log('§HBA-DEVENT H10 terminal_rules.db rule_shim(disc=ACMV): ' + termAcmvShims.map(function (r) { return r.host_ifc_class + '/' + r.mount + '(offset=' + r.offset_m + ')'; }).join(', ') +
    (termVentRows.length ? ' · STALE disc=VENT rows still present: ' + termVentRows.length : ''));
  assert('H10 CROSS-PROJECTION-SYNC',
    termVentRows.length === 0 && !!termWinRow && Math.abs(termWinRow.offset_m - winRow.offset_m) <= 1e-6,
    'terminal_rules.db carries the SAME correction as duplex_rules.db: 0 stale disc=VENT rows, ACMV/IfcWindow offset_m=' +
    (termWinRow && termWinRow.offset_m) + ' (== duplex\'s ' + winRow.offset_m + ') — both projections of disc_patterns.db in sync');

  log('───────────────────────────────────────────────');
  log('§HBA SUMMARY: hostBind is HOST-AGNOSTIC. (A) ELEC→IfcWall/SIDE reproduces the anti-float fix UNCHANGED (' +
    hbW.bound.length + ' bound, float→0). (B) SC 13 grilles→IfcWindow/CENTER: ' + hbG.bound.length +
    ' bound to real same-storey windows reproducing position (XY ' + medXY.toFixed(3) + 'm, |Δz| ≤ ' + maxDZ.toFixed(3) +
    'm), ' + hbG.refused + ' honestly refused. SC = class-2 host-bound PLACEMENT oracle (NOT class-1 networked). No vent extraction, no fabricated ducts.' +
    ' (C) §DE-VENT: ACMV_WINDOW_SHIM relabeled from orphaned disc=VENT → real disc=ACMV, projected row proven functionally correct (H6-H8), disc-level' +
    ' default-selection gap named not closed (H9), both *_rules.db projections confirmed in sync (H10) — tilted-hostBind (rotation_y hosts) remains a SEPARATE, still-open gap (0/259 SC windows tilted).');
  log('W-HOSTBIND-AGNOSTIC: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
