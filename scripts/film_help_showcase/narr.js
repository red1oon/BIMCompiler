// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11), ENGLISH voice, English subtitles: the beats, their narration (F asks, M answers, short: the picture
// explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json, the witness logs and the saved
// prior-art copies, and FAILS the build if one is not as stated. Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: How much of the week goes into just looking things up? | M: McKinsey estimated nearly twenty percent of it. | M: Looking for internal information, or tracking down a colleague who can help.',
    says: [['quote.found', 'Y', 'nearly twenty percent'], ['quote.source', 'McKinsey Global Institute', 'McKinsey']] },
  { id: 'before', text: 'F: What did a field tell you before? | M: Its column name and its type. | M: Now it says what legacy iDempiere says: the field\'s own description. | M: It matches the real legacy database on all fifteen thousand eight hundred and forty-nine fields. | M: Click into one, and the Tool Tip panel shows its name, its description and its help.',
    says: [['old.tooltip', 'Y', 'its column name and its type'], ['f4.n', '15849', 'fifteen thousand eight hundred and forty-nine'], ['field.panel', 'Y', 'its name, its description and its help']] },
  { id: 'ask1', text: 'F: Can I just ask it? | M: Type a question. It finds the Sales Order window and the Close action. | M: Close is allowed once the order is completed or waiting payment. | M: It also gives the command line that does it. | M: No A I inside: it matches the dictionary\'s own words.',
    says: [['ask1.window', '143', 'the Sales Order window'], ['ask1.action', 'CL', 'the Close action'], ['ask1.allowed', 'Completed, Waiting Payment', 'completed or waiting payment'], ['ask1.cli', 'erp.close kind=Order number=<Document No>', 'the command line that does it']] },
  { id: 'link', text: 'F: And these steps? | M: They come from the E R P user guide, word for word, with a link to its section. | M: Click Sales Order, and the window opens with its how-to beside it.',
    says: [['s5', '4/4', 'word for word'], ['link.opened', '143', 'the window opens'], ['link.ctx', 'Y', 'its how-to beside it']] },
  { id: 'ask2', text: 'F: What about voiding a payment? | M: The Payment window, and Void, with every status it is allowed from. | M: The command line is honest: today it is offered for orders only.',
    says: [['ask2.window', '195', 'The Payment window'], ['ask2.action', 'VO', 'Void'], ['ask2.cli_note', 'Y', 'offered for orders only']] },
  { id: 'german', text: 'F: Does it speak German? | M: Choose Deutsch. The same field\'s description is now German, | M: from the published German language pack: nearly fifteen thousand fields. | M: Its longer help has no German text yet, so it stays English, as in legacy.',
    says: [['de.fields', '14961', 'nearly fifteen thousand fields'], ['de.desc_german', 'Y', 'description is now German'], ['de.help_english', 'Y', 'stays English']] },
  { id: 'close', hold: 18 }
];
exports.lang = 'en';
exports.beats = EN;
