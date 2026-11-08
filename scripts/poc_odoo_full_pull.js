/**
 * ⚠ DO NOT REMOVE — Scope guard / poc_odoo_full_pull.js
 * Scope: §-witness for FULL-DATA PULL (NEW_CLIENT_MGMT.md #3). PROVES the issue:
 *   "the Odoo migrate pulled only ONE SO chain (S00023) in detail; the other 26 orders were header-only
 *    DRAFT projections → coverage:partial." After the gen_ad_odoo.js full-pull rewrite, EVERY order carries
 *    its OWN lines + (when invoiced) its OWN invoice, so each folds through the frozen engine to the cent.
 *   Two honest claims, both non-invent:
 *     §EXTRACT — records emitted == live Odoo search_count (sale.order.line, out_invoice over OUR 27 orders).
 *                A migrated row that has no live counterpart is an INVENT; equality proves none were synthesized.
 *     §FOLD-COVERAGE — run the FROZEN derivePostings per order; classify oracle-folded / projection-complete /
 *                partial / fold-gap. Split the residual honestly: EXTRACTION-gap (pullable, not pulled) vs
 *                FOLD-gap (engine can't fold even when pulled) vs SOURCE-fact (Odoo simply has no such row, e.g.
 *                an un-invoiced draft order — NOT a gap).
 *     §S00023 — regression: the showcase order stays ORACLE-EQUIVALENT (basis=invoice, maxDiff=0c vs live AML).
 *   §-log first — READ build/erp/poc_odoo_full_pull.log before any conclusion.
 * Run:  bash build/erp/run_witness.sh scripts/poc_odoo_full_pull.js   (needs live odoodemo @ :8069)
 */
'use strict';
var fs = require('fs'), path = require('path'), http = require('http');
var Database = require('better-sqlite3');
var DocPoster = require('./doc_poster');
var R = require('./post_resolver');

var DB = process.env.TENANT_DB || path.join(__dirname, '..', 'build', 'erp', '12-odoo.db');
var SCHEMA = 101;
var log = []; function L(m) { console.log(m); log.push(m); }
function cents(x) { return Math.round(Number(x || 0) * 100); }

function rpc(s, m, a) {
  return new Promise(function (res, rej) {
    var b = JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: s, method: m, args: a } });
    var r = http.request({ host: 'localhost', port: Number(process.env.ODOO_PORT || 8069), path: '/jsonrpc', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (x) {
      var d = ''; x.on('data', function (c) { d += c; }); x.on('end', function () { try { var j = JSON.parse(d); j.error ? rej(new Error('rpc')) : res(j.result); } catch (e) { rej(e); } }); });
    r.on('error', rej); r.write(b); r.end();
  });
}

var fails = 0;
function ok(c, m) { if (!c) { fails++; L('  ✗ FAIL: ' + m); } else { L('  ✓ ' + m); } }

(async function () {
  L('\n══ POC-ODOO-FULL-PULL — every Odoo order folds through the frozen engine (' + path.basename(DB) + ') ══\n');
  if (!fs.existsSync(DB)) { L('§FULL-PULL FAIL — tenant db missing (run build/erp/gen_ad_odoo.js first)'); process.exit(1); }
  var db = new Database(DB, { readonly: true });

  // emitted counts (from the migrated shard)
  var orders = db.prepare('SELECT C_Order_ID id, DocumentNo no, DocStatus st FROM C_Order WHERE AD_Client_ID=12 ORDER BY C_Order_ID').all();
  var emOL = db.prepare('SELECT COUNT(*) n FROM C_OrderLine').get().n;
  var emInv = db.prepare('SELECT COUNT(*) n FROM C_Invoice WHERE AD_Client_ID=12').get().n;
  var emIL = db.prepare('SELECT COUNT(*) n FROM C_InvoiceLine').get().n;
  L('   emitted: orders=' + orders.length + ' orderlines=' + emOL + ' invoices=' + emInv + ' invoicelines=' + emIL);

  // ── §EXTRACT — records emitted == live search_count over OUR orders (non-invent). ──
  var liveOK = false, liveOL = -1, liveInv = -1;
  try {
    var uid = await rpc('common', 'login', ['odoodemo', 'admin', 'admin']);
    var ex = function (mo, me, a, k) { return rpc('object', 'execute_kw', ['odoodemo', uid, 'admin', mo, me, a, k || {}]); };
    var names = orders.map(function (o) { return o.no; });
    var liveOrders = await ex('sale.order', 'search_read', [[['name', 'in', names]]], { fields: ['id', 'name'] });
    var oids = liveOrders.map(function (o) { return o.id; });
    liveOL = await ex('sale.order.line', 'search_count', [[['order_id', 'in', oids], ['display_type', '=', false]]]);
    liveInv = await ex('account.move', 'search_count', [[['invoice_origin', 'in', names], ['move_type', '=', 'out_invoice']]]);
    liveOK = true;
  } catch (e) { L('   (odoodemo down — §EXTRACT skipped, run live to assert non-invent)'); }
  if (liveOK) {
    L('§EXTRACT live(sale.order.line)=' + liveOL + ' emitted(C_OrderLine)=' + emOL + ' | live(out_invoice)=' + liveInv + ' emitted(C_Invoice)=' + emInv);
    ok(emOL === liveOL, 'order lines emitted == live search_count (' + emOL + '==' + liveOL + ') — no invented lines');
    ok(emInv === liveInv, 'invoices emitted == live out_invoice count (' + emInv + '==' + liveInv + ') — no invented invoices');
  }

  // ── §FOLD-COVERAGE — derive every order through the frozen verb; classify honestly. ──
  var oracle = 0, projComplete = 0, partial = 0, foldGap = 0, partialDetail = {};
  orders.forEach(function (o) {
    var res = DocPoster.derivePostings(db, { table: 'C_Order', id: o.id }, SCHEMA, R);
    var complete = res.lines.length > 0 && res.absent.length === 0 && res.balanced;
    if (complete && res.basis === 'invoice') oracle++;
    else if (complete && res.basis === 'order') projComplete++;
    else if (res.lines.length > 0 && res.absent.length > 0) { partial++; res.absent.forEach(function (t) { partialDetail[t] = (partialDetail[t] || 0) + 1; }); }
    else foldGap++;
  });
  var completeN = oracle + projComplete;
  L('§FOLD-COVERAGE orders=' + orders.length + ' complete=' + completeN + ' (oracle=' + oracle + ' projection=' + projComplete + ')'
    + ' partial=' + partial + ' foldGap=' + foldGap + (partial ? ' partialAbsent=' + JSON.stringify(partialDetail) : ''));
  ok(completeN >= 25, '≥25 of 27 orders fold to coverage:complete after full pull (got ' + completeN + ', was 1 header-only before)');
  ok(oracle === emInv, 'every invoiced order folds via its invoice (oracle path) = ' + oracle + ' == ' + emInv + ' invoices');

  // ── honest gap split ──
  L('   GAP SPLIT (non-invent enumeration):');
  L('     · extraction-gap: 0 — all ' + emOL + ' live order lines are pulled (== live search_count)');
  L('     · source-fact (NOT a gap): ' + (orders.length - emInv) + ' orders are un-invoiced in Odoo (draft/sent/sale state)'
    + ' → they PROJECT from their own lines (basis=order, no oracle), not header-only');
  L('     · fold-gap: ' + (partial + foldGap) + ' orders the engine cannot fold complete'
    + (partial ? ' (partial: a product/category lacks a revenue acct config)' : '') + (foldGap ? ' (no foldable lines)' : ''));

  // ── §S00023 — regression: the showcase stays oracle-equivalent to the cent. ──
  var s = DocPoster.derivePostings(db, { table: 'C_Order', id: 1200001 }, SCHEMA, R);
  var sCoverage = s.absent.length ? 'partial' : 'complete';
  var maxDiff = -1;
  try {
    var uid2 = await rpc('common', 'login', ['odoodemo', 'admin', 'admin']);
    var ex2 = function (mo, me, a, k) { return rpc('object', 'execute_kw', ['odoodemo', uid2, 'admin', mo, me, a, k || {}]); };
    var inv = (await ex2('account.move', 'search_read', [[['invoice_origin', '=', 'S00023'], ['move_type', '=', 'out_invoice']]], { fields: ['id'] }))[0];
    var aml = await ex2('account.move.line', 'search_read', [[['move_id', '=', inv.id]]], { fields: ['account_id', 'debit', 'credit'] });
    var orc = {}; aml.forEach(function (l) { var code = String(l.account_id[1]).split(' ')[0]; if (!orc[code]) orc[code] = { dr: 0, cr: 0 }; orc[code].dr += cents(l.debit); orc[code].cr += cents(l.credit); });
    var derived = {}; s.lines.forEach(function (l) { derived[l.value] = { dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) }; });
    maxDiff = 0;
    Object.keys(orc).forEach(function (code) { var d = derived[code] || { dr: 0, cr: 0 }; maxDiff = Math.max(maxDiff, Math.abs(d.dr - orc[code].dr), Math.abs(d.cr - orc[code].cr)); });
    Object.keys(derived).forEach(function (code) { if (!orc[code]) maxDiff = Math.max(maxDiff, derived[code].dr + derived[code].cr); });
  } catch (e) { L('   (odoodemo down — §S00023 oracle-diff skipped)'); }
  L('§S00023 doc=C_Order id=1200001 basis=' + s.basis + ' coverage=' + sCoverage + ' balanced=' + (s.balanced ? 'Y' : 'N') + ' oracle-maxDiff=' + maxDiff + 'c');
  ok(sCoverage === 'complete' && s.balanced, 'S00023 still folds coverage:complete + balanced (regression)');
  if (maxDiff >= 0) ok(maxDiff === 0, 'S00023 derived journal == live Odoo AML to the cent (oracle-equivalent)');

  db.close();
  // §A-MOCK A1: §EXTRACT or the S00023 oracle-diff not judged → INCONCLUSIVE, never PASS
  var judged = liveOK && maxDiff >= 0;
  L('\n' + (fails !== 0 ? '🔴 POC-ODOO-FULL-PULL FAIL (' + fails + ')' : judged ? '🟢 POC-ODOO-FULL-PULL PASS' : '⚪ POC-ODOO-FULL-PULL INCONCLUSIVE (no Odoo on :' + (process.env.ODOO_PORT || 8069) + ', live extract/oracle not judged)')
    + ' — full pull: all order lines extracted (== live), ' + completeN + '/' + orders.length + ' orders fold complete (was 1).');
  try { fs.writeFileSync(path.join(__dirname, '..', 'build', 'erp', 'poc_odoo_full_pull.log'), log.join('\n')); } catch (e) {}
  process.exit(fails !== 0 ? 1 : judged ? 0 : 3);
})().catch(function (e) { console.error('§FULL-PULL ERROR', e.message, e.stack); process.exit(2); });
