// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM): the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled
// in words for the voice; guard.js checks each `says` entry against out/facts.json, that nothing NOT built is named, and that every prior-art line has a source. "check", never "witness". READ out/guard.log.
'use strict';
exports.lang = 'en';
exports.beats = [
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
