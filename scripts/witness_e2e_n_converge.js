#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §N-User Concurrency / §Target Witness
//   W-N10-CONVERGE (§Gate item 2 — relay wiring). Log Mandate: this file writes
//   build/erp/<basename>.log and that log is READ before any pass/fail conclusion — exit code alone is
//   never evidence.
//
// ISSUE THIS PROVES OR DISPROVES: witness_e2e_multiuser_login_fork.js's S5 (2026-07-19) proved two
//   SEPARATE Playwright BrowserContexts (= two real users/devices, separate storage origins) editing the
//   SAME c_order.grandtotal PERMANENTLY diverge, with no sync path and nothing surfaced to either user —
//   "saved (signed)" on both sides, two forever-forked sidecars. This witness reverses that: it wires the
//   engine-proven relay (build/erp/erp_relay_server.js, W-RELAY) + the engine-proven rebase loop
//   (erp_sync_fsm.js rebase() — rewind→apply-canonical-order→replay-pending→re-seal, proven by
//   scripts/test_kernel_relay.js / scripts/test_kernel_rebase.js) into crud_overlay.js's append-only
//   sidecar (branch fix/oplog-append-only, worktree /tmp/wt-oplog-append — layered on top of the F1/F2/F3
//   append-only fix, commit 49798d2) via a new erp_sync_relay.js transport module + a real #erp-sync-pill
//   UI button. Do the SAME two contexts now converge to ONE identical signed chain tip with BOTH
//   contributed ops present (no silent loss)? A DISPROOF (tips still differ, or an op vanishes) is an
//   equally valid, equally reported result — this file does not fake a pass.
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md): both edits are page.fill()+page.click()
//   on the real #idmp-inline-mount field + the real Save button — the SAME real deep-link
//   (?login=SuperUser&window=143&record=101) + Save pattern S3/S4/S5 already proved owner-gate-clean, with
//   &relay=<url> appended so crud_overlay.js's sidecar picks up the relay this session spins up. The Sync
//   step is a REAL page.click('#erp-sync-pill') — not a page.evaluate() shortcut. The only page.evaluate()
//   calls in this file READ already-persisted IndexedDB state via the app's own published read-only API
//   (window.__crud.kernelDb() / core.tipValues()) — same convention as witness_e2e_crud_blob_race.js /
//   witness_e2e_multiuser_login_fork.js. NEVER used to fake a commit or a sync.
//
// SCOPE: N=2 first (S5's exact shape — same order, same field, conflicting values, real UI clicks). N is
//   extended to 10 only if N=2 is clean; a solid, honest N=2 result beats a flaky N=10 (per the assigning
//   prompt's own instruction). ROOT below points at the FIXED worktree (/tmp/wt-oplog-append), NOT the
//   live bim-ootb checkout — this witness proves the WORKTREE's wiring, which has not been merged/pushed.
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_n_converge.js  (from bim-compiler) — then READ
//   build/erp/witness_e2e_n_converge.log before ANY pass/fail conclusion.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = '/tmp/wt-oplog-append';   // the FIXED worktree (branch fix/oplog-append-only) — NOT live bim-ootb
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
var RELAY = require(path.join(__dirname, '..', 'build', 'erp', 'erp_relay_server.js'));

var fails = 0, totalAssertions = 0;
function verdict(ok, label, detail) { totalAssertions++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
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
          if (Date.now() - start > (timeoutMs || 12000)) return reject(new Error('[' + tag + '] timeout waiting for ' + regexes.join(' | ')));
          setTimeout(poll, 100);
        })();
      });
    }
  };
}

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
function waitForCrudOutcome(waiter, table, timeoutMs) {
  var rxPersist = new RegExp('§CRUD-PERSIST key=' + table + ' ');
  var rxReject = new RegExp('§CRUD-GATE key=' + table + ' ownerGated=Y verdict=REJECT');
  return waiter.wait([rxPersist, rxReject], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    return { committed: false, reason: 'owner-gate REJECT', line: r.line };
  });
}
function clickSync(page, waiter, tag) {
  return page.click('#erp-sync-pill').then(function () {
    return waiter.wait([/§SYNC_RELAY syncNow applied=/], 15000);
  }).then(function (r) { console.log('   §SYNC-CLICK ctx=' + tag + ' ' + r.line); return r; });
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
  var BASE_URL = 'http://localhost:' + port + '/erp/idempiere.html';

  var RELAY_PORT = 28140 + (process.pid % 500);   // well clear of :8399 (standing bim-ootb sandbox, reference_bim_ootb_sandbox.md) and :8140-8539 (other relay witnesses)
  var PERSIST = '/tmp/n_converge_relay_' + process.pid + '.jsonl';
  try { fs.unlinkSync(PERSIST); } catch (e) {}
  var relaySrv = RELAY.createRelayServer({ port: RELAY_PORT, persistPath: PERSIST });
  await relaySrv.listen();
  var RELAY_URL = relaySrv.url;
  console.log('   §RELAY-UP url=' + RELAY_URL);

  var browser = await reqPw().chromium.launch();
  try {
    console.log('\n═══ W-N-CONVERGE — reversing S5: two SEPARATE BrowserContexts, same order, relay-wired sync ═══\n');
    var TABLE = 'c_order', ID = 101;
    var N = Number(process.env.N_CONVERGE || 2);   // S5's exact shape at N=2; N=10 stretch via N_CONVERGE=10
    var DEEP_URL = BASE_URL + '?login=SuperUser&window=143&record=101&relay=' + encodeURIComponent(RELAY_URL);

    var ctxs = [], pages = [], waiters = [];
    for (var i = 0; i < N; i++) {
      var c = await browser.newContext(); ctxs.push(c);
      var p = await c.newPage(); pages.push(p);
      waiters.push(mkWaiter(p, 'ctx' + (i + 1)));
    }

    // ── each context independently edits + saves the SAME order/field — real UI clicks only ──
    var vals = []; for (var vi = 0; vi < N; vi++) vals.push((700000 + vi * 11).toFixed(2));
    for (var j = 0; j < N; j++) {
      await pages[j].goto(DEEP_URL, { waitUntil: 'load' });
      await pages[j].waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
      // confirm the relay-wiring actually loaded on this page before trusting anything downstream
      var loaded = await waiters[j].wait([/§SYNC_RELAY_LOADED/], 10000);
      log('ctx=' + (j + 1) + ' ' + loaded.line);
      verdict(/url=/.test(loaded.line), 'ctx=' + (j + 1) + ' erp_sync_relay.js picked up the ?relay= param', loaded.line);

      await pages[j].fill('#idmp-inline-mount [data-col="grandtotal"]', vals[j]);
      await pages[j].click('#idmp-toolbar button[title="Save (Alt+S)"]');
      var out = await waitForCrudOutcome(waiters[j], TABLE, 15000);
      console.log('   §N-CONVERGE ctx=' + (j + 1) + ' wrote=' + vals[j] + ' committed=' + out.committed);
      verdict(out.committed === true, 'ctx=' + (j + 1) + ' real UI Save commit reported success', out.line);
      // The auto push-on-commit (_sidePersist → _relayPush) LOGS BEFORE §CRUD-PERSIST (its own promise
      // chain resolves the push first, see crud_overlay.js _commitCrudSealed) — so waitForCrudOutcome's
      // cursor-based wait() above already consumed past it. Scan the FULL line buffer instead of the
      // forward-only cursor to find it (this is a witness-side scan-order fix, not a product wait).
      var pushLine = waiters[j].lines.filter(function (l) { return /§SYNC_RELAY push accepted=/.test(l); }).pop();
      verdict(!!pushLine, 'ctx=' + (j + 1) + ' auto push-on-commit reached the relay', pushLine || 'no push line seen in console log');
    }

    // ── PRE-SYNC divergence check — the S5 baseline this witness reverses ──
    var preTips = [];
    for (var k = 0; k < N; k++) { var f = await readSidecar(pages[k], TABLE, ID); preTips.push(f.tip); console.log('   §PRE-SYNC ctx=' + (k + 1) + ' tip=' + f.tip + ' ops=' + f.ops); }
    verdict(new Set(preTips).size === N, 'PRE-SYNC — tips DIVERGE across ' + N + ' contexts before any sync click (the S5 baseline)', 'tips=' + JSON.stringify(preTips));

    // ── SYNC — real #erp-sync-pill click on each context. Mirrors test_kernel_relay.js's own proven
    //    convergence dance (sync every device, then sync again) so the FIRST context to sync — which
    //    could not yet see a LATER context's push — catches up on the second pass too. ──
    for (var s1 = 0; s1 < N; s1++) await clickSync(pages[s1], waiters[s1], String(s1 + 1));
    for (var s2 = 0; s2 < N; s2++) await clickSync(pages[s2], waiters[s2], String(s2 + 1) + 'b');

    // ── POST-SYNC convergence check — the reversal ──
    var finals = [];
    for (var m = 0; m < N; m++) {
      var ff = await readSidecar(pages[m], TABLE, ID);
      finals.push(ff);
      console.log('   §CONVERGE ctx=' + (m + 1) + ' tip=' + ff.tip + ' ops=' + ff.ops + ' grandtotal=' + (ff.fields && ff.fields.grandtotal));
    }

    var tipsEqual = finals.every(function (f) { return f.ok && f.tip === finals[0].tip; });
    var opsPerCtx = finals.map(function (f) { return f.ops; });
    var totalOps = finals[0].ops;
    var opsConsistent = finals.every(function (f) { return f.ops === totalOps; });
    var expectedOps = N;   // N contexts × 1 single-field write each (no fan-out group on this path)
    var lost = expectedOps - totalOps;

    verdict(tipsEqual, 'POST-SYNC — ALL ' + N + ' contexts converge to the IDENTICAL signed chain tip',
      'tips=' + JSON.stringify(finals.map(function (f) { return f.tip; })));
    verdict(opsConsistent, 'POST-SYNC — every context sees the SAME op count (no per-context skew)', 'opsPerCtx=' + JSON.stringify(opsPerCtx));
    verdict(totalOps === expectedOps, 'POST-SYNC — total ops == ' + expectedOps + ' (both contributions present, none lost)', 'totalOps=' + totalOps + ' expected=' + expectedOps);

    var verifyOk = finals.every(function (f) { return f.tip !== 'NO-SIDE'; });
    console.log('\n   §N-CONVERGE contexts=' + N + ' tipsEqual=' + tipsEqual + ' totalOps=' + totalOps + ' lost=' + lost);

    for (var z = 0; z < N; z++) await ctxs[z].close();
  } finally {
    await browser.close();
    server.close();
    await relaySrv.close();
  }

  console.log('\n' + (fails === 0
    ? '🟢 W-N-CONVERGE ' + totalAssertions + '/' + totalAssertions + ' PASS'
    : '🔴 ' + fails + '/' + totalAssertions + ' FAILED — read the lines above before concluding (Log Mandate); a 🔴 here means the relay wiring did NOT close S5s gap as designed, which is a valid, reportable shortfall, not a harness defect.')
    + '\n');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
