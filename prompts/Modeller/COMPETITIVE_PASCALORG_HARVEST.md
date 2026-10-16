<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — INTERNAL NOTES: pascalorg/editor harvest assessment for DAGeVu Modeller (research only, no code)

```
SCOPE: research/positioning notes only, triggered by docs/internal/BIM_OOTB_ASSESSMENT_2026-08-06.md §8
(an outside assessment's harvest list) plus a direct source-tree read of pascalorg/editor (2026-08-06,
via `gh api repos/pascalorg/editor` + raw.githubusercontent.com — real files, not paraphrase). Every
candidate below is sourced to an actual file/function/doc in their repo, corrected where the outside
assessment's paraphrase didn't match. §4 is the actual task: a list of TRUE/FALSE questions about OUR
OWN code that must be answered before any of this becomes a build decision. Recommended for a
higher-reasoning (Opus) session — this needs cross-repo architectural comparison, not a quick patch.
No code changes in this doc.
```

## §0 — Why pascalorg is the right comparison, and why it stays narrow

pascalorg/editor is blank-canvas authoring: draw a wall, drop furniture, no source-of-truth building to
extract from. DAGeVu is the inverse: a real IFC comes in, walkers complete missing disciplines against
`duplex_rules.db`/`terminal_rules.db`, and the state is a signed op-log, not a bounded undo buffer
(Zundo, 50 steps) over mutable scene nodes. That architectural gap is real and is why `docs/internal/
BIM_OOTB_ASSESSMENT_2026-08-06.md` §8 concludes "harvest ideas, not code" — confirmed correct on a real
read of their state model (`packages/core` schema nodes + Zustand stores, no event-sourced log). Nothing
below changes that conclusion. What's below is the narrower, useful question: which of their *authoring
UX primitives* — the part of their stack that has nothing to do with how state is stored — solve a
problem DAGeVu also has, or will have the moment authoring (not just extraction) is a first-class path.

## §1 — Corrected from the outside assessment's paraphrase

The assessment's §8 named these from secondhand description. Re-sourced directly against
`pascalorg/editor` main branch (2026-08-06) — signatures and shapes below are copied from the actual
code/docs, not reworded:

- **`canPlaceOnWall`** — assessment paraphrased it as `canPlaceOnWall(wallId, t, height, dims)`. The
  real signature (`packages/core/src/hooks/spatial-grid/use-spatial-query.ts`, documented in
  `wiki/architecture/spatial-queries.md`):
  ```ts
  canPlaceOnWall(
    levelId: string, wallId: string, localX: number, localY: number,
    dimensions: [number, number, number],
    attachType: 'wall' | 'wall-side', side?: 'front' | 'back', ignoreIds?: string[],
  ): { valid: boolean; conflictIds: string[]; adjustedY: number }
  ```
  Sibling calls exist for floor and ceiling (`canPlaceOnFloor`, `canPlaceOnCeiling`), all returning the
  same `{valid, conflictIds}` shape plus a snapped-position field. The rule worth taking isn't the
  function name, it's the pattern: **every placement tool validates before commit, against a live
  spatial-grid index, and returns the corrected coordinate the caller must use** (`adjustedY`) rather
  than trusting the raw cursor position.

- **Wall mitering** — real, substantial, not a one-liner. `packages/viewer/src/systems/wall/
  wall-system.tsx` (1,281 lines) computes miter joins via `getWallMiterBoundaryPoints` +
  `WallMiterData` (junction-keyed, `pointToKey`-indexed), a band/slot system for interior/exterior/
  skirting/crown/chair-rail surfaces per wall face, and does the actual boolean cutting (openings,
  terrain) with `three-bvh-csg`'s `Evaluator`/`Brush`/`SUBTRACTION` — a real CSG kernel, not a
  string-count of vertices. Curved walls get a separate inset/frame path (`getWallCurveFrameAt`).
  Cache layer: `level-miter-cache.ts` (`clearLevelMiterCache`/`getCachedLevelMiters`) — miters are
  computed per level and invalidated, not recomputed every frame.

- **Level/wall view modes** — the assessment named "stacked / exploded / solo." The real enum
  (`packages/viewer/src/store/use-viewer.ts`) has a fourth: `levelMode: 'stacked' | 'exploded' | 'solo'
  | 'manual'`. **Not named in the original assessment at all, and directly relevant to our own §5
  DLOD/occlusion problem**: a sibling `wallMode: 'up' | 'cutaway' | 'down' | 'translucent'` exists —
  i.e. they solved "let a coordinator see through/past walls without touching material occlusion logic"
  as an explicit user-facing view mode, not a threshold-driven visibility system. That's a different
  shape of solution to the exact problem our DLOD landmine (`project_dlod_geometry_swap_landmine.md`)
  has failed at four times from the threshold-swap angle — worth reading before the next DLOD attempt,
  same as that memory already says, but this gives a second failure-mode-free reference pattern besides
  `TM_DLOD_SCALE.md`'s disjoint-sets.

- **Plugin manifest** — the assessment called this "the real prize" without quoting the contract.
  Full shape, from `wiki/architecture/plugin-authoring.md` (real doc, not summarized secondhand):
  ```ts
  export const myPlugin: Plugin = { id: 'vendor:pack-name', apiVersion: 1, nodes: [ /* NodeDefinition[] */ ] }
  ```
  Each `NodeDefinition` composes: `defaults`, `capabilities` (selectable/duplicable/deletable/surfaces/
  relations), `parametrics` (auto-derived inspector UI), `renderer`, `system` (per-frame), `geometry`,
  `floorplan`, `tool`/`affordanceTools` (placement), `presentation` (palette metadata), **`mcp`** (tool
  descriptions for AI consumers — see §2 below), `relations`/`computeLevelData`. `apiVersion` bump is the
  only breaking-change lever; new optional fields never break old plugins. Built-ins load through the
  *exact same* `loadPlugin` path as third-party (`pascal:core` is just another plugin) — there is no
  privileged internal API, which is the actual reason a standalone example repo
  (`pascalorg/plugin-trees`) can exist at all.

## §2 — Not in the original assessment: an MCP server over the whole editor

`packages/mcp` (real, ~50 source files, `gh api repos/pascalorg/editor` confirmed) is a full Model
Context Protocol server exposing the editor as agent-callable tools: `create-wall`, `cut-opening`,
`place-item`, `check-collisions`, `door-clearance`, `layout-clearance`, `measure`, `set-zone`,
`create-level`/`duplicate-level`, `undo`/`redo`, `create-house-from-brief` (a full from-scratch
generation prompt), `generate-variants`, `photo-to-scene` (`analyze-floorplan-image`,
`analyze-room-photo`, `renovation-from-photos`), plus scene lifecycle (`create-project`, `save-scene`,
`load-scene`, `list-scenes`) and a `live-sync` tool. Transports for both stdio and HTTP
(`packages/mcp/src/transports/`).

**Why this is the one worth flagging hardest, not the plugin format:** DAGeVu's own architecture is
already tool-call-shaped — `docs/BIM_COBOL.md`'s verbs (FOLLOW, ROUTE, CrawlOps) are discrete,
named, parameterized operations over a building, which is structurally the same grain as an MCP tool
list. pascalorg proved the pattern works end-to-end: an agent (their own docs target Claude/Cursor-style
consumers explicitly, see `packages/mcp/src/resources/agent-guide.ts`) can author a house from a
brief or a photo by calling these tools in sequence, with `check-collisions`/`door-clearance` as the
same kind of pre-commit validation `canPlaceOnWall` does interactively. An MCP surface over our own
verb registry — `create-wall`-equivalent → `FOLLOW`, collision/clearance checks → whatever DISC_Walker
already validates before placement — would let an agent (this one, or a future session) drive DAGeVu
the same way, rather than only running it as a batch pipeline. This is a bigger, more strategic harvest
than the plugin-format one the original assessment ranked first — flagging it as the top item for the
Opus session in §4 to actually evaluate, not just note.

## §3 — Reverse direction (confirmed, not re-litigated)

`docs/internal/BIM_OOTB_ASSESSMENT_2026-08-06.md` §8 already covers why pascalorg can't harvest from us
cheaply: their state model is mutable nodes + a bounded undo stack, ours is a replayed signed op-log —
any component crossing over needs a rewrite to commit ops, "at which point it has been rewritten." Read
against their actual `packages/core` schema + Zustand stores this session, that read holds. Not
re-argued here — the asymmetry is real and already on record.

## §4 — TRUE/FALSE questions for the next (Opus) session, before any of §1-§2 becomes a build task

Each of these determines whether a §1/§2 candidate is solving a problem we already solved differently,
a problem we don't have (because we extract, we don't author from blank), or a real gap:

1. **Wall mitering (§1):** does DAGeVu's OCCT path already produce correct miter joins when a wall is
   authored or moved, or does it currently only inherit whatever miter geometry the source IFC already
   baked in? If Modeller never author-edits wall geometry post-extraction, this candidate may not apply
   at all — check before assuming it's a gap.
2. **Placement validation (§1) — answered 2026-08-06, not fully open anymore.** Checked directly
   (`~/bim-ootb/modeller/`): fitting placement is real and arguably stricter than pascalorg's, but along
   a different axis, and one real gap is confirmed, not hypothetical:
   - `real_placement_resolver.js` is the equivalent of `canPlaceOnWall`'s validation gate, but
     REFUSE-not-fabricate rather than snap-and-warn: `resolveRealPlacement()` either returns real,
     sourced dimensions/anchors from `component_library.db`'s `ad_product_dim`, or **throws**
     `WalkerGapError` — no placement commits on a guessed box. Stricter than pascalorg's `{valid:
     false}` (which lets the tool retry/adjust); ours refuses outright if the product isn't real.
   - `bonsai_gridmove.js` + `grid_kinematics.js` is the grid-snap equivalent, but grid-LINE-driven, not
     item-driven: drag a gridline, every attached wall recomposes (translate/scale), committed as one
     signed `GRID_MOVE` op. `sdg_cascade.js` rides hosted fillings (door/window) along with their host
     wall — but **confirmed ONE HOP only, wall→filling, by the file's own comment** ("ONE HOP
     (wall→door; doors are never hosts)"). No broader cascade exists.
   - **Confirmed gap, not open question:** grepped for room-level move/translate
     (`moveRoom`/`translateRoom`/room+move across every `modeller/*.js`) — **zero hits.** There is no
     "grab a room and move it, BOM and contents follow" capability today. The user flagged this
     directly (2026-08-06) as something "ours is supposed to" do — it doesn't yet.
   - **Also confirmed missing:** a free single-item interactive drag tool (grab one fitting, drag it
     anywhere, live collision feedback) — the pascalorg UX `canPlaceOnWall` actually serves. DAGeVu's
     placement is walker-driven (RouteWalker/DISC_Walker, rule-based auto-placement) or
     gridline-driven, not a direct manual per-item drag. Not necessarily a gap — extraction-and-
     complete vs. author-from-blank are different products (§0) — but worth being precise that it's
     genuinely absent, not just unconfirmed.
   - **Full implementation spec (2026-08-06):** `prompts/Modeller/ROOM_MOVE_AND_ITEM_DRAG_SPEC.md` —
     op shapes, member-enumeration legs, the two-hop cascade via composing `sdg_cascade.js`'s
     existing `ridersFor` (not rewriting it), and 6 named open questions to resolve against live
     code before implementing. Read that file directly rather than re-deriving from this summary.
   - **One real structural advantage, worth keeping when this gets built:** `bom_tree.js` is
     `foldOps(seed, ops)` — the BOM is a deterministic replay over the same signed op-log geometry
     ops write to. A future `ROOM_MOVE` op, once it exists, gets BOM-consistency for free by
     construction — pascalorg would need to wire that by hand since their BOM/cost isn't fold-derived.
3. **Wall/level view modes (§1):** does the Viewer already have an equivalent to `wallMode: 'cutaway'
   | 'down'` for Clash Matrix / section-cut inspection (check `viewer/time_machine.js` xray/ghost paths,
   `viewer/dlod.js`) before building a new one — the assessment's own §5 already asks for exactly this
   capability "bound to mode," so check for an existing near-miss first.
4. **Plugin/rule-pack format (§1):** does our walker/discipline registration (`duplex_rules.db` vs
   `terminal_rules.db` as a `WHERE`-column data filter, per `docs/internal/WalkerDoctrine.md`) already
   expose enough of a stable contract to publish as a standalone format the way `NodeDefinition` does —
   or is the "just a data filter" framing doing more informal work than a real external contract could?
5. **MCP surface (§2) — the priority one:** is there real appetite and architectural fit for exposing
   BIM_COBOL verbs as MCP tools, given the existing local-Java-bridge concept
   (`project_java_bridge` memory: "browser UI, optional local language server for advanced features")?
   Would the MCP transport live in that same optional-local-install lane, or does it need to run
   entirely browser-side to keep the "zero install" claim intact? This is the one question worth an
   actual spec pass if the answer leans toward "yes, worth building" — everything else in this file is
   read-only comparison.
