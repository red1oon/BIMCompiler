<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM GRAPH REAL-AABB — door positions may carry the same coarse-centre bug cross_edges.js just shipped a fix for

```
# ⚠ DO NOT REMOVE — SCOPE
This is a FOUND-NOT-ACTIONED finding, not an approved change. `bim-ootb common/room_graph.js` is
the most real-world-regression-hardened file in this codebase (see its own header history — every
one of its 9 edge kinds exists because a specific real building broke the previous assumption).
Do NOT edit door-position sourcing here without reading this file in full AND re-reading
`common/room_graph.js`'s own header end to end first. A position-source change here can silently
reshuffle which room a door's E1 edge picks in an ambiguous 3-way junction — the exact failure
class §AMBIGUOUS-RESIDUAL-RESCUE and §ISLAND_BRIDGE in that file were written to fix. Read the log
after every run (Universal Protocol Log Mandate) — a green witness count alone is not evidence this
didn't quietly change which doors match which rooms.
SIBLING FIX (the reason this doc exists): bim-ootb #1744 / BIMCompiler #108, §GEODB-WIRING-BUG —
`modeller/cross_edges.js`'s equivalent bug (SampleCastle abuts disagreement 843→11). This doc is
that finding, cross-checked against `common/room_graph.js`, NOT yet fixed, NOT yet even measured
for real edge-count impact — only the raw position offset is measured (§2 below).
CONCEPT DOC (read first if new to this lane): `prompts/Viewer/FindRooms/ROOM_PATHING_SUBSTRATE.md`.
WORKING LOG (the file's full regression history): `prompts/Viewer/FindRooms/
VIEWER_FIND_PANEL_ROOM_ACCURACY.md` — 3800+ lines, do not re-derive what §21.x already settled.
LIVE CALLERS (every one confirmed by grep, 2026-09-18 — none pass a geoDb, because the API has none):
  · `viewer/navigate_find.js:1231` — THE Find Panel's room-to-room path panel, the sensitive one
    the user flagged: `RG.buildGraph(A.dbQuery, { log: ... })`
  · `viewer/egress_sanity.js:162` — `RoomGraph.buildGraph(dbQuery, { log: function () {} })`
  · `viewer/rule_checklist.js:721` — same shape, log captured to an array
```

## §0 — What this is, in one paragraph

`common/room_graph.js` reads room and door positions straight from `spatial_structure.center_x/y`
(rooms) and `element_transforms.center_x/y` (doors) — the coarse, anchor-point position
`modeller/cross_edges.js` used to use too, and was just measured wrong: `center_xyz` is the IFC
local-placement ANCHOR, not the volumetric centre (bim-ootb #1744's own finding, `cross_edges.js`
header, §REAL-AABB). This doc asks the same question of `room_graph.js` that #1744 already answered
for `cross_edges.js`, and gets a partial, more nuanced answer — the fix is real for doors, structurally
impossible for rooms, and its actual impact on the graph's edges is UNMEASURED, unlike #1744 where
the before/after edge counts were the whole point of the fix.

## §1 — Rooms cannot be fixed this way. Doors can. This is not symmetric.

Checked directly against `DAGCompiler/python/extractIFCtoDB.py`'s `NON_GEOMETRIC_CLASSES` (line
~340): `IfcSpace` is listed — *"spatial container, no body"*. Rooms have **no mesh, no vertex blob,
nothing `real_geometry.js`'s `buildGeometryIndex` could ever resolve them against**. There is no
"more accurate" room position to fall back to — `spatial_structure.center_x/size_x` (or a footprint
built from bounding walls) is the ONLY room-shape data that exists. **Do not attempt a room-shape
fix here — there is nothing to fix it WITH.**

Doors are real `IfcDoor` elements with real geometry. They CAN be resolved the same way
`cross_edges.js` now resolves general elements — this is the part worth pursuing.

## §2 — Real measured door-position offset (SampleCastle, 2026-09-18)

Method: same as `cross_edges.js`'s own `_realAabb` — resolve each door's real vertex blob via
`RealGeometry.buildGeometryIndex`, rotate by `rotation_z`, translate by `center_xyz`, take the
world AABB centre, compare to the coarse `(center_x, center_y)` `room_graph.js` actually reads.
Read-only probe, no file changed, run against `modeller/SampleCastle_extracted.db` (geometry
embedded in the same file for this fixture — no separate `_geo.db` needed here).

```
total ARC doors: 205
doors with resolvable real geometry: 205/205
median offset: 0.0196 m   (~20mm)
mean offset:   0.0746 m   (~75mm — pulled up by outliers)
max offset:    0.2494 m   (~249mm)
doors with offset > 0.20m  (= room_graph's own DOOR_BUFFER_SLACK): 4/205
doors with offset > 0.10m  (= half the buffer):                    82/205 (40%)
```

**The 4 worst offenders (0.249m each) are all `"liftdeur"`** — Dutch for lift/elevator door. This
matters: `room_graph.js`'s own `isRoomDoor(name)` already excludes every `liftdeur`/`lift`/
`elevator` name via `NON_ROOM_DOOR_NAMES` BEFORE the E1/E2 buffer-matching logic ever runs (line
~121). **The single worst-offset category is already filtered out for an unrelated reason.** The
real exposure is the next tier: doors named `D3L`/`D3R`/`D1L` etc. at 175-177mm — real room-facing
doors, NOT excluded, with an offset close to (not exceeding) the 200mm buffer on this building.

**What this measurement does NOT tell you, and must not be assumed:** whether correcting these
positions actually CHANGES any E1/E2/ambiguous/orphan edge decision on this or any other building.
A 175mm shift could flip a borderline "distance ≤ buffer" candidate either direction, or re-rank
which of 2+ candidates is closest in an already-ambiguous 3-way junction. That is a *different*
question — **now measured, §2b below.**

## §2b — Edge-decision impact, measured 2026-09-18 (§4 items 1-2, by a dispatched verification agent)

**SampleCastle — the building §2's offset numbers came from — could NOT be graph-tested.**
`buildGraph()` needs a `spatial_structure` table (real `IfcSpace` rows) to create any room node at
all. Checked every SampleCastle copy reachable this session — `modeller/SampleCastle_extracted.db`,
`modeller/SampleCastle_ARC.db`, `modeller/SampleCastle_ARC_extracted.db`, bim-compiler
`deploy/buildings/SampleCastle_extracted.db`, `deploy/buildings/SampleCastle_library.db` — **none
carry `spatial_structure`.** SampleCastle appears never to have been run through room compilation in
any DB file accessible this session. §2's offset numbers are real; they were never connectable to
actual room-graph behaviour on that building. Don't assume SampleCastle is a usable regression bed
for the eventual fix without first finding or generating a copy with real `spatial_structure` rows.

**Duplex (14 ARC doors, all real-position-resolved) — real, measurable effect, and a methodology
trap caught along the way.** Offset here was larger than SampleCastle's: median 436mm, mean 457mm,
max 659mm. **8/14 doors (57%) had their actual matched edges change** between coarse and real
positions — but `stats.ambiguous`/`edges`/`ambiguousResidualRescued` were **identical in both runs**
(some doors flip INTO ambiguous while others flip OUT, netting to the same totals). **A summary-count
diff alone would have reported "no effect" — it takes a door-by-door edge diff to see it.** The
mechanism, precisely: in every one of the 8 cases the **primary E1 top-2 room match never changed**
— only the ambiguous-residual (E9) layer moved, i.e. whether a 3rd room gets bridged through that
doorway. Example (door `1hOSvn6df7F8_7GcBWlS8Z`): coarse = E1 A101↔A104 ambiguous×3 + E9 bridges to
A103 and A101; real = E1 A101↔A104 only, no E9 bridges. Example (door `2OBrcmyk58NupXoVOHUvR4`,
opposite direction): coarse = clean E1 B204↔B201 only; real = same E1 pair but now ambiguous×3 + E9
bridges to B204 and B205. All 8 changed doors are the building's mirrored A/B twin-unit doors — one
distinct behavioural pattern observed twice, not 8 independent layouts; treat the 57% figure as
building-specific, not a generalisable rate.

**SampleHouse (3 ARC doors, all resolved) — 0/3 changed.** Offset was large in absolute terms
(median 411mm, max 932mm) but too few rooms/doors for it to cross any matching threshold.

**Conclusion: this is not a non-issue.** The E9 ambiguous-residual layer — the exact mechanism
§AMBIGUOUS-RESIDUAL-RESCUE was written to fix in the first place (see `room_graph.js`'s own header,
the Clinic R31/R40/R42/R45/R58 island story) — is where real position accuracy measurably changes
behaviour. A fix here needs to get that layer right specifically, not just confirm the primary E1
match survives. And any future verification pass on this file must diff actual edges, never trust
aggregate stats alone — coincidental cancellation is real, confirmed live on Duplex, not hypothetical.

## §3 — Where in `room_graph.js` this touches (line refs current as of #1744's neighbour commit)

- The door query itself — `buildGraph()`, the `doorRows` SELECT (~line 398-403): reads
  `t.center_x, t.center_y, t.center_z, t.bbox_x, t.bbox_y, t.bbox_z` from `element_transforms`
  only. No geometry table involved at all today.
- `rectDist()` (~line 407) and the door-matching loop (~line 493-587): every E1 (`cands.sort` by
  `rectDist`), E2 (lone-door rescue), E4 (exit) and E9 (ambiguous residual) decision runs off these
  same `dx, dy` values.
- The `doorwp` waypoint nodes (`nodes[guid] = { ..., cx: dx, cy: dy, ... }`, several sites): the
  SAME coarse position also becomes the rendered waypoint the Find Panel's polyline hugs — so a
  fix here would also move the drawn line, not just which edges exist.
- **API surface gap, confirmed by grep (§ heading block above):** `buildGraph(dbQuery, opts)` has
  no `geoDb` parameter today, and none of its 3 real callers pass one. Unlike `cross_edges.js`
  (where the parameter existed and simply wasn't wired — #1744's actual bug), this needs a NEW
  parameter added to the function signature AND threaded through every call site, which is a
  larger surface than #1744 touched.

## §4 — What a session picking this up should do, in order

1. ✅ **DONE 2026-09-18 — measure the actual edge-decision impact before writing any fix code.**
   See §2b. Real effect confirmed on Duplex (8/14 doors, E9 layer specifically); none on SampleHouse
   (too small a building); SampleCastle untestable (no `spatial_structure` in any available copy).
2. ⚠ **PARTIALLY DONE — measure on more than one building.** Duplex + SampleHouse done (§2b).
   **Hospital + HHS now measured too (2026-09-18, post-fix, using `buildings/Hospital_silent.db` /
   `buildings/HHS_Office_Federated_silent.db` — the bake-pipeline output DBs; the `_ARC.db` copies of
   these buildings have no `spatial_structure`/geometry at all and cannot run this test, same class of
   gap as SampleCastle).** Confirms the doc's own caution below — the Duplex rate does NOT generalise:
   - **HHS** (100 rooms, 133 doors, all resolved): **8/135 door edges changed** — real churn, same
     order of magnitude as Duplex. 65/100 `circulation_distance` rows shifted (some closer, some
     farther — mixed direction, consistent with §2b's mechanism). **The displayed "Longest path to
     exit" stat itself moved: 150 → 151 steps.** This is the first confirmation the fix changes a
     number the user actually sees on screen, not just an internal graph edge.
   - **Hospital** (only 8 `IfcSpace` rooms — the known slab-coverage gap, see MEMORY `bim-ootb-t10-
     hospital-slab-coverage`; most measured distance is via synthetic `CORRIDOR_ROOM::` circulation
     nodes, not real rooms): **0/429 door edges changed**, all 13 `circulation_distance` row shifts
     sub-centimetre noise, **steps stat unchanged: 143 → 143**. On this building the fix fires (440/440
     doors resolved) but has no measurable effect — a real, building-specific null result, not a bug.
   - Clinic, Terminal: still untested — no `_silent.db` (or any DB with both `spatial_structure` and
     geometry) found in this session for either building; `Terminal_silent.db` is confirmed gone from
     the repo (`STRUCTURAL_SANITY.md` §933: only an external `~/Downloads` symlink target remains).
     Same open gap as item 6's SampleCastle case — needs a session with access to those fixtures.
3. ✅ **DONE 2026-09-18 (PR pending, bim-ootb `feat/room-graph-real-aabb`) — added real-position
   resolution as an ADDITIVE, gracefully-degrading path.** Same shape as `cross_edges.js`'s own fix,
   but NOT `opts.geoDb` on `buildGraph()` itself — that file's own contract is "DB/file I/O-free...
   runs identically in the browser and in a node witness" (its header, verbatim), and
   `RealGeometry.buildGeometryIndex` needs a live `db.exec()`-capable handle, which would have broken
   that contract. Instead: a NEW sibling module, `common/door_real_position.js`
   (`resolveDoorRealXY(db, geoDb)`), ports `cross_edges.js`'s private `_realAabb`/`_buildRealVerts`
   (neither is exported there) and is called by each of the 3 live call sites BEFORE `buildGraph()`,
   which now takes the result as `opts.doorRealXY = { doorGuid: [x,y] }` — a plain lookup map,
   keeping `room_graph.js` itself untouched w.r.t. DB access. Wired into all 3 call sites named above
   (`navigate_find.js` `_roomGraphFor()`, `egress_sanity.js` `evaluate()` passthrough, `rule_checklist.js`
   `showEgressSanity` — the latter resolves ONCE and reuses it for both of its own `buildGraph()`
   calls, since its own comment already asserts they must observe the same graph). The Viewer never
   loaded `real_geometry.js` before this (modeller-only until now) — added to `main.js`
   `loadNavigate()`'s lazy-load list alongside the new module, zero static-boot cost. **Coordinate
   caution resolved, not just assumed:** `real_geometry.js`'s own header notes the Modeller is
   Z-up-direct while the Viewer's render path needs a Y↔Z swap (`scene.js` `A.blobToGeometry`) — but
   that swap is feeding `THREE.BufferGeometry` for rendering only; `element_transforms`/
   `spatial_structure`'s raw DB frame (what `_realAabb`'s rotate-by-`rotation_z`/translate-by-
   `center_xyz` formula operates in) needs no swap in either app, which is also why this file could
   already compare room and door coarse positions directly with no swap before this fix existed.
   **Per §2b, the E9 ambiguous-residual layer is where this needs to be provably correct** — verified
   directly, not assumed: see item 4.
4. ✅ **DONE — measured + witnessed, not just baseline-diffed.** New witness
   `witness_room_graph_real_aabb.js` (bim-ootb repo root), 13/13 checks green
   (`w_room_graph_real_aabb.log`). Diffs the LITERAL per-door edge set (never aggregate `stats`, per
   the trap §2b already caught): on `modeller/Duplex_extracted.db` (21 rooms/14 doors, same ground
   truth `witness_room_graph_path.js` uses), **14/14 doors' real positions resolved, 8/14 changed
   matched edges — reproduces §2b's own number exactly** — and independently confirms, per door, that
   every one of those 8 changes is confined to the E9 layer (0 doors had their E1 primary match move).
   `stats.edges`/`stats.ambiguousResidualRescued` are byte-identical coarse vs real despite the real
   churn underneath — §2b's "a summary-count diff alone would report no effect" trap, reproduced
   live. On `modeller/SampleHouse_extracted.db`: 3/3 resolved, 0/3 changed — reproduces §2b's measured
   null result exactly. **Graceful-degrade proven, not assumed:** `opts.doorRealXY` omitted vs an
   empty `{}` map produce a byte-identical graph; a real building with rooms/doors but NO geometry
   table (`modeller/Duplex_ARC.db`) produces a byte-identical graph whether or not the (empty)
   resolved map is passed; `resolveDoorRealXY(null, null)` never throws. This IS the baseline-diff
   this item asked for — a direct behavioural-equivalence proof (every path with no real geometry is
   provably a no-op by construction: `common/room_graph.js`'s door loop only overrides `dx,dy` when
   `opts.doorRealXY[guid]` exists), stronger than a textual `git diff` against `origin/main`.
5. ✅ **DONE — re-ran the Find Panel's own path witnesses, zero NEW regression (one PRE-EXISTING
   failure confirmed unrelated, not swept under the rug).** `witness_room_graph_path.js` 15/15.
   `witness_room_path_raster_polyline.js` came back pass=5 fail=2 (G3 interactive-timing and G4
   no-raster-legality both fail, root cause `Hospital storeys=0 rooms=0` — a fixture this worktree
   can't load, unrelated to this fix). **Verified, not assumed:** `git stash`'d every change in this
   fix and re-ran the same witness against clean `origin/main` in this same worktree — byte-identical
   pass=5/fail=2 with the SAME two failing checks and the SAME `Hospital storeys=0 rooms=0` line, so
   this is a pre-existing environment gap, not a regression this fix introduced. `witness_room_path_ui.js`
   SKIPs (its own message: `buildings/Duplex_extracted.db not present locally, OCI-only`) — a separate
   pre-existing fixture gap, same class of issue. None of the three witnesses pass `opts.doorRealXY`,
   so they all exercise the pre-fix coarse code path unchanged — consistent with the byte-identical
   result. New focused witness added: `witness_room_graph_real_aabb.js` (bim-ootb repo root), see item 4.
6. **Before trusting SampleCastle for anything room-graph-related:** find or generate a copy with a
   real `spatial_structure` table, or drop it from the regression set for this specific fix.

## STATUS — 2026-09-18: FIX BUILT + WITNESSED (§4 items 1-5 done); PR open, not yet merged

`common/room_graph.js` gains an optional `opts.doorRealXY` (a door's real world-AABB centre,
resolved by a new sibling module `common/door_real_position.js`, never touching `room_graph.js`'s
own DB/file-I/O-free contract) — additive, gracefully-degrading, wired into all 3 live call sites.
13/13 checks green in the new `witness_room_graph_real_aabb.js`, reproducing §2b's own Duplex (8/14
doors changed, 0 E1-primary drift) and SampleHouse (0/3 changed) numbers exactly, plus 4 explicit
graceful-degrade checks. The 3 pre-existing Find Panel path witnesses re-run clean, with one
pre-existing (not caused by this fix — verified via a stash/baseline comparison in the same
worktree) fixture-availability failure left exactly as it was. bim-ootb branch
`feat/room-graph-real-aabb`, PR opened — **merge is the user's call**, per this doc's own header
("the most real-world-regression-hardened file in this codebase").

Two decisions this doc made on its own authority, still standing: (1) **do not attempt a room-shape
fix** (§1) — closed by a structural fact (no room geometry exists), not a judgement call;
(2) **this is not a non-issue** (§2b) — real edge-decision changes are confirmed on real building
data, specifically in the E9 ambiguous-residual layer, and now fixed + witnessed (§4 items 3-5).
**Item 2 update, 2026-09-18 (post-fix building sweep):** Hospital + HHS now measured (`buildings/
*_silent.db`) — HHS shows real churn (8/135 door edges, **the on-screen "Longest path to exit" stat
itself moves 150→151 steps**, `rule_checklist.js`'s own headline number); Hospital shows the fix
fires (440/440 doors resolved) but produces no measurable change (0/429 edges, steps unchanged
143→143) — a real building-specific null, and further proof the Duplex rate does not generalise.
Still open: Clinic/Terminal (no testable DB found this session) and item 6 (SampleCastle has no
accessible `spatial_structure` copy) — both the same class of missing-fixture gap.
