// ⚠ DO NOT REMOVE — Unit tests for the SECTION view (bim-ootb lane spec DXF2BIM_MODELLER_LANE.md §L1.4 F5): @VIEW=SECTION / @CUT markings
// (dxf2marks.js) and slab top/underside + roof from section cut rectangles (dxf2shell.js sectionSlabs, slabZ opts.section).
// Every check names the issue it proves. Read the output after every run; exit code is not evidence.
'use strict';
const path = require('path');
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const S = require(path.join(__dirname, '../../deploy/dev/dxf2shell.js'));
const J = JSON.stringify;
let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
let hh = 0x100;
const mark = (raw, x, y) => ({ raw, x: x || 0, y: y || 0, handle: (hh++).toString(16).toUpperCase() });
const desc = ms => MK.describe(ms);
const CFG = { snap_tol: 0.001, elev_tol: 0.003 };
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'S-SLAB', type: 'sectslab' }, { match: 'exact', pattern: 'A-ROOF', type: 'roof' }] };

// plan (m in mm units) with grid letters on Y, and a valid section marking set
const plan = desc([mark('@SET=T'), mark('@VIEW=PLAN'), mark('@UNITS=mm'), mark('@LEVEL=0'), mark('@GRIDX=1', 0), mark('@GRIDX=2', 4000), mark('@GRIDY=A', 0, 0), mark('@GRIDY=B', 0, 8000)]).desc;
const secMarks = extra => [mark('@SET=T'), mark('@VIEW=SECTION'), mark('@UNITS=mm'), mark('@HAXIS=+Y'), mark('@CUT=X,2000'), mark('@GRIDH=A', 0), mark('@GRIDH=B', 8000), mark('@Z=0', 0, 0), mark('@Z=3.1', 0, 3100)].concat(extra || []);

// ---------- markings ----------
{ const d = desc(secMarks());
  check('SM1', 'a complete §L1.4 SECTION marking set is rejected', d.errors.length === 0 && d.desc.view === 'SECTION' && d.desc.cut === 'X,2000', 'errors=' + J(d.errors) + ' cut=' + d.desc.cut); }
{ const d = desc(secMarks().filter(m => !/^@CUT/.test(m.raw)));
  check('SM2', 'a SECTION without @CUT is accepted (the cut plane would be unstated)', d.errors.some(e => e.code === 'MARK:missing' && e.keys.indexOf('CUT') >= 0), J(d.errors)); }
{ const d = desc(secMarks().filter(m => !/^@CUT/.test(m.raw)).concat([mark('@CUT=Z,10')]));
  check('SM3', 'a malformed @CUT (axis not X|Y) is accepted', d.errors.some(e => e.code === 'MARK:malformed'), J(d.errors.map(e => e.code))); }
{ const d = desc(secMarks().filter(m => !/^@HAXIS/.test(m.raw)).concat([mark('@HAXIS=+X')]));
  check('SM4', 'HAXIS along the cut axis is accepted (the sheet cannot be aligned to the plan)', d.errors.some(e => e.code === 'MARK:axis_cut'), J(d.errors.map(e => e.code))); }
{ const d = desc(secMarks().filter(m => !/^@Z=3.1/.test(m.raw)));
  check('SM5', 'a SECTION with one @Z is accepted (no z scale)', d.errors.some(e => e.code === 'MARK:missing' && e.keys.indexOf('Z(>=2)') >= 0), J(d.errors)); }

// ---------- reader ----------
const sec = desc(secMarks()).desc, al = MK.align(plan, sec, 0.001);
check('SA1', 'the section does not align to the plan by its grid labels and @Z', al.ok && !!al.map, J(al.errors));
const rect = (h, layer, h0, z0, h1, z1) => ({ type: 'LWPOLYLINE', shape: true, layer, handle: h, vertices: [[h0, z0], [h1, z0], [h1, z1], [h0, z1]].map(p => ({ x: p[0], y: p[1] })) });
const BASE = [rect('A1', 'S-SLAB', 0, -127, 8000, 0), rect('A2', 'S-SLAB', 0, 0, 8000, 19), rect('A3', 'S-SLAB', 400, 2795, 7600, 3100), rect('A4', 'S-SLAB', 400, 3100, 7600, 3119), rect('A5', 'A-ROOF', 400, 6000, 7600, 6457)];
const run = (ents, roofMark) => S.sectionSlabs(ents, MAP, al.map, [0, 3.1], CFG, roofMark);
{ const r = run(BASE, 6.457);
  check('SR1', 'slab top/underside per level or the roof are not read from the cut rectangles', J(r.slabs['0'] && [r.slabs['0'].bottom, r.slabs['0'].top]) === J([-0.127, 0]) && J(r.slabs['3.1'] && [r.slabs['3.1'].bottom, r.slabs['3.1'].top, r.slabs['3.1'].thickness]) === J([2.795, 3.1, 0.305]) && r.roof && r.roof.bottom === 6 && r.roof.top === 6.457 && !r.gaps.length,
    'slabs=' + J(r.slabs) + ' roof=' + J(r.roof) + ' gaps=' + J(r.gaps)); }
{ const r = run(BASE);
  check('SR2', 'a finish floor sitting on the slab (bottom = level) is taken as the slab at that level', J(r.slabs['3.1'].from) === J(['A3']) && J(r.slabs['0'].from) === J(['A1']), 'from ' + J([r.slabs['0'].from, r.slabs['3.1'].from])); }
{ const r = run(BASE.filter(e => e.handle !== 'A3' && e.handle !== 'A4'));   // A4 (3100..3119) sits ON the level: bim-ootb §F8 D33 takes it as that level's slab, so 'no slab' means neither
  check('SR3', 'a level with no slab whose top is at it gets a value instead of a GAP', !r.slabs['3.1'] && r.gaps.some(g => g.code === 'GAP:section_no_slab' && g.level === 3.1), J(r.gaps)); }
{ const tri = { type: 'LWPOLYLINE', shape: true, layer: 'S-SLAB', handle: 'B1', vertices: [{ x: 0, y: 2795 }, { x: 8000, y: 2795 }, { x: 4000, y: 3100 }] };
  const r = run(BASE.concat([tri]));
  check('SR4', 'a non-rectangular cut outline is read as a slab', r.gaps.some(g => g.code === 'GAP:section_not_rect' && g.handle === 'B1') && J(r.slabs['3.1'].from) === J(['A3']), J(r.gaps)); }
{ const r = run(BASE.concat([rect('B2', 'S-SLAB', 7700, 2900, 8000, 3100)]));
  check('SR5', 'two slab cuts at one level with different undersides give a value instead of a conflict GAP', !r.slabs['3.1'] && r.gaps.some(g => g.code === 'GAP:section_slab_conflict'), J(r.gaps)); }
{ const r = run(BASE, 6.5);
  check('SR6', 'a drawn roof top that differs from @ROOF is accepted', !r.roof && r.gaps.some(g => g.code === 'GAP:section_roof_top_conflict'), J(r.gaps)); }
{ const moved = BASE.map(e => e.handle !== 'A3' ? e : rect('A3', 'S-SLAB', 400, 2745, 7600, 3100)), r0 = run(BASE), r1 = run(moved);
  check('SR7', 'mutation: moving the FF underside 50 mm does not move the read underside by exactly 50 mm', Math.abs((r0.slabs['3.1'].bottom - r1.slabs['3.1'].bottom) - 0.05) < 1e-9, r0.slabs['3.1'].bottom + ' -> ' + r1.slabs['3.1'].bottom); }
{ const r = run(BASE), A = J(r), B = J(run(BASE.slice().reverse()));
  check('SR8', 'the result depends on entity order', A === B, 'equal=' + (A === B)); }

// ---------- slabZ with the section ----------
{ const r = run(BASE), z = S.slabZ({ level: 3.1, ops: [] }, null, CFG, { section: r });
  check('SZ1', 'slabZ ignores the section (FF underside stays a GAP)', z.source === 'section' && z.bottom === 2.795 && z.top === 3.1 && z.gaps.length === 0, J(z)); }
{ const z = S.slabZ({ level: 3.1, ops: [] }, null, CFG);
  check('SZ2', 'slabZ without a section changed behaviour', z.top === null && z.gaps.some(g => g.code === 'GAP:slab_no_top'), J(z)); }
{ const ops = [{ op_type: 'DXF_WALL', params: { handle: 'W1', rect: [0, 0, 8, 0.3], height_source: 'elevation', base: 0.05, height: 2.9 } }];
  const z = S.slabZ({ level: 3.1, ops }, null, CFG, { section: run(BASE) });
  check('SZ3', 'an elevation-derived slab top that disagrees with the section is not reported', z.gaps.some(g => g.code === 'GAP:slab_top_conflict'), J(z.gaps)); }
console.log('SUMMARY fail=' + fails);
process.exit(fails ? 1 : 0);
