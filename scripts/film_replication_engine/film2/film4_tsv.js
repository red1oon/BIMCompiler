// ⚠ DO NOT REMOVE — Scope: the English two-voice narration (F asks, M explains) for Film 2 v2 (under-the-hood cut) "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24) as a TSV for prompts/film_narration_fit_kokoro_v3.py.
// EVERY spoken number is produced by n('<fact>') from facts2.js (live queries, logs, file counts, trace events); outside statements are described without spoken figures. §NUM_CHECK re-reads the output and checks that every cardinal
// the script speaks equals a fact it requested (counted per value; prose number words are therefore not allowed). Read the log after every run.
// Usage:  node film4_tsv.js measure <passDir> <out.tsv>   |   node film4_tsv.js build <passDir> <out.tsv>   (cues from <passDir>/film.log §FILM_CUE)
'use strict';
const fs = require('fs'), path = require('path');
const X = require('./facts4.js').build(), F = X.F;
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
  ['c3', 'film2_claims.json 3a1 3a3 3a8 3b1 3b2', `F: Relays? | M: A Nostr study estimates heavy duplicate traffic, and free relays that cannot cover costs. Delta Chat calls its relay minimal, yet specifies its duties. Our reading: a simple relay still needs stated duties.`],
  ['c4', 'film2_claims.json 2b2 4a 4b1 4b3', `F: And history? | M: The local-first essay lists growing change history as a performance problem. Manyverse shortened its first sync, yet it is still long. Automerge fixed slow loads.`],
  ['c5', 'film2_claims.json 5e 5a 5b1 5b2', `F: Does pure peer to peer work? | M: Radicle calls it feasible but impractical. Briar built a mailbox for offline messages. Scuttlebutt has pubs and rooms. Each adds an always on helper.`],
  ['c6', 'film2_claims.json 6-mongodb-a 6-powersync-a 6-electric-joining-a 6-electric-joining-b 6-triplit-a', `F: And when products change direction? | M: MongoDB ended its device sync. PowerSync is phasing out older sync rules. Electric is joining Databricks and winding down its cloud. Supabase welcomed Triplit's co-founder. Not a verdict: it is why our data stays local.`],
  ['d_tables', 'live query tables · s1.log §S1_INPUT', `F: How does the system describe itself? | M: In tables: a live query counts ${n('adTables')} tables, ${n('adActive')} active, and ${n('adColumns')} columns. A column ending in underscore I D points at another table.`],
  ['d_source', 'iDempiere MLookupFactory.java:192-214, MQuery.java:420-430', `F: Is the pointer rule our own? | M: No, iDempiere's, in its open source. A table or search column with a reference value reads that table. Any other id column names its table. We copied the rule.`],
  ['d_edges', 'live queries er1 er2 er4 · s1.log W-FLOW-REFS, §S1_UNRESOLVED', `F: How many pointers? | M: ${n('edges')}. Each query counts a rule's pointers: ${n('er1')}, ${n('er2')} and ${n('er4')}. The compiler's own count agrees.`],
  ['d_orderline', 'live queries orderline · s1.log W-FLOW-MINIMAL, §S1_FLOW F1', `F: Does an order line carry everything? | M: The order line has ${n('olCols')} columns, mostly ids. Only ${n('wire')} cross: product, unit, quantity, and its identity and partition. Names and prices stay on each device.`],
  ['d_computed', 's1.log W-FLOW-NO-DERIVED, W-FLOW-MANDATORY', `F: And computed fields? | M: The dictionary marks what a person types and what the system computes. Computed values never cross. The receiver supplies the ${n('mand')} mandatory fields left out, including the order header.`],
  ['d_honest', 'spec §11.1', `F: So ids hide the data? | M: No. An id is a pointer, not a secret. Sealing a flow is built in the simulator only, and this run is not encrypted. Records made on a device carry a universally unique id.`],
  ['r_strategy', 'live query strategy100 · dryrun.log', `F: Second part. Does iDempiere have the idea already? | M: Yes: each table is Reference, Merge or Local. In an iDempiere replication strategy, of ${n('adActive')} active tables: ${n('stratM')} Merge, ${n('stratR')} Reference, ${n('stratL')} Local, ${n('stratUnlisted')} not yet classified.`],
  ['r_row', 'flows_modeller.json · dryrun.log D1', `F: And what do we add? | M: A flow row: which table and columns, which direction, who may read, and when. The real Modeller list is ${n('dryVirtual')} declaration and ${n('dryRows')} row. ${n('nComponents')} components handle the kinds of row. The engine names no table.`],
  ['r_zero', 's1.log W-FLOW-ZERO-CODE · registry.log · virtual.log', `F: Does a new flow mean new code? | M: No, a new flow is a row. Flows for ${n('zcFlows')} more tables compiled, with the compiler's hash unchanged. A virtual table is a declaration row. A wrong row fails at compile time.`],
  ['r_bloat', 's1.log W-FLOW-MINIMAL · neutral_day.log N-LOCAL · file counts', `F: Where is the bloat kept off? | M: Payload: ${n('wire')} of ${n('olCols')} columns cross. Scope code: a toolchain of ${n('linesToolchain')} lines reads the rows. Chatter: a local action makes ${n('localCalls')} shelf calls, a visit up to ${n('visitCalls')}.`],
  ['u_code', 'git show 4e95b393 / 5dfa4231 / 4958a885 modeller/team_sync.js', `F: Now under the hood. What did the real adapter look like? | M: Before, a literal list of ${n('p1Keys')} operation types, written in code. Then a derivation from the compiled plan, in the adapter itself. Now the same list is asked of a shared reader. Each line starts with its line number in the file.`],
  ['u_chain', 'git show 5dfa4231 modeller/team_plan.js · team_scope.js · MTable.java:257-261', `F: How does the row reach the adapters? | M: The row compiles to a generated plan, ${n('planBytes')} bytes, stamped with a hash, and unsigned. A small reader, ${n('scopeLines')} lines, answers what is shared, and both adapters ask it. The pattern is iDempiere's own service locator.`],
  ['u_probes', 'modeller_baseline_before.log, modeller_after.log, modeller_plan_witness.log, modeller_noplan_failclosed.log', `F: How do we know it still works? | M: The Modeller's full witness gave the same verdict before and after: ${n('tmJudged')} arms. Then the probes. An added value is shared, with the adapter file byte identical. No plan, nothing shared. A plan without the move columns shares no move. ${n('mwMutants')} deliberate breakages were all caught. With the plan file removed, the unchanged witness fails, as it should.`],
  ['u_erp', 'erp_plan_witness.log · erpplan_run.log · teamscope_run.log', `F: And the ERP? | M: The same chain. Over all ${n('erpN')} dictionary tables, the old rule and the plan agree: ${n('erpSharedE1')} shared, ${n('erpDiffer')} differ. With no plan, nothing is shared. ${n('erpMutants')} breakages of the adapter were all caught, and ${n('scopeMutants')} of the reader. A finding stays open: ${n('erpOutside')} outside tables are now local only.`],
  ['u_ledger', 'git show --numstat 5dfa4231, 4958a885 · gh pr view · TEAMWORK_FRAMEWORK §20, §24.1, §25.2', `F: And the ledger? | M: Plainly: the Modeller adapter did not shrink, plus ${n('adapterAdded')}, minus ${n('adapterRemoved')}. The reader is ${n('scopeLines')} lines, once. Custom code did not fall; the duplication did. About ${n('adapterStayPct')} percent of the adapters stays. The plan is unsigned, though the reader can now check a signature. Both changes are merged.`],
  ['u_engine', 'file counts · registry.log · the seven logs', `F: What is the engine itself like? | M: A core of ${n('linesCore')} lines, and components of ${n('linesComponents')}: together ${n('linesEngine')}. A new handler is a new file, and the core's hash stays the same. And ${n('mutantsTotal')} deliberate breakages across ${n('witnessCount')} witnesses each turned a test red.`],
  ['u_why', 'design reasons · mesh.log W-MESH-FOLD', `F: Does so little really need a live connection? | M: Facts only append, and are idempotent. Ids resolve on the device. A late arrival changes nothing. So a visit now and then is enough.`],
  ['u_next', 'TEAMWORK_FRAMEWORK §25.2, §13.12.J.2 · dryrun.log D8b, G9', `F: What is next? | M: Narrowing the ERP scope is a data change now, but it needs the every window check first: default deny would share ${n('erpDeny')} tables and stop sharing ${n('erpStop')}. Signing works as a mechanism, but no adapter asks for it yet. Sealing works in the simulator only. Real pipes are not built, and event versioning is on paper.`],
  ['limits', 'limits card · logs', `F: So what do we take away? | M: The abstraction keeps payload, scope code and network chatter off, and leaves about ${n('adapterStayPct')} percent of the adapters in place. Limits are on screen, and all witness logs pass. A full working day on a real case is shown in the first film.`],
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
