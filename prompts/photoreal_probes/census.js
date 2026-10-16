// M2 census: per drawable mesh, how many instances are drawn (visible mesh, non-zero matrix, batch instance visible)
const A = window.APP, out = {}, m4 = new THREE.Matrix4();
A.scene.traverse(o => { if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return;
  let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) { vis = false; break; }
  const key = o.uuid, ud = o.userData || {}; let n = 1, live = 1;
  if (o.isInstancedMesh) { n = o.count; live = 0; const a = o.instanceMatrix.array; for (let i = 0; i < o.count; i++) { const b = i * 16; if (a[b] || a[b + 1] || a[b + 2] || a[b + 4] || a[b + 5] || a[b + 6] || a[b + 8] || a[b + 9] || a[b + 10]) live++; } }
  else if (o.isBatchedMesh) { const info = o._instanceInfo || []; n = info.length; live = 0; for (let i = 0; i < info.length; i++) { if (!info[i] || !info[i].active || !info[i].visible) continue; o.getMatrixAt(i, m4); const e = m4.elements; if (e[0] || e[1] || e[2] || e[4] || e[5] || e[6] || e[8] || e[9] || e[10]) live++; } }
  out[key] = [vis ? live : 0, n, (ud.ifcClass || (o.isBatchedMesh ? 'batched' : o.type)) + '/' + (ud.disc || '') + '/' + (ud.storey || '')]; });
window.__census = window.__census || {}; window.__census[window.__censusTag || 'x'] = out;
let tot = 0; for (const k in out) tot += out[k][0]; return { meshes: Object.keys(out).length, drawn: tot };
