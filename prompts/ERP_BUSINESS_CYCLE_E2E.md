# ⚠ DO NOT REMOVE — scope: DISCOVERY witness for the full O2C+P2P business cycle on the live
# iDempiere surface (bim-ootb `erp/idempiere.html` + `erp/crud_overlay.js`). Read the log after every run
# (`build/erp/witness_e2e_business_cycle.log`, gitignored — regenerate via `bash build/erp/run_witness.sh
# scripts/witness_e2e_business_cycle.js` from bim-compiler). This is NOT a green-run hunt — a break IS the
# deliverable. Do not re-run "hoping" for a full pass; the findings below are the answer.

**🏁 LANE CLOSED 2026-07-22 — Sales-side O2C (Order → Shipment → Invoice) is DONE end-to-end.**
Full day-by-day history (2026-07-20 → 2026-07-22 — the per-stage discovery run, all nine dated `§Fix`
sections, the exact `§CYCLE` log lines, and the full per-stage forensic `§Findings`/`§Gaps`/`§Witness`
detail) archived verbatim, nothing lost:
**`prompts/archive/ERP_BUSINESS_CYCLE_E2E_full_history_2026-07-20_to_2026-07-22.md`**
Nine connected PRs landed it, most recent first: #968 (`AD_Org_ID` casing) · #960 (Confirm & Post commit
wiring) · #956 (order-line parent-FK) · #955 (DeliveryRule/InvoiceRule) · #953 (IsSOTrx/DocType-per-window)
· #948 (fetchOrder overlay-fold) · #944 (cleanVals/M_Warehouse_ID) · #938 (picker-overlay gap) · #928
(W-SO-CHILD-BIND, master/detail mis-selection) — all on `bim-ootb`. This file is kept to the still-relevant
current-state record below; the day-by-day root-cause narrative lives in the archive if ever needed again.

**2026-07-20**, updated **2026-07-21** — witness: `scripts/witness_e2e_business_cycle.js` (bim-compiler).
Precedents adapted: `witness_e2e_crud_blob_race.js`, `witness_e2e_multiuser_login_fork.js`.

## THE QUESTION

Can a real user drive a full business cycle end-to-end through the live iDempiere surface today — Sales
Order → Shipment → Sales Invoice → stock effect → replenishment signal → Purchase Order → Material
Receipt → vendor invoice + three-way match — and if not, exactly where does it break?

## §Results — per-stage table (2026-07-22, current)

| # | Stage | Driven | Result |
|---|---|---|---|
| 1 | Sales Order | UI | **PASS** (was FAIL 2026-07-20 — fixed via PR #928, see archive) |
| 2 | Delivery / Shipment | UI | **PASS** (2026-07-22 — a real signed `M_InOut` document reaches the op-log via the real UI, first time in this lane's history) |
| 3 | Sales Invoice | UI | **PASS** (2026-07-22 — a real signed `C_Invoice` document reaches the op-log via the real UI; the SAME Confirm-and-Post wiring built for Stage 2, unmodified, closed this too once its own upstream blocker cleared) |
| 4 | Stock effect | UI-observed | **FAIL** (structurally-absent capability, unrelated to any fix in this lane — `m_storageonhand` has no live fold off the op-log anywhere, so a real signed shipment still can't move it; scoped OUT of this lane, see §Closed below) |
| 5 | Replenishment signal | UI | **PASS** |
| 6 | Purchase Order | UI | **PASS** (fixed via PR #953 "DocType/IsSOTrx" — the record is now correctly DATA-tagged Purchase, `c_doctypetarget_id:126 issotrx:"N"`; previously byte-identical to a Sales Order underneath) |
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
detail in the dated `§Fix` sections, archived — see the pointer at the top of this file.

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
