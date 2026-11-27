// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM). READ THE LOG.
// G every fact a beat speaks is in out/facts.json with the stated value and its spoken word is in the beat's text. N nothing that is NOT built is named in the voice or in priorart.json
// (a detail tab, master=, sign-in, the browser, a legacy server run, acting "as a role"). P every prior-art line has a source: a local path that exists (with its line), or an https URL.
// No proof talk, no "first/novel/unique". INCONCLUSIVE when nothing was judged.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const F = require('./out/facts.json'), N = require('./narr.js'), PA = require('./priorart.json'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
const voice = N.beats.map(b => b.text || '').join(' '), card = JSON.stringify(PA);
const proof = /witness|falsif|parity|verified|proven|first ever|\bnovel\b|\bunique\b|\bthe first\b|nobody else|no one else|首创|首个|第一个|独一无二|唯一|没有人|无人能/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id).concat(proof.test([PA.found, PA.notSearched, PA.found_zh, PA.notSearched_zh].join(' ')) ? ['priorart.json'] : []);
console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
const notBuilt = /master=|detail tab|sign[- ]?in|log ?in|browser|legacy server|as a role|approval|workflow|主从|明细页|登录|浏览器|审批|工作流/i, nb = N.beats.filter(b => b.text && notBuilt.test(b.text)).map(b => b.id);
console.log('§GUARD not-built N: named in the voice: ' + (nb.join(',') || 'none')); if (nb.length) bad++;
const roots = [path.join(os.homedir(), 'idempiere-dev-setup'), path.join(os.homedir(), 'Projects/red1_plugins')]; let pn = 0;
['learned', 'nearby'].forEach(k => (PA[k] || []).forEach(e => { pn++; let ok = false, how = '';
  if (/^https:\/\/\S+$/.test(e.source)) { ok = k === 'nearby'; how = 'url'; }
  else { const m = /^(.*):(\d+)$/.exec(e.source || ''), f = m && roots.map(r => path.join(r, m[1])).filter(x => fs.existsSync(x))[0]; ok = !!f && k === 'learned' && fs.readFileSync(f, 'utf8').split('\n').length >= Number(m[2]); how = f ? 'file has ' + fs.readFileSync(f, 'utf8').split('\n').length + ' lines' : 'FILE NOT FOUND'; }
  if (!ok || !e.line || !(e.took || e.does)) bad++; console.log('§GUARD prior art P ' + (ok ? 'OK  ' : 'FAIL') + ' ' + k + ': "' + e.line + '" <- ' + e.source + ' (' + how + ')'); }));
if (!pn) { bad++; console.log('§GUARD prior art P VACUOUS: no entry'); }
if (/jelapang/i.test(JSON.stringify(F) + voice + card)) { bad++; console.log('§GUARD private name found'); }
const zhMiss = N.lang === 'zh' ? ['learned', 'nearby'].reduce((m, k) => m.concat(PA[k].filter(e => !(e.took_zh || e.does_zh)).map(e => e.line)), []).concat(PA.found_zh && PA.notSearched_zh ? [] : ['found/notSearched']) : [];
console.log('§GUARD language=' + N.lang + (N.lang === 'zh' ? ' prior-art lines without a Chinese text: ' + (zhMiss.join(',') || 'none') + '; beats with no CJK character: ' + (N.beats.filter(b => b.text && !/[\u4e00-\u9fff]/.test(b.text)).map(b => b.id).join(',') || 'none') : '')); if (zhMiss.length || (N.lang === 'zh' && N.beats.some(b => b.text && !/[\u4e00-\u9fff]/.test(b.text)))) bad++;
console.log('§GUARD_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' prior_art_lines=' + pn + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
