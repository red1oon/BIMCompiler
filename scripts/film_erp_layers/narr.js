// ⚠ DO NOT REMOVE — film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2), ENGLISH ONLY: the beats, their narration (F asks, M answers) and the facts each beat
// speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json and out/shots.log and FAILS the build if one is not as stated. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.2 },
  { id: 'setup', text: 'F: How do I see the code behind an ERP field? | M: One command indexes every registration: three hundred and two. One bookmark loads the tool into this tab. The shipped ERP never loads it.',
    says: [['index.entries', '302', 'three hundred and two']] },
  { id: 'move1', text: 'F: Target Document Type. What runs on it? | M: Hover it: twenty layers, in the order they fire. First the callout, CalloutOrder, line ninety-seven, ported from CalloutOrder dot java. Then the picker rule, then everything on save. Alt one opens the callout.',
    says: [['doctype.layers', '20', 'twenty layers'], ['doctype.callout_line', '97', 'line ninety-seven'], ['doctype.callout_legacy', 'CalloutOrder.java', 'CalloutOrder dot java'], ['doctype.alt1_opens_callout', 'Y', 'Alt one opens the callout']] },
  { id: 'move2', text: 'F: And when it says a piece is missing? | M: It said that once, wrongly: Date Ordered\'s date callout. The tool\'s own test asked the engine, and the engine runs it. Seventeen false alarms, now zero. One hundred and ninety-nine are really missing, across twelve thousand three hundred and twenty-three fields.',
    says: [['red.false_unported', '17', 'seventeen false alarms'], ['fix.false_unported', '0', 'now zero'], ['old.dateacct_unported', 'Y', 'it said that once'], ['new.dateacct_line_found', 'Y', 'the engine runs it'], ['fix.unported', '199', 'one hundred and ninety-nine'], ['fix.fields', '12323', 'twelve thousand three hundred and twenty-three']] },
  { id: 'close', hold: 18 }
];
exports.lang = 'en';
exports.beats = EN;
