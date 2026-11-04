#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-SODA-EXECUTOR, prompts/POS_PLUGIN_LOCAL_FIRST.md §28.2 (FL-8: ONE DocAction executor per document type; the Movement is completed by head office, the Movement Confirmation by the
 * DESTINATION branch role). READ THE LOG after every run — the exit code is not evidence. Real modules: build/scriptor (compile.js, emit_erp_plan.js), build/comm (the fold), the REAL source build/scriptor/flows_pos.json.
 *   §E1 ACCEPT   the real source compiles; hub stays 102; executors = {c_order:102, m_movement:102, m_movementconfirm:50004}
 *   §E2 DUAL     a second executor on M_Movement / on M_MovementConfirm is REFUSED (dual-docaction)
 *   §E3 STATION  an UP row whose station is its own executor is REFUSED (station-docaction)
 *   §E4 HUB      the branch executor is not a second hub (without scope:'branch' the plan is hub-ambiguous: the flag does work)
 *   §U UPDOWN   one table with a DOWN and an UP flow only when the UP role is that document type's executor (else updown-not-executor); mutant: check off -> U2 red
 *   §F1 FOLD     the map in force: HQ completes M_Movement MERGED; a station completing M_Movement REFUSED not-executor on every device; the station completes M_MovementConfirm MERGED; HQ completing the confirm REFUSED
 *   §MUTANTS     a copy of build/scriptor with one rule broken (scope flag ignored; dual check off); each must turn >= 1 arm red (a crash is not a kill)
 * Run: NODE_PATH=<node_modules with better-sqlite3 + sql.js> node scripts/witness_soda_plan.js 2>&1 | tee /tmp/soda_logs/witness_soda_plan.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), Better = require('better-sqlite3'), initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..'), SDIR = path.join(ROOT, 'build', 'scriptor');
var db = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0, HQ = 102, BR = 50004;
function say(ok, l, d) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + l + (d ? ' — ' + d : '')); }
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
var SRC = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_pos.json'), 'utf8')), LOCALS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_erp.json'), 'utf8'));
function emit(EP, rows) { try { var o = EP.emitPos(db, rows, LOCALS, 'flows_pos.json'); return { ok: true, o: o }; } catch (e) { return { ok: false, err: String(e.message) }; } }

function compileArms(dir, quiet) {
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; };
  var EP = require(path.join(dir, 'emit_erp_plan.js'));
  var r = emit(EP, clone(SRC));
  A('E1', r.ok && r.o.hub === HQ && JSON.stringify(r.o.executors) === JSON.stringify({ c_order: HQ, m_movement: HQ, m_movementconfirm: BR }), 'E1 the real source compiles: hub ' + HQ + ', one executor per document type', r.ok ? 'hub=' + r.o.hub + ' executors=' + JSON.stringify(r.o.executors) : r.err);
  var d1 = clone(SRC); d1.push({ name: 'X1 dual-movement', treatment: 'LOCAL', table: 'M_Movement', docaction: { executor: 103, actions: ['CO'] } });
  var r2 = emit(EP, d1); A('E2', !r2.ok && /dual-docaction/.test(r2.err), 'E2 a second executor on M_Movement is refused', r2.err);
  var d2 = clone(SRC); d2.push({ name: 'X2 dual-confirm', treatment: 'LOCAL', table: 'M_MovementConfirm', docaction: { executor: HQ, actions: ['CO'], scope: 'branch' } });
  var r3 = emit(EP, d2); A('E2', !r3.ok && /dual-docaction/.test(r3.err), 'E2 a second executor on M_MovementConfirm (even a branch-scoped one) is refused', r3.err);
  var d3 = clone(SRC); d3.push({ name: 'X3 station-up', treatment: 'FACT', role: BR, strategy: 100, dir: 'UP', table: 'M_InOut', carries: ['DocumentNo'], group: 'g', schedule: 'end-of-day', docaction: { executor: BR, actions: ['CO'] } });
  var r4 = emit(EP, d3); A('E3', !r4.ok && /station-docaction/.test(r4.err), 'E3 an UP row whose station is its own executor is refused', r4.err);
  var d4 = clone(SRC); d4.forEach(function (x) { if (x.docaction && x.docaction.scope) delete x.docaction.scope; });
  var r5 = emit(EP, d4); A('E4', !r5.ok && /hub-ambiguous|hub-is-edge/.test(r5.err), "E4 without scope:'branch' the branch executor would be a second hub (the flag is what separates them)", r5.err);
  // U: a table with a DOWN and an UP flow is allowed only when the UP role is that document type's executor (lead decision 2026-11-04)
  var up = function (table, carries, extra) { return Object.assign({ name: 'X9 ' + table + ' up', treatment: 'FACT', role: BR, strategy: 100, dir: 'UP', table: table, carries: carries, group: 'g', schedule: 'end-of-day' }, extra || {}); };
  var u1 = clone(SRC); u1.push(up('M_MovementConfirm', ['DocStatus', 'Processed', 'IsApproved']));
  var r6 = emit(EP, u1); A('U1', r6.ok, 'U1 M_MovementConfirm DOWN + UP is accepted: the UP role 50004 is its named DocAction executor', r6.ok ? 'ok' : r6.err);
  var u2 = clone(SRC); u2.push(up('M_Movement', ['DocStatus']));
  var r7 = emit(EP, u2); A('U2', !r7.ok && /updown-not-executor/.test(r7.err), 'U2 M_Movement DOWN + UP is refused: the UP role 50004 is not its executor (102)', r7.err);
  var u3 = clone(SRC); u3.push({ name: 'X8 pp down', treatment: 'FACT', role: BR, strategy: 100, dir: 'DOWN', table: 'M_ProductPrice', carries: ['PriceStd'], group: 'g', schedule: 'on-change' }); u3.push(up('M_ProductPrice', ['PriceStd']));
  var r8 = emit(EP, u3); A('U3', !r8.ok && /updown-not-executor/.test(r8.err), 'U3 a table with no named executor cannot have a DOWN + UP pair', r8.err);
  return red;
}

async function foldArms(dir, quiet) {
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; };
  var C = (function () { ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe', 'TeamKeys'].forEach(function (n) { delete globalThis[n]; }); var d = path.join(ROOT, 'build', 'comm');
    return { ENV: require(path.join(d, 'comm_envelope.js')), STORE: require(path.join(d, 'comm_store.js')), PIPE: require(path.join(d, 'comm_pipe.js')) }; })();
  var SIGN = require(path.join(dir, 'sign_plan.js')), SQL = await initSqlJs(), STORE = C.STORE, ENV = C.ENV, uuid = function () { return nodeCrypto.randomUUID(); };
  var plan = emit(require(path.join(dir, 'emit_erp_plan.js')), clone(SRC)); var map = plan.ok ? plan.o.executors : { c_order: HQ, m_movement: HQ, m_movementconfirm: BR };
  var k = await SIGN.keygen(), K = { pub: { kty: 'EC', crv: 'P-256', x: k.publicJwk.x, y: k.publicJwk.y }, full: k };
  var hashOf = function (m) { return nodeCrypto.createHash('sha256').update(ENV.canonical(m)).digest('hex'); };
  var access = function () { return { allowed: true }; };
  var dev = {}, per = {}, S = {}, names = ['F', 'B'];                    // F = head office (role 102, founder), B = a branch device (role 50004)
  for (var n of names) { dev[n] = await STORE.newDevice(); dev[n].person_uu = uuid(); per[n] = dev[n].person_uu; }
  var sp = await STORE.newSpace('x', dev.F, per.F, 'F', HQ, { planTrust: [K.pub] });
  names.forEach(function (n) { S[n] = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: dev[n], access: access, log: function () {} }); });
  await S.F.genesis(sp.params);
  await S.F.addPerson({ person_uu: per.B, name: 'B', ad_role_id: BR, comm_admin: false }); await S.F.enroll(dev.B.kid, dev.B.pubJwk, per.B, dev.B.dhPubJwk);
  var pipe = C.PIPE.memPipe('x-' + uuid()); var sync = async function () { for (var r = 0; r < 3; r++) for (var q of names) await S[q].sync(pipe); };
  await sync();
  var st = await SIGN.sign({ kind: 'executors', map: map, prev: hashOf({}) }, K.full.privateJwk, K.full.publicJwk), pol = await S.F.setPolicy({ epoch: 1, visit_ms: 900000, executors: st }); await sync();
  var vd = async function (s, h) { var v = (await s.order()).verdict[h]; return v ? v.verdict + ':' + v.reason : 'none'; };
  var all = async function (h) { await sync(); return [await vd(S.F, h), await vd(S.B, h)]; };
  var isM = function (v) { return v.indexOf('MERGED') === 0; };
  async function doc(s, table) { var uu = uuid(); await s.author({ target: { table: table, uu: uu }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'D-' + uu.slice(0, 4), ad_client_id: 11, ad_org_id: 11 } } } }); return uu; }
  async function complete(s, uu, table) { var h = await s.author({ target: { table: table, uu: uu }, intent: 'K2', body: { op_type: 'SET_STATUS', params: { action: 'CO', from: 'DR', to: 'CO', grp: uuid() } } }); return h.hash; }
  var vp = await all(pol.hash);
  A('F1', vp.every(isM), 'F1 the plan\'s executors map ' + JSON.stringify(map) + ' (signed) is MERGED on both devices', vp.join(' '));
  var mF = await complete(S.F, await doc(S.F, 'm_movement'), 'm_movement'), vF = await all(mF);
  A('F1', vF.every(isM), 'F1 head office completes M_Movement: MERGED on both devices', vF.join(' '));
  var mB = await complete(S.B, await doc(S.B, 'm_movement'), 'm_movement'), vB = await all(mB);
  A('F1', vB.every(function (v) { return v === 'REFUSED:not-executor'; }), 'F1 a branch/station completing M_Movement is REFUSED not-executor on EVERY device', vB.join(' '));
  var cB = await complete(S.B, await doc(S.B, 'm_movementconfirm'), 'm_movementconfirm'), vCB = await all(cB);
  A('F1', vCB.every(isM), 'F1 the destination branch role completes M_MovementConfirm: MERGED on both devices', vCB.join(' '));
  var cF = await complete(S.F, await doc(S.F, 'm_movementconfirm'), 'm_movementconfirm'), vCF = await all(cF);
  A('F1', vCF.every(function (v) { return v === 'REFUSED:not-executor'; }), 'F1 head office completing M_MovementConfirm is REFUSED not-executor (one executor per document type)', vCF.join(' '));
  return red;
}

(async function main() {
  console.log('═══ W-SODA-EXECUTOR — one DocAction executor per document type (prompts/POS_PLUGIN_LOCAL_FIRST.md §28.2) ═══');
  compileArms(SDIR, false); await foldArms(SDIR, false);
  var empty = judged === 0; console.log('§SODA_PLAN_ARMS judged=' + judged + ' fails=' + fails);
  // MUTANTS: a copy of build/scriptor with one rule broken
  var muts = [
    { name: 'scope-flag-ignored', file: 'emit_erp_plan.js', from: "r.docaction.scope !== 'branch'; }).forEach", to: "true; }).forEach", expect: 'E1' },
    { name: 'dual-check-off', file: 'compile.js', from: "if (byTable[t].length > 1) errs.push", to: "if (false) errs.push", expect: 'E2' },
    { name: 'updown-check-off', file: 'compile.js', from: "if (execs.indexOf(u.role) < 0) errs.push", to: "if (false) errs.push", expect: 'U2' }
  ], killed = 0;
  for (var m of muts) {
    var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'soda-mut-')), dir = path.join(tmp, 'build', 'scriptor'); fs.mkdirSync(dir, { recursive: true }); fs.symlinkSync(path.join(ROOT, 'build', 'erp'), path.join(tmp, 'build', 'erp')); fs.readdirSync(SDIR).filter(function (f) { return /\.(js|json)$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(SDIR, f), path.join(dir, f)); }); fs.cpSync(path.join(SDIR, 'treatments'), path.join(dir, 'treatments'), { recursive: true });
    var src = fs.readFileSync(path.join(dir, m.file), 'utf8'), n = src.split(m.from).length - 1;
    if (n !== 1) { console.log('§SODA_MUTANT ' + m.name + ' NOT-APPLIED anchor occurrences=' + n); fails++; continue; }
    fs.writeFileSync(path.join(dir, m.file), src.replace(m.from, function () { return m.to; }));
    var red = []; try { red = compileArms(dir, process.env.SODA_DEBUG ? false : true); } catch (e) { console.log('§SODA_MUTANT ' + m.name + ' CRASHED (not a kill): ' + String(e.message).slice(0, 120)); fails++; continue; }
    var k = red.indexOf(m.expect) >= 0; if (red.indexOf('E1') >= 0 && m.expect !== 'E1' && m.name !== 'x') { console.log('§SODA_MUTANT ' + m.name + ' INVALID: control arm E1 red, so the mutant broke the baseline (a crash is not a kill)'); fails++; continue; } if (k) killed++; else fails++;
    console.log('§SODA_MUTANT ' + m.name + ' applied=1 ' + (k ? 'KILLED' : 'SURVIVED') + ' red=' + red.join(','));
  }
  console.log('§SODA_PLAN_VERDICT ' + (empty ? 'INCONCLUSIVE' : fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' mutantsKilled=' + killed + '/' + muts.length);
  process.exit(fails || empty ? 1 : 0);
})().catch(function (e) { console.log('§SODA_PLAN_VERDICT FAIL exception ' + (e && e.stack || e)); process.exit(2); });
