// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_compare_pos.js <ref_diff.json> <ours.json> <out.json> — table + column side-by-side: what REAL iDempiere changed vs what
// OUR signed op-group changed. Verdicts: MATCH / MISSING-IN-OURS / EXTRA-IN-OURS / VALUE-DIFF. Every MISSING maps to owning Java (data/pos_owner_map.json).
'use strict';
const fs = require('fs'), path = require('path');
const [refF, oursF, outF] = process.argv.slice(2);
const ref = JSON.parse(fs.readFileSync(refF, 'utf8')), ours = JSON.parse(fs.readFileSync(oursF, 'utf8'));
const own = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pos_owner_map.json'), 'utf8'));
const NEWID = {}; // fold ours: (table,id) → fields
const created = {}, upd = {};   // table → [{id, fields}] ; table → Set(cols)
const keyOf = new Map();
for (const o of ours.ops) {
  const p = typeof o.parameters === 'string' ? JSON.parse(o.parameters) : o.parameters; const t = String(p.table || p.key || '').toLowerCase();
  if (o.op_type === 'CRUD_CREATE') { const row = { _op: o.id }; for (const kk in p.fields) row[kk.toLowerCase()] = p.fields[kk]; (created[t] = created[t] || []).push(row); }
  else if (o.op_type === 'CRUD_UPDATE' || o.op_type === 'SET_STATUS' || o.op_type === 'DOC_ACTION') {
    (upd[t] = upd[t] || new Set());
    if (o.op_type === 'CRUD_UPDATE') Object.keys(p.changes || {}).forEach(c => upd[t].add(c)); else { upd[t].add('docstatus'); }
  }
}
// apply updates to created rows where the id maps (negative synthetic ids = -<op id>) so final state is compared
for (const o of ours.ops) {
  const p = typeof o.parameters === 'string' ? JSON.parse(o.parameters) : o.parameters; const t = String(p.table || p.key || '').toLowerCase();
  if (!['CRUD_UPDATE', 'SET_STATUS'].includes(o.op_type)) continue;
  // a composite-key row (C_OrderTax, M_StorageOnHand …) is addressed by its <Table>_UU (op.idCol — PO.saveNew:3546 identity)
  const row = (created[t] || []).find(r => p.idCol ? String(r[p.idCol]) === String(p.id) : -r._op === Number(p.id)); if (!row) continue;
  if (o.op_type === 'CRUD_UPDATE') for (const c in p.changes) row[c] = p.changes[c].new; else row.docstatus = p.to;
}
const SKIPC = /(_uu$|^created|^updated|^processedon$|^isactive$|^ad_client_id$|^ad_org_id$)/;
const LINK = /^(c_order_id|c_orderline_id|m_inout_id|m_inoutline_id|c_invoice_id|c_invoiceline_id|c_payment_id|line_id|record_id|fact_acct_id|c_allocationhdr_id|c_period_id|m_costdetail_id|m_transaction_id|c_ordertax_id|c_invoicetax_id)$/;
const norm = v => v == null ? null : (typeof v === 'number' ? v : (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) ? v.slice(0, 10) : v));
const eq = (a, b) => { a = norm(a); b = norm(b); if (typeof a === 'number' || typeof b === 'number') return Math.abs(Number(a) - Number(b)) < 0.005; return String(a) === String(b); };
const empty = v => v == null || v === '' || v === 'N' || v === 0;
const out = { tables: [] }; const L = [];
const emit = (s) => { L.push(s); console.log(s); };
const oursTables = new Set([...Object.keys(created), ...Object.keys(upd)]);
for (const r of ref) {
  const t = r.table, o = own[t] || { java: 'UNMAPPED', trap: '?' };
  const oc = created[t] || [], ou = upd[t];
  const cmp = { table: t, ref: { inserted: r.inserted, updated: r.updated, cols: r.cols_changed }, ours: { inserted: oc.length, updatedCols: ou ? [...ou] : [] }, cols: [], verdict: null, owner: o };
  if (!oc.length && !(ou && ou.size)) cmp.verdict = /^(ad_session|ad_user)$/.test(t) ? 'N/A-HARNESS-ARTIFACT' : 'MISSING-IN-OURS';
  else {
    const issues = [];
    if (r.inserted !== oc.length) issues.push('rowcount ref=' + r.inserted + ' ours=' + oc.length);
    if (t === 'fact_acct') {   // multiset (ad_table_id, account_id, dr, cr)
      const k = x => [x.ad_table_id, 'schema' + x.c_acctschema_id, x.account_id, Number(x.amtacctdr || 0).toFixed(2), Number(x.amtacctcr || 0).toFixed(2)].join('/');
      const rk = r.insRows.map(k), ok = oc.map(k); const ro = [...rk], extra = [];
      for (const x of ok) { const i = ro.indexOf(x); if (i >= 0) ro.splice(i, 1); else extra.push(x); }
      cmp.cols.push({ col: '(ad_table/account/dr/cr) multiset', matched: rk.length - ro.length, missing: ro, extra });
      if (ro.length) issues.push(ro.length + ' fact lines missing'); if (extra.length) issues.push(extra.length + ' extra');
    } else if (r.insRows && r.insRows.length && oc.length) {
      const rr = r.insRows[0], orow = oc[0];
      for (const c of Object.keys(rr)) {
        if (SKIPC.test(c) || empty(rr[c])) continue;
        if (LINK.test(c)) { if (orow[c] == null && !(c.endsWith('_id'))) cmp.cols.push({ col: c, v: 'MISSING-COL(link)' }); continue; }
        if (!(c in orow) || orow[c] == null) cmp.cols.push({ col: c, ref: rr[c], v: 'MISSING-COL' });
        else if (!eq(rr[c], orow[c])) cmp.cols.push({ col: c, ref: rr[c], ours: orow[c], v: 'VALUE-DIFF' });
        else cmp.cols.push({ col: c, v: 'MATCH' });
      }
      for (const c of Object.keys(orow)) { if (c === '_op' || SKIPC.test(c) || LINK.test(c) || empty(orow[c])) continue; if (!(c in rr) || empty(rr[c])) cmp.cols.push({ col: c, ours: orow[c], v: 'EXTRA-IN-OURS' }); }
      const bad = cmp.cols.filter(c => c.v !== 'MATCH'); if (bad.length) issues.push(bad.length + ' column diffs');
    }
    cmp.verdict = issues.length ? 'PARTIAL: ' + issues.join('; ') : 'MATCH';
  }
  out.tables.push(cmp);
}
for (const t of oursTables) if (!ref.find(r => r.table === t) && created[t]) out.tables.push({ table: t, verdict: 'EXTRA-IN-OURS', ours: { inserted: created[t].length }, ref: null });
for (const c of out.tables) {
  const bad = (c.cols || []).filter(x => x.v && x.v !== 'MATCH' && !/^\(/.test(x.col));
  emit('§PILOT-POS-CMP table=' + c.table + ' verdict=' + c.verdict + ' ref=' + (c.ref ? 'ins' + c.ref.inserted + '/upd' + c.ref.updated + (c.ref.cols.length ? '[' + c.ref.cols.join(',') + ']' : '') : '-') +
    ' ours=' + (c.ours ? 'ins' + c.ours.inserted + ((c.ours.updatedCols || []).length ? '/updcols[' + c.ours.updatedCols.join(',') + ']' : '') : '-') +
    (c.owner && /MISSING|PARTIAL/.test(c.verdict) ? ' owner=' + c.owner.java + ' trap=' + c.owner.trap : ''));
  bad.forEach(x => emit('§PILOT-POS-CMP-COL table=' + c.table + ' col=' + x.col + ' ' + x.v + (x.ref !== undefined ? ' ref=' + JSON.stringify(x.ref) : '') + (x.ours !== undefined ? ' ours=' + JSON.stringify(x.ours) : '')));
  (c.cols || []).filter(x => /^\(/.test(x.col)).forEach(x => emit('§PILOT-POS-CMP-COL table=' + c.table + ' ' + x.col + ' matched=' + x.matched + ' missing=' + JSON.stringify(x.missing) + ' extra=' + JSON.stringify(x.extra)));
}
const n = v => out.tables.filter(c => String(c.verdict).startsWith(v)).length;
emit('§PILOT-POS-CMP-SUMMARY refTablesChanged=' + ref.length + ' MATCH=' + n('MATCH') + ' PARTIAL=' + n('PARTIAL') + ' MISSING=' + n('MISSING') + ' EXTRA=' + n('EXTRA') + ' NA=' + n('N/A'));
fs.writeFileSync(outF, JSON.stringify(out, null, 1));
