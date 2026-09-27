const A = window.APP, R = A.renderer, T = THREE, SL = window.SourcedLight; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const PX = window.__px, rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd(mode, ch) { SL.debugZones(mode || 0); R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); SL.debugZones(0); const o = [], b = new Float32Array(4); for (const [x, y] of PX) { R.readRenderTargetPixels(rt, x, H - 1 - y, 1, 1, b); o.push(ch == null ? +(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]).toFixed(5) : +b[ch].toFixed(4)); } return o; }
const mats = new Set(); A.scene.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && mats.add(m)); });
const withEnv = [...mats].filter(m => m.envMap); const res = { base: rd(), spec_gate_mode8: rd(8, 0), F_mode8: rd(8, 1) };
const ei = withEnv.map(m => m.envMapIntensity); withEnv.forEach(m => m.envMapIntensity = 0); res.envMapIntensity0 = rd(); withEnv.forEach((m, k) => m.envMapIntensity = ei[k]);
res.after = rd(); R.setRenderTarget(prev); rt.dispose();
return { nMats: mats.size, withEnv: withEnv.length, envTypes: [...new Set(withEnv.map(m => m.envMap.mapping + ':' + (m.envMap.isRenderTargetTexture ? 'RT' : m.envMap.constructor.name)))], envI: [...new Set(ei)].slice(0, 5), res };
