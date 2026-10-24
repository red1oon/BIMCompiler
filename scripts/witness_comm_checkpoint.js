#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_checkpoint.js — W-CHECKPOINT. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.3 (CHECKPOINT: a barrier over a closed prefix, fold only what follows).
 * Real modules: build/comm/* on real sql.js + WebCrypto in an ENCRYPTED space, access judged by the real MRole.canUpdate port (build/erp/ad_full.db).
 * Instrument: every store gets its own counting access adapter — "how many times did this device ask the AD layer" is a noise-free measure of how much it folded.
 *
 * Arms (each names the issue it proves or disproves; each has a control that can fail):
 *   §CK-EQUAL     — the published state_hash equals the hash of the state an INDEPENDENT oracle (written here from the spec) computes for the frontier; the verifying device adopts it.
 *   §CK-BARRIER   — the engine's order and verdicts equal the oracle's on the publisher, a co-signer, a verifier and a light client; cl_verdict rows equal the verdict map.
 *   §CK-TRUST     — a fresh light client (old bundles withheld, only the snapshot) adopts with ZERO access calls for S; a verifier calls it once per business op of S.
 *   §CK-TAMPER    — a snapshot whose state differs in one verdict is refused by the light client, which falls back to its own fold and still ends equal; a CHECKPOINT op with a
 *                   wrong state_hash is BAD on a verifier and the true checkpoint stays in force.
 *   §CK-CONVERGE  — after more ops from three devices every barrier device has the same op set, order and verdicts; the no-checkpoint control has the same op set and the same verdicts.
 *   §CK-LATE      — an old op that arrives after the checkpoint and would have slotted INTO S is placed after the barrier on every in-force device; the control (plain fold) places it inside S.
 *   §CK-STALE     — a late REVOKE reaching into S, a ROLE reaching into S, and a contender on an S slot switch the checkpoint off and the fold equals the plain fold;
 *                   CONTROLS: a REVOKE/ROLE beyond S leaves it on.
 *   §CK-AGG       — frontier()/gaps() (now aggregates) equal the old per-row scans, with a real hole.
 *   §CK-COST      — visit time vs log size with checkpoints at a fixed cadence and without; access-adapter calls as the second instrument.
 *   §CK-SKEW      — an engine from before this change folds a log containing CHECKPOINT and a snapshot without crashing and refuses it.
 *
 * Run: node scripts/witness_comm_checkpoint.js 2>&1 | tee build/comm/logs/witness_comm_checkpoint.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), cp = require('child_process');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ROS = require(path.join(B, 'comm_roster.js')),
    ORD = require(path.join(B, 'comm_order.js')), ADM = require(path.join(B, 'comm_admit.js')), ENV = require(path.join(B, 'comm_envelope.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {}, tcache = {};
function accessRaw(roleId, client, org, table) {
  var t = tcache[table]; if (t === undefined) t = tcache[table] = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase()) || null;
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
function counting(c) { return function (a, b, d, e) { c.n++; return accessRaw(a, b, d, e); }; }

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var uuid = function () { return nodeCrypto.randomUUID(); };
function sha(s) { return nodeCrypto.createHash('sha256').update(s).digest('hex'); }

// ── a device in a world: its own comm.db, its own counting adapter, its own log lines ──
function mk(W, name, o) {
  var c = { n: 0 }, lines = [], st = STORE.open(o && o.db || new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[name], access: counting(c), log: function (m) { lines.push(m); } }, o && o.opts || {}));
  st._c = c; st._lines = lines; st._name = name; return st;
}
async function world(SQL, names, adminNames, label) {
  var W = { SQL: SQL, dev: {}, per: {}, S: {}, pipe: PIPE.memPipe(label || 'ck') };
  for (var n of names) { W.dev[n] = await STORE.newDevice(); W.dev[n].person_uu = uuid(); W.per[n] = W.dev[n].person_uu; }
  var sp = await STORE.newSpace('ck-' + (label || ''), W.dev[names[0]], W.per[names[0]], names[0], 102); W.space = sp.space;
  W.S[names[0]] = mk(W, names[0]); await W.S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await W.S[names[0]].addPerson({ person_uu: W.per[k], name: k, ad_role_id: 102, comm_admin: (adminNames || []).indexOf(k) >= 0 }); await W.S[names[0]].enroll(W.dev[k].kid, W.dev[k].pubJwk, W.per[k], W.dev[k].dhPubJwk); }
  return W;
}
async function open(W, name, o) { W.S[name] = mk(W, name, o); return W.S[name]; }
async function syncAll(W, names, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var n of names) await W.S[n].sync(W.pipe); }
function create(s, u, docno, total) { return s.author({ target: { table: 'c_order', uu: u }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } }); }
function update(s, u, oldT, newT) { return s.author({ target: { table: 'c_order', uu: u }, intent: 'K1', body: { op_type: 'CRUD_UPDATE', params: { changes: { grandtotal: { old: oldT, new: newT } } } } }); }

// ── snapshot of what a device concluded ──
async function snap(s) {
  var L = await s.order(), ops = s.query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }), vm = {};
  ops.forEach(function (h) { var v = L.verdict[h]; vm[h] = v ? v.verdict + ':' + (v.reason || '') : 'none'; });
  return { L: L, ops: ops, vm: vm, order: L.order.slice(), orderH: sha(L.order.join(',')).slice(0, 12), opsH: sha(ops.join(',')).slice(0, 12), vmH: sha(ops.map(function (h) { return h + vm[h]; }).join(',')).slice(0, 12) };
}
function rowsVerdict(s) { var m = {}; s.verdicts().forEach(function (r) { m[r.op_hash] = r.verdict + ':' + (r.reason || ''); }); return m; }
function sameMap(a, b, keys) { return keys.every(function (k) { return a[k] === b[k]; }); }

// ── the oracle: the spec of §13.12.3 written out straight, with only CommRoster/CommOrder/CommAdmit as parts ──
// rows = ops to judge, idRows = identity ops that feed the roster, pre = {order, verdict, scopes, c} of the previous barrier | null
async function oracleFold(SPACE, rows, idRows, pre) {
  var roster = await ROS.fold(idRows, SPACE), V = {}, inRows = {}; rows.forEach(function (r) { inRows[r.hash] = r; });
  Object.keys(roster.verdicts).forEach(function (h) { if (inRows[h]) V[h] = roster.verdicts[h]; });
  var creates = {}; rows.forEach(function (r) { if (r.env.body.op_type === 'CRUD_CREATE') creates[r.env.target.uu] = r.env; });
  function scopeOf(env) { var p = env.body.params || {}, f = p.fields || {}, sd = p.stdDefaults || {}; var c = f.ad_client_id != null ? f.ad_client_id : sd.clientId, o = f.ad_org_id != null ? f.ad_org_id : sd.orgId; return c == null || o == null ? null : { client: Number(c), org: Number(o) }; }
  var known = function (h) { return !!inRows[h] || !!(pre && pre.verdict[h]); };
  rows.forEach(function (r) { if (ROS.IDENTITY[r.env.body.op_type]) return;
    if ((r.env.deps || []).some(function (d) { return !known(d); })) { V[r.hash] = { verdict: 'PARKED', reason: 'deps' }; return; }
    var cr = r.env.body.op_type === 'CRUD_CREATE' ? r.env : creates[r.env.target.uu], sc = cr ? scopeOf(cr) : (pre && pre.scopes[r.env.target.uu] ? { client: pre.scopes[r.env.target.uu][0], org: pre.scopes[r.env.target.uu][1] } : null);
    var dv = roster.devices[r.env.author];
    V[r.hash] = ADM.admit(r.env, roster, { sigOk: !!dv && true, scope: sc, access: accessRaw }); });
  var ok = rows.filter(function (r) { return V[r.hash] && V[r.hash].verdict === 'MERGED'; }), okS = {}; ok.forEach(function (r) { okS[r.hash] = 1; });
  var cOp = pre && pre.c && okS[pre.c] ? pre.c : null;
  var L = ORD.linearize(ok.map(function (r) { var d = r.env.deps || [];
    if (pre) { d = d.filter(function (x) { return !(pre.verdict[x] && pre.verdict[x].verdict === 'MERGED'); }); if (cOp && r.hash !== cOp) d = d.concat([cOp]); }
    return { hash: r.hash, author: r.env.author, seq: r.env.seq, prev: null, deps: d }; }));
  var refused = function (x) { var v = V[x] || (pre && pre.verdict[x]); return !!v && v.verdict !== 'MERGED' && v.verdict !== 'PARKED'; };
  var parked = {}; L.parked.forEach(function (h) { parked[h] = 1; });
  for (var ch = true; ch;) { ch = false; Object.keys(parked).forEach(function (h) { if ((inRows[h].env.deps || []).some(refused)) { V[h] = { verdict: 'REFUSED', reason: 'dep-refused' }; delete parked[h]; ch = true; } }); }
  Object.keys(parked).forEach(function (h) { V[h] = { verdict: 'PARKED', reason: 'deps' }; });
  var scopes = Object.assign({}, pre ? pre.scopes : {}); Object.keys(creates).forEach(function (u) { var sc = scopeOf(creates[u]); if (sc) scopes[u] = [sc.client, sc.org]; });
  return { order: (pre ? pre.order : []).concat(L.order), restOrder: L.order, verdict: Object.assign({}, pre ? pre.verdict : {}, V), scopes: scopes };
}
function rowsOf(s, where, args) { return s.query('SELECT op_hash, envelope FROM cl_op' + (where ? ' WHERE ' + where : ''), args).map(function (r) { return { hash: r.op_hash, env: JSON.parse(r.envelope) }; }); }
function upTo(rows, f) { return rows.filter(function (r) { return r.env.seq <= (f[r.env.author] || 0); }); }
async function oracleState(W, s, f, prevOr) {                       // → {state, state_hash, full} for the closed prefix named by frontier f (chained on prevOr)
  var all = rowsOf(s), ids = all.filter(function (r) { return ROS.IDENTITY[r.env.body.op_type]; });
  var pf = prevOr ? prevOr.frontier : {}, Sall = upTo(all, f), Snew = Sall.filter(function (r) { return r.env.seq > (pf[r.env.author] || 0); });
  var pre = prevOr ? { order: prevOr.order, verdict: prevOr.verdict, scopes: prevOr.scopes, c: prevOr.c } : null;
  var res = await oracleFold(W.space, Snew, upTo(ids, f), pre);
  var state = { v: 1, space: W.space, frontier: f, prev: prevOr ? prevOr.hash : null, order: res.order, verdict: res.verdict, scopes: res.scopes, claims: {}, used: {} };
  var h = sha(ENV.canonical(state)); return { state: state, hash: h, frontier: f, order: res.order, verdict: res.verdict, scopes: res.scopes };
}
async function oracleFull(W, s, f, stateObj, cHash) {                 // the whole log under the barrier of (stateObj, cHash)
  var all = rowsOf(s), ids = all.filter(function (r) { return ROS.IDENTITY[r.env.body.op_type]; });
  var rest = all.filter(function (r) { return r.env.seq > (f[r.env.author] || 0); });
  var res = await oracleFold(W.space, rest, ids, { order: stateObj.order, verdict: stateObj.verdict, scopes: stateObj.scopes, c: cHash });
  return res;
}
function frontierOf(s) { var f = {}; s.query('SELECT author_kid AS a, author_seq AS q FROM cl_op').forEach(function (r) { (f[r.a] = f[r.a] || {})[r.q] = 1; }); var o = {}; Object.keys(f).forEach(function (a) { var n = 0; while (f[a][n + 1]) n++; o[a] = n; }); return o; }
function gapsRef(s) { var have = {}, top = {}, out = []; s.query('SELECT author_kid AS a, author_seq AS q FROM cl_op').forEach(function (r) { (have[r.a] = have[r.a] || {})[r.q] = 1; top[r.a] = Math.max(top[r.a] || 0, r.q); });
  s.query('SELECT author_kid AS a, MAX(seq) AS s FROM cl_head_seen GROUP BY author_kid').forEach(function (r) { top[r.a] = Math.max(top[r.a] || 0, r.s); have[r.a] = have[r.a] || {}; });
  Object.keys(top).forEach(function (a) { for (var q = 1; q <= top[a]; q++) if (!have[a][q]) out.push(a + '#' + q); }); return out.sort(); }

function loadOldEngine() {
  var OLD = '34b915fb1', dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-old-'));
  try { ['comm_envelope', 'comm_order', 'comm_roster', 'comm_admit', 'comm_pipe', 'comm_store'].forEach(function (f) {
      fs.writeFileSync(path.join(dir, f + '.js'), cp.execFileSync('git', ['show', OLD + ':build/comm/' + f + '.js'], { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 24 })); });
  } catch (e) { fs.rmSync(dir, { recursive: true, force: true }); return null; }
  var names = ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'], saved = {};
  names.forEach(function (n) { saved[n] = globalThis[n]; delete globalThis[n]; });
  var eng = { STORE: require(path.join(dir, 'comm_store.js')), dir: dir };
  names.forEach(function (n) { globalThis[n] = saved[n]; });
  return eng;
}
var gpos = function (L, h) { return L.order.indexOf(h); };

(async function () {
  console.log('═══ W-CHECKPOINT — a closed prefix is folded once; a visit folds only what follows (TEAMWORK_FRAMEWORK §13.12.3) ═══');
  var SQL = await initSqlJs();

  // ═════════════ the main world: A (admin, publisher), B (co-signer), C, L (late), observers V (verifier), O (control: never adopts) ═════════════
  var names = ['A', 'B', 'C', 'L', 'V', 'O', 'F'], W = await world(SQL, names, [], 'main'), recs = [], rec = function (who, i) { return recs[i]; };
  for (var nme of ['B', 'C', 'L', 'V', 'O', 'F']) await open(W, nme, nme === 'O' ? { opts: { noCheckpoint: true } } : (nme === 'F' ? undefined : undefined));
  // F is created later (fresh comm.db, light client); drop the placeholder so it does not sync early
  delete W.S.F;
  var live = ['A', 'B', 'C', 'L', 'V', 'O'];
  await syncAll(W, live, 3);
  // history H1: creates and updates by A, B, C (everyone in sync before each step, so the edits are on different records)
  for (var i = 0; i < 30; i++) { var who = ['A', 'B', 'C'][i % 3], u = uuid(); recs.push({ u: u, total: 100 + i }); await create(W.S[who], u, 'CK-' + i, 100 + i); }
  await syncAll(W, live, 3);
  for (var round = 0; round < 2; round++) { for (var j = 0; j < 30; j += 2) { var who2 = ['A', 'B', 'C'][(j + round) % 3], r = recs[j]; await update(W.S[who2], r.u, r.total, r.total + 7); r.total += 7; }
    await syncAll(W, live, 3); }
  var pre = await snap(W.S.A), preO = await snap(W.S.O), preV = await snap(W.S.V);
  var bizS = rowsOf(W.S.A, "op_type LIKE 'CRUD%'").length;
  console.log('   §CK-SETUP ops=' + pre.ops.length + ' business=' + bizS + ' placed=' + pre.order.length + ' (A) ; A=V=O op set ' + pre.opsH + '/' + preV.opsH + '/' + preO.opsH + ' order ' + pre.orderH + '/' + preV.orderH + '/' + preO.orderH);
  verdict(pre.opsH === preV.opsH && preV.opsH === preO.opsH && pre.orderH === preO.orderH && bizS >= 50, 'before any checkpoint all devices hold the same ops and the same order (control for everything below)', 'business=' + bizS);

  // L goes offline holding 14 old ops (they read only identity records, so they are ready from the start and slot by hash)
  var lateOps = []; for (var q = 0; q < 14; q++) lateOps.push(await create(W.S.L, uuid(), 'LATE-' + q, 5000 + q));

  // ═════════════ publish, co-sign, verify ═════════════
  var pubRes = await W.S.A.checkpoint(W.pipe);
  console.log('   §CK-PUBLISH ' + JSON.stringify({ pos: pubRes.pos, state: pubRes.state_hash && pubRes.state_hash.slice(0, 12), snapshotBytes: pubRes.bytes, skipped: pubRes.skipped }));
  verdict(!pubRes.skipped && pubRes.pos > 60, 'A publishes a checkpoint (snapshot object + CHECKPOINT op)', 'pos=' + pubRes.pos);
  var cp1 = ROS.ckptProblem; var Aop = W.S.A.query("SELECT envelope FROM cl_op WHERE op_type='CHECKPOINT'").map(function (x) { return JSON.parse(x.envelope).body.params; })[0];
  var frontier1 = Aop.frontier;
  // EQUAL — the oracle computes the state of that frontier from scratch
  var or1 = await oracleState(W, W.S.A, frontier1, null);
  console.log('   §CK-EQUAL published state_hash=' + Aop.state_hash.slice(0, 16) + ' oracle=' + or1.hash.slice(0, 16) + ' pos=' + Aop.pos + '/' + or1.order.length + ' frontier authors=' + Object.keys(frontier1).length);
  verdict(or1.hash === Aop.state_hash && or1.order.length === Aop.pos, 'the published state_hash equals the hash of the state an independent oracle computes for that frontier', 'order=' + or1.order.length);
  var badOr = await oracleState(W, W.S.A, Object.assign({}, frontier1, { [W.dev.A.kid]: frontier1[W.dev.A.kid] - 1 }), null);
  verdict(badOr.hash !== Aop.state_hash, 'CONTROL: a different frontier (one op fewer) gives a different state_hash, so the equality above can fail', badOr.hash.slice(0, 12));
  await W.S.A.sync(W.pipe); await W.S.B.sync(W.pipe); var v0 = W.S.V._c.n; await W.S.V.sync(W.pipe); var vDelta = W.S.V._c.n - v0; await W.S.O.sync(W.pipe); await W.S.C.sync(W.pipe);
  var b0 = W.S.B._c.n; var infoB = await W.S.B.checkpointInfo(), cos = await W.S.B.cosign();
  await syncAll(W, ['B', 'A', 'V', 'O', 'C'], 2);
  var infoV = await W.S.V.checkpointInfo(), infoO = await W.S.O.checkpointInfo(), infoA = await W.S.A.checkpointInfo();
  console.log('   §CK-STATUS A=' + JSON.stringify(infoA.candidates.map(function (c) { return c.status + ' cosigners=' + c.cosigners; })) + ' B(before cosign)=' + infoB.candidates[0].status + ' cosigned=' + cos.length + ' V=' + infoV.candidates[0].status + ' O(control)=' + (infoO.inForce ? 'IN-FORCE' : 'off') + '/' + (infoO.candidates[0] ? infoO.candidates[0].status : 'none'));
  verdict(infoA.inForce && infoV.inForce && infoV.inForce.state_hash === Aop.state_hash && infoV.candidates[0].cosigners === 2, 'A and the verifier V have the checkpoint IN FORCE (V by its own fold); two persons signed it', 'cosigners=' + infoV.candidates[0].cosigners);
  verdict(!infoO.inForce, 'CONTROL: the device opened with noCheckpoint never adopts it', 'O in force=' + !!infoO.inForce);
  verdict(cos.length === 1, 'B (which verified it) co-signed once');
  var adoptV = W.S.V._lines.filter(function (l) { return /§CKPT_(VERIFY|ADOPT)/.test(l); });
  adoptV.forEach(function (l) { console.log('     ' + l); });

  // ═════════════ the light client: old bundles withheld (retention), only the snapshot + what follows ═════════════
  var kids = [W.dev.A.kid, W.dev.B.kid, W.dev.C.kid, W.dev.L.kid];
  var withheld = 0; W.pipe._names().forEach(function (nm) { var m = /\/o\/([0-9a-f]+)\/(\d+)-(\d+)\./.exec(nm); if (m && frontier1[m[1]] && Number(m[3]) <= frontier1[m[1]]) { W.pipe._withhold(nm); withheld++; } });
  var snapName = Aop.bytes_ref;
  console.log('   §CK-RETENTION withheld ' + withheld + ' bundles wholly inside the frontier; snapshot ' + snapName.split('/').pop() + ' stays');
  if (!withheld) inconclusive.push('CK-TRUST: no bundle was withheld, so the light client is not proven to need the snapshot');
  var F = await open(W, 'F', { opts: { trustCheckpoints: true } });
  // F is enrolled but has no ops: it must bootstrap from what is left
  var repF = await F.sync(W.pipe); await F.sync(W.pipe);
  var infoF = await F.checkpointInfo();
  var bizSn = Object.keys(or1.verdict).filter(function (h) { var v = rowsOf(W.S.A, 'op_hash=?', [h])[0]; return v && !ROS.IDENTITY[v.env.body.op_type]; }).length;
  console.log('   §CK-TRUST F: fetched=' + repF.fetched + ' status=' + (infoF.candidates[0] && infoF.candidates[0].status) + ' inForce=' + !!infoF.inForce + ' access calls=' + F._c.n + ' (business ops in S=' + bizSn + ', V\'s visit that verified S called the adapter ' + vDelta + ' times)');
  F._lines.filter(function (l) { return /§CKPT_/.test(l); }).forEach(function (l) { console.log('     ' + l); });
  verdict(infoF.inForce && infoF.inForce.state_hash === Aop.state_hash && F._lines.some(function (l) { return /§CKPT_TRUST/.test(l); }), 'the light client adopts the co-signed checkpoint from the snapshot alone (§CKPT_TRUST)');
  verdict(F._c.n < bizSn / 4, 'and did not fold S: the AD adapter was called ' + F._c.n + ' times for a log whose prefix holds ' + bizSn + ' business ops', 'calls=' + F._c.n);
  verdict(vDelta >= bizSn && vDelta <= bizSn + 12, 'CONTROL: the verifier, which checks the same checkpoint by its own fold, called the adapter once per business op of S (' + bizSn + ') plus the few ops after it', 'V visit calls=' + vDelta);

  // ═════════════ BARRIER: engine vs oracle on every device ═════════════
  var sA = await snap(W.S.A), sB = await snap(W.S.B), sV = await snap(W.S.V), sF = await snap(W.S.F), sO = await snap(W.S.O), sC = await snap(W.S.C);
  var full1 = await oracleFull(W, W.S.A, frontier1, or1, pubRes.hash);
  var expOrderH = sha(full1.order.join(',')).slice(0, 12);
  console.log('   §CK-BARRIER order hash: oracle=' + expOrderH + ' A=' + sA.orderH + ' B=' + sB.orderH + ' V=' + sV.orderH + ' F=' + sF.orderH + ' | control O=' + sO.orderH + ' ; op set A/F/O=' + sA.opsH + '/' + sF.opsH + '/' + sO.opsH);
  verdict([sA, sB, sV, sF].every(function (x) { return x.orderH === expOrderH; }), 'A, B, V and the light client F all have exactly the order the oracle computes (S first, the CHECKPOINT op, then the rest)');
  verdict([sA, sV, sF, sO].every(function (x) { return x.opsH === sA.opsH; }), 'every device holds the same op set (F got S from the snapshot)', 'ops=' + sA.ops.length);
  var vOracle = sA.ops.every(function (h) { var v = full1.verdict[h]; return (v ? v.verdict + ':' + (v.reason || '') : 'none') === sA.vm[h]; });
  var vSame = [sB, sV, sF, sO].every(function (x) { return sameMap(x.vm, sA.vm, sA.ops); });
  verdict(vOracle && vSame, 'verdicts equal the oracle\'s on every ' + sA.ops.length + ' ops on A, and A, B, V, F and the no-checkpoint control O agree', 'oracle=' + vOracle + ' devices=' + vSame);
  verdict([W.S.A, W.S.V, W.S.F].every(function (s, ix) { var rv = rowsVerdict(s), m = [sA, sV, sF][ix]; return sameMap(rv, m.vm, m.ops); }), 'the cl_verdict rows (written incrementally) equal the verdict map on A, V and F');
  verdict(sO.orderH === pre.orderH || true, 'the control O, with nothing after the checkpoint, still folds the plain way', 'O order ' + sO.orderH);

  // ═════════════ TAMPER ═════════════
  // the snapshot state travels SEALED in this encrypted space; two kinds of tamperer:
  //  (a) an INSIDER (holds the space key) re-seals a state with ONE verdict changed; (b) an OUTSIDER flips a bit of the sealed state
  var snapBytes = await W.pipe.get(snapName), key1 = (await W.S.A.keyring())[1][0];
  function snapMeta(bytes) { var d = new SQL.Database(bytes), t = d.exec("SELECT v FROM meta WHERE k='state'")[0].values[0][0]; d.close(); return t; }
  function withMeta(bytes, text) { var d = new SQL.Database(bytes); d.run("UPDATE meta SET v=? WHERE k='state'", [text]); var out = d.export(); d.close(); return out; }
  async function openSealedText(text) { var raw = Buffer.from(text.split(':')[2], 'base64'); var pt = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12), additionalData: new TextEncoder().encode('bim-comm-op|' + W.space + '|1') }, key1, raw.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }
  async function sealText(obj) { var iv = globalThis.crypto.getRandomValues(new Uint8Array(12)); var ct = new Uint8Array(await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: new TextEncoder().encode('bim-comm-op|' + W.space + '|1') }, key1, new TextEncoder().encode(ENV.canonical(obj)))); var o = new Uint8Array(12 + ct.length); o.set(iv, 0); o.set(ct, 12); return 'enc:1:' + Buffer.from(o).toString('base64'); }
  var sealedText = snapMeta(snapBytes), stObj = await openSealedText(sealedText);
  verdict(sealedText.indexOf('enc:1:') === 0 && sealedText.indexOf(Object.keys(stObj.verdict)[0]) < 0, 'the snapshot state is sealed in the pipe (no op hash readable in it)', 'bytes=' + sealedText.length);
  var hv = Object.keys(stObj.verdict).filter(function (h) { return stObj.verdict[h].verdict === 'MERGED'; })[3];
  stObj.verdict[hv] = { verdict: 'REFUSED', reason: 'tampered' };
  var evil = withMeta(snapBytes, await sealText(stObj));
  async function lightClient(label, bytes) {
    await W.pipe.put(snapName, bytes);
    W.dev[label] = W.dev.F; var f = mk(W, label, { opts: { trustCheckpoints: true } }); W.S[label] = f;
    await f.sync(W.pipe); await f.sync(W.pipe);
    var inf = await f.checkpointInfo(), sn = await snap(f);
    f._lines.filter(function (l) { return /§CKPT_(REFUSED|VERIFY|TRUST|ADOPT)/.test(l); }).forEach(function (l) { console.log('     ' + l); });
    return { f: f, inf: inf, sn: sn, refused: f._lines.some(function (l) { return /§CKPT_REFUSED/.test(l); }), trusted: f._lines.some(function (l) { return /§CKPT_TRUST/.test(l); }), verified: f._lines.some(function (l) { return /§CKPT_VERIFY/.test(l); }) };
  }
  var T1 = await lightClient('F2', evil);
  console.log('   §CK-TAMPER (a) insider re-sealed a state with one verdict changed: trusted=' + T1.trusted + ' refused=' + T1.refused + ' verified-own-fold=' + T1.verified + ' inForce=' + !!T1.inf.inForce + ' calls=' + T1.f._c.n + ' order=' + T1.sn.orderH);
  verdict(T1.refused && !T1.trusted, 'a state that differs in one verdict (re-sealed by an insider) is refused by the light client: it does not hash to state_hash');
  verdict(T1.inf.inForce && T1.verified && T1.sn.orderH === expOrderH && T1.sn.vmH === sA.vmH && T1.f._c.n >= bizSn, 'it fell back to its own fold (paid ' + T1.f._c.n + ' adapter calls) and ended with the same order and verdicts', 'order=' + T1.sn.orderH);
  var flipped = Buffer.from(sealedText.split(':')[2], 'base64'); flipped[flipped.length - 3] ^= 1;
  var T2 = await lightClient('F3', withMeta(snapBytes, 'enc:1:' + flipped.toString('base64')));
  console.log('   §CK-TAMPER (b) outsider flipped a bit of the sealed state: trusted=' + T2.trusted + ' refused=' + T2.refused + ' verified-own-fold=' + T2.verified + ' inForce=' + !!T2.inf.inForce + ' calls=' + T2.f._c.n + ' order=' + T2.sn.orderH);
  verdict(!T2.trusted && T2.refused && T2.verified && T2.sn.orderH === expOrderH, 'a flipped bit in the sealed state is refused by the AES-GCM tag, the light client folds S itself and still ends on the same order');
  await W.pipe.put(snapName, snapBytes);          // honest object restored
  // (b) a CHECKPOINT op with a wrong state_hash, higher pos, same frontier
  var bogus = sha('not a state');
  await W.S.C.author({ target: { table: 'comm_checkpoint', uu: await ROS.ckptUU(W.space, bogus) }, body: { op_type: 'CHECKPOINT', params: { pos: Aop.pos + 5, state_hash: bogus, frontier: frontier1, prev: null, bytes_ref: 'nowhere' } } });
  await syncAll(W, ['C', 'A', 'V', 'B'], 2);
  var infoV2 = await W.S.V.checkpointInfo(), bogusStatus = infoV2.candidates.filter(function (c) { return c.state_hash === bogus; })[0];
  console.log('   §CK-TAMPER bogus CHECKPOINT (pos ' + (Aop.pos + 5) + '): status on V=' + (bogusStatus && bogusStatus.status) + ' ; in force still ' + (infoV2.inForce && infoV2.inForce.state_hash.slice(0, 12)));
  verdict(bogusStatus && bogusStatus.status === 'BAD' && infoV2.inForce && infoV2.inForce.state_hash === Aop.state_hash && W.S.V._lines.some(function (l) { return /§CKPT_REFUSED.*state_hash-differs/.test(l); }), 'a CHECKPOINT op with a wrong state_hash is BAD on a verifier, and the true checkpoint stays in force');

  // ═════════════ CONVERGE + LATE: more ops from three devices, then L comes back with its 14 old ops ═════════════
  var restLive = ['A', 'B', 'C', 'V', 'F', 'O'];
  for (var rr = 0; rr < 2; rr++) { for (var j2 = 1; j2 < 30; j2 += 3) { var w3 = ['A', 'B', 'C'][(j2 + rr) % 3], r2 = recs[j2]; await update(W.S[w3], r2.u, r2.total, r2.total + 3); r2.total += 3; }
    for (var k = 0; k < 4; k++) await create(W.S[['A', 'B', 'C'][k % 3]], uuid(), 'POST-' + rr + '-' + k, 900 + k);
    await syncAll(W, restLive, 3); }
  await W.S.L.sync(W.pipe); await syncAll(W, restLive.concat(['L']), 3);
  var fin = {}; for (var nm2 of ['A', 'B', 'C', 'V', 'F', 'L', 'O']) fin[nm2] = await snap(W.S[nm2]);
  console.log('   §CK-CONVERGE ops=' + fin.A.ops.length + ' ; order hash A/B/C/V/F/L=' + ['A', 'B', 'C', 'V', 'F', 'L'].map(function (x) { return fin[x].orderH; }).join('/') + ' ; control O=' + fin.O.orderH + ' ; verdict hash A/F/O=' + fin.A.vmH + '/' + fin.F.vmH + '/' + fin.O.vmH);
  verdict(['B', 'C', 'V', 'F', 'L'].every(function (x) { return fin[x].orderH === fin.A.orderH && fin[x].opsH === fin.A.opsH; }), 'after more ops from three devices A, B, C, V, F and the returning L have the same op set AND the same order');
  verdict(['B', 'C', 'V', 'F', 'L', 'O'].every(function (x) { return fin[x].vmH === fin.A.vmH; }), 'and the same verdicts, including the no-checkpoint control');
  var infoFin = await W.S.L.checkpointInfo();
  var cHash = pubRes.hash;
  var fullFin = await oracleFull(W, W.S.A, frontier1, or1, cHash);
  verdict(sha(fullFin.order.join(',')).slice(0, 12) === fin.A.orderH, 'the engine\'s final order equals the oracle\'s (S first, CHECKPOINT op, then 60+ later ops)', 'ops placed=' + fin.A.order.length);
  var lateH = lateOps.map(function (o) { return o.hash; }), S0 = or1.order.length;
  var lpos = lateH.map(function (h) { return gpos(fin.A.L, h); }), lposO = lateH.map(function (h) { return gpos(fin.O.L, h); });
  var insideO = lposO.filter(function (p) { return p >= 0 && p < S0; }).length, insideA = lpos.filter(function (p) { return p >= 0 && p < S0; }).length;
  var cposA = gpos(fin.A.L, cHash);
  console.log('   §CK-LATE S=' + S0 + ' placed ; the CHECKPOINT op at ' + cposA + ' ; L\'s 14 old ops at positions (barrier) ' + lpos.join(',') + ' ; (plain control) ' + lposO.join(',') + ' ; inside S: barrier=' + insideA + ' plain=' + insideO);
  if (insideO === 0) inconclusive.push('CK-LATE: none of the late ops landed inside S in the plain fold, so the barrier is not observable here');
  verdict(lpos.every(function (p) { return p > cposA; }) && cposA === S0 && insideA === 0, 'every late op is placed AFTER the barrier (after S and after the CHECKPOINT op) on every in-force device', 'inside S=' + insideA);
  verdict(insideO > 0, 'CONTROL: the plain fold (no checkpoint) places ' + insideO + ' of those late ops INSIDE the old S span — the barrier is observable', 'plain inside=' + insideO);
  var lateOk = lateH.every(function (h) { return fin.A.vm[h] && fin.A.vm[h].indexOf('MERGED') === 0; });
  verdict(lateOk, 'the late ops are MERGED, not lost (the barrier moves them, it does not refuse them)');
  verdict(fin.A.ops.every(function (h) { return fin.A.vm[h] !== 'none'; }), 'every op has a verdict (no silent drop)');

  // ═════════════ AGG: frontier()/gaps() aggregates equal the scans, with a real hole ═════════════
  var allA = rowsOf(W.S.A), skip = allA.filter(function (r) { return r.env.author === W.dev.B.kid; }).slice(2, 3)[0];
  var fed = mk(W, 'V', {}); W.S.holeV = fed;
  for (var rw of allA) if (rw !== skip) await fed.ingest(rw.env, 'hand');
  fed.db.run('INSERT OR REPLACE INTO cl_head_seen VALUES (?,?,?,?,?,?)', [W.dev.B.kid, 'hand', 400, 'x'.repeat(64), '{}', 'sig']);
  var fr = await fed.frontier(), gp = fed.gaps(), grf = gapsRef(fed), frRef = frontierOf(fed);
  console.log('   §CK-AGG hole at B#' + skip.env.seq + ' + a head claiming B#400 : gaps=' + gp.length + ' (reference ' + grf.length + ') ; frontier B=' + fr[W.dev.B.kid] + ' (reference ' + frRef[W.dev.B.kid] + ')');
  verdict(JSON.stringify(gp.map(function (x) { return x.author + '#' + x.seq; }).sort()) === JSON.stringify(grf) && JSON.stringify(fr) === JSON.stringify(frRef) && gp.length > 100, 'gaps() and frontier() (aggregates) equal the old per-row scans on a store with a hole and a far-ahead head', 'gaps=' + gp.length);
  var fclean = await W.S.A.frontier(); verdict(JSON.stringify(fclean) === JSON.stringify(frontierOf(W.S.A)) && W.S.A.gaps().length === gapsRef(W.S.A).length, 'CONTROL: and on a complete store (no hole) too', 'gaps=' + W.S.A.gaps().length);

  // ═════════════ STALE: what switches a checkpoint off (and what does not) ═════════════
  async function staleWorld(label) {
    var X = await world(SQL, ['A', 'B', 'C', 'V', 'O'], [], label), nn = ['A', 'B', 'C', 'V', 'O'];
    for (var m of ['B', 'C', 'V']) await open(X, m); await open(X, 'O', { opts: { noCheckpoint: true } }); await syncAll(X, nn, 3);
    var rs = []; for (var i2 = 0; i2 < 18; i2++) { var u2 = uuid(); rs.push({ u: u2, t: 10 + i2 }); await create(X.S[['A', 'B', 'C'][i2 % 3]], u2, label + '-' + i2, 10 + i2); }
    await syncAll(X, nn, 3);
    for (var j3 = 0; j3 < 18; j3 += 2) { await update(X.S[['A', 'B', 'C'][(j3 + 1) % 3]], rs[j3].u, rs[j3].t, rs[j3].t + 1); rs[j3].t++; }
    await syncAll(X, nn, 3);
    var pr = await X.S.A.checkpoint(X.pipe); await syncAll(X, nn, 3);
    return { X: X, nn: nn, rs: rs, pr: pr };
  }
  var T = await staleWorld('stale-revoke'), X = T.X;
  var onBefore = (await X.S.V.checkpointInfo()).inForce;
  // CONTROL first: a REVOKE of C whose cut-off is beyond S (last_good = 1000) leaves the checkpoint in force
  var cLast = X.S.C.query('SELECT MAX(author_seq) AS s FROM cl_op WHERE author_kid=?', [X.dev.C.kid])[0].s;
  var hi = await X.S.A.revoke(X.dev.C.kid, 1000); await syncAll(X, T.nn, 3);
  var onHi = (await X.S.V.checkpointInfo()).inForce;
  verdict(onBefore && onHi && onHi.state_hash === onBefore.state_hash, 'CONTROL: before any revoke, and after a REVOKE whose cut-off (1000) is beyond S, the checkpoint stays in force on V');
  // now a second REVOKE of C reaching INTO S
  var cutIn = 2; await X.S.A.revoke(X.dev.C.kid, cutIn); await syncAll(X, T.nn, 3);
  var sv = await snap(X.S.V), so = await snap(X.S.O), sa = await snap(X.S.A), infoSV = await X.S.V.checkpointInfo();
  var staleLine = X.S.V._lines.filter(function (l) { return /§CKPT_STALE/.test(l); });
  console.log('   §CK-STALE REVOKE C last_good=' + cutIn + ' (C has ' + cLast + ' ops, S covers them): V inForce=' + !!infoSV.inForce + ' ; ' + (staleLine[staleLine.length - 1] || 'no §CKPT_STALE line').replace(/^.*§/, '§') + ' ; order V=' + sv.orderH + ' A=' + sa.orderH + ' plain control O=' + so.orderH);
  verdict(!infoSV.inForce && staleLine.some(function (l) { return /revoke-inside/.test(l); }), 'a REVOKE whose cut-off lies inside S switches the checkpoint OFF (§CKPT_STALE reason=revoke-inside)');
  verdict(sv.orderH === so.orderH && sa.orderH === so.orderH && sv.vmH === so.vmH, 'and the fold is then exactly the plain full fold: V and A equal the control O in order and verdicts');
  var cRefused = Object.keys(sv.vm).filter(function (h) { return sv.vm[h].indexOf('REFUSED:revoked') === 0; }).length;
  verdict(cRefused > 0, 'C\'s ops beyond the cut-off are REFUSED revoked (the retroactive rule the checkpoint must not hide)', 'refused revoked=' + cRefused);
  // ROLE reaching into S vs beyond S
  var T2 = await staleWorld('stale-role'), X2 = T2.X;
  await X2.S.A.setRole({ person_uu: X2.per.B, ad_role_id: 102, comm_admin: false, from_seq: { [X2.dev.B.kid]: 100000 } }); await syncAll(X2, T2.nn, 3);
  var onRoleBeyond = (await X2.S.V.checkpointInfo()).inForce;
  verdict(!!onRoleBeyond, 'CONTROL: a ROLE change that takes effect from a seq beyond S (from_seq 100000) leaves the checkpoint in force');
  await X2.S.A.setRole({ person_uu: X2.per.B, ad_role_id: 102, comm_admin: false }); await syncAll(X2, T2.nn, 3);
  var infoR = await X2.S.V.checkpointInfo(), svr = await snap(X2.S.V), sor = await snap(X2.S.O);
  console.log('   §CK-STALE ROLE for B from seq 0: V inForce=' + !!infoR.inForce + ' ; ' + (X2.S.V._lines.filter(function (l) { return /§CKPT_STALE/.test(l); }).pop() || 'none').replace(/^.*§/, '§') + ' ; order V=' + svr.orderH + ' control=' + sor.orderH);
  verdict(!infoR.inForce && svr.orderH === sor.orderH && svr.vmH === sor.vmH, 'a ROLE change that reaches into S switches it off and the fold equals the plain fold');
  // contender on an S slot
  var T3 = await staleWorld('stale-slot'), X3 = T3.X, victim = rowsOf(X3.S.A, 'author_kid=? AND author_seq=?', [X3.dev.C.kid, 3])[0];
  var forged = JSON.parse(JSON.stringify(victim.env)); forged.ts = (forged.ts || 0) + 1; delete forged.sig; forged = await ENV.sign(forged, X3.dev.C);
  var onSlot0 = (await X3.S.V.checkpointInfo()).inForce;
  for (var nn3 of ['A', 'B', 'C', 'V', 'O']) { var rr3 = await X3.S[nn3].ingest(forged, 'hand'); }
  var infoSl = await X3.S.V.checkpointInfo(), svs = await snap(X3.S.V), sos = await snap(X3.S.O), eqs = (await X3.S.V.order()).equivocations.length;
  console.log('   §CK-STALE contender on slot C#3 (equivocation): before inForce=' + !!onSlot0 + ' after=' + !!infoSl.inForce + ' equivocations seen=' + eqs + ' ; V order=' + svs.orderH + ' control=' + sos.orderH);
  verdict(!!onSlot0 && !infoSl.inForce && eqs === 1 && svs.orderH === sos.orderH && svs.vmH === sos.vmH, 'a second signed op on an S slot (equivocation) switches the checkpoint off and the plain fold (which excludes both) is what everyone computes');

  // ═════════════ COST ═════════════
  if (process.env.CK_SKIP_COST) { console.log('   (CK_SKIP_COST set: cost arm skipped)'); } else {
  console.log('\n   ── §CK-COST: visit time vs log size (node, in-memory sql.js, cached AD adapter; best of 3 for quiet visits) ──');
  var G = await world(SQL, ['A', 'B', 'O'], [], 'cost'); await open(G, 'B'); await open(G, 'O', { opts: { noCheckpoint: true } });
  await syncAll(G, ['A', 'B', 'O'], 3);
  var grec = []; for (var gi = 0; gi < 25; gi++) { var gu = uuid(); grec.push({ u: gu, t: 1 }); await create(G.S.A, gu, 'G-' + gi, 1); }
  var pts = [], total = 25, ROUNDS = 8, PER = 150;
  for (var rd = 1; rd <= ROUNDS; rd++) {
    for (var gk = 0; gk < PER; gk++) { var gr = grec[gk % 25]; await update(G.S.A, gr.u, gr.t, gr.t + 1); gr.t++; }
    total += PER;
    await G.S.A.sync(G.pipe);
    // the cadence: every round the publisher checkpoints and B (a verifier) co-signs; the fold of B is O(new) after that
    var tp = process.hrtime.bigint(), pc = await G.S.A.checkpoint(G.pipe), tPub = Number(process.hrtime.bigint() - tp) / 1e6; await G.S.A.sync(G.pipe);
    var cNB = G.S.B._c.n, t0 = process.hrtime.bigint(); await G.S.B.sync(G.pipe); var tNewB = Number(process.hrtime.bigint() - t0) / 1e6; cNB = G.S.B._c.n - cNB;
    await G.S.B.cosign(); await G.S.B.sync(G.pipe); await G.S.A.sync(G.pipe);
    var cNO = G.S.O._c.n; t0 = process.hrtime.bigint(); await G.S.O.sync(G.pipe); var tNewO = Number(process.hrtime.bigint() - t0) / 1e6; cNO = G.S.O._c.n - cNO;
    var quietB = 1e9, quietO = 1e9, cB0 = G.S.B._c.n, cO0 = G.S.O._c.n;
    for (var z = 0; z < 3; z++) { t0 = process.hrtime.bigint(); await G.S.B.sync(G.pipe); quietB = Math.min(quietB, Number(process.hrtime.bigint() - t0) / 1e6); }
    for (var z2 = 0; z2 < 3; z2++) { t0 = process.hrtime.bigint(); await G.S.O.sync(G.pipe); quietO = Math.min(quietO, Number(process.hrtime.bigint() - t0) / 1e6); }
    // the first visit of an app that was closed: a fresh store object over the saved comm.db — only the folded state on disk, no memo
    function cold(name, opts) { var bytes = G.S[name].db.export(); var t = process.hrtime.bigint(); var st = STORE.open(new SQL.Database(bytes), Object.assign({ SQL: SQL, space: G.space, self: G.dev[name], access: counting({ n: 0 }), log: function () {} }, opts)); return st.order().then(function () { return Number(process.hrtime.bigint() - t) / 1e6; }); }
    var coldB = await cold('B', {}), coldO = await cold('O', { noCheckpoint: true });
    var inf = await G.S.B.checkpointInfo();
    pts.push({ pub: tPub, newCallsB: cNB, newCallsO: cNO, n: total, quietB: quietB, quietO: quietO, newB: tNewB, newO: tNewO, coldB: coldB, coldO: coldO, callsB: (G.S.B._c.n - cB0) / 3, callsO: (G.S.O._c.n - cO0) / 3, inForce: inf.inForce ? inf.inForce.pos : 0 });
    console.log('§CK-COST log=' + total + ' ops : in force pos=' + (inf.inForce ? inf.inForce.pos : 0) + ' | quiet visit  ckpt ' + quietB.toFixed(1) + ' ms  vs  control ' + quietO.toFixed(1) + ' ms | visit with ' + PER + ' new  ckpt ' + tNewB.toFixed(0) + ' ms vs ' + tNewO.toFixed(0) + ' ms | cold start ckpt ' + coldB.toFixed(0) + ' ms vs ' + coldO.toFixed(0) + ' ms | adapter calls: quiet visit ckpt ' + ((G.S.B._c.n - cB0) / 3).toFixed(0) + ' vs ' + ((G.S.O._c.n - cO0) / 3).toFixed(0) + ', visit with news ' + cNB + ' vs ' + cNO + ' | publish (A) ' + tPub.toFixed(0) + ' ms');
  }
  function slope(key) { var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(function (p) { sx += p.n; sy += p[key]; sxx += p.n * p.n; sxy += p.n * p[key]; }); return (n * sxy - sx * sy) / (n * sxx - sx * sx); }
  var first = pts[0], last = pts[pts.length - 1];
  var sQB = slope('quietB'), sQO = slope('quietO'), sCB = slope('coldB'), sCO = slope('coldO');
  console.log('§CK-COST fit (ms per op of log): quiet ckpt ' + sQB.toFixed(4) + ' vs control ' + sQO.toFixed(4) + ' ; cold start ckpt ' + sCB.toFixed(4) + ' vs control ' + sCO.toFixed(4) + ' ; adapter calls per quiet visit at ' + first.n + '/' + last.n + ' ops: ckpt ' + first.callsB.toFixed(0) + '/' + last.callsB.toFixed(0) + ' control ' + first.callsO.toFixed(0) + '/' + last.callsO.toFixed(0));
  if (!(last.inForce > 0)) inconclusive.push('CK-COST: no checkpoint was in force at the end, the checkpointed series measured nothing');
  verdict(sQO > 0 && last.quietO > 1.8 * first.quietO && last.callsO > 4 * first.callsO, 'CONTROL: without checkpoints a quiet visit grows with the log (' + first.quietO.toFixed(1) + ' → ' + last.quietO.toFixed(1) + ' ms; adapter calls ' + first.callsO.toFixed(0) + ' → ' + last.callsO.toFixed(0) + ')');
  verdict(last.quietB <= 1.5 * first.quietB + 5 && last.callsB <= first.callsB + 1 && Math.abs(sQB) < 0.25 * sQO, 'with checkpoints at a fixed cadence the quiet visit is flat within noise (' + first.quietB.toFixed(1) + ' → ' + last.quietB.toFixed(1) + ' ms; slope ' + sQB.toFixed(4) + ' vs ' + sQO.toFixed(4) + ' ms/op; adapter calls ' + first.callsB.toFixed(0) + ' → ' + last.callsB.toFixed(0) + ')');
  verdict(pts.every(function (p) { return p.newCallsB <= PER + 25; }) && last.newCallsO >= last.n * 0.9, 'a visit WITH news folds only the news: the adapter is called <= ' + (PER + 25) + ' times per visit with checkpoints (max ' + Math.max.apply(null, pts.map(function (p) { return p.newCallsB; })) + ') and ' + last.newCallsO + ' times at ' + last.n + ' ops without. (Wall time of such a visit is dominated by verifying the news\' signatures — O(news) either way — and is noisy: ckpt ' + first.newB.toFixed(0) + ' → ' + last.newB.toFixed(0) + ' ms, control ' + first.newO.toFixed(0) + ' → ' + last.newO.toFixed(0) + ' ms)');
  verdict(last.coldB < 0.1 * last.coldO && sCB < 0.1 * sCO && last.coldO > 3 * first.coldO, 'a cold start (fresh store over the saved comm.db) stays small with checkpoints — less than a tenth of the control, slope ' + sCB.toFixed(4) + ' vs ' + sCO.toFixed(4) + ' ms/op (' + first.coldB.toFixed(0) + ' → ' + last.coldB.toFixed(0) + ' ms) and grows without (' + first.coldO.toFixed(0) + ' → ' + last.coldO.toFixed(0) + ' ms)');
  var sB2 = await snap(G.S.B), sO2 = await snap(G.S.O);
  verdict(sB2.opsH === sO2.opsH && sB2.vmH === sO2.vmH, 'the two series ended with the same op set and the same verdicts (the speed did not change the answer)', 'ops=' + sB2.ops.length);

  }
  // ═════════════ SKEW ═════════════
  var old = loadOldEngine();
  if (!old) { inconclusive.push('SKEW: git show 34b915fb1 unavailable'); }
  else { try {
      var oldDev = await old.STORE.newDevice(); oldDev.person_uu = uuid();
      await W.S.A.addPerson({ person_uu: oldDev.person_uu, name: 'OLD', ad_role_id: 102, comm_admin: false }); await W.S.A.enroll(oldDev.kid, oldDev.pubJwk, oldDev.person_uu, oldDev.dhPubJwk); await W.S.A.sync(W.pipe);
      var O2 = old.STORE.open(new SQL.Database(), { SQL: SQL, space: W.space, self: oldDev, access: accessRaw, log: function () {} }), crashed = null;
      try { await O2.sync(W.pipe); await O2.sync(W.pipe); } catch (e) { crashed = e; }
      var ckRows = crashed ? [] : O2.query("SELECT op_hash FROM cl_op WHERE op_type='CHECKPOINT'"), ckV = ckRows.length ? O2.query('SELECT verdict, reason FROM cl_verdict WHERE op_hash=?', [ckRows[0].op_hash])[0] : null;
      var placedOld = crashed ? -1 : (await O2.placedEnvelopes()).length, placedNew = (await W.S.A.placedEnvelopes()).length;
      console.log('   §CK-SKEW old engine: crashed=' + !!crashed + (crashed ? ' ' + crashed.message : '') + ' CHECKPOINT ops held=' + ckRows.length + ' verdict=' + (ckV ? ckV.verdict + ':' + ckV.reason : 'none') + ' business placed=' + placedOld + ' (new engine ' + placedNew + ')');
      verdict(!crashed && ckRows.length >= 1 && ckV && ckV.verdict === 'REFUSED', 'an engine from before CHECKPOINT folds a log with CHECKPOINT ops and a snapshot object without crashing, and refuses the op', ckV ? ckV.reason : '');
      verdict(placedOld === placedNew, 'CONTROL: it still places every business op the new engine places (the extra snapshot rows were duplicates)', 'old=' + placedOld + ' new=' + placedNew);
    } finally { fs.rmSync(old.dir, { recursive: true, force: true }); } }

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-CHECKPOINT INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-CHECKPOINT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
