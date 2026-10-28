#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-POS-PLAN, prompts/TEAMWORK_FRAMEWORK.md §38.12/§38.14 + §38.15 (G-6: role-scoped delivery, the thin-pipe fix). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: (1) a till received the processor's WHOLE Complete group (103 ops: order, shipment, invoice, postings) because the one plan reader knows only "share" and every op sealed for
 * the space is projected on every device (FL-8 e: results are never broadcast beyond the declared flows); (2) two borrowers hold the SAME role, so a role-scoped plan alone would still give borrower 2 the
 * records of borrower 1 - delivery must be per RECORD (§38.15 spec A, below).
 *
 * SPEC (written BEFORE the code, §38.15):
 *  A. BORROWER SCOPE IS PER RECORD. A POS-plan row is {table, dir UP|DOWN, role (the EDGE role), carries, by?}; the plan names ONE hub (the processor) = the role of the plan's own `docaction` rows (FL-8 E1).
 *     UP: the edge role authors, the hub receives. DOWN: the hub authors, the edge role receives. `by` (DOWN only) is a FK path ending in an entity column - ["C_BPartner_ID"] on an invoice,
 *     ["C_Invoice_ID","C_BPartner_ID"] on an instalment (follow the FK to the parent record, take ITS C_BPartner_ID). The entity's _uu (a seeded record's _uu from the pinned base, FL-5; a team-made record's
 *     uu) is the ADDRESS. The device<->record BINDING is data already in the signed roster: the admin signs a PERSON whose person_uu IS that entity's _uu (a borrower's C_BPartner_UU, a till's AD_Org_UU) and
 *     ENROLLs the device onto it (TeamSync.approve(rq, role, entityUu)); a second phone of the same borrower is enrolled onto the existing person. No new op type, no server check, the relay stays dumb:
 *     every device folds the same roster, so every device reaches the same verdict. A DOWN op is taken in only when role matches AND the address equals my person_uu; an unresolvable address is refused
 *     (fail closed). The SENDER applies the same test to its own roster: a record whose entity has no bound person is never sent (`no-addressee`) - so a cash-sale invoice never fattens the pipe.
 *     Generic: no table name in code - the reader (common/comm/team_scope.js) and the adapter (erp/team_sync.js) read `by`/`ship`/`hub` from the plan.
 *  B. THE 'author' EXECUTOR IS RETIRED IN THE COMPILER (witness_ups_docaction U4): executors are roles; the office/mesh plan publishes NO executor map (= legacy: whoever's login role has Document Action Access).
 *
 *   §P0 OFFICE UNCHANGED  §P1 DIRECTION PER ROLE  §P2 CARRIES BINDS OUTBOUND (+ the 103-op group)  §P3 NOT-ADDRESSED INBOUND  §P4 GENESIS PLAN  §P5 EXECUTOR MAP  §P6 BORROWER PER RECORD  §P7 SIGNED POS PLAN  §MUTANTS
 * Real: team_scope.js, team_sync.js (vm), comm_envelope.js, the generated plans, the AD seed; engine build/comm (mirror of common/comm); compiler build/scriptor.
 * Run: node scripts/witness_pos_plan.js <bim-ootb dir> > build/scriptor/witness_pos_plan.log 2>&1       env: PP_BC=<bim-compiler root of the engine/compiler (RED runs)> PP_NOMUT=1
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm'), cp = require('child_process'), nodeCrypto = require('crypto'), webcrypto = nodeCrypto.webcrypto;
var BC = process.env.PP_BC || path.join(__dirname, '..'), OOTB = process.argv[2];
if (!OOTB) { console.log('§PP_VERDICT INCONCLUSIVE — no bim-ootb dir given (node scripts/witness_pos_plan.js <dir>)'); process.exit(2); }
var SIGN = require(path.join(BC, 'build', 'scriptor', 'sign_plan.js')), initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var OFFICE_BASE = '3e779487';                                                  // the commit this lane was cut from: its team_scope.js / team_plan.js are the P0 reference
var HQ = 102, TILL = 200001, BORR = 50004, uuid = function () { return nodeCrypto.randomUUID(); };
var judged = 0, fails = 0;
function say(ok, l, d) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + l + (d ? ' — ' + d : '')); }
function rd(f) { return fs.readFileSync(path.join(OOTB, f), 'utf8'); }
function gitShow(f) { var r = cp.spawnSync('git', ['-C', OOTB, 'show', OFFICE_BASE + ':' + f], { encoding: 'utf8', maxBuffer: 1 << 28 }); return r.status === 0 ? r.stdout : null; }
function sha(s) { return nodeCrypto.createHash('sha256').update(s).digest('hex'); }
function wrapPlan(name, plan) { return '(function (g) { g.' + name + ' = ' + JSON.stringify(plan) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n'; }
function loadEngine(dir) { ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  return { ENV: require(path.join(dir, 'comm_envelope.js')), STORE: require(path.join(dir, 'comm_store.js')), ROS: require(path.join(dir, 'comm_roster.js')), PIPE: require(path.join(dir, 'comm_pipe.js')) }; }

// run the ERP adapter (the REAL team_sync.js) in a vm: scripts in the loader's order. -> { logs, g, api }
async function boot(src, o) {
  o = o || {}; var logs = [], g = {};
  g.window = g; g.globalThis = g; g.TextEncoder = TextEncoder; g.crypto = webcrypto;
  g.console = { log: function (m) { logs.push(String(m)); }, warn: function () {}, error: function () {} };
  g.location = { search: o.search || '?team=1', href: 'http://localhost/x' + (o.search || '?team=1') }; g.localStorage = { getItem: function () { return null; }, setItem: function () {} };
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

async function arms(src, quiet) {
  var red = [], H = quiet ? function () {} : console.log;
  function A(n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }
  function guard(n, population, what) { if (!(population > 0)) { red.push(n + '!VACUOUS'); if (!quiet) say(false, '§PP_VACUOUS ' + n + ' nothing was judged: ' + what); return false; } return true; }
  var E = loadEngine(src.engine || process.env.PP_ENGINE || path.join(BC, 'build', 'comm')), STORE = E.STORE, ROS = E.ROS, SQL = await initSqlJs();
  var K1 = await SIGN.keygen(), pub1 = { kty: 'EC', crv: 'P-256', x: K1.publicJwk.x, y: K1.publicJwk.y };
  var posFile = (function () { try { return process.env.PP_POSPLAN ? fs.readFileSync(process.env.PP_POSPLAN, 'utf8') : rd('erp/team_plan_pos.js'); } catch (e) { return null; } })(), officeFile = rd('erp/team_plan.js');
  var POSPLAN = posFile ? SIGN.planOf(posFile) : null, OFFPLAN = SIGN.planOf(officeFile);
  var DB = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp', 'ad_seed.db')));
  var q = function (sql) { var st = DB.prepare(sql), o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; };
  var allow = function () { return { allowed: true }; };

  // ── §P0 the office plan, byte for byte ─────────────────────────────────────────────────────────────────────────
  H('§P0 OFFICE UNCHANGED (the immutable additive rule: the shipped office plan and its reader answers are the base\'s)');
  var baseScope = gitShow('common/comm/team_scope.js'), basePlan = gitShow('erp/team_plan.js');
  if (!baseScope || !basePlan) A('P0', false, 'the reference files could not be read from git ' + OFFICE_BASE + ' in ' + OOTB, 'INCONCLUSIVE');
  else {
    A('P0', sha(officeFile) === sha(basePlan), 'erp/team_plan.js (the office plan) is byte-identical to ' + OFFICE_BASE + ' (so its plan hash is unchanged)', sha(officeFile).slice(0, 12) + ' vs ' + sha(basePlan).slice(0, 12));
    var mk = function (scopeSrc) { var g = {}; g.window = g; g.globalThis = g; g.TextEncoder = TextEncoder; g.crypto = webcrypto; var c = vm.createContext(g); vm.runInContext(scopeSrc, c); vm.runInContext(officeFile, c); return g.TeamScope; };
    var OLD = mk(baseScope), NEW = mk(src.scope), names = {}; q('SELECT lower(tablename) AS t FROM ad_table').forEach(function (r) { names[r.t] = 1; }); OFFPLAN.flows.forEach(function (f) { names[f.table.toLowerCase()] = 1; });
    var diff = [], n = 0; Object.keys(names).forEach(function (t) { n++;
      var a = OLD.scopeOf(t), b = NEW.scopeOf(t), c1 = NEW.scopeOf(t, HQ), c2 = NEW.scopeOf(t, 'x'), fa = JSON.stringify(OLD.flow(t)), fb = JSON.stringify(NEW.flow(t));
      if (a !== b || a !== c1 || a !== c2 || fa !== fb) diff.push(t); });
    if (guard('P0', n, 'no table was compared')) A('P0', diff.length === 0 && n > 800, 'scopeOf / flow answers are identical for ALL ' + n + ' tables (1-arg, and with any role: an office plan has only space rows)', diff.length ? 'differ: ' + diff.slice(0, 5).join(',') : n + ' tables');
    try { A('P0', JSON.stringify(OLD.summary()) === JSON.stringify(NEW.summary()) && JSON.stringify(OLD.locals()) === JSON.stringify(NEW.locals()) && NEW.kind() === 'office', 'summary() and locals() identical; the default kind is "office"', JSON.stringify(NEW.summary())); } catch (e) { A('P0!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 90)); }
  }
  A('P0', !(OFFPLAN.flows || []).some(function (f) { return f.audience === 'hub'; }) && OFFPLAN.executors === undefined && OFFPLAN.hub === undefined, 'the office plan carries no hub row, no hub and NO executor map: the mesh = legacy (whoever\'s login role has Document Action Access may act)', 'flows=' + OFFPLAN.flows.length);
  if (!POSPLAN) { A('P1', false, 'erp/team_plan_pos.js is absent from ' + OOTB + ' — there is no POS plan to read', 'RED'); }

  // ── the POS plan is the compiler's output, not a hand edit ─────────────────────────────────────────────────────
  if (POSPLAN && !src.noRegen && !process.env.PP_POSPLAN) {
    var EM = require(path.join(BC, 'build', 'scriptor', 'emit_erp_plan.js')), adb = new Better(path.join(BC, 'build', 'erp', 'ad_full.db'), { readonly: true });
    var regen = EM.emitPos(adb, JSON.parse(fs.readFileSync(path.join(BC, 'build', 'scriptor', 'flows_pos.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(BC, 'build', 'scriptor', 'flows_erp.json'), 'utf8')), 'flows_pos.json');
    A('P0', regen.text === posFile, 'erp/team_plan_pos.js is exactly what build/scriptor/emit_erp_plan.js pos emits from flows_pos.json + flows_erp.json (generated, never hand-edited)', regen.hash.slice(0, 12));
    var refuse = function (mut) { try { var rows = JSON.parse(fs.readFileSync(path.join(BC, 'build', 'scriptor', 'flows_pos.json'), 'utf8')); mut(rows); EM.emitPos(adb, rows, [], 'x'); return 'COMPILED'; } catch (e) { return String(e.message); } };
    var rj = refuse(function (r) { r.pop(); }), r2 = refuse(function (r) { r.push({ name: 'D2', treatment: 'LOCAL', table: 'C_Invoice', docaction: { executor: 103, actions: ['CO'] } }); }), r3 = refuse(function (r) { r[4].by = ['C_BPartner_ID', 'x']; }), r4 = refuse(function (r) { r[0].by = ['C_Product_ID']; });
    A('P0', /no-hub/.test(rj) && /hub-ambiguous|dual/.test(r2) && /by-bad/.test(r3) && /by-bad/.test(r4), 'the emitter REFUSES a POS plan with no executor (no-hub), two executor roles (hub-ambiguous), or a malformed / UP `by` (by-bad)', [rj, r2, r3, r4].map(function (x) { return x.slice(0, 60); }).join(' | '));
  }

  // ── §P1 direction per role (the reader) ────────────────────────────────────────────────────────────────────────
  var rb = POSPLAN ? await boot(src, { plans: [officeFile, posFile] }) : null;
  if (rb) {
    H('§P1 DIRECTION PER ROLE');
    try {
    var T = rb.scope; if (T.setKind) T.setKind('pos');
    var rowsP1 = [['c_orderline', TILL, 'up'], ['m_movementline', TILL, 'receive'], ['i_order', TILL, 'up'], ['c_orderline', HQ, 'receive'], ['m_movementline', HQ, 'down'], ['i_order', HQ, 'receive'], ['c_invoice', HQ, 'down'], ['c_invoice', BORR, 'receive'],
                  ['c_payment', BORR, 'up'], ['c_payment', HQ, 'receive'], ['c_orderline', BORR, 'unplanned'], ['c_invoice', TILL, 'unplanned'], ['c_orderline', null, 'unplanned'], ['c_bpartner', TILL, 'unplanned'], ['ad_sequence', TILL, 'station-local']];
    if (guard('P1', rowsP1.length, 'no row judged')) rowsP1.forEach(function (x) { var got = T.scopeOf(x[0], x[1]); A('P1', got === x[2], (x[1] === null ? 'no role' : 'role ' + x[1]) + ' · ' + x[0] + ' = ' + x[2], 'got ' + got); });
    var co = [T.scopeOf('c_order', TILL), T.scopeOf('c_order', HQ)], nev = ['share', 'up', 'down'];
    A('P1', co.every(function (s) { return nev.indexOf(s) < 0; }), 'the order header never leaves either device (the processor\'s own order is a LOCAL row of the plan)', co.join('/'));
    A('P1', T.hub() === HQ && JSON.stringify(T.by('c_invoicepayschedule')) === '["C_Invoice_ID","C_BPartner_ID"]' && T.by('c_orderline') === null, 'hub() is the executor role of the plan\'s docaction row; by() gives the FK path of a per-record row and null for a role-scoped one', 'hub=' + T.hub());
    if (T.setKind) T.setKind('office'); A('P1', T.scopeOf('c_order', TILL) === 'share' && T.scopeOf('c_orderline', TILL) === 'share', 'the SAME page with kind "office" reads the office plan: c_order / c_orderline are "share" (the topology is the genesis\' choice, nothing else)', T.scopeOf('c_order'));
    } catch (e) { A('P1!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 90)); }
  }

  // ── spaces on the REAL engine ──────────────────────────────────────────────────────────────────────────────────
  var fanOut = null; try { fanOut = POSPLAN ? (await (async function () {
    var Fd = await STORE.newDevice(), PF = uuid(), sp = await STORE.newSpace('pos', Fd, PF, 'HQ', HQ, { planTrust: [pub1], plan: 'pos' }); Fd.person_uu = PF;
    var pipe = E.PIPE.memPipe('pp-' + uuid()), D = {}, order = [];
    var bps = q("SELECT c_bpartner_id AS id, c_bpartner_uu AS uu FROM c_bpartner WHERE ad_client_id=11 AND iscustomer='Y' AND c_bpartner_uu IS NOT NULL ORDER BY c_bpartner_id LIMIT 4");
    var signedOffice = wrapPlan('TEAM_PLAN', await SIGN.sign(OFFPLAN, K1.privateJwk, K1.publicJwk)), signedPos = wrapPlan('TEAM_PLAN_POS', await SIGN.sign(POSPLAN, K1.privateJwk, K1.publicJwk));
    async function dev(name, role, person, existing) {
      var d = existing || await STORE.newDevice(); d.person_uu = person; var S = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: allow, log: function () {} });
      var kdb = new SQL.Database(); kdb.run('CREATE TABLE kernel_ops(id INTEGER PRIMARY KEY, op_type TEXT, op_uuid TEXT, parameters TEXT, user_tag TEXT)');
      var ad = await boot(src, { plans: [signedOffice, signedPos], trust: [pub1], db: DB });
      D[name] = { name: name, role: role, person: person, dev: d, S: S, ad: ad, kdb: kdb, kid: d.kid }; order.push(name); return D[name]; }
    D.F = null; await dev('F', HQ, PF, Fd); await D.F.S.genesis(sp.params);
    async function enrol(name, role, person, bound) { var d = await dev(name, role, person); var L = await D.F.S.order();
      if (!L.roster.persons[person]) await D.F.S.addPerson({ person_uu: person, name: name, ad_role_id: role, comm_admin: false }); await D.F.S.enroll(d.dev.kid, d.dev.pubJwk, person, d.dev.dhPubJwk); return d; }
    await enrol('T1', TILL, uuid()); await enrol('T2', TILL, uuid()); await enrol('B1', BORR, bps[0].uu); await enrol('B1b', BORR, bps[0].uu); await enrol('B2', BORR, bps[1].uu); await enrol('Q', BORR, uuid());
    var syncAll = async function () { for (var r = 0; r < 3; r++) for (var n of order) await D[n].S.sync(pipe); };
    await syncAll();
    for (var n of order) await D[n].ad.api._attach(D[n].S, D[n].dev);
    return { D: D, order: order, sp: sp, bps: bps, syncAll: syncAll, pipe: pipe, signedPos: signedPos, signedOffice: signedOffice, dev: dev, enrol: enrol };
  })()) : null; } catch (e) { fanOut = null; A('P2!THREW', false, 'THREW building the spaces (reader/engine cannot host the POS plan): ' + String(e && e.message).slice(0, 110)); }

  // helpers that author THROUGH the adapter's translate (the path onCommit takes) and read back THROUGH its project (the path a Visit takes)
  async function send(d, op_type, table, fields, o) { o = o || {}; var u = o.uu || uuid(); var row = { op_type: op_type, op_uuid: u, gid: o.gid || null, timestamp: new Date().toISOString(), parameters: JSON.stringify(Object.assign({ table: table, fields: fields }, o.extra || {})) };
    var t = await d.ad.api._translate(row, d.kdb); if (!t.body) return { t: t, uu: u, hash: null };
    var a = await d.S.author({ target: t.target, body: t.body, refs: t.refs, intent: 'K2', ts: row.timestamp }); return { t: t, uu: u, hash: a.hash, env: a.env }; }
  async function view(d) { var out = await d.ad.api._project([]), last = d.ad.api._project.last || {}, team = out.filter(function (r) { return r.user_tag === 'team'; });
    return { rows: team, tables: team.map(function (r) { return JSON.parse(r.parameters).table; }), thin: last.thin, bytes: team.reduce(function (s, r) { return s + String(r.parameters).length; }, 0) }; }

  if (fanOut) {
    var D = fanOut.D, bps = fanOut.bps;
    // ── §P2 carries bind outbound; the 103-op group ──────────────────────────────────────────────────────────────
    H('§P2 CARRIES BINDS OUTBOUND (FL-1) + the processor\'s Complete group');
    try {
    var big = { m_product_id: 123, qtyentered: 2, c_uom_id: 100, description: 'a free-text note that must not travel', priceactual: 9.5, linenetamt: 19, c_order_id: 1, ad_client_id: 11, ad_org_id: 0 };
    var s1 = await send(D.T1, 'CRUD_CREATE', 'c_orderline', big);
    var fk = s1.t.body && s1.t.body.params && Object.keys(s1.t.body.params.fields || {}).sort();
    A('P2', JSON.stringify(fk) === JSON.stringify(['ad_client_id', 'ad_org_id', 'c_uom_id', 'm_product_id', 'qtyentered']), 'a station\'s C_OrderLine create leaves with EXACTLY the declared columns + the partition (description, priceactual, linenetamt, c_order_id stay on the device)', JSON.stringify(fk));
    var hdr = await send(D.T1, 'CRUD_CREATE', 'c_order', { documentno: 'T-1', ad_client_id: 11, ad_org_id: 0 });
    A('P2', !hdr.t.body && (hdr.t.quiet || hdr.t.local), 'the station\'s order header never leaves (its plan row is the processor\'s LOCAL)', JSON.stringify(hdr.t).slice(0, 90));
    var mv = await send(D.F, 'CRUD_CREATE', 'm_movementline', { m_product_id: 123, qtyentered: 2, c_uom_id: 100, m_locator_id: 1000, m_locatorto_id: 1001, description: 'x', ad_client_id: 11, ad_org_id: 0 });
    A('P2', mv.t.body && !('description' in mv.t.body.params.fields) && 'm_locatorto_id' in mv.t.body.params.fields, 'the processor\'s replenishment line (DOWN) leaves with its declared columns only', JSON.stringify(Object.keys(mv.t.body && mv.t.body.params.fields || {})));
    var upd = await send(D.T1, 'CRUD_UPDATE', 'c_orderline', {}, { extra: { id: 7, changes: { description: { old: 'a', new: 'b' } } } });
    A('P2', !upd.t.body && /no-declared-column-changed|target-not-a-team/.test(upd.t.local || upd.t.reason || ''), 'an UPDATE that touches no declared column sends nothing', JSON.stringify(upd.t).slice(0, 100));
    var grp = ['c_order', 'c_orderline', 'm_inout', 'm_inoutline', 'c_invoice', 'c_invoiceline', 'fact_acct', 'm_transaction', 'm_storageonhand', 'c_payment', 'c_allocationhdr', 'm_cost'], sentN = 0, localN = 0, total = 0;
    for (var i = 0; i < 103; i++) { var tb = grp[i % grp.length], r = await send(D.F, 'CRUD_CREATE', tb, { documentno: 'G-' + i, ad_client_id: 11, ad_org_id: 0 }); total++; if (r.t.body) sentN++; else localN++; }
    guard('P2', total, 'no op in the group');
    A('P2', total === 103 && sentN === 0, 'the processor\'s 103-op Complete group (order, shipment, invoice, postings, ...): ' + sentN + ' leave, ' + localN + ' stay on the device (the plan declares no flow for them from the hub role)', 'sent=' + sentN + ' local=' + localN);
    var Fo = await STORE.newDevice(), Po = uuid(), spo = await STORE.newSpace('o', Fo, Po, 'F', HQ, undefined); Fo.person_uu = Po;
    var So = STORE.open(new SQL.Database(), { SQL: SQL, space: spo.space, self: Fo, access: allow, log: function () {} }); await So.genesis(spo.params);
    var adO = await boot(src, { plans: [officeFile, posFile], db: DB }); await adO.api._attach(So, Fo); var dO = { ad: adO, S: So, kdb: D.F.kdb }, offN = 0;
    for (var j = 0; j < grp.length; j++) { var ro = await send(dO, 'CRUD_CREATE', grp[j], { documentno: 'O-' + j, ad_client_id: 11, ad_org_id: 0 }); if (ro.t.body) offN++; }
    A('P2', offN >= grp.length - 1, 'CONTROL: the SAME adapter in a space with no `plan` (office) DOES share those tables (' + offN + ' of ' + grp.length + ' sent) - the thin pipe is the plan\'s doing, not a broken sender', 'office sent=' + offN);
    } catch (e) { A('P2!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
    // ── §P3 not-addressed inbound ────────────────────────────────────────────────────────────────────────────────
    H('§P3 NOT-ADDRESSED INBOUND (a station never folds another station\'s declaration)');
    try {
    await fanOut.syncAll();
    var vF = await view(D.F), vT1 = await view(D.T1), vT2 = await view(D.T2), isLine = function (v) { return v.tables.filter(function (t) { return t === 'c_orderline'; }).length; };
    A('P3', isLine(vF) === 1 && isLine(vT1) === 1 && isLine(vT2) === 0, 'the processor projects the declaration (1), the author keeps its own (1), the OTHER station projects 0', 'F=' + isLine(vF) + ' T1=' + isLine(vT1) + ' T2=' + isLine(vT2));
    var placed2 = (await D.T2.S.foldable()).filter(function (p) { return p.env.target.table === 'c_orderline'; }).length;
    A('P3', placed2 === 1 && vT2.thin && vT2.thin.refused >= 1 && D.T2.ad.logs.some(function (l) { return /§TEAM_THIN plan=pos role=200001 .*refused=[1-9]/.test(l); }), 'the ENGINE did place that op on T2 (the dumb relay delivered it) - it is the adapter that refused it locally, and says so (§TEAM_THIN refused>0)', 'placed=' + placed2 + ' refused=' + (vT2.thin && vT2.thin.refused));
    var mvF = isLine({ tables: vF.tables.map(function (t) { return t === 'm_movementline' ? 'c_orderline' : t; }) });
    A('P3', vT1.tables.indexOf('m_movementline') >= 0 && vT2.tables.indexOf('m_movementline') >= 0, 'a DOWN flow addressed to the station ROLE reaches every station (role-scoped), and the hub keeps what it sent', 'T1=' + vT1.tables.filter(function (t) { return t === 'm_movementline'; }).length + ' T2=' + vT2.tables.filter(function (t) { return t === 'm_movementline'; }).length);
    A('P3', vT2.thin.accepted === vT2.rows.length, 'accounting closes: accepted = projected rows on T2', 'accepted=' + vT2.thin.accepted + ' rows=' + vT2.rows.length);
    } catch (e) { A('P3!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
    // ── §P6 borrower per record ──────────────────────────────────────────────────────────────────────────────────
    H('§P6 BORROWER SCOPE IS PER RECORD (two borrowers, ONE role)');
    try {
    var invA = uuid(), invB = uuid(), invC = uuid(), schA = uuid(), schB = uuid();
    D.F.kdb.run("INSERT INTO kernel_ops VALUES (7,'CRUD_CREATE',?,?,'team')", [invA, JSON.stringify({ table: 'c_invoice', fields: { c_bpartner_id: bps[0].id, documentno: 'LN-A', grandtotal: 228.85, description: 'secret A' } })]);
    D.F.kdb.run("INSERT INTO kernel_ops VALUES (8,'CRUD_CREATE',?,?,'team')", [invB, JSON.stringify({ table: 'c_invoice', fields: { c_bpartner_id: bps[1].id, documentno: 'LN-B', grandtotal: 100, description: 'secret B' } })]);
    var sA = await send(D.F, 'CRUD_CREATE', 'c_invoice', { c_bpartner_id: bps[0].id, documentno: 'LN-A', grandtotal: 228.85, description: 'secret A', ad_client_id: 11, ad_org_id: 0 }, { uu: invA });
    var sB = await send(D.F, 'CRUD_CREATE', 'c_invoice', { c_bpartner_id: bps[1].id, documentno: 'LN-B', grandtotal: 100, description: 'secret B', ad_client_id: 11, ad_org_id: 0 }, { uu: invB });
    var sC = await send(D.F, 'CRUD_CREATE', 'c_invoice', { c_bpartner_id: bps[2].id, documentno: 'CASH-1', grandtotal: 9, ad_client_id: 11, ad_org_id: 0 }, { uu: invC });
    var cA = await send(D.F, 'CRUD_CREATE', 'c_invoicepayschedule', { c_invoice_id: -7, dueamt: 114.43, duedate: '2026-11-27', ad_client_id: 11, ad_org_id: 0 }, { uu: schA });
    var cB = await send(D.F, 'CRUD_CREATE', 'c_invoicepayschedule', { c_invoice_id: -8, dueamt: 50, duedate: '2026-11-27', ad_client_id: 11, ad_org_id: 0 }, { uu: schB });
    A('P6', sA.t.body && sB.t.body && cA.t.body && cB.t.body, 'the processor sends the two loans and their instalments (their borrowers are bound in the roster)', [sA, sB, cA, cB].map(function (x) { return x.t.body ? 'sent' : x.t.local; }).join(','));
    A('P6', !sC.t.body && /no-addressee/.test(sC.t.local || ''), 'a record whose entity has NO bound person (a cash customer) is never sent: no-addressee (it would only fatten the pipe)', sC.t.local);
    var sent = Object.keys(sA.t.body.params.fields).sort();
    A('P6', JSON.stringify(sent) === JSON.stringify(['ad_client_id', 'ad_org_id', 'c_bpartner_id', 'documentno', 'grandtotal']), 'the loan leaves with its declared columns only (the address column c_bpartner_id is among them; description is not)', JSON.stringify(sent));
    var pay = await send(D.B1, 'CRUD_CREATE', 'c_payment', { c_bpartner_id: bps[0].id, payamt: 114.43, description: 'slip photo ref', ad_client_id: 11, ad_org_id: 0 });
    A('P6', pay.t.body && JSON.stringify(Object.keys(pay.t.body.params.fields).sort()) === JSON.stringify(['ad_client_id', 'ad_org_id', 'c_bpartner_id', 'payamt']), 'borrower 1\'s payment (UP) carries only c_bpartner_id and payamt', JSON.stringify(Object.keys(pay.t.body && pay.t.body.params.fields || {})));
    await fanOut.syncAll();
    var V = {}; for (var nm of ['F', 'B1', 'B1b', 'B2', 'Q', 'T1']) V[nm] = await view(D[nm]);
    var have = function (v, t) { return v.tables.filter(function (x) { return x === t; }).length; };
    guard('P6', V.B1.rows.length, 'borrower 1 projected nothing - borrower 2\'s 0 would mean nothing');
    A('P6', have(V.B1, 'c_invoice') === 1 && have(V.B1, 'c_invoicepayschedule') === 1 && have(V.B1, 'c_payment') === 1, 'borrower 1 holds ITS loan, ITS instalment and its own payment', V.B1.tables.join(','));
    A('P6', have(V.B2, 'c_invoice') === 1 && have(V.B2, 'c_invoicepayschedule') === 1 && have(V.B2, 'c_payment') === 0 && V.B2.rows.length === 2, 'borrower 2 (same role) holds ITS loan + instalment only: 0 of borrower 1\'s invoice / schedule / payment (' + V.B2.rows.length + ' ops in all)', V.B2.tables.join(',') + ' refused=' + (V.B2.thin && V.B2.thin.refused));
    var idsB2 = V.B2.rows.map(function (r) { return JSON.stringify(JSON.parse(r.parameters).fields); }).join('|');
    A('P6', idsB2.indexOf('228.85') < 0 && idsB2.indexOf('LN-A') < 0 && idsB2.indexOf('114.43') < 0 && idsB2.indexOf('secret') < 0, 'and none of borrower 1\'s values is in borrower 2\'s projection (228.85 / LN-A / 114.43)', idsB2.slice(0, 120));
    A('P6', V.B1b.rows.length === V.B1.rows.length && have(V.B1b, 'c_invoice') === 1, 'borrower 1\'s SECOND device (enrolled onto the existing person) holds exactly what the first holds', 'B1b=' + V.B1b.rows.length + ' B1=' + V.B1.rows.length);
    A('P6', V.Q.rows.length === 0 && V.Q.thin.refused > 0, 'a device with the borrower ROLE but bound to no entity receives 0 (role alone never addresses a record)', 'Q rows=' + V.Q.rows.length + ' refused=' + V.Q.thin.refused);
    A('P6', V.T1.rows.filter(function (r) { return /c_invoice|c_payment/.test(r.parameters); }).length === 0, 'a till (another role) receives none of the borrower flows', V.T1.tables.join(','));
    A('P6', have(V.F, 'c_payment') === 1 && have(V.F, 'c_invoice') === 2, 'the processor holds the payment (UP) and both loans it made', V.F.tables.join(','));
    A('P6', V.B1.thin.placed > V.B1.thin.accepted && V.B1.thin.bytesRefused > 0, 'the instrument sees the refusals: B1 placed ' + V.B1.thin.placed + ' ops, accepted ' + V.B1.thin.accepted + ', refused ' + V.B1.thin.refused + ' (' + V.B1.thin.bytesRefused + ' bytes never projected)', JSON.stringify(V.B1.thin.byTable));
    } catch (e) { A('P6!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
    // ── §P8 catch-up on bind (§41.2 L1) - DERIVED from the hub's own rows, nothing remembered, nothing capped ─────────────
    H('§P8 CATCH-UP ON BIND (a customer who enrols later still receives every open item they already hold; bind-first stays the procedure; stateless, uncapped, survives a reload)');
    try {
    var kr = [], kid8 = 100, mkRow = function (table, fields, uu) { var r = { id: ++kid8, op_type: 'CRUD_CREATE', op_uuid: uu || uuid(), parameters: JSON.stringify({ table: table, fields: fields }), user_tag: null, undone: 0, timestamp: new Date().toISOString() }; kr.push(r); return r; };
    var kdb8 = function () { var by = {}; kr.forEach(function (r) { by[r.id] = r; }); return { exec: function (sql) { var m = /WHERE id=(\d+)/.exec(sql), x = m && by[m[1]]; return x ? [{ values: [[x.op_type, x.op_uuid, x.parameters, x.user_tag]] }] : []; } }; };
    var hold = async function (ad, row) { var t = await ad.api._translate(row, kdb8()); if (t.local) ad.api._localOnly()[row.op_uuid] = t.local; return t; };    // what onCommit does with a record it cannot send
    var hubOwn = async function () { return (await D.F.S.foldable()).filter(function (p) { return p.env.author === D.F.kid; }); }, own8 = function (kidOf) { return null; };
    var rC = mkRow('c_invoice', { c_bpartner_id: bps[2].id, documentno: 'CASH-1', grandtotal: 9, ad_client_id: 11, ad_org_id: 0 }), rC2 = mkRow('c_invoicepayschedule', { c_invoice_id: -rC.id, dueamt: 5, duedate: '2026-12-01', ad_client_id: 11, ad_org_id: 0 });
    var rD = mkRow('c_invoice', { c_bpartner_id: bps[3].id, documentno: 'LATE-D', grandtotal: 70, description: 'secret D', ad_client_id: 11, ad_org_id: 0 }), rD2 = mkRow('c_invoicepayschedule', { c_invoice_id: -rD.id, dueamt: 35, duedate: '2026-12-01', ad_client_id: 11, ad_org_id: 0 });
    var held = []; for (var hr of kr) held.push(await hold(D.F.ad, hr));
    var seq0 = (await hubOwn()).reduce(function (m, p) { return Math.max(m, p.env.seq); }, 0), relNone = await D.F.ad.api._release(kr, true);
    if (guard('P8', kr.length, 'no record was held')) A('P8', held.every(function (t) { return !t.body && /no-addressee/.test(t.local); }) && relNone.n === 0 && (await hubOwn()).reduce(function (m, p) { return Math.max(m, p.env.seq); }, 0) === seq0, 'BEFORE any bind the hub holds ' + kr.length + ' records back (no bound person): a release pass sends 0 and stores no queue (only the persisted sent / localOnly the device already has)', 'held=' + held.length + ' released=' + relNone.n);
    // the hub RELOADS between issue and bind: a brand new adapter instance, only the persisted state (sent, localOnly) and the rows come back
    var st8 = D.F.ad.api._state(), adR = await boot(src, { plans: [fanOut.signedOffice, fanOut.signedPos], trust: [pub1], db: DB }); await adR.api._attach(D.F.S, D.F.dev); adR.api._restore(st8); D.F.ad = adR;
    var B3 = await fanOut.enrol('B3', BORR, bps[2].uu); await D.B3.ad.api._attach(B3.S, B3.dev); await fanOut.syncAll();
    var cu1 = await adR.api._release(kr); await fanOut.syncAll();
    var newOps = (await hubOwn()).filter(function (p) { return p.env.seq > seq0; }).sort(function (a, b) { return a.env.seq - b.env.seq; }), vB3 = await view(D.B3);
    A('P8', cu1.n === 2 && newOps.length === 2 && newOps[0].env.target.table === 'c_invoice' && newOps[1].env.target.table === 'c_invoicepayschedule', 'ISSUE -> hub RELOAD -> BIND: the reloaded hub derives the entity\'s 2 records from its own rows and sends them, once, in the order they were made (loan, then instalment)', 'released=' + cu1.n + ' tables=' + newOps.map(function (p) { return p.env.target.table; }).join('>'));
    A('P8', have(vB3, 'c_invoice') === 1 && have(vB3, 'c_invoicepayschedule') === 1 && vB3.rows.length === 2 && !JSON.stringify(vB3.rows).match(/secret|LATE-D/), 'the late borrower holds its loan and its instalment (and nothing of the other entities\')', vB3.tables.join(','));
    var fC = JSON.parse(vB3.rows.filter(function (r) { return /c_invoice"/.test(r.parameters); })[0].parameters).fields;
    A('P8', JSON.stringify(Object.keys(fC).sort()) === JSON.stringify(['ad_client_id', 'ad_org_id', 'c_bpartner_id', 'documentno', 'grandtotal']), 'with the SAME carries as any DOWN op (declared columns + partition only)', JSON.stringify(Object.keys(fC)));
    var sm = adR.api._sentMap();
    A('P8', !sm[rD.op_uuid] && !sm[rD2.op_uuid] && sm[rC.op_uuid] && sm[rC2.op_uuid], 'the OTHER entity\'s records stay unsent (the bind of one customer releases only that customer\'s items)', 'sent C=' + !!sm[rC.op_uuid] + ' D=' + !!sm[rD.op_uuid]);
    var V1 = {}; for (var nm1 of ['B1', 'B2']) V1[nm1] = await view(D[nm1]);
    A('P8', V1.B1.rows.length === 3 && V1.B2.rows.length === 2, 'borrowers 1 and 2 received nothing new from it (3 and 2 ops as before)', 'B1=' + V1.B1.rows.length + ' B2=' + V1.B2.rows.length);
    var own1 = (await hubOwn()).length, Zd = await fanOut.enrol('Z', TILL, uuid()); await D.Z.ad.api._attach(Zd.S, Zd.dev); await fanOut.syncAll();
    var cu2 = await adR.api._release(kr); await fanOut.syncAll(); var own2 = (await hubOwn()).length;
    A('P8', cu2.n === 0 && own2 === own1, 'a second, UNRELATED bind (a new person with no held records) sends nothing extra', 'released=' + cu2.n + ' hub ops ' + own1 + '->' + own2);
    var cu3 = await adR.api._release(kr, true); await fanOut.syncAll(); await fanOut.syncAll(); var own3 = (await hubOwn()).length, vB3b = await view(D.B3);
    A('P8', cu3.n === 0 && own3 === own2 && vB3b.rows.length === 2, 're-evaluating (forced) / more syncs / a refold sends nothing twice: the hub authored 0 new ops, the borrower still holds 2', 'released=' + cu3.n + ' hub ops=' + own3 + ' B3 ops=' + vB3b.rows.length);
    // MORE THAN 2000 records for ONE entity (the old queue dropped its oldest at 2000): all arrive
    var NB = src.bulk || Number(process.env.PP_BULK) || 2100, t0 = Date.now(), tm = {}; for (var bi = 0; bi < NB; bi++) { var rb = mkRow('c_invoice', { c_bpartner_id: bps[3].id, documentno: 'BULK-' + bi, grandtotal: bi + 1, ad_client_id: 11, ad_org_id: 0 }); var tb = await hold(adR, rb); if (!tb.local) throw new Error('bulk record was sent early'); }
    tm.hold = Date.now() - t0;
    var B4 = await fanOut.enrol('B4', BORR, bps[3].uu); await D.B4.ad.api._attach(B4.S, B4.dev); await fanOut.syncAll();
    tm.enrol = Date.now() - t0; var cu4 = await adR.api._release(kr); tm.release = Date.now() - t0; await fanOut.syncAll(); tm.sync = Date.now() - t0; if (!quiet) console.log('   §PP_TIMING ms ' + JSON.stringify(tm)); var vB4 = await view(D.B4), vB3c = await view(D.B3), nBulk = vB4.rows.filter(function (r) { return /BULK-/.test(r.parameters); }).length, oldest = vB4.rows.some(function (r) { return /"BULK-0"/.test(r.parameters); });
    A('P8', cu4.n === NB + 2 && nBulk === NB && oldest && have(vB4, 'c_invoicepayschedule') === 1 && vB3c.rows.length === 2, 'the next customer\'s bind releases ALL ' + (NB + 2) + ' of its records - ' + NB + ' bulk loans (more than the old 2000 cap, the OLDEST included) + the first loan + its instalment - and nothing of B3\'s again (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)', 'released=' + cu4.n + ' B4 bulk=' + nBulk + ' oldest=' + oldest + ' B3=' + vB3c.rows.length);
    var B3b = await fanOut.enrol('B3b', BORR, bps[2].uu); await D.B3b.ad.api._attach(B3b.S, B3b.dev); await fanOut.syncAll(); var vB3d = await view(D.B3b);
    A('P8', vB3d.rows.length === 2, 'a REPLACED phone (a new device enrolled onto the same person) gets its loan and instalment back', 'B3b=' + vB3d.rows.length);
    } catch (e) { A('P8!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 120)); }
    // ── §P4 genesis plan ─────────────────────────────────────────────────────────────────────────────────────────
    H('§P4 THE GENESIS NAMES THE PLAN (absent = office)');
    try {
    var Fd2 = await STORE.newDevice(), P2u = uuid(), spOff = await STORE.newSpace('o', Fd2, P2u, 'F', HQ, undefined), spOffExp = await STORE.newSpace('o', Fd2, P2u, 'F', HQ, { plan: 'office' }), spPos = await STORE.newSpace('p', Fd2, P2u, 'F', HQ, { plan: 'pos' });
    var thrown = null; try { await STORE.newSpace('b', Fd2, P2u, 'F', HQ, { plan: 'galaxy' }); } catch (e) { thrown = e.message; }
    A('P4', !('plan' in spOff.params) && spOffExp.params.plan === 'office' && spPos.params.plan === 'pos' && !!thrown, 'newSpace without the option writes no `plan`; with it writes office|pos; any other value is refused', 'absent=' + !('plan' in spOff.params) + ' explicit=' + spOffExp.params.plan + ' pos=' + spPos.params.plan + ' bogus=' + thrown);
    async function planOfSpace(sp, role) { Fd2.person_uu = P2u; var S = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: Fd2, access: allow, log: function () {} }); await S.genesis(sp.params); return { S: S, plan: (await S.order()).roster.plan }; }
    var po = await planOfSpace(spOff), pe = await planOfSpace(spOffExp), pp = await planOfSpace(spPos);
    A('P4', po.plan === 'office' && pe.plan === 'office' && pp.plan === 'pos', 'the roster reads the plan back: absent -> office, "office" -> office, "pos" -> pos', po.plan + '/' + pe.plan + '/' + pp.plan);
    var bad = JSON.parse(JSON.stringify(spPos.params)); bad.plan = 'galaxy'; var spBad = { params: bad, space: await ROS.spaceOf(bad) }, S3 = STORE.open(new SQL.Database(), { SQL: SQL, space: spBad.space, self: Fd2, access: allow, log: function () {} });
    var bv = null; try { await S3.genesis(bad); bv = (await S3.order()).roster; } catch (e) { bv = { ok: false, reason: e.message }; }
    A('P4', bv && bv.ok === false, 'a genesis carrying an unknown plan value is untrusted (the space does not open)', bv && bv.reason);
    var hOff = await boot(src, { plans: [officeFile, posFile], search: '?team=1' }), hPos = await boot(src, { plans: [officeFile, posFile], search: '?team=1&teamplan=pos' });
    A('P4', hOff.api._spaceOpts(null) === undefined && hPos.api._spaceOpts(null) && hPos.api._spaceOpts(null).plan === 'pos', 'the founder\'s choice (?teamplan=pos) reaches the genesis through spaceOpts; with no choice there is no option at all', JSON.stringify(hPos.api._spaceOpts(null)));
    var ad2 = await boot(src, { plans: [officeFile, posFile], db: DB }); await ad2.api._attach(po.S, Fd2);
    var cOff = await ad2.api._translate({ op_type: 'CRUD_CREATE', op_uuid: uuid(), gid: null, parameters: JSON.stringify({ table: 'c_order', fields: { documentno: 'X', ad_client_id: 11, ad_org_id: 0 } }) }, null);
    A('P4', ad2.api._scopeCtx().kind === 'office' && ad2.scope.kind() === 'office' && !!cOff.body, 'a device in a space WITHOUT `plan` reads the office plan: c_order is shared exactly as before', JSON.stringify(ad2.api._scopeCtx()));
    var ad3 = await boot(src, { plans: [officeFile, posFile], db: DB }); await ad3.api._attach(pp.S, Fd2);
    A('P4', ad3.api._scopeCtx().kind === 'pos' && ad3.scope.kind() === 'pos' && ad3.scope.scopeOf('c_order') === 'station-local', 'a device in a `plan:"pos"` space switches the reader to the POS plan (c_order is no longer "share")', JSON.stringify(ad3.api._scopeCtx()));
    } catch (e) { A('P4!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
    // ── §P7 signed pos plan ──────────────────────────────────────────────────────────────────────────────────────
    H('§P7 THE POS PLAN IS VERIFIED LIKE THE OFFICE PLAN (same trust list, §33)');
    try {
    var tam = JSON.parse(JSON.stringify(POSPLAN)); tam.flows[0].ship.push('Description'); var tamSigned = await SIGN.sign(POSPLAN, K1.privateJwk, K1.publicJwk); tamSigned.flows[0].ship.push('Description');
    var K2 = await SIGN.keygen(), otherSigned = await SIGN.sign(POSPLAN, K2.privateJwk, K2.publicJwk);
    var offS = wrapPlan('TEAM_PLAN', await SIGN.sign(OFFPLAN, K1.privateJwk, K1.publicJwk));
    async function posHost(planSrc) { var h = await boot(src, { plans: [offS, planSrc], trust: [pub1] }); await h.api._attach(pp.S, Fd2); var sig = h.logs.map(function (l) { return /§TEAM_PLAN_SIG state=(\w+)/.exec(l); }).filter(Boolean).slice(-1)[0]; return { h: h, sig: sig && sig[1], open: h.scope.scopeOf('c_orderline', TILL) }; }
    var okH = await posHost(fanOut.signedPos), tamH = await posHost(wrapPlan('TEAM_PLAN_POS', tamSigned)), unH = await posHost(wrapPlan('TEAM_PLAN_POS', POSPLAN)), othH = await posHost(wrapPlan('TEAM_PLAN_POS', otherSigned)), missH = await posHost('');
    A('P7', okH.sig === 'ok' && okH.open === 'up', 'signed by the trusted key -> state=ok, the station\'s C_OrderLine is "up"', okH.sig + ' ' + okH.open);
    A('P7', tamH.sig === 'invalid' && tamH.open === 'unplanned' && unH.sig === 'invalid' && unH.open === 'unplanned' && othH.sig === 'untrusted' && othH.open === 'unplanned', 'altered after signing / unsigned under a trust list -> invalid, signed by another key -> untrusted: all CLOSED (nothing declared, nothing shared)', [tamH.sig, unH.sig, othH.sig].join('/'));
    A('P7', missH.open === 'unplanned' && missH.h.logs.some(function (l) { return /§TEAM_PLAN missing/.test(l); }), 'a pos space whose device has NO pos plan file shares nothing and prints "missing — nothing is shared"', missH.open);
    } catch (e) { A('P7!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
  }

  // ── §P5 the executor map the plan states, as Document Action Access rows ───────────────────────────────────────
  if (POSPLAN) {
    H('§P5 THE PLAN\'S OWN docaction ROW IS THE EXECUTOR MAP (G-4 overlay); no executor for the station');
    try {
    A('P5', JSON.stringify(POSPLAN.executors) === '{"c_order":102}' && POSPLAN.hub === 102, 'the POS plan carries executors = {c_order: 102} derived from its docaction row, and hub = 102', JSON.stringify(POSPLAN.executors));
    var DB5 = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp', 'ad_seed.db'))), q5 = function (sql) { var st = DB5.prepare(sql), o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; };
    var F5 = await STORE.newDevice(), PF5 = uuid(), sp5 = await STORE.newSpace('x', F5, PF5, 'HQ', HQ, { planTrust: [pub1], plan: 'pos' }); F5.person_uu = PF5;
    var S5 = STORE.open(new SQL.Database(), { SQL: SQL, space: sp5.space, self: F5, access: allow, log: function () {} }); await S5.genesis(sp5.params);
    var T5 = await STORE.newDevice(), PT5 = uuid(); T5.person_uu = PT5; await S5.addPerson({ person_uu: PT5, name: 'till', ad_role_id: TILL, comm_admin: false }); await S5.enroll(T5.kid, T5.pubJwk, PT5, T5.dhPubJwk);
    var h5 = await boot(src, { plans: [officeFile, posFile], db: DB5 }); h5.g.APP = { roleId: TILL, clientId: 11 };
    var stmt = await SIGN.buildStmt('executors', POSPLAN.executors, null, K1.privateJwk, K1.publicJwk), pol = await S5.setPolicy({ epoch: 1, executors: stmt }), v5 = (await S5.order()).verdict[pol.hash];
    var dt = q5("SELECT c_doctypetarget_id AS d FROM c_order WHERE c_doctypetarget_id>0 LIMIT 1")[0].d, nr = function (role, act) { return q5("SELECT count(*) AS n FROM ad_document_action_access WHERE ad_role_id=" + role + " AND c_doctype_id=" + dt + " AND isactive='" + act + "'")[0].n; };
    var pre = [nr(TILL, 'Y'), nr(BORR, 'Y'), nr(HQ, 'Y')];
    await h5.api._attach(S5, T5); await h5.api._refreshExecutors(S5, T5.kid);
    if (guard('P5', pre[0] + pre[2], 'no Document Action Access row existed to withdraw')) A('P5', v5 && v5.verdict === 'MERGED' && nr(TILL, 'Y') === 0 && nr(TILL, 'N') === pre[0] && nr(HQ, 'Y') === pre[2] && nr(HQ, 'N') === 0, 'the plan\'s map, signed by the owner (stmt executors) and MERGED, leaves the station role (' + TILL + ') with no active DocAction row on the order doctype (was ' + pre[0] + ') and the processor (' + HQ + ') with all ' + pre[2], 'policy=' + (v5 && v5.verdict) + ' till Y=' + nr(TILL, 'Y') + ' N=' + nr(TILL, 'N') + ' hq Y=' + nr(HQ, 'Y'));
    var stA = null; try { stA = await SIGN.buildStmt('executors', { c_order: 'author' }, POSPLAN.executors, K1.privateJwk, K1.publicJwk); } catch (e) { stA = 'refused: ' + e.message.slice(0, 60); }
    A('P5', typeof stA === 'string' || (await S5.setPolicy({ epoch: 2, executors: stA }).then(async function (x) { var v = (await S5.order()).verdict[x.hash]; return v && v.verdict === 'REFUSED'; })), 'an \'author\' executor is not accepted anywhere any more (signer or fold)', typeof stA === 'string' ? stA : 'REFUSED by the fold');
    } catch (e) { A('P5!THREW', false, 'THREW: ' + String(e && e.message).slice(0, 110)); }
  }
  return red;
}

(async function () {
  console.log('═══ W-POS-PLAN — role-scoped delivery: the hosts read a POS (star) plan (TEAMWORK_FRAMEWORK §38.14, §38.15) ═══  reader=' + OOTB + ' engine=' + BC);
  var READ = { scope: rd('common/comm/team_scope.js'), adapter: process.env.PP_ADAPTER ? fs.readFileSync(process.env.PP_ADAPTER, 'utf8') : rd('erp/team_sync.js') };
  var red0 = await arms(READ, false);
  console.log('§PP_ARMS red=' + (red0.length ? Array.from(new Set(red0)).join(',') : 'none') + ' judged=' + judged + ' fails=' + fails);
  if (fails === 0 && judged === 0) { console.log('§PP_VERDICT INCONCLUSIVE — nothing was judged'); process.exit(2); }
  if (fails || red0.length) { console.log('§PP_VERDICT FAIL judged=' + judged + ' fails=' + fails + ' mutants=NOT RUN (the base run is red)'); process.exit(1); }
  if (process.env.PP_NOMUT) { console.log('§PP_VERDICT PASS judged=' + judged + ' fails=0 mutants=skipped'); process.exit(0); }
  console.log('§MUTANTS (a COPY with one rule broken; each must turn >= 1 arm red; a crash is NOT a kill)');
  var results = [];
  async function mut(label, expect, patch) {
    var s = { scope: READ.scope, adapter: READ.adapter, engine: null, bulk: 60 }, tmp = null, ok = patch(s, function () { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pp_eng_')); fs.cpSync(path.join(BC, 'build', 'comm'), tmp, { recursive: true }); return tmp; });
    var red, threw = null; if (ok) { try { red = await arms(s, true); } catch (e) { threw = String(e && e.message).slice(0, 80); red = []; } }
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
    var hit = !ok ? false : !threw && red.some(function (x) { return expect.indexOf(x.replace('!VACUOUS', '')) >= 0; });
    results.push(hit); console.log('   ' + (hit ? '🟢' : '🔴') + ' ' + label + ' -> ' + (!ok ? 'MUTATION DID NOT APPLY' : threw ? 'CRASHED (' + threw + ') — not a kill' : 'red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)')));
    if (!hit) fails++; judged++;
  }
  var rep = function (src, a, b) { if (src.split(a).length !== 2) return null; return src.replace(a, b); };
  await mut('hub rows are not indexed by the reader', ['P1', 'P2', 'P3', 'P6'], function (s) { var t = rep(s.scope, "else if (f.audience === 'hub' && !I.hub[lc(f.table)]) I.hub[lc(f.table)] = f;", ''); if (!t) return false; s.scope = t; return true; });
  await mut('the carries rule is not applied outbound', ['P2', 'P6'], function (s) { var t = rep(s.adapter, 'if (ship) {', 'if (false) {'); if (!t) return false; s.adapter = t; return true; });
  await mut('the inbound filter is off (everything placed is projected)', ['P3', 'P6'], function (s) { var t = rep(s.adapter, 'if (thin && thin.refuse[p.hash]) return;', ''); if (!t) return false; s.adapter = t; return true; });
  await mut('the engine reads an absent plan as POS (default plan = pos)', ['P4', 'P0'], function (s, eng) { var d = eng(), f = path.join(d, 'comm_roster.js'), a = fs.readFileSync(f, 'utf8'), t = rep(a, "plan: gen.env.body.params.plan === 'pos' ? 'pos' : 'office'", "plan: gen.env.body.params.plan === 'office' ? 'office' : 'pos'"); if (!t) return false; fs.writeFileSync(f, t); s.engine = d; return true; });
  await mut('`by` is ignored (a DOWN row is addressed by role alone)', ['P6'], function (s) { var t = rep(s.scope, 'if (!by || !by.length) return { ok: true };', 'if (true) return { ok: true };'); if (!t) return false; s.scope = t; return true; });
  await mut('a role that is neither edge nor hub is treated as the recipient', ['P1', 'P3', 'P6'], function (s) { var t = rep(s.scope, "me === edge ? 'up' : me === hub ? 'receive' : 'unplanned'", "me === edge ? 'up' : 'receive'"); if (!t) return false; s.scope = t; return true; });
  await mut('the reader never switches to the POS plan (setKind ignored)', ['P4', 'P1', 'P3', 'P6'], function (s) { var t = rep(s.scope, "setKind: function (k) { memo.kind = k === 'pos' ? 'pos' : 'office'; return memo.kind; }", "setKind: function (k) { return memo.kind; }"); if (!t) return false; s.scope = t; return true; });
  await mut('the sender sends a record with no bound addressee', ['P6'], function (s) { var t = rep(s.adapter, "if (!ad || !(await S.order()).roster.persons[ad])", "if (false)"); if (!t) return false; s.adapter = t; return true; });
  await mut('the office answer of the reader is changed (share -> unplanned)', ['P0'], function (s) { var t = rep(s.scope, "I.flows[lc(table)] ? 'share' : 'unplanned', h =", "I.flows[lc(table)] ? 'unplanned' : 'unplanned', h ="); if (!t) return false; s.scope = t; return true; });
  await mut('the POS plan is not verified (signature skipped on a kind switch)', ['P7'], function (s) { var t = rep(s.adapter, "await verifyPlan('plan=' + kind);", ''); if (!t) return false; s.adapter = t; return true; });
  await mut('catch-up is off (a held record is never released)', ['P8'], function (s) { var t = rep(s.adapter, "if (!S || scopeCtx.kind !== 'pos') return out;", "return out;"); if (!t) return false; s.adapter = t; return true; });
  await mut('the derivation ignores the entity (every unsent DOWN row goes to its role on any bind)', ['P8'], function (s) { var t = rep(s.adapter, "if (!ad || !(await S.order()).roster.persons[ad])", "if (false)"); if (!t) return false; s.adapter = t; return true; });
  await mut('a released record is not marked (sent again on the next evaluation)', ['P8'], function (s) { var t = rep(s.adapter, "sent[r.op_uuid] = a.hash; delete localOnly[r.op_uuid]; out.n++;", "out.n++;"); if (!t) return false; s.adapter = t; return true; });
  await mut('the oldest records are dropped beyond 2000 (the retired cap, reinstated)', ['P8'], function (s) { var t = rep(s.adapter, "}).sort(function (a, b) { return Number(a.id) - Number(b.id); });\n    if (!cands.length) return out;", "}).sort(function (a, b) { return Number(a.id) - Number(b.id); }).slice(-2000);\n    if (!cands.length) return out;"); if (!t) return false; s.adapter = t; s.bulk = 2100; return true; });
  var killed = results.filter(Boolean).length;
  console.log('§PP_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' mutants_killed=' + killed + '/' + results.length);
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('§PP_CRASH ' + (e && e.stack || e)); process.exit(2); });
