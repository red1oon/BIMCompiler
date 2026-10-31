#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-BASE-HASH + the engine half of W-BASE-EDIT, prompts/TEAMWORK_FRAMEWORK.md §13.12.I / §13.12.I.1 / §13.12.I.2.
 *   READ THE LOG after every run — the exit code is not evidence. An arm that judged nothing prints INCONCLUSIVE, never PASS.
 *
 * The BASE: a shared loaded DB the team keeps, with signed ops on top (git-like). Real modules: build/comm/* + the REAL MRole.canUpdate
 * port (build/erp/ad_access.js) on the REAL AD rows of build/erp/ad_full.db; the BASE itself is that same real DB file (its bytes are
 * hashed, its rows are looked up with `<table>_uu`), so nothing here is a synthetic row.
 *
 * Arms (each names the issue it proves or disproves):
 *   §BASE-ID       a different base is a different space id (tamper-evident binding); same base, same params -> same id          [issue: two teams on different DBs must never be one space]
 *   §BASE-INFO     baseInfo() returns the genesis base to a joiner that only has the invite; null before the genesis is seen; null for a space without base
 *   §BASE-CHECK    checkBase: the right DB folds, ONE FLIPPED BYTE is `base-mismatch` with have/want and a plain sentence; no-base space is ok/base:false; missing -> mismatch
 *   §BASE-SKEW     an op authored on another base (stamped by the host-supplied hash) is REFUSED `base-skew` on an honest observer, BEFORE access; a hand-stamped `m0` too; the right one MERGES
 *   §BASE-NOBASE   a space without base behaves as before: manifest stays m0, nothing is base-skew, base-row questions are never asked (baseRow not called)
 *   §BASE-EDIT     a base record edited: role with write on its org MERGED; role without write REFUSED access:* by the BASE ROW's scope; a uu in neither log nor base REFUSED base-row-missing;
 *                  precedence: a CREATE in the log wins over the base row (baseRow NOT asked for it); the m_storagereservation write of the section 13.7 Complete flips scope-unknown -> MERGED (before/after counts printed)
 *   §BASE-PERMUTE  20 arrival orders judged by an observer -> identical verdicts (sync baseRow), and an ASYNC baseRow gives the same verdicts
 * Mutation checks (see the log of the run): COMM_DIR=<mutated copy> must turn this witness RED.
 *
 * Run: node scripts/witness_comm_base.js 2>&1 | tee build/comm/logs/witness_comm_base.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var B = process.env.COMM_DIR ? path.resolve(process.env.COMM_DIR) : path.join(__dirname, '..', 'build', 'comm');
var ENV = require(path.join(B, 'comm_envelope.js')), STORE = require(path.join(B, 'comm_store.js')), ROS = require(path.join(B, 'comm_roster.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js'));

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function incon(label, why) { inconclusive.push(label); console.log('   ⚪ INCONCLUSIVE ' + label + ' — ' + why); }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var uuid = function () { return nodeCrypto.randomUUID(); };
var logs = []; function quietLog(m) { logs.push(m); }

var DBFILE = process.env.BASE_DB || path.join(__dirname, '..', 'build', 'erp', 'ad_full.db');
var ADDB = new Better(DBFILE, { readonly: true });
var roleCache = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roleCache[roleId]; if (r === undefined) { try { r = AD.buildRole(ADDB, roleId); } catch (e) { r = null; } roleCache[roleId] = r; }
  return r ? r.canUpdate(client, org, Number(t.id), t.lvl) : { allowed: false, reason: 'no-role' };
}
// the host's base-row lookup over the REAL base DB (what erp/team_sync.js does over its pristine copy of ad_seed.db)
var asked = [];
function baseRowSync(table, uu) {
  asked.push(table + '|' + uu);
  if (!/^[a-z_]+$/.test(table)) return null;
  var r; try { r = ADDB.prepare('SELECT ad_client_id AS c, ad_org_id AS o FROM ' + table + ' WHERE ' + table + '_uu=?').get(uu); } catch (e) { return null; }
  return r ? { client: r.c, org: r.o } : null;
}
function baseRowAsync(table, uu) { return new Promise(function (res) { setImmediate(function () { res(baseRowSync(table, uu)); }); }); }

(async function () {
  console.log('═══ W-BASE-HASH / W-BASE-EDIT (engine) — the shared loaded DB with signed ops on top (TEAMWORK_FRAMEWORK §13.12.I) ═══\n');
  var SQL = await initSqlJs();
  var bytes = fs.readFileSync(DBFILE);
  var base = await STORE.baseFromBytes('ad_full.db', new Uint8Array(bytes), 'witness-1');
  console.log('§BASE file=' + path.basename(DBFILE) + ' bytes=' + base.bytes + ' sha256=' + base.sha256.slice(0, 16) + ' (real DB, hashed here by CommStore.baseFromBytes)');
  var flipped = Buffer.from(bytes); flipped[Math.floor(flipped.length / 2)] ^= 1;                   // ONE byte of one page
  var base2 = await STORE.baseFromBytes('ad_full.db', new Uint8Array(flipped), 'witness-1');
  console.log('§BASE one flipped byte: sha256=' + base2.sha256.slice(0, 16));

  // real rows of the base
  var bp0 = ADDB.prepare('SELECT c_bpartner_uu AS u, ad_client_id AS c, ad_org_id AS o FROM c_bpartner WHERE c_bpartner_uu IS NOT NULL AND ad_org_id=0 LIMIT 1').get();
  var bp11 = ADDB.prepare('SELECT c_bpartner_uu AS u, ad_client_id AS c, ad_org_id AS o FROM c_bpartner WHERE c_bpartner_uu IS NOT NULL AND ad_org_id=11 LIMIT 1').get();
  var rsv = ADDB.prepare('SELECT m_storagereservation_uu AS u, ad_client_id AS c, ad_org_id AS o FROM m_storagereservation WHERE m_storagereservation_uu IS NOT NULL LIMIT 1').get();
  console.log('§BASE rows c_bpartner(org0)=' + (bp0 && bp0.u.slice(0, 8)) + ' client/org=' + (bp0 && bp0.c + '/' + bp0.o) + ' | c_bpartner(org11)=' + (bp11 && bp11.u.slice(0, 8)) + ' | m_storagereservation=' + (rsv && rsv.u.slice(0, 8)) + ' client/org=' + (rsv && rsv.c + '/' + rsv.o));
  if (!bp0 || !bp11 || !rsv) { console.log('§W-BASE-HASH INCONCLUSIVE judged=0 fails=0 — the base DB has no rows with <table>_uu to look up'); process.exit(2); }
  // the role expectations come from the REAL canUpdate, so the arms are not hand-assumed
  var a102 = access(102, bp0.c, bp0.o, 'c_bpartner'), a103 = access(103, bp0.c, bp0.o, 'c_bpartner'), a103ok = access(103, bp11.c, bp11.o, 'c_bpartner'), r102 = access(102, rsv.c, rsv.o, 'm_storagereservation');
  console.log('§BASE canUpdate: role102@org0=' + a102.allowed + ' role103@org0=' + a103.allowed + ' (' + a103.reason + ') role103@org11=' + a103ok.allowed + ' role102@reservation=' + r102.allowed);
  if (!(a102.allowed && !a103.allowed && a103ok.allowed && r102.allowed)) { console.log('§W-BASE-HASH INCONCLUSIVE judged=0 fails=0 — the AD rows do not give the role split this witness needs'); process.exit(2); }

  var P = { F: uuid(), U: uuid(), M: uuid() };
  var dev = {}; for (var n of ['F', 'U', 'M', 'O']) dev[n] = await STORE.newDevice();
  function mkStore(space, name, person, extra) { var d = dev[name]; d.person_uu = person; return STORE.open(new SQL.Database(), Object.assign({ SQL: SQL, space: space, self: d, access: access, log: quietLog }, extra || {})); }
  async function team(opts, name) {                           // a founder F (role 102) + U (role 103) + M (role 103, will carry the wrong base)
    var sp = await STORE.newSpace(name, dev.F, P.F, 'Founder', 102, opts);
    var S = { F: mkStore(sp.space, 'F', P.F, opts && opts.base ? { baseRow: baseRowSync } : {}) };
    await S.F.genesis(sp.params);
    await S.F.addPerson({ person_uu: P.U, name: 'User', ad_role_id: 103, comm_admin: false });
    await S.F.addPerson({ person_uu: P.M, name: 'Misbased', ad_role_id: 103, comm_admin: false });
    await S.F.enroll(dev.U.kid, dev.U.pubJwk, P.U); await S.F.enroll(dev.M.kid, dev.M.pubJwk, P.M);
    return { sp: sp, S: S };
  }
  function upd(table, uuR, col, o, nw) { var ch = {}; ch[col] = { old: o, new: nw }; return { target: { table: table, uu: uuR }, intent: 'K2', body: { op_type: 'CRUD_UPDATE', params: { changes: ch } } }; }
  function crt(table, uuR, fields) { return { target: { table: table, uu: uuR }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: fields } } }; }
  function envs(stores) { var out = []; stores.forEach(function (s) { s.query("SELECT envelope FROM cl_op WHERE state='OWN'").forEach(function (r) { out.push(JSON.parse(r.envelope)); }); }); return out; }
  async function judge(list, space, extra, shuffleSeed) {
    var obs = dev.O; obs.person_uu = uuid();
    var st = STORE.open(new SQL.Database(), Object.assign({ SQL: SQL, space: space, self: obs, access: access, log: quietLog }, extra || {}));
    for (var e of (shuffleSeed ? shuffle(list, rng(shuffleSeed)) : list)) await st.ingest(e, 'test');
    var Lr = await st.order(), out = {}; Object.keys(Lr.verdict).forEach(function (h) { out[h] = Lr.verdict[h].verdict + ':' + (Lr.verdict[h].reason || ''); });
    return { st: st, L: Lr, v: out };
  }
  var vOf = async function (j, env) { return j.v[await ENV.hashHex(env)] || 'ABSENT'; };
  var canon = function (v) { return JSON.stringify(Object.keys(v).sort().map(function (k) { return [k, v[k]]; })); };

  // ═══ §BASE-ID ═══
  console.log('§BASE-ID');
  var nonce = 'ab'.repeat(16), fnd = { kid: dev.F.kid, jwk: dev.F.pubJwk, person_uu: P.F, name: 'Founder', ad_role_id: 102 };
  var idNone = await ROS.spaceOf({ name: 't', nonce: nonce, founder: fnd }), idA = await ROS.spaceOf({ name: 't', nonce: nonce, founder: fnd, base: base }), idA2 = await ROS.spaceOf({ name: 't', nonce: nonce, founder: fnd, base: Object.assign({}, base) }), idB = await ROS.spaceOf({ name: 't', nonce: nonce, founder: fnd, base: base2 });
  verdict(idA !== idB && idA !== idNone, 'a different base (one flipped byte) is a different space id; a base vs none differs too', idA.slice(0, 10) + ' / ' + idB.slice(0, 10) + ' / ' + idNone.slice(0, 10));
  verdict(idA === idA2, 'CONTROL: the same params with the same base give the same id (so the difference above is the base)', idA.slice(0, 10));
  var sp1 = await STORE.newSpace('bx', dev.F, P.F, 'Founder', 102, { base: base });
  verdict(sp1.params.base && sp1.params.base.sha256 === base.sha256 && sp1.params.base.name === 'ad_full.db' && sp1.params.base.bytes === base.bytes && sp1.params.base.version === 'witness-1', 'newSpace(opts.base) copies {name, sha256, bytes, version} into the genesis params', JSON.stringify(sp1.params.base).slice(0, 120));
  var bad; try { await STORE.newSpace('bx', dev.F, P.F, 'Founder', 102, { base: { name: 'x', sha256: 'nothex' } }); bad = null; } catch (e) { bad = e.message; }
  verdict(bad && /base/i.test(bad), 'a malformed base (sha256 not 64 hex) is refused at newSpace, not silently dropped', String(bad).slice(0, 80));
  var plain = await STORE.newSpace('bx', dev.F, P.F, 'Founder', 102);
  verdict(plain.params.base === undefined && !('base' in plain.params), 'a space made without opts.base has NO base key (its id is exactly what it was before)', Object.keys(plain.params).join(','));

  // ═══ the team with a base ═══
  var T = await team({ base: base }, 'with-base'), TN = await team(undefined, 'no-base');
  console.log('§BASE-TEAM base space=' + T.sp.space.slice(0, 12) + ' no-base space=' + TN.sp.space.slice(0, 12));
  // M authors with the hash of the DB it ACTUALLY has (the host supplies it) — a different base
  var Msto = mkStore(T.sp.space, 'M', P.M, { baseRow: baseRowSync, baseSha256: base2.sha256 });
  var Usto = mkStore(T.sp.space, 'U', P.U, { baseRow: baseRowSync });
  var genesisEnvs = envs([T.S.F]);
  for (var ge of genesisEnvs) { await Msto.ingest(ge, 'x'); await Usto.ingest(ge, 'x'); }

  // ═══ §BASE-INFO ═══
  console.log('\n§BASE-INFO');
  var J0 = STORE.open(new SQL.Database(), { SQL: SQL, space: T.sp.space, self: dev.O, access: access, log: quietLog });
  var i0 = await J0.baseInfo();
  verdict(i0 === null, 'before the genesis is seen the joiner has no base info (null) and its roster is not ok', 'baseInfo=' + JSON.stringify(i0) + ' roster.ok=' + (await J0.order()).roster.ok);
  for (var ge2 of genesisEnvs) await J0.ingest(ge2, 'x');
  var i1 = await J0.baseInfo();
  verdict(i1 && i1.sha256 === base.sha256 && i1.name === 'ad_full.db' && i1.bytes === base.bytes && (await J0.order()).roster.ok, 'a joiner that has only the invite + the genesis reads the team\'s base from the folded roster', JSON.stringify(i1).slice(0, 110));
  var JN = STORE.open(new SQL.Database(), { SQL: SQL, space: TN.sp.space, self: dev.O, access: access, log: quietLog });
  for (var ge3 of envs([TN.S.F])) await JN.ingest(ge3, 'x');
  verdict((await JN.baseInfo()) === null && (await JN.order()).roster.ok, 'a space without base: roster ok and baseInfo() === null (told apart from "genesis not seen")', 'ok=' + (await JN.order()).roster.ok);

  // ═══ §BASE-CHECK ═══
  console.log('\n§BASE-CHECK');
  var c1 = STORE.checkBase(i1, { sha256: base.sha256, bytes: base.bytes });
  verdict(c1.ok === true && c1.base === true, 'the right DB (same hash): ok', JSON.stringify(c1));
  var c2 = STORE.checkBase(i1, { sha256: base2.sha256, bytes: base2.bytes });
  verdict(c2.ok === false && c2.reason === 'base-mismatch' && c2.have === base2.sha256 && c2.want === base.sha256 && typeof c2.message === 'string' && /ad_full\.db/.test(c2.message) && !/undefined|\[object/.test(c2.message),
    'ONE flipped byte of the DB: base-mismatch with have/want and a plain sentence naming the DB', JSON.stringify({ reason: c2.reason, have: String(c2.have).slice(0, 8), want: String(c2.want).slice(0, 8) }) + ' | ' + c2.message);
  verdict(base.sha256 !== base2.sha256 && c2.have !== c2.want, 'CONTROL: the flipped copy really hashes differently (the mismatch above is not a constant)', base.sha256.slice(0, 8) + ' vs ' + base2.sha256.slice(0, 8));
  verdict(STORE.checkBase(i1, null).ok === false && STORE.checkBase(i1, {}).ok === false && STORE.checkBase(i1, { sha256: 'zz' }).reason === 'base-mismatch', 'no hash / empty / junk hash from the host is a mismatch, never an ok (fail closed)');
  var cs = STORE.checkBase(i1, { sha256: base.sha256, bytes: base.bytes + 1 });
  verdict(cs.ok === false && cs.reason === 'base-mismatch', 'same hash but a different byte length (when both are given) is a mismatch', JSON.stringify({ ok: cs.ok, have: cs.have && String(cs.have).slice(0, 8) }));
  var cn = STORE.checkBase(null, { sha256: base2.sha256 });
  verdict(cn.ok === true && cn.base === false, 'a space without base: ok, base:false — whatever DB the host has (additive)', JSON.stringify(cn));

  // ═══ ops from three honest/dishonest devices ═══
  var uNew = uuid(), uGhost = uuid(), uLog = uuid();
  var skewOwn = await Msto.author(crt('c_bpartner', uuid(), { name: 'from-the-wrong-base', ad_client_id: 11, ad_org_id: 11 }));
  var goodOwn = await Usto.author(crt('c_bpartner', uuid(), { name: 'from-the-right-base', ad_client_id: 11, ad_org_id: 11 }));
  var m0 = await Msto.author(Object.assign(crt('c_bpartner', uuid(), { name: 'hand-stamped-m0', ad_client_id: 11, ad_org_id: 11 }), { manifest: 'm0' }));
  var skewDenied = await Msto.author(crt('c_bpartner', uuid(), { name: 'wrong-base-AND-no-access', ad_client_id: 11, ad_org_id: 12 }));    // role 103 has no write on org 12: access would refuse it too if base-skew did not come first
  var goodDenied = await Usto.author(crt('c_bpartner', uuid(), { name: 'right-base-but-no-access', ad_client_id: 11, ad_org_id: 12 }));      // the same op on the right base: access refuses it
  var jb = await judge(genesisEnvs.concat(envs([Msto, Usto])), T.sp.space, { baseRow: baseRowSync });
  // ═══ §BASE-SKEW ═══
  console.log('\n§BASE-SKEW');
  var stampU = goodOwn.env.manifest, stampM = skewOwn.env.manifest;
  verdict(stampU === 'b:' + base.sha256.slice(0, 12) && stampM === 'b:' + base2.sha256.slice(0, 12) && stampU !== stampM, 'author() stamps manifest = b:<sha12>: the genesis base by default, the host-supplied (loaded) hash when the host gives one', stampU + ' / ' + stampM);
  verdict((await vOf(jb, goodOwn.env)).indexOf('MERGED') === 0, 'CONTROL: the op stamped with the team\'s base MERGES', await vOf(jb, goodOwn.env));
  verdict((await vOf(jb, skewOwn.env)) === 'REFUSED:base-skew', 'an op authored on another base is REFUSED base-skew on an honest observer', await vOf(jb, skewOwn.env));
  verdict((await vOf(jb, m0.env)) === 'REFUSED:base-skew', 'a hand-stamped manifest m0 in a space with a base is REFUSED base-skew', await vOf(jb, m0.env));
  verdict(/^REFUSED:access:/.test(await vOf(jb, goodDenied.env)), 'CONTROL: the same org-12 CREATE on the right base is refused by ACCESS (role 103 has no write on org 12)', await vOf(jb, goodDenied.env));
  verdict((await vOf(jb, skewDenied.env)) === 'REFUSED:base-skew', 'base-skew is judged BEFORE access: that same org-12 op from the wrong base reads base-skew, not access', await vOf(jb, skewDenied.env));
  // the identity ops (m0) are never base-skew: the roster still folded
  verdict(jb.L.roster.ok && Object.keys(jb.L.roster.devices).length === 3, 'identity ops carry m0 and are not judged by base-skew: the roster still folds 3 devices', 'devices=' + Object.keys(jb.L.roster.devices).length);

  // ═══ §BASE-NOBASE ═══
  console.log('\n§BASE-NOBASE');
  var Un = mkStore(TN.sp.space, 'U', P.U, { baseRow: baseRowSync });
  var gN = envs([TN.S.F]); for (var gg of gN) await Un.ingest(gg, 'x');
  asked.length = 0;
  var nb = await Un.author(upd('c_bpartner', bp11.u, 'name', 'a', 'b'));
  var nbc = await Un.author(crt('c_bpartner', uLog, { name: 'n', ad_client_id: 11, ad_org_id: 11 }));
  var jn = await judge(gN.concat(envs([Un])), TN.sp.space, { baseRow: baseRowSync });
  verdict(nb.env.manifest === 'm0' && nbc.env.manifest === 'm0', 'a space without base: ops keep manifest m0 (as before)', nb.env.manifest);
  verdict((await vOf(jn, nbc.env)).indexOf('MERGED') === 0, 'a space without base: a normal CREATE still MERGES (no base-skew)', await vOf(jn, nbc.env));
  verdict((await vOf(jn, nb.env)) === 'REFUSED:scope-unknown' && asked.length === 0, 'a space without base: an op on a record with no CREATE is still scope-unknown and baseRow is NEVER asked (even when the host supplies it)', (await vOf(jn, nb.env)) + ' asked=' + asked.length);

  // ═══ §BASE-EDIT ═══
  console.log('\n§BASE-EDIT');
  var Fb = T.S.F, Ub = Usto, Mb = null;
  var eA = await Fb.author(upd('c_bpartner', bp0.u, 'name', 'old', 'new-by-102'));                    // role 102, base row at org 0: allowed
  var eU = await Ub.author(upd('c_bpartner', bp0.u, 'description', 'old', 'by-103-no-write-on-org0'));  // role 103, same row: REFUSED by the base row's scope
  var eU2 = await Ub.author(upd('c_bpartner', bp11.u, 'description', 'old', 'by-103-on-org11'));      // role 103, base row at org 11: allowed
  var eG = await Fb.author(upd('c_bpartner', uGhost, 'name', 'x', 'y'));                              // in neither the log nor the base
  var eT = await Fb.author(upd('ghost_table_not_in_base', bp0.u, 'name', 'x', 'y'));                    // a uu of another table: not in THAT table of the base
  var eC = await Fb.author(crt('c_bpartner', uLog, { name: 'created-in-log', ad_client_id: 11, ad_org_id: 11 }));
  var eCU = await Fb.author(upd('c_bpartner', uLog, 'name', 'created-in-log', 'edited'));             // the CREATE is in the log: ITS scope decides, baseRow not asked
  var eR = await Fb.author(upd('m_storagereservation', rsv.u, 'qty', 0, 2));                          // the section 13.7 Complete's write
  for (var ee of envs([Ub])) await Fb.ingest(ee, 'x');
  asked.length = 0;
  var all = envs([T.S.F, Ub]);
  var jE = await judge(all, T.sp.space, { baseRow: baseRowSync });
  var askedSet = {}; asked.forEach(function (a) { askedSet[a] = 1; });
  var vv = async function (e) { return vOf(jE, e); };
  var vA = await vv(eA.env), vU = await vv(eU.env), vU2 = await vv(eU2.env), vG = await vv(eG.env), vT = await vv(eT.env), vC = await vv(eCU.env), vR = await vv(eR.env);
  verdict(vA.indexOf('MERGED') === 0, 'role 102 edits a BASE record (c_bpartner org 0, no CREATE anywhere in the log): MERGED by the base row\'s scope', vA);
  verdict(/^REFUSED:access:/.test(vU) && !/scope-unknown|base-row-missing/.test(vU), 'role 103 (no write on org 0) editing the SAME base record is REFUSED with an access: reason from the base row\'s scope', vU);
  verdict(vU2.indexOf('MERGED') === 0, 'CONTROL: role 103 editing a base record of ITS org (11) is MERGED — the refusal above is the scope, not the role being blanket-blocked', vU2);
  verdict(vG === 'REFUSED:base-row-missing', 'an op on a uu that is in neither the log nor the base is REFUSED base-row-missing', vG);
  verdict(vT === 'REFUSED:base-row-missing', 'a real base uu asked under another table is also base-row-missing (the lookup is per table)', vT);
  verdict(vC.indexOf('MERGED') === 0 && !askedSet['c_bpartner|' + uLog], 'precedence: an edit of a record CREATED in the log is judged by that CREATE; baseRow was not asked for it', vC + ' asked=' + !!askedSet['c_bpartner|' + uLog]);
  verdict(vR.indexOf('MERGED') === 0, 'the m_storagereservation write of the section 13.7 Complete (role 102, base row org ' + rsv.o + ') is MERGED', vR);
  // before/after: the same op log judged by the SAME engine without the host lookup = the old behaviour
  var jOld = await judge(all, T.sp.space, {});
  var refOld = Object.keys(jOld.v).filter(function (h) { return /^REFUSED/.test(jOld.v[h]); }).length, refNew = Object.keys(jE.v).filter(function (h) { return /^REFUSED/.test(jE.v[h]); }).length;
  var oldR = await vOf(jOld, eR.env), oldA = await vOf(jOld, eA.env);
  console.log('   §BASE-BEFORE-AFTER refused: without baseRow=' + refOld + ' (m_storagereservation: ' + oldR + '; base edit: ' + oldA + ') | with baseRow=' + refNew + ' (m_storagereservation: ' + vR + '; base edit: ' + vA + ')');
  verdict(/^REFUSED:scope-unknown$/.test(oldR) && /^REFUSED:scope-unknown$/.test(oldA) && refOld > refNew, 'BEFORE (no baseRow, as today): the reservation write and the base edit are scope-unknown; AFTER: they apply — refused ' + refOld + ' -> ' + refNew, 'before=' + oldR + ' after=' + vR);
  // a refused base edit does not reach the fold
  var placed = (await jE.st.placedEnvelopes()).map(function (p) { return p.env.target.uu + '|' + Object.keys((p.env.body.params || {}).changes || {}).join(','); });
  verdict(placed.indexOf(bp0.u + '|name') >= 0 && placed.indexOf(bp0.u + '|description') < 0 && placed.indexOf(rsv.u + '|qty') >= 0, 'the fold handed to the kernel contains the admitted base edits and NOT the refused one', placed.map(function (x) { return x.slice(0, 8) + x.slice(36); }).join(' '));

  // ═══ §BASE-PERMUTE ═══
  console.log('\n§BASE-PERMUTE');
  var r0 = canon(jE.v), same = 0, sameAsync = 0;
  for (var i = 0; i < 20; i++) { var jp = await judge(all, T.sp.space, { baseRow: baseRowSync }, 100 + i); if (canon(jp.v) === r0) same++; }
  var jA = await judge(all, T.sp.space, { baseRow: baseRowAsync }); if (canon(jA.v) === r0) sameAsync++;
  verdict(same === 20, '20 arrival orders -> identical verdicts for every op, base edits included', same + '/20');
  verdict(sameAsync === 1, 'an ASYNC baseRow (a host that opens its pristine base lazily) gives the same verdicts as a sync one', sameAsync + '/1');
  verdict(Object.keys(jE.v).length >= 12, 'NON-VACUOUS: the permutation judged ' + Object.keys(jE.v).length + ' ops, ' + refNew + ' of them refused (a permutation over nothing proves nothing)', 'ops=' + Object.keys(jE.v).length);

  console.log('\n──────────────────────────────────────────────');
  var tag = fails ? 'FAIL' : (!judged ? 'INCONCLUSIVE' : (inconclusive.length ? 'PASS-WITH-INCONCLUSIVE(' + inconclusive.length + ')' : 'PASS'));
  console.log('§W-BASE-HASH ' + tag + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inconclusive.length + (process.env.COMM_DIR ? ' [COMM_DIR=' + process.env.COMM_DIR + ']' : ''));
  process.exit(fails || !judged ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
