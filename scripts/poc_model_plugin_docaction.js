// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-MODEL-PLUGIN (prompts/ERP_MODEL_LAYER.md §WITNESS). THE ISSUE: "Ninja/plugin handling is the ONE core extension
//   enabler: a staged module must get full window, model and doc-action behaviour with zero host code" (CLAUDE.md AD-LAYER
//   LAW 6). Proves a bundle loaded through the SHIPPED plugin_registry.js can bring its own DocAction class for a table the
//   host has never heard of, and that ModelLayer.run completes a record of it with ALL its writes in ONE op-group.
//   Falsifier: the same run WITHOUT the bundle must refuse (no class registered) — else the witness proves nothing.
// §-log first — READ the log. Run: node scripts/poc_model_plugin_docaction.js > build/erp/poc_model_plugin_docaction.log
'use strict';
const path = require('path'), Database = require('better-sqlite3');
const OOTB = process.env.OOTB || '/home/red1/bim-ootb';
const ML = require(path.join(OOTB, 'erp/model_layer.js')), PR = require(path.join(OOTB, 'erp/plugin_registry.js'));
const db = new Database(':memory:');
db.exec("CREATE TABLE x_trip (x_trip_id INTEGER, ad_client_id, ad_org_id, isactive, documentno, docstatus, docaction, processed, isapproved, amt NUMERIC)");
db.exec("CREATE TABLE x_trip_ledger (x_trip_ledger_id INTEGER, ad_client_id, ad_org_id, isactive, x_trip_id, amt NUMERIC, processed, processing, posted)");
db.exec("INSERT INTO x_trip VALUES (1, 11, 11, 'Y', 'T-1', 'DR', 'CO', 'N', 'N', 42.5)");
const query = (sql, p) => db.prepare(sql).all(...(p || []));
const env = { client: 11, org: 11, noPost: true };
let ok = 0, fail = 0; const V = (c, n, d) => { console.log((c ? '  PASS ' : '  FAIL ') + n + (d ? '  ' + d : '')); c ? ok++ : fail++; };
// falsifier first: no class → refusal
const r0 = ML.run(query, Object.assign({ noWorkflow: true }, env), { table: 'x_trip', timing: 'DOCACTION', id: 1, action: 'CO' });
console.log('§MODEL-PLUGIN-FALSIFIER ok=' + r0.ok + ' msg="' + r0.msg + '" ops=' + r0.ops.length);
V(!r0.ok && r0.ops.length === 0, 'no bundle → DocAction refused, nothing written');
const bundle = { manifest: { id: 'x.trip', version: '1.0.0' }, activate(ctx) {
  ctx.docAction.registerDocAction('x_trip', {
    prepareIt(trx, d) { return Number(d.amt) > 0 ? 'IP' : 'IN'; },
    completeIt(trx, d) { trx.insert('x_trip_ledger', { ad_org_id: d.ad_org_id, x_trip_id: d.x_trip_id, amt: d.amt, processed: 'Y' }); trx.update('x_trip', d, { processed: 'Y', isapproved: 'Y', docaction: 'CL' }); return 'CO'; }
  }); } };
const reg = PR.create({ docAction: ML, engineVersion: '1.0.0' });
reg.installBundle(bundle).then(() => reg.startBundle('x.trip')).then(() => {
  const r = ML.run(query, Object.assign({ noWorkflow: true }, env), { table: 'x_trip', timing: 'DOCACTION', id: 1, action: 'CO' });
  console.log('§MODEL-PLUGIN table=x_trip ok=' + r.ok + ' status=' + r.status + ' ops=' + r.ops.length + ' ' + JSON.stringify(r.ops.map(o => o.op_type + ':' + o.table)));
  V(r.ok && r.status === 'CO', 'bundle class completes the record');
  V(r.ops.some(o => o.op_type === 'CRUD_CREATE' && o.table === 'x_trip_ledger') && r.ops.some(o => o.op_type === 'CRUD_UPDATE' && o.table === 'x_trip' && o.changes.docstatus && o.changes.docstatus.new === 'CO'),
    'its writes (ledger row + header processed/docstatus) are ONE returned op-group');
  console.log('§MODEL-PLUGIN-SUMMARY pass=' + ok + ' fail=' + fail + (ok + fail ? '' : ' INCONCLUSIVE'));
  process.exit(fail ? 1 : 0);
}).catch(e => { console.log('§MODEL-PLUGIN ERROR ' + e.message); process.exit(1); });
