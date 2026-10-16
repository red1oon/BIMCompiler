<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM PATHING SUBSTRATE — how a walkable map is built from an IFC, and every way we got it wrong

```
# ⚠ DO NOT REMOVE
SCOPE: the CONCEPT and the ARCHITECTURE of room-to-room pathing. This is the explanatory
document. The working log — dated sections, witness output, per-session findings — stays in
`VIEWER_FIND_PANEL_ROOM_ACCURACY.md` §21.x. Read this first to understand WHY the code is
shaped the way it is; read the §21.x log to find out where the work currently stands.
Read the log after every run (§Log Mandate). Honour this preamble until the lane is DONE.
ANCHORS: bim-ootb `viewer/lib/room_walker.js` (the substrate — `spineMap`, `storeySpine`,
`_rasterizeSpine`, `_openings`, `storeyVoids`) · `common/room_graph.js` (the shipped router,
BYTE-UNCHANGED by this lane so far) · `viewer/navigate_find.js` (the Find panel UI) ·
`prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` (the running log).
```

## §0 READING MAP — every document in this lane, and what is in it

Paths are relative to `prompts/` in the `bim-compiler` repo. Sizes are a rough guide to depth, not
importance. **Titles and sizes are read off the files; the one-line summaries are from their own
headings — this map is an index, not a re-reading of all 1.5 MB.** Where a doc is superseded it says so.

### Start here (this lane, in order)
| Doc | Size | What it is |
|---|---|---|
| **ROOM_PATHING_SUBSTRATE.md** (this file) | 20K | The concept: architecture, invariants, failed trials, method rules, prior art |
| `Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` | 276K | **The running log.** §21.x dated sections, all witness output. Start at its last §START HERE |
| `Modeller/DISC_Walker/ROOM_INJECTION_HYBRID.md` | 64K | The Modeller-side settled conclusions this lane ports — real rooms drive placement, guessed rooms display-only |
| `ROOM_INJECTION_CONSOLIDATED_REVIEW.md` | 12K | Whole-lane review prepared 2026-07-17 for a refactor session — the best short overview before this file existed |
| `ROOM_INTELLIGENCE_SCOREBOARD.md` | 24K | The standard reporting baseline. One WORKS / one GAP per row — keep it that shape |

### Pathing and routing
| Doc | Size | What it is |
|---|---|---|
| `Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md` | 140K | Room graph 2.0 — walk like a human, not door-to-door. The design this substrate feeds |
| `Modeller/DISC_Walker/PATH_LEGAL_SEGMENTS.md` | 20K | No chord through the void — legality of a drawn segment |
| `Viewer/FLY_TOUR_CORRIDOR_GRAPH.md` | 220K | Corridor + stair occupant path, the camera-facing consumer of all of this |
| `Modeller/DISC_Walker/STR_ROUTEWALKING_SPEC.md` | 20K | The structural walker, mirror of the MEP RouteWalker |
| `Modeller/DISC_Walker/BIMEYES_NAVIGABILITY_CHECK.md` | 8K | Coherence checker: collision + navigability + quantity bounds |

### Room identity — what a room IS, before you can path between them
| Doc | Size | What it is |
|---|---|---|
| `Modeller/DISC_Walker/ROOM_WALKER_JS_PORT.md` | 32K | Retire the offline `compile_rooms.py`, port to JS, compute-once. The compiler this substrate reads |
| `Modeller/DISC_Walker/ROOM_TAXONOMY_STRATEGY_2026-07-12.md` | 52K | Room taxonomy — strategy and formula only |
| `Modeller/DISC_Walker/COMPILE_ROOMS_TYPE_INFERENCE.md` | 20K | Guessing room FUNCTION where no `IfcSpace` ever named it |
| `ROOM_WALKER_PHASE_INVARIANCE.md` | 16K | Same walls in, same rooms out, in any coordinate frame |
| `SPARSE_WALL_ROOM_INFERENCE.md` | 24K | The real-world IFC case: too few walls to close a room |
| `ROOM_TYPE_TEMPLATE_CLASSIFIER.md` · `ROOM_TYPE_DOOR_ACCESS_SIGNAL.md` | 24K · 16K | Two classifier approaches — template match, and door-access as a signal |
| `DISCWALK_PLANT_ROOM_INDUSTRIAL_TAXONOMY.md` · `DISC_WALK_ROOM_TYPE_AWARE.md` | 16K · 12K | Industrial/institutional taxonomy, and routing discipline placement by room type |
| `FIND_PANEL_PLANT_ROOM_GATE_FIX.md` | 12K | PLANT_ROOM false positives + the missing class gate |
| `Modeller/DISC_Walker/SAMPLECASTLE_REAL_ROOMS_RECONCILE.md` | 20K | ✅ CLOSED — recorded as the wrong branch of the problem, not a gap |

### Substrate, geometry and the walker underneath
| Doc | Size | What it is |
|---|---|---|
| `Modeller/DISC_Walker/RESUME_MODELLER_WALK_SUBSTRATE.md` | 68K | The walk substrate itself — the Modeller's "2nd principle" doc |
| `Modeller/DISC_Walker/RESUME_DISC_WALKER_ENVELOPE_BOUND.md` | 268K | The disc-walker's own long history: area-scaled measurement, envelope-bound placement |
| `Modeller/DISC_Walker/WALKER_GUARDS_ROSETTASTONE_SPEC.md` | 48K | Walker guards, RosettaStone walk-back, calibrated confidence |
| `Modeller/DISC_Walker/ARC_GEO_FETCH_SPEC.md` | 36K | ARC-only geo fetch — the Modeller's "1st principle" doc |
| `Modeller/DISC_Walker/SPACE_SCOPED_DISC_INSTALL_VISION.md` | 28K | Space-scoped heavy-discipline install |
| `Modeller/DISC_Walker/SPEC_MESH_FIT_GRAFT_HEAL_ENGINE.md` · `SPEC_SEAM_HEALING_ENGINE.md` | 52K · 16K | Mesh fit / graft-and-heal, and seam healing — SPEC ONLY, not built |
| `Modeller/DISC_Walker/XRAY_FIXTURE_CLASSIFICATION_FIX.md` | 16K | Fixture vs structure misclassification |
| `HANDOFF_ghost_xray_rooms.md` | 8K | Ghost X-Ray + Rooms handoff |

### Doctrine — read before overriding anything above
`docs/internal/WalkerDoctrine.md` is the LOCKED core doc: the walk axis is BUILDING-CLASS, discipline
is a `WHERE` column, small/residential buildings walk `duplex_rules.db` and NOT Terminal rules.
⚠ `disc_walker.dwInit` defaults to `terminal_rules.db` for back-compat — a residential caller must
pass `duplex_rules.db` explicitly.

## §1 The problem, in one paragraph

An IFC file says where the walls and doors are. It does **not** say how to walk from one room to
another. Nothing in the file states "the ward connects to the corridor through this door." A viewer
that wants to fly a camera between two rooms, route a cable tray, or answer "how far is the fire exit"
has to **derive** that connectivity from geometry. This lane builds that derivation and proves it.

## §2 The architecture — the user's own framing, which turned out to be the right one

User, 2026-08-02: *"during injection, that metadata is laid down. The rest is algorithm that is
abstract for 1. Any room (both origin and target) to reach that spine. 2. Traverse within that spine
where the path issues from and to."*

Two layers, and the separation is what makes it tractable:

- **Layer 1 — the SPINE.** Everywhere you can walk *without opening a door*. Corridors, lobbies,
  landings, open-plan areas. It is one connected region per storey if the building is normal.
- **Layer 2 — ATTACHMENT.** Every room reaches the spine through its door, at some depth. Depth 1
  opens straight onto the spine; depth 2 is reached through another room; and so on.

Routing then has no geometry in it at all: leave the origin room to the spine, traverse the spine,
enter the target room. **The cost of this design is one requirement — every room must have at least
one CORRECT door link** — because errors compound with depth. A bad link at depth 1 mis-attaches one
room; at depth 3 it orphans a whole subtree.

## §3 The substrate — what actually gets built, in order

All of this lives in `viewer/lib/room_walker.js`. Per storey, at `RES = 0.20 m` per cell:

1. **Stamp the walls** into a grid — `_rasterizeSpine()`. Each wall is drawn as an oriented rectangle
   from `element_transforms`.
2. **Carve the door voids** — a door is a *hole in a wall*, and the wall stamp does not know that.
   Each door (and each door-hosted `IfcOpeningElement`, where the file has them) is subtracted.
   Carve depth is `pierce = 10 * RES` = 2.00 m.
3. **Keep the PRE-CARVE mask** — `§PRECARVE`. Enclosure must be measured on the walls *as modelled*,
   with all doors shut. This is the mask that answers "what is indoors".
4. **Dilate by `SEAL = 2` cells** (0.40 m) — closes hairline gaps where wall stamps do not quite meet,
   which would otherwise let the outdoors flood into the building.
5. **Flood from outside** — whatever the flood cannot reach is enclosed floor.
6. **Split enclosed floor into POCKETS** — connected components. Roughly, rooms.
7. **Find OPENINGS** — `_openings()`. Scan the band that is blocked but is not real wall, march both
   axes up to `reach = 10` cells (2.00 m); if the two sides land in different pockets, they are open
   to each other. Then ask the only question that defines the spine: **is there a door in that gap?**
8. **Fuse across DOORLESS openings** → layer-1 groups. The spine is the largest group.
9. **Link across DOOR openings** → the layer-2 attachment graph. BFS from the spine gives each group
   its depth. Depth `−1` means *stranded*: no door path to the spine at all.

## §4 The invariants — settled by measurement, do not re-litigate

| # | Invariant | Established by |
|---|---|---|
| I1 | Enclosure is derived from the PRE-CARVE mask, never from a re-stamped door plug | §21.30–§21.32 |
| I2 | Carving may never reduce enclosed floor — retention ≥ 90%, observed 100% | §T5 |
| I3 | An aperture's SOURCE does not matter; its DEPTH does | §21.30 vs §21.38 |
| I4 | `rotation_z` is in RADIANS | §21.27 |
| I5 | Tier C (door bbox) can never be removed — 6 of 7 fixtures have no opening geometry | §21.29 |
| I6 | A connectivity gain must survive a width cap, or it is phantom | §21.33 |
| I7 | Vertical access (stairs) must be excluded before calling anything unreachable | §21.35 |

## §5 The trials — what was tried, what it cost, and what killed it

This is the expensive part of the document. Each of these looked right at the time.

| Attempt | Result | What disproved it |
|---|---|---|
| Proximity door↔room adjacency | **Dead.** A third of doors claimed 3–4 rooms | §DOOR-APERTURE: over-claims 36%/12% → 0 |
| Corridor by SHAPE (aspect ratio) | **Dead.** Inherits the room compile's fragmentation | 16–38 corridor fragments |
| Corridor by `hallway_backbone.js` | **Dead.** Same inheritance | same |
| Corridor by BETWEENNESS | Best of the three, still not enough | 1 component but measured on an uncarved raster |
| `rotation_z` was being read as degrees | **RETRACTED — the claim was wrong** | It is radians; §21.26 asserted otherwise, §21.27 withdrew it |
| Readmit the seal halo to build the spine | **Dead.** The halo is one ribbon round the whole wall net | Rooms merged wherever a wall merely ENDS; 16,594 cells |
| Raw walls, no dilation | **Dead.** The outdoors floods in and swallows the corridor | Exterior region 1,094 m² vs a 134 m² spine |
| Admit every floor-level opening (`cur`) | **Dead — phantom.** Looked like the best result in the lane | Width sweep: 104% of the gain came from 25 m/55 m atrium voids |
| Re-close doors by re-stamping a plug | **Dead.** The plug is thicker than the wall by construction | Cost Clinic 312 m² of 1,980 m²; §PRECARVE replaced it |
| "Aperture provenance is the stranded cause" | **Dead — and the refutation itself was wrong twice over** | Tier B vs C: 295→295. But that test never varied pierce DEPTH, so it could not test what it claimed to (§21.36) |
| Lengthen the `_openings` march | **Rejected on measurement** | Would have fixed 1 crossing of 51 |
| Deepen the pierce to `10*RES` | **LANDED** | LTU unroutable 45.3% → 18.4%, all gates green |
| "`area >= 2.0` filter is hiding the break" | **Wrong.** The filter hid it from reports only | The ENGINE's own depth is −1 for all 41 far ends |
| "The carved doorway pocket terminates the graph" | **RETRACTED (§21.43).** They pass traffic | §DP5: all 8 far-end groups carry 2–5 DOOR-MATCHED openings each |
| Merge pockets whose cells are all carve-provenance | **Falsified before coding.** Separates, but reaches nothing | §DP1: 0.0% of >10 m² pockets misclassify — but §DP4: 1 of 8 far ends |
| "41 far ends leave the cluster" | **Wrong count.** 41 crossing RECORDS over 8 groups | §DP4 deduplicated them |
| `rel_contained_in_space` as a verification oracle | **RETRACTED (§21.44).** It is our own output | Written by `compile_rooms.py:1295`; 100% `RM_*`/`≈` rows; 1 space per door |
| Door-footprint window test for component contact | **Dead — the instrument, not the building** | Verdict inverted with window width: SLACK=2 → 100% "no door", SLACK=8 → 23% |
| Fix the transposed void carve (the axes ARE wrong) | **CORRECT AND WITHDRAWN.** Every metric worsened | §O3 phantom 20% PASS → 94% FAIL; LTU 18.4% → 23.0%. Patch kept, see §21.43b |

## §6 What it cost, and the five method rules that came out of it

Four sessions, roughly fifty measured findings, and **eight claims that had to be retracted** —
including four of the assistant's own, repeated across four sections before being caught. The rules
below are not aspirations; each one is named after the failure that produced it.

1. **Write the gate before the fix.** All three of §21.27's carving bugs were caught by gates, not by
   reading code — and one presented as a clean-looking 100%, not as an error.
2. **A gate that cannot see a failure class is not coverage.** The leak-signature test passed at 8.5%
   on a raster that had lost 57% of its floor: carving an exterior wall lets the flood *escape*, it
   does not merge pockets into a blob. Ask what a new gate structurally cannot detect, and add that too.
3. **Set the pass threshold to a MATERIAL effect before running.** A test that passed on 320 → 319
   proved nothing and briefly read as success.
4. **When a conclusion is about a MECHANISM, an aggregate that does not vary that mechanism cannot
   test it — and will look like confirmation.** This produced the single most expensive error in the
   lane: "cause (2) is refuted", inherited unchallenged through four sections. Dumping 195 boundary
   crossings of ONE cluster exposed it in a single run. **Enumerate before you aggregate.**

5. **A verdict that flips with the width of its own window is not a measurement — report the sweep,
   not the number.** §DP7/§DP8 asked "does a door's footprint touch both components" with the engine's
   own window and answered "100% of stranded area has no door to the spine — a scope limit". The same
   probe at a wider window answered 23%, verdict "detection". Neither number was reportable. The
   instrument that held instead used the door's OWN geometry (march the panel normal) and was still
   published with a reach sweep and a blindness control (§DP9/§DP10, control: the march sees both
   sides for only 32%/27% of doors — so its zero is not yet proof of absence, and saying so is part
   of the result).

Corollary, learned the same way: **verify the checker before the code under test.** Two self-inflicted
bugs — grouping by the wrong key, and treating radians as degrees — were caught only because the
number was absurd.

## §7 Generality — the standing constraint on every rule here

User, 2026-08-02: *"as long as this can generally apply to most IFCs a user may import."*

Measured across the shipped fleet:
```
Clinic 254/0 · Duplex 14/0 · HHS 133/0 · Hospital 440/0 · Hospital_3 440/0
JKR 65/0 · Terminal 135/0 · LTU 606/3368            (IfcDoor / IfcOpeningElement)
```
**One building in nine carries opening geometry.** So any rule that needs it is an upgrade, never the
method. That is why the aperture resolver is tiered (A: `bom_tree` VOIDS/FILLS from a live user
import · B: `IfcOpeningElement` · C: `IfcDoor` bbox) with **C as a floor that is never removed.**

Two kinds of rule, and the difference matters:
- **Provenance rules** ask *where did this come from* — no constant, no sweep, no-op where
  inapplicable. Example: "a pocket made entirely of carved void cells is a doorway, not a room."
- **Threshold rules** ask *how big is this* — they need a measured sweep to justify and they must be
  re-swept when anything upstream changes. Example: `W:3.0`, justified only because the attributed
  widths have p90 = 3.60 m and the phantom cliff sits above 6 m.
**Prefer provenance. When a threshold is unavoidable, sweep it and record the sweep.**

## §8 Fixture notes — the buildings themselves

- **LTU_AHouse is the best-modelled fixture we have**, not the worst: 125,698 elements, 601 of 606
  doors carry a real void, 0 missing transforms, 3.2% unassigned storeys, 8 disciplines, 42,071 pipe
  segments. Every fix in this lane moved it hard. Its one defect: all 3,368 `IfcOpeningElement` carry
  `storey='Unknown'` — attribute them by Z against door sills, never by the column.
- **Clinic is the constrained one**: 0 opening geometry, 32% unassigned storeys, 43 elements with no
  transform. It can only ever use tier C, which is exactly why it is the fixture that proves generality.
- **Terminal is federated with two storey-naming conventions in one file** — Malay (`Aras Tanah`,
  `Aras 01`–`Aras 04`) *and* English (`GROUND FLOOR LEVEL`, `03 SECOND FLOOR LEVEL`), plus 70%
  genuinely unassigned. Any storey matching that assumes one convention silently mis-files half of it.

## §9 The gate suite — run all of it after ANY substrate change

| Witness | Asserts |
|---|---|
| `witness_room_path_aperture_tier.js` | §T1 tier fidelity · §T2 tier-C non-regression · §T4 no-leak · **§T5 enclosure retention ≥90%** |
| `witness_room_path_overlink.js` | §O2 width sweep · **§O3 phantom share must not rise** |
| `witness_room_path_stranded_cause.js` | §SC1 cause split · **§SC3 independent breaks** |
| `witness_room_path_cluster_boundary.js` | §CB1 separation kind · §CB4 vertical access · **§CB5 sealed suites** |
| `roompath_diagnostics/clinic17_dump.js` | §C40 per-crossing enumeration · §C40c far-end groups |

**Report BREAKS, not stranded rooms.** 55 stranded rooms on Clinic were 11 independent breaks; the
rest were chains hanging off them. Quoting the room count overstates the work by the cluster size.

## §10 Where it stands, and what is next

Measured on the current substrate (`W:3.0` default, `pierce = 10*RES`):
```
LTU     stranded  18/277   unroutable 18.4%   (room-graph baseline 32.4%)  — beaten, and phantom-tested
Clinic  stranded  50/186   unroutable 49.3%   (baseline 43.3%)             — still short
```
**§21.41's root cause is RETRACTED (§21.43, 2026-08-02) and so is its fix.** The doorway pockets do
not terminate the graph — each of the 8 far-end groups carries 2–5 door-matched openings. The "41 far
ends" were 41 crossing records over those 8 groups. The provenance merge separates cleanly (0.0% of
>10 m² pockets misclassify) but would have moved 1 group, so it was never written.

**Open root cause (§21.43): the void carve is TRANSPOSED, and the tuned constants sit on top of it.**
`_rasterizeSpine` normalises every void to `max`/`min` and re-stamps it long-along-world-x, so any
door whose bbox is longer in Y is carved 90° wrong — 46% of Clinic's doors, 57% of LTU's. (Rotation
cannot correct it: `storeyVoids`/`storeyWallsRot` select `COALESCE(t.rotation_z,0)` with no alias, so
rotation reaches the raster for 0 of 3,167 LTU voids and 0 of 4,979 walls. That is harmless only
because the fixtures store world AABBs — repairing the alias without re-reading bbox as a local
extent would shear every wall in the building.)

**The correct fix makes every routing metric worse, and that is the finding.** §O3 phantom share
20% PASS → 94% FAIL, LTU 18.4% → 23.0%, Clinic 49.3% → 50.4%. The wrong carve removes ~2 m of wall
ALONG the face and that over-removal is what was merging pockets; `W:3.0` and `pierce=10*RES` were
both swept against it. **So the 18.4% is not a clean win — part of it is bought by a geometric
error.** Next is the joint (W, pierce) re-sweep on corrected axes; the patch is kept as
`roompath_diagnostics/patch_21_43_transpose.diff`, not applied.

Nothing from this lane is deployed. `common/room_graph.js` and `viewer/navigate_find.js` are
byte-unchanged. Current work sits on bim-ootb `review/roompath-redundancy`.

## §11 PRELIMINARY — how others solve this, and what we should take from them

⚠ **This section is background knowledge, NOT measured on our fixtures**, except where a number is
given. Treat every claim about another system as *to be verified* before it is acted on. It is here
to stop us re-inventing solved parts and to name the places our approach is genuinely different.

**The five families:**

1. **Space-boundary graphs (the OpenBIM-native way).** `IfcSpace` + `IfcRelSpaceBoundary` (2nd level)
   states which spaces share which wall, and `IfcRelFillsElement` says which door fills which opening.
   Where the exporter wrote them, the connectivity is *authored*, not derived — no raster at all.
   **Why we cannot rely on it:** exporters routinely omit space boundaries, and our fleet confirms the
   pattern (0 of 7 fixtures carry `bom_tree` VOIDS/FILLS). This is the same argument as our tier A.
2. **IndoorGML (OGC).** Formalises exactly the two-layer model of §2 as a *Node-Relation Graph*:
   spaces become nodes, adjacency and connectivity become two separate edge types, by Poincaré
   duality. **Take from it: the vocabulary.** Our "spine / attachment / depth" is its dual graph under
   another name, and aligning terms would make this lane legible to anyone from that world.
3. **Navigation meshes (games — Recast/Detour lineage).** Voxelise the walkable surface → filter
   walkable spans → segment into regions → build contours → convex polygons → A* + funnel string-pull.
   **Our pipeline is structurally the same thing**, which is reassuring rather than surprising.
   ⭐ **The one to actually learn from:** that family hit our §21.41 defect long ago — narrow passages
   fragmenting into their own tiny regions — and solves it with an explicit *region merge* step
   (minimum region area, plus merging small regions into their largest neighbour). Our named fix is
   the provenance variant of the same move, and is stronger because it needs no area constant. Worth
   reading their region-merge stage before implementing ours.
4. **Medial axis / straight skeleton / space syntax.** Derive corridor centrelines from the floor
   polygon, or rank spaces by betweenness. **We tried betweenness (§21.25) and it was the best of
   three failed corridor heuristics** — but every one of them was measured on an uncarved raster, so
   the family is not fairly refuted, only shelved.
5. **Authoring-tool features (Revit "Path of Travel" and similar).** Build a navigation surface per
   level and treat doors as explicit portals. **Take from it: doors as first-class portals** — which
   is precisely what our layer-1/layer-2 split does, and confirms the design choice.

**~~⭐ FINDING WHILE WRITING THIS~~ — RETRACTED 2026-08-02 (§21.44). It was not authored data.**
The claim was that `rel_contained_in_space` carries authored door↔space relations (208/606 LTU,
98/254 Clinic) and could serve as this lane's first independent oracle. **It is our own output.**
```
scripts/compile_rooms.py:1295   DELETE FROM rel_contained_in_space WHERE space_guid LIKE 'RM_%'
                       :1314    then re-inserts every element whose XY centre falls in a compiled room
IfcSpace rows in spatial_structure:  Clinic 118/118 and LTU 369/369 are RM_*-guid, "≈"-prefixed
spaces-per-door histogram:           Clinic 98 doors -> 1 space each;  LTU 208 -> 1 space each
```
Checking derived links against it would be checking the pipeline against itself, and it could not
express an adjacency in any case — every door names exactly ONE space, never the pair it joins.
**This lane still has no independent oracle.** The genuinely authored relations named earlier in this
section (`IfcRelSpaceBoundary`, `IfcRelFillsElement`) remain the thing to look for; neither fixture
carries them, which is why the raster exists at all.

**Where our approach is genuinely better, stated without hype:** it derives connectivity from a raw
IFC that has no space boundaries, no authored navigation data, and often no opening geometry — in the
browser, with no preprocessing server — and every rule is gated by a falsification suite (§9). The
tiering discipline (§7) and the provenance-over-threshold preference are, as far as we know, not
standard practice in any of the five families above.

**Where we are behind:** we have no independent oracle for link correctness — the candidate above
turned out to be our own output — no published benchmark to compare against, and our funnel/string-pull stage (§21.15–§21.18)
is still unresolved where the game-engine lineage has had a settled answer for years.
