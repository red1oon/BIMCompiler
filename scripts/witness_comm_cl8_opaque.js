#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl8_opaque.js — W-PIPE-OPAQUE. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.2 (CL8, encryption).
 * Real modules: build/comm/* on real sql.js + WebCrypto (P-256 ECDSA signing + P-256 ECDH key exchange, AES-GCM-256 space key,
 * HKDF-SHA256 + AES-KW grants); writes judged by the real MRole.canUpdate port on build/erp/ad_full.db, as the other comm witnesses.
 *
 * Arms (each names the issue it proves or disproves), run over memPipe AND folderPipe:
 *   §OPAQUE-CONVERGE — encryption must not change the result: A, B, C still end with one op set, one order, all business ops placed.
 *   §OPAQUE-RAW      — the pipe operator can read nothing: every stored object is searched for the documentno strings, the
 *                      distinctive totals and the field names. POSITIVE CONTROL: the same search on a plaintext (pre-CL8) space MUST
 *                      find them, otherwise a 0 would mean nothing (a search that cannot fail is not a witness).
 *   §OPAQUE-OUTSIDER — an outsider with full pipe access reads the identity ops (roster) but ZERO business ops; and an ENROLLED
 *                      device that was given no key grant (ENROLL without dhJwk) is in the roster but still reads zero.
 *   §OPAQUE-LATE     — a late joiner that first sees only ciphertext opens everything once its grant arrives, and lands on the same order.
 *   §OPAQUE-NOKEY    — no symmetric key is stored: a fresh comm.db + the device's own keys re-derives every key from the pipe; the raw
 *                      key bytes appear nowhere in comm.db nor in the pipe.
 *   §OPAQUE-TAMPER   — a flipped ciphertext byte is refused by the GCM tag (not placed, counted), and restoring the honest bytes heals it.
 *   §OPAQUE-REVOKE   — REVOKE C → the admin's next visit writes REKEY (epoch 2) + grants to every non-revoked device; B's new op is
 *                      epoch 2; C cannot open it (its epoch-1 key is refused by GCM, not merely absent), A and the late joiner can.
 *
 * Run: node scripts/witness_comm_cl8_opaque.js 2>&1 | tee build/comm/logs/witness_comm_cl8_opaque.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {     // the real AD layer (MRole.canUpdate port), fail-closed
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var slog = function (m) { if (/§COMM_(CRYPT|REKEY|KEY|SEAL)/.test(m)) console.log('     ' + m); };

// the business values that must never reach the pipe in the clear
var ORDERS = [
  { who: 'A', docno: 'OPAQ-A-8814', total: 7391.25, total2: 7402.75 },
  { who: 'B', docno: 'OPAQ-B-3307', total: 5120.75, total2: 5133.5 },
  { who: 'C', docno: 'OPAQ-C-6620', total: 9988.5, total2: 9994.125 }
];
var POST = { docno: 'OPAQ-B-POST-REKEY-5519', total: 4242.42 };
var NEEDLES = ['grandtotal', 'documentno', 'c_order', POST.docno, String(POST.total)];
ORDERS.forEach(function (o) { NEEDLES.push(o.docno, String(o.total), String(o.total2)); });

function create(s, uu, docno, total) { return s.author({ target: { table: 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } }); }
function update(s, uu, oldT, newT) { return s.author({ target: { table: 'c_order', uu: uu }, intent: 'K1', body: { op_type: 'CRUD_UPDATE', params: { changes: { grandtotal: { old: oldT, new: newT } } } } }); }
function opSet(s) { return s.query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }).join(','); }
async function bizOrder(s) { return (await s.placedEnvelopes()).map(function (p) { return p.hash; }); }
function h16(a) { return nodeCrypto.createHash('sha256').update(a.join(',')).digest('hex').slice(0, 16); }

// search every object of a pipe for every needle (latin1 view of the bytes, so a match in a SQLite page is found like grep -a)
async function scan(pipe, needles) {
  var names = await pipe.list(''), hits = {}, bytes = 0, encRows = 0;
  needles.forEach(function (n) { hits[n] = []; });
  for (var n of names) { var b = await pipe.get(n); if (!b) continue; bytes += b.length; var t = Buffer.from(b).toString('latin1');
    needles.forEach(function (nd) { if (t.indexOf(nd) >= 0) hits[nd].push(n); });
    encRows += (t.match(/enc:\d+:/g) || []).length; }
  var total = 0; Object.keys(hits).forEach(function (k) { total += hits[k].length; });
  return { objects: names.length, bytes: bytes, hits: hits, total: total, encRows: encRows };
}
async function rawKeyHex(store, epoch) { var ring = await store.keyring(); return Buffer.from(await globalThis.crypto.subtle.exportKey('raw', ring[epoch][0])).toString('hex'); }

async function run(SQL, pipeName, makePipe) {
  console.log('\n════ pipe = ' + pipeName + ' ════');
  var pipe = makePipe(), dev = {}, persons = {};
  for (var n of ['A', 'B', 'C', 'L', 'E', 'O']) { dev[n] = await STORE.newDevice(); dev[n].person_uu = nodeCrypto.randomUUID(); persons[n] = dev[n].person_uu; }
  var sp = await STORE.newSpace('cl8-opaque', dev.A, persons.A, 'A', 102), SPACE = sp.space;
  console.log('§CL8 space=' + SPACE.slice(0, 12) + ' founder=' + dev.A.kid + ' founder.dh_jwk=' + (sp.params.founder.dh_jwk ? 'yes' : 'NO'));
  function mk(d, db) { return STORE.open(db || new SQL.Database(), { SQL: SQL, space: SPACE, self: d, access: access, log: slog }); }
  var S = { A: mk(dev.A), B: mk(dev.B), C: mk(dev.C) };
  await S.A.genesis(sp.params);
  for (var k of ['B', 'C']) { await S.A.addPerson({ person_uu: persons[k], name: k, ad_role_id: 102, comm_admin: false }); await S.A.enroll(dev[k].kid, dev[k].pubJwk, persons[k], dev[k].dhPubJwk); }
  await S.A.sync(pipe); await S.B.sync(pipe); await S.C.sync(pipe);
  var grantsA = S.A.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type='KEYGRANT'")[0].n;
  console.log('   §OPAQUE-SETUP keygrant ops authored by A = ' + grantsA + ' (founder + B + C expected 3)');
  verdict(grantsA === 3, 'founder self-grant + one KEYGRANT per enrolled device, issued in the same visit as the ENROLL', 'grants=' + grantsA);
  for (var d of ['B', 'C']) { var rg = await S[d].keyring(); verdict(Object.keys(rg).join() === '1', d + ' derived epoch 1 from its grant at fold time', 'epochs=' + Object.keys(rg).join()); }

  // ── §OPAQUE-CONVERGE ──
  var uu = {}; ORDERS.forEach(function (o) { uu[o.who] = nodeCrypto.randomUUID(); });
  for (var o of ORDERS) { await create(S[o.who], uu[o.who], o.docno, o.total); await update(S[o.who], uu[o.who], o.total, o.total2); }
  for (var r = 0; r < 3; r++) for (var m of ['A', 'B', 'C']) await S[m].sync(pipe);
  var sets = ['A', 'B', 'C'].map(function (x) { return opSet(S[x]); }), ord = [], biz = [];
  for (var x of ['A', 'B', 'C']) { var bo = await bizOrder(S[x]); biz.push(bo.length); ord.push(h16(bo)); }
  console.log('   §OPAQUE-CONVERGE business=' + biz.join('/') + ' order=' + ord.join('/'));
  verdict(biz.every(function (v) { return v === 6; }), 'all 6 business ops placed on A, B and C', 'business=' + biz.join('/'));
  verdict(sets[0] === sets[1] && sets[1] === sets[2] && ord[0] === ord[1] && ord[1] === ord[2], 'same op set and one order on A, B, C');
  var totalBiz = 6;

  // ── §OPAQUE-RAW (+ positive control) ──
  var sc = await scan(pipe, NEEDLES);
  console.log('   §OPAQUE-RAW pipe objects=' + sc.objects + ' bytes=' + sc.bytes + ' sealed-rows=' + sc.encRows + ' needles=' + NEEDLES.length + ' hits=' + sc.total);
  if (sc.objects === 0 || sc.encRows === 0) inconclusive.push(pipeName + ': raw scan saw no objects / no sealed rows');
  verdict(sc.total === 0 && sc.encRows >= totalBiz, 'raw pipe bytes contain none of the ' + NEEDLES.length + ' business strings/values and carry >= ' + totalBiz + ' sealed rows',
          'hits=' + sc.total + ' sealed=' + sc.encRows + (sc.total ? ' ' + JSON.stringify(sc.hits) : ''));
  var ctl = PIPE.memPipe('control'), cd = await STORE.newDevice(); cd.person_uu = nodeCrypto.randomUUID(); delete cd.dhPubJwk; delete cd.dhPrivateKey;     // a pre-CL8 device = a plaintext space
  var csp = await STORE.newSpace('cl8-control', cd, cd.person_uu, 'Ctl', 102), cs = STORE.open(new SQL.Database(), { SQL: SQL, space: csp.space, self: cd, access: access, log: slog });
  await cs.genesis(csp.params); var cu = nodeCrypto.randomUUID(); await create(cs, cu, ORDERS[0].docno, ORDERS[0].total); await update(cs, cu, ORDERS[0].total, ORDERS[0].total2); await cs.sync(ctl);
  var cscan = await scan(ctl, [ORDERS[0].docno, String(ORDERS[0].total), String(ORDERS[0].total2), 'grandtotal', 'c_order']);
  var ctlFound = Object.keys(cscan.hits).filter(function (kk) { return cscan.hits[kk].length > 0; }).length;
  console.log('   §OPAQUE-RAW control (plaintext space) needles found=' + ctlFound + '/5 sealed-rows=' + cscan.encRows);
  if (ctlFound < 5) inconclusive.push(pipeName + ': the raw-byte search did not find values in a PLAINTEXT pipe, so its 0 elsewhere proves nothing');
  verdict(ctlFound === 5 && cscan.encRows === 0, 'POSITIVE CONTROL: the same search finds all 5 needles in a plaintext space (the search can fail)', 'found=' + ctlFound + '/5');

  // ── §OPAQUE-OUTSIDER ──
  var ro = { id: pipe.id, list: pipe.list, get: pipe.get, put: async function () { return true; } };    // full read access, writes discarded
  var SO = mk(dev.O), rO = await SO.sync(ro), LO = await SO.order(), bizO = (await SO.placedEnvelopes()).length;
  var idRows = SO.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type IN ('GENESIS','PERSON','ENROLL','KEYGRANT')")[0].n;
  var bizRows = SO.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type LIKE 'CRUD%'")[0].n;
  console.log('   §OPAQUE-OUTSIDER identity ops read=' + idRows + ' roster devices=' + Object.keys(LO.roster.devices).length + ' business ops read=' + bizRows + ' placed=' + bizO + ' sealed=' + rO.sealed + ' foldable=' + (await SO.foldable()).length);
  if (idRows === 0) inconclusive.push(pipeName + ': outsider read no identity ops, "reads identity" arm is vacuous');
  verdict(LO.roster.ok && Object.keys(LO.roster.devices).length === 3 && idRows >= 6, 'outsider reads the identity ops (roster: 3 devices) ', 'identity=' + idRows);
  verdict(bizRows === 0 && bizO === 0 && rO.sealed >= totalBiz && (await SO.foldable()).length === 0, 'outsider reads ZERO business ops (all ' + rO.sealed + ' stay sealed)', 'business=' + bizRows + ' sealed=' + rO.sealed);
  // enrolled but never granted a key: the "ENROLL without dhJwk still works, just no key grant" API promise
  await S.A.addPerson({ person_uu: persons.E, name: 'E', ad_role_id: 102, comm_admin: false }); await S.A.enroll(dev.E.kid, dev.E.pubJwk, persons.E);
  await S.A.sync(pipe);
  var SE = mk(dev.E), rE = await SE.sync(pipe), LE = await SE.order();
  console.log('   §OPAQUE-NOGRANT E enrolled without dh_jwk: in roster=' + !!LE.roster.devices[dev.E.kid] + ' epochs=' + (Object.keys(await SE.keyring()).join() || 'none') + ' business placed=' + (await SE.placedEnvelopes()).length + ' sealed=' + rE.sealed);
  verdict(!!LE.roster.devices[dev.E.kid] && (await SE.placedEnvelopes()).length === 0 && rE.sealed >= totalBiz, 'an enrolled device without a grant is in the roster but reads zero business ops', 'sealed=' + rE.sealed);

  // ── §OPAQUE-LATE ──
  var SL0 = mk(dev.L), rL0 = await SL0.sync(ro);     // L has not been enrolled yet: only ciphertext
  console.log('   §OPAQUE-LATE before enrol: business placed=' + (await SL0.placedEnvelopes()).length + ' sealed=' + rL0.sealed);
  var beforeSealed = rL0.sealed;
  await S.A.addPerson({ person_uu: persons.L, name: 'L', ad_role_id: 102, comm_admin: false }); await S.A.enroll(dev.L.kid, dev.L.pubJwk, persons.L, dev.L.dhPubJwk);
  await S.A.sync(pipe);
  var SL = mk(dev.L), rL = await SL.sync(pipe), bL = await bizOrder(SL), bA = await bizOrder(S.A);
  console.log('   §OPAQUE-LATE after grant: opened=' + rL.opened + ' sealed=' + rL.sealed + ' business placed=' + bL.length + ' order(L)=' + h16(bL) + ' order(A)=' + h16(bA));
  if (beforeSealed === 0) inconclusive.push(pipeName + ': late joiner had nothing sealed before its grant');
  verdict(rL.opened >= totalBiz && rL.sealed === 0 && bL.length === totalBiz && h16(bL) === h16(bA), 'late joiner opens the ' + beforeSealed + ' sealed ops after its grant and lands on A\'s order', 'opened=' + rL.opened + ' placed=' + bL.length);

  // ── §OPAQUE-NOKEY ──
  var k1 = await rawKeyHex(SL, 1), k1b64 = Buffer.from(k1, 'hex').toString('base64'), dbBytes = Buffer.from(SL.db.export()).toString('latin1'), pipeScan = await scan(pipe, [k1, k1b64]);
  var inDb = dbBytes.indexOf(Buffer.from(k1, 'hex').toString('latin1')) >= 0 || dbBytes.indexOf(k1) >= 0 || dbBytes.indexOf(k1b64) >= 0;
  var SL2 = mk(dev.L), rL2 = await SL2.sync(ro);                         // a brand-new comm.db: nothing stored, only the device's own keys
  console.log('   §OPAQUE-NOKEY raw epoch-1 key found in comm.db=' + inDb + ' in pipe=' + pipeScan.total + ' ; fresh comm.db re-derived epochs=' + Object.keys(await SL2.keyring()).join() + ' placed=' + (await SL2.placedEnvelopes()).length);
  verdict(!inDb && pipeScan.total === 0, 'the raw space key is in neither comm.db nor the pipe (never stored)');
  verdict((await SL2.placedEnvelopes()).length === totalBiz && Object.keys(await SL2.keyring()).join() === '1', 'a fresh comm.db re-derives the key from the pipe and places everything', 'placed=' + (await SL2.placedEnvelopes()).length);

  // ── §OPAQUE-TAMPER (the LAST sealed row of a bundle = A's update, so no other op depends on it and exactly one op is lost) ──
  var aNames = (await pipe.list('s/' + SPACE + '/o/' + dev.A.kid + '/')), victim = null, orig = null, vhash = null;
  for (var nm of aNames) { var bytes = await pipe.get(nm), bd = new SQL.Database(bytes), rows = bd.exec('SELECT op_hash, envelope FROM ops')[0].values; bd.close();
    var er = rows.filter(function (rr) { return String(rr[1]).indexOf('enc:') === 0; }).pop(); if (er) { victim = nm; orig = bytes; vhash = er[0]; var ct = er[1]; break; } }
  if (!victim) { inconclusive.push(pipeName + ': no sealed row to tamper with'); }
  else {
    var td = new SQL.Database(orig), parts = String(ct).split(':'), cb = Buffer.from(parts[2], 'base64'); cb[cb.length - 3] ^= 0x01;        // flip one bit inside the GCM ciphertext/tag
    td.run('UPDATE ops SET envelope=? WHERE op_hash=?', ['enc:' + parts[1] + ':' + cb.toString('base64'), vhash]); var tb = td.export(); td.close();
    await pipe.put(victim, tb);
    var ST = mk(dev.L), rT = await ST.sync(ro);
    var has = ST.query('SELECT 1 FROM cl_op WHERE op_hash=?', [vhash]).length;
    console.log('   §OPAQUE-TAMPER bundle=' + victim + ' flipped 1 bit of op ' + vhash.slice(0, 12) + ' → tampered=' + rT.tampered + ' op-in-store=' + has + ' placed=' + (await ST.placedEnvelopes()).length + '/' + totalBiz);
    verdict(rT.tampered === 1 && has === 0 && (await ST.placedEnvelopes()).length === totalBiz - 1, 'tampered ciphertext is refused by the GCM tag, counted, not placed; the other ops still are', 'tampered=' + rT.tampered);
    await pipe.put(victim, orig);                                            // the honest bytes come back
    var rT2 = await ST.sync(ro);
    console.log('   §OPAQUE-TAMPER after restore: tampered=' + rT2.tampered + ' placed=' + (await ST.placedEnvelopes()).length + '/' + totalBiz);
    verdict(rT2.tampered === 0 && (await ST.placedEnvelopes()).length === totalBiz, 'restoring the honest bundle heals it (the refusal did not poison the bundle)', 'placed=' + (await ST.placedEnvelopes()).length);
  }

  // ── §OPAQUE-REVOKE ──
  var preRekey = S.A.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type='REKEY'")[0].n;
  var cLast = S.C.query('SELECT MAX(author_seq) AS s FROM cl_op WHERE author_kid=?', [dev.C.kid])[0].s;
  await S.A.revoke(dev.C.kid, cLast); await S.A.sync(pipe);                  // the admin's next visit writes REKEY
  var rekeys = S.A.query("SELECT envelope FROM cl_op WHERE op_type='REKEY'").map(function (q) { return JSON.parse(q.envelope).body.params; });
  var LA = await S.A.order(), ringA = await S.A.keyring();
  console.log('   §OPAQUE-REVOKE REKEY ops before revoke=' + preRekey + ' after A\'s visit=' + rekeys.length + ' epoch=' + LA.roster.epoch + ' A epochs=' + Object.keys(ringA).join());
  verdict(preRekey === 0 && rekeys.length === 1 && rekeys[0].epoch === 2 && LA.roster.epoch === 2 && Object.keys(ringA).join() === '1,2', 'REVOKE → one REKEY (epoch 2) at the admin\'s next visit; A holds epochs 1,2', 'epoch=' + LA.roster.epoch);
  var g2 = LA.roster.grants.filter(function (g) { return g.epoch === 2; }).map(function (g) { return g.kid; }).sort(), want = [dev.A.kid, dev.B.kid, dev.L.kid].sort();
  verdict(JSON.stringify(g2) === JSON.stringify(want) && g2.indexOf(dev.C.kid) < 0, 'epoch-2 grants go to every non-revoked device with a key (A, B, L) and NOT to C', 'granted=' + g2.length + ' C=' + (g2.indexOf(dev.C.kid) >= 0));
  await S.B.sync(pipe);
  var ringB = await S.B.keyring();
  await create(S.B, nodeCrypto.randomUUID(), POST.docno, POST.total); await S.B.sync(pipe);        // B writes AFTER the rekey
  var rC = await S.C.sync(pipe), ringC = await S.C.keyring(), LC = await S.C.order(), cPlaced = (await bizOrder(S.C)).length;
  await S.A.sync(pipe); await SL.sync(pipe);
  var aPlaced = (await bizOrder(S.A)).length, lPlaced = (await bizOrder(SL)).length, bPlaced = (await bizOrder(S.B)).length;
  console.log('   §OPAQUE-REVOKE B epochs=' + Object.keys(ringB).join() + ' ; C epochs=' + Object.keys(ringC).join() + ' revoked=' + (LC.roster.revokes[dev.C.kid] != null) + ' C placed=' + cPlaced + ' sealed=' + rC.sealed + ' ; A placed=' + aPlaced + ' L placed=' + lPlaced + ' B placed=' + bPlaced);
  verdict(Object.keys(ringB).join() === '1,2', 'B received its epoch-2 grant on its next visit', 'epochs=' + Object.keys(ringB).join());
  verdict(Object.keys(ringC).join() === '1' && rC.sealed >= 1 && cPlaced === totalBiz, 'C (revoked) still holds only epoch 1, keeps the old ' + totalBiz + ' ops but B\'s new op stays sealed', 'C placed=' + cPlaced + ' sealed=' + rC.sealed);
  verdict(aPlaced === totalBiz + 1 && lPlaced === totalBiz + 1 && bPlaced === totalBiz + 1, 'A, B and the late joiner all open B\'s post-rekey op', 'A=' + aPlaced + ' L=' + lPlaced + ' B=' + bPlaced);
  // the revoked device's epoch-1 key is REFUSED by GCM on the epoch-2 row (not just "no key under that label")
  var bnames = await pipe.list('s/' + SPACE + '/o/' + dev.B.kid + '/'), lastB = await pipe.get(bnames[bnames.length - 1]), lb = new SQL.Database(lastB), row2 = lb.exec('SELECT envelope FROM ops')[0].values.map(function (q) { return String(q[0]); }).filter(function (t) { return t.indexOf('enc:2:') === 0; })[0]; lb.close();
  var forced = 'not-tried';
  if (row2) { var raw2 = Buffer.from(row2.split(':')[2], 'base64'); try { await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw2.slice(0, 12), additionalData: new TextEncoder().encode('bim-comm-op|' + SPACE + '|2') }, ringC[1][0], raw2.slice(12)); forced = 'OPENED'; } catch (e) { forced = 'refused'; } }
  else inconclusive.push(pipeName + ': B\'s post-rekey bundle has no enc:2 row');
  console.log('   §OPAQUE-REVOKE B\'s post-rekey row is ' + (row2 ? row2.slice(0, 6) : 'MISSING') + ' ; C forcing its epoch-1 key on it → ' + forced);
  verdict(!!row2 && forced === 'refused', 'B\'s post-rekey op is stored as enc:2 and C\'s epoch-1 key is refused on it by GCM', 'forced=' + forced);
  var sc2 = await scan(pipe, NEEDLES);
  console.log('   §OPAQUE-RAW after rekey: objects=' + sc2.objects + ' sealed-rows=' + sc2.encRows + ' hits=' + sc2.total);
  verdict(sc2.total === 0 && sc2.encRows >= totalBiz + 1, 'the pipe still holds none of the business strings after the rekey (incl. the post-rekey order)', 'hits=' + sc2.total + ' sealed=' + sc2.encRows);
}

(async function () {
  console.log('═══ W-PIPE-OPAQUE — the pipe sees only ciphertext (TEAMWORK_FRAMEWORK §13.2, CL8) ═══');
  var SQL = await initSqlJs();
  await run(SQL, 'memPipe', function () { return PIPE.memPipe('mem'); });
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-cl8-'));
  try { await run(SQL, 'folderPipe ' + dir, function () { return PIPE.folderPipe(dir, 'folder'); }); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-PIPE-OPAQUE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-PIPE-OPAQUE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
