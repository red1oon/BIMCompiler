// ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v5 SECTIONS CLIP (user 2026-10-07: "Section 3, since OK, do just its clip only").
// Records ONE clip (no film bake): Cut section → Long (round profile lens on the road, wheel-zoom the span) → Cross (slice scrubbed
// along the road, camera to each chainage) → Profile PDF sheet. Real GPU like the bakes. Read sections_clip.log (§CLIP marks = video
// seconds of interest) — exit code is not evidence. Usage: ROOT=<bim-ootb worktree with feat/profile-lens> OUT=<dir> node this.js
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = process.env.ROOT || '/tmp/wt-profile-lens';
const OUT = process.env.OUT || path.join(os.tmpdir(), 'sections_clip');
const DBDIR = path.join(os.homedir(), 'Downloads', 'JALAN JELAPANG IFC');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/viewer/viewer.html';
  let fp = path.join(ROOT, p);
  if (!fs.existsSync(fp) && p.startsWith('/buildings/')) fp = path.join(DBDIR, p.slice(11));
  fs.readFile(fp, (e, buf) => { if (e) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); res.end(buf); });
});
fs.mkdirSync(OUT, { recursive: true });
const log = []; let T0 = 0;
const S = m => { const l = '+' + ((Date.now() - T0) / 1000).toFixed(2) + 's ' + m; log.push(l); console.log(l); };
const save = () => fs.writeFileSync(path.join(OUT, 'sections_clip.log'), log.join('\n'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const seen = re => log.some(l => re.test(l));
(async () => {
  await new Promise(r => server.listen(8434, '127.0.0.1', r));
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'secclip-')), {
    args: ['--use-angle=gl-egl', '--ignore-gpu-blocklist'],
    env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }),
    viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
  const page = await ctx.newPage(); T0 = Date.now();
  page.on('console', m => { const t = m.text(); if (/§/.test(t)) log.push('  [con] ' + t.slice(0, 300)); });
  page.on('pageerror', e => log.push('  [pageerror] ' + e));
  await page.goto('http://127.0.0.1:8434/viewer/viewer.html?db=/buildings/CivilWorksPath.db&bld=CivilWorksPath', { waitUntil: 'domcontentloaded', timeout: 120000 });
  let ok = false;
  for (let i = 0; i < 400 && !ok; i++) { await sleep(1000); ok = seen(/§MERGE_CONTRACT .*verdict=COMPLETE/); }
  S('§CLIP_LOAD ' + (ok ? 'COMPLETE' : 'NOT COMPLETE')); if (!ok) { save(); await ctx.close(); server.close(); process.exit(2); }
  S('§CLIP_GL ' + await page.evaluate(() => { try { const g = APP.renderer.getContext(), d = g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?'; } catch (e) { return 'n/a'; } }));
  // Profile precompute BEFORE the visible part, so the clip never shows "preparing profile…".
  await page.evaluate(() => APP.civilProfilePrepare && APP.civilProfilePrepare());
  for (let i = 0; i < 300 && !seen(/§PROFILE_LENS_PRECOMPUTE/); i++) await sleep(1000);
  const tmWas = await page.evaluate(() => { const p = document.getElementById('time-machine-panel'); const on = !!(p && p.style.display !== 'none' && p.getBoundingClientRect().width > 0);
    if (on && typeof window.toggleTimeMachine === 'function') window.toggleTimeMachine(); return on; });
  S('§CLIP_TM_CLOSE wasOpen=' + tmWas); await sleep(2000);
  await page.evaluate(() => APP.civilGotoChainage && APP.civilGotoChainage(1100)); await sleep(3000);
  // ── Long ──
  S('§CLIP_MARK long_start');
  await page.evaluate(() => { if (!APP.sectionOn) APP.toggleSection(); }); await sleep(1200);
  await page.evaluate(() => document.getElementById('sec-axis-long').click()); await sleep(2500);
  const lens = await page.evaluate(() => { const c = document.getElementById('civil-lens'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width, vis: c.style.display }; });
  S('§CLIP_LENS ' + JSON.stringify(lens));
  if (lens) { await page.mouse.move(lens.x, lens.y); for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, 240); await sleep(350); } await sleep(1200);
    for (let k = 0; k < 3; k++) { await page.mouse.wheel(0, -240); await sleep(350); } }
  await sleep(1500);
  // ── Cross ──
  S('§CLIP_MARK cross_start');
  await page.evaluate(() => document.getElementById('sec-axis-cross').click()); await sleep(1500);
  for (const s of [900, 1000, 1100, 1200]) {
    await page.evaluate((s) => { const sl = document.getElementById('section-slider'); sl.value = String(s); sl.dispatchEvent(new Event('input', { bubbles: true }));
            // three-quarter view: 25 m back, 30 m to the side (route normal), 18 m up — the uncapped 2 m slice reads as a band
      const p = APP.civilRouteAt(s); if (p) { const nx = -p.tz, nz = p.tx; APP.camera.position.set(p.x - p.tx * 25 + nx * 30, p.y + 18, p.z - p.tz * 25 + nz * 30);
        if (APP.controls && APP.controls.target) { APP.controls.target.set(p.x, p.y, p.z); APP.controls.update && APP.controls.update(); } else APP.camera.lookAt(p.x, p.y, p.z);
        APP.markDirty && APP.markDirty(); } }, s);
    S('§CLIP_CROSS s=' + s); await sleep(1300);
  }
  // ── Profile PDF ──
  S('§CLIP_MARK pdf_start');
  await page.evaluate(() => document.getElementById('sec-axis-long').click()); await sleep(1500);
  const popP = ctx.waitForEvent('page', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => { const b = document.getElementById('civil-profile-pdf'); if (b) b.click(); });
  const pop = await popP; S('§CLIP_PDF_POPUP ' + (pop ? 'opened' : 'none'));
  if (pop) { await sleep(4000); await pop.setViewportSize({ width: 1280, height: 720 }).catch(() => {});
    await pop.screenshot({ path: path.join(OUT, 'profile_pdf_sheet.png') }); S('§CLIP_PDF_STILL ' + path.join(OUT, 'profile_pdf_sheet.png')); }
  log.filter(l => /§(PROFILE_LENS|CROSS_SECTION|LONG_SECTION)/.test(l)).slice(-12).forEach(l => S('§CLIP_LOG ' + l.trim()));
  S('§CLIP_MAIN_VIDEO ' + (await page.video().path()));
  save(); await ctx.close(); server.close(); save();
})().catch(e => { S('§CLIP_FATAL ' + (e && e.stack || e)); save(); process.exit(1); });
