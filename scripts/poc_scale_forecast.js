#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// PROD_SCALE_FORECAST (prompts/PROD_SCALE_FORECAST.md). Drive the REAL fold engine at production-iDempiere
//   cardinalities, measure where its OWN internal lag crosses the user-perceptible budget on each surface
//   (S-WRITE O(live docs) · S-BOOT O(total ops) · S-STORE bytes/op · S-THRU batch), FIT each measured curve
//   to its known complexity, then forecast docs/day + ERP-department size per tier WITH/WITHOUT each
//   mitigation (checkpoint / batch / prune). NON-INVENT: every forecast cell is a fit to MEASURED points;
//   the production profile is sized from the REAL oracle (glassbowl_data.db cardinalities), never assumed.
//   READ the §SCALE-* lines + the forecast table before any conclusion.
// Run: bash build/erp/run_witness.sh scripts/poc_scale_forecast.js   (→ build/erp/poc_scale_forecast.log)
'use strict';
var path = require('path');
var fs = require('fs');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');

// load the engine the BROWSER loads (UMD → window globals), via a window shim — same as spike_writepath.js.
global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require('./erp_kernel');          // window.ERPKernel
require('./erp_seam');            // window.ERPSeam
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));      // window.KernelOps
var PC = require(path.join(__dirname, '..', 'build', 'erp', 'erp_period_close.js'));  // foldBalances (the genesis fold)
var K = global.window.ERPKernel, Seam = global.window.ERPSeam, KO = global.window.KernelOps;

var GB   = path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db');
var AD   = path.join(__dirname, '..', 'build', 'erp', 'post_poc', 'ad_seed.db');
var WFMC = require(path.join(process.env.HOME, 'bim-ootb', 'erp', 'manifest.json')).wfmc;
var OUT_MD   = path.join(__dirname, '..', 'build', 'erp', 'scale_forecast.md');
var OUT_JSON = path.join(__dirname, '..', 'build', 'erp', 'scale_forecast.json');

// ── meter + fit helpers (the HARNESS measures; the engine stays deterministic) ──────────────────────
function now() { return Number(process.hrtime.bigint()) / 1e6; }     // ms
function pct(arr, p) { var a = arr.slice().sort(function (x, y) { return x - y; }); return a[Math.min(a.length - 1, Math.floor(a.length * p))]; }
function avg(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
function kb(n) { return (n / 1024).toFixed(1) + 'KB'; }
function mb(n) { return (n / 1048576).toFixed(1) + 'MB'; }
// least-squares linear fit y ≈ a + b·x with R² — the honesty gate (R²<0.95 ⇒ shape uncertain, do not extrapolate).
function lsfit(pts) {
  var n = pts.length, xb = avg(pts.map(function (p) { return p.x; })), yb = avg(pts.map(function (p) { return p.y; }));
  var sxx = 0, sxy = 0, sst = 0;
  pts.forEach(function (p) { sxx += (p.x - xb) * (p.x - xb); sxy += (p.x - xb) * (p.y - yb); sst += (p.y - yb) * (p.y - yb); });
  var b = sxx ? sxy / sxx : 0, a = yb - b * xb, ssr = 0;
  pts.forEach(function (p) { var e = p.y - (a + b * p.x); ssr += e * e; });
  var r2 = sst ? 1 - ssr / sst : 1;
  return { a: a, b: b, r2: r2, at: function (x) { return a + b * x; }, crossAt: function (y) { return b ? (y - a) / b : Infinity; } };
}
function tag(measured) { return measured ? '(measured)' : '(forecast)'; }

(async function () {
  var gb = new Database(GB, { readonly: true });
  var ad = new Database(AD, { readonly: true });
  var gbQ = function (s, p) { return gb.prepare(s).all(p || []); };
  var adQ = function (s, p) { return ad.prepare(s).all(p || []); };
  var SQL = await initSqlJs();
  var newDb = function () { return new SQL.Database(); };
  var RESULT = {};

  console.log('═══ PROD SCALE FORECAST — real fold engine, measured curves → docs/day + ERP-dept forecast ═══');
  console.log('engine=ERPSeam.dispatch→ERPKernel(sql.js) + KernelOps(sealed) + erp_period_close.foldBalances');
  console.log('oracle=glassbowl_data.db  wfmc=' + WFMC.states.length + ' states\n');

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §2.2  DOC MIX + GL DEPTH — sized from the REAL oracle (not assumed). §SCALE-MIX
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  function cnt(t) { try { return gbQ('SELECT COUNT(*) c FROM ' + t)[0].c; } catch (e) { return 0; } }
  var mix = { orders: cnt('c_order'), invoices: cnt('c_invoice'), shipments: cnt('m_inout'),
              payments: cnt('c_payment'), factrows: cnt('fact_acct') };
  // GL depth = fact_acct lines per posted document (distinct ad_table_id+record_id groups).
  var postedDocs = gbQ('SELECT COUNT(*) c FROM (SELECT 1 FROM fact_acct GROUP BY ad_table_id, record_id)')[0].c || 1;
  var factPerDoc = mix.factrows / postedDocs;
  RESULT.mix = mix; RESULT.factPerDoc = factPerDoc; RESULT.postedDocs = postedDocs;
  console.log('§SCALE-MIX orders=' + mix.orders + ' invoices=' + mix.invoices + ' shipments=' + mix.shipments +
    ' payments=' + mix.payments + ' factRows=' + mix.factrows + ' postedDocs=' + postedDocs +
    ' factLines/doc=' + factPerDoc.toFixed(2) + '  (sized from oracle — non-invent)');

  // real GL line shape — EXTRACT ONE REPRESENTATIVE posted journal (line count closest to the measured
  // average; a real Fact_Acct doc balances by construction ΣDR==ΣCR), so the POST verb's double-entry
  // invariant holds without inventing amounts AND the per-op fold weight is typical (not an outlier).
  var oneDoc = gbQ('SELECT ad_table_id t, record_id r, COUNT(*) n FROM fact_acct GROUP BY ad_table_id, record_id ORDER BY ABS(COUNT(*)-?) ASC, n DESC LIMIT 1', [Math.round(factPerDoc)])[0];
  var realLines = gbQ('SELECT account_id, amtacctdr, amtacctcr FROM fact_acct WHERE ad_table_id=? AND record_id=?', [oneDoc.t, oneDoc.r])
    .map(function (r) { return { account_id: String(r.account_id), amtacctdr: Number(r.amtacctdr || 0), amtacctcr: Number(r.amtacctcr || 0) }; });
  if (!realLines.length) realLines = [{ account_id: '1', amtacctdr: 100, amtacctcr: 0 }, { account_id: '2', amtacctdr: 0, amtacctcr: 100 }];
  var glLinesPerDoc = realLines.length;     // the real journal's actual line count

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §2.1  OPS/DOC — MEASURED from the real write path (kernel_ops rows a doc lifecycle appends). §SCALE-OPSDOC
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  var op0 = newDb(); K.initProjection(op0);
  K.register('C_Invoice', 'CO', function (doc, ctx) { return [{ op_type: 'SET_STATUS', table: doc.table, id: doc.id, doc_status: ctx.to, uuid: doc.uuid }]; });
  var seam0 = Seam.makeSeam({ projDb: op0, adQ: adQ, factQ: gbQ, wfmc: WFMC, newDb: newDb });
  var ctx0 = { actor: 'user:alice', role: { actions: ['C_Invoice:CO'] }, allowOrgs: '*' };
  function opCount(db) { return K.query(db, 'SELECT COUNT(*) c FROM kernel_ops')[0].c; }
  var b4 = opCount(op0);
  K.apply(op0, [{ op_type: 'CREATE_DOCUMENT', table: 'C_Invoice', source_id: 'OPS1', doc_status: 'DR', uuid: 'DOC:C_Invoice#OPS1' }], { actor: 'user:alice', baseTs: 1000 });
  var afterCreate = opCount(op0);
  seam0.dispatch({ docType: 'C_Invoice', table: 'C_Invoice', action: 'CO', status: 'DR', id: 'OPS1', uuid: 'DOC:C_Invoice#OPS1' }, ctx0);
  var afterComplete = opCount(op0);
  K.apply(op0, [{ op_type: 'POST', table: 'C_Invoice', id: 'OPS1', acctschema: 101, lines: realLines.slice(0, glLinesPerDoc) }], { actor: 'plugin:post', baseTs: 9000 });
  var afterPost = opCount(op0);
  var kCreate = afterCreate - b4, kComplete = afterComplete - afterCreate, kPost = afterPost - afterComplete;
  var kFull = afterPost - b4;     // ops appended for a created→completed→posted document lifecycle
  RESULT.opsDoc = { create: kCreate, complete: kComplete, post: kPost, full: kFull, glLinesPerDoc: glLinesPerDoc };
  console.log('§SCALE-OPSDOC create=' + kCreate + ' complete=' + kComplete + ' post=' + kPost +
    ' fullLifecycle=' + kFull + ' opLogRows/doc  glLines/postOp=' + glLinesPerDoc + '  (MEASURED from real fold)');
  op0.close();

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §4  W-SCALE-WRITE — per-write latency vs LIVE-DOC count D (S-WRITE = O(docs): dispatch hashes the
  //   projection + refold = GROUP BY over D). Sweep D, fit write_ms(D) ≈ a + b·D, report cross-100ms. §SCALE-WRITE
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\n── W-SCALE-WRITE — per-write latency vs live-doc count D (fit O(docs)) ──');
  var D_SWEEP = [100, 1000, 5000, 15000];
  var WPTS = [];
  for (var di = 0; di < D_SWEEP.length; di++) {
    var D = D_SWEEP[di];
    var pdb = newDb(); K.initProjection(pdb);
    K.register('C_Invoice', 'CO', function (doc, ctx) { return [{ op_type: 'SET_STATUS', table: doc.table, id: doc.id, doc_status: ctx.to, uuid: doc.uuid }]; });
    var seam = Seam.makeSeam({ projDb: pdb, adQ: adQ, factQ: gbQ, wfmc: WFMC, newDb: newDb });
    var ctx = { actor: 'user:alice', role: { actions: ['C_Invoice:CO'] }, allowOrgs: '*' };
    // preload D documents in DR (the live-doc population the write must re-fold against).
    for (var p = 0; p < D; p++) {
      K.apply(pdb, [{ op_type: 'CREATE_DOCUMENT', table: 'C_Invoice', source_id: 'W' + p, doc_status: 'DR', uuid: 'DOC:C_Invoice#W' + p }], { actor: 'user:alice', baseTs: 1000 });
    }
    // measure M writes (dispatch CO + refold GROUP BY) at this D — the interactive Save latency.
    var M = 25, dms = [], rms = [];
    for (var w = 0; w < M; w++) {
      var ds = now();
      seam.dispatch({ docType: 'C_Invoice', table: 'C_Invoice', action: 'CO', status: 'DR', id: 'W' + w, uuid: 'DOC:C_Invoice#W' + w }, ctx);
      dms.push(now() - ds);
      var rs = now();
      K.query(pdb, 'SELECT doc_status, COUNT(*) AS n FROM documents GROUP BY doc_status');
      rms.push(now() - rs);
    }
    var dP50 = pct(dms, 0.5), rP50 = pct(rms, 0.5), tP50 = dP50 + rP50;
    WPTS.push({ x: D, y: tP50 });
    console.log('§SCALE-WRITE D=' + D + ' dispatch_p50=' + dP50.toFixed(3) + ' refold_p50=' + rP50.toFixed(3) +
      ' total_p50=' + tP50.toFixed(3) + 'ms');
    pdb.close();
  }
  var wfit = lsfit(WPTS);
  var crossW = wfit.crossAt(100);
  RESULT.write = { pts: WPTS, fit: wfit, cross100ms: crossW };
  console.log('§SCALE-WRITE-FIT write_ms(D)=' + wfit.a.toFixed(3) + '+' + wfit.b.toExponential(3) + '·D R2=' + wfit.r2.toFixed(4) +
    ' → crosses 100ms @ D=' + (crossW > 0 && isFinite(crossW) ? Math.round(crossW).toLocaleString() : 'beyond sweep') +
    (wfit.r2 < 0.95 ? '  ⚠ R2<0.95 shape-uncertain' : ''));

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §4  W-SCALE-BOOT — cold-boot re-fold vs TOTAL ops N. Genesis = foldBalances(all N) [O(N), the cliff];
  //   checkpoint = foldBalances(open-period tail only) [flat]. SAME real fold fn, different input. §SCALE-BOOT
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\n── W-SCALE-BOOT — cold-boot fold vs total-op N (genesis O(N) vs checkpoint flat) ──');
  var TAIL = 1000;                 // open-period size the checkpoint bootstrap folds (flat regardless of N)
  function makeOps(N) {
    var ops = new Array(N);
    for (var i = 0; i < N; i++) ops[i] = { op_type: 'POST', parameters: { lines: realLines } };
    return ops;
  }
  var N_SWEEP = [2000, 20000, 100000, 400000];
  var BPTS = [];
  var ckMs = [];
  for (var ni = 0; ni < N_SWEEP.length; ni++) {
    var N = N_SWEEP[ni];
    var ops = makeOps(N);
    var g0 = now(); PC.foldBalances(ops, null); var gms = now() - g0;        // GENESIS — the real fold over all N
    var c0 = now(); PC.foldBalances(ops.slice(N - TAIL), {}); var cms = now() - c0;  // CHECKPOINT — open-period tail only
    BPTS.push({ x: N, y: gms }); ckMs.push(cms);
    console.log('§SCALE-BOOT N=' + N.toLocaleString() + ' genesis_ms=' + gms.toFixed(2) +
      ' checkpoint_ms=' + cms.toFixed(2) + ' (folds ' + TAIL + '-op open period) flat=' +
      (cms < gms * 0.5 || N <= TAIL * 2 ? 'Y' : 'N'));
  }
  var bfit = lsfit(BPTS);
  RESULT.boot = { pts: BPTS, fit: bfit, checkpointMs: avg(ckMs), tail: TAIL };
  console.log('§SCALE-BOOT-FIT genesis_ms(N)=' + bfit.a.toFixed(3) + '+' + bfit.b.toExponential(3) + '·N R2=' + bfit.r2.toFixed(4) +
    '  checkpoint_ms≈' + avg(ckMs).toFixed(2) + ' FLAT' + (bfit.r2 < 0.95 ? '  ⚠ R2<0.95' : ''));
  var _mt = parseFloat(process.argv[2] || process.env.MOBILE_THROTTLE || '4');
  console.log('§SCALE-BOOT-100M genesis@100M ops = ' + (bfit.at(1e8) / 1000).toFixed(1) + 's desktop / ~' +
    (bfit.at(1e8) / 1000 * _mt).toFixed(0) + 's mobile(×' + _mt + ') — the cliff; vs checkpoint ' + avg(ckMs).toFixed(1) + 'ms FLAT');

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §4  W-SCALE-STORE — projection bytes vs ops (S-STORE = B/op). Confirm ~linear, report B/op. §SCALE-STORE
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\n── W-SCALE-STORE — projection bytes/op (db.export growth) ──');
  var SPTS = [];
  [500, 1500].forEach(function (NB) {
    var sdb = newDb(); K.initProjection(sdb);
    for (var s = 0; s < NB; s++) {
      K.apply(sdb, [{ op_type: 'CREATE_DOCUMENT', table: 'C_Invoice', source_id: 'S' + s, doc_status: 'DR', uuid: 'DOC:C_Invoice#S' + s }], { actor: 'user:alice', baseTs: 1000 });
    }
    var rows = opCount(sdb), bytes = sdb.export().length;
    SPTS.push({ x: rows, y: bytes });
    console.log('§SCALE-STORE opLogRows=' + rows + ' projBytes=' + kb(bytes) + ' bytesPerOp=' + (bytes / rows).toFixed(0) + 'B');
    sdb.close();
  });
  var sfit = lsfit(SPTS);   // slope = marginal bytes/op (the bloat rate)
  RESULT.store = { pts: SPTS, bytesPerOp: sfit.b };
  console.log('§SCALE-STORE-FIT marginal bytes/op=' + sfit.b.toFixed(0) + 'B (I-3 projection bloat rate)');

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §4  W-SCALE-THRU — sustained write throughput: naive (commitOp+sealChain) vs batch (commitGroup). §SCALE-THRU
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\n── W-SCALE-THRU — naive vs batch commitGroup throughput ──');
  var TN = 2000;
  var ndb = newDb(); KO.ensureTable(ndb);
  var _log = console.log;
  var nt0 = now();
  for (var nj = 0; nj < TN; nj++) {
    console.log = function () {};
    KO.commitOp(ndb, 'SET_STATUS', { table: 'C_Invoice', id: 'N' + nj, doc_status: 'CO' }, null, 'DOC:N' + nj, 'op-' + nj);
    console.log = _log;
  }
  await KO.sealChain(ndb);
  var naiveMs = now() - nt0, naiveThru = TN / (naiveMs / 1000);
  ndb.close();
  var bdb = newDb(); KO.ensureTable(bdb);
  var bt0 = now();
  var GS = 50;            // group size — amortise seal across the group (the deployed write path)
  for (var bj = 0; bj < TN; bj += GS) {
    var grp = [];
    for (var gk = 0; gk < GS && bj + gk < TN; gk++) grp.push({ op_type: 'SET_STATUS', op_uuid: 'gop-' + (bj + gk), params: { table: 'C_Invoice', id: 'B' + (bj + gk), doc_status: 'CO' } });
    console.log = function () {};
    /* eslint-disable no-await-in-loop */
    await KO.commitGroup(bdb, grp, { gid: 'grp-' + bj, baseTs: 1000 + bj });
    console.log = _log;
  }
  var batchMs = now() - bt0, batchThru = TN / (batchMs / 1000);
  bdb.close();
  var speedup = batchThru / naiveThru;
  RESULT.thru = { naiveThru: naiveThru, batchThru: batchThru, speedup: speedup };
  console.log('§SCALE-THRU naive=' + naiveThru.toFixed(0) + 'op/s batch=' + batchThru.toFixed(0) + 'op/s speedup=' + speedup.toFixed(2) + '×');

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // §6  FORECAST — docs/day + ERP-department size per tier, WITH/WITHOUT each mitigation. §SCALE-FORECAST
  //   Envelope inputs are tagged (assumption); engine constants are MEASURED above. Forecast = arithmetic
  //   over measured fits — never a typed number.
  // ════════════════════════════════════════════════════════════════════════════════════════════════
  console.log('\n── §6 FORECAST — docs/day + ERP-dept (measured fits → business capacity) ──');
  var WORK_S = 8 * 3600;                     // (assumption) 8h working window/day
  var WORK_DAYS = 250;                       // (assumption) working days/yr
  var CLERK_LO = 50, CLERK_HI = 200;         // (assumption) posted docs/clerk/day band
  var DB_BUDGET = 2 * 1024 * 1024 * 1024;    // (assumption) ~2GB practical browser DB/RAM ceiling
  // mobile throttle: CPU-bound surfaces (write fold, genesis boot) run ~Nx slower on a phone than this
  // desktop. We CANNOT measure mobile from here, so this is a labelled multiplier (typical mobile-JS
  // slowdown ~4×) applied to the desktop fit — an (assumption), tunable: `node …/poc_scale_forecast.js 6`.
  var MOBILE_THROTTLE = parseFloat(process.argv[2] || process.env.MOBILE_THROTTLE || '4');
  var k = RESULT.opsDoc.full;                // MEASURED ops/doc (full lifecycle)
  var bperop = RESULT.store.bytesPerOp;      // MEASURED bytes/op
  // ENGINE THROUGHPUT CEILING (tier-independent): docs/day the write path could absorb flat-out. This is
  // astronomically above human input rates → throughput is NOT the binding constraint, which is the finding.
  var engineDocsDay = Math.round(batchThru * WORK_S / k);
  var engineDocsDayNoBatch = Math.round(naiveThru * WORK_S / k);
  console.log('§SCALE-CEILING engine throughput ceiling=' + engineDocsDay.toLocaleString() + ' docs/day (batch) — far above any human dept; throughput never binds');
  // tiers: (assumption) docs/yr · years · concurrent live-doc D. Dept size is DERIVED FROM the tier's real
  // annual volume (the dept that GENERATES it), NOT from the engine ceiling. N(total ops)=docs/yr·years·k.
  var TIERS = [
    { name: 'small', docsYr: 5000,   years: 1, D: 500 },
    { name: 'mid',   docsYr: 50000,  years: 3, D: 5000 },
    { name: 'large', docsYr: 500000, years: 5, D: 50000 }
  ];
  var rows = [];
  TIERS.forEach(function (t) {
    var N = t.docsYr * t.years * k;
    var inSweepD = t.D <= D_SWEEP[D_SWEEP.length - 1];
    var inSweepN = N <= N_SWEEP[N_SWEEP.length - 1];
    var writeMs = wfit.at(t.D);
    var genMs = bfit.at(N), ckMsF = RESULT.boot.checkpointMs;
    var dbBytes = bperop * N;
    var dailyLoad = Math.round(t.docsYr / WORK_DAYS);          // docs/day this tier actually produces
    var opsNeededPerS = (dailyLoad * k) / WORK_S;              // engine load to carry it
    var util = opsNeededPerS / batchThru;                     // fraction of the throughput ceiling used
    var clerksLo = Math.ceil(dailyLoad / CLERK_HI), clerksHi = Math.ceil(dailyLoad / CLERK_LO);  // dept that GENERATES the load
    // binding surface = first to cross its budget: interactive Save >100ms · checkpoint-boot >2s · DB >budget · throughput >80%.
    var limit = writeMs > 100 ? 'S-WRITE (' + writeMs.toFixed(0) + 'ms/save @ ' + t.D.toLocaleString() + ' live docs)'
      : (dbBytes > DB_BUDGET ? 'S-STORE (' + mb(dbBytes) + ' >budget, needs prune)'
      : (ckMsF > 2000 ? 'S-BOOT' : (util > 0.8 ? 'S-THRU' : 'none — headroom (' + (util * 100).toFixed(3) + '% throughput used)')));
    var mWriteMs = writeMs * MOBILE_THROTTLE, mGenMs = genMs * MOBILE_THROTTLE;   // mobile estimate (×throttle)
    var r = { tier: t.name, docsYr: t.docsYr, years: t.years, D: t.D, N: N,
      writeMs: writeMs, writeMeasured: inSweepD, genMs: genMs, genMeasured: inSweepN, ckMs: ckMsF,
      mWriteMs: mWriteMs, mGenMs: mGenMs, dbBytes: dbBytes, dailyLoad: dailyLoad, utilPct: util * 100,
      clerksLo: clerksLo, clerksHi: clerksHi, limit: limit };
    rows.push(r);
    console.log('§SCALE-FORECAST tier=' + t.name + ' D=' + t.D.toLocaleString() + ' N=' + (N / 1e6).toFixed(2) + 'M' +
      ' load=' + dailyLoad.toLocaleString() + ' docs/day → ERPdept=' + clerksLo + '–' + clerksHi + ' clerks' +
      ' | write=' + writeMs.toFixed(1) + 'ms' + tag(inSweepD) + '/mob=' + mWriteMs.toFixed(0) + 'ms' +
      ' genesisBoot=' + (genMs / 1000).toFixed(1) + 's' + tag(inSweepN) + '/mob=' + (mGenMs / 1000).toFixed(1) + 's' +
      ' ckptBoot=' + ckMsF.toFixed(0) + 'ms(measured)' +
      ' db=' + mb(dbBytes) + ' throughputUsed=' + (util * 100).toFixed(3) + '% | binds=' + limit);
  });
  var mobileCrossD = wfit.crossAt(100 / MOBILE_THROTTLE);    // live-doc count where mobile Save hits 100ms
  RESULT.forecast = { tiers: rows, k: k, bytesPerOp: bperop, workSeconds: WORK_S, workDays: WORK_DAYS,
    clerkBand: [CLERK_LO, CLERK_HI], engineDocsDay: engineDocsDay, engineDocsDayNoBatch: engineDocsDayNoBatch,
    mobileThrottle: MOBILE_THROTTLE, mobileCross100msD: mobileCrossD, desktopCross100msD: wfit.crossAt(100) };

  // ── emit forecast artifacts ───────────────────────────────────────────────────────────────────────
  fs.writeFileSync(OUT_JSON, JSON.stringify(RESULT, null, 2));
  var md = buildMd(RESULT, naiveThru, batchThru, speedup);
  fs.writeFileSync(OUT_MD, md);
  console.log('\n§SCALE-ARTIFACT wrote ' + path.relative(process.cwd(), OUT_MD) + ' + ' + path.relative(process.cwd(), OUT_JSON));

  // ── verdict (the honest ceiling, stated plainly) ────────────────────────────────────────────────
  var large = rows[rows.length - 1];
  console.log('\n┌─ VERDICT — the honest ceiling (non-invent, read off the §-lines) ───────────────────────');
  console.log('│ ops/doc (measured)=' + k + '  ·  batch throughput (measured)=' + batchThru.toFixed(0) + ' op/s' +
    '  ·  engine ceiling=' + engineDocsDay.toLocaleString() + ' docs/day');
  console.log('│ THROUGHPUT NEVER BINDS: even the LARGE tier (' + large.docsYr.toLocaleString() + ' docs/yr = ' +
    large.dailyLoad.toLocaleString() + ' docs/day, an ERP dept of ~' + large.clerksLo + '–' + large.clerksHi +
    ' clerks) uses ' + large.utilPct.toFixed(3) + '% of write throughput.');
  console.log('│ THE BINDING CONSTRAINT IS INTERACTIVE LATENCY: Save = O(live docs); it crosses the 100ms budget at');
  console.log('│   ~' + Math.round(wfit.crossAt(100)).toLocaleString() + ' live docs desktop / ~' +
    Math.round(wfit.crossAt(100 / MOBILE_THROTTLE)).toLocaleString() + ' live docs mobile(×' + MOBILE_THROTTLE +
    '). Keep the open working-set under that via scoping/period-close.');
  console.log('│ COLD BOOT: genesis O(N) → ' + (bfit.at(1e8) / 1000).toFixed(0) + 's desktop / ~' +
    (bfit.at(1e8) / 1000 * MOBILE_THROTTLE).toFixed(0) + 's mobile @100M ops (the cliff); checkpoint bootstrap ~' +
    large.ckMs.toFixed(0) + 'ms FLAT — mandatory at scale.');
  console.log('│ STORAGE: ' + bperop.toFixed(0) + ' B/op → large-tier projection ' + mb(large.dbBytes) + '; prune to stay under the ~2GB browser wall.');
  console.log('│ MITIGATIONS EARN THEIR KEEP: checkpoint kills the ' + (bfit.at(1e8) / 1000).toFixed(0) + 's boot cliff; batch = ' +
    speedup.toFixed(1) + '× throughput; prune caps the ' + mb(large.dbBytes) + ' bloat.');
  console.log('└────────────────────────────────────────────────────────────────────────────────────────');

  // W-SCALE-FORECAST verdict (§TWIN-CLASSIFIED-MARKERS): the three claims the VERDICT box states in prose, asserted over
  // the SAME measured values it prints — a script whose only terminal line is DONE cannot report its own failure.
  var claims = [
    ['batch beats naive per-op commit (speedup > 1)',                         speedup > 1],
    ['throughput never binds at the large tier (util < 100%)',                large.utilPct < 100],
    ['checkpoint bootstrap is flat vs the genesis cliff (ckMs < genesis@100M)', large.ckMs < bfit.at(1e8)]
  ];
  var bad = claims.filter(function (c) { return !c[1]; });
  claims.forEach(function (c) { console.log('   ' + (c[1] ? '🟢' : '🔴') + ' ' + c[0]); });
  console.log(bad.length ? '🔴 W-SCALE-FORECAST FAIL (' + bad.length + ' of ' + claims.length + ' measured claims broke)'
                         : '🟢 W-SCALE-FORECAST PASS — ' + claims.length + ' measured claims hold');
  gb.close(); ad.close();
  console.log('\n═══ PROD SCALE FORECAST DONE — see scale_forecast.md / §SCALE-* / VERDICT ═══');
  process.exit(bad.length ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e && e.stack || e); process.exit(2); });

function buildMd(R, naive, batch, speedup) {
  function mbn(b) { return (b / 1048576).toFixed(1) + 'MB'; }
  var L = [];
  L.push('# Production Scale Forecast — Fold Engine');
  L.push('');
  L.push('> Generated by `scripts/poc_scale_forecast.js`. **Measured** cells are timed on the real fold engine;');
  L.push('> **(forecast)** cells are extrapolations of a least-squares fit to those measured points. Envelope');
  L.push('> inputs are `(assumption)`; engine constants (ops/doc, bytes/op, throughput, fit slopes) are measured.');
  L.push('');
  L.push('## Measured engine constants');
  L.push('');
  L.push('| Constant | Value | Source surface |');
  L.push('|---|---|---|');
  L.push('| ops/doc (full lifecycle) | **' + R.opsDoc.full + '** rows | §SCALE-OPSDOC |');
  L.push('| GL lines per posted doc | ' + R.factPerDoc.toFixed(1) + ' | §SCALE-MIX (oracle) |');
  L.push('| per-write fit | `' + R.write.fit.a.toFixed(2) + ' + ' + R.write.fit.b.toExponential(2) + '·D` ms (R²=' + R.write.fit.r2.toFixed(3) + ') | S-WRITE |');
  L.push('| write crosses 100ms @ D | ' + (isFinite(R.write.cross100ms) && R.write.cross100ms > 0 ? Math.round(R.write.cross100ms).toLocaleString() + ' live docs' : 'beyond sweep') + ' | S-WRITE |');
  L.push('| genesis-boot fit | `' + R.boot.fit.a.toFixed(2) + ' + ' + R.boot.fit.b.toExponential(2) + '·N` ms (R²=' + R.boot.fit.r2.toFixed(3) + ') | S-BOOT |');
  L.push('| checkpoint-boot | **~' + R.boot.checkpointMs.toFixed(0) + 'ms FLAT** (folds ' + R.boot.tail + '-op open period) | S-BOOT |');
  L.push('| projection bloat | ' + R.store.bytesPerOp.toFixed(0) + ' B/op | S-STORE (I-3) |');
  L.push('| throughput | naive ' + naive.toFixed(0) + ' → batch **' + batch.toFixed(0) + ' op/s** (' + speedup.toFixed(1) + '× ) | S-THRU |');
  L.push('');
  L.push('## Capacity forecast — docs/day & ERP department');
  L.push('');
  L.push('**Engine throughput ceiling: ~' + R.forecast.engineDocsDay.toLocaleString() + ' docs/day** (batch path, flat-out) — orders of');
  L.push('magnitude above any human department, so **aggregate throughput never binds**. Dept size below is derived');
  L.push('from each tier\'s *actual* annual volume (the department that generates it), not from this ceiling.');
  L.push('');
  L.push('Assumptions: ' + (R.forecast.workSeconds / 3600) + 'h working window, ' + R.forecast.workDays + ' working days/yr, clerk band ' +
    R.forecast.clerkBand[0] + '–' + R.forecast.clerkBand[1] + ' posted docs/clerk/day *(tune to your org)*.');
  L.push('');
  L.push('| Tier | docs/yr | docs/day | **ERP dept** | live-doc D | write/save (desktop) | write/save (mobile ×' + R.forecast.mobileThrottle + ') | total-op N | boot genesis (desktop / mobile) | boot ckpt | DB size | throughput used | **binds** |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  R.forecast.tiers.forEach(function (t) {
    L.push('| ' + t.tier + ' | ' + t.docsYr.toLocaleString() + ' | ' + t.dailyLoad.toLocaleString() + ' | **~' +
      t.clerksLo + '–' + t.clerksHi + ' clerks** | ' + t.D.toLocaleString() + ' | ' +
      t.writeMs.toFixed(0) + 'ms ' + (t.writeMeasured ? '(measured)' : '(forecast)') + ' | ' + t.mWriteMs.toFixed(0) + 'ms (est) | ' +
      (t.N / 1e6).toFixed(2) + 'M | ' + (t.genMs / 1000).toFixed(1) + 's / ' + (t.mGenMs / 1000).toFixed(1) + 's ' +
      (t.genMeasured ? '(measured)' : '(forecast)') + ' | ' +
      t.ckMs.toFixed(0) + 'ms | ' + mbn(t.dbBytes) + ' | ' + t.utilPct.toFixed(3) + '% | ' + t.limit + ' |');
  });
  L.push('');
  L.push('**Reading it:** throughput utilisation stays a fraction of a percent at every tier — the engine is never');
  L.push('throughput-bound. The only surface that crosses budget is **interactive Save latency** (O(live docs)), which');
  L.push('hits 100ms at ~' + (isFinite(R.forecast.desktopCross100msD) ? Math.round(R.forecast.desktopCross100msD).toLocaleString() : '?') +
    ' live docs desktop / ~' + (isFinite(R.forecast.mobileCross100msD) ? Math.round(R.forecast.mobileCross100msD).toLocaleString() : '?') +
    ' live docs mobile (×' + R.forecast.mobileThrottle + ' est) — a working-set limit, managed by scoping/period-close, not a hardware wall.');
  L.push('');
  L.push('### Mitigation deltas (what each deployed strategy buys)');
  L.push('');
  L.push('| Strategy | OFF | ON | Effect |');
  L.push('|---|---|---|---|');
  L.push('| Checkpoint bootstrap | genesis O(N): ' + (R.boot.fit.at(1e8) / 1000).toFixed(0) + 's @100M ops (mobile cliff) | ~' + R.boot.checkpointMs.toFixed(0) + 'ms flat | removes the cold-start freeze |');
  L.push('| Batch commitGroup | naive ' + naive.toFixed(0) + ' op/s | ' + batch.toFixed(0) + ' op/s | ' + speedup.toFixed(1) + '× docs/day |');
  L.push('| Projection prune | ' + R.store.bytesPerOp.toFixed(0) + ' B/op unbounded | bounded to ops-since-checkpoint | caps DB/RAM growth |');
  L.push('');
  L.push('*All forecast numbers trace to the §SCALE-* log lines in `build/erp/poc_scale_forecast.log`.*');
  return L.join('\n');
}
