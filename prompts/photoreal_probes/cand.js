const Z = window.LightZones.get(), nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, zone = Z.zone, SOLID = 0xFFFF;
let cand = 0, thinCap = 0, t0 = performance.now(); const samp = [];
for (let c = 0; c < zone.length; c++) { const v = zone[c]; if (v === SOLID || v === 0) continue; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0;
  if (!((i > 0 && zone[c - 1] === 0) || (i < nx - 1 && zone[c + 1] === 0) || (k > 0 && zone[c - nxy] === 0) || (k < nz - 1 && zone[c + nxy] === 0))) continue;   // lateral open neighbour
  cand++; let jj = j + 1, run = 0; while (jj < ny && zone[i + jj * nx + k * nxy] === SOLID) { run++; jj++; } if (jj >= ny || zone[i + jj * nx + k * nxy] === 0) { thinCap++; if (samp.length < 4000 && (cand % 7 === 0)) samp.push(c); } }
// time 200 mesh up-rays
const tg = []; window.APP.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== window.APP._sky && !(o.material && o.material.isMeshBasicMaterial)) tg.push(o); });
const rc = new THREE.Raycaster(); rc.far = 400; let esc = 0; const t1 = performance.now(); const S = samp.slice(0, 200);
for (const c of S) { const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0; rc.set(new THREE.Vector3(Z.org.x + (i + .5) * Z.cell, Z.org.y + (j + .5) * Z.cell, Z.org.z + (k + .5) * Z.cell), new THREE.Vector3(0, 1, 0)); if (!rc.intersectObjects(tg, false).length) esc++; }
return { coveredWithOpenSide: cand, capThenOpen: thinCap, gridMs: Math.round(t1 - t0), rays: S.length, escUp: esc, msPerRay: +((performance.now() - t1) / S.length).toFixed(2), objs: tg.length };
