// ⚠ DO NOT REMOVE — Scope: the English two-voice narration (F asks, M explains) of Film 5 "Trust and the thin pipe" as a TSV for prompts/film_narration_fit_kokoro_v3.py (FILM_NARRATION.md ▶ PLAYBOOK step 2-3).
// EVERY spoken number is produced by n('<fact>') from facts5.js (extracted from the frozen logs / prompt lines). §NUM_CHECK re-reads the finished text and requires every cardinal it speaks to equal a fact it requested (counted per value);
// digits are banned in the narration; prose number words are therefore not allowed. Read the log after every run.
// Usage:  node film5_tsv.js measure <passDir> <out.tsv>   |   node film5_tsv.js build <passDir> <out.tsv>   (cues from <passDir>/film.log §FILM_CUE)
'use strict';
const fs = require('fs'), path = require('path');
const X = require('./facts5.js').build(), F = X.F;
const [mode, dir, out] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const USED = {}, CALLS = {}; let rowKeys = [];
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w(n % 100) : ''); return w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + w(n % 1000) : ''); };
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; rowKeys.push(k); return w(Math.abs(v)); };
const R = (id, det) => { const keys = rowKeys; rowKeys = []; return [id, keys, det]; };
const ROWS = [
  R('title', `F: Trust and the thin pipe. What is this about? | M: Pieces of work on the Team feature, recently finished. Each is measured by automatic checks, and every number you see comes from their logs.`),
  R('ch1_card', `F: What happens when a device runs an older version of the app? | M: It sets aside any change it cannot read, and says it is waiting for a translation rule from the team admin.`),
  R('ch1_problem', `F: And how did that rule reach it before? | M: Only through the app's own settings, which means a new app build. An admin had no way to hand a waiting device the rule.`),
  R('ch1_how', `F: So what is new? | M: The owner signs the rule offline. An admin device publishes it inside the team's policy message. Other devices pick it up on their next visit, and the waiting change is read. No new build, and no new channel.`),
  R('ch1_keys', `F: Could a stolen admin device slip in a rule? | M: Not alone. The policy message proves an admin device sent it, but the rule itself must also carry the owner's signature, checked against the key list pinned at founding. Unsigned, edited, wrongly signed, or sent by a device that is not an admin: each is refused.`),
  R('ch1_tested', `F: How was that tested? | M: With ${n('devices')} real browsers: an admin, a joiner on an older shape, and a late joiner. A single visit reads the waiting change, and the late joiner adopts the rule on its first visits. Each host passed ${n('pubJudged')} checks, and caught all ${n('pubMut')} deliberately broken copies.`),
  R('ch1_ledger', `F: Is it merged? | M: Yes, into the ERP and the Modeller. The engine passed ${n('verJudged')} checks, and ${n('suite2382')} browser test suites passed with no failures and no page errors. Not built yet: an admin screen, a signing tool, and a way to withdraw a rule. A team can hold at most ${n('maxSets')}.`),
  R('ch2_card', `F: What if the team's key is lost or leaked? | M: Until now, the list of trusted keys was fixed when the team was founded. The only way out was to found a new team.`),
  R('ch2_keys', `F: So how can the list change now? | M: By a signed statement: a new list of ${n('keysMin')} to ${n('keysMax')} keys, a fingerprint of the list in force, and a signature from a key already on that list. An admin device sends it.`),
  R('ch2_rotate', `F: Can you show a rotation? | M: The primary key signs a statement that adds another key. Later the primary is lost, and the backup signs a new list that leaves it out. A plan signed by the old primary is now untrusted, and a plan signed by the new key is accepted.`),
  R('ch2_refuse', `F: And what gets refused? | M: ${n('refusals')} cases, each refused on both devices: a signer not on the list, edited keys, a replayed statement, a hidden private key, a sender who is not an admin, an out of date policy, and a team founded with no list.`),
  R('ch2_proof', `F: How many checks were there? | M: ${n('ptJudged')}, none failed. They were written before the build, and ${n('redArms')} failed then, as they should. All ${n('plantrustMut')} deliberately broken copies were caught, and the same ${n('reverseOps')} messages in reverse order give the same list.`),
  R('ch2_hosts', `F: Do the apps have to change? | M: No. Each app re-checks its plan after every visit, using the list now in force. A running host closed its scope when the list moved to a new key, and accepted a plan signed by that key. ${n('hostsJudged')} host checks passed, up from ${n('hostsWas')}, and ${n('regression')} older engine checks are unchanged.`),
  R('ch2_limits', `F: What is still open? | M: A rule signed by a key that a rotation later drops stays loaded on devices that had loaded it, so they and a fresh device would read that change differently. There is also no signing tool or admin screen yet.`),
  R('ch3_card', `F: What travels today? | M: When a document is completed, the document and every consequence: stock, shipments, ledger lines. For a sample order, ${n('orderOps')} operations.`),
  R('ch3_ask', `F: What was the experiment? | M: Send only the document and the words complete it, and let the second device work out the rest. ${n('thinN')} kinds of document were tried. The sample order drops from ${n('orderToday')} bytes to ${n('orderThin')}.`),
  R('ch3_result', `F: Did the second device get the same answer? | M: For ${n('thinDerivable')} of the ${n('thinN')}, yes: the same operations, step for step, on its own local ids. ${n('thinInconclusive')} could not be judged, each for a stated reason, and none was found not derivable.`),
  R('ch3_bytes', `F: How much smaller is it overall? | M: Across the ${n('thinDerivable')}, ${n('bytesToday')} bytes today against ${n('bytesThin')} thin: ${n('bytesSaving')} percent less. The order alone drops by ${n('orderSaving')} percent.`),
  R('ch3_check', `F: Could the comparison itself be fooling us? | M: It was tested with ${n('cmpMutantsOf')} deliberate faults. Drop an operation, or change a value, and all ${n('mutDrop')} kinds were flagged. Shift the clock, and ${n('mutClock')} of the ${n('mutOf')} were flagged: exactly the ${n('clockClasses')} whose results record a processed time.`),
  R('ch3_m1', `F: So is it ready to ship? | M: No. This is evidence only, and ${n('mustBuild')} things must be built first. The message itself must carry the time, which matters for ${n('clockClasses')} types, and the document numbers the first device allocated, which matter for orders and invoices.`),
  R('ch3_m2', `F: What if the same message arrives twice? | M: Then a guard matters. Completing a completed document does not do nothing: it closes it, or changes its next action. Real iDempiere behaves the same way, so the message must say from which status to which: draft to complete only.`),
  R('ch3_m3', `F: And the rest? | M: A completion makes up to ${n('uuMax')} generated records, and each device would mint different ids, so they must be made deterministic. There is no version check yet either. And ${n('thinInconclusive')} kinds are still to judge.`),
  R('ch4_card', `F: So where does that leave us? | M: Rules and keys are merged and checked on real devices, and the last piece is evidence only.`),
  R('ch4_ledger', `F: In short? | M: Rules can be published and keys can be rotated. The thin pipe works for ${n('thinDerivable')} of ${n('thinN')} kinds and saves ${n('bytesSaving')} percent, but ${n('mustBuild')} things come first and nothing is shipped. Whether to go thin is the owner's decision.`),
  R('ch4_src', `F: Where do the numbers come from? | M: From the check logs and project notes listed here, as they stood on the day of recording. Nothing is estimated.`)
];
const SRCOF = keys => keys.length ? [...new Set(keys)].map(k => k + ' <- ' + X.SRC[k]).join('; ') : 'fixed text (no figures)';
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
  if (order.join() !== ROWS.map(r => r[0]).join()) throw new Error('beat order in film.log differs from the narration rows:\n' + order.join() + '\n' + ROWS.map(r => r[0]).join());
}
const rows = ROWS.map(([id, keys, det]) => {
  det = det.replace(/\s+,/g, ',').replace(/, \./g, '.');
  let a = 0, e = 999;
  if (mode === 'build') { a = cues[id]; if (a === undefined) throw new Error('no cue for ' + id); const nx = order[order.indexOf(id) + 1]; e = nx ? cues[nx] : endT; if (e === null || e === undefined) throw new Error('no film end'); }
  return [id, a.toFixed(2), e.toFixed(2), SRCOF(keys), short(det), det].join('\t');
});
const WORDS = {}; ONES.forEach((x, i) => { WORDS[x] = i; }); TENS.forEach((x, i) => { if (i >= 2) WORDS[x] = i * 10; });
function check(rowsIn, log) {                                 // returns the number of problems; prints them when log is true
  const spoken = [];
  rowsIn.forEach(r => { const id = r.split('\t')[0], toks = r.split('\t')[5].toLowerCase().split(/\s+/); let total = 0, cur = 0, inRun = false;
    const flush = () => { if (inRun) spoken.push([id, total + cur]); total = 0; cur = 0; inRun = false; };
    toks.forEach(tk => { const brk = /[,.?!:;]$/.test(tk), t = tk.replace(/[,.?!:;"]/g, '');
      if (WORDS[t] !== undefined || t === 'hundred' || t === 'thousand') { inRun = true; if (t === 'hundred') cur = (cur || 1) * 100; else if (t === 'thousand') { total += (cur || 1) * 1000; cur = 0; } else cur += WORDS[t]; if (brk) flush(); }
      else flush(); }); flush(); });
  let bad = 0; const spokenCount = {}; spoken.forEach(([id, v]) => { spokenCount[v] = (spokenCount[v] || 0) + 1; });
  Object.keys(spokenCount).forEach(v => { if (spokenCount[v] !== (CALLS[v] || 0)) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${spokenCount[v]} times (${spoken.filter(s => s[1] == v).map(s => s[0]).join(',')}) but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!spokenCount[v]) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  rowsIn.forEach(r => { if (/\d/.test(r.split('\t')[5])) { bad++; if (log) console.log('§NUM_CHECK digit in narration of ' + r.split('\t')[0] + '  WRONG'); } });
  return { bad, n: spoken.length };
}
const main = check(rows, true), bad = main.bad, spoken = { length: main.n };
{ const mut = rows.map(r => r.replace('forty five', 'forty six')), c1 = check(mut, false);
  const mut2 = rows.map((r, i) => i === 0 ? r.replace('Pieces of work', 'Seven pieces of work') : r), c2 = check(mut2, false);
  console.log(`§NUM_CHECK_CONTROL number word changed (forty five -> forty six): ${c1.bad > 0 ? 'detected' : 'NOT DETECTED'} · an invented spoken number added: ${c2.bad > 0 ? 'detected' : 'NOT DETECTED'} ${c1.bad > 0 && c2.bad > 0 ? 'PASS' : 'FAIL'}`); if (!(c1.bad > 0 && c2.bad > 0)) process.exit(3); }
console.log(`§NUM_CHECK numbers_spoken=${spoken.length} facts_used=${Object.keys(USED).length} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${X.SRC[k]}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: X.SRC, spokenUsed: USED, inputs: X.INPUTS }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
