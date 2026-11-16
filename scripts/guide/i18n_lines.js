// ⚠ DO NOT REMOVE — i18n_lines.js: the ONE reader of a guide page's lines for translation (prompts/DOCS_I18N.md §6f).
// Used by witness_docs_i18n.js (I11) and i18n_sync.js, so the two can never disagree on what a fence, a comment or a prose line is.
'use strict';
// a page -> its front matter (text and keys) and its body lines
function parse(md) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(md), meta = {};
  if (m) m[1].split('\n').forEach(l => { const k = /^(\w+):\s*(.*)$/.exec(l); if (k) meta[k[1]] = k[2].trim(); });
  let rest = m ? md.slice(m[0].length) : md, gap = false;
  if (m && rest.startsWith('\n')) { rest = rest.slice(1); gap = true; }   // the one blank line after the front matter is part of it, not of the body (measured: I11 counted it as body line 1)
  return { fm: m ? m[1] : null, gap, meta, body: rest.split('\n') };
}
// each body line -> 'fence' | 'code' (inside a fence) | 'comment' (an HTML comment line) | 'blank' | 'prose'
function kinds(body) {
  let inF = false;
  return body.map(l => {
    if (/^\s*```/.test(l)) { inF = !inF; return 'fence'; }
    if (inF) return 'code';
    if (!l.trim()) return 'blank';
    if (/^\s*<!--[\s\S]*-->\s*$/.test(l)) return 'comment';
    return 'prose';
  });
}
// the tokens a translation must keep on a prose line (code spans and digit runs, in order) and the line with them masked
const TOK = /`[^`\n]+`|\d+/g;
function tokens(line) { return { toks: line.match(TOK) || [], mask: line.replace(TOK, '\u0000') }; }
// a token as a pattern: a number matches only as a whole digit run (5 is not inside 1157), a code span as written (DOCS_I18N.md §6f FIX)
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tokRe = (x) => (/^\d+$/.test(x) ? '(?<!\\d)' + esc(x) + '(?!\\d)' : esc(x));
const count = (s, sub) => (s.match(new RegExp(tokRe(sub), 'g')) || []).length;
// swap every old token for its new one in ONE pass (longest first), so text just written is never scanned again
function swap(s, map) { const keys = Array.from(map.keys()).sort((x, y) => y.length - x.length); if (!keys.length) return s; return s.replace(new RegExp(keys.map(tokRe).join('|'), 'g'), (m) => map.get(m)); }
module.exports = { parse, kinds, tokens, count, swap };
