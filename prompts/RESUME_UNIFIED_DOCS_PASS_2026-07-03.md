# ⚠ DO NOT REMOVE — Unified docs pass, 2026-07-03 — DONE, bc PR #33 merged
# ✅ CLOSED 2026-07-03 (Fable5, bc PR #35 merged): all three leftovers done — see §Leftovers closed below.

## What shipped
Picked up the stale, unmerged `docs/modeller-guide-integrate` WIP branch (bim-compiler) and finished it as
one consistent pass across all 5 app guides — `docs/BIMUserGuide.md`, `docs/ModellerGuide.md`,
`docs/ERPUserGuide.md`, `docs/HRBIMAssetGuide.md`, `docs/TeamsOverlayGuide.md` — plus `mkdocs.yml` nav.
Merged: bc PR #33 (`docs/unified-guides-pass`).

- **Correctness fix:** `ERPUserGuide.md` Replenishment (§P-4) described the old auto-fire behavior —
  rewritten to match the real staged generate→review/edit→confirm flow.
- **New Kitchen Display section** (`ERPUserGuide.md`, §7) — had zero mentions anywhere before.
- **New BIM BOM pane section** (`HRBIMAssetGuide.md`) — 9th FAMILY drawer entry, had zero mentions.
- **7 Modeller gaps filled** (`ModellerGuide.md`): T/S key-arming, a new Outliner section (eye-toggle,
  filter-dim, auto-expand, selection outline, windowing), real shadows, floating drag-dimension readout,
  BCF 2.1 export, scale-preview local-axes accuracy.
- **New `docs/WhatsNew.md`** — no changelog page existed anywhere; wired into `mkdocs.yml` nav (Start Here)
  + `USER_GUIDE.md` dispatcher.
- **Jargon strip** — removed PR numbers / witness names (`W-XXX`) / `sw vNNN` tags leaking into
  user-facing prose in `ERPUserGuide.md` and `TeamsOverlayGuide.md`. Kept substantive claims, cut what only
  means something to someone reading the repo.
- Verified `mkdocs build --strict` — 0 warnings (3 pre-existing anchor-slug INFO notices, unrelated to this
  change, left as-is — don't chase them as part of this thread).

## Leftovers closed — ✅ ALL DONE 2026-07-03 (bc PR #35 merged)
- ✅ `docs/img/hba_bom.png` — REAL capture via the standing live harness (`hr_bim_asset/tests/live/cdp_shot.js`
  + `ready_hhs_govern.js`, HHS viewer, bim-ootb main incl. #632). Witness: `§HBA_BOM_PANE mounted
  assemblies=13 components=88` + `§DIAG_BOM_SHOT paneMounted=true bomAsmRows=13 bomLineRows=88 openLinks=13`.
  Guide step-2 prose trued to the shipped pane (lines inline, row click flies to the room — not click-to-expand).
- ✅ Stale `docs/*` branches closed — 15 remote + 17 local deleted after per-branch verification (tip==merged-PR
  head, or ancestor of merged work, or content confirmed in master/bim-ootb: NINJA prompts were deleted BY #33,
  `ModellerUserGuide.md` consolidated by #10, logic-admission content in `IDEMPIERE_2.md`+`erp/report_overlay.js`,
  p6 Primavera/MSPDI content in master). Kept: `docs/watchdog-close-2026-07-03-v2` (active, other session).
- ✅ 4 anchor-slug notices fixed (GitHub `--` → mkdocs single-dash links) — `mkdocs build --strict` 0 anchor
  INFO notices (was 4, incl. one in `BIM_Modeller_OOTB.md` the original count missed).

## Don't redo
Base is `docs/modeller-guide-integrate` (bc), not `master` — that branch had the real, current 5-guide
structure; `master`'s own `docs/` is stale/pre-reorg. Confirm this is still true before assuming.
