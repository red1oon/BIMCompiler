// ⚠ DO NOT REMOVE — Scope: the stage renderer. Stage.at(ft) paints the whole screen as a PURE FUNCTION of the film clock `ft` (seconds) and the data given to Stage.init(): nothing is timed by hand,
// nothing animates on its own. State = a fold over the trace events whose film time <= ft (plan from core.js). Read the recorder's §FILM_* log after every run.
(function () {
  'use strict';
  var C = window.Core, D = null, $ = function (id) { return document.getElementById(id); };
  var PIPEK = C.PIPEK, LOCALK = C.LOCALK;
  var LAYOUT = {
    pos: { cards: { A: { x: 24, y: 62, w: 440, h: 248, nm: 'Branch A', sb: 'the tills' }, B: { x: 24, y: 314, w: 440, h: 248, nm: 'Branch B', sb: 'the tills' },
        HUB: { x: 1456, y: 62, w: 440, h: 248, nm: 'HQ desk', sb: 'admin device' }, PH1: { x: 1456, y: 314, w: 440, h: 248, nm: 'Customer phone', sb: 'loyalty credit' },
        SHELF: { x: 690, y: 186, w: 540, h: 214, nm: 'The shelf', sb: 'stores named objects, reads none' }, MIRROR: { x: 690, y: 410, w: 540, h: 152, nm: 'Mailbox device', sb: 'blind copy of the shelf' } },
      dev: { A: [466, 200], B: [466, 440], HUB: [1454, 200], PH1: [1454, 440] }, sh: { A: [690, 240], B: [690, 340], HUB: [1230, 240], PH1: [1230, 340] }, shc: [960, 300], mir: [960, 480], mirror: true, cfgTitle: 'CONFIGURATION: the flow rows (flows.json), nothing else' },
    mf: { cards: { BOR1: { x: 24, y: 62, w: 440, h: 248, nm: 'Borrower 1', sb: 'phone, own gold' }, BOR2: { x: 24, y: 314, w: 440, h: 248, nm: 'Borrower 2', sb: 'phone, own gold' },
        HUB: { x: 1456, y: 62, w: 440, h: 248, nm: 'Shop desk', sb: 'admin device' }, PRICE: { x: 1456, y: 314, w: 440, h: 248, nm: 'Public gold price', sb: 'one value, everyone may read it' },
        SHELF: { x: 690, y: 186, w: 540, h: 376, nm: 'The shelf', sb: 'stores named objects, reads none' } },
      dev: { BOR1: [466, 200], BOR2: [466, 440], HUB: [1454, 200] }, sh: { BOR1: [690, 250], BOR2: [690, 450], HUB: [1230, 250] }, shc: [960, 370], mir: null, mirror: false, cfgTitle: 'CONFIGURATION: the flow rows (flows.json), nothing else' }
  };
  var DEVICES = { pos: ['A', 'B', 'PH1', 'HUB'], mf: ['BOR1', 'BOR2', 'HUB'] };
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function set(el, h) { if (el._h !== h) { el._h = h; el.innerHTML = h; } }
  function code(flow) { return String(flow).split(' ')[0]; }
  function suffix(flow) { var m = /\.(issued|applied)$/.exec(flow); return m ? m[1] : ''; }
  function short(name) { var m = /^o\/([^/]+)\/(.+?)\/(.*)\.([0-9a-f]{12})$/.exec(name); if (!m) return name; var f = m[2].split(' ')[0] + (suffix(m[2]) ? '.' + suffix(m[2]) : ''); return 'o/' + m[1] + '/' + f + '/' + m[3] + '.' + m[4]; }
  function nameOf(e) {
    if (e.kind === 'put') return short(e.name);
    if (e.kind === 'send') return 'd/' + e.to + '/' + code(e.flow) + '/' + e.key;
    if (e.kind === 'publish') return (e.audience === 'public' ? 'pub/' : 'seed/') + code(e.flow) + '/latest';
    return null;
  }
  function famOf(n) { return n.indexOf('o/') === 0 ? 'up' : n.indexOf('d/') === 0 ? 'dn' : 'sd'; }
  function valShort(v) { if (v === null || v === undefined) return 'nothing yet'; if (typeof v === 'object') return 'cashier list'; return typeof v === 'number' ? fmt(v) : String(v); }

  // ---------- init ----------
  var parts = [];
  function init(data) {
    D = data; parts = [];
    D.parts.forEach(function (p) {
      var T = p.trace, g = p.plan.ft.map(function (x) { return x + p.offset; }), sw = p.plan.sw;
      var beats = p.plan.beat.map(function (b) { return Object.assign({}, b, { start: b.start + p.offset, end: b.end + p.offset }); });
      var notes = (p.notes || []).map(function (n) { var b = beats.filter(function (x) { return x.id === n.beat; })[0]; var t = n.after !== undefined ? g[n.after] + 0.35 : b.start + n.atFrac * (b.end - b.start); return Object.assign({}, n, { t: t, bEnd: b.end, bStart: b.start }); });
      parts.push({ n: p.n, layout: LAYOUT[p.layout], key: p.layout, label: p.label, T: T, ft: g, sw: sw, beats: beats, notes: notes, cfgRows: p.cfgRows, axis: p.axis, start: p.offset, end: p.offset + p.plan.total, win: p.plan.win.map(function (w) { return Object.assign({}, w, { ftOn: w.ftOn + p.offset, ftOff: w.ftOff + p.offset }); }) });
    });
    buildCards(); return { parts: parts.length };
  }
  var curKey = null, cardEls = {};
  function buildCards() { }
  function ensureLayout(P) {
    if (curKey === P.key) return; curKey = P.key; cardEls = {}; var h = '', L = P.layout;
    Object.keys(L.cards).forEach(function (id) { var c = L.cards[id], dev = DEVICES[P.key].indexOf(id) !== -1;
      h += '<div class="card ' + (id === 'SHELF' ? 'shelf' : '') + '" id="c_' + id + '" style="left:' + c.x + 'px;top:' + c.y + 'px;width:' + c.w + 'px;height:' + c.h + 'px"><div class="hd"><span class="nm">' + c.nm + '</span><span class="sb">' + c.sb + '</span><span class="sp"></span>' +
        (dev ? '<span class="tag" id="tg_' + id + '" style="display:none">NO LINK</span><span class="badge off" id="bd_' + id + '" data-actor="' + id + '" data-off="1">OFFLINE</span>' : '<span class="tag" id="cnt_' + id + '" style="display:none;border-color:#334;color:#334"></span>') + '</div>' +
        '<div class="st" id="st_' + id + '"' + (id === 'SHELF' ? ' style="height:' + (c.h - 62) + 'px;margin-top:4px"' : id === 'MIRROR' || id === 'PRICE' ? ' style="height:' + (c.h - 62) + 'px;margin-top:4px"' : '') + '></div>' + (dev ? '<div class="lg" id="lg_' + id + '"></div>' : '') + '<div class="nt" id="nt_' + id + '"></div><div class="ribbon" id="rb_' + id + '"></div></div>'; });
    $('cards').innerHTML = h; Object.keys(L.cards).forEach(function (id) { cardEls[id] = $('c_' + id); });
  }

  // ---------- fold ----------
  function fold(P, n) {
    var S = { online: {}, link: {}, dead: {}, queue: {}, stock: {}, credit: { PH1: 0 }, codes: { A: [], B: [], PH1: [] }, inbox: {}, recs: {}, col: {}, over: {}, shelf: {}, mirror: {}, shelfOrder: [], shelfDead: false,
      logs: {}, fund: {}, pulls: {}, owing: {}, priceBoard: false, hubVisits: 0, price: null, clockT: n ? P.T[0].t : P.T[0].t, last: n ? P.T[n - 1] : null };
    var F = D.facts, T = P.T, mirror = P.layout.mirror;
    var lg = function (a, s) { (S.logs[a] = S.logs[a] || []).push(s); if (S.logs[a].length > 3) S.logs[a].shift(); };
    for (var i = 0; i < n; i++) {
      var e = T[i], a = e.actor, k = e.kind, c;
      if (k === 'online') S.online[a] = true; else if (k === 'offline') S.online[a] = false;
      else if (k === 'link-down') { S.link[a] = false; lg(a, 'link down'); } else if (k === 'link-up') { S.link[a] = true; lg(a, 'link back'); }
      else if (k === 'visit-failed') lg(a, 'visit failed: no link');
      else if (k === 'local-sale') { S.queue[a] = (S.queue[a] || 0) + 1; lg(a, 'sale x' + e.qty + (e.qty !== undefined ? '' : '')); }
      else if (k === 'local-stock') { S.stock[a] = e.qty; lg(a, 'stock count ' + e.qty); }
      else if (k === 'local-fund') { S.fund[a] = e; lg(a, 'fund = ' + e.grams + ' g x ' + fmt(e.price) + ' = ' + fmt(e.value)); }
      else if (k === 'earn' || k === 'redeem') { S.queue[a] = (S.queue[a] || 0) + 1; S.codes[a].push(e.id); lg(a, 'code ' + e.id + ' ' + (e.delta > 0 ? '+' : '') + e.delta); }
      else if (k === 'apply-code') { S.credit[a] = e.balance; S.queue[a] = (S.queue[a] || 0) + 1; S.codes[a].push(e.id); lg(a, 'scan ' + e.id + ' -> credit ' + e.balance); }
      else if (k === 'noop-code') lg(a, 'scan ' + e.id + ' again: nothing');
      else if (k === 'put') { S.queue[a] = Math.max(0, (S.queue[a] || 0) - 1); var nm = nameOf(e); if (!S.shelf[nm]) { S.shelf[nm] = i; S.shelfOrder.push(nm); } if (mirror && !S.mirror[nm]) S.mirror[nm] = i; lg(a, 'put ' + code(e.flow) + (suffix(e.flow) ? '.' + suffix(e.flow) : '') + ' ' + e.key.split('/').slice(-2).join('/')); }
      else if (k === 'recv') { S.inbox[a] = (S.inbox[a] || 0) + 1; if (/^F2/.test(e.flow)) S.stock[a] = /^MV\/INIT/.test(e.key) ? F.openStock : F.stockMeet; if (/^N1/.test(e.flow)) S.owing[a] = F.mfOwing; lg(a, 'recv ' + code(e.flow) + ' ' + e.key); }
      else if (k === 'pull') { if (e.got !== null && e.got !== undefined && /^S2/.test(e.flow)) { S.pulls[a] = e.got; S.price = e.got; } lg(a, 'pull ' + code(e.flow) + ' -> ' + valShort(e.got)); }
      else if (k === 'skip') lg(a, 'skip ' + code(e.flow) + ': already held');
      else if (k === 'send') { var n1 = nameOf(e); if (!S.shelf[n1]) { S.shelf[n1] = i; S.shelfOrder.push(n1); } if (mirror && !S.mirror[n1]) S.mirror[n1] = i; lg('HUB', 'send ' + code(e.flow) + ' -> ' + e.to); }
      else if (k === 'publish') { var n2 = nameOf(e); if (!S.shelf[n2]) { S.shelf[n2] = i; S.shelfOrder.push(n2); } if (mirror && !S.mirror[n2]) S.mirror[n2] = i; if (/^S2/.test(e.flow)) S.priceBoard = true; lg('HUB', 'publish ' + code(e.flow) + (e.audience === 'public' ? ' (public)' : '')); }
      else if (k === 'hub-visit') { if (!e.why) S.hubVisits++; lg('HUB', e.why ? 'visit to rebuild' : 'visit'); }
      else if (k === 'accept') { S.recs[e.flow + '|' + e.key] = 1; lg('HUB', 'accept ' + code(e.flow) + (suffix(e.flow) ? '.' + suffix(e.flow) : '') + ' ' + e.key.split('/').slice(-2).join('/')); }
      else if (k === 'duplicate') lg('HUB', 'duplicate ignored ' + e.key);
      else if (k === 'COLLISION') { S.col[e.key] = 1; lg('HUB', 'COLLISION ' + e.key); }
      else if (k === 'overspend' || k === 'FLAG') { S.over[e.account || 'x'] = 1; lg('HUB', 'OVERSPEND ' + e.account + ' ' + e.balance); }
      else if (k === 'fail') { if (a === 'PIPE') { S.shelfDead = true; S.shelf = {}; S.shelfOrder = []; } else { S.dead[a] = true; S.queue[a] = 0; if (a === 'HUB') S.recs = {}; if (a === 'A') { S.stock.A = null; } lg(a, a === 'HUB' ? 'ADMIN DEVICE LOST: state wiped' : 'DEVICE LOST, unsent ' + e.unsent); } }
      else if (k === 'restore') { S.dead[a] = false; S.stock[a] = F.stockAfter; lg(a, 'restored: own ' + e.own + ', addressed ' + e.down); }
      else if (k === 'rebuild') { S.dead[a] = false; lg(a, 'rebuilt: ' + e.records + ' records'); }
    }
    return S;
  }
  function interp(P, ft, n) {                      // trace clock: sits at the last fired event, sweeps to the next one just before it fires
    var T = P.T, t0 = T[0].t; if (!T.length) return t0;
    var cur = n ? T[n - 1].t : t0, nx = n < T.length ? n : -1; if (nx < 0) return cur;
    var d = P.sw[nx] || 0, t1 = T[nx].t; if (t1 === cur || d <= 0) return cur;
    var p = (ft - (P.ft[nx] - d)) / d; p = Math.max(0, Math.min(1, p)); return cur + (t1 - cur) * p;
  }
  function firedCount(P, ft) { var lo = 0, hi = P.T.length; while (lo < hi) { var m = (lo + hi) >> 1; if (P.ft[m] <= ft + 1e-9) lo = m + 1; else hi = m; } return lo; }

  // ---------- render ----------
  function render(ft) {
    var P = parts[0]; for (var q = 0; q < parts.length; q++) if (ft >= parts[q].start) P = parts[q];
    var beat = null; P.beats.forEach(function (b) { if (ft >= b.start - 1e-9 && ft < b.end - 1e-9) beat = b; }); if (!beat) beat = P.beats[P.beats.length - 1];
    var cardName = beat.card;
    var ov = $('ov');
    if (cardName) { ov.style.display = 'block'; set(ov, D.cards[cardName]); var fr = (ft - beat.start) / Math.max(0.001, beat.end - beat.start);
      ov.querySelectorAll('.rv').forEach(function (el) { var f = parseFloat(el.getAttribute('data-f') || '0'); el.style.visibility = fr + 1e-9 >= f ? 'visible' : 'hidden'; });
      return { part: P.n, beat: beat.id, fired: 0, card: cardName, clk: null, frac: fr }; }
    ov.style.display = 'none'; set(ov, '');
    ensureLayout(P);
    var n = firedCount(P, ft), S = fold(P, n), clk = interp(P, ft, n), L = P.layout, devs = DEVICES[P.key];
    var dt = new Date(clk), day = C.dayOf(clk), focus = beat.focusDay || 0, view = focus || day;
    $('part').textContent = P.label;
    $('clk').textContent = focus ? ('end of day ' + focus) : (dt.getUTCDate() + ' Oct ' + ('0' + dt.getUTCHours()).slice(-2) + ':' + ('0' + dt.getUTCMinutes()).slice(-2));
    $('day').textContent = 'DAY ' + (focus || day);
    // config panel
    var cfg = '<h4>' + L.cfgTitle + '</h4>' + P.cfgRows.map(function (r) { return '<div class="r">' + r + '</div>'; }).join('');
    set($('cfg'), cfg);
    // notes
    var noteBy = {}; P.notes.forEach(function (nt) { if (nt.t <= ft + 1e-9 && ft < nt.bEnd - 1e-9 && ft >= nt.bStart - 1e-9) { if (!noteBy[nt.card] || nt.t >= noteBy[nt.card].t) noteBy[nt.card] = nt; } });
    // device cards
    devs.forEach(function (id) {
      var el = cardEls[id], on = !!S.online[id], dead = !!S.dead[id], bd = $('bd_' + id);
      el.className = 'card' + (on ? ' on' : '') + (dead ? ' dead' : '');
      bd.className = 'badge ' + (on ? 'onl' : 'off'); bd.textContent = on ? 'ONLINE' : 'OFFLINE'; bd.setAttribute('data-off', on ? '0' : '1');
      $('tg_' + id).style.display = S.link[id] === false ? 'inline-block' : 'none';
      $('rb_' + id).textContent = id === 'HUB' ? 'ADMIN LOST' : 'DEVICE LOST';
      var q = S.queue[id] || 0, st = '';
      if (id === 'A') st = '<div>Stock (own count, advisory): <b>' + (S.stock.A === null || S.stock.A === undefined ? '—' : S.stock.A) + '</b></div><div>Waiting to send: <b>' + q + '</b></div><div><i>Codes issued: ' + (S.codes.A.join(', ') || 'none') + '</i></div>';
      else if (id === 'B') st = '<div>Inbox: <b>' + (S.inbox.B || 0) + '</b> objects</div><div>Waiting to send: <b>' + q + '</b></div><div><i>Codes issued: ' + (S.codes.B.join(', ') || 'none') + '</i></div>';
      else if (id === 'PH1') st = '<div>Credit on the phone: <b>' + S.credit.PH1 + '</b></div><div>Waiting to send: <b>' + q + '</b></div><div><i>Codes scanned: ' + (S.codes.PH1.join(', ') || 'none') + '</i></div>';
      else if (id === 'HUB') st = '<div>Records held: <b>' + Object.keys(S.recs).length + '</b></div><div>Flags: collision <b>' + Object.keys(S.col).length + '</b> · overspend <b>' + Object.keys(S.over).length + '</b></div><div><i>Visits so far: ' + S.hubVisits + '</i></div>';
      else if (id === 'BOR1') { var f = S.fund.BOR1; st = '<div>Gold ' + (f ? '<b>' + f.grams + ' g</b>' : '—') + ' · price ' + (S.pulls.BOR1 ? '<b>' + fmt(S.pulls.BOR1) + '</b>' : '—') + ' · fund ' + (f ? '<b>' + fmt(f.value) + '</b>' : '—') + '</div><div>Owing (from the shop): <b>' + (S.owing.BOR1 ? fmt(S.owing.BOR1) : '—') + '</b></div><div>Waiting to send: <b>' + q + '</b></div>'; }
      else if (id === 'BOR2') st = '<div>Price fetched: <b>' + (S.pulls.BOR2 ? fmt(S.pulls.BOR2) : '—') + '</b></div><div>Confirmations received: <b>' + (S.inbox.BOR2 || 0) + '</b></div><div>Waiting to send: <b>' + q + '</b></div>';
      set($('st_' + id), st);
      set($('lg_' + id), (S.logs[id] || []).map(function (s) { return '<div>' + esc(s) + '</div>'; }).join(''));
    });
    // notes into cards
    Object.keys(L.cards).forEach(function (id) { var nt = noteBy[id], el = $('nt_' + id); if (!el) return; if (nt) { el.className = 'nt ' + (nt.cls || 'n'); set(el, nt.html); } else { el.className = 'nt'; set(el, ''); } });
    // shelf
    var nS = Object.keys(S.shelf).length, so = S.shelfOrder.slice(-6), shEl = cardEls.SHELF;
    var shH;
    if (S.shelfDead) { shEl.className = 'card shelf dead'; shH = '<div class="big">SHELF LOST</div><div style="text-align:center;font:600 20px/1.3 Noto Sans;color:#7f1d1d;margin-top:10px">0 objects</div>'; }
    else { shEl.className = 'card shelf'; shH = '<div class="objs">' + so.map(function (nm) { var isNew = ft - P.ft[S.shelf[nm]] < 1.4; return '<div class="' + (isNew ? 'new' : '') + '"><span style="color:' + (famOf(nm) === 'up' ? '#2563eb' : famOf(nm) === 'dn' ? '#b45309' : '#15803d') + '">&#9679;</span> ' + esc(nm) + '</div>'; }).join('') + (nS > 6 ? '<div style="color:#52607a">… ' + (nS - 6) + ' earlier</div>' : '') + (nS === 0 ? '<div style="color:#52607a">(empty)</div>' : '') + '</div>'; }
    set($('st_SHELF'), shH); var cn = $('cnt_SHELF'); cn.style.display = 'inline-block'; cn.textContent = (S.shelfDead ? 0 : nS) + ' objects';
    if (L.mirror) { var nM = Object.keys(S.mirror).length, mo = Object.keys(S.mirror).sort(function (a, b) { return S.mirror[a] - S.mirror[b]; }).slice(-3); var mc = $('cnt_MIRROR'); mc.style.display = 'inline-block'; mc.textContent = nM + ' objects';
      set($('st_MIRROR'), '<div class="objs" style="font:500 13.5px/1.3 DejaVu Sans Mono;color:#445">' + mo.map(function (nm) { return '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(nm) + '</div>'; }).join('') + '</div>'); }
    // price board (MF)
    if (L.cards.PRICE) set($('st_PRICE'), S.priceBoard ? '<div style="font:800 54px/1.1 Noto Sans;color:#b45309;margin-top:8px">' + fmt(D.facts.price) + '</div><div>per gram (sample) · daily · public</div>' : '<div style="color:#52607a;margin-top:18px">not published yet</div>');
    // flights
    var fl = '', FL = C.FLIGHT, pt = function (a, b, p, cx, cy) { if (cx !== undefined) { var u = 1 - p; return [u * u * a[0] + 2 * u * p * cx + p * p * b[0], u * u * a[1] + 2 * u * p * cy + p * p * b[1]]; } return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]; };
    var ease = function (p) { return p * p * (3 - 2 * p); };
    var pill = function (a, b, p0, cls, txt, cx, cy) { var p = (ft - p0.t0) / p0.d; if (p < 0 || p > 1.18) return ''; var q = ease(Math.max(0, Math.min(1, p))), c = pt(a, b, q, cx, cy), op = p > 1 ? Math.max(0, 1 - (p - 1) / 0.18) : 1; return '<div class="pill ' + cls + '" style="left:' + Math.round(c[0] - 24) + 'px;top:' + Math.round(c[1] - 15) + 'px;opacity:' + op.toFixed(2) + '">' + esc(txt) + '</div>'; };
    var shelfPt = function (a) { return L.sh[a]; };
    for (var i = Math.max(0, n - 40); i < P.T.length; i++) {
      var e = P.T[i], t0 = P.ft[i]; if (t0 > ft) break; if (ft - t0 > FL + 0.6) continue; var a = e.actor, k = e.kind, lab = e.flow ? code(e.flow) + (suffix(e.flow) ? '.' + suffix(e.flow)[0] : '') : '';
      if (k === 'put' && L.dev[a]) fl += pill(L.dev[a], shelfPt(a), { t0: t0, d: FL }, 'up', lab);
      else if ((k === 'recv' || (k === 'pull' && e.got !== null && e.got !== undefined)) && L.dev[a]) fl += pill(shelfPt(a), L.dev[a], { t0: t0, d: FL }, k === 'pull' ? 'sd' : 'dn', lab);
      else if ((k === 'send' || k === 'publish') && a === 'HUB') fl += pill(L.dev.HUB, shelfPt('HUB'), { t0: t0, d: FL }, k === 'send' ? 'dn' : 'sd', lab);
      else if (k === 'accept') { var s0 = P.T.slice(0, i).some(function (x, j) { return x.kind === 'fail' && x.actor === 'PIPE'; }) && L.mirror ? L.mir : shelfPt('HUB'); fl += pill(s0, L.dev.HUB, { t0: t0, d: FL }, 'up', lab); }
      else if (k === 'apply-code' || k === 'noop-code') { var src = 'A'; for (var j = i - 1; j >= 0; j--) { var x = P.T[j]; if ((x.kind === 'earn' || x.kind === 'redeem') && x.id === e.id) { src = x.actor; break; } } if (L.dev[src] && L.dev[a]) fl += pill(L.dev[src], L.dev[a], { t0: t0, d: FL + 0.2 }, 'cd', 'code ' + e.id + (k === 'noop-code' ? ' (again)' : ''), 960, src === 'A' ? 120 : 592); }
      if ((k === 'put' || k === 'send' || k === 'publish') && L.mirror && !S.shelfDead) fl += pill(L.shc, L.mir, { t0: t0 + 0.4, d: 0.6 }, 'gh', 'copy');
    }
    set($('fly'), fl);
    // strip
    $('stripT').textContent = beat.title || ''; $('stripS').textContent = beat.src ? 'source: ' + beat.src : '';
    // lanes
    var ax = P.axis[view] || P.axis[1], h0 = ax[0], h1 = ax[1], dayStart = Date.UTC(2026, 9, 24 + view, 0, 0), X0 = 200, X1 = 1880;
    var xs = function (t) { return X0 + (t - dayStart - h0 * 3600000) / ((h1 - h0) * 3600000) * (X1 - X0); };
    var svg = '<rect x="0" y="0" width="1920" height="232" fill="#fffaf0"/>';
    for (var h = h0; h <= h1; h++) { var x = X0 + (h - h0) / (h1 - h0) * (X1 - X0); svg += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="216" stroke="#e3d8c6" stroke-width="1"/><text x="' + x + '" y="22" font-size="15" font-family="DejaVu Sans Mono" fill="#52607a" text-anchor="middle">' + ('0' + h).slice(-2) + ':00</text>'; }
    var lanes = [['ADMIN', 'HQ events', 36, '#14213d'], ['PIPE', 'objects crossing the shelf', 96, '#2563eb'], ['USER', 'local actions', 156, '#15803d']];
    var seen = {}, cnt = { local: 0, pipe: 0, hubVisits: 0, visits: 0 }, evDay = [];
    for (var m2 = 0; m2 < n; m2++) { var ee = P.T[m2]; if (C.dayOf(ee.t) !== view) continue; evDay.push(ee);
      var lane = -1, col = '#14213d';
      if (ee.actor === 'HUB' && ['accept', 'duplicate', 'send', 'publish', 'hub-visit'].indexOf(ee.kind) !== -1) { lane = 0; col = ee.kind === 'hub-visit' ? '#0f766e' : '#14213d'; }
      if (ee.actor === 'HUB' && ['COLLISION', 'FLAG', 'overspend'].indexOf(ee.kind) !== -1) { lane = 0; col = '#dc2626'; }
      if (ee.kind === 'fail' && ee.actor === 'HUB' || ee.kind === 'rebuild' && ee.actor === 'HUB') { lane = 0; col = ee.kind === 'fail' ? '#111' : '#0f766e'; }
      if (PIPEK.indexOf(ee.kind) !== -1) { lane = 1; col = ee.kind === 'put' ? '#2563eb' : (ee.kind === 'send' || ee.kind === 'publish') ? '#b45309' : '#15803d'; }
      if (LOCALK.indexOf(ee.kind) !== -1) { lane = 2; col = ee.kind === 'skip' ? '#9aa4b2' : (ee.kind === 'apply-code' || ee.kind === 'noop-code') ? '#7c3aed' : ee.kind === 'local-fund' ? '#0f766e' : '#15803d'; }
      if (lane >= 0) { var key = lane + ':' + ee.t, k2 = seen[key] = (seen[key] || 0) + 1, xx = xs(ee.t) + (k2 - 1) * 3.4, ly = lanes[lane][2]; svg += '<rect x="' + xx.toFixed(1) + '" y="' + (ly + 8) + '" width="2.8" height="' + (ee.kind === 'skip' ? 20 : 40) + '" fill="' + col + '"/>'; }
    }
    var A = C.activity(evDay); cnt = { local: A.local, pipe: A.pipe, hubVisits: A.hubVisits, visits: A.visits };
    lanes.forEach(function (l, li) { svg += '<rect x="24" y="' + l[2] + '" width="168" height="56" rx="8" fill="' + l[3] + '"/><text x="36" y="' + (l[2] + 24) + '" font-size="21" font-weight="800" font-family="Noto Sans" fill="#fff" letter-spacing="2">' + l[0] + '</text><text x="36" y="' + (l[2] + 44) + '" font-size="12.5" font-family="Noto Sans" fill="#dde">' + l[1] + '</text><line x1="' + X0 + '" y1="' + (l[2] + 28) + '" x2="' + X1 + '" y2="' + (l[2] + 28) + '" stroke="#d9cdb8" stroke-dasharray="2 5"/>'; });
    if (!focus && day === view && n > 0) { var cx = xs(clk); if (cx >= X0 && cx <= X1) svg += '<line x1="' + cx.toFixed(1) + '" y1="28" x2="' + cx.toFixed(1) + '" y2="218" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4"/>'; }
    set($('svg'), svg);
    var ghost = ''; if (!focus && day > 1 && P.key === 'pos') { var A1 = C.activity(P.T.filter(function (x) { return C.dayOf(x.t) === 1; })); ghost = 'Day 1: ' + A1.local + ' local · ' + A1.pipe + ' crossings · ' + A1.hubVisits + ' admin visits · ' + A1.visits + ' device visits'; }
    set($('ctr'), '<div class="cn l1"><div class="l">LOCAL ACTIONS</div><div class="v" id="v_local">' + cnt.local + '</div></div><div class="cn l2"><div class="l">PIPE CROSSINGS</div><div class="v" id="v_pipe">' + cnt.pipe + '</div></div>' +
      '<div class="cn l3"><div class="l">ADMIN VISITS</div><div class="v" id="v_hub">' + cnt.hubVisits + '</div></div><div class="cn l4"><div class="l">DEVICE VISITS</div><div class="v" id="v_dev">' + cnt.visits + '</div></div>' +
      '<div class="cn wide"><div class="l">THIS SAMPLE RUN, DAY ' + view + '</div><div class="v">local : crossings = ' + cnt.local + ' : ' + cnt.pipe + '</div><div class="g">' + esc(ghost) + '</div></div>');
    var fo = $('focus'); if (focus) { fo.style.display = 'block'; set(fo, 'WORKING DAY ' + focus + ' · HQ visited the shelf ' + cnt.hubVisits + ' times · the devices ' + cnt.visits + ' times · the branch and phone did ' + cnt.local + ' local actions (sample run)'); } else { fo.style.display = 'none'; }
    return { part: P.n, beat: beat.id, fired: n, card: null, ft: ft, clk: clk };
  }
  function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
  function at(ft) { var r = render(ft); r.hash = hashStr($('app').innerHTML) + ':' + $('app').innerHTML.length; return r; }
  // DOM witness: the label text and colour of every device card, read from the page itself
  function labels() {
    var out = {}; document.querySelectorAll('.badge[data-actor]').forEach(function (b) { var cs = getComputedStyle(b); out[b.getAttribute('data-actor')] = { text: b.textContent, off: b.getAttribute('data-off') === '1', bg: cs.backgroundColor, visible: b.offsetWidth > 0 && b.offsetHeight > 0 && getComputedStyle(b.parentNode.parentNode).display !== 'none' && $('ov').style.display !== 'block' }; }); return out;
  }
  function overflow() {                                       // layout witness: any text block whose content is larger than its box (clipped or ellipsised)
    var bad = []; document.querySelectorAll('#cards .st, #cards .nt, #cards .hd, #cfg, #stripT, #stripS, #ctr .cn, #focus').forEach(function (el) { if (el.offsetParent === null && el.id !== 'cfg') return; if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) bad.push((el.id || el.className) + ' ' + (el.parentNode.id || '') + ' sh=' + el.scrollHeight + '/' + el.clientHeight + ' sw=' + el.scrollWidth + '/' + el.clientWidth); });
    document.querySelectorAll('#cards .lg div, #cfg .r').forEach(function (el) { if (el.scrollWidth > el.clientWidth + 1) bad.push('trunc:' + el.textContent.slice(0, 40)); }); return bad; }
  function counters() { var g = function (id) { var e = $(id); return e ? +e.textContent : null; }; return { local: g('v_local'), pipe: g('v_pipe'), hub: g('v_hub'), dev: g('v_dev') }; }
  function peek(ft) { var P = parts[0]; for (var q = 0; q < parts.length; q++) if (ft >= parts[q].start) P = parts[q]; var n = firedCount(P, ft), S = fold(P, n); return { part: P.n, n: n, queue: S.queue, stock: S.stock, recs: Object.keys(S.recs).length, shelf: Object.keys(S.shelf).length, mirror: Object.keys(S.mirror).length, credit: S.credit.PH1, shelfDead: S.shelfDead }; }
  // ---- card witnesses (Film 2): what the DOM actually shows, read back by the recorder and compared with the verified claims / logo index ----
  function cardAudit() {
    var ov = $('ov'), out = { quotes: [], cites: [], imgs: [], text: ov.innerText, urls: [], vis: [] };
    ov.querySelectorAll('.q[data-claim]').forEach(function (e) { out.quotes.push({ id: e.getAttribute('data-claim'), text: e.textContent }); });
    ov.querySelectorAll('.cite[data-claim]').forEach(function (e) { out.cites.push({ id: e.getAttribute('data-claim'), pub: e.querySelector('.pub').textContent, ttl: e.querySelector('.ttl').textContent, dt: e.querySelector('.dt').textContent }); });
    ov.querySelectorAll('img.lg').forEach(function (i) { out.imgs.push({ slug: i.getAttribute('data-slug'), sha: i.getAttribute('data-sha'), src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, fit: getComputedStyle(i).objectFit, w: i.naturalWidth, h: i.naturalHeight, rw: Math.round(i.getBoundingClientRect().width), rh: Math.round(i.getBoundingClientRect().height) }); });
    ov.querySelectorAll('.sr[data-url]').forEach(function (e) { out.urls.push(e.getAttribute('data-url')); });
    ov.querySelectorAll('.rv').forEach(function (e) { out.vis.push(e.style.visibility); });
    return out;
  }
  function overflowCard() {                                   // layout witness for cards: text boxes larger than their box, and any text node outside the 1920x930 app area
    var bad = [], ov = $('ov'), W = 1920, H = 930;
    ov.querySelectorAll('*').forEach(function (el) {
      if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== 'visible' || el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && el.clientWidth > 0) bad.push('clip:' + (el.className || el.tagName) + ' ' + el.textContent.slice(0, 30));
      var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (own) { var r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > W - 8 || r.bottom > H - 4 || r.left < 8 || r.top < 0)) bad.push('out:' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' ' + el.textContent.slice(0, 30)); }
    });
    var bx = [].slice.call(ov.querySelectorAll('.blk,.ans,.card-rd,.term,.say,.bn,.tile,.lr,.sr,.rowflow,.chips,.leg,.mandl,.bul li,.fine,.fine2,h2.ct,.kick,.cap'));
    for (var i = 0; i < bx.length; i++) for (var j = i + 1; j < bx.length; j++) { var a = bx[i], b = bx[j]; if (a.contains(b) || b.contains(a)) continue; var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (ix > 2 && iy > 2) bad.push('overlap:' + (a.className || a.tagName) + ' x ' + (b.className || b.tagName) + ' ' + Math.round(ix) + 'x' + Math.round(iy) + ' ' + a.textContent.slice(0, 20) + ' | ' + b.textContent.slice(0, 20)); }
    var pg = ov.querySelector('.pg'); if (pg && pg.scrollHeight > H + 1) bad.push('page taller than the app area: ' + pg.scrollHeight);
    return bad;
  }
  function imagesReady() { return Promise.all([].map.call(document.images, function (i) { return i.complete ? 1 : new Promise(function (r) { i.onload = i.onerror = r; }); })); }
  window.Stage = { init: init, at: at, labels: labels, counters: counters, peek: peek, overflow: overflow, cardAudit: cardAudit, overflowCard: overflowCard, imagesReady: imagesReady };
})();
