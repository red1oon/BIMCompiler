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
    const uid = P.link.submit('so', { date: (f.date || TODAY) + ' 00:00:00', lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) }); await P.link.drain(); const st = P.link.store.get(uid);
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
    const ctx = { pos: { ...x.pos, m_warehouse_id: C.wh, c_doctype_id: C.dt.pos }, priceOf: x.priceOfAt, priceDate: f.date || TODAY, bomOf: () => [], taxOf: x.taxOfFor({ bp: C.customer, date: f.date || TODAY }), taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded: x.TAX_INCLUDED,
      wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }, docsubtypeso: dt.docsubtypeso, docbasetype: dt.docbasetype, creditOf: x.creditOf, periodCheck: x.periodCheck, acctSetupOf: x.acctSetupOf };
    const cart = f.lines.map(l => x.POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { reject: { outcome: 'REJECTED' } };
    const o = ++P.seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: C.customer, warehouseId: C.wh, dateAcct: f.date || TODAY };
    const g = x.POS.buildSaleGroup(ctx, cart, opts); if (!g.ok) return { reject: { outcome: 'REJECTED', reason: g.reason } };
    return { g, opts, o };
  }
  async function localSale(f, mut = 0) {
    const P = posEnv(), x = P.x, C = P.C, gb = x.gb, cents = x.cents, grp = localSaleGroup(f); if (grp.reject) return grp.reject;
    const { g, opts } = grp, D = f.date || TODAY, cqBefore = {}; for (const l of f.lines) cqBefore[l.product] = x.localCostQty(l.product);
    const st = g.ops.filter(y => y.op_type === 'SET_STATUS' && y.table === 'C_Order').pop(), shipDone = g.ops.filter(y => y.op_type === 'SET_STATUS' && y.table === 'M_InOut' && y.doc_status === 'CO').length;
    const fold = (t, id, sc) => { const d = x.DP.derivePostings(gb, { table: t, id }, sc); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? x.fmtPostings(d.lines) : 'none'); };
    let postings = 'none', postingsShip = 'none';
    if (g.ops.find(y => y.op_type === 'CREATE_DOCUMENT' && y.table === 'C_Invoice')) {
      const iid = opts.invoiceId, total = ((g.grandTotal != null ? g.grandTotal : g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0)) + mut) / 100;
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(iid, C.customer, total, 'Y', x.PL_CURRENCY, D + ' 00:00:00', C.client, C.org);
      for (const t of g.ops.filter(y => y.op_type === 'CREATE_LINE' && y.table === 'C_InvoiceTax')) gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(iid, t.c_tax_id, t.taxamt);
      for (const l of g.soLines) gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(iid * 100 + l.c_orderline_id % 100, iid, l.m_product_id, mut ? (cents(l.linenetamt) + mut) / 100 : l.linenetamt);
      postings = fold('C_Invoice', iid, x.SCHEMA);
    }
    if (shipDone) {
      const sid = opts.inoutId;
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?)').run(sid, 'Y', 'C-', 'CO', D + ' 00:00:00', C.client, C.org);
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
    for (const [aid, a] of Object.entries(allocs)) {   // the allocation the invoice reversal created (orig +amt / reversal -amt): a posted document (SD-24 trial balance)
      gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(+aid, C.cur, TODAY + ' 00:00:00', a.st, C.client, C.org);
      for (const l of a.lines) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?)').run(l.c_allocationline_id, +aid, l.c_payment_id || null, l.c_invoice_id, l.c_bpartner_id || C.customer, l.amount, l.writeoffamt || 0, l.discountamt || 0);
      x.DP.derivePostings(gb, { table: 'C_AllocationHdr', id: +aid }, x.SCHEMA); }
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

  // ================= SD-19 cash book: an AR invoice settled by a cash journal Invoice line (CASH1 re-hosted; D7: what the Bridge pushes = save, then complete in a 2nd call) =================
  const T0 = env.T, cashState = {};
  const cashEnv = () => {
    if (cashState.x) return cashState;
    const x = docEnv(), C = x.C; cashState.x = x; cashState.C = C; cashState.seq = 8100; for (const t of ['c_cash', 'c_cashline']) env.tw.ensure(t);
    if (!x.gb.prepare("SELECT 1 FROM sqlite_master WHERE name='ad_sysconfig'").get() || !x.gb.prepare('SELECT 1 FROM ad_sysconfig LIMIT 1').get()) {
      require('./shop_env').loadSystemTables(env.tw, ['ad_sysconfig']);   // CLIENT_ACCOUNTING & co are SYSTEM rows (client 0): the posting fold reads them from the db it folds
      log('§SHOPDAY_LOCAL ad_sysconfig loaded from legacy client 0 (CLIENT_ACCOUNTING=' + ((x.gb.prepare("SELECT value v FROM ad_sysconfig WHERE name='CLIENT_ACCOUNTING' AND ad_client_id=0").get() || {}).v) + ')');
    }
    const inv = { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateInvoice', table: 'C_Invoice', fields: { AD_Org_ID: { path: 'org' }, C_DocTypeTarget_ID: { const: C.dt.arInvoice }, C_BPartner_ID: { path: 'bp' }, C_BPartner_Location_ID: { path: 'loc' },
      M_PriceList_ID: { const: C.pl.sales }, IsSOTrx: { const: 'Y' }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
      lines: { serviceType: 'BridgeCreateInvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { path: 'org' }, AD_Client_ID: { const: C.client }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' } } },
      docAction: { serviceType: 'BridgeCompleteInvoice', table: 'C_Invoice', action: 'CO' } };
    const cash = { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateCash', table: 'C_Cash', fields: { AD_Org_ID: { const: C.org }, C_CashBook_ID: { const: C.cashbook }, Name: { path: 'name' }, StatementDate: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
      lines: { serviceType: 'BridgeCreateCashLine', table: 'C_CashLine', parent: 'C_Cash_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, CashType: { const: 'I' }, C_Invoice_ID: { path: 'inv' }, Amount: { path: 'amt' }, C_Currency_ID: { const: C.cur } } },
      docAction: { serviceType: 'BridgeCompleteCash', table: 'C_Cash', action: 'CO', separateCall: true } };
    cashState.DESC = { inv, cash }; return cashState;
  };
  const bpOfL = async (x, bp) => { const b = (await x.query(x.cfg, 'QueryCBPartner', `C_BPartner_ID=${bp}`))[0]; return { open: x.cents(b.TotalOpenBalance), credit: x.cents(b.SO_CreditUsed) }; };
  async function legacyCash(f) {
    const P = cashEnv(), x = P.x, C = P.C, BP = C.customer;
    if (!P.link) { let bytes = null; P.link = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: P.DESC }); }
    const bp0 = await bpOfL(x, BP);
    const iu = P.link.submit('inv', { org: C.org, bp: BP, loc: C.customerLoc, date: TODAY + ' 00:00:00', note: 'SD ' + f.id, lines: f.lines.map(l => ({ ...l, org: C.org })) });
    await P.link.drain(); const ist = P.link.store.get(iu); if (ist.state !== 'CONFIRMED') return { outcome: 'ERROR', error: 'invoice: ' + ist.error };
    const invId = P.link.store.idmap(iu).find(y => y.tbl === 'C_Invoice').server_id, inv = (await x.query(x.cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0];
    const cu = P.link.submit('cash', { name: 'SD ' + f.id + ' ' + Date.now().toString(36), date: TODAY + ' 00:00:00', note: 'SD ' + f.id, lines: [{ inv: invId, amt: Number(inv.GrandTotal) }] });
    await P.link.drain(); const cst = P.link.store.get(cu);
    if (cst.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(cst.error || '')) throw new Error('§WS_CONFIG ' + cst.error);
    if (cst.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (cst.error || '').slice(0, 120) };
    const cashId = P.link.store.idmap(cu).find(y => y.tbl === 'C_Cash').server_id;
    let h; for (let i = 0; i < 10; i++) { h = (await x.query(x.cfg, 'QueryCCash', `C_Cash_ID=${cashId}`))[0]; if (['Y', 'E'].includes(h.Posted) || h.Posted === true) break; await new Promise(r => setTimeout(r, 1500)); }
    const al = await x.query(x.cfg, 'QueryCAllocationLine', `C_Invoice_ID=${invId}`), hid = al[0] && al[0].C_AllocationHdr_ID, ah = hid ? (await x.query(x.cfg, 'QueryCAllocationHdr', `C_AllocationHdr_ID=${hid}`))[0] : null;
    const inv2 = (await x.query(x.cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0], bp1 = await bpOfL(x, BP);
    const c1 = h.Posted === 'E' ? 'REFUSED:Posted=E' : await x.legacyFactsOf(407, cashId, x.SCHEMA), a1 = hid ? await x.legacyFactsOf(735, hid, x.SCHEMA) : 'none';
    return { outcome: 'COMPLETED', cash_status: h.DocStatus, statement_diff: x.cents(h.StatementDifference), allocation: al.map(a => `${ah.DocStatus}:${x.cents(a.Amount)}:${a.C_CashLine_ID ? 'cash' : '-'}`).join('|') || 'none',
      ispaid: inv2.IsPaid === true || inv2.IsPaid === 'Y' ? 'Y' : 'N', books_cash: c1, books_cash_euro: c1, books_alloc: a1, books_alloc_euro: a1, bp_delta: `${bp1.open - bp0.open}/${bp1.credit - bp0.credit}` };
  }
  async function localCash(f, mut = 0) {
    const P = cashEnv(), x = P.x, C = P.C, gb = x.gb, cents = x.cents, E = x.E, BP = C.customer, newId = () => ++P.seq * 10, iid = newId();
    const r = E.prepareInvoice({ c_invoice_id: iid, issotrx: 'Y', c_bpartner_id: BP, dateinvoiced: TODAY }, f.lines.map((l, i) => ({ c_invoiceline_id: iid * 100 + i, m_product_id: l.product, qtyinvoiced: l.qty })),
      { priceOf: x.priceOfAt, taxOf: x.taxOfFor({ org: C.org, bp: BP, invoice: true, date: TODAY }), taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded: x.TAX_INCLUDED });
    if (!r.ok) return { outcome: 'ERROR', error: 'invoice ' + r.reason };
    const st = { invoices: [{ c_invoice_id: iid, issotrx: 'Y', docstatus: 'CO', grandtotal: r.grandTotal, ispaid: 'N' }], payments: [], allocations: [] }, b0 = E.bpOpenBalance({ invoices: [], payments: [], allocations: [] });
    gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,docstatus) VALUES(?,?,?,?,?,?,?,?,?)').run(iid, BP, r.grandTotal / 100, 'Y', x.PL_CURRENCY, TODAY + ' 00:00:00', C.client, C.org, 'CO');
    r.lines.forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(l.c_invoiceline_id, iid, l.m_product_id, l.linenetamt));
    r.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(iid, t.c_tax_id, t.taxamt / 100));
    x.DP.derivePostings(gb, { table: 'C_Invoice', id: iid }, x.SCHEMA);   // the AR invoice posts on Complete (legacy books it); recorded for the trial balance, not a compared key of this step
    const cid = newId(), amt = (r.grandTotal + mut) / 100, lines = [{ c_cashline_id: cid * 100 + 1, cashtype: 'I', c_invoice_id: iid, amount: amt, c_currency_id: x.PL_CURRENCY }];
    const c = E.completeCash({ c_cash_id: cid, dateacct: TODAY }, lines, { invoiceOf: () => ({ docstatus: 'CO', grandtotal: r.grandTotal / 100, allocated: 0, c_bpartner_id: BP }), newId, periodOpen: x.periodCheck(TODAY, 'CMC') });
    if (!c.ok) return { outcome: 'REJECTED', reason: c.reason };
    const ah = c.ops.find(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr'), al = c.ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine');
    const paid = (c.ops.find(o => o.op_type === 'UPDATE_FIELD' && o.table === 'C_Invoice' && o.field === 'ispaid') || {}).value || 'N';
    st.invoices[0].ispaid = paid; if (ah) st.allocations.push({ isactive: 'Y', lines: al.map(l => ({ c_invoice_id: l.c_invoice_id, amount: cents(l.amount), discountamt: 0, writeoffamt: 0 })) });
    const b1 = E.bpOpenBalance(st);
    gb.prepare('INSERT INTO c_cash(c_cash_id,c_cashbook_id,docstatus,ad_org_id,ad_client_id,dateacct,statementdifference) VALUES(?,?,?,?,?,?,?)').run(cid, C.cashbook, 'CO', C.org, C.client, TODAY + ' 00:00:00', c.statementDifference);
    lines.forEach(l => gb.prepare('INSERT INTO c_cashline(c_cashline_id,c_cashbook_id,c_cash_id,amount,cashtype,c_invoice_id,c_currency_id) VALUES(?,?,?,?,?,?,?)').run(l.c_cashline_id, C.cashbook, cid, l.amount, l.cashtype, l.c_invoice_id, l.c_currency_id));
    if (ah) { gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(ah.c_allocationhdr_id, ah.c_currency_id, TODAY + ' 00:00:00', 'CO', C.client, C.org);
      for (const l of al) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_cashline_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?,?)').run(l.c_allocationline_id, ah.c_allocationhdr_id, null, l.c_cashline_id, l.c_invoice_id, l.c_bpartner_id, l.amount, 0, 0); }
    const fold = (t, id) => { if (!id) return 'none'; const d = x.DP.derivePostings(gb, { table: t, id, cashJournalSameTrx: false }, x.SCHEMA); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? x.fmtPostings(d.lines) : 'none'); };
    const c1 = fold('C_Cash', cid), a1 = fold('C_AllocationHdr', ah && ah.c_allocationhdr_id);
    return { outcome: 'COMPLETED', cash_status: 'CO', statement_diff: cents(c.statementDifference), allocation: al.map(l => `CO:${cents(l.amount)}:cash`).join('|') || 'none', ispaid: paid, books_cash: c1, books_cash_euro: c1, books_alloc: a1, books_alloc_euro: a1, bp_delta: `${b1.open - b0.open}/${b1.credit - b0.credit}` };
  }
  steps.sd19 = async () => {
    const C = cashEnv().C, lines = [{ product: C.prod.mulch, qty: 1 }], KEYS = ['outcome', 'cash_status', 'statement_diff', 'allocation', 'ispaid', 'books_cash', 'books_cash_euro', 'books_alloc', 'books_alloc_euro', 'bp_delta'];
    const rows = await R.run([{ id: 'SD19-cash-journal-settles-invoice', facts: { id: 'SD19', lines }, legacy: legacyCash, local: f => localCash(f, 0) }], { keys: KEYS, notCompared: {} }, [], { log });
    const lg = (rows[0] || {}).legacy || {}, v0 = !rows.length ? 'INCONCLUSIVE' : rows[0].verdict === 'MATCH' ? 'MATCH' : rows[0].verdict === 'ERROR' ? 'BLOCKED' : 'DIFF', v = v0 === 'MATCH' && lg.outcome !== 'COMPLETED' ? 'INCONCLUSIVE' : v0;
    if (lg.outcome !== 'COMPLETED') log(`§SHOPDAY_LEGACY_RESULT SD-19 ${JSON.stringify(lg).slice(0, 400)}`);
    log(`§SHOPDAY_STEP SD-19 ${v} scenarios=${rows.length} gaps=${(rows[0] && rows[0].gaps || []).map(g => g.key).join(',') || '-'}`); out.steps.push({ id: 'SD-19', verdict: v });
  };

  // ================= SD-20 bank statement matches a customer receipt (BS1 re-hosted; BS-REJ: the same payment again is refused) =================
  const bsState = {};
  const bsEnv = () => {
    if (bsState.x) return bsState; const P = cashEnv(), x = P.x, C = P.C; bsState.x = x; bsState.C = C; bsState.seq = 8600; for (const t of ['c_bankstatement', 'c_bankstatementline']) env.tw.ensure(t); bsState.localPay = {};
    bsState.DESC = {
      payNoInv: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreatePayment', table: 'C_Payment', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: C.dt.arReceipt }, C_BankAccount_ID: { const: C.bank }, C_BPartner_ID: { path: 'bp' },
        C_Currency_ID: { const: C.cur }, PayAmt: { path: 'amt' }, TenderType: { const: 'X' }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
        docAction: { serviceType: 'BridgeCompletePayment', table: 'C_Payment', action: 'CO' } },
      bs: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateBankStatement', table: 'C_BankStatement', fields: { AD_Org_ID: { const: C.org }, C_BankAccount_ID: { const: C.bank }, Name: { path: 'name' }, StatementDate: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
        lines: { serviceType: 'BridgeCreateBankStatementLine', table: 'C_BankStatementLine', parent: 'C_BankStatement_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
          fields: { AD_Org_ID: { const: C.org }, StatementLineDate: { path: 'date' }, ValutaDate: { path: 'date' }, DateAcct: { path: 'date' }, C_Currency_ID: { const: C.cur }, StmtAmt: { path: 'amt' }, TrxAmt: { path: 'amt' }, C_Payment_ID: { path: 'pay' } } },
        docAction: { serviceType: 'BridgeCompleteBankStatement', table: 'C_BankStatement', action: 'CO' } } };
    return bsState;
  };
  const bankBalL = async (x, C) => x.cents(((await x.query(x.cfg, 'QueryCBankAccount', `C_BankAccount_ID=${C.bank}`))[0] || {}).CurrentBalance);
  async function legacyBS(f) {
    const P = bsEnv(), x = P.x, C = P.C;
    if (!P.link) { let bytes = null; P.link = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: P.DESC }); }
    const d = TODAY + ' 00:00:00'; let pay = f.reusePayment ? P.lastPay : null;
    if (!pay) { const pu = P.link.submit('payNoInv', { bp: C.customer, amt: f.amt, date: d, note: 'SD ' + f.id }); await P.link.drain(); const pst = P.link.store.get(pu);
      if (pst.state !== 'CONFIRMED') return { outcome: 'ERROR', error: 'payment: ' + pst.error }; pay = P.link.store.idmap(pu).find(y => y.tbl === 'C_Payment').server_id; P.lastPay = pay; }
    const b0 = await bankBalL(x, C);
    const uid = P.link.submit('bs', { name: 'SD ' + f.id + ' ' + Date.now().toString(36), date: d, note: 'SD ' + f.id, lines: [{ date: d, amt: f.amt, pay }] }); await P.link.drain(); const st = P.link.store.get(uid);
    if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
    if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
    const id = P.link.store.idmap(uid).find(y => y.tbl === 'C_BankStatement').server_id, h = (await x.query(x.cfg, 'QueryCBankStatement', `C_BankStatement_ID=${id}`))[0], p = (await x.query(x.cfg, 'QueryCPayment', `C_Payment_ID=${pay}`))[0];
    const bk = await x.legacyFactsOf(392, id, x.SCHEMA);
    return { outcome: 'COMPLETED', docstatus: h.DocStatus, beginning: x.cents(h.BeginningBalance), statement_diff: x.cents(h.StatementDifference), ending: x.cents(h.EndingBalance),
      payment_reconciled: p.IsReconciled === true || p.IsReconciled === 'Y' ? 'Y' : 'N', bank_balance_delta: (await bankBalL(x, C)) - b0, postings: bk, postings_euro: bk };
  }
  async function localBS(f, mut = 0) {
    const P = bsEnv(), x = P.x, C = P.C, gb = x.gb, cents = x.cents, E = x.E;
    let pay = f.reusePayment ? P.localPay.last : null; if (!pay) { pay = ++P.seq * 10; P.localPay[pay] = { isreconciled: 'N' }; P.localPay.last = pay; }
    if (!f.reusePayment) {   // the receipt the statement matches is a completed, posted C_Payment (Doc_Payment: Dr in-transit / Cr unallocated cash) -- folded for the trial balance
      gb.prepare('INSERT INTO c_payment(c_payment_id,c_bpartner_id,payamt,isreceipt,c_currency_id,c_bankaccount_id,tendertype,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(pay, C.customer, f.amt, 'Y', C.cur, C.bank, 'X', TODAY + ' 00:00:00', 'CO', C.client, C.org);
      x.DP.derivePostings(gb, { table: 'C_Payment', id: pay }, x.SCHEMA); }
    const sid = ++P.seq * 10, amt = (Math.round(f.amt * 100) + mut) / 100, bal0 = cents((gb.prepare('SELECT currentbalance b FROM c_bankaccount WHERE c_bankaccount_id=?').get(C.bank) || {}).b);
    const r = E.completeBankStatement({ c_bankstatement_id: sid, c_bankaccount_id: C.bank, dateacct: TODAY }, [{ c_bankstatementline_id: sid * 100 + 1, line: 10, dateacct: TODAY, stmtamt: String(amt), trxamt: String(amt), c_payment_id: pay }],
      { periodOpen: x.periodCheck(TODAY, 'CMB'), postWithDateFromLine: x.DP.sysConfigBool(gb, 'BANK_STATEMENT_POST_WITH_DATE_FROM_LINE', false, C.client, 0), samePeriod: (a, b) => String(a).slice(0, 7) === String(b).slice(0, 7), bankBalance: bal0, paymentOf: id => P.localPay[id] });
    if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    for (const o of r.ops) { if (o.table === 'C_Payment') P.localPay[o.id].isreconciled = o.value; if (o.table === 'C_BankAccount') gb.prepare('UPDATE c_bankaccount SET currentbalance=COALESCE(currentbalance,0)+? WHERE c_bankaccount_id=?').run(Number(o.delta), o.id); }
    gb.prepare('INSERT INTO c_bankstatement(c_bankstatement_id,docstatus,c_bankaccount_id,ad_org_id,ad_client_id,beginningbalance,endingbalance,statementdifference,dateacct) VALUES(?,?,?,?,?,?,?,?,?)').run(sid, 'CO', C.bank, C.org, C.client, r.beginningBalance / 100, r.endingBalance / 100, r.statementDifference / 100, TODAY + ' 00:00:00');
    r.lines.forEach(l => gb.prepare('INSERT INTO c_bankstatementline(c_bankstatementline_id,c_bankstatement_id,stmtamt,c_payment_id,trxamt,chargeamt,interestamt,c_charge_id,c_currency_id) VALUES(?,?,?,?,?,?,?,?,?)').run(l.c_bankstatementline_id, sid, l.stmtamt / 100, l.c_payment_id, l.trxamt / 100, l.chargeamt / 100, l.interestamt / 100, l.c_charge_id, C.cur));
    const d = x.DP.derivePostings(gb, { table: 'C_BankStatement', id: sid }, x.SCHEMA), bk = d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? x.fmtPostings(d.lines) : 'none');
    const bal1 = cents((gb.prepare('SELECT currentbalance b FROM c_bankaccount WHERE c_bankaccount_id=?').get(C.bank) || {}).b);
    return { outcome: 'COMPLETED', docstatus: 'CO', beginning: r.beginningBalance, statement_diff: r.statementDifference, ending: r.endingBalance, payment_reconciled: P.localPay[pay].isreconciled, bank_balance_delta: bal1 - bal0, postings: bk, postings_euro: bk };
  }
  steps.sd20 = async () => {
    bsEnv(); const KEYS = ['outcome', 'docstatus', 'beginning', 'statement_diff', 'ending', 'payment_reconciled', 'bank_balance_delta', 'postings', 'postings_euro'], res = [];
    for (const [id, f] of [['SD20-bank-statement-matches-receipt', { id: 'SD20', amt: 7.77 }], ['SD20r-payment-already-reconciled', { id: 'SD20R', amt: 7.77, reusePayment: true }]]) {
      const rows = await R.run([{ id, facts: f, legacy: legacyBS, local: g => localBS(g, 0) }], { keys: KEYS, notCompared: {} }, [], { log }); res.push(rows[0] || {});
      log(`§SHOPDAY_OUTCOME ${id} legacy=${JSON.stringify((rows[0] || {}).legacy).slice(0, 240)} sqlite=${JSON.stringify((rows[0] || {}).sqlite).slice(0, 240)}`); }
    const l0 = res[0].legacy || {}, l1 = res[1].legacy || {};
    const bad = res.filter(r => r.verdict !== 'MATCH'), v = !res.length ? 'INCONCLUSIVE' : bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : (l0.outcome === 'COMPLETED' && l1.outcome === 'REJECTED') ? 'MATCH' : 'INCONCLUSIVE';
    log(`§SHOPDAY_STEP SD-20 ${v} scenarios=${res.length} legacy=${l0.outcome}/${l1.outcome} gaps=${bad.map(r => r.id + ':' + (r.gaps || []).map(g => g.key).join('+')).join(',') || '-'}`); out.steps.push({ id: 'SD-20', verdict: v });
  };

  // ================= posting recorder: the twin PERSISTS what its posting fold decided (G-SD8) =================
  // derivePostings is the SQLite side's Doc.post: its verdict is Posted='Y' (facts, possibly none) or Posted='E' (refused). Recording it on the document row and in fact_acct is what lets
  // a period close see unposted documents (RV_UnPosted) and lets a trial balance be derived from the books the twin actually posted (SD-24). One wrapper, every fold in every step.
  const REC = { installed: false, folds: 0, factRows: 0 };
  steps.installRecorder = () => {
    if (REC.installed) return; REC.installed = true;
    const x = docEnv(), DPm = x.DP, orig = DPm.derivePostings, tw = env.tw, DICT = require('./shop_twin').DICT;
    const atid = {}; const tableId = t => atid[t] != null ? atid[t] : (atid[t] = (DICT.prepare('SELECT ad_table_id i FROM ad_table WHERE upper(tablename)=upper(?)').get(t) || {}).i);
    tw.ensure('fact_acct');
    DPm.derivePostings = function (db, doc, schema) {
      const r = orig.apply(this, arguments);
      try {
        if (db === tw.db && doc && doc.table && doc.id != null && r) {
          const tn = String(doc.table).toLowerCase(), pk = tn + '_id', refused = !!(r.absent && r.absent.length), tid = tableId(doc.table); REC.folds++;
          if (refused && process.env.SHOPDAY_VERBOSE) log(`§SHOPDAY_FOLD_REFUSED ${doc.table} #${doc.id} schema=${schema} absent=${r.absent.join(' ; ').slice(0, 200)}`);
          try { tw.db.prepare(`UPDATE ${tn} SET posted=? WHERE ${pk}=?`).run(refused ? 'E' : 'Y', doc.id); } catch (e) { /* a table without a posted column */ }
          if (tid != null) {
            tw.db.prepare('DELETE FROM fact_acct WHERE ad_table_id=? AND record_id=? AND c_acctschema_id=?').run(tid, doc.id, schema);
            if (!refused) {
              let hd = null; try { hd = tw.db.prepare(`SELECT dateacct FROM ${tn} WHERE ${pk}=?`).get(doc.id); } catch (e) { /* no header row */ }
              const d = (hd && hd.dateacct) || TODAY + ' 00:00:00', cur = (tw.db.prepare('SELECT c_currency_id c FROM c_acctschema WHERE c_acctschema_id=?').get(schema) || {}).c;
              for (const l of (r.lines || [])) {
                const dr = Number(l.amtacctdr || 0), cr = Number(l.amtacctcr || 0); if (!dr && !cr) continue;
                tw.insert('fact_acct', { c_acctschema_id: schema, account_id: l.account_id, datetrx: d, dateacct: d, ad_table_id: tid, record_id: doc.id, postingtype: 'A', c_currency_id: cur, amtsourcedr: dr, amtsourcecr: cr, amtacctdr: dr, amtacctcr: cr }); REC.factRows++;
              }
            }
          }
        }
      } catch (e) { log('§SHOPDAY_RECORD_FAULT ' + String(e.message).slice(0, 200)); }
      return r;
    };
    log('§SHOPDAY_LOCAL posting recorder installed (posted flag + fact_acct persisted from every derivePostings of the twin)');
  };

  // ================= periods: SD-21 back-dated sale, SD-22 period close, SD-23 post-close refusals =================
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const T0d = new Date(TODAY + 'T00:00:00'), D_PREV = ymd(new Date(T0d.getFullYear(), T0d.getMonth() - 1, 15)), D_NEXT = ymd(new Date(T0d.getFullYear(), T0d.getMonth() + 1, 15));
  const verdictOf = (rows, lg, want) => { const bad = rows.filter(r => r.verdict !== 'MATCH'); return !rows.length ? 'INCONCLUSIVE' : bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : want(lg) ? 'MATCH' : 'INCONCLUSIVE'; };
  // SD-21: a sale dated in the open PAST period (opened by SD-01) against costed stock. Legacy reads the cost HISTORY at the shipment's DateAcct (F9 / MCostDetail.process :1424): the stock
  // was counted in today, so the history at D holds qty 0 and the shipment is refused (Posted=E AverageCostingNegativeQty) while order + invoice complete -- the SQLite fold must say the same.
  steps.sd21 = async () => {
    const C = posEnv().C, lines = [{ product: C.prod.mulch, qty: 1 }];
    const rows = await R.run([{ id: 'SD21-backdated-sale', facts: { lines, date: D_PREV }, legacy: legacySale, local: f => localSale(f, 0) }], { keys: POSKEYS, notCompared: {} }, [], { log });
    const lg = (rows[0] || {}).legacy || {}, v = verdictOf(rows, lg, l => l.outcome === 'COMPLETED');
    log(`§SHOPDAY_OUTCOME SD-21 date=${D_PREV} legacy=${JSON.stringify(lg).slice(0, 360)} sqlite=${JSON.stringify((rows[0] || {}).sqlite).slice(0, 360)}`);
    log(`§SHOPDAY_STEP SD-21 ${v} date=${D_PREV} legacy_shipment_books=${lg.postings_shipment} gaps=${(rows[0] && rows[0].gaps || []).map(g => g.key).join(',') || '-'}`); out.steps.push({ id: 'SD-21', verdict: v });
  };
  // SD-22: PeriodStatus (AD_Process 167) PeriodAction 'C' = close. PeriodStatus.java:127-170: with FORCE_POSTING_PRIOR_TO_PERIOD_CLOSE (default true) a period with UNPOSTED documents
  // (RV_UnPosted: Posted<>'Y' and DocStatus CO/CL/RE/VO, DateAcct in the period) cannot be closed ("PostUnpostedDocs"); else C_PeriodControl.PeriodStatus := action for every control row not 'P'.
  const UNPOSTED_TABLES = ['gl_journal', 'c_projectissue', 'c_invoice', 'm_inout', 'm_inventory', 'm_movement', 'm_production', 'c_cash', 'c_payment', 'c_allocationhdr', 'c_bankstatement', 'm_matchinv', 'm_matchpo', 'c_order', 'm_requisition'];
  function localPeriodStatus(periodId, action) {
    const x = docEnv(), gb = x.gb, tw = env.tw, p = gb.prepare('SELECT * FROM c_period WHERE c_period_id=?').get(periodId);
    if ((action === 'C' || action === 'P') && x.DP.sysConfigBool(gb, 'FORCE_POSTING_PRIOR_TO_PERIOD_CLOSE', true, tw.client, 0)) {
      for (const t of UNPOSTED_TABLES) {
        let has = null; try { has = gb.prepare(`SELECT 1 x FROM ${t} WHERE docstatus IN ('CO','CL','RE','VO') AND COALESCE(posted,'N')<>'Y' AND substr(dateacct,1,10) BETWEEN ? AND ? LIMIT 1`).get(String(p.startdate).slice(0, 10), String(p.enddate).slice(0, 10)); } catch (e) { /* table not present / no such column on the twin */ }
        if (has) return { ok: false, error: 'PostUnpostedDocs (' + t + ')' };
      }
    }
    const n = gb.prepare("UPDATE c_periodcontrol SET periodstatus=?, periodaction='N', updated=? WHERE c_period_id=? AND periodstatus<>'P' AND periodstatus<>?").run(action, tw.stamp, periodId, action).changes;
    return { ok: true, summary: '@Updated@ #' + n };
  }
  const periodsL = async () => (await ad_.query(env.cfg, 'QueryCPeriod', 'C_Period_ID>0')).sort((a, b) => String(a.StartDate).localeCompare(String(b.StartDate)));
  const ad_ = env.ad;
  steps.sd22 = async () => {
    const ps = await periodsL(), i = ps.findIndex(p => String(p.StartDate).slice(0, 10) <= TODAY && TODAY <= String(p.EndDate).slice(0, 10)), prev = ps[i - 1], next = ps[i + 1];
    if (!prev || !next) throw new Error('no neighbouring periods');
    const res = [];
    for (const [label, per] of [['prev(has the refused back-dated shipment)', prev], ['next(empty)', next]]) {
      const r = await ad_.runProcess(env.cfg, 'Bridge_RunProcess_PeriodStatus', { PeriodAction: 'C' }, +per.C_Period_ID), l = localPeriodStatus(+per.C_Period_ID, 'C');
      log(`§SHOPDAY_OUTCOME SD-22 ${label} period ${per.PeriodNo} legacy=${r.ok ? 'OK ' + r.summary : 'REFUSED ' + String(r.error).slice(0, 160)} sqlite=${l.ok ? 'OK ' + l.summary : 'REFUSED ' + l.error}`);
      res.push({ label, legacyOk: !!r.ok, sqliteOk: l.ok, same: !!r.ok === l.ok, legacyText: r.ok ? r.summary : r.error, sqliteText: l.ok ? l.summary : l.error });
    }
    await env.compareStep('SD-22a', ['c_periodcontrol'], 'after closing prev (refusal expected) and next (empty): control rows equal');
    const same = res.every(r => r.same), expect = res[0].legacyOk === false && res[1].legacyOk === true;   // not vacuous: the refusal AND the success must both have happened on legacy
    const v = !same ? 'DIFF' : expect ? 'MATCH' : 'INCONCLUSIVE';
    log(`§SHOPDAY_STEP SD-22 ${v} prev_refused_both=${res[0].legacyOk === false && res[0].sqliteOk === false} next_closed_both=${res[1].legacyOk && res[1].sqliteOk}`); out.steps.push({ id: 'SD-22', verdict: v });
  };
  // SD-23: documents dated in the CLOSED period (next month, beyond the auto-period window) are refused: a sale, a goods receipt, a customer receipt (payment), a GL journal
  steps.sd23 = async () => {
    const x = docEnv(), C = x.C, KEYS = ['outcome'], res = [];
    const judge = (id, rows) => { const r = rows[0] || {}, lg = r.legacy || {}, sq = r.sqlite || {}; const periodWord = /period/i;
      log(`§SHOPDAY_OUTCOME ${id} legacy=${JSON.stringify(lg).slice(0, 260)} sqlite=${JSON.stringify(sq).slice(0, 200)}`);
      res.push({ id, ok: r.verdict === 'MATCH' && lg.outcome === 'REJECTED' && sq.outcome === 'REJECTED', rejected: lg.outcome === 'REJECTED', legacyPeriod: periodWord.test(lg.reason || ''), sqlitePeriod: periodWord.test(sq.reason || ''), verdict: r.verdict }); };
    // (a) sale
    judge('SD23a-sale', await R.run([{ id: 'SD23a-sale-in-closed-period', facts: { lines: [{ product: C.prod.mulch, qty: 1 }], date: D_NEXT }, legacy: legacySale, local: f => localSale(f, 0) }], { keys: KEYS, notCompared: {} }, [], { log }));
    // (b) goods receipt: a PO dated today, received dated D_NEXT
    { const xp = { ...x, product: C.prod.rake, qty: 1, price: 30, idBase: 92000, rcptDate: D_NEXT }; const P2P = require('./cycle_p2p')(xp);
      const po = await R.run([{ ...P2P.scenario('PO', 0), id: 'SD23b-po' }], { keys: P2P.KEYS.PO, notCompared: {} }, [], { log: () => {} });
      log(`§SHOPDAY_LEGACY SD-23b PO for the receipt: ${po[0] && po[0].verdict}`);
      judge('SD23b-goods-receipt', await R.run([{ ...P2P.scenario('RCPT', 1), id: 'SD23b-receipt-in-closed-period' }], { keys: ['outcome'], notCompared: {} }, [], { log })); }
    // (c) customer receipt (payment) dated D_NEXT
    { const P = bsEnv(); if (!P.link) { let bytes = null; P.link = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: P.DESC }); }
      const legacyPayC = async f => { const u = P.link.submit('payNoInv', { bp: C.customer, amt: 5, date: f.date + ' 00:00:00', note: 'SD23c' }); await P.link.drain(); const st = P.link.store.get(u);
        if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
        return st.state === 'CONFIRMED' ? { outcome: 'COMPLETED' } : { outcome: 'REJECTED', reason: (st.error || '').slice(0, 160) }; };
      const localPayC = async f => { const pr = x.periodCheck(f.date, 'ARR'); const r = x.E.completePayment({ c_payment_id: 9990001, c_bpartner_id: C.customer, payamt: 5, isreceipt: 'Y', c_currency_id: C.cur, dateacct: f.date }, null, { newId: () => 9990002, periodOpen: pr }); return r.ok ? { outcome: 'COMPLETED' } : { outcome: 'REJECTED', reason: r.reason }; };
      judge('SD23c-customer-receipt', await R.run([{ id: 'SD23c-payment-in-closed-period', facts: { date: D_NEXT }, legacy: legacyPayC, local: localPayC }], { keys: KEYS, notCompared: {} }, [], { log })); }
    // (d) GL journal dated D_NEXT between two plain accounts
    { const P = cashEnv(); const accts = env.T.pg(`select c_elementvalue_id from c_elementvalue where ad_client_id=${env.ids.clientId} and isactive='Y' and issummary='N' and accounttype in ('A','E') order by 1 limit 2`).map(Number);
      const per = (await periodsL()).find(p => String(p.StartDate).slice(0, 10) <= D_NEXT && D_NEXT <= String(p.EndDate).slice(0, 10));
      const GLJ = { glj: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateGLJournal', table: 'GL_Journal', fields: { AD_Org_ID: { const: C.org }, C_AcctSchema_ID: { const: C.schema.primary }, C_DocType_ID: { const: C.dt.glJournal }, GL_Category_ID: { const: x.glcat || 0 }, PostingType: { const: 'A' },
          C_Currency_ID: { const: C.cur }, C_ConversionType_ID: { const: 114 }, CurrencyRate: { const: 1 }, DateDoc: { path: 'date' }, DateAcct: { path: 'date' }, C_Period_ID: { path: 'period' }, Description: { path: 'note' } } },
        lines: { serviceType: 'BridgeCreateGLJournalLine', table: 'GL_JournalLine', parent: 'GL_Journal_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, Account_ID: { path: 'account' }, AmtSourceDr: { path: 'dr' }, AmtSourceCr: { path: 'cr' }, DateAcct: { path: 'date' } } },
        docAction: { serviceType: 'BridgeCompleteGLJournal', table: 'GL_Journal', action: 'CO' } } };
      const glcat = +env.T.pg(`select gl_category_id from gl_category where ad_client_id=${env.ids.clientId} order by gl_category_id limit 1`)[0]; GLJ.glj.header.fields.GL_Category_ID = { const: glcat };
      const link = await x.createLink({ cfg: x.cfg, persistence: { load: () => null, save: () => {} }, descriptors: GLJ });
      const legacyJ = async f => { const d = f.date + ' 00:00:00', u = link.submit('glj', { date: d, period: +per.C_Period_ID, note: 'SD23d', lines: [{ account: accts[0], dr: 10, cr: 0, date: d }, { account: accts[1], dr: 0, cr: 10, date: d }] }); await link.drain(); const st = link.store.get(u);
        if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
        return st.state === 'CONFIRMED' ? { outcome: 'COMPLETED' } : { outcome: 'REJECTED', reason: (st.error || '').slice(0, 160) }; };
      const localJ = async f => { const lines = [{ gl_journalline_id: 1, line: 10, account_id: accts[0], amtsourcedr: '10', amtsourcecr: '0', currencyrate: '1', dateacct: f.date, precision: 2 }, { gl_journalline_id: 2, line: 20, account_id: accts[1], amtsourcedr: '0', amtsourcecr: '10', currencyrate: '1', dateacct: f.date, precision: 2 }];
        const r = x.E.completeJournal({ gl_journal_id: 9990003, dateacct: f.date, postingtype: 'A', isactive: 'Y', controlamt: 0, c_acctschema_id: C.schema.primary }, lines, { periodOpen: x.periodCheck(f.date, 'GLJ'), periodOpenAt: dt => x.periodCheck(dt, 'GLJ'), accountOf: id => { const r = x.gb.prepare('SELECT isactive, isdoccontrolled, postactual, postbudget, poststatistical FROM c_elementvalue WHERE c_elementvalue_id=?').get(id); return r; }   /* real flags: the period test precedes the per-line account tests in MJournal.prepareIt (validatePeriod :470-472) */, suspenseBalancing: false });
        return r.ok ? { outcome: 'COMPLETED' } : { outcome: 'REJECTED', reason: r.reason }; };
      judge('SD23d-gl-journal', await R.run([{ id: 'SD23d-journal-in-closed-period', facts: { date: D_NEXT }, legacy: legacyJ, local: localJ }], { keys: KEYS, notCompared: {} }, [], { log })); void P; }
    const allRefused = res.every(r => r.ok), allPeriod = res.every(r => r.legacyPeriod);
    const v = !res.length ? 'INCONCLUSIVE' : res.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : res.some(r => r.verdict !== 'MATCH' || (r.rejected && !r.ok)) ? 'DIFF' : (allRefused && allPeriod) ? 'MATCH' : 'INCONCLUSIVE';
    log(`§SHOPDAY_STEP SD-23 ${v} refused_both=${res.map(r => r.id + ':' + (r.ok ? 'Y' : 'N')).join(',')} legacy_reason_is_period=${res.map(r => r.legacyPeriod ? 'Y' : 'N').join('')} sqlite_reason_is_period=${res.map(r => r.sqlitePeriod ? 'Y' : 'N').join('')}`); out.steps.push({ id: 'SD-23', verdict: v });
  };
  // ================= SD-24 end-of-day trial balance, both sides =================
  // legacy: Fact_Acct of the new client, primary schema, summed per account (READ-ONLY psql, like the template extraction); SQLite: the fact_acct the recorder persisted from every posting fold.
  steps.sd24 = async () => {
    const x = docEnv(), cid = env.ids.clientId, sch = x.SCHEMA;
    const lrows = env.T.pg(`select e.value, sum(f.amtacctdr), sum(f.amtacctcr), count(*) from fact_acct f join c_elementvalue e on e.c_elementvalue_id=f.account_id where f.ad_client_id=${cid} and f.c_acctschema_id=${sch} group by e.value order by 1`).map(l => l.split('|'));
    const srows = x.gb.prepare('SELECT e.value v, SUM(f.amtacctdr) dr, SUM(f.amtacctcr) cr, COUNT(*) n FROM fact_acct f JOIN c_elementvalue e ON e.c_elementvalue_id=f.account_id WHERE f.c_acctschema_id=? GROUP BY e.value ORDER BY 1').all(sch);
    const L = new Map(lrows.map(r => [r[0], { dr: Math.round(Number(r[1]) * 100), cr: Math.round(Number(r[2]) * 100), n: +r[3] }])), S = new Map(srows.map(r => [r.v, { dr: Math.round(r.dr * 100), cr: Math.round(r.cr * 100), n: r.n }]));
    const keys = [...new Set([...L.keys(), ...S.keys()])].sort(); let diff = 0; const lines = [];
    for (const k of keys) { const a = L.get(k) || { dr: 0, cr: 0, n: 0 }, b = S.get(k) || { dr: 0, cr: 0, n: 0 }; if (a.dr - a.cr !== b.dr - b.cr || a.dr !== b.dr || a.cr !== b.cr) { diff++; lines.push(`§SHOPDAY_TB_DIFF account=${k} legacy=Dr${a.dr}/Cr${a.cr}(n=${a.n}) sqlite=Dr${b.dr}/Cr${b.cr}(n=${b.n})`); } }
    const tot = m => [...m.values()].reduce((q, r) => ({ dr: q.dr + r.dr, cr: q.cr + r.cr, n: q.n + r.n }), { dr: 0, cr: 0, n: 0 }), tl = tot(L), ts = tot(S);
    lines.slice(0, 40).forEach(l => log(l));
    // attribution of any difference: per document type (ad_table_id) and side
    const byTbl = env.T.pg(`select ad_table_id, count(*), sum(amtacctdr), sum(amtacctcr) from fact_acct where ad_client_id=${cid} and c_acctschema_id=${sch} group by 1 order by 1`).map(l => l.split('|')), sTbl = x.gb.prepare('SELECT ad_table_id t, COUNT(*) n, SUM(amtacctdr) dr, SUM(amtacctcr) cr FROM fact_acct WHERE c_acctschema_id=? GROUP BY 1 ORDER BY 1').all(sch);
    log(`§SHOPDAY_TB_BY_DOC legacy=[${byTbl.map(r => `${r[0]}:n${r[1]}:Dr${r[2]}/Cr${r[3]}`).join(' ')}] sqlite=[${sTbl.map(r => `${r.t}:n${r.n}:Dr${r.dr}/Cr${r.cr}`).join(' ')}]`);
    for (const t of new Set([...byTbl.map(r => r[0]), ...sTbl.map(r => String(r.t))])) {
      const lr = env.T.pg(`select record_id, sum(amtacctdr) from fact_acct where ad_client_id=${cid} and c_acctschema_id=${sch} and ad_table_id=${t} group by 1 order by 1`).map(l => Number(l.split('|')[1])).sort((a, b) => a - b),
        sr = x.gb.prepare('SELECT SUM(amtacctdr) d FROM fact_acct WHERE c_acctschema_id=? AND ad_table_id=? GROUP BY record_id').all(sch, +t).map(r => r.d).sort((a, b) => a - b);
      if (JSON.stringify(lr) !== JSON.stringify(sr)) log(`§SHOPDAY_TB_DOCDIFF ad_table_id=${t} legacy_docs_Dr=[${lr.join(',')}] sqlite_docs_Dr=[${sr.join(',')}]`); }
    log(`§SHOPDAY_TB legacy: accounts=${L.size} rows=${tl.n} Dr=${tl.dr} Cr=${tl.cr} balanced=${tl.dr === tl.cr} | sqlite: accounts=${S.size} rows=${ts.n} Dr=${ts.dr} Cr=${ts.cr} balanced=${ts.dr === ts.cr} | accounts_differing=${diff}`);
    // negative control: +1 cent on one SQLite fact row must surface as a differing account (a trial balance that cannot fail proves nothing), then it is reverted
    const probe = x.gb.prepare('SELECT rowid r, amtacctdr d FROM fact_acct WHERE c_acctschema_id=? AND amtacctdr>0 ORDER BY rowid LIMIT 1').get(sch);
    if (probe) { x.gb.prepare('UPDATE fact_acct SET amtacctdr=amtacctdr+0.01 WHERE rowid=?').run(probe.r);
      const s2 = x.gb.prepare('SELECT e.value v, SUM(f.amtacctdr) dr, SUM(f.amtacctcr) cr FROM fact_acct f JOIN c_elementvalue e ON e.c_elementvalue_id=f.account_id WHERE f.c_acctschema_id=? GROUP BY e.value').all(sch);
      const nd = s2.filter(r => { const a = L.get(r.v) || { dr: 0, cr: 0 }; return Math.round(r.dr * 100) !== a.dr || Math.round(r.cr * 100) !== a.cr; }).length;
      x.gb.prepare('UPDATE fact_acct SET amtacctdr=? WHERE rowid=?').run(probe.d, probe.r); env.out.tbNeg = diff === 0 ? nd > 0 : null;
      log(`§SHOPDAY_TB_NEG ${diff !== 0 ? 'NOT_JUDGED (real diff present)' : nd > 0 ? 'PASS' : 'FAIL'} +1 cent on one SQLite fact row => differing accounts=${nd}`); }
    const v = (L.size === 0 && S.size === 0) ? 'INCONCLUSIVE' : (diff === 0 && tl.dr === tl.cr && ts.dr === ts.cr) ? 'MATCH' : 'DIFF';
    log(`§SHOPDAY_STEP SD-24 ${v} accounts=${keys.length} differing=${diff} legacy_fact_rows=${tl.n} sqlite_fact_rows=${ts.n}${(REC.folds === 0) ? ' VACUOUS(no folds recorded)' : ''}`); out.steps.push({ id: 'SD-24', verdict: REC.folds === 0 ? 'INCONCLUSIVE' : v });
  };

  // negative control for the POS family (SD-11/SD-17 use the same fold): a SQLite sale whose invoice is +1 cent must differ from legacy's on price-bearing keys
  steps.sd11neg = async () => {
    const C = posEnv().C, lines = [{ product: C.prod.mulch, qty: 1 }];
    const rows = await R.run([{ id: 'NEG-sd11-pos-sale', facts: { lines }, legacy: legacySale, local: f => localSale(f, 1) }], { keys: POSKEYS, notCompared: {} }, [], { log: () => {} });
    const r = rows[0] || {}, keys = (r.gaps || []).map(g => g.key), priced = keys.filter(k => /total_cents|grand_total_cents|postings/.test(k));
    env.out.posNeg = r.verdict === 'SQLITE-GAP' && priced.length > 0; log(`§SHOPDAY_NEG_POS ${env.out.posNeg ? 'PASS' : 'FAIL'} SQLite POS invoice +1 cent => ${r.verdict} price-bearing gap keys=[${priced.join(',')}]`);
  };
  return steps;
};
