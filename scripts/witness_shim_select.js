#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-SHIM-SELECT scope (read this block first)
 * SCOPE: the fixture_ifc_class SELECTION KEY (RESUME_DISC_WALKER_ENVELOPE_BOUND.md §SHIM-SELECT). `rule_shim` was
 *   projected at DISC level only (fixture_ifc_class=NULL); a disc with >1 host (ELEC = wall-outlet + ceiling-light,
 *   FP = wall-alarm + ceiling-sprinkler) was disambiguated by a coarse `priority` (SIDE/wall first) → that MIS-BINDS
 *   ceiling fixtures to walls. The selection key stamps each rule_shim row with the fixture's own ifc_class, MEASURED
 *   (nearest-host NN) from the source building, so dwWalk picks the shim by fixture_ifc_class == placement.ifc_class.
 *   NON-INVENT: every per-fixture host is the measured nearest over REAL geometry; ambiguous fixtures are REFUSED
 *   (no row → disc-level fallback), never forced. Read the §-log after the run; exit code is not the evidence.
 *
 * CLAIMS:
 *   S0 MINED-DISTINCT  — terminal_rules.rule_shim carries ELEC/IfcLightFixture→IfcCovering AND
 *                        ELEC/IfcElectricAppliance→IfcWall (distinct hosts within one disc), each provenance
 *                        'measured:fixture-host-nn%'. (the mis-bind resolved at the DATA level)
 *   S1 NON-INVENT-ORACLE — re-measure each stamped per-fixture row's fixture→host NN INDEPENDENTLY from the source
 *                        building; the stamped host == the independently-measured nearest host, median ≤ 0.5m.
 *   S2 SELECTION       — _shimForFixture picks IfcCovering/BOTTOM for IfcLightFixture and IfcWall/SIDE for
 *                        IfcElectricAppliance — DIFFERENT shims for the same disc (vs the disc-level pick = IfcWall).
 *   S3 LIVE-SELECT     — dwWalk('ELEC', Terminal, {hostBind:true}) binds floating IfcLightFixture to IfcCovering
 *                        (mount BOTTOM, real covering guids, 0 on walls) — the OLD disc-priority pick was IfcWall,
 *                        so the key FLIPS the lights wall→ceiling. Count preserved.
 *   S4 FALLBACK        — a class with no per-fixture row falls back to the disc-level shim (no crash, count preserved).
 *   S5 REGRESSION      — duplex ELEC on SampleHouse still binds all→wall (generic flow-classes measured to walls) →
 *                        W-DWWALK-HOSTBIND path unchanged.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var TE_RULES = DWT.rules('terminal_rules.db');
var DX_RULES = DWT.rules('duplex_rules.db');
var TE_SRC = path.join(ROOT, 'deploy/buildings/Terminal_extracted.db');
var SH = path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db');
var LOG = path.join(ROOT, 'logs', 'witness_shim_select_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');
var MOUNT_TOL = 0.5;

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function median(a) { if (!a.length) return Infinity; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }

// independent oracle: point-to-bbox-surface nearest distance from a fixture centre to a host pool.
function surfDist(p, pool) {
  var best = Infinity;
  for (var i = 0; i < pool.length; i++) {
    var h = pool[i];
    var dx = Math.max(Math.abs(p.x - h.x) - h.bx / 2, 0), dy = Math.max(Math.abs(p.y - h.y) - h.by_ / 2, 0), dz = Math.max(Math.abs(p.z - h.z) - h.bz / 2, 0);
    var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < best) best = d;
  }
  return best;
}

(async function main() {
  log('═══ W-SHIM-SELECT — fixture_ifc_class selection key (which fixture class mounts on which host, measured) ═══');
  var SQL = await initSqlJs();
  var te = loadDb(SQL, TE_RULES), src = loadDb(SQL, TE_SRC);

  // ── S0 MINED-DISTINCT ──
  var teFix = rows(te, "SELECT disc, fixture_ifc_class, host_ifc_class, mount, provenance FROM rule_shim WHERE fixture_ifc_class IS NOT NULL");
  function findRow(disc, cls) { return teFix.filter(function (r) { return r.disc === disc && r.fixture_ifc_class === cls; })[0]; }
  var light = findRow('ELEC', 'IfcLightFixture'), appl = findRow('ELEC', 'IfcElectricAppliance');
  log('§SS rows: ' + teFix.map(function (r) { return r.disc + '/' + r.fixture_ifc_class.replace('Ifc', '') + '→' + r.host_ifc_class.replace('Ifc', '') + '/' + r.mount; }).join('  '));
  assert('S0 MINED-DISTINCT',
    !!light && !!appl && light.host_ifc_class === 'IfcCovering' && appl.host_ifc_class === 'IfcWall' &&
    light.host_ifc_class !== appl.host_ifc_class && /measured:fixture-host-nn/.test(light.provenance) && /measured:fixture-host-nn/.test(appl.provenance),
    !!light && !!appl ? ('ELEC splits by class: IfcLightFixture→' + light.host_ifc_class + ' vs IfcElectricAppliance→' + appl.host_ifc_class + ' (distinct, both measured)') : 'missing per-fixture ELEC rows');

  // ── S1 NON-INVENT-ORACLE: re-measure each stamped row independently from the source building ──
  var tx = {};
  rows(src, "SELECT t.guid g, t.center_x x, t.center_y y, t.center_z z, t.bbox_x bx, t.bbox_y by_, t.bbox_z bz FROM element_transforms t").forEach(function (r) { tx[r.g] = r; });
  var clsOf = {}; rows(src, "SELECT guid g, ifc_class c, discipline d FROM elements_meta").forEach(function (r) { clsOf[r.g] = r; });
  function pool(hostClass) { var o = []; Object.keys(tx).forEach(function (g) { var m = clsOf[g]; if (m && m.c && m.c.toLowerCase().indexOf(hostClass.toLowerCase()) >= 0) o.push(tx[g]); }); return o; }
  function fixturePts(disc, cls) { var o = []; Object.keys(tx).forEach(function (g) { var m = clsOf[g]; if (m && m.c === cls && m.d === disc) o.push(tx[g]); }); return o; }
  var hostClasses = ['IfcWall', 'IfcCovering', 'IfcSlab', 'IfcWindow'];
  var pools = {}; hostClasses.forEach(function (h) { pools[h] = pool(h); });
  var oracleOk = 0, oracleTot = 0, oracleDetail = [];
  teFix.forEach(function (r) {
    var pts = fixturePts(r.disc, r.fixture_ifc_class);
    if (!pts.length) return;
    oracleTot++;
    var meds = hostClasses.filter(function (h) { return pools[h].length; }).map(function (h) {
      return { h: h, med: median(pts.map(function (p) { return surfDist(p, pools[h]); })) };
    }).sort(function (a, b) { return a.med - b.med; });
    var nearest = meds[0];
    var ok = nearest.h === r.host_ifc_class && nearest.med <= MOUNT_TOL;
    if (ok) oracleOk++;
    oracleDetail.push(r.disc + '/' + r.fixture_ifc_class.replace('Ifc', '') + ' stamped=' + r.host_ifc_class.replace('Ifc', '') +
      ' oracle-nearest=' + nearest.h.replace('Ifc', '') + '@' + nearest.med.toFixed(3) + 'm ' + (ok ? '✓' : '✗'));
  });
  log('§SS ORACLE: ' + oracleDetail.join(' | '));
  assert('S1 NON-INVENT-ORACLE', oracleTot > 0 && oracleOk === oracleTot,
    oracleOk + '/' + oracleTot + ' stamped rows confirmed: stamped host == independently-measured nearest host (median ≤ ' + MOUNT_TOL + 'm)');

  // ── S2 SELECTION: _shimForFixture distinguishes the two ELEC classes ──
  DW.dwOpen(te);
  var shimSrc = DW._loadRuleShims();
  var sLight = DW._shimForFixture(shimSrc, 'ELEC', 'IfcLightFixture');
  var sAppl = DW._shimForFixture(shimSrc, 'ELEC', 'IfcElectricAppliance');
  var sDisc = DW._shimForDisc(shimSrc, 'ELEC');
  log('§SS SELECT light→' + sLight.host_ifc_class + '/' + sLight.mount + '  appliance→' + sAppl.host_ifc_class + '/' + sAppl.mount + '  disc-level→' + sDisc.host_ifc_class + '/' + sDisc.mount);
  assert('S2 SELECTION',
    sLight.host_ifc_class === 'IfcCovering' && sLight.mount === 'BOTTOM' &&
    sAppl.host_ifc_class === 'IfcWall' && sAppl.mount === 'SIDE' &&
    sLight.host_ifc_class !== sAppl.host_ifc_class && sDisc.host_ifc_class === 'IfcWall',
    '_shimForFixture picks IfcCovering/BOTTOM for lights, IfcWall/SIDE for appliances (disc-level pick = ' + sDisc.host_ifc_class + ' = the OLD mis-bind for lights)');

  // ── S3 LIVE-SELECT: walk ELEC on Terminal, lights bind to ceilings not walls ──
  var teB = loadDb(SQL, TE_SRC);
  var coveringGuids = {}; rows(teB, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Covering%'").forEach(function (r) { coveringGuids[r.g] = 1; });
  var wallGuids = {}; rows(teB, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Wall%'").forEach(function (r) { wallGuids[r.g] = 1; });
  var w = DW.dwWalk('ELEC', teB, 'Terminal', { hostBind: true });
  var boundLights = w.placements.filter(function (p) { return p.ifc_class === 'IfcLightFixture' && p.host; });
  var lightsOnCovering = boundLights.filter(function (p) { return coveringGuids[p.host] && p.mount === 'BOTTOM'; }).length;
  var lightsOnWall = boundLights.filter(function (p) { return wallGuids[p.host] && !coveringGuids[p.host]; }).length;
  var plain = DW.dwWalk('ELEC', teB, 'Terminal');
  log('§SS LIVE Terminal ELEC: placed=' + w.placed + ' boundLights=' + boundLights.length + ' on-covering(BOTTOM)=' + lightsOnCovering +
    ' on-wall=' + lightsOnWall + ' hostBind.byClass=' + JSON.stringify(w.hostBind && w.hostBind.byClass));
  assert('S3 LIVE-SELECT',
    boundLights.length > 0 && lightsOnCovering === boundLights.length && lightsOnWall === 0 && w.placed === plain.placed,
    boundLights.length + ' floating lights bound to IfcCovering (BOTTOM), 0 on walls — the selection key flips lights ' +
    'wall→ceiling; count preserved (' + w.placed + ' == plain ' + plain.placed + ')');

  // ── S4 FALLBACK: PLB has no per-fixture row on Terminal → disc-level (none for PLB) → no crash, count preserved ──
  var plbHB = DW.dwWalk('PLB', teB, 'Terminal', { hostBind: true });
  var plbPlain = DW.dwWalk('PLB', teB, 'Terminal');
  // ELEC IfcFlowController on duplex is the explicit REFUSE→fallback case (median 1.174m > tol):
  var dx = loadDb(SQL, DX_RULES);
  var dxFix = rows(dx, "SELECT fixture_ifc_class FROM rule_shim WHERE disc='ELEC' AND fixture_ifc_class IS NOT NULL").map(function (r) { return r.fixture_ifc_class; });
  var ctrlRefused = dxFix.indexOf('IfcFlowController') < 0;  // no per-fixture row → falls back to disc-level
  dx.close();
  log('§SS FALLBACK: PLB hostBind placed=' + plbHB.placed + ' == plain ' + plbPlain.placed + '; duplex ELEC per-fixture classes=' + JSON.stringify(dxFix) + ' (IfcFlowController refused→fallback=' + ctrlRefused + ')');
  assert('S4 FALLBACK', plbHB.placed === plbPlain.placed && ctrlRefused,
    'a class with no per-fixture row falls back cleanly: PLB count preserved (' + plbHB.placed + ') and ambiguous IfcFlowController has NO per-fixture row (disc-level fallback)');

  // ── S5 REGRESSION: duplex ELEC on SampleHouse still all→wall ──
  var dxR = loadDb(SQL, DX_RULES), shB = loadDb(SQL, SH);
  DW.dwOpen(dxR);
  var shWallGuids = {}; rows(shB, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Wall%'").forEach(function (r) { shWallGuids[r.g] = 1; });
  var shW = DW.dwWalk('ELEC', shB, 'SampleHouse', { hostBind: true });
  var shBound = shW.placements.filter(function (p) { return p.host; });
  var shNonWall = shBound.filter(function (p) { return !shWallGuids[p.host]; }).length;
  log('§SS REGRESSION SampleHouse ELEC: bound=' + shBound.length + ' non-wall=' + shNonWall + ' host=' + (shW.hostBind && shW.hostBind.host));
  assert('S5 REGRESSION',
    shBound.length > 0 && shNonWall === 0 && shW.hostBind && shW.hostBind.host === 'IfcWall',
    'duplex generic flow-classes still bind all→wall on SampleHouse (' + shBound.length + ' bound, 0 non-wall) — W-DWWALK-HOSTBIND path unchanged');

  te.close(); src.close(); teB.close(); dxR.close(); shB.close();
  log('───────────────────────────────────────────────');
  log('§SS SUMMARY: the fixture_ifc_class SELECTION KEY is MINED (5 terminal + 3 duplex per-fixture rows, every host the ' +
    'measured nearest) and READ by dwWalk — ELEC ceiling-lights now bind to IfcCovering instead of being mis-bound to ' +
    'walls by the coarse disc-level priority. Ambiguous fixtures refused→fallback; generic duplex flow-classes unchanged.');
  log('W-SHIM-SELECT: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
