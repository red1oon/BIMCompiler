// v2 (§16.25): the closing row speaks core / components / whole-engine line counts (counted from the files by facts.js) and the adapter limit; every other row is unchanged from v1.
// ⚠ DO NOT REMOVE — Scope: the English two-voice narration (F asks, M explains) for the film "No server in the sale path" (prompts/TEAMWORK_FRAMEWORK.md §16.19a v2, §16.21), as a TSV for
// prompts/film_narration_fit_kokoro_v3.py. EVERY spoken number is produced by n('<fact>') from facts.json (facts.js: trace events, treat.log, s1.log, the engine's witness source).
// After building the rows this script re-reads its own output and CHECKS that every number it speaks (cardinal words) equals a fact it used: §NUM_CHECK. Read the log after every run.
// Usage:  node film_replication_engine_tsv.js measure <passDir> <out.tsv>      (cue 0, end 999: the fitter measures each beat's speech length)
//         node film_replication_engine_tsv.js build   <passDir> <out.tsv>      (cues read from <passDir>/film.log §FILM_CUE lines of the recording)
// Wording rules (§16.19): plain short sentences; "sample" for made-up numbers; no "mockup"; "simulated" only on the limits card; no legal statements.
'use strict';
const fs = require('fs'), path = require('path');
const { buildFacts } = require('./facts.js'), Beats = require('./beats.js');
const [mode, dir, out] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const R = buildFacts(), F = R.F, USED = {};
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w(n % 100) : ''); return w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + w(n % 1000) : ''); };
const CALLS = {};                                                          // how many times each numeric VALUE was requested from a fact (the spoken count must match)
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; return w(Math.abs(v)); };
const nA = k => { const t = n(k); return t === 'one hundred' ? 'a hundred' : 'a ' + t; };   // "a hundred"
const code = k => { const m = /(\d+)$/.exec(F[k]); if (!m) throw new Error('no number in ' + k); USED[k] = +m[1]; CALLS[+m[1]] = (CALLS[+m[1]] || 0) + 1; return w(+m[1]); };
const ROWS = [
  ['title', 'fixed text', `F: No server in the sale path. How is that possible? | M: This is the Replication engine's own recorded run, for Unicenta point of sale and for Micro Finance. Sample data.`],
  ['recap', 'earlier film card', `F: Haven't we seen this? | M: The idea, yes. A usual ERP needs a server. Here each device keeps its own copy, and the shelf only stores named objects.`],
  ['cast', 'flows.json · s1.log W-FLOW-MINIMAL', `F: Who is on stage? | M: Branches A and B, HQ, a customer phone, and the shelf. These rows are the whole configuration. A sales row sends only ${n('wireCols')} of the ${n('tableCols')} columns. Every device starts offline, in red.`],
  ['setup', 'trace_film_pos', `F: What happens first? | M: HQ opens its single window: the price list, and an opening stock of ${n('openStock')} for A, go on the shelf. A visits, collects them, and is offline again.`],
  ['selling', 'trace_film_pos', `F: Then the day starts. | M: Sales at the till: ${n('sale1')} units, ${n('sale2')} more, then ${n('sale3')}. Each stays local. A counts its stock down: ${n('openStock')}, ${n('stock1')}, ${n('stock2')}, ${n('stock3')}. The phone scans an earn code: credit ${nA('credit1')}. A redeem code takes it to ${n('credit2')}, and a second scan does nothing. The shelf and HQ stay silent.`],
  ['outage', 'trace_film_pos · treat.log W-TREAT-OFFLINE, W-TREAT-STOCKLOOP', `F: What if the link drops? | M: A's evening visit fails. ${n('queuedOutage')} items wait on the device, and nothing is lost. When the link is back, A delivers ${n('deliveredSales')} sale lines and ${n('deliveredCodes')} codes. HQ accepts ${n('hubAcceptsSales')} sale lines. Stock ${n('openStock')} minus ${n('salesTotal')} leaves ${n('hubStockAfterSales')}. Below ${n('minLevel')}, so the rule runs the kernel's replenishment, a stand-in here, and sends ${n('replenQty')} for A.`],
  ['day2', 'trace_film_pos · treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND', `F: Next morning? | M: A receives the movement. Its count is ${n('stockMeet')}, and HQ's is ${n('stockMeet')}. B's inbox holds ${n('bInbox')} objects, and B is refused when it tries to read A's part of the shelf.`],
  ['lost', 'trace_film_pos · treat.log FILMDAY-POS-stock, W-TREAT-DEVICEFAIL', `F: Now we break something. Branch A is lost. | M: Not yet sent: ${n('unsent')}. That sale is gone. A folds back from its part of the shelf: ${n('restoreOwn')} own objects, ${n('restoreDown')} addressed to it. Count ${n('stockBefore')}, then ${n('stockAfter')}, and HQ's is ${n('stockHubDay2')}. The next code is A ${code('nextCode')}.`],
  ['reuse', 'trace_film_pos', `F: A ticket number reused? | M: After a restore, the till reuses today's number with different content: ${n('reuseQty')} units.`],
  ['rolled', 'trace_film_pos · treat.log W-TREAT-CODE', `F: A phone restored to an older copy? | M: It shows credit again, ${nA('rolledRedeem')}. Branch B's cashier issues a redeem code of ${nA('rolledRedeem')}, and credit goes to ${n('credit2')}.`],
  ['settle', 'trace_film_pos · treat.log FILMDAY-POS-code', `F: When does HQ find out? | M: At its next visit. A collision: the same ticket key, different content. HQ keeps the original, and flags the later version in red. Then an overspend: balance minus ${nA('overspendBalance')}. The engine does not stop it. It catches it at settlement: a blacklist candidate.`],
  ['hqlost', 'trace_film_pos · treat.log FILMDAY-POS-rebuild', `F: And if HQ is lost? | M: Its state is wiped. HQ rebuilds it from the shelf: ${n('rebuildRecords')} records, identical. The shelf held ${n('shelfBefore')} objects before and ${n('shelfAfter')} after: no duplicates.`],
  ['shelflost', 'trace_film_pos · treat.log W-TREAT-PIPEFAIL', `F: And the shelf? | M: The mailbox device holds a blind copy. HQ rebuilds from it: the same ${n('rebuildRecords')} records. Without a mailbox, the engine's control recovered ${n('controlRecovered')} of ${n('controlOf')}.`],
  ['numbers', 'treat.log §TREAT_PANEL pos day 1', `F: How busy is HQ? | M: On the working day, HQ visited the shelf ${n('d1HubVisits')} times, the devices ${n('d1DevVisits')} times, and the branch and phone did ${n('d1Local')} things alone. The point is the cadence.`],
  ['part2', 'fixed text', `F: The second case. | M: Micro Finance. Borrowers keep gold on their phones, and the shop keeps a desk.`],
  ['mfcast', 'trace_film_mf', `F: What is on the shelf? | M: The day's gold price, published once. It is public, for anyone to read.`],
  ['mfprice', 'trace_film_mf · treat.log FILMDAY-MF', `F: And the phone? | M: It fetches the price once, and works out the fund value itself: ${n('grams')} grams times ${n('price')} is ${n('fundValue')}. Sample numbers.`],
  ['mfskip', 'trace_film_mf · treat.log FILMDAY-MF', `F: Opened again later? | M: The price is already held, so the fetch is skipped.`],
  ['mfpay', 'trace_film_mf · treat.log FILMDAY-MF', `F: And a payment? | M: A slip is saved on the phone, and sent at the next visit. Sent again, it keeps the same name on the shelf: still ${n('mfPayRecs')} payment.`],
  ['mfowing', 'trace_film_mf · treat.log FILMDAY-MF · witness source', `F: How does the shop know the balance? | M: It accepts the payment of ${n('payAmt')}: ${n('openOwing')} minus ${n('payAmt')} leaves ${n('mfOwing')}. The confirmation goes to that borrower only.`],
  ['mfconfirm', 'trace_film_mf · treat.log FILMDAY-MF', `F: Does the other borrower see it? | M: No. The first receives the confirmation, owing ${n('mfOwing')}. The second has ${n('mfConf2')} confirmations.`],
  ['close', 'close card · treat.log §TREAT_VERDICT, §TREAT_SIZE · line counts (facts.json lineCommand) · §24 adapter state', `F: So, what did we see? | M: Both cases ran on the same ${n('treatments')} kinds of rows. The engine is a core of ${n('linesCore')} lines plus ${n('linesComponents')} lines of components, ${n('linesEngine')} in all. Limits on screen: sample data, nothing encrypted, a single in-memory hub, no real phone, stand-in kernel processes, and no product adapter on main reading the engine yet. The engine's own tests: ${n('judged')} judged, no fails.`]
];
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
}
const rows = ROWS.map(([id, src, det]) => {
  det = det.replace(/\s+,/g, ',').replace(/, \./g, '.');
  let a = 0, e = 999;
  if (mode === 'build') { a = cues[id]; if (a === undefined) throw new Error('no cue for ' + id); const nx = order[order.indexOf(id) + 1]; e = nx ? cues[nx] : endT; if (e === null || e === undefined) throw new Error('no film end'); }
  return [id, a.toFixed(2), e.toFixed(2), src, short(det), det].join('\t');
});
// ---- NUM_CHECK: every cardinal the script speaks must be a fact it asked for ----
const WORDS = {}; ONES.forEach((x, i) => { WORDS[x] = i; }); TENS.forEach((x, i) => { if (i >= 2) WORDS[x] = i * 10; });
const spoken = [];
rows.forEach(r => { const id = r.split('\t')[0], toks = r.split('\t')[5].toLowerCase().split(/\s+/); let total = 0, cur = 0, inRun = false;
  const flush = () => { if (inRun) { spoken.push([id, total + cur]); }  total = 0; cur = 0; inRun = false; };
  toks.forEach(tk => { const brk = /[,.?!:;]$/.test(tk), t = tk.replace(/[,.?!:;"]/g, '');
    if (WORDS[t] !== undefined || t === 'hundred' || t === 'thousand') { inRun = true; if (t === 'hundred') cur = (cur || 1) * 100; else if (t === 'thousand') { total += (cur || 1) * 1000; cur = 0; } else cur += WORDS[t]; if (brk) flush(); }
    else flush(); }); flush(); });
let bad = 0; const spokenCount = {}; spoken.forEach(([id, v]) => { spokenCount[v] = (spokenCount[v] || 0) + 1; });
Object.keys(spokenCount).forEach(v => { if (spokenCount[v] !== (CALLS[v] || 0)) { bad++; console.log(`§NUM_CHECK value ${v}: spoken ${spokenCount[v]} times but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
Object.keys(CALLS).forEach(v => { if (!spokenCount[v]) { bad++; console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
// stray digits in the narration
rows.forEach(r => { if (/\d/.test(r.split('\t')[5])) { bad++; console.log('§NUM_CHECK digit in narration of ' + r.split('\t')[0] + '  WRONG'); } });
const nUsed = Object.keys(USED).length;
console.log(`§NUM_CHECK numbers_spoken=${spoken.length} facts_used=${nUsed} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${R.SRC[k]}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: R.SRC, spokenUsed: USED }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
