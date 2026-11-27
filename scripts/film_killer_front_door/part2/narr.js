// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 2 (prompts/FILM_KILLER_FRONT_DOOR.md, Film 2; English only): the beats and their narration text (F asks, M answers; plain short English, no jargon, no other product named, no claim beyond the limits list:
// demo books only, nothing about many users, speed, security or compliance, "tamper is caught" never "cannot be tampered", "a spreadsheet file" never "in Excel"). Numbers are spelled in words; guard.js checks each `says` entry against
// out/facts.json and that nothing on the not-said list is spoken. The closing line is the owner's (2026-11-27), only the article "an utility" fixed to "a utility". READ out/guard.log.
// No network claim is made anywhere over the ERP page.
'use strict';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  { id: 'b1a', text: 'F: Now change a number. | M: Type it in the sheet, and the page says what no longer adds up.', says: [['p1.verdictNames', 'true', 'what no longer adds up']] },
  { id: 'b1b', text: 'M: It names each cell in turn. Fix them, one by one, until the page adds up.', says: [['p1.finalAddsUp', 'true', 'adds up']] },
  { id: 'b1c', text: 'F: And the PDF? | M: Download it. The same PDF comes back, with the new figures where the old ones were. Nothing else moved.', says: [['dl.sameWithFourChanged', 'true', 'nothing else moved']] },
  { id: 'b2a', text: 'F: And the history? | M: It is inside the file. Open it again: every entry is checked, and it carries on.', says: [['reopen.ok', 'true', 'every entry is checked']] },
  { id: 'b2b', text: 'M: Ask any cell for its story.', says: [['story.ok', 'true', 'story']] },
  { id: 'b3', text: 'F: What if someone edits the history by hand? | M: It is caught, and it names the entry.', says: [['broken.ok', 'true', 'caught']] },
  { id: 'choice', hold: 3.6 },
  { id: 'b4a', text: 'F: Now a spreadsheet file with an invoice. The printed total is wrong. | M: It stops, and names both figures.', says: [['refused.ok', 'true', 'names both figures']] },
  { id: 'b4b', text: 'M: Fix the total, and it files a real invoice, with its accounting entries. Six entries, and debit equals credit.', says: [['books.entries', '6', 'six entries'], ['books.balanced', 'true', 'debit equals credit']] },
  { id: 'b5a', text: 'F: Can I see it in the ERP? | M: Open in the ERP. The invoice is in its own window, on the demo books.', says: [['erp.once', 'true', 'its own window']] },
  { id: 'b5b', text: 'M: And the entries it posted, as the ERP itself shows them. Debit equals credit.', says: [['posted.balanced', 'true', 'debit equals credit']] },
  { id: 'b5c', text: 'M: Then a report that includes it. In the Trial Balance, Accounts Receivable holds one hundred fifty-three dollars fifty from this invoice.', says: [['report.thisInvoice', '153.5', 'one hundred fifty-three dollars fifty'], ['report.honest', 'true', 'report that includes it']] },
  { id: 'b6', text: 'M: ERP is now a utility, no longer a luxury. It is granted free.', says: [] },
  { id: 'prior', hold: 5.5 }   // the final silent "Prior art / credentials" card; its lines come from out/credits.json (credits.js)
];
exports.lang = 'en';
