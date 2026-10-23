#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl3b_github.js — W-GH-PIPE-2DEV. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.11 (CL3b), §11.16.
 * REAL GitHub: private repo red1oon/bim-teams-pipe, token from `gh auth token`. Real build/comm/* on roster trust,
 * real MRole.canUpdate port on build/erp/ad_full.db. Cleans up the device branches it creates.
 *
 * Arms (each names the issue it proves or disproves):
 *   §GH-CONVERGE   — two devices end with the same ops in the same order through GitHub alone.
 *   §GH-RECEIPT    — A's ops are SEEN by B (B's signed head, read back from GitHub).
 *   §GH-ONE-COMMIT — every visit adds exactly ONE commit to the device's own branch (counted on GitHub, not locally).
 *   §GH-READBACK   — "SENT" required a blob read from GitHub (not a local cache): blob GETs > 0 on the sending device.
 *   §GH-OWN-BRANCH — a put under another device's prefix is refused by the pipe (one writer per branch).
 *   §GH-NO-LFS     — no .gitattributes, every object a plain blob ≤256 KB.
 *   §GH-BUDGET     — writes per visit ≤ 5 (logged), within GitHub's 80/min + 500/h content limits.
 *   §GH-ETAG       — MEASURED: does a 304 (If-None-Match) lower X-RateLimit-Remaining? (settles the §11.16 ⛔)
 * Run: node scripts/witness_comm_cl3b_github.js 2>&1 | tee build/comm/logs/witness_comm_cl3b_github.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), cp = require('child_process'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var ROOT = path.join(__dirname, '..'), B = path.join(ROOT, 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), AD = require(path.join(ROOT, 'build', 'erp', 'ad_access.js'));
var OWNER = 'red1oon', REPO = 'bim-teams-pipe', TOKEN = cp.execSync('gh auth token', { encoding: 'utf8' }).trim();
var GAP = Number(process.env.GH_GAP_MS || 12000);

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var ADDB = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
async function gh(method, p, body) {
  var r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + p, { method: method, body: body ? JSON.stringify(body) : undefined,
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  var j = null; try { j = await r.json(); } catch (e) {} return { status: r.status, json: j, rem: Number(r.headers.get('x-ratelimit-remaining')), etag: r.headers.get('etag') };
}
async function commitsOn(branch) { var r = await gh('GET', '/commits?sha=' + encodeURIComponent(branch) + '&per_page=100'); return r.status === 200 ? r.json.length : 0; }

(async function () {
  console.log('═══ W-GH-PIPE-2DEV — GitHub repo as the pipe, one commit per visit (TEAMWORK_FRAMEWORK §12.11) ═══');
  console.log('§GH repo=' + OWNER + '/' + REPO + ' gap_ms=' + GAP + ' started=' + new Date().toISOString());
  var SQL = await initSqlJs(), logs = [];
  var A = await STORE.newDevice(), Bd = await STORE.newDevice(); A.person_uu = nodeCrypto.randomUUID(); Bd.person_uu = nodeCrypto.randomUUID();
  var sp = await STORE.newSpace('cl3b-gh', A, A.person_uu, 'A', 102);
  function mk(d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: access, log: function (m) { logs.push(m); if (/§COMM_SYNC/.test(m)) console.log('     ' + m); } }); }
  var SA = mk(A), SB = mk(Bd);
  var PA = PIPE.ghPipe({ owner: OWNER, repo: REPO, token: TOKEN, self: A.kid, minGapMs: GAP }), PB = PIPE.ghPipe({ owner: OWNER, repo: REPO, token: TOKEN, self: Bd.kid, minGapMs: GAP });
  var created = [];
  try {
    await SA.genesis(sp.params); await SA.addPerson({ person_uu: Bd.person_uu, name: 'B', ad_role_id: 102, comm_admin: false }); await SA.enroll(Bd.kid, Bd.pubJwk, Bd.person_uu);
    var uu = nodeCrypto.randomUUID();
    await SA.author({ target: { table: 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'GH-1', grandtotal: 100, ad_client_id: 11, ad_org_id: 11 } } } });
    var visits = { A: 0, B: 0 }, perVisit = [];
    async function visit(name, store, pipe) {
      var w0 = pipe.stats.writes; await store.sync(pipe); visits[name]++; perVisit.push(pipe.stats.writes - w0);
      console.log('     §GH_BUDGET dev=' + name + ' visit=' + visits[name] + ' reqs=' + pipe.stats.reqs + ' writes=' + pipe.stats.writes + ' (this visit ' + (pipe.stats.writes - w0) + ') notModified=' + pipe.stats.notModified + ' rateRemaining=' + pipe.stats.rateRemaining + ' commits=' + pipe.stats.commits);
    }
    created.push(PA.branchOf(A.kid), PB.branchOf(Bd.kid));
    await visit('A', SA, PA); await visit('B', SB, PB);
    await SB.author({ target: { table: 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'CRUD_UPDATE', params: { changes: { grandtotal: { old: 100, new: 150 } } } } });
    await visit('A', SA, PA); await visit('B', SB, PB); await visit('A', SA, PA);

    console.log('\n§GH-CONVERGE');
    var oA = await SA.order(), oB = await SB.order(), hA = oA.order.join(','), hB = oB.order.join(',');
    verdict(oA.order.length === 5 && hA === hB, 'both devices: the same 5 ops in the same order, via GitHub only', 'A=' + oA.order.length + ' B=' + oB.order.length);
    console.log('\n§GH-RECEIPT');
    var dA = SA.delivery();
    console.log('   §GH delivery A: ' + dA.map(function (x) { return x.seq + ':' + x.state; }).join(' '));
    verdict(dA.length === 4 && dA.every(function (x) { return x.state === 'SEEN' && x.seenBy.indexOf(Bd.kid) >= 0; }), "A's 4 ops SEEN by B (B's signed head read from GitHub)");
    console.log('\n§GH-ONE-COMMIT');
    var cA = await commitsOn(PA.branchOf(A.kid)), cB = await commitsOn(PB.branchOf(Bd.kid));
    console.log('   §GH commits on GitHub: dev/A=' + cA + ' (visits ' + visits.A + ')  dev/B=' + cB + ' (visits ' + visits.B + ')');
    verdict(cA === visits.A && cB === visits.B, 'one commit per visit on each device\'s own branch (counted on GitHub)');
    console.log('\n§GH-READBACK');
    verdict(PA.stats.get > 0 && PA.stats.bytesGet > 0 && SA.query("SELECT COUNT(*) AS n FROM cl_outbox WHERE state='SENT'")[0].n >= 1, 'SENT was earned by reading the bundle back from GitHub', 'A blob bytes read=' + PA.stats.bytesGet);
    console.log('\n§GH-OWN-BRANCH');
    var refused = null; try { await PA.putMany([{ name: 'h/' + Bd.kid, bytes: new Uint8Array([1]) }]); } catch (e) { refused = e.message; }
    verdict(!!refused && /not under my prefix/.test(refused), 'A cannot write under B\'s prefix', refused);
    console.log('\n§GH-NO-LFS');
    var ga = await gh('GET', '/contents/.gitattributes'), big = 0, objs = 0;
    for (var br of created) { var t = await gh('GET', '/git/trees/' + encodeURIComponent(br) + '?recursive=1'); ((t.json && t.json.tree) || []).forEach(function (e) { if (e.type === 'blob') { objs++; if (e.size > 262144) big++; } }); }
    verdict(ga.status === 404 && objs > 0 && big === 0, 'no .gitattributes; ' + objs + ' plain blobs, none over 256 KB', 'gitattributes=' + ga.status);
    console.log('\n§GH-BUDGET');
    console.log('   §GH writes per visit: ' + perVisit.join(',') + '  total A=' + PA.stats.writes + ' B=' + PB.stats.writes);
    verdict(perVisit.every(function (n) { return n <= 5; }), 'every visit made ≤5 write requests', perVisit.join(','));
    console.log('\n§GH-ETAG (measured)');
    var e1 = await gh('GET', '/git/matching-refs/heads/dev/');
    var r2 = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/git/matching-refs/heads/dev/', { headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json', 'If-None-Match': e1.etag } });
    var rem2 = Number(r2.headers.get('x-ratelimit-remaining'));
    var e3 = await gh('GET', '/git/matching-refs/heads/dev/');
    console.log('   §GH_ETAG plain=' + e1.status + ' rem=' + e1.rem + ' → conditional=' + r2.status + ' rem=' + rem2 + ' → plain=' + e3.status + ' rem=' + e3.rem);
    if (r2.status !== 304) inconclusive.push('conditional request did not return 304 (status ' + r2.status + ')');
    else console.log('   §GH_ETAG finding: a 304 ' + (rem2 === e1.rem ? 'did NOT' : 'DID') + ' lower the counter (delta ' + (e1.rem - rem2) + '); the following plain GET lowered it by ' + (rem2 - e3.rem) + '. Other API use on the account can shift these.');
  } finally {
    for (var b of created) { var d = await gh('DELETE', '/git/refs/heads/' + b); console.log('   §GH cleanup ' + b + ' → ' + d.status); }
  }
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-GH-PIPE-2DEV INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-GH-PIPE-2DEV ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
