#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: TEAMWORK_FRAMEWORK.md §45.14 THE MATHS (measurement only). READ THE LOG after every run.
 * Input: the §STAR-POINT lines of witness_scale_star.js runs — `ref_n<T>.log` (no network, folder relay) and `sme_n<T>.log` (shaped links, GitHub stand-in), T = users.
 * Per metric, two fits over the measured points:  power law y = a·N^b (least squares on log N, log y)  and  quadratic y = c0 + c1·N + c2·N².
 * HOLD-OUT: both are refitted on N <= 50 and asked for N = 100; the model with the smaller error is used, that error is printed as the band, and a metric whose
 *   best hold-out error exceeds 25 % prints EXTRAPOLATION-UNTRUSTED instead of 500 / 1000 numbers.
 * CLIFFS: GitHub's PUBLISHED limits (sme100_net.js GH_LIMITS, cited there) against the fitted per-Visit request counts, for a STATED day (--visits-per-hour, --hours,
 *   --burst-s); the N where each limit is crossed is solved numerically. A curve says nothing past its own cliff.
 * ARMS: A1 NOTHING LOST · A2 SAME BOOKS (vs the no-network reference of the same N) · C2 the shaper ran (network ms per request vs the profile's round trip).
 * Run: node scripts/sme100_fit.js <dir> [--visits-per-hour 4] [--hours 8] [--burst-s 60] > <dir>/fit.log
 */
'use strict';
var fs = require('fs'), path = require('path'), NET = require('./sme100_net.js');
var argv = process.argv.slice(2), DIR = argv[0], A = {}; for (var i = 1; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
var VPH = Number(A['visits-per-hour'] || 4), HOURS = Number(A.hours || 8), BURST_S = Number(A['burst-s'] || 60);
function out(s) { console.log(s); }
function point(f) { var l = fs.readFileSync(f, 'utf8').split('\n').filter(function (x) { return /^§STAR-POINT /.test(x); })[0]; return l ? JSON.parse(l.replace(/^§STAR-POINT /, '')) : null; }
var pts = {}; fs.readdirSync(DIR).forEach(function (f) { var m = /^(ref|sme)_n(\d+)\.log$/.exec(f); if (!m) return; var p = point(path.join(DIR, f)); if (!p) { out('§FIT-MISSING ' + f + ' has no §STAR-POINT (run stopped?)'); return; } (pts[m[2]] = pts[m[2]] || {})[m[1]] = p; });
var Ns = Object.keys(pts).map(Number).sort(function (a, b) { return a - b; });
out('§FIT-HEADER §45.14 dir=' + DIR + ' users=' + Ns.join(',') + ' day: visits_per_hour=' + VPH + ' hours=' + HOURS + ' burst_s=' + BURST_S + ' (STATED ASSUMPTIONS) gh_limits=' + JSON.stringify(NET.GH_LIMITS));

// ── fits ──
function powFit(xs, ys) { var n = xs.length, lx = xs.map(Math.log), ly = ys.map(function (y) { return Math.log(Math.max(y, 1e-9)); }), mx = lx.reduce(function (a, b) { return a + b; }, 0) / n, my = ly.reduce(function (a, b) { return a + b; }, 0) / n, sxy = 0, sxx = 0;
  for (var i = 0; i < n; i++) { sxy += (lx[i] - mx) * (ly[i] - my); sxx += (lx[i] - mx) * (lx[i] - mx); } var b = sxx ? sxy / sxx : 0, a = Math.exp(my - b * mx); return { kind: 'power', a: a, b: b, f: function (x) { return a * Math.pow(x, b); } }; }
function quadFit(xs, ys) { var S = [0, 0, 0, 0, 0], T = [0, 0, 0]; xs.forEach(function (x, i) { var p = 1; for (var k = 0; k < 5; k++) { S[k] += p; if (k < 3) T[k] += p * ys[i]; p *= x; } });
  var M = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]];
  for (var c = 0; c < 3; c++) { var piv = c; for (var r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r; var tmp = M[c]; M[c] = M[piv]; M[piv] = tmp; if (!M[c][c]) return null;
    for (r = 0; r < 3; r++) if (r !== c) { var fct = M[r][c] / M[c][c]; for (var k2 = c; k2 < 4; k2++) M[r][k2] -= fct * M[c][k2]; } }
  var c0 = M[0][3] / M[0][0], c1 = M[1][3] / M[1][1], c2 = M[2][3] / M[2][2]; return { kind: 'quad', c0: c0, c1: c1, c2: c2, f: function (x) { return c0 + c1 * x + c2 * x * x; } }; }
function r2(fit, xs, ys) { var my = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length, ss = 0, sr = 0; ys.forEach(function (y, i) { ss += (y - my) * (y - my); sr += (y - fit.f(xs[i])) * (y - fit.f(xs[i])); }); return ss ? 1 - sr / ss : 1; }
function desc(f) { return f.kind === 'power' ? 'y=' + f.a.toPrecision(4) + '·N^' + f.b.toFixed(3) : 'y=' + f.c0.toPrecision(4) + (f.c1 >= 0 ? '+' : '') + f.c1.toPrecision(4) + '·N' + (f.c2 >= 0 ? '+' : '') + f.c2.toPrecision(4) + '·N²'; }
var MODELS = {};
function metric(name, unit, get) {
  var xs = [], ys = []; Ns.forEach(function (N) { var v = null; try { v = get(pts[N], N); } catch (e) {} if (v != null && isFinite(v)) { xs.push(N); ys.push(v); } });
  if (xs.length < 3) { out('§FIT ' + name + ' INCONCLUSIVE points=' + xs.length + ' (need 3+)'); return null; }
  var pw = powFit(xs, ys), qd = quadFit(xs, ys), hx = [], hy = []; xs.forEach(function (x, i) { if (x <= 50) { hx.push(x); hy.push(ys[i]); } });
  var hold = null, best = pw;
  if (xs.indexOf(100) >= 0 && hx.length >= 3) { var y100 = ys[xs.indexOf(100)], hp = powFit(hx, hy), hq = quadFit(hx, hy), ep = Math.abs(hp.f(100) - y100) / Math.max(Math.abs(y100), 1e-9), eq = hq ? Math.abs(hq.f(100) - y100) / Math.max(Math.abs(y100), 1e-9) : Infinity;
    hold = { measured_100: y100, power_pred: hp.f(100), power_err: ep, quad_pred: hq ? hq.f(100) : null, quad_err: eq }; best = eq < ep ? qd : pw; }
  var err = hold ? Math.min(hold.power_err, hold.quad_err) : null, cls = pw.b < 0.15 ? 'flat' : pw.b <= 1.15 ? 'linear' : pw.b <= 1.85 ? 'super-linear' : 'quadratic-or-worse';
  out('§FIT ' + name + ' [' + unit + '] class=' + cls + ' power ' + desc(pw) + ' R2=' + r2(pw, xs, ys).toFixed(4) + ' | quad ' + (qd ? desc(qd) + ' R2=' + r2(qd, xs, ys).toFixed(4) : 'n/a') + ' | measured ' + xs.map(function (x, i) { return x + ':' + +ys[i].toPrecision(4); }).join(' '));
  if (!hold) { out('§EXTRAP ' + name + ' INCONCLUSIVE no hold-out (needs N=100 and 3 points <= 50)'); MODELS[name] = { best: best, err: null, trusted: false }; return MODELS[name]; }
  out('§HOLDOUT ' + name + ' fit on N<=50 → predict 100: power ' + +hold.power_pred.toPrecision(4) + ' (err ' + (100 * hold.power_err).toFixed(1) + '%) quad ' + (hold.quad_pred == null ? 'n/a' : +hold.quad_pred.toPrecision(4) + ' (err ' + (100 * hold.quad_err).toFixed(1) + '%)') + ' measured ' + +hold.measured_100.toPrecision(4) + ' → model=' + best.kind);
  // both models are printed: a quadratic with a NEGATIVE N² term bends DOWN past the data (flatters), so when the two disagree by > 25 % at 1000 the range is the answer, not one number
  // a model that predicts a NEGATIVE count/time at 500 or 1000 is physically impossible there and is rejected for extrapolation (not a judgement call)
  if (qd && (qd.f(500) <= 0 || qd.f(1000) <= 0)) { out('§MODEL-REJECTED ' + name + ' quad predicts ' + +qd.f(500).toPrecision(3) + ' / ' + +qd.f(1000).toPrecision(3) + ' at 500 / 1000 (impossible: < 0) → power only'); if (best === qd) best = pw; qd = null; }
  if (pw.f(500) <= 0) { out('§MODEL-REJECTED ' + name + ' power predicts <= 0'); }
  var p1k = pw.f(1000), q1k = qd ? qd.f(1000) : null, disagree = q1k != null && Math.abs(p1k - q1k) / Math.max(Math.abs(p1k), Math.abs(q1k), 1e-9) > 0.25, bendsDown = qd && qd.c2 < 0;
  var trusted = err <= 0.25; MODELS[name] = { best: best, err: err, trusted: trusted, pw: pw, qd: qd, disagree: disagree };
  var both = ' [power: N=500 ' + +pw.f(500).toPrecision(3) + ', N=1000 ' + +p1k.toPrecision(3) + ' · quad: N=500 ' + (qd ? +qd.f(500).toPrecision(3) : 'n/a') + ', N=1000 ' + (q1k == null ? 'n/a' : +q1k.toPrecision(3)) + (bendsDown ? ' (quad N² term < 0: bends down past the data)' : '') + ']';
  out('§EXTRAP ' + name + (trusted ? (disagree ? ' RANGE N=1000 ' + +Math.min(p1k, q1k).toPrecision(3) + '…' + +Math.max(p1k, q1k).toPrecision(3) + ' ' + unit + ' (models disagree by > 25 %; hold-out band ±' + (100 * err).toFixed(0) + '% at 100)' : ' N=500 ' + +best.f(500).toPrecision(3) + ' N=1000 ' + +best.f(1000).toPrecision(3) + ' ' + unit + ' (model ' + best.kind + ', band ±' + (100 * err).toFixed(0) + '% as measured at 100; wider further out)') : ' EXTRAPOLATION-UNTRUSTED (best hold-out error ' + (100 * err).toFixed(0) + '% > 25%)') + both);
  return MODELS[name];
}
var avg = function (a) { a = a.filter(function (x) { return x != null && isFinite(x); }); return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; };
var sme = function (p) { if (!p.sme || p.sme.status !== 'PASS-RUN') throw 0; return p.sme; };

// ── arms ──
out('§ARMS-HEADER A1 nothing lost · A2 same books as the no-network reference · C2 shaper ran');
Ns.forEach(function (N) { var P = pts[N], s = P.sme, r = P.ref; if (!s || !r) { out('§A1 N=' + N + ' INCONCLUSIVE (missing ' + (!s ? 'sme' : 'ref') + ' run)'); return; }
  if (s.status !== 'PASS-RUN' || r.status !== 'PASS-RUN') { out('§A1 N=' + N + ' INCONCLUSIVE sme=' + s.status + ' ref=' + r.status + ' ' + (s.reason || r.reason || '')); return; }
  var v = s.visits || {}, lostOk = v.lost && v.lost.length === 0;   // per-device sent can read low after a retried push (the first attempt already sent); arrival is judged at head office below
  out('§A1 N=' + N + ' ' + (lostOk && s.hq_visit.foldable === r.hq_visit.foldable ? 'PASS' : 'FAIL') + ' generators ' + v.completed + '/' + v.devices + ' lost=' + JSON.stringify(v.lost) + ' sent/authored=' + v.sent + '/' + v.authored + ' failed_visits_retried=' + v.failed_visits + ' head office received ' + s.hq_visit.foldable + ' ops vs reference ' + r.hq_visit.foldable);
  var same = s.hq_visit.accepted === r.hq_visit.accepted && s.hq_visit.refused === r.hq_visit.refused && s.hq_replies.spec_digest.sha === r.hq_replies.spec_digest.sha && JSON.stringify(s.sample.map(function (z) { return [z.v2.accepted, z.v2.refused]; })) === JSON.stringify(r.sample.map(function (z) { return [z.v2.accepted, z.v2.refused]; }));
  out('§A2 N=' + N + ' ' + (same ? 'PASS' : 'FAIL') + ' head office accepted/refused ' + s.hq_visit.accepted + '/' + s.hq_visit.refused + ' vs ' + r.hq_visit.accepted + '/' + r.hq_visit.refused + ' · replies digest ' + s.hq_replies.spec_digest.sha + ' vs ' + r.hq_replies.spec_digest.sha + ' · sampled edges accepted/refused equal=' + same);
  var bp = v.by_profile || {}; out('§C2 N=' + N + ' network ms per request by profile (expected ≈ round trip): ' + Object.keys(bp).map(function (k) { return k + '=' + bp[k].net_ms_per_req.toFixed(1) + ' (rtt ' + NET.PROFILES[k].rtt + ')'; }).join(' ')); });

// ── metrics ──
var M1 = metric('edge.steady_visit_requests', 'requests', function (p) { return avg(sme(p).sample.map(function (z) { return z.v2.reqs; })); });
var M2 = metric('edge.push_visit_requests_p50', 'requests', function (p) { return sme(p).visits.push_reqs.p50; });
var M3 = metric('edge.roster_visit_requests_p50', 'requests', function (p) { return sme(p).visits.roster_reqs.p50; });
var M4 = metric('hq.visit_requests', 'requests', function (p) { return sme(p).hq_visit.reqs; });
var M5 = metric('hq.fold_ms_no_network', 'ms', function (p) { return p.ref.hq_visit.fold_ms; });
var M6 = metric('relay.requests_per_run', 'requests', function (p) { return sme(p).gh.total; });
var M7 = metric('relay.content_requests_per_run', 'requests', function (p) { return sme(p).gh.content; });
var M8 = metric('relay.burst_peak_minute_points', 'points/min', function (p) { return sme(p).gh.peak_minute.points; });
var M9 = metric('relay.burst_peak_minute_content', 'content req/min', function (p) { return sme(p).gh.peak_minute.content; });
var M10 = metric('edge.steady_visit_bytes_down', 'bytes', function (p) { return avg(sme(p).sample.map(function (z) { return z.v2.bytes_down; })); });
var M11 = metric('hq.enrol_ms_per_device', 'ms', function (p) { return p.ref.phases.enrol_ms / (p.ref.n + p.ref.m); });

// ── the feel: network time of a steady Visit per profile = requests(N) × round trip (+ bandwidth for the bytes) ──
if (M1 && M1.best) { ['lan', 'broadband', '4g', 'poor'].forEach(function (pf) { var P = NET.PROFILES[pf], row = [10, 30, 100, 500, 1000].map(function (N) { var rq = M1.best.f(N), by = M10 && M10.best ? M10.best.f(N) : 0; return N + ':' + ((rq * P.rtt + (P.down ? by * 8 / P.down * 1000 : 0)) / 1000).toFixed(1) + 's'; });
  out('§FEEL steady Visit network time on `' + pf + '` (rtt ' + P.rtt + ' ms; requests are sequential in ghPipe): ' + row.join(' ') + (M1.trusted ? '' : ' [beyond 100 UNTRUSTED]')); }); }

// ── cliffs: solve fitted curves against GitHub's published limits for the stated day ──
function solve(f, limit) { if (f(10) > limit) return '<=10'; var lo = 10, hi = 10; while (f(hi) <= limit && hi < 1e6) hi *= 2; if (hi >= 1e6) return '>1e6'; for (var k = 0; k < 60; k++) { var mid = (lo + hi) / 2; if (f(mid) <= limit) lo = mid; else hi = mid; } return String(Math.floor(lo)); }
var G = NET.GH_LIMITS;
if (M1 && M1.best && M2 && M2.best) {
  // a routine Visit costs between two bounds: QUIET (few branches moved since my last Visit: the harness's steady Visit #2, flat) and BUSY (every branch moved: ghPipe.list reads
  //   one tree per moved branch, comm_pipe.js:104-110, the same walk as the catch-up Visit). In a working day with everyone syncing every 15 min, BUSY is the realistic one.
  var quietV = function (N) { return M1.best.f(N); }, busyV = M3 && M3.pw ? function (N) { return M3.pw.f(N); } : quietV, reqVisit = busyV;
  out('§CLIFF-INPUT requests per routine Visit: QUIET ' + [10, 100, 1000].map(function (N) { return N + ':' + quietV(N).toFixed(0); }).join(' ') + ' · BUSY (power fit of the catch-up Visit) ' + [10, 100, 1000].map(function (N) { return N + ':' + busyV(N).toFixed(0); }).join(' ') + ' — cliffs below use BUSY; QUIET is given beside the request-count cliff');
  var cPerVisit = (function () { var a = []; Ns.forEach(function (N) { var s = pts[N].sme; if (s && s.gh && s.visits) { var visits = 2 * s.visits.devices + 4 * s.sample.length + 3; a.push(s.gh.content / visits); } }); return avg(a); })();
  out('§CLIFF-INPUT content-generating requests per Visit (measured, run total / Visits in the run) = ' + (cPerVisit && cPerVisit.toFixed(2)) + ' · a Visit writes its signed head every time (comm_store.js:919), so every Visit is a write');
  var shareHour = function (N) { return N * VPH * reqVisit(N); }, ownHour = function (N) { return VPH * reqVisit(N); };
  out('§CLIFF shared token, all requests/hour (' + G.per_hour_token + '): N <= ' + solve(shareHour, G.per_hour_token) + ' BUSY (QUIET: N <= ' + solve(function (N) { return N * VPH * quietV(N); }, G.per_hour_token) + ')  [N × ' + VPH + ' visits/h × requests per Visit(N)]');
  out('§CLIFF shared token, content requests/hour (' + G.content_per_hour + '): N <= ' + solve(function (N) { return N * VPH * cPerVisit; }, G.content_per_hour));
  out('§CLIFF shared token, 5 pm burst content requests/minute (' + G.content_per_min + ', everyone in ' + BURST_S + ' s): N <= ' + solve(function (N) { return N * cPerVisit * 60 / BURST_S; }, G.content_per_min));
  out('§CLIFF shared token, 5 pm burst points/minute (' + G.points_per_min + '): N <= ' + solve(function (N) { return N * (cPerVisit * 5 + (reqVisit(N) - cPerVisit)) * 60 / BURST_S; }, G.points_per_min));
  out('§CLIFF per-device token, own requests/hour (' + G.per_hour_token + '): N <= ' + solve(ownHour, G.per_hour_token) + '  [' + VPH + ' visits/h × requests per Visit(N); the list walk grows with N]');
  out('§CLIFF per-device token, own content requests/hour (' + G.content_per_hour + '): ' + (VPH * cPerVisit <= G.content_per_hour ? 'never (constant ' + (VPH * cPerVisit).toFixed(1) + '/h)' : 'always exceeded'));
  out('§CLIFF concurrent requests (' + G.concurrent + '): NOT MEASURED — the stand-in handles each request synchronously, so it cannot see concurrency (it reads 1 at every N: instrument-blind)');
  out('§NOTE secondary limits are per GitHub ACCOUNT: "per-device token" means one GitHub account per device; several tokens of ONE account share the shared-token cliffs.');
}
if (M5 && M5.best) out('§CLIFF head office fold of the day (no network), budget 3600 s: N <= ' + solve(function (N) { return M5.best.f(N) / 1000; }, 3600) + (M5.trusted ? '' : ' [curve UNTRUSTED beyond 100]'));
// ── A1 at scale, the maths of a Visit that restarts on any dropped request: P(ok) = (1-p)^k, k = requests per Visit, p = per-request loss ──
if (M3 && M3.pw) ['4g', 'poor'].forEach(function (pf) { var pl = NET.PROFILES[pf].loss; out('§DELIVERY `' + pf + '` (loss ' + (100 * pl) + '% per request, a Visit restarts on any drop): catch-up Visit succeeds ' + [10, 30, 100, 500, 1000].map(function (N) { var k = M3.pw.f(N); return N + ':' + (100 * Math.pow(1 - pl, k)).toFixed(0) + '%'; }).join(' ') + ' · with 2 retries PER REQUEST instead: ' + [100, 1000].map(function (N) { var k = M3.pw.f(N); return N + ':' + (100 * Math.pow(1 - Math.pow(pl, 3), k)).toFixed(2) + '%'; }).join(' ')); });
out('§FIT-DONE metrics=' + Object.keys(MODELS).length + ' trusted=' + Object.keys(MODELS).filter(function (k) { return MODELS[k].trusted; }).length);
