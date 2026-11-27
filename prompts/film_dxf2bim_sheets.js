// ⚠ DO NOT REMOVE — Scope: FILM_PLAN §9 T2 (DXF2BIM film). DXF -> drawable line segments JSON, one sheet per input. It DRAWS, it does not analyse.
// usage: node film_dxf2bim_sheets.js <out.json> <tag>=<file.dxf>[@x0,y0,x1,y1] ...   (optional region keeps only entities fully inside it)
// Read the log: §SHEET tag=… drawn=<by type> skipped=<by type> — every entity is either drawn or counted as skipped.
'use strict';
const fs = require('fs'), path = require('path');
const DxfParser = require(process.env.DXF_PARSER || path.join(process.env.HOME, 'Projects/bim-compiler/deploy/dev/dxf-parser.js'));
const out = process.argv[2], sheets = {};
const arcPts = (cx, cy, r, a0, a1) => {               // radians, counter-clockwise from a0 to a1
  if (a1 < a0) a1 += Math.PI * 2;
  const n = Math.max(6, Math.ceil((a1 - a0) / (Math.PI / 24))), p = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return p;
};
for (const arg of process.argv.slice(3)) {
  const m = arg.match(/^([^=]+)=([^@]+)(?:@(.+))?$/);
  const tag = m[1], file = m[2], region = m[3] ? m[3].split(',').map(Number) : null;
  const ents = new DxfParser().parseSync(fs.readFileSync(file, 'utf8')).entities;
  const polys = [], texts = [], drawn = {}, skipped = {}; let outside = 0;
  const inR = pts => !region || pts.every(([x, y]) => x >= region[0] && x <= region[2] && y >= region[1] && y <= region[3]);
  for (const e of ents) {
    let p = null;
    if (e.type === 'LINE') p = [e.vertices.map(v => [v.x, v.y])];
    else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') { const v = e.vertices.map(q => [q.x, q.y]); if (e.shape || e.closed) v.push(v[0]); p = [v]; }
    else if (e.type === 'ARC') p = [arcPts(e.center.x, e.center.y, e.radius, e.startAngle, e.endAngle)];
    else if (e.type === 'CIRCLE') p = [arcPts(e.center.x, e.center.y, e.radius, 0, Math.PI * 2)];
    if (e.type === 'TEXT' || e.type === 'MTEXT') {
      const at = e.startPoint || e.position, str = String(e.text || '').replace(/\\P/g, ' ').replace(/\\[A-Za-z][^;]*;|[{}]/g, '');
      if (at && str && inR([[at.x, at.y]])) { drawn[e.type] = (drawn[e.type] || 0) + 1; texts.push({ h: e.handle, x: +at.x.toFixed(4), y: +at.y.toFixed(4), s: e.textHeight || e.height || 1, r: e.rotation || 0, t: str }); continue; }
    }
    if (!p) { skipped[e.type] = (skipped[e.type] || 0) + 1; continue; }
    if (!inR(p[0])) { outside++; continue; }
    drawn[e.type] = (drawn[e.type] || 0) + 1;
    for (const v of p) polys.push({ h: e.handle, l: e.layer, p: v.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]) });
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of polys) for (const [x, y] of q.p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  sheets[tag] = { file: path.basename(file), entities: ents.length, bbox: [x0, y0, x1, y1], polys, texts };
  console.log(`§SHEET tag=${tag} entities=${ents.length} drawn=${JSON.stringify(drawn)} skipped=${JSON.stringify(skipped)} outside_region=${outside} polylines=${polys.length} texts=${texts.length}`);
}
fs.writeFileSync(out, JSON.stringify(sheets));
console.log('§SHEET wrote ' + out);
