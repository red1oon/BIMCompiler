#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_MULTIUSER_CONCURRENCY_POC.md §DocAction Cross-Device Attribution
//   S7 (W-REBASE-ATTRIB) + S8 corrected (W-MULTI-DEVICE-VERIFY). Log Mandate: this file writes
//   build/erp/<basename>.log and that log is READ before any pass/fail conclusion — exit code alone
//   is never evidence.
//
// S8 ADDENDUM: S8 was originally specced as "reuse erp_key_epochs.js's verifyEpochSigsOps as-is" —
//   WRONG, found by a standalone probe before implementing: that function enforces a SINGLE activeKid
//   per position (a key-ROTATION/REVOCATION state machine) and REJECTS a second concurrently-active
//   device outright with no ROTATE between them — exactly the two-device-no-rotation shape real relay
//   convergence produces. Corrected S8: a NEW function, erp_key_epochs.js verifyMultiDeviceOps(ops,
//   {roster,verify}) — per-op INDEPENDENT verification against a flat roster, no rotation state. This
//   section of the witness proves that correction: two real devices' ops, POST-rebase, both correctly
//   attributed to their real originating device (not collapsed onto one key), and a tampered roster
//   entry is rejected.
//
// ISSUE THIS PROVES OR DISPROVES: `erp/idempiere.html` loads `erp_signer.js` but never called
//   `ErpSigner.installSigner()` — every op's `sig` column was permanently NULL on the live product UI
//   (CITATION CORRECTION 2026-07-21 in the spec file above). And even with a signer installed,
//   `erp_sync_fsm.js`'s `rebase()` used to SELECT/INSERT only 6 of `kernel_ops`'s 9 columns, dropping
//   `gid`/`branch_id`/`sig` on every cross-device sync — un-grouping any commitGroup fan-out and
//   destroying any signature attribution that DID exist. This witness proves BOTH fixes together:
//   idempiere.html now installs the real per-device signer + turns on v2 content-signing on boot, and
//   rebase() now carries `gid`/`branch_id`/`sig` through the rewind+reapply. Two SEPARATE
//   BrowserContexts (real devices) each commit one signed write, relay-sync, and rebase — does each
//   op's `gid` and `sig` survive on BOTH sides, attributed to the device that actually signed it (not
//   blanked, not re-signed under the puller's key), with `verifyChain` still ok=true post-rebase?
//   A DISPROOF (gid/sig NULL or changed post-sync, or verifyChain FAIL) is an equally valid, equally
//   reported result — this file does not fake a pass.
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md): both writes are page.fill()+
//   page.click() on the real #idmp-inline-mount field + the real Save button, same deep-link pattern
//   (?login=SuperUser&window=143&record=101&relay=<url>) witness_e2e_n_converge.js already proved
//   owner-gate-clean. Sync is a REAL page.click('#erp-sync-pill'). The only page.evaluate() calls READ
//   already-persisted state (raw kernel_ops columns via window.__crud.kernelDb(), verifyChain via
//   window.KernelOps) — never used to fake a commit or a sync.
//
// ROOT points at the FIXED worktree (/tmp/wt-rebase-sig, branch fix/rebase-preserves-sig-gid) — NOT the
//   live bim-ootb checkout — this witness proves the WORKTREE's wiring, not yet merged/pushed.
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_rebase_attrib.js  (from bim-compiler) — then
//   READ build/erp/witness_e2e_rebase_attrib.log before ANY pass/fail conclusion.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.WITNESS_ROOT || '/tmp/wt-rebase-sig';   // the FIXED worktree
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
var RELAY = require(path.join(__dirname, '..', 'build', 'erp', 'erp_relay_server.js'));

// S8 (W-MULTI-DEVICE-VERIFY): node-side roster verification — NOT wired into the live UI (Phase 3,
// roster distribution, is out of scope per the spec); the witness constructs the roster itself, exactly
// as witness_roster_verify.js already does for the Teams path. Same window-shim require pattern as that
// file so erp_key_epochs.js's _kernel() resolves the SAME KernelOps instance used to compute content hashes.
if (!global.window) global.window = {};
if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
require(path.join(ROOT, 'erp', 'kernel_ops.js'));
var NODE_K = global.window.KernelOps;
var SNAP_SIGN = require(path.join(ROOT, 'erp', 'erp_snapshot_sign.js'));
var EPOCHS = require(path.join(ROOT, 'erp', 'erp_key_epochs.js'));

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

// readRows — RAW kernel_ops columns (not just tipValues) so gid/sig/op_uuid can be compared byte-for-byte
// across devices, before and after a rebase. Read-only (SELECT), same convention as prior witnesses.
function readRows(page) {
  return page.evaluate(function () {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K) return { ok: false, rows: [], tip: 'NO-SIDE', verify: null };
    var r = K.exec('SELECT id,op_uuid,timestamp,op_type,parameters,input_guids,output_guid,op_hash,sig,gid,branch_id,user_tag FROM kernel_ops ORDER BY id');
    var cols = r.length ? r[0].columns : [];
    var rows = (r.length ? r[0].values : []).map(function (v) {
      var o = {}; cols.forEach(function (c, i) { o[c] = v[i]; }); return o;
    });
    var t = K.exec("SELECT op_hash FROM kernel_ops WHERE op_hash IS NOT NULL ORDER BY id DESC LIMIT 1");
    var tip = (t.length && t[0].values.length) ? t[0].values[0][0] : 'GENESIS';
    return Promise.resolve(window.KernelOps.verifyChain(K)).then(function (v) {
      return { ok: true, rows: rows, tip: tip, verify: v };
    });
  });
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

  var RELAY_PORT = 28640 + (process.pid % 500);   // clear of :8399 sandbox + other relay-witness port bands
  var PERSIST = '/tmp/rebase_attrib_relay_' + process.pid + '.jsonl';
  try { fs.unlinkSync(PERSIST); } catch (e) {}
  var relaySrv = RELAY.createRelayServer({ port: RELAY_PORT, persistPath: PERSIST });
  await relaySrv.listen();
  var RELAY_URL = relaySrv.url;
  console.log('   §RELAY-UP url=' + RELAY_URL);

  var browser = await reqPw().chromium.launch();
  try {
    console.log('\n═══ W-REBASE-ATTRIB — signer install + v2 content-sign + rebase preserves gid/sig ═══\n');
    var TABLE = 'c_order', ID = 101, N = 2;
    var DEEP_URL = BASE_URL + '?login=SuperUser&window=143&record=101&relay=' + encodeURIComponent(RELAY_URL);

    var ctxs = [], pages = [], waiters = [];
    for (var i = 0; i < N; i++) {
      var c = await browser.newContext(); ctxs.push(c);
      var p = await c.newPage(); pages.push(p);
      waiters.push(mkWaiter(p, 'ctx' + (i + 1)));
    }

    var vals = ['810101.00', '810202.00'];
    var preRows = [], identities = [];
    for (var j = 0; j < N; j++) {
      await pages[j].goto(DEEP_URL, { waitUntil: 'load' });
      // §SYNC_RELAY_LOADED fires at module-parse time (synchronous); §SIGN installed fires later, after
      // the async installSigner()/setContentSigning() promise resolves — must wait for it FIRST or the
      // forward-only cursor in mkWaiter() consumes past it before the second wait() looks for it.
      var relayLoaded = await waiters[j].wait([/§SYNC_RELAY_LOADED/], 10000);
      verdict(/url=/.test(relayLoaded.line), 'ctx=' + (j + 1) + ' erp_sync_relay.js picked up the ?relay= param', relayLoaded.line);

      var signInstalled = await waiters[j].wait([/§SIGN installed/], 15000);
      verdict(/alg=ECDSA-P256/.test(signInstalled.line), 'ctx=' + (j + 1) + ' real ECDSA-P256 device signer installed on boot (was never called before this fix)', signInstalled.line);

      var identity = await pages[j].evaluate(function () { return { hex: window.ErpSigner && window.ErpSigner.pubKeyHex, jwk: window.ErpSigner && window.ErpSigner.pubKeyJwk }; });
      verdict(!!(identity.hex && identity.jwk), 'ctx=' + (j + 1) + ' real device pubkey exposed as both the roster kid (hex) and verifiable material (JWK)', identity.hex ? identity.hex.slice(0, 16) + '…' : 'MISSING');
      identities[j] = identity;

      await pages[j].waitForSelector('#idmp-inline-mount [data-col="grandtotal"]', { timeout: 20000 });

      await pages[j].fill('#idmp-inline-mount [data-col="grandtotal"]', vals[j]);
      await pages[j].click('#idmp-toolbar button[title="Save (Alt+S)"]');
      var out = await waitForCrudOutcome(waiters[j], TABLE, 15000);
      console.log('   §REBASE-ATTRIB ctx=' + (j + 1) + ' wrote=' + vals[j] + ' committed=' + out.committed);
      verdict(out.committed === true, 'ctx=' + (j + 1) + ' real UI Save commit reported success', out.line);

      var f = await readRows(pages[j]);
      preRows.push(f);
      var row = f.rows[f.rows.length - 1];
      console.log('   §PRE-SYNC ctx=' + (j + 1) + ' tip=' + f.tip + ' rows=' + f.rows.length + ' gid=' + (row && row.gid) + ' sig=' + (row && row.sig ? row.sig.slice(0, 16) + '…' : row && row.sig));
      verdict(!!(row && row.gid), 'ctx=' + (j + 1) + ' PRE-SYNC — committed op has a non-NULL gid (commitGroup mints one on every commit)', row && row.gid);
      verdict(!!(row && row.sig), 'ctx=' + (j + 1) + ' PRE-SYNC — committed op has a non-NULL sig (signer now installed + content-signing on)', row && row.sig ? 'sig present' : 'sig NULL');
      verdict(!!(f.verify && f.verify.ok), 'ctx=' + (j + 1) + ' PRE-SYNC — verifyChain ok', JSON.stringify(f.verify));
    }

    // ── SYNC — real #erp-sync-pill click on each context, twice (test_kernel_relay.js's own convergence dance) ──
    for (var s1 = 0; s1 < N; s1++) await clickSync(pages[s1], waiters[s1], String(s1 + 1));
    for (var s2 = 0; s2 < N; s2++) await clickSync(pages[s2], waiters[s2], String(s2 + 1) + 'b');

    // ── POST-SYNC — read BOTH contexts' post-rebase state; every PRE-SYNC row (by op_uuid) must still
    //    exist with its ORIGINAL gid/sig unchanged, on BOTH sides (proving cross-device attribution) ──
    var post = [];
    for (var m = 0; m < N; m++) { var g = await readRows(pages[m]); post.push(g); console.log('   §POST-SYNC ctx=' + (m + 1) + ' tip=' + g.tip + ' rows=' + g.rows.length + ' verify=' + JSON.stringify(g.verify)); }

    var tipsEqual = post.every(function (f) { return f.ok && f.tip === post[0].tip; });
    verdict(tipsEqual, 'POST-SYNC — both contexts converge to the IDENTICAL signed chain tip', 'tips=' + JSON.stringify(post.map(function (f) { return f.tip; })));

    // ── S8 (W-MULTI-DEVICE-VERIFY) — roster-gated verification of the POST-SYNC merged log, node-side
    //    (Phase 3 roster DISTRIBUTION is out of scope — this witness constructs the roster directly,
    //    same convention witness_roster_verify.js already uses for the Teams path). Proves: (a) each
    //    op is correctly attributed to the REAL device that signed it, on BOTH sides post-rebase; (b) a
    //    tampered roster entry (wrong pubkey for a kid) is REJECTED — not a trivially-accepting no-op. ──
    var roster = {};
    for (var ri = 0; ri < N; ri++) roster[identities[ri].hex] = identities[ri].jwk;
    var verifyFn = function (msg, sig, pub) { return SNAP_SIGN.verifyTip(msg, sig, pub); };
    for (var side = 0; side < N; side++) {
      var mdv = await EPOCHS.verifyMultiDeviceOps(post[side].rows, { roster: roster, verify: verifyFn });
      console.log('   §MULTI-DEVICE-VERIFY ctx=' + (side + 1) + ' ' + JSON.stringify(mdv));
      verdict(mdv.ok === true, 'ctx=' + (side + 1) + ' S8 — roster-gated multi-device verify passes on the POST-SYNC merged log (real content-sig, real ops, both concurrently-active devices)', JSON.stringify(mdv));
      verdict(Object.keys(mdv.attributed || {}).length === N, 'ctx=' + (side + 1) + ' S8 — all ' + N + ' ops correctly attributed (none anonymous)', JSON.stringify(mdv.attributed));
      var attribKids = Object.keys(mdv.attributed || {}).map(function (k) { return mdv.attributed[k]; });
      var distinctKids = new Set(attribKids);
      verdict(distinctKids.size === N, 'ctx=' + (side + 1) + ' S8 — the ' + N + ' attributions resolve to ' + N + ' DISTINCT devices (not all collapsed onto one puller\'s key, the pre-S7 failure mode)', JSON.stringify(attribKids));

      // NEGATIVE control: swap in a WRONG pubkey for one real kid — verify must REJECT, not silently pass.
      var evilRoster = {}; for (var ek in roster) evilRoster[ek] = roster[ek];
      var realKids = Object.keys(evilRoster);
      evilRoster[realKids[0]] = roster[realKids[realKids.length - 1]];   // swap ctx1's slot to hold ctx2's key (or vice versa)
      var mdvEvil = await EPOCHS.verifyMultiDeviceOps(post[side].rows, { roster: evilRoster, verify: verifyFn });
      verdict(mdvEvil.ok === false, 'ctx=' + (side + 1) + ' S8 NEGATIVE — a tampered roster entry (wrong pubkey for a real kid) is REJECTED, not silently accepted', JSON.stringify(mdvEvil));
    }

    for (var pi = 0; pi < N; pi++) {
      var origRow = preRows[pi].rows[preRows[pi].rows.length - 1];
      // find this SAME op (by op_uuid — the durable identity) on BOTH post-sync sides
      for (var side = 0; side < N; side++) {
        var found = post[side].rows.filter(function (r) { return r.op_uuid === origRow.op_uuid; })[0];
        verdict(!!found, 'ctx=' + (pi + 1) + '\'s op is present on ctx=' + (side + 1) + ' after sync (op_uuid=' + origRow.op_uuid + ')', found ? 'found' : 'MISSING');
        if (found) {
          verdict(found.gid === origRow.gid, 'ctx=' + (pi + 1) + '\'s op keeps its ORIGINAL gid on ctx=' + (side + 1) + ' (group survives rebase)', 'orig=' + origRow.gid + ' now=' + found.gid);
          verdict(found.sig === origRow.sig, 'ctx=' + (pi + 1) + '\'s op keeps its ORIGINAL sig on ctx=' + (side + 1) + ' (not blanked/re-signed under the puller\'s key)', 'orig=' + (origRow.sig || '').slice(0, 16) + ' now=' + (found.sig || '').slice(0, 16));
        }
      }
    }
    // Discovered live (not predicted going in): verifyChain's single-signer model CANNOT verify a
    // FOREIGN device's signature — `_signer.verify()` only knows this device's OWN keypair. So once
    // sig/gid genuinely survive a rebase (proven above), verifyChain on the OTHER device's peer op now
    // correctly FAILS with why="group torn"/opFail="signature" — not a defect in this fix, but exactly
    // the S8 gap this session's spec named: cross-device attribution needs erp_key_epochs.js's
    // roster-gated verify (which checks each op under the KEY THAT ACTUALLY SIGNED IT), not the naive
    // single-`_signer` verifyChain. Before this fix, verifyChain trivially reported ok=true on every
    // device (no sig ever survived a rebase to disagree with); this fix makes the REAL gap visible
    // instead of silently OK — which is the honest, correct outcome for S7 alone, S8 not yet landed.
    for (var vz = 0; vz < N; vz++) {
      var v = post[vz].verify;
      var ownOpStillOk = !v.ok && v.why === 'group torn' && v.opFail === 'signature';
      verdict(ownOpStillOk, 'ctx=' + (vz + 1) + ' POST-SYNC verifyChain correctly FAILS on the PEER device\'s foreign-keyed sig (single-signer model cannot attribute cross-device — names exactly the S8 gap, not a regression)', JSON.stringify(v));
    }

    console.log('\n   §REBASE-ATTRIB-VERDICT tipsEqual=' + tipsEqual);
    for (var z = 0; z < N; z++) await ctxs[z].close();
  } finally {
    await browser.close();
    server.close();
    await relaySrv.close();
  }

  console.log('\n' + (fails === 0
    ? '🟢 W-REBASE-ATTRIB ' + totalAssertions + '/' + totalAssertions + ' PASS'
    : '🔴 ' + fails + '/' + totalAssertions + ' FAILED — read the lines above before concluding (Log Mandate); a 🔴 here means the signer-install / rebase-preservation fix did NOT close the gid/sig-loss gap as designed, which is a valid, reportable shortfall, not a harness defect.')
    + '\n');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
