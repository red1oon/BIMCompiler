// ⚠ DO NOT REMOVE — Scope: the number guard of "Think Global, Act Local" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §16; copied from ../film_network_erp/guard.js). The build REFUSES unless:
//   G1 every fact resolved (resolve.js exit 0: 0 missing, 0 unresolved in the storyboard) and every source log is unchanged since resolving (sha256)
//   G2 every number visible on every card (all steps shown) is a fact value; the only typed digit allowed is the network name "4G"
//   G3 every number in the narration is a fact value (same rule)
//   C1 CONTROL: a card with a planted number (777) is caught · C2 CONTROL: narration with a changed number is caught (a guard that cannot fail is not a guard)
// READ THE LOG: node guard.js > out/guard.log
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const say = s => console.log(s); let fail = 0;
const r = cp.spawnSync('node', [path.join(__dirname, 'resolve.js')], { encoding: 'utf8' });
const okR = r.status === 0 && /§FACTS resolved=\d+ missing=0/.test(r.stdout) && /§FACTS-USED storyboard=\d+ unresolved=0/.test(r.stdout);
say('§GUARD G1 ' + (okR ? 'PASS' : 'FAIL') + ' ' + (r.stdout.match(/§FACTS[^\n]*/g) || []).join(' | ')); if (!okR) fail++;
const N = require('./narr.js'), Cards = require('./cards.js'), F = N.F;
// the allowed numbers: every digit run inside any fact value (commas removed)
const allowed = new Set(); Object.keys(F).forEach(k => (String(F[k]).replace(/,/g, '').match(/\d+(\.\d+)?/g) || []).forEach(x => allowed.add(x)));
// typed literals that carry a digit but are not figures: the network name and the project contacts on the end card (owner asked for them)
const LIT = /red1oon/g;
const unthou = t => { let p; do { p = t; t = t.replace(/(\d),(\d{3})/g, '$1$2'); } while (t !== p); return t; };
const nums = t => (unthou(t.replace(LIT, '')).match(/\d+(\.\d+)?/g) || []);
const textOf = h => h.replace(/style="[^"]*"/g, '').replace(/data-s="\d+"/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
function checkCards(C) { const bad = []; Object.keys(C).forEach(k => nums(textOf(C[k].html)).forEach(x => { if (!allowed.has(x)) bad.push(k + ':' + x); })); return bad; }
function checkNarr(beats) { const bad = []; beats.forEach(b => { if (b.text) nums(b.text).forEach(x => { if (!allowed.has(x)) bad.push(b.id + ':' + x); }); }); return bad; }
const C = Cards.build(F), bc = checkCards(C), bn = checkNarr(N.beats);
const cardNums = Object.keys(C).reduce((z, k) => z + nums(textOf(C[k].html)).length, 0), narrNums = N.beats.reduce((z, b) => z + (b.text ? nums(b.text).length : 0), 0);
say('§GUARD G2 ' + (bc.length ? 'FAIL ' + JSON.stringify(bc) : 'PASS') + ' cards=' + Object.keys(C).length + ' numbers_on_cards=' + cardNums); if (bc.length || !cardNums) fail++;
say('§GUARD G3 ' + (bn.length ? 'FAIL ' + JSON.stringify(bn) : 'PASS') + ' narrated_beats=' + N.beats.filter(b => b.text).length + ' numbers_spoken=' + narrNums); if (bn.length || !narrNums) fail++;
// G5 the stills are the captured ones: sha256 of every file in FILM_ASSETS equals assets.sha256 (first 16 hex)
{ const A = process.env.FILM_ASSETS || path.join(require('os').homedir(), 'bim-compiler', 'build', 'film_neuro', 'assets'), bad5 = [];
  fs.readFileSync(path.join(__dirname, 'assets.sha256'), 'utf8').trim().split('\n').forEach(l => { const [h, f] = l.trim().split(/\s+/), p = path.join(A, path.basename(f));
    const g = fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16) : 'MISSING'; if (g !== h) bad5.push(path.basename(f) + ':' + g); });
  say('§GUARD G5 ' + (bad5.length ? 'FAIL ' + bad5.join(',') : 'PASS stills unchanged since capture')); if (bad5.length) fail++; }
const C1 = JSON.parse(JSON.stringify(C)); C1.problem.html = C1.problem.html.replace('</div></div>', '<span>777</span></div></div>');   // language-independent plant (the zh run showed a text-based plant silently not applying)
if (C1.problem.html === C.problem.html) { say('§GUARD C1 VACUOUS the plant did not apply'); fail++; } const c1 = checkCards(C1);
say('§GUARD C1 ' + (c1.some(x => /777/.test(x)) ? 'PASS caught ' + c1.join(',') : 'FAIL the planted card number was not caught')); if (!c1.some(x => /777/.test(x))) fail++;
const B2 = N.beats.map(b => ({ ...b, text: b.id === 'b03' ? b.text.replace(String(F.rep_days), String(Number(F.rep_days) + 1)) : b.text })), c2 = checkNarr(B2);
say('§GUARD C2 ' + (c2.length ? 'PASS caught ' + c2.join(',') : 'FAIL the changed spoken number was not caught')); if (!c2.length) fail++;
// freshness: the resolved sources' sha256, frozen into out/sources.sha after a PASS, re-checked on every later run
const srcs = Array.from(new Set(Object.values(JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')).sources).map(s => s.split(' :: ')[0])));
const sha = srcs.map(f => f + ' ' + crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', '..', f))).digest('hex')).join('\n'), shaF = path.join(__dirname, 'out', 'sources.sha');
fs.mkdirSync(path.dirname(shaF), { recursive: true }); if (fs.existsSync(shaF) && fs.readFileSync(shaF, 'utf8') !== sha) { say('§GUARD FRESH FAIL a source log changed since the last guard PASS (see out/sources.sha) — re-resolve and re-check'); fail++; } else say('§GUARD FRESH PASS sources=' + srcs.length);
if (!fail) fs.writeFileSync(shaF, sha);
say('§GUARD_VERDICT ' + (fail ? 'FAIL fails=' + fail : 'PASS') + ' allowed_numbers=' + allowed.size);
process.exit(fail ? 1 : 0);
