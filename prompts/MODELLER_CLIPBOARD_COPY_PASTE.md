<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — BUILD SPEC: Modeller static clipboard (copy/paste), scope = §4a ONLY

**Read the log after every run.** Target repo/code: `bim-ootb` (`modeller/`, `modeller.html`) — NOT this repo.
This spec was written from `bim-compiler` (read-only investigation only, cross-repo). Implementation must
happen in a `bim-ootb`-rooted session/worktree, per [[feedback_diagnose_in_session_fix_in_other_session]]'s
2026-08-05 hardened rule — do not dispatch an Agent into `~/bim-ootb` from a `bim-compiler` session without
asking first. See §DISPATCH at the bottom.

**Lineage:** split out of `prompts/PREFAB_LASSO_MACRO_LIBRARY_DIALOGUE.md` §4a (design-dialogue record,
2026-07-05, never built) + that doc's new §6 (2026-08-11, Revit-competitive-positioning follow-up that
picked this as the one safe-to-build item — pure addition, no existing code modified, reuses an
already-proven signed-op-group pattern). This spec supersedes §4a's shape where real code disagreed with
the dialogue's guesses — see §GROUNDING below.

---

## §GROUNDING — verified against `bim-ootb` `origin/main` tip `9197a09` (2026-08-11), read-only Explore pass

The original dialogue assumed the DAG-guided pick (§2a) and `expandAssembly` were reusable as-is for a
clipboard. Both assumptions were wrong. Corrected facts, each file:line-verified (do not re-derive without
checking — this repo drifts, see `git -C ~/bim-ootb log -1` before trusting these lines):

1. **No severance-check API exists.** `modeller/cross_edges.js:270-279` `CrossEdges.deriveAll(db, opts)`
   returns flat `{abuts, anchored, datums, spans, fills, aggregates}` edge arrays — no "does boundary X
   sever edge Y" query. The only existing consumer pattern is `bonsai_outliner.js:78-84` `_buildAdjMap()`
   (linear scan into `guid → Map(neighbourGuid → Set(edgeKind))`). Building this into the clipboard is NEW
   code, not reuse — **out of scope for this spec**, see §OUT-OF-SCOPE.
2. **`expandAssembly` (`bonsai_library.js:157`) cannot take a live-selection copy.** It hard-requires
   `ASM_BY_ID[id]` — catalog-JSON-sourced assembly definitions only (`:29,40-41`). Not usable here.
3. **`foldInsert` (`bonsai_library.js:405`) IS usable** — it's origin-agnostic. Its non-catalog path
   (`:409-411,421-427`) already accepts a raw `params.bbox` + `params.realGeomHash` instead of a catalog
   hash. `arc_editable.js:184` `buildSeedOps()` already builds exactly this shape from an existing element's
   own measured transform + `outputGuid` when seeding real (non-catalog) building elements. **This is the
   correct precedent for paste** — copy an element the same way `buildSeedOps` already does, not through
   `expandAssembly`.
4. **Signed op-group: use `Bonsai.oplog.commitGesture(opsArray)` (`bonsai_oplog.js:374`), not
   `commitSeedGroup`.** `commitSeedGroup` (`bonsai_oplog.js:405`) is a different, one-time whole-building
   batch-seed wrapper, explicitly **not** wired into undo history
   (`modeller_history.js:100-104`). `commitGesture` is what grid-stretch actually reuses
   (`bonsai_gridmove.js:270-274`) — N ops in, one signed group out, and `modeller_history.js:115-124`
   auto-wraps every `commitGesture` call into ONE undo-tree node. Paste gets undo/redo for free by using
   this call, no extra work.
5. **Selection state**: `window.Bonsai._selSet` (mirror of `selectedIds`, primary at `modeller.html:1019`,
   synced via `setSelectionIds()` at `:1147-1148`) holds **`featureId`** values (kernel_ops row ids), not
   raw IFC guids. Guid↔featureId translation for ARC-seeded elements: `window.__arcGuidByFid` /
   `__arcFidByGuid` (used at `bonsai_gridmove.js:249`, `modeller.html:2682`).
6. **Keybinding pattern to follow**: `modeller.html:3556-3572` (Ctrl+Z/Ctrl+Y) — typing-guard first
   (`/^(INPUT|TEXTAREA)$/` regex on `e.target`), then `(e.ctrlKey||e.metaKey)` check, `e.preventDefault()`.
   **Correction to a stale claim in project memory**: `R` does NOT enter Insert mode — that's the
   `bInsert` button / `enterInsert()` (`modeller.html:3489-3491`). `R` only rotates the pending ghost
   *while already inserting* (`:3513-3514`). Don't collide a new shortcut with this.
7. **"Zero clipboard" reconfirmed live** (2026-08-11, `git grep` against `origin/main` tip): no
   clipboard/paste/duplicate feature exists anywhere in `modeller/`. The gap is real, not stale.

## §SCOPE — ruthlessly cut to what's actually "no impact, safe to build"

**IN scope (this spec, this build):**
- Copy: read the CURRENT selection exactly as `window.Bonsai._selSet` already provides it (existing
  mechanism, unchanged) — no DAG-guided/severance-aware pick. Hold element data (bbox/realGeomHash/
  transform, per element, sourced the same way `arc_editable.js buildSeedOps()` already does) in an
  in-session, memory-only buffer. Read-only operation — zero footprint by construction, nothing written
  until paste.
- Paste: translate the whole buffered set as ONE rigid group (preserve relative offsets between copied
  elements) to a target anchor (see §OPEN-1), build one `GEOM_INSERT` op per element (fresh `outputGuid`/
  `featureId` each — never alias the source, per BOM PRINCIPLE), commit via
  `Bonsai.oplog.commitGesture(opsArray)` — one call, one undo-tree node.
- Grid-snap on paste, reusing the **already-shipped** grid-snap mechanism (§2b sub-path 1 "align/snap-to-
  grid" from the original dialogue — this piece IS real and shipped elsewhere, unlike the severance API).
- Ctrl+C / Ctrl+V, wired per §GROUNDING-6's pattern.

**OUT of scope (deferred, not part of this build — do not silently expand into these):**
- §2a DAG-guided lasso / severance-aware pick — needs new graph-query code (§GROUNDING-1). Separate task.
- §2b sub-paths 2 (frame likeness) and 3 (material-wise conform, itself flagged unverified/don't-assume in
  the source dialogue) — grid-snap only for this build.
- §3 escalating lasso, §4b macro-twig capture, §4c mineable op-log corpus — all bigger, separate, not this.
- Cross-selection type/BOM-tier awareness (e.g. "paste as new instance of an existing type" vs "paste as
  fully independent copy") — this build always pastes as fully independent new elements.

## §OPEN — genuine design questions, not invented, need a call before/while building

1. **Paste anchor point.** Where does pasted geometry land? No live "grid cursor" concept was found in the
   Explore pass to anchor to. Proposed default (common CAD/DTP convention, cheap, reversible via undo):
   paste at the copied selection's own bbox position **plus a fixed small offset** (e.g. +1 grid unit on
   local X), then grid-snapped. State this as the default and let whoever builds it confirm/override — do
   not block on it, per WORK-TO-ZERO (mark it, keep moving, only escalate if it turns out to matter).
2. Confirm `window.Bonsai._selSet` is genuinely readable/settable from a new module without import-order
   issues (it's set on `window`, so should be fine, but verify at build time, not assumed here).

## §WITNESS PLAN — RED-first, per Spec-First / Tests-expose-issues (CLAUDE.md Standing Rules)

Each witness must be shown failing against unmodified `main` before the fix lands (no clipboard code today
→ trivially RED), then green after. No visual/screenshot proof — `§`-tagged log values only, per the
FUNDAMENTAL LAW in project memory.

- **W-CLIPBOARD-COPY**: Ctrl+C with N elements selected → buffer holds exactly N entries; each entry's
  bbox/realGeomHash/transform matches the live element's own `elements_meta`/`element_transforms` row
  byte-for-byte (not synthesized). `§CLIPBOARD_COPY n=<N>`.
- **W-CLIPBOARD-PASTE**: Ctrl+V → exactly N new elements appear, offset per §OPEN-1's rule, each carrying a
  NEW `outputGuid`/`featureId` distinct from every source element (assert disjoint sets). One
  `commitGesture` call, one group hash. `§CLIPBOARD_PASTE n=<N> new_guids_disjoint=true groups=1`.
- **W-CLIPBOARD-UNDO**: one Ctrl+Z after paste removes all N pasted elements in a single step (not N
  steps); scene reverts byte-identical to pre-paste (mesh count, Outliner count, pick-ray hit-for-hit —
  same rigor as `MODELLER_MASTER.md` row 4's guardrail proof). `§CLIPBOARD_UNDO reverted=true steps=1`.
- Regression: existing selection/grid-stretch/Insert witnesses must stay green (no shared state touched
  outside the new buffer + the standard `commitGesture` path already exercised by grid-stretch).

## §DISPATCH — cross-repo, ask before acting

This spec is complete and grounded; nothing has been implemented. Per the hardened cross-repo rule, before
any Agent is dispatched into `~/bim-ootb` to build this: **confirm no other concurrent session already owns
Modeller work right now**, and get an explicit go for THIS session to dispatch it (worktree per Worktree
Hygiene — check `git -C ~/bim-ootb worktree list` first, reuse `/tmp/wt-sandbox` or make a fresh
`/tmp/wt-*` only if sandbox is mid-use by something else).

**Status 2026-08-11: ⛔ BLOCKED, session wrapped without dispatching** — user paused here to close the
session cleanly rather than answer the go/no-go, no implementation attempted. Resume by re-asking the two
questions above (any concurrent session already on Modeller? go to dispatch?) — do not assume either answer
from a prior session. See `project_modeller_clipboard_spec.md` memory + `PROGRESS.md` 2026-08-11 entry for
the full chain if picking this up cold.
