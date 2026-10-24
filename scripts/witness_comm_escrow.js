#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_escrow.js — W-ESCROW. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.J.1 + §13.12.J.3 (ESCROW: a guarded quantity split into slices owned by desks).
 * Real modules: build/comm/* (or $COMM_DIR for a mutated copy) on real sql.js + WebCrypto in an ENCRYPTED space; desks come from the POLICY `desks` map.
 *
 *   §ES-OPEN       — an admin opens a resource; a non-admin OPEN is REFUSED escrow-not-admin; a second OPEN escrow-exists; a malformed one bad-escrow:slices. Controls: the admin's OPEN is MERGED.
 *   §ES-USE        — a desk uses its slice down to exactly 0 (boundary control: admitted); one more is REFUSED escrow-exceeded on EVERY device, identically.
 *   §ES-OWNER      — a device that does not serve the desk is REFUSED escrow-not-owner (control: the owner is MERGED); unknown resource / unknown desk have their own reasons.
 *   §ES-TRANSFER   — a desk with 0 cannot use; after a TRANSFER it can (and not beyond it); a transfer above available, or from a desk you do not serve, is refused. conserved is computed.
 *   §ES-CAUSAL     — a USE concurrent with the transfer that would have covered it is REFUSED on every device (it is judged on what its author had seen); the same USE after a visit is MERGED.
 *   §ES-DUPDOC     — a second USE naming the same document is REFUSED escrow-duplicate-doc (control: another document is MERGED).
 *   §ES-SAMEPERSON — one person's two devices serving one desk, racing: causal tests both pass, the RUNNING test lets exactly one through, available never goes below 0.
 *   §ES-PERMUTE    — the same ops in 20 random arrival orders give one state hash (verdicts + escrow state) on a fresh store each time.
 *   §ES-CHECKPOINT — escrow state rides in the snapshot (names hashed, key written only when used); a light client that never folded S judges a later over-draw correctly.
 *   §ES-OPAQUE     — the resource name is not in the pipe bytes of an encrypted space (control: it is in a plaintext space).
 *   §ES-NOESCROW   — a space that never used escrow has no escrow key in its checkpoint state and escrowState() is null (additive).
 *   §ES-SKEW       — an engine from before this change folds a log with escrow ops without crashing and refuses them.
 *
 * Run: node scripts/witness_comm_escrow.js 2>&1 | tee build/comm/logs/witness_comm_escrow.log      Mutation: COMM_DIR=<mutated copy of build/comm> (scripts/witness_comm_escrow_mutate.sh)
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), cp = require('child_process');
var initSqlJs = require('sql.js');
var B = process.env.COMM_DIR ? path.resolve(process.env.COMM_DIR) : path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ENV = require(path.join(B, 'comm_envelope.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {}, tcache = {};
function accessRaw(roleId, client, org, table) {
  var t = tcache[table]; if (t === undefined) t = tcache[table] = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase()) || null;
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var uuid = function () { return nodeCrypto.randomUUID(); };
function sha(s) { return nodeCrypto.createHash('sha256').update(s).digest('hex'); }
function vOf(L, h) { var v = L.verdict[h]; return v ? v.verdict + ':' + (v.reason || '') : 'none'; }

function mk(W, name, o) {
  var st = STORE.open(new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[name], access: accessRaw, log: function () {} }, o || {})); W.S[name] = st; return st;
}
// names[0] is the founder/admin; samePerson = { P2: 'P1' } enrols P2 under P1's person
async function world(SQL, names, label, plain, samePerson) {
  var W = { SQL: SQL, dev: {}, per: {}, S: {}, pipe: PIPE.memPipe(label) };
  samePerson = samePerson || {};
  for (var n of names) { W.dev[n] = await STORE.newDevice(); if (plain) { delete W.dev[n].dhPubJwk; delete W.dev[n].dhPrivateKey; }
    W.per[n] = samePerson[n] ? W.per[samePerson[n]] : uuid(); W.dev[n].person_uu = W.per[n]; }
  var sp = await STORE.newSpace('es-' + label, W.dev[names[0]], W.per[names[0]], names[0], 102); W.space = sp.space;
  mk(W, names[0]); await W.S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) {
    if (!samePerson[k]) await W.S[names[0]].addPerson({ person_uu: W.per[k], name: k, ad_role_id: 102, comm_admin: false });
    await W.S[names[0]].enroll(W.dev[k].kid, W.dev[k].pubJwk, W.per[k], W.dev[k].dhPubJwk); }
  for (var m of names.slice(1)) mk(W, m, m === 'O' ? { noCheckpoint: true } : {});
  return W;
}
async function syncAll(W, names, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var n of names) await W.S[n].sync(W.pipe); }
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
async function scan(pipe, needles) { var names = await pipe.list(''), hits = 0, objs = 0; for (var n of names) { var b = await pipe.get(n); if (!b) continue; objs++; var t = Buffer.from(b).toString('latin1'); needles.forEach(function (nd) { if (t.indexOf(nd) >= 0) hits++; }); } return { hits: hits, objects: objs }; }
// the verdict map + escrow state of a store, as one hash (what "the same everywhere" means here)
async function stateHash(S, resources) {
  var L = await S.order(), vs = Object.keys(L.verdict).sort().map(function (h) { return h + ':' + L.verdict[h].verdict + ':' + (L.verdict[h].reason || ''); }), es = {};
  for (var r of resources) es[r] = await S.escrowState(r);
  return sha(ENV.canonical({ v: vs, e: es, o: L.order }));
}
async function snapState(W, S, pubOp) {            // open the (sealed) state of a checkpoint snapshot with A's epoch key
  var sb = new W.SQL.Database(await W.pipe.get(pubOp.name)), tx = sb.exec("SELECT v FROM meta WHERE k='state'")[0].values[0][0]; sb.close();
  if (tx.indexOf('enc:') !== 0) return { text: tx, state: JSON.parse(tx) };
  var k = (await S.keyring())[1][0], raw = Buffer.from(tx.split(':')[2], 'base64');
  var pt = new TextDecoder().decode(await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12), additionalData: new TextEncoder().encode('bim-comm-op|' + W.space + '|1') }, k, raw.slice(12)));
  return { text: pt, state: JSON.parse(pt) };
}

(async function () {
  console.log('═══ W-ESCROW — bounded counters: a desk spends only its own slice, so "never below zero" needs no coordination (TEAMWORK_FRAMEWORK §13.12.J) ═══');
  if (process.env.COMM_DIR) console.log('   [engine under test: COMM_DIR=' + B + ']');
  var SQL = await initSqlJs();
  var names = ['A', 'B', 'C', 'P1', 'P2', 'V', 'O'], W = await world(SQL, names, 'main', false, { P2: 'P1' });
  var all = names, S = W.S;
  await S.A.setPolicy({ epoch: 1, desks: { dA: W.dev.A.kid, dB: W.dev.B.kid, dC: W.dev.C.kid, dP: W.per.P1 } });
  await syncAll(W, all, 3);
  var verdictsAt = async function (h) { var out = []; for (var d of all) out.push(vOf(await S[d].order(), h)); return out; };
  var sameEverywhere = async function (h, want) { var v = await verdictsAt(h); return v.every(function (x) { return x === v[0]; }) && (!want || v[0] === want) ? v[0] : null; };
  var judgeOne = async function (label, op, want, extra) { var v = await sameEverywhere(op.hash, want); verdict(v !== null, label, (v || (await verdictsAt(op.hash)).join(' / ')) + (extra ? ' ; ' + extra : '')); return v; };

  // ════════ OPEN ════════
  var R1 = 'stock:widget@L1';
  var oBad = await S.B.escrowOpen('stock:forged', { dB: 100 });                       // non-admin
  var oOk = await S.A.escrowOpen(R1, { dA: 5, dB: 3, dC: 0 });                         // the admin
  var oBadSl = await S.A.escrowOpen('stock:badslices', {});                            // empty slices
  await syncAll(W, all, 3);
  var oTwice = await S.A.escrowOpen(R1, { dA: 99 });                                   // after the first is placed
  await syncAll(W, all, 3);
  await judgeOne('CONTROL: the admin\'s OPEN is MERGED on all seven devices', oOk, 'MERGED:escrow');
  await judgeOne('a non-admin OPEN is REFUSED escrow-not-admin, the same on every device', oBad, 'REFUSED:escrow-not-admin');
  await judgeOne('a second OPEN of the same resource is REFUSED escrow-exists', oTwice, 'REFUSED:escrow-exists');
  await judgeOne('an OPEN with no slices is REFUSED bad-escrow:slices', oBadSl, 'REFUSED:bad-escrow:slices');
  var st0 = await S.V.escrowState(R1);
  console.log('   §ES-OPEN ' + R1 + ' -> ' + JSON.stringify(st0) + ' ; forged resource open? ' + ((await S.V.escrowState('stock:forged')) ? 'YES' : 'no'));
  verdict(st0 && st0.total === 8 && st0.conserved && st0.desks.dA.available === 5 && (await S.V.escrowState('stock:forged')) === null, 'the folded state is the OPEN\'s slices (total 8, conserved) and the refused OPEN left no resource behind');

  // ════════ USE (boundary) ════════
  var u1 = await S.A.escrowUse(R1, 'dA', 3, 'doc-001');
  await S.A.sync(W.pipe); await syncAll(W, all, 2);
  var u2 = await S.A.escrowUse(R1, 'dA', 3, 'doc-002');                                // available 2 -> over-draw by 1
  var u3 = await S.A.escrowUse(R1, 'dA', 2, 'doc-003');                                // exactly the rest
  var u4 = await S.A.escrowUse(R1, 'dA', 1, 'doc-004');                                // slice is now 0
  await syncAll(W, all, 3);
  var overs = 0, refusedEverywhere = 0;
  for (var oo of [u2, u4]) { overs++; var vv = await sameEverywhere(oo.hash, 'REFUSED:escrow-exceeded'); if (vv) refusedEverywhere++; }
  console.log('   §ES-USE over-draw attempts=' + overs + ' refused escrow-exceeded on all 7 devices=' + refusedEverywhere + ' ; dA state ' + JSON.stringify((await S.V.escrowState(R1)).desks.dA));
  if (!overs) inconclusive.push('ES-USE: no over-draw was attempted');
  verdict(refusedEverywhere === overs && overs === 2, 'both over-draws (3 > 2 available, and 1 > 0 available) are REFUSED escrow-exceeded on every device');
  await judgeOne('CONTROL: using exactly what is left (2 of 2) is MERGED — the boundary is not a blanket refusal', u3, 'MERGED:escrow');
  await judgeOne('CONTROL: the first use (3 of 5) is MERGED', u1, 'MERGED:escrow');
  var dA1 = (await S.V.escrowState(R1)).desks.dA;
  verdict(dA1.used === 5 && dA1.available === 0 && dA1.slice === 5, 'dA ended with used=5 available=0 — never negative', JSON.stringify(dA1));

  // ════════ OWNER / UNKNOWN ════════
  var nOwn = await S.B.escrowUse(R1, 'dA', 1, 'doc-own-1');                            // B does not serve dA
  var okOwn = await S.B.escrowUse(R1, 'dB', 1, 'doc-own-2');                           // CONTROL: B serves dB
  var nRes = await S.B.escrowUse('stock:never-opened', 'dB', 1, 'doc-x');
  var nDesk = await S.B.escrowUse(R1, 'dZ', 1, 'doc-y');
  await syncAll(W, all, 3);
  await judgeOne('a device that does not serve the desk is REFUSED escrow-not-owner', nOwn, 'REFUSED:escrow-not-owner');
  await judgeOne('CONTROL: the owner of dB using dB is MERGED', okOwn, 'MERGED:escrow');
  await judgeOne('a USE on a resource nobody opened is REFUSED escrow-unknown', nRes, 'REFUSED:escrow-unknown');
  await judgeOne('a USE on a desk the resource does not have is REFUSED escrow-unknown-desk', nDesk, 'REFUSED:escrow-unknown-desk');

  // ════════ OPEN IN THE CAUSAL PAST ════════
  // A spend by a device that has not seen the OPEN is escrow-unknown whatever the fold order: the case that matters is the one where the OPEN sorts BEFORE the use (an engine without
  // the test would admit it with a full slice), so several trials are run and the number with the OPEN first is printed.
  var unk = [], opensFirst = 0;
  for (var ui = 0; ui < 8; ui++) { var RU = 'stock:unseen-' + ui + '@L6', oU = await S.A.escrowOpen(RU, { dB: 3 }), uU = await S.B.escrowUse(RU, 'dB', 1, 'doc-u-' + ui); unk.push({ RU: RU, oU: oU, uU: uU }); if (oU.hash < uU.hash) opensFirst++; }
  await syncAll(W, all, 3);
  var unkOk = 0; for (var uk of unk) if (await sameEverywhere(uk.uU.hash, 'REFUSED:escrow-unknown')) unkOk++;
  console.log('   §ES-UNSEEN trials=' + unk.length + ' ; the OPEN sorted before the use in ' + opensFirst + ' ; use REFUSED escrow-unknown identically on all 7 devices in ' + unkOk);
  if (!opensFirst) inconclusive.push('ES-UNSEEN: the OPEN never sorted before the use, so a missing causal-past test would not show');
  verdict(unkOk === unk.length && opensFirst >= 1, 'a USE authored by a device that had not seen the OPEN is REFUSED escrow-unknown on every device, even when the OPEN sorts before it', opensFirst + ' trial(s) with the OPEN first');
  var uAfter = await S.B.escrowUse(unk[0].RU, 'dB', 1, 'doc-u-after'); await syncAll(W, all, 3);
  await judgeOne('CONTROL: the same device, once it has seen the OPEN, spends from that resource: MERGED', uAfter, 'MERGED:escrow');

  // ════════ TRANSFER ════════
  var c0 = await S.C.escrowUse(R1, 'dC', 1, 'doc-c0');                                 // dC has 0: refused BEFORE the transfer (control for what follows)
  var tr1 = await S.B.escrowTransfer(R1, 'dB', 'dC', 2);                               // dB has 2 left (3-1): all of it goes to dC
  await syncAll(W, all, 3);
  var c1 = await S.C.escrowUse(R1, 'dC', 2, 'doc-c1');                                 // after C has seen the transfer
  await S.C.sync(W.pipe);
  var c2 = await S.C.escrowUse(R1, 'dC', 1, 'doc-c2');                                 // beyond it
  var trBig = await S.B.escrowTransfer(R1, 'dB', 'dC', 5);                             // transfer above available (dB has 0 now)
  var trNot = await S.A.escrowTransfer(R1, 'dB', 'dA', 1);                             // A does not serve dB
  await syncAll(W, all, 3);
  await judgeOne('CONTROL for the transfer: dC with 0 cannot use anything before it is given some', c0, 'REFUSED:escrow-exceeded');
  await judgeOne('dB\'s TRANSFER of 2 to dC (it had 2) is MERGED', tr1, 'MERGED:escrow');
  await judgeOne('dC then uses the 2 it was given: MERGED', c1, 'MERGED:escrow');
  await judgeOne('dC cannot use a 3rd unit (only 2 were given): REFUSED escrow-exceeded', c2, 'REFUSED:escrow-exceeded');
  await judgeOne('a TRANSFER above what dB has is REFUSED escrow-exceeded', trBig, 'REFUSED:escrow-exceeded');
  await judgeOne('a TRANSFER from a desk the author does not serve is REFUSED escrow-not-owner', trNot, 'REFUSED:escrow-not-owner');
  var fin = await S.V.escrowState(R1), exp = { dA: { slice: 5, used: 5, in: 0, out: 0, available: 0 }, dB: { slice: 3, used: 1, in: 0, out: 2, available: 0 }, dC: { slice: 0, used: 2, in: 2, out: 0, available: 0 } };
  console.log('   §ES-TRANSFER final ' + JSON.stringify(fin));
  verdict(JSON.stringify(fin.desks) === JSON.stringify(exp) && fin.total === 8 && fin.conserved, 'final per-desk numbers equal the hand-computed ones, total 8, conserved (sum available 0 + sum used 8 = 8)');
  var fins = []; for (var dv of all) fins.push(JSON.stringify(await S[dv].escrowState(R1)));
  verdict(fins.every(function (x) { return x === fins[0]; }), 'all seven devices (including the no-checkpoint control) hold the identical escrow state');

  // ════════ CAUSAL ════════
  // The use is judged on what its author had seen. The case that tells the causal test from the running view is the one where the transfer SORTS BEFORE the
  // use in fold order (the running view would admit it); fold order is by hash, so trials are repeated until one is found.
  var trials = [], before = 0, after = 0, refusedAll = 0, cu = null;
  for (var ti = 0; ti < 30 && (before < 2 || after < 1); ti++) {
    var RC = 'stock:causal-' + ti + '@L2';
    await S.A.escrowOpen(RC, { dB: 2, dC: 0 }); await syncAll(W, all, 3);
    var trc = await S.B.escrowTransfer(RC, 'dB', 'dC', 1);                                // C has NOT seen this when it uses
    cu = await S.C.escrowUse(RC, 'dC', 1, 'doc-causal-' + ti);
    var conc = cu.env.deps.indexOf(trc.hash) < 0 && trc.env.deps.indexOf(cu.hash) < 0;
    await syncAll(W, all, 3);
    var tFirst = trc.hash < cu.hash, vAll = await verdictsAt(cu.hash);
    trials.push({ RC: RC, conc: conc, tFirst: tFirst, verdict: vAll[0], same: vAll.every(function (x) { return x === vAll[0]; }), trc: trc, cu: cu });
    if (tFirst) before++; else after++;
  }
  var okTrials = trials.filter(function (t) { return t.conc && t.same && t.verdict === 'REFUSED:escrow-exceeded'; }).length;
  console.log('   §ES-CAUSAL trials=' + trials.length + ' concurrent=' + trials.filter(function (t) { return t.conc; }).length + ' ; transfer sorted BEFORE the use in ' + before + ', AFTER in ' + after + ' ; use REFUSED escrow-exceeded identically on all 7 devices in ' + okTrials);
  if (!before) inconclusive.push('ES-CAUSAL: no trial had the transfer sort before the use, so causal and running views are not told apart');
  verdict(okTrials === trials.length && before >= 1, 'a USE concurrent with the transfer that would have covered it is REFUSED escrow-exceeded on every device even when that transfer sorts BEFORE it in fold order — judged on what its author had seen, not on the running balance', before + ' trial(s) with the transfer first');
  var lastT = trials[trials.length - 1], cu2 = await S.C.escrowUse(lastT.RC, 'dC', 1, 'doc-causal-after');                // now C has seen the transfer
  await syncAll(W, all, 3);
  await judgeOne('CONTROL: the same use authored after a visit that brought the transfer is MERGED', cu2, 'MERGED:escrow');

  // ════════ DUPLICATE DOC ════════
  var R3 = 'stock:dupdoc@L3';
  await S.A.escrowOpen(R3, { dA: 10 }); await syncAll(W, all, 3);
  var d1 = await S.A.escrowUse(R3, 'dA', 1, 'DOC-X'), d2 = await S.A.escrowUse(R3, 'dA', 1, 'DOC-X'), d3 = await S.A.escrowUse(R3, 'dA', 1, 'DOC-Y');
  await syncAll(W, all, 3);
  await judgeOne('the first USE naming DOC-X is MERGED', d1, 'MERGED:escrow');
  await judgeOne('a second USE naming DOC-X is REFUSED escrow-duplicate-doc', d2, 'REFUSED:escrow-duplicate-doc');
  await judgeOne('CONTROL: a USE naming another document is MERGED', d3, 'MERGED:escrow');
  var s3 = await S.V.escrowState(R3);
  verdict(s3.desks.dA.used === 2 && s3.desks.dA.available === 8, 'the duplicate consumed nothing (used 2 of 10, not 3)', JSON.stringify(s3.desks.dA));

  // ════════ SAME PERSON, TWO DEVICES ════════
  var R4 = 'stock:person@L4';
  await S.A.escrowOpen(R4, { dP: 3 }); await syncAll(W, all, 3);
  var p1 = await S.P1.escrowUse(R4, 'dP', 2, 'doc-p1'), p2 = await S.P2.escrowUse(R4, 'dP', 2, 'doc-p2');       // each passes its own causal test (2 <= 3); together 4 > 3
  var pc = p1.env.deps.indexOf(p2.hash) < 0 && p2.env.deps.indexOf(p1.hash) < 0;
  await syncAll(W, all, 3);
  var Lp = await S.V.order(), pv1 = vOf(Lp, p1.hash), pv2 = vOf(Lp, p2.hash), sP = await S.V.escrowState(R4);
  console.log('   §ES-SAMEPERSON concurrent=' + pc + ' ; P1 ' + pv1 + ' ; P2 ' + pv2 + ' ; state ' + JSON.stringify(sP.desks.dP));
  if (!pc) inconclusive.push('ES-SAMEPERSON: the two uses were not concurrent');
  verdict(pc && [pv1, pv2].filter(function (x) { return x.indexOf('MERGED') === 0; }).length === 1 && [pv1, pv2].some(function (x) { return x === 'REFUSED:escrow-exceeded'; }), 'two devices of one person using the same desk at once: exactly ONE use stands, the other is REFUSED escrow-exceeded (the running test)');
  verdict(sP.desks.dP.available >= 0 && sP.desks.dP.used <= 3, 'the desk never went below zero', 'used=' + sP.desks.dP.used + ' available=' + sP.desks.dP.available);
  var pvs = []; for (var dp of all) { var Lq = await S[dp].order(); pvs.push([vOf(Lq, p1.hash), vOf(Lq, p2.hash)].join('|')); }
  verdict(pvs.every(function (x) { return x === pvs[0]; }), 'all seven devices agree which of the two stands', pvs[0]);
  var R4b = 'stock:person2@L4b'; await S.A.escrowOpen(R4b, { dP: 3 }); await syncAll(W, all, 3);
  var r1 = await S.P1.escrowUse(R4b, 'dP', 1, 'doc-r1'), r2 = await S.P2.escrowUse(R4b, 'dP', 1, 'doc-r2'); await syncAll(W, all, 3);
  var Lr = await S.V.order();
  verdict(vOf(Lr, r1.hash) === 'MERGED:escrow' && vOf(Lr, r2.hash) === 'MERGED:escrow', 'CONTROL: the same two devices using 1 + 1 of 3 at once are both MERGED (the running test is not a blanket refusal)');

  // ════════ PERMUTE ════════
  var RES = [R1, R3, R4, R4b].concat(unk.map(function (u) { return u.RU; })).concat(trials.map(function (t) { return t.RC; })), ref = await stateHash(S.V, RES);
  var envs = S.A.query('SELECT envelope FROM cl_op').map(function (r) { return JSON.parse(r.envelope); }), seed = 20261024, rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  var same = 0, orders = 20, escOps = envs.filter(function (e) { return /^ESCROW_/.test(e.body.op_type); }).length;
  for (var pi = 0; pi < orders; pi++) {
    var perm = envs.slice(); for (var i = perm.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    var dev = await STORE.newDevice(), X = STORE.open(new SQL.Database(), { SQL: SQL, space: W.space, self: dev, access: accessRaw, log: function () {} });
    for (var e of perm) await X.ingest(e, 'perm');
    if ((await stateHash(X, RES)) === ref) same++;
  }
  console.log('   §ES-PERMUTE ops=' + envs.length + ' (escrow ops ' + escOps + ') ; ' + orders + ' random arrival orders -> same state hash on ' + same + '/' + orders + ' ; reference ' + ref.slice(0, 12));
  verdict(same === orders && escOps > 20, 'the same ops in 20 random arrival orders give ONE verdicts+escrow-state hash', same + '/' + orders);
  // CONTROL: the hash does depend on the content (drop one escrow op -> different hash)
  var dropped = envs.filter(function (e) { return !(e.body.op_type === 'ESCROW_USE' && e.body.params.doc === 'doc-001'); });
  var dev2 = await STORE.newDevice(), X2 = STORE.open(new SQL.Database(), { SQL: SQL, space: W.space, self: dev2, access: accessRaw, log: function () {} });
  for (var e2 of dropped) await X2.ingest(e2, 'perm');
  verdict((await stateHash(X2, RES)) !== ref, 'CONTROL: the hash is sensitive — the same log minus one USE hashes differently');

  // ════════ OPAQUE ════════
  var secret = 'stock:SECRET-WIDGET-7741';
  await S.A.escrowOpen(secret, { dA: 1 }); await syncAll(W, all, 2);
  var sc1 = await scan(W.pipe, [secret, 'SECRET-WIDGET']);
  var PW = await world(SQL, ['A', 'B'], 'plain', true); await PW.S.A.escrowOpen(secret, { dA: 1 }); await syncAll(PW, ['A', 'B'], 2);
  var sc2 = await scan(PW.pipe, [secret, 'SECRET-WIDGET']);
  console.log('   §ES-OPAQUE encrypted space: objects=' + sc1.objects + ' needle hits=' + sc1.hits + ' ; plaintext space (control): objects=' + sc2.objects + ' hits=' + sc2.hits);
  if (!sc1.objects) inconclusive.push('ES-OPAQUE: nothing in the pipe to scan');
  verdict(sc1.hits === 0, 'the resource name is not readable in the pipe of an encrypted space (escrow ops travel sealed like business ops)');
  verdict(sc2.hits >= 1, 'CONTROL: the same search finds it in a plaintext space (so the 0 above can fail)', 'hits=' + sc2.hits);

  // ════════ CHECKPOINT ════════
  var R5 = 'stock:ckpt@L5', live = ['A', 'B', 'C', 'P1', 'P2', 'V', 'O'];
  await S.A.escrowOpen(R5, { dB: 6, dC: 1 }); await syncAll(W, live, 3);
  await S.B.escrowUse(R5, 'dB', 4, 'doc-k1'); await S.B.escrowTransfer(R5, 'dB', 'dC', 1); await syncAll(W, live, 3);
  var pub = await S.A.checkpoint(W.pipe); await S.A.sync(W.pipe); await S.B.sync(W.pipe); await S.V.sync(W.pipe); await S.B.cosign(); await syncAll(W, live, 2);
  verdict(!pub.skipped, 'a checkpoint is published after the escrow ops are decided', pub.skipped || 'pos=' + pub.pos);
  var sn = await snapState(W, S.A, pub), r5h = sha('escrow:' + W.space + ':' + R5), est = sn.state.escrow || {};
  console.log('   §ES-CHECKPOINT state.escrow keys=' + Object.keys(est).length + ' ; R5 entry ' + JSON.stringify(est[r5h]) + ' ; resource name in the state text? ' + (sn.text.indexOf('stock:ckpt') >= 0));
  verdict(Object.keys(est).length >= 5 && est[r5h] && est[r5h].s.dB === 6 && est[r5h].d.dB.u === 4 && est[r5h].d.dB.o === 1 && est[r5h].d.dC.i === 1 && sn.text.indexOf('stock:') < 0, 'the snapshot state carries every resource keyed by sha256(space+name) with its per-desk numbers; no resource name appears in it');
  var Aop = S.A.query("SELECT envelope FROM cl_op WHERE op_type='CHECKPOINT'").map(function (r) { return JSON.parse(r.envelope).body.params; })[0], fr = Aop.frontier;
  W.pipe._names().forEach(function (nm) { var m = /\/o\/([0-9a-f]+)\/(\d+)-(\d+)\./.exec(nm); if (m && fr[m[1]] && Number(m[3]) <= fr[m[1]]) W.pipe._withhold(nm); });
  W.dev.F = W.dev.V; var F = mk(W, 'F', { trustCheckpoints: true }); await F.sync(W.pipe); await F.sync(W.pipe);
  var after1 = await S.B.escrowUse(R5, 'dB', 1, 'doc-k2');                              // dB has 6-4-1 = 1 left
  var after2 = await S.B.escrowUse(R5, 'dB', 1, 'doc-k3');                              // over-draw beyond what the snapshot says
  var after3 = await S.C.escrowUse(R5, 'dC', 2, 'doc-k4');                              // dC has 1 (slice) + 1 (transfer in S) = 2
  await syncAll(W, live.concat(['F']), 3);
  var info = await S.V.checkpointInfo(), infoF = await F.checkpointInfo();
  var vs = {}; for (var dn of ['A', 'V', 'F', 'O']) { var Ln = await (dn === 'F' ? F : S[dn]).order(); vs[dn] = [vOf(Ln, after1.hash), vOf(Ln, after2.hash), vOf(Ln, after3.hash)].join(' | '); }
  console.log('   §ES-CHECKPOINT in force: V=' + !!info.inForce + ' F(light)=' + !!infoF.inForce + ' ; after the barrier (ok | over-draw | covered by S transfer): ' + JSON.stringify(vs));
  verdict(info.inForce && infoF.inForce && F.query("SELECT 1 FROM cl_ckpt").length >= 0 && vs.A === vs.V && vs.V === vs.F && vs.F === vs.O && vs.O === 'MERGED:escrow | REFUSED:escrow-exceeded | MERGED:escrow', 'checkpoint in force on the verifier and the light client; a later use is judged against the frozen escrow state: ok MERGED, over-draw REFUSED, the S transfer counts — identical on A, V, F and the no-checkpoint control O');
  var eF = JSON.stringify(await F.escrowState(R5)), eO = JSON.stringify(await S.O.escrowState(R5));
  verdict(eF === eO && (await F.escrowState(R5)).desks.dB.available === 0, 'the light client\'s escrow state (which never folded S) equals the control\'s', eF.slice(0, 120));

  // ════════ KERNEL ════════
  var pe = await S.V.placedEnvelopes(), nEsc = S.V.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type LIKE 'ESCROW_%'")[0].n, cfl = await S.V.conflicts();
  console.log('   §ES-KERNEL escrow ops held=' + nEsc + ' ; placedEnvelopes escrow ops=' + pe.filter(function (q) { return /^ESCROW_/.test(q.env.body.op_type); }).length + ' ; conflicts on comm_escrow=' + cfl.filter(function (c) { return c.table === 'comm_escrow'; }).length);
  verdict(nEsc > 30 && pe.every(function (q) { return !/^ESCROW_/.test(q.env.body.op_type); }) && !cfl.some(function (c) { return c.table === 'comm_escrow'; }), 'escrow ops are not handed to the kernel (placedEnvelopes) and never show up as record conflicts, although the log holds more than 30 of them', 'held=' + nEsc);

  // ════════ NOESCROW (additive) ════════
  var NW = await world(SQL, ['A', 'B', 'V'], 'noesc'); await syncAll(NW, ['A', 'B', 'V'], 2);
  await NW.S.A.claim('SOME:KEY'); await syncAll(NW, ['A', 'B', 'V'], 3);
  var npub = await NW.S.A.checkpoint(NW.pipe), nsn = npub.skipped ? null : await snapState(NW, NW.S.A, npub);
  console.log('   §ES-NOESCROW space without escrow: checkpoint ' + (npub.skipped || 'pos=' + npub.pos) + ' ; state keys=' + (nsn ? Object.keys(nsn.state).sort().join(',') : 'n/a') + ' ; escrowState=' + JSON.stringify(await NW.S.V.escrowState('anything')));
  verdict(nsn && !('escrow' in nsn.state) && (await NW.S.V.escrowState('anything')) === null, 'a space that never used escrow has NO escrow key in its checkpoint state (so its state_hash is the one an older engine computes) and escrowState is null');
  verdict('escrow' in sn.state, 'CONTROL: the escrow space\'s state does have the key (so the absence above can fail)');

  // ════════ SKEW ════════
  var old = loadOldEngine();
  if (!old) inconclusive.push('ES-SKEW: git show 34b915fb1 unavailable');
  else { try {
      var od = await old.STORE.newDevice(); od.person_uu = uuid();
      await S.A.addPerson({ person_uu: od.person_uu, name: 'OLD', ad_role_id: 102, comm_admin: false }); await S.A.enroll(od.kid, od.pubJwk, od.person_uu, od.dhPubJwk); await S.A.sync(W.pipe);
      for (var wn of W.pipe._names()) W.pipe._restore(wn);
      var O2 = old.STORE.open(new SQL.Database(), { SQL: SQL, space: W.space, self: od, access: accessRaw, log: function () {} }), crashed = null;
      try { await O2.sync(W.pipe); await O2.sync(W.pipe); } catch (e) { crashed = e; }
      var eo = crashed ? [] : O2.query("SELECT op_hash FROM cl_op WHERE op_type='ESCROW_USE'"), ev = eo.length ? O2.query('SELECT verdict, reason FROM cl_verdict WHERE op_hash=?', [eo[0].op_hash])[0] : null;
      console.log('   §ES-SKEW old engine: crashed=' + !!crashed + (crashed ? ' ' + crashed.message : '') + ' ESCROW_USE ops opened=' + eo.length + ' sample verdict=' + (ev ? ev.verdict + ':' + ev.reason : 'none'));
      verdict(!crashed && eo.length > 10 && ev && ev.verdict === 'REFUSED', 'an engine from before ESCROW folds a log full of escrow ops without crashing and refuses them (scope unknown)', ev ? ev.reason : '');
    } finally { fs.rmSync(old.dir, { recursive: true, force: true }); } }

  console.log('\n──────────────────────────────────────────────');
  var tag = inconclusive.length || judged === 0 ? 'INCONCLUSIVE' : (fails ? 'FAIL' : 'PASS');
  console.log('§W-ESCROW ' + tag + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inconclusive.length + (inconclusive.length ? ' — ' + inconclusive.join(' | ') : '') + (process.env.COMM_DIR ? ' [COMM_DIR=' + process.env.COMM_DIR + ']' : ''));
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
