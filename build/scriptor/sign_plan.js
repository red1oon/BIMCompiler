// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// sign_plan.js — sign a generated plan (prompts/TEAMWORK_FRAMEWORK.md §28). Same primitive as the comm layer (common/comm/comm_envelope.js): WebCrypto ECDSA P-256 / SHA-256, public keys as JWK.
// The signature covers canon(plan without sig/signer), so it is over CONTENT. PRIVATE KEYS ARE NEVER WRITTEN INSIDE THE REPO: the CLI writes where the caller says.
// CLI: node build/scriptor/sign_plan.js keygen <dir> · node build/scriptor/sign_plan.js sign <plan.js> <private.jwk> <public.jwk> <out.js>
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
module.exports = { canon: canon, strip: strip, keygen: keygen, sign: sign, planOf: planOf, signFile: signFile };
if (require.main === module) (async function () {
  if (process.argv[2] === 'keygen') { var k = await keygen(), d = process.argv[3]; fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'plan_signing_private.jwk'), JSON.stringify(k.privateJwk), { mode: 0o600 }); fs.writeFileSync(path.join(d, 'plan_signing_public.jwk'), JSON.stringify(k.publicJwk));
    console.log('§PLAN_KEYGEN wrote plan_signing_{private,public}.jwk in ' + d + ' (keep the private key OUT of the repo)'); }
  else if (process.argv[2] === 'sign') { var s = await signFile.apply(null, process.argv.slice(3)); console.log('§PLAN_SIGNED ' + process.argv[6] + ' signer.x=' + s.signer.x.slice(0, 10) + ' sig=' + s.sig.slice(0, 12)); }
  else console.log('usage: keygen <dir> | sign <plan.js> <private.jwk> <public.jwk> <out.js>');
})();
