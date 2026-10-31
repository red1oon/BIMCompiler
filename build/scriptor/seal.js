// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// seal.js — AUDIENCE SEALING for the engine simulator (prompts/TEAMWORK_FRAMEWORK.md §29): AES-256-GCM per audience, shelf names from HMAC(audience key). SAMPLE key derivation:
// in the real system the keys are distributed by key epochs (POLICY op, §13.12 C-4); nothing here touches the real comm layer. Opts (oneKey, noSealAuth, plainName) are MUTANT switches only.
'use strict';
var crypto = require('crypto');
function canon(o) { if (o === null || typeof o !== 'object') return JSON.stringify(o); if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
  return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(o[k]); }).join(',') + '}'; }
function key(aud, opts) { return crypto.createHash('sha256').update('seal-key|' + (opts && opts.oneKey ? '*' : aud)).digest(); }
function ivOf(k, f) { return crypto.createHmac('sha256', k).update('iv|' + canon(f)).digest().slice(0, 12); }   // synthetic IV: unique per distinct content, equal content => equal blob (idempotent resend)
function seal(k, f, aud, opts) {
  var iv = ivOf(k, f), pt = Buffer.from(canon(f)), c = opts && opts.noSealAuth ? crypto.createCipheriv('aes-256-ctr', k, Buffer.concat([iv, Buffer.alloc(4)])) : crypto.createCipheriv('aes-256-gcm', k, iv);
  var ct = Buffer.concat([c.update(pt), c.final()]);
  return { seal: aud, iv: iv.toString('hex'), ct: ct.toString('hex'), tag: opts && opts.noSealAuth ? '' : c.getAuthTag().toString('hex') };
}
function open(k, b, opts) {                                              // throws when the bytes are not what the key sealed (wrong key or tampered)
  var iv = Buffer.from(b.iv, 'hex'), d = opts && opts.noSealAuth ? crypto.createDecipheriv('aes-256-ctr', k, Buffer.concat([iv, Buffer.alloc(4)])) : crypto.createDecipheriv('aes-256-gcm', k, iv);
  if (!(opts && opts.noSealAuth)) d.setAuthTag(Buffer.from(b.tag, 'hex'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(b.ct, 'hex')), d.final()]).toString());
}
function name(k, f, opts, h12) { return opts && opts.plainName ? h12(f.fields) : crypto.createHmac('sha256', k).update('name|' + canon({ key: f.key, fields: f.fields })).digest('hex').slice(0, 12); }
module.exports = { key: key, seal: seal, open: open, name: name };
