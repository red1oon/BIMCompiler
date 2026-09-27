// composite (and app) luminance p5/p25/p50/p75/p95, std, >=250 share, mean saturation + renderer/meter state after a press
const A = window.APP, R = A.renderer, SL = window.SourcedLight, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
function st(useFin) { const L = new Float32Array(w * h); let s = 0, c250 = 0, c15 = 0, sat = 0;
  for (let i = 0, p = 0; i < fin.length; i += 4, p++) { const src = useFin && fin[i + 3] > 0 ? fin : app, r = src[i], g = src[i + 1], b = src[i + 2], l = 0.2126 * r + 0.7152 * g + 0.0722 * b, mx = Math.max(r, g, b); L[p] = l; s += l; if (l >= 250) c250++; if ((r + g + b) / 3 <= 15) c15++; sat += mx ? (mx - Math.min(r, g, b)) / mx : 0; }
  const m = s / L.length; let v = 0; for (let p = 0; p < L.length; p++) v += (L[p] - m) * (L[p] - m); const so = L.slice().sort(), q = f => +so[Math.floor(so.length * f)].toFixed(1);
  return { p5: q(.05), p25: q(.25), p50: q(.5), p75: q(.75), p95: q(.95), mean: +m.toFixed(1), std: +Math.sqrt(v / L.length).toFixed(1), ge250pct: +(100 * c250 / L.length).toFixed(2), le15pct: +(100 * c15 / L.length).toFixed(3), meanSat: +(sat / L.length).toFixed(4) }; }
const cv = SL.coveStats && SL.coveStats(), ir = SL.irStats && SL.irStats();
return { comp: st(true), app: st(false), exposure: +R.toneMappingExposure.toFixed(4), toneMapping: R.toneMapping, coveKey: cv ? String(cv.key).slice(0, 80) : null, irKey: ir ? String(ir.key || '').slice(0, 80) : null,
  sceneChildren: A.scene.children.length, hemiI: A.hemi ? +A.hemi.intensity.toFixed(3) : null, ambI: A.ambient ? +A.ambient.intensity.toFixed(3) : null, sunI: A.sun ? +A.sun.intensity.toFixed(3) : null };
