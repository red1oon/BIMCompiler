# POS SHOWCASE LANE — the register, the kitchen, the kiosk, the tender

```
# ⚠ DO NOT REMOVE — Scope guard. Read the log after EVERY run before any conclusion.
# SCOPE: turn the POS lens into a deployable showcase POS: cashier register + Kitchen Display +
#   DIY self-order kiosk + product modifiers + QR/bank tender. One signed op-log, no server.
# RULES: EXTRACT/COMPILE only — every behaviour traces to Unicenta oPOS, the iDempiere DocAction/
#   AttributeSet/Replenish ops, or a stated modern-POS norm. NON-INVENT. newVerbs=[] (reuse the
#   kernel verbs; a genuinely new verb must be witness-justified first). Lucide icons only.
#   Witness-led (§-log first, Playwright second). DRIVE EVERY CHANGE AS A USER (browser screenshots) —
#   the user's standing note: "issues arise when you are not driving it as a user."
# WORKTREE: /tmp/wt-* off FRESH origin/main; never edit ~/bim-ootb directly (PreToolUse hook blocks it).
# DEPLOY: one PR per surface · sw CACHE_VERSION bump · orphan-check after squash · localhost-verify first.
```

## §0 — Vision & sources (non-invent ground)
> ⚠ **2026-10-28 (owner):** the POS follows legacy — a **standalone Unicenta-style till and a standalone kitchen screen**, depositing tickets (`I_Order`) for head office to import; the in-ERP pill that completes sales on the till is superseded. Architecture + phases: **`prompts/POS_PLUGIN_LOCAL_FIRST.md`**. The register/KDS/kiosk/tender UI work below carries into those apps.

The 2012 plugin RED1 shipped fed **Unicenta oPOS → iDempiere** over ActiveMQ with **AutoBOMOrder**
backflush + **Replenishment Report**. This lane rebuilds that loop — plus the modern-POS surfaces a
real stall expects — as **browser folds over one signed op-log** (no server). Anchored specs:
`docs/POSLens.md` (the doctrine + the nightly-fold / §195 EODA), `docs/POS_ADDON_SPEC.md` (§P-1..§P-13
the register engine, all witnessed), `docs/SPATIAL_PICKING_SPEC.md` (§S-* the WH collect-materials
walk), `docs/ERP.md` (the distributed/secured blueprint). Engine truth: `pos_core.js` / `kernel_ops.js`
/ `ad_docfsm.js` / `erp_engine.js`; witnesses `scripts/poc_pos_*.js`.

**Cashier daily routine this lane must serve (user, 2026-06-15):**
open cash POS → handle sales → (send WH to collect materials if needed) → **close the till**. All
records generated along the way; backflush + replenishment are the **close-till (EODA)** ops, not per-sale.

## §0.1 — Blue Future DOUBLES AS THE BUILT-IN TESTER (user insight, 2026-06-15)
The speculative branch is not just an undo — it is the POS's own **dry-run / training / UAT harness**.
An admin enters blue, runs a full day (ring sales, modifiers, KDS bump, EODA close-cash → backflush →
replenishment report, even reverts), inspects every outcome on the timeline, then **DISCARD** — official
state never moved and the chain still verifies. It is an HONEST rehearsal: the SAME code paths and folds
run, not a mock or a separate test fixture, so "it worked in blue" actually means it works. Three uses
this lane leans on:
  · **Pre-production acceptance** — exercise the real configured stall (catalog, prices, tender, KDS) in
    blue before go-live; accept-up-to only once it's right.
  · **Training** — a new cashier practices on the live system with zero risk; discard at end of shift.
  · **What-if** — preview a price change / a busy-day load / a refund scenario, then keep or shed it.
Every phase below inherits this for free (blue wraps the whole transactional state) — so each surface
(register, KDS, kiosk, modifiers, tender) is testable in-place before it's released.

## §1 — Phase plan (each phase = one+ session, its own PR(s), witnessed, user-driven)
| Ph | Name | Surface | Core source | State |
|----|------|---------|-------------|-------|
| P1 | Register completeness | cashier panel | Unicenta sale + iDempiere DocAction/Replenish | IN PROGRESS |
| P2 | Kitchen Display (KDS) | 2nd tab | Unicenta Kitchen Display / modern KDS bump bar | SPEC'D |
| P3 | DIY self-order kiosk | customer tab | fast-food self-order kiosk | SPEC'D |
| P4 | Attributes / modifiers | both order surfaces | iDempiere M_AttributeSet + POS modifier groups | SPEC'D |
| P5 | Tender: QR + bank stub | pay path | EMVCo/national-QR + PSP adapter seam | SPEC'D |

---

## §P1 — Register completeness  (the ROUND 3 work; see prompts/UI_UX_LANE.md §ROUND 3)
GOAL: the cashier register is complete and honest end-to-end.
> PARKED 2026-06-15 (handed to GRAND_LANE_STRATEGY): **A/A2/B/C BUILT + user-driven but UNCOMMITTED** in
> worktree `/tmp/wt-r3-pos` (branch `feat/r3-pos-eoda`, off origin/main @ 25b5b4b): pos_lens.js + pos_core.js
> (engine change mirrored to build/erp/, synced). Witness `scripts/poc_pos_eoda.js` W-POS-EODA PASS; 6 prior
> POS witnesses green; shots `~/Pictures/Screenshots/r3_pos_*.png`. NOT shipped. D (history) + E (deploy +
> update `scripts/poc_pos_live.js` to the new Pay→OK-confirm / Previous-Sales-rim / EODA flow) REMAIN.
> CONVERGENCE TODO (grand doctrine §0): route Pay/Revert/EODA commits through the SHARED
> `crud_overlay.commitProcess → completeFanout` seam (S1's path), not the POS-local `cfg.KO.commitGroup`.
- **A — slim rim-drawer pay panel** ✅ DONE+user-driven (v667 rims restored; total back in the slim bar;
  orange items-rim above, green rim below; R2 single-Pay/draggable/partner-default/earcons kept).
  Witness §POS-R3-SHAPE; shots `r3_pos_{1_slim,2_items,3_replenish}.png`.
- **A2 — Pay OK-confirm**: tapping Pay arms a big OK confirm (amount shown); commit only on OK. No
  silent complete on a stray tap. (Reverses R2-3 "complete directly".)
- **B — bottom green rim = Previous Sales**: recall the day's CO C_Orders from the op-log
  (`kernel_ops` CREATE_DOCUMENT C_Order), each row = order#/total/partner/status + **Revert(Void)**.
  Revert = `DocFSM.dispatchOrder(C_Order CO, 'VO')` (CO→VO) + the W-POS-VOID reversal ops (shipment C-
  negated → on-hand restored; postings net 0c — derived, not stored). Replenishment LEAVES the panel.
- **C — EODA "Close Cash"**: the cashier's end-of-day op (Unicenta close-till). One press →
  (1) **BOM backflush** the day's sales (move `CONSUME` OUT of `pos_core.completionOps` → this fold);
  (2) **Generate Replenishment Report** (iDempiere `M_Replenish` ops) — **issued from the MENU**, not
  the panel. Witness `poc_pos_eoda.js`: EOD CONSUME == Σ per-sale `explodeBOM` (nothing lost), qty spine
  moves ONCE at close, chainOk=Y; report rows == `suggestAll` baseline.
- **D — History line (ALIGN WITH THE BLUE TIMELINE, shipped 2026-06-14 night, #314/#317):** each sale
  (+ each ship/pick) is a DOT on the SAME shared timeline the Blue Future skin drives —
  `common/history_bar.js` over kernel_ops v9 (white dot = official/committed, blue dot = speculative
  branch). REUSE, don't reinvent: `window.BlueFuture` (readBranch/groupMeta) + kernel
  `branchOps/discardBranch/acceptBranchUpTo`. The mapping falls out of the metaphor (NON-INVENT):
    · ring items → the in-progress sale rides a **blue speculative branch** (invisible to official reads);
      the draft IS the blue future (subsumes W-POS-HOLD's DR C_Order).
    · Pay **OK-confirm (P1.A2) == acceptBranchUpTo** → the sale turns white/permanent (CO).
    · Revert (P1.B): a still-blue in-progress sale → **discardBranch**; an already-accepted (white) sale →
      DocFSM **VO** (W-POS-VOID). Both fold cleanly; official state only ever moved on accept.
    · EODA Close Cash (P1.C) == a period-close **checkpoint** dot (`erp_period_close.js`) on the timeline.
  POC volume is light (few sales/day × few demo days = trivial; bounded by cache/client lifetime — TBD).
DONE = the daily routine runs start→close with all records generated, witnessed + user-driven.

## §P2 — Kitchen Display System (KDS)   [2nd tab]
GOAL: a kitchen-facing board where each completed/sent sale appears as a prep ticket, à la Unicenta
Kitchen Display / any modern KDS.
- SURFACE: a second same-origin tab (`erp/kds.html` or a viewer mode) subscribing to the SAME signed
  op-log. Cross-tab via BroadcastChannel + IDB (no server) — the §S-2b persist seam already proven for
  the WH walk is the precedent.
- TICKETS: one card per order (or per kitchen-routed line), states **new → preparing → ready → served**
  — a small DocFSM-shaped board; reuse `kanban_host.js` if it fits. Routing by product category
  (Unicenta routes lines to a kitchen printer/display by category) — EXTRACT the category, don't invent.
- BUMP: tap a ticket to advance state; "ready" notifies the register/kiosk (order-number call).
- NON-INVENT: ticket = a projection of existing order ops; state changes are signed ops, no new doc table.
- WITNESS: `poc_pos_kds.js` — a sale on tab A surfaces a ticket on tab B; bump advances state; the board
  is a pure fold of the log (replay-equal). User-drive: two real tabs, screenshots.

## §P3 — DIY self-order kiosk   [customer tab]
GOAL: a customer-facing self-order surface (fast-food kiosk): browse → add items + modifiers → pay →
get an order number; the order flows to KDS.
- SURFACE: a kiosk chrome over the SAME catalog + cart engine (`pos_core.ringLine`/cart) — big touch
  tiles, no cashier auth, "Order #" issued on pay. Reuses P1 tender (P5) for payment.
- DIFFERENCE FROM REGISTER: no drawer/cashier ops; self-checkout only; attended-mode flag gates which
  controls show. One code path, two chromes (the lens precedent: same engine, different surface).
- WITNESS: `poc_pos_kiosk.js` — kiosk order == cashier order in the op-log (same signed group shape);
  order-number issued; routes to KDS. User-drive on a tablet viewport.

## §P4 — Attributes / modifiers   (add cheese, less egg)
GOAL: order-line modifiers — e.g. a burger: +cheese (+price), less egg (no price), no onion.
- GROUND: iDempiere **M_AttributeSet / M_AttributeSetInstance** for the product attribute model; POS
  **modifier groups** (Unicenta auxiliary/modifier products) for the ordering UX. EXTRACT the attribute
  set + allowed values from the dictionary; price deltas come from the modifier product's price (a
  modifier IS a product line or an ASI value — decide per the seed, non-invent).
- UX: tapping a tile with modifiers opens a modifier sheet (required/optional groups, min/max select);
  choices attach to the `C_OrderLine` (description/ASI) and adjust `LineNetAmt`.
- WITNESS: `poc_pos_modifiers.js` — a modified line carries its attributes into the signed group; the
  line total == base ± modifier deltas to the cent; a required-group-unfilled refuses.
- OPEN: does GardenWorld seed carry an AttributeSet to extract, or must the demo seed add a burger-stand
  product+modifier fixture? (TBD — confirm before building; non-invent.)

## §P5 — Tender: QR amount + bank-write stub
GOAL: show a **QR for the amount to pay**, and a **PaymentAdapter** seam stub that a real acquirer/PSP
plugs into for a live stall.
- QR: the demo already renders a payment QR (`§POS-PAYQR`). Harden to a real **dynamic QR** standard:
  encode amount + reference per a national instant-payment scheme (EMVCo QR — e.g. DuitNow/PayNow/UPI/
  PIX, region-dependent) OR a PSP-issued QR. The customer scans with their banking app.
- ADAPTER SEAM (the stub the real ops plug into):
  ```
  PaymentAdapter = {
    createCharge(amountCents, ref) -> { intentId, qrPayload }   // demo: local payload, no-op
    poll/onConfirm(intentId)       -> { paid: bool, txnRef }     // demo: manual "mark paid"
  }
  ```
  The POS marks the order **paid** only on confirm (idempotent on intentId). The demo adapter is a
  no-op; the real adapter calls the acquirer/PSP API + verifies the confirmation webhook signature.
- WITNESS: `poc_pos_tender.js` — a charge intent is created for the cart total to the cent; "paid"
  confirm flips the order to settled exactly once (idempotent); an unconfirmed intent never settles.

### §P5-REAL — advice for wiring a real stall (the user will deploy)
- **Do NOT touch raw bank rails.** Integrate a **payment gateway / acquirer / national QR scheme** — they
  carry the bank connection, settlement, and compliance. The POS only creates a charge + reacts to a
  signed confirmation.
- **Dynamic QR per transaction** (amount + unique ref) beats a static merchant QR: it auto-reconciles
  and the cashier never re-keys the amount.
- **Confirmation must be server-verified**, not client-trusted: the acquirer posts a signed webhook /
  you poll their API → THEN mark paid. Never settle on "the customer says they paid".
- **Security/compliance:** HTTPS only; verify webhook signatures; idempotency keys; QR/account schemes
  keep card-PCI out of scope (don't ever handle PANs in the browser). Keep API keys server-side — a
  pure-browser POS needs a thin signing/relay endpoint for the PSP secret (the one place a server is
  unavoidable; the rest stays serverless).
- **COUNTRY = MALAYSIA (user 2026-06-15):** the scheme is **DuitNow QR** — PayNet's national EMVCo-
  compliant QR (one QR, any participating bank/e-wallet pays). The POS shows a **dynamic DuitNow QR**
  (amount + reference) per sale. Settlement + the bank link come from the chosen acquirer/aggregator,
  NOT from us — candidates for a single stall (cheapest setup first): a no-fixed-fee aggregator with a
  merchant API (**ToyyibPay, Billplz**) or a fuller PSP (**iPay88, Razer Merchant Services/MOLPay,
  Stripe-MY**), or DuitNow QR direct via the stall's bank (Maybank/CIMB/etc.). The PaymentAdapter's real
  impl calls that provider's "create dynamic QR" endpoint + verifies its confirmation webhook.
- **CHOSEN = DuitNow QR direct via CIMB / Maybank merchant (user 2026-06-15).** Best rates, the bank
  carries settlement. The PaymentAdapter real impl mints a **dynamic DuitNow QR** (amount + ref) via the
  bank's merchant API and reconciles on the bank's payment callback/notification.
  ⚠ ONE THING TO CONFIRM WITH THE BANK (decides build shape): does their DuitNow merchant product expose
    a **dynamic-QR API + a real-time confirmation callback**? Then full auto: QR per sale, auto-mark-paid.
    If they only give a **static merchant QR** (common on entry tier), the demo still shows the static QR
    and the cashier confirms receipt manually (or we add an aggregator later for dynamic). EITHER WAY the
    PaymentAdapter seam is the same — only the adapter impl differs. Demo DuitNow-QR adapter ships now.

---

## §2 — Sequencing & dependencies
P1 → (P2 ‖ P5) → P3 → P4. KDS (P2) and tender (P5) are independent of each other and can interleave;
the DIY kiosk (P3) needs both the catalog (P1) and tender (P5); modifiers (P4) enrich both order
surfaces and can land last. Each phase: spec section here → witness → user-drive (screenshots) → PR →
deploy (sw bump) → orphan-check.

## §3 — Witness ledger (fill as each lands)
- §POS-R3-SHAPE — P1.A slim rim panel ✅ (shots r3_pos_*).
- (P1.A2) §POS-PAY-CONFIRM — armed→OK commits, stray tap no-ops.
- (P1.B)  §POS-PREVSALE / §POS-REVERT — recall list + CO→VO revert.
- (P1.C)  poc_pos_eoda.js §POS-EODA — close-till backflush == Σ explodeBOM; replenish report rows.
- (P1.D)  §POS-HISTORY — sale/ship events on the shared bar.
- (P2)    poc_pos_kds.js · (P3) poc_pos_kiosk.js · (P4) poc_pos_modifiers.js · (P5) poc_pos_tender.js.
```
```
