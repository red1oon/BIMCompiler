// ⚠ DO NOT REMOVE — film "Fast Script ERP" (prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"; the CH red1 guard, extended): G guard (every spoken figure is in out/facts.json with that value, and its word is in the beat's text),
// no proof talk, N not-said (the voice never says the terminal is linked to a live browser, and claims nothing first/unique), no private name. READ out/guard.log. INCONCLUSIVE when nothing was judged.
'use strict';
const F = require('./' + (process.env.OUTD || 'out') + '/facts.json'), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
// every digit-word in a text must be one a `says` entry covers: a spoken number nobody checked is a defect
const NUMW = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/gi;
N.beats.filter(b => b.text).forEach(b => { const spoken = (b.text.match(NUMW) || []).length, covered = (b.says || []).reduce((a, s) => a + (s[2].match(NUMW) || []).length, 0), free = (b.text.match(/\b(red one|each one|one word|the line it runs|cd order|r e has none|d r to c o)/gi) || []).join(' ').match(NUMW) || []; const ok = spoken <= covered + free.length; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' number words spoken=' + spoken + ' covered by a fact=' + covered + ' idiom=' + free.length); });
const proof = /witness|falsif|parity|verified|proven|\bnovel\b|\bunique\b|\bthe first\b|first ever|nobody else|no one else/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id);
console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const notSaid = /\blive\b|real[- ]time|browser|updates itself|\bsync|instantly|logged in|sign[- ]?in|log ?in|workflow|legacy server/i, nb = N.beats.filter(b => b.text && notSaid.test(b.text)).map(b => b.id);
console.log('§GUARD not-said N (a live link to a browser, or a thing not built), named in the voice: ' + (nb.join(',') || 'none')); if (nb.length) bad++;
const bb = N.beats.filter(b => b.text && /being built/i.test(b.text)).map(b => b.id); console.log('§GUARD next-step talk ("being built", owner-allowed, only on the cost beat): ' + (bb.join(',') || 'none')); if (bb.length > 1 || (bb.length && bb[0] !== 'cost')) bad++;
const vb = N.beats.filter(b => b.text && !/[a-z]/i.test(b.text)); if (vb.length) bad++;
if (/jelapang|jebel|hhs|jkr|ltu/i.test(JSON.stringify(F) + N.beats.map(b => b.text || '').join(' '))) { bad++; console.log('§GUARD private name found'); }
console.log('§GUARD facts verdict in facts.json: bad=' + F.checks.bad + ' missing=' + F.checks.missing); if (F.checks.bad || F.checks.missing) bad++;
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
