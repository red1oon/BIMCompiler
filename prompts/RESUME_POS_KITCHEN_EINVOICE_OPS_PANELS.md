<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — RESEARCH SPEC: POS replenishment redesign + Kitchen Display + E-Invoice status

**Scope:** research + design only. No code changes made against this spec. Three threads, triggered by:
"look into the POS and thus into actual ERP data cycle... POS panel polishing, was rough, not really
following HMI aesthetics, the replenishment drawer should be relegated to traditional Generate Replenishment
as in my Red1 plugin Unicenta POS cycle" + "this can scope to include iDempiere further exact likeness and
operational integrity" + "pick up the E-invoice and Kitchen display panel to operate for a standalone ops...
again has to exist in iDempiere data model where new tab info panel JOIN defined."

**Status: 🔎 RESEARCH DONE (2026-07-03), three different readiness levels.** Every claim below is a live code
citation (Explore agents against `~/bim-ootb`) or a live sqlite query against `build/erp/ad_full.db` (real
iDempiere dictionary) / `~/bim-ootb/erp/ad_seed.db` (real seed data) — nothing invented.

---

## §THREAD 1 — POS replenishment: redesign, contained, ready to scope

### Evidence

**The POS sale cycle itself is genuinely real, not the gap.** Pay → `POS.buildSaleGroup` (`pos_core.js:136-141`)
chains `buildOrderOps` (real `C_Order`/`C_OrderLine` via `erp_engine.js` `DOC_SPECS`), `completionOps`
(`SET_STATUS`→CO, WR-gated `M_InOut`/`M_InOutLine`, `C_Invoice`/`C_InvoiceLine`), and BOM-backflush
(`explodeBOM` → `CONSUME`/`M_Transaction`, movementtype `'P-'`) — all in ONE atomic signed group via
`kernel_ops.commitGroup` (`kernel_ops.js:277`), the same archetype path `crud_overlay.js`/`chat_lens.js` use
elsewhere. Real table/column names throughout, not invented totals. (Nuance, not a bug: this app is
event-sourced — `commitOp` appends to the ledger, reads *fold* the log live rather than eagerly materializing
rows, so "real AD tables" are a correct projection, not always physically-written rows — consistent app-wide,
not a POS shortcut.)

**The "replenishment drawer" is real problem #1 — no staging step.** No standalone drawer file exists; it's a
section (`#pos-float-replenish`) bolted into the pay float-panel, `renderReplenish()` (`pos_lens.js:623-661`),
auto-triggered on open AND after every sale (`:1235,1292`) — reactive/live, not an invoked process. It DOES
read the real 19-row `m_replenish` policy table (`pos_lens.js:247`: `SELECT ... level_min, level_max,
replenishtype FROM m_replenish WHERE m_warehouse_id=? AND replenishtype<>'0'`, via `POS.replenishSuggest`,
`pos_core.js:255-272`, explicitly citing `ReplenishReport:294-327` — the real iDempiere process class name) —
so the DATA is grounded, real, not synthetic. But **each suggestion row is a single button that directly
commits a real `C_Order`+`C_OrderLine` PO on click** (`pos_lens.js:636-654`) — no review, no edit, no confirm
step. This is exactly what "relegate to traditional Generate Replenishment" is asking to fix: the REAL
`ReplenishReport`/uniCenta-family shape is propose→stage→review/edit→confirm, not propose→auto-commit.

**Gaps vs. the real iDempiere shape, precisely:**
- **(a) Policy-driven proposal — partial.** Reads real `Level_Min`/`Level_Max`, but `QtyBatchSize` (also a
  real `m_replenish` column) is **never referenced anywhere in `erp/*.js`** — proposed quantities don't round
  to batch size.
- **(b) Staging/review before commit — absent.** No `T_Replenish`-equivalent state exists (the real table
  doesn't need to be reproduced literally — see §DESIGN below — but the REVIEW STEP it represents doesn't
  exist in any form).
- **(c) External-PO vs. inter-warehouse-transfer — absent.** `M_WarehouseSource_ID` (also real on
  `m_replenish`) is never referenced; `buildReplenishPO` (`pos_core.js:279-281`) always builds an external
  Purchase Order (`issotrx:'N'`), never an Internal Use Inventory Move even when a source warehouse is set.
- **Orphaned downstream:** the PO that DOES get created is real and signed, but nothing ever completes or
  receives it — it's born and stays Drafted, a dead-end document.

**HMI — confirms "rough," with citation.** App baseline (used by `erp.html`, `erp_pills.js`, `idmp_pills.js`):
dark slate/graphite, `#121218` bg / `#e8e8ed` text / `#6c9fff` blue accent. **POS injects its own `<style>`
block in a completely different green-on-black palette** (`#0b1f17`, `#2a6`, `#cfe`, `#4dcc88`,
`pos_lens.js:29-184`) with zero shared class names against the rest of the app. Replenishment rows specifically
are unclassed inline `cssText` (`:633-635`), 11px font, crammed into a `max-height:20vh` scroll strip at the
bottom of an already-crowded 340px panel (cart + partner + pay + receipt, `:503-508`) — reads bolted-on, not
part of the same product.

**Gap size, per the investigating agent's own assessment:** *contained*. `replenishSuggest`/`buildReplenishPO`
are already pure, spec-driven functions independent of the sale/backflush plumbing — rework touches
`renderReplenish()` and `pos_core.js`'s replenish functions, does NOT require touching the sale cycle or
`kernel_ops` itself.

### §DESIGN — the "traditional Generate Replenishment" shape, mapped onto this app's real architecture

Don't literally reproduce `T_Replenish` as a new AD table — this app's honest pattern (per event-sourced
architecture above) is a **transient client-side staging list** in `pos_lens.js`, only converted to real
signed `C_Order`/Internal-Use-Move ops on explicit confirm. That keeps the same "kernel_ops commits ARE the
real documents" philosophy while adding the human review gate the real process has. Concretely:
1. **Trigger** — an explicit "Generate Replenishment" action (button/menu item), not auto-fire on every sale.
2. **Propose** — `replenishSuggest` (already correct) + round to `QtyBatchSize` increments (currently missing).
3. **Stage** — render an editable review list (adjust/deselect proposed lines) before any commit — genuinely
   new UI state, the one piece of real net-new work here.
4. **Route** — per real `ReplenishType` semantics: if `M_WarehouseSource_ID` is set on the policy row →
   Internal Use Inventory Move (inter-warehouse); if absent → external Purchase Order. This mirrors the real
   column's own meaning — not an open design question, a completeness fix.
5. **Commit** — one signed group per confirmed batch, same `kernel_ops.commitGroup` pattern already used
   correctly by the sale cycle.
6. **HMI** — restyle onto the app's existing dark-slate/blue-accent shared classes instead of POS's bolted-on
   green-on-black block; give the review list proper spacing/typography instead of an 11px cramped strip.

### Assignment
- **Step 6 (HMI restyle alone)** is separable and mechanical — **Fable5**.
- **Steps 1-5 (staged review + QtyBatchSize + routing)** are well-scoped (contained blast radius, precedent
  functions already correct) but real business logic with document-correctness stakes (must stay idempotent,
  must not double-commit, must route PO-vs-Move correctly) — **Opus**.
- No open design question blocking start — this thread can begin whenever picked up.

---

## §THREAD 2 — Kitchen Display: absent, well-scoped, ready to build now

**Confirmed absent, not hidden under another name** — grep across the whole repo for "kitchen" hits only
unrelated IFC room-classification regexes (`routewalker.js:314,990`, `/KITCHEN|PANTRY|DAPUR/`) and geodata
place names. No panel, no queue UI, nothing reading order-line fulfillment state for this purpose.

**The real construct to build on already has everything needed — no bespoke table required.** `C_OrderLine`
(live-verified schema) has `QtyOrdered`, `QtyDelivered`, `QtyInvoiced`, `QtyReserved`, `DateDelivered` — a
kitchen queue is structurally just `WHERE QtyDelivered < QtyOrdered ORDER BY order date`.

**The "new tab info panel JOIN" mechanism the user described is real, confirmed live:** `AD_InfoWindow`/
`AD_InfoColumn` (live schema: `AD_Table_ID`, `AD_Window_ID`, `AD_Process_ID`, `FromClause`, `WhereClause`,
`OrderByClause`, `OtherClause`) — iDempiere's native declarative "define a JOIN-backed search/list panel"
framework. **Confirmed genuinely unused anywhere in this codebase** (zero real hits; the only "InfoWindow"
grep result, `erp/tests/poc_ad_displaylogic.js`, merely lists `AD_InfoWindow_ID` as one of several FK columns
in a display-logic test, not an actual use of the mechanism) and has zero seed rows in `ad_seed.db` (table
doesn't exist there yet).

**A proven local precedent for the JOIN pattern already exists**, even without touching `AD_InfoWindow`
literally: `pos_lens.js:326-330` hand-builds a real multi-table JOIN (`c_poskey`→`m_product`→`m_productprice`)
feeding a panel — the exact shape a Kitchen Display query would take.

**Standalone-capable by construction, no extra work needed:** `erp/erp.html` states explicitly "No Three.js.
No WebGL. No server. No iDempiere runtime" and `grep -rl "Bonsai" erp/*.js` returns zero hits — the whole `erp/`
module already runs independent of the 3D viewer, off the sql.js ERP data layer alone. Building Kitchen
Display inside `erp/` following this module's existing convention gets standalone-ops for free.

### Assignment
Genuinely well-specified: real fields exist, real JOIN precedent to copy, no open design question, no
dependency on anything else in this document. **Fable5** for a first cut (copy `pos_lens.js`'s JOIN-panel
pattern against `C_OrderLine`); escalate to Opus only if wiring the literal `AD_InfoWindow`/`AD_InfoColumn`
dictionary rows (vs. a hand-rolled JOIN like the existing precedent) proves fiddlier than expected — worth
trying the cheap path first.

---

## §THREAD 3 — E-Invoice: stays blocked, do not build yet

Design-only, and **deliberately gated already** — not merely unbuilt. `prompts/RESUME_HR_BIM_ASSET.md:1047-1091`
"§PILLAR 3 — Malaysian RegTech" is explicitly marked "Free demo only," "NOT a certified LHDN filer," and sits
behind a `§RESEARCH GATE ⛔ OPEN` with 7 unchecked boxes (MyInvois mandate state, UBL 2.1 schema, legal
proof-of-issue requirements, PCB/EPF/SOCSO tables, IFRS/MFRS clauses, PDPA constraints) and an explicit rule:
"Until filled, Pillar 3 stays DESIGN-ONLY." No UIN/QR/validation-status columns exist on the real `C_Invoice`
table (live-verified) — same "no native table" situation as Leave/Attendance, but unlike those, this one
requires real regulatory research before any honest substitution can even be proposed, not just a code
decision. **Do not build a status panel or InfoWindow for this yet** — doing so risks encoding assumed
UIN/validation semantics before the mandate/schema facts are sourced, which the doc's own non-invent rule
forbids.

### Assignment
Not a coding task right now — the blocker is the 7-box research gate, which is Sonnet+user research/dialogue
work (sourcing real regulatory facts), not implementation. Revisit only after that gate closes.

---

## Non-invent / process notes

Every fact above is a live file citation from two parallel read-only Explore agents (2026-07-03) or a live
sqlite query against the real `ad_full.db` dictionary / `ad_seed.db` seed rows — re-verify before trusting if
picked up later (fast-moving repo).

---

# §IMPL SPEC (2026-07-03 session — Fable5 lane: Thread 2 + Thread 1 step 6 only)

Re-verified live before implementing: replenish cites hold (`pos_lens.js:623/1235/1292`, `QtyBatchSize`
zero hits in `erp/*.js`), no kitchen panel exists, `pos_core.js` IDENTICAL across repos, `pos_lens.js`
DIVERGED by design (bim-ootb = evolved browser surface → lens edits are bim-ootb-only).

## §T2-SPEC — Kitchen Display (W-KDS-QUEUE)

**Key discovery:** the engine already has the whole seam — `buildDeliverLaterGroup` (order CO + shipment
born DR) is the "order sent to kitchen" act, and `completeShipmentOps` (pos_core.js:220, FSM-gated) is the
"served" act. W-POS-DELIVERLATER proves both. A Kitchen Display is a FOLD + a dumb-terminal lens; ZERO new
business verbs.

- **Files:** `build/erp/kitchen_core.js` (bim-compiler, source of truth — pos_core convention) mirrored
  verbatim to bim-ootb `erp/kitchen_core.js`; `erp/kitchen_lens.js` (bim-ootb only, dumb terminal);
  wiring = `idempiere.html` (script tag + `IdmpPillActions.kitchen`) + `pills_idmp.json` pill +
  `erp/sw.js` precache/version bump. IIFE-wrapped (browser-global discipline).
- **`KitchenCore.foldTickets(opRows)`** — pure fold, id-order walk of parsed `kernel_ops` rows
  (`logMovements` precedent): `C_Order` CREATE_DOCUMENT → order info (c_bpartner_id, c_pos_id);
  `M_InOut` CREATE_DOCUMENT (movementtype `C-`) opens a ticket (carries m_inout_id, c_order_id=source_id,
  c_doctype_id, timestamp); following `M_InOutLine` CREATE_LINE rows attach as lines; `SET_STATUS M_InOut`
  transitions docstatus. **`queue(tickets)`** = docstatus DR|IP, oldest-first. Kitchen queue ≡ the doc's
  "`WHERE QtyDelivered < QtyOrdered ORDER BY order date`" projected onto the event-sourced substrate.
- **Serve** = `POS.completeShipmentOps(ticketHdr, ticket.lines, dtRow, {})` full-qty → ONE signed group
  via `kernel_ops.commitGroup`. Confirm-gated doctype (IsPickQAConfirm/IsShipConfirm) → ticket renders
  GATED (routes to inout_confirm), not silently serveable. Double-serve refused by the FSM.
- **Witness `scripts/poc_kitchen_queue.js` → `build/erp/poc_kitchen_queue.log`** — issues it proves:
  1. deliver-later sale folds to EXACTLY ONE ticket, lines == the sale's lines;
  2. a WR cash-and-carry sale folds to ZERO tickets (delivered in-group — the queue IS undelivered-only);
  3. serve on the folded ticket → `M_InOut→CO` one signed group, chain holds, re-fold → queue empty;
  4. confirm-gated doctype 148 REFUSES serve (reason=confirm-gated);
  5. §FALSIFIER double-serve refused (not-open); empty log folds an EMPTY queue; two tickets order oldest-first.
- **Lens:** queue = fold(opDb) ∪ the §S-2 seed selector on b3 (`m_inout DR/IP JOIN c_order`), dedup by
  m_inout_id; names JOIN from b3 (`m_product`, `c_bpartner` — the pos_lens.js:326 precedent); styled on the
  APP baseline (#121218/#e8e8ed/#6c9fff), NOT the POS green. §-logs: `§KDS-OPEN tickets=`, `§KDS-SERVE`,
  `§KDS-GATED`, `§KDS-EMPTY`. `AD_InfoWindow` literal dictionary rows DEFERRED (cheap-path-first per
  §THREAD 2 assignment).

## §T1.6-SPEC — POS HMI restyle (mechanical, no logic)

`pos_lens.js` (bim-ootb ONLY) injected style block: palette swap onto the app baseline — panel bg
`#0b1f17/#0d1f14/#071409` → slate (`#16161d/#1a1a24/#121218`), border `#2a6` → `#33334a`, text `#cfe` →
`#e8e8ed`, secondary `#8fd/#6a9/#9cb` → `#a9a9b8/#8b8b9e`, accent/active `#4dcc88/#1d4a2e/#133a22` →
`#6c9fff`/rgba(108,159,255,·) — EXCEPT money figures (top-bar total, card price, receipt total) which keep a
success-green, mapped to the app's own `#5fd08a` (extracted from idempiere.html `.posted-balance.is-balanced`,
not invented). Replenish rows: retire inline `cssText` → stylesheet classes `.pos-replenish-row`
(+`.no-vendor`), 12px, breathing room. IDs/§-tags/logic byte-untouched. Witness = §-logs unchanged +
headless load smoke.

## Status (closeout 2026-07-03)
- **§T2 Kitchen Display ✅ DONE + MERGED** — bim-ootb PR #617 (kitchen_core.js + kitchen_lens.js +
  pill/sw v757 wiring + POS restyle, CI green, squash-merged to main) + bim-compiler PR #19
  (build/erp/kitchen_core.js source of truth + witnesses, merged to master).
  Witnesses: **W-KDS-QUEUE 12/12** (`build/erp/poc_kitchen_queue.log`) + **W-KDS-LIVE PASS**
  real-user path (`build/erp/poc_kds_live.log`: login → gated pill → §KDS-EMPTY → POS ring →
  deliver-later → ticket queues, ordered==shipped==shown → Serve chainOk=Y → §KDS-EMPTY).
  AD_InfoWindow literal rows deferred (cheap-path JOIN shipped first, per §THREAD 2 assignment).
- **§T1.6 POS HMI restyle ✅ DONE + MERGED** — same PR #617. 25 green-palette tokens → app baseline
  (109 replacements, all values extracted); replenish rows now stylesheet classes 12px.
  **W-POS-LIVE PASS after restyle** (`build/erp/poc_pos_live_restyle.log`); screenshots eyeballed.
- Thread 1 steps 1-5 (staged replenishment review + QtyBatchSize + PO-vs-Move routing) — picked up
  2026-07-03 (post-crash resume session), spec = §DESIGN above + §T1-SPEC below. Thread 3 E-Invoice
  stays ⛔ research-gated.

---

# §T1-SPEC (2026-07-03 resume session — Thread 1 steps 1-5: staged Generate Replenishment)

Re-verified live before implementing: `qtybatchsize` + `m_warehousesource_id` ARE real columns on the
seed's `m_replenish` (PRAGMA, 19 rows) but **all NULL in seed** — so live seed behavior stays PO-routed
and un-rounded (honest), and rounding/routing are proven by fixture policy rows in the headless witness
(fixtures are the witness's own, the seed is never edited). `m_movement`/`m_movementline` exist in
`ad_seed.db` with real columns (`m_movementline.m_locator_id/m_locatorto_id` carry the route). The op
log's `gid` column links a group's CREATE_DOCUMENT to its CREATE_LINEs (kernel_ops.js §I-K) — the
idempotency fold rides it.

## Core (`build/erp/pos_core.js` truth → mirrored verbatim to bim-ootb `erp/pos_core.js`)
1. **QtyBatchSize rounding (step 2)** — `replenishSuggest` rounds `qto` UP to the next multiple of
   `ci(qtybatchsize)` when the policy row carries a batch size > 0 (the real `ReplenishReport` rounding);
   row absent/NULL/0 → byte-identical output to today (W-POS-REPLENISH stays green unmodified).
   Suggestions pass through `qtybatchsize` + `m_warehousesource_id` so the lens can display + route.
2. **Routing (step 4)** — new `routeReplenishment(suggestions)` pure splitter: rows with
   `m_warehousesource_id` set → `moves` (grouped per source warehouse), rows without → `po` (grouped per
   warehouse). Mirrors the real column's own semantics; no open design question.
3. **Move builder (step 4)** — `REPLENISH_MOVE_SPEC` + `buildReplenishMove(route, suggestions)` via the
   SAME `buildDoc` archetype (newVerbs=[]): CREATE_DOCUMENT `M_Movement` + CREATE_LINE `M_MovementLine`
   per suggestion, each line carrying real `m_locator_id` (source) / `m_locatorto_id` (target) — locator
   ids are HOST-INJECTED (lens resolves the warehouses' default locators from b3; core stays pure).
4. **PO vendor header** — `REPLENISH_PO_SPEC.header` adds `c_bpartner_id` ONLY when the parent carries it
   (real C_Order column; existing callers pass no vendor → ops byte-identical).

## Lens (`pos_lens.js`, bim-ootb ONLY — steps 1, 3, 5)
1. **Trigger (step 1)** — auto-fire retired: `renderReplenish()` no longer runs on open/after-sale; the
   replenish section shows a "Generate Replenishment" button (`#pos-repl-generate`). §POS-REPLENISH-GEN.
2. **Stage (step 3)** — generation renders an EDITABLE staging list (`.pos-repl-stage-row`): checkbox
   (deselect), name, route badge (`PO → vendor` | `Move ← wh`), suggested qty pre-rounded to batch,
   `<input type=number>` qty override. Vendor-less PO rows render `.no-vendor`, unchecked, disabled
   (an external PO without a vendor cannot be staged — honest refusal, same rule as today).
3. **Commit (step 5)** — ONE `kernel_ops.commitGroup` per confirmed batch (`#pos-repl-commit`): all PO
   docs (per warehouse+vendor) + all Move docs (per source warehouse) + their lines in a single signed
   group; in-flight guard against double-click; §POS-REPLENISH-COMMIT pos= moves= ops= gid= chainOk=.
4. **Idempotency (the §DESIGN "must not double-commit" clause, closed via the fold)** — `suggestAll`'s
   reservation callback now ADDS pending inbound qty folded from the op log (gid-linked: open replenish
   PO `C_OrderLine.qtyordered` for the warehouse + open `M_MovementLine.movementqty` whose
   `m_locatorto_id` is in the warehouse) — commit then re-generate proposes ZERO for the committed
   products, exactly like the real report's open-order subtraction. §POS-REPLENISH-PENDING.

## Witnesses (claims first — a test must name the issue it proves)
- **W-REPLEN-STAGE** `scripts/poc_pos_replenish_staged.js` → `build/erp/poc_pos_replenish_staged.log`:
  1. BATCH ROUNDING — fixture row (min 10/max 20/batch 5, need 11) → proposes 15 (ceil to multiple);
     batch NULL/0 → suggestions byte-identical to the un-batched engine (no regression);
  2. ROUTING — fixture row with `m_warehousesource_id` → Move ops (real locator route on every line),
     row without → PO ops; one mixed batch splits correctly;
  3. ONE GROUP — a confirmed mixed batch builds 1 C_Order(+vendor header) + 1 M_Movement + all lines,
     committed as ONE gid (assert shape + shared gid);
  4. IDEMPOTENT — fold the committed ops back as pending-inbound → re-suggest = EMPTY (no double order);
  5. §FALSIFIER — deselected/zero-qty rows emit NO ops; a vendor-less PO row refuses (reason=no-vendor);
     seed rows (all-NULL batch/source) still route 100% PO — nothing invented for them.
- **W-REPLEN-LIVE** `scripts/poc_replenish_live.js` → `build/erp/poc_replenish_live.log` — REAL USER
  SERIES OF ACTIONS (feedback_test_real_user_path_not_seams): login GardenAdmin → POS pill → replenish
  section has NO auto suggestions + a Generate button → click Generate → staging rows render → EDIT one
  qty via its input + DESELECT one row → Confirm → §POS-REPLENISH-COMMIT chainOk=Y and MATHS: committed
  `C_OrderLine` qtys (folded from the signed op log) == the staged-after-edit qtys, deselected product
  ABSENT → Generate again → committed products NOT re-proposed (live idempotency).
- **Regression:** W-POS-REPLENISH (headless, unmodified) + W-POS-LIVE must stay green.
