// ⚠ DO NOT REMOVE — Scope: TEXT WITNESS of Film 2 v2 (under-the-hood cut) over EVERYTHING the viewer reads or hears: card text (read back from the page at the end of every card, code panels apart),
// the narration TSV and the burned captions (.ass). Film 1 content is banned (pos, point of sale, unicenta, cashier, replenish*, loyalty, return(s), micro finance, borrower, gold, ticket(s), sale(s)); the earlier dropped words stay banned
// (hiatus, fork, retired, entirely, unsolved, Flexible Sync). The single allowed mention of Film 1 is the closing pointer ('first film'); its places are listed. Controls: a planted word must be caught.
// usage: node film4_words.js <passDir> <narration.tsv> <captions.ass>
'use strict';
const fs = require('fs'), path = require('path');
const [dir, TSV, ASS] = process.argv.slice(2);
const audits = JSON.parse(fs.readFileSync(path.join(dir, 'cards_audit.json'), 'utf8')), log = fs.readFileSync(path.join(dir, 'film.log'), 'utf8');
const T = [];
audits.forEach(A => T.push({ where: 'card ' + A.id, text: A.audit.textNoCode }));
log.split('\n').forEach(l => { const m = /§FILM_NOTE part=(\d+) beat=(\S+) card=(\S+) src="([^"]*)" text="(.*)"$/.exec(l); if (m) { T.push({ where: `note ${m[2]}/${m[3]}`, text: m[5] }); T.push({ where: `note-source ${m[2]}`, text: m[4] }); } });
fs.readFileSync(TSV, 'utf8').split('\n').filter(Boolean).forEach(l => { const c = l.split('\t'); T.push({ where: 'narration ' + c[0], text: c[5] }); T.push({ where: 'narration-source ' + c[0], text: c[3] }); });
fs.readFileSync(ASS, 'utf8').split('\n').filter(l => /^Dialogue:/.test(l)).forEach((l, i) => T.push({ where: 'caption ' + (i + 1), text: l.split(',').slice(9).join(',') }));
const FILM1 = [[/\bpos\b/i, 'pos'], [/\bpoint[ -]of[ -]sale\b/i, 'point of sale'], [/unicenta/i, 'unicenta'], [/\bcashiers?\b/i, 'cashier'], [/\breplenish\w*/i, 'replenish'], [/\bloyalty\b/i, 'loyalty'], [/\breturns?\b/i, 'return(s)'], [/micro[ -]?finance/i, 'micro finance'], [/\bborrowers?\b/i, 'borrower'], [/\bgold\b/i, 'gold'], [/\btickets?\b/i, 'ticket(s)'], [/\bsales?\b/i, 'sale(s)']];
const OLD = [[/hiatus/i, 'hiatus'], [/fork/i, 'fork'], [/\bretired\b/i, 'retired'], [/unsolved/i, 'unsolved'], [/entirely/i, 'entirely'], [/flexible sync/i, 'Flexible Sync']];
let hits = 0; const per = {};
FILM1.concat(OLD).forEach(([re, nm]) => { const h = T.filter(t => re.test(t.text)); per[nm] = h.length; if (h.length) { hits += h.length; console.log(`§WORDS_HIT ${nm} in ${h.map(x => x.where).join(', ')}`); } });
const ptr = T.filter(t => /first film/i.test(t.text)).map(t => t.where), ptrOk = ptr.length >= 1 && ptr.every(w => /^(card limits|narration limits|caption )/.test(w));
console.log(`§WORDS_POINTER the only mention of Film 1 ('first film') is at: ${ptr.join(', ')} ${ptrOk ? 'OK' : 'WRONG'}`);
console.log(`§WORDS_PATTERNS ${Object.keys(per).map(k => k + '=' + per[k]).join(' ')}`);
const substr = {}; T.forEach(t => FILM1.forEach(([re, nm]) => { if (!re.test(t.text)) { const m = t.text.match(new RegExp(re.source.replace(/\\b/g, ''), 'ig')); if (m) (substr[nm] = substr[nm] || new Set()).add(t.where.split(' ')[0] + ':' + [...new Set(m.map(x => x.toLowerCase()))].join('/')); } }));
console.log('§WORDS_SUBSTRING (information only: letters inside longer words or identifiers, not whole words) ' + JSON.stringify(Object.fromEntries(Object.keys(substr).map(k => [k, [...substr[k]]]))));
const codeHits = audits.filter(A => A.audit.codeText).map(A => A.id + ':' + (FILM1.concat(OLD).filter(([re]) => re.test(A.audit.codeText)).map(x => x[1]).join(',') || 'none')); console.log('§WORDS_CODE_PANELS iDempiere source text scanned apart (a Java keyword is not a goods return): ' + codeHits.join(' '));
const ctrl = FILM1.every(([re]) => !re.test('a neutral sentence')) && /sales?/i.test('planted sale'), c2 = [[/\bsales?\b/i]].every(([re]) => re.test('planted sale') && !re.test('QtyLostSales'));
console.log(`§WORDS_CONTROL a planted word is caught: ${ctrl} (whole-word matching: the identifier QtyLostSales is not a hit: ${c2})`);
console.log(`§WORDS_CHECK scanned=${T.length} texts (card text without code panels, narration and its source labels, captions) forbidden_hits=${hits} ${hits || !ptrOk || !ctrl ? 'FAIL' : 'PASS'}`);
if (hits || !ptrOk || !ctrl) process.exit(2);
