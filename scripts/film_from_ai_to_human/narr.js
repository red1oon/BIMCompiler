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
exports.lang = 'en';
exports.beats = EN;
