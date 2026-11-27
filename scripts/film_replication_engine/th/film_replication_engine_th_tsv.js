// ⚠ DO NOT REMOVE — Scope: the THAI two-voice narration (F = Premwadee, ค่ะ; M = Niwat, ครับ) for the Thai cut of "No server in the sale path" (prompts/TEAMWORK_FRAMEWORK.md §16.22; English: ../film_replication_engine_tsv.js, §16.21),
// as a TSV for prompts/film_narration_fit_edge.py (lang th). Same ids / cues / sources / turn count as the English rows; the MEANING is translated, not word for word. Wording follows strings_th.js GLOSSARY.
// EVERY spoken number is produced by n('<fact>') from facts.json (../facts.js) and spelled in Thai words. Then this script re-reads its OWN OUTPUT with an INDEPENDENT Thai-number parser and checks, BY VALUE, that
// the numbers spoken equal the numbers requested from facts (count per value) — §NUM_CHECK. It also self-tests the Thai reading function against a hand table (§TH_NUM_SELFTEST, 0..99999 round trip).
// Thai rules (FILM_NARRATION playbook): no question marks (a tonal language has no pitch rise to edit), so F's lines are statements; no prose number words (หนึ่ง, สอง ... also inside words such as ทั้งสอง, ห้าม) — the check would flag them.
// Usage:  node film_replication_engine_th_tsv.js measure <passDir> <out.tsv>      (cue 0, end 999: the fitter measures each beat's speech length)
//         node film_replication_engine_th_tsv.js build   <passDir> <out.tsv>      (cues read from <passDir>/film.log §FILM_CUE lines of the recording)
'use strict';
const fs = require('fs'), path = require('path');
const { buildFacts } = require('../facts.js');
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
// ---- independent reader: Thai number words -> value (used for the round trip and for the NUM_CHECK on the produced text) ----
const TOK = [['ศูนย์', 0], ['หนึ่ง', 1], ['สอง', 2], ['สาม', 3], ['สี่', 4], ['ห้า', 5], ['หก', 6], ['เจ็ด', 7], ['แปด', 8], ['เก้า', 9], ['ยี่', 2], ['เอ็ด', 1], ['สิบ', 10], ['ร้อย', 100], ['พัน', 1000], ['หมื่น', 10000], ['แสน', 100000], ['ล้าน', 1e6]];
const TOKRE = new RegExp(TOK.map(t => t[0]).sort((a, b) => b.length - a.length).join('|'), 'g'), TV = Object.fromEntries(TOK);
function readRun(tokens) { let total = 0, pend = null, million = 0;
  for (const t of tokens) { const v = TV[t];
    if (t === 'ล้าน') { million = (million + total + (pend === null ? 0 : pend)) * 1e6; total = 0; pend = null; }
    else if (v >= 10) { total += (pend === null ? 1 : pend) * v; pend = null; }
    else { pend = v; } }
  return million + total + (pend === null ? 0 : pend); }
function scan(text) {                                                       // numbers in a Thai text: maximal runs of number tokens with nothing in between (no space, no other letter)
  const runs = []; let m, last = -1, cur = [];
  TOKRE.lastIndex = 0;
  while ((m = TOKRE.exec(text)) !== null) { if (m.index === last && cur.length) cur.push(m[0]); else { if (cur.length) runs.push(cur); cur = [m[0]]; } last = m.index + m[0].length; }
  if (cur.length) runs.push(cur); return runs.map(readRun); }
{ // self-test 1: hand table of correct Thai readings (written from the language, not from the function)
  const HAND = { 0: 'ศูนย์', 1: 'หนึ่ง', 2: 'สอง', 10: 'สิบ', 11: 'สิบเอ็ด', 12: 'สิบสอง', 20: 'ยี่สิบ', 21: 'ยี่สิบเอ็ด', 22: 'ยี่สิบสอง', 30: 'สามสิบ', 31: 'สามสิบเอ็ด', 93: 'เก้าสิบสาม', 100: 'หนึ่งร้อย', 101: 'หนึ่งร้อยเอ็ด', 110: 'หนึ่งร้อยสิบ', 111: 'หนึ่งร้อยสิบเอ็ด', 120: 'หนึ่งร้อยยี่สิบ', 121: 'หนึ่งร้อยยี่สิบเอ็ด', 169: 'หนึ่งร้อยหกสิบเก้า',
    1000: 'หนึ่งพัน', 1500: 'หนึ่งพันห้าร้อย', 2300: 'สองพันสามร้อย', 3500: 'สามพันห้าร้อย', 5000: 'ห้าพัน', 10000: 'หนึ่งหมื่น', 27600: 'สองหมื่นเจ็ดพันหกร้อย', 100000: 'หนึ่งแสน', 1000000: 'หนึ่งล้าน' };
  let bad = 0; Object.keys(HAND).forEach(k => { if (w(+k) !== HAND[k]) { bad++; console.log(`§TH_NUM_SELFTEST ${k}: function says ${w(+k)} but the hand table says ${HAND[k]}  WRONG`); } });
  // self-test 2: round trip 0..99999 through the independent reader (writer and reader are separate code)
  let rt = 0; for (let k = 0; k < 100000; k++) if (scan(w(k))[0] !== k || scan(w(k)).length !== 1) { rt++; if (rt <= 5) console.log(`§TH_NUM_SELFTEST round trip ${k}: wrote ${w(k)} read ${JSON.stringify(scan(w(k)))}  WRONG`); }
  console.log(`§TH_NUM_SELFTEST hand_table=${Object.keys(HAND).length} wrong=${bad} round_trip_0_99999 wrong=${rt} ${bad || rt ? 'FAIL' : 'PASS'}`); if (bad || rt) process.exit(2); }
const R = buildFacts(), F = R.F, USED = {}, CALLS = {};                       // CALLS: how many times each numeric VALUE was requested from a fact (the spoken count must match)
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; return w(Math.abs(v)); };
const code = k => { const m = /(\d+)$/.exec(F[k]); if (!m) throw new Error('no number in ' + k); USED[k] = +m[1]; CALLS[+m[1]] = (CALLS[+m[1]] || 0) + 1; return w(+m[1]); };
const ROWS = [
  ['title', 'fixed text', `F: ไม่มีเซิร์ฟเวอร์ในเส้นทางการขายเลยค่ะ อยากรู้ว่าทำได้อย่างไร | M: นี่คือการรันจริงที่เอนจินทำสำเนาข้อมูลบันทึกไว้ ใช้กับโปรแกรมขายหน้าร้าน Unicenta POS และกับ Micro Finance ครับ ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง`],
  ['recap', 'earlier film card', `F: ภาพนี้ดูคุ้นตาค่ะ | M: ใช่ครับ เป็นแนวคิดเดิม ระบบ ERP ทั่วไปต้องมีเซิร์ฟเวอร์ แต่ที่นี่ทุกเครื่องเก็บสำเนาของตัวเอง ส่วนชั้นวางเก็บแค่ออบเจกต์ที่ตั้งชื่อไว้ครับ`],
  ['cast', 'flows.json · s1.log W-FLOW-MINIMAL', `F: มาดูกันว่าใครอยู่บนเวทีบ้างค่ะ | M: สาขา A กับสาขา B และ HQ ซึ่งคือสำนักงานใหญ่ กับโทรศัพท์ของลูกค้า และชั้นวางครับ แถวเหล่านี้คือการตั้งค่าทั้งหมด แถวการขายส่งไปแค่ ${n('wireCols')} จาก ${n('tableCols')} คอลัมน์ ทุกเครื่องเริ่มต้นที่ออฟไลน์ ป้ายสีแดงครับ`],
  ['setup', 'trace_film_pos', `F: เริ่มต้นด้วยการตั้งค่าเครื่องค่ะ | M: HQ ออนไลน์ช่วงเดียว วางบัญชีราคา และสต็อกเริ่มต้น ${n('openStock')} ชิ้นของ A ไว้บนชั้นวาง แล้ว A แวะมารับไป และกลับเป็นออฟไลน์ครับ`],
  ['selling', 'trace_film_pos', `F: จากนั้นวันขายก็เริ่มค่ะ | M: ขายที่เคาน์เตอร์ ${n('sale1')} ชิ้น ${n('sale2')} ชิ้น แล้ว ${n('sale3')} ชิ้น ทุกรายการอยู่ในเครื่อง A นับสต็อกลดลง ${n('openStock')} ${n('stock1')} ${n('stock2')} ${n('stock3')} โทรศัพท์สแกนรหัสสะสม ได้เครดิต ${n('credit1')} สแกนรหัสใช้เครดิต เครดิตเหลือ ${n('credit2')} แล้วสแกนซ้ำอีกครั้งก็ไม่เกิดอะไรขึ้น ชั้นวางกับ HQ เงียบตลอดครับ`],
  ['outage', 'trace_film_pos · treat.log W-TREAT-OFFLINE, W-TREAT-STOCKLOOP', `F: ต่อไปคือตอนที่ลิงก์ขาดค่ะ | M: ตอนเย็น A แวะแล้วไม่สำเร็จ มี ${n('queuedOutage')} รายการรออยู่ในเครื่อง และไม่มีอะไรหาย พอลิงก์กลับมา A ส่งบรรทัดการขาย ${n('deliveredSales')} บรรทัด กับรหัส ${n('deliveredCodes')} รหัส HQ รับบรรทัดการขาย ${n('hubAcceptsSales')} บรรทัด สต็อก ${n('openStock')} ลบ ${n('salesTotal')} เหลือ ${n('hubStockAfterSales')} ซึ่งต่ำกว่า ${n('minLevel')} กฎจึงเรียกการเติมสต็อกของเคอร์เนล ซึ่งที่นี่เป็นตัวแทนชั่วคราว แล้วส่งรายการเติม ${n('replenQty')} ชิ้นให้ A ครับ`],
  ['day2', 'trace_film_pos · treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND', `F: เช้าวันรุ่งขึ้นค่ะ | M: A รับรายการเติมสต็อก นับเองได้ ${n('stockMeet')} และของ HQ ก็ ${n('stockMeet')} กล่องรับของ B มี ${n('bInbox')} ออบเจกต์ และ B ถูกปฏิเสธเมื่อพยายามอ่านส่วนของ A บนชั้นวางครับ`],
  ['lost', 'trace_film_pos · treat.log FILMDAY-POS-stock, W-TREAT-DEVICEFAIL', `F: ทีนี้เราจะทำให้บางอย่างพังค่ะ สาขา A หายไป | M: ยังไม่ได้ส่ง ${n('unsent')} รายการ รายการนั้นหายไปแล้ว A ดึงคืนจากส่วนของตัวเองบนชั้นวาง ได้ออบเจกต์ของตัวเอง ${n('restoreOwn')} ชิ้น และที่ส่งถึง A อีก ${n('restoreDown')} ชิ้น นับสต็อกได้ ${n('stockBefore')} แล้ว ${n('stockAfter')} และของ HQ ก็ ${n('stockHubDay2')} รหัสถัดไปคือ A ${code('nextCode')} ครับ`],
  ['reuse', 'trace_film_pos', `F: เลขใบขายถูกใช้ซ้ำค่ะ | M: หลังกู้คืน เครื่องคิดเงินใช้เลขของวันนี้ซ้ำ แต่เนื้อหาต่างออกไป เป็น ${n('reuseQty')} ชิ้นครับ`],
  ['rolled', 'trace_film_pos · treat.log W-TREAT-CODE', `F: ต่อไปคือโทรศัพท์ที่กู้คืนจากสำเนาเก่าค่ะ | M: มันแสดงเครดิต ${n('rolledRedeem')} อีกครั้ง แคชเชียร์สาขา B ออกรหัสใช้เครดิต ${n('rolledRedeem')} และเครดิตก็เหลือ ${n('credit2')} ครับ`],
  ['settle', 'trace_film_pos · treat.log FILMDAY-POS-code', `F: ถัดมาคือตอนที่ HQ รู้เรื่องค่ะ | M: ตอนแวะครั้งถัดไป พบการชนกัน คือเลขใบขายเดียวกันแต่เนื้อหาต่างกัน HQ เก็บฉบับเดิมไว้ และติดธงแดงให้ฉบับหลัง จากนั้นพบการใช้เกินยอด ยอดติดลบ ${n('overspendBalance')} เอนจินไม่ได้ขัดขวาง แต่ตรวจพบตอนปิดยอด เป็นรายที่อาจขึ้นบัญชีดำครับ`],
  ['hqlost', 'trace_film_pos · treat.log FILMDAY-POS-rebuild', `F: ต่อไปคือกรณีที่ HQ หายค่ะ | M: สถานะถูกล้างหมด HQ สร้างใหม่จากชั้นวาง ได้ ${n('rebuildRecords')} รายการ เหมือนเดิมทุกอย่าง ก่อนหน้านี้ชั้นวางมี ${n('shelfBefore')} ออบเจกต์ และหลังสร้างใหม่ก็ ${n('shelfAfter')} ไม่มีซ้ำครับ`],
  ['shelflost', 'trace_film_pos · treat.log W-TREAT-PIPEFAIL', `F: และความผิดพลาดสุดท้ายคือชั้นวางหายค่ะ | M: เครื่องตู้จดหมายเก็บสำเนาที่อ่านไม่ได้ไว้ HQ สร้างใหม่จากเครื่องนั้น ได้ ${n('rebuildRecords')} รายการเหมือนเดิม ส่วนกรณีเทียบที่ไม่มีตู้จดหมาย เอนจินกู้ได้ ${n('controlRecovered')} จาก ${n('controlOf')} รายการครับ`],
  ['numbers', 'treat.log §TREAT_PANEL pos day 1', `F: ลองดูว่า HQ ยุ่งแค่ไหนค่ะ | M: ในวันทำงาน HQ แวะชั้นวาง ${n('d1HubVisits')} ครั้ง เครื่องอื่นแวะ ${n('d1DevVisits')} ครั้ง และสาขากับโทรศัพท์ทำงานในเครื่องเอง ${n('d1Local')} อย่าง จุดสำคัญคือจังหวะครับ`],
  ['part2', 'fixed text', `F: กรณีต่อไปค่ะ | M: Micro Finance ผู้กู้เก็บทองไว้ในโทรศัพท์ของตัวเอง และร้านมีเคาน์เตอร์เครื่องเดียวครับ`],
  ['mfcast', 'trace_film_mf', `F: ลองดูบนชั้นวางค่ะ | M: ราคาทองของวัน ประกาศครั้งเดียว เป็นข้อมูลสาธารณะ ใครก็อ่านได้ครับ`],
  ['mfprice', 'trace_film_mf · treat.log FILMDAY-MF', `F: ส่วนโทรศัพท์ค่ะ | M: ดึงราคามาครั้งเดียว แล้วคำนวณมูลค่าทองเอง ${n('grams')} กรัม คูณ ${n('price')} ได้ ${n('fundValue')} เป็นตัวเลขตัวอย่างครับ`],
  ['mfskip', 'trace_film_mf · treat.log FILMDAY-MF', `F: ตอนบ่ายเปิดอีกครั้งค่ะ | M: มีราคาอยู่แล้ว จึงข้ามการดึงราคาครับ`],
  ['mfpay', 'trace_film_mf · treat.log FILMDAY-MF', `F: ต่อไปคือการชำระเงินค่ะ | M: สลิปถูกบันทึกบนโทรศัพท์ แล้วส่งตอนแวะครั้งถัดไป ถ้าส่งซ้ำ ก็ใช้ชื่อเดิมบนชั้นวาง ยังเป็นการชำระ ${n('mfPayRecs')} รายการครับ`],
  ['mfowing', 'trace_film_mf · treat.log FILMDAY-MF · witness source', `F: ต่อไปคือยอดค้างชำระค่ะ | M: ร้านรับการชำระ ${n('payAmt')} ยอดค้าง ${n('openOwing')} ลบ ${n('payAmt')} เหลือ ${n('mfOwing')} ใบยืนยันส่งถึงผู้กู้คนนั้นคนเดียวครับ`],
  ['mfconfirm', 'trace_film_mf · treat.log FILMDAY-MF', `F: ลองดูผู้กู้อีกคนค่ะ | M: ไม่เห็นครับ คนแรกได้รับใบยืนยัน ยอดค้าง ${n('mfOwing')} ส่วนอีกคนมีใบยืนยัน ${n('mfConf2')} ใบครับ`],
  ['close', 'close card · treat.log §TREAT_VERDICT, §TREAT_SIZE', `F: มาสรุปกันค่ะ | M: ทั้งคู่ใช้แถวชนิดเดียวกัน ${n('treatments')} ชนิด ในเอนจินที่มี ${n('engineLines')} บรรทัด ข้อจำกัดอยู่บนจอ คือข้อมูลตัวอย่าง ไม่ได้เข้ารหัส ฮับในหน่วยความจำเครื่องเดียว ยังไม่มีโทรศัพท์จริง และกระบวนการเคอร์เนลเป็นตัวแทนชั่วคราว การทดสอบของเอนจินเอง ตัดสิน ${n('judged')} รายการ ไม่มีที่ไม่ผ่านครับ`]
];
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
}
const rows = ROWS.map(([id, src, det]) => {
  det = det.replace(/\s+/g, ' ');
  let a = 0, e = 999;
  if (mode === 'build') { a = cues[id]; if (a === undefined) throw new Error('no cue for ' + id); const nx = order[order.indexOf(id) + 1]; e = nx ? cues[nx] : endT; if (e === null || e === undefined) throw new Error('no film end'); }
  return [id, a.toFixed(2), e.toFixed(2), src, short(det), det].join('\t');
});
// ---- NUM_CHECK (by VALUE, independent reader): every number the script speaks must be a fact it asked for, as many times as it asked ----
const countBad = (rs, log) => { let b = 0; const sc = {}; const pb = {};
  rs.forEach(r => { const c = r.split('\t'), id = c[0]; scan(c[5]).forEach(v => { sc[v] = (sc[v] || 0) + 1; (pb[id] = pb[id] || []).push(v); }); });
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { b++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { b++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  return { bad: b, spokenCount: sc, perBeat: pb }; };
const chk = countBad(rows, true); let bad = chk.bad; const spokenCount = chk.spokenCount, perBeat = chk.perBeat;
{ const mut = rows.map(r => r.startsWith('mfowing\t') ? r.replace(w(F.mfOwing), w(F.mfOwing + 100)) : r), ctl = countBad(mut, false).bad;       // control: a wrong number in the text MUST be seen
  console.log(`§NUM_CHECK_CONTROL mutated mfowing ${w(F.mfOwing)} -> ${w(F.mfOwing + 100)}: check reports ${ctl} problems ${ctl > 0 ? 'OK (detects a changed number)' : 'WRONG (blind)'}`); if (ctl === 0) bad++; }
rows.forEach(r => { const c = r.split('\t'); if (/[0-9๐-๙]/.test(c[5])) { bad++; console.log('§NUM_CHECK digit in narration of ' + c[0] + '  WRONG'); } if (/\?/.test(c[5])) { bad++; console.log('§NUM_CHECK question mark in narration of ' + c[0] + ' (no pitch rise available in Thai: rephrase)  WRONG'); } });
const totalSpoken = Object.values(spokenCount).reduce((a, b) => a + b, 0), nUsed = Object.keys(USED).length;
console.log(`§NUM_CHECK numbers_spoken=${totalSpoken} facts_used=${nUsed} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${R.SRC[k]}`));
Object.keys(perBeat).forEach(id => console.log(`§NUM_BEAT ${id} ${JSON.stringify(perBeat[id])}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: R.SRC, spokenUsed: USED, perBeat }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
