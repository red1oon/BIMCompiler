// ⚠ DO NOT REMOVE — PILOT fixture, spec §D8 (user agreed 2026-10-10): set / restore the Equipment asset group's REVALUATION COST OFFSET account on legacy
// THROUGH THE WEBSERVICES as a normal user (GardenAdmin, role 102) — the way a legacy user keys it in the Asset Group window. Never direct SQL. Read the log.
//   node scripts/bridge/pilot/fa_group_reval_offset.js show|set|restore
// Same class as Q-FA (fa_group_life.js): before/after printed as §FA_REVAL_OFFSET lines, restorable.
'use strict';
const { cfgFromEnv, call, query } = require('../ad_client');
// A_Asset_Group_Acct rows of group 50007 Equipment (200002 = schema 101, 200005 = schema 200000). BEFORE = pilot values read 2026-10-11 (psql oracle, read-only): A_Reval_Cost_Offset_Acct EMPTY on both.
const BEFORE = { 200002: null, 200005: null };
// SET = an existing GardenWorld valid combination per schema, same account element 80530 "Unrealized gain" (c_validcombination 243 @101, 200025 @200000, org 11):
// the formula judged is Dr Asset/Cr Offset + Dr Offset/Cr AccumDep (Doc_AssetReval), not the account's meaning; GardenWorld carries no reval-reserve combination, so none is invented.
const SET = { 200002: 243, 200005: 200025 };
const COL = 'A_Reval_Cost_Offset_Acct';
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
const show = async tag => { for (const id of Object.keys(BEFORE)) { const r = (await query(cfg, 'QueryAAssetGroupAcct', `A_Asset_Group_Acct_ID=${id}`))[0] || {};
  console.log(`§FA_REVAL_OFFSET ${tag} row=${id} schema=${r.C_AcctSchema_ID} ${COL}=${r[COL] == null ? 'EMPTY' : r[COL]}`); } };
(async () => {
  const mode = process.argv[2] || 'show';
  await show('before');
  if (mode === 'set' || mode === 'restore') for (const id of Object.keys(BEFORE)) {
    const v = mode === 'set' ? SET[id] : BEFORE[id];
    await call(cfg, 'update_data', { ModelCRUD: { serviceType: 'BridgeUpdateAssetGroupAcct', TableName: 'A_Asset_Group_Acct', RecordID: +id, Action: 'Update',
      DataRow: { field: [{ '@column': COL, val: v == null ? { '@nil': true } : v }] } } });
  }
  if (mode !== 'show') await show('after');
})().catch(e => { console.log('§FA_REVAL_OFFSET ERROR ' + e.message); process.exit(1); });
