// ⚠ DO NOT REMOVE — @LAYER=<name>,<type> marking tests (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L4.2). Each check names its issue.
// Read the log (test_layer_marks.log) after every run; exit code is not evidence. Usage: node tests/dxf2bim/test_layer_marks.js
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const DD = path.join(__dirname, '../../deploy/dev/');
const DxfParser = require(DD + 'dxf-parser.js'), MK = require(DD + 'dxf2marks.js'), B = require(DD + 'dxf2bim.js');
const g = (c, v) => c + '\n' + v + '\n';
const base = g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 4) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
  g(0, 'LWPOLYLINE') + g(5, 'A1') + g(8, 'X,WALLS') + g(90, 4) + g(70, 1) + g(10, 0) + g(20, 0) + g(10, 5000) + g(20, 0) + g(10, 5000) + g(20, 200) + g(10, 0) + g(20, 200) + g(0, 'ENDSEC') + g(0, 'EOF');
const T = (text, x, y) => ({ text: text, x: x || 0, y: y || 0 });
const read = marks => MK.describe(MK.readMarks(new DxfParser().parseSync(MK.writeMarks(base, marks)).entities));
const PLAN = ['@SET=T', '@VIEW=PLAN', '@LEVEL=0', '@UNITS=mm'].map(t => T(t)).concat([T('@GRIDX=A', 0, 5), T('@GRIDX=B', 8800, 5), T('@GRIDY=1', 5, 0), T('@GRIDY=2', 5, 200)]);
const lines = []; let fails = 0;
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const J = JSON.stringify, codes = r => r.errors.map(e => e.code);

// LM1 grammar: the name is everything before the LAST comma (a name may hold commas); @BY kept per marking
const r1 = read(PLAN.concat([T('@LAYER=X,WALLS,wall @BY=user'), T('@LAYER=A-FURN,ignore')]));
check('LM1', 'a layer name holding a comma, the type, or the @BY source is read wrongly', !r1.errors.length && J(r1.desc.layers.map(q => [q.layer, q.type, q.by])) === J([['A-FURN', 'ignore', 'file'], ['X,WALLS', 'wall', 'user']]), J(r1.desc.layers) + ' errors=' + J(codes(r1)));
// LM2 malformed / conflict
const r2a = read(PLAN.concat([T('@LAYER=wall')])), r2b = read(PLAN.concat([T('@LAYER=X,')])), r2c = read(PLAN.concat([T('@LAYER=X,wall'), T('@LAYER=X,ignore')]));
check('LM2', 'a @LAYER without name or type is accepted, or one layer with two types is not a conflict', codes(r2a).includes('MARK:malformed') && codes(r2b).includes('MARK:malformed') && codes(r2c).includes('MARK:conflict'), J([codes(r2a), codes(r2b), codes(r2c)]));
// LM3 the type must be one the reader of THAT view accepts (+ dims / grid); checked whatever the marker order
const r3a = read(PLAN.concat([T('@LAYER=X,elevwall')]));
const r3b = read([T('@LAYER=Y,wall')].concat(['@SET=T', '@VIEW=ELEV', '@FACE=minY', '@HAXIS=+X', '@UNITS=mm'].map(t => T(t)), [T('@GRIDH=A', 0, 0), T('@GRIDH=B', 8800, 0), T('@Z=0', 0, 0), T('@Z=3', 0, 3000)]));
const r3c = read(PLAN.concat([T('@LAYER=X,grid'), T('@LAYER=D,dims')]));
check('LM3', 'a type the view\'s reader does not read is accepted (or dims / grid refused)', codes(r3a).includes('MARK:layer_type') && !(r3a.desc.layers || []).length && codes(r3b).includes('MARK:layer_type') && !codes(r3c).length && r3c.desc.layers.length === 2,
  'PLAN elevwall=' + J(codes(r3a)) + ' ELEV wall (stated before @VIEW)=' + J(codes(r3b)) + ' PLAN grid+dims=' + J(codes(r3c)));
// LM4 order independence + no @LAYER = no field (existing descriptions unchanged)
const r4 = read(PLAN.concat([T('@LAYER=A-FURN,ignore'), T('@LAYER=X,WALLS,wall')]).reverse());
check('LM4', 'the description depends on marker order, or a sheet without @LAYER gains a field', J(r4.desc.layers.map(q => [q.layer, q.type])) === J(r1.desc.layers.map(q => [q.layer, q.type])) && read(PLAN).desc.layers === undefined, J(r4.desc.layers.map(q => q.layer)));
// LM5 withLayers: the stated rule comes first (overrides the set's rule for that layer only); dims / grid are 'ignore' for the readers
const SET = { version: 1, rules: [{ match: 'exact', pattern: 'A-FURN', type: 'wall' }, { match: 'exact', pattern: 'A-WALL', type: 'wall' }] };
const wl = MK.withLayers(SET, r1.desc), wg = MK.withLayers(SET, r3c.desc);
check('LM5', 'a stated layer rule does not override the set\'s rule, or touches another layer', B.matchRule('A-FURN', wl.rules).type === 'ignore' && B.matchRule('A-WALL', wl.rules).type === 'wall' && B.matchRule('X,WALLS', wl.rules).type === 'wall' &&
  MK.withLayers(SET, read(PLAN).desc) === SET && B.matchRule('X', wg.rules).type === 'ignore', J(wl.rules.slice(0, 3)));
// LM8 (bim-ootb lane L7.10) BODY kinds: valid on ANY view, mapped to 'ignore' for the existing readers, an unknown kind still refused
const ELEVM = ['@SET=T', '@VIEW=ELEV', '@FACE=minY', '@HAXIS=+X', '@UNITS=mm'].map(t => T(t)).concat([T('@GRIDH=A', 0, 0), T('@GRIDH=B', 8800, 0), T('@Z=0', 0, 0), T('@Z=3', 0, 3000)]);
const r8a = read(PLAN.concat([T('@LAYER=Col,column'), T('@LAYER=Bm,beam')])), r8b = read(ELEVM.concat([T('@LAYER=Col,column')])), r8c = read(PLAN.concat([T('@LAYER=Col,flux')]));
const w8 = MK.withLayers({ version: 1, rules: [{ match: 'exact', pattern: 'Col', type: 'wall' }] }, r8a.desc);
check('LM8', 'a BODY kind is refused on a view, an unknown kind is accepted, or a typed body layer is still read as a wall by the existing readers',
  !r8a.errors.length && J(r8a.desc.layers.map(q => q.type).sort()) === J(['beam', 'column']) && !r8b.errors.some(e => e.code === 'MARK:layer_type') && r8b.desc.layers.length === 1 && codes(r8c).includes('MARK:layer_type') && B.matchRule('Col', w8.rules).type === 'ignore' && MK.LAYER_TYPES.BODY.length === 8 && MK.LAYER_TYPES.BODY.includes('wallpanel') && MK.LAYER_TYPES.BODY.includes('wallpair'),
  'PLAN ' + J(codes(r8a)) + ' ELEV ' + J(r8b.desc.layers.map(q => q.type)) + ' unknown kind ' + J(codes(r8c)) + ' Col overrides the set wall rule -> ' + B.matchRule('Col', w8.rules).type);
// LM9 (bim-ootb lane L7.14) @BODYZ=<kind>,<z0>,<z1>: the z range the user states for a body kind no elevation shows
const r9a = read(PLAN.concat([T('@BODYZ=footing,-1.4478,-1.143'), T('@BODYZ=gradebeam,-0.3,0')])), r9b = read(PLAN.concat([T('@BODYZ=flux,0,1')])), r9c = read(PLAN.concat([T('@BODYZ=footing,1,0')])), r9d = read(PLAN.concat([T('@BODYZ=footing,0,1'), T('@BODYZ=footing,0,2')]));
check('LM9', '@BODYZ is accepted for a non-body kind or an inverted range, a conflicting restatement is not a conflict, or a sheet without it gains a field wrongly',
  !r9a.errors.length && J(r9a.desc.bodyz.map(q => [q.kind, q.z0, q.z1])) === J([['footing', -1.4478, -1.143], ['gradebeam', -0.3, 0]]) && codes(r9b).includes('MARK:malformed') && codes(r9c).includes('MARK:malformed') && codes(r9d).includes('MARK:conflict') && J(read(PLAN).desc.bodyz) === '[]',
  J(r9a.desc.bodyz) + ' flux ' + J(codes(r9b)) + ' inverted ' + J(codes(r9c)) + ' two ranges ' + J(codes(r9d)));
// LM6 the PLAN list is exactly what the plan reader accepts: every listed type runs, a type outside it throws
const IDN = { DxfParser, hashHex: s => crypto.createHash('sha256').update(s).digest('hex'), library: [] }, CFG = { version: 1, units: 'mm', snap_tol: 0.001, wall: { thickness: 0.2, height: 3, base: 0 } };
const runs = MK.LAYER_TYPES.PLAN.map(t => { try { B.run(base, { version: 1, rules: [{ match: 'exact', pattern: 'X,WALLS', type: t }] }, CFG, IDN); return null; } catch (e) { return t + ': ' + e.message; } }).filter(Boolean);
let thrown = null; try { B.run(base, { version: 1, rules: [{ match: 'exact', pattern: 'X,WALLS', type: 'elevwall' }] }, CFG, IDN); } catch (e) { thrown = e.message; }
check('LM6', 'the PLAN @LAYER types are not the plan reader\'s own (a listed type refused, or an unlisted one accepted)', runs.length === 0 && !!thrown, 'refused=' + J(runs) + ' elevwall -> ' + thrown);
// LM7 mutation on the reader: the wall layer stated 'ignore' -> the plan reads no wall
const opsOf = d => B.run(base, MK.withLayers({ version: 1, rules: [{ match: 'exact', pattern: 'X,WALLS', type: 'wall' }] }, d), CFG, IDN).ops.filter(o => o.op_type === 'DXF_WALL').length;
check('LM7', 'a stated @LAYER does not reach the pipeline (mutation: the wall layer stated ignore still makes walls)', opsOf(read(PLAN).desc) > 0 && opsOf(read(PLAN.concat([T('@LAYER=X,WALLS,ignore')])).desc) === 0,
  'walls without @LAYER=' + opsOf(read(PLAN).desc) + ' with @LAYER=X,WALLS,ignore=' + opsOf(read(PLAN.concat([T('@LAYER=X,WALLS,ignore')])).desc));
say('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_layer_marks.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
