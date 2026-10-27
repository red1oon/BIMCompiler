#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_docno_booking.js — W-DOCNO-BOOKING. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.F + §13.12.F.1 (mode B: a document number is BOOKED at the post office).
 * Real modules in an ENCRYPTED space; the pipe is memPipe (putIfAbsent); the sequence is an AD_Sequence-like config object passed to open() — no table is named in the engine.
 *
 *   §BK-RACE      — two devices Complete at once (a barrier forces both to read the post office before either writes): two DIFFERENT consecutive numbers; the loser retried inside
 *                   the same Complete; every device ends with both documents MERGED under those numbers. INCONCLUSIVE if nobody lost the race.
 *   §BK-ORDER     — six more Completes from three devices: numbers are consecutive and gap-free, in order of booking, identical on every device.
 *   §BK-FORGED    — a document whose DocumentNo is not backed by a booking naming THAT document is REFUSED, by the generic rule: unbooked · booking of another document ·
 *                   wrong format · number set with no reference · unknown sequence. CONTROL: a properly booked document is MERGED. Same verdicts on the no-checkpoint control.
 *   §BK-BACKSTOP  — two BOOKING ops for ONE number written without consulting the pipe (it was down): the fold lets exactly one win and refuses the other device's document.
 *   §BK-NOCONFIG  — with no sequence config the same ops fold exactly as before (nothing is refused for its DocumentNo). CONTROL for the rule being config-driven.
 *
 * Run: node scripts/witness_comm_docno_booking.js 2>&1 | tee build/comm/logs/witness_comm_docno_booking.log
 * ⚠ RETIRED 2026-10-27 — document numbering left the comm engine (prompts/TEAM_REPLICATION_PLUGIN_STUDY.md §12.5); kept as history, it no longer runs against build/comm.
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ADM = require(path.join(B, 'comm_admit.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {}, tcache = {};
function access(roleId, client, org, table) {
  var t = tcache[table]; if (t === undefined) t = tcache[table] = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase()) || null;
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var uuid = function () { return nodeCrypto.randomUUID(); };
var SEQ = uuid(), CFG = { uu: SEQ, tables: ['c_order'], mode: 'B', prefix: 'INV-', pad: 5, start_no: 1000, increment_no: 1 };

function mk(W, name, o) { var st = STORE.open(new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[name], access: access, log: function () {} }, o || {})); W.S[name] = st; return st; }
async function world(SQL, names, label, opts) {
  var W = { SQL: SQL, dev: {}, per: {}, S: {}, pipe: PIPE.memPipe(label) };
  for (var n of names) { W.dev[n] = await STORE.newDevice(); W.dev[n].person_uu = uuid(); W.per[n] = W.dev[n].person_uu; }
  var sp = await STORE.newSpace('bk-' + label, W.dev[names[0]], W.per[names[0]], names[0], 102); W.space = sp.space;
  mk(W, names[0], opts); await W.S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await W.S[names[0]].addPerson({ person_uu: W.per[k], name: k, ad_role_id: 102, comm_admin: false }); await W.S[names[0]].enroll(W.dev[k].kid, W.dev[k].pubJwk, W.per[k], W.dev[k].dhPubJwk); }
  for (var m of names.slice(1)) mk(W, m, m === 'O' ? Object.assign({}, opts, { noCheckpoint: true }) : opts);
  return W;
}
async function syncAll(W, names, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var n of names) await W.S[n].sync(W.pipe); }
function doc(S, docUU, docno, ref, refs, table) { var params = { fields: { documentno: docno, grandtotal: 1, ad_client_id: 11, ad_org_id: 11 } }; if (ref) params.docno_ref = ref;
  return S.author({ target: { table: table || 'c_order', uu: docUU }, refs: refs || [], intent: 'K2', body: { op_type: 'CRUD_CREATE', params: params } }); }
function vOf(L, h) { var v = L.verdict[h]; return v ? v.verdict + ':' + (v.reason || '') : 'none'; }
function barrier(n) { var c = 0, ws = []; return function () { c++; return new Promise(function (res) { ws.push(res); if (c >= n) ws.forEach(function (r) { r(); }); }); }; }

(async function () {
  console.log('═══ W-DOCNO-BOOKING — a document number is booked at the post office, verified by every peer (TEAMWORK_FRAMEWORK §13.12.F.1) ═══');
  var SQL = await initSqlJs(), names = ['A', 'B', 'C', 'V', 'O'], W = await world(SQL, names, 'main', { sequences: [CFG] }), all = names;
  await syncAll(W, all, 3);

  // ════════ RACE ════════
  var bar = barrier(2), dA = uuid(), dB = uuid();
  var rs = await Promise.all([W.S.A.numberDocument(W.pipe, SEQ, dA, { afterList: bar }), W.S.B.numberDocument(W.pipe, SEQ, dB, { afterList: bar })]);
  var nA = rs[0], nB = rs[1];
  console.log('   §BK-RACE A booked n=' + nA.n + ' (' + nA.docno + ') after ' + nA.tries + ' try ; B booked n=' + nB.n + ' (' + nB.docno + ') after ' + nB.tries + ' try');
  if (Math.max(nA.tries, nB.tries) < 2) inconclusive.push('BK-RACE: nobody lost the race, so the retry is not shown');
  verdict(nA.n !== nB.n && Math.abs(nA.n - nB.n) === 1 && Math.min(nA.n, nB.n) === 1000, 'two simultaneous Completes get two DIFFERENT consecutive numbers, starting at StartNo', nA.n + ' / ' + nB.n);
  verdict(Math.max(nA.tries, nB.tries) === 2 && Math.min(nA.tries, nB.tries) === 1, 'the loser took the next free number inside the same Complete (2 tries), the winner needed 1', 'tries ' + nA.tries + '/' + nB.tries);
  var opA = await doc(W.S.A, dA, nA.docno, nA.ref, nA.refs), opB = await doc(W.S.B, dB, nB.docno, nB.ref, nB.refs);
  await syncAll(W, all, 3);
  var Ls = {}; for (var d of all) Ls[d] = await W.S[d].order();
  var okAll = all.every(function (x) { return vOf(Ls[x], opA.hash).indexOf('MERGED') === 0 && vOf(Ls[x], opB.hash).indexOf('MERGED') === 0; });
  verdict(okAll, 'both numbered documents are MERGED on all five devices (incl. the no-checkpoint control O)');
  var bookObjs = (await W.pipe.list('s/' + W.space + '/seq/' + SEQ + '/')).sort();
  verdict(bookObjs.length === 2 && JSON.parse(new TextDecoder().decode(await W.pipe.get(bookObjs[0]))).doc === (nA.n < nB.n ? dA : dB), 'the post office holds exactly two booking objects, each naming its document', bookObjs.map(function (x) { return x.split('/').pop(); }).join(','));

  // ════════ ORDER ════════
  var got = [nA.n, nB.n], docs = [];
  for (var i = 0; i < 6; i++) { var dv = ['A', 'B', 'C'][i % 3], du = uuid(), nn = await W.S[dv].numberDocument(W.pipe, SEQ, du); got.push(nn.n); docs.push(await doc(W.S[dv], du, nn.docno, nn.ref, nn.refs)); await W.S[dv].sync(W.pipe); await W.S.C.sync(W.pipe); }
  await syncAll(W, all, 3);
  var sorted = got.slice().sort(function (a, b) { return a - b; }), consec = sorted.every(function (n, ix) { return n === 1000 + ix; });
  var bookingsFold = {}; for (var d3 of all) { var q = W.S[d3].query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type='BOOKING'")[0].n; bookingsFold[d3] = q; }
  console.log('   §BK-ORDER numbers booked in order of booking: ' + got.join(',') + ' ; BOOKING ops per device ' + JSON.stringify(bookingsFold));
  verdict(consec && new Set(got).size === got.length, 'eight Completes from three devices got numbers 1000..1007, no gap and no duplicate', got.join(','));
  var Lv = await W.S.V.order(), Lo = await W.S.O.order();
  verdict(docs.every(function (o) { return vOf(Lv, o.hash).indexOf('MERGED') === 0 && vOf(Lv, o.hash) === vOf(Lo, o.hash); }), 'all six later documents are MERGED, identically on the verifier and the control');

  // ════════ FORGED ════════
  var good = uuid(), gn = await W.S.C.numberDocument(W.pipe, SEQ, good), gOp = await doc(W.S.C, good, gn.docno, gn.ref, gn.refs);          // CONTROL: booked properly
  var f1 = await doc(W.S.A, uuid(), ADM.formatDocNo(CFG, 5000, W.dev.A.kid), { seq: SEQ, n: 5000 }, []);                                  // no booking at all
  var otherDoc = uuid(), on = await W.S.A.numberDocument(W.pipe, SEQ, otherDoc);                                                           // a real booking for ANOTHER document ...
  var f2 = await doc(W.S.A, uuid(), on.docno, on.ref, on.refs);                                                                            // ... cited by this one
  var f2ok = await doc(W.S.A, otherDoc, on.docno, on.ref, on.refs);                                                                        // CONTROL: the named document itself
  var bn = await W.S.B.numberDocument(W.pipe, SEQ, uuid()), f3 = await doc(W.S.B, uuid(), 'INV-99999', bn.ref, bn.refs);                    // wrong format for a real booking
  var f4 = await doc(W.S.B, uuid(), 'INV-01234', null, []);                                                                                // a DocumentNo with no reference at all
  var f5 = await doc(W.S.B, uuid(), 'X-1', { seq: uuid(), n: 1 }, []);                                                                     // a reference to a sequence nobody configured
  var f6 = await doc(W.S.C, uuid(), ADM.formatDocNo(CFG, 1001, W.dev.C.kid), { seq: SEQ, n: 1001 }, []);                                                           // someone else's real number (1001 was booked by another device): booker mismatch
  var draft = await doc(W.S.C, uuid(), '', null, []);                                                                                      // CONTROL: a draft with no DocumentNo yet is not subject to the rule
  await syncAll(W, all, 3);
  var Lf = await W.S.V.order(), Lfo = await W.S.O.order(), Lfa = await W.S.A.order();
  var fx = { 'control: properly booked': gOp, 'no booking': f1, 'booking names another document': f2, 'control: the document the booking names': f2ok, 'wrong format': f3, 'number with no reference': f4, 'unknown sequence': f5, "another device's number": f6, 'control: draft without a number': draft };
  Object.keys(fx).forEach(function (k) { console.log('   §BK-FORGED ' + k + ' → ' + vOf(Lf, fx[k].hash) + ' (control O: ' + vOf(Lfo, fx[k].hash) + ')'); });
  verdict(vOf(Lf, gOp.hash).indexOf('MERGED') === 0 && vOf(Lf, f2ok.hash).indexOf('MERGED') === 0 && vOf(Lf, draft.hash).indexOf('MERGED') === 0, 'CONTROLS: a properly booked document, the document a booking names, and a draft without a number are all MERGED');
  verdict(vOf(Lf, f1.hash) === 'REFUSED:docno-unbooked', 'a number with no booking is REFUSED docno-unbooked');
  verdict(vOf(Lf, f2.hash) === 'REFUSED:docno-booking-names-other-doc', 'a real booking cited by a different document is REFUSED docno-booking-names-other-doc');
  verdict(vOf(Lf, f3.hash) === 'REFUSED:docno-mismatch' && vOf(Lf, f4.hash) === 'REFUSED:docno-unnumbered' && vOf(Lf, f5.hash) === 'REFUSED:docno-unknown-seq', 'wrong format → docno-mismatch ; number without reference → docno-unnumbered ; unknown sequence → docno-unknown-seq');
  verdict(/^REFUSED:docno-(booker-mismatch|booking-names-other-doc|unbooked)/.test(vOf(Lf, f6.hash)), "another device's booked number is REFUSED (the booking is not by this device / not for this document)", vOf(Lf, f6.hash));
  verdict(Object.keys(fx).every(function (k) { return vOf(Lf, fx[k].hash) === vOf(Lfo, fx[k].hash) && vOf(Lf, fx[k].hash) === vOf(Lfa, fx[k].hash); }), 'every one of those verdicts is the same on the verifier, the publisher\'s side (A) and the control — the rule is in the fold, not in one device');

  // ════════ BACKSTOP ════════
  var nBack = 1000 + got.length + 5, dX = uuid(), dY = uuid();                           // a number nobody booked through the pipe
  var bX = await W.S.A.author({ target: { table: 'comm_booking', uu: await require(path.join(B, 'comm_roster.js')).claimUU(W.space, 'BOOKING:' + SEQ + ':' + nBack) }, body: { op_type: 'BOOKING', params: { seq: SEQ, n: nBack, doc: dX } } });
  var bY = await W.S.B.author({ target: { table: 'comm_booking', uu: await require(path.join(B, 'comm_roster.js')).claimUU(W.space, 'BOOKING:' + SEQ + ':' + nBack) }, body: { op_type: 'BOOKING', params: { seq: SEQ, n: nBack, doc: dY } } });
  var refsBk = [await require(path.join(B, 'comm_roster.js')).claimUU(W.space, 'BOOKING:' + SEQ + ':' + nBack)];
  var xOp = await doc(W.S.A, dX, ADM.formatDocNo(CFG, nBack, W.dev.A.kid), { seq: SEQ, n: nBack }, refsBk), yOp = await doc(W.S.B, dY, ADM.formatDocNo(CFG, nBack, W.dev.B.kid), { seq: SEQ, n: nBack }, refsBk);
  var concurrent = bX.env.deps.indexOf(bY.hash) < 0 && bY.env.deps.indexOf(bX.hash) < 0;
  await syncAll(W, all, 3);
  var rv = []; for (var d4 of all) { var Lb = await W.S[d4].order(); rv.push([vOf(Lb, bX.hash), vOf(Lb, bY.hash), vOf(Lb, xOp.hash), vOf(Lb, yOp.hash)].join(' | ')); }
  console.log('   §BK-BACKSTOP concurrent=' + concurrent + ' ; bookings, documents on A: ' + rv[0] + ' ; identical on all five: ' + rv.every(function (z) { return z === rv[0]; }));
  if (!concurrent) inconclusive.push('BK-BACKSTOP: the two bookings were not concurrent');
  var parts = rv[0].split(' | ');
  verdict(rv.every(function (z) { return z === rv[0]; }) && parts.filter(function (z) { return z.indexOf('MERGED') === 0; }).length === 2 && /REFUSED:key-claimed/.test(parts.join()), 'with the pipe bypassed, two BOOKING ops for one number: exactly one wins in the fold (key-claimed for the other), the same on all five devices');
  var winnerIsX = parts[0].indexOf('MERGED') === 0;
  verdict(winnerIsX ? (parts[2].indexOf('MERGED') === 0 && /^REFUSED/.test(parts[3])) : (parts[3].indexOf('MERGED') === 0 && /^REFUSED/.test(parts[2])), 'the winner\'s document is MERGED and the loser\'s document (which read the lost booking) is REFUSED', winnerIsX ? 'A won' : 'B won');

  // ════════ NOCONFIG ════════
  var NW = await world(SQL, ['A', 'B'], 'noconfig', {}); await syncAll(NW, ['A', 'B'], 2);
  var nf = await doc(NW.S.A, uuid(), 'INV-77777', null, []), nf2 = await doc(NW.S.A, uuid(), 'INV-77778', { seq: SEQ, n: 1 }, []);
  await syncAll(NW, ['A', 'B'], 2); var Ln = await NW.S.B.order();
  console.log('   §BK-NOCONFIG no sequences configured: number without reference → ' + vOf(Ln, nf.hash) + ' ; with a reference → ' + vOf(Ln, nf2.hash));
  verdict(vOf(Ln, nf.hash).indexOf('MERGED') === 0 && vOf(Ln, nf2.hash).indexOf('MERGED') === 0, 'CONTROL: with no sequence config nothing is refused for its DocumentNo (the rule is driven by the config, not built in)');

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-DOCNO-BOOKING INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-DOCNO-BOOKING ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
