// ⚠ DO NOT REMOVE — film "Help that answers" (§11), reused unchanged by "The container legacy gave us, filled" (§19.18): the voice spells some words letter by letter ("A I", "E R P") so Kokoro says the letters;
// the burned-in SUBTITLE shows them as written ("AI", "ERP"). Only the caption text of the ASS changes, never a time. Usage: node written.js <file.ass>. READ out/written.log.
'use strict';
const fs = require('fs'), f = process.argv[2], MAP = [[/\bA I\b/g, 'AI'], [/\bE R P\b/g, 'ERP']];
let n = 0; const out = fs.readFileSync(f, 'utf8').split('\n').map((l) => { if (!/^Dialogue:/.test(l)) return l; let t = l; MAP.forEach(([re, w]) => { t = t.replace(re, () => { n++; return w; }); }); return t; });
fs.writeFileSync(f, out.join('\n')); console.log('§WRITTEN replaced=' + n + ' (' + MAP.map((m) => m[1]).join(', ') + ')');
