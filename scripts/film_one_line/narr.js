// ⚠ DO NOT REMOVE — film "One line" (§24): the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled in words for the voice;
// guard.js checks each `says` entry against out/facts.json. No proof talk in the voice (owner, 2026-11-10). READ out/guard.log.
'use strict';
exports.beats = [
  { id: 'title', hold: 3.6 },
  { id: 'screens', text: 'F: Business software is full of screens. | M: And every task is a hunt for the right button.', says: [] },
  { id: 'find', text: 'M: What if you could just say it? One line. | F: Find order fifty thousand. | M: And the app answers. It is a draft.', says: [['order.number', '50000', 'fifty thousand'], ['find.docStatus', 'DR', 'draft']] },
  { id: 'do', text: 'F: What can I do with it? | M: Ask. Then do it. Complete the order. | F: One line, and the draft is completed. | M: The same engine as the screen, without the screen.', says: [['complete.after.docStatus', 'CO', 'completed']] },
  { id: 'more', text: 'M: Void an order. Close one. Reverse one. | F: Is each one just a line? | M: Each is one line.', says: [['void.after.docStatus', 'VO', 'void'], ['close.after.docStatus', 'CL', 'close'], ['reverse.after.docStatus', 'RE', 'reverse']] },
  { id: 'building', text: 'F: And the building? | M: The same door. How many rooms? Five. | M: The fire protection layout would place forty six items.', says: [['rooms', 5, 'five'], ['walk', 46, 'forty six']] },
  { id: 'script', text: 'M: Put a few lines in a file, and you have a script. | F: One I can actually read.', says: [] },
  { id: 'door', text: 'M: People type it. An A I can use the very same lines. | F: One door, and one small vocabulary.', says: [] },
  { id: 'others', text: 'F: Do other systems do this? | M: Others give programmers a code console, or a developer tool. | M: In our search, we did not find one short vocabulary that a person and an A I both type.', says: [] },
  { id: 'close', text: 'M: One line at a time. It is open source, and published so anyone\'s A I can read it. | F: And the guide shows how.', says: [] }
];
