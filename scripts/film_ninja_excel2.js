// ⚠ DO NOT REMOVE — Scope guard
// Scope: §TB-FILM2 (bim-compiler prompts/NINJAEXCEL_TEMPLATE_ENGINE.md) — RAW (silent) FILM 2 of the NinjaExcel Report series: "a report that grows as you sell". The Thai Sales Register is run in the ERP pill (4 rows),
//   THREE real POS sales are entered on camera (UC-1, the standard GardenWorld use case), the register is run again (rows pushed down, totals follow), the Trial Balance of the same session still balances, then the
//   local data is cleared and the register is run once more: back to the original rows. Headless Chromium, CPU only. Structure from film_ninja_excel.js (film 1) and scripts/erp_usecases/.
//   THE ISSUE this proves/disproves: can the whole data-entry story be filmed in ONE take with every number the narration will say printed as a §TB_FILM2_FACT read from the live panel / the live tip db.
// §-log first — READ <out>/tb_film2.log and tb_film2.page.log. Exit code is not evidence. No customer data (GardenWorld only); no invented numbers.
// Run: node scripts/film_ninja_excel2.js <outDir>      env OOTB=<bim-ootb root carrying the port> (default /tmp/wt-ninja-port)  SALES=3  BEAT_MIN='{"beat":seconds}'
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), cp = require('child_process');
const H = require('./erp_usecases/harness'); const UC1 = require('./erp_usecases/uc1_pos_sale');
const ROOT = process.env.OOTB || '/tmp/wt-ninja-port', SALES = Number(process.env.SALES || 3), Y = new Date().getFullYear();
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const FROM = '2002-01-01', TO = Y + '-12-31';
const LOG = [], say = (s) => { LOG.push(s); console.log(s); }, fact = (k, v) => say('§TB_FILM2_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;' +
    'background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;' +
      'left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CARD = (h, lines, small) => `<style>body{margin:0;background:#12151f;color:#e6ebf5;font-family:'Noto Sans Thai','Noto Sans',system-ui,sans-serif}.card{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px}.card h1{font-size:54px;margin:0 0 26px;font-weight:600}.card p{font-size:30px;margin:8px 0;opacity:.88}.card small{font-size:20px;opacity:.6;margin-top:30px}</style><div class="card"><h1>${esc(h)}</h1>${(lines || []).map(l => `<p>${esc(l)}</p>`).join('')}${small ? `<small>${esc(small)}</small>` : ''}</div>`;
const parseN = (s) => { s = String(s).trim(); if (s === '' || s === '-') return 0; const neg = /^\(.*\)$/.test(s); const v = +s.replace(/[(),]/g, ''); return neg ? -v : v; };

(async () => {
  const h = await H.open(ROOT, { initScript: CURSOR, scale: 4 / 3 }); const page = h.pg;
  page.on('dialog', async d => { h.logs.push('DIALOG ' + d.message()); await d.accept(); });
  const cdp = await h.ctx.newCDPSession(page); const frames = []; let T0 = null;
  cdp.on('Page.screencastFrame', async f => {
    const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp });
    if (T0 === null) T0 = f.metadata.timestamp; cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0);
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, note) => {
    if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§TB_FILM2_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    prev = { id, t: now() }; say('§TB_FILM2_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' ' + (note || ''));
  };
  const hold = (ms) => page.waitForTimeout(ms); let STEPS = 28, clicks = 0, cursorOk = 0;
  async function glide(sel) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: STEPS }); await hold(STEPS > 12 ? 220 : 90);
  }
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox(); clicks++;
    if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    else say('§TB_FILM2_CURSOR_MISS sel=' + sel + ' cursor=' + JSON.stringify(c) + ' target=' + (b ? Math.round(b.x + b.width / 2) + ',' + Math.round(b.y + b.height / 2) : 'none'));
    await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(STEPS > 12 ? 350 : 200);
  }
  // the standard use case runs unchanged on the film's hands: every click glides the visible cursor; a select pick glides to the dropdown first
  h.hc = hclick; const pick0 = h.pick; h.pick = async (col, re) => { await glide(h.F(col, 'select')); await hold(STEPS > 12 ? 400 : 120); return pick0(col, re); };
  const readGrid = () => page.evaluate(() => [...document.querySelectorAll('#np-preview tr')].map(tr => [...tr.children].map(td => td.textContent)));
  const regFacts = async () => { const g = await readGrid(), t = g.findIndex(r => r[0] === 'รวม'); return { rows: t - 6, total: parseN(g[t][3]), count: g[t + 2] ? parseN(g[t + 2][3]) : null, totalsRow: t + 1 }; };
  const openPill = async () => {
    const dockHidden = await page.evaluate(() => { const d = document.getElementById('idmp-pill'); return !!d && getComputedStyle(d).display === 'none'; });
    if (dockHidden) { const trig = '#idmp-pill-trigger,[data-pill-trigger]'; if (await page.$(trig)) await hclick(trig); else await page.evaluate(() => document.querySelector('#idmp-pill-trigger,[data-pill-trigger]').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await hold(600); }
    await glide('#pill-ninja'); await hold(400);
    await page.evaluate(() => document.getElementById('pill-ninja').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
    await page.waitForSelector('#ninja-panel', { timeout: 10000 }); await hold(1500);
  };
  const setDates = async (from, to) => { for (const [sel, v] of [['#np-from', from], ['#np-to', to]]) { await hclick(sel); await page.locator(sel).first().evaluate((e, x) => { e.value = x; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, v); await hold(700); } };
  const runReport = async (sampleSel, from, to) => { await hclick(sampleSel); await page.waitForSelector('#np-run', { timeout: 10000 }); await hold(1200); await setDates(from, to); await hclick('#np-run'); await page.waitForSelector('#np-rep-sum', { timeout: 60000 }); await hold(2000); };
  const loginFlow = async () => {
    await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await page.waitForSelector('#idmp-login-step1:visible', { timeout: 8000 }); await hold(700);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await page.waitForSelector('#idmp-login-step2:visible', { timeout: 8000 }); await hold(900);
    await hclick('#idmp-login-ok'); await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 15000 });
    await page.waitForSelector('#pill-ninja', { state: 'attached', timeout: 15000 }); await hold(1200);
  };
  const bootErp = async () => { await page.goto(h.base + '/erp/idempiere.html?lang=en_US', { waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.__idmpDb, null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 20000 }); await hold(1500); };

  try {
    await page.goto('about:blank');
    await beat('intro', 'title card');
    await page.setContent(CARD('A report that grows as you sell', ['Enter sales in the ERP —', 'watch the Excel rows push down.'], 'NinjaExcel Report · film 2')); await hold(7000);

    await beat('login', 'GardenWorld → GardenAdmin');
    await bootErp(); await loginFlow();

    await beat('baseline', 'Sales Register: the rows that exist today');
    await openPill(); await runReport('#np-sample-reg', FROM, TO);
    const b0 = await regFacts(); fact('baseline.registerRows', b0.rows); fact('baseline.registerTotal', b0.total.toFixed(2)); fact('baseline.registerCount', b0.count); fact('period', FROM + '..' + TO);
    await glide('#np-preview tr:nth-last-child(3)'); await hold(5000);
    await hclick('#np-close'); await hold(800);

    const sales = [];
    for (let i = 1; i <= SALES; i++) {
      await beat('sale' + i, 'POS sale ' + i + ' of ' + SALES + ' (UC-1)');
      STEPS = i === 1 ? 28 : 10;                                                       // sale 1 at full human pace, later sales brisker
      const n0 = h.logs.length; const r = await UC1.enter(h, { qty: i }); sales.push(r);
      fact('sale' + i + '.qty', i); fact('sale' + i + '.completed', r.completed); fact('sale' + i + '.newFactLines', r.newFactLines);
      await hold(1500);
    }
    STEPS = 28;
    const inv = await h.tip("SELECT COUNT(*) AS n, ROUND(SUM(grandtotal),2) AS t FROM c_invoice WHERE c_invoice_id<0 AND docstatus='CO' AND issotrx='Y'");
    const fa = await h.tip('SELECT ROUND(SUM(amtacctdr),2) AS dr, ROUND(SUM(amtacctcr),2) AS cr FROM fact_acct WHERE fact_acct_id<0 OR record_id<0');
    fact('tip.invoices', inv[0].n); fact('tip.invoiceTotal', inv[0].t); fact('tip.postedDebit', fa[0].dr); fact('tip.postedCredit', fa[0].cr);

    await beat('again', 'run the Sales Register again: rows pushed down');
    await openPill(); await runReport('#np-sample-reg', FROM, TO);
    const b1 = await regFacts(); fact('after.registerRows', b1.rows); fact('after.registerTotal', b1.total.toFixed(2)); fact('after.registerCount', b1.count); fact('after.pushed', b1.rows - b0.rows); fact('after.totalDelta', (b1.total - b0.total).toFixed(2));
    const g1 = await readGrid(); fact('after.totalFormulaRows', '6..' + (b1.totalsRow - 1));
    await page.evaluate(() => { const d = document.querySelector('#np-preview').parentElement; d.scrollTo({ top: 0, behavior: 'smooth' }); }); await hold(2500);
    await glide('#np-preview tr:nth-last-child(3)'); await hold(1500);
    await page.evaluate(() => { const rows = [...document.querySelectorAll('#np-preview tr')]; const n = rows.length; [rows[n - 7], rows[n - 6], rows[n - 5]].forEach(r => r && r.querySelectorAll('td').forEach(td => { td.style.background = '#5a4510'; })); });   // the three new rows
    await hold(6000);

    await beat('books', 'the books still balance (Trial Balance, same session)');
    await runReport('#np-sample-tb', '2003-01-01', TO);
    const gt = await readGrid(), tt = gt.findIndex(r => r[0] === 'รวม'); const dr = parseN(gt[tt][3]), cr = parseN(gt[tt][4]);
    fact('books.totalDebit', dr.toFixed(2)); fact('books.totalCredit', cr.toFixed(2)); fact('books.difference', (dr - cr).toFixed(2));
    await page.evaluate((ti) => { const rows = document.querySelectorAll('#np-preview tr'); [rows[ti]].forEach(r => r && r.querySelectorAll('td').forEach(td => { td.style.background = '#5a4510'; })); }, tt);
    await glide('#np-preview tr:nth-last-child(1)'); await hold(6500);
    await hclick('#np-close'); await hold(600);

    await beat('reset', 'clear this browser\'s local data → GardenWorld is clean again');
    await page.setContent(CARD('Reset', ['Clear the local data.', 'GardenWorld reloads from the seed.'], 'nothing to undo, nothing left behind')); await hold(5000);
    await page.goto(h.base + '/erp/__blank__');                                          // same origin, no ERP page holding the databases open
    const cleared = await page.evaluate(async () => { const names = (await indexedDB.databases()).map(d => d.name); for (const n of names) await new Promise(r => { const q = indexedDB.deleteDatabase(n); q.onsuccess = q.onerror = q.onblocked = () => r(); }); try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} return names; });
    fact('reset.databasesCleared', cleared.join(','));
    await bootErp(); STEPS = 12; await loginFlow(); await openPill(); await runReport('#np-sample-reg', FROM, TO);
    const b2 = await regFacts(); fact('reset.registerRows', b2.rows); fact('reset.registerTotal', b2.total.toFixed(2)); fact('reset.identicalToBaseline', b2.rows === b0.rows && Math.abs(b2.total - b0.total) < 0.005);
    await glide('#np-preview tr:nth-last-child(3)'); await hold(6500);

    await beat('close', 'closing card');
    await page.setContent(CARD('Enter it. Report it. Reset it.', ['Real sales, real rows, clean again.'], 'NinjaExcel Report · GardenWorld demo data')); await hold(6000);
    await beat('end', '');
    say('§TB_FILM2_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§TB_FILM2_ERROR ' + e.message.split('\n')[0]); }

  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300);
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'tb_film2.page.log'), h.logs.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'NinjaExcelReport_film2_raw.mp4');
  try {
    cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§TB_FILM2_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§TB_FILM2_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'tb_film2.log'), LOG.join('\n') + '\n');
  await h.close();
})();
