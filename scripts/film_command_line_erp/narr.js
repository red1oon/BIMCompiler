// ⚠ DO NOT REMOVE — film "Command Line ERP" (prompts/FILM_COMMAND_LINE_ERP.md): the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled in words for the voice;
// guard.js checks each `says` entry against out/facts.json, and that email/phone/device are named ONLY in beat `onedoor`, which must say "not built". No proof talk (owner, 2026-11-10): "check", never "witness". READ out/guard.log.
'use strict';
exports.lang = 'en';
exports.beats = [
  { id: 'title', hold: 3.6 },
  { id: 'intro', text: 'F: Before windows, there was a prompt. | M: You listed records, picked one, and pressed a key. | F: Can an E R P still work like that? | M: Yes. This one does.', says: [] },
  { id: 'list', text: 'F: Here are the business partners. | M: One hundred thirteen of them. A pointer, and buttons on the row. | M: Up and down move the pointer. Left and right pick a button.', says: [['list.total', '113', 'one hundred thirteen']] },
  { id: 'keys', text: 'F: What does a key do? | M: Nothing hidden. A key is one line, and the screen prints it before it runs. | M: This whole session ran two lines. Moving the pointer ran none.', says: [['keys.lines', '2', 'two']] },
  { id: 'new', text: 'F: And a new partner? | M: The form asks only what the engine cannot fill. Two fields. | M: The engine fills the other thirty two.', says: [['new.mandatory', '2', 'two fields'], ['new.filled', '32', 'thirty two']] },
  { id: 'edit', text: 'F: And an edit? | M: Change one field, and one column goes. Not the whole record.', says: [['edit.changed', '1', 'one column']] },
  { id: 'delete', text: 'F: Can I delete the standard partner? | M: The engine says no, in its own words. Other records depend on it. | M: And a delete always asks first.', says: [] },
  { id: 'load', text: 'F: What about a list in a file? | M: A C S V. It looks first, and writes nothing. Two lines. One is fine, and one is rejected. | M: Then the good line loads.', says: [['load.rows', '2', 'two lines'], ['load.ok', '1', 'one is fine'], ['load.rejected', '1', 'one is rejected']] },
  { id: 'ai', text: 'F: Can an A I use it? | M: With the very same lines. | M: But a line that writes waits for a person. Then it runs.', says: [['ai.status', 'claim', 'waits'], ['ai.confirmStatus', 'ok', 'runs']] },
  { id: 'legacy', text: 'F: And the real iDempiere? | M: The same door asks it. It is up. | M: This order, against the legacy one. Seventy cells match, and four differ.', says: [['legacy.verdict', 'UP', 'up'], ['compare.match', '70', 'seventy'], ['compare.diff', '4', 'four']] },
  { id: 'onedoor', text: 'F: Who can talk to it? | M: Every speaker uses the same list of lines, through one door. | M: Two speakers work today: an A I, and a person. Three are planned, not built: mailbox, phone, and device. This is a prototype.', says: [['onedoor.built.length', '2', 'two speakers'], ['onedoor.planned.length', '3', 'three are planned']] },
  { id: 'light', text: 'F: How big is it? | M: The screen logic is two hundred sixteen lines, with no dependencies. | M: It runs in a terminal. No server.', says: [['light.coreLines', '216', 'two hundred sixteen'], ['light.coreRequires', '0', 'no dependencies']] },
  { id: 'close', text: 'M: A prompt, a pointer, and one door. A prototype, and open source. | F: The guide has every line.', says: [] }
];
