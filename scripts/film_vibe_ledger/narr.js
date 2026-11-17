// ⚠ DO NOT REMOVE — film "Vibe coding, honestly" (prompts/FILM_VIBE_CODING_LEDGER.md): the beats and their narration (F asks what a newcomer would ask, M answers in one or two plain sentences).
// Every figure goes through n('<fact key>', mode), which spells the value from out/facts.json in words and records [key, value, mode, words] in the beat's `says`. guard.js re-spells each one and
// FAILS a number word that is not a recorded fact. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = n => { n = Math.round(Number(n)); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  if (n < 1e6) return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : ''); return words(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? ' ' + words(n % 1e6) : ''); };
// mode: int (exact) · k (rounded to thousands: "seventy thousand") · m1 (millions, one decimal: "one point four million") · r (rounded to a whole number) · word (the fact already IS a word)
const speak = (val, mode) => { const x = Number(val);
  if (mode === 'word') return String(val); if (mode === 'k') return words(Math.round(x / 1000)) + ' thousand'; if (mode === 'r') return words(Math.round(x));
  if (mode === 'm1') { const m = (Math.round(x / 1e5) / 10).toFixed(1).split('.'); return words(+m[0]) + ' point ' + ONES[+m[1]] + ' million'; } if (!Number.isInteger(x)) throw new Error('int mode on ' + val); return words(x); };
const ROADMAP = [['CI', 'the full witness suite in CI ({ci} of the scripts run there today)'], ['B1', 'the module manifests (the Modeller\'s first: its build spec is written)'], ['C–E', 'named parts, an owner table and a proof map: designed only']];
const val = k => { if (k === 'roadmap.items') return String(ROADMAP.length); if (k === 'size.app.files') return String(+F.v['size.app_js.files'].val + +F.v['size.app_html.files'].val); if (k === 'readme.old') return F.cmds.c3.out[0].match(/About ([\d,]+)/)[1].replace(/,/g, '');
  if (!F.v[k]) throw new Error('no fact ' + k); return F.v[k].val; };
const mk = (id, build, extra) => { const says = [], n = (k, mode) => { const v = val(k), sp = speak(v, mode || 'int'); says.push([k, v, mode || 'int', sp]); return sp; };
  const cap = t => t.replace(/(^F: |M: |[.?!] )([a-z])/g, (m, a, b) => a + b.toUpperCase());
  return Object.assign({ id, text: cap(build(n)), says }, extra || {}); };
const ch = (id) => ({ id, hold: 3.6 });
const beats = [
  { id: 'cover', hold: 4.2 },
  mk('before', n => 'F: Is vibe coding a good idea? | M: The industry is not so sure. In the biggest developer survey of the year, ' + n('so.distrust') + ' percent distrust the accuracy of A.I. tools, and only ' + n('so.trust') + ' percent trust it. One security study found risky flaws in ' + n('vc.flaw') + ' percent of its tests of A.I. code.'),
  mk('after', n => 'F: So why this project? | M: One person, a machine, and an A.I., all in the open. That is ' + n('commits') + ' commits since May. | F: Checked by hand? | M: By scripts. That is the whole story.'),
  ch('ch1'),
  mk('u1', n => 'F: What is unique about it? | M: One browser tab runs a building viewer, a modeller and a full E.R.P. No server, no install, no build step. The whole app has ' + n('deps') + ' runtime dependency: the database engine.'),
  mk('u2', n => 'F: How do the two apps share their data? | M: Through one signed log. Every change is a record, signed and chained to the one before. This check plants forged and revoked records, and each is rejected. | F: How many checks? | M: ' + n('rv.checks') + ', and all of them pass.'),
  ch('ch2'),
  mk('v1', n => 'F: Why does vibe coding work here? | M: Because an A.I. copies patterns well. The E.R.P. follows ' + n('erp.years') + ' years of open iDempiere code, and it sailed: ' + n('erp.june') + ' E.R.P. commits in June alone. | F: And the geometry? | M: No pattern to copy. Ask whether a wall sits on a slab, and the A.I. guesses.'),
  mk('v2', n => 'F: So who checks the guesses? | M: Witness scripts. This repo has ' + n('witness.files') + ' of them. Each one states a claim as numbers, and must say so when it judged nothing.'),
  ch('ch3'),
  mk('s1', n => 'F: Does it scale? | M: About ' + n('size.app_js.lines', 'k') + ' lines of app code, with no build step, and nearly as many lines of witnesses beside it. | F: What holds it together? | M: A pure core of ' + n('pure.files') + ' files that may not read the clock or the network. C.I. checks it on every push, and finds ' + n('pure.forbidden') + ' breaks.'),
  mk('s2', n => 'F: What is not there yet? | M: The next guardrails are only designed: a module list per app, named parts, an owner table. The E.R.P. already caches ' + n('precache.erp') + ' files for offline use, so those lists matter. And one check takes about ' + n('c7.s') + ' seconds, so C.I. skips it.'),
  ch('ch4'),
  mk('l1', n => 'F: How does it compare with iDempiere, where it came from? | M: iDempiere is about ' + n('idem.lines', 'm1') + ' lines of Java, on a server, with PostgreSQL. The Kernel E.R.P. folds it into about ' + n('erp.lines', 'k') + ' lines of JavaScript, in the tab. | F: Are the books the same? | M: On every scenario compared, ' + n('par.match') + ' of them, to the cent. But only ' + n('par.tables') + ' of ' + n('par.tables_of') + ' document tables are covered so far.'),
  mk('l2', n => 'F: And Odoo, or E.R.P. Next? Are they P.H.P.? | M: No, both are Python on the server, and both already write much of their screen in JavaScript: Odoo about ' + n('lang.odoo.js', 'r') + ' percent. But their books still need a server and a database server. Ours stay in the tab.'),
  mk('l3', n => 'F: So is the legacy worse? | M: Not at all. Java gives iDempiere types, a compiler and a debugger, which catch mistakes before they run. Odoo has about ' + n('stars.odoo', 'k') + ' stars on GitHub; this project has ' + n('stars.ours') + '. We trade that for no server, and fill the gap with witnesses.'),
  ch('ch5'),
  mk('c1', n => 'F: Did it ever go wrong? | M: Yes, the way vibe coding goes wrong everywhere. Witnesses that passed without judging anything. One session that took back the same finding ' + n('retract.times', 'word') + ' times. A sales cycle marked tested, broken on every window. | F: So what is different? | M: Each failure became a written rule that the next session must read.'),
  mk('c2', n => 'F: Do the checks block a bad commit? | M: Only some. C.I. runs ' + n('ci.total') + ' of the ' + n('witness.files') + ' witnesses. The rest, the geometry ones too, run before a commit, by habit: a promise kept by people and sessions, not by a machine.'),
  mk('c3', n => 'F: And the numbers in your own README? | M: They drifted. It said about ' + n('readme.old') + ' files of app code. Counted with the project\'s own tool: ' + n('size.app.files') + '. | F: Fixed? | M: The same day. And an A.I. review we read had already repeated our first wrong number.'),
  mk('c5', n => 'F: No server means nothing to attack? | M: Smaller, not zero. It still fetches building files from cloud storage, falls back to a public library site, relays team messages through GitHub and Gmail, and talks to the legacy E.R.P.\'s web services. The signing keys live in the tab. | F: And for a newcomer? | M: Steep. A geometry kernel, the iDempiere dictionary as JavaScript, and verbs of its own.'),
  mk('aid', n => 'F: And if the A.I. goes away? | M: Then the editor must know the code. That is the film When A.I. Dies: the real VS Code with its A.I. switched off, still answering from what the repo generates. The link is on the card.'),
  mk('roadmap', n => 'F: What is not built yet? | M: ' + n('roadmap.items') + ' things. The full witness suite in C.I. The module lists. And named parts, an owner table and a proof map, which are only designed.'),
  mk('close', n => 'F: So, does vibe coding work? | M: Here, yes, because nothing is taken on trust. The A.I. writes fast, the witnesses check every claim as numbers, and the weak spots are written down. | F: Where do I read more? | M: The Vibe Programming page. The link and the sources are on this card.')
];
module.exports = { beats, words, speak, ROADMAP, F, val, lang: 'en' };
