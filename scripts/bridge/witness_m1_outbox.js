// ⚠ DO NOT REMOVE — M1 witness: outbox + state + idmap + descriptor doc writer + pusher, vs LOCAL PILOT iDempiere.
// Spec: prompts/SQLiteIDEMPIERE.md §20 M1, §P, §Q. READ THE LOG after every run (exit code is not evidence).
// Needs: docker postgres(idempiere_pilot), pilot server :8088, pilot/*.sql applied (restart after).
// The descriptor below is TEST DATA (an app's file); the layer files (store/doc_writer/pusher/ad_client) contain no app words.
//  §M1_W1_ONECALL     each document = exactly ONE composite call; N docs ⇒ N calls; server order count +N (psql oracle)
//  §M1_W1_IDEMPOTENT  a second drain sends 0 calls and creates 0 documents
//  §M1_P15_PRICE      payload carries NO price; server priced the line from the PriceList master (== M_ProductPrice oracle)
//  §M1_W4_REJECT      unknown product ⇒ REJECTED with server text, rolled back (no orphan header), later docs still flow
//  §M1_W5_BEFORE      crash before send ⇒ resumes, exactly one document
//  §M1_W5_AFTER       crash after server commit, before local store ⇒ PARKED on recovery, NO auto-resend, no duplicate
//  §M1_NOTSENT        server unreachable ⇒ stays QUEUED, attempts capped, nothing lost; later sent once
//  §M1_AUTH           bad password ⇒ drain stops after ONE attempt (no lockout loop), rows stay QUEUED
//  §M1_W6             legacy-looks-native diff: INCONCLUSIVE until a hand-keyed reference exists (stated, not faked)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const { cfgFromEnv } = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');

const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
let fails = 0, incon = 0;
const out = (tag, ok, msg) => { console.log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };
const log = l => console.log(l);

// --- TEST DESCRIPTOR (app data): a store sale as a POS-type order. No price field anywhere.
const D = { sale: {
  composite: 'SyncOrder',
  header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: {
    M_Warehouse_ID: { const: 104 }, C_BPartner_ID: { const: 112 }, C_BPartner_Location_ID: { const: 108 },
    Bill_BPartner_ID: { const: 112 }, Bill_Location_ID: { const: 108 }, C_DocTypeTarget_ID: { const: 135 } } },
  lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: {
    AD_Org_ID: { const: 12 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
  docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' },
  expect: { serviceType: 'QueryCOrder', cols: { DocStatus: { const: 'CO' } } },
} };
const ticket = (product = 123, qty = 1) => ({ lines: [{ product, qty }] });

(async () => {
  const cfg = cfgFromEnv(); cfg.login.OrgID = 12; cfg.login.WarehouseID = 104;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm1-')); const file = path.join(tmp, 'bridge.db');
  let calls = 0; const realFetch = global.fetch;
  global.fetch = (...a) => { if (String(a[0]).includes('composite_operation')) calls++; return realFetch(...a); };
  const orders = () => +pg('select count(*) from c_order')[0];

  // ---- W1 + P15
  let s = await store.open(file);
  ['t1', 't2'].forEach(u => s.enqueue(u, 'sale', ticket()));
  const o0 = orders(); calls = 0;
  const r1 = await drain(cfg, s, D, { log });
  out('§M1_W1_ONECALL', calls === 2 && orders() === o0 + 2 && r1.confirmed === 2, `docs=2 composite_calls=${calls} server_orders+${orders() - o0} confirmed=${r1.confirmed} states=${s.states().map(x => x.state).join(',')}`);
  const c0 = calls; const o1 = orders(); await drain(cfg, s, D, { log });
  out('§M1_W1_IDEMPOTENT', calls === c0 && orders() === o1, `second drain calls+${calls - c0} orders+${orders() - o1}`);
  const hid = s.idmap('t1').find(x => x.tbl === 'C_Order').server_id;
  const line = pg(`select priceactual, priceentered, c_order_id from c_orderline where c_order_id=${hid}`)[0].split('|');
  const plist = pg(`select pp.pricestd from m_productprice pp join m_pricelist_version v using(m_pricelist_version_id) where pp.m_product_id=123 and v.m_pricelist_id=101 order by v.validfrom desc limit 1`)[0];
  out('§M1_P15_PRICE', +line[0] > 0 && Math.abs(+line[0] - +plist) < 0.005, `payload had no price; server line PriceActual=${line[0]} PriceList(101) std=${plist}`);
  const m1 = s.idmap('t1'); out('§M1_IDMAP', m1.length === 2 && !!m1.find(x => x.tbl === 'C_Order' && x.docno), `t1 map=${JSON.stringify(m1)} (header carries legacy DocumentNo; ids/numbers are legacy's own — twin §21)`);

  // ---- W4 reject + no poison
  s.enqueue('bad', 'sale', ticket(999999, 1)); s.enqueue('after-bad', 'sale', ticket());
  const o2 = orders(); const r4 = await drain(cfg, s, D, { log });
  const st = Object.fromEntries(s.states().map(x => [x.uid, x]));
  out('§M1_W4_REJECT', st.bad.state === 'REJECTED' && /M_Product_ID/.test(st.bad.error) && st['after-bad'].state === 'CONFIRMED' && orders() === o2 + 1,
    `bad=${st.bad.state} (${(st.bad.error || '').slice(0, 70)}) after-bad=${st['after-bad'].state} server_orders+${orders() - o2} (expect +1: only the good one)`);

  // ---- W5 before send: crash with QUEUED row ⇒ new process drains exactly one
  const s2f = path.join(tmp, 'b2.db'); let s2 = await store.open(s2f); s2.enqueue('k1', 'sale', ticket()); s2 = null;
  s2 = await store.open(s2f); s2.recover(); const o3 = orders(); await drain(cfg, s2, D, { log });
  out('§M1_W5_BEFORE', orders() === o3 + 1 && s2.get('k1').state === 'CONFIRMED', `server_orders+${orders() - o3} state=${s2.get('k1').state}`);

  // ---- W5 after commit, before local store: simulate crash in afterResponse
  const s3f = path.join(tmp, 'b3.db'); let s3 = await store.open(s3f); s3.enqueue('k2', 'sale', ticket());
  const o4 = orders();
  try { await drain(cfg, s3, D, { log, hooks: { afterResponse: async () => { throw new Error('SIMULATED CRASH after server commit'); } } }); } catch (e) { log(`§M1_W5_AFTER crash: ${e.message}`); }
  const serverHasIt = orders() === o4 + 1;
  s3 = await store.open(s3f);                       // "restart": reload from disk, state is SENDING
  const parkedN = s3.recover(); const o5 = orders(); const c1 = calls;
  await drain(cfg, s3, D, { log });
  out('§M1_W5_AFTER', serverHasIt && parkedN === 1 && s3.get('k2').state === 'PARKED' && calls === c1 && orders() === o5,
    `server_committed=${serverHasIt} recovered_parked=${parkedN} state=${s3.get('k2').state} resend_calls=${calls - c1} dup_orders=${orders() - o5}`);

  // ---- NOT_SENT: unreachable server
  const dead = { ...cfg, base: 'http://localhost:8099' }; const s4 = await store.open(); s4.enqueue('n1', 'sale', ticket());
  const rn = await drain(dead, s4, D, { log, maxAttempts: 3 });
  const a1 = s4.get('n1');
  out('§M1_NOTSENT_1', a1.state === 'QUEUED' && a1.attempts === 1, `after 1 drain: state=${a1.state} attempts=${a1.attempts}`);
  await drain(dead, s4, D, { log, maxAttempts: 3 }); await drain(dead, s4, D, { log, maxAttempts: 3 });
  out('§M1_NOTSENT_CAP', s4.get('n1').state === 'PARKED', `after 3 drains: state=${s4.get('n1').state} (capped, not lost)`);
  const s5 = await store.open(); s5.enqueue('n2', 'sale', ticket()); await drain(dead, s5, D, { log }); const o6 = orders();
  await drain(cfg, s5, D, { log });
  out('§M1_NOTSENT_RESUME', s5.get('n2').state === 'CONFIRMED' && orders() === o6 + 1, `after reconnect: state=${s5.get('n2').state} orders+${orders() - o6}`);

  // ---- AUTH: wrong password
  const badAuth = { ...cfg, login: { ...cfg.login, pass: 'wrong-password' } }; const s6 = await store.open();
  ['a1', 'a2', 'a3'].forEach(u => s6.enqueue(u, 'sale', ticket())); const c2 = calls;
  const ra = await drain(badAuth, s6, D, { log });
  out('§M1_AUTH', ra.stopped === 'AUTH' && calls - c2 === 1 && s6.states().every(x => x.state === 'QUEUED'), `stopped=${ra.stopped} login_attempts=${calls - c2} (must be 1) states=${s6.states().map(x => x.state).join(',')}`);

  out('§M1_W6', 'INCONCLUSIVE', 'no hand-keyed POS reference document in the pilot to diff against; needs one keyed through the ZK UI (not faked)');
  global.fetch = realFetch;
  const v = fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS';
  console.log(`§M1_VERDICT ${v} fails=${fails} inconclusive=${incon}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§M1_VERDICT FAIL exception ' + e.stack); process.exit(2); });
