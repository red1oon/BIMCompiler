// fieldprobe.js <port> <png> : W-FIELD_VS_EXACT without a render. Persistent profile (IDB field cache reused across runs), page at
// the PNG pose, LightZones.build + field (no Alt+S / refine / GI), then per GWxGH grid floor point: lattice F (skyField) vs exact
// CIE-overcast x cos hemisphere (N rays, glass x (1-opacity)); upCls = class of the first hit straight up. Prints §FIELD_VS_EXACT.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, PNG] = process.argv.slice(2), OUT = __dirname + '/' + (process.env.OUTD || 'fp') + '/';
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const t00 = Date.now(), b = await puppeteer.launch({ headless: true, userDataDir: __dirname + '/prof_' + PORT, protocolTimeout: 1800000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist'] });
  const P = pose(PNG), tag = PNG.match(/(\d+)\.png$/)[1] + (process.env.SUF || ''), p = await b.newPage(); await p.setViewport({ width: P.w, height: P.h }); const L = [];
  p.on('console', m => L.push(m.text().replace(/\n/g, '\\n'))); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + P.url + (process.env.Q || ''), { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 5; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } }
  const tLoad = Date.now() - t00;
  const R = await p.evaluate(async (c, t, GW, GH, NR) => { const A = window.APP, T = window.THREE, LZ = window.LightZones; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); A.camera.updateMatrixWorld();
    if (LZ.prime) { try { await LZ.prime(A); } catch (e) {} }
    const t0 = performance.now(); const Z = LZ.build(A); const tB = performance.now(); const F = Z && LZ.field(A); const tF = performance.now(); if (!F) return { err: 'no field' };
    const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o !== A._sky) { let q = o, v = true; while (q) { if (!q.visible) v = false; q = q.parent; } if (v) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && !m.isMeshBasicMaterial) tg.push(o); } } });
    const glassy = m => !!(m && m.transparent && m.opacity < 0.95 && !m.map);
    const rc = new T.Raycaster(); rc.far = 500; const up = new T.Raycaster(); up.far = 15;
    const cls = q => { const o = q.object, id = o.isBatchedMesh ? q.batchId : o.isInstancedMesh ? q.instanceId : null, g = A.guidMap[o.id + '_' + id], mt = g && A.metaByGuid ? A.metaByGuid[g] : null; return (mt && (mt.ifc_class || mt.cls)) || (o.userData && o.userData.disc) || o.type; };
    const muOf = u => { let m = Math.sqrt(u); for (let i = 0; i < 12; i++) { const f = (m * m / 2 + 2 * m * m * m / 3) * 6 / 7 - u, df = (m + 2 * m * m) * 6 / 7; m -= f / (df || 1e-6); m = Math.min(1, Math.max(0, m)); } return m; };
    const S = Math.round(Math.sqrt(NR)), rows = [], t1 = performance.now(); let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) { rc.far = 500; rc.setFromCamera(new T.Vector2((gx + 0.5) / GW * 2 - 1, 1 - (gy + 0.5) / GH * 2), A.camera);
      const q = rc.intersectObjects(tg, false).find(h => { const m = Array.isArray(h.object.material) ? h.object.material[(h.face && h.face.materialIndex) || 0] : h.object.material; return !glassy(m); }); if (!q || !q.face) continue;
      const n = q.face.normal.clone().transformDirection(q.object.matrixWorld); if (n.dot(A.camera.position.clone().sub(q.point)) < 0) n.negate(); if (n.y < 0.9) continue;
      const P0 = q.point.clone().addScaledVector(n, 0.03), sf = LZ.skyField(q.point, n); up.set(P0, new T.Vector3(0, 1, 0)); const u0 = up.intersectObjects(tg, false)[0];
      let E = 0; for (let a = 0; a < S; a++) for (let b2 = 0; b2 < S; b2++) { const mu = muOf((a + rnd()) / S), ph = 2 * Math.PI * (b2 + rnd()) / S, r = Math.sqrt(1 - mu * mu); rc.set(P0, new T.Vector3(r * Math.cos(ph), mu, r * Math.sin(ph)));
        let Tt = 1; for (const h of rc.intersectObjects(tg, false)) { const m = Array.isArray(h.object.material) ? h.object.material[(h.face && h.face.materialIndex) || 0] : h.object.material; if (glassy(m)) { Tt *= 1 - m.opacity; continue; } Tt = 0; break; } E += Tt; }
      rows.push({ g: [gx, gy], p: q.point.toArray().map(v => +v.toFixed(2)), zone: sf.zone, F: sf.F == null ? null : +sf.F.toFixed(4), E: +(E / (S * S)).toFixed(4), up: u0 ? +u0.distance.toFixed(2) : null, upCls: u0 ? cls(u0) : null }); }
    return { buildMs: Math.round(tB - t0), fieldMs: Math.round(tF - tB), rayMs: Math.round(performance.now() - t1), fieldCached: !!F.cached, rows }; }, P.cam, P.tgt, +(process.env.GW || 24), +(process.env.GH || 14), +(process.env.NR || 64));
  L.push('§FIELD_VS_EXACT ' + JSON.stringify(Object.assign({ loadMs: tLoad }, R)));
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + tag + '.log', L.join('\n') + '\n'); console.log(tag, 'loadMs', tLoad, 'buildMs', R.buildMs, 'fieldMs', R.fieldMs, 'rayMs', R.rayMs, 'cached', R.fieldCached, 'rows', R.rows && R.rows.length, 'wallS', Math.round((Date.now() - t00) / 1000)); await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
