#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * poc_system_monitor.js — witness for the New-Paradigm System Monitor (4 field-health widgets).
 *   Spec: prompts/SYSTEM_MONITOR_WIDGETS.md §WITNESS CLAIMS  ·  Module: build/erp/system_monitor.js
 *
 * Issue it PROVES: each widget FOLDS a REAL signal (NON-INVENT) and the A1 safety invariant holds — an
 *   unrelayed op is NEVER labelled "durable". Drives REAL sql.js op-log DB + REAL ERP.OfflineQueue + REAL
 *   error_beacon + REAL vfs_detect. §FALSIFIER per widget (a wrong fold flips its status). READ THE LOG.
 */
'use strict';
global.window = global.window || {}; global.self = global.self || global;
var path = require('path');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var Monitor = require(path.join(ROOT, 'build', 'erp', 'field_health.js'));
var OfflineQueue = require(path.join(ROOT, 'build', 'erp', 'offline_queue.js'));
var VFS = require(path.join(ROOT, 'build', 'erp', 'vfs_detect.js'));
var KERNEL = path.join(ROOT, 'build', 'erp', 'kernel_ops.js');

// a real error beacon under a minimal window shim (so beacon.captured/list() are the genuine module)
function realBeacon() {
  // keep the shim installed (the beacon reads window.localStorage at fold time — restoring would break list())
  var handlers = {}, ls = {};
  var carry = global.window;                                // preserve already-loaded globals (e.g. KernelOps)
  global.window = { addEventListener: function (t, fn) { (handlers[t] = handlers[t] || []).push(fn); },
    localStorage: { getItem: function (k) { return k in ls ? ls[k] : null; }, setItem: function (k, v) { ls[k] = String(v); }, removeItem: function (k) { delete ls[k]; } } };
  if (carry && carry.KernelOps) global.window.KernelOps = carry.KernelOps;
  global.localStorage = global.window.localStorage;
  delete require.cache[require.resolve(path.join(ROOT, 'deploy', 'dev', 'error_beacon.js'))];
  require(path.join(ROOT, 'deploy', 'dev', 'error_beacon.js'));
  var b = global.window.__ERR_BEACON__, fire = handlers;
  return { beacon: b, fireError: function (msg) { fire['error'][0]({ message: msg, filename: 'x.js', lineno: 1, colno: 1, error: { stack: 'E' } }); } };
}

var FAILS = [];
function check(name, cond, detail) { console.log((cond ? '   ✓ ' : '   ✗ ') + name + (detail ? ' — ' + detail : '')); if (!cond) FAILS.push(name); }
function widget(r, id) { return r.widgets.filter(function (w) { return w.id === id; })[0]; }

(async function () {
  console.log('═══ §MON — System Monitor 4-widget fold (real signals) ═══');
  var SQL = await initSqlJs();

  // ── build a REAL op-log DB via the real kernel ───────────────────────────────────────────────────
  delete require.cache[require.resolve(KERNEL)]; require(KERNEL); var K = global.window.KernelOps;
  var db = new SQL.Database();
  for (var i = 0; i < 200; i++) K.commitOp(db, 'POST', { table: 'C_Invoice', id: 9000 + i, lines: [{ account_id: '101', amtacctdr: i, amtacctcr: 0 }] });

  // ── REAL offline queue: 30 relayed (durable) + 20 unrelayed (in-flight) ──────────────────────────
  var q = new OfflineQueue({ now: function () { return 1000; } });
  var ids = [];
  for (var j = 0; j < 50; j++) ids.push(q.enqueue({ op_uuid: 'u' + j, type: 'POST' }).queued);
  q.markRelayed(ids.slice(0, 30));

  // ── REAL beacon + REAL vfs detect (idb path = GH-Pages-like, not isolated) ───────────────────────
  var rb = realBeacon();
  var vfsIdb = VFS.detect({ opfsApi: false, crossOriginIsolated: false });

  // ════════ S1 — clean state (errors=0, all-durable scenario uses a 2nd queue) ════════
  console.log('\n── S1: healthy fold ──');
  var qClean = new OfflineQueue({ now: function () { return 1000; } });
  var cids = []; for (var c = 0; c < 10; c++) cids.push(qClean.enqueue({ op_uuid: 'c' + c }).queued); qClean.markRelayed(cids);
  var r1 = Monitor.fold({ beacon: rb.beacon, queue: qClean, db: db, vfs: vfsIdb,
    storageEstimate: { usage: 13 * 1024 * 1024, quota: 1024 * 1024 * 1024 }, persisted: true, bootstrapPath: 'checkpoint' });
  check('W-MON-FIELD-ERRORS 0 errors → ok', widget(r1, 'field_errors').status === 'ok' && widget(r1, 'field_errors').value === 0, 'value=' + widget(r1, 'field_errors').value);
  check('W-MON-DURABILITY all-relayed → ok, inflight 0', widget(r1, 'durability_ladder').status === 'ok' && /inflight 0/.test(widget(r1, 'durability_ladder').value));
  check('W-MON-DBSIZE real PRAGMA MB, well under 200 → ok', widget(r1, 'db_size_gauge').status === 'ok' && /MB/.test(String(widget(r1, 'db_size_gauge').value)), 'value=' + widget(r1, 'db_size_gauge').value);
  check('W-MON-ENV idb on non-isolated → ok (named, not misconfig)', widget(r1, 'environment').status === 'ok' && /IDB/.test(widget(r1, 'environment').value));
  check('W-MON-OVERALL healthy → ok', r1.overall === 'ok', 'overall=' + r1.overall);

  // ════════ S2 — A1 invariant: 20 unrelayed must show inflight, NEVER durable ════════
  console.log('\n── S2: durability invariant (the A1 "never lie about safety" test) ──');
  var r2 = Monitor.fold({ beacon: rb.beacon, queue: q, db: db, vfs: vfsIdb, persisted: true, bootstrapPath: 'checkpoint' });
  var dw = widget(r2, 'durability_ladder');
  check('W-MON-DURABILITY 30 durable + 20 inflight', /durable@30/.test(dw.value) && /inflight 20/.test(dw.value), 'value=' + dw.value);
  check('W-MON-DURABILITY unsynced → status=warn (not ok)', dw.status === 'warn', 'status=' + dw.status);
  check('§FALSIFIER inflight NOT counted as durable', !/durable@50/.test(dw.value), 'value=' + dw.value);

  // ════════ S3 — error capture flips the field-errors widget ════════
  console.log('\n── S3: a field error flips the G2 widget ──');
  rb.fireError('boom in the field'); rb.fireError('and another');
  var r3 = Monitor.fold({ beacon: rb.beacon, queue: q, db: db, vfs: vfsIdb, persisted: true });
  check('W-MON-FIELD-ERRORS 2 captured → alert (hard errors)', widget(r3, 'field_errors').value === 2 && widget(r3, 'field_errors').status === 'alert', 'value=' + widget(r3, 'field_errors').value + ' status=' + widget(r3, 'field_errors').status);

  // ════════ S4 — falsifiers: misconfig env, genesis bootstrap, persisted=false+inflight ════════
  console.log('\n── S4: falsifiers ──');
  var vfsMis = VFS.detect({ opfsApi: true, crossOriginIsolated: true }); // opfs-capable → backend opfs (ok)
  var vfsBad = { backend: 'idb', misconfig: true, reason: 'idb on a COOP/COEP origin' };
  var r4a = Monitor.fold({ vfs: vfsBad });
  check('W-MON-ENV misconfig (idb on isolated) → warn', widget(r4a, 'environment').status === 'warn', 'status=' + widget(r4a, 'environment').status);
  var r4b = Monitor.fold({ vfs: vfsIdb, bootstrapPath: 'genesis' });
  check('W-MON-ENV genesis bootstrap → alert', widget(r4b, 'environment').status === 'alert', 'status=' + widget(r4b, 'environment').status);
  var r4c = Monitor.fold({ queue: q, persisted: false });
  check('W-MON-DURABILITY persisted=false + inflight → alert', widget(r4c, 'durability_ladder').status === 'alert', 'status=' + widget(r4c, 'durability_ladder').status);

  // ════════ S5 — na when a signal is absent (NEVER invented) ════════
  console.log('\n── S5: missing signal → na, never invented ──');
  var r5 = Monitor.fold({});
  check('all widgets na when no signals (non-invent)', r5.widgets.every(function (w) { return w.status === 'na'; }), 'overall=' + r5.overall);

  console.log('\n§MON-WITNESS OVERALL=' + (FAILS.length === 0 ? 'PASS' : 'FAIL (' + FAILS.join('; ') + ')'));
  process.exit(FAILS.length === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL ' + e.stack); process.exit(2); });
