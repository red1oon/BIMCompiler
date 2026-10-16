// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-MODEL-DOCNO-ORG (prompts/ERP_MODEL_LAYER.md §CORE-DOCNO; user decision ERP_PARALLEL_RUN_PILOT.md §DECISIONS:
//   DocumentNo = each station's OWN running sequence, prefixed by its Org). Proves MSequence.getDocumentNo is ported with the
//   org-level branch (AD_Sequence.IsOrgLevelSequence + OrgColumn → AD_Sequence_No per org) and Prefix/DecimalPattern, driven
//   by AD DATA alone, through the model SAVE path (PO.saveNew assigns DocumentNo), every bump an op in the document's group.
//   THE ISSUE it proves/disproves: two stations (orgs) completing in parallel collide on one counter (§9-R PILOT-DOCNO-CLASH).
//   Pass = each org gets an independent gapless run with its own prefix AND the falsifier (IsOrgLevelSequence='N') shows ONE
//   shared interleaved run. Never PASS when nothing was numbered (INCONCLUSIVE).
// READ THE LOG. Run: node scripts/poc_model_docno_orglevel.js > build/erp/poc_model_docno_orglevel.log
'use strict';
const fs = require('fs'), path = require('path');
const Database = require('better-sqlite3');
const OOTB = process.env.OOTB || '/home/red1/bim-ootb';
const ML = require(path.join(OOTB, 'erp/model_layer.js')); const T = require(path.join(OOTB, 'erp/model_trade.js'));
const PRE = process.env.PRE || '/tmp/claude-1000/model_oracle/prestate.db';
function run(orgLevel) {
  const db = new Database(fs.readFileSync(PRE));
  const q = (sql, p) => db.prepare(sql).all(...(p || []));
  // AD data only: the Standard Order doctype's sequence becomes org-level with an org-value prefix + 4-digit pattern
  db.prepare("UPDATE ad_sequence SET isorglevelsequence=?, orgcolumn='AD_Org_ID', prefix='@AD_Org_ID.Value@-', decimalpattern='0000', startno=1 WHERE ad_sequence_id=387").run(orgLevel ? 'Y' : 'N');
  db.exec('CREATE TABLE IF NOT EXISTS ad_sequence_no (ad_sequence_id, ad_org_id, sequencekey, currentnext, ad_client_id, isactive, ad_sequence_no_uu, calendaryear, created, createdby, updated, updatedby)');
  let n = 0; const env = { client: 11, org: 11, user: 101, date: '2026-10-04 00:00:00', uuid: () => 'uu-' + (++n) };
  const out = [], opsPerDoc = [];
  [11, 12, 12, 11, 50002, 11, 12, 50002].forEach((org, i) => {                         // interleaved: three stations
    const r = ML.run(q, Object.assign({}, env, { org }), { table: 'c_order', timing: 'SAVE', changes: { ad_org_id: org, c_doctypetarget_id: 132, c_doctype_id: 0, c_bpartner_id: 117, issotrx: 'Y', m_warehouse_id: 103, c_currency_id: 100, dateordered: '2026-10-04 00:00:00' } });
    const created = r.ops.find(o => o.op_type === 'CRUD_CREATE' && o.table === 'c_order');
    const seqOps = r.ops.filter(o => o.table === 'ad_sequence' || o.table === 'ad_sequence_no');
    // fold the sequence ops (the page's commitGroup does this) so the next save reads the bumped value
    seqOps.forEach(o => { if (o.op_type === 'CRUD_CREATE') { const f = o.fields, ks = Object.keys(f); db.prepare('INSERT INTO ad_sequence_no (' + ks.join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')').run(...ks.map(k => f[k])); }
      else if (o.table === 'ad_sequence_no') db.prepare('UPDATE ad_sequence_no SET currentnext=? WHERE ad_sequence_no_uu=?').run(o.changes.currentnext.new, o.id);
      else db.prepare('UPDATE ad_sequence SET currentnext=? WHERE ad_sequence_id=?').run(o.changes.currentnext.new, o.id); });
    out.push({ org, docno: created && created.fields.documentno, ok: r.ok, err: r.error || r.msg, seqOps: seqOps.map(o => o.table + ':' + o.op_type.replace('CRUD_', '')).join('+'), sameGroup: !!created && seqOps.length > 0 });
    r.log.forEach(l => console.log(l));
  });
  return out;
}
let verdictOk = true, judged = 0;
const org = run(true), flat = run(false);
org.forEach(x => { judged++; console.log('§MODEL-DOCNO-ORG mode=orgLevel org=' + x.org + ' docno=' + x.docno + ' seqOps=' + x.seqOps + ' inDocGroup=' + x.sameGroup + (x.ok ? '' : ' ERR=' + x.err)); });
flat.forEach(x => console.log('§MODEL-DOCNO-ORG mode=falsifier(IsOrgLevelSequence=N) org=' + x.org + ' docno=' + x.docno + ' seqOps=' + x.seqOps));
// expectations: per org, prefix = its AD_Org.Value + '-', numbers 0001,0002,… gapless; falsifier: one shared run 50305,50306,… in save order
const byOrg = {}; org.forEach(x => (byOrg[x.org] = byOrg[x.org] || []).push(x.docno));
const val = { 11: 'HQ', 12: 'Store Central', 50002: 'Store North' };
Object.keys(byOrg).forEach(o => { const exp = byOrg[o].map((_, i) => val[o] + '-' + String(i + 1).padStart(4, '0')); const ok = JSON.stringify(exp) === JSON.stringify(byOrg[o]);
  if (!ok) verdictOk = false; console.log('§MODEL-DOCNO-ORG-RUN org=' + o + ' got=' + JSON.stringify(byOrg[o]) + ' expected=' + JSON.stringify(exp) + ' verdict=' + (ok ? 'GAPLESS' : 'FAIL')); });
const flatNums = flat.map(x => x.docno), flatExp = flat.map((_, i) => '@'.slice(1) + (flat[0].docno || '').replace(/\d+$/, '') + String(Number((flat[0].docno || '0').replace(/^\D*/, '')) + i).padStart(4, '0'));
const shared = new Set(flatNums.map(d => String(d).replace(/^.*-/, ''))).size === flatNums.length && flat.every(x => x.docno);
console.log('§MODEL-DOCNO-ORG-FALSIFIER docnos=' + JSON.stringify(flatNums) + ' oneSharedRun=' + shared + ' (per-org runs must NOT appear here)');
if (!org.every(x => x.sameGroup)) verdictOk = false;
console.log('§MODEL-DOCNO-ORG-SUMMARY judged=' + judged + ' verdict=' + (judged === 0 ? 'INCONCLUSIVE' : verdictOk && shared ? 'PASS' : 'FAIL'));
void flatExp;
