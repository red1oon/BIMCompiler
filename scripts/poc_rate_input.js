#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (§I-J, W-RATE-INPUT). Read the log after every run (Log Mandate).
//   Scope: PROVE the "currency conversion RATE must be a recorded op INPUT, never a replay-time lookup"
//   determinism rule + its GUARD. This is DEFENSIVE infra — the POC is SINGLE-CURRENCY today; this witness
//   does NOT build multi-currency, it makes adding it nondeterministically later IMPOSSIBLE. Honour until DONE.
//
// poc_rate_input.js — the witness for ENGINE_FULL_ERP_ISSUES.md §I-J (rate-as-op-input determinism).
//
// ISSUE IT PROVES (names it, per CLAUDE.md "tests expose issues"):
//   §I-J — DistributedERP.md §7 / §9-E name "live FX/rate lookup" as THE canonical nondeterminism breaker:
//   if a multi-currency op converts using a rate read at REPLAY time, two replays diverge → replay-hash !=
//   live-hash → merge breaks. RULE (non-invent + §7): the conversion rate in force at the edge MUST be
//   captured as an op INPUT (frozen into the op), never looked up later — same discipline as UUID/timestamp/
//   scan. Until that is wired, multi-currency writes stay DISABLED.
//
// WHAT IT PROVES (each NAMED), mirroring poc_kernel.js's replay-hash == live-hash idiom:
//   C1  HONEST TODAY        — a single-currency op (no conversion) → replay-hash == live-hash (deterministic).
//   C2  THE RULE WORKS      — a conversion-bearing op WITH rate/rateDate/rateSource as recorded INPUTS →
//                             replay-hash == live-hash (rate-as-input is deterministic).
//   C3  WHY THE RULE EXISTS — the SAME conversion via a REPLAY-TIME LOOKUP (a stub "rate oracle" that
//                             returns a DIFFERENT value on the 2nd pass, simulating a live FX read) →
//                             replay-hash != live-hash → 🔴 the divergence the rule prevents.
//   C4  THE GUARD ENFORCES  — KernelOps.commitGroup REJECTS a conversion-bearing op MISSING its rate input
//                             (multi-currency-disabled-until-rate-as-input) → 🟢 rejected with reason, 0 rows.
//
// NON-INVENT: the guard under test is the REAL build/erp/kernel_ops.js assertRateAsInput, wired into the REAL
//   commitGroup write path. There is NO currency conversion in the kernel today; this witness supplies the
//   conversion params explicitly to exercise the guard — it never asks the kernel to fabricate a rate.
//
// DETERMINISM (§7): NO Date.now()/Math.random() in the deterministic path. ids/op_uuid are index-derived;
//   baseTs is explicit; the "nondeterminism" of C3 is a DETERMINISTIC stand-in — an oracle keyed to call
//   COUNT (1st call → rate R1, 2nd call → rate R2), so the divergence is reproducible, not random.
//
// Run: node scripts/poc_rate_input.js 2>&1 | tee build/erp/poc_rate_input.log   — then READ the log.
'use strict';
var path = require('path');
var initSqlJs = require('sql.js');
// §I-J money math via BigDecimal (feedback_numbers_via_bigdecimal): conversion is exact decimal, NEVER raw
// float. amtBase is integer cents (string-safe); rate is a recorded-input STRING. convCents = round-half-up.
var BigDecimal = require(path.join(__dirname, '..', 'build', 'erp', 'bigdecimal.js'));
function convCents(baseCents, rateStr) {
  return Number(BigDecimal.of(String(baseCents)).multiply(BigDecimal.of(String(rateStr)))
                .setScale(0, BigDecimal.RoundingMode.HALF_UP).toString());
}

// load the engine the BROWSER loads (UMD → window globals), via a window shim (poc_opgroup.js pattern).
global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;   // kernel_ops.js seals via bare `crypto.subtle`
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));   // window.KernelOps (the REAL kernel)
var KO = global.window.KernelOps;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

// projectionHash stand-in: in poc_kernel the projection IS the kernel_ops fold; here the op-log itself is the
// committed truth, so the deterministic "projection" we hash on replay is the canonical op-log content
// (op_type|parameters per id, in id order). A REPLAY rebuilds each op's parameters from its INPUTS; if any
// input is looked up live (C3), the rebuilt parameters differ → the hash differs. Pure, no wall-clock.
function logHash(db) {
  var r = db.exec('SELECT op_type, parameters FROM kernel_ops WHERE undone=0 ORDER BY id');
  if (!r.length) return 'EMPTY';
  var canon = r[0].values.map(function (v) { return v[0] + '|' + v[1]; }).join('\n');
  // tiny synchronous FNV-1a — deterministic, dependency-free (the hash VALUE is irrelevant; only == / != is).
  var h = 0x811c9dc5;
  for (var i = 0; i < canon.length; i++) { h ^= canon.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return ('00000000' + h.toString(16)).slice(-8);
}

// A conversion handler keyed by WHERE the rate comes from. This is the crux of §I-J:
//   - 'input'  : rate is taken from the op's recorded INPUTS (frozen) → identical on live + replay.
//   - 'lookup' : rate is read from a live oracle at build/replay time → the anti-pattern → diverges.
// convertOp(handler, amtBase) → the commitGroup op-shape ({op_type, op_uuid, params}).
function convertOp(uuid, amtBase, fxBlock) {
  // convertedAmt is computed from the rate that is FROZEN into params.fx (rate-as-input). The fx block
  // carries the recorded inputs the guard demands (rate/rateDate/rateSource).
  var converted = convCents(amtBase, fxBlock.rate);   // EXACT (BigDecimal) integer cents; deterministic given the input rate
  return {
    op_type: 'FX_CONVERT', op_uuid: uuid,
    params: { table: 'C_Invoice', op_type: 'FX_CONVERT', baseAmt: amtBase,
              convertedAmt: converted, fx: fxBlock }
  };
}

(async function () {
  console.log('═══ POC-RATE-INPUT — §I-J rate-as-op-input determinism (the FX nondeterminism trap) ═══');
  console.log('issue=ENGINE_FULL_ERP_ISSUES.md §I-J  guard=build/erp/kernel_ops.js assertRateAsInput  wired=commitGroup\n');
  var SQL = await initSqlJs();

  // sanity: the guard + write path are present.
  console.log('§RATE primitive assertRateAsInput=' + (typeof KO.assertRateAsInput === 'function' ? 'present' : 'ABSENT') +
              ' commitGroup=' + (typeof KO.commitGroup === 'function' ? 'present' : 'ABSENT'));

  // ── C1 · HONEST TODAY — a single-currency op (no conversion) is deterministic ────────────────────
  console.log('\nC1 — single-currency op (no conversion-bearing field) → replay-hash == live-hash (honest now)');
  var db1 = new SQL.Database(); KO.ensureTable(db1);
  var singleOp = { op_type: 'SET_STATUS', op_uuid: 'sc-1',
                   params: { table: 'C_Invoice', op_type: 'SET_STATUS', id: 'INV-1', to: 'CO' } };
  var r1 = await KO.commitGroup(db1, [singleOp], { gid: 'sc-grp', baseTs: 1000 });
  var live1 = logHash(db1);
  // REPLAY: a fresh db, re-commit the SAME op from the SAME recorded inputs (no lookup involved).
  var db1r = new SQL.Database(); KO.ensureTable(db1r);
  await KO.commitGroup(db1r, [singleOp], { gid: 'sc-grp', baseTs: 1000 });
  var replay1 = logHash(db1r);
  console.log('§RATE C1 committed=' + r1.committed + ' conversionBearing=' + KO.assertRateAsInput(singleOp.params).conversionBearing +
              ' live-hash=' + live1 + ' replay-hash=' + replay1 + ' equal=' + (live1 === replay1));
  verdict(r1.committed === true && live1 === replay1,
          'single-currency op deterministic (replay-hash == live-hash); guard inert (zero behaviour change)',
          'live=' + live1 + ' replay=' + replay1);
  db1.close(); db1r.close();

  // ── C2 · THE RULE WORKS — conversion WITH rate/rateDate/rateSource as INPUTS is deterministic ─────
  console.log('\nC2 — conversion-bearing op WITH rate-as-INPUT (rate/rateDate/rateSource frozen) → replay-hash == live-hash');
  var FX_INPUT = { rate: 0.92, rateDate: '2026-06-03', rateSource: 'ECB' };   // the rate FROZEN at the edge
  var convOp = convertOp('fx-1', 10000, FX_INPUT);                            // 100.00 base → 92.00 converted
  var db2 = new SQL.Database(); KO.ensureTable(db2);
  var r2 = await KO.commitGroup(db2, [convOp], { gid: 'fx-grp', baseTs: 2000 });
  var live2 = logHash(db2);
  // REPLAY rebuilds convertedAmt from the FROZEN input rate (params.fx.rate) — identical, no lookup.
  var db2r = new SQL.Database(); KO.ensureTable(db2r);
  var convOpReplay = convertOp('fx-1', 10000, FX_INPUT);   // same recorded inputs → same op
  await KO.commitGroup(db2r, [convOpReplay], { gid: 'fx-grp', baseTs: 2000 });
  var replay2 = logHash(db2r);
  var chk2 = KO.assertRateAsInput(convOp.params);
  console.log('§RATE C2 committed=' + r2.committed + ' guard.ok=' + chk2.ok + ' conversionBearing=' + chk2.conversionBearing +
              ' rate=' + chk2.rate + ' rateDate=' + chk2.rateDate + ' rateSource=' + chk2.rateSource +
              ' convertedAmt=' + convOp.params.convertedAmt + ' live-hash=' + live2 + ' replay-hash=' + replay2 + ' equal=' + (live2 === replay2));
  verdict(r2.committed === true && chk2.ok === true && chk2.conversionBearing === true && live2 === replay2,
          'rate-as-INPUT conversion is deterministic (replay-hash == live-hash); op committed (multi-currency would be safe)',
          'live=' + live2 + ' replay=' + replay2);
  db2.close(); db2r.close();

  // ── C3 · WHY THE RULE EXISTS — the SAME conversion via a REPLAY-TIME LOOKUP diverges ─────────────
  console.log('\nC3 — ANTI-PATTERN: same conversion via a LIVE rate-oracle lookup (rate NOT frozen) → replay-hash != live-hash');
  // a DETERMINISTIC stand-in for "live FX nondeterminism": the oracle returns a DIFFERENT rate per call
  // (keyed to call COUNT, not Math.random) — exactly the §9-E "rate read at replay time" hazard.
  var oracleCalls = 0;
  var RATE_ORACLE = [0.92, 0.95];   // 1st read → 0.92 (live), 2nd read → 0.95 (replay) — the divergence
  function liveRateLookup() { var v = RATE_ORACLE[Math.min(oracleCalls, RATE_ORACLE.length - 1)]; oracleCalls++; return v; }
  // the WRONG way: convertedAmt is computed from a LOOKUP at commit/replay time, and the rate is NOT recorded.
  function convertViaLookup(uuid, amtBase) {
    var rate = liveRateLookup();                       // ← the trap: read live, do NOT freeze it
    return { op_type: 'FX_CONVERT', op_uuid: uuid,
             params: { table: 'C_Invoice', op_type: 'FX_CONVERT', baseAmt: amtBase,
                       convertedAmt: convCents(amtBase, rate) } };   // EXACT (BigDecimal); divergence is the RATE, not float — no fx block, no recorded rate
  }
  var db3 = new SQL.Database(); KO.ensureTable(db3);
  // NOTE: this op is conversion-bearing (convertedAmt present) but carries NO rate input — to isolate the
  // DETERMINISM divergence (C3) from the GUARD rejection (C4), C3 commits via the raw commitOp (no guard),
  // demonstrating the hazard the guard exists to forbid. C4 then shows commitGroup REFUSES this very shape.
  var lk1 = convertViaLookup('lk-1', 10000);
  KO.commitOp(db3, lk1.op_type, lk1.params, null, null, lk1.op_uuid);
  var live3 = logHash(db3);
  // REPLAY: rebuild the op by RE-RUNNING the lookup (rate was never frozen) — oracle now returns 0.95.
  var db3r = new SQL.Database(); KO.ensureTable(db3r);
  var lk1r = convertViaLookup('lk-1', 10000);   // 2nd oracle call → DIFFERENT rate → DIFFERENT convertedAmt
  KO.commitOp(db3r, lk1r.op_type, lk1r.params, null, null, lk1r.op_uuid);
  var replay3 = logHash(db3r);
  console.log('§RATE C3 live-convertedAmt=' + lk1.params.convertedAmt + ' replay-convertedAmt=' + lk1r.params.convertedAmt +
              ' oracleRates=' + JSON.stringify(RATE_ORACLE) + ' live-hash=' + live3 + ' replay-hash=' + replay3 + ' equal=' + (live3 === replay3));
  verdict(live3 !== replay3,
          '🔴 EXPECTED DIVERGENCE: replay-time rate LOOKUP → replay-hash != live-hash (this is what §I-J forbids)',
          'live=' + live3 + ' replay=' + replay3 + ' (verdict 🟢 = divergence correctly demonstrated)');
  db3.close(); db3r.close();

  // ── C4 · THE GUARD ENFORCES — commitGroup REJECTS a conversion-bearing op missing its rate input ──
  console.log('\nC4 — GUARD: commitGroup REJECTS a conversion-bearing op MISSING rate-as-input (multi-currency disabled)');
  var db4 = new SQL.Database(); KO.ensureTable(db4);
  // the exact C3 lookup-shape (convertedAmt present, NO rate/rateDate/rateSource) presented to the WRITE PATH.
  var missingRateOp = { op_type: 'FX_CONVERT', op_uuid: 'bad-1',
                        params: { table: 'C_Invoice', op_type: 'FX_CONVERT', baseAmt: 10000, convertedAmt: 9200 } };
  var guardChk = KO.assertRateAsInput(missingRateOp.params);
  var r4 = await KO.commitGroup(db4, [missingRateOp], { gid: 'bad-grp', baseTs: 4000 });
  var rows4 = db4.exec('SELECT COUNT(*) FROM kernel_ops'); var n4 = rows4.length ? Number(rows4[0].values[0][0]) : 0;
  console.log('§RATE C4 guard.ok=' + guardChk.ok + ' conversionBearing=' + guardChk.conversionBearing +
              ' committed=' + r4.committed + ' rows=' + n4 + ' reason=' + r4.reason);
  verdict(guardChk.ok === false && r4.committed === false && n4 === 0 && /rate input/.test(r4.reason || ''),
          '🟢 conversion-bearing op MISSING rate input is REJECTED (0 rows; multi-currency stays disabled until rate-as-input)',
          'committed=' + r4.committed + ' rows=' + n4 + ' reason=' + r4.reason);
  // CONTROL: a single-currency op through the SAME path still commits (guard does not over-reach).
  var ctlOp = { op_type: 'SET_STATUS', op_uuid: 'ctl-1', params: { table: 'C_Invoice', op_type: 'SET_STATUS', id: 'INV-9', to: 'CO' } };
  var rCtl = await KO.commitGroup(db4, [ctlOp], { gid: 'ctl-grp', baseTs: 4100 });
  verdict(rCtl.committed === true, 'CONTROL: single-currency op through the guarded path still commits (no over-reach)',
          'committed=' + rCtl.committed);
  db4.close();

  console.log('\n§RATE ' + (fails ? 'FAIL — ' + fails + ' checks red: §I-J NOT proven. '
    : 'PASS — §I-J rate-as-op-input determinism holds: single-currency is honest (C1), a conversion with '
    + 'rate/rateDate/rateSource as recorded INPUTS replays identically (C2), the SAME conversion via a live '
    + 'rate LOOKUP diverges replay!=live (C3 — the hazard), and the guard REJECTS a conversion-bearing op '
    + 'missing its rate input (C4 — multi-currency disabled until rate-as-input). Rate is frozen, never looked up.'));
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(2); });
