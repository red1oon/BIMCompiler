// ⚠ DO NOT REMOVE — ORDER-TO-CASH CYCLE (spec prompts/SQLiteIDEMPIERE.md §64): one chained cycle, six steps, legacy first, keys compared AFTER EVERY STEP.
// Loaded by witness_m3_gap.js, which injects its SQLite-side context (seed, scratch posting db, kernel verbs, formatters) — this file adds no helper of its own
// that the M3 witness already has. READ THE LOG: §O2C_STEP lines carry the ids; §SCN/§GAP lines are the product.
'use strict';
module.exports = function makeO2C(X) {
  const { cfg, query, call, createLink, gb, E, POS, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, legacyCostQty, localCostQty, locStock, applyCostQty,
    pos, priceOfAt, taxOfFor, taxById, taxChildren, TAX_INCLUDED, dtOf, creditOf, periodCheck, acctSetupOf, PL_CURRENCY, log } = X;
  const BP = 112, LOC = 108, WH = 103, LOCATOR = 101, PRODUCT = 137, QTY = 2, SODT = 132;
  const DESC = {
    so: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateOrder', table: 'C_Order', fields: { M_Warehouse_ID: { const: WH }, C_BPartner_ID: { const: BP }, C_BPartner_Location_ID: { const: LOC }, Bill_BPartner_ID: { const: BP }, Bill_Location_ID: { const: LOC }, C_DocTypeTarget_ID: { const: SODT }, DateOrdered: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
      docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } },
    ship: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_M_InOut', table: 'M_InOut', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { path: 'dt' }, MovementType: { const: 'C-' }, IsSOTrx: { const: 'Y' }, C_Order_ID: { path: 'order' }, C_BPartner_ID: { const: BP }, C_BPartner_Location_ID: { const: LOC }, M_Warehouse_ID: { const: WH }, MovementDate: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'Pilot_createData_M_InOutLine', table: 'M_InOutLine', parent: 'M_InOut_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, C_OrderLine_ID: { path: 'ol' }, M_Product_ID: { path: 'product' }, M_Locator_ID: { const: LOCATOR }, MovementQty: { path: 'qty' }, QtyEntered: { path: 'qty' } } },
      docAction: { serviceType: 'Pilot_setDocAction_M_InOut', table: 'M_InOut', action: 'CO' } },
    inv: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_Invoice', table: 'C_Invoice', fields: { AD_Org_ID: { const: 11 }, C_DocTypeTarget_ID: { path: 'dt' }, IsSOTrx: { const: 'Y' }, C_Order_ID: { path: 'order' }, C_BPartner_ID: { const: BP }, C_BPartner_Location_ID: { const: LOC }, M_PriceList_ID: { path: 'pl' }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'Pilot_createData_C_InvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, C_OrderLine_ID: { path: 'ol' }, M_InOutLine_ID: { path: 'iol' }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' }, PriceEntered: { path: 'price' }, PriceActual: { path: 'price' } } },
      docAction: { serviceType: 'Pilot_setDocAction_C_Invoice', table: 'C_Invoice', action: 'CO' } },
    pay: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreatePayment', table: 'C_Payment', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 119 }, C_BankAccount_ID: { const: 100 }, C_BPartner_ID: { const: BP }, C_Invoice_ID: { path: 'inv' }, C_Currency_ID: { const: 100 }, PayAmt: { path: 'amt' }, TenderType: { const: 'X' }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' } } },
      docAction: { serviceType: 'BridgeCompletePayment', table: 'C_Payment', action: 'CO' } } };
  const sodt = dtOf(SODT), SHIPDT = Number(sodt.c_doctypeshipment_id), INVDT = Number(sodt.c_doctypeinvoice_id);   // the dictionary links of the order type (132 → 120 / 116)
  const yn = v => (v === true || v === 'Y' ? 'Y' : 'N');
  const ordFmt = ls => ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}/${Number(l.qtyreserved || 0)}/${Number(l.qtydelivered || 0)}/${Number(l.qtyinvoiced || 0)}`).sort().join('|');
  const D = (a, b) => cents(a) - cents(b);

  // ================= LEGACY (oracle) =================
  const L = { link: null };
  const link = async () => { if (!L.link) { let bytes = null; L.link = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: DESC }); } return L.link; };
  const push = async (n, p) => { const lk = await link(), u = lk.submit(n, p); await lk.drain(); const s = lk.store.get(u);
    if (s.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(s.error || '')) throw new Error('§WS_CONFIG ' + s.error);
    return { ok: s.state === 'CONFIRMED', error: s.error, idmap: lk.store.idmap(u) }; };
  const bpL = async () => { const b = (await query(cfg, 'QueryCBPartner', `C_BPartner_ID=${BP}`))[0]; return { open: b.TotalOpenBalance, credit: b.SO_CreditUsed }; };
  const olL = async () => (await query(cfg, 'QueryCOrderLine', `C_Order_ID=${L.order}`)).map(lc);
  const postedWait = async (rt, col, id) => { let h; for (let i = 0; i < 10; i++) { h = (await query(cfg, rt, `${col}=${id}`))[0]; if (['Y', 'E'].includes(h.Posted) || h.Posted === true) break; await new Promise(r => setTimeout(r, 1500)); } return h; };
  const booksL = async (t, id, h) => (h && h.Posted === 'E') ? ['REFUSED:Posted=E', 'REFUSED:Posted=E'] : [await legacyFactsOf(t, id, SCHEMA), await legacyFactsOf(t, id, SCHEMA2)];
  const commonL = async () => { const b = await bpL(); return { ol_qty: ordFmt(await olL()), bp_delta: `${D(b.open, L.bp0.open)}/${D(b.credit, L.bp0.credit)}`,
    stock_delta: String((await locStock(PRODUCT, LOCATOR)) - L.stock0), cost_qty_delta: String((await legacyCostQty(PRODUCT)) - L.cq0) }; };
  const allocL = async () => {   // every allocation line touching the cycle's invoices / payment, as `status:amount¢:doc` (sorted)
    const ids = [L.inv, L.rev].filter(Boolean), rows = [];
    for (const al of await query(cfg, 'QueryCAllocationLine', `C_Invoice_ID IN (${ids.join(',')})${L.pay ? ' OR C_Payment_ID=' + L.pay : ''}`)) {
      const h = (await query(cfg, 'QueryCAllocationHdr', `C_AllocationHdr_ID=${al.C_AllocationHdr_ID}`))[0];
      rows.push(`${h.DocStatus}:${cents(al.Amount)}:${al.C_Invoice_ID === L.inv ? 'inv' : al.C_Invoice_ID === L.rev ? 'rev' : '-'}:${al.C_Payment_ID ? 'pay' : '-'}`); }
    return rows.sort().join('|') || 'none'; };
  async function legacyStep(step) {
    if (step === 'SO') {
      L.bp0 = await bpL(); L.stock0 = await locStock(PRODUCT, LOCATOR); L.cq0 = await legacyCostQty(PRODUCT);
      const r = await push('so', { date: TODAY + ' 00:00:00', lines: [{ product: PRODUCT, qty: QTY }] }); if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.order = r.idmap.find(x => x.tbl === 'C_Order').server_id; log(`§O2C_STEP legacy SO order=${L.order}`);
      const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${L.order}`))[0], ls = await olL();
      return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}:${cents(l.priceactual)}:${l.c_tax_id}`).sort().join('|'),
        order_tax: (await query(cfg, 'QueryCOrderTax', `C_Order_ID=${L.order}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none', grand_total: cents(h.GrandTotal), ...(await commonL()) };
    }
    if (!L.order) return { outcome: 'ERROR', error: 'no legacy order (step SO failed)' };
    if (step === 'SHIP') {
      const ol = await olL();
      const r = await push('ship', { dt: SHIPDT, order: L.order, date: TODAY + ' 00:00:00', lines: ol.map(l => ({ ol: l.c_orderline_id, product: l.m_product_id, qty: Number(l.qtyordered) })) });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.ship = r.idmap.find(x => x.tbl === 'M_InOut').server_id; log(`§O2C_STEP legacy SHIP inout=${L.ship}`);
      const h = await postedWait('QueryMInOut', 'M_InOut_ID', L.ship), ls = (await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${L.ship}`)).map(lc); L.shipLines = ls;
      const [b1, b2] = await booksL(319, L.ship, h);
      return { outcome: 'COMPLETED', ship_status: h.DocStatus, ship_lines: ls.map(l => `${l.m_product_id}:${Number(l.movementqty)}`).sort().join('|'), books: b1, books_euro: b2, ...(await commonL()) };
    }
    if (step === 'INV') {
      const ol = await olL(), price = Object.fromEntries(ol.map(l => [l.c_orderline_id, Number(l.priceactual)]));
      const r = await push('inv', { dt: INVDT, pl: pos.m_pricelist_id, order: L.order, date: TODAY + ' 00:00:00', lines: L.shipLines.map(l => ({ ol: l.c_orderline_id, iol: l.m_inoutline_id, product: l.m_product_id, qty: Number(l.movementqty), price: price[l.c_orderline_id] })) });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.inv = r.idmap.find(x => x.tbl === 'C_Invoice').server_id; log(`§O2C_STEP legacy INV invoice=${L.inv}`);
      const h = await postedWait('QueryCInvoice', 'C_Invoice_ID', L.inv), ls = await query(cfg, 'QueryCInvoiceLine', `C_Invoice_ID=${L.inv}`);
      const [b1, b2] = await booksL(318, L.inv, h);
      return { outcome: 'COMPLETED', inv_status: h.DocStatus, inv_lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyInvoiced)}:${cents(l.PriceActual)}:${l.C_Tax_ID}`).sort().join('|'),
        invoice_tax: (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${L.inv}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none',
        grand_total: cents(h.GrandTotal), ispaid: yn(h.IsPaid), books: b1, books_euro: b2, ...(await commonL()) };
    }
    if (step === 'PAY') {
      const inv = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${L.inv}`))[0];
      const r = await push('pay', { inv: L.inv, amt: Number(inv.GrandTotal), date: TODAY + ' 00:00:00' }); if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.pay = r.idmap.find(x => x.tbl === 'C_Payment').server_id; log(`§O2C_STEP legacy PAY payment=${L.pay}`);
      const p = await postedWait('QueryCPayment', 'C_Payment_ID', L.pay), inv2 = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${L.inv}`))[0];
      const al = (await query(cfg, 'QueryCAllocationLine', `C_Payment_ID=${L.pay}`))[0]; L.alloc = al && al.C_AllocationHdr_ID;
      const [b1, b2] = await booksL(335, L.pay, p), [a1, a2] = L.alloc ? await booksL(735, L.alloc) : ['none', 'none'];
      return { outcome: 'COMPLETED', pay_status: p.DocStatus, isallocated: yn(p.IsAllocated), ispaid: yn(inv2.IsPaid), allocations: await allocL(), books: b1, books_euro: b2, books_alloc: a1, books_alloc_euro: a2, ...(await commonL()) };
    }
    if (step === 'RC-INV') {
      try { await call(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'Pilot_setDocAction_C_Invoice', tableName: 'C_Invoice', recordID: L.inv, docAction: 'RC' } }); }
      catch (e) { return { outcome: 'REJECTED', reason: e.message.slice(0, 120) }; }
      const invs = await query(cfg, 'QueryCInvoice', `C_Order_ID=${L.order}`), o = invs.find(i => i.C_Invoice_ID === L.inv), rv = invs.find(i => i.Reversal_ID === L.inv && i.C_Invoice_ID !== L.inv);
      L.rev = rv && rv.C_Invoice_ID; log(`§O2C_STEP legacy RC-INV reversal=${L.rev}`);
      const rh = rv ? await postedWait('QueryCInvoice', 'C_Invoice_ID', L.rev) : null, p = (await query(cfg, 'QueryCPayment', `C_Payment_ID=${L.pay}`))[0];
      const [b1, b2] = rv ? await booksL(318, L.rev, rh) : ['none', 'none'];
      return { outcome: 'COMPLETED', inv_statuses: `${o.DocStatus}/${rv ? rv.DocStatus : 'none'}`, rev_total: rv ? cents(rv.GrandTotal) : 'none', ispaid: `${yn(o.IsPaid)}/${rv ? yn(rv.IsPaid) : '-'}`,
        rev_tax: rv ? (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${L.rev}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none' : 'none',
        books: b1, books_euro: b2, allocations: await allocL(), pay_isallocated: yn(p.IsAllocated), ...(await commonL()) };
    }
    if (step === 'RC-SHIP') {
      try { await call(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'Pilot_setDocAction_M_InOut', tableName: 'M_InOut', recordID: L.ship, docAction: 'RC' } }); }
      catch (e) { return { outcome: 'REJECTED', reason: e.message.slice(0, 120) }; }
      const ios = await query(cfg, 'QueryMInOut', `C_Order_ID=${L.order}`), o = ios.find(i => i.M_InOut_ID === L.ship), rv = ios.find(i => i.Reversal_ID === L.ship && i.M_InOut_ID !== L.ship);
      L.shipRev = rv && rv.M_InOut_ID; log(`§O2C_STEP legacy RC-SHIP reversal=${L.shipRev}`);
      const rh = rv ? await postedWait('QueryMInOut', 'M_InOut_ID', L.shipRev) : null;
      const [b1, b2] = rv ? await booksL(319, L.shipRev, rh) : ['none', 'none'];
      const rl = rv ? (await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${L.shipRev}`)).map(l => `${l.M_Product_ID}:${Number(l.MovementQty)}`).sort().join('|') : 'none';
      return { outcome: 'COMPLETED', ship_statuses: `${o.DocStatus}/${rv ? rv.DocStatus : 'none'}`, rev_lines: rl, books: b1, books_euro: b2, ...(await commonL()) };
    }
    throw new Error('unknown step ' + step);
  }

  // ================= SQLite (the engine under test) =================
  const S = {}; let sq = 97000;
  const nid = () => ++sq * 10;
  const fold = (t, id, sc) => { if (!id) return 'none'; const d = DP.derivePostings(gb, { table: t, id }, sc); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
  const bpS = () => {   // the BP open item the SQLite side derives from ITS OWN documents (MBPartner.setTotalOpenBalance port); absent verb ⇒ 'none'
    if (typeof E.bpOpenBalance !== 'function') return null;
    return E.bpOpenBalance({ invoices: S.invoices || [], payments: S.payments || [], allocations: S.allocations || [] }); };
  const commonS = () => { const b = bpS();
    return { ol_qty: ordFmt(S.lines), bp_delta: b ? `${b.open - S.bp0.open}/${b.credit - S.bp0.credit}` : 'none', stock_delta: String(S.stock), cost_qty_delta: String(localCostQty(PRODUCT) - S.cq0) }; };
  const ap = (ops) => { for (const o of ops || []) {   // apply the kernel's order-line quantity ops to the SQLite state
    if (o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine') { const l = S.lines.find(x => x.c_orderline_id === o.id); if (l) for (const k of ['qtyreserved', 'qtydelivered', 'qtyinvoiced']) if (o[k] != null) l[k] = o[k]; }
    if (o.op_type === 'MOVE_STOCK' && o.m_product_id === PRODUCT && o.m_locator_id === LOCATOR) S.stock += Number(o.qty); } };
  async function localStep(step) {
    if (step === 'SO') {
      S.cq0 = localCostQty(PRODUCT); S.stock = 0; S.invoices = []; S.payments = []; S.allocations = []; S.bp0 = { open: 0, credit: 0 }; { const b = bpS(); if (b) S.bp0 = b; }
      const f = { doctype: SODT, bp: BP, lines: [{ product: PRODUCT, qty: QTY }] }, dt = sodt;
      const ctx = { pos: { ...pos, m_warehouse_id: WH, c_doctype_id: SODT }, priceOf: priceOfAt, priceDate: TODAY, bomOf: () => [], taxOf: taxOfFor(f), taxById, taxChildren, taxIncluded: TAX_INCLUDED,
        wrPolicy: { isautogenerateinout: 'N', isautogenerateinvoice: 'N' }, docsubtypeso: dt.docsubtypeso, docbasetype: dt.docbasetype, creditOf, periodCheck, acctSetupOf };
      const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
      S.order = nid();
      const g = POS.buildDeliverLaterGroup(ctx, cart, { orderId: S.order, inoutId: S.order + 1, invoiceId: S.order + 2, c_bpartner_id: BP, warehouseId: WH, dateAcct: TODAY, doctype: dt, invoiceRule: 'I' });
      if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
      S.lines = g.soLines.map(l => ({ ...l, qtyreserved: 0, qtydelivered: 0, qtyinvoiced: 0 }));
      if (typeof E.orderReserve === 'function') ap(E.orderReserve({ c_order_id: S.order, issotrx: 'Y', binding: true }, S.lines, { isStocked: () => true }).ops);
      const st = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'C_Order').pop();
      return { outcome: 'COMPLETED', docstatus: st && st.doc_status, lines: S.lines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}:${l.c_tax_id}`).sort().join('|'),
        order_tax: g.ops.filter(x => x.op_type === 'CREATE_LINE' && x.table === 'C_OrderTax').map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
        grand_total: g.grandTotal != null ? g.grandTotal : S.lines.reduce((a, l) => a + cents(l.linenetamt), 0), ...commonS() };
    }
    if (!S.order) return { outcome: 'ERROR', error: 'no sqlite order' };
    if (step === 'SHIP') {
      S.ship = nid();
      const gen = POS.buildGenerateShipmentOps({ c_order_id: S.order, m_warehouse_id: WH, issotrx: 'Y' }, S.lines, { inoutId: S.ship, shipDoctypeId: SHIPDT });
      S.shipLines = S.lines.map((l, i) => ({ m_inoutline_id: S.ship * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id, m_locator_id: LOCATOR }));
      const c = POS.completeShipmentOps({ m_inout_id: S.ship, docstatus: 'DR' }, S.shipLines, dtOf(SHIPDT), {});
      if (!c.ok) return { outcome: 'REJECTED', reason: c.reason };
      const status = (c.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'M_InOut').pop() || {}).doc_status;
      c.movements.forEach(m => { if (m.m_product_id === PRODUCT) S.stock += (m.movementtype[1] === '-' ? -1 : 1) * Number(m.movementqty); });
      if (typeof E.inoutOrderLineEffects === 'function') ap(E.inoutOrderLineEffects({ issotrx: 'Y', movementtype: 'C-' }, S.shipLines, S.lines).ops);
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,c_order_id,ad_client_id,ad_org_id,dateacct) VALUES(?,?,?,?,?,?,?,?)').run(S.ship, 'Y', 'C-', status, S.order, 11, 11, TODAY + ' 00:00:00');
      S.shipLines.forEach(l => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,c_orderline_id,m_locator_id) VALUES(?,?,?,?,?,?)').run(l.m_inoutline_id, S.ship, l.m_product_id, l.movementqty, l.c_orderline_id, LOCATOR));
      const b1 = fold('M_InOut', S.ship, SCHEMA), b2 = fold('M_InOut', S.ship, SCHEMA2);
      if (!/^ABSENT/.test(b1)) applyCostQty(S.ship);
      return { outcome: 'COMPLETED', ship_status: status, ship_lines: S.shipLines.map(l => `${l.m_product_id}:${l.movementqty}`).sort().join('|'), books: /^ABSENT/.test(b1) ? 'REFUSED:Posted=E' : b1, books_euro: /^ABSENT/.test(b1) ? 'REFUSED:Posted=E' : b2, ...commonS() };
    }
    if (step === 'INV') {
      S.inv = nid();
      const priceOfLine = Object.fromEntries(S.lines.map(l => [l.m_product_id, l.priceactual]));   // CreateFrom copies the ORDER line price
      const r = E.prepareInvoice({ c_invoice_id: S.inv, issotrx: 'Y', c_bpartner_id: BP, dateinvoiced: TODAY },
        S.shipLines.map((l, i) => ({ c_invoiceline_id: S.inv * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.movementqty })),
        { priceOf: pid => ({ pricestd: priceOfLine[pid] }), taxOf: taxOfFor({ bp: BP }), taxById, taxChildren, taxIncluded: TAX_INCLUDED });
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const ops = r.ops.concat(E.completeInvoice({ c_invoice_id: S.inv, issotrx: 'Y' }, r.lines, {}));
      const status = (ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'C_Invoice').pop() || {}).doc_status;
      const invLines = r.lines.map((l, i) => ({ ...l, c_orderline_id: S.shipLines[i].c_orderline_id, m_inoutline_id: S.shipLines[i].m_inoutline_id }));
      if (typeof E.invoiceOrderLineEffects === 'function') ap(E.invoiceOrderLineEffects({ issotrx: 'Y', iscreditmemo: 'N' }, invLines, S.lines).ops);
      S.invoices.push({ c_invoice_id: S.inv, c_bpartner_id: BP, issotrx: 'Y', docstatus: status, grandtotal: r.grandTotal, ispaid: 'N', taxes: r.taxes, lines: invLines });
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,c_order_id,docstatus) VALUES(?,?,?,?,?,?,?,?,?,?)').run(S.inv, BP, r.grandTotal / 100, 'Y', PL_CURRENCY, TODAY + ' 00:00:00', 11, 11, S.order, status);
      invLines.forEach(l => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt,qtyinvoiced,c_orderline_id,m_inoutline_id) VALUES(?,?,?,?,?,?,?)').run(l.c_invoiceline_id, S.inv, l.m_product_id, l.linenetamt, l.qtyinvoiced, l.c_orderline_id, l.m_inoutline_id));
      r.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(S.inv, t.c_tax_id, t.taxamt / 100));
      return { outcome: 'COMPLETED', inv_status: status, inv_lines: r.lines.map(l => `${l.m_product_id}:${l.qtyinvoiced}:${cents(l.priceactual)}:${l.c_tax_id}`).sort().join('|'),
        invoice_tax: r.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`).sort().join('|') || 'none', grand_total: r.grandTotal, ispaid: 'N', books: fold('C_Invoice', S.inv, SCHEMA), books_euro: fold('C_Invoice', S.inv, SCHEMA2), ...commonS() };
    }
    if (step === 'PAY') {
      const inv = S.invoices.find(i => i.c_invoice_id === S.inv); S.pay = nid();
      const pay = { c_payment_id: S.pay, c_bpartner_id: BP, c_invoice_id: S.inv, payamt: inv.grandtotal / 100, isreceipt: 'Y', c_currency_id: 100, dateacct: TODAY };
      const r = E.completePayment(pay, { c_invoice_id: S.inv, grandtotal: inv.grandtotal / 100, issotrx: 'Y', dateacct: TODAY }, { newId: nid }); if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const status = t => (r.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === t).pop() || {}).doc_status;
      const flag = (t, f2) => { const u = r.ops.filter(o => o.op_type === 'UPDATE_FIELD' && o.table === t && o.field === f2).pop(); return u ? u.value : 'N'; };
      const ah = r.ops.find(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr'), al = r.ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine');
      inv.ispaid = flag('C_Invoice', 'ispaid');
      S.payments.push({ c_payment_id: S.pay, c_bpartner_id: BP, payamt: cents(pay.payamt), isreceipt: 'Y', docstatus: status('C_Payment'), isallocated: flag('C_Payment', 'isallocated') });
      if (ah) { S.alloc = ah.c_allocationhdr_id; S.allocations.push({ c_allocationhdr_id: ah.c_allocationhdr_id, docstatus: status('C_AllocationHdr'), isactive: 'Y', lines: al.map(l => ({ c_allocationline_id: l.c_allocationline_id, c_invoice_id: l.c_invoice_id, c_payment_id: l.c_payment_id, amount: cents(l.amount) })) }); }
      gb.prepare('INSERT INTO c_payment(c_payment_id,c_bpartner_id,c_invoice_id,payamt,isreceipt,c_currency_id,c_bankaccount_id,tendertype,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(S.pay, BP, S.inv, pay.payamt, 'Y', 100, 100, 'X', TODAY + ' 00:00:00', status('C_Payment'), 11, 11);
      if (ah) { gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(ah.c_allocationhdr_id, ah.c_currency_id, TODAY + ' 00:00:00', status('C_AllocationHdr'), 11, 11);
        for (const l of al) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?)')
          .run(l.c_allocationline_id, ah.c_allocationhdr_id, l.c_payment_id, l.c_invoice_id, l.c_bpartner_id, l.amount, l.writeoffamt || 0, l.discountamt || 0); }
      return { outcome: 'COMPLETED', pay_status: status('C_Payment'), isallocated: flag('C_Payment', 'isallocated'), ispaid: inv.ispaid, allocations: allocS(),
        books: fold('C_Payment', S.pay, SCHEMA), books_euro: fold('C_Payment', S.pay, SCHEMA2), books_alloc: fold('C_AllocationHdr', S.alloc, SCHEMA), books_alloc_euro: fold('C_AllocationHdr', S.alloc, SCHEMA2), ...commonS() };
    }
    if (step === 'RC-INV') {
      if (typeof E.reverseInvoice !== 'function') return { outcome: 'COMPLETED', inv_statuses: 'CO/none', rev_total: 'none', ispaid: 'Y/-', rev_tax: 'none', books: 'none', books_euro: 'none', allocations: allocS(), pay_isallocated: 'Y', ...commonS() };
      const inv = S.invoices.find(i => i.c_invoice_id === S.inv);
      const r = E.reverseInvoice({ ...inv, c_order_id: S.order, dateacct: TODAY, c_currency_id: PL_CURRENCY }, { allocations: S.allocations, payments: S.payments }, { newId: () => nid(), orderLines: S.lines });
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      S.rev = r.reversalId; applyDocOps(r.ops);
      const rv = S.invoices.find(i => i.c_invoice_id === S.rev);
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,c_order_id,docstatus,reversal_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(S.rev, BP, rv.grandtotal / 100, 'Y', PL_CURRENCY, TODAY + ' 00:00:00', 11, 11, S.order, rv.docstatus, S.inv);
      rv.lines.forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt,qtyinvoiced,c_orderline_id) VALUES(?,?,?,?,?,?)').run(S.rev * 100 + i, S.rev, l.m_product_id, l.linenetamt, l.qtyinvoiced, l.c_orderline_id));
      rv.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(S.rev, t.c_tax_id, t.taxamt / 100));
      const p = S.payments.find(x => x.c_payment_id === S.pay);
      return { outcome: 'COMPLETED', inv_statuses: `${inv.docstatus}/${rv.docstatus}`, rev_total: rv.grandtotal, ispaid: `${inv.ispaid}/${rv.ispaid}`, rev_tax: rv.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`).sort().join('|') || 'none',
        books: fold('C_Invoice', S.rev, SCHEMA), books_euro: fold('C_Invoice', S.rev, SCHEMA2), allocations: allocS(), pay_isallocated: p.isallocated, ...commonS() };
    }
    if (step === 'RC-SHIP') {
      if (typeof E.reverseInOut !== 'function') return { outcome: 'COMPLETED', ship_statuses: 'CO/none', rev_lines: 'none', books: 'none', books_euro: 'none', ...commonS() };
      return { outcome: 'ERROR', error: 'reverseInOut host adapter missing' };
    }
    throw new Error('unknown step ' + step);
  }
  // apply the kernel's document ops to the SQLite cycle state (statuses, flags, reversal documents, allocations) — the state a committing host keeps
  const applyDocOps = ops => { ap(ops); for (const o of ops) {
    const inv = id => S.invoices.find(i => i.c_invoice_id === id), hdr = id => S.allocations.find(a => a.c_allocationhdr_id === id);
    if (o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_Invoice') S.invoices.push({ c_invoice_id: o.c_invoice_id, c_bpartner_id: BP, issotrx: 'Y', docstatus: 'DR', grandtotal: o.grandtotal, ispaid: 'N', reversal_id: o.reversal_id, lines: [], taxes: [] });
    else if (o.op_type === 'CREATE_LINE' && o.table === 'C_InvoiceLine') inv(o.c_invoice_id).lines.push({ m_product_id: o.m_product_id, qtyinvoiced: o.qtyinvoiced, linenetamt: o.linenetamt, c_orderline_id: o.c_orderline_id });
    else if (o.op_type === 'CREATE_LINE' && o.table === 'C_InvoiceTax') inv(o.c_invoice_id).taxes.push({ c_tax_id: o.c_tax_id, taxbaseamt: o.taxbaseamt, taxamt: o.taxamt });
    else if (o.op_type === 'SET_STATUS' && o.table === 'C_Invoice') inv(o.id).docstatus = o.doc_status;
    else if (o.op_type === 'UPDATE_FIELD' && o.table === 'C_Invoice') inv(o.id)[o.field] = o.value;
    else if (o.op_type === 'UPDATE_FIELD' && o.table === 'C_Payment') S.payments.find(x => x.c_payment_id === o.id)[o.field] = o.value;
    else if (o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr') S.allocations.push({ c_allocationhdr_id: o.c_allocationhdr_id, docstatus: 'DR', isactive: 'Y', lines: [] });
    else if (o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine') hdr(o.c_allocationhdr_id).lines.push({ c_allocationline_id: o.c_allocationline_id, c_invoice_id: o.c_invoice_id, c_payment_id: o.c_payment_id, amount: o.amount });
    else if (o.op_type === 'SET_STATUS' && o.table === 'C_AllocationHdr') hdr(o.id).docstatus = o.doc_status;
    else if (o.op_type === 'UPDATE_FIELD' && o.table === 'C_AllocationHdr') hdr(o.id)[o.field] = o.value;
    else if (o.op_type === 'UPDATE_LINE' && o.table === 'C_AllocationLine') for (const h of S.allocations) { const l = h.lines.find(x => x.c_allocationline_id === o.id); if (l) Object.assign(l, { amount: o.amount, isactive: o.isactive }); }
  } };
  const allocS = () => (S.allocations || []).flatMap(a => a.lines.map(l => `${a.docstatus}:${l.amount}:${l.c_invoice_id === S.inv ? 'inv' : l.c_invoice_id === S.rev ? 'rev' : '-'}:${l.c_payment_id ? 'pay' : '-'}`)).sort().join('|') || 'none';

  const KEYS = {
    SO: ['outcome', 'docstatus', 'lines', 'order_tax', 'grand_total', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'],
    SHIP: ['outcome', 'ship_status', 'ship_lines', 'books', 'books_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'],
    INV: ['outcome', 'inv_status', 'inv_lines', 'invoice_tax', 'grand_total', 'ispaid', 'books', 'books_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'],
    PAY: ['outcome', 'pay_status', 'isallocated', 'ispaid', 'allocations', 'books', 'books_euro', 'books_alloc', 'books_alloc_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'],
    'RC-INV': ['outcome', 'inv_statuses', 'rev_total', 'ispaid', 'rev_tax', 'books', 'books_euro', 'allocations', 'pay_isallocated', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'],
    'RC-SHIP': ['outcome', 'ship_statuses', 'rev_lines', 'books', 'books_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost_qty_delta'] };
  const STEPS = ['SO', 'SHIP', 'INV', 'PAY', 'RC-INV', 'RC-SHIP'];
  return { STEPS, KEYS, scenario: (step, i) => ({ id: `O2C${i + 1}-${step}`, facts: { step }, legacy: f => legacyStep(f.step), local: f => localStep(f.step) }), S, L };
};
