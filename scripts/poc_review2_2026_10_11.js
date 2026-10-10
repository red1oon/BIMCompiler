#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope: W-REVIEW2, the ten findings of the SECOND independent review of the SQLite-parity engine/POS port (PR #1971). Read the log after every run
// (build/erp/logs_review2/*.log); exit code alone is not evidence. Spec: prompts/SQLiteIDEMPIERE.md §REVIEW2-2026-10-11.
// Implementing prompts/SQLiteIDEMPIERE.md §REVIEW2-2026-10-11 — Witness: W-REVIEW2.
//
// Each finding section names the ISSUE it proves/disproves, prints `§REVIEW2 R<n> ...` lines and a `judged=N` count. A section that judged nothing prints INCONCLUSIVE (never PASS).
// Exit: 0 all PASS · 1 any FAIL · 2 any INCONCLUSIVE (and no FAIL).
// Run on the compiler side:  node scripts/poc_review2_2026_10_11.js
// Run on the bim-ootb port:   REVIEW_FIX_ENGINE_DIR=/tmp/wt-ootb-erp-port/erp node scripts/poc_review2_2026_10_11.js
// R4a is a verdict-only control (finding not substantiated: refusing on missing tax inputs IS the legacy behaviour); R4b/R5/R6/R7 etc. are the substantiated parts.
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), Module = require('module');
var ROOT = path.join(__dirname, '..');
var ENG_DIR = process.env.REVIEW_FIX_ENGINE_DIR || null;
var OOTB = ENG_DIR || process.env.REVIEW2_OOTB || '/tmp/wt-ootb-erp-port/erp';   // model_order.js lives only in the bim-ootb port
function mod(name, where) { return ENG_DIR ? path.join(ENG_DIR, name + '.js') : path.join(ROOT, where, name + '.js'); }
if (ENG_DIR) {
  var _load = Module._load;
  Module._load = function (req, parent, isMain) { if (req === '../../scripts/erp_engine') req = path.join(ENG_DIR, 'erp_engine.js'); return _load.call(this, req, parent, isMain); };
}
var Database = require(path.join(ROOT, 'node_modules', 'better-sqlite3'));
var E = require(mod('erp_engine', 'scripts'));
var POS = require(mod('pos_core', 'build/erp'));
var DP = require(mod('doc_poster', 'scripts'));
var R = require(mod('post_resolver', 'scripts'));
var LENS = require(mod('pos_lens', 'build/erp'));
var SCRATCH = process.env.REVIEW_FIX_SCRATCH || fs.mkdtempSync(path.join(os.tmpdir(), 'rev2-'));
var J = JSON.stringify;

var results = {}, cur = null;
function section(n, issue) { cur = results['R' + n] = { judged: 0, fails: 0, issue: issue }; console.log('\n— R' + n + ' ' + issue); }
function assert(ok, label, detail) { cur.judged++; if (!ok) cur.fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail !== undefined ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }
function lcDb(db) { return { raw: db, prepare: function (sql) { var st = db.prepare(sql); return { get: function () { return lc(st.get.apply(st, arguments)); }, all: function () { return st.all.apply(st, arguments).map(lc); }, run: function () { return st.run.apply(st, arguments); } }; }, exec: function (s) { return db.exec(s); } }; }
function cpDb(src, name) { var f = path.join(SCRATCH, name); fs.copyFileSync(src, f); return new Database(f); }
function cols(db, t) { return db.prepare('PRAGMA table_info(' + t + ')').all().map(function (c) { return c.name; }); }
function ins(db, t, o) { var cs = cols(db, t).filter(function (c) { return o[c] !== undefined; }); db.prepare('INSERT INTO ' + t + '(' + cs.join(',') + ') VALUES(' + cs.map(function () { return '?'; }).join(',') + ')').run(cs.map(function (c) { return o[c]; })); }
console.log('═══ W-REVIEW2 — ten second-review findings (engine=' + (ENG_DIR || 'bim-compiler scripts/+build/erp') + ') ═══');

var GB = path.join(ROOT, 'build', 'erp', 'glassbowl_data.db');
var SEED = path.join(ROOT, 'build', 'erp', 'ad_seed_fullwidth.db');
function glassbowl(name) {   // scratch copy of the shipped posting db + the patch the host loader applies
  var gb = cpDb(GB, name);
  try { require(path.join(ROOT, 'scripts', 'bridge', 'dict_diff')).applyPatch(gb, fs.readFileSync(path.join(ROOT, 'build', 'erp', 'patches', 'glassbowl_data.db.sql'), 'utf8')); } catch (e) { console.log('   (patch skipped: ' + e.message + ')'); }
  try { gb.exec('ALTER TABLE m_cost ADD COLUMN currentqty NUMERIC'); } catch (e) { /* present */ }
  return gb;
}

// ═════════════════════════════════════════════ R1 ═════════════════════════════════════════════
section(1, 'balanceAccounting / _allocBalanceAccounting must use the R handed to derivePostings (browser host: window.PostResolver, no require) — not a private _R()');
(function () {
  var gb = cpDb(GB, 'r1.db');
  gb.exec("ALTER TABLE c_acctschema_gl ADD COLUMN usecurrencybalancing TEXT; UPDATE c_acctschema_gl SET usecurrencybalancing='Y' WHERE c_acctschema_id=200000;" +
    "CREATE TABLE c_currency(c_currency_id INT, stdprecision INT, costingprecision INT); INSERT INTO c_currency VALUES(100,2,4),(102,2,4);");   // scratch fixture: currency precision + currency balancing ON
  var vc = gb.prepare('SELECT currencybalancing_acct a FROM c_acctschema_gl WHERE c_acctschema_id=200000').get().a;
  var calls = [];
  var spy = Object.create(R); spy.elementOf = function (d, id) { calls.push(Number(id)); return R.elementOf(d, id); };
  var base = DP.derivePostings(gb, { table: 'C_Invoice', id: 103 }, 200000, R);
  var withSpy = DP.derivePostings(gb, { table: 'C_Invoice', id: 103 }, 200000, spy);
  var balLine = base.lines.filter(function (l) { return l.account_id === 724; })[0];
  console.log('§REVIEW2 R1 fx invoice 103 @schema 200000 lines=' + base.lines.length + ' balancing-line(724)=' + J(balLine && [balLine.amtacctdr, balLine.amtacctcr]) + ' spy.elementOf calls=' + J(calls) + ' (CurrencyBalancing_Acct vc=' + vc + ')');
  assert(!!balLine, 'fixture: the FX invoice needs a CurrencyBalancing line (otherwise the finding is not exercised)', 'lines=' + base.lines.length);
  assert(calls.indexOf(Number(vc)) >= 0, 'balanceAccounting resolved the balancing account through the INJECTED R (browser has no require)', 'calls=' + J(calls));
  assert(J(base.lines) === J(withSpy.lines), 'output identical with a delegating spy R (no behaviour change under node)', 'same=' + (J(base.lines) === J(withSpy.lines)));
  // an injected R that resolves differently must win — proves R is not read from a private require
  var alt = Object.create(R); alt.elementOf = function (d, id) { return Number(id) === Number(vc) ? { id: 724, value: 'SPY', name: 'SPY-INJECTED', accounttype: 'E' } : R.elementOf(d, id); };
  var viaAlt = DP.derivePostings(gb, { table: 'C_Invoice', id: 103 }, 200000, alt).lines.filter(function (l) { return l.account_id === 724; })[0];
  assert(viaAlt && (viaAlt.name === 'SPY-INJECTED' || viaAlt.value === 'SPY'), 'a different injected R decides the balancing account', J(viaAlt && [viaAlt.value, viaAlt.name]));
})();

// ═════════════════════════════════════════════ R2 ═════════════════════════════════════════════
section(2, 'reverseInOut / voidOrder: MOVE_STOCK must carry a RESOLVED locator (MInOutLine.getM_Locator_ID of the original line), never undefined');
(function () {
  var P = 7, LOC = 9001, HLOC = 9002, RES = 9003;
  function ship(lineLoc, hdrLoc) { var l = { m_inoutline_id: 20001, m_product_id: P, movementqty: 3, c_orderline_id: 10001 }; if (lineLoc != null) l.m_locator_id = lineLoc; var s = { m_inout_id: 2000, docstatus: 'CO', movementtype: 'C-', issotrx: 'Y', lines: [l] }; if (hdrLoc != null) s.m_locator_id = hdrLoc; return s; }
  function void_(s, extra) { var n = 100; return E.voidOrder({ order: { c_order_id: 1000 }, lines: [], shipments: [s], invoices: [] }, Object.assign({ voidedMsg: 'Voided', newId: function () { return ++n; } }, extra || {})); }
  var realistic = void_(ship(null, null));   // the sale.shipments[].lines shape voidOrder documents / witness_m3_gap builds: no locator on the rows
  var moves = realistic.filter(function (o) { return o.op_type === 'MOVE_STOCK'; });
  console.log('§REVIEW2 R2 realistic shipment (no locator on rows): MOVE_STOCK ops=' + moves.length + ' locators=' + J(moves.map(function (m) { return m.m_locator_id === undefined ? 'undefined' : m.m_locator_id; })) + ' unresolved=' + J(realistic.unresolved));
  assert(moves.every(function (m) { return m.m_locator_id !== undefined && m.m_locator_id !== null; }), 'no MOVE_STOCK is emitted with an undefined/null locator', J(moves.map(function (m) { return String(m.m_locator_id); })));
  assert(Array.isArray(realistic.unresolved) && realistic.unresolved.length === 1 && realistic.unresolved[0].m_inoutline_id === 20001, 'the line whose locator cannot be resolved is REPORTED (ops.unresolved), not silently dropped', J(realistic.unresolved));
  var viaHost = void_(ship(null, null), { locatorOf: function (l, io) { return l.m_inoutline_id === 20001 && io.m_inout_id === 2000 ? RES : null; } }).filter(function (o) { return o.op_type === 'MOVE_STOCK'; });
  assert(viaHost.length === 1 && viaHost[0].m_locator_id === RES && viaHost[0].qty === 3, 'host locatorOf(line, shipment) resolves the locator from the original row; reversal puts the 3 back (+3)', J(viaHost));
  var hdr = void_(ship(null, HLOC)).filter(function (o) { return o.op_type === 'MOVE_STOCK'; });
  assert(hdr.length === 1 && hdr[0].m_locator_id === HLOC, 'shipment-level m_locator_id is used when the row has none', J(hdr));
  var ln = void_(ship(LOC, HLOC), { locatorOf: function () { return RES; } }).filter(function (o) { return o.op_type === 'MOVE_STOCK'; });
  assert(ln.length === 1 && ln[0].m_locator_id === LOC, 'the original LINE locator wins over header / host resolver (MInOutLine.getM_Locator_ID)', J(ln));
  var direct = E.reverseInOut(Object.assign(ship(null, null), { c_order_id: 1000 }), { newId: function () { return 500; } });
  assert(direct.ok === true && Array.isArray(direct.unresolved) && direct.unresolved.length === 1, 'reverseInOut itself returns the unresolved list', J(direct.unresolved));
})();

// ═════════════════════════════════════════════ R3 ═════════════════════════════════════════════
// Doc_InOut.loadLines :139 DocLine.setQty(qty, isSOTrx=MatShipment) -> shipment qty negated; MatReceipt keeps +; createShipment (cost detail) only in the shipment branch (:198-300)
// and the sales-RETURN receipt branch (:452-640); the PURCHASE receipt branch (:676) creates no cost detail (qty arrives with MatchPO/MatchInv).
section(3, 'costQtyUpdates must follow the document type sign (Doc_InOut): C- shipment -qty, C+ sales return +qty, V- vendor return -qty, V+ vendor receipt NO cost detail');
(function () {
  function run(mt, issotrx, qty) {
    var gb = glassbowl('r3_' + mt.replace(/[^A-Z]/gi, 'x') + '.db'), P = 126;
    var avgEls = gb.prepare("SELECT m_costelement_id e FROM m_costelement WHERE costelementtype='M' AND costingmethod IN ('A','I')").all();
    if (!avgEls.length) return null;
    gb.prepare('DELETE FROM m_cost WHERE m_product_id=?').run(P);
    gb.prepare('SELECT c_acctschema_id s, m_costtype_id ct FROM c_acctschema').all().forEach(function (sc) { avgEls.forEach(function (e) {
      ins(gb, 'm_cost', { m_product_id: P, c_acctschema_id: sc.s, m_costtype_id: sc.ct, m_costelement_id: e.e, currentcostprice: 2, cumulatedamt: 0, cumulatedqty: 0, currentqty: 10 }); }); });
    ins(gb, 'm_inout', { m_inout_id: 991, ad_client_id: 11, ad_org_id: 11, issotrx: issotrx, movementtype: mt, docstatus: 'CO', dateacct: '2026-10-11', c_bpartner_id: 112 });
    ins(gb, 'm_inoutline', { m_inoutline_id: 9911, m_inout_id: 991, m_product_id: P, movementqty: qty, ad_client_id: 11, ad_org_id: 11 });
    var u = DP.costQtyUpdates(gb, 991);
    return { n: u.length, deltas: u.map(function (x) { return x.delta; }).filter(function (v, i, a) { return a.indexOf(v) === i; }) };
  }
  var cases = [['C-', 'Y', 4, [-4], 'customer shipment: stock leaves, delta -4'], ['C+', 'Y', 4, [4], 'customer return (MMR + IsSOTrx): stock comes back, delta +4'],
    ['V-', 'N', 4, [-4], 'vendor return (MMS, !IsSOTrx): delta -4'], ['V+', 'N', 4, [], 'vendor receipt (MMR purchase): Doc_InOut makes no cost detail -> NO update (the qty follows MatchPO/MatchInv)']];
  cases.forEach(function (c) {
    var r = run(c[0], c[1], c[2]);
    if (!r) { cur.judged += 0; console.log('   ⚪ fixture: no Average costing element in the posting db'); return; }
    console.log('§REVIEW2 R3 ' + c[0] + ' qty=' + c[2] + ' -> updates=' + r.n + ' deltas=' + J(r.deltas));
    assert(J(r.deltas) === J(c[3]), c[4], 'deltas=' + J(r.deltas));
  });
})();

// ═════════════════════════════════════════════ R4 ═════════════════════════════════════════════
section(4, 'POS line tax: (a) missing inputs refuse tax-not-found = legacy (MOrderLine.setTax :346-359 false -> save refused) [not-substantiated control]; (b) billDate is the ORDER date (setTax uses getDateOrdered)');
(function () {
  // (a) a db without any tax tables: the lens lookup yields {ok:false}; buildSaleGroup refuses, exactly as legacy setTax()==false refuses the save
  var empty = lcDb(new Database(':memory:'));
  var tf = LENS._glue.lensTaxOf(empty, { ad_client_id: 11, ad_org_id: 11, m_warehouse_id: 103 }, 112, E);
  var t0 = tf(7);
  var fake = { pos: { c_pos_id: 1, m_warehouse_id: 103, c_doctype_id: 135, m_pricelist_id: 101, ad_client_id: 11, ad_org_id: 11 }, priceOf: function () { return { pricestd: '10' }; }, bomOf: function () { return []; },
    wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }, taxOf: tf, taxById: function () { return null; }, taxChildren: function () { return []; }, taxIncluded: false, docsubtypeso: 'WR' };
  var g = POS.buildSaleGroup(fake, [POS.ringLine(fake, 7, 1)], { orderId: 1, inoutId: 2, invoiceId: 3, c_bpartner_id: 112 });
  console.log('§REVIEW2 R4a lens tax on a db without tax inputs -> ' + J(t0) + ' ; buildSaleGroup ok=' + g.ok + ' reason=' + g.reason);
  assert(t0 && t0.ok === false && g.ok === false && g.reason === 'tax-not-found', 'R4a (control, NOT a defect): no tax inputs => refused tax-not-found (legacy setTax false => PO.save false); behaviour unchanged by this review', 'reason=' + g.reason);
  // (b) billDate: two tax rows identical except ValidFrom (2000 / 2999). Date today -> 2000 row; the order date 2999-06-01 -> the 2999 row (Tax.get gets getDateOrdered())
  var db = cpDb(SEED, 'r4.db'), b3 = lcDb(db);
  var pos = lc(b3.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var key = lc(b3.prepare('SELECT m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 1').get(pos.c_poskeylayout_id));
  var lt = LENS._glue.lensTaxOf(b3, pos, 112, E);
  var now = lt(key.m_product_id);
  if (!now || !now.ok) { console.log('   ⚪ INCONCLUSIVE fixture: the seed has no resolvable tax for the POS product (' + J(now) + ')'); return; }
  var src = db.prepare('SELECT * FROM c_tax WHERE c_tax_id=?').get(now.c_tax_id), NEWID = 990001;
  var dup = {}; Object.keys(src).forEach(function (k) { var l = k.toLowerCase(); dup[k] = l === 'c_tax_id' ? NEWID : (l === 'validfrom' ? '2999-01-01 00:00:00' : (l === 'c_tax_uu' ? 'r4-dup' : src[k])); });   // same selection keys, ValidFrom in the future
  db.prepare('INSERT INTO c_tax(' + Object.keys(dup).join(',') + ') VALUES(' + Object.keys(dup).map(function () { return '?'; }).join(',') + ')').run(Object.keys(dup).map(function (k) { return dup[k]; }));
  var lt2 = LENS._glue.lensTaxOf(b3, pos, 112, E);
  var today = lt2(key.m_product_id), future = lt2(key.m_product_id, '2999-06-01');
  console.log('§REVIEW2 R4b taxOf(today)=' + today.c_tax_id + ' taxOf(order date 2999-06-01)=' + future.c_tax_id + ' (future-dated row ' + NEWID + ')');
  assert(today.ok && today.c_tax_id === now.c_tax_id, 'taxOf(product) without a date keeps today (unchanged)', 'c_tax_id=' + today.c_tax_id);
  assert(future.ok && future.c_tax_id === NEWID, 'taxOf(product, orderDate) looks up at the ORDER date (MOrderLine.setTax getDateOrdered)', 'c_tax_id=' + future.c_tax_id);
  var ctx = { pos: pos, priceOf: function () { return { pricestd: '10' }; }, bomOf: function () { return []; }, wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }, taxOf: lt2,
    taxById: function (id) { return lc(db.prepare('SELECT * FROM c_tax WHERE c_tax_id=?').get(id)); }, taxChildren: function () { return []; }, taxIncluded: false, docsubtypeso: 'WR' };
  var g2 = POS.buildSaleGroup(ctx, [POS.ringLine(ctx, key.m_product_id, 1)], { orderId: 8001, inoutId: 8002, invoiceId: 8003, c_bpartner_id: 112, dateAcct: '2999-06-01' });
  var cl = (g2.ops || []).filter(function (o) { return o.op_type === 'CREATE_LINE' && o.table === 'C_OrderLine'; })[0];
  assert(g2.ok && cl && cl.c_tax_id === NEWID, 'buildSaleGroup with opts.dateAcct stamps the line tax valid on that order date', 'ok=' + g2.ok + ' reason=' + g2.reason + ' c_tax_id=' + (cl && cl.c_tax_id));
})();

// ═════════════════════════════════════════════ R5 ═════════════════════════════════════════════
section(5, 'MOrderLine.beforeSave pricing: an exception inside beforeSave means save()==false in legacy (PO.save catch) -> return an error string, not throw; restore EVERYTHING bind() rebinds');
(function () {
  var A, MO;
  try { A = require(path.join(OOTB, 'ad_callout.js')); MO = require(path.join(OOTB, 'model_order.js')); } catch (e) { console.log('   ⚪ INCONCLUSIVE: cannot load the bim-ootb model layer (' + e.message + ')'); return; }
  if (!MO || typeof MO.MOrderLine_beforeSavePricing !== 'function') { console.log('   ⚪ INCONCLUSIVE: MOrderLine_beforeSavePricing not exported'); return; }
  var RT = A.RUNTIME, Env = A.Env;
  var sDB = { marker: 'db' }, sPO = { marker: 'po' }, sNow = function () { return 111; }, sEnvNow = function () { return 222; };
  RT.DB = sDB; RT.PO = sPO; RT.now = sNow; Env.now = sEnvNow;
  var trx = { q: function () { return []; }, say: function () {}, env: { client: 11, org: 11, role: 0 }, get: function () { return null; } };
  var row = { m_product_id: 7, priceactual: 0, pricelist: 0, qtyentered: 1, qtyordered: 1, c_order_id: 5 };
  var out, thrown = null;
  try { out = MO.MOrderLine_beforeSavePricing(trx, row, { m_pricelist_id: 0, issotrx: 'Y' }); } catch (e) { thrown = e; }
  console.log('§REVIEW2 R5 priceless order: returned=' + J(out) + ' threw=' + (thrown && thrown.message));
  assert(thrown === null, 'beforeSave pricing does not THROW out of the hook (legacy PO.save catches it and returns false)', thrown ? 'threw ' + thrown.message : 'no throw');
  assert(typeof out === 'string' && /PriceList unknown/.test(out), 'it returns the refusal as the error string the model layer turns into {ok:false,error}', J(out));
  assert(RT.DB === sDB && RT.PO === sPO, 'RT.DB and RT.PO restored', 'db=' + (RT.DB === sDB) + ' po=' + (RT.PO === sPO));
  assert(RT.now === sNow && Env.now === sEnvNow, 'RT.now and Env.now restored too (bind() also writes Env.now)', 'rt.now=' + (RT.now === sNow) + ' env.now=' + (Env.now === sEnvNow));
})();

// ═════════════════════════════════════════════ R6 ═════════════════════════════════════════════
section(6, 'costUpdatesForMatchPO: ONE result shape {updates, absent}; a looping caller must never meet a bogus {absent} row');
(function () {
  var gb = glassbowl('r6.db');
  var P = 126, CT = gb.prepare('SELECT m_costtype_id c FROM c_acctschema WHERE c_acctschema_id=101').get().c;
  gb.exec("CREATE TABLE IF NOT EXISTS m_matchpo(m_matchpo_id INT, m_inoutline_id INT, c_orderline_id INT, m_product_id INT, qty NUMERIC);");
  var elA = gb.prepare("SELECT m_costelement_id e FROM m_costelement WHERE costingmethod='A' ORDER BY m_costelement_id LIMIT 1").get();
  if (!elA) { console.log('   ⚪ INCONCLUSIVE fixture: no Average PO cost element'); return; }
  var ol = gb.prepare('SELECT c_orderline_id id FROM c_orderline LIMIT 1').get(), il = gb.prepare('SELECT m_inoutline_id id FROM m_inoutline LIMIT 1').get();
  if (!ol || !il) { console.log('   ⚪ INCONCLUSIVE fixture: no order/receipt line to match'); return; }
  gb.prepare('INSERT INTO m_matchpo(m_matchpo_id,m_inoutline_id,c_orderline_id,m_product_id,qty) VALUES(7001,?,?,?,5)').run(il.id, ol.id, P);
  var unknown = DP.costUpdatesForMatchPO(gb, 424242);                  // no such matchpo
  var r = DP.costUpdatesForMatchPO(gb, 7001);
  console.log('§REVIEW2 R6 unknown matchpo -> ' + J(unknown) + ' ; fixture matchpo -> ' + J(r).slice(0, 220));
  assert(unknown && !Array.isArray(unknown) && Array.isArray(unknown.updates) && Array.isArray(unknown.absent) && unknown.updates.length === 0, 'no matchpo -> {updates:[], absent:[]}', J(unknown));
  assert(r && !Array.isArray(r) && Array.isArray(r.updates) && Array.isArray(r.absent), 'a computed matchpo returns the same {updates, absent} shape', J(r).slice(0, 160));
  var all = [].concat(Array.isArray(r) ? r : (r.updates || []));
  assert(all.every(function (u) { return u && u.absent === undefined && u.m_product_id !== undefined; }), 'every element of the update list is a real update record (no {absent} pseudo-row inside)', J(all).slice(0, 160));
  // second fixture: untaxed order line -> the weighted-average update is computed (positive path), same shape
  gb.prepare('UPDATE c_orderline SET c_tax_id=NULL WHERE c_orderline_id=?').run(ol.id);
  var r2 = DP.costUpdatesForMatchPO(gb, 7001), all2 = [].concat(Array.isArray(r2) ? r2 : (r2.updates || []));
  console.log('§REVIEW2 R6 untaxed fixture -> ' + J(r2).slice(0, 260));
  assert(r2 && !Array.isArray(r2) && Array.isArray(r2.updates) && Array.isArray(r2.absent), 'positive path returns {updates, absent}', J(r2).slice(0, 120));
  assert(all2.every(function (u) { return u && u.absent === undefined && u.m_product_id !== undefined; }), 'no {absent} pseudo-row among the updates on the positive path either', J(all2).slice(0, 120));
  if (r.absent && r.absent.length) console.log('   ℹ absent reasons: ' + J(r.absent));
})();

// ═════════════════════════════════════════════ R7 ═════════════════════════════════════════════
section(7, 'costQtyUpdates: _postedFacts / currentCost depend on (schema) / (product,schema) only — read once, not per line x schema x element; OUTPUT IDENTICAL');
(function () {
  var gb = glassbowl('r7.db'), SCH = 101, P = 126;
  var avgEls = gb.prepare("SELECT m_costelement_id e FROM m_costelement WHERE costelementtype='M' AND costingmethod IN ('A','I')").all().map(function (r) { return r.e; });
  var allSch = gb.prepare('SELECT c_acctschema_id s, m_costtype_id ct FROM c_acctschema').all();
  if (!avgEls.length) { console.log('   ⚪ INCONCLUSIVE fixture: no Average costing element'); return; }
  gb.prepare('DELETE FROM m_cost WHERE m_product_id=?').run(P);
  allSch.forEach(function (sc) { avgEls.forEach(function (e) { ins(gb, 'm_cost', { m_product_id: P, c_acctschema_id: sc.s, m_costtype_id: sc.ct, m_costelement_id: e, currentcostprice: 2, cumulatedamt: 0, cumulatedqty: 0, currentqty: 10 }); }); });
  var O = 992001, RV = 992002;
  ins(gb, 'm_inout', { m_inout_id: O, ad_client_id: 11, ad_org_id: 11, issotrx: 'Y', movementtype: 'C-', docstatus: 'CO', dateacct: '2026-10-11', c_bpartner_id: 112 });
  ins(gb, 'm_inoutline', { m_inoutline_id: 9920011, m_inout_id: O, m_product_id: P, movementqty: 4, ad_client_id: 11, ad_org_id: 11 });
  ins(gb, 'm_inoutline', { m_inoutline_id: 9920012, m_inout_id: O, m_product_id: P, movementqty: 6, ad_client_id: 11, ad_org_id: 11 });
  var orig = DP.derivePostings(gb, { table: 'M_InOut', id: O }, SCH, R);
  orig.lines.forEach(function (l, i) { ins(gb, 'fact_acct', { fact_acct_id: 99100 + i, ad_client_id: 11, ad_org_id: 11, c_acctschema_id: SCH, account_id: l.account_id, ad_table_id: 319, record_id: O, line_id: i % 2 ? 9920012 : 9920011, amtacctdr: l.amtacctdr, amtacctcr: l.amtacctcr, amtsourcedr: l.amtacctdr, amtsourcecr: l.amtacctcr, postingtype: 'A' }); });
  ins(gb, 'm_inout', { m_inout_id: RV, ad_client_id: 11, ad_org_id: 11, issotrx: 'Y', movementtype: 'C-', docstatus: 'CO', dateacct: '2026-10-11', c_bpartner_id: 112, reversal_id: O });
  ins(gb, 'm_inoutline', { m_inoutline_id: 9920021, m_inout_id: RV, m_product_id: P, movementqty: -4, reversalline_id: 9920011, ad_client_id: 11, ad_org_id: 11 });
  ins(gb, 'm_inoutline', { m_inoutline_id: 9920022, m_inout_id: RV, m_product_id: P, movementqty: -6, reversalline_id: 9920012, ad_client_id: 11, ad_org_id: 11 });
  var counts = { fact: 0, cost: 0 }, rawPrepare = gb.prepare.bind(gb);
  var spy = { prepare: function (sql) { if (/FROM fact_acct/.test(sql)) counts.fact++; if (/SELECT currentcostprice FROM m_cost/.test(sql)) counts.cost++; return rawPrepare(sql); } };
  var upsOrig = DP.costQtyUpdates(spy, O), c1 = { fact: counts.fact, cost: counts.cost };
  counts.fact = 0; counts.cost = 0;
  var upsRev = DP.costQtyUpdates(spy, RV);
  var nSch = allSch.length, nEl = gb.prepare("SELECT COUNT(*) n FROM m_costelement WHERE costelementtype='M' AND costingmethod IS NOT NULL AND costingmethod<>''").get().n;
  console.log('§REVIEW2 R7 schemas=' + nSch + ' elements=' + nEl + ' lines=2 | original: fact_acct reads=' + c1.fact + ' currentCost reads=' + c1.cost + ' | reversal: fact_acct reads=' + counts.fact + ' currentCost reads=' + counts.cost);
  console.log('§REVIEW2 R7 OUTPUT-GOLDEN original=' + J(upsOrig) + ' reversal=' + J(upsRev));
  var GOLD_ORIG = '[{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":102,"delta":-4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":103,"delta":-4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":100,"delta":-4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":104,"delta":-4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":102,"delta":-4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":103,"delta":-4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":100,"delta":-4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":104,"delta":-4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":102,"delta":-6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":103,"delta":-6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":100,"delta":-6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":104,"delta":-6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":102,"delta":-6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":103,"delta":-6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":100,"delta":-6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":104,"delta":-6}]';
  assert(upsOrig.length === 2 * nSch * nEl && upsRev.length === 2 * nSch * nEl, 'fixture: every line x schema x element yields an update', 'orig=' + upsOrig.length + ' rev=' + upsRev.length);
  assert(J(upsOrig) === GOLD_ORIG, 'original-shipment output IDENTICAL to the pre-change golden', 'got=' + J(upsOrig).slice(0, 120));
  assert(counts.fact <= nSch, 'reversal: posted facts read at most once per schema (was per line x schema x element)', 'fact_acct reads=' + counts.fact + ' (limit ' + nSch + ')');
  assert(counts.cost <= nSch, 'reversal: currentCost read at most once per (product, schema) (one product here) instead of per line x schema x element', 'reads=' + counts.cost + ' (limit ' + nSch + ')');
  var GOLD_REV = '[{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":102,"delta":4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":103,"delta":4,"currentcostprice":2.85714286},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":100,"delta":4},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":104,"delta":4,"currentcostprice":2.85714286},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":102,"delta":4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":103,"delta":4,"currentcostprice":2},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":100,"delta":4},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":104,"delta":4,"currentcostprice":2},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":102,"delta":6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":103,"delta":6,"currentcostprice":2.6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":100,"delta":6},{"m_product_id":126,"c_acctschema_id":101,"m_costtype_id":100,"m_costelement_id":104,"delta":6,"currentcostprice":2.6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":102,"delta":6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":103,"delta":6,"currentcostprice":2},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":100,"delta":6},{"m_product_id":126,"c_acctschema_id":200000,"m_costtype_id":100,"m_costelement_id":104,"delta":6,"currentcostprice":2}]';
  assert(J(upsRev) === GOLD_REV, 'reversal output IDENTICAL to the pre-change golden', 'got=' + J(upsRev).slice(0, 120));
})();

// ═════════════════════════════════════════════ R8 ═════════════════════════════════════════════
section(8, 'posGlue.creditOf must read the sysconfig like MSysConfig.getValue (client/org scoping, IsActive, ORDER BY client DESC, org DESC) — not "WHERE name=?"');
(function () {
  var db = cpDb(SEED, 'r8.db'), b3 = lcDb(db);
  var pos = lc(b3.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var plv = lc(b3.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
  var hasT = db.prepare("SELECT 1 x FROM sqlite_master WHERE name='ad_sysconfig'").get();
  if (!hasT) db.exec('CREATE TABLE ad_sysconfig(ad_sysconfig_id INT, ad_client_id INT, ad_org_id INT, name TEXT, value TEXT, isactive TEXT)');   // scratch: the mirrored legacy table (state-synced columns)
  var cs = cols(db, 'ad_sysconfig'), K1 = 'CHECK_CREDIT_ON_CASH_POS_ORDER', K2 = 'CHECK_CREDIT_ON_PREPAY_ORDER';
  db.prepare('DELETE FROM ad_sysconfig WHERE name IN (?,?)').run(K1, K2);
  var id = 980000;
  function row(name, value, client, org, active) { var o = { ad_sysconfig_id: id++, name: name, value: value, ad_client_id: client, ad_org_id: org, isactive: active }; var c = cs.filter(function (k) { return o[k] !== undefined; }); db.prepare('INSERT INTO ad_sysconfig(' + c.join(',') + ') VALUES(' + c.map(function () { return '?'; }).join(',') + ')').run(c.map(function (k) { return o[k]; })); }
  // K1: an INACTIVE own-client row says Y (inserted first), the system default (client 0) says N  -> MSysConfig answers N
  row(K1, 'Y', pos.ad_client_id, 0, 'N'); row(K1, 'N', 0, 0, 'Y');
  // K2: only ANOTHER client's row exists (N) -> not visible to this client -> legacy default (true)
  row(K2, 'N', 4242, 0, 'Y');
  var glue = LENS._glue.posGlue(b3, pos, plv), c = glue.creditOf(112), sys = c.sys || {};
  console.log('§REVIEW2 R8 creditOf.sys=' + J(sys) + ' (expect ' + K1 + '=N via client-0 row ignoring the inactive client row; ' + K2 + ' not N: another client\'s row is invisible)');
  assert(String(sys[K1]) === 'N', K1 + ': inactive client row ignored, client-0 row N wins', 'got ' + sys[K1]);
  assert(sys[K2] === undefined || String(sys[K2]) !== 'N', K2 + ': a row of ANOTHER client is not visible (legacy default true)', 'got ' + sys[K2]);
  // precedence: an ACTIVE own-client row beats the system row
  row(K1, 'Y', pos.ad_client_id, 0, 'Y');
  var sys2 = LENS._glue.posGlue(b3, pos, plv).creditOf(112).sys || {};
  assert(String(sys2[K1]) === 'Y', K1 + ': active own-client row (client DESC) beats the system row', 'got ' + sys2[K1]);
})();

// ═════════════════════════════════════════════ R9 ═════════════════════════════════════════════
section(9, 'cleanup: dead neg() in voidOrder, active-schemas SELECT pasted 5x, duplicated MSysConfig comment in pos_core (source-level checks)');
(function () {
  var eng = fs.readFileSync(mod('erp_engine', 'scripts'), 'utf8'), dp = fs.readFileSync(mod('doc_poster', 'scripts'), 'utf8'), pc = fs.readFileSync(mod('pos_core', 'build/erp'), 'utf8');
  var vo = eng.slice(eng.indexOf('function voidOrder('), eng.indexOf('function completeMovement') > 0 ? eng.indexOf('function completeMovement') : eng.length);
  var neg = (vo.match(/function neg\(/g) || []).length, negUse = (vo.match(/[^_A-Za-z]neg\(/g) || []).length - neg;
  console.log('§REVIEW2 R9 voidOrder local neg(): defined=' + neg + ' used=' + negUse);
  assert(neg === 0, 'voidOrder carries no local neg() (it was dead: _neg is the shared helper)', 'defined=' + neg + ' used=' + negUse);
  var sel = (dp.match(/SELECT c_acctschema_id AS id, m_costtype_id AS ct(, c_currency_id AS cur)? FROM c_acctschema'/g) || []).length;
  console.log('§REVIEW2 R9 doc_poster active-schemas SELECT pasted ' + sel + 'x');
  assert(sel === 0, 'the active-schemas SELECT lives in ONE helper (no pasted copies)', 'copies=' + sel);
  var cm = (pc.match(/§45 \(F11\): line tax \+ C_OrderTax rows \+ GrandTotal/g) || []).length;
  console.log('§REVIEW2 R9 pos_core duplicated §45 comment block: ' + cm + 'x');
  assert(cm === 1, 'the §45 F11 comment block appears once', 'copies=' + cm);
})();

// ═════════════════════════════════════════════ R10 ═════════════════════════════════════════════
section(10, 'UPDATE_FIELD delta ops carry COLUMN units (decimal), never minor units: completeBankStatement == completeProjectIssue convention');
(function () {
  var bs = E.completeBankStatement({ c_bankstatement_id: 1, c_bankaccount_id: 100, dateacct: '2026-10-11' }, [{ c_bankstatementline_id: 11, line: 10, dateacct: '2026-10-11', stmtamt: '123.45', trxamt: '123.45' }], {});
  var pi = E.completeProjectIssue({ c_projectissue_id: 2, c_project_id: 9, m_product_id: 7, m_locator_id: 1, movementqty: 3 }, { productOf: function () { return { isstocked: 'N' }; }, cost: '45.6789' });
  var bop = bs.ok && bs.ops.filter(function (o) { return o.table === 'C_BankAccount' && o.field === 'currentbalance'; })[0];
  var pop = pi.ok && pi.ops.filter(function (o) { return o.table === 'C_Project' && o.field === 'projectbalanceamt'; })[0];
  console.log('§REVIEW2 R10 bank delta=' + J(bop && bop.delta) + ' (statement 123.45) · project delta=' + J(pop && pop.delta) + ' (cost 45.6789) · stmt.statementDifference=' + (bs.ok && bs.statementDifference));
  if (!bop || !pop) { console.log('   ⚪ fixture did not produce the ops'); return; }
  assert(Number(bop.delta) === 123.45, 'bank-account balance delta is 123.45 (column units), not 12345 cents', 'delta=' + J(bop.delta));
  assert(typeof bop.delta === typeof pop.delta, 'money deltas share one representation (decimal string) across the two verbs', typeof bop.delta + ' vs ' + typeof pop.delta);
  assert(Number(pop.delta) === 45.6789, 'project-issue delta unchanged (decimal)', 'delta=' + J(pop.delta));
  assert(bs.statementDifference === 12345 && bs.endingBalance === 12345, 'the verb\'s documented minor-unit RESULT fields (statementDifference/endingBalance) are untouched', 'diff=' + bs.statementDifference);
})();

// ───────────────────────────────────────── verdict ─────────────────────────────────────────
var bad = 0, inc = 0;
Object.keys(results).forEach(function (k) {
  var s = results[k], v = s.judged === 0 ? 'INCONCLUSIVE' : (s.fails ? 'FAIL' : 'PASS');
  if (v === 'FAIL') bad++; if (v === 'INCONCLUSIVE') inc++;
  console.log('§REVIEW2 ' + k + ' judged=' + s.judged + ' fails=' + s.fails + ' ' + v + ' — ' + s.issue);
});
console.log((bad ? '🔴 W-REVIEW2 FAIL (' + bad + ' finding(s) still present)' : (inc ? '🟡 W-REVIEW2 INCONCLUSIVE (' + inc + ')' : '🟢 W-REVIEW2 PASS — all judged findings proven fixed / controls hold')) + '  engine=' + (ENG_DIR || 'compiler'));
process.exit(bad ? 1 : (inc ? 2 : 0));
