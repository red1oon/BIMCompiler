#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §INOUT-CALLOUTS (owns §ERP-SESSION-CLOSE §CLOSE.4 item 3's
// two named atoms). THE CLAIM UNDER TEST:
//
//   On the REAL Material Receipt New form (window 184, AD_Tab 296 "MovementType IN ('V+')"):
//     A. picking a vendor FIRES org.compiere.model.CalloutInOut.bpartner and FILLS
//        C_BPartner_Location_ID (+ AD_User_ID) — the field witness_p2p_invoice_match still has to
//        type by hand, with a comment saying real iDempiere defaults it via this very callout.
//     B. picking a document type FIRES org.compiere.model.CalloutInOut.docType and FILLS
//        MovementType, computed by erp_engine.movementTypeOf — the E-4 port, not a second derivation.
//
// Judged on the DOM + the shipped §CRUD-CALLOUT line, which already reports callouts/fired/absent/
// derived/applied per field change. Before these atoms both read `absent=[CalloutInOut.bpartner]` /
// `absent=[CalloutInOut.docType]` with `applied=[]`; a green run must show them in `fired` AND the
// value actually IN the input, not merely in `derived` (§CLOSE.7 rule 2 — a derived value nobody
// applied is not a filled field).
//
// The oracle for every expected value is ad_seed.db, read at run time by this script — never a
// constant typed here. A break is a real finding: read the log, don't assume PASS from exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_inout_callout_atoms.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
function log(m) { console.log('   ' + m); }

var claims = [];
function claim(ok, label, detail) { claims.push({ ok: ok, label: label }); console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

// ── the ORACLE: the seed's own answer, computed by sqlite3 against ad_seed.db, not typed here ──
function seedQuery(sql) {
  var db = path.join(ROOT, 'erp', 'ad_seed.db');
  var out = cp.execFileSync('sqlite3', [db, sql], { encoding: 'utf8' }).trim();
  return out === '' ? null : out;
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
  var harnessThrew = false, browser = null;

  try {
    // the vendor + doctype the p2p lane already uses on this exact form, and the seed's own answers for them
    var VENDOR = 120, DOCTYPE = 122;
    var wantLoc = seedQuery("SELECT MAX(c_bpartner_location_id) FROM c_bpartner_location WHERE c_bpartner_id=" + VENDOR + " AND isactive='Y';");
    var wantUserShip = seedQuery("SELECT MAX(ad_user_id) FROM ad_user WHERE c_bpartner_id=" + VENDOR + " AND isactive='Y' AND isshipto='Y';");
    var wantUserAny = seedQuery("SELECT MAX(ad_user_id) FROM ad_user WHERE c_bpartner_id=" + VENDOR + " AND isactive='Y';");
    var wantUser = (Number(wantUserShip) > 0) ? wantUserShip : wantUserAny;
    var dtRow = seedQuery("SELECT docbasetype || '|' || COALESCE(issotrx,'') FROM c_doctype WHERE c_doctype_id=" + DOCTYPE + ";");
    var dtBase = dtRow ? dtRow.split('|')[0] : null, dtSo = dtRow ? dtRow.split('|')[1] : null;
    // MInOut.getMovementType, verbatim — the same three lines erp_engine.movementTypeOf holds
    var wantMt = (dtBase === 'MMS') ? (dtSo === 'Y' ? 'C-' : 'V-') : (dtBase === 'MMR') ? (dtSo === 'Y' ? 'C+' : 'V+') : null;
    console.log('§INOUT-CALLOUT-ORACLE vendor=' + VENDOR + ' maxActiveLocation=' + wantLoc + ' shipToUser=' + wantUserShip +
                ' anyActiveUser=' + wantUserAny + ' -> expectUser=' + wantUser);
    console.log('§INOUT-CALLOUT-ORACLE doctype=' + DOCTYPE + ' DocBaseType=' + dtBase + ' IsSOTrx=' + dtSo + ' -> expectMovementType=' + wantMt);

    browser = await reqPw().chromium.launch();
    var page = await browser.newPage();
    var logs = [], errs = [];
    page.on('console', function (m) { var t = m.text(); logs.push(t); if (/^§CRUD-CALLOUT/.test(t)) log(t); });
    page.on('pageerror', function (e) { errs.push(String(e).slice(0, 200)); });

    await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin&window=184', { waitUntil: 'load' });
    await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 25000 });
    await page.click('#idmp-toolbar button[title^="New record"]');
    await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 12000 });

    // set a form field the way the shipped UI does — a SELECT gets selectOption, everything else gets fill.
    // (C_BPartner_ID is AD_Reference 30 "Search", not a plain list — selectOption on it is a no-op that
    // silently fires no change event. That is how the first run of this witness produced NO §CRUD-CALLOUT
    // line for c_bpartner_id at all: an instrument fault, found by checking the instrument.)
    async function setField(col, value) {
      var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
      var el = await page.$(sel);
      if (!el) return 'absent';
      var tag = await el.evaluate(function (e) { return e.tagName; });
      if (tag === 'SELECT') { await page.selectOption(sel, String(value)); return tag; }
      // A typed field only fires `change` when the user LEAVES it — and `change` is what the create form
      // listens on (crud_overlay.js host.addEventListener('change') -> fireCreateCallout). Playwright's
      // fill() alone fires `input`, so the first run of this witness typed the vendor and produced NO
      // §CRUD-CALLOUT line at all. Blur is the real user path (tab/click away), not a synthetic event.
      await page.fill(sel, String(value));
      await el.evaluate(function (e) { e.blur(); });
      return tag + '+blur';
    }
    function val(col) {
      return page.$eval('#idmp-inline-mount [data-col="' + col + '"]', function (e) { return e.value; }).catch(function () { return '(absent)'; });
    }
    function lastCallout(col) {
      return logs.filter(function (l) { return l.indexOf('§CRUD-CALLOUT table=m_inout col=' + col + ' ') === 0; }).pop() || '(no §CRUD-CALLOUT line for ' + col + ')';
    }

    // ── A — vendor → location + contact ──────────────────────────────────────────────────────────
    console.log('\n═══ A — CalloutInOut.bpartner: the vendor fills the receipt-side location + contact ═══\n');
    var locBefore = await val('c_bpartner_location_id');
    var howA = await setField('c_bpartner_id', VENDOR);
    log('§INOUT-CALLOUT-A widget(c_bpartner_id)=' + howA);
    await page.waitForTimeout(800);
    var lineA = lastCallout('c_bpartner_id');
    var locAfter = await val('c_bpartner_location_id'), userAfter = await val('ad_user_id');
    console.log('§INOUT-CALLOUT-A locationBefore="' + locBefore + '" locationAfter="' + locAfter + '" userAfter="' + userAfter + '"');
    claim(/fired=\[[^\]]*CalloutInOut\.bpartner/.test(lineA), 'A1: CalloutInOut.bpartner is FIRED, not absent', lineA);
    claim(String(locAfter) === String(wantLoc), 'A2: C_BPartner_Location_ID is FILLED with the seed\'s max active location', 'form="' + locAfter + '" seed=' + wantLoc);
    claim(String(userAfter) === String(wantUser), 'A3: AD_User_ID is FILLED with the ShipTo (else max active) contact', 'form="' + userAfter + '" seed=' + wantUser);
    claim(/applied=\[[^\]]*c_bpartner_location_id/i.test(lineA),
      'A4: the value was APPLIED to the input, not just derived', lineA);

    // ── B — doctype → movement type ──────────────────────────────────────────────────────────────
    console.log('\n═══ B — CalloutInOut.docType: the doctype sets MovementType via the E-4 port ═══\n');
    var mtBefore = await val('movementtype');
    var howB = await setField('c_doctype_id', DOCTYPE);
    log('§INOUT-CALLOUT-B widget(c_doctype_id)=' + howB);
    await page.waitForTimeout(800);
    var lineB = lastCallout('c_doctype_id');
    var mtAfter = await val('movementtype');
    console.log('§INOUT-CALLOUT-B movementTypeBefore="' + mtBefore + '" movementTypeAfter="' + mtAfter + '"');
    claim(/fired=\[[^\]]*CalloutInOut\.docType/.test(lineB), 'B1: CalloutInOut.docType is FIRED, not absent', lineB);
    // MovementType is IsReadOnly='Y' on AD_Tab 296 — the callout must still fill it (mTab.setValue writes
    // the model, read-only only stops the USER). The §-log marks such a write `(ro)`.
    claim(wantMt != null && String(mtAfter) === String(wantMt), 'B2: MovementType is FILLED with getMovementType(DocBaseType,IsSOTrx)', 'form="' + mtAfter + '" oracle=' + wantMt);
    claim(/applied=\[[^\]]*movementtype\(ro\)/i.test(lineB), 'B2b: it was applied to a READ-ONLY field, and the log says so', lineB);
    claim(/deferred=\[/.test(lineB), 'B3: the deferred branches are DECLARED, not silently absent', lineB);

    claim(errs.length === 0, 'C1: 0 pageerrors across both field changes', errs.join(' | '));
    await page.close();
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW: ' + e.message);
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  var pass = claims.filter(function (c) { return c.ok; }).length, fail = claims.length - pass;
  claims.forEach(function (c) { console.log('  ' + (c.ok ? 'PASS' : 'FAIL') + ' ' + c.label); });
  if (!claims.length) console.log('\n🔴 W-INOUT-CALLOUT-ATOMS INCONCLUSIVE — no claim was judged (a 0 here means nothing)');
  else if (fail === 0) console.log('\n🟢 W-INOUT-CALLOUT-ATOMS PASS — ' + pass + ' PASS / 0 FAIL: both named atoms fire on the real form and fill the real fields with the seed\'s own values');
  else console.log('\n🔴 W-INOUT-CALLOUT-ATOMS FAIL — ' + pass + ' PASS / ' + fail + ' FAIL');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only — read the claims above)');
  process.exit(harnessThrew ? 1 : 0);
})();
