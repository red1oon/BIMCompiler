# ⚠ DO NOT REMOVE — Scope guard / SONNET FOLLOW-THROUGH CARD (written by the Fable-5 session, 2026-07-18)
# Scope: TWO bounded lanes, worked WORK-TO-ZERO in order. §A finishes the Doc_* posting tail (2 classes,
#   machinery already built and proven — this is execution, not research). §B writes the ERPUserGuide's
#   high-level navigation + the CORE S&D standard-flow chapter (Sales Order → replenishment → PO → shipment
#   → final accounts → financial reporting). Leave every addon lens (POS/Kitchen/WH/Tenancy/BIM-4D/Ninja)
#   as-is — §B is core-ERP only, per the user 2026-07-18.
# READ THE LOG after every run (exit ≠ evidence): every poc_* via `bash build/erp/run_witness.sh scripts/poc_X.js`.
# Honour this preamble until every item below is ✅ or ⛔.
#
# GIT: start from FRESH `origin/master` (`fable/meshdb-livewire` was squash-merged twice — PR #44/#45 —
#   re-using it collides). Push permission is ON (CLAUDE.md 2026-07-17): commit, push, PR, merge — the
#   `system-is-real` CI check is a KNOWN pre-existing red-X (memory `project_ci_system_is_real_red_x`),
#   NOT yours and NOT required; do not chase it.

## WHERE THIS PICKS UP (state as of 2026-07-18, all on master)
- **52 surfaces/classes oracle-equivalent** (`docs/internal/ERP_COVERAGE_MATRIX.md` headline). 17 of the
  20 `org.compiere.acct` factory posters fold at `maxDiff=0c`. The last three: C_Cash, M_Inventory
  (both §A here), M_Production (⛔, stays).
- The B-3 machinery is BUILT and reusable: `scripts/generate_post_oracle.sh` (scratch-clone → OSGi-hosted
  posting → capture → drop) + `scripts/logic_oracle/PostingOracleTest.java` (the vendor `org.idempiere.test`
  tycho harness) + `scripts/capture_post_b3_fixture.js` + the diff pattern in `scripts/poc_post_b3.js` /
  `scripts/poc_post_tail.js`. Cards: `prompts/FABLE5_B3_POSTING_ORACLE.md` (read its §W-2 EXECUTION SPEC
  block — every infra landmine already named) + `prompts/HARDEN_MATRIX.md §W-POST-TAIL`.
- Witness bundle green: poc_post_b3 · poc_post_tail · poc_post_harden · poc_factacct_doc · poc_doc_poster ·
  poc_morder_post · poc_alloc_fx · poc_money_post · poc_matchinv_fx · poc_gljournal · test_report_fin
  (TB 46574.97 / 300 rows).

## §A — finish the posting tail (2 classes; the generator does the heavy lifting)
Both classes have REAL seed documents that were simply never posted — so unlike B-3 there is NO seed
authoring at all: drive the REAL engine over the REAL rows on a scratch clone, capture, diff.

### A-1 C_Cash (ad_table_id 407) — post the 2 existing CO cash journals
- Facts (verified 2026-07-18): 3 `c_cash` docs client 11, 2 at `docstatus='CO'`, ALL `posted='N'`, 0 fact rows.
- Extend `PostingOracleTest.java` (or add a sibling test class next to it — the generate script rsyncs
  whatever is in `scripts/logic_oracle/` by name) with a step that does NOT create anything:
  load each CO `MCash`, run `DocManager.postDocument(ass, MCash.Table_ID, id, true, false, trxName)`,
  assert posted, `commit()`. Reuse `driveCO`'s posting half — the docs are already CO, do NOT re-processIt.
- Read `Doc_Cash.createFacts` FIRST (251 lines, org.compiere.acct) and write the manifest spec into
  HARDEN_MATRIX §W-POST-TAIL before coding: expect per-cashline legs vs `{CashBook.Asset}` /
  `{CashBook.CashTransfer}` / charge/expense variants — cite lines, don't guess. glassbowl already
  carries `c_cash`, `c_cashline` (amount), `c_cashbook_acct` (cb_asset/cb_cashtransfer/cb_receipt).
- Capture: extend `capture_post_b3_fixture.js` (or a small tail-fixture twin) with fact_acct(407) + any
  missing cashbook acct columns (ADDITIVE only). Manifest → `doc_poster.js` (`cash` basis) + diff band in
  `poc_post_tail.js` (same per-doc × schema × (account,side) integer-cent shape). maxDiff=0c gate.

### A-2 M_Inventory (ad_table_id 321) — complete + post the 3 existing draft physical inventories
- Facts: 3 real `m_inventory` DRAFTS client 11 (0 CO, 0 posted). In the test: load each MInventory,
  `processIt(CO)` via the engine (the internal postIt fires — CLIENT_ACCOUNTING='I'), assert
  posted, `commit()` per doc (the per-step-commit lesson: null-trx readers must see rows).
- Read `Doc_Inventory.createFacts` (523 lines) first — expect per-line DR/CR {Product.Asset} vs
  {Warehouse.Differences}|{Product.InventoryClearing} at the product cost (the W-FOLD-MOVEMENT cost hop:
  schema costingmethod → m_costelement → m_cost.currentcostprice). Charge-variant lines cite their branch.
- Gotchas already solved once — reuse, don't rediscover: completion may hit NOT-NULL-no-default columns
  (query information_schema first, the B-3 lesson) and period checks (auto period control is ON, ±100d,
  so current-date completion is fine; the DRAFTS carry old movementdates — if `testPeriodOpen` rejects
  them, set MovementDate/DateAcct to now BEFORE processIt and NAME that as seed-date normalization in
  the § log — it is input prep, not fact authoring).
- Same capture/manifest/witness flow as A-1. If a draft genuinely cannot complete (data invalid),
  ⛔ it BY NAME with the engine's own error and move on — 2/3 posted is an honest result.

### A-3 M_Production — ⛔ stance (do not reopen)
0 documents AND no component `m_cost` rows (the W-FOLD-PRODUCTION named deferral). Do NOT synthesize
costs. Only a future costed-BOM seed reopens this. Leave the ⛔ line in the matrix as-is.

### §A bank + regressions (non-negotiable)
- Re-run the WHOLE bundle listed above + poc_post_tail; all exit 0, logs READ.
- Bank: matrix row edit (ledger 52→54 if both land, headline count word), HARDEN_MATRIX §W-POST-TAIL
  DONE line, PROGRESS.md archive line. Every claim = a § line (Watchdog protocol).

## §B — ERPUserGuide: high-level navigation + the core S&D flow (docs/ERPUserGuide.md)
The guide today (1186 lines) is entry-points + POS/BIM/Ninja addons; the CORE trade cycle has no
walkthrough and there is no top-level map. Two sections to write, addons untouched:

### B-1 "The lay of the land" — high-level navigation (insert right after Quick start)
One screenful: the mental model in this order —
  bubbles front door → Login/tenant → the Bottom Pill Bar (link §3) → Windows/Tabs/Fields (link §4/§5)
  → the Process Button (link §6) → where documents live (Sales Order / Purchase Order / Shipment /
  Invoice / Payment windows) → where the books live (Posting Preview, Trial Balance, Financial Reports §8).
Rules: navigation ONLY (what is where and why), no feature marketing, every claim points at an existing
section or a live surface; a small mermaid map is welcome (docs render it). Match the guide's existing
voice (`feedback_user_guide_quality_bar` memory: quality bar + one-session-for-related-guides).

### B-2 "The standard flow — order to cash, procure to pay, books to reports" (new top-level section)
The S&D-standard cycle, told ONCE as a continuous story with the demo data, each step = do-it + what-
posted. Every step below is ALREADY live and oracle-proven — cite the witness in a footnote-style aside
so the guide inherits credibility without turning into a test report:
  1. **Sales Order** — create/complete (C_Order; completeIt fan-out W-FOLD-COMPLETE).
  2. **Shipment** — the generated M_InOut; on-hand drops (qty spine W-FOLD-QTYONHAND); COGS/Inventory GL
     (W-FOLD-INOUTGL).
  3. **Customer Invoice → AR** — fact lines DR Receivable / CR Revenue+Tax (W-POST-HARDEN, Posting Preview
     shows it live — W-DOC-POSTER).
  4. **Receipt & Allocation** — C_Payment then C_AllocationHdr incl. discount/write-off + VAT correction
     (W-FOLD-PAYMENT / W-FOLD-ALLOC).
  5. **Replenishment** — on-hand fell → ReplenishReport suggests the PO (W-FOLD-REPLENISH; the POS §P-4
     section already demos it — LINK, don't duplicate).
  6. **Purchase Order → Receipt → Vendor Invoice → Match** — PO (commitment ∅ by config, W-MORDER-POST),
     receipt, AP invoice DR InventoryClearing / CR V_Liability (W-FOLD-AP-INVOICE), M_MatchInv clearing
     (W-FOLD-MATCHINV), M_MatchPO's honest ∅ under Average costing (W-POST-TAIL).
  7. **Final accounts** — GL Journal for the manual leg (W-FOLD-GLJOURNAL), bank statement reconcile
     (W-POST-TAIL BankStatement), period close = the posted `fact_acct` journal, TB balances to the cent
     (test_report_fin 46574.97).
  8. **Financial reporting** — link §8 (Balance Sheet / Income Statement / Cash Flow oracle-equivalent,
     W-PA-REPORT) + NinjaExcel workbook.
- Fixed-asset & project postings (B-3's six classes) get ONE paragraph as "also in the books", not a
  walkthrough — they are core-adjacent, the walkthrough stays the trade cycle.
- Verify navigation claims against the LIVE surface (localhost per `feedback_localhost_full_building_url_testing`),
  not from memory; screenshots only where the guide already uses them.
### B-3 out of scope (explicit): POS/Kitchen/WH lenses, Tenancy/HR_BIM, 4D/5D scheduling, Ninja mode —
  already documented; do not restructure them this session.

## SESSION END
- Every §A/§B item ✅ or ⛔-with-the-one-question. Update THIS file's DONE appendix (§-lined), PROGRESS.md,
  push everything (zero local-only commits), PR + merge per the git note at top.

# DONE — 2026-07-18, Sonnet session (§A + §B both worked to zero). Every claim = a § line in
# `build/erp/generate_post_tail_oracle.log` / `build/erp/poc_post_tail.log` (exit 0, READ).

- **§A-1/§A-2 CLOSED, empirically — NOT the outcome this card predicted.** Read `Doc_Cash.createFacts`
  (Doc_Cash.java:150-249) and `Doc_Inventory.createFacts` (Doc_Inventory.java:211-513) first, wrote the
  manifest spec into `HARDEN_MATRIX.md §W-POST-TAIL-2` before coding (per Spec-First), then built the
  reusable machinery: `scripts/logic_oracle/PostingTailTest.java` (sibling of `PostingOracleTest.java`,
  same vendor OSGi harness) + `scripts/generate_post_tail_oracle.sh` (twin of `generate_post_oracle.sh`,
  scratch clone `idempiere_tail`) + `scripts/capture_post_tail_fixture.js` → `build/erp/oracle/
  post_tail_fixture.json`. Drove the REAL engine over the REAL 2 CO cash journals + 3 inventory drafts —
  ZERO seed authoring, every document already existed. Result: **both classes are ∅-by-DATA-STATE**,
  distinct from B-3's seed-generation and from MatchPO/Requisition's config-gates: `§TAILORACLE class=
  C_Cash record_id=100/101 isactive=N` (BOTH real docs — `Doc.java:591-605`'s lock UPDATE requires
  `IsActive='Y'`, `DocManager.postDocument` returns `"CannotPostInactiveDocument"`); `§TAILORACLE class=
  M_Inventory record_id=200000/200001 processIt_ok=false processMsg=@NoLines@` (zero lines each,
  `MInventory.java:401-406`); `§TAILORACLE class=M_Inventory record_id=100 ... postErr=Posting Error
  (No Costs for TShirt - Red Large)` (the 1 completable draft — product 147 has `currentcostprice=0`
  everywhere and 0 `M_CostDetail` rows, `Doc_Inventory.java:319-336`). **Neither blocker worked
  around** — flipping `IsActive` or seeding lines/costs onto an EXISTING document is data mutation, the
  same out-of-scope boundary this card itself drew for Inventory's `@NoLines@` docs (not a new judgment
  call, the consistent application of it). `doc_poster.js` gained `deriveCash` + `deriveInventory`
  anyway (full source-cited translations, reusable for any FUTURE active/costed document) and proved
  them LIVE via falsifier since no oracle-diff is possible: `§TAIL-FALSIFIER cash-live doc100_lines=2
  doc101_lines=4` (the manifest computes real non-empty legs — the ∅ is the `IsActive` gate, not a dead
  verb) and `§TAIL-FALSIFIER inv-bless-flip doc=100 before_lines=0 after_lines=2` (the manifest
  reproduces the SAME "No Costs" refusal, 0==0 non-vacuously, and a synthetic blessing row opens it).
  **Ledger STAYS 52 / 17-of-20 posters** (not 54 — the card's own optimistic headline was wrong; this is
  the corrected, evidence-based number). Whole regression bundle re-run green: `poc_post_b3` ·
  `poc_post_harden` · `poc_factacct_doc` · `poc_doc_poster` · `poc_morder_post` · `poc_alloc_fx` ·
  `poc_money_post` · `poc_matchinv_fx` · `poc_gljournal` · `poc_post_tail` · `test_report_fin` all exit 0,
  TB 46574.97/300 intact. Banked: `docs/internal/ERP_COVERAGE_MATRIX.md` (the W-POST-TAIL row extended +
  the "17 of 20" summary line corrected), `prompts/HARDEN_MATRIX.md` (§W-POST-TAIL-2 CLOSED band),
  `PROGRESS.md` (archive line + OPEN line updated).
- **§B-1/§B-2 DONE** — `docs/ERPUserGuide.md` gained **"The lay of the land"** (inserted after Quick
  start: a mermaid map + prose walking front-door → Login → Pill Bar → Windows/Tabs/Fields → Process
  Button → where documents live → where the books live, every claim pointing at an existing section) and
  **"The standard flow — order to cash, procure to pay, books to reports"** (inserted after §6 Process
  Button, before §7 POS, matching this guide's existing convention of unnumbered thematic sections
  interleaved with the numbered core-manual sections — renumbering the 15 numbered sections was
  considered and rejected as unnecessary blast radius for a doc-only change). All 8 steps told as one
  continuous story over the GardenWorld demo data (Sales Order → Shipment → Invoice/AR → Receipt &
  Allocation → Replenishment → PO/Receipt/Vendor-Invoice/Match → Final accounts → Financial reporting),
  each citing its real witness (W-FOLD-COMPLETE/QTYONHAND/INOUTGL/PAYMENT/ALLOC/REPLENISH/MORDER-POST/
  AP-INVOICE/MATCHINV/GLJOURNAL/POST-TAIL/PA-REPORT) plus a one-paragraph "also in the books" note for
  the B-3 fixed-asset/project classes. POS/Kitchen/WH/Tenancy/4D-5D/Ninja addon lenses untouched, per
  scope. Verified: `mkdocs build --strict` clean (no new broken anchors/warnings vs. the pre-existing
  HRBIMAssetGuide.md ones), mermaid fence syntax matches the one other file already using it
  (`docs/internal/FoldEngineQuality.md`) — confirms the pattern is established, not novel.
- **Housekeeping:** this card's own DONE appendix is the record (per `feedback_prompt_file_organization`
  rule 0 — a session working a `prompts/#.md` file updates only that file, not `MEMORY.md`).
