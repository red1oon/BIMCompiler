// ⚠ DO NOT REMOVE — W-ICON-PARITY (prompts/POS_PLUGIN_LOCAL_FIRST.md §30). READ THE LOG: §SCN / §GAP / §PRODUCT_ICONS lines; the exit code is not evidence.
// The 27 till products get M_Product.ImageURL (a URL into OCI object storage, never bytes). Two loads, each run on BOTH sides with the same facts and judged by reconcile.js:
//   ICON-IMPORT-UPDATE   Import Product (AD_Process 196) on 27 I_Product rows (Value + ImageURL + the product's own ProductType): legacy = rows through Bridge_createData_I_Product + run_process; twin = the ported
//                        processes/ImportProduct.js in the ERP kernel. Legacy source fact (ImportProduct.java:509-550): the UPDATE branch does NOT set ImageURL, so both sides must still show the old ImageURL.
//   ICON-IMPORT-UNKNOWN  a Value that matches no product and has no Name: the row is an I_ErrorMsg row on both sides, no product made.
//   ICON-IMAGEURL-LOAD   the ordinary Product-window edit of ImageURL (legacy Bridge_updateData_M_Product; twin ML.save at head office): ImageURL of the 27 equal, and equal to the list.
// Needs: docker postgres + pilot :8088; BRIDGE_OOTB = a bim-ootb worktree holding erp/processes/ImportProduct.js + erp/product_icons/product_icons.json (+ SQLJS_DIR).
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ad = require('./ad_client'), R = require('./reconcile');
const OOTB = process.env.BRIDGE_OOTB; if (!OOTB) { console.log('§PRODUCT_ICONS_VERDICT W-ICON-PARITY HARNESS-FAIL set BRIDGE_OOTB to the bim-ootb worktree'); process.exit(2); }
const ERP = path.join(OOTB, 'erp'), SQLJS_DIR = process.env.SQLJS_DIR || '/home/red1/bim-ootb/tests/node_modules/sql.js';
if (!process.env.SQLJS) process.env.SQLJS = SQLJS_DIR;
global.window = global.window || {}; if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
const LIST = JSON.parse(fs.readFileSync(path.join(ERP, 'product_icons/product_icons.json'), 'utf8')).products;
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-AtF', '|', '-c', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
const cfg = ad.cfgFromEnv(), CLIENT = 11;
const f = o => ({ field: Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const lcreate = async (t, o) => +(await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: `Bridge_createData_${t}`, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } })).StandardResponse['@RecordID'];
const lupdate = (t, id, o) => ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: `Bridge_updateData_${t}`, TableName: t, RecordID: id, Action: 'Update', DataRow: f(o) } });
const inList = LIST.map(p => `'${p.value.replace(/'/g, "''")}'`).join(',');

async function twinBoot() {
  const initSqlJs = require(SQLJS_DIR), SQL = await initSqlJs({ locateFile: x => path.join(SQLJS_DIR, 'dist', x) });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(path.join(ERP, 'ad_seed.db'))));
  fs.readFileSync(path.join(ERP, 'patches/ad_seed.db.sql'), 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.run(st); } catch (e) {} });
  const log0 = console.log; console.log = () => {};      // the kernel's own § lines are not this witness's evidence (this witness prints its own)
  try { require(path.join(ERP, 'ad_rule.js')).ensure(db); require(path.join(ERP, 'ad_import_tables.js')).ensure(db); } catch (e) { console.log = log0; throw e; }
  const K = require(path.join(ERP, 'ws_kernel.js')), k = K.build(db), AP = require(path.join(ERP, 'ad_process.js'));
  require(path.join(ERP, 'processes/ImportProduct.js'));
  console.log = log0;
  return { db, k, ML: k.ML, AP, S: { clientId: CLIENT, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'witness:product-icons' } };
}
(async () => {
  const T = await twinBoot();
  const tq = (sql, p) => T.k.q(sql, p || []);
  const commit = fn => { const trx = new T.ML.Trx(T.k.q, Object.assign(T.k.env(T.S), { noPost: true })); const r = fn(trx) || { ok: true }; if (r.ok !== false) { const ops = trx.groupOps(); if (ops.length) T.k.commit(T.S, ops, { ws: 'icons' }); } return Object.assign({}, r, { trx }); };
  const twinSave = rows => commit(trx => { for (const r of rows) { const sv = T.ML.save(trx, 'i_product', null, T.ML.newPO(trx, 'i_product', r)); if (!sv.ok) return { ok: false, error: sv.error }; } return { ok: true }; });
  const twinRun = () => commit(trx => { const r = T.AP.runInTrx(trx, 196, { params: { AD_Client_ID: CLIENT, DeleteOldImported: 'Y' } }); return { ok: r.ok, r, error: r.summary }; });
  // legacy products by Value (read WS) + the twin's
  const lprod = async () => { const all = await ad.query(cfg, 'QueryMProduct', ''), m = {}; for (const p of LIST) { const r = all.filter(x => x.Value === p.value && +x.AD_Client_ID === CLIENT); if (r.length !== 1) throw new Error(`legacy ${p.value} -> ${r.length} rows`); m[p.value] = r[0]; } return m; };   // the pilot's QueryMProduct ignores Filter: read all, pick by Value
  const tprod = () => { const m = {}; for (const p of LIST) m[p.value] = tq('SELECT * FROM m_product WHERE value=? AND ad_client_id=?', [p.value, CLIENT])[0]; return m; };
  const L0 = await lprod(), T0 = tprod();
  console.log(`§PRODUCT_ICONS population legacy=${Object.keys(L0).length} twin=${Object.values(T0).filter(Boolean).length} of ${LIST.length} (GardenWorld client ${CLIENT})`);
  const lcount = () => +pg(`select count(*) from m_product where ad_client_id=${CLIENT}`)[0], tcount = () => +tq('SELECT count(*) AS n FROM m_product WHERE ad_client_id=?', [CLIENT])[0].n;
  const c0 = { l: lcount(), t: tcount() };
  const urls = m => LIST.map(p => `${p.value}=${(m[p.value] && (m[p.value].ImageURL || m[p.value].imageurl)) || ''}`).join('|');
  const types = m => LIST.map(p => `${p.value}=${(m[p.value] && (m[p.value].ProductType || m[p.value].producttype)) || ''}`).join('|');

  const scenarios = [
    { id: 'ICON-IMPORT-UPDATE', facts: {},
      legacy: async () => {
        // re-runnable: put legacy's ImageURL back to the seed value first (a normal Product edit through the WS; '' = none), so the 'import does not set ImageURL' fact is judged from the same start on both sides
        let reset = 0; for (const p of LIST) { const want = T0[p.value].imageurl || '', have = L0[p.value].ImageURL || ''; if (have !== want) { await lupdate('M_Product', +L0[p.value].M_Product_ID, { ImageURL: want }); reset++; } }
        if (reset) { const m1 = await lprod(); for (const p of LIST) L0[p.value] = m1[p.value]; }
        console.log(`§PRODUCT_ICONS legacy_start_reset products=${reset}`);
        for (const p of LIST) await lcreate('I_Product', { AD_Client_ID: CLIENT, AD_Org_ID: 0, Value: p.value, ImageURL: p.url, ProductType: L0[p.value].ProductType, I_IsImported: 'N' });
        const r = await ad.runProcess(cfg, 'Bridge_RunProcess_ImportProduct', { AD_Client_ID: CLIENT, DeleteOldImported: 'Y' });
        const rows = pg(`select i_isimported, coalesce(i_errormsg,''), m_product_id from i_product where value in (${inList}) order by value`);
        console.log(`§PRODUCT_ICONS legacy import ok=${r.ok} error=${r.error || ''} summary=${JSON.stringify(r.summary || '')} logs=${JSON.stringify(r.logs || '').slice(0, 300)}`);
        const m = await lprod(); const ids = LIST.every(p => rows.some(x => x.split('|')[2] === String(L0[p.value].M_Product_ID)));
        return { outcome: r.ok ? 'OK' : 'REFUSED', imported: rows.filter(x => x.startsWith('Y|')).length, errors: rows.filter(x => !x.startsWith('Y|')).length, matched_by_value: ids, error_text: rows.map(x => x.split('|')[1].trim()).filter(Boolean).join(';') || 'none', imageurls: urls(m), producttypes: types(m), product_count_delta: lcount() - c0.l };
      },
      local: async () => {
        twinSave(LIST.map(p => ({ ad_client_id: CLIENT, ad_org_id: 0, value: p.value, imageurl: p.url, producttype: T0[p.value].producttype, i_isimported: 'N' })));
        const r = twinRun(); const rows = tq(`SELECT * FROM i_product WHERE value IN (${inList}) ORDER BY value`);
        const m = tprod(); const ids = LIST.every(p => rows.some(x => String(x.m_product_id) === String(T0[p.value].m_product_id)));
        return { outcome: r.ok ? 'OK' : 'REFUSED', imported: rows.filter(x => x.i_isimported === 'Y').length, errors: rows.filter(x => x.i_isimported !== 'Y').length, matched_by_value: ids, error_text: rows.map(x => String(x.i_errormsg || '').trim()).filter(Boolean).join(';') || 'none', imageurls: urls(m), producttypes: types(m), product_count_delta: tcount() - c0.t };
      } },
    { id: 'ICON-IMPORT-UNKNOWN', facts: {},
      legacy: async () => {
        const id = await lcreate('I_Product', { AD_Client_ID: CLIENT, AD_Org_ID: 0, Value: 'ICON-NO-SUCH', ImageURL: 'https://x.invalid/a.svg', I_IsImported: 'N' });
        const n0 = lcount(); const r = await ad.runProcess(cfg, 'Bridge_RunProcess_ImportProduct', { AD_Client_ID: CLIENT, DeleteOldImported: 'N' });
        const row = pg(`select i_isimported, coalesce(i_errormsg,'') from i_product where i_product_id=${id}`)[0].split('|');
        await lupdate('I_Product', id, { I_IsImported: 'Y', Processed: 'Y' });          // retire the throwaway row through the WS (so a later run is not polluted)
        return { outcome: r.ok ? 'OK' : 'REFUSED', imported: row[0] === 'Y' ? 1 : 0, errors: row[0] === 'Y' ? 0 : 1, matched_by_value: 'n/a', error_text: row[1].trim() || 'none', imageurls: 'n/a', producttypes: 'n/a', product_count_delta: lcount() - n0 };
      },
      local: async () => {
        twinSave([{ ad_client_id: CLIENT, ad_org_id: 0, value: 'ICON-NO-SUCH', imageurl: 'https://x.invalid/a.svg', i_isimported: 'N' }]);
        const n0 = tcount(); const r = twinRun(); const row = tq("SELECT * FROM i_product WHERE value='ICON-NO-SUCH'")[0];
        return { outcome: r.ok ? 'OK' : 'REFUSED', imported: row.i_isimported === 'Y' ? 1 : 0, errors: row.i_isimported === 'Y' ? 0 : 1, matched_by_value: 'n/a', error_text: String(row.i_errormsg || '').trim() || 'none', imageurls: 'n/a', producttypes: 'n/a', product_count_delta: tcount() - n0 };
      } },
    { id: 'ICON-IMAGEURL-LOAD', facts: {},
      legacy: async () => {
        for (const p of LIST) await lupdate('M_Product', +L0[p.value].M_Product_ID, { ImageURL: p.url });
        const m = await lprod(); return { outcome: 'OK', imported: 'n/a', errors: 'n/a', matched_by_value: 'n/a', error_text: 'n/a', imageurls: urls(m), producttypes: types(m), product_count_delta: lcount() - c0.l };
      },
      local: async () => {
        const r = commit(trx => { for (const p of LIST) { const row = trx.get('m_product', T0[p.value].m_product_id); const sv = T.ML.save(trx, 'm_product', row, { imageurl: p.url }); if (!sv.ok) return { ok: false, error: sv.error }; } return { ok: true }; });
        if (!r.ok) return { outcome: 'ERROR', error: r.error };
        const m = tprod(); return { outcome: 'OK', imported: 'n/a', errors: 'n/a', matched_by_value: 'n/a', error_text: 'n/a', imageurls: urls(m), producttypes: types(m), product_count_delta: tcount() - c0.t };
      } },
  ];
  const spec = { keys: ['outcome', 'imported', 'errors', 'matched_by_value', 'error_text', 'imageurls', 'producttypes', 'product_count_delta'], notCompared: { 'Updated timestamp': 'getDate() differs by wall clock', 'M_Product_PO / price list': 'no BPartner / PriceList_Version in the rows (not exercised)' } };
  const rows = await R.run(scenarios, spec, [], { log: console.log });
  const want = LIST.map(p => `${p.value}=${p.url}`).join('|'), last = rows[2];
  const loaded = last && last.legacy && last.sqlite && last.legacy.imageurls === want && last.sqlite.imageurls === want;
  const upd = rows[0] && rows[0].legacy && rows[0].legacy.imported;
  console.log(`§PRODUCT_ICONS import_update legacy=${JSON.stringify(rows[0] && { i: rows[0].legacy.imported, e: rows[0].legacy.errors })} twin=${JSON.stringify(rows[0] && { i: rows[0].sqlite.imported, e: rows[0].sqlite.errors })}; unknown legacy=${JSON.stringify(rows[1] && rows[1].legacy.error_text)} twin=${JSON.stringify(rows[1] && rows[1].sqlite.error_text)}`);
  const leg = rows[0] && rows[0].legacy ? (rows[0].legacy.imageurls.match(/oraclecloud/g) || []).length : -1, tw = rows[0] && rows[0].sqlite ? (rows[0].sqlite.imageurls.match(/oraclecloud/g) || []).length : -1;
  console.log(`§PRODUCT_ICONS after_import_urls legacy=${leg} twin=${tw} (legacy fact: the Import Product update does not set ImageURL, so 0 on both)`);
  console.log(`§PRODUCT_ICONS imageurl_after_load 27of27 legacy==twin==list ${loaded ? 'YES' : 'NO'}`);
  const verdict = !rows.length ? 'INCONCLUSIVE' : rows.some(r => r.verdict === 'ERROR') ? 'HARNESS-FAIL' : rows.every(r => r.verdict === 'MATCH') && loaded && upd === 27 ? 'MATCH' : 'FAIL';
  console.log(`§PRODUCT_ICONS_VERDICT W-ICON-PARITY ${verdict} scenarios=${rows.map(r => r.id + ':' + r.verdict).join(',')} imported=${upd}`);
  process.exit(verdict === 'MATCH' ? 0 : 1);
})().catch(e => { console.log('§PRODUCT_ICONS_VERDICT W-ICON-PARITY HARNESS-FAIL ' + (e.stack || e.message).split('\n').slice(0, 4).join(' <- ')); process.exit(2); });
