// ⚠ DO NOT REMOVE — film "Remember The Name - red1" (prompts/CLI_ERP_IVR.md §22.13; prompts/FILM_COMMAND_LINE_ERP.md "CH red1"): the beats, their narration (F asks, M answers: lively, one short exchange each, the picture does the explaining)
// and the facts each beat speaks. EVERY figure in the text is written from out/facts.json (this build's own recording) through words(); guard.js re-checks each `says` entry against facts.json and that nothing on the not-said list is spoken.
// A beat's `id` is also its recorded step in script.json (rec.py). English only (Kokoro, local CPU). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {   // 0..9999, English, as spoken: 1193 -> one thousand one hundred and ninety-three
  if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  return ONES[Math.floor(n / 1000)] + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
}
const w = words, c1 = F.clash1, pk = F.pick;
const EN = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: How do I start? | M: One word. Red one. And a prompt waits for you.', says: [] },
  { id: 'help', text: 'F: What words does it know? | M: ' + w(F.session.words) + '. Each one prints the door line it runs.', says: [['session.words', String(F.session.words), w(F.session.words)]] },
  { id: 'cd', text: 'F: And to go into a building? | M: Cd, like any shell. The prompt now says Duplex.', says: [] },
  { id: 'count', text: 'F: How many elements? | M: ' + w(F.count.total) + ', by discipline. That first line started the viewer in the background, so it took ' + w(F.count.sec) + ' seconds here.', says: [['count.total', String(F.count.total), w(F.count.total)], ['count.sec', String(F.count.sec), w(F.count.sec) + ' seconds']] },
  { id: 'clash', text: 'F: Clashes, architecture against M E P? | M: The line it runs, and a funnel. ' + w(c1.bboxOverlaps) + ' boxes overlap. ' + w(c1.meshClashes) + ' really clash. ' + w(c1.cleared) + ' are cleared by the shape tests.', says: [['clash1.bboxOverlaps', String(c1.bboxOverlaps), w(c1.bboxOverlaps)], ['clash1.meshClashes', String(c1.meshClashes), w(c1.meshClashes)], ['clash1.cleared', String(c1.cleared), w(c1.cleared)]] },
  { id: 'ls', text: 'F: Which of those touch a bath? | M: L S, and a pattern. It does not run again. It reads the answer above. ' + w(F.ls.matched) + ' of the ' + w(F.ls.of) + ' rows match.', says: [['ls.matched', String(F.ls.matched), w(F.ls.matched) + ' of'], ['ls.of', String(F.ls.of), w(F.ls.of)]] },
  { id: 'menu', text: 'F: And if I forget the disciplines? | M: Then a menu springs up. The building\'s own ' + w(F.menu.n) + '.', says: [['menu.n', String(F.menu.n), w(F.menu.n)]] },
  { id: 'pick', text: 'F: Pick with the arrow keys? | M: Down, return. Down, down, down, return. The line it ran says ' + F.pick.discA + ' against ' + F.pick.discB + '. ' + w(pk.bboxOverlaps) + ' boxes overlap, ' + w(pk.meshClashes) + ' clash.', says: [['pick.bboxOverlaps', String(pk.bboxOverlaps), w(pk.bboxOverlaps)], ['pick.meshClashes', String(pk.meshClashes), w(pk.meshClashes)]] },
  { id: 'element', text: 'F: Can I go inside the building? | M: Cd Element. The prompt says Duplex slash Element, with ' + w(F.element.props) + ' properties.', says: [['element.props', String(F.element.props), w(F.element.props) + ' properties']] },
  { id: 'lsel', text: 'F: Find the bathrooms? | M: A column, and a pattern. ' + w(F.lsel.shown) + ' elements: ' + w(F.lsel.spaces) + ' bathroom spaces and ' + w(F.lsel.tubs) + ' bath tubs.', says: [['lsel.shown', String(F.lsel.shown), w(F.lsel.shown) + ' elements'], ['lsel.spaces', String(F.lsel.spaces), w(F.lsel.spaces) + ' bathroom spaces'], ['lsel.tubs', String(F.lsel.tubs), w(F.lsel.tubs) + ' bath tubs']] },
  { id: 'group', text: 'F: And across the storeys? | M: Group storey. ' + w(F.group.groups) + ' groups. Level two holds ' + w(F.group.level2) + '. ' + w(F.group.unknown) + ' have no storey, so they say unknown.', says: [['group.groups', String(F.group.groups), w(F.group.groups) + ' groups'], ['group.level2', String(F.group.level2), w(F.group.level2)], ['group.unknown', String(F.group.unknown), w(F.group.unknown)]] },
  { id: 'pwd', text: 'F: Where am I? | M: P W D. The building and the kind, as door keys.', says: [] },
  { id: 'exit', text: 'M: Exit, and you are back in the shell. | F: Remember the name. | M: Red one.', says: [] },
  { id: 'end', hold: 9 }   // the end card, silent: the voice tool's own credit line takes the last seconds
];
EN.forEach(b => { if (b.text) b.text = b.text.replace(/(^|[.?!] |: )([a-z])/g, (m, a, c) => a + c.toUpperCase()); });   // a spoken number opens a sentence: the caption shows it capitalised
exports.lang = 'en'; exports.beats = EN; exports.words = words;
