<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC ONLY: whole-room move + free single-item drag for DAGeVu Modeller (no code in this doc)

```
SCOPE: implementation spec only, for a Sonnet implementation session. Triggered by
prompts/Modeller/COMPETITIVE_PASCALORG_HARVEST.md §4 item 2, whose findings are SETTLED FACT for this
spec (verified against ~/bim-ootb/modeller/ on 2026-08-06 — do not re-derive): (a) no room-level
move exists (grepped, zero hits), (b) no free per-item interactive drag exists (placement today is
walker-driven or gridline-driven only). This doc specifies both. EXTRACT OR COMPILE ONLY: every
relationship used here is a real extracted edge or a disclosed derivation — nothing fabricated.
No code changes in this doc. Implementation target: ~/bim-ootb/modeller/.
```

## §0 — Provenance and ground rules

Two independent capabilities. They share two patterns (the op-log commit discipline and the
refuse-not-fabricate placement gate) but are separate features with separate ops, separate tools,
and separate witnesses. Do not merge them into one tool or one op type.

Settled inputs (cite, don't re-verify):
- `COMPETITIVE_PASCALORG_HARVEST.md` §4 item 2 — the gap confirmation and the structural advantage
  note (BOM is fold-derived, so op-authored moves get BOM consistency by construction).
- `~/bim-ootb/modeller/bonsai_gridmove.js` — the pattern donor: drag-session caching
  (§SCALE_CHECK_FIX), one shared preview/commit pipeline (§PREDRAG, "preview and the actual commit
  can NEVER disagree"), signed `GEOM_GRID_MOVE` commit via `window.Bonsai.oplog.commit(...)`, and
  the gesture-group rider path via `window.Bonsai.oplog.commitGesture(ops)` (§P8, one Ctrl+Z).
- `~/bim-ootb/modeller/sdg_cascade.js` — one-hop host→filling ride (`ridersFor`, `stretchRide`),
  explicitly "ONE HOP (wall→door; doors are never hosts)", resolved only over real
  `rel_fills_host` edges through the §ARC-1 `window.__arcGuidByFid`/`__arcFidByGuid` bridge.
- `~/bim-ootb/modeller/real_placement_resolver.js` — the gate: `resolveRealPlacement(ctx)` returns
  real sourced dims/anchors or THROWS `WalkerGapError` (code `WALKER_GAP`). Its header states the
  rationale verbatim: a caller "must NEVER catch-and-substitute a constant — that silent
  substitution is the exact violation this gate exists to make structurally hard to reintroduce."
- `~/bim-ootb/modeller/bom_tree.js` — the BOM is `foldOps(seed, ops)`, seeded from
  `elements_meta` + `spatial_structure` + `rel_contained_in_space`, replayed deterministically.
- `~/bim-ootb/modeller/kernel_ops.js` — op rows are `{op_type, parameters(JSON), input_guids,
  output_guid, ...}` with hash-chain sealing; op types are strings, no registry file to edit —
  a new op type "plugs in" by (a) committing through `Bonsai.oplog`, (b) getting a fold branch.

## §1 — Shared invariants (both features)

1. **Op-log only.** Every commit is a signed op through the existing `window.Bonsai.oplog`
   commit paths (`commit({op_type, parameters}, {})` for a single op; `commitGesture(ops)` when
   one user gesture spans several ops — the exact shapes `bonsai_gridmove.js` `commit()` uses).
   NEVER a direct THREE matrix mutation as source of truth, NEVER a direct BOM tree mutation.
   The BOM stays consistent structurally because `bom_tree.js` replays the same log — that is the
   guarantee, not a maintained invariant.
2. **Non-invent membership.** Any "what moves together" set comes from real extracted edges
   (`rel_contained_in_space`, `rel_fills_host`) or a *disclosed, provenance-tagged* geometric
   derivation (footprint AABB test) — never a proximity heuristic presented as a relationship.
3. **One preview/commit pipeline.** Mirror `bonsai_gridmove.js` `previewCommands()`/`commit()`:
   the pointermove tint and the pointerup commit run the SAME function, so they cannot disagree.
4. **Session caching.** Mirror §SCALE_CHECK_FIX: enumerate membership / build box maps ONCE at
   `beginDragSession()` (pointerdown), reuse every pointermove frame, drop at `endDragSession()`.
   Membership cannot change mid-drag (nothing commits until pointerup).
5. **Refuse, don't fabricate.** Both features inherit `real_placement_resolver.js`'s stricter
   behavior over pascalorg's snap-and-adjust (`{valid, conflictIds, adjustedY}` — see
   COMPETITIVE_PASCALORG_HARVEST.md §1). We deliberately do NOT soften to match pascalorg: an
   invalid state stays invalid and refuses to commit; nothing is silently adjusted into validity.

## §2 — Feature A: whole-room move (`GEOM_ROOM_MOVE`)

### 2.1 What "room" resolves to
A room is a **qualified IfcSpace guid**, using exactly `bom_tree.js` `seedFromDb()`'s existing
qualification (do not re-invent it): a `spatial_structure` row with `type='IfcSpace'` whose parent
storey is habitable (≥1 IfcDoor on that storey) and whose `size_z` is either NULL or
≥ `minHabitableHeight` (default 1.8 m). The grab target in the UI is the room node (Outliner room
node and/or an in-canvas room footprint handle — implementer's choice; the op is UI-agnostic).

### 2.2 Member enumeration (what moves with the room)
Three legs, each provenance-tagged in the op so the fold and any auditor can see WHY each element
moved:

1. **Contained elements** — every `element_guid` in `rel_contained_in_space` where
   `space_guid = <room guid>`. Real extracted edges; provenance `rel_contained_in_space`. This is
   the primary, always-on leg.
2. **Bounding walls** — ONLY if the extracted schema carries real space-boundary edges
   (IfcRelSpaceBoundary equivalent). None of the five reference files reads such a table, so its
   existence is Open Question Q1. If the table exists: include those walls, provenance
   `rel_space_boundary`. If it does not: bounding walls DO NOT move in v1 — do not synthesize
   boundary membership from wall-near-footprint proximity (that is invent-a-relationship).
3. **Freestanding fixtures inside the footprint** — elements with no containment edge whose
   pre-drag AABB centre falls inside the room's footprint AABB (from `spatial_structure` geometry),
   restricted to non-structural classes (reuse the complement of `bonsai_gridmove.js`
   `_STRUCTURAL_CLASSES`, resolved via its `_buildInsertMaps().classByFid` pattern). Provenance
   `derived-footprint` — a disclosed derivation from real geometry, same standing as
   `bom_tree.js`'s own AABB-based room qualification. This leg exists because residents without
   `rel_contained_in_space` rows (bom_tree.js: "Buildings with no IfcSpace ... skip this level")
   would otherwise make room-move a no-op; when both legs match an element, the real edge wins.

### 2.3 Cascade — two hops by composition, not by rewriting sdg_cascade.js
`sdg_cascade.js` stays ONE HOP and untouched. Room-move reaches hop two by *calling* the existing
pure function once per hop: after legs 1–3 produce the moved set, run
`SdgCascade.ridersFor(movedFids, window.__arcGuidByFid, window.__arcFidByGuid,
window.swXEdges.fills, movedSet)` — any moved wall's hosted fillings join the set (deduped by
`ridersFor` itself). Because a room move is a PURE RIGID TRANSLATION (one `(dx,dy,dz)` for every
member — no SCALE ever occurs), `stretchRide`'s proportional/anchored-min math is unnecessary;
fillings ride by the identical delta. Where `swXEdges.fills` is absent (SampleCastle per
RESUME_CASCADE_INTO_STRETCH.md recon, cited in bonsai_gridmove.js), the hop no-ops byte-identically
— same graceful degradation as §STRETCH-RIDE. Directionality is preserved: fillings never drag
hosts; a room's fillings move only because their HOST wall moved (hop 2) or because they are
themselves contained (leg 1).

### 2.4 Op shape and commit
Follow the `GEOM_GRID_MOVE` precedent exactly: ONE op per drag-release carrying the full resolved
member list, so the fold has one unambiguous branch and undo is one step:

```js
{ op_type: 'GEOM_ROOM_MOVE',
  parameters: {
    spaceGuid: '<IfcSpace guid>', dx: 0.0, dy: 0.0, dz: 0.0,
    members: [ { featureId, guid, via: 'rel_contained_in_space' |
                 'rel_space_boundary' | 'rel_fills_host' | 'derived-footprint' }, ... ] },
  input_guids: [ ...member guids... ], output_guid: '<IfcSpace guid>' }
```

Committed via `window.Bonsai.oplog.commit({op_type, parameters}, {})` (single op — the rider-in-
gesture alternative `bonsai_gridmove.js` uses for §STRETCH-RIDE is NOT needed here because there
are no per-member deltas to split out; everything shares one rigid delta). The fold applies
`(dx,dy,dz)` as a translation to each `members[].featureId` — semantically N `GEOM_MOVE`s, folded
from one row. Fold site: the same worker/main fold that handles `GEOM_GRID_MOVE` commands
(`bonsai_kernel_worker.js` / `bonsai_library.js` foldInsert per bonsai_gridmove.js's own header —
exact branch is Open Question Q2). `dz` is carried in the shape but v1 restricts the tool to
in-plane `(dx, dy)` — see Q4.

### 2.5 Interaction lifecycle (mirror bonsai_gridmove.js verbatim in structure)
- `beginRoomDragSession(spaceGuid)` on grab: enumerate members (2.2 + 2.3) once, build
  mesh-by-fid and box-by-fid caches once (reuse the `_buildMeshByFid`/`_buildBoxByFid` shapes).
- `previewCommands(dx, dy)` per pointermove: pure — returns the member/delta list; drives tint.
- `commit(dx, dy)` on pointerup: calls the SAME `previewCommands`, commits the one op, logs
  member count + verify result like `§GRIDMOVE commit` does.
- `endDragSession()` on commit/cancel: drop caches.
No per-member opt-out (§GREEN-EXCLUDE analogue) in v1 — a room moves whole; excluding members
piecemeal re-opens the divorced-contents problem this feature exists to close.

### 2.6 BOM-consistency guarantee (concrete)
`bom_tree.js`: the tree IS `foldOps(seed, ops)`; the seed derives room membership from
`rel_contained_in_space` + `spatial_structure`, keyed by guid — never by coordinates. A
`GEOM_ROOM_MOVE` changes coordinates only and touches no containment edge, no parent pointer, no
`BOM_REPARENT`: the room and its contents translate together, so every containment edge remains
TRUE after the move. Therefore the BOM "follows" with ZERO BOM-side work — the same replay over
the same log yields the same tree, and that is the whole guarantee. Any future variant that
changes membership (moving a room to another storey, dragging an item out of a room — Q3/Q4) must
express that change as ops on the same log too, never as a side-table edit.

### 2.7 Refusals
- Room resolves but has ZERO members across all legs → refuse the grab (visible console message);
  nothing honest to move.
- Space not qualified as a room (layer storey / sub-height) → not grabbable.
- Elements in the member set lacking a fid↔guid bridge entry are skipped with a logged count
  (mirror `ridersFor`'s "no guid → no ride"), never guessed.

## §3 — Feature B: free single-item interactive drag

### 3.1 Scope
One non-structural leaf element (fixture/fitting/electrical/FP — anything whose `ifc_class` is
outside `_STRUCTURAL_CLASSES`, or class-UNKNOWN synthetic content). An element that appears as a
`host_guid` in `swXEdges.fills` is a HOST and is excluded from this tool (walls move via gridmove
or Feature A). A FILLING (door/window) may be dragged — per sdg_cascade.js's directional rule it
never drags its host — but its motion is constrained along its real host wall (Q5 scopes v1).

### 3.2 Session start — the gate, up front
`beginItemDragSession(fid)` MUST call `RealPlacementResolver.resolveRealPlacement({discipline,
category, ifc_class, productHint})` before the item lifts:
- **MATCH** → the session holds the real `{width, depth, height, anchor:{requires_host,
  conn_points}, matchedProductId, source}` and the drag begins.
- **NO MATCH** → `WalkerGapError` propagates: the drag REFUSES TO START, the error is logged via
  `console.error` (the resolver already does this), the item does not move. NON-NEGOTIABLE: no
  catch-and-substitute of the element's own AABB or any constant as a stand-in validation box —
  that is precisely the "silent substitution" the gate's header documents as the violation it
  exists to prevent. This is deliberately stricter than pascalorg's `{valid:false}`-and-retry.
  Where the `productHint` key comes from for extracted elements is Q5.

### 3.3 Per-frame validation contract
Modeled on pascalorg's `canPlaceOnWall` *shape* (COMPETITIVE_PASCALORG_HARVEST.md §1) but with the
refuse semantics of §3.2. Pure function, session-cached inputs only:

```js
canDropAt(fid, x, y, z) ->
  { valid: boolean, conflictIds: string[], snappedPos?: [x, y, z] }
```

- **Collision**: AABB overlap of the item's REAL resolved dims (from §3.2, placed at the candidate
  position) against the session's box-by-fid snapshot (the `_gateBoxes`/`_buildBoxByFid` shape),
  excluding the dragged fid itself. Overlaps → `valid:false` with the offending fids listed.
- **Host constraint**: `anchor.requires_host` gates the drop surface — `WALL` items must resolve a
  real wall face under the cursor, `FLOOR` a slab top, `CEILING` a ceiling underside. No real host
  of the required kind at the candidate position → `valid:false`. `snappedPos` is returned ONLY
  when derived from a real host surface (flush-to-face placement — a derivation from real
  geometry, like sdg riding); it is never a nudge-away-from-a-conflict. Unlike pascalorg's
  `adjustedY`, we never return a "corrected" position that converts an invalid drop into a valid
  one — validity is decided at the candidate, corrections only bind a valid drop to its host face.
- Preview tint: green when `valid`, red when not — reuse the gmTint pattern.

### 3.4 Drop behavior
- `valid:true` on pointerup → commit ONE existing-shape op:
  `{ op_type: 'GEOM_MOVE', parameters: { parent: fid, dx, dy, dz } }` via
  `window.Bonsai.oplog.commit` (the same row shape §P8's riders already use, minus `induced` —
  this is a direct user move, not an induced one). No new op type is required for v1 item-drag;
  the fold branch for `GEOM_MOVE` already exists.
- `valid:false` on pointerup → NO COMMIT. The item snaps back to its pre-drag position (session
  cache holds it). Log the refusal with the conflict/host reason. Never place-then-flag, never
  auto-relocate to the nearest free spot.
- Session start refused (§3.2) → the pointerdown is a no-op beyond the logged `WalkerGapError`.

### 3.5 No cascade
A dragged fixture hosts nothing (hosts are excluded, §3.1), so no ride is induced. A dragged
filling stays a one-hop question already answered by sdg_cascade.js's directionality (host does
not follow). BOM: a `GEOM_MOVE` changes no containment edge; if the item crosses a room footprint
boundary the extracted `rel_contained_in_space` edge is now stale relative to geometry — Q3.

## §4 — Non-goals (v1)
- No room ROTATION or SCALE — rigid in-plane translation only.
- No room-to-different-storey move (Q4) and no storey reassignment op.
- No multi-room / marquee move.
- No per-member exclusion during a room drag (§2.5).
- No softening of the placement gate to pascalorg-style adjust-into-validity (§1 item 5, §3.3).
- No new BOM op types — both features ride the existing fold untouched (§2.6, §3.5).

## §5 — Open questions (resolve against live code BEFORE implementing — do not guess)
- **Q1 — space-boundary edges:** does the extracted schema (extractor output / `swXEdges`) carry
  an IfcRelSpaceBoundary-equivalent table for room→bounding-wall membership? Decides whether §2.2
  leg 2 exists in v1 or bounding walls stay put. Check the extractor schema and `cross_edges.js`.
- **Q2 — fold branch site:** exactly where does the `GEOM_ROOM_MOVE` translation fold live —
  `bonsai_kernel_worker.js`, `bonsai_library.js` foldInsert, or both (main + worker paths)?
  `bonsai_gridmove.js`'s header names both for `GEOM_GRID_MOVE`; confirm the pair and mirror it.
- **Q3 — containment staleness:** when an item-drag (or a future partial move) carries an element
  outside its room's footprint, is `rel_contained_in_space` treated as immutable extracted
  substrate (stale until re-extraction, documented), or does a containment-update op need to
  exist? v1 ships with the former unless the live code already has a precedent.
- **Q4 — dz and storeys:** should `GEOM_ROOM_MOVE` hard-reject `dz != 0` at commit (recommended
  for v1 — storey assignment is extracted substrate), or merely not expose it in the UI?
- **Q5 — productHint for extracted elements:** what key maps an IFC-sourced fixture to
  `REAL_PRODUCT_DIM`/`PRODUCT_ALIAS`? `GEOM_INSERT` params carry `ifc_class` (per
  `bonsai_gridmove.js` `_buildInsertMaps`) but the resolver keys on product ids/aliases. Confirm
  what hint the walkers pass today (routewalker/disc_walker call sites) and whether extracted
  fixtures can produce one; where they cannot, the drag refuses (§3.2) — confirm that UX is
  accepted, and whether filling-drag (along-host slide) is in or out of v1 scope.
- **Q6 — conformity gate interplay:** `modeller.html` holds a `_gateBoxes`-based conformity gate
  (referenced by `bonsai_gridmove.js` §STRETCH-RIDE). Does it run on ALL commits automatically —
  i.e. do `GEOM_ROOM_MOVE` / item-drag `GEOM_MOVE` inherit it for free, or must the new tools
  invoke it explicitly like the grid path does?

## §6 — Suggested witnesses
- **W-ROOM-MOVE** — pure-node: seed a small member set, fold `GEOM_ROOM_MOVE`, assert every
  member translated by the same delta, fillings included via `ridersFor`, and `bom_tree.js`
  `foldOps` output unchanged (same tree before/after — the §2.6 guarantee, asserted).
- **W-ROOM-MOVE-ROUNDTRIP** — apply `(dx,dy)` then `(-dx,-dy)`, assert 0.000 mm round-trip
  (the rosetta-invertibility property sdg_cascade.js already claims for rides).
- **W-ITEM-DRAG-GATE** — assert an unmatched productHint refuses the SESSION (no move op in the
  log afterward) and a conflicting drop refuses the COMMIT (log length unchanged).
