#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY gate probe for prompts/4D_MODEL_INTEGRITY.md §Q.6 ORDER OF WORK.
// Proves or disproves, per step of D2/D5/D1/D3/D4, that the step did not break what it must not:
//   gate 2  played-layer midair per NON-beam class does not rise  (§STEP_GATE_MIDAIR_CLS, compare two dirs)
//   gate 3  stacking: elements in piles >= 20 at one start minute  (§STEP_GATE_STACK, BIMEyes §S14.2's measure)
//   gate 5  programme length: §AUTHOR_TPL totalDays, read from the persisted witness.log, never recomputed
// Reads ONLY the persisted cache (run.json playStats.midairPlayedGuids = the shipped judge's verdict,
// witness.log = the shipped §-lines; PRIMAL LAW 3+5). Read the log after every run; it changes nothing.
// usage: node scripts/probe_4d_step_gates.js <beforeDir> <afterDir> [<beforeDir> <afterDir> ...]
const fs = require('fs'), path = require('path');
const one = dir => {
  const r = JSON.parse(fs.readFileSync(path.join(dir, 'run.json')));
  const log = fs.readFileSync(path.join(dir, 'witness.log'), 'utf8');
  const cls = {}; r.els.forEach(e => { cls[e.guid] = e.cls; });
  const mid = {}; (r.playStats.midairPlayedGuids || []).forEach(g => { const c = cls[g] || '?'; mid[c] = (mid[c] || 0) + 1; });
  const piles = {}; Object.values(r.play).forEach(p => { const m = Math.floor(p.s / 60000); piles[m] = (piles[m] || 0) + 1; });
  let max = 0, in20 = 0, n20 = 0; Object.values(piles).forEach(c => { if (c > max) max = c; if (c >= 20) { in20 += c; n20++; } });
  const td = (log.match(/§AUTHOR_TPL [^\n]*totalDays=(\d+)/) || [])[1];
  const gate = (log.match(/§CELL_GATE [^\n]*repr=([\d.]+)%[^\n]*path=(\w+)/) || []);
  const nos = (log.match(/§STRUCT_NO_SUPPORT n=(\d+)/g) || []).map(s => +s.split('=')[1]);
  return { bld: r.bld, codeKey: r.codeKey, midair: r.playStats.midairPlayed, judged: r.playStats.midairPlayedJudged,
           mid, max, in20, n20, td, repr: gate[1], path: gate[2], nos };
};
const a = process.argv.slice(2);
if (!a.length || a.length % 2) { console.log('§STEP_GATE usage: <beforeDir> <afterDir> pairs — INCONCLUSIVE, nothing judged'); process.exit(2); }
let red = 0;
for (let i = 0; i < a.length; i += 2) {
  const B = one(a[i]), A = one(a[i + 1]);
  console.log('§STEP_GATE ' + B.bld + ' before=' + B.codeKey + ' after=' + A.codeKey + ' midairPlayed ' + B.midair + ' -> ' + A.midair +
    ' (judged ' + B.judged + ' -> ' + A.judged + ')' + (A.judged ? '' : ' INCONCLUSIVE — after-run judged nothing'));
  const rises = [];
  new Set([...Object.keys(B.mid), ...Object.keys(A.mid)]).forEach(c => {
    const b = B.mid[c] || 0, x = A.mid[c] || 0;
    if (c !== 'IfcBeam' && x > b) rises.push(c + ' ' + b + '->' + x);
  });
  const ch = [...new Set([...Object.keys(B.mid), ...Object.keys(A.mid)])].filter(c => (B.mid[c] || 0) !== (A.mid[c] || 0))
    .map(c => c + ' ' + (B.mid[c] || 0) + '->' + (A.mid[c] || 0)).join(' · ') || 'none';
  console.log('   §STEP_GATE_MIDAIR_CLS changed: ' + ch + ' | non-beam rises: ' + (rises.join(' · ') || 'none') + ' ' + (rises.length ? 'RED' : 'GREEN'));
  const stackRed = A.in20 > B.in20;
  console.log('   §STEP_GATE_STACK maxPile ' + B.max + ' -> ' + A.max + ' elementsInPiles>=20 ' + B.in20 + ' -> ' + A.in20 + ' (piles ' + B.n20 + ' -> ' + A.n20 + ') ' +
    (A.in20 === 0 ? 'GREEN' : stackRed ? 'RED (rose)' : 'NOT ZERO, did not rise (baseline already ' + B.in20 + ')'));
  console.log('   §STEP_GATE_DAYS totalDays ' + B.td + ' -> ' + A.td + ' · §CELL_GATE ' + B.repr + '% ' + B.path + ' -> ' + A.repr + '% ' + A.path +
    ' · §STRUCT_NO_SUPPORT in log: before=[' + B.nos.join(',') + '] after=[' + A.nos.join(',') + ']');
  if (rises.length || stackRed) red++;
}
console.log('§STEP_GATE_VERDICT pairs=' + a.length / 2 + ' red=' + red + ' ' + (red ? 'RED' : 'GREEN'));
