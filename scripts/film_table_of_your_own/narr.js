// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM): the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled
// in words for the voice; guard.js checks each `says` entry against out/facts.json, that nothing NOT built is named, and that every prior-art line has a source. "check", never "witness". READ out/guard.log.
'use strict';
// FILM_LANG=zh: the Mandarin narration (translated by the build session, 2026-11-14; NOT reviewed by a native speaker). The same beats, the same facts; the spoken figure words are Chinese.
const EN = [
  { id: 'cover', hold: 3.6 },
  { id: 'sheet', text: 'F: I keep my assets in a spreadsheet. Can the E R P hold them? | M: Describe the columns. Five lines, one for each column. | M: A name, a date, a cost, a condition from a list, and a yes or no.', says: [['sheet.columns', '5', 'five lines']] },
  { id: 'oneline', text: 'F: And then? | M: One line. It makes the table, the form, and the menu entry. | M: It adds nine columns of its own, and gives twelve roles access.', says: [['add.standard', '9', 'nine columns'], ['add.roles', '12', 'twelve roles']] },
  { id: 'empty', text: 'F: The table is empty. | M: The screen says so, and offers a new record.', says: [] },
  { id: 'first', text: 'F: Let me add a tractor. | M: The form asks for one field, the name. | M: The engine fills six more.', says: [['first.asked', '1', 'one field'], ['first.filled', '6', 'six more']] },
  { id: 'refuse1', text: 'F: What if I leave the name out? | M: It is refused, and it says which column is missing.', says: [] },
  { id: 'refuse2', text: 'F: And a condition that is not on my list? | M: Refused too. It names the three values it accepts.', says: [['refuse2.valid.length', '3', 'three values']] },
  { id: 'stamp', text: 'F: Who made this record? | M: It is written on the record. Who, and when.', says: [] },
  { id: 'restart', text: 'F: I close everything, and come back. | M: The table is still there, with its one record.', says: [['restart.total', '1', 'one record']] },
  { id: 'priorart', text: 'F: Where does this come from? | M: From old ideas. A dictionary that runs any window comes from Compiere and iDempiere. | M: Others make a table from one command, or edit rows in a terminal. In the pages we read, we did not find them together in one tool.', says: [] },
  { id: 'close', text: 'M: One sheet, one line, and a working window. A prototype, and open source. | F: The guide has every line.', says: [] }
];
const ZH = [
  { id: 'cover', hold: 3.6 },
  { id: 'sheet', text: 'F: 我的资产都记在电子表格里。ERP 能管理它们吗？ | M: 把各列描述出来。五行，每列一行。 | M: 名称、日期、成本、从列表中选的状况，还有一个是或否。', says: [['sheet.columns', '5', '五行']] },
  { id: 'oneline', text: 'F: 然后呢？ | M: 只要一行。它建好表、表单和菜单项。 | M: 它自己再加上九个列，并让十二个角色可以访问。', says: [['add.standard', '9', '九个列'], ['add.roles', '12', '十二个角色']] },
  { id: 'empty', text: 'F: 表还是空的。 | M: 屏幕会这样提示，并让你新建一条记录。', says: [] },
  { id: 'first', text: 'F: 我来加一台拖拉机。 | M: 表单只问一个字段，就是名称。 | M: 其余六个由引擎填好。', says: [['first.asked', '1', '一个字段'], ['first.filled', '6', '六个']] },
  { id: 'refuse1', text: 'F: 如果我不填名称呢？ | M: 会被拒绝，并指出缺的是哪一列。', says: [] },
  { id: 'refuse2', text: 'F: 如果状况不在我的列表里呢？ | M: 同样被拒绝。它会列出可接受的三个值。', says: [['refuse2.valid.length', '3', '三个值']] },
  { id: 'stamp', text: 'F: 这条记录是谁建的？ | M: 记录上写着。谁建的，什么时候。', says: [] },
  { id: 'restart', text: 'F: 我把一切都关掉，再回来。 | M: 表还在，里面有那一条记录。', says: [['restart.total', '1', '一条记录']] },
  { id: 'priorart', text: 'F: 这些想法从哪里来？ | M: 来自早已有的想法。用一部字典运行任何窗口，出自 Compiere 和 iDempiere。 | M: 别的工具能用一条命令建表，或在终端里编辑行。在我们读过的网页里，没有看到一个工具把它们合在一起。', says: [] },
  { id: 'close', text: 'M: 一张表格，一行命令，一个可用的窗口。这是原型，并且开源。 | F: 指南里有每一行命令。', says: [] }
];
exports.lang = process.env.FILM_LANG === 'zh' ? 'zh' : 'en';
exports.beats = exports.lang === 'zh' ? ZH : EN;
