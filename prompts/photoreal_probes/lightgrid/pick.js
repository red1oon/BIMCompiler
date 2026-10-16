// pick.js <port> <png> : fresh page at the PNG pose (no Alt+S); for PX=[[x,y],..] (PNG pixel coords) list the first 4 raycast hits:
// guid, class, material name/opacity/transparent, distance; plus xray/ghost state. Answers "what is see-through at this pixel".
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, PNG] = process.argv.slice(2);
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const b = await puppeteer.launch({ headless: true, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist'] });
  const P = pose(PNG), p = await b.newPage(); await p.setViewport({ width: P.w, height: P.h });
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + P.url, { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 6; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } }
  const R = await p.evaluate((c, t, px, W, H) => { const A = window.APP, T = window.THREE; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); A.camera.updateMatrixWorld();
    const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o !== A._sky) { let q = o, v = true; while (q) { if (!q.visible) v = false; q = q.parent; } if (v) tg.push(o); } });
    const rc = new T.Raycaster(); const out = { xray: A.xrayOn, ghost: typeof window.ghostXrayOn === 'function' ? window.ghostXrayOn() : null, pts: [] };
    px.forEach(([x, y]) => { rc.setFromCamera(new T.Vector2(x / W * 2 - 1, 1 - y / H * 2), A.camera); out.pts.push({ px: [x, y], hits: rc.intersectObjects(tg, false).slice(0, 4).map(h => { const o = h.object, id = o.isBatchedMesh ? h.batchId : o.isInstancedMesh ? h.instanceId : null;
      const m = Array.isArray(o.material) ? o.material[(h.face && h.face.materialIndex) || 0] : o.material; const g = A.guidMap[o.id + '_' + id] || null; const meta = g && A.metaByGuid ? A.metaByGuid[g] : null;
      return { d: +h.distance.toFixed(2), g, cls: (meta && (meta.ifc_class || meta.cls)) || (o.userData && (o.userData.ifcClass || o.userData.disc)) || null, obj: (o.name || o.type).slice(0, 30), mat: m ? (m.name || m.type).slice(0, 30) : null, op: m ? +m.opacity.toFixed(2) : null, transp: m ? m.transparent : null, col: m && m.color ? m.color.getHexString() : null, side: m ? m.side : null, facing: h.face ? +(h.face.normal.clone().transformDirection(o.matrixWorld).dot(A.camera.position.clone().sub(h.point).normalize())).toFixed(2) : null, depthWrite: m ? m.depthWrite : null }; }) }); });
    return out; }, P.cam, P.tgt, JSON.parse(process.env.PX), P.w, P.h);
  console.log('§PICK ' + JSON.stringify(R, null, 1)); await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
