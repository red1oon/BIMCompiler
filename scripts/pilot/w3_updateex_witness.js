#!/usr/bin/env node
// W3 fix-3 witness — ad_process.js processDB().executeUpdateEx translates the three real core-process SQL shapes
// (CLAUDE.md §ERP; ERP_IDEMPIERE_UX_PARITY.md §CP-OPEN 4c). Each statement is the Java text (cited) run on a stub Trx over sql.js;
// it asserts the rows changed + the returned count. A statement that throws / returns -1 / changes the wrong rows => FAIL.
//  1 aliased UPDATE + row-value SET + EXISTS : InventoryCountUpdate.java:89-99
//  2 row-value IN                            : InventoryCountUpdate.java:74-82
//  3 row-value SET with scalar subselect, aliased: MJournal.java:404-408 (updateBatch)
//  4 aliased DELETE + row-value IN           : DocumentTypeVerify.java:130-141
const os = require('os'), path = require('path');
const OOTB = process.env.CP_OOTB || '/tmp/wt-callouts';
(async () => {
  const SQL = await require(os.homedir() + '/bim-ootb/tests/node_modules/sql.js')();
  const db = new SQL.Database();
  db.run(`CREATE TABLE m_inventoryline(m_inventoryline_id int, m_inventory_id int, m_product_id int, m_locator_id int, m_attributesetinstance_id int, isactive text, qtybook, qtycount, updated, updatedby);
   CREATE TABLE m_storageonhand(m_product_id int, m_locator_id int, m_attributesetinstance_id int, qtyonhand);
   CREATE TABLE gl_journalbatch(gl_journalbatch_id int, totaldr, totalcr);
   CREATE TABLE gl_journal(gl_journal_id int, gl_journalbatch_id int, isactive text, totaldr, totalcr);
   CREATE TABLE c_periodcontrol(c_periodcontrol_id int, c_period_id int, docbasetype text);
   INSERT INTO m_inventoryline VALUES (1,50,10,1,0,'Y',0,0,NULL,NULL),(2,50,10,1,0,'Y',0,0,NULL,NULL),(3,50,11,1,0,'Y',0,0,NULL,NULL),(4,50,12,1,0,'Y',0,0,NULL,NULL),(5,51,10,1,0,'Y',0,0,NULL,NULL);
   INSERT INTO m_storageonhand VALUES (11,1,0,5),(11,1,0,7),(10,1,0,100);
   INSERT INTO gl_journalbatch VALUES (9,0,0),(8,0,0);
   INSERT INTO gl_journal VALUES (1,9,'Y',10,10),(2,9,'Y',5,5),(3,9,'N',99,99),(4,8,'Y',1,1);
   INSERT INTO c_periodcontrol VALUES (1,7,'ARI'),(2,7,'ARI'),(3,7,'ARI'),(4,7,'API');`);
  const q = (sql, p) => { const st = db.prepare(sql), rows = []; try { st.bind((p || []).map(v => v === undefined ? null : v)); const cols = st.getColumnNames(); while (st.step()) { const v = st.get(), o = {}; cols.forEach((c, i) => { o[String(c).toLowerCase()] = v[i]; }); rows.push(o); } } finally { st.free(); } return rows; };
  const KEY = { m_inventoryline: 'm_inventoryline_id', gl_journalbatch: 'gl_journalbatch_id', c_periodcontrol: 'c_periodcontrol_id' };
  const log = [], upd = [], del = [];
  const trx = { q, idCol: t => KEY[t], say: m => log.push(m),
    get: (t, id) => q('SELECT * FROM ' + t + ' WHERE ' + KEY[t] + '=?', [id])[0],
    update: (t, cur, ch) => { upd.push([t, cur[KEY[t]], ch]); }, del: (t, cur) => { del.push([t, cur[KEY[t]]]); }, insert: () => {} };
  const A = require(path.join(OOTB, 'erp/ad_callout.js')); const P = require(path.join(OOTB, 'erp/ad_process.js'));
  A.RUNTIME.DB = { query: q };
  const D = P.processDB(trx);
  let fail = 0; const chk = (name, ok, extra) => { if (!ok) fail++; console.log('§W3-UPDATEEX ' + name + ' ' + (ok ? 'PASS' : 'FAIL') + ' ' + (extra || '')); };
  const run = (f) => { upd.length = 0; del.length = 0; try { return f(); } catch (e) { return 'THROW ' + e.message; } };
  let n = run(() => D.executeUpdate("UPDATE M_InventoryLine SET IsActive='N' WHERE M_Inventory_ID=50 AND (M_Product_ID, M_Locator_ID, M_AttributeSetInstance_ID) IN (SELECT M_Product_ID, M_Locator_ID, M_AttributeSetInstance_ID FROM M_InventoryLine WHERE M_Inventory_ID=50 GROUP BY M_Product_ID, M_Locator_ID, M_AttributeSetInstance_ID HAVING COUNT(*) > 1)", 'trxName'));
  chk('rowvalue-IN', n === 2 && upd.map(u => u[1]).sort().join() === '1,2' && upd.every(u => u[2].isactive === 'N'), 'count=' + n + ' ids=' + upd.map(u => u[1]));
  n = run(() => D.executeUpdate("UPDATE M_InventoryLine l SET (QtyBook,QtyCount) = (SELECT SUM(QtyOnHand),SUM(QtyOnHand) FROM M_StorageOnHand s WHERE s.M_Product_ID=l.M_Product_ID AND s.M_Locator_ID=l.M_Locator_ID AND s.M_AttributeSetInstance_ID=l.M_AttributeSetInstance_ID), Updated=datetime('now'), UpdatedBy=100 WHERE M_Inventory_ID=50 AND EXISTS (SELECT * FROM M_StorageOnHand s WHERE s.M_Product_ID=l.M_Product_ID AND s.M_Locator_ID=l.M_Locator_ID AND s.M_AttributeSetInstance_ID=l.M_AttributeSetInstance_ID)", trx));
  const u1 = upd.map(u => u[1]).sort().join();
  chk('alias+rowvalue-SET+EXISTS', n === 3 && u1 === '1,2,3' && upd.filter(u => u[1] === 3)[0][2].qtybook === 12 && upd.filter(u => u[1] === 3)[0][2].qtycount === 12 && upd.filter(u => u[1] === 1)[0][2].qtybook === 100 && upd[0][2].updatedby === 100, 'count=' + n + ' ids=' + u1 + ' line3=' + JSON.stringify((upd.filter(u => u[1] === 3)[0] || [])[2]));
  n = run(() => D.executeUpdate("UPDATE GL_JournalBatch jb SET (TotalDr, TotalCr) = (SELECT COALESCE(SUM(TotalDr),0), COALESCE(SUM(TotalCr),0) FROM GL_Journal j WHERE j.IsActive='Y' AND jb.GL_JournalBatch_ID=j.GL_JournalBatch_ID) WHERE GL_JournalBatch_ID=9", trx));
  chk('alias+rowvalue-SET+scalar-subselect-with-inner-WHERE', n === 1 && upd[0][2].totaldr === 15 && upd[0][2].totalcr === 15, 'count=' + n + ' ' + JSON.stringify(upd[0]));
  n = run(() => D.executeUpdate("UPDATE M_InventoryLine l SET QtyCount=? WHERE M_Inventory_ID=?", [0, 99], 'trxName'));
  chk('control-no-rows (not vacuous: 0 when none match)', n === 0 && upd.length === 0, 'count=' + n);
  n = run(() => D.executeUpdate("DELETE FROM C_PeriodControl pc1 WHERE (C_Period_ID, DocBaseType) IN (SELECT C_Period_ID, DocBaseType FROM C_PeriodControl pc2 GROUP BY C_Period_ID, DocBaseType HAVING COUNT(*) > 1) AND C_PeriodControl_ID NOT IN (SELECT MIN(C_PeriodControl_ID) FROM C_PeriodControl pc3 GROUP BY C_Period_ID, DocBaseType)", false, trx));
  chk('aliased-DELETE+rowvalue-IN', n === 2 && del.map(d => d[1]).sort().join() === '2,3', 'count=' + n + ' ids=' + del.map(d => d[1]));
  console.log('§W3-UPDATEEX verdict=' + (fail ? 'FAIL(' + fail + ')' : 'PASS'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('§W3-UPDATEEX FATAL ' + (e.stack || e)); process.exit(2); });
