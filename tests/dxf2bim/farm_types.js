// ⚠ DO NOT REMOVE — SANDBOX (SPEC §55): schedule marks and schedule sizes READ FROM THE FARMHOUSE DRAWING'S OWN TEXT, written as @TAG/@SCHEDULE markers into a copy,
// read back, applied to the classified south openings, then type binding with schedule conflict check. Work: Jay Osborne "American Farmhouse", CC BY-SA; the files
// stay in tests/dxf2bim/external/farmhouse/ (git-excluded). Usage: node tests/dxf2bim/farm_types.js <original.dxf> <marked.dxf> <tagged-out.dxf>. Read the log after every run.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const T = require(path.join(__dirname, '../../deploy/dev/dxf2types.js'));
const [ORIG, MARKED, OUTF] = process.argv.slice(2), hashHex = s => crypto.createHash('sha256').update(s).digest('hex'), IN = 0.0254, J = JSON.stringify;
const origTxt = fs.readFileSync(ORIG, 'utf8'), markedTxt = fs.readFileSync(MARKED, 'utf8');
const orig = new DxfParser().parseSync(origTxt);
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const MARK_DX = process.env.MARK_DX ? +process.env.MARK_DX : 6, MARK_DY = 12;   // SANDBOX tolerances in inches (stated in the log); MARK_DX=0 is the control
console.log('sandbox: mark_dx=' + MARK_DX + ' in along the wall, mark_dy=' + MARK_DY + ' in across it; bind.size_tol=0.005 m');
// ---- F1a schedule rows from the drawing's MTEXT (evidence: lines "MARK^I SIZE ..." with a W"xH" size) ----
const rows = [];
orig.entities.filter(e => e.type === 'MTEXT' && /MARK\s+SIZE/.test(e.text || '') && /\d+"\s*x\s*\d+"/.test(e.text)).forEach(e => {
  (e.text || '').split('\\P').forEach(line => { const m = /^\s*([A-Z0-9])\^I\s*(\d+)"\s*x\s*(\d+)"(.*)$/.exec(line); if (!m) return;
    const tail = m[4], cls = /DOUBLE HUNG/.test(tail) ? 'window' : /PANEL|GLAZED/.test(tail) ? 'door' : null;
    if (!cls) { console.log('REFUSE: schedule row ' + m[1] + ' matches neither window (DOUBLE HUNG) nor door (PANEL/GLAZED): ' + line.trim().slice(0, 60)); process.exit(1); }
    rows.push({ handle: e.handle, mark: m[1], class: cls, w: +m[2], h: +m[3] }); }); });
console.log('schedule rows read from the drawing text: ' + rows.map(r => r.handle + ' ' + r.class + ' ' + r.mark + ' ' + r.w + 'x' + r.h).join(' | '));
// ---- the existing pipeline run (as farm_open.js) ----
const views0 = MK.describeAll(MK.readMarks(new DxfParser().parseSync(markedTxt).entities)), plan0 = views0.find(v => v.desc.view === 'PLAN'), el = views0.find(v => v.desc.view === 'ELEV');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: '1', type: 'wallline' }].concat(['0', '2', '3', '5', 'A-TEXTx', 'A-DIMSx', 'A-LINK', 'A-SYMB', 'L-PLNT', 'A-ELEC', 'A-TEXT', '0-NPLT', 'A-DIMS'].map(l => ({ match: 'exact', pattern: l, type: 'ignore' }))) };
const CFG = { version: 1, units: 'in', snap_tol: 0.0005, align_tol: 0.01, elev_centre_tol: 0.1 * IN, storey_height: 120 * IN, wall_mode: 'pair',
  wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN }, opening: { gap_min: 20 * IN, gap_max: 60 * IN } };
function classified(plan, txt) {
  const r = B.run(txt, MAP, CFG, { DxfParser, hashHex, library: [], region: plan.region, exclude: plan.desc.excludes });
  const cand = E.gapOpenings(r.ops, CFG, { hashHex }), all = r.ops.concat(cand.ops), al = MK.align(plan.desc, el.desc, 0.002);
  return E.classifyOpenings(all, [{ face: el.desc.face, openings: E.elevMarkOpenings(el.desc, al.map) }], CFG, { level: plan.desc.level * 1, hashHex }).ops;
}
const ops0 = classified(plan0, markedTxt), open0 = ops0.filter(o => o.op_type === 'DXF_OPENING').sort((a, b) => a.params.centre[0] - b.params.centre[0]);
console.log('classified openings: ' + open0.map(o => o.params.category + ' centre(in)=' + (o.params.centre[0] / IN).toFixed(2) + ',' + (o.params.centre[1] / IN).toFixed(2) + ' w=' + (o.params.width / IN).toFixed(2) + ' h=' + (o.params.height / IN).toFixed(2)).join(' | '));
// ---- F1b mark texts of the plan region (the drawing's own TEXT), proposals ----
const clean = t => (t || '').replace(/\\P/g, ' | ').replace(/\{\\[^;]*;/g, '').replace(/[{}]/g, '').replace(/\\[A-Za-z]\d*;?/g, '').replace(/\s+/g, ' ').trim();
const R = plan0.region, marksOf = c => new Set(rows.filter(r => r.class === c).map(r => r.mark));
const pos = e => e.position || e.startPoint || {};
const texts = orig.entities.filter(e => (e.type === 'MTEXT' || e.type === 'TEXT') && /^[A-Z0-9]$/.test(clean(e.text))).map(e => ({ t: clean(e.text), x: pos(e).x, y: pos(e).y, h: e.handle })).filter(t => t.x >= R[0] && t.x <= R[2] && t.y >= R[1] && t.y <= R[3]);
const proposals = [], tagMarks = [];
open0.forEach(o => {
  const cx = o.params.centre[0] / IN, cy = o.params.centre[1] / IN, cls = o.params.category, set = marksOf(cls);
  const near = texts.filter(t => set.has(t.t) && Math.abs(t.x - cx) <= MARK_DX && Math.abs(t.y - cy) <= MARK_DY);
  if (near.length !== 1) { console.log('  no tag for ' + cls + ' at (' + cx.toFixed(1) + ',' + cy.toFixed(1) + '): ' + near.length + ' candidate mark texts'); return; }
  proposals.push({ cls, cx, cy, mark: near[0].t, from: near[0].h });
  tagMarks.push({ text: '@TAG=' + cls + ',' + near[0].t, x: cx, y: cy });
});
console.log('tag proposals (from the drawing text): ' + proposals.map(p => p.cls + ' ' + p.mark + ' <- text ' + p.from + ' at opening (' + p.cx.toFixed(1) + ',' + p.cy.toFixed(1) + ')').join(' | '));
const schedMarks = rows.map((r, i) => ({ text: '@SCHEDULE=' + r.mark + ',' + r.class + ',' + r.w + ',' + r.h, x: R[0] + 8, y: R[1] + 8 + i * 2 }));
// SPEC §57: the allowance is STATED by marking (sandbox value from the observation of SPEC §56: plan gap = schedule width + 1.5 in on all three openings, door height 84 = 84), placed in the plan region
const allowMarks = ['window', 'door'].map((c, i) => ({ text: '@ALLOWANCE=' + c + ',1.5,0', x: R[0] + 8, y: R[1] + 30 + i * 2 }));
const taggedTxt = MK.writeMarks(markedTxt, tagMarks.concat(schedMarks, allowMarks)); fs.writeFileSync(OUTF, taggedTxt);
// ---- read back from the written file ----
const back = new DxfParser().parseSync(taggedTxt), vb = MK.describeAll(MK.readMarks(back.entities)), planB = vb.find(v => v.desc.view === 'PLAN');
const errB = vb.flatMap(v => v.errors).filter(e => e.code !== 'MARK:missing');
check('FT2', 'markers written to the drawing copy were not read back identically (or marker errors)', errB.length === 0 && J(planB.desc.tags.map(t => t.class + ':' + t.text).sort()) === J(proposals.map(p => p.cls + ':' + p.mark).sort()) && planB.desc.schedule.length === rows.length && J(planB.desc.allowance) === J({ window: { w: 1.5, h: 0 }, door: { w: 1.5, h: 0 } }),
  'tags read=' + J(planB.desc.tags.map(t => t.class + ':' + t.text)) + ' schedule read=' + planB.desc.schedule.length + '/' + rows.length + ' errors=' + errB.length);
const IN_ = MK.UNITS.in;
const tagged = T.applyTags(ops0, [{ desc: planB.desc }], MK.UNITS, { snap_tol: CFG.snap_tol, level: plan0.desc.level * 1 });
const opensT = tagged.ops.filter(o => o.op_type === 'DXF_OPENING').sort((a, b) => a.params.centre[0] - b.params.centre[0]);
check('FT1', 'an opening did not receive exactly the mark printed next to it in the drawing (1, A, 1), or label gaps appeared', tagged.gaps.length === 0 && J(opensT.map(o => o.params.label)) === J(['1', 'A', '1']) && opensT.every(o => o.params.label_source === 'tag'), 'labels=' + J(opensT.map(o => o.params.category + ':' + o.params.label)) + ' label gaps=' + J(tagged.gaps.map(g => g.params.code)));
const sched = T.scheduleFromDesc(planB.desc, MK.UNITS), exp = { '1': [30, 60], '2': [24, 48], A: [36, 84], B: [36, 84], C: [24, 80], D: [30, 80] };
check('FT3', 'schedule sizes read back differ from the printed rows (1 30x60, 2 24x48, A 36x84, B 36x84, C 24x80, D 30x80 in)', Object.keys(exp).every(k => sched[k] && Math.abs(sched[k].width - exp[k][0] * IN) < 1e-6 && Math.abs(sched[k].height - exp[k][1] * IN) < 1e-6) && Object.keys(sched).length === 6, Object.keys(sched).sort().map(k => k + ' ' + (sched[k].width / IN).toFixed(2) + 'x' + (sched[k].height / IN).toFixed(2)).join(' | '));
const lib = JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', path.join(__dirname, '../../deploy/component_library.db'), "select family_id id, opening_type ot, default_width_mm w, default_height_mm h from ad_opening_family where is_active=1"], { encoding: 'utf8' }));
const LIB = { window: lib.filter(f => f.ot === 'WINDOW').map(f => ({ id: f.id, width: f.w / 1000, height: f.h / 1000 })), door: lib.filter(f => f.ot === 'DOOR').map(f => ({ id: f.id, width: f.w / 1000, height: f.h / 1000 })), wall: [] };
const allow = T.allowanceFromDesc(planB.desc, MK.UNITS);
const run1 = () => T.bindTypes(tagged.ops, LIB, { bind: { size_tol: 0.005 } }, { schedule: sched, allowance: allow });
const bound0 = T.bindTypes(tagged.ops, LIB, { bind: { size_tol: 0.005 } }, { schedule: sched });   // control: without the allowance marking
const conf0 = bound0.gaps.filter(g => g.params.code === 'GAP:schedule_conflict');
const bound = run1(), conf = bound.gaps.filter(g => g.params.code === 'GAP:schedule_conflict').sort((a, b) => a.params.handle < b.params.handle ? -1 : 1);
const cf = conf.map(g => g.params.label + ': ' + Object.keys(g.params.diff).map(k => k + ' schedule ' + (g.params.diff[k].schedule / IN).toFixed(2) + ' in vs measured ' + (g.params.diff[k].measured / IN).toFixed(2) + ' in').join(', '));
const byLabel = {}; conf.forEach(g => { (byLabel[g.params.label] = byLabel[g.params.label] || []).push(Object.keys(g.params.diff).join('+')); });
check('FT4', 'with the allowance marking the schedule conflicts are not exactly the two window heights (78 vs 60 in), or the allowance hid the height conflict, or the door still conflicts', J(byLabel) === J({ '1': ['height', 'height'] }) && conf.length === 2 && conf.every(g => g.params.diff.height.allowance === 0 && Math.abs(g.params.diff.height.measured - 78 * IN) < 1e-6 && Math.abs(g.params.diff.height.schedule - 60 * IN) < 1e-6), cf.join(' | '));
check('FT4c', 'control: without the allowance marking the three width conflicts (+1.5 in) are not reported (so the allowance marking does nothing)', conf0.length === 3 && conf0.filter(g => g.params.diff.width).length === 3 && conf0.filter(g => g.params.diff.height).length === 2, 'conflicts without allowance=' + conf0.length + ' (width ' + conf0.filter(g => g.params.diff.width).length + ', height ' + conf0.filter(g => g.params.diff.height).length + ')');
const strip = o => { const p = JSON.parse(J(o.params)); delete p.type; delete p.type_request; delete p.label; delete p.label_source; return J([o.op_type, p, o.output_guid]); };
check('FT5', 'labelling and binding changed outline fields of the ops', bound.ops.slice(0, ops0.length).map(strip).join() === ops0.map(strip).join(), 'outline fields identical for ' + ops0.length + ' ops');
const b2 = run1();
check('FT6', 'two runs differ', J(b2.ops) === J(bound.ops), 'ops=' + bound.ops.length);
const isOpening = g => g.params.class === 'window' || g.params.class === 'door';   // wall pieces have no wall types in this run (library wall list empty): not part of this check
const bt = bound.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.type), unb = bound.gaps.filter(g => g.params.code === 'GAP:type_unbound' && isOpening(g));
check('FT7', 'size matching bound a Farmhouse opening to a library product that matches neither schedule nor measurement', bt.every(o => o.params.type.delta && Math.abs(o.params.type.delta.width) <= 0.005 && Math.abs(o.params.type.delta.height) <= 0.005) && bt.length + unb.length === 3, 'bound=' + bt.length + ' type_unbound=' + unb.length + ' candidates=' + J(unb.map(g => g.params.candidates)) + ' measured(in)=' + J(unb.map(g => Object.fromEntries(Object.entries(g.params.measured).map(([k, v]) => [k, +(v / IN).toFixed(2)])))));
console.log('INFO conflicts: ' + cf.join(' | '));
console.log('INFO plan gap width minus schedule width (in): ' + opensT.map(o => o.params.label + ' ' + ((o.params.width - sched[o.params.label].width) / IN).toFixed(2)).join(', ') + ' (identical for window and door: 1.5 in)');
console.log('SUMMARY fail=' + fails);
