// Z18 part 3: what is the residual? Sample pixels on both sides of the floor sawtooth and the duct; toggle: all lights off, each light
// off, shadowMap off for sun, the floor mesh identity/material under each pixel (raycast).
const A = window.APP, R = A.renderer, T = THREE; const sz = R.getDrawingBufferSize(new T.Vector2()), W = sz.x, H = sz.y;
const rt = new T.WebGLRenderTarget(W, H, { type: T.FloatType, depthBuffer: true }); const prev = R.getRenderTarget();
const PX = [[792, 780], [800, 780], [800, 820], [804, 820], [792, 860], [796, 860]];
function rd() { R.setRenderTarget(rt); R.clear(true, true, true); R.render(A.scene, A.camera); const o = []; const b = new Float32Array(4);
  for (const [x, y] of PX) { R.readRenderTargetPixels(rt, x, H - 1 - y, 1, 1, b); o.push(+(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]).toFixed(5)); } return o; }
const L = []; A.scene.traverse(o => { if (o.isLight) L.push(o); });
const res = { base: rd() };
for (const l of L) { const i = l.intensity; l.intensity = 0; res['off:' + (l.name || l.type)] = rd(); l.intensity = i; }
const I = L.map(l => l.intensity); L.forEach(l => l.intensity = 0); res.allLightsOff = rd(); L.forEach((l, k) => l.intensity = I[k]);
// cascade shadow maps: if the cascades are I=0 their shadow maps can still be sampled by a custom sun path; toggle castShadow on cascades
const casc = L.filter(l => /Cascade/.test(l.name)); const cs = casc.map(l => l.visible); casc.forEach(l => l.visible = false); res.cascadesHidden = rd(); casc.forEach((l, k) => l.visible = cs[k]);
const sv = A.sun.castShadow; A.sun.castShadow = false; res.sunNoShadow = rd(); A.sun.castShadow = sv;
const rc = new T.Raycaster(); const hits = PX.map(([x, y]) => { rc.setFromCamera(new T.Vector2((x + .5) / W * 2 - 1, 1 - (y + .5) / H * 2), A.camera); const h = rc.intersectObjects(A.scene.children, true).find(h => h.object.visible && h.object.isMesh);
  if (!h) return null; const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return { obj: h.object.name || h.object.type, uuid: h.object.uuid.slice(0, 8), inst: h.instanceId, batch: h.batchId, mat: m && m.type, color: m && m.color && m.color.getHexString(), emissive: m && m.emissive && m.emissive.getHexString(), emI: m && m.emissiveIntensity, map: !!(m && m.map), aoMap: !!(m && m.aoMap), lightMap: !!(m && m.lightMap), pt: h.point.toArray().map(v => +v.toFixed(3)), dist: +h.distance.toFixed(2) }; });
R.setRenderTarget(prev); rt.dispose();
return { PX, res, hits, lights: L.map(l => [l.name || l.type, l.intensity, l.castShadow, l.visible]) };
