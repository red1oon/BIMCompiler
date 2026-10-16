// ⚠ DO NOT REMOVE — LINK FACADE witness (spec §53): "any part of SQLite just uses ONE layer to reach legacy via WebServices".
// Everything below goes through legacy_link.js ONLY (no direct store/pusher/replay calls). READ THE LOG.
//  §LINK_SUBMIT_DRAIN  submit() is local-first (queued, no network); drain() writes ONE legacy document via composite WS; server order +1 (psql oracle)
//  §LINK_PERSIST       injected persistence adapter (not a file): a NEW link over the same bytes still knows CONFIRMED, and its drain sends 0 calls / creates 0 documents
//  §LINK_PULL          a document keyed by another legacy user is pulled + applied once; the link's own document is not echoed back
//  §LINK_READ          read() returns legacy rows through a read-only WS type
//  §LINK_COMPARE       compare() runs the reconcile (a match, and a deliberate difference that is reported)
//  §LINK_ISOMORPHIC    layer files load no Node-only module at top level (fs/path/os/child_process) — browser-ready contract
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const { cfgFromEnv, call } = require('./ad_client');
const { createLink } = require('./legacy_link');
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
let fails = 0; const out = (tag, ok, msg) => { console.log(`${tag} ${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) fails++; };
const F = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: v })) });

(async () => {
  const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
  const own = +pg(`select ad_user_id from ad_user where name='${cfg.login.user}'`)[0];
  // in-memory persistence adapter — stands in for IndexedDB/OPFS in a browser
  let bytes = null; const persistence = { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } };
  let calls = 0; const realFetch = global.fetch; global.fetch = (...a) => { if (String(a[0]).includes('composite_operation')) calls++; return realFetch(...a); };

  const D = { sale: { composite: 'SyncOrder',
    header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: { M_Warehouse_ID: { const: 103 }, C_BPartner_ID: { const: 112 }, C_BPartner_Location_ID: { const: 108 }, Bill_BPartner_ID: { const: 112 }, Bill_Location_ID: { const: 108 }, C_DocTypeTarget_ID: { const: 132 } } },
    lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
    docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' }, expect: { serviceType: 'QueryCOrder', cols: { DocStatus: { const: 'CO' } } } } };
  const applied = [];
  const rules = { table: 'C_Order', lineTable: 'C_OrderLine', headerRead: 'QueryCOrder', lineRead: 'QueryCOrderLine', lineParent: 'C_Order_ID', replayOn: ['CO'], apply: async d => { applied.push(d.id); return 'local:' + d.id; } };

  let link = await createLink({ cfg, persistence, descriptors: D, ownUserId: own });
  await link.baseline(rules);

  const o0 = +pg('select count(*) from c_order')[0]; calls = 0;
  const uid = link.submit('sale', { lines: [{ product: 137, qty: 1 }] });
  const callsAfterSubmit = calls, ordersAfterSubmit = +pg('select count(*) from c_order')[0];
  const r = await link.drain();
  out('§LINK_SUBMIT_DRAIN', callsAfterSubmit === 0 && ordersAfterSubmit === o0 && r.confirmed === 1 && calls === 1 && +pg('select count(*) from c_order')[0] === o0 + 1,
    `submit made ${callsAfterSubmit} network calls (must be 0), drain confirmed=${r.confirmed} composite_calls=${calls} server_orders+${+pg('select count(*) from c_order')[0] - o0}`);

  link = await createLink({ cfg, persistence, descriptors: D, ownUserId: own });          // "app restart": fresh link, same persisted bytes
  const c1 = calls, o1 = +pg('select count(*) from c_order')[0]; const r2 = await link.drain();
  out('§LINK_PERSIST', link.status().outbox.CONFIRMED === 1 && calls === c1 && +pg('select count(*) from c_order')[0] === o1 && r2.sent === 0, `status=${JSON.stringify(link.status().outbox)} resend_calls=${calls - c1}`);

  await link.baseline(rules);
  const lc = { ...cfgFromEnv(), login: { ...cfgFromEnv().login, user: 'GardenUser', pass: 'GardenUser', RoleID: 103, OrgID: 11, WarehouseID: 103 } };
  const id = (await call(lc, 'create_data', { ModelCRUD: { serviceType: 'createOrderRecord', DataRow: F({ M_Warehouse_ID: 103, C_BPartner_ID: 112, C_BPartner_Location_ID: 108, Bill_BPartner_ID: 112, Bill_Location_ID: 108, C_DocTypeTarget_ID: 132 }) } })).StandardResponse['@RecordID'];
  await call(lc, 'create_data', { ModelCRUD: { serviceType: 'CreateOrderLine', DataRow: F({ AD_Org_ID: 11, AD_Client_ID: 11, M_Product_ID: 137, QtyEntered: 1, QtyOrdered: 1, C_Order_ID: id, Line: 10 }) } });
  await call(lc, 'set_docaction', { ModelSetDocAction: { serviceType: 'CompleteOrder', tableName: 'C_Order', recordID: id, docAction: 'CO' } });
  const own2 = link.store.idmap(uid).find(x => x.tbl === 'C_Order').server_id;
  const p = await link.pull(rules);
  out('§LINK_PULL', applied.length === 1 && applied[0] === id && p.ownSkipped >= 0 && !applied.includes(own2), `applied=${JSON.stringify(applied)} (legacy-keyed ${id}); own document ${own2} not replayed back`);
  const rd = await link.read('QueryCOrder', `C_Order_ID=${id}`);
  out('§LINK_READ', rd.length === 1 && rd[0].DocStatus === 'CO', `read returned ${rd.length} row, DocStatus=${rd[0] && rd[0].DocStatus}`);

  const spec = { keys: ['a', 'b'] };
  const same = async () => ({ a: 1, b: 2 });
  const rows = await link.compare([{ id: 'same', facts: {}, legacy: same, local: same }, { id: 'diff', facts: {}, legacy: same, local: async () => ({ a: 1, b: 3 }) }], spec, []);
  out('§LINK_COMPARE', rows[0].verdict === 'MATCH' && rows[1].verdict === 'SQLITE-GAP', `same=${rows[0].verdict} diff=${rows[1].verdict}`);

  const layer = ['legacy_link.js', 'ad_client.js', 'store.js', 'doc_writer.js', 'pusher.js', 'changelog_tracker.js', 'replay.js', 'reconcile.js'];
  const bad = layer.flatMap(f => fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n').map((l, i) => [f, i + 1, l]).filter(([, , l]) => /^(const|let|var)\s.*require\('(fs|path|os|child_process)'\)/.test(l)).map(([f, i]) => `${f}:${i}`));
  out('§LINK_ISOMORPHIC', bad.length === 0, bad.length ? 'Node-only top-level requires: ' + bad.join(',') : `${layer.length} layer files have no Node-only top-level module (fs is lazy inside store.js, file path only)`);
  global.fetch = realFetch;
  console.log(`§LINK_VERDICT ${fails ? 'FAIL' : 'PASS'} fails=${fails}`); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§LINK_VERDICT FAIL exception ' + e.stack); process.exit(2); });
