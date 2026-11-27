// ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): the beats, their narration (F asks, M answers, one short line each: the picture does the explaining) and the facts
// each beat speaks. Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 3.6 },
  { id: 'sheet', text: 'F: My assets live in a spreadsheet. | M: Five lines. One for each column.', says: [['sheet.columns', '5', 'five lines']] },
  { id: 'oneline', text: 'M: One line makes the window. | M: Below, the E R P has it, with six columns in its grid.', says: [['add.gridColumns', '6', 'six columns']] },
  { id: 'create', text: 'F: Add a tractor. | M: One line, and it is a row.', says: [] },
  { id: 'create2', text: 'M: Another line, another row. Two rows.', says: [['s3.rows', '2', 'two rows']] },
  { id: 'update', text: 'F: The plough got worse. | M: Change it by its name. The window reads poor.', says: [] },
  { id: 'refuse', text: 'F: And a condition that is not on my list? | M: Refused. It names the three it accepts. Nothing changed below.', says: [['refuse.valid.length', '3', 'the three']] },
  { id: 'load', text: 'F: I have more, in a file. | M: Load it. Three rows go in. Five in the window.', says: [['load.loaded', '3', 'three rows'], ['s6.rows', '5', 'five in']] },
  { id: 'delete', text: 'F: The plough is sold. | M: Delete it by its name. Four rows.', says: [['s7.rows', '4', 'four rows']] },
  { id: 'sum', text: 'F: What is it all worth? | M: Ask for the sum.', says: [] },
  { id: 'close', text: 'M: The same data, in the terminal and in the E R P window. A prototype, and open source. | F: The guide has every line.', says: [] }
];
const ZH = [
  { id: 'cover', hold: 3.6 },
  { id: 'sheet', text: 'F: 我的资产都在电子表格里。 | M: 五行，每列一行。', says: [['sheet.columns', '5', '五行']] },
  { id: 'oneline', text: 'M: 一行命令，就建好窗口。 | M: 下面的 ERP 里已经有了，网格有六列。', says: [['add.gridColumns', '6', '六列']] },
  { id: 'create', text: 'F: 加一台拖拉机。 | M: 一行命令，就是一条记录。', says: [] },
  { id: 'create2', text: 'M: 再一行，再一条记录。共两条。', says: [['s3.rows', '2', '两条']] },
  { id: 'update', text: 'F: 犁的状况变差了。 | M: 按名称修改。窗口里显示 Poor。', says: [] },
  { id: 'refuse', text: 'F: 如果状况不在我的列表里呢？ | M: 被拒绝。它列出可接受的三个值。下面的窗口没有变化。', says: [['refuse.valid.length', '3', '三个值']] },
  { id: 'load', text: 'F: 我还有更多数据，在一个文件里。 | M: 加载它。三行进来。窗口里共五行。', says: [['load.loaded', '3', '三行'], ['s6.rows', '5', '五行']] },
  { id: 'delete', text: 'F: 犁卖掉了。 | M: 按名称删除。剩下四行。', says: [['s7.rows', '4', '四行']] },
  { id: 'sum', text: 'F: 这些资产一共值多少钱？ | M: 求一个总和。', says: [] },
  { id: 'close', text: 'M: 终端和 ERP 窗口里，是同一份数据。这是原型，并且开源。 | F: 指南里有每一行命令。', says: [] }
];
const TH = [
  { id: 'cover', hold: 3.6 },
  { id: 'sheet', text: 'F: สินทรัพย์ของฉันอยู่ในสเปรดชีต | M: ห้าบรรทัด หนึ่งบรรทัดต่อหนึ่งคอลัมน์', says: [['sheet.columns', '5', 'ห้าบรรทัด']] },
  { id: 'oneline', text: 'M: หนึ่งบรรทัดก็สร้างหน้าต่างขึ้นมา | M: ด้านล่าง ERP มีหน้าต่างนั้นแล้ว ตารางมีหกคอลัมน์', says: [['add.gridColumns', '6', 'หกคอลัมน์']] },
  { id: 'create', text: 'F: เพิ่มรถแทรกเตอร์หนึ่งคัน | M: หนึ่งบรรทัด ก็ได้หนึ่งแถว', says: [] },
  { id: 'create2', text: 'M: อีกบรรทัด ก็อีกแถว รวมเป็นสองแถว', says: [['s3.rows', '2', 'สองแถว']] },
  { id: 'update', text: 'F: คันไถสภาพแย่ลง | M: แก้ด้วยชื่อ หน้าต่างแสดงว่า Poor', says: [] },
  { id: 'refuse', text: 'F: แล้วถ้าสภาพไม่อยู่ในรายการของฉันล่ะ | M: ถูกปฏิเสธ มันบอกสามค่าที่รับได้ ด้านล่างไม่เปลี่ยน', says: [['refuse.valid.length', '3', 'สามค่า']] },
  { id: 'load', text: 'F: ฉันมีอีกส่วนอยู่ในไฟล์ | M: โหลดเข้าไป สามแถวเข้ามา ในหน้าต่างมีห้าแถว', says: [['load.loaded', '3', 'สามแถว'], ['s6.rows', '5', 'ห้าแถว']] },
  { id: 'delete', text: 'F: ขายคันไถไปแล้ว | M: ลบด้วยชื่อ เหลือสี่แถว', says: [['s7.rows', '4', 'สี่แถว']] },
  { id: 'sum', text: 'F: ทั้งหมดมีมูลค่าเท่าไร | M: ขอผลรวม', says: [] },
  { id: 'close', text: 'M: ข้อมูลเดียวกัน ทั้งในเทอร์มินัลและในหน้าต่าง ERP นี่คือต้นแบบ และเป็นโอเพนซอร์ส | F: คู่มือมีทุกบรรทัด', says: [] }
];
// FILM_LANG=zh | th: the Mandarin / Thai narration, translated by the build session (2026-11-14), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are in that language.
exports.lang = { zh: 'zh', th: 'th' }[process.env.FILM_LANG] || 'en';
exports.beats = { en: EN, zh: ZH, th: TH }[exports.lang];
