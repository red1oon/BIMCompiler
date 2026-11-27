// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 3 (prompts/FILM_KILLER_FRONT_DOOR.md, Film 3): G (every spoken figure is in out/facts.json with that value and its word is in the beat's text; no digit at all in the voice), proof talk,
// N not-said (no unmeasured network / security claim, no "cannot be tampered", no other product, no many users / speed / compliance, no price or licence detail in the voice, no phone), the planted-number control, and with `cards`: every number printed on a card or in
// the strip is a number of facts.json or credits.json. Can say FAIL / INCONCLUSIVE. Usage: node guard.js [voice|cards]. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), OD = process.env.OUTD || 'out', mode = process.argv[2] || 'voice';
const F = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'facts.json'), 'utf8')), N = require('./narr.js'); let bad = 0, n = 0;
const get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
const toks = (s) => (String(s).match(/\d[\d,.]*\d|\d/g) || []).map(t => t.replace(/[.,]+$/, ''));
const known = new Set(); (function walk(v) { if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); else toks(v).forEach(t => known.add(t)); })(F);
['3.0'].forEach(t => known.add(t));   // static: "CC BY 3.0" of the key-sound credit (keys_eklee/license.txt)
if (fs.existsSync(path.join(__dirname, OD, 'credits.json'))) toks(fs.readFileSync(path.join(__dirname, OD, 'credits.json'), 'utf8')).forEach(t => known.add(t));   // the numbers of the credit lines are those read from their sources (credits.js)
if (fs.existsSync(path.join(__dirname, OD, 'links.json'))) toks(fs.readFileSync(path.join(__dirname, OD, 'links.json'), 'utf8')).forEach(t => known.add(t));
const unknown = (text) => toks(text).filter(t => !known.has(t));
if (mode === 'voice') {
  N.beats.forEach(b => (b.says || []).forEach(([p, want, word]) => { n++; const got = get(p), ok = String(got) === String(want) && b.text.toLowerCase().indexOf(word) >= 0; if (!ok) bad++; console.log('§GUARD ' + (ok ? 'OK  ' : 'FAIL') + ' beat=' + b.id + ' ' + p + '=' + JSON.stringify(got) + ' expect=' + want + ' spoken="' + word + '"'); }));
  const dig = N.beats.filter(b => b.text && /\d/.test(b.text)).map(b => b.id); console.log('§GUARD digits in the voice (numbers are spelled in words): ' + (dig.join(',') || 'none')); if (dig.length) bad++;
  const proof = /witness|falsif|parity|verified|proven|first ever|\bnovel\b|\bunique\b|\bthe first\b|nobody else|no one else/i, hit = N.beats.filter(b => b.text && proof.test(b.text)).map(b => b.id); console.log('§GUARD proof talk or first/novel/unique: ' + (hit.join(',') || 'none')); if (hit.length) bad++;
  const notSaid = /never leaves|stays on|nothing is sent|nothing leaves|private|secur|protected|forever|once and for all|settled|in excel|signed|encrypt|encrypt|\bexcel\b|acrobat|adobe|google|libreoffice|microsoft|many users|multi-?user|compliance|compliant|\bfast\b|faster|\bquick|seconds|speed|tamper-?proof|cannot be tampered|can't be tampered|unforgeable|e-?invoice|\bprice\b|pricing|licen[cs]e|\bphone\b|\bmobile\b|real[- ]time|\bsync/i, nb = N.beats.filter(b => b.text && notSaid.test(b.text)).map(b => b.id);
  console.log('§GUARD not-said N (a network or security claim, another product, many users / speed / compliance, price or licence detail, phone): ' + (nb.join(',') || 'none')); if (nb.length) bad++;
  const up = N.beats.filter(b => b.text && /upload/i.test(b.text)); console.log('§GUARD "uploaded" spoken in: ' + (up.map(b => b.id).join(',') || 'none') + ' ; measured: server requests after the pages were ready=' + F.net.requestsAfterReady + ', non-GET=' + F.net.notGet + ', external=' + F.net.external + ', page errors=' + F.pageErrors.length); if (up.length && !F.d.noUpload) { bad++; console.log('§GUARD FAIL upload claim without the measurement'); }
  console.log('§GUARD network claims over the pages: none made; external requests aborted in the take: ' + (F.net && F.net.external));
  const ctl = unknown('the total is 7777.77'); console.log('§GUARD_CONTROL planted number 7777.77 is ' + (ctl.length ? 'REJECTED (the guard can fail)' : 'ACCEPTED (the guard is blind) FAIL')); if (!ctl.length) bad++;
} else {
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'cards/text.json'), 'utf8')); let seen = 0;
  const knownArr = Array.from(known); let typedPrefix = 0;
  Object.keys(T).forEach(id => T[id].forEach((e, i) => { const t = e.t; let u = unknown(t); if (e.typing) { const before = u.length; u = u.filter(x => !knownArr.some(k => k.indexOf(x) === 0)); typedPrefix += before - u.length; } seen += toks(t).length; if (u.length) { bad++; console.log('§GUARD FAIL card ' + id + ' still ' + (i + 1) + ' prints a number that is not a fact of the take: ' + u.join(',')); } }));
  n = seen; console.log('§GUARD cards: ' + seen + ' numbers printed on the cards and in the strip, each a number of facts.json / credits.json (' + typedPrefix + ' of them are a half-typed prefix of such a number, while the keys are still being pressed): ' + (bad ? 'NO' : 'yes'));
  const ctl = unknown('7777.77'); console.log('§GUARD_CONTROL planted number on a card is ' + (ctl.length ? 'REJECTED' : 'ACCEPTED FAIL')); if (!ctl.length) bad++;
}
console.log('§GUARD_VERDICT ' + mode + ' ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' facts=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
