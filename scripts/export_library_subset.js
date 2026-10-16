#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * # ⚠ DO NOT REMOVE — export_library_subset.js: docs/DXF2BIM_BASIC_SHAPES_SPEC.md §12 (LS-2), bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L3.2.
 * Read the printed summary after every run (row counts, SHA-256); exit code alone is not evidence.
 *
 * Writes the LOD400 library rows + meshes a pipeline run binds, as ONE deterministic JSON (same inputs -> byte-identical):
 *   bound      = the fills (element_ref set) of a run's element summary: their family_id + geometry_hash
 *   rows       = all active ad_opening_family + ad_wall_type (the binder chooses among ALL size candidates),
 *                ad_geometry_map door/window rows with a bound family's class + Dxf2Shell.pairKey size key (familyToRef's candidate set)
 *   meshes     = component_geometries of those rows, decoded: vertices float32 LE xyz, faces int32 LE (GeometryIntegrityChecker
 *                blobToFloats/blobToInts), normals null when the column is NULL
 *   labels     = optional, the labels the run applied (out/duplex_basic_shapes_labels.json, §12 LS-1)
 * Refuses (exit 1) when a bound hash is not in the candidate set or a mesh row is missing. The output is library data: write it
 * to a LOCAL, git-ignored path (LS-3), never commit it.
 *
 * Usage: node scripts/export_library_subset.js --elements <summary.json> [--labels <labels.json>] [--lib <component_library.db>] --out <file.json>
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const S = require(path.join(ROOT, 'deploy/dev/dxf2shell.js'));

const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const LIB = arg('lib') || path.join(ROOT, 'deploy/component_library.db'), ELS = arg('elements'), LABS = arg('labels'), OUT = arg('out');
if (!ELS || !OUT) { console.error('usage: --elements <summary.json> [--labels <labels.json>] [--lib <db>] --out <file.json>'); process.exit(2); }
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const sqlj = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', LIB, q], { encoding: 'utf8', maxBuffer: 1 << 28 }) || '[]');
const q1 = s => "'" + String(s).replace(/'/g, "''") + "'";
const byStr = k => (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0);
const refuse = m => { console.error('REFUSED ' + m); process.exit(1); };

const elsText = fs.readFileSync(ELS), summary = JSON.parse(elsText);
const fills = summary.elements.filter(e => e.element_ref);
const boundFam = [...new Set(fills.map(e => e.family_id))].sort(), boundHash = [...new Set(fills.map(e => e.geometry_hash))].sort();
if (!fills.length) refuse('the summary has no fills (no element_ref)');

const fams = sqlj('select family_id, family_name, opening_type, ifc_class, default_width_mm, default_height_mm, depth_mm, description from ad_opening_family where is_active=1 order by family_id');
const walls = sqlj('select wall_type_id, total_mm from ad_wall_type where is_active=1 order by wall_type_id');
const maps = sqlj("select element_ref, ifc_class, geometry_hash from ad_geometry_map where ifc_class in ('IfcDoor','IfcWindow') order by element_ref, ifc_class, geometry_hash");
const famById = {}; fams.forEach(f => { famById[f.family_id] = f; });
const seen = {}, cand = [];
boundFam.forEach(id => {
  const f = famById[id]; if (!f) refuse('bound family ' + id + ' is not an active ad_opening_family row');
  const key = S.pairKey(f.description); if (!key) refuse('bound family ' + id + ' has no size pair in its description');
  maps.forEach(m => { if (m.ifc_class === f.ifc_class && S.pairKey(m.element_ref) === key) { const k = m.element_ref + '|' + m.geometry_hash; if (!seen[k]) { seen[k] = 1; cand.push(m); } } });
});
cand.sort((a, b) => byStr('element_ref')(a, b) || byStr('ifc_class')(a, b) || byStr('geometry_hash')(a, b));
const candHash = [...new Set(cand.map(m => m.geometry_hash))].sort();
boundHash.forEach(h => { if (candHash.indexOf(h) < 0) refuse('bound geometry_hash ' + h + ' is not in the candidate set of the bound families'); });

const meshes = {};
const grows = sqlj('select geometry_hash, hex(vertices) v, hex(faces) f, hex(normals) n, vertex_count, face_count from component_geometries where geometry_hash in (' + candHash.map(q1).join(',') + ') order by geometry_hash');
grows.forEach(r => {
  const vb = Buffer.from(r.v, 'hex'), fb = Buffer.from(r.f, 'hex'), nb = r.n ? Buffer.from(r.n, 'hex') : null, V = [], F = [], N = nb ? [] : null;
  for (let i = 0; i + 3 < vb.length; i += 4) V.push(vb.readFloatLE(i));
  for (let i = 0; i + 3 < fb.length; i += 4) F.push(fb.readInt32LE(i));
  if (nb) for (let i = 0; i + 3 < nb.length; i += 4) N.push(nb.readFloatLE(i));
  if (V.length !== 3 * r.vertex_count || F.length !== 3 * r.face_count) refuse('mesh ' + r.geometry_hash + ' blob length != counts (' + V.length + '/' + r.vertex_count + ', ' + F.length + '/' + r.face_count + ')');
  meshes[r.geometry_hash] = { vertex_count: r.vertex_count, face_count: r.face_count, vertices: V, faces: F, normals: N };
});
candHash.forEach(h => { if (!meshes[h]) refuse('component_geometries has no row for ' + h); });

const libStat = fs.statSync(LIB), labText = LABS ? fs.readFileSync(LABS) : null, lab = labText ? JSON.parse(labText) : null;
if (lab && lab.run_id !== summary.run_id) refuse('labels run_id ' + lab.run_id + ' != summary run_id ' + summary.run_id);
const out = {
  format: 'dxf2bim-library-subset/1',
  generator: 'BIMCompiler scripts/export_library_subset.js (docs/DXF2BIM_BASIC_SHAPES_SPEC.md §12)',
  source: { db: path.basename(LIB), sha256: sha(fs.readFileSync(LIB)), bytes: libStat.size },
  input: { elements: path.basename(ELS), elements_sha256: sha(elsText), run_id: summary.run_id, labels: LABS ? path.basename(LABS) : null, labels_sha256: labText ? sha(labText) : null },
  encoding: { vertices: 'float32 LE xyz, flat', faces: 'int32 LE triangle indices, flat', normals: 'float32 LE xyz, flat; null when the column is NULL' },
  bound: { families: boundFam, geometry_hashes: boundHash, fills: fills.length },
  complete_for_families: boundFam,
  counts: { ad_opening_family: fams.length, ad_wall_type: walls.length, ad_geometry_map: cand.length, meshes: candHash.length },
  rows: { ad_opening_family: fams, ad_wall_type: walls, ad_geometry_map: cand },
  meshes: candHash.reduce((o, h) => (o[h] = meshes[h], o), {}),
  labels: lab ? lab.labels : null
};
const text = JSON.stringify(out) + '\n';
fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
fs.writeFileSync(OUT, text);
console.log('§LIB-SUBSET wrote ' + OUT + ' bytes=' + Buffer.byteLength(text) + ' sha256=' + sha(text));
console.log('§LIB-SUBSET source ' + out.source.db + ' sha256=' + out.source.sha256 + ' | run_id=' + summary.run_id + ' fills=' + fills.length);
console.log('§LIB-SUBSET bound families=' + boundFam.join(',') + ' hashes=' + boundHash.length + ' | rows ' + JSON.stringify(out.counts) + ' | normals null=' + candHash.filter(h => !meshes[h].normals).length + '/' + candHash.length + ' | labels=' + (lab ? Object.keys(lab.labels).map(k => k + ':' + lab.labels[k].length).join(',') : 'none'));
