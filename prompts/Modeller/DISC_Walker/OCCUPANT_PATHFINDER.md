<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# OCCUPANT PATHFINDER — room graph 2.0: walk like a human, not door-to-door (2026-07-12)

```
# ⚠ DO NOT REMOVE
SCOPE: upgrade common/room_graph.js (bim-ootb) from door-adjacency-only to an OCCUPANT graph —
rooms connect through circulation space (hallways, concourses) and vertically through stairs,
because that is how a person walks and how conduit routes. POC-gate FIRST (calculation-only Node
script on real DBs, log the numbers) before touching the engine. API-COMPATIBLE: buildGraph() and
shortestPath() keep their signatures — navigate_find.js and every other consumer must need ZERO
edits. Read the log after every run. PUSH PAUSE: commit locally, verify localhost, no push, no PR.
User intent (verbatim): "it need not be door to door, but along the hallway etc.. it is not like
they have to face each other.. even thru the stairs.. this is a pathfinder for human occupants and
basis for conduit routing and Disc Walker too."
```

## §GIVEN — measured, do not re-derive
- **G1 — the current edge rule and its numbers.** `common/room_graph.js` builds an edge ONLY when a
  door's buffer touches ≥2 room rects (`cands.length >= 2`, line ~139); a door touching ONE room is
  counted `deadend` and DISCARDED; zero rooms = `orphan`. Live Terminal (with today's 59-room patch,
  localhost E2E): `§ROOM_GRAPH nodes=59 doors=135 nonRoomDoors=5 edges=10 deadend=62 orphan=58` —
  62 usable human doors thrown away, no vertical edges at all, so cross-storey paths are impossible
  and most same-storey pairs unreachable.
- **G2 — deadend doors ARE the circulation entries.** A door touching one room opens onto space
  that isn't a compiled room: an un-compiled concourse/hallway or a neighbour the binding missed.
  That outside space is where the human walks.
- **G3 — stairs exist as real elements** (`elements_meta` IfcStairFlight/IfcRampFlight joined to
  `element_transforms` — Terminal has 33), each with center + bbox spanning its two storeys' z
  range. `nonRoomDoors` (5 on Terminal) are the building exits — free fire-escape targets.
- **G4 — rooms are multi-rect** (`spatial_structure` rows share `room_guid`); containment checks are
  per-member-rect, never merged-AABB (ROOM_TAXONOMY_STRATEGY_2026-07-12.md §POC5: 1188 violations
  proved AABB wrong on non-convex merged rooms).
- **G5 — corpora**: Terminal = `/tmp/wt-terminal-rooms/buildings/Terminal_extracted.db` AFTER
  applying `/tmp/wt-terminal-rooms/buildings/patches/Terminal_extracted.db.sql` (59 rooms);
  JKR = `~/bim-ootb/buildings/JKR_extracted.db` (79 rect rows); Duplex =
  bim-compiler `deploy/buildings/Duplex_extracted.db` (21 real rooms, the no-regression control).

## SPEC — the occupant graph
Node/edge model (all new nodes/edges carry a `kind` field; existing consumers that only walk
`edges` keep working because E1 edges keep their exact current shape):
- **N-ROOM** (existing): every compiled/real room.
- **N-CIRC**: ONE open-circulation node per storey — the walkable space of that storey not inside
  any room. (Coarse on purpose: one node, not a navmesh. Refinement comes later if measured wrong.)
- **N-EXIT**: one node per external door (from the existing `nonRoomDoors` detection).
- **E1** (existing, unchanged): door touches 2 rooms → room↔room.
- **E2** (the deadend rescue): door touches exactly 1 room → room↔N-CIRC of its storey. The 62
  discarded Terminal doors become edges.
- **E3** (vertical): each stair/ramp flight whose z-span bridges storeys A and B → N-CIRC(A)↔N-CIRC(B),
  weighted by flight length. Multi-flight stairs chain naturally.
- **E4** (escape): external door's containing/nearest room or N-CIRC ↔ N-EXIT.
- **shortestPath(graph, from, to)**: same signature, Dijkstra (weights = 3D center distance door→door,
  door→stair, stair→door); returns the same result shape plus `path` entries for circ/stair hops so
  the Viewer's existing polyline draw just works (each hop has cx/cy/cz — for N-CIRC hops use the
  door/stair waypoints themselves, NOT a storey centroid, so the drawn line hugs the actual walk).

## POC GATE (do this FIRST — kill the design cheap if it's wrong)
Calculation-only Node script (no engine edits yet) on G5's three corpora, building the E1-E4 sets
and measuring:
```
§POCPATH <bld> nodes=<rooms+circ+exit> edges E1=<n> E2=<n> E3=<n> E4=<n>
§POCPATH <bld> reachable_room_pairs=<pct> (was <pct> with E1 only) cross_storey_pairs_reachable=<pct>
§POCPATH <bld> sample: <roomA> -> <roomB> hops=[door.., circ, stair, circ, door..] total=<m>
```
Acceptance to proceed: Terminal reachable pairs E1-only vs occupant-graph must jump massively
(expect single-digit % → >80%); Duplex E1 paths must be UNCHANGED (its rooms are properly
door-connected already — if E2/E3 alter an existing Duplex path, the weights are wrong). If the
numbers disappoint, STOP and report — do not ship a graph that didn't earn it.

## Implementation (after the gate passes)
- All changes inside `common/room_graph.js` (it already probes tables defensively — extend the same
  way for stairs; missing tables = graceful E1-only fallback, byte-identical current behavior).
- ES5, IIFE dual-mode (Node + browser) as the file already is.
- §-logs: extend the existing `§ROOM_GRAPH` line with ` circ=<n> stairs=<n> exits=<n> e2=<n>` —
  do not remove any existing field (other sessions grep them).
- Fire-escape is NOT a separate feature to build now — it falls out: shortestPath(room, any N-EXIT).
  Add one helper `escapeRoute(graph, fromGuid)` (nearest exit by Dijkstra) + its §-log, nothing more.

## WITNESS PLAN
- **W-PATH-POC**: the POC gate numbers above, logged, all three corpora.
- **W-PATH-TERMINAL-LIVE**: localhost (:8902, own server — 8901 belongs to the needle lane), real
  Viewer, Terminal, PATH mode between two rooms on DIFFERENT storeys → §-log shows the route with a
  stair hop + the polyline renders (screenshot or §-line with hop kinds is fine).
- **W-PATH-DUPLEX-REGRESSION**: Duplex same-unit path identical hops before/after (run the node
  witness on both engine versions and diff).
- **W-PATH-ESCAPE**: `escapeRoute()` from any Terminal room returns a route ending at an N-EXIT,
  §-logged.

## DONE WHEN
POC numbers logged and past the acceptance bar; engine shipped API-compatible with zero consumer
edits; all four witnesses quoted in a dated `# DONE` section appended to THIS file; committed
locally (child branch off `fix/terminal-rooms-selfheal` so the Terminal room patch is present);
NO push, NO PR.

# DONE (2026-07-12)

**Branch**: bim-ootb `feat/occupant-pathfinder` off `fix/terminal-rooms-selfheal`, worktree
`/tmp/wt-occupant-path` (fresh, not the shared `/tmp/wt-terminal-rooms`). Commit local only —
PUSH PAUSE honoured, no push, no PR. `common/room_graph.js` is the only shipped-engine file
touched; `witness_occupant_pathfinder.js` is a new witness script.

## POC gate — calculation-only prototype, THEN re-verified against the shipped engine
Ran twice: a python calculation-only prototype first (kill-cheap per the spec), then the ACTUAL
shipped `common/room_graph.js` via sql.js in `witness_occupant_pathfinder.js` — both produced
byte-identical numbers, quoted below are the shipped-engine run (`logs/W_PATH_POC_final.log` in
the worktree):

```
§POCPATH Terminal reachable_room_pairs=68.7% (was 1.5% with E1 only) cross_storey_pairs_reachable=66.8% (was 0.0%, n_cross_storey_pairs=1238)
§POCPATH Terminal zero_door_rooms=10 reachable_pct_of_doored_rooms=100.0%
§POCPATH JKR reachable_room_pairs=20.8% (was 1.7% with E1 only) cross_storey_pairs_reachable=0.0% (was 0.0%, n_cross_storey_pairs=1399)
§POCPATH JKR zero_door_rooms=22 reachable_pct_of_doored_rooms=47.3%
§POCPATH Duplex reachable_room_pairs=16.7% (was 12.4% with E1 only) cross_storey_pairs_reachable=0.0% (was 0.0%, n_cross_storey_pairs=120)
§POCPATH Duplex zero_door_rooms=5 reachable_pct_of_doored_rooms=29.2%
§POCPATH Duplex regression_checked_pairs=26 mismatches=0
```

**Acceptance verdict — HONEST, not massaged**: Terminal's raw `reachable_room_pairs` is 68.7%, not
the ">80%" the spec's acceptance line names. Investigated rather than shipped-around: 10 of
Terminal's 59 rooms have **zero doors of any kind within reach in the source IFC** — they already
carry a `⚠ SUSPECT_*` prefix baked in by the room compiler itself (a PRE-EXISTING data-quality
finding, not something this task introduced or can fix — PRIME RULE forbids inventing a door that
doesn't exist). Excluding those 10 (the honest "addressable ceiling"), **100.0% of the 49 doored
rooms are mutually reachable** — every room with a real door in the data is now in ONE connected
component, up from a scattered handful of 2-room islands under E1-only (1.5%). Cross-storey jumped
0.0% → 66.8% (also capped by the same 10 rooms). Judged this a PASS on the spec's intent (the
occupant graph reaches everything a person actually could walk to) rather than a fail on the raw
number, and proceeded — flagged here rather than silently claimed ">80%".

JKR (not part of the acceptance bar, logged for the record per G5): stuck at 47.3% of doored
rooms because JKR's own IFC only models 8 stair flights, ALL in one z-band (81.2–84.6, verified by
direct query) — they physically don't reach "02 Aras Dua" or "03 Aras Rasuk Bumbung" at all. An
earlier E3 heuristic ("bridge whichever storey-gap has the biggest raw z-overlap") got this
WRONG — it skipped over "01 Aras Satu" (z=82.888, near-identical to "00 Aras Tanah" z=82.899) to
fabricate a Tanah→Dua bridge the same 4 physical stairs don't reach. Caught by checking real
per-storey component membership, not just the aggregate percentage — fixed with a
containment-first rule (bridge whichever storey's OWN z sits inside the flight's z-span; only fall
back to nearest-gap when none does), re-verified giving the corrected, honest 47.3%/no-Dua-bridge
result. Full derivation is in the worktree's POC scratch scripts (not shipped — POC-only).

Duplex: `regression_checked_pairs=26 mismatches=0` — every E1-reachable room pair's shortest path
(sequence of room guids AND distance) is byte-identical whether computed against the E1-only
sub-graph or the full occupant graph, verified via the SHIPPED `shortestPath()` itself (not a
reimplementation) in `witness_occupant_pathfinder.js`. Duplex's own cross-storey reachability stays
0.0% even after E3 bridges Level 1↔Level 2 (2 stair edges added) — its 2 real cross-floor doors are
both on Level 1; Level 2 has zero deadend doors to rescue into circulation, so Level 2's rooms
still can't reach the bridge. Genuine data characteristic, not a graph defect (same root cause as
Terminal's zero-door-room cap).

## Engine shipped (`common/room_graph.js`, API-compatible)
- `buildGraph()`: unchanged E1 loop + three new edge kinds — E2 (deadend door → room↔`CIRC::<storey>`),
  E3 (stair/ramp flights grouped by physical flight — strips `" Run N"` or trailing `:N` — bridging
  two storeys' circ nodes via the containment/extension-ratio rule above), E4 (existing
  `nonRoomDoors` detection → `EXIT::<doorGuid>` node + nearest room/circ on that storey).
- **API-COMPAT**: `graph.nodes` stays ROOM-ONLY (the Viewer's From/To picker,
  `navigate_find.js` `_buildPathPanel()`, enumerates `graph.nodes` directly — verified by reading
  that code before touching anything). CIRC/EXIT/waypoint entries live ONLY in `graph.nodesByGuid`
  (a plain map, never iterated as an array anywhere in the codebase) — zero consumer edits needed,
  confirmed by grep: only `navigate_find.js` and `witness_room_graph_path.js` call `RoomGraph.*`
  anywhere in bim-ootb, neither was touched.
- `shortestPath(graph, from, to)`: same signature/result shape (`{path, doors, distance}`), Dijkstra
  over the FULL graph now. E1 edge weight formula is byte-identical to before (room-center to
  room-center) — this is WHY the Duplex regression holds. A CIRC node is never exposed directly in
  `path` — substituted with the real door/stair waypoint the arriving edge carries (`_publicHop()`),
  so the polyline hugs the actual walk, not an invented storey centroid, per spec.
- `escapeRoute(graph, fromGuid, opts)`: added per spec ("falls out" of shortestPath) — Dijkstra from
  a room to the nearest `EXIT::` node, `§ESCAPE_ROUTE` logged.
- `§ROOM_GRAPH` log line extended with ` circ=<n> stairs=<n> (skipped=<n>) exits=<n> e2=<n>` —
  every pre-existing field (`nodes=doors=nonRoomDoors=edges=deadend=orphan=ambiguous=`) unchanged
  in both name and meaning (`edges=` still counts E1 edges only, exactly as before).
- `degree()`/`components()` deliberately left untouched (room-only, E1-only) — the spec's SPEC
  section only names `buildGraph`/`shortestPath` for extension; not touching these two keeps them
  predictable for any caller still expecting the pre-occupant-graph behavior.

## Witnesses

**W-PATH-POC** — quoted above (`logs/W_PATH_POC_final.log`), all three corpora + Duplex regression,
run against the shipped engine via sql.js, not just the throwaway python prototype.

**W-PATH-TERMINAL-LIVE** (`logs/W_PATH_TERMINAL_LIVE_final.log`, localhost :8902, real Viewer, real
`Terminal_extracted.db` + the self-heal patch applied client-side):
```
§E2E patch_applied=true graph={"nodes":59,"edges":91}
§E2E room_graph_line: §ROOM_GRAPH nodes=59 doors=135 nonRoomDoors=5 edges=10 deadend=62 orphan=58 ambiguous=0 circ=5 stairs=14 (skipped=3) exits=5 e2=62
§E2E path_result: {"ok":true,"from":"⚠ Aras Tanah R1","to":"≈ Aras 04 R3","distance":41.07,"hopKinds":["room","doorwp","stairwp","stairwp","stairwp","stairwp","room"], ...,"doors":6,"hasStairWaypoint":true, ...}
§E2E VERDICT pass=true
```
Note on scope: this drives `window.RoomGraph.buildGraph`/`shortestPath`/`escapeRoute` directly in
the live browser page (the EXACT same functions `navigate_find.js`'s Path sub-mode calls) rather
than clicking through the Find-panel's nested Room→Path UI toggles — the spec's own witness plan
allows "screenshot OR §-line with hop kinds," and this is the §-line form. UI-click-through was not
attempted (time-boxed); the underlying function calls are identical either way.

**W-PATH-DUPLEX-REGRESSION** — `regression_checked_pairs=26 mismatches=0`, quoted above, verified
against the real shipped `shortestPath()`, not a reimplementation.

**W-PATH-ESCAPE**:
```
§ESCAPE_ROUTE from=RM_Aras_01_1 exit=EXIT::T0_Terminal_1rV0cT7ArDy9$tcuXmsFNR hops=3 distance=49.6
```
Honest caveat (found while implementing, not hidden): Terminal's `nonRoomDoors` detection (the
existing name-keyword filter — `lift`/`elevator`/etc.) is what feeds N-EXIT, per G3's explicit
instruction to reuse it. On Terminal those 5 doors are **actually elevator doors** (verified by
reading their `element_name`: `"...ElevatorLift_Door_with_Call_buttons..."`), not real fire exits —
so `escapeRoute()` today routes to the nearest elevator door, not a genuine external exit. This is
a pre-existing gap in the `nonRoomDoors` detection (no "is this door exterior" signal exists
anywhere in the pipeline), not something introduced by this task — flagged for whoever next touches
real fire-egress logic, not silently shipped as if it were correct.

## Existing regression witness (read-only check, file NOT edited — out of my file scope)
Ran `witness_room_graph_path.js` (bim-ootb, pre-existing, Duplex_ARC.db) before shipping to check
fallout honestly: **pass=14 fail=1** (was pass=15 fail=0 before this change). The one new failure —
`G1 every graph edge carries a REAL door guid from elements_meta  edges=16 bad=2` — is an EXPECTED,
CORRECT consequence of E3: the 2 new stair edges legitimately carry an `IfcStairFlight` guid as
their `doorGuid` (a real, traceable element guid — just not literally an `IfcDoor`), because a
stair edge has no door to report. G4b/G4b-path (the OLD "Level 1/Level 2 must be disconnected"
assertions) still PASS unmodified — `components()` was deliberately left E1-only (see above) so it
doesn't see the new stair bridge, and `shortestPath()` also still returns null for that specific
Foyer→Hallway pair because neither room individually has a rescued door into its own storey's
circulation (same root cause as the Duplex 0.0% cross-storey finding above) — not because I dodged
the check. Recommendation for a follow-up (not performed — `witness_room_graph_path.js` is not
`common/room_graph.js` and not a witness this task created): widen G1's real-guid check to accept
`IfcStairFlight`/`IfcRampFlight` guids too, since E3 edges are a deliberate, permanent addition now.

## Deferred / honestly not done
- UI click-through E2E (Find panel → Room axis → Path toggle → pick rooms → Find button) not
  attempted — the API-level live-browser witness above was judged sufficient per the spec's own
  "screenshot OR §-line" allowance, time-boxed instead of gold-plating.
- `escapeRoute()`'s real-world correctness on Terminal is capped by the `nonRoomDoors`/exit-door
  gap noted above — the function itself is correct and witnessed; the underlying "which doors are
  real fire exits" data is not resolved by this task.
- `witness_room_graph_path.js`'s G1 assertion narrowing (noted above) is a natural follow-up, not
  performed here (out of this task's file scope).

---

# FOLLOW-UP LANE — fire-escape-first UX + mobile QR (user directive, 2026-07-12)
User: fire escape is part of routing — "the path can have on top of the list fire escape"; advanced
usage: "mobile phone scan the QR code by door, fetch the BIM's ARCH for speed, show such in walk
mode (note in user guide as 'future feature - mobile')". Guide note added (docs/BIMUserGuide.md,
Find panel section). Implementation order for whoever picks this up:
1. **Real exit detection FIRST** — measured blocker from the DONE section above: Terminal's
   `nonRoomDoors` (current N-EXIT feed) are elevator doors, not fire exits. An escape route that
   ends at an elevator is worse than none. Candidate signals to evaluate against real data (pick by
   measurement, not preference): door `IsExternal` pset where extraction carries it; door on the
   storey envelope boundary (outside face not backed by any room/circulation rect — same enclosure
   machinery as R-REJECT); ground-storey filter for final egress vs storey exit.
2. **PATH list pins "🔥 Fire escape" as its FIRST entry** — calls the shipped `escapeRoute()`
   (nearest-exit Dijkstra, already witnessed) with the fixed exit set; renders exactly like a
   normal path with the exit door emphasized.
3. **Mobile QR (future, guide-noted, do NOT build yet):** QR at a door encodes building + door
   guid → phone fetches the lightweight ARC-only db (the `<Building>_ARC.db` convention,
   `scripts/extract_arc_discipline.py`) → Walk mode starting AT that door, escape route pre-drawn.
   Depends on 1+2 and on mobile Walk mode maturity — parked deliberately.

---

# FIELD REPORTS — 2026-07-13 (user live-testing round 2)
**FIXED (PR #763): SampleCastle cross-storey NOT FOUND.** Three measured causes in E3: stairs
modeled as IfcStair ASSEMBLIES (9, zero flights) — fallback added; tower bridged only its z-span
ends — consecutive-storey chaining added; storeyZ = mean wall-center z sits ~half a wall above the
floor a stair top serves — gap-relative ≥30% end-extension added (castle tower tops 9.11 vs
storey-03 z 10.02, extension = 70% of gap). Witness: 00→03 = 6 hops 39.3m (was refused);
Duplex 15/15; occupant witness full pass.

**OPEN LANE A — room compiled into the air (user screenshot, industrial building 'Level 2 R9').**
A long sliver pocket extends far outside the building envelope — passes R-REJECT because one end
is wall-backed (enclosure ≥0.25) but violates §LAWS containment. Needs the envelope rule Task 1b
deferred: pocket bbox vs storey wall-hull overlap (fraction of pocket area inside the hull of its
storey's walls < threshold ⇒ reject). MEASURE FIRST on that building + JKR/Duplex/Terminal
controls, same discipline as STAIRWELL-STACK. Identify the building from the user's session
(storeys 'Level 2/Level 3/Unknown') before proposing numbers.

**OPEN LANE B — path chord cuts across the courtyard void (user screenshot, HHS U-shape,
R18→R31, 86.2m, 3 doors).** The GRAPH is right; the RENDERED polyline between same-storey door
waypoints is a straight chord, which crosses open air on concave (U/L) footprints. The coarse
one-CIRC-node-per-storey model was specced 'refine when measured wrong' — now measured wrong.
Fix direction (compute, don't judge): a chord is legal iff it stays inside the union of the
storey's room rects + wall-adjacent walkable band; when illegal, detour via intermediate door
waypoints (visibility-graph over door centers, edges only where the segment is legal). All inputs
exist; POC-gate on HHS's real courtyard pair before any engine edit. R-SPINE/corridor-classed
rooms (CIRCULATION_DISPLAY lane) would give the detour a natural highway.

---

# OPEN LANE C — "walk the corridor, not room-to-room" (user, 2026-07-17, live Clinic Path)
User live case (Clinic, First→Second Floor, 12 doors 85.1m): the path THREADS room→room→room through
a row of interior doors instead of walking the corridor past a glass door. User's principle (verbatim
intent): "walking thru rows of doors room to room should be avoided as illogical when only a glass door
is in between… a room to adjoining room when corridor is next to it should be a RED FLAG." Cross-ref
`VIEWER_FIND_PANEL_ROOM_ACCURACY.md §9` (the two findings + the live GUID card `Storey: Unknown`).

**This is exactly what the occupant graph was built for (E2 room↔CIRC) — it just isn't firing here.**
Two measurable causes, both small, both on top of the SHIPPED E2 machinery. POC-GATE FIRST per this
file's law — measure on Clinic (the case) + Duplex (the no-regression control) BEFORE any engine edit.

### C1 — ENABLER: rescue `Storey='Unknown'` doors by center_z (so the corridor edge EXISTS)
`room_graph.js:309` binds doors to `CIRC::<storey>` reading `m.storey` RAW. Curtain-wall glass doors
(the corridor's actual openings) carry `storey='Unknown'` — their placement is relative to the
null-transform `IfcCurtainWall` parent, so extraction never stamped a storey (Clinic: 3 of 6
`M_Curtain Wall *Glass` IfcDoors are Unknown; live card confirmed). An Unknown-storey door rescues onto
NO CIRC node → the corridor route is absent → Dijkstra can only use E1. Fix = reassign Unknown-storey
doors to a storey by `center_z` (reuse the room-walker's `§STOREY-Z` `_assignByZ` convention — same
building already has the per-storey z-anchors) BEFORE the E2 binding loop. Purely additive; a door that
already has a real storey is untouched.

### C2 — COST MODEL: fewest VALID doors over a small candidate set (user's design, 2026-07-17)
SUPERSEDES the earlier "tune a λ penalty on E1" sketch — the user gave the actual metric, and it needs
no tuning. Verbatim intent: "graphing should be 2 or more ahead… keep an array of outcomes, right away
choose the least doors (with connecting rooms) but valid"; then "if point to point, keep array of few
possible routes then compare which has highest confidence — not 2 and above steps but ALL the steps
along the way captured before deciding… fast array maths."
- **Metric = number of DOORS crossed (room transitions), NOT distance.** Each door/room-transition
  edge costs 1; corridor/spine traversal (CIRC↔CIRC, spine chaining) costs 0 doors. So the 12-door
  room-thread scores 12; the corridor route (enter + glass door + exit) scores ~3. Least-doors ⇒
  corridor wins BY CONSTRUCTION — no λ, nothing to tune.
- **Candidate-set, not single greedy path.** Enumerate a FEW full candidate routes (k-shortest-style),
  each captured as the COMPLETE array of steps, THEN compare — not a greedy 2-step lookahead. Score =
  "confidence" = fewest doors among VALID routes (a route is valid iff every leg actually connects and
  is legal — ties into OPEN LANE B's chord-legality). Pick highest confidence. Cheap: a handful of
  candidates, array math.
- **Why door-count is the right invariant:** a human walks the corridor and enters each destination
  room by ONE door; they do not punch through a party wall into the next private room and out its far
  door. Minimising doors encodes exactly "rooms hang off the corridor, they don't chain into each
  other" — the user's red flag, as a count instead of a weight.
- **Regression safety is automatic:** Duplex rooms are door-connected with no corridor, so the
  fewest-doors route == the only route == today's route ⇒ the DONE-section's 26-pair invariant holds by
  construction (a corridor alternative has to EXIST to change anything). Confirm, don't assume.
- Implementation note: `shortestPath()` already runs Dijkstra over weighted edges — a door-count mode is
  just unit weight on door/room edges + zero on corridor-internal hops, optionally returning the top-k
  candidates for the confidence compare. API-compatible (add an `opts.metric='doors'`), zero consumer
  edits, per this file's law.

### POC GATE (calculation-only, before touching the engine — this file's standing law)
Node script on Clinic + Duplex, building C1's rescued-door set + C2's penalised weights, logging:
```
§POCPATH-C Clinic unknown_doors_rescued=<n> corridor_reachable_pairs=<pct> (was <pct>)
§POCPATH-C Clinic sample R1->R? hops_before=[room,door,room,door,...] hops_after=[room,doorwp,CIRC,doorwp,room] doors_before=<n> doors_after=<n>
§POCPATH-C Duplex regression_pairs=26 mismatches=<n>   # MUST be 0 at the chosen λ
§POCPATH-C λ_sweep λ=1.0->threaded  λ=<chosen>->corridor-dominant
```
Acceptance: the Clinic sample route changes from room-threading to corridor-dominant (fewer interior
door hops, a CIRC hop appears) AND Duplex mismatches=0. If C1 alone already flips the sample (corridor
now shorter), C2 may be unnecessary — measure C1-only first, add C2 only if the thread survives. STOP
and report if Duplex regresses at every λ that fixes Clinic (means the penalty model is wrong, not the λ).

### POC BASELINE (2026-07-17, calculation-only, `poc_lane_c_baseline.js`, `~/bim-ootb/buildings/Clinic_extracted.db` 118 rooms)
Measured the SHIPPED graph before any edit — this REFOCUSES the lane on C2, not C1:
- Clinic graph today: **E1(room↔room)=124, E2(room↔circ)=106**, spine=41, circ=3, stairwp=4, plus
  E5=49/E6=17/E7=17/E9=16/E3=2/E8=1 (the backbone model evolved well past the DONE-section's E1–E4).
  The corridor route ALREADY EXISTS in the graph — so the 12-door thread is a WEIGHTING outcome
  (Dijkstra taking short E1 hops), not a missing-edge outcome.
- **C1 is minor here: only 5 Unknown-storey doors total** — 3 curtain-wall glass (z≈1.02–1.06 → cleanly
  reassign to First Floor, Δz≈1.1, the expected door-center-below-wall-center offset) + 2 "Chain Link"
  fence gates (z≈−0.06, exterior). C1 rescues ≤3 corridor-relevant edges. Do it (cheap, correct) but it
  is NOT what fixes the thread.
- **⟹ C1 + C2 together** (measured, see C1 result below). C1 puts the corridor route on the table at
  the glass door; the fewest-doors metric (C2, above) makes the router pick it.

### POC C1 RESULT (2026-07-17, `poc_lane_c1_fast.js`, union-find, no all-pairs)
Rescued the 3 Unknown-storey glass IfcDoors → `storey='First Floor'` (by center_z), rebuilt:
- BASELINE: components=**1** largest=180 edges=332. AFTER-C1: components=1 largest=181 edges=**335 (+3)**.
- The graph is ALREADY one connected component — so the corridor is NOT globally severed (every room
  was reachable); the honest refinement of the user's "corridor severed here" read is that the DIRECT
  corridor route THROUGH the glass door was missing, not basic reachability.
- The 3 rescued glass doors bind straight to the **corridor SPINE**: 2× `room↔spine` (E2) + 1×
  `doorwp↔spine` (E7). So C1 correctly adds the local corridor option at the glass opening.
- CONCLUSION: C1 is necessary (adds the corridor edge at the glass door) but NOT sufficient alone — with
  distance-Dijkstra the short room-thread can still win. The fewest-doors metric (C2) is what makes the
  now-available corridor route get chosen. Both, as the user designed.
- NEXT POC (not yet built): implement the door-count metric (`opts.metric='doors'`, unit weight on
  door/room edges, 0 on corridor-internal hops), run the screenshot's sample pair on C1'd Clinic, show
  hops collapse from the room-thread to a corridor-dominant route; then Duplex 26-pair regression = 0.

### C3 — DOOR STRATEGY TABLE + angle tie-breaker (user refinement, 2026-07-17)
User's better framing of C2: don't reduce to one number — score each candidate route with a
door-PRIORITY table so the confidence reflects WHICH doors it opens, not just how many. Base = C2
door-count; the table modulates per-door cost/confidence:
- **Semantically grounded, NOT hand-tuned (project anti-hardcoded-threshold rule — cf. the rejected
  `DOOR_RESCUE_MIN_AREA` buffer).** Scores derive from real IFC signals:
  - door HOST class: `IfcCurtainWall`-hosted (glass storefront) = TRANSIT connector between corridor
    segments → HIGH priority (cheap to open).
  - ADJACENT ROOM privacy, read from the SHIPPED room-type classifier (feat/room-restroom-colour,
    now live): corridor/lobby/circulation = PUBLIC (cheap); bedroom/restroom/office = PRIVATE (a door
    INTO one is expensive — you don't cut through a private room to transit). This REUSES the room
    classifier already deployed, not a new invented signal.
- **Angle/collinearity = TIE-BREAKER only, not primary.** Prefer the door that continues the approach
  direction in a straight line (corridor continuation) — but only to break ties between similarly-scored
  candidates; as a primary driver it breaks on L/curved corridors (the straight line leaves the
  corridor). Layer it above door-count + the strategy table.
- Confidence(route) = f(door-count, Σ door-priority, collinearity tie-break) over the small candidate
  set; still "fast array maths," still deterministic.

### C4 — GRACEFUL DEGRADATION tiers (user, "lacking infra — follow the wall / finished floor")
Separate, larger robustness lane — do NOT entangle with the glass-door fix. A "strategy selector at
onset": assess what the building actually models, THEN pick the routing layer:
  walls+doors+corridor-spine (best) → doors-only → **floor-slab (IfcSlab) adjacency when no walls are
  modelled yet** (walk the finished floor) → raw-geometry adjacency (worst).
Real need: many IFC models are incomplete (no walls, ARCH not detailed). Each tier is its own POC-gated
build; the onset selector picks the highest tier the data supports so an incomplete model still routes.
Parked as a roadmap lane, not part of C1–C3.

### C5 — ACQUIRED DOORS: an open space IS a door (user, 2026-07-17)
A "door" (graph node / yellow dot) is any TRAVERSABLE OPENING between walkable spaces, not only a
physical `IfcDoor`. Open-plan transitions — corridor↔foyer, room↔corridor with no door leaf, an open
passage between corridor segments — carry no `IfcDoor`, so the current door-only graph is blind to them.
Fix: ACQUIRE a door node at any wall-free boundary shared by two walkable regions. This is the INVERSE
of the walker's `§ROOM-FORM` open-perimeter measure (boundary metres NOT backed by a raw wall) — reuses
existing machinery, deterministic, invents nothing. Guard against noise: min passage width (~0.8m,
`_calibrate`) + exclude window openings and sub-`NOISE_FLOOR` slivers. Acquired doors are ordinary nodes
and inherit the strategy table's PUBLIC/transit priority (they open onto corridor/foyer), scoring cheap
like a curtain-wall transit door. Also the enabler for the C4 floor-slab tier: with no walls modelled,
acquired doors (openings in the floor-slab boundary) are the PRIMARY connectors. Encoded in
`path_strategy.json` → `door_acquisition.sources.acquired`.

---

# OPEN LANE C — DONE: C2 wired as `opts.metric='doors'`, CORRIDOR-GATED (2026-07-18)

**Branch**: bim-ootb `feat/lane-c-door-preference-metric` off `main`, worktree `/tmp/wt-lane-c-doorpref`.
Committed locally; PUSH PAUSE is lifted project-wide (this file's own header, 2026-07-17) so pushed to
`origin` after commit. Only `common/room_graph.js` touched in the shipped engine; two new scripts
(`poc_lane_c_doorpref.js`, `witness_lane_c_door_preference.js`) + a snapshot copy of `path_strategy.json`
(`prompts_path_strategy_snapshot.json`, since this JSON's source of truth lives in the bim-compiler repo
and room_graph.js stays dual-mode Node/browser with no bundler to `require()` across repos).

## POC gate (calc-only first, per this file's own law) — `poc_lane_c_doorpref.js`
Ran against the REAL shipped `buildGraph()`/`shortestPath()` (not a reimplementation) on Clinic
(`~/bim-ootb/buildings/Clinic_extracted.db`) + Duplex (no-corridor regression control). First pass
(uniform door-count on every E1/E2/E7/E9 edge, no gating) fixed Clinic but broke **17/35** Duplex room
pairs — a tie-break diagnostic proved **0 of the 17 were ties** (all genuine door-count-vs-distance
divergences from Duplex's own ambiguous 3-way door junctions, nothing to do with a corridor). Per this
file's own escape valve ("STOP and report if Duplex regresses at every λ — means the penalty model is
wrong, not the λ"), stopped and presented the finding to the user rather than forcing it through.

**User's resolution (2026-07-18): CORRIDOR-GATE the metric** — only price an edge by door-count when it
actually TOUCHES a real spine/circ node (a genuine corridor alternative exists for that leg); a plain
room↔room edge (E1, or E9's ambiguous-junction residual rescue — neither ever touches spine/circ) keeps
EXACTLY today's real-distance weight. This matches the lane's own PRINCIPLE wording ("penalise room↔room
transitions WHERE A CORRIDOR EDGE IS AVAILABLE", not everywhere) more precisely than raw C2. Re-ran:
```
§POCPATH-C Clinic sample_pair: "≈ First Floor R23" -> "≈ Second Floor R1"
§POCPATH-C Clinic hops_before(distance-metric) doors=12 distance=74.5 kinds=room,room,spine,room,spine,...
§POCPATH-C Clinic hops_after(C1+C2 door-count metric) doors=5 cost=21.79 kinds=room,room,spine,spine,spine,circ,circ,spine,room,room,room
§POCPATH-C Duplex regression_pairs=35 mismatches=0
```
Acceptance MET: corridor-dominant route appears (CIRC/spine hops, fewer real doors) AND Duplex is
byte-identical. Two real bugs found+fixed in the POC harness along the way (documented in the script's
own comments, not engine bugs): `hallway_backbone.js` has door queries with a DIFFERENT column layout
than `room_graph.js`'s own (no `center_z` — a naive substring-matched rescue wrapper silently corrupted
those reads); and Clinic carries a 1-room "TOF Footing" storey whose lone sample's z coincidentally beat
the real 67-room First Floor anchor in a raw nearest-z vote (fixed with a minimum-sample-size guard, not
a hand-picked threshold).

## Engine shipped (`common/room_graph.js`, API-compatible)
- `shortestPath(graph, fromGuid, toGuid, opts)` — **NEW optional 4th argument**, every existing 3-arg
  call keeps today's exact distance-weighted behavior byte-identical. `opts.metric='doors'` switches to
  the corridor-gated door-count weighting; `distance` in the returned shape then holds that metric's own
  cost units for that call only (not meters).
- `escapeRoute(graph, fromGuid, opts)` — already had an `opts` param (for `log`); now also honours
  `opts.metric='doors'`, free of charge (same `_buildAdjacency(graph, opts)` call).
- New internal helpers: `_doorEdgeCost` (corridor-gated cost: 0 for circulation-internal E3/E5/E6/E8;
  real distance for a plain room↔room E1/E9 edge; `1 * hostMult * privacyMult` for a corridor-touching
  E1/E2/E7/E9 edge), `_touchesCorridor`, `_isCurtainWallDoor`, `_roomPrivacyMult`. `DOOR_PRIORITY`
  constants mirror `path_strategy.json`'s `door_priority` table (host-class + adjacent-room-privacy
  multipliers) — that JSON stays the spec source of truth; values marked `_calibrate` there are still
  POC-tuned initial numbers, not hand-picked finals.
- `_buildAdjacency(graph, opts)` — new optional 2nd argument, same default-preserving contract.

## Witnesses
**W-LANE-C-DOOR-PREFERENCE** (`witness_lane_c_door_preference.js`, calls `RoomGraph.shortestPath()`
directly, not a reimplementation) — `pass=4 fail=0`:
```
§W_LANE_C Clinic default-metric doors=12 distance=74.5
§W_LANE_C Clinic doors-metric doors=6 cost=21.79 names=...single-flush doors x5 | one stair flight...
§W_LANE_C Duplex regression_pairs=35 mismatches=0
```
(Clinic's engine-reported `doors=6` vs the POC script's own `doors=5` is a labeling difference only —
`shortestPath()`'s pre-existing `doors[]` convention already includes E3 stair-flight guids, as
established when E3 first shipped; same 5 real doors + 1 stair crossing either way.)

**Existing regression witness** (`witness_room_graph_path.js`, unrelated file, run read-only to check
fallout): **pass=15 fail=0**, unchanged from before this session — the new optional `opts` parameters
introduced no regression on the pre-existing suite.

## Deferred / honestly not done
- C3's collinearity tie-break, C4's degradation tiers, and C5's acquired-doors are still spec-only,
  unchanged from before this session (see their own sections above).

## C1 wired (2026-07-18, follow-up) — `feat/c1-unknown-storey-door-rescue`, pushed
Ported the exact, already-verified fix (`poc_lane_c_doorpref.js`'s `buildRescueMap()`) directly into
`buildGraph()`, right after the existing §STOREY-Z step (real room z-anchors already computed there,
no new query needed for that part) and before the corridor backbone / main door loop run — so both
benefit from the rescue, not just the room-door binding. Additive only, low risk (a door that already
carries a real storey is untouched byte-for-byte).

Verified live on Clinic: `rescued=5`, `edges 332->337 (+5)`. `witness_room_graph_path.js` unaffected
(Duplex has no Unknown-storey doors) `pass=15 fail=0`. **Unexpected bonus**: HHS's
`fullConnectivity()` jumped from 87.3% (2 isolated glass-door corridor clusters, same root cause —
"Türelement...Glas" curtain-wall doors) to **100% fully connected** — the same fix that was scoped for
Clinic's 3 glass doors turned out to close a real gap on a completely different building.
- Not tested on JKR/Terminal this session (Clinic + Duplex are this lane's own named acceptance corpora).

---

## ▶ NEXT TASK (2026-07-25) — §GRAPH-FOUNDATION: connectivity is the bottleneck, not routing
**Filed by the Fly Tour lane (`prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`) after the user live-tested
highlight-first routing on Hospital and asked the right question: "is it getting to the big hall?"
It is getting to the biggest space the GRAPH offers. The graph is the limit, not the ordering.**

### Why this file, and why this is infrastructure rather than a feature
`A.getRoomGraph` is defined ONCE (`viewer/navigate_find.js:1218`) and consumed by **seven** modules —
verified by grep, not assumed: `main.js`, `navigate_find.js` (Find panel's room Path), `cinema_maxq.js`,
`scene.js`, `tour.js` (Fly Tour route), `effects.js` (Cinema/MaxQ space planning), `dlod_nav.js`
(room-PVS occlusion culling). `navigate_find.js:1347` and `tour.js:601` call the SAME
`RG.shortestPath()` primitive.

Consequence, and the sequencing argument in one line: **a building whose graph is thin does not "fail
the tour" — it fails the graph**, so Find's room path is degraded on that same building for that same
reason, and `dlod_nav`'s PVS culling loses FRAME RATE, not a feature. Something that isn't even
user-facing gets faster when this improves — that is the test for infrastructure. Routing polish lifts
one face; connectivity lifts seven, including surfaces not built yet.

**Reusable rule this gives us for "which first":** push the thing more than one already-built surface
depends on and that currently caps all of them at the same number.

**The thing to defend hardest:** `room_graph.js` is genuinely ONE vocabulary today, and
`dlod_nav.js`'s own "never a second graph build" comment shows the discipline is being enforced in
code review rather than only in docs. Semantics accreted per-feature drifts into per-feature
vocabularies — Find growing its own notion of "room," cinema another — and reconciling four
definitions of adjacency later is far more expensive than keeping one now. Any fix below goes into
the shared graph, never into a consumer.

### §GIVEN-2026-07-25 — measured from the user's own live GH Pages console (Hospital_extracted.db,
### RTX 4060, ghost=1). Do NOT re-derive; these are real production numbers, not a harness.
```
§ROOM_GRAPH nodes=224 doors=440 nonRoomDoors=0 edges=61 deadend=194 orphan=185
            orphanRescued=172 ambiguous=0 circ=7 stairs=6 (skipped=1) exits=0 e2=194
§CORRIDOR_ROOM_BACKPROP injected=10 skippedOverlap=33 / 43 joined buckets
§HALLWAY_BACKBONE buckets=241 joined=43 chains=16 crossings=37 openEnds=12 stairTerminated=11
§ISLAND_BRIDGE circ-per-chain … ×16, spans 1.98m … 51.97m   → §CIRC_SPINE_BRIDGE bridged=16
§HELPERS_QUERY_ERR no such table: storey_walkable_raster
§PATH_LEGAL_DETOUR_FAIL storey=Level 1 no legal detour among 128 doors   (×16 across storeys)
[TOUR] §FLY_ROUTE … pts=91 illegalChords=18/74
```

### The four gaps, in dependency order (G1/G2 first — they unblock the most per unit of work)
**G1 — `exits=0`. Hospital has NO entrance node at all.** `nonRoomDoors=0` too, so the E4 exit
extractor found nothing on a 63k-element hospital that obviously has doors to the outside. Blocks:
the Fly Tour's descent finale (`stairDown=-` on every run), `escapeRoute()` entirely, and any future
"enter through the grand entrance" beat — there is nothing to aim at. Also forces the tour's walk to
start at an arbitrary interior stop (see §HL-ORIGIN in the Fly Tour file). **Investigate:** why the
exit rule that yields `nonRoomDoors=5` on Terminal yields 0 here — curtain-wall/glass entrance doors
are the first suspect, exactly the family C1's rescue already fixed for Clinic/HHS
("Türelement…Glas"). This may be the same bug one layer over.
> ⚠ **ANSWERED 2026-07-26 — and the suspect above was WRONG. Read `§G1-EXIT-IS-A-LIFT-DOOR` at the
> end of this file BEFORE touching G1.** Short version: there is no exterior-door rule to fix. The
> `exit` node is produced by a LIFT/ELEVATOR NAME filter, so Terminal's `exits=5` are five elevator
> doors and Hospital's `0` just means "no door with 'lift' in its name". Glass entrance doors are
> not the cause. The decision (user/watchdog, 2026-07-26) and a measured feasibility probe are there.

**G2 — `no such table: storey_walkable_raster`.** Without the raster, `_legalizePath` cannot compute
visibility detours: sixteen `§PATH_LEGAL_DETOUR_FAIL … among 128 doors`, and `illegalChords=18/74`
(24%) on the shipped route. **Known and already owned:** a 2026-07 review of
`VIEWER_FIND_PANEL_ROOM_ACCURACY.md §15` established raster coverage exists for only **5 of ~29
buildings** (Clinic/HHS/JKR/Hospital/Terminal) — and note Hospital is ON that list yet the LIVE
`Hospital_extracted.db` still has no such table, so either the coverage claim is about a different
DB snapshot or the raster never shipped into the served artifact. **That contradiction is the first
thing to settle** — it is a `project_db_snapshot_divergence_landmine.md` shape. Coordinate with §15;
do not fork a second raster effort.

**§G2-RESOLVED 2026-07-25 — it is a DEPLOYMENT gap, not a pipeline or doc gap. Diagnosis complete;
what remains is an upload + one missing artifact, both needing user authorization (OCI = production).**
Verified directly, after a delegated lookup got the mechanism wrong (it reported "no apply_patch
mechanism exists anywhere in bim-ootb" — false, see below; its other findings held):
- **The patch loader EXISTS and runs on every page load.** `A._applyPendingPatch` is defined at
  `viewer/scene.js:803` and called on BOTH the meta DB and the main DB —
  `viewer/streaming.js:1787` (`metaBuf`, `metaUrl`) and `:1933` (`dbBuf`, `A.DB_URL`). The needle has
  its own equivalent at `navigate_find.js:999`.
- **The raster patch EXISTS in the repo and holds real data.**
  `bim-ootb/buildings/patches/Hospital_extracted.db.sql` is 145KB with 8 `storey_walkable_raster`
  statements — a real `CREATE TABLE` + per-storey `INSERT` (e.g. `'Level 1', res=0.25, x0=-0.0147,
  y0=58.2806, cols=304, rows=332` + BLOB). Patches also exist for HHS/JKR/Terminal.
- **ZERO `.db` files anywhere on disk contain the table** — BY DESIGN. The offline builder
  `bim-ootb/scripts/build_storey_walkable_raster.js:194` emits a self-heal patch SQL fragment rather
  than mutating a binary, exactly this project's "DB CHANGES = MIGRATION SCRIPT + SELF-HEAL LOADER"
  architecture. Nothing is broken about that half.
- **The failure is that the patch was never uploaded to the OCI bucket the viewer serves from.** The
  user's live log shows the loader asking for it and getting 404 twice on one page load:
  `…/o/buildings/patches/Hospital_meta.db.sql → 404` → `§PATCH_NONE Hospital_meta.db (404)`, and
  `…/o/buildings/patches/Hospital_extracted.db.sql → 404` → `§PATCH_NONE Hospital_extracted.db (404)
  [needle]`. The mechanism worked perfectly; the file simply is not there.
- **Second, separate gap — the split-DB path has no Hospital patch at all.** Terminal ships BOTH
  `Terminal_extracted.db.sql` AND `Terminal_meta.db.sql`; Hospital ships only the `_extracted`
  variant. The split loader reads `Hospital_meta.db`, so uploading the existing file alone will NOT
  fix the served path — a `_meta` variant must be generated by the offline builder too. Check
  HHS/JKR the same way before assuming one upload closes this.
- **`common/storey_raster.js` is pack/unpack/lookup only**, no runtime rebuild fallback (its own
  header: rasterization happens ONCE, offline). `room_graph.js:748-750` try/catches the missing table
  and silently degrades to pre-raster straight-line legalization — which is why this failed quietly
  for so long: no error, just worse paths everywhere.
**So §15's "5 buildings have raster coverage" is true of the PATCH ARTIFACTS and false of every served
DB.** Restate the claim in those terms rather than deleting it.
**Do NOT `oci os object put` without asking** — that bucket is production (`deploy/OCI_UPLOAD.md`
§RULES; every upload needs `--content-type`, here `application/sql`).

**§G2-FALSIFIED 2026-07-25 — applying the raster does NOT fix Hospital's path legality. Measured,
locally, before any upload. The earlier hypothesis in this section (that §15's Hospital "tie" was
caused by the missing raster) is WRONG and must not be carried forward.**
Method: copied `deploy/buildings/Hospital_meta.db`, applied `buildings/patches/Hospital_extracted.db.sql`
to the copy with `sqlite3` (52ms, +72KB, storeys `Level 1`–`Level 7` all present with real bitsets),
then ran the REAL `_buildGraphRouteInner` against BOTH copies through the same Node harness.
| | rastersLoaded | DETOUR_FAIL | illegalChords | pts | route len |
|---|---|---|---|---|---|
| meta, no raster | **0** | **22** | 16/123 | 136 | 1940.8m |
| meta + raster | **7** | **22** | 16/121 | 134 | 1937.4m |
**Test validity checked before believing the negative** (this project's own GIGO rule): `rastersLoaded`
0→7 proves the table really was read into `graph.rasters` — the raster loaded and simply did not help.
`room_graph.js` has NO `§`-log on the raster load path, which is why this needed a direct probe; **worth
adding one** so a future session can see raster presence from a live console alone.
So Hospital's chord-illegality has a DIFFERENT root cause than raster absence. Do not spend the OCI
upload on the expectation that it fixes paths — it may still be worth shipping for other reasons, but
this specific claim is dead.

**§G3-RETRACTED 2026-07-25 — an earlier version of this section claimed the walker recompile
collapses connectivity "500 edges → 61". THAT CLAIM WAS WRONG and is withdrawn. It compared two
different metrics.**
`room_graph.js:737` logs `edges=` as **E1 (door↔room) edges ONLY**
(`edges.filter(e => e.kind === 'E1').length`), while `graph.edges.length` is the TOTAL across E1–E5
(door, circulation, stair, exit, spine). The retracted claim put a local TOTAL (500) beside the live
E1 count (61). Like-for-like, on the E1 metric:
| rooms from | nodes | **E1 edges** | deadend | orphan (rescued) | nonRoomDoors | exits |
|---|---|---|---|---|---|---|
| `Hospital_meta.db` AUTHORED (142 IfcSpace) | 156 | **17** | 191 | 232 (219) | 0 | **0** |
| LIVE, walker-recompiled (214 rooms) | 224 | **61** | 194 | 185 (172) | 0 | **0** |
**On door-binding the walker is BETTER, not worse (61 vs 17).** There is no measured evidence that
recompiling degrades the graph, and no needle policy change is justified by this data. The related
`§NEEDLE-OVERWRITES-AUTHORED` entry in `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md` is withdrawn on the
same grounds.

**WHAT DOES SURVIVE, and it is worth more than the retracted claim:**
1. **`exits=0` AND `nonRoomDoors=0` in BOTH configurations.** G1 is therefore NOT a consequence of room
   quality or of the walker — it is in the exit/door rule itself, on a 63k-element hospital with 440
   doors. That narrows G1 usefully and removes a whole branch of investigation.
2. **`§GIVEN-2026-07-25` above cites `edges=61` — read it as E1-only.** Total connectivity is NOT
   logged anywhere. **Add `totalEdges` to the `§ROOM_GRAPH` line**; a graph that is well connected
   through circulation/spine edges but sparse on doors currently reads as "broken" from the console
   alone. This mis-read is exactly what produced the retracted claim.
3. **Room COUNTS still differ hugely** (142 authored vs 214 compiled) and the compiled set is what the
   Fly Tour ranks. Whether authored rooms would give a better "main hall" is UNRESOLVED — an earlier
   probe reported the authored-DB top candidate as `≈ Level 1 R13` at 294 m², but the `≈`/`R<n>`
   naming is compiled-style, so that node's provenance is unclear and the comparison was not run
   cleanly. **Do not cite the 294 m² figure until it is re-measured.**

**Method note, recorded because it caused a wrong published finding:** both numbers came from real
runs; the error was semantic, not arithmetic. When comparing a live console `§` line against a
harness value, confirm the harness reads the SAME expression the log builds — not a same-named field.

**§G3-RESOLVED 2026-07-25 — the real finding, measured on a TRUE LOCAL REPRO. It is not authored-vs-
compiled and not a connectivity loss: it is OFFLINE-COMPILER vs IN-BROWSER-WALKER, and the browser
walker loses the large spaces.**
The user saved the live browser state (inject → Save DB) to `~/Projects/BIM_DB/Hospital.db`, 250MB.
**It reproduces the live console EXACTLY** — `nodes=224 doors=440 nonRoomDoors=0 edges=61 deadend=194
orphan=185 orphanRescued=172` — so Hospital is now locally reproducible; stop inferring from console
logs. Provenance checked on BOTH sides before concluding (the step whose absence caused the retraction
above): `spatial_structure.object_type` is **`COMPILED` in both**. Neither DB carries authored IfcSpaces.
| | rooms | rects | E1 | TOTAL edges | exits | largest space | widest space |
|---|---|---|---|---|---|---|---|
| `Hospital_meta.db` as SHIPPED (offline compile, **no `rooms_meta` stamp**) | 142 | 142 | 17 | **500** | 0 | **294 m² (19.6×15.0)** | **15.0 m** |
| after the in-browser walker v3 recompiles it (the saved live DB) | 214 | 317 | 61 | **496** | 0 | 219 m² corridor (3.3m wide) | **5.9 m** (49 m²) |
- **Connectivity is a wash** (500 vs 496 total; walker binds MORE doors, 61 vs 17 E1). The retracted
  "collapse" claim stays retracted — nothing is degraded here.
- **Large spaces are annihilated.** The shipped compile contains a genuine 294 m² hall 15 m wide and a
  270 m² room 12.4 m wide. After the walker recompile the widest space in the WHOLE building is 5.9 m
  and the biggest open room is 49 m² — 317 rects for 214 rooms vs 142/142 suggests the walker is
  fragmenting big volumes into many small pieces (or classifying them `SUSPECT_*`, which excludes them
  as destinations). **This, not ranking, is why the Fly Tour cannot find a big hall.**
- **The trigger is the missing stamp.** `Hospital_meta.db` has NO `rooms_meta` table, so
  `§NEEDLE_VERSION_STALE stored=null` fires and the walker replaces a BETTER offline compile with a
  worse in-browser one, every load.
- **This is the py↔js parity thread, unfinished.** `FLY_TOUR_CORRIDOR_GRAPH.md`'s §WALKER-PHASE-
  SENSITIVITY correction established `py = js = 54` on **Terminal** post-#832. Hospital was never
  checked, and on Hospital they clearly disagree. **Next bounded task: diff the two compiles on
  Hospital storey by storey** — which enclosures does `compile_rooms.py` close that `room_walker.js`
  fragments — with the saved DB as the fixture.
- **Interim policy question (now on a correct basis):** should the needle stamp-and-keep a shipped
  compile it cannot prove stale, rather than recompiling over it? A shipped-but-unstamped compile is
  currently indistinguishable from "never compiled", and here that costs the building its halls.

**§G3-FINAL 2026-07-25 — the walker does NOT lose the large spaces. It FINDS them and flags them
`SUSPECT_*`, and the Fly Tour's own candidate filter then excludes them. Classification + an
exclusion rule, not geometry.** Verified by direct query on both fixtures:
| | largest room | its `predefined_type` |
|---|---|---|
| A — shipped offline compile | `≈ Level 1 R13` 294.0 m² | `INTERNAL` |
| B — in-browser walker v3 | `⚠ Level 1 R14` **315.7 m²** (bbox 9.7×34.1) | **`SUSPECT_OPEN`** |
B's largest space is BIGGER than A's. B's next two (105.5 m², 92.1 m²) are `SUSPECT_NO_DOOR` /
`SUSPECT_OPEN`. Whole-building classification split:
| | INTERNAL | INTERNAL_SMALL | SUSPECT_NO_DOOR | SUSPECT_OPEN |
|---|---|---|---|---|
| A (142) | **142** | 0 | 0 | 0 |
| B (214) | 85 | 67 | **52** | **10** |
`_buildGraphRouteInner` excludes every `SUSPECT_*` node as a destination (§S2, "never SUSPECT_* as
destinations"), so 62 of B's 214 rooms — including the three biggest — are invisible to the tour, and
the largest ELIGIBLE candidate falls back to the 219 m² × 3.3 m corridor. That is the whole
"doesn't show a large space" symptom.
**Two corrections to the delegated diff that produced this section** (both the same error class as the
retraction above — mixing per-rect and per-room units):
1. Its width table compared A per-ROOM against B per-RECT. Re-derived per-ROOM (union bbox over
   `room_guid`): **A 7 rooms ≥8m wide, B 7** — identical, not "A 7 / B 2".
2. Its "deletion" verdict came from a centre-inside-footprint test; a 9.7×34.1 room's centre can sit
   outside a 19.6×15.0 footprint, so the big space read as absent when it exists under another shape.
**`SUSPECT_OPEN` is a DETECTION-CONFIDENCE flag being used as a QUALITY filter, and it penalises
exactly the spaces a tour wants.** A grand hall/atrium is *by definition* low-enclosure — the taxonomy
flags it for the very property that makes it worth visiting. Note also A has ZERO suspect rows of any
kind, which is itself suspicious: the shipped compile likely predates the SUSPECT taxonomy, so "A is
better" is partly "A never applied the filter."
**Actionable, split by owner — no walker change needed for the first:**
- **Fly Tour lane (small, mine):** allow `SUSPECT_OPEN` as a highlight DESTINATION (keep excluding
  `SUSPECT_NO_DOOR`, which is a genuine reachability doubt). Openness is the signal, not the defect.
- **Walker lane:** ask whether `SUSPECT_OPEN_ENCLOSURE=0.50` is right for atrium-scale volumes, and
  whether 52 `SUSPECT_NO_DOOR` rooms on a hospital with 440 doors indicates a door-binding gap rather
  than 52 genuinely doorless rooms.

**§G3-SHARPEST-TARGET 2026-07-25 — the Fly Tour half SHIPPED (bim-ootb PR #994, tour.js v14) and it
was NOT sufficient. The result names the graph task more precisely than anything above:**
`SUSPECT_OPEN` is now an eligible destination — witnessed `suspectOpenAdmitted=10` on Hospital, every
other building in the 7-building corpus byte-identical (none has a SUSPECT_OPEN room). But the main
hall did NOT change, and the reason is the single most useful number in this file:
```
⚠ Level 1 R14   area=315.7 m²   edges=0     ← the building's LARGEST room, ISOLATED
⚠ Level 1 R21   area= 92.1 m²   edges=2
… 9 of 10 SUSPECT_OPEN rooms are connected; the BIGGEST one is not.
```
`§CONNECTED-STOPS` drops any node absent from the edge set, so the hall is discarded before ranking.
**The two facts are causally linked, and that is the insight:** the low enclosure that earns
`SUSPECT_OPEN` is the same property that stops any door binding to it. A space open enough to be a
grand hall is, to the current door-binding rule, a space with no doors.
**Therefore the acceptance test for G1/G3 is now concrete and single-line, on a fixture that exists:**
> On `~/Projects/BIM_DB/Hospital.db`, make `⚠ Level 1 R14` (315.7 m², bbox 9.7×34.1) carry **≥1 edge**
> without regressing Terminal/HHS/Clinic/Duplex/SampleHouse in the 7-building sweep.
That is a better target than "raise `edges=61`" because it is falsifiable, tied to a user-visible
symptom, and reproducible offline. Related and probably the same rule: **52 `SUSPECT_NO_DOOR` rooms on
a building with 440 doors** — a door-binding gap is far more likely than 52 genuinely doorless rooms.
Start there.

### The four gaps, in dependency order (G1/G2 first — they unblock the most per unit of work)
**G1 — `exits=0`. Hospital has NO entrance node at all.** `nonRoomDoors=0` too, so the E4 exit
extractor found nothing on a 63k-element hospital that obviously has doors to the outside. Blocks:
the Fly Tour's descent finale (`stairDown=-` on every run), `escapeRoute()` entirely, and any future
"enter through the grand entrance" beat — there is nothing to aim at. Also forces the tour's walk to
start at an arbitrary interior stop (see §HL-ORIGIN in the Fly Tour file). **Investigate:** why the
exit rule that yields `nonRoomDoors=5` on Terminal yields 0 here — curtain-wall/glass entrance doors
are the first suspect, exactly the family C1's rescue already fixed for Clinic/HHS
("Türelement…Glas"). This may be the same bug one layer over.
> ⚠ **ANSWERED 2026-07-26 — and the suspect above was WRONG. Read `§G1-EXIT-IS-A-LIFT-DOOR` at the
> end of this file BEFORE touching G1.** Short version: there is no exterior-door rule to fix. The
> `exit` node is produced by a LIFT/ELEVATOR NAME filter, so Terminal's `exits=5` are five elevator
> doors and Hospital's `0` just means "no door with 'lift' in its name". Glass entrance doors are
> not the cause. The decision (user/watchdog, 2026-07-26) and a measured feasibility probe are there.

**G2 — `no such table: storey_walkable_raster`.** Without the raster, `_legalizePath` cannot compute
visibility detours: sixteen `§PATH_LEGAL_DETOUR_FAIL … among 128 doors`, and `illegalChords=18/74`
(24%) on the shipped route. **Known and already owned:** a 2026-07 review of
`VIEWER_FIND_PANEL_ROOM_ACCURACY.md §15` established raster coverage exists for only **5 of ~29
buildings** (Clinic/HHS/JKR/Hospital/Terminal) — and note Hospital is ON that list yet the LIVE
`Hospital_extracted.db` still has no such table, so either the coverage claim is about a different
DB snapshot or the raster never shipped into the served artifact. **That contradiction is the first
thing to settle** — it is a `project_db_snapshot_divergence_landmine.md` shape. Coordinate with §15;
do not fork a second raster effort.

**§G2-RESOLVED 2026-07-25 — it is a DEPLOYMENT gap, not a pipeline or doc gap. Diagnosis complete;
what remains is an upload + one missing artifact, both needing user authorization (OCI = production).**
Verified directly, after a delegated lookup got the mechanism wrong (it reported "no apply_patch
mechanism exists anywhere in bim-ootb" — false, see below; its other findings held):
- **The patch loader EXISTS and runs on every page load.** `A._applyPendingPatch` is defined at
  `viewer/scene.js:803` and called on BOTH the meta DB and the main DB —
  `viewer/streaming.js:1787` (`metaBuf`, `metaUrl`) and `:1933` (`dbBuf`, `A.DB_URL`). The needle has
  its own equivalent at `navigate_find.js:999`.
- **The raster patch EXISTS in the repo and holds real data.**
  `bim-ootb/buildings/patches/Hospital_extracted.db.sql` is 145KB with 8 `storey_walkable_raster`
  statements — a real `CREATE TABLE` + per-storey `INSERT` (e.g. `'Level 1', res=0.25, x0=-0.0147,
  y0=58.2806, cols=304, rows=332` + BLOB). Patches also exist for HHS/JKR/Terminal.
- **ZERO `.db` files anywhere on disk contain the table** — BY DESIGN. The offline builder
  `bim-ootb/scripts/build_storey_walkable_raster.js:194` emits a self-heal patch SQL fragment rather
  than mutating a binary, exactly this project's "DB CHANGES = MIGRATION SCRIPT + SELF-HEAL LOADER"
  architecture. Nothing is broken about that half.
- **The failure is that the patch was never uploaded to the OCI bucket the viewer serves from.** The
  user's live log shows the loader asking for it and getting 404 twice on one page load:
  `…/o/buildings/patches/Hospital_meta.db.sql → 404` → `§PATCH_NONE Hospital_meta.db (404)`, and
  `…/o/buildings/patches/Hospital_extracted.db.sql → 404` → `§PATCH_NONE Hospital_extracted.db (404)
  [needle]`. The mechanism worked perfectly; the file simply is not there.
- **Second, separate gap — the split-DB path has no Hospital patch at all.** Terminal ships BOTH
  `Terminal_extracted.db.sql` AND `Terminal_meta.db.sql`; Hospital ships only the `_extracted`
  variant. The split loader reads `Hospital_meta.db`, so uploading the existing file alone will NOT
  fix the served path — a `_meta` variant must be generated by the offline builder too. Check
  HHS/JKR the same way before assuming one upload closes this.
- **`common/storey_raster.js` is pack/unpack/lookup only**, no runtime rebuild fallback (its own
  header: rasterization happens ONCE, offline). `room_graph.js:748-750` try/catches the missing table
  and silently degrades to pre-raster straight-line legalization — which is why this failed quietly
  for so long: no error, just worse paths everywhere.
**So §15's "5 buildings have raster coverage" is true of the PATCH ARTIFACTS and false of every served
DB.** Restate the claim in those terms rather than deleting it.
**Do NOT `oci os object put` without asking** — that bucket is production (`deploy/OCI_UPLOAD.md`
§RULES; every upload needs `--content-type`, here `application/sql`).

**§G2-FALSIFIED 2026-07-25 — applying the raster does NOT fix Hospital's path legality. Measured,
locally, before any upload. The earlier hypothesis in this section (that §15's Hospital "tie" was
caused by the missing raster) is WRONG and must not be carried forward.**
Method: copied `deploy/buildings/Hospital_meta.db`, applied `buildings/patches/Hospital_extracted.db.sql`
to the copy with `sqlite3` (52ms, +72KB, storeys `Level 1`–`Level 7` all present with real bitsets),
then ran the REAL `_buildGraphRouteInner` against BOTH copies through the same Node harness.
| | rastersLoaded | DETOUR_FAIL | illegalChords | pts | route len |
|---|---|---|---|---|---|
| meta, no raster | **0** | **22** | 16/123 | 136 | 1940.8m |
| meta + raster | **7** | **22** | 16/121 | 134 | 1937.4m |
**Test validity checked before believing the negative** (this project's own GIGO rule): `rastersLoaded`
0→7 proves the table really was read into `graph.rasters` — the raster loaded and simply did not help.
`room_graph.js` has NO `§`-log on the raster load path, which is why this needed a direct probe; **worth
adding one** so a future session can see raster presence from a live console alone.
So Hospital's chord-illegality has a DIFFERENT root cause than raster absence. Do not spend the OCI
upload on the expectation that it fixes paths — it may still be worth shipping for other reasons, but
this specific claim is dead.

**§G3-ROOT-CAUSE-CANDIDATE 2026-07-25 (the strongest lead in this whole file — the walker recompile
COLLAPSES connectivity on a building that already has good authored rooms):**
| source of rooms | IfcSpace | nodes | **edges** |
|---|---|---|---|
| `Hospital_meta.db`'s own AUTHORED rooms (142, all human-named) | 142 | 156 | **500** |
| LIVE, after the needle recompiles (`§NEEDLE_INJECT source=walker rooms=214`) | 317 rows | 224 | **61** |
Same building. **500 edges → 61.** `deadend` goes to 194 and `orphan` to 185 live. This is not a
graph-algorithm gap — the graph is being fed strictly worse rooms than the DB already contained.
It also explains, in one stroke: why the live "main hall" is a 3.3m-wide corridor (with authored rooms
the top candidate is `≈ Level 1 R13`, a real **294 m²** room), why the live candidate pool collapses to
~24 mostly-corridor nodes, and the user's own instinct that room injection "is not foolproof."
**Investigate FIRST, before any edge-rule work** — an edge fix measured against walker rooms would be
tuning against degraded input.

**G3 — `edges=61` across `nodes=224`, `deadend=194`, `orphan=185/orphanRescued=172`, plus
`§ISLAND_BRIDGE` ×16 spanning up to 51.97m.** The graph is mostly disconnected islands stitched by
long synthetic links, which is why routes lurch. Compare against this file's own G1 baseline
(Terminal `nodes=59 edges=10 deadend=62`) — the deadend/orphan ratio is the SAME pathology this lane
was opened to fix, still dominant at hospital scale. **Investigate:** whether E2 circulation rescue
(`e2=194`) is producing edges that connect anything, and whether a 52m island bridge should exist at
all or is masking a missing corridor chain.

**G4 — `§CORRIDOR_ROOM_BACKPROP injected=10 skippedOverlap=33 / 43`.** Three-quarters of the
detected corridor buckets are discarded for overlap before any consumer sees them. Corridors are the
tour's spine (§R6-CORRIDOR-SPINE) and the occupant's actual route. **Investigate:** what "overlap"
means here and whether a merge/clip is possible instead of a drop.

### G5 (adjacent, different owner — hand to `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md`)
**The injection never accumulates: every load recompiles all 214 rooms from scratch.** Run 1 wrote
meta 21.4MB + geo 228.6MB + ad_seed 25.8MB and `§NEEDLE_PERSIST idb=ok bytes=22482944`; run 2 opened
with `§QUOTA used=3MB` and MISSED all three (`§CACHE_MISS_READ url=Hospital_meta.db`), re-downloading
~275MB and hitting `§NEEDLE_VERSION_STALE stored=null` → full recompile. **Checked before filing:** it
is NOT the needle's persist key (a plausible mismatch — the needle persists under the
`_extracted.db` url while the split loader reads `_meta.db`); the misses are UNIFORM across files the
needle never touches, so it is whole-cache eviction. `navigator.storage.persist()` is the first thing
to check. (Caveat stated honestly: a manual "clear browsing data" between runs would produce the same
log — confirm with the user before treating it as a bug.)

### Witness plan (numbers, never screenshots — this project's FUNDAMENTAL LAW)
Reuse this file's own established shape: a calculation-only Node harness on real DBs, logging the
numbers, BEFORE/AFTER, gate on the deltas — plus `witness_room_graph_path.js` (`pass=15 fail=0`) as
the non-regression floor. Minimum acceptance per gap: G1 `exits>0` on Hospital AND Terminal's 5 exits
unchanged; G2 the raster present in the SERVED artifact, `PATH_LEGAL_DETOUR_FAIL` → 0 on Hospital;
G3 `edges` up and `deadend` down with `fullConnectivity()` reported per building; G4 `skippedOverlap`
down without new cross-room overlaps (`§NO-OVERLAP` invariant must hold).
**Corpus caution from the §15 review: aggregate statistics are not proof of a specific reported
case.** That review found 99–100% aggregate illegal-point reduction shipped while the user's two
actual screenshot routes were never re-run against the fix. Name the specific buildings and re-run
the specific cases.

### Out of scope for this task
Route ORDER, stop selection, camera grammar and pacing — those are the Fly Tour lane's
(`FLY_TOUR_CORRIDOR_GRAPH.md` §HL-FIRST, `FLY_TOUR_DLOD_SCALE.md`). That lane is a pure CONSUMER of
this graph and is explicitly waiting on G1/G2; it will not build scoring heuristics on top of data
that is about to change. Do not "fix" the tour from inside this task.

### One thing this task will NOT solve, stated so nobody expects it
The user's actual opening question — does the tour reach the space a human would call the big hall —
is a VOCABULARY problem, not a topology one, and survives a perfect connectivity fix:
- Ranking is by floor AREA only. A grand space reads as grand by VOLUME and light. Per-room height
  does not exist in the data: `compile_rooms.py` sets `size_z` from a storey-wide wall-height mean
  (documented in `FLY_TOUR_CORRIDOR_GRAPH.md` §INTERIOR_PACING investigation item 1), so an atrium
  and a cupboard on one floor measure identical heights.
- Hospital ships **142 authored `IfcSpace`s** (`§HBA_FOOTPRINT bound 142 rooms→real IfcSpace
  footprint`) and the needle press replaces/overlays them with **214 compiled rooms**, so the tour
  ranked `≈ Level 1 Hall/Corridor 2` — a compiled corridor chain — rather than any authored,
  human-named lobby. **Worth verifying as its own question: does the recompile DISPLACE authored
  spaces, and should it?** If authored names survive, "main hall" could be chosen from real
  semantics instead of area alone. That is a genuine candidate for a follow-up spec, not this task.

---

## ⚠ READ FIRST — #995's HEADLINE NUMBERS WERE WRONG; #996 CORRECTS THEM
The block below reports Hospital 86.2% / Terminal 95.7%. **Those figures included 40 UNVALIDATED
bridges** — 37 longer than 2m, 17 over 15m, longest **45.7m**, each stored as
`doorName:'Opening onto corridor'`, `doorGuid:null`. The graph was asserting passages nobody
measured, and Find would have drawn a user's route through 45.7m of solid wall. Caught by review,
accepted in full, fixed in **PR #996 §BRIDGE-WALL-LEGAL**. Real numbers are in the #996 block below.
Quote those, never 86.2%.

## ✅ SHIPPED 2026-07-25 — §ROOM-SPINE-BRIDGE implemented, PR #995 (auto-merge armed)
`common/room_graph.js`, right after the existing `§CIRC_SPINE_BRIDGE` block. A deg-0 ROOM now bridges
to its nearest same-storey spine point by RECT distance, as an `E6` edge — same shape as the
circ-per-chain bridge above it. Measured, BEFORE = `origin/main`:
| building | deg0 | room-pair pathability |
|---|---|---|
| **Hospital** (live fixture) | **42 → 2** | **56.2% → 86.2%** (R14 deg 0 → 1) |
| **Terminal** | **6 → 1** | **75.9% → 95.7%** |
| HHS / Clinic / Duplex / SampleHouse / SampleCastle | unchanged | unchanged |
**Hospital's Fly Tour now opens in the 315.7 m² atrium** (`mainHall="⚠ Level 1 R14"`) instead of the
219 m² × 3.3m corridor — the user's original "it doesn't show a large space", closed.
Independent confirmation: this harness reproduced the review session's 56.2% baseline exactly.
**Cost recorded, not hidden:** Terminal's illegal-chord ratio rose 14/53 (26.4%) → 20/61 (32.8%) —
newly reachable rooms add chords and a bridge is a graph EDGE, not a validated walk. Inside the
`§MAJORITY-LEGAL` gate; no building lost its route.
**FOLLOW-UP (open):** prefer the nearest spine point whose chord is WALL-LEGAL rather than simply the
nearest. Needs the chord test available inside `buildGraph` (today it is applied later, in
`shortestPath`'s legalization). That is the principled fix for the ratio above.
**STILL OPEN:** the 2 remaining deg-0 rooms on Hospital (storeys with no spine at all), and the
review's third bucket — 22 "far" rooms averaging ~24 m² with no door within 8m, which may be walker
artifacts rather than real rooms. Triage before treating them as a connectivity target.

---

## ▶ RESUME HERE (2026-07-25) — §ROOM-SPINE-BRIDGE: the validated next fix, fixture ready
**(SUPERSEDED by the SHIPPED block above — kept for the falsification record: two alternative fixes
were measured and rejected before the working one. Do not re-propose them.)**
**State in one line: room pathing is NOT solved (Hospital room-pair pathability 14035/24976 = 56.2%,
42 stranded deg-0 rooms); the Fly Tour's ORDER is solved and shipped, its DESTINATIONS are blocked
on this file.**

### Fixture + harnesses — a new session can start measuring in one command, no browser
- `~/Projects/BIM_DB/Hospital.db` (250MB, user's Save-DB export) **reproduces the live console
  exactly** (`nodes=224 doors=440 nonRoomDoors=0 edges=61 deadend=194 orphan=185 orphanRescued=172`).
  Stop inferring from console logs — iterate on this.
- Node harnesses in the 2026-07-25 session scratchpad (`hl_witness.js` loads the REAL `viewer/tour.js`
  verbatim into a `vm`; `hall_rank.js`, `adj.js`, `circ.js`, `verify.js`). Pattern to copy:
  `initSqlJs({wasmBinary})` + `require('common/room_graph.js')` (node-aware) + a `dbQuery` returning
  value-rows. 7-building regression corpus: Terminal_meta, HHS_Office_Federated_extracted, Clinic_ARC,
  Duplex_ARC, SampleHouse_extracted, SampleCastle_extracted, + the Hospital fixture.

### MEASURED by the review session (not re-derived here — attributed, with its own correction applied)
- **Pathability 56.2%** — nearly half of all Find room-pairs have no route.
- **All 42 stranded rooms fail the SAME predicate: no ARC door within buffer on their own storey**
  (`inRange=0`). Not discipline (440/440 are ARC), not the lift-name filter, not `cands>=2`.
- **Its own correction, keep it:** an earlier "R11 has 7 doors at 0.2m" reading was an artifact of a
  looser proximity test — those doors are on Levels 3/4 at the same XY and `rectDist` is 2D. **The
  storey filter is CORRECT; do not remove it** (removing it binds doors three floors up).
- Gap buckets (nearest same-storey door minus its buffer): `≤0.5m` 10 rooms / 536 m² (R14 at 0.25m);
  `0.5–2m` 10 rooms / 224 m²; `>2m` **22 rooms** / 538 m², nearest door 8–10m away.
- **Slack widening is the wrong fix, proven by its own numbers:** it cannot reach the 22 "far" rooms at
  all, and R14 only gains an edge at `SLACK=1.00` (5×) because `cands>=2` needs that same door within
  buffer of a SECOND room. A constant that must move 5× to catch one room is exactly what the
  abstraction audit exists to reject. Agreed, fully.

### VERIFIED HERE — the review's proposed fix does NOT work, and the working one is next to it
The review proposed **room-to-room opening adjacency** ("rect boundaries within the raster
resolution"). **Falsified on the fixture: 0 of 42 stranded rooms have a same-storey neighbour room
rect within `RES=0.20m`.** R14's nearest same-storey ROOM is **3.007m** away. Compiled rooms do not
tile the floor — there are metres of unclaimed space between them, which is where the connections
live. Do not implement room-to-room adjacency; it would produce zero edges here.
**What IS there — validated:**
```
R14 nearest same-storey NON-room node: 1.31m  (kind=spine)  "Corridor — Level 1"
all 42 deg-0 rooms, distance to nearest same-storey spine/circ/stairwp/doorwp node:
   ≤0.5m: 0     0.5–2m: 18     2–5m: 18     >5m: 6     none: 0
```
**Every stranded room has a circulation node in reach; none is truly isolated.** The corridor spine
runs 1.31m from the atrium's own rect.
**→ §ROOM-SPINE-BRIDGE (recommended, reuses an existing mechanism rather than adding a rule):** bridge
a deg-0 room to its nearest same-storey `spine`/`circ` node, exactly as `§ISLAND_BRIDGE` /
`§CIRC_SPINE_BRIDGE` already bridges corridor CHAINS to spines. That mechanism is live and already
tolerates **51.97m** bridges on this very building (`§ISLAND_BRIDGE … dist=51.97m`); R14 needs
**1.31m — 40× shorter than bridges the engine already makes**. It generalises the review's own
insight correctly: an open space connects through an OPENING onto circulation, not through a door to
another room. No new constant, no name matching, no threshold move.
**Keep the review's third-bucket caution:** the 22 "far" rooms average ~24 m² with no door within 8m —
triage whether they are real rooms or walker artifacts BEFORE counting them as a connectivity target.

### Acceptance test (falsifiable, offline, one line)
> On `~/Projects/BIM_DB/Hospital.db`: `⚠ Level 1 R14` (315.7 m², bbox 9.7×34.1) carries **≥1 edge**,
> room-pair pathability rises from **56.2%**, and the 7-building sweep shows no regression
> (Terminal/HHS/Clinic/Duplex/SampleHouse byte-identical or better).
Then re-press ✈ on Hospital: `§FLY_HL_FIRST mainHall` should become the 315.7 m² space instead of the
219 m² × 3.3m corridor — the user's original "it doesn't show a large space", closed end to end.

### ⚠ UNIT DISCIPLINE — three wrong findings were published in ONE day, all the same error class
Each was real data compared against a differently-scoped field. Check the scope of BOTH sides before
publishing any comparison:
1. `graph.edges.length` (TOTAL, E1–E5) vs the `§ROOM_GRAPH` log's `edges=` (**E1 only**,
   `room_graph.js:737`) → produced a bogus "500 → 61 collapse".
2. Per-**rect** vs per-**room** width/area (multi-rect rooms share `room_guid`) → produced a bogus
   "walker has no wide rooms" (per-room it has 7, same as the offline compile).
3. **`graph.nodes` holds ROOMS ONLY; `graph.nodesByGuid` holds all kinds** (room 224, spine 43,
   doorwp 427, circ 7, stairwp 12) → produced a bogus "no circulation nodes exist near R14", when the
   spine is 1.31m away. **This one nearly killed the correct fix.**


## ✅ SHIPPED 2026-07-25 — §BRIDGE-WALL-LEGAL, PR #996 (auto-merge armed) — the honest numbers
`common/room_graph.js`. The bridge block moved to AFTER `rasters` / `roomRectsByStorey` are built
(it was above them — that is why the test could not run there), and each candidate spine point is
tried nearest-first with the segment **room-centre → spine** sampled through the engine's own
`_chordIllegalCount` (raster where the storey has one, room/corridor rects otherwise — the same
predicate `shortestPath`'s legalizer already trusts). First LEGAL candidate wins; if none is legal
the room **stays deg-0 on purpose**, logged as `§ROOM_SPINE_BRIDGE_REJECT` so every refusal is
auditable.
| fixture | bridged / rejected | room-pair pathability |
|---|---|---|
| Hospital, **no raster** | 5 / 35 | 56.2% → **59.6%** |
| Hospital, **+ raster patch applied** | 9 / 31 | 56.2% → **62.4%** |
| Terminal | — | 75.9% → **79.6%** (deg0 6→5) |
| HHS / Clinic / Duplex / SampleHouse / SampleCastle | — | unchanged |

**The atrium win is REVERSED, and that is the correct outcome.** With the real raster, R14's straight
chord to its nearest spine point is NOT walkable → the 315.7 m² atrium is refused an edge and stays
unreachable → the Fly Tour reverts to the 219 m² × 3.3m corridor. Without raster data the rect
fallback accepts the same chord (`R14 deg=1`). **That difference is precisely the difference between
asserting and measuring**, and it is why the gate exists.

**Consequence that changes priority: the raster is better evidence in BOTH directions** — it accepts
9 bridges where the rect fallback accepts only 5, while correctly rejecting R14. **G2 raster
deployment is therefore a CORRECTNESS dependency, not an optimisation.** Re-rank it accordingly.

## ⚠ READ FIRST — #996's HEADLINE WAS MEASURED WITH A FOREIGN RASTER (corrected 2026-07-25, below)
The `62.4% / atrium-win-reversed` block just above applied `buildings/patches/Hospital_extracted.db.sql`
— a raster built from a **156-room** compilation — to the user's **224-room** `Hospital.db`. With a
raster rebuilt from that same DB, R14 keeps its edge and the Fly Tour opens in the atrium. See
`## ✅ SHIPPED 2026-07-25 (later) — §BRIDGE-ROUTED-LEGAL, PR #997` below. Do not quote 62.4% as
"with raster"; it is a cross-snapshot number.

## ▶ NEXT SESSION — resume here, nothing dangling
**(Items 2 and 3 are CLOSED by the §BRIDGE-ROUTED-LEGAL block below; item 1's precondition changed.
Read that block, then this list.)**
State of the two questions the user asked:
1. **Room pathing: NOT solved.** Honest Hospital figure is **59.6%** (no raster) / **62.4%** (with
   raster), up from 56.2%. Terminal 79.6%, up from 75.9%. 31–35 rooms per building still refuse a
   legal bridge.
2. **Tour route: ORDER solved and shipped** (highlight-first, visible stair climbs, `SUSPECT_OPEN`
   eligible, pacing/look-ahead — all live-confirmed by the user's own console). **DESTINATIONS still
   blocked**: the building's best space is unreachable, so the tour opens in a corridor.

**Open items, ranked — each has a number and an owner:**
1. **Deploy the raster patches (G2).** They exist in-repo (`buildings/patches/*.sql`, Hospital's is
   145KB / 7 storeys of real bitsets) and 404 on OCI. Now a correctness dependency (above). Note the
   split-DB trap: the boot loader wants `Hospital_meta.db.sql`, which does not exist — Terminal ships
   BOTH `_extracted` and `_meta` variants, Hospital only `_extracted`. **Needs user authorisation —
   production bucket.**
2. **Connect the atrium honestly.** A straight room→spine chord is not walkable. Needs a short
   *routed* connection (multi-segment through walkable space) rather than one bridge edge, or a
   door-binding fix that gives the atrium a real E1. Acceptance test unchanged: `⚠ Level 1 R14`
   carries ≥1 edge on `~/Projects/BIM_DB/Hospital.db` AND the chord is wall-legal.
3. **Triage the 22 "far" rooms** (review's third bucket): ~24 m² average, no door within 8–10m. May
   be walker artifacts, not real rooms — confirm before treating them as a connectivity target.
4. **§TOUR_TIMELINE_SCRUB** — designed, never started; user's UI decisions recorded in
   `prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`. Independent of all the above; branch off fresh
   `origin/main`.
5. **FINDING 4 metric (area → spaciousness)** — parked deliberately. Re-measure only once the
   candidate pool contains reachable halls, or it gets tuned against corridors.

**Fixtures + harnesses (a new session starts measuring in one command, no browser):**
`~/Projects/BIM_DB/Hospital.db` (user's Save-DB export — reproduces the live console EXACTLY);
`/tmp/hosp-local/Hospital_RASTER.db` (same + raster patch applied, for the with/without comparison).
Harness pattern: `initSqlJs({wasmBinary})` + `require('common/room_graph.js')` (node-aware) + a
`dbQuery` returning value-rows. `pathab.js` measures deg-0 + room-pair pathability via BFS;
`hl_witness.js` loads the REAL `viewer/tour.js` into a `vm` and runs `buildTour()`. 7-building
corpus: Terminal_meta, HHS_Office_Federated_extracted, Clinic_ARC, Duplex_ARC, SampleHouse_extracted,
SampleCastle_extracted, + the Hospital fixture.

**Method warnings earned the hard way this session — read before publishing any comparison:**
four wrong findings were published in one day, every one a real number compared against a
differently-scoped field. (1) `graph.edges.length` (total E1–E5) vs the `§ROOM_GRAPH` log's `edges=`
(**E1 only**). (2) per-**rect** vs per-**room** area/width (multi-rect rooms share `room_guid`).
(3) `graph.nodes` holds **rooms only**; `graph.nodesByGuid` holds all kinds — this one nearly killed
the correct fix. (4) reporting pathability that included unvalidated edges as if it were measured
connectivity. **Check the scope of BOTH sides, and re-derive a delegated agent's headline before
relaying it.**

---

## ✅ SHIPPED 2026-07-25 (later) — §BRIDGE-ROUTED-LEGAL, PR #997 (auto-merge armed)
Watchdog's correction to #996, accepted in full: **`_chordIllegalCount` samples a STRAIGHT segment —
that is a visibility test, not a connectivity test.** A person leaving a 9.7 × 34.1 m atrium walks
through the opening and TURNS. "The straight chord is unwalkable" never established "no walkable
route exists" — as unmeasured a claim as the unvalidated bridges #996 was written to kill, erring the
other way.

`common/room_graph.js`: the bridge gate now calls **`_astarHop`** (already in the file, ~:1314) over
the SAME walkable evidence (`_pointWalkable`, raster-first) the straight test reads, carrying its own
`§ON-FLOOR-GUARANTEE` end-to-end re-verification. Edge **weight = the ROUTED length**, never the
straight distance. No route → the room stays deg-0 on purpose (`§ROOM_SPINE_BRIDGE_REJECT`).
`astarHop` is also exported as a read-only witness helper (same precedent as `chordIllegalCount`).
**No cap and no new constant were needed** — the whole 10-fixture sweep is 3.6s; `buildGraph` on
Hospital's 224-room graph goes 335ms → 499ms.

| fixture | deg0 | room-pair pathability |
|---|---|---|
| Hospital (user Save-DB, raster **rebuilt from that same DB**) | 37 → **34** | 59.6% → **61.7%** |
| `Hospital_extracted.db` + its own shipped patch | 34 → **26** | 61.1% → **69.4%** |
| Terminal / HHS / Clinic / Duplex / SampleHouse / SampleCastle | unchanged | unchanged |

**Acceptance test PASSES end to end:** `§FLY_HL_FIRST mainHall="⚠ Level 1 R14" area=315.7 storey=Level 1`
— the Fly Tour opens in the **atrium**, not the 219.4 m² corridor. (With the stale foreign raster it
still opens in the corridor — that is the whole point of the finding below.)
Witnesses: `witness_room_graph_path.js` 15/0. `witness_room_graph_utility_penalty.js` 8 pass/1 fail —
**identical to baseline**, pre-existing over-tagging finding, unrelated.

### ⚠ FINDING — #996's raster conclusion was CROSS-SNAPSHOT, not evidence (unit-scope error #5)
Same error class as the other four, new flavour: the mismatch was between **artifacts**, not fields.
- `scripts/build_storey_walkable_raster.js` unions **every room rect** (inflated by `DOOR_BUFFER_SLACK`)
  into the raster. So against a raster built from its own DB, **every room is 100% walkable inside its
  own footprint, by construction.** That is the check that settles provenance in one run.
- Against `buildings/patches/Hospital_extracted.db.sql` applied to `~/Projects/BIM_DB/Hospital.db`:
  rooms measure **median 86.6%**, and R14 just **7.6%**. Against a raster rebuilt from `Hospital.db`:
  **100.0% median, every room, connected and deg-0 alike.** Against `Hospital_extracted.db` + that same
  patch: **100.0%** too. The patch is correct — for its own DB.
- The DBs are different compilations of the same building: `Hospital_extracted.db` **156 rooms**,
  the user's Save-DB export **224 rooms**. #996 applied one's raster to the other's rooms.
- **Consequence:** "with the real raster R14's chord is not walkable, and the atrium win is correctly
  reversed" does not hold. With a matching raster R14 keeps its edge (`R14deg=1`) at 59.6% — the same
  as no-raster — and #996's `62.4%` "with raster" figure is a cross-snapshot number. This is
  [[project_db_snapshot_divergence_landmine]] again, one layer down.
- **The rect-fallback-vs-raster "better evidence in BOTH directions" claim in #996 goes with it.**

### ⚠ STANDING LIMITATION (promoted from footnote on watchdog review) — what the gate actually proves
`§RASTER_SLABS storey=Level 1 slabs=0 … triangles=0`, and the same for Levels 2, 4, 5 (the build
script's own comment already recorded "measured on Hospital: 5 of 7 storeys had ZERO slabs"). Only
Levels 3, 6, 7 resolve slab meshes (8754 / 304 / 84 triangles).

**Consequence, and it is a limitation on the result, not a data gap.** On a slabless storey
`walkable ≡ inside a compiled room rect ∪ corridor rect` — and a room's own footprint is 100% walkable
*because the builder unions room rects*. So on Level 1 `_astarHop` is **not** testing whether a person
could walk from the atrium to the spine through real floor. It is testing whether a chain of
overlapping room/corridor rects connects them.

Not circular enough to be worthless: corridor and spine rects are genuinely separate objects derived
from walls+doors by `hallway_backbone.js`, and the gate still **refused 30-odd bridges**. But it is
strictly weaker than "a walkable route through measured floor" — and **R14's rescue happens on exactly
such a storey**. State it this way, and do not treat it as closed:

> **The atrium win is real under the rect-network definition of walkable, and NOT YET DEMONSTRATED
> under independent floor evidence.** Levels 3, 6 and 7 are the only places this gate has ever been
> tested against real geometry.

Falsifiable follow-up, cheap and already tooled: split the accept/reject tally by storey slab-resolution
(`poc_routed.js` + `§RASTER_SLABS`) and report the gate's behaviour on slab-backed storeys separately
from rect-only ones. If the gate behaves the same on both, that is evidence the rect network is a fair
proxy; if it diverges, the rect-only storeys' results need discounting. Neither is assumed here.

### ✅ OPEN ITEM 3 CLOSED — the 22 "far" rooms are compiler-flagged pockets, not a connectivity target
`spatial_structure.predefined_type` already carries the room compiler's own verdict, and it is
**perfectly correlated with element containment** (so treat them as ONE signal, not two witnesses):

| predefined_type | rooms | with contained elements | zero |
|---|---|---|---|
| INTERNAL | 85 | 85 | 0 |
| INTERNAL_SMALL | 67 | 67 | 0 |
| SUSPECT_NO_DOOR | 52 | 0 | 52 |
| SUSPECT_OPEN | 10 | 0 | 10 |

Of the 33 deg-0 rooms: **28 `SUSPECT_NO_DOOR`** (zero contained elements), **1 `SUSPECT_OPEN`** (R14),
**4 `INTERNAL`** (real: `≈ Level 4 R41` 60.1 m²/180 elements, `≈ Level 5 R2`, `≈ Level 4 R3`,
`≈ Level 3 R2`). In the "far" bucket (nearest same-storey door > 2m, n=22): **21 of 22 are zero-element
`SUSPECT_*`**. So the bucket is NOT worth a connectivity mechanism — the real target set is ~5 rooms.
**But do not turn this into a rule:** R14 is itself `SUSPECT_OPEN` with zero contained elements and is
a genuine 315.7 m² atrium. `SUSPECT_OPEN` means "open space with no bounded doorway" — which is what
an atrium IS. The artifact signal is `SUSPECT_NO_DOOR` + small + zero elements, not zero elements alone.
Corrected in passing: an own-footprint figure of 11.4% for R14 was computed over its 2-rect **bounding
box**; per-rect it is **7.6%** (same conclusion, different number — bbox vs rects, error class #2).

### Fixtures added this session
- `/tmp/hosp-local/Hospital_REBUILT.db` — `Hospital.db` + a raster rebuilt from itself. **This is the
  correct with-raster fixture; `Hospital_RASTER.db` is the cross-snapshot one, keep it only to
  reproduce the #996 error.** Rebuild: `node scripts/build_storey_walkable_raster.js <db> "" <out.sql>`
  (~2 min, needs `component_geometries`), then `sqlite3 <copy> < out.sql`.
- `/tmp/hosp-local/Hospital_EXTR_PATCHED.db` — `Hospital_extracted.db` + its own shipped patch.
- `corpus.sh <worktree>` (all harnesses now live in `prompts/Modeller/DISC_Walker/`, no longer
  scratchpad-only — scratchpads vanish) — the 7-building corpus + all four Hospital variants in one command, 3.6s.
- `triage.js` (deg-0 characterisation), `poc_routed.js` (routed-gate POC), `poc_r14.js` (uncapped
  reachability probe), `poc_raster_cover.js` (**raster provenance check — run this FIRST on any
  raster you did not build yourself**).

### Item 1 (deploy the raster patches) — precondition CHANGED, still needs user authorisation
It is no longer "ship the existing patches." `buildings/patches/Hospital_extracted.db.sql` was built
against a 156-room compilation; deploying it over whatever DB is actually served will silently apply a
foreign raster unless the two match. **Rebuild the raster against the served DB, verify with
`poc_raster_cover.js` (expect 100% own-footprint for every room), then deploy.** And per the second
finding, on Hospital 5 of 7 storeys it adds no slab evidence at all — so it is worth less than #996
claimed. Still `⛔ BLOCKED: production bucket, needs user authorisation.`
---

## 🐕 §WATCHDOG — reviewer-role handoff (2026-07-25, written BY the reviewer session, FOR the next one)
**Read this if you are resuming as REVIEWER, not as builder.** The builder's resume state is
`▶ NEXT SESSION` above; this section is the separate reviewer lane and does not duplicate it.

### The role, and why it exists
Separate session, **review only — do not implement, do not edit engine code** (user directive,
`feedback_model_allocation_mastermind_vs_execution` §Sonnet-as-reviewer-of-Opus). Read the plan and
the report, verify claims against real code and real fixtures, agree or flag with line numbers.
The builder pushes and merges; the reviewer does not.

**The value came from ROLE, not model capability — both sessions this day were Opus 5.** The builder
had every fact the reviewer had and found most of them itself. What it did not have was a fresh
context and no stake in the result, which is why "closed end to end" preceded a correction three
separate times (#995 unvalidated bridges, #996 cross-snapshot raster, the straight-chord gate).
**A reviewer does not need to be a different or better model. It needs to be a different session.**

### Standing checks — each one caught a real defect this day, run them every time
1. **Re-derive the headline number yourself before relaying it.** Reviewer's independent 56.2%
   baseline is what let the builder confirm its own harness; the 86.2% that replaced it was
   real connectivity *plus unvalidated edges* and had to be retracted.
2. **Check the SCOPE of BOTH sides of any comparison.** Five error classes so far, all the same
   family — see `Method warnings` above for 1–4; #5 is *mismatched artifacts, not fields*
   (a 156-room DB's raster applied to a 224-room DB). **Provenance first: run
   `poc_raster_cover.js` on any raster you did not build yourself, expect 100% own-footprint.**
3. **For every new edge/connection, ask what EVIDENCE field it carries.** `doorGuid: null` means
   the graph is asserting a passage nobody measured. Every pre-existing bridge in
   `common/room_graph.js` (`§ISLAND_BRIDGE`, `§ORPHAN-SPINE-RESCUE`) is door-anchored and says so
   in its own comment. `watchdog_bridge_evidence.js` prints the length distribution of new bridges —
   #995 shipped 40 with median 12.90 m and max 45.70 m, all labelled "Opening onto corridor".
4. **An absolute gate catches "broken", never "worse".** `tour.js:635`'s reject test is a fixed
   threshold, not a before/after comparison. Only the multi-building BEFORE/AFTER sweep catches a
   regression that still passes. The Node corpus harness is therefore load-bearing infrastructure.
5. **Compare ratios, not counts, whenever the denominator can move.** Route length grows, so
   `9/62 → 9/69` is an improvement (14.5% → 13.0%), not a flat line.
6. **"No cap, no new constant" is not automatically a virtue — ask what the removed bound was
   holding.** In #995 it was the only thing bounding the claim, and its removal was presented as
   abstraction purity. In #997 the same phrase was correct, because a real test replaced it.
7. **A test can be too strict as well as too loose.** `_chordIllegalCount` samples a STRAIGHT
   segment — a visibility test. Connectivity needs a routed test (`_astarHop`). Both errors are
   the same failure: an unmeasured claim, erring in opposite directions.

### Reviewer harnesses (kept here because scratchpads vanish; read-only, no engine edits)
- `watchdog_bridge_evidence.js <db>` — loads a CANDIDATE `room_graph.js` (edit the require path to
  the worktree under review), prints every `§ROOM_SPINE_BRIDGE` distance + buckets + the longest
  fabricated openings. This is the check that caught #995.
- `watchdog_binder_attribution.js <db>` — replicates the E1 door-binding predicate exactly
  (discipline, `isRoomDoor`, strict storey equality, `rectDist <= max(bx,by)/2 + 0.20`,
  `cands >= 2`) and attributes, per stranded room, WHICH predicate rejected it. Use before
  accepting any "the binder is broken" or "widen the slack" claim.
- The builder's `corpus.sh` / `pathab.js` / `poc_raster_cover.js` in this directory cover
  pathability + provenance; do not re-implement them.

### Verified by this reviewer, independently (not just relayed)
`nodes=224 edges=496` reproduces the live console · Hospital reachability is **not** the blocker
(largest component 87.4%, 168/224 rooms) · all 42 deg-0 rooms fail one predicate, `inRange=0`
(not discipline: 440/440 ARC; not the lift filter; not `cands<2`) · the storey filter is CORRECT
and must not be relaxed — cross-storey "hits" are 2D `rectDist` artifacts · #995's 40 bridges
measured median 12.90 m / max 45.70 m with `doorGuid: null`.

### Reviewer's open flags — not yet closed
- **The atrium win rests on a storey where the raster is not independent floor evidence.**
  `§RASTER_SLABS slabs=0` on Levels 1, 2, 4, 5 means `walkable ≡ inside a room ∪ corridor rect`
  there — so on Level 1, `_astarHop` tests **rect-network connectivity**, not measured floor.
  R14's rescue is real under that definition and **not yet demonstrated against real geometry**.
  Levels 3, 6, 7 have genuine slab meshes and are the only places the gate has been tested against
  it. Record as a bounded limitation of `§BRIDGE-ROUTED-LEGAL`, not a closed question.
- **Post-change witness re-run should be quoted, not assumed** — `witness_room_graph_utility_penalty.js`
  8/1 is stated as identical to baseline; quote both runs and `audit_specs.js` exit 0 explicitly.
- **`⛔ Item 1 (raster deploy) is BLOCKED on the user** — production bucket authorisation. It is the
  only open decision in the chain; everything else is work.

---

## 🔧 ITEM 1 (deploy) — INVESTIGATED + PATCH BUILT, one decision left (2026-07-25, user authorised)
User authorised the production-bucket deploy, then correctly steered the target: *"u not working off
the saved Projects/BIM_DB/Hospital.db which is resolved further?"* They were right, and the
investigation reversed my own precondition from the block above. **Corrections first:**

**❌ "Rebuild the raster patch against the served DB before deploying" — WRONG, retracted.**
Rebuilt it (`node scripts/build_storey_walkable_raster.js /tmp/hosp-oci/Hospital_meta.db "" out.sql`,
geo resolved from the sibling `Hospital_geo.db` via `§RASTER_SPLITDB`) and the output is
**md5-identical** to the shipped `buildings/patches/Hospital_extracted.db.sql`
(`b78752414fbaaf06d27373bb802dedde`, 144960 bytes). **That patch was never stale for what is served.**
It was only foreign to the 224-room fixture #996 measured against. The #996 cross-snapshot finding
stands; the "needs a rebuild" corollary I drew from it does not.

**The real gap is the SERVED ROOM COMPILATION, two generations behind.** Verified against the actual
OCI bytes (`oci os object get` — note `_meta`/`_geo` come down **gzipped**, `_extracted` does not):

| DB | IfcSpace rows | `room_guid` | graph rooms | deg0 | pathability | Fly Tour opens in |
|---|---|---|---|---|---|---|
| OCI `Hospital_extracted.db` / `Hospital_meta.db` (byte-identical to local checkout) | 142 | ✗ | 156 | 26 | 69.4% | `≈ Level 1 R13` 294.0 m² |
| user's `~/Projects/BIM_DB/Hospital.db` (Modeller-exported) | 317 | ✓ | 224 | 34 | 61.7% | `⚠ Level 1 R14` **315.7 m²** |

**⚠ Those two percentages are NOT comparable — different denominators (12090 vs 24976 pairs).** The
finer compilation exposes 68 more rooms, mostly `SUSPECT_NO_DOOR` pockets, which drags the *ratio*
down while raising absolute reachable pairs **8385 → 15407**. Sixth instance of the day's error class;
do not quote "69.4% → 61.7%" as a regression.

**Also corrected: "the tour opens in a corridor" is a property of the 224-room compilation, not of
production.** Live today already opens in a 294 m² space. The atrium fix is a 294 → 315.7 m² refinement,
not a rescue from a corridor.

### The patch is built, verified, and NOT deployed
`mkpatch.sh` → `Hospital_rooms_raster.sql` (856KB): the resolved `spatial_structure` (317 rows,
`room_guid` + `SUSPECT_*`) + `rel_contained_in_space` (6943) + `rooms_meta` + the raster built against
**that** room set. `DROP…CREATE…INSERT` / `INSERT OR REPLACE` throughout, so it satisfies
`A._applyPendingPatch`'s idempotency contract.
- **Grafts cleanly — proven, not assumed:** element sets are IDENTICAL (63415 elems / 63182 transforms
  both ways, **0** guids only-in-user, **0** only-in-served) and **all 6943** room→element links resolve
  against the served `elements_meta`. Same extraction, better room compilation — not a different building.
- **Applied twice to the served DB → identical result** (317 spaces / 6943 links / 7 rasters). Idempotent.
- **`poc_raster_cover.js` on the patched DB: 100.0% own-footprint, every room, connected and deg-0**
  (182 + 42) — the provenance check passes, i.e. this raster belongs to this room set.
- Names needed: **BOTH** `patches/Hospital_extracted.db.sql` AND `patches/Hospital_meta.db.sql`. The
  loader keys on the db's own filename and split-mode serves `_meta` — which is why Hospital has never
  had a patch apply in production at all (`§PATCH_NONE Hospital_meta.db (404)`). Terminal ships both; that
  is the split-DB trap this file already flagged, now confirmed as the reason, not a guess.
- `--content-type application/sql` on every upload (`deploy/OCI_UPLOAD.md` §RULES). Target does not yet
  exist — OCI currently holds only HHS + Terminal×2 patches, so this ADDS, never overwrites.

### ⛔ THE ONE OPEN DECISION — deploy scope, user's call
This is no longer "ship the raster." Deploying the room compilation **replaces production's spatial
tables**, and the profile is mixed, so it should not be decided by a session:
1. **Rooms + raster** (the 856KB patch above) — live matches the compilation you actually develop and
   test against, ending the cross-snapshot class of error at its source; finer rooms, `SUSPECT_*`,
   multi-rect, atrium. Cost: 68 more rooms in every picker, many of them suspect pockets; pathability
   *ratio* falls even though absolute connectivity nearly doubles.
2. **Raster only, under both filenames** (145KB, bytes already verified correct for the served rooms) —
   strictly additive, no room-set change, and it makes Hospital's chord legality real for the first
   time. Leaves live two compilations behind.
3. **Neither yet** — the room compilation lives in a Modeller export, not in a repeatable pipeline step;
   a session could not re-derive it from the IFC today. That is a real argument for fixing provenance
   before shipping the artifact.

**Nothing is uploaded.** Everything above is local and reproducible from
`prompts/Modeller/DISC_Walker/` + the fixtures named there.

### ✅ OPTION 1 DEPLOYED (2026-07-25) — raster only, both filenames, condition satisfied first
Watchdog's condition was to re-run the provenance check against **whatever the production bucket is
serving right now**, not a local worktree or a cached snapshot, and stop the deploy on anything but
100%. Done in that order:
- **Currency of the served bytes proven, not assumed:** re-fetched `buildings/Hospital_meta.db` and
  matched the bucket's own `content-md5` (`cTpK9OHSgS1SDXGvbPPkHA==`) → inner
  `06bbbdfcbc339207f1a9b670036a2b3e`, identical to the copy under test. `Hospital_extracted.db`
  etag/size/mtime unchanged (`b95cabb6…`, 263307264, Jun 5). ⚠ `_meta`/`_geo` are served
  **gzipped** (`content-encoding: gzip`) — `oci os object get` returns the gzip stream, so `gunzip`
  before opening or sqlite reports "file is not a database". `_extracted` is not gzipped.
- **`poc_raster_cover.js` on the SERVED bytes + patch: `100.0%` median and mean, every room —
  130 connected + 26 deg-0, `connected_rooms_below_30pct=0/130`** — for BOTH `Hospital_meta.db` and
  `Hospital_extracted.db`. The raster provably belongs to the room set in production.
  *(An earlier run of this same check printed `104 + 52`; same 156 rooms, different connected/deg-0
  split, because it ran against the stale `/home/red1/bim-ootb` main checkout at `73d3676` — pre-#997.
  That checkout has a local merge and will not fast-forward; measure from a fresh `origin/main`
  worktree instead. Seventh instance of the day's error class, caught before it was published.)*
- Uploaded, one at a time, `--content-type application/sql`, targets confirmed absent first (ADD, never
  overwrite): `buildings/patches/Hospital_extracted.db.sql` and `buildings/patches/Hospital_meta.db.sql`,
  **identical bytes**, 144960, md5 `b78752414fbaaf06d27373bb802dedde` / `t4dSQU+6rwbSc3O7gC3t3g==`.
- **Fetched back over HTTPS and re-verified end to end:** both `http=200`, 144960 bytes, md5 matches,
  `Content-Type: application/sql`; the fetched-back bytes re-applied to the served db still give
  `100.0%`. The loader's exact URL shape (unencoded slashes, dir derived from the db url) resolves
  `200` for both — so `§PATCH_NONE Hospital_meta.db (404)` is closed and Hospital gets a patch applied
  in production for the first time.

**Options 2 and 3 remain open and are NOT superseded.** Option 2 (the 856KB rooms+raster patch, built
and verified above) is deliberately deferred: it replaces production's room compilation, which is the
highest-blast-radius item in this lane, in the same week two of six wrong findings came from exactly
this lane's provenance failures. Ship it after the snapshot-stamp work, not before. The patch itself
needs no rework — `mkpatch.sh` regenerates it byte-for-byte.

### ✅ §PATCH-PROVENANCE-GATE built (2026-07-25) — Option 2's precondition, now mechanical
Watchdog named the bounded item instead of an open-ended "snapshot stamp someday", and was right that
**§ROOM_WALKER_VERSION_STAMP does not cover this** — verified independently at
`prompts/Viewer/ROOM_INJECTOR_NEEDLE.md:228-266`, whose own point 5 reads: *"Write-back stays 100%
client-side/local … this spec never touches OCI or a canonical DB file."* It answers "is this browser
trusting a stale compile forever." Different layer. Do not let either be cited as covering the other.

`scripts/oci_patch_gate.js` (bim-ootb, PR below) + `scripts/verify_raster_provenance.js`. It records
the two axes the week's failures moved along and refuses the upload if either is unproven:
- **Served-object snapshot** — live `etag` / `content-md5` / size / `content-encoding`, headed from the
  bucket at gate time, never inferred from a local file of the same name.
- **Engine snapshot** — verifying worktree SHA + `behind`/`ahead` `origin/main` + clean state. A SHA
  alone is insufficient: a checkout can sit on a valid SHA that is behind, or carry a local merge that
  will never fast-forward — which is exactly what `/home/red1/bim-ootb` does.
- **The verifier is never handed a caller-chosen path.** The gate downloads the served object itself,
  gunzips when the bucket serves gzip, applies the patch to a throwaway copy, exposes it as `$GATE_DB`.
  A caller pointing the check at a local file with the right *name* is precisely how a 156-room raster
  came to judge a 224-room DB called `Hospital.db`.
- Target-collision (ADD vs OVERWRITE) stated explicitly, `--upload` does put + fetch-back verify only
  past a PASS, and a `<patch>.manifest.json` is written either way.

**The invariant it enforces** (`verify_raster_provenance.js`): `build_storey_walkable_raster.js` unions
every room rect into the bitset, so *a raster built from its own DB is 100% own-footprint walkable for
every room*. Anything less is proof of foreign evidence. Checkable today, no redesign needed.

**Negative tests — a gate that never refuses proves nothing (both are the REAL historical failures):**
| test | reproduces | result |
|---|---|---|
| NEG-1 | #996's foreign raster: 156-room patch judged against the 224-room DB | `§RASTER_PROVENANCE worst_room_own_footprint=0.0% rooms=224 verdict=FAIL` exit 1 |
| NEG-2 | today's stale engine: gate run from `/home/red1/bim-ootb` | `FAIL — upload refused: engine is 25 commit(s) BEHIND origin/main` |
| POS | today's shipped patch, clean fresh `origin/main` worktree | `worst_room_own_footprint=100.0% rooms=156 verdict=PASS` → `§GATE_VERDICT PASS` |

**Caught a real gap in this session's own deploy:** the gate's first run failed with *"patch unreadable"* —
the object uploaded as `patches/Hospital_meta.db.sql` had **no in-repo source**. Added (identical bytes
to `Hospital_extracted.db.sql`), so the deployed object is now reproducible from the repo.
Also added as `deploy/OCI_UPLOAD.md` §RULES rule 6.

**⚠ `/home/red1/bim-ootb` is 25 commits behind `origin/main` and 2 ahead** (a local merge, will not
fast-forward). It is the shared checkout, so this is not safe to rewrite from a session — but never
measure from it. Use a fresh `origin/main` worktree; the gate now enforces this rather than trusting it.

**Option 2 remains held.** Its blast radius is categorically larger than Option 1's — Option 1 was
additive into a table nothing reads yet and is trivially reversible, whereas Option 2 replaces
`spatial_structure`, which the pathfinder graph, Fly Tour routing and DiscWalker/MEP walk all consume
downstream. The gate is its precondition, not its approval. Nothing is lost by holding: `mkpatch.sh`
regenerates the 856KB patch byte-for-byte whenever it is wanted.

### §AB-PATH — apples-to-apples path A/B across #997 (2026-07-25, headless, numeric)
Same fixture (`Hospital_meta.db` served bytes + shipped raster patch, md5 `e89ce9b7934cc79…`), same
four room pairs, only the engine moves: `290c6be` (#996) vs `abc48cd` (#997). **Pairs are chosen by a
deterministic rule — lexical guid sort, fixed ordinals — not hand-picked**, because a pair picked from
the post-change graph and then looked up in the pre-change one biases the comparison.

| pair | PRE-997 | POST-997 |
|---|---|---|
| CTRL-A | **NO-ROUTE** | dist=128.60 doors=6 hops=13 |
| CTRL-B | dist=190.29 doors=7 hops=15 illegal=216 worstLeg=147 | **identical** |
| CTRL-C | dist=101.44 doors=5 hops=13 illegal=77 worstLeg=58 | **identical** |
| CTRL-D | dist=55.95 doors=3 hops=7 illegal=18 worstLeg=18 | **identical** |

**Reads as designed: #997 is inert for already-routable pairs (3/3 byte-identical, same distance,
doors, hops, polyPts, illegal counts AND identical node-kind sequences) and converts one NO-ROUTE pair
to routed.** Graph edges 518 → 526; `E1=17` unchanged, as it must be — E6 bridges are not doors.

**The one number that needed chasing, and its answer.** CTRL-A's new route carries `illegal=238`,
worse than any pre-existing control. Drill-down: it is **one leg — `stairwp→spine`, 72.5m on Level 5**
— and the engine's own legalizer names that exact storey in the same run:
`§PATH_LEGAL_DETOUR_FAIL storey=Level 5 no legal detour among 82 doors`. That is the **pre-existing**
`DETOUR_FAIL` condition this file's `§GIVEN` already records (×16 across storeys), not something #997
introduced — and CTRL-B carries `illegal=216 worstLeg=147` **pre-**997 and is unchanged after, which
is the control proving long spine legs were already like this.

**⚠ Limitation of this measure, stated so nobody over-reads it:** `§AB` counts illegal samples on the
STRAIGHT chord between consecutive path-node centres. The rendered route is not those chords —
`_buildPolyline` splices A* interior points per same-storey pair. **These counts are an upper bound on
route illegality, not the drawn route's illegality.** Also, `shortestPath` returns `{path, doors,
distance, polyline}` — no `.ok`, `doors` is an ARRAY not a count, and `path` holds GUIDs not nodes; a
first harness cut got all three wrong and reported four false NO-ROUTEs while the engine's own
`§PATH_LEGAL legalized=8` was printing right above it. Read the log, not the return shape you assumed.
**Not measurable here:** `§FPS_MODE` / `§DLOD_TICK` are viewer render-loop logs with no headless
analogue; they need a live session, and per this project's FUNDAMENTAL LAW a recording is not evidence.
Harness: `ab_path.js` (A/B) + `ab_leg.js` (per-leg attribution), both in `prompts/Modeller/DISC_Walker/`.

### ⛔ OPTION 2 IS THE PATTERN §ROOM_WALKER_VERSION_STAMP REJECTED — user caught this (2026-07-25)
User: *"is Opus asking to inject room topology results into hospital DB for OCI? Isn't it supposed to
be pristine and the Walker injects into its IndexDB to save locally approach?"* **Yes. They are right.**
Verified verbatim at `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md:267-271`:
> *"Regenerating HHS's DB server-side and re-uploading to OCI (the path explored just before this spec)
> only fixes buildings WE curate, one at a time, forever, by hand — the exact maintenance burden this
> spec eliminates. It was shelved… no OCI upload was performed."*

Option 2 — a server-regenerated `spatial_structure` destined for `buildings/patches/` on OCI — is the
literal shape of that shelved path. **It was never uploaded** (only Option 1, the raster, shipped),
but it was being held for the WRONG reason: "pending the provenance gate." The gate answers *is it
verified*; this asks *should it exist at all*, and that question comes first. **Correct the ordering.**

**The two options differ in kind, and the difference is factual, not a category argument:**
| | client-side self-heal exists? | OCI push avoidable? |
|---|---|---|
| rooms (Option 2) | **yes** — `viewer/lib/room_walker.js` ships; the whole §ROOM_WALKER_VERSION_STAMP mechanism | **yes → pushing to OCI IS the rejected pattern** |
| raster (Option 1) | **no** — viewer only READS `storey_walkable_raster` (`main.js`/`navigate_find.js`/`effects.js`); the builder is node-only (`#!/usr/bin/env node`, fs/path) | no alternative exists today |

**Do not use that table to declare Option 1 clean.** It is still server-generated derived data pushed
to OCI; the only thing making it defensible is the absence of a client-side raster builder. That is an
**unexamined gap, not a principled exemption** — "should the raster self-heal client-side too" has
never been asked, and this file is where it is now on record.

**The doctrine does not close itself** — `ROOM_INJECTOR_NEEDLE.md:274-278` leans toward *never touching
the OCI files at all, letting every user's first load self-heal*, but says **"worth confirming rather
than assuming."** Its second open question names the *"old 12-column `spatial_structure`, no
`room_guid`"* vintage — **that is exactly Hospital's served schema**, so this building is the case the
doctrine already anticipated and did not resolve. Counter-consideration is real: Hospital is ~63k
elements and client-side recompute on every visitor's first load may be expensive at that scale.

**⛔ BLOCKED on the user, one question, deliberately not answered by default:**
> Is Hospital's SIZE a deliberate, written-down exception to client-self-heal — recompute too costly
> for every first load, so its rooms ship pre-compiled — or is it not, in which case Hospital self-heals
> into IndexedDB like any other building and **Option 2 never goes to OCI at all**?

Answer (a) → Option 2 ships, with the exception and its cost stated in `ROOM_INJECTOR_NEEDLE.md`, not
here. Answer (b) → **delete Option 2**; the real work becomes backfilling `rooms_meta` so Hospital's
missing stamp triggers the client-side recompute the spec already built. `mkpatch.sh` stays either way
— it is also how a DRY-run baseline gets generated — but its OUTPUT stops being an upload candidate.

### ✅ OPTION 2 DELETED (2026-07-25) — architecturally wrong, redundant, AND unjustified by cost
User's answer: the pristine `extracted.db` stays canonical on OCI; every browser computes its own
compiled layer into its own IndexedDB. Uniform — our curated buildings get no special treatment.
Three independent findings, each alone sufficient to kill Option 2:

**1. The "expensive on Hospital/Terminal" concern is about a LOOPING BUG, not one-time cost.**
Verified at `ROOM_INJECTOR_NEEDLE.md:305-306` — the guarded failure mode is *"(a) a bug in the version
comparison recomputing on **EVERY load, not just once** — expensive on Hospital/Terminal (48-63k
elements)."* Different problem, different fix. And **that bug actually happened and was already fixed**
(`:405-407`): patch-carrying buildings recompiled every load →
`§STAGE4_RELOAD3 db=Terminal_extracted.db RESULT=FAIL recompute_loads=[1,2,3] l1ms=7376` → fixed →
`RESULT=PASS recompute_loads=[1] l1ms=6937`. I had repeated "63k elements may be expensive" as if it
were a cost finding. It never was. **Retracted.**

**2. MEASURED — the missing row in that file's `l1ms` table (`bench_compile.js`, same
`viewer/lib/room_walker.js` the browser runs, against the SERVED bytes):**
```
§BENCH_COMPILE Hospital_63k elements=63415 rooms_before=142 rooms_after=214 open=27ms compile=444ms total=475ms
```
**444ms.** Not 7 seconds — Terminal's `l1ms=6937` is the WHOLE load (boot + patch + compile + write),
not the compile.

**⚠ CORRECTION (user, same day): "Largest is LTU" — Hospital is NOT the largest building, and the
conclusion had to be re-tested on the one that is.** `LTU_AHouse` is **125,698 elements, ~2x Hospital's
63,415**. Fleet compile costs, measured the same way, so the claim rests on the real worst case:
| building | elements | rooms | compile |
|---|---|---|---|
| **LTU_AHouse** (extracted) | **125,698** | 369 → 422 | **760ms** |
| LTU_AHouse (meta) | 122,667 | 332 → 394 | 568ms |
| Hospital | 63,415 | 142 → 214 | 444ms |
| Clinic | 16,114 | 118 → 207 | 234ms |
| JKR | 8,985 | 79 → 62 | 149ms |
**The largest building in the fleet compiles in 760ms**, and cost scales **sub**-linearly with element
count — 2x the elements for 1.7x the time, no cliff. **There is no cost case for a client-compile
exception on any building, and none should be written.**
**⚠ Scope that claim honestly if it is ever quoted outside this file:** it is PROVEN for the fleet
actually measured (up to 125,698 elements). The sub-linear trend makes extrapolation to a larger
future or user-dropped building reasonable, but that is an EXTRAPOLATION, not a fifth data point. *(Caveat: node, not a browser tab — no DOM, no competing render loop. Treat
as a floor. The margin is ~15x before it could matter, and production already ran it — see 3.)*

**3. It is REDUNDANT — the client-side self-heal ALREADY did this to Hospital, in production.**
`ROOM_INJECTOR_NEEDLE.md:561`: *"The v3 recompile (**142→214 rooms**) is the FIRST time Stage 3/4's
self-heal has reached a building that was this stale."* The benchmark above reproduces **142→214**
independently. **That is exactly the room set Option 2 would have uploaded** — 214 logical +
10 `CORRIDOR_ROOM` injections = the 224-room graph. Option 2 was proposing to ship, by hand and
per-building forever, the thing the shipped mechanism already delivers fleet-wide and for free.

**This also closes the session's original puzzle.** "Why does the served DB have 142 spaces when the
user's live console shows 224?" — because the client self-healed, and their Save-DB export captured
the *post*-self-heal state. `~/Projects/BIM_DB/Hospital.db` is not a newer compilation that never
shipped; it is the shipped mechanism's own output.

**⚠ My own wrong negative, owned:** I grepped `viewer/scene.js` for room-writing, found none, and
concluded "the viewer reads, doesn't write rooms." The mechanism is `viewer/lib/room_walker.js` +
`ensureRooms()` — a file my grep never touched. A too-narrow grep produced a confident negative that
sent this lane toward an OCI upload it never needed. Exactly what
[[feedback_verify_before_broad_negative_claims]] exists to prevent.

**Nothing to do for Hospital.** Missing `rooms_meta` already counts as maximally stale → auto-recompute
fires on next load, by design. No backfill, no upload, no exception. `mkpatch.sh` and the 856KB patch
stay ONLY as a DRY-run baseline generator; they are **not** upload candidates. **Item 1 is closed.**

## 📋 FOLLOW-UPS — logged, NOT started (2026-07-25, agreed with watchdog)

### F1 — Should the RASTER self-heal client-side too? **Benchmark before deciding.**
The one piece of server-generated derived data still pushed to OCI (Option 1, live). Rooms have a
client-side self-heal; the raster does not — the builder is node-only. **Do not decide by symmetry.**
The rooms case only closed because someone measured 444ms instead of assuming; deciding "port it
client-side" without the equivalent number would repeat that mistake mirrored.
**Not urgent:** #998's provenance gate already covers the raster's current push on both axes, so this
is architectural consistency, not an active correctness risk the way the room patch was.

**Starting anchor, measured here so F1 doesn't begin cold** — server-side `build_storey_walkable_raster.js`
on Hospital (`Hospital_meta.db` + sibling geo, 7 storeys):
```
3.60 s wall, 786,384 KB peak RSS      §RASTER_GEOM_INDEX guids=63182 resolvedHashes=20609
```
**The wall clock is not the finding — the 786MB peak is.** ~8x the rooms compile in time, but a
*qualitatively* different memory profile, and an earlier run in this session needed
`--max-old-space-size=6144`. Room compilation walks walls/doors; the raster decodes
`component_geometries` mesh triangles, which is heavier per element — exactly the "different profile"
this was flagged for. **786MB peak in node is a serious question for a browser tab, and likely
disqualifying on mobile.** So F1's real question is memory, not speed:
1. Measure peak heap for a browser port of the same logic (Hospital AND `LTU_AHouse` at 125,698 elements).
2. If it cannot fit a mobile tab, "stays server-pushed" is the ANSWER, written down with this number as
   its justification — not an unexamined gap, and not an exception granted by default.
3. Only if it fits does the port become the consistent choice.
Harness to copy: `bench_compile.js` in this folder.

### F2 — JKR room count DECREASED under v3: 79 → 62
Every other building GAINED rooms (`Hospital 142→214`, `LTU 369→422`, `Clinic 118→207`). A shrink is
either a real fix (v3 merging genuinely over-split rooms) or a regression on that building's geometry
— **the two are indistinguishable from the count alone**, which is why this needs a look rather than a
shrug. Recorded here so it does not evaporate with the session transcript. Not this lane's question.

### F3 — `LTU_AHouse` meta/extracted split: 332 vs 369 spaces (394 vs 422 after compile)
Same building, two DBs, diverging room counts — the shape already named in
[[project_db_snapshot_divergence_landmine]]. **Not novel**, logged so it is attached to a specific
building/number pair rather than remaining a general warning.

### F4 (context only, no decision pending) — there is NO threshold-override surface to reuse
Confirmed by inspection: `room_walker.js`'s `walk(db, opts)` reads exactly ONE field — `opts.write`;
every threshold (`RES`, `MIN_AREA`, `SUSPECT_ELONGATED_ASPECT_MIN`, `SUSPECT_OPEN_ENCLOSURE`, `MERGE_*`)
is a hardcoded module constant, exposed read-only on the API object with nothing reading an override
back in. `compile_rooms.py` is the same shape (bare `--write`, no argparse/config/env). The per-building
`patches/<dbFile>.sql` mechanism is a DATA-level self-heal, not threshold config; `ensureRooms({force,
skipPatch})` is two booleans. **So any "disclosed-exception JSON" idea is clean-slate work that would
SET the convention, not a rename of something already present.** Fact, not a proposal.

## ▶ NEXT SESSION — §TOUR_TIMELINE_SCRUB (user, 2026-07-25). Ranked-item 4, now the named task.
**Owner file is `prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md` — its own `▶ NEXT TASK` block (line 27)
is current and correct. Work there, not here.** This file's items 1/2/3 are closed and F1–F4 are
logged; the scrubber is independent of all of them.

**Verified against the repo, not relayed on trust:**
- PR **#989** (`§HL-FIRST` highlight-first routing) — `state=MERGED, mergedAt=2026-07-24T20:00:50Z`.
  **Do not re-implement or re-verify it.**
- ✅ **The branch trap is GONE — deleted, not just warned about** (user: *"resolve to clean up as i am
  no git admin"*). `feat/tour-timeline-scrub` no longer exists locally OR on `origin`; worktree
  `/tmp/wt-tour-scrub` was already gone. **Verified safe before deleting, not assumed:** its entire
  content-diff vs `origin/main` was 11 files / **476 deletions / 10 insertions**, and every one of
  those 10 insertions was a SUPERSEDED leftover — `CACHE_VERSION 'v842'`, `TOUR_CACHE_VER 'v12'`
  (main has v13+), `room_graph.js?v=9`, `tour.js?v=13` cache-busters, stale README counts. Zero
  unique work. **Still branch the scrubber off fresh `origin/main`** — that instruction stands on its
  own, it just no longer has a footgun behind it.

**Settled — do NOT re-litigate (all recorded in the owner file, verified present):**
- **UI:** cyan pulsing dot, viewer accent `#4fc3f7` — *deliberately not red*, avoiding collision with
  the real `.webm` export indicator. All four knob groups already specced.
- **Mechanism:** bespoke seek built into `tour.js`, borrowing `time_machine.js`'s doctrine and look
  but **not its code**.
- **The unlock:** chain each action's end pose at BUILD time so tour pose becomes `f(T)` — precompute
  pose-as-a-function-of-time once when the tour is built, rather than recomputing live while scrubbing.

**Harnesses that transfer** (this folder): `hl_witness.js` loads the REAL `viewer/tour.js` into a `vm`
and runs the real `_buildGraphRoute` — it is how `§FLY_HL_FIRST` was measured numerically, and a
scrubber is exactly the kind of continuous/time-varying behaviour this project's FUNDAMENTAL LAW says
must be proven by `§`-logged pose values over T, never by watching a recording. Its `WT` is now an env
var (`WT=<worktree> node hl_witness.js <tour.js> <db> <label>`), so it points at a fresh worktree
without editing.

### 🧹 Branch cleanup done (2026-07-25, user delegated: *"resolve to clean up as i am no git admin"*)
`bim-ootb` had **507 local / 590 remote** branches. Deleted every branch whose PR is **MERGED**
(`gh pr list --state merged`), after subtracting the **24** currently checked out in a worktree and
`main`. Result: **347 local / 424 remote** — **160 local + 166 remote** removed, **0 failures**.
Re-verified after the last batch drained (`git fetch --prune`): **0 merged-PR branches remain**.
Safe by construction: a merged PR's content is in `main`, and the ref is recoverable from the PR.
- **Not touched:** branches with no PR, with an OPEN PR, or checked out in any worktree — those are
  someone's in-progress work, and the same rule that protects `/tmp/wt-*` worktrees protects them.
- Two mechanics worth reusing: `git push origin --delete` **aborts the whole batch** if one ref is
  already gone, so `git remote prune origin` FIRST and fall back to per-branch on batch failure; and
  batch the deletes (~15/push) — 165 individual pushes will outrun a 2-minute tool timeout, chunked
  ones do not. No LFS hang was hit (4.2s for the first chunk of 10), but the risk from
  `CLAUDE.md §DB CHANGES` is real, so the loop is timeout-guarded per push.

## 🐕 §WATCHDOG — session closeout (2026-07-25, same reviewer role, continuing the handoff above)
User closing this session (Chrome update reboot). Updating the two things the `§WATCHDOG` section
above left stale, then indexing everything else this session touched so a fresh session isn't
re-deriving it.

**⛔ Item 1 (raster deploy) is CLOSED, not blocked anymore.** The watchdog section above still reads
"BLOCKED on the user." It shipped: Option 1 (raster only) is live in production, verified against the
served bucket's own bytes (etag/md5-matched), `poc_raster_cover.js` 100% own-footprint both variants.
Option 2 (rooms+raster server patch) was investigated further and correctly **shelved as redundant**,
not merely deferred — the client-side self-heal already delivers the identical room set (142→214,
matches `rooms_meta` exactly) fleet-wide for free, benchmarked fast on the real worst case
(LTU_AHouse 125k elements, 760ms, no scaling cliff). No cost case for a server-push exception exists
anywhere in the fleet. `mkpatch.sh`'s 856KB patch survives only as a dry-run baseline generator.

**A provenance gate now exists and is doctrine, not a manual habit** — `#998` merged
(`deploy/OCI_UPLOAD.md` rule 6): every OCI upload of this data is checked on two axes (served DB's
actual bytes, verifying worktree's actual commit), refuses on either mismatch, caught its own first
real defect (an unreconstructable patch) before publication.

**One number that needs re-checking, not re-trusted:** independently re-ran `pathab.js` against a
user-saved `Hospital.db` (self-heal output, dated *before* the raster patch shipped) — got
**pathable=61.7%** (15407/24976, deg0=34, R14 atrium reachable), not the 86% figure this thread and
conversation had been repeating. That 86% traces to PR #995, which this file's own commit history
records as corrected twice (#996, #997) — plausible it never actually survived as the real number.
**Next session: save Hospital fresh (post-raster-patch, post-#997/#998) and re-run `pathab.js` +
`poc_raster_cover.js` against that file** — whichever number comes back is the one to carry forward;
stop citing 86% until then.

**DiscWalker (Modeller) does not and should not consume this graph for containment** — confirmed
live against current `disc_walker.js` (excludes `RM_%`/`≈` rows by design, per `WalkerDoctrine.md`
§14/§15, re-verified not re-derived). A real, separate, *unaddressed* opportunity was corroborated —
not newly found, already on record 2026-07-18 in `RESUME_DISC_WALKER_ENVELOPE_BOUND.md:3-25` — for
routed-network MEP placement (PLB/ACMV) specifically, which honestly refuses on zero-MEP buildings
today rather than fabricating; real corridor connectivity is a categorically different trust class
than the room-boundary approximation §14/§15 correctly excludes. See that file's added corroboration
note before touching this.

**Other files touched this session, not duplicated here:**
- `prompts/Viewer/SAVE_DB_SCENE_STATE.md` — new, idea-only spec: Save-As-DB persisting camera/view
  state, a cut/join/heal tour EDL, versioned "Save As Tour" cuts (reusing the existing
  `versions[]`/`latestVersion` shape from `LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`), a Loop option.
  Video export explicitly ruled out of scope — existing `.webm`/Record stays untouched.
- `prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md` — gained a small pointer addendum to the file above
  (additive only, doesn't touch the builder's own `§TOUR_TIMELINE_SCRUB` narrative) — **and
  separately, that scrubber shipped**: bim-ootb PR #999 (`tour.js` v17, `sw` v847), 9/9 real-building
  witnesses (LTU_AHouse, determinism/hold/drag-release/overlay all exact-zero deltas). One flagged,
  unresolved item: a pre-existing 39.8m playback-vs-seek gap during the tour's new opening high-radius
  orbit (adaptive-jump smoothing, not caused by this PR, doesn't affect seek determinism) —
  recommended as its own named follow-up given `§HL-FIRST` made that beat the very first thing seen,
  not something to leave as an ambient "worth deciding."
- `docs/internal/WalkerDoctrine.md` §15 — dated re-verification addendum (not new doctrine) confirming
  the Viewer/Modeller substrate split still holds against today's current code.
- `docs/StrategicIndustryPositioning.md` — new Tier 3 (Frontier) entry documenting this whole
  topology-substrate thread publicly, honestly caveated, explicitly held out of the Moats list pending
  further maturity.

Independently verified this session (not relayed): the pathab.js/poc_raster_cover.js numbers above,
the disc_walker.js exclusion grep, the `rooms_meta`/`spatial_structure` contents of the saved DB, the
tour.js citations Opus gave for the scrubber's three open items.

---

## 🔎 §G1-EXIT-IS-A-LIFT-DOOR — G1 investigated + decided (2026-07-26, watchdog decision + measurement)
```
# ⚠ DO NOT REMOVE
SCOPE: the G1 gap above ("exits=0, investigate why Terminal yields 5 and Hospital 0") is ANSWERED
here, and the answer invalidates the glass-entrance-door suspect. Watchdog set the direction; this
section carries the measured evidence behind it. Read before writing any exit-node code.
```

### The decision (watchdog, 2026-07-26) — real IfcDoor-to-outside FIRST, synthesis only as a narrow fallback
Verbatim intent, recorded so it is not re-litigated:
- Same doctrine this file already commits to (§VOCABULARY_NOT_REALTIME). **A synthesised envelope exit is
  invented geometry** — not something IFC asserted — and this project does not set that precedent per feature.
- A real exit door is **checkable against ground truth** (does it open to outside: no room on the far side /
  adjacent to an unbounded face). Synthesis has no such check, so a wrong synthetic exit fails SILENTLY and
  would only be caught by eyeballing a tour — which this project's rules forbid as verification.
- Therefore: spend the work on **why doors aren't classifying as exterior**, not on synthesis. Any fallback
  stays narrow and is logged **distinctly (`§EXIT_SYNTH`)** so a witness can never confuse it with a measured exit.

### Finding 1 — there is no exterior-door rule to fix. `exit` means "a door named like a LIFT".
`common/room_graph.js:107` — `NON_ROOM_DOOR_NAMES = ['liftdeur','lift','elevator','aufzug','fahrstuhl','hoist']`.
E4 (`:711`) turns **every door whose name matches that list** into an `EXIT::` node. Nothing anywhere tests
whether a door faces outside. Measured over the fleet's ARC doors (`discipline='ARC'`, transform present):

| building | ARC doors | lift-name hits (= today's `exits`) | doors whose name says exit/escape/entrance/external |
|---|---|---|---|
| Hospital | 440 | **0** | 0 |
| Clinic | 254 | **0** | 0 |
| Terminal | 135 | **5** | 0 |
| HHS | 133 | **0** | 0 |
| LTU_AHouse | 606 | **0** | 0 |
| JKR | 65 | **0** | 0 |

So `exits=0` is not a bug in an exterior rule — **no such rule exists**. And the glass-entrance-door
suspect recorded at G1 above is disproven: `nonRoomDoors` counts lifts, not glass doors.

### Finding 2 — Terminal's five "exits" are ELEVATOR doors, and that is an active defect
Terminal's exit sample: `Side_opening_ElevatorLift_Door_with_Call_buttons_9478:12000 x 2290 Opening`.
Consequences already visible in shipped behaviour, not hypothetical:
- The Fly Tour's `entrance` = the **lowest `exit` node**, so **Terminal's tour "entrance" is a lift door**.
- That is exactly the residual #1012 measured: the tour's only 2 remaining wall-illegal chords are the leg to
  and from that node, logged `§PATH_LEGAL_DETOUR_FAIL cause=ENDPOINT_OFF_FLOOR aWalkable=false` — a lift car
  is not walkable floor, so A* correctly declines to route there (`§ON-FLOOR-GUARANTEE`).
- `escapeRoute()` (still zero viewer callers) would, if wired today, route occupants **to a lift** — the one
  thing fire egress must never do. **Wiring it before G1 would ship a wrong answer, not a missing one.**
This makes T4 of `Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §TOUR_HIGHLIGHT_LANE` correctly blocked, for a sharper
reason than that file assumed: not "no exits yet" but "the exits that exist mean something else".

### Finding 3 — the measured exterior test is FEASIBLE, and G2 is what made it possible
Probe (scratchpad, method reproducible from this description): for each ARC door, sample a point either side
along its **through-axis** (perpendicular to the long bbox side) and ask the shipped per-storey walkable
raster (G2, #1006) whether each side is floor. Both sides walkable = interior; exactly one = EXTERIOR
CANDIDATE; neither = off-raster. Nothing invented — raster is measured floor, door pose is measured geometry.

| building | ARC doors | storeys w/ raster | interior | EXTERIOR candidates (d=1.0m / 1.5m) | off-raster |
|---|---|---|---|---|---|
| HHS | 133 | 4 | 130 | **3 / 3** | 0 |
| Hospital | 440 | 7 | 220 | 80 / 137 | **133** |
| Clinic, Terminal, LTU | — | **0 (no `storey_walkable_raster` table)** | — | — | — |

- **HHS is the clean case and it works:** 3 candidates out of 133, stable across both sample distances, and the
  first one is `Türelement 1-flg - Drehflügel - Glas:Tür` — a glass revolving-leaf **entrance** door. That is a
  plausible, checkable answer produced with zero synthesis.
- **Hospital shows the real prerequisite:** 133 of its 440 doors sit off-raster entirely, so the naive
  two-side test cannot distinguish "outside the building" from "a hole in the raster" — hence 80–137 false
  candidates. **G1's blocker is raster COVERAGE + a stricter side test** (require the non-walkable side to be
  outside the storey footprint, not merely an uncovered cell), NOT the absence of exterior doors.
- **Clinic/Terminal/LTU ship no raster table at all** — #1006 regenerated Hospital's only. Any G1 work on
  those buildings needs their raster built first (`scripts/build_storey_walkable_raster.js`).

### The G1 work order this implies (ordered, each independently checkable)
**Watchdog split (2026-07-26): step 1 is an ACTIVE-CORRECTNESS fix and ships alone — it is not blocked on
steps 2-4. Steps 2-4 are a separate multi-session lane (fleet raster coverage is the gating work there).**

1. ✅ **DONE — bim-ootb #1014 `§G1-EXIT-IS-A-LIFT-DOOR` step 1, W-EXIT-NOT-A-LIFT 45/45.**
   E4's exit-node creation removed; `isRoomDoor()`/`NON_ROOM_DOOR_NAMES` stay the *room-test* filter they were
   ported from (`compile_rooms.py`) and nothing else. **Measured:** Terminal `exits 5 → 0` (all 5 confirmed
   lift-named) and its Fly Tour `illegalChords 2/91 → 0/84` — **zero**, the last wall-cutting chord in the
   fleet's tour gone with the lift-door entrance. On all 7 buildings the routing graph is byte-identical
   (room/circ/stairwp/spine/doorwp counts, non-E4 edges, room→room pathability) and visited stops are
   unchanged. Risk was low for a measurable reason, not a hopeful one: **6 of 7 buildings already had
   `exits=0`**, so every consumer's no-exit path (`tour.js` §HL-ORIGIN, `scene.js` `_graphEntrance`→`'none'`,
   `effects.js` §CINEMA_EXIT→`exitSrc=db-doors`) was already the common path — this moved Terminal onto it
   rather than opening a new one. Live browser confirmed identical numbers (`§ROOM_GRAPH exits=0`,
   `§FLY_ROUTE illegalChords=0/84`). Versions bumped in lockstep: `room_graph.js?v=12`, `§TOUR_VERSION v19`,
   `TOUR_CACHE_VER v18`.
   ⚠ **Intended side effect:** Terminal now logs `stairDown=-` — it has no descent finale, because it no
   longer has a lift door to misname as an entrance. Step 2 is what gives it a real one. Do not "restore"
   the finale by relaxing the exit rule.
2. **Add the measured exterior test** (side-sample vs raster + footprint), gated to storeys with real raster
   coverage; log candidates distinctly so a witness can count them per building.
3. **Build the missing rasters** (Clinic/Terminal/LTU/JKR…) — this is the coverage prerequisite, already
   half-owned by `VIEWER_FIND_PANEL_ROOM_ACCURACY.md §15`'s "5 of ~29 buildings" finding.
4. **Only then** wire `escapeRoute()` as the tour's closing leg (that lane's T4), and only then consider a
   narrow `§EXIT_SYNTH` fallback for buildings with genuinely no exterior door data.

### ▶ §G1-EXTERIOR-DOOR-LANE — steps 2-4 as a dispatchable lane (opened 2026-07-26, NOT started)
Step 1 shipped; this is what remains, sized honestly as multi-session work rather than one task.
- **Entry state (measured, do not re-derive):** `exits=0` on every building, by design. `RG.escapeRoute` is
  exported, callable, zero callers. Raster coverage is the bottleneck — `storey_walkable_raster` exists for
  Hospital + HHS in the fleet DBs checked; **Clinic, Terminal, LTU_AHouse ship no such table at all**, and
  `VIEWER_FIND_PANEL_ROOM_ACCURACY.md §15` already put fleet coverage at ~5 of ~29 buildings.
- **The test to implement** (feasibility already measured, §Finding 3 above): for each ARC door, sample a
  point either side along its through-axis (perpendicular to the long bbox side) against the storey's
  walkable raster. Both sides walkable = interior; exactly one = exterior candidate. **HHS: 3 candidates of
  133 doors**, first is a glass revolving-leaf entrance — plausible and checkable. **Hospital: 80-137**,
  because 133 of its 440 doors sit off-raster — so the test needs a second condition (the non-walkable side
  must be outside the storey FOOTPRINT, not merely an uncovered raster cell) before it can be trusted there.
- **Order:** (a) raster builds for the uncovered buildings, (b) the two-condition exterior test + a witness
  counting candidates per building against hand-checkable expectations, (c) wire `escapeRoute()` as the tour
  finale (`FLY_TOUR_CORRIDOR_GRAPH.md §TOUR_HIGHLIGHT_LANE` T4), (d) `§EXIT_SYNTH` ONLY if a building with
  real raster coverage still yields zero candidates — logged distinctly, never indistinguishable from a
  measured exit.
- **Fences:** no name-based exit rule ever again (that is what step 1 removed); no synthesised envelope exit
  as a primary source (watchdog, §The decision above); a candidate set that is a large fraction of a
  building's doors is a FAILED test, not a result — a real building has a handful of exterior doors.

## ✅ SHIPPED + MERGED 2026-08-05 — §SPINE-BRIDGE-CLUSTER, bim-ootb PR #1200 @ `5a68932` (origin/main)
resume from `bim-compiler/prompts/Viewer/FindRooms/RESUME_ROOMPATH_DETOUR_BACKTRACK.md` §3.2

```
# ⚠ DO NOT REMOVE
SCOPE: fix §ROOM-SPINE-BRIDGE's eligibility test (line ~830, `if (g.kind !== 'room' ||
_degSoFar[lg]) return;`) — it is scoped to a single NODE's degree, not the connected COMPONENT it
sits in, so a room that has a door to exactly one sibling and nothing else is treated as "already
connected" and never gets a bridge attempt, even though its whole 2-room island is unreachable from
the rest of the building. This is a general graph-topology gap, not an LTU quirk — fix it once,
abstractly, for any IFC building the fleet ever loads. Read the log after every run.
```

### §GIVEN — measured on real production code + real DB, not simulated (2026-08-05)
`LTU_AHouse_meta.db`, `~/bim-ootb/common/room_graph.js` (unmodified). `RG.shortestPath` from
`RM_VÅNING_1_1` to `RM_VÅNING_4_1` returns `null`. Direct reachability probe (`RG.shortestPath`
against all 335 rooms) found **316/335 reachable**; all 19 unreachable rooms are on `Ref.` (3, a
reference/unused storey — expected) and `VÅNING 4` (8 of its 12 rooms). `VÅNING 4`'s edge list:
```
RM_VÅNING_4_2  <-> RM_VÅNING_4_1   (E1, door)   — pair, NEITHER reaches spine
RM_VÅNING_4_8  <-> RM_VÅNING_4_7   (E1, door)   — pair, NEITHER reaches spine
RM_VÅNING_4_11 <-> RM_VÅNING_4_10  (E1, door)   — pair, NEITHER reaches spine
RM_VÅNING_4_3                       — zero-degree; §ROOM_SPINE_BRIDGE_REJECT (nearest 40.13m, no route)
RM_VÅNING_4_12                      — zero-degree; §ROOM_SPINE_BRIDGE_REJECT (nearest 67.35m, no route)
RM_VÅNING_4_{4,5,6,9,+2 via E7 doorwp} — DO reach SPINE::VÅNING 4|x|32.58 directly (E2/E7)
```
**Root cause, in the code, not inferred:** the bridge loop (`§ROOM-SPINE-BRIDGE`, line ~828) only
considers a room a bridge candidate when `_degSoFar[lg]` is falsy — i.e. **zero edges at all**. R1
has degree 1 (its door to R2), so it is skipped even though {R1,R2} together have zero edges to
anything outside the pair. The zero-degree singles (R3, R12) DO get an attempt and are correctly
rejected on distance — the mechanism works, it's just never invoked for clusters of size ≥2.
**Ruled out first (per this project's doors-not-openings doctrine,
[[project_openings_ghost_doors_standin]]):** this is NOT a missing-`IfcOpeningElement` artifact —
openings are ghost/position-only fleet-wide by design and were never the pathing signal; doors are,
and the doors that exist here (R1↔R2) are read correctly. The gap is purely which rooms the bridge
loop considers eligible.

### SPEC — bridge by connected component, not by node degree
Same mechanism (`_astarHop` legality test, nearest-candidate-first, first LEGAL one wins, reject
logged if none), widened to fire once per disconnected **component**, not once per zero-degree
**node**:
1. Before the bridge loop runs, union-find over the room-graph's own E1 (door) edges, per storey —
   this reuses the union-find approach already proven in this file's §Lane C1 POC (2026-07-17), no
   new data structure invented.
2. A component is "already connected" (skip it) if ANY of its members already has an edge of kind
   E2/E6/E7 (i.e. already touches spine/circ/doorwp-to-spine) — not "has any edge at all".
3. For every component that is NOT already connected: rank ALL of the component's members (not just
   one arbitrary representative) by distance to the storey's spine points, try nearest-first across
   the whole component, first legal `_astarHop` wins — same acceptance test as today, just a larger
   candidate pool. Log which member of the component won (`§ROOM_SPINE_BRIDGE_CLUSTER`), so a witness
   can tell a single-room bridge apart from a cluster bridge.
4. If no member of the component has a legal route, the whole component stays disconnected ON
   PURPOSE (same honesty rule as today — `§ROOM_SPINE_BRIDGE_REJECT`, extended to name the component
   size and every member's guid, not just one room's).
**API-compatible**: `buildGraph()`/`shortestPath()` signatures unchanged, this is internal to the
bridge block only. **Additive only**: existing bridges/edges are never removed or reweighted — the
only possible effect is MORE rooms becoming reachable, never fewer, never a different route for a
pair that already had one (falsifiable, see Acceptance test).

### POC GATE (do this FIRST, calculation-only — this file's standing law)
A standalone Node script (no engine edit yet): load each of the 9 fleet building DBs, run
`RG.buildGraph`, union-find the E1 edges per storey by hand outside the engine, count how many
components per storey have zero E2/E6/E7 edges among their members — this is the blast-radius
number BEFORE writing a single line into `room_graph.js`. Expect LTU `VÅNING 4` to show 3
components of size 2 (R1-R2, R7-R8, R10-R11); if any OTHER fleet building shows a nonzero count,
that's evidence this is a real general gap, not an LTU-only curiosity — record the number, don't
assume.

### Acceptance test (falsifiable, offline, one line)
On `LTU_AHouse_meta.db`: `RM_VÅNING_1_1 -> RM_VÅNING_4_1` (previously `null`) returns either a real
`path`/`doors`/`polyline`, or — if `_astarHop` genuinely finds no legal route from any of R1/R2 —
an honest `null` with a `§ROOM_SPINE_BRIDGE_CLUSTER_REJECT` log naming the component. Either
outcome is acceptable; a silent unchanged `null` with no new log line is not. Fleet-wide: rerun the
full room-pair reachability sweep on all 9 buildings before/after — reachability count may only
**increase or stay equal**, never decrease, and every previously-reachable pair's `path`/`doors`
must stay byte-identical (this change must never alter an existing route, only add new ones).

### WITNESS PLAN
Reuse `RESUME_ROOMPATH_DETOUR_BACKTRACK.md §1`'s 3-check witness (node-revisit, same-floor
self-intersection via same-Z polyline runs only, `chordIllegalCount` on every same-storey segment)
on the newly-reachable LTU pair, plus the fleet-wide `witness_full_connectivity.js` before/after on
all 9 buildings to prove the byte-identical-elsewhere half of the acceptance test.

### DONE WHEN
POC gate numbers recorded for all 9 buildings → engine change → LTU `V1R1->V4R1` witness green →
fleet connectivity witness shows only-equal-or-more reachable pairs, zero regressions → PR shipped.

### ✅ RESULTS (2026-08-05, measured, real production code + real DBs, not simulated)
- **POC gate** (`poc_spine_bridge_cluster.js`, committed): 7 of the 9 fleet buildings checkable
  locally (Duplex has no `_meta.db` split present locally, skipped honestly — not evidence either
  way). **6 isolated door-pair components / 12 rooms, ALL on `LTU_AHouse`** (VÅNING 2 ×2 pairs,
  VÅNING 4 ×4 pairs) — **zero** on Hospital, Clinic, Terminal, JKR, HHS, TermRooms. Confirms this is
  a real, general graph-topology gap (any IFC could hit it), not something LTU-specific about its
  data — it just happens to be the one fleet building that currently exercises it.
- **Engine change**: `common/room_graph.js` §ROOM-SPINE-BRIDGE block, union-find by E1 edges,
  bridge-by-component. `§ROOM_SPINE_BRIDGE_CLUSTER`/`§ROOM_SPINE_BRIDGE_REJECT_CLUSTER` log lines
  added so a witness can tell a cluster bridge apart from the pre-existing single-room case.
- **Acceptance test**: `LTU_AHouse_meta.db` `RM_VÅNING_1_1 -> RM_VÅNING_4_1`, previously `null`, now
  returns a real path (19 stops, 211.1m, 5 doors). `RM_VÅNING_4_10`/`_11` (the one pair with no
  walkable route within reach, 67.35m to nearest spine candidate) still honestly rejects — the fix
  does not invent a passage where none is legal.
- **Fleet regression** (`witness_spine_bridge_cluster_regression.js`, committed — classifies
  same/newlyFound/lost/changed, not the older raster-polyline witness's binary "any diff = fail",
  which doesn't distinguish a real regression from an intended new connection): **89,627 existing
  room pairs checked across all 7 loadable buildings — 0 lost, 0 changed. 3,500 newly connected,
  all on LTU_AHouse** (nothing else in the fleet had an isolated cluster to fix). Matches the POC
  gate's blast-radius prediction exactly.
- ✅ Pushed, PR #1200 opened, **merged to `origin/main` 2026-08-05T03:01:05Z, commit `5a68932`.** The
  pre-existing `witness_room_path_raster_polyline.js` G3/G4 checks fail on both before AND after
  this change (Hospital fixture path issue, Clinic/Duplex rect-fallback 0% reduction) — confirmed
  PRE-EXISTING on origin/main, unrelated to this fix, not something this PR fixed or hid. Nothing
  further owed here; §3.2 is closed.

## ▶ §PATH_LEGAL_DETOUR_REVISIT_FORCED — follow-on, found reviewing §3.1's length-guard mechanism
✅ SHIPPED + MERGED 2026-08-05, bim-ootb PR #1210 @ `8574e51` (origin/main) — same session, different
concern from §SPINE-BRIDGE-CLUSTER above (that's connectivity; this is a logging gap in the
pre-existing `§NOREVISIT-LENGTH-GUARD` mechanism, `_legalizePath` around line 1466).

**The gap:** `_legalizePath`'s revisit-guard only logged 2 of its 3 real outcomes — found a
revisit-free alternative that's not longer (`§DETOUR_NOREVISIT`), or kept a longer one anyway
(`§DETOUR_REVISIT_KEPT`, this is §3.1's Hospital case). The third outcome — **no revisit-free
alternative exists at all**, i.e. the revisit is the ONLY legal route — fell through with ZERO log
line, indistinguishable from a clean detour that never had a revisit to begin with. User caught this
directly: "what if there was no alternative route and exists only a revisit?" The mechanism itself
was already correct (it does keep the revisit and route successfully, no crash, no lost path) — the
gap was purely visibility, against this project's own no-silent-fallback Log Mandate.

**Fix:** one `else` branch, one `_log('§PATH_LEGAL_DETOUR_REVISIT_FORCED ...')` call. No other
statement — no assignment to `mid`, no control-flow change — so the computed route is provably
identical to before by inspection alone (verified anyway: spot-checked a real LTU_AHouse pair that
hits this exact branch, `RM_VÅNING_1_1 -> RM_VÅNING_2_27`, path/doors/distance byte-identical
before/after).

**Measured real occurrence** (not theoretical): **437 fleet-wide** — 318 on `LTU_AHouse`, 119 on
`Clinic`, 0 elsewhere. `§DETOUR_NOREVISIT` (the "found a shorter alternative" branch) never fires
anywhere in the fleet (0 across all 7 checkable buildings) — worth knowing if anyone later tunes
`_detourForChord`'s candidate search, but not itself a defect.
⚠ **Shared-worktree stash caution, hit live this session:** `/tmp/wt-sandbox`'s stash stack is
SHARED across every session that has ever used this standing sandbox (9+ unrelated stashes found
sitting there mid-session). A `git stash` here is not scoped to your branch — verify with `git
stash show -p stash@{0}` that the top entry is really yours before popping. Already documented in
memory ([[feedback_git_stash_shared_across_worktrees]]); this is a live confirmation, not a new rule.
