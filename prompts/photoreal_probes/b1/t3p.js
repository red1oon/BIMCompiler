// Z18 part 6: the spec gate map (mode 8 R = _slSpec: 1 = mirror ray reached open/off-grid, else = F) + world q (mode 3) over ROIs
const A = window.APP, R = A.renderer, T = THREE, SL = window.SourcedLight; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd(mode) { SL.debugZones(mode); R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); SL.debugZones(0); const b = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, b); return b; }
let U = null; A.scene.traverse(o => { if (U || !o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; const p = m && R.properties.get(m); if (p && p.uniforms && p.uniforms.uSLDim) U = p.uniforms; });
const org = U.uSLOrg.value, dim = U.uSLDim.value, cell = U.uSLParams.value[1];
const g = rd(8), q = rd(3), f0 = rd(0); R.setRenderTarget(prev); rt.dispose();
const ROIS = [{ n: 'floor', x0: 480, x1: 1040, y0: 600, y1: 874 }, { n: 'duct', x0: 380, x1: 900, y0: 0, y1: 300 }], out = [];
for (const r of ROIS) { const w = r.x1 - r.x0, h = r.y1 - r.y0, a = new Float32Array(w * h * 6); let k = 0;
  for (let y = r.y0; y < r.y1; y++) for (let x = r.x0; x < r.x1; x++) { const i = ((H - 1 - y) * W + x) * 4; a[k++] = g[i]; a[k++] = g[i + 1];
    a[k++] = q[i] * dim[0] * cell + org[0]; a[k++] = q[i + 1] * dim[1] * cell + org[1]; a[k++] = q[i + 2] * dim[2] * cell + org[2]; a[k++] = 0.2126 * f0[i] + 0.7152 * f0[i + 1] + 0.0722 * f0[i + 2]; }
  const u8 = new Uint8Array(a.buffer); let s = ''; for (let j = 0; j < u8.length; j += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(j, j + 0x8000)); out.push({ n: r.n, x0: r.x0, y0: r.y0, w, h, b64: btoa(s) }); }
return { org: Array.from(org), cell, rois: out };
