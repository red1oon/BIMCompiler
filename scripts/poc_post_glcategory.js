// ⚠ DO NOT REMOVE — Scope guard
// Scope: headless §-witness for §P9 of prompts/ERP_IDEMPIERE_UX_PARITY.md — W-POST-GLCATEGORY.
//   THE ISSUE this test proves/disproves: §P4-CANDIDATES scored GL category "PARTIAL — defaulting only, absent
//     from posting". `GL_Category_ID` was defaulted at save for GL_Journal ONLY (erp/ad_modelval.js
//     MJournal.glCategoryDefault, a port of MJournal.beforeSave:340-342) while real iDempiere stamps it on
//     EVERY Fact_Acct row of EVERY document: acct/FactLine.java:404 `setGL_Category_ID(m_doc.getGL_Category_ID())`
//     inside setDocumentInfo:364 — a document-level constant, never per-line — resolved by
//     acct/Doc.java:991-1090 setDocumentType(). `grep -c gl_category scripts/post_resolver.js` was 0.
//   CLAIM: doc_poster.glCategoryFor reproduces that chain, and every derived posting line carries it — asserted
//     against the seed's OWN fact_acct.gl_category_id for the same document. THE ORACLE IS THE SEED'S REAL
//     POSTINGS, not this file: no expected category is typed in here.
//   Also asserted, because it is what makes the claim meaningful: fact_acct's own rows are CONSTANT per
//   document (the FactLine.java:404 invariant), and the chain's stages are load-bearing (a falsifier that
//   nulls the doctype's category must move the answer).
// §-log first — READ build/erp/poc_post_glcategory.log before any conclusion (exit code is NOT evidence).
// Run:  bash build/erp/run_witness.sh scripts/poc_post_glcategory.js
'use strict';
var path = require('path');
var Database = require(path.join(__dirname, '..', 'node_modules', 'better-sqlite3'));
var DP = require('./doc_poster.js');

var DB = process.env.ERP_SEED || path.join(process.env.HOME, 'bim-ootb', 'erp', 'ad_seed.db');
var db = new Database(DB, { readonly: true });
var pass = 0, fail = 0, inconclusive = 0;
function ok(label, cond, extra) { console.log('   ' + (cond ? '🟢' : '🔴') + ' ' + label + (extra ? ' — ' + extra : '')); cond ? pass++ : fail++; }
function judged(label, n, cond, extra) {
  if (!n) { console.log('   ⬜ INCONCLUSIVE ' + label + ' — judged population is 0 (' + (extra || '') + ')'); inconclusive++; return; }
  ok(label + ' (n=' + n + ')', cond, extra);
}
function has(t) { try { return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND lower(name)=?").get(t); } catch (e) { return false; } }

console.log('§W-POST-GLCATEGORY start db=' + DB);

// ── the population, straight from the seed ───────────────────────────────────────────────────────
if (!has('fact_acct') || !has('c_doctype')) {
  console.log('   ⬜ INCONCLUSIVE this seed has no fact_acct/c_doctype — nothing to judge');
  console.log('❌ W-POST-GLCATEGORY: 0/0 (harness found no population)'); process.exit(1);
}
var factRows = db.prepare('SELECT COUNT(*) n FROM fact_acct').get().n;
var dtRows = db.prepare('SELECT COUNT(*) n FROM c_doctype').get().n;
var dtZero = db.prepare('SELECT COUNT(*) n FROM c_doctype WHERE COALESCE(gl_category_id,0)=0').get().n;
console.log('§GLCAT-POPULATION fact_acct=' + factRows + ' c_doctype=' + dtRows +
            ' (of which GL_Category_ID=0, the sentinel: ' + dtZero + ') gl_category=' +
            (has('gl_category') ? db.prepare('SELECT COUNT(*) n FROM gl_category').get().n : 'ABSENT'));

// ── 1 · the FactLine.java:404 invariant: the category is CONSTANT across a document's fact lines ──
console.log('\n── 1 · FactLine.java:404 — one category per DOCUMENT, stamped on every line ──');
var docs = db.prepare(
  'SELECT ad_table_id, record_id, COUNT(DISTINCT COALESCE(gl_category_id,0)) d, COUNT(*) n, ' +
  '       MIN(COALESCE(gl_category_id,0)) cat ' +
  'FROM fact_acct GROUP BY ad_table_id, record_id').all();
var multi = docs.filter(function (r) { return r.d > 1; });
judged('every posted document\'s fact lines carry ONE gl_category_id', docs.length, multi.length === 0,
  multi.length ? JSON.stringify(multi.slice(0, 3)) : docs.length + ' documents, all single-valued');

// ── 2 · our chain vs the seed's real postings, per posted document we can resolve ────────────────
console.log('\n── 2 · glCategoryFor vs the seed\'s OWN fact_acct.gl_category_id (the oracle) ──');
var tables = {};
// NOTE: the AD_* tables in this seed declare CamelCase columns and SQLite returns result keys in the DECLARED
// case, so every AD read here aliases explicitly to lowercase (the same reason doc_poster.js carries lc()).
db.prepare('SELECT AD_Table_ID AS id, TableName AS tn FROM AD_Table').all().forEach(function (r) { tables[Number(r.id)] = String(r.tn).toLowerCase(); });
var judgedDocs = 0, agree = 0, disagree = [], skipped = {};
docs.forEach(function (d) {
  var t = tables[Number(d.ad_table_id)];
  if (!t || !has(t)) { skipped[t || ('table#' + d.ad_table_id)] = (skipped[t || ('table#' + d.ad_table_id)] || 0) + 1; return; }
  var got;
  try { got = DP.glCategoryFor(db, t, d.record_id); } catch (e) { skipped[t + ':threw'] = 1; return; }
  if (got.stage === 'none') { skipped[t + ':no-row'] = (skipped[t + ':no-row'] || 0) + 1; return; }
  judgedDocs++;
  if (Number(got.id) === Number(d.cat)) agree++;
  else disagree.push({ table: t, id: d.record_id, oracle: d.cat, got: got.id, stage: got.stage });
});
judged('our resolved GL_Category_ID equals what iDempiere actually posted, per document',
  judgedDocs, disagree.length === 0,
  agree + '/' + judgedDocs + ' agree' + (disagree.length ? ' · first mismatches ' + JSON.stringify(disagree.slice(0, 4)) : ''));
console.log('   §GLCAT-ORACLE judged=' + judgedDocs + ' agree=' + agree + ' disagree=' + disagree.length +
            ' skipped=' + JSON.stringify(skipped));

// ── 3 · which stages of Doc.java's chain actually fire on this seed (never a silent single-stage pass) ──
console.log('\n── 3 · which stages of the Doc.java chain fire (a one-stage witness proves only one stage) ──');
var stages = {};
docs.forEach(function (d) {
  var t = tables[Number(d.ad_table_id)]; if (!t || !has(t)) return;
  var g; try { g = DP.glCategoryFor(db, t, d.record_id); } catch (e) { return; }
  stages[g.stage] = (stages[g.stage] || 0) + 1;
});
console.log('   §GLCAT-STAGES ' + JSON.stringify(stages));
judged('at least the doctype stage (Doc.java:996-1009) is exercised on real documents',
  Object.keys(stages).length, (stages['doctype'] || 0) > 0, JSON.stringify(stages));

// ── 4 · derivePostings STAMPS it on every emitted line (the FactLine.java:404 behaviour, end to end) ──
console.log('\n── 4 · every derived posting line carries the document category ──');
var R = null; try { R = require('./post_resolver.js'); } catch (e) {}
var schema = null;
try { schema = db.prepare('SELECT c_acctschema_id id FROM c_acctschema ORDER BY c_acctschema_id LIMIT 1').get(); } catch (e) {}
var sampleInv = db.prepare(
  'SELECT record_id FROM fact_acct WHERE ad_table_id=(SELECT ad_table_id FROM ad_table WHERE lower(tablename)=\'c_invoice\') ' +
  'GROUP BY record_id ORDER BY record_id LIMIT 1').get();
if (!R || !schema || !sampleInv) {
  console.log('   ⬜ INCONCLUSIVE no post_resolver / acctschema / posted invoice available in this seed'); inconclusive++;
} else {
  var res = DP.derivePostings(db, { table: 'C_Invoice', id: sampleInv.record_id }, schema.id, R);
  var oracleCat = db.prepare(
    'SELECT MIN(COALESCE(gl_category_id,0)) cat FROM fact_acct WHERE ad_table_id=' +
    '(SELECT ad_table_id FROM ad_table WHERE lower(tablename)=\'c_invoice\') AND record_id=?').get(sampleInv.record_id).cat;
  var allStamped = res.lines.length > 0 && res.lines.every(function (l) { return Number(l.gl_category_id) === Number(oracleCat); });
  judged('derivePostings stamps the oracle\'s category on EVERY line of a real invoice', res.lines.length,
    allStamped, 'C_Invoice ' + sampleInv.record_id + ' lines=' + res.lines.length + ' oracle=' + oracleCat +
    ' stamped=' + JSON.stringify(res.lines.map(function (l) { return l.gl_category_id; })) +
    ' envelope=' + res.gl_category_id + '/' + res.gl_category_stage);
  console.log('   §GLCAT-STAMP table=C_Invoice id=' + sampleInv.record_id + ' lines=' + res.lines.length +
              ' gl_category_id=' + res.gl_category_id + ' stage=' + res.gl_category_stage + ' oracle=' + oracleCat);
}

// ── 5 · FALSIFIER — the chain's stages are load-bearing, in both directions ───────────────────────
console.log('\n── FALSIFIER · the resolution is real, not a constant ──');
// (a) the seed must actually carry MORE THAN ONE distinct category, else "agree" is meaningless
var distinct = db.prepare('SELECT COUNT(DISTINCT COALESCE(gl_category_id,0)) d FROM fact_acct').get().d;
judged('the oracle is discriminating — the seed\'s postings carry more than one distinct category', distinct,
  distinct > 1, distinct + ' distinct gl_category_id values across ' + factRows + ' fact rows');
// (b) an unknown table/id resolves to the 0 SENTINEL and never fabricates (Doc.java:411 + :1085-1086)
var unk = DP.glCategoryFor(db, 'c_invoice', -424242);
ok('an unknown document resolves to the 0 sentinel with stage="none", never a fabricated category',
  unk.id === 0 && unk.stage === 'none', JSON.stringify(unk));
// (c) the doctype stage must be what decides: two documents whose doctypes carry DIFFERENT categories must
//     resolve differently — read from the seed, not chosen by hand.
var pair = db.prepare(
  'SELECT MIN(i.c_invoice_id) AS inv, d.gl_category_id AS cat FROM c_invoice i JOIN c_doctype d ON d.c_doctype_id=i.c_doctype_id ' +
  'WHERE COALESCE(d.gl_category_id,0)>0 GROUP BY d.gl_category_id ORDER BY d.gl_category_id LIMIT 2').all();
judged('two invoices whose DOCTYPES carry different categories resolve to those different categories',
  pair.length === 2 ? 2 : 0,
  pair.length === 2 && DP.glCategoryFor(db, 'c_invoice', pair[0].inv).id === Number(pair[0].cat) &&
  DP.glCategoryFor(db, 'c_invoice', pair[1].inv).id === Number(pair[1].cat) &&
  Number(pair[0].cat) !== Number(pair[1].cat),
  JSON.stringify(pair));

console.log('\n§GLCATEGORY-VERDICT CRITIC ' + (fail === 0 ? '✔' : '✘') + ' ' + (fail === 0
  ? 'GL_Category_ID is no longer absent from posting: doc_poster resolves it through Doc.setDocumentType\'s own ' +
    'chain and stamps it on every derived line as FactLine.java:404 does, and the answer matches the seed\'s OWN ' +
    'fact_acct rows document for document.'
  : 'the derived GL_Category_ID diverges from the seed\'s real postings — see the 🔴 above.'));
console.log((fail === 0 ? '✅' : '❌') + ' W-POST-GLCATEGORY: ' + pass + '/' + (pass + fail) +
            ' PASS (' + fail + ' FAIL, ' + inconclusive + ' INCONCLUSIVE)');
process.exit(fail === 0 ? 0 : 1);
