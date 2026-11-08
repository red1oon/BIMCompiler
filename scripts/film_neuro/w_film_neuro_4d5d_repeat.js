#!/usr/bin/env node
// W-FILM-NEURO-4D5D-REPEAT — spec: bim-compiler prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §16.4.
// Issue it proves or disproves: the film's beat 0c may say "same every time" for the 4D schedule, the 5D cost
// and the on-screen overlays only if two independent runs of the shipped pipeline give the same bytes.
// Inputs: two run.json files written by bim-ootb scripts/cache_4d_run.js into two EMPTY CACHE_4D_DIR roots.
// Verdicts: PASS (all equal, populations non-empty) · FAIL (any differ) · INCONCLUSIVE (empty population, or a
// part could not be computed). Falsifier: REPEAT_BREAK=1 moves one played instant of run B by 1 ms; must FAIL.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const OOTB = process.env.OOTB || path.join(process.env.HOME, 'bim-ootb');
const [fa, fb] = process.argv.slice(2);
if (!fa || !fb) { console.error('usage: w_film_neuro_4d5d_repeat.js <runA/run.json> <runB/run.json>'); process.exit(2); }
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const A = JSON.parse(fs.readFileSync(fa, 'utf8')), B = JSON.parse(fs.readFileSync(fb, 'utf8'));
if (process.env.REPEAT_BREAK === '1') { const g = Object.keys(B.play)[0]; B.play[g].s += 1; console.log('§W_REPEAT_FALSIFIER moved play[' + g + '].s by 1 ms in run B'); }
let fail = 0, inconc = 0;
const verdict = (part, a, b, n) => {
  const v = n === 0 ? 'INCONCLUSIVE' : (a === b ? 'SAME' : 'DIFFER');
  if (v === 'DIFFER') fail++; if (v === 'INCONCLUSIVE') inconc++;
  console.log('§W_REPEAT part=' + part + ' n=' + n + ' A=' + a + ' B=' + b + ' ' + v);
};
// 1. 4D: every persisted layer, byte for byte (builtAt is the only field allowed to differ: a clock, not a result).
for (const k of ['els', 'tasks', 'sched', 'play', 'playStats', 'storeys']) {
  const n = A[k] == null ? 0 : (Array.isArray(A[k]) ? A[k].length : Object.keys(A[k]).length);
  verdict('4D.' + k, sha(JSON.stringify(A[k])), sha(JSON.stringify(B[k])), n);
}
// 2. The pipeline's own §-log, line by line.
const la = fs.readFileSync(path.join(path.dirname(fa), 'witness.log'), 'utf8').split('\n');
const lb = fs.readFileSync(path.join(path.dirname(fb), 'witness.log'), 'utf8').split('\n');
// Elapsed-time fields are clocks, not results: orderMs=, compileMs=, ms={...}. Masked, and the masked count is printed.
const CLOCK = /\b(\w*Ms|ms)=(\{[^}]*\}|\d+)/g, mask = l => (l || '').replace(CLOCK, '$1=<clock>');
let diffLines = 0, clockOnly = 0;
for (let i = 0; i < Math.max(la.length, lb.length); i++) { if (la[i] === lb[i]) continue; if (mask(la[i]) === mask(lb[i])) clockOnly++; else diffLines++; }
console.log('§W_REPEAT part=log lines=' + la.length + '/' + lb.length + ' differing=' + diffLines + ' clock_only=' + clockOnly + ' (elapsed-time fields masked) ' + (diffLines ? 'DIFFER' : 'SAME'));
if (diffLines) fail++;
// 3. 5D: §HR_COST. ⚠ FORMULA COPY of viewer/tm_gantt_build.js:451-506 (the viewer computes it inside injectGantt,
// which this harness does not run): personDays = Σ installSecs/basis × crew_size; cost = personDays × rate_per_day.
const sb = { console: { log() {}, warn() {}, error() {} } }; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(OOTB, 'viewer', 'rates.js'), 'utf8'), sb);
const LR = sb.LABOR_RATES;
function hrCost(els) {
  const basis = LR._productivity_basis_secs || 28800, cwd = {};
  els.forEach(e => { const r = e.resource || '_DEFAULT'; cwd[r] = (cwd[r] || 0) + (e.installSecs || 0) / basis; });
  let tot = 0, pd = 0, trades = 0;
  for (const r in cwd) { const R = LR[r]; if (!R || !R.rate_per_day) continue; const p = cwd[r] * (R.crew_size || 1); tot += p * R.rate_per_day; pd += p; trades++; }
  return { total: Math.round(tot), personDays: +pd.toFixed(1), trades };
}
const ha = hrCost(A.els), hb = hrCost(B.els);
console.log('§W_REPEAT_HR_COST A total=' + ha.total + ' personDays=' + ha.personDays + ' trades=' + ha.trades + ' | B total=' + hb.total + ' personDays=' + hb.personDays + ' trades=' + hb.trades + ' (formula copy, tm_gantt_build.js:451-506)');
verdict('5D.hr_cost', JSON.stringify(ha), JSON.stringify(hb), ha.trades);
// 4. Overlays: the SHIPPED A.costOdometerAt (viewer/cpe_resource_panel.js:168-181) at every day of the played layer.
function overlay(run, hc) {
  const win = { LABOR_RATES: LR }, Ast = { _hrCost: hc, LABOR_RATES: LR };
  const ctx = { window: win, console: { log() {}, warn() {}, error() {} }, Math: Math, Date: Date };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(OOTB, 'viewer', 'cpe_resource_panel.js'), 'utf8'), ctx);
  ctx.setupCpeResourcePanel(Ast);
  if (typeof Ast.costOdometerAt !== 'function') return null;
  const ops = Object.values(run.play).map(o => ({ s: o.s, e: o.e })).sort((x, y) => x.s - y.s);
  const t0 = ops[0].s, t1 = Math.max.apply(null, ops.map(o => o.e)), DAY = 86400000, rows = [];
  for (let c = t0; c <= t1 + DAY; c += DAY) { const o = Ast.costOdometerAt(c, ops, t0, t1); rows.push([o.day, o.placed, o.costToDate, o.hoursToDate]); }
  return rows;
}
let oa = null, ob = null;
try { oa = overlay(A, ha); ob = overlay(B, hb); } catch (e) { console.log('§W_REPEAT_OVERLAY_ERR ' + e.message); }
if (!oa || !ob) { console.log('§W_REPEAT part=overlay INCONCLUSIVE reason=costOdometerAt not reachable'); inconc++; }
else {
  const last = oa[oa.length - 1];
  console.log('§W_REPEAT_OVERLAY days=' + oa.length + ' final day=' + last[0] + ' placed=' + last[1] + ' cost=' + last[2] + ' hours=' + last[3]);
  verdict('overlay.day_placed_cost', sha(JSON.stringify(oa)), sha(JSON.stringify(ob)), oa.length);
  if (process.env.SERIES_OUT) { fs.writeFileSync(process.env.SERIES_OUT, JSON.stringify({ note: 'costToDate per day, shipped A.costOdometerAt, two independent runs', A: oa.map(r => r[2]), B: ob.map(r => r[2]) })); console.log('§W_REPEAT_SERIES_OUT ' + process.env.SERIES_OUT); }
}
const v = fail ? 'FAIL' : (inconc ? 'INCONCLUSIVE' : 'PASS');
console.log('§W_FILM_NEURO_4D5D_REPEAT verdict=' + v + ' differ=' + fail + ' inconclusive=' + inconc + ' bld=' + A.bld + ' db=' + A.dbFile + ' codeKey=' + A.codeKey + '/' + B.codeKey);
process.exit(fail ? 1 : 0);
