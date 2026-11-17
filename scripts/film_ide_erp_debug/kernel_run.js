#!/usr/bin/env node
// ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md). ONE child process = ONE tree of bim-ootb (OLD or NEW) with the clock FIXED at 2026-11-13 00:30 LOCAL in the zone it is
// started in (TZ=Asia/Kuala_Lumpur): the kernel (erp/ws_kernel.js) takes an order through order -> ship -> invoice by the shipped paths (the method of erp/tests/witness_replay_clock.js, bim-ootb),
// the invoice process given NO date so it takes the session's day. It writes the kernel's database to <out.db> and prints ONE line `KR_RESULT {json}` with the invoice's own row and the
// day the session carried. Nothing is typed by hand. Usage: TZ=Asia/Kuala_Lumpur node kernel_run.js <bim-ootb tree> <out.db>        READ the log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path');
const OOTB = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]), ERP = path.join(OOTB, 'erp');
const LOCAL = '2026-11-13T00:30:00', SESSION = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'film:invoice-dated-yesterday' };
const Real = Date, base = new Real(LOCAL).getTime();   // frozen: the same 00:30 for every call
global.Date = class extends Real { constructor(...a) { if (a.length === 0) super(base); else super(...a); } static now() { return base; } };
(async () => {
  if (!global.window) global.window = {};
  if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
  const quiet = console.log; console.log = function () {};
  const K = require(path.join(ERP, 'ws_kernel.js')), k = await K.load(), AP = require(path.join(ERP, 'ad_process.js'));
  require(path.join(ERP, 'ad_callout.js')).bind(function (sql, p) { return k.q(sql, p); });
  console.log = quiet;
  const ML = k.ML, q = k.q;
  const prod = q("SELECT p.* FROM m_product p JOIN m_storageonhand s ON s.m_product_id=p.m_product_id WHERE p.ad_client_id=11 AND p.isactive='Y' AND p.issold='Y' AND s.qtyonhand>=3 ORDER BY p.m_product_id")[0];
  const wh = q('SELECT l.m_warehouse_id AS id FROM m_locator l JOIN m_storageonhand s ON s.m_locator_id=l.m_locator_id WHERE s.m_product_id=? AND s.qtyonhand>=3 ORDER BY l.m_locator_id', [prod.m_product_id])[0].id;
  const pl = q("SELECT m_pricelist_id AS id FROM m_pricelist WHERE ad_client_id=11 AND issopricelist='Y' AND isactive='Y' ORDER BY isdefault DESC, m_pricelist_id")[0].id;
  const bp = q("SELECT b.c_bpartner_id AS id, (SELECT c_bpartner_location_id FROM c_bpartner_location l WHERE l.c_bpartner_id=b.c_bpartner_id AND l.isactive='Y' ORDER BY 1 LIMIT 1) AS loc FROM c_bpartner b WHERE b.ad_client_id=11 AND b.iscustomer='Y' AND b.isactive='Y' ORDER BY b.c_bpartner_id")[0];
  const pt = q("SELECT c_paymentterm_id AS id FROM c_paymentterm WHERE ad_client_id=11 AND isactive='Y' ORDER BY isdefault DESC, c_paymentterm_id")[0].id;
  const so = q("SELECT c_doctype_id AS id FROM c_doctype WHERE ad_client_id=11 AND docbasetype='SOO' AND docsubtypeso='SO' AND isactive='Y' ORDER BY c_doctype_id")[0].id;
  const O = k.inTrx(SESSION, { ws: 'film:order' }, trx => {
    const o = ML.newPO(trx, 'c_order', { ad_org_id: 11, c_doctypetarget_id: so, c_doctype_id: so, c_bpartner_id: bp.id, c_bpartner_location_id: bp.loc, bill_bpartner_id: bp.id, bill_location_id: bp.loc, m_pricelist_id: pl, c_paymentterm_id: pt, c_currency_id: 100, m_warehouse_id: wh, issotrx: 'Y', deliveryrule: 'A', invoicerule: 'I', paymentrule: 'P', priorityrule: '5', freightcostrule: 'I', deliveryviarule: 'P', docaction: 'CO' });
    const sv = ML.save(trx, 'c_order', null, o); if (!sv.ok) return { ok: false, error: 'save c_order: ' + sv.error };
    const l = ML.newPO(trx, 'c_orderline', { c_order_id: sv.row.c_order_id, ad_org_id: 11, line: 10, m_product_id: prod.m_product_id, c_uom_id: prod.c_uom_id, qtyentered: 3, qtyordered: 3, m_warehouse_id: wh, c_currency_id: 100 });
    const sl = ML.save(trx, 'c_orderline', null, l); if (!sl.ok) return { ok: false, error: 'save c_orderline: ' + sl.error };
    const r = ML.processIt(trx, 'c_order', sv.row.c_order_id, 'CO'); return { ok: !!r.ok, error: r.ok ? null : (r.msg || r.status) };
  });
  const proc = (id, extra) => k.inTrx(SESSION, { ws: 'film:p' + id }, trx => { const r = AP.runInTrx(trx, id, { params: Object.assign({ AD_Client_ID: 11, AD_Org_ID: 11, DocAction: 'CO', ConsolidateDocument: 'Y' }, extra || {}) }); return { ok: !!(r && r.ok), error: r && r.ok ? null : (r && (r.msg || r.error)) }; });
  const SH = proc(118, { M_Warehouse_ID: wh }), IV = proc(119);   // 119 = InvoiceGenerate, NO DateInvoiced: it takes the session's day
  const inv = q("SELECT c_invoice_id, documentno, dateinvoiced, dateacct, created, grandtotal, docstatus FROM c_invoice WHERE ad_client_id=11 ORDER BY ABS(c_invoice_id) DESC LIMIT 1")[0] || null;
  fs.writeFileSync(OUT, Buffer.from(k.db.export()));
  const pad = n => String(n).padStart(2, '0'), n0 = new Real(base), localDay = n0.getFullYear() + '-' + pad(n0.getMonth() + 1) + '-' + pad(n0.getDate());
  console.log('KR_RESULT ' + JSON.stringify({ tz: process.env.TZ, local: LOCAL, localDay, utcDay: n0.toISOString().slice(0, 10), sessionDay: String(k.env(SESSION).date).slice(0, 10), steps: { order: O.ok, ship: SH.ok, invoice: IV.ok }, errors: [O.error, SH.error, IV.error].filter(Boolean), invoice: inv, db: OUT, bytes: fs.statSync(OUT).size }));
})().catch(e => { console.error('KR_FAIL ' + (e && e.stack || e)); process.exit(1); });
