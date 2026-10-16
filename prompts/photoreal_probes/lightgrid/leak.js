// leak.js <port> <png> : HHS_LEAK instrument. Fresh page at the PNG's tEXt pose, APP._fieldTrace = the 4 floor points (set BEFORE the
// press: field() converts them to cells and records every lattice direction that contributed [di, vt, gmin, w*vt]), one Alt+S,
// then per point: zone / F (lattice + shell) / the trace / 128-dir exact sky fraction / per contributing direction the exact
// clear fraction of 48 jittered rays inside that direction's angular cell (quadrature check) / the rendered luminance at the
// point's pixel. Prints §LEAK_TRACE. GPU: run under flock.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, PNG] = process.argv.slice(2), OUT = __dirname + '/' + (process.env.OUTD || '.') + '/';
const PTS = JSON.parse(process.env.PTS);
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const b = await puppeteer.launch({ headless: true, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1503,889'] });
  const P = pose(PNG), tag = PNG.match(/(\d+)\.png$/)[1] + (process.env.SUF || '_leak');
  const p = await b.newPage(); await p.setViewport({ width: P.w, height: P.h }); const L = [];
  p.on('console', m => L.push(m.text().replace(/\n/g, '\\n'))); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + P.url + (process.env.Q || ''), { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 6; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } L.push('§DIAG loaded guids=' + last); } await sleep(3000);
  await p.evaluate((c, t, pts) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); A._fieldTrace = pts.map(function (q) { return [q[0], q[1] + 0.25, q[2]]; }); }, P.cam, P.tgt, PTS);
  await sleep(500); const j0 = L.length; await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
  for (let i = 0; i < (+process.env.WAIT || 400) && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL/.test(t)); i++) await sleep(1000); await sleep(1500);
  const R = await p.evaluate((pts) => { const A = window.APP, T = window.THREE, LZ = window.LightZones, Z = LZ.get(), F = Z && Z.field, out = { pts: [] };
    if (!Z || !F) return { err: 'no zone/field' };
    const tr = new Map(F.trace || []), dirs = LZ.FIELD_DIRS, tg = [], rc = new T.Raycaster();
    A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && !m.isMeshBasicMaterial) tg.push(o); } });
    const glassy = m => !!(m && m.transparent && m.opacity < 0.95 && !m.map && m.type !== 'MeshBasicMaterial');
    const sky = (o, d) => { rc.set(o, d); rc.far = 500; const hs = rc.intersectObjects(tg, false); let T = 1; for (const h of hs) { const m = Array.isArray(h.object.material) ? h.object.material[(h.face && h.face.materialIndex) || 0] : h.object.material; if (glassy(m)) { T *= 1 - m.opacity; continue; } return { sky: 0, T: 0 }; } return { sky: 1, T }; };
    // rendered luminance at the point's pixel (final composite)
    let comp = null; const D = window.__giStillDebugCanvas; if (D) { const w = D.under.width, h = D.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(D.under, 0, 0); fx.drawImage(D.bounce, 0, 0); comp = { px: fx.getImageData(0, 0, w, h).data, w, h }; }
    const cellOf = (x, y, z) => { const i = Math.floor((x - Z.org.x) / Z.cell), j = Math.floor((y - Z.org.y) / Z.cell), k = Math.floor((z - Z.org.z) / Z.cell); return (i < 0 || j < 0 || k < 0 || i >= Z.nx || j >= Z.ny || k >= Z.nz) ? -1 : i + j * Z.nx + k * Z.nx * Z.ny; };
    // seeded jitter
    let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (const q of pts) { const p = new T.Vector3(q[0], q[1] + 0.02, q[2]), c = cellOf(q[0], q[1], q[2]), v = c >= 0 ? Z.zone[c] : -1, zone = v === 65535 ? 'SOLID' : (v & 0x3fff), skyBit = !!(v & 0x4000);
      const cc = cellOf(q[0], q[1] + 0.25, q[2]), vc = cc >= 0 ? Z.zone[cc] : -1;   // the cell above the floor (a floor point's own cell is often the slab)
      const G = F.G, Fcell = cc >= 0 && vc !== 65535 ? G[cc] / 10000 : null, sf = LZ.skyField({ x: q[0], y: q[1], z: q[2] }, { x: 0, y: 1, z: 0 });
      // 128-dir exact upper hemisphere (cosine-weighted like the field: mu = sqrt(u))
      let n = 0, sSky = 0, sT = 0; for (let a = 0; a < 128; a++) { const mu = Math.sqrt((a + 0.5) / 128), ph = 2 * Math.PI * ((a * 0.618034) % 1), r = Math.sqrt(1 - mu * mu); const s = sky(p, new T.Vector3(r * Math.cos(ph), mu, r * Math.sin(ph))); n++; sSky += s.sky; sT += s.T; }
      // the trace of the cell above (field() records the cell of the point given; we gave the floor point -> may be the slab cell; try both)
      const trace = tr.get(cc) || tr.get(c) || null, dirsOut = [];
      if (trace) for (const [di, vt, gmin, wvt] of trace) { const d = dirs[di], u = d.u, e = d.elev;
        // the direction's angular cell: half the spacing to its nearest neighbour direction
        let best = -2; for (let j = 0; j < dirs.length; j++) if (j !== di) { const dd = u[0] * dirs[j].u[0] + u[1] * dirs[j].u[1] + u[2] * dirs[j].u[2]; if (dd > best) best = dd; }
        const half = Math.acos(Math.min(1, best)) / 2; const U = new T.Vector3(u[0], u[1], u[2]), ax = Math.abs(U.y) < 0.9 ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0, 0), t1 = new T.Vector3().crossVectors(U, ax).normalize(), t2 = new T.Vector3().crossVectors(U, t1);
        let clear = 0, clearT = 0, N = 48, exactCentre = sky(p, U); for (let s2 = 0; s2 < N; s2++) { const th = half * Math.sqrt(rnd()), ph = 2 * Math.PI * rnd(); const dj = U.clone().multiplyScalar(Math.cos(th)).addScaledVector(t1, Math.sin(th) * Math.cos(ph)).addScaledVector(t2, Math.sin(th) * Math.sin(ph)).normalize(); const s = sky(p, dj); clear += s.sky; clearT += s.T; }
        // what does the centre ray hit, and where
        rc.set(p, U); rc.far = 500; const hs = rc.intersectObjects(tg, false), h0 = hs[0]; const hitInfo = h0 ? { d: +h0.distance.toFixed(2), cls: (h0.object.userData && (h0.object.userData.ifcClass || h0.object.userData.cls)) || h0.object.type, name: (h0.object.name || '').slice(0, 30), disc: h0.object.userData && h0.object.userData.disc, glassy: glassy(Array.isArray(h0.object.material) ? h0.object.material[(h0.face && h0.face.materialIndex) || 0] : h0.object.material), p: h0.point.toArray().map(v => +v.toFixed(2)) } : null;
        // walk the lattice path cells in the grid from the cell above: which cells does the sweep step through (dx, +1, dz per layer)
        const path = []; { let i = cc % Z.nx, j = ((cc / Z.nx) | 0) % Z.ny, k = (cc / (Z.nx * Z.ny)) | 0; for (let s3 = 0; s3 < 40; s3++) { i += d.dx; j += 1; k += d.dz; if (i < 0 || k < 0 || i >= Z.nx || k >= Z.nz || j >= Z.ny) { path.push('off'); break; } const vv = Z.zone[i + j * Z.nx + k * Z.nx * Z.ny]; path.push(vv === 65535 ? (Z.glassT[i + j * Z.nx + k * Z.nx * Z.ny] ? 'G' : 'S') : vv === 0 ? 'OPEN' : ((vv & 0x3fff) + ((vv & 0x4000) ? '*' : ''))); if (vv === 65535 && !Z.glassT[i + j * Z.nx + k * Z.nx * Z.ny]) break; if (vv === 0) break; } }
        dirsOut.push({ di, dx: d.dx, dz: d.dz, elevDeg: +e.toFixed(1), w: +d.w.toFixed(4), vt, gmin, wvt, coneHalfDeg: +(half * 180 / Math.PI).toFixed(1), exactCentreSky: exactCentre.sky, exactCentreT: +exactCentre.T.toFixed(3), coneClearFrac: +(clear / N).toFixed(3), coneClearT: +(clearT / N).toFixed(3), hit: hitInfo, path: path.join(' ') }); }
      let lum = null; if (comp) { const v4 = p.clone().project(A.camera); const X = Math.round((v4.x + 1) / 2 * comp.w), Y = Math.round((1 - v4.y) / 2 * comp.h); if (X >= 0 && Y >= 0 && X < comp.w && Y < comp.h) { let s = 0, m = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const i = ((Y + dy) * comp.w + X + dx) * 4; s += (comp.px[i] + comp.px[i + 1] + comp.px[i + 2]) / 3; m++; } lum = { X, Y, mean5x5: +(s / m).toFixed(1) }; } }
      const latticeSum = trace ? +trace.reduce((s, t) => s + t[3], 0).toFixed(4) : null;
      out.pts.push({ p: q, cell: c, zone, skyBit, cellAbove: cc, zoneAbove: vc === 65535 ? 'SOLID' : (vc & 0x3fff), Fcell, FskyField: sf && sf.F != null ? +sf.F.toFixed(4) : null, exact128: { sky: +(sSky / n).toFixed(4), throughGlassT: +(sT / n).toFixed(4) }, latticeContribSum: latticeSum, nDirs: trace ? trace.length : null, dirs: dirsOut, lum }); }
    const zi = Z.zoneInfo && Z.zoneInfo[91]; out.zone92 = zi ? { cells: zi.cells, m3: zi.m3, apertureM2: zi.apertureM2, upM2: zi.upM2, sideM2: zi.sideM2, skyLitCells: zi.skyLitCells } : null;
    out.field = { shell: F.shell && { on: F.shell.on, cells: F.shell.cells, recomputed: F.shell.recomputed }, glassOpen: F.glassOpen && F.glassOpen.stats };
    return out; }, PTS);
  L.push('§LEAK_TRACE ' + JSON.stringify(R));
  fs.writeFileSync(OUT + tag + '.log', L.join('\n') + '\n'); fs.writeFileSync(OUT + tag + '.leak.json', JSON.stringify(R, null, 1));
  console.log(tag, L.length, 'lines'); await p.close(); await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
