// read the tEXt "bim-still-pose" chunk of a still PNG
const fs = require('fs'); for (const f of process.argv.slice(2)) { const b = fs.readFileSync(f); let p = 8, out = null;
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8); if (type === 'tEXt') { const d = b.toString('latin1', p + 8, p + 8 + len), i = d.indexOf('\0'); if (d.slice(0, i) === 'bim-still-pose') out = d.slice(i + 1); } p += 12 + len; if (type === 'IEND') break; }
  console.log(f.split('/').pop(), out); }
