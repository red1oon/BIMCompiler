// ⚠ DO NOT REMOVE — SODA PARITY (prompts/POS_PLUGIN_LOCAL_FIRST.md §28.4; TWIN CARDINAL RULE: SQLite == legacy, owner 2026-11-04 "we do have our twin as parity"). READ THE LOG: §SODAP_* lines; exit code is not evidence.
// Judges, against the LEGACY pilot (docker postgres + the stock WebServices, no direct SQL write), the head-office documents/rows the SODA step touches that the bridge CAN drive today:
//   §SODAP_MOVE     the Inventory Move a replenishment makes (M_Movement + line, doctype 143, CO): legacy via the bridge link; twin via bim-ootb's model_movement (dd_common boot, the shipped layer). Compared: header columns, line columns,
//                   the M_Transaction rows (type, qty, locator), and the storage DELTA at BOTH locators (legacy and twin do not start from the same stock, so deltas, as witness_movement_diff does).
//   §SODAP_DELTA    the "changed since the last run" stamp the SODA watermark relies on (Export2Queue.java:152-165, rows with Updated >= since): the SAME edit (a product's ImageURL) made through legacy's WS and through the twin's model layer;
//                   the set of rows each side selects with `Updated >= watermark` must be equal (exactly that one product row, no price row, no tax row); then the value is restored on both.
//   §SODAP_PRICE    the same for a PRICE edit: legacy M_ProductPrice has a composite key, so the stock update_data (RecordID) may not address it: the result is printed, and when legacy cannot be driven the price stamp is NOT-COMPARED (no parity claimed).
// §28.2 (2026-11-04): the Replenish-created movement, the Move Confirmation, the difference documents and the storage after a confirm are now compared by witness_soda_receipt_parity.js (legacy setup through the WS); the list below is what
//   this file alone could not drive, kept for history. NOT COMPARED here, and why:
//   - the Replenish Report create step making an MMM movement: the pilot's M_Replenish rows have no source warehouse and §62 forbids changing legacy config (witness_replenish_diff.js: MMM is NOTED-AS-DESIGNED);
//   - the Move Confirmation (M_MovementConfirm / line confirm): the pilot has no in-transit MMM doctype (C_DocType.IsInTransit='Y'), no WS type creates a doctype / completes a confirm, and the oracle's makedoc builds one header;
//   - the difference / scrapped inventory documents and the final storage after a confirm.
//   §SODAP_VERDICT PASS only if >0 comparisons were judged and none differs; INCONCLUSIVE when nothing was judged.
// Needs: docker postgres (idempiere_pilot) + the pilot server :8088; bim-ootb tree with erp/tests/dd_common.js (env OOTB, default ~/bim-ootb) and NODE_PATH with sql.js.
'use strict';
const path = require('path'), { execFileSync } = require('child_process');
const ad = require('./ad_client'), { createLink } = require('./legacy_link');
const OOTB = process.env.OOTB || path.join(process.env.HOME, 'bim-ootb');
const pg = (sql) => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter((l) => l && l !== 'SET');
const pgJ = (sql) => JSON.parse(pg("select coalesce(json_agg(t),'[]') from (" + sql + ") t").join(' '));
let judged = 0, fails = 0, incon = 0, notCompared = [];
const out = (tag, ok, msg) => { judged++; if (!ok) fails++; console.log(`${tag} ${ok ? 'MATCH' : 'DIFF'} ${msg}`); };
const lc = (o) => { const x = {}; for (const k in o) x[k.toLowerCase()] = o[k]; return x; };
const n = (v) => (v == null ? null : Number(v));
const f = (o) => ({ field: Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ({ '@column': k, val: String(v) })) });

(async () => {
  const C = require(path.join(OOTB, 'erp', 'tests', 'dd_common.js'));
  const H = await C.boot(), q = H.q, TODAY = H.TODAY, PRODUCT = 137, FROM = 101, TO = 102, QTY = 2, VER = 104;
  console.log(`§SODAP_CTX ootb=${OOTB} today=${TODAY} product=${PRODUCT} locators ${FROM}->${TO} qty=${QTY} priceVersion=${VER}`);
  // fixtures: the SAME rows on both sides (the pilot's, copied into the twin read-only from legacy)
  const sync = (t, where) => { const have = q('PRAGMA table_info(' + t + ')').map((c) => c.name.toLowerCase()); const rows = pgJ('select * from ' + t + ' where ' + where); H.db.run('DELETE FROM ' + t + ' WHERE ' + where); rows.forEach((r) => { const ks = Object.keys(r).filter((k) => have.includes(k)); H.db.run(`INSERT INTO ${t} (${ks.join(',')}) VALUES (${ks.map(() => '?').join(',')})`, ks.map((k) => r[k])); }); return rows.length; };
  console.log(`§SODAP_SYNC m_product=${sync('m_product', 'ad_client_id in (0,11)')} m_productprice=${sync('m_productprice', 'm_pricelist_version_id=' + VER)} m_storageonhand=${sync('m_storageonhand', 'm_product_id=' + PRODUCT)} c_tax=${sync('c_tax', 'ad_client_id in (0,11)')}`);

  // ───────── §SODAP_MOVE ─────────
  const cfg = ad.cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
  const D = { move: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateMovement', table: 'M_Movement', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 143 }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateMovementLine', table: 'M_MovementLine', parent: 'M_Movement_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
      fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Locator_ID: { path: 'from' }, M_LocatorTo_ID: { path: 'to' }, M_Product_ID: { path: 'product' }, MovementQty: { path: 'qty' } } },
    docAction: { serviceType: 'BridgeCompleteMovement', table: 'M_Movement', action: 'CO' }, expect: { serviceType: 'QueryMMovement', cols: { DocStatus: { const: 'CO' } } } } };
  let bytes = null; const link = await createLink({ cfg, persistence: { load: () => bytes, save: (b) => { bytes = Uint8Array.from(b); } }, descriptors: D });
  const onL = (loc) => +(pg(`select coalesce(sum(qtyonhand),0) from m_storageonhand where m_product_id=${PRODUCT} and m_locator_id=${loc}`)[0]);
  const onT = (loc) => Number(H.one('SELECT COALESCE(SUM(qtyonhand),0) AS s FROM m_storageonhand WHERE m_product_id=? AND m_locator_id=?', [PRODUCT, loc]).s);
  const l0 = { a: onL(FROM), b: onL(TO) }, t0 = { a: onT(FROM), b: onT(TO) };
  const uid = link.submit('move', { date: TODAY + ' 00:00:00', note: 'soda parity: replenishment-shaped inventory move', lines: [{ product: PRODUCT, qty: QTY, from: FROM, to: TO }] });
  const r = await link.drain(); const mid = (link.store.idmap(uid).find((x) => x.tbl === 'M_Movement') || {}).server_id;
  if (!mid || r.confirmed !== 1) { incon++; console.log(`§SODAP_MOVE INCONCLUSIVE legacy movement not created (drain ${JSON.stringify(r)}): nothing judged`); }
  else {
    const L = { h: pgJ(`select * from m_movement where m_movement_id=${mid}`)[0], l: pgJ(`select * from m_movementline where m_movement_id=${mid} order by line`), t: pgJ(`select movementtype, movementqty, m_locator_id, m_product_id from m_transaction where m_movementline_id in (select m_movementline_id from m_movementline where m_movement_id=${mid}) order by movementtype`) };
    const l1 = { a: onL(FROM), b: onL(TO) };
    // the twin: the same header/line values through the shipped model layer, then the same action
    const hs = H.save('m_movement', { AD_Org_ID: 11, C_DocType_ID: 143, MovementDate: TODAY, DocAction: 'CO', IsInTransit: 'N', Description: 'soda parity: replenishment-shaped inventory move' });
    const tid = H.lastId('m_movement');
    const ls = H.save('m_movementline', { m_movement_id: tid, AD_Org_ID: 11, M_Product_ID: PRODUCT, C_UOM_ID: L.l[0] ? L.l[0].c_uom_id : 100, MovementQty: QTY, QtyEntered: QTY, M_Locator_ID: FROM, M_LocatorTo_ID: TO, Line: 10 });
    const co = H.docAction('m_movement', tid, 'CO', { noWorkflow: true });
    const T = { h: H.one('SELECT * FROM m_movement WHERE m_movement_id=?', [tid]), l: q('SELECT * FROM m_movementline WHERE m_movement_id=? ORDER BY line', [tid]), t: q('SELECT movementtype, movementqty, m_locator_id, m_product_id FROM m_transaction WHERE m_movementline_id IN (SELECT m_movementline_id FROM m_movementline WHERE m_movement_id=?) ORDER BY movementtype', [tid]) };
    const t1 = { a: onT(FROM), b: onT(TO) };
    console.log(`§SODAP_MOVE_RUN legacy movement=${mid} ${L.h.documentno} ${L.h.docstatus} | twin movement=${tid} ${T.h && T.h.documentno} ${T.h && T.h.docstatus} save=${hs.ok}/${ls.ok} co=${co.ok}`);
    const SKIP = { m_movement_id: 1, documentno: 1, ad_org_id: 0, created: 1, updated: 1, createdby: 1, updatedby: 1, processedon: 1 };
    const ch = C.cmpRow(lc(L.h), lc(T.h || {}), { skip: { m_movement_id: 1, documentno: 1, movementdate: 0, dateacct: 0, ad_client_id: 0 } });
    out('§SODAP_MOVE_HEADER', co.ok && ch.diffs.length === 0, `columns compared=${ch.n} diffs=${JSON.stringify(ch.diffs)} legacyColsMissingInTwin=${ch.missing.length}${ch.missing.length ? ' [' + ch.missing.join(',') + ']' : ''}`);
    const cl = C.cmpRow(lc(L.l[0] || {}), lc(T.l[0] || {}), { skip: { m_movementline_id: 1, m_movement_id: 1 } });
    out('§SODAP_MOVE_LINE', L.l.length === T.l.length && cl.diffs.length === 0, `lines legacy=${L.l.length} twin=${T.l.length} columns compared=${cl.n} diffs=${JSON.stringify(cl.diffs)}`);
    const norm = (ts) => ts.map((x) => `${x.movementtype}:${n(x.movementqty)}:${x.m_locator_id}:${x.m_product_id}`).sort().join('|');
    out('§SODAP_MOVE_TRX', norm(L.t) === norm(T.t) && L.t.length > 0, `legacy=${norm(L.t)} twin=${norm(T.t)}`);
    const dL = { a: l1.a - l0.a, b: l1.b - l0.b }, dT = { a: t1.a - t0.a, b: t1.b - t0.b };
    out('§SODAP_MOVE_STORAGE', dL.a === dT.a && dL.b === dT.b && dL.a === -QTY && dL.b === QTY, `storage delta source locator ${FROM}: legacy ${dL.a} twin ${dT.a} | target locator ${TO}: legacy ${dL.b} twin ${dT.b} (expected -${QTY}/+${QTY}; legacy ${l0.a}->${l1.a} / ${l0.b}->${l1.b})`);
  }

  // leave the pilot's stock as found: move the same quantity back on legacy (ordinary use of the bridge; not compared)
  { const bk = link.submit('move', { date: TODAY + ' 00:00:00', note: 'soda parity: move back', lines: [{ product: PRODUCT, qty: QTY, from: TO, to: FROM }] }); const rb = await link.drain(); console.log(`§SODAP_RESTORE legacy stock ${FROM}: ${l0.a} -> ${onL(FROM)} ${TO}: ${l0.b} -> ${onL(TO)} (move back confirmed=${rb.confirmed})`); }
  // ───────── §SODAP_DELTA (ImageURL) ─────────
  const lcall = (m, body) => ad.call(cfg, m, body);
  const legacyNow = () => pg('select to_char(now(),\'YYYY-MM-DD HH24:MI:SS\')')[0];
  const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
  const orig = pg(`select coalesce(imageurl,'') from m_product where m_product_id=${PRODUCT}`)[0] || '';
  const URL = 'https://img.example/parity-' + PRODUCT + '.png';
  const stampsL = () => Object.fromEntries(pg(`select m_product_id||'|'||updated from m_product where ad_client_id in (0,11)`).map((l) => l.split('|')));
  const sL0 = stampsL();
  await sleep(1100); const W = legacyNow(); await sleep(1100);
  let upd; try { upd = await lcall('update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_Product', TableName: 'M_Product', RecordID: PRODUCT, Action: 'Update', DataRow: f({ ImageURL: URL }) } }); } catch (e) { upd = { error: String(e.message).slice(0, 160) }; }
  const legImg = pg(`select coalesce(imageurl,'') from m_product where m_product_id=${PRODUCT}`)[0] || '';
  const sL1 = stampsL();
  const legChanged = Object.keys(sL1).filter((k) => sL1[k] !== sL0[k]).map(Number).sort((a, b) => a - b);   // rows whose Updated moved in this window = the legacy rows an `Updated >= since` read would newly select
  if (legImg !== URL) { incon++; console.log(`§SODAP_DELTA INCONCLUSIVE legacy ImageURL edit did not apply (${JSON.stringify(upd).slice(0, 200)}): nothing judged`); }
  else if (legChanged.length !== 1 || legChanged[0] !== PRODUCT) { incon++; console.log(`§SODAP_DELTA INCONCLUSIVE another writer changed legacy M_Product rows during this window (Updated moved on ${legChanged.length} rows: ${legChanged.slice(0, 12).join(',')}): the selection cannot be attributed to this edit. Re-run when the pilot is quiet. NOT a pass.`); }
  else {
    const legSel = { R: [PRODUCT], P: pg(`select m_product_id from m_productprice where m_pricelist_version_id=${VER} and updated>='${W}' order by 1`).map(Number), T: pg(`select c_tax_id from c_tax where updated>='${W}' and ad_client_id in (0,11) order by 1`).map(Number) };
    // twin: same edit through the model layer; the watermark is a moment before the twin's edit stamp (H.env stamps TODAY 09:00:00)
    const SC = require(path.join(OOTB, 'erp', 'soda_core.js'));
    const before = H.one('SELECT updated FROM m_product WHERE m_product_id=?', [PRODUCT]).updated;
    // the twin rows were copied from legacy WITH legacy's Updated stamps (another lane may have stamped many of them today): the twin's edit clock is set 2 s after the newest of them, so `Updated >= watermark` can only select the edit
    const maxU = q('SELECT updated AS u FROM m_product WHERE ad_client_id IN (0,11)').map((r) => SC.ts(r.u)).sort().pop();
    const wT = new Date(Date.parse(maxU.replace(' ', 'T') + 'Z') + 2000).toISOString().slice(0, 19).replace('T', ' ');
    const up = H.run({ table: 'm_product', timing: 'SAVE', record: H.one('SELECT * FROM m_product WHERE m_product_id=?', [PRODUCT]), id: PRODUCT, changes: { imageurl: URL } }, { now: wT });
    const after = H.one('SELECT imageurl, updated FROM m_product WHERE m_product_id=?', [PRODUCT]);
    const d = SC.refDelta({ since: wT, upto: wT, batchId: 'p', seq: 1, client: 11, org: 12, version: VER, prices: q('SELECT * FROM m_productprice WHERE m_pricelist_version_id=?', [VER]), products: q('SELECT * FROM m_product WHERE ad_client_id IN (0,11)'), taxes: q('SELECT * FROM c_tax WHERE ad_client_id IN (0,11)') });
    const twSel = { R: d.rows.filter((x) => x.kind === 'R').map((x) => Number(x.m_product_id)), P: d.rows.filter((x) => x.kind === 'P').map((x) => Number(x.m_product_id)), T: d.rows.filter((x) => x.kind === 'T').map((x) => Number(x.c_tax_id)) };
    const legStamped = pg(`select (updated>='${W}')::text from m_product where m_product_id=${PRODUCT}`)[0] === 'true';
    out('§SODAP_DELTA_IMAGEURL', up.ok && after.imageurl === URL && legStamped && JSON.stringify(legSel.R) === JSON.stringify(twSel.R) && legSel.P.length === 0 && twSel.P.length === 0 && legSel.T.length === 0 && twSel.T.length === 0, `same ImageURL edit: legacy moved Updated of exactly {${legChanged}} (>= watermark ${W}: ${legStamped}), rows selected legacy ${JSON.stringify(legSel)} twin ${JSON.stringify(twSel)} (twin watermark ${wT}); twin save=${up.ok}; twin Updated ${before} -> ${after.updated}`);
    try { await lcall('update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_Product', TableName: 'M_Product', RecordID: PRODUCT, Action: 'Update', DataRow: f({ ImageURL: orig }) } }); } catch (e) { console.log('§SODAP_RESTORE legacy ImageURL restore failed: ' + e.message.slice(0, 120)); }
    console.log(`§SODAP_RESTORE legacy ImageURL now "${pg(`select coalesce(imageurl,'') from m_product where m_product_id=${PRODUCT}`)[0] || ''}" (was "${orig}")`);
  }

  // ───────── §SODAP_PRICE ─────────
  const pr0 = pgJ(`select pricestd, pricelist, pricelimit, updated from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0];
  let pu; try { pu = await lcall('update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_ProductPrice', TableName: 'M_ProductPrice', RecordID: 0, Action: 'Update', DataRow: f({ M_PriceList_Version_ID: VER, M_Product_ID: PRODUCT, PriceStd: Number(pr0.pricestd) + 1 }) } }); } catch (e) { pu = { error: String(e.message).slice(0, 200) }; }
  const pr1 = pgJ(`select pricestd, updated from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0];
  if (Number(pr1.pricestd) === Number(pr0.pricestd)) { notCompared.push('price-edit-stamp'); console.log(`§SODAP_PRICE NOT-COMPARED legacy price edit not drivable through the stock update_data (composite key M_ProductPrice): ${JSON.stringify(pu).slice(0, 220)} -- no parity claimed for the price Updated stamp`); }
  else {
    const stamped = String(pr1.updated) > String(pr0.updated);
    const row = H.one('SELECT * FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?', [VER, PRODUCT]);
    const tu = H.run({ table: 'm_productprice', timing: 'SAVE', record: row, id: row.m_productprice_id != null ? row.m_productprice_id : row.m_product_id, changes: { pricestd: Number(pr0.pricestd) + 1 } });
    const row1 = H.one('SELECT updated, pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?', [VER, PRODUCT]);
    out('§SODAP_PRICE_STAMP', stamped && String(row1.updated) > String(row.updated) && Number(row1.pricestd) === Number(pr1.pricestd), `a price edit moves Updated forward on both sides: legacy ${pr0.updated} -> ${pr1.updated}; twin ${row.updated} -> ${row1.updated} (twin save ok=${tu.ok})`);
    await lcall('update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_ProductPrice', TableName: 'M_ProductPrice', RecordID: 0, Action: 'Update', DataRow: f({ M_PriceList_Version_ID: VER, M_Product_ID: PRODUCT, PriceStd: pr0.pricestd }) } }).catch(() => {});
    console.log(`§SODAP_RESTORE legacy price now ${pg(`select pricestd from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0]} (was ${pr0.pricestd})`);
  }
  console.log(`§SODAP_NOT_COMPARED replenish-create-MMM-movement, move-confirmation, difference/scrapped inventory docs, final storage after a confirm${notCompared.length ? ', ' + notCompared.join(', ') : ''} -- no parity claimed (see header)`);
  console.log(`§SODAP_VERDICT ${judged === 0 ? 'INCONCLUSIVE' : fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} judged=${judged} fails=${fails} inconclusive=${incon} notCompared=${notCompared.length}`);
  process.exit(judged === 0 ? 2 : fails ? 1 : 0);
})().catch((e) => { console.log('§SODAP_VERDICT FAIL exception ' + (e && e.stack || e)); process.exit(2); });
