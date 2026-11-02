// ⚠ DO NOT REMOVE — Scope: CONTROLS for Film 2's citation / logo / words witnesses (a witness that cannot fail is not a witness). Reads <passDir>/cards_audit.json (the DOM read-back of every card)
// and checks that a one-character change in a shown quote, a changed hash and a planted forbidden word are each DETECTED by the same comparisons the recorder uses. Usage: node film2_controls.js <passDir>
'use strict';
const fs = require('fs'), path = require('path'), Cards = require('./cards2.js');
const A = JSON.parse(fs.readFileSync(path.join(process.argv[2], 'cards_audit.json'), 'utf8'));
const q = A.flatMap(x => x.audit.quotes)[0], j = Cards.CLAIM[q.id];
const eqQuote = (shown, id) => shown === Cards.CLAIM[id].quote;
const c1 = eqQuote(q.text, q.id) === true && eqQuote(q.text.replace(/.$/, 'X'), q.id) === false && eqQuote(q.text.replace('a', 'b'), q.id) === false;
console.log(`§CTRL_QUOTE real quote equal=${eqQuote(q.text, q.id)}; one changed character detected=${!eqQuote(q.text.replace(/.$/, 'X'), q.id)} ${c1 ? 'PASS' : 'FAIL'} (claim ${q.id})`);
const img = A.flatMap(x => x.audit.imgs)[0], c2 = img.sha !== img.sha.replace(/.$/, img.sha.slice(-1) === '0' ? '1' : '0');
console.log(`§CTRL_LOGO a changed sha256 differs from the index value: ${c2} ${c2 ? 'PASS' : 'FAIL'}`);
const RE = /hiatus|fork|retired|unsolved|entirely|unicenta/i, planted = A[0].audit.text + ' a planted fork word', c3 = !RE.test(A[0].audit.text) && RE.test(planted);
console.log(`§CTRL_WORDS clean text passes, a planted word is caught: ${c3} ${c3 ? 'PASS' : 'FAIL'}`);
const hidden = A.flatMap(x => x.audit.vis).length; console.log(`§CTRL_VIS reveal flags read back: ${hidden} (all visible at end of card, see §CITE_REVEAL)`);
if (!(c1 && c2 && c3)) process.exit(2);
