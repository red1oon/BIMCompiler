#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §N-User Concurrency (2026-07-20),
// witness W-N10-CONCURRENT-TODAY.
//
// ISSUE IT PROVES OR DISPROVES (names it, per CLAUDE.md "tests expose issues"):
//   S3/S4 (this file's sibling, scripts/witness_e2e_crud_blob_race.js) already witnessed, at N=2 tabs,
//   that bim-ootb erp/crud_overlay.js `_sidePersist()` (~line 1632) does an UNCONDITIONAL whole-sql.js-DB
//   export + put(buf, SIDE_KEY) into ONE fixed IndexedDB record (glassbowl_kernel_ops/kernel_ops.db), and
//   that the second tab's persist silently clobbers the first's — a clean last-write-wins loss, not a
//   rejection. THIS witness asks the ONE question N=2 could not answer: does that mechanism, scaled to
//   10-WAY SAME-KEY contention (10 tabs racing writes to the SAME c_order.grandtotal, one BrowserContext,
//   one shared IndexedDB record), still fail CLEAN (last write wins, DB stays structurally valid) — or
//   does 10-way overlapping export()+put() traffic produce a TORN/CORRUPT blob (unreadable DB)? That
//   distinction matters to the remedy design (append-only per-op records vs whole-blob CAS) named in
//   §Remedy Direction of the POC doc. DISCOVERY, not confirmation — either finding is valid and reported
//   as observed (per this file's Log Mandate obligation), not forced toward a predicted narrative.
//
// DESIGN — SAME-KEY, not disjoint-field (deliberate, matches the Purpose line above): all 10 tabs edit
//   the SAME row (c_order id=101) and the SAME column (grandtotal), each writing a DISTINCT, traceable
//   value (100000+i for tab i) so the final persisted value can be matched back to exactly one winning
//   tab. This is S4's shape (§Concurrency Model Case 2) scaled 10x, not S3's shape (disjoint columns) —
//   the task is to quantify same-key contention, not re-run the disjoint-field case at N=10.
//
// TWO INDEPENDENT READS OF THE FINAL STATE (this is what lets "lose" and "corrupt" be told apart):
//   1. APP-PATH  — a genuinely fresh 11th tab navigates to the live page and lets crud_overlay.js's own
//      withSidecar() hydrate SIDE from IndexedDB exactly as a real user's next page-load would. NOTE:
//      withSidecar's build() wraps `new SQL.Database(buf)` in try/catch and SILENTLY FALLS BACK to an
//      EMPTY database on any constructor failure (crud_overlay.js ~line 1653) — so if the blob were torn,
//      the app path alone would show ops=0 and look IDENTICAL to "all 10 writes vanished cleanly". That
//      silent-masking behavior is itself part of the finding, not a witness bug.
//   2. RAW-PATH  — the SAME evaluate reads the raw ArrayBuffer directly out of IndexedDB
//      (glassbowl_kernel_ops/log/kernel_ops.db, bypassing withSidecar entirely) and reconstructs a
//      database from it using the already-hydrated page's OWN `SQL.Database` constructor (borrowed via
//      `kernelDb().constructor` — reuses the wasm module crud_overlay.js already loaded, no second
//      initSqlJs() call, no risk of double-init side effects). A constructor THROW here is real,
//      un-maskable corruption; a clean construct + COUNT(*) is the ground-truth op count regardless of
//      what the app-path fallback would have shown.
//   Agreement between the two paths (same ops count, no ctorErr) = clean loss. Disagreement (raw throws,
//   or raw count differs from app count) = the app's fallback was masking a real corruption.
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md): login via the app's own documented
//   `?login=SuperUser` zero-click entry (same `applySession()` funnel a manual click reaches); record via
//   the app's own `?window=143&record=101` deep link. Each tab's edit is a real page.fill() on the visible
//   `[data-col="grandtotal"]` input + a real page.click() on the visible `#idmp-toolbar` Save button — the
//   exact DOM path saveForm()/commitCrud() wires to, same as witness_e2e_crud_blob_race.js. NO
//   page.evaluate() fakes a commit anywhere in this file; the only evaluate() calls in the FINAL-READ
//   step are read-only (app's own published window.__crud.kernelDb()/core.tipValues() API, plus a
//   read-only raw IndexedDB get()).
//
// NON-INVENT: c_order id=101 (documentno 80001) is the same real shipped ad_seed.db row S3/S4/S5 already
//   used (CreatedBy=100=SuperUser, ownerGated passes trivially, no spurious REJECT). Ten distinct,
//   traceable values are written — no shared/ambiguous fixture value, so the final read can only match
//   one specific tab.
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_n10_concurrent_today.js  (from bim-compiler) —
//   then READ build/erp/witness_e2e_n10_concurrent_today.log before ANY pass/fail conclusion (Log Mandate).
//   Exit 0 = the harness RAN and produced a reading (loss is an EXPECTED, not a failing, finding). Exit 1
//   only on a harness break (page never loads, no console line ever appears, etc.) — see verdict() calls.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
// ROOT = bim-ootb, NOT this repo — the live product UI under test lives there (CLAUDE.md repo map).
// OPLOG_WITNESS_ROOT override — Implementing ERP_OPLOG_APPEND_ONLY_FIX.md §WITNESS (BEFORE/AFTER pair):
// see witness_e2e_crud_blob_race.js's sibling comment. Defaults to the live checkout, unchanged.
var ROOT = process.env.OPLOG_WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

var fails = 0;
var harnessOk = true;   // distinguishes "harness broke" (exit 1) from "discovery finding" (exit 0 regardless of shape)
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function log(m) { console.log('   ' + m); }

function mkWaiter(page, tag) {
  var lines = [], cursor = 0;
  page.on('console', function (m) { var t = m.text(); lines.push(t); if (/^§/.test(t)) log('[' + tag + '] ' + t); });
  return {
    lines: lines,
    wait: function (regexes, timeoutMs) {
      var start = Date.now();
      return new Promise(function (resolve, reject) {
        (function poll() {
          for (; cursor < lines.length; cursor++) {
            for (var i = 0; i < regexes.length; i++) if (regexes[i].test(lines[cursor])) return resolve({ line: lines[cursor], which: i });
          }
          if (Date.now() - start > (timeoutMs || 20000)) return reject(new Error('[' + tag + '] timeout waiting for ' + regexes.join(' | ')));
          setTimeout(poll, 100);
        })();
      });
    }
  };
}

function waitForCrudOutcome(waiter, table, timeoutMs) {
  var rxPersist = new RegExp('§CRUD-PERSIST key=' + table + ' ');
  var rxReject = new RegExp('§CRUD-GATE key=' + table + ' ownerGated=Y verdict=REJECT');
  var rxNoop = new RegExp('§CRUD update key=' + table + '.*no-op');
  return waiter.wait([rxPersist, rxReject, rxNoop], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    if (r.which === 1) return { committed: false, reason: 'owner-gate REJECT', line: r.line };
    return { committed: false, reason: 'no-op (0 changed cols)', line: r.line };
  });
}

// APP-PATH read — the same read-only API S3/S4/S5 already used.
function readSidecarAppPath(page, table, id) {
  return page.evaluate(function (args) {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K) return { ok: false, ops: 0, tip: 'NO-SIDE' };
    var c = K.exec('SELECT COUNT(*) FROM kernel_ops');
    var ops = c.length ? c[0].values[0][0] : 0;
    var t = K.exec("SELECT op_hash FROM kernel_ops WHERE op_hash IS NOT NULL ORDER BY id DESC LIMIT 1");
    var tip = (t.length && t[0].values.length) ? t[0].values[0][0] : 'GENESIS';
    var fields = window.__crud.core.tipValues(K, args.table, args.id, null);
    return { ok: true, ops: ops, tip: tip, fields: fields };
  }, { table: table, id: id });
}

// APP-PATH chain verify — window.KernelOps.verifyChain(db), async, tamper-evidence per-op hash chain.
function verifyChainAppPath(page) {
  return page.evaluate(function () {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K || !window.KernelOps || typeof window.KernelOps.verifyChain !== 'function') return { ok: false, why: 'no-KernelOps-or-SIDE' };
    return window.KernelOps.verifyChain(K);   // returns a Promise({ok,len,tip} | {ok:false,brokeAt,why})
  });
}

// RAW-PATH read — bypass withSidecar()'s silent try/catch-to-empty entirely: read the raw per-op
// records straight out of IndexedDB and reconstruct a DB from them using the page's ALREADY-hydrated
// KernelOps.replayRowsInto + the page's own SQL.Database constructor (borrowed off kernelDb(), so no
// second initSqlJs() load). A constructor/replay/verifyChain failure here is real, un-maskable
// corruption in the persisted per-op records — the app path alone cannot distinguish that from "empty".
// UPDATED 2026-07-20 for ERP_OPLOG_APPEND_ONLY_FIX.md F1/F2: this witness originally read the LEGACY
// whole-blob key (`log`/kernel_ops.db) directly, bypassing the app the same way. Post-fix, that key is
// no longer where new commits land (F1 replaces the whole-blob put() with individual add()s into the
// NEW `ops` store — see kernel_ops.js §OPLOG-APPEND) — reading the old key would legitimately show
// "empty" for every POST-fix commit and misreport a clean fix as "all ops missing". The raw-path now
// reads the `ops` store directly instead, preserving the ORIGINAL intent (an app-bypassing corruption
// check) against the NEW storage shape, not the old one.
function readSidecarRawPath(page) {
  return page.evaluate(function () {
    return new Promise(function (resolve) {
      // No version arg — opens at WHATEVER version is already current (never triggers onupgradeneeded,
      // never forces a stale literal). A hardcoded version LOWER than the app's own already-open
      // connection (e.g. after the v1→v2 store-add bump) throws VersionError and makes this probe itself
      // unreadable — a witness-script bug, not a finding about the app under test.
      var req = indexedDB.open('glassbowl_kernel_ops');
      req.onerror = function () { resolve({ ok: false, err: 'idb-open-error' }); };
      req.onsuccess = function () {
        var db = req.result;
        try {
          if (!db.objectStoreNames.contains('ops')) { resolve({ ok: true, present: false, rawOps: 0, ctorErr: null, chainOk: null }); return; }
          var out = [];
          var cur = db.transaction('ops', 'readonly').objectStore('ops').openCursor();
          cur.onsuccess = function (e) {
            var c = e.target.result;
            if (c) { out.push(c.value); c.continue(); return; }
            // cursor exhausted — replay the RAW rows (independent of anything the app already built) into
            // a fresh sql.js db via the page's own KernelOps.replayRowsInto + verifyChain; a throw/verify-
            // fail here is real corruption in the persisted records, not merely "fewer ops than expected".
            var rawOps = out.length, ctorErr = null;
            try {
              var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
              var SQLCtor = K ? K.constructor : null;
              if (SQLCtor && window.KernelOps) {
                var raw = new SQLCtor();
                window.KernelOps.ensureTable(raw);
                window.KernelOps.replayRowsInto(raw, out);
                Promise.resolve(window.KernelOps.verifyChain(raw)).then(function (v) {
                  resolve({ ok: true, present: true, rawOps: rawOps, ctorErr: null, chainOk: !!(v && v.ok) });
                }).catch(function (e2) {
                  resolve({ ok: true, present: true, rawOps: rawOps, ctorErr: String((e2 && e2.message) || e2), chainOk: false });
                });
                return;
              }
            } catch (e3) { ctorErr = String((e3 && e3.message) || e3); }
            resolve({ ok: true, present: true, rawOps: rawOps, ctorErr: ctorErr, chainOk: null });
          };
          cur.onerror = function () { resolve({ ok: false, err: 'cursor-error' }); };
        } catch (e) { resolve({ ok: false, err: 'tx-error:' + e.message }); }
      };
    });
  });
}

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
  var URL_ = 'http://localhost:' + port + '/erp/idempiere.html?login=SuperUser&window=143&record=101';
  var TABLE = 'c_order', ID = 101, N = 10;
  var browser = await reqPw().chromium.launch();
  var totalAssertions = 0;

  try {
    console.log('\n═══ W-N10-CONCURRENT-TODAY — ' + N + ' tabs of ONE BrowserContext race the SAME c_order.grandtotal ═══\n');
    var ctx = await browser.newContext();

    // ── setup: open all N tabs BEFORE any edit, so every tab hydrates the SAME genesis blob
    //    (the "Case 2" precondition S4 already established, scaled to N=10) ──
    var pages = [], waiters = [];
    for (var i = 0; i < N; i++) {
      var pg = await ctx.newPage();
      var w = mkWaiter(pg, 'N10-' + i);
      await pg.goto(URL_, { waitUntil: 'load' });
      await pg.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 30000 });
      pages.push(pg); waiters.push(w);
    }
    log('setup: all ' + N + ' tabs loaded + hydrated');

    // ── each tab fills its OWN distinct, traceable value (100000+i) — pre-save state, not the race ──
    var vals = [];
    for (var i = 0; i < N; i++) {
      vals.push(String(100000 + i));
      await pages[i].fill('#idmp-inline-mount [data-col="grandtotal"]', vals[i]);
    }

    // ── the race: fire all N saves with a small stagger (i*40ms) so real IndexedDB export()+put()
    //    traffic from the N tabs genuinely overlaps in the browser, instead of running strictly serial ──
    var savePromises = pages.map(function (pg, i) {
      return new Promise(function (resolve) { setTimeout(resolve, i * 40); })
        .then(function () { return pg.click('#idmp-toolbar button[title="Save (Alt+S)"]'); })
        .then(function () { return waitForCrudOutcome(waiters[i], TABLE, 20000); })
        .catch(function (e) { return { committed: false, reason: 'threw: ' + e.message }; });
    });
    var outcomes = await Promise.all(savePromises);
    var committedCount = 0;
    for (var i = 0; i < N; i++) {
      if (outcomes[i].committed) committedCount++;
      console.log('   §N10 tab=' + i + ' wrote=' + vals[i] + ' committed=' + outcomes[i].committed +
        (outcomes[i].reason ? ' reason=' + outcomes[i].reason : ''));
    }
    totalAssertions++; verdict(committedCount === N,
      'all ' + N + ' tabs individually reported a successful signed commit (own verifyChain=ok, own owner-gate PASS)',
      committedCount + '/' + N + ' committed=true');

    // ── final read: a genuinely FRESH 11th tab, both app-path and raw-path ──
    var finalPage = await ctx.newPage();
    await finalPage.goto(URL_, { waitUntil: 'load' });
    await finalPage.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 30000 });

    var app = await readSidecarAppPath(finalPage, TABLE, ID);
    var chain = await verifyChainAppPath(finalPage);
    var raw = await readSidecarRawPath(finalPage);

    var finalVal = app.fields && app.fields.grandtotal != null ? String(app.fields.grandtotal) : null;
    var winnerIdx = vals.indexOf(finalVal);
    var chainValid = !!(chain && chain.ok);
    var agree = raw.ok && raw.ctorErr === null && raw.rawOps === app.ops;
    var survivors = (raw.ok && raw.ctorErr === null) ? raw.rawOps : app.ops;   // ground truth = raw path when it's readable

    console.log('   §N10-RAW rawOps=' + raw.rawOps + ' rawChainOk=' + raw.chainOk + ' ctorErr=' + (raw.ctorErr || 'none') +
      ' agreesWithAppPath=' + agree + ' (appOps=' + app.ops + ')');
    console.log('   §N10-FINAL survivors=' + survivors + '/' + N + ' chainValid=' + chainValid +
      ' tip=' + (chain && chain.tip ? chain.tip : app.tip) +
      ' detail=winner=' + (winnerIdx >= 0 ? ('tab' + winnerIdx + ' val=' + finalVal) : 'NO-MATCH(final=' + finalVal + ')') +
      ' rawCtorErr=' + (raw.ctorErr || 'none') + ' rawAppAgree=' + agree);

    totalAssertions++; verdict(raw.ok, 'RAW-PATH read of the persisted IndexedDB blob succeeded (idb open/get did not error)', JSON.stringify(raw));
    totalAssertions++; verdict(app.ok, 'APP-PATH read via window.__crud.kernelDb() succeeded on the fresh 11th tab', JSON.stringify({ ops: app.ops, tip: app.tip }));
    totalAssertions++; verdict(!!chain, 'window.KernelOps.verifyChain() ran and returned a verdict on the final persisted blob', JSON.stringify(chain));

    // The DISCOVERY assertions — both branches are valid findings, reported as observed, not forced:
    if (raw.ctorErr) {
      log('🔴 CORRUPTION: raw SQL.Database construction from the persisted blob THREW — ' + raw.ctorErr +
        '. The app-path silently showed ops=' + app.ops + ' instead of surfacing this — the fallback masks real corruption.');
    } else if (!agree) {
      log('🔴 RAW/APP DISAGREEMENT: raw path readable (rawOps=' + raw.rawOps + ') but differs from app-path (appOps=' + app.ops + ') — needs investigation, not a clean last-write-wins.');
    } else {
      log('🟢 CLEAN: raw-path and app-path agree (' + survivors + ' op(s) persisted, no constructor error) — the blob is structurally VALID; this is loss-only (last-write-wins), not corruption.');
    }
    totalAssertions++; verdict(chainValid || survivors === 0,
      'the final persisted blob (whatever its op count) is at least internally chain-consistent (verifyChain ok, or genuinely empty)',
      'chainValid=' + chainValid + ' survivors=' + survivors + ' why=' + (chain && chain.why));

    await ctx.close();
  } catch (e) {
    harnessOk = false;
    console.log('🔴 HARNESS THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n'));
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n' + (harnessOk
    ? ((fails === 0
        ? '✅ W-N10-CONCURRENT-TODAY ' + totalAssertions + '/' + totalAssertions + ' harness assertions PASS'
        : '⚠️  W-N10-CONCURRENT-TODAY ran to completion, ' + fails + '/' + totalAssertions + ' 🔴 harness-shape assertions — read the §N10-FINAL line above: this is DISCOVERY, a 🔴 here can mean "found the predicted loss" (valid) or "found something worse" (also valid, report it) — it is NOT necessarily a harness defect.')
      )
    : '❌ HARNESS BROKE before producing a reading (page never loaded / setup threw) — this IS a defect, fix before trusting any §N10 line above.')
    + '\n');
  // Exit 0 whenever the harness actually RAN and produced a §N10-FINAL reading (loss is an EXPECTED
  // finding per this file's header, not a failure); exit 1 only if the harness itself broke.
  process.exit(harnessOk ? 0 : 1);
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
