// ⚠ DO NOT REMOVE — L2 qualify verdict tests Q1-Q5 + one test per check (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L2 / §L2.1).
// Fixtures are written by this script (mm, a 10 x 6 m box: plan + 4 elevations, real DIMENSION entities, grid on the wall axes). Each test names the issue.
// Read the log after every run (test_qualify.log); exit code is not evidence. Usage: node tests/dxf2bim/test_qualify.js
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DD = path.join(__dirname, '../../deploy/dev/');
const DxfParser = require(DD + 'dxf-parser.js'), B = require(DD + 'dxf2bim.js'), Q = require(DD + 'dxf2qualify.js');
const C = require('./set_configs.js');
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const J = JSON.stringify;
const lines = []; let fails = 0;
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };

// ---------------- fixture writer (DXF R12-style text that dxf-parser reads) ----------------
function W(opts) {
  opts = opts || {}; let h = 0x100; const ents = [], blocks = [];
  const H = () => (h++).toString(16).toUpperCase();
  const api = {
    line: (L, a, b) => { const k = H(); ents.push(['0', 'LINE', '5', k, '8', L, '10', a[0], '20', a[1], '30', 0, '11', b[0], '21', b[1], '31', 0]); return k; },
    rect: (L, x0, y0, x1, y1) => { const k = H(); ents.push(['0', 'LWPOLYLINE', '5', k, '8', L, '90', 4, '70', 1, '10', x0, '20', y0, '10', x1, '20', y0, '10', x1, '20', y1, '10', x0, '20', y1]); return k; },
    circle: (L, c, r) => { const k = H(); ents.push(['0', 'CIRCLE', '5', k, '8', L, '10', c[0], '20', c[1], '30', 0, '40', r]); return k; },
    text: (L, p, t) => { const k = H(); ents.push(['0', 'TEXT', '5', k, '8', L, '10', p[0], '20', p[1], '30', 0, '40', 1, '1', t]); return k; },
    mark: (t, p) => api.text('DXF2BIM-MARK', p || [0, 0], t),
    // rotated linear DIMENSION: p1, p2 definition points, ang 0 (measures x) or 90 (measures y), line = dimension-line point; text = override (group 1)
    dim: (L, p1, p2, ang, line, text, blockText) => {
      const k = H(), g = ['0', 'DIMENSION', '5', k, '8', L];
      if (blockText !== undefined) { const bn = '*D' + k; blocks.push(['0', 'BLOCK', '5', H(), '8', '0', '2', bn, '70', 1, '10', 0, '20', 0, '30', 0, '3', bn, '0', 'MTEXT', '5', H(), '8', '0', '10', 0, '20', 0, '30', 0, '1', blockText, '0', 'ENDBLK', '5', H(), '8', '0']); g.push('2', bn); }
      g.push('10', line[0], '20', line[1], '30', 0, '11', line[0], '21', line[1], '31', 0, '70', 0);
      if (text !== undefined) g.push('1', text);
      g.push('13', p1[0], '23', p1[1], '33', 0, '14', p2[0], '24', p2[1], '34', 0, '50', ang);
      ents.push(g); return k;
    },
    bubble: (L, lab, c) => { api.circle('A-GRID', c, 400); api.text('A-ANNO-TEXT', c, lab); },
    out: () => {
      const hd = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', opts.insunits === undefined ? 4 : opts.insunits, '0', 'ENDSEC'];
      const bl = ['0', 'SECTION', '2', 'BLOCKS'].concat([].concat(...blocks), ['0', 'ENDSEC']);
      return hd.concat(bl, ['0', 'SECTION', '2', 'ENTITIES'], [].concat(...ents), ['0', 'ENDSEC', '0', 'EOF']).join('\n') + '\n';
    } };
  return api;
}
const parse = t => new DxfParser().parseSync(t);

// ---- the fixture set (variations by option flags; every flag is one stated break) ----
function plan(o) {
  o = o || {}; const w = W();
  if (o.splitSouth) { w.rect('A-WALL-FULL', 0, 0, 4000, 200); w.rect('A-WALL-FULL', 5000, 0, 10000, 200); } else w.rect('A-WALL-FULL', 0, 0, 10000, 200);
  w.rect('A-WALL-FULL', 0, 5800, 10000, 6000); w.rect('A-WALL-FULL', 0, 200, 200, 5800); w.rect('A-WALL-FULL', 9800, 200, 10000, 5800);
  if (o.interior) w.rect(o.interior, 4900, 200, 5100, 5800);
  if (o.shortFull) w.rect('A-WALL-FULL', 4900, 200, 5100, 1000);
  const gx = o.gx || [[100, '1'], [9900, '2']], gy = o.gy || [[100, 'A'], [5900, 'B']];
  gx.forEach(([x, l]) => { w.line('A-GRID', [x, -3300], [x, 9300]); w.bubble('A-GRID', l, [x, -3700]); w.bubble('A-GRID', l, [x, 9700]); });
  gy.forEach(([y, l]) => { w.line('A-GRID', [-3300, y], [13300, y]); w.bubble('A-GRID', l, [-3700, y]); w.bubble('A-GRID', l, [13700, y]); });
  const D = {};
  D.sO = w.dim('A-ANNO-DIMS', [0, 0], [10000, 0], 0, [5000, -2600], o.overrideSouth);
  if (!o.noSouthGridDim) D.sG = w.dim('A-ANNO-DIMS', [100, 0], [9900, 0], 0, [5000, -1800]);
  w.dim('A-ANNO-DIMS', [0, 6000], [10000, 6000], 0, [5000, 8600]); w.dim('A-ANNO-DIMS', [100, 6000], [9900, 6000], 0, [5000, 7800]);
  w.dim('A-ANNO-DIMS', [0, 0], [0, 6000], 90, [-2600, 3000]); w.dim('A-ANNO-DIMS', [0, 100], [0, 5900], 90, [-1800, 3000]);
  w.dim('A-ANNO-DIMS', [10000, 0], [10000, 6000], 90, [12600, 3000]); w.dim('A-ANNO-DIMS', [10000, 100], [10000, 5900], 90, [11800, 3000]);
  if (o.splitSouth && o.splitDims) { w.dim('A-ANNO-DIMS', [0, 0], [4000, 0], 0, [2000, -1000]); w.dim('A-ANNO-DIMS', [4000, 0], [5000, 0], 0, [4500, -1000]); w.dim('A-ANNO-DIMS', [5000, 0], [10000, 0], 0, [7500, -1000]); }
  (o.extraDims || []).forEach((d, i) => { D['x' + i] = w.dim('A-ANNO-DIMS', d[0], d[1], 0, [5000, -3400 - 200 * i], d[2], d[3]); });
  if (o.exploded) D.ex = w.text('A-ANNO-DIMS', [5000, -2500], '10000');
  if (o.junk) D.junk = w.line('JUNK', [0, 0], [1, 1]);
  if (!o.noMarks) {
    ['@SET=FX', '@VIEW=' + (o.view || 'PLAN'), '@NAME=PLAN', '@LEVEL=0'].concat(o.noUnits ? [] : ['@UNITS=mm']).forEach(t => w.mark(t));
    w.mark('@GRIDX=1', [100, 0]); w.mark('@GRIDX=2', [9900, 0]); w.mark('@GRIDY=A', [0, 100]); w.mark('@GRIDY=B', [0, 5900]);
    (o.walltop || []).forEach(t => { D.wt = w.mark('@WALLTOP=' + t); });
    (o.rawMarks || []).forEach(t => w.mark(t));
  }
  return { text: w.out(), D };
}
// faces: FRONT minY +X (h=x), REAR maxY -X (h=10000-x), LEFT minX -Y (h=6000-y), RIGHT maxX +Y (h=y)  (L1.1 R11)
const FACE = { FRONT: ['minY', '+X', [[100, '1'], [9900, '2']], x => x], REAR: ['maxY', '-X', [[100, '1'], [9900, '2']], x => 10000 - x],
  LEFT: ['minX', '-Y', [[100, 'A'], [5900, 'B']], y => 6000 - y], RIGHT: ['maxX', '+Y', [[100, 'A'], [5900, 'B']], y => y] };
function elev(name, o) {
  o = o || {}; const [face, hax, grids, hOf] = FACE[name], w = W(), span = name === 'FRONT' || name === 'REAR' ? 10000 : 6000;
  w.rect('A-ELEV-WALL', 0, 0, span, 3000);
  (o.bands || []).forEach(b => w.rect('A-ELEV-WALL', b[0], b[1], b[2], b[3]));
  w.line('A-ANNO-LEVL', [-500, 0], [span + 500, 0]); w.line('A-ANNO-LEVL', [-500, o.roofLineY || 3000], [span + 500, o.roofLineY || 3000]);
  grids.forEach(([p, l]) => { if (o.dropGrid === l) return; const h = hOf(p); w.line('A-GRID', [h, -1300], [h, 3500]); w.bubble('A-GRID', l, [h, -1700]); });
  if (!o.noHeightDim) w.dim('A-ANNO-DIMS', [-500, 0], [-500, 3000], 90, [-1000, 1500]);
  if (!o.noMarks) {
    ['@SET=FX', '@VIEW=ELEV', '@UNITS=mm', '@NAME=' + name, '@FACE=' + face, '@HAXIS=' + hax].concat(o.noRoof ? [] : ['@ROOF=3']).forEach(t => w.mark(t));
    grids.forEach(([p, l], i) => w.mark('@GRIDH=' + l, [hOf(p) + (o.badGridH && i === 1 ? 700 : 0), 0]));
    w.mark('@Z=0', [0, 0]); w.mark('@Z=3', [0, 3000]);
  }
  return { text: w.out() };
}
function roof(o) {
  o = o || {}; const w = W(); w.rect('A-ROOF', 0, 0, 10000, 6000);
  ['@SET=FX', '@VIEW=ROOF', '@UNITS=mm', '@NAME=ROOF', '@LEVEL=3', '@ROOF=' + (o.top || 3)].forEach(t => w.mark(t));
  return { text: w.out() };
}
// SECTION sheet (lane spec L1.4 / L2.6 E): cut X=5000 through the fixture box, horizontal axis +Y (h = plan y), grid A/B at 100/5900, @Z 0/3
function section(o) {
  o = o || {}; const w = W(); w.rect('S-SLAB', 0, -200, 6000, 0); w.rect('A-ROOF', 0, 3000, 6000, 3200);
  ['@SET=FX', '@VIEW=SECTION', '@UNITS=mm', '@NAME=SECTION', '@CUT=X,5000', '@HAXIS=+Y', '@ROOF=' + (o.top || 3)].forEach(t => w.mark(t));
  w.mark('@GRIDH=A', [100, 0]); w.mark('@GRIDH=B', [o.badGrid ? 6600 : 5900, 0]); w.mark('@Z=0', [0, 0]); w.mark('@Z=3', [0, 3000]);
  return { text: w.out() };
}
const SECT_MAP = { version: 1, rules: [{ match: 'exact', pattern: 'S-SLAB', type: 'sectslab' }, { match: 'exact', pattern: 'A-ROOF', type: 'roof' }] };
const ELEV_EXCL = { version: 1, rules: ['A-GRID', 'A-ANNO-TEXT', 'A-ANNO-DIMS'].map(p => ({ match: 'exact', pattern: p, type: 'ignore' })) };   // fixture's own exclusions
const deps = { DxfParser, hashHex, library: [] };
function set(o) {
  o = o || {}; const P = plan(o.plan), files = [{ name: 'FX_PLAN', dxf: parse(P.text), layer_maps: [C.DX.MAP_PLAN] }];
  Object.keys(FACE).forEach(n => { if ((o.dropElev || []).indexOf(n) >= 0) return; const E = elev(n, Object.assign({ noMarks: o.plan && o.plan.noMarks }, (o.elev || {})[n])); files.push({ name: 'FX_' + n, dxf: parse(E.text), layer_maps: [C.DX.MAP_ELEV, C.DX.MAP_LEVL, ELEV_EXCL] }); });
  if (o.section) files.push({ name: 'FX_SECTION', dxf: parse(section(o.section).text), layer_maps: [SECT_MAP] });
  if (!o.noRoof) { const Rf = roof(Object.assign({}, o.roof)); const d = parse(Rf.text); files.push({ name: 'FX_ROOF', dxf: (o.plan && o.plan.noMarks) ? Object.assign({}, d, { entities: d.entities.filter(e => e.layer !== 'DXF2BIM-MARK') }) : d, layer_maps: [C.DX.MAP_ROOF] }); }
  const run = B.run(P.text, C.DX.MAP_PLAN, C.DX.CFG, deps);
  const input = { files, plan_ops: o.noOps ? undefined : { FX_PLAN: run.ops }, gaps: (o.gaps || run.report.gaps.map(g => Object.assign({ sheet: 'FX_PLAN' }, g))), resolved: o.resolved };
  return { input, D: P.D, run };
}
const S = C.DX.QUALIFY, codes = v => v.blocking.map(x => x.code), cc = v => J(v.counts);

// ======== Q1 ========
const base = set(), v1 = Q.qualify(base.input, S);
say('fixture plan ops: walls=' + base.run.ops.filter(o => o.op_type === 'DXF_WALL').length + ' gaps=' + J(base.run.report.gaps.map(g => g.code)));
check('Q1', 'a complete, correct marked set is not accepted (false block)', v1.verdict === 'qualifies' && v1.blocking.length === 0 && Object.values(v1.by_shape).every(s => s.verdict === 'qualifies'),
  'verdict=' + v1.verdict + ' blocking=' + J(v1.blocking.map(x => x.code + ' ' + x.message)) + ' checks=' + J(v1.checks));

// ======== Q2 ========
const v2 = Q.qualify(set({ plan: { noMarks: true } }).input, S);
const want2 = ['QF:face_no_elev', 'QF:face_no_elev', 'QF:face_no_elev', 'QF:face_no_elev', 'QF:set_no_plan', 'QF:set_no_roof'].concat(Array(6).fill('QF:sheet_no_role'), Array(6).fill('QF:units_unstated')).sort();
check('Q2', 'stripped markings not listed exactly (something missing, or a non-marking item leaks in)', J(codes(v2).slice().sort()) === J(want2), cc(v2));

// ======== Q3 (jscad-like: header mm, feet-inch dimension texts, an unmapped layer) ========
function jscadLike(units) {
  const w = W({ insunits: 4 }); w.line('A-WALL', [0, 0], [192, 0]); w.line('X-JUNK', [0, 0], [10, 10]);
  const d = w.dim('A-DIMS-1', [0, 0], [37, 0], 0, [18, -30], undefined, "\\A1;3'-1\"");
  if (units) w.mark('@UNITS=' + units);
  return { file: { name: 'JS', dxf: parse(w.out()), layer_maps: [{ version: 1, rules: [{ match: 'exact', pattern: 'A-WALL', type: 'wall' }, { match: 'exact', pattern: 'A-DIMS-1', type: 'ignore' }] }] }, d };
}
const j0 = jscadLike(), v3 = Q.qualify({ files: [j0.file] }, S), uc = v3.blocking.find(x => x.code === 'QF:units_conflict');
check('Q3', 'header units contradicting the drawing\'s own dimensions, or an unmapped layer, go unreported', !!uc && J(uc.implied) === '["in"]' && uc.handles[0] === j0.d && v3.blocking.some(x => x.code === 'QF:layer_unmapped' && x.layer === 'X-JUNK'), cc(v3) + ' ' + (uc ? uc.message : ''));
const v3b = Q.qualify({ files: [jscadLike('in').file] }, S);
check('Q3b', 'stating the right @UNITS does not clear the conflict (or a false conflict remains)', !v3b.blocking.some(x => x.code === 'QF:units_conflict' || x.code === 'QF:units_unstated' || x.code === 'QF:dim_text_mismatch'), cc(v3b));

// ======== Q4 (two regions: outside is not judged; EQ override; equal override) ========
{
  const w = W();
  w.mark('@REGION=-5000,-5000,15000,11000'); w.mark('@REGION=50000,-5000,70000,11000', [60000, 0]);
  ['@SET=FX', '@VIEW=PLAN', '@UNITS=mm', '@LEVEL=0'].forEach(t => w.mark(t)); w.mark('@GRIDX=1', [100, 0]); w.mark('@GRIDX=2', [9900, 0]); w.mark('@GRIDY=A', [0, 100]); w.mark('@GRIDY=B', [0, 5900]);
  ['@SET=FX', '@VIEW=ELEV', '@UNITS=mm', '@FACE=minY', '@HAXIS=+X'].forEach(t => w.mark(t, [60000, 0])); w.mark('@GRIDH=1', [60100, 0]); w.mark('@GRIDH=2', [69900, 0]); w.mark('@Z=0', [60000, 0]); w.mark('@Z=3', [60000, 3000]);
  w.rect('A-WALL-FULL', 0, 0, 10000, 200);
  const eq = w.dim('A-ANNO-DIMS', [0, 0], [5000, 0], 0, [2500, -1000], 'VARIES'), same = w.dim('A-ANNO-DIMS', [0, 0], [10000, 0], 0, [5000, -2000], '10000');
  const outJunk = w.line('JUNK', [30000, 0], [30001, 1]), outDim = w.dim('A-ANNO-DIMS', [30000, 0], [31000, 0], 0, [30500, -500], '7');
  const f = { name: 'FX_REG', dxf: parse(w.out()), layer_maps: [C.DX.MAP_PLAN, ELEV_EXCL] };
  const sh = Q.sheets([f]), v4 = Q.qualify({ files: [f] }, S), all = v4.blocking.concat(v4.advisory);
  check('Q4a', 'two regions not read as two sheets', J(sh.map(s => s.id + ':' + s.view)) === J(['FX_REG#1:PLAN', 'FX_REG#2:ELEV']), J(sh));
  check('Q4b', 'an entity outside every region was judged (not part of the set)', !all.some(x => x.handles.indexOf(outJunk) >= 0 || x.handles.indexOf(outDim) >= 0), 'items on outside handles=' + all.filter(x => x.handles.indexOf(outJunk) >= 0 || x.handles.indexOf(outDim) >= 0).length);
  check('Q4c', 'an unverifiable override (VARIES) passed, or an equal override blocked', v4.blocking.some(x => x.code === 'QF:dim_text_unreadable' && x.handles[0] === eq) && v4.advisory.some(x => x.code === 'QF:dim_override_equal' && x.handles[0] === same) && !v4.blocking.some(x => x.handles[0] === same),
    'VARIES->' + J(all.filter(x => x.handles[0] === eq).map(x => x.code)) + ' equal->' + J(all.filter(x => x.handles[0] === same).map(x => x.code)));
}

// ======== Q5 mutation: one DIMENSION text changed ========
const s5 = set({ plan: { overrideSouth: '9000' } }), v5 = Q.qualify(s5.input, S);
check('Q5', 'a doctored DIMENSION text is not blocked, or not with exactly its handle', v5.verdict === 'blocked' && v5.blocking.length === 1 && v5.blocking[0].code === 'QF:dim_text_mismatch' && J(v5.blocking[0].handles) === J([s5.D.sO]) && v5.blocking[0].pos && v5.blocking[0].pos.x === 5000,
  J(v5.blocking.map(x => [x.code, x.handles, x.pos, x.message])));

// ======== one test per check (each a single stated break of the Q1 set) ========
const only = (id, issue, o, want, extra) => { const v = Q.qualify(set(o).input, extra || S); check(id, issue, J(codes(v).slice().sort()) === J(want.slice().sort()), cc(v) + ' | ' + v.blocking.slice(0, 3).map(x => x.message).join(' ; ')); return v; };
only('QD4a', 'an interior wall (any layer) is demanded a grid line: the reader cannot know load-bearing (L2.3 D4)', { plan: { interior: 'A-WALL-FULL', shortFull: true } }, []);
only('G1b', 'a partition is demanded a grid (invented requirement)', { plan: { interior: 'A-WALL-PRTN' } }, []);
only('QD4b', 'an exterior envelope axis without a grid line passes (L2.3 D4)', { plan: { gx: [[100, '1']] } }, ['QF:grid_missing']);
const g1c = Q.qualify(set({ plan: { gx: [[100, '1'], [9500, '2']] } }).input, S);
check('G1c', 'a grid line on no wall axis/face passes', g1c.blocking.some(x => x.code === 'QF:grid_off_axis' && x.pos_m === 9.5) && g1c.blocking.some(x => x.code === 'QF:grid_missing' && x.pos_m === 9.9), cc(g1c));
const g2a = Q.qualify(set({ plan: { gx: [[100, 'A'], [9900, 'B']], gy: [[100, '1'], [5900, '2']] } }).input, S);
check('G2a', 'letters on constant-X lines (G2 series) pass', g2a.blocking.filter(x => x.code === 'QF:grid_label_series').length === 4 && g2a.blocking.every(x => /grid_label_series|elev_grid_missing|dim_missing/.test(x.code)), cc(g2a));
only('G2b', 'grid labels out of order pass', { plan: { gx: [[100, '2'], [9900, '1']] }, elev: { FRONT: {}, REAR: {} } }, ['QF:grid_label_order', 'QF:elev_grid_missing', 'QF:elev_grid_missing', 'QF:elev_grid_missing', 'QF:elev_grid_missing']);
const g2c = Q.qualify(set({ plan: { gx: [[100, '1'], [9900, '1']] } }).input, S);
check('G2c', 'a duplicated grid label passes', g2c.blocking.some(x => x.code === 'QF:grid_label_dup') && g2c.blocking.some(x => x.code === 'QF:grid_label_order'), cc(g2c));
only('G3a', 'an exploded (typed) dimension text passes as a dimension', { plan: { exploded: true } }, ['QF:dim_not_entity']);
const g3b = only('G3b', 'a missing grid-to-grid dimension string passes', { plan: { noSouthGridDim: true } }, ['QF:dim_missing']);
check('G3b-detail', 'the missing dimension is not named by side and kind', g3b.blocking[0] && g3b.blocking[0].side === 'minY' && g3b.blocking[0].kind === 'grid' && J(g3b.blocking[0].span) === '[0.1,9.9]', J(g3b.blocking[0]));
only('G3c', 'wall ends at an opening on an exterior face are not dimensioned (G3-3) and it passes', { plan: { splitSouth: true } }, ['QF:dim_point_missing', 'QF:dim_point_missing']);
only('G3d', 'the opening string, once dimensioned, is still reported (false block)', { plan: { splitSouth: true, splitDims: true } }, []);
only('G4a', 'an elevation datum that differs from the stated level passes', { elev: { FRONT: { roofLineY: 3100 } } }, ['QF:elev_level_mismatch']);
only('G4b', 'an elevation without its roof-top datum passes', { elev: { REAR: { noRoof: true } } }, ['QF:elev_roof_unstated']);
only('G4c', 'an elevation without its height dimension passes', { elev: { RIGHT: { noHeightDim: true } } }, ['QF:elev_height_dim_missing']);
only('G4d', 'an elevation without a projected grid bubble passes', { elev: { FRONT: { dropGrid: '2' } } }, ['QF:elev_grid_missing']);
only('G4e', 'an elevation whose grid markings disagree with the plan passes', { elev: { LEFT: { badGridH: true } } }, ['QF:elev_align_fail']);
only('F1', 'a building face without an elevation passes', { dropElev: ['LEFT'] }, ['QF:face_no_elev']);
only('U1', 'units not user-stated pass ($INSUNITS trusted)', { plan: { noUnits: true } }, ['QF:units_unstated']);
const l1 = only('L1', 'a layer neither mapped nor excluded passes', { plan: { junk: true } }, ['QF:layer_unmapped']);
check('L1-detail', 'the unmapped layer item does not carry its handle / position', l1.blocking[0] && l1.blocking[0].layer === 'JUNK' && l1.blocking[0].handles.length === 1 && l1.blocking[0].pos !== null, J(l1.blocking[0]));
only('M1', 'an invalid marking (@VIEW=DETAIL; SECTION became a valid view in lane spec L1.4) passes', { plan: { view: 'DETAIL' } }, ['QF:mark_invalid', 'QF:set_no_plan', 'QF:sheet_no_role']);
only('K1', 'a check that could not run (no plan ops) passes silently', { noOps: true }, ['QF:check_skipped']);
only('S1', 'a missing setting is defaulted silently', {}, ['QF:setting_missing'], Object.assign({}, S, { tol: Object.assign({}, S.tol, { grid: undefined }) }));
// ---- L2.3 D1 roof role ----
only('QR2', 'a set with no roof plan is not blocked on the roof (or blocks other shapes)', { noRoof: true }, ['QF:set_no_roof']);
{ const v = Q.qualify(set({ noRoof: true }).input, S); check('QR2-shape', 'set_no_roof blocks a shape other than the roof', v.by_shape.roof.verdict === 'blocked' && ['walls', 'slabs', 'openings'].every(k => v.by_shape[k].verdict === 'qualifies'), J(v.by_shape)); }
only('QR3', 'the roof sheet and the elevations disagree on the roof top and it passes', { roof: { top: 3.5 } }, Array(4).fill('QF:roof_level_mismatch'));
// ---- L2.3 D2 storeys only from plans ----
{ const v = Q.qualify(set({ elev: { FRONT: { bands: [[0, 1500, 10000, 3000], [3000, 2000, 6000, 3000]] } } }).input, S);
  check('QS1', 'an elevation band with no plan passes, or a wall piece above a window is taken for a storey', J(codes(v)) === '["QF:set_storey_unstated"]' && v.blocking[0].level === 1.5, cc(v) + ' ' + (v.blocking[0] ? v.blocking[0].message : '')); }
// ---- L2.3 D3 gaps once / user-stated convention ----
{ const v = Q.qualify(set({ gaps: [{ code: 'GAP:no_host_cut', sheet: 'FX_PLAN', handle: 'AAA' }, { code: 'GAP:opening_unclassified', sheet: 'FX_PLAN', handle: 'BBB' }, { code: 'GAP:no_host_cut', sheet: 'FX_PLAN', handle: 'CCC' }], resolved: { FX_PLAN: ['AAA', 'BBB'] } }).input, S);
  check('QG1', 'a gap the final stage resolved is still counted, or an unresolved one is dropped', J(v.blocking.map(x => x.code + ':' + x.handles[0])) === '["GAP:no_host_cut:CCC"]' && v.checks.gaps_superseded === 2, cc(v) + ' superseded=' + v.checks.gaps_superseded); }
const wallGap = { code: 'GAP:no_elevation_height', sheet: 'FX_PLAN', handle: '100', layer: 'A-WALL-FULL' }, doorGap = { code: 'GAP:no_elevation_height', sheet: 'FX_PLAN', handle: '101', layer: 'A-DOOR' };
only('QG2', 'an interior wall height no elevation shows passes without a stated convention', { gaps: [wallGap] }, ['GAP:no_elevation_height']);
{ const v = Q.qualify(set({ plan: { walltop: ['0,slab_above'] }, gaps: [wallGap] }).input, S);
  check('QG3', 'the stated @WALLTOP convention is not applied, or its source is not recorded (no @BY -> stated (file), L2.7)', v.verdict === 'qualifies' && v.advisory.some(x => x.code === 'QF:convention_applied' && x.convention === 'stated (file)') && v.conventions.length === 1 && v.conventions[0].source === 'stated (file)' && v.conventions[0].level === 0, cc(v) + ' conventions=' + J(v.conventions)); }
{ const v = Q.qualify(set({ plan: { walltop: ['0,slab_above @BY=model'] }, gaps: [wallGap] }).input, S);
  check('QG3b', 'a convention marked @BY=model is not shown as stated (model)', v.verdict === 'qualifies' && v.conventions[0] && v.conventions[0].source === 'stated (model)', J(v.conventions)); }
only('QBY', 'a TEXT holding only @BY passes (MARK:by_invalid must block)', { plan: { rawMarks: ['@BY=model'] }, gaps: [] }, ['QF:mark_invalid']);
only('QG4', '@WALLTOP silenced a door height gap (it covers walls only)', { plan: { walltop: ['0,slab_above'] }, gaps: [wallGap, doorGap] }, ['GAP:no_elevation_height']);
{ const v = Q.qualify(set({ gaps: [doorGap] }).input, S);
  check('QG6', 'a door height gap (A-DOOR layer, no kind) is counted under walls (L2.5 W3)', v.blocking.length === 1 && v.blocking[0].shape === 'openings' && v.by_shape.walls.verdict === 'qualifies' && v.by_shape.openings.verdict === 'blocked', J(v.blocking.map(x => x.code + ':' + x.shape))); }
{ const v = Q.qualify(set({ section: {} }).input, S);
  check('QSEC1', 'a SECTION sheet is not accepted as a role (L2.6 E) or blocks a correct set', v.verdict === 'qualifies' && v.sheets.some(x => x.id === 'FX_SECTION' && x.view === 'SECTION'), cc(v)); }
only('QSEC2', 'a section roof top that disagrees with the roof sheet passes', { section: { top: 3.5 } }, ['QF:roof_level_mismatch']);
only('QSEC3', 'a section whose grid markings disagree with the plan passes', { section: { badGrid: true } }, ['QF:elev_align_fail']);
{ const v = Q.qualify(set({ plan: { walltop: ['handle:100,2.9'] }, gaps: [wallGap] }).input, S);
  check('QG7', 'a per-wall @WALLTOP (L2.6 A) does not cover its wall-height gap, or covers it silently', v.verdict === 'qualifies' && v.advisory.some(x => x.code === 'QF:height_stated' && x.handles[0] === '100' && x.z_top === 2.9), cc(v) + ' ' + J(v.advisory.map(x => x.code))); }
only('QG8', 'mutation: a per-wall @WALLTOP on another handle covered the gap', { plan: { walltop: ['handle:1FF,2.9'] }, gaps: [wallGap] }, ['GAP:no_elevation_height']);
only('QG5', '@WALLTOP naming no plan level passes', { plan: { walltop: ['7,slab_above'] } }, ['QF:walltop_unknown_storey']);
// ---- L2.3 D5 drafting notes ----
const N = (id, issue, d, wantB, wantA) => { const s5x = set({ plan: { extraDims: [d] } }), v = Q.qualify(s5x.input, S), h = s5x.D.x0;
  check(id, issue, J(v.blocking.filter(x => x.handles[0] === h).map(x => x.code)) === J(wantB) && J(v.advisory.filter(x => x.handles[0] === h).map(x => x.code)) === J(wantA), 'blocking ' + J(v.blocking.map(x => x.code)) + ' advisory ' + J(v.advisory.map(x => x.message))); };
N('QN1', 'an EQ note blocks (it is a recognised drafting note)', [[0, 0], [10000, 0], 'EQ'], [], ['QF:dim_note']);
N('QN2', 'a TYP note whose number equals the measurement blocks', [[0, 0], [10000, 0], '10000 TYP'], [], ['QF:dim_note']);
N('QN3', 'a TYP note whose number differs from the measurement passes', [[0, 0], [10000, 0], '9999 TYP'], ['QF:dim_text_mismatch'], []);
N('QN4', 'an unrecognised word override (VARIES) passes', [[0, 0], [10000, 0], 'VARIES'], ['QF:dim_text_unreadable'], []);
N('QN5', 'a dimension block that renders another value than its measurement passes', [[0, 0], [10000, 0], '<>', '9000'], ['QF:dim_text_mismatch'], []);
N('QN6', 'a V.I.F. note blocks', [[0, 0], [10000, 0], 'V.I.F.'], [], ['QF:dim_note']);
// pipeline gaps: advisory vs blocking, shape attribution
const gp = Q.qualify(set({ gaps: [{ code: 'GAP:type_unbound', sheet: 'FX_PLAN', handle: '100', kind: 'window' }, { code: 'GAP:label_unmatched', sheet: 'FX_PLAN' }, { code: 'GAP:schedule_conflict', sheet: 'FX_PLAN' }, { code: 'GAP:unmapped_layer', sheet: 'FX_PLAN', handle: '101' }] }).input, S);
check('P1', 'an advisory gap (type_unbound / label_* / schedule_conflict) blocks, or unmapped_layer is double-listed', gp.verdict === 'qualifies' && gp.advisory.filter(x => /^GAP:/.test(x.code)).length === 3 && gp.advisory.find(x => x.code === 'GAP:type_unbound').pos.x === 0, cc(gp) + ' advisory=' + J(gp.advisory.map(x => x.code + ':' + x.shape)));
const gr = Q.qualify(set({ gaps: [{ code: 'GAP:roof_no_top', sheet: 'FX_PLAN' }] }).input, S);
check('P2', 'a blocking roof gap does not block, or blocks the other shapes', gr.verdict === 'blocked' && gr.by_shape.roof.verdict === 'blocked' && gr.by_shape.walls.verdict === 'qualifies' && gr.by_shape.slabs.verdict === 'qualifies' && gr.by_shape.openings.verdict === 'qualifies', J(gr.by_shape));
// determinism under entity order, and the input is never changed
{
  const inp = set().input, h0 = hashHex(J(inp)), a = Q.qualify(inp, S);
  const shuffled = Object.assign({}, inp, { files: inp.files.map(f => Object.assign({}, f, { dxf: Object.assign({}, f.dxf, { entities: f.dxf.entities.slice().reverse() }) })) });
  const b = Q.qualify(shuffled, S), m = Q.qualify(set({ plan: { exploded: true, junk: true, interior: 'A-WALL-FULL' } }).input, S), mr = set({ plan: { exploded: true, junk: true, interior: 'A-WALL-FULL' } }).input;
  const mrS = Object.assign({}, mr, { files: mr.files.map(f => Object.assign({}, f, { dxf: Object.assign({}, f.dxf, { entities: f.dxf.entities.slice().reverse() }) })) });
  check('D1', 'the verdict depends on entity order (nondeterminism)', J(a) === J(b) && J(m) === J(Q.qualify(mrS, S)), 'clean ' + hashHex(J(a)).slice(0, 12) + '/' + hashHex(J(b)).slice(0, 12) + ' broken(' + m.blocking.length + ') equal=' + (J(m) === J(Q.qualify(mrS, S))));
  check('R1', 'qualify changed its input (it must only report, never fix or fill)', hashHex(J(inp)) === h0, h0.slice(0, 16));
}
// grammar used to read dimension texts
const PL = [['8800', 8.8], ['3200mm', 3.2], ["3'-1\"", 0.93980], ["6'-6\"", 1.9812], ['30"', 0.762], ['7-1/2"', 0.1905], ['7 1/2"', 0.1905], ["32'", 9.7536], ['EQ', null], ["15' TYP", null], ['45\u00b0', null]];
const plBad = PL.filter(([t, m]) => { const r = Q.parseLen(t); const got = r ? (r.unitless ? r.v * 0.001 : r.m) : null; return m === null ? got !== null : got === null || Math.abs(got - m) > 1e-5; });
check('T1', 'a dimension text is read as the wrong length, or a non-length is read as one', plBad.length === 0, 'bad=' + J(plBad) + ' (unitless read in mm here)');

// ======== L4.2 @LAYER (bim-ootb lane spec §L4.2): a stated layer rule overrides the set's rule for that layer, on that sheet only ========
{
  const MKq = require(DD + 'dxf2marks.js');
  const restate = (input, name, text, marks) => Object.assign({}, input, { files: input.files.map(f => f.name === name ? Object.assign({}, f, { dxf: parse(MKq.writeMarks(text, marks.map(t => ({ text: t })))) }) : f) });
  const key = x => x.code + '|' + x.sheet + '|' + x.handles.join(',');
  // QL1 an unmapped layer stated ignore: its layer_unmapped goes, and the verdict lists the rule with its source
  const j = set({ plan: { junk: true } }), vj = Q.qualify(j.input, S), vj2 = Q.qualify(restate(j.input, 'FX_PLAN', plan({ junk: true }).text, ['@LAYER=JUNK,ignore @BY=user']), S);
  check('QL1', 'a layer stated ignore by @LAYER is still unmapped, or the verdict does not list the stated rule with its source',
    vj.blocking.some(x => x.code === 'QF:layer_unmapped' && x.layer === 'JUNK') && !vj2.blocking.some(x => x.code === 'QF:layer_unmapped') && vj2.verdict === 'qualifies' &&
    J((vj2.layer_rules || []).map(r => [r.sheet, r.layer, r.type, r.source])) === J([['FX_PLAN', 'JUNK', 'ignore', 'user']]) && vj.layer_rules === undefined,
    'before ' + cc(vj) + ' after ' + cc(vj2) + ' layer_rules=' + J(vj2.layer_rules));
  // QL2 MUTATION: FRONT states its level-line layer as ignore (wrong type) -> exactly the 2 level datums of FRONT are reported
  const vm = Q.qualify(restate(base.input, 'FX_FRONT', elev('FRONT').text, ['@LAYER=A-ANNO-LEVL,ignore']), S);
  const k1 = new Set(v1.blocking.map(key)), nw = vm.blocking.filter(x => !k1.has(key(x)));
  check('QL2', 'a wrong @LAYER type (level lines stated ignore) is not reported exactly as the missing level datums of that sheet',
    nw.length === 2 && nw.every(x => x.code === 'QF:elev_level_mismatch' && x.sheet === 'FX_FRONT') && J(nw.map(x => x.level).sort()) === J([0, 3]) && vm.blocking.length === v1.blocking.length + 2,
    'new=' + J(nw.map(x => x.code + ' ' + x.sheet + ' z=' + x.level)));
  // QL3 @LAYER …,grid makes a grid layer for THAT sheet only (settings without grid layers: the plan states A-GRID as grid -> its grid is read; the elevations, which do not, find no bubble)
  const S0 = Object.assign({}, S, { layers: Object.assign({}, S.layers, { grid: [] }) });
  const g0 = Q.qualify(base.input, S0), g1 = Q.qualify(restate(base.input, 'FX_PLAN', plan().text, ['@LAYER=A-GRID,grid']), S0);
  const n = (v, code, sh) => v.blocking.filter(x => x.code === code && x.sheet === sh).length;
  check('QL3', 'a sheet\'s @LAYER grid rule is not applied to that sheet, or leaks to another sheet',
    n(g0, 'QF:grid_missing', 'FX_PLAN') > 0 && n(g1, 'QF:grid_missing', 'FX_PLAN') === 0 && n(g1, 'QF:elev_grid_missing', 'FX_FRONT') > 0,
    'plan grid_missing ' + n(g0, 'QF:grid_missing', 'FX_PLAN') + '->' + n(g1, 'QF:grid_missing', 'FX_PLAN') + ', FRONT elev_grid_missing (its A-GRID not stated) ' + n(g0, 'QF:elev_grid_missing', 'FX_FRONT') + '->' + n(g1, 'QF:elev_grid_missing', 'FX_FRONT'));
}

say('\nSUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_qualify.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
