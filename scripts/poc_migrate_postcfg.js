// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
/**
 * poc_migrate_postcfg.js — WITNESS for MIGRATE_FULL_MODEL_FRAME.md (Odoo Client 12).
 *
 * Proves: a MIGRATED tenant (build/erp/12-odoo.db, emitted by build/erp/gen_ad_odoo.js) carries the full
 * model frame so the FROZEN engine (doc_poster → post_resolver, untouched) resolves its accounts to the cent.
 *
 *   §MIGRATE-POSTCFG — derivePostings(C_Order S00023) → coverage:complete, balanced, all tokens resolved.
 *   §FRAME-FIT       — the derived journal == Odoo's OWN posted GL (account.move.line) to the cent
 *                      (oracle-equivalent; the migrated tenant reproduces its source ledger).
 *   §FALSIFIER       — drop the emitted c_bp_customer_acct row → {BPartner.Receivable} goes absent →
 *                      coverage drops (the migrated config is LOAD-BEARING, not decorative).
 *
 * NON-INVENT: every account in the tenant db came from a real Odoo column (gen_ad_odoo §1b/§5d); the oracle
 *   is Odoo's real posted ledger, re-pulled live (or the recorded fallback if odoodemo is down).
 *
 * Run:  node scripts/poc_migrate_postcfg.js 2>&1 | tee build/erp/poc_migrate_postcfg.log
 */
var fs = require('fs'), path = require('path'), http = require('http');
var Database = require('better-sqlite3');
var DocPoster = require('./doc_poster');
var R = require('./post_resolver');

var DB = process.env.TENANT_DB || path.join(__dirname, '..', 'build', 'erp', '12-odoo.db');
var SCHEMA = 101;                       // the frozen consumer's default acctschema (erp_preview.js: opts.schema||101)
var ORDER_ID = 1200001;                 // the migrated S00023 (gen_ad_odoo)
var log = []; function L(m) { console.log(m); log.push(m); }
function cents(n) { return Math.round(Number(n || 0) * 100); }

// ── the ORACLE: Odoo's own posted GL for INV/2026/00005 (from S00023), aggregated by natural account code.
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
  L('\n══ POC-MIGRATE-POSTCFG — frozen engine on the MIGRATED Odoo tenant (' + path.basename(DB) + ') ══\n');
  if (!fs.existsSync(DB)) { L('§MIGRATE-POSTCFG FAIL — tenant db missing (run build/erp/gen_ad_odoo.js first)'); process.exit(1); }
  var db = new Database(DB, { readonly: true });          // NEVER mutate the source artifact

  // ── 1. §MIGRATE-POSTCFG — the frozen verb resolves the migrated tenant's accounts. ──
  var res = DocPoster.derivePostings(db, { table: 'C_Order', id: ORDER_ID }, SCHEMA, R);
  var coverage = res.absent.length ? 'partial' : 'complete';
  var tokens = ['{BPartner.Receivable}', '{Product.Revenue}', '{Tax.Due}'];
  var resolved = tokens.filter(function (t) { return res.absent.indexOf(t) < 0; }).length;
  L('   journal (basis=' + res.basis + '):');
  res.lines.forEach(function (l) { L('     ' + l.value + ' ' + l.name + '  DR ' + l.amtacctdr.toFixed(2) + '  CR ' + l.amtacctcr.toFixed(2)); });
  L('§MIGRATE-POSTCFG client=12 doc=C_Order id=' + ORDER_ID + ' tokens_resolved=' + resolved + '/' + tokens.length +
    ' coverage=' + coverage + ' balanced=' + (res.balanced ? 'Y' : 'N') + ' sumDr=' + (res.sumDr / 100).toFixed(2) + ' sumCr=' + (res.sumCr / 100).toFixed(2));

  // ── 2. §FRAME-FIT — diff the derived journal vs Odoo's OWN posted GL to the cent (oracle-equivalent). ──
  var oracle = RECORDED_ORACLE, oracleSrc = 'recorded';
  try { oracle = await liveOracle(); oracleSrc = 'live odoodemo'; } catch (e) { L('   (odoodemo down — using recorded oracle)'); }
  var derived = {};
  res.lines.forEach(function (l) { derived[l.value] = { dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) }; });
  var maxDiff = 0, codes = Object.keys(oracle);
  codes.forEach(function (code) {
    var d = derived[code] || { dr: 0, cr: 0 }, o = oracle[code];
    maxDiff = Math.max(maxDiff, Math.abs(d.dr - o.dr), Math.abs(d.cr - o.cr));
  });
  // also ensure derived introduced no account the oracle lacks
  Object.keys(derived).forEach(function (code) { if (!oracle[code]) maxDiff = Math.max(maxDiff, derived[code].dr + derived[code].cr); });
  var fit = (coverage === 'complete' && res.balanced && maxDiff === 0);
  L('§FRAME-FIT client=12 doc=C_Order postingDoc=true coverage=' + coverage + ' balanced=' + (res.balanced ? 'Y' : 'N') +
    ' oracle=' + oracleSrc + ' maxDiff=' + maxDiff + 'c verdict=' + (fit ? 'ORACLE-EQUIVALENT' : 'DRIFT'));

  // ── 3. §FALSIFIER — strip the emitted receivable config → the token must go absent (config is load-bearing).
  //      Operates on a THROWAWAY copy so the source artifact is never mutated. ──
  var tmp = path.join(require('os').tmpdir(), 'migrate_postcfg_falsify.db');
  fs.copyFileSync(DB, tmp);
  var fdb = new Database(tmp, { readonly: false });
  fdb.prepare('DELETE FROM c_bp_customer_acct WHERE c_bpartner_id=?').run(1200001);
  var res2 = DocPoster.derivePostings(fdb, { table: 'C_Order', id: ORDER_ID }, SCHEMA, R);
  fdb.close(); fs.unlinkSync(tmp);
  var falsified = res2.absent.indexOf('{BPartner.Receivable}') >= 0 && !res2.balanced;
  L('§FALSIFIER dropped c_bp_customer_acct → absent=[' + res2.absent.join(',') + '] balanced=' + (res2.balanced ? 'Y' : 'N') +
    ' loadBearing=' + (falsified ? 'Y' : 'N'));

  var pass = fit && falsified;
  L('\n§MIGRATE-POSTCFG ' + (pass ? 'PASS' : 'FAIL') + '\n');
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'erp', 'poc_migrate_postcfg.log'), log.join('\n'));
  process.exit(pass ? 0 : 1);
})().catch(function (e) { console.error('§MIGRATE-POSTCFG ERROR', e.message, e.stack); process.exit(2); });
