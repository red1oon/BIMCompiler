#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// poc_post_tail.js — W-POST-TAIL (prompts/HARDEN_MATRIX.md §W-POST-TAIL): the LAST 6 Doc_* posters
// after B-3, worked by SEED REALITY (facts verified live 2026-07-18):
//   · C_BankStatement (392): REAL oracle IN the seed — 13 fact rows for statement 100. derivePostings'
//     bank-statement manifest == fact_acct(392) per document × schema × (account, side), INTEGER CENTS,
//     maxDiff=0c — incl. the schema-200000 conversion + the 0.01 CurrencyBalancing residual.
//   · M_MatchPO (473): the REAL engine posted the EMPTY SET for all 37 docs (posted='Y', 0 fact rows) —
//     the PPV block is gated on StandardCosting (Doc_MatchPO.java:429), this seed costs at 'A'. The
//     ∅==∅ diff runs over the REAL 37-doc population; §FALSIFIER flips costingmethod → the gate OPENS.
//   · M_Requisition (702): 1 posted doc, 0 facts — Doc_Requisition gates on isCreateReservation
//     (MAcctSchema.java:662-669, commitmenttype 'B'/'A'; seed='N'). ∅==∅ + gate-flip → lines appear.
//   · C_Cash / M_Inventory / M_Production: NOT claimed here — named next-session (§TAIL-SKIPS): Cash
//     needs the existing CO docs POSTED on a scratch clone (B-3 generator reuse), Inventory needs its
//     3 drafts completed there, Production has 0 docs + no component costs (W-FOLD-PRODUCTION deferral).
// NON-INVENT: oracle = build/erp/glassbowl_data.db (real client-11 rows, extract_fact_acct.sh); the
// gate flips happen on a THROWAWAY in-memory copy, never the oracle. READ THE LOG; exit ≠ evidence.
// Run: bash build/erp/run_witness.sh scripts/poc_post_tail.js  → build/erp/poc_post_tail.log
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var DP = require('./doc_poster');

var ORACLE = path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db');
var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function cents(x) { return Math.round(Number(x || 0) * 100); }

console.log('═══ W-POST-TAIL — the last Doc_* posters vs the REAL seed oracle (HARDEN_MATRIX §W-POST-TAIL) ═══\n');

var db = new Database(ORACLE, { readonly: true });
var SCHEMAS = db.prepare('SELECT c_acctschema_id s FROM c_acctschema ORDER BY 1').all().map(function (r) { return r.s; });

// ── 1. C_BankStatement — the real 13-row oracle, per doc × schema × (account, side) ────────────────
console.log('── C_BankStatement (392) — REAL fact oracle, maxDiff=0c gate ──');
var stmts = db.prepare("SELECT c_bankstatement_id id FROM c_bankstatement WHERE docstatus='CO' ORDER BY 1").all();
var bsMax = 0, bsCells = 0, bsOracleRows = db.prepare('SELECT count(*) c FROM fact_acct WHERE ad_table_id=392').get().c;
stmts.forEach(function (s) {
  SCHEMAS.forEach(function (schema) {
    var want = {};
    db.prepare('SELECT * FROM fact_acct WHERE ad_table_id=392 AND record_id=? AND c_acctschema_id=?').all(s.id, schema)
      .forEach(function (f) {
        var k = String(f.account_id);
        if (!want[k]) want[k] = { dr: 0, cr: 0 };
        want[k].dr += cents(f.amtacctdr); want[k].cr += cents(f.amtacctcr);
      });
    var got = {};
    var r = DP.derivePostings(db, { table: 'C_BankStatement', id: s.id }, schema);
    r.lines.forEach(function (l) {
      var k = String(l.account_id);
      if (!got[k]) got[k] = { dr: 0, cr: 0 };
      got[k].dr += cents(l.amtacctdr); got[k].cr += cents(l.amtacctcr);
    });
    Object.keys(want).concat(Object.keys(got)).forEach(function (k) {
      var w = want[k] || { dr: 0, cr: 0 }, o = got[k] || { dr: 0, cr: 0 };
      var dd = Math.max(Math.abs(w.dr - o.dr), Math.abs(w.cr - o.cr));
      if (dd > bsMax) bsMax = dd;
      if (dd !== 0) console.log('   🔴 diff stmt=' + s.id + ' schema=' + schema + ' account=' + k +
        ' oracle=' + w.dr + '/' + w.cr + 'c engine=' + o.dr + '/' + o.cr + 'c');
    });
    bsCells++;
  });
});
console.log('§TAIL-POST class=C_BankStatement docs=' + stmts.length + ' cells=' + bsCells +
  ' oracle_rows=' + bsOracleRows + ' maxDiff=' + bsMax + 'c oracle=real-fact_acct(392)');
verdict(bsMax === 0 && bsOracleRows > 0, 'C_BankStatement derivePostings == the REAL posted journal (maxDiff=0c, ' + bsOracleRows + ' oracle rows)');

// ── 2. M_MatchPO — the engine-posted EMPTY set, over the REAL 37-doc population ────────────────────
console.log('\n── M_MatchPO (473) — config-gated ∅ over the REAL posted population ──');
var mpos = db.prepare("SELECT m_matchpo_id id FROM m_matchpo WHERE posted='Y' ORDER BY 1").all();
var mpoFacts = db.prepare('SELECT count(*) c FROM fact_acct WHERE ad_table_id=473').get().c;
var mpoNonEmpty = 0;
mpos.forEach(function (m) {
  SCHEMAS.forEach(function (schema) {
    var r = DP.derivePostings(db, { table: 'M_MatchPO', id: m.id }, schema);
    if (r.lines.length !== 0) mpoNonEmpty++;
  });
});
console.log('§TAIL-POST class=M_MatchPO docs=' + mpos.length + ' oracle_rows=' + mpoFacts +
  ' engine_nonempty=' + mpoNonEmpty + ' maxDiff=0c basis=∅-by-config (Doc_MatchPO.java:429, costingmethod=A)');
verdict(mpos.length === 37 && mpoFacts === 0 && mpoNonEmpty === 0,
  'M_MatchPO: engine ∅ == the REAL engine\'s ∅ across all 37 posted docs (StandardCosting gate closed under Average)');

// ── 3. M_Requisition — same shape, the W-MORDER-POST twin ──────────────────────────────────────────
console.log('\n── M_Requisition (702) — config-gated ∅ (isCreateReservation, seed commitmenttype=N) ──');
var reqs = db.prepare("SELECT m_requisition_id id FROM m_requisition WHERE docstatus='CO' ORDER BY 1").all();
var reqFacts = db.prepare('SELECT count(*) c FROM fact_acct WHERE ad_table_id=702').get().c;
var reqNonEmpty = 0;
reqs.forEach(function (q) {
  SCHEMAS.forEach(function (schema) {
    var r = DP.derivePostings(db, { table: 'M_Requisition', id: q.id }, schema);
    if (r.lines.length !== 0) reqNonEmpty++;
  });
});
console.log('§TAIL-POST class=M_Requisition docs=' + reqs.length + ' oracle_rows=' + reqFacts +
  ' engine_nonempty=' + reqNonEmpty + ' maxDiff=0c basis=∅-by-config (MAcctSchema.java:662-669, commitmenttype=N)');
verdict(reqs.length === 1 && reqFacts === 0 && reqNonEmpty === 0,
  'M_Requisition: engine ∅ == the REAL engine\'s ∅ (reservation gate closed)');

// ── 4. C_Cash (407) / M_Inventory (321) — REAL scratch-clone run (generate_post_tail_oracle.sh):
//    both classes' real documents hit ENGINE-ENFORCED data-state blockers, distinct from B-3's seed
//    generation and from MatchPO/Requisition's CONFIG gates. NON-INVENT: neither blocker is worked
//    around (flipping IsActive or seeding lines onto an existing doc would be mutating someone else's
//    document, out of the seed-prep ruling's scope — same boundary the card itself draws for Inventory).
console.log('\n── C_Cash (407) / M_Inventory (321) — REAL engine run, both ∅-by-data-state ──');
var fs = require('fs');
var TAIL_FIXTURE = path.join(__dirname, '..', 'build', 'erp', 'oracle', 'post_tail_fixture.json');
if (!fs.existsSync(TAIL_FIXTURE)) {
  console.log('§TAIL-SKIP tail fixture absent (' + TAIL_FIXTURE + ') — run: bash scripts/generate_post_tail_oracle.sh');
  fails++;
} else {
  var tfx = JSON.parse(fs.readFileSync(TAIL_FIXTURE, 'utf8'));
  var tdb = new Database(':memory:');
  Object.keys(tfx.tables).forEach(function (t) {
    var spec = tfx.tables[t];
    tdb.prepare('CREATE TABLE ' + t + ' (' + spec.cols.join(',') + ')').run();
    var ins = tdb.prepare('INSERT INTO ' + t + ' VALUES (' + spec.cols.map(function () { return '?'; }).join(',') + ')');
    spec.rows.forEach(function (r) { ins.run(r.map(function (v) { return /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v; })); });
  });

  // §TAIL-POST2 re-assert: the REAL engine (scratch-clone, generate_post_tail_oracle.sh) wrote ZERO
  // fact_acct rows for either class — read from the captured oracle, not assumed.
  var cashOracleRows = tdb.prepare('SELECT count(*) c FROM fact_acct WHERE ad_table_id=407').get().c;
  var invOracleRows = tdb.prepare('SELECT count(*) c FROM fact_acct WHERE ad_table_id=321').get().c;

  // C_Cash: both real docs are IsActive='N' (re-read from the captured oracle, not the Java log alone)
  var cashRows = tdb.prepare('SELECT c_cash_id, isactive FROM c_cash ORDER BY c_cash_id').all();
  var cashInactive = cashRows.filter(function (r) { return r.isactive === 'N'; });
  console.log('§TAIL-POST2 C_Cash docs=' + cashRows.length + ' isactive_N=' + cashInactive.length +
    ' oracle_rows=' + cashOracleRows + ' basis=∅-by-data-state (Doc.java:591-605 CannotPostInactiveDocument)');
  verdict(cashRows.length === 2 && cashInactive.length === 2 && cashOracleRows === 0,
    'C_Cash: both real CO docs are IsActive=N → the REAL engine\'s lock-UPDATE never fires, ∅ oracle confirmed',
    'docs=' + cashRows.map(function (r) { return r.c_cash_id; }).join(','));
  // falsifier: the manifest itself is LIVE — it computes REAL non-empty legs from the real line data,
  // proving the ∅ is the IsActive gate (outside createFacts), not a dead/no-op verb or a manifest bug.
  var cashLive0 = DP.derivePostings(tdb, { table: 'C_Cash', id: 100 }, 101);
  var cashLive1 = DP.derivePostings(tdb, { table: 'C_Cash', id: 101 }, 101);
  var cashLiveOk = cashLive0.lines.length > 0 && cashLive1.lines.length > 0;
  verdict(cashLiveOk, '§FALSIFIER C_Cash manifest is LIVE (non-empty legs from the real line data) — the ∅ is IsActive-gate-derived, not dead',
    'doc100 lines=' + cashLive0.lines.length + ' doc101 lines=' + cashLive1.lines.length);
  console.log('§TAIL-FALSIFIER cash-live doc100_lines=' + cashLive0.lines.length + ' doc101_lines=' + cashLive1.lines.length + ' (must be >0)');

  // M_Inventory: 2/3 never even complete (@NoLines@); the 1 completable doc (100) hits the REAL
  // engine's own "No Costs" refusal (Doc_Inventory.java:319-336) — product 147 has zero cost data.
  var invNoLines = tdb.prepare('SELECT m_inventory_id FROM m_inventory WHERE m_inventory_id IN (200000,200001)').all();
  var inv100Lines = tdb.prepare('SELECT count(*) c FROM m_inventoryline WHERE m_inventory_id=100').get().c;
  var costRow = tdb.prepare("SELECT currentcostprice FROM m_cost WHERE m_product_id=147 AND currentcostprice<>0").all();
  var blessRows = tdb.prepare("SELECT count(*) c FROM m_costdetail WHERE m_product_id=147 AND processed='Y' AND amt=0.00 AND qty>0 AND (c_orderline_id>0 OR c_invoiceline_id>0)").get().c;
  console.log('§TAIL-POST2 M_Inventory noLines_docs=' + invNoLines.length + ' doc100_lines=' + inv100Lines +
    ' nonzero_cost_rows=' + costRow.length + ' zero_cost_blessing_rows=' + blessRows +
    ' oracle_rows=' + invOracleRows + ' basis=∅-by-data-state (MInventory.java:401-406 @NoLines@ + Doc_Inventory.java:319-336 No-Costs)');
  verdict(invNoLines.length === 2 && inv100Lines === 1 && costRow.length === 0 && blessRows === 0 && invOracleRows === 0,
    'M_Inventory: 2 docs cannot even complete (@NoLines@), the 1 completable doc has zero cost data anywhere → ∅ oracle confirmed',
    'noLines=' + invNoLines.map(function (r) { return r.m_inventory_id; }).join(','));
  // falsifier: the manifest matches the SAME "No Costs" refusal (0==0, not vacuous — flip the blessing
  // count in an in-memory copy and the gate opens, a real DR/CR pair appears).
  var invReal = DP.derivePostings(tdb, { table: 'M_Inventory', id: 100 }, 101);
  var invRealOk = invReal.lines.length === 0 && invReal.absent.some(function (a) { return String(a).indexOf('NoCosts') >= 0; });
  verdict(invRealOk, 'M_Inventory doc 100: manifest ALSO refuses (0 lines, {Product.NoCosts} named absent) — matches the real engine\'s refusal exactly',
    'lines=' + invReal.lines.length + ' absent=[' + invReal.absent.join(',') + ']');
  tdb.prepare("INSERT INTO m_costdetail (m_costdetail_id,m_product_id,processed,amt,qty,c_orderline_id,c_invoiceline_id) VALUES (999,147,'Y',0.00,1,500,0)").run();
  var invFlip = DP.derivePostings(tdb, { table: 'M_Inventory', id: 100 }, 101);
  var invFlipOk = invFlip.lines.length > 0 || invFlip.absent.some(function (a) { return String(a).indexOf('NoCosts') < 0; });
  verdict(invFlipOk, '§FALSIFIER M_Inventory blessing-flip: adding a qualifying zero-cost M_CostDetail row opens the gate (0 → a real DR/CR pair at cost=0)',
    'lines=' + invFlip.lines.length + ' absent=[' + invFlip.absent.join(',') + ']');
  console.log('§TAIL-FALSIFIER inv-bless-flip doc=100 before_lines=' + invReal.lines.length + ' after_lines=' + invFlip.lines.length + ' (must open)');
}

// ── 5. §FALSIFIERS (load-bearing) on a THROWAWAY copy ──────────────────────────────────────────────
console.log('\n── §FALSIFIERS (in-memory copy; the oracle db stays read-only) ──');
var mem = new Database(':memory:');
['c_acctschema', 'c_acctschema_gl', 'c_bankstatement', 'c_bankstatementline', 'c_bankaccount_acct',
 'c_charge_acct', 'c_validcombination', 'c_elementvalue', 'c_conversion_rate', 'c_conversiontype',
 'm_matchpo', 'm_requisition', 'm_requisitionline', 'm_product', 'm_product_category_acct', 'm_cost',
 'm_costelement', 'c_orderline'].forEach(function (t) {
  var rows = db.prepare('SELECT * FROM ' + t).all();
  if (!rows.length) { mem.prepare('CREATE TABLE ' + t + ' (dummy)').run(); return; }
  var cols = Object.keys(rows[0]);
  mem.prepare('CREATE TABLE ' + t + ' (' + cols.join(',') + ')').run();
  var ins = mem.prepare('INSERT INTO ' + t + ' VALUES (' + cols.map(function () { return '?'; }).join(',') + ')');
  rows.forEach(function (r) { ins.run(cols.map(function (c) { return r[c]; })); });
});

// (a) requisition gate-flip: commitmenttype N→B → the manifest OPENS (lines / named-absent offset)
mem.prepare("UPDATE c_acctschema SET commitmenttype='B' WHERE c_acctschema_id=101").run();
var reqFlip = DP.derivePostings(mem, { table: 'M_Requisition', id: reqs[0].id }, 101);
mem.prepare("UPDATE c_acctschema SET commitmenttype='N' WHERE c_acctschema_id=101").run();
var okA = reqFlip.lines.length > 0 || reqFlip.absent.length > 0;
verdict(okA, '§FALSIFIER requisition gate-flip N→B: manifest OPENS (zero is CONFIG-derived, not hardcoded)',
  'lines=' + reqFlip.lines.length + ' absent=[' + reqFlip.absent.join(',') + ']');
console.log('§TAIL-FALSIFIER req-flip commitmenttype N→B lines=' + reqFlip.lines.length + ' absent=' + reqFlip.absent.length);

// (b) matchpo gate-flip: costingmethod A→S opens the PPV path. On the unmodified copy the first
//     matched doc's PPV computes to exactly 0 (price == standard cost — a REAL zero, observed), so the
//     flip ALSO halves the standard cost: a price≠cost variance MUST now surface (lines or the named
//     PPVOffset absence) — proving the :429 gate and the PPV arithmetic are both live.
var mpoDoc = mem.prepare('SELECT m_matchpo_id id, m_product_id p FROM m_matchpo WHERE m_inoutline_id>0 AND m_product_id>0 AND qty>0 ORDER BY 1 LIMIT 1').get();
mem.prepare("UPDATE c_acctschema SET costingmethod='S' WHERE c_acctschema_id=101").run();
mem.prepare("UPDATE m_cost SET currentcostprice=currentcostprice/2 WHERE m_product_id=? AND c_acctschema_id=101" +
  " AND m_costelement_id IN (SELECT m_costelement_id FROM m_costelement WHERE costingmethod='S')").run(mpoDoc.p);
var mpoFlip = DP.derivePostings(mem, { table: 'M_MatchPO', id: mpoDoc.id }, 101);
mem.prepare("UPDATE c_acctschema SET costingmethod='A' WHERE c_acctschema_id=101").run();
var okB = mpoFlip.lines.length > 0 || mpoFlip.absent.length > 0;
verdict(okB, '§FALSIFIER matchpo gate-flip A→S (+cost≠price): the PPV path opens (Doc_MatchPO.java:429 gate is live)',
  'doc=' + mpoDoc.id + ' lines=' + mpoFlip.lines.length + ' absent=[' + mpoFlip.absent.join(',') + ']');
console.log('§TAIL-FALSIFIER mpo-flip costingmethod A→S doc=' + mpoDoc.id + ' lines=' + mpoFlip.lines.length + ' absent=' + mpoFlip.absent.length);

// (c) scale ONE bank-statement line → maxDiff≠0 vs the real oracle (the diff is load-bearing)
mem.prepare('UPDATE c_bankstatementline SET stmtamt=stmtamt*2 WHERE c_bankstatementline_id=100').run();
var scaled = DP.derivePostings(mem, { table: 'C_BankStatement', id: 100 }, 101);
var wantDr = 0;
db.prepare('SELECT * FROM fact_acct WHERE ad_table_id=392 AND record_id=100 AND c_acctschema_id=101').all()
  .forEach(function (f) { wantDr += cents(f.amtacctdr); });
var gotDr = 0; scaled.lines.forEach(function (l) { gotDr += cents(l.amtacctdr); });
verdict(gotDr !== wantDr, '§FALSIFIER scale-one-line: doubling stmtamt breaks the bank-statement diff (metric load-bearing)',
  'oracle ΣDR=' + wantDr + 'c scaled ΣDR=' + gotDr + 'c');
console.log('§TAIL-FALSIFIER bs-scale line=100 oracleΣDR=' + wantDr + 'c scaledΣDR=' + gotDr + 'c (must differ)');
mem.close();

// ── 6. named ⛔ (the honest remainder, all empirically driven on a scratch clone — nothing assumed) ──
console.log('\n§TAIL-SKIPS C_Cash (407): drove the REAL engine on scratch idempiere_tail (generate_post_tail_oracle.sh)');
console.log('§TAIL-SKIPS   over the 2 real CO docs — BOTH are IsActive=N, DocManager.postDocument refuses');
console.log('§TAIL-SKIPS   ("CannotPostInactiveDocument", Doc.java:591-605) → ⛔ BY THE ENGINE\'S OWN ERROR.');
console.log('§TAIL-SKIPS   NOT worked around: flipping IsActive on an existing document is out of the');
console.log('§TAIL-SKIPS   seed-prep ruling\'s scope (same boundary as the Inventory @NoLines@ docs below).');
console.log('§TAIL-SKIPS M_Inventory (321): drove processIt(CO) on all 3 real drafts on the same scratch —');
console.log('§TAIL-SKIPS   200000/200001 have ZERO lines each, MInventory.prepareIt refuses BEFORE completion');
console.log('§TAIL-SKIPS   (@NoLines@, MInventory.java:401-406); doc 100 (1 line, product 147) DOES complete');
console.log('§TAIL-SKIPS   but the REAL engine then REFUSES to post it ("No Costs for TShirt - Red Large",');
console.log('§TAIL-SKIPS   Doc_Inventory.java:319-336 — product 147 has currentcostprice=0 everywhere and');
console.log('§TAIL-SKIPS   zero M_CostDetail rows, so the zero-cost-blessing check fails) → ⛔, 0/3 posted.');
console.log('§TAIL-SKIPS M_Production (325): 0 docs + component m_cost absent (W-FOLD-PRODUCTION deferral) → ⛔');
console.log('§TAIL-SKIPS   until a costed BOM seed exists; costs are NOT synthesized.');
console.log('§TAIL-SKIPS Matrix ledger stays 52 oracle-equivalent / 17-of-20 posters — Cash+Inventory join');
console.log('§TAIL-SKIPS   Production as named ⛔, each for a DIFFERENT, precisely-cited engine-level reason.');

db.close();
console.log('\n' + (fails === 0 ? '🟢 W-POST-TAIL PASS' : '🔴 W-POST-TAIL FAIL (' + fails + ')') +
  ' — BankStatement folds the REAL journal to the cent; MatchPO(37)+Requisition ∅==∅ config-derived;' +
  ' Cash+Inventory ∅==∅ data-state-derived (REAL scratch-clone run); 3 named ⛔ (Cash/Inventory/Production).');
process.exit(fails === 0 ? 0 : 1);
