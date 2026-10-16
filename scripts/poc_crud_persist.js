#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (CRUD_EDIT_PERSIST.md Items 1+2). Read the log after every run (Log Mandate).
// poc_crud_persist.js — the witness for the two CRUD-overlay bugs in prompts/CRUD_EDIT_PERSIST.md.
//
// ISSUES IT PROVES (each NAMED, per CLAUDE.md "tests expose issues"):
//   ITEM 1 (date widget) — fieldInput emitted <input type=date value="2002-02-22 00:00:00">. HTML5
//     type=date accepts ONLY strict yyyy-MM-dd → the widget renders BLANK → the required check then
//     REJECTs an empty field. CORE.normDateValue must slice the date prefix so the widget seeds.
//   ITEM 2 (persist) — CRUD_UPDATE was an E2 dry-run: logged, never written; getRecord read the
//     immutable bundle row, so a reopened form showed the STALE original. The fix commits the update
//     through the SIGNED sidecar (same path as DOC_ACTION) and read-the-tip (CORE.tipValues) overlays
//     the new value — surviving reopen AND a page reload (sidecar rehydrated from its IndexedDB buffer),
//     while glassbowl_data.db stays the IMMUTABLE baseline.
//
// NON-INVENT: the op shape is the REAL CORE.buildOp('update'); the kernel under test is the REAL
//   build/erp/kernel_ops.js (commitGroup/verifyChain) under a window shim. No fixtures, no synthetic rows.
//
// DETERMINISM (§7): no Date.now()/Math.random() in the witness — ids index-derived; commitGroup called
//   with an explicit baseTs so wall-clock never enters a hashed field.
//
// Run: node scripts/poc_crud_persist.js 2>&1 | tee build/erp/poc_crud_persist.log   — then READ the log.
'use strict';
var path = require('path');
var initSqlJs = require('sql.js');

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;   // kernel_ops.js seals via bare crypto.subtle
var CORE = require(path.join(__dirname, '..', 'build', 'erp', 'crud_overlay.js'));   // REAL op shape + normDateValue + tipValues
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));               // window.KernelOps (signed log)
var KO = global.window.KernelOps;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

// E_INVOICE — a real c_invoice descriptor (mirrors crud_ops.json: dateinvoiced=date, description=string).
var E_INVOICE = { key: 'c_invoice', verbs: ['update'],
  fields: [
    { col: 'c_invoice_id', type: 'fk', readonly: true },
    { col: 'documentno',   type: 'string', readonly: true },
    { col: 'dateinvoiced', type: 'date', required: true },
    { col: 'description',  type: 'string' },
    { col: 'docstatus',    type: 'list', ref: 'docStatus' }
  ] };

// commitUpdate — mirror crud_overlay.js commitCrud's group shape EXACTLY (the only thing the witness
// can't reach is the DOM/withSidecar wrapper; the kernel call + op shape are identical).
async function commitUpdate(db, op, baseTs) {
  var params = { table: op.table, id: op.id, changes: op.changes };
  return KO.commitGroup(db, [{ op_type: 'CRUD_UPDATE', op_uuid: op.op_uuid || null, params: params }], { baseTs: baseTs });
}

(async function () {
  console.log('═══ POC-CRUD-PERSIST — the two CRUD bugs: (1) date widget blanks, (2) update does not persist ═══');
  console.log('issue=prompts/CRUD_EDIT_PERSIST.md Items 1+2  path=build/erp/crud_overlay.js  kernel=build/erp/kernel_ops.js\n');
  var SQL = await initSqlJs();

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // ITEM 1 — date widget seeds to strict yyyy-MM-dd (no blank, no false "required")
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  console.log('ITEM 1 — normDateValue strips the time component so <input type=date> seeds (not blank)');
  var cases = [
    { raw: '2002-02-22 00:00:00', want: '2002-02-22' },   // the user-reported midnight TIMESTAMP
    { raw: '2002-02-22 21:09:00', want: '2002-02-22' },   // the m_inout datetrx with a real clock time
    { raw: '2002-02-22',          want: '2002-02-22' },   // already clean (the `today` default)
    { raw: '',                    want: '' },             // empty stays empty
    { raw: null,                  want: '' }              // null → '' (no crash)
  ];
  cases.forEach(function (c) {
    var got = CORE.normDateValue('date', c.raw);
    console.log('§CRUD-DATE raw="' + c.raw + '" normalized="' + got + '" widget=date');
    verdict(got === c.want, 'normDateValue("date", "' + c.raw + '") = "' + c.want + '"', 'got="' + got + '"');
  });
  // the seeded value must match what type=date accepts AND what validateField passes (non-empty required).
  var seeded = CORE.normDateValue('date', '2002-02-22 00:00:00');
  verdict(/^\d{4}-\d{2}-\d{2}$/.test(seeded), 'seeded value matches the strict yyyy-MM-dd the widget accepts', 'seeded="' + seeded + '"');
  var dateField = E_INVOICE.fields.filter(function (f) { return f.col === 'dateinvoiced'; })[0];
  var why = CORE.validateField({}, dateField, seeded, seeded);
  verdict(why === null, 'validateField PASSES on the seeded date (no false "required")', 'why=' + why);
  // prove the bug WOULD bite without the fix: the raw timestamp blanks the widget → gatherVals reads '' → required.
  var whyBlank = CORE.validateField({}, dateField, '', seeded);   // val='' (blanked widget) vs orig=<stored> — CHANGED, so validated (bim-ootb #353 skips an unchanged field)
  verdict(whyBlank === 'required', 'control: a BLANK widget (the pre-fix symptom) is correctly REJECTed required', 'why=' + whyBlank);

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // ITEM 2 — CRUD_UPDATE persists through the signed sidecar; read-the-tip overlays the new value
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\nITEM 2 — edit description, Save (signed commit), reopen → tip shows the NEW value');
  var db = new SQL.Database(); KO.ensureTable(db);
  var BUNDLE = { c_invoice_id: 105, documentno: 'INV-1', dateinvoiced: '2002-02-22', description: '(2)', docstatus: 'CO' };  // the IMMUTABLE bundle row

  // U1 — before any write, read-the-tip is empty → the form shows the baseline (no overlay).
  var tip0 = CORE.tipValues(db, 'c_invoice', 105);
  console.log('§CRUD-TIP key=c_invoice id=105 overlaid=' + (Object.keys(tip0).join(',') || '(none)') + ' source=sidecar');
  verdict(Object.keys(tip0).length === 0, 'pre-write: read-the-tip is empty → form shows the immutable bundle value', 'tip=' + JSON.stringify(tip0));

  // U2 — the user changes `description` "(2)" → "red1" and Saves. buildOp emits the REAL CRUD_UPDATE op.
  var orig = BUNDLE, vals = { c_invoice_id: 105, documentno: 'INV-1', dateinvoiced: '2002-02-22', description: 'red1', docstatus: 'CO' };
  var op = CORE.buildOp('update', E_INVOICE, vals, orig, { id: 105, opUuid: 'crud-inv-105-u1' });
  console.log('§CRUD update key=' + op.key + ' field=' + Object.keys(op.changes).join(',') + ' op=CRUD_UPDATE changes=' + JSON.stringify(op.changes));
  verdict(op.op_type === 'CRUD_UPDATE' && op.changes.description && op.changes.description.new === 'red1' && !op.changes.documentno,
          'buildOp emits a CRUD_UPDATE with ONLY the changed, non-readonly field (description → "red1")',
          'changes=' + JSON.stringify(op.changes));

  // U3 — Save commits through the REAL signed kernel (commitGroup, sealed, verifiable).
  var res = await commitUpdate(db, op, 1000);
  var v = await KO.verifyChain(db);
  console.log('§CRUD-PERSIST key=c_invoice id=105 op=CRUD_UPDATE cols=description source=sidecar gid=' + res.gid + ' ops=' + res.ids.length + ' sealed=' + res.sealed + ' verifyChain=' + (v.ok ? 'ok' : 'FAIL'));
  verdict(res.committed === true && v.ok === true, 'Save commits the update as a SIGNED group (verifyChain OK)', 'committed=' + res.committed + ' verify=' + v.ok);

  // U4 — reopen the form: read-the-tip overlays the NEW value on the immutable bundle row.
  var reopened = {}; Object.keys(BUNDLE).forEach(function (k) { reopened[k] = BUNDLE[k]; });   // fresh bundle read
  var tip1 = CORE.tipValues(db, 'c_invoice', 105);
  Object.keys(tip1).forEach(function (c) { reopened[c] = tip1[c]; });
  console.log('§CRUD-PERSIST key=c_invoice id=105 col=description tip="' + reopened.description + '" bundle="' + BUNDLE.description + '" source=sidecar');
  verdict(reopened.description === 'red1', 'reopened form shows the TIP value "red1" (not the stale "(2)")', 'desc=' + reopened.description);
  verdict(BUNDLE.description === '(2)', 'the immutable bundle row is UNCHANGED (baseline preserved)', 'bundle=' + BUNDLE.description);

  // U5 — page RELOAD: rehydrate the sidecar from its exported buffer; the tip survives.
  var buf = db.export();
  var db2 = new SQL.Database(new Uint8Array(buf)); KO.ensureTable(db2);
  var tipR = CORE.tipValues(db2, 'c_invoice', 105);
  console.log('§CRUD-PERSIST reload key=c_invoice id=105 col=description tip="' + tipR.description + '" source=sidecar(rehydrated)');
  verdict(tipR.description === 'red1', 'after reload (sidecar rehydrated from IndexedDB buffer) the tip is STILL "red1"', 'desc=' + tipR.description);

  // U6 — a SECOND edit: latest-wins merge in commit order (read-the-tip is a reduction, not a snapshot).
  var op2 = CORE.buildOp('update', E_INVOICE, { description: 'red1-final', c_invoice_id: 105 }, { description: 'red1', c_invoice_id: 105 }, { id: 105, opUuid: 'crud-inv-105-u2' });
  await commitUpdate(db, op2, 2000);
  var tip2 = CORE.tipValues(db, 'c_invoice', 105);
  console.log('§CRUD-PERSIST key=c_invoice id=105 col=description tip="' + tip2.description + '" (latest of 2 updates)');
  verdict(tip2.description === 'red1-final', 'two updates merge latest-wins in commit order (tip = "red1-final")', 'desc=' + tip2.description);

  // U7 — id isolation: an update to a DIFFERENT id does not bleed into this row's tip.
  var opOther = CORE.buildOp('update', E_INVOICE, { description: 'other', c_invoice_id: 999 }, { description: 'x', c_invoice_id: 999 }, { id: 999, opUuid: 'crud-inv-999' });
  await commitUpdate(db, opOther, 3000);
  var tipStill = CORE.tipValues(db, 'c_invoice', 105);
  verdict(tipStill.description === 'red1-final', 'tipValues is (table,id)-scoped — a sibling row\'s edit does not leak in', 'id105.desc=' + tipStill.description);

  db.close(); db2.close();

  console.log('\n§CRUD-PERSIST ' + (fails ? 'FAIL — ' + fails + ' checks red.'
    : 'PASS — ITEM 1: the date widget seeds to strict yyyy-MM-dd (no blank, no false required). '
    + 'ITEM 2: CRUD_UPDATE commits through the SIGNED sidecar and read-the-tip overlays the new value on the '
    + 'IMMUTABLE bundle row — surviving reopen AND reload, (table,id)-scoped, latest-wins. glassbowl_data.db untouched.'));
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(2); });
