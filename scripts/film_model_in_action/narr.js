// ⚠ DO NOT REMOVE — film "Model in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 1): the beats, their narration (F asks, M answers, one short line each: the picture does the explaining) and the facts each beat speaks.
// Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
'use strict';
exports.lang = 'en';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  { id: 'open', text: 'F: I have a drawing of a shed. Nine sheets. | M: Open them. Nine sheets, the canvas fills.', says: [['add.sheets', '9', 'nine sheets']] },
  { id: 'convert', text: 'F: Make it a model. | M: One line. Four hundred forty-four elements.', says: [['add.elements', '444', 'four hundred forty-four']] },
  { id: 'addbay_high', text: 'F: The shed must be one bay longer. | M: Add a bay at the high end. Twenty-nine copies, and the gate is clean.', says: [['add.copies', '29', 'twenty-nine copies']] },
  { id: 'undo', text: 'F: Take it back. | M: Undo. The count returns to four hundred forty-four.', says: [['add.undoTo', '444', 'four hundred forty-four']] },
  { id: 'addbay_low', text: 'F: And at the other end? | M: Same bay. This time the gate shows orange, and it says so.', says: [] },
  { id: 'refuse', text: 'F: Which end is sideways? | M: Refused. It is high or low.', says: [] },
  { id: 'close', text: 'M: A drawing, three lines, one more bay, with its cost. A prototype, and open source. | F: The guide has every line.', says: [] },
  { id: 'priorart', hold: 13, text: 'M: Others made the parts. These are the ideas we learn from. | F: In the pages we read, we did not find them together in one tool.', says: [] }
];
