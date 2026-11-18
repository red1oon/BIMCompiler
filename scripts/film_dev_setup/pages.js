// ⚠ DO NOT REMOVE — SCOPE: film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4). The page half of the facts: serves the downloaded folder
// (WORK = a fresh copy of the from-scratch download, NOTHING installed) with `python3 -m http.server 8000`, opens the three apps in a headless Chromium (CPU, SwiftShader), takes one picture of each,
// then does the offline path of beat b1b for real: Ctrl+S Save Building in the viewer (the headless browser has no native Save dialog, so showSaveFilePicker is removed and the page's OWN download
// fallback runs), the file goes into viewer/buildings/, and the viewer is opened by name with every non-127.0.0.1 host BLOCKED. Every figure is printed as a §PAGES line and written to out/pages.json.
// Usage: node pages.js <WORK>      READ out/pages.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const pw = require(path.join(process.env.HOME, 'bim-ootb', 'tests', 'node_modules', 'playwright'));
const WORK = path.resolve(process.argv[2]), OUT = path.join(__dirname, 'out'), PG = path.join(OUT, 'pages'), PORT = 8000, BASE = 'http://127.0.0.1:' + PORT + '/';
fs.mkdirSync(PG, { recursive: true });
const VIEWER_READY = /\d,\d+\/\d,\d+|DONE — \S+ [\d,]+ elements/, R = { port: PORT }, L = m => console.log('§PAGES ' + m), words = t => t.replace(/\s+/g, ' ').trim();
(async () => {
  const srv = cp.spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: WORK, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 1500));
  const br = await pw.chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--disable-gpu'] });
  const open = async (ctx, url, ready, secs) => { const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    await pg.goto(BASE + url, { waitUntil: 'load', timeout: 90000 }); let t = ''; for (let i = 0; i < secs; i++) { t = await pg.evaluate(() => document.body ? document.body.innerText : '').catch(() => ''); if (ready.test(words(t))) break; await pg.waitForTimeout(1000); }
    return { pg, text: words(t), errs, ready: ready.test(words(t)) }; };
  // 1. the three apps, as a stranger opens them (internet on)
  const ctx = await br.newContext({ viewport: { width: 1280, height: 960 }, acceptDownloads: true }); R.apps = {};
  for (const [k, url, ready, secs] of [['modeller', 'modeller/modeller.html', /MODELLER ready/, 40], ['erp', 'erp/idempiere.html', /Sign In/, 40], ['viewer', 'viewer/viewer.html', VIEWER_READY, 120]]) {
    const o = await open(ctx, url, ready, secs); await o.pg.waitForTimeout(1500); await o.pg.screenshot({ path: path.join(PG, k + '.png') }); R.apps[k] = { ready: o.ready, text: o.text.slice(0, 120), errors: o.errs.length, png: 'pages/' + k + '.png' };
    L('app=' + k + ' ready=' + o.ready + ' text=' + JSON.stringify(o.text.slice(0, 80)) + ' errors=' + o.errs.length);
    if (k !== 'viewer') await o.pg.close(); else R.viewerPg = o.pg; }
  // 2. Save Building (Ctrl+S) in the viewer that just opened the Duplex
  const vp = R.viewerPg; delete R.viewerPg; await ctx.close().catch(() => {});   // the first context closes after the save below
  const ctx2 = await br.newContext({ viewport: { width: 1280, height: 960 }, acceptDownloads: true }), pg2 = await ctx2.newPage(), saveLog = [];
  await pg2.addInitScript(() => { window.showSaveFilePicker = undefined; });
  pg2.on('console', m => { if (/§SAVE_/.test(m.text())) saveLog.push(m.text().slice(0, 160)); });
  await pg2.goto(BASE + 'viewer/viewer.html', { waitUntil: 'load', timeout: 90000 });
  for (let i = 0; i < 90; i++) { const t = await pg2.evaluate(() => document.body.innerText).catch(() => ''); if (VIEWER_READY.test(words(t))) break; await pg2.waitForTimeout(1000); }
  await pg2.mouse.click(640, 480); const dl = pg2.waitForEvent('download', { timeout: 90000 }).catch(() => null); await pg2.keyboard.press('Control+s'); const d = await dl;
  if (!d) { L('FAIL no download from Ctrl+S ' + saveLog.join(' | ')); process.exit(1); }
  const name = d.suggestedFilename(), dest = path.join(WORK, 'viewer', 'buildings', name); await d.saveAs(dest);
  R.save = { name, bytes: fs.statSync(dest).size, key: 'Control+s', log: saveLog }; L('save name=' + name + ' bytes=' + R.save.bytes + ' ' + saveLog.join(' | ')); await ctx2.close();
  // 3. offline: the saved file opened by name, every outside host blocked
  const ctx3 = await br.newContext({ viewport: { width: 1280, height: 960 } }), blocked = {}, fails = [];
  await ctx3.route(u => new URL(u).hostname !== '127.0.0.1', r => { const h = new URL(r.request().url()).host; blocked[h] = (blocked[h] || 0) + 1; r.abort(); });
  const o3 = await (async () => { const pg = await ctx3.newPage(), errs = []; pg.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url().replace(BASE, '')); }); pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await pg.goto(BASE + 'viewer/viewer.html?db=buildings/' + name, { waitUntil: 'load', timeout: 90000 }); let t = ''; for (let i = 0; i < 60; i++) { t = await pg.evaluate(() => document.body.innerText).catch(() => ''); if (VIEWER_READY.test(words(t))) break; await pg.waitForTimeout(1000); }
    await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(PG, 'offline.png') }); return { text: words(t), errs }; })();
  R.offline = { url: 'viewer/viewer.html?db=buildings/' + name, text: o3.text.slice(0, 120), blocked, blockedTotal: Object.values(blocked).reduce((a, b) => a + b, 0), http404: fails.length, errors: o3.errs.length, png: 'pages/offline.png' };
  L('offline url=' + R.offline.url + ' text=' + JSON.stringify(R.offline.text) + ' blocked=' + JSON.stringify(blocked) + ' http_4xx=' + fails.length + ' errors=' + o3.errs.length);
  await br.close(); srv.kill();
  R.ok = Object.values(R.apps).every(a => a.ready) && VIEWER_READY.test(R.offline.text) && R.save.bytes > 1e6 && !blocked['objectstorage.ap-kulai-2.oraclecloud.com'];
  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(R, null, 1)); L('VERDICT ' + (R.ok ? 'PASS' : 'FAIL')); process.exit(R.ok ? 0 : 1);
})().catch(e => { console.log('§PAGES FAIL ' + (e && e.stack || e)); process.exit(1); });
