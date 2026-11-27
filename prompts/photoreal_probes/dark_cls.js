const A = window.APP, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
const pts = []; let n = 0;
for (let i = 0, p = 0; i < fin.length; i += 4, p++) { const fa = fin[i + 3] > 0, L = fa ? (fin[i] + fin[i + 1] + fin[i + 2]) / 3 : (app[i] + app[i + 1] + app[i + 2]) / 3; if (L <= 15) { n++; if (p % 11 === 0) pts.push(p); } }
const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
const rc = new THREE.Raycaster(), grp = {}, LZ = window.LightZones, sd = A.sun.position.clone().normalize(); let miss = 0; const step = Math.max(1, Math.floor(pts.length / 250));
const opaque = q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95); };
for (let k = 0; k < pts.length; k += step) { const p = pts[k], x = p % w, y = (p / w) | 0; rc.setFromCamera(new THREE.Vector2((x + .5) / w * 2 - 1, 1 - (y + .5) / h * 2), A.camera); rc.far = Infinity;
  const hh = rc.intersectObjects(tg, false).find(q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !m.isMeshBasicMaterial; }); if (!hh) { miss++; continue; }
  const ob = hh.object, mm = Array.isArray(ob.material) ? ob.material[0] : ob.material, nn = hh.face ? hh.face.normal.clone().transformDirection(ob.matrixWorld) : new THREE.Vector3(0, 1, 0);
  let zv = null; try { zv = LZ.at({ x: hh.point.x + nn.x * .3, y: hh.point.y + nn.y * .3, z: hh.point.z + nn.z * .3 }); } catch (e) {}
  let sh = 'away'; if (nn.dot(sd) > 0) { rc.set(hh.point.clone().addScaledVector(nn, .05), sd); rc.far = 600; sh = rc.intersectObjects(tg, false).some(opaque) ? 'sunBlocked' : 'SUNLIT'; }
  const isGlass = mm.transparent && mm.opacity < .95;
  const key = (ob === A.ground ? 'GROUND' : (ob.userData.ifcClass || (ob.userData.isBatched ? 'batched' : ob.type)) + '/' + (ob.userData.disc || '')) + (isGlass ? ' GLASS' : '') + ' ' + (mm.color ? mm.color.getHexString() : '') + ' n=' + (nn.y > .7 ? 'up' : nn.y < -.7 ? 'down' : 'side') + ' ' + sh + ' zone=' + (zv === 0 ? 'out' : zv == null ? '?' : zv === -1 ? 'off' : 'in');
  const g = grp[key] || (grp[key] = { n: 0, d: 0 }); g.n++; g.d += hh.distance; }
return { darkPx: n, darkPct: +(100 * n / (w * h)).toFixed(2), sampled: Math.ceil(pts.length / step), miss, rows: Object.entries(grp).sort((a, b) => b[1].n - a[1].n).slice(0, 14).map(([k, g]) => g.n + ' d=' + (g.d / g.n).toFixed(0) + ' ' + k) };
