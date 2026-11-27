// ⚠ DO NOT REMOVE — film "Command Line ERP" (prompts/FILM_COMMAND_LINE_ERP.md): G every fact a beat speaks is in out/facts.json with the stated value and its spoken word is in the beat's text;
// H honesty: the words mail/phone/device appear only in beat `onedoor`, and that beat says "not built"; no proof talk. INCONCLUSIVE when nothing was judged. READ THE LOG.
'use strict';
const F = require('./out/facts.json'), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
const proof = /witness|falsif|parity|verified|proven|first ever|novel/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id);
console.log('§GUARD proof-talk or "first/novel" in the voice: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const sensitive = /mail|phone|device|robot|e-?mail|mobile/i, where = N.beats.filter(b => b.text && sensitive.test(b.text)).map(b => b.id), od = N.beats.filter(b => b.id === 'onedoor')[0];
const honest = where.every(id => id === 'onedoor') && !!od && /not built/i.test(od.text) && F.onedoor.planned.length === 3 && F.onedoor.built.join() === 'AI,Person';
console.log('§GUARD honesty H: mail/phone/device named in ' + (where.join(',') || 'no beat') + '; onedoor says "not built": ' + (!!od && /not built/i.test(od.text)) + '; figure says planned=' + F.onedoor.planned.join('/') + ' built=' + F.onedoor.built.join('/')); if (!honest) bad++;
const priv = /jelapang/i; if (JSON.stringify(F).match(priv) || N.beats.some(b => b.text && priv.test(b.text))) { bad++; console.log('§GUARD private name found'); }
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
