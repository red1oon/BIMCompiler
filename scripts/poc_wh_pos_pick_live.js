#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (WH_POS_PICK_LANE.md W-4 / SPATIAL_PICKING_SPEC.md §S-2b).
//   Read the log after every run. Values are proven HEADLESS in W-WH-POS-PICK — this run is the
//   WIRING proof of the whole live loop, §-log first (TestArchitecture §Browser Testing).
// poc_wh_pos_pick_live.js — the END-TO-END loop, LIVE on the served pages, ONE browser (shared
// IndexedDB origin): sell deliver-later on idempiere.html → the warehouse walk on viewer.html
// OFFERS that sale (sidecar fold) → walk/confirm it → pick-complete CO → write-back empties the
// selector on reload.
//
// Issues proven (§-log lines, in order):
//  P1 §POS-DELIVERLATER door=on doctype=132 — the dictionary-gated W-1 door is on the panel.
//  P2 empty-cart deliver-later REFUSES (no sale line) — the same honesty gate as Tender.
//  P3 W-POS-LIVE regression shape — a TENDER sale still commits §POS-SALE … chainOk=Y (the WR path
//     byte-identical; ALSO seeds the falsifier: this WR shipment must NEVER reach the walk).
//  P4 §POS-DELIVERLATER sale … born=DR … persisted=Y — order CO + shipment DR in ONE signed group,
//     op log PERSISTED to IDB (bim_ootb_cache/dbs/idmp_kanban_proj — the §S-2b seam).
//  W1 §WH SRC pos-docs=1 — the walk folds the sidecar: EXACTLY the deliver-later shipment
//     (the WR sale self-filtered), chooser shown (replenish + pos source both non-empty).
//  W2 §WH DRAFT pos-shipment … bins=[101,101] — bins resolved from m_storageonhand.
//  W3 steps walked via the manual-confirm gate (via=manual MATCH), step1 SHORT-picked 2→1.
//  W4 §WH PICK-COMPLETE inout=… CO via=completeShipmentOps(120) picked=2/3 … diffs=0 chainOk=Y.
//  W5 §WH SIDECAR-WRITEBACK groups=1/1 — completion re-committed into the shared blob.
//  W6 reload → §WH SRC pos-docs=0 — the selector EMPTIES (no double-pick door).
//
// Serve root = a bim-ootb worktree carrying the lane (default /tmp/wt-poswalk; override WT_ROOT).
// Run: bash build/erp/run_witness.sh scripts/poc_wh_pos_pick_live.js   — then READ the log.
'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var puppeteer = require('puppeteer');

var BIMC = path.join(__dirname, '..');
// STALE-INSTRUMENT FIX 2026-09-04 (prompts/AGENT_QUEUE.md §STALE-WITNESSES): the default ROOT was a
// DEV WORKTREE PATH ('/tmp/wt-poswalk') that no longer exists, so every asset 404'd and the run died on a
// selector timeout that named the DOM instead of the missing tree. Default to the real checkout;
// WT_ROOT still overrides for a worktree run, which is what it was there for.
var ROOT = process.env.WT_ROOT || (process.env.HOME + '/bim-ootb');
var PORT = 8141;
var MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.db': 'application/octet-stream', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

var server = http.createServer(function (req, res) {
  var p = decodeURIComponent(req.url.split('?')[0]);
  var f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

function has(lines, s) { return lines.some(function (l) { return l.indexOf(s) >= 0; }); }
function grab(lines, re) { for (var i = lines.length - 1; i >= 0; i--) { var m = lines[i].match(re); if (m) return m; } return null; }
function waitFor(lines, s, ms) {
  var t0 = Date.now();
  return new Promise(function (ok) {
    (function poll() {
      if (has(lines, s)) return ok(true);
      if (Date.now() - t0 > (ms || 25000)) return ok(false);
      setTimeout(poll, 250);
    })();
  });
}
function sleep(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

(async function () {
  await new Promise(function (ok) { server.listen(PORT, '127.0.0.1', ok); });
  console.log('§WH_POS_LIVE serving ' + ROOT + ' on http://127.0.0.1:' + PORT + ' (localhost only, no deploy)');

  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  // ── PHASE 1: the ERP page — WR tender (regression+falsifier seed) then the deliver-later door ──
  console.log('— P1..P4: idempiere.html — door on, refusals, WR tender, deliver-later sale persisted —');
  var erp = await browser.newPage();
  var elog = [];
  erp.on('console', function (m) { var t = m.text(); if (t.indexOf('§') >= 0) elog.push(t); });
  var erpErrs = []; erp.on('pageerror', function (e) { erpErrs.push(String(e.message).slice(0, 160)); });
  await erp.goto('http://127.0.0.1:' + PORT + '/erp/idempiere.html?login=GardenAdmin', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await erp.waitForSelector('#idmp-tree .idmp-row.leaf', { timeout: 30000 });
  // STALE-INSTRUMENT FIX 2026-09-04 (prompts/AGENT_QUEUE.md §STALE-WITNESSES): the rail trigger and the
  // pill click were in ONE evaluate with nothing in between, so #pill-pos was still null when the second
  // line ran — the rail renders its buttons after the trigger, not synchronously with it. Split, and wait
  // for the pill instead of assuming it. Same order W-POS-CLOSE-LEAK (9/9) uses.
  await erp.evaluate(function () {
    var trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]');
    if (trig) trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await erp.waitForSelector('#pill-pos', { timeout: 15000 });
  await erp.evaluate(function () {
    document.getElementById('pill-pos').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await erp.waitForSelector('.pos-card', { timeout: 20000 });
  // P1: the dictionary-gated door
  var door = (grab(elog, /(§POS-DELIVERLATER door=.*)/) || ['', 'absent'])[1];
  verdict(/door=on doctype=132/.test(door), 'P1 door=on doctype=132 (dictionary-gated docsubtypeso=SO)', door);
  await erp.evaluate(function () { document.getElementById('pos-pill-payment').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
  await erp.waitForSelector('#pos-float-panel.open', { timeout: 10000 });
  // P2: empty-cart deliver-later refuses (§D-3: button now lives in the collapsed ⋯ dock — dispatch
  // the click directly, the engine refusal is what's under test, not the dock reveal gesture)
  await erp.evaluate(function () {
    var btn = document.getElementById('pos-float-deliverlater');
    if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await sleep(400);
  verdict(!grab(elog, /§POS-DELIVERLATER sale/), 'P2 empty-cart deliver-later REFUSED (no sale line)');
  // P3: WR tender regression (and the walk falsifier seed — this shipment completes IN-group)
  await erp.click('.pos-card[data-pid="124"]');
  await erp.select('#pos-float-bp', '112');
  await erp.click('#pos-float-tender');                              // §R2-3/§R2-5: single Pay icon completes directly
  var wrOk = await waitFor(elog, '§POS-SALE', 20000);
  var wrLine = (grab(elog, /(§POS-SALE.*)/) || ['', ''])[1];
  verdict(wrOk && /newVerbs=\[\]/.test(wrLine) && /chainOk=Y/.test(wrLine), 'P3 W-POS-LIVE regression: Tender sale commits (WR path byte-identical)', wrLine);
  // P4: deliver-later sale — ring 124 ×2 + 123 ×1 (storage: both bin 101), then the door.
  // After P3 the panel was disposed (dispose-with-cart on empty cart after WR sale).
  // Re-open via pos-pill-payment, then CLOSE before card clicks (replenish panel may have grown
  // after the sale, extending the overlay footprint over the card grid — close to unblock).
  // After P3 the panel was disposed (dispose-with-cart). Use JS dispatchEvent for card clicks
  // to bypass any overlay/visibility checks — same semantics as a real tap in production.
  function tapCard(pid) {
    return erp.evaluate(function (pid) {
      var c = document.querySelector('.pos-card[data-pid="' + pid + '"]');
      if (c) { c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; }
      return false;
    }, pid);
  }
  await tapCard(124); await sleep(200); await tapCard(124); await sleep(200); await tapCard(123); await sleep(200);
  // wait for ring logs to confirm cart is populated, then open the payment panel for deliver-later
  await waitFor(elog, '§POS-LIVE ring product=123', 5000);
  await erp.evaluate(function () { document.getElementById('pos-pill-payment').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
  await erp.waitForSelector('#pos-float-panel.open', { timeout: 10000 });
  // Select BP via evaluate (avoids Puppeteer's select requiring element in viewport)
  await erp.evaluate(function () {
    var sel = document.getElementById('pos-float-bp');
    if (sel) { sel.value = '112'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  // Click deliver-later via dispatchEvent — panel body may be taller than viewport in headless
  // (3 cart items + replenish), so page.click() can't reach scrolled-out buttons
  await erp.evaluate(function () {
    var btn = document.getElementById('pos-float-deliverlater');
    if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  var dlOk = await waitFor(elog, '§POS-DELIVERLATER sale', 20000);
  var dl = (grab(elog, /(§POS-DELIVERLATER sale.*)/) || ['', ''])[1];
  verdict(dlOk && /doctype=132\(SO\)/.test(dl) && /statuses=\[C_Order→CO\]/.test(dl) && /born=DR/.test(dl) &&
    /chainOk=Y/.test(dl) && /persisted=Y/.test(dl),
    'P4 deliver-later: ONE group, C_Order→CO only, shipment born DR, op log PERSISTED', dl);
  var inoutId = (dl.match(/inout=(\d+)/) || [])[1];
  verdict(!!inoutId, 'P4 shipment id captured for the walk', 'inout=' + inoutId);
  verdict(erpErrs.length === 0, 'no ERP page errors', erpErrs.join(' | ') || 'none');

  // ── PHASE 2: the WALK page (same browser = same IDB origin) — offer → walk → complete → writeback ──
  console.log('— W1..W5: viewer.html — sidecar offer, walk, pick-complete, write-back —');
  var wk = await browser.newPage();
  await wk.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  var wlog = [];
  wk.on('console', function (m) { var t = m.text(); if (t.indexOf('§') >= 0) wlog.push(t); });
  var wkErrs = []; wk.on('pageerror', function (e) { wkErrs.push(String(e.message).slice(0, 160)); });
  await wk.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=../buildings/warehouse_gardenworld.db', { waitUntil: 'domcontentloaded', timeout: 40000 });
  verdict(await waitFor(wlog, '§WH PILL gate=on', 30000), 'walk pill gated ON (warehouse model)', (grab(wlog, /(§WH PILL.*)/) || ['', ''])[1]);
  await waitFor(wlog, '§BBOX_CLEARED', 30000);
  // §C-1 (UI_UX_LANE Track C): the walk AUTO-ENGAGES once geometry is ready; with POS docs present it
  // auto-pops the source chooser. Tolerate already-open (never toggle it shut) — only open if it didn't.
  await wk.evaluate(function () {
    if (window.WHWalk && WHWalk.isOpen && WHWalk.isOpen()) return;
    var b = document.getElementById('pill-whwalk');
    if (b) b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    else if (window.WHWalk) WHWalk.toggle();
  });
  // DIAGNOSTIC: dump the sidecar blob the walk reads, straight from the walk page's IDB
  var sidecarDiag = await wk.evaluate(function () {
    return new Promise(function (ok) {
      var rq = indexedDB.open('bim_ootb_cache');   // no version → current (scene.js owns v2)
      rq.onsuccess = function () {
        var idb = rq.result;
        if (!idb.objectStoreNames.contains('dbs')) { idb.close(); return ok({ store: false }); }
        var g = idb.transaction('dbs', 'readonly').objectStore('dbs').get('idmp_kanban_proj');
        g.onsuccess = function () {
          var buf = g.result; idb.close();
          ok({ store: true, hasBlob: !!buf, bytes: buf ? (buf.byteLength || (buf.buffer && buf.buffer.byteLength) || 0) : 0 });
        };
        g.onerror = function () { idb.close(); ok({ store: true, getErr: true }); };
      };
      rq.onerror = function () { ok({ openErr: true }); };
    });
  });
  console.log('  §SIDECARDIAG ' + JSON.stringify(sidecarDiag));
  // W1: the selector folds the sidecar — exactly ONE pos doc (WR self-filtered) → chooser
  verdict(await waitFor(wlog, '§WH SRC pos-docs=1', 30000), 'W1 §WH SRC pos-docs=1 (deliver-later offered, WR sale self-filtered)',
    (grab(wlog, /(§WH SRC.*)/) || ['', 'absent'])[1]);
  await wk.waitForSelector('#wh-src', { timeout: 10000 });
  await wk.evaluate(function () {
    var btns = document.querySelectorAll('#wh-src button');
    for (var i = 0; i < btns.length; i++) if (btns[i].textContent.indexOf('POS shipment') >= 0) { btns[i].click(); return; }
  });
  // W2: draft from the pos doc — bins from m_storageonhand
  verdict(await waitFor(wlog, '§WH DRAFT pos-shipment', 10000), 'W2 draft from the live sale (op log)',
    (grab(wlog, /(§WH DRAFT pos-shipment.*)/) || ['', 'absent'])[1]);
  // §C-5: switch-source ↺ button is data-gated visible when POS docs exist. Feature-tolerant — a viewer
  // that predates Track C has no #wh-switch element at all (n/a, not a fail); when present it MUST be visible.
  var switchState = await wk.evaluate(function () { var b = document.getElementById('wh-switch'); return b ? (b.style.display !== 'none' ? 'shown' : 'hidden') : 'absent'; });
  verdict(switchState !== 'hidden', '§C-5 ↺ switch-source button visible when posDocs>0 (or n/a on a pre-C5 viewer)', 'state=' + switchState);
  // W3: walk the 2 steps via the manual-confirm gate; step1 SHORT-pick 2→1
  verdict(await waitFor(wlog, 'step=1/2', 20000), 'W3 step 1/2 focused', (grab(wlog, /(§WH step=.*)/) || ['', ''])[1]);
  // click via dispatchEvent — the qty stepper lives in a fixed overlay that Puppeteer's
  // coordinate-based click can't resolve in headless; dispatchEvent is the same gesture
  function tapId(id) {
    return wk.evaluate(function (id) {
      var e = document.getElementById(id);
      if (e) { e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; }
      return false;
    }, id);
  }
  await wk.evaluate(function () { WHWalk.confirmHere(); }); await sleep(400);
  await tapId('wh-qty-minus');                                          // 2 → 1 (short-pick)
  await tapId('wh-qty-ok');
  verdict(await waitFor(wlog, '§WH PICK step=1/2', 10000), 'W3 step 1 confirmed SHORT (2→1, via=manual gate)',
    (grab(wlog, /(§WH PICK step=1\/2.*)/) || ['', ''])[1]);

  // ── §C-R2-8 CROSS-RELOAD RESUME: a mid-walk PAGE RELOAD must restore the step-1 pick from IDB ──
  // The in-memory W.opDb is wiped on reload; the new idmp_whwalk_progress cache rehydrates W.done.
  // Proves: pick persisted (§WH PROGRESS-SAVE) → reload → re-pick the still-DR shipment → restored.
  verdict(await waitFor(wlog, '§WH PROGRESS-SAVE inout=' + inoutId + ' picked=1', 8000),
    '§C-R2-8 step-1 pick persisted to the resume cache (§WH PROGRESS-SAVE picked=1/2)',
    (grab(wlog, /(§WH PROGRESS-SAVE.*)/) || ['', 'absent'])[1]);
  console.log('— §C-R2-8: reload mid-walk — picked state must survive —');
  await wk.reload({ waitUntil: 'domcontentloaded', timeout: 40000 });
  wlog.length = 0;                                                   // clean slate: only post-reload lines
  await waitFor(wlog, '§WH PILL gate=on', 30000);
  await waitFor(wlog, '§BBOX_CLEARED', 30000);
  await wk.evaluate(function () {                                    // re-engage (tolerate C-1 auto-engage)
    if (window.WHWalk && WHWalk.isOpen && WHWalk.isOpen()) return;
    var b = document.getElementById('pill-whwalk');
    if (b) b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    else if (window.WHWalk) WHWalk.toggle();
  });
  await wk.waitForSelector('#wh-src', { timeout: 15000 });           // the still-DR shipment re-offered
  await wk.evaluate(function () {
    var btns = document.querySelectorAll('#wh-src button');
    for (var i = 0; i < btns.length; i++) if (btns[i].textContent.indexOf('POS shipment') >= 0) { btns[i].click(); return; }
  });
  var rr = await waitFor(wlog, '§WH RESUME-RELOAD inout=' + inoutId, 15000);
  var rrLine = (grab(wlog, /(§WH RESUME-RELOAD.*)/) || ['', 'absent'])[1];
  verdict(rr && /restored=1\/2/.test(rrLine), '§C-R2-8 cross-reload restored the step-1 pick (§WH RESUME-RELOAD restored=1/2)', rrLine);
  var ctrR = await wk.evaluate(function () { var c = document.getElementById('wh-pick-counter'); return c ? c.textContent : null; });
  verdict(ctrR === '1', '§C-R2-8 picked-counter shows 1 after the reload (state truly restored)', String(ctrR));

  verdict(await waitFor(wlog, 'step=2/2', 15000), 'W3 step 2/2 focused');
  await wk.evaluate(function () { WHWalk.confirmHere(); }); await sleep(400);
  await tapId('wh-qty-ok');
  // W4: pick-complete = the engine's completion; on-hand by PICKED
  var done = await waitFor(wlog, '§WH PICK-COMPLETE', 15000);
  var c = (grab(wlog, /(§WH PICK-COMPLETE.*)/) || ['', ''])[1];
  verdict(done && new RegExp('inout=' + inoutId + ' CO').test(c) && /via=completeShipmentOps\(120\)/.test(c) &&
    /picked=2\/3/.test(c) && /diffs=0/.test(c) && /chainOk=Y/.test(c),
    'W4 §WH PICK-COMPLETE: the SOLD shipment CO, picked=2/3, fold diffs=0, chainOk=Y', c);
  // W5: write-back into the shared blob
  verdict(await waitFor(wlog, '§WH SIDECAR-WRITEBACK groups=', 10000), 'W5 completion written back to the shared ledger blob',
    (grab(wlog, /(§WH SIDECAR-WRITEBACK.*)/) || ['', 'absent'])[1]);
  verdict(wkErrs.length === 0, 'no walk page errors', wkErrs.join(' | ') || 'none');
  try { await wk.screenshot({ path: path.join(BIMC, 'build', 'erp', 'wh_pos_pick_live.png') }); console.log('§WH_POS_LIVE_SHOT build/erp/wh_pos_pick_live.png'); } catch (e) {}

  // ── W6: reload → the selector EMPTIES (no double-pick door) ──
  console.log('— W6: reload — selector empties —');
  var wk2 = await browser.newPage();
  await wk2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  var wlog2 = [];
  wk2.on('console', function (m) { var t = m.text(); if (t.indexOf('§') >= 0) wlog2.push(t); });
  await wk2.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=../buildings/warehouse_gardenworld.db', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await waitFor(wlog2, '§WH PILL gate=on', 30000);
  await waitFor(wlog2, '§BBOX_CLEARED', 30000);
  // §C-1: tolerate auto-engaged walk (already open) — reload selector check, pos-docs=0 → no chooser.
  await wk2.evaluate(function () {
    if (window.WHWalk && WHWalk.isOpen && WHWalk.isOpen()) return;
    var b = document.getElementById('pill-whwalk');
    if (b) b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    else if (window.WHWalk) WHWalk.toggle();
  });
  verdict(await waitFor(wlog2, '§WH SRC pos-docs=0', 30000),
    'W6 after the pick the selector is EMPTY (write-back held: a completed shipment never routes twice)',
    (grab(wlog2, /(§WH SRC.*)/) || ['', 'absent'])[1]);

  await browser.close();
  server.close();
  console.log('\n' + (fails === 0 ? '🟢 W-WH-POS-PICK-LIVE PASS' : '🔴 W-WH-POS-PICK-LIVE FAIL (' + fails + ')') +
    ' — sell deliver-later at the live POS → the live walk offers it (WR self-filters) → manual-gate walk with a short-pick → pick-complete CO moves on-hand by PICKED → write-back empties the selector.');
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
