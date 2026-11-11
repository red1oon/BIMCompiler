// ⚠ DO NOT REMOVE — film "From AI to Human": the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled in words for the voice;
// guard.js checks each `says` entry against out/facts.json. No proof talk in the voice (owner, 2026-11-10): the word "check" is used where the screen says witness. READ out/guard.log.
'use strict';
const EN = [
  { id: 'title', hold: 3.6 },
  { id: 'intro', text: 'F: When an A I does a job for you, it writes small scripts. | M: Then it throws them away. | F: And next time? | M: It writes them again.', says: [] },
  { id: 'twin', text: 'F: Here is one. Eighty three lines, to compare two systems. | M: Now the same job is one line. Compare this order with the one in the real iDempiere. | M: Seventy cells match. Four differ. Seven are empty on the other side.', says: [['before.twin.lines', '83', 'eighty three'], ['compare.cells.match', '70', 'seventy'], ['compare.cells.diff', '4', 'four'], ['compare.cells.nullVsDefault', '7', 'seven']] },
  { id: 'column', text: 'F: Where does this value come from? | M: Ask both dictionaries. | M: Legacy fills it at login, with row one hundred fourteen. And the answer says what the other side lacks.', says: [['column.legacyDefaultId', '114', 'one hundred fourteen']] },
  { id: 'where', text: 'F: And where is that in the source? | M: One line again. | M: Twenty lines in the order callout, each with its file and its line number.', says: [['where.total', '20', 'twenty']] },
  { id: 'status', text: 'F: Is the test server running? | M: Ask. It is up.', says: [['status.verdict', 'UP', 'up']] },
  { id: 'witness', text: 'F: Run a check, and read what it says. | M: One line. It keeps the whole log, and gives the result. | M: Eight checks, and none failed.', says: [['witness.pass', '8', 'eight'], ['witness.fail', '0', 'none failed']] },
  { id: 'sheet', text: 'F: Where does a data model start? | M: In a sheet. Thirteen tabs, in order. | M: A row may only point at a tab before it.', says: [['sheet.count', '13', 'thirteen']] },
  { id: 'diagram', text: 'M: The sheet makes both halves of a plugin. The pack, for the dictionary. And the Java classes, for the code. | F: Both go to the legacy server.', says: [] },
  { id: 'pack', text: 'F: And for a legacy server? | M: One line makes the pack, with one hundred eight elements. It names two process classes.', says: [['pack.elements', '108', 'one hundred eight'], ['pack.processClasses', '2', 'two']] },
  { id: 'twopack', text: 'F: Legacy people know the two pack. | M: This is one. A zip of two files, with the dictionary rows as X M L. Metadata only.', says: [['twopack.fileCount', '2', 'two']] },
  { id: 'again', text: 'F: And if I run it again? | M: It says unchanged. A released pack is never changed. | M: The rules stay in hand written code.', says: [['pack.again', 'unchanged', 'unchanged']] },
  { id: 'manual', text: 'F: How was that done by hand? | M: Five dictionary windows. Then pack out, carry the zip, pack in, and restart. | M: Now the pack is one line.', says: [['manual.windowsFound', '5', 'five']] },
  { id: 'twinlight', text: 'F: And our twin? | M: The same sheet, loaded with the page. No server to install, and no restart. | M: Legacy refreshes in seven steps.', says: [['legacySteps', '7', 'seven']] },
  { id: 'claim', text: 'F: Who else can type these lines? | M: The A I can, with the very same lines. | M: But a line that changes data waits for a person.', says: [['claim.status', 'claim', 'waits']] },
  { id: 'close', text: 'M: What an A I writes for itself, now a line for everyone. Thirty eight today, open source. | F: And the guide lists them all.', says: [['verbs', '38', 'thirty eight']] }
];
const ZH = [
  { id: 'title', hold: 3.6 },
  { id: 'intro', text: 'F: AI 帮你做事的时候，会写一些小脚本。 | M: 然后把它们丢掉。 | F: 下一次呢？ | M: 再写一遍。', says: [] },
  { id: 'twin', text: 'F: 这是其中一个。八十三行，只为比较两个系统。 | M: 现在同样的事只要一行。把这张订单，和真正的 iDempiere 里的那张比一比。 | M: 七十个单元格一致，四个不同，七个在另一边是空的。', says: [['before.twin.lines', '83', '八十三'], ['compare.cells.match', '70', '七十'], ['compare.cells.diff', '4', '四个'], ['compare.cells.nullVsDefault', '7', '七个']] },
  { id: 'column', text: 'F: 这个值是从哪里来的？ | M: 问两边的字典。 | M: 旧系统在登录时填入它，是第一百一十四行。答案还会说明另一边缺什么。', says: [['column.legacyDefaultId', '114', '一百一十四']] },
  { id: 'where', text: 'F: 那它在源代码的哪里？ | M: 又是一行命令。 | M: 订单回调里有二十行，每一行都带文件名和行号。', says: [['where.total', '20', '二十']] },
  { id: 'status', text: 'F: 测试服务器在运行吗？ | M: 问一下。它在运行。', says: [['status.verdict', 'UP', '运行']] },
  { id: 'witness', text: 'F: 运行一次检查，读出结果。 | M: 一行命令。它保存完整日志，并给出结果。 | M: 八项检查，没有一项失败。', says: [['witness.pass', '8', '八项'], ['witness.fail', '0', '没有一项失败']] },
  { id: 'sheet', text: 'F: 数据模型从哪里开始？ | M: 从一张表格。十三个标签页，按顺序排列。 | M: 每一行只能指向它前面的标签页。', says: [['sheet.count', '13', '十三']] },
  { id: 'diagram', text: 'M: 这张表格生成插件的两半。字典部分是包，代码部分是 Java 类。 | F: 两者都送到旧系统服务器。', says: [] },
  { id: 'pack', text: 'F: 那旧系统服务器呢？ | M: 一行命令生成这个包，共一百零八个元素，并指明两个流程类。', says: [['pack.elements', '108', '一百零八'], ['pack.processClasses', '2', '两个']] },
  { id: 'twopack', text: 'F: 旧系统的用户都熟悉二包。 | M: 这就是一个。一个压缩包，两个文件，字典的行用 XML 写成。只有元数据。', says: [['twopack.fileCount', '2', '两个']] },
  { id: 'again', text: 'F: 再运行一次呢？ | M: 它会说没有变化。已发布的包永远不会被改动。 | M: 规则仍然由手写的代码负责。', says: [['pack.again', 'unchanged', '没有变化']] },
  { id: 'manual', text: 'F: 以前手工是怎么做的？ | M: 五个字典窗口。然后导出包，搬运压缩包，导入包，再重启。 | M: 现在，生成包只要一行。', says: [['manual.windowsFound', '5', '五个']] },
  { id: 'twinlight', text: 'F: 那我们的孪生系统呢？ | M: 同一张表格，随页面一起加载。不用安装服务器，也不用重启。 | M: 旧系统的刷新要七个步骤。', says: [['legacySteps', '7', '七个']] },
  { id: 'claim', text: 'F: 还有谁能输入这些命令？ | M: AI 也可以，用完全相同的命令。 | M: 但会修改数据的命令，要等一个人来确认。', says: [['claim.status', 'claim', '等']] },
  { id: 'close', text: 'M: AI 为自己写的东西，现在成了人人可用的一行命令。今天有三十八个，开源。 | F: 指南里列出了全部。', says: [['verbs', '38', '三十八']] }
];
const TH = [
  { id: 'title', hold: 3.6 },
  { id: 'intro', text: 'F: เวลา AI ทำงานให้คุณ มันจะเขียนสคริปต์เล็ก ๆ | M: แล้วก็ทิ้งไป | F: แล้วครั้งหน้าล่ะ | M: ก็เขียนใหม่อีกรอบ', says: [] },
  { id: 'twin', text: 'F: นี่คือหนึ่งในนั้น แปดสิบสามบรรทัด แค่เพื่อเทียบสองระบบ | M: ตอนนี้งานเดียวกันเหลือบรรทัดเดียว เทียบใบสั่งนี้กับใบสั่งใน iDempiere ตัวจริง | M: เจ็ดสิบเซลล์ตรงกัน สี่เซลล์ต่างกัน และเจ็ดเซลล์ว่างอยู่อีกฝั่ง', says: [['before.twin.lines', '83', 'แปดสิบสาม'], ['compare.cells.match', '70', 'เจ็ดสิบ'], ['compare.cells.diff', '4', 'สี่เซลล์'], ['compare.cells.nullVsDefault', '7', 'เจ็ดเซลล์']] },
  { id: 'column', text: 'F: ค่านี้มาจากไหน | M: ถามพจนานุกรมทั้งสองฝั่ง | M: ระบบเดิมเติมตอนล็อกอิน เป็นแถวหนึ่งร้อยสิบสี่ และคำตอบยังบอกด้วยว่าอีกฝั่งขาดอะไร', says: [['column.legacyDefaultId', '114', 'หนึ่งร้อยสิบสี่']] },
  { id: 'where', text: 'F: แล้วในซอร์สโค้ดอยู่ตรงไหน | M: อีกหนึ่งบรรทัด | M: ยี่สิบบรรทัดในคอลแบ็กของใบสั่ง แต่ละบรรทัดมีชื่อไฟล์และเลขบรรทัด', says: [['where.total', '20', 'ยี่สิบ']] },
  { id: 'status', text: 'F: เซิร์ฟเวอร์ทดสอบทำงานอยู่ไหม | M: ถามดู มันทำงานอยู่', says: [['status.verdict', 'UP', 'ทำงาน']] },
  { id: 'witness', text: 'F: รันการตรวจสักครั้ง แล้วอ่านผล | M: หนึ่งบรรทัด มันเก็บบันทึกทั้งหมด และให้ผลลัพธ์ | M: แปดการตรวจ ไม่มีข้อไหนล้มเหลว', says: [['witness.pass', '8', 'แปด'], ['witness.fail', '0', 'ไม่มี']] },
  { id: 'sheet', text: 'F: โมเดลข้อมูลเริ่มจากตรงไหน | M: จากตารางสเปรดชีต สิบสามแท็บ เรียงตามลำดับ | M: หนึ่งแถวชี้ได้เฉพาะแท็บที่อยู่ก่อนหน้า', says: [['sheet.count', '13', 'สิบสาม']] },
  { id: 'diagram', text: 'M: ตารางนี้สร้างปลั๊กอินได้ครบสองส่วน ส่วนพจนานุกรมคือแพ็ก ส่วนโค้ดคือคลาส Java | F: ทั้งสองส่งไปยังเซิร์ฟเวอร์ระบบเดิม', says: [] },
  { id: 'pack', text: 'F: แล้วสำหรับเซิร์ฟเวอร์ระบบเดิมล่ะ | M: หนึ่งบรรทัดสร้างแพ็ก มีหนึ่งร้อยแปดองค์ประกอบ และระบุชื่อสองคลาสกระบวนการ', says: [['pack.elements', '108', 'หนึ่งร้อยแปด'], ['pack.processClasses', '2', 'สอง']] },
  { id: 'twopack', text: 'F: คนใช้ระบบเดิมคุ้นกับทูแพ็ก | M: นี่คือทูแพ็ก ไฟล์ zip สองไฟล์ แถวพจนานุกรมเขียนเป็น XML มีแต่เมตาดาตา', says: [['twopack.fileCount', '2', 'สองไฟล์']] },
  { id: 'again', text: 'F: ถ้ารันซ้ำล่ะ | M: มันบอกว่าไม่เปลี่ยน แพ็กที่ปล่อยแล้วจะไม่ถูกแก้อีก | M: ส่วนกฎยังอยู่ในโค้ดที่เขียนด้วยมือ', says: [['pack.again', 'unchanged', 'ไม่เปลี่ยน']] },
  { id: 'manual', text: 'F: แต่ก่อนทำมืออย่างไร | M: ห้าหน้าต่างพจนานุกรม แล้วส่งออกแพ็ก ขนไฟล์ zip นำแพ็กเข้า และรีสตาร์ต | M: ตอนนี้แพ็กเหลือบรรทัดเดียว', says: [['manual.windowsFound', '5', 'ห้า']] },
  { id: 'twinlight', text: 'F: แล้วระบบแฝดของเราล่ะ | M: เวิร์กบุ๊กเดียวกัน โหลดมากับหน้าเว็บ ไม่ต้องติดตั้งเซิร์ฟเวอร์ และไม่ต้องรีสตาร์ต | M: ระบบเดิมรีเฟรชเจ็ดขั้นตอน', says: [['legacySteps', '7', 'เจ็ด']] },
  { id: 'claim', text: 'F: ใครอีกที่พิมพ์คำสั่งเหล่านี้ได้ | M: AI ก็ได้ ด้วยคำสั่งเดียวกันเป๊ะ | M: แต่คำสั่งที่แก้ข้อมูล ต้องรอคนยืนยัน', says: [['claim.status', 'claim', 'รอ']] },
  { id: 'close', text: 'M: สิ่งที่ AI เขียนไว้ใช้เอง ตอนนี้เป็นหนึ่งบรรทัดสำหรับทุกคน วันนี้มีสามสิบแปดคำสั่ง เป็นโอเพนซอร์ส | F: และคู่มือรวมไว้ให้ทั้งหมด', says: [['verbs', '38', 'สามสิบแปด']] }
];
exports.lang = process.env.FILM_LANG === 'zh' ? 'zh' : process.env.FILM_LANG === 'th' ? 'th' : 'en';
exports.beats = exports.lang === 'zh' ? ZH : exports.lang === 'th' ? TH : EN;
