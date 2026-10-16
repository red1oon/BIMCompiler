// ⚠ DO NOT REMOVE — SANDBOX marking tool for the Duplex set (SPEC §24/§25). Proposes markings ONLY from evidence found in each DXF
// (title text, A-GRID lines + nearest labels, level lines/labels) and from the source model for storey levels (FROM_SOURCE_MODEL).
// Writes MARKED COPIES to tests/dxf2bim/out/marked/; originals are never modified. Refuses (exit 1) when evidence is ambiguous.
// Read the log after every run. Usage: node tests/dxf2bim/mark_dx_set.js [std [door_ops.db]]
// Profile `std` (lane spec L2.3): the L1 standard set 2D_Layout/output/STD/DX_*_std.dxf -> out/marked_std/ (level lines/texts on A-ANNO-LEVL, `+z.zzz` texts;
// elevations also get @ROOF = T/ROOF from the model: max Z of IfcRoof, else of the highest IfcSlab, L1.1 R11). Same evidence rules otherwise.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js')), SHC = require(path.join(__dirname, '../../deploy/dev/dxf2shell_config.js')), STDC = require('./set_configs.js').STD;
const hh = s => require('crypto').createHash('sha256').update(s).digest('hex');
const ROOT = path.join(__dirname, '../..');
const STD = process.argv[2] === 'std';
const DOOR_OPS = STD && process.argv[3] ? path.resolve(process.argv[3]) : null;   // L2.6 C: DB with door_operation (scripts/extractIFC2DB.js)
// L2.5 W2: std grid axes sit on half mm (208.5); Math.round maps +208.5 -> 209 but -208.5 -> -208, a 1 mm error on mirrored elevations. The std profile
// writes positions at 0.001 mm; the old profile keeps whole mm (its positions are integers, copies stay byte-identical).
const RND = v => STD ? Number(v.toFixed(3)) : Math.round(v);
const ELEV_TOL = 0.003, EXT_FACE_TOL = 0.010;   // L2.5 W1: CFG.elev_tol (the pipeline's height tolerance); L1.1 R4(b) exterior face tolerance
const SRC = f => STD ? path.join(ROOT, '2D_Layout/output/STD/DX_' + f + '_std.dxf') : path.join(ROOT, '2D_Layout/output/DXF/DX_' + f + '_20260428_0636.dxf');
const DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db');
const OUT = path.join(__dirname, STD ? 'out/marked_std' : 'out/marked'); fs.mkdirSync(OUT, { recursive: true });
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8' }) || '[]');
const SET = [
  { f: 'FLOOR_GF', view: 'PLAN', storey: 'Level 1' }, { f: 'FLOOR_FF', view: 'PLAN', storey: 'Level 2' },
  { f: 'FRONT', view: 'ELEV', name: 'FRONT' }, { f: 'REAR', view: 'ELEV', name: 'REAR' }, { f: 'LEFT', view: 'ELEV', name: 'LEFT' }, { f: 'RIGHT', view: 'ELEV', name: 'RIGHT' } ]
  .concat(process.argv[2] === 'std' ? [{ f: 'ROOF', view: 'ROOF', storey: 'Roof' }, { f: 'SECTION', view: 'SECTION' }] : []);   // L2.6 E: the std set's 8 sheets (L1 #183)
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
    if (labs.length === 1) { if (res[labs[0]] !== undefined && Math.abs(res[labs[0]].pos - c) > 1) { say('  REFUSE: label ' + labs[0] + ' on two lines'); refused = true; } res[labs[0]] = { pos: RND(c), line: l.handle, text: cand.map(x => x.h).join('/') }; }
    else { say('  REFUSE: grid line ' + l.handle + ' at ' + Math.round(c) + ' has ' + labs.length + ' candidate labels [' + labs + ']'); refused = true; }
  });
  return res;
}
function levelPairs(d) {                                                // trusted (z,y): label y equals 1000*z (+-1) or a level line sits at y = 1000*z of a label value
  const LBL = STD ? (e => e.layer === 'A-ANNO-LEVL' && /\s[+-]\d+\.\d+\s*$/.test(e.text || '')) : (e => /LEVEL\s+([+-]\d+\.\d+)/.test(e.text || ''));
  const labs = d.entities.filter(e => e.type === 'TEXT' && LBL(e)).map(e => ({ z: Number(/([+-]\d+\.\d+)\s*$/.exec(e.text.trim())[1]), y: pos(e)[1], h: e.handle }));
  const lines = d.entities.filter(e => e.layer === (STD ? 'A-ANNO-LEVL' : 'A-ELEV-LEVL') && e.type === 'LINE' && Math.abs(e.vertices[0].y - e.vertices[1].y) <= 1e-9).map(e => ({ y: e.vertices[0].y, h: e.handle }));
  const out = new Map();
  labs.forEach(l => { if (Math.abs(l.y - 1000 * l.z) <= 1) out.set(l.z, { z: l.z, y: RND(l.y), src: 'label ' + l.h }); });
  labs.forEach(l => { if (!out.has(l.z)) { const ln = lines.find(x => Math.abs(x.y - 1000 * l.z) <= 1); if (ln) out.set(l.z, { z: l.z, y: RND(ln.y), src: 'line ' + ln.h }); } });
  return [...out.values()].sort((a, b) => a.z - b.z);
}
function roofTop() {                                                    // R11 T/ROOF: max Z of IfcRoof, else of the highest IfcSlab
  const rr = sql("select max(r.maxZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcRoof'")[0].z, rs = sql("select max(r.maxZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcSlab'")[0].z;
  const top = typeof rr === 'number' ? rr : rs; return typeof top === 'number' ? { z: Number(top.toFixed(3)), src: 'max Z of ' + (typeof rr === 'number' ? 'IfcRoof' : 'the highest IfcSlab') } : null;
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
    if (STD) {                                                         // L2.5 W1 + L2.6 A: wall tops FROM_SOURCE_MODEL, per wall where the storey rule does not hold
      const W = sql("select m.id, round(r.minX,6) a, round(r.minY,6) b, round(r.maxX,6) c, round(r.maxY,6) d, round(r.minZ,6) z0, round(r.maxZ,6) top from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + s.storey + "' order by m.id");
      const SL = sql("select m.id, round(r.minX,6) a, round(r.minY,6) b, round(r.maxX,6) c, round(r.maxY,6) d, round(r.minZ,6) z0 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcSlab' order by m.id");
      const E = [Math.min(...W.map(w => w.a)), Math.min(...W.map(w => w.b)), Math.max(...W.map(w => w.c)), Math.max(...W.map(w => w.d))];
      const ext = w => Math.abs(w.a - E[0]) <= EXT_FACE_TOL || Math.abs(w.b - E[1]) <= EXT_FACE_TOL || Math.abs(w.c - E[2]) <= EXT_FACE_TOL || Math.abs(w.d - E[3]) <= EXT_FACE_TOL;
      // the plan's own wall pieces (same reader call as the pipeline): a piece belongs to a model wall when its rect lies in the wall's plan bbox (2 mm)
      const pieces = B.run(txt, STDC.MAP_PLAN, SHC.CFG, { DxfParser, hashHex: hh, library: [] }).ops.filter(o => o.op_type === 'DXF_WALL' && o.params.rect);
      const inW = (r, w) => r[0] >= w.a - 0.002 && r[1] >= w.b - 0.002 && r[2] <= w.c + 0.002 && r[3] <= w.d + 0.002;
      const res = {};
      W.filter(w => !ext(w)).forEach(w => {
        const above = SL.filter(q => q.z0 > lv3 + ELEV_TOL && Math.min(q.c, w.c) - Math.max(q.a, w.a) > 1e-9 && Math.min(q.d, w.d) - Math.max(q.b, w.b) > 1e-9);
        const u = above.length ? Math.min(...above.map(q => q.z0)) : null, c = u !== null && Math.abs(w.top - u) <= ELEV_TOL;
        const hs = [...new Set(pieces.filter(o => inW(o.params.rect, w)).map(o => o.params.handle))];
        res[w.id] = { w, c, hs };
        say('  WALLTOP wall ' + w.id + ' z=' + w.z0 + '..' + w.top + ' slab-above underside=' + u + (u !== null ? ' (slabs ' + above.filter(q => q.z0 === u).map(q => q.id).join(',') + ')' : '') + ' -> ' + (c ? 'confirmed' : 'NOT confirmed') + ' ; plan pieces ' + (hs.join(',') || 'none (not cut by this plan)'));
      });
      const onPlan = Object.values(res).filter(x => x.hs.length);
      if (onPlan.some(x => x.c)) { marks.push({ text: '@WALLTOP=' + lv3 + ',slab_above' }); say('  WALLTOP=' + lv3 + ',slab_above  [FROM_SOURCE_MODEL: ' + onPlan.filter(x => x.c).length + ' interior walls on this plan reach the slab underside]'); }
      const perH = {};
      onPlan.filter(x => !x.c).forEach(x => {
        if (Math.abs(x.w.z0 - lv3) > ELEV_TOL) { say('  WALLTOP wall ' + x.w.id + ': base ' + x.w.z0 + ' is not the storey level, no marking (gap stays)'); return; }
        x.hs.forEach(h => { const t = Number(x.w.top.toFixed(3)); if (perH[h] !== undefined && perH[h] !== t) perH[h] = null; else if (perH[h] !== null) perH[h] = t; });
      });
      Object.keys(perH).sort((a, b) => parseInt(a, 16) - parseInt(b, 16)).forEach(h => {
        if (perH[h] === null) { say('  WALLTOP piece ' + h + ': matches walls with different tops, no marking (gap stays)'); return; }
        // the piece may also lie in a confirmed wall with another top: then it is ambiguous too
        const other = onPlan.filter(x => x.c && x.hs.indexOf(h) >= 0 && Math.abs(x.w.top - perH[h]) > ELEV_TOL);
        if (other.length) { say('  WALLTOP piece ' + h + ': also in confirmed wall ' + other.map(x => x.w.id).join(',') + ' with another top, no marking (gap stays)'); return; }
        marks.push({ text: '@WALLTOP=handle:' + h + ',' + perH[h] }); say('  WALLTOP=handle:' + h + ',' + perH[h] + '  [FROM_SOURCE_MODEL: wall top, exception to slab_above]');
      });
      if (!onPlan.length) say('  WALLTOP not written for ' + s.storey + ' (no interior wall on this plan)');
      // L2.6 C: door schedule + tags FROM_SOURCE_MODEL (IFC OverallWidth/OverallHeight via door_operation), only with the door-ops DB
      if (!DOOR_OPS) say('  SCHEDULE/TAG not written: no door-ops DB given (node mark_dx_set.js std <door_ops.db>)');
      else {
        const dsql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DOOR_OPS, q], { encoding: 'utf8' }) || '[]');
        const ops = {}; dsql('select guid, overall_width w, overall_height h from door_operation').forEach(r => { ops[r.guid] = r; });
        const all = sql("select m.guid, m.storey, m.element_type t, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcDoor' order by m.guid");
        const here = all.filter(x => x.storey === s.storey), types = [...new Set(here.map(x => x.t))].sort();
        types.forEach(t => {
          const sz = [...new Set(all.filter(x => x.t === t).map(x => ops[x.guid] ? (ops[x.guid].w * 1000).toFixed(1) + 'x' + (ops[x.guid].h * 1000).toFixed(1) : 'none'))];
          if (sz.length !== 1 || sz[0] === 'none' || /,/.test(t)) { say('  SCHEDULE ' + t + ': REFUSED, sizes ' + JSON.stringify(sz)); return; }
          const [w, h] = sz[0].split('x').map(Number);
          marks.push({ text: '@SCHEDULE=' + t + ',door,' + w + ',' + h }); say('  SCHEDULE=' + t + ',door,' + w + ',' + h + '  [FROM_SOURCE_MODEL: IFC OverallWidth/OverallHeight, door_operation]');
        });
        here.forEach(x => { const p = [Number(((x.a + x.c) / 2 * 1000).toFixed(3)), Number(((x.b + x.d) / 2 * 1000).toFixed(3))];
          if (types.indexOf(x.t) < 0) return; marks.push({ text: '@TAG=door,' + x.t, x: p[0], y: p[1] }); say('  TAG door ' + x.t + ' at ' + p.join(',') + '  [FROM_SOURCE_MODEL: door ' + x.guid + ' plan bbox centre]'); });
      }
    }
    Object.entries(gx).forEach(([l, v]) => { marks.push({ text: '@GRIDX=' + l, x: v.pos, y: 0 }); say('  GRIDX ' + l + ' x=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
    Object.entries(gy).forEach(([l, v]) => { marks.push({ text: '@GRIDY=' + l, x: 0, y: v.pos }); say('  GRIDY ' + l + ' y=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
  } else if (s.view === 'ROOF') {                                     // L2.6 E: roof storey level (R1) and roof top (R11) FROM_SOURCE_MODEL
    const rl = sql("select min(r.minZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + s.storey + "'")[0].z;
    if (typeof rl !== 'number') { say('  REFUSE: no wall in storey ' + s.storey + ' (no @LEVEL)'); refused = true; }
    else { const l3 = Number(rl.toFixed(3)); marks.push({ text: '@LEVEL=' + l3 }); say('  LEVEL=' + l3 + '  [FROM_SOURCE_MODEL: min wall z of ' + s.storey + ']'); }
    const top = roofTop(); if (top === null) { say('  REFUSE: no IfcRoof / IfcSlab for @ROOF'); refused = true; } else { marks.push({ text: '@ROOF=' + top.z }); say('  ROOF=' + top.z + '  [FROM_SOURCE_MODEL: ' + top.src + ', R11 T/ROOF]'); }
  } else {
    if (s.view === 'SECTION') {                                         // L2.6 E: @CUT from the sheet title "... AT X|Y=<coord>" (sheet units)
      const tt = d.entities.filter(e => e.type === 'TEXT' && /\bAT ([XY])=(-?\d+(?:\.\d+)?)\b/.test(e.text || ''));
      if (tt.length !== 1) { say('  REFUSE: section titles with AT X|Y= found=' + tt.length); refused = true; }
      else { const tm = /AT ([XY])=(-?\d+(?:\.\d+)?)/.exec(tt[0].text); marks.push({ text: '@CUT=' + tm[1] + ',' + tm[2] }); say('  CUT=' + tm[1] + ',' + tm[2] + '  [title text ' + tt[0].handle + ' "' + tt[0].text.trim() + '"]'); }
    }
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
    marks.push({ text: '@HAXIS=' + (fits[0].sg > 0 ? '+' : '-') + fits[0].axis });
    if (s.view === 'ELEV') { marks.push({ text: '@FACE=' + FACE[s.name] }); say('  FACE=' + FACE[s.name] + '  [repo convention for ' + s.name + ', to be verified against source windows]'); }
    Object.entries(gh).forEach(([l, v]) => { marks.push({ text: '@GRIDH=' + l, x: v.pos, y: 0 }); say('  GRIDH ' + l + ' h=' + v.pos + '  [grid line ' + v.line + ' label text ' + v.text + ']'); });
    const zs = levelPairs(d); zs.forEach(q => { marks.push({ text: '@Z=' + q.z, x: 0, y: q.y }); say('  Z ' + q.z + ' at y=' + q.y + '  [' + q.src + ']'); });
    if (zs.length < 2) { say('  REFUSE: fewer than 2 trusted level pairs'); refused = true; }
    if (STD) {
      const top = roofTop(); if (top === null) { say('  REFUSE: no IfcRoof / IfcSlab for @ROOF'); refused = true; }
      else { marks.push({ text: '@ROOF=' + top.z }); say('  ROOF=' + top.z + '  [FROM_SOURCE_MODEL: ' + top.src + ', R11 T/ROOF]'); }
    }
  }
  fs.writeFileSync(path.join(OUT, 'DX_' + s.f + '_marked.dxf'), MK.writeMarks(txt, marks));
}
if (refused) { say('REFUSED: evidence ambiguous, no claim of completeness'); process.exit(1); }
say('marked copies written to ' + OUT);
