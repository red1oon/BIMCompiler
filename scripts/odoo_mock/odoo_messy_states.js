// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §HARDEN-SPEC — Witness: W-ODOO-MESSY (scripts/poc_odoo_messy.js)
// Applies real-world Odoo states (M1..M8) to the SCRATCH db odoo_messy (a pg_dump copy of odoodemo, so the recorded demo fixtures never drift), through Odoo's own ORM —
//   every state is one Odoo itself accepts. Build: scripts/odoo_mock/make_odoo_messy.sh.  Run one: node odoo_messy_states.js M1
var http = require('http'), DB = 'odoo_messy';
function rpc(s, m, a) { return new Promise(function (res, rej) { var b = JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: s, method: m, args: a } });
  var r = http.request({ host: 'localhost', port: 8069, path: '/jsonrpc', method: 'POST', headers: { 'Content-Type': 'application/json' } }, function (x) { var d = ''; x.on('data', function (c) { d += c; }); x.on('end', function () { var j = JSON.parse(d); j.error ? rej(new Error(JSON.stringify(j.error.data.message))) : res(j.result); }); });
  r.on('error', rej); r.write(b); r.end(); }); }
(async function () {
  var uid = await rpc('common', 'login', [DB, 'admin', 'admin']), ex = function (m, f, a, k) { return rpc('object', 'execute_kw', [DB, uid, 'admin', m, f, a, k || {}]); };
  var my = (await ex('res.country', 'search', [[['code', '=', 'MY']]]))[0];
  var C = {
    M1: async function () { return ex('res.partner', 'create', [{ name: 'Country Only Sdn Bhd', is_company: true, country_id: my, customer_rank: 1 }]); },
    M2: async function () { await ex('res.partner', 'create', [{ name: 'Branch North', is_company: true, street: '1 Jalan Utama', city: 'Ipoh', country_id: my }]);
                            return ex('res.partner', 'create', [{ name: 'Branch South', is_company: true, street: '1 Jalan Utama', city: 'Johor Bahru', country_id: my }]); },
    M3: async function () { var p = await ex('res.partner', 'create', [{ name: 'Old Trading Co', is_company: true, street: '9 Lorong Lama', country_id: my }]);
                            await ex('res.partner', 'create', [{ name: 'Ann Old', parent_id: p, email: 'ann@old.example' }]);
                            await ex('res.partner', 'write', [[p], { active: false }]); return p; },
    M4: async function () { await ex('product.product', 'create', [{ name: 'Widget A', default_code: 'DUP-1', list_price: 10 }]);
                            return ex('product.product', 'create', [{ name: 'Widget B', default_code: 'DUP-1', list_price: 12 }]); },
    M5: async function () { var q = await ex('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal'], ['quantity', '>', 0], ['lot_id', '=', false]]], { fields: ['product_id'], limit: 1 });
                            var pid = q[0].product_id[0], tmpl = (await ex('product.product', 'read', [[pid]], { fields: ['product_tmpl_id'] }))[0].product_tmpl_id[0];
                            await ex('product.template', 'write', [[tmpl], { active: false }]); return pid; },
    M6: async function () { return ex('res.company', 'create', [{ name: 'Second Co Sdn Bhd', country_id: my }]); },
    M7: async function () { var p = await ex('res.partner', 'create', [{ name: 'Same Street Co', is_company: true, street: '7 Jalan Sama', city: 'Klang', country_id: my }]);
                            return ex('res.partner', 'create', [{ name: 'Same Street Delivery', parent_id: p, type: 'delivery', street: '7 Jalan Sama', city: 'Klang', country_id: my }]); },
    M8: async function () { await ex('res.partner', 'create', [{ name: 'Ref Twin One', is_company: true, ref: 'C001' }]);
                            return ex('res.partner', 'create', [{ name: 'Ref Twin Two', is_company: true, ref: 'C001' }]); }
  };
  var k = process.argv[2]; console.log('§MESSY ' + k + ' applied -> ' + JSON.stringify(await C[k]()));
})().catch(function (e) { console.log('§MESSY ' + process.argv[2] + ' REFUSED-BY-ODOO ' + e.message.slice(0, 300)); });
