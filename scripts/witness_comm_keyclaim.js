#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_keyclaim.js — W-KEYCLAIM. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.2 (KEYCLAIM: first claim in fold order wins).
 * Real modules: build/comm/* on real sql.js + WebCrypto in an ENCRYPTED space, access judged by the real MRole.canUpdate port (build/erp/ad_full.db).
 *
 * Arms (every one has a control that can fail):
 *   §KC-RACE        — devices claim the same key before seeing each other: exactly ONE claim is MERGED, the same one on EVERY device; the other is REFUSED key-claimed and its
 *                     author gets a Notice. INCONCLUSIVE if no pair of claims was concurrent (neither depended on the other).
 *   §KC-INDEPENDENT — a claim on another key is not touched by that contest; a race-free claim is MERGED.
 *   §KC-USES        — document-number block, tax-id uniqueness (the loser's gated document is refused dep-refused), document processing claim, timer-once with three devices.
 *   §KC-LEASE       — expiry takeover works only with the op that cites the expired claim, and only at/after `until` (the taking op's own signed ts).
 *   §KC-OPAQUE      — claim keys are not readable in the pipe of an encrypted space (control: readable in a plaintext space).
 *   §KC-CHECKPOINT  — a claim won inside a checkpoint's prefix stays won against late claimants on the in-force devices AND on a light client that never folded S;
 *                     the plain fold (control) lets some late claimants win — the barrier is what protects an already-used number. Snapshot claims are keyed by hash.
 *   §KC-RETIRED     — (study §12.5) a BOOKING envelope is REFUSED bad-claim:op_type everywhere, the numbering API is gone; control: a KEYCLAIM of the same Visit is MERGED.
 *   §KC-SKEW        — an engine from before this change refuses the op without crashing.
 *
 * Run: node scripts/witness_comm_keyclaim.js 2>&1 | tee build/comm/logs/witness_comm_keyclaim.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), cp = require('child_process');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ROS = require(path.join(B, 'comm_roster.js'));
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

function mk(W, name, o) {
  var c = { n: 0 }, lines = [], st = STORE.open(new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[name], access: function (a, b, d, e) { c.n++; return accessRaw(a, b, d, e); }, log: function (m) { lines.push(m); } }, o || {}));
  st._c = c; st._lines = lines; st._name = name; W.S[name] = st; return st;
}
async function world(SQL, names, label, plain) {
  var W = { SQL: SQL, dev: {}, per: {}, S: {}, pipe: PIPE.memPipe(label) };
  for (var n of names) { W.dev[n] = await STORE.newDevice(); if (plain) { delete W.dev[n].dhPubJwk; delete W.dev[n].dhPrivateKey; } W.dev[n].person_uu = uuid(); W.per[n] = W.dev[n].person_uu; }
  var sp = await STORE.newSpace('kc-' + label, W.dev[names[0]], W.per[names[0]], names[0], 102); W.space = sp.space;
  mk(W, names[0]); await W.S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await W.S[names[0]].addPerson({ person_uu: W.per[k], name: k, ad_role_id: 102, comm_admin: false }); await W.S[names[0]].enroll(W.dev[k].kid, W.dev[k].pubJwk, W.per[k], W.dev[k].dhPubJwk); }
  return W;
}
async function syncAll(W, names, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var n of names) await W.S[n].sync(W.pipe); }
function create(s, u, docno, total, refs) { return s.author({ target: { table: 'c_order', uu: u }, refs: refs, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } }); }
function verOf(L, h) { var v = L.verdict[h]; return v ? v.verdict + ':' + (v.reason || '') : 'none'; }
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

(async function () {
  console.log('═══ W-KEYCLAIM — the first claim in fold order wins, on every device (TEAMWORK_FRAMEWORK §13.12.2) ═══');
  var SQL = await initSqlJs();
  var names = ['A', 'B', 'C', 'L', 'V', 'O'], W = await world(SQL, names, 'main');
  for (var n of ['B', 'C', 'L', 'V']) mk(W, n); mk(W, 'O', { noCheckpoint: true });
  var live = ['A', 'B', 'C', 'V', 'O'], all = ['A', 'B', 'C', 'L', 'V', 'O'];
  await syncAll(W, names, 3);
  var devs = ['A', 'B', 'C'];

  // ════════ RACE ════════
  var KEYS = []; for (var i = 0; i < 8; i++) KEYS.push('DOCNO:STN-' + i + ':0');
  var pairs = [];
  for (var ki = 0; ki < KEYS.length; ki++) {
    var x = devs[ki % 3], y = devs[(ki + 1) % 3];                       // both claim BEFORE any sync: neither has seen the other
    var cx = await W.S[x].claim(KEYS[ki]), cy = await W.S[y].claim(KEYS[ki]);
    pairs.push({ key: KEYS[ki], x: x, y: y, hx: cx.hash, hy: cy.hash, conc: cx.env.deps.indexOf(cy.hash) < 0 && cy.env.deps.indexOf(cx.hash) < 0 });
  }
  await syncAll(W, names, 3);
  var concurrent = pairs.filter(function (p) { return p.conc; }).length, same = 0, oneWinner = 0, loserOk = 0, noticeOk = 0, byDev = { A: 0, B: 0, C: 0 };
  var Ls = {}; for (var nm of all) Ls[nm] = await W.S[nm].order();
  for (var p of pairs) {
    var wins = all.map(function (d) { return [verOf(Ls[d], p.hx), verOf(Ls[d], p.hy)].join('|'); });
    if (wins.every(function (w) { return w === wins[0]; })) same++;
    var vx = verOf(Ls.A, p.hx), vy = verOf(Ls.A, p.hy), winner = vx.indexOf('MERGED') === 0 ? p.x : (vy.indexOf('MERGED') === 0 ? p.y : null), lose = winner === p.x ? p.y : p.x;
    if ((vx.indexOf('MERGED') === 0) !== (vy.indexOf('MERGED') === 0)) oneWinner++;
    var lv = verOf(Ls.A, winner === p.x ? p.hy : p.hx); if (lv === 'REFUSED:key-claimed') loserOk++;
    if (winner) byDev[winner]++;
    var no = await W.S[lose].claimNotices(W.per[lose]), wn = await W.S[winner].claimNotices(W.per[winner]);
    if (no.some(function (q) { return q.key === p.key; }) && !wn.some(function (q) { return q.key === p.key; })) noticeOk++;
    p.winner = winner;
  }
  console.log('   §KC-RACE keys=' + KEYS.length + ' concurrent pairs=' + concurrent + ' ; identical verdict pair on all 6 devices for ' + same + '/' + KEYS.length + ' ; exactly one MERGED for ' + oneWinner + ' ; loser REFUSED key-claimed for ' + loserOk + ' ; loser got a Notice (winner none) for ' + noticeOk + ' ; winners by device ' + JSON.stringify(byDev));
  if (concurrent === 0) inconclusive.push('KC-RACE: no pair of claims was concurrent');
  verdict(concurrent === KEYS.length && same === KEYS.length && oneWinner === KEYS.length, 'every contested key has exactly one winner, and the same one on all six devices (arrival order and device did not matter)', 'same=' + same + '/' + KEYS.length);
  verdict(loserOk === KEYS.length && noticeOk === KEYS.length, 'every loser is REFUSED key-claimed and sees a Notice; no winner does', 'loser=' + loserOk + ' notice=' + noticeOk);
  verdict(Object.keys(byDev).filter(function (d) { return byDev[d] > 0; }).length >= 2, 'the winner is decided by fold order, not by who asked first or which device it is (more than one device won a race)', JSON.stringify(byDev));
  var co = await W.S.A.claimOf(KEYS[0]); verdict(co && co.hash === (pairs[0].winner === pairs[0].x ? pairs[0].hx : pairs[0].hy), 'claimOf(key) returns the winner (hash, author, person)', co && co.person && co.person.slice(0, 8));

  // ════════ INDEPENDENT ════════
  var kInd = 'UNIQUE:other:key:1', c1 = await W.S.A.claim(kInd), c2 = await W.S.C.claim('UNIQUE:other:key:2');
  await syncAll(W, names, 3);
  var Li = await W.S.V.order();
  verdict(verOf(Li, c1.hash).indexOf('MERGED') === 0 && verOf(Li, c2.hash).indexOf('MERGED') === 0, 'CONTROL: claims on other, uncontested keys are MERGED (and are not affected by the 8 contests above)');
  var all8 = pairs.every(function (p) { return Li.verdict[p.hx] && Li.verdict[p.hy]; });
  verdict(all8, 'no contest changed the verdict of another key\'s claim');

  // ════════ RETIRED (TEAM_REPLICATION_PLUGIN_STUDY §12.5, owner Q4: document numbering is core; BOOKING/BLOCK left the comm engine) ════════
  // ISSUE: a comm engine that still books document numbers decides a core function (AD_Sequence). Proves: a BOOKING envelope is refused bad-claim:op_type on every device, the
  //   numbering API is gone from the store, and a KEYCLAIM authored in the same Visit is still MERGED (control: the refusal is about the op type, not the device or the Visit).
  var rSeq = uuid(), rDoc = uuid(), rBk = await W.S.B.author({ target: { table: 'comm_booking', uu: await ROS.claimUU(W.space, 'BOOKING:' + rSeq + ':1') }, body: { op_type: 'BOOKING', params: { seq: rSeq, n: 1, doc: rDoc } }, intent: 'K1' });
  var rKc = await W.S.B.claim('UNIQUE:retired:control:1');
  await syncAll(W, names, 3);
  var rOk = 0, rL = {};
  for (var rn of names) { var Lr = await W.S[rn].order(); rL[rn] = verOf(Lr, rBk.hash) + '|' + verOf(Lr, rKc.hash); if (verOf(Lr, rBk.hash) === 'REFUSED:bad-claim:op_type' && verOf(Lr, rKc.hash).indexOf('MERGED') === 0) rOk++; }
  console.log('   §KC-RETIRED verdicts ' + JSON.stringify(rL));
  verdict(rOk === names.length, 'a BOOKING envelope is REFUSED bad-claim:op_type on every device while a KEYCLAIM of the same Visit is MERGED (numbering is not the comm engine\'s)', rOk + '/' + names.length);
  var gone = ['numberDocument', 'bookDocNo', 'bookBlock'].filter(function (k) { return typeof W.S.A[k] === 'function'; });
  verdict(gone.length === 0, 'the store offers no numbering API any more (numberDocument / bookDocNo / bookBlock)', 'still there: ' + JSON.stringify(gone));

  // ════════ USES ════════
  // timer-once: A, B, C all find the rule due and claim at once
  var tKey = 'TIMER:doc-0042:retry-dunning', tc = [];
  for (var d1 of devs) tc.push(await W.S[d1].claim(tKey));
  // uniqueness (tax id): A and C each claim then CREATE a record gated on their claim (the CREATE reads the claim)
  var uKey = 'UNIQUE:c_bpartner:taxid:TAX-7788', uA = await W.S.A.claim(uKey), uC = await W.S.C.claim(uKey);
  var claimRec = await ROS.claimUU(W.space, uKey);
  var gA = uuid(), gC = uuid(); var docA = await create(W.S.A, gA, 'BP-A', 1, [claimRec]), docC = await create(W.S.C, gC, 'BP-C', 1, [claimRec]);
  // document processing claim: B and C race to Complete the same order
  var pKey = 'PROCESS:' + uuid(), pB = await W.S.B.claim(pKey), pC = await W.S.C.claim(pKey);
  await syncAll(W, names, 3);
  var Lu = await W.S.V.order(), Lo = await W.S.O.order();
  var timerMerged = tc.filter(function (c) { return verOf(Lu, c.hash).indexOf('MERGED') === 0; }).length;
  console.log('   §KC-USES timer-once (3 devices): MERGED=' + timerMerged + ' ; uniqueness: A=' + verOf(Lu, uA.hash) + ' C=' + verOf(Lu, uC.hash) + ' ; gated documents: A=' + verOf(Lu, docA.hash) + ' C=' + verOf(Lu, docC.hash) + ' ; processing: B=' + verOf(Lu, pB.hash) + ' C=' + verOf(Lu, pC.hash));
  verdict(timerMerged === 1 && tc.every(function (c) { return verOf(Lu, c.hash) === verOf(Lo, c.hash); }), 'timer-once: three devices find the rule due, exactly ONE claim stands, the same on the no-checkpoint control (the action is done once, no clock hub)');
  var uWin = verOf(Lu, uA.hash).indexOf('MERGED') === 0 ? 'A' : 'C', uLose = uWin === 'A' ? 'C' : 'A';
  verdict(verOf(Lu, (uWin === 'A' ? docA : docC).hash).indexOf('MERGED') === 0 && verOf(Lu, (uLose === 'A' ? docA : docC).hash) === 'REFUSED:dep-refused', 'uniqueness: the winner of the tax-id key keeps its document; the loser\'s document, which read the lost claim, is refused dep-refused', 'winner=' + uWin);
  verdict([pB, pC].filter(function (c) { return verOf(Lu, c.hash).indexOf('MERGED') === 0; }).length === 1, 'document processing claim: exactly one of two devices may Complete');
  var plc = await W.S.V.placedEnvelopes(), inOrder = Lu.order.filter(function (h) { return Lu.verdict[h] && true; }).length;
  verdict(plc.length >= 1 && plc.every(function (q) { return q.env.body.op_type.indexOf('CRUD') === 0; }) && W.S.V.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type='KEYCLAIM'")[0].n > 20, 'claims are not handed to the kernel: placedEnvelopes holds only CRUD ops although the log holds more than 20 claims', 'placed=' + plc.length);

  // ════════ LEASE ════════
  var lKey = 'LEASE:ledger-poster', T = 1000000;
  var l0 = await W.S.A.claim(lKey, { until: T, ts: 500000 });
  await syncAll(W, names, 2);
  var lNo = await W.S.B.claim(lKey, { ts: 2000000 });                                       // after expiry but WITHOUT citing the lease
  await syncAll(W, names, 2);
  var lKey2 = 'LEASE:ledger-poster-2', m0 = await W.S.A.claim(lKey2, { until: T, ts: 500000 }); await syncAll(W, names, 2);
  var lEarly = await W.S.B.claim(lKey2, { takes: m0.hash, ts: 900000 });                    // cites the lease, but before `until` (own key, so no takeover can precede it in the order)
  var lWrong = await W.S.C.claim(lKey, { takes: sha('some other claim'), ts: 2000000 });   // cites something else
  await syncAll(W, names, 2);
  var lTake = await W.S.B.claim(lKey, { takes: l0.hash, ts: 1000000 });                     // cites it at `until`
  await syncAll(W, names, 2);
  var lAfter = await W.S.C.claim(lKey, { ts: 3000000 });                                    // a later claimant, no takes
  await syncAll(W, names, 2);
  var Ll = await W.S.V.order(), lWin = await W.S.V.claimOf(lKey);
  console.log('   §KC-LEASE original=' + verOf(Ll, l0.hash) + ' | expired, no citation=' + verOf(Ll, lNo.hash) + ' | cites, before until=' + verOf(Ll, lEarly.hash) + ' | cites another claim=' + verOf(Ll, lWrong.hash) + ' | cites at until=' + verOf(Ll, lTake.hash) + ' | later claimant=' + verOf(Ll, lAfter.hash) + ' ; holder now ' + (lWin && lWin.hash === lTake.hash ? 'B (the taker)' : '?'));
  verdict(verOf(Ll, l0.hash).indexOf('MERGED') === 0 && verOf(Ll, lNo.hash) === 'REFUSED:key-claimed', 'an expired lease is NOT taken by a claim that does not cite it (key-claimed)');
  var m0v = verOf(Ll, m0.hash);
  verdict(m0v.indexOf('MERGED') === 0 && verOf(Ll, lEarly.hash) === 'REFUSED:lease-live' && verOf(Ll, lWrong.hash) === 'REFUSED:bad-takeover', 'citing the lease before `until` is lease-live; citing some other claim is bad-takeover');
  verdict(verOf(Ll, lTake.hash).indexOf('MERGED') === 0 && lWin && lWin.hash === lTake.hash, 'CONTROL: the op that cites the expired lease at `until` takes it over, and claimOf names it');
  verdict(verOf(Ll, lAfter.hash) === 'REFUSED:key-claimed', 'after the takeover the key is held again: a later claimant is refused');
  var lAll = ['A', 'B', 'C', 'L', 'V', 'O'], lv = []; for (var d2 of lAll) { var q = await W.S[d2].order(); lv.push([l0, lNo, lEarly, lWrong, lTake, lAfter].map(function (c) { return verOf(q, c.hash); }).join('|')); }
  verdict(lv.every(function (z) { return z === lv[0]; }), 'all six devices reach the same lease history');

  // ════════ OPAQUE ════════
  var secret = 'UNIQUE:c_bpartner:taxid:SECRET-5519', claimEnc = await W.S.A.claim(secret); await syncAll(W, live, 2);
  var sc1 = await scan(W.pipe, [secret, 'SECRET-5519', 'TIMER:doc-0042']);
  var PW = await world(SQL, ['A', 'B'], 'plain', true); mk(PW, 'B'); await PW.S.A.claim(secret); await syncAll(PW, ['A', 'B'], 2);
  var sc2 = await scan(PW.pipe, [secret, 'SECRET-5519']);
  console.log('   §KC-OPAQUE encrypted space: objects=' + sc1.objects + ' needle hits=' + sc1.hits + ' ; plaintext space (control): objects=' + sc2.objects + ' hits=' + sc2.hits);
  if (!sc1.objects) inconclusive.push('KC-OPAQUE: nothing in the pipe to scan');
  verdict(sc1.hits === 0, 'the claim keys are not readable in the pipe of an encrypted space (claims travel sealed like business ops)');
  verdict(sc2.hits >= 2, 'CONTROL: the same search finds them in a plaintext space (so the 0 above can fail)', 'hits=' + sc2.hits);

  // ════════ CHECKPOINT ════════
  // S: claims K0..K11 are won by A or B. L (offline since before them) holds 12 late claims on the SAME keys, authored from an old view.
  var CK = []; for (var z = 0; z < 12; z++) CK.push('DOCNO:CK-' + z + ':0');
  var lateClaims = []; for (var z2 = 0; z2 < 12; z2++) lateClaims.push(await W.S.L.claim(CK[z2]));
  var sWin = {}; for (var z3 = 0; z3 < 12; z3++) { var wd = z3 % 2 ? 'B' : 'A', cc = await W.S[wd].claim(CK[z3]); sWin[CK[z3]] = cc.hash; }
  var soloKey = 'DOCNO:CK-solo:0', solo = await W.S.A.claim(soloKey);                  // won in S and never contested by a late claimant
  await syncAll(W, live, 3);
  var pub = await W.S.A.checkpoint(W.pipe); await W.S.A.sync(W.pipe); await W.S.B.sync(W.pipe); await W.S.V.sync(W.pipe); await W.S.B.cosign(); await syncAll(W, live, 2);
  console.log('   §KC-CHECKPOINT published ' + JSON.stringify({ pos: pub.pos, skipped: pub.skipped }));
  verdict(!pub.skipped, 'a checkpoint is published after the 12 claims are won', 'pos=' + pub.pos);
  // retention + a light client that never folds S
  var Aop = W.S.A.query("SELECT envelope FROM cl_op WHERE op_type='CHECKPOINT'").map(function (r) { return JSON.parse(r.envelope).body.params; })[0], fr = Aop.frontier;
  W.pipe._names().forEach(function (nm) { var m = /\/o\/([0-9a-f]+)\/(\d+)-(\d+)\./.exec(nm); if (m && fr[m[1]] && Number(m[3]) <= fr[m[1]]) W.pipe._withhold(nm); });
  W.dev.F = W.dev.V; var F = mk(W, 'F', { trustCheckpoints: true }); await F.sync(W.pipe); await F.sync(W.pipe);
  await W.S.L.sync(W.pipe); await syncAll(W, live.concat(['F', 'L']), 3);                    // the late claims arrive now
  var res = { V: await W.S.V.order(), F: await F.order(), A: await W.S.A.order(), O: await W.S.O.order(), L: await W.S.L.order() }, win = { V: 0, F: 0, A: 0, O: 0, L: 0 };
  CK.forEach(function (k, ix) { Object.keys(res).forEach(function (d) { if (verOf(res[d], sWin[k]).indexOf('MERGED') === 0) win[d]++; }); });
  var lateWins = {}; Object.keys(res).forEach(function (d) { lateWins[d] = lateClaims.filter(function (c) { return verOf(res[d], c.hash).indexOf('MERGED') === 0; }).length; });
  var infoF = await F.checkpointInfo(), infoV = await W.S.V.checkpointInfo(), infoO = await W.S.O.checkpointInfo();
  console.log('   §KC-CHECKPOINT in force: A=' + !!(await W.S.A.checkpointInfo()).inForce + ' V=' + !!infoV.inForce + ' F(light client)=' + !!infoF.inForce + ' O(control)=' + !!infoO.inForce + ' ; F adapter calls=' + F._c.n);
  console.log('   §KC-CHECKPOINT S-winners still holding their key (of 12): A=' + win.A + ' V=' + win.V + ' F=' + win.F + ' L=' + win.L + ' | plain control O=' + win.O + ' ; late claims that WON: A=' + lateWins.A + ' V=' + lateWins.V + ' F=' + lateWins.F + ' | plain control O=' + lateWins.O);
  if (!infoO || win.O === 12) inconclusive.push('KC-CHECKPOINT: the plain fold kept every S winner, so the barrier effect is not observable here');
  verdict(infoV.inForce && infoF.inForce && F._lines.some(function (l) { return /§CKPT_TRUST/.test(l); }), 'the checkpoint is in force on the verifier and on the light client (which trusted it, and folded no S)');
  verdict(win.A === 12 && win.V === 12 && win.F === 12 && win.L === 12 && lateWins.A === 0 && lateWins.V === 0 && lateWins.F === 0, 'all 12 claims won inside the checkpoint stay won on every in-force device; none of the 12 late claims on those keys wins', 'S winners held=12/12, late winners=0');
  verdict(win.O < 12 && lateWins.O > 0, 'CONTROL: the plain fold (no checkpoint) lets late claimants that sort earlier take ' + (12 - win.O) + ' of the 12 keys — the barrier is what protects a number already used', 'plain: S winners held=' + win.O);
  var again = await F.claim(soloKey); await syncAll(W, live.concat(['F', 'L']), 3);
  var vAgain = verOf(await F.order(), again.hash), vAgainA = verOf(await W.S.A.order(), again.hash);
  verdict(vAgain === 'REFUSED:key-claimed' && vAgainA === 'REFUSED:key-claimed', 'a NEW claim on an S key from the light client, which never folded S, is refused key-claimed — from state.claims alone — and so on A', vAgain);
  var snapName = Aop.bytes_ref, sb = new SQL.Database(await W.pipe.get(snapName)), stText = sb.exec("SELECT v FROM meta WHERE k='state'")[0].values[0][0]; sb.close();
  verdict(stText.indexOf('enc:') === 0 && stText.indexOf('DOCNO') < 0, 'the snapshot state is sealed and holds no claim key in the clear');
  var keyring1 = (await W.S.A.keyring())[1][0], raw = Buffer.from(stText.split(':')[2], 'base64'), pt = JSON.parse(new TextDecoder().decode(await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12), additionalData: new TextEncoder().encode('bim-comm-op|' + W.space + '|1') }, keyring1, raw.slice(12))));
  var khs = Object.keys(pt.claims), kh0 = sha('claim:' + W.space + ':' + CK[0]);
  verdict(khs.length >= 12 && khs.indexOf(kh0) >= 0 && JSON.stringify(pt.claims).indexOf('DOCNO') < 0, 'even opened, the state keys its claims by sha256(space+key) — the key text is never in it', 'claims in state=' + khs.length);

  // ════════ SKEW ════════
  var old = loadOldEngine();
  if (!old) inconclusive.push('KC-SKEW: git show 34b915fb1 unavailable');
  else { try {
      var od = await old.STORE.newDevice(); od.person_uu = uuid();
      await W.S.A.addPerson({ person_uu: od.person_uu, name: 'OLD', ad_role_id: 102, comm_admin: false }); await W.S.A.enroll(od.kid, od.pubJwk, od.person_uu, od.dhPubJwk); await W.S.A.sync(W.pipe);
      var O2 = old.STORE.open(new SQL.Database(), { SQL: SQL, space: W.space, self: od, access: accessRaw, log: function () {} }), crashed = null;
      try { await O2.sync(W.pipe); await O2.sync(W.pipe); } catch (e) { crashed = e; }
      var kc = crashed ? [] : O2.query("SELECT op_hash FROM cl_op WHERE op_type='KEYCLAIM'"), kv = kc.length ? O2.query('SELECT verdict, reason FROM cl_verdict WHERE op_hash=?', [kc[0].op_hash])[0] : null;
      console.log('   §KC-SKEW old engine: crashed=' + !!crashed + (crashed ? ' ' + crashed.message : '') + ' KEYCLAIM ops opened=' + kc.length + ' sample verdict=' + (kv ? kv.verdict + ':' + kv.reason : 'none'));
      verdict(!crashed && kc.length > 10 && kv && kv.verdict === 'REFUSED', 'an engine from before KEYCLAIM folds a log full of claims without crashing and refuses them (scope unknown)', kv ? kv.reason : '');
    } finally { fs.rmSync(old.dir, { recursive: true, force: true }); } }

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-KEYCLAIM INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-KEYCLAIM ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
