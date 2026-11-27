// Z18 part 5: the light-independent additive term — list every object under the step pixels (incl. transparent/additive), and
// re-render with (a) transparent meshes hidden, (b) non-standard materials hidden, (c) emissive zeroed.
const A = window.APP, R = A.renderer, T = THREE; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const PX = window.__px, rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd() { R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); const o = [], b = new Float32Array(4); for (const [x, y] of PX) { R.readRenderTargetPixels(rt, x, H - 1 - y, 1, 1, b); o.push(+(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]).toFixed(5)); } return o; }
const all = []; A.scene.traverse(o => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) all.push(o); });
const mat = o => Array.isArray(o.material) ? o.material[0] : o.material;
const res = { base: rd() };
const tr = all.filter(o => o.visible && mat(o) && (mat(o).transparent || mat(o).blending !== 1)); tr.forEach(o => o.visible = false); res.noTransparent = rd(); tr.forEach(o => o.visible = true);
const ns = all.filter(o => o.visible && mat(o) && !(mat(o).isMeshStandardMaterial || mat(o).isMeshPhysicalMaterial)); ns.forEach(o => o.visible = false); res.noNonStandard = rd(); ns.forEach(o => o.visible = true);
const em = []; all.forEach(o => { const m = mat(o); if (m && m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0) { em.push([m, m.emissive.clone()]); m.emissive.setRGB(0, 0, 0); } }); res.noEmissive = rd(); em.forEach(([m, c]) => m.emissive.copy(c));
const rc = new T.Raycaster(); const hits = PX.map(([x, y]) => { rc.setFromCamera(new T.Vector2((x + .5) / W * 2 - 1, 1 - (y + .5) / H * 2), A.camera); return rc.intersectObjects(all.filter(o => o.visible), false).slice(0, 5).map(h => { const m = mat(h.object); return [h.object.name || h.object.type, m && m.type, m && m.transparent, m && +(m.opacity || 1).toFixed(2), m && m.blending, +h.distance.toFixed(3)]; }); });
R.setRenderTarget(prev); rt.dispose();
return { res, nTransparent: tr.length, trNames: [...new Set(tr.map(o => (o.name || o.type) + ':' + (mat(o).type)))].slice(0, 20), nNonStd: ns.length, nsNames: [...new Set(ns.map(o => (o.name || o.type) + ':' + mat(o).type))].slice(0, 20), nEm: em.length, hits };
