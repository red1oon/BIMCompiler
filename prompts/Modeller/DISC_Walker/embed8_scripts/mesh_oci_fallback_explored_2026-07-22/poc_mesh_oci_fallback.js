// ⚠ DO NOT REMOVE — Scope guard
// Scope: real-module §-witness for the §OCI-FALLBACK fix in str_walker_outliner.js's _fetchGeoDb.
//   PROVES: (1) a same-origin mesh.db response too small to be real geometry (simulating an unresolved
//   git-LFS pointer, ~134 bytes) is detected and triggers a fallback fetch to the OCI URL, not silently
//   accepted as valid geometry; (2) a normal-size same-origin response is used as-is, no OCI fetch fires
//   (no regression to the common case). Both legs are intercepted via page.route — deterministic, no
//   dependency on real network/OCI state.
//   §-log first — READ tests/poc_mesh_oci_fallback.log before any conclusion (exit code ≠ evidence).
// Run:  node modeller/tests/poc_mesh_oci_fallback.js 2>&1 | tee modeller/tests/poc_mesh_oci_fallback.log
'use strict';
const { chromium } = require(process.env.PW || (require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'));
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.db': 'application/octet-stream' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(ROOT, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});

const PASS = [], FAIL = [];
function check(n, c) { (c ? PASS : FAIL).push(n); console.log((c ? '✅ ' : '❌ ') + n); }

const OCI_URL_SUBSTR = 'objectstorage.ap-kulai-2.oraclecloud.com';
const FAKE_OCI_BYTES = Buffer.alloc(5 * 1024 * 1024, 7); // 5MB dummy "real" geometry stand-in

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;

  // ── Leg A: same-origin mesh.db is a tiny LFS-pointer-shaped response → expect OCI fallback fired ──
  {
    const logs = []; let ociHit = false, ociUrlSeen = null;
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', m => logs.push(m.text()));
    await page.route('**/modeller/mesh.db*', route => route.fulfill({ status: 200, contentType: 'application/octet-stream', body: Buffer.from('version https://git-lfs.github.com/spec/v1\noid sha256:1cb80e70\nsize 120025088\n') }));
    await page.route('**' + OCI_URL_SUBSTR + '**', route => {
      ociHit = true; ociUrlSeen = route.request().url();
      route.fulfill({ status: 200, contentType: 'application/octet-stream', body: FAKE_OCI_BYTES });
    });
    await page.goto(`http://localhost:${port}/modeller/modeller.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.STRWalkerOutliner && typeof window.STRWalkerOutliner._fetchGeoDb === 'function', { timeout: 20000 }).catch(() => {});
    const hasApi = await page.evaluate(() => !!(window.STRWalkerOutliner && window.STRWalkerOutliner._residents));
    check('Leg A: STRWalkerOutliner API present', hasApi);
    if (hasApi) {
      const result = await page.evaluate(() => {
        var res = window.STRWalkerOutliner._residents.find(r => r.geoDb);
        return window.STRWalkerOutliner._fetchGeoDb(res).then(buf => ({ ok: true, len: buf ? buf.byteLength : -1, key: res.key }));
      });
      check('Leg A: geoDb resolved (not null/rejected) for a geoDb-bearing resident (' + result.key + ')', result.ok && result.len > 0);
      check('Leg A: resolved bytes came from the OCI fallback, not the tiny same-origin response (len=' + result.len + ')', result.len === FAKE_OCI_BYTES.length);
    }
    check('Leg A: OCI URL was actually requested', ociHit);
    check('Leg A: §STRWALK-OPEN ... falling back to OCI logged', logs.some(l => /falling back to OCI/.test(l)));
    check('Leg A: OCI URL logged matches the real bucket/object path', !!ociUrlSeen && /buildings\/modeller_mesh\.db/.test(ociUrlSeen));
    await browser.close();
  }

  // ── Leg B: same-origin mesh.db is a normal-size response → expect NO OCI fallback (no regression) ──
  {
    const logs = []; let ociHit = false;
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', m => logs.push(m.text()));
    const REAL_SIZED = Buffer.alloc(3 * 1024 * 1024, 9); // >1MB gate, simulates a real same-origin file
    await page.route('**/modeller/mesh.db*', route => route.fulfill({ status: 200, contentType: 'application/octet-stream', body: REAL_SIZED }));
    await page.route('**' + OCI_URL_SUBSTR + '**', route => { ociHit = true; route.fulfill({ status: 200, body: FAKE_OCI_BYTES }); });
    await page.goto(`http://localhost:${port}/modeller/modeller.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.STRWalkerOutliner && typeof window.STRWalkerOutliner._fetchGeoDb === 'function', { timeout: 20000 }).catch(() => {});
    const hasApi = await page.evaluate(() => !!(window.STRWalkerOutliner && window.STRWalkerOutliner._residents));
    if (hasApi) {
      const result = await page.evaluate(() => {
        var res = window.STRWalkerOutliner._residents.find(r => r.geoDb);
        return window.STRWalkerOutliner._fetchGeoDb(res).then(buf => ({ ok: true, len: buf ? buf.byteLength : -1 }));
      });
      check('Leg B: normal-size same-origin response used as-is (len=' + result.len + ' === ' + REAL_SIZED.length + ')', result.len === REAL_SIZED.length);
    }
    check('Leg B: OCI was NOT hit when same-origin response was already valid (no regression)', !ociHit);
    await browser.close();
  }

  server.close();
  console.log('\n§W-MESH-OCI-FALLBACK ' + PASS.length + '/' + (PASS.length + FAIL.length) + (FAIL.length ? ' — FAIL: ' + FAIL.join('; ') : ' ALL PASS'));
  process.exit(FAIL.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
