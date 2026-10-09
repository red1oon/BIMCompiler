// ⚠ DO NOT REMOVE — FIXED ASSETS parallel run (spec prompts/SQLiteIDEMPIERE.md §61/§63, the user's headline §52 3b). READ THE LOG after every run.
// Legacy (local pilot iDempiere) = the oracle, reached ONLY through the frozen legacy_link (descriptors below are test data) + read-only WS query types.
// SQLite side = erp_engine.fa* (registration, addition, schedule, depreciation entry) + doc_poster folds, on a SCRATCH copy of glassbowl_data.db
// (+ the asset dictionary rows of ad_seed_fullwidth.db, then the legacy dict_diff patch = handover). Shared dbs are never written.
//   HARNESS (pass/fail): negative control caught, no ERROR, not vacuous.   FINDINGS: §GAP lines (the product; reported, not asserted away).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const { cfgFromEnv, query } = require('./ad_client');
const { createLink } = require('./legacy_link');
const R = require('./reconcile');
const DD = require('./dict_diff');
const E = require('../erp_engine');
const DP = require('../doc_poster');
const log = l => console.log(l);
const cents = v => Math.round(Number(v) * 100);
const lc = r => { if (!r) return r; const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };
const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();   // legacy server's local day (§59 P17)
const day = v => (v == null ? null : String(v).slice(0, 10));
const SCHEMAS = [101, 200000], T_ADD = 53137, T_DEP = 53121, T_DIS = 53127, DT_ADD = 200001, DT_DEP = 200002, PRODUCT = 145;
const fmtPostings = lines => lines.map(l => ({ a: l.account_id, dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) })).filter(x => x.dr || x.cr)
  .sort((x, y) => x.a - y.a).map(x => `${x.a}:DR${x.dr}/CR${x.cr}`).join('|') || 'none';

// ================= SQLite side state (scratch) =================
const ROOT = path.join(__dirname, '..', '..', 'build', 'erp');
const gbFile = path.join(os.tmpdir(), 'fa-gb-' + process.pid + '.db'); fs.copyFileSync(path.join(ROOT, 'glassbowl_data.db'), gbFile);
const gb = new Database(gbFile);
DD.applyPatch(gb, fs.readFileSync(path.join(ROOT, 'patches', 'glassbowl_data.db.sql'), 'utf8'));
const seed = new Database(path.join(ROOT, 'ad_seed_fullwidth.db'), { readonly: true });
const copyTable = (t, where) => {   // the SQLite side's OWN asset dictionary (seed) into the working copy
  const cols = seed.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
  gb.exec(`CREATE TABLE IF NOT EXISTS ${t}(${cols.join(',')})`);
  const ins = gb.prepare(`INSERT INTO ${t}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})`);
  const rows = seed.prepare(`SELECT * FROM ${t}${where ? ' WHERE ' + where : ''}`).raw().all(); rows.forEach(r => ins.run(r)); return rows.length;
};
const nSeed = { a_asset_group: copyTable('a_asset_group', 'ad_client_id=11'), a_asset_group_acct: copyTable('a_asset_group_acct', 'ad_client_id=11'), a_depreciation: copyTable('a_depreciation') };
// working tables the bundle carries for the asset lifecycle (test materialisation; the posting folds read a_asset_addition/a_asset_acct/a_depreciation_entry/_exp)
gb.exec(`CREATE TABLE a_asset(a_asset_id INT, ad_client_id INT, ad_org_id INT, value TEXT, a_asset_group_id INT, m_product_id INT, a_asset_status TEXT, isdepreciated TEXT, isowned TEXT, uselifemonths INT, assetservicedate TEXT, assetactivationdate TEXT);
CREATE TABLE a_asset_acct(a_asset_id INT, ad_client_id INT, ad_org_id INT, c_acctschema_id INT, postingtype TEXT, validfrom TEXT, a_depreciation_id INT, a_depreciation_f_id INT, a_asset_acct INT, a_depreciation_acct INT, a_accumdepreciation_acct INT);
CREATE TABLE a_depreciation_workfile(j TEXT, a_asset_id INT, c_acctschema_id INT, postingtype TEXT);
CREATE TABLE a_depreciation_exp(a_depreciation_exp_id INTEGER PRIMARY KEY, j TEXT, a_asset_id INT, c_acctschema_id INT, a_depreciation_entry_id INT, expense REAL, dr_account_id INT, cr_account_id INT);
CREATE TABLE a_asset_addition(a_asset_addition_id INT, a_asset_id INT, ad_client_id INT, ad_org_id INT, a_sourcetype TEXT, a_capvsexp TEXT, c_currency_id INT, assetsourceamt REAL, dateacct TEXT, c_charge_id INT, m_product_id INT, c_project_id INT, docstatus TEXT, a_createasset TEXT);
CREATE TABLE a_depreciation_entry(a_depreciation_entry_id INT, ad_client_id INT, ad_org_id INT, c_acctschema_id INT, dateacct TEXT, docstatus TEXT);
CREATE TABLE a_asset_disposed(a_asset_disposed_id INT, a_asset_id INT, ad_client_id INT, ad_org_id INT, dateacct TEXT, postingtype TEXT, docstatus TEXT);
CREATE TABLE a_asset_change(a_asset_change_id INTEGER PRIMARY KEY, a_asset_id INT, c_acctschema_id INT, postingtype TEXT, changetype TEXT, assetvalueamt REAL, assetbookvalueamt REAL, assetaccumdepreciationamt REAL);
ALTER TABLE a_asset_acct ADD COLUMN a_disposal_loss_acct INT;`);
const wkGet = (a, s) => { const r = gb.prepare("SELECT j FROM a_depreciation_workfile WHERE a_asset_id=? AND c_acctschema_id=? AND postingtype='A'").get(a, s); return r ? JSON.parse(r.j) : null; };
const wkPut = w => { gb.prepare("DELETE FROM a_depreciation_workfile WHERE a_asset_id=? AND c_acctschema_id=? AND postingtype=?").run(w.a_asset_id, w.c_acctschema_id, w.postingtype);
  gb.prepare('INSERT INTO a_depreciation_workfile(j,a_asset_id,c_acctschema_id,postingtype) VALUES(?,?,?,?)').run(JSON.stringify(w), w.a_asset_id, w.c_acctschema_id, w.postingtype); };
const expAll = () => gb.prepare('SELECT a_depreciation_exp_id id, j FROM a_depreciation_exp').all().map(r => Object.assign(JSON.parse(r.j), { a_depreciation_exp_id: r.id }));
const expPut = r => { const j = JSON.stringify(r); const cols = [j, r.a_asset_id, r.c_acctschema_id, r.a_depreciation_entry_id == null ? null : r.a_depreciation_entry_id, r.expense / 100, r.dr_account_id, r.cr_account_id];
  if (r.a_depreciation_exp_id) gb.prepare('UPDATE a_depreciation_exp SET j=?,a_asset_id=?,c_acctschema_id=?,a_depreciation_entry_id=?,expense=?,dr_account_id=?,cr_account_id=? WHERE a_depreciation_exp_id=?').run(...cols, r.a_depreciation_exp_id);
  else gb.prepare('INSERT INTO a_depreciation_exp(j,a_asset_id,c_acctschema_id,a_depreciation_entry_id,expense,dr_account_id,cr_account_id) VALUES(?,?,?,?,?,?,?)').run(...cols); };
const typeOf = id => (lc(gb.prepare('SELECT depreciationtype FROM a_depreciation WHERE a_depreciation_id=?').get(id)) || {}).depreciationtype;
const schemaCur = s => gb.prepare('SELECT c_currency_id c FROM c_acctschema WHERE c_acctschema_id=?').get(s).c;
// amount × rate HALF_UP at precision 2 (MConversionRate.convert :140-147), exact decimal arithmetic
const convert = (amtCents, rate) => { const [i, f = ''] = String(rate).split('.'); const den = 10n ** BigInt(f.length), n = BigInt(amtCents) * BigInt(i + f);
  const neg = n < 0n, a = neg ? -n : n, q = a / den + ((a % den) * 2n >= den ? 1n : 0n); return Number(neg ? -q : q); };
// §42 period data (the SQLite side's own seed): client primary schema auto-control + calendar periods + control rows
const periodData = (() => {
  const ci = lc(seed.prepare('SELECT c_acctschema1_id s, c_calendar_id c FROM ad_clientinfo WHERE ad_client_id=11').get());
  const schema = lc(seed.prepare('SELECT autoperiodcontrol, period_openhistory, period_openfuture FROM c_acctschema WHERE c_acctschema_id=?').get(ci.s));
  const periods = seed.prepare('SELECT p.c_period_id, p.startdate, p.enddate, p.isactive, p.periodtype FROM c_period p JOIN c_year y ON y.c_year_id=p.c_year_id WHERE y.c_calendar_id=?').all(ci.c).map(lc);
  const ctl = seed.prepare('SELECT docbasetype, periodstatus FROM c_periodcontrol WHERE c_period_id=?');
  periods.forEach(p => { p.control = Object.fromEntries(ctl.all(p.c_period_id).map(lc).map(r => [r.docbasetype, r.periodstatus])); });
  return { schema, periods };
})();
const periodOf = d => periodData.periods.find(p => String(p.startdate).slice(0, 10) <= d && d <= String(p.enddate).slice(0, 10) && p.isactive === 'Y');

// ================= key formatting (both sides use the SAME formatters) =================
const fmtWk = w => `${cents(w.a_asset_cost)}:${w.uselifemonths}/${w.uselifemonths_f}:${w.a_life_period}:${w.a_current_period}:${day(w.dateacct)}`;
const fmtWkAfter = w => `${cents(w.a_accumulated_depr)}/${cents(w.a_accumulated_depr_f)}:${w.a_current_period}:${day(w.dateacct)}`;
const fmtSched = rows => { if (!rows.length) return 'none'; const s = rows.slice().sort((a, b) => a.a_period - b.a_period), f = s[0], l = s[s.length - 1], ce = r => `${r.a_period}:${day(r.dateacct)}:${cents(r.expense)}/${cents(r.expense_f)}`;
  return `n=${s.length}|first=${ce(f)}|last=${ce(l)}|sum=${s.reduce((a, r) => a + cents(r.expense), 0)}/${s.reduce((a, r) => a + cents(r.expense_f), 0)}`; };
const fmtEntry = (status, rows, own) => { const o = rows.filter(r => +r.a_asset_id === +own); return `${status}:n=${rows.length}:own=${o.map(r => `${r.a_period}:${cents(r.expense)}/${cents(r.expense_f)}:${r.processed === true || r.processed === 'Y' ? 'P' : '-'}`).join(',') || 'none'}`; };

// ================= Legacy side (oracle): frozen link + read types =================
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
const FA_DESC = {
  reg: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateAsset', table: 'A_Asset', fields: { AD_Org_ID: { const: 11 }, Value: { path: 'value' }, Name: { path: 'value' }, A_Asset_Group_ID: { path: 'group' }, M_Product_ID: { const: PRODUCT },
      M_AttributeSetInstance_ID: { const: 0 }, IsOwned: { const: 'Y' }, IsDepreciated: { const: 'Y' }, IsInPosession: { const: 'Y' }, IsDisposed: { const: 'N' }, UseLifeMonths: { const: 12 }, UseLifeYears: { const: 1 }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateAssetAddition', table: 'A_Asset_Addition', parent: 'A_Asset_ID', from: 'adds',
      fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: DT_ADD }, A_SourceType: { const: 'MAN' }, AssetSourceAmt: { path: 'amt' }, AssetAmtEntered: { path: 'amt' }, C_Currency_ID: { const: 100 },
        DateDoc: { path: 'date' }, DateAcct: { path: 'date' }, A_QTY_Current: { const: 1 }, PostingType: { const: 'A' }, A_CapvsExp: { const: 'Cap' }, M_Product_ID: { const: PRODUCT } } },
    docAction: { serviceType: 'BridgeCompleteAssetAddition', table: 'A_Asset_Addition', action: 'CO' } },
  dep: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateDepreciationEntry', table: 'A_Depreciation_Entry', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: DT_DEP }, C_AcctSchema_ID: { path: 'schema' }, C_Currency_ID: { path: 'cur' },
      DateAcct: { path: 'date' }, DateDoc: { path: 'date' }, PostingType: { const: 'A' }, A_Entry_Type: { const: 'DEP' }, Description: { path: 'note' },
      IsApproved: { path: 'approved' } } },   // AD default @#IsCanApproveOwnDoc@ = the login role's flag (role 102: Y), what the window fills (§63)
    docAction: { serviceType: 'BridgeCompleteDepreciationEntry', table: 'A_Depreciation_Entry', action: 'CO' } },
  dis: { composite: 'SyncOrder',   // §74: header-only disposal + CO (the window: Asset Disposal, method Simple)
    header: { serviceType: 'BridgeCreateAssetDisposed', table: 'A_Asset_Disposed', fields: { AD_Org_ID: { const: 11 }, A_Asset_ID: { path: 'asset' }, DateDoc: { path: 'date' }, DateAcct: { path: 'date' },
      A_Disposed_Date: { path: 'date' }, A_Disposed_Method: { const: 'S' }, PostingType: { const: 'A' }, A_Activation_Method: { const: 'AA' }, Description: { path: 'note' } } },
    docAction: { serviceType: 'BridgeCompleteAssetDisposed', table: 'A_Asset_Disposed', action: 'CO' } } };
const DISP_NA = Object.fromEntries(['disp', 'disp_open_exp'].concat(...SCHEMAS.map(s => ['disp_change_' + s, 'disp_wk_' + s, 'books_dis_' + s])).map(k => [k, 'n/a']));
let link = null;
const L = async () => { if (!link) { let bytes = null; link = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: FA_DESC }); } return link; };
const wait = ms => new Promise(r => setTimeout(r, ms));
async function postedOf(readType, col, id) { let h; for (let i = 0; i < 10; i++) { h = (await query(cfg, readType, `${col}=${id}`))[0] || {}; if (h.Posted === 'Y' || h.Posted === true || h.Posted === 'E') break; await wait(1500); } return h; }
async function legacyBooks(table, id, schema) {
  const fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${schema}`);
  const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
  return fmtPostings(Object.values(by));
}
const lexp = r => ({ ...lc(r), processed: r.Processed === true || r.Processed === 'Y' ? 'Y' : 'N' });
let ROLE_APPROVES_OWN = null;   // read from legacy (AD_Role.IsCanApproveOwnDoc of the login role) before the run
const handover = {};   // facts legacy held BEFORE the entry that the SQLite side must hold too (other assets' unassigned rows of the month) — filled by the legacy run, read by the local run
async function legacyFA(f) {
  const lk = await L(), uid = lk.submit('reg', { value: 'FA-' + f.id + '-' + Date.now().toString(36), group: f.group, note: 'FA ' + f.id, adds: [{ amt: f.amt, date: TODAY + ' 00:00:00' }] });
  await lk.drain(); const st = lk.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 160) };
  // the composite answer carries no RecordID for the addition (idmap holds only the asset, observed 2026-10-10, P17 note in §63) ⇒ the addition is READ by its asset
  const im = lk.store.idmap(uid), aid = im.find(x => x.tbl === 'A_Asset').server_id;
  const adds = await query(cfg, 'QueryAAssetAddition', `A_Asset_ID=${aid}`); if (adds.length !== 1) throw new Error('§FA_ADDITION_READ n=' + adds.length);
  const addId = adds[0].A_Asset_Addition_ID;
  log(`§FA_LEGACY ${f.id} asset=${aid} addition=${addId}`);
  const a = (await query(cfg, 'QueryAAsset', `A_Asset_ID=${aid}`))[0];
  const add = await postedOf('QueryAAssetAddition', 'A_Asset_Addition_ID', addId);
  const res = { outcome: 'COMPLETED', asset: `${a.A_Asset_Status}:${day(a.AssetServiceDate)}`, addition: `${add.DocStatus}:${add.A_CreateAsset === true || add.A_CreateAsset === 'Y' ? 'create' : 'adjust'}` };
  const wks = (await query(cfg, 'QueryADepreciationWorkfile', `A_Asset_ID=${aid}`)).map(lc);
  handover[f.id] = { schemas: {} };
  for (const s of SCHEMAS) {
    const w = wks.find(x => +x.c_acctschema_id === s);
    res['wk_' + s] = w ? fmtWk(w) : 'none';
    res['sched_' + s] = fmtSched((await query(cfg, 'QueryADepreciationExp', `A_Asset_ID=${aid} AND C_AcctSchema_ID=${s}`)).map(lexp));
    res['books_add_' + s] = add.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyBooks(T_ADD, addId, s);
  }
  // the Depreciation Entry, one per schema, for today's period (state BEFORE it is captured for the handover first)
  if (f.noDep) for (const s of SCHEMAS) { res['entry_' + s] = 'skipped'; res['books_dep_' + s] = 'skipped'; res['wk_after_' + s] = 'skipped'; }
  for (const s of (f.noDep ? [] : SCHEMAS)) {
    const mon = TODAY.slice(0, 7) + '-01';
    const pend = (await query(cfg, 'QueryADepreciationExp', `A_Depreciation_Entry_ID IS NULL AND AD_Org_ID=11 AND C_AcctSchema_ID=${s} AND TRUNC(DateAcct,'MM')=TO_DATE('${mon}','YYYY-MM-DD') AND A_Asset_ID<>${aid}`)).map(lexp);
    const others = [...new Set(pend.map(r => +r.a_asset_id))], ho = { pending: pend, assets: [], workfiles: [], rows: [] };
    for (const o of others) { ho.assets.push(lc((await query(cfg, 'QueryAAsset', `A_Asset_ID=${o}`))[0])); ho.workfiles.push(...(await query(cfg, 'QueryADepreciationWorkfile', `A_Asset_ID=${o}`)).map(lc)); ho.rows.push(...(await query(cfg, 'QueryADepreciationExp', `A_Asset_ID=${o}`)).map(lexp)); }
    handover[f.id].schemas[s] = ho;
    const du = lk.submit('dep', { approved: ROLE_APPROVES_OWN, schema: s, cur: s === 101 ? 100 : 102, date: TODAY + ' 00:00:00', note: 'FA ' + f.id }); await lk.drain(); const ds = lk.store.get(du);
    if (ds.state !== 'CONFIRMED') { res['entry_' + s] = 'REJECTED:' + (ds.error || '').slice(0, 100); res['books_dep_' + s] = 'none'; res['wk_after_' + s] = 'none'; continue; }
    const eid = lk.store.idmap(du).find(x => x.tbl === 'A_Depreciation_Entry').server_id;
    const e = await postedOf('QueryADepreciationEntry', 'A_Depreciation_Entry_ID', eid);
    const lines = (await query(cfg, 'QueryADepreciationExp', `A_Depreciation_Entry_ID=${eid}`)).map(lexp);
    res['entry_' + s] = fmtEntry(e.DocStatus, lines, aid);
    res['books_dep_' + s] = e.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyBooks(T_DEP, eid, s);
    const w2 = lc((await query(cfg, 'QueryADepreciationWorkfile', `A_Asset_ID=${aid} AND C_AcctSchema_ID=${s}`))[0]);
    res['wk_after_' + s] = w2 ? fmtWkAfter(w2) : 'none';
    log(`§FA_LEGACY_ENTRY ${f.id} schema=${s} entry=${eid} pending_other_assets=${others.join(',') || 'none'} lines=${lines.length}`);
  }
  if (!f.dispose) return Object.assign(res, DISP_NA);
  // §74 disposal of the same asset, today
  const du = lk.submit('dis', { asset: aid, date: TODAY + ' 00:00:00', note: 'FA ' + f.id }); await lk.drain(); const dst = lk.store.get(du);
  let did = null;
  if (dst.state === 'CONFIRMED') { did = lk.store.idmap(du).find(x => x.tbl === 'A_Asset_Disposed').server_id; const d = await postedOf('QueryAAssetDisposed', 'A_Asset_Disposed_ID', did);
    const a2 = (await query(cfg, 'QueryAAsset', `A_Asset_ID=${aid}`))[0];
    res.disp = `${d.DocStatus}:${a2.A_Asset_Status}:${cents(d.A_Disposal_Amt)}:${cents(d.A_Accumulated_Depr_Delta)}:${cents(d.Expense)}`;
    log(`§FA_LEGACY_DISPOSAL ${f.id} asset=${aid} disposal=${did} posted=${d.Posted}`);
  } else { res.disp = 'REJECTED'; log(`§FA_LEGACY_DISPOSAL ${f.id} asset=${aid} REJECTED ${(dst.error || '').slice(0, 140)}`); }
  const chs = (await query(cfg, 'QueryAAssetChange', `A_Asset_ID=${aid}`)).map(lc).filter(c => c.changetype === 'DIS');
  const wks2 = (await query(cfg, 'QueryADepreciationWorkfile', `A_Asset_ID=${aid}`)).map(lc);
  res.disp_open_exp = (await query(cfg, 'QueryADepreciationExp', `A_Asset_ID=${aid}`)).map(lexp).filter(r => r.processed !== 'Y').length;
  for (const s of SCHEMAS) {
    const c = chs.find(x => +x.c_acctschema_id === s), w = wks2.find(x => +x.c_acctschema_id === s);
    res['disp_change_' + s] = c ? `${cents(c.assetvalueamt)}:${cents(c.assetbookvalueamt)}:${cents(c.assetaccumdepreciationamt)}` : 'none';
    res['disp_wk_' + s] = w ? `${cents(w.a_asset_cost)}:${cents(w.a_accumulated_depr)}:${cents(w.a_asset_remaining)}` : 'none';
    res['books_dis_' + s] = did ? await legacyBooks(T_DIS, did, s) : 'none';
  }
  return res;
}

// ================= SQLite side: the engine under test =================
let seq = 9000000;
const loadHandover = ho => {   // §FA_PENDING_SYNC: legacy facts that pre-date the scenario (handover; never the scenario's own asset)
  for (const a of ho.assets) if (!gb.prepare('SELECT 1 FROM a_asset WHERE a_asset_id=?').get(+a.a_asset_id)) gb.prepare('INSERT INTO a_asset(a_asset_id,ad_client_id,ad_org_id,a_asset_status) VALUES(?,?,?,?)').run(+a.a_asset_id, 11, +a.ad_org_id, a.a_asset_status);
  for (const w of ho.workfiles) if (!wkGet(+w.a_asset_id, +w.c_acctschema_id)) wkPut({ ...w, a_asset_id: +w.a_asset_id, c_acctschema_id: +w.c_acctschema_id, a_asset_cost: cents(w.a_asset_cost), a_accumulated_depr: cents(w.a_accumulated_depr), a_accumulated_depr_f: cents(w.a_accumulated_depr_f), a_current_period: +w.a_current_period });
  const have = new Set(expAll().filter(r => r.legacy_id).map(r => r.legacy_id));
  for (const r of ho.rows) if (!have.has(+r.a_depreciation_exp_id)) expPut({ legacy_id: +r.a_depreciation_exp_id, a_asset_id: +r.a_asset_id, ad_client_id: 11, ad_org_id: +r.ad_org_id, c_acctschema_id: +r.c_acctschema_id, postingtype: r.postingtype,
    a_entry_type: r.a_entry_type, a_period: +r.a_period, dateacct: day(r.dateacct), expense: cents(r.expense), expense_f: cents(r.expense_f), dr_account_id: +r.dr_account_id, cr_account_id: +r.cr_account_id, processed: r.processed,
    a_depreciation_entry_id: r.a_depreciation_entry_id == null ? null : +r.a_depreciation_entry_id, a_accumulated_depr: cents(r.a_accumulated_depr), a_accumulated_depr_f: cents(r.a_accumulated_depr_f) });
};
const toDec = w => ({ ...w, a_asset_cost: w.a_asset_cost / 100, a_accumulated_depr: w.a_accumulated_depr / 100, a_accumulated_depr_f: w.a_accumulated_depr_f / 100 });
const toDecRow = r => ({ ...r, expense: r.expense / 100, expense_f: r.expense_f / 100 });
function localFA(mut = 0) {
  return async f => {
    const aid = ++seq, addId = ++seq;
    const group = lc(gb.prepare('SELECT * FROM a_asset_group WHERE a_asset_group_id=?').get(f.group));
    const gaccts = gb.prepare('SELECT * FROM a_asset_group_acct WHERE a_asset_group_id=?').all(f.group).map(lc);
    const reg = E.faRegisterAsset({ a_asset_id: aid, ad_client_id: 11, ad_org_id: 11, a_asset_group_id: f.group, m_product_id: PRODUCT, uselifemonths: 12 }, group, gaccts);
    if (!reg.ok) return { outcome: 'REJECTED', reason: reg.reason };
    const amtC = cents(f.amt) + mut;
    const add = { a_asset_addition_id: addId, a_asset_id: aid, ad_client_id: 11, ad_org_id: 11, a_sourcetype: 'MAN', a_capvsexp: 'Cap', c_currency_id: 100, assetsourceamt: amtC / 100, datedoc: TODAY, dateacct: TODAY, a_qty_current: 1, m_product_id: PRODUCT };
    const rateTo = s => { const to = schemaCur(s); return to === 100 ? '1' : DP.fxRate(gb, 100, to, TODAY + ' 00:00:00', 11, 11); };
    const accts = Object.fromEntries(reg.accts.map(a => [+a.c_acctschema_id, a]));
    const pOpen = E.periodOpen(periodData, TODAY, 'GLJ', TODAY);
    const r = E.faCompleteAddition(add, reg.asset, reg.workfiles, { periodOpen: pOpen, baseAmount: amtC, priorCreateAdditions: 0,
      amountFor: s => { const rt = rateTo(s); return rt == null ? null : convert(amtC, rt); }, acctOf: s => accts[+s], typeOf, unprocessedBefore: () => false });
    if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    // persist (host): asset, asset acct, addition, workfiles, schedules
    gb.prepare('INSERT INTO a_asset(a_asset_id,ad_client_id,ad_org_id,value,a_asset_group_id,m_product_id,a_asset_status,isdepreciated,isowned,uselifemonths,assetservicedate,assetactivationdate) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(aid, 11, 11, f.id, f.group, PRODUCT, r.asset.a_asset_status, r.asset.isdepreciated, r.asset.isowned, 12, r.asset.assetservicedate, r.asset.assetactivationdate);
    for (const a of reg.accts) gb.prepare('INSERT INTO a_asset_acct(a_asset_id,ad_client_id,ad_org_id,c_acctschema_id,postingtype,validfrom,a_depreciation_id,a_depreciation_f_id,a_asset_acct,a_depreciation_acct,a_accumdepreciation_acct) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(aid, 11, 11, a.c_acctschema_id, a.postingtype, a.validfrom || null, a.a_depreciation_id, a.a_depreciation_f_id, a.a_asset_acct, a.a_depreciation_acct, a.a_accumdepreciation_acct);
    for (const a of reg.accts) gb.prepare('UPDATE a_asset_acct SET a_disposal_loss_acct=? WHERE a_asset_id=? AND c_acctschema_id=?').run(a.a_disposal_loss_acct == null ? null : a.a_disposal_loss_acct, aid, a.c_acctschema_id);   // §74
    gb.prepare('INSERT INTO a_asset_addition(a_asset_addition_id,a_asset_id,ad_client_id,ad_org_id,a_sourcetype,a_capvsexp,c_currency_id,assetsourceamt,dateacct,c_charge_id,m_product_id,c_project_id,docstatus,a_createasset) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(addId, aid, 11, 11, 'MAN', r.a_capvsexp, 100, amtC / 100, TODAY + ' 00:00:00', null, PRODUCT, null, 'CO', r.createAsset ? 'Y' : 'N');
    r.workfiles.forEach(wkPut);
    for (const s of Object.keys(r.schedules)) r.schedules[s].forEach(x => expPut({ ...x, ad_client_id: 11 }));
    const fold = (t, id, s) => { const d = DP.derivePostings(gb, { table: t, id }, s); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    const res = { outcome: 'COMPLETED', asset: `${r.asset.a_asset_status}:${r.asset.assetservicedate}`, addition: `CO:${r.createAsset ? 'create' : 'adjust'}` };
    for (const s of SCHEMAS) {
      const w = wkGet(aid, s);
      res['wk_' + s] = w ? fmtWk(toDec(w)) : 'none';
      res['sched_' + s] = fmtSched(expAll().filter(x => x.a_asset_id === aid && +x.c_acctschema_id === s).map(toDecRow));
      res['books_add_' + s] = fold('A_Asset_Addition', addId, s);
    }
    if (f.noDep) for (const s of SCHEMAS) { res['entry_' + s] = 'skipped'; res['books_dep_' + s] = 'skipped'; res['wk_after_' + s] = 'skipped'; }
    for (const s of (f.noDep ? [] : SCHEMAS)) {
      const ho = (handover[f.id] || { schemas: {} }).schemas[s];
      if (ho) { loadHandover(ho); log(`§FA_PENDING_SYNC ${f.id} schema=${s} other_assets=${ho.assets.length} pending_rows=${ho.pending.length} rows_loaded=${ho.rows.length}`); }
      const eid = ++seq, entry = { a_depreciation_entry_id: eid, ad_client_id: 11, ad_org_id: 11, c_acctschema_id: s, dateacct: TODAY };
      const per = periodOf(TODAY);
      const all = expAll().filter(x => (x.ad_client_id || 11) === 11);
      const assetIds = [...new Set(all.map(x => x.a_asset_id))];
      const wks = []; for (const a of assetIds) { const w = wkGet(a, s); if (w) wks.push(w); }
      const statusOf = id => (gb.prepare('SELECT a_asset_status s FROM a_asset WHERE a_asset_id=?').get(id) || {}).s;
      const er = E.faCompleteDepreciationEntry(entry, all, wks, statusOf, { periodOpen: E.periodOpen(periodData, TODAY, 'FDP', TODAY), periodStart: per && per.startdate, periodEnd: per && per.enddate });
      if (!er.ok) { res['entry_' + s] = 'REJECTED:' + er.reason; res['books_dep_' + s] = 'none'; res['wk_after_' + s] = 'none'; continue; }
      er.rows.forEach(expPut); er.workfiles.forEach(wkPut);
      gb.prepare('INSERT INTO a_depreciation_entry(a_depreciation_entry_id,ad_client_id,ad_org_id,c_acctschema_id,dateacct,docstatus) VALUES(?,?,?,?,?,?)').run(eid, 11, 11, s, TODAY + ' 00:00:00', er.docstatus);
      const lines = expAll().filter(x => x.a_depreciation_entry_id === eid).map(toDecRow);
      res['entry_' + s] = fmtEntry(er.docstatus, lines, aid);
      res['books_dep_' + s] = fold('A_Depreciation_Entry', eid, s);
      const w2 = wkGet(aid, s); res['wk_after_' + s] = w2 ? fmtWkAfter(toDec(w2)) : 'none';
    }
    if (!f.dispose) return Object.assign(res, DISP_NA);
    // §74 (F37) disposal today, the engine under test
    const did = ++seq, disp = { a_asset_disposed_id: did, a_asset_id: aid, dateacct: TODAY, a_disposed_method: 'S', postingtype: 'A' };
    const arow = lc(gb.prepare('SELECT a_asset_status, NULL AS isdisposed FROM a_asset WHERE a_asset_id=?').get(aid));
    const wksA = SCHEMAS.map(s => wkGet(aid, s)).filter(Boolean), rowsA = expAll().filter(x => x.a_asset_id === aid);
    const dr = E.faCompleteDisposal(disp, { ...arow, isdisposed: 'N' }, wksA, rowsA, { periodOpen: E.periodOpen(periodData, TODAY, 'GLD', TODAY), primarySchema: 101, primaryCurrency: schemaCur(101), currencyOf: schemaCur });
    if (!dr.ok) res.disp = 'REJECTED';
    else {
      gb.prepare('UPDATE a_asset SET a_asset_status=? WHERE a_asset_id=?').run(dr.asset.a_asset_status, aid);
      gb.prepare('INSERT INTO a_asset_disposed(a_asset_disposed_id,a_asset_id,ad_client_id,ad_org_id,dateacct,postingtype,docstatus) VALUES(?,?,?,?,?,?,?)').run(did, aid, 11, 11, TODAY + ' 00:00:00', 'A', dr.docstatus);
      for (const c of dr.changes) gb.prepare('INSERT INTO a_asset_change(a_asset_id,c_acctschema_id,postingtype,changetype,assetvalueamt,assetbookvalueamt,assetaccumdepreciationamt) VALUES(?,?,?,?,?,?,?)').run(aid, c.c_acctschema_id, c.postingtype, c.changetype, c.assetvalueamt / 100, c.assetbookvalueamt / 100, c.assetaccumdepreciationamt / 100);
      dr.workfiles.forEach(wkPut);
      for (const id of dr.deleteExp) gb.prepare('DELETE FROM a_depreciation_exp WHERE a_depreciation_exp_id=?').run(id);
      res.disp = `${dr.docstatus}:${dr.asset.a_asset_status}:${dr.disposalAmt}:${dr.accumDelta}:${dr.expense}`;
    }
    res.disp_open_exp = expAll().filter(x => x.a_asset_id === aid && x.processed !== 'Y').length;
    for (const s of SCHEMAS) {
      const c = lc(gb.prepare("SELECT * FROM a_asset_change WHERE a_asset_id=? AND c_acctschema_id=? AND changetype='DIS'").get(aid, s)), w = wkGet(aid, s);
      res['disp_change_' + s] = c ? `${cents(c.assetvalueamt)}:${cents(c.assetbookvalueamt)}:${cents(c.assetaccumdepreciationamt)}` : 'none';
      res['disp_wk_' + s] = w ? `${w.a_asset_cost}:${w.a_accumulated_depr}:${w.a_asset_remaining}` : 'none';
      res['books_dis_' + s] = dr.ok ? fold('A_Asset_Disposed', did, s) : 'none';
    }
    return res;
  };
}

// ================= corpus (spec §63) =================
const KEYS = ['outcome', 'asset', 'addition'].concat(...SCHEMAS.map(s => ['wk_' + s, 'sched_' + s, 'books_add_' + s, 'entry_' + s, 'books_dep_' + s, 'wk_after_' + s]), Object.keys(DISP_NA));
const spec = { keys: KEYS, notCompared: {} };
(async () => {
  let fails = 0, incon = 0;
  const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };
  { const rr = await query(cfg, 'QueryADRole', `AD_Role_ID=${cfg.login.RoleID}`).catch(() => []); ROLE_APPROVES_OWN = rr.length ? ((rr[0].IsCanApproveOwnDoc === true || rr[0].IsCanApproveOwnDoc === 'Y') ? 'Y' : 'N') : null; }
  if (ROLE_APPROVES_OWN == null) { log('§FA_VERDICT FAIL harness: role flag IsCanApproveOwnDoc not readable (read type QueryADRole)'); process.exit(1); }
  log(`§FA_FACTS role=${cfg.login.RoleID} IsCanApproveOwnDoc=${ROLE_APPROVES_OWN} today=${TODAY} seed_rows=${JSON.stringify(nSeed)}`);
  // handover in miniature: the asset group accounting the SQLite side holds is reconciled to legacy's through the generated dict_diff patch (class DATA, §26)
  { const sp = require('./dict_spec.json').find(x => x.table === 'a_asset_group_acct');
    const Lr = await DD.discover(cfg, sp), r0 = DD.compare(Lr, gb, sp), st = DD.applyPatch(gb, DD.toPatch(r0, sp)), r1 = DD.compare(Lr, gb, sp);
    log(`§FA_STATE_SYNC a_asset_group_acct changed_cells=${r0.changed.length} (${r0.changed.map(c => c.id + '.' + c.col + ':' + c.local + '→' + c.legacy).join(' ')}) missing_rows=${r0.onlyLegacy.length} ran=${st.ran} left=${r1.changed.length + r1.onlyLegacy.length}`); }
  for (const g of [50007, 50006]) log(`§FA_GROUP_LIFE_SQLITE group=${g} ` + gb.prepare('SELECT c_acctschema_id, uselifemonths, uselifemonths_f FROM a_asset_group_acct WHERE a_asset_group_id=?').all(g).map(r => `${r.c_acctschema_id}:C${r.uselifemonths}/F${r.uselifemonths_f}`).join(' '));
  const sc = (id, facts, mut) => ({ id, facts: { id, ...facts }, legacy: legacyFA, local: localFA(mut || 0) });
  const only = process.env.FA_ONLY;
  const corpus = [sc('FA1-equipment-60m', { group: 50007, amt: 1200 }), sc('FA0-vehicles-zero-c-life', { group: 50006, amt: 1200 }),
    sc('FA-REJ-unknown-group', { group: 999999, amt: 1200 }), sc('FA-REJ2-zero-amount', { group: 50007, amt: 0 }),
    sc('FAD1-disposal-simple', { group: 50007, amt: 1200, noDep: true, dispose: true }), sc('FAD-REJ-already-depreciated', { group: 50007, amt: 1200, dispose: true })].filter(c => !only || c.id.startsWith(only));
  const rows = await R.run(corpus, spec, [], { log });
  for (const r of rows) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify(r.legacy)} sqlite=${JSON.stringify(r.sqlite)}`);
  out('§FA_NO_ERROR', rows.every(r => r.legacy.outcome !== 'ERROR' && r.sqlite.outcome !== 'ERROR'), `errors=${rows.filter(r => r.legacy.outcome === 'ERROR' || r.sqlite.outcome === 'ERROR').map(r => r.id + ':' + (r.legacy.error || r.sqlite.error)).join(',') || 'none'}`);
  const judged = rows.filter(r => r.legacy.outcome === 'COMPLETED' && /^CO:n=[1-9]/.test(r.legacy.entry_101 || '')).length;
  out('§FA_NOT_VACUOUS', judged > 0 ? true : 'INCONCLUSIVE', `scenarios where legacy completed a registration AND a depreciation entry with lines=${judged} of ${rows.length}`);
  if (!only) {
    const neg = await R.run([sc('NEG-fa-control', { group: 50007, amt: 1200 }, 1)], spec, [], { log });
    out('§FA_NEGATIVE_CONTROL', neg[0].verdict === 'SQLITE-GAP' && ['wk_101', 'sched_101', 'books_add_101'].every(k => neg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite addition ⇒ verdict=${neg[0].verdict} gaps=${neg[0].gaps.map(g => g.key).join(',')}`);
    const dneg = await R.run([sc('NEG-fad-control', { group: 50007, amt: 1200, noDep: true, dispose: true }, 1)], spec, [], { log });
    out('§FAD_NEGATIVE_CONTROL', dneg[0].verdict === 'SQLITE-GAP' && ['disp', 'disp_change_101', 'books_dis_101'].every(k => dneg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite addition before the disposal ⇒ verdict=${dneg[0].verdict} gaps=${dneg[0].gaps.map(g => g.key).join(',')}`);
  }
  const gaps = rows.flatMap(r => r.gaps).filter(g => g.verdict === 'SQLITE-GAP');
  log(`§FA_FINDINGS sqlite_gaps=${gaps.length} (${[...new Set(rows.filter(r => r.verdict === 'SQLITE-GAP').map(r => r.id))].join(',') || 'none'}) — the parallel-run product, not harness failures`);
  log(`§FA_VERDICT ${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon} findings=${gaps.length}`);
  gb.close(); fs.unlinkSync(gbFile);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§FA_VERDICT FAIL exception ' + e.stack); process.exit(2); });
