// ⚠ DO NOT REMOVE — scope: W-PROJ-PROCS-LEGACY (prompts/ERP_IDEMPIERE_UX_PARITY.md §PROJ-PROCS-LEGACY). READ THE LOG after every run — exit code is not evidence.
// The five Project processes (Generate Order 164, Generate PO 225, Close Project 227, Copy Details 212, Phase Generate Order 216) run on REAL iDempiere and through the twin's verbatim ports from the SAME fixture,
// then the documents they made are COMPLETED on both sides (DocAction CO) and the accounting consequence is diffed (Fact_Acct per document, the C_Project header).
// TEST INSTANCE ONLY: DB idempiere_bimdoc (:8108, oracle :8097). The reference DBs and the pilot are refused. Work under the restore discipline of bim-ootb prompts/CAPEX_DASHBOARD.md §A.
// usage: PILOT_PG_DB=idempiere_bimdoc PP_OOTB=<bim-ootb tree> node proj_procs_legacy.js [--only SG1,SP1] [--no-co] [--log file]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
process.env.PILOT_PG_DB = process.env.PILOT_PG_DB || 'idempiere_bimdoc';
const cfg = require('./pilot_cfg'), td = require('./pilot_tablediff');
if (cfg.PG_DB !== 'idempiere_bimdoc') { console.error('§PPL refuses DB ' + cfg.PG_DB + ' (only the test instance idempiere_bimdoc)'); process.exit(2); }
const DRY = process.env.PPL_DRY === '1';   // dry run: the legacy side is stubbed out (no psql, no oracle, no WS), only the twin half runs - to test this script itself
if (DRY) { cfg.psql = () => []; cfg.rowsAsObjects = () => []; td.snap = () => {}; td.diff = () => []; td.detail = () => []; }
const OOTB = process.env.PP_OOTB || '/tmp/wt-pp-fixes';
const args = process.argv.slice(2), only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null, NOCO = args.includes('--no-co');
const logFile = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;
const out = []; const L = s => { out.push(s); console.log(s); };
const TODAY = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
const oracle = req => DRY ? Promise.resolve({ ok: true, rows: [], summary: '', logs: [] }) : new Promise((res, rej) => { const body = Buffer.from(JSON.stringify(req)); const r = http.request({ host: '127.0.0.1', port: 8097, method: 'POST', path: '/', headers: { 'Content-Length': body.length } }, resp => { let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('oracle bad json ' + d.slice(0, 300))); } }); }); r.on('error', rej); r.setTimeout(1800000); r.write(body); r.end(); });
const REST = 'http://localhost:8108/ADInterface/services/rest/model_adservice/', LOGIN = { user: 'GardenAdmin', pass: 'GardenAdmin', lang: 'en_US', ClientID: 11, RoleID: 102, OrgID: 11, WarehouseID: 103, stage: 0 };
async function wsComplete(serviceType, tableName, recordID, docAction) {
  if (DRY) return { ok: true, msg: null };
  const r = await fetch(REST + 'set_docaction', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ModelSetDocActionRequest: { ModelSetDocAction: { serviceType, tableName, recordID, docAction: docAction || 'CO' }, ADLoginRequest: LOGIN } }) });
  const j = JSON.parse(await r.text()), s = j.StandardResponse || {};
  return { ok: !(j.status === '500' || j.message || s['@IsError'] === 'true' || s['@IsError'] === true), msg: j.message || s.Error || null, raw: s };
}
// ── fixture SQL: the same text on both sides ──
const rowsJ = sql => JSON.parse(cfg.psql("select coalesce(jsonb_agg(t),'[]'::jsonb) from (" + sql + ') t;').map(r => r.join('')).join('') || '[]');   // one line (jsonb_agg), unlike cfg.rowsAsObjects whose json_agg breaks over lines
const lit = v => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
function ins(table, o) { const f = Object.assign({ ad_client_id: 11, ad_org_id: 11, isactive: 'Y', created: '2026-11-10 00:00:00', createdby: 100, updated: '2026-11-10 00:00:00', updatedby: 100 }, o), ks = Object.keys(f); return 'INSERT INTO ' + table + ' (' + ks.join(',') + ') VALUES (' + ks.map(k => lit(f[k])).join(',') + ')'; }
const PRJ = { salesrep_id: 101, c_currency_id: 100, m_pricelist_version_id: 104, m_warehouse_id: 103, c_bpartner_id: 117, c_bpartner_location_id: 112, ad_user_id: 104, c_paymentterm_id: 105, datecontract: '2026-11-01 00:00:00', datefinish: '2026-12-31 00:00:00', issummary: 'N', projectcategory: 'N', processed: 'N' };
function project(id, over, lines) {   // header sums as the model layer leaves them (MProjectLine.updateHeader): active lines only
  let pa = 0, pq = 0, ia = 0, iq = 0; (lines || []).forEach(l => { if (l.isactive !== 'N') { pa += (l.plannedqty || 1) * (l.plannedprice || 0); pq += l.plannedqty || 1; ia += l.invoicedamt || 0; iq += l.invoicedqty || 0; } });
  return [ins('c_project', Object.assign({ c_project_id: id, value: 'PPL' + id, name: 'PPL project ' + id, plannedamt: pa, plannedqty: pq, plannedmarginamt: 0, committedamt: 0, committedqty: 0, invoicedamt: ia, invoicedqty: iq, projectbalanceamt: 0 }, PRJ, over || {}))]
    .concat((lines || []).map((l, i) => ins('c_projectline', Object.assign({ c_projectline_id: id * 10 + i + 1, c_project_id: id, line: (i + 1) * 10, plannedqty: 1, plannedprice: 0, plannedamt: (l.plannedqty || 1) * (l.plannedprice || 0), plannedmarginamt: 0, committedamt: 0, committedqty: 0, invoicedamt: 0, invoicedqty: 0, isprinted: 'Y', processed: 'N' }, l))));
}
// ── scenarios ──
const SC = [
  { name: 'SG1', what: 'Generate Order: priced line + list-priced line with InvoicedQty, then CO', process: 164, recordId: 1009901, complete: true,
    pre: project(1009901, {}, [{ m_product_id: 123, plannedqty: 10, plannedprice: 60, description: 'oak' }, { m_product_id: 138, plannedqty: 8, plannedprice: 0, invoicedqty: 3, description: 'hoe' }]) },
  { name: 'SG2a', what: 'Generate Order refused: no price list', process: 164, recordId: 1009902, pre: project(1009902, { m_pricelist_version_id: null }, [{ m_product_id: 123, plannedqty: 1, plannedprice: 5 }]) },
  { name: 'SG2b', what: 'Generate Order refused: no warehouse', process: 164, recordId: 1009903, pre: project(1009903, { m_warehouse_id: null }, [{ m_product_id: 123, plannedqty: 1, plannedprice: 5 }]) },
  { name: 'SG2c', what: 'Generate Order refused: no partner location', process: 164, recordId: 1009904, pre: project(1009904, { c_bpartner_location_id: null }, [{ m_product_id: 123, plannedqty: 1, plannedprice: 5 }]) },
  { name: 'SG2d', what: 'Generate Order refused: Service Charge category (order saved first, then rolled back)', process: 164, recordId: 1009905, pre: project(1009905, { projectcategory: 'S' }, [{ m_product_id: 123, plannedqty: 1, plannedprice: 5 }]) },
  { name: 'SG2e', what: 'Generate Order refused: unknown project id', process: 164, recordId: 987654321, pre: [] },
  { name: 'SG2f', what: 'Generate Order: project without a Sales Representative (MOrder.setSalesRep_ID(0) on a mandatory column, PO.set_Value :997-1004)', process: 164, recordId: 1009907, pre: project(1009907, { salesrep_id: null }, [{ m_product_id: 123, plannedqty: 1, plannedprice: 5 }]) },
  { name: 'SG3', what: 'Generate Order on a project with a PRODUCT-LESS line', process: 164, recordId: 1009906, complete: true, pre: project(1009906, {}, [{ m_product_id: 123, plannedqty: 2, plannedprice: 60, description: 'oak' }, { plannedqty: 2, plannedprice: 5, description: 'no product' }]) },
  { name: 'SP1', what: 'Generate PO: two vendors consolidated, one ordered earlier, one product-less, one without PO record, then CO of the POs', process: 225, recordId: 0, params: [{ name: 'C_Project_ID', value: 1009911, type: 'num' }], complete: true,
    pre: project(1009911, {}, [{ m_product_id: 133, plannedqty: 4, description: 'a' }, { m_product_id: 134, plannedqty: 2, description: 'b' }, { m_product_id: 138, plannedqty: 6, description: 'c' }, { description: 'd-noprod' }, { m_product_id: 132, plannedqty: 1, description: 'g-nopo' }, { m_product_id: 133, plannedqty: 1, description: 'f-inactive', isactive: 'N' }]) },
  { name: 'SC1', what: 'Close Project (lines active and inactive)', process: 227, recordId: 1009921, pre: project(1009921, {}, [{ m_product_id: 123, plannedqty: 2, plannedprice: 5 }, { m_product_id: 138, plannedqty: 3, plannedprice: 4 }, { m_product_id: 137, plannedqty: 1, plannedprice: 1, isactive: 'N' }]) },
  { name: 'SC2', what: 'Close Project of an UNKNOWN id', process: 227, recordId: 987654321, pre: [] },
  { name: 'SK1', what: 'Copy Details: 2 plain lines + phase with task and lines', process: 212, recordId: 1009932, params: [{ name: 'C_Project_ID', value: 1009931, type: 'num' }],
    pre: project(1009931, {}, [{ m_product_id: 123, plannedqty: 10, plannedprice: 60, description: 'k-l1', invoicedqty: 2, invoicedamt: 120, processed: 'Y' }, { m_product_id: 138, plannedqty: 3, plannedprice: 4, description: 'k-l2' },
      { m_product_id: 137, plannedqty: 5, plannedprice: 2, description: 'k-phase-line', c_projectphase_id: 1009931 }, { m_product_id: 137, plannedqty: 6, plannedprice: 2, description: 'k-task-line', c_projectphase_id: 1009931, c_projecttask_id: 1009931, invoicedqty: 1 }])
      .concat([ins('c_projectphase', { c_projectphase_id: 1009931, c_project_id: 1009931, name: 'K-Ph1', seqno: 10, description: 'ph1d', qty: 3, iscomplete: 'N' }), ins('c_projecttask', { c_projecttask_id: 1009931, c_projectphase_id: 1009931, name: 'K-T1', seqno: 1, qty: 2, description: 't1d' })]).concat(project(1009932, { name: 'PPL target' }, [])) },
  { name: 'SH1', what: 'Phase Generate Order (project line + task), then CO', process: 216, recordId: 1009941, complete: true,
    pre: project(1009941, {}, [{ m_product_id: 123, plannedqty: 4, plannedprice: 0, invoicedqty: 1, c_projectphase_id: 1009941, description: 'pl' }]).concat([ins('c_projectphase', { c_projectphase_id: 1009941, c_project_id: 1009941, name: 'Ph-A', seqno: 10, iscomplete: 'N', qty: 0 }), ins('c_projecttask', { c_projecttask_id: 1009941, c_projectphase_id: 1009941, name: 'Tk-A', seqno: 5, m_product_id: 137, qty: 4, description: 'td' })]) }
];
const OFF = Number(process.env.PPL_OFF || 0);   // a second run on a legacy DB that already holds the first run's fixtures: every fixture id (1009900+) shifts by OFF
if (OFF) { const sh = t => t.replace(/(?<![0-9])(10099\d\d)(\d?)(?![0-9])/g, (m, a, b) => String(Number(a) + OFF) + b); SC.forEach(c => { c.pre = c.pre.map(sh); if (c.recordId > 1000000 && c.recordId < 1010000) c.recordId += OFF; (c.params || []).forEach(p => { if (p.value > 1000000 && p.value < 1010000) p.value += OFF; }); }); }
// ── normalisation ──
const VOLATILE = /^(created|createdby|updated|updatedby|.*_uu|processedon|dateprinted)$/i;
const IGNORE = new Set(['ad_pinstance', 'ad_pinstance_para', 'ad_pinstance_log', 'ad_changelog', 'ad_session', 'ad_user', 'c_acctprocessorlog', 'c_acctprocessor', 'ad_issue', 'ad_wssession', 'ad_process', 't_selection', 'ad_recentitem', 'ad_note', 'ad_schedulerlog']);
function norm(v, ids) { if (v === null || v === undefined || v === '') return null; if (typeof v === 'boolean') return v ? 'Y' : 'N'; const s = String(v); if (ids && ids.has(s)) return 'NEW'; if (/^-?\d+(\.\d+)?$/.test(s)) return String(Number(s)); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); return s; }
function colIds(newIds, lc) { if (/_acct$/.test(lc)) return newIds.get('c_validcombination') || null; if (!/_id$/.test(lc)) return null; return newIds.get(lc.slice(0, -3)) || newIds.get('*'); }
function proj(rows, keyCol, newIds) { return rows.map(r => { const o = {}; Object.keys(r).sort().forEach(c => { const lc = c.toLowerCase(); if (lc === keyCol || VOLATILE.test(lc) || lc === '__key') return; const v = norm(r[c], colIds(newIds, lc)); if (v !== null) o[lc] = v; }); return JSON.stringify(o); }); }
// effects: { table: { ins:[rows], upd:[{__key, col:newval}], pk } } for both sides
function legacyEffects(tag) { const d = td.detail(tag, 'live', td.diff(tag, 'live')), R = {}; for (const t of d) R[t.table.toLowerCase()] = { pk: t.pk ? t.pk.split(',') : [], ins: t.insRows || [], upd: (t.updRows || []).map(u => { const o = { __key: u.key.join('|') }; Object.keys(u.changes).forEach(c => { o[c] = u.changes[c][1]; }); return o; }), nIns: t.inserted, nUpd: t.updated, nDel: t.deleted }; return R; }
function oursEffects(k, ops, ids) {
  const R = {}, T = t => (R[t] = R[t] || { pk: [], ins: [], upd: [], nIns: 0, nUpd: 0, nDel: 0 }), created = new Set();
  ops.forEach((o, i) => { const t = String(o.table || o.key || '').toLowerCase(); if (o.op_type === 'CRUD_CREATE') { const idc = o.idCol || t + '_id', id = ids[i]; T(t).pk = [idc]; created.add(t + '|' + id); let row = null; try { row = k.one('SELECT * FROM ' + t + ' WHERE ' + idc + '=?', [id]); } catch (e) {} T(t).ins.push(row || o.fields || {}); T(t).nIns++; } });
  ops.forEach((o, i) => { const t = String(o.table || o.key || '').toLowerCase(); if (o.op_type === 'CRUD_UPDATE') { const id = (o.id && typeof o.id === 'object' && o.id.__opRef != null) ? ids[o.id.__opRef] : o.id; if (created.has(t + '|' + id)) return; const r = { __key: String(id) }; Object.keys(o.changes || {}).forEach(c => { let nv = o.changes[c].new; if (nv && typeof nv === 'object' && nv.__opRef != null) nv = ids[nv.__opRef]; r[c.toLowerCase()] = nv; }); T(t).upd.push(r); T(t).nUpd++; } else if (o.op_type === 'CRUD_DELETE') T(t).nDel++; });
  return R;
}
function compare(tag, R, O, k, extraIgnore, prior) {
  const newIds = (S, pkOf) => { const m = new Map([['*', new Set()]]); Object.keys(S).forEach(t => { const pk = pkOf(t); if (pk.length !== 1 || pk[0].toLowerCase() !== t + '_id') return; const set = m.get(t) || new Set(); S[t].ins.forEach(r => { const v = r[pk[0]] != null ? r[pk[0]] : r[pk[0].toUpperCase()]; if (v != null) { set.add(String(v)); m.get('*').add(String(v)); } }); m.set(t, set); }); return m; };
  const nR = newIds(R, t => R[t].pk), nO = newIds(O, t => (O[t].pk.length ? O[t].pk : [t + '_id']));
  if (prior) [[prior[0], nR, t => prior[0][t].pk], [prior[1], nO, t => (prior[1][t].pk.length ? prior[1][t].pk : [t + '_id'])]].forEach(([S, m, pkOf]) => { const pm = newIds(S, pkOf); pm.forEach((set, t) => { const cur = m.get(t) || new Set(); set.forEach(v => cur.add(v)); m.set(t, cur); }); });   // ids made by the process stage still read NEW in the completion stage
  const tids = new Set((cfg.psql("select ad_sequence_id from ad_sequence where istableid='Y'") || []).map(r => String(r[0])));
  if (R.ad_sequence) { const keep = R.ad_sequence.upd.filter(u => !tids.has(String(Number(u.__key)))); R.ad_sequence.nUpd = keep.length; R.ad_sequence.upd = keep; if (!keep.length && !R.ad_sequence.nIns) delete R.ad_sequence; }
  if (O.ad_sequence) { const keep = O.ad_sequence.upd.filter(u => { const r = k.one('SELECT istableid FROM ad_sequence WHERE ad_sequence_id=?', [u.__key]); return !r || r.istableid !== 'Y'; }); O.ad_sequence.nUpd = keep.length; O.ad_sequence.upd = keep; if (!keep.length && !O.ad_sequence.nIns) delete O.ad_sequence; }
  let judged = 0, match = 0; const diffs = [];
  for (const t of [...new Set([...Object.keys(R), ...Object.keys(O)])].sort()) {
    if (IGNORE.has(t) || (extraIgnore || []).includes(t)) continue;
    const r = R[t] || { ins: [], upd: [], nIns: 0, nUpd: 0, nDel: 0 }, o = O[t] || { ins: [], upd: [], nIns: 0, nUpd: 0, nDel: 0 }; judged++;
    const key = t + '_id', pr = proj(r.ins, key, nR), po = proj(o.ins, key, nO), ur = proj(r.upd, key, nR), uo = proj(o.upd, key, nO);
    const sub = (a, b) => { const c = b.slice(); return a.filter(x => { const i = c.indexOf(x); if (i >= 0) { c.splice(i, 1); return false; } return true; }); };
    const miss = sub(pr, po), extra = sub(po, pr), umiss = sub(ur, uo), uextra = sub(uo, ur), counts = 'ins ' + r.nIns + '/' + o.nIns + ' upd ' + r.nUpd + '/' + o.nUpd + ' del ' + r.nDel + '/' + o.nDel;
    const ok = r.nIns === o.nIns && r.nUpd === o.nUpd && r.nDel === o.nDel && !miss.length && !extra.length && !umiss.length && !uextra.length;
    if (ok) match++; else diffs.push(t);
    L('§PPL-TABLE ' + tag + ' ' + t + ' (legacy/twin) ' + counts + ' ' + (ok ? 'MATCH' : 'DIFF') + (miss.length ? '\n    legacy-only row: ' + miss.slice(0, 2).join('\n                     ') : '') + (extra.length ? '\n    twin-only row:   ' + extra.slice(0, 2).join('\n                     ') : '') + (umiss.length ? '\n    legacy-update:   ' + umiss.slice(0, 2).join(' ') : '') + (uextra.length ? '\n    twin-update:     ' + uextra.slice(0, 2).join(' ') : ''));
  }
  return { judged, match, diffs };
}
const hdrSql = id => 'SELECT plannedamt, plannedqty, plannedmarginamt, committedamt, committedqty, invoicedamt, invoicedqty, projectbalanceamt, processed FROM c_project WHERE c_project_id=' + id;
const FACT = (tbl, ids) => "SELECT t.tablename AS tbl, f.c_acctschema_id AS sch, ev.value AS acct, f.amtsourcedr AS sdr, f.amtsourcecr AS scr, f.amtacctdr AS adr, f.amtacctcr AS acr, f.postingtype AS pt, f.c_currency_id AS cur FROM fact_acct f JOIN ad_table t ON t.ad_table_id=f.ad_table_id JOIN c_elementvalue ev ON ev.c_elementvalue_id=f.account_id WHERE lower(t.tablename)='" + tbl + "' AND f.record_id IN (" + ids.join(',') + ')';
const fnorm = r => ['tbl', 'sch', 'acct', 'sdr', 'scr', 'adr', 'acr', 'pt', 'cur'].map(c => norm(r[c], null)).join('|');

(async () => {
  const K = require(path.join(OOTB, 'erp/ws_kernel.js')); process.env.SQLJS = process.env.SQLJS || os.homedir() + '/bim-ootb/tests/node_modules/sql.js';
  const k = await K.load(), AP = require(path.join(OOTB, 'erp/ad_process.js')), ML = k.ML;
  const S = { clientId: 11, orgId: 11, userId: 101, roleId: 102, warehouseId: 103, actor: 'witness:ppl' }, SA = Object.assign({}, S, { userId: 100 });
  const cache = path.join(os.homedir(), '.cache/pilot/ad_msg_en.json'); try { if (fs.existsSync(cache)) require(path.join(OOTB, 'erp/ad_callout.js')).Msg.load(JSON.parse(fs.readFileSync(cache, 'utf8'))); } catch (e) {}
  L('§PPL-START ootb=' + OOTB + ' db=' + cfg.PG_DB + ' today=' + TODAY + ' scenarios=' + SC.length);
  const tot = { scen: 0, match: 0, diff: 0, inconclusive: 0 }, SUM = [];
  for (const c of SC) {
    if (only && !only.includes(c.name)) continue; tot.scen++;
    L('\n§PPL-SCENARIO ' + c.name + ' — ' + c.what);
    // fixtures: the same text on both sides
    const PRI = { c_project: 0, c_projectphase: 1, c_projecttask: 2, c_projectline: 3 }; c.pre = c.pre.slice().sort((x, y) => PRI[/INSERT INTO (\w+)/.exec(x)[1]] - PRI[/INSERT INTO (\w+)/.exec(y)[1]]);   // FK order (a line may point at a phase made later in the list)
    if (c.pre.length) { cfg.psql(c.pre.join(';\n') + ';'); c.pre.forEach(q => { try { k.db.run(q); } catch (e) { L('§PPL-FIXTURE-TWIN-ERR ' + e.message + ' :: ' + q.slice(0, 120)); } }); }
    // the document-number counters of legacy are state: ours start from them
    { const seq = (await oracle({ op: 'sql', sql: "SELECT * FROM AD_Sequence WHERE IsTableID='N' AND AD_Client_ID IN (0,11)" })).rows || [], cols = k.q('PRAGMA table_info(AD_Sequence)').map(r => r.name); seq.forEach(row => { const use = cols.filter(x => Object.prototype.hasOwnProperty.call(row, x.toLowerCase())); try { k.db.run('INSERT OR REPLACE INTO AD_Sequence (' + use.join(',') + ') VALUES (' + use.map(() => '?').join(',') + ')', use.map(x => { const v = row[x.toLowerCase()]; return v === undefined ? null : v; })); } catch (e) {} }); }
    { const cur = (await oracle({ op: 'sql', sql: 'SELECT c_acctschema_id, c_period_id FROM C_AcctSchema WHERE AD_Client_ID=11' })).rows || [];   // STATE, not behaviour: the schema's current period (auto period control moves it on the first posting of a new month) starts equal on both sides
      cur.forEach(r => { try { k.db.run('UPDATE c_acctschema SET c_period_id=? WHERE c_acctschema_id=?', [r.c_period_id, r.c_acctschema_id]); } catch (e) {} }); }
    const pid = c.name.startsWith('SK') ? 1009932 + OFF : (c.params && c.params[0] && c.params[0].name === 'C_Project_ID' ? c.params[0].value : c.recordId), hdr = {};
    const hdrBoth = async stage => { let a = null, b = null; try { a = rowsJ(hdrSql(pid))[0] || null; } catch (e) {} try { b = k.q(hdrSql(pid))[0] || null; } catch (e) {} hdr[stage] = { legacy: a, twin: b }; const HK = ['plannedamt', 'plannedqty', 'plannedmarginamt', 'committedamt', 'committedqty', 'invoicedamt', 'invoicedqty', 'projectbalanceamt', 'processed'], fm = o => o && HK.map(x => x + '=' + norm(o[x])).join(' '); const na = fm(a), nb = fm(b); L('§PPL-HEADER ' + c.name + ' ' + stage + ' C_Project ' + pid + ' legacy=' + na + ' twin=' + nb + (na === nb ? ' MATCH' : ' DIFF')); return na === nb; };
    let projMatch = await hdrBoth('before');
    // ── stage 1: the process
    const tag = 'ppl_' + c.name.toLowerCase(); td.snap(tag);
    const ref = await oracle({ op: 'process', process: c.process, recordId: c.recordId || 0, tableId: 0, params: c.params || [], ctx: { date: TODAY } });
    const R = legacyEffects(tag); cfg.psql('DROP SCHEMA IF EXISTS snap_' + tag + ' CASCADE;');
    L('§PPL-LEGACY ' + c.name + ' ok=' + ref.ok + ' summary=' + JSON.stringify(ref.summary || ref.error || '') + ' logs=' + JSON.stringify((ref.logs || []).map(l => [l.id, l.msg])));
    const params = {}; (c.params || []).forEach(p => { params[p.name] = { v: p.value, vTo: p.valueTo, type: p.type }; });
    const trx = new ML.Trx(k.q, k.env(S)); let tx; try { tx = AP.runInTrx(trx, c.process, { tableId: 0, recordId: c.recordId || 0, params }); } catch (e) { tx = { ok: false, summary: 'threw: ' + e.message, logs: [] }; }
    let ops = [], ids = []; if (tx.ok) { ops = trx.groupOps(); if (ops.length) ids = k.commit(S, ops, { ws: 'ppl' }); }
    L('§PPL-TWIN ' + c.name + ' ok=' + tx.ok + ' summary=' + JSON.stringify(tx.summary || '') + ' logs=' + JSON.stringify((tx.logs || []).map(l => [l.id, l.msg])));
    const O = oursEffects(k, ops, ids), msgOk = (ref.summary || '') === (tx.summary || '') && !!ref.ok === !!tx.ok;
    const lg = x => JSON.stringify((x || []).map(l => [/^#?new|^\d{6,}/.test(String(l.id)) ? 'NEW' : String(l.id), l.msg == null ? null : String(l.msg).replace(/\d{5,}/g, 'N')]).sort());
    const logOk = lg(ref.logs) === lg(tx.logs);
    L('§PPL-MESSAGE ' + c.name + ' ' + (msgOk ? 'MATCH' : 'DIFF legacy ok=' + ref.ok + ' "' + (ref.summary || ref.error) + '" twin ok=' + tx.ok + ' "' + tx.summary + '"') + '  logs ' + (logOk ? 'MATCH' : 'DIFF'));
    const c1 = compare(c.name + '/process', R, O, k);
    projMatch = (await hdrBoth('after-process')) && projMatch;
    let c2 = { judged: 0, match: 0, diffs: [] }, factDiff = null;
    // ── stage 2: complete the documents, accounting consequence
    let orders = (R.c_order || { ins: [] }).ins.map(r => Number(r.c_order_id)), tOrders = (O.c_order || { ins: [] }).ins.map(r => Number(r.c_order_id));
    if (DRY) orders = tOrders;
    if (c.complete && !NOCO && orders.length && tOrders.length) {
      const tag2 = tag + '_co'; td.snap(tag2);
      const wsRes = []; for (const o of orders) wsRes.push(await wsComplete('BridgeDocActionCOrder', 'C_Order', o, 'CO'));
      const R2 = legacyEffects(tag2); cfg.psql('DROP SCHEMA IF EXISTS snap_' + tag2 + ' CASCADE;');
      const ops2 = [], ids2 = [], tw = []; for (const o of tOrders) { const r = k.inTrx(SA, { ws: 'ppl', action: 'CO', id: o }, (t, M) => { const d0 = t.get('c_order', o); if (d0) t.update('c_order', d0, { docaction: 'CO' }); const x = M.processIt(t, 'c_order', o, 'CO'); return x.ok ? { ok: true } : { ok: false, error: x.msg || 'processIt failed' }; }); tw.push({ ok: r.ok, err: r.error }); r.ops.forEach((op, i) => { ops2.push(op); ids2.push(r.ids[i]); }); }
      L('§PPL-CO ' + c.name + ' legacy=' + JSON.stringify(wsRes.map(w => w.ok ? 'ok' : 'refused: ' + w.msg)) + ' twin=' + JSON.stringify(tw.map(w => w.ok ? 'ok' : 'refused: ' + w.err)));
      const O2 = oursEffects(k, ops2, ids2); c2 = compare(c.name + '/complete', R2, O2, k, ['fact_acct'], [R, O]);
      projMatch = (await hdrBoth('after-CO')) && projMatch;
      // Fact_Acct per document table, accounts by VALUE
      const docs = { l: {}, t: {} }; ['c_order', 'm_inout', 'c_invoice', 'c_payment', 'm_matchpo', 'm_matchinv'].forEach(t => { docs.l[t] = ((t === 'c_order' ? R : R2)[t] || { ins: [] }).ins.map(r => Number(r[t + '_id'])).concat(t === 'c_order' ? [] : []); docs.t[t] = ((t === 'c_order' ? O : O2)[t] || { ins: [] }).ins.map(r => Number(r[t + '_id'])); if (t === 'c_order') { docs.l[t] = orders; docs.t[t] = tOrders; } });
      let fl = [], ft = []; for (const t of Object.keys(docs.l)) { if (docs.l[t].length) fl = fl.concat(rowsJ(FACT(t, docs.l[t])).map(fnorm)); if (docs.t[t].length) ft = ft.concat(k.q(FACT(t, docs.t[t])).map(fnorm)); }
      fl.sort(); ft.sort(); const fok = JSON.stringify(fl) === JSON.stringify(ft);
      L('§PPL-FACTS ' + c.name + ' legacy rows=' + fl.length + ' twin rows=' + ft.length + ' ' + (fok ? (fl.length ? 'MATCH' : 'MATCH(both empty: nothing posted)') : 'DIFF'));
      if (!fok) { const sub = (a, b) => { const x = b.slice(); return a.filter(v => { const i = x.indexOf(v); if (i >= 0) { x.splice(i, 1); return false; } return true; }); }; sub(fl, ft).slice(0, 8).forEach(x => L('    legacy-only fact: ' + x)); sub(ft, fl).slice(0, 8).forEach(x => L('    twin-only fact:   ' + x)); }
      factDiff = !fok; if (fl.length === 0 && ft.length === 0) L('§PPL-FACTS-NOTE ' + c.name + ' no Fact_Acct on either side for these documents');
    }
    const judged = c1.judged + c2.judged, bad = c1.diffs.length + c2.diffs.length + (msgOk ? 0 : 1) + (logOk ? 0 : 1) + (projMatch ? 0 : 1) + (factDiff ? 1 : 0);
    const refusal = !ref.ok && !tx.ok && msgOk && !Object.keys(R).filter(t => !IGNORE.has(t)).length && !Object.keys(O).length;
    const v = refusal && !bad ? 'MATCH' : !judged ? 'INCONCLUSIVE' : bad ? 'DIFF' : 'MATCH'; tot[v === 'MATCH' ? 'match' : v === 'DIFF' ? 'diff' : 'inconclusive']++;
    L('§PPL-VERDICT ' + c.name + ' ' + v + ' tablesJudged=' + judged + ' tableDiffs=' + JSON.stringify(c1.diffs.concat(c2.diffs)) + ' message=' + (msgOk ? 'MATCH' : 'DIFF') + ' logs=' + (logOk ? 'MATCH' : 'DIFF') + ' projectHeader=' + (projMatch ? 'MATCH' : 'DIFF') + ' facts=' + (factDiff === null ? 'n/a' : factDiff ? 'DIFF' : 'MATCH'));
    SUM.push(c.name + '=' + v);
  }
  L('\n§PPL-SUMMARY scenarios=' + tot.scen + ' match=' + tot.match + ' diff=' + tot.diff + ' inconclusive=' + tot.inconclusive + ' :: ' + SUM.join(' '));
  if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n');
})().catch(e => { L('§PPL-FATAL ' + (e && e.stack || e)); if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n'); process.exit(2); });
