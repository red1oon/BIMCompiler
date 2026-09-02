<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ERP OOTB ↔ iDempiere UX PARITY — operational integrity in DocType + AD UI behaviour

```
# ⚠ DO NOT REMOVE
SCOPE: the shipped ERP app (bim-ootb `erp/`) judged against ONE bar — an iDempiere user opens a
window and says "this works as well as, or better than, I expected." Engine/witness code lives in
bim-compiler `scripts/` + `build/erp/`; bim-ootb only hosts the app.
NORTH STAR (user, 2026-09-02, quoted): "Our ERP must give exactly the user experience in iDempiere,
improved where we added in the pills such as the graphs page and red pill back to Viewer... Priority
is that an iDempiere user can say ERP OOTB works as well or better than thought."
So: PARITY is the floor, the pills are the surplus. A pill never excuses a missing AD behaviour.
RULES: Spec-first. Log Mandate — read the log, exit code is not evidence. Every § below carries its
own witness claim BEFORE code. Never full-regenerate `erp/ad_seed.db` (bake additively). `erp/sw.js`
CACHE_VERSION bump in the SAME PR as any shipped erp/ change.
```

## §MEASURED — 2026-09-02, read from the shipped tree and `erp/ad_seed.db`, not from lane docs

**The five documents an iDempiere user actually lives in are the ONLY five rendered from a
hand-written field list instead of from their own AD tab.**

`crud_overlay.js:113-118` `entryFor()` resolves a table's edit spec as **STORE first, FOLDED
second** — the curated `crud_ops.json` hand-list WINS over the AD-derived `foldCrudSpec` (S2B).
`crud_ops.json` contains exactly 5 tables, and they are the document core:

| table | header tab | curated fields | AD fields on that tab | of which DisplayLogic-bearing | mandatory cols on the table |
|---|---|---|---|---|---|
| `c_order` | 186 Order (Sales Order) | **8** | **60** | 28 | 49 |
| `m_inout` | 257 Shipment (Customer) | **7** | **59** | 30 | 31 |
| `c_invoice` | 263 Invoice (Sales) | **7** | **51** | 23 | 37 |
| `c_payment` | 330 Payment and Receipt | **4** | **81** | 58 | 32 |
| `c_allocationline` | 349 Allocation Line | **4** | **13** | 0 | 12 |
| **total** | | **30** | **264** | **139** | **161** |

- **DisplayLogic on the curated specs: 0 of 30 fields.** Every `crud_ops.json` field entry lacks a
  `displaylogic` key — verified by reading the JSON. This is the precise, mechanical cause of the
  T-0 item-8 finding ("AD_Field·DisplayLogic hiding is architecturally dead for every CRUD-enabled
  table", `ERP_COVERAGE_MATRIX.md` scored 🟡). It reproduces independently here: T-0 measured 27
  hidden fields on the fallback accordion for c_order, this sweep counts 28 DisplayLogic-bearing
  fields on tab 186 — the same surface, counted twice, two sessions apart.
- **The general path already exists and is already correct.** `crud_core.js:696 foldCrudSpec` (S2B)
  folds the FULL AD field set (`isDisplayed && !isKey`, minus button/id), and it DOES carry
  `spec.displaylogic` (`crud_core.js:725`), `required` from `isMandatory`, `readonly` from
  `isReadOnly`/`IsUpdateable`, and AD defaults. `crud_overlay.js:483 applyAdLogic` +
  `crud_core.js:96 effectiveFlags` correctly evaluate display/readonly/mandatory logic. **Nothing is
  broken in the AD path — it is simply outranked for exactly the five tables that matter most.**
- **LEG-1 is live and visible.** `mapRefDisplayType` (`crud_core.js:673`) maps DisplayType **17
  (List)** and **20 (Yes-No)** to `'string'` — "list/yesno render as an editable text of the raw
  value; AD_Ref_List option-fold is a named follow-on" (the code's own comment). Across the five
  header tabs that is **23 List + 26 Yes-No = 49 fields** that iDempiere shows as a dropdown or a
  checkbox and we show as a free-text box. A user can type anything into a List column.
- **AD_Val_Rule is not wired into the live app at all.** `build/erp/ad_valrule.js` exists and is
  witnessed headless (W-VALRULE, 327 of 332 rules interpretable), but **no file in `erp/` consumes
  it** — verified: the only `valRule` token in `crud_core.js` (line 152) is a regex label, unrelated.
  The FK pickers at `crud_overlay.js:535,545` build a plain `SELECT` over the target table.
  **61 displayed fields on the five header tabs carry an `AD_Val_Rule_ID`** — every one of them
  currently offers the user rows iDempiere would never have shown.
- **DocType is in FAR better shape than the scoreboard says — the matrix row is STALE.**
  `ERP_COVERAGE_MATRIX.md` §A still reads "folds **only CO** (DR→CO/IP via a field-presence
  `requires` check); `action` is pass-through metadata, **no dispatch table**". The shipped tree has
  `erp/ad_docfsm.js` — "the full 14 actions × 12 statuses, keyed to a REAL C_DocType row", reading
  `c_doctype.docbasetype/issotrx/docsubtypeso/iscanbereactivated` — and it is wired LIVE through
  `idempiere.html:2213 buildDocActionBar` (§AD-DOCFSM-LIVE) into both the form bar and the grid
  batch bar. `crud_core.js:200 legalDocActions` is the seam. **Do not "fix" this row by writing new
  FSM code — re-score it.**
- **DocumentNo is NOT a gap** — checked because it looked like one. `crud_overlay.js:393-400` seeds
  from AD_Sequence with a `§DOCNO-PREVIEW` log and the explicit contract "number comes from
  AD_Sequence, never fabricated"; Copy clears it for a fresh sequence (`:771`), matching iDempiere.

## §P1 — Retire the curated-5 field list. THE headline item.
**Claim to witness (W-PARITY-FIELDSET):** for each of the five tables, the inline editor renders the
same field set its AD tab declares, with DisplayLogic/ReadOnlyLogic/MandatoryLogic applied — asserted
as counts per table (`c_order 8→60`, `m_inout 7→59`, `c_invoice 7→51`, `c_payment 4→81`,
`c_allocationline 4→13`) plus a non-zero `withLogic` on each of the four that carry logic.
**Shape of the fix (spec, not a suggestion):** invert/merge the precedence at `entryFor()` so the
AD fold is the SOURCE OF THE FIELD SET and the curated entry contributes only what the AD cannot
express — verb permissions, `docPolicy`, ordering/pinning. **Keep the 8 curated columns pinned first**
so the O2C flow's field positions do not move under the user; append the rest in AD `SeqNo` order.
**⚠ BLAST RADIUS — this is why T-0 deferred it, and it is the whole risk of this item.** Nine merged
PRs (#928/#938/#944/#948/#953/#955/#956/#960/#968) closed the O2C cycle against these curated specs.
**MANDATORY: regression-prove against the live CRUD-path witnesses BEFORE the PR**, and re-run the
O2C stage table in `ERP_BUSINESS_CYCLE_E2E.md` (stages 1/2/3/5/6 are PASS today — they must stay
PASS). A control worktree at the same base commit distinguishes a pre-existing failure from a new one.
**Do §P2 first or in the same change** — widening c_payment to 81 fields while List/Yes-No still
render as raw text makes the form WORSE, not better. Parity is the bar, not field count.

## §P2 — LEG-1: AD_Ref_List and Yes-No editors (49 fields on the five header tabs)
**Claim to witness (W-PARITY-REFLIST):** a DisplayType-17 field renders a `<select>` whose options
are exactly that column's `AD_Ref_List` rows (value + name, active only, in `SeqNo` order) and
rejects a value outside them; a DisplayType-20 field renders a Y/N control that can only emit `'Y'`
or `'N'`. Assert the option COUNT for at least one real column against the seed, not just "a select
appeared". **Not a redesign** — `mapRefDisplayType` already isolates the two ids; add the two editor
types and the `AD_Ref_List` read. This is the single cheapest visible parity win in the lane.

## §P3 — Wire AD_Val_Rule into the live FK picker (61 fields on the five header tabs)
**Claim to witness (W-PARITY-VALRULE):** an FK picker on a column carrying an `AD_Val_Rule_ID`
offers strictly the rows the rule's where-clause admits — asserted as `before > after` row counts on
a named real column, plus a falsifier (a row the rule excludes is absent from the picker and is
REJECTED on save). The engine is already built and witnessed (`build/erp/ad_valrule.js`, W-VALRULE,
327/332 interpretable) — **this item is the browser-side wiring plus the `@token@` context feed, not
a new evaluator.** Precedent for the wiring seam: how `ad_docfsm.js` reached the live bar.

## §P4 — Re-score the DocType/DocAction row honestly, then close what is genuinely open
**This is an AUDIT item, and it is deliberately ordered before any new doctype code.** The matrix
row quoted in §MEASURED is stale by at least the whole of `ad_docfsm.js`. Re-read the shipped
FSM against `DocumentEngine.getValidActions` (the W-*-FSM witnesses already walked 22 tables), fix
the row, and only THEN name what is actually missing. Known candidates to CHECK, not to assume:
period control on Complete (is `C_Period` open/closed honoured?), `IsDocNoControlled`, GL category,
and whether `iscanbereactivated` gates ReActivate in the live bar as it does in the module.
**Do not write a second FSM.**
**⚠ CORRECTION 2026-09-02 (this line was WRONG when written, fixed after the §P4 audit):** the seam is
NOT `crud_core.js:200 legalDocActions` — that function has **zero callers in the shipped app** (verified:
only its definition and its export; its one caller anywhere is the bim-compiler witness
`scripts/poc_docaction_full.js`). The real live seam is **`idempiere.html:2166 _fsmCtx`** → `fsm.dispatch`
via `docActionOutcome`, feeding the form bar, the grid batch bar and the Process pill. Wiring
`legalDocActions` as-is would WIDEN the bar back to the generic union. Also: the docstatus-cell edit path
(`crud_core.js:626`) is not FSM-gated at all.

## §P5 — Consequence of §P1 to state explicitly, not a separate build
`c_order` has **49 mandatory columns**; the curated form exposes 8. Once §P1 lands, mandatory
enforcement (`effectiveFlags.required` → `validateField` → `'required'`) starts firing on fields the
user can finally SEE and fill — which is the correct iDempiere behaviour ("Fill Mandatory"), but it
will surface saves that silently succeeded before. Expect it, witness it, don't hot-fix it away by
weakening the validator.

## §DISPATCH
| item | who | why |
|---|---|---|
| §P2 then §P1 (one lane, in that order) | **Fable 5.1** | blast radius across the five document tables + 9 merged O2C PRs; needs the regression judgement, not just the edit |
| §P3 | autonomous agent | bounded: wire an already-witnessed engine, one seam, clear falsifier |
| §P4 | autonomous agent | read-and-re-score audit; explicitly forbidden from writing new FSM code |

## §P4 FINDINGS — 2026-09-02 · DocType/DocAction re-score (AUDIT ONLY — no FSM code written)

**The matrix row is FIXED.** `docs/internal/ERP_COVERAGE_MATRIX.md` §A "DocAction lifecycle": the cell
that read *"folds **only CO** (DR→CO/IP via a field-presence `requires` check); `action` is pass-through
metadata, no dispatch table"* is replaced. It was stale by the whole of `ad_docfsm.js`. **The row STAYS
🟡 — but on a different, real reason**, stated in the row and itemized under §P4-OPEN below.

### §P4-EVIDENCE — what was re-run, and what the logs say (Log Mandate: logs read, not exit codes)
- **Engine identity settles the "is the witnessed engine the SHIPPED engine?" question:**
  `~/bim-ootb/erp/ad_docfsm.js` and `bim-compiler/build/erp/ad_docfsm.js` are **byte-identical**,
  md5 `461e339c0acbe17c3b725eb541f19b67`. Every W-*-FSM witness therefore attests the shipped file.
- **12/12 FSM witnesses re-run green this session**, `1,387 per-table fixtures diff=0` against a RUNTIME
  parse of `DocumentEngine.getValidActions` + each `M*.java` (non-tautological — the oracle is parsed from
  `~/idempiere-dev-setup/idempiere` at run time, not hand-authored):
  MOrder 43 · MInOut 154 · MInvoice 153 · MPayment 103 · Inventory-family 161 · GL-Journal 207 ·
  Alloc 100 · Cash 34 · BankStmt 99 · generic-tail 333. Every one carries a load-bearing §FALSIFIER.
  Plus `poc_docfsm` → `§DOCTYPE_FSM_COVERAGE doctypes=52 actions=14 statuses=12 reachableAsTarget=11`.
- **W-AD-DOCFSM-LIVE re-run PASS** — real DOM, real clicks, not a synthetic call.
- **Scale of the dispatch table:** `DOC_FAMILY` = **22** tables + C_Order via `legalActionsOrder` = **23**
  walked document tables. An unwalked table **throws** (`legalActionsFor:216`) rather than silently
  inheriting the generic union. Vocabulary verified against the seed: AD_Reference 135 = 14 DocAction
  values (13 dispatchable + `--`/None), AD_Reference 131 = 12 DocStatus values.

### §P4-CANDIDATES — the four things §P4 said to CHECK, not assume
| candidate | verdict | proof |
|---|---|---|
| **`C_Period` open/closed honoured on Complete** | **ABSENT on Complete** (implemented only as a reversal-family gate) — **and the OPTION-LIST half is correct parity** | *iDempiere side (read from source this session):* `DocumentEngine.getValidActions` does **NOT** gate Complete by period — `ACTION_Complete` is pushed unconditionally at `:1039` and `:1046`, and the `periodOpen` parameter is documented at `:983` as existing *"to avoid including Void and ReverseCorrect options"*; all 8 of its uses guard only RC/RE/VO. **So our bar omitting a period test from the CO option list is FAITHFUL.** The real enforcement is one level down: **`prepareIt()` in 20 M\* classes**, reached transitively from Complete (`DocumentEngine:320-327` prepares when drafted/invalid; `MInvoice.completeIt:1965-1977` re-runs `prepareIt`). Two idioms with **different** outcomes — `MPeriod.isOpen` → `return DocAction.STATUS_Invalid` with `@PeriodClosed@`, persisted as **DocStatus=IN** (`MOrder:1545-1549`, `MInOut:1453`, `MPayment:1918`, `MJournalBatch:322`, `MMovement:299`, `MCash:388`, `MTimeExpense:322`); `MPeriod.testPeriodOpen` (`MPeriod.java:917`) → throws unchecked `PeriodClosedException` → rollback, **status unchanged** (`MInvoice:1723`, `MAllocationHdr:420`, `MBankStatement:330`, …). A third, separate gate lives at posting (`acct/Doc.java:818-820`). *Our side:* the only open/closed logic in the live app is `idempiere.html:2141 _periodOpen` (MPeriod.isOpen port — standard period containing DateAcct + `c_periodcontrol.periodstatus='O'` for the doc's docbasetype). It is called **exactly once**, `idempiere.html:2172`, inside `_fsmCtx`, to populate `rec.periodOpen` — which `legalActionsFor` consults **only inside the `s==='CO'` branch** to gate RC/RE/RA/VO. Nothing tests the period on Complete: `grep -i period erp/crud_overlay.js` → 1 hit, a comment (`:273`); the `BEFORE_COMPLETE` hooks in `ad_modelval.js` are `MOrder.hasLines` (`:59`) + `MOrder.totalNonNegative` (`:64`), no period test. `ad_modelval.js:483 periodOf` finds a period but **never reads `periodstatus`** — a PeriodNotFound check, registered `BEFORE_SAVE` for GL_Journal only (`:552`). |
| **`IsDocNoControlled` respected** | **IMPLEMENTED and FAITHFUL — but UNWITNESSED** (one sub-behaviour absent, data-gated) | *Parity confirmed against source:* `MSequence.getDocumentNo:683-686` returns **null** when the doctype is not DocNo-controlled, and the caller falls back to the table-level sequence `DocumentNo_<TableName>` (`PO.java:3579-3581`, `DB.java:1958-1961`) — `'N'` means *"table sequence instead of doc-type sequence"*, **not** "no number". Our implementation does exactly that. `erp/crud_overlay.js:1467 _docTypeSeqId` reads `isdocnocontrolled, docnosequence_id` off the record's `C_DocType_ID`/`C_DocTypeTarget_ID` and returns the doctype sequence **only** when `='Y'`, else null → falls back to the table sequence `DocumentNo_<table>`. Both the preview (`:1478 _previewDocNo`) and the commit-time allocation (`:1490 _allocDocNo`, called `:1585`) branch on it; `:1508` logs `docNoControlled=Y/N`. Non-vacuous in the seed: **34** doctypes `='Y'`, **all 34** carrying a `docnosequence_id` resolving to an ACTIVE `ad_sequence`; **18** `='N'`, none carrying one. **The gap is the witness**: the only DocNo witness, W-DOCNO (`scripts/poc_audit_changelog.js:102-130`, re-run green) asserts ONLY the table-level path — `§DOCNO table=c_order seq=DocumentNo_c_order docno=SO-1000`. Nothing asserts the doctype-controlled branch. **Absent sub-behaviour (data-gated, not a code bug):** iDempiere also allocates a *definite* DocumentNo at Complete via `setDefiniteDocumentNo()` (called from `completeIt` in 12 classes, e.g. `MInvoice:2381`, `MOrder:2413`) using `C_DocType.DefiniteSequence_ID` when `IsOverwriteSeqOnComplete='Y'` (`MSequence.java:690,702`). We never do — but the seed **cannot** express it: `isoverwriteseqoncomplete`, `definitesequence_id` and `isoverwritedateoncomplete` are all **absent columns** on `c_doctype` in `ad_seed.db`. Seed-width item, not an implementation gap. |
| **GL category** | **PARTIAL — defaulting only, absent from posting** | Single use in the shipped tree: `erp/ad_modelval.js:522-528 MJournal.glCategoryDefault` (port of `MJournal.beforeSave:340-342`) defaults `GL_Category_ID` from the doctype when the journal carries none; registered `BEFORE_SAVE`, **GL_Journal only** (`:552`). It is **not** used in the posting fold: `grep -c gl_category scripts/post_resolver.js` = **0**. Seed: 38 of 52 doctypes carry a `gl_category_id`; only GL_Journal consumes it. *Confirmed against source that this IS a gap, not a non-goal:* in iDempiere `GL_Category_ID` is **both** a save-time default **and** a posting input — `acct/Doc.java:991-1009 setDocumentType()` reads `DocBaseType, GL_Category_ID` straight off `C_DocType` (with fallbacks by DocBaseType `:1030-1046` then client default `:1058-1073`, and a SEVERE log if none `:1085`), and `acct/FactLine.java:404 setGL_Category_ID(m_doc.getGL_Category_ID())` stamps it on **every `Fact_Acct` row**; it is also a fact-line merge key (`Doc_AllocationHdr.java:645`). Our derived postings carry no such column. |
| **`iscanbereactivated` gates ReActivate in the LIVE bar as in the module** | **IMPLEMENTED — same seam, proven live with a Y/N contrast** | There is no second implementation: `ad_docfsm.js:219-220` reads the REAL `c_doctype.iscanbereactivated` inside `legalActionsFor`'s CO branch and the invoice/payment/journal/bankstmt arms push `RE` only when `='Y'` (`legalActionsOrder:104` does the same for C_Order, `DocumentEngine:1082-1083 canReactivateThisDocType`); the live bar consumes exactly that call (`idempiere.html:2178`). **Discriminating live pair** (W-AD-DOCFSM-LIVE, re-run PASS — both blocks HAVE an RE arm, so the flag is the only difference): `C_Payment` 100 / doctype **119 ARR react=Y** → `§AD-DOCFSM-LIVE … legal=[CL,RC,RE,RA]` (RE rendered) **vs** `C_Invoice` 100 / doctype **117 ARI react=N** → `legal=[CL,RC,RA]` (RE absent). Also `C_Order` 100 / 135 react=Y → `[CL,VO,RE]`; `GL_Journal` 100 / 115 react=Y → `[CL,RC,RE,RA]`. Headless falsifiers confirm it is load-bearing (W-MPAYMENT-FSM / W-MBANKSTMT-FSM §FALSIFIER-B: inject RE into a react=N set → set-diff fires). Seed: 17 react=Y / 35 react=N. *Source cross-check:* `DocumentEngine.canReactivateThisDocType:1523-1525`; the gate is applied in exactly 5 blocks (MOrder-Completed `:1082`, MInvoice `:1114`, MPayment `:1134`, MJournal/Batch `:1150`, MBankStatement `:1191`) — our arms match those five, and the MOrder **Waiting-Payment** branch offers RE **ungated** (`:1087`), which `legalActionsOrder:105` also does. **One residual we do NOT have:** iDempiere re-checks the same predicate a second time *inside* `reActivateIt()` in 5 classes (`MOrder:3057`, `MInvoice:2876`, `MPayment:2911`, `MJournal:943`, `MBankStatement:680`), so hiding the button is not its only defence; our `dispatchFor` gates on the option list alone. |

### §P4-VACUITY — the one place the evidence is honestly one-sided
The period gate's DATA is not vacuous (seed `c_periodcontrol` = **1473 `O` / 133 `C` / 8857 `N` / 1 `P`**
over 360 `c_period` rows), **but every one of the 43 seeded `docstatus='CO'` documents resolves to an
OPEN period** — so all six live witness cases log `periodOpen=true`, and the closed-period NARROWING is
never exercised on screen. The negative arm is proven headless only (§FALSIFIER-B "inject RC into the
period-closed CO set → set-diff fires", on InOut/Invoice/Alloc/Journal/Production). Stated, not papered over.

### §P4-DEFECT — a REAL divergence the green witness could not see (PRIMAL LAW §4: scope-blind)
**Found by diffing the shipped engine against the Java directly instead of trusting W-GENERIC-TAIL-FSM's
`diff=0`.** `scripts/docfsm_oracle.js:39-50` enumerates the per-table block anchors of
`DocumentEngine.getValidActions` and terminates its parse window at
`_end = 'else if (AD_Table_ID == I_PP_Cost_Collector.Table_ID)'` — **line 1248**. Five per-table blocks
live AFTER that line and are therefore invisible to the oracle:
`I_DD_Order :1266` · `I_HR_Process :1284` · **`MRMA :1302`** · **`MBankTransfer :1313`** · **`MDepositBatch :1323`**.
The last three ARE in our `DOC_FAMILY` (661 / 200246 / 200056) carrying **no `block`**, so `legalActionsFor`
treats them as generic fall-through. Measured, both sides:

| table | our engine @CO | real iDempiere @CO | source |
|---|---|---|---|
| `M_RMA` (661) | `[CL]` | **`[CL, VO]`** | `:1302-1309` (IDEMPIERE-98, "Implement void for completed RMAs") |
| `C_BankTransfer` (200246) | `[CL]` | **`[CL, VO]`** | `:1313-1320` |
| `C_DepositBatch` (200056) | `[CL]` | **`[CL, VO, RE]`** | `:1323-1330` |

W-GENERIC-TAIL-FSM reports `fixtures=333 diff=0` because **the oracle shares the engine's blind spot** —
both say "generic fall-through". Worse, its `§FALSIFIER-A` actively encodes the wrong behaviour as correct:
*"VO@CO on RMA rejected (implemented in the class yet NEVER offered)"* — iDempiere **does** offer it.
This is the failure mode CLAUDE.md PRIMAL LAW §4 names: a witness that passes because the defect is outside
the pairs it inspects. **Live blast radius today = ZERO** (measured, not assumed): the seed's only `m_rma`
row is `IP`, and `c_banktransfer` / `c_depositbatch` **are not tables in `ad_seed.db`** — so no completed
document of any affected table exists and no user can currently see a wrong bar. The defect is **latent**;
it becomes visible the moment those tables carry a completed doc. Note the transitions are already right
(`DOC_FAMILY[661].vo.CO='VO'`) — **only the legal SET is short**, so the fix is a `block`, not new transition logic.

### §P4-OPEN — what is genuinely still open (named, NOT built — §P4 forbids new FSM code)
1. **Action BODIES, not status.** The FSM decides legality + resulting DocStatus; it does not run the Java
   `completeIt`/`voidIt` bodies. `crud_overlay.js:1210 completeFanout` has consequence bodies for **3** of
   the 23 walked tables (`c_order`/`m_inout`/`c_invoice`); the other 20 fall to `cb(null)` — status
   advances, no document consequence. *Code needed:* a `completeFanout<X>` per remaining table.
2. **Period-on-Complete.** Note the correct SHAPE, now that the source has been read: it does **not** belong
   in the option list (iDempiere's `getValidActions` deliberately has no period test on CO) — it belongs at
   **prepare** time, the step Complete runs through. *Code needed:* a `BEFORE_PREPARE`/`BEFORE_COMPLETE`
   model-validator hook that calls the existing `_periodOpen` probe (do NOT write a second period reader —
   `idempiere.html:2141` is the owner) and lands the doc at **DocStatus=IN with `@PeriodClosed@`**, the
   `MPeriod.isOpen` idiom used by `MOrder:1545-1549`/`MInOut:1453`/`MPayment:1918`. See ⛔ below first.
3. **⚠ `crud_core.js:200 legalDocActions` is DEAD, and wiring it as-is would REGRESS the bar.** §P4 named
   it "the one seam" — it is not. It has **zero callers** in the shipped `erp/` tree (the only other hits
   are stale copies under `.claude/worktrees/`); the live seam is `idempiere.html:2166 _fsmCtx`. And it
   delegates to `fsm.legalActions` = the GENERIC `STATUS_ACTIONS` union, which is **wider** than the
   per-table narrowing — wiring it would offer e.g. RC/RA on a completed Order, exactly what W-MORDER-FSM
   §FALSIFIER-B rejects. *Action:* delete it, or repoint it at `legalActionsFor`. Do not wire it as-is.
4. **The docstatus-CELL edit path is not FSM-gated.** `crud_core.js:626 splitStatusChange` builds a
   `DOC_ACTION` op using the target status as the action code and calls `docActionOutcome(entry, values)`
   with **no fsm argument** → the legacy CO-only `requires` gate; `legalActionsFor` never runs there.
5. **`IsDocNoControlled` needs a witness, not code** — assert the doctype branch (`='Y'` → `DocNoSequence_ID`)
   against one of the 34 real doctypes, plus an `='N'` falsifier falling back to `DocumentNo_<table>`.
6. **§P4-DEFECT above — FIX THE ORACLE FIRST, then the engine.** Extend `scripts/docfsm_oracle.js:50`'s parse
   window past `I_PP_Cost_Collector` so `MRMA`/`MBankTransfer`/`MDepositBatch` are parsed, re-run
   W-GENERIC-TAIL-FSM and let it go **RED** (that failure is the proof the blind spot was real), then add the
   three `block` arms to `DOC_FAMILY` and correct the RMA §FALSIFIER-A, which currently asserts the wrong
   behaviour. Doing the engine first would just re-hide it. *Not built here — §P4 forbids FSM code.*
7. **`GL_Category_ID` on derived postings** — `post_resolver.js` never stamps it; iDempiere puts it on every
   `Fact_Acct` row (`FactLine.java:404`) and uses it as a merge key. Bounded: one resolved column, doctype →
   DocBaseType → client-default fallback chain already spelled out in `Doc.java:991-1073`.
8. **Second-layer ReActivate check** — iDempiere re-tests `canReactivateThisDocType` *inside* `reActivateIt()`
   (5 classes); our `dispatchFor` trusts the option list alone, so an API/deep-link path that skips the bar
   is ungated. Cheap defence-in-depth, mirrors `MInvoice:2874-2880`.

- ⛔ **BLOCKED: should Complete HARD-REJECT a document whose `DateAcct` falls in a closed/never-opened
  period (iDempiere's `MPeriod.testPeriodOpen` behaviour), or log-and-allow?** Enforcing it is correct
  parity, but it is a live behaviour change across the O2C flow that 9 merged PRs (#928…#968) depend on.
  Not guessed — item 2 above stays unbuilt until this is answered. Every other item is named work, not a
  question.

## §STATUS
- 2026-09-02 — file written, all §MEASURED numbers verified in-tree this session. Nothing built yet.
- 2026-09-02 — **§P4 DONE (audit).** Matrix §A DocAction row corrected + re-scored 🟡 on a new honest
  reason; 12 FSM witnesses + W-DOCNO re-run green (1,387 fixtures diff=0, engine md5-identical to the
  shipped file); four candidates scored with proof against BOTH our tree and the iDempiere source
  (§P4-CANDIDATES); **one real latent defect found that the green witness could not see** (§P4-DEFECT —
  3 tables' Completed legal-set short by VO/RE because the oracle's parse window stops at line 1248);
  8 open items named, 1 ⛔ question raised. **No FSM code written**, as §P4 requires.

- 2026-09-02 — **§P6 DONE (witness).** §P4-DEFECT CLOSED. Oracle parse window extended to the real end of
  `getValidActions` (:1333 text anchor, 18 arms, `byTable` 11→17 keys, pre-existing slices byte-identical);
  W-GENERIC-TAIL-FSM driven **RED on purpose** (`setDiffs=6`, all at CO) to prove the blind spot, then the
  three `block` arms added (`M_RMA`/`C_BankTransfer` CO→`[CL,VO]`, `C_DepositBatch` CO→`[CL,VO,RE]`, all
  ungated) and `§FALSIFIER-A` — which had asserted the WRONG behaviour — rewritten as two opposing arms.
  **12/12 FSM witnesses green**, incl. W-AD-DOCFSM-LIVE on the changed engine. Blast radius ZERO (re-measured).
  bim-ootb **PR #1611** (engine + `sw.js` v772→v773); oracle/witness fixes in bim-compiler. Full logs: §P6-EVIDENCE.

## §P6 — SPEC: close §P4-DEFECT (oracle parse window → engine blocks → falsifier)
**Spec-First. Written before any code; §P4-OPEN item 6 is the parent.** Scope is the truth instrument,
not a live bug: measured blast radius today is **ZERO** (the only seeded `m_rma` is `IP`; `c_banktransfer`
and `c_depositbatch` are not tables in `ad_seed.db`). Do not inflate it.

**§P6.1 — the parse window is wrong, and the boundary is EXTRACTED not guessed.** `docfsm_oracle.js
:38-51 MARKERS` terminates at `_end = 'else if (AD_Table_ID == I_PP_Cost_Collector.Table_ID)'`. Read from
the checkout this session, `DocumentEngine.java` carries **18 `AD_Table_ID ==` arms** inside
`getValidActions` (`int index = 0;` :1016 → the `if (po instanceof DocOptions)` customization hook
**:1333**, which is the real end of the per-table if/else chain). Six arms live at or after the old
terminator and are therefore invisible to the oracle: `I_PP_Cost_Collector` :1248 · `I_DD_Order` :1266 ·
`I_HR_Process` :1284 · `MRMA` :1302 · `MBankTransfer` :1313 · `MDepositBatch` :1323.
*Fix:* append those six as real markers and move `_end` to the **text** marker `'if (po instanceof
DocOptions)'` — a text anchor, never a line number. `sliceRegions` slices `idx[k]…idx[k+1]` and drops the
last, so earlier slices (`generic`, `MOrder`…`MProduction`) are **byte-identical after the change**; the
nine sibling witnesses that index a named `byTable` key are untouched.

**§P6.2 — let the witness go RED before fixing the engine.** `poc_generic_tail_fsm.js:56` passes `{}` as
the per-table block for all 11 tables. Once §P6.1 lands, three of them have a real parsed block, so the
DIFF-1 set-compare must go RED on exactly those three at `CO`. **That RED is the deliverable of step 2** —
it is the proof the blind spot was real. Fixing the engine first would re-hide it.

**§P6.3 — the engine arms (`ad_docfsm.js` `legalActionsFor`), parsed sets, all UNGATED.**
| table | id | block arm | CO set | source |
|---|---|---|---|---|
| `M_RMA` | 661 | `rma` | `[CL, VO]` | `:1302-1309` (IDEMPIERE-98, void for completed RMAs) |
| `C_BankTransfer` | 200246 | `banktransfer` | `[CL, VO]` | `:1313-1320` |
| `C_DepositBatch` | 200056 | `depositbatch` | `[CL, VO, RE]` | `:1323-1330` |
Three separate arms, not one shared arm: iDempiere writes three separate blocks and each carries its own
line cite. **`RE` on DepositBatch is UNGATED** — the Java pushes `ACTION_ReActivate` with no
`canReactivateThisDocType` test (unlike the invoice/payment/journal/bankstmt arms), so the arm must NOT
consult `iscanbereactivated`. Transitions are already correct (`DOC_FAMILY[661].vo.CO='VO'`,
`[200056].reActivate=true` → `RE`→`IP`) — **only the legal SET is short, so the fix is a `block`, not new
transition logic.** `build/erp/ad_docfsm.js` and `~/bim-ootb/erp/ad_docfsm.js` are md5-identical
(`461e339c0acbe17c3b725eb541f19b67`) and MUST stay so.

**§P6.4 — `§FALSIFIER-A` currently asserts the WRONG behaviour and must be inverted.** It reads *"Void
from CO on M_RMA → rejected … implemented in the class yet NEVER offered"*; iDempiere **does** offer it.
Replacement must stay load-bearing in BOTH directions: arm 1 asserts `VO@CO` on `M_RMA` **is** offered and
dispatches `CO→VO` (fires if the block is ever dropped again); arm 2 asserts `VO@CO` on `M_Requisition`
(702, genuinely block-less) is **still rejected** (fires if someone over-corrects and pushes `VO` for the
whole tail). The witness's "11 generic-only tables" / "CO→[CL] only" prose and the `§HARDEN_RESIDUAL`
line become false for the three and must be corrected in the same edit.

**§P6.5 — falsifiable claim.** All 12 FSM witnesses green again with `M_RMA`/`C_BankTransfer`/
`C_DepositBatch` diffed against a **parsed** block instead of `{}`, red-then-green logs quoted below.

### §P6-EVIDENCE — 2026-09-02 · RED then GREEN (Log Mandate: logs read, exit codes are not evidence)
**§P6 is BUILT and CLOSED.** Order honoured exactly as specced — oracle first, witness RED, then engine.

**Step 1 · oracle (`scripts/docfsm_oracle.js`).** `MARKERS` extended by the six arms that sat at/after the
old terminator, `_end` moved to the TEXT anchor `'if (po instanceof DocOptions)'` (:1333). Boundary
extracted, never guessed: `getValidActions` carries **18 `AD_Table_ID ==` arms**, six of them at :1248
(`I_PP_Cost_Collector`) · :1266 (`I_DD_Order`) · :1284 (`I_HR_Process`) · :1302 (`MRMA`) · :1313
(`MBankTransfer`) · :1323 (`MDepositBatch`). `byTable` 11 keys → **17**. Non-disruption PROVEN against the
pre-change module rather than asserted — the nine sibling witnesses index named keys, so their slices had to
be bit-stable: `§P6_SLICE_IDENTITY generic_identical=true oldKeys=11 newKeys=17 changedOldSlices=[]`.
Parsed CO-sets, straight off the runtime parse: `MRMA=[VO]` · `MBankTransfer=[VO]` · `MDepositBatch=[VO,RE]`
(and, not in `DOC_FAMILY` so still correctly THROWN by `legalActionsFor`: `PP_CostCollector=[VO,RC]` ·
`DD_Order=[VO,RE]` · `HR_Process=[VO,RE]`).

**Step 2 · the witness went RED — the proof the blind spot was real** (`build/erp/poc_generic_tail_fsm.log`,
engine deliberately still short at this point):
```
§HARDEN surface=M_RMA.docaction.legal          status=CO engine=[CL] oracle=[CL,VO]    diff=SET-MISMATCH
§HARDEN surface=C_BankTransfer.docaction.legal status=CO engine=[CL] oracle=[CL,VO]    diff=SET-MISMATCH
§HARDEN surface=C_DepositBatch.docaction.legal status=CO engine=[CL] oracle=[CL,RE,VO] diff=SET-MISMATCH
   🔴 242 legal-set fixtures ... — setDiffs=6
🔴 W-GENERIC-TAIL-FSM FAIL (1)
§RUN_WITNESS poc_generic_tail_fsm VERDICT=FAIL exit=1
```
`setDiffs=6` of 242 = the 3 tables × 2 gate corners, **all at `CO`** — matching §P4-DEFECT's predicted
divergence exactly, on both the tables and the missing codes.

**Step 3 · engine (`ad_docfsm.js`, bim-ootb PR #1611).** Three `block` arms added — `rma` (:1302-1309,
IDEMPIERE-98) · `banktransfer` (:1313-1320) · `depositbatch` (:1323-1330), each entry carrying its parsed
cite. All three **UNGATED**; the DepositBatch `RE` in particular carries no `canReactivateThisDocType` test,
so that arm must not read `iscanbereactivated`. No transition logic changed — §P4-DEFECT was right that only
the legal SET was short. Twin files stay byte-identical: `build/erp/ad_docfsm.js` == `~/bim-ootb/erp/ad_docfsm.js`
== **`fdf16f960504d1656259c4a14de9b467`** (was `461e339c0acbe17c3b725eb541f19b67`).

**Step 4 · `§FALSIFIER-A` corrected.** The old single arm asserted the WRONG behaviour as correct. Replaced
by two arms load-bearing in OPPOSITE directions, so neither a re-regression nor an over-correction survives:
```
§FALSIFIER-A1 action=VO from=CO table=661 ok=true  to=VO legal=[CL,VO]  (must be ok=true to=VO)
§FALSIFIER-A2 action=VO from=CO table=702 ok=false reason=illegal-action (must be ok=false illegal-action)
```
A1 fires if the per-table block is ever dropped again; A2 (`M_Requisition`, genuinely block-less) fires if the
correction ever leaks into the fall-through classes. The witness's "11 generic-only tables"/"CO→[CL] only"
prose, its `(GENERIC)` per-fixture label (now `(BLOCK <name>)` where one applies) and `§HARDEN_RESIDUAL`
were all corrected in the same edit — they had become false statements.

**Step 5 · GREEN, and green on the CORRECTED values, not by re-hiding:**
```
§HARDEN surface=M_RMA.docaction.legal          status=CO engine=[CL,VO]    oracle=[CL,VO](BLOCK MRMA)           diff=0
§HARDEN surface=C_BankTransfer.docaction.legal status=CO engine=[CL,VO]    oracle=[CL,VO](BLOCK MBankTransfer)  diff=0
§HARDEN surface=C_DepositBatch.docaction.legal status=CO engine=[CL,RE,VO] oracle=[CL,RE,VO](BLOCK MDepositBatch) diff=0
§HARDEN surface=M_Requisition.docaction.legal  status=CO engine=[CL]       oracle=[CL](GENERIC)                 diff=0
   🟢 242 legal-set fixtures ... — setDiffs=0
🟢 W-GENERIC-TAIL-FSM PASS
```
**12/12 FSM witnesses green** (`§RUN_WITNESS … VERDICT=PASS` each): W-MORDER · W-MINOUT · W-MINVOICE ·
W-MPAYMENT · W-MINVENTORY-FAMILY · W-MJOURNAL · W-MALLOCHDR · W-MCASH · W-MBANKSTMT · W-GENERIC-TAIL ·
W-DOCFSM · **W-AD-DOCFSM-LIVE** (re-run against the CHANGED engine, `ERP_ROOT=/tmp/wt-fsm-oracle/erp` — real
DOM, real clicks, not a synthetic call).

**Blast radius stays ZERO and is not inflated.** Re-confirmed, not re-assumed: the only seeded `m_rma` is
`IP`; `c_banktransfer`/`c_depositbatch` are not tables in `ad_seed.db`. Nothing user-visible changed — this
was correctness of the truth instrument. `ad_seed.db` untouched; none of the four Fable-owned files touched.

**§P4-OPEN item 6 → ✅ DONE (witness).** Items 1,2,3,4,5,7,8 and the ⛔ period question remain as written.
