// ⚠ DO NOT REMOVE — Scope: the renderer of stage6.html. Stage.at(ft) paints the whole screen as a PURE FUNCTION of the film clock `ft` (seconds) and the data of Stage.init({trace, beats}): state = a fold over the trace events whose film time <= ft.
// No network, no timers. The film time of event i is planned from its beat window (even spread, 0.9 s lead-in) — the recorder may pass `ft` per event instead (beats[].ft). Read the dry-run log after every run. Trace format: trace6.schema.json.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var D = null;
  var DEV = ['till', 'phone1', 'phone2', 'verifier', 'clerk', 'stock'];
  var LAYOUT = {                                                       // stH = height of the status block, lgN = log lines shown (a note replaces the log, 2 lines)
    till:     { x: 24,   y: 66,  w: 420, h: 154, nm: 'Till', sb: 'Unicenta-style · I_Order + I_Payment rows', stH: 26, lgN: 2 },
    phone1:   { x: 24,   y: 228, w: 420, h: 176, nm: 'Borrower phone 1', sb: 'its own loan only', stH: 52, lgN: 1 },
    phone2:   { x: 24,   y: 412, w: 420, h: 176, nm: 'Borrower phone 2', sb: 'its own loan only', stH: 52, lgN: 1 },
    relay:    { x: 640,  y: 66,  w: 640, h: 200, nm: 'The relay', sb: 'a dumb post box: carries, reads nothing', stH: 100, lgN: 0 },
    verifier: { x: 640,  y: 274, w: 640, h: 314, nm: 'Slip-verify service', sb: 'SlipOK is the sample; another provider = another row', stH: 102, lgN: 4 },
    clerk:    { x: 1476, y: 66,  w: 420, h: 180, nm: 'Head-office clerk', sb: 'role 102', stH: 52, lgN: 2 },
    stock:    { x: 1476, y: 254, w: 420, h: 164, nm: 'Stock role', sb: 'role 103', stH: 52, lgN: 1 }
  };
  var ANCH = { till: [444, 143], phone1: [444, 316], phone2: [444, 500], relayL: [640, 150], relayLm: [640, 215], relayR: [1280, 150], relayRm: [1280, 230], verL: [640, 400], verL2: [640, 470], clerk: [1476, 156], stock: [1476, 336], verifier: [640, 430] };
  var LANES = [['TILL', ['till'], 'var(--cy)'], ['PHONES', ['phone1', 'phone2'], 'var(--ye)'], ['SLIP SERVICE', ['verifier'], 'var(--ye)'], ['CLERK 102', ['clerk'], 'var(--gd)'], ['STOCK 103', ['stock'], 'var(--gd)'], ['RELAY', ['relay'], 'var(--cy)']];
  var KC = { send: '#4FC3F7', deliver: '#FAB219', local: '#C3C2B7', run: '#0CA30C', verify: '#FFEB3B', ack: '#FFEB3B', refuse: '#FF8C1A', note: '#C3C2B7' };
  var FL = 1.1;                                                        // seconds an envelope is in flight
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function set(el, h) { if (el._h !== h) { el._h = h; el.innerHTML = h; } }
  function hhmm(m) { var d = m >= 1440 ? 'next day ' : ''; m = Math.round(m) % 1440; return d + ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  var ev = [], ftOf = [], beatsById = {}, beatList = [];

  function init(data) {
    D = data; ev = D.trace.events;
    beatList = D.beats.map(function (b) { return Object.assign({}, b, { kind: b.kind || (b.card ? 'card' : 'stage'), tbeat: b.tbeat || b.id }); }); beatsById = {}; beatList.forEach(function (b) { beatsById[b.id] = b; });
    ftOf = new Array(ev.length);
    var per = {}; ev.forEach(function (e, i) { (per[e.beat] = per[e.beat] || []).push(i); });
    Object.keys(per).forEach(function (id) {                         // the events of one trace beat are spread evenly over the union of its stage windows (0.5 s margin at each end)
      var wins = beatList.filter(function (b) { return b.kind === 'stage' && b.tbeat === id; }).map(function (b) { return [b.start + 0.5, Math.max(b.start + 0.6, b.end - 0.5)]; });
      if (!wins.length) throw new Error('§STAGE_FAIL trace beat ' + id + ' has no stage window');
      var L = wins.reduce(function (s, w) { return s + (w[1] - w[0]); }, 0), idx = per[id], n = idx.length;
      idx.forEach(function (i, k) { if (ev[i].ft !== undefined) { ftOf[i] = ev[i].ft; return; } var p = (k + 0.5) * L / n, acc = 0; for (var q = 0; q < wins.length; q++) { var len = wins[q][1] - wins[q][0]; if (p <= acc + len + 1e-9 || q === wins.length - 1) { ftOf[i] = wins[q][0] + Math.min(len, p - acc); break; } acc += len; } });
    });
    buildCards(); window.__trace_status = D.trace.header.status;
    return { events: ev.length, status: D.trace.header.status };
  }
  var cardEls = {};
  function buildCards() {
    var h = '', ids = Object.keys(LAYOUT);
    ids.forEach(function (id) { var c = LAYOUT[id], A = (D.trace.actors.filter(function (a) { return a.id === id; })[0]) || {};
      h += '<div class="card" id="c_' + id + '" style="left:' + c.x + 'px;top:' + c.y + 'px;width:' + c.w + 'px;height:' + c.h + 'px"><div class="hd"><span class="nm">' + esc(A.name || c.nm) + '</span><span class="sp"></span>' +
        (id === 'relay' ? '<span class="badge rel" data-actor="relay" data-off="0">ALWAYS ON</span>' : '<span class="badge off" id="bd_' + id + '" data-actor="' + id + '" data-off="1">OFFLINE</span>') + '</div><div class="sb">' + esc(A.sub || c.sb) + '</div><div class="st" id="st_' + id + '" style="height:' + c.stH + 'px"></div>' +
        (c.lgN ? '<div class="lg" id="lg_' + id + '" style="height:' + (c.lgN * 19 + 8) + 'px"></div>' : '') + '<div class="nt" id="nt_' + id + '"></div></div>'; });
    h += '<div class="card" id="c_why" style="left:1476px;top:426px;width:420px;height:162px"><div class="hd"><span class="nm">Why the clock?</span></div><div class="st" style="font-size:18px;height:96px">The hours are a <b>sample day</b>: a schedule, not a measurement. Each activity has its own hour. <b>Real time is not needed.</b></div></div>';
    $('cards').innerHTML = h; ids.forEach(function (id) { cardEls[id] = $('c_' + id); });
  }

  // ---------- fold ----------
  function fold(n) {
    var S = { online: Object.assign({}, D.trace.header.initial_online || {}), queue: {}, inbox: {}, objects: 0, logs: {}, notes: {}, todo: {}, phoneMsg: {}, last: n ? ev[n - 1] : null, clock: D.trace.header.axis.from_min, runAt: {}, counts: { send: 0, deliver: 0, run: 0, refuse: 0 }, lastBeat: null };
    var lg = function (a, s) { (S.logs[a] = S.logs[a] || []).push(s); if (S.logs[a].length > 4) S.logs[a].shift(); };
    for (var i = 0; i < n; i++) {
      var e = ev[i], a = e.actor, k = e.kind; S.clock = e.t_min; S.lastBeat = e.beat;
      if (k === 'online') { S.online[a] = true; lg(a, 'online'); } else if (k === 'offline') { S.online[a] = false; lg(a, 'offline'); }
      else if (k === 'local') { S.queue[a] = Math.max(0, (S.queue[a] || 0) + (e.queue || 0)); lg(a, e.text || 'local'); if (e.todo === 'set') S.todo[a] = e.text || 'to-do'; if (e.todo === 'clear') S.todo[a] = null; if (e.slip) S.phoneMsg[a] = e.slip; }
      else if (k === 'send') { S.queue[a] = Math.max(0, (S.queue[a] || 0) - 1); S.objects++; S.counts.send++; lg(a, 'send ' + (e.label || '')); }
      else if (k === 'deliver') { S.inbox[a] = (S.inbox[a] || 0) + 1; S.counts.deliver++; lg(a, 'recv ' + (e.label || '')); }
      else if (k === 'verify') lg(a, 'verify ' + (e.label || ''));
      else if (k === 'ack') { lg(a, 'ack ' + (e.status || '') + ' ' + (e.label || '')); if (e.to) S.phoneMsg[e.to] = e.status === 'approved' ? 'received' : e.status === 'refused' ? 'refused' : 'unreached'; }
      else if (k === 'run') { S.counts.run++; S.runAt[a] = i; lg(a, (e.process || 'run') + (e.text ? ': ' + e.text : '')); }
      else if (k === 'refuse') { S.counts.refuse++; lg(a, 'refuse ' + (e.text || '')); S.notes[a] = { cls: e.cls || 'bad', text: e.text || 'refused' }; }
      else if (k === 'note') { S.notes[a] = { cls: e.cls || 'n', text: e.text || '' }; }
    }
    return S;
  }
  function fired(ft) { var c = 0; for (var i = 0; i < ev.length; i++) if (ftOf[i] <= ft + 1e-9) c = i + 1; return c; }
  function clockAt(ft, n, S) {                                       // stepped clock: sits at the last fired event, sweeps to the next one in the 0.6 s before it fires
    if (n >= ev.length) return S.clock; var t1 = ev[n].t_min, cur = n ? ev[n - 1].t_min : D.trace.header.axis.from_min; if (t1 < cur) return cur; var sw = 0.6, p = (ft - (ftOf[n] - sw)) / sw; p = Math.max(0, Math.min(1, p)); return cur + (t1 - cur) * p;
  }
  function beatAt(ft) { var b = beatList[0]; beatList.forEach(function (x) { if (ft >= x.start - 1e-9) b = x; }); return b; }
  function pt(a, b, p) { return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]; }
  function pill(a, b, t0, cls, txt, ft) { var p = (ft - t0) / FL; if (p < 0 || p > 1.2) return ''; var q = Math.max(0, Math.min(1, p)); q = q * q * (3 - 2 * q); var c = pt(a, b, q), op = p > 1 ? Math.max(0, 1 - (p - 1) / 0.2) : 1; return '<div class="pill ' + cls + '" style="left:' + Math.round(c[0] - 24) + 'px;top:' + Math.round(c[1] - 14) + 'px;opacity:' + op.toFixed(2) + '">' + esc(txt) + '</div>'; }
  function relayAnchor(actor, side) { return actor === 'till' ? ANCH.relayL : actor === 'phone1' || actor === 'phone2' ? ANCH.relayLm : actor === 'clerk' ? ANCH.relayR : ANCH.relayRm; }
  function devAnchor(a) { return ANCH[a]; }

  // ---------- render ----------
  function render(ft) {
    var H = D.trace.header, n = fired(ft), S = fold(n), clk = clockAt(ft, n, S), b = beatAt(ft);
    var ov = $('ov'); if (b.kind === 'card') { ov.style.display = 'block'; set(ov, D.cards && D.cards[b.card] || ''); } else if (b.kind === 'html') { ov.style.display = 'block'; set(ov, b.html || ''); } else { ov.style.display = 'none'; set(ov, ''); }
    $('wm').style.display = H.status === 'REAL' ? 'none' : 'flex'; $('draft').style.display = H.status === 'REAL' ? 'none' : 'inline-block';
    var tb = D.trace.header.beats.filter(function (x) { return x.id === S.lastBeat; })[0]; $('part').textContent = b.title || (tb && tb.title) || ''; $('clk').textContent = H.sample_day_label + ' · ' + hhmm(clk);
    // device cards
    DEV.forEach(function (id) {
      var el = cardEls[id], on = !!S.online[id], bd = $('bd_' + id), running = S.runAt[id] !== undefined && ft - ftOf[S.runAt[id]] < 1.6;
      el.className = 'card' + (on ? ' on' : ' off') + (running ? ' run' : '');
      bd.className = 'badge ' + (on ? 'onl' : 'off'); bd.textContent = on ? 'ONLINE' : 'OFFLINE'; bd.setAttribute('data-off', on ? '0' : '1');
      var q = S.queue[id] || 0, st = '';
      if (id === 'till') st = '<div>Waiting to send: <b>' + q + '</b> · Inbox: <b>' + (S.inbox.till || 0) + '</b></div>';
      else if (id === 'phone1' || id === 'phone2') st = '<div>Waiting: <b>' + q + '</b> · Inbox: <b>' + (S.inbox[id] || 0) + '</b>' + (S.phoneMsg[id] ? ' · slip: <b>' + esc(S.phoneMsg[id]) + '</b>' : '') + '</div><div>' + (S.todo[id] ? '<span class="todo">TO-DO</span>' + esc(S.todo[id]) : '<i>no to-do</i>') + '</div>';
      else if (id === 'verifier') st = '<div>Reachable: <b>' + (on ? 'yes' : 'no') + '</b></div><div><i>The phone asks it; head office never does. A refusal carries the service\'s own message.</i></div>';
      else if (id === 'clerk') st = '<div>Processes run: <b>' + (S.counts.run) + '</b></div><div><i>Legacy windows and processes, by role</i></div>';
      else if (id === 'stock') st = '<div>Inbox: <b>' + (S.inbox.stock || 0) + '</b></div><div><i>Replenish Report, then the movement</i></div>';
      set($('st_' + id), st); var lgEl = $('lg_' + id); if (lgEl) { var N = LAYOUT[id].lgN; set(lgEl, S.notes[id] ? '' : (S.logs[id] || []).slice(-N).map(function (s) { return '<div>' + esc(s) + '</div>'; }).join('')); lgEl.style.display = S.notes[id] ? 'none' : 'block'; }
    });
    set($('st_relay'), '<div>Objects on the shelf: <b>' + S.objects + '</b></div><div><i>Event data only travels: order lines and pay lines up, the movement back. Nothing is posted here.</i></div>');
    Object.keys(LAYOUT).forEach(function (id) { var nt = S.notes[id], el = $('nt_' + id); if (!el) return; if (nt) { el.className = 'nt ' + nt.cls; set(el, esc(nt.text)); el.style.height = (LAYOUT[id].lgN ? Math.max(LAYOUT[id].lgN * 19 + 8, 42) : 0) + 'px'; } else { el.className = 'nt'; set(el, ''); el.removeAttribute('style'); } });
    // envelopes
    var fl = '';
    for (var i = Math.max(0, n - 30); i < ev.length; i++) {
      var e = ev[i], t0 = ftOf[i]; if (t0 > ft) break; if (ft - t0 > FL + 0.4) continue; var a = e.actor, k = e.kind;
      if (k === 'send') fl += pill(devAnchor(a), relayAnchor(a), t0, 'up', e.label || 'rows', ft);
      else if (k === 'deliver') fl += pill(relayAnchor(a), devAnchor(a), t0, 'dn', e.label || 'rows', ft);
      else if (k === 'verify') fl += pill(devAnchor(a), a === 'phone1' ? ANCH.verL : ANCH.verL2, t0, 'vf', e.label || 'slip', ft);
      else if (k === 'ack') { var to = e.to || 'phone1'; fl += pill(to === 'phone1' ? ANCH.verL : ANCH.verL2, devAnchor(to), t0, e.status === 'approved' ? 'dn' : 'bad', (e.status || 'ack'), ft); }
    }
    set($('fly'), fl);
    $('stripT').textContent = b.title || ''; $('stripS').textContent = b.src ? 'source: ' + b.src : '';
    // lower timeline panel
    var ax = H.axis, h0 = Math.floor(ax.from_min / 60), h1 = Math.ceil(ax.to_min / 60), X0 = 200, X1 = 1880, xs = function (m) { return X0 + (m - h0 * 60) / ((h1 - h0) * 60) * (X1 - X0); };
    var svg = '<rect x="0" y="0" width="1920" height="296" fill="#080A0E"/>';
    for (var h = h0; h <= h1; h++) { var x = xs(h * 60); svg += '<line x1="' + x.toFixed(1) + '" y1="34" x2="' + x.toFixed(1) + '" y2="248" stroke="#1A1A19" stroke-width="2"/><text x="' + x.toFixed(1) + '" y="24" font-size="15" font-family="DejaVu Sans Mono" fill="#C3C2B7" text-anchor="middle">' + ('0' + (h % 24)).slice(-2) + ':00</text>'; }
    if (ax.to_min > 1440) { var xd = xs(1440); svg += '<line x1="' + xd.toFixed(1) + '" y1="30" x2="' + xd.toFixed(1) + '" y2="250" stroke="#4FC3F7" stroke-width="3" stroke-dasharray="8 6"/><text x="' + (xd + 8).toFixed(1) + '" y="46" font-size="15" font-family="Noto Sans" font-weight="700" fill="#4FC3F7">next morning</text>'; }
    LANES.forEach(function (L, li) {
      var y = 40 + li * 34; svg += '<rect x="24" y="' + y + '" width="168" height="30" rx="7" fill="#1A1A19" stroke="#6B6A63" stroke-width="2"/><text x="36" y="' + (y + 21) + '" font-size="16" font-weight="800" font-family="Noto Sans" fill="#FFFFFF" letter-spacing="1">' + L[0] + '</text>';
      svg += '<line x1="' + X0 + '" y1="' + (y + 16) + '" x2="' + X1 + '" y2="' + (y + 16) + '" stroke="#1A1A19" stroke-width="2"/>';
    });
    // offline spans (orange), per actor of the lane; open span runs to the current clock
    LANES.forEach(function (L, li) { var y = 40 + li * 34; L[1].forEach(function (act) { var start = null, state = !!(H.initial_online || {})[act];
      if (!state && (H.initial_online || {})[act] === false) start = ax.from_min;
      for (var i = 0; i < n; i++) { var e = ev[i]; if (e.actor !== act) continue; if (e.kind === 'offline') { if (start === null) start = e.t_min; } else if (e.kind === 'online') { if (start !== null) { svg += '<rect x="' + xs(start).toFixed(1) + '" y="' + (y + 4) + '" width="' + Math.max(2, xs(e.t_min) - xs(start)).toFixed(1) + '" height="22" fill="#FF8C1A" fill-opacity="0.45" stroke="#FF8C1A" stroke-width="1"/>'; start = null; } } }
      if (start !== null && L[0] !== 'RELAY') svg += '<rect x="' + xs(start).toFixed(1) + '" y="' + (y + 4) + '" width="' + Math.max(2, xs(Math.min(clk, ax.to_min)) - xs(start)).toFixed(1) + '" height="22" fill="#FF8C1A" fill-opacity="0.45" stroke="#FF8C1A" stroke-width="1"/>'; }); });
    var ticks = 0;
    for (var m2 = 0; m2 < n; m2++) { var ee = ev[m2], li2 = -1; LANES.forEach(function (L, li) { if (L[1].indexOf(ee.actor) >= 0) li2 = li; }); if (li2 < 0 || ee.kind === 'note' || ee.kind === 'online' || ee.kind === 'offline') continue;
      var y2 = 40 + li2 * 34, xx = xs(ee.t_min); svg += '<rect class="tk" x="' + xx.toFixed(1) + '" y="' + (y2 + 3) + '" width="4" height="26" fill="' + (KC[ee.kind] || '#C3C2B7') + '"/>'; ticks++; }
    if (clk >= ax.from_min && clk <= ax.to_min) { var cx = xs(clk); svg += '<line x1="' + cx.toFixed(1) + '" y1="30" x2="' + cx.toFixed(1) + '" y2="250" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 4"/>'; }
    svg += '<text x="24" y="272" font-size="18" font-family="Noto Sans" fill="#FFEB3B" font-weight="700">' + esc('Sample day: each activity at its own hour. Offline stretches (orange) are normal work, not an outage. Real time is not needed.') + '</text>';
    svg += '<text x="24" y="290" font-size="14" font-family="DejaVu Sans Mono" fill="#C3C2B7">' + esc('ticks: up cyan · down amber · local grey · run green · verify yellow · refuse orange | sent ' + S.counts.send + ' delivered ' + S.counts.deliver + ' run ' + S.counts.run + ' refused ' + S.counts.refuse) + '</text>';
    set($('svg'), svg);
    return { beat: b.id, fired: n, card: b.kind !== 'stage' ? (b.card || b.id) : null, clk: clk, ft: ft, ticks: ticks };
  }
  function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
  function at(ft) { var r = render(ft); r.hash = hashStr($('app').innerHTML) + ':' + $('app').innerHTML.length; return r; }
  function labels() { var out = {}; document.querySelectorAll('.badge[data-actor]').forEach(function (bd) { out[bd.getAttribute('data-actor')] = { text: bd.textContent, off: bd.getAttribute('data-off') === '1' }; }); return out; }
  function counters() { return { objects: +(($('st_relay').textContent.match(/shelf: (\d+)/) || [0, -1])[1]), ticks: document.querySelectorAll('#svg rect.tk').length, pills: document.querySelectorAll('#fly .pill').length }; }
  function expectedOnline(ft) { var n = fired(ft), on = Object.assign({}, D.trace.header.initial_online || {}); for (var i = 0; i < n; i++) { if (ev[i].kind === 'online') on[ev[i].actor] = true; if (ev[i].kind === 'offline') on[ev[i].actor] = false; } return on; }
  function ftTable() { return ftOf.slice(); }
  window.Stage = { init: init, at: at, labels: labels, counters: counters, expectedOnline: expectedOnline, ftTable: ftTable, status: function () { return D.trace.header.status; } };
})();
