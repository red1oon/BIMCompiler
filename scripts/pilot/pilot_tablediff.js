// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot (POS table-level proof); read the log after every run.
// pilot_tablediff.js — snapshot EVERY base table in the schema (CREATE TABLE snap_<tag>.<t> AS SELECT *) and diff two
// snapshots/live by PRIMARY KEY (full-row multiset for PK-less tables). Cannot miss a table that lacks Updated: it compares
// whole rows, not timestamps. Emits §PILOT-POS-DIFF table=… inserted=… updated=… deleted=… cols_changed=[…].
// Usage: node pilot_tablediff.js snap <tag> | diff <tagBefore> [<tagAfter>|live] [--json out.json]
'use strict';
const cfg = require('./pilot_cfg'), fs = require('fs');
if (cfg.PG_DB === 'idempiere') { console.error('refusing reference DB'); process.exit(2); }
const S = cfg.PG_SCHEMA;
const tables = () => cfg.psql(`select table_name from information_schema.tables where table_schema='${S}' and table_type='BASE TABLE' order by 1`).map(r => r[0]);
function snap(tag) {
  const sch = 'snap_' + tag;
  let sql = `DROP SCHEMA IF EXISTS ${sch} CASCADE; CREATE SCHEMA ${sch};\n`;
  for (const t of tables()) sql += `CREATE TABLE ${sch}."${t}" AS SELECT * FROM ${S}."${t}";\n`;
  cfg.psql(sql); console.log('§PILOT-SNAP tag=' + tag + ' tables=' + tables().length);
}
function pk(t) { return cfg.psql(`select a.attname from pg_index i join pg_attribute a on a.attrelid=i.indrelid and a.attnum=any(i.indkey) where i.indrelid='${S}."${t}"'::regclass and i.indisprimary order by array_position(i.indkey,a.attnum)`).map(r => r[0]); }
function diff(a, b) {
  // ONE server-side pass (plpgsql): per table, PK-keyed insert/update/delete counts + changed column names.
  const A = 'snap_' + a, B = b === 'live' ? S : 'snap_' + b;
  const sql = `
CREATE OR REPLACE FUNCTION pg_temp.pilot_diff(a text, b text, s text) RETURNS TABLE(tbl text, ins bigint, upd bigint, del bigint, cols text, pkcols text) AS $f$
DECLARE t text; k text[]; j text;
BEGIN
 FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema=s AND table_type='BASE TABLE' ORDER BY 1 LOOP
  SELECT array_agg(att.attname::text ORDER BY array_position(i.indkey::int2[],att.attnum)) INTO k FROM pg_index i JOIN pg_attribute att ON att.attrelid=i.indrelid AND att.attnum=ANY(i.indkey) WHERE i.indrelid=format('%I.%I',s,t)::regclass AND i.indisprimary;
  tbl:=t; ins:=0; upd:=0; del:=0; cols:=''; pkcols:=coalesce(array_to_string(k,','),'');
  IF k IS NOT NULL THEN
    SELECT string_agg(format('_a.%I=_b.%I',c,c),' and ') INTO j FROM unnest(k) c;
    EXECUTE format('select count(*) from %I.%I _b where not exists (select 1 from %I.%I _a where %s)',b,t,a,t,j) INTO ins;
    EXECUTE format('select count(*) from %I.%I _a where not exists (select 1 from %I.%I _b where %s)',a,t,b,t,j) INTO del;
    EXECUTE format('select count(*) from %I.%I _a join %I.%I _b on %s where to_jsonb(_a)<>to_jsonb(_b)',a,t,b,t,j) INTO upd;
    IF upd>0 THEN EXECUTE format('select string_agg(distinct kx,%L) from %I.%I _a join %I.%I _b on %s, jsonb_object_keys(to_jsonb(_a)) kx where to_jsonb(_a)->kx is distinct from to_jsonb(_b)->kx',',',a,t,b,t,j) INTO cols; END IF;
  ELSE
    EXECUTE format('select count(*) from (select to_jsonb(_b)::text from %I.%I _b except all select to_jsonb(_a)::text from %I.%I _a) q',b,t,a,t) INTO ins;
    EXECUTE format('select count(*) from (select to_jsonb(_a)::text from %I.%I _a except all select to_jsonb(_b)::text from %I.%I _b) q',a,t,b,t) INTO del;
  END IF;
  IF ins>0 OR upd>0 OR del>0 THEN RETURN NEXT; END IF;
 END LOOP;
END $f$ LANGUAGE plpgsql;
SELECT tbl||chr(31)||ins||chr(31)||upd||chr(31)||del||chr(31)||coalesce(cols,'')||chr(31)||pkcols FROM pg_temp.pilot_diff('${A}','${B}','${S}');`;
  const res = cfg.psql(sql).filter(r => r.length >= 5).map(r => { const [tbl, ins, upd, del, cols, pk] = r; return { table: tbl, inserted: +ins, updated: +upd, deleted: +del, cols_changed: cols ? cols.split(',') : [], pk: pk }; });
  res.forEach(r => console.log('§PILOT-POS-DIFF table=' + r.table + ' inserted=' + r.inserted + ' updated=' + r.updated + ' deleted=' + r.deleted + ' cols_changed=[' + r.cols_changed.join(',') + ']'));
  console.log('§PILOT-POS-DIFF-SUMMARY tablesChanged=' + res.length + ' of ' + tables().length + ' scanned');
  return res;
}
// detail(a,b,res): per changed table, inserted rows (full jsonb) + updated rows {pk, changes:{col:[old,new]}} — for column-level compare.
function detail(a, b, res) {
  const A = 'snap_' + a, B = b === 'live' ? S : 'snap_' + b;
  for (const r of res) {
    const t = r.table, k = r.pk ? r.pk.split(',') : [];
    if (k.length) {
      const j = k.map(c => `_a."${c}"=_b."${c}"`).join(' and ');
      r.insRows = cfg.psql(`select to_jsonb(_b)::text from ${B}."${t}" _b where not exists (select 1 from ${A}."${t}" _a where ${j}) limit 200`).map(x => JSON.parse(x[0]));
      r.delRows = cfg.psql(`select to_jsonb(_a)::text from ${A}."${t}" _a where not exists (select 1 from ${B}."${t}" _b where ${j}) limit 200`).map(x => JSON.parse(x[0]));
      r.updRows = cfg.psql(`select to_jsonb(_a)::text, to_jsonb(_b)::text from ${A}."${t}" _a join ${B}."${t}" _b on ${j} where to_jsonb(_a)<>to_jsonb(_b) limit 200`).map(x => { const o = JSON.parse(x[0]), n = JSON.parse(x[1]), ch = {}; for (const c in n) if (JSON.stringify(o[c]) !== JSON.stringify(n[c])) ch[c] = [o[c], n[c]]; return { key: k.map(c => n[c]), changes: ch }; });
    } else {
      r.insRows = cfg.psql(`select to_jsonb(_b)::text from (select * from ${B}."${t}" _b where to_jsonb(_b)::text not in (select to_jsonb(_a)::text from ${A}."${t}" _a)) _b limit 200`).map(x => JSON.parse(x[0])); r.updRows = []; r.delRows = [];
    }
  }
  return res;
}
module.exports = { snap, diff, tables, detail };
if (require.main === module) {
  const [cmd, x, y] = process.argv.slice(2);
  if (cmd === 'snap') snap(x);
  else if (cmd === 'diff') { const r = detail(x, y || 'live' === 'live' ? (y || 'live') : y, diff(x, y || 'live')); const i = process.argv.indexOf('--json'); if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(r, null, 1)); }
}
