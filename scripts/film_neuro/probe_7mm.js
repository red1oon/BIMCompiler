const path = require('path'); let building = 'HospitalGarage', url = null, latticeBoxes = false;
const out = process.stdout.write.bind(process.stdout);
const http = require('http'), fs = require('fs');
const LIVE = 'https://red1oon.github.io/bim-ootb/modeller/modeller.html', ROOT = '/home/red1/bim-ootb', HERE = path.join(ROOT, 'modeller', 'modeller.html');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css', '.db': 'application/octet-stream' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const t0 = Date.now();
function loadPuppeteer() {
  try { return require('puppeteer'); }
  catch (e) {
    process.stderr.write('edit_cli: ' + (e.code === 'MODULE_NOT_FOUND' ? 'puppeteer not found.' : 'puppeteer would not load (' + e.code + '), which usually means this Node is too old for that version.') + ' Run: npm install puppeteer@24\n');
    process.exit(1);
  }
}
function serveRepo() {
  const server = http.createServer((q, r) => { fs.readFile(path.join(ROOT, decodeURIComponent(q.url.split('?')[0])), (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(q.url.split('?')[0])] || 'application/octet-stream', 'Accept-Ranges': 'bytes' }); r.end(b); }); });
  return new Promise(res => server.listen(0, () => res(server)));
}

(async () => {
  const puppeteer = loadPuppeteer(), results = [], gates = []; let opened = false, info = null, failed = null, server = null;
  if (!url && fs.existsSync(HERE)) { server = await serveRepo(); url = 'http://localhost:' + server.address().port + '/modeller/modeller.html'; }
  if (!url) url = LIVE;
  process.stderr.write('edit_cli: ' + url + '\n');
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], slog = [];
  try {
    const pg = await br.newPage(); await pg.setViewport({ width: 1280, height: 860 });
    pg.on('pageerror', e => errs.push(String(e).slice(0, 180)));
    pg.on('console', m => { const x = m.text(); if (/^§/.test(x)) slog.push(x); });
    await pg.goto(url, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForFunction('window.__sceneReady===true && !!window.THREE && !!window.A && !!window.Bonsai', { timeout: 60000 }).catch(() => {});
    await pg.click('#b-open'); await sleep(200);
    if (!await pg.$('#m-open-panel .mo-row[data-key="' + building + '"]')) { const k = await pg.evaluate(() => Array.from(document.querySelectorAll('#m-open-panel .mo-row')).map(r => r.dataset.key).filter(k => k && k.indexOf('__') !== 0)); throw new Error('no building ' + building + ' (' + k.join(', ') + ')'); }
    await pg.click('#m-open-panel .mo-row[data-key="' + building + '"]');
    await pg.waitForFunction(() => !!window.__dwBuf, { timeout: 120000 }).catch(() => {});
    await sleep(2200);
    // Settled = the seed has armed the Save baseline with real boxes. Editing sooner moves nothing and reports "not judged", so the answer would depend on machine load.
    let settled = false;
    for (let i = 0; i < 480 && !settled; i++) { settled = await pg.evaluate(() => !!window.__saveGateBaseline && Object.keys(window.__saveGateBaseline).length > 0); if (!settled) await sleep(500); }
    if (!settled) throw new Error('the building did not finish opening within 240 s');
    opened = true;
    const framed = await pg.evaluate(() => { const i = window.swbGateInfo && window.swbGateInfo(); return !!(i && i.system === 'column-framed'); });
    if (framed) {   // same readiness and arming a person's Move Grid gives: the walker's lattice becomes the grid
      for (let i = 0; i < 120 && !slog.some(l => /§STRWALK-OL §GEO-SERVED/.test(l)); i++) await sleep(500);
      await sleep(5000);
      await pg.click('#b-gridmove'); await sleep(600);
    } else await sleep(1500);

    const r = await pg.evaluate(() => {
      const i = window.swbGateInfo(), g = i.base0.grid, L = window.Bonsai.gridmove.gridLines();
      const pick = id => { const l = L.find(x => x.id === id); return l ? +l.pos : null; };
      return { theta_deg: (g.theta||0)*180/Math.PI, lattice_gx5: g.xLines[5], lattice_gx6: g.xLines[6], lines_gx5: pick('gx5'), lines_gx6: pick('gx6'), n_x: g.xLines.length };
    });
    const bayL = r.lattice_gx6 - r.lattice_gx5, bayW = r.lines_gx6 - r.lines_gx5, c = Math.cos(r.theta_deg*Math.PI/180);
    out('§NEURO_FILM_7MM building=' + building + ' theta_deg=' + r.theta_deg.toFixed(4) + ' lattice_bay=' + bayL.toFixed(4) + ' lines_bay=' + bayW.toFixed(4) + ' lattice_over_cos=' + (bayL/c).toFixed(4) + ' diff_mm=' + ((bayW - bayL)*1000).toFixed(2) + ' lattice_plus_1817=' + (bayL+1.817).toFixed(4) + ' raw=' + JSON.stringify(r) + '\n');
  } finally { await br.close(); if (server) server.close(); }
})().catch(e => { process.stderr.write('probe: ' + e.message + '\n'); process.exit(1); });
