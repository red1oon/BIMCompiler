// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// sign_plan.js — sign a generated plan (prompts/TEAMWORK_FRAMEWORK.md §28). Same primitive as the comm layer (common/comm/comm_envelope.js): WebCrypto ECDSA P-256 / SHA-256, public keys as JWK.
// The signature covers canon(plan without sig/signer), so it is over CONTENT. PRIVATE KEYS ARE NEVER WRITTEN INSIDE THE REPO: the CLI writes where the caller says.
// CLI: node build/scriptor/sign_plan.js keygen <dir> · node build/scriptor/sign_plan.js sign <plan.js> <private.jwk> <public.jwk> <out.js>
// §38.10 (G-8) statements, the same key and scheme: stmt executors <map.json> <prev-map.json|none> <private.jwk> <public.jwk> <out.json>
//   · stmt plan-trust <keys.json> <prev-keys.json> <private.jwk> <public.jwk> <out.json> · check <stmt.json> [<trusted public.jwk> …]
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), subtle = require('crypto').webcrypto.subtle;
function canon(o) { if (o === null || typeof o !== 'object') return JSON.stringify(o); if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
  return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(o[k]); }).join(',') + '}'; }
function strip(plan) { var b = JSON.parse(JSON.stringify(plan)); delete b.sig; delete b.signer; return b; }
var ALG = { name: 'ECDSA', namedCurve: 'P-256' };
async function keygen() { var k = await subtle.generateKey(ALG, true, ['sign', 'verify']); return { publicJwk: await subtle.exportKey('jwk', k.publicKey), privateJwk: await subtle.exportKey('jwk', k.privateKey) }; }
async function sign(plan, privateJwk, publicJwk) {
  var key = await subtle.importKey('jwk', privateJwk, ALG, false, ['sign']), body = strip(plan);
  var sig = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, Buffer.from(canon(body)));
  return Object.assign(body, { sig: Buffer.from(sig).toString('hex'), signer: { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y } });
}
function planOf(src) { var g = {}; vm.runInNewContext(src, { window: g, globalThis: g }); return g.TEAM_PLAN; }
async function signFile(planFile, privFile, pubFile, outFile) {                 // keeps the generated file's header line and wrapper, replaces the plan object
  var src = fs.readFileSync(planFile, 'utf8'), signed = await sign(planOf(src), JSON.parse(fs.readFileSync(privFile, 'utf8')), JSON.parse(fs.readFileSync(pubFile, 'utf8')));
  fs.writeFileSync(outFile, src.replace(/g\.TEAM_PLAN = .*?; \}\)\(/s, 'g.TEAM_PLAN = ' + JSON.stringify(signed) + '; })(').replace(/Unsigned prototype\./, 'SIGNED (ECDSA P-256).'));
  return signed;
}
// ── §38.10 (G-8): owner statements — built, checked and signed offline. The shape rules and the prev hashes are the ENGINE's own (comm_roster.js), never re-implemented here.
function ros() { if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto; return require(path.join(__dirname, '..', 'comm', 'comm_roster.js')); }
var KINDS = { executors: { problem: 'executorsStmtProblem', body: async function (R, v, prev) { return { kind: 'executors', map: v, prev: await R.executorsHash(prev || {}) }; } },
              'plan-trust': { problem: 'planTrustStmtProblem', body: async function (R, v, prev) { return { kind: 'plan-trust', keys: v, prev: await R.planTrustHash(prev) }; } } };
function hexBytes(h) { return Buffer.from(String(h), 'hex'); }
// -> null (ok) | 'unknown-kind' | 'shape:<problem>' | 'bad-signature' | 'untrusted-signer'
async function checkStmt(st, trusted) {
  var K = st && KINDS[st.kind]; if (!K) return 'unknown-kind';
  var p = ros()[K.problem](st); if (p) return 'shape:' + p;
  var vOk = false; try { var key = await subtle.importKey('jwk', { kty: st.signer.kty, crv: st.signer.crv, x: st.signer.x, y: st.signer.y }, ALG, false, ['verify']);
    vOk = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, hexBytes(st.sig), Buffer.from(canon(strip(st)))); } catch (e) { vOk = false; } /*STMT:VERIFY*/
  if (!vOk) return 'bad-signature';
  if (trusted && trusted.length && !trusted.some(function (k) { return k.x === st.signer.x && k.y === st.signer.y && k.crv === st.signer.crv; })) return 'untrusted-signer';
  return null;
}
async function buildStmt(kind, value, prev, privateJwk, publicJwk) {
  var K = KINDS[kind]; if (!K) throw new Error('unknown kind ' + kind + ' (executors | plan-trust)');
  var st = await sign(await K.body(ros(), value, prev), privateJwk, publicJwk);
  var why = await checkStmt(st, [publicJwk]); /*STMT:SELFCHECK*/ if (why) throw new Error('the statement would be refused: ' + why);
  return st;
}
// a private key never enters a git work tree: walk up to the first existing directory and ask git
function insideGitTree(dir) { var d = path.resolve(dir); while (!fs.existsSync(d)) d = path.dirname(d);
  var r = require('child_process').spawnSync('git', ['-C', d, 'rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' }); return r.status === 0 && /true/.test(r.stdout); }

module.exports = { canon: canon, strip: strip, keygen: keygen, sign: sign, planOf: planOf, signFile: signFile, checkStmt: checkStmt, buildStmt: buildStmt, insideGitTree: insideGitTree };
if (require.main === module) (async function () {
  if (process.argv[2] === 'keygen' && insideGitTree(process.argv[3])) { console.log('§PLAN_KEYGEN REFUSED ' + process.argv[3] + ' is inside a git work tree — keep the private key OUT of the repo'); process.exitCode = 1; return; }
  if (process.argv[2] === 'keygen') { var k = await keygen(), d = process.argv[3]; fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'plan_signing_private.jwk'), JSON.stringify(k.privateJwk), { mode: 0o600 }); fs.writeFileSync(path.join(d, 'plan_signing_public.jwk'), JSON.stringify(k.publicJwk));
    console.log('§PLAN_KEYGEN wrote plan_signing_{private,public}.jwk in ' + d + ' (keep the private key OUT of the repo)'); }
  else if (process.argv[2] === 'sign') { var s = await signFile.apply(null, process.argv.slice(3)); console.log('§PLAN_SIGNED ' + process.argv[6] + ' signer.x=' + s.signer.x.slice(0, 10) + ' sig=' + s.sig.slice(0, 12)); }
  else if (process.argv[2] === 'stmt') {
    var kind = process.argv[3], val = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')), prev = process.argv[5] === 'none' ? null : JSON.parse(fs.readFileSync(process.argv[5], 'utf8'));
    try { var st = await buildStmt(kind, val, prev, JSON.parse(fs.readFileSync(process.argv[6], 'utf8')), JSON.parse(fs.readFileSync(process.argv[7], 'utf8')));
      fs.writeFileSync(process.argv[8], JSON.stringify(st)); console.log('§STMT_SIGNED kind=' + kind + ' prev=' + st.prev.slice(0, 12) + ' signer.x=' + st.signer.x.slice(0, 10) + ' -> ' + process.argv[8]); }
    catch (e) { console.log('§STMT_REFUSED ' + e.message + ' (nothing written)'); process.exitCode = 1; }
  }
  else if (process.argv[2] === 'check') {
    var st2 = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), tr = process.argv.slice(4).map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
    var w = await checkStmt(st2, tr); console.log(w ? '§STMT_CHECK REFUSED ' + w : '§STMT_CHECK ok kind=' + st2.kind + ' signer.x=' + st2.signer.x.slice(0, 10) + (tr.length ? ' trusted' : ' (no trusted key given: signature only)')); if (w) process.exitCode = 1;
  }
  else console.log('usage: keygen <dir> | sign <plan.js> <private.jwk> <public.jwk> <out.js> | stmt executors|plan-trust <value.json> <prev.json|none> <private.jwk> <public.jwk> <out.json> | check <stmt.json> [<trusted public.jwk> …]');
})();
