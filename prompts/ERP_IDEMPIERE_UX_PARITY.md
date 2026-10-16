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

## §IMPL-2026-09-02 — build spec for §P2 then §P1 (written BEFORE code; this session, Fable 5.1)
Worktrees: work `/tmp/wt-erp-parity` (branch `feat/erp-parity-p2p1`), control `/tmp/wt-erp-control`, both at
bim-ootb `cecbbed0` (= origin/main). Seed numbers re-measured from `erp/ad_seed.db` this session and they match
§MEASURED exactly: displayed non-key fields 60/59/51/81/13; List(17)+YesNo(20) per tab 6+5 / 9+4 / 2+7 / 6+10 / 0+0 = 49.

### Findings that shape the design (measured, not assumed)
- **F1 — the host never folds a curated table.** `idempiere.html:3078 _withFoldedEntry` folds only when
  `!_curatedHas(tn)`, so for the five document tables `FOLDED[key]` is never registered; changing `entryFor()` alone
  would change nothing. Both seams move.
- **F2 — `ad_parser.getFields` (ad_parser.js:279) does not select `AD_Reference_Value_ID`, `ReadOnlyLogic`,
  `MandatoryLogic`, nor the field-level `AD_Reference_ID` override.** Without `AD_Reference_Value_ID` a List column
  cannot find its `AD_Ref_List` set. `resolveReference` (:335) already reads `AD_Ref_List` (active only) but always
  `ORDER BY Name`; iDempiere orders by Value when `AD_Reference.IsOrderByValue='Y'`, else Name
  (`MLookupFactory.getLookup_List:301,332,334`). `AD_Ref_List` in this seed carries NO SeqNo column — the §P2 claim's
  "SeqNo order" is therefore read as iDempiere's real rule (Value/Name per `IsOrderByValue`).
- **F3 — the AD contradicts the O2C contract on two pinned columns.** AD marks `GrandTotal` `IsUpdateable=N` +
  `AD_Field.IsReadOnly=Y` on tabs 186/263 and `DocumentNo` `IsUpdateable=N` on 186/257/263, while the curated
  `docAction.requires` needs `grandtotal` typed and `witness_e2e_business_cycle.js:223` types it (totals are not
  engine-derived from lines yet). A fold that let AD attributes override the pinned 8 would make stage 1
  un-completable. ⇒ **pinned columns keep their curated spec; only the AD logic strings are layered onto them.**
- **F4 — the AD field set brings AD-mandatory columns the curated form never showed, and `saveForm` validates
  BEFORE the save-hooks that derive them.** Mandatory + editable + visible + no resolvable default + not curated,
  per tab: 186 `C_DocTypeTarget_ID, C_BPartner_Location_ID, SalesRep_ID, C_PaymentTerm_ID` (+`IsDiscountPrinted`
  yes-no); 257 `C_DocType_ID, C_BPartner_Location_ID` (+`IsInDispute`); 263 `C_DocTypeTarget_ID,
  C_BPartner_Location_ID, C_PaymentTerm_ID` (+`IsDiscountPrinted`); 330 `C_DocType_ID, C_Currency_ID`
  (+`IsOnline`); PO tab 294 adds `M_Warehouse_ID`. `FreightAmt` is hidden by DisplayLogic (`@OrderType@…`) so it
  is not validated. Of these the faithful `beforeSave` ports already derive `c_doctypetarget_id`, `c_paymentterm_id`,
  `m_warehouse_id`, `c_currency_id` (MOrder/MInvoice), `c_doctype_id` (MPayment). **Not derived by any hook today:
  `MOrder` `c_bpartner_location_id` (the port only clears an inconsistent one) and `salesrep_id`** — both are
  filled by `MOrder.beforeSave` itself in Java (`:1269-1270` → `setBPartner:752-770`; `:1302-1307` from
  `Env.SALESREP_ID`). iDempiere's mandatory check (`GridTable.dataSave:1647-1650` → `getMandatory:1973-2001`) runs
  over a row that defaults/callouts already filled — our equivalents of those fills are the beforeSave ports, so the
  check must run AFTER them. The validator itself is NOT weakened (§P5).
- **F5 — an AD-folded FK picker silently picks the first row.** `populateRefs` (crud_overlay.js:546) fills a
  `<select>` with `LIMIT 200` rows and no blank option; an empty value lands on row 1 and `cleanVals` writes it on
  CREATE. Harmless on the curated 8 (the witness fills them); catastrophic at 81 fields (a payment would be created
  against the first invoice, charge, project, campaign…). iDempiere lookups always offer an empty choice.
- **F6 — `IsSOTrx` is not a displayed field on any of the five tabs**, so the Yes-No editor cannot clobber the
  Sales/Purchase derivation (`MOrder.docTypeTargetDefault`). A read-only Yes-No with no value (e.g. `IsReceipt`,
  derived by `MPayment`) must stay unset, never force-written as N.
- **F7 — copy drift.** bim-compiler `build/erp/ad_modelval.js` is a Jun-11 copy of the live file (md5 differs);
  W-MORDER-SAVE runs on the copy. This session runs it against the LIVE file; the copy is not the deliverable.

### §P2 spec — LEG-1 retired (W-PARITY-REFLIST)
- P2.1 `ad_parser.getFields`: also select `COALESCE(f.AD_Reference_ID, c.AD_Reference_ID)` (field override; on
  the five tabs it changes exactly one field, 257 `C_DocType_ID` 18→19, both fk), `COALESCE(f.AD_Reference_Value_ID,
  c.AD_Reference_Value_ID)` → `referenceValueId`, `COALESCE(f.ReadOnlyLogic, c.ReadOnlyLogic)` → `readOnlyLogic`,
  `COALESCE(f.MandatoryLogic, c.MandatoryLogic)` → `mandatoryLogic`. Guard: if the extended SELECT throws (a seed
  without those columns) fall back to the legacy SELECT and log `§AD_PARSER getFields legacy-shape`.
- P2.2 `ad_parser.resolveReference`: `ORDER BY Value` when `IsOrderByValue='Y'` else `ORDER BY Name`; log `orderBy=`.
- P2.3 `crud_core.mapRefDisplayType`: 17→`list`, 20→`yesno` (no longer `string`); `mapRefType` likewise.
- P2.4 `foldCrudSpec`: list → `refListId`; with `opts.refList(id)` → `optionList=[{value,name}]` (ordered) +
  `options={value:name}`; carries `readonlylogic`/`mandatorylogic`/`seq`. Yes-No default = AD literal only.
- P2.5 `validateField`: list options from `f.options` else `__meta[f.ref]` → `list:not-an-option`; yesno ∉{Y,N} →
  `yesno:not-Y/N`. `listOptions` accepts the ordered array (a map re-orders numeric-like values, e.g. PriorityRule).
- P2.6 editors (`crud_overlay`): yesno → `<input type=checkbox class="cfi cfyn">`; reads through `_getVal`: checked
  →Y, unchecked editable →N (`GridField.getDefault:1033`), unchecked DISABLED with no value → '' (F6); writes through
  `_setVal`. FK pickers get a leading blank option selected when the value is empty (F5). `§REFLIST col= refId=
  options=N orderBy= cur=` and `§YESNO col= cur= editable=` logged per field.
- P2.7 host `_foldCrudSpecForTab` passes `refList` = `ADParser.resolveReference(db,id).options`.
- Witness: `erp/tests/poc_parity_reflist_live.js` — window 195 New: `select[data-col=tendertype]` options ==
  `AD_Ref_List` rows for ref 214 read from `window.__idmpDb` (count 6, same values, same order);
  `creditcardtype` = 6; falsifier `validateField(f,'ZZ')` = `list:not-an-option`; `input[type=checkbox]
  [data-col=isonline]` present and `formValues()` reads exactly Y/N across a toggle; `validateField(f,'X')` =
  `yesno:not-Y/N`; 0 pageerrors. Headless `poc_ad_folded_crud.js` updated (its two "yesno/list → string"
  assertions were the LEG-1 pin; they now assert the retirement).

### §P1 spec — curated-5 retired by MERGE (W-PARITY-FIELDSET)
- P1.1 `crud_core.mergeCuratedWithFold(curated, folded)` PURE: entry keys from the curated (verbs, docAction,
  ownerGated, cas, title…); `fields` = pinned curated fields in curated order, each layered with the AD sibling's
  `displaylogic/readonlylogic/mandatorylogic/seq` when the curated has none, followed by every folded field not in
  the curated set, in AD SeqNo order. Curated `type/required/readonly/default/validation/ref` untouched (F3).
  Marks `merged:true, pinned, appended`.
- P1.2 `entryFor(key)`: STORE ∧ FOLDED → merged (re-merged when the host re-registers the fold, i.e. per verb);
  STORE only → curated (glassbowl.html registers no fold — unchanged there); FOLDED only → folded. Logs
  `§PARITY-FIELDSET key= curated= ad= merged= pinned= appended= withLogic=`.
- P1.3 host `_withFoldedEntry` always folds (drops the `!_curatedHas` gate); `_foldableTab`/`_crudHas` unchanged.
- P1.4 `saveForm` order: `fireBeforeSaveHooks → merge derived → validate → buildOp` (F4). Logs
  `§PARITY-MANDATORY key= verb= required=[…] derived=[…] typed=[…] missing=[…]` so the §P5 consequence is
  witnessed, not eyeballed.
- P1.5 `ad_modelval.installMOrderSaveHooks`: + `MOrder.bpLocationDefault` (`:1269-1270` ∘ `setBPartner:752-770` —
  BP `SalesRep_ID` if non-zero; ship-to → `C_BPartner_Location_ID`, bill-to → `Bill_Location_ID`, else first
  location; none → reject `BPartnerNoShipToAddress`), inserted before `billDefaults`, which now reads the effective
  (derived-else-record) location; + `MOrder.salesRepFromCtx` (`:1302-1307`). `crud_overlay._docCtx` feeds
  `ctx.salesrep_id = APP.actor` (`Env.SALESREP_ID`, the login user). W-MORDER-SAVE run on the live file: stored
  orders still ACCEPT with zero contradictions; strip location → the stored location re-derives; strip salesrep with
  ctx → ctx value; a foreign location is cleared (`:1239-1252`) THEN re-derived (`:1269`) — the earlier witness
  expectation (`null`) stopped one Java line short.
- P1.6 `erp/sw.js` CACHE_VERSION bump, same PR.
- Witness: `erp/tests/poc_parity_fieldset_live.js` — 143/169/195 New, 167 Edit (create not permitted), 205 child
  tab Edit: `.cfrow` per table = 60/59/51/81/13; first-N `data-col` order == curated order; `withLogic` ≥ the
  DisplayLogic count (28/30/23/58/0); then the §P5 arm on 143: fill ONLY the curated 8 → Save → `§CRUD-PERSIST`
  (mandatory satisfied by derivation, listed in `§PARITY-MANDATORY`); falsifier: clear `c_bpartner_id` → Save →
  REJECT `required` (validator intact). 0 pageerrors.
- Regression (mandatory before PR): `witness_e2e_business_cycle.js` with `WITNESS_ROOT=` control then work —
  stages 1/2/3/5/6 PASS on both; the bim-ootb `erp/tests/*_live.js` CRUD set on both trees, verdict-diffed.

### Out of scope, named (not built here)
`@OrderType@` context (hides DeliveryRule/PriorityRule/InvoiceRule/FreightCostRule on 186 under the fold — §P3's
`@token@` feed); `@$Element_*@` client-info context; AD_Ref_Table/Search target resolution (an FK whose table is
not `<col minus _id>`, e.g. `salesrep_id`, `bill_bpartner_id`, degrades to the raw value — same convention as
before); `DocStatus` shown as an editable curated list where AD says read-only (W-CRUD-DOCSTATUS territory, §P4);
Payment New still needs a hand-picked `C_Currency_ID` (no MPayment currency derivation; in iDempiere it comes from
the bank account callout).

## §IMPL-RESULT 2026-09-02 — §P2 + §P1 SHIPPED to PR, witnesses run and logs read
The Fable lane wrote the code and the two witnesses, then hit its session limit before opening the PR.
The parent session finished the chain (merge / bump / run / PR / commit); nothing was re-derived.

**bim-ootb PR #1613** (`feat/erp-parity-p2p1`), 9 files +676/−57 plus the merge and the version bump.
- **W-PARITY-REFLIST 14/14 PASS, 0 FAIL.** `tendertype` 6 options == `AD_Ref_List(214)` by count, values AND
  order; AD default `K` selected with no blank offered on a mandatory defaulted list; `creditcardtype` 6 ==
  ref 149; `isonline` a checkbox the engine reads `N,Y,N` across a toggle. Falsifiers both fire:
  `list:not-an-option` and `yesno:not-Y/N`. 20 `§YESNO` + 10 `§REFLIST` lines on tab 330. 0 pageerrors.
- **W-PARITY-FIELDSET 30/30 PASS, 0 FAIL, 1 OPEN.** Rendered rows == the seed's own renderable AD count per
  tab, read through `window.__idmpDb` at run time: c_order **8→56** (withLogic 28), m_inout **7→53** (28),
  c_invoice **7→47** (21), c_payment **4→78** (61), c_allocationline **4→13** (0, reported honestly rather
  than as a vacuous PASS). Curated columns verified pinned first in curated order on all five.
- **§P5 proven both ways:** a Sales Order New filled with ONLY the curated 8 persists (`§CRUD-PERSIST`,
  `missing=[]`) because the beforeSave ports derive `c_doctypetarget_id`/`c_bpartner_location_id`/
  `m_warehouse_id`/`salesrep_id`; and `validateField(c_bpartner_id,'')` on a NEW row still returns `required`.
- **⛔ OPEN (named, not a pass) — `§PARITY-MANDATORY-CREATE`:** inline create validates against its
  post-render baseline, so an UNTOUCHED empty mandatory field is never required-checked. Pre-existing and
  independent of the merge; the fix needs New-time defaults/callouts, which is O2C stages 1/6/7 territory.
- **O2C regression CLEAN** (`WITNESS_ROOT=/tmp/wt-erp-parity`): stages **1/2/3/5/6 PASS** — the contract held —
  and **stage 7 PASS** as well. Stage 4 FAIL / stage 8 ABSENT are the known structural gaps (no
  `m_storageonhand` fold exists anywhere; no vendor-invoice path), pre-existing and untouched. `run_witness.sh`
  prints `VERDICT=FAIL` on this one because a DISCOVERY witness carries no pass marker by design — the
  per-stage `§CYCLE` lines are the verdict, per the file's own header. Not a regression.
- **W-MORDER-SAVE PASS**, 8 fixtures `diff=0`, on the SHIPPED file.

### §IMPL-RESULT-F7 — the drifted `ad_modelval` copy, now seam-covered, still not reconciled
Running W-MORDER-SAVE straight gave **🔴 FAIL (4)** — every failure one of P1.5's new assertions at `ok=0`.
Root cause is §IMPL F7, not the change: `scripts/poc_morder_save.js:32` required `../build/erp/ad_modelval`,
a **separate drifted copy** (md5 `8d788d5d…`) of the shipped `erp/ad_modelval.js` (`7e6a3fda…`), which does not
carry the two new hooks. **11 witnesses run against that copy.** Added a `MODELVAL` env seam — default
unchanged so the other 10 witnesses and CI are untouched — and re-ran against the live file: **PASS**.
**Reconciling the copy itself is NOT done and is the real item here** — a three-way drift now exists
(`build/erp` copy · the shipped `erp/` file · whatever a stale checkout holds). Queue it before the next
`ad_modelval` change, or the next session's witness will judge code that is not what ships.

## §IMPL-P3 2026-09-02 — build spec for §P3, WRITTEN BEFORE CODE (Spec-First)
Base: bim-ootb `origin/main` **138af115** (PR #1613 already in, as `1dffb397`). Worktree `/tmp/wt-erp-valrule`,
branch `feat/erp-parity-valrule`. Every number below was measured from `erp/ad_seed.db` + the iDempiere
checkout THIS session; nothing carried over from §MEASURED on trust.

### §P3-EXTRACT — five facts read from the iDempiere source, none guessed
- **E1 · substitution is RAW TEXT, not quoted.** `Env.java:1636-1639` (`parseContext`, `forSQL=true`): the ctx
  value is appended verbatim, with only `'` → `''` escaping. It is NOT wrapped in quotes — the rule author
  writes them, which is why 25 rules read `IsSOTrx='@IsSOTrx@'`. The javadoc says so outright (`:1540-1543`).
- **E2 · an unresolvable token empties the WHOLE clause.** `Env.java:1641-1645`: `ctxInfo.isEmpty()` with
  `ignoreUnparsable=false` → `return ""` for the entire expression, not just that token.
- **E3 · and an emptied clause means the lookup offers NO ROWS.** `MLookup.java:1128-1140` (Loader): parsed
  length 0 while `ValidationCode` is non-empty → *"Loader NOT Validated"* → `m_lookup.clear(); return;`.
  **This is the parity behaviour**: on a New Sales Order with no BPartner chosen, `C_BPartner_Location_ID`'s
  picker is EMPTY in iDempiere — it is NOT silently unfiltered. A degrade-to-unfiltered would be WIDER than
  iDempiere and would defeat the whole item.
- **E4 · AD_Field wins over AD_Column.** `AD_Field_v` view, `migration/iD10/postgresql/202209141520_IDEMPIERE-5396.sql:7,14`:
  `COALESCE(f.ad_val_rule_id, c.ad_val_rule_id) AS AD_Val_Rule_ID`, and `validationcode` is joined on that same
  COALESCE — exactly the precedence `ad_parser.getFields` already applies to DefaultValue / AD_Reference_ID /
  AD_Reference_Value_ID (§IMPL P2.1). Not a new convention, the same one.
- **E5 · the rule's Code IS the lookup's where-clause.** `MLookupFactory.java:122-125` reads
  `column.getAD_Val_Rule_ID()` → `MValRule.getCode()` → `MLookupInfo.ValidationCode`, appended to the query.

### §P3-DEFECT — the engine's token feed is BROKEN for a quarter of the token rules (found + measured here)
`build/erp/ad_valrule.js substitute()` wraps every non-numeric substituted value in single quotes (`quote()`,
`:44-48`). Against **E1** that is wrong, and on the pre-quoted idiom it does not merely differ — it emits
`''Y''`, which is a **SQLite syntax error**, so the filter cannot run at all. Measured, both halves:

| measure | value |
|---|---|
| Type-S rules using the pre-quoted `'@Tok@'` idiom | **25 of 332** |
| of the 43 in-seed val-rule fields on the five header tabs, how many hit it | **6** — `m_pricelist_id` (186, 263) · `c_paymentterm_id` (186, 263) · `c_order_id` + `m_rma_id` (257) · `c_doctype_id` (186, 263) |
| what the clause does today | `M_PriceList.IsSOPriceList = ''Y'' …` → `SQL ERROR: near "Y": syntax error` |

**Why W-VALRULE never saw it (PRIMAL LAW §4 — scope-blind, not a lie):** every fixture in `poc_valrule.js`
and `poc_valrule_harden.js` passes NUMERIC context (`AD_Table_ID:318`, `AD_Client_ID:11`, `AD_Org_ID:0`), and
`quote()` emits numbers bare — so the defect lives entirely outside the pairs those witnesses inspect.
*Fix:* `substitute()` becomes a faithful `Env.parseContext(forSQL=true)` port — raw text, `'`→`''`, and an
absent **or empty** ctx value counts as unresolved (E2). `quote()` stays exported (public API) but is no
longer the substitution path. **Both W-VALRULE witnesses re-run and must not move** — one owner for the
question, no second substituter; proof by re-run, not by assertion.

### §P3-MEASURED — the population, before a line of code
`AD_Field ⋈ AD_Column` over tabs 186/257/263/330/349, `IsActive='Y' AND IsDisplayed='Y'`:
**264 displayed fields, 61 carrying an `AD_Val_Rule_ID`** — the spec's number, reproduced independently.
Classified by the engine: **25 static · 36 token · 0 empty · 0 unsafe.** By reference: 36×19 (Table) ·
13×30 (Search) · 11×18 (TableDir) · 1×17 (List). Exactly **1** of the 61 is field-level, and it DISAGREES
with its column — so E4's precedence is load-bearing at n=1 and is witnessed, not assumed:

| tab | column | AD_Field rule | AD_Column rule |
|---|---|---|---|
| 257 | `C_DocType_ID` | **52053** `C_DocType.DocBaseType IN ('MMS') AND IsSOTrx='Y'` | 125 `… IN ('MMR','MMS') AND AD_Client_ID=@#AD_Client_ID@` |

**Which rules actually BITE** (row count on the target table, before → after, measured against `ad_seed.db`):

| tab | column | rule | before → after | verdict |
|---|---|---|---|---|
| 257 | `c_doctype_id` | 52053 | **52 → 3** | BITES (and proves E4) |
| 186/257/263/330/349 | `c_bpartner_id` | 230 | **113 → 42** | BITES |
| 330 | `c_order_id` | 218 | **44 → 2** | BITES |
| all 5 | `ad_org_id` | 130 | **23 → 20** | BITES |
| 186 | `c_bpartner_location_id` | 167 `@C_BPartner_ID@` | 16 → *ctx-dependent* | the TOKEN arm |
| all 5 | `ad_client_id` | 129 | 6 → 6 | **NO-BITE — reported, never counted as a pass** |
| 330 | `c_invoice_id` | 220 | 20 → 20 | **NO-BITE** |
| 186/263 | `c_campaign_id` | 236 | 2 → 2 | **NO-BITE** |

### §P3-SPEC — the wiring (this item is wiring + the ctx feed; the evaluator already exists)
- **P3.1** `ad_valrule.substitute()` → faithful `Env.parseContext(forSQL=true)` (§P3-DEFECT). Twin-synced.
- **P3.2** `ad_parser.getFields`: extend the EXT SELECT with `COALESCE(NULLIF(f.AD_Val_Rule_ID,''), c.AD_Val_Rule_ID)`
  → `field.valRuleId` (E4). The existing legacy-shape try/catch fallback covers a seed without the columns.
- **P3.3** `crud_core.foldCrudSpec`: carry it as `spec.valruleid`. The fold stays **PURE** — no db, no engine call.
- **P3.4** `crud_overlay.populateRefs`, the editable-fk arm — THE SEAM. Call
  `AdValRule.evalValRule(_mvB3(db), id, {ctx, table:f.ref})` — the SAME better-sqlite3 shim
  `fireBeforeSaveHooks` already uses (`crud_overlay.js:950`), so the witnessed engine runs **verbatim** in the
  browser; no reimplementation. Then:
  - `ok` → picker `SELECT pk,name FROM t WHERE (<r.sql>) ORDER BY pk LIMIT 200`, and `f.admitted` = the
    **unlimited** id set from the same clause (so a legal row past row 200 is never rejected on save).
  - `deferred==='unresolved-tokens'` → **no rows**, blank option only (E3), tokens named in the log.
  - any other `deferred`, or the WHERE throws (a column this narrower seed lacks) → **degrade to the
    unfiltered picker**, reason logged. Rationale: those are OUR interpreter's limits, not iDempiere's
    verdict — narrowing to zero on our own gap would hide rows iDempiere DOES show. Named, never silent.
  - **the §IMPL F5 blank option is preserved in every arm** — the filter narrows the list, it must never
    re-introduce the auto-select-row-1 bug PR #1613 just fixed.
  - `§VALRULE col= vr= rule="" table= before= after= admitted= verdict=` logged per field.
- **P3.5** the `@token@` feed, `_valRuleCtx(code, e, orig)`: iDempiere's window context is every column of the
  row under edit plus the globals. Record first (`orig` overlaid with `gatherVals(e)`, lower-cased), then
  globals fill only what the record lacks: `AD_Client_ID`/`#AD_Client_ID` ← `APP.clientId`, `AD_Org_ID`/
  `#AD_Org_ID` ← `APP.orgId`, `#AD_User_ID`/`SalesRep_ID` ← `APP.actor`, `#Date` ← today, and `IsSOTrx` ←
  `APP._createIsSOTrx` on a CREATE (**the per-window signal `_docCtx` already extracts — reuse it, do not
  write a second reader**). AD tokens are CamelCase and our records are lowercase, so the ctx is built by
  resolving `AdValRule.tokensIn(code)` case-insensitively — that mapping is OURS (a storage detail), so it
  lives in the wiring, not in the engine. **A token whose value is absent or empty is left OUT of the ctx**,
  so the engine reports it unresolved and E3 fires — never defaulted to something plausible.
- **P3.6** `crud_core.validateField` fk arm: `f.admitted && !f.admitted[String(val)]` → `'valrule:not-admitted'`.
  PURE, and it reads the **same** map the picker was built from, so the offered set and the accepted set
  cannot disagree. No `admitted` map (no rule, or a degraded arm) → behaviour unchanged.
- **P3.7** ship `erp/ad_valrule.js` (byte-identical to `build/erp/ad_valrule.js`), `<script>` it in
  `idempiere.html`, add it to `sw.js` PRECACHE + bump CACHE_VERSION, and declare the pair `identical` in
  `scripts/erp_twins.json` (W-ERP-TWIN: an undeclared judged twin fails the gate by design).

### §P3-WITNESS — W-PARITY-VALRULE, claim and falsifier
`erp/tests/poc_parity_valrule_live.js`, modelled on `poc_parity_reflist_live.js`/`poc_parity_fieldset_live.js`.
Real DOM, real render. **Every expected value is read from `window.__idmpDb` at run time — none typed in.**
- **A** (static + E4 precedence) tab 257 `c_doctype_id`: options == the seed's own count for rule **52053**,
  and `before > after` (**52 → 3**). Proves the AD_Field rule beat the AD_Column rule.
- **B** tab 186 `c_bpartner_id`: **113 → 42** (rule 230).
- **C** tab 330 `c_order_id`: **44 → 2** (rule 218).
- **D** (the token arm, E3) tab 186 `c_bpartner_location_id`, rule 167 `@C_BPartner_ID@`: New form, no BP →
  **0 option rows** (blank only); then set `c_bpartner_id` → repopulate → exactly that BP's ship-to locations.
- **FALSIFIER** a row the rule EXCLUDES — an id read from the seed as `IN (all) NOT IN (admitted)` — is
  (i) absent from the picker's options and (ii) `CORE.validateField(f, thatId)` returns `valrule:not-admitted`.
- **VACUITY** `ad_client_id` (129, 6→6), `c_invoice_id` (220, 20→20) and `c_campaign_id` (236, 2→2) are
  reported **NO-BITE**, never as passes; any A–D column whose `before == after` at run time is reported
  **INCONCLUSIVE**, not PASS.
- 0 pageerrors, per the sibling witnesses.

### §P3-LIMITS — named, measured, NOT built here
- **18 of the 61** resolve to a target table that does not exist under the picker's `<col minus _id>`
  convention — `c_doctypetarget_id`, `bill_bpartner_id`/`bill_location_id`/`bill_user_id`, `dropship_*`,
  `returnlocation_id`/`returnuser_id`, `salesrep_id`, `c_activity_id`, `c_cashplanline_id`. These fk pickers
  **already** degrade to the raw value today and are unchanged by this item; resolving an AD_Ref_Table/Search
  target is the same out-of-scope item §IMPL already named.
- **1 of the 61 is a List, not an FK** — `trxtype` on tab 330 (ref 17). A val rule over an `AD_Ref_List` set
  is a different surface from the FK picker. Named, not wired.
- **The 5-of-332 uninterpretable rules, named as required:** id **118** (`empty` — blank Code) and
  **52056 · 210 · 200162 · 200064** (`unsafe` — the clause carries `;`, `--`, `/*` or `union`, which this
  engine refuses to embed in a SELECT by design). **None of the five is bound to any field on the five
  document tabs** (the 61 classify 25 static / 36 token, zero empty, zero unsafe), so none was skipped here.

## §P3-RESULT 2026-09-02 — §P3 SHIPPED. W-PARITY-VALRULE 23/23 PASS, 0 FAIL, 0 INCONCLUSIVE
**bim-ootb PR #1626** (`feat/erp-parity-valrule`, base `origin/main` 138af115 with #1613 already in), 7 files
+537/−15, `erp/sw.js` **v774 → v775**. Logs read, not exit codes (Log Mandate).

**The item is DONE as specced: wiring, not a new evaluator.** `build/erp/ad_valrule.js` now SHIPS as
`erp/ad_valrule.js`, byte-identical (`14c565231a8e0136f89f851e9a6cc144`), declared `identical` in
`scripts/erp_twins.json`, and it runs in the browser through `_mvB3` — the SAME better-sqlite3 shim
`fireBeforeSaveHooks` already used — so the witnessed engine executes verbatim. No second interpreter exists.

### What the witness asserts (`erp/tests/poc_parity_valrule_live.js`, real DOM, 71 `§VALRULE` lines)
Every expected count, id and clause is read from the seed through `window.__idmpDb` **at run time**; the
oracle's own token substitution is a plain `String.replace`, deliberately NOT `ad_valrule.substitute`, so the
expectation is independent of the engine under test.

| arm | column | rule | before → after | note |
|---|---|---|---|---|
| **A** | 257 `c_doctype_id` | **52053** | **52 → 3** | the ONE field-level rule on the five tabs; **it beat its column's rule 125** — E4 proven live, not assumed |
| **B** | 186 `c_bpartner_id` | 230 | **113 → 42** | curated AND val-ruled — see the merge defect below |
| **C** | 330 `c_order_id` | 218 | **44 → 2** | |
| **D** | 186 `c_bpartner_location_id` | 167 `@C_BPartner_ID@` | **16 → 0**, then **→ 1** | the TOKEN arm, both halves |

- **D is the E3 proof.** With no BPartner chosen: `§VALRULE … verdict=unresolved-tokens unresolved=[C_BPartner_ID]
  ctx={} offered=0` — the lookup offers **NO ROWS**, matching `MLookup.java:1128-1140`, instead of silently
  showing all 16. Then `c_bpartner_id=112` → the dependent lookup re-narrows to exactly `["108"]`, that
  partner's only active ship-to location, with `ctx={"C_BPartner_ID":"112"}` in the log.
- **FALSIFIER fires in BOTH directions.** Excluded `C_BPartner 1200001`: absent from the picker AND
  `validateField → valrule:not-admitted`. Control, admitted `119`: `null`. Before the merge fix the same
  falsifier read `inOptions=true validate(excluded)=null` — it was **RED first**, which is what makes it real.
- **Vacuity is reported, never passed:** `§PARITY-VALRULE-VACUITY applied=32 BITE=24 NO-BITE=8`, with the 8
  named (`c_paymentterm_id` 5→5, `c_campaign_id` 2→2, `c_invoice_id` 20→20). `§PARITY-VALRULE-DEGRADED 0`.

### §P3-RESULT-DEFECT-1 — the engine's token feed was broken for a quarter of the token rules
As specced in §P3-DEFECT and confirmed empirically: `substitute()`'s auto-quoting emitted `''Y''` on the
pre-quoted idiom — `SQL ERROR: near "Y": syntax error`, so the filter **could not run at all**. Fixed to the
faithful `Env.parseContext(forSQL=true)` semantics. Measured after the fix, the four rules that had been
dead now filter: **271 → 3 · 52098 → 5 · 52055 → 6 · 200096 → 8 rows**.
**Both W-VALRULE witnesses re-run and NOTHING MOVED** — `W-VALRULE PASS`, and `W-VALRULE-HARDEN PASS` with
its membership sets still diff=0 against the **live iDempiere Postgres oracle** (its `§FALSIFIER` still fires,
`diff=8`). That is the proof the correction is a correction, not a re-baseline.

### §P3-RESULT-DEFECT-2 — a curated pin swallowed the rule (found by the witness going RED)
`mergeCuratedWithFold` (§IMPL P1.1) layered only `displaylogic/readonlylogic/mandatorylogic/seq` onto a
pinned curated field, so a lookup that is **both curated and val-ruled** kept the unfiltered picker:
`c_order.C_BPartner_ID` offered all **113** partners while the identical rule bit correctly on every
non-curated column. `valruleid` joined the layered key list — additive (no curated field has ever carried
one) and it does not touch the attributes §IMPL F3 pinned deliberately. **This is exactly the class of defect
§P1's own witness could not see**, because W-PARITY-FIELDSET counts fields and checks pin ORDER, never what a
pinned field's picker offers.

### Regression (all re-run this session, on the work tree)
- **W-PARITY-REFLIST 14/14 PASS** · **W-PARITY-FIELDSET 30/30 PASS** — #1613's contract held.
- **W-ERP-TWIN PASS**, `pairs=43 identical=11 unreviewed=9 undeclared_or_broken=0`. `ad_valrule` reads
  `NO-SHIP` until #1626 merges (the gate compares against `origin/main` bytes by design), then becomes `SAME`.
- **O2C `WITNESS_ROOT=/tmp/wt-erp-valrule`: stages 1/2/3/5/6/7 PASS** — the contract nine merged PRs closed
  against still holds, and stage 1 completed on `c_bpartner_id=112`, one of the 42 the new filter admits.
  Stage 4 FAIL / stage 8 ABSENT are the known pre-existing structural gaps, untouched.

### Still open after §P3 (named, not built — no ⛔ questions arose; nothing needed a user decision)
1. **18 of the 61** val-ruled fields resolve to a target table absent under the `<col minus _id>` convention
   (`c_doctypetarget_id`, `bill_bpartner_id`/`bill_location_id`/`bill_user_id`, `dropship_*`,
   `returnlocation_id`/`returnuser_id`, `salesrep_id`, `c_activity_id`, `c_cashplanline_id`). Their pickers
   already degraded to the raw value BEFORE this change and are unchanged by it — the fix is AD_Ref_Table/
   Search target resolution, the same out-of-scope item §IMPL named, not a §P3 regression.
2. **`trxtype` (330, ref 17)** — the one val-ruled LIST on the five tabs. A rule over an `AD_Ref_List` set is
   a different surface from the FK picker; `foldCrudSpec` carries the id, nothing consumes it for lists yet.
3. **`AD_Val_Rule_Lookup_ID`** — the second rule column `AD_Field_v` also resolves
   (`COALESCE(f.ad_val_rule_lookup_id, c.ad_val_rule_lookup_id)`, used by the Info-window lookup). Not read.
4. **The 5-of-332 uninterpretable rules, named as required:** **118** (`empty` — blank Code) and
   **52056 · 210 · 200162 · 200064** (`unsafe` — the clause carries `;`, `--`, `/*` or `union`, which the
   engine refuses to embed in a SELECT). **None is bound to any field on the five document tabs**, so none
   was skipped in this work; they remain deferred at the engine level.
5. **`ad_modelval` twin reconciliation** (§IMPL-RESULT-F7) is still open and still the right next item before
   any `ad_modelval` change — untouched here.

## §TWIN-WIDENED 2026-09-02 — the gate had the blind spot it was built to catch
`check_erp_twins.js` scanned for the literal string `build/erp/<mod>` only. `scripts/poc_valrule.js:13`
requires via `path.join(__dirname,'..','build','erp','ad_valrule.js')` — separate segments — so that idiom was
**invisible to the gate**. Same defect class as the §P4 oracle whose parse window ended early, and the same
class CLAUDE.md rule 4 names *scope-blind*: it passed because the defect sat outside the pairs it inspected.
Found while verifying §P3's own twin declaration, one run after the gate first went green.

**Scan widened to both idioms. What the blind spot was hiding, measured:**

| | before | after |
|---|---|---|
| judged pairs | 43 | **57** |
| witness refs judging an UNREVIEWED copy | 47 | **94** |
| undeclared (would fail the gate) | 0 | 11, now classified |

Newly seen and locked `identical` (matched what ships): `bigdecimal` n=3 · `inout_confirm` n=2 ·
`kitchen_core` n=1 · `ninja_bundle` n=2 · `ninja_create` n=1 · `ninja_export` n=1 · `ninja_stage` n=5 ·
`ninja_starter` n=1 · **`pos_core` n=15**. Newly seen and DRIFTED, so `unreviewed`: `img_store` n=2 ·
**`ninja_model` n=6**.

Gate green again on the widened scan: **57 pairs · 22 identical · 11 unreviewed · 0 undeclared**. Falsifier
re-proved on the widened scan against a newly-locked pair (`pos_core`, n=15): one appended line → `BROKEN`,
exit 1, restored to `9b394091…`.

**⬜ Still not done, and now bigger than it looked:** classify the **11 UNREVIEWED** pairs — **94 witness
references** currently attest a copy nobody has confirmed is the shipped code. Rank by n: `kernel_ops` **16**
(the signed write path), `ad_modelval` **11**, `crud_overlay` **9** (partly expected — §S60 split `crud_core.js`
out of the shipped file after the copy was taken), `ninja_model` **6**, `erp_period_close` 5, then the tail.
Each is either a deliberate node-harness shape (→ `divergent`, with the reason recorded) or a stale copy
(→ reconcile, then `identical`). **Never move a pair to `divergent` to silence the gate.**

## §TWIN-CLASSIFIED 2026-09-02 — the 11 UNREVIEWED pairs, classified from diffs + witness logs (SPEC first, results below)
Scope: empty the `unreviewed` column of `scripts/erp_twins.json` honestly. Rule held throughout: a pair moves to
`divergent` ONLY when every differing line is harness/shape (kind a); a pair moves to `identical` ONLY after the
copy is byte-equal to `origin/main:erp/<mod>.js` AND every witness that judges the copy has been re-run and its log
read. **Never `divergent` to quiet the gate.** Shipped bytes = `git show origin/main:erp/<mod>.js` (bim-ootb at
`bc470d71`); the local bim-ootb checkout was 22 behind, irrelevant because the gate reads origin/main blobs.

### Method (what was measured before any edit)
1. `diff <shipped> <copy>` for all 11, saved; line counts + md5s recorded in the gate log (`build/erp/check_erp_twins.log`).
2. BASELINE: every `scripts/{poc_,witness_,test_}*.js` that requires any of the 11 copies (80 scripts, both require
   idioms) run through `run_witness.sh` BEFORE any edit — logs kept. Result **73/80 PASS**; the 7 non-PASS are all
   pre-existing on the untouched copies: `poc_morder_save` (the §IMPL-RESULT-F7 artefact — the copy lacks P1.5's
   hooks), `poc_rate_input` (stale `require('../site/bigdecimal.js')` — module lives at `build/erp/bigdecimal.js`),
   `test_crud_writeloop_overlay` (see results), and 3 marker-regex misses (`poc_genesis_minimal`, `poc_ninja_model`,
   `poc_ninja_stage`, `poc_scale_forecast` print `N PASS / 0 FAIL` without the `run_witness.sh` marker shapes).
3. Per pair, the diff was split into (a) harness/shape vs (b) content. **Finding: NONE of the 11 has a single (a)
   line — the UMD wrappers are already shared. So `divergent` is not an honest verdict for any of them.** Every pair
   is either the copy simply OLDER than what ships (8 of 11), the copy AHEAD of what ships (2), or a mis-pairing (1).

### Classification (planned verdict · evidence · the action that earns it)
| pair | direction | evidence | action |
|---|---|---|---|
| `kernel_ops` (39 scripts) | shipped ⊃ copy (v13 vs v9) | every copy-only line is the OLDER form of a line shipped replaced: T6 persist guard, T2 content-sign, T7 incremental verify, F1/F2/F10 op-store rows, S7 emitter, S8 kid. No copy-richer content (the §INTEG-COLLAPSE bidirectional case does NOT recur) | copy ← shipped bytes; run all 80; lock `identical` |
| `ad_modelval` (12) | shipped ⊃ copy | P1.5 hooks (`bpLocationDefault`, `salesRepFromCtx`), §DOCTYPE-PER-WINDOW, `deliveryInvoiceRuleDefault`, §Fix 2 `movementTypeFromWindow`, §Fix 4 `issotrxFromWindow` + `pick()` — all shipped-only | copy ← shipped; expect `poc_morder_save` to flip GREEN (that is the §F7 proof) |
| `crud_overlay` (18) | shipped ⊃ copy, reshaped by §S60 | node witnesses only ever see CORE (`module.exports = CORE; return;` at copy:619 precedes all DOM code). Copy-CORE vs shipped `crud_core.js`: 89 function bodies identical, 32 copy-only lines = older forms (`cleanVals` 2→3 args, CamelCase→lowercase audit keys, `+updated`) + the header comment; 539 shipped-only lines = §P1/§P2/§P3/T-0 additions | copy ← shipped `crud_overlay.js` (the shim) + NEW `build/erp/crud_core.js` ← shipped; gate widened to follow `require('./x.js')` inside a judged module (idiom c — otherwise the 18 witnesses' real target is unjudged: the exact scope-blind class §TWIN-WIDENED fixed once already); both locked `identical` |
| `erp_period_close` (8) | shipped ⊃ copy | T3 archive-first gate + §PCLOSE-RACE pin (#640). CONTRACT CHANGE: compaction now fires only with a confirmed `archiveSink` — bim-ootb's own `erp/tests/witness_pclose_archive.js §T3-NO-SINK` proves "no sink → history retained" | copy ← shipped; `test_kernel_period_close.js` froze the pre-T3 contract (asserts `liveLen===1` with no sink) → expected RED; fix = supply a confirming sink at the compaction-asserting calls (witness moves to the shipped contract, not the reverse); `poc_bootstrap_path` S-FLAT reads postOps by id so may survive — read the log |
| `erp_key_epochs` (1) | shipped ⊃ copy (v3 vs v1) | shipped header says verbatim "PORTED from bim-compiler build/erp/erp_key_epochs.js … two upgrades" (roster, `verifyEpochSigsOps`, `verifyMultiDeviceOps`, content-aware `_sigMessage`); `_kernel()` absent in node → falls back to op_hash = v1 semantics | copy ← shipped; `poc_rotate` |
| `erp_sync_fsm` (1) | shipped ⊃ copy | S7 `gid/branch_id/sig` survive `rebase()` (#930); needs kernel_ops schema ≥ v13 → ported AFTER kernel_ops | copy ← shipped; `poc_blackout_resume` + `test_kernel_{sync,rebase,relay}` |
| `erp_engine` (2) | shipped ⊃ copy | `completeReceipt` (§Fix 3, W-FOLD-MATCHPO) shipped-only | copy ← shipped |
| `img_store` (2) | shipped ⊃ copy | `digestOf` content-address check (#277); `resolveImage` became async — both witnesses already `await` it | copy ← shipped |
| `ninja_model` (6) | **copy AHEAD** | copy carries the `@callout` grammar (bim-compiler `82320be69`, 2026-06-14, touched ninja_model+ninja_stage). bim-ootb #309 shipped the ninja_stage half (`col.callout` consumed at shipped `ninja_stage.js:146-153`, locked identical) but never the model half → the feature is HALF-SHIPPED in production. No bim-ootb PR ever carried it (searched) | forward = bim-ootb branch: `erp/ninja_model.js` ← copy (byte-equal), sw `CACHE_VERSION` bump, `?v=` bump. Stays `unreviewed` until merged (gate reads origin/main) — parent opens the PR |
| `report_overlay` (4) | **bidirectional** | shipped-only: `lc()` CamelCase aliasing for the browser bundle + comments (kind b, browser need). copy-only: `foldQWeb` (81 lines, W-ODOO-QWEB, judged by `poc_fold_qweb`) — NO consumer anywhere in bim-ootb `erp/` | port `lc()` forward into the copy; EXTRACT `foldQWeb` to `build/erp/report_qweb.js` (a copy-only research module — the tree already holds 24 such NO-SHIP modules; shipping 81 dead lines to the browser is the "add" that feedback_strip_not_add forbids). `poc_fold_qweb` re-pointed, must stay GREEN; then `identical`. REVERSIBLE — if shipping is preferred it is a 1-hunk bim-ootb PR |
| `system_monitor` (1) | **mis-paired** | copy == shipped `erp/field_health.js` except 2 lines (export `ERP.SystemMonitor`→`ERP.FieldHealth`, load tag). bim-ootb #513 shipped the copy UNDER A NEW NAME; shipped `erp/system_monitor.js` is an unrelated modal (`open/close/_rebuildSeed/resolveRelease`) | rename copy → `build/erp/field_health.js` taking the 2 shipped lines; repoint `poc_system_monitor.js`, `build/erp/system_monitor.html`, `smoke_system_monitor.js`; manifest row `system_monitor` removed (no witness judges it), `field_health` locked `identical`. `deploy/dev/system_monitor.{html,js}` is a deployed sandbox snapshot — NOT edited here (OCI flow), named as a third copy |

Witness protocol per port: run the module's judging set (kernel_ops → all 80), read `build/erp/<w>.log`, diff verdicts
against the baseline. A witness that goes RED is investigated before anything else moves; a reconcile is never forced
through a red.

### §TWIN-CLASSIFIED-WITNESS-FIXES — the reds the ports produced, each traced to a stale WITNESS contract (spec before edit)
Every red below was investigated against the bim-ootb commit that changed the behaviour; none is a product break,
each is a bim-compiler witness that froze a pre-change contract. Fix = move the witness to the shipped contract,
keeping its claim; never weaken the claim, never touch the ported module.
1. `test_kernel_rebase.js` / `test_kernel_relay.js` (+ `test_kernel_sync.js`, `test_crud_writeloop_overlay.js`): FATAL
   `no such column: branch_id` at `erp_sync_fsm.js:179`. They load `~/bim-ootb/viewer/kernel_ops.js` (the VIEWER
   kernel, v8) — but `erp_sync_fsm.js`/`crud_core.js` ship with `erp/kernel_ops.js` (v13, `branch_id` column, S7
   #930). Harness mis-pairing: point `KERNEL` at `build/erp/kernel_ops.js` (now byte-equal to what ships).
2. `test_kernel_period_close.js:78` §PCLOSE-COMPACT: the T3 archive-first gate (#640) compacts ONLY after a confirmed
   `archiveSink`. Supply a confirming sink at the compaction-asserting call and ADD to the same verdict that the sink
   received exactly the `archived` rows BEFORE the delete (archive-first is the new claim; the other 4 closes assert
   nothing about compaction and stay sink-free — they double as the §T3-NO-SINK proof: `§PCLOSE-NOARCHIVE` ×4 in the log).
3. `poc_crud_persist.js:82` control: `validateField(…, '', '')` — bim-ootb #353 (in-place edit) made an UNCHANGED
   field (`val===orig`) skip validation (GridField parity). The control's real symptom is "stored date blanked by the
   widget" = `val=''`, `orig=<stored>`; pass `orig=seeded` — 'required' under BOTH contracts, and now models the bug.
4. `poc_audit_changelog.js:47-57`: W-STD-DEFAULTS reads `r1.CreatedBy/AD_Client_ID/IsActive/Processed/Created/Updated`;
   bim-ootb #968 (2026-07-22) made the stdDefaults fold write LOWERCASE keys ("fixes AD_Org_ID=NaN"). Read lowercase.
5. **NOT a witness fix — a SHIPPED DEFECT the twin discipline surfaced.** `poc_audit_changelog` ("UPDATE stamps
   UpdatedBy=actor") and `poc_recinfo` ("tip.UpdatedBy == recordInfo.updated.actor") stay red on the byte-identical
   copy because shipped `crud_core.js:461` still writes `ex['UpdatedBy'] = p.actor` (CamelCase) on CRUD_UPDATE while
   bim-ootb #968 (2026-07-22) lowercased every other stamp and stated the rule ("every OTHER key on nr is lowercase …
   nothing anywhere in erp/ reads the mixed-case form"). A created-then-updated row therefore carries BOTH
   `updatedby`=creator (from :427) and `UpdatedBy`=updater (from :461); any lowercase reader sees the CREATOR as the
   last updater. Fix = `ex['updatedby']` at :461 — applied to the copy AND pushed on the bim-ootb branch; `crud_core`
   stays `unreviewed` (copy is 1 line AHEAD of origin/main) until that merges, same treatment as `ninja_model`.
   Evidence = these two witnesses going GREEN on the fixed bytes and RED on the shipped bytes (falsifier held).

### §TWIN-CLASSIFIED-RESULT 2026-09-02 — 9 of 11 locked `identical`, 2 forward-ports pushed to bim-ootb, 0 `divergent`, 1 shipped defect found
**Gate (`build/erp/check_erp_twins.log`):** `§TWIN_SUMMARY pairs=64 identical=36 unreviewed=3 undeclared_or_broken=0
witnesses_judging_an_unreviewed_copy=31` — was `57 · 22 · 11 · 0 · 94` at the start of the session. **Not one pair
became `divergent`**: none of the 11 had a single harness/shape line to justify it (§Method 3).

| pair | verdict | evidence (copy md5 = shipped md5 unless stated) | witnesses re-run, logs read |
|---|---|---|---|
| `kernel_ops` | **identical** `3f5f6215` | v9→v13, every diff line the older form of T6/T2/T7/F1-F10/S7/S8 | ALL 80 scripts (baseline 73/80 → 74/80): 0 regressions; `poc_rate_input` newly runs+passes (stale `site/` require fixed); 39 logs print `§KERNEL_OPS_LOADED v13`, 0 print v9 |
| `ad_modelval` | **identical** `7e6a3fda` | P1.5/§Fix2/§Fix4 hooks shipped-only | 12: `poc_morder_save` **FAIL→PASS** (§IMPL-RESULT-F7 closed), the other 11 unchanged PASS |
| `crud_overlay` | **identical** `23c6cc56` | §S60 shim; copy-CORE vs `crud_core.js`: 89 bodies equal, 32 older lines | 18 + `test_crud_*`: all PASS after the 3 witness-contract moves below; `test_crud_writeloop_overlay` baseline-red **→ PASS** (was on the viewer kernel) |
| `crud_core` (new, via idiom c) | **unreviewed — copy 1 line AHEAD** `5ef113a1` vs `fe46de53` | shipped `:461 ex['UpdatedBy']` violates #968's own lowercase rule → created-then-updated row carries both keys | `poc_recinfo` RED on shipped bytes / GREEN on the fix (falsifier held); `poc_audit_changelog` 25/25. Fix on bim-ootb `fix/erp-twin-forward-ports` `51234b55` |
| `erp_period_close` | **identical** `75c64b9d` | T3 archive-first + §PCLOSE-RACE shipped-only | 8 + `test_kernel_period_close` (now asserts archive-first: `sinkRows=15 compacted=true`; 4 sink-free closes log `§PCLOSE-NOARCHIVE compacted=false` = the §T3-NO-SINK proof), `test_integ_postings_reconcile`, `test_persist_slice`: PASS |
| `erp_key_epochs` | **identical** `35d95d06` | shipped header: "PORTED from bim-compiler … two upgrades" | `poc_rotate` PASS |
| `erp_sync_fsm` | **identical** `788b3e77` | S7 rebase survival shipped-only | `poc_blackout_resume` PASS; `test_kernel_{sync,rebase,relay}` PASS once paired with the ERP kernel |
| `erp_engine` | **identical** `9a28979b` | `completeReceipt` shipped-only | `poc_blue_future` PASS, `poc_genesis_minimal` 16/16 (marker-miss only) |
| `img_store` | **identical** `cac4a07a` | `digestOf` shipped-only; async `resolveImage` already awaited | `poc_img_sync`, `poc_img_folder` PASS |
| `report_overlay` | **identical** `512368bd` | `lc()` ported in; `foldQWeb` extracted VERBATIM to `build/erp/report_qweb.js` (copy-only, gate rows it NO-SHIP) | `poc_fold_qweb` W-ODOO-QWEB `maxDiff=0.00c §FALSIFIER=LOAD-BEARING` on the extracted module; `poc_pa_report`, `poc_money_fold`, `poc_proc` PASS |
| `ninja_model` | **unreviewed — copy AHEAD** `d1d7a45a` vs `68e75e4d` | `@callout` grammar half-shipped (#309 shipped the stage half only) | 6 witnesses judge the same bytes now on bim-ootb `fix/erp-twin-forward-ports` `355ac9bb` (+ sw v776, `?v=2`); `poc_ninja_callout/bundle/export/extract` PASS, `model/stage` substantive PASS lines (marker-miss) |
| `system_monitor` → `field_health` | **identical** `b314de93` (renamed) | copy == `erp/field_health.js` bar the 2 lines #513 changed when it shipped renamed; shipped `system_monitor.js` is an unrelated modal | `poc_system_monitor` PASS (`§FIELDHEALTH_LOADED v1`, `§MON-WITNESS OVERALL=PASS`); `smoke_system_monitor.js` + `build/erp/system_monitor.html` repointed; `deploy/dev/system_monitor.{html,js}` NOT touched (OCI sandbox snapshot — a third copy, named) |

**Final full run (80 scripts): 76/80 PASS.** Baseline→final flips: `poc_morder_save`, `poc_rate_input`, `test_crud_writeloop_overlay`
FAIL→PASS; zero PASS→FAIL. The 4 non-PASS are pre-existing `run_witness.sh` marker-regex misses with substantive pass lines
in their logs (`poc_genesis_minimal` "16 PASS / 0 FAIL", `poc_ninja_model` `vsOracle=MATCH`, `poc_ninja_stage` `render=PASS
rollback=PASS`, `poc_scale_forecast` DONE) — outside twin scope, named here, not touched.

**Gate widened twice more (each with its own falsifier in the log):** (c) transitive `require('./x.js')` inside a judged module
— surfaced `genesis_seed` (undeclared, byte-equal → locked) and is what lets `crud_core` be judged at all; the baseline log
of the same tree had neither row. (d) `test_*.js` are witnesses — surfaced `erp_relay_client`, `erp_replica_client`,
`help_idmp` (byte-equal → locked) and **`help_overlay` DRIFTED** (shipped 408L vs copy 357L, 137 diff lines, copy last
touched 2026-06-01 vs shipped 2026-06-09; judged by `test_help_nextgate/coach`, `test_tour_idempiere`) → declared
`unreviewed` with those facts, NOT classified — outside the 11.

**bim-ootb side (parent opens the PR — standing rule):** branch `fix/erp-twin-forward-ports`, 2 commits off `bc470d71`:
`355ac9bb` ninja_model `@callout` + sw v775→v776 + `idempiere.html ninja_model.js?v=2`; `51234b55` crud_core `:461`
lowercase `updatedby`. On merge: flip `crud_core` + `ninja_model` to `identical` in `scripts/erp_twins.json` and re-run
the gate — that is the whole remaining step for those two. `help_overlay` is the next pair to classify.

**No ⛔ BLOCKED items.** One reversible judgment call: `foldQWeb` extracted rather than shipped (no bim-ootb consumer;
24 copy-only research modules already follow that pattern) — if shipping is preferred it is a 1-hunk bim-ootb PR and
`report_qweb.js` goes away.

### §TWIN-CLASSIFIED-MARKERS 2026-09-03 — the 4 witnesses `run_witness.sh` reported non-PASS while passing (spec before edit)
A verdict instrument that cannot recognise its subject's pass line is the same defect class as a witness judging a
stale copy. Fix where honesty lives: (1) HARNESS — add the count-summary convention `N PASS / 0 FAIL` with N ≥ 1 to
`PASS_RE` (`poc_genesis_minimal` prints `16 PASS / 0 FAIL`; a `0 PASS / 0 FAIL` vacuous run must still FAIL, and the
fail-marker check still runs first). The `§RUN_WITNESS <base> VERDICT=` line format is untouched (`system_is_real.sh:92`
greps it). (2) WITNESS — `poc_ninja_model` / `poc_ninja_stage` compute a real verdict (`vsOracle`, `render&&rollback`)
but print no marker: add `🟢 W-NINJA-MODEL PASS` / `🔴 … FAIL` (and make the model witness's falsifier load-bearing on
exit — today a failed falsifier printed FAIL and exited 0). (3) `poc_scale_forecast` has NO assertion — an unconditional
`exit(0)` after a prose VERDICT box. A marker alone would be a lie; instead the three claims the box already prints
(batch speedup > 1 · large-tier util < 100% · checkpoint boot flat vs the genesis cliff) become checks over the same
measured values, with `🟢 W-SCALE-FORECAST PASS` / `🔴 … FAIL` + exit code. Nothing new is measured.
GUARD PROOF (the point of the marker rule): synthetic probes through `run_witness.sh` — silent exit 0 → FAIL;
`0 PASS / 0 FAIL` → FAIL; `3 PASS / 1 FAIL` → FAIL; bare `PASS` → FAIL; `5 PASS / 0 FAIL` + a `🔴 FAIL` line → FAIL;
`🟢 X PASS` with exit 1 → FAIL; `5 PASS / 0 FAIL` → PASS. Probe logs read, listed in the result.

### §TWIN-CLASSIFIED-2 2026-09-03 — help_overlay (spec before edit)
Diff (shipped 408L vs copy 357L, 137 lines): EVERY differing line sits in the DOM half BELOW the node early-return
(`module.exports = COACH; return;` at :64, identical in both) — shipped carries the 2026-06-03/06-09 host-adapter lift
(`init/NAV/gbLocate/setOps`, `#417d9c60`/`#53c615c2`), the copy the older glassbowl-globals form. No copy-richer
content, no harness/shape line → kind (b), shipped-forward: copy ← shipped bytes (`05e00670`). Witnesses:
`test_help_coach` PASS before+after, `test_help_nextgate` PASS before+after (both see only COACH), `test_tour_idempiere`
— the ONLY witness that loads the DOM half (vm shim, asserts `__help.init`/`adapter()`) — FAILED before AND after on
`ENOENT docs/HelpO2C.md`: the fixture moved to `docs/internal/HelpO2C.md` in `87bc56b47` (2026-06-30) and the witness
never followed. Fix the path (a stale fixture, same class as §WITNESS-FIXES 1) and let it judge the port; lock
`identical` only if it is GREEN on the shipped bytes.

### §TWIN-CLASSIFIED-2-RESULT 2026-09-03 — the thread finished: `unreviewed` = 0
**Gate:** `§TWIN_SUMMARY pairs=64 identical=39 unreviewed=0 undeclared_or_broken=0 witnesses_judging_an_unreviewed_copy=0`
(session start: `57 · 22 · 11 · 0 · 94`). Log `build/erp/check_erp_twins.log`.

1. **`crud_core` + `ninja_model` → identical.** bim-ootb #1632 MERGED `8b50598d` (2026-09-02T15:37Z) with three commits:
   `355ac9bb` ninja_model `@callout`, `51234b55` crud_core `:461`, and the coordinator's sibling `94cea2bc` for `:460
   ex['Updated']` — the same defect one line up, which I missed. **Lesson recorded: a casing/convention fix is checked
   against its immediate siblings in the same stamp block before it is called one line.** Shipped md5s re-derived from
   `origin/main`, not reused: `crud_core` `8e289713` (copy ← those bytes), `ninja_model` `d1d7a45a` (= copy). The 26
   crud/report/monitor witnesses re-run on the sibling-fixed bytes: **26/26** (W-AUDIT-CHANGELOG 25/25, W-RECINFO PASS).
2. **`help_overlay` → identical** (§TWIN-CLASSIFIED-2): all 137 diff lines below the node early-return; copy ← shipped
   `05e00670`; `test_help_coach`/`test_help_nextgate` PASS before+after; `test_tour_idempiere` had been dead since
   `87bc56b47` moved its fixture (`docs/HelpO2C.md` → `docs/internal/`) — path re-pointed, **24/24 PASS** on the shipped
   bytes (`§TOUR overlay=help_overlay host=idempiere forked=0 mounts=2 keysMatched=Y`).
3. **Marker misses → fixed with the guard proven** (§TWIN-CLASSIFIED-MARKERS): harness gains `N PASS / 0 FAIL` (N≥1);
   `poc_ninja_model`/`poc_ninja_stage` print explicit `🟢 W-… PASS`/`🔴 … FAIL` lines (model's falsifier now also
   load-bearing on exit); `poc_scale_forecast` asserts the three claims its VERDICT box already printed
   (`🟢 W-SCALE-FORECAST PASS — 3 measured claims hold`). Probes through `run_witness.sh`: silent → FAIL · `0 PASS / 0
   FAIL` → FAIL · `3 PASS / 1 FAIL` → FAIL · bare `PASS` → FAIL · `5 PASS / 0 FAIL` + `🔴 … FAIL` → FAIL (fail marker
   wins) · `🟢 X PASS` exit 1 → FAIL · `5 PASS / 0 FAIL` → PASS. `§RUN_WITNESS <base> VERDICT=` format unchanged.
4. **`deploy/dev/system_monitor.{html,js}` = a DEAD LOCAL SNAPSHOT, never uploaded.** `OCI_UPLOAD.md §RULES` rule 5 maps
   `deploy/dev/` → bucket `sandbox/`; HEAD/GET of `sandbox/system_monitor.html`, `sandbox/system_monitor.js` (and
   `sandbox/field_health.js`) return **404 on BOTH `bim-ootb-dev` and `bim-ootb-live`**. Nothing under `deploy/`
   references them. Created `e8d38b7de` (2026-06-24) for `SYSTEM_MONITOR_WIDGETS.md §DELIVERABLES` "deploy-stage to
   deploy/dev/ so it is reachable" — overtaken the same day by bim-ootb #513, which shipped the widget inside
   idempiere.html's System Monitor as `field_health.js` (live on GH Pages, precached). Right action: `git rm` the two
   local files (rule 2 satisfied — no references; no OCI object exists to delete; nothing to repoint). NOT done here —
   reported, as asked. The copy-side truth is `build/erp/field_health.js` + `build/erp/system_monitor.html`.

Deploy confirmation: closed by the coordinator (live `sw.js` is v776 in its MINIFIED form `CACHE_VERSION="v776"`; my
own fetch agrees: `age: 223 x-cache: HIT`, `version.json` `{build:v776, sha:8b50598d, pr:1632}`, `deploy-pages.yml:47-50`
minifies via `scripts/minify_pages.js` — so a source-shaped grep or a byte-md5 against the repo is the wrong instrument
for a live asset; match the minified shape).

**No ⛔ BLOCKED items.** Next for this gate, if anything: nothing in `unreviewed`; the manifest is the contract, the
gate fails on drift, `test_*.js` and transitive requires are in scope. The one standing recommendation is the
`deploy/dev` deletion above.

## §P7 — SPEC: close `§PARITY-MANDATORY-CREATE` (written 2026-09-03, BEFORE code)
Parent: §IMPL-RESULT's one ⛔ OPEN item — *"inline create validates against its post-render baseline, so an
UNTOUCHED empty mandatory field is never required-checked."* Worktree `/tmp/wt-erp-mand`, branch
`feat/erp-parity-mandatory`, base bim-ootb `8b50598d` (= origin/main, #1613/#1626/#1632 all in). Every number
below was measured from `erp/ad_seed.db` through the app's own fold THIS session; every Java cite was read from
`/home/red1/idempiere-dev-setup/idempiere` @ `87968daa` this session.

### §P7-EXTRACT — what actually fills an iDempiere New row before the mandatory check, read from source
- **E1 · `GridTab.dataNew` fires the callout for EVERY field, unconditionally** — `GridTab.java:1179-1181`
  (`for (int i=0; i<getFieldCount(); i++) processCallout(getField(i));`). `processCallout` has **no**
  null/empty-value guard (`GridTab.java:2988-3010`); individual callouts self-guard.
- **E2 · every column's New value comes from `GridField.getDefault()`** — `GridTable.java:2129-2143`
  (`Object value = field.getDefault(); field.setValue(...); field.validateValueNoDirect(); rowData[i]=field.getValue();`).
  Priority order `"123457"` (`GridField.java:98`): special-case → `@SQL=` → DefaultValue expression →
  user preference → system preference → **data-type default**.
- **E3 · the data-type stage, `GridField.defaultFromDatatype():1022-1051`, and its ORDER is load-bearing:**
  Button non-`_ID` → `"N"` (`:1027-1030`) · **YesNo → `"N"`** (`:1033-1036`) · **`_ID` → `null`**
  (`:1038-1041`) · **numeric → `"0"`** (`:1044-1047`). The `_ID` test precedes the numeric test, so **no
  `*_ID` column ever gets 0 from this stage** — including `M_AttributeSetInstance_ID`.
- **E4 · `DisplayType.isNumeric` = {11 Integer, 12 Amount, 22 Number, 29 Quantity, **37 CostPrice**}** —
  `DisplayType.java:329-333`, `SystemIDs.java:132 REFERENCE_DATATYPE_COSTPRICE = 37`.
- **E5 · THE ONE THAT UNBLOCKS THIS ITEM — `GridField.isMandatory(true):377-385` hard-exempts five column
  shapes, in a window, regardless of `IsMandatory='Y'`:**
  ```java
  if (m_gridTab != null && ( (m_vo.IsKey && ColumnName.endsWith("_ID"))
     || ColumnName.startsWith("Created") || ColumnName.startsWith("Updated")
     || ColumnName.equals("Value") || ColumnName.equals("DocumentNo")
     || ColumnName.equals("M_AttributeSetInstance_ID")   //  0 is valid
     )) return false;
  ```
  **`DocumentNo` and `M_AttributeSetInstance_ID` are never mandatory on a window** — two of the four blockers
  the prior session hit are removed by a FAITHFUL PORT, not by weakening anything. `isMandatory` also
  consults MandatoryLogic FIRST (`:355-369`, one-way override), skips virtual columns (`:372`), and ends at
  `isDisplayed(checkContext)` (`:388`) — a hidden field is never mandatory.
- **E6 · `GridTable.getMandatory():1973-2001` skips NOTHING of its own** — no read-only filter exists
  (`grep isColumnReadOnly` in `GridTable.java`/`GridTab.java` = 0 hits). Emptiness is `rowData[i]==null ||
  toString().length()==0` (`:1985`), so an `Integer 0` PASSES. *Our validator is stricter-in-our-favour here:
  `validateField` returns early on `eff.readonly`, so a read-only mandatory empty is not reported. That is a
  NARROWER check than iDempiere's — it can never produce a false reject — and it is named, not fixed here.*

### §P7-MEASURED — the real blocker population, folded through the app's own `foldCrudSpec`
`node` over `erp/ad_seed.db` + `crud_overlay.js`, `forVerb='create'`, counting fields where
`effectiveFlags(visible && required)` and the New-time value is empty:

| tab | table | folded | visible+mandatory | exempt (E5) | filled by AD default | filled by data-type default (E3) | **REMAINING, editable** |
|---|---|---|---|---|---|---|---|
| 186 | `c_order` | 56 | 29 | 1 | 15 | 5 | **7** |
| 257 | `m_inout` | 53 | 18 | 1 | 10 | 2 | **4** |
| 263 | `c_invoice` | 47 | 22 | 1 | 9 | 6 | **5** |
| 330 | `c_payment` | 78 | 22 | 1 | 12 | 6 | **3** |
| 349 | `c_allocationline` | 13 | 6 | 0 | 0 | 3 | **0** |
| 187 | `c_orderline` | 38 | 22 | 1 | 2 | 8 (+3 once E4 lands) | **6 → 3** |
| 258 | `m_inoutline` | 28 | 8 | 1 | 2 | 1 | **1** |

The remaining editable blockers, named in full (this is the whole surface the change turns ON):
- `c_order` — `c_doctypetarget_id, c_bpartner_id, c_bpartner_location_id, m_warehouse_id, m_pricelist_id, salesrep_id, c_paymentterm_id`. All but `c_bpartner_id` are derived by the faithful `MOrder.beforeSave` ports (§IMPL P1.5); `c_bpartner_id` is the USER's field and MUST reject — that is the falsifier.
- `m_inout` — `c_doctype_id, c_bpartner_id, c_bpartner_location_id, m_warehouse_id`. **No hook derives any of them** (`installMInOutSaveHooks` ports `MInOut.beforeSave:1304-1370` = movementType/deliveryRule/salesRep only). In iDempiere a manual Material Receipt with none of them is `SAVE_MANDATORY`. See §P7-WITNESS-FIX.
- `c_invoice` — `c_doctypetarget_id, c_bpartner_id, c_bpartner_location_id, m_pricelist_id, c_paymentterm_id`.
- `c_payment` — `c_doctype_id, c_bpartner_id, c_currency_id`.
- `c_orderline` — `c_bpartner_location_id, c_uom_id, priceentered, priceactual, pricelist, c_tax_id`; **`priceentered/priceactual/pricelist` are DisplayType 37 and become `0` once E4 lands**, leaving 3, and the O2C witness types all three.
- `m_inoutline` — `c_uom_id` (AD default `@#C_UOM_ID@`, a system preference — §P7-NOT-BUILT item 2).

### §P7-SPEC — four faithful ports, then the switch
- **P7.1 · `foldCrudSpec`: port `GridField.isMandatory():377-385`'s exemptions.** A folded field whose
  `columnName` is `DocumentNo` / `Value` / `M_AttributeSetInstance_ID` / starts with `Created` / starts with
  `Updated`, or is a key `*_ID`, folds `required:false` regardless of `IsMandatory='Y'`. PURE. Logged once per
  fold as `§GRIDFIELD-EXEMPT`. **Curated pins keep their curated `required`** (§IMPL F3 — `documentno` is the
  only overlap, and `_seedDocNoPreview` fills it on New anyway, so the O2C contract is untouched).
- **P7.2 · `foldCrudSpec`: port `GridField.defaultFromDatatype():1022-1051`,** in its source order, as the
  LAST default stage — only when no AD default resolved. PURE, no db.
- **P7.3 · `mapRefDisplayType`: DisplayType 37 (CostPrice) → `'number'`** (E4). It falls through to `string`
  today, which is why three mandatory price columns on a line read as un-defaulted text.
- **P7.4 · `renderInline`: a CREATE validates the WHOLE new row.** `saveForm(verb, e, verb==='create' ? null :
  (_inlineBaseline || orig), id)` — `validateField`'s own documented create contract (`crud_core.js:126`,
  `orig===undefined` → every field checked). The modal `openForm` path ALREADY passes `null` on create; this
  makes the inline path agree. **§IMPL P1.4's ordering is NOT touched** — `saveForm` still runs
  `fireBeforeSaveHooks → merge derived → validate → buildOp`, because iDempiere's own check runs over a row
  defaults+callouts already filled (E1/E2). **The validator is NOT weakened anywhere** (§P5).

### §P7-WITNESS — W-PARITY-MANDATORY-CREATE (claim + falsifiers), `erp/tests/poc_parity_mandatory_live.js`
Real DOM, real clicks, modelled on `poc_parity_fieldset_live.js`. Every expected column set is read from
`window.__idmpDb` at run time — none typed into the test.
- **A · the defect is GONE.** Tab 143 (c_order) New, type ONLY `documentno` → Save → **REJECT**, and
  `§PARITY-MANDATORY … missing=[…]` names `c_bpartner_id`. Pre-fix the same click SAVED.
- **B · the §IMPL-RESULT falsifier still holds** — the curated 8 typed → `§CRUD-PERSIST`, `missing=[]`.
- **C · exemption arm (E5).** On tab 187 (c_orderline) New, `m_attributesetinstance_id` folds `required=false`
  while `AD_Column.IsMandatory='Y'` read from the seed at run time — asserted as that exact contrast, so the
  arm cannot pass vacuously.
- **D · data-type arm (E3/E4).** `freightamt` (12) and `pricelist` (37) render `0`, not empty, on a New form;
  `isdiscountprinted` (20) reads `N`. Counts read from the seed.
- **FALSIFIER-1** an AD-mandatory column with no default and no derivation (`c_bpartner_id`) is REJECTED
  `required` — the validator is intact.
- **FALSIFIER-2** the *exemption* is load-bearing in the other direction: re-marking `documentno` mandatory in
  the fold makes the same untouched New reject — asserted through the pure engine, so it fires if P7.1 is ever
  widened to a column iDempiere does NOT exempt.
- **VACUITY** any arm whose judged population is empty prints `INCONCLUSIVE`, never PASS.

### §P7-WITNESS-FIX — `witness_e2e_business_cycle.js` stage 7 froze an INCORRECT contract
Stage 7 authors a Material Receipt with **only** `documentno` + `movementdate` and calls it PASS — while its
own verdict line asserts *"Stage7: Material Receipt New form exposes warehouse + vendor (**both mandatory on a
real M_InOut**)"*. It is internally contradictory: it asserts the columns are mandatory, then saves without
them, and only passes because the create path never checked. Under §P7 that save is `SAVE_MANDATORY`, exactly
as iDempiere's `GridTable.dataSave:1647-1653` would. **Fix = move the witness to the correct contract** (fill
`c_doctype_id`, `c_bpartner_id`, `c_bpartner_location_id`, `m_warehouse_id` — what a real user must type),
never weaken the validator. Same class as §TWIN-CLASSIFIED-WITNESS-FIXES 1-4. Stage 7 stays PASS, on a
contract that is now true.

### §P7-NOT-BUILT — measured, named, deliberately out of this change
1. **`GridField.defaultFromExpression():875-913`** — the `@token@`/`@SysDate@` DefaultValue stage, `,;`-tokenized,
   resolved against the WINDOW context (parent row + Env globals), unresolved token → skip to the next. It is what
   fills `c_orderline.c_bpartner_location_id` (`@C_BPartner_Location_ID@`), `dateordered` (`@DateOrdered@`),
   `m_warehouse_id` (`@M_Warehouse_ID@`), `c_currency_id` (`@C_Currency_ID@`) from the parent. `foldCrudSpec:743-749`
   today resolves exactly three hard-coded `@#…@` tokens and DROPS every other expression. **Not needed for §P7**
   (the O2C witness types those columns), so it is not built here — but it is the next real parity step.
2. **`@#C_UOM_ID@`/`P|` preference stages (`GridField.defaultFromPreference():987-1016`)** — `ad_preference` is in
   the seed; nothing reads it. `m_inoutline.c_uom_id` is the one blocker this would close.
3. **`GridTab.dataNew:1179-1181`'s New-time callout fan** — we fire a callout only on `change`
   (`crud_overlay.js:439-443`, `:864`), never once per field at New. Adding it would let `CalloutOrder.product`
   fill `C_UOM_ID`/`C_Tax_ID`/ASI as the Java does (`CalloutOrder.java:757-762,795-802,846`); our
   `productHandler` (`ad_callout.js:64-76`) currently derives prices only. Bounded, named, not built.
4. **read-only mandatory columns** — E6: iDempiere DOES require them; we skip them (`validateField:127-130`).
   Ours is the narrower check, so it cannot false-reject. Named.

## §P8 — SPEC: AD_Ref_Table / Search target resolution + the val-ruled List (§P3-RESULT follow-ons 1 & 2)
**Claim (W-PARITY-REFTABLE):** an FK whose target table is NOT `<column minus _id>` resolves its table, key
column and AD where-clause from `AD_Ref_Table` — as `MLookupFactory.getLookup_Table` does — instead of
degrading to the raw value; and a val-ruled **List** column filters its `AD_Ref_List` options by the rule,
as `MLookupFactory.getLookup_List` does.

### §P8-MEASURED (from `erp/ad_seed.db`, this session — independent of §P3-LIMITS' count)
`AD_Field ⋈ AD_Column` over tabs 186/257/263/330/349, `IsActive='Y' AND IsDisplayed='Y'`: **264 displayed
fields, 115 of them FK (DisplayType 18/19/30).** Of those 115 field-instances: **61 resolve today** under the
`<col minus _id>` convention, **34 are fixable from `ad_ref_table`**, **20 are not** (no `AD_Ref_Table` row and
the conventional table is absent from this seed). 34 fixable instances = **18 DISTINCT columns**:

| column | → real target | column | → real target |
|---|---|---|---|
| `AD_OrgTrx_ID` | `ad_org` | `DropShip_User_ID` | `ad_user` |
| `Bill_BPartner_ID` | `c_bpartner` | `Link_Order_ID` | `c_order` |
| `Bill_Location_ID` | `c_bpartner_location` | `QuotationOrder_ID` | `c_order` |
| `Bill_User_ID` | `ad_user` | `RelatedInvoice_ID` | `c_invoice` |
| `C_DocTypeTarget_ID` | `c_doctype` | `ReturnBPartner_ID` | `c_bpartner` |
| `C_Employee_ID` | `c_bpartner` | `ReturnLocation_ID` | `c_bpartner_location` |
| `DropShip_BPartner_ID` | `c_bpartner` | `ReturnUser_ID` | `ad_user` |
| `DropShip_Location_ID` | `c_bpartner_location` | `SalesRep_ID` | `ad_user` |
| | | `User1_ID` / `User2_ID` | `c_elementvalue` |

**13 of the 61 val-ruled field-instances become resolvable** (186 `Bill_BPartner_ID`/`Bill_Location_ID`/
`Bill_User_ID`/`C_DocTypeTarget_ID`/`DropShip_*`/`SalesRep_ID`; 257 `DropShip_Location_ID`/`DropShip_User_ID`/
`ReturnLocation_ID`/`ReturnUser_ID`; 263 `C_DocTypeTarget_ID`) — their val rules have been dead all along
because the picker never queried a real table. **4 stay unresolvable** (`C_Activity_ID`, `C_CashPlanLine_ID`
× 2 tabs) and **8 distinct columns** have no `AD_Ref_Table` row at all (`C_Activity_ID`, `C_CashPlanLine_ID`,
`C_ConversionType_ID`, `C_CostCenter_ID`, `C_Department_ID`, `C_OrderSource_ID`, `C_POSTenderType_ID`,
`C_PaymentProcessor_ID`) — reported, never counted as a pass.

**`AD_Ref_Table` also carries a WhereClause iDempiere ANDs into the lookup** — measured on this seed, e.g.
ref 190 (`SalesRep_ID` on 263) `EXISTS (SELECT * FROM C_BPartner bp WHERE AD_User.C_BPartner_ID=bp.C_BPartner_ID
AND bp.IsSalesRep='Y')`; ref 138 `C_BPartner.IsSummary='N' AND C_BPartner.IsActive='Y'`; ref 130
`AD_Org.IsSummary='N' AND AD_Org_ID <> 0`; ref 252 `C_BPartner.IsEmployee='Y'`; refs 134/137 carry `@AD_Client_ID@`.
That clause is a SECOND narrowing, independent of `AD_Val_Rule`.

**`trxtype` (330, ref 17, rule 200012 `AD_Ref_List.Value NOT IN ('A','F')`)** — the one val-ruled List on the
five tabs. `AD_Ref_List(215)` has **6** active rows; the rule admits **4**. It BITES.

### §P8-SPEC
- **P8.1** `ad_parser.resolveRefTable(db, refValueId)` — new, mirroring `MLookupFactory.getLookup_Table`:
  `ad_ref_table ⋈ AD_Table ⋈ AD_Column(ad_key) ⋈ AD_Column(ad_display)` → `{tableName, keyCol, displayCol,
  isValueDisplayed, whereClause, orderByClause}`; null when there is no row. Logged `§AD_PARSER resolveRefTable`.
- **P8.2** `foldCrudSpec`: when `type==='fk'` and `opts.refTable(referenceValueId)` returns a target, use its
  `tableName`/`keyCol` for `spec.ref`/`spec.refkey` and carry `spec.refwhere`/`spec.reforder`; otherwise KEEP
  the `<col minus _id>` convention verbatim (that IS iDempiere's TableDir rule, `getLookup_TableDir`). The fold
  stays PURE — the host injects the resolver, exactly as §P2.7 did for `refList`.
- **P8.3** `mergeCuratedWithFold`: `ref`/`refkey`/`refwhere`/`reforder` join the LAYERED key list — **but only
  when the curated field carries no `ref` of its own** for `ref` itself, so §IMPL F3's pinned attributes are
  respected; `refkey`/`refwhere`/`reforder` are additive (no curated field has ever carried one). This is the
  §P3-RESULT-DEFECT-2 lesson applied in advance: `bill_bpartner_id` IS a curated pin on `c_order` AND one of
  the 18, so without this the fix would miss the very column §MEASURED lists.
- **P8.4** `crud_overlay.populateRefs`: use `f.refkey || f.ref+'_id'` as the pk, and AND `f.refwhere`
  (substituted through the SAME `AdValRule.substitute` — one owner, no second substituter) with the val-rule
  clause. An unresolved token in the AD where-clause follows §P3-EXTRACT E2/E3 (clause empties → no rows);
  a clause that throws degrades to unfiltered and says so. `§REFTABLE col= refval= table= key= where= rows=`.
- **P8.5** the val-ruled List: `populateRefs`' list arm filters `f.optionList` by the rule when
  `f.valruleid` is set and the clause is a plain `AD_Ref_List.<col> <op> …` the engine can evaluate against the
  option rows. Same engine (`ad_valrule.js`), no second evaluator; a clause it cannot apply degrades and logs.
- **P8.6** `validateField` list arm reads the FILTERED map, so offered == accepted by construction (the §P3.6
  invariant, extended to lists).

### §P8-WITNESS — W-PARITY-REFTABLE, `erp/tests/poc_parity_reftable_live.js`
- **A** tab 186 `salesrep_id` (ref 18 → 110 `AD_User`): the picker's option count == `ad_user` rows admitted by
  rule 200025 ∩ the `AD_Ref_Table` clause, read from the seed at run time; pre-fix it offered **0** real rows.
- **B** tab 263 `salesrep_id` (ref 30 → 190): the `AD_Ref_Table.WhereClause` narrows `ad_user` to `IsSalesRep='Y'`
  partners — asserted `before > after` with both numbers read from the seed.
- **C** tab 186 `bill_bpartner_id` — the CURATED pin, proving P8.3 (this is the §P3-RESULT-DEFECT-2 class).
- **D** tab 330 `trxtype`: **6 → 4** options, `A`/`F` absent, `validateField(f,'A')` → `list:not-an-option`.
- **VACUITY** the 8 columns with no `AD_Ref_Table` row are listed as NOT-RESOLVED, never as passes.

## §P9 — SPEC: `GL_Category_ID` on derived postings (§P4-OPEN item 7)
**Claim (W-POST-GLCATEGORY):** every derived posting line carries the `GL_Category_ID` iDempiere would stamp,
matched against the seed's OWN `fact_acct.gl_category_id` for the same document — an oracle, not a re-assertion.

### §P9-EXTRACT (source, read this session)
- `Doc.setDocumentType()` `Doc.java:991-1090` resolves it in three stages: **(a)** by `C_DocType_ID`
  (`:996-1009`, `SELECT DocBaseType, GL_Category_ID FROM C_DocType WHERE C_DocType_ID=?`) → **(b)** if still 0,
  by `(AD_Client_ID, DocBaseType)` (`:1030-1045`, no ORDER BY) → **(c)** if still 0, `SELECT GL_Category_ID FROM
  GL_Category WHERE AD_Client_ID=? ORDER BY IsDefault DESC` (`:1060-1071`).
- **`Doc.getGL_Category_ID():1785-1795` prefers the document's OWN `GL_Category_ID` column** when it has one
  (the GL_Journal case) and only then falls back to the resolved value.
- `FactLine.setDocumentInfo():364-404` — `setGL_Category_ID(m_doc.getGL_Category_ID())` at `:404`: a
  **document-level constant stamped on every fact line**, never per-line.
- **No category → `0`, a SEVERE log, and the posting still writes** (`Doc.java:411` `int m_GL_Category_ID = 0`,
  `:1085-1086`). It is a 0-sentinel, never NULL. Seed confirms: 52 `c_doctype` rows, **14 of them `0`**.
- It is a fact-line **suppression** key, not a merge key — `Doc_AllocationHdr.java:645` inside
  `equalFactLineIDs`, used by the `IsPostIfClearingEqual` block (`:525-548`) to decide whether to DELETE.
### §P9-SPEC
- **P9.1** `scripts/doc_poster.js`: `glCategoryFor(db, tableName, recordId)` — the three-stage chain above plus
  the own-column preference, `>0` guard (the 0-sentinel), returning `{id, stage}`. One new read; `post_resolver.js`
  is untouched (it is per-token and has no document context — verified).
- **P9.2** `finish()` (`doc_poster.js:527-530`) stamps `gl_category_id` on every emitted line — additive key, the
  existing `{account_id, value, name, amtacctdr, amtacctcr}` shape and every cents assertion unchanged.
- **P9.3** ~28 existing witnesses consume `derivePostings`; the key is additive, so all must stay green — proof
  by re-run, not by assertion.
- **NOTE the third copy:** `erp/post_resolver.js` (shipped) and `scripts/post_resolver.js` have ALREADY drifted
  (9 tokens), and `erp/doc_poster.js` is 125 lines vs `scripts/doc_poster.js` 574 — neither pair is declared in
  `scripts/erp_twins.json`. Named here; declaring them is the twin lane's call, not this item's.

## §P10 — SPEC: the `IsDocNoControlled` witness is scope-blind (§P4-OPEN item 5)
§P4-CANDIDATES scored the implementation **faithful** (`crud_overlay.js:1467 _docTypeSeqId` ≡
`MSequence.getDocumentNo:683-686`) but the only witness, W-DOCNO (`scripts/poc_audit_changelog.js:102-130`),
asserts **only** the table-level path (`§DOCNO table=c_order seq=DocumentNo_c_order`). The doctype-controlled
branch — **34 seeded doctypes `='Y'`, all 34 with a `docnosequence_id` resolving to an ACTIVE `ad_sequence`,
and 18 `='N'` with none** — is never judged. **Claim (W-DOCNO, extended):** for a real `='Y'` doctype the
allocator returns that doctype's OWN sequence, and for a real `='N'` doctype it falls back to
`DocumentNo_<TableName>` — both read from the seed at run time, plus a falsifier that fires if the branch is
inverted. Fix is a WITNESS fix; no shipped code changes.

## §P7-RESULT 2026-09-03 — §PARITY-MANDATORY-CREATE **CLOSED**. W-PARITY-MANDATORY-CREATE 18/18 PASS
bim-ootb branch `feat/erp-parity-mandatory` (`cf6dd2e6`, base `8b50598d` = origin/main with #1613/#1626/#1632
in), `erp/sw.js` **v776 → v777**. Logs read, not exit codes.

**The one ⛔ OPEN item §IMPL-RESULT left is closed, and closed by FAITHFUL PORTS, not by weakening anything.**
The prior session's verdict — "the fix needs New-time defaults/callouts, which is O2C stages 1/6/7 territory" —
was a good starting point and **half wrong**: two of its four named blockers were never blockers at all.
`GridField.isMandatory(boolean):377-385` hard-exempts **`DocumentNo`** and **`M_AttributeSetInstance_ID`** in a
window, whatever `AD_Column.IsMandatory` says. Porting that one `if` removed them.

| what shipped | source | effect, measured through the app's own fold on `ad_seed.db` |
|---|---|---|
| **P7.1** window mandatory-exemptions | `GridField.isMandatory:377-385` | `DocumentNo` / `Value` / `M_AttributeSetInstance_ID` / `Created*` / `Updated*` / key `*_ID` fold `required:false` |
| **P7.2** data-type defaults | `GridField.defaultFromDatatype:1022-1051` | YesNo→`N`, numeric→`0`, `*_ID`→null **in the Java's order**; `'0'`/`'N'` are not empty at `GridTable:1985` |
| **P7.3** DisplayType 37 is numeric | `DisplayType.java:329-333`, `SystemIDs.java:132` | `C_OrderLine` `PriceEntered/PriceActual/PriceList` stop rendering as un-defaulted text |
| **P7.7** `@token@` DefaultValue | `GridField.defaultFromExpression:875-913` | a DETAIL tab resolves from the **PARENT row** — 6 resolved on `c_orderline` incl. `c_bpartner_location_id`, `dateordered`, `ad_client_id/ad_org_id` |
| **P7.8** window ctx feeds the val rules | `Env.getContext` "WindowNo\|TabNo\|Col"→"WindowNo\|Col" | AD_Val_Rule 167 on a line went `offered=0` → `after=1 offered=1 ctx={"C_BPartner_ID":…}` |
| **P7.4** the switch | `validateField` create contract (`crud_core.js:126`) | an inline CREATE validates the WHOLE new row |

**c_orderline's editable un-defaultable mandatory blockers: 6 → 3**, and all three are typed by the O2C witness.

### §P7-RESULT-FINDINGS — three things the change surfaced that were NOT in the spec
1. **A hook-derived value was being lookup-validated as if the user typed it.** With `orig=null` the update
   path's derived-column baseline fold vanished, and `MOrder.billDefaults`' own `Bill_Location_ID` came back
   `valrule:not-admitted`. Correct behaviour is the update path's: the MODEL layer writes it
   (`MOrder.setBPartner` → `set_Value`), never the grid, and `GridField.validateValueNoDirect:1141-1229` never
   re-inspects what `beforeSave` wrote. Only a NON-EMPTY derivation is folded in, so a hook that derived
   nothing still lets `required` fire.
2. **The unattended deep-link login could not author any document.** `orgsForRole` sorts `ORDER BY AD_Org_ID`,
   so `*` (org 0) always won — and the dictionary itself says `*` is never a document Organization
   (`AD_Val_Rule 130` = `AD_Org.AD_Org_ID <> 0 AND IsSummary='N'`, bound to `AD_Org_ID` on all five tabs), while
   `GridField.validateValueNoDirect:1225` NULLS a default the lookup rejects → `getMandatory` then reports
   FillMandatory. Verified from source that iDempiere's own `Login.getOrgs` DOES offer `*` (`Login.java:222-234`,
   `ORDER BY o.Name`) — so our reject was faithful and the bug was the id-ordering. The auto-login now prefers
   the first org the dictionary would accept; **the interactive picker still offers `*`**, unchanged.
3. **`§P7-NOT-BUILT` item 1 turned out NOT to be optional.** On a child tab `C_BPartner_ID` is `IsReadOnly='Y'`
   with an `@SQL=` default we do not run, so without the window-context stage a PO Line's
   `C_BPartner_Location_ID` picker offered **0 rows** and the AD-mandatory column was unfillable. Built.

### §P7-RESULT-WITNESS-FIXES — three witnesses had frozen an INCORRECT contract (never the validator)
- **`witness_e2e_business_cycle.js` stage 7** authored a Material Receipt with **neither a vendor nor a
  warehouse**, three lines after asserting in its own verdict that both are *"mandatory on a real M_InOut"* —
  internally contradictory, and it only passed because the create path never checked. It now types
  `c_doctype_id 122` / `c_bpartner_id 120` / `c_bpartner_location_id 114` / `m_warehouse_id 103`, **every value
  read from the dictionary's own val rule for window 184 / tab 296** (52054 admits {122,147}; 167 admits exactly
  114 for BP 120). **Stage 6's PO line** likewise omitted `c_bpartner_location_id` that stage 1's SO line types.
- **`fillField` now BLURS a text input.** A real user leaves the box before the next field and it is that blur
  that fires `change`, which is what the dependent-lookup refresh is bound to; Playwright's `fill()` emits
  `input` only. Measured: without it `C_BPartner_Location_ID` stayed `unresolved-tokens offered=0`; with it
  `after=1 offered=1`. **The app was correct** — harness fidelity, not a product change.
- **`poc_ad_folded_crud.js`** asserted `value … required===true`, which froze the pre-port contract (`Value` is
  on the Java's exempt list). It now judges BOTH arms — `name` (mandatory, not exempt) is the control — so it
  cannot pass by the port firing too widely. **29/29.**

### §P7-EVIDENCE — every witness re-run this session, logs read
- **W-PARITY-MANDATORY-CREATE 18/18 PASS, 0 FAIL, 0 INCONCLUSIVE** (`erp/tests/poc_parity_mandatory_live.js`,
  real DOM). Falsifiers fire BOTH ways: the port is **not wider** than the Java (`C_BPartner_ID`/`M_Warehouse_ID`
  come back not-exempt) and **re-marking the exempt field mandatory rejects the same empty value** while as
  shipped it does not. Arm E asserts a PO Line pre-fills from its parent order's own column read from the seed
  (`C_Order_ID=104 → 109`, rendered 109).
- **W-PARITY-FIELDSET 30/30 PASS, 0 FAIL — and `0 OPEN`**, its `§PARITY-MANDATORY-CREATE` arm now printing
  **CLOSED** (`missing=[c_bpartner_id,ad_org_id,c_bpartner_location_id]` pre-fix; the curated-8 save still
  persists). That arm was the file's one OPEN item.
- **W-PARITY-REFLIST 14/14** · **W-PARITY-VALRULE 23/23** · **W-AD-FOLDED-CRUD 29/29** · **W-ERP-TWIN PASS**
  (`pairs=64 identical=39 unreviewed=0 undeclared_or_broken=0`).
- **O2C `WITNESS_ROOT=/tmp/wt-erp-mand`: stages 1/2/3/5/6/7 PASS.** Stage 4 FAIL / stage 8 ABSENT are the known
  pre-existing structural gaps, untouched.

### §P7-RESULT-NOT-BUILT — still named, still measured
`@SQL=` defaults (stage 2 — `C_OrderLine.Line`, `C_BPartner_ID`); the user/system **preference** stages
(`GridField.defaultFromPreference:987-1016` — `ad_preference` is in the seed, nothing reads it; it is the one
thing that would close `m_inoutline.c_uom_id`'s `@#C_UOM_ID@`); `GridTab.dataNew:1179-1181`'s New-time callout
fan (would let `CalloutOrder.product` fill `C_UOM_ID`/`C_Tax_ID`/ASI as `CalloutOrder.java:757-762,795-802,846`
does — our `productHandler` derives prices only); and **read-only mandatory columns**, which iDempiere DOES
require and we skip (`validateField:127-130`) — ours is the NARROWER check, so it can never false-reject.

## §P9-RESULT 2026-09-03 — GL_Category on every derived fact line. W-POST-GLCATEGORY 7/7 PASS
bim-compiler `9b6e6c5c4` + `82b0f0e2c`. §P4-OPEN item 7 → ✅ DONE (witness).
**The oracle is the seed's OWN postings, not this lane's arithmetic:** `glCategoryFor` is compared against
`fact_acct.gl_category_id` document by document — **50/50 agree**, and all three stages of `Doc.setDocumentType`'s
chain actually fire (`§GLCAT-STAGES {own-column:2, doctype:30, client-default:18}`), so no stage passes
vacuously. `derivePostings` stamps it on **every** line as `FactLine.java:404` does (a document-level constant,
never per-line) — verified end-to-end on a real invoice, and the seed's own rows are confirmed single-valued per
document (50 documents), which is that invariant read back from the data.
- **Deviation, named not hidden:** the Java's `(AD_Client_ID, DocBaseType)` lookup (`Doc.java:1030-1045`) has
  **no ORDER BY** and takes whatever row the DB returns first; the port takes the **lowest `c_doctype_id`** so it
  is deterministic.
- **Falsifiers:** the oracle is discriminating (5 distinct categories across 600 fact rows); two invoices whose
  doctypes carry different categories resolve differently; an unknown document returns the **0 sentinel**
  (`Doc.java:411`) and never fabricates.
- **A regression of my own, found and fixed before it left the tree** (`82b0f0e2c`): the chain read `c_doctype`
  unguarded, so a NARROW fixture db threw `SqliteError` and took `poc_post_b3`, `poc_post_tail`,
  `poc_idmp_frame_fit`, `poc_migrate_postcfg_idmp` down with it. iDempiere logs SEVERE and **posts anyway** with
  0 — it never fails the posting — so every read now degrades with the reason NAMED in `stage`
  (`no-doc-table` / `no-doctype-table`). All four re-run PASS; W-POST-GLCATEGORY unmoved.
- **NOT done, named:** `erp/post_resolver.js` (shipped) and `scripts/post_resolver.js` have ALREADY drifted
  (9 tokens), and `erp/doc_poster.js` is 125 lines vs `scripts/doc_poster.js` 574 — **neither pair is declared in
  `scripts/erp_twins.json`**, so no gate watches them. Declaring them is the twin lane's call, not this item's.

## §P10-RESULT 2026-09-03 — the DocNo witness now judges BOTH branches. W-DOCNO-BRANCH 10/10 PASS
§P4-OPEN item 5 → ✅ DONE (witness). `erp/tests/poc_parity_docno_live.js`, run against the committed bytes.
**The old arm was worse than scope-blind — it was TAUTOLOGICAL.** `scripts/poc_audit_changelog.js:102-130` fed a
**mocked** `__idmpDb` whose expected `SO-1000` was written a few lines below the assertion, so it judged neither
the real seed nor the shipped code. The new witness drives the **SHIPPED** `_docTypeSeqId`/`_previewDocNo`
through a read-only seam (`window.__crud.docNoSeam`; the sequence-CONSUMING `_allocDocNo` is deliberately not
exposed) against the real seed:
- **all 34** doctypes `IsDocNoControlled='Y'` resolve to their own `DocNoSequence_ID`, **all 34** of those
  sequences being real and ACTIVE — and the same holds through `C_DocTypeTarget_ID`, the column MOrder/MInvoice
  actually carry.
- **all 18** `='N'` resolve to `null`, so the caller falls back to `DocumentNo_<TableName>` — `MSequence.getDocumentNo:683-686`'s
  real meaning ("table sequence instead of doc-type sequence", NOT "no number").
- **The branches are distinguishable, which is what makes either arm mean anything:**
  `§DOCNO-BRANCH doctype=148 seq=doctype#378 docno=500000 docNoControlled=true | table seq=DocumentNo_c_order docno=10000000 docNoControlled=false`.
- **Falsifier:** an in-seed `='N'` doctype takes the identical call shape and returns null (the FLAG decides, not
  the presence of a doctype); an unknown id and an absent doctype both fall back rather than fabricate.
- The old arm is left in place but **annotated with its real scope** and pointed at this witness, so a green
  there can no longer be read as "IsDocNoControlled is witnessed".

## §P8-RESULT 2026-09-03 — the two §P3-RESULT follow-ons CLOSED. W-PARITY-REFTABLE 12/12 PASS
bim-ootb `feat/erp-parity-mandatory` (`09d92132` + `7f34e3ac`). §P3-RESULT "Still open" items **1 and 2 →
✅ DONE (witness)**.

**`<column minus _id>` is iDempiere's TableDIR rule and it was being applied to every FK.** For DisplayType
**18 (Table)** and **30 (Search)** the target table, key column, WhereClause and OrderByClause are DECLARED in
`AD_Ref_Table` (`MLookupFactory.getLookup_Table`). The witness reproduces the population independently of
§P3-LIMITS: of **115** FK field-instances on the five document tabs, **61** resolve under the convention,
**34 are fixable from `AD_Ref_Table`** (**18 distinct columns**) and **20 have no target at all** (8 distinct
columns — `C_Activity_ID`, `C_CashPlanLine_ID`, `C_ConversionType_ID`, `C_CostCenter_ID`, `C_Department_ID`,
`C_OrderSource_ID`, `C_POSTenderType_ID`, `C_PaymentProcessor_ID` — **listed as NOT RESOLVED, never counted as
passes**). The 18: `SalesRep_ID`/`Bill_User_ID`/`DropShip_User_ID`/`ReturnUser_ID`→`ad_user` ·
`Bill_BPartner_ID`/`DropShip_BPartner_ID`/`ReturnBPartner_ID`/`C_Employee_ID`→`c_bpartner` ·
`Bill_Location_ID`/`DropShip_Location_ID`/`ReturnLocation_ID`→`c_bpartner_location` ·
`C_DocTypeTarget_ID`→`c_doctype` · `Link_Order_ID`/`QuotationOrder_ID`→`c_order` ·
`RelatedInvoice_ID`→`c_invoice` · `User1_ID`/`User2_ID`→`c_elementvalue` · `AD_OrgTrx_ID`→`ad_org`.

**A second narrowing nobody had noticed:** `AD_Ref_Table.WhereClause` is appended to the lookup query
*independently of `AD_Val_Rule`*. Measured live — `c_bpartner` **113 → 20** under ref 252
`C_BPartner.IsEmployee='Y'` (a column with **no** val rule at all, so it isolates this path); 12 of 24 live
`§REFTABLE` lines report `refWhere=applied`. Substituted through the SAME engine as the val rule
(`AdValRule.substitute` — one owner, no second substituter), and the `admitted` set is built from the SAME
combined clause, so offered == accepted by construction.

**The val-ruled List (`trxtype`, 330, ref 17, rule 200012):** **6 active `AD_Ref_List` options → 4**, `A`/`F`
gone. The witness's oracle applies the rule's clause to `AD_Ref_List` **directly**, not through the engine
under test. `validateField` reads the same filtered map (`'A'` → `list:not-an-option`).

### §P8-RESULT-DEFECT — a shipped bug the witness caught, which looked exactly like a test bug
**`ad_evaluator.resolveVar` matched record keys EXACTLY**, so `@TenderType@` was looked up as
`record['TenderType']` — but **every record this stack builds is lower-cased** (`gatherVals` keys rows by
`f.col`, which `foldCrudSpec` lower-cases). So **a DisplayLogic / ReadOnlyLogic / MandatoryLogic naming any
CamelCase column silently evaluated against `""`, whatever the user had typed.** Measured on the shipped tree:
`C_Payment.TrxType`'s `@TenderType@=C` stayed false for every value of TenderType — the field could never
appear. `effectiveFlags(f,{tendertype:'C'}) → visible:false` vs `{TenderType:'C'} → visible:true`.
**The fix is this lane's own already-written convention**, not a new one: §P3-SPEC P3.5 states *"AD tokens are
CamelCase and our records are lowercase, so that case mapping is OURS — it lives in the wiring"*; the val-rule
`@token@` feed has resolved case-insensitively since #1626 and the AD logic evaluator was the one place still
contradicting it. Exact match still wins first, so a record carrying the AD casing is unaffected.
*This is the PRIMAL LAW §4 pattern in reverse — the arm that went red was the truth, and the temptation was to
"fix the test".* The witness now asserts BOTH directions: the field is validated in the state its own
DisplayLogic (read from the seed) makes visible, and is skipped while that logic hides it.

### §P8-RESULT-LIMITS — named, not papered over
- **`bill_bpartner_id` and `m_pricelist_id` still render as raw number boxes on `c_order`.** Their target IS
  now resolved (`refsource`/`refkey`/`refwhere` are all layered onto the spec by P8.3) but the CURATED entry
  pins `"type": "number"`, and `type` is one of the attributes §IMPL F3 pins deliberately — the O2C witness
  types them as numbers. Changing it is a crud_ops.json + O2C-contract decision, not a lookup fix.
- **The 8 columns with no `AD_Ref_Table` row** stay unresolved and are reported as such every run.
- `AD_Ref_Table.OrderByClause` is carried on the spec (`reforder`) but the picker still orders by pk.

### §P8-EVIDENCE — the full regression on this tree, logs read
**Six live parity witnesses, 107 assertions, 0 FAIL, 0 INCONCLUSIVE:** W-PARITY-REFTABLE **12/12** ·
W-PARITY-FIELDSET **30/30** (0 OPEN) · W-PARITY-REFLIST **14/14** · W-PARITY-VALRULE **23/23** ·
W-PARITY-MANDATORY-CREATE **18/18** · W-DOCNO-BRANCH **10/10**.
Headless: W-AD-FOLDED-CRUD **29/29**, W-AD-DISPLAYLOGIC-LIVE PASS.
**W-ERP-TWIN PASS** — `pairs=64 identical=39 unreviewed=0 undeclared_or_broken=0`, unchanged.
**O2C `WITNESS_ROOT=/tmp/wt-erp-mand`: stages 1/2/3/5/6/7 PASS**; stage 4 FAIL / stage 8 ABSENT are the known
pre-existing structural gaps, untouched.

### §STATUS-2026-09-03
- **§P7 §PARITY-MANDATORY-CREATE → ✅ DONE (witness)** — the file's only ⛔ OPEN item, closed by four faithful
  GridField ports. **§P4-OPEN items 5 and 7 → ✅ DONE (witness)** (§P10, §P9). **§P3-RESULT open items 1 and 2
  → ✅ DONE (witness)** (§P8).
- **Still open, unchanged and untouched by this session:** §P4-OPEN 1 (action BODIES for 20 of 23 tables),
  2 (period-on-Complete, behind the ⛔ question below), 3 (`legalDocActions` is dead — delete or repoint),
  4 (the docstatus-CELL edit path is not FSM-gated), 8 (second-layer ReActivate check); §P3-RESULT 3
  (`AD_Val_Rule_Lookup_ID`) and 4 (the 5 uninterpretable rules); §IMPL-RESULT-F7's `ad_modelval` three-way
  drift; and the **undeclared `post_resolver` / `doc_poster` twin pairs** §P9-RESULT names.
- ⛔ **BLOCKED, unchanged and NOT guessed:** should Complete HARD-REJECT a document whose `DateAcct` falls in
  a closed period (`MPeriod.testPeriodOpen`), or log-and-allow? §P4-OPEN item 2 stays unbuilt until answered.

### §P8-TWIN-HANDOVER — a MANDATORY post-merge step, green now only because the branch is unmerged
`check_erp_twins.js` compares each `build/erp/<mod>.js` against **`git show origin/main:erp/<mod>.js`** — by
design (`:33-35`). This session changed three SHIPPED files that are locked `identical`:
**`crud_core.js` (n=21 witnesses)**, **`crud_overlay.js` (n=21)** and **`ad_evaluator.js` (n=3)**.
The gate reads PASS today *only because the copies still match origin/main and this branch has not merged*.
**Mirroring the changes into `build/erp` now would make the gate FAIL** (`declared identical but DRIFTED`), and
`scripts/erp_twins.json` is owned by another agent this session, so the pair could not be re-declared
`unreviewed` either — the same situation §TWIN-CLASSIFIED-RESULT handled for `crud_core`/`ninja_model`.
**On merge of `feat/erp-parity-mandatory`, the gate WILL go red until the three copies are re-derived from the
new origin/main bytes** (`copy ← shipped`), after which the 45 bim-compiler witnesses that judge them must be
re-run and their logs read. Until that is done those 45 witnesses attest code that is **no longer what ships** —
`ad_evaluator` most sharply, since its case-blind lookup is exactly what §P8-RESULT-DEFECT fixed.
Also still undeclared and unwatched by any gate: **`post_resolver`** (shipped `erp/` copy already drifted by
9 tokens) and **`doc_poster`** (`erp/` 125 lines vs `scripts/` 574) — §P9-RESULT names them.

---

## §P11 — SPEC then RESULT, 2026-09-03: `W-AD-DISPLAYLOGIC-LIVE` was judging a path that no longer renders

`AGENT_QUEUE.md §ERP-SESSION-CLOSE` NEXT item 2: *"`W-AD-DISPLAYLOGIC-LIVE` fails (`shown=1
hiddenByLogic=0`), re-run 3× incl. after the case fix, on current code. AD logic IS proven live by
W-PARITY-FIELDSET, so this is either a stale selector or a real gap — **unattributed**."*

### §P11.1 ATTRIBUTED — stale selector. The product is correct; the instrument was not.
`scripts/poc_ad_displaylogic_live.js` counted `#idmp-form .idmp-fld` and looked for **CamelCase**
`[data-ad-column="ChargeAmt"]` / `"DocumentNo"`. Those belong to `idempiere.html:_appendReadonlyFields`
— which its own comment calls *"the classic read-only field render (**the fallback** when a table has no
crud spec)"* (`idempiere.html:2946`). Since **#1613** every document table takes the inline path instead
(`canInline`, `idempiere.html:2928` → `window.__crud.editInline`), which renders `.cfrow` rows with
**lowercase** `data-ad-column` and applies AD logic through `crud_overlay.js:applyAdLogic` (:504).

MEASURED on current `origin/main` (`8564295e`), Sales Order 100, window 143:
```
§AD-LOGIC-LIVE key=c_order fields=56 withLogic=28 visibilityFlips=25 applied=DOM
DOM: .cfrow total=56  hiddenByStyle=25  → datepromised,deliveryrule,priorityrule,dropship_*,
     m_shipper_id,freightcostrule,freightamt,invoicerule,c_charge_id,CHARGEAMT,c_paymentterm_id,…
     documentno rendered and VISIBLE
old selectors: .idmp-fld = 1   [data-ad-column="ChargeAmt"] = 0   [data-ad-column="DocumentNo"] = 0
```
`chargeamt` — the witness's own falsifier target — **is hidden, correctly**. The DisplayLogic feature was
never broken; the witness was looking at the wrong DOM. This is the same class as the four instrument
defects §ERP-SESSION-CLOSE rule 3 records.

### §P11.2 MEASURED — the `.idmp-fld` fallback did not fire for EITHER table tried
Fact_Acct (window 162, a tab the seed marks `AD_Tab.IsReadOnly='Y'`, 22 DisplayLogic-bearing displayed
fields) was tried precisely to exercise the fallback. It also went inline:
```
§AD-LOGIC-LIVE key=fact_acct fields=46 withLogic=20 visibilityFlips=20 applied=DOM
DOM: .cfrow total=46  hiddenByStyle=20   ·  .idmp-fld = 0
```
So `_appendReadonlyFields` is reachable in code (`_crudHas` false ⇒ views / no displayed non-key field)
but did not render for either real record table probed. **The witness reports this instead of asserting
it** — a `§AD-DISPLAYLOGIC-FALLBACK` line, never a PASS, so the day it starts rendering again is visible.

### §P11.3 THE REWRITE — what the witness now judges
Two tables (curated `c_order` **and** AD-folded `fact_acct`, so it is not a single-case witness), each:
1. `§AD-LOGIC-LIVE` emitted with `withLogic > 0` — else **VACUOUS**, not PASS (the AD carries no logic
   for this record, so a 0 would mean nothing).
2. **DOM, not the log:** `.cfrow` rows with `display:none` > 0. The log line is emitted by the same
   function that does the hiding, so asserting on it alone would be tautological — the DOM state is the
   independent oracle.
3. Falsifier A — a named **false-logic** column is present in the DOM but hidden (`c_order`→`chargeamt`,
   `fact_acct`→`c_project_id`). If the evaluator regressed to "show everything", this fails.
4. Falsifier B — a named **no-logic** column renders AND is visible (`c_order`→`documentno`,
   `fact_acct`→`dateacct`). If it regressed to "hide everything", this fails.
5. `§AD-DISPLAYLOGIC-FALLBACK` reports the `.idmp-fld` count for both tables — reported, never asserted.

Every named column above is EXTRACTED from the measured runs quoted in §P11.1/§P11.2, not chosen.

### §P11.4 RESULT — 🟢 W-AD-DISPLAYLOGIC-LIVE 10/10 PASS (see §P11.5 for the log)
Coverage-matrix consequence: the row this witness backs was RED on an instrument defect, not a product
gap. It is now green on the path that actually ships, over two tables.

### §P11.5 RESULT LOG — `build/erp/poc_ad_displaylogic_live.log`, run against `origin/main` `8564295e`
```
§AD-LOGIC-LIVE key=c_order   fields=56 withLogic=28 visibilityFlips=25 applied=DOM
§AD-DISPLAYLOGIC-LIVE key=c_order   rows=56 hiddenByLogic=25 withLogic=28 flips=25 chargeamt=hidden documentno=visible
§AD-DISPLAYLOGIC-FALLBACK key=c_order   idmp-fld=1   (REPORTED, not asserted)
§AD-LOGIC-LIVE key=fact_acct fields=46 withLogic=20 visibilityFlips=20 applied=DOM
§AD-DISPLAYLOGIC-LIVE key=fact_acct rows=46 hiddenByLogic=20 withLogic=20 flips=20 c_project_id=hidden dateacct=visible
§AD-DISPLAYLOGIC-FALLBACK key=fact_acct idmp-fld=0   (REPORTED, not asserted)
🟢 W-AD-DISPLAYLOGIC-LIVE PASS — 10 PASS / 0 FAIL — over 2 tables, judged on the DOM
```
**FALSIFIER PROVEN, not claimed.** Swapping the two named columns (falsifier A pointed at `documentno`,
B at `chargeamt`) turns exactly those two claims RED and nothing else:
```
🔴 c_order: falsifier A — false-logic documentno is present but HIDDEN  ·  documentno=visible
🔴 c_order: falsifier B — no-logic chargeamt renders and is VISIBLE     ·  chargeamt=hidden
🔴 W-AD-DISPLAYLOGIC-LIVE FAIL — 8 PASS / 2 FAIL
```
**⬜ Left open, named not buried:** `_appendReadonlyFields` (`.idmp-fld`) is still reachable in code —
`_crudHas` false ⇒ a view, or a tab with no displayed non-key field — but rendered for neither table
probed, so it currently has **no** witness. `§AD-DISPLAYLOGIC-FALLBACK` makes its return visible. Giving
it a real arm needs a window that actually lands on it; that is a separate, bounded item.
