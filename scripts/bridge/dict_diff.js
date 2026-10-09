// Dictionary diff → patch (class DATA of the gap-fix loop, spec §26). App-agnostic: tables/keys/columns come from a SPEC (data).
// Values are DISCOVERED from legacy (read WS types) and compared with the SQLite seed; the patch is generated from the legacy value
// (EXTRACT, never invent). It never deletes. The caller decides where to apply the patch; the generated .sql is reviewable text.
//   spec = { table, key (string | [composite]), readType, keyBelow?, skip?:RegExp, where?: string, addColumns?: [legacy cols to ADD] }  — spec §37
'use strict';
const { query } = require('./ad_client');
const AUDIT = /^(created|updated|createdby|updatedby|.*_uu)$/i;

const norm = v => {
  if (v === null || v === undefined || v === '') return null;
  if (v === true) return 'Y'; if (v === false) return 'N';
  const s = String(v);
  return /^-?\d+(\.\d+)?$/.test(s) ? String(Number(s)) : s;
};
const lc = o => { const r = {}; for (const k in o) r[k.toLowerCase()] = o[k]; return r; };

const keysOf = spec => [].concat(spec.key).map(k => k.toLowerCase());
const keyVal = (row, ks) => ks.map(k => norm(row[k])).join('|');
async function discover(cfg, spec) {
  const k0 = [].concat(spec.key)[0];
  const below = spec.keyBelow ? ` AND ${k0} < ${spec.keyBelow}` : '';
  return (await query(cfg, spec.readType, `${k0} > 0${below}${spec.where ? ' AND ' + spec.where : ''}`)).map(lc);
}

function compare(legacyRows, db, spec) {
  if (typeof spec.skip === 'string') spec = Object.assign({}, spec, { skip: new RegExp(spec.skip, 'i') });   // JSON specs carry the pattern as a string
  const ks = keysOf(spec), k = ks[0];
  const cols = db.prepare(`PRAGMA table_info(${spec.table})`).all().map(c => c.name.toLowerCase());
  const lcols = legacyRows.length ? [...new Set(legacyRows.flatMap(r => Object.keys(r)))] : [];
  if (!cols.length) {   // §49: the SQLite db has no such table at all — every legacy row is missing; only a CREATE TABLE (schema patch) can fix it
    return { table: spec.table, legacy: legacyRows.length, local: 0, columns: 0, onlyLegacy: legacyRows, onlyLocal: [], changed: [], missingCols: lcols, missingTable: true, _common: [], _legacy: legacyRows, _localKeys: new Set(), _lcols: lcols };
  }
  const common = cols.filter(c => lcols.includes(c) && !AUDIT.test(c) && !(spec.skip && spec.skip.test(c)));
  const missingCols = lcols.filter(c => !cols.includes(c) && !AUDIT.test(c) && !(spec.skip && spec.skip.test(c)));
  if (spec.columnsOnly) return { table: spec.table, legacy: legacyRows.length, local: null, columns: common.length, onlyLegacy: [], onlyLocal: [], changed: [], missingCols, _common: common, columnsOnly: true };
  const below = spec.keyBelow ? ` WHERE ${k} < ${spec.keyBelow}` : '';
  const local = new Map(db.prepare(`SELECT * FROM ${spec.table}${below}`).all().map(r => { const l = lc(r); return [keyVal(l, ks), l]; }));
  const res = { table: spec.table, legacy: legacyRows.length, local: local.size, columns: common.length, onlyLegacy: [], onlyLocal: [], changed: [] };
  const seen = new Set();
  for (const lr of legacyRows) {
    const id = keyVal(lr, ks); seen.add(id);
    const loc = local.get(id);
    if (!loc) { res.onlyLegacy.push(lr); continue; }
    for (const c of common) if (norm(lr[c]) !== norm(loc[c])) res.changed.push({ id, col: c, legacy: lr[c], local: loc[c] });
  }
  for (const id of local.keys()) if (!seen.has(id)) res.onlyLocal.push(id);
  res._common = common; res._legacy = legacyRows; res._localKeys = new Set(local.keys());
  // columns legacy has but the SQLite table lacks: invisible to a shared-column compare, and NOT fixable by a data patch (needs ALTER via patch+loader)
  res.missingCols = missingCols;
  return res;
}

const q = v => (v === null || v === undefined || v === '') ? 'NULL' : (typeof v === 'number' ? String(v) : v === true ? "'Y'" : v === false ? "'N'" : `'${String(v).replace(/'/g, "''")}'`);

// Patch text from legacy values only. INSERT … WHERE NOT EXISTS (idempotent even on keyless tables) for rows legacy has; UPDATE for changed cells. NEVER DELETE.
function toPatch(res, spec) {
  if (res.missingTable) return `-- dict_diff patch for ${spec.table}: table missing — see the SCHEMA patch\n`;
  const out = [`-- dict_diff patch for ${spec.table} (generated from legacy values; review before applying; never deletes)`];
  for (const r of res.onlyLegacy) {
    const cs = res._common; out.push(insertIfAbsent(spec, cs, r));
  }
  for (const c of res.changed) out.push(`UPDATE ${spec.table} SET ${c.col}=${q(c.legacy)} WHERE ${whereOf(spec, c.id)};`);
  return out.join('\n') + '\n';
}
// insert a legacy row only when no row with the same key exists. NOT `INSERT OR IGNORE`: many SQLite seed tables have no PRIMARY KEY, so OR IGNORE never
// ignores and a re-apply duplicates the row (found by §DD_SCHEMA_IDEMPOTENT on c_acctschema, 2026-10-09).
function insertIfAbsent(spec, cs, row) {
  const ks = keysOf(spec);
  return `INSERT INTO ${spec.table}(${cs.join(',')}) SELECT ${cs.map(c => q(row[c])).join(',')} WHERE NOT EXISTS (SELECT 1 FROM ${spec.table} WHERE ${ks.map(k => `${k}=${q(row[k])}`).join(' AND ')});`;
}
// composite-aware WHERE from the joined key value
function whereOf(spec, id) {
  const ks = keysOf(spec), parts = String(id).split('|');
  return ks.map((k, i) => `${k}=${q(parts[i] === '' ? null : (isNaN(parts[i]) ? parts[i] : Number(parts[i])))}`).join(' AND ');
}
// SCHEMA patch (spec §37): ADD the listed legacy-only columns, then fill them from LEGACY values (rows present locally) and insert legacy-only rows.
function toSchemaPatch(res, spec) {
  if (res.missingTable) {   // §49: CREATE the table with the legacy columns (untyped, like the seed tables) and load every legacy row
    const cs = res._lcols.filter(c => !AUDIT.test(c));
    const out = [`-- dict_diff SCHEMA patch for ${spec.table}: table MISSING in the SQLite db — created from the legacy columns, filled with legacy rows (spec §49; never deletes/drops)`,
      `CREATE TABLE IF NOT EXISTS ${spec.table}(${cs.join(',')});`];
    for (const lr of res._legacy) out.push(insertIfAbsent(spec, cs, lr));
    return out.join('\n') + '\n';
  }
  const add = (spec.addColumns || []).map(c => c.toLowerCase()).filter(c => (res.missingCols || []).includes(c));
  const out = [`-- dict_diff SCHEMA patch for ${spec.table} (spec §37; generated from legacy values; ALTERs are guarded by dict_diff.applyPatch; never deletes/drops)`];
  if (!add.length) return out.concat(['-- nothing to add']).join('\n') + '\n';
  for (const c of add) out.push(`ALTER TABLE ${spec.table} ADD COLUMN ${c};`);
  const ks = keysOf(spec), cs = res._common.concat(add);
  for (const lr of res._legacy || []) {
    const id = keyVal(lr, ks);
    if (res._localKeys && res._localKeys.has(id)) out.push(`UPDATE ${spec.table} SET ${add.map(c => `${c}=${q(lr[c])}`).join(', ')} WHERE ${whereOf(spec, id)};`);
    else out.push(insertIfAbsent(spec, cs, lr));
  }
  return out.join('\n') + '\n';
}
// loader-guarded apply: ALTER … ADD COLUMN skipped when PRAGMA table_info already has the column; the rest in ONE transaction.
function applyPatch(db, sqlText) {
  const stmts = sqlText.split(/;\s*\n/).map(x => x.replace(/^\s*--.*$/mg, '').trim()).filter(Boolean);
  let altered = 0, skipped = 0, ran = 0;
  db.exec('BEGIN');
  try {
    for (const st of stmts) {
      const m = /^ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i.exec(st);
      if (m) {
        const have = db.prepare(`PRAGMA table_info(${m[1]})`).all().some(c => c.name.toLowerCase() === m[2].toLowerCase());
        if (have) { skipped++; continue; }
        db.exec(st); altered++; continue;
      }
      db.exec(st); ran++;
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { altered, skipped, ran };
}
module.exports = { discover, compare, toPatch, toSchemaPatch, applyPatch };
