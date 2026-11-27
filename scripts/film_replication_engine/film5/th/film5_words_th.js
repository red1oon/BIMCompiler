// ⚠ DO NOT REMOVE — Scope: WORDS witness for the Thai cut of Film 5 (THAI copy of ../film5_words.js: same Latin ban list, plus Thai equivalents). Scans every on-screen text (all reveal states via cards5_th.js + the source tags), the narration TSV (spoken text and its source column)
// and the burned captions (an .ass file) for words the film must not carry: the project's Civil Works place name, internal jargon, and claims of being first / novel (§16.35.1 (h): novelty is NOT established). Whole-word for Latin words, substring for Thai. A control proves the scan sees planted words.
// The Thai credit line (voice disclosure, "สร้างโดย AI") is kept on purpose and reported as exempt, as the English cut exempted its Kokoro credit. Usage: node film5_words_th.js <narration.tsv> [captions.ass]   Read the log: §WORDS_*.
'use strict';
const fs = require('fs');
const [tsv, ass] = process.argv.slice(2);
const X = require('./facts5_th.js').build(), Cards = require('./cards5_th.js').build(X);
const BAN = ['jelapang', 'mutant', 'mutants', 'upcaster', 'upcasters', 'witness', 'witnesses', 'genesis', 'novel', 'unique', 'revolutionary', 'breakthrough', 'first of its kind', 'world first', 'never before', 'no one else', 'nobody else', 'unsolved', 'hiatus', 'ai', 'llm', 'blockchain'];
const BANTH = ['เจลาปัง', 'มิวแทนท์', 'ครั้งแรกของโลก', 'ไม่เคยมีมาก่อน', 'ปฏิวัติ', 'เป็นเจ้าแรก', 'ไม่มีใครทำ', 'ไม่มีใครเหมือน', 'เอไอ', 'ปัญญาประดิษฐ์', 'บล็อกเชน', 'พยานหลักฐาน', 'นวัตกรรมใหม่เอี่ยม', 'ล้ำหน้าที่สุด', 'ดีที่สุดในโลก'];
const re = w => new RegExp('(^|[^A-Za-z_])' + w.replace(/ /g, '\\s+') + '($|[^A-Za-z_])', 'i');
function scan(texts) { const hits = []; texts.forEach(t => { BAN.forEach(w => { if (re(w).test(t.text)) hits.push(`${t.where}: "${w}" in "${t.text.slice(0, 90)}"`); }); BANTH.forEach(w => { if (t.text.indexOf(w) >= 0) hits.push(`${t.where}: "${w}" in "${t.text.slice(0, 90)}"`); }); }); return hits; }
const texts = [];
const html2txt = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
Object.keys(Cards.C).forEach(id => texts.push({ where: 'card ' + id, text: html2txt(Cards.C[id]) }));
Object.keys(Cards.SRCTAG).forEach(id => texts.push({ where: 'source tag ' + id, text: Cards.SRCTAG[id] }));
fs.readFileSync(tsv, 'utf8').split('\n').filter(Boolean).forEach(l => { const f = l.split('\t'); texts.push({ where: 'narration ' + f[0], text: f[5] }); texts.push({ where: 'narration source ' + f[0], text: f[3] }); });
let exempt = 0; if (ass) fs.readFileSync(ass, 'utf8').split('\n').filter(l => l.startsWith('Dialogue:')).forEach((l, i) => { const tx = l.split(',').slice(9).join(','); if (/^เสียง: สร้างโดย AI \(Microsoft Edge TTS/.test(tx)) { exempt++; console.log('§WORDS_EXEMPT the voice-disclosure credit line is kept on purpose: "' + tx + '"'); return; } texts.push({ where: 'caption ' + i, text: tx }); });
const hits = scan(texts); hits.forEach(h => console.log('§WORDS_HIT ' + h));
console.log(`§WORDS texts=${texts.length} banned_latin=${BAN.length} banned_thai=${BANTH.length} credit_lines_exempt=${exempt} hits=${hits.length} ${hits.length ? 'FAIL' : 'PASS'}`);
const planted = scan(texts.concat([{ where: 'planted', text: 'This is Jelapang, a novel mutant AI. ไม่เคยมีมาก่อน' }]));
console.log(`§WORDS_CONTROL planted Latin and Thai words are ${planted.length >= 5 ? 'detected (' + planted.length + ' hits)' : 'NOT detected'} ${planted.length >= 5 ? 'PASS' : 'FAIL'}`);
if (hits.length || planted.length < 5) process.exit(1);
