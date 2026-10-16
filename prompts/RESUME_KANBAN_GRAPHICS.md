# ✅ DONE/MERGED 2026-06-21 (PR #473 → main, sw v741, W-KANBAN-LENS-CARDS): the STANDALONE Kanban Lens
#   (kanban_lens.html) now renders rich cards — it never passed `meta` to KanbanLens.mount (every card hit the
#   bare fallback). Fix = foldMeta(db) folds {title=DocumentNo,amount,date} from each doc table's REAL columns
#   (dictionary-driven, 0 per-table code) → mount meta; fmtMoney/fmtDate added to kanban_lens.js + applied in the
#   ONE renderer so BOTH surfaces upgrade (0dp whole rupiah / 2dp dollar cents; date trimmed to YYYY-MM-DD); the
#   engine-absent fallback board in idempiere.html:3232 now shows DocumentNo+amount not a bare PK. Witness:
#   erp/tests/poc_kanban_lens_cards.js (18 rich cards, 0 bare, title==real DocNo, amount==fmtMoney(real GrandTotal);
#   poc_kanban_marvel + poc_idmp_kanban regressions green). The in-page "marvel" board was ALREADY rich (#177).
#
# ⚠ DO NOT REMOVE — RESUME CARD (act-from-here for a FRESH session): "Richer Kanban cards — better graphics for ANY document"
# User ask (2026-06-21): "I checked and thought there be better graphics in Kanban page of any document?"
# PRIME RULE: EXTRACT/COMPILE ONLY — render REAL fields from the AD/record, invent nothing. Whitebox §-log first
#   (read the log; exit code ≠ evidence). Money via the seed's integer rupiah / _money(). Verify vs
#   ~/idempiere-dev-setup/idempiere. iDempiere FUNDAMENTAL LAW: Kanban is a ⋯-rail LENS, never native chrome.
#   Lucide line icons only (icons.js, verbatim from panels.js — parity test). Pill-icon consistency.

## §THE FINDING (grounded — start here)
Today a Kanban card is graphically EMPTY — it shows ONLY the record PK/value:
  `erp/idempiere.html:3232`  → `c.appendChild(el('div','kb-card', String(recVal(r, kc))))`
  CSS `.kb-card` = `erp/idempiere.html:3798` (dark chip, 12px). Columns = `.kb-col` / `.kb-colhd`.
There are TWO kanban surfaces sharing the doctrine (keep them consistent):
  1. IN-PAGE board — `openKanbanFor()` in `erp/idempiere.html` (~3202): the real draggable wfmc board (KanbanLens)
     + a read-only fallback board + a heat-map fallback (`_renderHeatMap`). The bare `kb-card` above is the fallback;
     the REAL board cards are built by `KanbanLens` (kanban_lens.js) — CHECK there too.
  2. Standalone `erp/kanban_lens.html` (+ kanban_lens.js) — the lens page; per-row real docs grouped by docstatus.
Pivot sibling just shipped: `erp/pivot_lens.html` + the 'pivot' pill (Lucide 'table'). Mirror its chrome quality.

## §GOAL — a real document card (generic, any table)
Replace the bare-PK card with a compact, INFORMATION-RICH card folded from the record's AD display fields — no
per-table code (works for C_Invoice / C_Order / PP_Order / C_Project / any kanban-folded table):
- Title line = the document's identity (DocumentNo if present, else the record value/Name).
- 1–3 secondary fields = the highest-signal AD fields (e.g. BPartner, DateOrdered, GrandTotal) chosen generically
  via the existing field-cardinality helpers (`_displayFields`/`_distinctCount`, the same ones group-by uses).
- A money/amount chip when the table has an amount column (GrandTotal/PlannedAmt/…), formatted via `_money()`.
- A left COLOR STRIPE / chip by the group key (docstatus heat or the group-by field) — reuse the existing
  status colours; don't invent a palette.
- Optional tiny Lucide doc-type glyph (icons.js verbatim; add to panels.js first if a new glyph is needed — parity).
- Keep drag intact (the card stays the SET_STATUS drag handle); keep it lightweight (≤25 cards/col already capped).

## §APPROACH (bounded)
1. Spec first (a card section here or a new spec). Decide the generic field-selection rule (reuse group-by helpers).
2. A pure `_kbCardFields(tab, rec)` → {title, subs[], amount, color} folded from AD + record (NON-INVENT).
3. Render it in BOTH the in-page fallback card (3232) AND the real KanbanLens card path (kanban_lens.js) +
   kanban_lens.html — ONE card-render helper shared if practical (DRY across the two surfaces).
4. Witness W-KANBAN-CARD (whitebox node, real ad_seed.db): for ≥2 doc tables, the folded card carries the real
   DocumentNo + a real amount (== the seed) + the right group colour; no invented fields; bare-PK cards gone.
5. sw bump (erp) + ?v bumps for whatever files change; PR → main → live-verify.

## §STATE AT HANDOFF (2026-06-21 — all merged + live unless noted)
Shipped this session (lane prompts/RESUME_360_KANBAN_PIVOT.md + prompts/TM_4D5D_VARIANCE_LANE.md):
- PP_Order → BIM Viewer TimeMachine zoom-across (#468, W-PPZOOM-TM 7/7) — the red-pill 'BIM TimeMachine' dest.
- E3 schedule-vs-actual = projected-from-cost date variance (#469, W-SHOP-DATES 9/9).
- Pivot lens on the ⋯ rail (#470, W-PIVOT-PILL 13/13) — 'pivot' pill, Lucide 'table'.
- S5(B) cost EVM in the ⚖ drawer (#471, W-PC-EVM 14/14) — EAC reconstructs the real CommittedAmt to the rupiah.
- ROUND-TRIP FIX (#472, W-BIM-OVERLAY-AUTHORITATIVE 7/7) — Find › ERP "open ↗" deep-link: fresh BIM push now
  WINS over a stale ad_seed_v16 idb cache (per-PK authoritative overlay; seed-baked Hospital band preserved).
  erp sw → v740. ⚠ VERIFY this fixed the user's symptom live (push from viewer → open ↗ → project appears).
PAUSED / teed-up:
- S6 — WHAT-IF via Blue Future (the lane's next headline; spec partly scoped). F-S dependency is EXTRACTABLE
  (C_ProjectPhase dates already chain finish-to-start). Viewer Blue Future = `viewer/blue_fold.js`
  (commitBlue/discardBlue/acceptBlue, branch_id). Twin = `_loadTwin`/`_computeVariance`/`drawVariance` in
  time_machine.js. Resume from prompts/TM_4D5D_VARIANCE_LANE.md §S6.
  ⛔ **STALE POINTER — CORRECTED 2026-08-27. Do NOT "resume from §S6": it resumes into a CLOSED stage.**
  §S6 has been **✅ DONE/LIVE since 2026-06-22** — PR #474 (engine `viewer/whatif.js`, W-WHATIF 13/13)
  + #475 (UI `viewer/whatif_panel.js`); see `prompts/TM_4D5D_VARIANCE_LANE.md:179`.
  ➡ **The live next step is W1 — witness `W-EAC`** (`TM_4D5D_VARIANCE_LANE.md:216`; the Phase-2 arc at
  `:292` is W0 ✅ → **W1 W-EAC** → W2 W-CLAIM-CERT → W3 W-COCKPIT-LOOP). Text above kept as the record.
- TRUE earn-the-actual (S5 option a, real C_ProjectIssue) — parked on the OPFS round-trip (now fixed → revisit).
  ⚠ **Also corrected 2026-08-27:** W0/S5 earn-the-actual is **✅ DONE 2026-06-22** (PR #492, W-PC-EARN
  8/8, `TM_4D5D_VARIANCE_LANE.md:146`) — but it shipped on source **(A) `PP_Order_Cost`**, NOT on
  option (a) `C_ProjectIssue`, because that table is **MISSING** from the seed. So this bullet's
  specific route is not merely "parked", it was **decided against on a measured absence**.

## §WITNESS INDEX (this lane, re-run as regression): viewer/tests/test_pp_zoom_tm.js · test_shop_dates.js ·
#   test_pc_evm.js · erp/tests/test_pivot_pill.js · tests/poc_bim_overlay_authoritative.js
