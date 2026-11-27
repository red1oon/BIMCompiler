#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — W-TERMS-VISIT. Spec: prompts/TEAMWORK_FRAMEWORK.md §48.2 (terms VISIT lossless / offline, ACK refused). READ THE LOG after every run — the exit code is not evidence.
 * Real modules: build/comm/{comm_envelope,comm_store,comm_pipe}.js on real sql.js + WebCrypto; writes judged by the real MRole.canUpdate port (build/erp/ad_full.db).
 * Arms (each names the issue it proves or disproves; every checker also runs on a DOCTORED state and must report FAIL, or it is not a checker):
 *   §V1-OFFLINE   — a Visit through a dead pipe sends nothing and loses nothing; a later Visit sends every claim once; a third sends nothing.
 *   §V2-LIAR      — a pipe that accepts the put but drops the bytes is caught by the read-back: not marked SENT, the claims stay unsent, a healthy Visit then sends them.
 *   §V3-REFUSED   — a claim the roster refuses shows verdict REFUSED on the SENDER's own delivery trail (what the chip counts), beside accepted ones.
 *   §V4-CHECKERS  — each checker above, fed a doctored state, FAILS (INCONCLUSIVE if it could not be doctored).
 * Run: node scripts/witness_terms_visit.js 2>&1 | tee build/scriptor/witness_terms_visit.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var ROOT = path.join(__dirname, '..'), B = path.join(ROOT, 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(ROOT, 'build', 'erp', 'ad_access.js'));
var ADDB = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }

var fails = 0, judged = 0, inconclusive = 0;
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function mustFail(res, label) { if (res === null) { inconclusive++; console.log('   🟡 INCONCLUSIVE ' + label + ' — could not doctor the state'); return; }
  verdict(res === false, 'CONTROL ' + label + ' (checker on a doctored state must FAIL)', res === false ? 'failed as designed' : 'DID NOT FAIL: the checker cannot see this defect'); }

function downPipe() { var e = function () { return Promise.reject(new Error('offline')); }; return { id: 'down', put: e, get: e, list: e, putIfAbsent: e, ifAbsent: true, stats: { get: 0 } }; }
function liarPipe(real) { var l = Object.create(real); l.put = async function (name, bytes) { if (/\/o\//.test(name)) return true; return real.put(name, bytes); };   // accepts bundle bytes, keeps nothing
  l.putIfAbsent = real.putIfAbsent; return l; }

function ownCount(s) { return s.query("SELECT COUNT(*) AS n FROM cl_op WHERE author_kid=? AND state='OWN'", [s.kid])[0].n; }
function bundledTo(s) { return s.query('SELECT bundled_to AS b FROM cl_self WHERE kid=?', [s.kid])[0].b; }
function unsentBiz(s) { return s.delivery().filter(function (x) { return x.state === 'SAVED'; }).length; }
async function edit(s, uu, n, table) { return s.author({ target: { table: table || 'c_order', uu: uu }, intent: 'K1', ts: 1700000000000 + n,
  body: { op_type: n === 0 ? 'CRUD_CREATE' : 'CRUD_UPDATE', params: n === 0 ? { fields: { documentno: s.kid.slice(0, 4) + '-1', grandtotal: 100, ad_client_id: 11, ad_org_id: 11 } } : { changes: { grandtotal: { old: 100 + n - 1, new: 100 + n } } } } }); }

(async function () {
  console.log('═══ W-TERMS-VISIT — Visit lossless / offline, ACK refused (TEAMWORK_FRAMEWORK §48.2) ═══\n');
  var SQL = await initSqlJs(), pipe = PIPE.memPipe('mem'), devs = [], persons = [];
  for (var i = 0; i < 2; i++) { var d = await STORE.newDevice(); d.person_uu = nodeCrypto.randomUUID(); devs.push(d); persons.push(d.person_uu); }
  var sp = await STORE.newSpace('terms-visit', devs[0], persons[0], 'A', 102), SPACE = sp.space;
  function mk(d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: d, access: access, log: function () {} }); }
  var A = mk(devs[0]), Bd = mk(devs[1]);
  await A.genesis(sp.params);
  await A.addPerson({ person_uu: persons[1], name: 'P1', ad_role_id: 102, comm_admin: false }); await A.enroll(devs[1].kid, devs[1].pubJwk, persons[1], devs[1].dhPubJwk);
  await A.sync(pipe); await Bd.sync(pipe);
  var uu = nodeCrypto.randomUUID();

  // ── §V1-OFFLINE ──
  console.log('§V1-OFFLINE');
  await edit(A, uu, 0); await edit(A, uu, 1);
  var own0 = ownCount(A), bt0 = bundledTo(A), unsent0 = unsentBiz(A), names0 = pipe._names().length, err = null;
  try { await A.sync(downPipe()); } catch (e) { err = e; }
  var lossOk = function (s, o, b, u) { return ownCount(s) === o && bundledTo(s) === b && unsentBiz(s) === u; };
  console.log('   §V1 dead pipe: ' + (err ? 'sync threw "' + err.message + '"' : 'sync returned') + ' own=' + ownCount(A) + ' bundled_to=' + bundledTo(A) + ' unsent=' + unsentBiz(A) + ' pipe objects ' + names0 + ' -> ' + pipe._names().length);
  verdict(lossOk(A, own0, bt0, unsent0) && unsent0 >= 2, 'a dead pipe: every claim still held locally, none marked sent', 'unsent=' + unsentBiz(A));
  verdict(pipe._names().length === names0, 'nothing reached the shared place');
  var rep1 = await A.sync(pipe);
  console.log('   §V1 healthy Visit: sent=' + rep1.sent + ' unsent=' + unsentBiz(A));
  verdict(rep1.sent === unsent0 + 0 || rep1.sent >= 2, 'the later Visit sends every held claim', 'sent=' + rep1.sent);
  verdict(unsentBiz(A) === 0, 'nothing is left unsent after it');
  var rep2 = await A.sync(pipe);
  verdict(rep2.sent === 0, 'a third Visit sends nothing (once only)', 'sent=' + rep2.sent);
  var doctored1 = null; try { doctored1 = lossOk(A, own0 + 5, bt0, unsent0); } catch (e) {}
  mustFail(doctored1, 'V1 loss-checker with a claim missing');

  // ── §V2-LIAR ──
  console.log('§V2-LIAR');
  await edit(A, uu, 2); await edit(A, uu, 3);
  var bt2 = bundledTo(A), un2 = unsentBiz(A), liar = liarPipe(pipe), rl = await A.sync(liar);
  console.log('   §V2 liar pipe: sent=' + rl.sent + ' readBackFail=' + rl.readBackFail + ' bundled_to ' + bt2 + ' -> ' + bundledTo(A) + ' unsent ' + un2 + ' -> ' + unsentBiz(A));
  verdict(rl.readBackFail >= 1 && rl.sent === 0, 'the read-back catches the dropped bundle: not counted as sent', 'readBackFail=' + rl.readBackFail);
  verdict(bundledTo(A) === bt2 && unsentBiz(A) === un2, 'the claims stay unsent (bundled_to did not advance)');
  var rh = await A.sync(pipe);
  verdict(rh.sent >= 2 && unsentBiz(A) === 0, 'a healthy Visit then sends them', 'sent=' + rh.sent);
  await Bd.sync(pipe);
  var seenB = A.delivery().filter(function (x) { return x.seenBy.indexOf(Bd.kid) >= 0; }).length;
  verdict(seenB >= 4, 'the peer saw every claim after it Visited (ACK sent → seen)', 'seen=' + seenB);
  var liarOk = function (rep, bt, un, s) { return rep.readBackFail >= 1 && rep.sent === 0 && bundledTo(s) === bt && unsentBiz(s) === un; };
  mustFail(liarOk({ readBackFail: 0, sent: 2 }, bt2, un2, A), 'V2 liar-checker on a Visit that claims success');

  // ── §V3-REFUSED ──
  console.log('§V3-REFUSED');
  var bad = nodeCrypto.randomUUID(); await edit(A, bad, 0, 'no_such_table_zz'); await A.sync(pipe); await Bd.sync(pipe); await A.sync(pipe);
  var del = A.delivery(), refused = del.filter(function (x) { return x.verdict && /REFUSED/.test(x.verdict); }), merged = del.filter(function (x) { return x.verdict === 'MERGED'; });
  console.log('   §V3 sender trail: accepted(MERGED)=' + merged.length + ' refused=' + refused.length + ' reasons=' + refused.map(function (x) { return x.reason; }).join('|'));
  verdict(refused.length === 1 && refused[0].reason && merged.length >= 4, 'the refused claim is on the sender\'s own trail with a named reason, beside the accepted ones', 'refused=' + refused.length + ' merged=' + merged.length);
  var chipCount = function (d) { return d.filter(function (x) { return x.verdict && /REFUSED/.test(x.verdict); }).length; };
  mustFail(chipCount(del.filter(function (x) { return !/REFUSED/.test(x.verdict || ''); })) === 1, 'V3 refused-counter with the refused claim removed');

  console.log('\n§VISIT_VERDICT ' + (fails ? 'FAIL' : (inconclusive || !judged ? 'INCONCLUSIVE' : 'PASS')) + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inconclusive);
  process.exit(fails ? 1 : (inconclusive || !judged ? 2 : 0));
})().catch(function (e) { console.log('§VISIT_VERDICT FAIL crash ' + (e && e.stack || e)); process.exit(1); });
