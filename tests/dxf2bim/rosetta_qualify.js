// ⚠ DO NOT REMOVE — ROSETTA L2 qualify verdict on REAL sets (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L2 / §L2.1). Reports the true list per set;
// asserts only what the spec claims (determinism, input untouched, Q2 = marking codes only, Q3 units+layers, Q5 mutation names its handle).
// It does NOT assert that the Duplex qualifies: the L1 standard set is pending, today's sheets carry envelope-only grids and exploded dims.
// Inputs (local, git-ignored): out/marked + out/marked_shell (run mark_dx_set.js, then rosetta_dx_shell.js), 2D_Layout/output/DXF, 2D_Layout/reference_samples,
// Farmhouse (Jay Osborne, CC BY-SA, never commit). Read the log after every run (rosetta_qualify.log); exit code is not evidence.
// Usage: node tests/dxf2bim/rosetta_qualify.js [farm_marked.dxf]
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DD = path.join(__dirname, '../../deploy/dev/');
const DxfParser = require(DD + 'dxf-parser.js'), B = require(DD + 'dxf2bim.js'), Q = require(DD + 'dxf2qualify.js');
const C = require('./set_configs.js');
const ROOT = path.join(__dirname, '../..');
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const J = JSON.stringify, parse = t => new DxfParser().parseSync(t);
const lines = []; let fails = 0;
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const MARKING = /^QF:(sheet_no_role|units_unstated|plan_no_level|mark_missing|mark_invalid|set_mismatch|set_no_plan|set_no_roof|plan_level_duplicate|face_no_elev)$/;

function report(name, v) {
  say('\n===== ' + name + ' =====');
  say('verdict=' + v.verdict + ' blocking=' + v.blocking.length + ' advisory=' + v.advisory.length + ' reference_plan=' + v.reference_plan);
  say('by_shape ' + J(v.by_shape));
  say('blocking by code ' + J(v.counts));
  const ac = {}; v.advisory.forEach(x => { ac[x.code] = (ac[x.code] || 0) + 1; }); say('advisory by code ' + J(ac));
  say('sheets ' + J(v.sheets.map(s => s.id + ':' + (s.view || '-') + (s.level !== null ? '@' + s.level : '') + (s.face ? '/' + s.face : '') + ' units=' + s.units + ' n=' + s.entities)));
  say('checks ' + J(v.checks) + ' conventions ' + J(v.conventions));
  v.blocking.forEach(x => say('  B ' + x.code + ' [' + x.shape + '] ' + x.sheet + ' h=' + x.handles.slice(0, 6).join(',') + (x.handles.length > 6 ? ',…(' + x.handles.length + ')' : '') + ' pos=' + J(x.pos) + ' | ' + x.message));
  v.advisory.forEach(x => say('  A ' + x.code + ' [' + x.shape + '] ' + x.sheet + ' h=' + x.handles.slice(0, 3).join(',') + ' | ' + x.message));
}
function twice(name, input, settings) {                                // determinism + the input is never changed (qualify only reports)
  const before = hashHex(J(input)), v1 = Q.qualify(input, settings), v2 = Q.qualify(input, settings), after = hashHex(J(input));
  check(name + ' det', 'the verdict differs between two runs (nondeterminism)', J(v1) === J(v2), 'sha ' + hashHex(J(v1)).slice(0, 16) + ' / ' + hashHex(J(v2)).slice(0, 16));
  check(name + ' ro', 'qualify changed its input (it must only report)', before === after, 'input sha ' + before.slice(0, 16) + ' -> ' + after.slice(0, 16));
  return v1;
}

// ================= Duplex marked (plans: out/marked; elevations + ROOF plan (@VIEW=ROOF, L2.3 D1): out/marked_shell) =================
const DX = C.DX, OUTM = path.join(__dirname, 'out/marked'), OUTS = path.join(__dirname, 'out/marked_shell');
const gapsFile = path.join(OUTS, 'dx_shell_gaps.json');
if (!fs.existsSync(gapsFile)) { say('REFUSED: ' + gapsFile + ' missing; run rosetta_dx_shell.js first'); process.exit(1); }
const G = JSON.parse(fs.readFileSync(gapsFile, 'utf8'));
const dxText = {
  DX_FLOOR_GF: fs.readFileSync(path.join(OUTM, 'DX_FLOOR_GF_marked.dxf'), 'utf8'), DX_FLOOR_FF: fs.readFileSync(path.join(OUTM, 'DX_FLOOR_FF_marked.dxf'), 'utf8'),
  DX_ROOF: fs.readFileSync(path.join(OUTS, 'DX_ROOF_shell.dxf'), 'utf8') };
['FRONT', 'REAR', 'LEFT', 'RIGHT'].forEach(f => { dxText['DX_' + f] = fs.readFileSync(path.join(OUTS, 'DX_' + f + '_shell.dxf'), 'utf8'); });
const stale = Object.keys(G.inputs).filter(k => G.inputs[k] !== hashHex(dxText[k]));
check('DX gaps fresh', 'the pipeline gaps were computed on other files than the ones qualified', stale.length === 0, 'variant ' + G.variant + ', ' + G.gaps.length + ' gap records, stale=' + J(stale));
const mapsOf = id => /FLOOR/.test(id) ? [DX.MAP_PLAN] : id === 'DX_ROOF' ? [DX.MAP_ROOF] : [DX.MAP_ELEV, DX.MAP_LEVL];
const dxParsed = {}; Object.keys(dxText).forEach(k => { dxParsed[k] = parse(dxText[k]); });
const dxFiles = Object.keys(dxText).sort().map(k => ({ name: k, dxf: dxParsed[k], layer_maps: mapsOf(k) }));
const deps = { DxfParser, hashHex, library: [] };
const planOps = { DX_FLOOR_GF: B.run(dxText.DX_FLOOR_GF, DX.MAP_PLAN, DX.CFG, deps).ops, DX_FLOOR_FF: B.run(dxText.DX_FLOOR_FF, DX.MAP_PLAN, DX.CFG, deps).ops };   // the plan call of rosetta_dx_shell
const vM = twice('DX marked', { files: dxFiles, plan_ops: planOps, gaps: G.gaps, resolved: G.resolved }, DX.QUALIFY);
report('Q1 Duplex marked set (today\'s sheets; L1 pending)', vM);

// ================= Q2 Duplex stripped (mark layer removed in memory; no pipeline can run without markings) =================
const strip = d => Object.assign({}, d, { entities: d.entities.filter(e => e.layer !== 'DXF2BIM-MARK') });
const stFiles = dxFiles.map(f => Object.assign({}, f, { dxf: strip(f.dxf) }));
const vS = twice('DX stripped', { files: stFiles }, DX.QUALIFY);
report('Q2 Duplex stripped', vS);
const key = x => x.code + '|' + x.sheet + '|' + x.handles.join(',');
const mKeys = new Set(vM.blocking.map(key)), only = vS.blocking.filter(x => !mKeys.has(key(x)));
check('Q2 only-marking', 'the stripped set is blocked by something other than the missing markings', only.every(x => MARKING.test(x.code)), 'new items=' + only.length + ' codes ' + J([...new Set(only.map(x => x.code))]));
const markedSheets = vM.sheets.filter(s => s.view).map(s => s.id);
const perSheet = markedSheets.map(id => only.filter(x => x.sheet === id && /sheet_no_role|units_unstated/.test(x.code)).length);
check('Q2 exact', 'a sheet that lost its markings is not listed (or listed more than once per code)', perSheet.every(n => n === 2), 'sheets that had markings ' + J(markedSheets) + ' -> no_role+units items ' + J(perSheet));

// ================= Q3 jscad (no markings; header mm; SANDBOX map) =================
const jtxt = fs.readFileSync(path.join(ROOT, '2D_Layout/reference_samples/jscad_floorplan.dxf'), 'utf8');
const jr = B.run(jtxt, C.JSCAD.MAP, C.JSCAD.CFG, deps);                        // as t8_sandbox.js
const vJ = twice('jscad', { files: [{ name: 'jscad_floorplan', dxf: parse(jtxt), layer_maps: [C.JSCAD.MAP] }], gaps: jr.report.gaps.map(g => Object.assign({ sheet: 'jscad_floorplan' }, g)) }, C.JSCAD.QUALIFY);
report('Q3 jscad', vJ);
const uc = vJ.blocking.find(x => x.code === 'QF:units_conflict');
check('Q3 units', 'header mm vs the drawing\'s own feet-inch dimensions not reported', !!uc && J(uc.implied) === J(['in']), uc ? uc.message : 'no units_conflict');
check('Q3 layers', 'unmapped layers not reported', vJ.blocking.some(x => x.code === 'QF:layer_unmapped'), 'layer_unmapped=' + vJ.blocking.filter(x => x.code === 'QF:layer_unmapped').map(x => x.detail || x.layer).join(','));

// ================= Q4 Farmhouse marked (two regions) =================
const farmPath = process.argv[2] || path.join(__dirname, 'external/farmhouse/farm_marked.dxf');
const ftxt = fs.readFileSync(farmPath, 'utf8'), fparsed = parse(ftxt);
const ffiles = [{ name: 'farm_marked', dxf: fparsed, layer_maps_by_view: { PLAN: [C.FARM.MAP] } }];
const fsheets = Q.sheets(ffiles), fplan = fsheets.find(s => s.view === 'PLAN');
const MK = require(DD + 'dxf2marks.js'), fviews = MK.describeAll(MK.readMarks(fparsed.entities)), fpv = fviews.find(v => v.desc.view === 'PLAN');
const fr = B.run(ftxt, C.FARM.MAP, C.FARM.CFG, { DxfParser, hashHex, library: [], region: fpv.region, exclude: fpv.desc.excludes });   // as farm_walls/farm_heights
say('\nFarmhouse sheets ' + J(fsheets));
const farmInput = { files: ffiles, plan_ops: { [fplan.id]: fr.ops }, gaps: fr.report.gaps.map(g => Object.assign({ sheet: fplan.id }, g)) };
const vF = twice('Farm', farmInput, C.FARM.QUALIFY);
report('Q4 Farmhouse marked', vF);

// ================= Q5 mutation: one real DIMENSION gets a wrong text override =================
function mutateDim(txt, handle, text) {                                // insert group 1 right after the entity's handle (group 5)
  const L = txt.split(/\r?\n/); for (let i = 0; i + 1 < L.length; i += 2) {
    if (L[i].trim() === '0' && L[i + 1].trim() === 'DIMENSION') { for (let j = i + 2; j + 1 < L.length && L[j].trim() !== '0'; j += 2) if (L[j].trim() === '5' && L[j + 1].trim() === handle) { L.splice(j + 2, 0, '  1', text); return L.join('\n'); } }
  }
  throw new Error('mutateDim: no DIMENSION ' + handle);
}
const fsh = Q.qualify(farmInput, C.FARM.QUALIFY);
const okDims = fparsed.entities.filter(e => e.type === 'DIMENSION' && e.text === undefined && ((e.dimensionType || 0) & 7) === 0)
  .filter(e => !vF.blocking.concat(vF.advisory).some(x => x.handles.indexOf(e.handle) >= 0))
  .filter(e => [e.anchorPoint, e.linearOrAngularPoint1, e.linearOrAngularPoint2].every(p => p && p.x >= fpv.region[0] && p.x <= fpv.region[2] && p.y >= fpv.region[1] && p.y <= fpv.region[3]))
  .sort((a, b) => parseInt(a.handle, 16) - parseInt(b.handle, 16));
const victim = okDims[0];
say('\nQ5 victim: DIMENSION ' + victim.handle + ' measured ' + victim.actualMeasurement + ' (in), block text ' + J((fparsed.blocks[victim.block].entities || []).filter(x => /TEXT/.test(x.type)).map(x => x.text)) + ' -> override "99\'-9\\""');
const mtxt = mutateDim(ftxt, victim.handle, "99'-9\"");
const vQ5 = Q.qualify(Object.assign({}, farmInput, { files: [{ name: 'farm_marked', dxf: parse(mtxt), layer_maps_by_view: { PLAN: [C.FARM.MAP] } }] }), C.FARM.QUALIFY);
const fKeys = new Set(fsh.blocking.map(key)), q5new = vQ5.blocking.filter(x => !fKeys.has(key(x)));
q5new.forEach(x => say('  Q5 new B ' + x.code + ' ' + x.sheet + ' h=' + x.handles.join(',') + ' pos=' + J(x.pos) + ' | ' + x.message));
check('Q5 mutation', 'a doctored DIMENSION text is not reported, or not with its handle', q5new.length === 1 && q5new[0].code === 'QF:dim_text_mismatch' && q5new[0].handles[0] === victim.handle && fsh.blocking.length + 1 === vQ5.blocking.length,
  'new blocking items=' + q5new.length + ' ' + J(q5new.map(x => x.code + ':' + x.handles[0])) + ' total ' + fsh.blocking.length + ' -> ' + vQ5.blocking.length);
say('Q5 on Duplex: not applicable today, the Duplex sheets hold ' + Object.values(dxParsed).reduce((n, d) => n + d.entities.filter(e => e.type === 'DIMENSION').length, 0) + ' DIMENSION entities (dimensions are exploded LINE+TEXT, reported as QF:dim_not_entity)');

// ================= L2.3 convergence: the L1 standard set, marked from the model (mark_dx_set.js std), pipeline gaps from DXSET=std rosetta_dx_shell =================
const STD = C.STD, OSM = path.join(__dirname, 'out/marked_std'), OSS = path.join(__dirname, 'out/marked_std_shell'), sgFile = path.join(OSS, 'dx_shell_gaps.json');
if (!fs.existsSync(sgFile)) { say('REFUSED: ' + sgFile + ' missing; run mark_dx_set.js std, then DXSET=std rosetta_dx_shell.js'); fails++; }
else {
  const SG = JSON.parse(fs.readFileSync(sgFile, 'utf8'));
  const stText = { DX_FLOOR_GF: fs.readFileSync(path.join(OSM, 'DX_FLOOR_GF_marked.dxf'), 'utf8'), DX_FLOOR_FF: fs.readFileSync(path.join(OSM, 'DX_FLOOR_FF_marked.dxf'), 'utf8') };
  ['FRONT', 'REAR', 'LEFT', 'RIGHT'].forEach(f => { stText['DX_' + f] = fs.readFileSync(path.join(OSS, 'DX_' + f + '_shell.dxf'), 'utf8'); });
  const sStale = Object.keys(SG.inputs).filter(k => SG.inputs[k] !== hashHex(stText[k] || ''));
  check('STD gaps fresh', 'the std pipeline gaps were computed on other files than the ones qualified', sStale.length === 0 && Object.keys(SG.inputs).length === Object.keys(stText).length, SG.gaps.length + ' gap records, stale=' + J(sStale));
  const stMaps = id => /FLOOR/.test(id) ? [STD.MAP_PLAN] : [STD.MAP_ELEV, STD.MAP_LEVL, STD.EXCL_ELEV];
  const stOps = { DX_FLOOR_GF: B.run(stText.DX_FLOOR_GF, STD.MAP_PLAN, DX.CFG, deps).ops, DX_FLOOR_FF: B.run(stText.DX_FLOOR_FF, STD.MAP_PLAN, DX.CFG, deps).ops };
  const stInput = txts => ({ files: Object.keys(txts).sort().map(k => ({ name: k, dxf: parse(txts[k]), layer_maps: stMaps(k) })), plan_ops: stOps, gaps: SG.gaps, resolved: SG.resolved });
  const vStd = twice('STD marked', stInput(stText), STD.QUALIFY);
  report('L2.3 std set (L1 writer, marked from the model)', vStd);
  // the same with the interior-wall convention stated (what the L4 editor would write when the USER states it; never a default)
  const MKm = require(DD + 'dxf2marks.js'), wt = Object.assign({}, stText);
  ['DX_FLOOR_GF', 'DX_FLOOR_FF'].forEach(k => { const lv = MKm.describe(MKm.readMarks(parse(stText[k]).entities)).desc.level; wt[k] = MKm.writeMarks(stText[k], [{ text: '@WALLTOP=' + lv + ',slab_above' }]); });
  const vW = Q.qualify(Object.assign(stInput(wt), { plan_ops: { DX_FLOOR_GF: B.run(wt.DX_FLOOR_GF, STD.MAP_PLAN, DX.CFG, deps).ops, DX_FLOOR_FF: B.run(wt.DX_FLOOR_FF, STD.MAP_PLAN, DX.CFG, deps).ops } }), STD.QUALIFY);
  report('L2.3 std set + @WALLTOP=<level>,slab_above on both plans (USER-STATED convention, simulated here; not written by any marking tool)', vW);
  check('STD walltop', 'the stated convention did not cover the interior wall-height gaps, or was not recorded as user-stated', vW.conventions.length === 2 && vW.conventions.every(c => c.source === 'user-stated') && !vW.blocking.some(x => x.code === 'GAP:no_elevation_height' && /WALL/.test((x.detail || {}).layer || '')),
    'conventions=' + J(vW.conventions.map(c => c.level + ':' + c.rule + ':' + c.source)) + ' wall no_elevation_height left=' + vW.blocking.filter(x => x.code === 'GAP:no_elevation_height').length);
}

say('\nSUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'rosetta_qualify.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
