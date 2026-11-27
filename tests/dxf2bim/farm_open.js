// ⚠ DO NOT REMOVE — SANDBOX: openings from drawn gaps in the Farmhouse 1st floor plan, classified by the MARKED south elevation (SPEC §36).
// Work: Jay Osborne "American Farmhouse", CC BY-SA. File not in repo. Usage: node tests/dxf2bim/farm_open.js <marked.dxf>. Read the log after every run.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const txt = fs.readFileSync(process.argv[2], 'utf8'), hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const parsed = new DxfParser().parseSync(txt), IN = 0.0254;
const views = MK.describeAll(MK.readMarks(parsed.entities)), plan = views.find(v => v.desc.view === 'PLAN'), el = views.find(v => v.desc.view === 'ELEV');
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const MAP = { version: 1, rules: [{ match: 'exact', pattern: '1', type: 'wallline' }].concat(['0', '2', '3', '5', 'A-TEXTx', 'A-DIMSx', 'A-LINK', 'A-SYMB', 'L-PLNT', 'A-ELEC', 'A-TEXT', '0-NPLT', 'A-DIMS'].map(l => ({ match: 'exact', pattern: l, type: 'ignore' }))) };
const CFG = { version: 1, units: 'in', snap_tol: 0.0005, align_tol: 0.01, elev_centre_tol: 0.1 * IN, storey_height: 120 * IN, wall_mode: 'pair',
  wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN }, opening: { gap_min: 20 * IN, gap_max: 60 * IN } };   // sandbox values stated here
const run = () => {
  const r = B.run(txt, MAP, CFG, { DxfParser, hashHex, library: [], region: plan.region, exclude: plan.desc.excludes });
  const cand = E.gapOpenings(r.ops, CFG, { hashHex }), all = r.ops.concat(cand.ops);
  const al = MK.align(plan.desc, el.desc, 0.002);
  const marks = E.elevMarkOpenings(el.desc, al.map);
  const cl = E.classifyOpenings(all, [{ face: el.desc.face, openings: marks }], CFG, { level: plan.desc.level * 1, hashHex });
  return { r, cand, al, marks, cl };
};
const x = run(), x2 = run();
console.log('walls ' + x.r.ops.filter(o => o.op_type === 'DXF_WALL').length + ', gap candidates ' + x.cand.n + ', marked elevation openings ' + x.marks.length + ' (face ' + el.desc.face + ')');
const cands = x.cand.ops.map(o => ({ o, cx: o.params.centre[0] / IN, cy: o.params.centre[1] / IN, w: o.params.width / IN }));
console.log('candidates (centre x,y in; width in; axis): ' + cands.map(c => '(' + c.cx.toFixed(2) + ',' + c.cy.toFixed(2) + ') ' + c.w.toFixed(2) + ' ' + c.o.params.axis).join(' | '));
const southY = plan.desc.gridsY.SOUTH_FACE;
const south = cands.filter(c => c.o.params.axis === 'X' && Math.abs(c.cy - (southY + 1.75)) < 0.05).sort((a, b) => a.cx - b.cx);
check('FG1', 'the south wall must give exactly the 3 gaps measured earlier (31.5, 37.5, 31.5 in at x centres 1914, 2028, 2142)', south.length === 3 && south.every((c, i) => Math.abs(c.cx - [1914, 2028, 2142][i]) < 0.01 && Math.abs(c.w - [31.5, 37.5, 31.5][i]) < 0.01), south.map(c => c.cx.toFixed(2) + '/' + c.w.toFixed(2)).join(' '));
const opens = x.cl.ops.filter(o => o.op_type === 'DXF_OPENING').sort((a, b) => a.params.centre[0] - b.params.centre[0]);
check('FG2', 'south gaps not classified as window, door, window with sill/height 24/78, 0/84, 24/78 in (from the marked elevation)', opens.length === 3 && opens.map(o => o.params.category).join() === 'window,door,window' &&
  opens.every((o, i) => Math.abs(o.params.sill / IN - [24, 0, 24][i]) < 0.01 && Math.abs(o.params.height / IN - [78, 84, 78][i]) < 0.01), opens.map(o => o.params.category + ' w=' + (o.params.width / IN).toFixed(2) + ' sill=' + (o.params.sill / IN).toFixed(2) + ' h=' + (o.params.height / IN).toFixed(2) + ' src=' + o.params.height_source).join(' | '));
const mm = x.marks.map(m => ({ c: (m.p0 + m.p1) / 2 / IN, w: (m.p1 - m.p0) / IN, kind: m.kind })).sort((a, b) => a.c - b.c);
const dc = opens.map((o, i) => +(o.params.centre[0] / IN - mm[i].c).toFixed(3));
check('FG3', 'a plan gap centre differs from its marked elevation opening centre by more than 0.1 in', dc.every(v => Math.abs(v) <= 0.1) && opens.length === mm.length, 'centre differences (in) = ' + dc + ' ; elevation widths = ' + mm.map(m => m.w.toFixed(2)) + ' vs plan gaps ' + opens.map(o => (o.params.width / IN).toFixed(2)));
const gaps = x.cl.ops.filter(o => o.op_type === 'DXF_GAP' && /^GAP:no_elevation/.test(o.params.code)), gc = {}; gaps.forEach(g => { gc[g.params.code] = (gc[g.params.code] || 0) + 1; });
check('FG4', 'a gap candidate vanished: every candidate must be classified or carry a no-elevation gap', opens.length + gaps.length === x.cand.n, 'candidates=' + x.cand.n + ' classified=' + opens.length + ' gapped=' + gaps.length + ' ' + JSON.stringify(gc));
check('FG5', 'a marked elevation opening matched no plan gap', x.cl.unmatched_elev.length === 0, 'unmatched marks=' + x.cl.unmatched_elev.length);
check('FG6', 'two runs differ', JSON.stringify(x.cl.ops) === JSON.stringify(x2.cl.ops), 'ops=' + x.cl.ops.length);
// INFO (not asserted): sizes in the door and window schedules of this set vs what the drawing geometry gives
const clean = t => (t || '').replace(/\\P/g, ' | ').replace(/\{\\[^;]*;/g, '').replace(/[{}]/g, '').replace(/\\[A-Za-z]\d*;?/g, '').replace(/\s+/g, ' ').trim();
const sched = parsed.entities.filter(e => e.type === 'MTEXT' && /^\s*MARK SIZE/.test(clean(e.text)) || (e.type === 'MTEXT' && /MARK SIZE/.test(clean(e.text)))).map(e => clean(e.text));
const sizes = sched.map(t => (t.match(/\d+"\s*x\s*\d+"/g) || []).join(' ')); console.log('INFO schedule sizes found in the file: ' + JSON.stringify(sizes));
console.log('INFO drawing geometry: door leaf height ' + (opens[1] && (opens[1].params.height / IN).toFixed(2)) + ' in (schedule door sizes 36"x84", 24"x80", 30"x80"); window gap width ' + (opens[0] && (opens[0].params.width / IN).toFixed(2)) + ' in (schedule window 30"x60" and 24"x48"); marked window height 78 in (from the elevation dimension entities) differs from the schedule 60 in: unresolved, flagged');
console.log('SUMMARY fail=' + fails);
