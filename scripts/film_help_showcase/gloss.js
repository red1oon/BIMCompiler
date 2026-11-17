// ⚠ DO NOT REMOVE — film "Help that answers", every non-English cut (zh, de) (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11; owner: "if in foreign language, give English subtitles").
// Adds the ENGLISH line under every Chinese caption: every piece of each spoken turn <id>#<j> of the fitted zh.ass (already split by film_zh_caption_split.py) carries, for the
// piece's own time, with narr.js's `gloss` turn j (the written English) as a smaller second line of the SAME event.
// No time of a Chinese piece changes. Usage: node gloss.js <zh.ass>. READ out_zh/gloss.log: a turn without its English is counted and FAILS.
'use strict';
const fs = require('fs'), path = require('path');
process.env.FILM_LANG = process.env.FILM_LANG || 'zh'; const N = require(path.join(__dirname, 'narr.js'));   // the cut's own beats (zh, de, …): each turn's `gloss` is its English line
const f = process.argv[2], WIDE = 120, EN_TAG = '{\\fnDejaVu Sans\\fs26\\c&H00E8E8E8&}';
// ONE event per Chinese piece: "<中文 piece>\N<English turn>" (English smaller, second line). Two separate events overlapping in time are stacked by libass (one pushed up onto the picture:
// measured v1/v2, check C 24 and 39 cues over); a single event cannot collide. The event's own MarginL/R (WIDE) widen the wrap so the English stays one line.
const en = {}; N.beats.forEach((b) => { if (b.gloss) b.gloss.split('|').forEach((t, j) => { en[b.id + '#' + j] = t.replace(/^\s*[FM]:\s*/, '').trim(); }); });
const lines = fs.readFileSync(f, 'utf8').split('\n'), out = [], seen = {}; let pieces = 0; const miss = [];
for (const l of lines) {
  const m = /^Dialogue: (\d+),([^,]+),([^,]+),(F|M),([^,]*),(\d+),(\d+),(\d+),([^,]*),(.*)$/.exec(l);
  if (!m) { out.push(l); continue; }
  const [, layer, a, b, sty, name, , , mv, eff, txt] = m, g = en[name];
  if (!g) { miss.push(name); out.push(l); continue; }
  seen[name] = 1; pieces++;
  out.push(`Dialogue: ${layer},${a},${b},${sty},${name},${WIDE},${WIDE},${mv},${eff},${txt}\\N${EN_TAG}${g}`);
}
fs.writeFileSync(f, out.join('\n'));
const want = Object.keys(en).length, got = Object.keys(seen).length;
console.log('§GLOSS chinese_pieces=' + pieces + ' turns_with_english=' + got + ' of ' + want + (miss.length ? ' MISSING ' + miss.join(',') : '') + ' (one event per piece, margins ' + WIDE + ')');
console.log('§GLOSS_VERDICT ' + (miss.length || got !== want ? 'FAIL' : 'PASS')); process.exit(miss.length || got !== want ? 1 : 0);
