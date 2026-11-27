// ⚠ DO NOT REMOVE — Scope: the cards in the film's language (TEAMWORK §45.15). ONE card builder (cards.js); for FILM_LANG=zh every visible text segment
// is replaced from cards_zh.json (exact segment -> Simplified Chinese) and the CJK font is put first. A segment with no translation THROWS (an English
// line under a Chinese voice is a defect, not a fallback). Numbers stay digits, so guard.js checks them exactly as in English.
'use strict';
const fs = require('fs'), path = require('path'), base = require('./cards.js'), LANG = process.env.FILM_LANG || 'en';
const unesc = t => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CSS = LANG === 'zh' ? base.CSS + "*{font-family:'Noto Sans CJK SC','Noto Sans','DejaVu Sans',sans-serif !important}.src{font-family:'Noto Sans CJK SC','DejaVu Sans Mono',monospace !important}" : base.CSS;
function build(F) {
  const C = base.build(F); if (LANG !== 'zh') return C;
  const Z = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards_zh.json'), 'utf8')), miss = [];
  Object.keys(C).forEach(k => { C[k].html = C[k].html.replace(/>([^<]+)</g, (m, t) => { const key = unesc(t).trim(); if (!/[A-Za-z]/.test(key)) return m;
    if (!(key in Z)) { miss.push(k + ': ' + key); return m; } return '>' + t.replace(t.trim(), esc(Z[key])) + '<'; }); });
  if (miss.length) throw new Error('untranslated card text (' + miss.length + '): ' + miss.slice(0, 5).join(' | '));
  return C;
}
module.exports = { CSS, build, LANG };
