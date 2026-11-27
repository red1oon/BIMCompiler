// ⚠ DO NOT REMOVE — W-L6-PARTITION + W-L6-ASSEMBLE (lane spec §L6.5). Issues they prove/disprove: (P) an element lost or drawn twice at a match line; (A) the scoped sheets do not
// reassemble into the whole-storey plan. Every sheet is a serialisation of the same document (same handles), so assembly = union by handle.
//   P1 every non-annotation entity of the whole plan is in exactly ONE scope sheet (grid entities may repeat: each scope shows its own grid range);
//   P2 annotation (untagged, non-grid) entities are in the KEY sheet only;
//   A1 union(key, scope sheets) contains every whole-plan handle; whatever it adds (title, match lines) is on A-ANNO-NOTE / A-ANNO-MATCH only;
//   A2 the whole-plan text equals the unscoped writer's output (scoping changed nothing else).
// Control: an entity added to a second scope sheet must FAIL P1; one removed from every sheet must FAIL A1.
// Usage: node tests/dxf2bim/witness_scopes.js <DB> [budget]  (NODE_PATH reaches better-sqlite3)
'use strict';
const Database = require('better-sqlite3'), S = require('../../deploy/dev/std2d.js'), path = require('path');
const db = process.argv[2], budget = Number(process.argv[3] || 0) || undefined, prefix = path.basename(db, '.db');
const q = sql => con.prepare(sql).all(); const con = new Database(db, { readonly: true });
const R0 = S.writeStdSet(q, prefix), R = S.writeStdSet(q, prefix, { suggest: true, budget });
let fail = 0; const chk = (id, issue, ok, d) => { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
function ents(text) {   // [{h, layer, type}] of the ENTITIES section
  const L = text.split('\n'), i0 = L.indexOf('ENTITIES'), out = []; let cur = null;
  for (let i = i0 + 1; i + 1 < L.length; i += 2) {
    const c = L[i].trim(), v = L[i + 1];
    if (c === '0') { if (v === 'ENDSEC') break; cur = { type: v, h: null, layer: null }; out.push(cur); }
    else if (cur && c === '5' && cur.h === null) cur.h = v; else if (cur && c === '8' && cur.layer === null) cur.layer = v;
  }
  return out;
}
const views = Object.keys(R.scoped);
console.log(`scopes=${R.scopes ? R.scopes.length : 0} scoped views=${views.length} ` + (R.scopes || []).map(s => s.name).join(' '));
chk('SC0', 'no storey was actually split (nothing to witness)', views.length > 0, views.join(','));
function check(sheets, whole, key, label) {
  const W = ents(whole), wh = new Set(W.map(e => e.h)), keyH = new Set(ents(key).map(e => e.h));
  const inScope = {}; sheets.forEach((t, k) => ents(t).forEach(e => { if (e.layer === 'A-GRID' || e.layer === 'A-ANNO-NOTE' && !wh.has(e.h) || e.layer === 'A-ANNO-MATCH') return; (inScope[e.h] = inScope[e.h] || []).push(k); }));
  const dup = W.filter(e => e.layer !== 'A-GRID' && keyH.has(e.h) === false && (inScope[e.h] || []).length > 1), lost = W.filter(e => !keyH.has(e.h) && !(inScope[e.h] || []).length && e.layer !== 'A-GRID');
  const annotInScope = W.filter(e => keyH.has(e.h) && (inScope[e.h] || []).length);
  return { dup, lost, annotInScope, n: W.length };
}
views.forEach(v => {
  const sp = R.scoped[v], whole = R.whole[v], texts = sp.sheets.map(s => s.text), c = check(texts, whole, sp.key);
  chk(`P1[${v}]`, 'an element is drawn in two scope sheets or in none', c.dup.length === 0 && c.lost.length === 0, `entities=${c.n} sheets=${texts.length} dup=${c.dup.length} lost=${c.lost.length} owned=${sp.sheets.map(s => s.name + ':' + s.owned).join(',')}`);
  chk(`P2[${v}]`, 'an annotation entity leaked into a scope sheet', c.annotInScope.every(e => e.layer === 'A-GRID' || true) && c.annotInScope.filter(e => e.layer !== 'A-GRID').length === 0, `leaked=${c.annotInScope.filter(e => e.layer !== 'A-GRID').length}`);
  const U = new Set(); [sp.key].concat(texts).forEach(t => ents(t).forEach(e => U.add(e.h))); const wh = new Set(ents(whole).map(e => e.h));
  const missing = [...wh].filter(h => !U.has(h)), extra = [].concat(...[sp.key].concat(texts).map(t => ents(t))).filter(e => !wh.has(e.h) && e.layer !== 'A-ANNO-NOTE' && e.layer !== 'A-ANNO-MATCH');
  chk(`A1[${v}]`, 'the scoped sheets do not reassemble into the whole plan', missing.length === 0 && extra.length === 0, `whole=${wh.size} union=${U.size} missing=${missing.length} unexpected_extra=${extra.length}`);
  chk(`A2[${v}]`, 'scoping changed the whole-plan output', R0.files[`${prefix}_${v}_std.dxf`] === whole, `bytes=${whole.length}`);
});
if (views.length) {   // controls on the first view
  const v = views[0], sp = R.scoped[v], whole = R.whole[v], texts = sp.sheets.map(s => s.text), W = ents(whole), victim = W.find(e => e.layer === 'A-WALL-PRTN' || e.layer === 'A-WALL-FULL');
  const k0 = texts.findIndex(t => ents(t).some(e => e.h === victim.h));
  const other = texts.map((t, i) => i).find(i => i !== k0);
  const t2 = texts.slice(); t2[other] = (() => { const L = t2[other].split('\n'); const idx = L.indexOf('ENTITIES'); L.splice(idx + 1, 0, '  0', 'LINE', '  5', victim.h, '  8', 'A-WALL-PRTN'); return L.join('\n'); })();
  const cd = check(t2, whole, sp.key); chk('P1-control', 'the witness cannot see an element drawn in two sheets', cd.dup.length >= 1, `dup=${cd.dup.length}`);
  const t3 = texts.map(t => { const L = t.split('\n'); for (let i = 0; i + 3 < L.length; i++) if (L[i].trim() === '5' && L[i + 1] === victim.h) { L[i + 1] = 'ZZZZ'; } return L.join('\n'); });
  const cl = check(t3, whole, sp.key); chk('A1-control', 'the witness cannot see an element lost from every sheet', cl.lost.length >= 1, `lost=${cl.lost.length}`);
}
process.exit(fail ? 1 : 0);
