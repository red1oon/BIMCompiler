#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v3 cutaways. Records one of OUR OWN pages (4D/5D boq_charts.html, the road compliance
// report model_check_report.html) as a short silent clip for the film: load the page headless, wait for its own §-line, then
// screenshot at FPS while scrolling top→bottom over SEC seconds, encode with ffmpeg. Read the log: §PAGE_CLIP.
// usage: ROOT=<bim-ootb tree> node film_page_clip.js <url-path?query> <out.mp4> <sec> <readyRegex> [W H]
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), { execFileSync } = require('child_process');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');
const [urlPath, OUT, SEC, READY, W0, H0] = process.argv.slice(2);
const ROOT = process.env.ROOT, W = +(W0 || 1852), H = +(H0 || 960), FPS = 15, PORT = +(process.env.PORT || 8660);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.db': 'application/octet-stream', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((q, r) => { try { let fp = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(fp)) { r.writeHead(404); r.end(); return; } const st = fs.statSync(fp);
  r.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(r); } catch (e) { r.writeHead(500); r.end(); } });
(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', `--window-size=${W},${H}`] });
  const p = await b.newPage(); await p.setViewport({ width: W, height: H });
  let ready = false; const re = new RegExp(READY);
  p.on('console', m => { const t = m.text(); if (re.test(t)) { ready = true; console.log('  [page] ' + t.slice(0, 200)); } });
  await p.goto(`http://127.0.0.1:${PORT}/${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 300000 });
  for (let i = 0; i < 600 && !ready; i++) await new Promise(r => setTimeout(r, 1000));
  if (!ready) { console.log('§PAGE_CLIP INCONCLUSIVE never saw /' + READY + '/'); process.exit(2); }
  await new Promise(r => setTimeout(r, 3000));   // charts finish their own animation
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pclip-')), n = Math.round(+SEC * FPS);
  const maxY = await p.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  for (let i = 0; i < n; i++) {
    const u = i / Math.max(1, n - 1), e = u < 0.15 ? 0 : u > 0.85 ? 1 : (u - 0.15) / 0.7;   // hold top, glide, hold bottom
    await p.evaluate(y => window.scrollTo(0, y), Math.round(maxY * (0.5 - 0.5 * Math.cos(Math.PI * e))));
    await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
  }
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, '%04d.png'), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', OUT]);
  console.log(`§PAGE_CLIP url=${urlPath.split('?')[0]} frames=${n} scrollPx=${maxY} out=${OUT}`);
  await b.close(); server.close();
})().catch(e => { console.log('§PAGE_CLIP CRASH ' + e.message); process.exit(2); });
