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
const count = (s, sub) => { let n = 0, i = 0; while ((i = s.indexOf(sub, i)) >= 0) { n++; i += sub.length; } return n; };
module.exports = { parse, kinds, tokens, count };
