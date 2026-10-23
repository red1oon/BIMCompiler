# ⚠ DO NOT REMOVE — Scope guard
# SCOPE: SPEC ONLY, not implemented. Viewer Room Lens (viewer/navigate_find.js) visual highlight
# scheme — habitable-room / corridor category toggles, door-to-door path color+thickness, dark-zone
# marking for non-habitable/MEP islands, and a path-rendering dot-count fix. Grounded against the
# ACTUAL current code (file:line cited throughout), not invented. Read this file first if picking
# this thread up — do not re-grep the same sections, the facts below are already verified.
# OUT OF SCOPE (user explicitly descoped this turn, 2026-07-15): the Modeller disc_walker.js
# equipment-zone/scale-template idea, and the "HHS's rich ARC-only DISC set worth harvesting"
# tangent. Both are separate, real follow-on threads — not written up here, don't fold them in.

# ROOM_LENS_VISUAL_HIGHLIGHT_SPEC — 2026-07-15

## §0 Why this exists
Session context: `FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md` §ISLAND-BRIDGE-SHIPPED just closed the two
real connectivity-graph gaps `RoomGraph.fullConnectivity()` found (Clinic 71.8%→95.7%, HHS 49.4%→
85.2%, PR #794). While confirming the 8 remaining Clinic islands are real MEP/ACMV duct-riser voids
(not a bug), the user asked for a visual language that makes this legible directly in the Viewer:
habitable rooms, corridors, low-traffic/non-habitable suspects, and the door-to-door path should all
read as distinct, toggleable categories — not just a single "the one selected room is purple"
highlight (today's only category-like treatment).

## §1 GROUNDED CURRENT STATE (verified against `viewer/navigate_find.js`, this session — do not
## re-derive, these are file:line facts as of `fix/island-connectivity-bridge` @ `261a9b9`)

**Colors that exist today:**
- `_drawRoomShell()` (L1800-1811): generic room-shell box color, default `0x4fc3f7` (light blue) —
  used for the whole-building Room Lens "shine-through" boxes (`_roomLensOn()`), i.e. EVERY room
  gets this same blue today. Not a category color — just the one default.
- `_drawRoomCuboid()` (L1835-1858): the SINGLE currently-selected room only — soft-purple fill
  `0x9c6ade` (opacity 0.5) + brighter purple wireframe `0xd8b4fe` (double-drawn for a thicker-reading
  border, since `LineBasicMaterial.linewidth` is WebGL-ignored — see §BORDER_STRONG comment). This is
  the ONLY purple in the file today — it is a single-selection highlight, not a category-wide
  "habitable rooms" color as the user's mental model assumed. Confirming this explicitly since it
  changes what "already purplish" means for the spec below: it needs to be EXTENDED to a category,
  not just reused as-is.
- `_drawPathHighlight()` (L1057-1103): the door-to-door path line — neon green `0x39ff14`
  (`§PATH_NEON` comment: chosen specifically to differ from the yellow `0xffd400` used elsewhere),
  `linewidth:3` (silently ignored per the same WebGL limitation), plus a `0.18` radius sphere marker
  at EVERY node in `result.path` to keep the route legible despite the thin line. Non-path room
  shells dim to opacity `0.04`; path-member room shells brighten to `0.55` (no purple/blue swap).
- No door color exists anywhere in this file today — doors are never drawn as their own highlighted
  mesh in the Room Lens. "Brown doors" (§5 below) is a wholly new draw call, not a recolor.

**Group-header tap today (`_roomGroupSelect`, L2259-2276):** tapping a Type-tree group headline
(e.g. "Hall / Corridor", or a storey name) currently does a **contents-isolate** — it queries
`rel_contained_in_space` for every element CONTAINED in that group's rooms and calls `_drillSelect`
(the same generic isolate-highlight mechanism every other lens axis uses). It does **not** touch the
room-shell shine-through boxes at all, and has **no toggle-off** — tapping the same header twice
just re-runs the same isolate query. The user's ask ("click the headline, purplish boxes light up,
click again toggles off") is therefore a **new interaction**, not a tweak of existing toggle logic —
there is no existing toggle to extend.

**Path reconstruction (`common/room_graph.js` `shortestPath()`, L1012-1032 + `_publicHop()`
L829-837):** `path[0]` is always the FROM room's own guid, unsubstituted — `_publicHop()` only
swaps in a door/stair waypoint when arriving at a `circ` node (L831: `n.kind === 'room'` returns the
room guid unchanged, always). For a **direct E1 room-to-room edge** (the two rooms share a door
directly), `path` has no intermediate node at all — just room-center, room-center; no extra dot
exists there today. The "extra dot" the user means only shows up when the FIRST/LAST room in a path
is reached via a **circulation hop** (E2/E9/E7 → spine/CIRC, not a direct E1 neighbor) — the marker
sequence is [room-A-center, ...circulation waypoints..., room-B-center], and the room-center marker
sits very close to (sometimes almost on top of) the corridor-side door the room actually exits
through, reading as a redundant double-dot at the start/end of the route.

**What already exists to build on, additive-only:**
- `RoomHabitability.spaceHabitable()` (`common/room_habitability.js`) — label-keyword + z-band
  classifier, does NOT currently catch Clinic's 8 ACMV/footing islands (they carry generic
  "COMPILED INTERNAL" labels — see `FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md`'s open question on
  whether to extend it with a content-composition signal). This spec's "dark zone" color (§4)
  assumes that decision lands — if the user says "leave it," the dark-zone rule falls back to
  "island in `fullConnectivity()`'s report AND not otherwise classified corridor" (a weaker but
  still real, non-invented signal — see §4).
- `_corridorLabelsFor()` (existing) already identifies which rooms are "Hall / Corridor" for the
  Type tree — the SAME source can drive the bluish corridor-category color, no new classification
  needed for that part.
- `RoomGraph.fullConnectivity()` (this session, `common/room_graph.js`) already produces
  `comp`/`sizes` — a room whose component size is small relative to the building's largest
  component is exactly the "low-traffic/isolated" signal for the dark-zone rule.

## §2 PROPOSED COLOR SCHEME
| Category | Color | Where it applies |
|---|---|---|
| Habitable room (default) | Purple family (extend today's selected-room purple `0x9c6ade`/`0xd8b4fe` to EVERY habitable room, not just the selected one) | Room-shell boxes, Room headline toggle |
| Hall / Corridor | Blue family (today's existing default blue `0x4fc3f7` already reads this way by accident — make it deliberate: corridors keep blue, habitable rooms move to purple) | Room-shell boxes, Hall/Corridor headline toggle |
| Dark-zone (non-habitable / MEP-suspect / genuinely isolated) | A desaturated dark grey/near-black, low opacity — reads as "present but not part of the occupiable network," not alarming-red (red is reserved for the path, see below) | Room-shell boxes, own implicit category (no separate headline needed — see §3) |
| Door-to-door path | ~~Red~~ **SUPERSEDED 2026-07-15c: bright orange** (replace `0x39ff14` green with an orange, e.g. `0xff9100` family — both the line AND the marker spheres, not just the dots — user's own reasoning: red risked clashing/reading ambiguous against the purple+blue room-shell boxes, orange contrasts cleanly against both and won't be misread as an error/danger cue), thicker rendering (bigger marker radius + the existing double-line trick already used elsewhere in this file for `linewidth` workaround — see `_drawRoomCuboid`'s `wire2` duplicate-at-larger-scale pattern, reuse the SAME technique for the path line: 2-3 parallel offset line segments instead of relying on `linewidth`) | `_drawPathHighlight()` |
| Door markers (Path tab only) | Brown | New — every real door in the active building's Path-relevant graph (see §5) |

Selected-room highlight (today's `_drawRoomCuboid`) stays as-is structurally (fill+wire pair) — just
recolor fill/wire to whichever category color applies (purple if habitable, blue if corridor, dark
if a dark-zone room is explicitly selected) instead of a fixed purple regardless of category. This
keeps "selection" legible as a BRIGHTER version of the room's own category color, not a 4th unrelated
hue.

## §3 TOGGLE BEHAVIOR — Room / Hall-Corridor headline
This is genuinely new logic (§1 confirmed no toggle exists today). Proposed shape, reusing the
existing `_roomGroupSelect(gk, groupRooms)` call site (L2400-2401 wires the header tap) as the hook
point, but branching to a NEW function instead of (or alongside) today's contents-isolate:

- Maintain a small module-level toggle state, e.g. `_categoryHighlightOn = null` (either `null`,
  `'habitable'`, or `'corridor'`).
- Tapping "Rooms" (Storey-mode header, or any non-corridor Type-mode header) when
  `_categoryHighlightOn !== 'habitable'`: set it to `'habitable'`, iterate every room-shell box in
  `_roomBoxes`, brighten the ones classified habitable (NOT corridor, NOT dark-zone) to a visible
  opacity in the purple family, dim everything else. Tapping the SAME category again (state already
  `'habitable'`) clears it back to `null` — restore whatever the Room Lens's normal baseline dim/
  bright state was before the toggle (today's `_roomLensOn()` baseline).
- Tapping "Hall / Corridor" is the same shape, targeting `_corridorLabelsFor()`'s member set, blue
  family, `_categoryHighlightOn = 'corridor'`.
- The two are mutually exclusive (tapping one while the other is on switches categories, doesn't
  stack) — matches the existing single-selection mental model this file already uses everywhere
  else (one selected room, one selected group, never a multi-select stack).
- This is ADDITIVE to (not a replacement of) today's contents-isolate tap behavior — needs a
  decision (§6) on whether the category-highlight toggle REPLACES the contents-isolate on header tap,
  or is a separate control (e.g. a small toggle icon next to the header) so both remain available.

## §4 DARK-ZONE MARKING
Per §1's grounding, two possible signal sources depending on the still-open `room_habitability.js`
decision:
- **If extended** (content-composition signal added): dark-zone = `spaceHabitable()` returns
  `{ok:false}` for that room. Clean, single source of truth, matches Duplex's Roof/T-FDN pattern too.
- **If left as-is**: dark-zone = the room's own connected-component (from `fullConnectivity()`'s
  `comp`/`sizes`) is NOT the building's largest component. This is weaker (a genuinely-isolated but
  otherwise normal room would also go dark) but still 100% real/measured, never invented — matches
  the user's own framing ("far away, off flooring, isolated" as the tell-tale).
Either way: dark-zone is a per-room boolean, applied as a THIRD shell-box color state alongside
habitable/corridor — a dark-zone room never gets the purple or blue treatment even under the
category-toggle in §3 (it has no habitable/corridor category to light up under), so it visually
recedes under BOTH toggles, which is the intended "low-traffic, stays quiet" behavior.

## §5 PATH TAB — door markers
When Room axis is in Path sub-mode (`_roomGroupBy === 'path'`, `_buildPathPanel()` L2425), draw a
brown marker at every real door position the active building's `RoomGraph.buildGraph()` graph
carries (i.e. every `doorwp`-kind entry in `graph.nodesByGuid` — already registered today per
§G4-DETOUR-NODES, `common/room_graph.js` L410-414/L424, just never drawn). This is a real, already-
computed position — no new query needed, just a new draw call gated on Path sub-mode being active,
disposed on leaving it (same `_pathExtraMeshes` disposal list `_clearPathHighlight()` already uses).

## §6 DOT-AT-DOOR OPTIMIZATION (path endpoints)
Per §1's `_publicHop()` grounding: the redundant dot only occurs at the path's FIRST and LAST node
when that room's own entry/exit hop is a circulation edge (E2/E9/E7), not a direct E1 neighbor.
Proposed fix, scoped narrowly (does NOT touch `shortestPath()`'s returned `path`/`doors` contract —
purely a rendering-time adjustment in `_drawPathHighlight()`):
- After building `pts` (L1067-1071), check whether `pts.length >= 2` AND the edge feeding the second
  node is a circulation-kind edge whose `wpA`/`wpB` real position is very close to `pts[0]`'s own
  room-center (a real, measured proximity check — e.g. under some small real threshold, not a magic
  number invented without checking real distances first). If so, DROP `pts[0]`'s marker sphere (the
  room-center dot) and let the route visually start from the door waypoint instead — the room itself
  is already fully identified by its own bright shell box (§2/§3), so the room-center dot was purely
  redundant, never the only cue for "this is where the path starts."
- Symmetric check at the tail end (`pts[pts.length-1]`) for the same reason.
- The connecting LINE geometry itself is unaffected either way (still runs through every real point)
  — only the discrete marker SPHERES are trimmed, so the route's actual shape never changes, just
  the dot count at each end.

## §7 OPEN QUESTIONS — needed before implementation starts
1. Does the category-highlight toggle (§3) REPLACE today's contents-isolate header-tap, or live
   alongside it as a separate control? (Affects whether `_roomGroupSelect`'s call site is edited in
   place or a new sibling function/UI element is added.)
2. Dark-zone signal source (§4): wait for the `room_habitability.js` content-composition decision
   (still open in `FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md`), or ship the weaker
   `fullConnectivity()`-component-size fallback now and upgrade later? Either is real/non-invented,
   just different precision.
3. §RESOLVED 2026-07-15b — measured real room-center-to-door distances for every circulation-only
   -reached room (Clinic n=12: min 1.81m/median 2.84m/max 3.54m; HHS n=44: min 0.02m/median 8.46m/
   max 27.38m; Duplex n=2: ~4.95m). Correction to §6's framing above: most of these are NOT
   near-duplicate dots — a room-center sits 2-8m from its own door simply because that's half the
   room's real depth, and that separation is genuine, useful information (conveys room size), not
   clutter. Only the rare near-zero case (HHS's 0.02m outlier — a tiny room whose door sits almost
   exactly at its geometric center) is a genuine redundant-dot case. Threshold: **1.0m** — safely
   above measurement/buffer noise (this codebase's own `DOOR_BUFFER_SLACK=0.20m`) and well below
   every real room-depth separation measured above, so the dot-drop fires only for genuinely
   degenerate/tiny rooms, not the common case (correcting this spec's earlier overstated framing).
4. Should the brown door markers (§5) also appear outside Path sub-mode (e.g. under the Hall/
   Corridor toggle, since doors are what define a corridor bucket) — or strictly Path-tab-only as
   written above? Leaning Path-tab-only per the user's own framing ("when at path tab all doors...
   lighted"), but worth confirming before building.

## §9 UPDATE 2026-07-15b — §Q1 RESOLVED (headline-reveal vs. leaf-drill split)
User's own framing, verbatim intent: the toggle should delight — click "Rooms," ALL rooms go
purplish AND doors go brownish together (a combined reveal, not just rooms alone), and the SAME
reveal applies at any sub-grouping level too (Storey headline, Type "Hall / Corridor" headline,
etc.) — not just one top-level "Rooms" button. User's own reference point: "Stairs already lights
up all" — verified true (`_buildPartsTree()`'s STAIRWAY group tap already isolates every stair
element via `_isolatePartsGroup`). User also flagged a real UX gap independent of the toggle: a
ROOM (leaf) tap zooms in immediately today, which may be premature for a new user who first wants
a sense of "where are the rooms per floor" before committing to one.

**Grounded finding that resolves §Q1**: `_isolatePartsGroup`'s "lights up all" is the SAME
drill-and-isolate model every axis uses (`_drillSelect`, §1 above) — x-rays the rest of the model,
NO toggle-off (only a dedicated "Show All" button resets it), and it's a DRILL (narrows the view),
not a static overview. There is no existing "tap again to clear" pattern anywhere in this file to
extend — confirmed by reading `_drillSelect` end to end.

**Resolution**: split headline-tap from leaf-tap into two deliberately different weights, matching
the user's own diagnosis of the premature-zoom problem:
- **Headline tap (Storey / Type.* / a future Rooms-all / Hall-Corridor-all header) = a NEW, light
  "reveal"**: camera does NOT move, model does NOT x-ray/isolate — every room-shell box in that
  group's set brightens to its category color (purple habitable / blue corridor) AND every real
  door in that same set's rooms lights up brown (§5's door-marker draw, generalized to fire under
  ANY headline reveal, not just Path sub-mode — this supersedes §7 Q4's "Path-tab-only" lean; the
  user's ask is explicitly cross-level, "at any sub category... likewise"). Tapping the SAME
  headline again clears the reveal back to the lens's normal baseline — a real toggle, genuinely
  new, additive alongside (not replacing) today's drill.
- **Leaf tap (one specific room) = UNCHANGED** — keeps today's existing zoom-to-fit + selected-room
  cuboid behavior exactly as it is now. This is the "I know what I want, take me there" path;
  the new reveal is the lighter "let me see what's here first" path — the two coexist because
  they serve different moments in the same task (orient, then commit).
- This means §7 Q1 is resolved as "alongside, not replace": the existing contents-isolate
  (`_drillSelect`) still exists as the DEEPER drill a user can still reach (e.g. long-press, or a
  secondary control — exact trigger is an implementation detail, not blocking the spec), while the
  new reveal becomes the FIRST, lighter thing a headline tap does.
§7 Q4 update: now answered by the above — door-brown-lighting fires at ANY headline reveal level
(Storey/Type/Rooms-all/Corridor-all), not just Path sub-mode. Path sub-mode's own door markers
(§5) stay as originally specced (relevant there for a different reason — showing the door-adjacency
graph a route can use), the two uses share the same brown color/draw call but different triggers.
§7 Q1/Q4 no longer open. §7 Q2 (dark-zone signal source) and Q3 (dot-drop distance threshold)
remain open, unchanged.

## §8 EXPLICITLY DEFERRED (not part of this spec, per user's own descoping this turn)
- Modeller `disc_walker.js` equipment-zone / scale-template idea (large facilities reserving
  designated MEP/ACMV zones, reusing today's ACMV-composition signal as a disc-walk-time classifier
  rather than a Viewer-display-time one). Real, worth its own spec — not written here.
- "HHS's rich ARC-only DISC set — analyse if good to harvest" — a separate rule-mining/onboarding
  question (whether HHS is a good `RosettaStone` source building), unrelated to this Viewer visual
  spec. Not investigated this turn.

## §10 UPDATE 2026-07-15c — TAXONOMY RESOLVED: "Rooms" = habitable only, "Types" houses the rest
User's own framing: **"Rooms" should pertain to HABITABLE rooms only**; **"Types" (the existing
Type sub-grouping, `_roomGroupBy === 'type'`) should house everything else**, and can be richer
than it is today: Hall/Corridor (already exists via `_corridorLabelsFor()`), Restrooms (new),
Stairs (moved from the Parts axis), Utilities (the MEP/ACMV/footing "dark zone" content, made a
real named category instead of just a paint job). Agreed — this is a clean simplification that
also resolves §7 Q2 outright:

**§7 Q2 now RESOLVED as option (a)**: making "Utilities" a real, browsable Type-tree bucket means
its color must be driven by a real classifier, not the weaker `fullConnectivity()` component-size
fallback — so `room_habitability.js` (or a sibling classifier) gets extended with the
content-composition signal from earlier this session (ACMV `IfcFlowSegment`-dominated / STR
`IfcFooting`-dominated, zero real door within a measured radius) to feed this bucket for real,
not a coloring heuristic layered on top of an unrelated metric.

**Restrooms — real signal already exists in the data**, same pattern as the Parts axis's existing
`LIFT_KEYWORDS`/`PLANT_KEYWORDS` word-boundary match (`_buildPartsTree()`, `viewer/navigate_find.js`
~L2568-2576): Clinic's own doors include "M_Toilet Partition:0865 x 1500mm" (seen near First Floor
R58/R59 while diagnosing islands earlier this session) — real evidence a `RESTROOM_KEYWORDS` list
(toilet/WC/restroom/washroom/lavatory) has genuine hits to match against room-adjacent door/element
names, not a guessed category.

**Stairs, moved from Parts — reuses already-built machinery, doesn't add new detection**: Parts'
STAIRWAY group and `room_graph.js`'s `getStairGroups()` (built this session for E3 floor-bridging,
§STAIR-GROUPS) already derive the SAME real stair data (flight-first/assembly-fallback query,
grouped to one entry per physical stair). The Type tree's "Stairs" bucket lists `getStairGroups()`'s
own `order`/`groups` directly — no new query, just a new consumer of data this session already
built and trusts.

**§RESOLVED 2026-07-15d**: Lift Shaft / Plant Room move too — **the Parts axis is retired
entirely** as redundant once Stairs/Lift Shaft/Plant Room/Restrooms all live under Room > Type.
Concrete migration surface (`viewer/navigate_find.js`, all in this one file, no cross-file
dependency beyond the keyword lists which get REUSED not deleted):
- `_PARTS_GROUPS` (L702) — the 3 group definitions (STAIRWAY/LIFT_SHAFT/PLANT_ROOM) migrate to
  become 3 new Type-tree buckets in `_buildRoomTree()`'s `typeKey` classification (alongside the
  existing Hall/Corridor/Restrooms/Utilities buckets from §10 above) instead of their own axis.
- `LIFT_KEYWORDS`/`PLANT_KEYWORDS` word-boundary match constants — kept, just called from the Room
  Type classifier instead of `_buildPartsTree()`.
- `_buildPartsTree()` (L2551), `_isolatePartsGroup()` (L2533) — retired; their group-tap behavior
  is superseded by the Type-tree's own leaf/headline tap (§9's reveal-vs-drill split applies here
  too — a "Stairs" headline reveal, not a Parts-style isolate).
- Axis-pill wiring (`present.parts` gate L791, `_treeMode === 'parts'` dispatch L617) — removed;
  Room becomes the one axis a user reaches ALL of Rooms/Hall-Corridor/Restrooms/Stairs/Lift-Shaft/
  Plant-Room/Utilities through, via Storey or Type sub-grouping.
- `bldClass !== 'complex'` PLANT_ROOM gate (§PLANT_ROOM_GATE_FIX, L2559) carries over unchanged —
  still a real, building-class-gated exclusion, just re-homed under the Type classifier instead of
  the Parts tree builder.

**This spec is now fully resolved** — every §7 open question (Q1/Q2/Q3/Q4) plus the taxonomy
reorg is answered as of 2026-07-15d. Ready for a scoped implementation pass whenever picked up;
nothing left to ask before building.

## §11 SHIPPED 2026-07-15e — built end to end, committed locally, NOT pushed
bim-ootb worktree `/tmp/wt-room-lens-taxonomy`, branch `feat/room-lens-taxonomy-reveal` (off
`origin/main` post-PR #794), commit `388a585`. Every section above (§2 colors, §3 reveal toggle,
§4 dark-zone/Utilities, §5 door markers, §6 dot-drop, §10 taxonomy, §Q1-Q4) is built:
- `common/room_habitability.js`: new `utilityContentClass()` — ACMV `IfcFlowSegment`/STR
  `IfcFooting` content-composition signal, verified against Clinic's exact measured 6+1=7 rooms
  (R56 correctly left unclassified — no real signal, not padded to a round number).
- `viewer/navigate_find.js`: Restrooms (keyword-matched via `rel_contained_in_space`,
  `RESTROOM_KEYWORDS`), Stairs (reuses `RoomGraph.getStairGroups()`, a real improvement over the
  old Parts axis's over-counted raw flight rows), Lift-Shaft/Plant-Room (migrated verbatim from
  the now-retired Parts axis/`_buildPartsTree()`, deleted). Category colors
  (`ROOM_CATEGORY_COLORS`) wired into both `_roomLensOn()` (whole-building shells) and
  `_drawRoomCuboid()` (selected room). Path recolored orange (`_drawPathHighlight()`), 1.0m
  dot-drop implemented. New `_revealCategoryGroup()`/`_clearCategoryReveal()` wired into every
  Storey/Type headline tap (old `_roomGroupSelect` deleted — dead code once superseded); leaf tap
  (`_roomSelect`) unchanged, now also clears any active reveal on selection.
- Found + fixed a real, pre-existing crash in `witness_room_graph_path.js` while regression-testing
  (traced to the EARLIER PR #794 E9 fix — a door guid can legitimately sit directly in
  `shortestPath()`'s `path[]` now, which that witness's hop-verifier never anticipated) — fixed to
  skip such hops honestly instead of crashing or asserting something false.
- **Verified**: every existing witness/sandbox green (see commit message for the full list) +
  live Playwright against real Clinic AND HHS buildings on localhost — category counts, Type-tree
  group names, path color/rendering, and the reveal toggle (on/off, both Storey and Type level)
  all confirmed actually running in-browser, not just offline (the exact class of mistake named
  in this file's own §MOST IMPORTANT LESSON was checked for and did not recur).
**Known, deliberately-not-fixed pre-existing quirk carried over unchanged**: "Plant Room" matches
~1700-1900 individual duct/vent/fan-named elements on both Clinic and HHS (coarse keyword match,
inherited verbatim from the old Parts axis, not something this pass introduced or was asked to
tighten) — now more exposed inside the Type tree than it was as a separate axis; flag for the user
to decide whether to narrow it, not decided unilaterally here.
**Pushed + PR'd 2026-07-15 (user go-ahead)**: bim-ootb PR #795, open, auto-merge armed (squash) —
will land as soon as CI goes green. Nothing further needed unless CI turns up something real.

## §12 UPDATE 2026-07-15f — 2 real bugs found via live user testing on Hospital, both fixed+pushed
User drove the live build on Hospital (63182 elements, 311 rooms — the largest real building in
the fleet) and found two real regressions this spec's own build introduced, neither caught by the
Clinic/HHS-only verification in §11 (both buildings are ~100-120 rooms, small enough that the bugs
below never surfaced there):
1. **Perf hang**: `utilityContentClass()` ran 2 SQL queries PER ROOM — fine at Clinic/HHS scale,
   but 600+ unbatched WASM sql.js queries on Hospital's 311 rooms every time the Room axis was
   entered, reported as the canvas hanging/going blank. Fixed: `room_habitability.js` gained
   `classifyUtilityRooms()` — same signal, exactly 2 queries total regardless of room count (fetch
   every candidate element/door ONCE, classify all rooms via in-memory loops over the small
   pre-fetched lists). Both `navigate_find.js` call sites switched to it.
2. **Stairs/Lift-Shaft/Plant-Room never toggled off**: unlike the new category reveal (§3), the
   raw Parts-migrated groups (`_isolatePartsGroup`) had no toggle-off — user's own diagnosis
   ("stairs does not untoggle" / "plants/stairs untoggle each other" — confirming cross-group
   switching worked, only same-group-twice didn't) pinpointed it exactly. Fixed with the same
   toggle shape the reveal already has.
**Verified** live on Clinic (deliberately, not Hospital — isolates "did the fix work" from "how
long does Hospital's 229MB mesh download take," which is real asset weight unrelated to either
fix and was never going to change). Committed `a26c51c`, pushed, folded into PR #795.
**Also raised, correctly deferred as separate concerns, not fixed this pass**:
- Real door mesh/box instead of a sphere marker for the brown door lights (§5) — user's own call:
  "nice to have... not urgent."
- **Path rendering "x-crossings" on long Clinic corridors** — user's own diagnosis, independently
  matching a real, precise root cause: `CIRC::storey` (the per-storey stair-circulation bridge
  node in `room_graph.js`) is a single AVERAGED position across all of that stair's flight rows,
  not the stair's own real location — so a route needing to reach a stair can pass through this
  averaged point instead of hugging the real stair, visually detouring toward an unrelated
  adjoining space "when the stairs is just right there" (user's own words). User's own proposed
  fix shape: a `closeby`-style verb — prefer a genuinely near real waypoint (stair/door) over a
  topologically-valid-but-longer route, matching this codebase's existing verb-chain pattern
  (`hallway_backbone.js`'s `doorEdge → correlateDoorEdges → joinDoorways → growToWall →
  terminateAtStair → walkBackbone`). NOT investigated further or fixed this session — lives in
  `room_graph.js`/`hallway_backbone.js`'s pathfinding topology, a different concern from this
  spec's visual-taxonomy scope. Worth its own session.

## §13 NEXT-SESSION FOCUS (user's own framing, 2026-07-15g) — Find panel per-tab-switch heaviness
**Precise problem, distinct from both §12 items above**: Alt-X's bbox-shell already gives the user
an easy escape hatch from INITIAL load heaviness on a large building — that part is a known,
already-mitigated cost (real mesh download/decode, e.g. Hospital's 229MB, unrelated to any Viewer
logic). The heaviness the user is flagging now is different: **switching axis TABS within the
already-open Find panel** (Storey→Type→Room→Material→Phase, or back) itself takes several real
seconds on a large building — a live-interaction cost, not a one-time load cost.
**What's already known, so next session doesn't need to re-derive it**:
- Every axis switch on the Room tab re-runs `_roomLensOn()` from scratch (`_allRoomVolumes()` full
  query + up to 311 real `THREE.Mesh` shell creations, even though the underlying `RoomGraph`/
  `HallwayBackbone` computation itself IS already cached per building — confirmed live: the verbose
  `§HALLWAY_BACKBONE`/`§ROOM_GRAPH` log block only printed once per building load, not on every
  re-entry to the Room axis).
- The Phase axis's own rebuild (`§GANTT` in the pasted Hospital log) computes storey-z-bands over
  EVERY element in the building (thousands per band) — also worth checking whether this is cached
  across re-entries or recomputed each time, same question as Room's shell rebuild.
- `§LENS_PROBE` fires multiple times per single axis-toggle click in the captured logs (several
  `A.db.exec()` COUNT queries each) — worth checking whether this is genuinely needed that many
  times per toggle or a redundant-call pattern.
- **Method for next session**: profile a real large-building axis switch (Hospital or Terminal)
  with real timing instrumentation (not guessed) — identify which specific step(s) dominate the
  several-seconds cost, THEN decide what to cache/batch, same discipline this session used for the
  Utilities-classification fix (measure first, don't guess a fix). Do NOT assume it's the same root
  cause as §12's fix (that one's already resolved) — treat this as a fresh measurement task.
- Also on the table, not yet acted on: extending the EXISTING mobile-only bbox-shell auto-trigger
  (`_MOBILE-BBOX-DEFAULT`, gated on `window._isMobile`) to also fire on desktop by element-count,
  so a large building gets the light shell by default — a much smaller, already-proven-code change
  than optimizing mesh transfer/decode itself. Separate from the tab-switch question above (this
  one's about INITIAL load weight, not per-tab-switch cost) but related enough to consider together.

## §14 UPDATE 2026-07-15h — session picking up §12/§13's punch list, all 4 items closed

bim-ootb worktree `/tmp/wt-room-lens-next`, branch `fix/room-lens-path-perf` (off `origin/main` post-
PR #795), 5 commits, **committed locally only** (standing PUSH PAUSE — not pushed, no PR).

**Item 2 — path x-crossing, FIXED (`room_graph.js`).** Root cause pinned down via code-read then
proven live, not guessed: E6 (`§CIRC-PER-CHAIN-BRIDGE`) edges — the same-storey bridge from a real
corridor spine chain onto the per-storey `CIRC::<storey>` hub — never carried a `wp` field, so
`_publicHop()`'s circ-substitution (its only defence against exposing an internal bookkeeping node)
fell through to the raw `CIRC::<storey>` guid whenever a route arrived there via E6. That guid's own
`(cx,cy)` is just whichever physical stair group's AVERAGED flight position happened to create the
node first (`circNode()`, called from E3) — unrelated to the corridor chain actually being crossed.
Fix: E6 edges now carry `wpA = sp.guid` (the real spine point this edge bridges from), same
closeby-verb shape E3 already uses for stair hops. **Proven on real HHS data**: built the graph
before/after via `git stash`, ran the SAME query (`RM_Level_1_1 -> RM_Level_1_5`, the only pair
whose sole connection is through CIRC, confirmed by BFS with circ nodes excluded) — pre-fix hop 9
resolved to the raw `CIRC::Level 1 (-0.90,12.12)`; post-fix it resolves to
`SPINE::Level 1|y|-4.80`, a real corridor point. Scanned 2145 Clinic room-pairs post-fix: zero raw
CIRC exposures. `witness_room_graph_path.js` 15/15, `witness_backbone_routing.js` 10/10 (incl. the
real cross-floor stair path, unchanged).

**Item 4 — desktop bbox-shell threshold, BUILT (`navigate_find.js`).** Extended
`_MOBILE-BBOX-DEFAULT` to fire on desktop too via a new `_isLargeBuilding()` — cached
`COUNT(*) FROM elements_meta` against a 25000-element threshold, grounded in this session's own
measurement of the real fleet (`buildings/*_extracted.db`): Clinic=16114, HHS=6880 vs.
Terminal=48428, Hospital=63415 — clear margin either side, not a guessed round number. **Verified
live** (Playwright against the real dev server, §-log first): Terminal logs
`§LARGE_BUILDING_CHECK large=true` + `§BBOX_SHELL_DEFAULT` on a Storey-group Find drill; HHS logs
`large=false` and keeps the rich x-ray path.

**Item 3 — door markers, real box instead of sphere, BUILT (`navigate_find.js`).** The brown
"door lights" `_revealCategoryGroup()` draws for a Type-tree category tap (Restrooms/Utilities/
Hall-Corridor) now draw a `BoxGeometry` sized to the door's own real `bbox_x`/`bbox_y`/`bbox_z` +
yawed by its real `rotation_z` (one batched `element_transforms` query per reveal, same discipline
as `classifyUtilityRooms` below) instead of a fixed-radius sphere — falls back to the sphere per-
marker only if a door is missing dims, never fabricates a size. **Verified live** on HHS's
Hall/Corridor category: `§DOOR_MARKER_SHAPE boxes=17 spheres(fallback)=0`.

**A genuine, unrelated regression found and fixed along the way**: `§12`'s own perf fix
(`classifyUtilityRooms()`, batching the Hospital-hang N+1 query bug down to 2 queries total) was
committed as `a26c51c` on the OLD `feat/room-lens-taxonomy-reveal` branch — but PR #795 had already
squash-merged an EARLIER commit on that same branch (`388a585`) before `a26c51c` was pushed, so
`a26c51c` was never an ancestor of the merge and never reached `main` (confirmed:
`git merge-base --is-ancestor a26c51c f82333d` → false). Exactly the squash-merge-orphan landmine
this project's own CLAUDE.md already names (PR #138, 2026-06-05). **The Hospital-hang bug §12
reported as fixed was still live in production this whole time.** Recovered by cherry-picking
`a26c51c` cleanly onto this branch (`06d6454`) — `classifyUtilityRooms` now genuinely exists in
`common/room_habitability.js` and both `navigate_find.js` call sites use it.

**Item 1 — Find-panel per-tab-switch heaviness, INVESTIGATED, one real fix shipped, full Hospital
number not captured (sandbox limit, not a code question).**
- Code-read found and fixed a confirmed redundancy: a single axis-toggle tap called `_axes()` (→
  `_probeLenses()`, ~4 real COUNT queries against `A.db`) TWICE — once in the toggle button's own
  handler (to compute the next axis), again inside `_setTreeMode()`'s `_renderAxes()` (to redraw
  the button). Collapsed into one real probe per tap via a 50ms TTL memo (`§PROBE-DEDUP`),
  invalidated on data changes exactly like the existing `_phaseCache` reset on a fresh
  `openFindPanel()`. **Verified live on Terminal**: `§LENS_PROBE_DEDUP_HIT` fires on the second
  `_axes()` call every single tap; the real probe itself costs 9-49ms (small but non-zero, now
  paid once instead of twice).
- Added permanent `§PERF_PROBE` timing (real `performance.now()`, not estimated) around
  `_setTreeMode()`, `_probeLenses()`, `_allRoomVolumes()`, and `_roomLensOn()` — the exact four
  functions this file's own §13 named as candidates. These ship in the code now, so the next
  session (or the user, live) gets real numbers the instant the Room axis is entered — no more
  guessing.
- **Real numbers captured live on Terminal** (48428 elements, 75 real rooms — Room axis WAS
  present; an earlier attempt this session wrongly concluded Terminal "has no room data" because
  the test queried before `window.APP.db` was populated — `window.APP.dbQuery` alone was ready
  much earlier and is a DIFFERENT handle; corrected once caught):
  - `_allRoomVolumes()`: 61.5ms cold-tab-entry, 30.0ms on re-entry — the SQL query + JS
    room-descriptor build, not the mesh creation.
  - `_roomLensOn()` (the full shell-mesh rebuild, wrapping the above): 65.4ms / 33.1ms — confirms
    `_allRoomVolumes()` IS ~93% of `_roomLensOn()`'s own cost; the THREE.Mesh construction loop
    itself is cheap (~3-4ms for 75 rooms).
  - `_setTreeMode('room')` end-to-end (probe + lens rebuild + tree DOM build): 107.5ms first entry,
    35.9ms second entry — on a 75-room/48k-element building this is NOT multi-second; it's
    sub-150ms, with the first-entry number likely inflated by JIT/cold-cache effects rather than a
    different code path.
  - Storey/Disc/Material/Phase entries: 1-60ms, no outliers — Phase's own `_phaseCache` (checked-
    before-recompute, only reset on a fresh panel open) is confirmed NOT a repeat-cost contributor
    within one session, settling the open question this file's own §13 text raised about it.
  - **Extrapolation, not measured**: Hospital has ~4x Terminal's room count (311 vs 75). If
    `_allRoomVolumes()` scales roughly linearly with room count (plausible — it's a single query +
    a flat JS loop, no evident quadratic step), Hospital's Room-axis entry would land somewhere
    around 150-260ms — still not obviously "several seconds" on its own. **This means
    `_roomLensOn()`/`_allRoomVolumes()` alone may not fully explain a multi-second complaint at
    Hospital's real scale** — worth treating as an open question for whoever next has a real
    Hospital session, not a closed one.
  - **What was NOT captured**: the live Hospital number itself. `buildings/Hospital_extracted.db`
    is 263MB (combined mesh+meta, not metadata-only) — streamed too slowly/inconsistently (85s in
    one isolated run, 150s+ timeout in another, same server, same file, no code change between
    runs) over a single-threaded local `python3 -m http.server` for a stable measurement in this
    sandbox. This is a serving-path/sandbox limitation (the real OCI/CDN production path is a
    different, likely much faster story), not a code question — and it's exactly why the permanent
    `§PERF_PROBE` lines above matter: the next real Hospital session gets the number for free from
    the console, first Room-axis tap, no re-instrumentation needed.

## §15 UPDATE 2026-07-15i — Hospital corridor coverage is genuinely sparse, hampers room-to-room
paths (user-reported live, relegated to a follow-up session, NOT fixed this pass)

**Real data, not guessed** — `common/room_graph.js` + `common/hallway_backbone.js` run directly
against `buildings/Hospital_extracted.db` (node, `RoomGraph.buildGraph`):
```
§HALLWAY_BACKBONE buckets=336 joined=15 chains=11 crossings=4 openEnds=2 stairTerminated=1 stairGroups=10
§CORRIDOR_ROOM_BACKPROP injected=6 skippedOverlap=9 / 15 joined buckets
```
Only **15 of 336** candidate wall-bucket segments (4.5%) actually joined into a corridor chain.
Distance comparison, same graph:
- **E5 edges** (real hop between two points already inside ONE joined chain): min=2.4m,
  median=2.4m, max=27.0m — only 4 of these exist at all.
- **E6 edges** (the CIRC-hub bridge from a chain to the "nearest" other chain on the same
  storey — see §12/§14's E6 closeby-render fix, already shipped): 17.8m up to **52.6m**, 11 of
  them, e.g. `Level 4 dist=52.6m CIRC::Level 4 <-> SPINE::Level 4|x|63.60`.

**Diagnosis**: this session's E6 render fix (§14) makes a route crossing one of these edges draw
at the real bridge point instead of a fake averaged centroid — genuinely correct as far as it
goes — but it can't shrink the underlying 20-50m gap, because that gap is REAL: so little of
Hospital's wall geometry got recognized as corridor (15/336 buckets) that most inter-wing routes
have no detected corridor to hug at all, only this one bridging edge. That's the mechanism behind
the user's report: "Hospital corridors not accurate and hampers room to room paths."

**Root cause, not yet located precisely**: `hallway_backbone.js`'s `walkBackbone()` bucket-joining
criteria (span/width/alignment thresholds — see that file's own header for the verb chain
`doorEdge → correlateDoorEdges → joinDoorways → growToWall → terminateAtStair → walkBackbone`) is
either too strict for Hospital's real wall geometry, or Hospital's actual corridor walls have
gaps/offsets the current join logic doesn't bridge. **Not fixed this pass** — tuning the join
threshold is real algorithm work with real regression risk: HHS and Clinic currently pass their
witnesses (`witness_backbone_routing.js` 10/10, `witness_room_graph_path.js` 15/15) against the
CURRENT threshold — loosening it blind to fix Hospital could break those without a witness added
FOR Hospital first to catch a regression the other two wouldn't reveal.

**For the next session**: add a Hospital-specific join-ratio assertion to
`witness_backbone_routing.js` (or a new witness) BEFORE touching `walkBackbone()`'s thresholds, so
a threshold change is provably a net improvement on Hospital without silently regressing HHS/Clinic's
already-passing numbers — same measure-first discipline this whole file's sessions have used
throughout. Re-run the diagnostic script pattern above (`RoomGraph.buildGraph` + bucket/chain/E5/E6
distance dump) after any threshold change to confirm the join ratio actually improved, not just
that witnesses still pass.

## §16 UPDATE 2026-07-15j — the baseline witness §15 asked for is now BUILT (still NOT a threshold
fix — thresholds untouched, per the standing PUSH PAUSE this ran locally-only, no push/PR)

**`bim-ootb/witness_hospital_corridor_baseline.js`, new file, branch
`fix/hospital-corridor-baseline-witness` (worktree `/tmp/wt-hospital-corridor-baseline`, off
`origin/main` @ `3675ec3`, so it already carries #795/#796/#797 — this matters, see below).
Committed locally only, not pushed.** Re-measured fresh against the current code (not re-quoted
from §15's numbers) via `HallwayBackbone.buildBackbone()` directly on all three real DBs:
```
§CORRIDOR_JOIN_RATIO building=Hospital buckets=336 joined=15 ratio=4.5% chains=11 crossings=4
§CORRIDOR_JOIN_RATIO building=Clinic   buckets=113 joined=38 ratio=33.6% chains=15 crossings=39
§CORRIDOR_JOIN_RATIO building=HHS      buckets=39  joined=15 ratio=38.5% chains=12 crossings=3
```
Hospital's `buckets=336 joined=15 chains=11` exactly reproduces §15's own numbers — confirms
nothing drifted between sessions. 5 assertions, 5/5 pass: G1/G2 pin Hospital's CURRENT ratio+chain
count as a floor (not a target — a threshold fix must push these UP, a run that still lands here
did not help); G3/G4 pin Clinic (33.6%) and HHS (38.5%) as regression floors so a threshold change
that helps Hospital by over-joining unrelated segments elsewhere gets caught; G5 asserts the actual
finding (Hospital's ratio is <1/2 of either working building's — a real geometry gap, not noise).

**One real landmine found and worked around while building this, worth recording**: the main
`bim-ootb` checkout (`/home/red1/bim-ootb`) was stale at `3f7386d` (missing `d5ea49f`/`3675ec3`,
i.e. PRs #796/#797) with two unrelated uncommitted local edits (`common/history_tap.js`,
`viewer/viewer.html` — left untouched, not this session's). Running the diagnostic against THAT
stale `hallway_backbone.js` gave DIFFERENT numbers for HHS (`chains=10 crossings=5` instead of the
correct `chains=12 crossings=3`) — silently, no error, because #792's "corridor plausibility
framework" (width bounds / common-sense filter / shape guard / full connectivity) landed on main
between those two commits and changes `walkBackbone()`'s behavior. **A stale checkout doesn't just
risk missing a fix — it can produce plausible-looking WRONG measurements with no signal that
anything is off**, same category of landmine as this project's own `git -C ~/bim-ootb fetch &&
merge --ff-only origin/main` Session-Startup rule exists to prevent, just hit on the bim-ootb side
this time. Worked around by building in a fresh worktree off `origin/main` (per Worktree Hygiene:
checked `git worktree list` first, none existed for this task, `buildings/*.db` gitignored
data caches symlinked in rather than copied — Hospital is 263MB, Clinic 128MB, neither
git-tracked at all, only HHS + warehouse are LFS-tracked).

**Next session**: this witness is the regression net — go tune `walkBackbone()`'s join thresholds
in `common/hallway_backbone.js` (span/width/alignment criteria, see that file's own header), re-run
`node witness_hospital_corridor_baseline.js`, and confirm Hospital's ratio climbed past 4.5% while
G3/G4 (Clinic/HHS floors) still hold. If Hospital's ratio moves, update G1/G2's asserted baseline
numbers to the new measured values in the same commit as the threshold change — this file's numbers
must always describe the CURRENT code, never a stale snapshot (exactly the landmine above).

## §17 UPDATE 2026-07-15k — root cause found and fixed, NOT a threshold change: Hospital join
ratio 4.5%→17.8% (pushed, branch `fix/hospital-corridor-baseline-witness`, PR not yet opened)

**`correlateDoorEdges()`'s bucketing was a fixed-rounding grid** (`Math.round(runCoord/tol)*tol`)
— two doors genuinely `tol` (0.6m) or closer in real space still landed in DIFFERENT buckets
whenever their raw runCoords straddled a grid boundary (e.g. 10.36→10.2, 10.56→10.8 — 0.6m apart
on the grid despite being only 0.20m apart in reality). A pure artifact of the grid's fixed phase,
not a real geometric signal — and it disproportionately hurt Hospital because its much larger,
more-boundary-crossing bucket count (336 vs 113/39) meant many more chances for a real cluster to
straddle a boundary. Fixed with single-linkage gap clustering (per storey+axis, sort by runCoord,
new bucket only when the gap to the PREVIOUS door exceeds `tol`) — same tolerance, no threshold
loosened. Measured, no guessing:
```
Hospital: buckets 336->241, joined(>=3 doors) 15->43, ratio 4.5%->17.8%, chains 11->16, crossings 4->37
Clinic:   buckets 113->97,  joined 38->41,            ratio 33.6%->42.3%
HHS:      buckets 39->31,   joined 15->15,            ratio 38.5%->48.4%
```
All three improved or held — not a Hospital-vs-others trade-off, confirming the grid-boundary
artifact theory rather than a lucky threshold tune. Deeper check against the actual user symptom
(`RoomGraph.buildGraph` E5/E6 dump, same diagnostic as §15): Hospital's real-corridor-hop (E5)
edges went **4→37** — far more room-to-room routes now traverse a real spine waypoint instead of
falling through to the single long E6 CIRC bridge (17.8–52.6m) that directly caused "Hospital
corridors not accurate and hampers room to room paths". E6's own worst-case distance (30-52m)
didn't shrink — some wings are genuinely far apart with no detected corridor between them, a
separate, real, still-open gap — but far fewer routes now need to use it at all.

**Verification**: all 8 witnesses touching `hallway_backbone.js`/`room_graph.js` re-run green —
`witness_backbone_routing` 10/10, `witness_hallway_backbone` 7/7, `witness_corridor_room_backprop`
5/5, `witness_full_connectivity` 6/6, `witness_corridor_type_label` 3/3,
`witness_stair_flight_assembly_merge` 4/4, `witness_room_graph_path` 15/15,
`witness_hospital_corridor_baseline` 5/5 (its G1-G4 floors updated to the new numbers, same commit
as the fix, per §16's own instruction not to bump the number without re-measuring). This was
whitebox-verified (§-log discipline) via the node witness suite against real building DBs, not a
live browser session — pure algorithm/data-module change, no UI touched.

**Not yet done**: PR not opened (branch pushed only, per user's "push for me to check"). Hospital's
17.8% ratio is still well below Clinic/HHS's ~45% — the deeper gap (wing-to-wing wall segments with
genuinely no detected corridor between them) is real building geometry, not a bucketing artifact,
and remains open for a future session.

## §18 UPDATE 2026-07-15l — same session, room-cuboid shine-through fix (pushed) + two more
live-testing findings scoped for next session (NOT fixed this pass)

**Fixed, pushed (same branch `fix/hospital-corridor-baseline-witness`)**: room-select purple cuboid
didn't shine through in solid/x-ray mode (only bbox), user-reported live. Root cause confirmed live
via Playwright + console inspection: `_roomSelect()` always auto-enables X-Ray if it wasn't already
on, and `A.toggleXray()` sets `A.renderer.sortObjects = !A.xrayOn` (a real perf optimization,
`viewer/tools.js`). With `sortObjects=false`, three.js ignores `renderOrder` entirely and paints in
raw scene-graph insertion order — `_drawRoomCuboid()` used to run BEFORE `_drillSelect()` (which
builds the context/ghost overlay meshes), so the cuboid was added to the scene FIRST and the
overlays painted over it. Fix: swap call order so `_drillSelect` runs first, cuboid last — always
top-painted regardless of `sortObjects` state. Full click-through Playwright screenshot proof hit
the same nested-row targeting friction PR #797's own commit already documented (not re-litigated);
shipped on the confirmed mechanism + a minimal, low-risk 2-line reorder, same discipline #797 used.

**Item 4 — Hall/Corridor Type-tree list is "mostly rooms" (LTU_AHouse, PRODUCTION site,
`red1oon.github.io/bim-ootb`, screenshots `~/Pictures/Screenshots/HallCorridors.png` +
`RoomsPath.png`)**: user's proposed fix is a boolean gate — real corridor = not a room itself, is
larger, has doors from RESPECTIVE (distinct) neighboring rooms. Investigated `classifyCorridorRooms()`
(`common/hallway_backbone.js`) against `LTU_AHouse_extracted.db` — **first pass wrongly concluded a
"4187m² room" bug (a real column-indexing mistake in an ad hoc diagnostic script, since corrected)**.
Corrected numbers: 36/369 rooms classified, real areas 4.6–111m², aspect ratios 2.4–13 — not
obviously wrong by shape alone. Backbone data underneath is solid: 62 real door+wall-verified
buckets, widths 1.2–5.9m, spans to 127m, 3–27 doors each. So the false positives (if real) are
likely small rooms/closets that happen to satisfy the 50%-overlap-with-a-bucket test without
actually being the shared through-space — exactly the gap the user's "doors from RESPECTIVE rooms"
framing targets: today's algorithm never checks whether a candidate connects to MULTIPLE DISTINCT
neighboring rooms via their own doors, only that 50%+ of its own area sits inside a real corridor
bucket rect. **User's explicit instruction: measure the real per-room distinct-neighbor door count
on LTU_AHouse FIRST, grounded, before changing `classifyCorridorRooms()`** — same discipline as the
Hospital join-ratio fix (§16). Not started.

**Item 5 — path cuts straight through open/illegal space instead of hugging a walkway (HHS
Office, "L shaped... instead of along a walkway"; also visible in `RoomsPath.png`'s 181.7m detour on
LTU_AHouse)**: root cause CONFIRMED live via instrumented `RoomGraph.shortestPath()` runs against
`HHS_Office_Federated_extracted.db` (all 14×13/2=91 real room pairs) — `common/room_graph.js`'s own
`_legalizePath()`/`_detourForChord()` mechanism (§PATH_LEGAL_SEGMENTS.md) IS running and DOES detect
illegal (space-cutting) chords correctly (HHS has real per-storey `roomRectsByStorey` (10/7/4 rects)
+ `corridorRectsByStorey` (6/4/3 rects) from this session's own backbone fix, not the "no data at
all" null-case) — but `§PATH_LEGAL_DETOUR_FAIL storey=Level 1/2/3 no legal detour among 38-50 doors`
fires CONSTANTLY across room pairs (dozens of times in a 91-pair sweep). Mechanism: `_detourForChord`
builds a small visibility graph from doorwp/spine/circ waypoints and only connects two waypoints if
the chord BETWEEN THEM is also legal (same `_chordIllegalCount` sparse-rect test) — with HHS's real
coverage this sparse (~10-15 rects covering a much larger real floor), most candidate-to-candidate
edges in that small graph ALSO fail the legality test, so often NO legal multi-hop chain exists at
all. Per `_legalizePath()`'s own documented "honest degrade" (never invents a waypoint that isn't a
real door), the original straight illegal chord is then left AS-IS in the rendered path — exactly
the visible symptom. **Real fix needs BROADER walkable-floor evidence** (more rect coverage, or a
different real-geometry source e.g. floor/slab polygons) so the detour visibility graph has enough
legal edges to route on, not a quick parameter tweak. Scoped, not started — pair with item 4's
measurement pass, likely same investigative session since both stem from HHS/LTU's real coverage
being thin relative to Clinic's (which has 4x the walls per real floor area, per this session's own
§16 numbers).

**Housekeeping note**: this file is now 630+ lines — candidates for archiving as single-line
pointers once §14-§18's open items (Hospital's remaining gap, items 4/5 above) close out.

## §19 UPDATE 2026-07-15m — items 4 and 5 both fixed and pushed (same branch), item 5 PARTIALLY
closed — the deeper sparse-coverage gap is still open

**Item 4 (Hall/Corridor false positives) — FIXED.** Measured the distinct-neighbor-room door count
§18 called for, on LTU_AHouse: reused the SAME door-to-2-nearest-rooms resolution
`room_graph.js`'s own E1 edges already trust (no new heuristic). Of the 36 rooms LTU_AHouse's old
shape+overlap gate classified as corridor, 20 connect to 0-1 distinct other rooms via a real
door — narrow dead-end slivers, not shared through-spaces; the 16 kept span neighbors=3..22,
plausible real junctions. Added `minDistinctNeighborRooms: 2` to `classifyCorridorRooms()`,
AND-combined with the existing aspect-ratio + overlap-fraction gates (never loosens what they
already exclude). Verified against Clinic (where aspect-ratio was originally grounded, 2026-07-14):
drops exactly its 6 zero/one-neighbor false positives, keeps "Second Floor R7" — the ORIGINAL doc
comment's own canonical true-positive example (16x4.6m, 9 neighbors) — confirming the new signal
agrees with the old one rather than fighting it. Measured effect: Clinic 9→3, HHS 2→0 (its real
entries come from the separate `CORRIDOR_ROOM::` backprop mechanism, unaffected), LTU_AHouse 36→21.
`witness_corridor_type_label.js` updated to independently re-derive the neighbor count from scratch
and gained 2 new assertions proving the drop is real (5/5 pass, was 3/3).

**One real mistake caught and corrected mid-investigation, worth remembering**: a first diagnostic
script had a column-indexing bug that produced a bogus "4187m² room" false-positive claim — caught
by re-deriving with correct indices before acting on it. Verify diagnostic scripts' own column
mapping against a known-real value before trusting a surprising number, especially ad hoc ones
written under time pressure.

**Item 5 (path cuts through open space) — PARTIALLY fixed.** Root cause pinned to an EXACT chord
via instrumented `RoomGraph.shortestPath()` runs (not a guess): `SPINE::Level 1|y|-4.65 ->
SPINE::Level 1|y|10.56` (HHS, 18.3m, 58/75=77% of sampled points illegal). This is a same-storey
chain-to-chain bridge via `CIRC::Level 1` (two real E6 edges, 3.8m + 15.5m) — but `_publicHop()`'s
CIRC substitution only ever applied the ARRIVAL edge's own `wp` (for an E6 edge, just the arriving
spine's own point — a redundant duplicate of the adjacent node already in the path) and silently
discarded the DEPARTURE edge's real distance entirely. Fixed: when a CIRC node has edges on BOTH
sides and both are kind `E6` (the specific chain-bridge case where neither side's `wp` carries a
genuinely new coordinate), keep CIRC's own real (cx,cy) — measured, stair-flight-derived, not
invented — instead of collapsing it away. **First attempt was too broad** (suppressed substitution
for ANY circ node with a departure edge) and regressed the cross-floor stair case
(`CIRC::First Floor <-> CIRC::Second Floor` via a real E3 edge, which DOES need its `stairwp`
substitution) — caught immediately by `witness_backbone_routing.js` G0c and
`witness_corridor_room_backprop.js` B3 both failing; narrowed the guard to E6-only-on-both-sides,
both green again (8/8 witnesses).

**Honest scope, not oversold**: this fixes the chain-bridge RENDERING (a real stairwell waypoint
now shows instead of a misleading straight collapse) but does NOT resolve the underlying breadth
problem — measured before AND after this fix: **173/253 (68%) of HHS room pairs still hit
`§PATH_LEGAL_DETOUR_FAIL`**, unchanged by this fix, because HHS's real room/corridor rect coverage
is too sparse for `_detourForChord`'s visibility graph to find ANY legal chain in most cases (not
just the one specific chord this fix addressed). Also tried: adding the same wall-thickness slack
`hallway_backbone.js`'s `wallCrossSlack` already uses to `_pointWalkable()`'s corridor-rect check
(which had none, asymmetric with the room-rects check right above it) — kept as a real,
independently-justified fix, but measured to have ZERO effect on the 173/253 figure (the real gaps
are far larger than a rounding margin, so this alone can't be the whole story).

**Next session, if picked up**: the remaining 68% needs BROADER walkable-floor evidence — more real
rect coverage (finer-grained corridor buckets, or extending room rects), or a different real
geometry source entirely (e.g. floor/slab polygons instead of AABB approximations) — a genuinely
bigger task, not a parameter tweak. Re-run the same "sweep every real room pair, count
`DETOUR_FAIL` occurrences" diagnostic (reusable, ~30 lines, see this session's own scratch scripts)
before AND after any change to confirm it actually moves the 173/253 baseline, not just that
witnesses still pass.

## §22 UPDATE 2026-07-15p — "is it general?" answered: NO single mechanism, per-building survey +
a real live-serving landmine found and fixed for HHS (bim-ootb branch `fix/hhs-walkable-raster-
patch-sync`, worktree `/tmp/wt-walkable-coverage-survey`)

User asked whether §21's HHS finding generalizes to all buildings. Ran the same DETOUR_FAIL sweep
+ floor-coverage measurement across all 7 real buildings:
```
Clinic:     coverage=109.2%  detourFailRate=4.7%   (7021/7021 pairs, full sweep)
Duplex:     coverage=116.5%  detourFailRate=10.0%  (10/10 pairs, tiny building)
LTU_AHouse: coverage=74.0%   detourFailRate=6.6%   (1205/68635 sampled)
Terminal:   coverage=61.7%   detourFailRate=39.5%  (1596/1596, RAW db — see correction below)
JKR:        coverage=39.7%   detourFailRate=34.2%  (2145/2145 pairs, full sweep)
Hospital:   coverage=16.4%   detourFailRate=36.9%  (1209/12090 sampled)
HHS:        coverage=24.1%   detourFailRate=68.4%  (253/253 pairs, RAW db — see correction below)
```
**Answer: no, not a single uniform problem** — Clinic/Duplex/LTU_AHouse are fine, Terminal/JKR/
Hospital/HHS show real gaps, but chasing this further found the root causes are NOT the same
mechanism, and that this raw-db-based measurement itself was misleading for exactly the buildings
that matter most (HHS, Terminal) — see below.

**§21's "no fix, needs a new subsystem" conclusion was WRONG — the subsystem already exists.**
Found `common/storey_raster.js` + `scripts/build_storey_walkable_raster.js`
(PATH_LEGAL_SEGMENTS.md §G3-REVISED, built 2026-07-13, PR #767/#777/#779): a per-storey walkable-
space bitset rasterized OFFLINE from the building's OWN real triangulated slab mesh (not the crude
full-floor-plate `IfcSlab` bbox §21 tested and rejected), shipped as a self-heal patch, and already
wired as `_pointWalkable()`'s PRIMARY signal (room+corridor rects are the fallback for storeys with
no raster). This is exactly the "different geometry source" §21 said would be needed — it was
already built, just not applied to most buildings.

**Landmine #1 — the HHS raster patch was never actually live.** It only existed in
`buildings/patches/HHS_Office_Federated_extracted.db.sql`; `viewer/buildings/patches/`'s copy of
the SAME filename (that file's own header comment: "the file the LIVE Viewer actually fetches for
HHS, GH override per index.html") had a completely different, older fix (`spatial_structure`
self-heal, PR #732/#744) and never got the raster added — a live instance of this project's own
named `project_db_snapshot_divergence_landmine.md` pattern.

**Landmine #2, more serious — the committed raster was ALSO stale, and shipping it as-is would
have been a regression.** Testing against the raw, unpatched HHS db (23 compiled rooms) is not
representative: applying HHS's own `spatial_structure` self-heal patch first (already required for
correct production behavior) yields the TRUE room count of **105**, not 23. My first attempt at
"just sync the existing raster over" measured great on the wrong baseline (68.4%→30.0%, the raw
23-room db) but on the TRUE 105-room graph it made things WORSE (33.7%→40.5%) — the committed
raster had been built from the smaller, pre-self-heal room set and was missing/misplacing coverage
that the real 105-room graph now depends on. Root-caused via hybrid testing (swap old/fresh rasters
storey-by-storey): isolated entirely to a Level-3 coverage shrink correlating with TODAY's own PR
#800 (door-clustering fix changed HHS's corridor-bucket join set, which shifts the corridor-
backprop virtual room rects the raster builder unions in).

**Fix, verified**: rebuilt the raster CORRECTLY —
`node scripts/build_storey_walkable_raster.js buildings/HHS_Office_Federated_extracted.db
<spatial_structure-patch-only.sql> <outSqlPath>`, i.e. **always pass the db's own companion
self-heal patch as `patchPathToApplyFirst` when (re)building a raster for a building that has
one** — this is the one general, reusable lesson. Measured on the TRUE 105-room graph: 33.7%→28.7%
DETOUR_FAIL rate, a real (smaller but genuine) improvement. Synced into BOTH
`buildings/patches/` and `viewer/buildings/patches/` (the one actually served live), with the
stale/wrong version explicitly called out in-file so it's never reintroduced. New
`witness_hhs_walkable_raster.js` (4/4 pass) pins both the 33.7% no-raster floor and the 28.7%
with-raster ceiling so a future raster rebuild can't silently regress this again — this exact class
of near-miss (a "fix" that measures great on the wrong baseline) is why the floor is asserted
against the TRUE patched room count, not the raw db. Full pre-existing suite re-run clean: 8
witnesses, 57/57 assertions (`witness_backbone_routing` 10/10, `witness_corridor_room_backprop`
5/5, `witness_corridor_type_label` 5/5, `witness_hallway_backbone` 7/7,
`witness_hospital_corridor_baseline` 5/5, `witness_room_graph_path` 15/15,
`witness_full_connectivity` 6/6, `witness_stair_flight_assembly_merge` 4/4).

**Terminal's number was ALSO measured on the wrong baseline, and it's a DIFFERENT problem
entirely.** Terminal has its own self-heal patch too (`Terminal_extracted.db.sql`, a full
`spatial_structure` replacement, room count 57→59 once applied — a small delta, unlike HHS's
23→105). Re-measured on the TRUE patched room set: **DETOUR_FAIL rate is only 0.6%, but 1694/1711
(99%) of room pairs have NO PATH AT ALL** — not a chord-legality failure, a GRAPH CONNECTIVITY
failure (missing edges, not missing walkable evidence). A walkable raster cannot fix this — it
legalizes chords along an existing graph edge, it doesn't create edges. This is `fullConnectivity()`
/graph-wiring territory, unrelated to §21/§22's raster mechanism, and not investigated further this
pass.

**Hospital and JKR's numbers were measured against their raw dbs, and NEITHER has a companion
self-heal patch to apply first** (checked: only HHS and Terminal have one) — so unlike HHS/Terminal,
their raw-db measurement is presumably already representative of production, though this wasn't
independently re-confirmed by other means this pass. Not yet raster-built or root-caused — real
candidates for a follow-up session, but should not be blindly raster-built without first checking
(a) whether they have the same kind of connectivity-vs-legality split Terminal just revealed, and
(b) whether patchPathToApplyFirst is genuinely a no-op for them (no committed patch = nothing to
apply, so this specific landmine shouldn't recur, but worth confirming rather than assuming).

**Bottom line for "is it general": the RASTER MECHANISM is real, already-built, and now correctly
deployed for one building (HHS) with a genuine, witnessed improvement. It is NOT a general fix for
all buildings' pathfinding complaints — Terminal's problem is categorically different (connectivity,
not legality), and Hospital/JKR are unconfirmed. Each building needs its own root-cause check before
assuming the same lever applies.**

**Shipped**: bim-ootb PR #802, pushed, CI green (`fast-checks`/`e2e-tests`), merged to `main`.

## §23 UPDATE 2026-07-15q — "cannot be generalised?" pushback answered for real: it DOES
generalize, corrected §22's premature "Terminal is categorically different" claim, JKR shipped,
Hospital investigated and correctly NOT shipped (bim-ootb branch, worktree
`/tmp/wt-gap-breakdown`)

§22 conflated two different failure signals into one `detourFailRate` number (whether a pair had
ANY path at all vs. whether a found path hit an illegal chord) and drew a wrong conclusion from it.
Split them properly via `RoomGraph.fullConnectivity()` (connected-component structure) vs. a
DETOUR_FAIL sweep restricted to pairs WITHIN the same component (pure legality, no connectivity
confound):
```
                connectivity   legality-fail (within largest component)
Clinic (control)   95.7%          9.3%
HHS                90.7%         38.4%
Hospital           87.8%         90.0%
JKR                72.1%         81.2%
Terminal           28.2%        100.0% (n=10, tiny sample)
```
**Corrected finding: the legality/walkable-evidence gap generalizes to every non-Clinic building**
— Hospital's legality-fail rate (90.0%) is worse than HHS's was pre-fix (38.4%/68.4% depending on
measurement). §22's claim that Terminal was "categorically different, unrelated to the raster
mechanism" was wrong — Terminal has BOTH a severe connectivity gap (28.2%, dominant) AND the same
elevated legality-fail pattern on top; the two problems coexist rather than being mutually
exclusive. What's actually different building-to-building is which problem DOMINATES: HHS/Hospital
have decent connectivity so legality is their whole story; Terminal/JKR have a real connectivity
gap layered on top (a different, `fullConnectivity()`/edge-wiring fix, which a raster cannot
touch).

**JKR — raster built, validated, SHIPPED.** No companion self-heal patch (unlike HHS), all 4
storeys have real resolved `IfcSlab` geometry (none of Hospital's zero-slab-storey complication
below) — the clean case. Measured: 34.2%→21.3% DETOUR_FAIL rate (full 2145-pair sweep). New
`witness_jkr_walkable_raster.js` (4/4) pins both floors. Shipped to both patch locations.

**Hospital — raster built, tested, REGRESSED, root-caused, partially fixed, still NOT shipped.**
First attempt: 39.6%→44.1% (worse). Root cause: 5 of Hospital's 7 storeys have ZERO real resolved
`IfcSlab` rows — `buildStoreyRaster()` only ever unioned slab triangles + ROOM rects, never
`corridorRectsByStorey` (real, wall+door-verified `hallway_backbone.js` buckets) — but
`_pointWalkable()`'s existing FALLBACK (the behavior a raster replaces once shipped) already
trusts corridor rects. A raster built without them is strictly worse than the fallback on any
storey where corridor evidence is the main signal, which is exactly Hospital's zero-slab storeys.
**Fixed the actual bug** in `scripts/build_storey_walkable_raster.js`
(`buildStoreyRaster()`, `§RASTER-CORRIDOR-PARITY`): now unions `corridorRectsByStorey` too — a
real, generalizable correctness fix regardless of Hospital's outcome (a raster must never drop
evidence its own fallback already had). Rebuilt Hospital's raster with the fix: 44.1%→40.8% —
better, but still net worse than the 39.6% no-raster baseline. **Two attempts, two regressions —
Hospital's raster is NOT shipped.** The remaining gap needs real investigation (candidates: the
`DOOR_BUFFER_SLACK` inflation `_pointWalkable`'s room-rect fallback applies that the raster's flat
`pointInRect` test does not, or something specific to Hospital's mesh/triangle resolution),
not another guess-and-measure cycle — logged here so a future session doesn't re-derive this from
scratch.

**Shipped**: `scripts/build_storey_walkable_raster.js`'s corridor-parity fix + JKR's raster +
`witness_jkr_walkable_raster.js`, full pre-existing suite re-run clean (9 witnesses, 61/61).
Terminal's dominant connectivity gap and Hospital's still-open raster regression are both real,
separate follow-up items — not fixed this pass, not blindly attempted further.

---

**Branch status**: `fix/hospital-corridor-baseline-witness` now carries 5 commits (baseline witness,
Hospital join-ratio fix, room-cuboid shine-through fix, corridor distinct-neighbors fix, CIRC-dual-
bridge fix), all pushed, no PR opened yet (per standing PUSH PAUSE + user's own "push for me to
check" framing — a plain branch push, not a PR, satisfies that ask).

## §20 UPDATE 2026-07-15n — PR opened, merged, worktrees pruned (user's own next-step pick + "push
and proceed on the sound decision", same session)
bim-ootb PR #800 opened, CI green (`fast-checks`/`e2e-tests` both pass), `mergeStateStatus=CLEAN`,
**merged to `main`** (`7c548fa`) — independently verified (real diff, green CI, 8/8 witnesses named
in the PR body), no unresolved question, so merge was in-scope per the standing "PR work is your
Manager work" memory rather than left as a hedge. 3 stale worktrees pruned same pass (branches
already merged, zero unpushed commits, one had only a gitignored data-cache dir untracked):
`/tmp/wt-hospital-corridor-baseline`, `/tmp/wt-room-lens-volbox`, `/tmp/wt-room-glow`.

## §21 UPDATE 2026-07-15o — HHS's 68% DETOUR_FAIL gap investigated, root cause GROUNDED, no fix
attempted this pass — genuine architecture fork, not executed blind
Re-ran §18/§19's own "sweep every real room pair" diagnostic against the CURRENT code (post PR
#800) to check whether the Hospital corridor-join fix moved HHS's number: **it did not** —
173/253 (68.4%) `§PATH_LEGAL_DETOUR_FAIL` pairs, identical to §19's pre-fix baseline. Expected:
PR #800's fix targeted Hospital's specific bucket-grid-boundary artifact; HHS's own join ratio had
already moved in an EARLIER fix (§17: 38.5%→48.4%), so there was nothing left in that lever for
HHS to gain from PR #800 specifically.

**New measurement, grounds WHY**: summed `graph.roomRectsByStorey`/`corridorRectsByStorey` real
rect area against each storey's largest real `IfcSlab` bbox (a floor-footprint proxy) —
`buildings/HHS_Office_Federated_extracted.db`:
```
Level 1: roomArea=234 + corridorArea=552  / slabBBoxArea=3518  = 22.4% covered
Level 2: roomArea=355 + corridorArea=365  / slabBBoxArea=3529  = 20.4% covered
Level 3: roomArea=299 + corridorArea=380  / slabBBoxArea=3537  = 19.2% covered
```
Only ~1/5 of each real floor's footprint is accounted for by a known room or known corridor rect
— the other ~80% is simply unmapped to `_detourForChord`'s visibility graph, which is the real
mechanism behind the 68% failure rate (not a threshold, not a bucketing artifact — a genuine data-
coverage gap).

**§19's own "different geometry source (floor/slab polygons)" idea investigated and ruled OUT as
written**: HHS carries 83 real `IfcSlab` rows, but they're full-floor structural plates (e.g. one
~57.6m×44.75m slab spanning nearly the whole Level 2 footprint) — undifferentiated floor extent,
not navigable space. Using a slab bbox directly as "walkable" would route straight through
wherever a wall actually stands; turning it into real navigable evidence needs a wall-footprint-
subtraction step (a new floor-polygon extractor), not a rect-widening tweak to the existing
`hallway_backbone.js`/`room_graph.js` machinery.

**Not fixed this pass, on purpose**: both real paths forward are genuine new subsystems with real
regression surface and no existing witness coverage —
(a) a wall-subtracted floor-polygon navigable-area extractor (the correct fix, largest lift), or
(b) improving upstream room compilation itself so more of HHS's federated IFC becomes real
compiled rooms (moves the fix out of `room_graph.js` entirely, into `compile_rooms.py`'s domain).
Per this file's own PRIME RULE (EXTRACT OR COMPILE ONLY, never invent) and the project's "no
architecture-level fork gets picked blind" discipline, this is logged as a grounded finding + two
real options rather than an implementation choice made unilaterally — worth a scoped session of
its own once the user picks a direction. Diagnostic scripts used
(`scratch_hhs_detour_sweep.js` + the rect-coverage measurement above) were scratch, not committed
— reusable if either path is picked up, not needed as a permanent witness on their own.

## §24 UPDATE 2026-07-15r — user's vision stated explicitly ("general accurate functional space
layer... applicable to any building"), Hospital's raster tie root-caused for real, Terminal's
connectivity gap found to be a coordinate bug and FIXED (bim-ootb branch
`fix/hospital-walkable-raster`, worktree `/tmp/wt-hospital-raster-fix`, shipped as bim-ootb
PR #804, CI green, merged to `main`)

**Task 1 — Hospital's raster tie, fully root-caused, closed as "not a bug."** Two more real
build-script fixes found and shipped: (a) `§RASTER-SLACK-PARITY` — the raster's `pointInRect` test
had no margin at all, while `_pointWalkable()`'s own fallback inflates room rects by
`DOOR_BUFFER_SLACK` (0.20m) and corridor rects by `CORRIDOR_RECT_SLACK` (0.30m); a raster must be a
superset of what its own fallback already granted, never stricter. Fixed by inflating both rect
types the same way before rasterizing. Verified as a true no-op (zero behavioral change, same
exact numbers) on HHS/JKR — a pure correctness fix, no regression risk, not worth reshipping their
already-good patches. On Hospital, it moved the raster from a REGRESSION (44.1%, after the
corridor-parity fix alone) to an exact TIE with the 39.6% no-raster baseline — proven via pair-level
identity (`witness_hospital_walkable_raster.js` G3): the SAME 1197/3023 sampled pairs fail before
and after, zero pairs flipped either direction. Root cause of the remaining tie: Hospital's own
`§PATH_LEGAL_DETOUR_FAIL` log shows failures like "no legal detour among 128 doors" — plenty of
candidate waypoints exist, but Hospital's real floor-evidence coverage is still only 20-40% per
storey even with both fixes (vs Clinic's ~65-75%), so a long cross-floor chord between two
arbitrary doors almost always crosses at least one uncovered patch somewhere. This is the SAME
already-tracked corridor-coverage gap `witness_hospital_corridor_baseline.js` guards (17.8% join
ratio vs Clinic/HHS's ~45%) — a real geometry-recognition gap in `hallway_backbone.js`, not
something a walkable-raster fix can touch. Shipped Hospital's raster anyway (most-accurate
available walkable-floor ground truth — real value for this spec's own VISUAL rendering purpose,
independent of the pathfinding metric it ties on), with `witness_hospital_walkable_raster.js`
(3/3) permanently guarding against a future session re-attempting this as if it were still open.

**Task 2 — Terminal's connectivity gap (28.2%, 51 components, 47 isolated singleton rooms out of
59) was NOT a sparse-data problem — it was a stale coordinate-offset bug, found and fixed.**
Measured directly: `Terminal_extracted.db.sql`'s compiler-owned rooms (its own v2 header: "every
spatial_structure row... is compiler-owned") sat at x∈[91,149] y∈[-39,-1], while the building's own
real doors sit at x∈[634,696] y∈[11,51] — a consistent ~(+543,+51)m offset, same footprint size,
purely translated, not a rotation/scale bug. This patch had gone stale relative to the current
`Terminal_extracted.db` — a live instance of the same "self-heal patch drifts from its source data"
category as HHS's stale-raster bug (§21/§22), just manifesting as a coordinate shift instead of a
room-count mismatch. Fix: reran `scripts/compile_rooms.py` (bim-compiler) fresh against the CURRENT
`Terminal_extracted.db` — same rules, same code, zero manual edits — and the resulting rooms'
x/y range matches the real doors almost exactly. Measured improvement: `fullConnectivity()`
28.2%→94.2% (51 components→8, largest-component-size 40/142→113/120, isolated singletons 47→7) —
now at Clinic-control quality (95.7%). `witness_terminal_room_coordinate_fix.js` (5/5) pins both
the old broken baseline (proving the bug is real) and the new fixed floor.
**Side effect, honestly reported**: fixing connectivity means far more room pairs now actually
ATTEMPT real routing instead of failing outright with no path — so the within-graph legality-fail
rate that was masked by the connectivity failure is now visible: 51.6% (same category of gap as
HHS/JKR/Hospital). Built Terminal's own walkable raster too (patch-first, same discipline as HHS)
— it ties the 51.6% baseline exactly, no improvement, because `component_geometries` slab
resolution failed entirely for Terminal (0/174 slabs resolved across every storey — an unexplored,
separate geometry-index gap, not investigated this pass). Raster NOT shipped for Terminal since it
provides zero measured value unlike Hospital's (which at least resolved real triangles on 2 of 7
storeys) — the coordinate fix alone is the real, validated win here.

**Explicit vision context (verbatim, this session)**: "U have to proceed, that is my vision, to
have a general accurate functional space layer. It is indeed complex but highly desired to be
complete and applicable to any building." Persisted to
`~/.claude/projects/-home-red1-bim-compiler/memory/project_room_intelligence_lane.md` so future
sessions don't need this restated. Task #3 (confirm LTU_AHouse/Duplex are genuinely clean, not just
assumed from a tiny/full sweep) still open, not started this pass.

**Verification**: full pre-existing suite + all 4 new/updated raster-and-connectivity witnesses,
70/70 green across 12 witness files.

## §25 UPDATE 2026-07-16 — Find-panel tab freeze on large buildings ("Script terminated by
timeout"), root cause found and fixed, committed locally (worktree `/tmp/wt-find-panel-freeze`,
branch `fix/find-panel-shell-parentset-freeze`, off `origin/main` @ `57c0720`, commit `a00cfaf`,
**not pushed — standing PUSH PAUSE**)

**User-reported live on production** (`red1oon.github.io/bim-ootb`, Terminal building): tapping a
room/corridor in the Find panel's Room axis froze the tab — Firefox's own "Script terminated by
timeout" fired, real stack trace: `_buildShapeMeshes` (`navigate_find.js`) → `clone` → `copy` →
`copy` in `three.core.min.js`, called from `_drillSelect`'s `_drillRAF1` callback.

**Root cause, grounded via `git blame` + comment-vs-code contradiction, not guessed**:
`_drillSelect`'s `_shell` branch (`§SLIDING-WINDOW`, dated `f19b385` 2026-06-06 — this exact code
is over a month old, NOT new) unconditionally pushes `opts.parentSet` (a whole storey, capped at
`_HL_CAP=4000` elements) as a SOLID ancestor layer — `layers.push({set: parentSet, op: 1.0})` —
even though the block's own comment states the ghost shell alone "IS the far context" and the
selection should only need "solid+highlighted on top." `_buildShapeMeshes` then clones a real
`MeshStandardMaterial` (frequently carrying a custom `onBeforeCompile` normal-perturbation shader,
see `streaming.js` `_getMaterial`) **per unique hash/class group, fresh on every tap, never
cached/reused** — for a storey with many disciplines this is dozens+ of clones, and it's paid again
on every single room/corridor click.

**Why this surfaced now, not in June**: `_shell` mode used to be reached only via manual Alt+X or
`window._isMobile`. `#796`/§14 (2026-07-15h, already merged) added `_isLargeBuilding()` —
auto-triggers the ghost shell for any building over 25000 elements. Terminal (48428) and Hospital
(63415) now hit `_shell` mode on EVERY Find-panel open, so this month-old latent parentSet-SOLID
cost fires on every room/corridor tap on exactly the two biggest buildings in the fleet — the
"recent Rooms/corridor/path work" the user pointed at is real (§14 IS what exposed it), but the
actual defect predates all of it.

**Fix** (`navigate_find.js`, `_drillSelect`'s `_shell` branch only): gate the parentSet-SOLID push
on `parentSet.size <= 1500` — reusing the SAME fast-path cutoff `_buildShapeMeshes` already applies
internally (line ~1667) rather than inventing a new threshold. Large parentSets (the freeze case)
skip the push and rely on the already-active ghost shell, matching the block's own stated design.
Small parentSets (mobile-bbox-shell manually toggled on a normal-size building) are byte-for-byte
unchanged — zero behavior change outside the large-building freeze path. The parallel `else`
(non-shell, x-ray) branch was deliberately left untouched — it's the smaller-building path, not
what the user reported, and touching it would be an unrequested/unproven change.

**Verified locally, honestly bounded**: `node --check` clean. Full Playwright run against a real
local building (`buildings/HHS_Office_Federated_extracted.db`, small enough to load fast) — opened
Find panel, cycled Storey→Disc→Room axis, force-clicked through 15 tree rows — zero page errors,
zero hangs, on the FIXED code.

**UPDATE, same session — the actual freeze WAS reproduced and disproven, on the real building**:
found full-size Terminal split DBs already sitting locally from an earlier session
(`~/bim-ootb/buildings/Terminal_{extracted,meta,geo}.db`, 28MB/18.9MB/261MB — matches the user's own
production log byte-for-byte), symlinked them into the worktree's `buildings/`, and drove the EXACT
reported scenario via Playwright (real `page.mouse.click`, not `.click()` — the axis-toggle button
only listens for `pointerup`, DOM `.click()` never fires it): opened Terminal locally (`§LARGE_
BUILDING_CHECK elems=48428 large=true` confirmed, matching production), cycled to the Room axis,
expanded "Aras 01", and tapped `≈ Aras 01 R1` — the literal same room from the user's own freeze
report. Result on the FIXED code: `§ROOM_HIGHLIGHT mode=cuboid guid=RM_Aras_01_1` fired immediately,
page stayed alive through a 30s observation window, zero page errors, zero "Script terminated"
dialog, mouse events kept firing throughout. **Direct proof the fix removed the exact hang path**:
the original freeze log showed the click immediately followed by `§INSTROWS_CACHED rows=48428` (the
full-building join `_buildShapeMeshes` falls back to for a >1500-element set) then dead silence —
on the fixed code, that same click instead logs `§INSTROWS_SET rows=6 of set=6 (direct, no full
join)`, i.e. the parentSet-size gate skipped the ancestor layer entirely and `_buildShapeMeshes` only
ever ran on the tiny 6-element focus set. The expensive call this bug relied on no longer happens.

**One unrelated, honestly-flagged observation from the same run, NOT part of this fix**:
`§BVH_DEFERRED built=9394 ms=34769 (incremental)` — a separate, pre-existing background raycast-
index build took ~35s wall-clock on Terminal. It's chunked/incremental by its own name and design
(§258) and did not block input or the Find-panel interaction in this run, but it's a real number
worth a future session's attention if large-building raycast responsiveness ever comes up — not
touched or claimed fixed here.

Local commit only (`a00cfaf`), standing PUSH PAUSE — ready to push once the user does their own
live spot-check on production-equivalent conditions.

**§25 UPDATE 2026-07-16 (later session) — user reports "still hanging in github live": EXPECTED,
not a fix failure.** The fix exists ONLY in `/tmp/wt-find-panel-freeze` (`a00cfaf`, 1 commit ahead
of `origin/main`, never pushed per PUSH PAUSE) — GitHub Pages serves un-fixed code, so live still
freezing is the predicted state, not evidence against the fix. Two additions from this session:
**RESOLVED same day:** the fix reached main as **PR #807** (`f8ef82f`, pushed by another session),
and PR #808's sw `CACHE_VERSION v763→v764` bump closes the missing-cache-bust gap below — live
`navigate_find.js` fetch-verified carrying the `parentSet≤1500` gate, and returning browsers get
it via the v764 cache purge. `/tmp/wt-find-panel-freeze` worktree is now prunable (its commit is
on main via #807; verify `git status` clean before removing). The DISC_SELECT second-path finding
below remains OPEN.
- **Deploy gap found in `a00cfaf` (must fix WHEN pushing):** the commit edits `navigate_find.js`
  only — `viewer.html`'s `navigate_find.js?v=41` cache-bust was NOT bumped, so even a merged+
  deployed fix would not reach returning browsers (they'd keep the cached v41). Bump `v=41→42`
  (+ sw.js CACHE_VERSION per `feedback_sw_version`) as part of the deploy, or the user will
  re-report "still hanging" a second time for a different reason.
- **SECOND heavy path, NOT covered by `a00cfaf`, measured in the user's live 2026-07-16 Firefox/
  Hospital log:** `[RP-TB] §DISC_SELECT "Architecture" GROUP focus=14641 solid=4000 hl=2113
  anc=[] base=shell overlays=2113`. `anc=[]` proves the parentSet layer (what `a00cfaf` caps)
  never ran on this tap — the cost is the FOCUS SET itself: `_drillSelect`'s RAF1 built 4000
  solid clone-meshes for the group (navigate_find.js ~line 3347, same `_buildShapeMeshes` clone
  storm, different call site) and then handed **2113 meshes to OutlinePass** (§YELLOW-SILHOUETTE
  path) — a PER-FRAME cost thereafter, extra-heavy on this machine's Firefox (no `WEBGL_multi_draw`,
  permanent per-draw fallback — see MOBILE_PERF.md §OPEN LEVERS 2 2026-07-16). This tap COMPLETED
  in the log (slow, not frozen), so it's a lag source, not proven the freeze — but it's the
  next cap candidate: for a large focus set, show the selection via `filterByGuids(focusSet)`
  (real batched geometry, ~1 draw) instead of per-element solid overlays + outline, the same
  `mode=filter-cheap(>50k)` idea `§FOCUS_ELEM` already uses. NOT implemented — needs its own
  session (UX-visible change on group selects; wait for user go per feedback_wait_for_permission_ui).

**§26 2026-07-16 — the REAL "hangs, was not the way before" regression FOUND, FIXED, LIVE
(PR #811, sw v767).** User's fresh live LTU log: Find-panel tap "Plan 1" → `§INSTROWS_CACHED
rows=122330` → `THREE.Texture: Unable to serialize Texture.` ×118 → hang. Root cause was a
one-day-old regression from #805 (2026-07-15 22:46): `mat.userData.triplanarShader = shader`
(the §TRIPLANAR_RECOMPILE_FIX) — three's `Material.copy()` deep-copies `userData` via
`JSON.parse(JSON.stringify(...))`, so EVERY `material.clone()` — which `_buildShapeMeshes`
does per unique material on every Find select — serialized the full GLSL source + all uniforms
INCLUDING textures/envMap (the ×118 warnings = one per material's non-serializable envMap RTT).
**Method (reusable):** grep found no `.toJSON(` caller anywhere in app code because
`JSON.stringify` auto-invokes it — the caller was found by prototype-instrumenting
`Material/Object3D/Texture.toJSON` with a stack print in a Playwright probe on Duplex
(scratchpad probe, reproduced in one tap; stack: `Material.copy → JSON.stringify ←
_buildShapeMeshes navigate_find.js:1756/3347`). **Fix:** plain properties
`mat._triplanarShader`/`mat._puddleShader` (Material.copy never touches ad-hoc props; clones
recompile fresh via their own onBeforeCompile). Witness on fixed tree: ZERO toJSON calls,
`§STOREY_SELECT` output byte-identical (focus=50 solid=50 hl=47 overlays=47), `§FIND_COST`
intact. Live fetch-verified: streaming.js?v=54 has `_triplanarShader`, zero
`userData.triplanarShader`, sw v767. **Rule for all photoreal/shader work: NEVER store a
shader (or any object holding textures) in `material.userData` — userData is JSON-round-tripped
on every clone.** Note: §25's `a00cfaf` parentSet cap and this are BOTH needed — different call
sites, same clone storm; §25's second-path (group-focus filter-cheap) item above remains open
as a further large-group optimization, but the outright HANG was this §26 serialization bomb.

**§26 CLOSED 2026-07-16 ✅ — USER-CONFIRMED ON LIVE:** user re-tested GitHub live LTU_AHouse
after the v767 deploy: **Find Panel no longer hangs, prelim testing looks OK** (user verbatim,
same day as the fix). Lane closed. Still open elsewhere (tracked, not blocking): §25's
large-group filter-cheap optimization (whole-discipline taps still do per-element overlay
work), and MOBILE_PERF.md §OPEN LEVERS 2's sql.js-residency baseline + lever 6 (HHS small-
building stall) — those are perf polish, not hangs.

## ▶ 2026-10-24 — LIVE CHECK from the guide refresh (measured on the published site, HHS_Office_Federated; `prompts/DOCS_GUIDE_REFRESH.md`)
- §RESOLVED 2026-07-15d is **confirmed live**: HHS shows 5 axes (Storey, Discipline, Room, Material, Phase); there is no Parts axis.
- Room → Type on HHS (what `docs/BIMUserGuide.md` now quotes): INTERNAL 48 · INTERNAL_SMALL 15 · SUSPECT_OPEN 7 · Restrooms 2 ·
  SUSPECT_NO_DOOR 2 · SUSPECT_ELONGATED 1 · **Stairs 11** · Lift Shaft 3 · Plant Room 1769. Rooms by storey L1 25 / L2 31 / L3 19 = **75**
  (the guide had said 105; the 6 compiled-room groups sum to the same 75). Old Parts count "Stairway 20" is now Stairs 11 — a different
  classifier, not a regression to chase.
- Retired-axis docs: `VIEWER_FIND_PANEL_PARTS_VERIFICATION.md` archived (`archive/…_archived_2026-10-24.md`).
  `FIND_PANEL_PLANT_ROOM_GATE_FIX.md` stays live (its word-boundary match is still `_keywordTokenMatch`; `build/building_parts_taxonomy.js:43` ports it).
