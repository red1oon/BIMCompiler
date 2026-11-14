// ⚠ DO NOT REMOVE — film "Model in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 1): G guard (every spoken figure is in out/facts.json with that value, and its word is in the beat's text), no proof talk,
// N not-said (the voice never suggests the two frames are linked live, and names nothing that is not built; no client name). READ out/guard.log. INCONCLUSIVE when nothing was judged.
'use strict';
const F = require('./' + (process.env.OUTD || 'out') + '/facts.json'), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
const proof = /witness|falsif|parity|verified|proven|first ever|\bnovel\b|\bunique\b|\bthe first\b|nobody else|no one else/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id);
console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const notSaid = /\blive\b|real[- ]time|updates itself|\bsync|instantly|sign[- ]?in|log ?in|master|workflow|legacy server|browser|puppeteer|headless/i, nb = N.beats.filter(b => b.text && notSaid.test(b.text)).map(b => b.id);
console.log('§GUARD not-said N (a live link, or a thing not built), named in the voice: ' + (nb.join(',') || 'none')); if (nb.length) bad++;
const pk = F.checks || {}, d = pk.D || {}; console.log('§GUARD pane P (from facts.js): answers agree=' + Object.values(pk.C || {}).every(Boolean) + ' canvas moved open ' + (d.open && d.open.pct) + '% convert ' + (d.convert && d.convert.pct) + '% bay ' + (d.bay && d.bay.pct) + '% undo-vs-convert ' + (d.undo_vs_convert && d.undo_vs_convert.pct) + '%, page errors ' + pk.pageErrors);
if (!Object.values(pk.C || {}).length || !Object.values(pk.C).every(Boolean) || pk.pageErrors) bad++;
if (/sysnova|kazi|jelapang|farms?\b.*client/i.test(JSON.stringify(F) + N.beats.map(b => b.text || '').join(' '))) { bad++; console.log('§GUARD a private name was found'); }
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
