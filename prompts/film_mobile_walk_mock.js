#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v5 MOBILE SITE-WALK MOCK-UP. A LABELLED mock-up: the viewer's REAL walk mode (walk.js:
// toggleWalkMode/setWalkAnchor/advanceWalkStep + deviceorientation-driven look) on the real CivilWorks.db in a phone viewport. Only the
// position source is simulated (GPS mapping pending, CIVIL_HIGHWAY_JELAPANG.md §I.2). No product code change; the page-level shim below is
// harness-only and §-logged. ONE spot: stand at the junction with most signal heads, walk a few metres, pan left→right.
// READ THE LOG after every run: §MOCK_WALK lines. usage: ROOT=<bim-ootb tree with viewer/buildings/CivilWorks.db> node film_mobile_walk_mock.js
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), { execFileSync } = require('child_process');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');
const ROOT = process.env.ROOT, PORT = +(process.env.PORT || 8661);
const FINAL = path.join(os.homedir(), 'Videos/CivilWorks_mobile_walk_MOCKUP.mp4'), RAW = FINAL.replace('_MOCKUP.mp4', '_MOCKUP_raw.mp4');
const W = 390, H = 844, FPS = 15, N = 75, EYE = 1.7, STEPS = 10, WALK_FR = 20, TURN_FR = 10, SPAN = 40;
const SIGN = +(process.env.SIGN || 1);   // alpha sign so that +theta = left (calibrated from the logged yaw)
for (const f of [FINAL, RAW]) if (fs.existsSync(f)) { console.log('§MOCK_WALK REFUSE overwrite ' + f); process.exit(2); }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((q, r) => { try { const fp = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(fp)) { r.writeHead(404); r.end(); return; } const size = fs.statSync(fp).size, type = MIME[path.extname(fp)] || 'application/octet-stream', rg = q.headers.range && /bytes=(\d*)-(\d*)/.exec(q.headers.range);
  if (rg) { const a = rg[1] ? +rg[1] : 0, b = rg[2] ? Math.min(+rg[2], size - 1) : size - 1;
    r.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Content-Length': b - a + 1, 'Accept-Ranges': 'bytes' }); fs.createReadStream(fp, { start: a, end: b }).pipe(r); }
  else { r.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); fs.createReadStream(fp).pipe(r); } } catch (e) { r.writeHead(500); r.end(); } });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * u);
(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  let verdict = null; p.on('console', m => { const t = m.text(); if (/§MERGE_CONTRACT|§WALK_|§MOCK/.test(t)) { console.log('  [page] ' + t.slice(0, 200)); const v = /MERGE_CONTRACT.*verdict=(\w+)/.exec(t); if (v) verdict = v[1]; } });
  await p.goto(`http://127.0.0.1:${PORT}/viewer/viewer.html?db=buildings/CivilWorks.db&bld=CivilWorks`, { waitUntil: 'domcontentloaded', timeout: 300000 });
  for (let i = 0; i < 900 && verdict !== 'COMPLETE'; i++) await sleep(1000);
  if (verdict !== 'COMPLETE') { console.log('§MOCK_WALK INCONCLUSIVE never saw verdict=COMPLETE (last=' + verdict + ')'); await b.close(); server.close(); process.exit(2); }
  await sleep(3000);
  // ── harness shim: on a phone effects.js is skipped (§EFFECTS_SKIP mobile) so A.civilDriveRoute is undefined and civilRouteAt/civilCastZ gate to null.
  // Provide it from the same civilRoutePath() the film uses so the SAME ground-cast owner can be read. Logged; not shipped.
  const info = await p.evaluate(() => {
    const A = window.APP, had = typeof A.civilDriveRoute;
    const R = A.civilRoutePath(); A.civilDriveRoute = () => R.path;
    const L = A.civilRouteAt(0).len;
    let best = null; (R.stops || []).forEach(j => { if (!best || j.n > best.n) best = j; });
    let sJ = null, dm = 1e9; for (let s = 0; s <= L; s += 2) { const q = A.civilRouteAt(s), d = Math.hypot(q.x - best.x, q.z - best.z); if (d < dm) { dm = d; sJ = s; } }
    const cv = A.renderer.domElement, hidden = [];
    document.querySelectorAll('body *').forEach(e => { if (e === cv || e.contains(cv) || cv.contains(e)) return; const cs = getComputedStyle(e);
      if ((cs.position === 'fixed' || cs.position === 'absolute') && cs.display !== 'none' && cs.visibility !== 'hidden' && e.getBoundingClientRect().width > 0) { e.style.setProperty('visibility', 'hidden', 'important'); hidden.push((e.id || String(e.className) || e.tagName).slice(0, 28)); } });
    return { had, src: R.src, L, nStops: (R.stops || []).length, jn: best.n, sJ, dm, hidden, eye: A.WALK_EYE_HEIGHT, step: A.WALK_STEP_DISTANCE };
  });
  const s0 = Math.max(0, info.sJ - 25);
  console.log(`§MOCK_WALK shim civilDriveRoute was ${info.had} on phone (effects skipped) -> from civilRoutePath src=${info.src}; route len=${info.L.toFixed(1)}m junctions=${info.nStops}`);
  console.log(`§MOCK_WALK spot: junction with most signal heads n=${info.jn} at chainage ~${info.sJ} m (route dist ${info.dm.toFixed(1)} m); stand at s=${s0} m, walk ${STEPS}x${info.step}m, pan +${SPAN}..-${SPAN} deg; hiddenChrome=${info.hidden.length} [${info.hidden.join('|')}]`);
  // ── real walk mode: anchor (logs what the real flow anchors to), then place at the simulated fix and re-face the tangent
  const st = await p.evaluate((s0, EYE) => {
    const A = window.APP; A.toggleWalkMode(); A.setWalkAnchor();
    const anchored = { x: A.camera.position.x, y: A.camera.position.y, z: A.camera.position.z, active: A.walkModeActive, door: !!A.walkAnchorIFC };
    const q = A.civilRouteAt(s0), g = A.civilCastZ(q.x, q.z, 'ROAD'), look = A.civilRouteAt(s0 + 15);
    A.camera.position.set(q.x, g + EYE, q.z); A.camera.lookAt(look.x, g + EYE, look.z); A.camera.updateMatrixWorld(true);
    A._walkQDoor = A.camera.quaternion.clone();   // walk.js freezes the view on this until the phone moves
    const T = Math.atan2(q.tx, q.tz);
    // overlays
    const ov = document.createElement('div'); ov.id = 'mock-ov'; ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:sans-serif';
    ov.innerHTML = '<div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);width:340px;text-align:center;background:rgba(20,22,28,.82);color:#fff;border:1px solid #4fc3f7;border-radius:14px;padding:6px 12px;font-size:12.5px;line-height:1.3">Site walk on mobile · GPS mapping pending (position simulated)</div>'
      + '<div id="mock-ch" style="position:absolute;top:64px;left:50%;transform:translateX(-50%);background:rgba(20,22,28,.7);color:#cfd8dc;border-radius:10px;padding:3px 10px;font-size:12px"></div>'
      + '<div style="position:absolute;left:50%;bottom:130px;width:96px;height:96px;margin-left:-48px;border-radius:50%;background:rgba(66,133,244,.22);border:1.5px solid rgba(66,133,244,.55)"></div>'
      + '<div style="position:absolute;left:50%;bottom:166px;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#4285f4;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></div>';
    document.body.appendChild(ov);
    return { anchored, g, T, storeys: (A.walkStoreyLevels || []).length };
  }, s0, EYE);
  console.log(`§MOCK_WALK real walk: walkModeActive=${st.anchored.active} doorAnchor=${st.anchored.door} anchoredAt=(${st.anchored.x.toFixed(1)},${st.anchored.y.toFixed(1)},${st.anchored.z.toFixed(1)}) storeyLevelsCached=${st.storeys}; placed at simulated fix, ground(ROAD)=${st.g.toFixed(2)}`);
  if (!st.anchored.active) { console.log('§MOCK_WALK walk mode did not start -> scripted fallback NOT implemented; INCONCLUSIVE'); await b.close(); server.close(); process.exit(2); }
  const ev = (alpha) => p.evaluate(a => { const e = new Event('deviceorientation'); Object.assign(e, { alpha: a, beta: 90, gamma: 0, absolute: false }); window.dispatchEvent(e); }, alpha);
  const A0 = 180; await ev(A0); await sleep(300); await ev(A0 + 8); await sleep(300); await ev(A0); await sleep(300);   // baseline, unlock (>5 deg), return to tangent
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mwalk-')), rows = [], tcap = [];
  let stepsDone = 0;
  for (let i = 0; i < N; i++) {
    const th = i < WALK_FR ? 0 : i < WALK_FR + TURN_FR ? SPAN * ease((i - WALK_FR) / TURN_FR) : SPAN - 2 * SPAN * ease((i - WALK_FR - TURN_FR) / (N - 1 - WALK_FR - TURN_FR));
    await ev(A0 + SIGN * th);
    const want = i < WALK_FR ? Math.round(STEPS * (i + 1) / WALK_FR) : STEPS;
    const f = await p.evaluate((nSteps, T) => {
      const A = window.APP; while (A._steps === undefined) A._steps = 0;
      while (A._steps < nSteps) { A.walkStepCount++; A.advanceWalkStep(); A._steps++; }   // the real step function
      const c = A.camera.position, d = new THREE.Vector3(); A.camera.getWorldDirection(d);
      const gR = A.civilCastZ(c.x, c.z, 'ROAD'), ground = gR != null ? gR : A.civilCastZ(c.x, c.z, 'EARTHWORK');
      let near = null; (A.walkStoreyLevels || []).forEach(s => { const dd = Math.abs((s.floorZ) - c.y); if (near === null || dd < near) near = dd; });
      let best = 0, bd = 1e9; const L = A.civilRouteAt(0).len; for (let s = 0; s <= L; s += 1) { const q = A.civilRouteAt(s), dd = Math.hypot(q.x - c.x, q.z - c.z); if (dd < bd) { bd = dd; best = s; } }
      document.getElementById('mock-ch').textContent = 'chainage ' + Math.round(best) + ' m (inferred)';
      let ang = Math.atan2(d.x, d.z) - T; ang = Math.atan2(Math.sin(ang), Math.cos(ang));
      return { x: c.x, z: c.z, y: c.y, ground, rel: c.y - ground, off: bd, yaw: ang * 180 / Math.PI, s: best, pitch: Math.asin(d.y) * 180 / Math.PI, heap: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null, near };
    }, want, st.T);
    await sleep(130);
    const t0 = Date.now(); await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') }); tcap.push(Date.now() - t0);
    rows.push(f);
  }
  const rel = rows.map(r => r.rel), yaw = rows.map(r => r.yaw);
  let jump = 0; for (let i = 1; i < rows.length; i++) jump = Math.max(jump, Math.abs(rows[i].y - rows[i - 1].y));
  const bad = rel.filter(v => v == null || Math.abs(v - EYE) > 0.5).length, miss = rows.filter(r => r.ground == null).length;
  const hv = rows.map(r => r.heap).filter(x => x != null), mv = Math.min(...yaw), xv = Math.max(...yaw);
  console.log(`§MOCK_WALK eye-above-ground per frame (first/mid/last) ${rel[0]?.toFixed(2)} ${rel[N >> 1]?.toFixed(2)} ${rel[N - 1]?.toFixed(2)}; min=${Math.min(...rel).toFixed(2)} max=${Math.max(...rel).toFixed(2)} (target ${EYE}); frames |dev|>0.5m=${bad} groundMiss=${miss} maxFrameYJump=${jump.toFixed(3)}m; nearestStoreyFloorMin=${Math.min(...rows.map(r => r.near)).toFixed(2)}m`);
  console.log(`§MOCK_WALK yaw rel. tangent first=${yaw[0].toFixed(1)} atTurnEnd=${yaw[WALK_FR + TURN_FR].toFixed(1)} last=${yaw[N - 1].toFixed(1)} range=${mv.toFixed(1)}..${xv.toFixed(1)} (left=+); walked dist=${Math.hypot(rows[WALK_FR].x - rows[0].x, rows[WALK_FR].z - rows[0].z).toFixed(1)}m off-route max=${Math.max(...rows.map(r => r.off)).toFixed(1)}m s=${rows[0].s}..${rows[N - 1].s}`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, '%04d.png'), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', RAW]);
  console.log(`§MOCK_WALK raw frames=${N} dur=${(N / FPS).toFixed(2)}s heapMB=${hv.length ? Math.max(...hv).toFixed(0) : 'NA'} captureFps=${(1000 / (tcap.reduce((a, c) => a + c, 0) / N)).toFixed(1)} out=${RAW}`);
  await b.close();
  // ── phone silhouette: plain drawn shapes, no brand; video sits under a frame PNG whose screen is transparent
  const b2 = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }), p2 = await b2.newPage(); await p2.setViewport({ width: 1920, height: 1080 });
  const BW = 450, BH = 960, bx = (1920 - BW) / 2, by = 60, SW = 416, SH = 900, sx = bx + (BW - SW) / 2, sy = by + (BH - SH) / 2;
  const rr = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
  await p2.setContent(`<body style="margin:0;background:transparent"><svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0b0c0f" fill-rule="evenodd" d="M0,0H1920V1080H0Z ${rr(bx, by, BW, BH, 58)}"/>
    <path fill="#1c1e24" stroke="#3a3d46" stroke-width="2" fill-rule="evenodd" d="${rr(bx, by, BW, BH, 58)} ${rr(sx, sy, SW, SH, 42)}"/>
    <rect x="${960 - 34}" y="${sy + 10}" width="68" height="16" rx="8" fill="#000"/></svg></body>`);
  const FRAME = path.join(os.tmpdir(), 'phone_frame.png'); await p2.screenshot({ path: FRAME, omitBackground: true }); await b2.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x0b0c0f:s=1920x1080:r=15', '-i', RAW, '-i', FRAME, '-filter_complex',
    `[1:v]scale=${SW}:${SH}[v];[0:v][v]overlay=${sx}:${sy}:shortest=1[a];[a][2:v]overlay=0:0[o]`, '-map', '[o]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', FINAL]);
  console.log(`§MOCK_WALK final ${FINAL} (1920x1080, phone silhouette) raw kept ${RAW} verdict=${bad > 0 || miss > 0 ? 'CHECK' : 'OK'}`);
  server.close();
})().catch(e => { console.log('§MOCK_WALK CRASH ' + e.message); process.exit(2); });
