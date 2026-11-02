// ⚠ DO NOT REMOVE — Scope: the English two-voice narration (F asks, M explains) for Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24) as a TSV for prompts/film_narration_fit_kokoro_v3.py.
// EVERY spoken number is produced by n('<fact>') from facts2.js (live queries, logs, file counts, trace events); outside statements are described without spoken figures. §NUM_CHECK re-reads the output and checks that every cardinal
// the script speaks equals a fact it requested (counted per value; prose number words are therefore not allowed). Read the log after every run.
// Usage:  node film2_tsv.js measure <passDir> <out.tsv>   |   node film2_tsv.js build <passDir> <out.tsv>   (cues from <passDir>/film.log §FILM_CUE)
'use strict';
const fs = require('fs'), path = require('path');
const X = require('./facts2.js').build(), F = X.F;
const [mode, dir, out] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const USED = {};
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w(n % 100) : ''); return w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + w(n % 1000) : ''); };
const CALLS = {};
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; return w(Math.abs(v)); };
const nA = k => { const t = n(k); return t === 'one hundred' ? 'a hundred' : 'a ' + t; };
const code = k => { const m = /(\d+)$/.exec(F[k]); if (!m) throw new Error('no number in ' + k); USED[k] = +m[1]; CALLS[+m[1]] = (CALLS[+m[1]] || 0) + 1; return w(+m[1]); };
const ROWS = [
  ['title', 'fixed text', `F: Keeping the bloat off. What bloat? | M: Payload, scope code and network chatter. We measure each, and say what stays.`],
  ['wall', 'film2_claims.json · film2_logos_index.json', `F: Has anyone else tried this? | M: We looked at similar projects and learned from the challenges they report. Among them, these.`],
  ['c1', 'film2_claims.json 1-zero-b 1-electric-b 1-powersync-b 1-couchbase-a 1-ditto-b', `F: The first challenge? | M: Sync scope is written by hand. Rocicorp, Electric, PowerSync, Couchbase and Ditto each ask the developer to write what a device receives. Our reading.`],
  ['c2', 'film2_claims.json 2a1 2a2 2b1', `F: And versions? | M: A user reports sync failing after an update, and the local-first essay calls it an open question. We have not solved this. Versioning is design only.`],
  ['c3', 'film2_claims.json 3a1 3a3 3a8 3b1 3b2', `F: Relays? | M: A study of Nostr estimates heavy duplicate traffic, and free relays that cannot cover their costs. Delta Chat calls its relay minimal, yet specifies its duties. Our reading: even a simple relay needs stated duties.`],
  ['c4', 'film2_claims.json 2b2 4a 4b1 4b3', `F: And history? | M: The local-first essay lists growing change history as a performance problem. Manyverse shortened its first sync, yet it is still long. Automerge fixed slow loads.`],
  ['c5', 'film2_claims.json 5e 5a 5b1 5b2', `F: Does pure peer to peer work? | M: Radicle calls it feasible but impractical. Briar built a mailbox for offline messages. Scuttlebutt has pubs and rooms. Each adds an always on helper.`],
  ['c6', 'film2_claims.json 6-mongodb-a 6-powersync-a 6-electric-joining-a 6-electric-joining-b 6-triplit-a', `F: And when products change direction? | M: MongoDB ended its device sync. PowerSync is phasing out older sync rules. Electric is joining Databricks, its cloud winding down, its code staying open. Supabase welcomed Triplit's co-founder. Not a verdict: it is why our data stays local.`],
  ['d_tables', 'live query tables · s1.log §S1_INPUT', `F: How does the system describe itself? | M: In tables. A live query counts ${n('adTables')} tables, ${n('adActive')} active, and ${n('adColumns')} columns. A column ending in underscore I D points at another table.`],
  ['d_source', 'iDempiere MLookupFactory.java:192-214, MQuery.java:420-430', `F: Is the pointer rule our own? | M: No, iDempiere's, in its open source. A table or search column with a reference value reads that table. Any other id column names its table. We copied the rule.`],
  ['d_edges', 'live queries er1 er2 er4 · s1.log W-FLOW-REFS, §S1_UNRESOLVED', `F: How many pointers? | M: ${n('edges')}. Each query counts a rule's pointers: ${n('er1')}, ${n('er2')} and ${n('er4')}. The compiler's own count agrees exactly.`],
  ['d_orderline', 'live queries orderline · s1.log W-FLOW-MINIMAL, §S1_FLOW F1', `F: Does a sale line carry everything? | M: The order line has ${n('olCols')} columns, mostly ids. Only ${n('wire')} cross: product, unit, quantity, and its identity and partition. Names and prices stay on each device.`],
  ['d_computed', 's1.log W-FLOW-NO-DERIVED, W-FLOW-MANDATORY', `F: And computed fields? | M: The dictionary marks what a person types and what the system computes. Computed values never cross. The receiver supplies the ${n('mand')} mandatory fields left out, including the order header.`],
  ['d_honest', 'spec §11.1', `F: So ids hide the data? | M: No. An id is a pointer, not a secret. Real flows are sealed separately; this run is not encrypted. Records made on a device carry a universally unique id.`],
  ['r_strategy', 'live query strategy100 · dryrun.log', `F: Second part. Does iDempiere have the idea already? | M: Yes: each table is Reference, Merge or Local. In the point of sale strategy, of ${n('adActive')} active tables: ${n('stratM')} Merge, ${n('stratR')} Reference, ${n('stratL')} Local, ${n('stratUnlisted')} not yet classified.`],
  ['r_row', 'flows.json · treat.log §TREAT_INPUT', `F: And what do we add? | M: A flow row: which table and columns, which direction, who may read, and when. ${n('rows')} rows, read by ${n('treatments')} kinds of handler. The engine names no table.`],
  ['r_zero', 's1.log W-FLOW-ZERO-CODE · registry.log · virtual.log', `F: Does a new flow mean new code? | M: No, a new flow is a row. Flows for ${n('zcFlows')} more tables compiled, with the compiler's hash unchanged. A virtual table is a declaration row. A wrong row fails at compile time.`],
  ['r_dry', 'dryrun.log D1 D5 D7 D8b G9', `F: Could this govern the team tools? | M: We compiled only, touching no adapter. The Modeller's ${n('drySharedOps')} shared operation types are ${n('dryVirtual')} virtual table, ${n('dryRows')} row and ${n('dryValues')} list values. The team ERP shares ${n('erpShared')} tables today, ${n('erpDeny')} with the Merge rows. Undecided.`],
  ['r_bloat', 's1.log W-FLOW-MINIMAL · treat.log W-TREAT-LOCAL · file counts', `F: Where is the bloat kept off? | M: Payload: ${n('wire')} of ${n('olCols')} columns cross. Scope code: a toolchain of ${n('linesToolchain')} lines reads the rows. Chatter: a sale makes ${n('salePipeCalls')} calls, a visit ${n('visitPipeCalls')}.`],
  ['r_ledger', 'file counts · TEAMWORK_FRAMEWORK.md §20, §22.8', `F: Is anything not removed? | M: Yes. The engine is ${n('linesEngine')} lines. About ${n('adapterStayPct')} percent of both team adapters, by a rough count, stays, and the JSON rows are more lines than the lists they replace. The win: a single default, compile time checks, data instead of code.`],
  ['cast', 'flows.json · trace_film_pos', `F: In the third part, a serverless day. Who is on stage? | M: Branches A and B, HQ, a customer phone, and the shelf. Every device starts offline, in red.`],
  ['setup', 'trace_film_pos', `F: What happens first? | M: HQ opens its single window. The price list, and an opening stock of ${n('openStock')} for A, go on the shelf. A visits, collects them, and is offline again.`],
  ['selling', 'trace_film_pos', `F: Then the day starts. | M: Sales at the till: ${n('sale1')} units, ${n('sale2')} more, then ${n('sale3')}. Each stays local, and a sale makes ${n('salePipeCalls')} calls. A's stock counts down ${n('openStock')}, ${n('stock1')}, ${n('stock2')}, ${n('stock3')}. The phone's earn code gives credit ${nA('credit1')}. A redeem code takes it to ${n('credit2')}, and a second scan does nothing.`],
  ['outage', 'trace_film_pos · treat.log W-TREAT-OFFLINE, W-TREAT-STOCKLOOP', `F: What if the link drops? | M: A's evening visit fails. ${n('queuedOutage')} items wait on the device, and nothing is lost. When the link is back, A delivers ${n('deliveredSales')} sale lines and ${n('deliveredCodes')} codes. HQ accepts ${n('hubAcceptsSales')} sale lines. Stock ${n('openStock')} minus ${n('salesTotal')} leaves ${n('hubStockAfterSales')}. Below ${n('minLevel')}, so the rule runs the kernel's replenishment, a stand-in here, and sends ${n('replenQty')} for A.`],
  ['lostA', 'trace_film_pos · treat.log FILMDAY-POS-stock, W-TREAT-BLIND, W-TREAT-DEVICEFAIL', `F: Next morning, and then we break something. | M: A's count is ${n('stockMeet')}, and HQ's is ${n('stockMeet')}. B is refused when it reads A's part of the shelf. Then Branch A is lost, with ${n('unsent')} sale not yet sent. That sale is gone. A folds back from the shelf: ${n('restoreOwn')} own objects, ${n('restoreDown')} addressed to it. Count ${n('stockBefore')}, then ${n('stockAfter')}, and HQ's is ${n('stockHubDay2')}.`],
  ['concept', 'treat.log W-TREAT-CODE', `F: And returns and loyalty? | M: A concept to test, not a claim about anyone's system. A return could be a negative quantity line; the run did not send a return. Loyalty credit lives on the phone, and a signed cashier code applies once. Tested: a second scan does nothing, a forged code is rejected, an older phone is flagged at settlement. Detection, not prevention.`],
  ['rolled', 'trace_film_pos · treat.log W-TREAT-CODE', `F: A reused ticket, and an older phone? | M: After the restore, a ticket number is reused with different content: ${n('reuseQty')} units. An older phone shows credit ${nA('rolledRedeem')} again, and B issues a redeem code of ${nA('rolledRedeem')}.`],
  ['settle', 'trace_film_pos · treat.log FILMDAY-POS-code', `F: When does HQ find out? | M: At its next visit. A collision: the same ticket key, different content. HQ keeps the original, and flags the later version in red. Then an overspend: balance minus ${nA('overspendBalance')}. The engine does not stop it. It catches it at settlement: a blacklist candidate.`],
  ['hqlost', 'trace_film_pos · treat.log FILMDAY-POS-rebuild, W-TREAT-PIPEFAIL', `F: And if HQ is lost? | M: It is wiped, then rebuilds from the shelf: ${n('rebuildRecords')} records, identical, with no duplicate objects. | F: And the shelf? | M: A mailbox device holds a blind copy; HQ rebuilds from it, the same ${n('rebuildRecords')}. Without a mailbox the control recovered ${n('controlRecovered')} of ${n('controlOf')}.`],
  ['numbers', 'treat.log §TREAT_PANEL pos day 1', `F: How busy was the network? | M: On the working day HQ visited the shelf ${n('d1HubVisits')} times, the devices ${n('d1DevVisits')}, and the branch and phone did ${n('d1Local')} things alone.`],
  ['mfprice', 'trace_film_mf · treat.log FILMDAY-MF', `F: The second case, Micro Finance? | M: Borrowers keep gold on their phones. A phone fetches the day's public price once, and works out the fund value itself: ${n('grams')} grams times ${n('price')} is ${n('fundValue')}. Opened again, it skips the fetch.`],
  ['mfpay', 'trace_film_mf · treat.log FILMDAY-MF · witness source', `F: And a payment? | M: A slip is saved on the phone and sent at the next visit. Sent again, it keeps its name on the shelf: still ${n('mfPayRecs')} payment. The shop accepts ${n('payAmt')}: ${n('openOwing')} minus ${n('payAmt')} leaves ${n('mfOwing')}.`],
  ['mfconfirm', 'trace_film_mf · treat.log FILMDAY-MF', `F: Does the other borrower see it? | M: No. The first receives the confirmation, owing ${n('mfOwing')}. The second has ${n('mfConf2')} confirmations.`],
  ['limits', 'limits card · logs', `F: So what do we take away? | M: The abstraction keeps payload, scope code and network chatter off, and leaves about ${n('adapterStayPct')} percent of the adapters in place. Limits on screen: sample data, no encryption, no real phone, adapters on main unchanged, versioning not solved. All witness logs pass.`],
  ['src1', 'sources card', `F: And where is all this from? | M: Every outside statement is here, with its address and the date we read it.`],
  ['src2', 'sources card', `F: Anything else? | M: Our own numbers come from live queries and logs. Logos and names belong to their owners.`]
];
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
  if (order.join() !== ROWS.map(r => r[0]).join()) throw new Error('beat order in film.log differs from the narration rows:\n' + order.join() + '\n' + ROWS.map(r => r[0]).join());
}
const rows = ROWS.map(([id, src, det]) => {
  det = det.replace(/\s+,/g, ',').replace(/, \./g, '.');
  let a = 0, e = 999;
  if (mode === 'build') { a = cues[id]; if (a === undefined) throw new Error('no cue for ' + id); const nx = order[order.indexOf(id) + 1]; e = nx ? cues[nx] : endT; if (e === null || e === undefined) throw new Error('no film end'); }
  return [id, a.toFixed(2), e.toFixed(2), src, short(det), det].join('\t');
});
const WORDS = {}; ONES.forEach((x, i) => { WORDS[x] = i; }); TENS.forEach((x, i) => { if (i >= 2) WORDS[x] = i * 10; });
const spoken = [];
rows.forEach(r => { const id = r.split('\t')[0], toks = r.split('\t')[5].toLowerCase().split(/\s+/); let total = 0, cur = 0, inRun = false;
  const flush = () => { if (inRun) spoken.push([id, total + cur]); total = 0; cur = 0; inRun = false; };
  toks.forEach(tk => { const brk = /[,.?!:;]$/.test(tk), t = tk.replace(/[,.?!:;"]/g, '');
    if (WORDS[t] !== undefined || t === 'hundred' || t === 'thousand') { inRun = true; if (t === 'hundred') cur = (cur || 1) * 100; else if (t === 'thousand') { total += (cur || 1) * 1000; cur = 0; } else cur += WORDS[t]; if (brk) flush(); }
    else flush(); }); flush(); });
let bad = 0; const spokenCount = {}; spoken.forEach(([id, v]) => { spokenCount[v] = (spokenCount[v] || 0) + 1; });
Object.keys(spokenCount).forEach(v => { if (spokenCount[v] !== (CALLS[v] || 0)) { bad++; console.log(`§NUM_CHECK value ${v}: spoken ${spokenCount[v]} times (${spoken.filter(s => s[1] == v).map(s => s[0]).join(',')}) but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
Object.keys(CALLS).forEach(v => { if (!spokenCount[v]) { bad++; console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
rows.forEach(r => { if (/\d/.test(r.split('\t')[5])) { bad++; console.log('§NUM_CHECK digit in narration of ' + r.split('\t')[0] + '  WRONG'); } });
console.log(`§NUM_CHECK numbers_spoken=${spoken.length} facts_used=${Object.keys(USED).length} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${X.SRC[k]}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: X.SRC, spokenUsed: USED, queries: X.Q }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
