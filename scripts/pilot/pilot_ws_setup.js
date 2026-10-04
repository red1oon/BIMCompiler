// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_ws_setup.js — register the ADInterface WS_WebServiceType rows the replay driver needs, IN THE PILOT COPY DB ONLY.
// Why this route: iDempiere's own web-service layer (org.idempiere.webservices ModelADServiceImpl) runs PO.save()
// (beforeSave/afterSave + model validators) and setDocAction → po.processIt() — i.e. the real model layer, no re-implementation.
// It requires per-table type rows + a column whitelist (WS_WebServiceFieldInput) — config the target instance owns
// (bim-ootb erp_rest_push.js header, §5). Idempotent: ids 900000+, deleted+re-inserted each run.
// Usage: node pilot_ws_setup.js [table ...]   (default = the O2C/P2P set)
'use strict';
const cfg = require('./pilot_cfg');
if (cfg.PG_DB === 'idempiere') { console.error('§PILOT-WS REFUSED: will not touch the idempiere reference DB'); process.exit(2); }
const tables = process.argv.slice(2).length ? process.argv.slice(2) :
  ['C_Order', 'C_OrderLine', 'C_Invoice', 'C_InvoiceLine', 'M_InOut', 'M_InOutLine', 'C_Payment', 'C_AllocationHdr', 'C_AllocationLine'];
const METHOD = { createData: 50024, updateData: 50025, setDocAction: 50021 };
let sql = 'BEGIN;\nDELETE FROM ws_webservicefieldinput WHERE ws_webservicetype_id>=900000;\nDELETE FROM ws_webservice_para WHERE ws_webservicetype_id>=900000;\nDELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id>=900000;\nDELETE FROM ws_webservicetype WHERE ws_webservicetype_id>=900000;\n';
let tid = 900000, pid = 900000, fid = 900000;
const types = [];
for (const t of tables) {
  const tab = cfg.psql("select ad_table_id from ad_table where upper(tablename)=upper('" + t + "')")[0];
  if (!tab) { console.log('§PILOT-WS skip table=' + t + ' (not in AD_Table)'); continue; }
  const tblId = tab[0];
  for (const m of ['createData', 'updateData', 'setDocAction']) {
    if (m === 'setDocAction' && !/^(C_Order|C_Invoice|M_InOut|C_Payment|C_AllocationHdr|M_Movement|M_Inventory|GL_Journal|C_BankStatement|C_Cash)$/i.test(t)) continue;
    const name = 'Pilot_' + m + '_' + t, id = tid++;
    types.push({ name, m, t });
    sql += `INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
      VALUES (${cfg.CLIENT_ID},0,${tblId},'Y','${name}','${name}',50001,${METHOD[m]},${id},gen_random_uuid(),now(),100,now(),100);\n`;
    sql += `INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (${cfg.CLIENT_ID},0,${cfg.WS_ROLE},100,100,${id},gen_random_uuid());\n`;
    const paras = m === 'setDocAction'
      ? [['tableName', 'C', t], ['recordID', 'F', ''], ['docAction', 'F', '']]
      : [['TableName', 'C', t], ['RecordID', 'F', ''], ['Action', 'C', m === 'createData' ? 'Create' : 'Update']];
    for (const [pn, pt, pv] of paras)
      sql += `INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby)
        VALUES (${cfg.CLIENT_ID},0,'${pv}','${pn}','${pt}',${pid++},${id},gen_random_uuid(),100,100);\n`;
    if (m !== 'setDocAction')
      sql += `INSERT INTO ws_webservicefieldinput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ad_reference_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
        SELECT ${cfg.CLIENT_ID},0,c.ad_column_id,${id},c.ad_reference_id,${fid}+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100
        FROM ad_column c WHERE c.ad_table_id=${tblId} AND c.isactive='Y' AND c.columnsql IS NULL AND c.ad_reference_id<>28;\n`;
    fid += 1000;
  }
}
sql += 'COMMIT;\n';
cfg.psql(sql);
const n = cfg.psql("select count(*) from ws_webservicetype where ws_webservicetype_id>=900000")[0][0];
const f = cfg.psql("select count(*) from ws_webservicefieldinput where ws_webservicetype_id>=900000")[0][0];
console.log('§PILOT-WS db=' + cfg.PG_DB + ' types=' + n + ' fieldInputs=' + f + ' tables=' + tables.length + ' (server caches WS config — restart or first-use after this run)');
