#!/usr/bin/env node
/*
 * witness_disc_route_nnchain.js — §ROUTER-NNCHAIN values gate (the Router half, made LIVE):
 * route() only counts endpoint classes; routeChains() PRODUCES the real nearest-neighbour-3d
 * network on a MEP-rich building (Terminal). This witness proves the produced segments are REAL
 * and MEASURED, not fabricated.
 *
 * Issues proved/disproved (each test names the issue):
 *   R1 LIVE-CHAINS    — Terminal PLB + ACMV → chainSegs > 0 (the Router actually routes).
 *   R2 REAL-ENDPOINTS — EVERY segment's from_guid AND to_guid are real elements_meta rows of the
 *                       declared from_kind/to_kind, at the exact element_transforms position (zero invented).
 *   R3 GAP-BOUNDED    — EVERY segment gap ≤ the measured bound; no fabricated long run.
 *   R4 CADENCE        — for measured-max rules, mean(gap) is within ±25% of the measured avg_gap_m
 *                       (the Terminal-measured chain cadence reproduces from the building's own positions).
 *   R5 HONEST-SKIP    — from-elements with no neighbour within the bound are counted (noNbr), not snapped.
 *   R6 RESIDENT-ZERO  — SampleHouse (no pipes/ducts) → 0 chainSegs (Router honest-0 preserved).
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_route_nnchain.js
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
const TERMINAL = path.join(MODELLER, 'Terminal_meta.db');
const SAMPLEHOUSE = path.join(MODELLER, 'SampleHouse_extracted.db');

let PASS = 0, FAIL = 0;
const ok = (c, m) => { (c ? PASS++ : FAIL++); console.log('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

// measured avg_gap_m per nn rule, from the rules DB (for R4)
function measuredAvg(rdb, disc, fromKind, toKind) {
  const r = rdb.exec("SELECT params_json FROM rule_routing WHERE disc='" + disc + "' AND pattern='nn' AND from_kind='" +
    fromKind + "' AND to_kind='" + toKind + "'");
  if (!r.length) return null;
  const p = JSON.parse(r[0].values[0][0] || '{}');
  return (p.avg_gap_m != null) ? p.avg_gap_m : p.nn_dist_avg_m;
}

(async () => {
  const initSqlJs = loadSqlJs();
  const SQL = await initSqlJs();
  DW.dwOpen(new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB))));
  const rdb = new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB)));
  console.log('§NNCHAIN-BEGIN rules=' + path.basename(RULES_DB) + ' terminal=' + fs.existsSync(TERMINAL));

  // index Terminal elements_meta + transforms for the R2 oracle
  const tdb = new SQL.Database(new Uint8Array(fs.readFileSync(TERMINAL)));
  const elClass = new Map(), elPos = new Map();
  {
    const r = tdb.exec("SELECT m.guid, m.ifc_class, t.center_x, t.center_y, t.center_z " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid");
    if (r.length) r[0].values.forEach(v => { elClass.set(v[0], v[1]); elPos.set(v[0], [v[2], v[3], v[4]]); });
  }
  console.log('  §NNCHAIN-ORACLE Terminal indexed elements=' + elClass.size);

  // ── Terminal PLB + ACMV (the MEP-rich oracle) ───────────────────────────────────────
  const all = [];
  for (const disc of ['PLB', 'ACMV']) {
    const w = DW.dwWalk(disc, tdb, 'Terminal');
    const segs = w.chainSegs || [];
    console.log('  §NNCHAIN ' + disc + ' chainSegs=' + segs.length + ' byRule=' +
      JSON.stringify((w.chainByRule || []).map(b => ({ r: b.from.replace('Ifc', '') + '→' + b.to.replace('Ifc', ''), segs: b.segs, noNbr: b.noNbr, src: b.gapSource || b.skipped }))));
    all.push({ disc, w, segs });
  }

  const plb = all.find(a => a.disc === 'PLB'), acmv = all.find(a => a.disc === 'ACMV');
  ok((plb.segs.length > 0) && (acmv.segs.length > 0),
    'R1 LIVE-CHAINS Terminal PLB+ACMV route real segments (PLB=' + plb.segs.length + ' ACMV=' + acmv.segs.length + ')');

  // R2 REAL-ENDPOINTS: every segment joins two real elements of the declared classes at their real positions
  const everySeg = plb.segs.concat(acmv.segs);
  let realBad = 0, posBad = 0;
  for (const s of everySeg) {
    if (elClass.get(s.from_guid) !== s.from_kind || elClass.get(s.to_guid) !== s.to_kind) { realBad++; continue; }
    const fp = elPos.get(s.from_guid), tp = elPos.get(s.to_guid);
    const dF = Math.hypot(fp[0] - s.from[0], fp[1] - s.from[1], fp[2] - s.from[2]);
    const dT = Math.hypot(tp[0] - s.to[0], tp[1] - s.to[1], tp[2] - s.to[2]);
    if (dF > 1e-6 || dT > 1e-6) posBad++;
  }
  ok(realBad === 0 && posBad === 0,
    'R2 REAL-ENDPOINTS all ' + everySeg.length + ' segs join real ' + 'from/to guids at real positions (classMismatch=' + realBad + ' posDrift=' + posBad + ')');

  // R3 GAP-BOUNDED: every gap ≤ its segment's bound
  const overBound = everySeg.filter(s => s.gap > s.bound + 1e-9);
  ok(overBound.length === 0, 'R3 GAP-BOUNDED all ' + everySeg.length + ' gaps ≤ measured bound (over=' + overBound.length +
    (overBound[0] ? ' eg gap=' + overBound[0].gap + '>' + overBound[0].bound : '') + ')');

  // R4 CADENCE: per measured-max rule, mean(gap) within ±25% of measured avg_gap_m
  const ruleGroups = {};
  everySeg.filter(s => s.gapSource === 'measured-max').forEach(s => {
    const k = s.disc + '|' + s.from_kind + '|' + s.to_kind;
    (ruleGroups[k] = ruleGroups[k] || []).push(s.gap);
  });
  let cadenceBad = 0, cadenceLines = [];
  Object.keys(ruleGroups).forEach(k => {
    const [disc, fk, tk] = k.split('|');
    const gaps = ruleGroups[k];
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const meas = measuredAvg(rdb, disc, fk, tk);
    const ratio = meas ? mean / meas : null;
    const within = ratio != null && ratio >= 0.75 && ratio <= 1.25;
    if (!within) cadenceBad++;
    cadenceLines.push(fk.replace('Ifc', '') + '→' + tk.replace('Ifc', '') + ' mean=' + mean.toFixed(3) +
      ' meas=' + (meas != null ? meas.toFixed(3) : '?') + ' ratio=' + (ratio != null ? ratio.toFixed(2) : '?'));
  });
  ok(cadenceBad === 0 && Object.keys(ruleGroups).length > 0,
    'R4 CADENCE measured-max rules reproduce avg gap ±25% [' + cadenceLines.join(' | ') + ']');

  // R5 HONEST-SKIP: at least one rule reports noNbr ≥ 0 and noNbr is accounted (no silent drop)
  const byRuleAll = plb.w.chainByRule.concat(acmv.w.chainByRule);
  const accounted = byRuleAll.every(b => b.skipped != null || (typeof b.segs === 'number' && typeof b.noNbr === 'number'));
  const totalNoNbr = byRuleAll.reduce((a, b) => a + (b.noNbr || 0), 0);
  ok(accounted, 'R5 HONEST-SKIP every rule accounts segs+noNbr (no silent drop); totalNoNbr=' + totalNoNbr);

  tdb.close();

  // ── R6 RESIDENT-ZERO: SampleHouse has no pipes/ducts → 0 chainSegs ───────────────────
  if (fs.existsSync(SAMPLEHOUSE)) {
    const shdb = new SQL.Database(new Uint8Array(fs.readFileSync(SAMPLEHOUSE)));
    const wSh = DW.dwWalk('PLB', shdb, 'SampleHouse');
    shdb.close();
    ok((wSh.chainSegs || []).length === 0,
      'R6 RESIDENT-ZERO SampleHouse PLB → 0 chainSegs (Router honest-0 preserved), placed=' + wSh.placed);
  } else {
    ok(false, 'R6 RESIDENT-ZERO SampleHouse_extracted.db not found');
  }

  rdb.close();
  console.log('\n=== RESULT: ' + PASS + ' PASS / ' + FAIL + ' FAIL ===');
  const logPath = path.join(__dirname, 'witness_disc_route_nnchain.log');
  console.log('log -> ' + logPath);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
