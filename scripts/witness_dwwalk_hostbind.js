#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-DWWALK-HOSTBIND scope (read this block first)
 * SCOPE: the host-bind anti-float fix in the LIVE WALK, now DEFAULT-ON (§SHIM-SELECT, 2026-06-30). `dwWalk` (the
 *   Outliner "Walk · Disciplines" entry point) used to place ELEC at floating footprint-cell centres; it now snaps
 *   each floating placement onto its MEASURED host BY DEFAULT (no opts needed), COUNT-PRESERVED (bound ∪ refused,
 *   refusals kept floating + counted). The per-fixture-ifc_class SELECTION KEY removed the mis-bind risk that kept
 *   this opt-in (wall-outlets→IfcWall, ceiling-lights→IfcCovering). `{noHostBind:true}` (or `{hostBind:false}`)
 *   restores the raw floating generation — the escape hatch the generation-count witnesses use.
 *
 *   The shim flows as a first-class PROJECTED rule (`rule_shim` in the *_rules.db, read directly by dwWalk). Percepts
 *   trace to disc_patterns.db `_shim_attributes` (physically library/ERP.db until the rename slice lands).
 *   NON-INVENT: walls are REAL SampleHouse geometry; the host is the MEASURED nearest, never guessed; refusals are
 *   counted, never fabricated onto a host. Read the §-log after the run; exit code is not the evidence.
 *
 * CLAIMS:
 *   W0 PERCEPT-SOURCE — the ELEC wall percept is read from disc_patterns.db `_shim_attributes` (host=IfcWall,SIDE).
 *   W1 RAW-FLOAT      — dwWalk('ELEC', SH, {noHostBind:true}) restores the raw floating generation: deterministic,
 *                       hostBind=null, most placements floating (the pre-host-bind defect, via the escape hatch).
 *   W2 DEFAULT-HOSTBIND — dwWalk('ELEC', SH) with NO opts now anti-floats by default: float↓, every bound point on a
 *                       real wall within reach, result.hostBind populated.
 *   W3 COUNT-ACCOUNTED — every raw device is accounted for: placed + refused = raw, and bound + unhosted + not judged + refused = input
 *                       (WalkerDoctrine §4). A wall row with no host is refused, not left floating.
 *   W4 NO-SHIM-NOOP   — dwWalk for a discipline with NO matching shim (PLB) is not judged: same devices as the raw walk, except band duct or
 *                       pipe pieces with no main, which are refused as no-main (bim-ootb prompts/DISC_WALK_DRAWN_MAINS.md §9.2).
 *   W5 PROJECTION-SRC — dwWalk('ELEC', SH, {hostBind:true}) reads the `rule_shim` table projected into the *_rules.db
 *                       (the §SHIM first-class flow) and binds identically to the default walk.
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
var SH = path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db');
var LOG = path.join(ROOT, 'logs', 'witness_dwwalk_hostbind_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) { if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); } else { fail++; log('  ❌ ' + claim + ' — ' + detail); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function median(a) { if (!a.length) return Infinity; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
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
  log('═══ W-DWWALK-HOSTBIND — dwWalk applies the host-bind percept in the LIVE walk (count-preserved, opt-in) ═══');
  var SQL = await initSqlJs();

  // ── W0 PERCEPT-SOURCE ──
  var dp = loadDb(SQL, DISC_PATTERNS);
  var shimRow = rows(dp, "SELECT * FROM _shim_attributes WHERE product_value LIKE 'ELEC%WALL%'")[0];
  dp.close();
  log('§DWHB percept(disc_patterns._shim_attributes): ' + (shimRow ? JSON.stringify(shimRow) : 'MISSING'));
  assert('W0 PERCEPT-SOURCE', !!shimRow && /Wall/i.test(shimRow.host_ifc_class) && /SIDE/i.test(shimRow.mount),
    shimRow ? ('ELEC wall percept host=' + shimRow.host_ifc_class + ' mount=' + shimRow.mount + ' (prior-art, not invented)') : 'no ELEC wall percept');
  var shims = [shimRow];                                       // pass the raw _shim_attributes row(s) straight to dwWalk

  var rdb = loadDb(SQL, RULES), sh = loadDb(SQL, SH);
  DW.dwOpen(rdb);
  var walls = rows(sh, "SELECT m.guid g, t.center_x x, t.center_y y, t.bbox_x bx, t.bbox_y by_ FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'");
  var wallThick = median(walls.map(function (w) { return Math.min(w.bx, w.by_); }));
  var wallGuids = {}; rows(sh, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Wall%'").forEach(function (r) { wallGuids[r.g] = 1; });

  // ── RAW floating generation = {noHostBind:true} (the layer host-bind refines; restores pre-§SHIM-SELECT walk) ──
  var raw = DW.dwWalk('ELEC', sh, 'SampleHouse', { noHostBind: true });
  var rawFloat = raw.placements.map(function (p) { return distToWalls(p, walls, sh); }).filter(function (d) { return d > 0.6; }).length;
  log('§DWHB RAW dwWalk ELEC {noHostBind}: placed=' + raw.placed + ' float=' + rawFloat + ' hostBind=' + raw.hostBind);

  // ── W1 RAW-FLOAT: {noHostBind:true} restores the raw floating generation (the defect the live walk now fixes) ──
  var raw2 = DW.dwWalk('ELEC', sh, 'SampleHouse', { noHostBind: true });
  assert('W1 RAW-FLOAT', raw2.placed === raw.placed && !raw.hostBind && rawFloat > raw.placed * 0.5,
    '{noHostBind} = deterministic raw generation: placed=' + raw.placed + ' (== ' + raw2.placed + '), hostBind=null, ' +
    rawFloat + '/' + raw.placed + ' floating (the pre-host-bind defect, reachable via the escape hatch)');

  // ── W2 DEFAULT-HOSTBIND: dwWalk('ELEC', SH) with NO opts now anti-floats BY DEFAULT (§SHIM-SELECT default-on) ──
  var def = DW.dwWalk('ELEC', sh, 'SampleHouse');
  var defFloat = def.placements.map(function (p) { return distToWalls(p, walls, sh); }).filter(function (d) { return d > 0.6; }).length;
  var bound = def.placements.filter(function (p) { return p.host; });
  var badHost = bound.filter(function (p) { return !wallGuids[p.host] || p.snapDist > 6; }).length;
  log('§DWHB DEFAULT dwWalk ELEC (no opts): placed=' + def.placed + ' bound=' + (def.hostBind && def.hostBind.bound) +
    ' refused=' + (def.hostBind && def.hostBind.refused) + ' float=' + defFloat + ' median-bound-dist=' +
    median(bound.map(function (p) { return distToWalls(p, walls, sh); })).toFixed(3) + 'm');
  assert('W2 DEFAULT-HOSTBIND',
    !!def.hostBind && def.hostBind.bound > 0 && defFloat < rawFloat && badHost === 0,
    'the LIVE walk host-binds by default: ' + def.hostBind.bound + ' bound to real walls (0 bad), float ' + rawFloat + '→' + defFloat +
    ', host=' + def.hostBind.host);

  // ── W3 COUNT-ACCOUNTED ──
  var defA = def.refusedNoHost;
  assert('W3 COUNT-ACCOUNTED',
    def.placed + defA.refused === raw.placed && defA.bound + defA.unhosted + defA.notJudged + defA.refused === defA.input && defA.input > 0,
    'every device accounted for: placed ' + def.placed + ' + refused ' + defA.refused + ' == raw ' + raw.placed + ' (bound ' + defA.bound +
    ' + unhosted ' + defA.unhosted + ' + not judged ' + defA.notJudged + ' + refused ' + defA.refused + ' == input ' + defA.input + ')');

  // ── W4 NO-SHIM-NOOP: PLB has no matching shim → not judged, same as {noHostBind}, apart from pieces with no main ──
  var plbDef = DW.dwWalk('PLB', sh, 'SampleHouse');
  var plbRaw = DW.dwWalk('PLB', sh, 'SampleHouse', { noHostBind: true });
  log('§DWHB PLB no-shim: default placed=' + plbDef.placed + ' raw placed=' + plbRaw.placed + ' hostBind=' + plbDef.hostBind);
  assert('W4 NO-SHIM-NOOP',
    plbDef.placed + plbDef.refusedNoHost.noMain === plbRaw.placed && plbDef.refusedNoHost.notJudged === plbDef.placed && !plbDef.hostBind,
    'a discipline with no matching shim is not judged: PLB placed=' + plbDef.placed + ' (not judged ' + plbDef.refusedNoHost.notJudged + ') + no-main ' + plbDef.refusedNoHost.noMain + ' == ' + plbRaw.placed + ', hostBind=null');

  // ── W5 PROJECTION-SOURCE: opts.hostBind=true (NO caller shims) → dwWalk reads the projected rule_shim table ──
  var nShimRows = rows(rdb, "SELECT COUNT(*) c FROM rule_shim")[0].c;
  var projWalk = DW.dwWalk('ELEC', sh, 'SampleHouse', { hostBind: true });   // source = rule_shim projection, not caller
  var projBound = projWalk.placements.filter(function (p) { return p.host; });
  var projBad = projBound.filter(function (p) { return !wallGuids[p.host]; }).length;
  log('§DWHB PROJECTION dwWalk ELEC {hostBind:true}: rule_shim rows=' + nShimRows + ' bound=' +
    (projWalk.hostBind && projWalk.hostBind.bound) + ' percept=' + (projWalk.hostBind && projWalk.hostBind.percept) +
    ' (read from the *_rules.db projection, no caller shims)');
  assert('W5 PROJECTION-SOURCE',
    nShimRows > 0 && !!projWalk.hostBind && projWalk.hostBind.bound === def.hostBind.bound && projBad === 0 &&
    /Wall/i.test(projWalk.hostBind.host),
    'dwWalk reads the projected rule_shim (' + nShimRows + ' rows): {hostBind:true} binds ' + projWalk.hostBind.bound +
    ' (== default ' + def.hostBind.bound + ') to real walls, 0 bad — §SHIM flows like routing/placement, no caller plumbing');

  rdb.close(); sh.close();
  log('───────────────────────────────────────────────');
  log('§DWHB SUMMARY: dwWalk anti-floats in the LIVE walk BY DEFAULT (§SHIM-SELECT default-on): ELEC float ' + rawFloat + '/' + raw.placed +
    ' → ' + defFloat + ', count preserved, SOURCED FROM THE PROJECTED rule_shim table (per-fixture selection key picks ' +
    'the right host: wall-outlets→IfcWall, ceiling-lights→IfcCovering). {noHostBind:true} restores the raw floating ' +
    'generation (W1, the escape hatch the generation-count witnesses use).');
  log('W-DWWALK-HOSTBIND: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
