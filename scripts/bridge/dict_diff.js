// Dictionary diff → patch (class DATA of the gap-fix loop, spec §26). App-agnostic: tables/keys/columns come from a SPEC (data).
// Values are DISCOVERED from legacy (read WS types) and compared with the SQLite seed; the patch is generated from the legacy value
// (EXTRACT, never invent). It never deletes. The caller decides where to apply the patch; the generated .sql is reviewable text.
//   spec = { table, key, readType, keyBelow?, skip?:RegExp, where?: string }
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

async function discover(cfg, spec) {
  const below = spec.keyBelow ? ` AND ${spec.key} < ${spec.keyBelow}` : '';
  return (await query(cfg, spec.readType, `${spec.key} > 0${below}${spec.where ? ' AND ' + spec.where : ''}`)).map(lc);
}

function compare(legacyRows, db, spec) {
  const k = spec.key.toLowerCase();
  const cols = db.prepare(`PRAGMA table_info(${spec.table})`).all().map(c => c.name.toLowerCase());
  const lcols = legacyRows.length ? Object.keys(legacyRows[0]) : [];
  const common = cols.filter(c => lcols.includes(c) && !AUDIT.test(c) && !(spec.skip && spec.skip.test(c)));
  const missingCols = lcols.filter(c => !cols.includes(c) && !AUDIT.test(c) && !(spec.skip && spec.skip.test(c)));
  if (spec.columnsOnly) return { table: spec.table, legacy: legacyRows.length, local: null, columns: common.length, onlyLegacy: [], onlyLocal: [], changed: [], missingCols, _common: common, columnsOnly: true };
  const below = spec.keyBelow ? ` WHERE ${k} < ${spec.keyBelow}` : '';
  const local = new Map(db.prepare(`SELECT * FROM ${spec.table}${below}`).all().map(r => { const l = lc(r); return [String(l[k]), l]; }));
  const res = { table: spec.table, legacy: legacyRows.length, local: local.size, columns: common.length, onlyLegacy: [], onlyLocal: [], changed: [] };
  const seen = new Set();
  for (const lr of legacyRows) {
    const id = String(lr[k]); seen.add(id);
    const loc = local.get(id);
    if (!loc) { res.onlyLegacy.push(lr); continue; }
    for (const c of common) if (norm(lr[c]) !== norm(loc[c])) res.changed.push({ id, col: c, legacy: lr[c], local: loc[c] });
  }
  for (const id of local.keys()) if (!seen.has(id)) res.onlyLocal.push(id);
  res._common = common;
  // columns legacy has but the SQLite table lacks: invisible to a shared-column compare, and NOT fixable by a data patch (needs ALTER via patch+loader)
  res.missingCols = missingCols;
  return res;
}

const q = v => (v === null || v === undefined || v === '') ? 'NULL' : (typeof v === 'number' ? String(v) : v === true ? "'Y'" : v === false ? "'N'" : `'${String(v).replace(/'/g, "''")}'`);

// Patch text from legacy values only. INSERT OR IGNORE (idempotent) for rows legacy has; UPDATE for changed cells. NEVER DELETE.
function toPatch(res, spec) {
  const k = spec.key.toLowerCase(); const out = [`-- dict_diff patch for ${spec.table} (generated from legacy values; review before applying; never deletes)`];
  for (const r of res.onlyLegacy) {
    const cs = res._common; out.push(`INSERT OR IGNORE INTO ${spec.table}(${cs.join(',')}) VALUES(${cs.map(c => q(r[c])).join(',')});`);
  }
  for (const c of res.changed) out.push(`UPDATE ${spec.table} SET ${c.col}=${q(c.legacy)} WHERE ${k}=${q(isNaN(c.id) ? c.id : Number(c.id))};`);
  return out.join('\n') + '\n';
}
module.exports = { discover, compare, toPatch };
