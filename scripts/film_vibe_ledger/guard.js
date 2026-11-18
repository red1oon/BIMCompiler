// ⚠ DO NOT REMOVE — film "Vibe coding, honestly": the number guard. It can say FAIL, and proves it can (planted-number red controls on the voice and on a card).
//   V  voice: no digit in any narration; every number word is a recorded fact (`says`), re-spelled here from facts.json; a number word left over FAILS (the only plain idiom is "one", counted).
//   S  sources: a value read from a typed command must appear in that command's saved output (out/cmd_<id>.txt).
//   D  cards: every digit group visible on a still (out/cards/texts.json) is a fact value, a number in a command or its output, or a declared literal with its reason. Commit ids and URLs are removed first.
//   P  prior art: each row's text is in its saved copy.   G  guide link: HTTP 200 and the anchor id in the fetched page (`§FILM_GUIDE`); until the docs deploy it says anchor=N and the verdict is PENDING-GUIDE.
// Usage: node guard.js [cards dir]. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const N = require('./narr.js'), F = N.F, PA = require('./priorart.json'), OUT = path.join(__dirname, 'out'), CARDS = path.resolve(process.argv[2] || path.join(OUT, 'cards'));
let bad = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) bad++; return c; };
const NUMW = N.words.toString() && ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million', 'point'];
const voiceCheck = (beats, quiet) => { let b0 = 0, plainOne = 0; const say = m => { if (!quiet) console.log(m); }; for (const b of beats.filter(x => x.text)) {
    if (/\d/.test(b.text)) { b0++; say('  FAIL V ' + b.id + ' has a digit: ' + b.text.match(/.{0,20}\d.{0,20}/)[0]); }
    let t = ' ' + b.text.toLowerCase().replace(/[^a-z' -]/g, ' ') + ' ';
    for (const [k, val, mode, w] of b.says) { const re = N.speak(val, mode); if (re !== w) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' spelled "' + w + '" but re-spells as "' + re + '"'); }
      if (String(N.val(k)) !== String(val)) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' value ' + val + ' is not the fact ' + N.val(k)); }
      const i = t.indexOf(' ' + w.toLowerCase().replace(/-/g, ' ') + ' '), j = t.indexOf(' ' + w.toLowerCase() + ' ');
      if (i < 0 && j < 0) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' words "' + w + '" not found in the text'); } else t = j >= 0 ? t.slice(0, j) + ' ' + t.slice(j + w.length + 1) : t.slice(0, i) + ' ' + t.slice(i + w.length + 1); }
    for (const tok of t.split(/[\s-]+/).filter(Boolean)) if (NUMW.includes(tok)) { if (tok === 'one') plainOne++; else { b0++; say('  FAIL V ' + b.id + ' number word "' + tok + '" is not a recorded fact'); } } }
  return { b0, plainOne }; };
// Mandarin: figures are digits; every digit group must be a recorded fact, and no Chinese numeral may stand alone (一 is the plain idiom; 万 only right after a fact's digits)
const voiceCheckZh = (beats, quiet) => { let b0 = 0, plainOne = 0; const say = m => { if (!quiet) console.log(m); };
  for (const b of beats.filter(x => x.text)) { let t = b.text;
    for (const [k, val, mode, w] of b.says) { const re = N.speak(val, mode); if (re !== w) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' spoken "' + w + '" but re-speaks as "' + re + '"'); }
      if (String(N.val(k)) !== String(val)) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' value ' + val + ' is not the fact ' + N.val(k)); }
      const i = t.indexOf(w); if (i < 0) { b0++; say('  FAIL V ' + b.id + ' ' + k + ' "' + w + '" not found in the text'); } else t = t.slice(0, i) + ' ' + t.slice(i + w.length); }
    (t.match(/\d[\d.,]*/g) || []).forEach(d => { b0++; say('  FAIL V ' + b.id + ' digits "' + d + '" are not a recorded fact'); });
    (t.match(/[二三四五六七八九十百千亿两零万]/g) || []).forEach(c => { b0++; say('  FAIL V ' + b.id + ' Chinese numeral "' + c + '" is not a recorded fact'); });
    plainOne += (t.match(/一/g) || []).length; if (/[A-Za-z]/.test(t.replace(/A-I|E-R-P|P-H-P|F:|M:|iDempiere|Kernel|JavaScript|Java|PostgreSQL|Python|Odoo|Next|GitHub|Gmail|README|VS Code|When|Dies|Vibe Programming/g, ''))) { b0++; say('  FAIL V ' + b.id + ' English left in the Mandarin voice: ' + t.replace(/[^A-Za-z ]/g, '').trim().slice(0, 60)); } }
  return { b0, plainOne }; };
console.log('§GUARD V voice (' + N.lang + ')'); if (N.lang === 'zh') { const r = voiceCheckZh(N.beats); ok(r.b0 === 0, 'V narration (zh): ' + N.beats.filter(b => b.text).length + ' beats, ' + N.beats.reduce((a, b) => a + (b.says || []).length, 0) + ' spoken facts, ' + r.b0 + ' bad; the plain idiom 一 used ' + r.plainOne + ' times');
  const planted = JSON.parse(JSON.stringify(N.beats.filter(b => b.text))); planted[0].text += '它有 17000 个用户，三个服务器。'; const rc = voiceCheckZh(planted, true); ok(rc.b0 >= 2, 'V red control (zh): a planted "17000" and "三" are caught (' + rc.b0 + ')'); }
else { const r = voiceCheck(N.beats); ok(r.b0 === 0, 'V narration: ' + N.beats.filter(b => b.text).length + ' beats, ' + N.beats.reduce((a, b) => a + (b.says || []).length, 0) + ' spoken facts, ' + r.b0 + ' bad; the plain idiom "one" used ' + r.plainOne + ' times');
  const planted = JSON.parse(JSON.stringify(N.beats.filter(b => b.text))); planted[0].text += ' It has seventeen thousand users.'; const rc = voiceCheck(planted, true); ok(rc.b0 > 0, 'V red control: a planted "seventeen thousand" is caught (' + rc.b0 + ')'); }
console.log('§GUARD S sources');
for (const [k, x] of Object.entries(F.v)) { const m = /^cmd (\w+)/.exec(x.src); if (!m) continue; const txt = fs.readFileSync(path.join(OUT, 'cmd_' + m[1] + '.txt'), 'utf8'); ok(txt.includes(x.val), 'S ' + k + '=' + x.val + ' is in out/cmd_' + m[1] + '.txt'); }
console.log('§GUARD D cards');
const allowed = new Set(); const addNums = s => (String(s).match(/\d[\d,.]*\d|\d/g) || []).forEach(x => { allowed.add(x.replace(/,/g, '').replace(/\.$/, '')); });
Object.values(F.v).forEach(x => addNums(x.val)); Object.values(F.cmds).forEach(c => { addNums(c.cmd); c.out.forEach(addNums); }); (F.rvRejects || []).forEach(addNums); Object.keys(F.prs).forEach(addNums); Object.values(F.langs).forEach(l => l.forEach(([, p]) => addNums(p)));
// derived on a card: the "other" share of each language bar, the app-file sum, and the first commit date
Object.values(F.langs).forEach(l => { const js = (l.find(x => x[0] === 'JavaScript') || [0, 0])[1]; l.forEach(([n, p]) => { if (n !== 'JavaScript') addNums((100 - js - p).toFixed(1)); }); }); addNums(N.val('size.app.files')); addNums(F.firstCommit);
fs.readFileSync(path.join(F.trees.T.path, 'package.json'), 'utf8').split('\n').slice(0, 15).forEach(addNums);   // u1 shows the file as it is
const LIT = { '2025': 'the year of the two industry reports (their titles)', '2023': 'Stack Overflow: "70%+ in 2023 and 2024"', '24': 'same, written 2023–24', '2026': 'June 2026 / the read date 2026-11-18', '11': 'read date 2026-11-18', '18': 'read date 2026-11-18',
  '1': 'CHAPTER 1', '2': 'CHAPTER 2', '3': 'CHAPTER 3', '4': 'CHAPTER 4', '5': 'CHAPTER 5', '4D': 'the 4D schedule', '0': 'X0 (the extension\'s name)', '7': 'C7 (a check\'s name)', '3229': 'the README fix PR #3229',
  '256': 'ECDSA P-256 in a witness line', '3.0': 'the CC BY 3.0 licence', '403': 'GitClear answered HTTP 403 (the limits line)' };
Object.keys(LIT).forEach(x => allowed.add(x));
const texts = JSON.parse(fs.readFileSync(path.join(CARDS, 'texts.json'), 'utf8')), strip = s => s.replace(/\b[0-9a-f]{7,12}\b/g, ' ').replace(/(https?:\/\/)?[a-z0-9.-]+\.(io|com|org|co)(\/[^\s·]*)?/gi, ' ').replace(/#\d+-[a-z0-9-]+/g, ' ');
const cardCheck = tx => { const bads = []; for (const [f, t] of Object.entries(tx)) for (const tok of (strip(t).match(/\d[\d,.]*\d|\d/g) || [])) { const n = tok.replace(/,/g, '').replace(/\.$/, ''); if (!allowed.has(n)) bads.push(f + ': ' + tok); } return bads; };
{ const b = cardCheck(texts); b.slice(0, 20).forEach(x => console.log('  FAIL D ' + x)); ok(b.length === 0, 'D ' + Object.keys(texts).length + ' stills, every digit group is a fact or a declared literal (' + Object.keys(LIT).length + ' literals) — ' + b.length + ' not');
  const pl = Object.assign({}, texts); const k0 = Object.keys(pl).pop(); pl[k0] += ' Planted 9,876 users'; ok(cardCheck(pl).length > 0, 'D red control: a planted "9,876" on a card is caught'); }
console.log('§GUARD P prior art');
for (const it of PA.items) { const w = it.where; let txt = '';
  if (w.path === 'IDEM') txt = fs.readdirSync(F.trees.I.path).join(' '); else txt = fs.readFileSync(path.join(__dirname, w.saved), 'utf8').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ');
  ok(txt.includes(w.text), 'P ' + it.name + ': "' + w.text.slice(0, 60) + '" is in ' + (w.saved || 'the iDempiere tree')); }
console.log('§GUARD credentials'); for (const [k, x] of Object.entries(F.prs)) ok(x.state === 'MERGED', 'PR ' + k + ' (' + x.what + ') ' + x.state);
const GUIDE = 'https://red1oon.github.io/BIMCompiler/VibeProgramming/', ANCH = '2026-11-an-outside-assessment-fact-checked';
const g = spawnSync('curl', ['-s', '-m', '30', '-w', '\n%{http_code}', GUIDE], { encoding: 'utf8' }), gl = (g.stdout || '').split('\n'), http = gl.pop(), anchor = gl.join('\n').includes('id="' + ANCH + '"') ? 'Y' : 'N';
console.log('§FILM_GUIDE url=' + GUIDE + '#' + ANCH + ' http=' + http + ' anchor=' + anchor);
const verdict = bad ? 'FAIL' : (http === '200' && anchor === 'Y' ? 'PASS' : 'PENDING-GUIDE');
console.log('§FILM_GUARD VERDICT ' + verdict + ' bad=' + bad + (verdict === 'PENDING-GUIDE' ? ' (everything else passed; the guide section is not live yet: run scripts/safe_gh_deploy.sh, then re-run)' : ''));
process.exit(bad ? 1 : 0);
