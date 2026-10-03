// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-FILM part 1 (prompts/FILM_NARRATION.md §5) — RECORD the ERP First Setup guide (docs/ERP_FirstSetup.md,
//   steps S01..S07) as a film, at human pace, in a headless browser (CPU only, --disable-gpu). Selectors and SQL
//   oracles are copied from the guide's witness bim-ootb/erp/tests/poc_erp_first_setup_live.js (not edited here).
//   THE ISSUE this proves/disproves: can the guide's steps be filmed end-to-end with no human at the keyboard, with
//   every number the narration will say printed as a §ERP_FILM_FACT read from the live in-browser DB.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log (page console) before any
//   conclusion. Exit code is not evidence.
// Run:  node scripts/film_erp_first_setup.js <outDir>        → <outDir>/erp_film_part1.mp4 (24 fps, 1920×1080)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const REPO = path.join(require('os').homedir(), 'bim-ootb');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.zip': 'application/zip', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(REPO, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': buf.length }); res.end(buf);
  });
});

// visible cursor + click ripple (headless has no pointer of its own)
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;' +
    'background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat;transition:none';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;' +
      'left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.on('console', m => PAGELOG.push(m.text()));
  page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e));
  page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept(); });
  let seedBytes = null;
  page.on('response', r => { if (/\/erp\/ad_seed\.db/.test(r.url())) seedBytes = Number(r.headers()['content-length'] || 0) || null; });
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const one = async (sql) => { const r = await page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql); return Array.isArray(r) && r.length ? r[0][0] : r; };
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));

  // clear the cache BEFORE recording, so the film opens on a true cold first load (guide S01)
  await page.goto(base + '/idempiere.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase('erp_cache'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
  await page.goto('about:blank'); seedBytes = null;

  // ── screencast: every changed frame, timestamped ──
  const cdp = await ctx.newCDPSession(page); const frames = []; let T0 = null;
  cdp.on('Page.screencastFrame', async f => {
    const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg');
    fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp });
    if (T0 === null) T0 = f.metadata.timestamp;
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0);
  // BEAT_MIN (env JSON {beat: seconds}) = the spoken length of each beat's dialogue (+ a breath), measured by the
  // fitter first; a beat is held until its dialogue has room, so the film is cut to the narration, not the reverse.
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, note) => {
    if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§ERP_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    prev = { id, t: now() }; say('§ERP_FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' ' + (note || ''));
  };
  const hold = (ms) => page.waitForTimeout(ms);
  async function glide(sel) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 28 }); await hold(220);
  }
  let clicks = 0, cursorOk = 0;
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox();
    clicks++; if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(350);
  }
  async function htype(sel, text) { await hclick(sel); await page.locator(sel).first().fill(''); await page.keyboard.type(text, { delay: 85 }); await hold(300); }

  try {
    // S01 — cold load
    await page.mouse.move(720, 405);
    await beat('open', 'cold first load');
    const n0 = PAGELOG.length;
    await page.goto(base + '/idempiere.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__idmpDb, null, { timeout: 30000 });
    fact('seedMiB', (seedBytes / 1048576).toFixed(1)); fact('boot', last(n0, /§IDEMPIERE boot db=/));
    await page.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 20000 });
    const tenants = await page.$$eval('#idmp-login-clients .nm', e => e.map(x => x.textContent.trim()));
    fact('tenants', tenants.length + ' [' + tenants.join(',') + ']');
    await hold(2500);

    // S02 — login: tenant → user → role
    await beat('login', 'System tenant -> System user -> role');
    await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('System'))");
    await page.waitForSelector('#idmp-login-step1:visible', { timeout: 8000 }); await hold(900);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('System'))");
    await page.waitForSelector('#idmp-login-step2:visible', { timeout: 8000 }); await hold(1400);
    fact('role', (await page.$eval('#idmp-login-step2', e => e.innerText)).replace(/\s+/g, ' ').slice(0, 120));
    await hclick('#idmp-login-ok');
    await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 });
    fact('menu', last(0, /§IDEMPIERE menu groups=/));
    await hold(1500);

    // S03 — menu → Initial Tenant Setup (open each folder on the way, by hand)
    await beat('menu', 'open Initial Tenant Setup');
    const chain = await page.evaluate(() => {
      const leaf = Array.from(document.querySelectorAll('#idmp-tree .idmp-row.leaf')).find(r => r.querySelector('.nm').textContent.trim() === 'Initial Tenant Setup');
      const out = []; let n = leaf && leaf.parentElement;
      while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node') && n !== leaf.parentElement) out.unshift(n.querySelector(':scope > .idmp-row .nm').textContent.trim()); n = n.parentElement; }
      return out;
    });
    fact('menuPath', chain.join(' > ') + ' > Initial Tenant Setup');
    for (const name of chain) {
      const open = await page.evaluate(nm => { const r = Array.from(document.querySelectorAll('#idmp-tree .idmp-row:not(.leaf)')).find(x => x.querySelector('.nm').textContent.trim() === nm); return r && r.parentElement.classList.contains('open'); }, name);
      if (!open) await hclick(`#idmp-tree .idmp-row:not(.leaf):has(> .nm:text-is("${name}"))`);
    }
    await hclick("#idmp-tree .idmp-row.leaf:has(.nm:text-is('Initial Tenant Setup'))");
    await page.waitForSelector('[data-genesis-create]', { timeout: 8000 }); await hold(1500);

    // S03/S04 — name, admin, currency → Create
    await beat('form', 'type company name + admin, pick MYR');
    await htype('[data-genesis-name]', 'FirstCo');
    await htype('[data-genesis-admin]', 'owner');
    const PICK = Number(await one("SELECT C_Currency_ID FROM C_Currency WHERE ISO_Code='MYR' AND IsActive='Y'"));
    fact('currencyOptions', await page.$$eval('[data-genesis-currency] option', o => o.length));
    await hclick('[data-genesis-currency]'); await page.selectOption('[data-genesis-currency]', String(PICK)); await hold(900);
    await beat('create', 'Create tenant');
    const n1 = PAGELOG.length;
    await hclick('[data-genesis-create]');
    await page.waitForSelector('[data-genesis-enter]', { timeout: 25000 });
    const CID = Number(await one("SELECT AD_Client_ID FROM AD_Client WHERE Name='FirstCo'"));
    fact('created', last(n1, /§W-GENESIS-SYSADMIN-LIVE created client=/)); fact('clientId', CID);
    await hold(1200);

    // S05..S07 — what the new company was born with (read from the live DB; the narration says these)
    await beat('facts', 'what the new company was born with');
    fact('accounts', await one('SELECT COUNT(*) FROM C_ElementValue WHERE AD_Client_ID=' + CID));
    fact('periods', await one('SELECT COUNT(*) FROM C_Period WHERE AD_Client_ID=' + CID));
    fact('fiscalYear', await one('SELECT FiscalYear FROM C_Year WHERE AD_Client_ID=' + CID));
    fact('docTypes', await one('SELECT COUNT(*) FROM C_DocType WHERE AD_Client_ID=' + CID));
    fact('acctSchemaCcy', await one('SELECT c.ISO_Code FROM C_AcctSchema a JOIN C_Currency c ON c.C_Currency_ID=a.C_Currency_ID WHERE a.AD_Client_ID=' + CID));
    fact('priceListCcy', await one('SELECT c.ISO_Code FROM M_PriceList p JOIN C_Currency c ON c.C_Currency_ID=p.C_Currency_ID WHERE p.AD_Client_ID=' + CID));
    await glide('[data-genesis-enter]'); await hold(5000);

    // Enter the new company → its own login, with its admin user
    await beat('enter', 'Enter FirstCo');
    await hclick('[data-genesis-enter]');
    await page.waitForSelector('#idmp-login-step1:visible', { timeout: 8000 });
    fact('enterUsers', (await page.$$eval('#idmp-login-users .nm', e => e.map(x => x.textContent.trim()))).join(','));
    await hold(4000);
    await beat('end', '');
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§ERP_FILM_ERROR ' + e.message.split('\n')[0]); }

  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300);
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  // constant-fps film: each frame held until the next one arrived; last held to the end
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'erp_film_part1.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
