// ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): G guard (every spoken figure is in out/facts.json with that value, and its word is in the beat's text), no proof talk,
// N not-said (the voice never suggests the two frames are linked live, and names nothing that is not built). READ out/guard.log. INCONCLUSIVE when nothing was judged.
'use strict';
const F = require('./' + (process.env.OUTD || 'out') + '/facts.json'), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
const proof = /witness|falsif|parity|verified|proven|first ever|\bnovel\b|\bunique\b|\bthe first\b|nobody else|no one else|首创|首个|第一个|独一无二|唯一|没有人|无人|已证实|หนึ่งเดียว|ครั้งแรก|ไม่มีใคร|พิสูจน์แล้ว/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id);
console.log('§GUARD language=' + N.lang + ' beats with no ' + ({ zh: 'CJK', th: 'Thai' }[N.lang] || 'Latin') + ' character: ' + (N.beats.filter(b => b.text && !({ zh: /[\u4e00-\u9fff]/, th: /[\u0e00-\u0e7f]/, en: /[a-z]/i }[N.lang]).test(b.text)).map(b => b.id).join(',') || 'none')); if (N.beats.some(b => b.text && !({ zh: /[\u4e00-\u9fff]/, th: /[\u0e00-\u0e7f]/, en: /[a-z]/i }[N.lang]).test(b.text))) bad++;
console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const notSaid = /\blive\b|real[- ]time|updates itself|\bsync|instantly|sign[- ]?in|log ?in|master|detail tab|workflow|legacy server|实时|同步|即时|自动更新|登录|主表|明细|工作流|旧服务器|เรียลไทม์|ถ่ายทอดสด|ซิงค์|ทันที|ล็อกอิน|มาสเตอร์|เวิร์กโฟลว์|เซิร์ฟเวอร์เดิม/i, nb = N.beats.filter(b => b.text && notSaid.test(b.text.replace(/assets live in/i, 'assets are in'))).map(b => b.id);
console.log('§GUARD not-said N (live link, or a thing not built), named in the voice: ' + (nb.join(',') || 'none')); if (nb.length) bad++;
console.log('§GUARD pane P (from facts.js): the page\'s grid names the door\'s rows on ' + F.pane.same + ' of ' + F.pane.states + ' states, page errors ' + F.pane.pageErrors); if (!F.pane.states || F.pane.same !== F.pane.states || F.pane.pageErrors) bad++;
if (/jelapang/i.test(JSON.stringify(F) + N.beats.map(b => b.text || '').join(' '))) { bad++; console.log('§GUARD private name found'); }
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
