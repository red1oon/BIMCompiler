// ⚠ Z18 probe (read-only, no code change): after a frozen Alt+S press, render each light term separately into a float RT
// (linear, no tone map) and return ROI arrays: sun direct (full - sun off), sky field F (mode 6 R), ground view Gd (mode 10 R),
// IR per zone (mode 9 lum), cove (mode 11 R) + zone id (mode 11 G), grid coord (mode 3 -> world q + cell index), N8AO accumulation.
const A = window.APP, R = A.renderer, SL = window.SourcedLight, T = THREE;
const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true });
const prevRT = R.getRenderTarget(), cc = new T.Color(), ca = R.getClearAlpha(); R.getClearColor(cc); const bg = A.scene.background;
function rd(mode) { SL.debugZones(mode); R.setRenderTarget(rt); R.setClearColor(0x000000, 0); R.clear(true, true, true); R.render(A.scene, A.camera);
  const b = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, b); SL.debugZones(0); return b; }
let U = null; A.scene.traverse(o => { if (U || !o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; const p = m && R.properties.get(m); if (p && p.uniforms && p.uniforms.uSLDim) U = p.uniforms; });
const meta = { W, H, cell: U && U.uSLParams.value[1], P: U && Array.from(U.uSLParams.value), org: U && Array.from(U.uSLOrg.value), dim: U && Array.from(U.uSLDim.value), sky: U && Array.from(U.uSLSky.value),
  cam: A.camera.position.toArray(), sunDir: A.sun.position.clone().sub(A.sun.target.position).normalize().toArray(), sunI: A.sun.intensity,
  shadowMap: A.sun.shadow && A.sun.shadow.mapSize.toArray(), shadowCam: A.sun.shadow && [A.sun.shadow.camera.left, A.sun.shadow.camera.right, A.sun.shadow.camera.top, A.sun.shadow.camera.bottom],
  shadowRadius: A.sun.shadow && A.sun.shadow.radius, shadowType: R.shadowMap.type, torch: !!(A._camTorch && A._camTorch.parent), exposure: R.toneMappingExposure, slActive: SL.isActive(), coveOn: SL.coveOn(), ir: !!SL.irStats() };
meta.sunVisible = A.sun.visible; meta.sunParent = !!A.sun.parent; meta.sunCast = A.sun.castShadow; meta.sunLz = A.sun.userData && A.sun.userData.slZone; const full = rd(0); const sI = A.sun.intensity; A.sun.intensity = 0; const noSun = rd(0); A.sun.intensity = sI;
const m6 = rd(6), m10 = rd(10), m9 = rd(9), m11 = rd(11), m3 = rd(3);
let ao = null, aoErr = null; try { const n8 = A._stillAOPass, art = n8 && n8.accumulationRenderTarget; if (art) { const h16 = new Uint16Array(art.width * art.height * 4); R.readRenderTargetPixels(art, 0, 0, art.width, art.height, h16); ao = new Float32Array(h16.length); for (let j = 0; j < h16.length; j++) ao[j] = T.DataUtils.fromHalfFloat(h16[j]); meta.aoSize = [art.width, art.height]; meta.aoType = art.texture.type; } else aoErr = 'no n8 accumulation target'; } catch (e) { aoErr = e.message; ao = null; }
R.setRenderTarget(prevRT); R.setClearColor(cc, ca); A.scene.background = bg; rt.dispose();
const lum = (b, i) => 0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2];
// ROIs in image pixels (top-left origin): floor band, duct sides
const ROIS = window.__z18Rois || [{ n: 'floor', x0: 480, x1: 1040, y0: 600, y1: 874 }, { n: 'duct', x0: 380, x1: 900, y0: 0, y1: 300 }, { n: 'out', x0: 0, x1: 330, y0: 520, y1: 620 }];
const CH = ['full', 'sun', 'F', 'Gd', 'IR', 'cove', 'zone', 'qx', 'qy', 'qz', 'ao0', 'ao1', 'ao2', 'ao3'];
const out = { meta, aoErr, CH, rois: [] };
for (const r of ROIS) { const w = r.x1 - r.x0, h = Math.min(r.y1, H) - r.y0, a = new Float32Array(w * h * CH.length); let k = 0;
  for (let y = r.y0; y < r.y0 + h; y++) for (let x = r.x0; x < r.x1; x++) { const i = ((H - 1 - y) * W + x) * 4;
    const gx = m3[i] * meta.dim[0] * meta.cell + meta.org[0], gy = m3[i + 1] * meta.dim[1] * meta.cell + meta.org[1], gz = m3[i + 2] * meta.dim[2] * meta.cell + meta.org[2];
    a[k++] = lum(full, i); a[k++] = lum(full, i) - lum(noSun, i); a[k++] = m6[i]; a[k++] = m10[i]; a[k++] = lum(m9, i); a[k++] = m11[i]; a[k++] = m11[i + 1]; a[k++] = gx; a[k++] = gy; a[k++] = gz;
    if (ao) { a[k++] = ao[i]; a[k++] = ao[i + 1]; a[k++] = ao[i + 2]; a[k++] = ao[i + 3]; } else { a[k++] = NaN; a[k++] = NaN; a[k++] = NaN; a[k++] = NaN; } }
  const u8 = new Uint8Array(a.buffer); let s = ''; for (let j = 0; j < u8.length; j += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(j, j + 0x8000));
  out.rois.push({ n: r.n, x0: r.x0, y0: r.y0, w, h, b64: btoa(s) }); }
return out;
