// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 3, the memory (prompts/FILM_KILLER_FRONT_DOOR.md, Film 3; English only): the beats and their narration text (F asks, M answers; plain short English, no jargon, no other product named, no claim beyond the limits list:
// "a spreadsheet file" never "in Excel"; a name is typed, not a signature; no claim that the time of an entry is protected; "caught", never "cannot be tampered"; no "merge once, done forever"; no many-users, speed, security, compliance or phone claim). Numbers are spelled in words;
// guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
// "Nothing is uploaded" is spoken only because the take shows it: the server saw no request after the pages were ready, nothing but GETs, nothing to another host (facts d.noUpload).
'use strict';
exports.beats = [
  { id: 'cover', hold: 3.6 },
  { id: 'b1a', text: 'F: Here is my spreadsheet file. | M: Open it on this page. Nothing is uploaded.', says: [['d.noUpload', 'true', 'nothing is uploaded']] },
  { id: 'b1b', text: 'M: Type your name, and press Stamp. The file now remembers all one hundred fourteen cells.', says: [['d.genesisCells', '114', 'one hundred fourteen cells'], ['d.stamp1', 'true', 'the file now remembers']] },
  { id: 'b2', text: 'F: Someone changes the file somewhere else. | M: Open it again, and the page lists exactly what changed since the last stamp.', says: [['d.listedExactly', 'true', 'exactly what changed']] },
  { id: 'b3', text: 'M: One of them is a number typed over a formula. That is flagged.', says: [['d.overFlagged', 'true', 'flagged']] },
  { id: 'b2s', text: 'M: Stamp it. One entry, with those cells only.', says: [['d.stamp2', 'true', 'those cells only']] },
  { id: 'b4', text: 'F: What did that cell go through? | M: Its whole story: every value, who, and when. The name is typed, so it is not a signature.', says: [['d.storyThree', 'true', 'whole story']] },
  { id: 'b5', text: 'F: Can I see the sheet as it was? | M: Pick any step. It comes back as it was, and you can download that version.', says: [['d.rewindOk', 'true', 'download that version']] },
  { id: 'b6a', text: 'F: Two people each changed a copy, and emailed them back. | M: Open the other copy. Different cells combine. The same cell changed two ways is a clash, with both values and both names. Nothing is overwritten until you choose.', says: [['d.mergeCombine', 'true', 'different cells combine'], ['d.oneClash', 'true', 'both values and both names']] },
  { id: 'b6b', text: 'M: Choose one, and finish. The merged file checks out, and that cell\'s story names both people.', says: [['d.mergedOk', 'true', 'checks out']] },
  { id: 'b7', text: 'F: And if someone edits the history by hand? | M: It is caught, and the entry is named. Stamp refuses to go on.', says: [['d.tamperCaught', 'true', 'caught']] },
  { id: 'close', text: 'M: Your own file first. A memory inside it. And the books, when you choose.', says: [] },
  { id: 'prior', hold: 5.5 }   // the final silent "Prior art / credentials" card; its lines come from out/credits.json (credits.js)
];
exports.lang = 'en';
