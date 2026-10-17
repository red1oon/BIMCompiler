// ⚠ DO NOT REMOVE — W-L125 (lane spec §L1.25): two door types at one plan point are not tagged. Issue it proves/disproves: "the export writes two different @TAG texts at one point, which the
// reader refuses (SampleCastle: 2 of 10 sheets)". READ = no sheet of SampleCastle is refused for MARK:conflict; NOCHANGE = a model with no such point (Duplex) writes identical marks to the
// pre-fix writer; CONTROL = every two-type point is absent from the files, every same-type multi-door point still carries its one tag text (read back from the written DXF, not from the log).
// Usage: node tests/dxf2bim/witness_door_tag_conflict.js <SampleCastle .db> <Duplex .db> [better-sqlite3 dir] [path to the PRE-fix std2d_marks.js dir]
'use strict';
const path = require('path'), crypto = require('crypto');
const [sc, dx, nm = path.join(process.env.HOME, 'bim-compiler/node_modules'), pre] = process.argv.slice(2);
const Database = require(path.join(nm, 'better-sqlite3'));
const D = path.join(__dirname, '../../deploy/dev/');
const mk = dir => ({ S: require(dir + 'std2d.js'), Mk: require(dir + 'std2d_marks.js'), MK: require(dir + 'dxf2marks.js'), B: require(dir + 'dxf2bim.js'), SHC: require(dir + 'dxf2shell_config.js') });
const DxfParser = require(D + 'dxf-parser.js'), hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
let fail = 0; const say = (ok, n, d) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n} | ${d}`); };
const marks = (dir, db) => { const M = mk(dir), c = new Database(db, { readonly: true }), q = s => c.prepare(s).all(), R = M.S.writeStdSet(q, 'X'); return M.Mk.deriveMarks(R, { B: M.B, DxfParser, hashHex, MK: M.MK, SHC: M.SHC }, { set: 'X' }); };
const mkRun = (dir, db) => { const M = mk(dir), c = new Database(db, { readonly: true }), q = s => c.prepare(s).all(), R = M.S.writeStdSet(q, 'X'); return { R, D: M.Mk.deriveMarks(R, { B: M.B, DxfParser, hashHex, MK: M.MK, SHC: M.SHC }, { set: 'X' }) }; };
const { R: Rsc, D: post } = mkRun(D, sc), conflicts = post.log.filter(l => /§MARK_GAP TAG door/.test(l));
const tags = {};   // "<sheet>|x|y" -> set of texts, read back from the written files
Object.entries(post.files).forEach(([n, t]) => { const L = t.split(/\r?\n/); for (let i = 0; i + 1 < L.length; i += 2) if (L[i].trim() === '1' && /^@TAG=door,/.test(L[i + 1].trim())) { let x, y; for (let j = i - 2; j >= 0 && j > i - 24; j -= 2) { if (L[j].trim() === '10' && x === undefined) x = L[j + 1].trim(); if (L[j].trim() === '20' && y === undefined) y = L[j + 1].trim(); } const k = n.replace(/^X_|_std\.dxf$/g, '') + '|' + Number(x) + '|' + Number(y); (tags[k] = tags[k] || new Set()).add(L[i + 1].trim().slice(9).replace(/ @BY=model$/, '')); } });
const byPt = {}; Rsc.model.els.filter(e => e.cls === 'IfcDoor').forEach(d => { const st = d.storey, k = 'FLOOR_' + st.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '|' + Number(((d.x0 + d.x1) / 2 * 1000).toFixed(3)) + '|' + Number(((d.y0 + d.y1) / 2 * 1000).toFixed(3)); (byPt[k] = byPt[k] || []).push(d.etype); });
const multi = Object.entries(byPt).filter(([, a]) => a.length > 1), twoType = multi.filter(([, a]) => new Set(a).size > 1), sameType = multi.filter(([, a]) => new Set(a).size === 1);
const leaked = twoType.filter(([k]) => tags[k]), lost = sameType.filter(([k]) => !tags[k] || tags[k].size !== 1);
const twoTexts = Object.entries(tags).filter(([, v]) => v.size > 1);
say(twoTexts.length === 0 && twoType.length > 0 && conflicts.length === twoType.length, 'W-L125-READ', `two-type points ${twoType.length}, logged ${conflicts.length}, points with two different @TAG texts in the files ${twoTexts.length}`);
say(leaked.length === 0 && lost.length === 0 && sameType.length > 0, 'W-L125-CONTROL', `two-type points tagged anyway: ${leaked.length} (must be 0); same-type multi-door points ${sameType.length}, each still carrying exactly one tag text: lost ${lost.length} (must be 0)`);
if (pre) { const a = marks(pre.endsWith('/') ? pre : pre + '/', dx), b = marks(D, dx), diff = Object.keys(a.files).filter(n => a.files[n] !== b.files[n]); say(diff.length === 0, 'W-L125-NOCHANGE', `Duplex marks vs pre-fix writer: ${diff.length ? diff.join(',') : 'byte-identical'}`); }
console.log(fail ? `FAIL (${fail})` : 'ALL PASS'); process.exit(fail ? 1 : 0);
