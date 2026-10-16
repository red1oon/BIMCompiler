// ⚠ DO NOT REMOVE — SANDBOX marking tool for the Duplex set (SPEC §24/§25). Proposes markings ONLY from evidence found in each DXF
// (title text, A-GRID lines + nearest labels, level lines/labels) and from the source model for storey levels (FROM_SOURCE_MODEL).
// Writes MARKED COPIES to tests/dxf2bim/out/marked/; originals are never modified. Refuses (exit 1) when evidence is ambiguous.
// Read the log after every run. Usage: node tests/dxf2bim/mark_dx_set.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const ROOT = path.join(__dirname, '../..');
const SRC = f => path.join(ROOT, '2D_Layout/output/DXF/DX_' + f + '_20260428_0636.dxf');
const DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db');
const OUT = path.join(__dirname, 'out/marked'); fs.mkdirSync(OUT, { recursive: true });
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8' }) || '[]');
const SET = [
  { f: 'FLOOR_GF', view: 'PLAN', storey: 'Level 1' }, { f: 'FLOOR_FF', view: 'PLAN', storey: 'Level 2' },
  { f: 'FRONT', view: 'ELEV', name: 'FRONT' }, { f: 'REAR', view: 'ELEV', name: 'REAR' }, { f: 'LEFT', view: 'ELEV', name: 'LEFT' }, { f: 'RIGHT', view: 'ELEV', name: 'RIGHT' } ];
const FACE = { FRONT: 'minY', REAR: 'maxY', LEFT: 'minX', RIGHT: 'maxX' };    // repo convention (2D_ARCHITECTURAL_LAYOUT.md l.540); verified later, not trusted
const log = []; let refused = false;
const say = s => { log.push(s); console.log(s); };
const pos = e => { const p = e.startPoint || e.position || {}; return [p.x, p.y]; };

function gridLines(d, vertical) {                                       // evidence: A-GRID LINEs and the nearest 1-char label at an end
  const T = d.entities.filter(e => (e.type === 'TEXT' || e.type === 'MTEXT') && /^[A-Z0-9]$/.test((e.text || '').trim()));
  const res = {};
  d.entities.filter(e => e.layer === 'A-GRID' && e.type === 'LINE').forEach(l => {
    const a = l.vertices[0], b = l.vertices[1];
    const isV = Math.abs(a.x - b.x) <= 1, isH = Math.abs(a.y - b.y) <= 1;
    if (vertical ? !isV : !isH) return;
    const c = vertical ? a.x : a.y, ends = [a, b];
    const cand = T.filter(t => { const [tx, ty] = pos(t); const along = vertical ? tx : ty, perp = vertical ? ty : tx;
      return Math.abs(along - c) <= 60 && ends.some(en => Math.abs(perp - (vertical ? en.y : en.x)) <= 700); }).map(t => ({ label: t.text.trim(), h: t.handle }));
    const labs = [...new Set(cand.map(x => x.label))];
    if (labs.length === 1) { if (res[labs[0]] !== undefined && Math.abs(res[labs[0]].pos - c) > 1) { say('  REFUSE: label ' + labs[0] + ' on two lines'); refused = true; } res[labs[0]] = { pos: Math.round(c), line: l.handle, text: cand.map(x => x.h).join('/') }; }
    else { say('  REFUSE: grid line ' + l.handle + ' at ' + Math.round(c) + ' has ' + labs.length + ' candidate labels [' + labs + ']'); refused = true; }
  });
  return res;
}
function levelPairs(d) {                                                // trusted (z,y): label y equals 1000*z (+-1) or a level line sits at y = 1000*z of a label value
  const labs = d.entities.filter(e => e.type === 'TEXT' && /LEVEL\s+([+-]\d+\.\d+)/.test(e.text || '')).map(e => ({ z: Number(/([+-]\d+\.\d+)\s*$/.exec(e.text.trim())[1]), y: pos(e)[1], h: e.handle }));
  const lines = d.entities.filter(e => e.layer === 'A-ELEV-LEVL' && e.type === 'LINE').map(e => ({ y: e.vertices[0].y, h: e.handle }));
  const out = new Map();
  labs.forEach(l => { if (Math.abs(l.y - 1000 * l.z) <= 1) out.set(l.z, { z: l.z, y: Math.round(l.y), src: 'label ' + l.h }); });
  labs.forEach(l => { if (!out.has(l.z)) { const ln = lines.find(x => Math.abs(x.y - 1000 * l.z) <= 1); if (ln) out.set(l.z, { z: l.z, y: Math.round(ln.y), src: 'line ' + ln.h }); } });
  return [...out.values()].sort((a, b) => a.z - b.z);
}
const planGrids = {};
for (const s of SET) {
  const txt = fs.readFileSync(SRC(s.f), 'utf8'), d = new DxfParser().parseSync(txt);
  say('== ' + s.f + ' (' + s.view + ')');
  const iu = d.header.$INSUNITS; if (iu !== 4) { say('  REFUSE: $INSUNITS=' + iu + ' not mm'); refused = true; }
  const marks = [{ text: '@SET=DX' }, { text: '@VIEW=' + s.view }, { text: '@UNITS=mm' }];
  const title = d.entities.filter(e => e.type === 'TEXT' && /(PLAN|ELEVATION)\s*$/.test((e.text || '').trim())).map(e => e.text.trim());
  say('  title text: ' + JSON.stringify(title)); marks.push({ text: '@NAME=' + (s.name || title[0] || s.f) });
  if (s.view === 'PLAN') {
    const lv = sql("select min(r.minZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + s.storey + "'")[0].z;
    const lv3 = Number(lv.toFixed(3)); marks.push({ text: '@LEVEL=' + lv3 }); say('  LEVEL=' + lv3 + '  [FROM_SOURCE_MODEL: min wall z of ' + s.storey + ']');
    const gx = gridLines(d, true), gy = gridLines(d, false); planGrids[s.f] = { gx, gy };
    Object.entries(gx).forEach(([l, v]) => { marks.push({ text: '@GRIDX=' + l, x: v.pos, y: 0 }); say('  GRIDX ' + l + ' x=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
    Object.entries(gy).forEach(([l, v]) => { marks.push({ text: '@GRIDY=' + l, x: 0, y: v.pos }); say('  GRIDY ' + l + ' y=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
  } else {
    const gh = gridLines(d, true);
    // HAXIS from evidence: which plan axis and sign make the shared labels consistent with the GF plan grids (unique fit required)
    const P = planGrids.FLOOR_GF, fits = [];
    for (const [axis, bag] of [['X', P.gx], ['Y', P.gy]]) for (const sg of [1, -1]) {
      const ls = Object.keys(gh).filter(l => l in bag); if (ls.length < 2) continue;
      const offs = ls.map(l => bag[l].pos - sg * gh[l].pos), spread = Math.max(...offs) - Math.min(...offs);
      if (spread <= 1) fits.push({ axis, sg, spread, labels: ls });
    }
    say('  HAXIS candidates (spread<=1 mm): ' + JSON.stringify(fits.map(f => (f.sg > 0 ? '+' : '-') + f.axis + ' labels ' + f.labels)));
    if (fits.length !== 1) { say('  REFUSE: ' + fits.length + ' axis fits (need exactly 1)'); refused = true; continue; }
    marks.push({ text: '@HAXIS=' + (fits[0].sg > 0 ? '+' : '-') + fits[0].axis }); marks.push({ text: '@FACE=' + FACE[s.name] });
    say('  FACE=' + FACE[s.name] + '  [repo convention for ' + s.name + ', to be verified against source windows]');
    Object.entries(gh).forEach(([l, v]) => { marks.push({ text: '@GRIDH=' + l, x: v.pos, y: 0 }); say('  GRIDH ' + l + ' h=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
    const zs = levelPairs(d); zs.forEach(q => { marks.push({ text: '@Z=' + q.z, x: 0, y: q.y }); say('  Z ' + q.z + ' at y=' + q.y + '  [' + q.src + ']'); });
    if (zs.length < 2) { say('  REFUSE: fewer than 2 trusted level pairs'); refused = true; }
  }
  fs.writeFileSync(path.join(OUT, 'DX_' + s.f + '_marked.dxf'), MK.writeMarks(txt, marks));
}
if (refused) { say('REFUSED: evidence ambiguous, no claim of completeness'); process.exit(1); }
say('marked copies written to ' + OUT);
