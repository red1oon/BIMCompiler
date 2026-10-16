#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_BUSINESS_CYCLE_E2E.md §Fix (2026-07-20). THIS IS A REGRESSION WITNESS for
// the Sales Order child-tab parent-binding bug: after New+Save, the Order Line tab was locking onto a
// STALE pre-existing order (C_Order_ID=108) instead of the order just created. Root cause: the
// overlay:committed CRUD_CREATE handler in erp/idempiere.html folded the new row into _records but never
// updated _recIdx/_selByLevel — master-detail child tabs filter by _selByLevel[level-1] (renderActiveTab
// ~line 1723), so it stayed pinned to whatever record was current at window open. Fix: capture the new
// row's synthetic pk from _overlayListTip's listTip() `created` fold (NOT the overlay:committed event's
// `id` field — verified buildOp() in crud_overlay.js never sets base.id for a CRUD_CREATE, so that field
// is always null) and thread it through _setSel(ct) so _selByLevel updates to the REAL new record.
// Scope: THIS bug only — not the DocAction/CO or procure-to-pay gaps tracked elsewhere in
// ERP_BUSINESS_CYCLE_E2E.md. Run: bash build/erp/run_witness.sh scripts/witness_so_child_bind.js — then
// READ build/erp/witness_so_child_bind.log before any conclusion (Log Mandate). ONE tab only (avoids the
// known cross-tab blob-clobber confound). Real clicks only — no page.evaluate() fakes the create/selection.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
// Points at the FIXED worktree (fix/so-child-bind), NOT the live /home/red1/bim-ootb checkout — the fix
// under test lives only in the worktree until the user decides to push/merge it.
var ROOT = process.env.WITNESS_ROOT || '/tmp/wt-so-bind';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

function log(m) { console.log('   ' + m); }
function verdict(ok, label, detail) { console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

function mkWaiter(page, tag) {
  var lines = [], cursor = 0;
  page.on('console', function (m) { var t = m.text(); lines.push(t); if (/^§/.test(t)) log('[' + tag + '] ' + t); });
  page.on('dialog', function (d) { log('[' + tag + '] ALERT: ' + d.message()); d.accept(); });
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
function waitForCrudPersist(waiter, table, timeoutMs) {
  var rxPersist = new RegExp('§CRUD-PERSIST key=' + table + ' '), rxReject = new RegExp('§CRUD-GATE key=' + table + '.*REJECT');
  return waiter.wait([rxPersist, rxReject], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    return { committed: false, reason: 'owner-gate REJECT', line: r.line };
  }).catch(function (e) { return { committed: false, reason: 'timeout: ' + e.message }; });
}
async function fillField(page, col, value) {
  var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
  var el = await page.$(sel);
  if (!el) return 'absent';
  var disabled = await el.evaluate(function (e) { return !!e.disabled; });
  if (disabled) return 'locked';
  var visible = await el.isVisible();
  if (!visible) return 'hidden';
  var tag = await el.evaluate(function (e) { return e.tagName; });
  if (tag === 'SELECT') await page.selectOption(sel, String(value));
  else await page.fill(sel, String(value));
  return true;
}
async function clickToolbarBtn(page, titlePrefix) {
  var btn = await page.$('#idmp-toolbar button[title^="' + titlePrefix + '"]');
  if (!btn) return false;
  await btn.click();
  return true;
}
async function rowIdByText(page, text) {
  var rows = await page.$$('tr[data-ad-record]');
  for (var i = 0; i < rows.length; i++) {
    var t = await rows[i].textContent();
    if (t && t.indexOf(text) >= 0) return { id: await rows[i].getAttribute('data-ad-record'), handle: rows[i] };
  }
  return null;
}
function deepUrl(port, params) {
  var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  return 'http://localhost:' + port + '/erp/idempiere.html?' + q;
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
  log('ROOT=' + ROOT + ' port=' + port);
  var browser = await reqPw().chromium.launch();
  var harnessThrew = false, ok = false, detail = '';

  var page = await browser.newPage();
  var w = mkWaiter(page, 'W');
  var today = new Date().toISOString().slice(0, 10);
  var uniqDoc = String(Date.now());   // pure-numeric — crud_ops.json c_order.documentno validation is ^[0-9]+$

  try {
    console.log('\n═══ W-SO-CHILD-BIND — Sales Order child-tab parent binding ═══\n');
    await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 143 }), { waitUntil: 'load' });
    await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
    await clickToolbarBtn(page, 'New record');
    await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 10000 });
    await fillField(page, 'documentno', uniqDoc);
    await fillField(page, 'c_bpartner_id', '112');
    await fillField(page, 'dateordered', today);
    await fillField(page, 'grandtotal', '30.00');
    await fillField(page, 'm_pricelist_id', '101');
    await fillField(page, 'bill_bpartner_id', '112');
    await clickToolbarBtn(page, 'Save');
    var p1 = await waitForCrudPersist(w, 'c_order', 15000);
    log('§E2E-SAVE table=c_order committed=' + p1.committed + (p1.reason ? ' reason=' + p1.reason : ''));
    if (!p1.committed) throw new Error('c_order header create did not persist: ' + p1.reason);

    // §CRUD-CREATE-SEL is emitted synchronously as part of the SAME overlay:committed handler that just
    // folded the create — captured from the console-line buffer (already flowing via mkWaiter's listener).
    var selLine = w.lines.filter(function (l) { return /§CRUD-CREATE-SEL table=c_order /.test(l); }).pop();
    log('§E2E-SEL-CHECK ' + (selLine || 'no §CRUD-CREATE-SEL line captured'));
    var selMatch = selLine && /id=(-?\d+) recIdx=(-?\d+) selLevel=0 sel=(-?\d+)/.exec(selLine);
    if (!selMatch) throw new Error('§CRUD-CREATE-SEL line missing or malformed — fix did not fire');
    var selPk = selMatch[3], selRecIdx = Number(selMatch[2]);
    if (selRecIdx < 0) throw new Error('§CRUD-CREATE-SEL reports recIdx=' + selRecIdx + ' — new record was NOT found in the folded _records (fix did not locate it)');

    // Real-UI-observable ID capture — read the rendered grid row (ground truth), not the fix's own log line,
    // to cross-check the fix's selPk against what the UI actually shows for the row we just created.
    await page.waitForTimeout(600);
    var found1 = await rowIdByText(page, uniqDoc);
    if (!found1) throw new Error('no grid row found for documentno ' + uniqDoc + ' after save');
    var newSoId = found1.id;
    log('§E2E-STATE new c_order_id(from grid row)=' + newSoId + ' vs §CRUD-CREATE-SEL sel=' + selPk);
    if (String(newSoId) !== String(selPk)) throw new Error('grid row pk (' + newSoId + ') disagrees with §CRUD-CREATE-SEL sel (' + selPk + ')');

    // The actual regression check — drill into the child tab and read the master-detail filter it emits.
    await found1.handle.click({ timeout: 8000 });
    await page.waitForTimeout(400);
    await page.click('#idmp-tabstrip >> text=Order Line', { timeout: 8000 });
    var mdLine = await w.wait([/§IDEMPIERE-MD tab=Order Line/], 8000).catch(function () { return null; });
    log('§E2E-MD-CHECK ' + (mdLine ? mdLine.line : 'no §IDEMPIERE-MD line captured'));
    if (!mdLine) throw new Error('no §IDEMPIERE-MD line captured for the Order Line tab');
    var filterMatch = /filter=C_Order_ID=(-?\d+)/.exec(mdLine.line);
    var filterPk = filterMatch ? filterMatch[1] : null;

    ok = filterPk != null && String(filterPk) === String(newSoId);
    detail = 'new order pk=' + newSoId + ' (§CRUD-CREATE-SEL sel=' + selPk + ', recIdx=' + selRecIdx + ') vs child-tab filter pk=' + filterPk +
      (ok ? ' — MATCH, child tab bound to the record just created' : ' — MISMATCH, child tab bound to a DIFFERENT (stale) parent');
    verdict(ok, 'W-SO-CHILD-BIND: Order Line child tab filters by the NEW order’s pk, not a stale seed order', detail);
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 THREW: ' + e.message);
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n═══ VERDICT ═══\n');
  verdict(ok && !harnessThrew, 'W-SO-CHILD-BIND overall', detail || (harnessThrew ? 'harness threw before verdict' : 'unknown'));
  process.exit((ok && !harnessThrew) ? 0 : 1);
})().catch(function (e) { console.log('🔴 THREW (top-level) ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
