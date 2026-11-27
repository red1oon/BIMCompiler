// Z10/Z12 probe: (1) centre 64x64 patch composite luma p5/p50/p95 + spread; (2) 300 seeded pixels -> surface -> sun-facing & unblocked
// (SUNLIT) vs shaded: mean composite luma per class (a direct-light drop shows on SUNLIT; a façade lift on shaded side-facing)
const A = window.APP, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
const Lp = p => { const i = p * 4, s = fin[i + 3] > 0 ? fin : app; return 0.2126 * s[i] + 0.7152 * s[i + 1] + 0.0722 * s[i + 2]; };
const P = []; const cx = w >> 1, cy = h >> 1; for (let y = cy - 32; y < cy + 32; y++) for (let x = cx - 32; x < cx + 32; x++) P.push(Lp(y * w + x)); P.sort((a, b) => a - b);
const q = f => +P[Math.floor(P.length * f)].toFixed(1);
const tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
const rc = new THREE.Raycaster(), sd = A.sun.position.clone().normalize(); let seed = 21; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const opaque = t => { const m = Array.isArray(t.object.material) ? t.object.material[0] : t.object.material; return m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95); };
const cls = { SUNLIT: [], shadedSide: [], shadedUp: [], miss: 0 };
for (let s = 0; s < 300; s++) { const x = Math.floor(rnd() * w), y = Math.floor(rnd() * h); rc.setFromCamera(new THREE.Vector2((x + .5) / w * 2 - 1, 1 - (y + .5) / h * 2), A.camera); rc.far = Infinity;
  const hh = rc.intersectObjects(tg, false).find(opaque); if (!hh) { cls.miss++; continue; } let n = hh.face ? hh.face.normal.clone().transformDirection(hh.object.matrixWorld) : new THREE.Vector3(0, 1, 0); if (n.dot(rc.ray.direction) > 0) n.negate();
  let lit = false; if (n.dot(sd) > 0) { rc.set(hh.point.clone().addScaledVector(n, .05), sd); rc.far = 600; lit = !rc.intersectObjects(tg, false).some(opaque); }
  const L = Lp(y * w + x); if (lit) cls.SUNLIT.push(L); else if (Math.abs(n.y) < 0.7) cls.shadedSide.push(L); else cls.shadedUp.push(L); }
const st = a => { if (!a.length) return { n: 0 }; const s = a.slice().sort((p, r) => p - r); return { n: a.length, mean: +(a.reduce((p, r) => p + r, 0) / a.length).toFixed(1), p50: +s[s.length >> 1].toFixed(1) }; };
return { patch: { p5: q(.05), p50: q(.5), p95: q(.95), spread: +(q(.95) - q(.05)).toFixed(1) }, SUNLIT: st(cls.SUNLIT), shadedSide: st(cls.shadedSide), shadedUp: st(cls.shadedUp), miss: cls.miss };
