'use strict';
// §8 item 6 reconciliation (CUT_GATE_CSG_SPEC.md): the spec's §0 left an OPEN gap between two prior
// measurements of the SAME Duplex cut-gate population — a live-scene fid probe ("47 wallish GEOM_INSERT
// candidates / 2 pass / 45 refuse", RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md round-3) vs. a static DB scan
// ("57 wallish / 7 box / 50 refuse", CUT_GATE_CSG_SPEC.md §1, cut_gate_bench/classify.py). Neither script is
// committed/re-runnable verbatim. This session re-derives BOTH predicates on the SAME live Duplex scene (the
// modeller's own window.Bonsai.oplog._geomOps(), post §LAYER-SOLID-SEED fix) to find the EXACT source of the
// 47-vs-57 gap, not guess at it.
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require(require('path').join(process.env.HOME, 'bim-compiler', 'node_modules', 'puppeteer'));   // same portable pattern as modeller/tests/e2e_harness.js
const ROOT = process.env.BIM_OOTB_ROOT || (process.env.HOME + '/bim-ootb');   // a bim-ootb checkout with fix/cut-gate-layer-solids (bim-ootb PR #1262) merged
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css', '.db': 'application/octet-stream', '.data': 'application/octet-stream' };
function serve() {
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/modeller/modeller.html';
    fs.readFile(path.join(ROOT, p), (e, b) => {
      if (e) { r.writeHead(404); r.end('404 ' + p); return; }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
    });
  });
}
(async () => {
  const server = serve();
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await br.newPage(); await pg.setViewport({ width: 1200, height: 850, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.log('  PAGEERR ' + String(e).slice(0, 200)));
  await pg.goto(`http://localhost:${port}/modeller/modeller.html`, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction("!!(window.Bonsai && window.Bonsai.oplog)", { timeout: 30000 });
  await pg.click('#b-open');
  await pg.waitForSelector('#m-open-panel .mo-row[data-key="Duplex"]', { timeout: 15000 });
  await pg.click('#m-open-panel .mo-row[data-key="Duplex"]');
  await pg.waitForFunction("!!window.__dwBuf", { timeout: 60000 }).catch(() => console.log('  (no __dwBuf oracle within 60s)'));
  await new Promise(r => setTimeout(r, 5000));
  const opsLen0 = await pg.evaluate(() => (window.Bonsai && window.Bonsai.oplog && window.Bonsai.oplog._geomOps) ? window.Bonsai.oplog._geomOps().length : -1);
  console.log('§PRECHECK opsLen=' + opsLen0);

  const r = await pg.evaluate(() => {
    const ops = window.Bonsai.oplog._geomOps();
    const wallish = c => c.sz && c.sz[2] >= 1.2 && Math.min(c.sz[0], c.sz[1]) <= 0.6 && Math.max(c.sz[0], c.sz[1]) >= 1.0 && Math.max(c.sz[0], c.sz[1]) <= 8;
    let classOnly = 0, wallishByShape = 0, classNotWallish = [];
    const classify = { classOnlyBox: 0, classOnlyLayer: 0, classOnlyRefused: 0, wallishBox: 0, wallishLayer: 0, wallishRefused: 0 };
    ops.forEach(op => {
      if (op.op_type !== 'GEOM_INSERT') return;
      const P = op.parameters; if (!P || !P.ifc_class || !/^IfcWall/.test(P.ifc_class)) return;
      classOnly++;
      const bb = P.bbox, sz = bb ? [bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]] : null;
      let boxOk = false, layerSeed = null;
      try { boxOk = !!window.Bonsai._insertCutBox(op); } catch (e) {}
      if (!boxOk) { try { layerSeed = window.Bonsai._insertCutLayerSeed(op); } catch (e) {} }
      const bucket = boxOk ? 'Box' : (layerSeed ? 'Layer' : 'Refused');
      classify['classOnly' + bucket]++;
      const isW = wallish({ sz });
      if (isW) { wallishByShape++; classify['wallish' + bucket]++; }
      else classNotWallish.push({ fid: op.id, ifc_class: P.ifc_class, sz, bucket });
    });
    return { classOnly, wallishByShape, classify, classNotWallish };
  });
  console.log('§RECONCILE-COUNTS classOnly(IfcWall*-class)=' + r.classOnly + ' wallishByShape(class+size/shape)=' + r.wallishByShape);
  console.log('§RECONCILE-BREAKDOWN ' + JSON.stringify(r.classify));
  console.log('§RECONCILE-EXCLUDED (IfcWall*-class but NOT wallish-by-shape, n=' + r.classNotWallish.length + '):');
  r.classNotWallish.forEach(c => console.log('  fid=' + c.fid + ' class=' + c.ifc_class + ' sz=' + JSON.stringify(c.sz) + ' bucket=' + c.bucket));

  await br.close(); server.close();
})();
