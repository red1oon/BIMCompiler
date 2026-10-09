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
function localRun(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: dt.docsubtypeso === 'WR' ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : { isautogenerateinout: 'N', isautogenerateinvoice: 'N' } };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty));       // P15: no price is ever passed in; keyed price f.keyedPrice is ignored by design
    if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: 118, warehouseId: 103 };
    const g = dt.docsubtypeso === 'WR' ? POS.buildSaleGroup(ctx, cart, opts)
      : POS.buildDeliverLaterGroup(ctx, cart, { ...opts, doctype: dt, invoiceRule: 'I' });
    if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    const st = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'C_Order').pop();
    const shipDone = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'M_InOut' && x.doc_status === 'CO').length;
    const stock = {}; if (shipDone) g.soLines.forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - l.qtyordered; });
    return {
      outcome: 'COMPLETED', docstatus: st && st.doc_status,
      lines: g.soLines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}`).sort().join('|'),
      total_cents: g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0) + mut,
      shipments: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'M_InOut').length, shipments_completed: shipDone,
      invoices: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'C_Invoice').length,
      stock_delta: JSON.stringify(stock),
    };
  };
}

// ================= Legacy side: push via the Bridge (composite) + read-back over read WS types =================
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
const descFor = f => ({ composite: 'SyncOrder',
  header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: { M_Warehouse_ID: { const: 103 }, C_BPartner_ID: { const: 118 }, C_BPartner_Location_ID: { const: 113 }, Bill_BPartner_ID: { const: 118 }, Bill_Location_ID: { const: 113 }, C_DocTypeTarget_ID: { const: f.doctype } } },
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
  return {
    outcome: 'COMPLETED', docstatus: h.DocStatus,
    lines: ls.map(l => `${l.M_Product_ID}:${l.QtyOrdered}:${cents(l.PriceActual)}`).sort().join('|'),
    total_cents: cents(h.TotalLines), shipments: io.length, shipments_completed: io.filter(x => x.DocStatus === 'CO').length, invoices: inv.length,
    stock_delta: JSON.stringify(stock), _order: id,
  };
}

// ================= corpus (spec §23) =================
const POSDT = 135, STDDT = 132;
const sc = (id, facts) => ({ id, facts, legacy: legacyRun, local: localRun(0) });
const corpus = [
  sc('S1-pos-sale', { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }),
  sc('S2-product-not-on-pricelist', { doctype: POSDT, lines: [{ product: 122, qty: 1 }] }),
  sc('S3-client-keyed-price', { doctype: POSDT, lines: [{ product: 123, qty: 1 }], keyedPrice: 10 }),
  sc('S4-unknown-product', { doctype: POSDT, lines: [{ product: 999999, qty: 1 }] }),
  sc('S6-standard-order', { doctype: STDDT, lines: [{ product: 123, qty: 1 }] }),
];
const spec = { keys: ['outcome', 'docstatus', 'lines', 'total_cents', 'shipments', 'shipments_completed', 'invoices', 'stock_delta'],
  notCompared: { fact_acct: 'SQLite posting fold (doc_poster.derivePostings) needs the new document rows in a local db; legacy side readable via QueryFactAcct. Next increment (S10).' } };
const quirks = [
  { scenario: 'S3-client-keyed-price', key: 'lines', evidence: 'legacy accepted client PriceActual=10 with no PriceList recompute (pilot order 80005, 2026-10-09); SQLite refuses keyed prices by design (P15, POSLens §4)' },
  { scenario: 'S3-client-keyed-price', key: 'total_cents', evidence: 'same as lines: total follows the keyed price' },
];

(async () => {
  let fails = 0, incon = 0;
  const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };

  const rows = await R.run(corpus, spec, quirks, { log });
  const by = Object.fromEntries(rows.map(r => [r.id, r]));
  for (const r of rows) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify({ ...r.legacy, _order: undefined })} sqlite=${JSON.stringify(r.sqlite)}`);

  // ---- HARNESS checks
  out('§M3_NO_ERROR', rows.every(r => r.legacy.outcome !== 'ERROR' && r.sqlite.outcome !== 'ERROR'), `errors=${rows.filter(r => r.legacy.outcome === 'ERROR' || r.sqlite.outcome === 'ERROR').map(r => r.id + ':' + (r.legacy.error || r.sqlite.error)).join(',') || 'none'}`);
  const judged = rows.filter(r => r.legacy.outcome === 'COMPLETED').length;
  out('§M3_NOT_VACUOUS', judged > 0 ? true : 'INCONCLUSIVE', `scenarios where legacy completed a document=${judged} of ${rows.length}`);
  out('§M3_QUIRK_CLASS', by['S3-client-keyed-price'].verdict === 'LEGACY-QUIRK' && by['S3-client-keyed-price'].gaps.every(g => g.evidence), `S3 verdict=${by['S3-client-keyed-price'].verdict} (registered quirk with evidence)`);
  // negative control: a SQLite side that is off by one cent MUST be reported as a gap
  const neg = await R.run([{ id: 'NEG-control', facts: { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }, legacy: legacyRun, local: localRun(1) }], spec, quirks, { log });
  out('§M3_NEGATIVE_CONTROL', neg[0].verdict === 'SQLITE-GAP' && neg[0].gaps.some(g => g.key === 'total_cents'), `+1 cent on the SQLite side ⇒ verdict=${neg[0].verdict} (must be SQLITE-GAP on total_cents)`);
  // quirk without evidence is refused
  let refused = false; try { R.classify('x', [{ key: 'k' }], [{ scenario: 'x', key: 'k' }]); } catch (e) { refused = true; }
  out('§M3_QUIRK_NEEDS_EVIDENCE', refused, 'a LEGACY-QUIRK entry with no evidence is refused');

  const gaps = rows.flatMap(r => r.gaps).filter(g => g.verdict === 'SQLITE-GAP');
  log(`§M3_FINDINGS sqlite_gaps=${gaps.length} (${[...new Set(rows.filter(r => r.verdict === 'SQLITE-GAP').map(r => r.id))].join(',') || 'none'}) — these are the parallel-run product, not harness failures`);
  log(`§M3_VERDICT HARNESS-${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon} findings=${gaps.length}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§M3_VERDICT HARNESS-FAIL exception ' + e.stack); process.exit(2); });
