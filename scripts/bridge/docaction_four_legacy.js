// ⚠ DO NOT REMOVE — the legacy side of W-DOCACTION-4 (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.21 PORT SPEC): make a document on the shared pilot through its OWN WebServices
// (Bridge_createData_<T>, BridgeDocAction<T>, config rows scripts/bridge/pilot/ws_port_four.sql), run a doc action as a user does, and READ the facts back from the pilot database (docker psql, read-only).
// Nothing here knows what a Requisition IS: a table + a row of columns in, ids + facts out. Every call prints a § line; READ THE LOG.
'use strict';
const { execFileSync } = require('child_process');
const { cfgFromEnv, composite, docAction } = require('./ad_client');
const cfg = cfgFromEnv();
const F = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-AtF', '|', '-c', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
const rows = (sql) => pg(sql);
const one = (sql) => (pg(sql)[0] || null);
// create ONE row; returns { ok, id, error }
async function create(table, row) {
  const r = await composite(cfg, 'SyncOrder', [{ TargetPort: 'createData', ModelCRUD: { serviceType: 'Bridge_createData_' + table, DataRow: F(row) } }]);
  return { ok: r.ok, id: r.ok ? Number(r.ids[0]) : null, error: r.error || null };
}
async function update(table, id, row) {
  const r = await composite(cfg, 'SyncOrder', [{ TargetPort: 'updateData', ModelCRUD: { serviceType: 'Bridge_updateData_' + table, RecordID: id, DataRow: F(row) } }]);
  return { ok: r.ok, error: r.error || null };
}
// run a doc action as its OWN transaction, as the window does; the server's text comes back
async function act(type, table, id, action) { const r = await docAction(cfg, type, table, id, action); return { ok: r.ok, error: r.error }; }
module.exports = { cfg, create, update, act, pg, rows, one };
