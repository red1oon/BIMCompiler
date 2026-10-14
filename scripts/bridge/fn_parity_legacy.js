// ⚠ DO NOT REMOVE — SCOPE: ERP_DEPTH_FILM.md §FN-CENSUS stage 2/3. Read the log (§FN_PARITY_LEGACY lines + out/fn_parity_legacy.json) after every run.
// Calls the PILOT's stored functions on sampled inputs and exports the exact rows they read, so the twin witness
// (bim-ootb erp/tests/witness_fn_parity.js) replays the SAME data through the JS port. Read-only on the pilot.
// usage: node scripts/bridge/fn_parity_legacy.js
const { execFileSync, spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
function raw(sql) { const r = spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-v', 'ON_ERROR_STOP=1', '-tA', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 28 }); return r; }
const rows = sql => { const r = raw(`select coalesce(jsonb_agg(to_jsonb(zz__)),'[]') from (${sql}) zz__`); const o = r.stdout.replace(/^SET\n/, '').trim(); if (r.status !== 0 || !o) throw new Error('pilot query failed: ' + sql.slice(0, 160) + ' :: ' + r.stderr.trim().slice(0, 300)); return JSON.parse(o); };
const lit = (v, t) => v === null ? `NULL::${{ n: 'numeric', t: 'timestamptz', s: 'varchar' }[t]}` : t === 's' ? `'${String(v).replace(/'/g, "''")}'::varchar` : t === 't' ? `'${v}'::timestamptz` : `${v}::numeric`;
const cases = [], add = (fn, types, args, label) => cases.push({ fn, types, args, label });
const one = sql => rows(sql)[0] || {};
// --- samples (deterministic: ORDER BY id) ---
const invs = rows(`select al.c_invoice_id id, i.c_currency_id cur, d.docbasetype dbt, count(*) n, min(h.dateacct) d0, max(h.dateacct) d1 from c_allocationline al join c_allocationhdr h using(c_allocationhdr_id) join c_invoice i on i.c_invoice_id=al.c_invoice_id join c_doctype d on d.c_doctype_id=i.c_doctype_id where al.c_invoice_id is not null group by 1,2,3 order by n desc, 1 limit 6`)
  .concat(rows(`select i.c_invoice_id id, i.c_currency_id cur, d.docbasetype dbt, 0 n, null d0, null d1 from c_invoice i join c_doctype d on d.c_doctype_id=i.c_doctype_id where not exists (select 1 from c_allocationline al where al.c_invoice_id=i.c_invoice_id) order by 1 limit 2`))
  .concat(rows(`select al.c_invoice_id id, i.c_currency_id cur, 'ARI' dbt, 1 n, h.dateacct d0, h.dateacct d1 from c_allocationline al join c_allocationhdr h using(c_allocationhdr_id) join c_invoice i on i.c_invoice_id=al.c_invoice_id where i.c_currency_id<>h.c_currency_id limit 1`));
for (const i of invs) {
  const m = String(i.dbt || '').charAt(1) === 'P' ? -1 : 1;
  add('invoicepaid', 'nnn', [i.id, i.cur, m], 'inv ' + i.id + ' allocs=' + i.n);
  add('invoicepaid', 'nnn', [i.id, i.cur, null], 'inv ' + i.id + ' mult NULL'); add('invoicepaid', 'nnn', [i.id, i.cur, -1], 'inv ' + i.id + ' mult -1 (forced: the data may hold no AP invoice with allocations)'); add('invoicepaidtodate', 'nnnt', [i.id, i.cur, -1, '2100-01-01'], 'inv ' + i.id + ' mult -1 toDate far');
  if (i.d0) { add('invoicepaidtodate', 'nnnt', [i.id, i.cur, m, i.d1.slice(0, 10)], 'inv ' + i.id + ' toDate=max'); add('invoicepaidtodate', 'nnnt', [i.id, i.cur, m, i.d0.slice(0, 10) + ' 00:00:00'], 'inv ' + i.id + ' toDate=min'); add('invoicepaidtodate', 'nnnt', [i.id, i.cur, m, '1990-01-01'], 'inv ' + i.id + ' before all'); }
}
add('invoicepaid', 'nnn', [invs[0].id, 999999, 1], 'unknown currency'); add('invoicepaidtodate', 'nnnt', [invs[0].id, invs[0].cur, 1, null], 'toDate NULL');
const eur = one(`select c_currency_id id from c_currency where iso_code='EUR'`).id, usd = one(`select c_currency_id id from c_currency where iso_code='USD'`).id;
const pays = rows(`select p.c_payment_id id, p.c_currency_id cur, count(al.*) n from c_payment p left join c_allocationline al on al.c_payment_id=p.c_payment_id group by 1,2 order by n desc, 1 limit 6`).concat(rows(`select p.c_payment_id id, p.c_currency_id cur, 0 n from c_payment p where not exists (select 1 from c_allocationline al where al.c_payment_id=p.c_payment_id) order by 1 limit 3`));
for (const p of pays) {
  add('paymentallocated', 'nn', [p.id, p.cur], 'pay ' + p.id + ' allocs=' + p.n); add('paymentallocated', 'nn', [p.id, eur], 'pay ' + p.id + ' -> EUR');
  for (const to of [usd, eur]) { add('currencyconvertpayment', 'nnnt', [p.id, to, null, null], 'pay ' + p.id + ' to ' + to); add('currencyconvertpayment', 'nnnt', [p.id, to, 50.5, '2003-03-03'], 'pay ' + p.id + ' to ' + to + ' amt=50.5'); }
}
add('paymentallocated', 'nn', [999999999, usd], 'unknown payment'); add('currencyconvertpayment', 'nnnt', [999999999, usd, null, null], 'unknown payment');
const ov = rows(`select c_payment_id id, c_currency_id cur from c_payment where isoverridecurrencyrate='Y' limit 2`); ov.forEach(p => add('currencyconvertpayment', 'nnnt', [p.id, usd, null, null], 'override-rate pay ' + p.id));
const wh = rows(`select m_warehouse_id id from m_warehouse order by 1 limit 2`).map(r => r.id), prods = rows(`select m_product_id id, isstocked s from m_product order by (isstocked='Y') desc, 1 limit 5`);
prods.forEach(p => wh.forEach(w => { add('prodqtyordered', 'nn', [p.id, w], `prod ${p.id} stocked=${p.s} wh ${w}`); add('prodqtyreserved', 'nn', [p.id, w], `prod ${p.id} stocked=${p.s} wh ${w}`); }));
add('prodqtyordered', 'nn', [prods[0].id, null], 'warehouse NULL'); add('prodqtyreserved', 'nn', [999999999, wh[0]], 'unknown product');
rows(`select distinct c_bpartner_id id from c_bpartner_location order by 1`).forEach(b => add('bpartnerremitlocation', 'n', [b.id], 'bp ' + b.id)); add('bpartnerremitlocation', 'n', [999999999], 'unknown bp');
const orgs = rows(`select ad_client_id c, ad_org_id o from ad_org order by 1,2`), schemas = rows(`select c_acctschema_id id, ad_client_id c from c_acctschema order by 1`);
orgs.forEach(o => schemas.forEach(s => { if (s.c === o.c || o.c === 0) add('ismemberofacctschema', 'nnn', [o.c, o.o, s.id], `client ${o.c} org ${o.o} schema ${s.id}`); }));
[['1,2,3', '3,4'], ['a,b', 'c,d'], ['a, b', 'b'], ['', ''], ['', 'a'], [null, 'a'], ['a', null], ['x', 'x'], ['1,2', '2,1'], ['a,,b', ',']].forEach(([a, b]) => add('isintersectcsv', 'ss', [a, b], `csv ${JSON.stringify(a)} ${JSON.stringify(b)}`));
const uuT = [['C_Currency', 'c_currency_id'], ['c_uom', 'c_uom_id'], ['M_Product', 'm_product_id'], ['AD_Org', 'ad_org_id']]; const uuRows = {};
for (const [t, k] of uuT) { const r = rows(`select ${k} id, ${t}_uu u from ${t} order by 1 limit 2`); uuRows[t] = r; r.forEach(x => add('torecordid', 'ss', [t, x.u], `${t} ${x.id}`)); add('torecordid', 'ss', [t, '00000000-0000-0000-0000-000000000000'], `${t} no row`); }
const longT = rows(`select t.tablename n from ad_table t join information_schema.tables s on lower(s.table_name)=lower(t.tablename) and s.table_schema='adempiere' where length(t.tablename)>27 order by 1`);
for (const lt of longT) { const key = one(`select a.columnname c from ad_column a join ad_table b on a.ad_table_id=b.ad_table_id where a.iskey='Y' and b.tablename='${lt.n}'`).c; const uuc = one(`select a.columnname c from ad_column a join ad_table b on a.ad_table_id=b.ad_table_id where b.tablename='${lt.n}' and lower(a.columnname) like lower(substring('${lt.n}' from 0 for 27))||'%uu'`).c; const r = key && uuc ? rows(`select ${key} id, ${uuc} u from ${lt.n} limit 1`) : []; if (r[0]) { uuRows[lt.n] = r; add('torecordid', 'ss', [lt.n, r[0].u], `long-name table ${lt.n}`); } }
add('torecordid', 'ss', ['No_Such_Table', '00000000-0000-0000-0000-000000000000'], 'unknown table');
const asis = rows(`select m_attributesetinstance_id id from m_attributesetinstance order by (select count(*) from m_attributeinstance ai where ai.m_attributesetinstance_id=m_attributesetinstance.m_attributesetinstance_id) desc, (serno is not null) desc, (lot is not null) desc, (guaranteedate is not null) desc, 1 limit 14`).map(r => r.id).concat(rows(`select m_attributesetinstance_id id from m_attributesetinstance where m_attributesetinstance_id>0 order by 1 limit 4`).map(r => r.id));
[...new Set(asis)].forEach(a => add('productattribute', 'n', [a], 'asi ' + a)); [0, null, 999999999].forEach(a => add('productattribute', 'n', [a], 'asi ' + a));
const bp1099 = rows(`select c_bpartner_id id from c_bpartner order by 1 limit 2`); bp1099.forEach(b => add('get1099bucket', 'ntn', [b.id, '2026-12-31', 1], 'bp ' + b.id + ' (C_1099Box has 0 pilot rows - result NULL, branch VACUOUS)'));
// --- scenarios: the branches the pilot's own data never reaches. PRELUDE runs inside BEGIN..ROLLBACK (the pilot is never changed); the rows are exported AFTER the prelude. ---
const prod = rows(`select m_product_id id from m_product where isstocked='Y' order by 1 limit 1`)[0].id, prodNS = rows(`select m_product_id id from m_product where isstocked='N' order by 1 limit 1`)[0].id;
const whs = rows(`select w.m_warehouse_id id, (select min(l.m_locator_id) from m_locator l where l.m_warehouse_id=w.m_warehouse_id) loc from m_warehouse w order by 1 limit 2`);
const SCN = [];
function scn(name, prelude, tables, build) { const cs = []; build((fn, types, args, label) => cs.push({ fn, types, args, label: name + ': ' + label })); SCN.push({ name, prelude, tables, cases: cs }); }
scn('asi-text', `update m_attribute set isinstanceattribute='Y'; update m_attributesetinstance set serno='SN-1', lot='LOT-7', guaranteedate='2027-03-04 00:00:00' where m_attributesetinstance_id=100; update m_attributesetinstance set lot='LOT-9' where m_attributesetinstance_id=101; update m_attributesetinstance set serno='SN-3' where m_attributesetinstance_id=102; update m_attributeset set lotcharsoverwrite='[', lotchareoverwrite=']' where m_attributeset_id=102; update m_attributeinstance set value=null where m_attributesetinstance_id=101;`,
  { m_attributesetinstance: 'select * from m_attributesetinstance', m_attributeinstance: 'select * from m_attributeinstance', m_attributeset: 'select * from m_attributeset', m_attribute: 'select * from m_attribute' },
  add => [100, 101, 102, 103].forEach(a => add('productattribute', 'n', [a], 'asi ' + a)));
scn('acctschema-org', `update c_acctschema set ad_orgonly_id=12 where c_acctschema_id=101; update c_acctschema set ad_orgonly_id=50007 where c_acctschema_id=200000;`,
  { c_acctschema: 'select * from c_acctschema', ad_org: 'select * from ad_org', ad_tree: 'select * from ad_tree', ad_treenode: 'select * from ad_treenode' },
  add => orgs.forEach(o => schemas.forEach(sc => { if (sc.c === o.c || o.c === 0) add('ismemberofacctschema', 'nnn', [o.c, o.o, sc.id], `client ${o.c} org ${o.o} schema ${sc.id}`); })));
scn('production-lines', `insert into m_productionline(m_productionline_id,ad_client_id,ad_org_id,createdby,updatedby,line,m_product_id,movementqty,m_locator_id,processed) values (9000001,11,11,100,100,10,${prod},5,${whs[0].loc},'N'),(9000002,11,11,100,100,20,${prod},-3,${whs[0].loc},'N'),(9000003,11,11,100,100,30,${prod},2,${whs[0].loc},'Y'),(9000004,11,11,100,100,40,${prod},-4,${whs[0].loc},'Y'),(9000005,11,11,100,100,50,${prodNS},7,${whs[0].loc},'N');`,
  { m_product: 'select * from m_product', m_locator: 'select * from m_locator', m_warehouse: 'select * from m_warehouse', m_productionline: 'select * from m_productionline' },
  add => { [[prod, whs[0].id, 'stocked wh0'], [prod, whs[1].id, 'stocked wh1 (no lines)'], [prodNS, whs[0].id, 'NOT stocked (lines ignored)'], [prod, null, 'warehouse NULL']].forEach(([p, w, l]) => { add('prodqtyordered', 'nn', [p, w], l); add('prodqtyreserved', 'nn', [p, w], l); }); });
scn('1099-box', `insert into c_1099box(ad_client_id,ad_org_id,c_1099box_id,bucket,created,createdby,isactive,name,updated,updatedby,value) values (11,0,9000001,1,now(),100,'Y','Box1',now(),100,'B1'),(11,0,9000002,2,now(),100,'Y','Box2',now(),100,'B2'); update c_invoiceline set c_1099box_id=9000001 where c_invoice_id in (102,104,105); update c_invoiceline set c_1099box_id=9000002 where c_invoice_id=106;`,
  { c_invoice: "select * from c_invoice where issotrx='N'", c_invoiceline: "select * from c_invoiceline where c_invoice_id in (select c_invoice_id from c_invoice where issotrx='N')", c_doctype: 'select * from c_doctype', c_1099box: 'select * from c_1099box' },
  add => [[120, '2003-12-31', 1], [114, '2002-12-31', 1], [114, '2003-12-31', 2], [114, '2002-12-31', 2], [120, '2002-12-31', 1], [999999, '2003-12-31', 1]].forEach(a => add('get1099bucket', 'ntn', a, `bp ${a[0]} to ${a[1]} bucket ${a[2]}`)));
// --- run on the pilot ---
for (const c of cases) {
  const r = raw(`select case when r is null then 'NULL!!' else r::text end from (select adempiere.${c.fn}(${c.args.map((a, i) => lit(a, c.types[i])).join(',')}) as r) s`);   // NULL vs '' must stay distinguishable
  if (r.status === 0) { c.pilot = r.stdout.replace(/^SET\n/, '').trim(); c.pilotNull = c.pilot === 'NULL!!'; if (c.pilotNull) c.pilot = null; } else { c.err = (r.stderr.match(/ERROR:\s*(.*)/) || ['', r.stderr.trim()])[1]; }
}
const T = {};
['c_currency', 'c_conversiontype', 'c_conversion_rate', 'ad_clientinfo', 'c_acctschema', 'ad_org', 'ad_tree', 'ad_treenode', 'c_allocationhdr', 'c_allocationline', 'c_payment', 'c_bpartner_location', 'm_attributesetinstance', 'm_attributeinstance', 'm_attributeset', 'm_attribute', 'm_warehouse', 'm_locator'].forEach(t => { T[t] = rows(`select * from ${t}`); });
T.ad_table = rows(`select * from ad_table where lower(tablename) in (${Object.keys(uuRows).map(t => `'${t.toLowerCase()}'`).join(',')})`);
T.ad_column = rows(`select c.* from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id where lower(t.tablename) in (${Object.keys(uuRows).map(t => `'${t.toLowerCase()}'`).join(',')})`);
for (const t of Object.keys(uuRows)) T['__' + t] = rows(`select * from ${t} limit 1000`);
const scenarios = [{ name: 'base', cases, tables: T }];
for (const sc of SCN) {                                   // ONE psql session per scenario: BEGIN; prelude; calls; exports; ROLLBACK
  const L = ['BEGIN;', 'set search_path=adempiere;', sc.prelude];
  sc.cases.forEach((c, i) => L.push(`select '@@C${i}@@' || case when r is null then 'NULL!!' else r::text end from (select adempiere.${c.fn}(${c.args.map((a, j) => lit(a, c.types[j])).join(',')}) as r) s;`));
  Object.keys(sc.tables).forEach(t => L.push(`select '@@T${t}@@' || coalesce(jsonb_agg(to_jsonb(zz__)),'[]')::text from (${sc.tables[t]}) zz__;`)); L.push('ROLLBACK;');
  const r = spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA'], { input: L.join('\n'), encoding: 'utf8', maxBuffer: 1 << 28 });
  const out = r.stdout.split('\n'), tabs = {};
  sc.cases.forEach((c, i) => { const l = out.find(x => x.startsWith(`@@C${i}@@`)); if (l) { c.pilot = l.slice(`@@C${i}@@`.length); c.pilotNull = c.pilot === 'NULL!!'; if (c.pilotNull) c.pilot = null; } else c.err = 'scenario call failed: ' + (r.stderr.match(/ERROR:\s*(.*)/) || ['', ''])[1]; });
  Object.keys(sc.tables).forEach(t => { const l = out.find(x => x.startsWith(`@@T${t}@@`)); tabs[t] = l ? JSON.parse(l.slice(`@@T${t}@@`.length)) : []; });
  const rolled = out.some(x => x.trim() === 'ROLLBACK'); if (!rolled) console.log(`§FN_PARITY_LEGACY scenario=${sc.name} WARNING no ROLLBACK seen`);
  sc.tables = tabs; scenarios.push({ name: sc.name, cases: sc.cases, tables: tabs });
  const nn = sc.cases.filter(c => c.pilot && c.pilot !== '0' && c.pilot !== 'f').length;
  console.log(`§FN_PARITY_LEGACY scenario=${sc.name} cases=${sc.cases.length} nonTrivial=${nn} errors=${sc.cases.filter(c => c.err).length} (prelude rolled back: ${rolled})`);
}
const all = scenarios.flatMap(s => s.cases), byFn = {}; all.forEach(c => { (byFn[c.fn] = byFn[c.fn] || []).push(c); });
console.log(`§FN_PARITY_LEGACY cases=${all.length} scenarios=${scenarios.length} pilotErr=${all.filter(c => c.err).length} rowsExported=${scenarios.reduce((a, s) => a + Object.values(s.tables).reduce((b, v) => b + v.length, 0), 0)}`);
Object.keys(byFn).forEach(f => console.log(`§FN_PARITY_LEGACY fn=${f} cases=${byFn[f].length} nonNullResults=${byFn[f].filter(c => c.pilot && c.pilot !== '0' && !/^0\.0+$/.test(c.pilot) && c.pilot !== 'f').length} errors=${byFn[f].filter(c => c.err).length}`));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/fn_parity_legacy.json'), JSON.stringify({ date: new Date().toISOString(), scenarios }));
