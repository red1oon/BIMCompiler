// ⚠ DO NOT REMOVE — M2 witness: DOWN replay (legacy-keyed documents → LOCAL doc engine), vs the LOCAL PILOT iDempiere.
// Spec: prompts/SQLiteIDEMPIERE.md §4, §20 M2, §21, §23. READ THE LOG after every run.
//  §M2_REPLAY     a document keyed by ANOTHER legacy user (GardenUser, role 103) is replayed locally, once, lines intact
//  §M2_ENGINE     the replay goes through the local engine verbs (erp_engine.buildDoc) — ops produced, no row copy
//  §M2_TOTAL      local fold of replayed lines == legacy TotalLines (psql oracle), in minor units
//  §M2_OWN        the Bridge's own pushed document is NOT replayed back (own-echo)
//  §M2_DEDUPE     second run applies 0; a RESTART (fresh tracker, watermark from store) applies 0 (window overlap + inbox guard)
//  §M2_FAIL       an apply() that throws ⇒ FAILED row with message; other documents unaffected
//  VACUOUS guard: zero candidates ⇒ INCONCLUSIVE, never PASS
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const { cfgFromEnv, call } = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');
const { createTracker } = require('./changelog_tracker');
const { createReplayer } = require('./replay');
const E = require('../erp_engine');            // the LOCAL engine verbs (scripts/erp_engine.js)

const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
let fails = 0, incon = 0;
const out = (tag, ok, msg) => { console.log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };
const log = l => console.log(l);
const F = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: v })) });
const cents = v => Math.round(Number(v) * 100);

// legacy user = a second, ordinary WS login keying a document step by step (create → line → complete)
async function legacyKeys(product, qty) {
  const lc = { ...cfgFromEnv(), login: { ...cfgFromEnv().login, user: 'GardenUser', pass: 'GardenUser', RoleID: 103, OrgID: 11, WarehouseID: 103 } };
  const id = (await call(lc, 'create_data', { ModelCRUD: { serviceType: 'createOrderRecord', DataRow: F({ M_Warehouse_ID: 103, C_BPartner_ID: 118, C_BPartner_Location_ID: 113, Bill_BPartner_ID: 118, Bill_Location_ID: 113, C_DocTypeTarget_ID: 132 }) } })).StandardResponse['@RecordID'];
  await call(lc, 'create_data', { ModelCRUD: { serviceType: 'CreateOrderLine', DataRow: F({ AD_Org_ID: 11, AD_Client_ID: 11, M_Product_ID: product, QtyEntered: qty, QtyOrdered: qty, C_Order_ID: id, Line: 10 }) } });
  await call(lc, 'set_docaction', { ModelSetDocAction: { serviceType: 'CompleteOrder', tableName: 'C_Order', recordID: id, docAction: 'CO' } });
  return id;
}

// the app-owned apply(): legacy document → local engine ops (erp_engine.buildDoc) → local fold of lines
const sink = { ops: [], docs: {} };
async function applyViaEngine(doc) {
  const spec = { docTable: 'C_Order', lineTable: 'C_OrderLine', parentId: 'c_order_id', lineParentId: 'c_orderline_id', qtyTo: 'qtyordered', qtyFrom: 'qtyordered', header: () => ({ docstatus: 'DR' }) };
  const parent = { c_order_id: doc.id };
  const lines = doc.lines.map(l => ({ c_orderline_id: l.C_OrderLine_ID, m_product_id: l.M_Product_ID, qtyordered: l.QtyOrdered }));
  const ops = E.buildDoc(spec, parent, lines).concat([{ op_type: 'SET_STATUS', table: 'C_Order', source_id: doc.id, docstatus: doc.header.DocStatus }]);
  sink.ops.push(...ops);
  sink.docs[doc.id] = { ops: ops.length, types: ops.map(o => o.op_type), totalCents: doc.lines.reduce((a, l) => a + cents(l.PriceActual) * Number(l.QtyOrdered), 0) };
  return `local:C_Order:${doc.id}`;
}

(async () => {
  const cfg = cfgFromEnv(); cfg.login.OrgID = 12; cfg.login.WarehouseID = 104;
  const own = +pg(`select ad_user_id from ad_user where name='${cfg.login.user}'`)[0];
  const s = await store.open(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'm2-')), 'b.db'));
  const rules = { table: 'C_Order', lineTable: 'C_OrderLine', headerRead: 'QueryCOrder', lineRead: 'QueryCOrderLine', lineParent: 'C_Order_ID', replayOn: ['CO'], apply: applyViaEngine };
  const T = () => createTracker(cfg, { ownUserId: own, log });
  let tr = T(); let rp = createReplayer(cfg, s, tr, rules, { log });
  await rp.baseline();                             // skip history already on legacy (watermark = now)
  log(`§M2_BASE wm=${tr.state.wm} (history before this point is NOT replayed — baseline, §19 C5)`);

  // --- traffic: one legacy-keyed doc, one Bridge-pushed doc
  const L1 = await legacyKeys(123, 1);
  const D = { composite: 'SyncOrder', header: { serviceType: 'createOrderRecord', table: 'C_Order', fields: { M_Warehouse_ID: { const: 104 }, C_BPartner_ID: { const: 118 }, C_BPartner_Location_ID: { const: 113 }, Bill_BPartner_ID: { const: 118 }, Bill_Location_ID: { const: 113 }, C_DocTypeTarget_ID: { const: 135 } } },
    lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 12 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } },
    docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } };
  s.enqueue('mine', 'sale', { lines: [{ product: 123, qty: 1 }] });
  await drain(cfg, s, { sale: D }, { log });
  const mineId = s.idmap('mine').find(x => x.tbl === 'C_Order').server_id;
  log(`§M2_TRAFFIC legacy-keyed=${L1} bridge-pushed=${mineId}`);

  const r1 = await rp.run();
  if (r1.candidates === 0) out('§M2_REPLAY', 'INCONCLUSIVE', 'zero candidate documents seen — nothing judged');
  else out('§M2_REPLAY', r1.applied === 1 && !!s.inboxGet('C_Order', L1) && s.inboxGet('C_Order', L1).status === 'APPLIED', `candidates=${r1.candidates} applied=${r1.applied} legacyDoc=${L1} inbox=${JSON.stringify(s.inboxGet('C_Order', L1))}`);
  const doc = sink.docs[L1];
  out('§M2_ENGINE', !!doc && JSON.stringify(doc.types) === JSON.stringify(['CREATE_DOCUMENT', 'CREATE_LINE', 'SET_STATUS']), `engine ops for legacy doc: ${doc && doc.types.join('+')} (erp_engine.buildDoc + status; not a row copy)`);
  const legacyTotal = cents(pg(`select totallines from c_order where c_order_id=${L1}`)[0]);
  out('§M2_TOTAL', !!doc && doc.totalCents === legacyTotal, `local fold=${doc && doc.totalCents}c legacy TotalLines=${legacyTotal}c`);
  out('§M2_OWN', r1.ownSkipped === 1 && !s.inboxGet('C_Order', mineId), `own-echo skipped=${r1.ownSkipped} replayed_back=${!!s.inboxGet('C_Order', mineId)}`);

  const r2 = await rp.run();
  out('§M2_DEDUPE_RERUN', r2.applied === 0, `second run applied=${r2.applied} duplicate=${r2.duplicate}`);
  tr = T(); rp = createReplayer(cfg, s, tr, rules, { log });          // "restart": fresh tracker, watermark restored from store
  const r3 = await rp.run();
  out('§M2_DEDUPE_RESTART', r3.applied === 0 && sink.ops.filter(o => o.op_type === 'CREATE_DOCUMENT').length === 1, `after restart applied=${r3.applied} duplicate=${r3.duplicate} total CREATE_DOCUMENT ops=${sink.ops.filter(o => o.op_type === 'CREATE_DOCUMENT').length}`);

  // --- failure isolation: apply throws for the first doc only
  let n = 0; const bad = { ...rules, apply: async d => { if (++n === 1) throw new Error('SIMULATED local rule failure'); return applyViaEngine(d); } };
  rp = createReplayer(cfg, s, T(), bad, { log }); await rp.baseline();   // baseline for this replayer
  const L2 = await legacyKeys(123, 1), L3 = await legacyKeys(123, 1);
  const r4 = await rp.run();
  const a = s.inboxGet('C_Order', L2), b = s.inboxGet('C_Order', L3);
  out('§M2_FAIL', r4.failed === 1 && a && a.status === 'FAILED' && /SIMULATED/.test(a.error) && b && b.status === 'APPLIED', `L2=${a && a.status}(${a && a.error}) L3=${b && b.status} (failure visible, sibling applied)`);

  console.log(`§M2_VERDICT ${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§M2_VERDICT FAIL exception ' + e.stack); process.exit(2); });
