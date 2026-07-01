# ⚠ DO NOT REMOVE — Scope guard
# Scope: ERP runtime engine — WIRE the extracted abstract engine to the compiled rules,
#   then build the KERNEL that commits handler ops to the op-log. docs/ERP.md §0.12–§0.15.
#   Steps 0 (raw migration) + 1 (rule compiler) are DONE; the engine is EXTRACTED and the
#   hard parts (derivation, settlement, frozen-effects) are POC-proven against the oracle.
#   This session turns the POC into a data-driven evaluator + op-log kernel.
# READ THE LOG AFTER EVERY RUN. Exit code is not evidence. A claim with no §-log line
#   proving it is NOT done — flag it.
# EXTRACT, never invent. Diff against the iDempiere oracle (GardenWorld rows already in
#   ad_full.db = the oracle output; live iDempiere only for ambiguous cases). Refactor as
#   we go — expect iterations; do NOT over-design up front (§0.10 working principle).

---

# ERP — Runtime Engine Wiring + Op-Log Kernel (new session kickoff)

## Session startup (do these first)
1. Read `docs/ERP.md` **§0.12 → §0.15** (this is the canonical record of what was just
   PROVEN: the Sales→Ship POC, the two spines, edges+predicates/GUARD-vs-GENERATE, the
   generic matcher, the extracted engine + remaining debt). Then skim §0 → §0.11 for the
   full vision if context is fresh.
2. Read `prompts/ERP_KERNEL_BUILD.md` — the phase ladder. PB ✅ P2 ✅ done; this session
   is the substance of **P3 (kernel enforcement)** + **P3b (handler registry)**, now
   de-risked by the POC.
3. Read `CLAUDE.md` (PRIME RULE, log mandate, deploy discipline) + the ERP memory entry
   `project_erp_raw_migration`.
4. Read the engine + POCs you'll extend: `scripts/erp_engine.js`,
   `scripts/poc_sales_to_ship.js`, `scripts/poc_role_scoped_match.js`.

## Build state (2026-05-29)
- **Step 0 ✅** raw PG→SQLite — `scripts/migrate_pg_to_sqlite.js` → `build/erp/ad_full.db`
  (925 tables / 187133 rows). Gate `verify_migration.js` PASS (0 mismatches, byte-identical).
- **Step 1 ✅** Rule Compiler — `scripts/compile_rules.js` → `build/erp/erp_rules.db`
  (739 records: 335 sql, 52 policy, 58 workflow, 284 callout-stubs, 10 docevent-stubs +
  `handler_backlog`). Gate `verify_rules.js` PASS.
- **Engine ✅ extracted** — `scripts/erp_engine.js`: pure, DB-binding-agnostic (host injects
  `query`), runs under sql.js AND better-sqlite3. GUARD: `evalGuard`. GENERATE: `match`
  (generic Detail⋈Detail: partition + key + tolerance + access-scope + ordering policy +
  greedy), `VERBS`, `completeOrder`. Both POCs green on it.
- **Proven** (`build/erp/*.log`): derivation == oracle lines; settlement `M_MatchInv`/`M_MatchPO`
  **18/18**; frozen-effects; ambiguity disambiguated by ordering policy; role-scope narrows
  the matcher partition.
- **Artifacts are gitignored build outputs.** If `build/erp/*.db` are missing, regenerate:
  `docker start postgres && node scripts/migrate_pg_to_sqlite.js && node scripts/compile_rules.js`.
- **NOT deployed, push=live on bim-ootb — no deploy without explicit go.**

---

## TASK 1 — Compile→engine wiring (make the evaluator data-driven, docs/ERP.md §0.14–§0.15)

**Problem.** The matcher's `partition`/`order`/`allowOrgs` and `completeOrder`'s flags are
still passed as **JS opts in the harness**. They must be **LOADED from the compiled rules +
role tables**, so a cell's behavior comes from data, not code.

**Code-spec.** A thin `loadCell(db, docType, action)` (new `scripts/erp_runtime.js` or extend
the engine's host layer) that, given a cell, assembles the engine inputs FROM data:
- decision-table / fan-out flags ← `erp_rules` `DOCPOLICY:<docTypeId>` body JSON (Step 1).
- the ordering policy (FIFO/LIFO/by-amount) ← an **editable policy JSON** rule record
  (§0.5) — seed a `MATCHPOLICY` rule per settlement cell; default FIFO, log the default used.
- the access scope ← compile `ad_role` + `ad_role_orgaccess` (+ `ad_document_action_access`)
  from `ad_full.db` into the `allowOrgs` set + the may-run gate (§0.8). Add this as a Step-1
  extension (`event_type='Access'` rule records) OR read live — your call, but log the source.
- the validation guards at the cell ← `erp_rules` `Validation` records bound to the table.

**Test-spec / §-log acceptance** (diff vs oracle, no new invention):
- Re-run the Sales→Ship POC with EVERY opt sourced from data (no JS literals): derivation +
  `M_MatchInv`/`M_MatchPO` must STILL be 18/18 / exact. `§WIRE cell=(M_InOut,CO) policy=FIFO(src=erp_rules) orgs=<n>(src=ad_role) match=18/18`.
- Flip the `MATCHPOLICY` rule record FIFO→LIFO and show the pairing changes deterministically
  (the editable-rule loop, §0.6). `§WIRE policy-edit FIFO→LIFO pairsChanged=<n>`.
- A role with no org access → the cell is gated / partition empty. `§WIRE access role=<r> mayRun=N|orgs=0`.

---

## TASK 2 — The op-log kernel (handlers return ops; the kernel commits them, P3/P3b)

**Problem.** Handlers return `ops[]` but nothing APPLIES + COMMITS them. Build the seam.

**Code-spec** (`kernel_ops.js` is the shared module in bim-ootb; for this session prototype
in `scripts/` against sql.js, then plan the move):
- `Kernel.apply(db, ops)` — apply each op to the 5-table projection (PB `schema_5table.sql`)
  AND `commitOp` a RICH op to `kernel_ops` (payload + actor + before/after + lineage GUIDs —
  the §0.6 keystone; thin `{table,id,action}` ops are insufficient).
- **Dispatch flow at a cell** (the §18.6 ladder): state-machine legal? (P2 `manifest.wfmc`) →
  invariants/guards ok? (`evalGuard`) → `Handlers.run → ops[]` → `Kernel.apply`.
- **Violation guard:** a handler that mutates the DB outside its returned ops fails (handlers
  get no writable db; they only return ops). Prove it.
- **Replay:** rebuild the projection from `kernel_ops` alone (event-sourcing); frozen-effects
  must hold (replay old ops reproduces old effects regardless of current rules — §18.8).

**Test-spec / §-log acceptance** (extend the diff-oracle harness):
- `§KERNEL apply ops=<n> committed=<n> table=…` — ops land in the projection AND the log.
- `§KERNEL replay ops=<n> projection==committed HASH=<h>` — replay reproduces state.
- `§KERNEL violation handler=<h> out-of-log-write=BLOCKED`.
- Worked fixture `T_ORDER_SHIPMENT_ALLOCATION` (ERP_KERNEL_BUILD §P3b): complete order →
  shipment ops; allocate payment → ALLOCATE op; flip policy → new order differs, replay old
  unchanged. Diff the committed op-group vs the oracle rows.

---

## TASK 3 — (only when 1+2 green) Relocate the engine to bim-ootb (parked decision)
Move `erp_engine.js` (+ runtime/kernel) into `bim-ootb/viewer/` as the shared module both BIM
and ERP import (`kernel_ops.js` must NOT fork — BIM undo == ERP audit/sync). **push=live → NO
deploy without explicit go.** Until then, keep prototyping in `bim-compiler/scripts/` on sql.js.

---

## Boundaries / discipline
- **EXTRACT, never invent.** Every opt traces to a row in `erp_rules.db`/`ad_full.db` or the
  §18.10 Java oracle. Diff every claim against the GardenWorld oracle rows.
- **Editable rules over hardcode (§0.4–0.5).** The ordering policy, fan-out flags, access scope
  are policy JSON the SystemAdmin edits — every edit is a `kernel_ops` op (auditable, reversible).
- **The op-log must be RICH (§0.6 keystone).** Don't ship thin ops — they can't support
  replay/analytics/forecast/sync.
- **bim-ootb is push=live** — build + §-log-prove locally, NO deploy without explicit go.
- **Refactor as we go.** Let the clean separation keep emerging; expect iterations.
