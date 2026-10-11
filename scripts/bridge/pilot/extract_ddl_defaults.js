// §SHOPDAY-RUN-1: physical DDL column defaults of the legacy schema (information_schema.column_default), the values a PO insert gets for columns it leaves
// NULL-omitted (PO.doInsert skips unset columns => the DB DEFAULT applies). The SQLite side needs the SAME defaults; they are not in the AD dictionary.
// Output: build/erp/ddl_defaults.json.gz = { defaults: { "<table>": { "<col>": "<literal>" } }, cols: { "<table>": [physical columns in order] } } (literals and now()-type defaults only). Re-run when the legacy schema changes.
'use strict';
const T = require('../client_template'), fs = require('fs'), zlib = require('zlib'), path = require('path');
const colRows = T.pg(`select table_name||'|'||column_name from information_schema.columns where table_schema='adempiere' order by table_name, ordinal_position`);
const COLS = {}; for (const l of colRows) { const [t, c] = l.split('|'); (COLS[t] = COLS[t] || []).push(c); }
const rows = T.pg(`select table_name||'|'||column_name||'|'||column_default from information_schema.columns where table_schema='adempiere' and column_default is not null and column_default not like 'nextval%' order by 1`);
const out = {}; let n = 0, skipped = [];
for (const l of rows) {
  const [t, c, ...rest] = l.split('|'), d = rest.join('|');
  let v = d.replace(/::[a-z ]+(\([0-9, ]+\))?(\[\])?$/i, '');
  v = v.replace(/^\((-?[\d.]+)\)$/, '$1');
  if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'"); else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v); else if (/^(statement_timestamp|now|current_timestamp|clock_timestamp)\(\)/i.test(v)) v = '@NOW'; else if (/^NULL$/i.test(v)) continue; else { skipped.push(`${t}.${c}=${d}`); continue; }
  (out[t] = out[t] || {})[c] = v; n++;
}
fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'build', 'erp', 'ddl_defaults.json.gz'), zlib.gzipSync(JSON.stringify({ defaults: out, cols: COLS }), { level: 9 }));
console.log(`§DDL_DEFAULTS tables=${Object.keys(out).length} columns=${n} skipped_non_literal=${skipped.length}${skipped.length ? ' e.g. ' + skipped.slice(0, 4).join(' ; ') : ''}`);
