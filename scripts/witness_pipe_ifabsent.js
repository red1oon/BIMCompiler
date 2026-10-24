#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_pipe_ifabsent.js — W-PIPE-IFABSENT. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.F.1 (the post office verb putIfAbsent).
 * Real pipes: memPipe, folderPipe (exclusive create; also raced by 6 real OS processes), httpPipe against a real local HTTP server that implements ?absent=1, and the gate wrapper.
 *
 * For each pipe: first create → true; second create of the same name → false and the bytes are untouched; another name → true; 20 concurrent creates of ONE name → exactly one true
 *                and the stored bytes are that winner's. CONTROL: 20 concurrent plain put()s all return true and the last one overwrites — so exclusivity is the verb's doing.
 * Gate: a stale token / an oversize object / the (cap+1)-th put THROW (never "false"), nothing is stored; the same write with the right token succeeds.
 * ghPipe: declares ifAbsent === false and putIfAbsent rejects (unsupported for now, GitHub CAS is a later step).
 * VACUOUS guard: the racing arms print INCONCLUSIVE if fewer than 2 creators actually ran concurrently.
 *
 * Run: node scripts/witness_pipe_ifabsent.js 2>&1 | tee build/comm/logs/witness_pipe_ifabsent.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), http = require('http'), cp = require('child_process');
var PIPE = require(path.join(__dirname, '..', 'build', 'comm', 'comm_pipe.js'));
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var enc = function (s) { return new TextEncoder().encode(s); }, dec = function (b) { return b ? new TextDecoder().decode(b) : null; };
var SP = 's/' + 'a'.repeat(64) + '/seq/00000000-0000-4000-8000-000000000001/';

async function suite(label, pipe) {
  console.log('\n── ' + label + ' ──');
  verdict(pipe.ifAbsent === true && typeof pipe.putIfAbsent === 'function', 'the pipe declares ifAbsent === true');
  var n1 = SP + '1000', a = await pipe.putIfAbsent(n1, enc('first')), b = await pipe.putIfAbsent(n1, enc('second'));
  console.log('   §IFABSENT ' + label + ' create=' + a + ' again=' + b + ' stored=' + dec(await pipe.get(n1)));
  verdict(a === true && b === false && dec(await pipe.get(n1)) === 'first', 'first create is true, second create of the same name is false and the stored bytes stay the first writer\'s');
  verdict((await pipe.putIfAbsent(SP + '1001', enc('x'))) === true && (await pipe.list(SP)).length === 2, 'a different name is created independently', 'names=' + (await pipe.list(SP)).length);
  // 20 concurrent creators of one name
  var name = SP + 'race', started = 0, maxLive = 0, live = 0;
  var res = await Promise.all(Array.from({ length: 20 }, function (_, i) { return (async function () { live++; started++; maxLive = Math.max(maxLive, live); await new Promise(function (r) { setTimeout(r, 1); });
    try { return await pipe.putIfAbsent(name, enc('writer-' + i)); } finally { live--; } })().then(function (r) { return { i: i, r: r }; }); }));
  var winners = res.filter(function (x) { return x.r === true; }), stored = dec(await pipe.get(name));
  console.log('   §IFABSENT ' + label + ' 20 concurrent creators (max live ' + maxLive + '): true=' + winners.length + ' stored=' + stored);
  if (maxLive < 2) inconclusive.push(label + ': no concurrency happened');
  verdict(winners.length === 1 && stored === 'writer-' + winners[0].i, 'of 20 concurrent creators of one name exactly ONE gets true, and the stored bytes are that writer\'s', 'winner=' + (winners[0] && winners[0].i));
  // CONTROL: plain put has no such guarantee
  var cname = SP + 'plain', pr = await Promise.all(Array.from({ length: 20 }, function (_, i) { return (async function () { await new Promise(function (r) { setTimeout(r, 1); }); return pipe.put(cname, enc('writer-' + i)); })(); }));
  var trues = pr.filter(function (x) { return x === true; }).length;
  verdict(trues === 20, 'CONTROL: 20 concurrent plain put()s ALL succeed and overwrite each other — the exclusivity above is the verb\'s doing, not an accident of timing', 'true=' + trues + ' stored=' + dec(await pipe.get(cname)));
}

(async function () {
  console.log('═══ W-PIPE-IFABSENT — the one extra post-office verb: create only if absent (TEAMWORK_FRAMEWORK §13.12.F.1) ═══');
  await suite('memPipe', PIPE.memPipe('mem'));

  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ifabs-'));
  try {
    await suite('folderPipe', PIPE.folderPipe(dir, 'folder'));
    // real OS processes racing on one file: O_EXCL is the guard
    var target = 's/' + 'b'.repeat(64) + '/seq/00000000-0000-4000-8000-000000000002/2000', code = "var P=require(" + JSON.stringify(path.join(__dirname, '..', 'build', 'comm', 'comm_pipe.js')) + ");var p=P.folderPipe(" + JSON.stringify(dir) + ",'f');var go=Date.now()+400;while(Date.now()<go){}p.putIfAbsent(" + JSON.stringify(target) + ",Buffer.from('proc-'+process.argv[1])).then(function(r){console.log(r?'WON':'LOST');});";
    var procs = await Promise.all(Array.from({ length: 6 }, function (_, i) { return new Promise(function (resolve) { cp.execFile(process.execPath, ['-e', code, String(i)], function (e, out) { resolve((out || '').trim() || 'ERR ' + (e && e.message)); }); }); }));
    var won = procs.filter(function (x) { return x === 'WON'; }).length, content = fs.readFileSync(path.join(dir, target)).toString();
    console.log('   §IFABSENT folderPipe 6 OS processes: ' + procs.join(',') + ' stored=' + content);
    verdict(won === 1 && procs.filter(function (x) { return x === 'LOST'; }).length === 5 && /^proc-\d$/.test(content), 'six real OS processes race to create one file: exactly ONE wins, five lose, the file holds the winner\'s bytes');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }

  // httpPipe against a real local server that implements PUT ?absent=1 (201 created / 412 exists)
  var store = new Map(), server = http.createServer(function (req, res) {
    var u = new URL(req.url, 'http://x'), name = decodeURIComponent(u.pathname.replace(/^\/f\//, ''));
    if (u.pathname === '/list') { res.end(JSON.stringify(Array.from(store.keys()).filter(function (k) { return k.indexOf(u.searchParams.get('prefix') || '') === 0; }))); return; }
    if (req.method === 'PUT') { var ch = []; req.on('data', function (c) { ch.push(c); }); req.on('end', function () {
        if (u.searchParams.get('absent') === '1' && store.has(name)) { res.statusCode = 412; res.end(); return; }
        var created = !store.has(name); store.set(name, Buffer.concat(ch)); res.statusCode = created ? 201 : 200; res.end(); }); return; }
    if (store.has(name)) { res.end(store.get(name)); return; } res.statusCode = 404; res.end(); });
  await new Promise(function (r) { server.listen(0, '127.0.0.1', r); });
  var base = 'http://127.0.0.1:' + server.address().port;
  try { await suite('httpPipe', PIPE.httpPipe(base, 'http'));
    var hp = PIPE.httpPipe(base, 'http2'), thrown = null; server.close(); try { await hp.putIfAbsent(SP + 'down', enc('x')); } catch (e) { thrown = e; }
    verdict(!!thrown, 'httpPipe: a dead server THROWS (it is never reported as "name taken")', thrown && String(thrown.message).slice(0, 60));
  } finally { try { server.close(); } catch (e) {} }

  // gated pipe: refusals throw, nothing is stored
  console.log('\n── gated pipe ──');
  var clock = 5000000, inner = PIPE.memPipe('inner'), gate = PIPE.gatedPipe(inner, { token: 'T1', max_object_bytes: 100, max_puts_per_hour: 5 }, { now: function () { return clock; } });
  var gw = gate.writer('T1'), KID = 'c'.repeat(16), nm = function (i) { return 's/' + 'd'.repeat(64) + '/seq/00000000-0000-4000-8000-000000000003/' + i; };
  var body = function (i, pad) { return enc(JSON.stringify({ n: i, device: KID, pad: 'x'.repeat(pad || 0) })); };
  verdict(gw.ifAbsent === true && (await gw.putIfAbsent(nm(1), body(1))) === true && (await gw.putIfAbsent(nm(1), body(1))) === false, 'CONTROL: through the gate with the right token, create → true, again → false');
  async function throws(f) { try { await f(); return null; } catch (e) { return String(e.message); } }
  var tBig = await throws(function () { return gw.putIfAbsent(nm(2), body(2, 200)); });
  verdict(tBig === 'gate-refused:oversize' && (await inner.get(nm(2))) === null, 'an oversize object THROWS gate-refused:oversize and nothing is stored', tBig);
  gate.rotate({ token: 'T2', max_object_bytes: 100, max_puts_per_hour: 5 });
  var tStale = await throws(function () { return gw.putIfAbsent(nm(3), body(3)); });
  verdict(tStale === 'gate-refused:stale-token' && (await inner.get(nm(3))) === null, 'a stale token THROWS gate-refused:stale-token and nothing is stored', tStale);
  var gw2 = gate.writer('T2'), ok3 = await gw2.putIfAbsent(nm(3), body(3));
  verdict(ok3 === true, 'CONTROL: the same create with the new token succeeds');
  var r1 = await gw2.putIfAbsent(nm(4), body(4)), r2 = await gw2.putIfAbsent(nm(5), body(5)), r3 = await gw2.putIfAbsent(nm(6), body(6)).catch(function (e) { return 'threw:' + e.message; });
  console.log('   §IFABSENT gate: cap 5 puts/hour; allowed puts so far this hour: 3 (create, repeat, new token) ; next three → ' + r1 + ', ' + r2 + ', ' + r3);
  verdict(r1 === true && r2 === true && r3 === 'threw:gate-refused:rate' && (await inner.get(nm(6))) === null, 'the (cap+1)-th create within the hour THROWS gate-refused:rate and stores nothing');
  clock += 3600001; verdict((await gw2.putIfAbsent(nm(6), body(6))) === true, 'CONTROL: an hour later the same create succeeds');

  // ghPipe: declared unsupported
  var gh = PIPE.ghPipe({ owner: 'o', repo: 'r', token: 't', self: 'e'.repeat(16), fetch: function () { throw new Error('no network in this witness'); } }), ghErr = await throws(function () { return gh.putIfAbsent('x', enc('y')); });
  verdict(gh.ifAbsent === false && /unsupported/.test(ghErr || ''), 'ghPipe declares ifAbsent === false and putIfAbsent rejects "unsupported" (GitHub compare-and-swap is a later step)', ghErr && ghErr.slice(0, 50));

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-PIPE-IFABSENT INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-PIPE-IFABSENT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
