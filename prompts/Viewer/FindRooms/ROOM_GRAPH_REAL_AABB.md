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
   Hospital, HHS, Clinic, Terminal — the buildings `room_graph.js`'s own header cites for its
   existing edge-kind regressions — still untested. Given Duplex's real effect was concentrated in
   mirrored/symmetric layouts, buildings with more organic room adjacency (Hospital, Clinic) may
   behave differently — don't assume the Duplex rate or pattern generalises.
3. **Add `geoDb`/real-position resolution as an ADDITIVE, gracefully-degrading path** — same shape
   as `cross_edges.js`'s own fix: resolve when possible, fall back to today's coarse `center_x/y`
   when geometry is absent (module missing, no `geometry_hash`, unresolvable blob) — never a hard
   failure, never worse than today's behaviour when data is short. Thread the new parameter through
   all 3 call sites named above. **Per §2b, the E9 ambiguous-residual layer is where this needs to
   be provably correct — a fix that only checks the primary E1 match is unverified.**
4. **Baseline-diff against unmodified `origin/main`, on every building tested, before merging** —
   the exact discipline that caught `witness_e2e_gridmove_real` and `witness_e2e_save` regressing in
   #1744's own sweep, and that §2b just proved matters here too (identical `stats`, real edge
   changes underneath). **Diff actual edges, never trust aggregate counts alone** — confirmed live,
   not a hypothetical caution.
5. **Re-run the Find Panel's own path witnesses** (`witness_room_graph_path.js`,
   `witness_room_path_raster_polyline.js`, `witness_room_path_ui.js` — bim-ootb, found via the
   existing test suite) specifically, since `navigate_find.js:1231` is the sensitive live surface
   the user named.
6. **Before trusting SampleCastle for anything room-graph-related:** find or generate a copy with a
   real `spatial_structure` table, or drop it from the regression set for this specific fix.

## STATUS — found, measured, real effect confirmed (§2b); not designed, not built

No code written. No schema/API change made. Two decisions this doc makes on its own authority:
(1) **do not attempt a room-shape fix** (§1) — closed by a structural fact (no room geometry
exists), not a judgement call; (2) **this is not a non-issue** (§2b) — real edge-decision changes
are confirmed on real building data, specifically in the E9 ambiguous-residual layer, so a picking-up
session should treat §4 item 3 (the fix) as worth doing, not as contingent on first proving impact —
that step is done.
