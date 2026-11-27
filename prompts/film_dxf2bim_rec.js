#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: FILM_PLAN §9 T3 (DXF2BIM film). Records film_dxf2bim.html frame by frame (CPU, software GL, no GPU lock):
// serves <pageDir> on a local port, calls renderAt(t) for t = i/FPS, screenshots, pipes JPEGs into ffmpeg -> silent master.
// Writes §ERP_FILM_BEAT id=<id> t=<s> per beat (for film_narration_poly.py) and forwards the page's §FILM_* console lines. Read the log.
// usage: node film_dxf2bim_rec.js <pageDir> <out.mp4> [fps=24] [fromSec] [toSec]   (from/to = preview a slice)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require(path.join(process.env.HOME, 'bim-ootb/tests/node_modules/playwright'));
const [dir, out, fpsArg, fromArg, toArg] = process.argv.slice(2);
if (fs.existsSync(out)) { console.error('refusing to overwrite ' + out); process.exit(2); }
const FPS = +(fpsArg || 24);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, s) => { const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); s.end(b); }); });
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  let pageErr = 0;
  page.on('console', m => { const t = m.text(); if (/^§/.test(t)) console.log(t); });
  page.on('pageerror', e => { pageErr++; console.log('§PAGEERR ' + e.message); });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.FILM_READY === true, null, { timeout: 60000 });
  const total = await page.evaluate(() => window.FILM_SEC);
  const from = fromArg ? +fromArg : 0, to = toArg ? Math.min(+toArg, total) : total;
  const n = Math.round((to - from) * FPS);
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const beats = await page.evaluate(() => (window.TL_BEATS = null, null));
  let last = null; const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = from + i / FPS;
    const id = await page.evaluate(tt => window.renderAt(tt), t);
    if (id !== last) { console.log(`§ERP_FILM_BEAT id=${id} t=${(t - from).toFixed(3)}`); last = id; }
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (FPS * 10) === 0) console.error(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close(); srv.close();
  console.log(`§FILM_REC frames=${n} fps=${FPS} sec=${(n / FPS).toFixed(3)} pageerr=${pageErr} out=${out}`);
})().catch(e => { console.log('§FILM_REC_ERROR ' + e.stack); process.exit(1); });
