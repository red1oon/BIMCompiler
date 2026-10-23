#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope: FOOTAGE DRIVER for the film "The Server is Dead — ERP, desktop setup" (prompts/TEAMWORK_FRAMEWORK.md §14.6).
//   READ THE LOG after every run: exit code is not evidence. Cue times come from the `§FILM_CUE name who= t=` lines, never from guesses.
//   Two REAL browser contexts (User A, User B = a private window / separate storage) on ONE desktop, the REAL erp/idempiere.html (bim-ootb worktree),
//   a dumb folder pipe standing in for GitHub (the trial token does not exist), ONE fresh space. Each context records its own video (recordVideo
//   1280x720, one continuous take). Helpers are adapted from bim-ootb erp/tests/witness_team_desktop.js + witness_team_docaction.js (NOT edited).
//   Cosmetic only: a red pointer dot (Playwright recordings have no cursor) and a CSS blur on the two invite-link inputs (film rule: never show an invite link).
// usage: ERP_ROOT=/tmp/wt-film-erp FILM_DIR=<out dir> node film_server_dead_desktop_rec.js 2>&1 | tee <out dir>/rec.log
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), os = require('os');
var ROOT = process.env.ERP_ROOT || '/tmp/wt-film-erp', OUT = process.env.FILM_DIR; if (!OUT) { console.log('FILM_DIR missing'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.css': 'text/css' };
var PW = require('/home/red1/bim-ootb/tests/node_modules/playwright');
var legacy = require(path.join(ROOT, 'erp/tests/legacy_open.js'));
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
var W = Number(process.env.FILM_W || 1280), H = Number(process.env.FILM_H || 720), T0 = {}, pg = {}, cues = [], L = { A: [], B: [] }, errors = 0, checks = 0, bad = 0;
function check(ok, label, detail) { checks++; if (!ok) bad++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function cue(name, who) { var t = (Date.now() - T0[who]) / 1000; cues.push({ name: name, who: who, t: t }); console.log('§FILM_CUE ' + name + ' who=' + who + ' t=' + t.toFixed(2));
  if (process.env.FILM_SHOTS && pg[who]) { fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true }); pg[who].screenshot({ path: path.join(OUT, 'shots', cues.length + '_' + name + '_' + who + '.png') }).catch(function () {}); } }
function walk(d, rel, out) { if (!fs.existsSync(d)) return out; fs.readdirSync(d).forEach(function (n) { var p = path.join(d, n), r = rel ? rel + '/' + n : n; if (fs.statSync(p).isDirectory()) walk(p, r, out); else out.push(r); }); return out; }

(async function () {
  var FOLDER = fs.mkdtempSync(path.join(os.tmpdir(), 'film-pipe-'));
  var server = http.createServer(function (req, res) {
    var u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
    if (p === '/pipe/list') { var pre = u.searchParams.get('prefix') || ''; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(walk(FOLDER, '', []).filter(function (n) { return n.indexOf(pre) === 0; }))); return; }
    if (p.indexOf('/pipe/f/') === 0) { var fp = path.join(FOLDER, p.slice(8)); if (fp.indexOf(FOLDER) !== 0) { res.writeHead(400); res.end(); return; }
      if (req.method === 'PUT') { var ch = []; req.on('data', function (c) { ch.push(c); }); req.on('end', function () { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, Buffer.concat(ch)); res.writeHead(200); res.end('ok'); }); return; }
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); fs.createReadStream(fp).pipe(res); return; }
    var f = path.join(ROOT, p === '/' ? '/erp/idempiere.html' : p);
    if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, '127.0.0.1', r); });
  var base = 'http://127.0.0.1:' + server.address().port, PIPE = base + '/pipe';
  console.log('§FILM_ENV root=' + ROOT + ' base=' + base + ' pipe=folder(stand-in for GitHub) viewport=' + W + 'x' + H);

  var browser = await PW.chromium.launch({ args: ['--disable-gpu'] });
  var HDR = ['A', 'B'], ctx = {}, tClose = {};
  var overlay = function () {   // red pointer dot + click pulse; blur on the invite inputs (everything waits for the DOM)
    function boot() {
      var st = document.createElement('style'); st.textContent = '#tp-link,#tp-inv{filter:blur(6px)} #team-conflicts .team-conflict[data-col="docstatus"]{background:#fff3c4;font-weight:600} #film-dot{position:fixed;left:-40px;top:-40px;width:26px;height:26px;margin:-13px 0 0 -13px;border:3px solid #e8412c;background:rgba(232,65,44,.28);border-radius:50%;z-index:2147483647;pointer-events:none;transition:transform .12s}';
      (document.head || document.documentElement).appendChild(st);
      var dot; function mk() { if (dot || !document.body) return; dot = document.createElement('div'); dot.id = 'film-dot'; document.body.appendChild(dot); }
      document.addEventListener('mousemove', function (e) { mk(); if (dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; } }, true);
      document.addEventListener('mousedown', function () { mk(); if (dot) dot.style.transform = 'scale(1.7)'; }, true);
      document.addEventListener('mouseup', function () { if (dot) dot.style.transform = 'scale(1)'; }, true);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    try { new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.textContent && /verify FAIL/i.test(n.textContent)) console.log('§FILM_TOAST verify-FAIL seen: ' + n.textContent.slice(0, 80)); }); }); }).observe(document, { childList: true, subtree: true }); } catch (e) {}
  };
  var mouse = { A: { x: 640, y: 360 }, B: { x: 640, y: 360 } };
  try {
    // both contexts + pages created together; T0 = page creation (the take's own clock)
    for (var who of HDR) {
      ctx[who] = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: path.join(OUT, 'vid' + who), size: { width: W, height: H } } });
      await ctx[who].addInitScript(overlay);
    }
    for (var who2 of HDR) {
      pg[who2] = await ctx[who2].newPage(); T0[who2] = Date.now();
      (function (w) { pg[w].on('console', function (m) { var t = m.text(); L[w].push(t); if (/§TEAM_|§TEAM-REBUILD|§COMM_SYNC|§AD-DOCFSM-LIVE.*clicked|§CRUD process committed|🔴/.test(t)) console.log('     [' + w + ' ' + ((Date.now() - T0[w]) / 1000).toFixed(1) + 's] ' + t.slice(0, 300)); });
        pg[w].on('pageerror', function (e) { errors++; L[w].push('PAGEERR ' + e.message); console.log('     [' + w + '] 🔴 pageerror ' + e.message); });
        pg[w].on('dialog', function (d) { console.log('     [' + w + '] dialog: ' + d.message().slice(0, 120)); d.accept().catch(function () {}); }); })(who2);
    }
    // ── helpers ──
    async function hclick(w, selector, opt) {   // visible, human-paced click: glide the pointer, pause, click
      var p = pg[w], loc = p.locator(selector).first(); await loc.scrollIntoViewIfNeeded().catch(function () {});
      var b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + selector);
      var x = b.x + b.width / 2, y = b.y + Math.min(b.height / 2, 14);
      await p.mouse.move(x, y, { steps: 14 }); mouse[w] = { x: x, y: y }; await sleep((opt && opt.pre) || 450); await p.mouse.click(x, y); await sleep((opt && opt.post) || 350);
    }
    async function waitLog(w, re, from, ms) { var t0 = Date.now(); while (Date.now() - t0 < ms) { var l = L[w].slice(from).find(function (x) { return re.test(x); }); if (l) return l; await sleep(150); } return null; }
    async function loadErp(w, url) { await pg[w].goto(url, { waitUntil: 'load' }); await pg[w].waitForSelector('#idmp-toolbar [data-tb="new"]', { timeout: 90000 }); await sleep(1500); }
    async function pillClick(w) { if (!(await pg[w].isVisible('#pill-team'))) { await hclick(w, '#idmp-pill-trigger'); await sleep(700); } await hclick(w, '#pill-team'); await pg[w].waitForSelector('#team-panel', { timeout: 10000 }); await sleep(600); }
    async function panelText(w, s) { return pg[w].$eval(s, function (e) { return e.textContent; }).catch(function () { return null; }); }
    async function chip(w) { return pg[w].evaluate(function () { var c = document.getElementById('team-chip'); return c ? { text: c.textContent.replace(/\s+/g, ' ').trim(), conflicts: Number(c.getAttribute('data-conflicts')) } : null; }); }
    var sel = function (c) { return '#idmp-inline-mount select[data-col="' + c + '"]'; };
    var inp = function (c) { return '#idmp-inline-mount input[data-col="' + c + '"]'; };
    async function toHeaderGrid(w) { var p = pg[w]; await hclick(w, '#idmp-tabstrip .idmp-adtab >> nth=0'); await sleep(700); await legacy.showAllRows(p, { settle: 300 }); await sleep(500); }
    async function gridRows(w) { return pg[w].evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('.idmp-grid tbody tr[data-ad-record]'), function (tr) { return { pk: Number(tr.getAttribute('data-ad-record')), text: tr.textContent.replace(/\s+/g, ' ').trim() }; }); }); }
    async function newOrder(w, desc) {
      var p = pg[w], n0 = L[w].length;
      await hclick(w, '#idmp-tabstrip .idmp-adtab >> nth=0'); await sleep(500);
      await hclick(w, '#idmp-toolbar [data-tb="new"]'); await p.waitForSelector('#idmp-inline-mount .cfrow'); await sleep(900);
      await p.selectOption(sel('ad_org_id'), '11').catch(function () {}); await sleep(400);
      await p.selectOption(sel('m_warehouse_id'), '103').catch(function () {}); await sleep(300);
      await p.selectOption(sel('c_bpartner_id'), '118'); await sleep(500);
      var dts = await p.$$eval(sel('c_doctypetarget_id') + ' option', function (o) { return o.map(function (x) { return { v: x.value, t: x.text }; }); });
      var dt = dts.find(function (o) { return /^Standard Order/.test(o.t); }) || dts.find(function (o) { return /^POS Order/.test(o.t); }); if (!dt) throw new Error('no order doctype');
      await p.selectOption(sel('c_doctypetarget_id'), dt.v); await sleep(400);
      await hclick(w, inp('description'), { post: 200 }); await p.locator(inp('description')).first().pressSequentially(desc, { delay: 70 }); await p.dispatchEvent(inp('description'), 'change'); await sleep(500);
      await hclick(w, '#idmp-toolbar [data-tb="save"]');
      var l = await waitLog(w, /§CRUD-CREATE-SEL table=c_order id=/, n0, 15000); await sleep(1200);
      return Number((/id=(-?\d+)/.exec(l || '') || [])[1]);
    }
    async function addLine(w) {
      var p = pg[w];
      await hclick(w, '#idmp-tabstrip >> text=Order Line'); await sleep(900);
      await hclick(w, '#idmp-toolbar [data-tb="new"]'); await p.waitForSelector('#idmp-inline-mount .cfrow'); await sleep(900);
      await p.selectOption(sel('m_product_id'), '123'); await sleep(500);
      var qi = p.locator(inp('qtyentered')).first(); await qi.fill('2'); await qi.blur(); await sleep(400);
      var uom = (await p.$$eval(sel('c_uom_id') + ' option', function (o) { return o.map(function (x) { return { v: x.value, t: x.text }; }); })).find(function (o) { return /^Each/.test(o.t); });
      var tax = (await p.$$eval(sel('c_tax_id') + ' option', function (o) { return o.map(function (x) { return { v: x.value, t: x.text }; }); })).find(function (o) { return /^Standard \(104\)/.test(o.t); });
      if (uom) await p.selectOption(sel('c_uom_id'), uom.v); if (tax) await p.selectOption(sel('c_tax_id'), tax.v);
      var pe = p.locator(inp('priceentered')).first(); await pe.fill('61.75'); await pe.blur();
      await p.locator(inp('priceactual')).first().fill('61.75').catch(function () {}); await sleep(500);
      var n0 = L[w].length; await hclick(w, '#idmp-toolbar [data-tb="save"]');
      await waitLog(w, /§CRUD-PERSIST key=c_orderline/, n0, 15000); await sleep(1200);
    }
    async function visit(w) { var n0 = L[w].length; await hclick(w, '#team-visit', { pre: 500 }); var l = await waitLog(w, /§TEAM_VISIT /, n0, 60000); await sleep(1200); return l; }
    async function selectRow(w, pk) { await pg[w].evaluate(function (i) { var tr = Array.prototype.filter.call(document.querySelectorAll('.idmp-grid tbody tr[data-ad-record]'), function (x) { return Number(x.getAttribute('data-ad-record')) === i; })[0]; if (tr) tr.click(); }, pk); await pg[w].waitForSelector('#idmp-inline-mount .cfrow', { timeout: 8000 }).catch(function () {}); await sleep(900); }
    async function ensureForm(w) { var has = await pg[w].evaluate(function () { return !!document.querySelector('#idmp-inline-mount .cfrow'); }); if (!has) { await hclick(w, '#idmp-toolbar [data-tb="toggle"]', { pre: 400 }); await pg[w].waitForSelector('#idmp-inline-mount .cfrow', { timeout: 8000 }).catch(function () {}); await sleep(700); } }
    function probe(w, desc) { return pg[w].evaluate(function (d) {
      var db = window.__crud.kernelDb(), q = function (s) { var r = db.exec(s); return r.length ? r[0].values : []; }, pk = null;
      q("SELECT id, parameters FROM kernel_ops WHERE op_type='CRUD_CREATE' AND undone=0 ORDER BY id").forEach(function (v) { var p = JSON.parse(v[1]); if (p.table === 'c_order' && p.fields && p.fields.description === d) pk = -v[0]; });
      if (pk == null) return null;
      var row = window.CrudCore.listTip(db, 'c_order', 'c_order_id', [], null).rows.filter(function (r) { return Number(r.c_order_id) === pk; })[0] || {};
      var tax = 0; q("SELECT op_type, parameters FROM kernel_ops WHERE undone=0").forEach(function (v) { var p; try { p = JSON.parse(v[1]); } catch (e) { return; } if (v[0] === 'CRUD_CREATE' && p.table === 'c_ordertax' && p.fields && Number(p.fields.c_order_id) === pk) tax++; });
      var lines = window.CrudCore.listTip(db, 'c_orderline', 'c_orderline_id', [], null).rows.filter(function (r) { return Number(r.c_order_id) === pk; });
      return { pk: pk, tip: window.__crud.readTip('c_order', pk), col: row.docstatus || null, tax: tax, lines: lines.length, linesProcessed: lines.filter(function (r) { return r.processed === 'Y'; }).length }; }, desc); }
    async function plog(w, label, desc) { var r = await probe(w, desc); await pg[w].evaluate(function (s) { console.log(s); }, '§FILM_PROBE ' + label + ' ' + JSON.stringify(r)); console.log('   §FILM_PROBE ' + w + ' ' + label + ' ' + JSON.stringify(r)); return r; }
    async function docAction(w, act) {   // the REAL DocAction bar button (data-doc-action) of the open order form
      var n0 = L[w].length; await hclick(w, '#idmp-inline-mount .idmp-docfsm button[data-doc-action="' + act + '"], .idmp-docfsm button[data-doc-action="' + act + '"]', { pre: 600 });
      var l = await waitLog(w, /§CRUD process committed key=c_order/, n0, 20000); await sleep(1500); return l; }
    async function cfs(w) { return pg[w].$$eval('#team-conflicts .team-conflict', function (e) { return e.map(function (x) { return x.textContent; }); }); }
    async function barText(w) { return pg[w].$eval('.idmp-docfsm', function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }).catch(function () { return null; }); }

    // ═══ BEAT 0 — both users open the ERP (plain: team mode OFF) ═══
    var URL0 = base + '/erp/idempiere.html?login=GardenAdmin&window=143&pipe=' + encodeURIComponent(PIPE);   // nothing says team=1
    await Promise.all([loadErp('A', URL0), loadErp('B', URL0)]); cue('loaded', 'A'); cue('loaded', 'B'); await sleep(2500);

    // ═══ BEAT 1 — A: Team pill → Turn on team mode ═══
    await pillClick('A'); cue('panel_open', 'A'); await sleep(3500);
    await hclick('A', '#tp-mode', { pre: 900 }); cue('mode_click', 'A');
    await pg.A.waitForURL(/team=1/, { timeout: 30000 }); await pg.A.waitForSelector('#idmp-toolbar [data-tb="new"]', { timeout: 90000 }); await pg.A.waitForSelector('#team-chip', { timeout: 60000 }); await sleep(1500);
    cue('chip_unpaired', 'A'); var c0 = await chip('A'); await sleep(2500);
    check(c0 && /not paired/.test(c0.text), 'A: team mode ON from the pill; chip says not paired', c0 && c0.text);

    // ═══ BEAT 2 — A: Start a team → invite link (blurred) ═══
    await pillClick('A'); cue('panel_unpaired', 'A'); await sleep(2500);
    await hclick('A', '#tp-found', { pre: 900 }); await pg.A.waitForSelector('#tp-paired', { timeout: 30000 }); cue('founded', 'A'); await sleep(3500);
    var paired = await panelText('A', '#tp-paired'), link = await pg.A.inputValue('#tp-link');
    check(/Paired/.test(paired) && /founder/.test(paired) && /#join=[0-9a-f]{64}$/.test(link), 'A: Start a team → Paired as founder + invite link', paired);
    await hclick('A', '#tp-close'); await sleep(800);

    // ═══ BEAT 3 — B opens the invite link, joins ═══
    await loadErp('B', link.replace(/^https?:\/\/[^/]+/, base)); cue('invite_opened', 'B');
    await pg.B.waitForSelector('#team-panel', { timeout: 60000 }); await sleep(2800); cue('invite_prefilled', 'B');
    await hclick('B', '#tp-join', { pre: 900 }); await pg.B.waitForSelector('#tp-code', { timeout: 30000 }); cue('joined_code', 'B'); await sleep(3500);
    var codeB = (await panelText('B', '#tp-code')).trim();
    check(/^[0-9A-F]{4}-[0-9A-F]{4}$/.test(codeB), 'B: Join → shows its device code', codeB);
    await hclick('B', '#tp-close'); await sleep(600);

    // ═══ BEAT 4 — A: check join requests, role, Approve; B Visit → paired ═══
    await pillClick('A'); await hclick('A', '#tp-req', { pre: 700 }); await pg.A.waitForSelector('#tp-reqs .tp-rcode', { timeout: 30000 }); cue('requests_listed', 'A'); await sleep(3000);
    var codes = await pg.A.$$eval('#tp-reqs .tp-rcode', function (e) { return e.map(function (x) { return x.textContent.trim(); }); });
    check(codes.length === 1 && codes[0] === codeB, 'A: pending request = exactly B\'s code', codes.join(',') + ' vs ' + codeB);
    await hclick('A', '#tp-reqs .tp-role', { pre: 600, post: 200 }); await pg.A.selectOption('#tp-reqs .tp-role', '102'); cue('role_picked', 'A'); await sleep(2500);
    var roleTxt = await pg.A.$eval('#tp-reqs .tp-role', function (e) { return e.options[e.selectedIndex].text; });
    var stB0 = await pg.B.evaluate(function () { return window.TeamSync.pairState(); });
    check(stB0.enrolled === false, 'NO-OP guard: before the Approve, B is not enrolled', JSON.stringify({ enrolled: stB0.enrolled }));
    await hclick('A', '#tp-reqs .tp-approve', { pre: 700 }); await pg.A.waitForSelector('#tp-paired', { timeout: 30000 }); cue('approved', 'A'); await sleep(2500);
    await pillClick('B'); await hclick('B', '#tp-visit', { pre: 700 }); await pg.B.waitForSelector('#tp-paired', { timeout: 30000 }); cue('b_paired', 'B'); await sleep(3000);
    var pB = await panelText('B', '#tp-paired'), stA = await pg.A.evaluate(function () { return window.TeamSync.pairState(); });
    check(/Paired/.test(pB) && /team devices 2/.test(pB) && stA.devices === 2, 'B Paired; both see 2 team devices; role chosen=' + roleTxt, pB + ' | A devices=' + stA.devices);
    var spA = await pg.A.evaluate(function () { return window.TeamSync.pairState().then(function (s) { var sp = s.space || ''; console.log('§FILM_SPACE who=A space=' + sp.slice(0, 12) + ' devices=' + s.devices); return sp; }); });
    var spB = await pg.B.evaluate(function () { return window.TeamSync.pairState().then(function (s) { var sp = s.space || ''; console.log('§FILM_SPACE who=B space=' + sp.slice(0, 12) + ' devices=' + s.devices); return sp; }); });
    check(!!spA && spA === spB, 'ONE space: A and B report the same 64-hex space', spA.slice(0, 12) + ' / ' + spB.slice(0, 12));
    await hclick('A', '#tp-close'); await hclick('B', '#tp-close'); await sleep(800);

    // ═══ BEAT 5 — A: Sales Order + line; Visit both; B sees it ═══
    await toHeaderGrid('A'); await toHeaderGrid('B'); cue('grids_ready', 'A');
    await plog('B', 'before-order', 'Film order 1');
    cue('order_new', 'A'); var pk1 = await newOrder('A', 'Film order 1'); cue('order_saved', 'A');
    cue('line_start', 'A'); await addLine('A'); cue('line_saved', 'A');
    cue('visitA1', 'A'); var vA1 = await visit('A'); cue('visitB1', 'B'); var vB1 = await visit('B');
    var rowsB0 = await gridRows('B'); cue('b_sees_order', 'B'); await sleep(1500);
    // B refreshes its header grid view to show the arrived row (re-open the tab) — the legacy user's ReQuery
    await toHeaderGrid('B'); var rowsB = await gridRows('B'); var hit = rowsB.filter(function (r) { return /Film order 1/.test(r.text); }); cue('b_grid_has_order', 'B'); await sleep(3000);
    var pr1 = await plog('B', 'after-visit', 'Film order 1');
    check(hit.length === 1 && pr1 && pr1.lines === 1, 'B\'s grid shows "Film order 1" (1 row) with its 1 line after Visit', 'rows=' + hit.length + ' lines=' + (pr1 && pr1.lines) + ' | ' + (vB1 || '').slice(0, 150));

    // ═══ BEAT 6 — A completes it; Visit; B sees Completed + consequences ═══
    var pa0 = await plog('A', 'before-complete', 'Film order 1'); await toHeaderGrid('A'); await selectRow('A', pa0.pk); cue('a_form_open', 'A');
    await selectRow('B', pr1.pk); cue('b_form_open', 'B'); await sleep(2000);
    var barA0 = await barText('A'), barB0 = await barText('B');
    check(/Drafted|DR/.test(barA0 || '') && /Drafted|DR/.test(barB0 || ''), 'both show the order as Drafted before the Complete', 'A: ' + barA0 + ' | B: ' + barB0);
    cue('complete_click', 'A'); await docAction('A', 'CO'); cue('a_completed', 'A'); await sleep(2500);
    var pa = await plog('A', 'after-complete', 'Film order 1'), pbPre = await plog('B', 'before-visit-after-complete', 'Film order 1');
    check(pbPre.tip !== 'CO' && pbPre.col !== 'CO', 'NO-OP guard: before B visits, B does not show Completed', 'B tip=' + pbPre.tip + ' col=' + pbPre.col);
    cue('visitA2', 'A'); await visit('A'); cue('visitB2', 'B'); await visit('B'); await sleep(1000);
    // B re-opens the record (the legacy user's ReQuery) so the form shows what the log folded
    await toHeaderGrid('B'); await selectRow('B', pr1.pk); cue('b_shows_status', 'B'); await sleep(3000);
    var pbPost = await plog('B', 'after-visit-2', 'Film order 1'), barB1 = await barText('B');
    check(pbPost.tip === 'CO' && pbPost.col === 'CO' && pbPost.tax >= 1 && pbPost.tax === pa.tax && pbPost.linesProcessed === pbPost.lines, 'B: status Completed AND the same consequences as A (tax rows ' + pa.tax + ', lines processed ' + pbPost.linesProcessed + '/' + pbPost.lines + ')', 'tip=' + pbPost.tip + ' col=' + pbPost.col + ' bar=' + barB1);
    // show a consequence on B's screen: the Order Tax tab
    var taxTab = await pg.B.locator('#idmp-tabstrip >> text=/Order Tax|Tax/').count();
    if (taxTab) { await hclick('B', '#idmp-tabstrip >> text=/Order Tax/'); await sleep(1200); await pg.B.evaluate(function () { console.log('§FILM_TAXTAB shown'); }); cue('b_tax_tab', 'B'); await sleep(3500); }
    else console.log('   ⚪ no Order Tax tab on the strip — consequences shown by the status chip + processed lines only');

    // ═══ BEAT 7 — the clash: both Complete the SAME order before visiting ═══
    await toHeaderGrid('A'); await toHeaderGrid('B');
    cue('order2_new', 'A'); var pk2 = await newOrder('A', 'Film order 2'); await addLine('A');
    await visit('A'); await visit('B'); cue('order2_on_both', 'B');
    var x0a = await plog('A', 'order2-before', 'Film order 2'), x0b = await plog('B', 'order2-before', 'Film order 2');
    check(x0a && x0b && x0a.lines === 1 && x0b.lines === 1, 'order 2 and its line are on BOTH users before the clash', JSON.stringify({ A: x0a && x0a.lines, B: x0b && x0b.lines }));
    await toHeaderGrid('B'); await selectRow('B', x0b.pk); await toHeaderGrid('A'); await selectRow('A', x0a.pk); await sleep(1500);
    cue('clash_start', 'A'); await docAction('A', 'CO'); cue('a_completes_2', 'A');
    await docAction('B', 'CO'); cue('b_completes_2', 'B'); await sleep(2500);
    var mid = [await plog('A', 'order2-both-completed-not-visited', 'Film order 2'), await plog('B', 'order2-both-completed-not-visited', 'Film order 2')];
    check(mid[0].tax >= 1 && mid[1].tax >= 1, 'NON-VACUOUS: each user\'s own Complete produced consequences (tax rows) before any Visit', 'A tax=' + mid[0].tax + ' B tax=' + mid[1].tax);
    cue('visit_A_x1', 'A'); await visit('A'); cue('visit_B_x1', 'B'); await visit('B'); cue('visit_A_x2', 'A'); await visit('A'); cue('visit_B_x2', 'B'); await visit('B'); await sleep(800);
    var ca = await cfs('A'), cb = await cfs('B');
    // re-open the record so the form shows what the log folded
    await toHeaderGrid('A'); await selectRow('A', x0a.pk); await ensureForm('A'); await toHeaderGrid('B'); await selectRow('B', x0b.pk); await ensureForm('B'); cue('conflict_shown', 'A'); cue('conflict_shown', 'B'); await sleep(9000);
    var xa = await plog('A', 'order2-after-clash', 'Film order 2'), xb = await plog('B', 'order2-after-clash', 'Film order 2');
    var cA = await chip('A'), cB = await chip('B'), barA2 = await barText('A'), barB2 = await barText('B');
    console.log('   §FILM_CONFLICTS A=' + JSON.stringify(ca.map(function (t) { return t.slice(0, 160); })) + '\n   §FILM_CONFLICTS B=' + JSON.stringify(cb.map(function (t) { return t.slice(0, 160); })));
    check(ca.some(function (t) { return /docstatus/.test(t) && /ReQuery/.test(t); }) && cb.some(function (t) { return /docstatus/.test(t) && /ReQuery/.test(t); }), 'both users show the docstatus conflict "...changed by another user, please ReQuery"', 'A=' + ca.length + ' B=' + cb.length);
    check(xa.tip !== 'CO' && xb.tip !== 'CO' && xa.col !== 'CO' && xb.col !== 'CO', 'the order keeps its last agreed status (not Completed) on both', 'A tip=' + xa.tip + ' col=' + xa.col + ' | B tip=' + xb.tip + ' col=' + xb.col + ' | bars: ' + barA2 + ' / ' + barB2);
    check(xa.tax === 0 && xb.tax === 0 && xa.linesProcessed === 0 && xb.linesProcessed === 0, 'all-or-none: none of the Complete\'s consequences show on either user (tax rows, processed lines)', 'A tax=' + xa.tax + ' proc=' + xa.linesProcessed + ' | B tax=' + xb.tax + ' proc=' + xb.linesProcessed);
    console.log('   chips: A=' + (cA && cA.text) + ' | B=' + (cB && cB.text));

    // ═══ one space? read it from the pipe itself ═══
    var names = walk(FOLDER, '', []), spaces = {}; names.forEach(function (n) { var p = n.split('/'); if (p[0] === 's' && /^[0-9a-f]{64}$/.test(p[1])) spaces[p[1]] = (spaces[p[1]] || 0) + 1; });
    console.log('§FILM_PIPE objects=' + names.length + ' spaces=' + JSON.stringify(Object.keys(spaces).map(function (s) { return s.slice(0, 12) + ':' + spaces[s]; })));
    check(Object.keys(spaces).length === 1 && Object.keys(spaces)[0].indexOf(spA.slice(0, 12)) === 0, 'the pipe holds exactly ONE space, the same one both users report', Object.keys(spaces).map(function (s) { return s.slice(0, 12); }).join(','));
    var allL = L.A.concat(L.B), bad1 = allL.filter(function (t) { return /verifyChain=FAIL|group-torn|§FILM_TOAST verify-FAIL/i.test(t); }), commits = allL.filter(function (t) { return /§CRUD process committed key=c_order/.test(t); }), commitsOk = commits.filter(function (t) { return /verifyChain=ok/.test(t); });
    console.log('§FILM_CHAIN complete_commits=' + commits.length + ' ok=' + commitsOk.length + ' fail_or_torn_or_toast_lines=' + bad1.length + (bad1.length ? ' first=' + bad1[0].slice(0, 160) : ''));
    check(commits.length === 3 && commitsOk.length === commits.length && bad1.length === 0, 'chain valid on every Complete commit: no verifyChain=FAIL, no group-torn, no "verify FAIL" toast on either page', 'commits=' + commits.length + ' ok=' + commitsOk.length + ' bad=' + bad1.length);
    check(errors === 0, 'zero page errors on both users', 'errors=' + errors);
    await sleep(1500); tClose.A = Date.now(); tClose.B = Date.now();
  } catch (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); bad++; }
  finally {
    var tc = Date.now(); var vids = {};
    for (var w of HDR) { try { vids[w] = await pg[w].video().path(); } catch (e) {} }
    for (var w3 of HDR) { try { await ctx[w3].close(); } catch (e) {} }
    await browser.close(); server.close();
    var meta = { T0: T0, tClose: tc, cues: cues, vids: vids, errors: errors };
    fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify(meta, null, 1));
    console.log('§FILM_REC videos=' + JSON.stringify(vids) + ' elapsedA=' + ((tc - T0.A) / 1000).toFixed(2) + 's elapsedB=' + ((tc - T0.B) / 1000).toFixed(2) + 's cues=' + cues.length);
    try { fs.writeFileSync(path.join(OUT, 'pageA.log'), L.A.join('\n')); fs.writeFileSync(path.join(OUT, 'pageB.log'), L.B.join('\n')); } catch (e) {}
    try { fs.rmSync(FOLDER, { recursive: true, force: true }); } catch (e) {}
    console.log('§FILM_REC_VERDICT ' + (bad ? 'FAIL' : 'PASS') + ' checks=' + checks + ' bad=' + bad);
    process.exit(bad ? 1 : 0);
  }
})();
