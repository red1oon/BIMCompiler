// ⚠ DO NOT REMOVE — LEGACY arm of LOCAL NUMBERING (prompts/TEAMWORK_FRAMEWORK.md §48.11b/§48.11c piece 6/§48.11d). READ THE LOG after every run.
// THE ISSUE it measures: does LEGACY, given the same sequence format the twin's Team overlay applies (@AD_Org_ID.Value/K@-@#AD_User_Value/K@-) and its own login rule
// (AD_Rule groovy:TeamStationUserValue, EventType L), number each login user's documents OrgValue-UserValue-n with its own running number? The twin replays the same
// config and compares position by position (erp/tests/witness_docno_till.js D20).
// Setup on the LOCAL pilot only (throwaway rows, NC3 pattern): one sequence + one doc type named DTLN-<tag>; GardenUser gets role 102 for the run (the WS create type is
// granted to 102) and loses it again at the end, so the pilot ends as it started apart from the throwaway rows and the draft orders. Writes out/docno_station_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pgw = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const FORMAT = '@AD_Org_ID.Value/K@-@#AD_User_Value/K@-', START = 1000;
const USERS = { gardenad: { user: 'GardenAdmin', pass: 'GardenAdmin', id: 101 }, gardenusr: { user: 'GardenUser', pass: 'GardenUser', id: 102 } };
const PLAN = ['gardenad', 'gardenusr', 'gardenad', 'gardenad', 'gardenusr'];          // interleaved, as W-DOCNO-TILL D1
const BPS = [[112, 108], [117, 112], [118, 113], [119, 116], [120, 114]];               // distinct partners: C_Order's unique key is (DocumentNo, C_DocType_ID, C_BPartner_ID)
(async () => {
  const rule = pgw("select ad_rule_id from ad_rule where value='groovy:TeamStationUserValue' and isactive='Y'");
  if (!rule.length) { log('§DSL INCONCLUSIVE no login rule groovy:TeamStationUserValue on the pilot'); process.exit(2); }
  const sid = +pgw("select nextidfunc((select ad_sequence_id from ad_sequence where name='AD_Sequence')::int,'N'::varchar)")[0][0];
  pgw(`insert into ad_sequence(ad_sequence_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,description,vformat,isautosequence,incrementno,startno,currentnext,currentnextsys,isaudited,istableid,prefix,suffix,startnewyear,datecolumn,decimalpattern,ad_sequence_uu,startnewmonth,isorglevelsequence,orgcolumn) values (${sid},11,0,'Y',now(),100,now(),100,'DTLN-${tag}','DTLN throwaway (TEAMWORK §48.11c)',null,'Y',1,${START},${START},100,'N','N','${FORMAT}',null,'N',null,null,gen_random_uuid(),'N','N',null)`);
  const did = +pgw("select nextidfunc((select ad_sequence_id from ad_sequence where name='C_DocType')::int,'N'::varchar)")[0][0];
  pgw(`create temp table t as select * from c_doctype where c_doctype_id=132; update t set c_doctype_id=${did}, name='DTLN-${tag}', printname='DTLN-${tag}', description='DTLN throwaway', docnosequence_id=${sid}, c_doctype_uu=gen_random_uuid(), isdefault='N'; insert into c_doctype select * from t`);
  const granted = !pgw('select 1 from ad_user_roles where ad_user_id=102 and ad_role_id=102').length;
  if (granted) pgw("insert into ad_user_roles(ad_user_id,ad_role_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,ad_user_roles_uu) values (102,102,11,0,'Y',now(),100,now(),100,gen_random_uuid())");
  log(`§DSL setup seq=${sid} doctype=${did} prefix=${FORMAT} start=${START} rule=${rule[0][0]} granted_role102_to_GardenUser=${granted}`);
  const out = { tag, sid, did, format: FORMAT, start: START, plan: PLAN, numbers: [] };
  try {
    let i = 0; for (const u of PLAN) {
      const [bp, loc] = BPS[i++ % BPS.length], cfg = ad.cfgFromEnv(Object.assign({}, process.env, { BRIDGE_USER: USERS[u].user, BRIDGE_PASS: USERS[u].pass, BRIDGE_ROLE: '102' }));
      const r = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Pilot_createData_C_Order', TableName: 'C_Order', RecordID: 0, Action: 'Create', DataRow: f({ AD_Org_ID: 11, C_DocTypeTarget_ID: did, C_DocType_ID: did, IsSOTrx: 'Y', C_BPartner_ID: bp, C_BPartner_Location_ID: loc, Bill_BPartner_ID: bp, Bill_Location_ID: loc, M_Warehouse_ID: 103, C_Currency_ID: 100, C_PaymentTerm_ID: 105, DateOrdered: '2026-10-31 00:00:00', DateAcct: '2026-10-31 00:00:00' }) } });
      const id = +r.StandardResponse['@RecordID'], dn = pgw(`select documentno, createdby from c_order where c_order_id=${id}`)[0];
      out.numbers.push({ user: u, order: id, documentno: dn[0], createdby: +dn[1] }); log(`§DSL login=${USERS[u].user} (${u}) -> C_Order ${id} DocumentNo=${dn[0]} createdby=${dn[1]}`);
    }
    out.keys = pgw(`select sequencekey, currentnext from ad_sequence_no where ad_sequence_id=${sid} order by 1`).map(r => ({ key: r[0], currentnext: +r[1] }));
    log('§DSL AD_Sequence_No ' + JSON.stringify(out.keys));
  } finally {
    if (granted) { pgw('delete from ad_user_roles where ad_user_id=102 and ad_role_id=102'); log('§DSL restored: role 102 removed from GardenUser'); }
  }
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'docno_station_legacy.json'), JSON.stringify(out, null, 1)); log('§DSL DONE');
})().catch(e => { console.log('§DSL CRASH ' + (e.stack || e)); process.exit(2); });
