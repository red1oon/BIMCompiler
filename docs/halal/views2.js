// ⚠ DO NOT REMOVE — UI for HALAL_TRACE_SPEC.md §7.1 (review) and §11 (players, disclosure, federated trace). Data only from HT (data.js, model.js).
'use strict';
Object.assign(I, {
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>',
  send: '<path d="M12 16V4M7 9l5-5 5 5M5 14v5h14v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  save: '<path d="M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  farm: '<path d="M3 20V10l5-4 5 4v10M13 20v-7l4-3 4 3v7M2 20h20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  plant: '<path d="M3 20V9l6 4V9l6 4V5h4v15z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  ship: '<path d="M3 15l2 4h14l2-4zM6 15V9h12v6M10 9V5h4v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7M6 19a1.8 1.8 0 100-.1M17 19a1.8 1.8 0 100-.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  shop: '<path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  person: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="2"/>',
  cert: '<path d="M5 3h14v14H5z M8 8h8 M8 12h5 M14 17l-2 4-2-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  users: '<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 5a3.5 3.5 0 010 7M18 14c2 1 4 3 4 6" fill="none" stroke="currentColor" stroke-width="2"/>'
});
St.cview = 'chain'; St.pl = 'plant'; St.mi = 0; St.rv = null; St.fedOff = ''; St.fedRun = false; St.mine = [];
try { St.mine = JSON.parse(localStorage.getItem('ht.reviews') || '[]'); } catch (e) { }
St.rev = { photos: [], rating: 0, kind: '', text: '', shop: '', ch: '', sheet: false };
const LK = HT.lots.A;
const V2 = { cv: {} };
V2.cv.chain = () => {
  const pl = HT.players, sel = pl.find(p => p.k === St.pl);
  const tot = pl.reduce((a, p) => { a.h += p.hold.length; a.s += p.share.length; return a; }, { h: 0, s: 0 });
  return `<h2>Players and parts</h2><p class="sub">Who is in the chain, what each keeps, and what travels with the goods</p>
  <div class="leg"><span><i style="background:var(--g)"></i>Player</span><span><i style="background:#3b5bb5;border-radius:4px"></i>Authority</span><span><i style="background:#7a5a2a;border-radius:2px"></i>Part</span><span><i style="background:#8a3a8f"></i>Consumer</span><span>› manifest</span></div>
  <div class="chainrow">${pl.map(p => `<button class="pl ${p.kind} ${p.k === St.pl ? 'on' : ''}" data-v2="pl:${p.k}"><span class="bub">${ic(p.ic)}</span><b>${p.n}</b><span class="cnt"><span>${ic('lock')}${p.hold.length}</span><span>${ic('mail')}${p.share.length}</span></span></button>`).join('')}</div>
  <div class="panel"><h3 style="display:flex;align-items:center;gap:10px"><span style="width:34px;height:34px;border-radius:50%;background:var(--g);color:#fff;display:grid;place-items:center">${ic(sel.ic).replace('<svg', '<svg width="20" height="20"')}</span>${sel.n} <span class="tag ${sel.kind === 'authority' ? 'warn' : sel.kind === 'player' ? '' : 'na'}">${sel.kind}</span></h3>
  <div class="tri"><div class="col priv"><h4>${ic('lock')}Kept private</h4><ul>${sel.hold.map(x => `<li>${x}</li>`).join('')}</ul></div><div class="col shr"><h4>${ic('mail')}Shared in the manifest</h4><ul>${sel.share.map(x => `<li>${x}</li>`).join('')}</ul></div><div class="col see"><h4>${ic('eye')}Sees from others</h4><ul>${sel.see.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
  <div style="display:flex;gap:18px;margin-top:12px;align-items:center;flex-wrap:wrap"><div class="chips"><b style="font-size:.78em;color:var(--mu);align-self:center">Data (AD tables)</b>${sel.ad.map(x => `<span>${x}</span>`).join('')}</div>${sel.rules.length ? `<div class="chips"><b style="font-size:.78em;color:var(--mu);align-self:center">Rules checked here</b>${sel.rules.map(x => `<span class="r">${x}</span>`).join('')}</div>` : ''}</div></div>
  <div class="two"><div class="panel"><h3>Across the chain</h3><p class="sub" style="margin:0">${pl.length} parties hold <b>${tot.h}</b> kinds of private record and share only <b>${tot.s}</b> items.</p></div><div class="panel"><h3>Next</h3><button class="btn" data-v2="go:disc">See what one manifest reveals</button> <button class="btn ghost" data-v2="go:fed">Trace across the players</button></div></div>`;
};
V2.cv.disc = () => {
  const M = HT.manifests(LK), m = M[St.mi], b = m.body, s = HT.salt(LK), r = St.rv;
  const steps = ['Plant → Carrier', 'Carrier → Customs', 'Customs → DC', 'DC → Shop'];
  const row = (k, v) => `<tr><td style="color:var(--mu);width:120px">${k}</td><td><b>${v}</b></td></tr>`;
  const pv = [['Lot', LK.lot, HT.commit(LK.lot, s)], ['Animals', LK.animals + ' ear tags', HT.commit('animals:' + LK.animals, s)], ['Farms', LK.farms + ' farms', HT.commit('farms:' + LK.farms, s)]];
  return `<h2>What a manifest reveals</h2><p class="sub">Container ${b.container} · lot ${'<span class="hash">sha256:' + b.lot.slice(7, 19) + '…</span>'}</p>
  <div class="mi">${steps.map((t, i) => `<button class="${i === St.mi ? 'on' : ''}" data-v2="mi:${i}">${t}</button>`).join('')}</div>
  <div class="two"><div class="panel"><h3 style="color:var(--g);display:flex;gap:7px;align-items:center">${ic('mail').replace('<svg', '<svg width="18" height="18"')}Shared with the next player</h3><table>${row('Container', b.container)}${row('Seal', b.seal)}${row('Product type', b.lines[0].type + ' · ' + b.lines[0].class)}${row('Volume', b.lines[0].cartons + ' cartons · ' + num(b.lines[0].kg) + ' kg')}${row('Certificate', b.cert.no)}${row('Issued by', esc(b.cert.issuer))}${row('From → to', esc(b.from) + ' → ' + esc(b.to))}${row('Date', b.at)}</table></div>
  <div class="panel"><h3 style="color:var(--bad);display:flex;gap:7px;align-items:center">${ic('lock').replace('<svg', '<svg width="18" height="18"')}Kept private (hash only, or absent)</h3><table>${pv.map(p => `<tr><td style="color:var(--mu);width:80px">${p[0]}</td><td><span class="hash">sha256:${p[2].slice(0, 22)}…</span></td></tr>`).join('')}<tr><td style="color:var(--mu)">Prices</td><td>not in the manifest</td></tr><tr><td style="color:var(--mu)">Customers</td><td>not in the manifest</td></tr><tr><td style="color:var(--mu)">Recipes</td><td>not in the manifest</td></tr></table></div></div>
  <div class="two"><div class="panel"><h3>Authority asks to see the lot</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-v2="reveal:ok">Reveal with the plant's salt</button><button class="btn ghost" data-v2="reveal:bad">Try a wrong salt</button></div>${r ? `<div class="alert ${r.ok ? 'ok' : 'bad'}" style="margin-top:10px"><b>${r.ok ? 'Match ✓' : 'No match ✗'}</b><span>${r.ok ? 'Lot ' + LK.lot + ' with the salt gives the commitment in the manifest. Logged as a reveal to the Veterinary service.' : 'That salt does not give the commitment. Nothing is disclosed.'}</span></div><div class="hash" style="margin-top:6px">recomputed sha256:${r.h.slice(0, 40)}…</div>` : '<p class="sub" style="margin-top:10px">Nothing is revealed until the owner agrees.</p>'}</div>
  <div class="panel"><h3>The signed record</h3><pre class="js">${esc(JSON.stringify({ v: b.v, container: b.container, seal: b.seal, lines: b.lines, cert: b.cert.no, lot: 'sha256:' + b.lot.slice(7, 19) + '…', prev: b.prev.slice(0, 15) + '…', from: b.from, to: b.to, kid: m.kid, hash: m.hash.slice(0, 16) + '…' }, null, 1))}</pre></div></div>`;
};
V2.cv.fed = () => {
  const hops = St.fedRun ? HT.fed(LK, St.fedOff) : [], answered = hops.filter(h => h.st === 'answered').length;
  const pls = [['', 'None (everyone answers)'], ['dc', 'Distribution centre'], ['cust', 'Customs and border vet'], ['port', 'Port and carrier'], ['plant', 'Abattoir and packing plant']];
  return `<h2>Trace across the players</h2><p class="sub">No central store: each player answers for its own step</p>
  <div class="panel" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span>From a pack of lot <b>${LK.lot}</b> bought at a shop. Player that stays silent:</span><select class="in" id="fedoff">${pls.map(p => `<option value="${p[0]}" ${p[0] === St.fedOff ? 'selected' : ''}>${p[1]}</option>`).join('')}</select><button class="btn" data-v2="fedrun">Trace</button></div>
  ${St.fedRun ? `<div class="alert ${answered === 6 ? 'ok' : 'warn'}"><b>${answered} of 6 players answered</b><span>${answered === 6 ? 'The chain is complete back to the farms.' : 'The trace stops at the silent player. Nothing beyond it is guessed.'}</span></div>
  ${hops.map((h, i) => `<div class="hop ${h.st}" style="animation-delay:${i * .5}s"><span class="dt">${ic(h.st === 'answered' ? 'check' : h.st === 'silent' ? 'x' : 'lock')}</span><span><b>${h.n}</b>${h.st === 'answered' ? `${esc(h.says)}<br><small>Does not reveal: ${h.hides}</small>` : h.st === 'silent' ? 'No reply' : '<small>Not reached</small>'}</span></div>`).join('')}` : ''}`;
};
V2.msg = () => {
  const R = St.rev, c = St.cur, L = c.L, V = HT.verdictOf(L);
  return `Report about ${L.product}\nLot ${L.lot} · pack ${HT.serialStr(c.i)}\nVerdict when scanned: ${V.title}\n${R.rating ? 'Rating: ' + R.rating + '/5\n' : ''}${R.kind ? 'Type: ' + R.kind + '\n' : ''}${R.shop ? 'Bought at: ' + R.shop + '\n' : ''}${R.text ? '\n' + R.text + '\n' : ''}\nPhotos: ${R.photos.length}\nTrace: ${HT.packUrl(L, c.i)}`.replace(/^(.*)$/s, x => I18N.tr(x));
};
V2.review = () => {
  const R = St.rev, L = St.cur.L, kinds = ['Praise', 'Quality', 'Damaged or thawed', 'Label looks wrong', 'Suspected not halal'];
  const shops = L.shops.length ? L.shops.map((n, k) => HT.places.shops[k][1]) : [];
  return `<div class="rv"><h3>Report or review</h3><small style="color:var(--mu)">${esc(L.product)} · lot ${L.lot}</small>
  <label>Photos (up to 3)</label><div class="ph">${R.photos.map((p, i) => `<div class="th" style="background-image:url(${p})"><i data-v2="rmph:${i}">×</i></div>`).join('')}${R.photos.length < 3 ? `<label class="add" style="margin:0">${ic('cam')}Take photo<input id="rphoto" type="file" accept="image/*" capture="environment" hidden></label>` : ''}</div>
  <label>Rating</label><div class="stars">${[1, 2, 3, 4, 5].map(n => `<button data-v2="star:${n}" class="${R.rating >= n ? 'on' : ''}">★</button>`).join('')}</div>
  <label>What is it about</label><div class="kinds">${kinds.map(k => `<button data-v2="kind:${k}" class="${R.kind === k ? 'on' : ''} ${k.startsWith('Susp') ? 'sus' : ''}">${k}</button>`).join('')}</div>
  <label>Where did you buy it</label><select id="rshop"><option value="">Choose a shop</option>${shops.map(s => `<option ${R.shop === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
  <label>Your note</label><textarea id="rtext" placeholder="Say what you saw">${esc(R.text)}</textarea>
  <button class="btn" style="width:100%;margin-top:14px" data-v2="rsheet">Review and send</button>
  ${R.sheet ? `<div class="sheet"><b style="font-size:.9em">Message ready — pack link and verdict attached</b><div class="msg">${esc(V2.msg())}</div><div class="sendrow"><button class="sh" data-v2="send:Share sheet">${ic('send')}Share…</button><button class="wa" data-v2="send:WhatsApp">${ic('chat')}WhatsApp</button><button class="ml" data-v2="send:Email">${ic('mail')}Email</button><button data-v2="send:Saved to phone">${ic('save')}Save</button></div><p class="sub" style="font-size:.74em;margin:8px 0 0">Goes through your own app and account. Saved on this phone first; works offline.</p></div>` : ''}
  <div class="mine"><b>My reports</b>${St.mine.length ? St.mine.map(r => `<div><span>${esc(r.p)} · ${r.rating || '–'}★ · ${r.photos} photo</span><span class="tag">${r.state}</span></div>`).join('') : '<div><span>None yet</span></div>'}</div></div>`;
};
V2.act = d => {
  const [a, v] = d.v2.split(/:(.*)/s), R = St.rev;
  if (a === 'enter') { const [m, w] = v.split(':'); St.mode = m; if (m === 'shopper') { St.view = 'scan'; St.cur = null; } if (w) St.cview = w; console.log('§HT_ENTER mode=' + m + (w ? ' view=' + w : '')); }
  else if (a === 'crit') St.crit = !St.crit;
  else if (a === 'pl') St.pl = v; else if (a === 'go') St.cview = v; else if (a === 'mi') { St.mi = +v; St.rv = null; }
  else if (a === 'reveal') { const s = v === 'ok' ? HT.salt(LK) : 'wrong-salt'; const h = HT.commit(LK.lot, s); St.rv = { ok: h === HT.manifests(LK)[St.mi].body.lot.slice(7), h }; console.log('§HT_REVEAL salt=' + v + ' match=' + St.rv.ok); }
  else if (a === 'fedrun') { St.fedOff = $('#fedoff').value; St.fedRun = true; console.log('§HT_FED off=' + (St.fedOff || 'none') + ' answered=' + HT.fed(LK, St.fedOff).filter(h => h.st === 'answered').length); }
  else if (a === 'star') R.rating = +v; else if (a === 'kind') R.kind = v; else if (a === 'rmph') R.photos.splice(+v, 1);
  else if (a === 'rsheet') R.sheet = true;
  else if (a === 'send') {
    const L = St.cur.L, to = R.kind.startsWith('Susp') ? HT.contacts.cert : R.kind === 'Praise' || R.kind === 'Quality' ? HT.contacts.brand : HT.contacts.shop, txt = V2.msg();
    if (!window.__film) { try { if (v === 'WhatsApp') window.open('https://wa.me/' + to.wa + '?text=' + encodeURIComponent(txt)); else if (v === 'Email') location.href = 'mailto:' + to.mail + '?subject=' + encodeURIComponent('Report: ' + L.product + ' lot ' + L.lot) + '&body=' + encodeURIComponent(txt); else if (v === 'Share sheet' && navigator.share) navigator.share({ title: 'Report', text: txt }); } catch (e) { } }
    St.mine.unshift({ p: L.product.replace('Frozen ', '').replace(' 1 kg', ''), rating: R.rating, photos: R.photos.length, state: v === 'Saved to phone' ? 'Saved' : 'Shared · ' + v }); try { localStorage.setItem('ht.reviews', JSON.stringify(St.mine)); } catch (e) { }
    console.log('§HT_REVIEW channel=' + v + ' photos=' + R.photos.length + ' rating=' + R.rating + ' to=' + to.n + ' linkInText=' + txt.includes(HT.packUrl(L, St.cur.i)));
    St.rev = { photos: [], rating: 0, kind: '', text: '', shop: '', ch: '', sheet: false };
  }
};
document.addEventListener('click', e => { const lb = e.target.closest('[data-lang]'); if (lb) { I18N.set(lb.dataset.lang); console.log('§HT_LANG ' + lb.dataset.lang); render(); return; } const t = e.target.closest('[data-v2]'); if (!t) return; e.stopPropagation(); V2.act(t.dataset); render(); }, true);
document.addEventListener('input', e => { if (e.target.id === 'rtext') St.rev.text = e.target.value; });
document.addEventListener('change', e => {
  if (e.target.id === 'lang') { I18N.set(e.target.value); console.log('§HT_LANG ' + e.target.value); render(); return; }
  if (e.target.id === 'slot') { St.slot = e.target.value; render(); }
  if (e.target.id === 'rshop') St.rev.shop = e.target.value;
  if (e.target.id === 'fedoff') St.fedOff = e.target.value;
  if (e.target.id === 'rphoto' && e.target.files[0]) { const fr = new FileReader(); fr.onload = () => { St.rev.photos.push(fr.result); render(); }; fr.readAsDataURL(e.target.files[0]); }
});
V2.ring = s => `<svg viewBox="0 0 80 80" width="84" height="84"><circle cx="40" cy="40" r="34" fill="none" stroke="#e1e9e5" stroke-width="9"/><circle cx="40" cy="40" r="34" fill="none" stroke="${s >= 85 ? '#1b7f4b' : s >= 70 ? '#b26a00' : '#b3261e'}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(213.6 * s / 100).toFixed(1)} 213.6" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle" font-size="22" font-weight="700" fill="#1d2a26">${s}</text></svg>`;
V2.bar = (n, s) => `<div class="sb"><span>${n}</span><span class="tr2"><i style="width:${s}%;background:${s >= 85 ? '#1b7f4b' : s >= 70 ? '#b26a00' : '#b3261e'}"></i></span><b>${s}</b></div>`;
V2.scoreCard = L => { const T = HT.thayiban(L);
  return `<div class="pcard"><div style="padding:12px 14px 4px;display:flex;gap:12px;align-items:center">${V2.ring(T.overall)}<div><b style="font-size:1.05em">Thayiban score</b><div style="font-size:.78em;color:var(--mu)">Goodness beyond halal: how the animal was fed, kept and handled, and how the meat travelled. Out of 100.</div></div></div>
  <div style="padding:6px 14px 8px">${T.comps.map(c => V2.bar(c.n, c.s)).join('')}</div>
  <button class="row" data-v2="crit"><span class="rt"><b style="font-size:.85em">What is checked</b><small>Equal weights. Farm records stay private; the auditor's attested summary is shown.</small></span><span>${St.crit ? '▴' : '▾'}</span></button>
  ${St.crit ? `<div class="chk">${['nutrition', 'health', 'barn'].map(k => `<div><i></i><span><b>${{ nutrition: 'Nutrition', health: 'Animal health', barn: 'Barn conditions' }[k]}</b><br>${T.crit[k].join(' · ')}</span></div>`).join('')}</div>` : ''}</div>`; };
V2.cv.score = () => { const sel = St.slot || 'A', L = HT.lots[sel], T = HT.thayiban(L);
  return `<h2>Thayiban score</h2><p class="sub">Nutrition, animal health, barn conditions, cold chain and container hygiene. Equal weights (a proposal for vets, scholars and standards bodies to set).</p>
  <div class="panel" style="display:flex;gap:10px;align-items:center"><select class="in" id="slot">${Object.values(HT.lots).map(l => `<option value="${l.id}" ${l.id === sel ? 'selected' : ''}>${l.lot} · ${esc(l.product)}</option>`).join('')}</select></div>
  <div class="two"><div class="panel"><div style="display:flex;gap:14px;align-items:center">${V2.ring(T.overall)}<div><b>Lot score</b><div class="sub" style="margin:0">Mean of ${T.comps.length} components</div></div></div><div style="margin-top:10px">${T.comps.map(c => V2.bar(c.n, c.s)).join('')}</div></div>
  <div class="panel"><h3>By farm <span class="tag warn">revealed to the authority on request</span></h3><table><tr><th>Farm</th><th class="n">Animals</th><th class="n">Nutrition</th><th class="n">Health</th><th class="n">Barn</th></tr>${T.farms.map(f => `<tr><td>${esc(f.name)}</td><td class="n">${f.animals}</td><td class="n">${f.nutrition}</td><td class="n">${f.health}</td><td class="n">${f.barn}</td></tr>`).join('')}</table><p class="sub" style="margin:8px 0 0">The lot's nutrition, health and barn scores are the animal-weighted mean of its farms. The shopper sees the lot scores only.</p></div></div>
  <div class="panel"><h3>What is checked</h3><div class="tri">${['nutrition', 'health', 'barn'].map(k => `<div class="col shr"><h4>${{ nutrition: 'Nutrition', health: 'Animal health', barn: 'Barn conditions' }[k]}</h4><ul>${T.crit[k].map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div></div>`; };
V2.landing = () => {
  const pl = HT.players, shared = pl.reduce((a, p) => a + p.share.length, 0), priv = pl.reduce((a, p) => a + p.hold.length, 0);
  const door = (cls, ico, t, sub, btns) => `<div class="door ${cls}"><div class="di">${ic(ico)}</div><h3>${t}</h3><p>${sub}</p><div class="db">${btns.map((b, i) => `<button class="btn ${i ? 'ghost' : ''}" data-v2="enter:${b[2]}">${ic(b[1])}${b[0]}</button>`).join('')}</div></div>`;
  return `<div class="land"><div class="hero"><div class="hk">Halalan Thayiban System</div><h1>Not just Halal<b>but Goodness</b></h1><p>Lawful and good. One scan, farm to fork.</p>
  <div class="strip">${pl.map((p, i) => `<div class="sn ${p.kind}"><span>${ic(p.ic)}</span></div>${i < pl.length - 1 ? '<i class="ar">›</i>' : ''}`).join('')}</div>
  <div class="facts"><span><b>${pl.length}</b> parties</span><span><b>${priv}</b> kinds of private record</span><span><b>${shared}</b> items shared</span><span><b>8</b> rules, every result shown</span></div></div>
  <div class="doors">${door('d1', 'scan', 'Shopper', 'Know what you buy.', [['Scan a pack', 'scan', 'shopper']])}
  ${door('d2', 'plant', 'Supplier', 'Share only what is needed.', [['Dock scan', 'box', 'worker'], ['What I share', 'lock', 'console:disc']])}
  ${door('d3', 'cust', 'Authorities and auditors', 'See, hold, recall.', [['Open the console', 'users', 'console:dash'], ['Trace', 'route', 'console:fed']])}</div>
  <p class="foot">Sample data is invented. Nothing here is a real certificate, company or consignment.</p></div>`;
};
window.V2 = V2;
{ const h = location.hash.slice(1).split('/'); if (['shopper', 'worker', 'console'].includes(h[0])) { St.mode = h[0]; if (h[1]) St.cview = h[1]; } } render(); window.__ready = true;
