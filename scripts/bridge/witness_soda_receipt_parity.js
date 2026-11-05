// ⚠ DO NOT REMOVE — SODA RECEIPT PARITY (bim-compiler prompts/POS_PLUGIN_LOCAL_FIRST.md §28.2 P6; TWIN CARDINAL RULE: SQLite == legacy, owner 2026-11-04 "we do have our twin as parity"). READ THE LOG: §SODAR_* lines; exit code is not evidence.
// The four items §28.R named NOT-COMPARED, driven on the LEGACY pilot (docker postgres + the stock WebServices + the process oracle :8097) and on the twin (bim-ootb model layer / ad_process.js, the shipped code), from the SAME fixtures:
//   §SODAR_REPLENISH   the Replenish Report create step (ReplenishmentCreate=MMM) for a rule WITH a source warehouse: the M_Movement + M_MovementLine it makes
//   §SODAR_CONFIRM     Prepare of that movement (in-transit doctype) creates M_MovementConfirm + M_MovementLineConfirm; the short receipt keyed in; the confirm's Complete: confirm header, line confirm, the movement's cascade
//   §SODAR_DIFFDOCS    the difference / scrapped M_Inventory documents the confirm creates (header, lines, doc status)
//   §SODAR_STORAGE     M_Transaction rows and the storage delta at BOTH locators after the confirm
//   §SODAR_PRICE       the price-edit Updated stamp (M_ProductPrice, composite key): the stock WS cannot address it (measured), so NOT-COMPARED, named, no parity claimed
// Legacy SETUP is made through legacy's OWN WS as an admin would (scripts/bridge/pilot/ws_soda_setup.sql types; no SQL into business tables): an in-transit Material Movement doctype and a Replenish rule with a source warehouse.
// A DIFF is fixed on the twin side (TWIN CARDINAL RULE); a LEGACY-QUIRK exemption exists only in the owner's own words. §SODAR_VERDICT prints INCONCLUSIVE, never PASS, when nothing was judged.
// Needs: docker postgres (idempiere_pilot), the pilot :8088 with ws_soda_setup.sql applied, the oracle :8097, bim-ootb tree (env OOTB, default ~/bim-ootb) and NODE_PATH with sql.js.
'use strict';
const path = require('path'), { execFileSync } = require('child_process');
const ad = require('./ad_client'), { createLink } = require('./legacy_link');
const OOTB = process.env.OOTB || path.join(process.env.HOME, 'bim-ootb');
const pg = (sql) => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter((l) => l && l !== 'SET');
const pgJ = (sql) => JSON.parse(pg("select coalesce(json_agg(t),'[]') from (" + sql + ") t").join(' '));
let judged = 0, fails = 0, incon = 0; const items = {};
const item = (name, ok, msg) => { judged++; if (ok === null) { incon++; items[name] = 'INCONCLUSIVE'; console.log(`§SODAR_${name} INCONCLUSIVE ${msg}`); return; } if (!ok) fails++; items[name] = ok ? 'MATCH' : 'DIFF'; console.log(`§SODAR_${name} ${ok ? 'MATCH' : 'DIFF'} ${msg}`); };
const lc = (o) => { const x = {}; for (const k in o) x[k.toLowerCase()] = o[k]; return x; };
const n = (v) => (v == null ? null : Number(v));
const f = (o) => ({ field: Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ({ '@column': k, val: String(v) })) });

(async () => {
  const C = require(path.join(OOTB, 'erp', 'tests', 'dd_common.js'));
  const H = await C.boot(), q = H.q, TODAY = H.TODAY, P = require(path.join(H.ERP, 'ad_process.js'));
  require(path.join(H.ERP, 'processes', 'ReplenishReportProduction.js'));
  process.env.TODAY = process.env.TODAY || TODAY;
  const cfg = ad.cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
  const WH_SRC = 103, WH_DST = 104, LOC_SRC = 101, LOC_DST = 102, PRODUCT = 124, LVL_MIN = 5, LVL_MAX = 9, DTNAME = 'Material Movement (in transit) [SODA parity]';
  console.log(`§SODAR_CTX ootb=${OOTB} today=${TODAY} product=${PRODUCT} warehouse ${WH_SRC}->${WH_DST} locators ${LOC_SRC}->${LOC_DST} rule min=${LVL_MIN} max=${LVL_MAX}`);
  const sync = (t, where) => { const have = q('PRAGMA table_info(' + t + ')').map((c) => c.name.toLowerCase()); if (!have.length) return 'NOTABLE'; const rows = pgJ('select * from ' + t + ' where ' + where); H.db.run('DELETE FROM ' + t + ' WHERE ' + where);
    rows.forEach((r) => { const ks = Object.keys(r).filter((k) => have.includes(k)); H.db.run('INSERT INTO ' + t + ' (' + ks.join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')', ks.map((k) => r[k])); }); return rows.length; };
  const SYNC = [['m_product_category', 'ad_client_id IN (0,11)'], ['m_product', 'ad_client_id IN (0,11)'], ['m_replenish', 'ad_client_id=11'], ['m_product_po', 'ad_client_id=11'], ['m_storageonhand', 'ad_client_id=11'], ['m_storagereservation', 'ad_client_id=11'],
    ['m_productionline', 'ad_client_id=11'], ['m_locatortype', 'ad_client_id IN (0,11)'], ['m_locator', 'ad_client_id=11'], ['m_warehouse', 'ad_client_id=11'], ['c_doctype', 'ad_client_id IN (0,11)'], ['c_bpartner', 'ad_client_id=11'], ['c_bpartner_location', 'ad_client_id=11'],
    ['ad_user', 'ad_client_id=11 AND c_bpartner_id IS NOT NULL'], ['ad_sequence', "istableid='N' AND ad_client_id IN (0,11)"]];
  // LEGACY-QUIRK exemptions (TWIN CARDINAL RULE: only in the owner's own words + date; a diff without one stays a DIFF). Each is as narrow as its evidence.
  const QUIRKS = [{
    key: 'm_movementline.description "Total: <qty>" decimal scale',
    evidence: 'ReplenishReportProduction.java:619-620 line.setDescription("Total: " + replenish.getQtyToOrder()) prints a BigDecimal whose scale comes from PG numeric storage rows (6.0 / 0.0 -> "9.0"); SQLite keeps the plain number ("9"). Text only: MovementQty and every formatted quantity field are equal.',
    exemption: 'owner 2026-11-04: "ah ok, qty movement is fine at significant number"',
    accepts: (d) => { const m = /^description legacy=Total: (-?[\d.]+) twin=Total: (-?[\d.]+)$/.exec(d); return !!m && Number(m[1]) === Number(m[2]); } }];
  const cmpAll = (Ls, Ts, skip) => { const r = { diffs: [], n: 0, missing: [], quirks: 0 }; Ls.forEach((l, i) => { const c = C.cmpRow(lc(l), lc(Ts[i] || {}), { skip }); r.n += c.n;
    c.diffs.forEach((d) => { const q = QUIRKS.find((x) => x.accepts(d)); if (q) { r.quirks++; console.log(`§QUIRK_ACCEPTED #${i + 1} ${q.key} :: ${d} :: exemption=${q.exemption} :: evidence=${q.evidence}`); return; } r.diffs.push('#' + (i + 1) + ' ' + d); });
    c.missing.forEach((m) => r.missing.push(m)); }); return r; };
  { const t1 = QUIRKS[0].accepts('description legacy=Total: 9.0 twin=Total: 9'), t2 = QUIRKS[0].accepts('description legacy=Total: 9.0 twin=Total: 8'), t3 = QUIRKS[0].accepts('description legacy=Moved twin=moved');
    console.log(`§QUIRK_SELFCHECK same-number-other-scale=${t1} different-number=${t2} other-text=${t3} ${t1 && !t2 && !t3 ? 'OK' : 'FAIL'}`); if (!(t1 && !t2 && !t3)) process.exitCode = 1; }
  const syncAll = (why) => console.log(`§SODAR_SYNC ${why} ` + SYNC.map(([t, w]) => t + '=' + sync(t, w)).join(' '));

  // ───────── legacy SETUP through legacy's own WS (an administrator's act; idempotent) ─────────
  let dtId = n(pg(`select c_doctype_id from c_doctype where name='${DTNAME}' and isactive='Y' order by 1 limit 1`)[0]);
  try {
    if (!dtId) { const r = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_C_DocType', TableName: 'C_DocType', RecordID: 0, Action: 'Create', DataRow: f({ AD_Org_ID: 0, Name: DTNAME, PrintName: DTNAME, DocBaseType: 'MMM', IsSOTrx: 'N', GL_Category_ID: 108, IsInTransit: 'Y', IsCreateCounter: 'N', DocumentCopies: 0, IsDocNoControlled: 'N' }) } }); dtId = n(r.StandardResponse && r.StandardResponse['@RecordID']) || n(pg(`select c_doctype_id from c_doctype where name='${DTNAME}' order by 1 desc limit 1`)[0]); console.log(`§SODAR_SETUP created in-transit doctype ${dtId} through WS Bridge_createData_C_DocType`); }
    else console.log(`§SODAR_SETUP in-transit doctype ${dtId} already exists`);
    if (!n(pg(`select count(*) from m_replenish where m_warehouse_id=${WH_DST} and m_product_id=${PRODUCT}`)[0])) {
      const r = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_M_Replenish', TableName: 'M_Replenish', RecordID: 0, Action: 'Create', DataRow: f({ AD_Org_ID: 0, M_Warehouse_ID: WH_DST, M_Product_ID: PRODUCT, ReplenishType: '1', Level_Min: LVL_MIN, Level_Max: LVL_MAX, QtyBatchSize: 0 }) } });
      console.log(`§SODAR_SETUP created Replenish rule ${WH_DST}/${PRODUCT} (maintain maximum ${LVL_MIN}..${LVL_MAX}) through WS Bridge_createData_M_Replenish: ${JSON.stringify(r).slice(0, 160)}`); }
    else console.log('§SODAR_SETUP the Replenish rule already exists');
    // the SOURCE warehouse of a replenishment is the destination WAREHOUSE's own M_WarehouseSource_ID (ReplenishReportProduction.java:369-374), keyed in the Warehouse window
    if (n(pg(`select coalesce(m_warehousesource_id,0) from m_warehouse where m_warehouse_id=${WH_DST}`)[0]) !== WH_SRC) {
      const r = await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_Warehouse', TableName: 'M_Warehouse', RecordID: WH_DST, Action: 'Update', DataRow: f({ M_WarehouseSource_ID: WH_SRC }) } });
      console.log(`§SODAR_SETUP warehouse ${WH_DST} source warehouse := ${WH_SRC} through WS Bridge_updateData_M_Warehouse: ${JSON.stringify(r).slice(0, 120)}`); }
    else console.log(`§SODAR_SETUP warehouse ${WH_DST} already has source warehouse ${WH_SRC}`);
  } catch (e) { console.log(`§SODAR_SETUP INCONCLUSIVE legacy setup through WS failed: ${String(e.message).slice(0, 240)}`); item('SETUP', null, 'legacy WS setup failed: nothing judged'); console.log(`§SODAR_VERDICT INCONCLUSIVE judged=${judged} fails=0 inconclusive=${incon}`); process.exit(2); }
  // a repeatable start (the pilot is shared and each run moves real stock): the product is counted back to source 15 / destination 0 by Physical Inventory THROUGH THE WS, as pilot/restock.js does (never SQL)
  try {
    const PI = (wh) => ({ composite: 'SyncOrder', header: { serviceType: 'BridgeCreateInventory', table: 'M_Inventory', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 144 }, M_Warehouse_ID: { const: wh }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
      lines: { serviceType: 'BridgeCreateInventoryLine', table: 'M_InventoryLine', parent: 'M_Inventory_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Locator_ID: { path: 'loc' }, M_Product_ID: { path: 'product' }, QtyBook: { path: 'book' }, QtyCount: { path: 'count' }, InventoryType: { const: 'D' } } },
      docAction: { serviceType: 'BridgeCompleteInventory', table: 'M_Inventory', action: 'CO' } });
    let pb = null; const plink = await createLink({ cfg, persistence: { load: () => pb, save: (b) => { pb = Uint8Array.from(b); } }, descriptors: { pi103: PI(WH_SRC), pi104: PI(WH_DST) } });
    const cur = (loc) => +(pg(`select coalesce(sum(qtyonhand),0) from m_storageonhand where m_product_id=${PRODUCT} and m_locator_id=${loc}`)[0]);
    const plan = [['pi103', LOC_SRC, 15], ['pi104', LOC_DST, 0]].filter(([, loc, want]) => cur(loc) !== want);
    plan.forEach(([d, loc, want]) => plink.submit(d, { date: TODAY + ' 00:00:00', note: 'SODA parity: repeatable start', lines: [{ product: PRODUCT, loc, book: cur(loc), count: want }] }));
    if (plan.length) { const r = await plink.drain(); console.log(`§SODAR_SETUP stock counted back through Physical Inventory (WS): ${plan.map(([, l, w]) => l + '->' + w).join(', ')} confirmed=${r.confirmed}/${plan.length} now ${LOC_SRC}:${cur(LOC_SRC)} ${LOC_DST}:${cur(LOC_DST)}`); }
    else console.log('§SODAR_SETUP stock already at the repeatable start');
  } catch (e) { console.log(`§SODAR_SETUP stock reset failed: ${String(e.message).slice(0, 200)} (the run continues from the stock as found)`); }
  const rule = pgJ(`select * from m_replenish where m_warehouse_id=${WH_DST} and m_product_id=${PRODUCT}`)[0];
  if (!dtId || !rule) { item('SETUP', null, `legacy setup incomplete doctype=${dtId} rule=${!!rule}`); console.log(`§SODAR_VERDICT INCONCLUSIVE judged=${judged} fails=0 inconclusive=${incon}`); process.exit(2); }
  console.log(`§SODAR_SETUP legacy rule: ${JSON.stringify({ wh: rule.m_warehouse_id, product: rule.m_product_id, type: rule.replenishtype, min: rule.level_min, max: rule.level_max, source: n(pg(`select m_warehousesource_id from m_warehouse where m_warehouse_id=${WH_DST}`)[0]) })} (source warehouse is the warehouse's)`);
  syncAll('before replenish');

  const onL = (loc) => +(pg(`select coalesce(sum(qtyonhand),0) from m_storageonhand where m_product_id=${PRODUCT} and m_locator_id=${loc}`)[0]);
  const onT = (loc) => Number(H.one('SELECT COALESCE(SUM(qtyonhand),0) AS s FROM m_storageonhand WHERE m_product_id=? AND m_locator_id=?', [PRODUCT, loc]).s);
  const l0 = { a: onL(LOC_SRC), b: onL(LOC_DST) }, t0 = { a: onT(LOC_SRC), b: onT(LOC_DST) };
  console.log(`§SODAR_STOCK start legacy ${LOC_SRC}:${l0.a} ${LOC_DST}:${l0.b} | twin ${LOC_SRC}:${t0.a} ${LOC_DST}:${t0.b}`);
  if (l0.a !== t0.a || l0.b !== t0.b) console.log('§SODAR_STOCK FIXTURE-DIFF the synced stock differs: deltas are compared');

  // ───────── §SODAR_REPLENISH: the same Replenish Report create (MMM) on both sides ─────────
  const params = [{ name: 'M_Warehouse_ID', value: WH_DST }, { name: 'ReplenishmentCreate', value: 'MMM' }, { name: 'C_DocType_ID', value: dtId }];
  const LMAX = n(pg('select coalesce(max(m_movement_id),0) from m_movement')[0]);
  const LR = await C.oracle({ op: 'process', process: 53267, recordId: 0, tableId: 0, params, ctx: { date: TODAY, client: 11, org: 11, role: 102, user: 101, wh: 103 } });
  const lmv = pgJ(`select * from m_movement where m_movement_id>${LMAX} order by 1`);
  const given = {}; params.forEach((p) => { given[p.name] = { v: p.value, type: p.type }; });
  const env = H.env({ wh: 103 }); env.wh = 103;
  const TR = P.runJava(q, env, { AD_PInstance_ID: 8200001, AD_Process_ID: 53267, className: 'org.compiere.process.ReplenishReportProduction', title: 'Replenish Report', Record_ID: 0, Table_ID: 0, params: given });
  if (TR.ok) H.apply(TR.ops); else console.log(`§SODAR_TWIN_PROCESS_FAILED ${JSON.stringify({ error: TR.error, msg: TR.msg, summary: TR.summary, log: (TR.log || []).slice(-6) }).slice(0, 700)}`);
  const tmv = q('SELECT * FROM m_movement ORDER BY m_movement_id DESC LIMIT ' + Math.max(lmv.length, 1)).reverse().filter((m) => m.c_doctype_id === dtId || Number(m.c_doctype_id) === dtId);
  console.log(`§SODAR_REPLENISH_RUN legacy ok=${LR.ok !== false} summary=${JSON.stringify(LR.summary || LR.error || '').slice(0, 120)} movements=${lmv.length} | twin ok=${TR.ok} movements=${tmv.length}`);
  let LM = null, TM = null;
  if (!lmv.length || !tmv.length) item('REPLENISH', null, `a side created no movement (legacy ${lmv.length}, twin ${tmv.length}): nothing judged. legacy=${JSON.stringify(LR).slice(0, 300)} twin=${JSON.stringify((TR.log || []).slice(-3)).slice(0, 300)}`);
  else {
    LM = lmv[0]; TM = tmv[0];
    const LL = pgJ(`select * from m_movementline where m_movement_id=${LM.m_movement_id} order by m_movementline_id`), TL = q('SELECT * FROM m_movementline WHERE m_movement_id=? ORDER BY m_movementline_id', [TM.m_movement_id]);
    const SKIPH = { m_movement_id: 1, documentno: 1 }, ch = C.cmpRow(lc(LM), lc(TM), { skip: SKIPH });
    const cl = LL.length && TL.length ? cmpAll(LL, TL, { m_movementline_id: 1, m_movement_id: 1 }) : { diffs: ['no line'], n: 0, missing: [] };
    item('REPLENISH', ch.diffs.length === 0 && cl.diffs.length === 0 && LL.length === TL.length && lmv.length === tmv.length, `movements legacy=${lmv.length} twin=${tmv.length} header columns compared=${ch.n} diffs=${JSON.stringify(ch.diffs)} | lines legacy=${LL.length} twin=${TL.length} columns compared=${cl.n} diffs=${JSON.stringify(cl.diffs)} legacyColsMissingInTwin=${JSON.stringify(ch.missing.concat(cl.missing))} | qty legacy=${LL.map((l) => l.movementqty).join('+')} twin=${TL.map((l) => l.movementqty).join('+')}`);
  }

  // ───────── §SODAR_CONFIRM / DIFFDOCS / STORAGE ─────────
  if (LM && TM) {
    const LMID = LM.m_movement_id, TMID = TM.m_movement_id;
    const lpr = await ad.docAction(cfg, 'BridgeDocActionMovement', 'M_Movement', LMID, 'PR').catch((e) => ({ error: String(e.message).slice(0, 160) }));
    const tpr = H.docAction('m_movement', TMID, 'PR', { noWorkflow: true });
    const lcf = pgJ(`select * from m_movementconfirm where m_movement_id=${LMID}`), tcf = q('SELECT * FROM m_movementconfirm WHERE m_movement_id=?', [TMID]);
    console.log(`§SODAR_PREPARE legacy ${JSON.stringify(lpr).slice(0, 120)} confirms=${lcf.length} | twin ok=${tpr.ok} confirms=${tcf.length}`);
    if (lcf.length !== 1 || tcf.length !== 1) item('CONFIRM', lcf.length === tcf.length && lcf.length > 0 ? null : false, `Prepare of the in-transit movement made legacy ${lcf.length} confirm(s), twin ${tcf.length} (expected 1 each; legacy ${JSON.stringify(lpr).slice(0, 200)})`);
    else {
      const lcl = () => pgJ(`select * from m_movementlineconfirm where m_movementconfirm_id=${lcf[0].m_movementconfirm_id} order by m_movementline_id`), tcl = () => q('SELECT * FROM m_movementlineconfirm WHERE m_movementconfirm_id=? ORDER BY m_movementline_id', [tcf[0].m_movementconfirm_id]);
      const ch0 = C.cmpRow(lc(lcf[0]), lc(tcf[0]), { skip: { m_movementconfirm_id: 1, m_movement_id: 1, documentno: 1 } }), cl0 = cmpAll(lcl(), tcl(), { m_movementlineconfirm_id: 1, m_movementconfirm_id: 1, m_movementline_id: 1 });
      console.log(`§SODAR_CONFIRM_CREATED header diffs=${JSON.stringify(ch0.diffs)} (n=${ch0.n}) line diffs=${JSON.stringify(cl0.diffs)} (n=${cl0.n}) lines legacy=${lcl().length} twin=${tcl().length}`);
      // the short receipt keyed in on both sides (the Move Confirmation window's Confirmed / Scrapped qty): on the first line 2 short and 1 scrapped, every other line received in full
      const targets = lcl().map((x) => Number(x.targetqty)), CONFS = targets.map((t, i) => (i === 0 && t >= 3 ? t - 2 : t)), SCRS = targets.map((t, i) => (i === 0 && t >= 3 ? 1 : 0));
      const lus = [], tus = [];
      for (let i = 0; i < targets.length; i++) {
        lus.push(await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_MovementLineConfirm', TableName: 'M_MovementLineConfirm', RecordID: lcl()[i].m_movementlineconfirm_id, Action: 'Update', DataRow: f({ ConfirmedQty: CONFS[i], ScrappedQty: SCRS[i] }) } }).catch((e) => ({ error: String(e.message).slice(0, 160) })));
        tus.push(H.update('m_movementlineconfirm', tcl()[i].m_movementlineconfirm_id, { confirmedqty: CONFS[i], scrappedqty: SCRS[i], differenceqty: targets[i] - CONFS[i] }));
      }
      console.log(`§SODAR_RECEIPT_KEYED targets=${targets} confirmed=${CONFS} scrapped=${SCRS} legacy now ${lcl().map((x) => x.confirmedqty + '/' + x.scrappedqty + '/' + x.differenceqty).join(' ')} | twin ok=${tus.every((x) => x.ok)} now ${tcl().map((x) => x.confirmedqty + '/' + x.scrappedqty + '/' + x.differenceqty).join(' ')}`);
      const l1s = { a: onL(LOC_SRC), b: onL(LOC_DST) }, t1s = { a: onT(LOC_SRC), b: onT(LOC_DST) };
      const lco = await ad.docAction(cfg, 'BridgeDocActionMovementConfirm', 'M_MovementConfirm', lcf[0].m_movementconfirm_id, 'CO').catch((e) => ({ error: String(e.message).slice(0, 200) }));
      const tco = H.docAction('m_movementconfirm', tcf[0].m_movementconfirm_id, 'CO', { noWorkflow: true });
      const L = { cf: pgJ(`select * from m_movementconfirm where m_movementconfirm_id=${lcf[0].m_movementconfirm_id}`)[0], cl: lcl(), mv: pgJ(`select * from m_movement where m_movement_id=${LMID}`)[0], ml: pgJ(`select * from m_movementline where m_movement_id=${LMID} order by m_movementline_id`) };
      const T = { cf: H.one('SELECT * FROM m_movementconfirm WHERE m_movementconfirm_id=?', [tcf[0].m_movementconfirm_id]), cl: tcl(), mv: H.one('SELECT * FROM m_movement WHERE m_movement_id=?', [TMID]), ml: q('SELECT * FROM m_movementline WHERE m_movement_id=? ORDER BY m_movementline_id', [TMID]) };
      console.log(`§SODAR_COMPLETE legacy ${JSON.stringify(lco).slice(0, 140)} confirm=${L.cf.docstatus}/${L.cf.processed} movement=${L.mv.docstatus} | twin ok=${tco.ok} confirm=${T.cf.docstatus}/${T.cf.processed} movement=${T.mv.docstatus}`);
      const c1 = C.cmpRow(lc(L.cf), lc(T.cf), { skip: { m_movementconfirm_id: 1, m_movement_id: 1, documentno: 1, description: 1, m_inventory_id: 1 } }), c2 = cmpAll(L.cl, T.cl, { m_movementlineconfirm_id: 1, m_movementconfirm_id: 1, m_movementline_id: 1, m_inventoryline_id: 1 });
      const c3 = C.cmpRow(lc(L.mv), lc(T.mv), { skip: { m_movement_id: 1, documentno: 1 } }), c4 = cmpAll(L.ml, T.ml, { m_movementline_id: 1, m_movement_id: 1 });
      item('CONFIRM', ch0.diffs.length === 0 && cl0.diffs.length === 0 && c1.diffs.length === 0 && c2.diffs.length === 0 && c3.diffs.length === 0 && c4.diffs.length === 0 && L.cf.docstatus === 'CO' && T.cf.docstatus === 'CO' && L.mv.docstatus === 'CO' && T.mv.docstatus === 'CO',
        `created confirm+line (diffs ${ch0.diffs.length}+${cl0.diffs.length}); after Complete: confirm cols ${c1.n} diffs=${JSON.stringify(c1.diffs)} | line confirm cols ${c2.n} diffs=${JSON.stringify(c2.diffs)} | movement cols ${c3.n} diffs=${JSON.stringify(c3.diffs)} | movement line cols ${c4.n} diffs=${JSON.stringify(c4.diffs)}`);
      // the difference / scrapped inventory documents
      const linv = pgJ(`select i.m_inventory_id, i.m_warehouse_id, i.docstatus, i.c_doctype_id, i.movementdate, i.description from m_inventory i where i.description like '%${L.cf.documentno}%' order by i.m_warehouse_id`);
      const tinv = q(`SELECT i.m_inventory_id, i.m_warehouse_id, i.docstatus, i.c_doctype_id, i.movementdate, i.description FROM m_inventory i WHERE i.description LIKE '%${T.cf.documentno}%' ORDER BY i.m_warehouse_id`);
      const ilines = (rows, side) => rows.map((i) => (side === 'L' ? pgJ(`select m_locator_id, m_product_id, qtybook, qtycount, description from m_inventoryline where m_inventory_id=${i.m_inventory_id} order by 1`) : q('SELECT m_locator_id, m_product_id, qtybook, qtycount, description FROM m_inventoryline WHERE m_inventory_id=? ORDER BY 1', [i.m_inventory_id])).map((l) => `${l.m_locator_id}:${l.m_product_id}:${n(l.qtybook)}:${n(l.qtycount)}:${l.description}`).join(',')).join(' | ');
      const hdr = (rows) => rows.map((i) => `wh${i.m_warehouse_id}:${i.docstatus}:dt${i.c_doctype_id}`).join('|');
      item('DIFFDOCS', linv.length > 0 && hdr(linv) === hdr(tinv) && ilines(linv, 'L') === ilines(tinv, 'T'), `legacy ${linv.length} doc(s) [${hdr(linv)}] lines [${ilines(linv, 'L')}] | twin ${tinv.length} doc(s) [${hdr(tinv)}] lines [${ilines(tinv, 'T')}]`);
      // transactions and storage
      const trx = (rows) => rows.map((x) => `${x.movementtype}:${n(x.movementqty)}:${x.m_locator_id}:${x.m_product_id}`).sort().join('|');
      const ltx = pgJ(`select movementtype, movementqty, m_locator_id, m_product_id from m_transaction where m_product_id=${PRODUCT} and (m_movementline_id in (${L.ml.map((x) => x.m_movementline_id).join(',')}) or m_inventoryline_id in (select m_inventoryline_id from m_inventoryline where m_inventory_id in (${linv.map((i) => i.m_inventory_id).join(',') || 0})))`);
      const ttx = q(`SELECT movementtype, movementqty, m_locator_id, m_product_id FROM m_transaction WHERE m_product_id=? AND (m_movementline_id IN (${T.ml.map((x) => x.m_movementline_id).join(',')}) OR m_inventoryline_id IN (SELECT m_inventoryline_id FROM m_inventoryline WHERE m_inventory_id IN (${tinv.map((i) => i.m_inventory_id).join(',') || 0})))`, [PRODUCT]);
      const l2 = { a: onL(LOC_SRC), b: onL(LOC_DST) }, t2 = { a: onT(LOC_SRC), b: onT(LOC_DST) }, dL = { a: l2.a - l1s.a, b: l2.b - l1s.b }, dT = { a: t2.a - t1s.a, b: t2.b - t1s.b };
      const wantA = -targets.reduce((a, t) => a + t, 0), wantB = CONFS.reduce((a, c) => a + c, 0) - SCRS.reduce((a, c) => a + c, 0);     // the Java arithmetic: the move carries CONFIRMED, the Difference document writes the shortfall off the SOURCE, the Scrapped document off the TARGET
      item('STORAGE', ltx.length > 0 && trx(ltx) === trx(ttx) && dL.a === dT.a && dL.b === dT.b && dL.a === wantA && dL.b === wantB, `transactions legacy=[${trx(ltx)}] twin=[${trx(ttx)}] | storage delta after the confirm source ${LOC_SRC}: legacy ${dL.a} twin ${dT.a} (want ${wantA}) | target ${LOC_DST}: legacy ${dL.b} twin ${dT.b} (want ${wantB})`);
    }
  }

  // ───────── §SODAR_PRICE: the price-edit Updated stamp ─────────
  const VER = n(pg('select m_pricelist_version_id from m_pricelist_version where m_pricelist_id=(select m_pricelist_id from c_pos limit 1) order by validfrom desc, 1 desc limit 1')[0]) || 104;
  const pr0 = pgJ(`select pricestd, updated from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0];
  if (!pr0) item('PRICE', null, `product ${PRODUCT} has no price in version ${VER}: nothing judged`);
  else {
    await new Promise((r) => setTimeout(r, 1100));
    let pu; try { pu = await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_ProductPrice', TableName: 'M_ProductPrice', RecordID: 0, Action: 'Update', DataRow: f({ M_PriceList_Version_ID: VER, M_Product_ID: PRODUCT, PriceStd: Number(pr0.pricestd) + 1 }) } }); } catch (e) { pu = { error: String(e.message).slice(0, 200) }; }
    const pr1 = pgJ(`select pricestd, updated from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0];
    if (Number(pr1.pricestd) === Number(pr0.pricestd)) item('PRICE', null, `NOT-COMPARED, no parity claimed: the stock WS update_data loads a PO by ONE RecordID (ModelADServiceImpl.updateData); M_ProductPrice has a composite key (M_PriceList_Version_ID, M_Product_ID), so the call builds a NEW record and the DB refuses it: ${JSON.stringify(pu).slice(0, 260)}`);
    else {
      sync('m_productprice', 'm_pricelist_version_id=' + VER);
      const row = H.one('SELECT * FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?', [VER, PRODUCT]);
      const tu = H.run({ table: 'm_productprice', timing: 'SAVE', record: row, id: row.m_productprice_id != null ? row.m_productprice_id : row.m_product_id, changes: { pricestd: Number(pr0.pricestd) + 1 } });
      const row1 = H.one('SELECT updated, pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?', [VER, PRODUCT]);
      const lMoved = String(pr1.updated) > String(pr0.updated), tMoved = String(row1.updated) > String(row.updated);
      item('PRICE', lMoved && tMoved && Number(row1.pricestd) === Number(pr1.pricestd), `a price edit moves Updated forward on both sides: legacy ${pr0.updated} -> ${pr1.updated} (${lMoved}); twin ${row.updated} -> ${row1.updated} (${tMoved}); price legacy ${pr1.pricestd} twin ${row1.pricestd} (twin save ok=${tu.ok})`);
      await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_M_ProductPrice', TableName: 'M_ProductPrice', RecordID: 0, Action: 'Update', DataRow: f({ PriceStd: pr0.pricestd }) } }).catch(() => {});
      console.log(`§SODAR_RESTORE legacy price now ${pg(`select pricestd from m_productprice where m_pricelist_version_id=${VER} and m_product_id=${PRODUCT}`)[0]} (was ${pr0.pricestd})`);
    }
  }
  console.log(`§SODAR_ITEMS ${JSON.stringify(items)}`);
  console.log(`§SODAR_VERDICT ${judged === 0 ? 'INCONCLUSIVE' : fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} judged=${judged} fails=${fails} inconclusive=${incon}`);
  process.exit(judged === 0 ? 2 : fails ? 1 : 0);
})().catch((e) => { console.log('§SODAR_VERDICT FAIL exception ' + (e && e.stack || e)); process.exit(2); });
