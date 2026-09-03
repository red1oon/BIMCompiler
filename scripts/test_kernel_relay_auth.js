#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-RELAY-AUTH — Implementing prompts/BACKEND_SUBSTRATE_LANE.md §RELAY_AUTH (§RA.2 layering, §RA.3 arms).
//   THE ISSUE this proves/disproves: S-1 (§MH.4) — `POST /push` on build/erp/erp_relay_server.js admitted anything
//   with an op_uuid, so an anonymous party could FILL THE LOG (storage exhaustion + a snapshot every honest reader
//   must replay past). This is an AVAILABILITY hole, not a forgery hole — clients verify on replay regardless.
//   Each arm has a falsifier that fires; every rejection arm asserts the LOG LENGTH IS UNCHANGED (head + /snapshot),
//   never merely that a 4xx came back.
//     §RA-PIN      — a roster signed by a NON-pinned HQ key is refused at boot (the relay never starts open by accident)
//     §RA-VACUITY  — an EMPTY roster rejects everything and is reported VACUOUS, never PASS
//     §RA-1 ADMIT              — an op signed by a roster device is admitted via the REAL rebase path and reads back verified
//     §RA-2 REJECT-UNSIGNED    — no sig / v1 row → refused, log unchanged
//     §RA-3 REJECT-UNKNOWN-KID — validly self-signed under a key ABSENT from the roster → refused (the anonymous flooder)
//     §RA-4 REJECT-REVOKED     — a REVOKED kid's FUTURE ops refused; its PAST op stays in the log and still verifies
//                                (burn-not-reattribute). 4b: ROTATE supersedes the outgoing kid, the successor pushes.
//     §RA-5 REJECT-TAMPERED    — params mutated after signing → bad_sig (reaches ECDSA once, then cached).
//                                5b: a v1 (op_hash-signed) sig copied onto a fresh op_uuid "verifies" over its own
//                                self-asserted op_hash — which is exactly why v1 rows are refused at SHAPE, not verified.
//     §RA-6 ORDERING           — an unknown-kid flood never reaches ECDSA (verify_attempts FLAT); caps trip BEFORE parsing;
//                                dedup runs BEFORE verify; the residual (known-kid garbage sigs) is MEASURED, not hidden.
//     §RA-7 IDEMPOTENCE        — scripts/test_kernel_relay.js (W-RELAY) passes UNMODIFIED (md5 == committed blob) as a
//                                child process; revocation/ROTATE state survives a gated restart from the JSONL.
// §-log first — READ build/erp/test_kernel_relay_auth.log before any conclusion (exit code is NOT evidence).
// Run:  bash build/erp/run_witness.sh scripts/test_kernel_relay_auth.js     (cwd = bim-compiler)
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} }; global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs'), cp = require('child_process'), ncrypto = require('crypto');
var initSqlJs = require('sql.js');
var ERP = path.join(__dirname, '..', 'build', 'erp');
var KERNEL = path.join(ERP, 'kernel_ops.js');
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
var FSM = require(path.join(ERP, 'erp_sync_fsm.js'));
var RELAY = require(path.join(ERP, 'erp_relay_server.js'));
var CLIENT = require(path.join(ERP, 'erp_relay_client.js'));
var SIGN = require(path.join(ERP, 'erp_snapshot_sign.js'));
var EP = require(path.join(ERP, 'erp_key_epochs.js'));

var fails = 0, checks = 0, armFail = {};
function verdict(arm, ok, label, detail) { checks++; if (!ok) { fails++; armFail[arm] = 1; } console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + arm + ' ' + label + (detail ? ' — ' + detail : '')); }
var BASE_TS = 1700000000000, tsN = 0; function ts() { return BASE_TS + (++tsN); }
var PORT = 8400 + (process.pid % 200), PERSIST = '/tmp/relay_auth_' + process.pid + '.jsonl';

// ── devices: kid = hex(raw pubkey), exactly as erp_signer.installSigner derives it (erp_signer.js:88) ──
function hex(buf) { return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
async function genDev(name) {
  var kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return { name: name, kid: hex(await crypto.subtle.exportKey('raw', kp.publicKey)),
           privJwk: await crypto.subtle.exportKey('jwk', kp.privateKey), pubJwk: await crypto.subtle.exportKey('jwk', kp.publicKey) };
}
// the kernel signer contract (sign(hashHex)->sigHex / verify) over the shipped primitives — same encoding as erp_signer.makeSigner
function signerOf(d) { return { sign: function (h) { return SIGN.signTip(d.privJwk, h); }, verify: function (h, s) { return SIGN.verifyTip(h, s, d.pubJwk); } }; }
function devK(d, v2) { var K = freshK(); if (v2 !== false) K.setContentSigning(true); if (d) K.setSigner(signerOf(d), d.kid); return K; }
// what the shipped client pushes: the FSM rebase SELECT (erp_sync_fsm.js:179) — no op_hash, no user_tag
function rowsOf(db) {
  var r = db.exec('SELECT op_uuid,timestamp,op_type,parameters,input_guids,output_guid,gid,branch_id,sig,op_hash FROM kernel_ops ORDER BY id');
  return r.length ? r[0].values.map(function (v) { return { op_uuid: v[0], timestamp: v[1], op_type: v[2], parameters: v[3], input_guids: v[4], output_guid: v[5], gid: v[6], branch_id: v[7], sig: v[8], _op_hash: v[9] }; }) : [];
}
function strip(rows) { return rows.map(function (r) { var o = {}; Object.keys(r).forEach(function (k) { if (k !== '_op_hash') o[k] = r[k]; }); return o; }); }
async function commitSealed(K, db, type, params) { K.commitOp(db, type, params, null, null, null, ts()); await K.sealChain(db); }
async function post(url, bodyObj) {
  try { var res = await fetch(url + '/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj) });
        return { status: res.status, json: await res.json() }; }
  catch (e) { return { status: 0, error: (e && e.cause && e.cause.code) || (e && e.message) }; }
}
async function snapLen(url) { return (await (await fetch(url + '/snapshot')).json()).ops.length; }
async function snapshot(url) { return (await (await fetch(url + '/snapshot')).json()).ops; }
async function verifyRow(K, op, pubJwk) { return SIGN.verifyTip(await K._contentHash(op), op.sig, pubJwk); }
function vacuity(roster) { return Object.keys((roster && roster.payload && roster.payload.devices) || {}).length === 0 ? 'VACUOUS' : 'POPULATED'; }
function md5(b) { return ncrypto.createHash('md5').update(b).digest('hex'); }

(async function () {
  console.log('═══ W-RELAY-AUTH — roster-gated /push closes S-1 (availability), relay stays untrusted ═══\n');
  if (typeof fetch === 'undefined') { console.log('🔴 no global fetch (need Node 18+)'); process.exit(1); }
  try { fs.unlinkSync(PERSIST); } catch (e) {}
  var SQL = await initSqlJs();
  var HQ = await genDev('HQ'), ROGUE_HQ = await genDev('ROGUE_HQ');
  var A = await genDev('A'), B = await genDev('B'), B2 = await genDev('B2'), C = await genDev('C'), X = await genDev('X');
  var devices = {}; [A, B, B2, C].forEach(function (d) { devices[d.kid] = d.pubJwk; });
  freshK();   // erp_key_epochs resolves KernelOps.stableStringify via window
  var roster = await EP.signRoster({ devices: devices, genesisKid: A.kid, note: 'W-RELAY-AUTH' }, HQ.privJwk);
  console.log('§RA roster devices=' + Object.keys(devices).length + ' (A,B,B2,C) outsider=X kid_len=' + A.kid.length + ' vacuity=' + vacuity(roster));
  if (vacuity(roster) === 'VACUOUS') { console.log('\n⚠ W-RELAY-AUTH VACUOUS — roster empty; an empty roster rejects everything and proves nothing'); process.exit(2); }

  // ── §RA-PIN ──
  console.log('\n§RA-PIN — roster signed by a NON-pinned HQ key is refused at boot');
  var rogue = await EP.signRoster({ devices: devices, genesisKid: A.kid }, ROGUE_HQ.privJwk);
  var pinErr = null; try { await RELAY.createRelayServer({ port: PORT + 5, roster: rogue, hqPub: HQ.pubJwk }).listen(); } catch (e) { pinErr = e.message; }
  verdict('§RA-PIN', /roster refused/.test(pinErr || ''), 'relay refuses to start under a rogue-HQ roster', String(pinErr));

  // ── §RA-VACUITY ──
  console.log('\n§RA-VACUITY — an EMPTY (validly signed) roster rejects everything → reported VACUOUS, not PASS');
  var empty = await EP.signRoster({ devices: {}, genesisKid: null }, HQ.privJwk);
  var sv = RELAY.createRelayServer({ port: PORT + 6, roster: empty, hqPub: HQ.pubJwk }); await sv.listen();
  var KA0 = devK(A), dbA0 = new SQL.Database(); await commitSealed(KA0, dbA0, 'CREATE', { actor: 'A', target: 'ORD-V' });
  var rv = await post(sv.url, { ops: strip(rowsOf(dbA0)) });
  verdict('§RA-VACUITY', rv.status === 403 && rv.json.rejected === 1 && rv.json.reasons.unknown_kid === 1 && sv.head() === 0, 'valid roster-member op is refused by the empty roster (head=0)', 'status=' + rv.status + ' reasons=' + JSON.stringify(rv.json && rv.json.reasons));
  verdict('§RA-VACUITY', vacuity(empty) === 'VACUOUS' && sv.stats().devices === 0, 'guard names it VACUOUS (devices=0) — a perfect-looking gate that admits nothing is not a pass', 'vacuity=' + vacuity(empty));
  await sv.close();

  // ── the gated relay under test ──
  var srv = RELAY.createRelayServer({ port: PORT, persistPath: PERSIST, roster: roster, hqPub: HQ.pubJwk });
  await srv.listen(); var client = CLIENT.createRelayClient(srv.url);

  // ── §RA-1 ADMIT ──
  console.log('\n§RA-1 ADMIT — roster device A syncs via the REAL FSM.rebase path; ops read back and verify');
  var KA = devK(A), dbA = new SQL.Database();
  KA.commitOp(dbA, 'CREATE', { actor: 'A', target: 'ORD-A' }, null, null, null, ts());
  KA.commitOp(dbA, 'COMPLETE', { actor: 'A', target: 'ORD-A' }, null, null, null, ts());
  await KA.sealChain(dbA);
  await FSM.rebase(dbA, KA, client);
  var s1 = await snapshot(srv.url), v1a = await verifyRow(KA, s1[0] || {}, A.pubJwk), v1b = await verifyRow(KA, s1[1] || {}, A.pubJwk);
  var chainA = await KA.verifyChain(dbA);
  verdict('§RA-1', srv.head() === 2 && s1.length === 2, 'accepted=2 → head=2, /snapshot length 2', 'head=' + srv.head() + ' snap=' + s1.length);
  verdict('§RA-1', v1a && v1b && JSON.parse(s1[0].parameters).signed_by === A.kid, 'both stored ops verify under A.pub over the CONTENT hash; signed_by=A', 'v=' + v1a + '/' + v1b);
  verdict('§RA-1', chainA.ok && chainA.len === 2, "A's local chain still verifies after the round trip (relay changed nothing)", 'ok=' + chainA.ok);
  var opBytes = JSON.stringify(s1[0]).length; console.log('§RA-1 measured signed op JSON bytes=' + opBytes + ' (maxOps=500 ≈ ' + Math.round(opBytes * 500 / 1024) + ' KB, under the 1 MiB body cap)');

  // ── §RA-2 REJECT-UNSIGNED ──
  console.log('\n§RA-2 REJECT-UNSIGNED — no sig / no signed_by → refused, log length UNCHANGED');
  var h0 = srv.head(), n0 = await snapLen(srv.url);
  var KU = devK(null, false), dbU = new SQL.Database(); await commitSealed(KU, dbU, 'CREATE', { actor: 'U', target: 'ORD-U' });   // v1, unsigned
  var r2 = await post(srv.url, { ops: strip(rowsOf(dbU)) });
  verdict('§RA-2', r2.status === 403 && r2.json.accepted === 0 && r2.json.rejected === 1 && r2.json.reasons.not_content_signed === 1, 'unsigned v1 row refused (not_content_signed)', 'status=' + r2.status + ' ' + JSON.stringify(r2.json && r2.json.reasons));
  var KA2 = devK(A), dbA2 = new SQL.Database(); await commitSealed(KA2, dbA2, 'CREATE', { actor: 'A', target: 'ORD-A3' });
  var stripped = strip(rowsOf(dbA2)); stripped[0].sig = null;
  var r2b = await post(srv.url, { ops: stripped });
  verdict('§RA-2', r2b.status === 403 && r2b.json.rejected === 1 && r2b.json.reasons.shape === 1, 'signed_by present but sig stripped → refused at shape', JSON.stringify(r2b.json && r2b.json.reasons));
  verdict('§RA-2', srv.head() === h0 && (await snapLen(srv.url)) === n0, 'LOG LENGTH UNCHANGED (head + /snapshot)', 'head=' + srv.head() + ' snap=' + n0);

  // ── §RA-3 REJECT-UNKNOWN-KID ──
  console.log('\n§RA-3 REJECT-UNKNOWN-KID — validly self-signed under a key NOT in the roster (the anonymous flooder)');
  var KX = devK(X), dbX = new SQL.Database();
  for (var i = 0; i < 5; i++) KX.commitOp(dbX, 'CREATE', { actor: 'X', target: 'FLOOD-' + i }, null, null, null, ts());
  await KX.sealChain(dbX);
  var xrows = strip(rowsOf(dbX)); var selfOk = await verifyRow(KX, xrows[0], X.pubJwk);
  var r3 = await post(srv.url, { ops: xrows });
  verdict('§RA-3', selfOk === true, "X's ops ARE validly signed under X's own key (so only the roster stands between X and the log)", 'selfVerify=' + selfOk);
  verdict('§RA-3', r3.status === 403 && r3.json.rejected === 5 && r3.json.reasons.unknown_kid === 5, 'all 5 refused as unknown_kid', 'status=' + r3.status + ' ' + JSON.stringify(r3.json && r3.json.reasons));
  verdict('§RA-3', srv.head() === h0 && (await snapLen(srv.url)) === n0, 'LOG LENGTH UNCHANGED', 'head=' + srv.head());

  // ── §RA-4 REJECT-REVOKED (+4b ROTATE) ──
  console.log('\n§RA-4 REJECT-REVOKED — C pushes, A revokes C, C\'s FUTURE op refused, C\'s PAST op stays valid');
  var KC = devK(C), dbC = new SQL.Database(); await commitSealed(KC, dbC, 'CREATE', { actor: 'C', target: 'ORD-C1' });
  var c1 = strip(rowsOf(dbC))[0]; var r4a = await post(srv.url, { ops: [c1] });
  var KAr = devK(A), dbAr = new SQL.Database(); await commitSealed(KAr, dbAr, 'REVOKE', { kind: 'REVOKE', revokedKid: C.kid });
  var r4b = await post(srv.url, { ops: strip(rowsOf(dbAr)) });
  var h4 = srv.head(), n4 = await snapLen(srv.url);
  var KC2 = devK(C), dbC2 = new SQL.Database(); await commitSealed(KC2, dbC2, 'CREATE', { actor: 'C', target: 'ORD-C2' });
  var r4c = await post(srv.url, { ops: strip(rowsOf(dbC2)) });
  var s4 = await snapshot(srv.url); var c1Stored = s4.filter(function (o) { return o.op_uuid === c1.op_uuid; })[0];
  var c1Past = c1Stored ? await verifyRow(KC, c1Stored, C.pubJwk) : false;
  verdict('§RA-4', r4a.status === 200 && r4a.json.accepted === 1 && r4b.status === 200 && r4b.json.accepted === 1 && h4 === h0 + 2, "C's op admitted, then A's REVOKE(C) admitted (head +2)", 'head=' + h4);
  verdict('§RA-4', r4c.status === 403 && r4c.json.rejected === 1 && r4c.json.reasons.revoked_kid === 1, "C's FUTURE op refused as revoked_kid", JSON.stringify(r4c.json && r4c.json.reasons));
  verdict('§RA-4', srv.head() === h4 && (await snapLen(srv.url)) === n4, 'LOG LENGTH UNCHANGED after the refused op', 'head=' + srv.head());
  verdict('§RA-4', !!c1Stored && c1Stored.seq === h0 + 1 && c1Past === true, "C's PAST op is still in the log at its seq and still verifies under C.pub (burn-not-reattribute)", 'seq=' + (c1Stored && c1Stored.seq) + ' verifies=' + c1Past);
  console.log('§RA-4b ROTATE — B rotates to B2: B is superseded, B2 pushes');
  var KB = devK(B), dbB = new SQL.Database(); await commitSealed(KB, dbB, 'ROTATE', { kind: 'ROTATE', newKid: B2.kid });
  var r4d = await post(srv.url, { ops: strip(rowsOf(dbB)) });
  var dbB1 = new SQL.Database(); await commitSealed(KB, dbB1, 'CREATE', { actor: 'B', target: 'ORD-B-OLD' });
  var r4e = await post(srv.url, { ops: strip(rowsOf(dbB1)) });
  var KB2 = devK(B2), dbB2 = new SQL.Database(); await commitSealed(KB2, dbB2, 'CREATE', { actor: 'B2', target: 'ORD-B2' });
  var r4f = await post(srv.url, { ops: strip(rowsOf(dbB2)) });
  verdict('§RA-4b', r4d.json.accepted === 1 && r4e.status === 403 && r4e.json.reasons.superseded_kid === 1 && r4f.json.accepted === 1 && srv.head() === h4 + 2, 'ROTATE admitted; outgoing B refused (superseded_kid); successor B2 admitted', 'head=' + srv.head());

  // ── §RA-5 REJECT-TAMPERED ──
  console.log('\n§RA-5 REJECT-TAMPERED — params mutated after signing → bad_sig; identical re-push hits the failure cache');
  var h5 = srv.head(), n5 = await snapLen(srv.url), att5 = srv.stats().verify_attempts;
  var KA5 = devK(A), dbA5 = new SQL.Database(); await commitSealed(KA5, dbA5, 'POST', { actor: 'A', target: 'ORD-5', amount_cents: 100 });
  var t5 = strip(rowsOf(dbA5))[0]; var p5 = JSON.parse(t5.parameters); p5.amount_cents = 100000; t5.parameters = JSON.stringify(p5);   // keeps _sigv:2 + signed_by
  var r5 = await post(srv.url, { ops: [t5] }), att5a = srv.stats().verify_attempts;
  var r5b = await post(srv.url, { ops: [t5] }), att5b = srv.stats().verify_attempts;
  verdict('§RA-5', r5.status === 403 && r5.json.reasons.bad_sig === 1 && att5a === att5 + 1, 'tampered op refused as bad_sig; reached ECDSA exactly once (the LAST layer)', 'attempts ' + att5 + '→' + att5a);
  verdict('§RA-5', r5b.status === 403 && r5b.json.reasons.bad_sig === 1 && att5b === att5a, 'identical tampered re-push refused from the failure cache (attempts flat)', 'attempts=' + att5b);
  verdict('§RA-5', srv.head() === h5 && (await snapLen(srv.url)) === n5, 'LOG LENGTH UNCHANGED', 'head=' + srv.head());
  console.log('§RA-5b V1-REPLAY — a v1 (op_hash-signed) sig copied onto a FRESH op_uuid "verifies" over its self-asserted op_hash');
  var KV = devK(B2, false), dbV = new SQL.Database(); await commitSealed(KV, dbV, 'CREATE', { actor: 'B2', target: 'ORD-V1' });   // v1: sig over op_hash
  var v = rowsOf(dbV)[0]; var forged = { op_uuid: crypto.randomUUID(), timestamp: v.timestamp, op_type: 'POST', parameters: JSON.stringify({ actor: 'B2', target: 'GARBAGE', signed_by: B2.kid }), input_guids: null, output_guid: null, gid: null, branch_id: null, sig: v.sig, op_hash: v._op_hash };
  var wouldPass = await SIGN.verifyTip(forged.op_hash, forged.sig, B2.pubJwk); var att5c = srv.stats().verify_attempts;
  var r5c = await post(srv.url, { ops: [forged] });
  verdict('§RA-5b', wouldPass === true, 'FALSIFIER: the copied v1 sig DOES verify over the client-asserted op_hash — a relay verifying v1 rows would admit garbage', 'verifyTip(op_hash)=' + wouldPass);
  verdict('§RA-5b', r5c.status === 403 && r5c.json.reasons.not_content_signed === 1 && srv.stats().verify_attempts === att5c && srv.head() === h5, 'gate refuses it at SHAPE (not_content_signed), no ECDSA, log unchanged', JSON.stringify(r5c.json && r5c.json.reasons));

  // ── §RA-6 ORDERING ──
  console.log('\n§RA-6 ORDERING — cheapest-first: an unknown-kid flood never reaches ECDSA; caps trip before parsing; dedup before verify');
  var h6 = srv.head(), n6 = await snapLen(srv.url), att6 = srv.stats().verify_attempts;
  var KXf = devK(X), dbXf = new SQL.Database();
  for (var j = 0; j < 200; j++) KXf.commitOp(dbXf, 'CREATE', { actor: 'X', target: 'FLOOD-' + j }, null, null, null, ts());
  await KXf.sealChain(dbXf); var flood = strip(rowsOf(dbXf));
  var r6 = await post(srv.url, { ops: flood });
  verdict('§RA-6', r6.status === 403 && r6.json.rejected === 200 && r6.json.reasons.unknown_kid === 200, '200-op unknown-kid flood: all refused', JSON.stringify(r6.json && r6.json.reasons));
  verdict('§RA-6', srv.stats().verify_attempts === att6, 'verify_attempts FLAT across the flood (' + att6 + '→' + srv.stats().verify_attempts + ') — the CPU path was never reached', '');
  var big = flood.concat(flood, flood).slice(0, 501);   // 501 > maxOps (uuids repeat, irrelevant — the cap trips before per-op processing)
  var r6b = await post(srv.url, { ops: big });
  var bodyStr = '{"ops":[{"op_uuid":"x","parameters":"' + 'a'.repeat(1.2 * 1024 * 1024) + '"}]}';
  var r6c = await post(srv.url, bodyStr); var st6 = srv.stats();
  verdict('§RA-6', r6b.status === 413 && r6b.json.error === 'too_many_ops', '501 ops → 413 too_many_ops before any per-op layer', 'status=' + r6b.status);
  verdict('§RA-6', (r6c.status === 413 || r6c.status === 0) && st6.reasons.body_too_large >= 1, '1.2 MiB body → refused before parsing (body_too_large)', 'status=' + r6c.status + (r6c.error ? ' err=' + r6c.error : '') + ' body_too_large=' + st6.reasons.body_too_large);
  var r6d = await post(srv.url, { ops: await snapshot(srv.url) });
  verdict('§RA-6', r6d.status === 200 && r6d.json.accepted === 0 && r6d.json.skipped === h6 && srv.stats().verify_attempts === att6, 're-push of the whole canonical log: skipped=' + h6 + ' by dedup, attempts still flat', 'attempts=' + srv.stats().verify_attempts);
  verdict('§RA-6', srv.head() === h6 && (await snapLen(srv.url)) === n6, 'LOG LENGTH UNCHANGED through the whole arm', 'head=' + srv.head());
  // residual, measured: a flooder who knows a roster kid (public in every snapshot) but not its key forces ONE ECDSA per op
  var garbage = flood.slice(0, 50).map(function (o) { var p = JSON.parse(o.parameters); p.signed_by = A.kid; return Object.assign({}, o, { op_uuid: crypto.randomUUID(), parameters: JSON.stringify(p) }); });
  var ms0 = srv.stats().verify_ms, r6e = await post(srv.url, { ops: garbage }), st6e = srv.stats();
  verdict('§RA-6', r6e.status === 403 && r6e.json.reasons.bad_sig === 50 && st6e.verify_attempts === att6 + 50 && srv.head() === h6, 'RESIDUAL (stated, not hidden): known-kid garbage-sig flood costs one ECDSA per op — 50 ops → attempts +50, log unchanged', 'verify_ms=' + (st6e.verify_ms - ms0) + ' for 50 → ~' + Math.round((st6e.verify_ms - ms0) * 1000 / 50) + ' µs/op');

  // ── §RA-7 IDEMPOTENCE PRESERVED ──
  console.log('\n§RA-7 IDEMPOTENCE PRESERVED — W-RELAY passes UNMODIFIED; gated restart replays log + revocation state');
  var wrPath = path.join(__dirname, 'test_kernel_relay.js'), wrLive = md5(fs.readFileSync(wrPath)), wrHead = null, wrLast = '';
  try { wrHead = md5(cp.execSync('git show HEAD:scripts/test_kernel_relay.js', { cwd: path.join(__dirname, '..') })); wrLast = cp.execSync('git log -1 --format=%h/%cs -- scripts/test_kernel_relay.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim(); } catch (e) {}
  verdict('§RA-7', wrHead !== null && wrLive === wrHead, 'scripts/test_kernel_relay.js is byte-identical to the committed blob (last touched ' + wrLast + ')', 'md5=' + wrLive.slice(0, 8));
  var wr = cp.spawnSync('node', [wrPath], { cwd: path.join(__dirname, '..'), encoding: 'utf8', timeout: 120000 });
  var wrOut = (wr.stdout || '') + (wr.stderr || '');
  verdict('§RA-7', wr.status === 0 && /🟢 ALL PASS/.test(wrOut) && /§RELAY_AUTH mode=OPEN/.test(wrOut), 'W-RELAY child run: exit 0 + "🟢 ALL PASS" + it ran in OPEN mode (no roster passed)', 'exit=' + wr.status + ' converge/idempotent/durable lines=' + (wrOut.match(/🟢/g) || []).length);
  var hBefore = srv.head(); await srv.close();
  var srv2 = RELAY.createRelayServer({ port: PORT + 1, persistPath: PERSIST, roster: roster, hqPub: HQ.pubJwk }); await srv2.listen();
  var KC3 = devK(C), dbC3 = new SQL.Database(); await commitSealed(KC3, dbC3, 'CREATE', { actor: 'C', target: 'ORD-C3' });
  var r7a = await post(srv2.url, { ops: strip(rowsOf(dbC3)) });
  var dbB3 = new SQL.Database(); await commitSealed(KB, dbB3, 'CREATE', { actor: 'B', target: 'ORD-B-OLD2' });
  var r7b = await post(srv2.url, { ops: strip(rowsOf(dbB3)) });
  var dbB4 = new SQL.Database(); await commitSealed(KB2, dbB4, 'CREATE', { actor: 'B2', target: 'ORD-B2-2' });
  var r7c = await post(srv2.url, { ops: strip(rowsOf(dbB4)) });
  verdict('§RA-7', srv2.head() === hBefore + 1 && r7a.status === 403 && r7a.json.reasons.revoked_kid === 1 && r7b.status === 403 && r7b.json.reasons.superseded_kid === 1 && r7c.json.accepted === 1,
          'restart replayed head=' + hBefore + ' from JSONL; C still revoked, B still superseded, B2 still admitted (+1)', 'head=' + srv2.head());
  await srv2.close();
  try { fs.unlinkSync(PERSIST); } catch (e) {}

  var st = { arms: ['§RA-PIN', '§RA-VACUITY', '§RA-1', '§RA-2', '§RA-3', '§RA-4', '§RA-4b', '§RA-5', '§RA-5b', '§RA-6', '§RA-7'] };
  console.log('\n§RA-SUMMARY checks=' + checks + ' fails=' + fails + ' roster_devices=' + Object.keys(devices).length + ' arms_failed=' + (Object.keys(armFail).join(',') || 'none'));
  console.log('   ▸ S-1 closed IN THE CODE (gated mode): anonymous/unknown/revoked/unsigned/tampered pushes leave the log untouched and');
  console.log('     an unknown-kid flood never reaches ECDSA. OPEN mode (no roster) still exists and is logged as S-1 OPEN — a deployment');
  console.log('     must pass a roster. Nothing here is deployed on real compute over https (S-2 stands).');
  console.log('\n═══ ' + (fails ? '🔴 W-RELAY-AUTH FAIL (' + fails + ' of ' + checks + ')' : '🟢 W-RELAY-AUTH PASS (' + checks + '/' + checks + ' checks, ' + st.arms.length + ' arms, roster_devices=' + Object.keys(devices).length + ')') + ' ═══');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
