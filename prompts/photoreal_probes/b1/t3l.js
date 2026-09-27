const A = window.APP, R = A.renderer, T = THREE; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const PX = window.__px, rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd() { R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); const o = [], b = new Float32Array(4); for (const [x, y] of PX) { R.readRenderTargetPixels(rt, x, H - 1 - y, 1, 1, b); o.push(+(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]).toFixed(5)); } return o; }
const US = new Set(); A.scene.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { const p = m && R.properties.get(m); if (p && p.uniforms && p.uniforms.uSLParams) US.add(p.uniforms); }); });
const arrs = k => [...new Set([...US].map(u => u[k] && u[k].value).filter(Boolean))];
const info = { nUniformSets: US.size, distinctIrP: arrs('uSLIrP').length, distinctLamp: arrs('uSLLamp').length, distinctCove: arrs('uSLCoveP').length, distinctSky: arrs('uSLSky').length, irp: arrs('uSLIrP').map(a => Array.from(a)), sky: arrs('uSLSky').map(a => Array.from(a)), P: arrs('uSLParams').map(a => Array.from(a)) };
function tog(k, i, v) { const s = arrs(k).map(a => [a, a[i]]); s.forEach(([a]) => a[i] = v); const r = rd(); s.forEach(([a, o]) => a[i] = o); return r; }
const res = { base: rd(), irOff: tog('uSLIrP', 0, 0), irScale0: tog('uSLIrP', 1, 0), coveOff: tog('uSLCoveP', 3, 0), lampOff: tog('uSLLamp', 0, 0), skyFieldOff: tog('uSLSky', 0, 0), groundViewOff: tog('uSLSky', 1, 0), indoorSkyZ1: tog('uSLParams', 2, 1) };
res.after = rd(); R.setRenderTarget(prev); rt.dispose(); return { info, res };
