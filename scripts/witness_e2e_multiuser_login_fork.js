#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §Spec S1/S5. Scope is EXACTLY these two
//   items (S2/S3/S4 are DONE — witness_e2e_crud_blob_race.js, bim-compiler commit b6d2cb23a — do NOT
//   re-run or re-litigate them here). Log Mandate: this file writes build/erp/<basename>.log and that
//   log is READ before any pass/fail conclusion — exit code alone is never evidence.
//
// ISSUE EACH PART PROVES OR DISPROVES:
//   S1 / W-MULTIUSER-LOGIN   — can two SEPARATE Playwright BrowserContexts each independently drive the
//     REAL click-through login funnel (loginStep0 tenant → loginStep1 user → loginStep2 role/org → the
//     real #idmp-login-ok button) on erp/idempiere.html and land on two DISTINCT real AD_User identities
//     (window.APP.actor)? Multi-user login was asserted "real, not stubbed" by reading the source
//     (§Current State, prompts file) but never driven end-to-end by two real browser sessions before
//     this witness. A DISPROOF (actors collide, or the flow silently degrades to one shared session) is
//     an equally valid, equally reported result.
//   S5 / W-CROSS-DEVICE-FORK — two SEPARATE BrowserContexts (Case 3: separate storage origin+context =
//     separate real users/devices, no shared IndexedDB — unlike S3/S4's two-tabs-one-context case) each
//     independently edit the SAME c_order row. Predicted by extraction (§Concurrency Model Case 3, not
//     open): no sync path exists between crud_overlay.js sidecars across contexts today (erp_sync.js /
//     erp_relay_server.js are engine-proven but NOT wired in) — so the two sidecars should diverge
//     PERMANENTLY and SILENTLY, with nothing surfaced to either user. This witness makes that visible
//     in the real product UI rather than asserting it from the source read.
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md): S1 drives the actual click-through
//   login funnel — page.click() on real #idmp-login-clients / #idmp-login-users rows and the real
//   #idmp-login-ok button — NOT the `?login=` zero-click shortcut (that shortcut is reserved by this
//   same spec's own §Current State note for demo/kiosk convenience; S1's job is specifically to prove
//   the CLICKED flow reaches two distinct real actors). S5 reuses the exact `?login=SuperUser&window=
//   143&record=101` deep-link + real page.fill()/page.click() Save pattern already proven correct and
//   owner-gate-clean by witness_e2e_crud_blob_race.js (S3/S4) — chosen deliberately for S5 too: using
//   the SAME real actor (SuperUser) in BOTH separate contexts isolates the variable under test (storage-
//   partition divergence, Case 3's actual mechanism) from an unrelated confound (a non-owner actor would
//   get REJECTED by the owner-gate before ever reaching the sidecar-fork question S5 is about — that
//   would be a different, already-covered gate behaviour, not Case 3). S1 already independently proves
//   two-distinct-actor login works; S5 does not need to re-prove it to test the storage-isolation claim,
//   which is orthogonal to WHO is logged in — it is the BrowserContext boundary being tested, not
//   identity. NO page.evaluate() fakes a commit anywhere in this file. The only page.evaluate() calls
//   READ already-persisted IndexedDB state via the app's own published read-only host API
//   (`window.__crud.kernelDb()` / `core.tipValues()`) or read `window.APP.actor` post-login (both
//   observation, never a write) — same convention as witness_e2e_crud_blob_race.js.
//
// NON-INVENT: GardenAdmin (AD_User_ID 101) and GardenUser (AD_User_ID 102) are REAL rows in the shipped
//   `erp/ad_seed.db`, client 11 (GardenWorld) — verified directly via sqlite3 (`ad_user_roles` join
//   `ad_user`/`ad_role`) before writing this file, not assumed: these are the ONLY two GardenWorld users
//   with `hasRoles=true` (Joe Sales/Carl Boss/Henry Seed have zero ad_user_roles rows and render as
//   disabled, unclickable rows in loginStep1 — confirmed by the same query). c_order id=101
//   (documentno 80001) is the same real row S3/S4 already used.
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_multiuser_login_fork.js  (from bim-compiler) —
//   then READ build/erp/witness_e2e_multiuser_login_fork.log before ANY pass/fail conclusion.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = '/home/red1/bim-ootb';   // live product UI lives there — bim-compiler only hosts this witness
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

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

// mkSurfaceWatcher — instruments a page (BEFORE any navigation, via addInitScript) to observe every
// console warning/error AND every toast the real UI shows (crud_overlay.js's own `.crud-toast` DOM
// element, via a MutationObserver — observation of the real UI, not a fake write/read of internals).
// This is what S5's "no surfaced warning" assertion is checked against.
function mkSurfaceWatcher(page) {
  var warnErr = [], toasts = [];
  page.on('console', function (m) { if (m.type() === 'warning' || m.type() === 'error') warnErr.push(m.text()); });
  page.on('pageerror', function (e) { warnErr.push('PAGEERROR: ' + e.message); });
  return {
    warnErr: warnErr, toasts: toasts,
    install: function () {
      return page.addInitScript(function () {
        window.__toasts = [];
        var mo = new MutationObserver(function (muts) {
          muts.forEach(function (mu) {
            (mu.addedNodes || []).forEach(function (n) {
              if (n.nodeType === 1 && n.classList && n.classList.contains('crud-toast')) window.__toasts.push(n.textContent);
            });
          });
        });
        // body may not exist yet this early; observe once it does.
        var attach = function () { if (document.body) mo.observe(document.body, { childList: true }); else setTimeout(attach, 10); };
        attach();
      });
    },
    collectToasts: function () {
      return page.evaluate(function () { return (window.__toasts || []).slice(); }).then(function (t) { toasts.push.apply(toasts, t); return t; });
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
  var rxNoop = new RegExp('§CRUD update key=' + table + '.*no-op');
  return waiter.wait([rxPersist, rxReject, rxNoop], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    if (r.which === 1) return { committed: false, reason: 'owner-gate REJECT', line: r.line };
    return { committed: false, reason: 'no-op (0 changed cols)', line: r.line };
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
  var LOGIN_URL = 'http://localhost:' + port + '/erp/idempiere.html';
  var browser = await reqPw().chromium.launch();

  try {
    // ════════════════════════════════════════════════════════════════════
    // S1 — W-MULTIUSER-LOGIN: two SEPARATE contexts, each driving the REAL click-through login funnel
    //   (tenant → user → role/org → Log In) to two DISTINCT real AD_User identities.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ S1 / W-MULTIUSER-LOGIN — two SEPARATE BrowserContexts, real click-through login ═══\n');

    async function realLogin(page, tag, tenantText, userText) {
      var w = mkWaiter(page, tag);
      await page.goto(LOGIN_URL, { waitUntil: 'load' });
      // loginStep0 (tenant switcher) — surfaces because this seed carries >=2 resident tenants.
      await page.waitForSelector('#idmp-login-step0 .idmp-login-user', { timeout: 20000 });
      await page.click('#idmp-login-clients .idmp-login-user:has-text("' + tenantText + '")');
      // loginStep1 (user list, scoped to the picked tenant)
      await page.waitForSelector('#idmp-login-step1 .idmp-login-user', { timeout: 20000 });
      await page.click('#idmp-login-users .idmp-login-user:has-text("' + userText + '")');
      // loginStep2 (role/org — pre-synced by syncRole() on render) — click the REAL "Log In ›" button.
      await page.waitForSelector('#idmp-login-ok', { timeout: 20000 });
      await page.click('#idmp-login-ok');
      var r = await w.wait([/^§ACTOR login/], 15000);
      var actor = await page.evaluate(function () { return window.APP && window.APP.actor; });
      console.log('   §E2E-LOGIN ctx=' + tag + ' user=' + userText + ' actor=' + actor);
      return { actor: actor, line: r.line, waiter: w };
    }

    var ctx1 = await browser.newContext(), ctx2 = await browser.newContext();
    var page1 = await ctx1.newPage(), page2 = await ctx2.newPage();
    var r1 = await realLogin(page1, '1', 'GardenWorld', 'GardenAdmin');
    var r2 = await realLogin(page2, '2', 'GardenWorld', 'GardenUser');

    verdict(r1.actor != null, 'S1 ctx=1 reached a real logged-in actor (GardenAdmin)', 'actor=' + r1.actor);
    verdict(r2.actor != null, 'S1 ctx=2 reached a real logged-in actor (GardenUser)', 'actor=' + r2.actor);
    verdict(r1.actor !== r2.actor, 'S1 ctx=1 and ctx=2 actor values DIFFER (two genuinely distinct real AD_User identities)',
      'ctx1.actor=' + r1.actor + ' ctx2.actor=' + r2.actor);
    await ctx1.close(); await ctx2.close();

    // ════════════════════════════════════════════════════════════════════
    // S5 — W-CROSS-DEVICE-FORK: two SEPARATE contexts (Case 3, no shared IndexedDB), each independently
    //   edits the SAME c_order row. Predicted: tips diverge, nothing surfaced to either user.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ S5 / W-CROSS-DEVICE-FORK — two SEPARATE BrowserContexts, same order, independent edits ═══\n');
    var TABLE = 'c_order', ID = 101;
    var DEEP_URL = LOGIN_URL + '?login=SuperUser&window=143&record=101';   // same real deep-link S3/S4 proved clean

    var ctxA = await browser.newContext(), ctxB = await browser.newContext();
    var pageA = await ctxA.newPage(), pageB = await ctxB.newPage();
    var surfA = mkSurfaceWatcher(pageA), surfB = mkSurfaceWatcher(pageB);
    await surfA.install(); await surfB.install();
    var wA = mkWaiter(pageA, 'S5-A'), wB = mkWaiter(pageB, 'S5-B');

    await pageA.goto(DEEP_URL, { waitUntil: 'load' });
    await pageA.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });
    await pageB.goto(DEEP_URL, { waitUntil: 'load' });
    await pageB.waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });

    var vA = '7777.77', vB = '8888.88';
    await pageA.fill('#idmp-inline-mount [data-col="grandtotal"]', vA);
    await pageA.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outA = await waitForCrudOutcome(wA, TABLE, 15000);
    console.log('   §E2E-SAVE ctx=1 grandtotal=' + vA + ' committed=' + outA.committed);

    await pageB.fill('#idmp-inline-mount [data-col="grandtotal"]', vB);
    await pageB.click('#idmp-toolbar button[title="Save (Alt+S)"]');
    var outB = await waitForCrudOutcome(wB, TABLE, 15000);
    console.log('   §E2E-SAVE ctx=2 grandtotal=' + vB + ' committed=' + outB.committed);

    verdict(outA.committed === true, 'S5 ctx=1 (SuperUser, device A) commit reported success', outA.line);
    verdict(outB.committed === true, 'S5 ctx=2 (SuperUser, device B) commit reported success', outB.line);

    // let the toast animation finish (2.6s show + 350ms fade) so window.__toasts captures the full text.
    await pageA.waitForTimeout(3200); await pageB.waitForTimeout(3200);
    var toastsA = await surfA.collectToasts(), toastsB = await surfB.collectToasts();

    var finA = await readSidecar(pageA, TABLE, ID), finB = await readSidecar(pageB, TABLE, ID);
    console.log('   §E2E-TIP ctx=1 tip=' + finA.tip + ' ops=' + finA.ops + ' grandtotal=' + (finA.fields && finA.fields.grandtotal));
    console.log('   §E2E-TIP ctx=2 tip=' + finB.tip + ' ops=' + finB.ops + ' grandtotal=' + (finB.fields && finB.fields.grandtotal));
    verdict(finA.ok && finB.ok, 'S5 both contexts have a real sidecar to read', 'A.ok=' + finA.ok + ' B.ok=' + finB.ok);
    verdict(finA.tip !== finB.tip, 'S5 ctx=1 and ctx=2 sidecar tips DIVERGE (predicted: no sync path exists between separate contexts)',
      'tipA=' + finA.tip + ' tipB=' + finB.tip);
    verdict(String(finA.fields && finA.fields.grandtotal) === vA && String(finB.fields && finB.fields.grandtotal) === vB,
      'S5 each context privately kept ITS OWN edit (A=' + vA + ', B=' + vB + ') — a true silent fork, not a merge or a shared last-write-wins',
      'A.grandtotal=' + (finA.fields && finA.fields.grandtotal) + ' B.grandtotal=' + (finB.fields && finB.fields.grandtotal));

    var divergenceRx = /diverg|conflict|fork|stale|clobber|overwrit|out.of.date|mismatch/i;
    var badWarnA = surfA.warnErr.filter(function (t) { return divergenceRx.test(t); });
    var badWarnB = surfB.warnErr.filter(function (t) { return divergenceRx.test(t); });
    var badToastA = toastsA.filter(function (t) { return divergenceRx.test(t); });
    var badToastB = toastsB.filter(function (t) { return divergenceRx.test(t); });
    console.log('   §E2E-NO-SURFACE ctx=1 warn/err=' + JSON.stringify(surfA.warnErr) + ' toasts=' + JSON.stringify(toastsA));
    console.log('   §E2E-NO-SURFACE ctx=2 warn/err=' + JSON.stringify(surfB.warnErr) + ' toasts=' + JSON.stringify(toastsB));
    verdict(badWarnA.length === 0 && badWarnB.length === 0,
      'S5 §E2E-NO-SURFACE — no console warning/error on EITHER page references divergence/conflict/staleness',
      'badWarnA=' + JSON.stringify(badWarnA) + ' badWarnB=' + JSON.stringify(badWarnB));
    verdict(badToastA.length === 0 && badToastB.length === 0,
      'S5 §E2E-NO-SURFACE — no toast shown to EITHER user references divergence/conflict/staleness',
      'badToastA=' + JSON.stringify(badToastA) + ' badToastB=' + JSON.stringify(badToastB));
    verdict(toastsA.some(function (t) { return /saved/i.test(t) && !/REJECT/i.test(t); }) &&
            toastsB.some(function (t) { return /saved/i.test(t) && !/REJECT/i.test(t); }),
      'S5 §E2E-NO-SURFACE — BOTH users instead saw the NORMAL success toast ("saved (signed)") — the UI told both their private edit was fine',
      'toastsA=' + JSON.stringify(toastsA) + ' toastsB=' + JSON.stringify(toastsB));

    await ctxA.close(); await ctxB.close();
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n' + (fails === 0
    ? '✅ W-MULTIUSER-LOGIN-FORK ' + totalAssertions + '/' + totalAssertions + ' PASS'
    : '❌ ' + fails + '/' + totalAssertions + ' 🔴 — read the lines above before concluding (Log Mandate); a 🔴 on a predicted-outcome assertion means the prediction did NOT reproduce, which is a valid, reportable disproof, not a harness defect.')
    + '\n');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
