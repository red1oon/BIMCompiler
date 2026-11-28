// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps — ONE PAGE", check INK (rc2; owner on rc1: "from 0:37 the sheet seems blank"). Every still that shows a PDF page must have been taken with the page div data-drawn="1" and its canvas holding ink:
// the share of dark pixels measured IN THE PAGE (getImageData), within 25 % of the share measured for that same page when it was first drawn (facts.js writes one row per still: §FILM_INK still= page= drawn= ink= ref= ok=).
// This check re-judges every row from facts.json with its own rule, runs a CONTROL (a blank canvas must be rejected), and says INCONCLUSIVE when no still was judged. Usage: node check_ink.js [out dir]. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), OD = path.resolve(process.argv[2] || process.env.OUTD || 'out'), F = JSON.parse(fs.readFileSync(path.join(OD, 'facts.json'), 'utf8'));
const TOL = 0.25, MIN = 0.0003, okOf = (r) => r.drawn === true && r.ink > MIN && r.ref > MIN && Math.abs(r.ink - r.ref) <= TOL * r.ref;
let bad = 0; const rows = F.ink || [];
rows.forEach(r => { const ok = okOf(r) && r.ok === true; if (!ok) bad++; console.log('§INK ' + (ok ? 'OK  ' : 'FAIL') + ' still=' + r.still + ' page=' + r.page + ' drawn=' + r.drawn + ' ink=' + r.ink + ' ref=' + r.ref + ' waitedMs=' + r.waitedMs); });
const ctl1 = okOf({ drawn: true, ink: 0, ref: 0.043 }), ctl2 = okOf({ drawn: false, ink: 0.043, ref: 0.043 }), ctl3 = okOf({ drawn: true, ink: 0.043, ref: 0.043 });
const ctlOk = ctl1 === false && ctl2 === false && ctl3 === true; console.log('§INK_CONTROL blank canvas rejected=' + !ctl1 + ' not-drawn rejected=' + !ctl2 + ' good page accepted=' + ctl3 + ' ' + (ctlOk ? '(the check can fail)' : 'FAIL: the check is blind'));
const verdict = rows.length === 0 ? 'INCONCLUSIVE' : (bad || !ctlOk) ? 'FAIL' : 'PASS';
console.log('§INK_VERDICT ' + verdict + ' stills=' + rows.length + ' bad=' + bad + (rows.length === 0 ? ' (no PDF-page still was judged)' : ''));
process.exit(verdict === 'PASS' ? 0 : verdict === 'INCONCLUSIVE' ? 2 : 1);
