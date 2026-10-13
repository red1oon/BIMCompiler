// harness.js — shared plumbing for the STANDARD GARDENWORLD USE-CASE SET (scripts/erp_usecases/, spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §UC-SET).
// A use case = a module exporting { id, title, spec, enter(h, opts) -> {facts} } that drives REAL ERP gestures in a headless browser (CPU only) and returns §-fact values.
// RESET: every harness run opens a FRESH browser context (empty IndexedDB / op-log), so GardenWorld reloads from ad_seed.db and nothing a use case entered survives the run;
// `reset-proof` (run_usecases.js) additionally PROVES it: the report is run before, after entering, and after a second fresh context - before == after-reset or it prints FAIL.
// Gestures are taken from the DEPTH lane's witness bim-ootb erp/tests/poc_depth_cycle_live.js (read-only reuse; that file is not edited here).
'use strict';
const os = require('os'), http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || (os.homedir() + '/bim-ootb/tests/node_modules/playwright'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.xlsx': 'application/octet-stream', '.ttf': 'font/ttf', '.db': 'application/octet-stream', '.svg': 'image/svg+xml' };
async function open(root, opts) {
  opts = opts || {};
  const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = path.join(root, p);
    fs.stat(f, (e, s) => { if (e || s.isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': s.size }); fs.createReadStream(f).pipe(r); }); });
  await new Promise(r => srv.listen(0, r));
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, acceptDownloads: true, deviceScaleFactor: opts.scale || 1 });
  if (opts.initScript) await ctx.addInitScript(opts.initScript);
  const pg = await ctx.newPage(); const logs = [], errs = [];
  pg.on('console', m => logs.push(m.text())); pg.on('pageerror', e => errs.push(e.message));
  const base = 'http://localhost:' + srv.address().port;
  const h = { pg, logs, errs, base, close: async () => { await browser.close(); srv.close(); } };
  h.login = async () => {
    await pg.goto(base + '/erp/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => !!window.__idmpDb, null, { timeout: 30000 });
    await pg.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0);
    await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
    await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.click('#idmp-login-ok');
    await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0);
  };
  h.tip = (sql) => pg.evaluate(s => window.__crud.withModelTrx(q => q(s)), sql);                 // tip-shadowed read: bundle + this session's signed ops
  h.hc = async (sel) => { const l = pg.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await pg.waitForTimeout(350); };
  h.opts = (col) => pg.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', o => o.map(x => ({ v: x.value, t: x.text }))).catch(() => []);
  h.F = (c, t) => '#idmp-inline-mount ' + (t || 'input') + '[data-col="' + c + '"]';
  h.pick = async (col, re) => { const o = (await h.opts(col)).find(x => x.v && re.test(x.t)); if (!o) throw new Error('no option ' + col + ' ' + re); await pg.selectOption(h.F(col, 'select'), o.v); await pg.waitForTimeout(450); return o.t; };
  h.openWindow = async (windowId) => {                                                           // open a window through the menu tree, folder by folder (poc_depth_cycle_live.js:42-48)
    const mid = await pg.evaluate(w => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'");
      return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }, windowId);
    const chain = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); const out = []; let n = leaf.parentElement.parentElement;
      while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid);
    for (const id of chain) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id);
      if (!open) await h.hc('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); }
    await h.hc('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid + '"]'); await pg.waitForSelector('#idmp-toolbar [data-tb="new"]'); await pg.waitForTimeout(800); return mid;
  };
  return h;
}
module.exports = { open };
