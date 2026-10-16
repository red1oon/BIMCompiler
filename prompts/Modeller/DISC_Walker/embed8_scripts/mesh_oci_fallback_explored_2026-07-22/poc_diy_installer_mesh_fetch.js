// ⚠ DO NOT REMOVE — Scope guard
// Scope: real-module §-witness proving about_diy.js's _downloadInstaller() generates a script (both the
//   Mac/Linux .sh and the Windows .bat branch) that fetches mesh.db from the OCI URL into modeller/ AFTER
//   extracting the app zip and BEFORE serving — the "fetch all and localize" step. Intercepts
//   URL.createObjectURL to read the actual generated Blob text, real module code, no re-implementation.
// Run:  node common/tests/poc_diy_installer_mesh_fetch.js 2>&1 | tee common/tests/poc_diy_installer_mesh_fetch.log
'use strict';
const { chromium } = require(process.env.PW || (require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'));
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(ROOT, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': path.extname(p) === '.js' ? 'text/javascript' : 'text/html' });
    res.end(buf);
  });
});

const PASS = [], FAIL = [];
function check(n, c) { (c ? PASS : FAIL).push(n); console.log((c ? '✅ ' : '❌ ') + n); }

async function captureScript(page, isWin, port) {
  await page.addInitScript((win) => {
    Object.defineProperty(navigator, 'platform', { get: () => win ? 'Win32' : 'Linux x86_64' });
    window.__capturedBlobText = null;
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = function (blob) {
      blob.text().then(t => { window.__capturedBlobText = t; });
      return origCreate.call(URL, blob);
    };
  }, isWin);
  await page.goto(`http://localhost:${port}/viewer/viewer.html`, { waitUntil: 'networkidle' });
  const already = await page.evaluate(() => !!(window.AboutDIY && typeof window.AboutDIY.open === 'function'));
  if (!already) await page.addScriptTag({ url: `http://localhost:${port}/common/about_diy.js` });
  await page.waitForFunction(() => window.AboutDIY && typeof window.AboutDIY.open === 'function', { timeout: 10000 });
  // Drive the real download button rather than reaching into module internals.
  await page.evaluate(() => window.AboutDIY.open('diy'));
  await page.waitForSelector('#adq-dl-viewer', { timeout: 10000 });
  await page.click('#adq-dl-viewer');
  await page.waitForFunction(() => window.__capturedBlobText !== null, { timeout: 10000 });
  return page.evaluate(() => window.__capturedBlobText);
}

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();

  for (const isWin of [false, true]) {
    const page = await browser.newPage();
    const script = await captureScript(page, isWin, port);
    const label = isWin ? '.bat (Windows)' : '.sh (Mac/Linux)';
    check(label + ': fetches app zip first', /archive\/refs\/heads\/main\.zip/.test(script));
    check(label + ': fetches mesh.db from the OCI bucket', /objectstorage\.ap-kulai-2\.oraclecloud\.com.*modeller_mesh\.db/.test(script));
    const zipIdx = script.indexOf('main.zip'), meshIdx = script.indexOf('modeller_mesh.db'), serveIdx = script.indexOf('8080');
    check(label + ': order is zip-extract THEN mesh.db fetch THEN serve', zipIdx > -1 && meshIdx > zipIdx && serveIdx > meshIdx);
    check(label + ': mesh.db fetch degrades gracefully on failure (no `set -e`/`exit` abort tied to it)', /mesh\.db fetch failed/.test(script));
    await page.close();
  }
  await browser.close();
  server.close();
  console.log('\n§W-DIY-INSTALLER-MESH-FETCH ' + PASS.length + '/' + (PASS.length + FAIL.length) + (FAIL.length ? ' — FAIL: ' + FAIL.join('; ') : ' ALL PASS'));
  process.exit(FAIL.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
