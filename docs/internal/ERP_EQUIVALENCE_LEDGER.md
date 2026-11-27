# ERP Equivalence Ledger — the enumerable 53-oracle-equivalent list
<!-- headline corrected 52 -> 53 on 2026-09-04 (E-15): see "Reconciliation" below — the extra row is #26 W-FOLD-INOUTGL, whose witness post-dates the "41" baseline by one day. -->

**Why this file exists:** `docs/ERP_PROJECT_REVIEW.md` §2 finding #3 (2026-08-12) flagged that the
"52 oracle-equivalent" headline in `docs/internal/ERP_COVERAGE_MATRIX.md`'s "Second axis — EQUIVALENCE"
section was maintained as **prose increments** (41→42→43→49→52, each cited only in a sentence) with **no
numbered list and no bundle runner** — "the number cannot be independently recounted from the table." This
file is that numbered list. `build/erp/run_bundle.sh` re-runs every TALLY row's witness script. This is
`prompts/RESUME_ERP_T0_TRUTH_MAINTENANCE.md` item 1.

**Source:** `docs/internal/ERP_COVERAGE_MATRIX.md` §"Second axis — EQUIVALENCE (oracle-diffed)", the `| ✅
**oracle-equivalent** | ... |` rows only (lines 60-113 at the time this was built). Does **not** include the
"Third axis — ADDON LENSES" section (POS/Spatial/Warehouse, explicitly a separate ledger that "does NOT
change the 42-surface tally") or the 3 `🟡 recipe-equivalent`/`🟡 rule-consistent` rows (Δ-A backflush,
MProduction, MInventory — proven against a synthesized/no-oracle recipe, one tier below `✅
oracle-equivalent`, never counted in this ledger).

## How to regenerate this table (re-derivable, not hand-maintained)

```bash
grep -n "^| ✅ \*\*oracle-equivalent\*\*" docs/internal/ERP_COVERAGE_MATRIX.md
```
Each match is one raw row. Extract the leading bold name via:
```bash
sed -E 's/^([0-9]+):\| ✅ \*\*oracle-equivalent\*\* \| \*\*([^*]+)\*\*.*/\1: \2/'
```
(2 rows — #1 and #49 below — contain a nested single-`*`-italic inside their bold span and need the name
pulled by hand; everything else matches cleanly.) The witness ID is the first `W-[A-Z0-9-]+` token in the
row. The script path is `scripts/<basename-of-the-cited-.log>.js`, falling back to `build/erp/<basename>.js`
— verify with `[ -f <path> ]` before trusting it; do not assume the doc's citation is current.

## The list (49 raw rows)

| # | Witness ID | Surface | Script | Log | Tally? | Surfaces | Re-verified 2026-08-24 |
|---|---|---|---|---|---|---|---|
| 1 | — | Trial-balance / posting-read | `scripts/test_report_fin.js` | `build/erp/test_report_fin.log` | Y | 1 | |
| 2 | W-MIGRATE-POSTCFG | Migrated-tenant POSTING CONFIG (MIGRATE_POSTING_CONFIG, 2026-06-12) | `scripts/poc_migrate_postcfg_idmp.js` | `build/erp/poc_migrate_postcfg_idmp.log` | **N** (evidence row) | 0 | |
| 3 | W-P4-MASTERS | P4 Odoo master data extraction (2026-06-14) | `build/erp/gen_ad_odoo.js` | `build/erp/gen_ad_odoo.log` | **N** (evidence row) | 0 | |
| 4 | W-P4-BUYSIDE-LIVE | P4 Odoo live buy-side fold (2026-06-14) | `scripts/poc_p4_buyside_live.js` | `build/erp/poc_p4_buyside_live.log` | **N** (evidence row) | 0 | |
| 5 | W-POST-HARDEN | Per-document GL derivation (H-1 keystone) | `scripts/poc_post_harden.js` | `build/erp/poc_post_harden.log` | Y | 1 | ✓ PASS |
| 6 | W-FOLD-COMPLETE | `completeIt(C_Order)` full posting chain (F-1 keystone) | `scripts/poc_fold_complete.js` | `build/erp/poc_fold_complete.log` | Y | 1 | |
| 7 | W-FOLD-PAYMENT | Doc_Payment receipt (F-2 MPayment) | `scripts/poc_money_post.js` | `build/erp/poc_money_post.log` | Y | 1 | |
| 8 | W-FOLD-ALLOC | Doc_AllocationHdr incl. VAT tax-correction | `scripts/poc_alloc_post.js` | `build/erp/poc_alloc_post.log` | Y | 1 | ✓ PASS |
| 9 | W-FOLD-ALLOC-FX | Foreign-currency Doc_AllocationHdr (2nd acctschema) | `scripts/poc_alloc_fx.js` | `build/erp/poc_alloc_fx.log` | Y | 1 | |
| 10 | W-FOLD-QTYONHAND | StorageOnHand QTY spine | `scripts/poc_qtyonhand.js` | `build/erp/poc_qtyonhand.log` | Y | 1 | |
| 11 | W-FOLD-MOVEMENT | Inter-org M_Movement posting | `scripts/poc_movement.js` | `build/erp/poc_movement.log` | Y | 1 | |
| 12 | W-FOLD-MOVEMENT-FX | Inter-org M_Movement, EUR schema 200000 | `scripts/poc_movement_fx.js` | `build/erp/poc_movement_fx.log` | Y | 1 | |
| 13 | W-FOLD-MATCHINV | M_MatchInv posting — matched-clearing loop | `scripts/poc_matchinv.js` | `build/erp/poc_matchinv.log` | Y | 1 | ✓ PASS |
| 14 | W-FOLD-MATCHINV-FX | M_MatchInv, EUR schema 200000 | `scripts/poc_matchinv_fx.js` | `build/erp/poc_matchinv_fx.log` | Y | 1 | |
| 15 | W-FOLD-INVOICE | Standalone `completeIt(C_Invoice)` doc-action | `scripts/poc_invoice_complete.js` | `build/erp/poc_invoice_complete.log` | Y | 1 | |
| 16 | W-FOLD-AP-INVOICE | Vendor `Doc_Invoice` GL derivation (purchase manifest) | `scripts/poc_invoice_post_ap.js` | `build/erp/poc_invoice_post_ap.log` | Y | 1 | |
| 17 | W-FOLD-REPLENISH | Δ-B replenishment PO (ReplenishReport) | `scripts/poc_replenish.js` | `build/erp/poc_replenish.log` | Y | 1 | |
| 18 | W-FOLD-GLJOURNAL | Manual GL_Journal posting incl. inter-org balancing | `scripts/poc_gljournal.js` | `build/erp/poc_gljournal.log` | Y | 1 | |
| 19 | W-FOLD-REVERSE | reverseCorrect / void DocAction family | `scripts/poc_reverse.js` | `build/erp/poc_reverse.log` | Y | 1 | ✓ PASS |
| 20 | W-VALRULE-HARDEN | AD_Val_Rule SQL-where engine (H-3) | `scripts/poc_valrule_harden.js` | `build/erp/poc_valrule_harden.log` | Y | 1 | |
| 21 | W-REFERENCE-HARDEN | AD_Ref_Table FK engine (H-3) | `scripts/poc_reference_harden.js` | `build/erp/poc_reference_harden.log` | Y | 1 | |
| 22 | W-ACCESS-HARDEN | AD role/access gate — MRole (H-3) | `scripts/poc_access_harden.js` | `build/erp/poc_access_harden.log` | Y | 1 | ✓ PASS |
| 23 | W-CALLOUT-HARDEN | AD_Column.Callout derive engine (H-3) | `scripts/poc_callout_harden.js` | `build/erp/poc_callout_harden.log` | Y | 1 | |
| 24 | W-FACTACCT-DOC | Per-document oracle-capture fidelity (H-1.1) | `scripts/poc_factacct_doc.js` | `build/erp/poc_factacct_doc.log` | Y | 1 | |
| 25 | W-MORDER-POST | MOrder `Doc_Order` posting, LINE granularity (H-1.2) | `scripts/poc_morder_post.js` | `build/erp/poc_morder_post.log` | Y | 1 | |
| 26 | W-FOLD-INOUTGL | Cost-valued inventory GL as an engine verb (P2.3) | `scripts/poc_fold_inout_gl.js` | `build/erp/poc_fold_inout_gl.log` | Y | 1 | |
| 27 | W-MORDER-SAVE | MOrder.beforeSave invariants (H-1.3) | `scripts/poc_morder_save.js` | `build/erp/poc_morder_save.log` | Y | 1 | |
| 28 | W-MORDER-FSM | MOrder FULL DocAction FSM (H-1.4) | `scripts/poc_morder_fsm.js` | `build/erp/poc_morder_fsm.log` | Y | 1 | ✓ PASS |
| 29 | W-MINOUT-SAVE | MInOut.beforeSave invariants (H-2.1) | `scripts/poc_minout_save.js` | `build/erp/poc_minout_save.log` | Y | 1 | |
| 30 | W-MINOUT-FSM | M_InOut per-table DocAction FSM (H-2.1) | `scripts/poc_minout_fsm.js` | `build/erp/poc_minout_fsm.log` | Y | 1 | |
| 31 | W-MINVOICE-SAVE | MInvoice.beforeSave invariants (H-2.2) | `scripts/poc_minvoice_save.js` | `build/erp/poc_minvoice_save.log` | Y | 1 | |
| 32 | W-MINVOICE-FSM | C_Invoice per-table DocAction FSM (H-2.2) | `scripts/poc_minvoice_fsm.js` | `build/erp/poc_minvoice_fsm.log` | Y | 1 | |
| 33 | W-MPAYMENT-SAVE | MPayment.beforeSave invariants (H-2.3) | `scripts/poc_mpayment_save.js` | `build/erp/poc_mpayment_save.log` | Y | 1 | |
| 34 | W-MPAYMENT-FSM | C_Payment per-table DocAction FSM (H-2.3) | `scripts/poc_mpayment_fsm.js` | `build/erp/poc_mpayment_fsm.log` | Y | 1 | |
| 35 | W-MINVENTORY-FAMILY-FSM | Inventory-family FSM — Movement+Inventory+Production (H-2.4) | `scripts/poc_minventory_family_fsm.js` | `build/erp/poc_minventory_family_fsm.log` | Y | 1 | ✓ PASS |
| 36 | W-MJOURNAL-FSM | GL Journal family FSM — Journal+JournalBatch | `scripts/poc_mjournal_fsm.js` | `build/erp/poc_mjournal_fsm.log` | Y | 1 | |
| 37 | W-MJOURNAL-SAVE | MJournal+MJournalBatch.beforeSave | `scripts/poc_mjournal_save.js` | `build/erp/poc_mjournal_save.log` | Y | 1 | |
| 38 | W-MALLOCHDR-FSM | C_AllocationHdr per-table FSM | `scripts/poc_mallochdr_fsm.js` | `build/erp/poc_mallochdr_fsm.log` | Y | 1 | |
| 39 | W-MALLOCHDR-SAVE | MAllocationHdr.beforeSave | `scripts/poc_mallochdr_save.js` | `build/erp/poc_mallochdr_save.log` | Y | 1 | |
| 40 | W-MCASH-FSM | C_Cash per-table FSM | `scripts/poc_mcash_fsm.js` | `build/erp/poc_mcash_fsm.log` | Y | 1 | |
| 41 | W-MCASH-SAVE | MCash.beforeSave | `scripts/poc_mcash_save.js` | `build/erp/poc_mcash_save.log` | Y | 1 | |
| 42 | W-MBANKSTMT-FSM | C_BankStatement per-table FSM | `scripts/poc_mbankstatement_fsm.js` | `build/erp/poc_mbankstatement_fsm.log` | Y | 1 | |
| 43 | W-MBANKSTMT-SAVE | MBankStatement.beforeSave | `scripts/poc_mbankstatement_save.js` | `build/erp/poc_mbankstatement_save.log` | Y | 1 | |
| 44 | W-GENERIC-TAIL-FSM | Generic-block document tail FSM — 11 classes | `scripts/poc_generic_tail_fsm.js` | `build/erp/poc_generic_tail_fsm.log` | Y | 1 | ✓ PASS |
| 45 | W-GENERIC-TAIL-SAVE | Generic-tail beforeSave — MRMA+MRequisition+MTimeExpense | `scripts/poc_generic_tail_save.js` | `build/erp/poc_generic_tail_save.log` | Y | 1 | |
| 46 | W-LOGIC-HARDEN | AD logic-expression evaluator (B-1) | `scripts/poc_logic_harden.js` | `build/erp/poc_logic_harden.log` | Y | 1 | |
| 47 | W-WF-HARDEN | AD_Workflow node-walk + state engine (B-2) | `scripts/poc_wf_harden.js` | `build/erp/poc_wf_harden.log` | Y | 1 | ✓ PASS |
| 48 | W-POST-B3 | 0-seed posting oracles — **6 G-seed classes bundled in this row** (B-3) | `scripts/poc_post_b3.js` | `build/erp/poc_post_b3.log` | Y | **6** | ✓ PASS |
| 49 | W-POST-TAIL | Doc_\* poster tail — **BankStatement+MatchPO+Requisition bundled in this row** (Cash+Inventory also closed by this witness but explicitly don't add to the count — "ledger STAYS 52") | `scripts/poc_post_tail.js` | `build/erp/poc_post_tail.log` | Y | **3** | ✓ PASS |

All 49 script paths verified to exist on disk (2026-08-24, `[ -f <path> ]` per row). An initial spread of
11 (across early/mid/late rows plus both bundled rows) was re-run individually first: **11/11 PASS**. Then
`build/erp/run_bundle.sh` (below) was run for real over all 46 tally-row scripts: **46/46 PASS, 0 FAIL, 0
MISSING** (`build/erp/run_bundle.log`, 2026-08-24; exit code of the bundle script itself is 0). The 3
evidence-only rows were not included in that run (they're skipped by default — `--all` includes them).

## Reconciliation — does raw arithmetic actually hit 52?

- **Raw rows in the table:** 49.
- **Evidence rows (explicitly marked "*(Evidence row — ... does not change the ... tally)*" in the source
  text, rows #2-#4):** 3. These exercise already-counted surfaces on new tenants/extraction paths; they do
  not add to the equivalence count.
- **Tally rows:** 49 − 3 = **46**.
- **Bundled rows** (one markdown row representing multiple counted surfaces, per the source's own `ledger
  N→M` annotations): row #48 (W-POST-B3) = **6** surfaces in one row; row #49 (W-POST-TAIL) = **3** surfaces
  in one row (Cash+Inventory closed by the same witness explicitly do NOT add further — "ledger STAYS 52").
- **Single-surface tally rows:** 46 − 2 (the two bundled rows) = 44, each contributing 1.
- **Surfaces claimed, summed mechanically:** 44 (singles) + 6 (row 48) + 3 (row 49) = **53**.

**The mechanical 53 is right and the headline 52 is one short. RESOLVED 2026-09-04 (E-15), and the
extra row is named.** The source docs' own `ledger N→M` annotations chain to 52 (`41` baseline before B-1 →
`+1` W-LOGIC-HARDEN → `+1` W-WF-HARDEN ("42→43") → `+6` W-POST-B3 ("43→49") → `+3` W-POST-TAIL ("49→52")),
but that "41" baseline is *asserted* in `prompts/HARDEN_MATRIX.md:93`, not recounted — and the pre-B1 span
of this table (rows #1, #5-#45, excluding the 3 evidence rows #2-#4) mechanically holds **42** single-surface
rows, not 41.

**The extra row is #26, `W-FOLD-INOUTGL` (`scripts/poc_fold_inout_gl.js`, "Cost-valued inventory GL as an
engine verb", Y-tally, 1 surface).** It is not a double count and nothing is inflated — it is a row that
**did not exist yet** when the baseline was written:

| fact | value | how it was checked |
|---|---|---|
| the "41 oracle-equivalent" baseline was written | **2026-06-13**, commit `b8db32887` | `git log -S'41 oracle-equivalent' -- prompts/HARDEN_MATRIX.md` |
| `scripts/poc_fold_inout_gl.js` first appears | **2026-06-14**, commit `6bbde05bc` | `git log --diff-filter=A -- scripts/poc_fold_inout_gl.js` |
| every other pre-B1 tally row's witness | on or before 2026-06-13 | the same `--diff-filter=A` sweep over all 42 rows |

So the surface W-FOLD-INOUTGL proves **could not** have been inside "41" — it was added to the table one day
later, with no matching `ledger N→M` note. The baseline should read **42**, and
42 + 1 + 1 + 6 + 3 = **53**, which is exactly the mechanical count above.

**Consequence:** the headline is **53 oracle-equivalent surfaces**, not 52. This confirms rather than
weakens `docs/ERP_PROJECT_REVIEW.md` §2 finding #3 — it was "bookkeeping fragility, not inflation", and the
fragility ran one row *under*, never over. The one row is the only surface in this table whose witness
post-dates the milestone that was supposed to contain it, so the count is now recomputable from the table
alone and cannot drift again the same way.

## `build/erp/run_bundle.sh`

Runs every **Y-tally** script above (46 scripts covering the 53 surfaces-claimed count above; the 3
evidence rows are skipped by default — pass `--all` to include them) via the existing `run_witness.sh`
convention, tallies PASS/FAIL, writes `build/erp/run_bundle.log`. See the script for usage.

## CI gap (named, not closed this pass)

`.github/workflows/ci.yml` / `scripts/system_is_real.sh` run exactly 1 of these witnesses
(`poc_morder_fsm.js`) as part of the headless smoke subset. This project's own `docs/archive/
TestArchitecture.md` §Truth Model states "GREEN before commit" for the full gate suite
(`RosettaStoneGateTest`) is a **local discipline, not automation** — the same philosophy likely applies here
(46 witnesses include several that need a live docker Postgres / `~/idempiere-dev-setup` checkout /
`~/bim-ootb` playwright harness that CI does not provision). Wiring `run_bundle.sh` into CI wholesale is a
separate decision (needs those external dependencies available in the runner, or a CI-safe subset carved
out) — named here as the next step, not attempted in this pass.


## §PORT-COVERAGE 2026-10-04 — iDempiere hand-written logic vs our in-browser ERP, X-of-N by bucket

**Question (user, 2026-10-04):** "How can business logic be not more than 40k? … hardcoded, the hidden traps of code, and
need to faithfully convert to our framework while maintaining the same AD operation." Hypothesis tested, not assumed:
*our small size is mostly un-ported logic, not concision.*

**What this section is NOT:** the 53-surface list above counts *oracle-diffed surfaces* (headless). This section counts the
*iDempiere logic inventory* (N) and how much of it runs on the shipped UI path (X). The two are different axes; a surface
can be oracle-equivalent headless and still be absent from the page.

**Sources / how measured (all commands saved under `/tmp/claude-1000/ledger/`, logs named per row):**
- iDempiere: `/home/red1/idempiere-dev-setup/idempiere` @ `87968daa73` (2026-01-16). Non-comment (nc) lines = blank, `//`, `/* */`
  stripped (`loc.py`, string-aware). Live DB: docker postgres `idempiere`/schema `adempiere`.
- Ours SHIPPED = `bim-ootb` `origin/main` @ `fcaaa4115b69` `erp/` extracted with `git archive` (no checkout). Ours ENGINE = `~/bim-compiler/build/erp`
  + `scripts/`. "Wired" = reachable from `erp/idempiere.html` / `crud_overlay.js` / `crud_core.js` on the live save/doc-action path (grep-verified, cited).
- `crud_overlay.js`/`crud_core.js`/`ad_ui.js`/`idempiere.html` were being edited by another worker during this pass; all
  statements about them are as of `origin/main` @ `fcaaa4115b69` and may be superseded. The generic-AD-window DocAction path is NOT counted.
- Status vocabulary: **WIRED+WITNESSED** (on the page path with a live witness) · **HEADLESS-ONLY** (proven in `scripts/`/`build/erp`, never loaded by a page) · **ABSENT**.

### Size ledger (fair basis: non-comment lines)

| bucket | files | lines | nc lines | log |
|---|---|---|---|---|
| iDempiere whole Java tree | 4,465 | 1,428,194 | 789,093 | `misc_counts.log` |
| generated `X_*` (760) + `I_*` (761) | 1,521 | 576,460 | 246,863 | `xi_counts.log` |
| ZK UI `org.adempiere.ui.zk` | 588 | 189,864 | 128,825 | `misc_counts.log` |
| **hand-written business logic** = `model/M*.java` (489) + `acct` (35) + `process` (37+196) + `wf` (19) + `callout` (47) | 823 | **263,371** | **167,596** | `loc_model_split.log`, `loc_java_dirs.log` |
| ours shipped `erp/*.js`+`*.html` (excl. vendored libs) | 104 | 43,544 | 33,882 | `ours_loc.log` |
| ours shipped **business-rule engines** (22 files: `ad_{access,callout,docfsm,evaluator,modelval,modelval_bridge,process,valrule,parser,data}`, `post_resolver`, `doc_poster`, `erp_engine`, `rule_fold`, `doc_cycle_validator`, `erp_postings`, `erp_period_close`, `accts_posted`, `erp_preview`, `bigdecimal`, `inout_confirm`, `crud_core`) | 22 | 7,799 | **5,644** | `ours_loc.log` |
| ours headless-only rule modules (17, `build/erp`, not in `origin/main`) | 17 | 2,023 | 1,260 | `headless_loc.log` |
| ours ledger witness scripts (48, carry posting derivations that are in no shipped file) | 48 | 7,331 | 5,248 | `headless_loc.log` |

Ratio shipped rule-engine nc / iDempiere hand-written nc = 5,644 / 167,596 = **3.4%**.

### THE TABLE — one row per iDempiere area

| # | area | iDempiere lines (nc) | iDempiere N | ours: lines (nc) + rule rows | X ported | status of the X | evidence |
|---|---|---|---|---|---|---|---|
| 1a | Model save hooks, by class | `M*.java` 169,747 (103,256); hook bodies only: 7,647 nc | **225** of 489 M classes have ≥1 of beforeSave/afterSave/beforeDelete/afterDelete | `ad_modelval.js` 863 (683); 70 registered hook fns (node load of all `install*SaveHooks`, `mvcount.log`) | **15 / 225** (6.7%) have ANY ported hook; only **6 / 225** have ALL their hooks ported (MMovement, MJournalBatch, MCash, MBankStatement, MRMA, MBPartnerLocation — each has beforeSave only). MOrderLine + MInvoiceLine = qty>0 only (partial) | WIRED+WITNESSED (BEFORE_SAVE only) | `hooks.log`; `ported_hook_classes.log`; installer sweep `crud_overlay.js:1943-1960`; fire site `crud_overlay.js:2083`; `build/erp/poc_ad_modelval_live.log` PASS 2026-08-24 (`§AD-MODELVAL-LIVE ... registry=13 ... fired=12`) |
| 1b | Model save hooks, by method | 7,647 nc | **386** methods: beforeSave 192 (5,097 nc) · afterSave 100 (1,787) · beforeDelete 39 (361) · afterDelete 55 (402) | same | beforeSave **15/192** (7.8%, 914 nc Java) · afterSave **0/100** · beforeDelete **0/39** · afterDelete **0/55** → **15/386 (3.9%)** | beforeSave WIRED; the other 3 timings HEADLESS-ONLY (engine has `AFTER_SAVE/BEFORE_DELETE/AFTER_DELETE` slots, nothing registered, nothing fires them: `fireHooks(` appears once in shipped code, `crud_overlay.js:2083`, literal `'BEFORE_SAVE'`) | `hooks.log`; `ad_modelval.js:24` TIMINGS; grep `BEFORE_COMPLETE\|BEFORE_PREPARE\|BEFORE_VOID` over shipped `erp/*.js` = 0 hits outside `ad_modelval.js` |
| 1c | Doc-timing validators (BEFORE_COMPLETE etc.) | (inside completeIt) | — | `ad_modelval.js:59-68` MOrder.hasLines, MOrder.totalNonNegative | 2 hooks | **HEADLESS-ONLY** — the UI doc-action path never calls `fireHooks('BEFORE_COMPLETE')` | `poc_modelval.log` PASS 2026-09-03; no caller in `crud_core.js`/`crud_overlay.js` |
| 2a | Document actions — classes | 25 `DocAction` classes (MOrder, MInOut, MInvoice, MPayment, MJournal, MJournalBatch, MMovement, MInventory, MProduction, MAllocationHdr, MBankStatement, MCash, MRMA, MRequisition, MTimeExpense, MInOutConfirm, MMovementConfirm, MDepositBatch, MBankTransfer, MProjectIssue, MAsset×4, MDepreciationEntry); 11 action methods each = 275; **6,674 nc** in those methods (completeIt alone 2,458 nc; MInOut.completeIt 485 nc) | **25 classes / 275 action methods** | `ad_docfsm.js` 320 (204) generic status machine (14 actions × 12 statuses) + `erp_engine.js` 367 (328) completeOrder/completeInvoice/completeReceipt | **status gating: 4 / 25** tables (c_order, m_inout, c_invoice, c_payment — `crud_ops.json` `docAction`); **completeIt consequence fan-out: 3 / 25** (MOrder, MInvoice, MInOut-receipt-only); prepareIt 0/25, voidIt 0/25, reverseCorrect 0/25 with consequences | status gating WIRED+WITNESSED; fan-out WIRED+WITNESSED for 3; FSM for the other 21 + all reversals **HEADLESS-ONLY** | `docact.log`; `build/erp/poc_ad_docfsm_live.log` PASS 2026-09-02; `crud_overlay.js:2521-2622` (completeOrder/completeReceipt callers); `erp_engine.js:238` `reversePosting` has **no caller** in shipped code; ledger rows 28-45 (headless FSM) |
| 3 | Posting `Doc_*` | `acct` 21,448 (15,338 nc), 20 `Doc_*` classes | **20** doc classes that post (+2 with no poster by design: BankTransfer, DepositBatch) | shipped `doc_poster.js` 125 (74) + `post_resolver.js` 102 (61) + `erp_preview.js` 114 (67). **Forked:** `scripts/doc_poster.js` 642 lines covers 14 | **in shipped UI: 2 / 20** (Invoice, Order — Posting-Preview only; `fact_acct` is read back from the captured seed, never written by the page). **Headless, oracle-diffed value=0c: 15 / 20** non-empty (Invoice, Order, Payment, Allocation, Movement, MatchInv, GLJournal, InOut-cost, BankStatement, 5 Fixed-Asset, ProjectIssue). **∅-proven by config/data-state: 4** (MatchPO, Requisition, Cash, Inventory). **Recipe-only, no oracle: 1** (Production) | 2 WIRED+WITNESSED · 18 HEADLESS-ONLY · 0 ABSENT. Payment/Allocation/Movement/MatchInv/GLJournal/InOut derivations live **only inside `scripts/poc_*.js`** (94-182 lines each), in no shipped file | `poc_post_b3.log` (`§B3-POST ... maxDiff=0c` ×6), `poc_post_tail.log` (`§TAIL-POST`), ledger rows 5-26,48,49; `scripts/doc_poster.js:614-632` vs `ootb erp/doc_poster.js:111-112`; `doc_poster.js` shipped has 0 hits for `glOf`/`glCategoryFor` (§P9 GL_Category absent from page) |
| 4 | Callouts | `org.adempiere.base.callout` 9,010 (5,879) + `model/Callout*` ; 46 classes extend CalloutEngine, 16 `IColumnCallout`, 12 `@Callout`; 146 callout methods | live DB: **284** `AD_Column` rows with Callout (277 active); **145 distinct** callout strings | `ad_callout.js` 178 (117); 7 registered handlers (`reg.log`); `erp_rules.db` 284 CALLOUT rows = **stubs** (handler bodies unwritten; `handler_backlog` 145 `unwritten`) | distinct **7 / 145** (4.8%); AD_Column rows fully covered **25 / 284** (8.8%), ≥1 covered 28 | WIRED+WITNESSED (CalloutOrder/Invoice amt·qty·product, CalloutEngine.dateAcct); other 138 **ABSENT** | `match_ported.log`; `reg_callouts.txt`; `crud_overlay.js:526-540` `installDefaultHandlers`; `poc_callout_harden.log`; `erp_rules.db` `handler_backlog` |
| 5 | Processes | `org/compiere/process` 9,456 (5,310) + `org.adempiere.base.process` 46,342 (33,123) | AD_Process **476** rows (451 active): **337** with classname (320 active; 325 distinct), 119 report, 4 procedure, 29 with `AD_Workflow_ID`; 271 `SvrProcess` subclasses in base+process | `ad_process.js` 1,061 (744); 9 real-classname handlers + 9 `report:` regex keys (`reg_process.txt`) | classname rows **12 / 337** (3.6%) = 9 distinct classnames (InvoiceGenerate×2, InOutGenerate×2, FactAcctReset×2, ProjectGenOrder, CreateFromInvoice, Aging, TrialBalance, ImportBPartner, DocumentTypeVerify); ≈464 of 476 rows have no handler (the up-to-9 regex-resolved report rows are not individually enumerated — ESTIMATE bound) | WIRED+WITNESSED; remaining ≈325 **ABSENT** (prior figure "454 of 476 deferred" re-measured as 464 of 476 rows / 325 of 337 classname rows) | `match_ported.log`; `idempiere.html:2436-2460` `_ensureProcHandlers`; `poc_ad_process_live.log` PASS 2026-09-04; `db_counts.log` |
| 6 | Model validators / event handlers | 9 classes (`ModelValidator`/`AbstractEventHandler`, 1,559 nc) + 3 `EventTopicDelegate` (AddressValidation, AttributeInstance, **AutoProduce**) + `org/adempiere/base/event` 78 files (2,265 nc); registrations: 19 `registerTableEvent`, 6 `addModelChange`, 2 `addDocValidate`, 2 `registerEvent` | **9 classes + 3 delegates**; AD_ModelValidator rows **3** (Libero, FixedAssets, ProductPrice) | `ad_modelval_bridge.js` 115 (55) bridges the AD table to the plugin host; 3 demo plugins (`plugins/*.mjs`) are not ports | **0 / 12** — grep for ProductPriceValidator, SalesMgmtValidator, AutoProduce, AttributeInstance, RequestEventHandler, SchedulerModelEventHandler, LiberoValidator over shipped `erp/*.js`+`plugins/` = 0 hits | bridge WIRED (`§MODELVAL_AUTOINSTALL`); every Java body **ABSENT** (`ad_modelval.js` header: "Java bodies named-deferred") | `events_callouts.log`; `misc_counts.log`; `crud_overlay.js:1962-1976` |
| 7 | Workflows | `wf` 7,368 (4,690; MWFActivity 1,586 nc) | AD_Workflow **58** (P=29 doc-action `Process_*`, G=18, W=6, M=4, V=1); nodes 262 (96 are `D` doc-action nodes); transitions 207 | `ad_workflow.js` 166 (115) **not in `origin/main`**; shipped seed has **no `AD_Workflow`/`AD_WF_Node` table**; `erp_rules.db` 58 WF rows (preset data, build-only) | **0 / 58 wired.** Headless: node-walk engine W-WF-HARDEN | **HEADLESS-ONLY**; and our DocAction **bypasses workflow**: `crud_core.js:209-221` `AdDocFsm.dispatch` → SET_STATUS. iDempiere real path: DocAction column → `AbstractADWindowContent.java:3766-3812` → `executeButtonProcess` → `ServerProcessCtl.java:220-222 startWorkflow` → MWFProcess nodes (Start→DocAuto→DocPrepare→DocComplete in `Process_Order`). So the **workflow-mediated** behaviours (DocAuto, approvals, responsible routing, WindowValidator BEFORE/AFTER_DOC_ACTION) are not reproduced | `db_counts.log`/`db_counts2.log`; `poc_wf_harden.log` PASS; `ours_seed_counts.log` (`no such table: AD_Workflow`) |
| 8a | Document numbering | `MSequence.java` 1,525 (1,095); hard-coded in `PO.java:3149-3162,3579-3603` (`columnName.equals("DocumentNo")` / `Value`) | `AD_Sequence` **1,458** rows (375 auto non-table-id) | `crud_overlay.js:2809-2860` `_allocDocNo`/`_previewDocNo` (CurrentNext, IncrementNo, Prefix, Suffix; seed has 205 seq rows) | partial: prefix/suffix/increment/doctype-sequence | WIRED; **absent**: `StartNewYear`/`StartNewMonth`, `@Year@`/decimal pattern, `FOR UPDATE` row lock (`MSequence.java:176-188`); sequence `CurrentNext` is bumped *outside the op-log* (own comment `crud_overlay.js:2809-2811`) → not replay-stable | grep of `crud_overlay.js` for `startnewyear\|decimalpattern` = 0 |
| 8b | Costing | `MCost` 1,945 (1,430) + `MCostDetail` 2,109 (1,508) + `MCostElement`/`Queue`/`History`/`Type` (840 nc) ≈ 3,780 nc; `DocLine.java:791-831` | costing methods × levels per product/schema | `erp_engine.js:319` `deferred = ['costing(M_CostDetail)', 'reservation(...)']`; cost-valued inventory GL headless (W-FOLD-INOUTGL) | 0 | ABSENT on page; cost-valued GL HEADLESS-ONLY | `erp_engine.js:319`; ledger row 26 |
| 8c | Tax | `Tax.java` 854 (489) + `MTax` 432 (259) | tax determination: category, bill/ship location, org location, IsTaxExempt/IsPOTaxExempt | `crud_overlay.js:382-400` (Tax.get transcribed) | UI-callout level only; header tax lines not regenerated (no afterSave → `MOrderLine.java:999`/`MInvoiceLine.java:1046` `updateHeaderTax` never runs) | partial WIRED | `crud_overlay.js:382`; `hooks.log` (0/100 afterSave) |
| 8d | Price-list version / pricing | `MProductPricing` calculatePrice/PLV/discount `:116-729`; `MPriceList.java:332` | M_PriceList_Version by valid date, discount schema | `ad_modelval.js:256,422` "named-deferred"; `crud_overlay.js:921` partial PLV lookup | partial | named-deferred in model hooks; partial in UI | cited lines |
| 8e | Data access (MRole) | `MRole.java` 3,533 (2,600): `addAccessSQL :2074`, `isRecordAccess :1565`, `checkAccessSQL :3496` | AD_Role 5; window_access 1,303, process_access 1,309, table_access 1, record_access 0, column_access 0 (live) | `ad_access.js` 164 (97) | org/client scope + window/menu grants; **no record/column/table-access SQL injection** | WIRED+WITNESSED (`poc_ad_access_live.log` PASS 2026-08-24) for window scope; record/column ABSENT | `db_counts2.log` |
| 8f | Virtual `ColumnSQL` columns | `POInfo.java:158-207` (select expression) | **66** live (65 in seed) | none: 0 hits for `columnsql` in shipped `erp/*.js`+`idempiere.html` | **0 / 66** | **ABSENT** (values silently null) | `db_counts2.log`; grep |
| 8g | `@SQL=` defaults / logic | `Evaluator.java:139-148`, `GridField` | **150** `@SQL=` defaults (148 in seed); 289 ReadOnlyLogic; 2,588 field DisplayLogic; 35 tab DisplayLogic | `ad_evaluator.js` 307 (239): returns `{sql:true}` and drops; `crud_core.js:795` drops "unevaluated expression (@SQL=…)"; `ad_valrule.js:31` `sql-token` named-deferred | `@SQL=` **0 / 150**; DisplayLogic/ReadOnlyLogic evaluator WIRED (W-AD-LOGIC-LIVE PASS 2026-09-04) | split | cited lines |
| 8h | AD_Preference defaults, translations | `_trl` tables 74; AD_Preference 17 | | seed carries 38 / 74 `_trl` tables; AD_Preference 11 / 17; AD_Message absent from seed (i18n packs substitute) | partial | WIRED for menu/ref-list/window (`ad_data.js:358`, `idempiere.html:1352`); field-label `_Trl` coverage **not measured** | `ours_seed_counts.log` |
| 8i | Val rules | AD_Val_Rule **332** (all type S) | 332 | `ad_valrule.js` 139 (85); `erp_rules.db` 331 VALRULE rows (preset) | 332 / 332 membership, diffed to live PG | WIRED+WITNESSED (`W-VALRULE-HARDEN`, `poc_parity_valrule_live.js`) | ledger row 20 |
| 9a | Generated `X_*`/`I_*` | 576,460 (246,863) | 1,521 classes | none — we read AD at runtime (`ad_seed.db`: AD_Table 1,004, AD_Column 26,161, AD_Field 20,988) | n/a | **NOT PORTED BY DESIGN** — a column-metadata-driven runtime replaces generated accessors | `xi_counts.log`, `ours_seed_counts.log` |
| 9b | ZK UI | 189,864 (128,825) | 588 classes | `idempiere.html` 6,325 (5,754) + `crud_overlay.js` 3,393 (2,661) + `ad_ui.js` 3,361 (2,797) + `erp.html` | n/a | **NOT PORTED BY DESIGN** (different UI framework; AD-driven window/tab/field render) | `misc_counts.log`, `ours_loc.log` |
| 9c | Plumbing: pipo 16,716 · install 10,368 · server/scheduler 11,290 · webservices 11,581 · replication 2,516 · jasper 3,354 · payment processors 1,184 | ~57K lines | | replaced by kernel op-log/relay/signed ops (`erp_kernel.js`, `erp_sync_*`), report overlay, no scheduler | n/a | NOT PORTED BY DESIGN (infrastructure); **scheduler (12 AD_Scheduler rows) behaviour is not replaced by anything measured** | `misc_counts.log` |
| 9d | `org.idempiere.test` | 78,403 (57,901) | 155 files | `erp/tests` 184 files, 22,039 lines + 250 `scripts/poc_*.js` | n/a | not comparable | `misc_counts.log` |
| 9e | **Libero/eevolution** (manufacturing) | `org/eevolution` 51,359 (23,712) | 115 files | MProduction recipe-only fold | ~0 | **NOT "by design" — it is business logic** (counted ABSENT) | `events_callouts.log` |

### Headless-only inventory (never loaded by a page)

1. **Engines absent from `bim-ootb origin/main erp/`:** `ad_workflow.js` (166, W-WF/W-WF-HARDEN), `ad_tabquery.js` (81, W-TABQUERY — AD_Tab WhereClause 85 / OrderBy 173 live rows), `ad_reference.js` (80, W-REFERENCE — ValueFormat); report folds `report_aging/bank_register/bank_statement/cashflow/distribution_run/inout_gl/inventory_value/invoice_gl/qweb/replenish.js` (10 files); `erp_sequencer.js`, `wh_route.js`, `op_class_tags.js`, `offline_queue.js`. (30 `build/erp/*.js` have no counterpart in `origin/main`; 17 above are rule-ish, 2,023 lines.)
2. **Shipped but not on the live path:** `ad_modelval` AFTER_*/BEFORE_DELETE/BEFORE_COMPLETE/PREPARE/VOID slots and the two BEFORE_COMPLETE validators; `erp_engine.reversePosting` (no UI caller); every VO/RC/RA/RE/CL consequence; `ad_docfsm` beyond the 4 curated tables.
3. **Forked, diverging copies:** `scripts/doc_poster.js` 642 lines / 14 doc types / §P9 GL_Category **vs** shipped `erp/doc_poster.js` 125 lines / 2 doc types; `scripts/post_resolver.js` 110 vs shipped 102.
4. **Derivations living only in witnesses:** Payment, Allocation, Movement, MatchInv, GLJournal, InOut-cost posting (`scripts/poc_money_post.js`, `poc_alloc_post.js`, `poc_movement.js`, `poc_matchinv.js`, `poc_gljournal.js`, `poc_fold_inout_gl.js`).
5. **Data not shipped:** `erp_rules.db` (746 rows: VALRULE 331, CALLOUT 284 stub, WF 58, DOCPOLICY 52, DOCEVENT 10 stub, ACCESS 5, AD_RULE 4, MATCHPOLICY 2; 452 preset / 294 stub; `handler_backlog` 155 `unwritten`) is `build/erp` only; the page gets `docPolicy` only via `crud_ops.json`.

### (a) Is "40K" real?

**Partly — it is the size of what we ship, not the cost of equivalence.** 45.9K lines (33.9K nc) ships, but only **5.6K nc** of it is
rule engine, against **167.6K nc** of iDempiere hand-written rules: **3.4%**. Port density is roughly 4-12% per area (hooks 15/225 classes,
callouts 7/145, processes 12/337 rows, doc posting 2/20 on the page, workflows 0/58). **The one place both sides are measured, the port is
not more concise:** 15 ported `beforeSave` bodies = 914 nc Java vs `ad_modelval.js` 683 nc (0.75×). If that ratio held everywhere (n=1,
**ESTIMATE, not a measurement**) full equivalence of this logic would be on the order of 10^5 nc lines, not 4×10^4. The hypothesis is
supported: the small size is mostly un-ported logic.

### (b) Hard-coded traps, ranked by silent-failure risk if a pure-AD port ignores them

| rank | trap | what breaks silently | Java | ours today |
|---|---|---|---|---|
| 1 | **After-save roll-ups** (line → header totals/tax) | order/invoice `GrandTotal`/`TotalLines`/tax lines stale after any line edit; all downstream posting then wrong | `MOrderLine.java:967` afterSave → `:999` → `:1070` `updateHeaderTax`; `MInvoiceLine.java:1046,1053`; `MOrder.java:1399` afterSave, `:2030` calculateTaxTotal | 0/100 afterSave hooks fired (`crud_overlay.js:2083`) |
| 2 | **DocAction runs through AD_Workflow** | approvals, DocAuto, responsible routing, `WindowValidator` BEFORE/AFTER_DOC_ACTION skipped | `AbstractADWindowContent.java:3766-3812`; `ServerProcessCtl.java:220-222`; `MWFActivity.java` (1,586 nc) | straight FSM→SET_STATUS (`crud_core.js:209-221`) |
| 3 | **Stock + reservation in completeIt** | on-hand/reserved/ordered quantities drift; MatchPO/MatchInv not created; ATP wrong | `MInOut.java:1630` completeIt, `:1785,1874,1907` `MStorageOnHand.add`, `:1798` MTransaction, `:2062` MMatchInv; `MOrder.java:1925-2024` reserveStock; `MStorageReservation.java:244,263,340`; `MInvoice.java:2101` | `erp_engine.js:319` named-deferred |
| 4 | **Costing method per product/schema** | inventory/COGS GL valued wrong (Average PO/Invoice, Standard, FIFO/LIFO) with no error | `MCost.java:71,299-304,353-355,1054`; `MCostDetail.java:179,275`; `DocLine.java:791-831`; `Doc_MatchPO` gate `:429` | 0 on page |
| 5 | **Credit / BP open balance** | credit hold never triggers; `TotalOpenBalance`/`SO_CreditUsed` never refreshed after payment/allocation | `MOrder.java:1692` (CreditStatus in prepareIt); `MBPartner.java:711` setTotalOpenBalance; `MAllocationHdr.java:357,963`; `MInvoice.java:1433`, `MPayment.java:966` testAllocation (sets IsPaid/IsAllocated) | `crud_overlay.js:577` "UI status event, named" |
| 6 | **Period control** | docs post into closed periods | `Doc.java:819,1188-1228`; `MPeriod.java:277`; `MPayment.java:1918,2181,2628,2724,2909` | 0 hits for `c_periodcontrol` in shipped js |
| 7 | **Document numbering by column name + lock + year reset** | duplicate/non-monotonic numbers under concurrency; year-reset never happens | `PO.java:3149-3162,3579-3603`; `MSequence.java:176-188,330-347` | `crud_overlay.js:2809` bumps outside op-log |
| 8 | **Event handlers outside model classes** | BOM auto-production at shipment; price propagation across list versions; opportunity sync — invisible in the AD | `AutoProduceEventDelegate.java:56+` (BEFORE_COMPLETE on MInOut); `ProductPriceValidator.java:61-114`; `SalesMgmtValidator.java:55-76` | 0/12 |
| 9 | **Posting gates & currency** | unbalanced/suspense, closed-period, inactive-doc, FX rate/type lookup silently different | `Doc.java:591-605,811-819,1097-1110,1155` | 2/20 doc types on page; FX only headless |
| 10 | **Virtual `ColumnSQL` + `@SQL=` defaults** | 66 virtual columns render empty; 150 defaults dropped (fields pre-filled blank) | `POInfo.java:158-207`; `Evaluator.java:139-148`; `GridField.java:1485-1494` | 0/66, 0/150 (`crud_core.js:795`) |
| 11 | **PO hard-coded column semantics** (Created/Updated/IsActive/AD_Client/AD_Org/Processed copy defaults; `ProcessedOn` stamp; immutability) | copy/clone and processed-record behaviour diverge | `PO.java:1108-1138,1984-1994` | not measured |

Logs for every number: `/tmp/claude-1000/ledger/{loc_*,hooks,docact,db_counts*,match_ported,events_callouts,traps_counts,ours_*,headless_loc,xi_counts,misc_counts,mvcount,reg}.log` (regenerable with the saved `*.py`/`*.js`).
