// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-MODEL-ORACLE (prompts/ERP_MODEL_LAYER.md §WITNESS). Re-derive real iDempiere documents with OUR model layer
//   (bim-ootb erp/model_layer.js + model_order.js + model_invoice.js — the SHIPPED files, loaded from OOTB) and compare
//   EVERY table of the document's whole-DB footprint, column by column.
//   THE ISSUE it proves/disproves: a completion that writes a subset of what iDempiere writes (W-FOLD-COMPLETE compared
//   3 chosen tables). The table set is DERIVED by scripts/model_oracle/closure.py (FK walk), never hand-picked.
//   Oracle = idempiere_pilot (iDempiere 13 live server, the pilot's documents; READ-ONLY). Pre-state = the pristine
//   `idempiere` DB (the pilot DB is its copy), dumped by scripts/model_oracle/dump_prestate.py.
//   Verdicts per table: MATCH · VALUE-DIFF · MISSING · EXTRA · NAMED-EXCLUDED (with reason). Never PASS when nothing judged.
// §-log first — READ the log before any conclusion. Run: node scripts/poc_model_layer_oracle.js > build/erp/poc_model_layer_oracle.log
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const Database = require('better-sqlite3');
const OOTB = process.env.OOTB || '/home/red1/bim-ootb';
const SCR = process.env.SCR || '/tmp/claude-1000/model_oracle';
fs.mkdirSync(SCR, { recursive: true });
const ML = require(path.join(OOTB, 'erp/model_layer.js'));
require(path.join(OOTB, 'erp/model_order.js')); require(path.join(OOTB, 'erp/model_invoice.js')); require(path.join(OOTB, 'erp/model_post.js')); try { require(path.join(OOTB, 'erp/model_cost.js')); require(path.join(OOTB, 'erp/model_match.js')); require(path.join(OOTB, 'erp/model_ctor.js')); } catch (e) { if (!/Cannot find module/.test(e.message)) throw e; }
const PRE = path.join(SCR, 'prestate.db');
if (!fs.existsSync(PRE) || process.env.REDUMP) cp.execFileSync('python3', [path.join(__dirname, 'model_oracle/dump_prestate.py'), PRE], { stdio: 'ignore' });

const db = new Database(fs.readFileSync(PRE));
// §FIXTURE-SHIPPED-SEED-2026-10-11 (prompts/SQLiteIDEMPIERE.md): the closure-derived prestate carries only the document footprint, so the model layer's server-side
// pricing (MOrderLine ProductNotOnPriceList) and role checks found NO price/role tables => every order refused for a FIXTURE reason. Bring the missing REFERENCE tables
// from the shipped seed + its self-heal patch (same loader as scripts/bridge/witness_m3_gap.js); a table the prestate already has is never overwritten.
{
  const FX = require('./bridge/ad_shipped_fixture.js').loadShipped(OOTB, m => console.log(m));
  const have = new Set(db.prepare("SELECT lower(name) n FROM sqlite_master WHERE type='table'").all().map(r => r.n));
  const added = [];
  for (const t of ['m_productprice', 'm_productpricevendorbreak', 'm_pricelist', 'm_pricelist_version', 'm_discountschema', 'm_discountschemaline', 'm_discountschemabreak', 'ad_role', 'ad_role_orgaccess', 'ad_user_roles']) {
    if (have.has(t)) continue;
    const cs = FX.db.prepare('PRAGMA table_info(' + t + ')').all(); if (!cs.length) continue;
    db.exec('CREATE TABLE ' + t + ' (' + cs.map(c => '"' + c.name.toLowerCase() + '"').join(',') + ')');
    const rows = FX.db.prepare('SELECT * FROM ' + t).all(), ks = cs.map(c => c.name), ins = db.prepare('INSERT INTO ' + t + ' VALUES (' + ks.map(() => '?').join(',') + ')');
    db.transaction(() => rows.forEach(r => ins.run(...ks.map(k => r[k] == null ? null : r[k]))))(); added.push(t + ':' + rows.length);
  }
  const U = require('./bridge/ad_shipped_fixture.js').registerUdfs(OOTB, db); console.log(`§FIXTURE_ORACLE_UDF registered=${U.n}${U.why ? ' INCONCLUSIVE:' + U.why : ''}`);
  let pp = 0; try { pp = db.prepare('SELECT COUNT(*) n FROM m_productprice').get().n; } catch (e) {}
  console.log(`§FIXTURE_ORACLE_PRESTATE reference tables added=[${added.join(' ') || 'none'}] product_prices=${pp} ${pp > 0 ? 'FIXTURE_HAS_PRICES' : 'INCONCLUSIVE:fixture has no product prices'}`);
}
const cols = {}; function colsOf(t) { if (!cols[t]) cols[t] = db.prepare('PRAGMA table_info(' + t + ')').all().map(c => c.name); return cols[t]; }
const _rq = require('./bridge/ad_shipped_fixture.js').reentrant(db, OOTB);
const query = (sql, params) => _rq(sql, (params || []).map(v => v == null ? null : v));   // re-entrant-safe (pricing UDFs query inside a statement)
function pg(sql) { const r = cp.execFileSync('psql', ['-h', 'localhost', '-U', 'adempiere', '-d', 'idempiere_pilot', '-At', '-c', 'set search_path=adempiere; select coalesce(json_agg(t),\'[]\') from (' + sql + ') t'], { env: Object.assign({}, process.env, { PGPASSWORD: 'adempiere' }), maxBuffer: 1 << 26 }).toString().trim().split('\n').filter(x => x !== 'SET').join(''); return JSON.parse(r); }
function oracle(root, stop) { const out = cp.execFileSync('python3', [path.join(__dirname, 'model_oracle/closure.py'), root], { env: Object.assign({}, process.env, { DB: 'idempiere_pilot', ROWS: '1', STOP: (stop || []).join(',') }), maxBuffer: 1 << 26 }).toString().trim().split('\n'); return JSON.parse(out[out.length - 1]); }

// ── apply a model op-group to the SQLite pre-state (what the kernel's commitGroup + listTip fold do in the page) ──
let nextId = {}; const created = {};
function newId(t) { if (nextId[t] == null) { const r = db.prepare('SELECT MAX(' + t + '_id) AS m FROM ' + t).get(); nextId[t] = Math.max(Number(r.m || 0), 2000000); } return ++nextId[t]; }
function apply(ops) {
  const ids = [], unknown = {};
  const fix = v => (v && typeof v === 'object' && v.__opRef != null) ? ids[v.__opRef] : v;
  ops.forEach((o, i) => {
    const t = o.table, cs = colsOf(t);
    if (!cs.length) { unknown[t] = (unknown[t] || 0) + 1; ids[i] = null; return; }
    if (o.op_type === 'CRUD_CREATE') {
      const f = Object.assign({}, o.fields), pk = t + '_id';
      if (cs.includes(pk)) { f[pk] = o._forcePk != null ? o._forcePk : newId(t); ids[i] = f[pk]; } else ids[i] = f[t + '_uu'];
      Object.keys(f).forEach(k => { f[k] = fix(f[k]); if (!cs.includes(k)) { unknown[t + '.' + k] = 1; delete f[k]; } });
      const ks = Object.keys(f); db.prepare('INSERT INTO ' + t + ' (' + ks.map(k => '"' + k + '"').join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')').run(...ks.map(k => f[k]));
      (created[t] = created[t] || []).push(ids[i]);
    } else if (o.op_type === 'CRUD_UPDATE') {
      const ks = Object.keys(o.changes).filter(k => cs.includes(k)); Object.keys(o.changes).forEach(k => { if (!cs.includes(k)) unknown[t + '.' + k] = 1; });
      if (ks.length) db.prepare('UPDATE ' + t + ' SET ' + ks.map(k => '"' + k + '"=?').join(',') + ' WHERE ' + (o.idCol || t + '_id') + '=?').run(...ks.map(k => fix(o.changes[k].new)), fix(o.id));
      ids[i] = fix(o.id);
    } else if (o.op_type === 'CRUD_DELETE') { db.prepare('DELETE FROM ' + t + ' WHERE ' + (o.idCol || t + '_id') + '=?').run(fix(o.id)); }
  });
  return { ids, unknown };
}
function lc(r) { const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; }

// ── our closure (same walk as closure.py, over SQLite) ──
const DOCS = new Set(['c_order', 'c_orderline', 'm_inout', 'm_inoutline', 'c_invoice', 'c_invoiceline', 'c_payment', 'c_allocationhdr', 'c_allocationline', 'm_transaction', 'm_costdetail']);
const TABLES = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
function ourClosure(rootT, rootId, stop) {
  const STOP = new Set(stop || []);
  const found = { [rootT]: new Set([rootId]) }, q = [[rootT, rootId]];
  const up = { c_allocationline: ['c_allocationhdr_id', 'c_payment_id'] };
  let guard = 0;
  while (q.length && guard++ < 5000) {
    const [t, i] = q.pop(); if (!DOCS.has(t)) continue;
    const fk = t + '_id';
    TABLES.forEach(t2 => { if (t2 === t) return; const cs = colsOf(t2); if (!cs.includes(fk)) return; const pk = cs.includes(t2 + '_id') ? t2 + '_id' : 'rowid';
      db.prepare('SELECT ' + pk + ' AS k FROM ' + t2 + ' WHERE ' + fk + '=?').all(i).forEach(r => { if (STOP.has(t2 + ':' + r.k)) return; const s = found[t2] = found[t2] || new Set(); if (!s.has(r.k)) { s.add(r.k); q.push([t2, r.k]); } }); });
    const tid = db.prepare('SELECT ad_table_id AS id FROM ad_table WHERE lower(tablename)=?').get(t);
    if (tid) TABLES.forEach(t2 => { const cs = colsOf(t2); if (!cs.includes('record_id') || !cs.includes('ad_table_id')) return; const pk = cs.includes(t2 + '_id') ? t2 + '_id' : 'rowid';
      db.prepare('SELECT ' + pk + ' AS k FROM ' + t2 + ' WHERE ad_table_id=? AND record_id=?').all(tid.id, i).forEach(r => { const s = found[t2] = found[t2] || new Set(); if (!s.has(r.k)) { s.add(r.k); q.push([t2, r.k]); } }); });
    (up[t] || []).forEach(c => { const r = db.prepare('SELECT ' + c + ' AS v FROM ' + t + ' WHERE ' + t + '_id=?').get(i); if (r && r.v) { const pt = c.slice(0, -3); const s = found[pt] = found[pt] || new Set(); if (!s.has(r.v)) { s.add(r.v); q.push([pt, r.v]); } } });
  }
  const out = {};
  Object.keys(found).forEach(t => { const pk = colsOf(t).includes(t + '_id') ? t + '_id' : 'rowid'; out[t] = [...found[t]].map(k => lc(db.prepare('SELECT * FROM ' + t + ' WHERE ' + pk + '=?').get(k))); });
  return out;
}

// ── compare ──
const VOLATILE = /^(created|updated|createdby|updatedby|processedon|.*_uu)$/;
const EXCLUDED = { ad_changelog: 'NAMED-EXCLUDED: our signed op-log carries {old,new} per column (prompts/ERP_MODEL_LAYER.md W2) — AD_ChangeLog rows are a projection, not ported' };
function norm(v) { if (v == null || v === '') return null; if (typeof v === 'number') return Math.round(v * 1e6) / 1e6; const s = String(v); if (/^-?\d+(\.\d+)?$/.test(s)) return Math.round(Number(s) * 1e6) / 1e6; if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10) + (s.slice(11, 19) && s.slice(11, 19) !== '00:00:00' ? ' ' + s.slice(11, 19) : ''); return s; }
function compareDoc(name, orc, ours) {
  const order = ['c_order', 'c_orderline', 'm_inout', 'm_inoutline', 'c_invoice', 'c_invoiceline', 'c_payment', 'c_allocationhdr', 'c_allocationline'];
  const tables = [...new Set([...order.filter(t => orc[t] || ours[t]), ...Object.keys(orc), ...Object.keys(ours)])];
  const idmap = {}; let judged = 0, matched = 0; const res = [];
  const P = {};
  // pass 1 — pair rows per table (greedy best column agreement), building the oracle→ours id map for EVERY table first,
  // so FK columns are judged through the map regardless of table order (c_invoice.c_payment_id needs c_payment's pairing).
  tables.forEach(t => {
    if (EXCLUDED[t]) return;
    const O = (orc[t] || []).slice(), U = (ours[t] || []).slice(), pk = t + '_id', pairs = [];
    const cmpCols = r => Object.keys(r).filter(c => !VOLATILE.test(c) && c !== pk && !c.endsWith('_id'));
    O.forEach(o => { let best = -1, bs = -1; U.forEach((u, j) => { if (!u) return; const sc = cmpCols(o).filter(c => norm(o[c]) === norm(u[c])).length; if (sc > bs) { bs = sc; best = j; } });
      if (best >= 0) { pairs.push([o, U[best]]); if (o[pk] != null) (idmap[t] = idmap[t] || {})[o[pk]] = U[best][pk]; U[best] = null; } else pairs.push([o, null]); });
    P[t] = { O, pairs, extra: U.filter(Boolean).length };
  });
  // pass 1b — re-pair with mapped FK columns now that every table's id map exists (disambiguates look-alike rows,
  // e.g. M_CostHistory rows of different cost elements with equal amounts).
  function eqAny(c, a, b) {
    let ft = c.slice(0, -3);
    if (c.endsWith('_id') && idmap[ft] && a[c] != null && idmap[ft][a[c]] !== undefined) return String(idmap[ft][a[c]]) === String(b[c]);
    return norm(a[c]) === norm(b[c]);
  }
  tables.forEach(t => {
    if (EXCLUDED[t]) return;
    const O = P[t].O, U = (ours[t] || []).slice(), pk = t + '_id', pairs = [];
    const cc = r => Object.keys(r).filter(c => !VOLATILE.test(c) && c !== pk);
    O.forEach(o => { let best = -1, bs = -1; U.forEach((u, j) => { if (!u) return; const sc = cc(o).filter(c => eqAny(c, o, u)).length; if (sc > bs) { bs = sc; best = j; } });
      if (best >= 0) { pairs.push([o, U[best]]); if (o[pk] != null) (idmap[t] = idmap[t] || {})[o[pk]] = U[best][pk]; U[best] = null; } else pairs.push([o, null]); });
    P[t] = { O, pairs, extra: U.filter(Boolean).length };
  });
  tables.forEach(t => {
    if (EXCLUDED[t]) { res.push('§MODEL-ORACLE doc=' + name + ' table=' + t + ' verdict=' + EXCLUDED[t] + ' oracleRows=' + (orc[t] || []).length); return; }
    const { O, pairs, extra } = P[t], pk = t + '_id';
    const cmpCols = r => Object.keys(r).filter(c => !VOLATILE.test(c) && c !== pk);
    function eqCol(c, a, b) {
      let ft = c.slice(0, -3);
      if (c === 'line_id' && a.ad_table_id != null) { const tn = db.prepare('SELECT lower(tablename) AS n FROM ad_table WHERE ad_table_id=?').get(a.ad_table_id); if (tn) { const lt = tn.n.replace(/hdr$/, '') + 'line'; if (idmap[lt] && idmap[lt][a[c]] !== undefined) return String(idmap[lt][a[c]]) === String(b[c]); } }
      if (c === 'record_id' && a.ad_table_id != null) { const tn = db.prepare('SELECT lower(tablename) AS n FROM ad_table WHERE ad_table_id=?').get(a.ad_table_id); if (tn) { ft = tn.n; if (idmap[ft] && idmap[ft][a[c]] !== undefined) return String(idmap[ft][a[c]]) === String(b[c]); } }
      if (c.endsWith('_id') && idmap[ft] && a[c] != null && idmap[ft][a[c]] !== undefined) return String(idmap[ft][a[c]]) === String(b[c]);
      return norm(a[c]) === norm(b[c]) || (norm(a[c]) == null && (b[c] === 0 || b[c] === '0') && c.endsWith('_id')) || (norm(b[c]) == null && (a[c] === 0) && c.endsWith('_id'));
    }
    const missing = pairs.filter(p => !p[1]).length, diffs = [];
    pairs.forEach(([o, u]) => { if (!u) return; cmpCols(o).forEach(c => { if (!(c in u) && o[c] == null) return; if (!eqCol(c, o, u)) diffs.push(c + '=' + JSON.stringify(u[c] === undefined ? '∅col' : u[c]) + '≠' + JSON.stringify(o[c])); }); });
    judged++;
    const v = !O.length && extra ? 'EXTRA' : missing === O.length && O.length ? 'MISSING' : (missing || extra || diffs.length) ? 'VALUE-DIFF' : 'MATCH';
    if (v === 'MATCH') matched++;
    res.push('§MODEL-ORACLE doc=' + name + ' table=' + t + ' verdict=' + v + ' oracleRows=' + O.length + ' ourRows=' + (ours[t] || []).length + (missing ? ' missingRows=' + missing : '') + (extra ? ' extraRows=' + extra : '') + (diffs.length ? ' diffs=' + diffs.slice(0, 40).join(' ; ') : ''));
  });
  res.forEach(l => console.log(l));
  console.log('§MODEL-ORACLE-DOC doc=' + name + ' tables=' + judged + ' matched=' + matched + (judged ? '' : ' INCONCLUSIVE(nothing judged)'));
  return { judged, matched };
}

// ── drive one pilot order: draft header + lines through OUR save path, then DocAction CO (no workflow — the pilot's WS route) ──
const INPUT_LINE = ['ad_org_id', 'line', 'm_product_id', 'c_charge_id', 'c_uom_id', 'qtyentered', 'qtyordered', 'priceentered', 'priceactual', 'pricelist', 'pricelimit', 'c_tax_id', 'm_warehouse_id', 'description', 'm_attributesetinstance_id', 'datepromised'];
const env = { noPost: !!process.env.FALSIFY_NOPOST, client: 11, org: 11, user: 101, date: '2026-10-04', now: '2026-10-04 14:42:42', nowMillis: 1791074562000, std: { actor: 101, clientId: 11, orgId: 11 } };
let seq = 0; env.uuid = () => 'model-oracle-uu-' + (++seq);
function driveOrder(orderId) {
  const o = pg('select * from c_order where c_order_id=' + orderId)[0];
  const ls = pg('select * from c_orderline where c_order_id=' + orderId + ' order by line');
  const chg = pg("select c.columnname, cl.oldvalue, cl.record_id, t.tablename from ad_changelog cl join ad_column c on c.ad_column_id=cl.ad_column_id join ad_table t on t.ad_table_id=cl.ad_table_id where t.tablename in ('C_Order','C_OrderLine') and cl.record_id in (" + [orderId].concat(ls.map(l => l.c_orderline_id)).join(',') + ') order by cl.ad_changelog_id desc');
  const hdr = {}; Object.keys(o).forEach(k => { hdr[k] = o[k]; });
  chg.filter(c => c.tablename === 'C_Order').forEach(c => { const k = c.columnname.toLowerCase(); hdr[k] = c.oldvalue === 'NULL' ? null : c.oldvalue === 'false' ? 'N' : c.oldvalue === 'true' ? 'Y' : c.oldvalue; });
  Object.assign(hdr, { docstatus: 'DR', docaction: 'CO', processed: 'N', isapproved: 'N', posted: 'N', processedon: 0, c_doctype_id: 0, totallines: 0, grandtotal: 0, volume: null, weight: null, c_payment_id: null, c_cashline_id: null });
  ['created', 'updated'].forEach(k => delete hdr[k]);
  for (const k in hdr) if (typeof hdr[k] === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(hdr[k])) hdr[k] = hdr[k].replace('T', ' ').slice(0, 19);
  const cs = colsOf('c_order'); const ks = Object.keys(hdr).filter(k => cs.includes(k));
  db.prepare('INSERT INTO c_order (' + ks.map(k => '"' + k + '"').join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')').run(...ks.map(k => hdr[k]));
  // lines through the model SAVE path (beforeSave + afterSave roll-ups fire)
  let saveOps = 0;
  ls.forEach(l => { chg.filter(c => c.tablename === 'C_OrderLine' && String(c.record_id) === String(l.c_orderline_id)).forEach(c => { l[c.columnname.toLowerCase()] = c.oldvalue === 'NULL' ? null : c.oldvalue; });   // the line as entered (before Complete/Void)
    const f = { c_order_id: orderId }; INPUT_LINE.forEach(c => { if (l[c] != null) f[c] = (typeof l[c] === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(l[c])) ? l[c].replace('T', ' ').slice(0, 19) : l[c]; });
    const r = ML.run(query, env, { table: 'c_orderline', timing: 'SAVE', changes: ML.newPO(new ML.Trx(query, env), 'c_orderline', f) });
    // keep the pilot's line id so later documents (manual shipment/invoice lines) resolve their C_OrderLine_ID FK
    const fixedOps = r.ops.map(op => { if (op.op_type === 'CRUD_CREATE' && op.table === 'c_orderline') op._forcePk = l.c_orderline_id; return op; });
    apply(fixedOps); saveOps += r.ops.length; if (!r.ok) console.log('§MODEL-SAVE-ERR order=' + orderId + ' ' + (r.error || r.msg)); });
  const r = ML.run(query, Object.assign({ noWorkflow: true }, env), { table: 'c_order', timing: 'DOCACTION', id: orderId, action: 'CO' });
  r.log.forEach(l => console.log(l));
  const a = apply(r.ops);
  r.ops.concat(r._save || []).forEach(op => { if (op.op_type === 'CRUD_UPDATE' && AGG.includes(op.table)) (touched[op.table] = touched[op.table] || new Set()).add(op.idCol ? op.idCol + '=' + op.id : op.table + '_id=' + op.id); });
  console.log('§MODEL-RUN order=' + orderId + ' docno=' + o.documentno + ' ok=' + r.ok + ' status=' + r.status + (r.msg ? ' msg="' + r.msg + '"' : '') + ' saveOps=' + saveOps + ' completeOps=' + r.ops.length +
    ' opTables=' + JSON.stringify(r.ops.reduce((m, x) => { const k = x.table + ':' + x.op_type.replace('CRUD_', ''); m[k] = (m[k] || 0) + 1; return m; }, {})) + (Object.keys(a.unknown).length ? ' unknownCols=' + Object.keys(a.unknown).join(',') : ''));
  return r;
}

// ── aggregate (non doc-keyed) tables: the rows our replay touched vs the same rows in the pilot DB ──
const AGG = ['c_bpartner', 'm_storageonhand', 'm_storagereservation', 'm_cost', 'm_costqueue', 'ad_sequence', 'c_acctschema'];
const touched = {};
function aggregates() {
  let judged = 0, matched = 0;
  Object.keys(touched).forEach(t => [...touched[t]].forEach(k => {
    const [col, val] = k.split('='); const ours = lc(db.prepare('SELECT * FROM ' + t + ' WHERE ' + col + '=?').get(isNaN(val) ? val : Number(val)) || {});
    const orc = pg('select * from ' + t + ' where ' + col + '=' + (isNaN(val) ? "'" + val + "'" : val))[0] || {};
    const diffs = Object.keys(orc).filter(c => !VOLATILE.test(c) && c in ours && norm(orc[c]) !== norm(ours[c])).map(c => c + '=' + JSON.stringify(ours[c]) + '≠' + JSON.stringify(orc[c]));
    judged++; if (!diffs.length) matched++;
    console.log('§MODEL-AGG table=' + t + ' key=' + k + ' verdict=' + (diffs.length ? 'VALUE-DIFF diffs=' + diffs.join(' ; ') : 'MATCH'));
  }));
  console.log('§MODEL-AGG-SUMMARY rowsJudged=' + judged + ' matched=' + matched + ' (pilot final state; a row also touched by a pilot doc OUTSIDE this replay shows as VALUE-DIFF — read per row)');
}
// ── generic driver for ANY pilot document (standard cycle: manual shipment / invoice / payment): header reverted to
//    its pre-Complete state from ad_changelog old values (generic, per column), lines through the model SAVE path with the
//    pilot's own line ids kept (so later documents' FKs resolve), then DocAction CO. ──
const LINES = { c_order: 'c_orderline', m_inout: 'm_inoutline', c_invoice: 'c_invoiceline', c_payment: null };
const RESET_LINE = { c_orderline: { qtydelivered: 0, qtyinvoiced: 0, qtyreserved: 0, processed: 'N' }, m_inoutline: { processed: 'N' }, c_invoiceline: { processed: 'N' } };
function tsFix(v) { return (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) ? v.replace('T', ' ').slice(0, 19) : v; }
function revert(t, row, id) {
  const TN = { c_order: 'C_Order', c_orderline: 'C_OrderLine', m_inout: 'M_InOut', m_inoutline: 'M_InOutLine', c_invoice: 'C_Invoice', c_invoiceline: 'C_InvoiceLine', c_payment: 'C_Payment' }[t];
  const chg = pg("select c.columnname, cl.oldvalue from ad_changelog cl join ad_column c on c.ad_column_id=cl.ad_column_id join ad_table t on t.ad_table_id=cl.ad_table_id where t.tablename='" + TN + "' and cl.record_id=" + id + ' order by cl.ad_changelog_id desc');
  const r = {}; Object.keys(row).forEach(k => { r[k] = tsFix(row[k]); });
  chg.forEach(c => { r[c.columnname.toLowerCase()] = c.oldvalue === 'NULL' ? null : c.oldvalue === 'false' ? 'N' : c.oldvalue === 'true' ? 'Y' : tsFix(c.oldvalue); });
  delete r.created; delete r.updated; return r;
}
function driveDoc(t, id) {
  if (t === 'c_order') return driveOrder(id);
  const lt = LINES[t];
  const hdr = Object.assign(revert(t, pg('select * from ' + t + ' where ' + t + '_id=' + id)[0], id), { docstatus: 'DR', docaction: 'CO', processed: 'N', posted: 'N', isapproved: 'N', processedon: 0 });
  if (t === 'c_invoice') Object.assign(hdr, { c_doctype_id: 0, ispaid: 'N', totallines: 0, grandtotal: 0, c_payment_id: null });
  if (t === 'c_payment') Object.assign(hdr, { isallocated: 'N' });
  if (t === 'm_inout') Object.assign(hdr, { volume: null, weight: null });
  const cs = colsOf(t), ks = Object.keys(hdr).filter(k => cs.includes(k));
  db.prepare('INSERT INTO ' + t + ' (' + ks.map(k => '"' + k + '"').join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')').run(...ks.map(k => hdr[k]));
  let saveOps = 0;
  if (lt) pg('select * from ' + lt + ' where ' + t + '_id=' + id + ' order by line').forEach(l => {
    const f = revert(lt, l, l[lt + '_id']); const pid = f[lt + '_id']; delete f[lt + '_id']; delete f[lt + '_uu']; Object.assign(f, RESET_LINE[lt] || {});
    const r = ML.run(query, env, { table: lt, timing: 'SAVE', changes: f });
    r.ops.forEach(op => { if (op.op_type === 'CRUD_CREATE' && op.table === lt) op._forcePk = pid; });
    apply(r.ops); saveOps += r.ops.length; if (!r.ok) console.log('§MODEL-SAVE-ERR ' + t + '=' + id + ' ' + (r.error || r.msg));
  });
  const r = ML.run(query, Object.assign({ noWorkflow: true }, env), { table: t, timing: 'DOCACTION', id: id, action: 'CO' });
  r.log.forEach(l => console.log(l));
  const a = apply(r.ops);
  r.ops.forEach(op => { if (op.op_type === 'CRUD_UPDATE' && AGG.includes(op.table)) (touched[op.table] = touched[op.table] || new Set()).add(op.idCol ? op.idCol + '=' + op.id : op.table + '_id=' + op.id); });
  console.log('§MODEL-RUN ' + t + '=' + id + ' docno=' + hdr.documentno + ' ok=' + r.ok + ' status=' + r.status + (r.msg ? ' msg="' + r.msg + '"' : '') + ' saveOps=' + saveOps + ' completeOps=' + r.ops.length + (Object.keys(a.unknown).length ? ' unknownCols=' + Object.keys(a.unknown).join(',') : ''));
  return r;
}
// the pilot's documents in creation order (READ from the pilot DB, not hand-listed); VO / DR documents are named, not driven
const DOCSEQ = process.env.ORDERS ? process.env.ORDERS.split(',').map(x => ['c_order', Number(x)])
  : pg("select tb, id, docstatus, to_char(created,'YYYY-MM-DD HH24:MI:SS.MS') as at from (select 'c_order' tb, c_order_id id, docstatus, created from c_order union all select 'm_inout', m_inout_id, docstatus, created from m_inout union all select 'c_invoice', c_invoice_id, docstatus, created from c_invoice union all select 'c_payment', c_payment_id, docstatus, created from c_payment) x where created > '2026-10-04' order by created").filter(d => {
      if (d.docstatus === 'VO' && d.tb === 'c_order') return true;                 // c7: completed, then voided (MOrder.voidIt)
      if (d.docstatus !== 'CO') { console.log('§MODEL-ORACLE-NAMED ' + d.tb + '=' + d.id + ' docstatus=' + d.docstatus + ' — not a Complete (void/draft) → not driven by this witness'); return false; } return true; })
    .map(d => [d.tb, d.id, d.at, d.docstatus]);
const generated = new Set(), driven = [];
let T = 0, M = 0, nDocs = 0;
// phase 1 — drive every document in pilot order (a document an earlier completion generated is not driven again)
const ms = a => new Date(String(a).replace(' ', 'T') + 'Z').getTime();
DOCSEQ.forEach(([t, id, at, st]) => {
  if (generated.has(t + ':' + id)) return;
  driveDoc(t, id); nDocs++; driven.push([t, id]);
  if (st === 'VO') { const rv = ML.run(query, Object.assign({ noWorkflow: true }, env), { table: t, timing: 'DOCACTION', id: id, action: 'VO' }); rv.log.forEach(l => console.log(l)); apply(rv.ops);
    rv.ops.forEach(op => { if (op.op_type === 'CRUD_UPDATE' && AGG.includes(op.table)) (touched[op.table] = touched[op.table] || new Set()).add(op.idCol ? op.idCol + '=' + op.id : op.table + '_id=' + op.id); });
    console.log('§MODEL-RUN ' + t + '=' + id + ' action=VO ok=' + rv.ok + ' status=' + rv.status + (rv.msg ? ' msg="' + rv.msg + '"' : '') + ' ops=' + rv.ops.length); }
  // a document created between this root's creation and its DocStatus→CO audit row was generated BY its completion
  // (MOrder.createShipment/createInvoice, MInvoice cash payment) — read from AD_ChangeLog, not guessed
  const co = pg("select to_char(cl.created,'YYYY-MM-DD HH24:MI:SS.MS') as at from ad_changelog cl join ad_column c on c.ad_column_id=cl.ad_column_id join ad_table tt on tt.ad_table_id=cl.ad_table_id where lower(tt.tablename)='" + t + "' and cl.record_id=" + id + " and c.columnname='DocStatus' and cl.newvalue='CO' order by cl.created desc limit 1")[0];
  if (co && at) DOCSEQ.forEach(d => { if (ms(d[2]) > ms(at) && ms(d[2]) <= ms(co.at)) generated.add(d[0] + ':' + d[1]); });
});
// phase 2 — compare each driven document's footprint at the END (final state on both sides), never walking into another
// driven document (c4: the hand-entered shipment/invoice/payment are their own documents)
driven.forEach(([t, id]) => {
  const stop = driven.filter(d => !(d[0] === t && d[1] === id)).map(d => d[0] + ':' + d[1]);
  const orc = oracle(t + ':' + id, stop), ours = ourClosure(t, id, stop);
  const s = compareDoc(t + id, orc, ours); T += s.judged; M += s.matched;
});
aggregates();
console.log('§MODEL-ORACLE-SUMMARY docs=' + nDocs + ' tablesJudged=' + T + ' tablesMatched=' + M + (T ? '' : ' INCONCLUSIVE'));
