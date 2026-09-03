#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-MULTIHOST-SYNC — prompts/BACKEND_SUBSTRATE_LANE.md §MULTIHOST_WITNESS (§MH.2 six arms, §MH.3 run record,
//   §MH.4 showstopper lines, §MH.5 instrument design). THE ISSUE this proves/disproves: does ONE signed op-log
//   snapshot, published by THIS MACHINE, converge on the SAME chain tip and the SAME books when read back over the
//   real network from GH raw and OCI dev in every role (sole source / survivor / forger / stale), with forgeries and
//   stale copies detected under the PINNED controller key — or is the "3 hosts, identical tip" claim a decayed
//   two-host one that nothing noticed (§MH.0)?
//   Composes the FROZEN modules only: erp_replica_client.js (fetch/failover/replay), erp_snapshot_sign.js (pinned
//   key), erp_period_close.js (books), the canonical kernel. No second replica client; no engine re-open.
//   STRUCTURAL: the PASS marker is emitted only when every one of the 3 declared hosts is reachable AND converged —
//   a green log with hosts<3 cannot be produced by this file (§MH.2 vacuity guard).
// WRITES over the network (owner-authenticated, dev only): GH branch mock/relay-snapshot (Contents API) and OCI
//   bucket bim-ootb-dev objects sandbox/erp/{relay_snapshot.json, stale/relay_snapshot.json}. NEVER bim-ootb-live.
// §-log first — READ build/erp/witness_multihost_sync.log before any conclusion (exit code is NOT evidence).
// Run:  bash build/erp/run_witness.sh scripts/witness_multihost_sync.js      (cwd = bim-compiler)
//   exit 0 = PASS · 1 = FAIL · 2 = INCONCLUSIVE/VACUOUS. On PASS writes scripts/multihost_run.json (the record
//   scripts/check_multihost_gate.js keys on). Env: OOTB=<bim-ootb checkout>, MH_GH_WAIT_S (default 330),
//   MH_STAGE=converge (stop after arm 2, no network write — the harness self-check).
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} }; global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs'), http = require('http'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
var MC = require('./multihost_core.js');
var HERE = MC.HERE;
var KERNEL = path.join(HERE, 'build', 'erp', 'kernel_ops.js');                 // canonical (lane header: build/erp is truth)
var SNAP_FILE = path.join(HERE, 'build', 'erp', 'relay_snapshot.json');       // the controller's copy = what `here` serves
var KEYF = path.join(HERE, 'build', 'erp', '.demo_controller_key.json');       // controller private key (gitignored)
var RECORD = path.join(HERE, 'scripts', 'multihost_run.json');

// ── fetch interceptor — MUST precede the replica client require: it binds `_fetch` at load time ──────────────
var realFetch = global.fetch, BLOCKED = [];
if (!realFetch) { console.log('🔴 need Node 18+ (global fetch)'); process.exit(2); }
global.fetch = function (url, init) {
  var u = String(url);
  for (var i = 0; i < BLOCKED.length; i++) if (u.indexOf(BLOCKED[i]) === 0) return Promise.reject(new Error('blocked-by-witness'));
  return realFetch(url, init);
};
var RC = require(path.join(HERE, 'build', 'erp', 'erp_replica_client.js'));
var SIGN = require(path.join(HERE, 'build', 'erp', 'erp_snapshot_sign.js'));
var PC = require(path.join(HERE, 'build', 'erp', 'erp_period_close.js'));
var initSqlJs = require('sql.js');

// ── the hosts and their roles (§MH.5 table) ──────────────────────────────────────────────────────────────────
var GH_REPO = 'red1oon/BIMCompiler', GH_BRANCH = 'mock/relay-snapshot', GH_FILE = 'relay_snapshot.json';
var OCI_NS = 'ax3cp6tzwuy2', OCI_BUCKET = 'bim-ootb-dev', OCI_PREFIX = 'sandbox/erp';
var OCI_ROOT = 'https://objectstorage.ap-kulai-2.oraclecloud.com/n/' + OCI_NS + '/b/';
var H_HERE = { name: 'here', base: null };                                                   // set after listen
var H_GH = { name: 'GH', base: 'https://raw.githubusercontent.com/' + GH_REPO + '/' + GH_BRANCH };
var H_OCI = { name: 'OCI', base: OCI_ROOT + OCI_BUCKET + '/o/' + OCI_PREFIX };
var HOSTS = [H_HERE, H_GH, H_OCI];
var H_DEAD = { name: 'OCI-live', base: OCI_ROOT + 'bim-ootb-live/o/' + OCI_PREFIX };         // real 404, never written

// ── bookkeeping ───────────────────────────────────────────────────────────────────────────────────────────────
var md5 = function (s) { return crypto.createHash('md5').update(s).digest('hex'); };
var ARMS = {}, INCONCLUSIVE = [], fails = 0, T0 = Date.now();
function kv(o) { return Object.keys(o || {}).map(function (k) { return k + '=' + o[k]; }).join(' '); }
function arm(name, status, n, note) { ARMS[name] = { status: status, n: n || {} }; console.log('§ARM ' + name + ' status=' + status + ' ' + kv(n) + (note ? '  — ' + note : '')); }
function check(ok, label, detail) { console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); if (!ok) fails++; return !!ok; }
function inconclusive(why) { INCONCLUSIVE.push(why); console.log('   🟡 INCONCLUSIVE — ' + why); }
function short(t) { return (t || '').slice(0, 12); }

async function probe(url) {   // status + body; never throws
  try { var res = await realFetch(url, { cache: 'no-store' }); var txt = await res.text();
    return { status: res.status, md5: res.ok ? md5(txt) : null, bytes: txt.length, text: res.ok ? txt : null,
      lastModified: res.headers.get('last-modified'), etag: res.headers.get('etag'), ctype: res.headers.get('content-type') }; }
  catch (e) { return { status: 0, err: e.message }; }
}
function parseSnap(txt) { try { return JSON.parse(txt); } catch (e) { return null; } }
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }

var SQL, CLIENT;
// replay a snapshot on a ZERO-STATE db through the frozen client + fold the books through the frozen period-close
async function replay(snap) {
  var K = freshK(), db = new SQL.Database();
  var r = await CLIENT.replayAndVerify(db, K, snap);
  r.books = PC.foldBalances(K.replayOps(db), null).bal; r.db = db; r.K = K;
  return r;
}
function booksEq(a, b) { var keys = {}, max = 0; Object.keys(a).concat(Object.keys(b)).forEach(function (k) { keys[k] = 1; });
  Object.keys(keys).forEach(function (k) { max = Math.max(max, Math.abs((a[k] || 0) - (b[k] || 0))); }); return max; }
// independent oracle for the books: every witness epoch posts AR dr 120000c / Revenue cr 120000c (§MH.5)
function expectedBooks(snap) { var n = (snap.ops || []).filter(function (o) { return o.op_type === 'POST'; }).length; return n ? { '101': 120000 * n, '400': -120000 * n } : {}; }

// ── `here`: a real http origin on this machine serving build/erp/ (+ the forger/stale/fork roles) ─────────────
var SERVED = { tamper: null, stale: null, fork: null };
function serveLocal() {
  var s = http.createServer(function (req, res) {
    var m = /^\/(?:(tamper|stale|fork)\/)?relay_snapshot\.json$/.exec(req.url.split('?')[0]);
    var body = !m ? null : (m[1] ? SERVED[m[1]] : (fs.existsSync(SNAP_FILE) ? fs.readFileSync(SNAP_FILE, 'utf8') : null));
    if (body == null) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', 'application/json'); res.end(body);
  });
  return new Promise(function (r) { s.listen(0, '127.0.0.1', function () { r(s); }); });
}

(async function main() {
  var runUtcMs = Date.now(), runUtc = new Date(runUtcMs).toISOString();   // recorded ONCE; the epoch op's ts (no Date.now() in the fold path)
  console.log('═══ W-MULTIHOST-SYNC ' + runUtc + ' — ' + HOSTS.length + ' declared hosts + 1 real dead host (arm 4) ═══');
  SQL = await initSqlJs();
  var srv = await serveLocal(); H_HERE.base = 'http://127.0.0.1:' + srv.address().port;
  CLIENT = RC.createReplicaClient(HOSTS);
  HOSTS.concat([H_DEAD]).forEach(function (h) { console.log('§HOST ' + h.name + ' base=' + h.base); });

  // ── §PRE_STATE — the §MH.0 re-measurement, every run: what does each host serve BEFORE this run publishes? ──
  console.log('\n§PRE_STATE — each host vs the controller copy (' + path.relative(HERE, SNAP_FILE) + ')');
  var local = parseSnap(fs.readFileSync(SNAP_FILE, 'utf8'));
  if (!local || !Array.isArray(local.ops) || !local.ops.length) { console.log('🟡 W-MULTIHOST-SYNC VACUOUS — controller copy has no ops'); process.exit(2); }
  var localMd5 = md5(fs.readFileSync(SNAP_FILE, 'utf8'));
  var pre = {};
  for (var i = 0; i < HOSTS.length + 1; i++) {
    var h = HOSTS.concat([H_DEAD])[i], p = await probe(h.base + '/relay_snapshot.json'), s = p.text ? parseSnap(p.text) : null;
    pre[h.name] = { http: p.status, md5: p.md5, len: s ? s.len : null, tip: s ? short(s.tip) : null, lastModified: p.lastModified };
    console.log('§PRE_STATE host=' + h.name + ' http=' + p.status + ' md5=' + (p.md5 || '-').slice(0, 8) + ' len=' + (s ? s.len : '-') + ' tip=' + (s ? short(s.tip) : '-') +
      ' last-modified=' + (p.lastModified || '-') + ' vs_controller=' + (p.status !== 200 ? 'DOWN' : (p.md5 === localMd5 ? 'SAME' : (s && s.tip === local.tip ? 'SAME-TIP' : 'DIFF'))));
  }
  var preUp = HOSTS.filter(function (h) { return pre[h.name].http === 200; }).length;
  console.log('§PRE_STATE hosts_up=' + preUp + '/' + HOSTS.length + ' dead_host=' + H_DEAD.name + ' http=' + pre[H_DEAD.name].http);

  var stage = process.env.MH_STAGE || 'full', published = local, publishedMd5 = localMd5;

  // ── ARM 2 · CONVERGE — a zero-state reader per host recomputes the SAME tip == the signed tip, same len, same books
  //    (run first in stage=converge against the controller copy; in a full run it repeats after PUBLISH) ──
  async function converge(label) {
    console.log('\n§CONVERGE ' + label + ' — expected tip=' + short(published.tip) + ' len=' + published.len);
    var ok = 0, res = {}, tipsEq = true, booksMax = 0, exp = expectedBooks(published), expMax = 0;
    for (var j = 0; j < HOSTS.length; j++) {
      var h = HOSTS[j], t = Date.now();
      try {
        var snap = await CLIENT.fetchSnapshot(h);
        var v = await replay(snap);
        res[h.name] = { tip: v.computedTip, len: v.len, sig: v.sigValid, books: v.books };
        var good = v.ok && v.computedTip === published.tip && v.len === published.len && v.sigValid === true;
        if (good) ok++;
        console.log('§CONVERGE host=' + h.name + ' len=' + v.len + ' tip=' + short(v.computedTip) + ' tip_eq=' + (v.computedTip === published.tip) +
          ' sigValid=' + v.sigValid + ' books=' + JSON.stringify(v.books) + ' ms=' + (Date.now() - t));
      } catch (e) { res[h.name] = { err: e.message }; console.log('§CONVERGE host=' + h.name + ' UNREACHABLE ' + e.message); inconclusive('CONVERGE: ' + h.name + ' unreachable (' + e.message + ') — outside arm 4'); }
    }
    var names = Object.keys(res).filter(function (n) { return !res[n].err; });
    for (var a = 1; a < names.length; a++) { if (res[names[a]].tip !== res[names[0]].tip) tipsEq = false; booksMax = Math.max(booksMax, booksEq(res[names[a]].books, res[names[0]].books)); }
    names.forEach(function (n) { expMax = Math.max(expMax, booksEq(res[n].books, exp)); });
    check(ok === HOSTS.length, 'every host replays to the signed tip with len=' + published.len + ' and sigValid=true', ok + '/' + HOSTS.length);
    check(tipsEq && names.length > 1, 'all reachable hosts agree on one tip (host is disposable)', names.length + ' hosts');
    check(Object.keys(exp).length ? booksMax === 0 && expMax === 0 : true, 'books fold identically on every host and equal the hand-computed oracle', 'cross-host maxDiff=' + booksMax + 'c vs-oracle maxDiff=' + expMax + 'c' + (Object.keys(exp).length ? '' : ' (no POST op yet → books VACUOUS, tip-only)'));
    arm('CONVERGE', ok === HOSTS.length && tipsEq ? 'PASS' : (names.length < HOSTS.length ? 'INCONCLUSIVE' : 'FAIL'), { hosts_converged: ok, hosts: HOSTS.length, len: published.len, tip: short(published.tip), books_maxdiff_c: booksMax });
    return ok;
  }

  if (stage === 'converge') {
    var up = await converge('(stage=converge: controller copy, no network write)');
    srv.close();
    var v0 = (up === HOSTS.length && !INCONCLUSIVE.length && !fails) ? 'PASS' : (INCONCLUSIVE.length ? 'INCONCLUSIVE' : 'FAIL');
    console.log('\n§STAGE converge only — no record written, no publish; arms 1,3-6 NOT run');
    console.log((v0 === 'PASS' ? '🟢' : v0 === 'FAIL' ? '🔴' : '🟡') + ' W-MULTIHOST-SYNC-STAGE ' + v0 + ' hosts=' + up + '/' + HOSTS.length + ' ms=' + (Date.now() - T0));
    process.exit(v0 === 'PASS' ? 0 : v0 === 'FAIL' ? 1 : 2);
  }
  console.log('\n🟡 W-MULTIHOST-SYNC INCONCLUSIVE — full stage not implemented yet in this commit (arms 1,3-6 pending)');
  srv.close(); process.exit(2);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
