// snapshot every lit material colour (+ batched/instanced per-instance colour hash) — run BEFORE Alt+S, compare with chroma.js after
const A = window.APP, snap = {}; let inst = 0;
A.scene.traverse(o => { if (!o.material || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.color) snap[m.uuid] = m.color.getHex(); });
  if (o.isInstancedMesh && o.instanceColor) { let h = 0; const a = o.instanceColor.array; for (let i = 0; i < a.length; i += 7) h = (h * 31 + Math.round(a[i] * 1000)) | 0; snap['ic:' + o.uuid] = h; inst++; }
  if (o.isBatchedMesh && o._colorsTexture) { let h = 0; const a = o._colorsTexture.image.data; for (let i = 0; i < a.length; i += 7) h = (h * 31 + Math.round(a[i] * 1000)) | 0; snap['bc:' + o.uuid] = h; inst++; } });
window.__matSnap = snap; return { mats: Object.keys(snap).length, instColourSets: inst };
