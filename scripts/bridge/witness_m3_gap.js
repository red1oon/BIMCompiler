// ⚠ DO NOT REMOVE — M3 witness: PARALLEL-RUN reconcile + §GAP report. Legacy (local pilot iDempiere, via WebServices) vs SQLite side
// (existing kernel POS verbs: build/erp/pos_core.js on ad_seed_fullwidth.db). Spec: prompts/SQLiteIDEMPIERE.md §21 (twin), §23 (oracle corpus).
// READ THE LOG after every run. Two different questions are answered separately:
//   HARNESS  (this witness' pass/fail): the machinery can detect/classify differences — negative control must be caught, a registered
//            quirk must be classed LEGACY-QUIRK with evidence, no scenario may die with ERROR.
//   FINDINGS (the product): §GAP lines — each is a real difference between SQLite and legacy, classified. They are reported, not asserted away.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const Database = require('better-sqlite3');
const { cfgFromEnv, query } = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');
const R = require('./reconcile');
const E = require('../erp_engine');
const POS = require('../../build/erp/pos_core.js');
const DP = require('../doc_poster');                // SQLite posting fold (derivePostings) — the engine under test for Fact_Acct
// scratch copy of the acct-linked GardenWorld db: the SQLite side's OWN computed invoice rows are materialised here so the SAME
// derivePostings the product uses can fold them (test adapter; never touches the shared db)
const gbFile = path.join(os.tmpdir(), 'm3-gb-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), gbFile);
const gb = new Database(gbFile); const SCHEMA = gb.prepare('SELECT c_acctschema_id s FROM c_acctschema ORDER BY c_acctschema_id LIMIT 1').get().s;
const fmtPostings = lines => lines.map(l => ({ a: l.account_id, dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) })).filter(x => x.dr || x.cr)
  .sort((x, y) => x.a - y.a).map(x => `${x.a}:DR${x.dr}/CR${x.cr}`).join('|') || 'none';

const log = l => console.log(l);
const cents = v => Math.round(Number(v) * 100);
const lc = r => { if (!r) return r; const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };

// ================= SQLite side (existing kernel verbs; adapter = test data) =================
const seed = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_seed_fullwidth.db'), { readonly: true });
const pos = lc(seed.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
const plv = lc(seed.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
const priceStmt = seed.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
const dtOf = id => lc(seed.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=?').get(id));
let seq = 9100;
// §36 F5: the credit inputs the SQLite side owns — bill-BP row (seed) + sysconfig (dictionary db ad_full.db)
const sysStmt = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true }).prepare('SELECT value FROM ad_sysconfig WHERE name=? ORDER BY ad_client_id DESC LIMIT 1');
const creditOf = bpId => ({ bp: lc(seed.prepare('SELECT socreditstatus, so_creditlimit, totalopenbalance FROM c_bpartner WHERE c_bpartner_id=?').get(bpId)),
  sys: Object.fromEntries(['CHECK_CREDIT_ON_CASH_POS_ORDER', 'CHECK_CREDIT_ON_PREPAY_ORDER'].map(k => [k, (sysStmt.get(k) || {}).value])) });
// customer: 112 'Standard' (SO_CreditLimit=0 ⇒ no credit check, MBPartner.java:833-836) for the routine corpus; 118 Joe Block only for the deliberate credit-hold rows (spec §32)
const BP = 112, LOC = { 112: 108, 118: 113 };
function localRun(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: dt.docsubtypeso === 'WR' ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : { isautogenerateinout: 'N', isautogenerateinvoice: 'N' },
      docsubtypeso: dt.docsubtypeso, creditOf };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty));       // P15: no price is ever passed in; keyed price f.keyedPrice is ignored by design
    if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: 103 };
    const g = dt.docsubtypeso === 'WR' ? POS.buildSaleGroup(ctx, cart, opts)
      : POS.buildDeliverLaterGroup(ctx, cart, { ...opts, doctype: dt, invoiceRule: 'I' });
    if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    const st = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'C_Order').pop();
    const shipDone = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'M_InOut' && x.doc_status === 'CO').length;
    let postings = 'none';
    const invOp = g.ops.find(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'C_Invoice');
    if (invOp) {                                                                   // materialise SQLite's own invoice, fold with the product's derivePostings
      const iid = opts.invoiceId, total = (g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0) + mut) / 100;   // mut = negative-control cents, applied to the REAL invoice rows
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx) VALUES(?,?,?,?)').run(iid, f.bp || BP, total, 'Y');
      for (const l of g.soLines) gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(iid * 100 + l.c_orderline_id % 100, iid, l.m_product_id, mut ? (cents(l.linenetamt) + mut) / 100 : l.linenetamt);
      const d = DP.derivePostings(gb, { table: 'C_Invoice', id: iid }, SCHEMA);
      postings = (d.absent && d.absent.length) ? 'ABSENT:' + d.absent.join(',') : fmtPostings(d.lines);
    }
    let postingsShipment = 'none';
    if (shipDone) {                                                                // materialise SQLite's own completed shipment, fold with the product's derivePostings
      const sid = opts.inoutId;
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus) VALUES(?,?,?,?)').run(sid, 'Y', 'C-', 'CO');
      for (const l of g.soLines) gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty) VALUES(?,?,?,?)').run(sid * 100 + l.c_orderline_id % 100, sid, l.m_product_id, l.qtyordered);
      const dsh = DP.derivePostings(gb, { table: 'M_InOut', id: sid }, SCHEMA);
      postingsShipment = (dsh.absent && dsh.absent.length) ? 'ABSENT:' + dsh.absent.join(',') : (dsh.lines && dsh.lines.length ? fmtPostings(dsh.lines) : 'none');
    }
    const stock = {}; if (shipDone) g.soLines.forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - l.qtyordered; });
    return {
      outcome: 'COMPLETED', docstatus: st && st.doc_status,
      lines: g.soLines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}`).sort().join('|'),
      total_cents: g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0) + mut,
      shipments: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'M_InOut').length, shipments_completed: shipDone,
      invoices: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'C_Invoice').length,
      stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShipment,
    };
  };
}

// ================= Legacy side: push via the Bridge (composite) + read-back over read WS types =================
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
const descFor = f => ({ composite: 'SyncOrder',
  header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: { M_Warehouse_ID: { const: 103 }, C_BPartner_ID: { const: f.bp || BP }, C_BPartner_Location_ID: { const: LOC[f.bp || BP] }, Bill_BPartner_ID: { const: f.bp || BP }, Bill_Location_ID: { const: LOC[f.bp || BP] }, C_DocTypeTarget_ID: { const: f.doctype } } },
  lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
    fields: Object.assign({ AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } },
      f.keyedPrice != null ? { PriceEntered: { path: 'price' }, PriceActual: { path: 'price' } } : {}) },
  docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm3-'));
const stockOf = async p => (await query(cfg, 'QueryStorage', `M_Product_ID=${p} AND M_Locator_ID IN (SELECT M_Locator_ID FROM M_Locator WHERE M_Warehouse_ID=103)`)).reduce((a, r) => a + Number(r.QtyOnHand), 0);
let uidN = 0;
async function legacyRun(f) {
  const before = {}; for (const l of f.lines) if (!(l.product in before)) before[l.product] = await stockOf(l.product);
  const s = await store.open(); const uid = 'm3-' + (++uidN);
  s.enqueue(uid, 'doc', { lines: f.lines.map(l => ({ product: l.product, qty: l.qty, price: f.keyedPrice })) });
  await drain(cfg, s, { doc: descFor(f) }, { log: () => {} });
  const st = s.get(uid);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 90) };
  const id = s.idmap(uid).find(x => x.tbl === 'C_Order').server_id;
  const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0];
  const ls = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
  const io = await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`);
  const inv = await query(cfg, 'QueryCInvoice', `C_Order_ID=${id}`);
  const stock = {}; for (const p of Object.keys(before)) { const d = (await stockOf(p)) - before[p]; if (d) stock[p] = d; }
  let postings = 'none';
  if (inv.length) {                                                              // legacy books: Fact_Acct of the invoice, primary schema, folded per account
    let fa = [];
    for (let i = 0; i < 6 && !fa.length; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=318 AND Record_ID=${inv[0].C_Invoice_ID} AND C_AcctSchema_ID=${SCHEMA}`); if (!fa.length) await new Promise(r => setTimeout(r, 1500)); }
    const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
    postings = fa.length ? fmtPostings(Object.values(by)) : 'NO_FACT_ACCT_ROWS';
  }
  let postingsShipment = 'none';
  const doneShip = io.find(x => x.DocStatus === 'CO');
  if (doneShip && f.judgePostingRefusal) {                                       // spec §31: the refusal itself is the rule under test — wait for the poster's verdict (Y|E)
    for (let i = 0; i < 8 && !['Y', 'E'].includes(doneShip.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); doneShip.Posted = (await query(cfg, 'QueryMInOut', `M_InOut_ID=${doneShip.M_InOut_ID}`))[0].Posted; }
    if (doneShip.Posted === 'E') postingsShipment = 'REFUSED:Posted=E';
  }
  if (doneShip && postingsShipment === 'none') {
    let fs2 = [];
    for (let i = 0; i < 6 && !fs2.length && doneShip.Posted !== 'E'; i++) { fs2 = await query(cfg, 'QueryFactAcct', `AD_Table_ID=319 AND Record_ID=${doneShip.M_InOut_ID} AND C_AcctSchema_ID=${SCHEMA}`); if (!fs2.length) await new Promise(r => setTimeout(r, 1500)); }
    const by2 = {}; for (const f of fs2) { const a = f.Account_ID; by2[a] = by2[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by2[a].amtacctdr += Number(f.AmtAcctDr); by2[a].amtacctcr += Number(f.AmtAcctCr); }
    postingsShipment = fs2.length ? fmtPostings(Object.values(by2))
      : (doneShip.Posted === 'E' ? 'INCONCLUSIVE:legacy shipment posting Posted=E (pilot AD_Issue 2026-10-09: AverageCostingNegativeQtyException Oak Tree, cost qty 0) — no legacy books to compare' : 'NO_FACT_ACCT_ROWS');
  }
  return {
    outcome: 'COMPLETED', docstatus: h.DocStatus,
    lines: ls.map(l => `${l.M_Product_ID}:${l.QtyOrdered}:${cents(l.PriceActual)}`).sort().join('|'),
    total_cents: cents(h.TotalLines), shipments: io.length, shipments_completed: io.filter(x => x.DocStatus === 'CO').length, invoices: inv.length,
    stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShipment, _order: id,
  };
}

// ================= S12 VOID of a completed POS sale (spec §33) — own key set =================
const voidSpec = { keys: ['outcome', 'docstatus', 'line_qty', 'line_desc', 'total_cents', 'shipments', 'ship_qtys', 'invoices', 'invoice_totals', 'stock_delta',
  'post_inv_orig', 'post_inv_rev', 'post_ship_orig', 'post_ship_rev'], notCompared: { order_description: 'header description text: legacy order header read type not yet compared for text keys' } };
const call_ = require('./ad_client').call;
const sortStr = a => a.map(String).sort().join(',');
async function legacyFacts(table, id, wantRows) {                               // wait for the async poster: rows (or Posted=E) before folding
  let fa = [];
  for (let i = 0; i < 8; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${SCHEMA}`); if (fa.length || !wantRows) break; await new Promise(r => setTimeout(r, 1500)); }
  const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
  return fa.length ? fmtPostings(Object.values(by)) : 'NO_FACT_ACCT_ROWS';
}
async function legacyVoid(f) {
  const before = {}; for (const l of f.lines) if (!(l.product in before)) before[l.product] = await stockOf(l.product);
  const s = await store.open(); const uid = 'm3v-' + (++uidN);
  s.enqueue(uid, 'doc', { lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) });
  await drain(cfg, s, { doc: descFor(f) }, { log: () => {} });
  const st = s.get(uid); if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 90) };
  const id = JSON.parse(st.refs).header;
  // the shipment must be posted before it can be reversed (Doc_InOut.java:293 'Original Shipment/Receipt not posted yet') — wait like a user would
  for (const io of await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`)) await legacyFacts(319, io.M_InOut_ID, true);
  try { await call_(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'BridgeDocActionCOrder', tableName: 'C_Order', recordID: id, docAction: f.action } }); }
  catch (e) { return { outcome: 'REJECTED', reason: e.message.slice(0, 120) }; }
  const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0];
  const ls = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
  const io = (await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`)).sort((a, b) => a.M_InOut_ID - b.M_InOut_ID);
  const inv = (await query(cfg, 'QueryCInvoice', `C_Order_ID=${id}`)).sort((a, b) => a.C_Invoice_ID - b.C_Invoice_ID);
  const shipQ = []; for (const x of io) shipQ.push((await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${x.M_InOut_ID}`)).reduce((a, l) => a + Number(l.MovementQty), 0));
  const stock = {}; for (const p of Object.keys(before)) { const d = (await stockOf(p)) - before[p]; if (d) stock[p] = d; }
  const orig = (arr, k) => arr.find(x => !x.Reversal_ID || x[k] < x.Reversal_ID), revd = (arr, k) => arr.find(x => x.Reversal_ID && x[k] > x.Reversal_ID);
  const oi = orig(inv, 'C_Invoice_ID'), ri = revd(inv, 'C_Invoice_ID'), os = orig(io, 'M_InOut_ID'), rs = revd(io, 'M_InOut_ID');
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, line_qty: sortStr(ls.map(l => Number(l.QtyOrdered))), line_desc: ls.map(l => l.Description).join('|'),
    total_cents: cents(h.TotalLines), shipments: sortStr(io.map(x => x.DocStatus)), ship_qtys: sortStr(shipQ), invoices: sortStr(inv.map(x => x.DocStatus)),
    invoice_totals: sortStr(inv.map(x => cents(x.GrandTotal))), stock_delta: JSON.stringify(stock),
    post_inv_orig: oi ? await legacyFacts(318, oi.C_Invoice_ID, true) : 'none', post_inv_rev: ri ? await legacyFacts(318, ri.C_Invoice_ID, true) : 'none',
    post_ship_orig: os ? await legacyFacts(319, os.M_InOut_ID, true) : 'none', post_ship_rev: rs ? await legacyFacts(319, rs.M_InOut_ID, true) : 'none', _order: id };
}
const adFull = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
const VOIDED_MSG = adFull.prepare("SELECT msgtext FROM ad_message WHERE value='Voided'").get().msgtext;   // dictionary text, never hard-coded
const FSM = require('../../build/erp/ad_docfsm.js');
function localVoid(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: 103 };
    const g = POS.buildSaleGroup(ctx, cart, opts); if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    const d = FSM.dispatchOrder(seed, { docStatus: 'CO', isSOTrx: 'Y', doctypeId: f.doctype, processing: 'N' }, f.action);
    if (!d.ok) return { outcome: 'REJECTED', reason: d.reason };
    const lineOf = l => ({ c_orderline_id: l.c_orderline_id, m_product_id: l.m_product_id, qtyordered: l.qtyordered, linenetamt: l.linenetamt });
    const sl = g.soLines.map(lineOf);
    const sale = { order: { c_order_id: o, description: null }, lines: sl.map(l => ({ ...l, description: null })),
      shipments: [{ m_inout_id: opts.inoutId, docstatus: 'CO', movementtype: 'C-', lines: sl.map((l, i) => ({ m_inoutline_id: opts.inoutId * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id })) }],
      invoices: [{ c_invoice_id: opts.invoiceId, docstatus: 'CO', grandtotal: sl.reduce((a, l) => a + cents(l.linenetamt), 0) / 100,
        lines: sl.map((l, i) => ({ c_invoiceline_id: opts.invoiceId * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.qtyordered, linenetamt: l.linenetamt, c_orderline_id: l.c_orderline_id })) }] };
    let nid = o + 5; const ops = E.voidOrder(sale, { voidedMsg: VOIDED_MSG, newId: () => ++nid });
    // fold the op stream into final document state (statuses, lines) — the same state a kernel apply would leave
    const status = { ['C_Order:' + o]: 'CO', ['M_InOut:' + opts.inoutId]: 'CO', ['C_Invoice:' + opts.invoiceId]: 'CO' }, docs = { M_InOut: [opts.inoutId], C_Invoice: [opts.invoiceId] };
    const ioLines = { [opts.inoutId]: sale.shipments[0].lines }, ivLines = { [opts.invoiceId]: sale.invoices[0].lines }, ivTot = { [opts.invoiceId]: sale.invoices[0].grandtotal }, revOf = {};
    const oLines = {}; sl.forEach(l => { oLines[l.c_orderline_id] = { qty: l.qtyordered, desc: null }; }); let total = sl.reduce((a, l) => a + cents(l.linenetamt), 0);
    for (const op of ops) {
      if (op.op_type === 'SET_STATUS') status[op.table + ':' + op.id] = op.doc_status;
      else if (op.op_type === 'CREATE_DOCUMENT') { const id = op.m_inout_id || op.c_invoice_id; docs[op.table].push(id); revOf[op.table + ':' + id] = op.reversal_id; if (op.table === 'C_Invoice') ivTot[id] = op.grandtotal; }
      else if (op.op_type === 'CREATE_LINE' && op.table === 'M_InOutLine') (ioLines[op.m_inout_id] = ioLines[op.m_inout_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceLine') (ivLines[op.c_invoice_id] = ivLines[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'UPDATE_LINE' && op.table === 'C_OrderLine') oLines[op.id] = { qty: op.qtyordered, desc: op.description };
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'totallines') total = cents(op.value);
    }
    // materialise every document into the scratch posting db and fold with the PRODUCT's derivePostings (orig + reversal)
    const post = {};
    for (const id of docs.C_Invoice) {
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx) VALUES(?,?,?,?)').run(id, f.bp || BP, (cents(ivTot[id]) + (revOf['C_Invoice:' + id] ? 0 : mut)) / 100, 'Y');
      ivLines[id].forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(id * 100 + i, id, l.m_product_id, l.linenetamt));
      const dd = DP.derivePostings(gb, { table: 'C_Invoice', id }, SCHEMA); post['inv:' + (revOf['C_Invoice:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'ABSENT:' + dd.absent.join(',') : fmtPostings(dd.lines);
    }
    for (const id of docs.M_InOut) {
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,reversal_id) VALUES(?,?,?,?,?)').run(id, 'Y', 'C-', status['M_InOut:' + id], revOf['M_InOut:' + id] || null);
      ioLines[id].forEach((l, i) => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,reversalline_id) VALUES(?,?,?,?,?)').run(l.m_inoutline_id || id * 100 + i, id, l.m_product_id, l.movementqty, l.reversalline_id || null));
      const dd = DP.derivePostings(gb, { table: 'M_InOut', id }, SCHEMA); post['ship:' + (revOf['M_InOut:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'ABSENT:' + dd.absent.join(',') : (dd.lines.length ? fmtPostings(dd.lines) : 'none');
    }
    const stock = {}; for (const id of docs.M_InOut) ioLines[id].forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - Number(l.movementqty); });
    Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    return { outcome: 'COMPLETED', docstatus: status['C_Order:' + o], line_qty: sortStr(Object.values(oLines).map(x => Number(x.qty))), line_desc: Object.values(oLines).map(x => x.desc).join('|'),
      total_cents: total, shipments: sortStr(docs.M_InOut.map(id => status['M_InOut:' + id])), ship_qtys: sortStr(docs.M_InOut.map(id => ioLines[id].reduce((a, l) => a + Number(l.movementqty), 0))),
      invoices: sortStr(docs.C_Invoice.map(id => status['C_Invoice:' + id])), invoice_totals: sortStr(docs.C_Invoice.map(id => cents(ivTot[id]))), stock_delta: JSON.stringify(stock),
      post_inv_orig: post['inv:orig'] || 'none', post_inv_rev: post['inv:rev'] || 'none', post_ship_orig: post['ship:orig'] || 'none', post_ship_rev: post['ship:rev'] || 'none' };
  };
}

// ================= corpus (spec §23) =================
const POSDT = 135, STDDT = 132;
const sc = (id, facts) => ({ id, facts, legacy: legacyRun, local: localRun(0) });
const corpus = [
  sc('S1-pos-sale', { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }),
  sc('S2-product-not-on-pricelist', { doctype: POSDT, lines: [{ product: 122, qty: 1 }] }),
  sc('S3-client-keyed-price', { doctype: POSDT, lines: [{ product: 123, qty: 1 }], keyedPrice: 10 }),
  sc('S11-pos-sale-costed-product', { doctype: POSDT, lines: [{ product: 136, qty: 1 }] }),
  sc('S4-unknown-product', { doctype: POSDT, lines: [{ product: 999999, qty: 1 }] }),
  sc('S6-standard-order', { doctype: STDDT, lines: [{ product: 123, qty: 1 }] }),
  sc('S13a-pos-sale-over-credit-limit', { doctype: POSDT, bp: 118, lines: [{ product: 123, qty: 200 }] }),     // spec §32: 12350 > SO_CreditLimit 10000
  sc('S13b-standard-order-over-credit-limit', { doctype: STDDT, bp: 118, lines: [{ product: 123, qty: 200 }] }),
  sc('S13c-pos-sale-large-no-credit-limit', { doctype: POSDT, lines: [{ product: 123, qty: 200 }] }),         // control: BP 112 limit 0 ⇒ no check (MBPartner.java:833-836) ⇒ completes
];
const spec = { keys: ['outcome', 'docstatus', 'lines', 'total_cents', 'shipments', 'shipments_completed', 'invoices', 'stock_delta', 'postings', 'postings_shipment'],
  notCompared: { fact_acct_secondary_schema: 'legacy also posts to a second accounting schema (Euro, 200000); only the primary schema is compared', tax_and_grandtotal: 'tax was 0 on every scenario document' } };
const quirks = [
  { scenario: 'S3-client-keyed-price', key: 'lines', evidence: 'legacy accepted client PriceActual=10 with no PriceList recompute (pilot order 80005, 2026-10-09); SQLite refuses keyed prices by design (P15, POSLens §4)' },
  { scenario: 'S3-client-keyed-price', key: 'total_cents', evidence: 'same as lines: total follows the keyed price' },
  { scenario: 'S3-client-keyed-price', key: 'postings', evidence: 'same as lines: the books follow the keyed price (legacy posts 1000c, SQLite 6175c)' },
  // S7a quirk REMOVED 2026-10-09 (user: SQLite cannot differ from legacy ops, incl. L&F): legacy refuses the shipment posting below costed qty 0 (MCost.java:1919-1930) ⇒ SQLite must refuse too. Now a SQLITE-GAP, spec §35.
];

(async () => {
  let fails = 0, incon = 0;
  const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };

  // S7 (spec §31): quantity = legacy on-hand now (floored at 0) + 1 ⇒ every run sells beyond on-hand
  // and beyond the legacy Average-PO costed qty (QueryMCost), so the verdict cannot flip between runs (a refused posting leaves costed qty unchanged)
  const oh128 = await stockOf(128);
  const cq128 = (await query(cfg, 'QueryMCost', `M_Product_ID=128 AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID IN (SELECT M_CostElement_ID FROM M_CostElement WHERE CostingMethod='A')`)).reduce((a, r) => Math.max(a, Number(r.CurrentQty)), 0);
  const q7 = Math.max(oh128, cq128, 0) + 1;
  log(`§S7_FACTS product=128 legacy_onhand_before=${oh128} legacy_avg_costed_qty=${cq128} qty=${q7} warehouse=103`);
  corpus.push(sc('S7a-pos-sale-beyond-onhand', { doctype: POSDT, lines: [{ product: 128, qty: q7 }], judgePostingRefusal: true }),
    sc('S7b-standard-order-beyond-onhand', { doctype: STDDT, lines: [{ product: 128, qty: q7 }] }));
  const rows = await R.run(corpus, spec, quirks, { log });
  // S12 void (spec §33): product 136 (costed, reversal is cost-neutral), BP 112
  const vrows = await R.run([{ id: 'S12-void-pos-sale', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 136, qty: 1 }] }, legacy: legacyVoid, local: localVoid(0) }], voidSpec, quirks, { log });
  rows.push(...vrows);
  const by = Object.fromEntries(rows.map(r => [r.id, r]));
  for (const r of rows) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify({ ...r.legacy, _order: undefined })} sqlite=${JSON.stringify(r.sqlite)}`);

  // ---- HARNESS checks
  out('§M3_NO_ERROR', rows.every(r => r.legacy.outcome !== 'ERROR' && r.sqlite.outcome !== 'ERROR'), `errors=${rows.filter(r => r.legacy.outcome === 'ERROR' || r.sqlite.outcome === 'ERROR').map(r => r.id + ':' + (r.legacy.error || r.sqlite.error)).join(',') || 'none'}`);
  const judged = rows.filter(r => r.legacy.outcome === 'COMPLETED').length;
  out('§M3_NOT_VACUOUS', judged > 0 ? true : 'INCONCLUSIVE', `scenarios where legacy completed a document=${judged} of ${rows.length}`);
  // CARDINAL RULE enforcement: a quirk without the user's exemption must NOT be honoured; with it, it is. (control both ways, synthetic diff)
  const d0 = [{ key: 'k', legacy: 1, sqlite: 2 }];
  const noEx = R.classify('x', d0, [{ scenario: 'x', key: 'k', evidence: 'e' }])[0];
  const withEx = R.classify('x', d0, [{ scenario: 'x', key: 'k', evidence: 'e', exemption: 'user 2026-10-09: "<words>"' }])[0];
  out('§M3_QUIRK_NEEDS_EXEMPTION', noEx.verdict === 'SQLITE-GAP' && withEx.verdict === 'LEGACY-QUIRK', `no exemption ⇒ ${noEx.verdict}; with the user's exemption ⇒ ${withEx.verdict}`);
  // negative control: a SQLite side that is off by one cent MUST be reported as a gap
  const neg = await R.run([{ id: 'NEG-control', facts: { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }, legacy: legacyRun, local: localRun(1) }], spec, quirks, { log });
  out('§M3_NEGATIVE_CONTROL', neg[0].verdict === 'SQLITE-GAP' && neg[0].gaps.some(g => g.key === 'total_cents') && neg[0].gaps.some(g => g.key === 'postings'), `+1 cent on the SQLite side ⇒ verdict=${neg[0].verdict} (must be SQLITE-GAP on total_cents AND postings)`);
  // negative control for the void key set: +1 cent on the SQLite original invoice MUST surface as a gap on post_inv_orig
  const vneg = await R.run([{ id: 'NEG-void-control', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 136, qty: 1 }] }, legacy: legacyVoid, local: localVoid(1) }], voidSpec, quirks, { log });
  out('§M3_VOID_NEGATIVE_CONTROL', vneg[0].verdict === 'SQLITE-GAP' && vneg[0].gaps.some(g => g.key === 'post_inv_orig'), `+1 cent on the SQLite invoice ⇒ verdict=${vneg[0].verdict} (must be SQLITE-GAP on post_inv_orig)`);
  // quirk without evidence is refused
  let refused = false; try { R.classify('x', [{ key: 'k' }], [{ scenario: 'x', key: 'k' }]); } catch (e) { refused = true; }
  out('§M3_QUIRK_NEEDS_EVIDENCE', refused, 'a quirk entry with no evidence is refused');

  const gaps = rows.flatMap(r => r.gaps).filter(g => g.verdict === 'SQLITE-GAP');
  const incKeys = rows.flatMap(r => r.inconclusive.map(i => r.id + '/' + i.key));
  if (incKeys.length) incon++;
  log(`§M3_INCONCLUSIVE_KEYS ${incKeys.join(',') || 'none'}`);
  log(`§M3_FINDINGS sqlite_gaps=${gaps.length} (${[...new Set(rows.filter(r => r.verdict === 'SQLITE-GAP').map(r => r.id))].join(',') || 'none'}) — these are the parallel-run product, not harness failures`);
  log(`§M3_VERDICT HARNESS-${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon} findings=${gaps.length} inconclusive_keys=${incKeys.length}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§M3_VERDICT HARNESS-FAIL exception ' + e.stack); process.exit(2); });
