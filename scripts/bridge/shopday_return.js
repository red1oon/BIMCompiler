// ⚠ DO NOT REMOVE -- SHOP DAY SD-16: customer return = RMA -> customer return receipt -> AR credit memo (prompts/SQLiteIDEMPIERE.md §SD16). READ THE LOG: §SHOPDAY_STEP SD-16* lines.
// Same facts to both sides: legacy through the stock WS (Bridge_createData_M_RMA / _M_RMALine / Pilot_createData_M_InOut / _C_Invoice composites, doc-actions CO) as the new client's Admin
// role; SQLite = erp_engine verbs (rmaLineSave, completeRMA, completeInOut + rmaReceiptEffects, prepareInvoice) + doc_poster (sales-return books, ARC books, cost updates) on the shop twin.
// A step is MATCH only if the compared state is non-empty and equal AND the legacy side really completed (a refusal step must be REJECTED on legacy: INCONCLUSIVE otherwise).
'use strict';
module.exports = function makeReturn(env, M) {
  const { docEnv, R, log, out, TODAY, tw, T, F, ids, lrefId, lfind, lcreate, sref } = env;
  const ST = { sq: 93000, l: {}, s: { rmaLines: [], rmas: [], cms: [] } };
  const nid = () => ++ST.sq * 10;
  const SEP = '|';
  const sortJ = a => a.sort().join(SEP) || 'none';

  async function sd16() {
    const x = docEnv(), C = x.C, cents = x.cents, lc = x.lc, E = x.E, DP = x.DP, gb = x.gb, q = (t, w) => x.query(x.cfg, t, w);
    const g1 = n => +T.pg(`select c_doctype_id from c_doctype where ad_client_id=${ids.clientId} and name='${n}'`)[0];
    const DT = { rma: g1('Customer Return Material'), mmr: g1('MM Customer Return'), arc: g1('AR Credit Memo'), alloc: g1('Allocation') };
    log(`§SD16_CTX doctypes rma=${DT.rma} mmr=${DT.mmr} arc=${DT.arc} alloc=${DT.alloc} customer=${C.customer} product=${C.prod.rake} locator=${C.locator}`);
    const PRODUCT = C.prod.rake, LOCATOR = C.locator, BP = C.customer, LOC = C.customerLoc;
    const num = v => String(Number(v));
    const yn = v => (v === true || v === 'Y' ? 'Y' : 'N');
    const fold = (t, id, sc) => { const d = DP.derivePostings(gb, { table: t, id }, sc); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? x.fmtPostings(d.lines) : 'none'); };

    // ---------------- legacy side ----------------
    const DESC = {
      rma: { composite: 'SyncOrder', header: { serviceType: 'Bridge_createData_M_RMA', table: 'M_RMA', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: DT.rma }, IsSOTrx: { const: 'Y' }, InOut_ID: { path: 'ship' }, M_RMAType_ID: { path: 'type' }, Name: { path: 'name' }, SalesRep_ID: { const: C.user } } },
        lines: { serviceType: 'Bridge_createData_M_RMALine', table: 'M_RMALine', parent: 'M_RMA_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, M_InOutLine_ID: { path: 'iol' }, Qty: { path: 'qty' } } },
        docAction: { serviceType: 'Bridge_setDocAction_M_RMA', table: 'M_RMA', action: 'CO' } },
      ret: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_M_InOut', table: 'M_InOut', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: DT.mmr }, MovementType: { const: 'C+' }, IsSOTrx: { const: 'Y' }, M_RMA_ID: { path: 'rma' }, C_BPartner_ID: { const: BP }, C_BPartner_Location_ID: { const: LOC }, M_Warehouse_ID: { const: C.wh }, MovementDate: { path: 'date' }, DateAcct: { path: 'date' } } },
        lines: { serviceType: 'Pilot_createData_M_InOutLine', table: 'M_InOutLine', parent: 'M_InOut_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, M_RMALine_ID: { path: 'rl' }, M_Product_ID: { path: 'product' }, M_Locator_ID: { const: LOCATOR }, MovementQty: { path: 'qty' }, QtyEntered: { path: 'qty' } } },
        docAction: { serviceType: 'Pilot_setDocAction_M_InOut', table: 'M_InOut', action: 'CO' } },
      cm: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_Invoice', table: 'C_Invoice', fields: { AD_Org_ID: { const: C.org }, C_DocTypeTarget_ID: { const: DT.arc }, IsSOTrx: { const: 'Y' }, M_RMA_ID: { path: 'rma' }, C_BPartner_ID: { const: BP }, C_BPartner_Location_ID: { const: LOC }, M_PriceList_ID: { const: C.pl.sales }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' } } },
        lines: { serviceType: 'Pilot_createData_C_InvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, M_RMALine_ID: { path: 'rl' }, M_InOutLine_ID: { path: 'iol' }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' }, PriceEntered: { path: 'price' }, PriceActual: { path: 'price' }, C_Tax_ID: { path: 'tax' } } },
        docAction: { serviceType: 'Pilot_setDocAction_C_Invoice', table: 'C_Invoice', action: 'CO' } },
      alloc: { composite: 'SyncOrder', header: { serviceType: 'Pilot_createData_C_AllocationHdr', table: 'C_AllocationHdr', fields: { AD_Org_ID: { const: C.org }, C_Currency_ID: { const: C.cur }, C_DocType_ID: { const: DT.alloc }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' }, IsManual: { const: 'Y' } } },
        lines: { serviceType: 'Pilot_createData_C_AllocationLine', table: 'C_AllocationLine', parent: 'C_AllocationHdr_ID', from: 'lines', fields: { AD_Org_ID: { const: C.org }, C_Invoice_ID: { path: 'inv' }, C_BPartner_ID: { const: BP }, Amount: { path: 'amt' } } },
        docAction: { serviceType: 'Pilot_setDocAction_C_AllocationHdr', table: 'C_AllocationHdr', action: 'CO' } } };
    let LINK = null;
    const push = async (n, p) => { if (!LINK) { let bytes = null; LINK = await x.createLink({ cfg: x.cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: DESC }); }
      const u = LINK.submit(n, p); await LINK.drain(); const s = LINK.store.get(u);
      if (s.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(s.error || '')) throw new Error('§WS_CONFIG ' + s.error);
      return { ok: s.state === 'CONFIRMED', error: s.error, idmap: LINK.store.idmap(u) }; };
    const fs = require('fs'), SRVLOG = process.env.HOME + '/idempiere-pilot/server.log';
    const srvSize = () => { try { return fs.statSync(SRVLOG).size; } catch (e) { return 0; } };
    const srvReason = async off => { await new Promise(r => setTimeout(r, 1200)); try { const fd = fs.openSync(SRVLOG, 'r'), n = fs.statSync(SRVLOG).size - off, b = Buffer.alloc(Math.max(0, Math.min(n, 400000))); fs.readSync(fd, b, 0, b.length, off); fs.closeSync(fd);
      const m = [...b.toString().matchAll(/saveError: ([^\n\[]+?) - /g)].map(y => y[1].trim()); return m.length ? m[m.length - 1] : 'unknown'; } catch (e) { return 'unreadable'; } };   // the legacy server's own reason (AD_Message key) for a refused save
    const postedWait = async (rt, col, id) => { let h; for (let i = 0; i < 10; i++) { h = (await q(rt, `${col}=${id}`))[0]; if (['Y', 'E'].includes(h.Posted) || h.Posted === true) break; await new Promise(r => setTimeout(r, 1500)); } return h; };
    const booksL = async (t, id, h) => (h && h.Posted === 'E') ? 'REFUSED:Posted=E' : await x.legacyFactsOf(t, id, x.SCHEMA);
    const bpL = async () => { const b = (await q('QueryCBPartner', `C_BPartner_ID=${BP}`))[0]; return { open: b.TotalOpenBalance, credit: b.SO_CreditUsed }; };
    const bpDeltaL = async b0 => { const b = await bpL(); return `${cents(b.open) - cents(b0.open)}/${cents(b.credit) - cents(b0.credit)}`; };
    const costRowL = async p => { const r = (await q('QueryMCost', `M_Product_ID=${p} AND C_AcctSchema_ID=${x.SCHEMA} AND M_CostElement_ID=${x.AVG_EL} AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0`))[0]; return r ? `${num(r.CurrentCostPrice)}@${num(r.CurrentQty)}/${num(r.CumulatedQty)}/${num(r.CumulatedAmt)}` : 'none'; };
    const costRowS = p => { const r = gb.prepare('SELECT currentcostprice, currentqty, cumulatedqty, cumulatedamt FROM m_cost WHERE m_product_id=? AND c_acctschema_id=? AND m_costelement_id=?').get(p, x.SCHEMA, x.AVG_EL); return r ? `${num(r.currentcostprice)}@${num(r.currentqty)}/${num(r.cumulatedqty)}/${num(r.cumulatedamt)}` : 'none'; };
    const rmaTid = +T.pg("select ad_table_id from ad_table where tablename='M_RMA'")[0];
    const factsCountL = async (t, id) => (await q('QueryFactAcct', `AD_Table_ID=${t} AND Record_ID=${id} AND C_AcctSchema_ID=${x.SCHEMA}`)).length;
    const snapL = async () => ({ bp: await bpL(), stock: await x.locStock(PRODUCT, LOCATOR), cq: await x.legacyCostQty(PRODUCT) });
    const dL = async s0 => ({ stock_delta: String((await x.locStock(PRODUCT, LOCATOR)) - s0.stock), cost_qty_delta: String((await x.legacyCostQty(PRODUCT)) - s0.cq), bp_delta: await bpDeltaL(s0.bp) });

    // ---------------- SQLite side state ----------------
    const S = ST.s;
    const bpOpen = () => { const sale = S.sale && gb.prepare('SELECT grandtotal FROM c_invoice WHERE c_invoice_id=?').get(S.sale.inv);
      return E.bpOpenBalance({ invoices: (sale ? [{ c_invoice_id: S.sale.inv, issotrx: 'Y', docbasetype: 'ARI', docstatus: 'CO', ispaid: S.saleInvPaid || 'N', grandtotal: sale.grandtotal }] : []).concat(S.cms.map(c => ({ c_invoice_id: c.id, issotrx: 'Y', docbasetype: 'ARC', docstatus: 'CO', ispaid: c.ispaid || 'N', grandtotal: c.grandtotal / 100 }))), payments: [], allocations: S.allocs || [] }); };
    const snapS = () => ({ bp: bpOpen(), stock: S.stock || 0, cq: x.localCostQty(PRODUCT) });
    const dS = s0 => { const b = bpOpen(); return { stock_delta: String((S.stock || 0) - s0.stock), cost_qty_delta: String(x.localCostQty(PRODUCT) - s0.cq), bp_delta: `${Math.round((b.open - s0.bp.open) * 100)}/${Math.round((b.credit - s0.bp.credit) * 100)}` }; };

    // ================= fixture 1: the cash sale (3 x rake), judged with the SD-11 keys =================
    const SALE = M.sale;
    const saleRows = await R.run([{ id: 'SD16-sale', facts: { lines: [{ product: PRODUCT, qty: 3 }] }, legacy: SALE.legacySale, local: f => SALE.localSale(f, 0) }], { keys: SALE.POSKEYS, notCompared: {} }, [], { log });
    const sv = !saleRows.length ? 'INCONCLUSIVE' : saleRows[0].verdict === 'MATCH' ? 'MATCH' : saleRows[0].verdict === 'ERROR' ? 'BLOCKED' : 'DIFF';
    log(`§SHOPDAY_STEP SD-16s ${sv} scenarios=${saleRows.length} gaps=${(saleRows[0] && saleRows[0].gaps || []).map(g => g.key).join(',') || '-'}`); out.steps.push({ id: 'SD-16s', verdict: sv });
    const P = SALE.posEnv(), orderL = P.lastOrder;
    if (!orderL || !P.lastLocal) { log('§SHOPDAY_STEP SD-16 BLOCKED no sale fixture'); out.steps.push({ id: 'SD-16', verdict: 'BLOCKED' }); return; }
    {   // legacy ids of the sale
      const ios = await q('QueryMInOut', `C_Order_ID=${orderL}`), ship = ios.find(i => i.DocStatus === 'CO'); ST.l.ship = ship.M_InOut_ID;
      ST.l.shipLines = (await q('QueryMInOutLine', `M_InOut_ID=${ST.l.ship}`)).map(lc); ST.l.inv = (await q('QueryCInvoice', `C_Order_ID=${orderL}`))[0].C_Invoice_ID;
      ST.l.invLines = (await q('QueryCInvoiceLine', `C_Invoice_ID=${ST.l.inv}`)).map(lc);
      // local ids of the sale (the fixture's rows were written by localSale)
      const { g, opts } = P.lastLocal;
      ST.s.sale = { ship: opts.inoutId, inv: opts.invoiceId, lines: g.soLines.map(l => ({ iol: opts.inoutId * 100 + l.c_orderline_id % 100, ol: l.c_orderline_id, product: l.m_product_id, qty: Number(l.qtyordered), price: String(l.priceactual), tax: l.c_tax_id })) };
      log(`§SD16_FIXTURE legacy ship=${ST.l.ship} lines=${ST.l.shipLines.map(l => l.m_inoutline_id + ':' + l.m_product_id + ':' + Number(l.movementqty)).join(',')} inv=${ST.l.inv} | sqlite ship=${ST.s.sale.ship} lines=${ST.s.sale.lines.map(l => l.iol + ':' + l.product + ':' + l.qty + '@' + l.price + '/t' + l.tax).join(',')}`);
    }

    // ================= fixture 2: stock up at a different cost (PO 10 x rake at 40 -> receipt) so "current cost" differs from the cost the shipment shipped at =================
    x.product = PRODUCT; x.qty = 10; x.price = 40; x.idBase = 92000;
    const P2P = require('./cycle_p2p')(x);
    for (const [i, st] of P2P.STEPS.slice(0, 2).entries()) {
      const rows = await R.run([P2P.scenario(st, i)], { keys: P2P.KEYS[st], notCompared: {} }, [], { log });
      const bad = rows.filter(r => r.verdict !== 'MATCH'), v = rows.length === 0 ? 'INCONCLUSIVE' : bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : 'MATCH';
      log(`§SHOPDAY_STEP SD-16p-${st} ${v} scenarios=${rows.length} gaps=${bad.map(r => r.id + ':' + r.verdict).join(',') || '-'}`); out.steps.push({ id: 'SD-16p-' + st, verdict: v });
    }
    // the local stock counter for the return keys starts here (relative deltas)
    S.stock = 0;

    // ================= master: the RMA type (M_RMA.M_RMAType_ID is mandatory) =================
    const lt = (await lfind('m_rmatype', 'Name', 'SD Return')) || await lcreate('M_RMAType', { Name: 'SD Return' });
    const stype = tw.insert('m_rmatype', { name: 'SD Return' }, { pk: lt });
    await env.compareStep('SD-16m', ['m_rmatype'], 'RMA type master (M_RMAType through the WS)');
    ST.l.type = lt; ST.s.type = stype;

    const resV = async (id, keys, rows, mustComplete, extra = '') => {
      const bad = rows.filter(r => r.verdict !== 'MATCH'), lg = (rows[0] || {}).legacy || {};
      let v = rows.length === 0 ? 'INCONCLUSIVE' : bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : 'MATCH';
      if (v === 'MATCH' && lg.outcome !== mustComplete) v = 'INCONCLUSIVE';   // legacy did not do what the step asserts (vacuous)
      log(`§SHOPDAY_STEP ${id} ${v} legacy=${lg.outcome} ${extra} gaps=${bad.map(r => (r.gaps || []).map(g => g.key).join(',') || r.verdict).join(';') || '-'}`);
      if (v !== 'MATCH') log(`§SHOPDAY_LEGACY_RESULT ${id} ${JSON.stringify(lg).slice(0, 700)}`);
      out.steps.push({ id, verdict: v });
      return v;
    };

    // ================= SD16a / r1 / r2 : the RMA =================
    const KEYS_RMA = ['outcome', 'docstatus', 'rma_issotrx', 'rma_amt', 'rma_lines', 'rma_books', 'stock_delta', 'cost_qty_delta', 'bp_delta'];
    const rmaLegacy = async f => {
      const s0 = await snapL(), ln = ST.l.shipLines[0];
      const off = srvSize(), r = await push('rma', { name: 'SD RMA ' + f.id, type: ST.l.type, ship: ST.l.ship, lines: [{ iol: ln.m_inoutline_id, qty: f.qty }] });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 160), reason_code: await srvReason(off) };
      const id = r.idmap.find(y => y.tbl === 'M_RMA').server_id; (ST.l.rmas = ST.l.rmas || []).push(id);
      const h = (await q('QueryMRMA', `M_RMA_ID=${id}`))[0], ls = (await q('QueryMRMALine', `M_RMA_ID=${id}`)).map(lc); ST.l['rmaLines_' + id] = ls;
      log(`§SD16_STEP legacy RMA id=${id} status=${h.DocStatus} amt=${h.Amt} lines=${ls.map(l => l.m_rmaline_id + ':' + l.m_product_id + ':' + Number(l.qty) + '@' + Number(l.amt) + '/t' + l.c_tax_id + '/net' + Number(l.linenetamt)).join(',')}`);
      return { outcome: 'COMPLETED', docstatus: h.DocStatus, rma_issotrx: yn(h.IsSOTrx), rma_amt: cents(h.Amt), rma_lines: sortJ(ls.map(l => `${l.m_product_id}:${Number(l.qty)}:${cents(l.amt)}:${l.c_tax_id}:${cents(l.linenetamt)}`)),
        rma_books: (await factsCountL(rmaTid, id)) ? 'ROWS' : 'none', ...(await dL(s0)) };
    };
    const rmaLocal = async f => {
      if (typeof E.rmaLineSave !== 'function' || typeof E.completeRMA !== 'function') return { outcome: 'ABSENT:RMA verb (erp_engine.rmaLineSave/completeRMA)' };   // SQLITE-GAP before the port
      const s0 = snapS(), sl = S.sale.lines[0], saved = [];
      const others = S.rmaLines.filter(l => l.iol === sl.iol && l.status === 'CO').reduce((a, l) => a + l.qty, 0);
      const r = E.rmaLineSave({ m_inoutline_id: sl.iol, qty: f.qty }, { m_product_id: sl.product, shipqty: sl.qty, priceactual: sl.price, c_tax_id: sl.tax, origqty: sl.qty, othersCompletedQty: others }, saved, 2);
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason, reason_code: r.reason };
      const rmaId = nid(), ln = { ...r.line, shipqty: sl.qty, othersCompletedQty: others };
      const c = E.completeRMA({ m_rma_id: rmaId }, [ln], { taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded: x.TAX_INCLUDED });
      if (!c.ok) return { outcome: 'REJECTED', reason: c.reason };
      const rl = { m_rmaline_id: rmaId * 100, rma: rmaId, iol: sl.iol, product: sl.product, qty: Number(ln.qty), amt: ln.amt, tax: ln.c_tax_id, linenet: ln.linenetamt, status: 'CO', qtydelivered: 0, qtyinvoiced: 0 };
      S.rmaLines.push(rl); S.rmas.push({ id: rmaId, amt: c.amt, taxes: c.taxes, lines: [rl] });
      return { outcome: 'COMPLETED', docstatus: c.docstatus, rma_issotrx: 'Y', rma_amt: c.amt, rma_lines: `${ln.m_product_id}:${Number(ln.qty)}:${cents(ln.amt)}:${ln.c_tax_id}:${ln.linenetamt}`, rma_books: 'none', ...dS(s0) };
    };
    // r1 first (qty 4 > shipped 3: refused at the line save, nothing created), then the real RMA of 2, then r2 (2 more > 3 - 2)
    let rows = await R.run([{ id: 'SD16r1-over-shipped', facts: { id: 'r1', qty: 4 }, legacy: rmaLegacy, local: rmaLocal }], { keys: ['outcome', 'reason_code'], notCompared: {} }, [], { log });
    { const lg = (rows[0] || {}).legacy || {}; log(`§SD16_OUTCOME r1 legacy=${JSON.stringify(lg).slice(0, 300)}`); await resV('SD-16r1', ['outcome', 'reason_code'], rows, 'REJECTED'); }
    rows = await R.run([{ id: 'SD16a-rma', facts: { id: 'a', qty: 2 }, legacy: rmaLegacy, local: rmaLocal }], { keys: KEYS_RMA, notCompared: {} }, [], { log });
    const aV = await resV('SD-16a', KEYS_RMA, rows, 'COMPLETED');
    if (aV === 'BLOCKED' || !ST.l.rmas) { log('§SHOPDAY_STEP SD-16 BLOCKED RMA step failed'); out.steps.push({ id: 'SD-16', verdict: 'BLOCKED' }); return; }
    rows = await R.run([{ id: 'SD16r2-cumulative', facts: { id: 'r2', qty: 2 }, legacy: rmaLegacy, local: rmaLocal }], { keys: ['outcome', 'reason_code'], notCompared: {} }, [], { log });
    { const lg = (rows[0] || {}).legacy || {}; log(`§SD16_OUTCOME r2 legacy=${JSON.stringify(lg).slice(0, 300)}`); await resV('SD-16r2', ['outcome', 'reason_code'], rows, 'REJECTED'); }

    // ================= SD16b / r3 : the customer return receipt =================
    const KEYS_RET = ['outcome', 'ret_status', 'ret_lines', 'books', 'stock_delta', 'cost_qty_delta', 'cost_state', 'rma_delivered', 'bp_delta'];
    const retLegacy = async f => {
      const s0 = await snapL(), rmaId = ST.l.rmas[0], rls = ST.l['rmaLines_' + rmaId];
      const r = await push('ret', { rma: rmaId, date: TODAY + ' 00:00:00', lines: rls.map(l => ({ rl: l.m_rmaline_id, product: l.m_product_id, qty: f.qty })) });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 160) };
      const id = r.idmap.find(y => y.tbl === 'M_InOut').server_id; (ST.l.rets = ST.l.rets || []).push(id);
      const h = await postedWait('QueryMInOut', 'M_InOut_ID', id), ls = (await q('QueryMInOutLine', `M_InOut_ID=${id}`)).map(lc); ST.l['retLines_' + id] = ls;
      const rml = (await q('QueryMRMALine', `M_RMA_ID=${rmaId}`)).map(lc);
      log(`§SD16_STEP legacy RET id=${id} status=${h.DocStatus} posted=${h.Posted} type=${h.MovementType} doctype=${h.C_DocType_ID} lines=${ls.map(l => l.m_inoutline_id + ':' + Number(l.movementqty)).join(',')}`);
      return { outcome: 'COMPLETED', ret_status: h.DocStatus, ret_lines: sortJ(ls.map(l => `${l.m_product_id}:${Number(l.movementqty)}`)), books: await booksL(319, id, h), cost_state: await costRowL(PRODUCT),
        rma_delivered: sortJ(rml.map(l => `${l.m_product_id}:${Number(l.qtydelivered)}`)), ...(await dL(s0)) };
    };
    const retLocal = async f => {
      if (!S.rmas[0] || typeof E.rmaReceiptEffects !== 'function') return { outcome: 'ABSENT:' + (S.rmas[0] ? 'rmaReceiptEffects verb' : 'no sqlite RMA') };
      const s0 = snapS(), rma = S.rmas[0], id = nid();
      const io = { m_inout_id: id, issotrx: 'Y', movementtype: 'C+', docstatus: 'DR' };
      const lines = rma.lines.map((rl, i) => ({ m_inoutline_id: id * 100 + i, m_product_id: rl.product, movementqty: f.qty, c_orderline_id: null, m_locator_id: LOCATOR, m_rmaline_id: rl.m_rmaline_id }));
      const c = E.completeInOut(io, lines, { newId: () => nid() }); if (!c.ok) return { outcome: 'REJECTED', reason: c.reason };
      const status = (c.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'M_InOut').pop() || {}).doc_status;
      c.ops.filter(o => o.op_type === 'MOVE_STOCK' && o.m_product_id === PRODUCT && o.m_locator_id === LOCATOR).forEach(o => { S.stock = (S.stock || 0) + Number(o.qty); });
      const eff = E.rmaReceiptEffects(io, lines, rma.lines.map(rl => ({ m_rmaline_id: rl.m_rmaline_id, qtydelivered: rl.qtydelivered })));
      eff.ops.forEach(o => { const rl = S.rmaLines.find(y => y.m_rmaline_id === o.id); if (rl) rl.qtydelivered = o.qtydelivered; });
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,m_rma_id,c_doctype_id,c_bpartner_id,dateacct,movementdate,ad_client_id,ad_org_id,m_warehouse_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, 'Y', 'C+', status, rma.id, DT.mmr, BP, TODAY + ' 00:00:00', TODAY + ' 00:00:00', C.client, C.org, C.wh);
      lines.forEach(l => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,m_locator_id,m_rmaline_id) VALUES(?,?,?,?,?,?)').run(l.m_inoutline_id, id, l.m_product_id, l.movementqty, l.m_locator_id, l.m_rmaline_id));
      const b1 = fold('M_InOut', id, x.SCHEMA);
      if (!/^ABSENT/.test(b1)) x.applyCostQty(id);
      (S.rets = S.rets || []).push({ id, lines });
      return { outcome: 'COMPLETED', ret_status: status, ret_lines: sortJ(lines.map(l => `${l.m_product_id}:${l.movementqty}`)), books: /^ABSENT/.test(b1) ? 'REFUSED:Posted=E' : b1, cost_state: costRowS(PRODUCT),
        rma_delivered: sortJ(rma.lines.map(rl => `${rl.product}:${S.rmaLines.find(y => y.m_rmaline_id === rl.m_rmaline_id).qtydelivered}`)), ...dS(s0) };
    };
    rows = await R.run([{ id: 'SD16b-return-receipt', facts: { qty: 2 }, legacy: retLegacy, local: retLocal }], { keys: KEYS_RET, notCompared: {} }, [], { log });
    const bV = await resV('SD-16b', KEYS_RET, rows, 'COMPLETED', `books=${((rows[0] || {}).legacy || {}).books}`);

    // ================= SD16c : the AR credit memo from the RMA =================
    const KEYS_CM = ['outcome', 'inv_status', 'inv_lines', 'invoice_tax', 'grand_total', 'books', 'ispaid', 'rma_invoiced', 'stock_delta', 'cost_qty_delta', 'bp_delta'];
    const cmLegacy = async f => {
      const s0 = await snapL(), rmaId = ST.l.rmas[0], rls = ST.l['rmaLines_' + rmaId], retId = ST.l.rets && ST.l.rets[0], retLs = ST.l['retLines_' + retId] || [];
      if (!retId) return { outcome: 'ERROR', error: 'no legacy return receipt (step SD-16b failed)' };
      const lines = rls.map(l => { const rt = retLs.find(y => y.m_rmaline_id === l.m_rmaline_id); return { rl: l.m_rmaline_id, iol: rt && rt.m_inoutline_id, product: l.m_product_id, qty: Number(l.qty), price: Number(l.amt), tax: l.c_tax_id }; });
      const r = await push('cm', { rma: rmaId, date: TODAY + ' 00:00:00', lines });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 160) };
      const id = r.idmap.find(y => y.tbl === 'C_Invoice').server_id; (ST.l.cms = ST.l.cms || []).push(id);
      const h = await postedWait('QueryCInvoice', 'C_Invoice_ID', id), ls = await q('QueryCInvoiceLine', `C_Invoice_ID=${id}`), rml = (await q('QueryMRMALine', `M_RMA_ID=${rmaId}`)).map(lc);
      log(`§SD16_STEP legacy CM id=${id} status=${h.DocStatus} posted=${h.Posted} doctype=${h.C_DocType_ID} total=${h.GrandTotal} lines=${ls.map(l => l.M_Product_ID + ':' + Number(l.QtyInvoiced) + '@' + Number(l.PriceActual)).join(',')}`);
      return { outcome: 'COMPLETED', inv_status: h.DocStatus, inv_lines: sortJ(ls.map(l => `${l.M_Product_ID}:${Number(l.QtyInvoiced)}:${cents(l.PriceActual)}:${l.C_Tax_ID}`)),
        invoice_tax: sortJ((await q('QueryCInvoiceTax', `C_Invoice_ID=${id}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`)), grand_total: cents(h.GrandTotal), books: await booksL(318, id, h), ispaid: yn(h.IsPaid),
        rma_invoiced: sortJ(rml.map(l => `${l.m_product_id}:${Number(l.qtyinvoiced)}`)), ...(await dL(s0)) };
    };
    const cmLocal = async f => {
      const s0 = snapS(), rma = S.rmas[0], ret = S.rets && S.rets[0];
      if (!ret) return { outcome: 'ERROR', error: 'no sqlite return receipt (step SD-16b failed)' };
      const id = nid(), rls = rma.lines, byProd = Object.fromEntries(rls.map(rl => [rl.product, rl]));
      const taxIncluded = x.TAX_INCLUDED;
      const r = E.prepareInvoice({ c_invoice_id: id, issotrx: 'Y', c_bpartner_id: BP, dateinvoiced: TODAY },
        rls.map((rl, i) => ({ c_invoiceline_id: id * 100 + i, m_product_id: rl.product, qtyinvoiced: rl.qty - rl.qtyinvoiced })),
        { priceOf: pid => ({ pricestd: byProd[pid].amt }), taxOf: pid => ({ ok: true, c_tax_id: byProd[pid].tax }), taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded });
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const ops = r.ops.concat(E.completeInvoice({ c_invoice_id: id, issotrx: 'Y' }, r.lines, {}));
      const status = (ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'C_Invoice').pop() || {}).doc_status;
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,docstatus,c_doctype_id,m_rma_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id, BP, r.grandTotal / 100, 'Y', x.PL_CURRENCY, TODAY + ' 00:00:00', C.client, C.org, status, DT.arc, rma.id);
      r.lines.forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt,qtyinvoiced,m_inoutline_id,m_rmaline_id) VALUES(?,?,?,?,?,?,?)').run(l.c_invoiceline_id, id, l.m_product_id, l.linenetamt, l.qtyinvoiced, ret.lines[i].m_inoutline_id, rls[i].m_rmaline_id));
      r.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(id, t.c_tax_id, t.taxamt / 100));
      rls.forEach((rl, i) => { rl.qtyinvoiced += Number(r.lines[i].qtyinvoiced); });   // MInvoice.completeIt :2171-2185
      S.cms.push({ id, grandtotal: r.grandTotal, ispaid: 'N', docstatus: status });
      return { outcome: 'COMPLETED', inv_status: status, inv_lines: sortJ(r.lines.map(l => `${l.m_product_id}:${l.qtyinvoiced}:${cents(l.priceactual)}:${l.c_tax_id}`)), invoice_tax: sortJ(r.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`)),
        grand_total: r.grandTotal, books: fold('C_Invoice', id, x.SCHEMA), ispaid: 'N', rma_invoiced: sortJ(rls.map(rl => `${rl.product}:${rl.qtyinvoiced}`)), ...dS(s0) };
    };
    rows = await R.run([{ id: 'SD16c-credit-memo', facts: {}, legacy: cmLegacy, local: cmLocal }], { keys: KEYS_CM, notCompared: {} }, [], { log });
    const cV = await resV('SD-16c', KEYS_CM, rows, 'COMPLETED', `books=${((rows[0] || {}).legacy || {}).books}`);
    const cmRow = rows[0];

    // ================= SD16d : the credit memo allocated against the original invoice (open items) =================
    const net = str => { const m = {}; String(str).split(SEP).forEach(t => { const y = /^(\d+):DR(-?\d+)\/CR(-?\d+)$/.exec(t); if (y) m[y[1]] = (m[y[1]] || 0) + Number(y[2]) - Number(y[3]); }); return Object.keys(m).filter(k => m[k]).sort().map(k => `${k}:${m[k]}`).join(SEP) || 'none'; };
    const KEYS_AL = ['outcome', 'alloc_status', 'allocations', 'books_alloc_net', 'ispaid', 'bp_delta', 'stock_delta', 'cost_qty_delta'];
    const allocLegacy = async f => {
      const s0 = await snapL(), cm = ST.l.cms && ST.l.cms[0]; if (!cm) return { outcome: 'ERROR', error: 'no legacy credit memo (step SD-16c failed)' };
      const cmh = (await q('QueryCInvoice', `C_Invoice_ID=${cm}`))[0], amt = cents(cmh.GrandTotal) / 100;
      const r = await push('alloc', { date: TODAY + ' 00:00:00', lines: [{ inv: ST.l.inv, amt: amt }, { inv: cm, amt: -amt }] });
      if (!r.ok) return { outcome: 'REJECTED', reason: (r.error || '').slice(0, 160) };
      const id = r.idmap.find(y => y.tbl === 'C_AllocationHdr').server_id; ST.l.alloc = id;
      const h = await postedWait('QueryCAllocationHdr', 'C_AllocationHdr_ID', id), ls = await q('QueryCAllocationLine', `C_AllocationHdr_ID=${id}`);
      const i1 = (await q('QueryCInvoice', `C_Invoice_ID=${ST.l.inv}`))[0], i2 = (await q('QueryCInvoice', `C_Invoice_ID=${cm}`))[0];
      const rawBooks = await booksL(735, id, h), nFact = await factsCountL(735, id);
      log(`§SD16_STEP legacy ALLOC id=${id} status=${h.DocStatus} posted=${h.Posted} lines=${ls.map(l => l.C_Invoice_ID + ':' + Number(l.Amount)).join(',')} fact_rows=${nFact} books_raw=${rawBooks}`);
      if (!nFact) return { outcome: 'INCONCLUSIVE:legacy allocation has no Fact_Acct rows yet' };
      return { outcome: 'COMPLETED', alloc_status: h.DocStatus, allocations: sortJ(ls.map(l => `${cents(l.Amount)}:${l.C_Invoice_ID === ST.l.inv ? 'inv' : 'cm'}`)), books_alloc_net: net(await booksL(735, id, h)), ispaid: `inv:${yn(i1.IsPaid)}/cm:${yn(i2.IsPaid)}`, ...(await dL(s0)) };
    };
    const allocLocal = async f => {
      if (typeof E.completeAllocation !== 'function') return { outcome: 'ABSENT:completeAllocation verb' };
      const s0 = snapS(), cm = S.cms[0]; if (!cm) return { outcome: 'ERROR', error: 'no sqlite credit memo (step SD-16c failed)' };
      const sale = gb.prepare('SELECT grandtotal, dateacct FROM c_invoice WHERE c_invoice_id=?').get(S.sale.inv), amt = cm.grandtotal / 100, id = nid();
      const lines = [{ c_allocationline_id: id * 10 + 1, c_invoice_id: S.sale.inv, c_bpartner_id: BP, amount: amt }, { c_allocationline_id: id * 10 + 2, c_invoice_id: cm.id, c_bpartner_id: BP, amount: -amt }];
      const r = E.completeAllocation({ c_allocationhdr_id: id, dateacct: TODAY, c_currency_id: C.cur }, lines, [
        { c_invoice_id: S.sale.inv, issotrx: 'Y', iscreditmemo: 'N', grandtotal: sale.grandtotal, dateacct: sale.dateacct, ispaid: S.saleInvPaid || 'N', allocatedamt: 0 },
        { c_invoice_id: cm.id, issotrx: 'Y', iscreditmemo: 'Y', grandtotal: cm.grandtotal / 100, dateacct: TODAY, ispaid: cm.ispaid || 'N', allocatedamt: 0 }]);
      if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const st = (r.ops.filter(o => o.op_type === 'SET_STATUS').pop() || {}).doc_status, paid = {};
      r.ops.filter(o => o.op_type === 'UPDATE_FIELD' && o.field === 'ispaid').forEach(o => { paid[o.id] = o.value; });
      S.saleInvPaid = paid[S.sale.inv] || 'N'; cm.ispaid = paid[cm.id] || 'N';
      S.allocs = (S.allocs || []).concat([{ c_allocationhdr_id: id, isactive: 'Y', lines: lines.map(l => ({ c_invoice_id: l.c_invoice_id, amount: l.amount })) }]);
      gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(id, C.cur, TODAY + ' 00:00:00', st, C.client, C.org);
      lines.forEach(l => gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?)').run(l.c_allocationline_id, id, l.c_invoice_id, l.c_bpartner_id, l.amount, 0, 0));
      return { outcome: 'COMPLETED', alloc_status: st, allocations: sortJ(lines.map(l => `${cents(l.amount)}:${l.c_invoice_id === S.sale.inv ? 'inv' : 'cm'}`)), books_alloc_net: net(x.fmtPostings(DP.derivePostings(gb, { table: 'C_AllocationHdr', id }, x.SCHEMA).lines) || 'none'),
        ispaid: `inv:${S.saleInvPaid}/cm:${cm.ispaid}`, ...dS(s0) };
    };
    rows = await R.run([{ id: 'SD16d-allocation', facts: {}, legacy: allocLegacy, local: allocLocal }], { keys: KEYS_AL, notCompared: {} }, [], { log });
    await resV('SD-16d', KEYS_AL, rows, 'COMPLETED', `net=${((rows[0] || {}).legacy || {}).books_alloc_net}`);

    // ================= r3 : receiving MORE than the RMA qty (3 vs 2) -- measured on legacy, SQLite follows (no rule at MInOutLine) =================
    rows = await R.run([{ id: 'SD16r3-over-rma-receipt', facts: { qty: 3 }, legacy: retLegacy, local: retLocal }], { keys: KEYS_RET, notCompared: {} }, [], { log });
    { const lg = (rows[0] || {}).legacy || {}; log(`§SD16_OUTCOME r3 legacy.outcome=${lg.outcome} reason=${String(lg.reason || '').slice(0, 160)}`); await resV('SD-16r3', KEYS_RET, rows, lg.outcome === 'REJECTED' ? 'REJECTED' : 'COMPLETED', `legacy_${lg.outcome}`); }

    // ================= NEGATIVE CONTROL: the SQLite credit-memo line price +1 cent must flip the price-bearing keys against the legacy result (computed only: no document, no posting, no twin row) =================
    {
      const L0 = (cmRow && cmRow.legacy) || {}, rma = S.rmas[0], byProd = Object.fromEntries(rma.lines.map(rl => [rl.product, rl]));
      const calc = mut => E.prepareInvoice({ c_invoice_id: 1, issotrx: 'Y', c_bpartner_id: BP, dateinvoiced: TODAY }, rma.lines.map((rl, i) => ({ c_invoiceline_id: 100 + i, m_product_id: rl.product, qtyinvoiced: rl.qty })),
        { priceOf: pid => ({ pricestd: mut ? (Number(byProd[pid].amt) + mut / 100).toFixed(2) : byProd[pid].amt }), taxOf: pid => ({ ok: true, c_tax_id: byProd[pid].tax }), taxById: x.taxById, taxChildren: x.taxChildren, taxIncluded: x.TAX_INCLUDED });
      const view = r => ({ inv_lines: sortJ(r.lines.map(l => `${l.m_product_id}:${l.qtyinvoiced}:${cents(l.priceactual)}:${l.c_tax_id}`)), invoice_tax: sortJ(r.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`)), grand_total: r.grandTotal });
      const ctl = view(calc(0)), mut = view(calc(1));
      const ctlOk = ['inv_lines', 'invoice_tax', 'grand_total'].every(k => String(ctl[k]) === String(L0[k]));   // the control must equal legacy (else the flip proves nothing)
      const flipped = ['inv_lines', 'invoice_tax', 'grand_total'].filter(k => String(mut[k]) !== String(L0[k]));
      out.rtNeg = ctlOk && flipped.length > 0;
      log(`§SHOPDAY_NEG_SD16 ${out.rtNeg ? 'PASS' : 'FAIL'} control==legacy:${ctlOk}; SQLite credit-memo price +1 cent flips [${flipped.join(',')}]`);
    }
    const all = ['SD-16s', 'SD-16p-PO', 'SD-16p-RCPT', 'SD-16m', 'SD-16r1', 'SD-16a', 'SD-16r2', 'SD-16b', 'SD-16c', 'SD-16d', 'SD-16r3'].map(id => (out.steps.slice().reverse().find(s => s.id === id) || { id, verdict: 'NOT_RUN' }));
    const worst = all.some(s => s.verdict === 'BLOCKED') ? 'BLOCKED' : all.some(s => s.verdict === 'DIFF') ? 'DIFF' : all.some(s => s.verdict === 'INCONCLUSIVE' || s.verdict === 'NOT_RUN') ? 'INCONCLUSIVE' : 'MATCH';
    log(`§SHOPDAY_STEP SD-16 ${worst} parts=${all.map(s => s.id.replace('SD-16', '') + '=' + s.verdict).join(' ')}`);
    out.steps.push({ id: 'SD-16', verdict: worst });
    void bV; void cV;
  }
  return { sd16 };
};
