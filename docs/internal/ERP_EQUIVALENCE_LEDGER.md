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
