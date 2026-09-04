#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * poc_wh_walk_live.js — Witnesses W-WH-WALK / W-WH-SCAN / W-WH-COMPLETE for
 * docs/SPATIAL_PICKING_SPEC.md §S-3/§S-4/§S-5, LIVE on the real viewer page
 * (the poc_pos_live / poc_ad_docfsm_live serve pattern; values are proven by the
 * headless W-WH-ROUTE — this run is the WIRING + walk-state proof, §-log first).
 *
 * Serves /tmp/wt-spatial (the feat/spatial-walk worktree; override WT_ROOT) on localhost,
 * PHONE-sized viewport (390×844, touch). The warehouse db is aliased from bim-compiler
 * build/erp/warehouse_gardenworld.db (NOT committed to bim-ootb — serving is the deploy
 * train's decision).
 *
 * Issues proven/disproven:
 *  L1 §WH PILL gate    — DATA-GATE: pill #pill-whwalk surfaces ONLY because the loaded model
 *                        carries locator-GUID bins (pos-pill showWhen precedent).
 *  L2 W-WH-WALK        — per-step `§WH step=i/N locator=… fly=done lit=1`; FALSIFIER: tapping a
 *                        NON-target bin logs target=N step-held and does NOT advance/open scan.
 *  L3 W-WH-SCAN        — wrong typed locator REFUSES (`§WH scan=50004 expected=101 … REFUSED`);
 *                        the typed code rides the SAME gate as camera QR (the §FALSIFIER);
 *                        right bin → qty confirm → ONE group whose replay moves qtyOnHand by
 *                        exactly the confirmed qty (short-pick: 3 of 4), chainOk=Y. The camera
 *                        path's HONEST fallback line must appear (headless = no BarcodeDetector).
 *  L4 §WH SKIP         — long-press skip-with-reason lands as an ANNOTATE op (exception trail).
 *  L5 W-WH-COMPLETE    — last step → dispatchFor(323) CO; qtyOnHand fold == per-locator expected
 *                        deltas for every touched (product,locator) (diffs=0); chain verifies.
 *  L6 phone wiring     — strip + scan screen render inside the 390×844 viewport.
 *  L7 §FALSIFIER gate-off — on a NON-warehouse model (SampleHouse, no m_bom_line BIN rows) the
 *                        pill stays OFF the bar (§WH PILL gate=off, no #pill-whwalk) — the code is
 *                        safe to ship where the warehouse db is not served.
 *
 * Run: bash build/erp/run_witness.sh scripts/poc_wh_walk_live.js
 * Read the log (build/erp/poc_wh_walk_live.log) after every run.
 */
'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var puppeteer = require('puppeteer');

var BIMC = path.join(__dirname, '..');
// STALE-INSTRUMENT FIX 2026-09-04 (prompts/AGENT_QUEUE.md §STALE-WITNESSES): the default ROOT was a
// DEV WORKTREE PATH ('/tmp/wt-spatial') that no longer exists, so every asset 404'd and the run died on a
// selector timeout that named the DOM instead of the missing tree. Default to the real checkout;
// WT_ROOT still overrides for a worktree run, which is what it was there for.
var ROOT = process.env.WT_ROOT || (process.env.HOME + '/bim-ootb');
var WH_DB = path.join(BIMC, 'build', 'erp', 'warehouse_gardenworld.db');
var PLAIN_DB = path.join(BIMC, 'deploy', 'buildings', 'SampleHouse_extracted.db');   // gate-off control
var PORT = 8139;
var MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.db': 'application/octet-stream', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

var server = http.createServer(function (req, res) {
  var p = decodeURIComponent(req.url.split('?')[0]);
  var f = (p === '/viewer/warehouse_gardenworld.db') ? WH_DB
        : (p === '/viewer/SampleHouse_extracted.db') ? PLAIN_DB : path.join(ROOT, p);
  if (!f.startsWith(ROOT) && f !== WH_DB && f !== PLAIN_DB) { res.writeHead(403); res.end(); return; }
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
      if (Date.now() - t0 > (ms || 20000)) return ok(false);
      setTimeout(poll, 250);
    })();
  });
}

(async function () {
  await new Promise(function (ok) { server.listen(PORT, '127.0.0.1', ok); });
  console.log('§WH_LIVE serving ' + ROOT + ' on http://127.0.0.1:' + PORT + ' (localhost only, no deploy; db aliased from bim-compiler)');

  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  var page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  var lines = [];
  page.on('console', function (msg) { var t = msg.text(); if (t.indexOf('§') >= 0) lines.push(t); });
  var pageErrs = [];
  page.on('pageerror', function (e) { pageErrs.push(String(e.message).slice(0, 160)); });

  await page.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=warehouse_gardenworld.db', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // ── L1: data-gate — pill ON for the warehouse model ──
  console.log('— L1: data-gated pill —');
  var gateOn = await waitFor(lines, '§WH PILL gate=on', 30000);
  verdict(gateOn, '§WH PILL gate=on (locator-GUID bins present)', grab(lines, /§WH PILL.*/) ? grab(lines, /(§WH PILL.*)/)[1] : 'absent');
  await waitFor(lines, '§BBOX_CLEARED', 30000);   // geometry streamed (render gate live half)
  var pillThere = await page.$('#pill-whwalk');
  verdict(!!pillThere, '#pill-whwalk on the mobile pill strip');

  // ── §C-1 (UI_UX_LANE Track C): the walk AUTO-ENGAGES once geometry is ready (A._bboxCleared) — no
  // pill hunt. Give auto-engage its window first; only fall back to the pill if it doesn't fire.
  var autoEngaged = await waitFor(lines, '§WH_AUTOSTART gate=true open=auto', 8000);
  verdict(autoEngaged, '§C-1 walk auto-engages on WH load (no pill tap needed)', (grab(lines, /(§WH_AUTOSTART.*)/) || ['', 'absent'])[1]);
  if (!autoEngaged) {
    // fallback path (defensive): open through the REAL pill (pointerup, the registry idiom)
    await page.evaluate(function () {
      if (window.WHWalk && WHWalk.isOpen && WHWalk.isOpen()) return;
      var b = document.getElementById('pill-whwalk');
      if (b) b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      else if (window.WHWalk) WHWalk.toggle();
    });
  }
  var opened = await waitFor(lines, '§WH OPEN', 30000);
  verdict(opened, '§WH OPEN (lens mounted, seed + engines lazy-loaded)', (grab(lines, /(§WH OPEN.*)/) || ['', 'absent'])[1]);
  var step1 = await waitFor(lines, 'step=1/3 locator=101 fly=done lit=1', 20000);
  verdict(step1, 'W-WH-WALK §WH step=1/3 locator=101 fly=done lit=1', (grab(lines, /(§WH step=.*)/) || ['', 'absent'])[1]);

  // ── §C-4: route-list drawer above the strip (auto-expanded at start; header toggles) ──
  var rdAutoOpen = await page.evaluate(function () {
    var rd = document.getElementById('wh-route-drawer'), list = document.getElementById('wh-route-list');
    return !!(rd && rd.style.display !== 'none' && list && list.style.display !== 'none' && list.children.length === 3);
  });
  verdict(rdAutoOpen, '§C-4 route drawer auto-expands at walk start with 3 step rows');
  // §WH-MODE-ICON (v653): the drawer toggle is the route icon in the strip (#wh-route-toggle), not a header.
  await page.evaluate(function () { document.getElementById('wh-route-toggle').click(); });   // collapse
  await new Promise(function (ok) { setTimeout(ok, 200); });
  var rdToggle = (grab(lines, /(§WH_ROUTE_DRAWER.*)/) || ['', 'absent'])[1];
  verdict(/§WH_ROUTE_DRAWER open=false steps=3 done=0/.test(rdToggle), '§C-4 route-icon tap collapses drawer (§WH_ROUTE_DRAWER open=false steps=3 done=0)', rdToggle);
  await page.evaluate(function () { document.getElementById('wh-route-toggle').click(); });   // re-expand for the rest of the walk

  // ── §C-R2-1 (FOLLOW-UP ROUND 2): tapping a route-list row highlights + frames that bin in the scene ──
  await page.evaluate(function () { var r = document.getElementById('wh-route-list'); if (r && r.children[2]) r.children[2].click(); });
  await new Promise(function (ok) { setTimeout(ok, 200); });
  var rtTap = (grab(lines, /(§WH_ROUTE_TAP.*)/) || ['', 'absent'])[1];
  verdict(/§WH_ROUTE_TAP idx=2 locator=102/.test(rtTap), '§C-R2-1 route-row tap → focusStep frames that bin (§WH_ROUTE_TAP idx=2 locator=102)', rtTap);
  // restore framing to the current step (tapping a row only re-frames; W.idx unchanged)
  await page.evaluate(function () { var r = document.getElementById('wh-route-list'); if (r && r.children[0]) r.children[0].click(); });
  await new Promise(function (ok) { setTimeout(ok, 200); });

  // ── §C-R2-2: big running picked-counter (top-left) starts at 0, amber (bare count, green only at total) ──
  var ctr0 = await page.evaluate(function () {
    var c = document.getElementById('wh-pick-counter');
    return c ? { txt: c.textContent, shown: c.style.display !== 'none', amber: c.style.color.indexOf('255, 179, 0') >= 0 } : null;
  });
  verdict(ctr0 && ctr0.shown && ctr0.txt === '0' && ctr0.amber, '§C-R2-2 picked-counter shows 0 amber at walk start', JSON.stringify(ctr0));

  // ── §C-R2-5: no 3-dot BIM dock behind the walk — BOTH #mobile-pill AND its ⋯ #mobile-trigger hidden ──
  var pillHidden = await page.evaluate(function () {
    var p = document.getElementById('mobile-pill'), t = document.getElementById('mobile-trigger');
    return { pill: !p || p.style.display === 'none', trigger: !t || t.style.display === 'none', hasTrigger: !!t };
  });
  verdict(pillHidden.pill && pillHidden.trigger, '§C-R2-5 BIM pill strip AND ⋯ trigger both hidden in walk mode', JSON.stringify(pillHidden));

  // ── L2 falsifier: NON-target tap must not advance / open scan ──
  console.log('— L2: walk + tap falsifier —');
  await page.evaluate(function () { WHWalk.onPick('50003'); });
  await new Promise(function (ok) { setTimeout(ok, 400); });
  var held = has(lines, '§WH TAP bin=50003 target=N step-held=1/3');
  var scanShut = await page.evaluate(function () { var s = document.getElementById('wh-scan'); return !s || s.style.display === 'none' || s.style.display === ''; });
  verdict(held, 'non-target tap logged target=N step-held=1/3');
  verdict(scanShut, 'non-target tap did NOT open the scan screen');
  // the real raycast wiring: picking.js carries the additive onPick forward (served file, not memory)
  var pickSrc = await page.evaluate(async function () { return (await (await fetch('picking.js?v=26')).text()).indexOf('WHWalk.onPick(guid)') >= 0; });
  verdict(pickSrc, 'picking.js (as served) forwards resolved taps to WHWalk.onPick');

  // target tap → scan screen
  await page.evaluate(function () { WHWalk.onPick('101'); });
  await new Promise(function (ok) { setTimeout(ok, 600); });
  verdict(has(lines, '§WH TAP bin=101 target=Y'), 'target-bin tap opens scan (§WH TAP bin=101 target=Y)');
  var qrHonest = has(lines, 'QR supported=N') || has(lines, 'camera=denied');
  verdict(qrHonest, 'camera path HONEST in headless (supported=N or camera=denied → typed fallback live)');

  // ── L3: scan gate — wrong typed code REFUSED, right code → qty → ONE group ──
  console.log('— L3: scan gate (typed = same gate as QR) —');
  await page.type('#wh-typed', '50004');
  await page.click('#wh-typed-go');
  await new Promise(function (ok) { setTimeout(ok, 300); });
  verdict(has(lines, '§WH scan=50004 expected=101 via=typed REFUSED'), 'wrong bin REFUSED (§WH scan=50004 expected=101 REFUSED)');
  var qtyHidden = await page.evaluate(function () { return document.getElementById('wh-qty').style.display === 'none'; });
  verdict(qtyHidden, 'refusal leaves qty confirm CLOSED (no advance)');
  await page.evaluate(function () { document.getElementById('wh-typed').value = ''; });
  await page.type('#wh-typed', '101');
  await page.click('#wh-typed-go');
  await new Promise(function (ok) { setTimeout(ok, 300); });
  verdict(has(lines, '§WH scan=101 expected=101 via=typed MATCH qtyDefault=4'), 'right bin MATCH, qty defaults to line qty 4');
  await page.click('#wh-qty-ok');
  var pick1 = await waitFor(lines, '§WH PICK step=1/3', 10000);
  var p1 = (grab(lines, /(§WH PICK step=1\/3.*)/) || ['', ''])[1];
  verdict(pick1 && /qty=4/.test(p1) && /ops=2/.test(p1) && /committed=true/.test(p1) && /chainOk=Y/.test(p1),
    'step 1 commit: ONE group (2 ENACT_MOVE ops), qty=4, chainOk=Y', p1);

  // ── §C-R2-8: exit (✕) mid-walk then re-open RESUMES the same state (1 picked, not re-drafted) ──
  await page.click('#wh-close');                                       // ✕ exit (C-R2-6 partial exit)
  await new Promise(function (ok) { setTimeout(ok, 300); });
  var closed = await page.evaluate(function () { return !WHWalk.isOpen(); });
  verdict(closed, '§C-R2-6 ✕ exits the walk (no forced completion)');
  await page.evaluate(function () { WHWalk.toggle(); });               // re-open within the same session
  var resumed = await waitFor(lines, '§WH RESUME', 8000);
  var rs = (grab(lines, /(§WH RESUME.*)/) || ['', 'absent'])[1];
  verdict(resumed && /done=1/.test(rs) && /state preserved/.test(rs), '§C-R2-8 re-open RESUMES same state (done=1, not re-drafted)', rs);
  // counter still shows 1 picked after resume (state truly preserved)
  var ctrR = await page.evaluate(function () { var c = document.getElementById('wh-pick-counter'); return c ? c.textContent : null; });
  verdict(ctrR === '1', '§C-R2-8 picked-counter still 1 after resume', String(ctrR));

  // step 2 (same bin 101, product 127): §C-R2-4 AUTO-CONFIRM via the strip "Confirm" button —
  // full/default qty, NO scan overlay (the 3D-box tap path is what opens scan; proven on step 1 above).
  var step2 = await waitFor(lines, 'step=2/3 locator=101 fly=done lit=1', 15000);
  verdict(step2, 'W-WH-WALK §WH step=2/3 locator=101 fly=done lit=1');
  await page.click('#wh-scan-btn');                        // strip Confirm = autoConfirmPick (C-R2-4)
  await new Promise(function (ok) { setTimeout(ok, 500); });
  var ac = (grab(lines, /(§WH_AUTOCONFIRM step=2\/3.*)/) || ['', 'absent'])[1];
  verdict(/§WH_AUTOCONFIRM step=2\/3 locator=101 qty=4 via=auto/.test(ac), '§C-R2-4 strip Confirm = auto-confirm full qty (no scan overlay)', ac);
  var scanShut2 = await page.evaluate(function () { var s = document.getElementById('wh-scan'); return !s || s.style.display === 'none'; });
  verdict(scanShut2, '§C-R2-4 auto-confirm did NOT open the scan overlay');
  var pick2 = await waitFor(lines, '§WH PICK step=2/3', 10000);
  var p2 = (grab(lines, /(§WH PICK step=2\/3.*)/) || ['', ''])[1];
  verdict(pick2 && /qty=4/.test(p2) && /chainOk=Y/.test(p2),
    'step 2 auto-confirm: full qty=4 committed, chainOk=Y', p2);
  // §C-R2-2 the running counter advanced to 2 picks (still amber — step 3 not yet picked)
  var ctr2 = await page.evaluate(function () {
    var c = document.getElementById('wh-pick-counter');
    return c ? { txt: c.textContent, amber: c.style.color.indexOf('255, 179, 0') >= 0 } : null;
  });
  verdict(ctr2 && ctr2.txt === '2' && ctr2.amber, '§C-R2-2 picked-counter = 2 amber after two picks', JSON.stringify(ctr2));

  // ── L4: step 3 — long-press skip-with-reason (the real strip gesture, prompt overridden) ──
  console.log('— L4: skip-with-reason —');
  var step3 = await waitFor(lines, 'step=3/3 locator=102 fly=done lit=1', 15000);
  verdict(step3, 'W-WH-WALK §WH step=3/3 locator=102 fly=done lit=1');
  await page.evaluate(function () { window.prompt = function () { return 'bin blocked'; }; });
  await page.evaluate(function () {
    var el = document.getElementById('wh-step');
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await new Promise(function (ok) { setTimeout(ok, 800); });  // > the 550ms hold
  var skipped = has(lines, '§WH SKIP step=3/3 locator=102 reason="bin blocked"');
  verdict(skipped, 'long-press skip → ANNOTATE op with reason', (grab(lines, /(§WH SKIP.*)/) || ['', 'absent'])[1]);

  // ── L5: completion — dispatchFor CO + the fold == expected deltas ──
  console.log('— L5: complete + fold —');
  var done = await waitFor(lines, '§WH COMPLETE', 15000);
  var c = (grab(lines, /(§WH COMPLETE.*)/) || ['', ''])[1];
  verdict(done && /status=CO/.test(c) && /via=dispatchFor\(323\)/.test(c), 'doc Complete via ad_docfsm.dispatchFor(323) → CO', c);
  verdict(/foldKeys=4 diffs=0/.test(c), 'qtyOnHand fold == expected deltas for ALL touched (product,locator) — 4 keys, 0 diffs', c);
  verdict(/chainOk=Y/.test(c), 'op log chain verifies after completion', c);
  var f = (grab(lines, /(§WH FOLD .*)/) || ['', ''])[1];
  var foldOk = f.indexOf('123@101:-4') >= 0 && f.indexOf('123@50000:4') >= 0 &&
               f.indexOf('127@101:-4') >= 0 && f.indexOf('127@50000:4') >= 0;
  verdict(foldOk, 'fold values exact: 123@101:-4 · 123@50000:+4 · 127@101:-4 · 127@50000:+4 (step 2 full, skip excluded)', f);

  // ── L6: phone wiring ──
  console.log('— L6: phone-sized viewport —');
  var strip = await page.evaluate(function () {
    var r = document.getElementById('wh-strip').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, vw: window.innerWidth, vh: window.innerHeight };
  });
  verdict(strip.vw === 390 && strip.w > 0 && strip.x >= 0 && (strip.x + strip.w) <= strip.vw && (strip.y + strip.h) <= strip.vh,
    'strip inside the 390×844 viewport', JSON.stringify(strip));
  verdict(pageErrs.length === 0, 'no page errors', pageErrs.join(' | ') || 'none');

  try { await page.screenshot({ path: path.join(BIMC, 'build', 'erp', 'wh_walk_live.png') }); console.log('§WH_LIVE_SHOT build/erp/wh_walk_live.png'); } catch (e) {}

  // ── L7: gate-off falsifier — a plain building must NOT light the pill ──
  console.log('— L7: gate-off on a non-warehouse model —');
  var page2 = await browser.newPage();
  await page2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  var lines2 = [];
  page2.on('console', function (msg) { var t = msg.text(); if (t.indexOf('§') >= 0) lines2.push(t); });
  await page2.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=SampleHouse_extracted.db', { waitUntil: 'domcontentloaded', timeout: 30000 });
  var offSeen = await (function () {
    var t0 = Date.now();
    return new Promise(function (ok) {
      (function poll() {
        if (lines2.some(function (l) { return l.indexOf('§WH PILL gate=off') >= 0; })) return ok(true);
        if (Date.now() - t0 > 40000) return ok(false);
        setTimeout(poll, 300);
      })();
    });
  })();
  var pill2 = await page2.$('#pill-whwalk');
  verdict(offSeen, '§WH PILL gate=off on SampleHouse (no locator-GUID bins)');
  verdict(!pill2, '#pill-whwalk absent from the bar on a plain building (safe-to-ship gate)');
  await page2.close();

  console.log('— captured §WH lines —');
  lines.filter(function (l) { return l.indexOf('§WH') >= 0 || l.indexOf('§KRN_GROUP') >= 0; }).forEach(function (l) { console.log('   | ' + l); });

  await browser.close();
  server.close();
  console.log(fails === 0 ? '§W-WH-LIVE PASS — W-WH-WALK + W-WH-SCAN + W-WH-COMPLETE green on the phone viewport'
    : '§W-WH-LIVE FAIL fails=' + fails);
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('§WH_LIVE ERROR ' + (e && e.stack || e)); server.close(); process.exit(1); });
