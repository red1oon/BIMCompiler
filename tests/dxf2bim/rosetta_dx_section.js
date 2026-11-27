// ⚠ DO NOT REMOVE — ROSETTA section (bim-ootb lane spec DXF2BIM_MODELLER_LANE.md §L1.4 F5): slab top/underside and roof read from the
// std building section (2D_Layout/output/STD/DX_SECTION_std.dxf, written by std2d.py) and compared with the source model (answer key,
// read only here). Marking step: a COPY of the sheet gets the §L1.4 SECTION markings from evidence in the sheet (title, A-GRID lines +
// labels, A-ANNO-LEVL level texts) until mark_dx_set.js std does it (L2's script). Needs `mark_dx_set.js std` first (plan @LEVEL/@GRID).
// Read the log after every run; exit code is not evidence. Usage: node tests/dxf2bim/rosetta_dx_section.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const S = require(path.join(__dirname, '../../deploy/dev/dxf2shell.js'));
const C = require(path.join(__dirname, '../../deploy/dev/dxf2shell_config.js'));
const STD = require('./set_configs.js').STD;
const ROOT = path.join(__dirname, '../..');
const SRC = path.join(ROOT, '2D_Layout/output/STD/DX_SECTION_std.dxf'), OSM = path.join(__dirname, 'out/marked_std'), OUT = path.join(__dirname, 'out/section_std');
const DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db');
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8' }) || '[]');
const parse = t => new DxfParser().parseSync(t), J = JSON.stringify;
let fails = 0; const lines = [];
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const TOL = 0.0005;   // m: drawing (0.01 mm) vs model

// ---------------- marking step (evidence only) ----------------
function markSection(txt, planGF) {
  const d = parse(txt), why = [];
  if (d.header.$INSUNITS !== 4) return { refused: '$INSUNITS=' + d.header.$INSUNITS };
  const title = d.entities.filter(e => e.type === 'TEXT' && /^SECTION .* AT ([XY])=(-?\d+(\.\d+)?)\b/.test((e.text || '').trim()));
  if (title.length !== 1) return { refused: 'section titles with AT X|Y=… found=' + title.length };
  const tm = /AT ([XY])=(-?\d+(?:\.\d+)?)/.exec(title[0].text);
  const marks = [{ text: '@SET=' + planGF.set }, { text: '@VIEW=SECTION' }, { text: '@UNITS=mm' }, { text: '@NAME=' + title[0].text.trim().replace(/\s+1:\d+$/, '') }, { text: '@CUT=' + tm[1] + ',' + tm[2] }];
  why.push('CUT ' + tm[1] + '=' + tm[2] + ' [title ' + title[0].handle + ']');
  const T = d.entities.filter(e => e.type === 'TEXT' && /^[A-Z0-9]$/.test((e.text || '').trim()));
  const gh = {};
  d.entities.filter(e => e.layer === 'A-GRID' && e.type === 'LINE' && Math.abs(e.vertices[0].x - e.vertices[1].x) <= 1e-6).forEach(l => {
    const c = l.vertices[0].x, lo = Math.min(l.vertices[0].y, l.vertices[1].y);
    const cand = [...new Set(T.filter(t => { const p = t.startPoint || t.position; return Math.abs(p.x - c) <= 60 && Math.abs(p.y - lo) <= 700; }).map(t => t.text.trim()))];
    if (cand.length === 1) gh[cand[0]] = c;
  });
  const shared = Object.keys(gh).filter(k => k in planGF.gridsY);
  const fits = [1, -1].filter(sg => { const offs = shared.map(k => planGF.gridsY[k] - sg * gh[k]); return shared.length >= 2 && Math.max(...offs) - Math.min(...offs) <= 1; });
  if (fits.length !== 1) return { refused: 'HAXIS fits=' + fits.length + ' shared labels ' + J(shared) };
  marks.push({ text: '@HAXIS=' + (fits[0] > 0 ? '+' : '-') + 'Y' });
  Object.keys(gh).sort().forEach(k => marks.push({ text: '@GRIDH=' + k, x: gh[k], y: 0 }));
  why.push('HAXIS ' + (fits[0] > 0 ? '+' : '-') + 'Y GRIDH ' + J(gh));
  d.entities.filter(e => e.type === 'TEXT' && e.layer === 'A-ANNO-LEVL' && /\s([+-]\d+\.\d+)\s*$/.test(e.text || '')).forEach(e => {
    const z = Number(/([+-]\d+\.\d+)\s*$/.exec(e.text.trim())[1]), ln = d.entities.find(x => x.layer === 'A-ANNO-LEVL' && x.type === 'LINE' && Math.abs(x.vertices[0].y - 1000 * z) <= 1 && Math.abs(x.vertices[1].y - x.vertices[0].y) <= 1e-9);
    if (ln) { marks.push({ text: '@Z=' + z, x: 0, y: ln.vertices[0].y }); why.push('Z ' + z + ' [line ' + ln.handle + ', text "' + e.text.trim() + '"]'); }
    if (/^T\/ROOF\s/.test(e.text.trim())) { marks.push({ text: '@ROOF=' + z }); why.push('ROOF ' + z + ' [text ' + e.handle + ']'); }
  });
  return { text: MK.writeMarks(txt, marks), why };
}

// ---------------- answer key (source model) at the cut ----------------
function sourceAt(x) {
  const at = (q) => sql(q + ' and r.minX < ' + x + ' and r.maxX > ' + x);
  const slab = L => at("select m.storey s, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcSlab' and abs(r.maxZ - " + L + ') < 0.0005');
  const roofE = sql("select max(r.maxZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcRoof'")[0].z;
  const roofQ = typeof roofE === 'number' ? "m.ifc_class='IfcRoof'" : "m.ifc_class='IfcSlab' and r.maxZ = (select max(r2.maxZ) from elements_meta m2 join elements_rtree r2 on r2.id=m2.id where m2.ifc_class='IfcSlab')";
  return { slab, roof: at('select r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where ' + roofQ) };
}

function read(txt, planGF, levels) {
  const d = parse(txt), de = MK.describe(MK.readMarks(d.entities)), al = MK.align(planGF, de.desc, C.MARK_ALIGN_TOL);
  if (!al.map) return { errors: de.errors.concat(al.errors) };
  return { desc: de.desc, errors: de.errors, sect: S.sectionSlabs(d.entities, STD.MAP_SECT, al.map, levels, C.CFG, de.desc.roof) };
}

function witness(tag, r, src) {
  const L1 = r.sect.slabs['0'], L2 = r.sect.slabs['3.1'], RF = r.sect.roof, s1 = src.slab(3.1), s0 = src.slab(0);
  const eq = (got, rows) => got && rows.length && rows.every(q => Math.abs(q.z0 - got.bottom) <= TOL && Math.abs(q.z1 - got.top) <= TOL);
  const ok1 = eq(L2, s1), ok2 = eq(L1, s0), ok3 = eq(RF, src.roof);
  check('SX1' + tag, 'FF slab top/underside read from the section differ from the source IfcSlab at the cut (old set took it from wall ends)', ok1,
    'section ' + (L2 ? L2.bottom + '..' + L2.top + ' t=' + L2.thickness + ' from ' + J(L2.from) : 'none') + ' | source ' + J(s1.map(q => [q.s, +q.z0.toFixed(4), +q.z1.toFixed(4)])));
  check('SX2' + tag, 'GF slab from the section differs from the source', ok2, 'section ' + (L1 ? L1.bottom + '..' + L1.top : 'none') + ' | source ' + J(s0.map(q => [q.s, +q.z0.toFixed(4), +q.z1.toFixed(4)])));
  check('SX3' + tag, 'roof bottom/top from the section differ from the source roof element', ok3, 'section ' + (RF ? RF.bottom + '..' + RF.top : 'none') + ' | source ' + J(src.roof.map(q => [+q.z0.toFixed(4), +q.z1.toFixed(4)])));
  return ok1 && ok2 && ok3;
}

if (!fs.existsSync(SRC) || !fs.existsSync(path.join(OSM, 'DX_FLOOR_GF_marked.dxf'))) { say('REFUSED: need ' + SRC + ' (std2d.py) and out/marked_std (mark_dx_set.js std)'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const planGF = MK.describe(MK.readMarks(parse(fs.readFileSync(path.join(OSM, 'DX_FLOOR_GF_marked.dxf'), 'utf8')).entities)).desc;
const planFF = MK.describe(MK.readMarks(parse(fs.readFileSync(path.join(OSM, 'DX_FLOOR_FF_marked.dxf'), 'utf8')).entities)).desc;
const levels = [planGF.level, planFF.level];
const raw = fs.readFileSync(SRC, 'utf8'), mk = markSection(raw, planGF);
if (mk.refused) { say('MARK-SECTION: REFUSED ' + mk.refused); process.exit(1); }
mk.why.forEach(w => say('MARK-SECTION ' + w));
fs.writeFileSync(path.join(OUT, 'DX_SECTION_marked.dxf'), mk.text);
const r = read(mk.text, planGF, levels);
check('SX0', 'the marked section is rejected by the marking reader / alignment (format of §L1.4 not met)', !!r.sect && r.errors.length === 0, 'errors=' + J(r.errors) + ' cut=' + (r.desc && r.desc.cut) + ' haxis=' + (r.desc && r.desc.haxis));
if (!r.sect) { say('SUMMARY fail=' + fails); process.exit(1); }
say('section reader: slabs ' + J(r.sect.slabs) + ' roof ' + J(r.sect.roof) + ' gaps ' + J(r.sect.gaps));
const x = Number(r.desc.cut.split(',')[1]) * MK.UNITS[r.desc.units], src = sourceAt(x);
witness('', r, src);
const r2 = read(mk.text, planGF, levels);
check('SX-det', 'two reads of the same marked section differ', J(r2.sect) === J(r.sect), 'equal=' + (J(r2.sect) === J(r.sect)));
// slabZ uses the section (L1.4): FF slab from the section, no elevation tops
const sz = S.slabZ({ level: planFF.level, ops: [] }, null, C.CFG, { section: r.sect });
check('SX-slabZ', 'slabZ does not take the section underside', sz.source === 'section' && sz.bottom === r.sect.slabs['3.1'].bottom && sz.top === 3.1, J(sz));
// control: FF slab underside moved 50 mm down in a copy -> SX1 must FAIL
const d0 = parse(mk.text), ffh = r.sect.slabs['3.1'].from[0];
const ent = d0.entities.find(e => e.handle === ffh), y0 = Math.min(...ent.vertices.map(v => v.y));
let lines2 = mk.text.split('\n'), inE = false, done = 0;
for (let i = 0; i + 1 < lines2.length; i += 2) {
  if (lines2[i].trim() === '5' && lines2[i + 1].trim() === ffh) inE = true; else if (lines2[i].trim() === '0') inE = false;
  if (inE && lines2[i].trim() === '20' && Math.abs(Number(lines2[i + 1]) - y0) <= 1e-6) { lines2[i + 1] = String(y0 - 50); done++; }
}
const nNow = fails, rc = read(lines2.join('\n'), planGF, levels);
say('-- SX-control: S-SLAB ' + ffh + ' underside moved 50 mm (' + done + ' vertices) in a copy; SX1 must FAIL --');
witness('-control', rc, src);
const c1 = lines.slice(-3).some(l => l.startsWith('FAIL SX1-control'));
fails = nNow;
check('SX-mutation', 'SX1 cannot see a moved slab underside', c1 && done >= 2, 'control SX1 ' + (c1 ? 'FAILED as required' : 'PASSED: blind') + ' (reader now ' + J(rc.sect && rc.sect.slabs['3.1']) + ')');
say('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(OUT, 'rosetta_dx_section.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
