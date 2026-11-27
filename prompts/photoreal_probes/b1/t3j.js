const A = window.APP, R = A.renderer, T = THREE; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const PX = window.__px, rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd() { R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); const o = [], b = new Float32Array(4); for (const [x, y] of PX) { R.readRenderTargetPixels(rt, x, H - 1 - y, 1, 1, b); o.push(+(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]).toFixed(5)); } return o; }
let U = null; A.scene.traverse(o => { if (U || !o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; const p = m && R.properties.get(m); if (p && p.uniforms && p.uniforms.uSLParams) U = p.uniforms; });
const L = []; A.scene.traverse(o => { if (o.isLight) L.push(o); });
const desc = L.map(l => [l.name || l.type, !!Object.getOwnPropertyDescriptor(l, 'intensity'), (Object.getOwnPropertyDescriptor(l, 'intensity') || {}).set ? 'setter' : 'value']);
const res = { base: rd() };
const sc = A.sun.color.clone(); A.sun.color.setRGB(0, 0, 0); res.sunColorBlack = rd(); A.sun.color.copy(sc);
const cols = L.map(l => l.color.clone()); L.forEach(l => l.color.setRGB(0, 0, 0)); const hg = L.filter(l => l.groundColor).map(l => [l, l.groundColor.clone()]); hg.forEach(([l]) => l.groundColor.setRGB(0, 0, 0)); res.allLightColorsBlack = rd();
const P = U.uSLParams.value, p0 = P[0]; P[0] = 0; res.allBlackAndSLoff = rd(); P[0] = p0;
L.forEach((l, k) => l.color.copy(cols[k])); hg.forEach(([l, c]) => l.groundColor.copy(c));
P[0] = 0; res.SLoff = rd(); P[0] = p0;
res.after = rd();
R.setRenderTarget(prev); rt.dispose(); return { desc, res };
