// ⚠ DO NOT REMOVE — Scope: the THAI two-voice narration (F = Premwadee, ค่ะ; M = Niwat, ครับ) for the Thai cut of Film 5 "Trust and the thin pipe" (English: ../film5_tsv.js, whose 25 rows this follows, except Chapter 3).
// Chapter 3 (8 English rows, "a second device can work the results out") is WITHDRAWN by FL-8 (TEAMWORK_FRAMEWORK.md §16.0a, §36.1 ⚠ SUPERSEDED) and is replaced by ONE row, ch3_super, a single M line; its claims are traced in facts5_th.js (§SUP_TRACE). No number is spoken there.
// Rules carried over from Film 1's Thai cut (th/film_replication_engine_th_tsv.js, which this reuses): numbers are spelled in Thai words and come ONLY from n('<fact>'); §NUM_CHECK re-reads the finished text with an INDEPENDENT Thai-number parser and compares BY VALUE and COUNT with the facts requested;
// the writer is self-tested against a hand table and a 0..99,999 round trip; no digits; no '?' (Thai is tonal: no pitch rise to edit, so F's questions are written as statements); NO prose number words (หนึ่ง สอง สาม ... also inside words such as ทั้งสอง, สามารถ, ห้าม) — the check would flag them as an unrequested number.
// Usage:  node film5_tsv_th.js measure <passDir> <out.tsv>    (cue 0, end 999: the fitter measures each beat's speech length)
//         node film5_tsv_th.js build   <passDir> <out.tsv>    (cues read from <passDir>/film.log §FILM_CUE lines of the recording)
// Read the log: §TH_NUM_SELFTEST, §NUM_CHECK, §NUM_CHECK_CONTROL, §NUM_USED, §NUM_BEAT.
'use strict';
const fs = require('fs'), path = require('path');
const X = require('./facts5_th.js').build(), F = X.F;
const [mode, dir, out] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const D = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
function below1e6(n) {                                                      // 1..999,999 in Thai words
  const pl = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'], s = String(n).split('').map(Number).reverse(); let r = '';
  for (let i = s.length - 1; i >= 0; i--) { const d = s[i]; if (!d) continue;
    if (i === 0) r += (d === 1 && s.length > 1 ? 'เอ็ด' : D[d]);              // ...1 after a tens/hundreds digit is เอ็ด (11 สิบเอ็ด, 21 ยี่สิบเอ็ด, 101 ร้อยเอ็ด)
    else if (i === 1) r += d === 1 ? 'สิบ' : d === 2 ? 'ยี่สิบ' : D[d] + 'สิบ';  // 10 สิบ (not หนึ่งสิบ), 20 ยี่สิบ
    else r += D[d] + pl[i]; }
  return r; }
const w = n => { n = Math.round(n); if (n === 0) return D[0]; return n >= 1e6 ? w(Math.floor(n / 1e6)) + 'ล้าน' + (n % 1e6 ? below1e6(n % 1e6) : '') : below1e6(n); };
// ---- independent reader: Thai number words -> value ----
const TOK = [['ศูนย์', 0], ['หนึ่ง', 1], ['สอง', 2], ['สาม', 3], ['สี่', 4], ['ห้า', 5], ['หก', 6], ['เจ็ด', 7], ['แปด', 8], ['เก้า', 9], ['ยี่', 2], ['เอ็ด', 1], ['สิบ', 10], ['ร้อย', 100], ['พัน', 1000], ['หมื่น', 10000], ['แสน', 100000], ['ล้าน', 1e6]];
const TOKRE = new RegExp(TOK.map(t => t[0]).sort((a, b) => b.length - a.length).join('|'), 'g'), TV = Object.fromEntries(TOK);
function readRun(tokens) { let total = 0, pend = null, million = 0;
  for (const t of tokens) { const v = TV[t];
    if (t === 'ล้าน') { million = (million + total + (pend === null ? 0 : pend)) * 1e6; total = 0; pend = null; }
    else if (v >= 10) { total += (pend === null ? 1 : pend) * v; pend = null; }
    else { pend = v; } }
  return million + total + (pend === null ? 0 : pend); }
function scan(text) {                                                       // numbers in a Thai text: maximal runs of number tokens with nothing in between
  const runs = []; let m, last = -1, cur = [];
  TOKRE.lastIndex = 0;
  while ((m = TOKRE.exec(text)) !== null) { if (m.index === last && cur.length) cur.push(m[0]); else { if (cur.length) runs.push(cur); cur = [m[0]]; } last = m.index + m[0].length; }
  if (cur.length) runs.push(cur); return runs.map(readRun); }
{ const HAND = { 0: 'ศูนย์', 1: 'หนึ่ง', 2: 'สอง', 10: 'สิบ', 11: 'สิบเอ็ด', 12: 'สิบสอง', 13: 'สิบสาม', 16: 'สิบหก', 20: 'ยี่สิบ', 21: 'ยี่สิบเอ็ด', 22: 'ยี่สิบสอง', 30: 'สามสิบ', 31: 'สามสิบเอ็ด', 45: 'สี่สิบห้า', 47: 'สี่สิบเจ็ด', 51: 'ห้าสิบเอ็ด', 93: 'เก้าสิบสาม', 100: 'หนึ่งร้อย', 101: 'หนึ่งร้อยเอ็ด', 110: 'หนึ่งร้อยสิบ', 111: 'หนึ่งร้อยสิบเอ็ด', 120: 'หนึ่งร้อยยี่สิบ', 121: 'หนึ่งร้อยยี่สิบเอ็ด', 169: 'หนึ่งร้อยหกสิบเก้า',
    1000: 'หนึ่งพัน', 1500: 'หนึ่งพันห้าร้อย', 2300: 'สองพันสามร้อย', 3500: 'สามพันห้าร้อย', 5000: 'ห้าพัน', 10000: 'หนึ่งหมื่น', 27600: 'สองหมื่นเจ็ดพันหกร้อย', 100000: 'หนึ่งแสน', 1000000: 'หนึ่งล้าน' };
  let bad = 0; Object.keys(HAND).forEach(k => { if (w(+k) !== HAND[k]) { bad++; console.log(`§TH_NUM_SELFTEST ${k}: function says ${w(+k)} but the hand table says ${HAND[k]}  WRONG`); } });
  let rt = 0; for (let k = 0; k < 100000; k++) if (scan(w(k))[0] !== k || scan(w(k)).length !== 1) { rt++; if (rt <= 5) console.log(`§TH_NUM_SELFTEST round trip ${k}: wrote ${w(k)} read ${JSON.stringify(scan(w(k)))}  WRONG`); }
  console.log(`§TH_NUM_SELFTEST hand_table=${Object.keys(HAND).length} wrong=${bad} round_trip_0_99999 wrong=${rt} ${bad || rt ? 'FAIL' : 'PASS'}`); if (bad || rt) process.exit(2); }
const USED = {}, CALLS = {}; let rowKeys = [];
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; rowKeys.push(k); return w(Math.abs(v)); };
const R = (id, det) => { const keys = rowKeys; rowKeys = []; return [id, keys, det]; };
const ROWS = [
  R('title', `F: ความเชื่อใจและท่อบาง อยากรู้ว่าเรื่องนี้เกี่ยวกับอะไรค่ะ | M: งานหลายชิ้นบนฟีเจอร์ทีมที่เพิ่งทำเสร็จครับ แต่ละชิ้นวัดด้วยการตรวจอัตโนมัติ และตัวเลขทุกตัวที่เห็นมาจากบันทึกของการตรวจเหล่านั้นครับ`),
  R('ch1_card', `F: ถ้าเครื่องใช้แอปเวอร์ชันเก่า จะเกิดอะไรขึ้นค่ะ | M: แอปจะพักการเปลี่ยนแปลงที่อ่านไม่ออกไว้ก่อนครับ แล้วบอกว่ากำลังรอกฎแปลงรูปแบบจากผู้ดูแลทีมครับ`),
  R('ch1_problem', `F: แล้วก่อนหน้านี้ กฎนั้นไปถึงเครื่องได้อย่างไรค่ะ | M: ผ่านการตั้งค่าของแอปเองเท่านั้นครับ ซึ่งหมายถึงต้องสร้างแอปเวอร์ชันใหม่ ผู้ดูแลไม่มีทางส่งกฎให้เครื่องที่กำลังรออยู่ครับ`),
  R('ch1_how', `F: แล้วของใหม่คืออะไรค่ะ | M: เจ้าของเซ็นกฎแบบออฟไลน์ครับ เครื่องผู้ดูแลประกาศกฎไปในข้อความนโยบายของทีม เครื่องอื่นรับกฎไปในการแวะครั้งถัดไป แล้วการเปลี่ยนแปลงที่รออยู่ก็ถูกอ่าน ไม่ต้องสร้างแอปใหม่ และไม่ต้องมีช่องทางใหม่ครับ`),
  R('ch1_keys', `F: ถ้าเครื่องผู้ดูแลถูกขโมย ก็อยากรู้ว่าจะแอบใส่กฎได้หรือไม่ค่ะ | M: เครื่องเดียวไม่พอครับ ข้อความนโยบายพิสูจน์ว่าเครื่องผู้ดูแลเป็นผู้ส่ง แต่ตัวกฎเองต้องมีลายเซ็นของเจ้าของด้วย ตรวจกับรายการกุญแจที่ปักไว้ตอนตั้งทีม กฎที่ไม่มีลายเซ็น ถูกแก้ เซ็นผิดกุญแจ หรือส่งจากเครื่องที่ไม่ใช่ผู้ดูแล ถูกปฏิเสธทั้งหมดครับ`),
  R('ch1_tested', `F: อยากรู้ว่าทดสอบอย่างไรค่ะ | M: ด้วยเบราว์เซอร์จริง ${n('devices')} ตัวครับ คือผู้ดูแล ผู้เข้าร่วมที่ใช้รูปแบบเก่า และผู้เข้าร่วมทีหลัง แวะครั้งเดียวก็อ่านการเปลี่ยนแปลงที่รออยู่ และผู้เข้าร่วมทีหลังรับกฎไปใช้ในการแวะครั้งแรก ๆ แอปแต่ละตัวผ่านการตรวจ ${n('pubJudged')} ข้อ และจับสำเนาที่จงใจทำให้เสียได้ทั้ง ${n('pubMut')} ชุดครับ`),
  R('ch1_ledger', `F: อยากรู้ว่ารวมเข้าไปแล้วหรือยังค่ะ | M: รวมแล้วครับ ทั้งใน ERP และ Modeller เอนจินผ่านการตรวจ ${n('verJudged')} ข้อ และชุดทดสอบบนเบราว์เซอร์ ${n('suite2382')} ชุดผ่าน ไม่มีที่ล้มเหลว และไม่มีข้อผิดพลาดของหน้า สิ่งที่ยังไม่ได้สร้างคือหน้าจอผู้ดูแล เครื่องมือเซ็นกฎ และวิธีถอนกฎ ทีมเก็บกฎได้สูงสุด ${n('maxSets')} ชุดครับ`),
  R('ch2_card', `F: ถ้ากุญแจของทีมหายหรือรั่ว จะทำอย่างไรค่ะ | M: ที่ผ่านมา รายการกุญแจที่เชื่อถือถูกกำหนดตายตัวตั้งแต่ตั้งทีมครับ ทางออกเดียวคือต้องตั้งทีมใหม่ครับ`),
  R('ch2_keys', `F: แล้วตอนนี้ เปลี่ยนรายการได้อย่างไรค่ะ | M: ด้วยคำแถลงที่เซ็นแล้วครับ ประกอบด้วยรายการใหม่ กุญแจ ${n('keysMin')} ถึง ${n('keysMax')} ดอก ลายนิ้วมือของรายการที่ใช้อยู่ และลายเซ็นจากกุญแจที่อยู่ในรายการนั้นแล้ว เครื่องผู้ดูแลเป็นผู้ส่งครับ`),
  R('ch2_rotate', `F: ช่วยแสดงการหมุนเวียนกุญแจให้ดูหน่อยค่ะ | M: กุญแจหลักเซ็นคำแถลงที่เพิ่มกุญแจอีกดอกครับ ต่อมากุญแจหลักหาย กุญแจสำรองจึงเซ็นรายการใหม่ที่ไม่มีกุญแจหลักนั้น แผนที่เซ็นด้วยกุญแจหลักเดิมจึงไม่เชื่อถืออีกต่อไป ส่วนแผนที่เซ็นด้วยกุญแจใหม่ใช้ได้ครับ`),
  R('ch2_refuse', `F: อยากรู้ว่ามีอะไรบ้างที่ถูกปฏิเสธค่ะ | M: ${n('refusals')} กรณีครับ ถูกปฏิเสธบนเครื่องทั้งคู่ทุกกรณี ได้แก่ ผู้เซ็นที่ไม่อยู่ในรายการ กุญแจที่ถูกแก้ คำแถลงเก่าที่ถูกเอามาใช้ซ้ำ กุญแจส่วนตัวที่ซ่อนอยู่ ผู้ส่งที่ไม่ใช่ผู้ดูแล นโยบายที่ล้าสมัย และทีมที่ตั้งโดยไม่มีรายการครับ`),
  R('ch2_proof', `F: อยากรู้ว่ามีการตรวจกี่ข้อค่ะ | M: ${n('ptJudged')} ข้อครับ ไม่มีที่ล้มเหลว เขียนไว้ก่อนสร้าง และ ${n('redArms')} ข้อล้มเหลวในตอนนั้น ซึ่งเป็นสิ่งที่ควรเป็น สำเนาที่จงใจทำให้เสียถูกจับได้ทั้ง ${n('plantrustMut')} ชุด และข้อความชุดเดียวกัน ${n('reverseOps')} ข้อความ ในลำดับย้อนกลับ ได้รายการเดียวกันครับ`),
  R('ch2_hosts', `F: อยากรู้ว่าแอปต้องเปลี่ยนด้วยหรือไม่ค่ะ | M: ไม่ต้องครับ แอปแต่ละตัวตรวจแผนซ้ำหลังการแวะทุกครั้ง โดยใช้รายการที่มีผลอยู่ตอนนี้ แอปที่เปิดอยู่ปิดขอบเขตของมัน เมื่อรายการย้ายไปเป็นกุญแจใหม่ และยอมรับแผนที่เซ็นด้วยกุญแจนั้น การตรวจของแอปผ่าน ${n('hostsJudged')} ข้อ จากเดิม ${n('hostsWas')} ข้อ และการตรวจเดิมของเอนจิน ${n('regression')} ข้อไม่เปลี่ยนครับ`),
  R('ch2_limits', `F: อยากรู้ว่ายังมีอะไรเปิดอยู่บ้างค่ะ | M: กฎที่เซ็นด้วยกุญแจซึ่งการหมุนเวียนถอนออกภายหลัง ยังคงถูกโหลดอยู่บนเครื่องที่โหลดไปแล้วครับ เครื่องใหม่จะปฏิเสธกฎนั้น ทำให้เครื่องเก่ากับเครื่องใหม่อ่านการเปลี่ยนแปลงเดียวกันต่างกัน และยังไม่มีเครื่องมือเซ็นหรือหน้าจอผู้ดูแลครับ`),
  R('ch3_super', `M: แนวคิดที่ให้เครื่องอื่นคำนวณผลเองนั้น ถูกแทนที่แล้วครับ ตามกฎเอกสารแต่ละใบมีผู้ดำเนินการ DocAction เพียงคนเดียว HQ จะดำเนินการ Complete และลงบัญชีครั้งเดียว เครื่องที่จุดขายแค่แจ้งรายการ และรับกลับเฉพาะสิ่งที่ต้องใช้ ภาพยนตร์เรื่องหลังจะแสดงให้เห็นว่ามันทำงานจริงครับ`),
  R('ch4_card', `F: ทีนี้มาดูว่า สรุปแล้วอยู่ตรงไหนค่ะ | M: กฎและกุญแจรวมแล้ว และตรวจบนเครื่องจริงแล้วครับ ส่วนชิ้นสุดท้ายถูกแทนที่แล้วครับ`),
  R('ch4_ledger', `F: สรุปสั้น ๆ ค่ะ | M: กฎประกาศได้ และกุญแจหมุนเวียนได้ครับ ส่วนท่อบางแบบให้เครื่องอื่นคำนวณเอง ถูกแทนที่แล้วด้วยกฎผู้ดำเนินการเดียว และจะเห็นการทำงานจริงในภาพยนตร์เรื่องหลังครับ`),
  R('ch4_src', `F: อยากรู้ว่าตัวเลขมาจากไหนค่ะ | M: จากบันทึกการตรวจและบันทึกโครงการที่แสดงอยู่นี้ครับ ตามที่เป็นในวันที่คัดลอกไว้ ไม่มีตัวเลขไหนเป็นการประมาณครับ`)
];
const SRCOF = keys => keys.length ? [...new Set(keys)].map(k => k + ' <- ' + X.SRC[k]).join('; ') : 'fixed text (no figures)';
const SRCROW = { ch3_super: 'FL-8 replacement, no figures; claims traced in facts5_th.js §SUP_TRACE T1-T6 (TEAMWORK_FRAMEWORK.md lines ' + [X.SUP.fl8.n, X.SUP.superseded.n, X.SUP.direction.n].join(', ') + ')' };
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
  if (order.join() !== ROWS.map(r => r[0]).join()) throw new Error('beat order in film.log differs from the narration rows:\n' + order.join() + '\n' + ROWS.map(r => r[0]).join());
}
const rows = ROWS.map(([id, keys, det]) => {
  det = det.replace(/\s+/g, ' ');
  let a = 0, e = 999;
  if (mode === 'build') { a = cues[id]; if (a === undefined) throw new Error('no cue for ' + id); const nx = order[order.indexOf(id) + 1]; e = nx ? cues[nx] : endT; if (e === null || e === undefined) throw new Error('no film end'); }
  return [id, a.toFixed(2), e.toFixed(2), SRCROW[id] || SRCOF(keys), short(det), det].join('\t');
});
// ---- NUM_CHECK (by VALUE, independent reader) ----
const countBad = (rs, log) => { let b = 0; const sc = {}, pb = {};
  rs.forEach(r => { const c = r.split('\t'), id = c[0]; scan(c[5]).forEach(v => { sc[v] = (sc[v] || 0) + 1; (pb[id] = pb[id] || []).push(v); }); });
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { b++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times (${Object.keys(pb).filter(i => pb[i].includes(+v)).join(',')}) but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { b++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  return { bad: b, spokenCount: sc, perBeat: pb }; };
const chk = countBad(rows, true); let bad = chk.bad; const spokenCount = chk.spokenCount, perBeat = chk.perBeat;
{ const c1 = countBad(rows.map(r => r.startsWith('ch2_proof\t') ? r.replace(w(F.ptJudged), w(F.ptJudged + 1)) : r), false).bad;                  // a changed number must be seen
  const c2 = countBad(rows.map(r => r.startsWith('title\t') ? r.replace('งานหลายชิ้น', 'งานเจ็ดชิ้น') : r), false).bad;                                  // an invented spoken number must be seen
  const c3 = countBad(rows.map(r => r.startsWith('ch3_super\t') ? r.replace(/เครื่องอื่น/g, 'เครื่องที่สอง') : r), false).bad;                         // a number word hiding in the replacement line must be seen
  console.log(`§NUM_CHECK_CONTROL changed number (${w(F.ptJudged)} -> ${w(F.ptJudged + 1)}): ${c1 > 0 ? 'detected' : 'NOT DETECTED'} · invented spoken number (งานเจ็ดชิ้น): ${c2 > 0 ? 'detected' : 'NOT DETECTED'} · number word in the ch3_super line (เครื่องที่สอง): ${c3 > 0 ? 'detected' : 'NOT DETECTED'} ${c1 > 0 && c2 > 0 && c3 > 0 ? 'PASS' : 'FAIL'}`); if (!(c1 > 0 && c2 > 0 && c3 > 0)) bad++; }
rows.forEach(r => { const c = r.split('\t'); if (/[0-9๐-๙]/.test(c[5])) { bad++; console.log('§NUM_CHECK digit in narration of ' + c[0] + '  WRONG'); } if (/\?/.test(c[5])) { bad++; console.log('§NUM_CHECK question mark in narration of ' + c[0] + ' (no pitch rise available in Thai: rephrase)  WRONG'); } });
{ const ch3 = rows.filter(r => r.startsWith('ch3_super\t')), nums = scan(ch3[0].split('\t')[5]); console.log(`§NUM_CH3 the replacement line speaks ${nums.length} numbers ${nums.length ? 'WRONG' : 'PASS (none)'}`); if (nums.length) bad++; }
{ const dropped = ['orderOps', 'orderToday', 'orderThin', 'thinN', 'thinDerivable', 'thinInconclusive', 'bytesToday', 'bytesThin', 'bytesSaving', 'orderSaving', 'cmpMutantsOf', 'mutDrop', 'mutClock', 'mutOf', 'clockClasses', 'mustBuild', 'uuMax'].filter(k => k in USED);
  console.log(`§NUM_WITHDRAWN facts of the withdrawn chapter 3 spoken anywhere: ${dropped.length} ${dropped.length ? 'WRONG ' + dropped.join(',') : 'PASS'}`); if (dropped.length) bad++; }
const totalSpoken = Object.values(spokenCount).reduce((a, b) => a + b, 0), nUsed = Object.keys(USED).length;
console.log(`§NUM_CHECK numbers_spoken=${totalSpoken} facts_used=${nUsed} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${X.SRC[k]}`));
Object.keys(perBeat).forEach(id => console.log(`§NUM_BEAT ${id} ${JSON.stringify(perBeat[id])}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: X.SRC, spokenUsed: USED, perBeat, inputs: X.INPUTS, sup: Object.fromEntries(Object.entries(X.SUP).map(([k, v]) => [k, { line: v.n, frozenLine: v.n0 }])) }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
