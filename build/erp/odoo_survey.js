#!/usr/bin/env node
// odoo_survey.js — FULL inventory survey of the LIVE Odoo instance for the migrate-coverage GAP analysis.
// EXTRACT / NON-INVENT: every count is a real search_count RPC against odoodemo (Odoo 17, :8069). Models
// that are absent are reported as ABSENT (fields_get errors). Emits ./odoo_survey.json. §-log first.
// Reuses agent.js's http+rpc pattern. Run: node odoo_survey.js  (tee to odoo_survey.log)
'use strict';
var http = require('http'), fs = require('fs');
var HOST = process.env.ODOO_HOST || 'localhost', PORT = Number(process.env.ODOO_PORT || 8069);
var DB = process.env.ODOO_DB || 'odoodemo', LOGIN = process.env.ODOO_LOGIN || 'admin', PASSWORD = process.env.ODOO_PASSWORD || 'admin';

function rpc(service, method, args) {
  return new Promise(function (resolve, reject) {
    var body = JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: service, method: method, args: args } });
    var req = http.request({ host: HOST, port: PORT, path: '/jsonrpc', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, function (res) {
      var d = ''; res.on('data', function (c) { d += c; }); res.on('end', function () {
        try { var j = JSON.parse(d); if (j.error) return reject(new Error(JSON.stringify((j.error.data && j.error.data.message) || j.error))); resolve(j.result); }
        catch (e) { reject(e); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

(async function () {
  var out = { meta: {}, modules: [], counts: {}, splits: {}, samples: {}, absent: [] };
  var uid = await rpc('common', 'login', [DB, LOGIN, PASSWORD]);
  var ver = await rpc('common', 'version', []);
  console.log('§SURVEY auth uid=' + uid + ' odoo=' + (ver.server_version || '?') + ' db=' + DB);
  out.meta = { uid: uid, server_version: ver.server_version, db: DB, host: HOST + ':' + PORT, ts: new Date().toISOString() };
  var ex = function (model, method, args, kw) { return rpc('object', 'execute_kw', [DB, uid, PASSWORD, model, method, args, kw || {}]); };

  // ── helper: count a model, tolerating absence ──
  async function count(model, domain) {
    try {
      var n = await ex(model, 'search_count', [domain || []]);
      out.counts[model] = (out.counts[model] === undefined ? n : out.counts[model]);
      console.log('§COUNT ' + model + (domain ? ' ' + JSON.stringify(domain) : '') + ' = ' + n);
      return n;
    } catch (e) {
      console.log('§ABSENT ' + model + ' — ' + e.message);
      if (out.absent.indexOf(model) < 0) out.absent.push(model);
      out.counts[model] = null;
      return null;
    }
  }
  async function modelExists(model) {
    try { await ex(model, 'fields_get', [[], ['type']]); return true; }
    catch (e) { console.log('§ABSENT ' + model + ' — ' + e.message); if (out.absent.indexOf(model) < 0) out.absent.push(model); return false; }
  }

  // ── INSTALLED MODULES (functional scope) ──
  var mods = await ex('ir.module.module', 'search_read', [[['state', '=', 'installed']]], { fields: ['name', 'shortdesc', 'category_id'], order: 'name' });
  out.modules = mods.map(function (m) { return { name: m.name, label: m.shortdesc, category: m.category_id ? m.category_id[1] : '' }; });
  console.log('§MODULES installed=' + mods.length);
  mods.forEach(function (m) { console.log('   mod ' + m.name + ' | ' + (m.category_id ? m.category_id[1] : '') + ' | ' + m.shortdesc); });

  // ── MASTER DATA ──
  console.log('\n── MASTER DATA ──');
  await count('res.partner');
  await count('res.partner', [['customer_rank', '>', 0]]); out.splits['res.partner.customer'] = out.counts['res.partner'] != null ? await ex('res.partner','search_count',[[['customer_rank','>',0]]]) : null;
  await count('res.company');
  await count('res.currency');
  await count('product.template');
  await count('product.product');
  await count('product.category');
  await count('uom.uom');
  await count('account.account');
  await count('account.journal');
  await count('account.tax');
  await count('account.payment.term');
  await count('account.fiscal.position');

  // ── SALES / CRM ──
  console.log('\n── SALES / CRM ──');
  await count('sale.order');
  if ((await modelExists('sale.order'))) {
    var soStates = await ex('sale.order', 'read_group', [[], ['state'], ['state']]);
    out.splits['sale.order.state'] = soStates.map(function (g) { return { state: g.state, n: g.state_count }; });
    console.log('§SPLIT sale.order.state ' + JSON.stringify(out.splits['sale.order.state']));
  }
  await count('sale.order.line');
  await count('crm.lead');

  // ── PURCHASE ──
  console.log('\n── PURCHASE ──');
  await count('purchase.order');
  if ((await modelExists('purchase.order'))) {
    var poStates = await ex('purchase.order', 'read_group', [[], ['state'], ['state']]);
    out.splits['purchase.order.state'] = poStates.map(function (g) { return { state: g.state, n: g.state_count }; });
    console.log('§SPLIT purchase.order.state ' + JSON.stringify(out.splits['purchase.order.state']));
  }
  await count('purchase.order.line');

  // ── INVENTORY ──
  console.log('\n── INVENTORY ──');
  await count('stock.picking');
  if ((await modelExists('stock.picking'))) {
    var pkStates = await ex('stock.picking', 'read_group', [[], ['state'], ['state']]);
    out.splits['stock.picking.state'] = pkStates.map(function (g) { return { state: g.state, n: g.state_count }; });
    console.log('§SPLIT stock.picking.state ' + JSON.stringify(out.splits['stock.picking.state']));
  }
  await count('stock.move');
  await count('stock.move.line');
  await count('stock.quant');
  await count('stock.location');
  await count('stock.warehouse');
  await count('stock.valuation.layer');

  // ── ACCOUNTING ──
  console.log('\n── ACCOUNTING ──');
  await count('account.move');
  if ((await modelExists('account.move'))) {
    var mtGroups = await ex('account.move', 'read_group', [[], ['move_type'], ['move_type']]);
    out.splits['account.move.move_type'] = mtGroups.map(function (g) { return { move_type: g.move_type, n: g.move_type_count }; });
    console.log('§SPLIT account.move.move_type ' + JSON.stringify(out.splits['account.move.move_type']));
    var stGroups = await ex('account.move', 'read_group', [[], ['state'], ['state']]);
    out.splits['account.move.state'] = stGroups.map(function (g) { return { state: g.state, n: g.state_count }; });
    console.log('§SPLIT account.move.state ' + JSON.stringify(out.splits['account.move.state']));
  }
  await count('account.move.line');
  await count('account.payment');
  if ((await modelExists('account.payment'))) {
    var payStates = await ex('account.payment', 'read_group', [[], ['state'], ['state']]);
    out.splits['account.payment.state'] = payStates.map(function (g) { return { state: g.state, n: g.state_count }; });
    console.log('§SPLIT account.payment.state ' + JSON.stringify(out.splits['account.payment.state']));
  }
  await count('account.bank.statement');
  await count('account.bank.statement.line');
  await count('account.full.reconcile');
  await count('account.partial.reconcile');
  await count('account.analytic.line');
  await count('account.analytic.account');

  // ── REPORTING (Odoo analogue of PA_Report / AD_PrintFormat / T_*) ──
  console.log('\n── REPORTING ──');
  await count('account.report');
  if (await modelExists('account.report')) {
    var reps = await ex('account.report', 'search_read', [[]], { fields: ['name'], limit: 40 });
    out.samples['account.report'] = reps.map(function (r) { return r.name; });
    console.log('§SAMPLE account.report ' + JSON.stringify(out.samples['account.report']));
  }
  await count('account.report.line');
  await count('ir.actions.report');
  if (await modelExists('ir.actions.report')) {
    var qrep = await ex('ir.actions.report', 'search_read', [[]], { fields: ['name', 'report_name', 'model'], limit: 60, order: 'model' });
    out.samples['ir.actions.report'] = qrep.map(function (r) { return { name: r.name, report_name: r.report_name, model: r.model }; });
    console.log('§COUNT ir.actions.report.sample (first ' + qrep.length + '):');
    qrep.forEach(function (r) { console.log('   qweb ' + r.model + ' | ' + r.name + ' | ' + r.report_name); });
  }

  // ── CONFIG / AUTOMATION ──
  console.log('\n── CONFIG / AUTOMATION ──');
  await count('base.automation');
  if (await modelExists('base.automation')) {
    var bas = await ex('base.automation', 'search_read', [[]], { fields: ['name', 'model_id', 'trigger'], limit: 40 });
    out.samples['base.automation'] = bas.map(function (b) { return { name: b.name, model: b.model_id ? b.model_id[1] : '', trigger: b.trigger }; });
    console.log('§SAMPLE base.automation ' + JSON.stringify(out.samples['base.automation']));
  }
  await count('ir.cron');
  await count('ir.actions.server');
  await count('mail.template');

  // ── OTHER INSTALLED APPS WITH DATA ──
  console.log('\n── OTHER APPS ──');
  await count('mrp.production');
  await count('mrp.bom');
  await count('project.project');
  await count('project.task');
  await count('hr.employee');
  await count('pos.order');
  await count('repair.order');
  await count('account.asset');
  await count('sale.subscription');
  await count('helpdesk.ticket');

  fs.writeFileSync(__dirname + '/odoo_survey.json', JSON.stringify(out, null, 2));
  console.log('\n§SURVEY DONE wrote odoo_survey.json modules=' + out.modules.length + ' models_counted=' + Object.keys(out.counts).length + ' absent=' + out.absent.length);
})().catch(function (e) { console.error('§SURVEY ERROR', e.message); process.exit(2); });
