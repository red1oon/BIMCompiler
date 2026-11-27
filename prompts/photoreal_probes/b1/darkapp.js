// px<=15 split: composite (bounce canvas, alpha>0 else app) vs app-only (under canvas) — the app frame has no GI noise
const D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
let nC = 0, nA = 0; for (let i = 0; i < fin.length; i += 4) { const La = (app[i] + app[i + 1] + app[i + 2]) / 3, Lc = fin[i + 3] > 0 ? (fin[i] + fin[i + 1] + fin[i + 2]) / 3 : La; if (Lc <= 15) nC++; if (La <= 15) nA++; }
return { w, h, compositeDarkPct: +(100 * nC / (w * h)).toFixed(3), appDarkPct: +(100 * nA / (w * h)).toFixed(3) };
