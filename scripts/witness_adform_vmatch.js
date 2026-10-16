#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §ADFORM-VMATCH (owns §ERP-SESSION-CLOSE §CLOSE.4 item 4 / E-3:
// "49 AD_Form rows baked, no Form renderer. Scope ONE form end to end."). THE CLAIM UNDER TEST:
//
//   A. an 'X' menu leaf reaches its AD_Form row and dispatches on the row's OWN Classname — and a
//      classname with no renderer shows the HONEST "Not available" card, never a blank pane.
//   B. AD_Form 108 "Matching PO-Receipt-Invoice" (org.compiere.apps.form.VMatch) renders, and the rows
//      it shows are the ones the Java's own SQL would show: same population, same HAVING, both modes.
//
// THE ORACLE IS NOT THIS SCRIPT'S OPINION. Every expected count is computed by sqlite3 against
// ad_seed.db from the transcribed Java SQL (MInvoice.MATCH_TO_RECEIPT_SQL + its GROUP BY/HAVING,
// MInOut.BASE_MATCHING_SQL, MOrder.BASE_MATCHING_SQL) — so a browser number that merely LOOKS
// plausible cannot pass. The two modes are also asserted to be DIFFERENT, because a renderer that
// ignores the mode would otherwise pass both.
//
// A break is a real finding: read the log, don't assume PASS from exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_adform_vmatch.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
function log(m) { console.log('   ' + m); }
var claims = [];
function claim(ok, label, detail) { claims.push({ ok: ok, label: label }); console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

function seedQuery(sql) {
  var db = path.join(ROOT, 'erp', 'ad_seed.db');
  var out = cp.execFileSync('sqlite3', [db, sql], { encoding: 'utf8' }).trim();
  return out === '' ? null : out;
}
// ── the Java's SQL, transcribed as a countable oracle ────────────────────────────────────────────────
// MInvoice.MATCH_TO_RECEIPT_SQL (:85-98) + BASE_MATCHING_GROUP_BY_SQL (:101-110): the FULL JOIN + GROUP BY
// + HAVING collapses to "per invoice line, is qty <> SUM(matched)?" — expressed here as a correlated sum,
// which is the same predicate without needing a FULL JOIN.
function oracleInvoiceToReceipt(matched) {
  var qty = "CASE WHEN dt.DocBaseType='APC' THEN lin.QtyInvoiced * -1 ELSE lin.QtyInvoiced END";
  var lhs = matched ? '0' : qty;
  return Number(seedQuery(
    "SELECT count(*) FROM c_invoiceline lin" +
    " JOIN c_invoice hdr ON hdr.C_Invoice_ID=lin.C_Invoice_ID" +
    " JOIN m_product p ON p.M_Product_ID=lin.M_Product_ID" +
    " JOIN ad_org org ON org.AD_Org_ID=hdr.AD_Org_ID" +
    " JOIN c_bpartner bp ON bp.C_BPartner_ID=hdr.C_BPartner_ID" +
    " JOIN c_doctype dt ON dt.C_DocType_ID=hdr.C_DocType_ID AND dt.DocBaseType IN ('API','APC')" +
    " WHERE hdr.DocStatus IN ('CO','CL')" +
    " AND " + lhs + " <> COALESCE((SELECT SUM(mi.qty) FROM m_matchinv mi WHERE mi.c_invoiceline_id=lin.C_InvoiceLine_ID),0);"));
}
// MInOut.BASE_MATCHING_SQL (:87-102) with M_MatchPO + *_TO_ORDER_GROUP_BY (:116-126). The M_MatchPO sum
// counts only junction rows that actually carry M_InOutLine_ID (the Java's CASE WHEN … IS NOT NULL).
function oracleReceiptToOrder(matched) {
  var qty = "CASE WHEN (dt.DocBaseType='MMS' AND hdr.issotrx='N') THEN lin.MovementQty * -1 ELSE lin.MovementQty END";
  var lhs = matched ? '0' : qty;
  return Number(seedQuery(
    "SELECT count(*) FROM m_inoutline lin" +
    " JOIN m_inout hdr ON hdr.M_InOut_ID=lin.M_InOut_ID" +
    " JOIN m_product p ON p.M_Product_ID=lin.M_Product_ID" +
    " JOIN ad_org org ON org.AD_Org_ID=hdr.AD_Org_ID" +
    " JOIN c_bpartner bp ON bp.C_BPartner_ID=hdr.C_BPartner_ID" +
    " JOIN c_doctype dt ON dt.C_DocType_ID=hdr.C_DocType_ID AND (dt.DocBaseType='MMR' OR (dt.DocBaseType='MMS' AND hdr.issotrx='N'))" +
    " WHERE hdr.DocStatus IN ('CO','CL')" +
    " AND " + lhs + " <> COALESCE((SELECT SUM(mo.qty) FROM m_matchpo mo WHERE mo.m_inoutline_id=lin.M_InOutLine_ID AND mo.m_inoutline_id IS NOT NULL),0);"));
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
    var formCount = Number(seedQuery('SELECT count(*) FROM ad_form;'));
    var wantIS_N = oracleInvoiceToReceipt(false), wantIS_M = oracleInvoiceToReceipt(true);
    var wantSO_N = oracleReceiptToOrder(false), wantSO_M = oracleReceiptToOrder(true);
    console.log('§ADFORM-ORACLE ad_form rows=' + formCount);
    console.log('§ADFORM-ORACLE Invoice→Receipt  notMatched=' + wantIS_N + ' matched=' + wantIS_M);
    console.log('§ADFORM-ORACLE Receipt→Order    notMatched=' + wantSO_N + ' matched=' + wantSO_M);

    browser = await reqPw().chromium.launch();
    var page = await browser.newPage();
    var logs = [], errs = [];
    page.on('console', function (m) { var t = m.text(); logs.push(t); if (/^§AD-FORM/.test(t)) log(t); });
    page.on('pageerror', function (e) { errs.push(String(e).slice(0, 220)); });

    await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin', { waitUntil: 'load' });
    await page.waitForSelector('#idmp-tree', { timeout: 25000 });
    await page.waitForTimeout(1500);

    // ── A — the form spine ───────────────────────────────────────────────────────────────────────────
    console.log('\n═══ A — an X menu leaf reaches its AD_Form row ═══\n');
    // Open the leaf the way a user does: expand its ancestor folders, then click the row. The tree keeps
    // every node in the DOM and hides it behind the parent's `.open` class (renderNode: a folder row toggles
    // wrap.classList), so the leaf is FOUND but not VISIBLE until its chain is opened — that is why the
    // first run of this witness timed out clicking a resolved locator.
    async function openMenuLeaf(name) {
      return page.evaluate(function (want) {
        var rows = Array.prototype.slice.call(document.querySelectorAll('#idmp-tree .idmp-row'));
        var row = rows.filter(function (r) { return (r.dataset.name || '') === String(want).toLowerCase(); })[0];
        if (!row) return { found: false };
        var n = row.parentElement;                       // walk up, opening every ancestor .idmp-node
        while (n && n.id !== 'idmp-tree') {
          if (n.classList && n.classList.contains('idmp-node')) {
            n.classList.add('open');
            var tw = n.firstElementChild && n.firstElementChild.querySelector('.tw');
            if (tw && tw.textContent === '\u25b8') tw.textContent = '\u25be';
          }
          n = n.parentElement;
        }
        row.click();
        return { found: true };
      }, name);
    }
    var leafCount = await page.locator('#idmp-tree .idmp-row').evaluateAll(function (rows, want) {
      return rows.filter(function (r) { return (r.dataset.name || '') === want; }).length;
    }, 'matching po-receipt-invoice');
    claim(leafCount === 1, 'A1: the "Matching PO-Receipt-Invoice" X leaf is in the role-scoped menu', 'count=' + leafCount);
    if (leafCount) { await openMenuLeaf('Matching PO-Receipt-Invoice'); await page.waitForTimeout(1500); }
    var openLine = logs.filter(function (l) { return /^§AD-FORM-LIVE open form=108/.test(l); }).pop() || '(none)';
    claim(/handled=Y/.test(openLine), 'A2: AD_Form 108 dispatches on its own Classname to a registered renderer', openLine);
    var hasCtl = await page.locator('select[data-match-from]').count();
    claim(hasCtl === 1, 'A3: the VMatch pane rendered (its Match-from control is on screen)', 'controls=' + hasCtl);

    // ── B — the Java's own Match-to pairing ──────────────────────────────────────────────────────────
    console.log('\n═══ B — Match.getMatchToOptions, verbatim ═══\n');
    async function toOpts() { return page.$$eval('select[data-match-to] option', function (os) { return os.map(function (o) { return o.value; }); }); }
    var optsI = await toOpts();
    await page.selectOption('select[data-match-from]', 'S'); await page.waitForTimeout(900);
    var optsS = await toOpts();
    await page.selectOption('select[data-match-from]', 'O'); await page.waitForTimeout(900);
    var optsO = await toOpts();
    console.log('§ADFORM-MATCHTO from=I->[' + optsI + '] from=S->[' + optsS + '] from=O->[' + optsO + ']');
    claim(String(optsI) === 'S', 'B1: Invoice matches only to Material Receipt', '[' + optsI + ']');
    claim(String(optsS) === 'I,O', 'B2: Material Receipt matches to Invoice and Order', '[' + optsS + ']');
    claim(String(optsO) === 'S', 'B3: Order matches only to Material Receipt (the Java: "only Match-to-Receipt is implemented in UI")', '[' + optsO + ']');

    // ── C — the rows are the Java's rows ─────────────────────────────────────────────────────────────
    console.log('\n═══ C — same population, same HAVING, both modes ═══\n');
    async function rowsFor(from, to, mode) {
      await page.selectOption('select[data-match-from]', from); await page.waitForTimeout(500);
      await page.selectOption('select[data-match-to]', to);
      await page.selectOption('select[data-match-mode]', mode);
      await page.waitForTimeout(1200);
      var line = logs.filter(function (l) { return /^§AD-FORM-MATCH dir=/.test(l); }).pop() || '';
      var m = /rows=(\d+)/.exec(line);
      return { n: m ? Number(m[1]) : -1, line: line, dom: await page.locator('[data-match-host] table tr').count() };
    }
    var isN = await rowsFor('I', 'S', 'N');
    claim(isN.n === wantIS_N, 'C1: Invoice→Receipt NOT MATCHED matches the Java SQL', 'browser=' + isN.n + ' oracle=' + wantIS_N + ' · ' + isN.line);
    claim(isN.dom === isN.n + 1, 'C1b: every counted row is actually IN THE TABLE (header + n)', 'domRows=' + isN.dom + ' expected=' + (isN.n + 1));
    var isM = await rowsFor('I', 'S', 'M');
    claim(isM.n === wantIS_M, 'C2: Invoice→Receipt MATCHED matches the Java SQL', 'browser=' + isM.n + ' oracle=' + wantIS_M);
    var soN = await rowsFor('S', 'O', 'N');
    claim(soN.n === wantSO_N, 'C3: Receipt→Order NOT MATCHED matches the Java SQL', 'browser=' + soN.n + ' oracle=' + wantSO_N);
    var soM = await rowsFor('S', 'O', 'M');
    claim(soM.n === wantSO_M, 'C4: Receipt→Order MATCHED matches the Java SQL', 'browser=' + soM.n + ' oracle=' + wantSO_M);
    // a renderer that ignored the mode would pass every claim above if the two happened to be equal
    claim(isN.n !== isM.n || soN.n !== soM.n, 'C5: the two modes really are different populations (the mode is not ignored)',
      'I>S ' + isN.n + ' vs ' + isM.n + ' · S>O ' + soN.n + ' vs ' + soM.n);
    claim(isN.n > 0 || isM.n > 0 || soN.n > 0 || soM.n > 0, 'C6: at least one direction is NON-EMPTY (this run is not vacuous)',
      [isN.n, isM.n, soN.n, soM.n].join('/'));

    // ── D — the honest absent card for an unimplemented form ─────────────────────────────────────────
    console.log('\n═══ D — a form with no renderer is honest, not blank ═══\n');
    var otherOpened = await openMenuLeaf('Payment Allocation');
    if (otherOpened && otherOpened.found) {
      await page.waitForTimeout(1200);
      var absLine = logs.filter(function (l) { return /^§AD-FORM-LIVE open form=/.test(l) && /handled=N/.test(l); }).pop() || '(none)';
      var chip = await page.locator('.idmp-procresult.absent .ok-chip').first().textContent().catch(function () { return null; });
      claim(/handled=N/.test(absLine), 'D1: an unregistered classname is reported as unhandled, by name', absLine);
      claim(chip === 'Not available', 'D2: it shows the honest "Not available" card, not a blank pane', 'chip=' + chip);
    } else {
      claim(false, 'D1: the "Payment Allocation" leaf was not in the menu — cannot judge the absent path', 'leaf absent');
    }

    claim(errs.length === 0, 'E1: 0 pageerrors across the whole form session', errs.join(' | '));
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
  if (harnessThrew) console.log('\n🔴 W-ADFORM-VMATCH FAIL — the harness threw before every claim was judged; ' + pass + ' PASS / ' + fail + ' FAIL of ' + claims.length + ' claims reached (an unfinished run is never a pass)');
  else if (!claims.length) console.log('\n🔴 W-ADFORM-VMATCH INCONCLUSIVE — no claim was judged (a 0 here means nothing)');
  else if (fail === 0) console.log('\n🟢 W-ADFORM-VMATCH PASS — ' + pass + ' PASS / 0 FAIL: the X menu leaf reaches its AD_Form, one form is implemented end to end, and its rows are the Java SQL\'s rows');
  else console.log('\n🔴 W-ADFORM-VMATCH FAIL — ' + pass + ' PASS / ' + fail + ' FAIL');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only — read the claims above)');
  process.exit(harnessThrew ? 1 : 0);
})();
