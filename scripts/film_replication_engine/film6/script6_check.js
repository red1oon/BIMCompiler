// ⚠ DO NOT REMOVE — Scope: checks script6.md. READ THE LOG (logs/script6_check.log). Fails on: a digit or spelled cardinal in a spoken line, a {fact:id} not in facts6.spec.json, a {claim:id} not in claims6.json (or UNCONFIRMED and not flagged), "fraud cannot occur"-type wording, a missing mandatory line. Counts spoken words (fact tokens count as N words from facts6_resolve if resolvable, else 2).
'use strict';
const fs = require('fs'), path = require('path');
const md = fs.readFileSync(path.join(__dirname, 'script6.md'), 'utf8');
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.spec.json'), 'utf8')), ids = new Set(spec.facts.map(f => f.id));
const cl = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8')), cids = Object.fromEntries(cl.claims.map(c => [c.id, c]));
const CARD = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)$/i;
let bad = 0, words = 0, ifWords = 0; const per = {}; let chap = 'front'; const usedF = new Set(), usedC = new Set();
const fail = (m) => { bad++; console.log('§SCRIPT_FAIL ' + m); };
md.split('\n').forEach((line, i) => {
  const h = /^## (\S+)\./.exec(line); if (h) chap = h[1];
  for (const m of line.matchAll(/\{claim:([^}]+)\}/g)) { usedC.add(m[1]); if (!cids[m[1]]) fail(`line ${i + 1}: unknown claim ${m[1]}`); }
  const segs = []; const re = /(^|\s|\|)(F|M):\s*/g; let m, last = null;
  // spoken text = the text after "F:" / "M:" up to the next marker, bracket-tag or end of line
  const tl = line.replace(/\[(IF|ELSE)[^\]]*\]/g, '|'), pos = []; while ((m = /(?:^|[\s|])(F|M):\s/g.exec(tl.slice(0))) && false); 
  const idx = []; const r2 = /(?:^|[\s|])(F|M):\s/g; while ((m = r2.exec(tl))) idx.push(m.index + m[0].length);
  idx.forEach((st, k) => { let en = k + 1 < idx.length ? tl.indexOf(' M:', st) : tl.length; const nxt = [tl.indexOf(' M:', st), tl.indexOf(' F:', st), tl.indexOf('|', st)].filter(x => x >= 0); en = nxt.length ? Math.min(...nxt) : tl.length; segs.push(tl.slice(st, en)); });
  segs.forEach(sp => {
    for (const fm of sp.matchAll(/\{fact:([^}]+)\}/g)) { usedF.add(fm[1]); if (!ids.has(fm[1])) fail(`line ${i + 1}: unknown fact ${fm[1]}`); }
    const plain = sp.replace(/\{fact:[^}]+\}/g, ' FACTTOKEN ').replace(/\{claim:[^}]+\}/g, ' ');
    if (/\d/.test(plain)) fail(`line ${i + 1}: digit in a spoken line: ${plain.trim().slice(0, 80)}`);
    plain.split(/[^A-Za-z'-]+/).filter(Boolean).forEach(w => { if (CARD.test(w.replace(/-.*$/, ''))) fail(`line ${i + 1}: spelled cardinal "${w}" in a spoken line`); });
    if (/fraud (cannot|can't|can not|will not|never)|cannot occur|impossible to cheat|cheat.proof/i.test(plain)) fail(`line ${i + 1}: forbidden wording (§42.2)`);
    const n = plain.split(/\s+/).filter(Boolean).length; words += n; if (/\[IF/.test(line) || /^\s+\[ELSE\]/.test(line)) ifWords += n; per[chap] = (per[chap] || 0) + n;
  });
});
for (const f of usedF) { /* used */ }
Object.entries(cids).forEach(([k, c]) => { if (c.status.startsWith('UNCONFIRMED') && /\{claim:/.test(md) && usedC.has(k) && !/UNCONFIRMED/.test(md)) fail('unconfirmed claim used without a flag: ' + k); });
const need = ['Can you think of a scenario where this system will fail?', 'red1org@gmail.com', 'MIT', 'backward compatibility', 'sustainability', 'interoperability', 'sovereignty', 'No Server to Keep Alive — and the Books Still Close', 'standard ERP imports, local first: Unicenta POS and Micro Finance'];
need.forEach(t => { if (!md.includes(t)) fail('mandatory text missing: ' + t); });
const WPM = 175, FACTW = 3; // a fact token is read as ~3 words ("fifty-five thousand four hundred ...") on average
const tokens = (md.match(/\{fact:[^}]+\}/g) || []).length; // tokens only counted inside spoken lines above as one word each; add (FACTW-1) per spoken token
let spokenTok = 0; md.split('\n').forEach(l => { if (/(^|\s)(F|M):\s/.test(l)) spokenTok += (l.match(/\{fact:[^}]+\}/g) || []).length; });
const total = words + spokenTok * (FACTW - 1);
Object.keys(per).forEach(k => console.log(`§SCRIPT_WORDS ${k} ${per[k]}`));
console.log(`§SCRIPT_LEN spoken_words=${words} fact_tokens_spoken=${spokenTok} est_words=${total} minutes@${WPM}wpm=${(total / WPM).toFixed(2)} (+ cards/pauses not counted)`);
const unusedF = [...ids].filter(x => !usedF.has(x)); console.log(`§SCRIPT_FACTS used=${usedF.size} of ${ids.size}; not spoken (card/stage only or spare): ${unusedF.join(', ')}`);
console.log(`§SCRIPT_CLAIMS used=${usedC.size} of ${Object.keys(cids).length}; unused: ${Object.keys(cids).filter(x => !usedC.has(x)).join(', ')}`);
console.log(`§SCRIPT_LEN_BASELINE words_in_pending_[IF]_lines=${ifWords} => if every pending branch is cut: est_words=${total - ifWords} minutes@${WPM}wpm=${((total - ifWords) / WPM).toFixed(2)}`);
console.log(`§SCRIPT_VERDICT ${bad ? 'FAIL' : 'PASS'} problems=${bad}`); process.exit(bad ? 1 : 0);
