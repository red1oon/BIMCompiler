// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
/**
 * poc_migrate_postcfg_odoo.js — WITNESS for MIGRATE_POSTING_CONFIG.md (Odoo half, Client 12).
 *
 * ISSUE IT PROVES: a migrated Odoo tenant db used to carry DOCUMENTS but ZERO posting config
 * (card §THE GAP: bim-ootb/erp/12-odoo.db → coverage:absent on every GL view). The extended
 * generator (build/erp/gen_ad_odoo.js §1b/§5d) now emits the FULL post_resolver contract from
 * REAL Odoo properties. This witness proves, on the STAGED regen (build/erp/12-odoo_postcfg.db):
 *
 *   §MIGRATE-POSTCFG — derivePostings(C_Order S00023) via the FROZEN engine → coverage:complete,
 *                      balanced, tokens 5/5 ({BPartner.Receivable},{Product.Revenue},{Tax.Due} off
 *                      the journal + {Product.Cogs},{Product.Asset} direct-resolved on a migrated
 *                      product — asset = Odoo property_stock_valuation_account_id, NOT a copy of expense).
 *   §LINKAGE         — migrated docs carry c_bpartner_id / m_product_id (the resolver's keys).
 *   §FRAME-FIT       — derived journal == Odoo's OWN posted GL (account.move.line, live odoodemo;
 *                      recorded fallback) TO THE CENT → oracle-equivalent.
 *   §FALSIFIER       — drop the emitted c_bp_customer_acct row → {BPartner.Receivable} absent →
 *                      coverage drops (config is LOAD-BEARING, not decorative).
 *
 * NON-INVENT: every account traces to a real Odoo source — ir_property company defaults,
 *   product.category income/expense/stock-valuation properties, account.tax.repartition.line.account_id,
 *   account_account code/name. Engine FROZEN: doc_poster.js + post_resolver.js consumed, never forked.
 *
 * Run:  bash build/erp/run_witness.sh scripts/poc_migrate_postcfg_odoo.js
 *       (log → build/erp/poc_migrate_postcfg_odoo.log; READ it — exit code is not evidence)
 */
var fs = require('fs'), path = require('path'), http = require('http');
var Database = require('better-sqlite3');
var DocPoster = require('./doc_poster');
var R = require('./post_resolver');

var DB = process.env.TENANT_DB || path.join(__dirname, '..', 'build', 'erp', '12-odoo_postcfg.db');
var SCHEMA = 101;                       // the frozen consumer's default acctschema (erp_preview.js: opts.schema||101)
var ORDER_ID = 1200001;                 // the migrated S00023 (gen_ad_odoo: S00023 sorts first → DOC+1)
function L(m) { console.log(m); }
function cents(n) { return Math.round(Number(n || 0) * 100); }

// ── the ORACLE: Odoo's own posted GL for the S00023 invoice, aggregated by natural account code.
//    Re-pulled LIVE when odoodemo is up; else the recorded values (witnessed 2026-06-10, /tmp/odoo_acct_probe).
var RECORDED_ORACLE = { '121000': { dr: 500250, cr: 0 }, '400000': { dr: 0, cr: 435000 }, '251000': { dr: 0, cr: 65250 } };
function rpc(s, m, a) {
  return new Promise(function (res, rej) {
    var b = JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: s, method: m, args: a } });
    var r = http.request({ host: 'localhost', port: Number(process.env.ODOO_PORT || 8069), path: '/jsonrpc', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }, timeout: 4000 }, function (x) {
      var d = ''; x.on('data', function (c) { d += c; }); x.on('end', function () { try { var j = JSON.parse(d); j.error ? rej(new Error('rpc')) : res(j.result); } catch (e) { rej(e); } }); });
    r.on('error', rej); r.on('timeout', function () { r.destroy(new Error('timeout')); }); r.write(b); r.end();
  });
}
async function liveOracle() {
  var uid = await rpc('common', 'login', ['odoodemo', 'admin', 'admin']);
  var ex = function (mo, me, a, k) { return rpc('object', 'execute_kw', ['odoodemo', uid, 'admin', mo, me, a, k || {}]); };
  var inv = (await ex('account.move', 'search_read', [[['invoice_origin', '=', 'S00023'], ['move_type', '=', 'out_invoice']]], { fields: ['id'] }))[0];
  var aml = await ex('account.move.line', 'search_read', [[['move_id', '=', inv.id]]], { fields: ['account_id', 'debit', 'credit'] });
  var o = {};
  aml.forEach(function (l) { var code = String(l.account_id[1]).split(' ')[0]; if (!o[code]) o[code] = { dr: 0, cr: 0 }; o[code].dr += cents(l.debit); o[code].cr += cents(l.credit); });
  return o;
}

(async function () {
  L('\n══ POC-MIGRATE-POSTCFG-ODOO — frozen engine on the STAGED migrated Odoo tenant (' + path.basename(DB) + ') ══\n');
  if (!fs.existsSync(DB)) { L('§MIGRATE-POSTCFG FAIL — staged tenant db missing (run: AD_SEED=~/bim-ootb/erp/ad_seed.db SHARD_OUT=build/erp/12-odoo_postcfg.db CLIENT_ID=12 node build/erp/gen_ad_odoo.js)'); process.exit(1); }
  var db = new Database(DB, { readonly: true });          // NEVER mutate the source artifact

  // ── 1. §MIGRATE-POSTCFG — the frozen verb resolves the migrated tenant's accounts, ALL 5 tokens. ──
  var res = DocPoster.derivePostings(db, { table: 'C_Order', id: ORDER_ID }, SCHEMA, R);
  var coverage = res.absent.length ? 'partial' : 'complete';
  L('   journal (basis=' + res.basis + '):');
  res.lines.forEach(function (l) { L('     ' + l.value + ' ' + l.name + '  DR ' + l.amtacctdr.toFixed(2) + '  CR ' + l.amtacctcr.toFixed(2)); });
  // journal tokens (sales manifest) + the two stock-side tokens, direct-resolved on a product of THIS order.
  var journalTokens = ['{BPartner.Receivable}', '{Product.Revenue}', '{Tax.Due}'];
  var resolved = journalTokens.filter(function (t) { return res.absent.indexOf(t) < 0; }).length;
  var prodRow = db.prepare('SELECT M_Product_ID AS pid FROM C_OrderLine WHERE C_Order_ID=? AND M_Product_ID IS NOT NULL').get(ORDER_ID);
  ['{Product.Cogs}', '{Product.Asset}'].forEach(function (t) {
    var r = R.resolve(db, t, Number(prodRow.pid), SCHEMA);
    if (r.acct != null && r.element) { resolved++; L('   direct ' + t + ' → ' + r.element.value + ' ' + r.element.name + ' (' + r.source_col + ')'); }
    else L('   direct ' + t + ' → ABSENT (' + r.absent + ')');
  });
  L('§MIGRATE-POSTCFG client=12 doc=C_Order id=' + ORDER_ID + ' tokens_resolved=' + resolved + '/5' +
    ' coverage=' + coverage + ' balanced=' + (res.balanced ? 'Y' : 'N') + ' sumDr=' + (res.sumDr / 100).toFixed(2) + ' sumCr=' + (res.sumCr / 100).toFixed(2));

  // ── 2. §LINKAGE — migrated docs carry the resolver's master keys (bpartner / product). ──
  var oBP = db.prepare('SELECT COUNT(*) n FROM C_Order WHERE C_BPartner_ID IS NOT NULL').get().n;
  var oN = db.prepare('SELECT COUNT(*) n FROM C_Order').get().n;
  var lP = db.prepare('SELECT COUNT(*) n FROM C_OrderLine WHERE M_Product_ID IS NOT NULL').get().n;
  var lN = db.prepare('SELECT COUNT(*) n FROM C_OrderLine').get().n;
  var linked = (oBP === oN && lP === lN && oN > 0 && lN > 0);
  L('§LINKAGE orders_with_bpartner=' + oBP + '/' + oN + ' orderlines_with_product=' + lP + '/' + lN + ' ' + (linked ? 'OK' : 'FAIL'));

  // ── 3. §FRAME-FIT — diff the derived journal vs Odoo's OWN posted GL to the cent (oracle-equivalent). ──
  var oracle = RECORDED_ORACLE, oracleSrc = 'recorded';
  try { oracle = await liveOracle(); oracleSrc = 'live odoodemo'; } catch (e) { L('   (odoodemo down — using recorded oracle)'); }
  var derived = {};
  res.lines.forEach(function (l) { derived[l.value] = { dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) }; });
  var maxDiff = 0;
  Object.keys(oracle).forEach(function (code) {
    var d = derived[code] || { dr: 0, cr: 0 }, o = oracle[code];
    maxDiff = Math.max(maxDiff, Math.abs(d.dr - o.dr), Math.abs(d.cr - o.cr));
  });
  // also ensure derived introduced no account the oracle lacks
  Object.keys(derived).forEach(function (code) { if (!oracle[code]) maxDiff = Math.max(maxDiff, derived[code].dr + derived[code].cr); });
  var fit = (coverage === 'complete' && res.balanced && maxDiff === 0);
  L('§FRAME-FIT client=12 doc=C_Order postingDoc=true coverage=' + coverage + ' balanced=' + (res.balanced ? 'Y' : 'N') +
    ' oracle=' + oracleSrc + ' maxDiff=' + maxDiff + 'c verdict=' + (fit ? 'ORACLE-EQUIVALENT' : 'DRIFT'));

  // ── 4. §FALSIFIER — strip the emitted receivable config → the token must go absent (config is load-bearing).
  //      Operates on a THROWAWAY copy so the staged artifact is never mutated. ──
  var tmp = path.join(require('os').tmpdir(), 'migrate_postcfg_odoo_falsify.db');
  fs.copyFileSync(DB, tmp);
  var fdb = new Database(tmp, { readonly: false });
  var bpId = db.prepare('SELECT C_BPartner_ID AS bp FROM C_Order WHERE C_Order_ID=?').get(ORDER_ID).bp;
  fdb.prepare('DELETE FROM c_bp_customer_acct WHERE c_bpartner_id=?').run(Number(bpId));
  var res2 = DocPoster.derivePostings(fdb, { table: 'C_Order', id: ORDER_ID }, SCHEMA, R);
  fdb.close(); fs.unlinkSync(tmp);
  var falsified = res2.absent.indexOf('{BPartner.Receivable}') >= 0 && !res2.balanced;
  L('§FALSIFIER dropped c_bp_customer_acct(bp=' + bpId + ') → absent=[' + res2.absent.join(',') + '] coverage=' +
    (res2.absent.length ? 'partial' : 'complete') + ' balanced=' + (res2.balanced ? 'Y' : 'N') + ' loadBearing=' + (falsified ? 'Y' : 'N'));

  var pass = (resolved === 5) && fit && linked && falsified;
  L('\n§MIGRATE-POSTCFG-ODOO ' + (pass ? 'PASS' : 'FAIL') + '\n');
  process.exit(pass ? 0 : 1);
})().catch(function (e) { console.error('§MIGRATE-POSTCFG-ODOO ERROR', e.message, e.stack); process.exit(2); });
