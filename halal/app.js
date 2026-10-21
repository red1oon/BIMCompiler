// ⚠ DO NOT REMOVE — UI for HALAL_TRACE_SPEC.md §7. Rules/data come only from HT (data.js). Witness: tools/witness_ui.js. English first.
'use strict';
const I = {
  check: '<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  warn: '<path d="M12 4l9 16H3z M12 10v5 M12 17.5v.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  scan: '<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  route: '<circle cx="6" cy="6" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 6h6a4 4 0 010 8h-4a4 4 0 000 4h6" fill="none" stroke="currentColor" stroke-width="2"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5 M12 13v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  snow: '<path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  search: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  doc: '<path d="M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  vet: '<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  cust: '<path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-6h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  recall: '<path d="M4 12a8 8 0 108-8M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
};
const ic = (k, c) => `<svg viewBox="0 0 24 24"${c ? ' class="' + c + '"' : ''}>${I[k]}</svg>`;
if (window.__filmband) document.documentElement.classList.add('film');
I18N.init();
const St = { mode: 'landing', view: 'scan', hand: 'A', scanning: false, cur: null, open: null, cview: 'dash', cont: 1, trace: null, recall: null, wres: null, card: null, tl: 0, tcode: '' };
const $ = s => document.querySelector(s); const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const num = n => Number(n).toLocaleString('en-US');
const handPack = id => HT.lots[id];
const handIndex = id => (id === 'A' ? 1203 : id === 'B' ? 17 : id === 'C' ? 301 : 88);
function qrSvg(url) { const q = qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag(4, 0); }

function topbar() {
  const m = [['landing', 'home', 'Home'], ['shopper', 'scan', 'Shopper'], ['worker', 'box', 'Dock'], ['console', 'users', 'Console']];
  return `<div class="top"><div class="brand" data-mode="landing" style="cursor:pointer">${ic('shield')}<span>Halalan Thayiban</span></div><div class="modes">${m.map(([k, i, l]) => `<button data-mode="${k}" class="${St.mode === k ? 'on' : ''}">${ic(i)}<small>${l}</small></button>`).join('')}</div><div class="sp"></div><a class="lg man" href="manuals/" target="_blank" rel="noopener" title="${({ en: 'Manual', th: 'คู่มือ', ms: 'Panduan', ar: 'دليل', zh: '手册' })[I18N.lang]}">${ic('book')}</a><label class="lg">${ic('globe')}<select id="lang">${['en', 'th', 'ms', 'ar', 'zh'].map(l => `<option value="${l}" ${I18N.lang === l ? 'selected' : ''}>${I18N.NAMES[l][0]}</option>`).join('')}</select></label></div>`;
}
/* ---------- shopper phone ---------- */
function shopperScreen() {
  const v = St.view; const L = St.cur ? St.cur.L : null;
  if (v === 'scan') {
    const hp = handPack(St.hand), url = HT.packUrl(hp, handIndex(St.hand));
    return `<div class="vf"><div class="cam"><div class="pack ${hp.cls === 'halal' ? '' : 'conv'}"><h4>Rio Verde</h4><h3>${esc(hp.product)}</h3><div class="qr">${qrSvg(url)}</div><small>GTIN ${hp.gtin} · LOT ${hp.lot}<br>SERIAL ${HT.serialStr(handIndex(St.hand))}</small></div><div class="bracket"></div>${St.scanning ? '<div class="sweep"></div>' : ''}</div>
    <div class="ctl"><p>${St.scanning ? 'Reading the code…' : 'Point the camera at the QR code on the pack'}</p><button class="shutter" data-act="scan" aria-label="Scan"></button>
    <div class="picks">${['A', 'B', 'C', 'P'].map(k => `<button data-hand="${k}" class="${St.hand === k ? 'on' : ''}">${esc(HT.lots[k].product.replace('Frozen ', '').replace(' 1 kg', ''))}</button>`).join('')}</div></div></div>`;
  }
  if (v === 'review') return V2.review();
  const V = HT.verdictOf(L), R = HT.lotRules(L), c = HT.certOf(L.cert), C = HT.conts[L.cont], i = St.cur.i;
  if (v === 'verdict') {
    const icon = V.key === 'ok' ? 'check' : V.key === 'conv' ? 'search' : V.key === 'hold' ? 'warn' : 'x';
    const cert = R.find(r => r.id === 'R3'), cont = R.find(r => r.id === 'R2'), cold = R.find(r => r.id === 'R7');
    const row = (k, ico, t, s, st) => `<button class="row" data-view="${k}"><span class="dot ${st === 'ok' ? '' : st === 'na' ? 'na' : st === 'warn' ? 'warn' : 'bad'}">${ic(ico)}</span><span class="rt"><b>${t}</b><small>${s}</small></span><span>›</span></button>`;
    return `<div class="vhead ${V.key}"><div class="ic">${ic(icon)}</div><h1>${V.title}</h1><p>${esc(V.note)}</p><div class="pn">${esc(L.product)}</div><div class="pm">Lot ${L.lot} · pack ${HT.serialStr(i)}</div><div class="offl">${ic('lock')}Signature checked on this phone</div></div>
    <div class="pcard">${c ? `<div class="kv"><b>Certificate</b><span>${c.no}</span><b>Issued by</b><span>${esc(c.issuer)}</span><b>Recognised by</b><span>${esc(c.recognisedBy)}</span><b>Valid</b><span>${c.from} to ${c.to}</span><b>Plant</b><span>${esc(L.plant === 'P1' ? HT.places.plant.name : HT.places.plant2.name)}</span></div>` : `<div class="kv"><b>Class</b><span>Conventional</span><b>Plant</b><span>${esc(HT.places.plant2.name)}</span><b>Slaughtered</b><span>${L.slaughter}</span><b>Packed</b><span>${L.pack}</span></div>`}
    ${row('journey', 'route', 'Journey', HT.lots[L.id].events.length + ' recorded steps, farm to shop', 'ok')}
    ${row('container', 'box', 'Container', C.no + ' · seal ' + C.seal, cont ? cont.st : 'na')}
    ${row('cold', 'snow', 'Cold chain', cold ? cold.text : 'Recorded', cold ? cold.st : 'ok')}</div>
    ${R[0].id === 'NA' ? '' : `<div class="pcard"><div style="padding:10px 14px 4px;font-weight:700;font-size:.9em">Checks run</div><div class="chk">${R.map(r => `<div><i>${r.id}</i><span class="t ${r.st}">${r.st === 'ok' ? '✓' : r.st === 'warn' ? '!' : '✗'} ${esc(r.text)}</span></div>`).join('')}</div></div>`}
    ${V2.scoreCard(L)}
    <div class="pcard"><div style="padding:10px 14px 4px;font-weight:700;font-size:.9em">Thayiban — goodness checks</div><div class="chk">${HT.good(L).map(g => `<div><i></i><span class="t ${g.st === 'ok' ? 'ok' : g.st === 'warn' ? 'warn' : 'fail'}">${g.st === 'ok' ? '✓' : g.st === 'warn' ? '!' : '✗'} ${esc(g.t)}${g.d ? ' · ' + g.d : ''}</span></div>`).join('')}</div></div>`;
  }
  if (v === 'journey') return journeyCard(L, i);
  if (v === 'container') {
    const rows = C.lots.map(x => HT.lots[x]);
    return `<div class="pcard"><div class="kv"><b>Container</b><span>${C.no}</span><b>Type</b><span>${C.type}</span><b>Seal</b><span>${C.seal}</span><b>Stuffed</b><span>${C.stuffed || 'loading'}</span><b>Previous cargo</b><span>${esc(C.prev)}</span><b>Cleaning</b><span>${C.clean ? C.clean.id + ', ' + C.clean.date + ' · ' + esc(C.clean.how) : 'Not needed'}</span></div></div>
    <div class="pcard"><div style="padding:10px 14px 0;font-weight:700;font-size:.9em">Content listing</div><table><tr><th>Product</th><th class="n">Cartons</th><th>Certificate</th></tr>${rows.map(r => `<tr><td>${esc(r.product.replace(' 1 kg', ''))}<br><small style="color:var(--mu)">${r.lot}</small></td><td class="n">${r.cartons}</td><td>${r.cert ? '<span class="tag">' + r.cert + '</span>' : '<span class="tag na">None</span>'}</td></tr>`).join('')}</table>
    <div style="padding:10px 14px;font-size:.85em">${R.find(r => r.id === 'R2') ? (R.find(r => r.id === 'R2').st === 'ok' ? '✓ Every item in this container is halal certified.' : '✗ Non-halal item listed.') : 'No halal rules apply to this product.'}</div></div>`;
  }
  if (v === 'cold') return `<div class="pcard"><div style="padding:12px 14px 2px;font-weight:700">Cold chain · limit ${HT.LIMIT} °C</div>${L.temps.map(t => tempChart(t)).join('')}<div style="padding:8px 14px 12px;font-size:.85em">${L.excess.length ? '<span class="tag warn">' + L.excess.length + ' readings above the limit</span>' : '<span class="tag">Within limit on every leg</span>'}</div></div>`;
}
function tempChart(t) {
  const W = 320, H = 70, lo = -21, hi = -8, y = v => H - (v - lo) / (hi - lo) * H, n = t.pts.length, x = i => n < 2 ? 0 : i * W / (n - 1);
  const pts = t.pts.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' '); const mn = Math.min(...t.pts), mx = Math.max(...t.pts);
  return `<div class="pc"><h5>${esc(t.leg)} · ${t.from} · ${t.hours} h · min ${mn} / max ${mx} °C</h5><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${y(HT.LIMIT)}" y2="${y(HT.LIMIT)}" stroke="#b3261e" stroke-dasharray="4 3"/><polyline points="${pts}" fill="none" stroke="${mx > HT.LIMIT ? '#b26a00' : '#0e6b4f'}" stroke-width="2.4"/></svg></div>`;
}
function shopper() {
  const steps = [['scan', 'Scan the QR on the pack'], ['verdict', 'Read the verdict'], ['journey', 'Follow the journey'], ['container', 'Check the container'], ['cold', 'Check the cold chain']];
  const tabs = St.view === 'scan' ? '' : `<div class="ptabs">${[['verdict', 'shield', 'Verdict'], ['journey', 'route', 'Track'], ['container', 'box', 'Box'], ['cold', 'snow', 'Cold'], ['review', 'chat', 'Report'], ['scan', 'scan', 'Scan']].map(([k, i, t]) => `<button data-view="${k}" class="${St.view === k ? 'on' : ''}">${ic(i)}${t}</button>`).join('')}</div>`;
  return `<div class="stage"><div class="phone"><div class="screen"><div class="notch"><span>9:41</span><span>Halalan Thayiban</span><span>5G ▮▮▮</span></div><div class="pbody" id="pb">${shopperScreen()}</div>${tabs}</div></div></div>`;
}
/* ---------- worker phone ---------- */
function worker() {
  const C = HT.conts[2], pct = (C.loaded / C.declaredCartons * 100).toFixed(1), r = St.wres;
  const ov = r ? (r.ok ? `<div class="res ok">${ic('check')}<h1>Loaded</h1><p>${num(r.loaded)} of ${num(r.of)} cartons in container ${C.no}</p><button data-act="wclose">Next carton</button></div>` : `<div class="res bad">${ic('x')}<h1>BLOCK</h1><p>${esc(r.ev.text)}</p><p>The carton is not loaded. The auditor has been alerted.</p><button data-act="wclose">Set the carton aside</button></div>`) : '';
  const cartons = [['B', 'B26241-C0097', 'Frozen Beef Mince · 10 packs'], ['P', 'P26240-C0412', 'Frozen Pork Belly · 10 packs']];
  return `<div class="stage"><div class="phone"><div class="screen"><div class="notch"><span>10:41</span><span>Halalan Thayiban · Dock</span><span>Wi-Fi</span></div><div class="pbody"><div class="wbar"><h3>Loading container ${C.no}</h3><small>Seal ${C.seal} · halal beef, lot ${HT.lots.B.lot}</small><div class="prog"><i style="width:${pct}%"></i></div><small><b id="wc">${num(C.loaded)}</b> of ${num(C.declaredCartons)} cartons</small></div>
  <div style="padding:12px 14px 2px;color:var(--mu);font-size:.85em">Cartons at the dock — tap to scan the barcode</div>${cartons.map(([k, c, t]) => `<button class="carton" data-load="${k}"><span class="bars"></span><span><b>${c}</b><small>${t}</small></span></button>`).join('')}</div>${ov}</div></div></div>`;
}
/* ---------- console ---------- */
const lotsArr = () => Object.values(HT.lots);
function alerts() {
  const A = [];
  HT.log.filter(e => e.kind === 'BLOCK').forEach(e => A.push({ k: 'bad', t: 'Blocked scan', x: e.text }));
  lotsArr().forEach(L => { if (L.excess.length) A.push({ k: L.hold ? 'ok' : 'warn', t: L.hold ? 'Lot on hold' : 'Cold chain', x: `Lot ${L.lot} ${L.product}: ${L.excess.length} readings above ${HT.LIMIT} °C (max ${Math.max(...L.excess.map(x => x.v))} °C) during ${L.excess[0].leg.toLowerCase()}` + (L.hold ? ' — held' : '') }); });
  HT.certs.forEach(c => { if (c.to < HT.NOW) A.push({ k: 'warn', t: 'Certificate expired', x: `${c.no} (${c.holder}) ended ${c.to}; no open lot uses it` }); });
  return A;
}
function cview() {
  const v = St.cview; if (window.V2 && V2.cv[v]) return V2.cv[v]();
  if (v === 'dash') {
    const al = alerts(), holds = lotsArr().filter(l => l.hold).length, tp = lotsArr().reduce((a, l) => a + l.packs, 0);
    return `<h2>Dashboard</h2><p class="sub">All lots in the chain, ${HT.NOW}</p><div class="tiles"><div class="tile"><b>${lotsArr().length}</b><span>Lots</span></div><div class="tile"><b>${num(tp)}</b><span>Packs tracked</span></div><div class="tile"><b>${HT.certs.filter(c => c.to >= HT.NOW).length}</b><span>Valid certificates</span></div><div class="tile ${holds ? 'warn' : ''}"><b>${holds}</b><span>Lots on hold</span></div><div class="tile ${al.filter(a => a.k === 'bad').length ? 'bad' : ''}"><b>${al.filter(a => a.k !== 'ok').length}</b><span>Open alerts</span></div></div>
    <div class="two"><div class="panel"><h3>Alerts</h3>${al.length ? al.map(a => `<div class="alert ${a.k}"><b>${a.t}</b><span>${esc(a.x)}</span></div>`).join('') : '<div class="alert ok"><b>All clear</b></div>'}</div><div class="panel"><h3>Lots</h3><table><tr><th>Lot</th><th>Product</th><th>Class</th><th class="n">Packs</th></tr>${lotsArr().map(l => `<tr><td>${l.lot}</td><td>${esc(l.product.replace(' 1 kg', ''))}</td><td><span class="tag ${l.cls === 'halal' ? '' : 'na'}">${l.cls}</span></td><td class="n">${num(l.packs)}</td></tr>`).join('')}</table></div></div>`;
  }
  if (v === 'trace') {
    const code = St.tcode || HT.packUrl(HT.lots.A, 1203), t = St.trace;
    let out = '<div class="panel"><p class="sub" style="margin:0">Enter a pack code to trace it back to the farms and forward to the shops.</p></div>';
    if (t) { const ln = HT.lineage(t.L, t.i), b = HT.back(t.L), f = HT.fwd(t.L);
      out = `<div class="two"><div class="panel"><h3>Backward: pack to farm</h3><div class="chain"><div class="cl"><b>Pack</b><span>${ln.pack} · ${esc(t.L.product)}</span></div><div class="cl"><b>Carton</b><span>${ln.carton}</span></div><div class="cl"><b>Pallet (SSCC)</b><span>${ln.pallet}</span></div><div class="cl"><b>Container</b><span>${ln.container} · seal ${HT.conts[t.L.cont].seal}</span></div><div class="cl"><b>Lot</b><span>${ln.lot} · packed ${t.L.pack}</span></div><div class="cl"><b>Animal</b><span>ear tag ${ln.animal}</span></div><div class="cl"><b>Farm</b><span>${ln.farm[1]}, ${ln.farm[2]} · GLN ${ln.farm[3]}</span></div></div><p class="sub" style="margin:10px 0 0">The lot came from <b>${b.animals}</b> animals on <b>${b.farms}</b> farms.</p></div>
      <div class="panel"><h3>Forward: lot to shops</h3>${f.shops ? `<table><tr><th>Shop</th><th class="n">Cartons</th><th class="n">Packs</th></tr>${t.L.shops.map((n, k) => `<tr><td>${HT.places.shops[k][1]}</td><td class="n">${n}</td><td class="n">${n * 10}</td></tr>`).join('')}<tr><th>Total</th><th class="n">${f.cartons}</th><th class="n">${num(f.packs)}</th></tr></table>` : '<p class="sub">Not yet received at any shop.</p>'}</div></div>`; }
    return `<h2>Trace</h2><p class="sub">Backward and forward from one scan</p><div class="panel" style="display:flex;gap:10px"><input class="in" id="tcode" style="flex:1" value="${esc(code)}"><button class="btn" data-act="trace">Trace</button></div>${out}`;
  }
  if (v === 'cont') {
    const C = HT.conts[St.cont]; const rows = C.lots.map(x => HT.lots[x]);
    const cart = rows.reduce((a, l) => a + l.cartons, 0), scanned = C.open ? C.loaded : cart, blocks = HT.log.filter(e => e.kind === 'BLOCK' && e.cont === C.no);
    const mixed = rows.some(l => l.cls !== 'halal'), halal = rows.every(l => l.cls === 'halal');
    return `<h2>Containers</h2><p class="sub">Content listing against certificates</p><div class="panel" style="padding:8px"><table><tr><th>Container</th><th>Seal</th><th>Lots</th><th class="n">Cartons</th><th>Status</th></tr>${HT.conts.slice(1).map(c => `<tr data-cont="${c.n}" style="cursor:pointer;${c.n === St.cont ? 'background:var(--gl)' : ''}"><td>${c.no}</td><td>${c.seal}</td><td>${c.lots.map(x => HT.lots[x].lot).join(', ')}</td><td class="n">${c.open ? c.loaded + ' / ' + c.declaredCartons : c.lots.reduce((a, x) => a + HT.lots[x].cartons, 0)}</td><td><span class="tag ${c.open ? 'warn' : ''}">${c.open ? 'loading' : 'sealed'}</span></td></tr>`).join('')}</table></div>
    <div class="two"><div class="panel"><h3>${C.no}</h3><div class="chain"><div class="cl"><b>Previous cargo</b><span>${esc(C.prev)}</span></div><div class="cl"><b>Cleaning record</b><span>${C.clean ? C.clean.id + ' · ' + C.clean.date + ' · ' + esc(C.clean.how) : 'none needed'}</span></div><div class="cl"><b>Seal</b><span>${C.seal}${C.open ? ' (not yet applied)' : ''}</span></div><div class="cl"><b>Declared / scanned</b><span>${num(C.open ? C.declaredCartons : cart)} / ${num(scanned)} cartons</span></div></div>${blocks.length ? `<div class="alert bad" style="margin-top:10px"><b>Mixing alert</b><span>${blocks.length} non-halal carton refused at the dock</span></div>` : ''}<div style="margin-top:12px"><button class="btn" data-act="seal" ${C.open || mixed ? 'disabled' : ''}>Approve seal</button> <span class="sub">${C.open ? 'Loading is not finished' : mixed ? 'Listing is not halal only' : 'Seal already applied'}</span></div></div>
    <div class="panel"><h3>Content listing</h3><table><tr><th>Lot</th><th>Product</th><th>Certificate</th><th class="n">Cartons</th></tr>${rows.map(l => `<tr><td>${l.lot}</td><td>${esc(l.product.replace(' 1 kg', ''))}</td><td>${l.cert ? '<span class="tag">' + l.cert + '</span>' : '<span class="tag na">none</span>'}</td><td class="n">${l.cartons}</td></tr>`).join('')}</table><p class="sub" style="margin:10px 0 0">${halal ? 'R2: every line is halal certified.' : 'Conventional cargo; halal rules do not apply.'}</p></div></div>`;
  }
  if (v === 'vet') return `<h2>Veterinary</h2><p class="sub">Animal health and cold-chain events by lot</p><div class="panel"><table><tr><th>Lot</th><th>Product</th><th class="n">Animals</th><th>Before slaughter</th><th>After slaughter</th><th>Cold chain</th><th>Status</th><th></th></tr>${lotsArr().map(l => `<tr><td>${l.lot}</td><td>${esc(l.product.replace(' 1 kg', ''))}</td><td class="n">${l.animals}</td><td>${l.events[1].date} ✓</td><td>${l.events[3].date} ✓</td><td>${l.excess.length ? '<span class="tag warn">' + l.excess.length + ' above limit</span>' : '<span class="tag">within limit</span>'}</td><td>${l.hold ? '<span class="tag bad">on hold</span>' : '<span class="tag">released</span>'}</td><td>${l.hold ? `<button class="btn ghost" data-act="release" data-lot="${l.id}">Release</button>` : l.excess.length ? `<button class="btn amber" data-act="hold" data-lot="${l.id}">Hold lot</button>` : ''}</td></tr>`).join('')}</table></div>`;
  if (v === 'cust') return `<h2>Customs</h2><p class="sub">Declaration against what was scanned</p><div class="panel"><table><tr><th>Container</th><th>Lot</th><th>Product</th><th class="n">Declared cartons</th><th class="n">Scanned cartons</th><th>Match</th><th>Status</th><th></th></tr>${lotsArr().filter(l => !HT.conts[l.cont].open).map(l => { const rel = St.rel && St.rel[l.id]; return `<tr><td>${HT.conts[l.cont].no}</td><td>${l.lot}</td><td>${esc(l.product.replace(' 1 kg', ''))}</td><td class="n">${l.cartons}</td><td class="n">${l.cartons}</td><td><span class="tag">✓ equal</span></td><td>${l.hold ? '<span class="tag bad">held</span>' : rel ? '<span class="tag">released</span>' : '<span class="tag warn">pending</span>'}</td><td>${l.hold || rel ? '' : `<button class="btn" data-act="clear" data-lot="${l.id}">Release</button>`}</td></tr>`; }).join('')}</table></div>`;
  if (v === 'certs') return `<h2>Certificates</h2><p class="sub">Registry, with scope and validity</p><div class="panel"><table><tr><th>Number</th><th>Holder</th><th>Issued by</th><th>Scope</th><th>Valid from</th><th>To</th><th>Status</th></tr>${HT.certs.map(c => `<tr><td>${c.no}</td><td>${esc(c.holder)}</td><td>${esc(c.issuer)}</td><td>${c.cats.join(', ')}</td><td>${c.from}</td><td>${c.to}</td><td><span class="tag ${c.to >= HT.NOW ? '' : 'bad'}">${c.to >= HT.NOW ? 'valid' : 'expired'}</span></td></tr>`).join('')}</table></div>`;
  if (v === 'recall') {
    const sel = St.rlot || 'A', r = St.recall, L = HT.lots[sel];
    return `<h2>Recall</h2><p class="sub">Find every pack of a lot in one query</p><div class="panel" style="display:flex;gap:10px;align-items:center"><select class="in" id="rlot">${lotsArr().map(l => `<option value="${l.id}" ${l.id === sel ? 'selected' : ''}>${l.lot} · ${esc(l.product)}</option>`).join('')}</select><button class="btn red" data-act="recall">Run recall</button></div>${r ? `<div class="tiles"><div class="tile"><b>${num(r.packs)}</b><span>Packs</span></div><div class="tile"><b>${r.cartons}</b><span>Cartons</span></div><div class="tile"><b>${r.pallets}</b><span>Pallets</span></div><div class="tile"><b>${r.shops}</b><span>Shops</span></div><div class="tile warn"><b>${r.scans}</b><span>Shoppers who scanned</span></div></div><div class="panel"><h3>Where to collect</h3><table><tr><th>Shop</th><th class="n">Cartons</th><th class="n">Packs</th></tr>${L.shops.map((n, k) => `<tr><td>${HT.places.shops[k][1]}</td><td class="n">${n}</td><td class="n">${n * 10}</td></tr>`).join('')}</table></div>` : ''}`;
  }
}
function consoleUI() {
  const nav = [['chain', 'users', 'Parties'], ['score', 'shield', 'Score'], ['disc', 'lock', 'Share'], ['fed', 'route', 'Hops'], ['dash', 'home', 'Board'], ['trace', 'search', 'Trace'], ['cont', 'box', 'Boxes'], ['vet', 'vet', 'Vet'], ['cust', 'cust', 'Customs'], ['certs', 'doc', 'Certs'], ['recall', 'recall', 'Recall']];
  return `<div class="cons"><div class="nav">${nav.map(([k, i, t]) => `<button data-cv="${k}" class="${St.cview === k ? 'on' : ''}">${ic(i)}<small>${t}</small></button>`).join('')}</div><div class="main" id="mn">${cview()}</div></div>`;
}
function cardUI() {
  const c = St.card; if (!c) return '';
  if (c.list) return `<div class="ov"><div class="in"><div class="cn">${c.n}</div><h1>${c.t}</h1><ul class="cl2">${c.list.map(x => `<li>${x}</li>`).join('')}</ul></div></div>`;
  if (c.n) return `<div class="ov"><div class="in"><div class="cn">${c.n}</div><h1>${c.t}</h1><p>${c.s}</p></div></div>`;
  return `<div class="ov"><div class="in"><div class="k">${c.kick}</div><h1>${c.l1}<b>${c.l2}</b></h1><p>${c.s}</p></div></div>`;
}
function render() {
  const keep = $('#pb') ? $('#pb').scrollTop : 0, keepm = $('#mn') ? $('#mn').scrollTop : 0;
  $('#root').innerHTML = topbar() + '<div class="app">' + (St.mode === 'landing' ? V2.landing() : St.mode === 'shopper' ? shopper() : St.mode === 'worker' ? worker() : consoleUI()) + '</div>' + cardUI();
  I18N.apply($('#root'));
  if ($('#pb')) $('#pb').scrollTop = keep; if ($('#mn')) $('#mn').scrollTop = keepm;
}
function scan() {
  if (St.scanning) return; St.scanning = true; render();
  setTimeout(() => { const hp = handPack(St.hand), r = HT.parse(HT.packUrl(hp, handIndex(St.hand))); St.cur = r; St.scanning = false; St.view = 'verdict'; St.open = null; render(); console.log('§HT_SCAN lot=' + r.L.lot + ' serial=' + HT.serialStr(r.i) + ' verdict=' + HT.verdictOf(r.L).title); }, 1400);
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-mode],[data-act],[data-view],[data-hand],[data-ev],[data-load],[data-cv],[data-cont]'); if (!t) return; const d = t.dataset;
  if (d.mode) { St.mode = d.mode; if (d.mode === 'shopper') { St.view = 'scan'; } St.wres = null; }
  else if (d.hand) St.hand = d.hand;
  else if (d.view) { St.view = d.view; if (d.view === 'scan') St.cur = null; }
  else if (d.ev) St.open = St.open === +d.ev ? null : +d.ev;
  else if (d.cv) St.cview = d.cv;
  else if (d.cont) St.cont = +d.cont;
  else if (d.load) { const r = HT.loadScan(2, d.load); St.wres = r; console.log('§HT_LOAD ' + (r.ok ? 'OK loaded=' + r.loaded + '/' + r.of : 'BLOCK rule=' + r.rule + ' lot=' + r.ev.lot)); }
  else if (d.act === 'scan') return scan();
  else if (d.act === 'wclose') St.wres = null;
  else if (d.act === 'trace') { const v = $('#tcode').value; St.tcode = v; St.trace = HT.parse(v); console.log('§HT_TRACE ' + (St.trace ? 'ok lot=' + St.trace.L.lot : 'unreadable')); }
  else if (d.act === 'hold') { const L = HT.lots[d.lot]; L.hold = 'Veterinary hold: cold chain above ' + HT.LIMIT + ' °C'; console.log('§HT_HOLD lot=' + L.lot); }
  else if (d.act === 'release') HT.lots[d.lot].hold = null;
  else if (d.act === 'clear') { St.rel = St.rel || {}; St.rel[d.lot] = 1; }
  else if (d.act === 'seal') { }
  else if (d.act === 'recall') { const sel = $('#rlot').value; St.rlot = sel; const L = HT.lots[sel], f = HT.fwd(L); St.recall = { packs: L.packs, cartons: L.cartons, pallets: L.pallets, shops: f.shops, scans: L.scans }; console.log('§HT_RECALL lot=' + L.lot + ' packs=' + L.packs + ' shops=' + f.shops + ' scans=' + L.scans); }
  render();
});
document.addEventListener('change', e => { if (e.target.id === 'rlot') { St.rlot = e.target.value; St.recall = null; render(); } });
window.__app = { St, HT, render, scan, I };

/* postal-style tracking card (user, 2026-10-21): newest first, stage bar, scroll to see every handling step */
function journeyCard(L, i) {
  const ev = L.events, last = ev[ev.length - 1], st = [['Farm', 2], ['Plant', 5], ['Container', 7], ['Port', 8], ['DC', 9], ['Shop', 10]];
  const reached = st.filter(x => last.n >= x[1]).length, day = d => Math.round((new Date(HT.NOW) - new Date(d)) / 864e5), days = day(ev[0].date);
  const status = last.n >= 10 ? 'At the shop' : last.n >= 9 ? 'At distribution centre' : last.n >= 8 ? 'Cleared at port' : last.n >= 6 ? 'In container' : 'At the plant';
  const hold = L.hold ? `<div class="alert bad" style="margin:8px 0 0"><b>On hold</b><span>${esc(L.hold)}</span></div>` : '';
  const rows = [{ n: '★', type: 'You scanned this pack', date: HT.NOW, where: 'Your phone', who: 'You', evidence: 'Verdict: ' + HT.verdictOf(L).title, now: 1 }].concat(ev.slice().reverse());
  return `<div class="trk"><div class="th2"><small>Pack ${HT.serialStr(i)} · lot ${L.lot}</small><h2>${status}</h2><p>${esc(L.product)} · ${days} days since the animals were registered</p>
  <div class="stg">${st.map((x, k) => `<div class="s ${k < reached ? 'd' : ''} ${k === reached - 1 ? 'c' : ''}"><i></i><span>${x[0]}</span></div>`).join('')}</div>${hold}</div>
  <div class="tlist">${rows.map((e, k) => `<div class="tr ${e.now ? 'now' : ''} ${St.open === k ? 'op' : ''}" data-ev="${k}"><div class="rail"><span class="dot2">${e.now ? '' : e.n}</span></div><div class="bd"><div class="dd">${e.date}</div><b>${esc(e.type)}</b><div class="pl2">${esc(e.where)}</div>${St.open === k ? `<div class="ev"><b style="color:inherit">${esc(e.who)}</b>${esc(e.evidence)}</div>` : '<div class="mo">Details ›</div>'}</div></div>`).join('')}</div></div>`;
}
