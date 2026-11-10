// ⚠ DO NOT REMOVE — W-ERP-COMPLETE-PARITY (NEURO lane B, §21.5 A5; spec: NEURO_SYMBOLIC_ORDER_CONTRACT.md lane B SPEC; CLAUDE.md TWIN CARDINAL RULE). READ THE LOG after every run: §A5_* lines are the product.
// ISSUE it proves or disproves (A5, "the twin breaks"): `erp.complete` through the ONE DOOR gives the same documents and the same books as legacy iDempiere's Complete on the same input.
//   Same facts (partner, product, qty, doctype) -> (1) legacy through its WebServices (Bridge composite SyncOrder + CompleteOrder, the harness's own descriptor) and
//   (2) the SQLite twin: a draft keyed into the twin's op-log, then `erp.complete` run by the DOOR (bim-ootb common/door/door.js, actor human). Compared, per scenario: DocStatus, header and line
//   amounts, line qty ordered/reserved/delivered/invoiced, the related documents the Complete created (count + status), tax, and Fact_Acct folded per account in BOTH accounting schemas
//   for the order and every document it created. A scenario that cannot be judged says INCONCLUSIVE with the reason; the verdict is never PASS when nothing was compared.
// FOLLOW-UP 2 (2026-11-10): the same comparison for Void (VO), Close (CL) and Reverse-Correct (RC) of a Sales Order, each with its OWN pair line `§A5_PAIR table=C_Order action=<A> verdict=`. Legacy: SyncOrder + CompleteOrder, wait until the
//   generated shipment/invoice are posted, then set_docaction (pilot service type BridgeDocActionCOrder, the one shopday_more.js SD-17 uses). Twin: the door lines erp.complete then erp.void|erp.close|erp.reverse (actor human). Compared in addition:
//   DocAction, header/line descriptions (MOrder.voidIt "Voided (old)", closeIt "Close (old)"), every shipment and invoice with its status (originals and reversals) and its books, per account, in both schemas.
//   A5_ACTIONS=CO,VO,CL,RC selects the actions (default all); A5_ONLY selects a scenario. A scenario where both systems refuse is a MATCH only when the refusal is the same outcome (cardinal rule 2).
// FALSIFIER: A5_BREAK=1 changes the twin's quantity only (+1); the comparison must DIFF, else the instrument cannot fail.
// RUN: BRIDGE_OOTB=<a current bim-ootb checkout with common/door/erp_cli.js> node witness_erp_complete_parity.js  (needs the local pilot: docker postgres + ~/idempiere-pilot/start.sh, http://localhost:8088)
//   NODE_PATH=/home/red1/bim-compiler/node_modules NODE_OPTIONS=--dns-result-order=ipv4first
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), { spawn } = require('child_process');
const { cfgFromEnv, query } = require('./ad_client'); const ad = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');
const C = require('./client_ctx').ctx;
const OOTB = process.env.BRIDGE_OOTB;
const BREAK = process.env.A5_BREAK === '1';
const out = (s) => console.log(s);
const VERB = { VO: 'void', CL: 'close', RC: 'reverse' };
const cents = v => Math.round(Number(v) * 100);
const sleep = ms => new Promise(r => setTimeout(r, ms));
if (!OOTB || !fs.existsSync(path.join(OOTB, 'common/door/erp_cli.js'))) { out('§A5 INCONCLUSIVE BRIDGE_OOTB must name a bim-ootb checkout that has common/door/erp_cli.js (git -C ~/bim-ootb worktree list); nothing was compared'); out('§A5_VERDICT INCONCLUSIVE'); process.exit(2); }
const DOOR = path.join(OOTB, 'common/door/door.js'), ERP = require(path.join(OOTB, 'common/door/erp_cli.js')), DRAFT = require(path.join(OOTB, 'common/door/tests/erp_draft.js'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'a5-'));
const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
const cfg = cfgFromEnv(); cfg.login.OrgID = C.org; cfg.login.WarehouseID = C.wh;

// the door, as a person at the terminal runs it
function door(line, env) {
  return new Promise((res) => { let o = '', e = ''; const p = spawn(process.execPath, [DOOR, line], { env: Object.assign({}, process.env, { BIM_DOOR_JOURNAL: path.join(TMP, 'journal.jsonl'), BIM_OBJECT_OPLOG: path.join(TMP, 'twin.ops.jsonl') }, env || {}), stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', d => { o += d; }); p.stderr.on('data', d => { e += d; }); p.on('close', c => { let j = null; try { j = JSON.parse(o.trim()); } catch (x) { /* kept null */ } res({ code: c, env: j, out: o.trim(), err: e.trim() }); }); });
}
const fold = (rows) => { const by = {}; rows.forEach(r => { const a = by[r.acct] = by[r.acct] || { dr: 0, cr: 0 }; a.dr += cents(r.dr); a.cr += cents(r.cr); }); return Object.keys(by).sort((a, b) => a - b).map(k => k + ':' + by[k].dr + '/' + by[k].cr).join('|') || 'none'; };

// ── legacy ──
const DESC = (f) => ({ composite: 'SyncOrder',
  header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: { M_Warehouse_ID: { const: C.wh }, C_BPartner_ID: { const: f.bp }, C_BPartner_Location_ID: { const: f.loc }, Bill_BPartner_ID: { const: f.bp }, Bill_Location_ID: { const: f.loc }, C_DocTypeTarget_ID: { const: f.doctype } } },
  lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, AD_Client_ID: { const: C.client }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
  docAction: f.noComplete ? undefined : { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } });
async function legacyFacts(table, id, schema, postedType) {
  const h0 = (await query(cfg, postedType[0], `${postedType[1]}=${id}`))[0];
  const gone = h0 && ['VO', 'CL', 'RE'].includes(h0.DocStatus);   // a voided/closed order's books were deleted (MOrder.voidIt MFactAcct.deleteEx, Posted=N): nothing to wait for
  let fa = []; for (let i = 0; i < (gone ? 1 : 6) && !fa.length; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${schema}`); if (!fa.length && !gone) await sleep(1500); }
  if (fa.length) return fold(fa.map(f => ({ acct: f.Account_ID, dr: f.AmtAcctDr, cr: f.AmtAcctCr })));
  const h = (await query(cfg, postedType[0], `${postedType[1]}=${id}`))[0];
  return gone || (h && (h.Posted === 'Y' || h.Posted === true)) ? 'none' : 'NO_FACT_ACCT_ROWS';
}
async function legacyRun(f) {
  const s = await store.open(); const uid = 'a5-' + Date.now() + '-' + f.name;
  s.enqueue(uid, 'doc', { lines: [{ product: f.product, qty: f.qty }] });
  await drain(cfg, s, { doc: DESC(f) }, { log: () => {} });
  const st = s.get(uid);
  if (st.state !== 'CONFIRMED') return { rejected: true, reason: (st.error || st.state || '').slice(0, 200) };
  const id = s.idmap(uid).find(x => x.tbl === 'C_Order').server_id;
  const getDocs = async () => ({ io: (await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`)).sort((a, b) => a.M_InOut_ID - b.M_InOut_ID), inv: (await query(cfg, 'QueryCInvoice', `C_Order_ID=${id}`)).sort((a, b) => a.C_Invoice_ID - b.C_Invoice_ID) });
  if (f.action && f.action !== 'CO') {   // the shipment/invoice must be posted before the order can be voided/reversed (Doc_InOut "Original Shipment/Receipt not posted yet"): wait like a user would
    for (let i = 0; i < 8; i++) { const d0 = await getDocs(); if (d0.io.concat(d0.inv).every(d => d.DocStatus !== 'CO' || ['Y', 'E'].includes(d.Posted) || d.Posted === true)) break; await sleep(1500); }
    try { await ad.docAction(cfg, 'BridgeDocActionCOrder', 'C_Order', id, f.action); }
    catch (e) { return { rejected: true, reason: 'action ' + f.action + ': ' + String(e.message).slice(0, 200) }; }
  }
  const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0], ls = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
  const { io, inv } = await getDocs();
  for (const d of io.concat(inv)) for (let i = 0; i < 8 && !['Y', 'E'].includes(d.Posted) && d.DocStatus === 'CO'; i++) { await sleep(1500); }
  const POSTING = ['CO', 'RE'];   // the statuses that carry books (an original reversed to RE keeps its facts; its reversal document is CO)
  const books = async (sch) => ({ order: await legacyFacts(259, id, sch, ['QueryCOrder', 'C_Order_ID']),
    ship: io.filter(d => POSTING.includes(d.DocStatus)).length ? (await Promise.all(io.filter(d => POSTING.includes(d.DocStatus)).map(async d => d.DocStatus + '=' + await legacyFacts(319, d.M_InOut_ID, sch, ['QueryMInOut', 'M_InOut_ID'])))).join('+') : 'none',
    inv: inv.filter(d => POSTING.includes(d.DocStatus)).length ? (await Promise.all(inv.filter(d => POSTING.includes(d.DocStatus)).map(async d => d.DocStatus + '=' + await legacyFacts(318, d.C_Invoice_ID, sch, ['QueryCInvoice', 'C_Invoice_ID'])))).join('+') : 'none' });
  const b1 = await books(C.schema.primary), b2 = await books(C.schema.second);
  return { id, number: h.DocumentNo, v: {
    docstatus: h.DocStatus, docaction: String(h.DocAction), total_lines: cents(h.TotalLines), grand_total: cents(h.GrandTotal), order_desc: String(h.Description || ''), line_desc: ls.map(l => String(l.Description || '')).sort().join('|'),
    lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyOrdered)}:${cents(l.PriceActual)}:${cents(l.LineNetAmt)}`).sort().join('|'),
    ol_qty: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyOrdered)}/${Number(l.QtyReserved || 0)}/${Number(l.QtyDelivered || 0)}/${Number(l.QtyInvoiced || 0)}`).sort().join('|'),
    shipments: io.length + ':' + io.map(d => d.DocStatus).join(','), invoices: inv.length + ':' + inv.map(d => d.DocStatus).join(','),
    tax: (await query(cfg, 'QueryCOrderTax', `C_Order_ID=${id}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none',
    books_order_p: b1.order, books_order_s2: b2.order, books_ship_p: b1.ship, books_ship_s2: b2.ship, books_inv_p: b1.inv, books_inv_s2: b2.inv } };
}

// ── the twin, through the door ──
async function twinRun(f) {
  const d = await DRAFT.draftOrder({ oplog: path.join(TMP, 'twin.ops.jsonl') }, { bp: f.bp, loc: f.loc, product: f.product, qty: f.qty + (BREAK ? 1 : 0), doctype: f.doctype, day: today + ' 00:00:00' });
  let r = f.noComplete ? { env: { status: 'ok', actor: 'human' } } : await door('erp.complete kind=Order number=' + d.number);
  if (!r.env) return { error: 'door gave no envelope: ' + (r.err || r.out).slice(0, 300) };
  if (r.env.status !== 'ok') return { refused: true, status: r.env.status, reason: r.env.why };
  if (f.action && f.action !== 'CO') {   // the action under test, by the person at the terminal, through the same door
    r = await door('erp.' + VERB[f.action] + ' kind=Order number=' + d.number);
    if (!r.env) return { error: 'door gave no envelope: ' + (r.err || r.out).slice(0, 300) };
    if (r.env.status !== 'ok') return { refused: true, status: r.env.status, reason: r.env.why };
  }
  const O = await ERP.boot({ oplog: path.join(TMP, 'twin.ops.jsonl') }), q = (s, p) => O.rows(s, p), id = d.id;
  const h = q('SELECT * FROM c_order WHERE c_order_id=?', [id])[0], ls = q('SELECT * FROM c_orderline WHERE c_order_id=?', [id]);
  const io = q('SELECT * FROM m_inout WHERE c_order_id=?', [id]), inv = q('SELECT * FROM c_invoice WHERE c_order_id=?', [id]);
  const facts = (tid, ids, sch) => ids.length ? ids.map(i => fold(q('SELECT account_id AS acct, amtacctdr AS dr, amtacctcr AS cr FROM fact_acct WHERE ad_table_id=? AND record_id=? AND c_acctschema_id=?', [tid, i, sch]))).join('+') : 'none';
  const cos = (a, k) => a.filter(x => ['CO', 'RE'].includes(x.docstatus)).map(x => x[k]);
  const sorted = (a, k) => a.slice().sort((x, y) => x[k] - y[k]);
  const factsSt = (tid, a, k, sch) => { const p = sorted(a, k).filter(x => ['CO', 'RE'].includes(x.docstatus)); return p.length ? p.map(x => x.docstatus + '=' + fold(q('SELECT account_id AS acct, amtacctdr AS dr, amtacctcr AS cr FROM fact_acct WHERE ad_table_id=? AND record_id=? AND c_acctschema_id=?', [tid, x[k], sch]))).join('+') : 'none'; };
  return { id, number: d.number, envelope: r.env, v: {
    docstatus: h.docstatus, docaction: String(h.docaction), total_lines: cents(h.totallines), grand_total: cents(h.grandtotal), order_desc: String(h.description || ''), line_desc: ls.map(l => String(l.description || '')).sort().join('|'),
    lines: ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}:${cents(l.priceactual)}:${cents(l.linenetamt)}`).sort().join('|'),
    ol_qty: ls.map(l => `${l.m_product_id}:${Number(l.qtyordered)}/${Number(l.qtyreserved || 0)}/${Number(l.qtydelivered || 0)}/${Number(l.qtyinvoiced || 0)}`).sort().join('|'),
    shipments: io.length + ':' + sorted(io, 'm_inout_id').map(d => d.docstatus).join(','), invoices: inv.length + ':' + sorted(inv, 'c_invoice_id').map(d => d.docstatus).join(','),
    tax: q('SELECT * FROM c_ordertax WHERE c_order_id=?', [id]).map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
    books_order_p: facts(259, [id], C.schema.primary), books_order_s2: facts(259, [id], C.schema.second),
    books_ship_p: factsSt(319, io, 'm_inout_id', C.schema.primary), books_ship_s2: factsSt(319, io, 'm_inout_id', C.schema.second),
    books_inv_p: factsSt(318, inv, 'c_invoice_id', C.schema.primary), books_inv_s2: factsSt(318, inv, 'c_invoice_id', C.schema.second) } };
}


// ── Shipment (M_InOut) Complete: the next trade-cycle document (follow-up E). Legacy: a completed Standard Order, a DRAFT shipment keyed with the same facts (SyncOrder without a doc action), then
//    set_docaction CO through the pilot's Pilot_setDocAction_M_InOut. Twin: the draft order completed by the door, a draft shipment keyed into the op-log, then `erp.complete kind=<dictionary name> id=` through the door.
const SHIPDESC = (f) => ({ composite: 'SyncOrder',
  header: { serviceType: 'Pilot_createData_M_InOut', table: 'M_InOut', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: C.dt.mmShipment }, MovementType: { const: 'C-' }, IsSOTrx: { const: 'Y' }, C_Order_ID: { path: 'order' }, C_BPartner_ID: { const: f.bp }, C_BPartner_Location_ID: { const: f.loc }, M_Warehouse_ID: { const: C.wh }, MovementDate: { path: 'date' }, DateAcct: { path: 'date' } } },
  lines: { serviceType: 'Pilot_createData_M_InOutLine', table: 'M_InOutLine', parent: 'M_InOut_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, C_OrderLine_ID: { path: 'ol' }, M_Product_ID: { path: 'product' }, M_Locator_ID: { const: C.locator }, MovementQty: { path: 'qty' }, QtyEntered: { path: 'qty' } } } });
async function legacyShip(f) {
  const s = await store.open(), uid = 'a5s-' + Date.now() + '-' + f.name;
  s.enqueue(uid, 'doc', { lines: [{ product: f.product, qty: f.qty }] }); await drain(cfg, s, { doc: DESC(f), ship: SHIPDESC(f) }, { log: () => {} });
  if (s.get(uid).state !== 'CONFIRMED') return { rejected: true, reason: 'order: ' + (s.get(uid).error || s.get(uid).state || '').slice(0, 160) };
  const oid = s.idmap(uid).find(x => x.tbl === 'C_Order').server_id, ols = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${oid}`);
  const u2 = uid + '-sh'; s.enqueue(u2, 'ship', { order: oid, date: today + ' 00:00:00', lines: ols.map(l => ({ ol: l.C_OrderLine_ID, product: l.M_Product_ID, qty: Number(l.QtyOrdered) })) }); await drain(cfg, s, { doc: DESC(f), ship: SHIPDESC(f) }, { log: () => {} });
  if (s.get(u2).state !== 'CONFIRMED') return { rejected: true, reason: 'shipment: ' + (s.get(u2).error || s.get(u2).state || '').slice(0, 160) };
  const sid = s.idmap(u2).find(x => x.tbl === 'M_InOut').server_id, pre = (await query(cfg, 'QueryMInOut', `M_InOut_ID=${sid}`))[0];
  if (pre.DocStatus !== 'DR') return { rejected: true, reason: 'the shipment was not left Drafted: ' + pre.DocStatus };
  try { await ad.docAction(cfg, 'Pilot_setDocAction_M_InOut', 'M_InOut', sid, 'CO'); } catch (e) { return { rejected: true, reason: 'CO: ' + String(e.message).slice(0, 200) }; }
  let h = (await query(cfg, 'QueryMInOut', `M_InOut_ID=${sid}`))[0]; for (let i = 0; i < 8 && h.DocStatus === 'CO' && !['Y', 'E'].includes(h.Posted) && h.Posted !== true; i++) { await sleep(1500); h = (await query(cfg, 'QueryMInOut', `M_InOut_ID=${sid}`))[0]; }
  const ls = await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${sid}`), ol = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${oid}`);
  return { id: sid, number: h.DocumentNo, v: { docstatus: h.DocStatus, docaction: String(h.DocAction), processed: String(h.Processed === true ? 'Y' : h.Processed), lines: ls.map(l => `${l.M_Product_ID}:${Number(l.MovementQty)}`).sort().join('|'),
    ol_qty: ol.map(l => `${l.M_Product_ID}:${Number(l.QtyOrdered)}/${Number(l.QtyReserved || 0)}/${Number(l.QtyDelivered || 0)}/${Number(l.QtyInvoiced || 0)}`).sort().join('|'),
    books_p: await legacyFacts(319, sid, C.schema.primary, ['QueryMInOut', 'M_InOut_ID']), books_s2: await legacyFacts(319, sid, C.schema.second, ['QueryMInOut', 'M_InOut_ID']) } };
}
async function twinShip(f) {
  const d = await DRAFT.draftOrder({ oplog: path.join(TMP, 'twin.ops.jsonl') }, { bp: f.bp, loc: f.loc, product: f.product, qty: f.qty + (BREAK ? 1 : 0), doctype: f.doctype, day: today + ' 00:00:00' });
  let r = await door('erp.complete kind=Order number=' + d.number); if (!r.env || r.env.status !== 'ok') return { error: 'order complete: ' + (r.env ? r.env.why : r.err).slice(0, 200) };
  const sh = await DRAFT.draftShipment({ oplog: path.join(TMP, 'twin.ops.jsonl') }, { orderId: d.id, day: today + ' 00:00:00' });
  r = await door('erp.complete kind="Shipment/Receipt" id=' + sh.id);
  if (!r.env) return { error: 'door gave no envelope: ' + (r.err || r.out).slice(0, 300) };
  if (r.env.status !== 'ok') return { refused: true, status: r.env.status, reason: r.env.why };
  const O = await ERP.boot({ oplog: path.join(TMP, 'twin.ops.jsonl') }), q = (x, p) => O.rows(x, p);
  const h = q('SELECT * FROM m_inout WHERE m_inout_id=?', [sh.id])[0], ls = q('SELECT * FROM m_inoutline WHERE m_inout_id=?', [sh.id]), ol = q('SELECT * FROM c_orderline WHERE c_order_id=?', [d.id]);
  const fx = (sch) => fold(q('SELECT account_id AS acct, amtacctdr AS dr, amtacctcr AS cr FROM fact_acct WHERE ad_table_id=319 AND record_id=? AND c_acctschema_id=?', [sh.id, sch]));
  return { id: sh.id, number: sh.number, envelope: r.env, v: { docstatus: h.docstatus, docaction: String(h.docaction), processed: String(h.processed), lines: ls.map(l => `${l.m_product_id}:${Number(l.movementqty)}`).sort().join('|'),
    ol_qty: ol.map(l => `${l.m_product_id}:${Number(l.qtyordered)}/${Number(l.qtyreserved || 0)}/${Number(l.qtydelivered || 0)}/${Number(l.qtyinvoiced || 0)}`).sort().join('|'), books_p: fx(C.schema.primary), books_s2: fx(C.schema.second) } };
}

async function main() {
  out(`§A5 start ooTB=${OOTB} base=${cfg.base} day=${today} break=${BREAK ? 1 : 0} tmp=${TMP}`);
  try { const b = (await query(cfg, 'QueryCBPartner', `C_BPartner_ID=112`))[0]; if (!b) throw new Error('QueryCBPartner 112 returned no row'); }
  catch (e) { out(`§A5 INCONCLUSIVE legacy iDempiere is not reachable/usable at ${cfg.base}: ${String(e.message).slice(0, 200)}. Nothing was compared. To run: docker start postgres; ~/idempiere-pilot/start.sh; wait for ${cfg.base}/webui/ = 200, then sleep 10.`); out('§A5_VERDICT INCONCLUSIVE'); process.exit(2); }
  const std = { bp: C.customer, loc: C.customerLoc, doctype: C.dt.std }, pos = { bp: C.customer, loc: C.customerLoc, doctype: C.dt.pos };
  const SCN_ALL = [
    Object.assign({ name: 'SO-STD-137x2', product: C.prod.mulch, qty: 2, action: 'CO' }, std),
    Object.assign({ name: 'SO-STD-136x3', product: C.prod.fertilizer, qty: 3, action: 'CO' }, std),
    Object.assign({ name: 'SO-POS-137x1', product: C.prod.mulch, qty: 1, action: 'CO' }, pos),
    Object.assign({ name: 'SO-STD-137x2-VO', product: C.prod.mulch, qty: 2, action: 'VO' }, std),
    Object.assign({ name: 'SO-POS-137x1-VO', product: C.prod.mulch, qty: 1, action: 'VO' }, pos),
    Object.assign({ name: 'SO-DRAFT-137x2-VO', product: C.prod.mulch, qty: 2, action: 'VO', noComplete: true }, std),
    Object.assign({ name: 'SO-STD-137x2-CL', product: C.prod.mulch, qty: 2, action: 'CL' }, std),
    Object.assign({ name: 'SO-POS-137x1-CL', product: C.prod.mulch, qty: 1, action: 'CL' }, pos),
    Object.assign({ name: 'SO-STD-136x3-RC', product: C.prod.fertilizer, qty: 3, action: 'RC' }, std),
    Object.assign({ name: 'SO-POS-137x1-RC', product: C.prod.mulch, qty: 1, action: 'RC' }, pos)
  ];
  const ACTS = (process.env.A5_ACTIONS || 'CO,VO,CL,RC').split(',');
  const SCN = SCN_ALL.filter(s => ACTS.includes(s.action) && (!process.env.A5_ONLY || s.name === process.env.A5_ONLY));
  let match = 0, diff = 0, inc = 0; const res = {};
  for (const f of SCN) {
    const L = await legacyRun(f); out(`§A5_LEGACY ${f.name} ${L.rejected ? 'REJECTED ' + L.reason : 'order=' + L.number + ' id=' + L.id + ' ' + JSON.stringify(L.v)}`);
    const T = await twinRun(f); out(`§A5_TWIN ${f.name} ${T.error ? 'ERROR ' + T.error : T.refused ? 'REFUSED(' + T.status + ') ' + T.reason : 'order=' + T.number + ' id=' + T.id + ' door_status=' + T.envelope.status + ' actor=' + T.envelope.actor + ' ' + JSON.stringify(T.v)}`);
    if (L.rejected || T.error || T.refused) {
      if (L.rejected && T.refused) { out(`§A5_SCN ${f.name} MATCH both refuse (cardinal rule 2: same outcome) legacy="${L.reason}" twin="${String(T.reason).slice(0, 160)}"`); match++; res[f.name] = 'MATCH'; }
      else if (L.rejected && /AMBIGUOUS|AbortError|NOT_SENT|AUTH|ECONN|fetch failed/.test(L.reason)) { out(`§A5_SCN ${f.name} INCONCLUSIVE legacy transport failure, not a legacy verdict: ${L.reason}`); inc++; res[f.name] = 'INCONCLUSIVE'; }
      else if (L.rejected && !T.refused && !T.error) { out(`§A5_SCN ${f.name} DIFF legacy REFUSED but the twin completed`); diff++; res[f.name] = 'DIFF'; }
      else if (T.refused && !L.rejected) { out(`§A5_SCN ${f.name} DIFF legacy completed but the twin refused: ${String(T.reason).slice(0, 200)}`); diff++; res[f.name] = 'DIFF'; }
      else { out(`§A5_SCN ${f.name} INCONCLUSIVE ${T.error || 'not compared'}`); inc++; res[f.name] = 'INCONCLUSIVE'; }
      continue;
    }
    let d = 0; const keys = Object.keys(L.v);
    for (const k of keys) { const ok = L.v[k] === T.v[k]; if (!ok) d++; out(`§A5_CMP ${f.name} ${k} ${ok ? 'MATCH' : 'DIFF'} legacy=${L.v[k]} twin=${T.v[k]}`); }
    const books = keys.filter(k => /^books_/.test(k)).map(k => L.v[k]).filter(x => x !== 'none');
    out(`§A5_SCN ${f.name} ${d ? 'DIFF' : 'MATCH'} compared=${keys.length} diffs=${d} nonEmptyBooks=${books.length}${books.length ? '' : ' (this document class books nothing on either side: books compared as none==none, not as proof of posting)'}`);
    d ? diff++ : match++; res[f.name] = d ? 'DIFF' : 'MATCH';
  }
  for (const A of ACTS.filter(a => a !== 'SHIP')) {   // one pair line per action: counted in X only when EVERY scenario of that action MATCHes (and at least one was judged)
    const mine = SCN.filter(s => s.action === A), rs = mine.map(s => res[s.name]);
    const v = !mine.length ? 'INCONCLUSIVE' : rs.every(x => x === 'MATCH') ? 'MATCH' : rs.includes('DIFF') ? 'DIFF' : 'INCONCLUSIVE';
    const o = {}; mine.forEach(s => { o[s.name] = res[s.name]; });
    out(`§A5_PAIR table=C_Order action=${A} verdict=${v} scenarios=${JSON.stringify(o)}`);
  }
  if (ACTS.includes('SHIP')) {   // pair M_InOut CO
    const sc = [{ name: 'SHIP-STD-137x2', product: C.prod.mulch, qty: 2, bp: C.customer, loc: C.customerLoc, doctype: C.dt.std }, { name: 'SHIP-STD-137x1', product: C.prod.mulch, qty: 1, bp: C.customer, loc: C.customerLoc, doctype: C.dt.std }], rs = {};
    for (const f of sc) {
      const L = await legacyShip(f); out(`§A5_LEGACY ${f.name} ${L.rejected ? 'REJECTED ' + L.reason : 'ship=' + L.number + ' id=' + L.id + ' ' + JSON.stringify(L.v)}`);
      const T = await twinShip(f); out(`§A5_TWIN ${f.name} ${T.error ? 'ERROR ' + T.error : T.refused ? 'REFUSED ' + T.reason : 'ship=' + T.number + ' id=' + T.id + ' ' + JSON.stringify(T.v)}`);
      if (L.rejected || T.error || T.refused) { const tr = L.rejected && /AMBIGUOUS|AbortError|NOT_SENT|AUTH|ECONN|fetch failed/.test(L.reason); out(`§A5_SCN ${f.name} ${L.rejected && T.refused ? 'MATCH both refuse' : 'INCONCLUSIVE'} legacy=${L.reason || 'ok'} twin=${T.error || T.reason || 'ok'}${tr ? ' (transport)' : ''}`); rs[f.name] = L.rejected && T.refused ? 'MATCH' : 'INCONCLUSIVE'; if (rs[f.name] === 'MATCH') match++; else inc++; continue; }
      let d = 0; const keys = Object.keys(L.v); for (const k of keys) { const ok = L.v[k] === T.v[k]; if (!ok) d++; out(`§A5_CMP ${f.name} ${k} ${ok ? 'MATCH' : 'DIFF'} legacy=${L.v[k]} twin=${T.v[k]}`); }
      const nb = keys.filter(k => /^books_/.test(k)).map(k => L.v[k]).filter(x => x !== 'none').length; out(`§A5_SCN ${f.name} ${d ? 'DIFF' : 'MATCH'} compared=${keys.length} diffs=${d} nonEmptyBooks=${nb}`); d ? diff++ : match++; rs[f.name] = d ? 'DIFF' : 'MATCH';
    }
    const v = Object.values(rs).every(x => x === 'MATCH') ? 'MATCH' : Object.values(rs).includes('DIFF') ? 'DIFF' : 'INCONCLUSIVE'; out(`§A5_PAIR table=M_InOut action=CO verdict=${v} scenarios=${JSON.stringify(rs)}`);
  }
  const verdict = !SCN.length || (match + diff === 0) ? 'INCONCLUSIVE' : diff ? 'FAIL' : inc ? 'PASS-with-INCONCLUSIVE' : 'PASS';
  out(`§A5_VERDICT ${verdict} judged=${match + diff} match=${match} diff=${diff} inconclusive=${inc}${BREAK ? ' (A5_BREAK=1 falsifier: a DIFF is the expected result)' : ''}`);
  process.exit(verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2);
}
main().catch(e => { out('§A5 ERROR ' + (e && e.stack || e)); out('§A5_VERDICT INCONCLUSIVE harness error'); process.exit(2); });
