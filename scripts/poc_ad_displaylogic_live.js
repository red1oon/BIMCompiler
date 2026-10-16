// W-AD-DISPLAYLOGIC-LIVE — prove the LIVE idempiere.html record form hides fields whose AD DisplayLogic
// is FALSE for the open record. Implementing prompts/ERP_IDEMPIERE_UX_PARITY.md §P11.3.
//
// ⚠ REWRITTEN 2026-09-03. The previous version counted `#idmp-form .idmp-fld` and CamelCase
// [data-ad-column="ChargeAmt"]. Those belong to idempiere.html:_appendReadonlyFields — its own comment
// calls it "the classic read-only field render (the FALLBACK when a table has no crud spec)" (:2946).
// Since #1613 every document table takes the INLINE path instead (canInline, :2928 → __crud.editInline),
// which renders `.cfrow` rows with LOWERCASE data-ad-column and applies AD logic via
// crud_overlay.js:applyAdLogic (:504). The witness was reporting shown=1 hiddenByLogic=0 on a DOM the
// product no longer builds — a stale instrument, not a product gap (§P11.1).
//
// WHAT IS JUDGED (per table, two tables so this is not a single-case witness):
//   1. §AD-LOGIC-LIVE emitted with withLogic>0        — else VACUOUS, never PASS (nothing to judge).
//   2. DOM: .cfrow rows with display:none > 0         — the INDEPENDENT oracle. The §-line is emitted by
//      the same function that hides, so asserting on it alone would be tautological.
//   3. falsifier A: a named FALSE-logic column is in the DOM but HIDDEN (regress to "show everything" → FAIL).
//   4. falsifier B: a named NO-logic column renders and is VISIBLE  (regress to "hide everything" → FAIL).
//   5. §AD-DISPLAYLOGIC-FALLBACK reports the .idmp-fld count — REPORTED, never asserted (§P11.2: the
//      fallback did not render for either table probed; the day it does again must be visible).
// Every named column is EXTRACTED from the measured runs in §P11.1/§P11.2, never chosen by hand.
// NAMED RESIDUAL (unchanged): window-context vars (@OrderType@, @$Element_*@ — set by callout/session in
// real iDempiere) are unpopulated here, so those expressions evaluate against the record only. Empty-context
// false is faithful Evaluator semantics, not a parser gap.
// Run: ERP_ROOT=/tmp/wt-x/erp node scripts/poc_ad_displaylogic_live.js   (default ~/bim-ootb/erp)
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ERP_ROOT || path.join(process.env.HOME, 'bim-ootb', 'erp');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css' };

// The two records under test. `hiddenCol` carries real DisplayLogic that is FALSE for this record;
// `shownCol` carries none. Both were read off the measured runs recorded in §P11.1/§P11.2.
const CASES = [
  { name: 'c_order (curated table)',   window: 143, record: 100,     key: 'c_order',   hiddenCol: 'chargeamt',    shownCol: 'documentno' },
  { name: 'fact_acct (AD-folded tab)', window: 162, record: 1000000, key: 'fact_acct', hiddenCol: 'c_project_id', shownCol: 'dateacct' }
];

const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/idempiere.html';
  fs.readFile(path.join(ROOT, p), (e, b) => {
    if (e) { r.writeHead(404); r.end('404'); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
  });
});

const results = [];
function ck(ok, what, detail) { results.push({ ok: !!ok, what, detail }); console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + what + (detail ? '  ·  ' + detail : '')); }

(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const br = await chromium.launch();
  let vacuous = 0;
  for (const c of CASES) {
    const pg = await br.newContext().then(x => x.newPage());
    const logLines = [];
    pg.on('console', m => { const t = m.text(); if (t.indexOf('§AD-LOGIC-LIVE') === 0 || t.indexOf('§AD-DISPLAYLOGIC-LIVE') === 0) logLines.push(t); });
    await pg.goto(`http://localhost:${port}/idempiere.html?login=GardenAdmin&window=${c.window}&record=${c.record}`, { waitUntil: 'networkidle' });
    await pg.waitForSelector('#idmp-form', { timeout: 20000 });
    await pg.waitForTimeout(2000);   // applyAdLogic runs after the inline mount paints

    // ── the DOM oracle (independent of the §-line the hiding function prints) ──
    const dom = await pg.$$eval('#idmp-form .cfrow', es => ({
      total: es.length,
      hidden: es.filter(e => e.style.display === 'none').length,
      hiddenCols: es.filter(e => e.style.display === 'none').map(e => e.getAttribute('data-row'))
    }));
    const fallbackFlds = await pg.$$eval('#idmp-form .idmp-fld', es => es.length);
    const rowState = await pg.$$eval('#idmp-form .cfrow', es => es.map(e => [e.getAttribute('data-row'), e.style.display]));
    const stateOf = col => { const r = rowState.find(x => x[0] === col); return r ? (r[1] === 'none' ? 'hidden' : 'visible') : 'absent'; };

    const line = logLines.filter(t => t.indexOf('§AD-LOGIC-LIVE') === 0).pop() || '';
    const mWith = /withLogic=(\d+)/.exec(line), mFlips = /visibilityFlips=(\d+)/.exec(line);
    const withLogic = mWith ? Number(mWith[1]) : 0, flips = mFlips ? Number(mFlips[1]) : 0;

    console.log('\n── ' + c.name + '  window=' + c.window + ' record=' + c.record + ' ──');
    console.log('   ' + (line || '(no §AD-LOGIC-LIVE line emitted)'));
    console.log('§AD-DISPLAYLOGIC-LIVE key=' + c.key + ' rows=' + dom.total + ' hiddenByLogic=' + dom.hidden +
      ' withLogic=' + withLogic + ' flips=' + flips + ' ' + c.hiddenCol + '=' + stateOf(c.hiddenCol) +
      ' ' + c.shownCol + '=' + stateOf(c.shownCol) + ' hiddenCols=' + dom.hiddenCols.join(','));
    console.log('§AD-DISPLAYLOGIC-FALLBACK key=' + c.key + ' idmp-fld=' + fallbackFlds +
      ' (the pre-#1613 read-only render — REPORTED, not asserted; §P11.2)');

    if (withLogic === 0) {                                  // law 4: a 0 over an empty population means nothing
      vacuous++;
      console.log('   ⚪ INCONCLUSIVE — withLogic=0: this record carries no AD logic, so hiddenByLogic=0 proves nothing');
      await pg.close(); continue;
    }
    ck(dom.total > 0, c.key + ': the live inline form rendered its field rows', 'rows=' + dom.total);
    ck(dom.hidden > 0, c.key + ': DOM shows rows HIDDEN by DisplayLogic (independent of the §-line)', 'hidden=' + dom.hidden + '/' + dom.total);
    ck(flips > 0, c.key + ': applyAdLogic reported visibility flips', 'flips=' + flips + ' withLogic=' + withLogic);
    ck(stateOf(c.hiddenCol) === 'hidden', c.key + ': falsifier A — false-logic ' + c.hiddenCol + ' is present but HIDDEN', c.hiddenCol + '=' + stateOf(c.hiddenCol));
    ck(stateOf(c.shownCol) === 'visible', c.key + ': falsifier B — no-logic ' + c.shownCol + ' renders and is VISIBLE', c.shownCol + '=' + stateOf(c.shownCol));
    await pg.close();
  }
  await br.close(); server.close();

  const fail = results.filter(r => !r.ok).length, pass = results.length - fail;
  if (!results.length || vacuous === CASES.length) {
    console.log('\n⚪ W-AD-DISPLAYLOGIC-LIVE INCONCLUSIVE — every case was vacuous (' + vacuous + '/' + CASES.length + '); nothing was judged');
    process.exit(3);
  }
  console.log('\n' + (fail
    ? '🔴 W-AD-DISPLAYLOGIC-LIVE FAIL — ' + pass + ' PASS / ' + fail + ' FAIL' + (vacuous ? ' (' + vacuous + ' case vacuous)' : '')
    : '🟢 W-AD-DISPLAYLOGIC-LIVE PASS — ' + pass + ' PASS / 0 FAIL' + (vacuous ? ' (' + vacuous + ' case vacuous)' : '') +
      ' — the live form hides fields by real AD DisplayLogic, over ' + (CASES.length - vacuous) + ' tables, judged on the DOM'));
  process.exit(fail ? 2 : 0);
})().catch(e => { console.log('🔴 W-AD-DISPLAYLOGIC-LIVE FAIL — ' + e.message); process.exit(1); });
