// zonediff.js <old.bin> <new.bin> — decode two .lightfield.bin sidecars (LFP1 hdr + gzip LFC1 record, light_zones.js packRecord),
// map both zone grids to world space, diff the classification of every cell in the overlap.
const fs = require('fs'), zlib = require('zlib');
function load(p) { const b = fs.readFileSync(p); if (b.toString('latin1', 0, 4) !== 'LFP1') throw 'magic'; const hl = b.readUInt32LE(4), H = JSON.parse(b.toString('utf8', 8, 8 + hl));
  const raw = zlib.gunzipSync(b.subarray(8 + hl)), dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength); if (dv.getUint32(0, true) !== 0x3143464C) throw 'lfc';
  const hn = dv.getUint32(4, true), J = JSON.parse(raw.toString('utf8', 8, 8 + hn)); let off = 8 + ((hn + 7) & ~7); const TA = { Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Int32Array, Float32Array, Float64Array }, arr = [];
  J.arrays.forEach(m => { const T = TA[m.t], n = m.n * T.BYTES_PER_ELEMENT; arr.push(new T(raw.buffer.slice(raw.byteOffset + off, raw.byteOffset + off + n))); off += (n + 7) & ~7; });
  const walk = v => v == null ? v : Array.isArray(v) ? v.map(walk) : typeof v === 'object' ? (typeof v.$a === 'number' && Object.keys(v).length === 1 ? arr[v.$a] : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))) : v;
  return { H, R: walk(J.rec) }; }
const SOLID = 65535, MASK = 0x3FFF, cls = v => v === SOLID ? 'S' : ((v & MASK) === 0 ? 'O' : 'I');   // Solid / Open(zone 0) / Indoor(zone>0)
const A = load(process.argv[2]), B = load(process.argv[3]);
for (const [n, X] of [['old', A], ['new', B]]) { const r = X.R.rec || X.R; console.log(n, 'keys', Object.keys(r).slice(0, 25).join(','), 'org', JSON.stringify(r.org), 'grid', r.nx, r.ny, r.nz, 'cell', r.cell, 'zones', r.zones); }
const o = A.R, nw = B.R, cs = o.cell, ground = (o.stats && o.stats.groundY != null) ? o.stats.groundY : null;
const M = {}, byY = {}; let oldIndoorOutside = 0;
const inNew = (x, y, z) => { const i = Math.floor((x - nw.org[0]) / cs), j = Math.floor((y - nw.org[1]) / cs), k = Math.floor((z - nw.org[2]) / cs);
  return (i >= 0 && j >= 0 && k >= 0 && i < nw.nx && j < nw.ny && k < nw.nz) ? i + j * nw.nx + k * nw.nx * nw.ny : -1; };
for (let k = 0; k < o.nz; k++) for (let j = 0; j < o.ny; j++) for (let i = 0; i < o.nx; i++) {
  const c = i + j * o.nx + k * o.nx * o.ny, a = cls(o.zone[c]); const x = o.org[0] + (i + .5) * cs, y = o.org[1] + (j + .5) * cs, z = o.org[2] + (k + .5) * cs;
  const n = inNew(x, y, z); if (n < 0) { if (a === 'I') oldIndoorOutside++; continue; }
  const b = cls(nw.zone[n]), key = a + '>' + b; M[key] = (M[key] || 0) + 1;
  if (a === 'I' && b !== 'I') { const yb = Math.round(y); byY[yb] = (byY[yb] || 0) + 1; } }
console.log('confusion old>new (S solid, O open/zone0, I indoor):', JSON.stringify(M));
console.log('old indoor cells OUTSIDE the new grid:', oldIndoorOutside);
console.log('old-indoor -> new-not-indoor by world y (m):', JSON.stringify(byY), 'groundY', o.stats && o.stats.groundY);
const out = { yBelow: 0, yAbove: 0, xz: 0, byYo: {} }, zOut = {};
for (let k = 0; k < o.nz; k++) for (let j = 0; j < o.ny; j++) for (let i = 0; i < o.nx; i++) {
  const c = i + j * o.nx + k * o.nx * o.ny; if (cls(o.zone[c]) !== 'I') continue;
  const x = o.org[0] + (i + .5) * cs, y = o.org[1] + (j + .5) * cs, z = o.org[2] + (k + .5) * cs; if (inNew(x, y, z) >= 0) continue;
  const yTop = nw.org[1] + nw.ny * cs; if (y < nw.org[1]) out.yBelow++; else if (y >= yTop) out.yAbove++; else out.xz++;
  const yb = Math.round(y); out.byYo[yb] = (out.byYo[yb] || 0) + 1; const zid = o.zone[c] & MASK; zOut[zid] = (zOut[zid] || 0) + 1; }
console.log('outside-new-grid old-indoor cells: belowNewGrid', out.yBelow, 'aboveNewGrid', out.yAbove, 'beside(x/z)', out.xz, 'byY', JSON.stringify(out.byYo));
const top = Object.entries(zOut).sort((a, b) => b[1] - a[1]).slice(0, 5); console.log('their zones (id:cells):', JSON.stringify(top), 'zone sizes old:', top.map(t => o.sizes ? o.sizes[t[0]] : '?').join(','));
console.log('new grid y range', nw.org[1].toFixed(2), (nw.org[1] + nw.ny * cs).toFixed(2), 'old', o.org[1].toFixed(2), (o.org[1] + o.ny * cs).toFixed(2));
