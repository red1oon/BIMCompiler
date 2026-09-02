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
**Do not write a second FSM.** `crud_core.js:200 legalDocActions` is the one seam.

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

## §STATUS
- 2026-09-02 — file written, all §MEASURED numbers verified in-tree this session. Nothing built yet.
