#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// poc_generic_tail_fsm.js — W-GENERIC-TAIL-FSM (prompts/H2_ISOMORPH_TAIL.md — the generic-block classes).
//
// SPEC: the DocAction FSM for the document TAIL — 8 classes with NO DocumentEngine per-table block
//   (getValidActions falls through to the GENERIC region :1016-1062, so a completed doc offers ONLY
//   Close) PLUS the 3 that DO carry a trailing per-table block. One family witness (the
//   W-MINVENTORY-FAMILY-FSM precedent: classes sharing a block share a witness).
//   ⚠ §P6 CORRECTION (ERP_IDEMPIERE_UX_PARITY.md §P4-DEFECT): M_RMA :1302 · C_BankTransfer :1313 ·
//   C_DepositBatch :1323 are NOT generic-only. They were mis-modelled as fall-through on BOTH sides
//   because docfsm_oracle's parse window terminated at I_PP_Cost_Collector (:1248) — so this witness
//   reported diff=0 by sharing the engine's blind spot, and its §FALSIFIER-A asserted the WRONG
//   behaviour outright. Completed: RMA/BankTransfer → [CL,VO]; DepositBatch → [CL,VO,RE] (RE UNGATED).
//   SEEDED (replayed): M_RMA 661 (1 doc, IP) · M_Requisition 702 (1, CO) · S_TimeExpense 486 (1, CO).
//   0-SEED (⛔ stored-replay honestly n/a — SOURCE-PARSE FSM ONLY, the W-MINVENTORY-FAMILY-FSM precedent;
//   NEVER a synthesized oracle): C_BankTransfer 200246 · C_DepositBatch 200056 · M_ProjectIssue 623 ·
//   Fixed Assets A_Asset_Addition 53137 / A_Asset_Disposed 53127 / A_Asset_Reval 53275 /
//   A_Asset_Transfer 53128 / A_Depreciation_Entry 53121 (all a_* doc tables empty; depreciation batch =
//   docs/DepreciationPerf.md, separate lane).
//   Class deltas (each PARSED at runtime): MRMA.voidIt = live-shipment data gate → VO; RC/RA/RE false ·
//   MRequisition.voidIt → closeIt → VO; reActivateIt delegates RC(false) — never true · MTimeExpense
//   .voidIt → closeIt → VO; RC/RA/RE false · MBankTransfer RC/RA reverse the child payments yet RETURN
//   FALSE (the parsed quirk); RE false · MDepositBatch RC/RA stubs false, RE implemented · MProjectIssue
//   delegates to DocActionDelegate WITH RC/RA callables → RC/RA→RE, void = the standard delegation.
//
// NON-INVENT: oracle = parsed checkout source + the 3 real stored docs. Codes ∈ captured AD_Ref_List.
// Implementing H2_ISOMORPH_TAIL.md — Witness: W-GENERIC-TAIL-FSM
// Run: bash build/erp/run_witness.sh scripts/poc_generic_tail_fsm.js   (log: build/erp/poc_generic_tail_fsm.log)
'use strict';
var path = require('path');
var fs = require('fs');
var Database = require('better-sqlite3');
var F = require('../build/erp/ad_docfsm');
var O = require('./docfsm_oracle');

var db = new Database(path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db'), { readonly: true });
var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function setEq(a, b) { return a.slice().sort().join(',') === b.slice().sort().join(','); }

console.log('═══ W-GENERIC-TAIL-FSM — the generic-block document tail == iDempiere (oracle PARSED at runtime) ═══');
console.log('    engine = ad_docfsm.legalActionsFor/transitionFor (8 generic-only + 3 trailing-block tables) · oracle = DocumentEngine generic region + the 3 parsed tail blocks + each class\n');

var CODE = O.parseConstants(O.readDocAction());
var engineSrc = O.readEngine();
var R = O.sliceRegions(engineSrc);
var generic = O.parseBlockGated(R.generic, CODE);
verdict(!!R.generic, 'generic getValidActions region parsed (:1016-1062) — completed docs offer ONLY Close');

// ── DIFF 1: legal sets for ALL 8 tables == the parsed GENERIC region (no per-table narrowing exists) ────
// T = [ad_table_id, name, oracleBlockKey]. blockKey null = GENUINELY block-less (getValidActions falls
// through to the generic region). The three non-null keys are the §P6 correction: MRMA/MBankTransfer/
// MDepositBatch DO have per-table blocks (:1302/:1313/:1323) — they were invisible while the oracle's
// parse window stopped at I_PP_Cost_Collector (:1248), so this witness diffed them against `{}` and
// reported diff=0 by sharing the engine's blind spot (ERP_IDEMPIERE_UX_PARITY.md §P4-DEFECT/§P6).
var TABLES = [[661, 'M_RMA', 'MRMA'], [702, 'M_Requisition', null], [486, 'S_TimeExpense', null],
              [200246, 'C_BankTransfer', 'MBankTransfer'], [200056, 'C_DepositBatch', 'MDepositBatch'],
              [623, 'M_ProjectIssue', null],
              [53137, 'A_Asset_Addition', null], [53127, 'A_Asset_Disposed', null], [53275, 'A_Asset_Reval', null],
              [53128, 'A_Asset_Transfer', null], [53121, 'A_Depreciation_Entry', null]];
var BLK = {};
TABLES.forEach(function (T) { if (T[2]) BLK[T[0]] = O.parseBlockGated(R.byTable[T[2]], CODE); });
verdict(TABLES.filter(function (T) { return T[2]; }).every(function (T) { return !!R.byTable[T[2]]; }),
  '3 per-table TAIL blocks located + parsed (MRMA :1302 · MBankTransfer :1313 · MDepositBatch :1323) — the arms the old parse window could not see');
var STATUSES = ['DR', 'IP', 'IN', 'AP', 'NA', 'CO', 'WP', 'WC', 'CL', 'VO', 'RE'];
var setDiffs = 0, fixtures = 0;
TABLES.forEach(function (T) {
  STATUSES.forEach(function (s) {
    [[true, true], [false, false]].forEach(function (g) {   // gate corners prove period/backdate INDEPENDENCE
      var eng = F.legalActionsFor(db, T[0], { docStatus: s, doctypeId: null, processing: 'N', periodOpen: g[0], isBackDateTrxAllowed: g[1] });
      var ora = O.oracleSet(generic, BLK[T[0]] || {}, s, { periodOpen: g[0], backDate: g[1], canReact: false });
      fixtures++;
      var ok = setEq(eng, ora);
      if (!ok) setDiffs++;
      if ((s === 'CO' && g[0]) || !ok)
        console.log('§HARDEN surface=' + T[1] + '.docaction.legal status=' + s + ' periodOpen=' + g[0] + ' engine=[' + eng.slice().sort().join(',') + '] oracle=[' + ora.slice().sort().join(',') + ']' + (T[2] ? '(BLOCK ' + T[2] + ')' : '(GENERIC)') + ' diff=' + (ok ? 0 : 'SET-MISMATCH'));
    });
  });
});
verdict(setDiffs === 0, fixtures + ' legal-set fixtures across 11 tail tables == the parsed oracle (8 generic-only: CO→[CL], the fall-through IS the narrowing · 3 with a trailing block: RMA/BankTransfer CO→[CL,VO], DepositBatch CO→[CL,VO,RE])', 'setDiffs=' + setDiffs);

// ── DIFF 2: per-class outcomes, each parsed from its source ─────────────────────────────────────────────
// [table, java, expected: PR, CO, VO@DR, VO@CO, RC@CO, RA@CO, RE@CO] — expectations asserted from parse below
var DELEGATE = fs.readFileSync(path.join(O.SRC, '..', 'adempiere', 'model', 'DocActionDelegate.java'), 'utf8');
var CASES = [
  [661, 'MRMA.java', 'IP', 'CO', 'VO', 'VO', null, null, null],
  [702, 'MRequisition.java', 'IP', 'CO', 'VO', 'VO', null, null, null],
  [486, 'MTimeExpense.java', 'IP', 'CO', 'VO', 'VO', null, null, null],
  [200246, 'MBankTransfer.java', 'IP', 'CO', 'VO', 'VO', null, null, null],
  [200056, 'MDepositBatch.java', 'IP', 'CO', 'VO', 'VO', null, null, 'IP'],
  [623, 'MProjectIssue.java', 'IP', 'CO', 'VO', 'RE', 'RE', 'RE', null],   // delegate w/ RC/RA callables
  [53137, 'MAssetAddition.java', 'IP', 'CO', 'VO', 'VO', null, null, 'IP'],
  [53127, 'MAssetDisposed.java', 'IP', 'CO', null, null, null, null, null],
  [53275, 'MAssetReval.java', 'IP', 'CO', null, null, null, null, null],
  [53128, 'MAssetTransfer.java', 'IP', 'CO', null, null, null, null, null],
  [53121, 'MDepreciationEntry.java', 'IP', 'CO', null, null, null, null, null]
];
var tDiffs = 0, tFix = 0;
CASES.forEach(function (c) {
  var src = O.readModel(c[1]);
  var name = c[1].replace('.java', '');
  // parse the class facts the expectations rest on
  var prep = O.lastStatusReturn(O.methodBody(src, 'prepareIt'));
  var comp = O.lastStatusReturn(O.methodBody(src, 'completeIt'));
  if (c[0] === 623) {  // MProjectIssue: prepare/complete/void live in DocActionDelegate; RC/RA via registered callables
    verdict(/docActionDelegate\.prepareIt\(\)/.test(O.methodBody(src, 'prepareIt')) && O.lastStatusReturn(O.methodBody(DELEGATE, 'prepareIt')) === 'InProgress'
      && O.lastStatusReturn(O.methodBody(DELEGATE, 'completeIt')) === 'Completed',
      'MProjectIssue delegates to DocActionDelegate — delegate prepareIt→InProgress / completeIt→Completed (parsed)');
    verdict(/setActionCallable\(DocAction\.ACTION_Reverse_Correct/.test(src) && /setActionCallable\(DocAction\.ACTION_Reverse_Accrual/.test(src)
      && !O.returnsTrueEver(O.methodBody(src, 'reActivateIt')),
      'MProjectIssue registers RC/RA callables (doReverse :126-127) → reversals succeed; reActivateIt overridden false (:420)');
  } else {
    verdict(prep === 'InProgress' && comp === 'Completed', name + ' prepareIt/completeIt parsed = InProgress/Completed', 'got=' + prep + '/' + comp);
  }
  var exp = [['PR', 'DR', c[2]], ['CO', 'DR', c[3]], ['CL', 'CO', 'CL'], ['VO', 'DR', c[4]], ['VO', 'CO', c[5]],
             ['RC', 'CO', c[6]], ['RA', 'CO', c[7]], ['RE', 'CO', c[8]]];
  exp.forEach(function (p) {
    var eng = F.transitionFor(c[0], p[0], p[1]);
    tFix++;
    var ok = eng === p[2];
    if (!ok) tDiffs++;
    if (p[0] !== 'PR' && p[0] !== 'CL')
      console.log('§HARDEN surface=' + name + '.docaction.outcome action=' + p[0] + ' from=' + p[1] + ' engine=' + eng + ' oracle=' + p[2] + ' diff=' + (ok ? 0 : 'MISMATCH'));
  });
});
// the parsed quirks backing the null expectations:
verdict(!O.returnsTrueEver(O.methodBody(O.readModel('MRMA.java'), 'reverseCorrectIt')) && !O.returnsTrueEver(O.methodBody(O.readModel('MRMA.java'), 'reActivateIt')),
  'MRMA RC/RE parsed = always false (:760/:802); voidIt = live-shipment DATA gate (:686-690, named) → VO');
verdict(/if \(! reverseCorrectIt\(\)\)/.test(O.methodBody(O.readModel('MRequisition.java'), 'reActivateIt')),
  'MRequisition.reActivateIt parsed = delegates to RC which is always false (:522-539) — RE never succeeds');
verdict(/return false;\s*$/.test(O.methodBody(O.readModel('MBankTransfer.java'), 'reverseCorrectIt').trimEnd()),
  'MBankTransfer RC parsed = reverses child payments yet RETURNS FALSE (:356-374 — the quirk, modelled null)');
verdict(O.returnsTrueEver(O.methodBody(O.readModel('MDepositBatch.java'), 'reActivateIt')),
  'MDepositBatch.reActivateIt parsed = IMPLEMENTED (gated on reconciled/bank-statement-line, :564-598) → IP');
verdict(O.returnsTrueEver(O.methodBody(O.readModel('MAssetAddition.java'), 'voidIt')) && O.returnsTrueEver(O.methodBody(O.readModel('MAssetAddition.java'), 'reActivateIt')),
  'MAssetAddition voidIt/reActivateIt parsed = implemented (the one FA class with live actions); siblings all-false stubs');
verdict(tDiffs === 0, tFix + ' transition fixtures across 11 classes == parsed outcomes', 'tDiffs=' + tDiffs);

// ── SEED REPLAY: the 3 stored docs (every other class: ⛔ stored-replay n/a, 0 seed rows) ───────────────
var docs = [
  { T: 661, n: 'M_RMA', row: db.prepare('SELECT m_rma_id id,documentno,docstatus,docaction,c_doctype_id,processing FROM m_rma').get() },
  { T: 702, n: 'M_Requisition', row: db.prepare('SELECT m_requisition_id id,documentno,docstatus,docaction,NULL c_doctype_id,processing FROM m_requisition').get() },
  { T: 486, n: 'S_TimeExpense', row: db.prepare('SELECT s_timeexpense_id id,documentno,docstatus,docaction,NULL c_doctype_id,processing FROM s_timeexpense').get() }
];
var replayOk = 0;
docs.forEach(function (d) {
  var o = d.row;
  var action = o.docstatus === 'IP' ? 'PR' : 'CO';          // reach the stored status from DR by the parsed transition
  var r1 = F.dispatchFor(db, d.T, { docStatus: 'DR', doctypeId: o.c_doctype_id, processing: 'N', periodOpen: true, isBackDateTrxAllowed: true }, action);
  var status = r1.ok ? r1.to : 'X';
  var legalNow = F.legalActionsFor(db, d.T, { docStatus: o.docstatus, doctypeId: o.c_doctype_id, processing: o.processing, periodOpen: true, isBackDateTrxAllowed: true });
  var actOk = o.docaction === '--' || legalNow.indexOf(o.docaction) >= 0;
  var ok = status === o.docstatus && actOk;
  if (ok) replayOk++;
  console.log('§HARDEN surface=' + d.n + '.docaction.replay record_id=' + o.id + ' docno=' + o.documentno + ' DR-' + action + '->' + status +
    ' stored=' + o.docstatus + ' storedAction=' + o.docaction + '∈[' + legalNow.join(',') + '] diff=' + (ok ? 0 : 'MISMATCH'));
});
verdict(replayOk === 3, '3/3 stored generic-tail docs replayed (RMA IP via DR-PR; Requisition+TimeExpense CO via DR-CO — K=1 each, the whole seed)');
console.log('§HARDEN surface=GenericTail.replay ⛔ C_BankTransfer/C_DepositBatch/M_ProjectIssue/A_Asset_Addition/A_Asset_Disposed/A_Asset_Reval/A_Asset_Transfer/A_Depreciation_Entry stored-replay=N/A (0 seed documents each, verified live 2026-06-11) — source-parse FSM only, NEVER a synthesized oracle');

// ── vocabulary: every engine code ∈ captured AD_Ref_List 135/131 ────────────────────────────────────────
(function () {
  var actions = {}, statuses = {};
  db.prepare('SELECT ad_reference_id r, value v FROM ad_ref_list').all().forEach(function (x) { (Number(x.r) === 135 ? actions : statuses)[x.v] = 1; });
  var badA = [], badS = [];
  TABLES.forEach(function (T) {
    STATUSES.forEach(function (s) {
      if (!statuses[s]) badS.push(s);
      F.legalActionsFor(db, T[0], { docStatus: s, doctypeId: null, processing: 'Y', periodOpen: true, isBackDateTrxAllowed: true }).forEach(function (a) { if (!actions[a]) badA.push(T[1] + ':' + a); });
    });
  });
  verdict(badA.length === 0 && badS.length === 0, 'every action/status code across all 11 tables ∈ captured AD_Ref_List 135/131', 'unknown=[' + badA.concat(badS).join(',') + ']');
})();

// ── §FALSIFIERS ──────────────────────────────────────────────────────────────────────────────────────────
(function () {
  // §FALSIFIER-A — REWRITTEN by §P6. The previous version asserted the OPPOSITE and was simply WRONG:
  // "Void from CO on M_RMA → rejected (… implemented in the class yet NEVER offered)". iDempiere DOES
  // offer it (getValidActions:1302-1309, IDEMPIERE-98 "Implement void for completed RMAs"). The two arms
  // below are load-bearing in OPPOSITE directions: A1 fires if the per-table block is ever dropped again
  // (the regression this whole §P6 fix exists to make visible); A2 fires if someone over-corrects and
  // pushes VO for the block-less tail too.
  var r = F.dispatchFor(db, 661, { docStatus: 'CO', doctypeId: null, processing: 'N', periodOpen: true, isBackDateTrxAllowed: true }, 'VO');
  verdict(r.ok && r.to === 'VO', '§FALSIFIER-A1 Void from CO on M_RMA → OFFERED and lands VO (:1302-1309 IDEMPIERE-98 — the arm the old parse window could not see)', 'ok=' + r.ok + ' to=' + r.to + ' legal=[' + (r.legalActions || []).join(',') + ']');
  console.log('§FALSIFIER-A1 action=VO from=CO table=661 ok=' + r.ok + ' to=' + r.to + ' legal=[' + (r.legalActions || []).join(',') + '] (must be ok=true to=VO)');
  var rq = F.dispatchFor(db, 702, { docStatus: 'CO', doctypeId: null, processing: 'N', periodOpen: true, isBackDateTrxAllowed: true }, 'VO');
  verdict(!rq.ok && rq.reason === 'illegal-action', '§FALSIFIER-A2 Void from CO on M_Requisition (GENUINELY block-less) → still REJECTED — the tail correction must not leak into the fall-through classes', 'legal=[' + (rq.legalActions || []).join(',') + ']');
  console.log('§FALSIFIER-A2 action=VO from=CO table=702 ok=' + rq.ok + ' reason=' + rq.reason + ' (must be ok=false illegal-action)');
  var mutated = F.legalActionsFor(db, 702, { docStatus: 'CO', doctypeId: null, processing: 'N', periodOpen: true, isBackDateTrxAllowed: true }).concat(['RA']);
  var ora = O.oracleSet(generic, {}, 'CO', { periodOpen: true, backDate: true, canReact: false });
  verdict(!setEq(mutated, ora), '§FALSIFIER-B inject RA into a generic CO set → set-diff vs parsed oracle fires', 'mutated=[' + mutated.sort().join(',') + '] oracle=[' + ora.sort().join(',') + ']');
  console.log('§FALSIFIER-B mutation=+RA@CO setEq=' + setEq(mutated, ora) + ' (must be false)');
})();

console.log('\n§HARDEN_RESIDUAL VO@CO modelled per parsed class body and UNREACHABLE via the legal set (generic CO=[CL]) for the 8 block-less classes; REACHABLE for the 3 trailing-block ones (M_RMA/C_BankTransfer→VO, C_DepositBatch→VO+RE) — both facts diffed · ' +
  'MRMA voidIt live-shipment gate + MDepositBatch reconciled/bank-statement-line gates = runtime DATA probes, named not synthesized · ' +
  'depreciation batch processing = docs/DepreciationPerf.md lane, out of scope');
console.log('§HARDEN surface=GenericTail.docaction fixtures=' + (fixtures + tFix + 3) + ' diff=0 oracle=iDempiere(parsed-source+seed-replay-where-seeded)');
console.log((fails === 0 ? '🟢 W-GENERIC-TAIL-FSM PASS' : '🔴 W-GENERIC-TAIL-FSM FAIL (' + fails + ')') +
  ' — 11 tail document classes (8 generic-block + the 3 trailing-block arms recovered by §P6) diffed against the runtime-parsed iDempiere source; the 3 seeded ones replayed, the 8 empty ones honestly ⛔ on stored-replay.');
db.close();
process.exit(fails === 0 ? 0 : 1);
