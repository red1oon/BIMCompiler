// ⚠ DO NOT REMOVE — film "CH 0 · Immersive Software" (prompts/FILM_IMMERSIVE_SOFTWARE.md), ENGLISH ONLY: the beats, their narration (F asks, M answers, short: the picture explains) and the facts each
// beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json and out/shots.log and FAILS the build if one is not as stated.
// Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.2 },
  { id: 'setup', text: 'F: How do I turn it on? | M: One command builds the index: twenty-eight stamps, each one line of code. One bookmark loads the tool into this tab. The shipped Modeller never loads it.',
    says: [['index.keys', '28', 'twenty-eight'], ['page.installed_keys', '28', 'twenty-eight']] },
  { id: 'move1', text: 'F: This truss bar. Who made it? | M: Hover it. Section, line eighty-nine, assumed. The truss was drawn once, at cut A A, and copied to thirteen stations. Press V, and the editor opens on that line.',
    says: [['bar.line', '89', 'line eighty-nine'], ['bar.prov', 'assumed', 'assumed'], ['truss.stations', '13', 'thirteen stations'], ['bar.v_link_matches', 'Y', 'Press V, and the editor opens on that line']] },
  { id: 'move2', text: 'F: And a body nobody stamped? | M: The tool\'s own test failed on one: a wall joined from two pieces after the trace had looked. Five hundred and twelve bodies, five hundred and eleven on screen. Now it names its line, seven hundred and sixteen.',
    says: [['wall.first_run_failed', 'Y', 'the tool\'s own test failed on one'], ['wall.old_unstamped', 'Y', 'a body nobody stamped'], ['bodies', '512', 'five hundred and twelve'], ['inserts', '511', 'five hundred and eleven'], ['wall.line', '716', 'seven hundred and sixteen']] },
  { id: 'close', hold: 18 }
];
exports.lang = 'en';
exports.beats = EN;
