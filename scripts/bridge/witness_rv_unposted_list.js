#!/usr/bin/env node
'use strict';
// ⚠ DO NOT REMOVE -- W-RVU-LIST (prompts/SQLiteIDEMPIERE.md §G-SD1-PORT). READ THE LOG; the exit code is not evidence.
// ISSUE: bim-ootb erp/model_trade.js RV_UNPOSTED (the table list its hasUnpostedDocs builds) was hand-copied from legacy and nothing checked it. This compares it, row by row, with the CAPTURED
// legacy view definition (scripts/bridge/rv_unposted.sql, pg_views) parsed by rv_unposted.js. Negative control: a list with one wrong date column / a dropped table must be reported.
const path = require('path'), { branches } = require('./rv_unposted');
const OOTB = process.env.BRIDGE_OOTB || path.join(process.env.HOME, 'bim-ootb');
const MT = require(path.join(OOTB, 'erp/model_trade.js'));
const legacy = branches().map(b => [b.table, b.dateCol, b.joinDoctype ? null : b.docbasetype, b.docstatusFixed]);
function diff(list) {
  const L = JSON.stringify, out = [];
  if (list.length !== legacy.length) out.push(`count ${list.length} != ${legacy.length}`);
  legacy.forEach((l, i) => { const m = list.find(x => x[0] === l[0]); if (!m) out.push('missing ' + l[0]); else if (L(m) !== L(l)) out.push(`${l[0]}: shipped ${L(m)} != legacy ${L(l)}`); });
  return out;
}
const real = diff(MT.RV_UNPOSTED), bad1 = MT.RV_UNPOSTED.map(x => x.slice()); bad1[0][1] = 'datedoc';
const bad2 = MT.RV_UNPOSTED.slice(1), neg1 = diff(bad1), neg2 = diff(bad2);
console.log(`§RVU-LIST legacy_branches=${legacy.length} shipped=${MT.RV_UNPOSTED.length} diffs=${real.length}`); real.forEach(d => console.log('§RVU-LIST-DIFF ' + d));
console.log(`§RVU-LIST-NEG wrong_column_detected=${neg1.length > 0} dropped_table_detected=${neg2.length > 0}`);
const v = !legacy.length ? 'INCONCLUSIVE' : (neg1.length && neg2.length) ? (real.length ? 'FAIL' : 'PASS') : 'INCONCLUSIVE';
console.log(`§RVU_VERDICT ${v}`); process.exit(v === 'PASS' ? 0 : v === 'FAIL' ? 1 : 2);
