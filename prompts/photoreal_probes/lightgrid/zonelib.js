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
module.exports = { load, cls, SOLID, MASK };
