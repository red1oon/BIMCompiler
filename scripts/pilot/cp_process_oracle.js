// ⚠ DO NOT REMOVE — scope: W-CP-PROC-ORACLE (prompts/ERP_IDEMPIERE_UX_PARITY.md §CP). Runs the SAME AD_Process with the SAME
// params on REAL iDempiere (oracle bundle op=process on the pilot server, DB idempiere_pilot — never idempiere) and through
// OUR verbatim SvrProcess port (bim-ootb erp/ad_process.js runJava over erp/ad_seed.db), then diffs every table each side
// changed: per table inserted/updated/deleted counts, and the inserted/updated rows as a multiset over business columns
// (own key, Created/Updated(By), *_UU dropped; an FK to a row the run itself inserted → "NEW:<table>").
// Read the log after every run — exit code is not evidence.
// usage: node cp_process_oracle.js <cases.json> [--only a,b] [--off] [--log file]
//   --off = vacuity control: our port unregistered → every table the reference changes must show MISSING.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
const cfg = require('./pilot_cfg'), td = require('./pilot_tablediff');
const OOTB = process.env.CP_OOTB || '/tmp/wt-callouts';
const args = process.argv.slice(2);
const OFF = args.includes('--off');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const logFile = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;
const out = []; function L(s) { out.push(s); console.log(s); }
if (cfg.PG_DB === 'idempiere') { console.error('refusing reference DB'); process.exit(2); }

function oracle(req) {
  return new Promise((res, rej) => {
    const body = Buffer.from(JSON.stringify(req));
    const r = http.request({ host: '127.0.0.1', port: 8097, method: 'POST', path: '/', headers: { 'Content-Length': body.length } }, (resp) => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('oracle bad json ' + d.slice(0, 300))); } });
    });
    r.on('error', rej); r.setTimeout(1800000); r.write(body); r.end();
  });
}
const VOLATILE = /^(created|createdby|updated|updatedby|.*_uu|processedon|dateprinted)$/i;

// reference: the rows each changed table gained/changed, as JSON, PK-keyed
function refRows(tag) {
  const d = td.detail(tag, 'live', td.diff(tag, 'live')), res = {};
  for (const t of d) res[t.table.toLowerCase()] = { ins: t.inserted, upd: t.updated, del: t.deleted, pk: t.pk ? t.pk.split(',') : [],
    rows: t.insRows || [], updRows: (t.updRows || []).map(u => { const o = { __key: u.key.join('|') }; Object.keys(u.changes).forEach(c => { o[c] = u.changes[c][1]; }); return o; }) };
  return res;
}
async function engine() {
  const initSqlJs = require(os.homedir() + '/bim-ootb/tests/node_modules/sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp/ad_seed.db')));
  // the page applies erp/patches/ad_seed.db.sql on EVERY load (idempiere.html §AD-SEED-PATCH, same split + per-statement run) —
  // the witness must judge the DB the page actually runs on, not the raw seed.
  { const pf = path.join(OOTB, 'erp/patches/ad_seed.db.sql'); let ok = 0, fail = 0;
    if (fs.existsSync(pf)) fs.readFileSync(pf, 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.run(st); ok++; } catch (e) { fail++; } });
    console.log('§AD-SEED-PATCH (witness) statements=' + ok + ' failed=' + fail); }
  const query = (sql, params) => {
    const st = db.prepare(sql), rows = [];
    try { if (params && params.length) st.bind(params.map(v => v === undefined ? null : v));
      const cols = st.getColumnNames();
      while (st.step()) { const v = st.get(), o = {}; cols.forEach((c, i) => { o[String(c).toLowerCase()] = v[i]; }); rows.push(o); } }
    finally { st.free(); }
    return rows;
  };
  const A = require(path.join(OOTB, 'erp/ad_callout.js'));
  const cdir = path.join(OOTB, 'erp/callouts');
  if (fs.existsSync(cdir)) fs.readdirSync(cdir).filter(f => f.endsWith('.js')).sort((a, b) => (a === 'support.js' ? -1 : b === 'support.js' ? 1 : a < b ? -1 : 1)).forEach(f => require(path.join(cdir, f)));
  if (A.RUNTIME.registerSqlFunctions) A.RUNTIME.registerSqlFunctions((n, f) => db.create_function(n, f));
  else L('§CP-PROC-ENGINE no sqlfn.js yet — SQL functions absent');
  const ML = require(path.join(OOTB, 'erp/model_layer.js'));
  ['model_trade.js', 'model_ctor.js', 'model_order.js', 'model_invoice.js', 'model_post.js', 'model_cost.js', 'model_match.js'].forEach(f => { const p = path.join(OOTB, 'erp', f); if (fs.existsSync(p)) require(p); });
  const P = require(path.join(OOTB, 'erp/ad_process.js'));
  const pdir = path.join(OOTB, 'erp/processes');
  if (fs.existsSync(pdir)) fs.readdirSync(pdir).filter(f => f.endsWith('.js')).sort().forEach(f => require(path.join(pdir, f)));
  const cache = path.join(os.homedir(), '.cache/pilot/ad_msg_en.json');
  if (fs.existsSync(cache)) A.Msg.load(JSON.parse(fs.readFileSync(cache, 'utf8')));
  return { A, P, ML, query, db };
}
function oursRows(ops) {
  const res = {}, newKeys = {};
  const T = (t) => (res[t] = res[t] || { ins: 0, upd: 0, del: 0, rows: [], updRows: [] });
  ops.forEach(o => {
    const t = String(o.table || o.key || '').toLowerCase();
    if (o.op_type === 'CRUD_CREATE') { T(t).ins++; T(t).rows.push(o.fields || {}); }
    else if (o.op_type === 'CRUD_UPDATE') { T(t).upd++; const r = { __key: String(o.id) }; Object.keys(o.changes || {}).forEach(c => { r[c.toLowerCase()] = o.changes[c].new; }); T(t).updRows.push(r); }
    else if (o.op_type === 'CRUD_DELETE') T(t).del++;
  });
  return res;
}
function norm(v, newIds) {
  if (v && typeof v === 'object' && '__opRef' in v) return 'NEW';
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? 'Y' : 'N';
  const s = String(v);
  if (newIds && newIds.has(s)) return 'NEW';   // newIds here = the ids admissible for THIS column (see project)
  if (/^-?\d+(\.\d+)?$/.test(s)) return String(Number(s));
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}
// newIds: Map<table, Set<id>> of SURROGATE keys the reference run inserted. A ref value reads "NEW" only in an *_id column: the
// TableDir table's own set when it inserted rows (c_invoice_id → c_invoice), else any inserted id (non-TableDir FKs such as
// Ref_Invoice_ID). Never Line/SeqNo/Qty (pre-fix: AD_PInstance_Para SeqNo 10 masked every Line=10), never a composite/FK pk.
function colIds(newIds, lc) {
  if (!newIds) return null;
  if (/_acct$/.test(lc)) return newIds.get('c_validcombination') || null;   // Account reference (DisplayType 25) → C_ValidCombination
  if (!/_id$/.test(lc)) return null;
  const own = newIds.get(lc.slice(0, -3)); if (own) return own;
  return newIds.get('*');
}
function project(rows, tbl, newIds, keyCol) {
  return rows.map(r => { const o = {}; Object.keys(r).sort().forEach(c => { const lc = c.toLowerCase(); if (lc === keyCol || VOLATILE.test(lc) || lc === '__key') return; const v = norm(r[c], colIds(newIds, lc)); if (v !== null) o[lc] = v; }); return JSON.stringify(o); }).sort();
}

(async () => {
  let cases = JSON.parse(fs.readFileSync(args.find(a => a.endsWith('.json')), 'utf8'));
  if (only) cases = cases.filter(c => only.includes(c.name));
  const E = await engine();
  L('§CP-PROC-ENGINE ootb=' + OOTB + ' javaPorts=' + Object.keys(E.P.JAVA).length + (OFF ? ' MODE=OFF(vacuity)' : ''));
  if (OFF) Object.keys(E.P.JAVA).forEach(k => delete E.P.JAVA[k]);
  const tot = { cases: 0, tables: 0, tablesMatch: 0 };
  for (const c of cases) {
    tot.cases++;
    const tag = 'cp_' + c.name.replace(/\W/g, '_').toLowerCase();
    // one reference run at a time across concurrent harness processes (snap→process→diff is DB-global)
    const LOCK = path.join(os.homedir(), '.cache/pilot/cp_proc.lock');
    fs.mkdirSync(path.dirname(LOCK), { recursive: true });
    for (let w = 0; ; w++) { try { fs.mkdirSync(LOCK); break; } catch (e) { if (w > 3600) throw new Error('lock timeout ' + LOCK); await new Promise(r => setTimeout(r, 1000)); } }
    let ref, R;
    try {
    // case.preSql — the same pre-state on BOTH sides (e.g. the PeriodAction a user sets before pressing the button); applied before the snapshot
    if (c.preSql) { cfg.psql(c.preSql.join(';\n') + ';'); c.preSql.forEach(q => E.db.run(q)); L('§CP-PROC-PRESQL ' + c.name + ' n=' + c.preSql.length); }
    // case.alignFromSeed [{table, where}] — STATE, not logic: copy the oracle's pre-run rows into ours so both sides start equal
    // (declared by the cases since 2026-10-04 but never implemented: PeriodStatus close judged 23 open vs our 22 closed + 1 never-opened).
    for (const a of (c.alignFromSeed || [])) {
      const rows = (await oracle({ op: 'sql', sql: 'SELECT * FROM ' + a.table + ' WHERE ' + a.where })).rows || [];
      const cols = E.query('PRAGMA table_info(' + a.table + ')').map(r => r.name);
      rows.forEach(row => { const use = cols.filter(k => Object.prototype.hasOwnProperty.call(row, k.toLowerCase()));
        E.query('INSERT OR REPLACE INTO ' + a.table + ' (' + use.join(',') + ') VALUES (' + use.map(() => '?').join(',') + ')', use.map(k => { const v = row[k.toLowerCase()]; return v === undefined ? null : v; })); });
      L('§CP-PROC-ALIGN ' + c.name + ' ' + a.table + ' rows=' + rows.length);
    }
    // document-number sequences are STATE (the pilot's counters advance with every reference run): start ours from the oracle's
    { const seq = (await oracle({ op: 'sql', sql: "SELECT * FROM AD_Sequence WHERE IsTableID='N' AND AD_Client_ID IN (0," + ((c.ctx && c.ctx.client) || 11) + ")" })).rows || [];
      const cols = E.query('PRAGMA table_info(AD_Sequence)').map(r => r.name); let n = 0;
      seq.forEach(row => { const use = cols.filter(k => Object.prototype.hasOwnProperty.call(row, k.toLowerCase())); try { E.query('INSERT OR REPLACE INTO AD_Sequence (' + use.join(',') + ') VALUES (' + use.map(() => '?').join(',') + ')', use.map(k => row[k.toLowerCase()] === undefined ? null : row[k.toLowerCase()])); n++; } catch (eS) {} });
      L('§CP-PROC-MIRROR-SEQ ' + c.name + ' ad_sequence=' + n); }
    td.snap(tag);
    ref = await oracle({ op: 'process', process: c.process, recordId: c.recordId || 0, tableId: c.tableId || 0, params: c.params || [], ctx: Object.assign({ date: c.date || '2026-10-04' }, c.ctx || {}) });
    L('§CP-PROC-REF ' + c.name + ' ok=' + ref.ok + ' summary="' + (ref.summary || ref.error || '') + '" logs=' + JSON.stringify((ref.logs || []).slice(0, 5)));
    R = refRows(tag);
    cfg.psql('DROP SCHEMA IF EXISTS snap_' + tag + ' CASCADE;');
    } finally { try { fs.rmdirSync(LOCK); } catch (e) {} }
    // ours
    const env = { client: (c.ctx && c.ctx.client) || 11, org: (c.ctx && c.ctx.org) || 11, role: (c.ctx && c.ctx.role) || 102, user: (c.ctx && c.ctx.user) || 101, wh: (c.ctx && c.ctx.wh) || 103,
      date: (c.date || '2026-10-04') + ' 00:00:00', now: (c.date || '2026-10-04') + ' 00:00:00', nowMillis: Date.parse((c.date || '2026-10-04') + 'T00:00:00Z'), noWorkflow: !!c.noWorkflow };
    const procRow = E.query('SELECT classname, name FROM ad_process WHERE ad_process_id=?', [c.process])[0] || {};
    const params = {}; (c.params || []).forEach(p => { params[p.name] = { v: p.value, vTo: p.valueTo }; });
    let ours = { ok: false, summary: 'no port', ops: [], log: [] };
    if (E.P.JAVA[procRow.classname]) ours = E.P.runJava(E.query, env, { AD_Process_ID: c.process, className: procRow.classname, title: procRow.name, Record_ID: c.recordId || 0, Table_ID: c.tableId || 0, params });
    (ours.log || []).filter(l => /§(PROC|CALLOUT|MODEL)-(EXCEPTION|UNPORTED|ERR)/.test(l)).forEach(l => L('  ' + l));
    L('§CP-PROC-OURS ' + c.name + ' class=' + procRow.classname + ' ok=' + ours.ok + ' summary="' + (ours.summary || '') + '" ops=' + (ours.ops || []).length + ' logs=' + JSON.stringify((ours.logs || []).slice(0, 5)));
    const O = oursRows(ours.ops || []);
    const ignore = new Set((c.ignoreTables || ['ad_process', 'ad_pinstance', 'ad_pinstance_para', 'ad_pinstance_log', 'ad_changelog', 'ad_session', 'ad_user', 'c_acctprocessorlog', 'c_acctprocessor', 'ad_issue']).map(s => s.toLowerCase()));
    const newIds = new Map([['*', new Set()]]);   // surrogate keys only: pk = [<table>_id]
    Object.keys(R).forEach(t => { const pk = R[t].pk || []; if (pk.length !== 1 || String(pk[0]).toLowerCase() !== t.toLowerCase() + '_id') return;
      const set = newIds.get(t.toLowerCase()) || new Set(); (R[t].rows || []).forEach(r => { set.add(String(r[pk[0]])); newIds.get('*').add(String(r[pk[0]])); }); newIds.set(t.toLowerCase(), set); });
    // ID-allocation counters (AD_Sequence.IsTableID='Y', e.g. AD_PInstance's for the harness's own instance row) are not process
    // behaviour — ours allocates NEW: ids. Document-number sequences (IsTableID='N') stay judged.
    if (R.ad_sequence) { const ids = (R.ad_sequence.updRows || []).map(u => Number(u.__key)).filter(n => n > 0);
      const tid = new Set(ids.length ? ((await oracle({ op: 'sql', sql: "SELECT ad_sequence_id FROM AD_Sequence WHERE IsTableID='Y' AND AD_Sequence_ID IN (" + ids.join(',') + ')' })).rows || []).map(r => String(r.ad_sequence_id)) : []);
      const keep = (R.ad_sequence.updRows || []).filter(u => !tid.has(String(Number(u.__key))));
      const dropped = (R.ad_sequence.updRows || []).length - keep.length;
      if (dropped) { L('§CP-PROC-IDSEQ ' + c.name + ' ignored ' + dropped + ' table-ID counter bump(s)'); R.ad_sequence.updRows = keep; R.ad_sequence.upd -= dropped; if (!R.ad_sequence.upd && !R.ad_sequence.ins && !R.ad_sequence.del) delete R.ad_sequence; } }
    const allT = new Set([...Object.keys(R), ...Object.keys(O)].map(s => s.toLowerCase()));
    const judgedBefore = tot.tables;
    for (const t of [...allT].sort()) {
      if (ignore.has(t)) continue;
      if (c.tables && !c.tables.map(s => s.toLowerCase()).includes(t)) continue;
      tot.tables++;
      const r = R[t] || { ins: 0, upd: 0, del: 0, rows: [], updRows: [] }, o = O[t] || { ins: 0, upd: 0, del: 0, rows: [], updRows: [] };
      const keyCol = t + '_id';
      const pr = project(r.rows, t, newIds, keyCol), po = project(o.rows, t, null, keyCol);
      const missing = pr.filter(x => !po.includes(x)), extra = po.filter(x => !pr.includes(x));
      const counts = 'ins ' + r.ins + '/' + o.ins + ' upd ' + r.upd + '/' + o.upd + ' del ' + r.del + '/' + o.del;
      const updR = project(r.updRows, t, newIds, keyCol), updO = project(o.updRows, t, null, keyCol);
      const updMiss = updR.filter(x => !updO.includes(x)), updExtra = updO.filter(x => !updR.includes(x));
      const match = r.ins === o.ins && r.upd === o.upd && r.del === o.del && !missing.length && !extra.length && !updMiss.length && !updExtra.length;
      if (match) tot.tablesMatch++;
      L('§CP-PROC-TABLE ' + c.name + ' ' + t + ' (ref/ours) ' + counts + ' ' + (match ? 'MATCH' : 'DIFF') +
        (missing.length ? ' missingRows=' + missing.slice(0, 3).join(' ') : '') + (extra.length ? ' extraRows=' + extra.slice(0, 3).join(' ') : '') +
        (updMiss.length ? ' refUpd=' + updMiss.slice(0, 3).join(' ') : '') + (updExtra.length ? ' oursUpd=' + updExtra.slice(0, 3).join(' ') : ''));
    }
    if (tot.tables === judgedBefore) { tot.vacuous = (tot.vacuous || 0) + 1; L('§CP-PROC-VACUOUS ' + c.name + ' no judged table changed on either side — INCONCLUSIVE (needs a pre-state that gives the process work)'); }
  }
  L('§CP-PROC-SUMMARY cases=' + tot.cases + ' tables=' + tot.tables + ' match=' + tot.tablesMatch + ' vacuous=' + (tot.vacuous || 0) + (OFF ? ' MODE=OFF' : '') + ' verdict=' + (!tot.tables ? 'INCONCLUSIVE' : tot.tablesMatch === tot.tables && !tot.vacuous ? 'PASS' : tot.tablesMatch === tot.tables ? 'PASS-PARTIAL(vacuous cases)' : 'DIFF'));
  if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n');
})().catch(e => { L('§CP-PROC-FATAL ' + (e && e.stack || e)); if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n'); process.exit(2); });
