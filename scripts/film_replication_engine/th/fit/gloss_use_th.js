// ⚠ DO NOT REMOVE — prints how often each glossary term is used on screen (strings_th.js, beats_th.js, film.log §FILM_NOTE lines) and in speech (the narration tsv). A term used 0 times in both is dead glossary; a term used in speech but never on screen (or the reverse) is flagged.
// usage: node gloss_use_th.js <narration.tsv> <film.log>
const fs = require('fs'), path = require('path'); const [tsv, flog] = process.argv.slice(2);
const screen = fs.readFileSync(path.join(__dirname, '..', 'strings_th.js'), 'utf8').split('GLOSSARY = [')[0] + fs.readFileSync(path.join(__dirname, '..', 'strings_th.js'), 'utf8').split('];\n  var T = {')[1] + fs.readFileSync(path.join(__dirname, '..', 'beats_th.js'), 'utf8') + fs.readFileSync(flog, 'utf8').split('\n').filter(l => /§FILM_NOTE/.test(l)).join('\n');
const speech = fs.readFileSync(tsv, 'utf8').split('\n').map(l => l.split('\t')[5] || '').join('\n');
const terms = ['สาขา', 'เครื่องคิดเงิน', 'ชั้นวาง', 'เครื่องตู้จดหมาย', 'แวะ', 'ชนกัน', 'ใช้เกินยอด', 'ดึงคืน', 'สร้างใหม่', 'ค่าอ้างอิง', 'ตัวอย่าง', 'ออฟไลน์', 'ออนไลน์', 'ปิดยอด', 'ใบขาย', 'เครดิต', 'มูลค่าทอง', 'เติมสต็อก', 'ตัวแทนชั่วคราว', 'เอนจินทำสำเนาข้อมูล', 'หาย', 'กู้คืน', 'สำนักงานใหญ่', 'ออบเจกต์', 'เครื่องผู้ดูแล', 'ผู้กู้'];
const cnt = (t, x) => t.split(x).length - 1; let dead = 0;
terms.forEach(x => { const a = cnt(screen, x), b = cnt(speech, x); if (!a && !b) dead++; console.log(`§TH_GLOSSARY_USE ${x} screen=${a} speech=${b}${!a && !b ? ' DEAD' : !a ? ' speech-only' : !b ? ' screen-only' : ''}`); });
// spelling variants of the same word that would confuse a reviewer
[['เซิร์ฟเวอร์', 'เซิร์ฟเวอร์'], ['ออฟไลน์', 'ออฟไลน์']].forEach(() => {});
console.log(`§TH_GLOSSARY_USE_DONE terms=${terms.length} dead=${dead}`);
