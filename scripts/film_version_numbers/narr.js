// ⚠ DO NOT REMOVE — film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6), ENGLISH ONLY: the beats, their narration (F asks, M answers, short: the picture explains) and the facts each beat speaks.
// The figures in the words are built from out/facts.json (never typed here); each `says` entry is [fact key, the value, the words the voice uses] and guard.js resolves every key INDEPENDENTLY from the raw logs (out/cmd_*.log, out/shoot.log) and FAILS the build if one is not as stated. READ out/guard.log.
// `defines` / `uses` name the terms (guard check D: a term is used only after the beat that defines it, and defined once). `step` = the progress strip's lit step (1 The chore, 2 The harm, 3 One press, 4 The code, 5 Why ours).
// CH 1 is the owner's own experience in his own words (2026-11-22: "every change that was deployed meant changing ?v= by hand, each time, in many pages").
'use strict';
const fs = require('fs'), path = require('path');
let F = null; try { F = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.json'), 'utf8')); } catch (e) { /* guard fails when facts.json is missing */ }
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const W = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + W(n % 100) : '');
  return W(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + W(n % 1000) : ''); };
const f = F || { s1: {}, s4: {}, press: {}, b5: {} };
// PROMO (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6 PROMO SPEC): five short beats, VS Code fills the frame. `step` = the strip's lit step (1 Read = run, 2 The editor knows, 3 Refused, 4 Proven); the cover and the last card carry no strip.
// Never said: "press, reload, fixed" (measured: after the press the app OFFERS the update; the new words show after that refresh), "automatically", any claim about AI.
const EN = [
  { id: 'cover', step: 0, defines: [], uses: [], text: 'F: What makes this code different? | M: Open it in VS Code, and see.', says: [] },
  { id: 's1', step: 1, defines: [], uses: [], text: 'F: Is there a build step? | M: There is no bundler. The browser gets this file with only the whitespace stripped, and every global name as you read it.',
    says: [['s1.no_bundler', 'Y', 'There is no bundler'], ['s1.globals', 'Y', 'every global name as you read it']] },
  { id: 's2', step: 2, defines: [], uses: [], text: 'F: And the editor? | M: Hover a name: where it is written, who reads it. Hover a tag: which code prints it. It only reads, and it needs no network.',
    says: [['s2.hover_name', 'Y', 'where it is written, who reads it'], ['s2.hover_tag', 'Y', 'which code prints it'], ['s2.no_network', 'Y', 'it needs no network']] },
  { id: 's3', step: 3, defines: ['bump'], uses: [], text: 'F: What if I change a file? | M: The editor warns you. Press Bump, and every page that loads the file is updated. Then the app offers the update, and the new words show.',
    says: [['s3.warn', 'Y', 'The editor warns you'], ['press.pages_all', 'Y', 'every page that loads the file is updated'], ['harm.toast', 'Y', 'the app offers the update'], ['harm.new_after_press', 'Y', 'the new words show']] },
  { id: 's4', step: 4, defines: ['check'], uses: [], text: 'F: And how do we know it holds? | M: Each new check was run on the old code, before the change. All ' + W(f.s4.oldFailed || 0) + ' failed there. On the new code, ' + W(+(f.s4.claims || '0/0').split('/')[0]) + ' of ' + W(+(f.s4.claims || '0/0').split('/')[1]) + ' claims hold.',
    says: [['s4.old_failed', String(f.s4.oldFailed), 'All ' + W(f.s4.oldFailed || 0) + ' failed there'], ['s4.claims', f.s4.claims || '', W(+(f.s4.claims || '0/0').split('/')[0]) + ' of ' + W(+(f.s4.claims || '0/0').split('/')[1]) + ' claims hold']] },
  { id: 'close', hold: 12, step: 5 }
];
exports.lang = 'en'; exports.beats = EN; exports.W = W;
