// ⚠ DO NOT REMOVE — Scope: the number guard of "uniCenta POS, reborn" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34 PRIME rule: every number spoken or shown traces to a § log). READ THE LOG: node guard.js > out/guard.log
//   G1 every fact resolved (out/facts.resolved.json from resolve.js)      G2 every number WORD in a beat's voice is a word declared by a fact of that beat (nothing else may be spoken as a number)
//   G3 every declared word is spoken somewhere in that beat (dead facts are WARN)   G4 every digit sequence on a card equals a resolved fact value (or a § reference / project contact)
//   G5 beats with no narration are only cards of fixed hold; >0 narrated beats (else INCONCLUSIVE)     C1/C2 CONTROLS: a planted spoken number and a planted card number are caught (a guard that cannot fail is not a guard)
'use strict';
const fs = require('fs'), path = require('path'); const say = s => console.log(s); let fail = 0;
const N = require('./narr.js'), Cards = require('./cards.js'), { LANG, SHARED } = require('./lang.js'), { voiceOf, spokenAcr } = require('./voice.js');
const R = JSON.parse(fs.readFileSync(path.join(SHARED, 'facts.resolved.json'), 'utf8'));
const miss = Object.keys(N.SPEC).filter(k => !R[k]); say('§GUARD G1 ' + (miss.length ? 'FAIL unresolved: ' + miss : 'PASS') + ' facts=' + Object.keys(R).length); if (miss.length) fail++;
const NUM = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|twenty twelve|twenty eleven|fifteen hundred|nine point zero)\b(-(one|two|three|four|five|six|seven|eight|nine))?/gi;
const spokenEn = t => { const o = []; let m; const s = t.toLowerCase().replace(/twenty twelve/g, 'TT').replace(/twenty eleven/g, 'TE').replace(/fifteen hundred/g, 'FH').replace(/nine point zero/g, 'NPZ').replace(/M\.I\.T\./gi, 'MIT'); const re = new RegExp(NUM.source.replace('|twenty twelve|twenty eleven|fifteen hundred|nine point zero', ''), 'gi');
  while ((m = re.exec(s))) o.push(m[0]); (s.match(/TT/g) || []).forEach(() => o.push('twenty twelve')); (s.match(/TE/g) || []).forEach(() => o.push('twenty eleven')); (s.match(/FH/g) || []).forEach(() => o.push('fifteen hundred')); (s.match(/NPZ/g) || []).forEach(() => o.push('nine point zero')); return o; };
// v4 (§34.G): zh = runs of Chinese numerals (九点零 whole); ms = runs of Malay number words (facts.spec.json fields "zh" / "ms" declare them)
const ZHN = /[零一二两三四五六七八九十百千]+/g, MSW = 'sifar|satu|dua|tiga|empat|lima|enam|tujuh|lapan|sembilan|sepuluh|sebelas|seribu|ribu|ratus|puluh|belas|perpuluhan', MSN = new RegExp('\\b(?:' + MSW + ')(?: (?:' + MSW + '))*\\b', 'g');
const spokenZh = t => { const o = []; (t.match(/九点零/g) || []).forEach(() => o.push('九点零')); return o.concat(t.replace(/九点零/g, '').match(ZHN) || []); };
const spokenMs = t => t.toLowerCase().match(MSN) || [];
const spokenNums = LANG === 'zh' ? spokenZh : LANG === 'ms' ? spokenMs : spokenEn;
const wordsOf = b => b.facts.reduce((a, k) => a.concat((LANG === 'en' ? N.SPEC[k].words : N.SPEC[k][LANG]) || []), []);
const bad = bs => bs.reduce((a, b) => b.text ? a.concat(spokenNums(b.text).filter(w => wordsOf(b).indexOf(w) < 0).map(w => b.id + ':' + w)) : a, []);
const g2 = bad(N.beats), nb = N.beats.filter(b => b.text); let spokenTotal = 0; nb.forEach(b => { spokenTotal += spokenNums(b.text).length; });
say('§GUARD G2 ' + (!nb.length ? 'INCONCLUSIVE no narrated beats' : g2.length ? 'FAIL undeclared number words ' + JSON.stringify(g2) : 'PASS') + ' narrated_beats=' + nb.length + ' number_words_spoken=' + spokenTotal); if (!nb.length || g2.length) fail++;
const dead = []; nb.forEach(b => wordsOf(b).forEach(w => { if (spokenNums(b.text).indexOf(w) < 0) dead.push(b.id + ':' + w); })); say('§GUARD G3 ' + (dead.length ? 'WARN declared but not spoken ' + JSON.stringify(dead) : 'PASS'));
const LIT = /red1oon|red1org@gmail\.com/g, REF = /§[\w.]+|OPEN-\d/g, factVals = Object.keys(R).map(k => R[k].value).filter(v => v !== undefined).map(String);
const cardDigits = C => { const o = []; Object.keys(C).forEach(k => { (C[k].ops.map(x => x.txt || '').join(' \n ').replace(LIT, '').replace(REF, '').match(/\d+(\.\d+)?/g) || []).forEach(d => o.push(k + ':' + d)); }); return o; };
const cd = C => cardDigits(C).filter(x => factVals.indexOf(x.split(':')[1]) < 0 && !Object.keys(R).some(k => String(R[k].value).split(/\D+/).indexOf(x.split(':')[1]) >= 0));
const C = Cards.spec(), c4 = cd(C); const shown = cardDigits(C); say('§GUARD G4 ' + (c4.length ? 'FAIL card numbers that are no fact ' + JSON.stringify(c4) : 'PASS') + ' card_numbers_shown=' + shown.length); if (c4.length) fail++;
const hold = N.beats.filter(b => !b.text && !b.hold); say('§GUARD G5 ' + (hold.length ? 'FAIL silent beats without a hold ' + hold.map(b => b.id) : 'PASS') + ' beats=' + N.beats.length); if (hold.length) fail++;
const PLANT = { en: ' Forty-two more.', zh: ' 还有四十二。', ms: ' Empat puluh dua lagi.' }[LANG], B2 = N.beats.map(b => ({ ...b, text: b.id === 'b1b' ? b.text + PLANT : b.text })), c2 = bad(B2); say('§GUARD C2 ' + (c2.length ? 'PASS caught ' + c2.join(',') : 'FAIL the planted spoken number was not caught')); if (!c2.length) fail++;
const C1 = JSON.parse(JSON.stringify(C)); C1.gs.ops.push({ t: 'text', txt: 'planted 777' }); const c1 = cd(C1); say('§GUARD C1 ' + (c1.some(x => /777/.test(x)) ? 'PASS caught ' + c1.join(',') : 'FAIL the planted card number was not caught')); if (!c1.some(x => /777/.test(x))) fail++;
// G6 (§34.G): no bare uppercase acronym in any VOICE text (the voice spells ERP / AI / POS / ActiveMQ as letters; SODA, EODA, SQLite, WASM, HQ are caption-only); control C3 plants one
const bareAcr = bs => bs.reduce((a, b) => b.text ? a.concat((voiceOf(b.text, LANG).match(/\b[A-Z]{2,}\b/g) || []).map(x => b.id + ':' + x)) : a, []);
const g6 = bareAcr(N.beats); say('§GUARD G6 ' + (g6.length ? 'FAIL acronym left in a voice ' + JSON.stringify(g6) : 'PASS') + ' lang=' + LANG); if (g6.length) fail++;
const c3 = bareAcr(N.beats.map(b => ({ ...b, text: b.id === 'b6' ? b.text + ' SODA' : b.text }))); say('§GUARD C3 ' + (c3.length ? 'PASS caught ' + c3.join(',') : 'FAIL the planted bare acronym was not caught')); if (!c3.length) fail++;
const inv = {}; nb.forEach(b => spokenAcr(b.text).forEach(([k, n]) => { inv[k] = (inv[k] || 0) + n; })); say('§GUARD ACRONYMS_SPOKEN lang=' + LANG + ' ' + JSON.stringify(inv));
say('§GUARD_VERDICT ' + (fail ? 'FAIL fails=' + fail : 'PASS (3 controls)')); process.exit(fail ? 1 : 0);
