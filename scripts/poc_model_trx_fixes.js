// W-MODEL-TRX-FIXES (§CP-OPEN 4b) — does ModelLayer.Trx/newPO follow Java where the process lane found it did not?
//   ISSUE-1 Trx.update recorded old->new even when the value returns to its original (net no-op)   -> §TRX-NET
//   ISSUE-2 Trx.insert overwrote a given parent-key column (C_AcctSchema_ID) with a '#new:' placeholder -> §TRX-KEEPKEY
//   ISSUE-3 newPO stamped AD mandatory defaults (IsManual='Y') Java's PO.setStandardDefaults/X_ ctor does not -> §NEWPO-JAVA
// Each check prints PASS/FAIL with its evidence; a falsifier run (ML from `git stash`ed copy) must print FAIL. Usage: OOTB=<worktree> node scripts/poc_model_trx_fixes.js
const path = require('path'); const OOTB = process.env.OOTB || '/tmp/wt-callouts';
const ML = require(path.join(OOTB, 'erp/model_layer.js'));
const DATA = {
  ad_column: [
    { c: 'C_AcctSchema_ID', k: 'N', p: 'Y', t: 'c_acctschema_gl' }, { c: 'IsManual', k: 'N', p: 'N', t: 'c_bankstatementline', m: 'Y', d: "'Y'" },
    { c: 'C_Order_ID', k: 'Y', p: 'N', t: 'c_order' }, { c: 'Processed', k: 'N', p: 'N', t: 'c_order', m: 'Y', d: "'N'" }, { c: 'Posted', k: 'N', p: 'N', t: 'c_order' } ],
};
function q(sql, params) {
  params = params || [];
  if (/FROM ad_column c JOIN ad_table t/.test(sql) && /iskey='Y'/.test(sql)) { const [t, col] = params; return DATA.ad_column.filter(r => r.t === t && r.c.toLowerCase() === col && r.k === 'Y').map(() => ({ x: 1 })); }
  if (/FROM ad_column c JOIN ad_table t/.test(sql) && /c.iskey AS k/.test(sql)) return DATA.ad_column.filter(r => r.t === params[0]).map(r => ({ c: r.c, k: r.k, p: r.p }));
  if (/ismandatory='Y'/.test(sql)) return DATA.ad_column.filter(r => r.t === params[0] && r.m === 'Y').map(r => ({ c: r.c.toLowerCase(), d: r.d }));
  if (/lower\(c.columnname\)/.test(sql) || /columnname/.test(sql)) return DATA.ad_column.filter(r => r.t === params[0]).map(r => ({ c: r.c.toLowerCase(), columnname: r.c }));
  return [];
}
let fail = 0; const R = (ok, name, ev) => { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' ' + ev); };
// ISSUE-1
{ const trx = new ML.Trx(q, { client: 11 }); const row = { c_order_id: 5, grandtotal: 10, description: 'a' };
  trx.update('c_order', row, { grandtotal: 20 }); const afterFirst = trx.ops.filter(Boolean).length;
  trx.update('c_order', row, { grandtotal: 10 });
  const g = trx.groupOps(); R(afterFirst === 1 && g.length === 0, '§TRX-NET update 10->20->10', 'opsAfterFirst=' + afterFirst + ' opsFinal=' + g.length + ' (want 1 then 0)');
  const t2 = new ML.Trx(q, { client: 11 }); const r2 = { c_order_id: 6, grandtotal: 10, description: 'a' };
  t2.update('c_order', r2, { grandtotal: 20, description: 'b' }); t2.update('c_order', r2, { grandtotal: 10 });
  const g2 = t2.groupOps(); R(g2.length === 1 && Object.keys(g2[0].changes).join() === 'description', '§TRX-NET partial', 'changes=' + JSON.stringify(g2[0] && g2[0].changes)); }
// ISSUE-2
{ const trx = new ML.Trx(q, { client: 11 }); const r = trx.insert('c_acctschema_gl', { c_acctschema_id: 1000042, ad_org_id: 0 });
  const g = trx.groupOps(); R(String(r.c_acctschema_id) === '1000042' && g[0].fields.c_acctschema_id === 1000042, '§TRX-KEEPKEY given parent key kept', 'fields.c_acctschema_id=' + JSON.stringify(g[0].fields.c_acctschema_id));
  const t2 = new ML.Trx(q, { client: 11 }); const r2 = t2.insert('c_order', { c_order_id: 777 }); R(/^#new:/.test(String(r2.c_order_id)), '§TRX-KEEPKEY real IsKey column still gets the placeholder', 'c_order_id=' + r2.c_order_id); }
// ISSUE-3
{ const trx = new ML.Trx(q, { client: 11, org: 11 }); const row = ML.newPO(trx, 'c_bankstatementline', {});
  R(row.ismanual === undefined, '§NEWPO-JAVA no AD mandatory default stamped (IsManual)', 'ismanual=' + row.ismanual);
  const o = ML.newPO(trx, 'c_order', {}); R(o.processed === 'N' && o.posted === 'N' && o.processing === undefined, '§NEWPO-JAVA standard defaults only where the column exists', JSON.stringify({ processed: o.processed, posted: o.posted, processing: o.processing })); }
console.log('§TRX-FIXES-SUMMARY fail=' + fail + ' verdict=' + (fail ? 'FAIL' : 'PASS')); process.exit(fail ? 1 : 0);
