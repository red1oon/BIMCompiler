// ⚠ DO NOT REMOVE — Scope (THAI copy, English untouched; reads cards6_th.js and shot_captions_th.json): WORDS witness for Film 6 (adapted from film5/film5_words.js, which stays as it is). Scans every on-screen text (the cards of cards6.js with the resolved facts, the shot captions), the narration TSV (spoken text) and the burned captions (an .ass file, credit line excepted)
// for words the film must not carry: the project's Civil Works place name, internal jargon, and claims of being first / novel. Whole-word, case-insensitive. A control proves the scan sees a planted word. Read the log: §WORDS_*.
// Usage: node film6_words.js <narration.tsv> [captions.ass]
'use strict';
const fs = require('fs'), path = require('path');
const [tsv, ass] = process.argv.slice(2);
const X = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'claims6.json'), 'utf8')), Cards = require('./cards6_th.js').build(X, CL);
const BAN = ['jelapang', 'mutant', 'mutants', 'upcaster', 'upcasters', 'witness', 'witnesses', 'witnessed', 'genesis', 'novel', 'unique', 'revolutionary', 'breakthrough', 'first of its kind', 'world first', 'never before', 'no one else', 'nobody else', 'unsolved', 'hiatus', 'ai', 'llm', 'blockchain'];
const re = w => new RegExp('(^|[^A-Za-z_])' + w.replace(/ /g, '\\s+') + '($|[^A-Za-z_])', 'i');
const strip = h => h.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const caps = Object.values(JSON.parse(fs.readFileSync(path.join(__dirname, 'shot_captions_th.json'), 'utf8')));
const texts = [...Object.entries(Cards.C).map(([k, h]) => ['card:' + k, strip(h)]), ...caps.map((c, i) => ['caption:' + i, c]), ...fs.readFileSync(tsv, 'utf8').split('\n').filter(Boolean).map(l => { const p = l.split('\t'); return ['spoken:' + p[0], p[5]]; })];
if (ass) fs.readFileSync(ass, 'utf8').split('\n').filter(l => /^Dialogue:/.test(l) && !/Credit/.test(l)).forEach((l, i) => texts.push(['ass:' + i, l.split(',').slice(9).join(',')]));
let hits = 0; texts.forEach(([id, t]) => BAN.forEach(w => { if (re(w).test(t)) { hits++; console.log(`§WORDS_HIT ${id} "${w}"`); } }));
const ctl = re('jelapang').test('the Jelapang road') && !re('ai').test('said'); console.log(`§WORDS_CONTROL a planted banned word is ${ctl ? 'detected' : 'NOT DETECTED'}`);
console.log(`§WORDS texts=${texts.length} hits=${hits} ${!ctl ? 'INCONCLUSIVE' : hits ? 'FAIL' : 'PASS'}`); process.exit(hits || !ctl ? 1 : 0);
