// CHROMA / pale check at the staged pose (after one Alt+S; still staged). (1) material colours after staging vs __matSnap (taken before
// Alt+S); (2) composite + app frame luminance percentiles / std / mean HSV saturation; (3) ~200 seeded surface samples: material colour
// (hex, S) vs app pixel and composite pixel (S, H), plus S predicted if the authored sRGB value is used as LINEAR and sRGB-encoded
// (§ALBEDO_SRGB fact); (4) darkest-quartile composite pixels: mean F (mode 6), IR radiance (mode 9), cove term (mode 11), GI lift.
const A = window.APP, R = A.renderer, SL = window.SourcedLight, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let H = 0; if (d > 1e-6) { if (mx === r) H = ((g - b) / d) % 6; else if (mx === g) H = (b - r) / d + 2; else H = (r - g) / d + 4; H *= 60; if (H < 0) H += 360; } return { S: mx > 0 ? d / mx : 0, H, V: mx }; };
const enc = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
function stats(px, alphaFrom) { const L = [], Sa = []; for (let i = 0; i < px.length; i += 4) { let r = px[i], g = px[i + 1], b = px[i + 2]; if (alphaFrom && alphaFrom[i + 3] === 0) { r = app[i]; g = app[i + 1]; b = app[i + 2]; } L.push(0.2126 * r + 0.7152 * g + 0.0722 * b); Sa.push(hsv(r, g, b).S); }
  const s = L.slice().sort((a, b) => a - b), q = f => +s[Math.min(s.length - 1, Math.floor(s.length * f))].toFixed(1), m = L.reduce((a, b) => a + b, 0) / L.length, sd = Math.sqrt(L.reduce((a, b) => a + (b - m) * (b - m), 0) / L.length);
  return { p5: q(0.05), p25: q(0.25), p50: q(0.5), p75: q(0.75), p95: q(0.95), mean: +m.toFixed(1), std: +sd.toFixed(1), meanSat: +(Sa.reduce((a, b) => a + b, 0) / Sa.length).toFixed(4), Larr: L }; }
const comp = stats(fin, fin), ap = stats(app, null), p25 = comp.p25;
// (1) material colour diffs
let changed = 0, compared = 0; const chEx = []; const snap = window.__matSnap || {};
A.scene.traverse(o => { if (!o.material || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!m || !m.color || !(m.uuid in snap)) return; compared++; if (snap[m.uuid] !== m.color.getHex()) { changed++; if (chEx.length < 5) chEx.push([m.name || m.type, snap[m.uuid].toString(16), m.color.getHexString()]); } }); });
// (4) readbacks
function rb(mode) { const THREE = window.THREE, rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, depthBuffer: true }), buf = new Float32Array(w * h * 4), prev = R.getRenderTarget(), bg = A.scene.background, cc = new THREE.Color(), ca = R.getClearAlpha(); R.getClearColor(cc);
  try { SL.debugZones(mode); A.scene.background = null; R.setClearColor(0x000000, 0); R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); R.readRenderTargetPixels(rt, 0, 0, w, h, buf); }
  finally { SL.debugZones(0); R.setRenderTarget(prev); A.scene.background = bg; R.setClearColor(cc, ca); rt.dispose(); } return buf; }
const Fb = rb(6), Ib = rb(9), Cb = rb(11);
const at = (buf, x, y, ch) => buf[((h - 1 - y) * w + x) * 4 + ch];
let nq = 0, sF = 0, sFpos = 0, sI = 0, sC = 0, sGI = 0, nAll = 0, sFall = 0;
for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const i = (y * w + x) * 4, known = at(Fb, x, y, 1) > 0.5 || at(Fb, x, y, 3) > 0; if (at(Fb, x, y, 3) === 0) continue; const F = at(Fb, x, y, 0); nAll++; sFall += F;
  if (comp.Larr[y * w + x] <= p25) { nq++; sF += F; if (F > 0) sFpos++; const ir = at(Ib, x, y, 3) > 0 ? 0.2126 * at(Ib, x, y, 0) + 0.7152 * at(Ib, x, y, 1) + 0.0722 * at(Ib, x, y, 2) : 0; sI += ir; sC += at(Cb, x, y, 2) > 0.7 ? at(Cb, x, y, 0) : 0;
    const La = 0.2126 * app[i] + 0.7152 * app[i + 1] + 0.0722 * app[i + 2]; sGI += comp.Larr[y * w + x] - La; } }
// (3) samples via raycast
const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
const rc = new window.THREE.Raycaster(); let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const rows = [], tc = new window.THREE.Color();
for (let s = 0; s < 400 && rows.length < 200; s++) { const x = Math.floor(rnd() * w), y = Math.floor(rnd() * h); rc.setFromCamera(new window.THREE.Vector2((x + .5) / w * 2 - 1, 1 - (y + .5) / h * 2), A.camera);
  const hh = rc.intersectObjects(tg, false).find(q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95); }); if (!hh) continue;
  const o = hh.object, m = Array.isArray(o.material) ? o.material[0] : o.material; let c = m.color.clone(), src = 'mat';
  if (o.isBatchedMesh && hh.batchId != null && o._colorsTexture && o.getColorAt) { o.getColorAt(hh.batchId, tc); c.multiply(tc); src = 'mat*batch'; } else if (o.isInstancedMesh && o.instanceColor && hh.instanceId != null) { o.getColorAt(hh.instanceId, tc); c.multiply(tc); src = 'mat*inst'; }
  const vc = !!(o.geometry.attributes.color && m.vertexColors), mh = hsv(c.r, c.g, c.b), pe = hsv(enc(c.r), enc(c.g), enc(c.b)), i = (y * w + x) * 4;
  const cr = fin[i + 3] > 0 ? [fin[i], fin[i + 1], fin[i + 2]] : [app[i], app[i + 1], app[i + 2]], ch = hsv(cr[0] / 255, cr[1] / 255, cr[2] / 255), ah = hsv(app[i] / 255, app[i + 1] / 255, app[i + 2] / 255);
  rows.push({ cls: o.userData.ifcClass || (o.isBatchedMesh ? 'batched' : o.type), hex: c.getHexString(), src, vc, mS: +mh.S.toFixed(3), mH: Math.round(mh.H), predS: +pe.S.toFixed(3), appS: +ah.S.toFixed(3), appH: Math.round(ah.H), compS: +ch.S.toFixed(3), compH: Math.round(ch.H), compV: +ch.V.toFixed(2), tex: !!m.map }); }
const mean = (a, k) => a.length ? +(a.reduce((p, r) => p + r[k], 0) / a.length).toFixed(4) : null, col = rows.filter(r => r.mS > 0.15);
const hueD = col.map(r => { const d = Math.abs(r.compH - r.mH) % 360; return Math.min(d, 360 - d); }).sort((a, b) => a - b);
const hexHist = {}; rows.forEach(r => { hexHist[r.hex] = (hexHist[r.hex] || 0) + 1; });
delete comp.Larr; delete ap.Larr;
return { staged: SL.isActive(), toneMapping: R.toneMapping, exposure: +R.toneMappingExposure.toFixed(3), outputColorSpace: R.outputColorSpace, colorMgmt: window.THREE.ColorManagement.enabled,
  materials: { compared, changedByStaging: changed, examples: chEx }, composite: comp, app: ap,
  darkestQuartile: { n: nq, meanF: nq ? +(sF / nq).toFixed(4) : null, shareFpos: nq ? +(sFpos / nq).toFixed(3) : null, meanIRlin: nq ? +(sI / nq).toFixed(4) : null, meanCove: nq ? +(sC / nq).toFixed(4) : null, meanGIliftL: nq ? +(sGI / nq).toFixed(2) : null, meanFallSurfaces: nAll ? +(sFall / nAll).toFixed(4) : null },
  samples: { n: rows.length, meanMatS: mean(rows, 'mS'), meanPredS_asLinearEncoded: mean(rows, 'predS'), meanAppS: mean(rows, 'appS'), meanCompS: mean(rows, 'compS'), coloured_mS_gt_0_15: { n: col.length, meanMatS: mean(col, 'mS'), meanPredS: mean(col, 'predS'), meanAppS: mean(col, 'appS'), meanCompS: mean(col, 'compS'), hueDiffMedian: hueD.length ? hueD[hueD.length >> 1] : null },
    topColours: Object.entries(hexHist).sort((a, b) => b[1] - a[1]).slice(0, 12), texturedShare: +(rows.filter(r => r.tex).length / Math.max(1, rows.length)).toFixed(3), vertexColourShare: +(rows.filter(r => r.vc).length / Math.max(1, rows.length)).toFixed(3), first: rows.slice(0, 15) } };
