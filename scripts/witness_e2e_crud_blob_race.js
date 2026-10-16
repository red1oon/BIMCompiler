#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §Spec S2/S3/S4.
//
// ISSUE IT PROVES OR DISPROVES (names it, per CLAUDE.md "tests expose issues"):
//   bim-ootb erp/crud_overlay.js `_sidePersist()` (~line 1632) does an UNCONDITIONAL whole-sql.js-DB
//   export + `put(buf, SIDE_KEY)` into ONE fixed IndexedDB record (glassbowl_kernel_ops/kernel_ops.db).
//   `withSidecar()` (~line 1647) hydrates the in-memory `SIDE` database ONCE per page load and is
//   MEMOIZED FOREVER after (`if (SIDE) { cb(SIDE); return; }`, line 1648) — it never re-reads IndexedDB
//   on a later call. So: if tab A and tab B of ONE BrowserContext (shared IndexedDB) both hydrate SIDE
//   at page-open, A edits+saves (blob now contains A's op), then B — STILL holding its OWN pre-A
//   in-memory SIDE — edits+saves, B's export() is taken from B's stale in-memory state and the
//   unconditional put() OVERWRITES A's already-persisted blob wholesale. PREDICTED FROM READING THE
//   CODE (prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §Current State), NOT previously observed in a real
//   browser. This witness drives the REAL product UI (erp/idempiere.html, real crud_overlay.js write
//   path) with two real Playwright tabs of one BrowserContext to find out which way it actually goes.
//   A DISPROOF (both edits survive) is an equally valid, equally reported result — this file does not
//   bend the test to manufacture the predicted failure.
//
// WHAT IT PROVES (each NAMED, per §Witnesses table):
//   S2 / W-SIDECAR-HYDRATE          — two tabs of one context hydrate the IDENTICAL starting blob (same
//                                     op count, same chain tip) before either edits anything.
//   S3 / W-CRUD-BLOB-RACE-DISJOINT  — tab A edits c_order.description, tab B edits c_order.grandtotal
//                                     (DIFFERENT columns, same row), both save. A THIRD tab (fresh
//                                     hydrate) then reads the sidecar tip: are BOTH edits present, or did
//                                     B's blob-overwrite silently drop A's already-committed op?
//   S4 / W-CRUD-BLOB-RACE-CONFLICT — tab A and tab B BOTH edit c_order.grandtotal (SAME column), A saves
//                                     v1 first, B (still pre-A) saves v2 second. Does anything reject
//                                     B's write (owner-gate/CAS), or does it silently commit and win?
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md — every prior concurrency proof in this
//   repo was internals-only; this is the missing UI-driven layer): login is the app's own documented
//   `?login=<name>` zero-click entry point (erp/idempiere.html `_tryAutoLogin`, the SAME `loginStep1→2`
//   funnel a manual picker click would reach — not a test backdoor); the record is opened via the app's
//   own documented `?window=<id>&record=<pk>` deep link (`_landOnRecord`, the same mechanism erp.html's
//   globe long-press uses). The EDIT itself is driven with page.fill()/page.click() on the real inline
//   CRUD-ring `<input data-col="...">` fields and the real, VISIBLE `Save` button (see "Save button
//   note" below) — the exact DOM path `saveForm()`/`commitCrud()` wires to.
//   NO page.evaluate() reaches into crud_overlay.js internals to fake a commit anywhere in this file.
//   The only page.evaluate() calls READ already-persisted IndexedDB state via the app's own PUBLISHED
//   read-only host API (`window.__crud.kernelDb()` / `window.__crud.core.tipValues()` — the exact calls
//   idempiere.html itself makes for `_countUserOpsForClient`/`§CHANGELOG`) — observation, not a write.
//   Save button note: idempiere.html deliberately hides crud_overlay's own inline toolbar
//   (`#idmp-inline-mount .ic-bar { display:none !important; }`, idempiere.html:124 — the real iDempiere
//   chrome supplies its OWN Save, not a duplicate) and `_formSave()` (idempiere.html:1617) forwards a
//   click on the REAL, VISIBLE `#idmp-toolbar` Save button to the hidden inline one. This witness clicks
//   the VISIBLE toolbar button (`#idmp-toolbar button[title="Save (Alt+S)"]`) — the one a real user
//   actually sees and presses — never the hidden `.ic-vb[data-v="save"]` directly.
//
// WHY user=SuperUser, window=143 (Sales Order), record=101 (documentno 80001): c_order id=101's
//   CreatedBy=100=SuperUser (extracted via sqlite3 on erp/ad_seed.db) and c_order is ownerGated with
//   ownerCol defaulting to 'createdby' (crud_ops.json carries no explicit ownerCol) — so the owner-gate
//   passes (actor===owner) and the test exercises the BLOB race, not an unrelated owner-REJECT. SuperUser
//   auto-picks role 102 "GardenWorld Admin" (client 11) via `rolesForUser`'s `ORDER BY r.Name` — verified
//   directly against idmp_session.js + ad_seed.db (not assumed) — which carries AD_Window_Access to
//   window 143. `claimed_by` (the declared "cas" column) has NO actual column in c_order in this seed
//   (`PRAGMA table_info` confirms) so `casCurrent`/`casExpected` both fold to null — no spurious CAS
//   reject (verified by reading `_gateCtxFor`/`gateOp`, not assumed).
//
// NON-INVENT: c_order id=101 (documentno 80001) is a REAL row in the shipped `erp/ad_seed.db` — not
//   synthesized. Field edits write real, distinct string values so a later read can only match if that
//   SPECIFIC tab's write actually landed (no shared/ambiguous fixture value).
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_crud_blob_race.js  (from bim-compiler) — then
//   READ build/erp/witness_e2e_crud_blob_race.log before ANY pass/fail conclusion (Log Mandate).
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
// ROOT = bim-ootb, NOT this repo — the live product UI under test (erp/idempiere.html, erp/crud_overlay.js,
// erp/ad_seed.db) lives there; bim-compiler only hosts this witness script + its log (CLAUDE.md repo map).
// OPLOG_WITNESS_ROOT override — Implementing ERP_OPLOG_APPEND_ONLY_FIX.md §WITNESS (BEFORE/AFTER pair):
// lets the SAME script run against the live bim-ootb checkout (BEFORE, unfixed) or a fix worktree (AFTER,
// e.g. /tmp/wt-oplog-append) without duplicating the file. Defaults to the live checkout, unchanged.
var ROOT = process.env.OPLOG_WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function log(m) { console.log('   ' + m); }

// mkWaiter — capture every console line from a page into a growing array + a cursor-based waiter that
// polls for a line matching one of several regexes (first match wins), without missing lines emitted
// between polls (the array is appended by the 'console' event listener continuously, not on-demand).
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
          if (Date.now() - start > (timeoutMs || 12000)) return reject(new Error('[' + tag + '] timeout waiting for ' + regexes.join(' | ')));
          setTimeout(poll, 100);
        })();
      });
    }
  };
}

// waitForCrudOutcome — after clicking Save, resolve {committed:true} on §CRUD-PERSIST, or
// {committed:false, reason} on §CRUD-GATE REJECT / §CRUD no-op — the three real terminal states saveForm()
// can reach for a CRUD_UPDATE on an already-existing, owner-matched record.
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
function gateVerdictFor(waiter, table) {
  // scan already-captured lines for this tab's most recent §CRUD-GATE verdict (PASS or REJECT); absent → 'absent'.
  var rx = new RegExp('§CRUD-GATE key=' + table + ' ownerGated=Y verdict=(PASS|REJECT)');
  for (var i = waiter.lines.length - 1; i >= 0; i--) { var m = rx.exec(waiter.lines[i]); if (m) return m[1]; }
  return 'absent';
}

// readSidecar — OBSERVATION ONLY (Log Mandate / harness spec: "reading IndexedDB state for the final
// verification step is fine, that's observation, not faking a write"). Uses the app's own PUBLISHED
// read-only host API, the same calls idempiere.html itself makes.
function readSidecar(page, table, id) {
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
  // real product deep link: ?login= is idempiere.html's own zero-click demo entry (_tryAutoLogin → the SAME
  // applySession() any manual loginStep0→1→2 click reaches); ?window=&record= is the SAME deep link erp.html's
  // globe long-press drives (_landOnRecord). c_order id=101 (documentno 80001), window 143 = Sales Order.
  var URL_ = 'http://localhost:' + port + '/erp/idempiere.html?login=SuperUser&window=143&record=101';
  var TABLE = 'c_order', ID = 101;
  var browser = await reqPw().chromium.launch();
  var totalAssertions = 0;

  try {
    // ════════════════════════════════════════════════════════════════════
    // S2 — W-SIDECAR-HYDRATE: two tabs, one context, identical starting blob before either edits.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ S2 / W-SIDECAR-HYDRATE — two tabs of one BrowserContext hydrate the same starting blob ═══\n');
    var ctx2 = await browser.newContext();
    var s2A = await ctx2.newPage(), s2B = await ctx2.newPage();
    var wA2 = mkWaiter(s2A, 'S2-A'), wB2 = mkWaiter(s2B, 'S2-B');
    await s2A.goto(URL_, { waitUntil: 'load' });
    await s2A.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    await s2B.goto(URL_, { waitUntil: 'load' });
    await s2B.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    var hA = await readSidecar(s2A, TABLE, ID), hB = await readSidecar(s2B, TABLE, ID);
    console.log('   §E2E-HYDRATE tab=A tip=' + hA.tip + ' ops=' + hA.ops);
    console.log('   §E2E-HYDRATE tab=B tip=' + hB.tip + ' ops=' + hB.ops);
    totalAssertions++; verdict(hA.ok && hB.ok, 'S2 both tabs hydrated a real sidecar (kernelDb present)', 'A.ok=' + hA.ok + ' B.ok=' + hB.ok);
    totalAssertions++; verdict(hA.tip === hB.tip && hA.ops === hB.ops,
      'S2 tab A and tab B hydrate the IDENTICAL starting blob (same tip, same op count)',
      'A={tip:' + hA.tip + ',ops:' + hA.ops + '} B={tip:' + hB.tip + ',ops:' + hB.ops + '}');
    await ctx2.close();

    // ════════════════════════════════════════════════════════════════════
    // S3 — W-CRUD-BLOB-RACE-DISJOINT: A edits description, B edits grandtotal (different columns).
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ S3 / W-CRUD-BLOB-RACE-DISJOINT — disjoint-field cross-tab save, then a THIRD tab reads the tip ═══\n');
    var ctx3 = await browser.newContext();
    var s3A = await ctx3.newPage(), s3B = await ctx3.newPage();
    var wA3 = mkWaiter(s3A, 'S3-A'), wB3 = mkWaiter(s3B, 'S3-B');
    await s3A.goto(URL_, { waitUntil: 'load' });
    await s3A.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    await s3B.goto(URL_, { waitUntil: 'load' });
    await s3B.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });   // B hydrates BEFORE A edits — this is the "Case 1" precondition

    var descVal = 'E2E-S3-desc-' + Date.now();
    await s3A.fill('#idmp-inline-mount [data-col="description"]', descVal);
    await s3A.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outA3 = await waitForCrudOutcome(wA3, TABLE, 15000);
    console.log('   §E2E-SAVE tab=A field=description committed=' + outA3.committed + (outA3.reason ? ' reason=' + outA3.reason : ''));

    var gtVal3 = '4242.42';
    await s3B.fill('#idmp-inline-mount [data-col="grandtotal"]', gtVal3);
    await s3B.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outB3 = await waitForCrudOutcome(wB3, TABLE, 15000);
    console.log('   §E2E-SAVE tab=B field=grandtotal committed=' + outB3.committed + (outB3.reason ? ' reason=' + outB3.reason : ''));

    totalAssertions++; verdict(outA3.committed === true, 'S3 tab A (description) commit reported success by the app', outA3.line);
    totalAssertions++; verdict(outB3.committed === true, 'S3 tab B (grandtotal) commit reported success by the app', outB3.line);

    // THIRD tab — fresh page load, fresh hydrate from whatever IndexedDB now actually holds.
    var s3C = await ctx3.newPage();
    await s3C.goto(URL_, { waitUntil: 'load' });
    await s3C.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    var fin3 = await readSidecar(s3C, TABLE, ID);
    var present3 = Object.keys(fin3.fields || {}).sort();
    console.log('   §E2E-VERIFY-FINAL fields_present=' + present3.join(',') + ' expected=description,grandtotal' +
      ' values=' + JSON.stringify(fin3.fields));
    var descOk = fin3.fields && String(fin3.fields.description) === descVal;
    var gtOk = fin3.fields && String(fin3.fields.grandtotal) === gtVal3;
    totalAssertions++; verdict(descOk && gtOk,
      'S3 ISSUE DISPROVED: BOTH disjoint-field edits survived the cross-tab blob race (no silent loss)',
      'description(' + descOk + ')=' + (fin3.fields && fin3.fields.description) + ' grandtotal(' + gtOk + ')=' + (fin3.fields && fin3.fields.grandtotal));
    if (!(descOk && gtOk)) {
      log('🔴 S3 ISSUE CONFIRMED: the predicted blob-clobber occurred — ' + (descOk ? '' : 'description LOST ') + (gtOk ? '' : 'grandtotal LOST ') + '(final ops=' + fin3.ops + ')');
    }
    await ctx3.close();

    // ════════════════════════════════════════════════════════════════════
    // S4 — W-CRUD-BLOB-RACE-CONFLICT: A and B both edit grandtotal; A saves v1, B (stale) saves v2.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ S4 / W-CRUD-BLOB-RACE-CONFLICT — same-column cross-tab conflict, A first then stale B ═══\n');
    var ctx4 = await browser.newContext();
    var s4A = await ctx4.newPage(), s4B = await ctx4.newPage();
    var wA4 = mkWaiter(s4A, 'S4-A'), wB4 = mkWaiter(s4B, 'S4-B');
    await s4A.goto(URL_, { waitUntil: 'load' });
    await s4A.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    await s4B.goto(URL_, { waitUntil: 'load' });
    await s4B.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });   // B hydrates BEFORE A edits — the "Case 2" precondition

    var v1 = '1111.11';
    await s4A.fill('#idmp-inline-mount [data-col="grandtotal"]', v1);
    await s4A.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outA4 = await waitForCrudOutcome(wA4, TABLE, 15000);
    var gvA = gateVerdictFor(wA4, TABLE);
    console.log('   §E2E-SAVE tab=A grandtotal=' + v1 + ' committed=' + outA4.committed + ' gateVerdict=' + gvA);
    totalAssertions++; verdict(outA4.committed === true, 'S4 tab A (grandtotal=' + v1 + ', first writer) commits', outA4.line);

    var v2 = '2222.22';
    await s4B.fill('#idmp-inline-mount [data-col="grandtotal"]', v2);
    await s4B.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outB4 = await waitForCrudOutcome(wB4, TABLE, 15000);
    var gvB = gateVerdictFor(wB4, TABLE);
    console.log('   §E2E-SAVE tab=B grandtotal=' + v2 + ' committed=' + outB4.committed + ' gateVerdict=' + gvB);
    // S4 spec expectation (predicted BY EXTRACTION, not assumed — §Current State/§Concurrency Model Case 2):
    // claimed_by is a per-USER lease, not a version column; same actor both tabs ⇒ owner check passes trivially,
    // no version exists to CAS against ⇒ gate PASSes, B's write is accepted with no rejection.
    totalAssertions++; verdict(gvB === 'PASS' || gvB === 'absent',
      'S4 tab B (grandtotal=' + v2 + ', same-actor conflicting write) is NOT rejected by the owner/CAS gate (predicted: PASS, since claimed_by is a per-user lease, not a version column)',
      'gateVerdict=' + gvB);

    var s4C = await ctx4.newPage();
    await s4C.goto(URL_, { waitUntil: 'load' });
    await s4C.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    var fin4 = await readSidecar(s4C, TABLE, ID);
    console.log('   §E2E-VERIFY-FINAL grandtotal=' + (fin4.fields && fin4.fields.grandtotal) + ' ops=' + fin4.ops + ' tip=' + fin4.tip);
    var finalIsB = fin4.fields && String(fin4.fields.grandtotal) === v2;
    var finalIsA = fin4.fields && String(fin4.fields.grandtotal) === v1;
    totalAssertions++; verdict(finalIsB,
      'S4 final persisted grandtotal = B\'s value (' + v2 + ') — last-tab-to-save silently wins, matching the predicted whole-blob-overwrite mechanism',
      'final=' + (fin4.fields && fin4.fields.grandtotal) + ' (A wrote ' + v1 + ', B wrote ' + v2 + ')');
    if (finalIsA) log('🔴 S4 DISPROVED as predicted: final value is A\'s (' + v1 + '), not B\'s — B\'s write did NOT silently win; something preserved A\'s commit.');
    await ctx4.close();
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n' + (fails === 0
    ? '✅ W-CRUD-BLOB-RACE ' + totalAssertions + '/' + totalAssertions + ' PASS'
    : '❌ ' + fails + '/' + totalAssertions + ' 🔴 lines above — read them: a 🔴 on an "ISSUE DISPROVED"/"NOT rejected" assertion means the predicted bug DID reproduce; report exactly which (this is a VALID, informative result per this file\'s header, not a harness defect).')
    + '\n');
  process.exit(fails ? 1 : 0);   // standard project convention (Log Mandate: the exit code alone is never the
                                  // evidence — read the §E2E-VERIFY-FINAL / 🟢🔴 lines above before concluding).
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
