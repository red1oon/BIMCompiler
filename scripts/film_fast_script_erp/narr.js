// ⚠ DO NOT REMOVE — film "Fast Script ERP" (prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"; cloned from film_red1_shell): the beats, their narration (F asks, M answers: lively, one short exchange each, the picture does the explaining)
// and the facts each beat speaks. EVERY figure in the text is written from out/facts.json (this build's own recording) through words(); guard.js re-checks each `says` entry against facts.json and that nothing on the not-said list is spoken.
// A beat's `id` is also its recorded step in script.json (rec.py). English only (Kokoro, local CPU). The narration says only what the screen shows and claims nothing that is not built (one line names the next step, posting the cost to the ERP Project Order, as "being built": the owner's words, 2026-11-16). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {   // 0..999,999,999, English, as spoken: 1193 -> one thousand one hundred and ninety-three
  if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  if (n < 1e6) return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
  return words(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? (n % 1e6 < 100 ? ' and ' : ' ') + words(n % 1e6) : '');
}
const w = words, S = (p, v, word) => [p, String(v), word];
const EN = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: How do I start? | M: Type red one. The greeting counts its verbs and its words: ' + w(F.greet.verbs) + ' verbs, ' + w(F.greet.words) + ' words. Then a tip.', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + ' verbs'), S('greet.words', F.greet.words, w(F.greet.words) + ' words')] },
  { id: 'help', text: 'F: What can it do? | M: ' + w(F.help.groups) + ' groups: B I M, M I S and E R P. The E R P group has ' + w(F.help.erpN) + ' words: do, run and next.', says: [S('help.groups', F.help.groups, w(F.help.groups) + ' groups'), S('help.erpN', F.help.erpN, w(F.help.erpN) + ' words')] },
  { id: 'level', text: 'F: Can it explain a word? | M: Level student, then help run. It says what the word does, and the line it runs.', says: [] },
  { id: 'bp', text: 'F: How do I get to a table? | M: Type a few letters. A grey suggestion appears, and Tab takes it. Then ls: ' + w(F.bp.shown) + ' of ' + w(F.bp.of) + ' business partners.', says: [S('bp.shown', F.bp.shown, w(F.bp.shown) + ' of'), S('bp.of', F.bp.of, w(F.bp.of) + ' business')] },
  { id: 'po1', text: 'F: Can it run a process? | M: Run, and the name of the process. It asks its questions in the order of the dictionary. The project comes first: ' + w(F.po.project.n) + ' to pick from.', says: [S('po.project.n', F.po.project.n, w(F.po.project.n) + ' to pick')] },
  { id: 'po2', text: 'F: And the phase? | M: Only the ' + w(F.po.phase.n) + ' phases of that project are offered. I leave it out.', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + ' phases')] },
  { id: 'po3', text: 'F: The project line? | M: ' + w(F.po.line.n) + ' lines. I leave this out too.', says: [S('po.line.n', F.po.line.n, w(F.po.line.n) + ' lines')] },
  { id: 'po4', text: 'F: And the last question? | M: Consolidate keeps its default, yes. Enter, and the full line it runs is printed. ' + w(F.po.run.orders) + ' purchase orders are made, from ' + w(F.po.run.orderLines) + ' order lines.', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + ' purchase orders'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + ' order lines')] },
  { id: 'ord', text: 'F: Where did they go? | M: Cd order, and list by description. ' + w(F.ord.rows) + ' orders, all drafts.', says: [S('ord.rows', F.ord.rows, w(F.ord.rows) + ' orders')] },
  { id: 'co', text: 'F: Can I complete an order? | M: Do C O and its number. The status goes from D R to C O, and the grand total is ' + w(F.co.total) + '.', says: [S('co.total', F.co.total, 'total is ' + w(F.co.total))] },
  { id: 'next', text: 'F: What may it do now? | M: Next, and the number. The legal moves come as a tree. Close and void have words. R E has none yet.', says: [S('next.withWord', F.next.withWord.join(','), 'close and void'), S('next.noWord', F.next.noWord.join(','), 'r e has none')] },
  { id: 'gap', text: 'F: And a process it cannot run? | M: ' + F.gap.process + ' has no J S port yet. Red one says so, and says the gap is in red one, not your mistake.', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: Can I tell the owners? | M: Report shows the draft. Nothing is sent until you open it.', says: [] },
  { id: 'url', text: 'F: And to send it? | M: Choose the GitHub issue, and the link prints: ' + w(F.url.chars) + ' characters. Opening it is your move.', says: [S('url.chars', F.url.chars, w(F.url.chars) + ' characters')] },
  { id: 'cost', text: 'F: And back in the building? | M: Duplex. Cost by discipline prices ' + w(F.cost.elements) + ' elements, ' + w(F.cost.total) + ' in all. The rows add up to it. Posting that cost to the E R P project order is being built.', says: [S('cost.elements', F.cost.elements, w(F.cost.elements) + ' elements'), S('cost.total', F.cost.total, w(F.cost.total) + ' in all')] },
  { id: 'exit', text: 'M: Exit, and you are back in the shell. | F: Remember the name. | M: Red one.', says: [] },
  { id: 'end', hold: 9 }   // the end card, silent: the voice tool's own credit line takes the last seconds
];
EN.forEach(b => { if (b.text) b.text = b.text.replace(/(^|[.?!] |: )([a-z])/g, (m, a, c) => a + c.toUpperCase()); });   // a spoken number opens a sentence: the caption shows it capitalised
exports.lang = 'en'; exports.beats = EN; exports.words = words;
