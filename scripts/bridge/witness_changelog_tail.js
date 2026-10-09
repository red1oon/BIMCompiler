// ⚠ DO NOT REMOVE — W10 CHANGELOG-TAIL. Scope: prove the Bridge change-log tracker against the LOCAL PILOT iDempiere.
// Spec: prompts/SQLiteIDEMPIERE.md §4/§12/§8-W10. READ THE LOG after every run (exit code is not evidence).
// Needs: docker postgres (db idempiere_pilot), pilot server :8088, pilot/ws_changelog_read.sql + ws_test_access.sql applied.
// Issues proved/disproved (each §-line names one):
//  §W10_COMPLETE   tracker rows == DB rows after real WS traffic (nothing lost/dup)
//  §W10_DOCACTION  a WS setDocAction DR->CO is reconstructed as a docStatus transition on the right record
//  §W10_INSERT_MODE inserts visible iff SYSTEM_INSERT_CHANGELOG=Y (flashpoint for the legacy admin)
//  §W10_OWN        our WS writes classified own; foreign rows classified not-own (echo suppression basis)
//  §W10_IDEMPOTENT second poll applies zero fresh rows
//  §W10_LATE       a LOWER id committing after a higher one is caught by the window — and a window=0 tracker MISSES it
//                  (negative control: proves the witness can fail, not scope-blind)
'use strict';
const { execFileSync } = require('child_process');
const { cfgFromEnv, call } = require('./ad_client');
const { createTracker } = require('./changelog_tracker');

const cfg = cfgFromEnv();
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc',
  'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
const F = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: v })) });
let fails = 0, inconcl = 0;
const out = (tag, ok, msg) => { console.log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') inconcl++; else if (!ok) fails++; };

(async () => {
  const userId = +pg(`select ad_user_id from ad_user where name='${cfg.login.user}'`)[0];
  const log = l => console.log(l);
  const T = createTracker(cfg, { ownUserId: userId, log });
  // baseline: consume everything already there
  await T.poll();
  const wm0 = T.state.wm;
  log(`§W10_BASE wm=${wm0} user=${userId}`);

  // --- real WS traffic as a legitimate client: order -> line -> complete
  const ord = (await call(cfg, 'create_data', { ModelCRUD: { serviceType: 'createOrderRecord', DataRow: F({
    M_Warehouse_ID: 103, C_BPartner_ID: 112, C_BPartner_Location_ID: 108, Bill_BPartner_ID: 112, Bill_Location_ID: 108, C_DocTypeTarget_ID: 132 }) } })).StandardResponse['@RecordID'];
  await call(cfg, 'create_data', { ModelCRUD: { serviceType: 'CreateOrderLine', DataRow: F({
    AD_Org_ID: 11, AD_Client_ID: 11, M_Product_ID: 123, QtyEntered: 1, QtyOrdered: 1, PriceEntered: 10, PriceActual: 10, C_Order_ID: ord, Line: 10 }) } });
  await call(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'CompleteOrder', tableName: 'C_Order', recordID: ord, docAction: 'CO' } });
  log(`§W10_TRAFFIC order=${ord}`);

  const p1 = await T.poll();
  const dbRows = pg(`select ad_changelog_id||':'||ad_column_id from ad_changelog where ad_changelog_id>${wm0}`);
  const mine = new Set(p1.fresh.map(r => `${r.AD_ChangeLog_ID}:${r.AD_Column_ID}`));
  if (dbRows.length === 0) out('§W10_COMPLETE', 'INCONCLUSIVE', `db had 0 new rows — logging off for these tables? nothing judged`);
  else out('§W10_COMPLETE', dbRows.length === mine.size && dbRows.every(k => mine.has(k)), `db=${dbRows.length} tracker=${mine.size}`);

  const co = p1.events.find(e => e.table === 'C_Order' && e.record === ord && e.docStatus && e.docStatus.to === 'CO');
  out('§W10_DOCACTION', !!co && co.docStatus.from === 'DR', co ? `event=${co.id} record=${co.record} DocStatus ${co.docStatus.from}->${co.docStatus.to} trx=${co.trx}` : `no DR->CO event for order ${ord}; events=${p1.events.map(e => e.table + '#' + e.record).join(',')}`);

  // inserts are logged only when SYSTEM_INSERT_CHANGELOG=Y (PO.java:3653) — vanilla N. Tracker must agree with the setting.
  const mode = (pg("select value from ad_sysconfig where name='SYSTEM_INSERT_CHANGELOG' and ad_client_id in (0,11) order by ad_client_id desc limit 1")[0] || 'N');
  const ins_ev = p1.events.filter(e => e.event === 'I' && (e.table === 'C_Order' || e.table === 'C_OrderLine'));
  out('§W10_INSERT_MODE', mode === 'Y' ? ins_ev.length > 0 : ins_ev.length === 0, `SYSTEM_INSERT_CHANGELOG=${mode} insert_events(order/line)=${ins_ev.length} — ${mode === 'Y' ? 'drafts visible' : 'DRAFT CREATION INVISIBLE, only updates (e.g. DR->CO) are seen'}`);

  const own = p1.events.filter(e => e.own);
  out('§W10_OWN', own.length > 0 && own.every(e => e.user === userId && e.trx.startsWith('ws_')), `own_events=${own.length} of ${p1.events.length}`);

  const p2 = await T.poll();
  out('§W10_IDEMPOTENT', p2.fresh.length === 0, `fresh=${p2.fresh.length} reread=${p2.reread}`);

  // --- late commit: row N+1 commits first, row N later. Fixture rows (Description='W10-fixture'), deleted after.
  const base = +pg('select max(ad_changelog_id) from ad_changelog')[0];
  const N = base + 10, colId = +pg("select ad_column_id from ad_column where columnname='DocStatus' and ad_table_id=318")[0];
  const ins = id => pg(`insert into ad_changelog(ad_changelog_id,ad_session_id,ad_table_id,ad_column_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,record_id,oldvalue,newvalue,description,eventchangelog,trxname,ad_changelog_uu)
    values(${id},(select max(ad_session_id) from ad_session),318,${colId},11,11,'Y',now(),100,now(),100,0,'DR','CO','W10-fixture','U','fixture',gen_random_uuid()) returning 1`);
  const tWin = createTracker(cfg, { ownUserId: userId, window: 200, state: { wm: T.state.wm, seen: new Set(T.state.seen) } });
  const tNoWin = createTracker(cfg, { ownUserId: userId, window: 0, state: { wm: T.state.wm, seen: new Set(T.state.seen) } });
  try {
    ins(N + 1);
    await tWin.poll(); await tNoWin.poll();           // both see N+1, wm -> N+1
    ins(N);                                           // the late, lower id commits now
    const a = await tWin.poll(), b = await tNoWin.poll();
    const caught = a.fresh.some(r => r.AD_ChangeLog_ID === N), missed = !b.fresh.some(r => r.AD_ChangeLog_ID === N);
    out('§W10_LATE', caught && missed, `window=200 caught_N=${caught} · window=0 missed_N=${missed} (negative control must miss)`);
    const f = a.events.find(e => e.id === N);
    out('§W10_OWN_FOREIGN', !!f && f.own === false, `fixture user=100 trx=fixture own=${f && f.own}`);
  } finally {
    pg("delete from ad_changelog where description='W10-fixture'");
  }
  const verdict = fails ? 'FAIL' : inconcl ? 'INCONCLUSIVE' : 'PASS';
  console.log(`§W10_VERDICT ${verdict} fails=${fails} inconclusive=${inconcl}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§W10_VERDICT FAIL exception ' + e.stack); process.exit(2); });
