// ⚠ DO NOT REMOVE — SCOPE: film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22). READ out/seed.log after every run.
//   Makes the ONE seed the film's twin pages are served as ad_seed.db: the committed bim-ootb erp/ad_seed.db plus ONE Sales Order for Joe Block (customer 118), dated in a CLOSED past period
//   (Sales-Order period control of 2026-10-15 = C, today's period = O) and the customer on credit hold (SOCreditStatus H): exactly the two blockers W-HELP-PEEK P3 proves (period first, credit second).
//   Same kernel calls as erp/tests/witness_help_peek.js (newOrder, the period lookups, the updates): nothing invented, every id is read from the seed. Writes out/film_seed.db and §FILM_SEED lines.
//   Usage: node seed_make.js <bim-ootb tree>
'use strict';
const fs = require('fs'), path = require('path');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), ERP = path.join(TREE, 'erp'); fs.mkdirSync(OUT, { recursive: true });
const LOG = [], L = (m) => { LOG.push(m); process.stdout.write(m + '\n'); }, _log = console.log; console.log = () => {};   // the model's own § lines stay quiet here; the film's lines print
(async () => {
  const K = require(path.join(ERP, 'ws_kernel.js')), k = await K.load(), db = k.db, ML = k.ML, q = k.q, A = require(path.join(ERP, 'ad_callout.js'));
  (fs.readFileSync(path.join(ERP, 'idempiere.html'), 'utf8').match(/<script src="(model_[a-z_]+\.js)/g) || []).forEach((m) => { try { require(path.join(ERP, m.replace('<script src="', ''))); } catch (e) { L('§FILM_SEED load ' + m + ' failed ' + (e && e.message)); } });
  A.bind(q, {});
  const S = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'film:help-peek' };
  const per = (d) => q("SELECT p.c_period_id AS id, p.name FROM c_period p JOIN c_year y ON y.c_year_id=p.c_year_id JOIN c_calendar c ON c.c_calendar_id=y.c_calendar_id WHERE c.ad_client_id=11 AND date(p.startdate)<=date(?) AND date(p.enddate)>=date(?)", [d, d])[0];
  const past = '2026-10-15 00:00:00', today = q("SELECT date('now') AS d")[0].d + ' 00:00:00', pP = per(past), pT = per(today);
  if (!pP || !pT) { L('§FILM_SEED FAIL no period for ' + (!pP ? past : today)); process.exit(1); }
  db.run("UPDATE c_periodcontrol SET periodstatus='O' WHERE c_period_id=? AND docbasetype='SOO'", [pT.id]); db.run("UPDATE c_periodcontrol SET periodstatus='C' WHERE c_period_id=? AND docbasetype='SOO'", [pP.id]);
  db.run("UPDATE c_acctschema SET autoperiodcontrol='N' WHERE ad_client_id=11");
  const r = k.inTrx(S, { ws: 'film-seed' }, (trx) => {
    const o = ML.newPO(trx, 'c_order', { ad_org_id: 11, issotrx: 'Y', c_doctypetarget_id: 132, c_doctype_id: 0, c_bpartner_id: 118, c_bpartner_location_id: 113, bill_bpartner_id: 118, bill_location_id: 113, m_pricelist_id: 101, c_currency_id: 100, m_warehouse_id: 103, c_paymentterm_id: 105, paymentrule: 'P', deliveryrule: 'A', invoicerule: 'I', deliveryviarule: 'P', priorityrule: '5', salesrep_id: 100 });
    o.dateordered = past; o.dateacct = past; o.datepromised = past; const sv = ML.save(trx, 'c_order', null, o); if (!sv.ok) return { ok: false, error: 'order ' + sv.error };
    const l = ML.newPO(trx, 'c_orderline', { c_order_id: sv.row.c_order_id, ad_org_id: 11, line: 10, m_product_id: 123, qtyentered: 2, qtyordered: 2, m_warehouse_id: 103, c_currency_id: 100 }); const sl = ML.save(trx, 'c_orderline', null, l); return sl.ok ? { ok: true } : { ok: false, error: 'line ' + sl.error };
  });
  const id = q('SELECT max(c_order_id) AS id FROM c_order WHERE ad_client_id=11')[0].id;
  db.run("UPDATE c_bpartner SET socreditstatus='H' WHERE c_bpartner_id=118");
  const o = q('SELECT c_order_id, documentno, docstatus, dateordered, dateacct FROM c_order WHERE c_order_id=?', [id])[0], bp = q('SELECT name, socreditstatus FROM c_bpartner WHERE c_bpartner_id=118')[0];
  L('§FILM_SEED order ok=' + r.ok + (r.error ? ' err=' + r.error : '') + ' id=' + id + ' documentno=' + o.documentno + ' docstatus=' + o.docstatus + ' dateordered=' + o.dateordered + ' pastPeriod=' + pP.id + '(' + pP.name + ',SOO=C) todayPeriod=' + pT.id + '(' + pT.name + ',SOO=O) bp=' + bp.name + ' credit=' + bp.socreditstatus);
  const sooP = q("SELECT periodstatus FROM c_periodcontrol WHERE c_period_id=? AND docbasetype='SOO'", [pP.id])[0], sooT = q("SELECT periodstatus FROM c_periodcontrol WHERE c_period_id=? AND docbasetype='SOO'", [pT.id])[0];
  const ok = r.ok && o.docstatus === 'DR' && bp.socreditstatus === 'H' && sooP.periodstatus === 'C' && sooT.periodstatus === 'O';
  fs.writeFileSync(path.join(OUT, 'film_seed.db'), Buffer.from(db.export())); fs.writeFileSync(path.join(OUT, 'film_seed.json'), JSON.stringify({ order: id, documentno: o.documentno, past, today, pastPeriod: pP, todayPeriod: pT, bp: 118 }));
  L('§FILM_SEED VERDICT ' + (ok ? 'PASS' : 'FAIL') + ' (draft order in a closed period, customer on credit hold, today open) bytes=' + fs.statSync(path.join(OUT, 'film_seed.db')).size);
  fs.writeFileSync(path.join(OUT, 'seed.log'), LOG.join('\n') + '\n'); process.exit(ok ? 0 : 1);
})().catch((e) => { process.stdout.write('§FILM_SEED FAIL threw ' + (e && e.stack || e) + '\n'); process.exit(1); });
