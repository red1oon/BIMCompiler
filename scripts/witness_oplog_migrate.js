#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_OPLOG_APPEND_ONLY_FIX.md F10, witness W-OPLOG-MIGRATE.
//
// ISSUE IT PROVES OR DISPROVES (names it, per CLAUDE.md "tests expose issues"):
//   F1/F2/F3's append-only redesign changes WHERE a committed op lives (the new `ops` IndexedDB store,
//   read-all + replay hydration) instead of the pre-fix single whole-blob `log`/kernel_ops.db `put()`.
//   Real users have EXISTING pre-fix sidecars in that old shape sitting in their browser's IndexedDB
//   today. F10 requires that on first open under the NEW code, those existing ops are read ONCE, exploded
//   into the new per-op store under an idempotent marker, and the OLD blob key is left untouched (never
//   deleted) as a safety net — so upgrading a user to the fixed build must not silently drop their history.
//   This witness seeds a REAL pre-fix whole-blob sidecar (built the SAME way _sidePersist() used to —
//   SQL.Database.export().buffer put() into the `log` store, `SIDE_KEY='kernel_ops.db'`, no `ops` store
//   present yet, exactly what a browser that only ever ran the OLD crud_overlay.js would have on disk),
//   then opens the LIVE fixed page for the first time and asks: are ALL the legacy ops now in the new
//   store, does verifyChain pass on the migrated result, and is the old blob still there, unmodified?
//
// NON-INVENT: the legacy blob is built with the REAL kernel_ops.js commitGroup (same op-log the live app
//   would have produced pre-fix) — not a hand-crafted byte fixture — and is exported via the SAME
//   `SQL.Database.export().buffer` call `_sidePersist()` used to make, so the fixture is byte-for-byte
//   what a real pre-fix sidecar looks like, not a synthetic shape.
//
// REAL PAGE, MINIMAL evaluate FOOTPRINT: the fixture is seeded via page.evaluate() BEFORE the page's own
//   withSidecar() has ever run this page-load — that is unavoidable (there is no UI affordance to "have
//   already had a pre-fix browser session"; the spec's own witness table names this shape explicitly:
//   "a pre-seeded fixture ... opened by the NEW code"). The MIGRATION ITSELF then runs entirely through
//   the REAL, unmodified withSidecar()/_hydrateSide() code path (window.__crud.withSidecar), not faked.
//
// Run: bash build/erp/run_witness.sh scripts/witness_oplog_migrate.js  (from bim-compiler) — then READ
//   build/erp/witness_oplog_migrate.log before ANY pass/fail conclusion (Log Mandate). Requires
//   OPLOG_WITNESS_ROOT to point at a checkout carrying the F1/F2/F3/F10 fix (defaults to the fix
//   worktree path used during this session; override via env for a different worktree/checkout).
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.OPLOG_WITNESS_ROOT || '/tmp/wt-oplog-append';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function log(m) { console.log('   ' + m); }

(async function () {
  var server = http.createServer(function (req, res) {
    var p = decodeURIComponent(req.url.split('?')[0]);
    var fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, r); });
  var port = server.address().port;
  var URL_ = 'http://localhost:' + port + '/erp/idempiere.html?login=SuperUser';
  var N = 5;   // legacy op count — small, deterministic, traceable
  var browser = await reqPw().chromium.launch();
  var totalAssertions = 0;

  try {
    console.log('\n═══ W-OPLOG-MIGRATE — pre-fix whole-blob sidecar, opened for the first time by the fixed code ═══\n');
    var ctx = await browser.newContext();
    var page = await ctx.newPage();
    var consoleLines = [];
    page.on('console', function (m) { var t = m.text(); consoleLines.push(t); if (/^§/.test(t)) log(t); });
    await page.goto(URL_, { waitUntil: 'load' });
    await page.waitForFunction(function () { return !!(window.__crud && window.KernelOps && window.initSqlJs); }, { timeout: 20000 });
    log('setup: page loaded, __crud/KernelOps/initSqlJs present, withSidecar() NOT yet called this page-load');

    // ── seed a REAL pre-fix whole-blob sidecar BEFORE the app's own withSidecar() ever runs ──
    var seed = await page.evaluate(function (n) {
      return (async function () {
        var SQL = await window.initSqlJs({ locateFile: function (f) { return 'sqljs/' + f; } });
        var legacyDb = new SQL.Database();
        window.KernelOps.ensureTable(legacyDb);
        var ops = [];
        for (var i = 0; i < n; i++) {
          ops.push({ op_type: 'CRUD_UPDATE', op_uuid: null,
                     params: { table: 'c_order', id: 101, changes: { description: 'LEGACY-' + i } } });
        }
        // ONE op per commitGroup call (mirrors real pre-fix single-edit commits, not one big batch) —
        // matches how _commitCrudSealed actually called commitGroup (one groupOps array per Save click).
        for (var j = 0; j < ops.length; j++) {
          var r = await window.KernelOps.commitGroup(legacyDb, [ops[j]], { baseTs: 1700000000000 + j });
          if (!r || r.committed !== true) return { ok: false, err: 'legacy commitGroup failed at ' + j };
        }
        var buf = legacyDb.export().buffer;
        // put() into the OLD store exactly as pre-fix _sidePersist() did — version 1, store 'log', key
        // 'kernel_ops.db'. This IS the pre-fix on-disk shape, not a synthetic approximation.
        var putOk = await new Promise(function (resolve) {
          var req = indexedDB.open('glassbowl_kernel_ops', 1);
          req.onupgradeneeded = function () { req.result.createObjectStore('log'); };
          req.onsuccess = function () {
            var db = req.result;
            try {
              var tx = db.transaction('log', 'readwrite');
              tx.objectStore('log').put(buf, 'kernel_ops.db');
              tx.oncomplete = function () { resolve(true); };
              tx.onerror = function () { resolve(false); };
            } catch (e) { resolve(false); }
          };
          req.onerror = function () { resolve(false); };
        });
        return { ok: putOk, legacyBytes: buf.byteLength, legacyOpCount: n };
      })();
    }, N);
    totalAssertions++; verdict(seed.ok === true, 'seeded a REAL pre-fix whole-blob sidecar (' + N + ' real signed ops, exported+put into the OLD log/kernel_ops.db key)', JSON.stringify(seed));

    // ── open the sidecar for the FIRST time via the REAL, unmodified withSidecar()/_hydrateSide() path ──
    var hydrated = await page.evaluate(function () {
      return new Promise(function (resolve) {
        window.__crud.withSidecar(function (db) {
          if (!db) { resolve({ ok: false, err: 'withSidecar cb(null)' }); return; }
          var c = db.exec('SELECT COUNT(*) FROM kernel_ops');
          var count = c.length ? c[0].values[0][0] : 0;
          Promise.resolve(window.KernelOps.verifyChain(db)).then(function (v) {
            resolve({ ok: true, hydratedCount: count, chainOk: !!(v && v.ok), tip: v && v.tip });
          }).catch(function (e) { resolve({ ok: true, hydratedCount: count, chainOk: false, err: e.message }); });
        });
      });
    });
    totalAssertions++; verdict(hydrated.ok === true, 'withSidecar() hydrated a real SIDE db on first open', JSON.stringify(hydrated));
    totalAssertions++; verdict(hydrated.hydratedCount === N, 'hydrated SIDE carries ALL ' + N + ' migrated legacy ops (no loss)', 'hydratedCount=' + hydrated.hydratedCount);
    totalAssertions++; verdict(hydrated.chainOk === true, 'verifyChain(hydrated SIDE) is OK — migration replayed rows verbatim, chain intact', JSON.stringify(hydrated));

    // ── parse this session's own §OPLOG-MIGRATE line (emitted by _hydrateSide during the call above) ──
    var migLine = consoleLines.filter(function (l) { return /^§OPLOG-MIGRATE /.test(l); })[0] || null;
    log('captured: ' + (migLine || '(no §OPLOG-MIGRATE line found)'));
    var m = migLine && /legacyOps=(\d+) migratedOps=(\d+) chainValid=(true|false)/.exec(migLine);
    totalAssertions++; verdict(!!m, 'a §OPLOG-MIGRATE line was emitted by the real hydration path', migLine || 'NONE');
    if (m) {
      totalAssertions++; verdict(Number(m[1]) === N && Number(m[2]) === N && m[3] === 'true',
        'the app\'s OWN §OPLOG-MIGRATE line reports legacyOps=migratedOps=' + N + ' chainValid=true',
        'legacyOps=' + m[1] + ' migratedOps=' + m[2] + ' chainValid=' + m[3]);
    }
    var preservedLine = consoleLines.some(function (l) { return /^§OPLOG-BLOB-PRESERVED unchanged=true/.test(l); });
    totalAssertions++; verdict(preservedLine, '§OPLOG-BLOB-PRESERVED unchanged=true was logged (old blob only READ during migration)');

    // ── independently confirm the OLD blob key still holds its ORIGINAL bytes (never put()/deleted) ──
    var oldBlobCheck = await page.evaluate(function (expectedBytes) {
      return new Promise(function (resolve) {
        var req = indexedDB.open('glassbowl_kernel_ops');   // no version arg — current version, no upgrade
        req.onerror = function () { resolve({ ok: false, err: 'open-error' }); };
        req.onsuccess = function () {
          var db = req.result;
          try {
            var g = db.transaction('log', 'readonly').objectStore('log').get('kernel_ops.db');
            g.onsuccess = function () {
              var buf = g.result;
              resolve({ ok: true, present: !!buf, bytes: buf ? buf.byteLength : 0 });
            };
            g.onerror = function () { resolve({ ok: false, err: 'get-error' }); };
          } catch (e) { resolve({ ok: false, err: 'tx-error:' + e.message }); }
        };
      });
    }, seed.legacyBytes);
    totalAssertions++; verdict(oldBlobCheck.ok === true && oldBlobCheck.present === true && oldBlobCheck.bytes === seed.legacyBytes,
      'the OLD log/kernel_ops.db key is STILL PRESENT and byte-length-identical after migration (F10: never deleted, never put()-overwritten)',
      'expected=' + seed.legacyBytes + ' actual=' + JSON.stringify(oldBlobCheck));

    // ── idempotency: a SECOND withSidecar() open (fresh page) must NOT re-migrate (marker present) ──
    var page2 = await ctx.newPage();
    var lines2 = [];
    page2.on('console', function (m2) { var t = m2.text(); lines2.push(t); if (/^§/.test(t)) log('[reopen] ' + t); });
    await page2.goto(URL_, { waitUntil: 'load' });
    await page2.waitForFunction(function () { return !!(window.__crud && window.KernelOps); }, { timeout: 20000 });
    var hydrated2 = await page2.evaluate(function () {
      return new Promise(function (resolve) {
        window.__crud.withSidecar(function (db) {
          if (!db) { resolve({ ok: false }); return; }
          var c = db.exec('SELECT COUNT(*) FROM kernel_ops');
          resolve({ ok: true, count: c.length ? c[0].values[0][0] : 0 });
        });
      });
    });
    var remigrated = lines2.some(function (l) { return /^§OPLOG-MIGRATE /.test(l); });
    totalAssertions++; verdict(hydrated2.ok === true && hydrated2.count === N, 'a SECOND, fresh tab hydrates the SAME ' + N + ' ops via plain read-all (no re-migration needed)', JSON.stringify(hydrated2));
    totalAssertions++; verdict(!remigrated, 'the SECOND open did NOT re-run migration (idempotent marker honoured — no duplicate §OPLOG-MIGRATE line)');

    await ctx.close();
  } catch (e) {
    fails++;
    console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n'));
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n' + (fails === 0
    ? '✅ W-OPLOG-MIGRATE ' + totalAssertions + '/' + totalAssertions + ' PASS'
    : '❌ ' + fails + '/' + totalAssertions + ' 🔴 — F10 migration did not fully hold, see lines above (Log Mandate: this is a real finding, report it, don\'t suppress).')
    + '\n');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
