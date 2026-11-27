// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 1 (prompts/FILM_KILLER_FRONT_DOOR.md §4 guard.js): G (every spoken figure is in out/facts.json with that value and its word is in the beat's text; no digit at all in the voice),
// proof talk, N not-said (no network/privacy claim the take did not measure, no other product, no claim about many users, speed or compliance), planted-number control, and with `cards`: every number printed on a card or in the strip is a number of
// facts.json (or a named static one). Can say FAIL / INCONCLUSIVE. Usage: node guard.js [voice|cards]. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), OD = process.env.OUTD || 'out', mode = process.argv[2] || 'voice';
const F = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'facts.json'), 'utf8')), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
const toks = (s) => (String(s).match(/\d[\d,.]*\d|\d/g) || []).map(t => t.replace(/[.,]+$/, ''));
const known = new Set(); (function walk(v) { if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); else toks(v).forEach(t => known.add(t)); })(F);
['3.0'].forEach(t => known.add(t));
if (fs.existsSync(path.join(__dirname, OD, 'credits.json'))) toks(fs.readFileSync(path.join(__dirname, OD, 'credits.json'), 'utf8')).forEach(t => known.add(t));   // rc2: the numbers of the credit lines are those read from their sources (credits.js)   // static: "CC BY 3.0" of the key-sound credit (keys_eklee/license.txt)
const unknown = (text) => toks(text).filter(t => !known.has(t));
if (mode === 'voice') {
  N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
  const dig = N.beats.filter(b => b.text && /\d/.test(b.text)).map(b => b.id); console.log('§GUARD digits in the voice (numbers are spelled in words): ' + (dig.join(',') || 'none')); if (dig.length) bad++;
  const proof = /witness|falsif|parity|verified|proven|first ever|\bnovel\b|\bunique\b|\bthe first\b|nobody else|no one else/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id); console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
  const notSaid = /uploaded|never leaves|stays on|nothing is sent|private|secure|encrypt|\bexcel\b|acrobat|adobe|google|libreoffice|microsoft|many users|multi-?user|compliance|compliant|\bfast\b|faster|\bquick|seconds|speed|e-?invoice|live link|real[- ]time|\bsync/i, nb = N.beats.filter(b => b.text && notSaid.test(b.text)).map(b => b.id);
  console.log('§GUARD not-said N (an unmeasured network or privacy claim, another product, many users / speed / compliance): ' + (nb.join(',') || 'none')); if (nb.length) bad++;
  console.log('§GUARD beat 1 network claim: requests after the file was chosen=' + F.net.b1.requests + ' (urls ' + F.net.b1.urls.join(',') + '), carrying a body=' + F.net.b1.withBody + ' -> the voice says "on your own computer", not "nothing leaves it"' + (/stays|uploaded|nothing/i.test((N.beats.find(b => b.id === 'b1') || {}).text || '') && F.net.b1.requests !== 0 ? ' FAIL' : ''));
  const ctl = unknown('the total is 7777.77'); console.log('§GUARD_CONTROL planted number 7777.77 is ' + (ctl.length ? 'REJECTED (the guard can fail)' : 'ACCEPTED (the guard is blind) FAIL')); if (!ctl.length) bad++;
} else {
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'cards/text.json'), 'utf8')); let seen = 0;
  Object.keys(T).forEach(id => T[id].forEach((t, i) => { const u = unknown(t); seen += toks(t).length; if (u.length) { bad++; console.log('§GUARD FAIL card ' + id + ' still ' + (i + 1) + ' prints a number that is not a fact of the take: ' + u.join(',')); } }));
  n = seen; console.log('§GUARD cards: ' + seen + ' numbers printed on the cards and in the strip, each a number of facts.json: ' + (bad ? 'NO' : 'yes'));
  const ctl = unknown('7777.77'); console.log('§GUARD_CONTROL planted number on a card is ' + (ctl.length ? 'REJECTED' : 'ACCEPTED FAIL')); if (!ctl.length) bad++;
  }
console.log('§GUARD_VERDICT ' + mode + ' ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
