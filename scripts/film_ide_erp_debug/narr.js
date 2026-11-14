// ⚠ DO NOT REMOVE — film 3 "The invoice dated yesterday" (prompts/FILM_IDE_ERP_DEBUG.md), ENGLISH ONLY: the beats, their narration (F asks, M answers, short: the picture explains) and the facts each beat speaks.
// Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json, out/shots.log, out/before.log/after.log and the plan, and FAILS the build if one is
// not as stated. Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 3.6 },
  { id: 'wrong', text: 'F: I made an invoice at half past midnight, on the thirteenth. | M: The ERP window, below, says the twelfth.',
    says: [['clock.time', '00:30', 'half past midnight'], ['clock.localDay', '2026-11-13', 'the thirteenth'], ['old.invoiceDay', '2026-11-12', 'the twelfth']] },
  { id: 'hover', text: 'F: What is that line in the test? | M: Hover the tag. It names the spec that explains it, and the line that prints it.',
    says: [['hover.names_spec', 'Y', 'names the spec'], ['hover.names_printer', 'Y', 'the line that prints it']] },
  { id: 'find', text: 'F: Where does the date come from? | M: F twelve on the call. It lands on env, line seventy-nine. The next line cuts the day from the U T C string.',
    says: [['def.line', '79', 'seventy-nine'], ['old.next_line_utc', 'Y', 'U T C string']] },
  { id: 'fix', text: 'M: Two edits: thirty keys, then thirty-nine. Ask the login context for the local day.',
    says: [['typed.0', '30', 'thirty'], ['typed.1', '39', 'thirty-nine']] },
  { id: 'proof', text: 'F: Run it again. | M: Both zones say same, yes. And the page, opened on the new data, says the thirteenth.',
    says: [['after.same_y', '2', 'both zones say same'], ['new.invoiceDay', '2026-11-13', 'the thirteenth']] },
  { id: 'close', text: 'M: Two lines in, two lines out. The check that found it now guards it. | F: It is in the guide, section five point six.',
    says: [['diff.ins', '2', 'two lines in'], ['diff.del', '2', 'two out'], ['guide.section', '5.6', 'section five point six']] }
];
exports.lang = 'en';
exports.beats = EN;
