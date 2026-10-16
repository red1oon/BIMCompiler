// dark px: sky-view field F (the renderer's) vs a geometric sky fraction from 64 cosine-weighted rays (opaque only)
const A = window.APP, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height, LZ = window.LightZones;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
const pts = []; for (let i = 0, p = 0; i < fin.length; i += 4, p++) { const fa = fin[i + 3] > 0, L = fa ? (fin[i] + fin[i + 1] + fin[i + 2]) / 3 : (app[i] + app[i + 1] + app[i + 2]) / 3; if (L <= 15 && p % 97 === 0) pts.push(p); }
const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
const opaque = q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95); };
const rc = new THREE.Raycaster(), rows = []; let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const p of pts.slice(0, 40)) { const x = p % w, y = (p / w) | 0; rc.setFromCamera(new THREE.Vector2((x + .5) / w * 2 - 1, 1 - (y + .5) / h * 2), A.camera); rc.far = Infinity;
  const hh = rc.intersectObjects(tg, false).find(opaque); if (!hh) continue; const n = hh.face ? hh.face.normal.clone().transformDirection(hh.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
  const P = hh.point.clone().addScaledVector(n, 0.05); let F = null; try { F = LZ.skyField(P, n); } catch (e) { F = 'err ' + e.message; }
  // geometric: cosine-weighted hemisphere around n, fraction of rays that escape (upper sky only: dir.y > 0)
  let esc = 0, N = 48; const t1 = Math.abs(n.y) < .9 ? new THREE.Vector3(0, 1, 0).cross(n).normalize() : new THREE.Vector3(1, 0, 0).cross(n).normalize(), t2 = n.clone().cross(t1);
  for (let i = 0; i < N; i++) { const u = rnd(), v = rnd(), r = Math.sqrt(u), ph = 2 * Math.PI * v; const d = t1.clone().multiplyScalar(r * Math.cos(ph)).addScaledVector(t2, r * Math.sin(ph)).addScaledVector(n, Math.sqrt(1 - u)).normalize();
    if (d.y <= 0) continue; rc.set(P, d); rc.far = 300; if (!rc.intersectObjects(tg, false).some(opaque)) esc++; }
  rows.push({ d: +hh.distance.toFixed(0), n: n.y > .7 ? 'up' : n.y < -.7 ? 'down' : 'side', zone: LZ.at(P), F: typeof F === 'number' ? +F.toFixed(3) : F, geomSky: +(esc / N).toFixed(2), col: (hh.object.material.color || { getHexString: () => '' }).getHexString ? hh.object.material.color.getHexString() : '' }); }
return rows;
