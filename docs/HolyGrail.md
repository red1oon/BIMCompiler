/**
 * BIM OOTB / ERP OOTB — The Holy Grail: editable business rules, live.
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */

# The Holy Grail — Editable Business Rules, Live
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **See also:** the one-page evaluator companion — **[Migrate & Compare (ERP)](MigrateComparisonPaper.md)** (legacy ERP vs the WASM event-sourced browser); the *back-up-the-recipe* §below is linked from its backup figure.
>
> **For a retail owner:** the plain-English, animated one-pager — **[Two messages a day → books to the penny](RetailScaleStory.html)** — proves the same engine at **10,000 tills** (benchmark `W-POS-WAN-SCALE`, runnable).

> *A first-person note from the author. The technical claims below are grounded in the
> dated, witnessed sections of ERP.md; this page is the reasoning that ties
> them to a quest I have carried for a long time.*

## Who is writing this, and why it is personal

I am Redhuan D. Oon. I was the founding leader of **ADempiere**, and in that role I
materially ushered in the birth of **iDempiere** — the community, the people, and the
direction that made it possible. I then left that path to pursue this one.

I did not leave because the open-source ERP idea was wrong. I left because the thing I
most wanted from it — **rules you can edit while the system runs, safely, without a
build** — was structurally out of reach inside the architecture we had built. For two
years I tried to reach it from the inside: I attempted, with Spring and plain Java, to
extract even the *core* of the model — `PO.java`, `Info.java` — into something light
enough to re-host and re-open. It did not converge. This document is the account of why
it could not, and why a browser-and-PWA paradigm shift reached it from the outside —
something that genuinely surprised me, the person who had spent the most time failing at
it the other way.

## What the Holy Grail actually is

Not "an ERP in a browser." That is a means. The grail is one specific capability:

> **Edit a business rule, and watch the affected records change on the map — live,
> reversibly, with no recompilation and no server.**

In this project that is named directly: the *parked endgame* in
ERP.md "Why this is more than a port" — *"let you **edit a rule and watch the
affected records flip on that map** (the diff-oracle in the browser, §2d-3)"* — and in
GLASSBOWL_DOSSIER.md as *the final big picture*: Glassbowl stops
being a map of the engine and becomes **the console you run the engine from**.

It is earmarked precisely, not vaguely:

| Earmark | What it fixes |
|---|---|
| **ERP.md §0.4** — *Editable business rules, the SystemAdmin role* | names this as **the differentiator**, not a feature |
| **ERP.md §0.5** — *the rules engine = a per-cell decision table* | the shape: a table per `(DocType, status, action)` cell — **not** Rete / DSL / inference |
| **ERP.md §0.9** — *the rule mechanism, JSR-223-native* | the host language **is** JavaScript, so the rule language = the runtime language; the scripting-engine abstraction is *unnecessary* |
| **ERP.md §0.10** — *the Rule Compiler* | the rules are already extracted to data: `erp_rules.db`, **746 records**, diff-verified |
| **ERP.md §2d-3 / GLASSBOWL_DOSSIER.md** | the live edit-and-reflow loop — the grail itself |

## Why two years of extracting `PO.java` was the wrong target

This is the part I most want a future reader — especially one still inside a code-engine
ERP — to understand, because it cost me the most to learn.

`PO.java` is **not extractable**, and it never was. Not because it is hard, but because
it is the **wrong thing to extract**. It is an *imperative* engine. Pull on it and the
entire transitive graph follows: the model registry, the OSGi service wiring, the
transaction manager, the callout chain, the `MTable`/`MColumn` reflection. You are
trying to lift the engine *with its whole gravity well attached*. Two years is simply
what that costs — and it does not converge, however much effort you add.

The paradigm shift is not "do the extraction better in a PWA." It is to **stop
extracting the engine, and extract what the engine operates on**:

- The Application Dictionary rows and the rule records were **already data** —
  `AD_Rule`, `AD_Val_Rule`. That is iDempiere's own design (ERP.md §0.9); half
  the "rules engine" already exists as data. We *compile* it, we do not reinvent it.
- The *remainder* — the deterministic part that actually runs a document — is small.
  Re-hosted as a **~150-line kernel** in the browser's native JavaScript, `PO.java`'s job
  (persist + lifecycle) becomes `apply(op)` plus the op-log fold; `Info.java`'s job (the
  windowed UI) becomes the keyed-overlay Application Dictionary (the UI-overlay
  governance model — every UI concern a keyed layer over a tagged element).

The bloat was not ported. It was **deleted by being re-based.** That is why the shift
worked from the outside when extraction failed from the inside.

### So — are we free of `PO.java`?

Two senses, and they differ. **From *running* it: yes, completely.** Nothing in the browser
instantiates or extends `PO.java`; each of its jobs is re-based onto data or the log — generic
save → `apply(op)` + the 5-table fold (no `UPDATE`-in-place exists at all); change-tracking →
`kernel_ops` before/after + lineage; `beforeSave`/mandatory validation → rules-as-data
(`AD_Val_Rule`); `get_ID` → edge-minted UUID recorded as input (§0.21); model-validator firing →
the named-handler registry; `trx` → the op-group, the document-event as the atomic unit (§18.8).
Witnessed: replay reproduces the O2C/P2P oracle to the cent with **zero iDempiere code executing.**

The freedom came **by never extracting it.** Carrying `PO.java` somewhere lighter never converges
— you drag its whole gravity well. But `PO.java`'s defining property, *generic and
metadata-driven*, is precisely what makes it deletable: anything fully driven by metadata is
replaceable by *reading the metadata and folding the log*. iDempiere could not take that step
because that core was welded to the JVM / OSGi / `trx` / side-effects; remove the weld and
`PO.java` has nothing left to do.

**From what its subclasses *knew*: deliberately not — and that is correct.** The `M*.*It()`
methods remain the **oracle** we verify against, per cell, so "extract" never slides into "guess."
The day that consultation ends is the day every cell is extracted and verified — the §0.17 breadth
campaign, in flight (O2C/P2P done; GL still dataless; the DocAction corpus being abstracted now).
Free of *running* it; finishing the extraction of what it taught the models is the campaign, not a
new idea.

## Why it is a grail — first to *assemble*, not first to *invent*

**Stated precisely, because the loose version is not true and this project does not need it.**
None of the three ingredients below is novel on its own. This project's own prior-art review says so
outright — `docs/LocalFirstPriorArt.md:69`: SQLSync is our nearest neighbour on the determinism lever,
LiveStore on the data layer, and *"together they show we hold **no technique novelty** on either."*
The same review records what we lack that SQLSync has: **a multi-writer total order** (`:101`).

The claim that survives contact with an engineer is narrower and stronger: **nobody has assembled these
three, at once, under a real ERP dictionary.** Three conditions have to hold *simultaneously*:

1. **The engine is data.** A rule is a row you read, not Java you recompile.
2. **The host language is the rule language.** Browser JavaScript *is* the runtime, so editing a rule
   edits the running system — no JSR-223, no Drools workbench, no scripting bridge (ERP.md §0.9).
3. **The op-log makes editing safe.** Change-as-op, replay, dry-run, undo — effects are frozen and
   replayable, so a rule edit cannot corrupt history (ERP.md §0.4, §0.18).

iDempiere has (1) half-done and lacks (2) and (3): its rules are half-data, half-welded into `M*` Java
side effects, so they cannot be made fully editable-at-runtime without the JVM/OSGi/workbench that
constitute the weight. Drools has a rule engine but no op-log safety and no engine-as-data. Local-first
engines (SQLSync, PowerSync, ElectricSQL, cr-sqlite) have (3) and sometimes (1), but none carries an
ERP dictionary — no `AD_Field`, no `C_DocType` FSM, no `Doc_*` posting fold.

**One thing here is genuinely ours, not assembled:** tamper-evidence. The prior-art review notes it is
*nobody's* default; the hash-chained, signed op-log (W-CHAIN/W-SIGN) is the distinctive add, and SQLSync
in particular has none.

## External check — has the field caught up? (2026-08-05)

A periodic gut-check, not a claim about this project's own coverage: local-first/event-log architecture is
now recognized ground, not a lone bet. 2026 literature settled on "which sync-engine boundary — rows,
doc-ops, or event logs" (not "CRDT or OT") — this project's signed op-log sits squarely in the event-log
bucket, alongside maturing tooling elsewhere (Automerge 3.0, PowerSync, ElectricSQL). Separately,
OPFS-backed SQLite-WASM moved from experimental to production-grade ("near-native speed" on multi-gigabyte
client DBs) — the safe migration path for this project's own known ceiling (`sql.js` loads the whole DB
into WASM linear memory, no paging; measured ≈440 MB resident on a 122k-element building). Neither closes
a gap here — both confirm the underlying bet, no server and browser-resident truth, is now
mainstream-recognized rather than still fringe.

## The honest status — the gesture is real on two rules, not yet on the dictionary

Corrected 2026-09-03, because the previous text said the live edit loop was still "remaining" and that
is no longer accurate — and the correction cuts **both** ways.

**Reached, and shipping:** `erp/rule_fold.js` is on `origin/main` and live. It is the gesture, end to
end: edit one rule → K records re-fold → signed on the W-CHAIN/W-SIGN op-log → reversible, scoped to the
logged-in tenant (read from `window.__idmpClient`, never hardcoded). It carries **two** rules through one
registry:
- **L2 `premium`** — a *classification* guard: a product is premium iff `PriceStd ≥ T`.
- **L1 `maycomplete`** — a *lifecycle* guard on the `Complete (CO)` transition: an order may complete
  without approval iff `GrandTotal ≤ T`. Editing `T` is lifecycle-as-data — the most valuable kind of
  rule a user edits, and the one iDempiere welds into `M*` Java.

**Not reached, stated plainly:** the gesture is proven on **two hand-authored rules, not on the AD
dictionary generally**. The general witness — *edit any `AD_Val_Rule` / `AD_Field` row → K records
re-fold* — **does not exist**: a search of `scripts/` for a `RULE-EDIT` witness returns zero files
(verified 2026-09-03). Two earlier notes disagreed about this, one claiming the loop closed and one
claiming it absent. Both were half-right, and the line above is the reconciliation.

**Also reached since the previous text was written:** the write path is no longer dry-run. `commitCrud`
is the single signed chokepoint every CRUD_CREATE/UPDATE/DELETE funnels through, with the record-level
access gate wired into it (bim-ootb #1499).

## Roadmap check — the write-seam, as of 2026-09-03

The grail is the last rung of the write-loop, not a separate project. Update this table each time a
rung is climbed; the date above is the date it was last re-measured, not the date it was written.

| Rung | What it is | State (2026-09-03) |
|---|---|---|
| **R0** | Rules extracted to data (`build/erp/erp_rules.db`, `rules` table = **746 rows**, verified) | **done — witnessed** |
| **R1** | The engine renders itself from that data, read-only (Glassbowl) | **done — live** |
| **E2** | The write *seam* — CRUD ring + DocAction state machine as keyed data | **done — no longer dry-run** |
| **E3** | The seam live — `commitOp`/`sealChain`, `verifyChain` after each, projection re-folds | **done** — `commitCrud` is the one signed chokepoint |
| **E4** | Owner-gate + CAS + record-level org/client scope on the write path | **done** — bim-ootb #1499 |
| **§RULE-EDIT (specific)** | Edit a rule row → K records re-fold, signed, reversible — on **two** registered rules | **done — live** (`erp/rule_fold.js`) |
| **§RULE-EDIT (general)** | The same gesture over any **AD dictionary** row | **the last rung — not built** |

**What the last rung actually requires**, now that everything under it stands: the AD-driven surfaces
are already interpreted live — `AD_Val_Rule` filters the real FK pickers, `AD_Field` display/readonly/
mandatory logic evaluates on the real forms, the `C_DocType` FSM decides legality. What is missing is
the *edit-and-refold* path over those rows, which is the same loop `rule_fold.js` already runs over its
own two. That is a generalisation, not a new mechanism.

## Measure it yourself — every claim above, and the command that checks it

Written for the iDempiere team. Nothing here asks you to take a number on trust. Engine and witnesses
live in `bim-compiler`; the deployed app is `bim-ootb`. All figures re-measured **2026-09-03**.

| Claim | How you check it | What it printed for us |
|---|---|---|
| Rules are data, 746 of them | `sqlite3 build/erp/erp_rules.db "select count(*) from rules"` | `746` |
| The equivalence ledger is real and re-runnable | `bash build/erp/run_bundle.sh` | **46/46 PASS, 0 FAIL** |
| `C_DocType` FSM is a real dispatch table, not a CO-only stub | `bash build/erp/run_witness.sh scripts/poc_docfsm.js` | `§DOCTYPE_FSM_COVERAGE doctypes=52 actions=14 statuses=12`; reaches the reversal family, rejects Complete-from-Closed |
| …and it agrees with the real Java, per table | the 10 per-model witnesses: `poc_morder_fsm.js`, `poc_minout_fsm.js`, `poc_minvoice_fsm.js`, `poc_mpayment_fsm.js`, `poc_minventory_family_fsm.js`, `poc_mjournal_fsm.js`, `poc_mallochdr_fsm.js`, `poc_mcash_fsm.js`, `poc_mbankstatement_fsm.js`, `poc_generic_tail_fsm.js` | **1,387 fixtures `diff=0`** in total, against a **runtime parse** of your own `DocumentEngine.getValidActions` + each `M*.java` (`scripts/docfsm_oracle.js`) — not a hand-authored expectation table |
| `AD_Field` logic evaluates on the real form | from `bim-ootb/erp`: `node tests/poc_parity_fieldset_live.js` | 30/30 PASS; live `withLogic` = 28 / 28 / 21 / 61 / 0 on tabs 186/257/263/330/349 |
| The form shows the AD tab, not a curated subset | same witness | c_order **8→56** fields, m_inout 7→53, c_invoice 7→47, c_payment **4→78**, c_allocationline 4→13 |
| `AD_Val_Rule` filters the real pickers | from `bim-ootb/erp`: `node tests/poc_parity_valrule_live.js` | 23/23 PASS; `c_doctype_id` **52→3**, `c_bpartner_id` **113→42**, `c_order_id` **44→2** |
| Every witness judges the code that ships | `bash build/erp/run_witness.sh scripts/check_erp_twins.js` | 64 pairs, 39 identical, **0 unreviewed** |
| Peer merge cost | `bash build/erp/run_witness.sh scripts/poc_bench_peer_sync.js` | 10 peers, 500 ops: merge **156 ms**, verifyChain **15 ms** |
| The scale ceiling | `bash build/erp/run_witness.sh scripts/poc_scale_forecast.js` | see below — **and it currently fails one claim** |

### The scale numbers, and where they actually bind

Measured, not modelled from a spec sheet: **3 ops/doc**, **1,001 op/s**, engine ceiling ~**9.6M docs/day**.

- **Throughput never binds.** A 500,000-docs/yr tier (2,000/day, a 10–40 clerk department) uses **0.021%**
  of write throughput.
- **Interactive latency binds first.** Save is O(live docs) and crosses a 100 ms budget at **~3,954 live
  docs** desktop, **~978** on a 4×-throttled mobile. Manage the open working set with scoping/period-close.
- **Cold boot is a cliff, and checkpointing is mandatory, not an optimisation.** Genesis replay at 100M
  ops = **40 s** desktop / **158 s** mobile; checkpoint bootstrap ≈ **1 ms**, flat.
- **Storage is the hard wall.** **520 B/op** → ~**3,720 MB** projected at the large tier, against a ~2 GB
  browser ceiling. Pruning is required.

### What will FAIL if you run it today — stated so you find nothing we hid

- **`W-SCALE-FORECAST` fails 1 of 3 claims.** `batch beats naive per-op commit` measures **0.8×** — batch
  commit is currently *slower* than per-op. Being chased. (This witness had **no assertions at all** until
  2026-09-02 — it printed prose and exited 0. The first run after it gained assertions caught this.)
- **`W-AD-DISPLAYLOGIC-LIVE` fails** (`shown=1 hiddenByLogic=0`), on current code, re-run twice. AD logic
  *is* proven live by `W-PARITY-FIELDSET` above; whether this older witness fails from a stale selector or
  a real remaining gap is **not yet established**, so the coverage matrix has **not** been re-scored on it.
- **O2C stage 4 FAILs and stage 8 is ABSENT** (`scripts/witness_e2e_business_cycle.js`). A completed
  shipment does not move stock — there is no `m_storageonhand` fold anywhere in `erp/*.js` — and no
  vendor-invoice path exists, so three-way match cannot populate. Stages 1/2/3/5/6/7 PASS.

### The counts we will not round in our favour

- Coverage: **6✅ / 33🟡 / 3⛔ of 42** surfaces (`docs/internal/ERP_COVERAGE_MATRIX.md`).
- **454 of 476 `AD_Process`**, ~200 `beforeSave` overrides and 139 callout atoms remain **named-deferred**.
  The dispatch *spines* exist and are witnessed; the corpus does not. This is the dominant remaining
  distance to functional parity, and nothing currently scheduled closes it.
- The ledger headline says **52** oracle-equivalent surfaces; mechanical arithmetic over the table gives
  **53**. The one-row gap is traced to a `41` baseline that itself recounts to 42. Not inflation — a
  located off-by-one, left visible rather than quietly corrected.

## Abstracting the DocAction corpus — and why it is the migration solvent

> **How much of the corpus is folded today → ERP Coverage Matrix:** of the 14 DocActions × 52 C_DocTypes, the engine interprets **only `CO`** (Complete) — the other 13 actions and the per-doctype FSM are a ⛔ gap. The de-interleaved transition table is also the storage opcode table (`poc_oc_bytes.js` `§OPCODE-TABLE`).
>
> **2026-06-11 — the recipe runs LIVE at a point of sale:** the POS addon (POS_ADDON_SPEC)
> dispatches the `WR` (on-the-fly shipment+invoice) DocAction recipe as ONE signed op group on `idempiere.html` —
> order→CO + ship + invoice + BOM backflush + replenishment fold, all existing verbs (W-POS-WR: replay-equal to
> the engine's own specs; tamper breaks `verifyChain`; the invoice posting == real `fact_acct(318)` to the cent).

The grail edits *rules*; the most valuable rules govern a document's *lifecycle* — *when may
this complete, and what does completion do.* So the engine must express the whole iDempiere
**DocAction** corpus (≈13 actions — `DR/PR/CO/AP/RJ/CL/RC/RA/VO/RE/IN/XL/PO` — over ≈13
statuses) as **data**, not code, without re-bloating into per-model logic. It does, because
`DocumentEngine` is *already shared code in iDempiere, not per-model* — the tell that a state
machine is hiding inside a switch. It abstracts into three layers, and **only one is
per-model:**

| Layer | What it is | Cost |
|---|---|---|
| **The transition table** | `(DocStatus × DocAction) → {legal?, nextStatus, guard, handler}` — one generic, sparse decision table (§0.5) | extracted **once**, model-agnostic |
| **The handler families** | the side effects — and the corpus *collapses* (below) | a small closed set |
| **The oracle** | each `docAction` names its `M*.<action>It()`; the diff-oracle proves the generic handler reproduces it, cell by cell | verify, never port |

**The corpus collapses — but by *de-interleaving*, not by being secretly empty.**
`MOrder.completeIt()` and `MInvoice.completeIt()` genuinely run for pages. They are long
because each **interleaves four concerns** in one imperative method — and the same blob is
re-written in `MOrder`, `MInvoice`, `MInOut`, `MPayment`. Separate the four and the pages shrink,
because three of them are written **once for the whole corpus:**

| Concern tangled inside the method | What it is | Where it goes | Written |
|---|---|---|---|
| `setDocStatus`/`Processed`/`DocAction`, validate hooks | status bookkeeping (boilerplate in every method) | the transition table | **once** |
| mandatory fields, credit limit, legal status | guards — predicates (§0.14 GUARD) | rules (data) | **once, shared** |
| `createShipment`, `createInvoice`, `reserveStock`, `allocate`, `match`, post | generation verbs (§0.14 GENERATE), **shared across models** | named handlers | **once each** |
| which verbs fire, in what order, under which condition | the per-doc-type **recipe** | data — the `docAction` fan-out descriptor | a short list |

What remains genuinely model-specific and intricate — BOM / phantom explode (MOrder), material
transaction + costing + ASI (MInOut), the posting recipes — is a **small set of named handlers,
verified per cell against the `M*.*It()` oracle** (§0.17), far smaller than the raw page count
once boilerplate, guards, and the *duplicated* generation verbs are factored out.
`MInvoice.completeIt()` is mostly calls to verbs O2C already proved — `match`, `allocate`, post —
plus balance updates; its irreducible recipe is a handful of lines. `prepareIt` reduces the same
way: its guards → rules, its `reserveStock` / explode → the same generation verbs as `completeIt`.

The genuinely trivial actions carry **no handler at all** — straight into the table (~3 lines
each in iDempiere): `approveIt` (`setIsApproved`), `rejectIt`, `unlockIt` (`setProcessing(false)`),
`invalidateIt` (`setDocStatus(INVALID)`).

And the **reversal family collapses to ONE generic handler:** `voidIt` / `reverseCorrectIt` /
`reverseAccrualIt` / `reActivateIt` = *"emit the inverse of the document's op-group."* The op-log
holds the original ops, so reversal is appending the negation — **the per-model, notoriously buggy
reverse code in iDempiere becomes a single op-log operation.** This is the structural gift.
(`closeIt` = set status + clamp the residual; near-generic.)

So the reduction is real, but the mechanism is **factor the four concerns apart and de-duplicate
the shared verbs** — not "the code was empty." The bulk (status, guards, shared verbs, posting) is
written once for the whole corpus; the per-model remainder is a short recipe plus a few verified
handlers, `completeIt` / `prepareIt` included.

**Why this is the migration solvent.** Row migration is the easy part everyone already does.
What makes ERP migration hell — and what *locks* customers into SAP/Odoo — is the **behaviour**:
the lifecycle, the posting rules, the approvals. Nobody migrates behaviour because it is *code
in the source system*. The moment behaviour is **data** (a transition table + named handlers
verified against an oracle), migrating behaviour becomes migrating data. Every ERP's document
lifecycle is the same shape — a state machine over documents descended from double-entry
(1494). Onboarding a foreign instance becomes an **adapter** mapping *their* `(status, action,
transition)` onto *this* generic table, and their schema onto the 5-table bridge; the engine
never changes, only adapter rows. And because the target is an op-log, the migration is itself
**replayable, auditable, reversible** — the same reversal-family handler that voids a document
can unwind a bad import. You do not migrate *into* a new schema; you **fold the old system's
facts into the universal one.**

**The honest boundary.** "Eat *any* instance" is earned **one diff-oracle at a time.**
iDempiere is tractable because its DocAction is known and GardenWorld is the oracle. Odoo is
open and its state machine is extractable (oracle buildable). SAP is the asymptote — closed
ABAP plus decades of customer Z-code where the real behaviour hides; the honest claim there is
"the standard flows + extractable config, with Z-customisations per engagement." The method is
proven by the *first* clean abstraction — iDempiere's DocAction, the one being built now — and
the rest is campaign, in sequence (iDempiere → Odoo → SAP standard → SAP custom), each gated by
its own oracle. Migration removes the barrier to leaving; the grail (editable rules, live)
supplies the reason to land. Both halves, or the solvent has nothing to pour into.

**Odoo — second abstraction, WITNESSED (2026-06-03, `§ODOO-FOLD PASS`).** Odoo 17 demo was stood up,
one full sell-side O2C chain (SO `S00023` → delivery → invoice → GL post → payment → reconcile) was
driven to completion via RPC and frozen as a static oracle (`build/erp/odoo_oracle.{json,db}`, §0.12).
A *pure* adapter (`scripts/odoo_adapter.js` — the Odoo↔iDempiere data dictionary, no business logic)
folded that chain through the **existing** kernel verbs: `newVerbs=[]`, all 5 hops mapped, effects
reproduce Odoo to the cent, replay exact (`scripts/poc_odoo_fold.js`, log `build/erp/odoo_fold.log`).
The solvent dissolved a *second* ERP with nothing invented — the strongest evidence yet that the
verb set is general, not iDempiere-local. **Honest bound (named, not hidden):** this is ONE sell-side
chain. Account *determination* (which GL account) came from Odoo as host data — the POST verb owns only
ΣDR==ΣCR (§13.1), it does not re-derive Odoo's account logic. Full payment used FK-directed `ALLOCATE`.

**Buy-side + partials, WITNESSED (2026-06-03).** The campaign then folded three more Odoo chains, all
`newVerbs=[]`: the full 3-way `MATCH` (PO `P00011` → receipt → bill → post → reconcile, `§ODOO-FOLD-3WAY
PASS` — the 6th verb now exercised, all six fold Odoo); the f7 partial-receipt (PO `P00012` ordered 20 /
received 12 / billed 12, `§ODOO-FOLD-PARTIAL PASS` — decomposes into an exact-match settlement leg + an
FK-directed open remainder, §0.17); and **f8 bill≠receipt** (PO `P00013` received 12, billed 8) — the one
case that found a real engine gap. The SHIPPED exact-qty matcher pairs only when `|qtyL−qtyR|≤tol`, so it
could not reconcile bill≠receipt. **That gap is now closed (`§ODOO-FOLD-F8 PASS`):** `erp_engine.match`
gained opt-in **partial-QUANTITY matching** (`opts.partial=true` — pair `min(qty)`, carry the remainder),
reconciling to the unit (matched 8 + open-to-bill 4 == received 12) still via the SAME `MATCH` verb. The
honest classification held through the fix: it was new matcher **behaviour** (code), NOT a new verb
(`newVerbs=[]`) and NOT adapter-shaped (data) — and the exact-qty fast path stayed untouched, no regression.

**Partial PAYMENT, WITNESSED (2026-06-03, `§ODOO-FOLD-PAYPART PASS`).** The last Odoo bound the sell-side
fold named was full-vs-partial *reconciliation*. A fresh chain was driven to a partial-payment state (SO
`S00027` → invoice 5002.50 → register a payment of **3000**), leaving Odoo's computed residual **2002.50**,
`payment_state='partial'`, frozen as a static oracle. The fold reproduces it with the **same `ALLOCATE`
verb at the smaller amount** — residual = total − allocated, to the cent — `newVerbs=[]` **and no engine
change**. Partial payment is the cleanest result of the campaign: it was *free*. (Contrast f8, which cost
~15 lines of matcher behaviour: the difference is that a partial *payment* is one allocation at a smaller
amount, whereas a partial *quantity match* is a genuinely different pairing.)

**Account determination, DERIVED (2026-06-03, `§ODOO-FOLD-ACCTDERIV PASS`).** The one bound named at every
step above was that the folds took Odoo's *resolved* GL accounts as host data — "reproduces given accounts."
That bound is now closed. Odoo's determination CONFIG was extracted (product income = template account →
category fallback; tax = the tax's repartition account; receivable = the partner property) and a resolver
DERIVES the accounts from that config alone — reproducing Odoo's actual posting to the account (400000
Sales / 251000 Tax / 121000 AR), the derived double-entry balancing to the cent. It stays **host glue, not
engine** (POST still owns only ΣDR==ΣCR), and the determination logic was learned clean-room from the config
*structure*, never Odoo's source. The claim is raised from "reproduces *given* accounts" to "**derives** the
accounts" — `newVerbs=[]`.

**Odoo, in sum:** six folds with nothing invented — sell-side O2C, buy-side 3-way, partial receipt,
bill≠receipt, partial payment, and account derivation — across all six verbs, `newVerbs=[]` throughout, with
exactly one engine change in the whole campaign (the f8 partial-quantity matcher). The remaining items
(multi-currency, anglo-saxon COGS) are optional claim-raisers, not blockers.
**Next abstraction: SAP — the asymptote.** The *allowed half* is prepared (2026-06-03): a clean-room,
blind schema/state-map HYPOTHESIS (`scripts/sap_adapter.js`) mapping the standard SD+FI chain (VBAK/VBAP →
LIKP/LIPS → VBRK/VBRP → BKPF/BSEG|**ACDOCA** → BSEG clearing, with **VBFA** as the explicit derivation
spine) onto the same six verbs, plus a runner (`scripts/poc_sap_fold.js`) gated to `§SAP-ORACLE unavailable`
until a real export exists. The hypothesis is sharp precisely because S/4HANA's own redesign converged on
our shape — one append-style journal (ACDOCA) + an explicit document-flow graph (VBFA). What is *not* done,
and cannot be without violating non-invent, is the fold itself: that needs a real IDES/S/4HANA oracle, in
its own session, **never against an invented oracle.** The honest claim stays "standard flows + extractable
config; Z-customisations per engagement" — and the value of the SAP run is finding *which* Z-behaviour does
not fold, not a foregone PASS.

## The hard parts, worked through — why the showstoppers aren't

Three forward challenges look like showstoppers until you model them as the ledger already does.
None requires the OLTP server, the lock manager, or the always-on coordinator a classic ERP carries.

### 1. Compacting the signed log — *balance brought forward*

The op-log is hash-chained for tamper-evidence — each entry carries the fingerprint of the one
before it, so any later alteration is caught. After years it is millions of entries: too large for a
tab, too slow to replay from the start. You cannot simply delete the old ones — the chain would snap
and the old history could no longer be proven intact.

The resolution is the **period close.** At close, write one **signed checkpoint** carrying (a) the
closing balances and (b) the fingerprint of the chain head, signed by the controller. That checkpoint
becomes a new genesis: the next period chains off it; the closed period's entries are **archived
(cold), not deleted**; the live tab carries only the open period + the last checkpoint. Tamper-evidence
survives — re-add the archived entries and they must fold to the signed balance, to the cent, or fraud
is proven. This is **balance brought forward**: total the books, carry the opening balance, box the
journals in the archive. iDempiere already does the accounting half; we add only the signature and the
fingerprint. The hash-chain checkpoint and the accountant's year-end close are the *same ritual* — the
domain solved this 500 years ago. *(Optional reinforcements: a Merkle root keeps per-transaction
provability of a closed period in 32 bytes; emailing the checkpoint fingerprint to yourself binds even
the signer.)*

#### Back up the recipe, not the result — 1 TB → ≈500 MB {#backup-recipe}

The persisted artifact is the signed op-log, never the materialised database: balances, postings
(`Fact_Acct`) and every derived table are a deterministic *fold* of the log, recomputed on load — never
stored. Period-close compaction keeps only the open period live (`scripts/poc_volume.js` `§VOL PASS` —
bootstrap stays flat as history grows 100×). So a transaction-heavy **1 TB ERP backs up as ≈500 MB**: you
carry the journals, not the ledger they fold to.

*Two honest caveats on "replay reconstructs everything."* **(1) What replay reproduces exactly is the net
result:** the disjoint per-branch folds **commute**, so the union of signed logs re-folds to identical balances
in any order (witnessed `maxDiff=0c` — `scripts/poc_blackout_resume.js` `§ORDER-HONEST`). The one thing *not*
reconstructible from the logs alone is the **cross-branch CAS arbitration order** for a contended op-class — a
bounded sliver routed to the ledger, minimised live to a measured quorum-RTT window
(`scripts/poc_quorum_cas.js`). **(2) The ≈500 MB is the *full-replica* figure** (a facilitator or the owner's
own channel); an **edge device carries far less** — its own slice + the shared state it touches (≈13 MB resident,
not the whole chain — see [MigrateComparisonPaper](MigrateComparisonPaper.md) DR/TCO). "Every device = 500 MB" is
**No** for edge roles.

### 2. Atomicity — the document *is* the atomic unit

Atomicity — all of a document's effects, or none — needs no transaction manager here, because there is
no multi-row `UPDATE` to half-complete. A document-event is **one op-group** (§18.8), appended to the
log as a unit; state is the *fold* over it. The group folds in completely or not at all, and a torn
write fails its own hash. Atomicity is **structural** — the same dissolve-don't-coordinate move that
removed contention: delete the multi-write transaction, keep the single atomic append.

### 3. OLTP — physics is the lock, the ledger is the witness

Classic OLTP spends its effort on **isolation**: row locks / MVCC so concurrent writers do not clobber
shared state. The DistributedERP doctrine ([DistributedERP.md](DistributedERP.md) §1–§6) shows that
shared state is mostly a modelling artifact:

- **Atomicity** — solved above (the op-group).
- **Consistency** — the deterministic kernel + guards (period control included) enforce invariants on
  apply and on replay.
- **Isolation** — *physics partitions the writers.* A till owns its sales, a van owns its load, a
  box-in-hand owns itself — two writers cannot touch the same aggregate because the **atoms have a
  location** (§2). The one genuinely shared thing — the last unit, a global entitlement — is the single
  **CAS op-class** (§5): one set-if-unset, not a lock manager.
- **Durability** — asynchronous: the local append is instant; durability lands when the log is relayed
  (W-PERSIST). The one honest trade (§19.6) — synchronous durability for async convergence.

Per terminal this *wins*: in-RAM apply of the op-group, no network per transaction (~1–3 orders faster
than networked JDBC, §19). What remains is mechanical, not theoretical — maintain the read-projection
incrementally at high append rates, bounded by the period checkpoint so the working set stays small.

**And the deepest case — stock — is where the ledger earns its keep.** You do *not* lock the world to
prevent an oversell; in a partition you cannot, and every system that claims to is secretly
record-and-consequence ([DistributedERP.md](DistributedERP.md) §0, truth 4). Instead: **the physical
count is the truth; the ledger is the running expectation; reconciliation surfaces the difference.** The
scan *is* the op — you cannot scan a unit that is not physically there — so a physical unit cannot be
double-committed. The ledger's job is not to *prevent* the discrepancy but to **tell you the stock is
off** so you reconcile: POS → BOM backflush → replenishment → physical reconciliation. *Physics is the
truth; the ledger is the witness that the books drifted.*

### What it leaves you — keep just the ledger

Strip the machinery a classic ERP needs for these — the transaction manager, the lock/MVCC layer, the
always-on OLTP server, the sync coordinator — and **what remains is the ledger**: a signed, append-only
op-log; its fold (the balances); and reconciliation against the physical world. Compaction is *balance
b/f*; atomicity is *one op-group*; concurrency is *physics + one CAS*; multi-site is a *dumb async
facilitator* that only orders and relays ([DistributedERP.md](DistributedERP.md) §6), never an
authority. The hard parts are not unsolved — they are **re-expressed as accounting**, the one part of an
ERP that was always going to stay. It has been thought through; the ledger is enough.

**Witnesses — these are runs, not arguments (dated, headless, replay-deterministic).** The three hard parts
above are exercised on the actual editing-layer op shape in `scripts/poc_showstopper.js` (`§SHOW PASS`): the
document-event op-group folds all-or-none (a torn op is rejected whole), the period-close checkpoint re-folds
the cold archive to the signed balances *to the cent* with the tamper caught at the exact op, and the single
CAS holds across the checkpoint boundary. The "mechanical, bounded by the checkpoint" claim is then *measured*
in `scripts/poc_volume.js` (`§VOL PASS`): bootstrap from the last checkpoint stays flat as total history grows
100× while a full replay grows with it — the working set is bounded by the period, not the log; the binding
constraint is the per-op hash (append and verify), which sets the close cadence, not a wall. And the durability
path — the inbox as the recoverable signed log — is stress-tested in `scripts/poc_email_dr.js` (`§EMAIL-DR
PASS`): the data recovers unconditionally from any reachable valid snapshot, but the key does not live in the
inbox — without an anchor the encrypted snapshots are undecryptable, and the three anchors that close that gap
(own k-of-n channels, corporate escrow, platform passkey) each add a named, non-zero trust. The regress
terminates for the *fact* unconditionally; for the *key*, only at a chosen anchor — and naming it is the floor.

**Performance, measured (not asserted).** `scripts/poc_volume_ceiling.js` pushes the log/fold layer to 20M
ops with no wall and a linear curve (~437 bytes/op); `scripts/poc_volume_sqljs.js` re-measures on the actual
browser stack (sql.js + `crypto.subtle`), where a per-op append is ≈15 µs, bound by the async hash, not by
SQLite, and the fold (a SQL `GROUP BY` over a bounded chart of accounts) stays sub-frame. Against a legacy
central database the gap is set by *where the work happens*: `scripts/poc_legacy_ab.js` shows that **on one
box** Postgres ≈ local SQLite (both ~1 ms, fsync-bound) — so the ~100× there is honestly the async-durability
trade (§19.6), not server-removal. `scripts/poc_remote_pos.js` shows the **remote** case, where it matters: a
POS sale's cashier-perceived latency is RTT-bound for a central DB (tens to hundreds of ms, and the till
*cannot sell when the link is down*) versus a local apply plus an asynchronous relay to HQ — RTT-independent
and offline-capable; a 10k-document batch-plus-charts runs locally with no network and no per-chart round-trip
(~12× over a fair server-side batch at cross-region latency). Every legacy figure is raw SQL, excluding the
ORM/OSGi/JDBC layers that only make it slower — a floor, not a ceiling. The one honest cost throughout is the
same async-durability trade; the gains are server-removal and locality, named, not rounded up.

**Where this sits among the fast-SQLite systems — and the claim I will *not* make.** Embedded SQLite at scale
is not new: Expensify's Bedrock, Cloudflare's D1, Turso/libSQL all run it in production. On a single box, with
durability matched, an in-process engine is roughly 3× a networked one on writes — and that advantage *inverts*
under heavy concurrency, a benchmark a fair critic will (and should) cite. So I do not claim a faster engine.
The real difference is the **write path**: every one of those peers keeps strong consistency by escalating each
write to a central primary over the network. This design does not — a write applies locally and the signed
op-group is relayed asynchronously, with a single compare-and-set for the one genuinely shared resource. That
is a different *consistency model*, not a faster engine; its cost is eventual convergence, and its dividends are
the two things a round-trip-to-a-primary architecture cannot give a till: it keeps selling when the network is
down, and there is no write-contention to lose under concurrency, because each terminal is the single writer of
its own partition. The speed argument is modest and conditional; the architecture argument — offline,
single-writer, signed — is the one that holds.

## A closing note, to the version of me from two years ago

The two years spent proving the *imperative* extraction does not converge were not
wasted — they are the evidence that the *declarative-extract* path is the one that does.
The grail was never going to be reached by carrying the old engine somewhere lighter. It
is reached by realizing the engine should have been data all along, and that the one
thing a code-engine structurally cannot give you — a rule you edit while it runs, safely
— falls out for free the moment it is.

---

*Grounding: ERP.md §0.4 · §0.5 · §0.9 · §0.10 · §0.17 · §0.18 · §2d-3 ·
GLASSBOWL_DOSSIER.md · the §20 prototype addendum. Every claim of
extraction here is witnessed in a dated log; nothing on this page is asserted that the
source data does not support.*
