// ⚠ DO NOT REMOVE — SCOPE: film 3 "CH 0 · Immersive Software: a body's history" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 3; copied from scripts/film_immersive_software/). ONE session of the REAL Modeller (headless Chromium, SwiftShader on the CPU, as bim-ootb
// devtools/hover/tests/witness_dxf_hover.js does): open the 9 marked shed sheets, Complete, Convert; the dev overlay is loaded with the bookmarklet's OWN code (before Convert unless MS_OVERLAY=0).
// Then REAL mouse moves: a sweep finds a screen point for each target (col: a column whose size layer links a default row; wall: the joined wall by its guid; bar: a truss bar whose width is a
// default with no recorded key), the cursor rests there, the page is photographed, and the target's key (col 3, wall 1, bar 3) is pressed with window.open recorded (the link the key makes). Also the heap after a forced GC. Prints one line `MS_RESULT {json}`. Nothing is drawn by hand: every picture is the page's own pixels.
// Usage: node modeller_shot.js <bim-ootb tree> <outPrefix>   env: MS_OVERLAY=0|1, MS_WALL=<guid>, MS_POINT_WALL=x,y (reuse a point found on the other tree)
//        MS_DPR=2 (pixel ratio of the pictures) · MS_CLIP=1: per target ALSO <outPrefix>_<k>_clip.png = the tooltip + the cursor + a margin only (the Developer Guide's figures, §4.3)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');
const TREE = path.resolve(process.argv[2]), PRE = path.resolve(process.argv[3]), OVERLAY = process.env.MS_OVERLAY !== '0', WALL = process.env.MS_WALL || '';
const MK = process.env.SHED_MARKED || path.join(os.homedir(), 'Videos', 'dxf2bim_film_work', 'why', 'cli', 'marked');
const files = fs.readdirSync(MK).filter(f => /\.dxf$/i.test(f)).sort().map(f => path.join(MK, f));
const BOOKMARKLET = "(function(){var s=document.createElement('script');s.src='/devtools/hover/dxf_hover.js?'+Date.now();document.head.appendChild(s)})()";
const puppeteer = require(path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
(async () => {
  const res = { tree: TREE, overlay: OVERLAY, sheets: files.length, console: [], errors: [], targets: {} };
  const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, buf) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(buf); }); });
  await new Promise(z => srv.listen(0, '127.0.0.1', z));
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
  try {
    const pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080, deviceScaleFactor: Number(process.env.MS_DPR || 1) });
    pg.on('pageerror', e => res.errors.push(String(e).slice(0, 160)));
    pg.on('console', m => { const t = m.text(); if (/^§DXF_HOVER /.test(t)) res.console.push(t); });
    await pg.goto('http://127.0.0.1:' + srv.address().port + '/modeller/modeller.html', { waitUntil: 'load', timeout: 120000 });
    await pg.waitForFunction('window.__sceneReady===true && window.DxfImportUI', { timeout: 120000 }); await pg.evaluate(() => { window.DxfImportUI.state.arrangeOnOpen = false; });
    if (OVERLAY) { await pg.evaluate(BOOKMARKLET); await pg.waitForFunction('window.__DXF_HOVER && window.__DXF_HOVER.state', { timeout: 30000 }); await pg.evaluate(() => window.__DXF_HOVER.ready);
      await pg.evaluate(() => { window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; }; }); }   // V's link is recorded, not followed (headless: no desktop to hand it to)
    await pg.click('#b-open'); await pg.waitForSelector('#m-open-panel .mo-row[data-key="__dxf"]', { visible: true });
    const [ch] = await Promise.all([pg.waitForFileChooser(), pg.click('#m-open-panel .mo-row[data-key="__dxf"]')]); await ch.accept(files);
    await pg.waitForFunction('window.DxfMetaEditor && window.DxfMetaEditor.state.sheets.length && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict', { timeout: 240000 });
    await pg.evaluate(() => { const c = document.getElementById('dxf-complete'); if (c && !c.checked) c.click(); }); await new Promise(r => setTimeout(r, 2500));
    await pg.click('#dxf-convert'); await pg.waitForFunction('window.DxfImportUI.state.last && window.DxfImportUI.state.last.nInserts > 0', { timeout: 180000 }); await new Promise(r => setTimeout(r, 2000));
    res.inserts = await pg.evaluate(() => window.DxfImportUI.state.last.nInserts);
    // the panels the convert leaves open are closed for the pictures (the same thing a person does before looking at the model)
    await pg.evaluate(() => { document.querySelectorAll('[id$="-panel"], #dxf-meta, .dxf-meta').forEach(p => { if (getComputedStyle(p).position === 'fixed') p.style.display = 'none'; }); });
    await pg.mouse.move(5, 1075); await new Promise(r => setTimeout(r, 800));
    await pg.screenshot({ path: PRE + '_converted.png' });
    res.heap = await pg.evaluate(async () => { for (let i = 0; i < 3; i++) { if (window.gc) window.gc(); await new Promise(r => setTimeout(r, 300)); }
      const tr = window.__DXF_TRACE; return { used: performance.memory.usedJSHeapSize, total: performance.memory.totalJSHeapSize, gc: !!window.gc,
        traceEntries: tr && tr.size || 0, traceJsonBytes: tr ? JSON.stringify(Array.from(tr.entries())).length : 0 }; });
    if (!OVERLAY) { console.log('MS_RESULT ' + JSON.stringify(res)); return; }
    const box = await pg.evaluate(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const cur = () => pg.evaluate(() => { const c = window.__DXF_HOVER.state.cur, t = document.getElementById('dxf-hover-tip'), r = t.getBoundingClientRect();
      return c && !c.other ? { fid: c.fid, guid: c.guid, key: c.key, at: c.at, link: c.link, prov: c.prov, cls: c.cls, handle: c.handle, layer: c.layer, sheet: c.sheet, text: t.textContent, unstamped: !!c.unstamped,
        counts: c.counts || null, layers: c.layers || null, tip: { x: r.left, y: r.top, w: r.width, h: r.height } } : null; });
    const sz = s => (s.layers && s.layers[2] && s.layers[2].items) || [];
    const want = { col: s => s.cls === 'IfcColumn' && sz(s).some(i => i.at), wall: s => WALL && s.guid === WALL,
      bar: s => s.key === 'dxf2section:bar' && sz(s).some(i => /which default is not recorded/.test(i.text)) };
    const KEY = { col: '3', wall: '1', bar: '3' };
    const pts = {}; if (process.env.MS_POINT_WALL) { const [x, y] = process.env.MS_POINT_WALL.split(',').map(Number); pts.wall = { x, y }; }
    let moves = 0;
    for (const N of [[40, 23], [80, 45], [120, 68]]) {
      if (Object.keys(want).every(k => pts[k] || (k === 'wall' && !WALL))) break;
      for (let j = 1; j < N[1]; j++) for (let i = 1; i < N[0]; i++) {
        const x = Math.round(box.x + box.w * i / N[0]), y = Math.round(box.y + box.h * j / N[1]); await pg.mouse.move(x, y); moves++;
        const s = await cur(); if (!s) continue;
        for (const k of Object.keys(want)) if (!pts[k] && want[k](s)) pts[k] = { x, y };
      }
    }
    res.sweepMoves = moves;
    for (const k of Object.keys(pts)) {
      await pg.mouse.move(5, 1075); await new Promise(r => setTimeout(r, 400));
      await pg.mouse.move(pts[k].x, pts[k].y, { steps: 8 }); await new Promise(r => setTimeout(r, 900));
      const s = await cur(); await pg.screenshot({ path: PRE + '_' + k + '.png' });
      if (process.env.MS_CLIP === '1' && s) { const M = 60, x0 = Math.max(0, Math.min(s.tip.x, pts[k].x) - M), y0 = Math.max(0, Math.min(s.tip.y, pts[k].y) - M),
        x1 = Math.min(1920, Math.max(s.tip.x + s.tip.w, pts[k].x) + M), y1 = Math.min(1080, Math.max(s.tip.y + s.tip.h, pts[k].y) + M);
        await pg.screenshot({ path: PRE + '_' + k + '_clip.png', clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } }); }
      await pg.evaluate(() => { window.__opened = []; }); await pg.keyboard.press(KEY[k]); await new Promise(r => setTimeout(r, 300));
      const opened = await pg.evaluate(() => window.__opened.slice());
      res.targets[k] = Object.assign({ point: pts[k], png: PRE + '_' + k + '.png', keyPressed: KEY[k], opened, tipInView: !!(s && s.tip.y >= 0 && s.tip.y + s.tip.h <= 1080 && s.tip.x + s.tip.w <= 1920) }, s || { missing: true });
    }
  } catch (e) { res.errors.push('FATAL ' + String(e && e.message || e).slice(0, 300)); }
  finally { await br.close(); srv.close(); }
  console.log('MS_RESULT ' + JSON.stringify(res));
})();
