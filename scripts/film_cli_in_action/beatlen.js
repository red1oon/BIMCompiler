// ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): a beat lasts as long as its voice needs (out/beatmin.json) AND long enough to type its line and then hold the answer
// with the changed ERP window for HOLD seconds, whichever is longer. Writes out/beatlen.json for record.js. READ THE LOG.
'use strict';
const fs = require('fs'), min = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), plan = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), HOLD = 3.0, o = {};
Object.keys(plan).forEach(id => { const typing = plan[id].reduce((s, x) => s + (x.frames || 0), 0) / 24, voice = min[id] || 0, len = +Math.max(voice, typing ? typing + HOLD : 0).toFixed(2); if (len) o[id] = len;
  console.log('§BEATLEN beat=' + id + ' voice=' + voice + ' typing=' + typing.toFixed(2) + ' -> ' + (len || 'hold from narr.js') + (typing && typing + HOLD > voice ? ' (set by the typing + ' + HOLD + ' s hold)' : '')); });
fs.writeFileSync(process.argv[4], JSON.stringify(o, null, 1)); console.log('§BEATLEN_DONE beats=' + Object.keys(o).length + ' total=' + Object.keys(o).reduce((a, k) => a + o[k], 0).toFixed(1) + 's');
