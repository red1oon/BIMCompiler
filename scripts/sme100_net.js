#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: TEAMWORK_FRAMEWORK.md §45.14 SME-100 (MEASUREMENT ONLY: no product file is touched). READ THE LOG after every run.
 * The "buffers" that make one machine behave like N remote machines, and a local stand-in for the GitHub relay:
 *   PROFILES     per-device link: round trip ± jitter, up/down bandwidth, loss. STATED ASSUMPTIONS, printed in every log header — not measured facts.
 *   shapedFetch  wraps fetch for the REAL ghPipe: every HTTP request pays round trip + upload time, the response pays download time; a loss throws like a dropped connection.
 *   netPipe      the same shaping for the folder relay, per pipe call (list/get/put = one request each).
 *   stand-in     MOVED 2026-11-02 to bim-ootb common/tests/gh_standin.js (unchanged code; forked by witness_scale_star.js from the OOTB tree): the GitHub git-data endpoints ghPipe calls, ETag/304,
 *                x-ratelimit-remaining, and an ACCOUNT of every request per token and per minute against GitHub's PUBLISHED limits, read 2026-11-02 from
 *                https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api : primary 5,000 requests/hour per token (PAT); secondary: 100 concurrent,
 *                900 points/minute (GET 1 point, POST/PATCH/PUT/DELETE 5), 80 content-generating requests/minute, 500/hour. The stand-in COUNTS, it does not throttle:
 *                where a limit would bite is computed from the counts (the cliff), so a run never stalls on a guessed GitHub behaviour.
 */
'use strict';

var PROFILES = {
  none:      { rtt: 0,   jit: 0,   down: 0,      up: 0,      loss: 0 },
  lan:       { rtt: 1,   jit: 0,   down: 100e6,  up: 100e6,  loss: 0 },
  broadband: { rtt: 30,  jit: 10,  down: 20e6,   up: 5e6,    loss: 0 },
  '4g':      { rtt: 80,  jit: 40,  down: 10e6,   up: 2e6,    loss: 0.005 },
  poor:      { rtt: 300, jit: 150, down: 1e6,    up: 0.3e6,  loss: 0.02 }
};
var MIXED = ['lan', 'broadband', '4g', 'poor'];   // `mixed` = an equal seeded draw of these four (a stated assumption)
var GH_LIMITS = { per_hour_token: 5000, concurrent: 100, points_per_min: 900, content_per_min: 80, content_per_hour: 500, src: 'docs.github.com rate-limits-for-the-rest-api, read 2026-11-02' };

function rng(seed) { var a = (seed >>> 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function profileFor(name, idx, seed) { if (name !== 'mixed') return name; return MIXED[Math.floor(rng((seed || 1) * 7919 + idx * 104729)() * MIXED.length)]; }
function ledger(prof) { return { profile: prof, reqs: 0, net_ms: 0, bytes_up: 0, bytes_down: 0, lost: 0 }; }
function sleep(ms) { return ms > 0 ? new Promise(function (r) { setTimeout(r, ms); }) : Promise.resolve(); }
function upMs(p, r, bytes) { return Math.max(0, p.rtt + (p.jit ? (r() * 2 - 1) * p.jit : 0) + (p.up ? bytes * 8 / p.up * 1000 : 0)); }
function downMs(p, bytes) { return p.down ? bytes * 8 / p.down * 1000 : 0; }
function lossError() { var e = new TypeError('fetch failed (simulated loss, §45.14)'); e.simulatedLoss = true; return e; }

function shapedFetch(profName, seed, L, realFetch) {
  var p = PROFILES[profName], r = rng(seed); realFetch = realFetch || fetch;
  if (!p) throw new Error('unknown net profile ' + profName);
  return async function (url, init) {
    var body = init && init.body ? Buffer.byteLength(init.body) : 0, d = upMs(p, r, body); L.reqs++; L.bytes_up += body;
    if (p.loss && r() < p.loss) { await sleep(d); L.net_ms += d; L.lost++; throw lossError(); }
    await sleep(d); var res = await realFetch(url, init), buf = Buffer.from(await res.arrayBuffer()), dd = downMs(p, buf.length);
    await sleep(dd); L.net_ms += d + dd; L.bytes_down += buf.length;
    return new Response(res.status === 304 || res.status === 204 ? null : buf, { status: res.status, headers: res.headers });
  };
}
function netPipe(base, profName, seed, L) {
  var p = PROFILES[profName], r = rng(seed);
  async function hop(upBytes, fn, sizeOf) {
    var d = upMs(p, r, upBytes); L.reqs++; L.bytes_up += upBytes;
    if (p.loss && r() < p.loss) { await sleep(d); L.net_ms += d; L.lost++; throw lossError(); }
    await sleep(d); var v = await fn(), down = sizeOf(v), dd = downMs(p, down); await sleep(dd); L.net_ms += d + dd; L.bytes_down += down; return v;
  }
  return { id: base.id + '+net', stats: base.stats,
    put: function (n, b) { return hop(b.length + n.length, function () { return base.put(n, b); }, function () { return 0; }); },
    get: function (n) { return hop(n.length, function () { return base.get(n); }, function (v) { return v ? v.length : 0; }); },
    list: function (pf) { return hop(pf.length, function () { return base.list(pf); }, function (v) { return (v || []).reduce(function (z, x) { return z + x.length + 1; }, 0); }); } };
}

module.exports = { PROFILES: PROFILES, MIXED: MIXED, GH_LIMITS: GH_LIMITS, rng: rng, profileFor: profileFor, ledger: ledger, shapedFetch: shapedFetch, netPipe: netPipe };
