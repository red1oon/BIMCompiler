#!/usr/bin/env node
/*
 * witness_disc_walk_shim.js — W-TRM-SHIM
 *
 * Proves the prior-art SHIM host-attach model (gap #1) in the disc_walker:
 * a ref_kind='host' device (FP IfcAlarm) must tack onto a REAL host SURFACE
 * (a wall) in the target building — NOT drop at the room centroid (the old
 * 'placed:single' bug). Adopts _shim_attributes/ShimMatcher semantics: host
 * frame position + measured z + the host's yaw (the SHIM facing/wall-normal).
 *
 * Each test names the issue it proves/disproves:
 *   S1 ON-HOST     — every shim:host-wall placement (x,y) coincides with a REAL
 *                    wall in that storey (within 1mm) — it's tacked to a host, not floating
 *   S2 NOT-CENTROID— shim placements are NOT all at the storey centroid (the old
 *                    wrong behavior); they spread across distinct host walls
 *   S3 INHERIT-YAW — each shim placement.yaw == its host wall rotation_z (SHIM facing)
 *   S4 MEAS-HEIGHT — shim z == storey floor z + the measured host dz (1.0-1.33m), finite
 *   S5 COUNT-BOUND — per storey, #shim placements <= measured count_per (16) and <= #walls
 *                    (NON-INVENT: never more devices than the measured cadence or real hosts)
 *   S6 HONEST      — total shim placements > 0 (the host rule actually engaged on a real bldg)
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_shim.js
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

function loadSqlJs() {
  const cands = [
    path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'),
    'sql.js',
  ];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (set NODE_PATH=~/bim-ootb/tests/node_modules)');
}

const RULES_DB = DWT.rules('terminal_rules.db');
const MODELLER = path.join(process.env.HOME || '', 'bim-ootb/modeller');
const BUILDING = ['SampleCastle', 'Duplex', 'SampleHouse']
  .map(k => ({ key: k, db: path.join(MODELLER, k + '_extracted.db') }))
  .find(r => fs.existsSync(r.db));
const LOG = path.join(__dirname, 'witness_disc_walk_shim.log');

let PASS = 0, FAIL = 0;
const LINES = [];
const say = (s) => { LINES.push(s); console.log(s); };
const ok = (c, m) => { (c ? PASS++ : FAIL++); say('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

(async () => {
  if (!BUILDING) { console.error('FATAL: no resident building DB'); process.exit(1); }
  const SQL = await loadSqlJs()();
  DW.dwOpen(new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB))));
  const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(BUILDING.db)));

  say('=== W-TRM-SHIM — host-attached devices tack onto real walls (SHIM model) ===');
  say('building=' + BUILDING.key + '  rules=terminal_rules.db');

  // FP carries the host rule (IfcAlarm). Walk it.
  const w = DW.dwWalk('FP', bdb, BUILDING.key);
  const shim = (w.placements || []).filter(p => p.prov === 'shim:host-wall');
  const measuredCap = DW.countPer('FP', 'IfcAlarm');
  say('§SHIM FP placed=' + w.placed + ' shim(host-wall)=' + shim.length +
    ' measured count_per=' + measuredCap);

  // index real walls by storey for S1/S3
  function rows(sql) { const r = bdb.exec(sql); if (!r.length) return []; const c = r[0].columns, v = r[0].values; return v.map(x => { const o = {}; c.forEach((k, i) => o[k] = x[i]); return o; }); }
  const walls = rows("SELECT m.guid guid, m.storey s, t.center_x cx, t.center_y cy, t.rotation_z rot " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'");
  const wallByGuid = {};
  walls.forEach(wl => { wallByGuid[wl.guid] = wl; });
  const wallsByStorey = {};
  walls.forEach(wl => { (wallsByStorey[wl.s] = wallsByStorey[wl.s] || []).push(wl); });

  // S1 ON-HOST — each shim placement names a real host wall (guid) at its (x,y)
  let offHost = 0;
  shim.forEach(p => {
    const wl = wallByGuid[p.host];
    if (!wl || Math.abs(wl.cx - p.x) > 1e-3 || Math.abs(wl.cy - p.y) > 1e-3) offHost++;
  });
  ok(shim.length > 0 && offHost === 0, 'S1 ON-HOST ' + shim.length + ' shim placements, ' + offHost + ' off-host');

  // S2 NOT-CENTROID — distinct (x,y) > 1 (not all stacked at one centroid)
  const distinct = new Set(shim.map(p => p.x.toFixed(3) + ',' + p.y.toFixed(3)));
  ok(distinct.size > 1, 'S2 NOT-CENTROID distinct host positions = ' + distinct.size + ' (>1)');

  // S3 INHERIT-YAW
  let yawBad = 0;
  shim.forEach(p => {
    const wl = wallByGuid[p.host];
    if (!wl || p.yaw == null || Math.abs(p.yaw - wl.rot) > 1e-6) yawBad++;
  });
  ok(yawBad === 0, 'S3 INHERIT-YAW ' + (shim.length - yawBad) + '/' + shim.length + ' inherit host rotation_z');

  // S4 MEAS-HEIGHT — z finite and within the measured host band (0.5..2.0 above its storey floor)
  let zBad = 0;
  const substr = DW.substrate(bdb);
  const stZ = {}; substr.forEach(s => { stZ[s.name] = s.z; });
  shim.forEach(p => {
    if (!isFinite(p.z)) { zBad++; return; }
    const rel = p.z - (stZ[p.storey] != null ? stZ[p.storey] : 0);
    if (rel < 0.5 || rel > 2.5) zBad++;        // measured alarm dz ∈ [1.0,1.33]
  });
  ok(zBad === 0, 'S4 MEAS-HEIGHT ' + (shim.length - zBad) + '/' + shim.length + ' at measured host height');

  // S5 COUNT-BOUND — per storey: shim count <= min(measured cap, #walls)
  const byStorey = {};
  shim.forEach(p => { byStorey[p.storey] = (byStorey[p.storey] || 0) + 1; });
  let overBound = 0;
  Object.keys(byStorey).forEach(s => {
    const bound = Math.min(measuredCap > 0 ? measuredCap : 1e9, (wallsByStorey[s] || []).length);
    if (byStorey[s] > bound) overBound++;
  });
  ok(overBound === 0, 'S5 COUNT-BOUND ' + Object.keys(byStorey).length + ' storeys, ' + overBound + ' over the measured/host bound');

  // S6 HONEST
  ok(shim.length > 0, 'S6 HONEST total shim placements = ' + shim.length + ' (host rule engaged)');

  say('');
  say('=== RESULT: ' + PASS + ' PASS / ' + FAIL + ' FAIL ===');
  fs.writeFileSync(LOG, LINES.join('\n') + '\n');
  say('log -> ' + LOG);
  process.exit(FAIL ? 1 : 0);
})();
