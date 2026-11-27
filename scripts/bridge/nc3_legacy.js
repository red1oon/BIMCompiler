// §NC-3 legacy measurement (prompts/ERP_DEPTH_FILM.md §NC-3): document numbering x calendar on the LOCAL pilot. Three throwaway document sequences + doc types
// (psql config rows, named NC3-*) and draft Sales Orders created through the WS with different DateOrdered values; DocumentNo read back. Writes out/nc3_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pgw = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const create = async (t, o) => +(await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Pilot_createData_' + t, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } })).StandardResponse['@RecordID'];
const BPS = [[112, 108], [117, 112], [118, 113], [119, 116], [120, 114], [121, 115], [200000, 200002]];   // distinct partners: C_Order's unique key is (DocumentNo, C_DocType_ID, C_BPartner_ID)
const SEQS = {
  A: { name: `NC3-A-${tag}`, sny: 'Y', snm: 'N', dc: 'DateOrdered', prefix: 'A-', dp: '0000', dates: ['2025-12-30', '2025-12-31', '2026-01-02', '2025-12-29', '2026-01-03', '2026-01-02'] },
  B: { name: `NC3-B-${tag}`, sny: 'Y', snm: 'Y', dc: 'DateOrdered', prefix: 'B', dp: '000', dates: ['2026-01-31', '2026-02-01', '2026-01-15', '2026-02-02'] },
  C: { name: `NC3-C-${tag}`, sny: 'Y', snm: 'N', dc: '', prefix: 'C', dp: '00', dates: ['2025-03-01', '2026-03-01', '2024-03-01'] },
};
(async () => {
  pgw("delete from ad_sequence where name like 'NC3-%' and ad_sequence_id not in (select docnosequence_id from c_doctype where docnosequence_id is not null)");
  const out = { tag, seqs: {} };
  for (const [k, s] of Object.entries(SEQS)) {
    const sid = +pgw("select nextidfunc((select ad_sequence_id from ad_sequence where name='AD_Sequence')::int,'N'::varchar)")[0][0];
    pgw(`insert into ad_sequence(ad_sequence_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,description,vformat,isautosequence,incrementno,startno,currentnext,currentnextsys,isaudited,istableid,prefix,suffix,startnewyear,datecolumn,decimalpattern,ad_sequence_uu,startnewmonth,isorglevelsequence,orgcolumn) values (${sid},11,0,'Y',now(),100,now(),100,'${s.name}','NC3 throwaway',null,'Y',1,1,1,100,'N','N','${s.prefix}',null,'${s.sny}',${s.dc ? `'${s.dc}'` : 'null'},'${s.dp}',gen_random_uuid(),'${s.snm}','N',null)`);
    const did = +pgw("select nextidfunc((select ad_sequence_id from ad_sequence where name='C_DocType')::int,'N'::varchar)")[0][0];
    pgw(`create temp table t as select * from c_doctype where c_doctype_id=132; update t set c_doctype_id=${did}, name='${s.name}', printname='${s.name}', description='NC3 throwaway', docnosequence_id=${sid}, c_doctype_uu=gen_random_uuid(), isdefault='N'; insert into c_doctype select * from t`);
    out.seqs[k] = { sid, did, name: s.name, dates: s.dates, numbers: [] };
  }
  fs.writeFileSync('/tmp/nc3_setup.json', JSON.stringify(out));
  const caches = () => ad.call; // cache reset: the server reads AD_Sequence/C_DocType through PO cache; a restart-free path is the cache reset below
  for (const [k, s] of Object.entries(out.seqs)) {
    let bi = 0; for (const d of s.dates) {  const [bp, loc] = BPS[bi++ % BPS.length];
      const id = await create('C_Order', { AD_Org_ID: 11, C_DocTypeTarget_ID: s.did, C_DocType_ID: s.did, IsSOTrx: 'Y', C_BPartner_ID: bp, C_BPartner_Location_ID: loc, Bill_BPartner_ID: bp, Bill_Location_ID: loc, M_Warehouse_ID: 103, C_Currency_ID: 100, C_PaymentTerm_ID: 105, DateOrdered: d + ' 00:00:00', DateAcct: d + ' 00:00:00' });
      const dn = pgw(`select documentno from c_order where c_order_id=${id}`)[0][0];
      s.numbers.push(dn); log(`§NC3L seq=${k} DateOrdered=${d} -> DocumentNo=${dn}`);
    }
  }
  out.today = pgw('select current_date')[0][0];
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc3_legacy.json'), JSON.stringify(out, null, 1)); log('§NC3L DONE');
})().catch(e => { console.log('§NC3L CRASH ' + (e.stack || e)); process.exit(2); });
