'use strict';
// CUT_GATE_CSG_SPEC.md §8 item 5 (generalization gap, named not assumed): re-measure the cut-gate
// population beyond Duplex — SampleHouse and SampleCastle — via the SAME real production gate
// (Bonsai._insertCutBox / _insertCutLayerSeed) on each resident's live-loaded scene. Read-only: no app
// code touched by this script; it only opens residents and reads window.Bonsai's own classification.
// SampleCastle's known `sporenkap` (pitched-roof, non-plane-clippable) refusal is EXPECTED — an honest
// refusal there is the CORRECT outcome (§3c's algebra assumes planar layer boundaries + a box void; a
// pitched roof genuinely violates that), not a failure of this fix.
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
async function measure(pg, key) {
  await pg.click('#b-open'); await new Promise(r => setTimeout(r, 300));
  await pg.waitForSelector('#m-open-panel .mo-row[data-key="' + key + '"]', { timeout: 15000 });
  await pg.click('#m-open-panel .mo-row[data-key="' + key + '"]');
  await pg.waitForFunction("!!window.__dwBuf", { timeout: 90000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 4000));
  return pg.evaluate(() => {
    const ops = window.Bonsai.oplog._geomOps();
    const out = { total: 0, box: 0, layer: 0, refused: 0, refusedSample: [], classes: {} };
    ops.forEach(op => {
      if (op.op_type !== 'GEOM_INSERT') return;
      const P = op.parameters; if (!P || !P.ifc_class) return;
      if (!/^Ifc(Wall|Roof|Slab)/.test(P.ifc_class)) return;   // ARC "wallish structural" superset — same class family the spec's §1 scan used, extended to slab/roof per §8 item 5's own naming
      out.total++;
      let boxOk = false, layerSeed = null;
      try { boxOk = !!window.Bonsai._insertCutBox(op); } catch (e) {}
      if (!boxOk) { try { layerSeed = window.Bonsai._insertCutLayerSeed(op); } catch (e) {} }
      if (boxOk) out.box++;
      else if (layerSeed) out.layer++;
      else {
        out.refused++;
        if (out.refusedSample.length < 8) out.refusedSample.push({ fid: op.id, ifc_class: P.ifc_class, hasHash: !!P.realGeomHash });
      }
      out.classes[P.ifc_class] = (out.classes[P.ifc_class] || 0) + 1;
    });
    return out;
  });
}
(async () => {
  const server = serve();
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const key of ['SampleHouse', 'SampleCastle']) {
    const pg = await br.newPage(); await pg.setViewport({ width: 1200, height: 850, deviceScaleFactor: 1 });
    pg.on('pageerror', e => console.log('  [' + key + '] PAGEERR ' + String(e).slice(0, 200)));
    await pg.goto(`http://localhost:${port}/modeller/modeller.html`, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction("!!(window.Bonsai && window.Bonsai.oplog)", { timeout: 30000 });
    const t0 = Date.now();
    const r = await measure(pg, key);
    console.log('§GENERALIZE building=' + key + ' ms=' + (Date.now() - t0) + ' total=' + r.total + ' box=' + r.box + ' layer=' + r.layer + ' refused=' + r.refused);
    console.log('  classes=' + JSON.stringify(r.classes));
    if (r.refused) console.log('  refusedSample=' + JSON.stringify(r.refusedSample));
    await pg.close();
  }
  await br.close(); server.close();
})();
