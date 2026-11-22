// ⚠ DO NOT REMOVE — film 5 "CH 0 · One list writes every page" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 5), ENGLISH ONLY: the beats, their narration (F asks, M answers, short: the picture explains) and the facts each beat speaks.
// The figures in the words are built from out/facts.json (never typed here); each `says` entry is [fact key, the value, the words the voice uses] and guard.js resolves every key INDEPENDENTLY from the raw logs (out/cmd_*.log, out/file_*.txt) and FAILS the build if one is not as stated. READ out/guard.log.
// `defines` / `uses` name the terms (guard check D: a term is used only after the beat that defines it, and defined once). `step` = the progress strip's lit step (1 The miss, 2 One list, 3 The refusal, 4 What stayed, 5 The proof).
'use strict';
const fs = require('fs'), path = require('path');
let F = null; try { F = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.json'), 'utf8')); } catch (e) { /* guard fails when facts.json is missing */ }
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const W = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + W(n % 100) : '');
  return W(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + W(n % 1000) : ''); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const f = F || { b1: { commit: {} }, b2: {}, b3: {}, b4: {}, b5: { old: {} }, change: {} };
const claims = f.b5.claims ? f.b5.claims.split('/')[0] : '0', reds = f.b5.red ? f.b5.red.split('/')[0] : '0';
const EN = [
  { id: 'cover', hold: 4.2, step: 0 },
  { id: 'b1', step: 1, defines: ['version number'], uses: [], text: 'F: Two pages load the same file. Why two numbers? | M: Each page names the file with a version number. In November the file changed. The viewer page asked for the new copy. The landing page kept asking for the old one, and nothing said so.',
    says: [['b1.same_file', 'Y', 'Two pages load the same file'], ['b1.numbers_differ', 'Y', 'Why two numbers'], ['b1.changed_in_november', 'Y', 'In November the file changed'], ['b1.viewer_new', 'Y', 'The viewer page asked for the new copy'], ['b1.landing_old', 'Y', 'The landing page kept asking for the old one'], ['b1.nothing_said', 'PASS', 'and nothing said so']] },
  { id: 'b2', step: 2, defines: ['list', 'bump'], uses: ['version number'], text: 'F: And now? | M: The viewer keeps one list of its files, each with its number. The landing page is written from that list. The bump tool, which raises a number, changes it there. The viewer\'s cache, which its service worker keeps, is left alone: that worker does not serve this page.',
    says: [['b2.list_has_number', 'Y', 'one list of its files, each with its number'], ['b2.page_from_list', 'Y', 'The landing page is written from that list'], ['b2.bump_in_list', '7->8', 'changes it there'], ['b2.cache_alone', '0', 'is left alone'], ['b2.no_sw_for_page', 'Y', 'that worker does not serve this page']] },
  { id: 'b3', step: 3, defines: ['check'], uses: ['list'], text: 'F: What if I just edit the number? | M: The check, which compares each page with its list, refuses. It names the file, the line, and the command that fixes it.',
    says: [['b3.refuses', 'FAIL', 'refuses'], ['b3.names_file_line', 'index.html:187', 'It names the file, the line'], ['b3.names_command', 'node scripts/gen_manifest.js --write viewer', 'the command that fixes it']] },
  { id: 'b4', step: 4, defines: ['markers'], uses: ['list'], text: 'F: How much of the page changed? | M: ' + cap(W(f.b4.insertions || 0)) + ' comment lines across ' + W(f.b4.files || 0) + ' pages: the markers that fence what the list writes. The analytics tag between them keeps its own settings.',
    says: [['b4.insertions', String(f.b4.insertions), W(f.b4.insertions || 0) + ' comment lines'], ['b4.files', String(f.b4.files), W(f.b4.files || 0) + ' pages'], ['b4.all_markers', 'Y', 'the markers that fence what the list writes'], ['b4.tag_same', 'Y', 'The analytics tag between them keeps its own settings']] },
  { id: 'b5', step: 5, defines: ['witness'], uses: ['check'], text: 'F: How do we know it holds? | M: The witness, a test script, has ' + W(f.b5.old.of || 4) + ' new checks. Each was run on the old code: ' + W(f.b5.old.failed || 0) + ' failed there, as they should. The fourth cannot fail on old code, so a planted fault proves it can. On the new code, ' + W(+claims) + ' of ' + W(+claims) + ' claims hold, and all ' + W(+reds) + ' planted faults are caught.',
    says: [['b5.new_checks', '4', W(f.b5.old.of || 4) + ' new checks'], ['b5.old_failed', '3', W(f.b5.old.failed || 0) + ' failed there'], ['b5.fourth_cannot_fail_old', 'Y', 'The fourth cannot fail on old code'], ['b5.planted_proves', 'Y', 'a planted fault proves it can'], ['b5.claims', f.b5.claims || '', W(+claims) + ' of ' + W(+claims) + ' claims hold'], ['b5.red', f.b5.red || '', 'all ' + W(+reds) + ' planted faults are caught']] },
  { id: 'close', hold: 17, step: 6 }
];
exports.lang = 'en'; exports.beats = EN; exports.W = W;
