#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// poc_repost_idempotent.js — STUB for A-2 (docs/ERP_SOURCE_AUDIT_DELTAS.md).  NOT YET RUN.
//
// SPEC (the unproven invariant): reposting a Posted='Y' document DELETEs its prior Fact_Acct rows (archived to
//   T_Fact_Acct_History) BEFORE re-deriving — so a re-fold must NOT double-post. Into a closed period it refuses
//   (PeriodClosed); a non-repost re-attempt returns AlreadyPosted.
//     Doc.java:625  if (isPosted() && !isPeriodOpen())   // already posted - don't delete if period closed
//     Doc.java:633  deleteAcct();                          // else: archive + DELETE FROM Fact_Acct, then re-post
//     Doc.java:640  return "AlreadyPosted";
//     Doc.java:768-802 deleteAcct() = INSERT T_Fact_Acct_History ; UPDATE ; DELETE Fact_Acct
//   The FSM blocks re-completeIt (CO∉legal), but REPOST is a SEPARATE action (AD_Process 175 FactAcctReset,
//   already a registered W-PROC handler). post_resolver derives a fresh balanced set each call with no
//   idempotency assertion — a naive FactAcctReset→repost replay would APPEND a second journal, doubling balances.
//
// WITNESS TO BUILD (property test — no NEW oracle needed; uses the existing fact_acct anchor):
//   (1) derive a doc's posting (e.g. an invoice already proven by W-POST-HARDEN) twice through a
//       repost(delete-prior → re-derive) path.
//   (2) assert net Fact_Acct after repost == after first post, maxDiff=0c (the second derive REPLACES, not ADDS).
//   (3) §FALSIFIER: skip the delete-prior step → balances double (residual≠0), proving the delete is load-bearing.
//
// NON-INVENT: the doc + its real fact_acct are glassbowl_data.db client-11 rows; citations verified against the
//   checkout. Integer cents, no Date.now/Math.random. READ build/erp/poc_repost_idempotent.log — exit ≠ evidence.
// Implementing ERP_SOURCE_AUDIT_DELTAS.md §A-2 — Witness: W-DOC-REPOST-IDEMPOTENT (proposed)
'use strict';
console.log('§STUB poc_repost_idempotent.js — A-2 repost/FactAcctReset idempotency (delete-prior before re-derive). SPEC ONLY, not implemented.');
console.log('§STUB invariant=net-fact_acct-unchanged-after-repost cite=Doc.java:625/633/640/768 process=FactAcctReset(175)');
process.exit(0);
