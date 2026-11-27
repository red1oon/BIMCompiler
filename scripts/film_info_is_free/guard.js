// ⚠ DO NOT REMOVE — film "Information is Free" (prompts/FILM_INFORMATION_IS_FREE.md §4, CH 0): G guard (every spoken figure is in out/facts.json with that value, and its word is in the beat's text; no digit is spoken),
// C claim guard (the "no other project is more open" idea is said only as the owner's claim; no superlative is said as a fact), M mantra guard (the rendered mantra card's text equals the spec §1 lines BYTE FOR BYTE),
// R credits guard (every item spec §3 lists is on the credits card). Runs AFTER cards.js (it reads out/cards/mantra_dom.json and card_text.json). READ out/guard.log. INCONCLUSIVE when nothing was judged.
'use strict';
const fs = require('fs'), path = require('path'), OD = process.env.OUTD || 'out';
const F = require('./' + OD + '/facts.json'), N = require('./narr.js'), M = require('./mantra.js').parse(), dom = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'cards/mantra_dom.json'), 'utf8')), texts = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'cards/card_text.json'), 'utf8')); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
const digits = N.beats.filter(b => b.text && /\d/.test(b.text)).map(b => b.id); console.log('§GUARD digits in the voice text (numbers are spelled in words): ' + (digits.join(',') || 'none')); if (digits.length) bad++;
const noLatin = N.beats.filter(b => b.text && !/[a-z]/i.test(b.text)).map(b => b.id); console.log('§GUARD beats with no Latin character: ' + (noLatin.join(',') || 'none')); if (noLatin.length) bad++;
const sup = /most open|more open than|the most|\bbest\b|number one|only project|nobody else|no one else|\bunique\b|\bthe first\b|first ever|\bnovel\b|witness|falsif|parity|verified|proven|guarantee/i, hit = N.beats.filter(b => b.text && sup.test(b.text)).map(b => b.id);
console.log('§GUARD superlative / proof talk said as a fact: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const claim = (N.beats.find(b => b.id === 'prompts') || {}).text || '', okc = /we know of no other project that gives out more/i.test(claim); n++; console.log('§GUARD claim worded as a claim ("We know of no other project that gives out more"): ' + (okc ? 'OK' : 'FAIL')); if (!okc) bad++;
if (/jelapang/i.test(JSON.stringify(F) + N.beats.map(b => b.text || '').join(' '))) { bad++; console.log('§GUARD private name found'); }
// M: byte for byte, both textContent and innerText of the rendered lines
n++; const same = dom.length === M.length && M.every((l, i) => dom[i].text === l && dom[i].inner === l); if (!same) bad++;
console.log('§GUARD_MANTRA ' + (same ? 'OK' : 'FAIL') + ' spec_lines=' + M.length + ' rendered_lines=' + dom.length + ' byte_equal=' + M.map((l, i) => (dom[i] ? dom[i].text === l && dom[i].inner === l : false)).join('/') + ' bytes=' + M.map(l => Buffer.byteLength(l)).join('/') + ' | ' + JSON.stringify(M));
// R: credits (spec §3) and the cover
const need = ['Redhuan D. Oon', 'red1org@gmail.com', 'MIT License', 'github.com/red1oon/BIMCompiler', 'github.com/red1oon/bim-ootb', 'red1oon.github.io/BIMCompiler', 'eklee', 'CC BY 3.0', 'Kokoro'], miss = need.filter(s => (texts.credits || '').indexOf(s) < 0); n++;
console.log('§GUARD_CREDITS ' + (miss.length ? 'FAIL missing=' + miss.join(',') : 'OK all ' + need.length + ' items on the card')); if (miss.length) bad++;
const cov = ['CH 0', 'Information is Free', 'You have to Know'].filter(s => (texts.cover || '').indexOf(s) < 0); n++; console.log('§GUARD_COVER ' + (cov.length ? 'FAIL missing=' + cov.join(',') : 'OK')); if (cov.length) bad++;
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' judged=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
