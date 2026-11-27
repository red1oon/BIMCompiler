// ⚠ DO NOT REMOVE — film "Remember The Name - red1" (prompts/CLI_ERP_IVR.md §22.13): one terminal screen (a pyte snapshot from rec.py: rows of runs [text, [fg, bg, bold, reverse]], cursor) -> HTML -> 1920x1080 still.
// FULL FRAME, terminal only (owner 2026-11-15). The terminal is 140 x 32 cells; the bottom 170 px stay the plain background, where the burned-in captions sit, so no caption covers an answer.
'use strict';
const PAL = { black: '#1e293b', red: '#f87171', green: '#4ade80', brown: '#fbbf24', blue: '#60a5fa', magenta: '#c084fc', cyan: '#7dd3fc', white: '#e5e7eb',
  brightblack: '#64748b', brightred: '#fca5a5', brightgreen: '#86efac', brightbrown: '#fde68a', brightblue: '#93c5fd', brightmagenta: '#d8b4fe', brightcyan: '#a5f3fc', brightwhite: '#ffffff' };
const FG = '#e5e7eb', BG = '#0b0f17';
const col = (c, d) => c === 'default' ? d : (PAL[c] || (/^[0-9a-f]{6}$/i.test(c) ? '#' + c : d));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/ /g, '&nbsp;');
const CSS = `*{margin:0;padding:0;box-sizing:border-box} body{width:1920px;height:1080px;background:${BG};overflow:hidden}
.t{position:absolute;left:33px;top:14px;font-family:'DejaVu Sans Mono',monospace;font-size:22px;line-height:28px;color:${FG};white-space:pre}
.r{height:28px;white-space:pre} .c{background:#4ade80;color:#0b0f17}`;
function html(f, o) {   // f: a frame {rows, cx, cy, hidden}; o.cursor: show the cursor (a typed still), default true
  const lines = f.rows.map((runs, y) => {
    let x = 0, out = '';
    runs.forEach(([txt, a]) => {
      const [fg, bg, bold, rev] = a, chars = Array.from(txt);
      chars.forEach((ch, i) => {
        const at = x + i, isCur = (o.cursor !== false) && !f.hidden && y === f.cy && at === f.cx;
        let fc = col(fg, FG), bc = col(bg, null); if (rev) { const t = fc; fc = bc || BG; bc = t; }
        if (isCur) { fc = BG; bc = '#4ade80'; }
        const st = (fc !== FG ? 'color:' + fc + ';' : '') + (bc ? 'background:' + bc + ';' : '') + (bold ? 'font-weight:700;' : '');
        out += st ? '<span style="' + st + '">' + esc(ch) + '</span>' : esc(ch);
      });
      x += chars.length;
    });
    return '<div class="r">' + out + '</div>';
  });
  return '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body><div class="t">' + lines.join('') + '</div></body></html>';
}
module.exports = { html, CSS, BG, FG };
