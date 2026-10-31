// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// library_building_types.js — pure: tag library rows with the building types they belong to (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L23).
'use strict';
// rows: [{ <idKey>: id, ... }]; map: { default: [...], <table>: { id: [types] } }. Returns new rows with `building_types` (sorted, unique); throws on a tag for a record that does not exist.
function tag(table, idKey, rows, map) {
  const m = (map && map[table]) || {}, def = (map && map.default) || ['General'], ids = new Set(rows.map(r => String(r[idKey])));
  Object.keys(m).forEach(k => { if (!ids.has(k)) throw new Error(`library_building_types: ${table} tag for "${k}" names no such record`); });
  return rows.map(r => Object.assign({}, r, { building_types: [...new Set(m[String(r[idKey])] || def)].sort() }));
}
const typesOf = (...tagged) => [...new Set([].concat(['General'], ...tagged.map(rs => [].concat(...rs.map(r => r.building_types)))))].sort();
if (typeof module === 'object' && module.exports) module.exports = { tag, typesOf };
