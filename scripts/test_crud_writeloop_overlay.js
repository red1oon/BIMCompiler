// Implementing GUIDE_SHOWME_PROCESS.md GP3 (DECIDED seam: sidecar log, read-the-tip) — Witness:
// W-CRUD-WRITELOOP-OVERLAY. Extends test_crud_process_writeloop.js with the OVERLAY-BUILT op: proves the
// op the deployed Process ▶ produces (CORE.buildOp('process')) round-trips through the REAL production
// kernel (bim-ootb/viewer/kernel_ops.js — commitOp/sealChain/verifyChain) and that read-the-tip recovers
// the committed docstatus from the sidecar log — glassbowl_data.db never touched.
//  (1) met-requires  → overlay op to=CO → commitOp signs it → sealChain → verifyChain OK → readTip=CO.
//  (2) unmet-requires→ overlay op to=IP → committed + readTip=IP (a real signed In-Progress, non-invent).
//  (3) round-trip: the params stored in the kernel === CORE.kernelParamsFor(the overlay op) (no drift).
//  (4) tamper of the committed Process op is DETECTED by verifyChain (signed + tamper-evident).
// §-log first: writes build/erp/crud_writeloop_overlay_witness.log; READ the log, not the exit code.
'use strict';
if (typeof global.crypto === 'undefined') global.crypto = require('crypto').webcrypto;
global.window = { APP: {} }; global.APP = global.window.APP;   // APP.DB_URL unset → kernel _persistToIdb no-op
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs');
var initSqlJs = require('sql.js');
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js')   /* the ERP kernel the FSM/CORE ship with (v13, branch_id) — NOT viewer/kernel_ops.js (§TWIN-CLASSIFIED-WITNESS-FIXES 1) */);   // REAL kernel → window.KernelOps
var K = global.window.KernelOps;
var CORE = require('../build/erp/crud_overlay.js');
var STORE = require('../build/erp/crud_ops.json');

var out = [], pass = 0, fail = 0;
function L(s) { out.push(s); }
function ck(c, m) { if (c) { pass++; L('§CRUD-WLO PASS ' + m); } else { fail++; L('§CRUD-WLO FAIL ' + m); } }

var entry = Object.assign({}, STORE.c_order, { key: 'c_order' });
var reqs = (entry.docAction && entry.docAction.requires) || [];

(async function () {
  var SQL = await initSqlJs();
  var sidecar = new SQL.Database();   // the GP3 sidecar — separate from the (immutable) glassbowl_data.db
  K.ensureTable(sidecar);
  K.commitOp(sidecar, 'SESSION_START', { ts: 't0' });

  // (1) met → overlay builds a CO op → commit as a SIGNED op → seal → verify → read-the-tip
  var metVals = {}; reqs.forEach(function (c, i) { metVals[c] = (c === 'grandtotal' ? 100.70 : 100 + i); });
  var metOp = CORE.buildOp('process', entry, metVals, {}, { id: 80001, from: 'DR' });
  ck(metOp.op_type === 'DOC_ACTION' && metOp.to === 'CO', 'overlay builds CO op for met-requires (to=' + metOp.to + ')');
  var metParams = CORE.kernelParamsFor(metOp);
  var metId = K.commitOp(sidecar, 'SET_STATUS', metParams);
  ck(metId > 0, 'overlay CO op committed to the sidecar (rowid=' + metId + ')');
  var sealed = await K.sealChain(sidecar);
  ck(sealed.tip && sealed.tip.length === 64, 'sealChain seals the Process write (tip64)');
  var v1 = await K.verifyChain(sidecar);
  ck(v1.ok, 'verifyChain OK on the sealed overlay write (len=' + v1.len + ')');
  var tip = CORE.readTip(sidecar, 'c_order', 80001);
  ck(tip === 'CO', 'read-the-tip recovers docstatus=CO for (c_order,80001) (tip=' + tip + ')');
  L('§CRUD process committed op_uuid=<minted> verifyChain=ok docstatus=' + tip);   // ← the GP3 witness line shape

  // (3) round-trip: what the kernel STORED === what the overlay asked to write (no drift)
  var storedRow = sidecar.exec("SELECT parameters FROM kernel_ops WHERE op_type='SET_STATUS' ORDER BY id DESC LIMIT 1");
  var stored = JSON.parse(storedRow[0].values[0][0]);
  ck(stored.table === metParams.table && String(stored.id) === String(metParams.id) && stored.to === metParams.to && stored.oracle === metParams.oracle,
     'round-trip: stored params === overlay kernelParamsFor (table/id/to/oracle)');

  // (2) unmet → overlay builds an IP op → a real signed In-Progress → read-the-tip=IP
  var unmetVals = {}; reqs.forEach(function (c, i) { if (i > 0) unmetVals[c] = 100 + i; });   // omit first required
  var unmetOp = CORE.buildOp('process', entry, unmetVals, {}, { id: 80002, from: 'DR' });
  ck(unmetOp.to === 'IP', 'overlay builds IP op for unmet-requires (unmet=' + unmetOp.unmet.join(',') + ')');
  K.commitOp(sidecar, 'SET_STATUS', CORE.kernelParamsFor(unmetOp));
  await K.sealChain(sidecar);
  ck((await K.verifyChain(sidecar)).ok, 'verifyChain OK after the IP write too');
  ck(CORE.readTip(sidecar, 'c_order', 80002) === 'IP', 'read-the-tip recovers docstatus=IP for the unmet doc');
  ck(CORE.readTip(sidecar, 'c_order', 80001) === 'CO', 'read-the-tip still CO for the first doc (per-(table,id) isolation)');
  ck(CORE.readTip(sidecar, 'c_order', 99999) === null, 'read-the-tip null for an untouched doc (→ descriptor default)');

  // (4) tamper of the committed Process op is DETECTED
  sidecar.run("UPDATE kernel_ops SET parameters='{\"table\":\"c_order\",\"id\":80001,\"to\":\"CL\"}' WHERE id=" + metId);
  var v2 = await K.verifyChain(sidecar);
  ck(!v2.ok && v2.brokeAt === metId, 'tamper of the Process op DETECTED (brokeAt=' + v2.brokeAt + ')');

  L('§CRUD-WLO SUMMARY pass=' + pass + ' fail=' + fail);
  fs.writeFileSync(__dirname + '/../build/erp/crud_writeloop_overlay_witness.log', out.join('\n') + '\n');
  console.log(out.join('\n'));
  process.exit(fail === 0 ? 0 : 1);
})();
