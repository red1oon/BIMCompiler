// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_ref.js — drive REAL iDempiere through its own ADInterface web-service layer (ModelADServiceImpl: createData =
// PO.save with beforeSave/afterSave/validators; setDocAction = po.processIt(action)). Wire contract = idempiere-schema.xsd
// (same as bim-ootb viewer/erp_rest_push.js, PR #1701). Reads go straight to PG (the DB is the oracle) — see pilot_ref_state.
'use strict';
const cfg = require('./pilot_cfg');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const loginXml = () => '<ADLoginRequest><user>' + esc(cfg.WS_USER) + '</user><pass>' + esc(cfg.WS_PASS) + '</pass><lang>en_US</lang><ClientID>' +
  cfg.CLIENT_ID + '</ClientID><RoleID>' + cfg.WS_ROLE + '</RoleID><OrgID>' + cfg.WS_ORG + '</OrgID><WarehouseID>' + cfg.WS_WH + '</WarehouseID><stage>0</stage></ADLoginRequest>';
const wsVal = v => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v)) ? v + ' 00:00:00' : v;   // WS Timestamp format
const NS = ' xmlns="http://idempiere.org/ADInterface/1_0"';
async function post(path, body) {
  const r = await fetch(cfg.WS_BASE + '/ADInterface/services/rest/model_adservice/' + path, { method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/xml' }, body });
  return { status: r.status, text: await r.text() };
}
function parseStd(xml) {
  const a = n => { const m = xml.match(new RegExp('<(?:\\w+:)?StandardResponse\\b[^>]*\\b' + n + '="([^"]*)"')); return m ? m[1] : null; };
  const e = xml.match(/<(?:\w+:)?Error>([\s\S]*?)<\/(?:\w+:)?Error>/);
  return { isError: a('IsError') === 'true' || (!/StandardResponse/.test(xml)), recordId: a('RecordID') != null ? Number(a('RecordID')) : null, error: e ? e[1] : (/StandardResponse/.test(xml) ? null : xml.slice(0, 300)) };
}
// create: fields = { ColumnName: value }. Returns {ok,id,error}
async function create(table, fields) {
  const f = Object.keys(fields).map(k => '<field column="' + esc(k) + '"><val>' + esc(wsVal(fields[k])) + '</val></field>').join('');
  const body = '<?xml version="1.0" encoding="UTF-8"?><ModelCRUDRequest' + NS + '><ModelCRUD><serviceType>Pilot_createData_' + table + '</serviceType><TableName>' + table +
    '</TableName><RecordID>0</RecordID><Action>Create</Action><DataRow>' + f + '</DataRow></ModelCRUD>' + loginXml() + '</ModelCRUDRequest>';
  const r = await post('create_data', body); const p = parseStd(r.text);
  return { ok: !p.isError && p.recordId > 0, id: p.recordId, error: p.error, http: r.status };
}
async function update(table, id, fields) {
  const f = Object.keys(fields).map(k => '<field column="' + esc(k) + '"><val>' + esc(wsVal(fields[k])) + '</val></field>').join('');
  const body = '<?xml version="1.0" encoding="UTF-8"?><ModelCRUDRequest' + NS + '><ModelCRUD><serviceType>Pilot_updateData_' + table + '</serviceType><TableName>' + table +
    '</TableName><RecordID>' + id + '</RecordID><Action>Update</Action><DataRow>' + f + '</DataRow></ModelCRUD>' + loginXml() + '</ModelCRUDRequest>';
  const r = await post('update_data', body); const p = parseStd(r.text);
  return { ok: !p.isError, id: p.recordId, error: p.error, http: r.status };
}
async function docAction(table, id, action) {
  const body = '<?xml version="1.0" encoding="UTF-8"?><ModelSetDocActionRequest' + NS + '><ModelSetDocAction><serviceType>Pilot_setDocAction_' + table + '</serviceType><tableName>' + table +
    '</tableName><recordID>' + id + '</recordID><docAction>' + action + '</docAction></ModelSetDocAction>' + loginXml() + '</ModelSetDocActionRequest>';
  const r = await post('set_docaction', body); const p = parseStd(r.text);
  return { ok: !p.isError, id: p.recordId, error: p.error, http: r.status };
}
module.exports = { create, update, docAction };
if (require.main === module) {   // smoke: node pilot_ref.js  → §PILOT-REF login + a read-only-ish probe via a docAction on a nonexistent id
  (async () => {
    const r = await docAction('C_Order', 99999999, 'CO');
    console.log('§PILOT-REF-WS smoke setDocAction(nonexistent) → ' + JSON.stringify(r));
  })();
}
