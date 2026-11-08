// ⚠ DO NOT REMOVE — Scope: the THAI two-voice narration (F = Premwadee, ค่ะ; M = Niwat, ครับ) for the Thai cut of Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.27-§16.29; English: ../film4_tsv.js). Number machinery copied from ../../th/film_replication_engine_th_tsv.js (§16.22).
// 
// as a TSV for prompts/film_narration_fit_edge.py (lang th). Same ids / cues / sources / turn count as the English rows; the MEANING is translated, not word for word. Wording follows strings_th.js GLOSSARY.
// EVERY spoken number is produced by n('<fact>') from facts.json (../facts.js) and spelled in Thai words. Then this script re-reads its OWN OUTPUT with an INDEPENDENT Thai-number parser and checks, BY VALUE, that
// the numbers spoken equal the numbers requested from facts (count per value) — §NUM_CHECK. It also self-tests the Thai reading function against a hand table (§TH_NUM_SELFTEST, 0..99999 round trip).
// Thai rules (FILM_NARRATION playbook): no question marks (a tonal language has no pitch rise to edit), so F's lines are statements; no prose number words (หนึ่ง, สอง ... also inside words such as ทั้งสอง, ห้าม) — the check would flag them.
// Usage:  node film_replication_engine_th_tsv.js measure <passDir> <out.tsv>      (cue 0, end 999: the fitter measures each beat's speech length)
//         node film_replication_engine_th_tsv.js build   <passDir> <out.tsv>      (cues read from <passDir>/film.log §FILM_CUE lines of the recording)
'use strict';
const fs = require('fs'), path = require('path');
const X = require('../facts4.js').build();
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
  console.log(`§TH_NUM_SELFTEST hand_table=${Object.keys(HAND).length} wrong=${bad} round_trip_0_99999 wrong=${rt} ${bad || rt ? 'FAIL' : 'PASS'}`); if (bad || rt) process.exit(2); }const F = X.F, USED = {}, CALLS = {};                                         // CALLS: how many times each numeric VALUE was requested from a fact (the spoken count must match)
const n = k => { if (!(k in F)) throw new Error('unknown fact ' + k); const v = F[k]; if (typeof v !== 'number') throw new Error('fact is not a number: ' + k); USED[k] = Math.abs(v); CALLS[Math.abs(v)] = (CALLS[Math.abs(v)] || 0) + 1; return w(Math.abs(v)); };
// Words that must not appear in prose because the independent reader would take them for numbers: สาม(ารถ) สอง(…) ห้า(ม) หนึ่ง เอ็ด ยี่(ห้อ) ร้อย(ละ) พัน(ธ) — percent is said เปอร์เซ็นต์.
const ROWS = [
  ['title', 'fixed text', `F: กันส่วนเกินออกจากระบบ อยากรู้ว่าส่วนเกินที่ว่าคืออะไรค่ะ | M: คือข้อมูลที่ส่ง โค้ดกำหนดขอบเขต และการคุยผ่านเครือข่ายครับ เราวัดทีละอย่าง และบอกด้วยว่าอะไรยังเหลืออยู่`],
  ['wall', 'film2_claims.json · film2_logos_index.json', `F: ลองดูว่าใครเคยทำเรื่องนี้มาก่อนค่ะ | M: เราศึกษาโครงการที่คล้ายกัน และเรียนรู้จากปัญหาที่พวกเขารายงานครับ นี่คือบางส่วน`],
  ['c1', 'film2_claims.json 1-zero-b 1-electric-b 1-powersync-b 1-couchbase-a 1-ditto-b', `F: ปัญหาแรกค่ะ | M: ขอบเขตการซิงก์ต้องเขียนด้วยมือ Rocicorp, Electric, PowerSync, Couchbase และ Ditto ต่างให้นักพัฒนาเขียนเองว่าเครื่องจะได้รับอะไร นี่คือความเห็นของเราครับ`],
  ['c2', 'film2_claims.json 2a1 2a2 2b1', `F: แล้วเรื่องเวอร์ชันค่ะ | M: มีผู้ใช้รายงานว่าซิงก์ไม่ได้หลังอัปเดต และบทความ local-first เรียกเรื่องนี้ว่าคำถามที่ยังเปิดอยู่ เรายังแก้เรื่องนี้ไม่ได้ครับ การทำเวอร์ชันเป็นแค่แบบบนกระดาษ`],
  ['c3', 'film2_claims.json 3a1 3a3 3a8 3b1 3b2', `F: ส่วนรีเลย์ค่ะ | M: งานวัดผลเรื่อง Nostr ประเมินว่ามีทราฟฟิกซ้ำซ้อนมาก และรีเลย์ฟรีหลายตัวไม่คุ้มค่าใช้จ่าย Delta Chat เรียกรีเลย์ของตัวเองว่าเรียบง่ายที่สุด แต่ก็ระบุหน้าที่ไว้ ความเห็นของเราคือรีเลย์ธรรมดาก็ยังต้องมีหน้าที่ที่ระบุไว้ครับ`],
  ['c4', 'film2_claims.json 2b2 4a 4b1 4b3', `F: แล้วประวัติการเปลี่ยนแปลงค่ะ | M: บทความ local-first ระบุว่าประวัติการเปลี่ยนแปลงที่โตขึ้นเป็นปัญหาด้านประสิทธิภาพ Manyverse ทำให้การซิงก์ครั้งแรกสั้นลง แต่ก็ยังนาน Automerge แก้เรื่องโหลดช้าได้ครับ`],
  ['c5', 'film2_claims.json 5e 5a 5b1 5b2', `F: ลองดูระบบเพียร์ทูเพียร์ล้วนค่ะ | M: Radicle บอกว่าทำได้แต่ไม่เหมาะใช้จริง Briar สร้างตู้จดหมายไว้เก็บข้อความตอนออฟไลน์ Scuttlebutt มี pub และ room ทุกเจ้าเพิ่มตัวช่วยที่เปิดตลอดครับ`],
  ['c6', 'film2_claims.json 6-mongodb-a 6-powersync-a 6-electric-joining-a 6-electric-joining-b 6-triplit-a', `F: แล้วเมื่อผลิตภัณฑ์เปลี่ยนทิศทางค่ะ | M: MongoDB ยุติการซิงก์อุปกรณ์ PowerSync ทยอยเลิกกฎซิงก์รุ่นเก่า Electric ไปรวมกับ Databricks และทยอยปิดคลาวด์ Supabase ต้อนรับผู้ร่วมก่อตั้ง Triplit นี่ไม่ใช่คำตัดสิน แต่เป็นเหตุผลที่ข้อมูลของเราอยู่ในเครื่องครับ`],
  ['d_tables', 'live query tables · s1.log §S1_INPUT', `F: ระบบอธิบายตัวเองอย่างไรค่ะ | M: ด้วยตารางครับ การสืบค้นสดนับได้ ${n('adTables')} ตาราง ใช้งาน ${n('adActive')} ตาราง และ ${n('adColumns')} คอลัมน์ คอลัมน์ที่ลงท้ายด้วย อันเดอร์สกอร์ ไอดี ชี้ไปยังอีกตาราง`],
  ['d_source', 'iDempiere MLookupFactory.java:192-214, MQuery.java:420-430', `F: กฎของตัวชี้นี้มาจากไหนค่ะ | M: มาจาก iDempiere ในโอเพนซอร์สของเขาครับ คอลัมน์ชนิด Table หรือ Search ที่มีค่าอ้างอิงจะอ่านตารางนั้น คอลัมน์ไอดีอื่นระบุชื่อตารางของมันเอง เราคัดลอกกฎนี้มา`],
  ['d_edges', 'live queries er1 er2 er4 · s1.log W-FLOW-REFS, §S1_UNRESOLVED', `F: มีตัวชี้กี่ตัวค่ะ | M: ${n('edges')} ตัวครับ แต่ละคำสืบค้นนับตัวชี้ตามกฎของมัน ได้ ${n('er1')} ${n('er2')} และ ${n('er4')} ตัวเลขที่คอมไพเลอร์นับเองก็ตรงกัน`],
  ['d_orderline', 'live queries orderline · s1.log W-FLOW-MINIMAL, §S1_FLOW F1', `F: ลองดูบรรทัดใบสั่งค่ะ | M: บรรทัดใบสั่งมี ${n('olCols')} คอลัมน์ ส่วนใหญ่เป็นไอดี ส่งไปแค่ ${n('wire')} คอลัมน์ คือสินค้า หน่วย จำนวน กับตัวตนและการแบ่งส่วน ชื่อและราคาอยู่ในแต่ละเครื่อง`],
  ['d_computed', 's1.log W-FLOW-NO-DERIVED, W-FLOW-MANDATORY', `F: แล้วฟิลด์ที่ระบบคำนวณค่ะ | M: พจนานุกรมข้อมูลระบุว่าอะไรคนพิมพ์ อะไรระบบคำนวณ ค่าที่ระบบคำนวณจะไม่ถูกส่งข้ามเลย ผู้รับเติมฟิลด์จำเป็น ${n('mand')} ตัวที่ไม่ได้ส่งไป รวมถึงหัวใบสั่ง`],
  ['d_honest', 'spec §11.1', `F: งั้นไอดีก็ซ่อนข้อมูลได้ค่ะ | M: ไม่ใช่ครับ ไอดีเป็นตัวชี้ ไม่ใช่ความลับ การผนึกโฟลว์สร้างไว้ในตัวจำลองเท่านั้น และรอบนี้ไม่ได้เข้ารหัส เรคอร์ดที่สร้างบนเครื่องมีไอดีที่ไม่ซ้ำกันทั่วโลกครับ`],
  ['r_strategy', 'live query strategy100 · dryrun.log', `F: ต่อไปคือการทำสำเนาข้อมูลค่ะ iDempiere มีแนวคิดนี้อยู่แล้ว | M: ใช่ครับ แต่ละตารางเป็น Reference, Merge หรือ Local ในกลยุทธ์การทำสำเนาของ iDempiere จากตารางที่ใช้งาน ${n('adActive')} ตาราง เป็น Merge ${n('stratM')} Reference ${n('stratR')} Local ${n('stratL')} และยังไม่จัดประเภท ${n('stratUnlisted')}`],
  ['r_row', 'flows_modeller.json · dryrun.log D1', `F: แล้วเราเพิ่มอะไรค่ะ | M: แถวของโฟลว์ครับ บอกว่าตารางและคอลัมน์ไหน ทิศทางไหน ใครอ่านได้ และเมื่อไร รายการจริงของ Modeller มีการประกาศ ${n('dryVirtual')} รายการ กับ ${n('dryRows')} แถว คอมโพเนนต์ ${n('nComponents')} ตัวจัดการแถวแต่ละชนิด เอนจินไม่ระบุชื่อตารางใดเลย`],
  ['r_zero', 's1.log W-FLOW-ZERO-CODE · registry.log · virtual.log', `F: โฟลว์ใหม่ต้องมีโค้ดใหม่หรือเปล่าค่ะ | M: ไม่ต้องครับ โฟลว์ใหม่คือแถวข้อมูล โฟลว์ของอีก ${n('zcFlows')} ตารางคอมไพล์ผ่าน โดยแฮชของคอมไพเลอร์ไม่เปลี่ยน ตารางเสมือนคือแถวประกาศ แถวที่ผิดจะล้มเหลวตอนคอมไพล์`],
  ['r_bloat', 's1.log W-FLOW-MINIMAL · treat.log W-TREAT-LOCAL · file counts', `F: ส่วนเกินถูกกันไว้ตรงไหนค่ะ | M: ข้อมูลที่ส่ง ข้ามไป ${n('wire')} จาก ${n('olCols')} คอลัมน์ โค้ดกำหนดขอบเขต ชุดเครื่องมือ ${n('linesToolchain')} บรรทัดอ่านแถวเหล่านี้ การคุย งานในเครื่องเรียกชั้นวาง ${n('localCalls')} ครั้ง การแวะเรียกได้ถึง ${n('visitCalls')} ครั้ง`],
  ['u_code', 'git show 4e95b393 / 5dfa4231 / 4958a885 modeller/team_sync.js', `F: ทีนี้มาดูใต้ฝาครอบค่ะ อะแดปเตอร์จริงหน้าตาเป็นอย่างไร | M: ก่อนหน้านี้เป็นรายการที่เขียนตรง ๆ ในโค้ด มีชนิดการดำเนินการ ${n('p1Keys')} ชนิด จากนั้นสร้างรายการจากแผนที่คอมไพล์แล้ว ในอะแดปเตอร์เอง ตอนนี้ถามรายการเดิมจากตัวอ่านกลาง แต่ละบรรทัดขึ้นต้นด้วยเลขบรรทัดของมันในไฟล์ครับ`],
  ['u_chain', 'git show 5dfa4231 modeller/team_plan.js · team_scope.js · MTable.java:257-261', `F: แถวไปถึงอะแดปเตอร์ได้อย่างไรค่ะ | M: แถวคอมไพล์เป็นแผนที่สร้างอัตโนมัติ ขนาด ${n('planBytes')} ไบต์ ประทับแฮช และไม่มีลายเซ็น ตัวอ่านเล็ก ๆ ${n('scopeLines')} บรรทัด ตอบว่าอะไรแชร์ได้ และอะแดปเตอร์ทั้งคู่ถามจากมัน แบบแผนนี้คือ service locator ของ iDempiere เองครับ`],
  ['u_probes', 'modeller_baseline_before.log, modeller_after.log, modeller_plan_witness.log, modeller_noplan_failclosed.log', `F: เรารู้ได้อย่างไรว่ายังใช้งานได้ค่ะ | M: ตัวทดสอบตัวเต็มของ Modeller ให้ผลเหมือนเดิมทั้งก่อนและหลัง ${n('tmJudged')} ข้อ แล้วก็การตรวจ ค่าที่เพิ่มเข้ามาถูกแชร์ โดยไฟล์อะแดปเตอร์เหมือนเดิมทุกไบต์ ไม่มีแผนก็ไม่แชร์อะไรเลย แผนที่ไม่มีคอลัมน์การย้ายก็ไม่แชร์การย้าย การทำพังโดยตั้งใจ ${n('mwMutants')} ครั้ง ถูกจับได้หมด และเมื่อเอาไฟล์แผนออก ตัวทดสอบตัวเดิมที่ไม่ได้แก้ก็ล้มเหลว ซึ่งถูกต้องแล้วครับ`],
  ['u_erp', 'erp_plan_witness.log · erpplan_run.log · teamscope_run.log', `F: แล้ว ERP ล่ะค่ะ | M: ห่วงโซ่เดียวกันครับ ในทุก ${n('erpN')} ตารางของพจนานุกรม กฎเดิมกับแผนตรงกัน แชร์ ${n('erpSharedE1')} ตาราง ต่างกัน ${n('erpDiffer')} ถ้าไม่มีแผน ก็ไม่แชร์อะไรเลย การทำอะแดปเตอร์พังโดยตั้งใจ ${n('erpMutants')} ครั้งถูกจับได้หมด และของตัวอ่านอีก ${n('scopeMutants')} ครั้ง ยังมีข้อค้นพบที่เปิดค้างอยู่ คือตารางนอกพจนานุกรม ${n('erpOutside')} ตาราง ตอนนี้อยู่ในเครื่องเท่านั้น`],
  ['u_ledger', 'git show --numstat 5dfa4231, 4958a885 · gh pr view · TEAMWORK_FRAMEWORK §20, §24.1, §25.2', `F: แล้วบัญชีผลลัพธ์ค่ะ | M: พูดตรง ๆ ครับ อะแดปเตอร์ Modeller ไม่ได้เล็กลง เพิ่ม ${n('adapterAdded')} ลบ ${n('adapterRemoved')} ตัวอ่านมี ${n('scopeLines')} บรรทัด เพิ่มครั้งเดียว โค้ดเฉพาะไม่ได้ลดลง แต่ความซ้ำซ้อนลดลง ราว ${n('adapterStayPct')} เปอร์เซ็นต์ของอะแดปเตอร์ยังอยู่ แผนยังไม่มีลายเซ็น แต่ตอนนี้ตัวอ่านตรวจลายเซ็นได้แล้ว การเปลี่ยนแปลงทั้งคู่ถูกรวมแล้ว`],
  ['u_engine', 'file counts · registry.log · the seven logs', `F: ตัวเอนจินเองหน้าตาเป็นอย่างไรค่ะ | M: แกนมี ${n('linesCore')} บรรทัด และคอมโพเนนต์ ${n('linesComponents')} บรรทัด รวมเป็น ${n('linesEngine')} ตัวจัดการใหม่คือไฟล์ใหม่ และแฮชของแกนไม่เปลี่ยน อีกทั้งการทำพังโดยตั้งใจ ${n('mutantsTotal')} ครั้ง ใน ${n('witnessCount')} ตัวทดสอบ ทำให้การทดสอบกลายเป็นสีแดงทุกครั้งครับ`],
  ['u_why', 'design reasons · mesh.log W-MESH-FOLD', `F: แล้วต้องต่อสดตลอดเวลาจริง ๆ หรือเปล่าค่ะ | M: ไม่ต้องครับ ข้อเท็จจริงเพิ่มต่อท้ายอย่างเดียว และทำซ้ำได้ผลเดิม ไอดีแปลความบนเครื่อง มาช้าก็ไม่เปลี่ยนผล ดังนั้นแวะมาเป็นครั้งคราวก็พอ`],
  ['u_next', 'TEAMWORK_FRAMEWORK §25.2, §13.12.J.2 · dryrun.log D8b, G9', `F: ขั้นต่อไปคืออะไรค่ะ | M: การลดขอบเขต ERP เป็นการเปลี่ยนข้อมูลแล้ว แต่ต้องตรวจทุกหน้าต่างก่อน ถ้าปฏิเสธเป็นค่าตั้งต้น จะแชร์ ${n('erpDeny')} ตาราง และเลิกแชร์ ${n('erpStop')} ตาราง การเซ็นแผนทำงานในระดับกลไกแล้ว แต่ยังไม่มีอะแดปเตอร์ตัวไหนขอใช้ การผนึกทำงานในตัวจำลองเท่านั้น ท่อส่งจริงยังไม่ได้สร้าง และการทำเวอร์ชันของอีเวนต์ยังเป็นแค่แบบบนกระดาษครับ`],
  ['limits', 'limits card · logs', `F: แล้วเราได้อะไรกลับไปค่ะ | M: แนวทางนี้กันข้อมูลที่ส่ง โค้ดกำหนดขอบเขต และการคุยผ่านเครือข่ายส่วนเกินออก และเหลืออะแดปเตอร์อยู่ราว ${n('adapterStayPct')} เปอร์เซ็นต์ ข้อจำกัดอยู่บนจอ และล็อกของตัวทดสอบทุกตัวผ่าน วันทำงานเต็มวันของกรณีจริงอยู่ในภาพยนตร์เรื่องแรกครับ`],
  ['src1', 'sources card', `F: แล้วทั้งหมดนี้มาจากไหนค่ะ | M: ข้อความจากภายนอกทุกข้ออยู่ที่นี่ พร้อมที่อยู่และวันที่เราอ่านครับ`],
  ['src2', 'sources card', `F: ยังมีอะไรอีกค่ะ | M: ตัวเลขของเราเองมาจากการสืบค้นสดและล็อก โลโก้และชื่อเป็นของเจ้าของครับ`]
];
const short = det => det.split(' | ')[0];
let cues = {}, order = [], endT = null;
if (mode === 'build') {
  const log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
  for (const l of log.split('\n')) { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; order.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; }
  if (order.join() !== ROWS.map(r => r[0]).join()) throw new Error('beat order in film.log differs from the narration rows:\n' + order.join() + '\n' + ROWS.map(r => r[0]).join());
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
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { b++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times (${rs.filter(r => scan(r.split('\t')[5]).indexOf(+v) !== -1).map(r => r.split('\t')[0]).join(',')}) but requested from facts ${(CALLS[v] || 0)} times  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { b++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  return { bad: b, spokenCount: sc, perBeat: pb }; };
const chk = countBad(rows, true); let bad = chk.bad; const spokenCount = chk.spokenCount, perBeat = chk.perBeat;
{ const mut = rows.map(r => r.startsWith('u_ledger\t') ? r.replace(w(F.adapterAdded), w(F.adapterAdded + 100)) : r), ctl = countBad(mut, false).bad;       // control: a wrong number in the text MUST be seen
  console.log(`§NUM_CHECK_CONTROL mutated u_ledger ${w(F.adapterAdded)} -> ${w(F.adapterAdded + 100)}: check reports ${ctl} problems ${ctl > 0 ? 'OK (detects a changed number)' : 'WRONG (blind)'}`); if (ctl === 0) bad++; }
rows.forEach(r => { const c = r.split('\t'); if (/[0-9๐-๙]/.test(c[5])) { bad++; console.log('§NUM_CHECK digit in narration of ' + c[0] + '  WRONG'); } if (/\?/.test(c[5])) { bad++; console.log('§NUM_CHECK question mark in narration of ' + c[0] + ' (no pitch rise available in Thai: rephrase)  WRONG'); } });
const totalSpoken = Object.values(spokenCount).reduce((a, b) => a + b, 0), nUsed = Object.keys(USED).length;
console.log(`§NUM_CHECK numbers_spoken=${totalSpoken} facts_used=${nUsed} not_in_facts=${bad} ${bad ? 'FAIL' : 'PASS'}`);
Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} word="${w(USED[k])}" <- ${X.SRC[k]}`));
Object.keys(perBeat).forEach(id => console.log(`§NUM_BEAT ${id} ${JSON.stringify(perBeat[id])}`));
if (bad) process.exit(2);
fs.writeFileSync(out, rows.join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'facts.json'), JSON.stringify({ facts: F, sources: X.SRC, spokenUsed: USED, perBeat, queries: X.Q }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${out} facts=${path.join(dir, 'facts.json')}`);
