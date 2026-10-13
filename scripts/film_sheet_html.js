// film_sheet_html.js — render an engine/ExcelJS model sheet (ninja_template_xlsx.loadModel) to styled HTML so the film can show the REAL sheets (colours, bands, merges, widths) without a live Excel window.
// Pure translation of what is in the file; no values are invented. Each <td> carries data-a="B7" so the recorder can outline cells by address.
'use strict';
const colName = c => { let s = '', n = c + 1; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const parse = a => { const m = /^([A-Z]+)(\d+)$/.exec(a); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { r: +m[2] - 1, c: c - 1 }; };
const argb = c => (c && c.argb ? '#' + String(c.argb).slice(-6) : null);
const BORD = { thin: '1px', medium: '2px', thick: '3px', double: '3px', hair: '1px' };
function css(st, SSF) {
  if (!st) return '';
  const o = [], f = st.font || {}, a = st.alignment || {}, b = st.border || {};
  if (f.name) o.push(`font-family:'${f.name === 'Arial' ? 'Liberation Sans' : f.name}',Arial,sans-serif`);
  if (f.size) o.push(`font-size:${(f.size * 1.333).toFixed(1)}px`); if (f.bold) o.push('font-weight:700'); if (f.italic) o.push('font-style:italic'); if (argb(f.color)) o.push('color:' + argb(f.color));
  if (st.fill && st.fill.fgColor && argb(st.fill.fgColor)) o.push('background:' + argb(st.fill.fgColor));
  if (a.horizontal) o.push('text-align:' + (a.horizontal === 'center' ? 'center' : a.horizontal)); if (a.vertical) o.push('vertical-align:' + (a.vertical === 'middle' ? 'middle' : a.vertical)); if (a.wrapText) o.push('white-space:normal');
  ['top', 'bottom', 'left', 'right'].forEach(s => { const e = b[s]; if (e && e.style) o.push(`border-${s}:${BORD[e.style] || '1px'} ${e.style === 'double' ? 'double' : 'solid'} ${argb(e.color) || '#999'}`); });
  return o.join(';');
}
function sheetHtml(model, name, X, opt) {
  opt = opt || {}; const sh = model.Sheets[name], keys = Object.keys(sh).filter(k => /^[A-Z]+\d+$/.test(k)); let maxr = 0, maxc = 0;
  keys.forEach(k => { const p = parse(k); if (sh[k].t !== 'z' || sh[k].s != null) { maxr = Math.max(maxr, p.r); maxc = Math.max(maxc, p.c); } });
  if (opt.maxCol != null) maxc = Math.min(maxc, opt.maxCol); if (opt.maxRow != null) maxr = Math.min(maxr, opt.maxRow);
  const merges = (sh['!merges'] || []).filter(m => m.e.r <= maxr + 50), mastr = {}, slave = {};
  merges.forEach(m => { mastr[colName(m.s.c) + (m.s.r + 1)] = m; for (let r = m.s.r; r <= m.e.r; r++) for (let c = m.s.c; c <= m.e.c; c++) if (r !== m.s.r || c !== m.s.c) slave[colName(c) + (r + 1)] = 1; });
  const px = w => Math.round((w || 8.43) * 7 + 5), cols = []; for (let c = 0; c <= maxc; c++) cols.push(`<col style="width:${px((sh['!cols'] || [])[c] && sh['!cols'][c].width)}px">`);
  let h = `<table class="xs" data-sheet="${name}"><colgroup>${cols.join('')}</colgroup>`;
  for (let r = 0; r <= maxr; r++) {
    const rh = (sh['!rows'] || [])[r] && sh['!rows'][r].h; h += `<tr style="height:${rh ? Math.round(rh * 1.333) : 20}px">`;
    for (let c = 0; c <= maxc; c++) {
      const a = colName(c) + (r + 1); if (slave[a]) continue; const cell = sh[a] || { t: 'z' }, st = cell.s != null ? model._styles[cell.s] : null, m = mastr[a];
      let txt = ''; if (cell.t === 'n') { try { txt = X.SSF.format(cell.z || 'General', cell.v); } catch (e) { txt = String(cell.v); } } else if (cell.t !== 'z') txt = String(cell.v);
      if (opt.showFormula && cell.f) txt = '=' + cell.f;
      if (opt.display) { const d = opt.display(a, cell, txt); if (d != null) txt = d; }
      h += `<td data-a="${a}"${m ? ` colspan="${m.e.c - m.s.c + 1}" rowspan="${m.e.r - m.s.r + 1}"` : ''} style="${css(st, X.SSF)}">${String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`;
    }
    h += '</tr>';
  }
  return h + '</table>';
}
module.exports = { sheetHtml, colName, parse };
