// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps", PART 1 (prompts/FILM_KILLER_FRONT_DOOR.md §3 beats 0-5, §4 cut A; owner 2026-11-27: English only). The beats and their narration text (F asks, M answers; plain short English,
// no jargon, no other product named, no claim beyond the plan's limits list: nothing about many users, speed or compliance; "a spreadsheet file", never "Excel opens it"). The wording follows the coordinator's outline of
// 2026-11-27 and the owner's last-card line ("An ERP is available, free to use."). Numbers are spelled in words; guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
// Beat 1 does NOT say "stays on your computer": the take counted ONE request after the file was chosen (the page's own worker script), so the network claim is reworded to "on your own computer" (plan §3 beat 1 rule; see out/facts.log §FACTS b1).
'use strict';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  { id: 'b1', text: 'F: Everyone already has the report. It is a PDF. | M: Open it here, on your own computer.', says: [] },
  { id: 'b2a', text: 'M: First, it is just a reader. Find a word, and it counts every hit.', says: [['find.everyHit', 'true', 'every hit']] },
  { id: 'b2b', text: 'M: Or jump by the outline.', says: [] },
  { id: 'b3a', text: 'F: Now ask it one thing. Read this as a sheet. | M: All one hundred forty-four cells land where they were in the spreadsheet that printed them. And it checks the sums itself. Debit equals credit. It adds up.', says: [['read.cells', '144', 'one hundred forty-four'], ['read.debitEqualsCredit', 'true', 'debit equals credit'], ['read.verdict', 'ADDS_UP', 'it adds up']] },
  { id: 'b3b', text: 'M: Point at a number. That is where it came from.', says: [['box.inside', 'true', 'where it came from']] },
  { id: 'b4', text: 'F: Now a copy with one digit changed. | M: It does not add up. And it says where.', says: [['changed.linesDiffer', '1', 'one digit'], ['bad.verdict', 'DOES_NOT_ADD_UP', 'does not add up']] },
  { id: 'b5a', text: 'M: Take it with you as a spreadsheet file. The totals are real formulas.', says: [['xlsx.d28f', 'SUM(D6:D26)', 'real formulas']] },
  { id: 'b5b', text: 'F: Switch the network off. | M: It still works.', says: [['offline.worked', 'true', 'still works']] },
  { id: 'last', text: 'M: This is the way in. Your own file first. | M: Next: change a number and get the same PDF back. | M: Then file it into the books, when you choose. An ERP is available, free to use.', says: [] }
];
exports.lang = 'en';
