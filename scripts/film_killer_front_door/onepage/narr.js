// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps — ONE PAGE" (prompts/FILM_KILLER_FRONT_DOOR.md, FILM v2; English only): the beats and their narration text (F asks, M answers; plain short English, no jargon, no other product named).
// NO novelty word anywhere (new, first, unique, only): no prior-art search has been done. "a spreadsheet file", never "in Excel" (real Excel has not been run); "an emulated phone", never a real one; "caught"/"names", never "cannot be tampered".
// Every figure in the voice is SPELLED in words from out/facts.json (this file reads it), and guard.js checks each `says` entry against facts.json and that nothing on the not-said list is spoken. READ out/guard_voice.log.
// "Nothing is uploaded" is spoken only because the take measured it (facts d.noUpload: no request that is not a plain download, none to another host, no page error, over the PDF-page sessions).
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', 'facts.json'), 'utf8')), d = F.d;
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n) => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : ''); return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + words(n % 1000) : ''); };
const secs = (ms) => { const s = (ms / 1000).toFixed(2).split('.'); return words(+s[0]) + ' point ' + s[1].split('').map(c => ONES[+c]).join(' '); };   // 1554 -> "one point five five" (two decimals of what the build measured)
exports.words = words; exports.secs = secs;
const upload = d.noUpload ? ' Nothing is uploaded.' : '';
exports.beats = [
  { id: 'cover', hold: 4.0 },
  { id: 'b1', text: 'F: I open the page, and choose a report. | M: It is a table of ' + words(d.cells) + ' cells, and the totals add up.' + upload,
    says: [['d.cells', String(d.cells), words(d.cells)], ['d.addsUp', 'true', 'totals add up']].concat(d.noUpload ? [['d.noUpload', 'true', 'nothing is uploaded']] : []) },
  { id: 'b2a', text: 'M: Change a number where it stands. The total turns red, with the gap: ' + words(d.gap) + '.', says: [['d.gap', String(d.gap), words(d.gap)], ['d.redTotal', 'true', 'turns red']] },
  { id: 'b2a2', text: 'M: Put it back, and it turns green.', says: [['d.greenAgain', 'true', 'green']] },
  { id: 'b2b', text: 'M: Change a word the same way. A letter the font lacks gets a red box.', says: [['d.wordEdited', 'true', 'change a word'], ['d.fontBox', 'true', 'red box']] },
  { id: 'b2c', text: 'M: Undo takes it back.', says: [['d.undoClears', 'true', 'undo']] },
  { id: 'b3', text: 'F: And the rest of the file? | M: Left alone. The picture is locked, and ' + words(d.objectsIdentical) + ' of the ' + words(d.objectsInOriginal) + ' parts of the file are the same.',
    says: [['d.pictureLocked', 'true', 'picture is locked'], ['d.objectsIdentical', String(d.objectsIdentical), words(d.objectsIdentical)], ['d.objectsInOriginal', String(d.objectsInOriginal), words(d.objectsInOriginal)], ['d.integrity', 'true', 'left alone'], ['d.changedAreCatalogAndPage', 'true', 'left alone']] },
  { id: 'b4', text: 'M: The same PDF came back, and the page gives a spreadsheet file too, with real sums. Open it again: the history is inside both.', says: [['d.sumFormulas', String(d.sumFormulas), 'real sums'], ['d.historyInBoth', 'true', 'inside both'], ['d.historyOnSheetPage', 'true', 'open it again'], ['d.noDoorText', 'true', 'spreadsheet file']] },
  { id: 'b5', text: 'F: What happened to that cell? | M: Its story: every value it had, who changed it, and when.', says: [['d.storyOk', 'true', 'every value']] },
  { id: 'choice', hold: 3.6 },
  { id: 'b6', text: 'F: Can the ERP print a report like this? | M: Yes. Open it here, change a figure, and the page names the totals that no longer agree.', says: [['d.erpReportReady', 'true', 'print a report'], ['d.erpPdfOnePage', 'true', 'print a report'], ['d.erpAddsUp', 'true', 'open it here'], ['d.erpEditNames', 'true', 'names the totals']] },
  { id: 'b6u', text: 'M: Undo, and it adds up again.', says: [['d.erpUndoAdds', 'true', 'adds up again']] },
  { id: 'b7a', text: 'M: File an invoice for ' + words(d.invoiceDollars) + ' dollars ' + words(d.invoiceCents) + '. It is saved as a draft, and nothing is posted yet.', says: [['d.filedDraft', 'true', 'draft'], ['d.sentNoDocAction', 'true', 'nothing is posted'], ['d.invoiceDollars', String(d.invoiceDollars), words(d.invoiceDollars)], ['d.invoiceCents', String(d.invoiceCents), words(d.invoiceCents)]] },
  { id: 'b7b', text: 'M: Open it in the ERP. A person presses Complete, and then the entries are made. Debit equals credit.', says: [['d.erpDraft', 'true', 'open it in the erp'], ['d.completed', 'true', 'presses complete'], ['d.refreshPosted', 'true', 'entries are made'], ['d.erpOnce', 'true', 'open it in the erp'], ['d.postedBalanced', 'true', 'debit equals credit']] },
  { id: 'b8', text: 'M: The same page, on an emulated phone. A file of ' + words(d.longPages) + ' pages shows page one in ' + secs(d.longFirstMs) + ' seconds. The page is ' + words(Math.round(d.firstVisitBytes / 1000)) + ' kilobytes, and it works with the network switched off.', says: [['d.firstVisitBytes', String(d.firstVisitBytes), words(Math.round(d.firstVisitBytes / 1000))], ['d.offlineOk', 'true', 'network switched off'], ['d.phoneTapOk', 'true', 'emulated phone'], ['d.longPages', String(d.longPages), words(d.longPages)], ['d.longFirstMs', String(d.longFirstMs), secs(d.longFirstMs)], ['d.longOk', 'true', 'page one']] },
  { id: 'close', text: 'M: ERP is now a utility, no longer a luxury. It is granted free.', says: [] },   // the owner's line, verbatim
  { id: 'prior', hold: 5.5 }   // the final silent "Prior art / credentials" card; its lines come from out/credits.json (credits.js)
];
exports.lang = 'en';
