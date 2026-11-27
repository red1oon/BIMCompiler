// ⚠ DO NOT REMOVE — Scope: the DOM layout witness shared by stage6_dry.js and film6_record.js: probe() runs IN THE PAGE and returns raw measurements; judge() (node) turns them into problems: text outside the canvas, overflowing / truncated blocks, overlapping cards,
// WCAG contrast < 4.5 per text run, colours outside the Civil Works palette (HTML computed colours + SVG fill/stroke). Copied from stage6_dry.js, which stays as it is.
'use strict';
const fs = require('fs'), path = require('path');
const PAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette.json'), 'utf8')), hex2rgb = h => { const m = /^#(..)(..)(..)$/.exec(h); return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; };
const PALSET = new Set(Object.values(PAL.colours).map(c => hex2rgb(c.hex).join(',')));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
function probe(PALARR) {
  const out = { runs: [], overflow: [], colours: [], outside: [], svgCols: [] }, rgb = s => { const m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.99) return c.slice(0, 3); } return [8, 10, 14]; };
  document.querySelectorAll('#app *').forEach(el => {
    if (el.closest('svg')) return; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('#wm')) return;
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (own) { const c = rgb(cs.color); out.runs.push({ text: own.slice(0, 40), color: c.slice(0, 3), bg: bgOf(el), op: parseFloat(cs.opacity) }); const r = document.createRange(); r.selectNodeContents(el); Array.from(r.getClientRects()).forEach(q => { if (q.width > 0 && (q.left < 4 || q.right > 1916 || q.top < 2 || q.bottom > 928)) out.outside.push(own.slice(0, 40)); }); }
    if (el.matches('.st,.nt,.lg,.card') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) out.overflow.push((el.id || el.className) + ': ' + el.textContent.slice(0, 40));
    if (el.matches('.hd,.lg div,#stripT,#stripS,.part,.nm,.sb') && el.scrollWidth > el.clientWidth + 1) out.overflow.push('wide ' + (el.id || el.className) + ': ' + el.textContent.slice(0, 40));
    [cs.color, cs.backgroundColor, cs.borderTopWidth !== '0px' ? cs.borderTopColor : null].forEach((v, i) => { const c = v && rgb(v); if (c && c[3] > 0.05 && (i !== 0 || own)) out.colours.push({ c: c.slice(0, 3), who: (el.id || el.className) + '' }); });
  });
  document.querySelectorAll('#svg [fill],#svg [stroke]').forEach(el => { ['fill', 'stroke'].forEach(a => { const v = el.getAttribute(a); if (v && v !== 'none') out.svgCols.push(v.toUpperCase()); }); });
  // text blocks inside the SVG panel must stay inside 1920x326
  document.querySelectorAll('#svg text').forEach(tx => { const b = tx.getBBox(); if (b.x < 0 || b.x + b.width > 1920 || b.y < 0 || b.y + b.height > 296) out.outside.push('svg:' + tx.textContent.slice(0, 30)); });
  // static card overlap (each card box inside the canvas and not overlapping another)
  const cards = Array.from(document.querySelectorAll('#cards .card')).map(c => c.getBoundingClientRect()); for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) { const a = cards[i], b = cards[j]; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) out.overflow.push('cards overlap'); }
  return out;
}
function judge(m) { const bad = []; m.runs.forEach(r => { const ratio = contrast(r.color, r.bg); if (ratio < 4.5 && r.op >= 0.99) bad.push(`contrast ${ratio.toFixed(2)} "${r.text}"`); }); m.overflow.forEach(o => bad.push('overflow ' + o)); m.outside.forEach(o => bad.push('outside canvas ' + o));
  m.colours.forEach(c => { if (!PALSET.has(c.c.join(','))) bad.push(`off-palette rgb(${c.c}) on ${c.who}`); }); m.svgCols.forEach(h => { if (/^#[0-9A-F]{6}$/.test(h) && !PALSET.has(hex2rgb(h).join(','))) bad.push('off-palette svg ' + h); if (/^VAR/.test(h)) bad.push('svg var colour ' + h); }); return bad; }

module.exports = { probe, judge, contrast, PALSET, hex2rgb };
