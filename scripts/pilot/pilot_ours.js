// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_ours.js — drive OUR ERP (bim-ootb erp/idempiere.html, served from a worktree) in headless Chromium through the SAME
// generic AD surfaces a user uses: window → tab → New → fields ([data-col]) → Save → DocAction bar button. No per-window code.
'use strict';
const cfg = require('./pilot_cfg'), http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(cfg.PW);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm' };

async function start(opts) {
  opts = opts || {};
  const root = cfg.OOTB;
  const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]);
    fs.readFile(path.join(root, p), (e, buf) => { if (e) { res.writeHead(404); res.end('404 ' + p); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': buf.length }); res.end(buf); }); });
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const LOG = [], ERRS = [];
  page.on('console', m => LOG.push(m.text())); page.on('pageerror', e => ERRS.push(e.message));
  const o = { base, page, LOG, ERRS, server, browser, login: opts.login || 'GardenAdmin',
    since: (n, re) => LOG.slice(n).filter(l => re.test(l)), last(n, re) { return this.since(n, re).pop() || ''; },
    async close() { await browser.close(); server.close(); } };
  return o;
}
async function openWin(o, win) {
  const { page } = o;
  await page.goto(o.base + '/idempiere.html?login=' + encodeURIComponent(o.login) + '&window=' + win, { waitUntil: 'load' });
  await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 30000 });
  await page.waitForTimeout(900);
}
async function clickNew(o) {
  await o.page.click('#idmp-toolbar button[title^="New record"]');
  await o.page.waitForSelector('#idmp-inline-mount .cfrow', { timeout: 10000 }); await o.page.waitForTimeout(700);
}
async function save(o) { await o.page.click('#idmp-toolbar button[title^="Save"]'); await o.page.waitForTimeout(1400); }
// set one field by AD column (lower-case data-col) the way a user would: select option / checkbox / text. Returns what happened.
async function setField(o, col, val) {
  const { page } = o; const sel = '#idmp-inline-mount [data-col="' + col + '"]';
  const el = await page.$(sel);
  if (!el) return 'NO-FIELD';
  const info = await el.evaluate(e => ({ tag: e.tagName, type: e.type || '', ro: e.readOnly || e.disabled }));
  if (info.ro) return 'READONLY';
  if (info.tag === 'SELECT') {
    const has = await el.evaluate((e, v) => Array.from(e.options).some(x => String(x.value) === String(v)), val);
    if (!has) return 'NO-OPTION';
    if (!(await el.isVisible())) { await el.evaluate((e, v) => { e.value = String(v); e.dispatchEvent(new Event('change', { bubbles: true })); }, val); return 'ok(hidden-field-set-by-DOM)'; }
    await page.selectOption(sel, String(val), { timeout: 5000 }); await page.waitForTimeout(250); return 'ok';
  }
  if (info.type === 'checkbox') { await el.evaluate((e, v) => { e.checked = (v === 'Y' || v === true); e.dispatchEvent(new Event('change', { bubbles: true })); }, val); return 'ok'; }
  const vis = await el.isVisible();
  if (!vis) { await el.evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, String(val)); return 'ok(hidden-field-set-by-DOM)'; }
  await page.locator(sel).first().fill(String(val), { timeout: 5000 }); await page.locator(sel).first().evaluate(e => e.blur()).catch(() => {}); await page.waitForTimeout(250); return 'ok';
}
const readForm = o => o.page.evaluate(() => Object.fromEntries(Array.from(document.querySelectorAll('#idmp-inline-mount [data-col]')).filter(e => e.tagName !== 'SPAN').map(e => [e.getAttribute('data-col'), e.type === 'checkbox' ? (e.checked ? 'Y' : 'N') : e.value])));
// all committed ops (the signed op-log = our ONLY write truth). Returns plain rows.
const allOps = o => o.page.evaluate(() => new Promise(res => { const c = window.__crud, K = window.ERPKernel || window.ERPKernel;
  const f = () => { try { const db = c.kernelDb(); const k = window.KernelOps; res(k && k.allRowsPlain ? k.allRowsPlain(db) : 'no-allRowsPlain'); } catch (e) { res('ERR ' + e.message); } };
  if (c.withSidecar) c.withSidecar(f); else f(); }));
const q = (o, sql) => o.page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql);
module.exports = { start, openWin, clickNew, save, setField, readForm, allOps, q };
