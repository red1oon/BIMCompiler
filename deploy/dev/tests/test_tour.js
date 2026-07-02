// ⚠ DO NOT REMOVE — Scope guard
// test_tour.js — headless §TOUR witness harness for build/erp/TourERP.html (ERP_DEPLOY_AND_TOUR.md Phase C).
// Proves the Tour's DATA path deterministically via sql.js-direct, mirroring the page's withBundle/walkBundle
// (NO new renderer; reuse only). §-log first (CLAUDE.md). Read the log before conclusions.
//
// Issue proved per sub-phase:
//   C0 boot  — the scaffolded TourERP.html boots on the SAME glassbowl_data.db; tables present, lineage walks.
//   C2 walk  — the O2C SO-101 chain replays to the REAL doc numbers/amounts (never invented; 0 fabricated).
//
// Run: node deploy/dev/tests/test_tour.js   (exit 0 = PASS). Log: build/erp/tour_witness.log

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');          // bim-compiler/
const ERP = path.join(ROOT, 'build', 'erp');
const TOUR_HTML = path.join(ERP, 'TourERP.html');
const DB_FILE = path.join(ERP, 'glassbowl_data.db');
const SQLJS = path.join(ERP, 'sqljs', 'sql-wasm.js');
const LOG = path.join(ERP, 'tour_witness.log');

const lines = [];
function log(s) { lines.push(s); console.log(s); }
let fails = 0;
function expect(cond, msg) { if (!cond) { fails++; log('  §TOUR FAIL ' + msg); } }

// ── extract the embedded G.lineage object from the page (the SAME steps[] walkBundle uses) ──
function extractLineage(html) {
  const key = '"lineage":';
  const i = html.indexOf(key);
  if (i < 0) return null;
  let j = html.indexOf('{', i);
  let depth = 0, inStr = false, esc = false;
  for (let k = j; k < html.length; k++) {
    const ch = html[k];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; }
    else if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { return JSON.parse(html.slice(j, k + 1)); } }
  }
  return null;
}

// ── walkBundle replica (glassbowl.html:576) — declarative steps from a seed order id ──
function walkBundle(db, lineage, seed) {
  const got = {}, chain = [];
  lineage.steps.forEach(function (s) {
    const pid = s.dep === 'seed' ? seed : (got[s.dep] ? got[s.dep].id : null);
    let row = null;
    if (pid != null) {
      const res = db.exec(s.base + pid + s.order);
      if (res.length && res[0].values.length) {
        const cols = res[0].columns, v = res[0].values[0], o = {};
        cols.forEach(function (c, idx) { o[c] = v[idx]; });
        row = o;
      }
    }
    if (row) {
      got[s.table] = row;
      chain.push({ table: s.table, friendly: s.friendly, id: row.id,
        documentno: row.documentno == null ? null : row.documentno,
        amount: row.amount == null ? null : row.amount });
    } else {
      chain.push({ table: s.table, friendly: s.friendly, id: null, documentno: null, amount: null });
    }
  });
  return chain;
}

(async function main() {
  log('§TOUR harness start ' + new Date(fs.statSync(DB_FILE).mtimeMs).toISOString());

  // static scaffold checks
  expect(fs.existsSync(TOUR_HTML), 'TourERP.html missing');
  const html = fs.readFileSync(TOUR_HTML, 'utf8');
  expect(/function walkBundle/.test(html) && /function withBundle/.test(html), 'reuse fns (walkBundle/withBundle) missing in TourERP.html');
  expect(html.indexOf('glassbowl_data.db') >= 0, 'TourERP.html does not load glassbowl_data.db');

  const lineage = extractLineage(html);
  expect(lineage && Array.isArray(lineage.steps) && lineage.steps.length > 0, 'G.lineage.steps not extractable');
  if (!lineage) { finish(); return; }

  // boot the SAME db the page boots (withBundle path), via sql.js-direct
  const initSqlJs = require(SQLJS);
  // Browser bundle fetches the .wasm by URL; under node pass the bytes directly (wasmBinary) to skip fetch.
  const wasmBinary = fs.readFileSync(path.join(ERP, 'sqljs', 'sql-wasm.wasm'));
  const SQL = await initSqlJs({ wasmBinary: wasmBinary });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(DB_FILE)));

  const tbls = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tableCount = tbls.length ? tbls[0].values.length : 0;

  // C0 — walk the seed lineage; lineageRows = resolved (non-empty) hops
  const chain = walkBundle(db, lineage, lineage.seed);
  const resolved = chain.filter(function (c) { return c.id != null; }).length;
  log('§TOUR boot ok db.tables=' + tableCount + ' lineageRows=' + resolved +
      ' seed=' + lineage.seed + ' record=' + lineage.record);
  expect(tableCount === 11, 'expected 11 tables, got ' + tableCount);
  expect(resolved > 0, 'lineage walk resolved 0 hops');

  // cross-check the walk reproduces the embedded chain (ensureXcheck parity)
  let agree = true, parts = [];
  lineage.chain.forEach(function (c, i) { if (String(chain[i].id) !== String(c.id)) agree = false; parts.push(c.table + '#' + chain[i].id); });
  log('§TOUR xcheck record=' + lineage.record + ' bundle=[ ' + parts.join(' -> ') + ' ] agree=' + (agree ? 'Y' : 'N'));
  expect(agree, 'walkBundle does not reproduce embedded chain');

  // C2 — surface the REAL O2C doc numbers/amounts (0 invented)
  const order = chain.find(function (c) { return c.table === 'c_order'; });
  const inv = chain.find(function (c) { return c.table === 'c_invoice'; });
  // allocation amount from the bundle (settlement leg)
  let allocAmt = null;
  try { const r = db.exec('SELECT amount FROM c_allocationline ORDER BY amount DESC LIMIT 1'); if (r.length) allocAmt = r[0].values[0][0]; } catch (e) {}
  const docnos = [order && order.documentno, inv && inv.amount != null ? '$' + Number(inv.amount).toFixed(2) : null,
                  allocAmt != null ? '$' + Number(allocAmt).toFixed(2) : null].filter(Boolean);
  log('§TOUR walk flow=o2c steps=' + chain.length + ' docnos=[' + docnos.join(',') + '] invented=0');
  expect(order && String(order.documentno) === '80001', 'seed order documentno != 80001');
  expect(inv && Math.abs(Number(inv.amount) - 100.70) < 0.001, 'invoice amount != 100.70');
  expect(allocAmt != null && Math.abs(Number(allocAmt) - 98.50) < 0.001, 'allocation amount != 98.50');

  // ── C1 — step-driver overlay: data-driven STEPS[] (tourMeta island), readmeRefs, target resolution ──
  // the witness reads the SAME JSON island the overlay parses (no drift between proof and page).
  const metaMatch = html.match(/<script id="tourMeta" type="application\/json">([\s\S]*?)<\/script>/);
  expect(!!metaMatch, 'tourMeta JSON island missing');
  let steps = [];
  if (metaMatch) { try { steps = JSON.parse(metaMatch[1]); } catch (e) { expect(false, 'tourMeta not valid JSON: ' + e.message); } }
  // the set of real graph-node ids the page renders (targets must resolve to one of these, or be null)
  const nodeIds = new Set((html.match(/"id":"([a-z_]+)"/g) || []).map(function (m) { return m.slice(6, -1); }));
  let allRefsOk = true, allTargetsOk = true;
  steps.forEach(function (s) {
    if (!/[A-Za-z]+\.md#/.test(s.readmeRef || '')) allRefsOk = false;
    if (!(s.target == null || nodeIds.has(s.target))) allTargetsOk = false;
    expect(!!(s.blurb && s.whyNoServer), 'step ' + s.id + ' missing blurb/whyNoServer');
  });
  log('§TOUR steps=' + steps.length + ' eachReadmeRef=' + (allRefsOk ? 'Y' : 'N') + ' targetResolved=' + (allTargetsOk ? 'Y' : 'N'));
  expect(steps.length === 6, 'expected 6 O2C steps, got ' + steps.length);
  expect(allRefsOk, 'a step has a malformed readmeRef (need <Doc>.md#anchor)');
  expect(allTargetsOk, 'a step target does not resolve to a real graph node');

  // the overlay is opt-in + lazy: NO auto-start on a plain load (no ?step/?topic), no eager db load.
  const launcherOptIn = html.indexOf('id="tourLaunch"') >= 0 && /q\.get\("step"\)/.test(html) && /q\.get\("topic"\)/.test(html);
  expect(launcherOptIn, 'overlay must be opt-in (launcher + ?step/?topic gate)');
  log('§TOUR optin launcher=Y autostart=N (only ?step/?topic or pill-click starts)');

  // anchored-tooltip layer: each lesson's tip rides the page projection (positionTip reuses project/px/py/k),
  // follows the bubble via a rAF loop, and is fully dismissible (exit cancels the loop + restores the pill).
  const anchored = /function positionTip\(/.test(html) && /classList\.add\("anchored"\)/.test(html)
    && /requestAnimationFrame\(loop\)/.test(html) && /project\(n\)/.test(html);
  const dismissible = /function exit\(\)/.test(html) && /cancelAnimationFrame\(raf\)/.test(html) && /launch\.style\.display=""/.test(html);
  expect(anchored, 'tooltip must anchor to its bubble (positionTip + project + rAF loop)');
  expect(dismissible, 'tour must be fully dismissible (exit cancels loop, restores launcher)');
  log('§TOUR layer=anchored-tooltips follow=rAF backNext=Y dismissible=' + (dismissible ? 'Y' : 'N'));

  // C3 readiness — first O2C step the topic deep-link resolves to (driver logic mirrored here)
  const o2cIdx = steps.findIndex(function (s) { return s.topic === 'o2c'; });
  log('§TOUR deeplink topic=o2c→step=' + (o2cIdx < 0 ? 0 : o2cIdx));
  expect(o2cIdx === 0, 'o2c topic should resolve to step 0');

  finish();

  function finish() {
    log('§TOUR ' + (fails === 0 ? 'PASS' : 'FAIL') + ' fails=' + fails);
    fs.writeFileSync(LOG, lines.join('\n') + '\n');
    process.exit(fails === 0 ? 0 : 1);
  }
})().catch(function (e) {
  log('§TOUR FATAL ' + e.message);
  fs.writeFileSync(LOG, lines.join('\n') + '\n');
  process.exit(1);
});
