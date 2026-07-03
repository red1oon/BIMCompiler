# BIM → Project Order — Blueprint
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **Status:** Tasks 0, A, C BUILT, witnessed & **LIVE** (browser-wired + deployed — bim-ootb PR #316:
> `viewer/proj_fold.js?v=1` + `erp/bim_orders_overlay.js?v=1`; the `› ERP` button drives the fold).
> Re-witnessed 2026-06-15 against the deployed engine — `§PROJ_FOLD plannedAmt=1055478 golden=1055478
> match=true` (6 phases · 9 tasks · 16 issued lines, idempotent, seqno traces to sequence_rules).
> §D/§E + §H/§I still PAPER.
> Sibling to `docs/BIMtoERP.md`.
> ⚠ **Repo note:** the built files live in **bim-ootb**, not this repo — `viewer/proj_fold.js`,
> `common/history_bar.js` (this doc is the cross-repo blueprint; don't look for them here).
> **Built so far:** §0/Task 0 substrate confirmed (`W-PROJ-SCHEMA` — canonical `erp/ad_seed.db`,
> 11 write targets, OPEN-3 resolved) · §A/Task A cost-on-selection + 5D-pack-in-Settings
> (`W-FIND-COST`) · §C/Task C the fold engine `proj_fold.js` (`W-PROJ-PUSH/FOLD/SEQ` — building
> selection → C_Project tree, idempotent, PlannedAmt == 5D golden via BigDecimal, seqno traces to
> sequence_rules; `› ERP` button wired). Remaining for §C: browser visual-drive + the cross-page
> hand-off so the ERP app reads the folded db (= BIMtoERP §B write-path).
> **The one-line idea:** the *whole building* (or any selected slice) becomes an
> iDempiere **`C_Project`** carrying its **4D schedule** (phases/tasks) and **5D cost**
> (planned BOQ lines), which iDempiere can then **generate a Purchase Order from**.
> **Prime alignment:** EXTRACT OR COMPILE ONLY. Phase/seq/dates come from the 4D template,
> price from the 5D template, qty from QTO. Never invent a phase, a date, a rate, or a line.
> Money/qty math via `site/bigdecimal.js` ONLY (see `memory feedback_numbers_via_bigdecimal`).

**Noun vs verb.** `docs/BIMtoERP.md` is the **noun** bridge — element Type→`M_Product`,
GUID→`A_Asset`, on-hand (what a thing *is* in inventory). This doc is the **verb** bridge —
the building as *work to be done*: project → phases → tasks → cost lines → PO. They share the
IFC GUID join and the `M_Product`/`M_Product_Category` layer; the verb rides on the noun.

Executable lane: `prompts/BIM_TO_PROJECT.md`. ERP engine source-of-truth: `build/erp/`
(see `docs/ERP.md`). Round-trip plays through `time_machine.js` (the 4D Time Machine).

---

## §0 — THE TWO TEMPLATES (the source of truth, both already exist)

The Project Order is folded from **two editable JSON templates** — nothing is invented:

| Template | Lives at | Drives |
|---|---|---|
| **4D** `sequence_rules.json` | `viewer/rates/sequence_rules.json` (LIVE, used by Time Machine `injectGantt`) | `ifc_class → {phase, sequence, resource}` + labour productivity → phase **structure, order, dates** |
| **5D** `5D_rates.json` / rate packs | `viewer/rates/<pack>.json` (cidb-my, bcis-uk, rsmeans-us, …; loaded by `rates.js`) | `ifc_class → {rate, unit}` → line **price** |

Because the push reads the **same** `sequence_rules.json` that Time Machine already plays, the
planned Project Order and the planned Time Machine are **consistent by construction** — and the
"Actual" version (§D) measures variance against that one baseline.

> **Asymmetry to fix (carried from BIMtoERP point 4):** the 4D `sequence_rules.json` is already
> editable via the Settings JSON editor; the 5D rate packs are **not** surfaced there. This lane
> adds a 5D rate-pack picker to Settings so the cost *shown* on a selection (§A) and the price
> *pushed* into a line (§C) use the same active pack — one source, no drift.

---

## §A — THE GATEWAY: the Find panel selected bar

The Find panel (`navigate_find.js`) is the **single gateway** to the ERP side. Its `#find-selected`
bar already carries the current selection + a ▶ Navigate button. It gains two siblings:

- **`Check ERP`** (read) — the `docs/BIMtoERP.md` §A data-gated chip (product/asset/cost read).
- **`> to ERP`** (write) — fold the current selection into a Project Order (§C).

**Cost on the selected bar (precondition — surface, don't build).** The compute already exists in
`nlp.js` (`calcCost()`, `getRate()`, `RATES`, currency conversion — what powers "total cost"). The
selected bar must show **qty × rate** for the current selection, in the active pack's currency, so
the user sees the 5D number *before* pushing it. An honest gateway shows the cost it will commit.

**Witness.**
- `W-FIND-COST`: `§FIND_COST scope=<sel> elements=<n> qty=<q> cost=<bd> cur=<CUR> pack=<name>` —
  cost folds exact == `Σ(qty × rate)` golden (BigDecimal); pack == active Settings pack.

---

## §B — MULTI-SELECT (the enabler)

Today `§NAV_FIND_002` gives multi-select for **parent rows only** (`_selStoreys`/`_selDiscs`,
"plain = replace"). This lane extends the **same Set model** to **type/category leaves**
(`_selTypes`/`_selCats`), so a user can tick several types/categories across the tree and push them
as one Project Order slice. No new selection engine — extend the existing one; axis change still
clears (the unify rule).

**Witness.**
- `W-FIND-MULTI`: `§FIND_MULTI axis=<a> picked=<ids> elements=<n>` — selection set == union of
  ticked leaves; cleared on axis change.

---

## §C — THE PUSH: selection scope → Project WBS (the isomorphism)

The Find panel's **axes already ARE the project WBS levels**. The granularity of the Project Order
is just *how deep you selected* — no separate scoping UI:

| Find selection | → | Project Order level | Key columns |
|---|---|---|---|
| **nothing** (whole building) | → | `C_Project` (all phases) | `value`,`name`,`datecontract`/`datefinish`,`plannedamt`,`c_currency_id`,`m_pricelist_version_id` |
| storey / discipline (parent row) | → | `C_ProjectPhase` | `name`(=4D `phase`),`seqno`(=4D `sequence`),`startdate`/`enddate`,`plannedamt` |
| type (leaf) | → | `C_ProjectLine` | `plannedqty`,`plannedprice`,`plannedamt`,`m_product_id` |
| category | → | `M_Product_Category` grouping the lines | `m_product_category_id` |

**Fold steps (idempotent, find-or-create, BigDecimal):**
1. **Header** — find-or-create `C_Project` keyed on building `value`; span = 4D min/max dates.
2. **Phases/tasks (4D)** — for each phase in `sequence_rules.json`: `C_ProjectPhase.name`=`phase`,
   `seqno`=`sequence`; `startdate`/`enddate` from labour-productivity durations (the same dates
   Time Machine computes). Work packages by `resource` → `C_ProjectTask`.
3. **Lines (5D)** — each Type → `C_ProjectLine`: `plannedqty` from QTO, `plannedprice` from the
   active rate pack (`rate × unit` via `site/bigdecimal.js`), `plannedamt`=qty×price.
   `m_product_id` resolved by the **same find-or-create as `docs/BIMtoERP.md` §B**
   (`M_Product.Value`=Type); `m_product_category_id` from the Type's parent/category.
4. **Roll-up** — line→phase.`plannedamt`→project.`plannedamt`/`plannedqty`.
5. **The Order** — phases with a supplier `c_bpartner_id`: set `generateorder` → fold a `C_Order`
   PO (iDempiere's native Generate-PO-from-project). **Gated:** no supplier = plan-only project,
   no PO (non-invent). This is the literal **"Project Order."**

**Witnesses.**
- `W-PROJ-PUSH`: `§PROJ_PUSH project=<v> phases=+<np> tasks=+<nt> lines=+<nl> order=<co|->`
  — counts == selection; **second run reports `+0` (idempotent)**.
- `W-PROJ-FOLD`: `Σ project plannedamt folds exact == nD 5D golden` (BigDecimal).
- `W-PROJ-SEQ`: `§PROJ_SEQ phase=<name> seqno=<n> start=<d> end=<d>` — every phase name+seqno
  traces to a `sequence_rules.json` row; dates == Time Machine's planned dates for that phase.

---

## §D — THE ROUND-TRIP: ProjectIssue → "Actual" 4D → split-screen Time Machine

Delivery against the order folds **back** into a second schedule version, so the viewer can play
**as-planned vs as-built**.

- **Planned / Budget** = today's generative timeline = `kernel_ops` `ELEMENT_PLACE` with estimated
  start/end (tagged `version=planned`). This is the 4D pushed as the Project Order.
- **Actual** = a second timeline sourced from ERP delivery, **not** estimates:
  `C_ProjectIssue.movementdate`/`movementqty` (real, dated, `docstatus`-gated) +
  `C_ProjectPhase.enddate`/`iscomplete` → a second `ELEMENT_PLACE` set tagged `version=actual`.
- **The seam already exists:** Time Machine distinguishes a *generated* from a *captured* schedule
  (`_capActive`; `injectGantt()` anchors onto a captured schedule). **"Actual" is just another
  captured schedule whose source is ERP issues instead of an IFC schedule** — no new render path.
- **Split-screen** = two timelines (planned | actual) on one shared scrub cursor; divergence
  (actual lagging planned) = the schedule variance, painted red.
- **5D variance rides the same event** — the project already carries `plannedamt` vs `committedamt`
  vs `invoicedamt`. One `C_ProjectIssue` posting moves both 4D (actual schedule) and 5D (actual
  cost). One loop, two variances.

**Two fences (the non-invent rules):**
1. **Versioning** — `version` dimension on the schedule (`planned|actual`); **never overwrite the
   planned baseline**.
2. **Issue→GUID allocation** — a `C_ProjectIssue` is *per-product, per-qty* ("20 doors on date D"),
   not per-element-GUID. To paint actual progress on specific elements, allocate the issued qty back
   to GUIDs by the deterministic rule: **light `N of M` elements of that Type within the issue's
   phase, ordered by `seqno`**. You commit "20 doors done" honestly; you do not invent *which
   individual* door beyond the fixed seqno order. EXTRACT-only.

**Witnesses.**
- `W-PROJ-ACTUAL`: `§PROJ_ACTUAL phase=<name> planned_end=<d> actual_end=<d> var_days=<n>` —
  actual dates trace to `C_ProjectIssue.movementdate`/phase `enddate`; never to estimates.
- `W-PROJ-ALLOC`: `§PROJ_ALLOC type=<T> issued=<q> lit=<n>/<m> order=seqno` — lit count == issued
  qty (capped at M); the *which* is seqno-deterministic, re-run identical.
- `W-TM-SPLIT`: planned + actual timelines render under one cursor; `var_days` == `W-PROJ-ACTUAL`.

---

## §E — ROLLBACK: the history dots, scoped (no new UI)

Scrubbing a Project Order to redo BIM→ERP is **not** a bespoke button — it is the **same
`‹ dots ›` history gesture** the user already knows from the viewer timeline and the ERP
world-history "W", mounted **scoped** to the project. The pieces are shipped:

- `common/history_bar.js` takes `configure({mountHostId, source, treeKey})` → dock the bar inside
  the Project Order panel, `source=doc`, `treeKey`=this `C_Project` → its own timeline of dots.
- `crud_overlay.js` exposes `crudFoldBack` / `crudFoldForward` ("REUSED UNCHANGED — no second
  history lane").

**Behaviour:**
- **Click back to the first dot** → `crudFoldBack` walks every op back to before creation = the
  project is scrubbed; re-run `> to ERP` for a fresh push.
- **Forward** → `crudFoldForward` = redo to tip (scrub is itself reversible).
- **Committed-safe for free** — folding back a committed doc goes through the status FSM
  (CO→DR via `setDocStatus`), **not** a delete; the §D "Actual"/variance data is protected with no
  special gating. The fold already does the right thing.
- **Deterministic redo** — because the push reads only the two templates (§0), scrub-then-redo
  produces the **identical** Project Order (`W-PROJ-PUSH` second run = `+0`).

**Standardization win:** one bar, one mental model ("scrub the dots back to undo, forward to redo"),
mounted everywhere — viewer, ERP, and now the Project Order panel. The user learns the gesture once;
it works for BIM→ERP rollback too. This is *why* the history bar was extracted into a shared module.

**Witness.**
- `W-PROJ-ROLLBACK`: `§PROJ_ROLLBACK project=<v> dots=<n> foldback=<bool> rows_after=0` —
  first-dot fold-back leaves zero project rows; `> to ERP` re-push restores identical counts.

---

## §F — What this is NOT (scope fences)

- Not a live two-way ERP daemon — deterministic push + read against ERP.db, scrubbable via history.
- Not invented financials/dates — price only from the active 5D pack, dates only from 4D durations,
  qty only from QTO, BigDecimal only.
- Not a new geometry/render path — Project Order is a data fold; "Actual" rides the existing
  captured-schedule path in Time Machine.
- 6D carbon / 8D safety ride-along is **out of v1** — leave the seam (carbon = project attribute;
  hazards → `C_ProjectIssue`), fence it so it is not silently dropped.
- Three Concerns stay split (BOM PRINCIPLE): WHAT = `M_Product`/`M_Product_Category`;
  HOW = UOM + rate pack + 4D sequence; WHERE = `build/erp/ad_*.db`.

---

## §G — Build order (paper → code, when GO)

1. Confirm `build/erp/ad_full.db` carries `c_project*` + `c_order*` (DONE — verified present);
   confirm canonical viewer-side ERP.db (shared with BIMtoERP OPEN-3).
2. §A cost-on-selection (surface `nlp.js` compute on `#find-selected`) + 5D pack picker in Settings.
3. §B leaf multi-select (`_selTypes`/`_selCats`).
4. §C `> to ERP` push (find-or-create, idempotent) — header → phases (4D) → lines (5D) → PO.
5. §E scoped `history_bar` mount (rollback) — verify `crudFoldBack` scrubs to zero.
6. §D "Actual" schedule version + split-screen Time Machine (the round-trip).
Each step lands with its witness `§`-line before the next. Whitebox `§`-log first; Playwright only
drives/captures. ERP writes go to `build/erp/` ONLY; never touch `deploy/live/`.

The §H lifecycle killers below are **follow-on sub-lanes** off this same plumbing (the GUID join,
the signed fold, the two templates) — sequence them after §C–§E land.

---

## §H — Lifecycle killers (follow-on sub-lanes, same plumbing)

Five high-value flows BIM users want, each reusing this lane's machinery and **mostly already
backed by existing code or seed tables** (verified 2026-06-14). EXTRACT-only throughout: every
amount traces to the rate pack / QTO / a real ERP row; BigDecimal only.

### §H1 — Model-delta → signed Variation Order (highest value-per-effort)

The cost engine **already exists**: `viewer/variation_order.js` (S222) does **FIDIC Clause 12
valuation + AACE change-order costing + EVM variance**, ADDED ×1.0 / REMOVED ×0.3 / CHANGED ×1.3,
schedule impact from the 4D productivity. Today it terminates in an **Excel file**. This sub-lane
folds it into the ledger instead:

- A model revision → **GUID diff** (added/removed/changed elements — the same `elements_meta.guid`
  join) → `variation_order.js` prices the delta → fold a **signed `C_Order` amendment** (or a
  `C_Project` variation line) in ERP, painted on the model, recorded in the history dots.
- The VO is a **reversible signed fold** (`crudFoldBack`) — survives dispute, fully auditable.

**Witness — `W-PROJ-VO`:** `§PROJ_VO rev=<r> added=<n> removed=<n> changed=<n> delta=<bd> co=<id>`
— delta folds exact == `variation_order.js` golden (BigDecimal); counts == the GUID diff.

### §H2 — Progress claim / payment certificate (the get-paid side)

§C does the **buy** side (Generate-PO). This closes the **cash-in** loop: % complete per
element/phase (from the §D *Actual* schedule) → certify → fold a **`C_Invoice`/`C_InvoiceLine`
progress billing** (`C_Project.projinvoicerule` governs it; column present, set the rule value).
Paint the model by **claimed / certified / disputed**.

**Witness — `W-PROJ-CLAIM`:** `§PROJ_CLAIM phase=<name> pct=<%> claimed=<bd> certified=<bd>
invoice=<id>` — `claimed` folds exact == `Σ(lineplannedamt × pct)` golden; ties to
`C_ProjectLine.invoicedamt`.

### §H3 — Owner handover: live as-built asset register + FM work orders (7D)

The seed already carries the **full asset lifecycle**: `a_asset_addition`, `a_asset_delivery`,
`a_asset_change`, `a_asset_retirement`, `a_asset_info_fin/_ins/_lic/_tax`. On project completion
(`C_ProjectPhase.iscomplete`), capitalize project lines into `A_Asset` with warranty / serial /
O&M / insurance (reusing `docs/BIMtoERP.md` §B GUID→`A_Asset`). The owner **taps an element →
raises a maintenance request** (`R_Request`). Deliverable: a *queryable, live* asset register
bonded to the 3D model — not a 500-page handover PDF.

**Witness — `W-PROJ-HANDOVER`:** `§PROJ_HANDOVER assets=+<na> warranties=<n> request=<id|->` —
one `A_Asset` per completed-phase GUID; tap→`R_Request` traces to the element GUID.

### §H4 — 4D lookahead procurement (just-in-time)

"What must I order **this week** to not slip?" The model already holds the dates: 4D need-dates
(phase `startdate` minus lead time) + supplier lead times → fold `M_Requisition`/`M_RequisitionLine`
(or POs) with **required-by** dates. Replaces the manual 6-week lookahead.

**Witness — `W-PROJ-LOOKAHEAD`:** `§PROJ_LOOKAHEAD window=<6wk> items=<n> reqs=+<nr>` — every
requisition's required-by == phase `startdate − leadtime`; no item without a real need-date (non-invent).

### §H5 — Embodied carbon as a parallel ledger (6D / ESG)

You already compute 6D carbon (`templates/6D_carbon.json`). Run it **like cost**: a carbon budget
on the project, **carbon actual folded per `C_ProjectIssue`** (each delivery posts its embodied
carbon the way it posts cost). Carbon budget vs actual, painted on the model. Regulatory tailwind;
almost nobody integrates carbon at the *transaction* layer.

**Witness — `W-PROJ-CARBON`:** `§PROJ_CARBON budget=<tco2e> actual=<tco2e> var=<tco2e>` — actual
folds exact == `Σ(issued qty × carbon factor)` golden; factors trace to `6D_carbon.json`.

> **Sequencing:** §H1 (VO) first — most reuse, loudest pain point. Then §H2 (claim) to close the
> cash loop, §H3 (handover) for the owner story, §H4/§H5 as differentiators. Each is a standalone
> sub-lane with its own witness; none blocks §C–§E.

---

## §I — Reporting: Excel export the way QS/PM users actually want

Every §C/§H output gets an **Excel report** in the standard construction layout — not a raw dump.
Reuse the existing engines, do **not** write a new Excel writer:

- **ERP-side reports** (claim, VO register, cost/EVM, asset register) → the **`erp/ninja_excel.js`**
  engine: dictionary-driven, folds SQL over the tenant DB into a workbook **and verifies every total
  by example to the cent**. This is the right tool because its output is *provably correct*, not just
  formatted.
- **Viewer-side quick exports** (BoQ, schedule) → **`viewer/excel.js`** (SheetJS/XLSX) +
  `export_4d.js`/`export_5d.js`, the same path `variation_order.js` already uses.
- **Match iDempiere print layouts** where one exists → the **`erp/report_overlay.js` `foldPrint`**
  PrintFormat fold (already proven: Invoice 8/8, 48 cells, `W-PRINTFORMAT` to the cent).

**The standard report set (the layouts users expect):**

| Report | Grouping | Columns (the conventional shape) |
|---|---|---|
| **BoQ** (Bill of Quantities) | by trade / WBS phase | Item · Description · Unit · Qty · Rate · Amount; section subtotals; grand total |
| **Progress Claim / Payment Certificate** | by phase/line | Contract value · Prev claimed · This claim % · This claim amt · Cumulative · Retention · Net |
| **Variation Order register** | by VO | VO no. · Description · Added/Removed/Changed · Cost impact · Schedule impact · Status |
| **Cost / EVM report** | by phase | PV · EV · AC · CV · SV · CPI · SPI |
| **Schedule** | by phase (seqno) | Phase · Start · End · Duration · % complete · Predecessor |
| **Asset register (handover)** | by asset | Tag/GUID · Product · Serial · Warranty · Value · Locator |

**Layout conventions (the "usually wants" details):**
- **Title block** atop each sheet: project name/value, report date, **currency + rate-pack source**
  (the non-invent traceability — the report says *which* pack/version priced it).
- Frozen header row; grouped rows with **section subtotals**; bold **totals** row.
- Number format: thousands separator + 2 dp; currency symbol from the active pack's `meta.currency`.
- **One workbook, multiple sheets** when a flow spans reports (e.g. a project pack = BoQ + Schedule +
  Cost on three tabs) — mirrors the §C Export chooser's multi-select bundling.
- Footer cites the source rows (GUID / `C_*` id) so any cell is traceable back to the model/ledger.

**The hard rule (this project's ethos): verify-by-example to the cent.** A report is not "done"
because it is formatted — its totals must fold **== the golden** (`ninja_excel.js` already enforces
this). A pretty workbook with a wrong subtotal is a failed report.

**Witness — `W-PROJ-REPORT`:** `§PROJ_REPORT type=<boq|claim|vo|evm|sched|asset> rows=<n>
total=<bd> golden=<bd> match=<bool> cur=<CUR> pack=<name>` — `match=true` (total == golden to the
cent); currency + pack stamped in the title block; every section subtotal sums to the grand total.
