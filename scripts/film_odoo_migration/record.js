#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: the RECORD step of the film "How to escape from your Odoo" (storyboard script_en.md, bim-compiler prompts/MIGRATE_INSTALL_TENANT.md). READ out/record.log after
//   every run: every number the film says is a § line here (§FILMREC FACT k=v), taken from the page's own log or counted from the browser — never typed. Headless Chromium, --disable-gpu.
// Shots (1920x1080 = 1280x720 at device scale 1.5): Odoo contacts · the new company on the login screen · the Migrate from Odoo form (files, units, summary, done) · the migrated
//   customers and products in the ERP's own windows · a save with the network CUT (requests counted) · the Team strip (the relay screen).
// Run: node record.js <erp-tree-root> <outdir>    (Odoo up on localhost:8069; the ERP tree = a bim-ootb checkout with the Ninja + Migrate-from-Odoo plugins)
'use strict';
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const ROOT = process.argv[2] || '/tmp/wt-genesis-g1', OUT = process.argv[3] || path.join(__dirname, 'out/rec'), FIXD = path.join(ROOT, 'erp/tests/fixtures/odoo_export_2026-11-09');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
fs.mkdirSync(OUT, { recursive: true });
const LOG = [], facts = {}, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => { console.log(s); LOG.push(s); };
const fact = (k, v, src) => { facts[k] = v; say('§FILMREC FACT ' + k + '=' + JSON.stringify(v) + (src ? ' src=' + src : '')); };
const VIEW = { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 };

(async () => {
  const PIPE_DIR = fs.mkdtempSync('/tmp/film-pipe-');
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
    if (p === '/pipe/list') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(fs.readdirSync(PIPE_DIR))); return; }
    if (p.indexOf('/pipe/f/') === 0) { const fp = path.join(PIPE_DIR, p.slice(8).replace(/\//g, '_'));
      if (req.method === 'PUT') { const ch = []; req.on('data', (c) => ch.push(c)); req.on('end', () => { fs.writeFileSync(fp, Buffer.concat(ch)); res.writeHead(200); res.end('ok'); }); return; }
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; } res.writeHead(200); fs.createReadStream(fp).pipe(res); return; }
    const f = path.join(ROOT, p === '/' ? '/erp/idempiere.html' : p);
    if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  try {
    // ── Odoo: the "before" (its own Contacts screen) ──
    const oc = await browser.newContext(VIEW), op = await oc.newPage();
    await op.goto('http://localhost:8069/web/login'); await op.fill('#login', 'admin'); await op.fill('#password', 'admin'); await op.click('button[type=submit]');
    await op.waitForURL(/\/(web|odoo)/, { timeout: 60000 });
    await op.goto('http://localhost:8069/web#action=base.action_partner_form'); await op.waitForSelector('.o_kanban_record', { timeout: 60000 }); await sleep(2500);   // the demo has no Contacts app: Customers (base.action_partner_form)
    await op.screenshot({ path: path.join(OUT, 'odoo_contacts.png') });
    fact('odoo_customer_cards', await op.$$eval('.o_kanban_record:not(.o_kanban_ghost)', (a) => a.length), 'odoo DOM');
    await oc.close();

    // ── the ERP: start the two plugins (System Administrator), birth + install the new company ──
    const ctx = await browser.newContext(VIEW), logs = [], errs = [];
    async function open(q) {
      const pg = await ctx.newPage(); pg.on('console', (m) => logs.push(m.text())); pg.on('pageerror', (e) => errs.push(e.message));
      await pg.goto(base + '/erp/idempiere.html?lang=en_US' + (q || ''), { waitUntil: 'load' });
      await pg.waitForFunction(() => !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 120000 });
      await sleep(2500); return pg;
    }
    async function login(pg, client, user, role) {
      await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await pg.waitForSelector('#idmp-login-users .idmp-login-user', { timeout: 15000 });
      await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await pg.waitForSelector('#idmp-login-step2:visible');
      if (role != null) { try { await pg.selectOption('#idmp-login-role', String(role)); } catch (e) {} }
      await pg.click('#idmp-login-ok');
      await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 60000 }); await sleep(1500);
    }
    let pg = await open('');
    await login(pg, 'System', 'System', 0);
    await pg.evaluate(() => { window.PluginRelease.open(); }); await pg.waitForSelector('#pr-osgi table.oc-t', { timeout: 15000 }); await sleep(800);
    for (const id of ['org.idempiere.ninja.migrate', 'org.kernel.odoo.migrate']) { if (await pg.$('[data-oc-start="' + id + '"]')) { await pg.click('[data-oc-start="' + id + '"]'); await sleep(2500); } }
    const inst = await pg.evaluate(async () => { const b = window.Genesis.birthTenant({ clientName: 'Escape Co', currencyId: 100, currencyIso: 'USD', currencyPrecision: 2, adminUser: 'escapeAdmin', dateAcct: '2026-11-09', countryId: 100 });
      const r = await window.idmpInstallGenesis(b); const role = window.__idmpDb.exec("SELECT ad_role_id FROM ad_role WHERE ad_client_id=" + r.clientId + " AND name LIKE '%Admin'"); return { r, role: role.length ? role[0].values[0][0] : null }; });
    fact('tenant', inst.r, '§GENESIS-RESIDENT-LIVE');
    await pg.close();

    // ── the login screen with the new company; its admin logs in; the form ──
    pg = await open('');
    await pg.screenshot({ path: path.join(OUT, 'login_newco.png') });
    await login(pg, 'Escape Co', 'escapeAdmin', inst.role);
    const openLeaf = (id) => pg.evaluate((id) => { const lf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!lf) return false; let n = lf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.style) n.style.display = ''; n = n.parentElement; } lf.scrollIntoView(); lf.click(); return true; }, id);
    fact('menu_leaf', await openLeaf(9542001), 'DOM');
    await pg.waitForSelector('[data-gform="org.kernel.odoo.MigrateFromOdoo"] [data-gform-param="Files"]', { timeout: 20000 });
    await pg.setInputFiles('[data-gform-param="Files"]', [path.join(FIXD, 'odoo_migration.xlsx'), path.join(FIXD, 'manifest.json')]);
    await pg.waitForFunction(() => document.querySelectorAll('[data-gform-row]').length > 10, null, { timeout: 60000 }); await sleep(1200);
    await pg.screenshot({ path: path.join(OUT, 'form_units.png') });
    await pg.evaluate(() => { const A = { 'Unit: Units': 'Each', 'Unit: Days': 'Day', 'Unit: Hours': 'Hour' };
      document.querySelectorAll('[data-gform-row]').forEach((tr) => { const it = tr.children[1] && tr.children[1].innerText.trim(); const inp = tr.querySelector('[data-gform-cell="erpunit"]'); if (inp && A[it]) inp.value = A[it]; }); });
    let mark = logs.length;
    await pg.click('[data-gform="org.kernel.odoo.MigrateFromOdoo"] [data-gform-refresh]');
    await pg.waitForFunction(() => !Array.prototype.some.call(document.querySelectorAll('[data-gform-row]'), (t) => /⚠/.test(t.innerText)), null, { timeout: 90000 }); await sleep(1200);
    const sum = logs.slice(mark).filter((l) => /§ODOO-FORM summary ok=/.test(l)).pop() || '';
    fact('summary_line', sum.slice(0, 600), '§ODOO-FORM summary');
    await pg.screenshot({ path: path.join(OUT, 'form_summary.png') });
    mark = logs.length;
    await pg.click('[data-gform="org.kernel.odoo.MigrateFromOdoo"] [data-gform-run]');
    await pg.waitForFunction(() => { const m = document.querySelector('[data-gform-msg]'); return m && /Migrated from Odoo|Not migrated|refused|Failed/i.test(m.innerText); }, null, { timeout: 120000 }); await sleep(1500);
    const commit = logs.slice(mark).filter((l) => /§AD-FORM-GENERIC commit class=org\.kernel\.odoo/.test(l)).pop() || '';
    fact('commit_line', commit, '§AD-FORM-GENERIC commit');
    fact('commit_ops', Number((/ops=(\d+)/.exec(commit) || [])[1]), '§AD-FORM-GENERIC commit');
    fact('verify_chain', (/verifyChain=(\w+)/.exec(commit) || [])[1], '§AD-FORM-GENERIC commit');
    fact('form_msg', await pg.evaluate(() => (document.querySelector('[data-gform-msg]') || {}).innerText), 'DOM');
    await pg.screenshot({ path: path.join(OUT, 'form_done.png') });
    const tip = await pg.evaluate((cid) => new Promise((res) => { window.__crud.modelRun({ table: 'c_bpartner', timing: 'PROCESS', fn: (trx) => { const o = {};
      ['c_bpartner', 'm_product', 'm_inventoryline', 'c_elementvalue', 'ad_user'].forEach((t) => { o[t] = trx.q('SELECT count(*) AS n FROM ' + t + ' WHERE ad_client_id=?', [cid])[0].n; }); res(o); return { ok: true }; } }, () => {}); }), inst.r.clientId);
    fact('tenant_counts_after', tip, 'the tip via __crud.modelRun');

    // ── the migrated customers / products in the ERP's own windows ──
    const leafOf = (win) => pg.evaluate((w) => { const r = window.__idmpDb.exec('SELECT ad_menu_id FROM ad_menu WHERE ad_window_id=' + w + " AND isactive='Y' ORDER BY ad_menu_id"); return r.length ? r[0].values[0][0] : null; }, win);
    const bpLeaf = await leafOf(123), prLeaf = await leafOf(140);
    const findOk = async (tag) => { await sleep(2500); const f = await pg.$('[data-find-ok]'); const rec = f ? await pg.$eval('[data-find-records]', (x) => x.getAttribute('data-find-records')).catch(() => null) : null;
      fact(tag + '_find_records', rec, 'Find dialog data-find-records'); if (f) { await pg.click('[data-find-ok]'); await sleep(3000); } };
    const gridRows = () => pg.evaluate(() => { try { const s = window.IdmpGridTab && window.IdmpGridTab.snapshot(); return s ? s.rows.length : null; } catch (e) { return null; } });
    fact('bp_leaf', await openLeaf(bpLeaf), 'DOM'); await findOk('bp');
    fact('bp_grid_rows', await gridRows(), 'IdmpGridTab.snapshot');
    const toGrid = async () => { const t = await pg.$('#idmp-toolbar [data-tb="toggle"]'); if (t) { await t.click(); await sleep(2000); } return !!t; };
    fact('bp_grid_view', await toGrid(), 'DOM');
    await pg.screenshot({ path: path.join(OUT, 'bp_window.png') });
    fact('pr_leaf', await openLeaf(prLeaf), 'DOM'); await findOk('pr');
    fact('pr_grid_rows', await gridRows(), 'IdmpGridTab.snapshot');
    fact('pr_grid_view', await toGrid(), 'DOM');
    await pg.screenshot({ path: path.join(OUT, 'product_window.png') });

    // ── the network CUT: back to a customer, edit, save — count every request the page tries ──
    await openLeaf(bpLeaf); await findOk('bp2'); await sleep(1000);
    if (!(await pg.$('#idmp-inline-mount .cfrow[data-row="description"] [data-col]'))) { await toGrid(); }   // back to the form view if the window kept the grid
    let reqs = 0; const onReq = () => { reqs++; }; pg.on('request', onReq);
    await ctx.setOffline(true); mark = logs.length;
    const online = await pg.evaluate(() => navigator.onLine);
    const set = await pg.evaluate(() => { const c = document.querySelector('#idmp-inline-mount .cfrow[data-row="description"] [data-col]'); if (!c) return 'no-field'; c.value = 'saved with the internet off'; c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); return 'set'; });
    await pg.click('#idmp-toolbar button[data-tb="save"]'); await sleep(3000);
    const persist = logs.slice(mark).filter((l) => /§CRUD-PERSIST key=c_bpartner/.test(l)).pop() || '';
    fact('offline_navigator_online', online, 'navigator.onLine'); fact('offline_field', set, 'DOM');
    fact('offline_persist_line', persist, '§CRUD-PERSIST'); fact('offline_requests', reqs, 'page request events while offline');
    fact('offline_proven', !online && /verifyChain=ok/.test(persist) && reqs === 0, 'derived');
    await pg.screenshot({ path: path.join(OUT, 'offline_saved.png') });
    pg.off('request', onReq); await ctx.setOffline(false);
    fact('page_errors', errs.filter((e) => !/ResizeObserver/.test(e)).length, 'pageerror');
    await pg.close(); await ctx.close();

    // the relay screen: the Team panel's Start-a-team box is the team guide's own screenshot (erp/guide_img/team_panel_before.png) — owner 2026-11-09: "showing the Start Team panel is good enough"
  } catch (e) { say('§FILMREC ERROR ' + (e && (e.stack || e.message))); }
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(facts, null, 1)); fs.writeFileSync(path.join(OUT, 'record.log'), LOG.join('\n') + '\n');
  say('§FILMREC DONE shots=' + fs.readdirSync(OUT).filter((f) => /\.png$/.test(f)).length);
})();
