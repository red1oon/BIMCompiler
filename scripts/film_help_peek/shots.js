// ⚠ DO NOT REMOVE — SCOPE: film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22; owner OK 2026-11-25, all three questions). READ out/shots.log after every run.
//   The pictures and the facts of the TWIN's beats, none typed by hand: the REAL ERP page (a bim-ootb main tree, headless Chromium on the CPU, viewport 1280x720 at device scale 1.5 = 1920x1080),
//   served out/film_seed.db (seed_make.js: a draft Sales Order in a CLOSED period, its customer on credit hold) as ad_seed.db. Drivers and selectors are those of erp/tests/witness_help_peek.js.
//   Sessions: A = NOW (the friendly-ops plugin NOT started = legacy's behaviour, W-HELP-PEEK P8): Complete -> refused for the period, fix the date, Complete -> refused for the credit hold.
//             B = OURS (plugin started): the count on the ? door, the panel, the marks, ▶ Fix, Undo Changes, Open, Save -> count follows, the hold released in Business Partner, Complete goes through.
//             C = every window has its help (Shipment, Purchase Order topics, the guide link and the live page) and the ask ("How do I close a Sales Order?").
//   Every on-screen value is also a §FILM_SHOT line. A beat that cannot be proven by a § line is a FAIL here, not a PASS. Usage: node shots.js <bim-ootb tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages'); fs.mkdirSync(PAGES, { recursive: true });
const H = require(path.join(TREE, 'common', 'help', 'tests', '_hq.js')), SEED = path.join(OUT, 'film_seed.db'), SJ = JSON.parse(fs.readFileSync(path.join(OUT, 'film_seed.json'), 'utf8')), OID = SJ.order;
const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
const LOG = []; const L = (m) => { LOG.push(m); console.log(m); };
const F = { made: new Date().toISOString(), tree: require('child_process').spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), seed: SJ, shots: {}, now: {}, ours: {}, help: {}, ask: {}, errors: [] };
const lastFrom = (P, re, n) => { const ls = P.logs.slice(n || 0).filter((l) => re.test(l)); return ls.length ? ls[ls.length - 1] : null; };
const waitLine = async (P, re, n, tries) => { for (let i = 0; i < (tries || 60); i++) { const l = lastFrom(P, re, n); if (l) { await P.pg.waitForTimeout(500); return l; } await P.pg.waitForTimeout(250); } return null; };
const R15 = (b) => ({ x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) });
// the rectangles (in screenshot pixels) of the named selectors (first visible match), null when absent: the cards cut their crops from these, never by hand
const rects = (pg, sels) => pg.evaluate((sels) => { const o = {}; Object.keys(sels).forEach((k) => { const all = Array.from(document.querySelectorAll(sels[k])).filter((e) => e.getClientRects().length); const e = all[0]; if (!e) { o[k] = null; return; } const rs = all.map((x) => x.getBoundingClientRect()).filter((b) => b.height > 0), x0 = Math.min(...rs.map((b) => b.x)), y0 = Math.min(...rs.map((b) => b.y)), x1 = Math.max(...rs.map((b) => b.right)), y1 = Math.max(...rs.map((b) => b.bottom)); o[k] = { x: Math.round(x0 * 1.5), y: Math.round(y0 * 1.5), w: Math.round((x1 - x0) * 1.5), h: Math.round((y1 - y0) * 1.5), n: all.length }; }); return o; }, sels);
const SELS = { bar: '.idmp-docfsm', date: '#idmp-inline-mount [data-col="dateordered"]', bp: '#idmp-inline-mount [data-col="c_bpartner_id"]', panel: '#idmp-help', peek: '#idmp-howto-peek', bad: '.peek-bad', door: '#idmp-pill-trigger', tabs: '#idmp-tabstrip', ctx: '#idmp-howto-ctx', card: '#idmp-howto-card', credit: '#idmp-inline-mount [data-col="socreditstatus"]', bpname: '#idmp-inline-mount [data-col="name"]', toast: '.crud-toast' };
const pad = (r, p, W, Hh) => { const x = Math.max(0, r.x - p), y = Math.max(0, r.y - p), x1 = Math.min(W, r.x + r.w + p), y1 = Math.min(Hh, r.y + r.h + p); return { x, y, w: x1 - x, h: y1 - y }; };
// one picture: the whole page + the crop = the union of the must-show rectangles (padded, at least MINW x MINH, inside 1920x1080). A must-show element that is absent makes the shot NOT ok (the guard fails on it).
async function shot(P, name, must, extra, wait, opts) {
  opts = opts || {}; await P.pg.waitForTimeout(wait == null ? 600 : wait); await P.pg.screenshot({ path: path.join(PAGES, name + '.png') });
  const r = await rects(P.pg, SELS), have = must.filter((k) => r[k]), ok = have.length === must.length;
  let crop = null; const cs = (opts.crop || must).filter((k) => r[k]);
  if (cs.length) { const x1 = Math.max(...cs.map((k) => r[k].x + r[k].w)), y1 = Math.max(...cs.map((k) => r[k].y + r[k].h));
    let u = { x: Math.min(...cs.map((k) => r[k].x)), y: Math.min(...cs.map((k) => r[k].y)), w: 0, h: 0 }; u.w = x1 - u.x; u.h = y1 - u.y; u = pad(u, 24, 1920, 1080);
    // a crop the lower band can show large: at most 720 px wide (the band is 718 css px), anchored on the left of what must show; or exactly the element when it is narrower
    const mw = (opts.min || [480, 300])[0], mh = (opts.min || [480, 300])[1]; let w = Math.min(1920, Math.max(u.w, mw)), h = Math.min(1080, Math.max(opts.h || u.h, mh)); if (opts.narrow && w > 720) w = 720;
    const cx = opts.narrow ? u.x + w / 2 : u.x + u.w / 2, cy = u.y + h / 2; crop = { x: Math.round(Math.max(0, Math.min(1920 - w, cx - w / 2))), y: Math.round(Math.max(0, Math.min(1080 - h, cy - h / 2))), w: Math.round(w), h: Math.round(h) }; }
  F.shots[name] = Object.assign({ file: 'pages/' + name + '.png', rects: r, must, ok, crop }, extra || {});
  L('§FILM_SHOT name=' + name + ' ok=' + ok + ' must=' + must.join(',') + (ok ? '' : ' MISSING=' + must.filter((k) => !r[k]).join(',')) + ' crop=' + JSON.stringify(crop) + (extra ? ' ' + JSON.stringify(extra).slice(0, 400) : ''));
}
const dateVal = (pg) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.value : null; }, SELS.date);
const chip = (pg) => pg.evaluate(() => { const c = document.querySelector('.idmp-docfsm .chip'); return c ? c.textContent.trim() : null; });
const openOrder = async (P) => { await P.pg.evaluate((id) => window.IdmpHost.zoom(143, null, id), OID); for (let i = 0; i < 40; i++) { if (await P.pg.evaluate(() => /Order Line/.test((document.getElementById('idmp-tabstrip') || {}).innerText || '') && !!document.querySelector('.idmp-docfsm'))) break; await P.pg.waitForTimeout(250); } await P.pg.waitForTimeout(1200); };
const badge = (pg) => pg.evaluate(() => { const t = document.getElementById('idmp-pill-trigger'); if (!t) return 'no-trigger'; const c = getComputedStyle(t, '::after').content; return c && c !== 'none' && c !== 'normal' ? c.replace(/"/g, '') : null; });
const words = (pg, key) => pg.evaluate((k) => { const li = document.querySelector('#idmp-howto-peek li[data-peek-key="' + k + '"]'); return li ? li.textContent.replace(/\s+/g, ' ').trim() : null; }, key);
const complete = async (P, snap) => { const n = P.logs.length; await P.pg.click('[data-doc-action="CO"]'); let toast = null;
  for (let i = 0; i < 60; i++) { const t = await P.pg.evaluate(() => { const es = Array.from(document.querySelectorAll('.crud-toast')).filter((e) => e.getClientRects().length && /^PROCESS/.test(e.textContent.trim())); return es.length ? es[es.length - 1].textContent.trim() : null; }); if (t && !toast) toast = t;
    if (lastFrom(P, /^§MODEL-DOCACTION table=c_order .*action=CO/, n)) break; await P.pg.waitForTimeout(100); }
  for (let i = 0; i < 20 && !lastFrom(P, /^§FSM-CTX refused table=C_Order|^§AD-DOCFSM-LIVE table=259\(C_Order\) record=\d+ clicked=CO/, n); i++) await P.pg.waitForTimeout(100);
  const l = lastFrom(P, /^§FSM-CTX refused table=C_Order/, n);
  if (snap && l) { await P.pg.waitForTimeout(350); await shot(P, snap, ['bar', 'date'], { chip: await chip(P.pg), toast, line: l }, 0, { narrow: true }); }   // the picture is taken while the page's own toast is on screen
  await P.pg.waitForTimeout(1500); return { n, line: l, refused: l, toast }; };
(async () => {
  // the page opener of common/help/tests/_hq.js erpPage (same URL, same waits), but with a 1920x1080-pixel screenshot (viewport 1280x720 at device scale 1.5): the cards cut their crops from these pixels
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.svg': 'image/svg+xml' };
  const sess = async () => { const over = { '/erp/ad_seed.db': SEED };
    const srv = await new Promise((r) => { const s = require('http').createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); fs.readFile(over[p] || path.join(TREE, p), (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); }); }); s.listen(0, () => r(s)); });
    const b = await chromium.launch({ headless: true, args: ['--disable-gpu'] }), ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }), pg = await ctx.newPage(), logs = [], errs = []; pg.setDefaultTimeout(30000);
    pg.on('console', (m) => logs.push(m.text())); pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?seed=ad_seed.db&login=GardenAdmin', { waitUntil: 'networkidle', timeout: 60000 });
    await pg.waitForFunction(() => window.__idmpHowto && window.__idmpFieldHelp && window.__idmpFieldHelp.menu().windows.length > 0, null, { timeout: 30000 });
    for (let i = 0; i < 120 && !logs.some((l) => l.indexOf('§HELP_SEARCH index lang=en_US') === 0); i++) await pg.waitForTimeout(250);
    return { pg, logs, errs, close: async () => { await b.close(); srv.close(); } }; };
  // ───────────────────────── B first (its panel words are the words session A quotes) ─────────────────────────
  const ONLY = process.env.ONLY || ''; let P, pg, n;
  B: { if (ONLY && ONLY !== 'B') break B;
  P = await sess(); pg = P.pg;
  await pg.evaluate(async () => { const r = window.PluginEngine._reg().system; await r.installBundle(location.origin + '/erp/plugins/friendly_ops.mjs'); await r.startBundle('org.kernel.friendly-ops'); });
  n = P.logs.length; await openOrder(P);
  const bg1 = await waitLine(P, /^§HELP_PEEK bg table=/, n, 60), bd1 = await badge(pg);
  F.ours.bg = bg1; F.ours.badge = bd1; L('§FILM_FACTS ours open order=' + OID + ' ' + bg1 + ' badge=' + bd1 + ' chip=' + await chip(pg));
  await shot(P, 'ours_door', ['door', 'bar', 'date'], { badge: bd1, bg: bg1, date: await dateVal(pg) }, null, { crop: ['door'], min: [420, 260] });
  await pg.evaluate(() => window.IdmpPillActions.showme()); await pg.waitForTimeout(900);
  n = P.logs.length; await pg.click('[data-lens-panel="friendly-ops:peek"]');
  const mk = await waitLine(P, /^§HELP_PEEK marks /, n, 60); await pg.waitForTimeout(500);
  const pk = lastFrom(P, /^§HELP_PEEK table=/, n);
  F.ours.panel = await pg.evaluate(() => { const b = document.getElementById('idmp-howto-peek'); return { text: b.innerText.replace(/\s+/g, ' ').trim(), keys: Array.from(b.querySelectorAll('li[data-peek-key]')).map((x) => x.getAttribute('data-peek-key')), marked: Array.from(document.querySelectorAll('.peek-bad')).map((x) => (x.getAttribute('data-ad-column') || x.textContent.trim()) + ':' + x.getAttribute('data-peek')) }; });
  F.ours.words = { PeriodClosed: await words(pg, 'PeriodClosed'), BPartnerCreditHold: await words(pg, 'BPartnerCreditHold') }; F.ours.mark = mk; F.ours.peek = pk;
  L('§FILM_FACTS ours panel keys=' + JSON.stringify(F.ours.panel.keys) + ' marked=' + JSON.stringify(F.ours.panel.marked) + ' | ' + mk + ' | ' + pk); L('§FILM_FACTS ours words ' + JSON.stringify(F.ours.words));
  await shot(P, 'ours_panel', ['panel', 'bad'], { keys: F.ours.panel.keys, marked: F.ours.panel.marked }, null, { crop: ['peek'], min: [560, 330] });
  // ▶ Fix (one click), then Undo Changes shown once, then ▶ again
  const d0 = await dateVal(pg); n = P.logs.length;
  await pg.evaluate(() => { const b = document.querySelector('#idmp-howto-peek [data-lens-run="friendly-ops:fix"]'); if (b) b.click(); });
  await pg.waitForFunction(() => /Fixed:|Failed:/.test((document.getElementById('idmp-howto-peek') || {}).innerText || ''), null, { timeout: 20000 }); await pg.waitForTimeout(900);
  const set1 = lastFrom(P, /^§HELP_PEEK set col=/, n), rp1 = lastFrom(P, /^§HELP_PEEK table=/, n), d1 = await dateVal(pg);
  F.ours.fix = { before: d0, after: d1, set: set1, repeek: rp1, text: await pg.evaluate(() => document.getElementById('idmp-howto-peek').innerText.replace(/\s+/g, ' ').trim()) };
  L('§FILM_FACTS ours fix date ' + d0 + ' -> ' + d1 + ' | ' + set1 + ' | ' + rp1); await shot(P, 'ours_fix', ['panel', 'date'], { before: d0, after: d1 }, null, { crop: ['peek'], min: [560, 330] });
  await pg.click('#idmp-toolbar [data-tb="ignore"]').catch(() => {}); await pg.waitForTimeout(1500); const d2 = await dateVal(pg); F.ours.undo = { form: d2 }; L('§FILM_FACTS ours undo form=' + d2 + ' (was ' + d1 + ', saved ' + d0 + ')'); await shot(P, 'ours_undo', ['date', 'bar'], { form: d2 }, null, { narrow: true });
  // Open on the credit blocker lands on the customer
  await pg.evaluate(() => { const b = document.querySelector('#idmp-howto-peek [data-lens-panel]'); });
  if (!(await pg.evaluate(() => !!document.querySelector('li[data-peek-key="BPartnerCreditHold"] a[data-peek-show]')))) { await pg.evaluate(() => window.IdmpPillActions.showme()); await pg.waitForTimeout(600); await pg.click('[data-lens-panel="friendly-ops:peek"]'); await pg.waitForTimeout(2500); }
  n = P.logs.length; await pg.evaluate(() => { const a = document.querySelector('li[data-peek-key="BPartnerCreditHold"] a[data-peek-show]'); if (a) a.click(); });
  const zz = await waitLine(P, /^§ZOOM window=123 /, n, 40); F.ours.open = { zoom: zz, landed: !!zz && /c_bpartner\.\S+=118 .*landed=true/i.test(zz) }; L('§FILM_FACTS ours open ' + zz);
  await pg.waitForTimeout(1500); await shot(P, 'ours_open', ['tabs', 'bpname'], { zoom: zz }, null, { narrow: true });
  // back to the order: ▶ Fix, Save -> the count follows
  await openOrder(P); await pg.waitForTimeout(1500);
  await pg.evaluate(() => window.IdmpPillActions.showme()); await pg.waitForTimeout(500); await pg.click('[data-lens-panel="friendly-ops:peek"]'); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { const b = document.querySelector('#idmp-howto-peek [data-lens-run="friendly-ops:fix"]'); if (b) b.click(); });
  await pg.waitForFunction(() => /Fixed:|Failed:/.test((document.getElementById('idmp-howto-peek') || {}).innerText || ''), null, { timeout: 20000 }); await pg.waitForTimeout(800);
  n = P.logs.length; await pg.click('#idmp-toolbar [data-tb="save"]'); const bg2 = await waitLine(P, /^§HELP_PEEK bg table=/, n, 60), bd2 = await badge(pg), sv = lastFrom(P, /^§CRUD-PERSIST key=c_order/, n);
  F.ours.saved = { bg: bg2, badge: bd2, save: sv, date: await dateVal(pg) }; L('§FILM_FACTS ours saved ' + bg2 + ' badge=' + bd2 + ' | ' + (sv || 'no save line').slice(0, 200) + ' date=' + F.ours.saved.date); await shot(P, 'ours_saved', ['door', 'date', 'panel'], { badge: bd2, bg: bg2 }, null, { crop: ['peek'], min: [560, 330] });
  // the person releases the hold in the Business Partner window (Credit Status -> OK, Save), comes back: count 0, Complete goes through
  await pg.evaluate(() => window.IdmpHost.zoom(123, null, 118)); await pg.waitForTimeout(3500);
  const cs0 = await pg.evaluate(() => { const e = document.querySelector('#idmp-inline-mount select[data-col="socreditstatus"]'); return e ? { v: e.value, opts: Array.from(e.options).map((o) => o.value + '=' + o.textContent.trim()) } : null; });
  L('§FILM_FACTS ours credit status before=' + JSON.stringify(cs0));
  n = P.logs.length; await pg.selectOption('#idmp-inline-mount select[data-col="socreditstatus"]', 'O'); await pg.dispatchEvent('#idmp-inline-mount select[data-col="socreditstatus"]', 'change'); await pg.waitForTimeout(500); await pg.click('#idmp-toolbar [data-tb="save"]'); await pg.waitForTimeout(2500);
  const cs1 = await pg.evaluate(() => { const e = document.querySelector('#idmp-inline-mount select[data-col="socreditstatus"]'); return e ? e.value : null; }), csv = lastFrom(P, /^§CRUD-PERSIST key=c_bpartner/, n);
  F.ours.release = { before: cs0, after: cs1, save: csv }; L('§FILM_FACTS ours credit released after=' + cs1 + ' | ' + (csv || 'NO SAVE LINE').slice(0, 200)); await shot(P, 'ours_release', ['tabs', 'credit'], { after: cs1 }, null, { narrow: true });
  n = P.logs.length; await openOrder(P); const bg3 = await waitLine(P, /^§HELP_PEEK bg table=/, n, 60), bd3 = await badge(pg); F.ours.ready = { bg: bg3, badge: bd3 }; L('§FILM_FACTS ours ready ' + bg3 + ' badge=' + bd3);
  const co = await complete(P); const st = await chip(pg), l2 = lastFrom(P, /^§AD-DOCFSM-LIVE table=259\(C_Order\) record=\d+ clicked=CO/, co.n), ok2 = lastFrom(P, /^§CRUD-HOSTPROCESS table=c_order .*action=CO .*outcome=success/, co.n), md = lastFrom(P, /^§MODEL-DOCACTION table=c_order .*action=CO/, co.n);
  F.ours.complete = { line: l2, refused: co.refused, chip: st, host: ok2, model: md }; L('§FILM_FACTS ours Complete chip=' + st + ' | ' + l2 + ' | ' + ok2 + ' | ' + md + ' | refused=' + co.refused);
  await shot(P, 'ours_done', ['bar', 'date'], { chip: st }, null, { narrow: true }); F.errors = F.errors.concat(P.errs); await P.close();
  }
  // ───────────────────────── A: NOW (plugin never started: legacy's behaviour) ─────────────────────────
  A: { if (ONLY && ONLY !== 'A') break A;
  P = await sess(); pg = P.pg; n = P.logs.length; await openOrder(P);
  const btns = await pg.evaluate(() => document.querySelectorAll('[data-lens-panel]').length), peekRan = P.logs.filter((l) => /^§HELP_PEEK (table|bg)/.test(l)).length, dA = await dateVal(pg);
  F.now.open = { lens_buttons: btns, peek_lines: peekRan, date: dA, chip: await chip(pg) }; L('§FILM_FACTS now open order=' + OID + ' chip=' + F.now.open.chip + ' date=' + dA + ' lens_buttons=' + btns + ' peek_lines=' + peekRan);
  await shot(P, 'now_open', ['bar', 'date'], F.now.open, null, { narrow: true });
  let c1 = await complete(P, 'now_ref1'); F.now.ref1 = { line: c1.line, toast: c1.toast, chip: await chip(pg) }; L('§FILM_FACTS now Complete#1 toast=' + JSON.stringify(c1.toast) + ' chip=' + F.now.ref1.chip + ' | ' + c1.line + ' | ' + (lastFrom(P, /^§CRUD process key=c_order .*REFUSED/, c1.n) || 'no REFUSED line'));
  const today = new Date().toLocaleDateString('sv'); /* the page's own 'today' is the local date */  for (let t = 0; t < 4; t++) { await pg.waitForTimeout(1500); await pg.fill(SELS.date, today); await pg.dispatchEvent(SELS.date, 'change'); await pg.waitForTimeout(1200); if ((await dateVal(pg)) === today) break; }   // the form may re-render once after a refusal: fill until the value holds
  if (process.env.FILM_DEBUG) L('DEBUG ' + JSON.stringify(P.logs.slice(-25).filter((l) => !/LOGIC_EVAL|AD_PARSER|FK-ACCESS|VALRULE|REFTABLE|REFLIST|CRUD-LIST|YESNO|GRIDFIELD/.test(l)).map((l) => l.slice(0, 140))) + ' sel=' + await pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.outerHTML.slice(0, 200) : 'none'; }, SELS.date));
  L('§FILM_FACTS now date typed ' + await dateVal(pg) + ' (today ' + today + ')');
  n = P.logs.length; await pg.click('#idmp-toolbar [data-tb="save"]'); const sv2 = await waitLine(P, /^§CRUD-PERSIST key=c_order/, n, 40); F.now.fixed = { save: sv2, date: await dateVal(pg) }; L('§FILM_FACTS now date fixed ' + F.now.fixed.date + ' | ' + (sv2 || 'NO SAVE LINE').slice(0, 220));
  await shot(P, 'now_fixed', ['bar', 'date'], F.now.fixed, null, { narrow: true });
  let c2 = await complete(P, 'now_ref2'); F.now.ref2 = { line: c2.line, toast: c2.toast, chip: await chip(pg) }; L('§FILM_FACTS now Complete#2 toast=' + JSON.stringify(c2.toast) + ' chip=' + F.now.ref2.chip + ' | ' + c2.line + ' | ' + (lastFrom(P, /^§CRUD process key=c_order .*REFUSED/, c2.n) || 'no REFUSED line'));
  F.errors = F.errors.concat(P.errs); await P.close();
  }
  // ───────────────────────── C: every window has its help, the guide link, the ask ─────────────────────────
  C: { if (ONLY && ONLY !== 'C') break C;
  P = await sess(); pg = P.pg;
  const openMenu = async (id, re) => { const n0 = P.logs.length; await pg.evaluate((m) => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + m + '"]').click(), id);
    for (let i = 0; i < 30; i++) { await pg.waitForTimeout(200); if (await pg.evaluate(() => !!document.querySelector('#idmp-find-ov [data-find-ok]'))) { await pg.click('#idmp-find-ov [data-find-ok]'); break; } if (lastFrom(P, re, n0)) break; } const l = await waitLine(P, re, n0, 40); await pg.waitForTimeout(1500); return l; };
  const topic = () => pg.evaluate(() => { const r = document.getElementById('idmp-howto-ctx'); if (!r) return null; const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : null), bolds = Array.from(r.querySelectorAll('b')).map((b) => b.textContent.trim()), a = Array.from(r.querySelectorAll('a')).filter((x) => /User Guide/.test(x.textContent)).pop(),
    stop = Array.from(r.querySelectorAll('p')).find((p) => /^What can stop Complete/.test(p.textContent.trim())), before = Array.from(r.querySelectorAll('p')).find((p) => /^Before you start/.test(p.textContent.trim()));
    return { bolds, before: T(before), stop: T(stop), guideText: a ? T(a) : null, guideHref: a ? a.getAttribute('href') : null, len: r.innerText.length }; });
  const still = async (name, label) => { await pg.evaluate((t) => { const r = document.getElementById('idmp-howto-ctx'); const b = Array.from(r.querySelectorAll('b')).find((x) => x.textContent.trim().indexOf(t) === 0); if (b) (b.closest('p') || b).scrollIntoView({ block: 'start' }); }, label); await pg.waitForTimeout(800); await shot(P, name, ['ctx'], { label }, null, { crop: ['panel'], h: 620, min: [540, 620] }); };
  F.help.ship = { line: await openMenu(180, /^§HELP_CTX .* type=T id=257 /) }; F.help.ship.t = await topic(); L('§FILM_FACTS help ship ' + F.help.ship.line + ' ' + JSON.stringify(F.help.ship.t).slice(0, 700)); await still('help_ship', 'Before you start');
  F.help.po = { line: await openMenu(205, /^§HELP_CTX .* type=T id=294 /) }; F.help.po.t = await topic(); L('§FILM_FACTS help po ' + F.help.po.line + ' ' + JSON.stringify(F.help.po.t).slice(0, 700)); await still('help_po', 'Before you start');
  F.help.so = { line: await openMenu(129, /^§HELP_CTX .* type=T id=186 /) }; F.help.so.t = await topic(); L('§FILM_FACTS help so ' + F.help.so.line + ' ' + JSON.stringify(F.help.so.t).slice(0, 700));
  await pg.evaluate(() => { const r = document.getElementById('idmp-howto-ctx'); const a = Array.from(r.querySelectorAll('a')).filter((x) => /User Guide/.test(x.textContent)).pop(); if (a) a.scrollIntoView({ block: 'end' }); }); await pg.waitForTimeout(800); await shot(P, 'help_so_foot', ['ctx'], { guideHref: F.help.so.t && F.help.so.t.guideHref }, null, { crop: ['panel'], h: 620, min: [540, 620] });
  F.errors = F.errors.concat(P.errs);
  // the ask (typed on the film's strip; the page's own answer card)
  n = P.logs.length; const Q = 'How do I close a Sales Order?';
  F.ask = await pg.evaluate((q) => { const c = window.__idmpHowto.ask(q); return c ? { window: c.window && { id: c.window.id, name: c.window.name }, action: c.action && { code: c.action.code, name: c.action.name }, cli: c.cli && (c.cli.line || c.cli.note), matched: c.matched } : null; }, Q); F.ask.q = Q;
  await pg.waitForTimeout(1200); F.ask.card = await pg.evaluate(() => { const c = document.getElementById('idmp-howto-card'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : null; }); F.ask.lines = P.logs.slice(n).filter((l) => /^§HELP_ASK|^§HELP_SEARCH ask|^§HELP_SEARCH /.test(l)).slice(-3);
  L('§FILM_FACTS ask ' + JSON.stringify(F.ask)); await shot(P, 'ask_card', ['card'], { q: Q });
  await P.close();
  }
  // the live guide page: the same section online (HTTP, the anchor present in the served HTML)
  const href = F.help.so && F.help.so.t && F.help.so.t.guideHref; F.guide = { href };
  if (href) { const br = await chromium.launch({ headless: true, args: ['--disable-gpu'] }), ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }), g = await ctx.newPage();
    try { const resp = await g.goto(href, { waitUntil: 'load', timeout: 60000 }); F.guide.status = resp && resp.status(); const id = href.split('#')[1]; await g.waitForTimeout(1500);
      F.guide.anchor = await g.evaluate((id) => { const e = document.getElementById(id); if (!e) return null; e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { text: e.textContent.trim().slice(0, 80), y: Math.round(b.y * 1.5) }; }, id); await g.waitForTimeout(700);
      F.guide.title = await g.title(); await g.screenshot({ path: path.join(PAGES, 'guide_live.png') }); F.shots.guide_live = { file: 'pages/guide_live.png', ok: !!(F.guide.anchor), crop: { x: 0, y: 100, w: 1920, h: 700 } };
    } catch (e) { F.guide.error = String(e && e.message).slice(0, 200); } await br.close(); }
  L('§FILM_FACTS guide ' + JSON.stringify(F.guide));
  L('§FILM_FACTS errors=' + F.errors.length + (F.errors.length ? ' first=' + F.errors[0].slice(0, 160) : ''));
  if (!ONLY) fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); if (!ONLY) fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n');
})().catch((e) => { L('§FILM_ERROR ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); process.exit(1); });
