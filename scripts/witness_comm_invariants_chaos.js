#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_invariants_chaos.js — W-INVARIANTS-CHAOS. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.J.1 + §13.12.J.3.
 * The open question of the outside review: do the BUSINESS invariants survive concurrent offline edits? The real layer (build/comm/* or $COMM_DIR), N devices in an ENCRYPTED
 * space, access judged by the real MRole.canUpdate port; a memPipe wrapped per device so that a device can be OFFLINE, a bundle can be DROPPED on the way in (and is re-sent at the next
 * visit), a fetch can be WITHHELD, and the listing arrives SHUFFLED. Devices author at random while partitioned — valid escrow USEs and TRANSFERs, deliberate OVER-DRAWS (edge: available+1,
 * huge: more than the whole resource), uses of someone else's desk, a re-used document, document-number BOOKINGs through the post office, deliberate double BOOKINGs written without the
 * pipe, KEYCLAIMs on a shared key pool incl. a second claim by the same device — and then everything is delivered (settle).  Judged on EVERY device:
 *   op set and order identical · every authored op present · per-desk available >= 0 · conservation (open total = sum available + sum used), recomputed by an ORACLE from the verdicts
 *   (not from the engine's state) · every honest escrow op MERGED · every deliberate bad op REFUSED with its own reason · document numbers unique and gap-accounted · each KEYCLAIM key has
 *   exactly one winner, the same everywhere · a DERIVED LEDGER (ledgerOf(folded documents, manifest): a trial balance, debits = credits, and its hash) equal on every device, with the control
 *   that a different manifest gives a different hash.
 * Prints INCONCLUSIVE (never PASS) when no over-draw was attempted, no device went offline, no key was contested or no document reached the ledger.
 *
 * Run: node scripts/witness_comm_invariants_chaos.js [N|sweep] [seed]     default N=12 ; "sweep" = 6, 12, 24 ; env SEED, N. The schedule (who does what, when) is fully determined by the
 *      seed (its hash is printed and equal on every rerun, as are the attempt counts); which of two concurrent ops sorts first depends on signatures, which are random per run — the
 *      invariants must hold for every such outcome.
 * Mutation: COMM_DIR=<mutated copy of build/comm> (engine) or MUTATE=ledger-order (the posting function made arrival-order dependent) — see witness_comm_escrow_mutate.sh. Each must go RED.
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = process.env.COMM_DIR ? path.resolve(process.env.COMM_DIR) : path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ROS = require(path.join(B, 'comm_roster.js')), ENV = require(path.join(B, 'comm_envelope.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {}, tcache = {};
function accessRaw(roleId, client, org, table) {
  var t = tcache[table]; if (t === undefined) t = tcache[table] = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase()) || null;
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var MUTATE = process.env.MUTATE || '';
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function sha(s) { return nodeCrypto.createHash('sha256').update(s).digest('hex'); }
function vOf(L, h) { var v = L.verdict[h]; return v ? v.verdict + ':' + (v.reason || '') : 'none'; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

var SEQ = '5e0a0000-0000-4000-8000-00000000c0de', CFG = { uu: SEQ, tables: ['c_order'], mode: 'B', prefix: 'INV-', pad: 5, start_no: 1000, increment_no: 1 };
var RS = 'stock:chaos@WH1', RC = 'credit:chaos@HQ', STOCK_SLICE = 6, CRED_SLICE = 12;

// ── the derived ledger: a pure function of the FOLDED documents and a pinned manifest (TEAMWORK_FRAMEWORK §13.12 C-3) ──
// documents = [{id, grandtotal}] (MERGED c_order creates) ; uses = [{op, resource, qty}] (MERGED stock USEs). Integer cents.
//   sale:  DR ar = total ; CR tax = floor(total*tax_bp/(10000+tax_bp)) ; CR revenue = total - tax          issue: DR cogs = qty*unit_cost ; CR inventory = qty*unit_cost
var MANIFEST = { v: 1, tax_bp: 600, unit_cost: 120, acc: { ar: '1100', inv: '1400', tax: '2300', rev: '4000', cogs: '5000' } };
function ledgerOf(docs, uses, manifest) {
  var tb = {}; function post(a, dr, cr) { var e = tb[a] || (tb[a] = { dr: 0, cr: 0 }); e.dr += dr; e.cr += cr; }
  docs.forEach(function (d) {
    var tax = Math.floor(d.grandtotal * manifest.tax_bp / (10000 + manifest.tax_bp));
    post(manifest.acc.ar, d.grandtotal, 0); post(manifest.acc.tax, 0, tax); post(manifest.acc.rev, 0, d.grandtotal - tax);
  });
  uses.forEach(function (u) { var c = u.qty * manifest.unit_cost; post(manifest.acc.cogs, c, 0); post(manifest.acc.inv, 0, c); });
  var dr = 0, cr = 0, accs = Object.keys(tb).sort(); accs.forEach(function (a) { dr += tb[a].dr; cr += tb[a].cr; });
  return { tb: tb, debits: dr, credits: cr, balanced: dr === cr, hash: sha(ENV.canonical({ m: manifest, tb: tb })) };
}

function mk(W, i, o) { var st = STORE.open(new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[i].dev, access: accessRaw, sequences: [CFG], log: function () {} }, o || {})); W.S[i] = st; return st; }

// A decision about the NETWORK is a pure function of (seed, device, what is being touched, how many times it was touched) — never of arrival order or of a random kid — so a seed
// replays the same chaos.  struct() renames an object to its meaning: the author's device index and seq range, not its kid or content hash.
function netR(cfg, i, tag) { var k = i + '|' + tag, n = (cfg.cnt[k] = (cfg.cnt[k] || 0) + 1); return parseInt(sha(cfg.seed + '|' + k + '|' + n).slice(0, 8), 16) / 4294967296; }
function struct(cfg, name) { return String(name).replace(/\/(o|h|f|r)\/([0-9a-f]{16})/, function (m, c, kid) { return '/' + c + '/D' + (cfg.idx[kid] != null ? cfg.idx[kid] : '?'); }).replace(/\.[0-9a-f]{12}\.(bimpack|bimsnap)$/, '.$1').replace(/s\/[0-9a-f]{64}\//, 's/S/'); }
function flaky(inner, dv, i, cfg) {                         // device i's view of the post office
  function down() { if (dv.off) throw new Error('offline'); }
  return {
    id: inner.id, stats: inner.stats, ifAbsent: true,
    put: async function (n, b) { down(); if (cfg.chaos && netR(cfg, i, 'put' + struct(cfg, n)) < cfg.dropPut) { cfg.dropped++; return true; } return inner.put(n, b); },     // "accepted" but lost on the way: the read-back fails and the bundle is re-sent
    putIfAbsent: async function (n, b) { down(); return inner.putIfAbsent(n, b); },
    get: async function (n) { down(); if (cfg.chaos && netR(cfg, i, 'get' + struct(cfg, n)) < cfg.dropGet) { cfg.withheld++; return null; } return inner.get(n); },
    list: async function (pre) { down(); var l = (await inner.list(pre)).slice();
      if (cfg.chaos) { var key = {}; l.forEach(function (x) { key[x] = netR(cfg, i, 'shuf' + struct(cfg, x)); }); l.sort(function (x, y) { return key[x] - key[y]; });
        if (pre.indexOf('/o/') >= 0) l = l.filter(function (x) { return netR(cfg, i, 'skip' + struct(cfg, x)) >= cfg.skipList; }); }
      return l; }
  };
}

async function runN(SQL, N, seed) {
  console.log('\n──── N=' + N + ' devices, seed=' + seed + ' ────');
  var R = mulberry32(seed), pick = function (a) { return a[Math.floor(R() * a.length)]; }, rint = function (lo, hi) { return lo + Math.floor(R() * (hi - lo + 1)); };
  var t0 = Date.now(), cfg = { chaos: true, dropPut: 0.2, dropGet: 0.12, skipList: 0.1, dropped: 0, withheld: 0, seed: seed, cnt: {}, idx: {} }, ROUNDS = N <= 6 ? 14 : N <= 12 ? 12 : 9;
  var inner = PIPE.memPipe('chaos'), D = [], W = { SQL: SQL, S: {}, dev: {} }, nameOf = function (i) { return 'D' + i; };
  for (var i = 0; i < N; i++) { var dv = { dev: await STORE.newDevice(), person: nodeCrypto.randomUUID(), desk: 'd' + i, off: false, offUntil: 0, name: nameOf(i) }; dv.dev.person_uu = dv.person; D.push(dv); W.dev[i] = dv; }
  D.forEach(function (d, ii) { cfg.idx[d.dev.kid] = ii; });
  var sp = await STORE.newSpace('chaos-' + N, D[0].dev, D[0].person, 'D0', 102); W.space = sp.space;
  mk(W, 0); await W.S[0].genesis(sp.params);
  for (var k = 1; k < N; k++) { await W.S[0].addPerson({ person_uu: D[k].person, name: D[k].name, ad_role_id: 102, comm_admin: false }); await W.S[0].enroll(D[k].dev.kid, D[k].dev.pubJwk, D[k].person, D[k].dev.dhPubJwk); mk(W, k); }
  var desks = {}; D.forEach(function (d) { desks[d.desk] = d.dev.kid; });
  await W.S[0].setPolicy({ epoch: 1, desks: desks });
  var sS = {}, sC = {}; D.forEach(function (d) { sS[d.desk] = STOCK_SLICE; sC[d.desk] = CRED_SLICE; });
  await W.S[0].escrowOpen(RS, sS); await W.S[0].escrowOpen(RC, sC);
  var quiet = { chaos: false, dropPut: 0, dropGet: 0, skipList: 0, cnt: {}, idx: cfg.idx, seed: seed }, qpipe = function (i) { return flaky(inner, { off: false }, i, quiet); };
  for (var r0 = 0; r0 < 3; r0++) for (var i0 = 0; i0 < N; i0++) await W.S[i0].sync(qpipe(i0));            // everyone has the roster, the policy and both OPENs before the chaos starts
  var totalS = N * STOCK_SLICE, totalC = N * CRED_SLICE;

  // ── the chaos ────────────────────────────────────────────────────────────────────────────────────────────
  var rec = [], claims = [], sched = [], docOps = [], offlineEvents = 0, offlineRounds = 0, blockedDocs = 0, rogueBook = 0, dupClaim = 0, bookedNums = [];
  var CLAIMKEYS = []; for (var ck = 0; ck < Math.max(4, Math.floor(N / 2)); ck++) CLAIMKEYS.push('UNIQUE:chaos:' + ck);
  var myDocs = D.map(function () { return []; });
  async function act(i) {
    var d = D[i], S = W.S[i], pipe = flaky(inner, d, i, cfg), w = R(), o;
    var aS = await S.escrowAvailable(RS, d.desk), aC = await S.escrowAvailable(RC, d.desk);
    if (w < 0.24) {                                              // valid stock use
      if (aS > 0) { var q = rint(1, Math.min(aS, 2)), doc = nodeCrypto.randomUUID(); o = await S.escrowUse(RS, d.desk, q, doc); myDocs[i].push(doc); rec.push({ h: o.hash, cat: 'use-ok', exp: 'MERGED:escrow', i: i, qty: q, res: RS }); sched.push('u' + i); }
      else { o = await S.escrowUse(RS, d.desk, 1, nodeCrypto.randomUUID()); rec.push({ h: o.hash, cat: 'overdraw-edge', exp: 'REFUSED:escrow-exceeded', i: i, qty: 1, res: RS }); sched.push('oe' + i); }
    } else if (w < 0.36) {                                       // valid credit use
      if (aC > 0) { var qc = rint(1, Math.min(aC, 3)); o = await S.escrowUse(RC, d.desk, qc, nodeCrypto.randomUUID()); rec.push({ h: o.hash, cat: 'use-ok', exp: 'MERGED:escrow', i: i, qty: qc, res: RC }); sched.push('c' + i); }
    } else if (w < 0.50) {                                       // valid transfer
      if (aS > 0 && N > 1) { var to = pick(D.filter(function (x) { return x !== d; })), qt = rint(1, Math.min(aS, 3)); o = await S.escrowTransfer(RS, d.desk, to.desk, qt); rec.push({ h: o.hash, cat: 'transfer-ok', exp: 'MERGED:escrow', i: i, qty: qt, res: RS }); sched.push('t' + i); }
    } else if (w < 0.58) {                                       // deliberate over-draw: edge (available + 1) or huge (more than the whole resource)
      var edge = R() < 0.6, qq = edge ? Math.max(1, aS + 1) : totalS + 1 + rint(0, 5);           // (max: a broken engine can drive available negative; the witness must still be able to say FAIL, not crash)
      o = await S.escrowUse(RS, d.desk, qq, nodeCrypto.randomUUID()); rec.push({ h: o.hash, cat: edge ? 'overdraw-edge' : 'overdraw-huge', exp: 'REFUSED:escrow-exceeded', i: i, qty: qq, res: RS }); sched.push('o' + i + (edge ? 'e' : 'h'));
    } else if (w < 0.62) {                                       // deliberate transfer over-draw
      var to2 = pick(D.filter(function (x) { return x !== d; }));
      o = await S.escrowTransfer(RS, d.desk, to2.desk, Math.max(1, aS + 1 + rint(0, 3))); rec.push({ h: o.hash, cat: 'xfer-overdraw', exp: 'REFUSED:escrow-exceeded', i: i, res: RS }); sched.push('x' + i);
    } else if (w < 0.66) {                                       // a desk that is not mine (a forged USE)
      var other = pick(D.filter(function (x) { return x !== d; }));
      o = await S.escrowUse(RS, other.desk, 1, nodeCrypto.randomUUID()); rec.push({ h: o.hash, cat: 'foreign-use', exp: 'REFUSED:escrow-not-owner', i: i, res: RS }); sched.push('f' + i);
    } else if (w < 0.70) {                                       // the same document named twice
      if (myDocs[i].length && aS > 0) { o = await S.escrowUse(RS, d.desk, 1, pick(myDocs[i])); rec.push({ h: o.hash, cat: 'dup-doc', exp: 'REFUSED:escrow-duplicate-doc', i: i, res: RS }); sched.push('d' + i); }
    } else if (w < 0.84) {                                       // a numbered document, through the post office
      var du = nodeCrypto.randomUUID(), nn = await S.numberDocument(pipe, SEQ, du);
      if (nn.offline) { blockedDocs++; sched.push('b' + i); }
      else { var total = rint(100, 99999);
        o = await S.author({ target: { table: 'c_order', uu: du }, refs: nn.refs, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { docno_ref: nn.ref, fields: { documentno: nn.docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } });
        docOps.push({ h: o.hash, id: du, total: total, n: nn.n, docno: nn.docno, i: i }); bookedNums.push(nn.n); sched.push('n' + i);
        if (R() < 0.5 && aC > 0) { var qk = 1; var o2 = await S.escrowUse(RC, d.desk, qk, du); rec.push({ h: o2.hash, cat: 'use-ok', exp: 'MERGED:escrow', i: i, qty: qk, res: RC, withDoc: du }); } }
    } else if (w < 0.90) {                                       // a deliberate DOUBLE booking: a number somebody else already booked, written without asking the post office
      var taken = (await inner.list('s/' + W.space + '/seq/' + SEQ + '/')).map(function (x) { return Number(x.split('/').pop()); }).filter(Number.isInteger);
      if (taken.length) { var nTaken = pick(taken), ru = nodeCrypto.randomUUID();
        o = await S.author({ target: { table: 'comm_booking', uu: await ROS.claimUU(W.space, 'BOOKING:' + SEQ + ':' + nTaken) }, intent: 'K1', body: { op_type: 'BOOKING', params: { seq: SEQ, n: nTaken, doc: ru } } });
        rec.push({ h: o.hash, cat: 'rogue-booking', exp: null, i: i, n: nTaken }); rogueBook++; sched.push('r' + i); }
    } else {                                                     // KEYCLAIM on the shared pool (a repeat by the same device is a deliberate double claim)
      var mineKeys = claims.filter(function (c) { return c.i === i; }), again = mineKeys.length && R() < 0.4, key = again ? pick(mineKeys).key : pick(CLAIMKEYS);
      o = await S.claim(key); claims.push({ h: o.hash, key: key, i: i, again: !!again }); if (again) { dupClaim++; rec.push({ h: o.hash, cat: 'self-reclaim', exp: 'REFUSED:key-claimed', i: i }); } sched.push('k' + i + (again ? 'r' : ''));
    }
  }
  // the small spaces must not depend on luck to contain every kind of abuse: one deliberate double KEYCLAIM and one double BOOKING are guaranteed before the last chaos round
  async function forceMissing() {
    if (dupClaim === 0) { var f = D[1 % N], fi = 1 % N, k1 = CLAIMKEYS[0], c1 = await W.S[fi].claim(k1); claims.push({ h: c1.hash, key: k1, i: fi }); var c2 = await W.S[fi].claim(k1); claims.push({ h: c2.hash, key: k1, i: fi, again: true });
      dupClaim++; rec.push({ h: c2.hash, cat: 'self-reclaim', exp: 'REFUSED:key-claimed', i: fi }); sched.push('K' + fi); }
    if (rogueBook === 0) { var tk = (await inner.list('s/' + W.space + '/seq/' + SEQ + '/')).map(function (x) { return Number(x.split('/').pop()); }).filter(Number.isInteger);
      if (!tk.length) { var fd = nodeCrypto.randomUUID(), fn = await W.S[0].numberDocument(flaky(inner, { off: false }, 0, quiet), SEQ, fd);
        if (!fn.offline) { var fo = await W.S[0].author({ target: { table: 'c_order', uu: fd }, refs: fn.refs, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { docno_ref: fn.ref, fields: { documentno: fn.docno, grandtotal: 1000, ad_client_id: 11, ad_org_id: 11 } } } });
          docOps.push({ h: fo.hash, id: fd, total: 1000, n: fn.n, docno: fn.docno, i: 0 }); tk = [fn.n]; } }
      if (tk.length) { var nT = tk[0], ro = await W.S[1 % N].author({ target: { table: 'comm_booking', uu: await ROS.claimUU(W.space, 'BOOKING:' + SEQ + ':' + nT) }, intent: 'K1', body: { op_type: 'BOOKING', params: { seq: SEQ, n: nT, doc: nodeCrypto.randomUUID() } } });
        rec.push({ h: ro.hash, cat: 'rogue-booking', exp: null, i: 1 % N, n: nT }); rogueBook++; sched.push('R'); } }
  }
  for (var round = 0; round < ROUNDS; round++) {
    if (round === ROUNDS - 2) await forceMissing();
    var anyOff = false;
    D.forEach(function (d) { if (d.off && round >= d.offUntil) d.off = false; else if (!d.off && R() < 0.22) { d.off = true; d.offUntil = round + rint(1, 3); offlineEvents++; } if (d.off) anyOff = true; });
    if (anyOff) offlineRounds++;
    var order = D.map(function (d, i) { return i; }); for (var si = order.length - 1; si > 0; si--) { var sj = Math.floor(R() * (si + 1)), tt = order[si]; order[si] = order[sj]; order[sj] = tt; }
    for (var oi of order) {
      var nact = R() < 0.6 ? 1 : 2; for (var a = 0; a < nact; a++) await act(oi);
      if (!D[oi].off && R() < 0.8) { try { await W.S[oi].sync(flaky(inner, D[oi], oi, cfg)); } catch (e) { /* the visit failed halfway: the next one repeats it */ } }
    }
  }
  var schedHash = sha(sched.join(",")).slice(0, 12)

  // ── settle: everybody online, nothing dropped, until nothing changes ──────────────────────────────────────
  D.forEach(function (d) { d.off = false; });
  var calm = { chaos: false, dropPut: 0, dropGet: 0, skipList: 0, cnt: {}, idx: cfg.idx, seed: seed }, prev = null, same = 0, settleRounds = 0;
  for (var sr = 0; sr < 14 && same < 2; sr++) {
    settleRounds++; for (var i1 = 0; i1 < N; i1++) await W.S[i1].sync(flaky(inner, D[i1], i1, calm));
    var sig = []; for (var i2 = 0; i2 < N; i2++) sig.push(W.S[i2].query('SELECT COUNT(*) AS n FROM cl_op')[0].n); var cur = sig.join(',');
    if (cur === prev && sig.every(function (x) { return x === sig[0]; })) same++; else same = 0; prev = cur;
  }
  console.log('   §CHAOS-RUN N=' + N + ' seed=' + seed + ' schedule=' + schedHash + ' rounds=' + ROUNDS + ' settle=' + settleRounds + ' ; offline periods=' + offlineEvents + ' (rounds with someone offline ' + offlineRounds + ') ; bundles dropped=' + cfg.dropped +
              ' fetches withheld=' + cfg.withheld + ' ; authored ops=' + rec.length + '+' + docOps.length + ' docs+' + claims.length + ' claims ; documents blocked offline=' + blockedDocs + ' ; ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');

  // ── judging, on every device ──────────────────────────────────────────────────────────────────────────────
  var Ls = [], opset = [], ordh = [], verh = [], escSt = [], oracleBad = [], negative = 0, notConserved = 0, consBad = [];
  var authored = 0; for (var ia = 0; ia < N; ia++) authored += W.S[ia].query("SELECT COUNT(*) AS n FROM cl_op WHERE state='OWN'")[0].n;
  for (var d2 = 0; d2 < N; d2++) {
    var S2 = W.S[d2], L = await S2.order(); Ls.push(L);
    opset.push(sha(S2.query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }).join(',')));
    ordh.push(sha(L.order.join(','))); verh.push(sha(Object.keys(L.verdict).sort().map(function (h) { return h + L.verdict[h].verdict + (L.verdict[h].reason || ''); }).join('|')));
    var stS = await S2.escrowState(RS), stC = await S2.escrowState(RC); escSt.push(JSON.stringify([stS, stC]));
    [[stS, totalS], [stC, totalC]].forEach(function (p) { var s = p[0]; if (!s) { negative += 999; return; }
      Object.keys(s.desks).forEach(function (dk) { if (s.desks[dk].available < 0) negative++; });
      if (!s.conserved || s.total !== p[1]) { notConserved++; consBad.push(s.resource); } });
    // the ORACLE: recompute every desk from the verdicts and the op parameters alone — independent of the engine's own state
    var ops = await S2.escrowOps(), model = {};
    ops.filter(function (o) { return o.verdict === 'MERGED'; }).forEach(function (o) { var m = model[o.resource] = model[o.resource] || {};
      function dd(x) { return m[x] = m[x] || { u: 0, i: 0, o: 0 }; }
      if (o.type === 'ESCROW_USE') dd(o.desk).u += o.qty; else if (o.type === 'ESCROW_TRANSFER') { dd(o.desk).o += o.qty; dd(o.to).i += o.qty; } });
    [[RS, STOCK_SLICE, stS], [RC, CRED_SLICE, stC]].forEach(function (p) { D.forEach(function (dv2) { var m = (model[p[0]] || {})[dv2.desk] || { u: 0, i: 0, o: 0 }, av = p[1] - m.u - m.o + m.i, eng = p[2].desks[dv2.desk];
      if (av < 0 || !eng || eng.available !== av || eng.used !== m.u || eng.in !== m.i || eng.out !== m.o) oracleBad.push(d2 + ':' + p[0] + ':' + dv2.desk); }); });
  }
  var allSame = function (a) { return a.every(function (x) { return x === a[0]; }); };
  verdict(allSame(opset) && W.S[0].query('SELECT COUNT(*) AS n FROM cl_op')[0].n >= authored, 'identical op set on all ' + N + ' devices, and no authored op lost', 'ops=' + W.S[0].query('SELECT COUNT(*) AS n FROM cl_op')[0].n + ' authored=' + authored + ' set=' + opset[0].slice(0, 10));
  verdict(allSame(ordh), 'identical fold order on all ' + N + ' devices', ordh[0].slice(0, 10));
  verdict(allSame(verh), 'identical verdict (MERGED/REFUSED + reason) for every op on all ' + N + ' devices', verh[0].slice(0, 10));
  verdict(allSame(escSt), 'identical escrow state on all ' + N + ' devices');
  var refusedTot = Object.keys(Ls[0].verdict).filter(function (h) { return Ls[0].verdict[h].verdict === 'REFUSED'; }).length, parkedTot = Ls[0].parked.length;
  verdict(parkedTot === 0 && Ls.every(function (L) { return L.parked.length === 0 && L.equivocations.length === 0; }), 'nothing is left PARKED and nobody equivocated after the settle', 'parked=' + parkedTot + ' refused=' + refusedTot);
  var sS0 = JSON.parse(escSt[0])[0], sC0 = JSON.parse(escSt[0])[1];
  verdict(negative === 0, 'INVARIANT per-desk available >= 0 on every device, both resources (' + (2 * N) + ' desks x ' + N + ' devices)', 'negative=' + negative);
  verdict(notConserved === 0, 'INVARIANT conservation: open total = sum available + sum used, on every device, both resources', 'stock total ' + sS0.total + ' (= ' + totalS + '), credit total ' + sC0.total + ' (= ' + totalC + ')' + (consBad.length ? ' BAD:' + consBad.join(',') : ''));
  verdict(oracleBad.length === 0, 'ORACLE: every desk\'s used/in/out/available recomputed from the MERGED ops alone equals the engine\'s state, and none is negative (' + (2 * N * N) + ' desk-views)', oracleBad.slice(0, 3).join(' '));
  var sum = function (s) { var a = 0, u = 0, i = 0, o = 0; Object.keys(s.desks).forEach(function (k) { a += s.desks[k].available; u += s.desks[k].used; i += s.desks[k].in; o += s.desks[k].out; }); return { a: a, u: u, in: i, out: o }; };
  var sm = sum(sS0), sc = sum(sC0);
  console.log('   §CHAOS-ESCROW stock: total=' + sS0.total + ' sum(available)=' + sm.a + ' sum(used)=' + sm.u + ' transfers in=' + sm.in + ' out=' + sm.out + ' ; credit: total=' + sC0.total + ' sum(available)=' + sc.a + ' sum(used)=' + sc.u);
  verdict(sm.a + sm.u === sS0.total && sm.in === sm.out && sc.a + sc.u === sC0.total, 'conservation by hand: sum(available)+sum(used) = total and transfers in = out', 'stock ' + sm.a + '+' + sm.u + '=' + (sm.a + sm.u));

  // honest ops and deliberate bad ones
  var cat = {}; rec.forEach(function (x) { var L0 = Ls[0], v = vOf(L0, x.h); var c = cat[x.cat] = cat[x.cat] || { n: 0, ok: 0, split: 0 }; c.n++;
    if (x.exp) { var ev = Ls.map(function (L) { return vOf(L, x.h); }); if (ev.every(function (e) { return e === x.exp; })) c.ok++; else if (!ev.every(function (e) { return e === ev[0]; })) c.split++; } });
  var overdrawN = (cat['overdraw-edge'] || { n: 0 }).n + (cat['overdraw-huge'] || { n: 0 }).n + (cat['xfer-overdraw'] || { n: 0 }).n;
  console.log('   §CHAOS-OPS ' + Object.keys(cat).sort().map(function (k) { return k === 'rogue-booking' ? k + ' ' + cat[k].n + ' attempted (judged below)' : k + ' ' + cat[k].ok + '/' + cat[k].n; }).join(' ; ') + ' (as expected on all devices / attempted) ; over-draws attempted=' + overdrawN);
  if (overdrawN === 0) inconclusive.push('N=' + N + ': no over-draw was attempted');
  if (offlineEvents === 0 || offlineRounds === 0) inconclusive.push('N=' + N + ': no device went offline');
  ['use-ok', 'transfer-ok'].forEach(function (k) { var c = cat[k]; verdict(c && c.n > 0 && c.ok === c.n, 'every honest ' + k + ' op (' + (c ? c.n : 0) + ') is MERGED on all devices — escrow never loses a legitimate spend', c ? c.ok + '/' + c.n : 'none attempted'); });
  [['overdraw-edge', 'over-draws by one unit (available+1)'], ['overdraw-huge', 'over-draws of more than the whole resource'], ['xfer-overdraw', 'transfers above what the desk has'], ['foreign-use', 'uses of a desk the device does not serve'], ['dup-doc', 'second uses of the same document'], ['self-reclaim', 'second KEYCLAIMs of a key the same device already holds']].forEach(function (p) {
    var c = cat[p[0]]; if (!c || !c.n) { return; } verdict(c.ok === c.n, 'every one of the ' + c.n + ' ' + p[1] + ' is REFUSED with its own reason on all devices', c.ok + '/' + c.n + (c.split ? ' (' + c.split + ' judged differently across devices)' : '')); });

  // document numbers
  var docsPerDev = [], numBad = 0, dupNum = 0, gapBad = 0, booked = (await inner.list('s/' + W.space + '/seq/' + SEQ + '/')).map(function (x) { return Number(x.split('/').pop()); }).filter(Number.isInteger).sort(function (a, b) { return a - b; });
  var mergedDocs = null;
  for (var d3 = 0; d3 < N; d3++) {
    var pl = await W.S[d3].placedEnvelopes(), dd3 = pl.filter(function (p) { return p.env.body.op_type === 'CRUD_CREATE' && p.env.target.table === 'c_order'; });
    var nums = dd3.map(function (p) { return p.env.body.params.fields.documentno; }); docsPerDev.push(nums.slice().sort().join(','));
    if (new Set(nums).size !== nums.length) dupNum++;
    if (d3 === 0) mergedDocs = dd3.map(function (p) { return { id: p.env.target.uu, grandtotal: p.env.body.params.fields.grandtotal, hash: p.hash, docno: p.env.body.params.fields.documentno, n: p.env.body.params.docno_ref.n }; });
  }
  var usedNums = mergedDocs.map(function (x) { return x.n; }).sort(function (a, b) { return a - b; }), bset = new Set(booked);
  var maxB = booked.length ? booked[booked.length - 1] : CFG.start_no - 1, unaccounted = 0; for (var nn2 = CFG.start_no; nn2 <= maxB; nn2++) if (!bset.has(nn2)) unaccounted++;
  var abandoned = booked.filter(function (n) { return usedNums.indexOf(n) < 0; });
  console.log('   §CHAOS-DOCNO booked at the post office=' + booked.length + ' (' + (booked.length ? booked[0] + '..' + maxB : 'none') + ') ; documents MERGED=' + mergedDocs.length + ' ; booked-but-no-document (abandoned or lost a double booking)=' + abandoned.length + ' ; numbers never booked inside the range=' + unaccounted +
              ' ; deliberate double bookings=' + rogueBook + ' ; documents authored=' + docOps.length + ' blocked offline=' + blockedDocs);
  verdict(allSame(docsPerDev) && dupNum === 0 && new Set(usedNums).size === usedNums.length, 'INVARIANT document numbers unique: the same set of numbered documents on all devices, no DocumentNo twice', mergedDocs.length + ' documents');
  verdict(unaccounted === 0 && usedNums.every(function (n) { return bset.has(n); }), 'INVARIANT document numbers gap-accounted: every number in the range was booked at the post office, every used number was booked, the rest are listed as abandoned', 'abandoned=' + abandoned.join(',').slice(0, 60));
  var rogue = rec.filter(function (x) { return x.cat === 'rogue-booking'; }), rl = rogue.map(function (x) { return vOf(Ls[0], x.h); });
  verdict(rogue.every(function (x) { var v = Ls.map(function (L) { return vOf(L, x.h); }); return v.every(function (y) { return y === v[0]; }) && /^(MERGED:claim|REFUSED:key-claimed)$/.test(v[0]); }), 'every deliberate double BOOKING is decided one way on all devices (REFUSED key-claimed, or — if it sorted first — it wins and the other document is refused); the number is never used twice', rl.length ? rl.filter(function (x) { return /REFUSED/.test(x); }).length + ' refused of ' + rl.length : 'none attempted');

  // KEYCLAIM
  var contested = 0, claimBad = 0, multi = 0;
  CLAIMKEYS.forEach(function (key) { var cs = claims.filter(function (c) { return c.key === key; }); if (cs.length < 2) return; contested++;
    var winners = Ls.map(function (L) { return cs.filter(function (c) { return vOf(L, c.h) === 'MERGED:claim'; }).map(function (c) { return c.h; }).join(','); });
    if (!allSame(winners) || winners[0].split(',').filter(Boolean).length !== 1) claimBad++;
    var losers = cs.filter(function (c) { return winners[0].indexOf(c.h) < 0; }); if (!losers.every(function (c) { return Ls.every(function (L) { return vOf(L, c.h) === 'REFUSED:key-claimed'; }); })) claimBad++; });
  console.log('   §CHAOS-CLAIM keys used=' + CLAIMKEYS.filter(function (k) { return claims.some(function (c) { return c.key === k; }); }).length + ' contested keys=' + contested + ' claims=' + claims.length + ' (second claim by the same device: ' + dupClaim + ')');
  if (contested === 0) inconclusive.push('N=' + N + ': no KEYCLAIM key was contested');
  if (dupClaim === 0) inconclusive.push('N=' + N + ': no device claimed a key twice');
  if (rogueBook === 0) inconclusive.push('N=' + N + ': no deliberate double BOOKING was attempted');
  verdict(contested > 0 && claimBad === 0, 'INVARIANT each contested KEYCLAIM key has exactly ONE winner, the same on every device; every other claim is REFUSED key-claimed', 'contested=' + contested + ' bad=' + claimBad);

  // the derived ledger
  var ledgers = [];
  for (var d4 = 0; d4 < N; d4++) {
    var S4 = W.S[d4], pl4 = await S4.placedEnvelopes(), docs4, uses4;
    var rows = pl4.filter(function (p) { return p.env.body.op_type === 'CRUD_CREATE' && p.env.target.table === 'c_order'; });
    if (MUTATE === 'ledger-order') { var arrival = {}; S4.query('SELECT rowid AS r, op_hash FROM cl_op').forEach(function (x) { arrival[x.op_hash] = x.r; }); rows.sort(function (a, b) { return arrival[a.hash] - arrival[b.hash]; }); rows = rows.slice(0, Math.floor(rows.length * 0.7)); }      // MUTANT: a ledger built from the first 70% of the documents IN THE ORDER THEY ARRIVED (a cursor, not a fold)
    else rows.sort(function (a, b) { return a.env.target.uu < b.env.target.uu ? -1 : 1; });
    docs4 = rows.map(function (p) { return { id: p.env.target.uu, grandtotal: p.env.body.params.fields.grandtotal }; });
    uses4 = (await S4.escrowOps()).filter(function (o) { return o.type === 'ESCROW_USE' && o.verdict === 'MERGED' && o.resource === RS; }).sort(function (a, b) { return a.hash < b.hash ? -1 : 1; }).map(function (o) { return { op: o.hash, resource: o.resource, qty: o.qty }; });
    ledgers.push(ledgerOf(docs4, uses4, MANIFEST));
  }
  var L0g = ledgers[0], M2 = Object.assign({}, MANIFEST, { tax_bp: 700 }), other = null;
  { var S5 = W.S[0], pl5 = (await S5.placedEnvelopes()).filter(function (p) { return p.env.body.op_type === 'CRUD_CREATE' && p.env.target.table === 'c_order'; }).sort(function (a, b) { return a.env.target.uu < b.env.target.uu ? -1 : 1; });
    other = ledgerOf(pl5.map(function (p) { return { id: p.env.target.uu, grandtotal: p.env.body.params.fields.grandtotal }; }), (await S5.escrowOps()).filter(function (o) { return o.type === 'ESCROW_USE' && o.verdict === 'MERGED' && o.resource === RS; }).map(function (o) { return { op: o.hash, resource: o.resource, qty: o.qty }; }), M2); }
  var accN = Object.keys(L0g.tb).length;
  console.log('   §CHAOS-LEDGER documents=' + mergedDocs.length + ' stock issues=' + (await W.S[0].escrowOps()).filter(function (o) { return o.type === 'ESCROW_USE' && o.verdict === 'MERGED' && o.resource === RS; }).length + ' accounts=' + accN + ' debits=' + L0g.debits + ' credits=' + L0g.credits + ' hash=' + L0g.hash.slice(0, 16) +
              ' ; hashes equal on ' + ledgers.filter(function (l) { return l.hash === L0g.hash; }).length + '/' + N + ' ; control (tax 7%) hash=' + other.hash.slice(0, 16));
  if (!mergedDocs.length) inconclusive.push('N=' + N + ': no document reached the ledger');
  verdict(ledgers.every(function (l) { return l.balanced; }) && L0g.debits > 0, 'the derived ledger balances on every device: debits = credits', L0g.debits + ' = ' + L0g.credits);
  verdict(ledgers.every(function (l) { return l.hash === L0g.hash; }), 'the trial-balance HASH is equal on all ' + N + ' devices (ledgerOf is a pure function of the folded documents under the pinned manifest)', L0g.hash.slice(0, 16));
  verdict(other.hash !== L0g.hash, 'CONTROL: a different manifest (tax 7% instead of 6%) over the same documents gives a different hash — the equality above can fail', other.hash.slice(0, 16));
  return { N: N, ms: Date.now() - t0 };
}

(async function () {
  var arg = process.argv[2] || process.env.N || '12', seed0 = Number(process.argv[3] || process.env.SEED || 20261024);
  var Ns = arg === 'sweep' ? [6, 12, 24] : [Number(arg)];
  console.log('═══ W-INVARIANTS-CHAOS — do the business invariants survive offline partitions, dropped and re-sent bundles, shuffled delivery and deliberate abuse? (TEAMWORK_FRAMEWORK §13.12.J.1) ═══');
  console.log('   seed=' + seed0 + ' sweep N=' + Ns.join('/') + (process.env.COMM_DIR ? ' [COMM_DIR=' + B + ']' : '') + (MUTATE ? ' [MUTATE=' + MUTATE + ']' : ''));
  var SQL = await initSqlJs(), t0 = Date.now();
  for (var n of Ns) await runN(SQL, n, seed0 + n);
  console.log('\n──────────────────────────────────────────────');
  var tag = inconclusive.length || judged === 0 ? 'INCONCLUSIVE' : (fails ? 'FAIL' : 'PASS');
  console.log('§W-INVARIANTS-CHAOS ' + tag + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inconclusive.length + ' seed=' + seed0 + ' N=' + Ns.join('/') + (inconclusive.length ? ' — ' + inconclusive.join(' | ') : '') + ' (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)' +
              (process.env.COMM_DIR ? ' [COMM_DIR]' : '') + (MUTATE ? ' [MUTATE=' + MUTATE + ']' : ''));
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
