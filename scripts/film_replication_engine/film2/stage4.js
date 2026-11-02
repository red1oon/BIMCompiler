// ⚠ DO NOT REMOVE — Scope: the CARD page of Film 2 v2. Stage.at(ft) paints the full-screen card of the beat that contains the film clock `ft` (a pure function of ft; nothing animates on its own); elements marked .rv appear when the
// fraction of the beat elapsed reaches their data-f. cardAudit() / overflowCard() are the witnesses read back by the recorder. No trace, no stage, no OFFLINE label: Film 2 v2 has no replayed day.
(function () {
  'use strict';
  var D = null, $ = function (id) { return document.getElementById(id); }, parts = [];
  function set(el, h) { if (el._h !== h) { el._h = h; el.innerHTML = h; } }
  function init(data) { D = data; parts = data.parts; return { parts: parts.length }; }
  function render(ft) {
    var beat = null; parts.forEach(function (p) { p.beats.forEach(function (b) { if (ft >= b.start + p.offset - 1e-9 && ft < b.end + p.offset - 1e-9) beat = { id: b.id, card: b.card, start: b.start + p.offset, end: b.end + p.offset }; }); });
    if (!beat) { var lp = parts[parts.length - 1], lb = lp.beats[lp.beats.length - 1]; beat = { id: lb.id, card: lb.card, start: lb.start + lp.offset, end: lb.end + lp.offset }; }
    var ov = $('ov'); ov.style.display = 'block'; set(ov, D.cards[beat.card]); var fr = (ft - beat.start) / Math.max(0.001, beat.end - beat.start);
    ov.querySelectorAll('.rv').forEach(function (el) { var f = parseFloat(el.getAttribute('data-f') || '0'); el.style.visibility = fr + 1e-9 >= f ? 'visible' : 'hidden'; });
    return { beat: beat.id, card: beat.card, frac: fr };
  }
  function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
  function at(ft) { var r = render(ft); r.hash = hashStr($('app').innerHTML) + ':' + $('app').innerHTML.length; return r; }
  function cardAudit() {
    var ov = $('ov'), out = { quotes: [], cites: [], imgs: [], text: ov.innerText, urls: [], vis: [] };
    var cl = ov.cloneNode(true); cl.style.cssText = 'position:absolute;left:-9999px;top:0;width:1920px'; var codes = [].slice.call(cl.querySelectorAll('.term.code')); out.codeText = codes.map(function (c) { return c.textContent; }).join('\n'); document.body.appendChild(cl);
    codes.forEach(function (c) { c.parentNode.removeChild(c); }); out.textNoCode = cl.innerText; document.body.removeChild(cl);
    ov.querySelectorAll('.q[data-claim]').forEach(function (e) { out.quotes.push({ id: e.getAttribute('data-claim'), text: e.textContent }); });
    ov.querySelectorAll('.cite[data-claim]').forEach(function (e) { out.cites.push({ id: e.getAttribute('data-claim'), pub: e.querySelector('.pub').textContent, ttl: e.querySelector('.ttl').textContent, dt: e.querySelector('.dt').textContent }); });
    ov.querySelectorAll('img.lg').forEach(function (i) { out.imgs.push({ slug: i.getAttribute('data-slug'), sha: i.getAttribute('data-sha'), src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, fit: getComputedStyle(i).objectFit, w: i.naturalWidth, h: i.naturalHeight, rw: Math.round(i.getBoundingClientRect().width), rh: Math.round(i.getBoundingClientRect().height) }); });
    ov.querySelectorAll('.sr[data-url]').forEach(function (e) { out.urls.push(e.getAttribute('data-url')); });
    ov.querySelectorAll('.rv').forEach(function (e) { out.vis.push(e.style.visibility); });
    return out;
  }
  function overflowCard() {                                   // layout witness for cards: clipped boxes, text outside the 1920x930 area, overlapping boxes
    var bad = [], ov = $('ov'), W = 1920, H = 930;
    ov.querySelectorAll('*').forEach(function (el) {
      var cs = getComputedStyle(el);
      if ((el.scrollHeight > el.clientHeight + 1 && cs.overflow !== 'visible') || (el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible' && el.clientWidth > 0)) bad.push('clip:' + (el.className || el.tagName) + ' ' + el.textContent.slice(0, 30));
      var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (own) { var r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > W - 8 || r.bottom > H - 4 || r.left < 8 || r.top < 0)) bad.push('out:' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' ' + el.textContent.slice(0, 30)); }
    });
    var bx = [].slice.call(ov.querySelectorAll('.blk,.ans,.card-rd,.term,.say,.bn,.tile,.lr,.sr,.rowflow,.chips,.leg,.mandl,.bul li,.fine,.fine2,h2.ct,.kick,.cap,.bx2,.er,.ptr'));
    for (var i = 0; i < bx.length; i++) for (var j = i + 1; j < bx.length; j++) { var a = bx[i], b = bx[j]; if (a.contains(b) || b.contains(a)) continue; var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (ix > 2 && iy > 2) bad.push('overlap:' + (a.className || a.tagName) + ' x ' + (b.className || b.tagName) + ' ' + Math.round(ix) + 'x' + Math.round(iy) + ' ' + a.textContent.slice(0, 20) + ' | ' + b.textContent.slice(0, 20)); }
    var pg = ov.querySelector('.pg'); if (pg && pg.scrollHeight > H + 1) bad.push('page taller than the app area: ' + pg.scrollHeight);
    return bad;
  }
  function imagesReady() { return Promise.all([].map.call(document.images, function (i) { return i.complete ? 1 : new Promise(function (r) { i.onload = i.onerror = r; }); })); }
  window.Stage = { init: init, at: at, cardAudit: cardAudit, overflowCard: overflowCard, imagesReady: imagesReady };
})();
