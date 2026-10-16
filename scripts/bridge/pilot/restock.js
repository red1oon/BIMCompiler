// ⚠ DO NOT REMOVE — PILOT fixture, spec prompts/SQLiteIDEMPIERE.md §PILOT-RESTOCK. Tops up the COSTED quantity of the suite products on the local legacy pilot
// THROUGH THE WEBSERVICES as a normal user: one Physical Inventory (doctype ctx.dt.physInv) created + completed via the Bridge link (same descriptor as the PI1/PI2
// scenarios of witness_m3_gap.js). Never SQL. Idempotent: a product already at/above its target is left alone (no document). READ THE LOG: `§RESTOCK` lines.
//   node scripts/bridge/pilot/restock.js [show]            default targets: 137 (Mulch) -> 200, 139 (Rake) -> 100 costed qty
//   RESTOCK_TARGETS='{"137":300}' node scripts/bridge/pilot/restock.js
'use strict';
const { cfgFromEnv, query } = require('../ad_client');
const { createLink } = require('../legacy_link');
const C = require('../client_ctx').ctx;
const cfg = cfgFromEnv(); cfg.login.OrgID = C.org; cfg.login.WarehouseID = C.wh;
const TARGETS = process.env.RESTOCK_TARGETS ? JSON.parse(process.env.RESTOCK_TARGETS) : { [C.prod.mulch]: 200, [C.prod.rake]: 100 };
const LOC = C.locator, SCHEMA = C.schema.primary, AVG_EL = 100;
const costQty = async p => { const r = await query(cfg, 'QueryMCost', `M_Product_ID=${p} AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID=${AVG_EL} AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0`); return r.length ? Number(r[0].CurrentQty) : 0; };
const price = async p => { const r = await query(cfg, 'QueryMCost', `M_Product_ID=${p} AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID=${AVG_EL} AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0`); return r.length ? r[0].CurrentCostPrice : null; };
const onhand = async (p, loc) => (await query(cfg, 'QueryStorage', `M_Product_ID=${p}` + (loc ? ` AND M_Locator_ID=${loc}` : ''))).reduce((a, r) => a + Number(r.QtyOnHand), 0);
const snap = async tag => { for (const p of Object.keys(TARGETS)) console.log(`§RESTOCK ${tag} product=${p} costed_qty=${await costQty(+p)} onhand_all=${await onhand(+p)} onhand_loc${LOC}=${await onhand(+p, LOC)} cost_price=${await price(+p)} target=${TARGETS[p]}`); };
(async () => {
  await snap('before');
  if (process.argv[2] === 'show') return;
  const lines = [];
  for (const p of Object.keys(TARGETS)) { const q = await costQty(+p), need = TARGETS[p] - q;
    if (need > 0) { const book = await onhand(+p, LOC); lines.push({ product: +p, loc: LOC, book, count: book + need }); console.log(`§RESTOCK plan product=${p} costed=${q} need=+${need} book=${book} count=${book + need}`); }
    else console.log(`§RESTOCK skip product=${p} costed=${q} >= target=${TARGETS[p]}`); }
  if (!lines.length) { console.log('§RESTOCK_VERDICT NOOP (all at/above target)'); return; }
  let bytes = null;
  const link = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: { pi: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateInventory', table: 'M_Inventory', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: C.dt.physInv }, M_Warehouse_ID: { const: C.wh }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateInventoryLine', table: 'M_InventoryLine', parent: 'M_Inventory_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
      fields: { AD_Org_ID: { const: C.org }, AD_Client_ID: { const: C.client }, M_Locator_ID: { path: 'loc' }, M_Product_ID: { path: 'product' }, QtyBook: { path: 'book' }, QtyCount: { path: 'count' }, InventoryType: { const: 'D' } } },
    docAction: { serviceType: 'BridgeCompleteInventory', table: 'M_Inventory', action: 'CO' } } } });
  const d = new Date(), today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const uid = link.submit('pi', { date: today + ' 00:00:00', note: 'PILOT-RESTOCK', lines });
  await link.drain(); const st = link.store.get(uid);
  const id = st.state === 'CONFIRMED' ? link.store.idmap(uid).find(x => x.tbl === 'M_Inventory').server_id : null;
  const h = id ? (await query(cfg, 'QueryMInventory', `M_Inventory_ID=${id}`))[0] : null;
  console.log(`§RESTOCK doc state=${st.state} m_inventory_id=${id} docstatus=${h && h.DocStatus} posted=${h && h.Posted} err=${st.error || '-'}`);
  await snap('after');
  let ok = !!h && h.DocStatus === 'CO';
  for (const l of lines) { const q = await costQty(l.product); if (q < TARGETS[l.product]) { ok = false; console.log(`§RESTOCK short product=${l.product} costed=${q} < target=${TARGETS[l.product]}`); } }
  console.log(`§RESTOCK_VERDICT ${ok ? 'PASS' : 'FAIL'}`); if (!ok) process.exit(1);
})().catch(e => { console.log('§RESTOCK ERROR ' + e.message); process.exit(1); });
