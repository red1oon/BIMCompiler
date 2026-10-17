// ⚠ DO NOT REMOVE — W-MARKS (lane spec §L5.1 c / §L5.6 S5a): the markings the Modeller derives from the model equal what mark_dx_set.js std writes.
// Issue it proves/disproves: "the JS marker writes different markings than the proven Duplex marker". Oracle = mark_dx_set.js std run on the SAME JS-written
// std set (so DXF handles agree). Excluded and stated: @SET/@NAME (naming), window @TAG (Duplex family map in the oracle; the model names no library product), per-handle @WALLTOP (INFO line).
// Needs the old-schema DX_extracted.db (2D_Layout/input) for the oracle only. Control: one doctored mark must FAIL.
// Usage: node tests/dxf2bim/witness_std2d_marks.js <Node model DB> <PREFIX> [node_modules dir]
'use strict';
const path = require('path'), fs = require('fs'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.join(__dirname, '../..'), db = process.argv[2], prefix = process.argv[3], nm = process.argv[4] || path.join(ROOT, 'node_modules');
const Database = require(path.join(nm, 'better-sqlite3')), DD = path.join(ROOT, 'deploy/dev/');
const S = require(DD + 'std2d.js'), M = require(DD + 'std2d_marks.js'), DxfParser = require(DD + 'dxf-parser.js'), B = require(DD + 'dxf2bim.js'), MK = require(DD + 'dxf2marks.js'), SHC = require(DD + 'dxf2shell_config.js');
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const con = new Database(db, { readonly: true });
const R = S.writeStdSet(sql => con.prepare(sql).all(), prefix);
const D = M.deriveMarks(R, { B, DxfParser, hashHex, MK, SHC }, { set: 'DX' });
const STDDIR = path.join(ROOT, '2D_Layout/output/STD'); fs.rmSync(STDDIR, { recursive: true, force: true }); fs.mkdirSync(STDDIR, { recursive: true });
Object.entries(R.files).forEach(([n, t]) => fs.writeFileSync(path.join(STDDIR, n), t));
fs.rmSync(path.join(__dirname, 'out'), { recursive: true, force: true });
cp.execFileSync('node', [path.join(__dirname, 'mark_dx_set.js'), 'std', db], { stdio: 'ignore' });
const marksOf = txt => new DxfParser().parseSync(txt).entities.filter(e => e.layer === 'DXF2BIM-MARK').map(e => { const p = e.startPoint || e.position || {}; return { t: (e.text || '').trim(), x: Math.round((p.x || 0) * 100) / 100, y: Math.round((p.y || 0) * 100) / 100 }; });
const norm = ms => ms.filter(m => !/^@(SET|NAME)=/.test(m.t) && !/^@TAG=window/.test(m.t) && !/^@WALLTOP=handle:/.test(m.t)).map(m => `${m.t} ${m.x} ${m.y}`).sort();
const pairs = [['FLOOR_LEVEL_1', 'DX_FLOOR_GF_marked.dxf', 'marked_std'], ['FLOOR_LEVEL_2', 'DX_FLOOR_FF_marked.dxf', 'marked_std'], ['ROOF', 'DX_ROOF_marked.dxf', 'marked_std'], ['SECTION', 'DX_SECTION_marked.dxf', 'marked_std'],
  ['FRONT', 'DX_FRONT_marked.dxf', 'marked_std'], ['REAR', 'DX_REAR_marked.dxf', 'marked_std'], ['LEFT', 'DX_LEFT_marked.dxf', 'marked_std'], ['RIGHT', 'DX_RIGHT_marked.dxf', 'marked_std']];
let fails = 0;
function compare(js, orc) { const a = norm(js), b = norm(orc), sa = new Set(a), sb = new Set(b); return { onlyJs: a.filter(x => !sb.has(x)), onlyOr: b.filter(x => !sa.has(x)), n: a.length, m: b.length }; }
for (const [view, file, dir] of pairs) {
  const jf = prefix + '_' + view + '_std.dxf', op = path.join(__dirname, 'out', dir, file);
  const orcPath = fs.existsSync(op) ? op : path.join(__dirname, 'out/marked_std_shell', file.replace('_marked', '_shell'));
  const c = compare(marksOf(D.files[jf]), marksOf(fs.readFileSync(orcPath, 'utf8')));
  const wt = m => m.filter(x => /^@WALLTOP=handle:/.test(x.t)).length, wj = wt(marksOf(D.files[jf])), wo = wt(marksOf(fs.readFileSync(orcPath, 'utf8')));
  if (wj !== wo) console.log(`  INFO ${view}: per-handle @WALLTOP exceptions js=${wj} oracle=${wo} (extractor geometry differs, stated)`);
  const ok = !c.onlyJs.length && !c.onlyOr.length; if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} W-MARKS[${view}] | JS markings == mark_dx_set std | js=${c.n} oracle=${c.m}${ok ? '' : '\n   onlyJS ' + c.onlyJs.slice(0, 4).join(' | ') + '\n   onlyOracle ' + c.onlyOr.slice(0, 4).join(' | ')}`);
}
const ctl = compare(marksOf(D.files[prefix + '_FRONT_std.dxf']).map(m => (/^@Z=/.test(m.t) ? Object.assign({}, m, { y: m.y + 5 }) : m)), marksOf(fs.readFileSync(path.join(__dirname, 'out/marked_std/DX_FRONT_marked.dxf'), 'utf8')));
console.log(`${ctl.onlyJs.length ? 'PASS' : 'FAIL'} W-MARKS-control | a moved @Z mark is seen | ${ctl.onlyJs.length ? 'FAILED as required' : 'BLIND'}`); if (!ctl.onlyJs.length) fails++;
fs.rmSync(STDDIR, { recursive: true, force: true });
process.exit(fails ? 1 : 0);
