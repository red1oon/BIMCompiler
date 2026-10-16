// ⚠ Z18 probe part 2: per-term diffs by switching ONE source off (linear float RT): lamps (uSLLamp.x=0), torch, hemi, IR (uSLIrP.x=0),
// ambient; mode 7 (_slLN list length, _slLNP lamps passing the zone gate). Restores every value it touches.
const A = window.APP, R = A.renderer, SL = window.SourcedLight, T = THREE; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
function rd(mode) { SL.debugZones(mode || 0); R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); const b = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, b); SL.debugZones(0); return b; }
let U = null; A.scene.traverse(o => { if (U || !o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; const p = m && R.properties.get(m); if (p && p.uniforms && p.uniforms.uSLLamp) U = p.uniforms; });
const LAMP = U.uSLLamp.value, IRP = U.uSLIrP.value, meta = { lamp: Array.from(LAMP), irp: Array.from(IRP), cluDim: Array.from(U.uSLCluDim.value) };
const full = rd();
const l0 = LAMP[0]; LAMP[0] = 0; const noLamp = rd(); LAMP[0] = l0;
const tI = A._camTorch.intensity; A._camTorch.intensity = 0; const noTorch = rd(); A._camTorch.intensity = tI;
const hemi = A.scene.children.find(o => o.isHemisphereLight) || (() => { let h; A.scene.traverse(o => { if (!h && o.isHemisphereLight) h = o; }); return h; })(); const hI = hemi.intensity; hemi.intensity = 0; const noHemi = rd(); hemi.intensity = hI;
const i0 = IRP[0]; IRP[0] = 0; const noIR = rd(); IRP[0] = i0;
const env = A.scene.environment; A.scene.environment = null; const noEnv = rd(); A.scene.environment = env;
const m7 = rd(7), again = rd();
R.setRenderTarget(prev); rt.dispose();
let rep = 0; for (let i = 0; i < full.length; i += 4) if (isFinite(full[i]) && Math.abs(full[i] - again[i]) > 1e-6) rep++; meta.repeatDiffPx = rep; meta.envWas = !!env;
const lum = (b, i) => 0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2];
const ROIS = [{ n: 'floor', x0: 480, x1: 1040, y0: 600, y1: 874 }, { n: 'duct', x0: 380, x1: 900, y0: 0, y1: 300 }];
const CH = ['full', 'lamp', 'torch', 'hemi', 'IR', 'env', 'LN', 'LNP'], out = { meta, CH, rois: [] };
for (const r of ROIS) { const w = r.x1 - r.x0, h = Math.min(r.y1, H) - r.y0, a = new Float32Array(w * h * CH.length); let k = 0;
  for (let y = r.y0; y < r.y0 + h; y++) for (let x = r.x0; x < r.x1; x++) { const i = ((H - 1 - y) * W + x) * 4, f = lum(full, i);
    a[k++] = f; a[k++] = f - lum(noLamp, i); a[k++] = f - lum(noTorch, i); a[k++] = f - lum(noHemi, i); a[k++] = f - lum(noIR, i); a[k++] = f - lum(noEnv, i); a[k++] = m7[i]; a[k++] = m7[i + 1]; }
  const u8 = new Uint8Array(a.buffer); let s = ''; for (let j = 0; j < u8.length; j += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(j, j + 0x8000));
  out.rois.push({ n: r.n, x0: r.x0, y0: r.y0, w, h, b64: btoa(s) }); }
return out;
