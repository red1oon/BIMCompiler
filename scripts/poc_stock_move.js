#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// W-STOCK-MOVE — prompts/ERP_STOCK_EFFECT.md §E4.4. Prove a completed M_InOut MOVES STOCK: the Complete
//   fan-out emits one signed M_Transaction per stockable line, and folding those onto the real
//   m_storageonhand baseline changes on-hand by exactly the shipped/received qty. Closes AGENT_QUEUE E-4
//   ("grep -rln m_storageonhand erp/*.js -> 0 hits ... a real signed shipment still cannot move stock").
//   Drives the REAL build/erp/erp_engine.js. Fixtures are REAL rows from build/erp/glassbowl_data.db —
//   receipt M_InOut 105 (MMR, issotrx=N) and shipment M_InOut 100 (MMS, issotrx=Y). Nothing invented.
//   The seed's OWN m_inout.movementtype column is the oracle for arm 1 — not a value this witness wrote.
//   READ build/erp/poc_stock_move.log before any conclusion; exit code is NOT evidence.
// Run: bash build/erp/run_witness.sh scripts/poc_stock_move.js
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var E = require(path.join(__dirname, '..', 'build', 'erp', 'erp_engine.js'));
var GB = path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db');

var fails = 0, checks = 0;
function verdict(ok, label, detail) { checks++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function lc(r) { var o = {}; Object.keys(r || {}).forEach(function (k) { o[k.toLowerCase()] = r[k]; }); return o; }

(function () {
  var gb = new Database(GB, { readonly: true });
  var q = function (s, p) { return gb.prepare(s).all(p || []).map(lc); };

  console.log('═══ W-STOCK-MOVE — a completed M_InOut moves stock (E-4) over the REAL erp_engine ═══');

  // ── ARM 1 · MOVEMENT TYPE IS THE AD TABLE, checked against the seed's OWN movementtype column ──
  console.log('\n── ARM 1 · movementTypeOf == MInOut.getMovementType (oracle = the seed\'s own column) ──');
  var docs = q("SELECT h.m_inout_id, h.issotrx, h.movementtype, h.c_doctype_id, h.movementdate, h.ad_org_id, d.docbasetype " +
               "FROM m_inout h JOIN c_doctype d ON d.c_doctype_id=h.c_doctype_id WHERE h.movementtype IS NOT NULL ORDER BY h.m_inout_id");
  var wrong = docs.filter(function (d) { return E.movementTypeOf(d.docbasetype, d.issotrx) !== d.movementtype; });
  var byType = {};
  docs.forEach(function (d) { byType[d.docbasetype + '/' + d.issotrx + '→' + d.movementtype] = (byType[d.docbasetype + '/' + d.issotrx + '→' + d.movementtype] || 0) + 1; });
  console.log('§STOCK-MOVETYPE docsJudged=' + docs.length + ' combos=' + JSON.stringify(byType) + ' mismatches=' + wrong.length +
              (wrong.length ? ' ' + JSON.stringify(wrong.slice(0, 4).map(function (d) { return d.m_inout_id + ':' + d.docbasetype + '/' + d.issotrx + ' derived=' + E.movementTypeOf(d.docbasetype, d.issotrx) + ' seed=' + d.movementtype; })) : ''));
  verdict(docs.length > 0, 'NOT VACUOUS — the seed carries documents with a stored movementtype to judge against', 'docs=' + docs.length);
  verdict(docs.length > 0 && wrong.length === 0, 'every derived movement type equals the seed\'s own stored movementtype', 'mismatches=' + wrong.length);
  verdict(E.movementTypeOf('XXX', 'Y') === null && E.movementTypeOf(null, 'N') === null,
          'an unknown DocBaseType yields NULL, never a defaulted polarity', 'XXX→' + E.movementTypeOf('XXX', 'Y'));

  // ── the two real documents under test ──
  function loadDoc(id) {
    var h = q('SELECT h.*, d.docbasetype FROM m_inout h JOIN c_doctype d ON d.c_doctype_id=h.c_doctype_id WHERE h.m_inout_id=?', [id])[0];
    var l = q('SELECT * FROM m_inoutline WHERE m_inout_id=? ORDER BY line', [id]);
    return { hdr: h, lines: l };
  }
  var RCPT = loadDoc(105), SHIP = loadDoc(100);
  console.log('§STOCK-FIXTURE receipt=105 docbasetype=' + RCPT.hdr.docbasetype + ' issotrx=' + RCPT.hdr.issotrx + ' lines=' + RCPT.lines.length +
              ' | shipment=100 docbasetype=' + SHIP.hdr.docbasetype + ' issotrx=' + SHIP.hdr.issotrx + ' lines=' + SHIP.lines.length);

  // ── ARM 2 · SIGN FOLLOWS THE CODE (receipt adds, shipment subtracts the SAME positive line qty) ──
  console.log('\n── ARM 2 · a receipt ADDS and a shipment SUBTRACTS the same positive line qty ──');
  var rIn = E.stockMoves(RCPT.hdr, RCPT.lines, { docBaseType: RCPT.hdr.docbasetype });
  var sOut = E.stockMoves(SHIP.hdr, SHIP.lines, { docBaseType: SHIP.hdr.docbasetype });
  function signBad(res, src) {
    return res.ops.filter(function (o, i) { return Number(o.movementqty) !== E.movementSign(res.movementtype) * Math.abs(Number(src[i].movementqty)); });
  }
  var rBad = signBad(rIn, RCPT.lines.filter(function (l) { return l.m_product_id != null && l.m_locator_id != null; }));
  var sBad = signBad(sOut, SHIP.lines.filter(function (l) { return l.m_product_id != null && l.m_locator_id != null; }));
  console.log('§STOCK-SIGN receipt type=' + rIn.movementtype + ' ops=' + rIn.ops.length + ' net=' + rIn.ops.reduce(function (a, o) { return a + o.movementqty; }, 0) + ' signMismatches=' + rBad.length +
              ' | shipment type=' + sOut.movementtype + ' ops=' + sOut.ops.length + ' net=' + sOut.ops.reduce(function (a, o) { return a + o.movementqty; }, 0) + ' signMismatches=' + sBad.length);
  verdict(rIn.ops.length > 0 && rIn.ops.every(function (o) { return o.movementqty > 0; }), 'receipt (' + rIn.movementtype + ') emits POSITIVE movementqty on every line', 'ops=' + rIn.ops.length);
  verdict(sOut.ops.length > 0 && sOut.ops.every(function (o) { return o.movementqty < 0; }), 'shipment (' + sOut.movementtype + ') emits NEGATIVE movementqty on every line', 'ops=' + sOut.ops.length);
  verdict(rBad.length === 0 && sBad.length === 0, 'every movementqty == movementSign(type) × |line qty| — the sign comes from the code, not a pre-signed column', 'mismatches=' + (rBad.length + sBad.length));

  // ── ARM 3 · ONE TRANSACTION PER STOCKABLE LINE, source fields verbatim ──
  console.log('\n── ARM 3 · one M_Transaction per stockable line, fields carried verbatim ──');
  var stockable = RCPT.lines.filter(function (l) { return l.m_product_id != null && l.m_locator_id != null && (l.movementqty != null || l.qtyentered != null); });
  var COPIED = ['m_inoutline_id', 'm_locator_id', 'm_product_id', 'm_attributesetinstance_id'];
  var fBad = [];
  rIn.ops.forEach(function (o, i) {
    COPIED.forEach(function (c) { if (String(o[c]) !== String(stockable[i][c])) fBad.push(stockable[i].m_inoutline_id + '.' + c + ' op=' + o[c] + ' src=' + stockable[i][c]); });
    if (o.table !== 'M_Transaction' || o.op_type !== 'CREATE_LINE') fBad.push(stockable[i].m_inoutline_id + '.shape');
    if (String(o.movementdate) !== String(RCPT.hdr.movementdate)) fBad.push(stockable[i].m_inoutline_id + '.movementdate');
  });
  // a line with no product/locator must be SKIPPED AND COUNTED, not silently dropped
  var maimed = RCPT.lines.map(function (l) { var c = {}; Object.keys(l).forEach(function (k) { c[k] = l[k]; }); return c; });
  maimed[0].m_locator_id = null;
  var skipRes = E.stockMoves(RCPT.hdr, maimed, { docBaseType: RCPT.hdr.docbasetype });
  console.log('§STOCK-LINES stockable=' + stockable.length + ' ops=' + rIn.ops.length + ' fieldMismatches=' + fBad.length +
              ' skipTest: ops=' + skipRes.ops.length + ' skipped=' + skipRes.skipped +
              (fBad.length ? ' ' + JSON.stringify(fBad.slice(0, 4)) : ''));
  verdict(rIn.ops.length === stockable.length, 'N stockable lines → N M_Transaction ops', 'ops=' + rIn.ops.length + ' stockable=' + stockable.length);
  verdict(rIn.ops.length > 0 && fBad.length === 0, 'locator/product/ASI/inoutline/date carried verbatim from the source line', 'mismatches=' + fBad.length);
  verdict(skipRes.ops.length === rIn.ops.length - 1 && skipRes.skipped === 1, 'a line with no locator is SKIPPED AND COUNTED, never silently dropped', 'ops=' + skipRes.ops.length + ' skipped=' + skipRes.skipped);

  // ── ARM 4 · THE FOLD MOVES ON-HAND (the arm E-4 exists for) ──
  console.log('\n── ARM 4 · baseline m_storageonhand + the emitted transactions == baseline ± qty ──');
  var moved = [];
  rIn.ops.forEach(function (o) {
    var b = q('SELECT COALESCE(SUM(qtyonhand),0) oh FROM m_storageonhand WHERE m_product_id=? AND m_locator_id=?', [o.m_product_id, o.m_locator_id])[0];
    var base = Number(b.oh || 0);
    // the SAME qtyOnHand spine the engine already ships (W-FOLD-QTYONHAND) — not a re-derivation
    var folded = E.qtyOnHand([o], { keyOf: function () { return 'k'; }, typeOf: function (e) { return e.movementtype; }, absQtyOf: function (e) { return Math.abs(e.movementqty); } });
    moved.push({ p: o.m_product_id, l: o.m_locator_id, base: base, delta: folded.k, after: base + folded.k, want: base + o.movementqty });
  });
  var foldBad = moved.filter(function (m) { return m.after !== m.want; });
  console.log('§STOCK-ONHAND-FOLD rows=' + moved.length + ' mismatches=' + foldBad.length + ' sample=' +
              JSON.stringify(moved.slice(0, 3).map(function (m) { return 'p' + m.p + '@l' + m.l + ' ' + m.base + '→' + m.after + ' (' + (m.delta >= 0 ? '+' : '') + m.delta + ')'; })));
  verdict(moved.length > 0 && foldBad.length === 0, 'on-hand after = baseline + the folded signed movement, for every emitted line', 'mismatches=' + foldBad.length);
  verdict(moved.some(function (m) { return m.delta !== 0; }), 'NOT VACUOUS — at least one movement is non-zero (a fold of zeros would prove nothing)',
          'nonZero=' + moved.filter(function (m) { return m.delta !== 0; }).length + '/' + moved.length);

  // ── ARM 5 · GATE: no movement type ⇒ no ops, with a reason ──
  console.log('\n── ARM 5 · an unmappable DocBaseType emits NOTHING and says why ──');
  var g = E.stockMoves(RCPT.hdr, RCPT.lines, { docBaseType: 'GLJ' });
  console.log('§STOCK-GATE docBaseType=GLJ ops=' + g.ops.length + ' skipped=' + g.skipped + ' reason=' + JSON.stringify(g.reason || null));
  verdict(g.ops.length === 0 && !!g.reason && g.skipped === RCPT.lines.length, 'DocBaseType GLJ → zero ops, all lines counted as skipped, reason named', g.reason || 'no reason');

  // ── ARM 6 · the Complete fan-out carries the stock effect ──
  console.log('\n── ARM 6 · completeReceipt now carries the stock effect beside M_MatchPO ──');
  var full = E.completeReceipt(RCPT.hdr, RCPT.lines, { docBaseType: RCPT.hdr.docbasetype });
  var trx = full.filter(function (o) { return o.table === 'M_Transaction'; });
  var mpo = full.filter(function (o) { return o.table === 'M_MatchPO'; });
  var legacy = E.completeReceipt(RCPT.hdr, RCPT.lines, null);            // an older caller passing no policy
  console.log('§STOCK-FANOUT ops=' + full.length + ' matchPO=' + mpo.length + ' mTransaction=' + trx.length +
              ' | noPolicyCaller ops=' + legacy.length + ' mTransaction=' + legacy.filter(function (o) { return o.table === 'M_Transaction'; }).length);
  verdict(trx.length === rIn.ops.length && mpo.length > 0, 'completeReceipt emits BOTH the M_MatchPO junctions and the M_Transaction movements', 'matchPO=' + mpo.length + ' mTransaction=' + trx.length);
  verdict(legacy.filter(function (o) { return o.table === 'M_Transaction'; }).length === 0 && legacy.length === mpo.length + 1,
          'a caller that passes no DocBaseType is byte-identical to before (no guessed sign)', 'legacyOps=' + legacy.length);

  // ── ARM 7 · deferrals declared ──
  console.log('\n── ARM 7 · out-of-scope branches are DECLARED ──');
  console.log('§STOCK-DEFERRED ' + JSON.stringify(rIn.deferred));
  verdict(rIn.deferred.some(function (d) { return /costing/.test(d); }) &&
          rIn.deferred.some(function (d) { return /reservation/.test(d); }) &&
          rIn.deferred.some(function (d) { return /asi-material-policy/.test(d); }),
          'costing, reservation and the ASI material-policy loop are named, not silently absent', JSON.stringify(rIn.deferred));

  gb.close();
  if (!checks) { console.log('\n⚪ W-STOCK-MOVE INCONCLUSIVE — nothing was judged'); process.exit(3); }
  console.log('\n' + (fails ? '🔴 W-STOCK-MOVE FAIL — ' + (checks - fails) + ' PASS / ' + fails + ' FAIL'
                            : '🟢 W-STOCK-MOVE PASS — ' + checks + ' PASS / 0 FAIL — a completed M_InOut now moves stock'));
  process.exit(fails ? 2 : 0);
})();
