// ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): the beats, their narration (F asks, M answers, one short line each: the picture does the explaining) and the facts
// each beat speaks. Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
'use strict';
exports.lang = 'en';
exports.beats = [
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
