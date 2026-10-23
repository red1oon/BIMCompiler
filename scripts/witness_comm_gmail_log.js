#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_gmail_log.js — W-GMAIL-LOG. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.14 (§11.19a: Gmail is the visit log).
 * REAL: GitHub pipe (red1oon/bim-teams-pipe) + the deployed BIM Team Postbox Apps Script in amazingerp@gmail.com
 * (url + secret from ~/.config/bim-teams/postbox.json, never in the repo).
 *   §LOG-NOTED    — each of A's and B's visits leaves exactly one note; the log lists it by subject (space, kid, seq).
 *   §LOG-POINTS   — a note's link names a bundle file that really exists on that device's GitHub branch (pointer, not copy).
 *   §LOG-SECRET   — a wrong secret is refused (no strangers filling the mailbox).
 *   §LOG-NONBLOCK — a visit with the postbox unreachable still completes (Gmail is the book, not the delivery).
 * Run: node scripts/witness_comm_gmail_log.js 2>&1 | tee build/comm/logs/witness_comm_gmail_log.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var ROOT = path.join(__dirname, '..'), B = path.join(ROOT, 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), LOG = require(path.join(B, 'comm_visitlog.js'));
var AD = require(path.join(ROOT, 'build', 'erp', 'ad_access.js'));
var PB = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config', 'bim-teams', 'postbox.json'), 'utf8'));
var TOKEN = cp.execSync('gh auth token', { encoding: 'utf8' }).trim(), CFG = { url: PB.url, secret: PB.secret, owner: 'red1oon', repo: 'bim-teams-pipe' };
var fails = 0, judged = 0;
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var ADDB = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) { var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' }; var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
async function gh(method, p) { var r = await fetch('https://api.github.com/repos/red1oon/bim-teams-pipe' + p, { method: method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json' } }); var j = null; try { j = await r.json(); } catch (e) {} return { status: r.status, json: j }; }

(async function () {
  console.log('═══ W-GMAIL-LOG — every visit noted in the amazingerp@gmail.com visit log, pointing at GitHub (§12.14) ═══');
  var SQL = await initSqlJs(), A = await STORE.newDevice(), Bd = await STORE.newDevice(); A.person_uu = nodeCrypto.randomUUID(); Bd.person_uu = nodeCrypto.randomUUID();
  var sp = await STORE.newSpace('gmail-log', A, A.person_uu, 'A', 102);
  function mk(d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: access, log: function () {} }); }
  var SA = mk(A), SB = mk(Bd), PA = PIPE.ghPipe({ owner: 'red1oon', repo: 'bim-teams-pipe', token: TOKEN, self: A.kid, minGapMs: 8000 }), PBp = PIPE.ghPipe({ owner: 'red1oon', repo: 'bim-teams-pipe', token: TOKEN, self: Bd.kid, minGapMs: 8000 });
  var notes = [];
  try {
    await SA.genesis(sp.params); await SA.addPerson({ person_uu: Bd.person_uu, name: 'B', ad_role_id: 102, comm_admin: false }); await SA.enroll(Bd.kid, Bd.pubJwk, Bd.person_uu);
    async function visit(name, s, p) { var rep = await s.sync(p), n = await LOG.noteVisit(s, rep, CFG); notes.push({ name: name, kid: s.kid, n: n }); console.log('   §LOG ' + name + ' visit → note ' + JSON.stringify(n)); }
    await visit('A', SA, PA); await visit('B', SB, PBp);
    await SB.author({ target: { table: 'c_order', uu: nodeCrypto.randomUUID() }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'GM-1', grandtotal: 1, ad_client_id: 11, ad_org_id: 11 } } } });
    await visit('B', SB, PBp); await visit('A', SA, PA);

    console.log('\n§LOG-NOTED');
    var log = await LOG.readLog(CFG, 30), ids = (log.entries || []).map(function (e) { return e.id; });
    var want = notes.map(function (x) { return x.n.id; });
    console.log('   §LOG wrote ' + want.length + ' notes; log returned ' + ids.length + ' newest entries');
    verdict(notes.every(function (x) { return x.n.ok; }), 'all 4 visits were noted (ok)', notes.map(function (x) { return x.n.ok; }).join(','));
    verdict(want.every(function (w) { return ids.indexOf(w) >= 0; }) && new Set(want).size === 4, 'every note is in the Gmail log, matched by its own message id (4 distinct)', want.join(' | '));
    console.log('\n§LOG-POINTS');
    var e = (log.entries || []).filter(function (x) { return x.id === notes[2].n.id; })[0] || {}, m = /blob\/(dev\/[0-9a-f]{16})\/(o\/\S+?\.bimpack)/.exec(e.text || '');
    var exists = m ? await gh('GET', '/contents/' + m[2] + '?ref=' + encodeURIComponent(m[1])) : { status: 0 };
    console.log('   §LOG B\'s 2nd note links ' + (m ? m[1] + ' ' + m[2] : '(no link in snippet)') + ' → GitHub ' + exists.status);
    verdict(!!m && exists.status === 200, 'the note links a bundle file that really exists on B\'s branch');
    console.log('\n§LOG-SECRET');
    var bad = await LOG.noteVisit(SA, {}, { url: CFG.url, secret: 'wrong', owner: 'red1oon', repo: 'bim-teams-pipe' });
    verdict(!bad.ok && bad.error === 'secret', 'a wrong secret is refused', JSON.stringify(bad));
    console.log('\n§LOG-NONBLOCK');
    var rep = await SA.sync(PA), down = await LOG.noteVisit(SA, rep, { url: 'https://script.google.com/macros/s/does-not-exist/exec', secret: 'x', owner: 'red1oon', repo: 'bim-teams-pipe' });
    verdict(rep && rep.placed >= 4 && !down.ok, 'with the postbox unreachable the visit still completed; the note just failed', 'placed=' + rep.placed + ' note=' + JSON.stringify(down).slice(0, 80));
  } finally { for (var k of [A.kid, Bd.kid]) console.log('   §LOG cleanup dev/' + k + ' → ' + (await gh('DELETE', '/git/refs/heads/dev/' + k)).status); }
  console.log('\n──────────────────────────────────────────────');
  console.log('§W-GMAIL-LOG ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
