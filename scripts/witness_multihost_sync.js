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
  // ── ARM 1 · PUBLISH — this machine extends the chain by ONE real posting, signs the tip, publishes to GH + OCI dev,
  //    and every leg must fetch back BYTE-IDENTICAL to what was published (§MH.5 epoch model) ──
  console.log('\n§PUBLISH — extend epoch ' + local.len + ' → ' + (local.len + 1) + ', sign, publish, fetch back');
  var priv; try { priv = JSON.parse(fs.readFileSync(KEYF, 'utf8')); } catch (e) { priv = null; }
  if (!priv) { inconclusive('PUBLISH: controller private key ' + path.relative(HERE, KEYF) + ' not on this machine — cannot sign'); }
  var base = await replay(local);                                   // the previous epoch, verified on a zero-state db
  if (!base.ok) {   // controller copy no longer verifies under the current kernel/key → re-seal + re-sign its ops (logged, never silent)
    console.log('§PUBLISH base_reseal=true (controller copy did not verify: match=' + base.matchesAdvertised + ' sig=' + base.sigValid + ')');
  }
  var stale = { schema: local.schema, len: base.len, tip: base.computedTip, sig: base.ok ? local.sig : (priv ? await SIGN.signTip(priv, base.computedTip) : null),
    alg: 'ES256', signed_by: 'controller', epoch: base.len, published_utc: local.published_utc || null, ops: local.ops };
  var epoch = base.len + 1;
  base.K.commitOp(base.db, 'POST', { table: 'C_Invoice', id: 9000 + epoch, witness: 'W-MULTIHOST-SYNC', epoch: epoch,
    lines: [{ account_id: '101', role: 'AR', amtacctdr: 1200, amtacctcr: 0 }, { account_id: '400', role: 'Revenue', amtacctdr: 0, amtacctcr: 1200 }] },
    null, null, null, runUtcMs);
  await base.K.sealChain(base.db); var vNew = await base.K.verifyChain(base.db);
  var rows = base.db.exec('SELECT id, op_uuid, timestamp, op_type, parameters, input_guids, output_guid FROM kernel_ops ORDER BY id')[0].values
    .map(function (r) { return { seq: r[0], op_uuid: r[1], timestamp: r[2], op_type: r[3], parameters: r[4], input_guids: r[5], output_guid: r[6] }; });
  var sig = priv ? await SIGN.signTip(priv, vNew.tip) : null;
  var next = { schema: 'erp-replica/v1', len: vNew.len, tip: vNew.tip, sig: sig, alg: 'ES256', signed_by: 'controller', epoch: epoch, published_utc: runUtc, ops: rows };
  var selfOk = sig ? await SIGN.verifyTip(vNew.tip, sig) : false;
  check(vNew.ok && vNew.len === local.len + 1 && selfOk, 'new epoch sealed (len ' + local.len + '→' + vNew.len + ') and its tip verifies under the PINNED key', 'tip=' + short(vNew.tip) + ' prefix_of_previous=' + (rows.slice(0, local.len).every(function (o, i) { return o.op_uuid === local.ops[i].op_uuid; })));
  var bytes = JSON.stringify(next, null, 2);
  fs.writeFileSync(SNAP_FILE, bytes); publishedMd5 = md5(bytes); published = next; SERVED.stale = JSON.stringify(stale, null, 2);
  var pub = { here: null, GH: null, OCI: null }, ghCommit = null, ociEtag = null, ghPropS = null;

  // here — served from the file just written
  var pHere = await probe(H_HERE.base + '/relay_snapshot.json'); pub.here = pHere.md5 === publishedMd5;
  check(pub.here, 'here serves the published bytes', 'md5=' + publishedMd5.slice(0, 8));

  // GH — Contents API PUT on the branch (the owner's git push); immutable commit URL first, then the branch URL after CDN propagation
  var t1 = Date.now();
  try {
    var cur = JSON.parse(cp.execFileSync('gh', ['api', 'repos/' + GH_REPO + '/contents/' + GH_FILE + '?ref=' + GH_BRANCH], { encoding: 'utf8', timeout: 60000 }));
    var body = JSON.stringify({ message: 'mock: W-MULTIHOST-SYNC epoch ' + epoch + ' tip ' + short(vNew.tip) + ' (' + runUtc + ')', content: Buffer.from(bytes).toString('base64'), sha: cur.sha, branch: GH_BRANCH });
    var resp = JSON.parse(cp.execFileSync('gh', ['api', '-X', 'PUT', 'repos/' + GH_REPO + '/contents/' + GH_FILE, '--input', '-'], { encoding: 'utf8', input: body, timeout: 60000 }));
    ghCommit = resp.commit.sha;
    var pSha = await probe('https://raw.githubusercontent.com/' + GH_REPO + '/' + ghCommit + '/' + GH_FILE);
    console.log('§PUBLISH GH commit=' + ghCommit.slice(0, 10) + ' prev_blob=' + cur.sha.slice(0, 8) + ' new_blob=' + resp.content.sha.slice(0, 8) + ' put_ms=' + (Date.now() - t1) + ' commit_url http=' + pSha.status + ' md5_match=' + (pSha.md5 === publishedMd5));
    check(pSha.md5 === publishedMd5, 'GH stored the published bytes (immutable commit URL byte-identical)');
    var waitS = Number(process.env.MH_GH_WAIT_S || 330), t2 = Date.now(), pBr;
    while (true) {
      pBr = await probe(H_GH.base + '/' + GH_FILE);
      if (pBr.md5 === publishedMd5) { ghPropS = Math.round((Date.now() - t2) / 1000); break; }
      if ((Date.now() - t2) / 1000 > waitS) break;
      console.log('§PUBLISH GH branch_url poll t=' + Math.round((Date.now() - t2) / 1000) + 's http=' + pBr.status + ' md5=' + (pBr.md5 || '-').slice(0, 8) + ' (CDN max-age=300)');
      await new Promise(function (r) { setTimeout(r, 10000); });
    }
    pub.GH = pBr.md5 === publishedMd5;
    console.log('§PUBLISH GH branch_url converged=' + pub.GH + ' propagation_s=' + (ghPropS === null ? '>' + waitS : ghPropS));
    if (!pub.GH) inconclusive('PUBLISH: GH branch URL still serves the old bytes after ' + waitS + 's (CDN propagation cap) — stored bytes ARE correct at the commit URL');
    else check(true, 'GH branch URL serves the published bytes', 'after ' + ghPropS + 's');
  } catch (e) { inconclusive('PUBLISH: GH write failed — ' + String(e.message || e).split('\n')[0].slice(0, 160)); }

  // OCI dev — rule 1: GET+diff the target first; rule 7: --content-type; rule 3: one object, verify after each
  function ociPut(name, file) { return cp.execFileSync('oci', ['os', 'object', 'put', '--namespace', OCI_NS, '-bn', OCI_BUCKET, '--name', name, '--file', file, '--content-type', 'application/json', '--force'], { encoding: 'utf8', timeout: 120000 }); }
  var t3 = Date.now();
  try {
    var before = await probe(H_OCI.base + '/relay_snapshot.json');
    console.log('§PUBLISH OCI before http=' + before.status + ' md5=' + (before.md5 || '-').slice(0, 8) + ' last-modified=' + (before.lastModified || '-') + ' diff_vs_new=' + (before.md5 !== publishedMd5));
    ociPut(OCI_PREFIX + '/relay_snapshot.json', SNAP_FILE);
    var after = await probe(H_OCI.base + '/relay_snapshot.json'); ociEtag = after.etag;
    pub.OCI = after.md5 === publishedMd5 && /application\/json/.test(after.ctype || '');
    console.log('§PUBLISH OCI after http=' + after.status + ' md5_match=' + (after.md5 === publishedMd5) + ' content-type=' + after.ctype + ' etag=' + after.etag + ' last-modified=' + after.lastModified + ' put_ms=' + (Date.now() - t3));
    check(pub.OCI, 'OCI dev serves the published bytes with content-type application/json');
    var tmpd = fs.mkdtempSync(path.join(process.env.MH_TMP || os.tmpdir(), 'mh-')), staleF = path.join(tmpd, 'stale.json');
    fs.writeFileSync(staleF, SERVED.stale); ociPut(OCI_PREFIX + '/stale/relay_snapshot.json', staleF);
    var pSt = await probe(H_OCI.base + '/stale/relay_snapshot.json');
    console.log('§PUBLISH OCI stale-role object http=' + pSt.status + ' md5_match=' + (pSt.md5 === md5(SERVED.stale)) + ' (previous epoch ' + stale.len + ', for arm 6)');
  } catch (e) { pub.OCI = false; inconclusive('PUBLISH: OCI dev write failed (unauthenticated/unreachable) — ' + String(e.message || e).split('\n')[0].slice(0, 160)); }

  var nPub = Object.keys(pub).filter(function (k) { return pub[k]; }).length;
  arm('PUBLISH', nPub === HOSTS.length ? 'PASS' : 'INCONCLUSIVE', { hosts_published: nPub, hosts: HOSTS.length, epoch: epoch, len: next.len, tip: short(next.tip), gh_propagation_s: ghPropS === null ? 'cap' : ghPropS });

  await converge('(after PUBLISH)');

  console.log('\n🟡 W-MULTIHOST-SYNC INCONCLUSIVE — arms 3-6 not implemented yet in this commit');
  srv.close(); process.exit(2);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
