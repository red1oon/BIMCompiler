# ⚠ DO NOT REMOVE — Scope guard / RESUME CARD: HARDEN THE COVERAGE MATRIX (coverage → equivalence)
# Lane: take the ERP coverage matrix from "surface INTERPRETED" (37🟡 = engine touches the AD) to "behaviourally
#       EQUIVALENT" (engine output == real iDempiere output, oracle-diffed). Anchor on the MOrder archetype + its
#       document-family deltas — NOT a 496-class sweep. UI stays PARKED; equivalence is UI-INDEPENDENT (it diffs
#       engine vs iDempiere, not engine vs screen).
# NON-NEGOTIABLE: EXTRACT, DON'T INVENT — fixtures + oracle outputs come from the iDempiere checkout
#       (~/idempiere-dev-setup/idempiere) and build/erp/ad_full.db; never hand-author an expected output. Spec-first;
#       whitebox §-log FIRST (READ the log; exit code ≠ evidence); deterministic (recorded ids/ts, INTEGER CENTS,
#       no Date.now/Math.random); keep the §0 SEPARATION seams (one concern = one module; AD-declaration / interpreter
#       / log-fold never merge); MECHANISM not CORPUS where a corpus is infinite (prove the diff harness + the
#       archetype + a few deltas; name the unported remainder). A row is hardened only by an oracle DIFF, not a claim.
# READ FIRST — take it ALL in, in this order:
#   0. docs/MigrateComparisonPaper.md#status — the 4-state honesty panel (🟢 folds-today · 🟠 extraction · 🔴 fold-gap
#                                          · 🔵 deleted-by-architecture); the at-a-glance frame for everything below.
#   1. docs/ERP_COVERAGE_MATRIX.md      — the scoreboard (0✅/37🟡/3⛔; 🟡 = surface-touched, NOT proven-equivalent).
#   2. docs/ERP_MODEL_ARCHETYPE.md      — THE DENOMINATOR: MOrder = the core; the ~25 completeIt classes = deltas;
#                                          the master-data tail = AD_Column + light invariants. This is what to harden.
#   3. docs/ERP_BACKEND_SEPARATION.md   — the §0 seams the hardening must NOT violate.
#   4. prompts/ERP_BACKEND_GAP.md       — Track A (the interpreters) is DONE; this card is its equivalence sequel.
#   5. scripts/poc_odoo_fold*.js + scripts/poc_sap_*.js + build/erp/odoo_oracle*.json — THE ORACLE-DIFF TEMPLATE
#                                          already in the repo (engine fold vs captured reference output, maxDiff=0c).
#                                          Hardening = extending exactly this discipline to the MODEL layer.
#   6. prompts/SERVERLESS_HARDENING_RESUME.md — §H Tier-2 (substrate hardening) runs in parallel, separate axis.

---

# Harden the matrix — from coverage to equivalence

> **▶ OPERATIONAL BACKLOG:** the concrete, prioritized gap list + verified recon + per-gap output contract lives in
> `prompts/GAP_CLOSURE_LANE.md` (governed by the method spec `docs/GapClosureSpec.md`). This card is the WHY +
> denominator + seams; that card is the WHAT-NEXT. Start a gap-closure session there.

## The situation (synthesis — why this card exists)
The interpreter-coverage ladder is CLOSED: every behavioural surface with seed data now has an engine that reads
the AD and produces a verdict (Lanes 1–3 + A-1…A-6, matrix 0✅/37🟡/3⛔). **But none of it is oracle-diffed** — 🟡
means the engine *touches* the surface on sample rows, NOT that it produces *the same answer iDempiere would*. That
is the gap this card closes. **Coverage ≠ correctness.** The only existing equivalence proofs are the Odoo/SAP fold
POCs (engine fold == captured oracle, maxDiff=0c) — the right pattern, never extended to the model layer.

**Two axes, kept distinct (do not conflate):**
- **Coverage** (existing matrix verdict ✅/🟡/⛔) — is the surface interpreted? CLOSED.
- **Equivalence** (this card adds it) — does the engine output == iDempiere output for real inputs? NOT STARTED.
- (A third axis, **live-UI**, is the parked `AD_BEHAVIOR_HANDOFF` — out of scope here.)

## What "HARDENED" means — the new metric
Add an **Oracle column** to `docs/ERP_COVERAGE_MATRIX.md`: `⬜ not-diffed · ✅ oracle-equivalent · n/a (no oracle in
seed)`. A row is **hardened** when K real fixtures show **iDempiere-output == engine-output** with a `§`-log diff
(ΣDR=ΣCR + per-account/per-field maxDiff=0, or field-state/doc-status identical). Add a SECOND headline tally:
**"N of 40 oracle-equivalent."** The existing coverage tally stays; this is additive, not a re-verdict.

## ⚠ THE ORACLE ALREADY EXISTS (verified 2026-06-09 — do NOT build it from scratch)
- **Posting oracle = real GardenWorld `fact_acct`** (300 rows, client 11, balanced 46574.97) is **already captured
  locally in `build/erp/glassbowl_data.db`** via `scripts/extract_fact_acct.sh` (Docker Postgres `idempiere_test` →
  sqlite). `scripts/test_report_fin.js` already proves **TB-read equivalence to the cent** (`§REPORT-FIN-RECON …
  maxDiff=0c`). So the **trial-balance/report layer is the FIRST hardened ✅** — banked in the matrix already.
- **The real gap is GRANULARITY + SURFACE, not "no oracle":**
  1. The captured `fact_acct` has **no `record_id`/`ad_table_id`** → can prove the *aggregate journal* matches but NOT
     *per-document derivation*. **H-1 step 1 = extend `extract_fact_acct.sh`** to pull `record_id, ad_table_id,
     line_id` and re-capture, then diff `post_resolver`'s derived lines per document vs the real fact_acct lines.
  2. The **declarative + event surfaces** (logic/access/valrule/callout/modelval/FSM) have **no oracle at all** — they
     diff against iDempiere *Java semantics* (`GridField`/`MRole`/`MValRule`/`Doc_*`), which needs either a running
     instance (the same Docker `idempiere_test`) or captured per-surface fixtures.
- **NON-INVENT reminder:** never synthesize an oracle. If the Docker instance isn't up, a surface stays ⬜, not ✅.

## The oracle harness (extend the EXISTING capture — `extract_fact_acct.sh` is the template)
Following the Odoo/SAP pattern (capture once → diff deterministically), per surface type:
- **Posting** → capture real `Fact_Acct` lines from iDempiere for K documents → diff our `post_resolver` derivation.
- **Logic/ReadOnly/Mandatory** → capture `GridField` displayed/readonly/mandatory state for K (record, context) → diff `ad_evaluator`.
- **Access** → capture `MRole.getWindow/Process/FormAccess` + `canView` for K (role, target) → diff `ad_access`.
- **Val-rule** → capture the rows a `MValRule` SQL admits for K → diff `ad_valrule`.
- **DocAction** → capture the legal next-status set + the resulting status per (C_DocType, action) → diff our FSM.
Store oracle outputs as versioned fixtures (e.g. `build/erp/oracle/<surface>_oracle.json`) extracted from the
checkout — NEVER hand-authored. If iDempiere can't be run headlessly here, capture the fixtures from the AD/seed
the same way the matrix counts were taken, and say so.

## ORDER — anchor on the archetype, then walk the deltas (from ERP_MODEL_ARCHETYPE.md)
### H-1 ⭐ MOrder to equivalence — the keystone ("got MOrder, got the core")
Make the MOrder surface table in `ERP_MODEL_ARCHETYPE.md` GREEN by oracle-diff: its `beforeSave` invariants
(pricelist/warehouse/bpartner/credit) via `ad_modelval`, its FULL DocAction set (not just CO) via the FSM, and
`Doc_Order` posting via `post_resolver`. Witness `§HARDEN surface=MOrder.<x> fixtures=K diff=0 oracle=iDempiere`.
One archetype, proven — this is the highest-value single result in the whole arc.

### H-2 Walk the 25-delta table — deepest-delta-first
For each document-family class, diff only its DELTA from MOrder: `MInOut` (in-transit locator), `MPayment`
(allocation), `MProduction` (BOM explosion), `MInventory` (count), `MAllocationHdr` (headerless) FIRST — these
carry genuine document-specific logic; the rest are the trade pattern with a different line table + `Doc_*` poster.
`§HARDEN surface=<MClass> deltaFrom=MOrder fixtures=K diff=0`.

**✅ H-2 DONE 2026-06-11 in TWO sessions:** the deep deltas (`prompts/FABLE5_H2_DELTAS.md` — MInOut/MInvoice/
MPayment save+FSM + the inventory-family FSM) **and the WHOLE isomorph tail (`prompts/H2_ISOMORPH_TAIL.md` —
Journal/Batch, Allocation, Cash, BankStatement blocks + the 11-class generic-block tail, 10 witnesses)**. NO
DocAction table remains unwalked; the 0-seed classes (BankTransfer/DepositBatch/ProjectIssue/FA×5) are
source-parse-only with stored-replay honestly ⛔. Matrix ledger = **41 oracle-equivalent**. Both cards carry
§-lined `# DONE` appendices.

**✅ B-3 POSTING band DONE 2026-07-17 (W-POST-B3, `prompts/FABLE5_B3_POSTING_ORACLE.md`):** the 0-seed classes'
POSTING (the last un-oracled accounting surface) is closed — 2 ∅-by-design (no Doc_ in the factory: BankTransfer/
DepositBatch) + **6 G-seed classes oracled `maxDiff=0c`** against the REAL compiled posters driven in iDempiere's
own OSGi test harness over a GardenWorld-model seed on a scratch clone (`scripts/generate_post_oracle.sh` →
`build/erp/oracle/post_b3_fixture.json`; USER RULING 2026-07-17 sanctioned seed-INPUT prep). `derivePostings`
gained the 6 per-class manifests. Matrix ledger = **49 oracle-equivalent**. Log: `build/erp/poc_post_b3.log`.

### W-POST-TAIL — the LAST 6 Doc_* posters (spec 2026-07-18, Fable 5; sequel to B-3)
The 20-poster factory now folds 14. The remaining 6 decompose by SEED REALITY (facts verified live 2026-07-18):
- **C_BankStatement (392)** — REAL oracle in the seed: 13 fact rows for statement 100 (2 lines). Manifest
  (Doc_BankStatement.createFacts:200-280): per line DR/CR {Bank.Asset}=+StmtAmt · {Bank.InTransit}=−TrxAmt ·
  charge leg (>0→CR / <0→DR negate, {Charge.Expense}) · interest leg (<0→{Bank.InterestExp} else InterestRev,
  −InterestAmt); clearing-equal branch n/a (asset 258/200052 ≠ intransit 257/200053, IsPostIfClearingEqual=Y);
  DOC-currency legs → per-schema conversion + the Fact.balanceAccounting CurrencyBalancing residual (724, the
  W-FOLD-ALLOC-FX rule — the 0.01 DR on schema 200000 in the real rows). Capture: additive widening of
  c_bankstatementline (+trxamt/chargeamt/interestamt/c_charge_id) + c_bankaccount_acct (+interest accts).
- **M_MatchPO (473)** — the REAL engine posted the EMPTY SET 37 times (37 docs posted='Y', 0 fact rows):
  PPV block gated on COSTINGMETHOD_StandardCosting (Doc_MatchPO.java:429) and GardenWorld costs at 'A' Average
  → ∅ is CONFIG-derived. Manifest = ∅ under 'A'; §FALSIFIER flips costingmethod→'S' → the PPV path opens.
  Additive capture: m_matchpo.
- **M_Requisition (702)** — 1 posted doc, 0 facts: Doc_Requisition.createFacts:130 gates on
  MAcctSchema.isCreateReservation (commitmenttype 'B' POCommitmentReservation / 'A' POSOCommitmentReservation,
  MAcctSchema.java:662-669; GardenWorld='N') → ∅ CONFIG-derived
  (the W-MORDER-POST twin). §FALSIFIER flips commitmenttype→'B' → per-line {Product.Expense}=AmtSource +
  CommitmentOffset. Additive capture: m_requisitionline.
- **C_Cash (407)** — 2 real docs CO but NEVER posted (posted=N, 0 facts) → post the EXISTING docs on a scratch
  clone (B-3 generator reuse, zero seed prep) → capture → fold. NEXT SESSION unless this one has room.
- **M_Inventory (321)** — 3 real DRAFTS → complete+post on scratch clone (same move). NEXT SESSION likewise.
- **M_Production (325)** — 0 docs AND component m_cost absent (the W-FOLD-PRODUCTION named-deferral) → stays
  honestly ⛔ until a costed BOM seed exists; do NOT synthesize costs.
Witness: `scripts/poc_post_tail.js` (W-POST-TAIL) — BankStatement per-doc/per-schema integer-cent diff vs
fact_acct(392); MatchPO ∅==∅ over ALL 37 real docs + gate-flip; Requisition ∅==∅ + gate-flip; ≥2 falsifiers
load-bearing. Extract bundle regressions must stay green after the additive widening.

**✅ W-POST-TAIL first half DONE 2026-07-18 (same session as the spec):** `🟢 W-POST-TAIL PASS` —
`§TAIL-POST C_BankStatement … maxDiff=0c oracle=real-fact_acct(392)` (13 rows incl. the schema-200000
conversion + 0.01 CurrencyBalancing residual) · `§TAIL-POST M_MatchPO docs=37 … ∅-by-config` ·
`§TAIL-POST M_Requisition … ∅-by-config` · 3 falsifiers load-bearing (req-flip N→B opens · mpo-flip A→S
+cost-scale opens · bs-scale 14850c→24650c). **Correction banked:** the B-3 fx-rate story was IsActive
(:251), not client-rank — the inactive 0.8006 row is now CAPTURED and `fxRate` filters it verbatim
(poc_alloc_fx §FALSIFIER-B prop restored, whole bundle re-green). Matrix ledger = **52 oracle-equivalent**;
17/20 factory posters fold. Remaining: Cash (post 2 real CO docs on clone) · Inventory (complete 3 real
drafts on clone) · Production ⛔ (no docs, no component costs). Log: `build/erp/poc_post_tail.log`.

### §W-POST-TAIL-2 manifest spec (2026-07-18, Sonnet session — written BEFORE coding, per Spec-First)
**C_Cash (407) — Doc_Cash.createFacts:150-249 (`Doc_Cash.java`), DocLine_Cash.java for the CashType
constants.** Facts (re-verified live): 2 real CO docs, posted='N' — `c_cash_id=100` 1 line (CashType=I
Invoice, amount=50.35, c_invoice_id=100) · `c_cash_id=101` 3 lines (E −10, T −50 bankaccount=100, R +10).
No Charge/Difference lines in this seed → those two branches are manifest-complete (source-parsed) but
UNEXERCISED by the real docs; do not claim them oracle-diffed. Per-line legs, header running `assetAmt`:
- **E (Expense, :174-181):** DR `{CashBook.CashExpense}`=amount.negate(); assetAmt −= amount.negate().
- **R (Receipt, :182-189):** assetAmt += amount; CR `{CashBook.CashReceipt}`=amount (raw, not abs).
- **C (Charge, :190-197):** DR `line.getChargeAccount` (`c_charge_acct.ch_expense_acct`, C_Charge_ID/schema)
  =amount.negate(); assetAmt −= amount.negate(). Charge_ID=0 on any real line ⇒ this branch never fires here.
- **D (Difference, :198-205):** DR `{CashBook.CashDifference}`=amount.negate(); assetAmt += amount.
- **I (Invoice, :206-219):** if line currency == cashbook currency (true, both 100/USD): assetAmt += amount,
  no separate CashAsset line; ELSE DR `{CashBook.CashAsset}` at line currency. ALWAYS: CR `{CashBook.CashTransfer}`
  =amount.negate(), at LINE currency (not doc currency).
- **T (Transfer, :220-236):** DR `{BankAccount.InTransit}` (`c_bankaccount_acct.b_intransit_acct`, keyed by
  the LINE's own C_BankAccount_ID/schema, not the doc's) =amount.negate(), at line currency; if line
  currency==cashbook currency: assetAmt += amount; else DR `{CashBook.CashAsset}` at line currency.
- **Header close (:239-243):** if assetAmt≠0, one more leg on `{CashBook.CashAsset}` (doc/cashbook
  currency) = assetAmt (sign-dependent DR/CR, 4-arg `Fact.createLine`).
- **Accounts:** `c_cashbook_acct` columns CB_Asset_Acct/CB_CashTransfer_Acct/CB_Expense_Acct/
  CB_Receipt_Acct/CB_Differences_Acct keyed by (C_CashBook_ID=101, schema) — `Doc.java:1478-1502`.
  Schema 200000 carries ONLY `cb_cashtransfer_acct` (200065) — asset/expense/receipt/differences are
  NULL there; `Fact.createLine` silently DROPS a null-account line (`Fact.java:116-122`, not an error) —
  so schema-200000 posts a partial (possibly source-imbalanced) leg set BY DESIGN, not a bug. `Doc.getAccount`
  returns null on a 0-combination (`Doc.java:1602-1610`), same drop behaviour.
- **maxDiff=0c gate** over both real docs × both schemas × (account,side), same shape as BankStatement.

**M_Inventory (321) — Doc_Inventory.createFacts:211-513 (`Doc_Inventory.java`), physical-inventory branch
only** (this seed's 3 docs are all DocSubTypeInv=PI, doctype 144). Facts (re-verified live): `m_inventory_id`
100 (DR client 11) has 1 real line (product 147 "TShirt - Red Large", locator 101→warehouse 103, qtycount=1/
qtybook=0 → qtyDiff=+1, no charge, no ASI, not reversal) — the ONLY completable doc. **`m_inventory_id`
200000 and 200001 have ZERO lines each** (`m_inventoryline` count=0, verified live) → `MInventory.prepareIt`
(`MInventory.java:401-406`) fails BEFORE completion with `@NoLines@`, STATUS_Invalid — these 2 CANNOT
reach docstatus=CO, let alone post. This is the engine's own validation, not a workaround decision:
⛔ both BY NAME, do not attempt to seed lines onto them (that would be inventing source data on someone
else's document, banned regardless of the seed-prep ruling — the ruling covers NEW documents, not
patching existing ones). **1 of 3 is the honest ceiling for this seed.**
- Manifest for doc 100 (PI, :279-340): `costs = line.getProductCosts(as, orgId, true, "M_InventoryLine_ID=?")`
  (`ProductCost.getProductCosts`, the schema-costingmethod → cost-element → `m_cost.currentcostprice` hop,
  same as `deriveProjectIssue`'s `{Product}` cost lookup already in `doc_poster.js`). Product 147's `m_cost`
  rows are ALL currentcostprice=0 (schema 101; NO rows at all for schema 200000) and `m_costdetail` has
  ZERO rows for this product (verified live) — so the `costs==0` zero-cost-blessing check
  (`Doc_Inventory.java:319-336`, requires a processed zero-cost purchase M_CostDetail row) FAILS → the
  REAL engine's own `createFacts` returns `p_Error="No Costs for TShirt - Red Large"` UNLESS the scratch
  run shows otherwise (to be confirmed empirically against the actual OSGi-driven posting — the source
  reading above is the prediction, the scratch-clone run is the oracle; if posting truly fails this is
  ALSO an honest ⛔-by-data-state, named with the engine's exact error, not invented around).
- IF posting succeeds (costs resolve non-zero via a path not visible from static reading — e.g. batch/lot
  MA rows, or a costingLevel hop this trace missed): DR `{Product.Asset}` (service→`{Product.Expense}`,
  `ProductCost.ACCTTYPE_P_Asset`, m_product_category_acct via product→category, same token already in
  `post_resolver.js`) = costs; CR `line.getChargeAccount` if C_Charge_ID≠0 (0 here → null) ELSE
  `M_Warehouse_Acct.W_Differences_Acct` keyed by (M_Warehouse_ID=103, schema) — `Doc.java:1505-1509`,
  `Doc.ACCTTYPE_InvDifferences` — = costs.negate(). `M_Warehouse_ID` resolved from the line's locator
  (`m_locator.m_warehouse_id`), not a doc column.
- Capture additive: `m_inventory`, `m_inventoryline`, `m_warehouse_acct`, `m_locator` (locator→warehouse),
  `m_cost`, `m_costelement`, `m_costdetail` (for the zero-cost-blessing count), `m_product`,
  `m_product_category_acct`, `c_validcombination`.

Witness extension: new diff bands in `scripts/poc_post_tail.js` reading a NEW fixture
`build/erp/oracle/post_tail_fixture.json` (twin of `post_b3_fixture.json`, via a new
`scripts/logic_oracle/PostingTailTest.java` + `scripts/generate_post_tail_oracle.sh` +
`scripts/capture_post_tail_fixture.js` — same scratch-clone-drive-capture-drop machinery, reused not
reinvented), same maxDiff=0c per-doc/per-schema gate. `M_Production` ⛔ stays untouched (0 docs).

**✅ §W-POST-TAIL-2 CLOSED 2026-07-18 (same session as the spec above) — empirically driven, NOT the
optimistic outcome the spec predicted.** Ran the REAL compiled posters on a fresh scratch clone
`idempiere_tail` over the 2 real CO cash journals + 3 real inventory drafts (zero seed authoring — every
document already existed). Ground truth (`§TAILORACLE`, `build/erp/generate_post_tail_oracle.log`):
**C_Cash — both docs (100/101) are `IsActive='N'`**, not merely "never posted" as first assumed;
`Doc.postIt`'s lock UPDATE (`Doc.java:591-605`, requires `IsActive='Y'`) never fires →
`DocManager.postDocument` returns `"CannotPostInactiveDocument"` for both. **M_Inventory — 200000/200001
have ZERO lines each** → `MInventory.prepareIt` (`:401-406`) refuses with `@NoLines@` before completion;
**doc 100 (1 line, product 147) DOES complete** (DocStatus=Completed) but the REAL engine then refuses to
POST it — `"No Costs for TShirt - Red Large"` (`Doc_Inventory.java:319-336` — product 147 has
`currentcostprice=0` everywhere and ZERO `M_CostDetail` rows, so the zero-cost-blessing check fails).
**Neither blocker worked around** — flipping `IsActive` or seeding lines/costs onto an EXISTING document
is data mutation, the same out-of-scope boundary this very card already drew for Inventory's `@NoLines@`
docs; extending it to Cash's `IsActive` flag is the consistent, non-invented call, not a new judgment.
`doc_poster.js` still gained `deriveCash` (all 6 CashType legs, Doc_Cash.createFacts:150-249, fully
source-cited) and `deriveInventory` (physical-inventory branch, Doc_Inventory.createFacts:211-513) —
reusable for any FUTURE active/costed document — proven LIVE via falsifier since no oracle-diff is
possible here: `deriveCash` computes real non-empty legs from the real line data (§TAIL-FALSIFIER
cash-live, doc100 2 lines / doc101 4 lines — the ∅ is the `IsActive` gate, not a dead verb);
`deriveInventory` reproduces the SAME "No Costs" refusal (0==0, non-vacuous — §TAIL-FALSIFIER
inv-bless-flip: a synthetic zero-cost-blessing row in an in-memory copy opens the gate, 0→2 lines).
**Ledger STAYS 52 / 17 of 20 posters** — Cash and Inventory join Production as named ⛔, each for a
different, precisely-cited reason; none is a "next session" placeholder anymore. Whole bundle re-run
green (`poc_post_b3` · `poc_post_harden` · `poc_factacct_doc` · `poc_doc_poster` · `poc_morder_post` ·
`poc_alloc_fx` · `poc_money_post` · `poc_matchinv_fx` · `poc_gljournal` · `poc_post_tail` ·
`test_report_fin` all exit 0, TB 46574.97/300 intact). Logs: `build/erp/generate_post_tail_oracle.log` ·
`build/erp/poc_post_tail.log`.

### H-3 Spot-harden the declarative engines
`ad_evaluator`/`ad_access`/`ad_valrule`/`ad_reference` are 🟡 on parse; oracle-diff a SAMPLE of each against
`GridField`/`MRole`/`MValRule` outputs — confirm the verdict matches, not just that it parses. The master-data
tail needs little beyond this (it is AD_Column + the `ad_modelval` hook).

**✅ DONE (2026-06-10) — the 3 SQL-grounded declarative engines are ORACLE-EQUIVALENT.** Oracle = the live
iDempiere Postgres (docker `postgres`/`idempiere`, GardenWorld client 11 — the SAME seed `ad_full.db` was
extracted from). Diff harness pattern (reused across all 3): drive the engine to produce a membership/verdict
set over our SQLite, run the equivalent query on Postgres, diff the sets; a load-bearing §FALSIFIER each.
- **AD_Val_Rule** (`scripts/poc_valrule_harden.js` → `build/erp/poc_valrule_harden.log`) — 10/10 rules, every
  token-substituted where-clause's row-membership == Postgres, **diff=0**; §FALSIFIER (flipped operator) diff=8.
- **AD_Ref_Table** (`scripts/poc_reference_harden.js` → `…poc_reference_harden.log`) — 12/12 refs, FK resolution
  (fkTable,keyCol) + FULL keyCol id-set (incl. 26,519-row ad_column) == Postgres, **diff=0**; §FALSIFIER diff=27125.
- **AD role/access (MRole)** (`scripts/poc_access_harden.js` → `…poc_access_harden.log`) — 5 roles × {win,proc,form}
  = 15/15 access maps == `MRole.getXxxAccess` SQL, **diff=0**; `canView` switch == bitmask-intersection over 42
  combos, 0 mismatch; §FALSIFIER (+1 bogus grant) diff=1.
- **AD_Column.Callout derive** (`scripts/poc_callout_harden.js` → `…poc_callout_harden.log`) — over the full 27
  c_orderline population vs Postgres stored: `CalloutOrder.product` PriceActual/PriceList == price-list **27/27**;
  `CalloutOrder.amt` LineNetAmt=round(price×qty) == stored **26/27** (1 NAMED residual: line 119 price-drift, the
  doc-109 pattern, contract intact); §FALSIFIER corrupt-qty diverges. Matrix bumped 16→**20** oracle-equivalent.
- **⛔ REMAINING: NONE (closed 2026-06-12).** `ad_evaluator` FELL to B-1 (W-LOGIC-HARDEN, 2751 fixtures diff=0
  vs real compiled SimpleBooleanParser+EvaluationVisitor — `prompts/ERP_EXECUTION_ROADMAP.md` B-1). `ad_workflow`
  FELL to B-2 (W-WF-HARDEN, `scripts/poc_wf_harden.js` → `build/erp/poc_wf_harden.log`: 11 REAL PG traces
  `§HARDEN surface=ad_workflow fixtures=11 diff=0 oracle=iDempiere-PG-trace` + real compiled StateEngine mutators
  + DocAction std-user gate via `scripts/logic_oracle/WorkflowOracle.java` — the LogicOracle technique one level
  up; small K named in §HARDEN-SKIPS). (`ad_modelval` + `ad_docfsm` FELL 2026-06-11 to the
  H-1/H-2 source-parse + stored-state oracle pattern — see the model-layer rows in the matrix; no longer ⛔.)

## HONEST RESIDUALS (name, don't fake)
- The 3⛔ are n/a-in-seed (empty `fact_acct`/`fact_reconciliation`, empty `*_Access`) — **no oracle exists**; mark
  Oracle = n/a, never synthesize one.
- Where a fixture can't be captured from this checkout, log the gap; a missing oracle is an honest ⬜, not a ✅.
- "Mechanism not corpus" still holds: prove the harness + MOrder + the ~5 deep deltas; the long tail of trade-pattern
  isomorphs is a delta-diff each, named as remaining count — don't claim them un-diffed.

## THE FORK (decided for this arc, stated so it's deliberate)
This card CHOOSES equivalence = product-grade rigour. If the goal later flips to **the paper**, the very same
captured fixtures become the paper's equivalence evidence ("engine == iDempiere, maxDiff=0c on K real documents") —
so the work is not wasted either way. Don't silently expand into re-implementing iDempiere; harden what's claimed.

## DELIVERABLE / STOP CONDITION
Matrix gains the Oracle column + the "N of 40 oracle-equivalent" tally; the MOrder archetype table is GREEN by
diff; the delta table carries real diff results; the harness is reusable. Each surface hardened has a `§HARDEN …
diff=0` line (read the log). Unstarted surfaces stay ⬜. If a surface needs a user decision that can't be EXTRACTED
→ `⛔ BLOCKED: <the one question>` and move on. Keep the separation seams intact; UI bridge stays parked.
