// ⚠ DO NOT REMOVE — LEGACY arm of W-DOCNO-TILL's TILL numbering (prompts/TEAMWORK_FRAMEWORK.md §54 L1, §48.10). READ THE LOG after every run.
// THE ISSUE it measures: does LEGACY, given the twin's till format (@AD_Org_ID.Value/K@-@C_POS_ID.Name/K@-, MSequence.java:67-72 /K key, AD_Sequence_No per key), number each till's
// documents Org-Till-n with its own running number, a till of another org its own, and an order with no till outside every till's series? The twin replays the same row and
// order and compares position by position (bim-ootb erp/tests/witness_docno_till.js L2).
// Setup on the LOCAL pilot only (throwaway rows, as docno_station_legacy.js): one sequence + one doc type named DTLT-<tag>, three C_POS rows (T1, T2 in HQ; N1 in Store North)
// cloned from the pilot's own C_POS 100. The orders are drafts made through the real WebServices as GardenAdmin (role 102). Writes out/docno_till_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pgw = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET' && !/^(INSERT|UPDATE|SELECT|DELETE|CREATE)/.test(l)).map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const FORMAT = '@AD_Org_ID.Value/K@-@C_POS_ID.Name/K@-';   // the twin's PREFIX (witness_docno_till.js), its sequence row: StartNo 1, CurrentNext 1, DecimalPattern 000000, not org-level
const ORG2 = 50002, WH = { 11: 103, [ORG2]: 50003 };
const PLAN = [['T1', 11], ['T2', 11], ['T1', 11], ['T1', 11], ['T2', 11], ['N1', ORG2], [null, 11]];   // the twin device A's order: D1-D3, then D6 (no till)
const BPS = [[112, 108], [117, 112], [118, 113], [119, 116], [120, 114], [121, 115], [200000, 200002]];   // distinct partners: C_Order's unique key is (DocumentNo, C_DocType_ID, C_BPartner_ID)
const nextId = (t) => +pgw(`select nextidfunc((select ad_sequence_id from ad_sequence where name='${t}' and istableid='Y')::int,'N'::varchar)`)[0][0];
(async () => {
  if (!pgw('select 1 from c_pos where c_pos_id=100').length) { log('§DTL INCONCLUSIVE the pilot has no C_POS 100 to clone'); process.exit(2); }
  const sid = nextId('AD_Sequence');
  pgw(`insert into ad_sequence(ad_sequence_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,description,vformat,isautosequence,incrementno,startno,currentnext,currentnextsys,isaudited,istableid,prefix,suffix,startnewyear,datecolumn,decimalpattern,ad_sequence_uu,startnewmonth,isorglevelsequence,orgcolumn) values (${sid},11,0,'Y',now(),100,now(),100,'DTLT-${tag}','DTLT throwaway (TEAMWORK §54)',null,'Y',1,1,1,100,'N','N','${FORMAT}',null,'N',null,'000000',gen_random_uuid(),'N','N',null)`);
  const did = nextId('C_DocType');
  pgw(`create temp table t as select * from c_doctype where c_doctype_id=132; update t set c_doctype_id=${did}, name='DTLT-${tag}', printname='DTLT-${tag}', description='DTLT throwaway', docnosequence_id=${sid}, c_doctype_uu=gen_random_uuid(), isdefault='N'; insert into c_doctype select * from t`);
  const pos = {};
  for (const [nm, org] of [['T1', 11], ['T2', 11], ['N1', ORG2]]) {
    const id = nextId('C_POS'); pos[nm] = id;
    pgw(`create temp table p as select * from c_pos where c_pos_id=100; update p set c_pos_id=${id}, name='${nm}', ad_org_id=${org}, m_warehouse_id=${WH[org]}, c_pos_uu=gen_random_uuid(), description='DTLT throwaway ${tag}'; insert into c_pos select * from p; drop table p`);
  }
  log(`§DTL setup seq=${sid} doctype=${did} prefix=${FORMAT} start=1 pattern=000000 pos=${JSON.stringify(pos)}`);
  const out = { tag, sid, did, format: FORMAT, plan: PLAN.map(p => p[0] || 'none'), pos, numbers: [] };
  const cfg = ad.cfgFromEnv(Object.assign({}, process.env, { BRIDGE_USER: 'GardenAdmin', BRIDGE_PASS: 'GardenAdmin', BRIDGE_ROLE: '102' }));
  let i = 0;
  for (const [till, org] of PLAN) {
    const [bp, loc] = BPS[i++ % BPS.length], row = { AD_Org_ID: org, C_DocTypeTarget_ID: did, C_DocType_ID: did, IsSOTrx: 'Y', C_BPartner_ID: bp, C_BPartner_Location_ID: loc, Bill_BPartner_ID: bp, Bill_Location_ID: loc, M_Warehouse_ID: WH[org], C_Currency_ID: 100, C_PaymentTerm_ID: 105, DateOrdered: '2026-10-31 00:00:00', DateAcct: '2026-10-31 00:00:00' };
    if (till) row.C_POS_ID = pos[till];
    const r = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Pilot_createData_C_Order', TableName: 'C_Order', RecordID: 0, Action: 'Create', DataRow: f(row) } });
    const id = +((r && r.StandardResponse) || {})['@RecordID'];
    if (!id) { log('§DTL FAIL create till=' + till + ' org=' + org + ' answer=' + JSON.stringify(r).slice(0, 400)); process.exit(1); }
    const dn = pgw(`select documentno, c_pos_id, ad_org_id from c_order where c_order_id=${id}`)[0];
    out.numbers.push({ till: till || 'none', org, order: id, documentno: dn[0], c_pos_id: dn[1] ? +dn[1] : null }); log(`§DTL till=${till || 'none'} org=${org} -> C_Order ${id} DocumentNo=${dn[0]} c_pos_id=${dn[1] || '-'}`);
  }
  out.keys = pgw(`select sequencekey, currentnext from ad_sequence_no where ad_sequence_id=${sid} order by 1`).map(r => ({ key: r[0], currentnext: +r[1] }));
  log('§DTL AD_Sequence_No ' + JSON.stringify(out.keys));
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'docno_till_legacy.json'), JSON.stringify(out, null, 1)); log('§DTL DONE');
})().catch(e => { console.log('§DTL CRASH ' + (e.stack || e)); process.exit(2); });
