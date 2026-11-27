// ⚠ DO NOT REMOVE — Scope: the CARD page driver of Film 5. Stage.at(ft) paints the full-screen card of the beat that contains the film clock `ft` (a pure function of ft). Elements marked .rv appear when the fraction of the beat elapsed
// reaches data-f and (optionally) disappear at data-u. Chapter and title cards fade in over the first 0.5 s and out over the last 0.5 s of their beat (the Civil Works card style: 0.5 s fades). overflowCard()/cardAudit() are the
// witnesses the recorder reads back. Adapted from film2/stage4.js (not edited there).
(function () {
  'use strict';
  var D = null, $ = function (id) { return document.getElementById(id); }, beats = [];
  function set(el, h) { if (el._h !== h) { el._h = h; el.innerHTML = h; } }
  function init(data) { D = data; beats = data.beats; return { beats: beats.length }; }
  function pickBeat(ft) {
    var b = null; beats.forEach(function (x) { if (ft >= x.start - 1e-9 && ft < x.end - 1e-9) b = x; });
    return b || beats[beats.length - 1];
  }
  function render(ft) {
    var beat = pickBeat(ft), ov = $('ov'); set(ov, D.cards[beat.card]);
    var fr = (ft - beat.start) / Math.max(0.001, beat.end - beat.start), lt = ft - beat.start, op = 1;
    if (D.fade && D.fade[beat.card]) { op = Math.min(1, lt / 0.5, (beat.end - ft) / 0.5); op = Math.max(0, Math.round(op * 24) / 24); if (beat.card === D.last) op = Math.min(1, lt / 0.5); }
    ov.style.opacity = String(op);
    ov.querySelectorAll('.rv').forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-f') || '0'), u = el.hasAttribute('data-u') ? parseFloat(el.getAttribute('data-u')) : 99;
      el.style.visibility = (fr + 1e-9 >= f && fr < u - 1e-9) ? 'visible' : 'hidden';
    });
    return { beat: beat.id, card: beat.card, frac: fr, opacity: op };
  }
  function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
  function at(ft) {
    var r = render(ft), vis = ''; $('ov').querySelectorAll('.rv').forEach(function (e) { vis += e.style.visibility === 'visible' ? '1' : '0'; });
    r.hash = hashStr($('app').innerHTML) + ':' + $('app').innerHTML.length + ':' + vis + ':' + r.opacity; return r;
  }
  function visibleText() { var ov = $('ov'), out = []; ov.querySelectorAll('*').forEach(function (e) { if (e.style.visibility === 'hidden') return; var own = Array.prototype.filter.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); }).map(function (n) { return n.textContent.trim(); }).join(' '); if (own) { var hid = false, p = e; while (p && p !== ov) { if (p.style && p.style.visibility === 'hidden') { hid = true; break; } p = p.parentNode; } if (!hid) out.push(own); } }); return out; }
  function cardAudit() {
    var ov = $('ov'), out = { text: ov.innerText, fullText: (function () { var w = document.createTreeWalker(ov, NodeFilter.SHOW_TEXT, null), n, a = []; while ((n = w.nextNode())) { var p = n.parentNode, skip = false; while (p && p !== ov) { if ((p.classList && p.classList.contains('src')) || (p.hasAttribute && p.hasAttribute('data-ref'))) { skip = true; break; } p = p.parentNode; } if (!skip && n.textContent.trim()) a.push(n.textContent.trim()); } return a.join(' | '); })(), srcText: (function () { var e = ov.querySelector('.src'); return e ? e.textContent : ''; })(), vis: [], tokens: visibleText(), colors: [], hiddenAtEnd: 0, palette: {} };
    ov.querySelectorAll('.rv').forEach(function (e) { if (e.style.visibility === 'hidden' && !e.hasAttribute('data-u')) out.hiddenAtEnd++; });
    ov.querySelectorAll('*').forEach(function (e) { var cs = getComputedStyle(e); [cs.color, cs.backgroundColor].forEach(function (c) { if (c && c !== 'rgba(0, 0, 0, 0)') out.palette[c] = (out.palette[c] || 0) + 1; });
      ['Top', 'Left'].forEach(function (sd) { if (parseFloat(cs['border' + sd + 'Width']) > 0 && cs['border' + sd + 'Style'] !== 'none') { var c = cs['border' + sd + 'Color']; out.palette[c] = (out.palette[c] || 0) + 1; } }); });
    ov.querySelectorAll('.rv').forEach(function (e) { out.vis.push(e.style.visibility); });
    ov.querySelectorAll('*').forEach(function (e) { var own = Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); }); if (own) { var cs = getComputedStyle(e), bg = null, p = e; while (p) { var b = getComputedStyle(p).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; } p = p.parentElement; } out.colors.push({ t: e.textContent.trim().slice(0, 40), c: cs.color, bg: bg || 'rgb(8, 10, 14)', px: parseFloat(cs.fontSize), w: parseInt(cs.fontWeight, 10) }); } });
    return out;
  }
  function overflowCard() {                                   // layout witness: clipped boxes, text outside the 1920x930 area, overlapping boxes
    var bad = [], ov = $('ov'), W = 1920, H = 930;
    ov.querySelectorAll('*').forEach(function (el) {
      var cs = getComputedStyle(el); if (cs.visibility === 'hidden') return;
      var hid = false, p = el; while (p && p !== ov) { if (p.style && p.style.visibility === 'hidden') { hid = true; break; } p = p.parentNode; } if (hid) return;
      if ((el.scrollHeight > el.clientHeight + 1 && cs.overflow !== 'visible') || (el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible' && el.clientWidth > 0)) bad.push('clip:' + (el.className || el.tagName) + ' ' + el.textContent.slice(0, 30));
      var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (own) { var r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > W - 40 || r.bottom > H - 4 || r.left < 40 || r.top < 0)) bad.push('out:' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' ' + el.textContent.slice(0, 30)); }
      if (own && el.children.length === 0 && cs.display.indexOf('inline') < 0 && el.scrollWidth > el.clientWidth + 1) bad.push('textwide:' + el.textContent.slice(0, 30));
    });
    [].slice.call(ov.querySelectorAll('.bx')).forEach(function (b) { var hid0 = false, p0 = b; while (p0 && p0 !== ov) { if (p0.style && p0.style.visibility === 'hidden') { hid0 = true; break; } p0 = p0.parentNode; } if (hid0) return; var rb = b.getBoundingClientRect();
      [].slice.call(b.querySelectorAll('*')).forEach(function (d) { var h2 = false, q = d; while (q && q !== b) { if (q.style && q.style.visibility === 'hidden') { h2 = true; break; } q = q.parentNode; } if (h2) return; var rd = d.getBoundingClientRect(); if (rd.width === 0 || rd.height === 0) return; if (rd.bottom > rb.bottom + 1 || rd.right > rb.right + 1 || rd.left < rb.left - 1) bad.push('spill:' + Math.round(rd.right - rb.right) + 'x' + Math.round(rd.bottom - rb.bottom) + ' ' + d.textContent.slice(0, 40)); }); });
    var bx = [].slice.call(ov.querySelectorAll('.bx,.chip,.bar,.big,.k0,.src,.lead,h2.ct,.tag,.ser,.cardblk')).filter(function (e) { var p = e; while (p && p !== ov) { if (p.style && p.style.visibility === 'hidden') return false; p = p.parentNode; } return true; });
    for (var i = 0; i < bx.length; i++) for (var j = i + 1; j < bx.length; j++) { var a = bx[i], b = bx[j]; if (a.contains(b) || b.contains(a)) continue; var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (ix > 2 && iy > 2) bad.push('overlap:' + (a.className || a.tagName) + ' x ' + (b.className || b.tagName) + ' ' + Math.round(ix) + 'x' + Math.round(iy) + ' ' + a.textContent.slice(0, 20) + ' | ' + b.textContent.slice(0, 20)); }
    return bad;
  }
  window.Stage = { init: init, at: at, cardAudit: cardAudit, overflowCard: overflowCard };
})();
