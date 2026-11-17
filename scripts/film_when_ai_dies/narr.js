// ⚠ DO NOT REMOVE — film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md), the beats and their narration (F asks what a newcomer would ask, M answers in one or two plain sentences; the picture explains). English text is BUILT from
// facts_view.js: every figure goes through n('<fact key>'), which spells the value from the evidence in words and records [key, value, words] in the beat's `says`. guard.js parses the finished text for numbers
// independently and FAILS one that is not a recorded fact (or a declared plain idiom: a key name, "Alt and one"). READ out/guard.log.
'use strict';
const V = require('./facts_view.js'), lang = process.env.FILM_LANG || 'en';
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = n => { n = Number(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : ''); };
// the roadmap card's items (prompts/CODE_ARCHITECTURE_DESIGN.md §0 table, read by guard.js): the count the voice says is the length of this list
const ROADMAP = [['B1', 'the Modeller\'s module manifest (next: its build spec is written; B0, the check, is built)'], ['C', 'named parts of the shared object, each with one owner'], ['D', 'an owner table: which file answers which question'], ['E', 'a proof map: which test proves which rule']];
const mk = (id, build, extra) => { const says = [], n = (k, w) => { const val = k === 'roadmap.items' ? String(ROADMAP.length) : V.v(k); const sp = w ? w(val) : (lang !== 'en' ? val : words(val)); says.push([k, val, sp]); return sp; };
  const cap = t => t.replace(/(^F: |M: |[.?!] )([a-z])/g, (m, a, b) => a + b.toUpperCase());
  return Object.assign({ id, text: cap(build(n)), says }, extra || {}); };
const EN = [
  { id: 'cover', hold: 4.2 },
  mk('before', n => 'F: What if the assistant just stops answering? | M: Then vibe coding stops with it. This is the real editor with its A.I. features switched off in the settings, and only ' + n('ext.count') + ' add-on, which does nothing but read the repo.', { plain: [] }),
  mk('q1', n => 'F: Where is this field used? | M: Shift F twelve. Every place the app sets or reads it: ' + n('refs.places') + ', in ' + n('refs.files') + ' files, under any spelling. The editor on its own finds ' + n('refs.builtin_defs') + ' other definitions.', { plain: ['twelve'] }),
  mk('q2', n => 'F: What runs when I change a field? | M: Hover it in the ERP window. ' + n('erp.layers') + ' layers of code, in the order they fire: the dictionary, the callout on change, the picker\'s rule, the hooks on save. Press Alt and one, and the editor opens that line. | F: Is it ever wrong? | M: Checked on ' + n('erp.fields') + ' fields: ' + n('erp.wrong_line') + ' wrong lines.', { plain: ['one'] }),
  mk('q3', n => 'F: What did this line print last time? | M: Hover the tag. It shows the last value, ' + n('tag.hosted_total') + ' hosted elements here, and the log and the commit it came from. If the code changed since, it says why it shows nothing.'),
  mk('q4', n => 'F: Am I breaking replay? | M: Type a clock call into a core file. The editor underlines it, says why, and what to call instead. CI would fail the same call, and ' + n('purity.core_files') + ' core files are watched.'),
  mk('q5', n => 'F: Did I ship it right? | M: Press Bump. It checks in the background, turns solid, and a second press writes the cache version, up by ' + n('bump.step') + '. For an ERP file it adds the legacy parity gate, whose own test passes ' + n('bump.parity_judged') + ' checks.'),
  mk('why', n => 'F: Why can it not be wrong about my code? | M: It holds no knowledge of the code. It reads what the repo generates, and says so when it does not know. We did not cut the network; we listed every place its code could reach it. ' + n('off.features') + ' features, ' + n('off.net') + ' doors. Only fetching the live site and deploying talk to GitHub.'),
  mk('passenger', n => 'F: And when the assistant comes back? | M: It rides as a passenger. This command copies the facts about the open file, ' + n('ctx.lines') + ' lines, for it to read. The editor calls no model.'),
  mk('roadmap', n => 'F: What is not built yet? | M: ' + n('roadmap.items') + ' things, and they are only designed. The Modeller\'s manifest comes next, then named parts, an owner table and a proof map.', { plain: [] }),
  mk('close', n => 'F: So what is left when the A.I. dies? | M: What your tools know. Where it is used, what runs, what it printed, whether replay breaks, whether you shipped it right. | F: Where do I read more? | M: The Developer Guide, the X0 Navigator section. The link and the prior art are on this card.')
];
exports.lang = lang; exports.beats = lang === 'th' ? require('./narr_th.js')(V, ROADMAP, mk) : lang === 'zh' ? require('./narr_zh.js')(V, ROADMAP, mk) : EN; exports.words = words; exports.ROADMAP = ROADMAP;
