#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §ADFORM-TRXMATERIAL (owns §ERP-SESSION-CLOSE-2 §C2.3 item 2,
// E-3 "form #2 of 49"). THE CLAIM UNDER TEST (§TM.2), judged on the REAL menu leaf:
//
//   A. Menu leaf 229 reaches AD_Form 103 and dispatches on its OWN Classname
//      (org.compiere.apps.form.VTrxMaterial) — the shipped §AD-FORM-LIVE line says handled=Y, and the
//      "Not available" population drops by exactly one form.
//   B. The grid shows M_Transaction from BOTH sources (bundle + signed op log), and each of the six
//      TrxMaterial.refresh() restrictions filters the population the way the Java's MQuery does:
//      AD_Org_ID / M_Locator_ID / M_Product_ID / MovementType EQUAL, TRUNC(MovementDate) >= and <=.
//   C. Each row resolves its SOURCE by TrxMaterial.zoom()'s precedence — M_InOutLine, M_InventoryLine,
//      M_MovementLine, M_ProductionLine, C_ProjectIssue, first non-zero — else "Not found zoom table".
//
// Every expected count is computed HERE by sqlite3 against ad_seed.db, never typed. The filter claims
// are asserted to NARROW (a filter that changed nothing would otherwise pass), and the zoom claim is
// asserted across TWO different source tables, because a one-branch precedence proves no precedence.
// A break is a real finding: read the log, do not infer PASS from the exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_adform_trxmaterial.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
function log(m) { console.log('   ' + m); }
var claims = [];
function claim(ok, label, detail) { claims.push({ ok: !!ok, label: label }); console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function q(sql) {
  var out = cp.execFileSync('sqlite3', [path.join(ROOT, 'erp', 'ad_seed.db'), sql], { encoding: 'utf8' }).trim();
  return out === '' ? null : out;
}
function n(x) { return x == null ? null : Number(x); }

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
  var FORM = 103, MENU = 229;

  try {
    // ── the oracle ────────────────────────────────────────────────────────────────────────────────
    var cls = q('SELECT classname FROM ad_form WHERE ad_form_id=' + FORM + ';');
    var forms = n(q('SELECT COUNT(*) FROM ad_form;'));
    var total = n(q('SELECT COUNT(*) FROM m_transaction;'));
    var mtPick = 'V+';
    var byMt = n(q("SELECT COUNT(*) FROM m_transaction WHERE movementtype='" + mtPick + "';"));
    var prodPick = n(q('SELECT m_product_id FROM m_transaction GROUP BY m_product_id ORDER BY COUNT(*) DESC LIMIT 1;'));
    var byProd = n(q('SELECT COUNT(*) FROM m_transaction WHERE m_product_id=' + prodPick + ';'));
    var byBoth = n(q("SELECT COUNT(*) FROM m_transaction WHERE movementtype='" + mtPick + "' AND m_product_id=" + prodPick + ';'));
    var dFrom = q("SELECT date(MIN(movementdate),'+1 day') FROM m_transaction;");
    var byFrom = n(q("SELECT COUNT(*) FROM m_transaction WHERE date(movementdate)>=date('" + dFrom + "');"));
    var zInOut = n(q('SELECT COUNT(*) FROM m_transaction WHERE m_inoutline_id IS NOT NULL AND m_inoutline_id<>0;'));
    var zMove = n(q('SELECT COUNT(*) FROM m_transaction WHERE (m_inoutline_id IS NULL OR m_inoutline_id=0) AND (m_inventoryline_id IS NULL OR m_inventoryline_id=0) AND m_movementline_id IS NOT NULL AND m_movementline_id<>0;'));
    console.log('§TM-ORACLE form=' + FORM + ' classname=' + cls + ' totalForms=' + forms);
    console.log('§TM-ORACLE rows=' + total + ' | movementType ' + mtPick + '=' + byMt + ' | product ' + prodPick + '=' + byProd +
      ' | both=' + byBoth + ' | movementdate>=' + dFrom + '=' + byFrom);
    console.log('§TM-ORACLE zoom precedence: M_InOutLine=' + zInOut + ' M_MovementLine=' + zMove + ' (two different branches, so C is not a one-branch test)');

    browser = await reqPw().chromium.launch();
    var page = await browser.newPage();
    var logs = [], errs = [];
    page.on('console', function (m) { var t = m.text(); logs.push(t); if (/^§AD-FORM/.test(t)) log(t); });
    page.on('pageerror', function (e) { errs.push(String(e).slice(0, 200)); });

    await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin&form=' + FORM, { waitUntil: 'load' });
    // the deep link may not exist; the menu leaf is the real path either way.
    var opened = await page.waitForSelector('[data-trx-host]', { timeout: 12000 }).then(function () { return 'deeplink'; }).catch(function () { return null; });
    if (!opened) {
      await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin', { waitUntil: 'load' });
      await page.waitForSelector('#idmp-menu', { timeout: 25000 });
      // open every ancestor, then click the leaf by its AD_Menu name (the tree hides leaves behind .open —
      // the instrument fault §AF.5 records; not repaid here).
      var name = q('SELECT name FROM ad_menu WHERE ad_menu_id=' + MENU + ';');
      var clicked = await page.evaluate(function (nm) {
        var els = Array.from(document.querySelectorAll('#idmp-menu *'));
        var leaf = els.filter(function (e) { return e.children.length === 0 && (e.textContent || '').trim() === nm; })[0];
        if (!leaf) return 'no-leaf';
        var p = leaf.parentElement;
        while (p && p.id !== 'idmp-menu') { p.classList.add('open'); p = p.parentElement; }
        leaf.click(); return 'clicked';
      }, name);
      log('§TM-NAV leaf="' + name + '" ' + clicked);
      opened = await page.waitForSelector('[data-trx-host]', { timeout: 12000 }).then(function () { return 'menu'; }).catch(function () { return null; });
    }
    log('§TM-NAV opened via ' + (opened || 'NOTHING'));

    // ── A — the leaf dispatched on the row's own classname ─────────────────────────────────────────
    // JUDGED BEFORE the pane is required, deliberately: on plain main the leaf DOES reach AD_Form 103 and
    // DOES log its verdict — it just shows the "Not available" card. Asserting A first means the baseline
    // run reports three JUDGED failures instead of only "the harness threw", which is the difference
    // between a red witness and an INCONCLUSIVE one (§CLOSE.7 / WITNESS_INTERFACE_FRAMEWORK rule 4).
    console.log('\n═══ A — the menu leaf reaches AD_Form ' + FORM + ' and dispatches on its own Classname ═══\n');
    var openLine = logs.filter(function (l) { return l.indexOf('§AD-FORM-LIVE open form=' + FORM + ' ') === 0; }).pop() || '(no §AD-FORM-LIVE line)';
    claim(/handled=Y/.test(openLine), 'A1: AD_Form ' + FORM + ' is HANDLED, not the "Not available" card', openLine);
    claim(openLine.indexOf('classname=' + cls) >= 0, 'A2: it dispatched on the AD row s OWN classname', 'classname=' + cls);
    var registered = (openLine.match(/registered=\[([^\]]*)\]/) || [null, ''])[1].split(',').filter(Boolean);
    claim(registered.length === 2, 'A3: two of ' + forms + ' forms are now implemented (was one)', 'registered=[' + registered.join(',') + ']');

    if (!opened) throw new Error('the VTrxMaterial pane never rendered — B and C could not be judged');
    await page.waitForTimeout(600);

    // ── B — the population, and each filter NARROWING it ───────────────────────────────────────────
    console.log('\n═══ B — both sources, and the six TrxMaterial.refresh() restrictions ═══\n');
    function trxLine() { return logs.filter(function (l) { return l.indexOf('§AD-FORM-TRX ') === 0; }).pop() || ''; }
    function trxRows() { var m = trxLine().match(/ rows=(\d+)/); return m ? Number(m[1]) : -1; }
    function bodyRows() { return page.$$eval('[data-trx-host] table tr', function (rs) { return rs.length - 1; }).catch(function () { return -1; }); }
    var appendLine = logs.filter(function (l) { return l.indexOf('§AD-FORM-APPENDONLY table=m_transaction') === 0; }).pop() || '(no §AD-FORM-APPENDONLY line)';
    var unfiltered = trxRows(), unfilteredDom = await bodyRows();
    console.log('§TM-B unfiltered rows(log)=' + unfiltered + ' rows(DOM)=' + unfilteredDom + ' oracle=' + total);
    var am = appendLine.match(/bundle=(\d+) oplog=(\d+) total=(\d+)/);
    claim(!!am, 'B1: the grid reads BOTH sources — bundle AND the signed op log', appendLine);
    // HONEST about what this run proves: on a cold session the op log holds no M_Transaction, so oplog=0
    // and only the ARITHMETIC of the merge is judged here. The non-zero side of the same function is
    // witnessed by W-P2P-INVOICE-MATCH, whose §AD-FORM-APPENDONLY line for the match junctions carries
    // oplog>0 — it is one shared reader (_appendOnlyRowsFor), not two.
    claim(!!am && Number(am[3]) === Number(am[1]) + Number(am[2]),
      'B1b: total = bundle + oplog (this run: oplog=' + (am ? am[2] : '?') + ' on a cold session; W-P2P covers the non-zero side)', appendLine);
    claim(unfiltered === total, 'B2: unfiltered, the grid shows every M_Transaction row in the client', 'grid=' + unfiltered + ' oracle=' + total);
    claim(unfilteredDom === total, 'B3: and the DOM carries them, not just the log', 'domRows=' + unfilteredDom + ' oracle=' + total);

    async function setSel(attr, value) { await page.selectOption('[' + attr + ']', String(value)); await page.waitForTimeout(400); }
    await setSel('data-trx-mt', mtPick);
    var afterMt = trxRows();
    console.log('§TM-B movementType=' + mtPick + ' rows=' + afterMt + ' oracle=' + byMt);
    claim(afterMt === byMt, 'B4: MovementType EQUAL filters to the seed s own count', 'grid=' + afterMt + ' oracle=' + byMt);
    claim(byMt < total, 'B4b: that filter actually NARROWS (a no-op filter would pass B4 too)', byMt + ' < ' + total);

    await setSel('data-trx-prod', prodPick);
    var afterBoth = trxRows();
    console.log('§TM-B + product=' + prodPick + ' rows=' + afterBoth + ' oracle=' + byBoth);
    claim(afterBoth === byBoth, 'B5: the restrictions AND together, as MQuery does', 'grid=' + afterBoth + ' oracle=' + byBoth);
    claim(byBoth < byMt, 'B5b: and the second one narrows further', byBoth + ' < ' + byMt);

    await setSel('data-trx-mt', '');
    await setSel('data-trx-prod', '');
    claim(trxRows() === total, 'B6: clearing a filter restores the full population (blank means "no restriction")', 'grid=' + trxRows() + ' oracle=' + total);

    await page.fill('[data-trx-from]', dFrom);
    await page.$eval('[data-trx-from]', function (e) { e.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(400);
    var afterFrom = trxRows();
    console.log('§TM-B movementdate >= ' + dFrom + ' rows=' + afterFrom + ' oracle=' + byFrom);
    claim(afterFrom === byFrom, 'B7: TRUNC(MovementDate) >= compares the DATE part only', 'grid=' + afterFrom + ' oracle=' + byFrom);
    claim(byFrom < total, 'B7b: and it narrows', byFrom + ' < ' + total);
    await page.fill('[data-trx-from]', '');
    await page.$eval('[data-trx-from]', function (e) { e.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(400);

    // ── C — the zoom precedence, across two different source tables ───────────────────────────────
    console.log('\n═══ C — TrxMaterial.zoom() resolves each row s source document ═══\n');
    var sources = await page.$$eval('[data-trx-host] table tr td:last-child', function (ts) { return ts.map(function (t) { return t.textContent.trim(); }); });
    var cnt = {};
    sources.forEach(function (s) { var k = s.split(' ')[0]; cnt[k] = (cnt[k] || 0) + 1; });
    console.log('§TM-C source column tally=' + JSON.stringify(cnt));
    claim((cnt.M_InOutLine || 0) === zInOut, 'C1: rows carrying M_InOutLine_ID resolve to M_InOutLine', 'grid=' + (cnt.M_InOutLine || 0) + ' oracle=' + zInOut);
    claim((cnt.M_MovementLine || 0) === zMove, 'C2: rows carrying only M_MovementLine_ID resolve to M_MovementLine', 'grid=' + (cnt.M_MovementLine || 0) + ' oracle=' + zMove);
    claim(zInOut > 0 && zMove > 0, 'C3: TWO different branches of the precedence are exercised, so C1/C2 prove an order', 'inOut=' + zInOut + ' movement=' + zMove);
    var pairOk = await page.$$eval('[data-trx-host] table tr td:last-child', function (ts) {
      return ts.every(function (t) { var s = t.textContent.trim(); return s === 'Not found zoom table' || /^[A-Za-z_]+ \d+$/.test(s); });
    });
    claim(pairOk, 'C4: every source cell is either a (table, id) pair or the Java s own "Not found zoom table"');

    claim(errs.length === 0, 'D1: 0 pageerrors', errs.join(' | '));
    await page.close();
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW: ' + (e && e.message));
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  var pass = claims.filter(function (c) { return c.ok; }).length, fail = claims.length - pass;
  claims.forEach(function (c) { console.log('  ' + (c.ok ? 'PASS' : 'FAIL') + ' ' + c.label); });
  if (!claims.length) console.log('\n🔴 W-ADFORM-TRXMATERIAL INCONCLUSIVE — no claim was judged (a 0 here means nothing)');
  else if (harnessThrew) console.log('\n🔴 W-ADFORM-TRXMATERIAL INCONCLUSIVE — the harness threw before every claim was judged (' + pass + ' PASS / ' + fail + ' FAIL of ' + claims.length + ' reached)');
  else if (fail === 0) console.log('\n🟢 W-ADFORM-TRXMATERIAL PASS — ' + pass + ' PASS / 0 FAIL');
  else console.log('\n🔴 W-ADFORM-TRXMATERIAL FAIL — ' + pass + ' PASS / ' + fail + ' FAIL');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only — read the claims above)');
  process.exit(harnessThrew ? 1 : 0);
})();
