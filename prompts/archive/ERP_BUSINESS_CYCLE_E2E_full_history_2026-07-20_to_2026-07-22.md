# ⚠ DO NOT REMOVE — scope: DISCOVERY witness for the full O2C+P2P business cycle on the live
# iDempiere surface (bim-ootb `erp/idempiere.html` + `erp/crud_overlay.js`). Read the log after every run
# (`build/erp/witness_e2e_business_cycle.log`, gitignored — regenerate via `bash build/erp/run_witness.sh
# scripts/witness_e2e_business_cycle.js` from bim-compiler). This is NOT a green-run hunt — a break IS the
# deliverable. Do not re-run "hoping" for a full pass; the findings below are the answer.

**2026-07-20**, updated **2026-07-21** — witness: `scripts/witness_e2e_business_cycle.js` (bim-compiler).
Precedents adapted: `witness_e2e_crud_blob_race.js`, `witness_e2e_multiuser_login_fork.js`.

## THE QUESTION

Can a real user drive a full business cycle end-to-end through the live iDempiere surface today — Sales
Order → Shipment → Sales Invoice → stock effect → replenishment signal → Purchase Order → Material
Receipt → vendor invoice + three-way match — and if not, exactly where does it break?

## §Results — per-stage table (2026-07-22, current)

| # | Stage | Driven | Result |
|---|---|---|---|
| 1 | Sales Order | UI | **PASS** (was FAIL 2026-07-20 — §Fix entries below, landed) |
| 2 | Delivery / Shipment | UI | **PASS** (2026-07-22 — a real signed `M_InOut` document reaches the op-log via the real UI, first time in this lane's history) |
| 3 | Sales Invoice | UI | **PASS** (2026-07-22 — a real signed `C_Invoice` document reaches the op-log via the real UI; the SAME Confirm-and-Post wiring built for Stage 2, unmodified, closed this too once its own upstream blocker cleared) |
| 4 | Stock effect | UI-observed | **FAIL** (structurally-absent capability, unrelated to any fix in this lane — `m_storageonhand` has no live fold off the op-log anywhere, so a real signed shipment still can't move it; scoped OUT of this lane, see §Closed below) |
| 5 | Replenishment signal | UI | **PASS** |
| 6 | Purchase Order | UI | **PASS** (§Fix 2026-07-21 "DocType/IsSOTrx" landed — the record is now correctly DATA-tagged Purchase, `c_doctypetarget_id:126 issotrx:"N"`; previously byte-identical to a Sales Order underneath) |
| 7 | Material Receipt | UI | **ABSENT** (structural, out of scope — see §Closed below) |
| 8 | Vendor invoice + three-way match | BLOCKED | **ABSENT** (blocked by design, out of scope — see §Closed below) |

## §Closed — the Sales-side O2C cycle (Order → Shipment → Invoice) is DONE, 2026-07-22

**A real user can now drive Sales Order → Delivery → Sales Invoice completely through the live UI,
end-to-end, with real cryptographically-signed documents landing in the op-log at every step.** Nine
connected fixes closed this, each one layer deeper than the last found it: Sales Order completion
(master/detail mis-selection, PR #928), picker-overlay gap (PR #938), dropped hook-derived CREATE fields
(PR #944), handler base-only reads (PR #948), IsSOTrx/DocType-per-window (PR #953),
DeliveryRule/InvoiceRule (PR #955), order-line parent-FK (PR #956), the missing Confirm/Post commit wiring
itself (PR #960), and finally the `AD_Org_ID` casing bug that was uniquely blocking Stage 3 (PR #968). Full
detail in the dated `§Fix` sections below, most recent first.

**What's left is NOT a continuation of this bug-hunting lane — it's three separately-scoped, structural
capability gaps, each independent of the other and of everything fixed above:**
- **Stage 4 (Stock effect):** `m_storageonhand` has no live fold/recompute off the signed op-log anywhere in
  `idempiere.html`/`crud_overlay.js` — a real completed shipment simply cannot be seen to move on-hand qty.
  This is a missing READ-side capability (a new live-fold feature), not a bug in the write path just closed.
- **Stage 7 (Material Receipt):** the manual `M_InOut` New form omits `M_Warehouse_ID`/`C_BPartner_ID`
  entirely, and no Generate-process route exists for PO-side receipts (`inoutGenGate` is hard-gated
  `IsSOTrx='Y'`-only). A real fix needs either a fuller manual form or a P2P-side Generate-Receipts process —
  a bigger design question, not a small fix.
- **Stage 8 (Vendor invoice + three-way match):** blocked by design at three independent points (`c_invoice`
  has no `create` verb at all; `Generate-Invoices` is SO-only gated both at the picker SQL and the process
  gate; no `M_MatchPO` emission exists anywhere). Closing this is effectively "build the P2P invoice path,"
  not a bug fix.

**For a future session:** each of these three is its own scoped project, not a "next item" in this same
discovery witness. If picked up, start a NEW dated section (or a new doc) rather than continuing this one —
this lane's own question ("can Sales-side O2C close end-to-end") is answered: yes, as of 2026-07-22.

<details><summary>Original 2026-07-20 table (superseded, kept for history)</summary>

| # | Stage | Driven | Result |
|---|---|---|---|
| 1 | Sales Order | UI | FAIL |
| 2 | Delivery / Shipment | UI | FAIL (blocked by #1) |
| 3 | Sales Invoice | UI | FAIL (blocked by #1) |
| 4 | Stock effect | UI-observed | ABSENT |
| 5 | Replenishment signal | UI | PASS |
| 6 | Purchase Order | UI | PASS |
| 7 | Material Receipt | UI | ABSENT |
| 8 | Vendor invoice + three-way match | BLOCKED | ABSENT |

</details>

## §Exact §CYCLE lines (from `build/erp/witness_e2e_business_cycle.log`)

```
§CYCLE stage=1 name=SalesOrder driven=UI result=FAIL detail=exception: Order Line tab locked onto the WRONG parent — expected C_Order_ID=-1, got: §IDEMPIERE-MD tab=Order Line level=1 parent=C_Order filter=C_Order_ID=108
§CYCLE stage=2 name=Shipment driven=UI result=FAIL detail=exception: new SO not offered by Generate-Shipments picker (target=-1, options=[{"v":"100","t":"80000  (rule A)"},{"v":"101","t":"80001  (rule A)"},{"v":"108","t":"60000  (rule A)"},{"v":"1300100","t":"80000  (rule A)"},{"v":"1300101","t":"80001  (rule A)"},{"v":"1300108","t":"60000  (rule A)"}])
§CYCLE stage=3 name=SalesInvoice driven=UI result=FAIL detail=exception: new SO not offered by Generate-Invoices picker (target=-1, options=[{"v":"100","t":"80000  (rule D)"},{"v":"101","t":"80001  (rule D)"},{"v":"102","t":"80002  (rule D)"},{"v":"108","t":"60000  (rule I)"},{"v":"1300100","t":"80000  (rule D)"},{"v":"1300101","t":"80001  (rule D)"},{"v":"1300102","t":"80002  (rule D)"},{"v":"1300108","t":"60000  (rule I)"}])
§CYCLE stage=4 name=StockEffect driven=UI-observed result=ABSENT detail=m_storageonhand product=130 warehouse=103 baseline=18 current=18 (no shipment was created upstream — Stage2 did not produce a document to reduce stock)
§CYCLE stage=5 name=ReplenishmentSignal driven=UI result=PASS detail=Generate Replenishment produced a staged list (real m_replenish level_min/level_max rows exist in seed)
§CYCLE stage=6 name=PurchaseOrder driven=UI result=PASS detail=PO 1784489523834 (id=-2) authored+completed via real UI — §AD-MODELVAL-LIVE table=c_order verb=create verdict=OK derived={"m_warehouse_id":103,"bill_location_id":null,"c_currency_id":100,"c_doctypetarget_id":132,"c_paymentterm_id":105} fired=11
§CYCLE stage=7 name=MaterialReceipt driven=UI result=ABSENT detail=M_InOut id=-5 created but header New form omits M_Warehouse_ID C_BPartner_ID (fields shown: documentno,movementdate,description,docstatus); no InOutGenerate-equivalent process exists for PO receipts (inoutGenGate hard-requires IsSOTrx='Y', confirmed by source read) so this manual path is the ONLY route to a Material Receipt at all
§CYCLE stage=8 name=VendorInvoiceThreeWayMatch driven=BLOCKED result=ABSENT detail=C_Invoice has no "create" verb (crud_ops.json, confirmed by §INPLACE-NEW ...skipped(create not permitted) live) so a vendor invoice can never be manually authored; Generate-Invoices (AD_Process 119) is gated IsSOTrx='Y'-only at BOTH the UI picker SQL and the ad_process.js invoiceGenGate() so it never offers a Purchase Order either (confirmed: PO -2 offered=false); no M_MatchPO CREATE_LINE exists anywhere in erp_engine.js (source-verified) and the only M_MatchInv CREATE_LINE is inside completeInvoice() which is unreachable without a vendor invoice — the three-way match therefore has NO path to ever populate through this UI today (m_matchpo=37 m_matchinv=18)
```

Log: `build/erp/witness_e2e_business_cycle.log` (1674 lines, gitignored — regenerate to re-view). Exit
code 0 = harness ran correctly to completion (all 8 stages produced a real verdict); it is NOT a claim
that the cycle passed — read the lines above, per the file's own header, not the exit code.

## §Findings — detail per stage

**Stage 1 (Sales Order) — FAIL, reproducible across 3 consecutive runs.** All four real GardenWorld Sales
Orders in the shipped seed (`documentno` 80000/80001/80002/60000, `c_order_id` 100/101/102/108) are
already fully delivered AND invoiced (`qtydelivered=qtyordered`, `qtyinvoiced=qtyordered`) — so exercising
a real shipment/invoice effect requires authoring a fresh order. The witness did: New → fill header
(documentno, C_BPartner_ID=112 "Standard", DateOrdered, GrandTotal, M_PriceList_ID, Bill_BPartner_ID) →
Save → **confirmed via the same `data-ad-record` attribute the app itself renders** that the new order got
a real (synthetic, negative) key. Clicking that exact row and opening the **Order Line** detail tab, the
app's own diagnostic (`§IDEMPIERE-MD tab=Order Line level=1 parent=C_Order filter=C_Order_ID=…`) showed
the child tab locked onto **C_Order_ID=108** — an unrelated, pre-existing seed order (documentno 60000,
already Closed) — not the order the user just created and clicked. This happened on every run. The
**identical** code path on window 181 (Purchase Order, Stage 6) correctly locked onto the new PO's own id
every time. So this is not generic breakage of "new records + child tabs" — it is specific to how Sales
Order's master/detail selection resolves a freshly-created (overlay-only) header row. A real user
authoring a new Sales Order and adding a line would silently add that line to Order 60000 instead — a
data-integrity hazard, not merely an inconvenience.

**Stage 2 / 3 (Shipment / Sales Invoice) — FAIL, direct consequence of #1.** Both Generate-Shipments
(AD_Process 118) and Generate-Invoices (AD_Process 119) were reached via the real, documented
`?process=<id>` deep link (idempiere.html's own comment: "mirrors `?window=`") and rendered their real
order picker. Since Stage 1 never produced a genuinely order-linked line, the new order was never a valid
"generate shipment/invoice" candidate.

**Stage 4 (Stock effect) — ABSENT, and structurally unreachable regardless of Stage 1/2.** `m_storageonhand`
lives only in the raw seed db (`window.__idmpDb`), which the witness confirmed by direct read (baseline
and current on-hand for Plum Tree/HQ Warehouse both read 18). No document produced through
`crud_overlay.js` (create, DocAction, or a Generate-process) writes into that raw table — every such write
lands only in the signed op-log sidecar (`§CRUD-PERSIST … source=sidecar`). Grepping the whole `erp/`
tree found **no live fold/recompute of `qtyonhand` off the op-log anywhere in `idempiere.html` or
`crud_overlay.js`** — `erp_engine.js`'s `qtyOnHand(events, opts)` is a pure function that takes its
`events` as a host-supplied argument; nothing in the live UI ever calls it. So even in a world where
Stage 1/2 worked perfectly, there is currently no way for a real user to SEE on-hand quantity change as a
result of any document they complete through this window.

**Stage 5 (Replenishment signal) — PASS.** Reached by logging in as GardenUser (the real POS-scoped
persona) and tapping the real cart pill (`#pos-pill-payment`) to open the float panel — same gesture the
User Guide documents ("the cart pill summons a floating panel"). **Generate Replenishment**
(`#pos-repl-generate`) produced a real staged list off the shipped `m_replenish` policy rows (19 real
`level_min`/`level_max` rows in the seed). This is the one stage of the eight that closes cleanly. It is
**only** reachable from inside the POS panel — grep of `ad_process.js`'s handler REGISTRY confirms no
standalone `org.compiere.process.ReplenishReport*` classname is registered, so there is no menu/process
path to a replenishment signal anywhere outside POS.

**Stage 6 (Purchase Order) — PASS.** New → header (documentno, C_BPartner_ID=120 "Seed Farm Inc.", a real
vendor) → Save → PO Line (product 130, qty 5, real tax/UOM) → Save, confirmed via
`§IDEMPIERE-MD … filter=C_Order_ID=<the new PO's own id>` that the line correctly attached to the new PO
— → Complete via the real DocAction bar. The status chip read `Completed · CO`. Notably the PO header's
New form (same curated `crud_ops.json` `c_order` entry as Sales Order) has **no editable M_Warehouse_ID
field at all**, yet `§AD-MODELVAL-LIVE` showed a save-hook correctly derives `m_warehouse_id:103` — a
genuine, working default, not a gap.

**Stage 7 (Material Receipt) — ABSENT.** Window 184's New form for `M_InOut` shows only **4** fields:
`documentno`, `movementdate`, `description`, `docstatus` — no `M_Warehouse_ID`, no `C_BPartner_ID` (both
mandatory on a real receipt). A record was created, but with no route through the UI to give it a
warehouse or vendor. There is also no process-driven alternative: `inoutGenGate()` in `ad_process.js`
hard-requires `IsSOTrx='Y'`, and `renderOrderPicker()`'s own SQL hardcodes `AND issotrx='Y'` — so
Generate-Shipments can never be pointed at a Purchase Order. **A Material Receipt has exactly one route in
this product (the sparse manual form above) and no route at all to a properly warehouse/vendor-linked
one.**

**Stage 8 (Vendor invoice + three-way match) — ABSENT, blocked by design, independent of every other
stage.** Three separate, mutually-reinforcing facts, each confirmed live:
1. `erp/crud_ops.json`'s `c_invoice` entry lists `"verbs": ["update","delete","process"]` — **no
   "create"**. Clicking New on window 183 (Purchase Invoice) produces the real console line
   `§INPLACE-NEW table=c_invoice skipped (create not permitted)` and no inline form mounts. A vendor
   invoice — or a sales invoice, same table — can never be manually authored, by design.
2. `invoiceGenGate()` requires `IsSOTrx='Y'`, and the picker's own SQL is `AND issotrx='Y'` — confirmed
   live: the completed Purchase Order from Stage 6 was **not** offered by the Generate-Invoices picker.
3. `M_MatchPO` is never emitted anywhere in `erp_engine.js` (grep-verified, zero hits outside a display-
   label map); `M_MatchInv` is only built inside `completeInvoice()` when `invoice.issotrx==='N'` —
   unreachable per (1). `m_matchpo`/`m_matchinv` counts (37/18) are pre-existing seed rows, untouched.

The three-way match has **no path to ever populate through this UI today** — not a bug to fix incrementally,
a structurally absent capability.

## §Gaps — ranked by what most blocks a user completing the cycle

1. **Sales Order master/detail mis-selection (Stage 1).** The single highest-leverage fix: it silently
   misattributes a new order's lines to an unrelated existing order, and blocks every downstream O2C stage
   in this cycle. Reproduce: create a new Sales Order via window 143, click its row, open Order Line,
   watch `§IDEMPIERE-MD` report the wrong `C_Order_ID`. The identical flow on window 181 (Purchase Order)
   works correctly — the fix is localized to whatever differs between those two tabs' selection handling.
2. **Vendor invoice creation is entirely absent (Stage 8).** By design (`crud_ops.json`), not a bug — but
   it means the P2P side of this ERP cannot close a purchase cycle at all: no manual invoice, no
   Generate-Invoices path (SO-only gate), no `M_MatchPO`/`M_MatchInv` population. This is the largest
   capability gap of the eight stages.
3. **Material Receipt has no properly-linked authoring path (Stage 7).** The header form omits the two
   fields (warehouse, vendor) that make a receipt meaningful, and there is no generator to fall back to.
4. **No live on-hand recompute anywhere in the UI (Stage 4).** Even a perfect shipment produces no visible
   stock change — `m_storageonhand` is a static seed table with nothing reading the op-log to update it.
5. **Replenishment is POS-only (Stage 5, the one PASS).** It works, but only from inside the POS panel —
   there is no standalone process/menu path for a non-POS user (e.g. a warehouse manager in the standard
   windows) to see the same signal.

## §Witness

`scripts/witness_e2e_business_cycle.js` — single browser tab, real click-through UI (`page.click`/
`page.fill`/`page.selectOption` on the real toolbar, inline CRUD-ring fields, DocAction bar, and the
documented `?process=<id>` deep link), read-only observation only via `window.__idmpDb.exec()` (the app's
own `_sqlRows()` accessor, valid for unmodified seed tables) and `window.__crud.kernelDb()` +
`window.__crud.core.tipDocs()` (the app's own published sidecar read API, necessary because every
CRUD-overlay write — create, DocAction, or a Generate-process — lands only in the signed op-log sidecar,
never as a raw INSERT into the base seed db; this is itself a fact this witness had to discover
empirically mid-build, not assumed). Real seed data only (GardenWorld client 11): C_BPartner 112
"Standard" (customer), 120 "Seed Farm Inc." (vendor), M_Product 130 "Plum Tree" (18 on-hand at recon),
M_Warehouse 103 "HQ Warehouse". No product code was touched. Run:
`bash build/erp/run_witness.sh scripts/witness_e2e_business_cycle.js` from bim-compiler; log at
`build/erp/witness_e2e_business_cycle.log` (gitignored, regenerate to re-view).

## §Fix — 2026-07-20, Gap 1 (Sales Order master/detail mis-selection) FIXED, not yet pushed

**Root cause, confirmed exactly as §Gaps #1 predicted:** `erp/idempiere.html`'s `overlay:committed`
handler's `CRUD_CREATE` branch (~line 2967) folds the new row into `_records` via `_overlayListTip()` and
repaints, but never updated `_recIdx`/`_selByLevel` — master-detail child tabs filter by
`_selByLevel[level-1]` (`renderActiveTab` ~line 1723), so it stayed pinned to whichever record was current
at window open. Purchase Order (window 181) was never actually different code — it just hadn't been
exercised New+Save+drill in a session state where the stale index pointed elsewhere.

**One correction to the mechanism assumed going in:** the fix could NOT key off `overlay:committed`'s
`id` field (`d.id`) as first suspected — `buildOp()` in `erp/crud_overlay.js` never sets `base.id` for a
`CRUD_CREATE` (only update/delete/process do), so that field is always `null` on create. The new row's
real synthetic pk (`-opId`) only becomes known inside `_overlayListTip`'s `listTip()` fold. Fix: capture
that fold's `created` array into a new `_lastFoldCreated` var, and in the `CRUD_CREATE` branch use its
last entry (the just-committed row) to locate the record in `_records`, set `_recIdx`, and call
`_setSel(ct)` so `_selByLevel[ct.tabLevel]` updates to the real new pk. New `§CRUD-CREATE-SEL` log line
proves the threading.

**Witness: `W-SO-CHILD-BIND`** (`bim-compiler/scripts/witness_so_child_bind.js`, run via
`bash build/erp/run_witness.sh scripts/witness_so_child_bind.js`) — single focused check: New+Save a
Sales Order, drill into Order Line, assert `§IDEMPIERE-MD filter=C_Order_ID=<pk>` equals the new order's
own pk. 🟢 on the fixed worktree:
```
§CRUD-CREATE-SEL table=c_order id=-1 recIdx=5 selLevel=0 sel=-1
§IDEMPIERE-MD tab=Order Line level=1 parent=C_Order filter=C_Order_ID=-1
🟢 W-SO-CHILD-BIND: Order Line child tab filters by the NEW order's pk, not a stale seed order
```
Before/after via the original `witness_e2e_business_cycle.js`: unfixed run (`/home/red1/bim-ootb` main,
unmodified) — `§IDEMPIERE-MD ... filter=C_Order_ID=108` (the seed order) against new order pk `-1`, Stage 1
throws exactly the predicted error. Same script re-run against the fixed worktree — `filter=C_Order_ID=-1`,
matches; the parent-binding sub-check now passes. Stage 1's overall PASS/FAIL in that broader witness
still shows FAIL, but for an **unrelated, separate reason**: the DocAction Complete (CO) button did not
render on that run (`chip=null coButtonVisible=0`) — out of scope for this fix (not the parent-binding
defect), reported as-is, not investigated further. Stages 2-4 remain blocked by the pre-existing,
already-documented Gap 2/3/4 facts above (P2P absence, no receipt-linking path, no on-hand recompute),
unchanged by this fix.

**State:** DEPLOYED 2026-07-21. Branch was 1 commit behind `main` — merged `origin/main` into
`fix/so-child-bind` in worktree `/tmp/wt-so-bind` (clean, no conflicts; merge commit `306effe`),
re-ran `W-SO-CHILD-BIND` against the synced worktree (still 🟢), pushed, opened
[PR #928](https://github.com/red1oon/bim-ootb/pull/928), auto-merge (squash) armed — merges once
`fast-checks` CI passes.

---

## §Fix — 2026-07-21, Stage 1's remaining "CO did not land" — WITNESS artifact, not a product bug

With `fix/so-child-bind` now live on `main` (PR #928 merged, confirmed via a fresh checkout re-sync), the
"unrelated, separate reason" named above — `chip=null coButtonVisible=0` — was investigated rather than
left as a standing note. Root-caused via a debug worktree (`/tmp/wt-so-docaction`, throwaway diagnostics,
never committed) with targeted `console.log`s at `_fsmCtx`, `buildForm`, the `<tr>`/`<td>` click handlers,
and `editInline`'s call stack — each step ruled out a hypothesis (tableId mismatch: no, both SO/PO tabs
are `AD_Table_ID=259`, verified via `sqlite3`; case-sensitivity in `recVal`: no, it's already
case-insensitive; a stale `_newMode`: no, `afterSaveCreate` correctly clears it) until the actual
mechanism surfaced:

**`idempiere.html`'s grid deliberately makes every individually crud-editable cell open a single-field
inline cell editor on click** (`_editGridCell`, P4/W-INPLACE-GRID-LIVE, "GridView parity" — `td`'s click
handler calls `ev.stopPropagation()`, so the row's own click handler never fires). Playwright's
`row.click()` lands on whatever cell happens to sit at the row's geometric center — column layout
happened to put `DocumentNo` (curated crud-editable, per `crud_ops.json`'s `c_order` field list) there for
window 143's Order tab, and `POReference` (NOT in that field list, so `_editGridCell` correctly falls
through to `openForm()` → the full record + DocAction bar) for window 181's Purchase Order tab. **Same
table, same code, no Sales-Order-specific defect** — pure column-position luck determined by which window
was under test, confirmed with `§DEBUG-TDCLICK`/`§DEBUG-TRCLICK` instrumentation showing every single
click (both windows, both the first and second row-open) landing on a `<td>`, never the bare `<tr>`.

**Fix (witness-only, no product code touched):** `scripts/witness_e2e_business_cycle.js` gained
`clickRowOpen(row, opts)` — clicks the row's `td[data-ad-col="POReference"]` cell explicitly (present in
both windows, deterministically non-crud-editable) instead of the bare row, falling back to the row click
if that column isn't rendered. Replaces all four `found*.handle.click()` call sites (Stage 1's two row-opens
+ Stage 6's two, the only stages driving `c_order`). Also made `ROOT` env-overridable
(`process.env.WITNESS_ROOT`) so this and future debug sessions can point the witness at a throwaway
worktree without editing the file each time.

**Result — Stage 1 now PASSES.** Re-run (`bash build/erp/run_witness.sh scripts/witness_e2e_business_cycle.js`
against live `bim-ootb main`), log read in full (Log Mandate):
```
§CYCLE stage=1 name=SalesOrder driven=UI result=PASS detail=order 1784602787337 (id=-1) authored+completed via real UI; header New form has NO m_warehouse_id field but a save-hook derives it (103) per §AD-MODELVAL-LIVE
```
A real, freshly-authored Sales Order can now be taken all the way through New → Save → Order Line → back to
header → **Complete (CO)** via the real DocAction bar, end to end, through the live UI — the most basic
iDempiere user action (author + complete a document) genuinely works today.

**Stages 2/3 now fail for a NEW, more precise, and real reason** (previously masked by Stage 1's failure,
since 2/3 are gated on 1's order actually reaching CO):
```
§CYCLE stage=2 name=Shipment driven=UI result=FAIL detail=exception: new SO not offered by Generate-Shipments picker (target=-1, options=[...four existing seed orders, no -1...])
§CYCLE stage=3 name=SalesInvoice driven=UI result=FAIL detail=exception: new SO not offered by Generate-Invoices picker (same shape)
```
The freshly-completed order (a synthetic negative-pk overlay row) is never offered as a candidate by either
Generate-process's order picker — both pickers' options lists show only the four pre-existing seed orders.

---

## §Fix — 2026-07-21, Stage 2/3 picker gap — CONFIRMED and fixed (one layer); a DEEPER, distinct layer found underneath

**Confirmed:** `renderOrderPicker()` (`idempiere.html:2386`) read candidates via `_sqlRows("SELECT ... FROM
c_order WHERE " + statusClause + " AND issotrx='Y'")` — `window.__idmpDb` only, the raw seed bundle. It
never folded the op-log overlay, so a freshly-created-then-Completed order (a signed `CRUD_CREATE` +
`SET_STATUS` pair in the sidecar) could never be a candidate no matter how legitimately it reached CO. Same
class of "engine-proven, UI reads the wrong source" gap this lane keeps finding.

**Fix (branch `fix/order-picker-overlay-fold`, worktree `/tmp/wt-order-picker-overlay`):** `renderOrderPicker`
now pulls ALL `issotrx='Y'` base rows (no status filter — a synthetic row's status only exists post-fold),
folds `CRUD_CREATE`/`CRUD_UPDATE` via `window.__crud.core.listTip` (the SAME primitive `idempiere.html`'s own
`_overlayListTip` already uses for grids — non-invent, reused verbatim), overlays each row's latest signed
`SET_STATUS` via `core.readTip` (same primitive `_overlayDocTip` uses for the status chip), THEN applies the
status filter. No sidecar/engine present → falls through to the OLD base-only behavior (never worse than
before). Rendering is now async (mount the pane immediately with a "Loading…" option, repaint once the fold
resolves) since the sidecar hydrate is async.

**Witnessed — the picker itself is fixed.** Re-run (`WITNESS_ROOT=/tmp/wt-order-picker-overlay bash
build/erp/run_witness.sh scripts/witness_e2e_business_cycle.js`), log read in full:
```
§GENSHIP-LIVE-CANDIDATES count=7 ids=[100,101,108,1300100,1300101,1300108,-1]
§E2E-PICKER genship options=[...six seed orders..., {"v":"-1","t":"1784606993701  (rule undefined)"}]
```
The new order (`-1`) is now correctly offered — confirms the picker fold works exactly as designed.

**But Stage 2/3 still FAIL, for a NEW and DEEPER reason, found immediately underneath:**
```
§GENSHIP-LIVE run proc=118 Record_ID(C_Order_ID)=-1 M_Warehouse_ID=NaN
§AD-PROC-LIVE proc=118 name="Generate Shipments" classname=org.compiere.process.InOutGenerate dispatched=N reason=param-validation-failed
```
The process now RUNS (picker gap closed) but is rejected at param validation: `M_Warehouse_ID=NaN`. Traced
to the actual root cause, one more layer down, via `saveForm`/`buildOp` in `crud_overlay.js`:

1. `c_order`'s New form has no `m_warehouse_id` field (confirmed, Stage 1 §Findings) — the value is
   **derived** by a `BEFORE_SAVE` model-validation hook (`fireBeforeSaveHooks`, `crud_overlay.js:1546`) and
   correctly merged into `vals.m_warehouse_id` at save time (`crud_overlay.js:1242`, whose OWN comment
   already states the intent: *"a beforeSave-filled MANDATORY default that has NO visible field... must
   STILL persist on the new row — iDempiere saves what beforeSave derived"*).
2. But `buildOp('create', ...)` (`crud_overlay.js:212`) then calls `base.fields = cleanVals(entry, values)`,
   and `cleanVals` (`crud_overlay.js:160-164`) **only copies keys present in `entry.fields`** — `c_order`'s
   crud_ops.json entry does not declare `m_warehouse_id` (by design — no visible field for it), so
   `cleanVals` silently drops the just-derived value before it ever reaches the signed `CRUD_CREATE` op.
3. Net effect: the derived value correctly unblocks the SAVE (the hook doesn't reject), but is never actually
   PERSISTED anywhere — not just invisible to the Generate-Shipments picker, genuinely absent from the
   record. Any future reader of this order's warehouse (not only this picker) would see it missing.

Stage 4 (stock effect) remains structurally unreachable regardless (§Findings above, unchanged). Stages 5-8
unchanged from prior runs (Stage 8's PO-not-offered-to-Generate-Invoices finding, IsSOTrx-gated by design,
is unrelated to any of the three fixes in this cycle).

---

## §Fix — 2026-07-21, `cleanVals`/`buildOp` — FIXED and witnessed; one more layer found underneath

**Fix (branch `fix/cleanvals-create-derived`, worktree `/tmp/wt-cleanvals-create`):** `cleanVals`
(`erp/crud_overlay.js:165-179`) now takes a third `verb` arg. On `verb==='create'` only, after copying every
declared field (unchanged behavior), it also copies any OTHER key already present in `values` that isn't
`null`/`''` — i.e. exactly the hook-derived columns `saveForm`'s `fireBeforeSaveHooks` callback already
merges into `vals` at `crud_overlay.js:1242` (confirmed by tracing `gatherVals`, `crud_overlay.js:1210-1213`:
it seeds `vals` ONLY from `entry.fields`, so no other writer can put an extra key there — the passthrough is
provably scoped to hook-derived values, not stray UI state). `buildOp`'s one call site
(`crud_overlay.js:225`) now passes `verb` through. `cleanVals` has exactly one caller in the whole tree
(confirmed via grep, incl. its `CORE.cleanVals` export) — always inside the CREATE branch — so this is a
fully self-contained, single-function change; UPDATE's tight declared-only guard is untouched.

**Witnessed** — re-ran `scripts/witness_e2e_business_cycle.js` against both the unfixed baseline
(`WITNESS_ROOT` unset → `bim-ootb` `main`) and the fixed worktree (`WITNESS_ROOT=/tmp/wt-cleanvals-create`),
full log read both times (Log Mandate):
```
baseline: §GENSHIP-LIVE run proc=118 Record_ID(C_Order_ID)=-1 M_Warehouse_ID=NaN
          §AD-PROC-LIVE proc=118 ... dispatched=N reason=param-validation-failed
fixed:    §GENSHIP-LIVE run proc=118 Record_ID(C_Order_ID)=-1 M_Warehouse_ID=103
          §AD-PROC-LIVE proc=118 ... dispatched=Y ok=N rows=0 reason=order-not-shippable
```
The derived warehouse now rides the `CRUD_CREATE` op and reaches the process param — Generate-Shipments
moves from rejected-before-running to actually dispatched. No regression: Stage 1 (SalesOrder) still PASS,
Stage 6 (PurchaseOrder, same `c_order` create path, same derived-field set) still PASS with the identical
`§AD-MODELVAL-LIVE derived={...}` line, Stages 4/5/7/8 unchanged.

**Stage 2 now fails ONE LAYER DEEPER, a genuine business-rule gate, not this bug:** `inoutGenGate()`
(`ad_process.js:251-256`) requires the order's `docstatus==='CO'` — but the process HANDLER's own
`ctx.fetchOrder(info)` (unlike the picker, which was already fixed 2026-07-21 above to fold the sidecar)
still reads the RAW base `c_order` table only, so it sees the synthetic order's status as it exists in
`window.__idmpDb` (never `CO` — the CO only exists as a signed op in the sidecar). Same "engine/handler reads
the wrong source, picker was fixed but the handler wasn't" pattern this whole lane keeps finding — one
function (`fetchOrder`'s wiring into `registerInOutGenerate`/`registerInvoiceGenerate`'s ctx), not yet
touched, named here for the next session.

**A SEPARATE, independently-confirmed new bug found investigating Stage 3 (Generate Invoices) — real root
cause identified, NOT fixed this session:** `§GENINV-LIVE` shows `AD_Org_ID=NaN` even after the cleanVals
fix (unlike `M_Warehouse_ID`, which is now correct). Traced to `listTip`'s stdDefaults-materialization block
(`crud_overlay.js:386-405`, "Task 1 — iDempiere setStandardDefaults parity"): it writes the new row's derived
tenant/audit columns in **mixed case** — `nr['AD_Org_ID']`, `nr['AD_Client_ID']`, `nr['CreatedBy']`,
`nr['UpdatedBy']`, `nr['Created']`, `nr['Updated']`, `nr['IsActive']`, `nr['Processed']`, `nr['Processing']`,
`nr['Posted']` — while every OTHER key on that same row object (`nr[c] = f[c]` from `op.fields`, one line
above at `crud_overlay.js:385`) is lowercase, matching this codebase's column convention throughout (`
m_warehouse_id`, `c_currency_id`, etc. — confirmed via `_getTableCols`, which itself lowercases whatever
`PRAGMA table_info` returns before comparing). `renderOrderPicker` (`idempiere.html:2408/2433`) reads
`r.ad_org_id` (lowercase) off the SAME folded row — finds nothing, `Number(undefined)` → `NaN`. Confirmed
this is a real bug and not by-design: grepped every `.js`/`.html` file in `erp/` for a JS (non-SQL) property
read of `.AD_Org_ID`, `.AD_Client_ID`, `.CreatedBy`, `.UpdatedBy`, `.IsActive` etc. on a folded row —
zero hits, nothing anywhere consumes the mixed-case form. **Not yet fixed** (out of scope for this
session's handoff, which was cleanVals specifically) — the fix is a straight 10-line case-lowering in that
one block, no other logic change, but confirming it doesn't regress anything reading real `AD_*` system-table
rows elsewhere (a genuinely different, PascalCase-cased table family, per `ad_graph.js:264`'s `rec.IsActive`
on a raw `AD_Table` query row) needs a deliberate look before touching it — named precisely here so the next
session doesn't have to re-derive it.

Stage 3 (SalesInvoice) result is unaffected either way this session (still FAIL) — `invoiceGenGate()`
(`ad_process.js:319-324`) never even reaches the `AD_Org_ID` question yet; `§AD-PROC-LIVE proc=119 ...
dispatched=N reason=param-validation-failed` fires first because the process's own mandatory-param check
(`validateParams`, `ad_process.js:515-530`) rejects the `NaN` before the handler runs at all.

---

## §Fix — 2026-07-21, Stage 2's `fetchOrder`/`fetchOrderLines` base-only read — FIXED and witnessed;
## found a THIRD, more structural gap underneath (IsSOTrx/DocType never derived at all)

**Fix (branch `fix/genship-fetchorder-overlay`, worktree `/tmp/wt-genship-fetchorder`, bim-ootb PR #948,
auto-merge armed):** `_procCtx()`'s `fetchOrder`/`fetchOrderLines` (`idempiere.html`) read ONLY
`window.__idmpDb` — the same class of bug the picker fix (§Fix above) already closed for the SELECTOR, not
yet for the RUN path: `inoutGenGate()` checks `order.docstatus==='CO'`, but the handler's own order-fetch
never saw the synthetic order's sidecar-only CO status. New `_foldOrderRow(id)`/`_foldOrderLines(id)`
helpers reuse the SAME `window.__crud.core.listTip`/`readTip` primitives the picker already uses, read
SYNCHRONOUSLY via `window.__crud.kernelDb()` (safe: the picker's own `withSidecar` call has already
hydrated it by the time Run is clicked — confirmed by tracing `withSidecar`'s `SIDE = db;
_flushSideCbs(SIDE)` ordering, the assignment always precedes the callback). Falls through to the base-only
row/rows on any infra gap, matching the lane's established "never worse than before" convention.

**Witnessed** (also enriched `§AD-PROC-LIVE`'s console.log to surface `res.message`, previously silently
dropped — needed to diagnose what this fix uncovered):
```
before: §AD-PROC-LIVE proc=118 ... dispatched=Y ok=N rows=0 reason=order-not-shippable
after:  §AD-PROC-LIVE proc=118 ... dispatched=Y ok=N rows=0 reason=order-not-shippable
        message="Order is not a Sales Order (Generate Shipments is the SO path)"
```
The gate now reaches the `IsSOTrx` check (previously failed one check earlier, on `DocStatus` — confirmed
by the message text changing) — the fix genuinely closes the DocStatus layer. No regression: Stage 1/5/6
unchanged.

**NOT yet fixed — a THIRD, more structural gap, found immediately underneath, DIFFERENT IN KIND from the
first two (this one isn't "handler reads the wrong source" — the value never gets derived ANYWHERE):**
`order.issotrx` is `undefined` on a freshly-created order because `c_order`'s `crud_ops.json` entry has no
`issotrx` field (declared or hook-derived) at all. Traced to `MOrder.docTypeTargetDefault`
(`ad_modelval.js:131-138`, a faithful port of real `MOrder.java:1311-1312`): it ALWAYS defaults
`c_doctypetarget_id` to the client's Standard **Sales** Order doctype when the record doesn't already
supply one — real iDempiere lets a window override this via its own `AD_Window`-level DocType context
default, but THIS UI's `c_order` New form has no DocType field/context at all (confirmed already, Stage 6
§Findings — "same curated crud_ops.json c_order entry as Sales Order... no editable ... field"). Net effect,
confirmed by the log: **the Sales Order (Stage 1) and the Purchase Order (Stage 6) both derived the
IDENTICAL `c_doctypetarget_id:132`** (`derived={"m_warehouse_id":103,...,"c_doctypetarget_id":132,...}`,
byte-identical across both `§AD-MODELVAL-LIVE` lines) — there is currently no signal anywhere in this UI
that distinguishes a Purchase Order from a Sales Order at the DATA level, only by which window/menu item the
user happened to click. **Resolved, not just flagged:** `c_doctype_id=132` in the seed
(`erp/ad_seed.db`) is `name="Standard Order" docbasetype='SOO' docsubtypeso='SO' issotrx='Y'` — a genuine
SALES doctype. So Stage 6's "PurchaseOrder PASS" (§Findings above) is a real UI-level pass (the record was
authored via the PO window, has a real vendor `C_BPartner_ID`, completed via the DocAction bar) but the
underlying record is DATA-tagged as a Standard **Sales** Order — `IsSOTrx` was never actually set to `'N'`
anywhere. This is a genuine, distinct gap (this UI has no Purchase doctype in its `c_doctype` seed selection
path / no window-level DocType default), not a regression from either fix in this session. **Needs its own
fix session** — likely: (a) confirm whether a Purchase-side Standard doctype even exists in the seed, (b)
wire `_docCtx()`/`fireBeforeSaveHooks`'s ctx with a window-scoped DocType hint (PO window → Purchase
doctype) the same way `M_Warehouse_ID` already gets a ctx fallback (`ad_modelval.js:86-90`,
`MOrder.warehouseMandatory`) — `docTypeTargetDefault` (`ad_modelval.js:131-138`) would need the SAME
`ctx`-fallback treatment before falling back to the client's Standard SO. Not attempted this session — a
data-model fix, not a "handler reads wrong source" fix like the two above it.

Stage 3 remains blocked earlier still (param-validation on `AD_Org_ID=NaN`, the separate casing bug named
above) — unaffected by this fix or this finding.

---

## §Fix — 2026-07-21, IsSOTrx/DocType-per-window — FIXED and witnessed; found a FOURTH gap underneath
## (DeliveryRule/InvoiceRule, same shape, blocking Generate-Shipments' last mile)

**Fix (branch `fix/doctype-per-window`, worktree `/tmp/wt-doctype-per-window`, bim-ootb PR #953, auto-merge
armed):** confirmed the gap named directly above is real and fixable — the seed genuinely has a distinct
Purchase-side Standard doctype (`c_doctype_id=126 name="Purchase Order" docbasetype='POO' docsubtypeso=NULL
issotrx='N'`, queried live from `erp/ad_seed.db`), and the WINDOW already carries the real per-window signal
needed to pick it: `AD_Tab.WhereClause` for window 143 (Sales Order tab) is `"C_Order.IsSOTrx='Y'"`, for
window 181 (Purchase Order tab) is `"C_Order.IsSOTrx='N'"` — real AD metadata, already loaded into
`tab.whereClause` and already used for GRID filtering, just never consulted at CREATE time. Three small,
connected edits:
1. `idempiere.html`'s `buildForm()` (the CREATE branch, right before calling `window.__crud.createInline`)
   extracts `/\bIsSOTrx\s*=\s*'([YN])'/i` from `_curTab().whereClause` and stashes it on
   `window.APP._createIsSOTrx` — the SAME session-context channel `_docCtx()` already reads `orgId`/
   `clientId` from (not a new side-channel, the existing convention).
2. `crud_overlay.js`'s `_docCtx(b)` surfaces it as `ctx.issotrx` when present.
3. `ad_modelval.js`'s `MOrder.docTypeTargetDefault` (`ad_modelval.js:131-146`) now branches on
   `ctx.issotrx==='N'` to pick the Purchase-side doctype instead of always the Standard Sales one, AND
   (new, needed since IsSOTrx has no other source anywhere in this engine) derives `d(info).issotrx` from
   the resolved doctype's own `issotrx` column — real iDempiere sets this at record-construction time from
   the chosen DocType, a seam this ported engine doesn't have yet, so the beforeSave slice is the only place
   left to do it faithfully.
No behavior change for any create that supplies no hint (falls through to the original Standard-Sales
default — every other table's create path is untouched).

**Witnessed**, full log read (Log Mandate):
```
Stage 1 (SO): §AD-MODELVAL-LIVE ... derived={"m_warehouse_id":103,...,"c_doctypetarget_id":132,"issotrx":"Y",...}
Stage 6 (PO): §AD-MODELVAL-LIVE ... derived={"m_warehouse_id":103,...,"c_doctypetarget_id":126,"issotrx":"N",...}
```
Previously BYTE-IDENTICAL (`c_doctypetarget_id:132` for both) — now genuinely distinct and correct. Generate-
Shipments' gate, which had been failing on `IsSOTrx` (§Fix above), now **fully passes**:
```
before: §AD-PROC-LIVE proc=118 ... dispatched=Y ok=N rows=0 reason=order-not-shippable message="Order is not a Sales Order..."
after:  §AD-PROC-LIVE proc=118 ... dispatched=Y ok=Y rows=0
```
No regression: Stage 1/5/6 still PASS (Stage 6's PASS is now also a genuinely correct data-level pass, not
just a UI-level one — see §Fix above for the prior caveat, now resolved).

**Stage 2 still FAILS, one more layer down, a FOURTH gap in the exact same shape as the first three (a
value nothing anywhere ever declares or derives):** `ok=Y rows=0` — the gate passed but zero shipment lines
folded. Traced to `genShipmentLines()` (`ad_process.js:261-277`): a line only produces shipment output when
`deliveryRule==='F'` (Force) or `==='A'` (Availability, capped at on-hand) — any OTHER value, INCLUDING
`undefined`, falls to the `else` branch and is silently treated as `deferredRule` (an honest "named-deferred"
empty, same as a real O/L/M/5 rule would be). `c_order`'s `crud_ops.json` entry declares no `deliveryrule`
field (nor `invoicerule`, which `genInvoiceLines()`, `ad_process.js:330-342`, needs the exact same way for
Stage 3) and no hook derives either — so EVERY freshly-created order silently gets treated as
indefinitely-deferred, never actually shippable/invoiceable, regardless of DocStatus/IsSOTrx/warehouse all
now being correct. **Not fixed this session — deliberately, it's a different KIND of change than the three
before it:** real iDempiere defaults `DeliveryRule`/`InvoiceRule` from the AD_Column's own `DefaultValue`
('A'/'I', Availability/Immediate) at NEW-record time, not a beforeSave hook — the faithful, low-risk fix is
almost certainly adding both as DECLARED fields in `crud_ops.json`'s `c_order` entry with
`"default": "A"`/`"default": "I"` (the exact mechanism `docstatus`/`grandtotal`/`dateordered` already use,
confirmed via `CORE.defaultsFor`, `crud_overlay.js:62-71`, which handles a plain string default verbatim).
The one thing that makes this different from the three fixes above: declaring a field makes it a VISIBLE
form input (this is genuinely how real iDempiere's Order window looks — DeliveryRule/InvoiceRule are real
visible header fields there too — but it changes what the user sees, not just a backend read/derive path),
so it deserves a deliberate look before shipping rather than folding into this session's backend-only run.

Stage 3 remains blocked earlier still (param-validation on `AD_Org_ID=NaN`) — unaffected by this fix; once
that's fixed too, Stage 3 would hit this SAME `invoicerule`-undeclared wall next.

---

## §Fix — 2026-07-21/22, DeliveryRule/InvoiceRule — FIXED and witnessed via a hook, not a new visible
## field; found a FIFTH, deeper, DIFFERENT-CLASS gap underneath (order LINE create loses its own parent FK)

**Fix (branch `fix/order-rule-defaults`, worktree `/tmp/wt-order-rule-defaults`, bim-ootb PR #955,
auto-merge armed):** re-examined the "declare a visible field" plan named above and chose the LOWER-risk
alternative instead — a new `MOrder.deliveryInvoiceRuleDefault` beforeSave hook (`ad_modelval.js`, right
after `docTypeTargetDefault`) fills `deliveryrule`/`invoicerule` when unset, matching the SAME "curated
subset, hook fills the mandatory rest" convention already used for `M_Warehouse_ID`/`IsSOTrx` — no form-shape
change, no new visible field, reuses the `cleanVals` hook-derived-passthrough machinery from the
`M_Warehouse_ID` fix (§Fix 2026-07-21 "cleanVals/buildOp" above) verbatim. **Values are the REAL
`AD_Column.DefaultValue` rows for `C_Order` in the seed, queried live before writing any code (non-invent):
`DeliveryRule='F'` (Force), `InvoiceRule='I'` (Immediate)** — the initial plan's guess of `'A'`
(Availability) for DeliveryRule would have been WRONG had it been written without checking.

**Witnessed**, full log read: both Stage 1 (SO) and Stage 6 (PO) now derive
`deliveryrule:"F" invoicerule:"I"` in their `§AD-MODELVAL-LIVE` line (previously absent from both — the
picker's own option label even changed from `"rule undefined"` to `"rule F"`/`"rule I"`). No regression.

**Stage 2 STILL fails, one more layer down — but this is a DIFFERENT KIND of bug than DR/IR or any of the
four before it, found by adding a temporary diagnostic (`console.log` of `ctx.fetchOrderLines(info)`,
removed before shipping — not part of the landed fix) after `ok=Y rows=0` persisted even with DeliveryRule
now correctly `'F'` (which should force-ship the full ordered qty unconditionally, no on-hand cap):**
`fetchOrderLines(-1)` returned `[]` — the fresh order's own line was invisible. Dumping the PRE-FILTER
`listTip` fold (also temporary, removed) showed why: the just-created order line's own `CRUD_CREATE` op
really does carry a `c_order_id` value — but it's **`100`, a pre-existing SEED order's id, not `-1`** (the
order the line was actually created under). The witness's own script independently confirms this field
exists and is normally exercised (`fillField(page, 'c_order_id', ...)`, `witness_e2e_business_cycle.js:253`,
noting the input is "locked" — pre-filled and disabled, matching real iDempiere's child-tab convention where
the parent-link column is never user-editable) — but whatever pre-fills that disabled input's value at
New-Order-Line-form-mount time is stale, pointing at some earlier/default order (100) instead of the
just-created one (-1). **This is the SAME CLASS of defect `W-SO-CHILD-BIND` (Stage 1, PR #928) already fixed
once** — but that fix closed the gap at the GRID-FILTER level (`_selByLevel[level-1]`, which tab-level
child-record filtering reads) — this is a SEPARATE, deeper instance: the child ROW's own stored FK value at
CREATE time, which `_overlayListTip`'s own existing comment (`idempiere.html`, near
`GATING (W-CRITIC-GATING, load-bearing)`) already half-names as unfinished: *"crud_ops creatable tables are
header-level (tabLevel 0) this leg; a created CHILD row's parent-FK scope is the next generalization
(§-noted), not silently dropped"* — this IS that named-but-not-yet-generalized next step, now concretely
reproduced. **Not fixed this session** — this is architecturally BIGGER than DR/IR: it likely affects the
S2B-folded generic child-create path used by EVERY child table across the whole app (`M_InOutLine`,
`C_InvoiceLine`, any other tabLevel>0 table), not just `c_orderline` — needs its own dedicated investigation
into wherever a child tab's New-record form currently seeds/locks its parent-FK input value (searched;
found no existing "parent column" binding logic in `idempiere.html`/`crud_overlay.js`/`ad_parser.js` at all
— grep for `Parent_Column_ID`/`parentFk`/`parentColumn` came up completely empty, suggesting there may be
NO real per-tab parent-binding mechanism today, only whatever the FIELD's own generic `readonly`/`default`
resolution happens to produce).

Stage 3 remains blocked earlier still (param-validation on `AD_Org_ID=NaN`) — unaffected by this fix; once
fixed, Stage 3 would hit this SAME order-line-parent-FK wall too (Invoice lines are generated FROM order
lines the same way Shipment lines are).

---

## §Fix — 2026-07-22, order-line parent-FK — FIXED and witnessed; found the ACTUAL remaining blocker is a
## MISSING FEATURE (no commit wiring), not another bug — the biggest-scope finding of this whole lane

**Fix (branch `fix/orderline-parent-fk`, worktree `/tmp/wt-orderline-parent-fk`, bim-ootb PR #956,
auto-merge armed):** confirmed and closed the gap named directly above, root-caused precisely (not by
inspection alone — traced through `fieldInput`/`populateRefs`/`gatherVals` step by step): a child tab's New
form renders its locked parent-link `<select>` with ONE placeholder option whose value is `''` (since
`AD_Column.DefaultValue` for a parent-link column is empty by real iDempiere convention — the link is set
programmatically, never via a column default — confirmed live: `C_OrderLine.C_Order_ID`'s `AD_Column.
DefaultValue` is blank in the seed). `populateRefs()`'s FK branch then re-queries the RAW base table for a
fresh option list and tries to mark the CURRENT value (`''`) as `selected` — nothing matches `''`, so the
browser's native `<select>` falls back to auto-selecting its FIRST listed row (`ORDER BY <pk> LIMIT 200` →
the lowest-id real seed order, `100`) — completely arbitrary, and since a CREATE always counts as "dirty"
(`_inlineDirty()`), that wrong value genuinely gets saved. Note: `renderInline`'s OWN existing comment
(`crud_overlay.js`, near `_inlineBaseline = gatherVals(e)`) already names this EXACT symptom in passing —
*"a readonly fk select that fell to another option"* — the baseline-diffing logic was built to TOLERATE it
on UPDATE (harmless there, since nothing changes if untouched) without ever fixing the root cause, which
only bites on CREATE.

Three small, connected pieces (verified against real AD_Field metadata, not assumed — `IsReadOnly='Y'` for
`C_Order_ID` confirmed on both the SO-Line tab 187 and PO-Line tab 293):
1. `idempiere.html`'s `buildForm()` computes the parent-link column via the EXACT SAME naming-convention
   resolution `renderActiveTab()` already uses for grid filtering (`pKey` = the parent tab's own key column
   name, matched by identity against the child table — real iDempiere's `GridTab.getLinkColumnName()`
   convention, reused verbatim, non-invented) and passes `{[pKey]: parentPk}` as `opts.seedVals`.
2. `crud_overlay.js`'s `createInline()` merges `opts.seedVals` into `vals` right after `defaultsFor()` —
   optional, every other call site unaffected.
3. `crud_overlay.js`'s `populateRefs()` no longer blindly repopulates a READONLY fk select from the raw
   base table (which can never include a synthetic/overlay-only parent anyway, since it's an overlay-only
   op-log row) — it looks up just that ONE row's friendly label via a targeted query instead, falling back
   to showing the raw pk if it isn't a real base row (a synthetic negative pk) — never loses display quality
   for a genuinely-existing readonly fk value on UPDATE, never silently swaps in a wrong one on CREATE.

**Witnessed**, full log read:
```
before: §AD-PROC-LIVE proc=118 ... dispatched=Y ok=Y rows=0
after:  §AD-PROC-LIVE proc=118 ... dispatched=Y ok=Y rows=1
```
Generate-Shipments now computes a REAL shipment line for the freshly-created order — confirms the order
line's own data (product, qty, and now its correct parent) is fully correct end-to-end, six layers deep
(DocStatus → IsSOTrx → Warehouse → DeliveryRule → order-line-parent, all now correct). No regression.

**Stage 2 STILL fails — but for a reason that changes the shape of this whole investigation.** Checked
whether `res.result.ops` (the computed `CREATE_DOCUMENT`+`CREATE_LINE` op group `genShipmentLines`/
`buildDoc` produce, now correctly containing 1 real line) ever actually gets APPLIED to the kernel op-log
anywhere. **It does not, anywhere, for any Generate-process, for any order — seed or synthetic, and this
predates every fix in this whole lane:** grepped `idempiere.html` for `applyOp(`/`commitCrud(` near any
process-result handling — **zero hits**. `renderProcResult()` (the function that renders the computed
lines/header table after a Generate-Shipments/Invoices/PO run) is a PURE READ-ONLY PREVIEW — it displays
`r.ops`/`r.header` but never calls anything that persists them. Also checked whether `crud_overlay.js`
exposes any PUBLIC api a caller could use to commit an arbitrary op-group (`applyOps`/`commitOps`/
`applyOpGroup` on `window.__crud`) — **zero hits** — the capability to persist a KIND-2 multi-op result
doesn't exist yet at all, not even as an unwired internal function. **This means the "Generate Shipments"/
"Generate Invoices"/"Generate Order (from Project)" flows have NEVER been able to produce a real, persisted
document through this UI — not because of any bug fixed or found today, but because the confirm/commit step
was simply never built.** Every prior "§CYCLE stage=2/3 FAIL" line in this whole document (2026-07-20
onward) was ALWAYS going to fail at this exact point, for EVERY order including the four real pre-existing
seed orders — today's six fixes closed every layer that was masking this, one at a time, down to bedrock.

**This is the true remaining blocker, and it's a different KIND of task than any of the 6 fixes above it —
a missing FEATURE, not a bug:** needs a real design decision (does the result pane get a "Confirm"/"Post"
button, matching real iDempiere's own Generate-process UX of preview-then-confirm? does confirming call a
new `window.__crud.applyOpGroup(ops)` that signs+commits every op in the group atomically?) before any code
gets written — explicitly NOT attempted this session. This is the single biggest-scope item found in this
entire lane (2026-07-20→22) and deserves a dedicated design/spec pass, not a continuation.

Stage 3 (Generate Invoices) is blocked earlier still by the separate `AD_Org_ID=NaN` casing bug — but would
hit this SAME missing-commit wall immediately after, once that's fixed too (its own `genInvoiceLines`
result has the identical "computed but never applied" shape).

---

## §Fix — 2026-07-22, "Confirm & Post" — SHIPPED. Stage 2 PASSES for the first time in this lane's history.

**User call:** given the design question named directly above, the user answered explicitly — *"Ok to that
familiar Confirm/Post box"* — build the real iDempiere-style preview-then-confirm affordance.

**Feature (branch `feat/genprocess-confirm-commit`, worktree `/tmp/wt-genprocess-commit`, bim-ootb PR #960,
auto-merge armed):** `erp_engine.js`'s `buildDoc` (the shared archetype `createShipment`/`createInvoice`
already ride) carries its OWN header comment stating the missing half explicitly: *"Verbs return ops[]; the
kernel applies + commitOps them (handlers never write)"* — the KERNEL side of this contract already existed
(`kernel().commitGroup`), just never wired to this UI. A working precedent for committing this EXACT op
shape already existed elsewhere in the app — `pos_lens.js`'s `buildSaleGroup`/`buildRegisterGroup` call
`KO.commitGroup(opDb, ops.map(o => ({op_type: o.op_type, params: o})), {})` for POS checkout — reused
verbatim, not invented, which meaningfully de-risked the whole feature (a proven, already-shipping pattern,
not a novel one).

Two pieces:
1. `crud_overlay.js` gets `applyOpGroup(ops, cb)`: commits a multi-op result as ONE atomic signed group via
   the SAME `kernel.commitGroup()` primitive `applyOp`/`commitCrud` already use for a single op, wrapped in
   the same cross-tab-safe `_withFreshSide` hydration `commitCrud` uses (no owner-gating needed — every op
   in a Generate-process group is a fresh CREATE, matching `commitCrud`'s own existing "CREATE has no prior
   owner to gate" note). Exposed as `window.__crud.applyOpGroup`.
2. `idempiere.html`'s `renderProcResult()` gets a real **"Confirm & Post"** button on the KIND-2 op-group
   branch (Generate-Shipments/-Invoices/-Order-from-Project — the SAME branch that already renders the
   preview table) — this result table WAS already the preview half; this adds the confirm half. Button only
   renders when `r.header` is truthy, which `registerInOutGenerate`/`registerInvoiceGenerate` only ever set
   on a NON-empty result — an honest "nothing to ship" result never gets a confirm affordance to click.

**Witnessed — the deepest verification of this whole lane.** `scripts/witness_e2e_business_cycle.js`
updated to click the real `button[data-genprocess-confirm]` (not just the preview `Run`) before checking
`tipDocsFor` — proving the FULL real user path end to end, not the preview half alone. Full log read:
```
§CRUD-GROUP-PERSIST ops=2 source=sidecar gid=8a841aec-... sealed=2 verifyChain=ok
§GENPROCESS-CONFIRM table=M_InOut committed=Y gid=8a841aec-... ops=2 verifyOk=true
§CYCLE stage=2 name=Shipment driven=UI result=PASS detail=M_InOut created (op=4, {"op_type":"CREATE_DOCUMENT",
  "table":"M_InOut","source_id":-1,"issotrx":"Y","movementtype":"C-","c_bpartner_id":112,"m_warehouse_id":103,
  "c_order_id":-1,"_sv":1,"_sigv":2,"signed_by":"3059301306072a8648ce3d..."}) via real Generate-Shipments
  process picker
```
**Stage 2 (Delivery/Shipment) PASSES — the first time in this lane's entire history (2026-07-20→22).** A
real, cryptographically-signed `M_InOut` `CREATE_DOCUMENT` op, reached by a real user driving: New Sales
Order → fill header → Save → New Order Line → fill product/qty → Save → Complete (CO) → open Generate
Shipments → pick the order → Run (preview) → **Confirm & Post** → a genuinely persisted document. Eight
layers deep (DocStatus → picker-overlay → warehouse → IsSOTrx/DocType → DeliveryRule → order-line-parent →
missing-commit-wiring, the seven fixes above it in this whole lane) all correct, together, for the first
time. No regression: Stage 1/5/6 still PASS.

**Stage 3 remains unaffected, correctly** — the Confirm button correctly does NOT render for Generate
Invoices, since that process still never dispatches at all (`reason=param-validation-failed`, the
still-unfixed, separate `AD_Org_ID=NaN` casing bug named above). Once that bug is fixed, Stage 3 should
close the SAME way Stage 2 just did — the commit wiring built here is generic (any KIND-2 op-group), not
Shipment-specific, so no further commit-side work should be needed for Invoices or PO-from-Project once
their own upstream blockers clear.

**Stage 4 (Stock effect) — unchanged verdict but a MEANINGFULLY MORE PRECISE finding, automatically, from
the witness's own pre-existing branching logic (no witness-script edit needed for this part):** now reads
*"M_InOut op=4 was created upstream via the crud-overlay sidecar, but m_storageonhand lives only in the raw
seed db — no live fold/recompute of on-hand off the op-log was found anywhere ... so a created shipment
CANNOT change what this table shows even if the document itself is real."* This is the SAME
structurally-absent capability named back on 2026-07-20 (§Findings) — just now demonstrated against a real
signed document instead of a hypothetical one, sharpening the finding rather than changing it.

---

## §Fix — 2026-07-22, `AD_Org_ID` casing — FIXED and witnessed. Stage 3 PASSES. Sales-side O2C is CLOSED.

**Fix (branch `fix/adorgid-casing`, worktree `/tmp/wt-adorgid-casing`, bim-ootb PR #968, auto-merge armed):**
confirmed and closed the last remaining named gap. `listTip`'s CRUD_CREATE `stdDefaults`-materialization
block wrote a freshly-created row's derived tenant/audit columns in MIXED CASE (`nr['AD_Org_ID']`,
`nr['CreatedBy']`, `nr['AD_Client_ID']`, `nr['Created']`, `nr['Updated']`, `nr['IsActive']`,
`nr['Processed']`, `nr['Processing']`, `nr['Posted']`) while every OTHER key on that same row
(`nr[c]=f[c]`, one line above) is lowercase — this codebase's column convention throughout
(`m_warehouse_id`, `c_currency_id`, etc). Re-confirmed by grep before touching anything (not assumed):
zero JS-property reads of the mixed-case form anywhere in `erp/` — only SQL text ever matched it, which is
case-insensitive. Now lowercase, matching every other key this block sits beside. Single fix point (grepped
for any second `stdDefaults`-materializing block — only this one exists).

**Witnessed**, full log read:
```
before: §GENINV-LIVE run proc=119 Record_ID(C_Order_ID)=-1 AD_Org_ID=NaN
        §AD-PROC-LIVE proc=119 ... dispatched=N reason=param-validation-failed
after:  §GENINV-LIVE run proc=119 Record_ID(C_Order_ID)=-1 AD_Org_ID=0
        §CRUD-GROUP-PERSIST ops=2 source=sidecar gid=55165c4d-... sealed=2 verifyChain=ok
        §GENPROCESS-CONFIRM table=C_Invoice committed=Y gid=55165c4d-... ops=2 verifyOk=true
        §CYCLE stage=3 name=SalesInvoice driven=UI result=PASS detail=C_Invoice created (op=6,
          {"op_type":"CREATE_DOCUMENT","table":"C_Invoice","source_id":-1,"issotrx":"Y","ad_client_id":11,
          "ad_org_id":0,"c_bpartner_id":112,"c_currency_id":100,"c_paymentterm_id":105,"m_pricelist_id":101,
          "c_order_id":-1,"_sv":1,"_sigv":2,"signed_by":"3059301306072a8648ce3d..."}) via real
          Generate-Invoices process picker
```
**Stage 3 (Sales Invoice) PASSES** — the Confirm & Post commit wiring built for Stage 2 (PR #960) needed
ZERO changes to close Stage 3 too, confirming it really was generic (any KIND-2 op-group), exactly as
predicted when it was built. No regression: Stage 2 (Shipment) still PASS.

**With both Stage 2 and Stage 3 now genuinely PASS, the Sales-side O2C cycle (Sales Order → Delivery →
Invoice) closes completely end-to-end through the real UI, with real signed documents at every step — the
first time in this lane's entire 2026-07-20→22 history.** See §Closed at the top of this document for the
full nine-fix summary and what's deliberately left as separately-scoped follow-on work (Stock effect,
Material Receipt, Vendor invoice/three-way match — none of them "next items" in this same lane).
