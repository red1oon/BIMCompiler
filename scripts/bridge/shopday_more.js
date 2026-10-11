// ⚠ DO NOT REMOVE -- SHOP-DAY STEPS 11..24 that were NOT RUN in §SHOPDAY-RUN-1 (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-2 R2.5). READ THE LOG: §SHOPDAY_STEP lines.
// Each step runs on BOTH sides with the same facts (legacy through the WS as the new client's Admin role; SQLite = the engine verbs on the shop twin) and is judged by
// reconcile.js keys; a step is MATCH only if the compared state is non-empty and equal. Legacy is measured first; a difference is a numbered gap, not an exemption.
'use strict';
module.exports = function makeSteps(env) {
  const { docEnv, rrun, R, log, out, TODAY } = env;
  const steps = {};

  // SD-13 credit-limit refusal: SD-CUST2 (SO_CreditLimit=500) orders 6 x 100 (+10% tax) = 660 > 500 => MBPartner.getSOCreditStatus -> CreditManagerOrder refuses the Complete.
  steps.sd13a = async () => {
    // a new BP's SOCreditStatus is 'X' (no credit check: MBPartner.setInitialDefaults:296; getSOCreditStatus(amt) returns it unchanged, MBPartner.java:833-836, so the order of 660 against a
    // limit of 500 COMPLETES on both sides -- measured, run6). The shop switches the check on in the BP window: SOCreditStatus='O' (Credit OK), a normal-user master update.
    await env.lupdate('C_BPartner', await env.lrefId('c_bpartner', 'Value', 'SD-CUST2'), { SOCreditStatus: 'O' });
    env.tw.db.prepare("UPDATE c_bpartner SET socreditstatus='O' WHERE value='SD-CUST2' AND ad_client_id=?").run(env.tw.client);
    // compared right here, BEFORE any document: later the legacy row also carries BP statistics (FirstSale, ActualLifeTimeValue, SO_CreditUsed, TotalOpenBalance) that
    // CreditManagerInvoice / MAllocationHdr maintain at document completion (G-SD7: not persisted on the twin's master row; the semantic values ARE compared as bp_delta at every document step)
    await env.compareStep('SD-13a', ['c_bpartner'], 'credit check switched on for SD-CUST2 (SOCreditStatus=O)');
  };
  steps.sd13 = async () => {
    const x = { ...docEnv(), idBase: 96000, o2c: null }; const C = x.C; x.soPriceList = C.pl.sales; x.o2c = { bp: C.customer2, bpLoc: C.customer2Loc, qty: 6 };
    const O2C = require('./cycle_o2c')(x);
    const rows = await R.run([{ ...O2C.scenario('SO', 0), id: 'SD13-credit-refusal' }], { keys: ['outcome', 'ol_qty', 'bp_delta', 'stock_delta'], notCompared: {} }, [], { log });
    const r = rows[0] || {}, lg = r.legacy || {}, sq = r.sqlite || {};
    log(`§SHOPDAY_OUTCOME SD-13 legacy=${JSON.stringify(lg).slice(0, 260)} sqlite=${JSON.stringify(sq).slice(0, 260)}`);
    const refused = lg.outcome === 'REJECTED' && sq.outcome === 'REJECTED';
    const v = r.verdict === 'MATCH' && refused ? 'MATCH' : (lg.outcome !== 'REJECTED' && sq.outcome !== 'REJECTED') ? 'INCONCLUSIVE' : 'DIFF';   // both completing proves nothing about the refusal
    log(`§SHOPDAY_STEP SD-13 ${v} legacy=${lg.outcome} sqlite=${sq.outcome} reasons: legacy="${(lg.reason || '').slice(0, 90)}" sqlite="${(sq.reason || '').slice(0, 90)}"`); out.steps.push({ id: 'SD-13', verdict: v });
  };

  // ================= SD-11 cash sale at the till / SD-17 void of a completed sale (POS Order, DocSubTypeSO=WR: shipment + invoice generated on Complete) =================
  // Same facts both sides: legacy = SyncOrder composite through the WS (the doc type is the client's own 'POS Order'); SQLite = pos_core.buildSaleGroup, the books folded by derivePostings
  // from the SQLite documents (m3 S1 / S12 re-hosted: witness_m3_gap.js legacyRun/localRun/foldLocal and legacyVoid/localVoid, with the new client's ids instead of GardenWorld's).
  const POSKEYS = ['outcome', 'docstatus', 'lines', 'total_cents', 'shipments', 'shipments_completed', 'invoices', 'stock_delta', 'postings', 'postings_shipment', 'postings_euro', 'postings_shipment_euro', 'cost_qty_delta', 'line_tax', 'order_tax', 'grand_total_cents', 'invoice_tax'];
  const VOIDKEYS = ['outcome', 'docstatus', 'line_qty', 'line_desc', 'total_cents', 'shipments', 'ship_qtys', 'invoices', 'invoice_totals', 'stock_delta', 'post_inv_orig', 'post_inv_rev', 'post_ship_orig', 'post_ship_rev', 'invoice_tax_rev', 'order_desc', 'inv_paid', 'inv_allocations'];
  const sortStr = a => a.map(String).sort().join(',');
  const posState = {};
  const posEnv = () => {
    if (posState.x) return posState;
    const x = docEnv(), C = x.C; posState.x = x; posState.C = C; posState.BP = C.customer; posState.LOC = C.customerLoc; posState.seq = 7100;
    const DESC = { so: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateOrder', table: 'C_Order', fields: { M_PriceList_ID: { const: C.pl.sales }, M_Warehouse_ID: { const: C.wh }, C_BPartner_ID: { const: C.customer }, C_BPartner_Location_ID: { const: C.customerLoc }, Bill_BPartner_ID: { const: C.customer }, Bill_Location_ID: { const: C.customerLoc }, C_DocTypeTarget_ID: { const: C.dt.pos }, DateOrdered: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, AD_Client_ID: { const: C.client }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
      docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } } };
    posState.DESC = DESC; return posState;
  };
  const legacyFactsWait = async (x, table, id) => { let fa = []; for (let i = 0; i < 8 && !fa.length; i++) { fa = await x.query(x.cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${x.SCHEMA}`); if (!fa.length) await new Promise(r => setTimeout(r, 1500)); } return fa; };
  async function legacySale(f) {
    const P = posEnv(), x = P.x, C = P.C, before = {}, cq0 = {};
    for (const l of f.lines) { before[l.product] = await x.locStock(l.product, C.locator); cq0[l.product] = await x.legacyCostQty(l.product); }
    if (!P.link) { let bytes = null; P.link = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: P.DESC }); }
    const uid = P.link.submit('so', { date: TODAY + ' 00:00:00', lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) }); await P.link.drain(); const st = P.link.store.get(uid);
    if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
    if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
    const id = P.link.store.idmap(uid).find(y => y.tbl === 'C_Order').server_id; P.lastOrder = id;
    const h = (await x.query(x.cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0], ls = await x.query(x.cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
    const io = await x.query(x.cfg, 'QueryMInOut', `C_Order_ID=${id}`), inv = await x.query(x.cfg, 'QueryCInvoice', `C_Order_ID=${id}`);
    const stock = {}; for (const p of Object.keys(before)) { const d = (await x.locStock(+p, C.locator)) - before[p]; if (d) stock[p] = d; }
    let postings = 'none', postingsShip = 'none';
    if (inv.length) { const fa = await legacyFactsWait(x, 318, inv[0].C_Invoice_ID); postings = await x.legacyFactsOf(318, inv[0].C_Invoice_ID, x.SCHEMA); void fa; }
    const doneShip = io.find(y => y.DocStatus === 'CO');
    if (doneShip) { for (let i = 0; i < 8 && !['Y', 'E'].includes(doneShip.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); doneShip.Posted = (await x.query(x.cfg, 'QueryMInOut', `M_InOut_ID=${doneShip.M_InOut_ID}`))[0].Posted; }
      postingsShip = doneShip.Posted === 'E' ? 'REFUSED:Posted=E' : await x.legacyFactsOf(319, doneShip.M_InOut_ID, x.SCHEMA); }
    const cq = {}; for (const p of Object.keys(cq0)) cq[p] = await x.legacyCostQty(+p);
    return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${l.QtyOrdered}:${x.cents(l.PriceActual)}`).sort().join('|'), total_cents: x.cents(h.TotalLines), shipments: io.length, shipments_completed: io.filter(y => y.DocStatus === 'CO').length, invoices: inv.length,
      stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShip, postings_euro: postings, postings_shipment_euro: postingsShip,
      line_tax: ls.map(l => `${l.M_Product_ID}:${l.C_Tax_ID}`).sort().join('|'), order_tax: (await x.query(x.cfg, 'QueryCOrderTax', `C_Order_ID=${id}`)).map(t => `${t.C_Tax_ID}:${x.cents(t.TaxBaseAmt)}:${x.cents(t.TaxAmt)}`).sort().join('|') || 'none',
      grand_total_cents: x.cents(h.GrandTotal), invoice_tax: inv.length ? (await x.query(x.cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${inv[0].C_Invoice_ID}`)).map(t => `${t.C_Tax_ID}:${x.cents(t.TaxBaseAmt)}:${x.cents(t.TaxAmt)}`).sort().join('|') || 'none' : 'none',
      cost_qty_delta: JSON.stringify(Object.fromEntries(Object.keys(cq0).map(p => [p, cq[p] - cq0[p]]).filter(y => y[1]))) };
  }
  // the SQLite sale group (pos_core.buildSaleGroup), its documents materialised into the twin and folded with derivePostings
  function localSaleGroup(f) {
    const P = posEnv(), x = P.x, C = P.C, dt = x.dtOf(C.dt.pos);
    const ctx = { pos: { ...x.pos, m_warehouse_id: C.wh, c_doctype_id: C.dt.pos }, priceOf: x.priceOfAt, priceDate: TODAY, bomOf: () => [], taxOf: x.taxOfFor({ bp: C.customer, date: TODAY }), taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded: x.TAX_INCLUDED,
      wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }, docsubtypeso: dt.docsubtypeso, docbasetype: dt.docbasetype, creditOf: x.creditOf, periodCheck: x.periodCheck, acctSetupOf: x.acctSetupOf };
    const cart = f.lines.map(l => x.POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { reject: { outcome: 'REJECTED' } };
    const o = ++P.seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: C.customer, warehouseId: C.wh, dateAcct: TODAY };
    const g = x.POS.buildSaleGroup(ctx, cart, opts); if (!g.ok) return { reject: { outcome: 'REJECTED', reason: g.reason } };
    return { g, opts, o };
  }
  async function localSale(f, mut = 0) {
    const P = posEnv(), x = P.x, C = P.C, gb = x.gb, cents = x.cents, grp = localSaleGroup(f); if (grp.reject) return grp.reject;
    const { g, opts } = grp, cqBefore = {}; for (const l of f.lines) cqBefore[l.product] = x.localCostQty(l.product);
    const st = g.ops.filter(y => y.op_type === 'SET_STATUS' && y.table === 'C_Order').pop(), shipDone = g.ops.filter(y => y.op_type === 'SET_STATUS' && y.table === 'M_InOut' && y.doc_status === 'CO').length;
    const fold = (t, id, sc) => { const d = x.DP.derivePostings(gb, { table: t, id }, sc); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? x.fmtPostings(d.lines) : 'none'); };
    let postings = 'none', postingsShip = 'none';
    if (g.ops.find(y => y.op_type === 'CREATE_DOCUMENT' && y.table === 'C_Invoice')) {
      const iid = opts.invoiceId, total = ((g.grandTotal != null ? g.grandTotal : g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0)) + mut) / 100;
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(iid, C.customer, total, 'Y', x.PL_CURRENCY, TODAY + ' 00:00:00', C.client, C.org);
      for (const t of g.ops.filter(y => y.op_type === 'CREATE_LINE' && y.table === 'C_InvoiceTax')) gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(iid, t.c_tax_id, t.taxamt);
      for (const l of g.soLines) gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(iid * 100 + l.c_orderline_id % 100, iid, l.m_product_id, mut ? (cents(l.linenetamt) + mut) / 100 : l.linenetamt);
      postings = fold('C_Invoice', iid, x.SCHEMA);
    }
    if (shipDone) {
      const sid = opts.inoutId;
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?)').run(sid, 'Y', 'C-', 'CO', TODAY + ' 00:00:00', C.client, C.org);
      for (const l of g.soLines) gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty) VALUES(?,?,?,?)').run(sid * 100 + l.c_orderline_id % 100, sid, l.m_product_id, l.qtyordered);
      const d = x.DP.derivePostings(gb, { table: 'M_InOut', id: sid }, x.SCHEMA);
      if (d.absent && d.absent.length) postingsShip = 'REFUSED:Posted=E'; else { postingsShip = d.lines && d.lines.length ? x.fmtPostings(d.lines) : 'none'; x.applyCostQty(sid); }
    }
    const stock = {}; if (shipDone) g.soLines.forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - l.qtyordered; }); Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    const cqd = JSON.stringify(Object.fromEntries(Object.keys(cqBefore).map(p => [p, x.localCostQty(+p) - cqBefore[p]]).filter(y => y[1])));
    return { outcome: 'COMPLETED', docstatus: st && st.doc_status, lines: g.soLines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}`).sort().join('|'), total_cents: g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0) + mut,
      shipments: g.ops.filter(y => y.op_type === 'CREATE_DOCUMENT' && y.table === 'M_InOut').length, shipments_completed: shipDone, invoices: g.ops.filter(y => y.op_type === 'CREATE_DOCUMENT' && y.table === 'C_Invoice').length,
      stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShip, postings_euro: postings, postings_shipment_euro: postingsShip,
      line_tax: g.soLines.map(l => `${l.m_product_id}:${l.c_tax_id}`).sort().join('|'), order_tax: g.ops.filter(y => y.op_type === 'CREATE_LINE' && y.table === 'C_OrderTax').map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
      grand_total_cents: (g.grandTotal != null ? g.grandTotal : g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0)) + mut, invoice_tax: g.ops.filter(y => y.op_type === 'CREATE_LINE' && y.table === 'C_InvoiceTax').map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none', cost_qty_delta: cqd };
  }
  steps.sd11 = async () => {
    const C = posEnv().C, lines = [{ product: C.prod.mulch, qty: 3 }];
    const rows = await R.run([{ id: 'SD11-cash-sale', facts: { lines }, legacy: legacySale, local: f => localSale(f, 0) }], { keys: POSKEYS, notCompared: {} }, [], { log });
    const v = !rows.length ? 'INCONCLUSIVE' : rows[0].verdict === 'MATCH' ? 'MATCH' : rows[0].verdict === 'ERROR' ? 'BLOCKED' : 'DIFF';
    const lg = (rows[0] || {}).legacy || {}; if (lg.outcome !== 'COMPLETED') log(`§SHOPDAY_LEGACY_RESULT SD-11 ${JSON.stringify(lg).slice(0, 400)}`);
    log(`§SHOPDAY_STEP SD-11 ${v === 'MATCH' && lg.outcome !== 'COMPLETED' ? 'INCONCLUSIVE' : v} scenarios=${rows.length} gaps=${(rows[0] && rows[0].gaps || []).map(g => g.key).join(',') || '-'}`); out.steps.push({ id: 'SD-11', verdict: v === 'MATCH' && lg.outcome !== 'COMPLETED' ? 'INCONCLUSIVE' : v });
  };

  // ---- SD-17 void of a completed sale (MOrder.voidIt reverses the generated shipment + invoice) ----
  const DICTDB = require('./shop_twin').DICT, FSM = require('../../build/erp/ad_docfsm.js');
  async function legacyVoid(f) {
    const P = posEnv(), x = P.x, C = P.C, before = {};
    for (const l of f.lines) before[l.product] = await x.locStock(l.product, C.locator);
    if (!P.link) { let bytes = null; P.link = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: P.DESC }); }
    const uid = P.link.submit('so', { date: TODAY + ' 00:00:00', lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) }); await P.link.drain(); const st = P.link.store.get(uid);
    if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
    const id = P.link.store.idmap(uid).find(y => y.tbl === 'C_Order').server_id;
    // the shipment must be posted before it can be reversed (Doc_InOut "Original Shipment/Receipt not posted yet") -- wait like a user would
    for (const io0 of await x.query(x.cfg, 'QueryMInOut', `C_Order_ID=${id}`)) await legacyFactsWait(x, 319, io0.M_InOut_ID);
    try { await x.call(x.cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'BridgeDocActionCOrder', tableName: 'C_Order', recordID: id, docAction: f.action } }); }
    catch (e) { return { outcome: 'REJECTED', reason: e.message.slice(0, 120) }; }
    const q = (t, w) => x.query(x.cfg, t, w), h = (await q('QueryCOrder', `C_Order_ID=${id}`))[0], ls = await q('QueryCOrderLine', `C_Order_ID=${id}`);
    const io = (await q('QueryMInOut', `C_Order_ID=${id}`)).sort((a, b) => a.M_InOut_ID - b.M_InOut_ID), inv = (await q('QueryCInvoice', `C_Order_ID=${id}`)).sort((a, b) => a.C_Invoice_ID - b.C_Invoice_ID);
    const shipQ = []; for (const y of io) shipQ.push((await q('QueryMInOutLine', `M_InOut_ID=${y.M_InOut_ID}`)).reduce((a, l) => a + Number(l.MovementQty), 0));
    const stock = {}; for (const p of Object.keys(before)) { const d = (await x.locStock(+p, C.locator)) - before[p]; if (d) stock[p] = d; }
    const orig = (arr, k) => arr.find(y => !y.Reversal_ID || y[k] < y.Reversal_ID), revd = (arr, k) => arr.find(y => y.Reversal_ID && y[k] > y.Reversal_ID);
    const oi = orig(inv, 'C_Invoice_ID'), ri = revd(inv, 'C_Invoice_ID'), os = orig(io, 'M_InOut_ID'), rs = revd(io, 'M_InOut_ID');
    const books = async (t, i) => { if (!i) return 'none'; await legacyFactsWait(x, t, i); return x.legacyFactsOf(t, i, x.SCHEMA); };
    const yn = v => v === true || v === 'Y' ? 'Y' : 'N';
    return { outcome: 'COMPLETED', docstatus: h.DocStatus, order_desc: h.Description, line_qty: sortStr(ls.map(l => Number(l.QtyOrdered))), line_desc: ls.map(l => l.Description).join('|'),
      total_cents: x.cents(h.TotalLines), shipments: sortStr(io.map(y => y.DocStatus)), ship_qtys: sortStr(shipQ), invoices: sortStr(inv.map(y => y.DocStatus)), invoice_totals: sortStr(inv.map(y => x.cents(y.GrandTotal))), stock_delta: JSON.stringify(stock),
      post_inv_orig: await books(318, oi && oi.C_Invoice_ID), post_inv_rev: await books(318, ri && ri.C_Invoice_ID),
      invoice_tax_rev: ri ? (await q('QueryCInvoiceTax', `C_Invoice_ID=${ri.C_Invoice_ID}`)).map(t => `${t.C_Tax_ID}:${x.cents(t.TaxBaseAmt)}:${x.cents(t.TaxAmt)}`).sort().join('|') || 'none' : 'none',
      post_ship_orig: await books(319, os && os.M_InOut_ID), post_ship_rev: await books(319, rs && rs.M_InOut_ID),
      inv_paid: `${oi ? yn(oi.IsPaid) : '-'}/${ri ? yn(ri.IsPaid) : '-'}`,
      inv_allocations: await (async () => { const ids2 = [oi, ri].filter(Boolean).map(y => y.C_Invoice_ID); if (!ids2.length) return 'none'; const r = [];
        for (const al of await q('QueryCAllocationLine', `C_Invoice_ID IN (${ids2.join(',')})`)) { const hh = (await q('QueryCAllocationHdr', `C_AllocationHdr_ID=${al.C_AllocationHdr_ID}`))[0]; r.push(`${hh.DocStatus}:${x.cents(al.Amount)}:${al.C_Invoice_ID === (oi && oi.C_Invoice_ID) ? 'orig' : 'rev'}:${al.C_Payment_ID ? 'pay' : '-'}`); } return r.sort().join('|') || 'none'; })() };
  }
  async function localVoid(f, mut = 0) {
    const P = posEnv(), x = P.x, C = P.C, gb = x.gb, cents = x.cents, grp = localSaleGroup(f); if (grp.reject) return grp.reject;
    const { g, opts, o } = grp, E = x.E;
    const d = FSM.dispatchOrder(gb, { docStatus: 'CO', isSOTrx: 'Y', doctypeId: C.dt.pos, processing: 'N' }, f.action); if (!d.ok) return { outcome: 'REJECTED', reason: d.reason };
    const VOIDED_MSG = DICTDB.prepare("SELECT msgtext FROM ad_message WHERE value='Voided'").get().msgtext;   // dictionary text, never hard-coded
    const lineOf = l => ({ c_orderline_id: l.c_orderline_id, m_product_id: l.m_product_id, qtyordered: l.qtyordered, linenetamt: l.linenetamt }), sl = g.soLines.map(lineOf);
    const sale = { order: { c_order_id: o, description: null }, lines: sl.map(l => ({ ...l, description: null })),
      shipments: [{ m_inout_id: opts.inoutId, docstatus: 'CO', movementtype: 'C-', lines: sl.map((l, i) => ({ m_inoutline_id: opts.inoutId * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id })) }],
      invoices: [{ c_invoice_id: opts.invoiceId, docstatus: 'CO', grandtotal: (g.grandTotal != null ? g.grandTotal : sl.reduce((a, l) => a + cents(l.linenetamt), 0)) / 100,
        taxes: g.ops.filter(y => y.op_type === 'CREATE_LINE' && y.table === 'C_InvoiceTax').map(y => ({ c_tax_id: y.c_tax_id, taxbaseamt: y.taxbaseamt, taxamt: y.taxamt })),
        lines: sl.map((l, i) => ({ c_invoiceline_id: opts.invoiceId * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.qtyordered, linenetamt: l.linenetamt, c_orderline_id: l.c_orderline_id })) }] };
    let nid = o + 5; const ops = E.voidOrder(sale, { voidedMsg: VOIDED_MSG, newId: () => ++nid });
    const status = { ['C_Order:' + o]: 'CO', ['M_InOut:' + opts.inoutId]: 'CO', ['C_Invoice:' + opts.invoiceId]: 'CO' }, docs = { M_InOut: [opts.inoutId], C_Invoice: [opts.invoiceId] };
    const ioLines = { [opts.inoutId]: sale.shipments[0].lines }, ivLines = { [opts.invoiceId]: sale.invoices[0].lines }, ivTot = { [opts.invoiceId]: sale.invoices[0].grandtotal }, revOf = {}, ivTax = { [opts.invoiceId]: sale.invoices[0].taxes };
    const paid = {}, allocs = {}; let orderDesc = null; const oLines = {}; sl.forEach(l => { oLines[l.c_orderline_id] = { qty: l.qtyordered, desc: null }; }); let total = sl.reduce((a, l) => a + cents(l.linenetamt), 0);
    for (const op of ops) {
      if (op.table === 'C_AllocationHdr' || op.table === 'C_AllocationLine') {
        if (op.op_type === 'CREATE_DOCUMENT') allocs[op.c_allocationhdr_id] = { st: 'DR', lines: [] }; else if (op.op_type === 'CREATE_LINE') allocs[op.c_allocationhdr_id].lines.push(op); else if (op.op_type === 'SET_STATUS' && allocs[op.id]) allocs[op.id].st = op.doc_status;
      } else if (op.op_type === 'SET_STATUS') status[op.table + ':' + op.id] = op.doc_status;
      else if (op.op_type === 'CREATE_DOCUMENT') { const id = op.m_inout_id || op.c_invoice_id; docs[op.table].push(id); revOf[op.table + ':' + id] = op.reversal_id; if (op.table === 'C_Invoice') ivTot[id] = op.grandtotal; }
      else if (op.op_type === 'CREATE_LINE' && op.table === 'M_InOutLine') (ioLines[op.m_inout_id] = ioLines[op.m_inout_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceLine') (ivLines[op.c_invoice_id] = ivLines[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceTax') (ivTax[op.c_invoice_id] = ivTax[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'UPDATE_LINE' && op.table === 'C_OrderLine') oLines[op.id] = { qty: op.qtyordered, desc: op.description };
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'totallines') total = cents(op.value);
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'description') orderDesc = op.value;
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Invoice' && op.field === 'ispaid') paid[op.id] = op.value;
    }
    const post = {}, fold = (t, id) => { const dd = x.DP.derivePostings(gb, { table: t, id }, x.SCHEMA); return dd; };
    for (const id of docs.C_Invoice) {
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(id, C.customer, (cents(ivTot[id]) + (revOf['C_Invoice:' + id] ? 0 : mut)) / 100, 'Y', x.PL_CURRENCY, TODAY + ' 00:00:00', C.client, C.org);
      ivLines[id].forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(id * 100 + i, id, l.m_product_id, l.linenetamt));
      (ivTax[id] || []).forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(id, t.c_tax_id, t.taxamt));
      const dd = fold('C_Invoice', id); post['inv:' + (revOf['C_Invoice:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'ABSENT:' + dd.absent.join(',') : x.fmtPostings(dd.lines);
    }
    for (const id of docs.M_InOut) {
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,reversal_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(id, 'Y', 'C-', status['M_InOut:' + id], revOf['M_InOut:' + id] || null, TODAY + ' 00:00:00', C.client, C.org);
      ioLines[id].forEach((l, i) => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,reversalline_id) VALUES(?,?,?,?,?)').run(l.m_inoutline_id || id * 100 + i, id, l.m_product_id, l.movementqty, l.reversalline_id || null));
      const dd = fold('M_InOut', id); post['ship:' + (revOf['M_InOut:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'REFUSED:Posted=E' : (dd.lines.length ? x.fmtPostings(dd.lines) : 'none');
      if (!(dd.absent && dd.absent.length)) x.applyCostQty(id);
    }
    const stock = {}; for (const id of docs.M_InOut) ioLines[id].forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - Number(l.movementqty); }); Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    return { outcome: 'COMPLETED', docstatus: status['C_Order:' + o], order_desc: orderDesc, line_qty: sortStr(Object.values(oLines).map(y => Number(y.qty))), line_desc: Object.values(oLines).map(y => y.desc).join('|'),
      total_cents: total, shipments: sortStr(docs.M_InOut.map(id => status['M_InOut:' + id])), ship_qtys: sortStr(docs.M_InOut.map(id => ioLines[id].reduce((a, l) => a + Number(l.movementqty), 0))),
      invoices: sortStr(docs.C_Invoice.map(id => status['C_Invoice:' + id])), invoice_totals: sortStr(docs.C_Invoice.map(id => cents(ivTot[id]))), stock_delta: JSON.stringify(stock),
      invoice_tax_rev: (ivTax[docs.C_Invoice.find(id => revOf['C_Invoice:' + id])] || []).map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
      post_inv_orig: post['inv:orig'] || 'none', post_inv_rev: post['inv:rev'] || 'none', post_ship_orig: post['ship:orig'] || 'none', post_ship_rev: post['ship:rev'] || 'none',
      inv_paid: (() => { const oo = docs.C_Invoice.find(id => !revOf['C_Invoice:' + id]), r = docs.C_Invoice.find(id => revOf['C_Invoice:' + id]); return `${oo ? paid[oo] || 'N' : '-'}/${r ? paid[r] || 'N' : '-'}`; })(),
      inv_allocations: Object.values(allocs).flatMap(a => a.lines.map(l => `${a.st}:${cents(l.amount)}:${revOf['C_Invoice:' + l.c_invoice_id] ? 'rev' : 'orig'}:${l.c_payment_id ? 'pay' : '-'}`)).sort().join('|') || 'none' };
  }
  steps.sd17 = async () => {
    const C = posEnv().C, lines = [{ product: C.prod.mulch, qty: 1 }];
    const rows = await R.run([{ id: 'SD17-void-sale', facts: { action: 'VO', lines }, legacy: legacyVoid, local: f => localVoid(f, 0) }], { keys: VOIDKEYS, notCompared: {} }, [], { log });
    const lg = (rows[0] || {}).legacy || {}, v0 = !rows.length ? 'INCONCLUSIVE' : rows[0].verdict === 'MATCH' ? 'MATCH' : rows[0].verdict === 'ERROR' ? 'BLOCKED' : 'DIFF', v = v0 === 'MATCH' && lg.outcome !== 'COMPLETED' ? 'INCONCLUSIVE' : v0;
    if (lg.outcome !== 'COMPLETED') log(`§SHOPDAY_LEGACY_RESULT SD-17 ${JSON.stringify(lg).slice(0, 400)}`);
    log(`§SHOPDAY_STEP SD-17 ${v} scenarios=${rows.length} gaps=${(rows[0] && rows[0].gaps || []).map(g => g.key).join(',') || '-'}`); out.steps.push({ id: 'SD-17', verdict: v });
  };
  return steps;
};
