// ⚠ DO NOT REMOVE — Scope: the recorder's gate. `node film6_guard.js <trace.json>` exits 0 only for a trace that is status "REAL", has no event with wit "DRAFT", and every header.sources entry has a sha256. A DRAFT trace is REFUSED (exit 4) so that it can never reach the published film.
// The future recorder (film6_record.js) must call assertReal() before it opens the first frame. READ THE LOG: §GUARD_* lines.
'use strict';
const fs = require('fs');
function assertReal(file) {
  const t = JSON.parse(fs.readFileSync(file, 'utf8')), why = [];
  if (!t.header || t.header.status !== 'REAL') why.push('header.status is ' + (t.header && t.header.status) + ', not REAL');
  const d = (t.events || []).filter(e => e.wit === 'DRAFT').length; if (d) why.push(d + ' event(s) carry wit=DRAFT');
  if (!(t.events || []).length) why.push('no events (nothing to judge: INCONCLUSIVE)');
  ((t.header && t.header.sources) || []).forEach(s => { if (!s.sha256) why.push('source without sha256: ' + s.witness); });
  return why;
}
if (require.main === module) { const f = process.argv[2]; const why = assertReal(f); if (why.length) { console.log('§GUARD_REFUSED ' + f + ' :: ' + why.join(' | ')); process.exit(4); } console.log('§GUARD_OK ' + f); }
module.exports = { assertReal };
