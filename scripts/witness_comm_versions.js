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
var OPV = require(path.join(ROOT, 'build', 'erp', 'op_versions.js'));
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
  check('C5', 'after the admin POLICY every device REFUSES the v1 create `retired-version` (identical on all three)', after.every(function (x) { return x[0] === 'REFUSED:retired-version' && x[2] === 'REFUSED:retired-version'; }), after.map(function (x) { return x[0]; }).join(' | '));
  var depR = []; for (var m7 of names) depR.push(tag(await vd(S[m7], legacyUpd.hash)));
  check('C5', 'the edit authored before the retirement, which READS the retired create, is REFUSED dep-refused on all three', depR.every(function (x) { return x === 'REFUSED:dep-refused'; }), depR.join(' | '));
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
      ['min_v not taken from POLICY', 'comm_store.js', 'opts.versions.judge(o.env.body, roster.policy ? roster.policy.params : null)', 'opts.versions.judge(o.env.body, null)', ['C5']],
      ['the hook overwrites ANY verdict (un-refuses)', 'comm_store.js', "verdict[o.hash].verdict === 'MERGED') { var vj", "true) { var vj", ['C6']],
      ['a lower min_v is accepted', 'comm_roster.js', 'if (policy && policy.params.min_v && Object.keys(', 'if (false && policy.params.min_v && Object.keys(', ['C5']],
      ['a prefix the app cannot read is condemned BAD for good', 'comm_store.js', "if (r.problem === 'parked-in-S' && r.versioned) {", "if (false) {", ['C7']],
      ['min_v is not validated', 'comm_roster.js', 'if (p.min_v !== undefined) { if (!p.min_v ||', 'if (false) { if (!p.min_v ||', ['C5']]];
    M.forEach(function (m) {
      var src = rd(m[1]); if (src.split(m[2]).length !== 2) { muts.push({ name: m[0], error: 'anchor not found exactly once in ' + m[1] }); return; }
      var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-mut-')); fs.readdirSync(B).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(B, f), path.join(dir, f)); });
      fs.writeFileSync(path.join(dir, m[1]), src.replace(m[2], m[3]));
      var k = cp.spawnSync(process.execPath, [__filename], { encoding: 'utf8', timeout: 400000, env: Object.assign({}, process.env, { CV_COMM_DIR: dir, CV_ONLY_ARMS: '1' }) });
      fs.rmSync(dir, { recursive: true, force: true }); var mm = /§CV_ARMS red=(\S+)/.exec(k.stdout || ''); var r = mm && mm[1] !== 'none' ? mm[1].split(',') : [];
      muts.push({ name: m[0], expect: m[4], red: r });
    });
    console.log('\n§CV_MUTANTS');
    muts.forEach(function (m) { var ok = !m.error && m.expect.every(function (e) { return m.red.indexOf(e) !== -1; }); if (!ok) FAILS++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + m.name + ' -> ' + (m.error || ('red arms: ' + (m.red.join(', ') || 'NONE (survivor)') + ' (expected ' + m.expect.join('/') + ')'))); });
  }
  var killed = muts.filter(function (m) { return !m.error && m.red.length > 0; }).length;
  var verdict = FAILS > 0 ? 'FAIL' : (VAC > 0 ? 'INCONCLUSIVE' : 'PASS');
  console.log('§CV_VERDICT ' + verdict + ' judged=' + JUDGED + ' fails=' + FAILS + ' vacuous=' + VAC + (muts.length ? ' mutants_killed=' + killed + '/' + muts.length : ' mutants=skipped'));
  process.exit(FAILS ? 1 : 0);
})().catch(function (e) { console.log('§CV_CRASH ' + (e && e.stack || e)); process.exit(2); });
