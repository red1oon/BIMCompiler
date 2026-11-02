// ⚠ DO NOT REMOVE — Scope: WORDS witness for Film 5. Scans every on-screen text (cards_audit.json, all reveal states via cards5.js), the narration TSV (spoken text and its source column) and the burned captions (an .ass file) for words the film must not carry:
// the project's Civil Works place name, internal jargon, and claims of being first / novel (§16.35.1 (h): novelty is NOT established). Whole-word, case-insensitive. A control proves the scan sees a planted word. Read the log: §WORDS_*.
// Usage: node film5_words.js <passDir> <narration.tsv> [captions.ass]
'use strict';
const fs = require('fs'), path = require('path');
const [dir, tsv, ass] = process.argv.slice(2);
const X = require('./facts5.js').build(), Cards = require('./cards5.js').build(X);
const BAN = ['jelapang', 'mutant', 'mutants', 'upcaster', 'upcasters', 'witness', 'witnesses', 'genesis', 'novel', 'unique', 'revolutionary', 'breakthrough', 'first of its kind', 'world first', 'never before', 'no one else', 'nobody else', 'unsolved', 'hiatus', 'ai', 'llm', 'blockchain'];
const re = w => new RegExp('(^|[^A-Za-z_])' + w.replace(/ /g, '\\s+') + '($|[^A-Za-z_])', 'i');            // '_' counts as a word character: file names such as witness_comm_plantrust.log are not prose
function scan(texts) { const hits = []; texts.forEach(t => BAN.forEach(w => { if (re(w).test(t.text)) hits.push(`${t.where}: "${w}" in "${t.text.slice(0, 90)}"`); })); return hits; }
const texts = [];
const html2txt = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
Object.keys(Cards.C).forEach(id => texts.push({ where: 'card ' + id, text: html2txt(Cards.C[id]) }));
Object.keys(Cards.SRCTAG).forEach(id => texts.push({ where: 'source tag ' + id, text: Cards.SRCTAG[id] }));
fs.readFileSync(tsv, 'utf8').split('\n').filter(Boolean).forEach(l => { const f = l.split('\t'); texts.push({ where: 'narration ' + f[0], text: f[5] }); texts.push({ where: 'narration source ' + f[0], text: f[3] }); });
let exempt = 0; if (ass) fs.readFileSync(ass, 'utf8').split('\n').filter(l => l.startsWith('Dialogue:')).forEach((l, i) => { const tx = l.split(',').slice(9).join(','); if (/^Voices: AI-generated \(Kokoro, local\)/.test(tx)) { exempt++; console.log('§WORDS_EXEMPT the disclosure credit line is kept on purpose: "' + tx + '"'); return; } texts.push({ where: 'caption ' + i, text: tx }); });
const hits = scan(texts);
hits.forEach(h => console.log('§WORDS_HIT ' + h));
console.log(`§WORDS texts=${texts.length} banned_words=${BAN.length} hits=${hits.length} ${hits.length ? 'FAIL' : 'PASS'}`);
const planted = scan(texts.concat([{ where: 'planted', text: 'This is Jelapang, a novel mutant AI.' }]));
console.log(`§WORDS_CONTROL a planted sentence is ${planted.length >= 4 ? 'detected (' + planted.length + ' hits)' : 'NOT detected'} ${planted.length >= 4 ? 'PASS' : 'FAIL'}`);
if (hits.length || planted.length < 4) process.exit(1);
