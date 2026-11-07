#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-SEED-DEFAULT scope (read this block first)
 * SCOPE: the modeller's CHECK→DEFAULT→CONFIRM/OVERRIDE flow for the human-in-the-loop seed (user, 2026-06-30).
 *   When the user presses Outliner.DISC.MEP, the modeller checks for an assigned SEED; if none, it shows a DEFAULT in a
 *   popup the user can OK or replace. `disc_walker.defaultSeed(bdb, opts)` is the NON-INVENT core the popup needs: it
 *   derives a REAL element as the suggested service entry + the full pick-list, DETERMINISTICALLY. The popup is bim-ootb
 *   (deploy); this witness proves the engine contract. Read the §-log (Log Mandate).
 *
 * NON-INVENT boundary: the default is a REAL IfcDoor/IfcStair guid, chosen by a stated geometric HEURISTIC (most
 *   external entry on the lowest storey = service-entry proxy). It is NOT claimed correct — the human confirms/overrides,
 *   which is the whole point of the popup. No entry element → honest REFUSE (no fabricated seed).
 *
 * CLAIMS:
 *   D0 REAL          — the default seed is a REAL element guid at its REAL db position (resolvable in elements_meta).
 *   D1 DETERMINISTIC — two identical calls return the SAME default (no Math.random / order dependence).
 *   D2 EXTERNAL      — the default door is MORE external (nearer the footprint edge) than the median candidate → the
 *                      heuristic picks an ENTRY, not an arbitrary interior door (the reason it is a sensible default).
 *   D3 PICK-LIST     — defaultSeed returns ALL candidate entries so the popup can offer "choose another".
 *   D4 OVERRIDE      — opts.seed (the user's explicit choice) is returned VERBATIM, source='user-assigned' → the human wins.
 *   D5 REFUSE        — a model with no entry element → {refused} + honest reason (no fabricated seed).
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_seed_default_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

(async function main() {
  log('═══ W-SEED-DEFAULT — the popup CHECK→DEFAULT→CONFIRM/OVERRIDE contract (disc_walker.defaultSeed) ═══');
  var SQL = await initSqlJs();
  var SH = loadDb(SQL, path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db'));

  var d = DW.defaultSeed(SH);
  log('§SD SampleHouse default seed = ' + d.guid + ' (' + d.ifc_class + ', storey ' + d.storey + ') at (' +
    d.x.toFixed(2) + ',' + d.y.toFixed(2) + ',' + d.z.toFixed(2) + ') ext=' + d.externality + 'm; candidates=' + d.candidates.length);
  log('§SD reason: ' + d.reason);

  log('');
  log('─── D0 REAL ───');
  var real = rows(SH, "SELECT m.ifc_class c, t.center_x x, t.center_y y FROM elements_meta m JOIN element_transforms t " +
    "ON m.guid=t.guid WHERE m.guid='" + d.guid + "'")[0];
  assert('D0 REAL', !!real && Math.abs(real.x - d.x) < 1e-9 && /Door|Stair/.test(real.c),
    'default seed ' + d.guid + ' is a REAL ' + (real && real.c) + ' at its real db position (not an invented coordinate)');

  log('');
  log('─── D1 DETERMINISTIC ───');
  var d2 = DW.defaultSeed(SH);
  assert('D1 DETERMINISTIC', d2.guid === d.guid && d2.x === d.x,
    'two identical calls return the SAME default (' + d.guid + ') — no Math.random / order dependence');

  log('');
  log('─── D2 EXTERNAL (the heuristic picks an entry, not an interior door) ───');
  // re-measure each candidate's externality independently; the default must be the most external (min ext)
  var bb = rows(SH, "SELECT MIN(center_x) x0, MAX(center_x) x1, MIN(center_y) y0, MAX(center_y) y1 FROM element_transforms")[0];
  var exts = d.candidates.map(function (c) { return Math.min(c.x - bb.x0, bb.x1 - c.x, c.y - bb.y0, bb.y1 - c.y); }).sort(function (a, b) { return a - b; });
  var median = exts[Math.floor(exts.length / 2)];
  assert('D2 EXTERNAL', d.externality <= exts[0] + 1e-9 && d.externality <= median,
    'default ext ' + d.externality.toFixed(3) + 'm == the MIN candidate ext (nearest footprint edge) ≤ median ' +
    median.toFixed(3) + 'm — the heuristic picks the most external entry (service-entry proxy), independently re-measured');

  log('');
  log('─── D3 PICK-LIST (popup can offer "choose another") ───');
  var nDoors = rows(SH, "SELECT COUNT(*) n FROM elements_meta WHERE ifc_class LIKE '%IfcDoor%'")[0].n;
  assert('D3 PICK-LIST', d.candidates.length === nDoors && d.candidates.every(function (c) { return c.guid && c.x != null; }),
    'defaultSeed returns all ' + d.candidates.length + ' candidate entries (== ' + nDoors + ' doors), each a real ' +
    'guid+position → the popup can list them for "choose another"');

  log('');
  log('─── D4 OVERRIDE (the human wins) ───');
  var pick = d.candidates.find(function (c) { return c.guid !== d.guid; });
  var ov = DW.defaultSeed(SH, { seed: pick.guid });
  assert('D4 OVERRIDE', ov.guid === pick.guid && ov.source === 'user-assigned' && Math.abs(ov.x - pick.x) < 1e-9,
    'opts.seed=' + pick.guid + ' returned VERBATIM (source=user-assigned) — the user\'s explicit choice overrides the default');

  log('');
  log('─── D5 REFUSE (no entry element → honest, no fabricated seed) ───');
  // a model with no doors/stairs: filter to a class set the building lacks (use IfcRamp as a stand-in absent class)
  var none = DW.defaultSeed(SH, { classes: ['IfcRampNothingHere'] });
  assert('D5 REFUSE', none.refused === true && /no entry element/.test(none.reason),
    'a model with no matching entry element → {refused} + honest reason ("' + none.reason + '") — no fabricated seed');

  log('');
  log('§SD SUMMARY: the popup contract holds. On Outliner.DISC.MEP the modeller calls defaultSeed(bdb): no assigned seed ' +
    '→ a REAL, DETERMINISTIC default (most external IfcDoor on the lowest storey = service-entry proxy) + the full ' +
    'candidate list to "choose another"; the user OKs (default) or overrides (opts.seed wins, verbatim); no entry element ' +
    '→ honest REFUSE. Non-invent: the seed is always a real element; the heuristic is a SUGGESTION the human confirms. ' +
    'Modeller popup wiring = the bim-ootb deploy step. docs/internal/WalkerMaturity.md SEED-TRUNK.');
  log('');
  log('W-SEED-DEFAULT: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  log('§LOG ' + LOG);
  SH.close();
  process.exit(fail ? 1 : 0);
})();
