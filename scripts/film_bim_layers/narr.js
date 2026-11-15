// ⚠ DO NOT REMOVE — film 3 "CH 0 · Immersive Software: a body's history" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 3), ENGLISH ONLY: the beats, their narration (F asks, M answers, short: the picture
// explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json and out/shots.log and FAILS the build
// if one is not as stated. Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.2 },
  { id: 'setup', text: 'F: How do I turn it on? | M: One command builds the index: twenty-eight code stamps and ninety-nine default rows. One bookmark loads the tool into this tab. The shipped Modeller never loads it.',
    says: [['index.keys', '28', 'twenty-eight code stamps'], ['index.defaults', '99', 'ninety-nine default rows'], ['page.installed_keys', '28', 'loads the tool']] },
  { id: 'move1', text: 'F: Why is this column this tall? | M: Hover it. Six layers, in the order they happened. Its top, three point one metres, is a default: column top under beam. Press three, and the editor opens that row, the one a user can change.',
    says: [['col.layers', '6', 'Six layers'], ['col.top_m', '3.1', 'three point one metres'], ['col.top_source', 'default', 'is a default'], ['col.default_key', 'column.top_under_beam', 'column top under beam'], ['col.key3_opens_row', 'Y', 'Press three, and the editor opens that row']] },
  { id: 'move2', text: 'F: Where did the holes in this wall come from? | M: Layer four. Two cuts, door gaps, each holding its door. The wall was joined from two drawn pieces, and layer one still names the line that joined them.',
    says: [['wall.cuts', '2', 'Two cuts'], ['wall.door_gaps', '2', 'door gaps'], ['wall.holds', '2', 'each holding its door'], ['wall.joined', 'Y', 'joined from two drawn pieces'], ['wall.key1_opens_builder', 'Y', 'layer one still names the line']] },
  { id: 'move3', text: 'F: And what it does not know? | M: This truss bar\'s width is a default, but the body does not record which one. The tool says so, and opens nothing. Across the shed, a hundred and ten such sizes. Only twelve name their default.',
    says: [['bar.width_default_unrecorded', 'Y', 'does not record which one'], ['bar.key3_opens_nothing', 'Y', 'opens nothing'], ['witness.not_recorded', '110', 'a hundred and ten'], ['witness.linked', '12', 'Only twelve']] },
  { id: 'close', hold: 18 }
];
exports.lang = 'en';
exports.beats = EN;
