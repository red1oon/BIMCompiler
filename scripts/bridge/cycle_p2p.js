// ⚠ DO NOT REMOVE — PURCHASE-TO-PAY CYCLE (spec prompts/SQLiteIDEMPIERE.md §65): one chained cycle, four steps, legacy first, keys compared AFTER EVERY STEP.
// Loaded by witness_m3_gap.js (injected context, like cycle_o2c.js). READ THE LOG: §P2P_STEP lines carry the ids; §SCN/§GAP lines are the product.
'use strict';
module.exports = function makeP2P(X) {
  const { cfg, query, createLink, gb, seed, E, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, locStock, taxRows, taxById, taxChildren, log } = X;
  const VBP = 120, VLOC = 114, WH = 103, LOCATOR = 101, PRODUCT = 139, QTY = 2, PRICE = 8, PODT = 126, PL = 102, ORG = 11, AVG = 103;
  const DESC = {
    po: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_Order', table: 'C_Order', fields: { AD_Org_ID: { const: ORG }, IsSOTrx: { const: 'N' }, C_DocTypeTarget_ID: { const: PODT }, M_Warehouse_ID: { const: WH }, C_BPartner_ID: { const: VBP }, C_BPartner_Location_ID: { const: VLOC }, Bill_BPartner_ID: { const: VBP }, Bill_Location_ID: { const: VLOC }, M_PriceList_ID: { const: PL }, DateOrdered: { path: 'date' }, DateAcct: { path: 'date' }, DatePromised: { path: 'date' } } },
      lines: { serviceType: 'Pilot_createData_C_OrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: ORG }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' }, PriceEntered: { path: 'price' }, PriceActual: { path: 'price' } } },
      docAction: { serviceType: 'Pilot_setDocAction_C_Order', table: 'C_Order', action: 'CO' } },
    rcpt: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_M_InOut', table: 'M_InOut', fields: { AD_Org_ID: { const: ORG }, C_DocType_ID: { const: 122 }, MovementType: { const: 'V+' }, IsSOTrx: { const: 'N' }, C_Order_ID: { path: 'order' }, C_BPartner_ID: { const: VBP }, C_BPartner_Location_ID: { const: VLOC }, M_Warehouse_ID: { const: WH }, MovementDate: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'Pilot_createData_M_InOutLine', table: 'M_InOutLine', parent: 'M_InOut_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: ORG }, C_OrderLine_ID: { path: 'ol' }, M_Product_ID: { path: 'product' }, M_Locator_ID: { const: LOCATOR }, MovementQty: { path: 'qty' }, QtyEntered: { path: 'qty' } } },
      docAction: { serviceType: 'Pilot_setDocAction_M_InOut', table: 'M_InOut', action: 'CO' } },
    inv: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_Invoice', table: 'C_Invoice', fields: { AD_Org_ID: { const: ORG }, C_DocTypeTarget_ID: { const: 123 }, IsSOTrx: { const: 'N' }, C_Order_ID: { path: 'order' }, C_BPartner_ID: { const: VBP }, C_BPartner_Location_ID: { const: VLOC }, M_PriceList_ID: { const: PL }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' } } },
      lines: { serviceType: 'Pilot_createData_C_InvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: ORG }, C_OrderLine_ID: { path: 'ol' }, M_InOutLine_ID: { path: 'iol' }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' }, PriceEntered: { path: 'price' }, PriceActual: { path: 'price' } } },
      docAction: { serviceType: 'Pilot_setDocAction_C_Invoice', table: 'C_Invoice', action: 'CO' } },
    pay: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_Payment', table: 'C_Payment', fields: { AD_Org_ID: { const: ORG }, C_DocType_ID: { const: 125 }, IsReceipt: { const: 'N' }, C_BankAccount_ID: { const: 100 }, C_BPartner_ID: { const: VBP }, C_Invoice_ID: { path: 'inv' }, C_Currency_ID: { const: 100 }, PayAmt: { path: 'amt' }, TenderType: { const: 'X' }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' } } },
      docAction: { serviceType: 'Pilot_setDocAction_C_Payment', table: 'C_Payment', action: 'CO' } } };
  const yn = v => (v === true || v === 'Y' ? 'Y' : 'N');
  const num = v => String(Number(v));
  const ordFmt = ls => ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}/${Number(l.qtyreserved || 0)}/${Number(l.qtydelivered || 0)}/${Number(l.qtyinvoiced || 0)}`).sort().join('|');
  const costFmt = rows => rows.map(c => `${c.c_acctschema_id}:${num(c.currentcostprice)}@${num(c.currentqty)}/${num(c.cumulatedamt)}`).sort().join('|') || 'none';
  const D = (a, b) => cents(a) - cents(b);

  // ================= LEGACY (oracle) =================
  const L = { link: null };
  const link = async () => { if (!L.link) { let bytes = null; L.link = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: DESC }); } return L.link; };
  const push = async (n, p) => { const lk = await link(), u = lk.submit(n, p); await lk.drain(); const s = lk.store.get(u);
    if (s.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(s.error || '')) throw new Error('§WS_CONFIG ' + s.error);
    return { ok: s.state === 'CONFIRMED', error: s.error, idmap: lk.store.idmap(u) }; };
  const bpL = async () => { const b = (await query(cfg, 'QueryCBPartner', `C_BPartner_ID=${VBP}`))[0]; return { open: b.TotalOpenBalance, credit: b.SO_CreditUsed }; };
  const olL = async () => (await query(cfg, 'QueryCOrderLine', `C_Order_ID=${L.order}`)).map(lc);
  const costL = async () => costFmt((await query(cfg, 'QueryMCost', `M_Product_ID=${PRODUCT} AND C_AcctSchema_ID IN (${SCHEMA},${SCHEMA2}) AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0 AND M_CostElement_ID=${AVG}`)).map(lc));
  const postedWait = async (rt, col, id) => { let h; for (let i = 0; i < 10; i++) { h = (await query(cfg, rt, `${col}=${id}`))[0]; if (['Y', 'E'].includes(h.Posted) || h.Posted === true) break; await new Promise(r => setTimeout(r, 1500)); } return h; };
  const booksL = async (t, id, h) => (h && h.Posted === 'E') ? ['REFUSED:Posted=E', 'REFUSED:Posted=E'] : [await legacyFactsOf(t, id, SCHEMA), await legacyFactsOf(t, id, SCHEMA2)];
  const matchPOL = async () => (await query(cfg, 'QueryMMatchPO', `C_OrderLine_ID IN (SELECT C_OrderLine_ID FROM C_OrderLine WHERE C_Order_ID=${L.order})`)).map(m => `${Number(m.Qty)}:${m.M_InOutLine_ID ? 'rcpt' : '-'}:${m.C_InvoiceLine_ID ? 'inv' : '-'}`).sort().join('|') || 'none';
  const commonL = async () => { const b = await bpL(); return { ol_qty: ordFmt(await olL()), bp_delta: `${D(b.open, L.bp0.open)}/${D(b.credit, L.bp0.credit)}`, stock_delta: String((await locStock(PRODUCT, LOCATOR)) - L.stock0), cost: await costL() }; };
  async function legacyStep(step) {
    if (step === 'PO') {
      L.bp0 = await bpL(); L.stock0 = await locStock(PRODUCT, LOCATOR);
      const r = await push('po', { date: TODAY + ' 00:00:00', lines: [{ product: PRODUCT, qty: QTY, price: PRICE }] }); if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.order = r.idmap.find(x => x.tbl === 'C_Order').server_id; log(`§P2P_STEP legacy PO order=${L.order}`);
      const h = await postedWait('QueryCOrder', 'C_Order_ID', L.order), ls = await olL();
      const [b1, b2] = await booksL(259, L.order, h);
      return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}:${cents(l.priceactual)}:${l.c_tax_id}`).sort().join('|'),
        order_tax: (await query(cfg, 'QueryCOrderTax', `C_Order_ID=${L.order}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none', grand_total: cents(h.GrandTotal), books: b1, books_euro: b2, ...(await commonL()) };
    }
    if (!L.order) return { outcome: 'ERROR', error: 'no legacy order (step PO failed)' };
    if (step === 'RCPT') {
      const ol = await olL();
      const r = await push('rcpt', { order: L.order, date: TODAY + ' 00:00:00', lines: ol.map(l => ({ ol: l.c_orderline_id, product: l.m_product_id, qty: Number(l.qtyordered) })) });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.rcpt = r.idmap.find(x => x.tbl === 'M_InOut').server_id; log(`§P2P_STEP legacy RCPT inout=${L.rcpt}`);
      const h = await postedWait('QueryMInOut', 'M_InOut_ID', L.rcpt), ls = (await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${L.rcpt}`)).map(lc); L.rLines = ls;
      for (const m of await query(cfg, 'QueryMMatchPO', `M_InOutLine_ID IN (${ls.map(l => l.m_inoutline_id).join(',')})`)) await postedWait('QueryMMatchPO', 'M_MatchPO_ID', m.M_MatchPO_ID);   // cost moves when MatchPO posts
      const [b1, b2] = await booksL(319, L.rcpt, h);
      return { outcome: 'COMPLETED', rcpt_status: h.DocStatus, rcpt_lines: ls.map(l => `${l.m_product_id}:${Number(l.movementqty)}`).sort().join('|'), books: b1, books_euro: b2, match_po: await matchPOL(), ...(await commonL()) };
    }
    if (step === 'INV') {
      const ol = await olL(), price = Object.fromEntries(ol.map(l => [l.c_orderline_id, Number(l.priceactual)]));
      const r = await push('inv', { order: L.order, date: TODAY + ' 00:00:00', lines: L.rLines.map(l => ({ ol: l.c_orderline_id, iol: l.m_inoutline_id, product: l.m_product_id, qty: Number(l.movementqty), price: price[l.c_orderline_id] })) });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.inv = r.idmap.find(x => x.tbl === 'C_Invoice').server_id; log(`§P2P_STEP legacy INV invoice=${L.inv}`);
      const h = await postedWait('QueryCInvoice', 'C_Invoice_ID', L.inv), ls = await query(cfg, 'QueryCInvoiceLine', `C_Invoice_ID=${L.inv}`);
      const mi = await query(cfg, 'QueryMMatchInv', `C_InvoiceLine_ID IN (${ls.map(l => l.C_InvoiceLine_ID).join(',')})`);
      let mb1 = 'none', mb2 = 'none'; if (mi.length) { const mh = await postedWait('QueryMMatchInv', 'M_MatchInv_ID', mi[0].M_MatchInv_ID); [mb1, mb2] = await booksL(472, mi[0].M_MatchInv_ID, mh); }
      const [b1, b2] = await booksL(318, L.inv, h);
      return { outcome: 'COMPLETED', inv_status: h.DocStatus, inv_lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyInvoiced)}:${cents(l.PriceActual)}:${l.C_Tax_ID}`).sort().join('|'),
        invoice_tax: (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${L.inv}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none',
        grand_total: cents(h.GrandTotal), ispaid: yn(h.IsPaid), books: b1, books_euro: b2, match_inv: mi.map(m => `${Number(m.Qty)}`).sort().join('|') || 'none', books_matchinv: mb1, books_matchinv_euro: mb2, match_po: await matchPOL(), ...(await commonL()) };
    }
    if (step === 'PAY') {
      const inv = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${L.inv}`))[0];
      const r = await push('pay', { inv: L.inv, amt: Number(inv.GrandTotal), date: TODAY + ' 00:00:00' }); if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 120) };
      L.pay = r.idmap.find(x => x.tbl === 'C_Payment').server_id; log(`§P2P_STEP legacy PAY payment=${L.pay}`);
      const p = await postedWait('QueryCPayment', 'C_Payment_ID', L.pay), inv2 = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${L.inv}`))[0];
      const al = await query(cfg, 'QueryCAllocationLine', `C_Payment_ID=${L.pay}`), hid = al[0] && al[0].C_AllocationHdr_ID;
      const [b1, b2] = await booksL(335, L.pay, p), [a1, a2] = hid ? await booksL(735, hid, await postedWait('QueryCAllocationHdr', 'C_AllocationHdr_ID', hid)) : ['none', 'none'];
      return { outcome: 'COMPLETED', pay_status: p.DocStatus, isallocated: yn(p.IsAllocated), ispaid: yn(inv2.IsPaid), allocations: al.map(a => `${cents(a.Amount)}:${a.C_Invoice_ID === L.inv ? 'inv' : '-'}`).sort().join('|') || 'none',
        books: b1, books_euro: b2, books_alloc: a1, books_alloc_euro: a2, ...(await commonL()) };
    }
    throw new Error('unknown step ' + step);
  }

  // ================= SQLite (the engine under test) =================
  const S = {}; let sq = X.idBase || 96000;
  const nid = () => ++sq * 10;
  const fold = (t, id, sc) => { if (!id) return 'none'; const d = DP.derivePostings(gb, { table: t, id }, sc); if (!d) return 'NO_FOLD'; return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
  const costS = () => costFmt(gb.prepare('SELECT c_acctschema_id, currentcostprice, currentqty, cumulatedamt FROM m_cost WHERE m_product_id=? AND m_costelement_id=? AND c_acctschema_id IN (?,?)').all(PRODUCT, AVG, SCHEMA, SCHEMA2));
  const bpS = () => (typeof E.bpOpenBalance === 'function' ? E.bpOpenBalance({ invoices: S.invoices, payments: S.payments, allocations: S.allocations }) : null);
  const commonS = () => { const b = bpS(); return { ol_qty: ordFmt(S.lines), bp_delta: b ? `${b.open - S.bp0.open}/${b.credit - S.bp0.credit}` : 'none', stock_delta: String(S.stock), cost: costS() }; };
  const ap = ops => { for (const o of ops || []) {
    if (o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine') { const l = S.lines.find(x => x.c_orderline_id === o.id); if (l) for (const k of ['qtyreserved', 'qtydelivered', 'qtyinvoiced']) if (o[k] != null) l[k] = o[k]; }
    if (o.op_type === 'MOVE_STOCK' && o.m_product_id === PRODUCT && o.m_locator_id === LOCATOR) S.stock += Number(o.qty);
    if (o.op_type === 'CREATE_DOCUMENT' && o.table === 'M_MatchPO') S.matchPO.push({ ...o });
    if (o.op_type === 'UPDATE_FIELD' && o.table === 'M_MatchPO') { const m = S.matchPO.find(x => x.m_matchpo_id === o.id); if (m) m[o.field] = o.value; }
    if (o.op_type === 'CREATE_DOCUMENT' && o.table === 'M_MatchInv') S.matchInv.push({ ...o }); } };
  const matchPOS = () => S.matchPO.map(m => `${Number(m.qty)}:${m.m_inoutline_id ? 'rcpt' : '-'}:${m.c_invoiceline_id ? 'inv' : '-'}`).sort().join('|') || 'none';
  const vendLoc = () => { const q = id => lc(seed.prepare('SELECT c_country_id, c_region_id, postal FROM c_location WHERE c_location_id=?').get(id));
    return { org: q((lc(seed.prepare('SELECT c_location_id FROM ad_orginfo WHERE ad_org_id=?').get(ORG)) || {}).c_location_id), bp: q((lc(seed.prepare('SELECT c_location_id FROM c_bpartner_location WHERE c_bpartner_location_id=?').get(VLOC)) || {}).c_location_id),
      wh: q((lc(seed.prepare('SELECT c_location_id FROM m_warehouse WHERE m_warehouse_id=?').get(WH)) || {}).c_location_id) }; };
  const taxPO = pid => { const l = vendLoc(), b = lc(seed.prepare('SELECT istaxexempt FROM c_bpartner WHERE c_bpartner_id=?').get(VBP)) || {};
    return E.taxLookup({ taxes: taxRows, taxCategoryId: (lc(seed.prepare('SELECT c_taxcategory_id FROM m_product WHERE m_product_id=?').get(pid)) || {}).c_taxcategory_id, isSOTrx: false, billDate: TODAY, billFrom: l.org, billTo: l.bp, warehouse: l.wh, bpTaxExempt: b.istaxexempt }); };
  const PLCUR = (lc(seed.prepare('SELECT c_currency_id FROM m_pricelist WHERE m_pricelist_id=?').get(PL)) || {}).c_currency_id;
  const plIncl = (lc(seed.prepare('SELECT istaxincluded FROM m_pricelist WHERE m_pricelist_id=?').get(PL)) || {}).istaxincluded === 'Y';
  async function localStep(step) {
    if (step === 'PO') {
      S.stock = 0; S.invoices = []; S.payments = []; S.allocations = []; S.matchPO = []; S.matchInv = []; S.bp0 = { open: 0, credit: 0 }; { const b = bpS(); if (b) S.bp0 = b; }
      S.order = nid();
      const t = taxPO(PRODUCT); if (!t.ok) return { outcome: 'REJECTED', reason: t.reason };
      S.lines = [{ c_orderline_id: S.order * 100 + 10, m_product_id: PRODUCT, qtyordered: QTY, priceactual: String(PRICE), linenetamt: (QTY * PRICE).toFixed(2), c_tax_id: t.c_tax_id, qtyreserved: 0, qtydelivered: 0, qtyinvoiced: 0 }];
      const tx = E.orderTaxes(S.lines, taxById, plIncl, taxChildren);
      const ops = E.completeOrder({ c_order_id: S.order, issotrx: 'N' }, S.lines, { isautogenerateinout: 'N', isautogenerateinvoice: 'N' });
      ap(E.orderReserve({ binding: true }, S.lines).ops);
      const st = ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'C_Order').pop();
      gb.prepare('INSERT INTO c_order(c_order_id,issotrx,c_bpartner_id,docstatus,ad_client_id,ad_org_id,c_currency_id,m_pricelist_id) VALUES(?,?,?,?,?,?,?,?)').run(S.order, 'N', VBP, st && st.doc_status, 11, ORG, PLCUR, PL);   // MOrder currency = its price list's (MOrder.java:1292-1300)
      S.grand = tx.grandTotal;
      return { outcome: 'COMPLETED', docstatus: st && st.doc_status, lines: S.lines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}:${l.c_tax_id}`).join('|'),
        order_tax: tx.rows.map(x => `${x.c_tax_id}:${x.taxbaseamt}:${x.taxamt}`).sort().join('|') || 'none', grand_total: tx.grandTotal, books: fold('C_Order', S.order, SCHEMA), books_euro: fold('C_Order', S.order, SCHEMA2), ...commonS() };
    }
    if (!S.order) return { outcome: 'ERROR', error: 'no sqlite order' };
    if (step === 'RCPT') {
      S.rcpt = nid();
      S.rLines = S.lines.map((l, i) => ({ m_inoutline_id: S.rcpt * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id, m_locator_id: LOCATOR }));
      if (typeof E.completeInOut !== 'function') return { outcome: 'COMPLETED', rcpt_status: 'DR', rcpt_lines: S.rLines.map(l => `${l.m_product_id}:${l.movementqty}`).join('|'), books: 'none', books_euro: 'none', match_po: 'none', ...commonS() };
      const r = E.completeInOut({ m_inout_id: S.rcpt, issotrx: 'N', movementtype: 'V+', docstatus: 'DR' }, S.rLines, { orderLines: S.lines, newId: () => nid() }); if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      ap(r.ops); const status = (r.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'M_InOut').pop() || {}).doc_status;
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,c_order_id,c_bpartner_id,ad_client_id,ad_org_id,dateacct) VALUES(?,?,?,?,?,?,?,?,?)').run(S.rcpt, 'N', 'V+', status, S.order, VBP, 11, ORG, TODAY + ' 00:00:00');
      S.rLines.forEach(l => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,c_orderline_id,m_locator_id) VALUES(?,?,?,?,?,?)').run(l.m_inoutline_id, S.rcpt, l.m_product_id, l.movementqty, l.c_orderline_id, LOCATOR));
      S.lines.forEach(l => gb.prepare('INSERT INTO c_orderline(c_orderline_id,c_order_id,m_product_id,qtyordered,priceactual,c_tax_id,linenetamt,c_currency_id) VALUES(?,?,?,?,?,?,?,?)').run(l.c_orderline_id, S.order, l.m_product_id, l.qtyordered, l.priceactual, l.c_tax_id, l.linenetamt, PLCUR));
      for (const m of S.matchPO.filter(x => !x._saved)) { gb.prepare('INSERT INTO m_matchpo(m_matchpo_id,c_orderline_id,m_inoutline_id,c_invoiceline_id,m_product_id,qty,dateacct) VALUES(?,?,?,?,?,?,?)').run(m.m_matchpo_id, m.c_orderline_id, m.m_inoutline_id, m.c_invoiceline_id || null, m.m_product_id, m.qty, TODAY + ' 00:00:00'); m._saved = true;
        if (typeof DP.costUpdatesForMatchPO === 'function') DP.costUpdatesForMatchPO(gb, m.m_matchpo_id).filter(u => { if (u.absent) log(`§P2P_COST_ABSENT ${u.absent.join(';')}`); return !u.absent; }).forEach(u => gb.prepare('UPDATE m_cost SET currentcostprice=?, currentqty=?, cumulatedamt=?, cumulatedqty=? WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(u.currentcostprice, u.currentqty, u.cumulatedamt, u.cumulatedqty, u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id)); }
      return { outcome: 'COMPLETED', rcpt_status: status, rcpt_lines: S.rLines.map(l => `${l.m_product_id}:${l.movementqty}`).join('|'), books: fold('M_InOut', S.rcpt, SCHEMA), books_euro: fold('M_InOut', S.rcpt, SCHEMA2), match_po: matchPOS(), ...commonS() };
    }
    if (step === 'INV') {
      S.inv = nid();
      const r = E.prepareInvoice({ c_invoice_id: S.inv, issotrx: 'N', c_bpartner_id: VBP, dateinvoiced: TODAY }, S.rLines.map((l, i) => ({ c_invoiceline_id: S.inv * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.movementqty })),
        { priceOf: () => ({ pricestd: String(X.mut ? PRICE + X.mut / 100 : PRICE) }), taxOf: taxPO, taxById, taxChildren, taxIncluded: plIncl });
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const ops = r.ops.concat(E.completeInvoice({ c_invoice_id: S.inv, issotrx: 'N' }, r.lines, {}));
      const status = (ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'C_Invoice').pop() || {}).doc_status;
      const iLines = r.lines.map((l, i) => ({ ...l, c_orderline_id: S.rLines[i].c_orderline_id, m_inoutline_id: S.rLines[i].m_inoutline_id }));
      if (typeof E.matchFromInvoice === 'function') ap(E.matchFromInvoice({ c_invoice_id: S.inv, issotrx: 'N' }, iLines, { matchPO: S.matchPO, orderLines: S.lines, receiptLines: S.rLines, newId: () => nid() }).ops);
      S.invoices.push({ c_invoice_id: S.inv, issotrx: 'N', docbasetype: 'API', docstatus: status, grandtotal: r.grandTotal, ispaid: 'N' });
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,c_order_id,docstatus,c_doctype_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(S.inv, VBP, r.grandTotal / 100, 'N', 100, TODAY + ' 00:00:00', 11, ORG, S.order, status, 123);
      iLines.forEach(l => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt,qtyinvoiced,priceactual,c_orderline_id,m_inoutline_id,c_tax_id) VALUES(?,?,?,?,?,?,?,?,?)').run(l.c_invoiceline_id, S.inv, l.m_product_id, l.linenetamt, l.qtyinvoiced, l.priceactual, l.c_orderline_id, l.m_inoutline_id, l.c_tax_id));
      r.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(S.inv, t.c_tax_id, t.taxamt / 100));
      for (const m of S.matchInv.filter(x => !x._saved)) { gb.prepare('INSERT INTO m_matchinv(m_matchinv_id,c_invoiceline_id,m_inoutline_id,m_product_id,qty,c_invoice_id) VALUES(?,?,?,?,?,?)').run(m.m_matchinv_id, m.c_invoiceline_id, m.m_inoutline_id, m.m_product_id, m.qty, S.inv); m._saved = true; }
      for (const m of S.matchPO) if (m.c_invoiceline_id) gb.prepare('UPDATE m_matchpo SET c_invoiceline_id=? WHERE m_matchpo_id=?').run(m.c_invoiceline_id, m.m_matchpo_id);
      const mi = S.matchInv[0];
      return { outcome: 'COMPLETED', inv_status: status, inv_lines: r.lines.map(l => `${l.m_product_id}:${l.qtyinvoiced}:${cents(l.priceactual)}:${l.c_tax_id}`).join('|'), invoice_tax: r.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`).sort().join('|') || 'none',
        grand_total: r.grandTotal, ispaid: 'N', books: fold('C_Invoice', S.inv, SCHEMA), books_euro: fold('C_Invoice', S.inv, SCHEMA2), match_inv: S.matchInv.map(m => `${Number(m.qty)}`).sort().join('|') || 'none',
        books_matchinv: mi ? fold('M_MatchInv', mi.m_matchinv_id, SCHEMA) : 'none', books_matchinv_euro: mi ? fold('M_MatchInv', mi.m_matchinv_id, SCHEMA2) : 'none', match_po: matchPOS(), ...commonS() };
    }
    if (step === 'PAY') {
      const inv = S.invoices.find(i => i.c_invoice_id === S.inv); S.pay = nid();
      const pay = { c_payment_id: S.pay, c_bpartner_id: VBP, c_invoice_id: S.inv, payamt: inv.grandtotal / 100, isreceipt: 'N', c_currency_id: 100, dateacct: TODAY };
      const r = E.completePayment(pay, { c_invoice_id: S.inv, grandtotal: inv.grandtotal / 100, issotrx: 'N', dateacct: TODAY }, { newId: nid }); if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const status = t => (r.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === t).pop() || {}).doc_status;
      const flag = (t, f2) => { const u = r.ops.filter(o => o.op_type === 'UPDATE_FIELD' && o.table === t && o.field === f2).pop(); return u ? u.value : 'N'; };
      const ah = r.ops.find(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr'), al = r.ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine');
      inv.ispaid = flag('C_Invoice', 'ispaid');
      S.payments.push({ c_payment_id: S.pay, isreceipt: 'N', payamt: cents(pay.payamt), docstatus: status('C_Payment'), isallocated: flag('C_Payment', 'isallocated') });
      if (ah) S.allocations.push({ c_allocationhdr_id: ah.c_allocationhdr_id, isactive: 'Y', docstatus: status('C_AllocationHdr'), lines: al.map(l => ({ c_invoice_id: l.c_invoice_id, c_payment_id: l.c_payment_id, amount: cents(l.amount) })) });
      gb.prepare('INSERT INTO c_payment(c_payment_id,c_bpartner_id,c_invoice_id,payamt,isreceipt,c_currency_id,c_bankaccount_id,tendertype,dateacct,docstatus,ad_client_id,ad_org_id,c_doctype_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(S.pay, VBP, S.inv, pay.payamt, 'N', 100, 100, 'X', TODAY + ' 00:00:00', status('C_Payment'), 11, ORG, 125);
      if (ah) { gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(ah.c_allocationhdr_id, ah.c_currency_id, TODAY + ' 00:00:00', status('C_AllocationHdr'), 11, ORG);
        for (const l of al) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?)').run(l.c_allocationline_id, ah.c_allocationhdr_id, l.c_payment_id, l.c_invoice_id, l.c_bpartner_id, l.amount, l.writeoffamt || 0, l.discountamt || 0); }
      return { outcome: 'COMPLETED', pay_status: status('C_Payment'), isallocated: flag('C_Payment', 'isallocated'), ispaid: inv.ispaid, allocations: al.map(l => `${cents(l.amount)}:${l.c_invoice_id === S.inv ? 'inv' : '-'}`).sort().join('|') || 'none',
        books: fold('C_Payment', S.pay, SCHEMA), books_euro: fold('C_Payment', S.pay, SCHEMA2), books_alloc: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA), books_alloc_euro: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA2), ...commonS() };
    }
    throw new Error('unknown step ' + step);
  }
  const KEYS = {
    PO: ['outcome', 'docstatus', 'lines', 'order_tax', 'grand_total', 'books', 'books_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost'],
    RCPT: ['outcome', 'rcpt_status', 'rcpt_lines', 'books', 'books_euro', 'match_po', 'ol_qty', 'bp_delta', 'stock_delta', 'cost'],
    INV: ['outcome', 'inv_status', 'inv_lines', 'invoice_tax', 'grand_total', 'ispaid', 'books', 'books_euro', 'match_inv', 'books_matchinv', 'books_matchinv_euro', 'match_po', 'ol_qty', 'bp_delta', 'stock_delta', 'cost'],
    PAY: ['outcome', 'pay_status', 'isallocated', 'ispaid', 'allocations', 'books', 'books_euro', 'books_alloc', 'books_alloc_euro', 'ol_qty', 'bp_delta', 'stock_delta', 'cost'] };
  const STEPS = ['PO', 'RCPT', 'INV', 'PAY'];
  return { STEPS, KEYS, scenario: (step, i) => ({ id: `P2P${i + 1}-${step}`, facts: { step }, legacy: f => legacyStep(f.step), local: f => localStep(f.step) }), S, L };
};
