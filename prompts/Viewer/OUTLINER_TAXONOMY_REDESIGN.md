<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# VIEWER OUTLINER/FIND-PANEL — Bonsai-style taxonomy redesign, layman-friendly, user-oriented

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js` + `viewer/panels.js`. Consolidates a single long design
dialogue (bim-compiler conversation, 2026-07-12) that produced several real findings and decisions
scattered across other docs — this file is the ONE canonical index for the Outliner-redesign THREAD
itself; it links out to the docs where each concrete slice is actually specced/built rather than
duplicating them. Read this first when picking up any "make the Find panel/Outliner friendlier"
work; do not re-derive the findings below from scratch.
```

## §0 — The core finding this whole thread rests on
DISC (discipline) and Parts/keyword-taxonomy (Stairway/Lift Shaft/Plant Room) are **categorically
different kinds of things**, confirmed against real data, not assumed:
- **DISC is a true partition** — every element has exactly one (`elements_meta.discipline`).
- **Parts/Plant-Room is a cross-cutting TAG** — a Plant Room duct is *also* ACMV or MEP; the keyword
  extraction (`build/building_parts_taxonomy.js` `PLANT_KEYWORDS`) never even reads the discipline
  column. Confirmed on `HHS_Office_Federated_extracted.db`: 1767/1769 Plant Room matches are tagged
  `discipline='MEP'` (the coarse bucket — this building never had the fine ACMV/ELEC/PLB/FP walker
  run over it), while the same keyword match on `Hospital_3_extracted.db` lands 4816/5391 in
  `discipline='ACMV'` specifically — **which bucket you land in is a fact about which pipeline
  touched that building, not a property of "Plant Room."**
- Today's Find panel puts DISC and Parts as swappable siblings in one axis-switcher (`Parts ⇌
  Storey`), which papers over this difference instead of showing it.

## §1 — Storey as tree spine: right for most things, wrong for vertical/spanning parts
Checked directly against `Hospital_3_extracted.db`: ACMV duct/riser elements are storey-tagged almost
evenly across every level (Level 1-6, ~900-1040 each) because each duct *segment* carries the storey
it physically passes through. A pure storey-spine tree would shred a single riser run into 5-6
disconnected leaves. Stairs are worse: 31 of ~62 stair elements have `storey='Unknown'` (the parent
`IfcStair` carries no storey, only its child `IfcStairFlight` rows do) — half the stairs would land
in an orphan bucket, not even fragmented, just missing.

**Correction (2026-07-12, checked the actual code before proposing a restructure — user caution:
"what we doing are siblings, do not be inventive to correct/edit others unless discussed"):**
Storey and Parts are ALREADY independent siblings in the existing axis-cycle array (`_axes()`,
`viewer/navigate_find.js` ~line 761 — Storey/Disc/Room/Material/Phase/Parts all `ax.push()` into
ONE cycled list, `§RULE1 SINGLE TOGGLE`). `_buildPartsTree()` (~line 2190) queries Stairway/
Lift-Shaft/Plant-Room with **no storey filter at all** — so switching to the Parts axis already
shows the COMPLETE, unfragmented set (all 20 real stairs, all 1769/5391 plant elements) regardless
of which storey each one is tagged. **The storey-fragmentation problem only exists if a user stays
on the Storey axis specifically** — which is arguably correct behavior for a per-floor view, not a
bug, as long as Parts stays available as the complete alternative (it does, today).
**Revised status: the architecture is NOT broken and does not need restructuring.** No new sibling
branch is needed — one already exists and already works. The only real, much smaller gap: pure
discoverability (does a user switching to Storey and seeing a stray/partial stair know to switch to
Parts for the whole picture?) — a UI-copy/hint question, not a code-structure one. **Nothing to
build here without a further, separately-discussed decision** — this task is closed as "investigated,
no action" rather than converted into a build task.

## §2 — Friendly naming: no dictionary exists today, build it in two layers
Confirmed: the ONLY existing "friendly naming" in the Viewer is pure string formatting
(`navigate_find.js` `friendlyClass()`: `"IfcFlowTerminal"`→`"Flow Terminal"`; `friendlyName()`:
strips Revit prefixes/IDs). Nowhere maps `ACMV`/`ELEC`/`PLB`/`FP`/`MEP` to a real word — raw codes
show as-is. `PLANT_KEYWORDS`/`STAIR_LIKE`/`LIFT_KEYWORDS` in `build/building_parts_taxonomy.js`
already prove the concept works (hand-curated keyword dictionary → one trade-friendly label, with
word-boundary false-positive filtering already solved, e.g. rejecting "Preventer" for "vent").

- **Layer 1 (user: "start with 1") — coarse `DISC_LABELS` lookup**: `ACMV→"Air-Conditioning"`,
  `ELEC→"Electrical"`, `PLB→"Plumbing"`, `FP→"Fire Protection"`, `STR→"Structure"`,
  `ARC→"Architecture"`, `MEP→"Mechanical & Electrical"`. Zero misclassification risk — relabels an
  already-correct field. **Status: approved by user, NOT YET BUILT.**
- **Layer 2 (user: "we can have 2 after") — fine name-keyword sub-grouping within a DISC bucket**,
  reusing the exact `PLANT_KEYWORDS`-style dictionary + word-boundary code (e.g. within ACMV,
  `duct/ahu/fan`→"Main Aircond Ducting" vs `diffuser/grille/vent`→"Air Terminals"). More work per
  discipline (each new keyword set needs the same false-positive vetting Plant Room already went
  through once). **Status: deferred, not started.**

## §3 — Role/profession view filter (2026-07-12, this session)
User: "The HBA can have a role selector which dictates who can see what... a plumber, electrician,
cleaner etc... true user oriented." Confirmed the filtering primitive already exists and is
multi-select-ready: `A.filterDiscs(list)` (`viewer/panels.js` ~line 670, `§NAV_FIND_002`) already
shows-only-these-disciplines. No new filtering engine is needed.

**Decision (this session): build the cheap version now** — a **convenience view filter**, not real
access control. `plumber → ['PLB','FP']`-style presets (extendable to Parts/keyword categories too,
e.g. pulling in Plant Room's plumbing-tagged elements) that just call the already-existing
`filterDiscs`. Preset button labels are the Layer-1 friendly names from §2, free reuse. **Status:
scoped in this doc, NOT YET BUILT.**

**Explicitly noted, text-only for now (user: "in text we can say"):** this convenience filter can
later be integrated to a real ERP login as a master system over the whole facility — a genuinely
"total integrated building system" where the profession filter isn't just a UI preset but reflects
an authenticated user's actual role/permission. **This project has no authentication layer today** —
that integration is a real, much larger, separate piece of scope, named here as the future direction,
not designed or estimated yet. Don't build auth as a side effect of the cheap preset.

## §4 — Structural weight/load-at-location (2026-07-12, user: "again that is me" — floated, not decided)
User's idea: show weight/load at a specific beam, pile, or room. Checked directly, no invention:
`elements_meta` has no weight/mass/load column at all. The one adjacent table, `qto_cache`
(`deploy/buildings/*_extracted.db`), is a **cost/quantity BOM cache aggregated by
`ifc_class × storey × discipline`** (qty, uom, material_cost, labour_cost) — not per-element, no
mass, no structural load-capacity data of any kind. STR elements do exist as real classes
(`IfcBeam`/`IfcColumn`/`IfcFooting`/`IfcMember`) but carry zero engineering-load attributes in this
pipeline today.

**Honest assessment, not a build plan:** a real per-element *weight* (mass) is sometimes present in
source IFC as `IfcElementQuantity`/material-density properties — worth checking whether any of this
project's source IFCs actually carry it before assuming it's extractable at all. A real load-BEARING
*capacity* (how much a beam/pile/room can safely carry) is a fundamentally different, much bigger
thing — genuine structural engineering analysis, not a geometry/metadata extraction — well outside
this project's "extract and compile" scope as currently practiced anywhere else in this codebase.
**Status: gap named, not sourced, not specced, not started.** Don't build anything here without a
real source for either number.

## §4b — QTO weight-estimate correction (2026-07-12, user pushback, checked properly)
User recalled "we already have QTO for 5D data which can extract weight by vol estimate." Checked
`qto_cache` directly: `DISTINCT uom` across every building = `{M2, EA, M}` only — **no `M3` (volume)
and no weight/mass unit anywhere in it.** So a weight figure is NOT already sitting there. What IS
real and usable: `element_transforms` already carries `bbox_x/y/z` per element, and `qto_cache`
carries real linear length (`M`) for beams/columns/members — combining bbox cross-section (or a
member's real length × its bbox cross-section area) gives an approximate volume, and volume × a
**sourced** material density gives a legitimate derived weight. Buildable, but it's a new derivation
chain (geometry → volume estimate → × real density), not an existing extraction — and the density
number needs a real source per material, same non-invent discipline as everything else here.

## §6 — "Fire Emergency" view filter (2026-07-12, extends §3's role-preset mechanism)
User: "carrying it further, that is the 'Fire Emergency' view filter — highlights routes,
combustibility sections, danger zones, weight capacity, even earthquake safety zone or rules."
Architecturally this is just another preset on the same `A.filterDiscs`/highlight mechanism as §3's
profession filter — but checked each named component against real data before assuming it's buildable:

- **Escape routes — real, ready.** Reuses §7 of `VIEWER_FIND_PANEL_ROOM_ACCURACY.md` (the real
  door-graph Dijkstra pathfinder) directly. No new data needed.
- **Combustibility sections / danger zones — MORE real than initially assumed, but disconnected.**
  `scripts/create_ad_fire_protection.py` (Phase 57) already defines + populates a genuinely sourced
  schema: `ad_fp_trigger` (when sprinklers/standpipes/alarms are required, cited UBBL By-Law 225 /
  NFPA 13 / IBC), `ad_fire_riser_requirement` (riser sizing, pipe diameter, flow/pressure, cited
  NFPA 14), `ad_fire_compartment` (**max compartment area, min fire-rating hours,
  requires_sprinkler/detection/smoke_ctrl, by occupancy group** — this is the actual
  "combustibility/danger zone" data). **But it's populated ONLY in `library/archive/BOM.db`**
  (`ad_fp_trigger`=12 rows, `ad_fire_riser_requirement`=9 rows, confirmed by direct query) — an
  ARCHIVED, disconnected database, not the live `library/BOM.db`/`library/bom.db` pipeline, and not
  wired to any compiled building's real spaces (no compiled room is currently classified against
  `ad_fire_compartment.max_area_m2`/`occupancy_group`). Real, sourced, reactivatable — needs (a)
  restoring the schema+data into the live pipeline, (b) classifying real compiled spaces against it
  (occupancy group + area check), neither done yet.
- **Weight capacity — see §4/§4b.** Load-BEARING capacity is not sourced anywhere (real structural
  analysis, out of this pipeline's scope as practiced elsewhere); a weight ESTIMATE is derivable per
  §4b once a real material-density source is picked.
- **Earthquake/seismic zones or rules — not found anywhere in this codebase.** Grepped the whole repo
  for `seismic` — zero hits. No schema, no jurisdiction data, nothing to reactivate; would start from
  zero, likely the same `ad_jurisdiction_codes`-style pattern (§▶2026-07-12 in the HBA doc) once a
  real seismic code source is picked for a jurisdiction.

**Recommendation:** don't build "Fire Emergency" as one monolithic mode — ship it incrementally as
each layer's real data lands. Escape-route highlighting is buildable today. Fire-compartment/danger-
zone highlighting needs the archived schema reactivated + wired to real compiled spaces first (real
work, but the sourcing is already done — not a new research gate). Weight and seismic are both
genuinely unsourced today; don't fabricate either to fill out the mode. **Status: idea captured, not
specced as a build task, not started.**

## §6b — Eye icon = profession-view toggle (2026-07-12, confirmed buildable)
Checked live in `viewer/panels.js`: the `eye` glyph entry is genuinely unused today — the X-Ray
button (`id:'xray'`) now renders `icon: I.bone.svg`, per the already-shipped `bone` swap in
`prompts/PILL_DRAWER_REORGANIZATION.md` ("Eye freed, Bone is a better metaphor — X-ray reveals
bones"). User's proposal: repurpose the freed Eye as the §3 profession/role-view toggle — tapping it
cycles/picks a profession, shows it as an avatar, and re-filters the Outliner (reusing
`A.filterDiscs`) + restyles the tree outline per profession. Coherent, reuses an already-free icon
slot in the existing registry — not a new UI mechanism. **Status: confirmed feasible, not specced
in build-task form yet.**

## §6c — HBA panels folded into the Outliner (2026-07-12, flagged, not decided)
User: "the HBA panel should be all incorporated into the Outliner for easy usage." Real tension to
resolve, not silently override: HBA today deliberately lives in its OWN pill/pane family
(`panels.js` HBA pills + `hba_lens.js`), kept separate from Teams specifically so the two People-
dimension overlays don't collide on the same building
(`feedback_hba_teams_share_hhs_no_collision` — different rendering seams, proven to coexist). Folding
Occupancy/Presence/Tenancy/IoT into Outliner rows/facets instead of floating panels is a genuine
architectural consolidation — needs its own scoped design pass reconciling with that separation rule,
not a small tweak riding on §6b. **Status: direction stated by user, not scoped as a build task.**

## §7 — Outliner shell: docked left like the Modeller, not a pill-opened floating panel (2026-07-12)
User: "the Outline be like Modeller, permanently on left of screen, collapsible, no need in pill. 'F'
can still open/collapse the panel though." Concrete UI-shell decision, distinct from everything
above (which is about tree CONTENT/taxonomy; this is about the panel's own chrome/placement):
- Today: Find panel is a floating, pill-opened, draggable overlay (`#find-panel`, `.bim-panel`,
  `position:fixed`, opened via the Navigate drawer's `#drawer-row-find` — see
  `witness_find_panel_hidden_onload_2026-07-11.js` for the current open/close mechanics).
- Wanted: a permanently-docked LEFT-side panel, matching the Modeller's own Outliner placement
  (`bonsai_outliner.js` / `modeller.html` — check its actual dock CSS before assuming it's a simple
  copy), collapsible (not pill-opened/closed — an inline collapse affordance instead), with the
  existing `f` keyboard shortcut still toggling open/collapsed state (repurposed from "open the
  floating panel" to "expand/collapse the docked panel").
- **Checked directly (2026-07-12), don't re-derive:** `modeller/bonsai_outliner.js` `mount()`
  (~line 106-108) creates its panel with plain inline CSS: `position:fixed; top:0; left:0;
  width:240px; height:100vh`. Every other Modeller UI element (`#bar`, `#stat`, `#ins-panel`,
  `#dim-row`, `#hist` in `modeller.html`) is hand-offset to `left:252px` (240px panel + 12px gap) to
  make room for it. This is the real pattern to port to the Viewer's Find panel.
- **One thing NOT to assume already-solved:** Modeller's Outliner only has PER-BRANCH tree collapse
  (`_collapsed{}`, localStorage-persisted, folds individual category/node rows —
  `modeller/bonsai_outliner.js` ~line 33-47) — there is **no whole-panel collapse/hide toggle** in
  Modeller today. The user's "collapsible" ask (collapse the WHOLE docked panel, not just tree
  branches) is genuinely NEW behavior for both apps, not a copy of an existing Modeller mechanism —
  scope it as new UI, don't assume Modeller already has an example to lift.
- **Guardrails for whoever builds this (per user's standing caution — no inventive edits to other
  code, no impact on main Outliner features):** this port is Viewer-side ONLY —
  `modeller/bonsai_outliner.js` and `modeller.html` must not be touched at all. Before shipping,
  re-run the full existing Find-panel witness set (`witness_find_panel_hidden_onload`,
  `witness_disc_friendly_labels`, `witness_room_box_purple`, `witness_isolate_zoom`,
  `witness_role_filter` — all from this same session) to confirm zero regression to open/close,
  drag, and every axis/tap interaction — the panel's CHROME is changing, none of its CONTENT logic
  should. **Status: real CSS pattern identified, whole-panel-collapse flagged as new, not yet
  specced as a full build task — needs the canvas-viewport-resize question (camera aspect on
  expand/collapse) answered before that, and per the caution above, should be discussed/confirmed
  before building, not started unilaterally.**

## §7b — Clarified scope (2026-07-12): Find panel gets ABSORBED into an Outliner, not just docked
User corrected §7's framing: not "make the Find panel LOOK like it's docked the way Modeller's is,"
but "the Outliner... to absorb Find panel, as this is how the Modeller is now" — i.e. converge on
Modeller's actual Outliner *component* (category-tree, `Bonsai.outliner.addCategory({key,label,
match})`, single persistent docked panel), with Find's search/axis/tree functionality becoming
categories INSIDE that same component, not a separate panel that merely sits in the same screen
position.

**Real technical distinction, checked directly, not assumed — this is bigger than a UI-shape port:**
Modeller's Outliner categories are matched over the **kernel op-log**
(`match: op => op.op_type === 'GEOM_EXTRUDE_POLY'`, ~line 56) — it lists live editing operations.
The Viewer's Find panel has no op-log at all; every axis (Storey/Disc/Room/Material/Phase/Parts,
today's new Role filter) is driven by **SQL queries over the compiled DB**
(`elements_meta`/`spatial_structure`/etc). These are two different data substrates. The visual/
interaction PATTERN (docked-left, category tree, `addCategory`-style extensibility, click-to-select-
and-zoom, per-branch collapse-persist) is genuinely portable — the `match: op => ...` mechanism
itself is not; the Viewer side would need an analogous `match`-over-SQL-predicate category system,
not a literal reuse of Modeller's function. Don't understate this as a copy-paste in any future spec.

**Given the size of this (touches where TODAY'S shipped work lives — Role filter, DISC labels, room
highlighting all currently live inside `navigate_find.js`'s Find-panel-specific structure) and the
user's own standing caution this session against inventive restructuring without discussion: this is
NOT dispatched as a build task. Status: scope clarified and recorded, needs its own dedicated design
pass (same treatment as §6c HBA-into-Outliner) before anyone builds toward it.**

## §8 — "Room Injection" as a live Find-panel action, needle icon (2026-07-12)
User's real trigger: a personal building (`jkr_fixed.db`, JKR = a real Malaysian government
building) had zero room data — `spatial_structure` table didn't exist at all. Ran
`scripts/compile_rooms.py` on it directly (offline, this session) — 66 rooms compiled (24
`INTERNAL`, 10 `INTERNAL_SMALL` door-rescued, 45 `SUSPECT_*` review candidates, honestly flagged not
hidden), saved as `JKR_Project.db`. Worked, but required a manual Python CLI run outside the app.

**User's ask: put this in the Find panel itself, a needle icon = "inject all such metadata"** — i.e.
a live UI action that runs room compilation on-demand for whatever building is currently open, no
offline script needed.

**This is NOT a fresh idea — it's the exact gap already named and specced as Task 5** in
`prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` (own doc:
`ROOM_WALKER_JS_PORT.md`): *"a user's OWN dropped IFC gets NO room data at all, today... confirmed
`viewer/import_db_builder.js` never creates `spatial_structure`."* The real obstacle named there
still holds: `compile_rooms.py`'s flood-fill/§DOOR-RESCUE/§DOOR-PARTITION algorithm is Python +
numpy, offline-only; the live import pipeline is 100% client-side JS/WASM with no server round-trip
and no Python runtime in the browser. A needle-icon button can't just call the existing script — it
needs that algorithm ported to JavaScript first, which `ROOM_WALKER_JS_PORT.md` already scoped as
its own dedicated, non-trivial task (grid rasterization, multi-source BFS, ported not re-derived).

**Status: real, wanted feature — UI idea recorded here (needle icon, Find-panel action, "inject
metadata" framing), but the actual enabling work is `ROOM_WALKER_JS_PORT.md`, already specced,
not started. Don't scope this as a small icon-adding task — the icon is trivial, the JS port behind
it is the real work.** This section is the pointer connecting the two; read `ROOM_WALKER_JS_PORT.md`
before estimating effort.

## §9 — SESSION CLOSE 2026-07-12: room highlight confirmed live, path still broken — real strategic reason to fix it
**Room highlight — user-confirmed live and correct.** Purple box shine-through (fill 0.5, brightened
double wireframe, `PR #756`) tested live by the user after the `?v=47` cache-bust fix — "rooms look
nicer purple." This closes the whole highlight saga (§8 room-accuracy doc, the multi-round cache-bust
chase, this section) — no further action needed on room-highlight color/visibility.

**Room-to-room path — still not working, user re-tested live, after this session's fixes.** Neon-green
path highlight (`PR #755`) is visually correct when a path IS found (confirmed via code + live HHS
log earlier: `edges=64` real connections exist), but the user still cannot get a usable path between
rooms in practice. This is the SAME root-cause chain already handed off in the Fable prompt above
(Tasks 1-3: Terminal stair-as-room, hallway fragmentation, pathfinding sparsity) — not a new, separate
bug. Not re-diagnosed further here; the handoff prompt stands as written.

**New, real strategic reason this matters beyond the Find panel, stated by the user:** room-to-room
connectivity is **the basis for a future MEP conduit-routing POC** — routing ductwork/pipes/cabling
through a building's actual connected spaces needs the exact same room-adjacency graph
(`common/room_graph.js`) this feature already builds. This raises the priority of Tasks 2/3 in the
Fable handoff above (hallway-fragmentation fix, pathfinding sparsity) — a working, trustworthy graph
isn't just a nice Find-panel demo, it's the prerequisite substrate for that POC. Record this
motivation when picking the Fable findings back up: fixing room accuracy isn't cosmetic, it's what
makes the room graph usable as real conduit-routing infrastructure.

**Session status:** four shipped/merged PRs today (#745 isolate-zoom, #746 room-graph pathfinding merge,
#747 room-box purple + neon path, #748 DISC friendly labels, #749 role filter, #752/#756 cache-bust
fixes) — all confirmed live via GH Pages deploy runs, not just merge status. Fable's trilogy stale-code
audit ran in parallel (PRs #750/#751/#753/#754, ~45% viewer size reduction), no file collisions with
this thread's work, both confirmed independently. Open, real, not-yet-built: the Fable room-accuracy +
pathfinding investigation (handed off this session, not yet executed), `ROOM_WALKER_JS_PORT.md` (needle-
icon prerequisite, §8), HBA-into-Outliner consolidation (§6c), Fire Emergency filter (§6, data exists but
disconnected), structural weight (§4, no density source), Outliner-absorbs-Find (§7b, scoped not built).

## §10 — Fable handoff addendum: room-type coverage (corridor/hallway/balcony/hall), full context
User asked: "can we have corridors, hallways, balconies, halls" — checked the actual template bank
before answering, not guessed. **Full state, what's working vs a miss:**

**Working, measured, already usable today:**
- `HALLWAY` (`config/room_templates.yaml`) → canonical `CORRIDOR`, `tier: supplementary`, n=2 real
  (Duplex `A201`/`B201`), area/aspect/door-count all measured.
- `FOYER` → canonical `LOBBY`, `tier: supplementary`, n=2 real (Duplex `A101`/`B101`).
So corridor and hallway are NOT a miss — already classified, already usable, already tier-tagged
correctly as circulation (the same tier the room-graph pathfinding treats as hub-like).

**Defined in the type schema (`config/spacetypes.yaml`) but with ZERO measured template — real
gaps, the classifier cannot actually assign these from real data yet, even though the schema key
exists:**
- `VERANDAH` — the nearest existing concept to "balcony" (attached, semi-open space). NOT confirmed
  to be the right match for an actual balcony — nobody has measured one against it.
- `ASSEMBLY_HALL` — the closest schema key to "hall." Same gap, zero measured evidence.
- `ENTRANCE_HALL` — sits in `room_templates.yaml`'s `exceptions:` block, n=1 (SampleHouse), explicitly
  BELOW the promotion bar (needs n>=2), and explicitly NOT merged into `FOYER`/`HALLWAY` despite being
  semantically close — a deliberate prior decision, don't silently merge it now without new evidence.

**Missing entirely, no schema key at all:**
- A dedicated `BALCONY` type. `VERANDAH` is the only relative, unconfirmed as equivalent.

**Ask for Fable, added to the Task 1-3 investigation above, same discipline (measure, don't invent):**
Task 4 — survey real buildings in this repo for genuine balcony/hall/verandah-shaped spaces (real
IfcSpace or real name-keyword evidence, same rigor as the existing `BEDROOM`/`HALLWAY` templates —
area_m2/aspect_ratio/door_count, minimum n>=2 before promoting a template) and report what's
actually findable. If real evidence exists for `VERANDAH`/`ASSEMBLY_HALL`, promote them from
schema-only to measured templates. If a true balcony shape is found that doesn't fit `VERANDAH`,
name that as a new gap rather than force-fitting it. Report only — don't add unmeasured templates.

## §5 — Related, already-specced elsewhere (don't duplicate here)
- Room highlight default (purple box shine-through, not fragmented yellow seams):
  `prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md §8`.
- Room-to-room pathfinding (real door-graph, Dijkstra, unmerged): same doc, §7.
- Find-panel isolate-tap camera zoom (shipped): `prompts/FIND_PANEL_ISOLATE_NO_CAMERA_ZOOM.md`
  (bim-ootb PR #745).
- Safety/egress guide (QR emergency escape, capacity icon, evacuation-time, occupant-load sourcing
  gap): `prompts/Viewer/HBA/RESUME_HR_BIM_ASSET.md §▶ 2026-07-12`.

## §6 — Nothing in this file is built yet
Every section above is a decision or a scoped-but-unbuilt item. When picking one up: write it as its
own dated `##` section here (or in the linked doc if it's really that slice's home), same
WORK-TO-ZERO discipline as every other `prompts/*.md` file — spec first, then build, then witness.
