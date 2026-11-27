// Builds film3_en.tsv from the recorder's own log (cue = real beat/ring time + offset). Every number spoken is in FACTS and checked against §FILM3_FACT lines: a mismatch aborts. usage: node film3_make_tsv.js <film3.log> > film3_en.tsv
const fs = require('fs'); const log = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const T = {}; const facts = {}; let endT = 0;
log.forEach(l => { let m; if ((m = /§FILM3_BEAT id=(\w+) t=([\d.]+)/.exec(l))) { T['B:' + m[1]] = +m[2]; if (m[1] === 'end') endT = +m[2]; } else if ((m = /§FILM3_RING t=([\d.]+) (.*)/.exec(l))) T['R:' + m[2]] = +m[1]; else if ((m = /§FILM3_FACT (\S+?)=(.*)/.exec(l))) facts[m[1]] = m[2]; });
const at = k => { const key = Object.keys(T).find(x => x === k || (k.startsWith('R:') && x.startsWith(k))); if (!key) throw new Error('no anchor ' + k); return T[key]; };
// [id, anchor, offset, source facts, "F: .. | M: .." ]
const ROWS = [
 ['intro1', 'B:intro', 0.4, '', "M: Excel has long been the killer app. Accountants mastered it. | F: And the ERP? | M: Not so much. So we joined them, with just basic SQL, so accountants can do it well."],
 ['hook', 'B:hook', 0.4, 'pdf.page', "M: This is a finished report. One page, made from Excel. | F: Who designed it? | M: The accountant."],
 ['design1', 'B:design', 0.3, 'design.mergedRegions design.distinctFillColours', "F: So where does the look come from? | M: One sheet, named BACKUP. Plain Excel. Sixteen merged regions, ten fill colours."],
 ['design2', 'R:another fill', 0.1, '', "M: The title band is one merged cell with a fill. The boxes are fills, with thick borders."],
 ['design3', 'R:header colours', 0.1, '', "F: And the grid? | M: Header colours, zebra rows, number formats."],
 ['design4', 'R:totals row', 0.1, '', "M: A double rule under the totals. Signature boxes. Nothing here you have not already used."],
 ['rules1', 'B:rules', 0.3, 'process.rules', "F: And the numbers? | M: A second sheet, named Process. One row for every question."],
 ['rules2', 'R:SELECT', 0.1, '', "M: Select says what to ask."],
 ['rules2b', 'R:TABLE', 0.1, '', "M: Table and where say which rows. | F: And where does the answer go?"],
 ['rules3', 'R:Direction', 0.1, '', "M: Direction, over on the right. It says where the answer goes."],
 ['rules4', 'R:S =', 0.1, '', "M: S puts one value into one cell."],
 ['rules5', 'R:> =', 0.1, '', "M: Greater-than runs a list across the sheet."],
 ['rules6', 'R:V =', 0.1, '', "F: And a whole grid? | M: V runs a list down. And C ten plus B twelve fills the grid: accounts across, source tables down."],
 ['cross1', 'B:cross', 0.3, '', "F: Tell me about that C ten plus B twelve. | M: That is the killer feature. Two addresses, joined by a plus."],
 ['cross2', 'R:Add1', 0.1, '', "M: The first address says where the accounts start. They run across."],
 ['cross3', 'R:Add2', 0.1, '', "M: The second says where the source tables start. They run down."],
 ['cross4', 'R:each answer', 0.1, '', "F: And the answers? | M: Each one lands where its account and its table cross. One rule, a whole grid."],
 ['link1', 'B:link', 0.3, '', "F: But which cell does each rule fill?"],
 ['link2', 'R:this cell', 0.1, 'input.linkFormula input.cellShows', "M: An ordinary Excel link. This Input cell holds equals Process A four. It shows that rule's name: the select text between at signs, plus its row number."],
 ['link3', 'R:select text', 0.1, 'process.annotationFormula', "M: Column A in Process builds the name with a concatenate formula. Nothing is typed twice. | F: So if I move the cell? | M: The link follows."],
 ['run1', 'B:run', 0.4, 'run.addressLines process.rules process.statements', "M: Now run. The engine checks the template, then finds every linked cell. Thirty-one of them. | F: And the questions? | M: Five queries answer the eleven rules. Then it paints, and the totals recalculate."],
 ['run2', 'R:ADDRESS', 0.1, '', "M: After the run, Process shows its work. Address: where each answer went."],
 ['run3', 'R:VALUES', 0.1, '', "M: And Values: the exact numbers each SQL returned, in a white box. That is your proof."],
 ['run4', 'R:a list', 0.1, '', "M: A list fills one column for each answer."],
 ['src1', 'R:company', 0.1, '', "M: The company name: from the client table."],
 ['src2', 'R:period', 0.1, '', "M: The period: the two dates you pick."],
 ['src3', 'R:three boxes ←', 0.1, 'kpi.postings kpi.debit kpi.credit', "M: Three answers fill the boxes. Forty-eight postings. Debit, two thousand three hundred sixty-one point one four. Credit, two thousand six hundred six point two seven."],
 ['src4', 'R:account numbers', 0.1, '', "M: The account numbers and names: from the account table."],
 ['src5', 'R:rows ←', 0.1, '', "M: The rows: the source table of each posting."],
 ['src6', 'R:grid ←', 0.1, '', "F: And the grid? | M: One rule fills it, accounts against source tables."],
 ['src7', 'R:totals ←', 0.1, '', "M: The totals are plain Excel sums. Excel does that part."],
 ['empty1', 'B:empty', 0.3, 'grid.cells grid.filled grid.empty', "F: Why are some cells blank? | M: Seven of the twelve have no posting. Blank means nothing happened. We never invent a zero."],
 ['edit1', 'B:edit', 0.3, '', "F: What if I change a rule? | M: Drop one account from the rule list, in Process only. Nothing else is touched."],
 ['edit2', 'B:edit', 9.0, 'edit.grandTotalBefore edit.grandTotalAfter edit.accountsAfter', "M: The grid is three accounts now, and the grand total moves from minus two hundred forty-five point one three, to three hundred eighty-eight point two eight. | F: And it was checked? | M: Against independent SQL."],
 ['trust1', 'B:trust', 0.3, 'pdf.cellsMissing', "F: How do we know it is right? | M: Every line here is a test that ran."],
 ['trust2', 'B:trust', 6.5, '', "M: The grid matches independent SQL. All fifty-seven cells are in the PDF. The template checks pass."],
 ['close1', 'B:close', 0.4, '', "M: Design it in Excel, and get the same layout in the PDF. Rules in Process, links in Input, and Add one plus Add two builds the grid. | F: And can I trust the numbers? | M: Values shows exactly what each query returned. Your Excel. Your design. Our data."] ];

const TH = {
 intro1: "M: Excel เป็นแอปเด็ดมานานแล้วครับ นักบัญชีเชี่ยวชาญมัน | F: แล้ว ERP ล่ะคะ | M: ยังไม่ค่อยครับ เราจึงเชื่อมทั้งสองด้วย SQL พื้นฐาน เพื่อให้นักบัญชีทำได้ดีครับ",
 hook: "M: นี่คือรายงานฉบับสมบูรณ์ครับ หนึ่งหน้า ทำจาก Excel | F: ใครออกแบบคะ | M: นักบัญชีครับ",
 design1: "F: แล้วหน้าตารายงานมาจากไหนคะ | M: จากชีตเดียวชื่อ BACKUP ครับ Excel ธรรมดา มีเซลล์ผสาน 16 ส่วน สี 10 สี",
 design2: "M: แถบหัวเรื่องคือเซลล์ผสานหนึ่งเซลล์ใส่สีพื้นครับ ส่วนกล่องตัวเลขคือสีพื้นกับกรอบหนา",
 design3: "F: แล้วตารางล่ะคะ | M: สีหัวตาราง แถวสลับสี และรูปแบบตัวเลขครับ",
 design4: "M: เส้นคู่ใต้ยอดรวม และช่องลงนาม ไม่มีอะไรที่คุณไม่เคยใช้ครับ",
 rules1: "F: แล้วตัวเลขมาจากไหนคะ | M: จากชีตที่สองชื่อ Process ครับ หนึ่งแถวต่อหนึ่งคำถาม",
 rules2: "M: Select บอกว่าจะถามอะไรครับ",
 rules2b: "M: Table กับ Where บอกว่าจะดูแถวไหนครับ | F: แล้วคำตอบไปลงที่ไหนคะ",
 rules3: "M: Direction อยู่ทางขวาครับ บอกว่าคำตอบไปลงที่ไหน",
 rules4: "M: ตัว S ใส่ค่าเดียวลงเซลล์เดียวครับ",
 rules5: "M: เครื่องหมายมากกว่า เรียงรายการไปทางขวาครับ",
 rules6: "F: แล้วทั้งตารางล่ะคะ | M: ตัว V เรียงลงล่างครับ และ C10 บวก B12 สร้างทั้งตาราง บัญชีอยู่ด้านบน ตารางต้นทางอยู่ด้านข้างครับ",
 cross1: "F: ช่วยอธิบาย C10 บวก B12 หน่อยค่ะ | M: นี่คือจุดเด่นของเราครับ ที่อยู่สองจุดที่เชื่อมด้วยเครื่องหมายบวก",
 cross2: "M: ที่อยู่แรกบอกว่าบัญชีเริ่มตรงไหนครับ แล้วเรียงไปทางขวา",
 cross3: "M: ที่อยู่ที่สองบอกว่าตารางต้นทางเริ่มตรงไหนครับ แล้วเรียงลงล่าง",
 cross4: "F: แล้วคำตอบล่ะคะ | M: แต่ละค่าไปลงตรงที่บัญชีกับตารางมาตัดกันครับ กฎเดียว ได้ทั้งตาราง",
 link1: "F: แต่กฎแต่ละข้อรู้ได้อย่างไรว่าจะลงเซลล์ไหนคะ",
 link2: "M: ด้วยลิงก์ธรรมดาของ Excel ครับ เซลล์ใน Input นี้เก็บ เท่ากับ Process A4 และแสดงชื่อของกฎข้อนั้น คือข้อความ select อยู่ระหว่างเครื่องหมาย แอท บวกเลขแถว",
 link3: "M: คอลัมน์ A ใน Process สร้างชื่อนั้นด้วยสูตร CONCATENATE ครับ ไม่ต้องพิมพ์ซ้ำสองที่ | F: ถ้าฉันย้ายเซลล์ล่ะคะ | M: ลิงก์ก็ตามไปครับ",
 run1: "M: ทีนี้รันครับ เครื่องมือตรวจแม่แบบก่อน แล้วหาทุกเซลล์ที่ลิงก์ไว้ ทั้งหมด 31 เซลล์ครับ | F: แล้วคำถามล่ะคะ | M: คำสั่งค้นข้อมูล 5 คำสั่ง ตอบกฎ 11 ข้อครับ จากนั้นวาดลงแผ่น และคำนวณยอดรวมใหม่",
 run2: "M: หลังรัน Process จะแสดงผลงานของมันครับ Address คือคำตอบแต่ละค่าไปลงที่ไหน",
 run3: "M: ส่วน Values คือค่าที่แต่ละ SQL ส่งกลับมาจริงๆ ในกล่องสีขาวครับ นั่นคือหลักฐานของคุณ",
 run4: "M: รายการหนึ่งจะเติมหนึ่งคอลัมน์ต่อหนึ่งคำตอบครับ",
 src1: "M: ชื่อบริษัท มาจากตาราง client ครับ",
 src2: "M: ช่วงเวลา มาจากสองวันที่ที่คุณเลือกครับ",
 src3: "M: คำตอบสามค่าเติมกล่องครับ 48 รายการบันทึก เดบิต 2,361.14 เครดิต 2,606.27",
 src4: "M: เลขบัญชีและชื่อบัญชี มาจากตารางบัญชีครับ",
 src5: "M: แถว คือตารางต้นทางของแต่ละรายการบันทึกครับ",
 src6: "F: แล้วตารางล่ะคะ | M: กฎเดียวเติมได้ครับ บัญชีเทียบกับตารางต้นทาง",
 src7: "M: ยอดรวมคือผลรวมธรรมดาของ Excel ครับ ส่วนนี้ Excel ทำเอง",
 empty1: "F: ทำไมบางช่องว่างคะ | M: 7 จาก 12 ช่องไม่มีรายการบันทึกครับ ว่างหมายถึงไม่มีอะไรเกิดขึ้น เราไม่เคยแต่งเลขศูนย์ขึ้นมา",
 edit1: "F: ถ้าฉันเปลี่ยนกฎล่ะคะ | M: ตัดบัญชีหนึ่งออกจากรายการกฎ ใน Process อย่างเดียวครับ ส่วนอื่นไม่ถูกแตะต้อง",
 edit2: "M: ตารางเหลือสามบัญชีครับ และผลรวมทั้งหมดเปลี่ยนจากลบ 245.13 เป็น 388.28 | F: ตรวจสอบแล้วหรือคะ | M: เทียบกับ SQL อิสระครับ",
 trust1: "F: เรารู้ได้อย่างไรว่าถูกต้องคะ | M: ทุกบรรทัดตรงนี้คือการทดสอบที่รันจริงครับ",
 trust2: "M: ตารางตรงกับ SQL อิสระ เซลล์ทั้ง 57 ช่องอยู่ใน PDF ครบ และการตรวจแม่แบบผ่านครับ",
 close1: "M: ออกแบบใน Excel แล้วได้เลย์เอาต์เดียวกันใน PDF ครับ กฎอยู่ใน Process ลิงก์อยู่ใน Input และ Add1 บวก Add2 สร้างทั้งตาราง | F: แล้วเชื่อตัวเลขได้ไหมคะ | M: Values แสดงค่าที่แต่ละคำสั่งส่งกลับมาตรงๆ ครับ Excel ของคุณ ดีไซน์ของคุณ ข้อมูลของเรา"
};
const LANGX = process.env.FILM_LANG || 'en'; if (LANGX === 'th') ROWS.forEach(r => { if (!TH[r[0]]) { console.error('§FILM3_TSV no Thai text for ' + r[0]); process.exit(2); } r[4] = TH[r[0]]; });
const need = { 'design.mergedRegions': '16', 'design.distinctFillColours': '10', 'process.rules': '11', 'process.statements': '5', 'run.addressLines': '31', 'kpi.postings': '48', 'kpi.debit': '2361.14', 'kpi.credit': '2606.27', 'grid.cells': '12', 'grid.filled': '5', 'grid.empty': '7', 'edit.grandTotalBefore': '-245.13', 'edit.grandTotalAfter': '388.28', 'edit.accountsAfter': '3', 'pdf.cellsMissing': '0' };
Object.keys(need).forEach(k => { if (facts[k] !== need[k]) { console.error('§FILM3_TSV FACT MISMATCH ' + k + ' spoken=' + need[k] + ' log=' + facts[k]); process.exit(2); } });
if (!/cells=57/.test(log.join('\n'))) { console.error('§FILM3_TSV spoken "fifty-seven cells" not in log'); process.exit(2); }
const rows = ROWS.map(r => [r[0], +(at(r[1]) + r[2]).toFixed(2)]); const out = [];
ROWS.forEach((r, i) => { const cue = rows[i][1], nxt = i + 1 < rows.length ? rows[i + 1][1] - 0.25 : endT - 0.3; out.push([r[0], cue.toFixed(2), Math.max(nxt, cue + 1).toFixed(2), '§FILM3_FACT ' + (r[3] || 'beat'), r[4], r[4]].join('\t')); });
console.log(out.join('\n')); console.error('§FILM3_TSV rows=' + out.length + ' factsChecked=' + Object.keys(need).length + ' OK');
