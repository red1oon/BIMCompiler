// ⚠ DO NOT REMOVE — film "One line" (§24): every fact a beat speaks must be in out/facts.json with the stated value, and its spoken word must be in that beat's text. READ THE LOG.
'use strict';
const F = require('./out/facts.json'), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expects ' + JSON.stringify(want) + ' spoken "' + word + '"'); }));
const proof = /witness|falsif|parity|verified|proven|first ever|novel/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id);
console.log('§GUARD proof-talk or "first/novel" in the voice: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
