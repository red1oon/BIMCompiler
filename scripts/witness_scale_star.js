#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-SCALE-STAR, prompts/TEAMWORK_FRAMEWORK.md §45.1 (MEASUREMENT ONLY: no product file is touched). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: §45 says "the star keeps the EDGE flat and the open costs sit in the MIDDLE (relay delivers every declared flow to every device; head office does every import and Complete)".
 * That is a claim about N stations / M borrowers. This witness MEASURES it at N, M in {10, 100, 1000} on the REAL engine (common/comm: seal, fold, admission), the REAL ERP adapter (erp/team_sync.js in a vm,
 * the same way witness_pos_plan.js drives it) and the REAL model layer at head office (Import POS Sales plugin process, Import Payment 343, Replenish Report 53267, Tenant Accounting Processor 53187).
 *
 * SPEC (written before the code; every line below is printed in the header of the log too):
 *  SETUP   1 head-office device (role 102, the founder) + N stations (each its own org + warehouse + locator, bound `by` its org's ad_org_uu, role 50004) + M borrowers (each bound to a C_BPartner_UU, role 50004),
 *          the shipped POS plan (erp/team_plan_pos.js, signed in the run), plan 'pos' in the genesis. A day: each station K tickets (2 lines + 1 tender each), each borrower one payment + one slip; head office
 *          visits, answers with one replenishment movement per station and one loan invoice + instalment per borrower; the measured edges visit again.
 *  POINTS  N=M in {10,100,1000}, each with a wall-clock time box. A phase not finished inside its box = INCONCLUSIVE for that point (never PASS), and the log says which phase and how far it got.
 *  EDGE    measured on SAMPLED devices (2 stations: first + last, 2 borrowers: first + last) that run the whole adapter path and fetch the WHOLE relay: bytes/objects downloaded per Visit, ops delivered
 *          (placed) vs accepted vs refused, comm-log DB bytes, Visit ms (sync + adapter projection).
 *  RELAY   objects and bytes stored and written for the day; objects listed per Visit.
 *  HQ      engine: fold ms of the day's inbound (sync + projection), replies authored; model layer (mode `hq`): Import POS Sales ms per ticket, Import Payment ms per slip, Replenish ms, Tenant Accounting
 *          Processor ms, heap and DB bytes.
 *  ARMS    E1 station accepted ops flat in N (tolerance 0 ops) · E2 delivered bytes per edge Visit MEASURED, growth class reported (expected to grow today: that is F1's trigger) · H1 head-office per-ticket
 *          cost flat in N · H2 head-office day total reported against a STATED one-tab budget · CONTROL: a planted extra op is counted (accepted +1) · MUTANTS: scope off (edge accepts everything -> E1 must
 *          FAIL) and a counter that ignores refused ops (accounting identity placed = accepted + refused must FAIL).
 *  FITS    per metric: flat / linear / super-linear with R^2 (least squares on log10 N vs log10 y: slope < 0.15 flat, 0.15..1.15 linear, > 1.15 super-linear; and the linear R^2 on the raw points), as poc_scale_forecast.js
 *          does for its own metrics. Only 3 points: the fit says "3 points" in its line.
 * HONEST LIMITS (printed in the log header): one Node process family simulates all devices (no network latency, no browser); the relay is a folder pipe on local disk; load-generating devices fetch only the founder's
 *   roster bundle (so the generator is not itself quadratic) and are NOT measured - the sampled edges and head office fetch the WHOLE relay and are the measured instruments; Node + sql.js (wasm) timings
 *   are not browser timings; `teamRebuild` (the projection into the ERP DB) is browser-only, so Visit ms is sync + the adapter's `_project`; head-office model-layer inputs are the tickets of witness_pos_sales.js K4
 *   shape (the engine carries only the plan's declared columns, the two are not bridged by a projection in Node).
 * Real: common/comm/*.js, erp/team_sync.js, erp/team_plan*.js, erp/ad_seed.db (+patches for the model layer), erp/plugins/pos_integration.mjs, processes/*. Compiler: build/scriptor/sign_plan.js.
 * Run:  node scripts/witness_scale_star.js <bim-ootb dir> engine --n 100 --m 100 [--k 3] [--workers 6] [--budget-min 30] > build/scriptor/witness_scale_star_engine_100.log 2>&1
 *       node scripts/witness_scale_star.js <bim-ootb dir> hq --n 100 --m 100 [--k 3] [--budget-min 30] > ...hq_100.log
 *       node scripts/witness_scale_star.js <bim-ootb dir> fit <logs...>                          (fits + verdict lines from the §STAR-POINT json lines)
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm'), cp = require('child_process'), nodeCrypto = require('crypto'), webcrypto = nodeCrypto.webcrypto, url = require('url');
var BC = path.join(__dirname, '..'), IS_WORKER = process.env.STAR_WORKER === '1';
var OOTB = IS_WORKER ? process.env.STAR_OOTB : process.argv[2], MODE = IS_WORKER ? 'worker' : process.argv[3];
if (!OOTB) { console.log('§STAR-VERDICT INCONCLUSIVE — no bim-ootb dir given (node scripts/witness_scale_star.js <dir> engine|hq|fit)'); process.exit(2); }
var argv = process.argv.slice(4), A = {}; for (var ai = 0; ai < argv.length; ai++) if (/^--/.test(argv[ai])) A[argv[ai].slice(2)] = /^--/.test(argv[ai + 1] || '--') ? '1' : argv[++ai];
var N = Number(A.n || 10), M = Number(A.m || N), K = Number(A.k || 3), W = Number(A.workers || 6), BUDGET_MS = Number(A['budget-min'] || 30) * 60000;
var HQ = 102, STN = 50004, uuid = function () { return nodeCrypto.randomUUID(); }, T0 = Date.now(), now = function () { return Number(process.hrtime.bigint() / 1000n) / 1000; };
var DEADLINE = T0 + BUDGET_MS;
function out(s) { console.log(s); }
function rd(f) { return fs.readFileSync(path.join(OOTB, f), 'utf8'); }
function wrapPlan(name, plan) { return '(function (g) { g.' + name + ' = ' + JSON.stringify(plan) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n'; }
function Inconclusive(phase, why) { this.phase = phase; this.why = why; }
function box(phase, done) { if (Date.now() > DEADLINE) throw new Inconclusive(phase, 'time box ' + (BUDGET_MS / 60000) + ' min exhausted at ' + done); }
var ID0 = 8000000;

function loadEngine() { ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; }); var d = path.join(OOTB, 'common', 'comm');
  return { ENV: require(path.join(d, 'comm_envelope.js')), STORE: require(path.join(d, 'comm_store.js')), ROS: require(path.join(d, 'comm_roster.js')), PIPE: require(path.join(d, 'comm_pipe.js')) }; }

// the ERP adapter (the REAL team_sync.js) in a vm, exactly as witness_pos_plan.js boots it
async function boot(src, o) {
  o = o || {}; var logs = [], g = {};
  g.window = g; g.globalThis = g; g.TextEncoder = TextEncoder; g.crypto = webcrypto;
  g.console = { log: function (m) { if (logs.length < 200) logs.push(String(m)); }, warn: function () {}, error: function () {} };
  g.location = { search: '?team=1', href: 'http://localhost/x?team=1' }; g.localStorage = { getItem: function () { return null; }, setItem: function () {} };
  g.document = { readyState: 'complete', addEventListener: function () {}, getElementById: function () { return null; }, createElement: function () { return { style: {}, setAttribute: function () {}, appendChild: function () {} }; }, body: null };
  g.setTimeout = function (f) { return setImmediate(f); }; g.clearTimeout = clearTimeout; g.setInterval = function () { return 0; }; g.clearInterval = function () {}; g.indexedDB = {}; g.addEventListener = function () {}; g.removeEventListener = function () {};
  g.CustomEvent = function (t, x) { this.type = t; this.detail = x && x.detail; }; g.__ev = []; g.dispatchEvent = function (e) { g.__ev.push(e && e.type); }; g.navigator = { clipboard: {} }; g.URLSearchParams = URLSearchParams; g.URL = URL;
  if (o.trust) g.TEAM_PLAN_TRUST = o.trust;
  if (o.db) g.__idmpDb = o.db;
  var ctx = vm.createContext(g);
  vm.runInContext(rd('common/comm/team_trust.js'), ctx); vm.runInContext(src.scope, ctx); vm.runInContext(rd('common/comm/comm_envelope.js'), ctx);
  (o.plans || []).forEach(function (p) { vm.runInContext(p, ctx); });
  vm.runInContext(src.adapter, ctx);
  if (g.TeamSync && g.TeamSync.ready) await g.TeamSync.ready;
  for (var i = 0; i < 20; i++) await new Promise(function (r) { setImmediate(r); });
  return { logs: logs, g: g, api: g.TeamSync, scope: g.TeamScope };
}

// a pipe that counts what ONE device does to the relay. filter = which names this device is allowed to see (load generators only see the founder's roster bundle).
function countPipe(base, filter, ownKid) {
  var c = { put: 0, get: 0, list: 0, bytesPut: 0, bytesGet: 0, bytesGetOwn: 0, listed: 0, getObjs: 0 };
  var isOwn = function (n) { return ownKid && (n.indexOf('/o/' + ownKid + '/') >= 0 || n.indexOf('/h/' + ownKid) >= 0); };
  return { id: base.id, stats: c, reset: function () { for (var k in c) c[k] = 0; },
    put: async function (n, b) { c.put++; c.bytesPut += b.length; return base.put(n, b); },
    get: async function (n) { if (filter && !filter(n)) return null; var b = await base.get(n); c.get++; if (b) { if (isOwn(n)) c.bytesGetOwn += b.length; else { c.bytesGet += b.length; c.getObjs++; } } return b; },
    list: async function (p) { c.list++; var l = await base.list(p); if (filter) l = l.filter(filter); c.listed += l.length; return l; } };
}

function q(db, sql, args) { var st = db.prepare(sql); if (args) st.bind(args); var o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; }
function cloneRow(db, table, pk, tmplId, over) { var cols = q(db, 'PRAGMA table_info(' + table + ')').map(function (c) { return c.name; }), row = q(db, 'SELECT * FROM ' + table + ' WHERE ' + pk + '=?', [tmplId])[0];
  if (!row) throw new Error('template row missing: ' + table + ' ' + tmplId); Object.keys(over).forEach(function (k) { var rk = Object.keys(row).filter(function (x) { return x.toLowerCase() === k.toLowerCase(); })[0]; if (rk === undefined) throw new Error('no column ' + k + ' in ' + table); row[rk] = over[k]; });
  db.run('INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + cols.map(function () { return '?'; }).join(',') + ')', cols.map(function (c) { return row[c] === undefined ? null : row[c]; })); }
// the shared base every device holds (FL-5): the seed + N branches (org, warehouse, locator) + M customers, uuids given by the caller
function prepBase(db, orgUu, bpUu) {
  db.run('BEGIN');
  for (var i = 0; i < orgUu.length; i++) { var id = ID0 + i;
    cloneRow(db, 'ad_org', 'ad_org_id', 50004, { ad_org_id: id, ad_org_uu: orgUu[i], value: 'STAR' + i, name: 'Star branch ' + i });
    cloneRow(db, 'm_warehouse', 'm_warehouse_id', 50004, { m_warehouse_id: id, ad_org_id: id, value: 'STAR' + i, name: 'Star WH ' + i, m_warehouse_uu: uuid() });
    cloneRow(db, 'm_locator', 'm_locator_id', 50003, { m_locator_id: id, m_warehouse_id: id, ad_org_id: id, value: 'STAR' + i, m_locator_uu: uuid() }); }
  for (var j = 0; j < bpUu.length; j++) cloneRow(db, 'c_bpartner', 'c_bpartner_id', q(db, "SELECT c_bpartner_id AS i FROM c_bpartner WHERE ad_client_id=11 AND iscustomer='Y' AND c_bpartner_uu IS NOT NULL ORDER BY 1 LIMIT 1")[0].i,
    { c_bpartner_id: ID0 + j, c_bpartner_uu: bpUu[j], value: 'STARBP' + j, name: 'Star borrower ' + j });
  db.run('COMMIT'); }

var D1 = '2026-10-29 00:00:00';
function ticketRows(i, t, lines) { var key = 'STAR' + i + '/2026-10-29/' + t, r = [];   // what a till does for one sale: its lines (F1, F3) and its tender (B4 shares the I_Payment row)
  for (var l = 0; l < lines; l++) { r.push(['c_orderline', { m_product_id: 123, qtyentered: 1, c_uom_id: 100, description: 'must not travel', priceactual: 65, ad_client_id: 11, ad_org_id: 0 }]);
    r.push(['i_order', { documentno: key, doctypename: 'POS Order', m_product_id: l ? 130 : 123, qtyordered: 1, c_uom_id: 100, dateordered: D1, i_isimported: 'N', issotrx: 'Y', priceactual: 65, ad_client_id: 11, ad_org_id: 0 }]); }
  r.push(['i_payment', { documentno: key, doctypename: 'AR Receipt', iso_code: 'USD', payamt: 65 * lines, datetrx: D1, i_isimported: 'N', tendertype: 'X', ad_client_id: 11, ad_org_id: 0 }]); return r; }
function borrowerRows(j, bpId) { return [['c_payment', { c_bpartner_id: bpId, payamt: 10, description: 'slip photo', ad_client_id: 11, ad_org_id: 0 }],
  ['i_payment', { documentno: 'STARSLIP' + j, doctypename: 'AR Receipt', iso_code: 'USD', payamt: 10, datetrx: D1, i_isimported: 'N', invoicedocumentno: 'STARLN' + j, isapproved: 'Y', r_pnref: 'PN' + j, r_authcode: 'AU' + j, r_respmsg: 'OK', r_result: '0', ad_client_id: 11, ad_org_id: 0 }]]; }

// author ops THROUGH the adapter's translate (the path onCommit takes) in ONE authorMany batch (one versions() read). -> { n, ms, local }
var SPECSINK = null;   // agent T (HS2): when set, every authored spec is recorded here, to prove the replies identical before/after a fix (see specDigest)
var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, ISO_RE = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g;
function specDigest(sink) { var ids = {}, k = 0, lines = sink.map(function (sp) { return JSON.stringify(sp).replace(ISO_RE, 'TS').replace(UUID_RE, function (u) { return ids[u] === undefined ? (ids[u] = 'u' + (k++)) : ids[u]; }); });
  return { n: lines.length, sha: nodeCrypto.createHash('sha256').update(lines.join('\n')).digest('hex').slice(0, 16), first: lines[0] && lines[0].slice(0, 160), last: lines[lines.length - 1] && lines[lines.length - 1].slice(0, 160) }; }
async function inPass(ad, fn) { return ad.api._withRoster ? ad.api._withRoster(fn) : fn(); }   // the product's translate-pass seam if it has one (HS2 fix); main has none
async function authorRows(ad, S, kdb, rows) {
  var specs = [], local = 0, t0 = now();
  await inPass(ad, async function () {
  for (var r of rows) { var row = { op_type: 'CRUD_CREATE', op_uuid: uuid(), gid: null, timestamp: new Date().toISOString(), parameters: JSON.stringify({ table: r[0], fields: r[1] }) };
    var t = await ad.api._translate(row, kdb); if (!t.body) { local++; continue; } specs.push({ target: t.target, body: t.body, refs: t.refs, intent: 'K2', ts: row.timestamp }); }
  });
  if (SPECSINK) specs.forEach(function (x) { SPECSINK.push(x); });
  var many = await S.authorMany(specs); if (many.error) throw many.error; return { n: specs.length, local: local, ms: now() - t0 }; }
function newKdb(SQL) { var d = new SQL.Database(); d.run('CREATE TABLE kernel_ops(id INTEGER PRIMARY KEY, op_type TEXT, op_uuid TEXT, parameters TEXT, user_tag TEXT)'); return d; }

// ═════════ the worker: creates devices, then produces the day's inbound for them (a load generator, NOT a measured instrument) ═════════
async function workerMain() {
  var E = loadEngine(), STORE = E.STORE, initSqlJs = require('sql.js'), SQL = await initSqlJs(), cfg = null, devs = {}, src = { scope: rd('common/comm/team_scope.js'), adapter: rd('erp/team_sync.js') };
  var DB = null, pipeBase = null, signed = null, roster = null;
  process.on('message', async function (m) {
    try {
      if (m.cmd === 'create') { var res = []; for (var k of m.keys) { var d = await STORE.newDevice(); devs[k] = d; res.push({ key: k, kid: d.kid, pubJwk: d.pubJwk, dhPubJwk: d.dhPubJwk }); } process.send({ id: m.id, res: res }); }
      else if (m.cmd === 'produce') {
        cfg = m; if (!DB) DB = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp', 'ad_seed.db')));
        pipeBase = E.PIPE.folderPipe(m.dir, 'star'); var mine = 0, ops = 0, ms = 0, errs = [], bytesPut = 0;
        for (var p of m.items) {
          try { var t0 = now(), d = devs[p.key], SQLd = SQL, S = STORE.open(new SQL.Database(), { SQL: SQL, space: m.space, self: d, access: function () { return { allowed: true }; }, log: function () {} });
            var founderOnly = function (n) { return n.indexOf('/o/' + m.founderKid + '/') >= 0 || n.indexOf('/h/' + m.founderKid) >= 0 || n.indexOf('/o/' + d.kid + '/') >= 0 || n.indexOf('/h/' + d.kid) >= 0; };
            var wp = countPipe(pipeBase, founderOnly, d.kid); d.person_uu = p.person;
            var ad = await boot(src, { plans: [m.signedOffice, m.signedPos], trust: [m.pub1], db: DB });
            await S.sync(wp);                                               // the roster + the epoch key (the founder's bundle)
            await ad.api._attach(S, d);
            var kdb = newKdb(SQL), r = await authorRows(ad, S, kdb, p.rows); if (r.local) errs.push('local=' + r.local);
            var rep = await S.sync(wp);                                     // push the day
            ops += r.n; mine++; ms += now() - t0; bytesPut += wp.stats.bytesPut;
            if (rep.sent !== r.n) errs.push(p.key + ' sent=' + rep.sent + ' authored=' + r.n);
            S.db && S.db.close && S.db.close();
          } catch (e) { errs.push(p.key + ' ' + (e && e.message)); }
        }
        process.send({ id: m.id, res: { devices: mine, ops: ops, ms: ms, bytesPut: bytesPut, errs: errs.slice(0, 5), nerr: errs.length } });
      } else if (m.cmd === 'exit') process.exit(0);
    } catch (e) { process.send({ id: m.id, err: String(e && e.stack || e) }); }
  });
  process.send({ ready: true });
}

// ═════════ the engine point ═════════
function pct(a, p) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; }
function fork(n) { var ws = []; for (var i = 0; i < n; i++) { var c = cp.fork(__filename, [], { env: Object.assign({}, process.env, { STAR_WORKER: '1', STAR_OOTB: OOTB }), stdio: ['ignore', 'inherit', 'inherit', 'ipc'] }); c._wait = {}; c._seq = 0;
    c.on('message', function (m) { if (m.ready) { this._ready = true; return; } var w = this._wait[m.id]; if (w) { delete this._wait[m.id]; m.err ? w.rej(new Error(m.err)) : w.res(m.res); } }); ws.push(c); }
  return ws; }
function call(c, msg) { return new Promise(function (res, rej) { msg.id = ++c._seq; c._wait[msg.id] = { res: res, rej: rej }; c.send(msg); }); }
async function waitReady(ws) { for (var i = 0; i < 600 && !ws.every(function (w) { return w._ready; }); i++) await new Promise(function (r) { setTimeout(r, 100); }); }
function dirStats(dir) { var o = { objects: 0, bytes: 0, bundles: 0, bundleBytes: 0, heads: 0, headBytes: 0 }; (function walk(d) { fs.readdirSync(d).forEach(function (n) { var p = path.join(d, n), s = fs.statSync(p); if (s.isDirectory()) return walk(p);
    o.objects++; o.bytes += s.size; if (/\/o\//.test(p)) { o.bundles++; o.bundleBytes += s.size; } else if (/\/h\//.test(p)) { o.heads++; o.headBytes += s.size; } }); })(dir); return o; }

async function enginePoint(o) {
  o = o || {}; var n = o.n, m = o.m, k = o.k, P = { n: n, m: m, k: k, workers: o.workers, status: 'PASS-RUN', phases: {} }, phase = 'setup';
  var E = loadEngine(), STORE = E.STORE, initSqlJs = require('sql.js'), SQL = await initSqlJs(), SIGN = require(path.join(BC, 'build', 'scriptor', 'sign_plan.js'));
  var src = { scope: rd('common/comm/team_scope.js'), adapter: rd('erp/team_sync.js') };
  var orgUu = [], bpUu = []; for (var i = 0; i < n; i++) orgUu.push(uuid()); for (var j = 0; j < m; j++) bpUu.push(uuid());
  var DB = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp', 'ad_seed.db'))); prepBase(DB, orgUu, bpUu);
  var K1 = await SIGN.keygen(), pub1 = { kty: 'EC', crv: 'P-256', x: K1.publicJwk.x, y: K1.publicJwk.y };
  var officeFile = rd('erp/team_plan.js'), posFile = rd('erp/team_plan_pos.js'), POS = SIGN.planOf(posFile), OFF = SIGN.planOf(officeFile);
  var signedOffice = wrapPlan('TEAM_PLAN', await SIGN.sign(OFF, K1.privateJwk, K1.publicJwk)), signedPos = wrapPlan('TEAM_PLAN_POS', await SIGN.sign(POS, K1.privateJwk, K1.publicJwk));
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'star_relay_')), base = E.PIPE.folderPipe(dir, 'star'), allow = function () { return { allowed: true }; };
  var Fd = await STORE.newDevice(), PF = uuid(), sp = await STORE.newSpace('star', Fd, PF, 'HQ', HQ, { planTrust: [pub1], plan: 'pos' }); Fd.person_uu = PF;
  var FS = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: Fd, access: allow, log: function () {} }); await FS.genesis(sp.params);
  var Fp = countPipe(base, null, Fd.kid), Fad = await boot(src, { plans: [signedOffice, signedPos], trust: [pub1], db: DB }); await Fad.api._attach(FS, Fd);
  var Fkdb = newKdb(SQL);
  // ── the sampled (measured) devices live in this process; the other devices are created by the workers ──
  var sample = [{ key: 's:0', role: 'station', idx: 0 }, { key: 's:' + (n - 1), role: 'station', idx: n - 1 }, { key: 'b:0', role: 'borrower', idx: 0 }, { key: 'b:' + (m - 1), role: 'borrower', idx: m - 1 }].filter(function (x, i, a) { return a.findIndex(function (y) { return y.key === x.key; }) === i; });
  var sampleKeys = {}; sample.forEach(function (s) { sampleKeys[s.key] = s; });
  var all = []; for (i = 0; i < n; i++) all.push({ key: 's:' + i, role: 'station', idx: i, person: orgUu[i] }); for (j = 0; j < m; j++) all.push({ key: 'b:' + j, role: 'borrower', idx: j, person: bpUu[j] });
  var gen = all.filter(function (x) { return !sampleKeys[x.key]; }), ws = o.workers > 0 ? fork(o.workers) : []; await waitReady(ws);
  try {
    // 1. devices (keys): samples here, the rest in the workers (the private key is non-extractable, so a device lives in the process that made it)
    phase = 'create-devices'; var t0 = now(), pubs = {};
    for (var s of sample) { var d = await STORE.newDevice(); d.person_uu = s.person = (s.role === 'station' ? orgUu[s.idx] : bpUu[s.idx]); s.dev = d; pubs[s.key] = { kid: d.kid, pubJwk: d.pubJwk, dhPubJwk: d.dhPubJwk, person: s.person }; }
    var slices = ws.map(function () { return []; }); gen.forEach(function (g, ix) { slices[ix % ws.length].push(g); });
    var created = await Promise.all(ws.map(function (w, wi) { return call(w, { cmd: 'create', keys: slices[wi].map(function (g) { return g.key; }) }); }));
    created.forEach(function (arr, wi) { arr.forEach(function (c) { var g = all.find(function (x) { return x.key === c.key; }); pubs[c.key] = { kid: c.kid, pubJwk: c.pubJwk, dhPubJwk: c.dhPubJwk, person: g.person }; }); });
    P.phases.create_ms = now() - t0; out('§STAR-PHASE create-devices devices=' + (n + m) + ' ms=' + P.phases.create_ms.toFixed(0));
    // 2. head office enrols every device (PERSON + ENROLL + KEYGRANT = 3 identity ops each); its own cost vs roster size is a measured curve
    phase = 'enrol'; t0 = now(); var curve = [], tc = now();
    for (var ix = 0; ix < all.length; ix++) { var a = all[ix], pb = pubs[a.key];
      await FS.addPerson({ person_uu: pb.person, name: a.key, ad_role_id: STN, comm_admin: false }); await FS.enroll(pb.kid, pb.pubJwk, pb.person, pb.dhPubJwk);
      if ((ix + 1) % Math.max(1, Math.floor(all.length / 10)) === 0) { curve.push([ix + 1, Math.round(now() - tc)]); tc = now(); out('§STAR-ENROL devices=' + (ix + 1) + '/' + all.length + ' block_ms=' + curve[curve.length - 1][1]); box('enrol', (ix + 1) + '/' + all.length + ' devices'); } }
    P.phases.enrol_ms = now() - t0; P.enrol_block_ms = curve; out('§STAR-PHASE enrol devices=' + all.length + ' identity_ops=' + (3 * all.length) + ' ms=' + P.phases.enrol_ms.toFixed(0) + ' per_device_ms=' + (P.phases.enrol_ms / all.length).toFixed(1));
    var rep0 = await FS.sync(Fp); out('§STAR-PHASE founder-push sent=' + rep0.sent + ' bytes=' + Fp.stats.bytesPut);
    // 3. the day's inbound: load generators (workers) then the sampled edges
    phase = 'produce'; t0 = now();
    var items = gen.map(function (g) { var rows = g.role === 'station' ? [].concat.apply([], Array.from({ length: k }, function (_, t) { return ticketRows(g.idx, t, 2); })) : borrowerRows(g.idx, ID0 + g.idx); return { key: g.key, person: g.person, rows: rows }; });
    var sl2 = ws.map(function () { return []; }); items.forEach(function (it, ix2) { sl2[ix2 % ws.length].push(it); });
    var prod = await Promise.all(ws.map(function (w, wi) { return call(w, { cmd: 'produce', dir: dir, space: sp.space, founderKid: Fd.kid, items: sl2[wi], signedOffice: signedOffice, signedPos: signedPos, pub1: pub1 }); }));
    var pd = prod.reduce(function (z, x) { z.devices += x.devices; z.ops += x.ops; z.nerr += x.nerr; z.errs = z.errs.concat(x.errs); z.ms += x.ms; return z; }, { devices: 0, ops: 0, nerr: 0, errs: [], ms: 0 });
    P.phases.produce_ms = now() - t0; P.generated = pd; out('§STAR-PHASE produce load_generators=' + pd.devices + '/' + gen.length + ' ops=' + pd.ops + ' errs=' + pd.nerr + (pd.errs.length ? ' ' + JSON.stringify(pd.errs) : '') + ' wall_ms=' + P.phases.produce_ms.toFixed(0) + ' sum_device_ms=' + pd.ms.toFixed(0));
    if (pd.nerr) throw new Inconclusive('produce', 'load generators failed: ' + pd.nerr);
    box('produce', pd.devices + ' generators');
    // 4. the sampled edges: author their day, then VISIT #1 (fetches the whole relay: this is the day's catch-up Visit)
    phase = 'edge-visit-1';
    for (s of sample) { s.S = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: s.dev, access: allow, log: function () {} }); s.pipe = countPipe(base, null, s.dev.kid);
      s.ad = await boot(src, { plans: [signedOffice, signedPos], trust: [pub1], db: DB }); s.kdb = newKdb(SQL);
      await s.S.sync(countPipe(base, function (nm) { return nm.indexOf('/o/' + Fd.kid + '/') >= 0 || nm.indexOf('/h/' + Fd.kid) >= 0; }, s.dev.kid));      // the roster + key only (not a measured Visit)
      await s.ad.api._attach(s.S, s.dev);
      var rows = s.role === 'station' ? [].concat.apply([], Array.from({ length: k }, function (_, t) { return ticketRows(s.idx, t, 2); })) : borrowerRows(s.idx, ID0 + s.idx); s.authored = (await authorRows(s.ad, s.S, s.kdb, rows)).n; s.pipe.reset();
      var tv = now(), rp = await s.S.sync(s.pipe), tsync = now() - tv, pj = await s.ad.api._project([]), tall = now() - tv, last = s.ad.api._project.last || {}, th = last.thin || {};
      s.v1 = { sync_ms: tsync, visit_ms: tall, bytes_down: s.pipe.stats.bytesGet, objs_down: s.pipe.stats.getObjs, gets: s.pipe.stats.get, lists: s.pipe.stats.list, listed: s.pipe.stats.listed, bytes_up: s.pipe.stats.bytesPut, sent: rp.sent, fetched: rp.fetched, received: rp.received, placed: th.placed, accepted: th.accepted, refused: th.refused, rows: pj.filter(function (r) { return r.user_tag === 'team'; }).length, db_bytes: s.S.db ? s.S.db.export().length : null };
      out('§STAR-EDGE-V1 ' + s.key + ' ' + JSON.stringify(s.v1)); box('edge-visit-1', s.key); }
    // 5. head office visits: fold ms of the day's inbound, then answers
    phase = 'hq-visit'; Fp.reset(); var th0 = now(), hrep = await FS.sync(Fp), hsync = now() - th0, hpj = await Fad.api._project([]), hproj = now() - th0 - hsync, hl = Fad.api._project.last || {};
    var foldable = (await FS.foldable()).length; if (global.gc) global.gc();
    P.hq_visit = { sync_ms: hsync, project_ms: hproj, fold_ms: hsync + hproj, bytes_down: Fp.stats.bytesGet, objs_down: Fp.stats.getObjs, listed: Fp.stats.listed, fetched: hrep.fetched, received: hrep.received, placed: hrep.placed, foldable: foldable, accepted: (hl.thin || {}).accepted, refused: (hl.thin || {}).refused, db_bytes: FS.db.export().length };
    out('§STAR-HQ-VISIT ' + JSON.stringify(P.hq_visit)); box('hq-visit', 'visit');
    phase = 'hq-replies'; t0 = now(); var bpRow = q(DB, 'SELECT c_bpartner_id AS i FROM c_bpartner WHERE c_bpartner_id>=?', [ID0]).length;
    var replyRows = [], invUu = [];
    for (i = 0; i < n; i++) replyRows.push(['m_movementline', { m_product_id: 123, qtyentered: 2, c_uom_id: 100, m_locator_id: 101, m_locatorto_id: ID0 + i, description: 'x', ad_client_id: 11, ad_org_id: 0 }]);
    var _ord = FS.order, ORD = { n: 0 }; FS.order = function () { ORD.n++; return _ord.apply(this, arguments); }; SPECSINK = [];   // HS2: count the log refolds the reply pass causes
    var kid8 = 100, tm0 = now(), rr = await authorRows(Fad, FS, Fkdb, replyRows), tmMov = now() - tm0, loans = 0, sched = 0, specs = [], tt0 = now();
    await inPass(Fad, async function () {
    for (j = 0; j < m; j++) { var ku = uuid(), iid = ++kid8;
      Fkdb.run("INSERT INTO kernel_ops VALUES (?,'CRUD_CREATE',?,?,'team')", [iid, ku, JSON.stringify({ table: 'c_invoice', fields: { c_bpartner_id: ID0 + j, documentno: 'STARLN' + j, grandtotal: 100 } })]);
      var rI = { op_type: 'CRUD_CREATE', op_uuid: ku, gid: null, timestamp: new Date().toISOString(), parameters: JSON.stringify({ table: 'c_invoice', fields: { c_bpartner_id: ID0 + j, documentno: 'STARLN' + j, grandtotal: 100, description: 'secret', ad_client_id: 11, ad_org_id: 0 } }) };
      var tI = await Fad.api._translate(rI, Fkdb); if (tI.body) { specs.push({ target: tI.target, body: tI.body, refs: tI.refs, intent: 'K2', ts: rI.timestamp }); loans++; }
      var rS = { op_type: 'CRUD_CREATE', op_uuid: uuid(), gid: null, timestamp: new Date().toISOString(), parameters: JSON.stringify({ table: 'c_invoicepayschedule', fields: { c_invoice_id: -iid, dueamt: 50, duedate: '2026-11-27', ad_client_id: 11, ad_org_id: 0 } }) };
      var tS = await Fad.api._translate(rS, Fkdb); if (tS.body) { specs.push({ target: tS.target, body: tS.body, refs: tS.refs, intent: 'K2', ts: rS.timestamp }); sched++; } }
    });
    specs.forEach(function (x) { SPECSINK.push(x); });
    var tmTr = now() - tt0, ta0 = now(), many = await FS.authorMany(specs); if (many.error) throw many.error; var tmAu = now() - ta0, tp0 = now(); FS.order = _ord;
    var rep9 = await FS.sync(Fp); P.hq_replies = { order_calls: ORD.n, spec_digest: specDigest(SPECSINK), pass_seam: !!Fad.api._withRoster, movements: rr.n, loans: loans, schedules: sched, author_ms: now() - t0, movements_ms: tmMov, loans_translate_ms: tmTr, loans_author_many_ms: tmAu, push_sync_ms: now() - tp0, pushed: rep9.sent }; out('§STAR-HQ-REPLIES ' + JSON.stringify(P.hq_replies));
    if (rr.n !== n || loans !== m || sched !== m) throw new Inconclusive('hq-replies', 'replies not all addressed: movements ' + rr.n + '/' + n + ' loans ' + loans + '/' + m + ' schedules ' + sched + '/' + m);
    box('hq-replies', 'replies');
    // 6. VISIT #2 of the sampled edges: the steady-state Visit that picks up head office's answer
    phase = 'edge-visit-2';
    for (s of sample) { s.pipe.reset(); var tv2 = now(), rp2 = await s.S.sync(s.pipe), tsync2 = now() - tv2, pj2 = await s.ad.api._project([]), tall2 = now() - tv2, l2 = s.ad.api._project.last || {}, h2 = l2.thin || {};
      var mine = pj2.filter(function (r) { return r.user_tag === 'team'; });
      s.v2 = { sync_ms: tsync2, visit_ms: tall2, bytes_down: s.pipe.stats.bytesGet, objs_down: s.pipe.stats.getObjs, gets: s.pipe.stats.get, lists: s.pipe.stats.list, listed: s.pipe.stats.listed, fetched: rp2.fetched, placed: h2.placed, accepted: h2.accepted, refused: h2.refused, rows: mine.length, byTable: h2.byTable, db_bytes: s.S.db.export().length, mov_rows: mine.filter(function (r) { return /m_movementline/.test(r.parameters); }).length, inv_rows: mine.filter(function (r) { return /"c_invoice"/.test(r.parameters); }).length };
      out('§STAR-EDGE-V2 ' + s.key + ' ' + JSON.stringify(s.v2)); box('edge-visit-2', s.key); }
    // 7. CONTROL: plant ONE extra op at the first station: the counter must move by exactly 1
    phase = 'control'; var s0 = sample[0], pre = s0.v2.accepted, ex = await authorRows(s0.ad, s0.S, s0.kdb, [['c_orderline', { m_product_id: 123, qtyentered: 9, c_uom_id: 100, ad_client_id: 11, ad_org_id: 0 }]]);
    s0.pipe.reset(); await s0.S.sync(s0.pipe); await s0.ad.api._project([]); var post = ((s0.ad.api._project.last || {}).thin || {}).accepted; P.control = { planted: ex.n, accepted_before: pre, accepted_after: post, moved: post - pre }; out('§STAR-CONTROL ' + JSON.stringify(P.control));
    // 8. MUTANT scope-off: the SAME station read through a copy of the scope reader that admits everything
    phase = 'mutant-scope'; var scopeSrc = src.scope, needle = "if (s === 'share' || c.self) return { ok: true };", cnt = scopeSrc.split(needle).length - 1;
    if (cnt !== 1) throw new Error('mutant scope-off did not apply exactly once (found ' + cnt + ')');
    var mut = { scope: scopeSrc.replace(needle, 'return { ok: true };'), adapter: src.adapter }, mad = await boot(mut, { plans: [signedOffice, signedPos], trust: [pub1], db: DB }); await mad.api._attach(s0.S, s0.dev); await mad.api._project([]);
    var mth = (mad.api._project.last || {}).thin || {}; P.mutant_scope = { accepted_mutant: mth.accepted, accepted_real: post, placed: mth.placed }; out('§STAR-MUTANT scope-off ' + JSON.stringify(P.mutant_scope));
    // end of day numbers
    P.relay = dirStats(dir); P.relay.written_ops_objs = null;
    P.sample = sample.map(function (z) { return { key: z.key, role: z.role, authored: z.authored, v1: z.v1, v2: z.v2 }; });
    P.mem = { heap_mb: Math.round(process.memoryUsage().heapUsed / 1e6), rss_mb: Math.round(process.memoryUsage().rss / 1e6) };
    P.wall_ms = Date.now() - T0; out('§STAR-RELAY ' + JSON.stringify(P.relay));
  } catch (e) { if (e instanceof Inconclusive) { P.status = 'INCONCLUSIVE'; P.reason = e.phase + ': ' + e.why; out('§STAR-INCONCLUSIVE phase=' + e.phase + ' ' + e.why); } else { P.status = 'ERROR'; P.reason = phase + ': ' + String(e && e.stack || e).slice(0, 600); out('§STAR-ERROR ' + P.reason); } }
  finally { ws.forEach(function (w) { try { w.send({ cmd: 'exit' }); } catch (e) {} }); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
  P.wall_ms = Date.now() - T0; return P;
}


// ═════════ the head-office model-layer point (REAL model layer in Node, as witness_pos_sales.js / witness_import_payment.js / witness_acct_processor.js drive it) ═════════
async function hqPoint(o) {
  var LC = { calls: 0, ms: 0, hits: 0, wms: 0 }; var n = o.n, m = o.m, k = o.k, FULL = true, P = { kind: 'hq', n: n, m: m, k: k, variant: 'shipped', status: 'PASS-RUN', rounds: [] }, phase = 'setup';
  var ERP = path.join(OOTB, 'erp'), SQLJS_DIR = process.env.SQLJS_DIR || '/home/red1/bim-ootb/tests/node_modules/sql.js'; process.env.SQLJS = SQLJS_DIR; if (!global.window) global.window = {};
  var realLog = console.log, SEEN = []; console.log = function () { var s0 = Array.prototype.join.call(arguments, ' '); SEEN.push(s0); if (SEEN.length > 5000) SEEN.splice(0, 2500); var mb = /^§LOGINCTX build .* ms=(\d+)/.exec(s0); if (mb) LC.ms += Number(mb[1]); };   // the shipped § lines are captured, then selectively re-printed
  var say = function (s) { realLog(s); };
  try {
    var initSqlJs = require(SQLJS_DIR), SQLM = await initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIR, 'dist', f); } });
    var db = new SQLM.Database(new Uint8Array(fs.readFileSync(path.join(ERP, 'ad_seed.db')))), pOk = 0, pBad = 0;
    fs.readFileSync(path.join(ERP, 'patches/ad_seed.db.sql'), 'utf8').split(/;\s*\n/).forEach(function (st) { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.run(st); pOk++; } catch (e) { pBad++; } });
    var req = function (f) { return require(path.join(ERP, f)); }; req('ad_rule.js').ensure(db); req('ad_import_tables.js').ensure(db); try { req('ad_index_overlay.js').ensure(db); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }   // the host boot overlays (the index overlay exists only on the fixed tree)
    var KR = req('ws_kernel.js'), kk = KR.build(db), ML = kk.ML, AP = req('ad_process.js'), PR = req('plugin_registry.js'), INV = req('model_invoice.js'), AC = req('ad_callout.js');
    // NOT memoised any more (agent T, TEAMWORK_FRAMEWORK §45.7): login-context builds are COUNTED as the AD_Preference reads they issue (one per build, on main and on the fixed tree alike);
    // their ms come from the product's own `§LOGINCTX build ... ms=` line (fixed tree) or from timing AdCallout.loginContext (main, which has no such line).
    var _lc = AC.loginContext; AC.loginContext = function () { var t = now(); try { return _lc.apply(this, arguments); } finally { LC.wms += now() - t; } };
    var _kq = kk.q, PROF = A['profile-sql'] ? { shapes: {} } : null;   // --profile-sql: time every statement the model layer reads, by shape (HS3 diagnosis, TEAMWORK_FRAMEWORK §45.7)
    kk.q = function (sql, p) { if (/FROM AD_Preference/i.test(sql)) LC.calls++; if (!PROF) return _kq.call(this, sql, p); var t = now(), r = _kq.call(this, sql, p), dt = now() - t, sh = String(sql).replace(/\s+/g, ' ').replace(/'[^']*'/g, "'?'").replace(/\b\d+\b/g, 'N').slice(0, 220), e = PROF.shapes[sh] || (PROF.shapes[sh] = { n: 0, ms: 0, sql: sql, p: p }); e.n++; e.ms += dt; if (e.n === 3 && !e.stack) e.stack = (new Error().stack || '').split('\n').slice(2, 7).map(function (x) { return x.trim().replace(/^at /, '').replace(/\(?\/tmp\/wt-[a-z-]+\/erp\//, '(') }).join(' < '); return r; };
    var S = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'witness:scale-star' }, ENVX = { clientAccounting: 'Q' };    // tenant choice 'Q' = end-of-day posting (TEAMWORK_FRAMEWORK §41.1 F1): Complete does not post, the Tenant Accounting Processor does
    function one(sql, p) { return kk.q(sql, p || [])[0] || null; }
    function commit(fn, meta) { var trx = new ML.Trx(kk.q, Object.assign(kk.env(S), ENVX)), r; try { r = fn(trx, ML) || { ok: true }; } catch (ex) { r = { ok: false, error: 'model threw: ' + (ex && ex.stack) }; }
      var ok = r.ok !== false, ops = ok ? trx.groupOps() : [], ids = []; if (ok && ops.length) ids = kk.commit(S, ops, meta); return Object.assign({}, r, { ok: ok, ops: ops, ids: ids, log: trx.log }); }
    function saveAll(rows) { return function (trx) { for (var i = 0; i < rows.length; i++) { var sv = ML.save(trx, rows[i].t, null, ML.newPO(trx, rows[i].t, rows[i].f)); if (!sv.ok) return { ok: false, error: rows[i].t + ' #' + i + ': ' + sv.error }; } return { ok: true }; }; }
    function run(pid, params, tag) { var t = now(), lc0 = LC.calls, lm0 = LC.ms + LC.wms, r = commit(function (trx) { var r0 = AP.runInTrx(trx, pid, { params: params || {} }); return { ok: r0.ok, r: r0, error: r0.summary }; }, { ws: tag });
      return { ok: r.ok && r.r && r.r.ok === true, err: r.error, summary: r.r && r.r.summary, ms: now() - t, ops: r.ops.length, lc_calls: LC.calls - lc0, lc_ms: LC.ms + LC.wms - lm0, log: r.log || [], logs: (r.r && r.r.logs) || [] }; }
    // the POS plugin, installed on the registry exactly as the host does (as witness_pos_sales.js)
    var hostDb = { query: function (sql, p) { var st = db.prepare(sql), o2 = []; try { if (p && p.length) st.bind(p); while (st.step()) { var x = st.getAsObject(), r = {}; for (var c in x) r[c.toLowerCase()] = x[c]; o2.push(r); } } finally { st.free(); } return o2; }, run: function (sql, p) { db.run(sql, p || []); } };
    var host = { engineVersion: '1.0.0', db: hostDb, ops: { append: function () { return 1; } }, process: AP, docAction: ML, import: function (u) { return import(url.pathToFileURL(path.resolve(path.join(ERP, 'plugins'), u)).href); } };
    var reg = PR.create(host), mod = await import(url.pathToFileURL(path.join(ERP, 'plugins', 'pos_integration.mjs')).href); await reg.installBundle(mod); var st0 = await reg.startBundle('org.kernel.pos-integration');
    var PID = 9538001, BANK = { C_BankAccount_ID: 100, AD_Client_ID: 11, AD_Org_ID: 11 };
    say('§STAR-HQ-SETUP variant=' + P.variant + ' seed_patch ok=' + pOk + ' failed=' + pBad + ' plugin=' + st0.state + ' clientAccounting=Q ctx_cache=false (as shipped: the harness no longer memoises anything; login-context builds are counted)');
    var lineRow = function (key, prod, price) { return { t: 'i_order', f: { i_isimported: 'N', issotrx: 'Y', documentno: key, doctypename: 'POS Order', m_product_id: prod, qtyordered: 1, priceactual: price, c_uom_id: 100, dateordered: D1, ad_org_id: 11 } }; };
    var tenderRow = function (key, amt) { return { t: 'i_payment', f: { i_isimported: 'N', documentno: key, doctypename: 'AR Receipt', iso_code: 'USD', payamt: amt, tendertype: 'X', datetrx: D1, ad_org_id: 11 } }; };
    phase = 'acct-baseline'; var rb0 = run(53187, {}, 'acct_baseline'); P.acct_baseline = { err: rb0.summary, ms: rb0.ms, answer: String((rb0.logs.length ? rb0.logs[rb0.logs.length - 1].msg : '')).slice(0, 160) }; say('§STAR-HQ-ACCT-BASELINE ok=' + rb0.ok + ' summary=' + String(rb0.summary || rb0.err).slice(0, 300) + ' the seed\'s own unposted backlog is posted first and NOT counted in the day: ms=' + Math.round(rb0.ms));
    var T = n * k, seq = 0, depMs = 0, depN = 0;
    function deposit(cnt) { var t = now(); for (var i = 0; i < cnt; i++) { var key = 'STAR' + (seq % n) + '/2026-10-29/' + Math.floor(seq / n) + '#' + seq; seq++; var d = commit(saveAll([lineRow(key, 123, 65), lineRow(key, 130, 50), tenderRow(key, 115)]), { ws: 'deposit' }); if (!d.ok) throw new Error('deposit: ' + d.error); } depMs += now() - t; depN += cnt; }
    // ── Import POS Sales ──
    phase = 'import-pos-sales'; var sizes = [];
    { var R = Math.min(5, T); for (var r = 0; r < R; r++) sizes.push(Math.floor(T / R) + (r < T % R ? 1 : 0)); }
    var imported = 0, tmax = 0;
    for (var ri = 0; ri < sizes.length; ri++) {
      if (Date.now() > DEADLINE) { P.status = 'PARTIAL'; P.reason = 'time box before round ' + (ri + 1) + '/' + sizes.length + ' of Import POS Sales'; break; }
      deposit(sizes[ri]); var ru = run(PID, BANK, 'import_pos_sales'), mm = /#(\d+)\/(\d+)/.exec(ru.summary || ''), okN = mm ? Number(mm[1]) : 0, refN = mm ? Number(mm[2]) : -1;
      if (PROF) { var top = Object.keys(PROF.shapes).map(function (k) { return [k, PROF.shapes[k]]; }).sort(function (a, b) { return b[1].ms - a[1].ms; }).slice(0, 6); top.forEach(function (t2) { var plan = ''; try { plan = db.exec('EXPLAIN QUERY PLAN ' + t2[1].sql, t2[1].p || [])[0].values.map(function (v) { return v[3]; }).join(' ; '); } catch (e) { plan = 'plan?' + e.message; } say('§STAR-SQLPROF round=' + (ri + 1) + ' ms=' + Math.round(t2[1].ms) + ' n=' + t2[1].n + ' | ' + t2[0].slice(0, 150) + ' | PLAN ' + plan.slice(0, 260)); if (t2[1].stack) say('§STAR-SQLPROF-STACK ' + t2[0].slice(0, 60) + ' <- ' + t2[1].stack.slice(0, 700)); }); PROF.shapes = {}; }
      var rd2 = { round: ri + 1, deposited: sizes[ri], imported: okN, refused: refN, ms: ru.ms, ms_per_ticket: okN ? ru.ms / okN : null, ms_per_ticket_ex_ctx: okN ? (ru.ms - ru.lc_ms) / okN : null, login_ctx_calls: ru.lc_calls, login_ctx_ms: ru.lc_ms, ops: ru.ops, heap_mb: Math.round(process.memoryUsage().heapUsed / 1e6), orders_total: one("SELECT count(*) AS c FROM c_order WHERE documentno LIKE 'STAR%'").c };
      P.rounds.push(rd2); imported += okN; say('§STAR-HQ-IMPORT ' + JSON.stringify(rd2)); if (okN !== sizes[ri] || refN !== 0) { P.status = 'ERROR'; P.reason = 'Import POS Sales round ' + (ri + 1) + ' answered ' + ru.summary + ' for ' + sizes[ri] + ' tickets'; break; } }
    P.tickets_imported = imported; var mmx = P.rounds.filter(function (x) { return x.ms_per_ticket; }); P.import_ms_per_ticket = mmx.length ? mmx.reduce(function (z, x) { return z + x.ms; }, 0) / imported : null; P.import_ms_per_ticket_ex_ctx = mmx.length ? mmx.reduce(function (z, x) { return z + x.ms - x.login_ctx_ms; }, 0) / imported : null;
    P.import_ms_per_ticket_first = mmx.length ? mmx[0].ms_per_ticket_ex_ctx : null; P.import_ms_per_ticket_late = mmx.length ? mmx[mmx.length - 1].ms_per_ticket_ex_ctx : null;
    P.login_ctx = { calls: LC.calls, ms: LC.ms + LC.wms, hits: LC.hits, share_of_import: P.rounds.length ? P.rounds.reduce(function (z, x) { return z + x.login_ctx_ms; }, 0) / P.rounds.reduce(function (z, x) { return z + x.ms; }, 0) : null };
    P.deposit_ms_per_ticket = depN ? depMs / depN : null;
    // oracle: every imported ticket made exactly one completed order, invoice and receipt
    var oc = one("SELECT count(*) AS c FROM c_order WHERE documentno LIKE 'STAR%' AND docstatus='CO'").c, ic = one("SELECT count(*) AS c FROM c_invoice i JOIN c_order o ON o.c_order_id=i.c_order_id WHERE o.documentno LIKE 'STAR%' AND i.docstatus='CO'").c, pc = one("SELECT count(*) AS c FROM c_payment WHERE documentno LIKE 'STAR%' AND docstatus='CO'").c;
    P.oracle = { orders_co: oc, invoices_co: ic, receipts_co: pc, tickets: imported }; say('§STAR-HQ-ORACLE ' + JSON.stringify(P.oracle));
    if (imported > 0 && !(oc === imported && ic === imported && pc === imported)) { P.status = 'ERROR'; P.reason = 'oracle mismatch ' + JSON.stringify(P.oracle); }
    // ── a Complete micro-measure: copy + Complete of an invoice (acct witness completeCopy) ──
    phase = 'complete'; var cm = [], cnt = 5;
    for (var ci = 0; ci < cnt; ci++) { var tc = now(), rc = commit(function (trx) { var s2 = INV.MInvoice_copyFrom(trx, trx.get('c_invoice', 109), '2026-10-02 00:00:00', '2026-10-02 00:00:00', 116, true, false, false, null); var r0 = ML.processIt(trx, 'c_invoice', s2.c_invoice_id, 'CO'); return { ok: r0.ok, error: r0.msg }; }, { ws: 'complete' }); if (!rc.ok) { say('§STAR-HQ-COMPLETE-FAIL ' + rc.error); break; } cm.push(now() - tc); }
    P.complete_invoice_ms = cm.length ? cm.reduce(function (a, b) { return a + b; }, 0) / cm.length : null; say('§STAR-HQ-COMPLETE invoice copy+Complete ms=' + JSON.stringify(cm.map(function (x) { return Math.round(x); })));
    // ── Import Payment (343): a borrower's slip is allocated to its loan invoice ──
    phase = 'import-payment'; var slipN = Math.min(m, 1000), invs = [];
    for (var j = 0; j < slipN; j++) { if (Date.now() > DEADLINE) break; var inv = null; var rc2 = commit(function (trx) { var s3 = INV.MInvoice_copyFrom(trx, trx.get('c_invoice', 109), '2026-10-02 00:00:00', '2026-10-02 00:00:00', 116, true, false, false, null); var r0 = ML.processIt(trx, 'c_invoice', s3.c_invoice_id, 'CO'); return { ok: r0.ok, error: r0.msg }; }, { ws: 'loan' }); if (!rc2.ok) break;
      invs.push(one('SELECT documentno AS d FROM c_invoice WHERE c_invoice_id=(SELECT MAX(c_invoice_id) FROM c_invoice)').d); }
    P.slips_planned = slipN; P.loans_made = invs.length; var sl = 0, paid = 0, payRounds = [];
    var pChunks = 4, per = Math.ceil(invs.length / pChunks);
    for (var pc2 = 0; pc2 < pChunks; pc2++) { var part = invs.slice(pc2 * per, (pc2 + 1) * per); if (!part.length) break; if (Date.now() > DEADLINE) { P.status = P.status === 'PASS-RUN' ? 'PARTIAL' : P.status; P.reason = (P.reason ? P.reason + '; ' : '') + 'time box in Import Payment'; break; }
      var rows = part.map(function (dn, ix) { return { t: 'i_payment', f: { i_isimported: 'N', documentno: 'STARSLIP' + (sl + ix), doctypename: 'AR Receipt', iso_code: 'USD', payamt: 10, datetrx: D1, invoicedocumentno: dn, ad_org_id: 11 } }; });
      var dd = commit(saveAll(rows), { ws: 'slip-deposit' }); if (!dd.ok) { P.status = 'ERROR'; P.reason = 'slip deposit: ' + dd.error; break; }
      var rp = run(343, { AD_Org_ID: 11, C_BankAccount_ID: 100, DocAction: 'CO', DeleteOldImported: 'N' }, 'import_payment'), ins = (rp.logs.map(function (l) { return l.msg || ''; }).join('|').match(/C_Payment_ID[^|]*?(\d+)/) || [])[1];
      var made = one("SELECT count(*) AS c FROM c_payment WHERE documentno LIKE 'STARSLIP%' AND docstatus='CO'").c - paid; paid += made;
      var pr = { round: pc2 + 1, slips: part.length, receipts_made: made, ms: rp.ms, ms_per_slip: made ? rp.ms / made : null, login_ctx_calls: rp.lc_calls, login_ctx_ms: rp.lc_ms, summary: rp.summary }; payRounds.push(pr); say('§STAR-HQ-PAYMENT ' + JSON.stringify(pr)); sl += part.length; if (made !== part.length) { P.status = 'ERROR'; P.reason = 'Import Payment made ' + made + ' of ' + part.length; break; } }
    P.payment_rounds = payRounds; var pm = payRounds.filter(function (x) { return x.ms_per_slip; }); P.payment_ms_per_slip = pm.length ? pm.reduce(function (z, x) { return z + x.ms; }, 0) / pm.reduce(function (z, x) { return z + x.receipts_made; }, 0) : null; P.slips_imported = paid;
    // ── Replenish Report (53267) creating movements from the source warehouse (the twin-only fixture of witness_replenish_diff.js M1; one destination warehouse = one branch) ──
    phase = 'replenish'; try { req('processes/ReplenishReportProduction.js'); } catch (e) {}
    db.run('UPDATE m_warehouse SET m_warehousesource_id=104 WHERE m_warehouse_id=103'); db.run('DELETE FROM m_storageonhand WHERE m_locator_id IN (102)');
    [[123, 102, '2020-01-01', 30], [128, 102, '2022-02-02', 80], [127, 102, '2020-03-03', 100]].forEach(function (z) { db.run("INSERT INTO m_storageonhand (ad_client_id, ad_org_id, isactive, m_locator_id, m_product_id, m_attributesetinstance_id, qtyonhand, datematerialpolicy, m_storageonhand_uu) VALUES (11, 12, 'Y', ?, ?, 0, ?, ?, ?)", [z[1], z[0], z[3], z[2], 'star-' + z[0]]); });
    var mv0 = one('SELECT count(*) AS c FROM m_movement').c, rr = run(53267, { M_Warehouse_ID: 103, ReplenishmentCreate: 'MMM', C_DocType_ID: 143 }, 'replenish'), mv1 = one('SELECT count(*) AS c FROM m_movement').c;
    P.replenish_ms = rr.ms; P.replenish = { ok: rr.ok, summary: rr.summary, movements_made: mv1 - mv0, login_ctx_calls: rr.lc_calls, login_ctx_ms: rr.lc_ms, t_replenish_rows: (one('SELECT count(*) AS c FROM t_replenish') || {}).c }; say('§STAR-HQ-REPLENISH ' + JSON.stringify(P.replenish) + ' ms=' + Math.round(rr.ms));
    // ── end-of-day posting: the Tenant Accounting Processor (53187) over everything queued ──
    phase = 'acct'; var f0 = one('SELECT count(*) AS c FROM fact_acct').c, unposted = one("SELECT count(*) AS c FROM c_invoice WHERE processed='Y' AND posted<>'Y'").c, ra = run(53187, {}, 'acct_processor'), f1 = one('SELECT count(*) AS c FROM fact_acct').c;
    var ans = ra.logs.length ? ra.logs[ra.logs.length - 1].msg : '', nd = String(ans).split(' - ').reduce(function (z, x) { var mm2 = /^[A-Za-z_]+=(\d+)/.exec(x.trim()); return z + (mm2 ? Number(mm2[1]) : 0); }, 0);
    P.acct_ms = ra.ms; P.acct_docs = nd; P.acct_ms_per_doc = nd ? ra.ms / nd : null; P.acct = { ok: ra.ok, answer: String(ans).slice(0, 200), fact_rows_added: f1 - f0, invoices_unposted_before: unposted, login_ctx_calls: ra.lc_calls, login_ctx_ms: ra.lc_ms }; say('§STAR-HQ-ACCT ' + JSON.stringify(P.acct) + ' ms=' + Math.round(ra.ms));
    if (global.gc) global.gc(); P.mem = { heap_mb: Math.round(process.memoryUsage().heapUsed / 1e6), rss_mb: Math.round(process.memoryUsage().rss / 1e6) }; P.model_db_bytes = db.export().length;
    P.day_total_ms_measured = (P.rounds.reduce(function (z, x) { return z + x.ms; }, 0)) + payRounds.reduce(function (z, x) { return z + x.ms; }, 0) + P.replenish_ms + P.acct_ms;
  } catch (e) { P.status = 'ERROR'; P.reason = phase + ': ' + String(e && e.stack || e).slice(0, 700); }
  console.log = realLog; P.wall_ms = Date.now() - T0; P.loadavg_end = os.loadavg().map(function (x) { return +x.toFixed(2); }); return P;
}

function header() {
  out('§STAR-HEADER W-SCALE-STAR mode=' + MODE + ' N=' + N + ' M=' + M + ' K=' + K + ' workers=' + W + ' box_min=' + BUDGET_MS / 60000 + ' ootb=' + OOTB + ' commit=' + (cp.spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout || '').trim() + ' node=' + process.version + ' cpus=' + os.cpus().length + ' loadavg=' + os.loadavg().map(function (x) { return x.toFixed(2); }).join(',') + ' at=' + new Date().toISOString());
  out('§STAR-LIMITS one Node process family simulates all devices (no network latency, no browser); the relay is a folder pipe on local disk; load-generating devices fetch only the founder\'s roster bundle and are not measured;');
  out('§STAR-LIMITS the measured edges (2 stations: first+last, 2 borrowers: first+last) and head office fetch the WHOLE relay; Node + sql.js timings are not browser timings; teamRebuild (ERP projection) is browser-only, so Visit ms = sync + adapter _project;');
  out('§STAR-LIMITS per-device numbers are per device INSTANCE; head-office model-layer inputs are K4-shaped tickets (engine carries only the plan\'s declared columns; the two are not bridged by a projection in Node).');
}

// ═════════ fits ═════════
function fitRow(name, xs, ys, unit) { var pts = xs.map(function (x, i) { return [x, ys[i]]; }).filter(function (p) { return p[1] != null && isFinite(p[1]); });
  if (pts.length < 2) return { name: name, cls: 'INCONCLUSIVE', note: 'fewer than 2 points', pts: pts };
  var lx = pts.map(function (p) { return Math.log10(p[0]); }), ly = pts.map(function (p) { return Math.log10(Math.max(p[1], 1e-9)); }), nn = pts.length;
  var mx = lx.reduce(function (a, b) { return a + b; }, 0) / nn, my = ly.reduce(function (a, b) { return a + b; }, 0) / nn, sxy = 0, sxx = 0, syy = 0; for (var i = 0; i < nn; i++) { sxy += (lx[i] - mx) * (ly[i] - my); sxx += (lx[i] - mx) * (lx[i] - mx); syy += (ly[i] - my) * (ly[i] - my); }
  var slope = sxx ? sxy / sxx : 0, r2log = syy ? (sxy * sxy) / (sxx * syy) : 1;
  var X = pts.map(function (p) { return p[0]; }), Y = pts.map(function (p) { return p[1]; }), mX = X.reduce(function (a, b) { return a + b; }, 0) / nn, mY = Y.reduce(function (a, b) { return a + b; }, 0) / nn, a2 = 0, b2 = 0, c2 = 0;
  for (i = 0; i < nn; i++) { a2 += (X[i] - mX) * (Y[i] - mY); b2 += (X[i] - mX) * (X[i] - mX); c2 += (Y[i] - mY) * (Y[i] - mY); } var r2lin = b2 && c2 ? (a2 * a2) / (b2 * c2) : 1;
  var cls = unit ? (slope < 0.15 ? 'flat' : 'per-unit-grows(total~N^' + (1 + slope).toFixed(2) + ')') : (slope < 0.15 ? 'flat' : slope <= 1.15 ? 'linear' : 'super-linear'); return { name: name, cls: cls, slope: slope, r2log: r2log, r2lin: r2lin, pts: pts }; }
function fitLine(f) { return '§STAR-FIT ' + f.name + ' class=' + f.cls + (f.slope != null ? ' loglog_slope=' + f.slope.toFixed(3) + ' R2_loglog=' + f.r2log.toFixed(4) + ' R2_linear=' + f.r2lin.toFixed(4) : ' (' + f.note + ')') + ' points=' + f.pts.length + ' [' + f.pts.map(function (p) { return p[0] + ':' + (Math.abs(p[1]) >= 100 ? Math.round(p[1]) : +Number(p[1]).toFixed(3)); }).join(' ') + ']'; }

function readPoints(files) { var pts = [];
  files.forEach(function (f) { var lines = fs.readFileSync(f, 'utf8').split('\n'); lines.forEach(function (l) { var m = /^§STAR-POINT (\{.*\})$/.exec(l); if (m) { try { var p = JSON.parse(m[1]); p._file = path.basename(f);
      if (p.kind === 'engine' && !p.sample) {                       // a point that stopped inside its time box: the per-device lines the run already printed are the evidence (nothing is re-derived)
        var sm = {}, jl = function (re) { var o = []; lines.forEach(function (x) { var mm = re.exec(x); if (mm) { try { o.push([mm[1], JSON.parse(mm[2])]); } catch (e) {} } }); return o; };
        jl(/^§STAR-EDGE-V1 (\S+) (\{.*\})$/).forEach(function (x) { sm[x[0]] = { key: x[0], role: x[0][0] === 's' ? 'station' : 'borrower', v1: x[1] }; }); jl(/^§STAR-EDGE-V2 (\S+) (\{.*\})$/).forEach(function (x) { if (sm[x[0]]) sm[x[0]].v2 = x[1]; });
        p.sample = Object.keys(sm).map(function (k2) { return sm[k2]; }); p.salvaged = true;
        if (!p.hq_visit) { var hv = jl(/^(§STAR-HQ-VISIT) (\{.*\})$/)[0]; if (hv) p.hq_visit = hv[1]; } if (!p.hq_replies) { var hrp = jl(/^(§STAR-HQ-REPLIES) (\{.*\})$/)[0]; if (hrp) p.hq_replies = hrp[1]; } if (!p.relay) { var rl = jl(/^(§STAR-RELAY) (\{.*\})$/)[0]; if (rl) p.relay = rl[1]; } }
      pts.push(p); } catch (e) {} } }); });   files.forEach(function (f) { var lines = fs.readFileSync(f, 'utf8').split('\n'); if (lines.some(function (l) { return /^§STAR-POINT /.test(l); })) return; var hd = /^§STAR-HEADER .* mode=hq N=(\d+) M=(\d+) K=(\d+)/.exec(lines[0] || ''); if (!hd) return;   // an HQ run that was stopped before it could print its point: the lines it printed are the evidence
    var jl = function (re) { var o = []; lines.forEach(function (x) { var mm = re.exec(x); if (mm) { try { o.push(JSON.parse(mm[1])); } catch (e) {} } }); return o; }, setup = lines.filter(function (x) { return /^§STAR-HQ-SETUP/.test(x); })[0] || '';
    var P = { kind: 'hq', n: Number(hd[1]), m: Number(hd[2]), k: Number(hd[3]), variant: /ctx_cache=true/.test(setup) ? 'cached' : 'shipped', status: 'STOPPED', reason: 'run stopped before its point line (see the log)', _file: path.basename(f), rounds: jl(/^§STAR-HQ-IMPORT (\{.*\})$/), payment_rounds: jl(/^§STAR-HQ-PAYMENT (\{.*\})$/) }, tk = P.rounds.reduce(function (z, x) { return z + x.imported; }, 0);
    P.tickets_imported = tk; if (tk) { P.import_ms_per_ticket = P.rounds.reduce(function (z, x) { return z + x.ms; }, 0) / tk; P.import_ms_per_ticket_ex_ctx = P.rounds.reduce(function (z, x) { return z + x.ms - x.login_ctx_ms; }, 0) / tk; P.import_ms_per_ticket_first = P.rounds[0].ms_per_ticket_ex_ctx; P.import_ms_per_ticket_late = P.rounds[P.rounds.length - 1].ms_per_ticket_ex_ctx; }
    if (P.payment_rounds.length) { P.slips_imported = P.payment_rounds.reduce(function (z, x) { return z + x.receipts_made; }, 0); P.payment_ms_per_slip = P.payment_rounds.reduce(function (z, x) { return z + x.ms; }, 0) / P.slips_imported; }
    var cm = /^§STAR-HQ-COMPLETE .*ms=(\[.*\])/.exec(lines.filter(function (x) { return /^§STAR-HQ-COMPLETE /.test(x); })[0] || ''); if (cm) { var ca = JSON.parse(cm[1]); P.complete_invoice_ms = ca.reduce(function (a, b) { return a + b; }, 0) / ca.length; }
    var rl = lines.filter(function (x) { return /^§STAR-HQ-REPLENISH /.test(x); })[0]; if (rl) P.replenish_ms = Number(/ ms=(\d+)$/.exec(rl)[1]); var ac = lines.filter(function (x) { return /^§STAR-HQ-ACCT \{/.test(x); })[0]; if (ac) P.acct_ms = Number(/ ms=(\d+)$/.exec(ac)[1]);
    pts.push(P); });
  return pts; }
function fitMain(files) {
  var pts = readPoints(files), eng = pts.filter(function (p) { return p.kind === 'engine'; }).sort(function (a, b) { return a.n - b.n; }), hq = pts.filter(function (p) { return p.kind === 'hq'; }).sort(function (a, b) { return a.n - b.n; }), hqShip = []; hq = hq.filter(function (p) { return p.variant === 'shipped'; });   // agent T: the memoised 'cached' variant is gone; every hq point is now the product as shipped
  out('§STAR-FITHEADER engine_points=' + eng.map(function (p) { return p.n + ':' + p.status; }).join(',') + ' hq_points=' + hq.map(function (p) { return p.n + ':' + p.status; }).join(','));
  var okE = eng.filter(function (p) { return p.status === 'PASS-RUN' || (p.salvaged && p.sample.length); }), xs = okE.map(function (p) { return p.n; });
  function pick(fn) { return okE.map(function (p) { try { return fn(p); } catch (e) { return null; } }); }
  var stn = function (p, v) { return p.sample.filter(function (z) { return z.role === 'station'; }).map(function (z) { return z[v]; }); }, brw = function (p, v) { return p.sample.filter(function (z) { return z.role === 'borrower'; }).map(function (z) { return z[v]; }); };
  var avg = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
  var rows = [
    ['edge.station.accepted_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.accepted; })); })], ['edge.station.refused_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.refused; })); })],
    ['edge.station.placed_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.placed; })); })], ['edge.station.db_bytes', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.db_bytes; })); })],
    ['edge.borrower.accepted_v2', pick(function (p) { return avg(brw(p, 'v2').map(function (v) { return v.accepted; })); })], ['edge.borrower.refused_v2', pick(function (p) { return avg(brw(p, 'v2').map(function (v) { return v.refused; })); })],
    ['edge.station.bytes_down_v1', pick(function (p) { return avg(stn(p, 'v1').map(function (v) { return v.bytes_down; })); })], ['edge.station.bytes_down_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.bytes_down; })); })],
    ['edge.station.objs_down_v1', pick(function (p) { return avg(stn(p, 'v1').map(function (v) { return v.objs_down; })); })], ['edge.station.listed_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.listed; })); })],
    ['edge.station.visit_ms_v1', pick(function (p) { return avg(stn(p, 'v1').map(function (v) { return v.visit_ms; })); })], ['edge.station.visit_ms_v2', pick(function (p) { return avg(stn(p, 'v2').map(function (v) { return v.visit_ms; })); })],
    ['edge.borrower.bytes_down_v2', pick(function (p) { return avg(brw(p, 'v2').map(function (v) { return v.bytes_down; })); })], ['edge.borrower.db_bytes', pick(function (p) { return avg(brw(p, 'v2').map(function (v) { return v.db_bytes; })); })],
    ['relay.objects', pick(function (p) { return p.relay.objects; })], ['relay.bytes', pick(function (p) { return p.relay.bytes; })], ['relay.heads_bytes', pick(function (p) { return p.relay.headBytes; })], ['relay.bundles_bytes', pick(function (p) { return p.relay.bundleBytes; })],
    ['hq.fold_ms', pick(function (p) { return p.hq_visit.fold_ms; })], ['hq.sync_ms', pick(function (p) { return p.hq_visit.sync_ms; })], ['hq.db_bytes', pick(function (p) { return p.hq_visit.db_bytes; })], ['hq.replies_ms', pick(function (p) { return p.hq_replies.author_ms; })],
    ['hq.enrol_ms_per_device', pick(function (p) { return p.phases.enrol_ms / (p.n + p.m); }), 1]];
  out('§STAR-FITNOTE classes are from the log-log slope of the metric against N (flat < 0.15, linear 0.15..1.15, super-linear > 1.15; per-unit metrics are flat or per-unit-grows); R2 is trivially 1 with 2 points - the points= field says how many there are.');
  var F = {}; rows.forEach(function (r) { F[r[0]] = fitRow(r[0], xs, r[1], r[2]); out(fitLine(F[r[0]])); });
  // model layer fits
  var okH = hq.filter(function (p) { return p.status === 'PASS-RUN' || p.status === 'PARTIAL' || (p.status === 'STOPPED' && p.tickets_imported); }), hx = okH.map(function (p) { return p.n; });
  var hrows = [['hq.import_ms_per_ticket', function (p) { return p.import_ms_per_ticket_ex_ctx; }], ['hq.import_ms_per_ticket_marginal', function (p) { return p.import_ms_per_ticket_late; }], ['hq.payment_ms_per_slip', function (p) { return p.payment_ms_per_slip; }], ['hq.replenish_ms', function (p) { return p.replenish_ms; }], ['hq.acct_ms', function (p) { return p.acct_ms; }], ['hq.acct_ms_per_doc', function (p) { return p.acct_ms_per_doc; }], ['hq.heap_mb', function (p) { return p.mem && p.mem.heap_mb; }], ['hq.model_db_bytes', function (p) { return p.model_db_bytes; }]];
  hrows.forEach(function (r) { F[r[0]] = fitRow(r[0], hx, okH.map(function (p) { try { return r[1](p); } catch (e) { return null; } }), /ms_per|per_doc/.test(r[0])); out(fitLine(F[r[0]])); });
  // verdict per arm
  var V = [];
  function arm(id, status, why) { V.push([id, status]); out('§STAR-ARM ' + id + ' ' + status + ' — ' + why); }
  if (okE.length < 2) { ['E1', 'E2', 'H1', 'H2', 'CONTROL', 'MUT-SCOPE', 'MUT-COUNTER'].forEach(function (a) { arm(a, 'INCONCLUSIVE', 'fewer than 2 engine points reached'); }); }
  else {
    var full = okE.filter(function (p) { return !p.salvaged && p.status === 'PASS-RUN'; }), part = okE.filter(function (p) { return !(full.indexOf(p) >= 0); });
    var v1acc = okE.map(function (p) { return [p.n, avg(stn(p, 'v1').map(function (v) { return v.accepted; }))]; }), v2acc = F['edge.station.accepted_v2'].pts, v1ref = okE.map(function (p) { return [p.n, avg(stn(p, 'v1').map(function (v) { return v.refused; }))]; });
    var e1 = v1acc.every(function (v) { return v[1] === v1acc[0][1]; }) && v2acc.every(function (v) { return v[1] === v2acc[0][1]; });
    arm('E1', e1 ? 'PASS' : 'FAIL', 'station accepted ops per N, Visit #1: ' + v1acc.map(function (v) { return v[0] + '=' + v[1]; }).join(' ') + '; Visit #2 (head office answer included): ' + v2acc.map(function (v) { return v[0] + '=' + v[1]; }).join(' ') + (part.length ? ' [N=' + part.map(function (p) { return p.n; }).join(',') + ' has Visit #1 only: ' + (part[0].reason || part[0].status) + ']' : '') + ' (tolerance 0 ops; non-vacuous: refused Visit #1 per N ' + v1ref.map(function (v) { return v[0] + '=' + v[1]; }).join(' ') + ')');
    var e2 = F['edge.station.bytes_down_v1']; arm('E2', 'MEASURED', 'delivered bytes per station Visit #1 are ' + e2.cls + ' in N (slope ' + e2.slope.toFixed(3) + '): ' + e2.pts.map(function (p) { return p[0] + '=' + Math.round(p[1]); }).join(' ') + ' -> F1 trigger ' + (e2.cls === 'flat' ? 'NOT fired' : 'FIRED'));
    var ctl = full.length > 0 && full.every(function (p) { return p.control && p.control.moved === 1; }); arm('CONTROL', ctl ? 'PASS' : 'INCONCLUSIVE', 'planted extra op moves the accepted counter by ' + full.map(function (p) { return p.n + ':+' + (p.control && p.control.moved); }).join(' ') + (part.length ? ' (not run at N=' + part.map(function (p) { return p.n; }).join(',') + ': time box)' : ''));
    var mut = full.length > 0 && full.every(function (p) { return p.mutant_scope && p.mutant_scope.accepted_mutant > p.mutant_scope.accepted_real; }); arm('MUT-SCOPE', mut ? 'KILLED' : 'INCONCLUSIVE', 'scope off: accepted(mutant) vs accepted(real) ' + full.map(function (p) { return p.n + ':' + (p.mutant_scope && p.mutant_scope.accepted_mutant) + '>' + (p.mutant_scope && p.mutant_scope.accepted_real); }).join(' ') + (mut ? ' (E1 would FAIL under the mutant)' : ''));
    var idOk = full.length > 0 && full.every(function (p) { return p.sample.every(function (z) { return z.v2.placed === z.v2.accepted + z.v2.refused; }); }), idMut = full.length > 0 && full.every(function (p) { return p.sample.every(function (z) { return z.v2.placed !== z.v2.accepted + 0; }); });
    arm('MUT-COUNTER', idOk && idMut ? 'KILLED' : 'INCONCLUSIVE', 'identity placed = accepted + refused holds on every sampled edge (' + idOk + '); with refused ignored it breaks on every one of them (' + idMut + ')');
  }
  if (okH.length < 2) { arm('H1', 'INCONCLUSIVE', 'fewer than 2 model-layer points reached'); arm('H2', 'INCONCLUSIVE', 'fewer than 2 model-layer points reached'); }
  else { var h1 = F['hq.import_ms_per_ticket']; arm('H1', h1.cls === 'flat' ? 'PASS' : 'FAIL', 'Import POS Sales ms per ticket is ' + h1.cls + ' in N (slope ' + h1.slope.toFixed(3) + '): ' + h1.pts.map(function (p) { return p[0] + '=' + Math.round(p[1]); }).join(' '));
    arm('H2', 'MEASURED', 'head-office day totals are in the point lines; budget = ' + HQ_BUDGET_NOTE); }
  // H2: the head-office day, component by component (engine from the engine point, model layer from the cached model-layer point of the same N)
  eng.forEach(function (e) { var h = hq.find(function (z) { return z.n === e.n; }), T = e.n * e.k; if (e.status !== 'PASS-RUN' || !h) { out('§STAR-H2 n=' + e.n + ' INCONCLUSIVE engine=' + e.status + ' model_layer=' + (h ? h.status : 'not run')); return; }
    var partial = h.status !== 'PASS-RUN' || h.tickets_imported < T, c = { fold_s: e.hq_visit.fold_ms / 1000, replies_s: e.hq_replies.author_ms / 1000, import_s: h.rounds.reduce(function (z, x) { return z + x.ms; }, 0) / 1000, payment_s: (h.payment_rounds || []).reduce(function (z, x) { return z + x.ms; }, 0) / 1000, replenish_s_one_branch: h.replenish_ms / 1000, acct_s: h.acct_ms / 1000 };
    var tot = c.fold_s + c.replies_s + c.import_s + c.payment_s + c.replenish_s_one_branch + c.acct_s, heap = Math.max(e.mem.heap_mb, h.mem.heap_mb);
    out('§STAR-H2 n=' + e.n + ' tickets=' + h.tickets_imported + '/' + T + ' slips=' + h.slips_imported + '/' + e.m + (partial ? ' PARTIAL' : '') + ' ' + Object.keys(c).map(function (x) { return x + '=' + c[x].toFixed(1); }).join(' ') + ' total_s=' + tot.toFixed(1) + ' heap_mb_max=' + heap + ' db_bytes_engine=' + e.hq_visit.db_bytes + ' db_bytes_model=' + h.model_db_bytes + ' vs budget ' + (tot <= 3600 && heap <= 2000 ? 'WITHIN' : 'OVER') + ' (' + HQ_BUDGET_NOTE + ')'); });
  if (hqShip.length) eng.forEach(function (e) { var h = hqShip[0], T = e.n * e.k; out('§STAR-H2-PROJECTION n=' + e.n + ' as-shipped Import POS Sales for ' + T + ' tickets = ' + Math.round(h.import_ms_per_ticket * T / 1000) + ' s (shipped ms/ticket measured at N=' + h.n + ' x tickets; a LOWER-BOUND projection, NOT measured: the cached variant shows the per-ticket cost still grows with the day\'s DB size)'); });
  hqShip.forEach(function (h) { var T = h.n * h.k; out('§STAR-SHIPPED n=' + h.n + ' status=' + h.status + ' tickets=' + h.tickets_imported + ' import_ms_per_ticket=' + (h.import_ms_per_ticket && Math.round(h.import_ms_per_ticket)) + ' login_ctx_calls_per_ticket_round1=' + (h.rounds[0] && (h.rounds[0].login_ctx_calls / h.rounds[0].imported).toFixed(1)) + ' login_ctx_share_of_import=' + (h.login_ctx && h.login_ctx.share_of_import != null ? (100 * h.login_ctx.share_of_import).toFixed(1) + '%' : 'n/a') + ' payment_ms_per_slip=' + (h.payment_ms_per_slip && Math.round(h.payment_ms_per_slip)) + ' replenish_ms=' + Math.round(h.replenish_ms) + ' acct_ms=' + Math.round(h.acct_ms) + ' PROJECTION_day_import_s_for_' + T + '_tickets=' + (h.import_ms_per_ticket ? Math.round(h.import_ms_per_ticket * T / 1000) : 'n/a') + ' (a projection from the sample, NOT measured)'); });
  var inc = V.filter(function (v) { return v[1] === 'INCONCLUSIVE'; }).length, fail = V.filter(function (v) { return v[1] === 'FAIL' || v[1] === 'SURVIVED'; }).length;
  out('§STAR-VERDICT ' + (fail ? 'FAIL' : inc || eng.some(function (p) { return p.status !== 'PASS-RUN'; }) || hq.some(function (p) { return p.status !== 'PASS-RUN'; }) ? 'INCONCLUSIVE' : 'PASS') + ' arms=' + V.map(function (v) { return v[0] + ':' + v[1]; }).join(' ') + ' engine_points=' + eng.map(function (p) { return p.n + ':' + p.status; }).join(',') + ' hq_points=' + hq.map(function (p) { return p.n + ':' + p.status; }).join(','));
}

function tablesMain(files) {
  var pts = readPoints(files), eng = pts.filter(function (p) { return p.kind === 'engine'; }).sort(function (a, b) { return a.n - b.n; }), hqs = pts.filter(function (p) { return p.kind === 'hq'; });
  var f0 = function (x, d) { return x == null || !isFinite(x) ? 'n/a' : (d ? Number(x).toFixed(d) : String(Math.round(x))); }, avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; };
  var cols = eng.map(function (p) { return 'N=M=' + p.n + (p.status === 'PASS-RUN' ? '' : ' (' + p.status + ')'); });
  function row(label, fn) { out('| ' + label + ' | ' + eng.map(function (p) { try { return p.status === 'PASS-RUN' || p.status === 'INCONCLUSIVE' ? f0(fn(p)) : 'n/a'; } catch (e) { return 'n/a'; } }).join(' | ') + ' |'); }
  var st = function (p, v, k2) { return avg(p.sample.filter(function (z) { return z.role === 'station' && z[v]; }).map(function (z) { return z[v][k2]; })); }, bw = function (p, v, k2) { return avg(p.sample.filter(function (z) { return z.role === 'borrower' && z[v]; }).map(function (z) { return z[v][k2]; })); };
  out('| metric | ' + cols.join(' | ') + ' |'); out('|---|' + cols.map(function () { return '---'; }).join('|') + '|');
  row('EDGE station: bytes downloaded, Visit #1 (catch-up)', function (p) { return st(p, 'v1', 'bytes_down'); }); row('EDGE station: bytes downloaded, Visit #2 (steady)', function (p) { return st(p, 'v2', 'bytes_down'); });
  row('EDGE station: objects fetched, Visit #1', function (p) { return st(p, 'v1', 'objs_down'); }); row('EDGE station: objects fetched, Visit #2', function (p) { return st(p, 'v2', 'objs_down'); });
  row('EDGE station: ops delivered (placed)', function (p) { return st(p, 'v2', 'placed'); }); row('EDGE station: ops accepted', function (p) { return st(p, 'v2', 'accepted'); }); row('EDGE station: ops refused', function (p) { return st(p, 'v2', 'refused'); });
  row('EDGE station: comm-log DB bytes', function (p) { return st(p, 'v2', 'db_bytes'); }); row('EDGE station: Visit ms, Visit #1', function (p) { return st(p, 'v1', 'visit_ms'); }); row('EDGE station: Visit ms, Visit #2', function (p) { return st(p, 'v2', 'visit_ms'); });
  row('EDGE borrower: bytes downloaded V1', function (p) { return bw(p, 'v1', 'bytes_down'); }); row('EDGE borrower: bytes downloaded V2', function (p) { return bw(p, 'v2', 'bytes_down'); });
  row('EDGE borrower: ops delivered (placed)', function (p) { return bw(p, 'v2', 'placed'); }); row('EDGE borrower: accepted', function (p) { return bw(p, 'v2', 'accepted'); }); row('EDGE borrower: refused', function (p) { return bw(p, 'v2', 'refused'); }); row('EDGE borrower: comm-log DB bytes', function (p) { return bw(p, 'v2', 'db_bytes'); });
  row('RELAY objects stored (day)', function (p) { return p.relay.objects; }); row('RELAY bytes stored (day)', function (p) { return p.relay.bytes; }); row('RELAY of which heads (objects)', function (p) { return p.relay.heads; }); row('RELAY of which heads (bytes)', function (p) { return p.relay.headBytes; }); row('RELAY objects listed per steady Visit', function (p) { return st(p, 'v2', 'listed'); });
  row('HQ engine: fold ms of the day inbound (sync+project)', function (p) { return p.hq_visit.fold_ms; }); row('HQ engine: ops received', function (p) { return p.hq_visit.foldable; }); row('HQ engine: replies authored ms (' + 'N movements + 2M loan ops)', function (p) { return p.hq_replies.author_ms; });
  row('HQ engine: enrol ms per device (roster growth)', function (p) { return p.phases.enrol_ms / (p.n + p.m); }); row('HQ engine: comm-log DB bytes', function (p) { return p.hq_visit.db_bytes; }); row('process heap MB at end (engine parent)', function (p) { return p.mem && p.mem.heap_mb; }); row('wall seconds of the engine point', function (p) { return p.wall_ms / 1000; });
  row('CONTROL planted op: counter moved by', function (p) { return p.control && p.control.moved; }); row('MUTANT scope-off: accepted (mutant) vs real 17', function (p) { return p.mutant_scope && p.mutant_scope.accepted_mutant; });
  hqs.sort(function (a, b) { return a.n - b.n || String(a.variant).localeCompare(b.variant); });
  out(''); out('| model layer (head office) | ' + hqs.map(function (h) { return h.variant + ' N=' + h.n + (h.status === 'PASS-RUN' ? '' : ' (' + h.status + ')'); }).join(' | ') + ' |'); out('|---|' + hqs.map(function () { return '---'; }).join('|') + '|');
  function hr(label, fn) { out('| ' + label + ' | ' + hqs.map(function (h) { try { return f0(fn(h)); } catch (e) { return 'n/a'; } }).join(' | ') + ' |'); }
  hr('tickets imported', function (h) { return h.tickets_imported; }); hr('Import POS Sales ms per ticket (all in, incl. login-context builds)', function (h) { return h.import_ms_per_ticket; }); hr('Import POS Sales ms per ticket (ex login-context build)', function (h) { return h.import_ms_per_ticket_ex_ctx; });
  hr('ms per ticket, first round (ex ctx)', function (h) { return h.import_ms_per_ticket_first; }); hr('ms per ticket, last round (ex ctx)', function (h) { return h.import_ms_per_ticket_late; }); hr('login-context share of Import POS Sales ms (%)', function (h) { return h.login_ctx && h.login_ctx.share_of_import != null ? 100 * h.login_ctx.share_of_import : null; });
  hr('deposit ms per ticket (I_Order+I_Payment, ML.save)', function (h) { return h.deposit_ms_per_ticket; }); hr('invoice copy+Complete ms (micro)', function (h) { return h.complete_invoice_ms; });
  hr('slips imported (Import Payment 343)', function (h) { return h.slips_imported; }); hr('Import Payment ms per slip', function (h) { return h.payment_ms_per_slip; }); hr('Replenish Report ms (ONE branch, MMM)', function (h) { return h.replenish_ms; });
  hr('Tenant Accounting Processor ms', function (h) { return h.acct_ms; }); hr('  documents posted', function (h) { return h.acct_docs; }); hr('  ms per document', function (h) { return h.acct_ms_per_doc; }); hr('  Fact_Acct rows added', function (h) { return h.acct && h.acct.fact_rows_added; });
  hr('model-layer ms measured (imports+payments+replenish+acct)', function (h) { return h.day_total_ms_measured; }); hr('heap MB at end', function (h) { return h.mem && h.mem.heap_mb; }); hr('model DB bytes', function (h) { return h.model_db_bytes; }); hr('wall seconds', function (h) { return h.wall_ms / 1000; });
}
var HQ_BUDGET_NOTE = 'STATED CHOICE of the measurer, not a source value: heap <= 2000 MB (docs/BrowserScaleBenchmark.md: one tab peaks 3.4-3.8 GB at 22 M vertices), day <= 3600 s';

module.exports = { fitRow: fitRow };
if (IS_WORKER) { workerMain(); }
else if (MODE === 'engine') { (async function () { header(); var P = await enginePoint({ n: N, m: M, k: K, workers: W }); P.kind = 'engine'; out('§STAR-POINT ' + JSON.stringify(P)); out('§STAR-DONE engine N=' + N + ' M=' + M + ' status=' + P.status + (P.reason ? ' reason=' + P.reason : '') + ' wall_s=' + (P.wall_ms / 1000).toFixed(0)); process.exit(P.status === 'PASS-RUN' ? 0 : 1); })(); }
else if (MODE === 'hq') { (async function () { header(); var P = await hqPoint({ n: N, m: M, k: K, }); out('§STAR-POINT ' + JSON.stringify(P)); out('§STAR-DONE hq N=' + N + ' M=' + M + ' variant=' + P.variant + ' status=' + P.status + (P.reason ? ' reason=' + P.reason : '') + ' wall_s=' + (P.wall_ms / 1000).toFixed(0)); process.exit(P.status === 'PASS-RUN' ? 0 : 1); })(); }
else if (MODE === 'tables') { tablesMain(process.argv.slice(4).filter(function (a) { return !/^--/.test(a); })); }
else if (MODE === 'fit') { fitMain(process.argv.slice(4).filter(function (a) { return !/^--/.test(a); })); }
else { out('§STAR-VERDICT INCONCLUSIVE — unknown mode ' + MODE); process.exit(2); }
