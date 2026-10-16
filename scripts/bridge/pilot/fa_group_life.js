// ⚠ DO NOT REMOVE — PILOT fixture, spec §63 (Q-FA answered): set / restore the Equipment asset group's use life on legacy THROUGH THE WEBSERVICES
// as a normal user (GardenAdmin, role 102) — the way a legacy user keys it in the Asset Group window. Never direct SQL. Read the log.
//   node scripts/bridge/pilot/fa_group_life.js show|set|restore
'use strict';
const { cfgFromEnv, call, query } = require('../ad_client');
// A_Asset_Group_Acct rows of group 50007 Equipment: 200002 = schema 101, 200005 = schema 200000. BEFORE = the pilot values read (psql oracle) 2026-10-10.
const BEFORE = { 200002: { UseLifeMonths: 0, UseLifeYears: 0, UseLifeMonths_F: 60, UseLifeYears_F: 5 }, 200005: { UseLifeMonths: 0, UseLifeYears: 0, UseLifeMonths_F: 0, UseLifeYears_F: 0 } };
const SET = { UseLifeMonths: 60, UseLifeYears: 5, UseLifeMonths_F: 60, UseLifeYears_F: 5 };   // 60 months = the fiscal life the pilot already carries on schema 101
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
const show = async tag => { for (const id of Object.keys(BEFORE)) { const r = (await query(cfg, 'QueryAAssetGroupAcct', `A_Asset_Group_Acct_ID=${id}`))[0] || {};
  console.log(`§FA_GROUP_LIFE ${tag} row=${id} schema=${r.C_AcctSchema_ID} C=${r.UseLifeMonths}m/${Number(r.UseLifeYears)}y F=${r.UseLifeMonths_F}m/${Number(r.UseLifeYears_F)}y`); } };
(async () => {
  const mode = process.argv[2] || 'show';
  await show('before');
  if (mode === 'set' || mode === 'restore') for (const id of Object.keys(BEFORE)) {
    const v = mode === 'set' ? SET : BEFORE[id];
    await call(cfg, 'update_data', { ModelCRUD: { serviceType: 'BridgeUpdateAssetGroupAcct', TableName: 'A_Asset_Group_Acct', RecordID: +id, Action: 'Update',
      DataRow: { field: Object.entries(v).map(([k, x]) => ({ '@column': k, val: x })) } } });
  }
  if (mode !== 'show') await show('after');
})().catch(e => { console.log('§FA_GROUP_LIFE ERROR ' + e.message); process.exit(1); });
