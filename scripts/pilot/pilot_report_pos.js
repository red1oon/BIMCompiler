// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_report_pos.js [case=pos_one] — markdown side-by-side (per table, per column) from ~/.cache/pilot/<case>/cmp.json
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const c = process.argv[2] || 'pos_one'; const cmp = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.cache', 'pilot', c, 'cmp.json')));
console.log('| table | iDempiere changed | ours (signed op-group) | verdict | owning Java | trap |'); console.log('|---|---|---|---|---|---|');
for (const t of cmp.tables) {
  const r = t.ref ? `ins ${t.ref.inserted} / upd ${t.ref.updated}${t.ref.cols.length ? ' [' + t.ref.cols.join(',') + ']' : ''}` : '-';
  const o = t.ours ? `ins ${t.ours.inserted}${t.ours.updatedCols && t.ours.updatedCols.length ? ' / upd [' + t.ours.updatedCols.join(',') + ']' : ''}` : '-';
  console.log(`| ${t.table} | ${r} | ${o} | ${String(t.verdict).split(':')[0]} | ${/MISSING|PARTIAL/.test(t.verdict) ? t.owner.java : ''} | ${/MISSING|PARTIAL/.test(t.verdict) ? t.owner.trap : ''} |`);
}
console.log('\nColumn-level (non-MATCH):\n'); console.log('| table | column | verdict | iDempiere | ours |'); console.log('|---|---|---|---|---|');
for (const t of cmp.tables) for (const x of t.cols || []) if (x.v && x.v !== 'MATCH' && !/^\(/.test(x.col)) console.log(`| ${t.table} | ${x.col} | ${x.v} | ${x.ref === undefined ? '' : JSON.stringify(x.ref)} | ${x.ours === undefined ? '' : JSON.stringify(x.ours)} |`);
for (const t of cmp.tables) for (const x of t.cols || []) if (/^\(/.test(x.col)) console.log(`\nfact_acct multiset (table/schema/account/dr/cr): matched ${x.matched}; MISSING ${JSON.stringify(x.missing)}; EXTRA ${JSON.stringify(x.extra)}`);
