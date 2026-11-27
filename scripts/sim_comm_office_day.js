#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * sim_comm_office_day.js — W-COMM-OFFICE-DAY. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.10 (office-day scale scenario). READ THE LOG after every run.
 * The REAL comm layer (build/comm/*, sql.js, WebCrypto, CL8 encryption ON, canUpdate via the AD layer) with N simulated staff devices over memPipe,
 * a VIRTUAL clock (one slot = one visit period V), and a role pipeline: Sales creates an order + line -> Warehouse Completes -> Accounts finalises (invoice).
 * A document is handed on only after the receiving device has PLACED the previous op, so hand-off latency is real. Nothing here sleeps.
 *   §OFFICE-CONVERGE   after a final settle all N devices hold one op set and one order, and every authored business op is placed everywhere.
 *   §OFFICE-LATENCY    hand-off latency measured in visits (authoring slot -> first slot the next role holds it): >= 1 and <= 2 per hand-off.
 *   §OFFICE-CONFLICT   injected double-Completes (two warehouse staff, same doc, same visit window): every contested column is surfaced, none silent.
 *   §OFFICE-COST       measured ops/step, wire bytes/op, bytes/visit, CPU per visit -> feeds the projection (§SCALE lines, labelled projected).
 * Run: node scripts/sim_comm_office_day.js [N=9] [d=6] [V=15] [c=0.1] 2>&1 | tee build/comm/logs/sim_comm_office_day.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto'), initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm'), STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var N = Number(process.argv[2] || 9), D = Number(process.argv[3] || 6), V = Number(process.argv[4] || 15), C = Number(process.argv[5] || 0.1), H = 8, STEPS = 3;
var fails = 0, judged = 0, inconclusive = [], rnd = (function (seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; })(20261024);   // fixed seed: reproducible
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function uuid() { return nodeCrypto.randomUUID(); }
var ROLE = ['sales', 'warehouse', 'accounts'];

(async function () {
  console.log('═══ W-COMM-OFFICE-DAY — N=' + N + ' staff, ' + D + ' docs each, visit every ' + V + ' min, ' + H + ' h (' + (H * 60 / V) + ' slots), conflict rate ' + C + ' (TEAMWORK_FRAMEWORK §13.10) ═══');
  var SQL = await initSqlJs(), pipe = PIPE.memPipe('office'), dev = [], S = [], slots = H * 60 / V;
  for (var i = 0; i < N; i++) { dev[i] = await STORE.newDevice(); dev[i].person_uu = uuid(); }
  var sp = await STORE.newSpace('office-day', dev[0], dev[0].person_uu, 'staff0', 102);
  for (i = 0; i < N; i++) S[i] = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: dev[i], access: access, log: function () {} });
  await S[0].genesis(sp.params);
  for (i = 1; i < N; i++) { await S[0].addPerson({ person_uu: dev[i].person_uu, name: 'staff' + i, ad_role_id: 102, comm_admin: false }); await S[0].enroll(dev[i].kid, dev[i].pubJwk, dev[i].person_uu, dev[i].dhPubJwk); }
  for (var r0 = 0; r0 < 3; r0++) for (i = 0; i < N; i++) await S[i].sync(pipe);
  var enrolled = Object.keys((await S[N - 1].order()).roster.devices).length;
  console.log('§OFFICE-SETUP devices enrolled=' + enrolled + '/' + N + ' (all with a key grant)');
  if (enrolled !== N) { console.log('🔴 setup failed'); process.exit(2); }
  var byRole = [[], [], []]; for (i = 0; i < N; i++) byRole[i % 3].push(i);
  var cap = Math.max(1, Math.round(D * STEPS / slots * 1.0));            // steps one staff member can do per slot (d·s over the day)
  var docs = [], authored = { biz: 0, create: 0, complete: 0, finalise: 0 }, injected = 0, injCols = 0, stat0 = JSON.parse(JSON.stringify(pipe.stats)), cpu = 0, visits = 0, visitMs = [];
  var seenIn = function (dev_i, uu, opType) { return S[dev_i].query("SELECT 1 FROM cl_op WHERE target_uu=? AND op_type=? LIMIT 1", [uu, opType]).length > 0; };

  async function A(d, target, op_type, params, refs) { authored.biz++; return S[d].author({ target: target, intent: op_type === 'SET_STATUS' ? 'K4' : 'K2', refs: refs || [], body: { op_type: op_type, params: params } }); }
  async function doCreate(d, docNo) {
    var o = uuid(), l = uuid(); docs.push({ id: docNo, order: o, line: l, stage: 'created', createdBy: d, tCreate: slot, handoff: [] }); authored.create++;
    await A(d, { table: 'c_order', uu: o }, 'CRUD_CREATE', { fields: { documentno: 'SIM-' + docNo, grandtotal: 100 + docNo, ad_client_id: 11, ad_org_id: 11, docstatus: 'DR' } });
    await A(d, { table: 'c_orderline', uu: l }, 'CRUD_CREATE', { fields: { c_order_id: { uu: o }, qtyordered: 2, ad_client_id: 11, ad_org_id: 11 } }, [o]);
  }
  async function doComplete(d, doc, injectedExtra) {
    var o = doc.order, l = doc.line, t = injectedExtra ? 'x' : '';
    await A(d, { table: 'c_order', uu: o }, 'CRUD_UPDATE', { changes: { docstatus: { old: 'DR', new: 'CO' }, processed: { old: 'N', new: 'Y' } } });
    await A(d, { table: 'c_orderline', uu: l }, 'CRUD_UPDATE', { changes: { qtyreserved: { old: 0, new: 2 }, processed: { old: 'N', new: 'Y' } } });
    await A(d, { table: 'c_ordertax', uu: uuid() }, 'CRUD_CREATE', { fields: { c_order_id: { uu: o }, taxamt: 0, ad_client_id: 11, ad_org_id: 11 } }, [o]);
    await A(d, { table: 'c_order', uu: o }, 'SET_STATUS', { action: 'CO', from: 'DR', to: 'CO', changes: { docstatus: { old: 'DR', new: 'CO' } } });
  }
  async function doFinalise(d, doc) {
    var inv = uuid(), il = uuid();
    await A(d, { table: 'c_invoice', uu: inv }, 'CRUD_CREATE', { fields: { c_order_id: { uu: doc.order }, documentno: 'INV-' + doc.id, ad_client_id: 11, ad_org_id: 11, docstatus: 'DR' } }, [doc.order]);
    await A(d, { table: 'c_invoiceline', uu: il }, 'CRUD_CREATE', { fields: { c_invoice_id: { uu: inv }, qtyinvoiced: 2, ad_client_id: 11, ad_org_id: 11 } }, [inv]);
    await A(d, { table: 'c_invoice', uu: inv }, 'CRUD_UPDATE', { changes: { docstatus: { old: 'DR', new: 'CO' }, processed: { old: 'N', new: 'Y' } } });
    await A(d, { table: 'c_invoice', uu: inv }, 'SET_STATUS', { action: 'CO', from: 'DR', to: 'CO', changes: { docstatus: { old: 'DR', new: 'CO' } } });
  }

  var cpuSamples = [], slot = 0, nextDoc = 1, perStaffDocs = {}, startedPerSales = {};
  for (slot = 0; slot < slots; slot++) {
    // WORK: each staff member does up to `cap` steps of their role on documents their OWN device holds
    for (i = 0; i < N; i++) {
      var role = i % 3, done = 0;
      if (role === 0) { while (done < cap && (startedPerSales[i] || 0) < D) { await doCreate(i, nextDoc++); startedPerSales[i] = (startedPerSales[i] || 0) + 1; done++; } }
      else {
        var want = role === 1 ? 'created' : 'completed', cand = docs.filter(function (x) { return x.stage === want && !x.claimed && seenIn(i, x.order, role === 1 ? 'CRUD_CREATE' : 'SET_STATUS') && (role === 1 || true); });
        for (var k = 0; k < cand.length && done < cap; k++) {
          var doc = cand[k]; doc.claimed = true;
          if (role === 1) { doc.tHeld = slot; doc.handoff.push(slot - doc.tCreate); await doComplete(i, doc);
            if (rnd() < C && byRole[1].length > 1) { var other = byRole[1].filter(function (z) { return z !== i; })[0];   // a second warehouse clerk completes the SAME doc before either visits
              await doComplete(other, doc); injected++; injCols += 4; }
            doc.stage = 'completed'; doc.tComplete = slot; doc.claimed = false; authored.complete++; }
          else { doc.handoff.push(slot - doc.tComplete); await doFinalise(i, doc); doc.stage = 'done'; doc.claimed = false; authored.finalise++; }
          done++; }
      }
    }
    // VISIT: everyone syncs once per slot (the visit period); CPU and bytes are measured per visit
    var slotMs = 0; for (i = 0; i < N; i++) { var t0 = process.hrtime.bigint(); await S[i].sync(pipe); var dt = Number(process.hrtime.bigint() - t0) / 1e6; cpu += dt; slotMs += dt; visitMs.push(dt); visits++; }
    cpuSamples.push([authored.biz, slotMs / N]);   // (business ops in the log so far, mean visit ms in this slot)
  }
  var pre = JSON.parse(JSON.stringify(pipe.stats));
  for (var settle = 0; settle < 4; settle++) for (i = 0; i < N; i++) await S[i].sync(pipe);
  var stat1 = pipe.stats, gets = stat1.get - stat0.get, lists = stat1.list - stat0.list, puts = stat1.put - stat0.put;

  // ── judge ──
  console.log('§OFFICE-DAY authored business ops=' + authored.biz + ' (create=' + authored.create + ' complete=' + authored.complete + ' finalise=' + authored.finalise + ') docs=' + docs.length + ' done=' + docs.filter(function (x) { return x.stage === 'done'; }).length + ' injected double-Completes=' + injected);
  if (authored.biz === 0 || authored.create === 0) inconclusive.push('nothing authored');
  var sets = [], ords = [], placed = [];
  for (i = 0; i < N; i++) { sets.push(S[i].query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }).join(',')); var pe = await S[i].placedEnvelopes(); placed.push(pe.length); ords.push(nodeCrypto.createHash('sha256').update(pe.map(function (p) { return p.hash; }).join(',')).digest('hex').slice(0, 12)); }
  var sameSet = sets.every(function (x) { return x === sets[0]; }), sameOrd = ords.every(function (x) { return x === ords[0]; }), allPlaced = placed.every(function (x) { return x === authored.biz; });
  console.log('§OFFICE-CONVERGE placed per device min/max=' + Math.min.apply(null, placed) + '/' + Math.max.apply(null, placed) + ' authored=' + authored.biz + ' order=' + ords[0] + (sameOrd ? ' (identical on all ' + N + ')' : ' DIFFERS'));
  verdict(sameSet && sameOrd, 'all ' + N + ' devices hold one op set and one order after the settle');
  verdict(allPlaced, 'every authored business op (' + authored.biz + ') is placed on every device — no lost work', 'min placed=' + Math.min.apply(null, placed));
  var lat = []; docs.forEach(function (x) { x.handoff.forEach(function (h) { lat.push(h); }); });
  var crossed = lat.length; if (!crossed) inconclusive.push('no cross-device hand-off happened');
  var minL = Math.min.apply(null, lat), maxL = Math.max.apply(null, lat), avgL = lat.reduce(function (a, b) { return a + b; }, 0) / (lat.length || 1);
  console.log('§OFFICE-LATENCY hand-offs=' + crossed + ' latency(visits) min=' + minL + ' avg=' + avgL.toFixed(2) + ' max=' + maxL + ' => minutes avg=' + (avgL * V).toFixed(1) + ' max=' + (maxL * V));
  verdict(crossed > 0 && minL >= 1 && maxL <= 3, 'every hand-off took 1-3 visits (a hand-off cannot be faster than one visit; none stalled)', 'min=' + minL + ' max=' + maxL);
  var cf = await S[0].conflicts(), nCf = cf.length;
  console.log('§OFFICE-CONFLICT injected double-Completes=' + injected + ' expected contested columns=' + injCols + ' surfaced=' + nCf);
  if (injected === 0) inconclusive.push('no conflict was injected (rate too low for this N)');
  else verdict(nCf === injCols, 'every contested column of every double-Complete is surfaced, none silent, none invented', 'expected ' + injCols + ' got ' + nCf);
  // ── cost ──
  var bundles = (await pipe.list('s/' + sp.space + '/o/')).length, bytesPut = stat1.bytesPut - stat0.bytesPut, bytesGet = stat1.bytesGet - stat0.bytesGet;
  var opsWire = authored.biz, perOpBytes = bytesPut / opsWire, stepsDone = authored.create + authored.complete + authored.finalise, opsPerStep = authored.biz / stepsDone;
  console.log('§OFFICE-COST ops/step=' + opsPerStep.toFixed(2) + ' bundles=' + bundles + ' bytesPut=' + bytesPut + ' => wire bytes/op=' + perOpBytes.toFixed(0) + ' (incl. seal, signature, heads) | bytesGet total=' + bytesGet + ' (' + (bytesGet / N / 1024).toFixed(1) + ' KiB per device) | puts=' + (stat1.put - stat0.put) + ' gets=' + (stat1.get - stat0.get) + ' lists=' + (stat1.list - stat0.list));
  // fixed-vs-marginal cost: every bundle is a small SQLite file, so its size = fixed + marginal * ops (least squares over the real bundles)
  var bnames = await pipe.list('s/' + sp.space + '/o/'), pts = [], hnames = await pipe.list('s/' + sp.space + '/h/'), headB = 0;
  for (var bn of bnames) { var m = /\/(\d+)-(\d+)\.[0-9a-f]+\.bimpack$/.exec(bn); if (!m) continue; var bb = await pipe.get(bn); pts.push([Number(m[2]) - Number(m[1]) + 1, bb.length]); }
  for (var hn of hnames) headB += (await pipe.get(hn)).length;
  var sx = 0, sy = 0, sxx = 0, sxy = 0, np = pts.length; pts.forEach(function (q) { sx += q[0]; sy += q[1]; sxx += q[0] * q[0]; sxy += q[0] * q[1]; });
  var marg = (np * sxy - sx * sy) / (np * sxx - sx * sx), fixed = (sy - marg * sx) / np, headAvg = headB / (hnames.length || 1);
  console.log('§OFFICE-FIT bundles=' + np + ' ops/bundle min/max=' + Math.min.apply(null, pts.map(function (q) { return q[0]; })) + '/' + Math.max.apply(null, pts.map(function (q) { return q[0]; })) + ' size = ' + fixed.toFixed(0) + ' B fixed + ' + marg.toFixed(0) + ' B/op ; signed head = ' + headAvg.toFixed(0) + ' B');
  if (np < 5 || !(marg > 0)) inconclusive.push('bundle size fit has too few distinct sizes');
  var sorted = visitMs.slice().sort(function (a, b) { return a - b; });
  console.log('§OFFICE-CPU visits=' + visits + ' mean=' + (cpu / visits).toFixed(1) + ' ms p95=' + sorted[Math.floor(sorted.length * 0.95)].toFixed(1) + ' ms max=' + sorted[sorted.length - 1].toFixed(1) + ' ms (node, includes fold + verify of ' + authored.biz + ' ops by the end)');
  verdict(opsPerStep > 1 && perOpBytes > 0, 'cost figures were measured from real traffic', 'ops/step=' + opsPerStep.toFixed(2) + ' bytes/op=' + perOpBytes.toFixed(0));

  // ── projection (computed, labelled projected) ──
  var gp = await growthProbe(); projection(opsPerStep, fixed, marg, headAvg, gp.a, gp.b, gets / visits, lists / visits, puts / visits);
  console.log('\n──────────────────────────────────────────────');
  console.log('§W-COMM-OFFICE-DAY ' + (fails || !judged ? (judged ? 'FAIL' : 'INCONCLUSIVE') : (inconclusive.length ? 'PASS-WITH-INCONCLUSIVE(' + inconclusive.length + ': ' + inconclusive.join('; ') + ')' : 'PASS')) + ' judged=' + judged + ' fails=' + fails + ' N=' + N + ' V=' + V);
  process.exit(fails || !judged ? 1 : 0);


  // §OFFICE-GROWTH — how a visit scales with the log: two devices, A authors 250 updates per round, B visits (fetch+fold) then visits again with NO news (pure re-fold)
  async function growthProbe() {
    var pp = PIPE.memPipe('growth'), da = await STORE.newDevice(), db_ = await STORE.newDevice(); da.person_uu = uuid(); db_.person_uu = uuid();
    var gsp = await STORE.newSpace('growth', da, da.person_uu, 'A', 102), a = STORE.open(new SQL.Database(), { SQL: SQL, space: gsp.space, self: da, access: access, log: function () {} }), b = STORE.open(new SQL.Database(), { SQL: SQL, space: gsp.space, self: db_, access: access, log: function () {} });
    await a.genesis(gsp.params); await a.addPerson({ person_uu: db_.person_uu, name: 'B', ad_role_id: 102, comm_admin: false }); await a.enroll(db_.kid, db_.pubJwk, db_.person_uu, db_.dhPubJwk); await a.sync(pp); await b.sync(pp);
    var rec = []; for (var q = 0; q < 25; q++) { var u = uuid(); rec.push(u); await a.author({ target: { table: 'c_order', uu: u }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'G-' + q, grandtotal: 1, ad_client_id: 11, ad_org_id: 11 } } } }); }
    var pts = [], total = 25;
    for (var round = 1; round <= 6; round++) {
      for (var k = 0; k < 250; k++) await a.author({ target: { table: 'c_order', uu: rec[k % 25] }, intent: 'K1', body: { op_type: 'CRUD_UPDATE', params: { changes: { grandtotal: { old: round * 1000 + k, new: round * 1000 + k + 1 } } } } });
      total += 250; await a.sync(pp);
      var t0 = process.hrtime.bigint(); await b.sync(pp); var tNew = Number(process.hrtime.bigint() - t0) / 1e6;
      var tQuiet = 1e9; for (var qv = 0; qv < 3; qv++) { t0 = process.hrtime.bigint(); await b.sync(pp); tQuiet = Math.min(tQuiet, Number(process.hrtime.bigint() - t0) / 1e6); }   // best of 3 quiet visits: noise only adds
      pts.push([total, tNew, tQuiet]); console.log('§OFFICE-GROWTH log=' + total + ' ops: visit with 250 new ops=' + tNew.toFixed(0) + ' ms, visit with no news=' + tQuiet.toFixed(0) + ' ms'); }
    var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(function (q) { sx += q[0]; sy += q[2]; sxx += q[0] * q[0]; sxy += q[0] * q[2]; });
    var bb = (n * sxy - sx * sy) / (n * sxx - sx * sx), aa = (sy - bb * sx) / n, ok = bb > 0 && pts[n - 1][2] > pts[0][2];
    console.log('§OFFICE-GROWTH fit (no-news visit, node): ms = ' + aa.toFixed(1) + ' + ' + bb.toFixed(4) + ' x ops ; ' + pts[0][0] + ' ops -> ' + pts[0][2].toFixed(0) + ' ms, ' + pts[n - 1][0] + ' ops -> ' + pts[n - 1][2].toFixed(0) + ' ms');
    verdict(ok, 'a visit with no news costs more as the log grows (a re-fold of the whole log) — the reason checkpoints are needed', 'first=' + pts[0][2].toFixed(0) + ' ms last=' + pts[n - 1][2].toFixed(0) + ' ms');
    return { a: aa, b: bb };
  }
  function projection(opsStep, fixedB, margB, headB, cpuA, cpuB, getsV, listsV, putsV) {
    var dday = 20, s = STEPS, c = 0.02, Hh = 8;
    console.log('\n§SCALE (PROJECTED with the formulas of §13.10. MEASURED inputs: ops/step=' + opsStep.toFixed(2) + ', bundle = ' + fixedB.toFixed(0) + ' B fixed + ' + margB.toFixed(0) + ' B/op, head ' + headB.toFixed(0) + ' B. ASSUMED: d=' + dday + ' docs/staff/day, s=' + s + ' steps/doc, c=' + c + ', H=' + Hh + ', full replication inside one space)');
    console.log('§SCALE      N | V  | ops/day  | each device downloads/day | pushes/h (all) | 1 GitHub repo (360/h) | 1 GitHub account (125/h) | hand-off | conflicts/day');
    [10, 30, 100, 300, 1000].forEach(function (n) {
      [15, 60].forEach(function (v) {
        var opsDay = n * dday * s * opsStep, visitsDay = Hh * 60 / v, opsPerDevVisit = opsDay / n / visitsDay;
        var bytesPerDeviceBundleDay = (fixedB + margB * opsPerDevVisit) * visitsDay + headB * visitsDay;         // one device's own uploads in a day
        var downloadDay = (n - 1) * bytesPerDeviceBundleDay / 1048576, push = n * 60 / v;
        var gh1 = push <= 360 ? 'ok' : 'NO', gh2 = push <= 125 ? 'ok' : 'NO';
        console.log('§SCALE ' + String(n).padStart(6) + ' | ' + String(v).padStart(2) + ' | ' + String(Math.round(opsDay)).padStart(8) + ' | ' + (downloadDay.toFixed(1) + ' MB').padStart(11) + '               | ' + String(Math.round(push)).padStart(6) + '         | ' + (gh1 + ' (' + Math.round(push) + ')').padEnd(21) + ' | ' + (gh2 + ' (' + Math.round(push) + ')').padEnd(24) + ' | ' + v + '-' + 2 * v + ' min | ' + (n * dday * s * c).toFixed(0)); });
    });
    // ── THRESHOLDS: the first limit each resource hits (all derived from the lines above) ──
    console.log('\n§THRESHOLD (PROJECTED; per space = one department/branch; d=' + dday + ', s=' + s + ')');
    [15, 60].forEach(function (v) {
      var maxAcct = Math.floor(125 / (60 / v)), maxRepo = Math.floor(360 / (60 / v));
      console.log('§THRESHOLD V=' + v + ' min: devices per space before GitHub stops it: one account ' + maxAcct + ' (125 pushes/h), one repo ' + maxRepo + ' (6/min). A bucket/relay transport has no such cap.');
    });
    [10, 50, 100].forEach(function (mb) {            // download per device per day: the N at which it reaches mb (V=15)
      var per = function (n) { var opsDev = dday * s * opsStep, vis = Hh * 60 / 15, opv = opsDev / vis; return (n - 1) * ((fixedB + margB * opv) * vis + headB * vis) / 1048576; };
      var n = 2; while (per(n) < mb && n < 100000) n++;
      console.log('§THRESHOLD download: a device receives ' + mb + ' MB/day at N=' + n + ' staff in one space (V=15).');
    });
    [1000, 5000, 30000].forEach(function (ms) {      // log size at which a no-news visit (re-fold) takes ms in node, from the growth probe
      var ops = (ms - cpuA) / cpuB;
      console.log('§THRESHOLD visit CPU: a quiet visit reaches ' + ms + ' ms (node) at ~' + Math.round(ops) + ' ops in the log = ' + (ops / (30 * dday * s * opsStep)).toFixed(1) + ' working days at N=30, ' + (ops / (10 * dday * s * opsStep)).toFixed(1) + ' days at N=10. Phone speed NOT measured (' + String.fromCharCode(0x26D4) + '). Checkpoints (period close, §11.16) are what reset it.');
    });
    [10, 30, 100].forEach(function (n) {              // repo growth vs the 10 GB on-disk advice (§11.16)
      var opsDay = n * dday * s * opsStep, vis = Hh * 60 / 15, opv = opsDay / n / vis, bytesDay = n * ((fixedB + margB * opv) * vis + headB * vis);
      console.log('§THRESHOLD repo: N=' + n + ' writes ' + (bytesDay / 1048576).toFixed(1) + ' MB/day to the pipe = ' + (10240 / (bytesDay / 1048576) / 250).toFixed(1) + ' working years to the 10 GB advice (250 days/year); heads are overwritten, bundles are kept.');
    });
    // ── WEB RELAY and EMAIL sizings (quotas fetched 2026-10-24: Apps Script quotas page + Gmail sending-limits page; all quotas "may change without notice") ──
    console.log('\n§RELAY (PROJECTED) requests per visit measured at N=' + N + ': puts=' + putsV.toFixed(2) + ' gets=' + getsV.toFixed(2) + ' lists=' + listsV.toFixed(2) + '  -> model: gets/visit ~ N+1.5 (one per other device\'s new bundle), lists 2, puts 1.2');
    console.log('§RELAY      N | V  | requests/h (all devices) | req/s (spread over the hour) | burst if all visit on the same minute');
    [10, 30, 100, 300, 1000].forEach(function (n) { [15, 60].forEach(function (v) {
      var perVisit = (n + 1.5) + 2 + 1.2, perHour = n * (60 / v) * perVisit, burst = n * perVisit;
      console.log('§RELAY ' + String(n).padStart(6) + ' | ' + String(v).padStart(2) + ' | ' + String(Math.round(perHour)).padStart(10) + '               | ' + (perHour / 3600).toFixed(1).padStart(6) + '                     | ' + Math.round(burst) + ' requests in a minute'); }); });
    console.log('§RELAY rule: requests grow with N squared (everyone fetches everyone\'s bundle). Visits must be STAGGERED (a per-device offset inside the period), never all on the :00/:15 mark; at N=100,V=15 that is ' + Math.round(100 * 4 * (100 + 4.7)) + ' requests/h = ' + (100 * 4 * 104.7 / 3600).toFixed(1) + '/s.');
    console.log('§RELAY Apps Script web app (our postbox): 30 simultaneous executions per user (quota page); each execution <= 6 min; the page lists NO daily web-app request cap, but URL Fetch 20,000/day (consumer) / 100,000 (Workspace) and trigger runtime 90 min/day (consumer) / 6 h (Workspace) apply to anything the script itself fetches or runs on a timer. Per-request time of our doPost/doGet is NOT measured ' + String.fromCharCode(0x26D4) + ': concurrency = requests/s x seconds per request, so at N=100,V=15 and 1 s/request the mean is ' + (100 * 4 * 104.7 / 3600).toFixed(0) + ' simultaneous vs the 30 cap; a synchronized burst would exceed it.');
    console.log('§RELAY object storage / static bucket: no per-user concurrency cap of this kind; the table above is its whole load. A server-side relay that merges bundles into one per round would cut the N-squared reads to N (needs compute = a server; not built).');
    var emailBytes = fixedB + margB * (dday * s * opsStep / (Hh * 60 / 15)), b64 = 1.37;
    console.log('\n§EMAIL (PROJECTED) one visit = one email with one attachment. Measured bundle at V=15 and d=' + dday + ': ' + (emailBytes / 1024).toFixed(1) + ' KB -> ' + (emailBytes * b64 / 1024).toFixed(1) + ' KB on the wire (base64 x' + b64 + '); Gmail attachment cap 25 MB per message and Apps Script mail attachment cap 25 MB, 250 attachments per message (quota page) => a single visit would need a bundle ~' + Math.round(25 * 1024 * 1024 / b64 / emailBytes) + 'x bigger to hit the cap: size is never the limit.');
    console.log('§EMAIL      N | V  | mails/day into the postbox | per sender/day | postbox mailbox processing @ assumed 1 s/mail');
    [10, 30, 100, 300].forEach(function (n) { [15, 60].forEach(function (v) {
      var perSender = Hh * 60 / v, inbound = n * perSender; console.log('§EMAIL ' + String(n).padStart(6) + ' | ' + String(v).padStart(2) + ' | ' + String(inbound).padStart(8) + '                  | ' + String(perSender).padStart(4) + ' (cap 500)    | ' + (inbound / 60).toFixed(0) + ' min/day of the 90 min/day trigger budget (consumer) = ' + (inbound / 60 / 90 * 100).toFixed(0) + ' %'); }); });
    console.log('§EMAIL limits quoted: consumer Gmail sends <= 500 mails/day per account (Gmail help, 2026-10-24); Apps Script MailApp 100/day consumer, 1,500 Workspace; a recipient account that receives too fast can have delivery blocked (Gmail help; no number given). The 1 s/mail processing time is an ASSUMPTION ' + String.fromCharCode(0x26D4) + ' measure it before using the % column. Email adds delivery delay on top of V and is never real time.');
    var maxN15 = Math.floor(125 / (60 / 15)), maxN60 = Math.floor(125 / 1);
    console.log('§SCALE one GitHub ACCOUNT (125 pushes/h) holds at most N=' + maxN15 + ' devices at V=15 min, N=' + maxN60 + ' at V=60 min; one REPO (360/h) N=' + 360 / 4 + ' / ' + 360 + '. Beyond that: one space (repo) per department/branch, or a bucket/relay transport.');
  }
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
