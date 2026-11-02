// ⚠ DO NOT REMOVE — Scope: the guard of "What a server stands for, and what a database stands for" (TEAMWORK_FRAMEWORK.md §53). This film has NO FIGURES by design, so the
// number guard inverts: any digit on a card or in the voice is a FAIL (only the project contacts may carry one). The build REFUSES unless:
//   G1 every one of the nine DB jobs the film names is a row of docs/DistributedERP.md "What a database stands for" (traceability, not memory)
//   G2 no digit on any card (all steps shown)   G3 no digit in the narration, and >0 narrated beats (else INCONCLUSIVE, never PASS)
//   G4 every term of art that is spoken appears on a card (defined on screen at first use, owner: academic register)
//   C1 CONTROL: a card with a planted number is caught · C2 CONTROL: narration with a planted number is caught (a guard that cannot fail is not a guard)
// READ THE LOG: node guard.js > out/guard.log
'use strict';
const fs = require('fs'), path = require('path'); const say = s => console.log(s); let fail = 0;
const N = require('./narr.js'), Cards = require('./cards.js');
const doc = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'DistributedERP.md'), 'utf8'), tbl = doc.slice(doc.indexOf('### What a database stands for'));
const JOBS = ['Concurrency control', 'Replication', 'Durability', 'Atomicity', 'Integrity', 'Querying and indexing', 'Access control', 'Audit and history', 'A single place to ask'];
const miss = JOBS.filter(j => !new RegExp('\\| \\*\\*' + j.replace(/ and /, '.*') , 'i').test(tbl));
say('§GUARD G1 ' + (miss.length ? 'FAIL jobs not in the doc table: ' + miss.join(', ') : 'PASS all ' + JOBS.length + ' jobs are rows of docs/DistributedERP.md')); if (miss.length) fail++;
const C = Cards.build(), LIT = /red1oon|red1org@gmail\.com/g;
const textOf = h => h.replace(/style="[^"]*"/g, '').replace(/data-s="\d+"/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
const digits = t => (t.replace(LIT, '').match(/\d+/g) || []);
const cardBad = C0 => Object.keys(C0).reduce((a, k) => a.concat(digits(textOf(C0[k].html)).map(x => k + ':' + x)), []);
const bc = cardBad(C); say('§GUARD G2 ' + (bc.length ? 'FAIL ' + JSON.stringify(bc) : 'PASS') + ' cards_scanned=' + Object.keys(C).length + ' digits_found=' + bc.length); if (bc.length) fail++;
const nb = N.beats.filter(b => b.text), narrBad = bs => bs.reduce((a, b) => a.concat(b.text ? digits(b.text).map(x => b.id + ':' + x) : []), []), bn = narrBad(N.beats);
say('§GUARD G3 ' + (!nb.length ? 'INCONCLUSIVE no narrated beats' : bn.length ? 'FAIL ' + JSON.stringify(bn) : 'PASS') + ' narrated_beats=' + nb.length + ' digits_spoken=' + bn.length); if (!nb.length || bn.length) fail++;
const allCards = Object.keys(C).map(k => textOf(C[k].html)).join(' ').toLowerCase(), spoken = nb.map(b => b.text).join(' ').toLowerCase();
const TERMS = ['fold', 'append-only', 'deterministic', 'hash', 'owner-gate', 'compare-and-set', 'idempotent', 'signature', 'catalogue'], used = TERMS.filter(t => spoken.includes(t === 'owner-gate' ? 'single permitted writer' : t)), undef = TERMS.filter(t => used.includes(t) && !allCards.includes(t) && !(t === 'catalogue' && allCards.includes('catalogue')));
say('§GUARD G4 ' + (undef.length ? 'FAIL spoken but not on any card: ' + undef.join(', ') : 'PASS') + ' terms_spoken=' + used.length + '/' + TERMS.length); if (undef.length) fail++;
const C1 = JSON.parse(JSON.stringify(C)); C1.job1.html = C1.job1.html.replace('</div></div>', '<span>777</span></div></div>');
if (C1.job1.html === C.job1.html) { say('§GUARD C1 VACUOUS the plant did not apply'); fail++; } const c1 = cardBad(C1);
say('§GUARD C1 ' + (c1.some(x => /777/.test(x)) ? 'PASS caught ' + c1.join(',') : 'FAIL the planted card number was not caught')); if (!c1.some(x => /777/.test(x))) fail++;
const B2 = N.beats.map(b => ({ ...b, text: b.id === 'b06' ? b.text + ' 42' : b.text })), c2 = narrBad(B2);
say('§GUARD C2 ' + (c2.length ? 'PASS caught ' + c2.join(',') : 'FAIL the planted spoken number was not caught')); if (!c2.length) fail++;
say('§GUARD_VERDICT ' + (fail ? 'FAIL fails=' + fail : 'PASS (no-figure film: 0 digits allowed, 2 controls)'));
process.exit(fail ? 1 : 0);
