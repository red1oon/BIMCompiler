#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: W-COMM-VERSIONS, the witness of prompts/TEAMWORK_FRAMEWORK.md §16.31 (event versioning wired into the comm fold: build/comm/comm_store.js + comm_roster.js, registry build/erp/op_versions.js). READ THE LOG after every run.
// Real store (sql.js + WebCrypto), 3 devices on one pipe, access judged by the real MRole.canUpdate port. Every arm names the issue it proves or disproves; every refusal has a control. An arm that judged an empty population prints INCONCLUSIVE.
// Run: node scripts/witness_comm_versions.js [> build/comm/logs/witness_comm_versions.log]   env CV_NO_MUTANTS=1 skips the mutant runs; CV_ONLY_ARMS=1 prints only §CV_ARMS (child runs); CV_COMM_DIR=<dir> runs against another copy of build/comm (mutants).
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
global.window = global.window || {}; global.self = global.self || global;
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..'), B = process.env.CV_COMM_DIR || path.join(ROOT, 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ENV = require(path.join(B, 'comm_envelope.js'));
var OPV = require(path.join(process.env.CV_OPV_DIR || path.join(ROOT, 'build', 'erp'), 'op_versions.js'));
var AD = require(path.join(ROOT, 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var ONLY = !!process.env.CV_ONLY_ARMS, say = function (s) { if (!ONLY) console.log(s); }, quiet = function () {};
var ARMS = {}, JUDGED = 0, FAILS = 0, VAC = 0;
function arm(id) { return ARMS[id] = ARMS[id] || { bad: 0, vac: 0 }; }
function check(id, name, cond, detail) { arm(id); JUDGED++; if (!cond) { ARMS[id].bad++; FAILS++; } say('   ' + (cond ? '🟢' : '🔴') + ' ' + id + ' ' + name + (detail ? ' — ' + detail : '')); }
function vacuous(id, name, why) { arm(id).vac++; VAC++; say('   ❓ ' + id + ' ' + name + ' — INCONCLUSIVE: ' + why); }
var uuid = function () { return nodeCrypto.randomUUID(); };
var SIGNER = path.join(process.env.HOME, 'bim-ootb', 'erp', 'erp_signer.js');

async function mkSpace(SQL, names, pipe, mkOpts) {
  var dev = {}, per = {}, S = {}, dbs = {};
  for (var n of names) { dev[n] = await STORE.newDevice(); dev[n].person_uu = uuid(); per[n] = dev[n].person_uu; }
  var sp = await STORE.newSpace('cv-' + names.join(''), dev[names[0]], per[names[0]], names[0], 102);
  names.forEach(function (n) { dbs[n] = new SQL.Database(); S[n] = STORE.open(dbs[n], Object.assign({ SQL: SQL, space: sp.space, self: dev[n], access: access, log: quiet }, mkOpts ? mkOpts(n) : {})); });
  await S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await S[names[0]].addPerson({ person_uu: per[k], name: k, ad_role_id: 102, comm_admin: false }); await S[names[0]].enroll(dev[k].kid, dev[k].pubJwk, per[k], dev[k].dhPubJwk); }
  for (var r = 0; r < 2; r++) for (var m of names) await S[m].sync(pipe);
  return { dev: dev, per: per, S: S, dbs: dbs, space: sp.space };
}
async function allSync(S, names, pipe, rounds) { for (var r = 0; r < (rounds || 3); r++) for (var m of names) await S[m].sync(pipe); }
async function vd(s, h) { var L = await s.order(); return L.verdict[h] || null; }
var refold = function (st) { if (typeof st.refold === 'function') st.refold(); };
var tag = function (v) { return v ? v.verdict + ':' + v.reason : 'none'; };
var create = function (s, u, docno, fields, sv, table) { return s.author({ target: { table: table || 'c_order', uu: u }, intent: 'K2', body: Object.assign({ op_type: 'CRUD_CREATE', params: { fields: Object.assign({ documentno: docno, ad_client_id: 11, ad_org_id: 11 }, fields) } }, sv === undefined ? {} : { sv: sv }) }); };
var update = function (s, u, changes, sv) { return s.author({ target: { table: 'c_order', uu: u }, intent: 'K2', body: Object.assign({ op_type: 'CRUD_UPDATE', params: { changes: changes } }, sv === undefined ? {} : { sv: sv }) }); };

(async function () {
  var SQL = await initSqlJs();
  global.window = global.window || {}; delete require.cache[require.resolve(SIGNER)]; require(SIGNER); var ES = global.window.ErpSigner;
  var adminKp = await ES.mintKeypair(), admin = ES.makeSigner(adminKp);
  var TRUST = { admin: admin.verify };
  async function signed(set) { var s = JSON.parse(JSON.stringify(set)); delete s.sig; s.sig = await admin.sign(await OPV.setHash(s)); return s; }
  var SET = await signed({ kind: 'upcasters', op: 'CRUD_CREATE', signer: 'admin', steps: [{ from: 1, map: [{ at: 'fields', rename: ['grandtotal', 'total'] }] }] });
  function reg(appV, withSet) { var R = OPV.create({ trust: TRUST }); R.setApp('CRUD_CREATE', appV); return R; }
  async function regLoaded(appV) { var R = reg(appV); if (appV >= 2) await R.loadSet(SET); return R; }
  var uA = uuid(), uB = uuid(), uC = uuid();
  say('═══ §COMM-VERSIONS — W-COMM-VERSIONS: event versioning in the comm fold (spec §16.31) ═══');

  // ───────── C1 control: with no `versions` option the store is what it was ─────────
  say('\n── C1: CONTROL — without opts.versions an op stamped sv:2 is MERGED everywhere ──');
  var p1 = PIPE.memPipe('c1'), N1 = ['A', 'B'], W1 = await mkSpace(SQL, N1, p1);
  var c1 = await create(W1.S.B, uA, 'C1', { total: 5 }, 2); await allSync(W1.S, N1, p1);
  var v1a = await vd(W1.S.A, c1.hash), v1b = await vd(W1.S.B, c1.hash);
  check('C1', 'an sv:2 create is MERGED on both devices (no versions hook => unchanged behaviour)', v1a.verdict === 'MERGED' && v1b.verdict === 'MERGED', tag(v1a) + ' / ' + tag(v1b));

  // ───────── C2 / C3 / C4: three devices, A is behind ─────────
  say('\n── C2: an old app parks what it cannot read, the others fold it; after the upgrade all agree ──');
  var pipe = PIPE.memPipe('c2'), names = ['A', 'B', 'C'], R = { A: await regLoaded(1), B: await regLoaded(2), C: await regLoaded(2) };
  var W = await mkSpace(SQL, names, pipe, function (n) { return { versions: R[n] }; }), S = W.S;
  var o1 = await create(S.B, uA, 'L1', { grandtotal: 100 });                 // legacy v1 shape (no sv)
  var o2 = await create(S.B, uB, 'N2', { total: 50 }, 2);                    // native v2
  var o3 = await update(S.B, uB, { documentno: 'N2b' });                     // reads o2 (v1 op type: CRUD_UPDATE is not versioned here)
  await allSync(S, names, pipe);
  var vA = [], vB = [], vC = []; for (var h of [o1.hash, o2.hash, o3.hash]) { vA.push(await vd(S.A, h)); vB.push(await vd(S.B, h)); vC.push(await vd(S.C, h)); }
  check('C2', 'B and C (appV 2 + signed set) MERGE all three', vB.concat(vC).every(function (x) { return x.verdict === 'MERGED'; }), vB.concat(vC).map(tag).join(' '));
  check('C2', 'A (appV 1): the v1 op MERGES, the v2 op is PARKED needs-upgrade, the op that reads it is PARKED deps', vA[0].verdict === 'MERGED' && vA[1].verdict === 'PARKED' && vA[1].reason === 'needs-upgrade' && vA[2].verdict === 'PARKED' && vA[2].reason === 'deps', vA.map(tag).join(' '));
  var fA = (await S.A.foldable()).map(function (p) { return p.hash; }), fB = (await S.B.foldable()).map(function (p) { return p.hash; });
  check('C2', 'A\'s foldable() omits the parked ops; B\'s has all three', fA.length === 1 && fA[0] === o1.hash && fB.length === 3, 'A=' + fA.length + ' B=' + fB.length);
  var stA = typeof S.A.versionState === 'function' ? await S.A.versionState() : null, stB = typeof S.B.versionState === 'function' ? await S.B.versionState() : null;
  check('C2', 'A.versionState(): provisional, 2 parked, with reasons', !!stA && stA.provisional === true && stA.parked_count === 2 && stA.parked_by_reason['needs-upgrade'] === 1 && stA.parked_by_reason.deps === 1, JSON.stringify(stA));
  check('C2', 'B.versionState(): not provisional, nothing parked', !!stB && stB.provisional === false && stB.parked_count === 0, JSON.stringify(stB));
  // C3 (before A upgrades): bodies handed to the host are upcast COPIES; the stored envelope never changes
  var fb = await S.B.foldable(), b1 = fb.filter(function (p) { return p.hash === o1.hash; })[0];
  var envOf = function (db, h) { var r = db.exec('SELECT envelope FROM cl_op WHERE op_hash=?', [h]); return r.length ? r[0].values[0][0] : null; };
  var storedBefore = envOf(W.dbs.B, o1.hash);
  check('C3', 'foldable() gives the legacy op in the v2 shape (grandtotal -> total) and marks it sv:2', !!b1 && b1.env.body.params.fields.total === 100 && b1.env.body.params.fields.grandtotal === undefined && b1.env.body.sv === undefined && b1.env.body.params._sv === 2, b1 ? JSON.stringify(b1.env.body.params) : 'missing');
  var storedAfter = envOf(W.dbs.B, o1.hash), envObj = storedAfter ? JSON.parse(storedAfter) : null;
  check('C3', 'the STORED envelope string in cl_op is byte-identical after foldable(), and its signature still verifies against the author key', storedBefore !== null && storedBefore === storedAfter && envObj && (await ENV.verify(envObj, W.dev.B.pubJwk)) === true, 'len=' + (storedAfter ? storedAfter.length : 0));
  // upgrade A: app release + the signed set, then refold
  R.A.setApp('CRUD_CREATE', 2); var ls = await R.A.loadSet(SET); refold(S.A); await allSync(S, names, pipe);
  var vA2 = []; for (var h2 of [o1.hash, o2.hash, o3.hash]) vA2.push(await vd(S.A, h2));
  var fA2 = (await S.A.foldable()).map(function (p) { return p.hash; }), stA2 = typeof S.A.versionState === 'function' ? await S.A.versionState() : null;
  check('C2', 'after the upgrade A MERGES all three, in the same placed order as B and C', ls.ok && vA2.every(function (x) { return x.verdict === 'MERGED'; }) && JSON.stringify(fA2) === JSON.stringify(fB) && JSON.stringify((await S.C.foldable()).map(function (p) { return p.hash; })) === JSON.stringify(fB), vA2.map(tag).join(' '));
  check('C2', 'after the upgrade A is no longer provisional', !!stA2 && stA2.provisional === false && stA2.parked_count === 0, JSON.stringify(stA2));
  var lA = (await S.A.foldable()), lB = (await S.B.foldable()), bodiesA = ENV.canonical(lA.map(function (p) { return p.env.body; })), bodiesB = ENV.canonical(lB.map(function (p) { return p.env.body; }));
  var di = -1; lA.forEach(function (p, i) { if (di < 0 && ENV.canonical(p.env.body) !== ENV.canonical((lB[i] || {}).env && lB[i].env.body)) di = i; });
  check('C3', 'after the upgrade A and B hand the host identical bodies (compared in the envelope\'s own canonical form)', bodiesA === bodiesB, di < 0 ? 'n=' + lA.length + '/' + lB.length : 'first difference at ' + di + ': A=' + JSON.stringify(lA[di].env.body).slice(0, 160) + ' B=' + JSON.stringify(lB[di] && lB[di].env.body).slice(0, 160));

  // ───────── C4 bogus versions and what reads them ─────────
  say('\n── C4: a bogus sv is refused everywhere; what reads it is dep-refused ──');
  var q0 = await create(S.B, uuid(), 'BG0', { total: 1 }, 0), qx = await create(S.B, uuid(), 'BGx', { total: 1 }, 'x'), qn = await create(S.B, uuid(), 'BGn', { total: 1 }, 1.5);
  await allSync(S, names, pipe);
  var bv = []; for (var m of names) for (var hh of [q0.hash, qx.hash, qn.hash]) bv.push(tag(await vd(S[m], hh)));
  check('C4', 'sv 0, "x" and 1.5 are REFUSED bogus-version on all three devices (not parked, not merged)', bv.filter(function (x) { return x === 'REFUSED:bogus-version'; }).length === 9, bv.join(' '));

  // ───────── C5 min_v through POLICY ─────────
  say('\n── C5: min_v rides the admin POLICY: retirement is the same on every device ──');
  var pol = function (over) { return Object.assign({ epoch: 1, visit_ms: 900000 }, over || {}); };
  var legacyKeep = await create(S.B, uuid(), 'LEG', { grandtotal: 7 });     // a v1 op created BEFORE the retirement
  var legacyUpd = await update(S.B, legacyKeep.env.target.uu, { documentno: 'LEG-b' });   // an edit authored BEFORE the retirement: it reads the v1 create
  await allSync(S, names, pipe);
  var preV = []; for (var m5 of names) preV.push(tag(await vd(S[m5], legacyKeep.hash)) + '/' + tag(await vd(S[m5], legacyUpd.hash)));
  var pBad = await S.A.setPolicy(pol({ epoch: 1, min_v: { CRUD_CREATE: 'x' } }));
  var pNon = await S.B.setPolicy(pol({ epoch: 2, min_v: { CRUD_CREATE: 2 } }));
  await allSync(S, names, pipe);
  var vBad = tag(await vd(S.C, pBad.hash)), vNon = tag(await vd(S.C, pNon.hash)), polNow = await S.C.policy();
  check('C5', 'CONTROL: before any retirement the v1 create and the edit that reads it are MERGED everywhere', preV.every(function (x) { return /^MERGED[^/]*\/MERGED/.test(x); }), preV.join(' | '));
  check('C5', 'min_v:{CRUD_CREATE:"x"} is REFUSED bad-policy:min_v; a non-admin POLICY with min_v is REFUSED not-admin; no policy took effect', vBad === 'REFUSED:bad-policy:min_v' && vNon === 'REFUSED:not-admin' && polNow === null, vBad + ' | ' + vNon + ' | policy=' + (polNow && polNow.epoch));
  var pOk = await S.A.setPolicy(pol({ epoch: 1, min_v: { CRUD_CREATE: 2 } })); await allSync(S, names, pipe);
  var after = []; for (var m6 of names) after.push([tag(await vd(S[m6], legacyKeep.hash)), tag(await vd(S[m6], o2.hash)), tag(await vd(S[m6], o1.hash))]);
  // §46.6 S1+S2 — DELIBERATE CHANGE to this arm (was: every device REFUSES the v1 create `retired-version`; the edit reading it was REFUSED dep-refused). The floor is POSITION-BOUND and below it is a PARK, never a refusal:
  //   these ops were authored and SEEN by the publisher before the raise, so the raise does not touch them (they keep the verdict they had), on every device.
  check('C5', 'after the admin POLICY the v1 create the publisher had already SEEN stays MERGED on all three devices (position-bound floor; was REFUSED retired-version)', after.every(function (x) { return x[0].indexOf('MERGED') === 0 && x[2].indexOf('MERGED') === 0; }), after.map(function (x) { return x[0]; }).join(' | '));
  var depR = []; for (var m7 of names) depR.push(tag(await vd(S[m7], legacyUpd.hash)));
  check('C5', 'and so does the edit authored before the raise that READS that create (was REFUSED dep-refused)', depR.every(function (x) { return x.indexOf('MERGED') === 0; }), depR.join(' | '));
  var allV5 = []; for (var m8 of names) { var L5 = await S[m8].order(); Object.keys(L5.verdict).forEach(function (h) { allV5.push(L5.verdict[h]); }); }
  check('C5', 'NO op on any device is REFUSED retired-version or dep-refused after the raise (a floor never refuses for age)', allV5.length > 0 && allV5.every(function (v) { return v.reason !== 'retired-version' && v.reason !== 'dep-refused'; }), 'judged=' + allV5.length);
  check('C5', 'the native v2 create still MERGES', after.every(function (x) { return x[1].indexOf('MERGED') === 0; }), after.map(function (x) { return x[1]; }).join(' | '));
  var pLow = await S.A.setPolicy(pol({ epoch: 2, min_v: { CRUD_CREATE: 1 } })); await allSync(S, names, pipe); var vLow0 = tag(await vd(S.C, pLow.hash)); var pHi = await S.A.setPolicy(pol({ epoch: 3, min_v: { CRUD_CREATE: 3 } })); await allSync(S, names, pipe);
  var vLow = tag(await vd(S.B, pLow.hash)), vHi = tag(await vd(S.B, pHi.hash)), polFinal = await S.C.policy();
  check('C5', 'lowering min_v in a later epoch is REFUSED `min_v-lowered` when judged (and stays REFUSED); raising it is MERGED (CONTROL)', vLow0 === 'REFUSED:min_v-lowered' && /^REFUSED:(min_v-lowered|epoch-stale)$/.test(vLow) && vHi.indexOf('MERGED') === 0 && polFinal.epoch === 3, 'when judged: ' + vLow0 + '; after epoch 3 arrived: ' + vLow + ' (once a higher epoch is in force the same refused op reads epoch-stale — same verdict, the reason names the first rule it fails in fold order) | ' + vHi + ' | in force epoch=' + polFinal.epoch);

  // ───────── C6 the hook never un-refuses ─────────
  say('\n── C6: an op refused for access keeps that verdict even when it is also unreadable ──');
  var pipeC6 = PIPE.memPipe('c6'), nC6 = ['A', 'B'], R6 = { A: await regLoaded(1), B: await regLoaded(2) };
  var W6 = await mkSpace(SQL, nC6, pipeC6, function (n) { return { versions: R6[n] }; });
  var nt6 = await create(W6.S.B, uuid(), 'NOTAB', { total: 1 }, 2, 'zz_no_such_table'), ok6 = await create(W6.S.B, uuid(), 'OK6', { total: 1 }, 2);
  await allSync(W6.S, nC6, pipeC6);
  var t6 = tag(await vd(W6.S.A, nt6.hash)), c6 = tag(await vd(W6.S.A, ok6.hash));
  check('C6', 'on the old app (appV 1) an sv:2 op on an unknown table is REFUSED access:no-table, not parked', t6 === 'REFUSED:access:no-table', t6);
  check('C6', 'CONTROL: an sv:2 op on a real table on the same device is PARKED needs-upgrade', c6 === 'PARKED:needs-upgrade', c6);

  // ───────── C7 an old device does not adopt a checkpoint that froze what it cannot read ─────────
  say('\n── C7: two up-to-date devices co-sign a checkpoint over an op the old device parks; the old device must not adopt it ──');
  var pipe7 = PIPE.memPipe('c7'), n7 = ['A', 'B', 'C'], R7 = { A: await regLoaded(1), B: await regLoaded(2), C: await regLoaded(2) };
  var W7 = await mkSpace(SQL, n7, pipe7, function (n) { return { versions: R7[n] }; }), S7 = W7.S;
  var ok7 = await create(S7.B, uuid(), 'CK7', { total: 9 }, 2); await allSync(S7, n7, pipe7);
  var ckB = await S7.B.checkpoint(pipe7); await allSync(S7, n7, pipe7); var ckC = await S7.C.checkpoint(pipe7); await allSync(S7, n7, pipe7, 4);
  var iB = await S7.B.checkpointInfo(), iC = await S7.C.checkpointInfo(), iA = await S7.A.checkpointInfo(), v7a = tag(await vd(S7.A, ok7.hash)), v7b = tag(await vd(S7.B, ok7.hash));
  if (!(iB.inForce && iC.inForce)) vacuous('C7', 'the co-signed checkpoint never became in force on the up-to-date devices', 'B.inForce=' + !!iB.inForce + ' C.inForce=' + !!iC.inForce + ' ckB=' + JSON.stringify(ckB).slice(0, 80));
  check('C7', 'CONTROL: the up-to-date devices B and C take the checkpoint into force and hold the op MERGED', !!(iB.inForce && iC.inForce) && v7b.indexOf('MERGED') === 0, 'B.inForce=' + !!iB.inForce + ' C.inForce=' + !!iC.inForce + ' B:' + v7b);
  check('C7', 'the old device A does NOT put that checkpoint in force and still holds the op PARKED needs-upgrade', !iA.inForce && v7a === 'PARKED:needs-upgrade', 'A.inForce=' + !!iA.inForce + ' A:' + v7a + ' candidates=' + iA.candidates.map(function (c) { return c.status; }).join(','));
  check('C7', 'and A does not condemn it: no candidate is BAD (BAD is persisted for good; an unreadable prefix is a wait, not a lie)', iA.candidates.every(function (c) { return c.status !== 'BAD'; }), iA.candidates.map(function (c) { return c.status; }).join(','));
  R7.A.setApp('CRUD_CREATE', 2); await R7.A.loadSet(SET); refold(S7.A); await allSync(S7, n7, pipe7);
  var v7a2 = tag(await vd(S7.A, ok7.hash));
  check('C7', 'after A upgrades it MERGES the same op', v7a2.indexOf('MERGED') === 0, v7a2);
  var iA2 = await S7.A.checkpointInfo();
  check('C7', 'and after the upgrade A no longer holds that checkpoint BAD: it re-verifies it by its own fold and takes it into force', !!iA2.inForce && iA2.candidates.every(function (c) { return c.status !== 'BAD'; }), 'A.inForce=' + !!iA2.inForce + ' candidates=' + iA2.candidates.map(function (c) { return c.status; }).join(','));

  // ───────── C8 POLICY carries signed upcaster sets (§16.35) — engine side: shape, admin-only, monotone ─────────
  say('\n── C8: POLICY upcasters: validated, admin-only, never dropped ──');
  var pipe8 = PIPE.memPipe('c8'), n8 = ['A', 'B', 'C'], W8 = await mkSpace(SQL, n8, pipe8), S8 = W8.S;
  var mkSet = function (op, from, to) { return { kind: 'upcasters', op: op, signer: { kty: 'EC', crv: 'P-256', x: 'x', y: 'y' }, sig: '00', steps: [{ from: from, map: [{ rename: ['a', to || 'b'] }] }] }; };
  var SA = mkSet('CRUD_CREATE', 1), SB = mkSet('CRUD_UPDATE', 1), pol8 = function (over) { return Object.assign({ epoch: 1, visit_ms: 900000 }, over || {}); };
  var judged8 = async function (op) { await allSync(S8, n8, pipe8); var out = []; for (var m of n8) out.push(tag(await vd(S8[m], op.hash))); return out; };
  var bad1 = await S8.A.setPolicy(pol8({ epoch: 1, upcasters: 'x' })), v8a = await judged8(bad1);
  var bad2 = await S8.A.setPolicy(pol8({ epoch: 1, upcasters: [{ kind: 'upcasters', op: 'X', signer: {}, sig: 's' }] })), v8b = await judged8(bad2);
  var bad3 = await S8.A.setPolicy(pol8({ epoch: 1, upcasters: Array.from({ length: 17 }, function (_, i) { return mkSet('OP' + i, 1); }) })), v8c = await judged8(bad3);
  check('C8', 'a string, a set without steps, and 17 sets are each REFUSED bad-policy:upcasters on all three devices', [v8a, v8b, v8c].every(function (v) { return v.every(function (x) { return x === 'REFUSED:bad-policy:upcasters'; }); }), [v8a[0], v8b[0], v8c[0]].join(' | '));
  var nonAdmin = await S8.B.setPolicy(pol8({ epoch: 1, upcasters: [SA] })), v8d = await judged8(nonAdmin);
  check('C8', 'a non-admin POLICY carrying a set is REFUSED not-admin everywhere and takes no effect', v8d.every(function (x) { return x === 'REFUSED:not-admin'; }) && (await S8.C.policy()) === null, v8d.join(' '));
  var p1 = await S8.A.setPolicy(pol8({ epoch: 1, upcasters: [SA] })), v8e = await judged8(p1), pols = []; for (var m8 of n8) pols.push(await S8[m8].policy());
  check('C8', 'the admin\'s POLICY with one set is MERGED and every device returns the same set', v8e.every(function (x) { return x.indexOf('MERGED') === 0; }) && pols.every(function (x) { return x && ENV.canonical(x.params.upcasters) === ENV.canonical([SA]); }), v8e.join(' '));
  var dropAll = await S8.A.setPolicy(pol8({ epoch: 2, upcasters: [] })), v8f = await judged8(dropAll);
  var dropKey = await S8.A.setPolicy(pol8({ epoch: 2 })), v8g = await judged8(dropKey);
  var edited = JSON.parse(JSON.stringify(SA)); edited.steps[0].map[0].rename = ['a', 'z'];
  var editOp = await S8.A.setPolicy(pol8({ epoch: 2, upcasters: [edited] })), v8h = await judged8(editOp);
  check('C8', 'a later epoch that drops every set, omits the key, or edits a set is REFUSED upcasters-dropped on all three', [v8f, v8g, v8h].every(function (v) { return v.every(function (x) { return x === 'REFUSED:upcasters-dropped'; }); }), [v8f[0], v8g[0], v8h[0]].join(' | '));
  var more = await S8.A.setPolicy(pol8({ epoch: 2, upcasters: [SA, SB] })), v8i = await judged8(more), pol2 = await S8.B.policy();
  check('C8', 'CONTROL: a later epoch that keeps the set and adds another is MERGED; the policy in force has both', v8i.every(function (x) { return x.indexOf('MERGED') === 0; }) && pol2.epoch === 2 && pol2.params.upcasters.length === 2, v8i.join(' '));
  var pipe8b = PIPE.memPipe('c8b'), W8b = await mkSpace(SQL, ['A', 'B'], pipe8b), plain = await W8b.S.A.setPolicy(pol8({ epoch: 1 })); await allSync(W8b.S, ['A', 'B'], pipe8b);
  check('C8', 'CONTROL: a POLICY with no `upcasters` at all is MERGED as before and carries none', tag(await vd(W8b.S.B, plain.hash)).indexOf('MERGED') === 0 && (await W8b.S.B.policy()).params.upcasters === undefined);

  // ───────── C9 / C10: Stage 1 of §46.6 (S1 position-bound floor, S2 park never refuse) ─────────
  // Three devices: A = admin, appV 2 + the signed set (can translate); B = the till, appV 1 (writes shape 1); C = head office WITHOUT the set (cannot translate yet): appV 2 in C9/C10, appV 1 in C11.
  var ROSTER = require(path.join(B, 'comm_roster.js'));
  var base9 = function () { return { epoch: 1, visit_ms: 900000, min_v: { CRUD_CREATE: 2 } }; };
  async function mk3(tag3, cAppV) { var pp = PIPE.memPipe(tag3), nn = ['A', 'B', 'C'], RR = { A: await regLoaded(2), B: await regLoaded(1), C: reg(cAppV || 2) };
    var WW = await mkSpace(SQL, nn, pp, function (n) { return { versions: RR[n] }; }); return { pipe: pp, names: nn, R: RR, W: WW, S: WW.S }; }
  say('\n── C9: the floor is judged at the op\'s position; below it an op is PARKED needs-translation, never REFUSED ──');
  var X9 = await mk3('c9'), S9 = X9.S;
  var pre9 = await create(S9.B, uuid(), 'PRE9', { grandtotal: 10 });                       // v1, reaches the publisher BEFORE the raise
  await allSync(S9, X9.names, X9.pipe);
  var late9 = await create(S9.B, uuid(), 'LATE9', { grandtotal: 20 });                     // v1, authored offline: the publisher has NOT seen it
  var lateEd9 = await update(S9.B, late9.env.target.uu, { documentno: 'LATE9b' });          // an edit that READS the late create
  var raise9 = await S9.A.setPolicy(base9());
  await allSync(S9, X9.names, X9.pipe);
  var T9 = {}; for (var n9 of X9.names) T9[n9] = [tag(await vd(S9[n9], pre9.hash)), tag(await vd(S9[n9], late9.hash)), tag(await vd(S9[n9], lateEd9.hash))];
  var rst9 = (await S9.B.order()).roster, kidB = X9.W.dev.B.kid, mvPre = rst9.minVAt ? rst9.minVAt(kidB, pre9.env.seq) : 'no-minVAt', mvLate = rst9.minVAt ? rst9.minVAt(kidB, late9.env.seq) : 'no-minVAt';
  check('C9', 'roster.minVAt: the raise does NOT cover the op the publisher had seen (seq ' + pre9.env.seq + ') and DOES cover the one it had not (seq ' + late9.env.seq + ')', mvPre && mvPre.CRUD_CREATE === undefined && mvLate && mvLate.CRUD_CREATE === 2, JSON.stringify(mvPre) + ' / ' + JSON.stringify(mvLate));
  check('C9', 'B (appV 1): the op the publisher had SEEN stays MERGED natively; the late op is PARKED needs-translation (not REFUSED); the edit that reads it is PARKED deps', T9.B[0].indexOf('MERGED') === 0 && T9.B[1] === 'PARKED:needs-translation' && T9.B[2] === 'PARKED:deps', T9.B.join(' | '));
  check('C9', 'A (appV 2 + the signed set): all three MERGE (the late op folds THROUGH the translation)', T9.A.every(function (x) { return x.indexOf('MERGED') === 0; }), T9.A.join(' | '));
  check('C9', 'C (appV 2, no set): the seen op is PARKED needs-mapping (above the floor at its position, a rung is missing), the late op PARKED needs-translation, the edit PARKED deps', T9.C[0] === 'PARKED:needs-mapping' && T9.C[1] === 'PARKED:needs-translation' && T9.C[2] === 'PARKED:deps', T9.C.join(' | '));
  var ref9 = 0; for (var q9 of X9.names) { var L9 = await S9[q9].order(); Object.keys(L9.verdict).forEach(function (h) { if (L9.verdict[h].reason === 'retired-version' || L9.verdict[h].reason === 'dep-refused') ref9++; }); }
  check('C9', 'NO op on any device is REFUSED retired-version / dep-refused (0 business declarations lost to the floor)', ref9 === 0, 'refused=' + ref9);

  say('\n── C10: a translation set is loaded: the parked late ops fold, every device agrees, nothing was lost ──');
  var stC0 = await S9.C.versionState();
  check('C10', 'BEFORE the translation: C is provisional with needs-translation counted (the UI says "N items need an update", not a spinner)', stC0.provisional === true && stC0.parked_by_reason['needs-translation'] === 1, JSON.stringify(stC0));
  var ld = await X9.R.C.loadSet(SET); refold(S9.C); X9.R.B.setApp('CRUD_CREATE', 2); await X9.R.B.loadSet(SET); refold(S9.B); await allSync(S9, X9.names, X9.pipe);
  var T10 = {}; for (var n10 of X9.names) T10[n10] = [tag(await vd(S9[n10], pre9.hash)), tag(await vd(S9[n10], late9.hash)), tag(await vd(S9[n10], lateEd9.hash))];
  check('C10', 'after the set is loaded the late op, the seen op and the edit are MERGED on A, B and C (the parked op FOLDED, none lost)', ld.ok && X9.names.every(function (n) { return T10[n].every(function (x) { return x.indexOf('MERGED') === 0; }); }), X9.names.map(function (n) { return n + ':' + T10[n].join(','); }).join(' | '));
  var bodies10 = []; for (var n11 of X9.names) bodies10.push(ENV.canonical((await S9[n11].foldable()).map(function (p) { return p.env.body; })));
  check('C10', 'A, B and C hand the host byte-identical bodies (the translated late op is the same everywhere)', bodies10[0] === bodies10[1] && bodies10[1] === bodies10[2] && bodies10[0].length > 0, 'len=' + bodies10[0].length);
  var stC1 = await S9.C.versionState();
  check('C10', 'C is no longer provisional (parked_count 0)', stC1.provisional === false && stC1.parked_count === 0, JSON.stringify(stC1));

  // ───────── C11: S3 checkpoints over parked ops ─────────
  say('\n── C11: a parked old-version op holds only its own author out of a checkpoint; a co-signer that cannot translate WAITS, never BAD ──');
  var X11 = await mk3('c11', 1), S11 = X11.S, kid11B = X11.W.dev.B.kid, kid11A = X11.W.dev.A.kid;
  var pre11 = await create(S11.B, uuid(), 'PRE11', { grandtotal: 1 }); await allSync(S11, X11.names, X11.pipe);
  var l11a = await create(S11.B, uuid(), 'LATE11A', { grandtotal: 2 }), l11b = await create(S11.B, uuid(), 'LATE11B', { grandtotal: 3 });
  var y11 = await create(S11.A, uuid(), 'Y11', { grandtotal: 4 });                          // a v1 op by ANOTHER author, authored before the raise (so C reads it natively): it must not wait for B's parked ops
  await S11.A.setPolicy(base9()); await allSync(S11, X11.names, X11.pipe, 4);
  var stC = await S11.C.versionState();
  var ck1 = await S11.C.checkpoint(X11.pipe); await allSync(S11, X11.names, X11.pipe, 4);
  var fr1 = ck1 && ck1.state_hash ? ((await S11.C.order()).roster.checkpoints[ck1.state_hash] || { params: {} }).params.frontier : null, inf1 = await S11.C.checkpointInfo();
  if (!ck1 || !ck1.state_hash) vacuous('C11', 'C could not publish a checkpoint while holding parked ops', JSON.stringify(ck1));
  check('C11', 'C (cannot translate) PUBLISHES a checkpoint although two of B\'s ops are parked: the other authors are not stalled', !!(ck1 && ck1.state_hash) && !!fr1 && fr1[kid11A] >= y11.env.seq, JSON.stringify(ck1).slice(0, 90) + ' frontier=' + JSON.stringify(fr1));
  check('C11', 'its frontier for B stops BEFORE the first parked op (the hold is per author: B ends at seq ' + pre11.env.seq + ', the first parked op is ' + l11a.env.seq + ')', !!fr1 && fr1[kid11B] === pre11.env.seq, 'B=' + (fr1 && fr1[kid11B]));
  check('C11', 'checkpointInfo().held names the held author, its first held seq and the reason (what the Rollout screen will read)', Array.isArray(inf1.held) && inf1.held.some(function (h) { return h.author === kid11B && h.seq === l11a.env.seq && h.reason === 'needs-translation'; }), JSON.stringify(inf1.held));
  var cs = await S11.A.cosign(); await allSync(S11, X11.names, X11.pipe, 4); var infA1 = await S11.A.checkpointInfo(), infC1 = await S11.C.checkpointInfo();
  check('C11', 'A (can translate) co-signs it; the checkpoint is in force on A and on C', cs.length === 1 && !!infA1.inForce && !!infC1.inForce && infA1.inForce.state_hash === infC1.inForce.state_hash, 'A=' + (infA1.inForce && infA1.inForce.pos) + ' C=' + (infC1.inForce && infC1.inForce.pos));
  var ck2 = await S11.A.checkpoint(X11.pipe); await allSync(S11, X11.names, X11.pipe, 4);
  var fr2 = ck2 && ck2.state_hash ? ((await S11.A.order()).roster.checkpoints[ck2.state_hash] || { params: {} }).params.frontier : null, infC2 = await S11.C.checkpointInfo();
  var st2C = ck2 && ck2.state_hash ? (infC2.candidates.filter(function (c) { return c.state_hash === ck2.state_hash; })[0] || {}).status : null;
  check('C11', 'A (can translate) then checkpoints PAST the late ops (frontier for B = seq ' + l11b.env.seq + ')', !!fr2 && fr2[kid11B] === l11b.env.seq, JSON.stringify(ck2).slice(0, 90) + ' B=' + (fr2 && fr2[kid11B]));
  check('C11', 'C cannot translate yet: it WAITS on that checkpoint (WAITING-VERSION), it does not condemn it (BAD is persisted for good), and still runs on the earlier one', st2C === 'WAITING-VERSION' && infC2.candidates.every(function (c) { return c.status !== 'BAD'; }) && !!infC2.inForce, 'status=' + st2C + ' all=' + infC2.candidates.map(function (c) { return c.status; }).join(','));
  X11.R.C.setApp('CRUD_CREATE', 2); await X11.R.C.loadSet(SET); refold(S11.C); await allSync(S11, X11.names, X11.pipe, 4); await S11.C.cosign(); await allSync(S11, X11.names, X11.pipe, 4);
  var infC3 = await S11.C.checkpointInfo(), infA3 = await S11.A.checkpointInfo();
  check('C11', 'once C loads the translation it verifies that checkpoint by its own fold and takes it into force: same state as A, nothing BAD, no author held', !!infC3.inForce && !!infA3.inForce && infC3.inForce.state_hash === ck2.state_hash && infA3.inForce.state_hash === ck2.state_hash && infC3.candidates.every(function (c) { return c.status !== 'BAD'; }) && (infC3.held || []).length === 0, 'C=' + (infC3.inForce && infC3.inForce.state_hash.slice(0, 8)) + ' A=' + (infA3.inForce && infA3.inForce.state_hash.slice(0, 8)) + ' held=' + JSON.stringify(infC3.held));

  say('\n── C11b: a later floor raise may not re-judge an op inside a closed checkpoint prefix ──');
  var p11 = PIPE.memPipe('c11b'), n11b = ['A', 'B'], R11b = { A: await regLoaded(1), B: await regLoaded(1) };
  var W11b = await mkSpace(SQL, n11b, p11, function (n) { return { versions: R11b[n] }; }), S11b = W11b.S;
  var pre11b = await create(S11b.B, uuid(), 'PRE11B', { grandtotal: 1 }); await allSync(S11b, n11b, p11);
  var ckb = await S11b.A.checkpoint(p11); await allSync(S11b, n11b, p11, 3); await S11b.B.cosign(); await allSync(S11b, n11b, p11, 3);
  var infB0 = await S11b.A.checkpointInfo(), vPre0 = tag(await vd(S11b.A, pre11b.hash));
  var polU = await ROSTER.policyUU(W11b.space);
  await S11b.A.author({ target: { table: 'comm_policy', uu: polU }, body: { op_type: 'POLICY', params: base9() } });       // an UNSTAMPED raise (no from_seq): it covers every op, including the closed prefix
  await allSync(S11b, n11b, p11, 3);
  var infB1 = await S11b.A.checkpointInfo(), vPre1 = tag(await vd(S11b.A, pre11b.hash)), vPre1B = tag(await vd(S11b.B, pre11b.hash));
  check('C11b', 'CONTROL: the checkpoint is in force and the op is MERGED before the raise', !!ckb.state_hash && !!infB0.inForce && vPre0.indexOf('MERGED') === 0, 'inForce=' + !!infB0.inForce + ' ' + vPre0);
  check('C11b', 'an unstamped raise that WOULD re-judge an op inside the prefix is not trusted: the checkpoint falls out of force and both devices re-fold the op under the floor (PARKED needs-translation), identically', !infB1.inForce && vPre1 === 'PARKED:needs-translation' && vPre1B === vPre1, 'inForce=' + !!infB1.inForce + ' A:' + vPre1 + ' B:' + vPre1B);

  // ───────── C12: S5 tolerant write (F10) ─────────
  say('\n── C12: an old device cannot drop a field it does not know, and a record it cannot fully read is READ-ONLY on it (D10) ──');
  var p12 = PIPE.memPipe('c12'), n12 = ['A', 'B'], R12 = { A: await regLoaded(1), B: await regLoaded(2) };                  // A = the OLD device
  var W12 = await mkSpace(SQL, n12, p12, function (n) { return { versions: R12[n] }; }), S12 = W12.S;
  var r1 = await create(S12.B, uuid(), 'R1', { total: 5, zz_new: 'keep-me' });                       // a field A's shape has never heard of
  var r2 = await create(S12.B, uuid(), 'R2', { total: 6 }, 2);                                       // a v2 record: A parks it
  await allSync(S12, n12, p12);
  var up1 = await update(S12.A, r1.env.target.uu, { documentno: 'R1-edited' }); await allSync(S12, n12, p12);
  var f12 = (await S12.B.foldable()).filter(function (x) { return x.env.target.uu === r1.env.target.uu; });
  check('C12', 'the old device\'s save of a readable record is a DELTA: its op carries only the edited column, so the field it does not know (zz_new) is untouched on every device', Object.keys(up1.env.body.params.changes).join() === 'documentno' && f12.length === 2 && f12[0].env.body.params.fields.zz_new === 'keep-me', 'changes=' + Object.keys(up1.env.body.params.changes).join() + ' ops=' + f12.length);
  var n12before = W12.dbs.A.exec('SELECT COUNT(*) FROM cl_op')[0].values[0][0], thrown12 = null;
  try { await update(S12.A, r2.env.target.uu, { documentno: 'R2-edited' }); } catch (e) { thrown12 = e; }
  var n12after = W12.dbs.A.exec('SELECT COUNT(*) FROM cl_op')[0].values[0][0];
  check('C12', 'the old device\'s save of a record whose history it has PARKED is refused locally with needs-upgrade (read-only, D10) and writes NO op', !!thrown12 && thrown12.code === 'needs-upgrade' && n12before === n12after, 'thrown=' + (thrown12 && (thrown12.code || thrown12.message)) + ' ops ' + n12before + '->' + n12after);
  R12.A.setApp('CRUD_CREATE', 2); await R12.A.loadSet(SET); refold(S12.A);
  var up2 = null, e12 = null; try { up2 = await update(S12.A, r2.env.target.uu, { documentno: 'R2-edited' }); } catch (e) { e12 = e; }
  check('C12', 'after the old device upgrades, the same save succeeds', !!up2 && !e12, e12 ? e12.message : 'ok');
  var up0 = null, e0 = null; try { up0 = await update(W1.S.A, uA, { documentno: 'C1-edit' }); } catch (e) { e0 = e; }
  check('C12', 'CONTROL: a store opened WITHOUT `versions` is unchanged: it saves a record carrying sv:2 as before', !!up0 && !e0, e0 ? e0.message : 'ok');

  // ───────── verdict ─────────
  var red = Object.keys(ARMS).filter(function (k) { return ARMS[k].bad > 0; }), inc = Object.keys(ARMS).filter(function (k) { return ARMS[k].vac > 0; });
  console.log('§CV_ARMS red=' + (red.join(',') || 'none') + ' vacuous=' + (inc.join(',') || 'none') + ' judged=' + JUDGED);
  if (ONLY) process.exit(red.length ? 1 : 0);
  // ───────── mutants: a broken COPY of build/comm must turn at least the named arms red ─────────
  var muts = [];
  if (!process.env.CV_NO_MUTANTS && !process.env.CV_COMM_DIR) {
    var rd = function (f) { return fs.readFileSync(path.join(B, f), 'utf8'); };
    var M = [
      ['verdict hook removed', 'comm_store.js', "if (opts.versions && verdict[o.hash].verdict === 'MERGED') {", "if (false && verdict[o.hash].verdict === 'MERGED') {", ['C2', 'C4', 'C7']],
      ['foldable() does not upcast', 'comm_store.js', 'if (opts.versions) p = { hash: p.hash,', 'if (false) p = { hash: p.hash,', ['C3']],
      ['min_v not taken from POLICY', 'comm_store.js', 'opts.versions.judge(o.env.body, roster.minVAt ? { min_v: roster.minVAt(o.env.author, o.env.seq) } : (roster.policy ? roster.policy.params : null))', 'opts.versions.judge(o.env.body, null)', ['C9']],       // §46.6: was expected red in C5 (REFUSED retired-version); C5 no longer refuses, the floor now shows in C9
      ['the hook overwrites ANY verdict (un-refuses)', 'comm_store.js', "verdict[o.hash].verdict === 'MERGED') { var vj", "true) { var vj", ['C6']],
      ['a lower min_v is accepted', 'comm_roster.js', 'if (policy && policy.params.min_v && Object.keys(', 'if (false && policy.params.min_v && Object.keys(', ['C5']],
      ['a prefix the app cannot read is condemned BAD for good', 'comm_store.js', "if (r.problem === 'parked-in-S' && r.versioned) {", "if (false) {", ['C7']],
      ['upcasters are not validated', 'comm_roster.js', 'if (p.upcasters !== undefined) {', 'if (false) {', ['C8']],
      ['a later epoch may drop a set', 'comm_roster.js', "return no('upcasters-dropped');", 'void 0;', ['C8']],
      ['min_v is not validated', 'comm_roster.js', 'if (p.min_v !== undefined) { if (!p.min_v ||', 'if (false) { if (!p.min_v ||', ['C5']],
      // §46.6 Stage 1 mutants
      ['the floor is judged by the FINAL policy again (not at the op\'s position)', 'comm_store.js', 'roster.minVAt ? { min_v: roster.minVAt(o.env.author, o.env.seq) } : (', 'false ? { min_v: roster.minVAt(o.env.author, o.env.seq) } : (', ['C9']],
      ['minVAt ignores the position (every raise covers every op)', 'comm_roster.js', 'if ((e.from[kid] || 0) < seq) Object.keys(e.min_v)', 'if (true) Object.keys(e.min_v)', ['C9']],
      ['a raise is published without the publisher\'s frontier', 'comm_store.js', '(params.from_seq === undefined || (cp0 &&', '(false && (cp0 &&', ['C9']],
      ['a below-floor op is REFUSED retired-version again', 'op_versions.js', "(why || v >= (appVs[t] || 1))) return { verdict: 'PARKED', reason: 'needs-translation' };", "(why || v >= (appVs[t] || 1))) return { verdict: 'REFUSED', reason: 'retired-version' };", ['C9', 'C10']],
      ['a below-floor op never folds through a loaded translation', 'op_versions.js', 'if (below && (why || v >= (appVs[t] || 1)))', 'if (below)', ['C9', 'C10']],
      ['needs-translation is not a version-wait reason (held, provisional, checkpoint wait, read-only)', 'comm_store.js', "'needs-mapping': 1, 'needs-translation': 1 };", "'needs-mapping': 1 };", ['C11']],
      ['a parked op counts as decided (it no longer holds its author out of the checkpoint)', 'comm_store.js', "return !!v && (v.verdict === 'MERGED' || v.verdict === 'REFUSED'); };", "return !!v && (v.verdict === 'MERGED' || v.verdict === 'REFUSED' || v.verdict === 'PARKED'); };", ['C11']],
      ['a floor raise may re-judge an op inside a closed checkpoint prefix', 'comm_roster.js', "!== ENV.canonical(ra.minVAt ? ra.minVAt(fk, Number(fq)) : {})) return 'floor-changed';", "!== ENV.canonical(ra.minVAt ? ra.minVAt(fk, Number(fq)) : {})) void 0;", ['C11b']],
      ['a record with parked history is writable on the old device', 'comm_store.js', 'if (opts.versions && !ident) { var unr = await unreadable()', 'if (false && !ident) { var unr = await unreadable()', ['C12']]];
    M.forEach(function (m) {
      var isOpv = m[1] === 'op_versions.js', srcDir = isOpv ? (process.env.CV_OPV_DIR || path.join(ROOT, 'build', 'erp')) : B;
      var src = fs.readFileSync(path.join(srcDir, m[1]), 'utf8'); if (src.split(m[2]).length !== 2) { muts.push({ name: m[0], error: 'anchor not found exactly once in ' + m[1] }); return; }
      var mutated = src.replace(m[2], function () { return m[3]; }); if (mutated === src) { muts.push({ name: m[0], error: 'mutation did not change the file (not applied)' }); return; }
      var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-mut-')), env2 = Object.assign({}, process.env, { CV_ONLY_ARMS: '1' });
      if (isOpv) { var od = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-mutopv-')); fs.writeFileSync(path.join(od, 'op_versions.js'), mutated); env2.CV_OPV_DIR = od; env2.CV_COMM_DIR = B; m.cleanup = od; }
      else { fs.readdirSync(B).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(B, f), path.join(dir, f)); }); fs.writeFileSync(path.join(dir, m[1]), mutated); env2.CV_COMM_DIR = dir; }   // a COPY, never a symlink
      var k = cp.spawnSync(process.execPath, [__filename], { encoding: 'utf8', timeout: 400000, env: env2 });
      fs.rmSync(dir, { recursive: true, force: true }); if (m.cleanup) fs.rmSync(m.cleanup, { recursive: true, force: true });
      var mm = /§CV_ARMS red=(\S+)/.exec(k.stdout || ''); var r = mm && mm[1] !== 'none' ? mm[1].split(',') : (mm ? [] : ['CRASH']);   // a mutant that crashes before the verdict line is NOT a kill: it fails the run
      muts.push({ name: m[0], expect: m[4], red: r });
    });
    console.log('\n§CV_MUTANTS');
    muts.forEach(function (m) { var ok = !m.error && m.red.indexOf('CRASH') === -1 && m.expect.every(function (e) { return m.red.indexOf(e) !== -1; }); if (!ok) FAILS++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + m.name + ' -> ' + (m.error || ('red arms: ' + (m.red.join(', ') || 'NONE (survivor)') + ' (expected ' + m.expect.join('/') + ')'))); });
  }
  var killed = muts.filter(function (m) { return !m.error && m.red.length > 0 && m.red.indexOf('CRASH') === -1; }).length;
  var verdict = FAILS > 0 ? 'FAIL' : (VAC > 0 ? 'INCONCLUSIVE' : 'PASS');
  console.log('§CV_VERDICT ' + verdict + ' judged=' + JUDGED + ' fails=' + FAILS + ' vacuous=' + VAC + (muts.length ? ' mutants_killed=' + killed + '/' + muts.length : ' mutants=skipped'));
  process.exit(FAILS ? 1 : 0);
})().catch(function (e) { console.log('§CV_CRASH ' + (e && e.stack || e)); process.exit(2); });
