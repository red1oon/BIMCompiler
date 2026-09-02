#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// docfsm_oracle.js — SHARED runtime source-parse helpers for the H-2 per-table FSM witnesses
// (prompts/FABLE5_H2_DELTAS.md). Generalizes poc_morder_fsm.js's parseBlock: the SAME line-walking
// architecture, extended with GATE tracking so the per-table Completed blocks parse faithfully —
// actions nested under if (periodOpen) / if (isBackDateTrxAllowed) / if (canReactivateThisDocType(..))
// carry gate tags ('periodOpen' / 'backDate' / 'canReact'); both BRACED gate blocks (frame until the
// matching close brace) and BRACELESS ifs (gate applies to the next statement only) occur in
// DocumentEngine.getValidActions:1016-1332 and are handled.
//
// NON-INVENT: every function PARSES the checkout at runtime (never a hand-transcribed table), so a
// witness diff against the engine cannot be a tautology of the engine's own tables. Shared the way
// post_resolver.js is shared — one parser, four consumers, zero copy-drift.
'use strict';
var fs = require('fs');
var path = require('path');
var os = require('os');

var SRC = path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere', 'org.adempiere.base', 'src', 'org', 'compiere');

function readEngine() { return fs.readFileSync(path.join(SRC, 'process', 'DocumentEngine.java'), 'utf8'); }
function readDocAction() { return fs.readFileSync(path.join(SRC, 'process', 'DocAction.java'), 'utf8'); }
function readModel(javaFile) { return fs.readFileSync(path.join(SRC, 'model', javaFile), 'utf8'); }

// the STATUS_*/ACTION_* constant→code map from DocAction.java (H-1 ORACLE 1, unchanged)
function parseConstants(docActionSrc) {
  var CODE = {};
  docActionSrc.replace(/public static final String (STATUS_\w+|ACTION_\w+)\s*=\s*"([^"]+)"/g,
    function (_, name, code) { CODE[name] = code; return _; });
  return CODE;
}

// slice getValidActions into the generic block + every per-table block, by the table-ID markers IN ORDER.
// Returns { generic, byTable: { MOrder, MInOut, MInvoice, MPayment, MJournal, MAllocationHdr, MCash,
// MBankStatement, MMovement, PP_Order, MProduction, PP_CostCollector, DD_Order, HR_Process, MRMA,
// MBankTransfer, MDepositBatch } } — each value is the raw source slice. ALL 18 table arms of the method
// are covered; the window ends at the DocOptions hook (:1333), NOT at a hard-coded line number.
function sliceRegions(engineSrc) {
  var MARKERS = [
    ['MOrder', 'if (AD_Table_ID == MOrder.Table_ID)'],
    ['MInOut', 'else if (AD_Table_ID == MInOut.Table_ID)'],
    ['MInvoice', 'else if (AD_Table_ID == MInvoice.Table_ID)'],
    ['MPayment', 'else if (AD_Table_ID == MPayment.Table_ID)'],
    ['MJournal', 'else if (AD_Table_ID == MJournal.Table_ID'],
    ['MAllocationHdr', 'else if (AD_Table_ID == MAllocationHdr.Table_ID)'],
    ['MCash', 'else if (AD_Table_ID == MCash.Table_ID)'],
    ['MBankStatement', 'else if (AD_Table_ID == MBankStatement.Table_ID)'],
    ['MMovement', 'else if (AD_Table_ID == MMovement.Table_ID'],          // …|| MInventory (shared block)
    ['PP_Order', 'else if (AD_Table_ID == I_PP_Order.Table_ID)'],
    ['MProduction', 'else if (AD_Table_ID == MProduction.Table_ID)'],
    // ── the TAIL blocks (ERP_IDEMPIERE_UX_PARITY.md §P6.1). These six arms used to sit OUTSIDE the parse
    // window — '_end' terminated at I_PP_Cost_Collector (:1248), so the oracle could not see them and
    // reported "generic fall-through" for MRMA/MBankTransfer/MDepositBatch, sharing the engine's own blind
    // spot (a witness that cannot report its own failure — CLAUDE.md PRIMAL LAW §4). Boundary EXTRACTED,
    // not guessed: getValidActions carries 18 'AD_Table_ID ==' arms, and the per-table if/else chain ends
    // at the DocOptions customization hook (:1333). Slices before this point are byte-identical.
    ['PP_CostCollector', 'else if (AD_Table_ID == I_PP_Cost_Collector.Table_ID)'],  // :1248
    ['DD_Order', 'else if (AD_Table_ID == I_DD_Order.Table_ID)'],                   // :1266
    ['HR_Process', 'else if (AD_Table_ID == I_HR_Process.Table_ID)'],               // :1284
    ['MRMA', 'else if (AD_Table_ID == MRMA.Table_ID)'],                             // :1302 IDEMPIERE-98
    ['MBankTransfer', 'else if (AD_Table_ID == MBankTransfer.Table_ID)'],           // :1313
    ['MDepositBatch', 'else if (AD_Table_ID == MDepositBatch.Table_ID)'],           // :1323
    ['_end', 'if (po instanceof DocOptions)']                                       // :1333 end of the chain
  ];
  var gvaStart = engineSrc.indexOf('int index = 0;');
  if (gvaStart < 0) throw new Error('getValidActions start marker not found');
  var idx = [], pos = gvaStart;
  MARKERS.forEach(function (m) {
    var i = engineSrc.indexOf(m[1], pos);
    if (i < 0) throw new Error('marker not found: ' + m[1]);
    idx.push([m[0], i]);
    pos = i;
  });
  var out = { generic: engineSrc.slice(gvaStart, idx[0][1]), byTable: {} };
  for (var k = 0; k < idx.length - 1; k++) out.byTable[idx[k][0]] = engineSrc.slice(idx[k][1], idx[k + 1][1]);
  return out;
}

// gate-aware line walker. Returns sets: { status: [ {a: 'RC', g: ['periodOpen','backDate']} ... ] }.
// A condition carrying STATUS_ tokens opens a status branch; a condition carrying gate keywords opens
// either a braced gate frame (lives until its close brace) or a braceless single-statement gate.
function parseBlockGated(text, CODE) {
  var sets = {}, cur = [], frames = [], pending = null, cond = null, depth = 0;
  text.split('\n').forEach(function (line) {
    if (!cond && /\bif\s*\(/.test(line)) cond = { depth: 0, statuses: [], gates: [] };
    var opens = (line.match(/\{/g) || []).length, closes = (line.match(/\}/g) || []).length;
    if (cond) {
      line.replace(/STATUS_(\w+)/g, function (_, n) { cond.statuses.push(CODE['STATUS_' + n]); return _; });
      if (/periodOpen/.test(line)) cond.gates.push('periodOpen');
      if (/isBackDateTrxAllowed/.test(line)) cond.gates.push('backDate');
      if (/canReactivateThisDocType/.test(line)) cond.gates.push('canReact');
      cond.depth += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      if (cond.depth <= 0) {                       // condition closed on this line
        var tail = line.slice(line.lastIndexOf(')') + 1);
        if (cond.statuses.length) {                // a STATUS branch: reset cursor (+ any stale frames)
          cur = cond.statuses;
          cur.forEach(function (s) { sets[s] = sets[s] || []; });
          frames = []; pending = null;
        } else if (cond.gates.length) {            // a GATE: braced → frame; braceless → next statement
          if (tail.indexOf('{') >= 0) frames.push({ gates: cond.gates, depthAfterOpen: depth + opens - closes });
          else pending = cond.gates;
        }
        cond = null;
      }
      depth += opens - closes;
      return;
    }
    var m = line.match(/options\[index\+\+\]\s*=\s*DocumentEngine\.ACTION_(\w+)/);
    if (m && cur.length) {
      var gates = [];
      frames.forEach(function (f) { f.gates.forEach(function (g) { if (gates.indexOf(g) < 0) gates.push(g); }); });
      (pending || []).forEach(function (g) { if (gates.indexOf(g) < 0) gates.push(g); });
      var code = CODE['ACTION_' + m[1]];
      cur.forEach(function (s) { sets[s].push({ a: code, g: gates.slice() }); });
    }
    if (pending && /;/.test(line)) pending = null; // a braceless if scopes exactly one statement
    depth += opens - closes;
    while (frames.length && depth < frames[frames.length - 1].depthAfterOpen) frames.pop();
  });
  return sets;
}

// merge generic + per-table sets, then resolve gates against the caller context
// ctx = { periodOpen: bool, backDate: bool, canReact: bool } → the legal action-code list.
function oracleSet(generic, tableBlk, status, ctx) {
  var all = (generic[status] || []).concat(tableBlk[status] || []);
  return all.filter(function (e) {
    return e.g.every(function (g) {
      if (g === 'periodOpen') return !!ctx.periodOpen;
      if (g === 'backDate') return !!ctx.backDate;
      if (g === 'canReact') return !!ctx.canReact;
      return false;                                 // unknown gate never passes silently
    });
  }).map(function (e) { return e.a; });
}

// DocumentEngine action-method outcomes: isValidAction(ACTION_X) … m_status = STATUS_Y (H-1 ORACLE 3, unchanged)
function parseOutcomes(engineSrc, CODE) {
  var methodRe = /public boolean\s+(\w+It)\s*\(\)[\s\S]*?(?=\n\tpublic |\n\t\/\*\*)/g;
  var out = {}, mm;
  while ((mm = methodRe.exec(engineSrc)) !== null) {
    var body = mm[0];
    var act = body.match(/isValidAction\(ACTION_(\w+)\)/);
    var sts = null, sm, stRe = /m_status = STATUS_(\w+)/g;
    while ((sm = stRe.exec(body)) !== null) sts = sm[1];
    if (act && sts) out[CODE['ACTION_' + act[1]]] = CODE['STATUS_' + sts];
  }
  return out;
}

// a model class's method body (H-1 convention: slice to the closing tab-brace)
function methodBody(src, name) {
  var i = src.search(new RegExp('public (String|boolean) ' + name + '\\s*\\(\\)'));
  if (i < 0) return '';
  return src.slice(i, src.indexOf('\n\t}', i));
}
// the LAST `return DocAction.STATUS_X;` = the success path (H-1 convention)
function lastStatusReturn(body) {
  var out = null, m, re = /return DocAction\.STATUS_(\w+);/g;
  while ((m = re.exec(body)) !== null) out = m[1];
  return out;
}
// reActivateIt implemented? (a body that can `return true` vs the always-false stub)
function returnsTrueEver(body) { return /return true;/.test(body); }
// voidIt's processed-document branch: period-closed/backdate-blocked → reverseAccrualIt else reverseCorrectIt
function voidDelegates(body) {
  return /if \(accrual\)/.test(body) && /return reverseAccrualIt\(\);/.test(body) && /return reverseCorrectIt\(\);/.test(body);
}
// DocumentEngine.voidIt preserves the document's own Reversed status (:616-618)
function voidPreservesReversed(engineSrc) {
  return /m_status = STATUS_Voided;\s*\n\s*if \(!m_document\.getDocStatus\(\)\.equals\(STATUS_Reversed\)\)/.test(engineSrc);
}

module.exports = {
  SRC: SRC, readEngine: readEngine, readDocAction: readDocAction, readModel: readModel,
  parseConstants: parseConstants, sliceRegions: sliceRegions, parseBlockGated: parseBlockGated,
  oracleSet: oracleSet, parseOutcomes: parseOutcomes, methodBody: methodBody,
  lastStatusReturn: lastStatusReturn, returnsTrueEver: returnsTrueEver,
  voidDelegates: voidDelegates, voidPreservesReversed: voidPreservesReversed
};
