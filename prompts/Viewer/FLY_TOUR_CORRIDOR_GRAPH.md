<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# FLY TOUR — CORRIDOR + STAIR OCCUPANT PATH (2026-07-16)

```
# ⚠ DO NOT REMOVE
SCOPE: upgrade the Viewer Fly tour (viewer/tour.js, bim-ootb) to route its interior flight along
the OCCUPANT graph — corridors (hallway backbone centerlines), through doors, and visibly up/down
stairwells — auto-injecting compiled rooms first when the building has none (reuse the needle
injector body, do not fork it). Read the log after every run — exit code is not evidence.
PUSH PAUSE in effect: commit locally, verify on localhost in a real browser, do NOT push, no PR.
No binary .db commits ever. Every DONE claim needs a §-log line proving it.
User intent (verbatim, 2026-07-16): "Now that we have much rooms and corridors defined in
buildings, can we review the Fly feature tour path to look for such corridors and fly in them
even up and down stairs in a interesting path strategy?" + "it might have to auto inject the
rooms/corridors metadata into the building first. if not yet".
COMPANION FILE: `FLY_TOUR_DLOD_SCALE.md` owns the SAME file's (`viewer/tour.js`) pacing/speed/
look-ahead/performance concerns (§21-§24, §TARGET_BOUNDED_LOOKAHEAD, §BASE_SPEED_REGRESSION) —
this file owns WHICH points/order (routing); that one owns HOW FAST and WHICH WAY THE CAMERA
LOOKS along whatever points exist (pacing). Read BOTH before touching tour.js — they're
orthogonal concerns but share one file, and a routing change can silently regress a pacing fix
(or vice versa) if only one side's spec is checked.
PUSH STATUS (correction, 2026-07-26): the "PUSH PAUSE" line above is STALE — push pause was
LIFTED 2026-07-17 project-wide (see bim-compiler CLAUDE.md). Push permission is ON: normal
fast-forward pushes / PRs are fine (not force-push, not skipping localhost witness verification).
```

## ▶ NEXT TASK (corrected 2026-07-26 — §HL-FIRST is SHIPPED; next is the scrubber)
**§HL-FIRST is DONE and LANDED — do not re-implement it, do not re-verify it.** PR **#989**
"feat(viewer): Fly Tour highlight-first routing — main hall → stairs → the rest" is **MERGED**
(squash, auto-merge; merge confirmed via `gh pr view 989`, not assumed from "auto-merge armed").
`tour.js` v13, `sw.js` v842. The full spec, the 7-building witness sweep
(W-HL-MAINHALL/W-HL-STAIRS-EARLY/W-HL-NOREGRESS all ✅) and two real bugs found+fixed (§HL-ORIGIN,
the `v.i>0` beat-drop) are below at `✅ IMPLEMENTED 2026-07-25 — §HL-FIRST highlight-first routing`,
followed by `§WATCHDOG-HL-FIRST` (independent review — read it before ANY future `stops[]` change).
The older `§HL-FIRST — the spec` block predates implementation and is superseded.

⚠ **Do NOT reuse branch `feat/tour-timeline-scrub` / worktree `/tmp/wt-tour-scrub`.** It carried the
§HL-FIRST commit and has been squash-merged — its history now collides with `origin/main` (→
`DIRTY`), per this project's concurrent-branch rule. Branch the scrubber off **fresh `origin/main`**.

~~**The real next task: `§TOUR_TIMELINE_SCRUB`**~~ — ✅ **SHIPPED 2026-07-25**, `bim-ootb`
`feat/tour-timeline-scrub2` commit `e8689e9`, PR #999. Built exactly as the design conclusion here
predicted: bespoke seek in `tour.js`, borrowing `time_machine.js`'s doctrine and look but not its
code; the unlock was chaining each action's end pose at BUILD time so tour pose = f(T). All four
knob groups, linear bar (no dial), bar simply appears when the tour begins — the "cyan pulsing dot"
line above is STALE, that reveal design was superseded before implementation and was not built.
Full record + 9 witnesses at the end of this file.

**Still open on §HL-FIRST (small, do NOT block the scrubber on these):**
1. ~~**Not live-watched by the user yet.**~~ ✅ **CLOSED 2026-07-25 by direct user review:** *"the Fly
   tour of Hospital seems more elegant also."* That is the live-review question answered — the
   highlight-first opening FEELS like a good opening. **Attribute it carefully, though:** Hospital's
   rooms were self-healed 142→214 by `ROOM_WALKER_V` v3 in the same window
   (`ROOM_INJECTOR_NEEDLE.md:561`, which flags exactly this mis-attribution risk), so the improvement
   is plausibly §HL-FIRST *plus* a much better room set, not §HL-FIRST alone. Do not quote it as
   isolated evidence for the ordering change. The measured side stays as it was: route geometry and
   action list are numeric, per the FUNDAMENTAL LAW — this closes the SUBJECTIVE half only.
   **It also motivates the scrubber** (user, same message): *"so a scrubber can be useful for user
   review"* — §TOUR_TIMELINE_SCRUB's purpose is now user REVIEW of a tour, not just playback control.
   That is a design input for the knob groups: scrubbing must make a tour inspectable (step back to a
   stop, hold, compare), not merely seekable.
2. Hospital_ARC and SampleCastle_extracted still fall back to legacy routing — pre-existing, IDENTICAL
   before and after (their graphs fail the coverage gate before ordering ever applies). A
   room-compile/graph-connectivity task, not a routing-order one. Worth its own bounded task.

## §REVIEW — findings verified 2026-07-16, do not re-derive
- **R1 — the Fly tour is pre-room-intelligence.** `viewer/tour.js` (bim-ootb main 57c0720;
  byte-identical copy in bim-compiler `deploy/dev/tour.js`, verified `diff -q` SAME) `buildTour()`
  PART 3 flies room CENTROIDS (top-5 per storey by contained-element count, from
  `rel_contained_in_space` AVG — not even `spatial_structure.center_x`) in XY nearest-neighbor
  order on a straight Catmull-Rom spline → it cuts through walls between rooms. Stair transition =
  two spline points at the SAME nearest-stair XY, different Y — a vertical teleport, not a climb.
  Corridors are never touched. Legacy `queryWalkPath()` Strategy 1 reads a `walk_graph` table NO
  shipped DB has (checked Duplex/Terminal/LTU/SampleHouse extracted DBs — table absent everywhere).
- **R2 — the routing substrate already exists, merged in bim-ootb main.**
  `common/room_graph.js` (1140 lines): occupant graph with E1 door↔room edges, E2 room↔CIRC
  (hallway/concourse), E3 stair groups bridging storeys (`getStairGroups()` — the ONE trusted stair
  extractor, WalkerDoctrine §10), E4 N-EXIT exits, E5 corridor junctions. `shortestPath()` returns
  `{path, doors, distance}` where every `path` guid resolves via `graph.nodesByGuid[g]` to a real
  measured `{cx,cy,cz,name,storey,kind}`, and `_legalizePath()` (PATH_LEGAL_SEGMENTS.md) already
  splices visibility-graph detours so no same-storey chord crosses a wall. `escapeRoute()` gives
  nearest-exit paths. `common/hallway_backbone.js` (733 lines) gives per-storey corridor centerline
  chains with REAL measured widths + crossings — corridors as flyable polylines.
- **R3 — auto-inject already exists (the needle).** `viewer/navigate_find.js` `_needleInject()`
  (line ~884, merged to main): patch source (`buildings/patches/<db>.sql` via
  `A._applyPendingPatch`) → walker source (lazy-load `lib/room_walker.js`,
  `window.RoomWalker.walk(A.db, {write:true})` — in-browser deterministic compile from walls/
  doors) → IDB persist. It is USER-pressed today; the Fly tour can call the same body
  automatically. ROOM_INJECTOR_NEEDLE.md is its spec.
- **R4 — data availability.** Duplex ships real IfcSpaces; Terminal heals via its patch;
  everything else (LTU_AHouse, SampleHouse, SampleCastle, HITOS…) has ZERO `spatial_structure`
  rooms until the walker compiles them → S1 below is a hard precondition, exactly as the user said.
  Compiled corridors surface two ways: hallway-backbone chains (un-compiled circulation, R2) and
  compiled rooms flagged `predefined_type` SUSPECT_ELONGATED / SUSPECT_LARGE (a real corridor is
  often one of these — HHS's genuine 456 m² corridor, compile_rooms.py §SUSPECT-LARGE).
- **R5 — repo seam.** bim-compiler's `deploy/dev/` viewer has NONE of the stack (no
  `room_graph.js`, no `hallway_backbone.js`, no needle in its `navigate_find.js`). Implement in
  the bim-ootb viewer FIRST; porting to deploy/dev is a separate later task (would need
  room_graph.js + hallway_backbone.js + storey_raster.js + room_walker.js copied in).

## SPEC — the interesting path
**S1 — auto-inject on Fly start.** In `buildTour()` (make the caller await an async pre-step —
`toggleFlyAround` already tolerates a null tour): if the db has zero `spatial_structure` IfcSpace
rows, run the SAME injection body as the needle — refactor `_needleInject`'s patch→walker→IDB
sequence into a shared `A.ensureRooms()` (navigate_find.js and tour.js both call it; needle UI
behavior unchanged). Log `§FLY_INJECT bld=<name> source=patch|walker|none rooms=<N>`. If injection
yields nothing (no walls/doors), fall through to S5 unchanged.
**S2 — graph itinerary (replaces PART 3 waypoint collection only).** Build the graph via
`window.RoomGraph.buildGraph(A.dbQuery, ...)` — reuse navigate_find's `_pathGraphCache` when
already built, and invalidate/share one cache, never two. Then:
1. **Start** at the entrance: nearest E4 exit node to the lowest storey (fallback: current
   first-door logic).
2. **Per storey, lowest → highest:** pick top-K confirmed rooms by rect area (K=4,
   `predefined_type` INTERNAL/INTERNAL_SMALL/INTERNAL_DOORPART or real IfcSpaces — never SUSPECT_*
   as *destinations*), order them by GRAPH distance nearest-neighbor (not euclid), and chain
   consecutive stops with `shortestPath()` — its legalized path IS the corridor-respecting
   polyline (door + corridor-junction + CIRC-published waypoints ride the hallways for free).
3. **Corridor cruise:** if the storey has a hallway-backbone chain longer than the storey's median
   room span, fly the LONGEST chain end-to-end once (centerline points at eye height) before
   visiting that storey's rooms — this is the explicit "fly in the corridors" beat.
4. **Stairs, visibly climbed:** cross-storey legs route via E3 stair nodes. Expand each vertical
   hop into ≥3 spline points: stair-group center at lower-floor eye height → stair center at
   mid-z → stair-group center at upper-floor eye height (Catmull-Rom then ramps, no teleport).
5. **Descent finale ("up AND down"):** after the top storey, `escapeRoute()` from the last room
   back to an exit — preferring a DIFFERENT stair group than the ascent used when ≥2 exist (pick
   by excluding used stair guids; else reuse). Exit door → existing outside finale (bird's eye /
   Final / lookAround actions unchanged).
**S3 — camera grammar (reuse existing actions, no new engine).** Feed the itinerary into the
existing `flyPath` action (look-ahead + adaptive smoothing already handle it). Insert
`pause`+`lookAround` at the single largest room per storey. Duration stays `pathLen/3.5` capped as
today.
**S4 — logging.** `§FLY_ROUTE storeys=<n> stops=<n> corridorChains=<n> circWps=<n> stairUp=<guid>
stairDown=<guid> pts=<n> illegalChords=<n>` — `illegalChords` computed by running the final flyPts
through room_graph's own `_chordIllegalCount` test per same-storey pair (expose a read-only helper;
MUST be 0). Keep `§TOUR_PATH` JSON dump as-is.
**S5 — fallbacks, zero regression.** No rooms after S1 → current centroid tour verbatim. Graph
builds but has 0 edges → current tour. Duplex with its real IfcSpaces must still produce a
complete tour (may differ in waypoints — better ones — but every action type and the
orbit/approach/finale structure is unchanged).

## Constraints
- ES5, IIFE conventions of tour.js; cache-bust bumps for tour.js + navigate_find.js in main.js;
  `sw.js` CACHE_VERSION bump (KEEP-BOTH on conflict).
- API-COMPATIBLE: `RoomGraph.buildGraph`/`shortestPath` signatures untouched (OCCUPANT_PATHFINDER
  contract); `_needleInject` refactor must leave needle witnesses green.
- Worktree: `git worktree list` FIRST, reuse an existing bim-ootb worktree if one fits; never edit
  `~/bim-ootb` directly (hook blocks it).

## WITNESS PLAN (localhost, headless fine — G6 harness of ROOM_INJECTOR_NEEDLE.md)
- **W-FLY-CORRIDOR (proves corridors are flown):** Terminal (patched) → Fly → `§FLY_ROUTE`
  `circWps>0` or `corridorChains>=1`, and `illegalChords=0` (the old centroid tour measurably
  fails this — capture its count first as the BEFORE number).
- **W-FLY-STAIRS (proves climb, not teleport):** Duplex → flyPts contain a stair XY with ≥3
  monotonic-z points; `§FLY_ROUTE stairUp` names a real stair-group guid; descent leg present
  (`stairDown` set) when returning to exit.
- **W-FLY-INJECT (proves the auto-inject precondition):** untracked copy
  `buildings/Terminal_noheal.db` (no patch file) → Fly on fresh load → `§FLY_INJECT source=walker
  rooms>0` → tour proceeds through corridors; reload → rooms persist from IDB, no re-inject.
- **W-FLY-REGRESSION (S5):** Duplex + a zero-walls DB → tour completes / falls back with no crash;
  `§FLYPATH_INIT len>0`; needle witnesses from ROOM_INJECTOR_NEEDLE.md re-run green after the
  `ensureRooms` refactor.

---

## ✅ DONE 2026-07-16 — implemented + witnessed (bim-ootb `feat/fly-corridor-tour` @ 99fe2ac, local only, PUSH PAUSE)
Worktree `/tmp/wt-fly-corridor` off origin/main 4c0f4a0. Files: `viewer/tour.js` (v5),
`viewer/navigate_find.js` (v49, `A.ensureRooms` single-flight + `A.getRoomGraph`),
`common/room_graph.js` (v5, `chordIllegalCount` exposed), `viewer/main.js`, `viewer/viewer.html`,
`viewer/sw.js` (v765). Harness: worktree served on :8901, headless chromium driver
(scratchpad `fly_witness.js`), all claims from saved logs `fly_*.log`.

**Witness results (every claim has its §-line in the named log):**
- **W-FLY-CORRIDOR** ✅ `fly_terminal2.log`: Terminal (patch-healed, 55 room nodes) →
  `§FLY_ROUTE storeys=6 stops=18 corridorStops=3 circWps=59 stairUp=…Aras_01::hi
  stairDown=…Aras_03::lo pts=103 illegalChords=10/89` → `CINE-GRAPH(22acts,92pts)`; flyPts JSON
  shows `≈ Aras 01 Hall/Corridor 1` waypoint + 4-stair climb (y −14.8→−5.8→−2→2→6.6) and a
  4-stair descent on a DIFFERENT stair. Bonus `fly_hhs2.log`: HHS federated →
  `stops=13/14 skipped=1 corridorStops=4 illegalChords=0/50` → CINE-GRAPH flying.
- **W-FLY-STAIRS** ✅ same logs — stairwp (upper)/(lower) points with monotonic y ramps, ascent
  stair guid ≠ descent stair guid (Terminal).
- **W-FLY-INJECT** ✅ `fly_norooms.log`: `Terminal_norooms.db` (stripped copy, 0 IfcSpace) →
  Fly press → `§PATCH_NONE (404)` → `§NEEDLE_INJECT source=walker rooms=51 rects=79` →
  `§NEEDLE_PERSIST idb=ok bytes=26492928` → `§FLY_INJECT status=injected source=walker rooms=51`
  → full CINE-GRAPH ran (`§FLYPATH_INIT` ×2) → reload: `RELOAD_ROOMS 79`, no re-inject.
- **W-FLY-REGRESSION** ✅ `fly_duplex3.log`: local Duplex snapshot has a thin graph (5 approx
  nodes — its real IfcSpaces lack center_x/size_x, DB-snapshot-divergence landmine) →
  `§FLY_ROUTE_REJECT` → legacy CINE tour runs unchanged and ADVANCES. `fly_noheal.log`: copy
  with baked-in stale RM_ rooms → state=recompute, NOT auto-recomputed (standing needle policy)
  → stale graph rejected → legacy flies (`§FLYPATH_INIT pts=22 len=422.3`).

**Deviations from the spec above (all measured, none invented):**
1. **`illegalChords` is REPORTED, not gated.** Chords inside a `shortestPath` result are the
   engine's own `_legalizePath` best-effort (kept when no detour exists — identical to what PATH
   mode draws). Measured residual: Terminal 10/89, HHS 0/50. Gating on 0 rejected objectively
   great routes.
2. **Unreachable stops are SKIPPED, never straight-hopped** (HHS room island: 1/14). Gate =
   `edges>0 && visitedStops≥2 && visitedStops≥50% of planned` — thin graphs fall back to legacy.
3. **Corridor cruise = corridor-room stops** (backprop `Hall / Corridor` + SUSPECT_ELONGATED
   nodes) + the route's own junction/door waypoints (circWps 29–59), not raw backbone chain
   polylines — same geometry, one code path.
4. **`markDirty()` revive added** to fly toggles — the rAF idle-park gate never wakes on a
   programmatic `toggleFlyAround()` (found live in the harness: tour built but never ticked).
5. **stairDown may be `-`** (HHS: no graph-reachable return-to-exit leg) — reported honestly.
6. Headless swiftshader runs ~1fps → dt cap 0.1 makes tours 10× slow-mo in the harness; driver
   uses a jump-to-flyPath to prove `§FLYPATH_INIT` in-window. Real browsers run full speed.

**Not done / follow-ups:** deploy/dev (bim-compiler viewer) port still needs the 4-file stack
copy (spec §R5). Needle Playwright wiring E2E not re-run (core proven via `fly_norooms.log`;
UI shell is 10 lines). Possible polish: dedupe A-B-A backtrack triples in long legs.

### SHIPPED — PR #812 MERGED to bim-ootb main 2026-07-16 (squash; user authorized push, PUSH
PAUSE lifted for this lane). Round 6 follow-up = PR #815 (auto-merge armed) off fresh main,
branch `feat/fly-tour-corridor-spine` (old branch retired per squash-merge rule).

### Round 6 — efficient tour (2026-07-17, PR #815) — user: Hospital "lingers too long on first
floor… stick to long corridors… really go up stairs… not same type of rooms" (discussed first,
then go)
- §R6-BUDGET rooms/storey scale down with storey count (4+ → 2); §R6-CORRIDOR-SPINE up to 3
  corridor cruises/storey (was 1); §R6-TYPE-DEDUPE real-name rooms dedupe tour-wide (compiled
  R-names exempt — Hospital's graph rooms are compiled, so budget did the shortening there);
  §R6-STAIR-FLIGHT measured mid-flight point per climb; §R6-PACE >300m → 4.5 m/s; §S3 beat
  follows the largest PICKED room. tour.js v10, sw v774.
- Witnesses: Hospital `fly_hospital3.log` 22 stops/7 storeys corridorStops=12; Terminal
  `fly_regress6.log` 18→14 stops, corridors 3→5, pts 125→89; Clinic `fly_regress6c.log` 9→7,
  illegal 0/33, ghost-gate still holding.

### 2026-07-17 — the cure chain, SHIPPED (PRs #832 → #835, all auto-merged to bim-ootb main + Pages-deployed)
User's drag-imported TerminalMerged live-fly saga, root-caused layer by layer, each with witnesses:
- **#832** walker §LOCAL-FRAME/§RASTER-EPS translation invariance (worker session, spec
  ROOM_WALKER_PHASE_INVARIANCE.md; canonical py+js fix pushed on bim-compiler
  `fix/room-walker-phase-invariance`). Bit-equal compile in any frame; door binding improved
  fleet-wide (Terminal E1 26→28, Clinic 174→175, HHS 27→29).
- **#833** §PATCH-FRAME-GUARD (two-half): the needle AND boot self-heal had applied
  Terminal_extracted.db.sql (OCI, frame x≈630) onto imported TerminalMerged content (x≈88) —
  rooms 550m off the walls, walker always skipped, every press re-poisoned. Extent-intersection
  guard: §NEEDLE_PATCH_MISMATCH drops wrong-frame patches; §NEEDLE_FRAME_STALE recompiles
  boot-poisoned compiled rooms.
- **#834** §THIN-GRAPH-RECURE: rooms in-frame + compiler-owned + route-thin (stale weak compile
  in IDB) — nothing static can fault them; the ✈ press now probes the route and re-cures once
  via ensureRooms({force,skipPatch}). USER-CONFIRMED live: one L press → §FLY_RECURE rooms=45 →
  §FLY_ROUTE 12/12 → CINE-GRAPH(34acts) up 4 stairs, down a different stair, out the door.
- **#835** §MAJORITY-LEGAL gate: regression sweep caught Duplex's thin graph newly passing
  coverage with a 100%-wall-illegal 3-pt route (v2 walker connected its 2 approx rooms); gate
  rejects majority-illegal, engine residual (0–18%) welcome. Sweep green: Duplex → legacy
  unchanged, Clinic/HHS/imported routes unchanged, ZERO guard/recure lines on healthy buildings.
Follow-up lanes still open: browser-importer displaced wall transforms (owes imported↔extracted
parity: 46 vs 54 rooms); loader-side _applyPendingPatch extent gate; deploy/dev (bim-compiler
viewer) room-stack port (§R5).

### FINDING 2026-07-17 — §WALKER-PHASE-SENSITIVITY (user live GIGO challenge, proven not-GIGO)
User's drag-imported `TerminalMerged.ifc` never gets the graph tour (live: 52 nodes/9 E1 edges
→ thin-path reject) while the extracted `Terminal_extracted.db` flies. User challenged the
"import path differs" handwave ("data is data — I know about GIGO"). Controlled A/B (headless,
scratchpad `diag_import.js`/`diag2.js`/`diag3.js`, logs kept): the two DBs are statistically
IDENTICAL — doors 135 (63/29/27/9/7 per storey, bbox 0.53×0.78×2.2, 0 null), walls 333
(3.07/2.82/6.01), windows 236, columns 158, same Unknown rows (33k curtain plates), hallway
backbone byte-identical (buckets=52 joined=18 chains=10) — the ONLY difference is a constant
translation (Δx≈−545.6, Δy≈−51.1, Δz≈−14.7; same spans, no mirror). Yet the SAME
`room_walker.js` compiles **51 rooms → 26 E1 edges (orphan 36)** on extracted vs **45 rooms →
16 E1 edges (orphan 50)** on imported. VERDICT: the room compiler is sensitive to absolute
coordinate phase (raster grid / SEAL dilation / float rounding) — ~6 pockets fail to enclose in
the translated frame and their ~14 doors orphan. The user's architectural point stands: the
inject mechanism exists to CURE poor data; a cure that depends on which coordinate frame the
same geometry arrives in is the bug. NEXT BOUNDED TASK: pocket-level diff of the two compiles
(dump per-storey room rects from both, align by translation, find which enclosures diverge and
why — grid origin snapping is the first suspect; the fix likely = quantize the raster origin to
the data (translation-invariant grid), witnessed by walker-output equality across frames.
Repro: import via `diag_import.js` on :8901 (persistent profile keeps the imported DB), then
`diag3.js` runs ensureRooms+graph on it; baseline via sqlite3 on
`~/bim-ootb/buildings/Terminal_extracted.db`.

### CORRECTION 2026-07-17 — §WALKER-PHASE-SENSITIVITY was MISDIAGNOSED (whitebox A/B, W-WALKER-PHASE-SWEEP)
The 51-vs-45 divergence above is NOT coordinate-phase. Proven headless on the SAME
`Terminal_extracted.db`, both walker versions, a 14-translation sweep (bim-compiler scratch
`phase_witness/witness_sweep.js`, logs kept):
- The room-compiler phase bug IS real but lives ONLY in code lacking #832: the PRE-#832 walker is
  invariant just **7/14** (counts swing 50/51/54, baseline 51 — independently reproduces #832's own
  "8/14 changed Terminal" claim). The #832 §LOCAL-FRAME walker is **14/14 EQUAL** (rock-solid 54).
- Translating the extracted DB by the finding's OWN Δ (−545.6, −51.1, −14.7) yields 51 (stale) /
  54 (#832) — **NEVER the imported's 45**. So imported≠extracted is NOT a pure-translation phase
  effect; the importer emits genuinely different geometry (the "browser-importer displaced wall
  transforms, 46 vs 54" follow-up). The walker is exonerated once #832 is applied.
- ACTION TAKEN: #832 was NOT on bim-compiler `fable/meshdb-livewire` — `build/room_walker.js` +
  `scripts/compile_rooms.py` were the buggy pre-#832 version, even though bim-ootb `viewer/lib/
  room_walker.js` already had the fix. Cherry-picked `7c6399b33` onto this branch (commit
  `c44ade97d`, LOCAL only per PUSH PAUSE): live walker now 8/8 invariant, py = js = 54 on Terminal.
- REAL REMAINING CORRIDOR GAP (re-scoped): **browser-importer wall-transform parity** (imported↔
  extracted geometry, NOT phase). The pocket-level-diff "NEXT BOUNDED TASK" above is SUPERSEDED —
  it chased a phase bug #832 already fixed; the actual bug is in the IMPORT PATH's wall transforms.

### Rounds 3–5 — live-review fixes (2026-07-16/17, @ 6f0f110 / 44c0ac8 / 0b3cf01 / 6ddb290)
- **R3 (@6f0f110):** §STREAM-FIRST — tour waits for streaming to drain before take-off (the
  first "Alt-X bboxes" report was placeholder boxes on a mid-stream take-off; `§FLY_STREAM_WAIT`).
  Itinerary now LARGEST-first per storey (corridor cruise leads, rooms by descending area) —
  "great opportunities from large hallways… large areas first".
- **R4 (@44c0ac8):** §CONNECTED-STOPS — LTU report "same route, nothing major change": LTU has 0
  exit nodes and its largest corridor node carries no edges → route anchored on an isolated node,
  every leg failed, pts=1 → permanent legacy fallback. Stops now filtered to edge-set members
  (`§FLY_ROUTE_ISOLATED`). LTU after fix: CINE-GRAPH 14/18 stops, illegalChords=0/72
  (`fly_ltu3.log`). Plus @0b3cf01: `§TOUR_VERSION` boot banner — user was twice testing an
  old-code tab on another port (:8188/:8189 serve main, branch unpushed); banner settles it at
  a glance.
- **R5 (@6ddb290):** §FLY-NO-AUTO-GHOST — SECOND "bboxes after some secs" report (user's own
  console log, v9 confirmed): `ghost=1` URLs arm navigate_find.js's §MERGE-GHOST auto-build,
  which used to load only when the Find panel opened; the Fly pre-step's `loadNavigate()` now
  loads that module on every ✈ press → glass shell built mid-flight (`§SHELL_GHOST_AUTO` →
  `§SHELL_GHOST_BBOX boxes=1549`). Auto-trigger now keeps polling while
  walkMode/flyActive/_flyPreparing and builds after the tour ends. Witness `fly_ghostgate.log`:
  ghost=1 + 60s tour → zero SHELL_GHOST lines. User's same log ALSO proved the R3 route live on
  Clinic: `≈ First Floor Hall/Corridor 1` first interior stop, stair climb, 0/43 illegal.
- Synced with origin/main twice (photoreal batch, then #811 find-select fix); sw.js
  CACHE_VERSION conflict resolved KEEP-HIGHER → v772. Post-merge witness `fly_postmerge2.log`
  green. Branch `feat/fly-corridor-tour` = 9 commits, local only (user: other session pushes).

### Round 2 — user live-review feedback applied (2026-07-16, @ b9310c4)
User watched the tour on localhost (bbox/ghost mode) and asked for: full opening circle,
softer track switches, a heads-up when crossing storeys, and a ground-level outside ending.
Shipped: orbit `fullCircle` (dur ×2, same angular speed); §HEADS-UP — a 180° look-around on
arriving up a stair at each new storey (ascent only); flyPath gaze softened (look-ahead
0.03→0.05, pan lerp 0.15→0.08) so spur-room walk-in/walk-out reversals sweep instead of whip;
§ENDING — camera outside at entrance ground level, 90° pan with gaze tilted up to 40% of the
building's measured top (`lookAround` gained `lookAtY`). tour.js v6, sw v766. Witness
`fly_norooms2.log`: `CINE-GRAPH(34acts,92pts)`, orbit dur=12, 10 lookAround beats, route
unchanged. NOTE for headless re-runs: geo sidecars are now symlinked in the worktree —
Terminal/Hospital stream 10×+ slower under swiftshader; witness on the geo-less
`Terminal_norooms.db` or wait for `!APP.streaming` before pressing Fly.

## §VOCABULARY_NOT_REALTIME — vision note (2026-07-21, user framing, read before extending routing)
**User's own words:** "My plan is to eventually transform Fly thru and routing to be perfect as a
human walks into a building to carry out functions... when we plan a route it is less realtime work
but prepared vocabulary to work on." Said while discussing why `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md`
§ROOM_WALKER_VERSION_STAMP (self-healing, versioned room-compile) matters beyond fixing one building's
stale data.

**What this means for Fly tour / routing work specifically:** the occupant graph this file already
depends on (`common/room_graph.js`'s E1-E5 edges, `common/hallway_backbone.js`'s corridor centerlines,
`getStairGroups()`) is exactly the "prepared vocabulary" — routing (`shortestPath()`, `escapeRoute()`,
the Fly tour's stop-sequencing) should stay a THIN CONSUMER of that vocabulary, not grow its own
real-time pathfinding/geometry-interpretation logic. When a future routing feature needs something the
current vocabulary doesn't have (e.g. "which room is the reception/check-in point," "which corridor
leads most directly to an exit for THIS function," a task-oriented "walk to do X" primitive), the
right move is almost always **extend the compiled vocabulary** (a new edge type, a new room/corridor
tag, a new `rooms_meta`-style stamped artifact) so every future routing/fly-thru feature gets it for
free — not bolt a one-off real-time computation onto the specific feature that needed it first. This is
the same "ONE shared gate, not N point-fixes" discipline `WalkerDoctrine.md §10` already names for the
disc-walker side — same principle, applied to the Viewer's occupant-graph side.

**Concretely, before adding a new capability here:** ask "does this belong in the compiled graph
(room_graph.js/hallway_backbone.js, versioned + self-healing per §ROOM_WALKER_VERSION_STAMP), or is it
genuinely per-session/per-camera state (current pose, which pill is active)?" Only the latter belongs
as real-time logic in tour.js/effects.js itself. The economics argument is the same one that motivated
the version-stamp spec: vocabulary compiled once (self-healing on version bump) serves every building
and every future routing feature for free; real-time logic re-derived per feature/per building does not.

### §ROOM_WALKER_VERSION_STAMP shipped (2026-07-21) — caller list above is stale
The version-stamp spec this section discusses is no longer aspirational — all 3 stages shipped this
session; see `ROOM_INJECTOR_NEEDLE.md`'s own "Stage 1+2 — DONE" / "Stage 3 — DONE, HHS-only pilot"
sections for the live-verification detail (bim-ootb PRs #934, #939). Don't re-derive it here.

S1's own line above ("navigate_find.js and tour.js both call it") was already stale before this
session — `cinema_maxq.js`/`effects.js` were ALSO calling `A.ensureRooms({})` pre-Cinema/MaxQ-orbit,
undocumented here. This session added a fourth real caller: `dlod_nav.js`'s `'o'`-shortcut nav-LOD
toggle now warms rooms the same way (idle-deferred, PR bim-ootb#942) — a >50k-element building
crossing that gate is the same "about to navigate seriously" signal this file already treats as
"make sure rooms are fresh." Current full caller set: `tour.js` (Fly Tour prepare + §THIN-GRAPH-RECURE),
`cinema_maxq.js`/`effects.js` (Cinema/MaxQ orbit prep), `navigate_find.js` (the needle button itself),
`dlod_nav.js` ('o' nav-LOD toggle). Keep this list current when adding a new caller — it's the fastest
way for a future session to know what already depends on this shared core before changing it.

## §INTERIOR_PACING_NOT_A_SPEED_FACTOR — SPEC ONLY, not yet implemented (2026-07-24, user directive
verbatim, filed from `FLY_TOUR_DLOD_SCALE.md` session — read before touching `flySpd`/interior pacing)

**User's own words, verbatim, the actual scope:** "I still want it to be 0.4x slower speed for within
building inside rooms, not so when outside walls as they are further distance. It is in room that it
can be too flashy. In fact really in rooms set the flight pathing to 0.3 even, but not use X factor,
but rewire from scratch the flight path, to really avoid tight small confinements as we see nothing
going thru attic types."

**Two separate asks, do not collapse into one:**
1. **Interior legs should read as noticeably slower/calmer than exterior/aerial legs** — confirmed
   intent, exterior (`moveTo`/`orbit`) stays untouched, only interior (`flyPath`) changes.
2. **The mechanism must NOT be a flat multiplier bolted onto the existing speed formula.** A stray,
   uncommitted experiment already exists in `tour.js` (`flySpd = (pathLen > 300 ? 4.5 : 3.5) * 0.4`,
   tagged `§FLY_INTERIOR_SLOWDOWN`, predates this spec, untested) — **this is exactly the "X factor"
   shape the user is now explicitly rejecting.** Do not build on it, do not bump its constant to 0.3.
   It's superseded by this section; whoever picks this up should remove it once the real rewire lands,
   not tune it further.

**Why a flat factor is the wrong shape (the user's own reasoning, made explicit):** slowing the WHOLE
interior leg uniformly treats "too flashy" as a pacing problem. The user's actual complaint names a
SPATIAL cause instead — the route flies through "tight small confinements," explicitly "attic types"
— i.e. the existing stop/point selection (§REVIEW R1/R2 above — corridor backbone + room centroids via
`common/room_graph.js`/`common/hallway_backbone.js`) is choosing candidate rooms/corridors without any
filter for enclosure tightness or "is there anything worth seeing here." A global speed multiplier
would make flying through a boring attic slower, not stop the tour from flying through it. The right
fix is upstream of pacing: **don't route through those spaces in the first place** — which, per
§VOCABULARY_NOT_REALTIME above, means extending the compiled vocabulary (room_graph.js/
hallway_backbone.js candidate scoring), not adding real-time logic to `tour.js` itself.

### What needs real investigation before any design (MEASURE BEFORE ESTIMATING — do not guess a
threshold):
1. **What actually distinguishes an "attic type" space in the real data?** Candidates to check against
   a real building's DB before assuming any of them: `elements_meta`/`spatial_structure`'s IfcSpace
   `LongName`/`name` (does IFC authoring actually label attics/voids distinctly — check real strings,
   don't assume "Attic" appears literally), room floor-area (`rel_contained_in_space`-derived or
   `spatial_structure` footprint — tight spaces should measure small), ceiling height / storey band
   (attics are typically low-headroom under a roof pitch, may need `elements_meta.storey` + a Z-extent
   check rather than a single number), aspect ratio (a long thin service void vs a normal room), or
   IfcSpace `ifc_class`/type distinctions if the schema carries one. Run the real SQL against at least
   two real buildings (LTU_AHouse + one other with a labeled attic/roof void, if one exists) before
   picking a signal — the same discipline `CONTAINMENT_LTU_STOREY_ALIAS.md` and this file's own
   `§REVIEW` used, not an assumed threshold.
2. **Where does this filter plug into the existing scoring?** The room-selection logic already has a
   working PATTERN for "is this space worth going to" — `effects.js`'s `_cinemaPathPlan`
   (§CINEMA_SPACE, area/centrality `score = ar / (1 + dCtr/...)`) and this file's own R1/R2 corridor+
   room-centroid selection both already rank candidate spaces. The tightness/attic filter is most
   likely a DISQUALIFYING check or a scoring penalty applied at the SAME point, reusing the same
   candidate-ranking shape — not a new parallel system. Whether it belongs as a hard exclude (never
   route there) or a heavy score penalty (route there only if nothing better exists) is an open
   design question, not decided here.
3. **What produces the "0.3x slower, in rooms" FEEL once bad spaces are already excluded?** Once the
   route no longer detours through tight/attic spaces, re-measure whether interior still feels "too
   flashy" at the existing `flySpd` formula. If it does, the fix should come from the path's own
   geometry (point spacing/segment density on the Catmull-Rom curve — `act._curve.getPointAt(t)`,
   `tour.js:1155-1200`) producing naturally slower perceived motion through interior legs, or a pacing
   term that's a function of local path/room characteristics (e.g. proximity to walls, corridor width)
   — not a single flat constant multiplied over 100% of every interior leg regardless of what's around
   the camera. This is the concrete meaning of "rewire from scratch," per the user's own words — the
   speed number is a symptom to re-check AFTER the routing fix, not the thing to tune first.

### Investigation findings (2026-07-24) — items 1 & 2 answered with real DB/code citations, item 3 confirmed still deferred

**Item 1 — what signals "tight/attic-type" in the real data: NONE of the assumed candidates hold up.
The right signal is "nothing worth seeing inside," not geometric "atticness."** Checked against 3 real
buildings, not assumed:
- **LTU_AHouse (the building the user's own example most plausibly names) has ZERO `IfcSpace` data at
  all — name-based and geometry-derived-from-authoring signals are both impossible here.**
  `internal/UNMERGED/LTU_AHouse_ARC.ifc` (the architecture discipline file) contains **0** `IFCSPACE(`
  entities. `deploy/buildings/LTU_AHouse_extracted.db` and `deploy/dev/buildings/LTU_AHouse_meta.db`
  both have an empty `spatial_structure` table. Matches R4 above (rooms only exist post-walker-compile)
  but sharpens it: there is no authored space to borrow a name/type from even in principle. **Red
  herring ruled out:** `internal/UNMERGED/LTU_AHouse_VOID.ifc` looked promising by filename ("VOID") but
  its ~30+ `IFCBUILDINGELEMENTPROXY` rows are all `'MagiCAD provision for void'` / `ProvisionForVoid` —
  MEP sleeve openings cast through slabs for pipe runs, unrelated to attic/roof spaces. Do not chase this
  file again.
- **Ceiling height (`spatial_structure.size_z`) is NOT a per-room measurement for compiled buildings —
  it's a per-storey average, identical for every room on a floor.** Traced in
  `scripts/compile_rooms.py`: `bz = sum(w[5] for w in walls) / len(walls)` (lines 595, 763 — `walls` is
  the WHOLE storey's wall list, not the room's own walls) then `"sz": max(bz, 2.0)` (lines 666, 846).
  Confirmed empirically on `deploy/buildings/Hospital_meta.db`: every "Level 4" room has `size_z=3.91`,
  every "Level 1" room `size_z=5.87`, every "Level 7" room `size_z=3.23` — no per-room variance at all.
  An attic tucked under a roof on a storey that otherwise has normal-height rooms would get the SAME
  `size_z` as its neighbours. This signal cannot see low headroom under current extraction; it would
  need a real per-room Z-extent (from the room's own bounding walls/roof, not a storey-wide mean) to
  ever work, and that's new extraction work, not a read-time fix.
- **IFC-authored naming/typing (object_type) IS sometimes literal and clean, but doesn't correlate with
  low headroom, and compiled buildings overwrite it anyway.** `deploy/buildings/Duplex_extracted.db`
  (a building with real authored `IfcSpace`s, not compiler-derived) has a space literally named `R301`,
  `object_type='Roof'`, area 135.2 m² (by far the largest single space in the building — every other
  room is 1.4–27.7 m²), aspect ratio 0.47 (unremarkable — `Foyer` at 0.23 and `Hallway` at 0.37 are
  MORE elongated), **and `size_z=3.0` — actually TALLER than `Living Room` (2.58), `Kitchen` (2.59), or
  `Hallway` (2.88).** So even where a literal "Roof" label exists, none of height, aspect ratio, or a
  fixed threshold would have flagged it — only the object_type string itself and the outlier area do.
  Worse: this signal isn't available on compiled buildings at all — `compile_rooms.py` always writes
  `object_type='COMPILED'` (line ~1281 comment: "object_type stays 'COMPILED' either way"); the real
  per-room classification for those buildings lives in `predefined_type`
  (`INTERNAL`/`INTERNAL_SMALL`/`INTERNAL_DOORPART`/`SUSPECT_OPEN`/`SUSPECT_ELONGATED`/`SUSPECT_NO_DOOR`/
  `SUSPECT_LARGE`), already computed from area (`MAX_AREA_ABS=150.0`, line 31),
  aspect (`SUSPECT_ELONGATED_ASPECT_MIN=10.57`, line 709), and enclosure fraction
  (`SUSPECT_OPEN_ENCLOSURE=0.50`, line 870) — this is the closest thing to an existing "is this room
  trustworthy" signal, but it was tuned for room-DETECTION confidence, not "is there anything inside
  worth flying through," and an attic can easily be a normal-shaped, fully-enclosed, door-having
  `INTERNAL` room by this vocabulary's own tests.
- **Also separately confirmed live: `deploy/buildings/Duplex_meta.db` and `deploy/buildings/
  Duplex_extracted.db` disagree on the SAME building's `object_type` — populated ("Living Room", "Roof",
  …) in `_extracted.db`, blank in `_meta.db` for identical guids.** Another instance of
  `project_db_snapshot_divergence_landmine.md` — flag which DB the live viewer actually loads before
  trusting `object_type` as a signal anywhere.
- **What the user's own words actually point at ("we see nothing going thru attic types") is a
  CONTENT signal, not a geometric one: does the space contain anything real?** `rel_contained_in_space`
  (element→space containment, already populated by both `compile_rooms.py` and the live extractor) is
  already queried per-candidate in `viewer/effects.js`'s `_cinemaMepFraction()` (lines 3439–3451) to
  compute what FRACTION of contained elements are MEP/plant classes. The same query without the
  class filter — raw `COUNT(*)` of `rel_contained_in_space` rows for a candidate — directly measures
  "is there furniture/fixtures/anything here," which is both (a) available on every building that has
  rooms at all (compiled or authored) and (b) the actual thing the user described, rather than a proxy
  for it. This reframes the ask: stop trying to detect "attic," detect "empty."

**Item 2 — where the filter plugs in: the pattern exists and is reusable, but two small wiring gaps
must close first — this is NOT a new parallel system, it's completing what's already there.**
- **`viewer/effects.js`'s `_cinemaPathPlan()` (lines 3284–3466) is the working pattern to copy.** It
  ranks `spaceCands` once by `score = ar / (1 + dCtr / (envelope*0.5))` (line 3384), then walks the
  top `CINEMA_SPACE_TRY_MAX=6` candidates in rank order (line 3453) applying disqualifiers in sequence
  — enclosure ray-fan (`scEv.frac >= CINEMA_ENCLOSED_THRESHOLD`) and MEP-fraction
  (`mepFrac >= CINEMA_SPACE_MEP_SKIP_FRACTION` → skip, lines 3458–3465) — first candidate that passes
  both wins, `chosenCand`/`chosenEv`, with a full `console.log('§CINEMA_SPACE cand=...')` line per
  candidate tried either way. A containment-count (or predefined_type) disqualifier is the same shape:
  one more boolean ANDed into `okCand` at line 3460, one more `§CINEMA_SPACE` log field. No new loop,
  no new data structure.
- **Gap 1 — `common/room_graph.js`'s `buildGraph()` SELECTs `predefined_type` and `object_type`
  (lines 229–232, `r[2]`/`r[3]`) but only folds them into the display `label` string (line 240) —
  neither is kept as its own field on the room node.** `size_z` (`spatial_structure.size_z`) isn't
  selected at all. Before ANY tightness/attic/suspect filter can reuse room-graph nodes (as §2's own
  instruction says it should), the SELECT needs `s.size_z` added and the node object (lines 238–242)
  needs `g.predefinedType = r[3]` (or similar) carried through — a small, additive change to an
  existing query, not new plumbing.
- **Gap 2 — this file's own S2 spec (line 66) already says "never SUSPECT_* as destinations" for
  tour.js's future itinerary builder, but that logic doesn't exist yet (S2 is unimplemented) and
  `effects.js`'s `_cinemaPathPlan` candidate loop currently has no SUSPECT/predefined_type awareness at
  all** (confirmed by the grep in this session: `predefined_type`/`SUSPECT` do not appear anywhere in
  `room_graph.js` outside the one label-building line). So the disqualifying check belongs at the SAME
  point `_cinemaPathPlan` already disqualifies MEP rooms — reusing Gap 1's newly-exposed fields — and,
  separately, S2's own "top-K by rect area, confirmed rooms only" step should apply the identical
  containment-count/predefined_type check when it's eventually implemented. One vocabulary, two
  call sites, not two systems.

**Item 3 — speed re-check stays deferred, nothing new to add** *(superseded below — user gave an
explicit 3-tier pacing directive before the S2 routing fix landed; implemented directly per that
directive rather than waiting)*.

## §HIGHLIGHTS_FIRST_ROUTING — SPEC ONLY, not yet implemented (2026-07-26, user directive verbatim)

**User's own words, verbatim, the actual scope:** "update the prompts/# for the tour path handling
(to look for biggest hall room, turn around in them, take stairs when present, before touring the
rest. Highlights first)."

**What this changes vs. today's S2 spec (above):** S2's stop-selection is spatially sequential —
per storey, lowest→highest, top-K rooms by area in GRAPH-nearest-neighbor order, corridor cruise
first if the backbone is long enough, one ascent + one descent bookending the whole route. This new
directive asks for a DIFFERENT ordering PHILOSOPHY: identify the biggest hall/room as a genuine
HIGHLIGHT, route to it (via stairs if it's on another storey) and do a "turn around" beat there
BEFORE touring the remainder of the building — i.e. highlight-first, not storey-sequential-first.

**Not decided here, needs resolving before implementation (Spec-First — investigation before code,
same discipline this file's own §INTERIOR_PACING_NOT_A_SPEED_FACTOR section used):**
1. **Building-wide biggest room, or per-storey?** S3 (above) already does a per-storey "pause +
   lookAround at the single largest room per storey." Is this new ask ELEVATING that to ONE
   building-wide highlight visited first, with the existing per-storey beats continuing for every
   OTHER storey's own largest room as today — or does it replace the per-storey behavior entirely
   with a single flattened "biggest rooms across the whole building, ranked, visited in that order"
   itinerary? These produce different code shapes (one extra special-cased first stop, vs. a
   different overall ranking function for the whole route).
2. **"Take stairs when present" — does the highlight-first order actively PREFER routing through a
   stair to reach an early highlight even when the entrance-adjacent storey has its own large rooms
   unvisited, or is it only "use stairs when the biggest hall happens to be upstairs, don't avoid
   them"?** The current S2.4 stair-expansion (≥3 spline points, no teleport) already works for ANY
   itinerary that happens to cross storeys — reusable as-is either way; the open question is purely
   about SELECTION order forcing an early stair crossing versus incidentally using one.
3. **What is "the biggest hall room" measured by** — same candidate signals S2's own top-K already
   uses (rect area, `predefined_type` real-room filter, never `SUSPECT_*` as a destination) — this
   file's existing area-based ranking is directly reusable, not a new signal to invent.
4. **"Turn around in them"** — is this the SAME `lookAround` action already in the engine (S3, degree
   sweep with ease-in/out) or does "turn around" imply something distinct (e.g. a fuller orbit,
   closer to MaxQ's room-centered dive/orbit grammar in `effects.js` rather than tour.js's own
   `lookAround`)? If the latter, note `FLY_TOUR_DLOD_SCALE.md`'s own finding that MaxQ's room-center
   framing is exactly the "target-bounded" pattern already ported into `flyPath`'s look-ahead fix —
   there may be a real, reusable pattern to borrow here rather than a new camera grammar.
5. **"Before touring the rest"** — confirms highlight stop(s) come FIRST in itinerary order, with
   the existing storey-sequential S2 logic filling in everything else afterward. Does "the rest"
   still walk storey-by-storey (today's order) once highlights are done, or does it also get
   reordered? Simplest reading: highlights are prepended, the remainder keeps today's S2 ordering
   unchanged — stated as the default assumption here, not yet confirmed by the user.

**Interaction with the pacing/speed work (this session, `FLY_TOUR_DLOD_SCALE.md` §21-§24,
§TARGET_BOUNDED_LOOKAHEAD, §BASE_SPEED_REGRESSION): none, by design.** Routing (WHICH points, WHAT
order) and pacing (HOW FAST and WHICH WAY THE CAMERA LOOKS along whatever points exist) are
orthogonal layers — the pacing fixes apply generically to any point sequence `flyPath` is given, so
whatever order this spec settles on inherits the already-fixed base cruise speed (no more
multi-minute crawls) and target-bounded look-ahead (no more staring through doorways) for free. If
anything, sequencing this routing work AFTER the pacing fixes (rather than before) is the right
order — building highlight-first routing on TOP of the old broken 0.3x baseline would have inherited
the same crawl bug this session just fixed.

**Not authorized to implement from this section alone** — per this project's Spec-First rule, items
1-5 above need the user's resolution (or a follow-up investigation citing real code/data) before any
`tour.js` route-building changes.

### RESOLVED 2026-07-25 by the user — items 1–5 answered, implementation authorized
**User's own words, verbatim:** "but remember the first task in correcting the path.. explore main
hall/space first.. climb stairs, main highlights to capture initial user impression".

Item-by-item, against the open questions above:
1. **Building-wide, not per-storey.** "main hall/space" is singular and building-wide — ONE highlight
   opens the tour. The existing per-storey §S3 pause+lookAround beats stay exactly as they are for
   every other storey (they are beat PLACEMENT, not route order) — this prepends a highlight block,
   it does not replace per-storey behaviour.
2. **Stairs are actively PREFERRED early, not incidental.** "climb stairs" is named as part of the
   opening impression, so the highlight block must force a storey change near the start even when
   the entrance storey still has unvisited large rooms. Mechanism: after the main hall, the next
   highlight is the largest stop on a HIGHER storey. The existing §S2.4/§R6-STAIR-FLIGHT expansion
   handles the climb itself unchanged — this changes SELECTION ORDER only.
3. **Measured by the same rect area already used** (`n.rects` sum, `_buildGraphRouteInner:449-450`).
   No new signal. Corridor-class nodes (`Hall / Corridor`, SUSPECT_ELONGATED) ARE eligible to be the
   main hall — in real data a "main hall" is frequently exactly that class; other `SUSPECT_*` stay
   excluded as destinations, unchanged.
4. **"Turn around" = the existing `lookAround` action at a fuller sweep, not a new camera grammar.**
   `tour.js:886` already maps pause kind → degrees (`'storey'`→180, room→270). A third kind
   `'hall'`→**360** is the whole change — a genuine full turn-around in the main space. No orbit/MaxQ
   grammar port; §S3's own beat machinery is reused verbatim.
5. **"The rest" keeps today's S2 ordering** — the default assumption in item 5 above, now confirmed
   by "before touring the rest". Highlights are PREPENDED; the remainder walks storey-by-storey
   lowest→highest exactly as today, minus stops already spent in the highlight block.

**[SUPERSEDED — this is the pre-implementation spec draft, kept for design-rationale history only.
The actual shipped mechanism is below at `✅ IMPLEMENTED 2026-07-25 — §HL-FIRST highlight-first
routing` (commit `eccfd9b`, branch `feat/tour-timeline-scrub`) — read that block for current state.]**

**§HL-FIRST — the spec (stop ORDER only; stop SELECTION, budgets, dedupe, legality gates and the
descent finale are all untouched):** in `_buildGraphRouteInner`, after `stops[]` is built by today's
per-storey rules and isolated nodes are dropped, reorder it:
- `mainHall` = max-area stop across ALL storeys → index 0, pause kind `'hall'` (360° turn-around).
- `ascent` = max-area stop on any storey ABOVE mainHall's → index 1 (this is what makes the stair
  climb happen in the first leg-pair). If no higher storey carries a stop, it is skipped and the
  tour degrades to "main hall first, then the rest" — no invented climb.
- `HL_EXTRA` further top-area stops (any storey) follow, capped so the opening block stays an
  impression, not the whole tour.
- Everything else follows in today's storey-sequential order, already-picked stops removed.
Log `§FLY_HL_FIRST mainHall=<name> area=<m²> storey=<s> ascent=<name>/<storey> extras=<n>`.
Gates (`§MAJORITY-LEGAL`, visitedStops coverage, thin-path) are unchanged and still authoritative.
~~a highlight-first order that measures worse must still fall back to legacy.~~ **CORRECTED
2026-07-25 (§WATCHDOG-HL-FIRST, agreed): that sentence is FALSE.** The `:635` gate is an ABSOLUTE
threshold (`visitedStops < 2 || visitedStops < stops.length*0.5 || illegalChords*2 > checkedChords`),
never a before/after comparison — it catches a route that is BROKEN, never one that is merely WORSE
than what the same building produced before. A merely-worse reorder passes it silently. Only the
BEFORE/AFTER sweep catches "worse" (proven: HHS's first climb went 0.224 → **0.432**, the wrong way,
and no gate objected — see FINDING 1). **The Node harness is therefore load-bearing infrastructure
for this file, not a one-off: no future `stops[]` change is verified without a BEFORE/AFTER sweep,
whatever the reject gate says.**

**WITNESS PLAN (§-log + numbers, no screenshots):** run the REAL `_buildGraphRouteInner` (loaded
verbatim from `viewer/tour.js`, not reimplemented) in a Node harness against real building DBs
(Hospital_ARC, HHS_Office_Federated_extracted, Terminal_meta, Clinic_ARC), BEFORE vs AFTER:
- **W-HL-MAINHALL:** stop[0] area == max area over all stops (exact equality, computed independently
  in the harness from the graph, not read back from the log).
- **W-HL-STAIRS-EARLY:** the storey of some stop within the first 3 is ≠ the main hall's storey, AND
  a `stairwp` node appears in `pathGuids` measurably earlier than in the BEFORE route (report both
  indices as a fraction of route length).
- **W-HL-NOREGRESS:** `visitedStops`, `illegalChords/checkedChords` and the reject gates are no worse
  than BEFORE on every building tested; any building that flew before still flies.

## ✅ IMPLEMENTED 2026-07-25 — §HL-FIRST highlight-first routing, `bim-ootb` `feat/tour-timeline-scrub`
(worktree `/tmp/wt-tour-scrub`, off `origin/main` @ `c722195`. Branch name predates the scope switch —
the user redirected mid-session from the scrubber to "correcting the initial tour journey first".)

**Files:** `viewer/tour.js` (v13 banner), `viewer/viewer.html` (`tour.js?v=13`), `viewer/sw.js` (v842).
Three logic changes, all inside `_buildGraphRouteInner`/`_buildTourInner` — no new module, no new
data source, no change to `RoomGraph`'s API or to stop SELECTION:
1. **§HL-FIRST** — reorder `stops[]` after today's per-storey selection: mainHall (max rect area
   building-wide) → ascent (max-area stop on a higher storey) → `HL_EXTRA` further top-area stops →
   everything else in today's storey-sequential order.
2. **§HL-ORIGIN** — `curGuid` for entrance-less buildings pins to the PRE-reorder `stops[0]` instead
   of the new `stops[0]`. Found by witness, see FINDING 1 below.
3. **`'hall'` beat** — third pause kind → `lookAround(360)` + a longer `pause` (0.8s vs 0.4s), and the
   split filter relaxed `v.i > 1` → `v.i > 0`. Found by witness, see FINDING 2 below.

**Harness (no browser, no screenshots — per this project's FUNDAMENTAL LAW).** Scratchpad
`hl_witness.js` loads the REAL `viewer/tour.js` verbatim into a Node `vm` context (stub `document`/
`window` only), builds the REAL graph via `common/room_graph.js` (node-aware, `module.exports` at
:1475) from a real building DB through sql.js, then runs `A._buildGraphRoute()` AND `A.buildTour()`.
BEFORE = `git show origin/main:viewer/tour.js` through the identical harness. Logs kept in the
session scratchpad (`logs/<bld>_{before,final}.log`). Route quality is measured from the route's OWN
geometry in the harness (first y-rise >1m; max-area node recomputed independently from the graph) —
NOT parsed back out of the engine's own log lines.

**Results — 7 real buildings, BEFORE → AFTER:**

| building | route | mainHall = independent max-area? | first climb (idx/frac) | illegal chords | visited stops | len |
|---|---|---|---|---|---|---|
| Terminal_meta | flies both | ✅ 85.4 = 85.4 | **15/0.224 → 7/0.096** | 16/53 → **14/53** | 11/11 → 11/11 | 910→964m |
| HHS_Office_Federated | flies both | ✅ 203.8 = 203.8 | **15/0.224 → 3/0.037** | 9/62 → 9/69 (ratio 14.5%→13.0%) | 13/15 → 13/15 | 693→726m |
| Clinic_ARC | flies both | ✅ 125.0 = 125.0 | none (single reachable storey) | 0/9 → 0/9 | 3/6 → 3/6 | 87→87m |
| Duplex_ARC | flies both | ✅ 27.7 = 27.7 | none (thin graph) | 2/5 → 2/5 | 3/6 → 3/6 | 30.6→30.6m |
| SampleHouse_extracted | flies both | ✅ 52.6 = 52.6 | none (2 storeys, 1 reachable) | 0/3 → 0/3 | 3/3 → 3/3 | 21.3→21.3m |
| Hospital_ARC | REJECTED both | — | — | gate: visited 3/15 | unchanged | — |
| SampleCastle_extracted | REJECTED both | — | — | gate: visited 2/9 | unchanged | — |

- **W-HL-MAINHALL ✅** — on all 5 flying buildings the engine's `§FLY_HL_FIRST mainHall` area is
  EXACTLY the harness's independently recomputed max over the eligible pool. No tie-breaking needed.
- **W-HL-STAIRS-EARLY ✅** — the two multi-storey buildings with a reachable upper storey both climb
  far earlier: Terminal 0.224→0.096 of the route, HHS 0.224→**0.037**. Buildings whose graph has only
  one reachable storey correctly produce no climb rather than an invented one.
- **W-HL-NOREGRESS ✅** — no building lost its route; illegal-chord ratio improved or held everywhere;
  `visitedStops` identical on all 7. Route length grows 0–6% (Terminal +5.9%, HHS +4.8%) — the
  measured cost of visiting the highlight first, consistent with this file's standing "drama over
  travel economy" stance, and gated the same as before.

### FINDING 1 (real bug, caught only by the multi-building sweep) — §HL-ORIGIN
Buildings with **no graph exit node** (measured: HHS federated, Clinic) start the walk at `stops[0]`.
Under the old storey-sequential order that was implicitly the LOWEST storey's first pick; reordering
silently moved the tour's ORIGIN to the main hall. On HHS — whose main hall is on Level 3 — the tour
then *began* on the top floor and walked DOWN, and the first climb got **worse** (0.224 → 0.432).
The fix pins the origin to the pre-reorder `stops[0]`, restoring "start low, climb to the highlight."
HHS then went to 0.037. **Generalisable lesson: `stops[0]` carried an unwritten invariant (lowest
storey = the walk's start). Any future reordering of `stops[]` must preserve the ORIGIN separately
from the ORDER** — they are two different concerns that happened to share one array index.

### FINDING 2 (real bug) — a beat at the first interior point was silently dropped
`_buildTourInner`'s split filter required `v.i > 1`. When the main hall IS the first interior stop
(measured: Clinic — no exit node, so the hall is `flyPts[1]`), its 360° turn-around never became an
action at all. Relaxed to `v.i > 0`; `flyPts[0]` is always the entrance point, so index 1 is a real
2-point approach segment. Witnessed end-to-end through `buildTour()`: Clinic's action list went
`…flyPath(11p) → moveTo` (one look-around, 90° at the finale) to
`…flyPath(2p) → pause → lookAround(360) → flyPath(10p) → moveTo` — same total flight time
(126.5s → 43.6+82.8s), one real turn-around gained.

### ABSTRACTION AUDIT (user directive 2026-07-25: "we wana review that it remains abstract and not
hardcode custom cases") — every value this change introduces, and why none is building-specific
| value | what it is | why it is not a custom case |
|---|---|---|
| `HL_EXTRA = 1` | how many highlights follow mainHall+ascent | a COUNT of beats in the opening block, not a measurement of any building. Bounds tour length; no threshold semantics. |
| `'hall'` → **360°** | the turn-around sweep | an angle from the user's own words ("turn around in them"), in the same unit as the existing 180/270 beats. Independent of building size. |
| `pause 0.8s` (vs 0.4s) | dwell before the hall sweep | a time constant of the CAMERA grammar, same family as the existing 0.4s. |
| `v.i > 0` | split-filter bound | an ARRAY INDEX bound (index 0 = entrance point), not a tuned number. |
| "higher storey" test | `storey !== mainHall.storey && meanZ(storey) > meanZ(mainHall.storey)` | **deliberately has no metre threshold.** An earlier draft used `> mhZ + 0.5`; removed and re-swept — all 7 buildings produced byte-identical routes, so the epsilon was doing nothing and is gone. Storey identity comes from the data; the comparison is between two measured means. |
| main hall selection | `max(rect area)` over the already-eligible stop pool | reuses the area the file already ranks by (§S2/§R6). No new signal, no threshold, no name matching — nothing that could encode one building's vocabulary. |

Explicitly NOT used anywhere in this change: building names, storey-name strings (`"Level 3"`,
`"Aras 02"`…), room-name matching (no `/hall/i` regex — corridor-class detection reuses the EXISTING
`Hall / Corridor` backprop label from `hallway_backbone.js`, unchanged), and any absolute
area/length/height threshold. The only per-building input is measured geometry from the compiled
graph, per §VOCABULARY_NOT_REALTIME.

### ⚠ FINDING 3 (2026-07-25, USER LIVE LOG) — §HL-FIRST shipped INVISIBLE: `TOUR_CACHE_VER` not bumped
**User: "is it live? I checked didn't notice."** It was live and correct; a stale cache hid it.
`tour.js`'s `TOUR_CACHE_VER` — whose own comment reads *"keep in lockstep with the §TOUR_VERSION
banner above"* — was left at `'v12'` while the banner went to `v13`. The cache key is
`tmTourCache:<bld>:<VER>:<elements-doors-spaces>:<renderedSet>`; **every other component is a DB
count, so it busts on a re-extraction or a room recompile but NEVER on a code change.**
`TOUR_CACHE_VER` is the only thing that invalidates a cached route when the routing ALGORITHM
changes — which is exactly what §HL-FIRST was. Any building toured before the deploy replayed its
OLD route from IDB. Fixed in `bim-ootb` PR **#991** (`fix/tour-cache-ver-v13`, off fresh
`origin/main` @ `fab68d4`; `tour.js?v=14`, sw v843) + a ⚠ LOCKSTEP comment at the constant.

**The user's log also PROVES the feature works where the cache missed** (Hospital, live GH Pages,
walker had just injected 214 fresh rooms → miss → recompute):
`§FLY_HL_FIRST mainHall="≈ Level 1 Hall/Corridor 2" area=219.4 storey=Level 1 ascent="≈ Level 4
Hall/Corridor 2"/Level 4 extras=1 stops=18` → `§FLY_ROUTE storeys=7 stops=18/18 skipped=0
corridorStops=9 circWps=62 stairUp=…Level_2::hi stairDown=- pts=91 illegalChords=18/74`, and the
`§TOUR_PATH` dump reads exactly as specced: i=0 Entrance → **i=1 the 219 m² main hall** → i=3,4,5 a
real 3-point stair climb (y −5.6 → −0.9 → 4.1) → i=8/i=10 the Level 4 highlight → i=11–13 back down
→ then the Level 1/2/3/4/5 sweep. **First real end-to-end live confirmation of §HL-FIRST.**

**THE LESSON — this is FINDING 1's lesson repeating in a different layer, and it is the more general
one:** the 7-building Node sweep exercised `_buildGraphRouteInner` directly and therefore could not
see the cache in front of it. **A witness that calls the engine directly cannot prove the FEATURE
reaches a user** — caches, service workers, `?v=` query strings and IDB all sit between the two.
Binding rule for this file: **any change to route ORDER, waypoint SELECTION or beat structure must
bump `TOUR_CACHE_VER` in the same commit as the `§TOUR_VERSION` banner**, and the ship checklist is
banner + `TOUR_CACHE_VER` + `tour.js?v=` + `sw.js CACHE_VERSION` — four versions, not two. Missing
one made a fully-witnessed, correctly-implemented feature invisible to the only person who matters.

### Two live observations from the same log, NOT yet acted on (numbers, for whoever picks them up)
1. **The Hospital tour is ~19 minutes of interior flight.** Summing the 13 `flyPath` durations in the
   user's own `§TOUR_PATH`: **1145.9s (19.1 min)** over 1547m — mean **1.35 m/s**, with a single
   322s (5.4 min) leg. Separately the first leg logs `§TIGHT_TURN_PACING verts=3
   losRange=[0.63,1.60] mean=1.60 dur=38.3s` — the LOS pace factor pinned at its MAX (slowest) for
   a 71.6m entrance→hall run that should read as open. Belongs to `FLY_TOUR_DLOD_SCALE.md`'s pacing
   lane, not routing, but it is now the dominant felt problem: the highlight lands in the first
   ~60s, and then there are 18 more minutes. Worth asking whether §R6-BUDGET should scale with
   ROUTE LENGTH, not just storey count.
2. **`stairDown=-` and `exits=0`.** `§ROOM_GRAPH … circ=7 stairs=6 (skipped=1) exits=0` — Hospital's
   graph has no exit node at all, so there is no return-to-entrance descent leg (§S2.5 can't run).
   Also `illegalChords=18/74` (24%, passes the majority gate) with many
   `§PATH_LEGAL_DETOUR_FAIL storey=Level N no legal detour among <N> doors`.

**Correction to the witness table above:** it records "Hospital_ARC → REJECTED both, pre-existing."
That is true of `modeller/Hospital_ARC.db` and FALSE of the building users actually load — the live
`Hospital_extracted.db` + walker-injected 214 rooms routes fine (**18/18 stops**). Same building
name, different DB, opposite outcome — `project_db_snapshot_divergence_landmine.md` again. State
WHICH DB a fallback claim applies to; a harness DB is not evidence about the shipped one.

### ⚠ FINDING 4 (2026-07-25, user live) — §HALL-IS-A-CORRIDOR: area ranks LENGTH, not spaciousness
**User, watching the live Hospital tour: "initially still does not show large space… i stopped it to
verify the stair case showing is perfect."** The staircase is confirmed good (real 3-point climbs,
`§FLYPATH_INIT pts=2 len=4.8/5.0` flights). The main-hall beat is not.

**MEASURED, not guessed** (scratchpad `hall_rank.js`, real graphs from real DBs; for each eligible
candidate: `area` = Σ rect area, `w` = the widest rect's SHORT side — "how wide is the space you're
standing in"):

| building | top by AREA | top by MIN-WIDTH | same pick? |
|---|---|---|---|
| Hospital_ARC | `≈ Level 1 Hall/Corridor 2` **a=219 m² w=3.3m** | `≈ Level 1 Hall/Corridor 8` a=124 **w=4.8m** | **NO** |
| Clinic_ARC | `≈ First Floor Hall/Corridor 3` a=125 **w=3.2m** | `≈ First Floor Hall/Corridor 12` a=53 **w=5.6m** | **NO** |
| HHS | `≈ Level 3 Hall/Corridor 1` a=204 **w=3.6m** | same | yes |
| Terminal_meta | `≈ Aras 02 R2` a=85 **w=7.0m** | same | yes |

**The diagnosis, in one line: Hospital's "main hall" is 219 m² and 3.3 m WIDE — a ~66 m long
corridor.** Area is large because the space is LONG, not because it is open. The 360° turn-around
beat fires with the camera standing in a hallway, which is precisely "does not show large space."
Terminal reads correctly only because its winner is a genuine 7.0m-wide room — the metric has been
getting the right answer there for the wrong reason.

**Candidate metrics (a decision, not yet taken — all are scale-free, no tuned threshold, per the
user's standing "keep it abstract, no hardcoded custom cases"):**
- `minDim` alone — picks the widest space, but Clinic's winner drops to 53 m²; width without size.
- `minDim²` (largest inscribed square) — "the biggest open square you could stand in". Pure
  spaciousness, one real geometric property, no constants.
- `area × minDim` — balances big AND open; a long corridor is penalised by its own narrowness.
A hard width THRESHOLD (e.g. "≥6m counts as a hall") is explicitly rejected: it is exactly the
hardcoded custom case the user ruled out, and it would behave differently on a house vs a hospital.

**⚠ But changing the metric alone will NOT produce a hall on Hospital, and that must not be
oversold.** Hospital's connected candidate pool is **24 nodes, essentially ALL of them
`Hall/Corridor`** — its 142 authored `IfcSpace`s (`§HBA_FOOTPRINT bound 142 rooms→real IfcSpace
footprint`) are not in the pool at all after the walker recompile, and most of the 214 compiled rooms
are `deadend=194 / orphan=185`. Best case, a better metric swaps a 3.3m corridor for a 4.8m corridor.
**There is no grand space in the candidate set to find** until connectivity lands
(`OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION G3) and/or authored rooms stop being displaced. Two
independent causes, one symptom — fix the metric in this lane, but expect the visible win only after
the pool has real rooms in it.

### ✅ SHIPPED 2026-07-25 — §SUSPECT-OPEN-ELIGIBLE (PR #994, tour.js v14, auto-merge armed)
FINDING 4's metric question turned out NOT to be the cause. Measured on the user's Save-DB export
(`~/Projects/BIM_DB/Hospital.db`, an exact repro of the live console): the walker FINDS a 315.7 m²
hall — larger than the shipped offline compile's 294 m² — and flags it `SUSPECT_OPEN`; §S2's blanket
"never SUSPECT_* as destinations" then hid it, along with 62 of 214 rooms. `SUSPECT_OPEN` means low
enclosure, i.e. *the space is open* — the exact property that makes a hall worth visiting. Now
eligible; `SUSPECT_NO_DOOR` stays excluded (genuine reachability doubt). Witness: 7 buildings
BEFORE/AFTER, `suspectOpenAdmitted=10` on Hospital, all six others byte-identical.
**Did not fix the symptom, and that is recorded honestly in the PR:** the 315.7 m² hall has `edges=0`
— isolated, so `§CONNECTED-STOPS` drops it before ranking. Blocked on the graph, see below.
**FINDING 4's metric change (area → area×minDim etc.) is now PARKED, not rejected** — re-measure only
once the pool contains reachable halls, or it will be tuned against corridors.

### ⛔ BLOCKED ON GRAPH SUBSTRATE — filed for another session 2026-07-25
The user's live question ("is it getting to the big hall?") is answered: **the tour reaches the
biggest space the GRAPH offers; the graph is the limit, not the ordering.** Hospital's live
`§ROOM_GRAPH` reads `nodes=224 edges=61 deadend=194 orphan=185 exits=0`, with
`no such table: storey_walkable_raster` (→ 16 `§PATH_LEGAL_DETOUR_FAIL`, `illegalChords=18/74`) and
`§CORRIDOR_ROOM_BACKPROP injected=10 skippedOverlap=33 / 43`. Full task, in dependency order, with
the seven-consumer sequencing argument and the witness plan:
**`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION.**

This lane is a pure CONSUMER of that graph and should NOT build scoring heuristics on top of data
about to change. Specifically waiting on: `exits>0` (G1 — needed for the user's proposed
grand-entrance beat AND for the descent finale, `stairDown=-` on every Hospital run) and the
walkable raster (G2 — legal paths). Two things that stay ours regardless: routing ORDER, and the
fact that "big hall" is chosen by floor AREA over compiled rooms — a vocabulary limit no
connectivity fix removes (per-room height doesn't exist; authored `IfcSpace` names are displaced by
the compile). Do not re-derive those here — they are stated once in §GRAPH-FOUNDATION's closing
section.

**User's proposed opening grammar, NOT built, recorded verbatim so it isn't lost (2026-07-25):**
"Perhaps a preamble nearer view thru its glass windows all round until noticing its bigger insides,
going thru the glass or grand entrance, sweeping to its stairs if it is adjoining another
attraction." Mapping to existing parts, so whoever picks it up knows the real cost: the closer
facade pass is a second `orbit` action at smaller radius with the gaze tilted up (`lookAround`
already gained `lookAtY` for the ENDING beat — parameter change, not new mechanism); "adjoining" is
measurable today as graph distance from the hall to each stair group; **the one genuinely missing
piece is the entrance itself — G1.** User's own framing: "I know this needs foundational layering."

### Not done / follow-ups
- **Hospital_ARC and SampleCastle_extracted still fall back to legacy** — pre-existing, unchanged by
  this work (`visited 3/15` and `2/9` fail the §MAJORITY-LEGAL/coverage gate in BOTH before and after).
  Their graphs are mostly unreachable stops; that is a room-compile/graph-connectivity problem, not a
  routing-order one. Worth its own bounded task.
- **Not live-watched by the user yet.** The measurements above are route geometry and the real action
  list; whether the highlight-first order FEELS like a good opening is a live-review question, same
  caveat §TARGET_BOUNDED_LOOKAHEAD closed with.
- **§TOUR_TIMELINE_SCRUB remains unimplemented** — the session started there, then the user redirected
  ("correct the initial tour journey first"). Its design was discussed and the user's UI choices are
  recorded in the next section.

### §WATCHDOG-HL-FIRST — independent review of the §HL-FIRST plan + witness (2026-07-26)
Reviewing session, read-only (did not edit `tour.js`). Reviewed the SPEC block above (`§HL-FIRST —
the spec`) against the real `viewer/tour.js` @ `bim-ootb` `73d3676`, BEFORE reading the
implementation report. Recorded here because the finding is about METHOD, reusable on the next
`stops[]` change — not about this one change.

**Verdict: plan sound, scope correct (order-only), but the spec was wrong in three places.** All
three are code the spec itself cited or implied:
| # | site | what the spec missed | caught by |
|---|---|---|---|
| 1 | `tour.js:535` `curGuid = entrance ? entrance.guid : stops[0].guid` | `stops[0]` carries a SECOND, unwritten meaning — the walk's ORIGIN for entrance-less buildings. "Reorder `stops[]`" silently relocates the tour's start. | witness sweep → FINDING 1 (§HL-ORIGIN) |
| 2 | `tour.js:862` split filter `v.i > 1` | a beat landing on the first interior point is dropped, so the main hall's 360° never becomes an action. | witness sweep → FINDING 2 |
| 3 | `tour.js:604` `pause: pauseGuids[pg] ? 'room' : (storeyArrival ? 'storey' : null)` | pause kind is DERIVED from a guid→bool map, not stored. Spec said "a third kind `'hall'`→360 is the whole change" — it is two edits (the map's value type + the `:874` ternary), not one. | this review |

~~Also: the spec cites the pause-kind→degrees map as `tour.js:886`. It is at `:874`. Mechanism as
described; citation off by 12.~~

**⚠ REBUTTED 2026-07-25 by the implementing session — this one correction is itself wrong, and it is
the §Session-Startup-step-0 landmine, live.** The review was performed against `bim-ootb` **local
`main` @ `73d3676`, which is 18 commits BEHIND `origin/main`** (`git rev-list --left-right --count
73d3676...origin/main` → `2 18`). The spec cites the commit the work was actually branched from,
`origin/main` @ `c722195`, where the line numbers are correct as written:

| site | `origin/main` c722195 (what the spec cites) | local main 73d3676 (what the review read) | review claimed |
|---|---|---|---|
| pause-kind→degrees ternary | **886** ✅ | 874 | "874" |
| split filter `v.i > 1` | **869** | 857 | "862" ✗ — matches NEITHER (`:862` there is `segments.push({from: segFrom, …})`) |
| `curGuid = entrance ? …` | 535 | 535 | 535 ✅ |

The stale checkout shifted every citation below `_buildGraphRouteInner` by 12 lines, and the row-2
number (`:862`) is wrong even in the reviewer's own tree. **`CLAUDE.md` §Session Startup step 0 —
`git -C ~/bim-ootb fetch origin && git merge --ff-only origin/main` BEFORE treating it as canon —
exists for exactly this, and its own cautionary example is a stale checkout that made a review report
SHIPPED code as missing.** A reviewing session must run it too; line-number corrections are only
meaningful relative to a stated commit, so **cite the SHA with the line, always, on both sides.**
Everything else in §WATCHDOG-HL-FIRST was verified and stands — see the agreement note below.

**THE LESSON (the reusable part): what made this safe was the WITNESS, not the spec and not the
model.** Two of the three defects above were in the authorized spec and would have shipped on a
spec-follows-code reading; they were caught only because the 7-building BEFORE/AFTER sweep *could
produce a bad number, and did* (HHS's first climb went 0.224 → **0.432**, the wrong way, before
§HL-ORIGIN). Corollaries, binding on any future reorder of `stops[]`:
- **`stops[]` has two concerns sharing one array index — ORDER and ORIGIN. Preserve them
  separately.** This is FINDING 1 generalised and is the single most reusable fact here.
- **The `:635` reject gate catches "broken," never "worse."** It is an ABSOLUTE threshold
  (`visitedStops < 2 || visitedStops < stops.length * 0.5 || …`), not a before/after comparison. The
  spec's claim that "an order that measures worse must still fall back to legacy" is FALSE as
  written — only the sweep catches "worse." **The Node harness is therefore load-bearing
  infrastructure for this file, not a one-off**; a future `stops[]` change without a BEFORE/AFTER
  sweep is unverified regardless of what the reject gate says.
- **Compare illegal chords as a RATIO, not a count.** Highlight-first grows route length 0–6%, so
  the denominator moves (HHS `9/62 → 9/69` reads as flat but is 14.5% → 13.0%, an improvement).
- **Witness wording to tighten if reused:** "max area over all stops" must mean the post-`§R6-BUDGET`
  ELIGIBLE pool (`:459`), not all graph nodes, or it false-fails on tall buildings; and
  W-HL-STAIRS-EARLY's "measurably earlier" has no pass threshold and is vacuous on single-reachable-
  storey buildings — state the N/A case up front (the implementation did both correctly; the SPEC
  did not say so).

**Process note, worth not repeating:** the ABSTRACTION AUDIT table above was written AFTER the
code, at the user's prompting. Good outcome — it killed a real tuned constant (the `+0.5m` "higher
storey" epsilon, removed after a re-sweep proved all 7 routes byte-identical without it). But the
direction of authority flipped: a post-hoc audit describes the code, where Spec-First requires a
claim that could have FAILED before the code existed. Write the abstraction claim with the witness
claims, not after the sweep.

**Outside-the-loop checks a session cannot self-certify** (verified by this review, all clean):
PR #989 is genuinely **MERGED** (`gh pr view 989` — squash auto-merge landed; the report said only
"auto-merge armed", and this project's own `CLAUDE.md` records PR #138 where a squash + late push
ORPHANED the follow-up commit). A concurrent session in the shared `bim-compiler` checkout committed
this file's spec edits under its own message — content verified intact. Do NOT reuse
`feat/tour-timeline-scrub` for the scrubber follow-up: it is squash-merged, its history now collides
(→ `DIRTY`); branch the scrubber off fresh `origin/main`.

#### Implementing session's response (2026-07-25, user asked "do you agree?") — AGREED except one row
Each claim re-verified against real code/`gh` before answering, not accepted on authority:
- **AGREED, and the most valuable finding: the `:635` gate catches "broken", never "worse".** The
  spec sentence it falsifies has been struck through and corrected in place at §HL-FIRST above. The
  corollary — the Node BEFORE/AFTER harness is load-bearing, not a one-off — is adopted.
- **AGREED: FINDING 1 and 2 were SPEC defects, not merely implementation ones.** The authorized spec
  said "reorder `stops[]`" and "a third pause kind is the whole change"; both were wrong against real
  code. Understated if anything — the pause-kind change was THREE edits (map value type, the `:604`
  consumer ternary, the degrees ternary), not two.
- **AGREED:** illegal chords compare as a RATIO; "max area over all stops" must mean the
  post-`§R6-BUDGET` ELIGIBLE pool; W-HL-STAIRS-EARLY needs its N/A case (single-reachable-storey
  buildings) stated up front. The implementation did all three correctly; the spec wording did not.
- **AGREED:** the ABSTRACTION AUDIT was written post-hoc, which inverts Spec-First's direction of
  authority. Write the abstraction claim WITH the witness claims next time.
- **AGREED and valuable:** verifying PR #989 actually MERGED (`mergedAt 2026-07-24T20:00:50Z`, merge
  commit `fab68d4`) rather than trusting "auto-merge armed" — independently re-confirmed. Same for
  the don't-reuse-a-squash-merged-branch warning.
- **NOT AGREED — the line-citation row**, see the ⚠ REBUTTED block above: reviewed against an
  18-commit-stale checkout, and its replacement number for the split filter is wrong in its own tree
  too. The lesson is inverted from the one it drew: **cite the SHA alongside the line, on both
  sides**, and run §Session-Startup step 0 before reviewing.
- Minor process note (not a complaint, recorded for role hygiene): `feedback_watchdog_no_edit_worker_prompt`
  says a Watchdog keeps findings in chat rather than editing the worker's own prompts file. It applies
  to work a worker is ACTIVELY producing; this review landed after the work was merged, so appending a
  dated section here is the right call under `feedback_prompt_file_organization` — noted only so the
  distinction stays explicit for the next review.

## ✅ IMPLEMENTED 2026-07-25 — 3-tier pacing, `bim-ootb` `fix/fly-tour-interior-pacing`
(worktree `/tmp/wt-fly-interior-pacing`, off `origin/main` @ `8d12254`; shared-tree hook blocked
editing `~/bim-ootb` directly, per Worktree Hygiene in this project's CLAUDE.md)

**Trigger — a real, reproduced bug, not a guess.** Live-testing the tour, the user reported "the
beginning part of the path seems to repeat a few times before moving on; later part is OK" and,
separately, "slow down in tight corners as it flashes too fast." Reproduced BOTH with real data
before writing any code (project rule: math/log is the proof, not a screenshot) — ran the actual
`A._buildGraphRouteInner` from `viewer/tour.js`, loaded verbatim (not reimplemented) via a Node
harness against two real buildings' room graphs:
- **Duplex** (`modeller/Duplex_ARC.db`): 6-point route visits room `B101`, then `B102`, then
  **`B101` again** — a literal repeat, 180° direction reversal.
- **HHS Office** (`deploy/buildings/HHS_Office_Federated_extracted.db`): 38-point route has 8
  separate ≥120° reversals, several exact there-and-back spurs (fly 9.5m into a room, fly 9.5m
  back out, turn=180°) — recurring on every storey, not just the first; matches "later part is OK"
  because early legs are short (rooms cluster near the entrance) so a 4m dead-end spur is a huge
  fraction of a short leg and reads as an immediate loop, while a 30m later leg swallows the same
  defect proportionally.

**Root cause:** stops are ranked by room AREA only (`_buildGraphRouteInner`'s own comment: "Drama
over travel economy"), then chained leg-by-leg via independent `shortestPath()` calls with no
lookahead — a room with exactly one door (most rooms) is a graph dead end, so the very next leg
must retrace the same corridor out. `§SOFTEN`'s existing comment ("spur-room reversals — walk in,
walk out — sweep instead of whip") already NAMES this pattern but only softened the camera's LOOK
direction, never the SPEED — the gap this session closed.

**User's fix directive (verbatim, 2026-07-25), NOT a topology change — pacing only, and explicitly
scoped away from DLOD/render-perf work another session owns:**
> "1. Outside orbit is fine. 2. Zoom into building can hasten up 2X. 3. within building X0.3 and
> even slower when too close to object or spaces as they will simply flash by meaninglessly" /
> "fix just the flight path not touch DLOD perf stuff handled by another session"

**Implementation (`viewer/tour.js`, 3 independent, additive changes — no routing/topology touched):**
1. **PART 1 (orbit): untouched**, confirmed by inspection — no edit made.
2. **PART 2 (entrance approach) — 2x speed.** The `moveTo` push for the outside→entrance zoom now
   carries `speedMul: 2`; the generic `moveTo` handler (~line 968) divides duration by
   `act.speedMul || 1` — opt-in per action, so the 3 other `moveTo` calls (finale bird's-eye/
   centre/final) are untouched.
3. **PART 3 (interior flyPath) — 0.3x baseline + real-geometry tight-turn extra slowdown:**
   - `INTERIOR_PACE_FACTOR = 0.3` multiplies the existing `flySpd` formula (~line 863) — the
     user's own explicit number, applied as a floor/baseline, not the whole mechanism.
   - **§TIGHT_TURN_PACING** (new, in the `flyPath` action's init block, ~line 1184): for each
     original waypoint, computes a `tight` score (0–1) from the REAL turn angle between the
     incoming/outgoing legs AND how short those legs are (`shortness = max(0, 1 - min(l1,l2)/4)`)
     — a dead-end spur is both sharp-angled and short, a corridor cruise is neither. Builds a
     monotonic time→curve-parameter remap (`_paceT`/`_paceU`) so more of the segment's FIXED
     duration is spent near tight vertices (up to `PACE_K=3` → 4x local slowdown) and less on
     straight stretches — camera position (`curve.getPointAt(u)`) is untouched, only the pacing
     of `u` advancing through it changes. `§TIGHT_TURN_PACING` console.log reports
     `maxTightness`/`paceKFactorRange` per segment for inspection.
   - Verified the math in isolation (not the full browser — user directed "leave to logging, need
     not test"): a synthetic dead-end-spur point sequence shaped exactly like the real Duplex/HHS
     cases gets **1.7x more wall-clock time** than uniform speed would give it, with local
     `paceFactor` hitting the 4.0x cap at the sharpest vertex — script kept at
     `/tmp/claude-*/scratchpad/diag_pacing.js` (session-local, not committed).
4. **Not changed:** stop-selection order, `shortestPath` chaining, any DLOD/render/occlusion code
   — scope held to pacing only per the user's explicit boundary.

**Status:** merged. PR #980 shipped the 0.3x-baseline + turn-angle version; live-testing it on LTU
(real courtyards + open-plan house, not a toy case) exposed two real bugs that a synthetic-only
check couldn't have caught, both user-reported live from actual §-log output:

## ✅ CORRECTED 2026-07-25/26 — v2/v3, PR #984 (`fix/fly-tour-interior-pacing-v2`, auto-merge armed)
- **Bug 1 — orbit's dynamic pacing did nothing.** Live log: `§INTERIOR_PACING orbit clearancePace
  min=0.35 max=0.35` — flat, for the entire aerial sweep. Root cause: `A.cinemaFan`'s BVH ray fan
  is HORIZONTAL only (effects.js's own header comment already says so — "cannot see 'no roof,'
  only 'no walls'"), so a mostly-VERTICAL descent never registers anything nearby and reads as
  permanently wide open. **Fix: stopped raycasting for orbit/moveTo entirely** — both already know
  exactly what they're approaching (real ground height / real destination point), so pace off that
  known geometry directly: orbit off `|camY - groundY|`, entrance moveTo off remaining distance to
  the target. Only `flyPath` (interior, no single known target) still uses the BVH fan.
- **Bug 2 — courtyards still read as slow despite a "fast" factor.** User: "the inverse distance
  speed law is not proper... it is a simple maths, no overthink." Root cause: the v1 remap only
  REDISTRIBUTES a segment's already-fixed total duration — it can never make a point average
  faster than that segment's own duration allows, and the flat `INTERIOR_PACE_FACTOR=0.3` capped
  that duration low regardless of how open the segment measured. Multiplying clearance by a
  separate turn-angle term made it worse, not better (live log: `combinedFactorRange=[0.35,16.00]`,
  a runaway 16x with no matching improvement to the actual complaint). **Fix: dropped the
  turn-angle term** (clearance alone already reads a dead-end spur as tight — walls close on every
  side, redundant signal) **and now rescale each action's own total duration by its real mean pace
  factor** (`meanFactor`), not just redistribute within an unchanged one — a genuinely open stretch
  now takes less real time outright.
- **Fully dynamic, not LTU-specific** (user asked directly): every constant (`PACE_FACTOR_MIN/MAX`,
  the 15m/10m/3m reference distances) is a generic scale, not a per-building value: orbit/moveTo
  read real geometry already known for ANY building's camera path, `flyPath` reads
  `A.cinemaFan`'s live BVH raycast against whatever geometry is actually loaded. LTU was this
  session's test building, not a special case in the code.
- Re-verified in isolation against reconstructed real LTU numbers before pushing: orbit factor now
  varies 0.35–4.0 across the descent (was pinned flat); a 48m open courtyard run's duration drops
  from 35.6s (1.35 m/s) to 12.4s (3.86 m/s) — genuinely faster, not just relatively so within an
  unchanged budget. Scripts kept at `/tmp/claude-*/scratchpad/diag_pacing2.js`/`diag_pacing3.js`
  (session-local, not committed).
- **Merge landmine hit and recovered (per this file's own CLAUDE.md-documented risk):** PR #980
  auto-merged (squash) between this session's first push and its follow-up pushes, orphaning the
  v2/v3 commits on the old branch — exactly the "squash-merge + late push orphans the new commit"
  pattern this project's CLAUDE.md already names. Recovered by fetching current `origin/main`
  (which had ALSO gained an unrelated PR #981 walkTick change in the meantime — confirmed
  non-overlapping via diff before touching anything), cherry-picking the two orphaned commits
  cleanly onto a fresh branch, and opening PR #984 rather than trying to force the old one.

## ✅ CORRECTED 2026-07-26 — v4, PR #985, LOS not omnidirectional min
Even after v2/v3, live LTU log still showed a courtyard leg computing `mean=2.47` (SLOWER than
baseline) despite the sightline ahead being wide open. User: "Measure by LOS - what is in front of
the middle in the frame, if it is far, fast. Near, slow." Root cause: `_clearancePace` took the
MIN across `A.cinemaFan`'s 8-ray omnidirectional fan — one nearby object in ANY direction (off to
the side, behind) forced the point "close" regardless of what was actually ahead. Fixed by adding
`A.cinemaLookDist(pos, dirX, dirZ)` (effects.js, single forward raycast, same mesh set/raycaster
`_cinemaFan` already uses) and switching `flyPath`'s interior pacing to measure LOS toward the
NEXT waypoint instead of the fan's min — an open sightline ahead now genuinely hastens even with
clutter off to the side. Orbit/moveTo untouched (already correct per #984's live log — height/
distance to a known target, not a raycast at all). PR #985, auto-merge armed.

**Not fully closed — handed off.** User: "another session will smoothen out the path for reason
of tour speeding up calculation" — further path-smoothing/speed-calc work is a known follow-on,
not done in this session. Don't re-litigate the LOS-vs-fan decision above without re-reading this
entry; it was arrived at from 3 rounds of live-log-verified correction, not a guess.

## ✅ IMPLEMENTED 2026-07-26 — §TARGET_BOUNDED_LOOKAHEAD, `bim-ootb` `fix/flypath-target-bounded-lookahead`
(worktree `/tmp/wt-fly-target-framing`, off `fix/fly-tour-los-pacing` (PR #985) @ `78b6046`, current
with `origin/main`; this is the "another session will smoothen out the path" handoff v4 named above)

**Trigger — cross-referenced from `FLY_TOUR_DLOD_SCALE.md` §21-§24, not this file's own thread.**
That file's investigation into why MaxQ's live preview (`cinema_maxq.js` `pvStep`) and Clash's
fly-to (`measure.js` `_flyToClash`) both read smooth while Fly Tour's interior `flyPath` doesn't —
after ruling out draw-call count, scene-object count, and render-pipeline settings (DPR/shadows/
composer/FOV, all checked, none differ in the causal direction) — found a real, code-grounded
mechanism difference:

| | target computed from | distance/framing |
|---|---|---|
| MaxQ dive (`effects.js` `_cinemaPathPlan`) | largest room's center/extent | scaled to that room's size |
| Clash fly-to (`measure.js:736-742`) | overlap-bbox center of the two clashing elements | `max(overlapMax*3, 2)` — scaled to the clash's own extent |
| Fly Tour `flyPath` (pre-fix, `tour.js` old line ~1334) | none | fixed **fraction** (0.05) of the curve's own total arc length |

MaxQ/Clash both bound their gaze to something of room/clash SCALE (a few meters); their distance is
DERIVED from that bounded target, never a flat fraction of an unrelated total. Fly Tour's `flyPath`
look-at used `getPointAt(t+0.05)` — 0.05 of the ACTION'S OWN arc length, which for a short MaxQ-style
beat (settle-to-door, effects.js `§CINEMA_TIMING_672` uses the same 0.05-of-path-style fraction) stays
a few meters ahead, but for `flyPath`'s multi-room, whole-storey route (100+m total, per §22's own
"38-point route" scale) the SAME 0.05 fraction put the look-at target **tens of meters ahead** —
aiming the gaze through doorways/down corridors into geometry the camera hadn't reached yet, well
before arriving.

**Fix (`viewer/tour.js`, 2 lines of real logic + 1 log line, `§TARGET_BOUNDED_LOOKAHEAD`):**
`LOOKAHEAD_M = 5` (constant, same scale as the pacing work's own 3m/15m reference distances).
`act._lookAheadFrac = totalLen>0 ? min(0.05, LOOKAHEAD_M/totalLen) : 0.05` — caps the lookahead to an
ABSOLUTE arc-length distance instead of a fixed fraction, independent of the action's total length.
Short flyPath actions (already ≤5m at 0.05) are unaffected; long multi-room actions get clamped. The
existing §SOFTEN 0.08 lerp-smoothing (spur-room reversals sweep, not whip) is untouched — this only
changes WHERE the raw lookahead point sits before smoothing, not the smoothing itself.

**Verified live, LTU_AHouse, real RTX 4060 browser (not synthetic, not screenshot-judged):** drove
`streamTick()`/`walkTick()` directly (bypassing the rAF idle-park gate and a hidden-automation-tab
rAF-throttle landmine hit during this session — both required manual pumping to get real streamed
geometry and a built tour without a 2+ minute stall) to reach the first interior `flyPath` action
(23 pts, `totalLen=555.7m`). Sampled 25 points along its curve; at each point, rendered TWICE — once
with the new capped look-at, once with the old `t+0.05` look-at — same camera position both times,
only orientation differs, then read `renderer.info.render.triangles` after a forced re-render:
- **Mean triangles across the 25 samples: 5,105,832 (old) → 4,179,055 (new), an 18% reduction**
  (`ratio=1.22`), with 9/25 points showing a real (>10%) drop, 2/25 slightly worse, 14/25 near-parity
  (points where a wall/turn was already within 5m under the old lookahead too).
- **Worst single-point divergence: t=0.14, old aimed 14.3m ahead vs new's capped 5.1m —
  9,412,644 → 1,403,138 triangles, a 6.7x reduction**, from an orientation change alone (identical
  camera position). Several other points showed 2-4x drops (t=0.34: 8.30M→2.25M; t=0.54: 5.51M→2.66M).
- Confirms §23/§24's hypothesis directly: the old lookahead frequently pointed down open corridor/
  doorway sightlines exposing far-room geometry; capping it to human/room-scale distance measurably
  cuts what's in frustum, independent of the object-count/draw-call fixes §21/§22 already exhausted.

**What this does NOT fix, stated plainly:** this is an ORIENTATION fix, not a geometry-reduction one
— the remaining triangle cost when the capped lookahead still faces open geometry (14/25 sample
points, near-parity) is real GPU/rasterization cost, same domain `FLY_TOUR_DLOD_SCALE.md` §17's
room-occlusion work already targets. This and that work are complementary, same as §22 noted for its
own object-count fix. Also NOT re-tested: whether the tighter/lower-average look-at changes perceived
"feel" (does the shorter gaze read as staring at the wrong thing on approach) — the pacing sessions
already covered SPEED feel; this fix's FEEL (not just its triangle count) has not been live-watched
by the user yet. Confirm that before calling this fully closed.

**Housekeeping note for whoever continues:** the test worktree hit two real environment landmines
worth knowing about before repeating this kind of live capture: (1) the streaming/render loop is
fully idle-parked (`main.js` `_startLoop`/`_rafId`) and ALSO genuinely killed by the browser's own
`visibilitychange` handler when the automation tab isn't the foreground/visible tab — `A.streamTick()`
and `A.walkTick()` are both safely callable directly (bypassing rAF) for this reason, confirmed
working; (2) a plain `python3 -m http.server` does not serve HTTP Range requests (LTU's 71MB
extracted.db needs 206 Partial Content or the app's own fetch wrapper treats it as a failure and
falls back to slow OCI) — use `npx http-server -c-1 --cors` or equivalent instead.

### Non-goals (this spec)
- Exterior/aerial (`moveTo`/`orbit`) pacing: untouched, out of scope, already correctly separated in
  the current code (own `WALK_SPEED` constant, not `flySpd`).
- Not a DLOD/render-cost fix — unrelated to `FLY_TOUR_DLOD_SCALE.md`'s occlusion/frame-cost work,
  filed here specifically because this is a routing/pathing concern, not a rendering one.
- Not authorized to implement from this section alone — per this project's Spec-First rule, the
  investigation in the numbered items above needs real data/citations added to this file before any
  code changes to `tour.js`'s interior route-building or pacing.

## §TOUR_TIMELINE_SCRUB — ✅ SHIPPED (see `✅ IMPLEMENTED 2026-07-25 — §TOUR_TIMELINE_SCRUB` at the
## end of this file: `bim-ootb` `feat/tour-timeline-scrub2`, commit `e8689e9`, PR #999, 9 witnesses).
## The spec below is kept VERBATIM as the design record — read it for WHY, read the block at the end
## for WHAT SHIPPED and the three measured deviations. Original heading: "SPEC ONLY, not yet
## implemented (2026-07-26, user directive verbatim)".

**User's own words, verbatim, the actual scope:** "introduce a new feature which is the tour
timeline where it can be scrubbed... It is separate from the history/timeline which is dots of
events. This tour timeline be smooth to play forward backward while maintaining the overlay ie
n,Alt-G/o."

**Explicitly NOT the existing History Bar** (`common/history_bar.js`/`universal_history.js`/
`history_tap.js`) — that system is a discrete EVENT log (`§HIST_LIST`/`§HIST_PUSH`, dots per
recorded `§act`: "Opened LTU_AHouse", "Alt+G → GI preview", etc.), navigable by jumping between
event dots, not a continuous playback position. This new feature is a CONTINUOUS scrubber over the
Fly Tour's own playback time — drag a handle, camera position/gaze update live, both directions —
closer to a video seek bar than an event timeline. Two different mechanisms, two different files;
this one belongs in `tour.js`, not the history system.

**What the engine already has, real code citations, not assumed:**
- The tour is `A.walkActions[]` (22 actions this session: orbit, moveTo, flyPath×6, pause,
  lookAround, interleaved) — each with its own `duration`/`_duration`, known once `buildTour()`
  completes. A GLOBAL scrub position is naturally "cumulative time across all actions in order,"
  computable once (prefix-sum the durations) — no new data needed, just a derived table.
- Per-action pose-from-progress is MOSTLY already a pure function of a 0-1 fraction: `flyPath` uses
  `act._curve.getPointAt(t)` (real arc-length parameterized spline — already random-access, not
  iterative); `orbit` computes position from `angTt`/`radius`/height formulas at a given `tt`
  (`tour.js` orbit block, also already pose-from-fraction); `moveTo` lerps `_startPos`→destination
  by a t fraction. **This is good news for scrubbing** — the POSITION side of every action type
  already supports "give me the pose at fraction t," which is exactly what a scrubber needs.

**What does NOT already support random access — the real open design question, not decided here:**
- **Look-at smoothing is frame-history-dependent, not pure-from-t.** `flyPath`'s gaze
  (`act._prevLook.lerp(lookPt, 0.08)`, `tour.js` ~line 1354) and `lookAround`'s pan both blend from
  the PREVIOUS frame's target, not compute fresh from `t` alone — correct for forward playback
  (smooths track-switches, §SOFTEN), but undefined for an arbitrary scrub jump (there is no "previous
  frame" to lerp from at a fresh seek position). Needs a decision: snap `_prevLook` directly to the
  raw target on a hard/large jump, keep the lerp only for small in-place drag deltas (the user's own
  "smooth to play forward backward" wording suggests the drag-scrub case specifically wants the
  smoothing kept, just not broken by big jumps) — a threshold-based hybrid, not a full redesign.
- **Per-action lazy-init runs once at `A.walkActionT === 0`** (`flyPath` builds `_curve`/
  `_paceRemap`; `moveTo` captures `_startPos`/`_startTarget`; `orbit` similar) — a scrubber jumping
  INTO the middle of an action that hasn't run its init yet would read `undefined` curve/remap
  objects. Needs either: precompute/cache every action's init eagerly once at tour-build time (all
  the real geometry/points needed already exist then — nothing here depends on live camera state
  except `moveTo`'s `_startPos`, which is only used for the FIRST `moveTo`; every OTHER action's
  init uses already-known waypoints, not live camera position, so this is likely cheap and safe to
  precompute for all 22 actions up front, not lazily) — or a small per-action "ensure inited" guard
  called from the scrub-seek path, reusing the SAME init code forward-playback already uses.
- **DLOD/streaming systems tick incrementally, not from-scratch per seek** (`§DLOD_NAV_BUDGET`
  ramps up over many ticks, `§ROOM_OCCL_INDEX`/`§ROOM_OCCL_ROOM` tracks room transitions with
  `stableN` hysteresis) — a large scrub jump changes camera position discontinuously, which these
  systems don't currently expect (they assume gradual, tick-by-tick movement). Needs checking
  whether a big scrub jump should force an immediate DLOD re-evaluation at the new position (most
  correct) vs. just letting the existing budget ramp catch up over the next few frames (cheaper,
  possibly a visible pop). Not decided here — a real perf/correctness tradeoff, not a UI detail.

**"Maintaining the overlay ie n, Alt-G/o" — stated as an INVARIANT, not new work.** Night mode
(`toggleNightMode`), GI preview (`Alt+G`, `N8AO` composer toggle), and DLOD nav (`toggleDlodNav`)
are independent scene/render-state toggles, orthogonal to tour playback today — scrubbing must not
call anything that resets them. This is a regression risk to explicitly TEST once built (drag the
scrubber with each toggle on, confirm it survives), not a mechanism to build — the scrub
implementation should touch camera/gaze/DLOD-state only, never re-run whatever code path those
toggles live in.

**Not authorized to implement from this section alone** — per this project's Spec-First rule, the
three open items above (look-at smoothing at arbitrary seek, eager vs. lazy per-action init, DLOD
re-evaluation on discontinuous jumps) need resolving — by further investigation citing real code, or
by the user's own call on the tradeoffs — before any `tour.js`/UI changes. Likely a real, if small,
new UI element too (a draggable scrub bar) — not specified here, follows once the engine-side
seek() mechanism above is settled.

**"Similar to TM" (2026-07-26, user's own framing) — real, confirmed precedent, not a loose
analogy, and it likely makes this feature cheaper than the open items above suggest on their own.**
`viewer/time_machine.js` already ships exactly this shape of control, proven and shipping:
- A time cursor (`_cursor`, ms into the project timeline) that state/rendering is a function OF,
  plus a real HTML range-input scrub bar (`#tm-slider`, `time_machine.js:2523`) wired on the `input`
  event (`onSlide`, `:2595`) — the UI chrome, drag mechanics, and slider styling this feature needs
  are not new, they already exist and work.
- A progress bar synced to cursor fraction (`pbar.style.width`, `:2335-2336`) — the same "where in
  the sequence am I" display the tour scrubber needs.
- **TM already has cursor-driven CINEMATIC CAMERA behavior, not just element-visibility toggling**
  — `_cineTransitFrom`/`_cineTransitTo` (`:1567-1742`) move the camera smoothly as `_cursor` scrubs,
  including obstruction-peeling and distance-based easing. This is the closest existing precedent to
  Fly Tour's own camera-pose-from-position problem — study THIS code before assuming Fly Tour needs
  a bespoke mechanism (the walkTick-replay-via-virtual-clock idea floated earlier in this same
  session is a reasonable fallback, but TM's own approach should be checked first — it may already
  solve the "smooth scrub, either direction" problem in a way that's directly portable).
- **Concretely, next session's first move:** read `time_machine.js`'s cursor→state→camera pipeline
  end to end (not just the citations above), then decide whether Fly Tour's scrubber wraps THAT
  same kernel abstraction (cursor→pose function, shared UI slider pattern) rather than building a
  parallel one. If BIM Compiler's kernel already has one general "scrub a cursor across time, drive
  visible state and camera from it" concept serving BOTH 4D construction playback and now the Fly
  Tour, that's a real, reusable, and (per the user's own words) "free" architectural asset — worth
  stating plainly in whatever session picks this up, since it changes the scope from "build a
  scrubber" to "wire Fly Tour into the existing scrub kernel."

**Two more real design points added post-close (2026-07-26, user, before actually ending):**

1. ⚠ **SUPERSEDED 2026-07-25 — see "User's UI decisions" §1 below: the tour line simply APPEARS when
   the Tour begins, TM-style. No reveal interaction, no record-style icon.** Kept verbatim for the
   falsification record only: *"a movie record button icon flashing when it is playing, and when
   pressed it pauses and a timeline appears with the control knobs"* — i.e. the scrub UI hidden by
   default during cinematic playback, one record-dot-style icon as the only visible control, pressing
   it pauses AND reveals the panel. **Do not implement this.** The simpler always-visible bar replaced
   it and removed the icon-collision problem entirely rather than solving it.
2. **Confirmed, real architectural distinction — "ours quite on the fly" vs. baked (user's own
   framing, verified accurate, not just asserted):** this codebase already has a genuinely BAKED
   system to contrast against — `cinema_maxq.js`'s own cinema export pipes the canvas through
   `MediaRecorder`/`captureStream()` to produce an actual `.webm` file (real wall-clock pre-render
   time proportional to length, nothing scrubbable until that finishes). The Fly Tour scrubber is
   the opposite: every seek recomputes the LIVE 3D scene at that exact pose in real time — no
   pre-render step, any window size, and it keeps respecting whatever's toggled on screen (night
   mode/GI/DLOD nav) because it's a real render, not a video-frame lookup. Worth stating in the
   eventual implementation's own comments, not just here — it's the reason a live-replay-based seek
   (§ above) is the right shape, not "bake then let the user scrub the recording."

**Session closed here (2026-07-26, user: "clean close new session on that").** Spec above is
sufficient for a fresh session to start from a running start — investigate `time_machine.js`'s
cursor/camera pipeline first, decide reuse-vs-bespoke, then implement. Not started this session.

### 2026-07-25 — reuse-vs-bespoke ANSWERED (TM pipeline read), + the user's UI decisions
Still NOT implemented (the user redirected this session to §HL-FIRST routing first), but the open
question at the top of this section is now settled with real citations, so the next session need not
re-investigate `time_machine.js`.

**VERDICT: bespoke seek in `tour.js`; borrow TM's DOCTRINE and VISUAL LANGUAGE, not its code.** Why,
from the actual file (`viewer/time_machine.js`, line numbers real):
- `renderAtTime(cursorMs)` (`:1110`) IS a clean absolute seek — sole writer of `_cursor` (`:1118-19`,
  enforced by its own `§PERF_INCR_FIX` comment `:3002-3007`), scene state fully re-derived from `_ops`
  each call (`:1132-1145`), direction-agnostic (`_dLo/_dHi` via min/max, `:1237`), so backward scrub
  is symmetric and free. **But it is private to the TM IIFE and TM-specific** — no
  `window.TimeMachine` namespace exists; the only public handles are diagnostics
  (`window.__tmSetCursor` `:4842`, `window.tmGetState` `:4817`). `renderAtTime`/`onSlide`/
  `configSlider` are NOT exported.
- Its slider is **not a 0–1 position** — `#tm-slider` (`:2523`) is mode-relative (DAY = index into
  `_days`, HR = 0–23, MIN = 0–59; `configSlider` `:2912`, `onSlide` `:2934`), reconstructing an
  absolute cursor from `_anchorDay`/`_anchorHr`. Nothing to reuse for a tour playhead.
- Its cinematic camera is **only pose-pure in 2 of 5 beats.** `transit` (`:1774-1789`,
  `lerpVectors(_cineTransitFrom, _cineTransitTo, easeInOut(t))`) and `opening` (`:1597-1611`) are
  `f(t)`; `closeup`/`establishing` are damped chases with accumulators (`_camAngle` `:1693`,
  `_camTarget` `:1665`) — scrubbing backward would keep rotating FORWARD. Also `_cineTransitFrom` is
  captured from the LIVE camera at beat entry (`:1568`), i.e. frame-history dependent.
- Worth copying: the **single-writer + full-recompute discipline** (with TM's own bounded delta-skip
  fallback, `_INCR_MAX_SPAN_MS` `:1039`), and the **look** — 376px glass panel (`:2489-2497`),
  `#4fc3f7` accent, `<input type=range>` with `accent-color`, 3px progress bar with
  `transition:width 0.2s` (`:2523-2526`, driven at `:2336`).

**Why Fly Tour's own version is genuinely simpler than TM's:** its cursor is a scalar `T` in seconds
over `prefix-sum(walkActions[].duration)`. `seek(T)` = binary-search the action, set
`walkActionIdx`/`walkActionT`, evaluate that action's pose.

**The one architectural move that collapses all three open items above into one:** at the end of
`buildTour()`, walk the actions once and have each report its END pose, feeding the next one's start.
Today `moveTo` captures `_startPos` from the LIVE camera at action entry and `flyPath`/`orbit`
lazy-init at `walkActionT === 0` — that is precisely what makes a mid-action seek undefined. Chaining
the pose at build time makes every action eagerly inited with a static start, and the whole tour
becomes a deterministic `pose = f(T)` — a TIMELINE rather than a playback side-effect. This is
§VOCABULARY_NOT_REALTIME applied to the camera (prepare once, don't re-derive live), and it costs
nothing at runtime (~22 actions, all waypoints already known at build time). The two remaining items
then shrink to: (a) keep the `_prevLook` lerp for small drag deltas, snap it to the raw target on a
large jump; (b) re-evaluate DLOD once on scrub RELEASE, not per `input` event (per-event re-eval
would jank the drag; TM has no debounce at all on its own input path, `:2595` — do not copy that).

**User's UI decisions (2026-07-25, answered directly when asked):**
1. ✅ **SETTLED (user, 2026-07-25, SUPERSEDES the reveal-icon design below): the whole tour line
   simply APPEARS when the Tour begins — same as TM.** Verbatim: *"i think when Tour begins the whole
   tour line simply appears similar to TM.. no further confusion."* So: **no hidden state, no reveal
   press, no record-style icon.** Tour starts → the bar with its draggable handle is on screen, exactly
   the way `time_machine.js` shows `#tm-slider` when TM is active. This is the simplest thing that
   works and it dissolves the whole icon-collision problem rather than solving it.
   ⚠ **Consequence — drop these, do not carry them forward:** the two-state reveal interaction, the
   pulsing dot, and the cyan-vs-red colour reasoning are all MOOT. There is no record-style glyph to
   collide with `cinema_maxq.js`'s `.webm` export because there is no glyph at all.
   ⚠ **Revisit only if:** an always-on bar proves to compete with the cinematic view during a real
   presentation (the §4 purpose above). That is a live-review question, not a reason to pre-build the
   hidden mode — build the simple one first.

   ~~**SUPERSEDED — kept for the falsification record, do not implement:**~~ *Reveal icon = a pulsing
   dot in the viewer accent `#4fc3f7`, NOT red — a flashing RED record-dot collides with
   `cinema_maxq.js`'s genuine `MediaRecorder`/`captureStream()` → `.webm` export; same glyph, two
   meanings, one app. One icon visible during playback, pressing it pauses AND reveals the panel.*
2. ⚠ **TERMINOLOGY — "knob" means TWO different things here. Read this before building any UI.**
   - **The scrub HANDLE** (user, 2026-07-25: *"there is a 'knob' to drag along the tour line right?"*)
     — **YES, and it is the primary control**: a draggable thumb travelling along a LINEAR tour-time
     bar, dragged left/right, scene following live in both directions. Precedent is
     `time_machine.js`'s real HTML range-input (`#tm-slider` `:2523` + `onSlide` `:2595`) whose native
     thumb already does exactly this. **It is NOT one of the "four knob groups" below** — it is the
     bar itself, and everything below hangs off it.
   - **"The four knobs"** = the four CONTROL GROUPS listed next. Different sense of the word.
   🚫 **HARD PRECEDENT — do NOT build a rotary/amp-style dial.** This project already shipped one
   (`common/history_knob.js`, PR #230) and the user **rejected it outright**: *"hard to control,
   orange halo useless, no hover."* It was scrapped and replaced by the `‹ dots ›` bar; the file is
   **deleted (404 on GH Pages)**, along with its `.scrubknob` CSS and five `poc_knob*` harnesses —
   see [[project_history_knob_dial]]. A future session reading the bare word "knob" must not
   resurrect that form. **Linear bar + draggable thumb. Not a dial.**
   (The history `‹ dots ›` bar is adjacent but a DIFFERENT system — discrete event dots, not
   continuous tour time. Reuse its lesson about form, not its mechanism.)

   **Knobs: all four** — chapter ticks on the bar (labelled from `walkActions[]`: orbit / approach /
   corridor / stair / room beat), play-pause + restart + `mm:ss / mm:ss`, a speed knob
   (0.5x/1x/2x, a `dt` multiplier in `walkTick`), and step-by-beat `◀◀ / ▶▶` buttons that jump the
   cursor to the previous/next action boundary.
3. Sequencing: the user's own call — **"We have to correct the initial tour journey first"** — hence
   §HL-FIRST shipped this session and the scrubber did not start. Note the two interact usefully:
   chapter ticks become more meaningful now that the opening block is main-hall → stairs → highlights.
4. **PURPOSE (user, 2026-07-25): live PRESENTATION, not just playback.** Verbatim: *"a scrubber can be
   useful for user review"* and *"For user easy reference during presentation."* The four knobs above
   were already the right set — this states WHY each earns its place, so none gets value-engineered
   away later as decoration:
   - **speed 0.5x** is narration pacing — a presenter talking over a beat needs it slower than
     cinematic default; **2x** is skipping to the part being discussed.
   - **`mm:ss / mm:ss`** is the audience-facing reference ("we're 2:10 in, the atrium is at 3:40") and
     the thing that makes a tour *citable* between sessions. It is not chrome.
   - **step-by-beat `◀◀ / ▶▶`** is "go back and show that again" — the single most likely live action,
     and the reason beat boundaries must be exact, not approximate scrub positions.
   - ~~the hidden-by-default reveal~~ — **SUPERSEDED by decision 1**: the bar simply appears when the
     tour begins, TM-style. If an always-on bar turns out to compete with the view in a real
     presentation, that is the one thing to re-open — as a live-review finding, not a pre-built mode.
   Design consequence, stated so it is not discovered late: a tour must be **inspectable**, not merely
   seekable — pause and HOLD a pose indefinitely without drift, step back to an exact beat, and land on
   the same pose every time for a given T. That is a correctness requirement on `pose = f(T)` (the
   build-time end-pose chaining), not a UI nicety: a presenter re-running the same seek in front of an
   audience must get the same frame.

---

## ✅ IMPLEMENTED 2026-07-25 — §TOUR_TIMELINE_SCRUB, `bim-ootb` `feat/tour-timeline-scrub2`
(worktree `/tmp/wt-tour-scrub2`, branched fresh off `origin/main` @ `9f18562`. The older
`feat/tour-timeline-scrub` / `/tmp/wt-tour-scrub` was NOT reused — it carried the since-squash-merged
§HL-FIRST commit, PR #989, and shows DIRTY against `origin/main`.)
**Commit `e8689e9` · PR https://github.com/red1oon/bim-ootb/pull/999.**

**Files:** `viewer/tour.js` (v17 banner, engine + UI), `viewer/picking.js` (hide bar on canvas-tap
abort), `viewer/viewer.html` (`tour.js?v=17`, `picking.js?v=29`), `viewer/sw.js` (`v847`), new
`witness_tour_scrub.js`. `common/history_bar.js`/`universal_history.js`/`history_tap.js` untouched —
different system, as this section always said.

### What was built — the resolved verdict, implemented as written
The §"one architectural move" is what shipped: `A._tourPrepare()` walks `walkActions[]` once at tour
start, and each action reports its END pose which becomes the next action's START pose. Three
functions carry it:
- **`_actInit(act, sPos, sTgt, nextAct)`** — the SAME init code forward playback already used, with
  every live-camera read (`moveTo`'s `_startPos`, `orbit`'s `_startAngle`, `flyPath`'s prepended
  `camPos`) replaced by the chained start pose. Idempotent via `act._inited` — `flyPath`'s
  `meanFactor` rescale of `act.duration` must never apply twice.
- **`_actPose(act, tLinear)`** — PURE `{pos, tgt}` for all 7 action types, no frame history, no side
  effects. The pace remaps are applied exactly where `walkTick` applied them before.
- **`A.tourSeek(T, soft)`** — binary-search `A._tourStarts`, set `walkActionIdx`/`walkActionT`,
  evaluate, apply. Sole writer of the cursor triple.

`walkTick` is now a thin driver over the same two functions, so playback and seek **cannot** diverge —
this is the section's own "reusing the SAME init code forward-playback uses", taken literally rather
than as a parallel guard path.

**Two conversions were needed to make every action fraction-based** (both exact, not approximations):
`lookAround` integrated a CONSTANT `PAN_SPEED` rate into `walkPanAngle` and never advanced
`walkActionT` at all → `_duration = totalDeg / PAN_SPEED`, progress = `t`; `rise` stepped a constant
1.0 m/s until `|dy| < 0.05` → `_duration = |dy| / 1.0`, linear in `t`. Both are the same integral.

**The three open items, resolved as the 2026-07-25 verdict proposed:**
- *Look-at smoothing* — hard seeks SNAP `flyPath._prevLook` to the raw curve target; the §SOFTEN
  `lerp(…, 0.08)` is kept untouched for playback, and a gentler `lerp(…, 0.35)` for small in-drag
  deltas (same beat, `|ΔT| < 0.5s`). Drag RELEASE always re-seeks HARD, so the resting pose after a
  drag is pure `f(T)` — proved by W-SCRUB-DRAG-RELEASE below, not assumed.
- *Eager vs lazy init* — fully eager, measured at **9.7 ms for 37 actions** on LTU_AHouse. The
  section guessed "likely cheap"; that is the number.
- *DLOD on discontinuous jumps* — re-evaluated ONCE on RELEASE (`A._dlodFrame = -1; A.dlodTick()`,
  forcing past `dlodTick`'s own frame-modulo throttle), never per `input` event. TM's undebounced
  `onSlide` (`:2595`) was deliberately not copied, as this section instructed.

### UI — all four knob groups, as decided
Bar simply APPEARS when the tour begins (decision 1). **No reveal icon, no pulsing dot, no
record-style glyph** — the superseded design was not built. **No rotary dial** — the
`common/history_knob.js` / PR #230 rejection precedent holds; `#tour-scrub-slider` is a native
`<input type=range>` linear thumb. TM's visual language borrowed, not its code: 376px glass panel,
`#4fc3f7` accent, `accent-color` on the range, 3px progress bar with `transition:width 0.2s`.
1. **Chapter ticks** — one clickable mark per action boundary, `title` labelled from `walkActions[]`
   via `_beatName()` (action `name`, else `flyPath`'s first `names[]` entry, else a per-type label).
2. **Play/pause + restart + `mm:ss / mm:ss`** — pause sets `A._tourPaused`; `walkTick` early-returns
   before touching the camera, so a held frame is held by construction, not by a damping race.
3. **Speed 0.5x / 1x / 2x** — a `dt` multiplier in `walkTick`. Durations are baked at 1x so
   `_tourTotal` and the `mm:ss` total stay stable regardless of playback speed.
4. **Step-by-beat `◀◀ / ▶▶`** — `A.tourStepBeat(dir)` seeks the nearest `_tourStarts[]` entry strictly
   before/after the cursor. Exact boundaries, never approximate scrub positions.

### Witnesses — real `LTU_AHouse`, real 37-action tour (18:10), all PASS
Harness `witness_tour_scrub.js` (puppeteer, headless, `PORT=8467` static server on the worktree).
Every assertion reads REAL numeric object state — camera position, `controls.target`, `_tourT`,
`_tourStarts` — out of the live page. No screenshots, per this project's FUNDAMENTAL LAW.
Log: `~/bim-ootb/.witness_scrub3.log` (copy preserved at closeout; the `/tmp/wt-tour-scrub2`
worktree was pruned once PR #999 merged), exit 0.

| Witness | Issue it proves | Evidence (verbatim) |
|---|---|---|
| W-SCRUB-PREPARE | is the timeline complete + monotonic? | `actions=37 sum=1090.597263s total=1090.597263s monotonic=true allEagerlyInited=true` |
| W-SCRUB-DETERMINISM | is `pose = f(T)` actually pure? | `probes=6 worstComponentDelta=0` — 6 probes seeked, then re-seeked in REVERSE order with random decoy seeks interleaved; all 6 pose components bit-identical |
| W-SCRUB-BEAT | exact boundaries, not approximations? | `prev@544.5186[idx20] prev@541.5186[idx19] prev@541.1186[idx18] next@541.5186[idx19] next@544.5186[idx20] next@626.5466[idx21]` — every landing is an exact `_tourStarts[]` member; `sameBeatFromBothDirections_posDelta=0` |
| W-SCRUB-OVERLAY | the "maintaining the overlay ie n, Alt-G/o" invariant | `before={"night":true,"gi":true,"dlodOn":true,"dlodEngaged":true}` → `after={…identical…}` across a full drag + release |
| W-SCRUB-HOLD | can a presenter hold a frame? | `paused=true walkTickCalls=1200 maxPoseDrift=0 cursorDrift=0` over 3000ms wall-clock |
| W-SCRUB-DRAG-RELEASE | does a drag leave residue? | drag rest pose vs cold seek at T=697.9822 → `maxComponentDelta=0` |
| W-SCRUB-SPEED | is speed a `dt` multiplier, not a rescale? | `total=1090.5973s unchanged across 0.5x → 2x → 1x` |
| W-SCRUB-PLAYBACK | did the `walkTick` rewrite break forward playback? | `cursorMonotonic=true pathTravelled=722.455m endT=2.648s` |
| W-SCRUB-UI | four knob groups present, no dial | `barVisible=true linearRangeThumb=true chapterTicks=37 play/prev/next/restart=true/true/true/true speedBtns=3 mmss="0:02 / 18:10" rotaryDials=0` |

Key §-log lines from the live page:
```
[TOUR] §SCRUB_PREPARE actions=37 total=1090.597s prepMs=9.7 endPose=-231.8069,-2.7599,-107.0892
[TOUR] §SCRUB_BEATS orbit:7.95 | moveTo:1.15 | flyPath:80.22 | pause:0.40 | lookAround:2.00 | … | pause:1.00
[TOUR] §SCRUB_TICKS n=37 total=1090.60s
[TOUR] §SCRUB_UI show actions=37 total=1090.60s bar=linear-thumb dial=none
[TOUR] §SCRUB_SEEK T=676.1703 idx=23 t=0.423832 mode=hard pos=-53.9440,0.5351,10.1796 tgt=-50.1225,0.5351,13.1731
[TOUR] §SCRUB_SEEK T=676.1703 idx=23 t=0.423832 mode=hard pos=-53.9440,0.5351,10.1796 tgt=-50.1225,0.5351,13.1731   ← re-seek, identical
[TOUR] §SCRUB_BEAT dir=prev from=545.2986 to=544.5186 idx=20
[TOUR] §SCRUB_PAUSE paused=true T=458.0509 pos=-49.7466,-3.4149,11.1685
[TOUR] §SCRUB_SPEED mult=0.5x totalUnchanged=1090.60s
```

### Deviations from this section's spec — measured, not invented
1. **Prepare runs at the `A.walkActions = tour` assignment in `_startFlyTour`, not literally "at the
   end of `buildTour()`".** Reason found in the real code, not chosen for convenience: the
   §TOUR_CACHE fast path (`A._tourCachedRoute`, `tour.js:288`) never calls `buildTour` at all — a
   cached route is plain JSON — so a `buildTour`-only hook would leave every cached tour unprepared.
   It must also run AFTER the cache store (`:312-321`) so the stored JSON stays free of the runtime
   remaps/curves.
2. **Speed multipliers no longer bake into durations.** Consequence, stated because it is a real
   behaviour change: `orbit` previously ignored `A.walkSpeedMult` entirely (it was the only action
   type that never consulted `spd`) and now honours it like every other type. This is required —
   a timeline whose total length changes with the speed knob cannot carry an `mm:ss` total.
3. **`W-SCRUB-PLAYBACK` measures a 39.8m playback-vs-pure pose gap** during the opening high-radius
   aerial orbit. This is the PRE-EXISTING adaptive-jump smoothing block (unchanged by this work,
   `maxDelta >= 0.5` → `lerp` at 0.12/0.3) lagging behind genuinely fast motion; it is playback-only
   by design and `tourSeek` never runs it, which is exactly why re-seeks are bit-identical. Reported
   as a measured number, NOT fixed — fixing it would be a separate scoped change to a shipped
   easing behaviour, and this section did not authorise one.

### Not done / deliberately out of scope
- **No port to `bim-compiler`'s `deploy/dev/tour.js`** — bim-ootb is implemented first; the port is
  its own task (§R5 repo seam).
- **The "revisit only if" clause on decision 1 stands untested**: whether an always-on bar competes
  with the cinematic view during a REAL presentation is a live-review question, and this session
  deliberately did not pre-build the hidden mode to hedge it.

---

## ▶ ADDENDUM (Sonnet-side, 2026-07-25) — a related idea, parked in its own file, NOT this task's scope
Recorded here only as a pointer so a future session resuming the scrubber sees it exists — this does
**not** change `§TOUR_TIMELINE_SCRUB`'s spec above, and is not something to fold into the current build.

`prompts/Viewer/SAVE_DB_SCENE_STATE.md` (same day) captures three related, separately-discussed ideas
that sit *upstream* of this scrubber rather than inside it: (1) Save-As-DB also persisting camera/view
state; (2) a cut/join/heal **EDL** (Edit Decision List — the real film-editing term) that edits which
stops/actions exist *before* this file's own `pose = f(T)` build-time chaining ever runs on them; (3)
versioned "Save As Tour" cuts, reusing the `versions[]`/`latestVersion` shape already named in
`LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md` rather than inventing a new one; (4) a Loop option (cheap —
`T mod duration` — given pose=f(T) already holds). Video/movie export was explicitly ruled OUT of that
file's scope — the existing `.webm`/Record feature (this file's own §2 above) stays untouched and is
the natural render step downstream of an edited EDL, not something to rebuild.

None of this is authorized to build. If picked up, it's a separate task from `§TOUR_TIMELINE_SCRUB` —
read `SAVE_DB_SCENE_STATE.md` in full first, it has its own open questions not repeated here.

---

## ▶ NEXT SESSION — REVIEW USAGE + TESTING of the shipped scrubber (opened 2026-07-25, nothing started)
The scrubber is BUILT and PUSHED (`✅ IMPLEMENTED 2026-07-25` above — bim-ootb `e8689e9`, PR #999,
`tour.js` v17, `sw.js` v847, 9/9 numeric witnesses green). **Do NOT re-implement it and do NOT
re-derive its design** — the three formerly-open items (`_prevLook` at arbitrary seek, eager-vs-lazy
per-action init, DLOD on discontinuous jump) are all resolved IN CODE and cited below. This section
is the follow-on task: **use it, then test what usage exposes.**

### 0. First, verify it actually landed
PR #999 was open at hand-off, not confirmed merged. `gh pr view 999` — do not assume auto-merge
landed it (this project has a recorded squash-merge-orphans-a-late-push incident, PR #138). If it
merged, start any follow-up off **fresh `origin/main`**, never off `feat/tour-timeline-scrub2`.

### 1. Where the mechanism lives (so review reads code, not the summary)
- `A._tourPrepare()` `tour.js:1328` — the build-time chain, hooked on the `A.walkActions = tour`
  assignment (`:338`), **deliberately not** on the end of `buildTour()`: the §TOUR_CACHE fast path
  never calls `buildTour`, so a `buildTour`-only hook leaves every cached tour unprepared. Deviation 1.
- `_actInit` `:1130` / `_actPose` — the SAME code forward playback uses, live-camera reads replaced by
  the chained start pose. `walkTick` `:1436` is now a thin driver over both, so playback and seek
  cannot structurally diverge.
- `A.tourSeek(T, soft)` `:1357` — single writer of `(walkActionIdx, walkActionT, _tourT)`; `soft`
  keeps the flyPath gaze lerp for small drag deltas, every other seek SNAPS `_prevLook` (`:1373`).
- DLOD re-eval ONCE on release `:1546-1550` (`change`/`pointerup`/`touchend`), never on `input`.
- UI `:1524-1615` — `<input type="range">`, `accent-color:#4fc3f7`, visible from tour start. No dial,
  no reveal icon (both explicitly rejected — see decisions 1 and 2 above).
- Witness harness: **`witness_tour_scrub.js`, now on `origin/main`** (re-runnable from any fresh
  checkout — the `/tmp/wt-tour-scrub2` worktree was pruned at closeout, PR #999 having merged). The
  original log is preserved at `~/bim-ootb/.witness_scrub3.log`. Re-run the harness after ANY change
  here — it is the regression gate for `pose = f(T)`.

## §OPENING_BEAT_SEEK_GAP — NAMED BOUNDED TASK, not an open question (opened 2026-07-25)
**Not a §TOUR_TIMELINE_SCRUB bug and NOT a reason to have blocked PR #999** — it is pre-existing
(the shipped adaptive-jump smoothing block, untouched by that PR) and it does not touch what the PR
claims: seek is pure `pose = f(T)`, `W-SCRUB-DETERMINISM worstComponentDelta=0` across six
reverse-order probes with decoy seeks interleaved. Blocking a well-verified isolated PR to fix an
unrelated bug it merely EXPOSED is the conflation this project already has a rule against
(`feedback_separation_of_concern.md`, the S280b regression). Filed separately, on purpose.

**The measurement:** `W-SCRUB-PLAYBACK` (log `~/bim-ootb/.witness_scrub3.log:9`) —
`playback-vs-pure pose gap=39.7768m` during the opening high-radius orbit; the smoothing is
playback-only by design, so live playback and a seek to the SAME T land ~40m apart at that beat.

**Why it still carries urgency despite being pre-existing — the overlap, not the number:**
§HL-FIRST made the high-radius main-hall orbit **the first thing anyone sees**. That is also the
single most likely place a presenter scrubs BACK to, given the scrubber's own stated purpose (user,
verbatim: *"For user easy reference during presentation."*). A visible pose jump at exactly that
beat reads to an audience as a glitch in the feature shipping alongside it. The number is
unremarkable in isolation; the placement is what makes it worth scoping now.

**Scope when picked up:** narrow the adaptive-jump smoothing so playback converges to the pure
`f(T)` pose during high-radius orbits (or exclude `orbit` from that block) WITHOUT widening into a
general easing rewrite — it is a shipped behaviour, §21-§24 pacing in `FLY_TOUR_DLOD_SCALE.md` owns
that file's pacing concerns and must be read first. Gate: re-run `witness_tour_scrub.js`, the
existing 9/9 must stay green AND the `W-SCRUB-PLAYBACK` gap must drop; report the measured
before/after numbers, not "looks smoother".

### 2. The three things usage should actually interrogate (ranked)
1. ~~**`W-SCRUB-PLAYBACK`'s 39.8m gap**~~ → PROMOTED to its own scoped task,
   **`§OPENING_BEAT_SEEK_GAP` above** — no longer an open review question. Original note kept:
   **`W-SCRUB-PLAYBACK`'s measured 39.8m playback-vs-pure pose gap** during the opening high-radius
   orbit — the pre-existing adaptive-jump smoothing is playback-only by design, so live playback and a
   seek to the SAME T differ during that one fast beat. It does NOT affect seek determinism (seek is
   pure `f(T)`; `W-SCRUB-DETERMINISM worstComponentDelta=0`). Open question for a real user: is that
   divergence noticeable when you pause mid-orbit and the frame shifts? If yes it is its own bounded
   task (narrowing a shipped easing behaviour), NOT a scrubber bug — do not widen scope silently.
2. **Does the always-on bar compete with the cinematic view in a real presentation?** This is the ONE
   thing decision 1 above named as re-openable, explicitly as a live-review finding. If it does, the
   answer is still not the old hidden/reveal-icon design (rejected) — bring back a measured proposal.
3. **Do the four knob groups earn their place in actual use** (§4 PURPOSE: presentation, not just
   playback)? 0.5x for narration, `mm:ss` as an audience-facing citation, `◀◀/▶▶` as "show that
   again". Usage is the only way to find out which is dead weight or which is missing a beat label.

### 3. Testing gaps this session did not cover (all real, none blocking)
- **One building only.** Every witness ran on real LTU_AHouse (37 actions, 18:10). Buildings with a
  different action mix — Terminal/Hospital (corridor+stair heavy), Duplex (legacy-fallback tour, which
  never builds a graph route at all) — are untested. **Duplex is the important one**: confirm the bar
  behaves on a LEGACY tour, not just a CINE-GRAPH one.
- **Overlay invariant tested programmatically, not by hand** (`W-SCRUB-OVERLAY` before/after state
  identical for night/GI/DLOD) — a human should still drag the bar with `n` and `Alt+G` on.
- **No mobile/touch pass.** `touchend` is wired for release; nothing verified on a real touch device.
- **`deploy/dev/` (bim-compiler viewer) port not done** — §R5 repo seam, its own task, needs the
  room-stack copy first.
Per the FUNDAMENTAL LAW: any pose/timing claim from this review must come from `§`-log numbers or the
witness harness. A screenshot or "looks smooth" is not evidence, even as a supplement.

### §WATCHDOG-TOUR-SCRUB — independent review verdict, kept for the next session (2026-07-25)
**VERDICT: the shipped capability is solidly verified; merge was recommended and taken as-is.** Kept
here so a future session does NOT re-audit what has already been checked — read this before
re-verifying anything in `✅ IMPLEMENTED 2026-07-25` above.

**What was checked, and how (method matters — citations were read against the REAL code, not taken
from the builder's own summary of itself):**
- `A._tourPrepare()` `tour.js:1328` — eager chain confirmed present, `allEagerlyInited=true`. The
  lazy guards at `:1365`/`:1470` remain as belt-and-braces, NOT as the mechanism. This was the item
  flagged as most likely to fail SILENTLY (a mid-action seek reading `undefined` curve/remap) — it
  does not.
- `_actInit` `:1130` — same init code forward playback uses, live-camera reads replaced by the
  chained start pose.
- `A.tourSeek(T, soft)` `:1357` / `_prevLook` `:1373` — `soft` keeps the lerp for small drag deltas,
  every other seek snaps to the raw target. The hybrid the spec settled on, not a redesign.
- DLOD `:1546-1550` — re-eval forced once on `change`/`pointerup`/`touchend`, never on `input`; the
  comment explicitly names TM's undebounced `onSlide` as the thing NOT copied.
- Form: `grep` for rotary/dial/record/pulsing returns ONLY comments explaining why they are not
  built. `<input type="range">` at `:1573`, `rotaryDials=0`, `barVisible=true`.
- Reuse-vs-bespoke was ANSWERED, not assumed past: TM's `renderAtTime` is private to its IIFE, its
  slider is mode-relative (not 0–1), and `_cineTransit*` is pose-pure in only 2 of 5 beats
  (`closeup`/`establishing` are damped accumulators that rotate FORWARD on backward scrub). Bespoke
  seek, TM's doctrine and look borrowed. Settled — do not re-open.

**Why the proof stands:** real building, real numbers, zero drift across reverse-order probes with
decoy seeks interleaved, byte-identical overlay state before/after, and **no screenshot anywhere in
the evidence chain** — which is the FUNDAMENTAL LAW this project runs on, not a stylistic preference.

**The one thing NOT closed** is `§OPENING_BEAT_SEEK_GAP` above — deliberately filed as its own task
rather than folded in. Everything else in §2/§3 of the NEXT SESSION block is usage-review work that
genuinely needs a human driving the bar, not another code audit.

## §SCRUB_USAGE_HOSPITAL — first real usage review, ✅ PASS on a second building (2026-07-25)
**Closes §3's "one building only" testing gap.** Source: user's own hand-driven session on the LIVE
GH Pages viewer (`red1oon.github.io/bim-ootb/viewer/`, `§TOUR_VERSION v17`, `§BUILD_VERSION v847`),
Hospital loaded from OCI (`Hospital_extracted.db`), full console log read per the Log Mandate.
**No harness run was needed** — the log alone reproduces three of the nine witnesses in the field.

### What the log PROVES (numbers, not impressions)
- **Prepare, different action mix from LTU:** `§SCRUB_PREPARE actions=43 total=807.122s prepMs=3.2`
  — 43 beats / 13:27 vs LTU's 37 / 18:10. Corridor+stair-heavy route, 7 storeys, prepared in 3.2ms.
- **W-SCRUB-DETERMINISM, reproduced by hand:** `T=531.8935 idx=29 t=0.088958` seeked THREE separate
  times across a reverse scrub, with seeks to `486.69 / 481.04 / 484.27 / 508.49 / 522.21 / 530.28`
  interleaved as decoys, returning `pos=-4.3693,3.6707,-21.1933 tgt=-4.7713,3.5259,-16.2074`
  identically every time, all six components. `T=585.1635` likewise twice →
  `pos=25.8303,2.9972,1.6164`. `pose = f(T)` holds on real hand input, not just scripted probes.
- **W-SCRUB-DRAG-RELEASE:** `§SCRUB_RELEASE T=531.8935 pos=-4.3693,3.6707,-21.1933` — identical to
  the seek pose at the same T. No settle, no drift.
- **W-SCRUB-HOLD:** `§SCRUB_PAUSE paused=false T=531.8935 pos=-4.3693,3.6707,-21.1933` — same again.
- **W-SCRUB-SPEED:** `mult=2x totalUnchanged=807.12s`, `mult=0.5x totalUnchanged=807.12s`.
- **Self-heal fired as designed:** `§PATCH_APPLY` TWICE (144,960 bytes into both `Hospital_meta.db`
  and `Hospital_extracted.db`), `§NEEDLE_INJECT rooms=214 rects=317`, `§NO-OVERLAP: 0 cross-room
  overlaps`. The 142→214 room injection confirmed in the field, client-side, from OCI.

### Findings — ranked, ONE is the scrubber's, three belong to other lanes
1. **[SCRUBBER] One beat is 181.20s of 807.12s — 22.4% of the tour in a single chapter.**
   `§SCRUB_BEATS ... flyPath:181.20` (the 15-pt / 425.3m Level-1→4 leg,
   `§FLYPATH_INIT pts=15 len=425.3`). `◀◀/▶▶` cannot help inside it; only dragging can. This is the
   concrete answer to §2 item 3 (do the knob groups earn their place): they do, but that beat needs
   sub-division or a mid-beat label. Also explains the tick clustering seen on screen.
2. **[CORRIDOR-GRAPH lane, NOT the scrubber] The Hospital route flies through walls:**
   `§FLY_ROUTE ... illegalChords=14/81`. Upstream: `§ROOM_SPINE_BRIDGE bridged=15 rejected=25`,
   `§ROOM_GRAPH nodes=224 doors=440 edges=61 deadend=194 orphan=185 orphanRescued=172`, and
   `§PATH_LEGAL_DETOUR_FAIL` on every storey (L1 128 doors / L2 62 / L3 106 / L4 97 / L5 82 — no
   legal detour found on any). Level 2 worst: only 5 spine candidates, rooms rejected at
   `nearest=44.69m`. Belongs with `OCCUPANT_PATHFINDER.md`'s F1-F4 follow-ups.
3. **[SHORTCUTS] `§SHORTCUT_AUDIT total=28 ok=23 inline=0 dead=5 deadKeys=+,-,z,w,r`** — `r →
   _cycleRoom` reports **dead**, yet shipped as PR #969 with 15/15 witnesses
   (`ROOM_CYCLE_HOME_SHORTCUTS.md`). Also `z`/`w → toggleOpen`, `+`/`-` → `_zoomStep`. May be a
   lazy-load timing artifact in the audit rather than four broken features — NEEDS ONE CHECK, do not
   assume either way.
4. **[DLOD lane] `§DLOD_NAV_ROOMS status=present source=none rooms=-`** — nav-DLOD reports rooms
   present but no source and no count, and stays `room=leg-off`/`room=none` for the whole tour,
   despite 214 rooms being injected BEFORE it engaged. Room-scoped DLOD looks unbound.

### Checked and explicitly NOT issues (do not re-raise)
- **`tmTourCache:Hospital:v16` vs `§TOUR_VERSION v17`** is CORRECT. That key versions tour
  *building*; §TOUR_TIMELINE_SCRUB changed playback/seek only and deliberately never touches
  `buildTour` (see `_tourPrepare` hooking the `A.walkActions = tour` assignment instead).
- **Closing `§FPS_MODE mean=11.9–12.7ms`** is ~80fps on a PARKED static scene (`§IDLE_GATE park`),
  not a collapse. During the tour: 29–105ms with `dlod=on fly=1`, in line with LTU's §22 baseline.

## §SCRUB_PANEL_DRAG — SPEC (user ask 2026-07-25: "can u make that scrub tour panel draggable?")
**Why:** §2 item 2 asked whether the always-on bar competes with the cinematic view. A movable panel
answers that WITHOUT reopening the rejected hidden/reveal-icon design (decisions 1 and 2 above stay
rejected) — the presenter moves it off whatever they are showing, and it stays where they put it.

**Behaviour:**
1. **Handle = the panel background**, not the controls. A `pointerdown` whose `target.closest(
   'input,button,#tour-scrub-ticks')` is non-null does NOT start a panel drag — the timeline slider,
   the four knob groups and the clickable chapter ticks keep their exact current behaviour.
2. **No jump on first grab.** The shipped panel is centred via `left:50%;transform:translateX(-50%)`.
   On first drag, convert to explicit `left/top` px from `getBoundingClientRect()` and clear the
   transform in the SAME frame, so the panel does not shift under the cursor.
3. **Clamp fully on-screen:** `left ∈ [0, innerWidth-w]`, `top ∈ [0, innerHeight-h]`. A drag aimed
   off-viewport parks it at the edge; it can never be lost.
4. **Persist** to `localStorage['bim.tourScrub.pos']` = `{left,top}`; restore on `_scrubShow()`,
   re-clamped (the viewport may have changed size since). Survives tour stop/restart and reload.
5. **Reset** on double-click of the panel background → back to the shipped bottom-centre default and
   the stored position is cleared.
6. **Pointer capture** so a fast drag that leaves the panel keeps tracking.

**Witness — `W-SCRUB-PANEL-DRAG` in `witness_tour_scrub.js` (the regression gate, must stay 9/9 → 10/10):**
- moves by the EXACT synthesized delta (rect before/after, ±1px);
- clamps inside the viewport when dragged far off-screen;
- position survives `_scrubHide()`→`_scrubShow()`;
- **`A._tourT` and the camera pose are UNCHANGED by a panel drag** — this is the "nothing broken"
  assertion: moving the panel must never scrub the timeline;
- a slider drag still seeks after the panel has been moved.

### §SCRUB_PANEL_DRAG — ✅ IMPLEMENTED 2026-07-25 (bim-ootb `fix/opening-beat-seek-gap`)
`viewer/tour.js`: `_scrubWireDrag()` + `_scrubClampPos`/`_scrubFreezePos`/`_scrubApplyPos`/
`_scrubSavePos`/`_scrubRestorePos`/`_scrubResetPos`; `_scrubRestorePos()` called from `_scrubShow`.
All six spec behaviours built as written. **Witness: `W-SCRUB-PANEL-DRAG` added to
`witness_tour_scrub.js` — the suite is now 10/10 ALL PASS** (log `.witness_paneldrag.log`):
`movedBy=-120.0,-90.0 exactDelta=true clampedInView=true parkedAt=0.0,0.0
persistedAcrossHideShow=true | poseDelta=0 cursorDelta=0 sliderStillSeeks=true`.
The `poseDelta=0 cursorDelta=0` pair is the "nothing broken" assertion: moving the chrome does not
write the timeline.

## §WATCHDOG-TOUR-SCRUB-2 — second independent review, verdict SOUND-WITH-CAVEATS (2026-07-25)
Commissioned because the user asked "let Watchdog review if all is ok nothing broken." Reviewed the
MERGED code via `git show 12ef411:viewer/tour.js` against its v16 parent `9f18562`. **It found five
things the first `§WATCHDOG-TOUR-SCRUB` review missed** — that review is therefore NOT the last word;
prefer this one. Two defects below were independently re-verified against the real code before being
recorded here (D1 and D4 — cited files read directly, not taken from the reviewer's summary).

**The timeline math is sound and stands:** `_actPose` reads only `act._*` + `tLinear` for all 7 types;
the eager chain is complete; `tourSeek` never runs the smoothing block, which is genuinely why hard
re-seeks are bit-identical. Nothing here retracts §TOUR_TIMELINE_SCRUB's shipped capability.

| # | Sev | Defect | Trigger → wrong behaviour |
|---|-----|--------|---------------------------|
| D1 | Med | **Resume after canvas-tap abort never re-shows the bar.** `picking.js:108` hides it and leaves `walkActionIdx` untouched; the resume branch `tour.js:21-32` sets `walkMode=true` and returns WITHOUT `A._scrubShow()`. **RE-VERIFIED in code.** | ✈ → tap canvas → ✈ → tour plays with the scrubber permanently hidden. Falsifies the `:83` comment "bar lives exactly as long as the tour". |
| D2 | Med | **`_scrubDragging` sticks true** — set at `:1593`, cleared only in `release()` bound to slider `change`/`pointerup`/`touchend` (`:1613-1615`), no `setPointerCapture`. | Grab thumb → drag straight DOWN off the panel → release. Range input ignores vertical → no `change`; `pointerup` lands on canvas → `release()` never runs → `_scrubSync:1679` never writes the slider again → thumb frozen for the rest of the tour. |
| D3 | Med | **✈-stop leaves a live, lying bar** (`:11-19` never calls `_scrubHide`, never touches `_tourPaused`). | ✈-stop → bar still visible showing ⏸ → press ▶ → `_tourPaused=true` → press ✈ → status says "Walk resumed", `walkTick:1443` early-returns forever. Camera frozen, status bar lying. |
| D4 | Low-Med | **`pause`/`lookAround` beats now WRITE camera position; in v16 they did not.** `_actPose:1246` sets `pos = act._startPos.clone()`, the pause branch leaves it, `walkTick:1484` copies it every frame. v16's pause (`9f18562:1256-1261`) touched nothing. **RE-VERIFIED in code.** | Every tour, no bar interaction: `pause` beats DRIFT toward the pure pose instead of holding, and every boundary after a fast beat shows a damped catch-up glide. Contrast `W-SCRUB-HOLD` (scrub pause) which IS provably frozen. |
| D5 | Low | **Soft-seek branch is unreachable.** `small` needs `|ΔT|<0.5s` but one slider step = `_tourTotal/SCRUB_RES`; LTU 1.09s, Hospital 0.81s — both >0.5. Dead on any tour >500s. | The drag-smoothness feature does not exist in practice; its purity claim has never been executed. |
| D6 | Low | Playback is not suspended during a drag (nothing sets `_tourPaused` on `pointerdown`). | Hold the thumb still 2s → camera creeps, thumb lies, snaps back on release. |
| D7 | Low | Keyboard seek skips `_scrubAfterJump` (`release()` early-returns when `_scrubDragging` is false). | Focus slider, arrow-key → no DLOD re-eval. |

**Overclaims to fix in the record (Watchdog Protocol — claims without proving log lines):**
- *"playback and seek cannot diverge"* — **contradicted by our own log**, `.witness_scrub3.log:9`
  `gap=39.7768m`. Correct form: "cannot diverge in the timeline formulas; the playback-only
  smoothing filter still does."
- *"eager init measured at 9.7ms"* — the preserved log says `prepMs=10.7`. Quoted from an
  unpreserved run.
- *W-SCRUB-OVERLAY "across a full drag + release"* — the harness dispatches `input` with no prior
  `pointerdown`, so `release()` early-returns. It tested `input` only.
- *Deviation 2 "orbit now honours walkSpeedMult like every other type"* — `pause` and `riseAndTilt`
  changed too. Three types, not one.
- *`act._inited` idempotence* — the guard is defeated by its only caller (`_tourPrepare:1337` sets
  `_inited=false` before `_actInit`, which mutates the PERSISTENT `act.duration` at `:1226`). Safe
  today only because each activation gets a fresh array. Fragile, unwitnessed.

## §OPENING_BEAT_SEEK_GAP — ⚠ GATE INVALIDATED BEFORE IMPLEMENTATION (2026-07-25, read this FIRST)
**The mechanism is confirmed; the gate proposed above is NOT sound. Do not implement against it.**
- **CONFIRMED:** the smoothing block IS a first-order lag filter; steady-state lag under continuous
  (non-jump) motion is `d(1-a)/a` with `a=SMOOTH`; it is playback-only. The fix direction — a lag
  offset that DECAYS instead of being re-fed by ordinary motion — remains correct, and it also cures
  D4 above (the boundary catch-up and the pause drift are the same lag seen from the other side).
- **NOT CONFIRMED:** that `d≈4.4 m/frame` explains the measured 39.7768m. That figure was never in
  the evidence; the harness's own numbers give a 9.145 m/frame run mean and imply `d≥5.42`, the
  sample lands in the orbit's blend-in transient (`_actPose:1300-1303`) rather than a steady state,
  and `purityGap` is a max-COMPONENT, not a norm.
- **THE GATE IS FRAME-RATE DEPENDENT — this kills "the gap must drop" as a pass condition.**
  `d = v·dt`, and `W-SCRUB-PLAYBACK` drives `walkTick()` inside `setTimeout(r, 30)`; editing that 30
  moves the number with ZERO product-code change. **Directly demonstrated this session:** a re-run on
  a differently-built LTU tour (28 actions / 833.34s vs the original 37 / 1090.60s) reported
  `gap=4.4447m` against the original `39.7768m` — an 8.9x swing with the smoothing code untouched.
- **Replacement gate when picked up:** assert the DIMENSIONLESS ratio `gap / perFrameDelta`, which
  under the current code must equal `(1-a)/a = 7.33`, or drive `walkTick` with a fixed synthetic
  `dt`. Report that ratio before/after, never the raw metres.

## §SCRUB_PREPARE_STALL — 1.67s blocking hitch at tour start, ROOT-CAUSED (2026-07-25) ⛔ OPEN
**A real regression introduced by §TOUR_TIMELINE_SCRUB's eager prepare, invisible to all 10 witnesses.**
Source: user's live GH Pages run on LTU_AHouse (122,330 elements, OCI DB, `§TOUR_VERSION v17`).

**The measurement:** `§SCRUB_PREPARE actions=28 total=1888.823s prepMs=1666.5`.
Compare: Hospital (63k) `prepMs=3.2`; the ORIGINAL LTU witness run (same building!) `prepMs=10.7`.
**156x worse than the witnessed number on the same building.** A prior session's claim that "the
timeline cost is scale-independent" is WRONG and is retracted here.

**Root cause, traced through real code (not inferred from the number):**
`_tourPrepare:1328` eagerly runs `_actInit` for every action. flyPath's `_actInit:1224` builds its
pace remap via `_losPace:1069`, which calls `A.cinemaLookDist` — and that is a REAL raycast:
`effects.js:3978-3989`, `_cineFanRay.intersectObjects(meshes, true)` over `_cinemaFanMeshes()`.
**One raycast per waypoint** × 105 interior points × a 122k-element mesh set = the 1.67s. Cost scales
with (waypoints × scene complexity), and the scrubber moved ALL of it to a single blocking moment at
tour start. Pre-v17 it was amortised lazily, one action at a time, as each beat began.

**WHY NO WITNESS CAUGHT IT — the important part, this invalidates prepMs as a witnessed quantity:**
in the headless swiftshader harness the LOS rays hit NOTHING — `§TIGHT_TURN_PACING losRange=[0.63,
0.63] mean=0.63` on every single flyPath, i.e. `cinemaLookDist` returned `CINEMA_FAN_FAR` every time.
In the live browser it returns real hits: `losRange=[0.63,1.60]` with means 1.06/1.40/1.41/1.46/1.47/
1.55/1.60. **The harness measures a regime the real browser never enters.** Any future perf claim
about `_tourPrepare` from that harness is worthless until this is fixed.

**SAME ROOT CAUSE, second symptom — the tour ballooned to 31:28.** `total=1888.823s` vs 18:10 on the
same building previously. Because the rays now hit something almost everywhere in a dense model, the
pace factor pins near `PACE_FACTOR_MAX=1.6` instead of the 0.63 hasten, and `_actInit:1226` rescales
each duration by `meanFactor`. `§SCRUB_BEATS` shows `flyPath:542.31` — **one 9-minute beat**, 518.1m
at 0.96 m/s. This is the "multi-minute crawl" `FLY_TOUR_DLOD_SCALE.md §25 §BASE_SPEED_REGRESSION`
claimed to have killed, back through a different mechanism. §25 says do not re-open pacing without a
specific live-reproduced complaint — **this is one**, with numbers.

**Fix directions (not yet chosen):** (a) cache/limit the LOS raycasts (they are recomputed per
prepare, and `§FLY_PLAN_DEDUPE memo-hit` shows the ROUTE is already memoised while the pacing is
not); (b) chunk `_tourPrepare` across frames so the first beat can start immediately; (c) cap the
number of LOS samples per flyPath instead of one-per-waypoint. Gate must be measured IN A REAL
BROWSER — the headless harness cannot see this.

## §SCRUB_SCALE_MEASURED — the honest scaling numbers (2026-07-25, both from live GH Pages runs)
| Building | Elements | Frame time during tour (`dlod=on fly=1`) | ≈ fps | Worst frame |
|---|---|---|---|---|
| Hospital | 63,182 | 29–105 ms | 10–34 | 640.2 ms |
| LTU_AHouse | 122,330 | 80.9–216.1 ms | 4.6–12 | 911.1 ms |
Roughly HALVES as element count doubles. `§FPS_MODE mean` is frame_ms (`main.js:670`,
`dt = now - _fpsLastT`), NOT fps — the ~12ms figures elsewhere in these logs are the PARKED static
scene after `§IDLE_GATE park`, not motion. **Do not claim "no lag" or "scales to high element
count" from these logs; they say the opposite.** Consistent with `FLY_TOUR_DLOD_SCALE.md` §22/§25
(~86.7ms/11.5fps) and with §17 occlusion culling being CLOSED as four-times-failed.

## §DLOD_ALL_BOXED — confirmed on BOTH buildings, promote from "finding 4" to a real defect
`§DLOD_NAV active=0 boxed=122330` held across THIRTY consecutive `§DLOD_NAV_BUDGET boost=` steps
(2→60) on LTU — every element a wireframe proxy, zero real geometry, for the whole opening beat. Then
`active=52017 boxed=70313` (42% real), falling back to `active=12926 boxed=109404` (10.6% real).
Hospital showed the identical pattern (`active=0 boxed=63182`, recovering to ~61% peak).
`§DLOD_NAV_ROOMS status=present source=none rooms=-` on BOTH, despite 394 (LTU) / 214 (Hospital)
rooms being injected BEFORE nav-DLOD engaged — room-scoped DLOD never binds. Same bug, two buildings.
**Presentation impact:** the "X-ray reveal" this produces is well-formed per doctrine (honest
distinguishable wireframe stand-ins, the Alt+X pattern) — but when `active=0`, the audience is
looking at zero real building.

**Not all bad news — route quality is building-dependent, not systemically broken:**
LTU `illegalChords=1/100` (99% wall-legal) vs Hospital `illegalChords=14/81`. Correlates with graph
density: LTU `nodes=397 edges=278 orphanRescued=91/91`, Hospital `nodes=224 edges=61 deadend=194`.
Hospital is the outlier; fix the Hospital graph, not the router.

## §SCRUB_BAR_LIFECYCLE — SPEC + FIX for §WATCHDOG-2 D1/D3 (user-reported live, 2026-07-25)
**User report, verbatim:** *"the scrubber panel cannot reappear when user interupts canvas and drag
freely at the spot it finds interesting. Pressing L continues the tour but the panel remains hidden."*
This is exactly `§WATCHDOG-TOUR-SCRUB-2` **D1**, predicted from code and now REPRODUCED IN THE FIELD.

**Field evidence** (user's live GH Pages log, LTU_AHouse, `§TOUR_VERSION v17` + `§SCRUB_PANEL_DRAG`):
```
§PICK hits=3 chosen=0 … §PICK no guid for mesh.id=29537   ← canvas tap → picking.js:108 _scrubHide()
§SHORTCUT_FIRE key=l
[WALK] RESUMED at action 6                                 ← NO §SCRUB_UI show after it
[WALK] PAUSED at action 8 → RESUMED at action 8 → PAUSED   ← bar never returns for the rest of the run
```
Same log independently confirms §SCRUB_PANEL_DRAG shipped and works live: `§SCRUB_PANEL_POS restore
left=1051.2 top=97.0 clamped=false` and two `§SCRUB_PANEL_DRAG … (timeline untouched)`.

**Root cause (already traced in D1, re-confirmed at `tour.js:21-32`):** the resume branch sets
`walkMode=true; flyActive=true` and RETURNS without ever calling `A._scrubShow()`. `_scrubShow` is
called from exactly ONE place — `:339`, the fresh-tour path — which the resume branch never reaches.

**THE INVARIANT (this is the fix, not a patch):** *the bar is visible whenever a tour is running or
resumable, and its play/pause button always reflects the real `_tourPaused`.* The shipped comment at
`:83` already ASSERTED this ("bar lives exactly as long as the tour"); the code did not implement it.

1. **Resume branch (`:21-32`) → call `A._scrubShow()`.** This also closes **D3**'s frozen-resume for
   free: `_scrubShow` calls `tourTogglePause(false)`, so a `_tourPaused=true` left behind by pressing
   ▶ on a stale bar can no longer make `walkTick:1443` early-return forever.
2. **✈-pause branch (`:11-19`) → `A.tourTogglePause(true)`, keep the bar VISIBLE.** Previously it
   left the bar showing ⏸ (= playing) while nothing played — D3's "live, lying bar". Keeping it
   visible and honest is better than hiding it: the presenter paused on purpose and may still want to
   scrub. Do NOT `_scrubHide()` here — that would throw away the control the user just chose to stop at.
3. **`picking.js:108` unchanged.** A canvas tap is a deliberate grab of the camera; hiding the bar
   there is correct. Fix 1 is what guarantees it comes back on the next `L`.

**Witness — `W-SCRUB-RESUME-BAR` (suite 10/10 → 11/11):** drive the REAL user path, not a seam —
dispatch a genuine `pointerdown` on `A.canvas` to trigger picking.js's own abort, then call
`A.toggleFlyAround()`, and assert: bar `display==='flex'`, `walkMode===true`, `_tourPaused===false`,
and the restored panel position survives the abort→resume round trip. Also assert the ✈-pause branch
leaves the bar visible with `_tourPaused===true` (the D3 half).

### §SCRUB_BAR_LIFECYCLE — ✅ IMPLEMENTED 2026-07-25 (bim-ootb `fix/scrub-bar-resume`), suite 11/11
`viewer/tour.js`: resume branch → `A._scrubShow()`; ✈-pause branch → `A.tourTogglePause(true)` with
the bar kept VISIBLE; new `A._scrubVisible()` + a narrow `§SCRUB_BAR_REVEAL` guard (user: *"L should
check if bar panel is present, be careful not to break discovery otherwise"*) — a RUNNING tour whose
bar is off-screen gets the control restored by `L` instead of being paused; it never fires when the
bar is visible, so ordinary `L`-pause and free canvas discovery are untouched. `picking.js` unchanged.
```
PASS W-SCRUB-RESUME-BAR — abortedAtIdx=11 bar before/after canvasTap=true/false
  walkModeAfterTap=false | AFTER ✈-RESUME bar=true walkMode=true paused=false panelPosKept=true
  | ✈-PAUSE bar=true paused=true | REVEAL bar=true walkModeStillRunning=true (discovery not broken)
```
**D1 and D3 are now CLOSED.** D2/D5/D6/D7 remain open in `§WATCHDOG-TOUR-SCRUB-2`.

**Two witness-quality defects found while verifying (both were in the harness, not the product):**
1. `W-SCRUB-PANEL-DRAG` measured its pose/cursor invariant ACROSS a `_scrubHide()`→`_scrubShow()`,
   and `_scrubShow` calls `tourTogglePause(false)` which revives the rAF chain — so frames landing in
   that window advanced the cursor legitimately. Flaky by construction: `0/0` on two runs,
   `poseDelta=0.26 cursorDelta=0.116` on a third. Now measured across the drag only.
2. `W-SCRUB-HOLD` asserted EXACT-zero pose drift, but the pose passes through `A.controls.update()`
   and `scene.js:130` sets `enableDamping=true`, so OrbitControls round-trips
   position→spherical→position every frame of its 3s rAF wait — not an identity (§WATCHDOG-2 Q1.2).
   **Verified pre-existing, NOT a regression, by direct experiment:** every run that built an
   `833.341719s` tour passed with `drift=0` (three runs, two of them on the NEW code), and the single
   failure came on the one run that built an `828.358772s` tour — a different pose at `T*0.42`, hence
   different float rounding. `4.44e-16 = 2^-51`, one double ULP. Tolerance is now `1e-9` m on the
   POSE ONLY; `cursorDrift` must still be exactly 0, and the raw number stays in the claim string.

**Also settled: `§SHORTCUT_AUDIT MISS action=xray key=Alt+Z` is an AUDIT BLIND SPOT, not a broken
shortcut.** User confirmed by hand 2026-07-25: *"while L paused, alt-z works."* The audit only walks
`scene.js`'s shortcut table, so `§KBD_ROUTE`-handled combos (Alt+Z, Alt+G, F11 — all observed firing
in live logs) read as missing. **Do NOT "fix" these four — fix the audit's coverage instead.** The
five `deadKeys=+,-,z,w,r` are a separate question and still unverified.

## §ABSTRACTION-AUDIT-2 — no hardcoded per-building logic, verified (2026-07-25)
User asked for a fresh check (independent of the original `§HL-FIRST` table above) that nothing
building-specific crept into `tour.js` / `room_graph.js` across today's work. Grepped both files for
every real building name (Clinic, Hospital, Terminal, LTU_AHouse, SampleCastle, HHS, Duplex) and for
any `if (buildingName === ...)`-shaped conditional. **Zero code branches on building identity.** Every
hit is a comment citing which building's real data a general fix was root-caused or verified against
(exit-node handling, stair-flight assembly merge, ambiguous-residual-rescue, rect-fallback doorways,
etc.) — the code itself only ever branches on measured geometry, never on which building it's looking
at. Do not re-run this audit from scratch next time; grep the same way and diff against this verdict.

## ▶ NEXT DEDICATED SESSION — pick up FINDING 4's parked metric question
**`FINDING 4` (§772 above, `§HALL-IS-A-CORRIDOR`) is the one genuinely open Clinic/Hospital topology
quirk** — not a bug, a parked design decision. Recap: on Hospital and Clinic, ranking candidate "main
hall" stops by rectangle AREA picks a long narrow corridor over a shorter but WIDER room (Hospital:
219m²/3.3m-wide corridor beats a 124m²/4.8m-wide room; Clinic: 125m²/3.2m-wide beats 53m²/5.6m-wide).
Terminal and HHS are unaffected (their area-winner is already the width-winner).
- **Candidates on the table, all scale-free, none building-specific:** `minDim` alone (Clinic's winner
  drops to 53m² — width without size), `minDim²` (biggest inscribed square — pure spaciousness),
  `area × minDim` (balances size and openness, penalises a long corridor by its own narrowness).
- **A hard width threshold (e.g. "≥6m counts as a hall") is explicitly REJECTED** — that is exactly the
  hardcoded custom case ruled out by `§ABSTRACTION-AUDIT-2` above and the original `§HL-FIRST` table.
  Do not introduce one even as a "just for now" measure.
- **Do not re-measure the metric until Hospital's connectivity lands** (`OCCUPANT_PATHFINDER.md`
  §GRAPH-FOUNDATION G1/G2) — Hospital's candidate pool today is 24 nodes, almost all `Hall/Corridor`,
  with the real 142 authored rooms displaced by the walker recompile; a metric change there would be
  tuned against corridors, not validated against a real hall. **Clinic has no such blocker** and is a
  clean, small, already-flying building — the cheaper place to prototype `minDim²` vs `area×minDim`
  first, then re-check against Hospital once G1/G2 land.
- Witness plan: same shape as the `§HL-FIRST` sweep — real graphs from real DBs, BEFORE/AFTER per
  candidate metric, independently recomputed in the harness (not read back from the engine's own log).

## ▶ §TOUR_HIGHLIGHT_LANE — WORKED TO ZERO 2026-07-26: T1 ✅ shipped, T2 ✅ + T3 ✅ closed no-change, T4 ⛔ G1
**Read this line before the four tasks below — they are ANSWERED, and their premises were partly wrong.**
- **T1 ✅** bim-ootb #1012 `§TOUR-POLYLINE` — the tour flies the A* on-floor polyline. Terminal 8/92 → 2/91
  illegal chords (186 → 18 samples), nothing worse anywhere, live-browser numbers identical to the harness.
- **T2 ✅ / T3 ✅** bim-ootb #1013 `W-TOUR-MAINHALL-SELECTION` — **no production change needed, measured on 7
  buildings.** Raw area already elects the real hall everywhere a real hall exists; the champion always
  survives selection. The defect FINDING 4 described was a PRE-raster artefact, fixed by #1006, not a
  ranking bug. Do NOT implement a new metric or a reserved slot without a fresh failing measurement.
- **T4 ⛔ still blocked, but its live BUG is fixed.** G1 investigated 2026-07-26: the `exit` node was a
  LIFT-door name filter, so Terminal's 5 "exits" were elevator doors — the tour's entrance was a lift, and
  `escapeRoute()` would have routed egress into one. **bim-ootb #1014 removed that source (45/45): Terminal's
  tour illegal chords 2/91 → 0/84, exits now 0 fleet-wide by design.** What remains for T4 is a REAL exit:
  measured exterior-door test, never envelope synthesis — `OCCUPANT_PATHFINDER.md §G1-EXIT-IS-A-LIFT-DOOR`
  + its dispatchable `§G1-EXTERIOR-DOOR-LANE` (raster coverage is the gating work).

## ▶ §TOUR_HIGHLIGHT_LANE — the parked metric gate is RELEASED; 4 bounded tasks, ordered (2026-07-26)
```
# ⚠ DO NOT REMOVE
SCOPE: user ask — "some buildings it still does not go for the highlights, ie largest hall first then
stairs as connected." The ORDER is not the bug: §HL-FIRST (#989) already sorts stops so the largest
space opens the tour and the largest higher-storey stop pulls the stair-climb in. What fails is the
CANDIDATE POOL and the FLOWN GEOMETRY. Work these four top-to-bottom; each is independently shippable
and each names its own gate. Do NOT re-litigate what §ABSTRACTION-AUDIT-2 and the §NEXT DEDICATED
SESSION block above already settled (no width thresholds, no per-building constants). Read the log
after every run; every claim needs a §-line.
```

### ⛔→✅ THE GATE THAT PARKED THIS IS NOW PARTLY RELEASED — read before re-reading FINDING 4
The block above says *"do not re-measure the metric until Hospital's connectivity lands
(`OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION G1/G2)"*. **G2 (walkable raster) landed 2026-07-26** —
`VIEWER_FIND_PANEL_ROOM_ACCURACY.md` §17, bim-ootb #1006-#1009, raster live on OCI and confirmed in a
real browser session. Measured on the served Hospital room set: deg-0 (unroutable) rooms **26 → 7**,
room-pair pathability **69.4% → 91.2%**, Hospital's DETOUR_FAIL sweep over 3023 pairs **63.3% → 0.0%**.
So the "candidate pool is all corridors, a metric tuned there would be tuned against corridors"
objection no longer holds the same way — Hospital is now a legitimate validation target, not just
Clinic. **G1 (`exits=0`) is still open** and still blocks the descent finale (task 4 below).
⚠ FIRST STEP of any metric work is therefore to RE-DUMP the candidate pool on Hospital and Clinic
(count, labels, area vs minDim winners) — the numbers in FINDING 4 predate the raster and must not be
carried forward as-is.

### Task 1 — ✅ DONE (witness) 2026-07-26 — feed the tour the FLOOR-HUGGING polyline it already has
`viewer/tour.js` contains **zero** references to `polyline` (verified `git show origin/main:viewer/tour.js
| grep -c polyline` = 0). It routes stop→stop with `RG.shortestPath()` (`tour.js:645-653`) and then
builds camera points from graph-node **centroids** (`tour.js:687-713`), discarding
`result.polyline` — the A*-verified, on-floor geometry the Find panel draws. That is exactly why
`§SCRUB_USAGE_HOSPITAL` recorded `illegalChords=14/81` (the tour flies through walls) while the same
building's Find route is clean.
- **Why now:** before #1006 the polyline was not trustworthy on Hospital (3 legs had no on-floor route
  at all). It is now: all 15 same-storey legs measure **0 illegal sample points**, and the polyline is
  built by the same `_astarHop` whose §ON-FLOOR-GUARANTEE returns null rather than a subtly-off line.
- **Task:** where a leg's `sp.polyline` exists, use its points for the flown path instead of the raw
  node centroids; keep centroids as the fallback when it is absent (rect-fallback buildings, or a leg
  A* declined). Do NOT change which stops are visited or their order.
- **Gate:** re-run the same `chordIllegalCount` sweep `tour.js:718-725` already performs and report
  illegal-chord ratio BEFORE/AFTER on Hospital + Terminal + Clinic. Expect Hospital's 14/81 to collapse.
  Also re-check `§SCRUB_PREPARE_STALL`'s timing — more points per leg is more `cinemaLookDist` work.

#### ✅ SHIPPED — bim-ootb `§TOUR-POLYLINE` (`viewer/tour.js`, `witness_tour_polyline_path.js`, 25/25 green)
`legSteps()` aligns `sp.polyline` back onto the leg's own anchors: a polyline point sitting on the next
anchor's measured position IS that anchor (keeps its guid → name/pause/stair-flight handling byte-for-byte
unchanged); every other point becomes an interior TURN point flown at that storey's floor z. No polyline
(rect-fallback, or A* declined) ⇒ anchors alone = exactly the old centroid path. `§TOUR_VERSION` v17→v18 and
`TOUR_CACHE_VER` v16→v17 bumped in lockstep (a cached v16 route would replay the OLD geometry forever).

**Measured (BEFORE = `git show origin/main:viewer/tour.js`, run in the same process against the same graph;
illegal chords recomputed INDEPENDENTLY by the witness from the returned `pts`, not read from tour.js's own
counter — the two agree exactly, which is itself the cross-check):**

| building | illegal chords | illegal samples | pts | polyLegs |
|---|---|---|---|---|
| Terminal | **8/92 → 2/91** | **186 → 18** | 113 → 112 | 2/15 |
| Hospital | 0/146 → 0/143 | 0 → 0 | 159 → 156 | 0/22 |
| Clinic | 0/55 → 0/55 | 0 → 0 | 62 → 62 | 3/7 |
| HHS | 0/68 → 0/62 | 0 → 0 | 80 → 74 | 0/13 |
| LTU_AHouse | 0/81 → 0/81 | 0 → 0 | 95 → 95 | 2/8 |

Stop set + order byte-identical on every building (`§HL-ORIGIN` re-asserted by the named-waypoint signature).

**Three findings that correct this Task's own premises — carry these forward, do not re-derive:**
1. **Hospital's `14/81` no longer exists.** Post-raster (#1006 patch applied) the centroid route already
   measures **0/146** illegal. The 14/81 in the scope block above was a PRE-raster live reading; the
   remaining wall-cutter in the fleet is **Terminal**, not Hospital.
2. **The polyline is NOT mostly extra turn points — it is anchor-dropping.** An independent 40-leg sweep
   per building found `trueInteriorPts` = 0 (Hospital), 3 (Terminal), 3 (Clinic) — the anchor chain
   (doors + spines + legalizer waypoints) is already so dense that each hop is LOS-direct and
   `_simplifyLOS` collapses to nothing. The whole gain comes from `§CIRC-NOT-A-WALKPOINT`: the polyline
   DROPS the synthetic `circ` centroid (it sits on a disconnected raster island), and it is the
   room→circ→room chord that cut the wall. Safe by construction — `g.nodes` carries **only** `kind='room'`
   (asserted in the witness), so a dropped `circ` can never be a dropped STOP.
3. **`§SCRUB_PREPARE_STALL` cannot worsen** — flown point count never GREW on any building (it fell on 3),
   and planning cost is unchanged by construction: `room_graph.js` already computed the polyline on every
   `shortestPath()` call before this change; the tour simply threw it away. Witness gates `ma.pts <= mb.pts`.

**Residual (named, not fixed here):** Terminal's remaining 2 chords are the SAME chord flown both ways —
entrance `exit` node ↔ room `⚠ Aras Tanah R18`, 15.7 m, 9 illegal samples. Log cause:
`§PATH_LEGAL_DETOUR_FAIL cause=ENDPOINT_OFF_FLOOR aWalkable=false` — the exit node itself (an
elevator-door opening) is OFF the walkable raster, so A* correctly DECLINES rather than draw a fake line
(`§ON-FLOOR-GUARANTEE`). That is exit-node placement = `OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION G1
territory, the same gate Task 4 waits on — not a tour defect.

**Live-browser confirmation (regime-gap guard, not a supplement to the maths):** real user path
(`A.toggleFlyAround()`, what the ✈ button calls) on the served viewer, §-log values only:
- **Terminal** — `§FLY_ROUTE … pts=112 illegalChords=2/91 polyPts=2 polyLegs=2/15`, i.e. **identical in every
  field to the headless harness's AFTER row**, walkMode=true, 49 actions. The harness regime IS the browser regime.
- **Clinic** — `pts=78 illegalChords=0/71 polyPts=3 polyLegs=2/7` (differs from the harness's 62/55 because the
  browser compiles its own room set on load), walkMode=true, 19 actions.
- Both logged `§TOUR_VERSION v18` and stored `§TOUR_CACHE … key=…:v17:…` — the cache bump landed, so no returning
  user replays the old centroid route.

### Task 2 — ✅ CLOSED (witness) 2026-07-26 — NO CHANGE NEEDED: raw area already elects the real hall
Candidates unchanged and still scale-free: `minDim`, `minDim²` (biggest inscribed square),
`area × minDim`. Current ranking is raw rect area (`tour.js:545-546`, `byArea[0]` at `:588`), which
ranks LENGTH — a 219m²×3.3m corridor beats a 124m²×4.8m room on Hospital.
- **Do the pool re-dump first** (see gate above), then A/B the three metrics on Hospital + Clinic +
  Terminal + HHS, reporting for each: which node wins, its area/minDim/label/storey, and whether the
  winner is a real hall or a corridor. `viewer/scene.js:946` already has an independent
  `SUM(size_x * size_y)` room-area ranking for the `R` shortcut — align with it or state why not.
- **Fence:** no width threshold, ever (`§ABSTRACTION-AUDIT-2`). No `size_z`/volume: `size_z` exists on
  `spatial_structure` but nothing in the fleet has been shown to populate it reliably — check before
  considering it, do not assume.

#### ✅ VERDICT — bim-ootb `witness_tour_mainhall_selection.js` (W-TOUR-MAINHALL-SELECTION, 22/22, PR #1013)
Pool re-dump done first, as the gate demanded. `area = Σ rect areas` (today), `minDim = max over rects of
min(w,h)` (the widest place an occupant can actually stand — scale-free, no threshold), `minDim²`,
`area × minDim`. Elected `mainHall` per metric, 7 buildings:

| building | area | minDim | minDim² | area×minDim |
|---|---|---|---|---|
| Hospital | R13 294m²/15.0m | R13 | R13 | R13 |
| Clinic | R20 323m²/17.2m | R20 | R20 | R20 |
| Terminal | R1 660m²/20.8m | R18 576m²/23.7m | R18 | R1 |
| HHS | Hall/Corridor 1 204m²/3.6m ⚠ | same ⚠ | same ⚠ | same ⚠ |
| LTU_AHouse | R5 564m²/16.4m | R126 276m²/16.6m | R126 | R5 |
| JKR | R1 72m²/8.0m (all four identical) | | | |
| Duplex | R1 43m²/6.0m (all four identical) | | | |

**Buildings where a metric change would swap a CORRIDOR for a real ROOM: 0.** HHS (the only ⚠) elects that
same corridor under EVERY metric — its federated model contains no room larger than 204 m², so this is a
DATA limit, not a ranking bug. Terminal/LTU swap between two REAL halls either way (660m² vs 576m²) — no
better answer, just a different one. **FINDING 4's premise is dead:** the "219m²×3.3m corridor beats a
124m²×4.8m room" case does not exist post-raster — Hospital's champion is now a real 294m²/15.0m room and
that corridor sits 3rd. Keep raw area. Changing it would be tuning with no defect to tune against, which
is exactly what `§ABSTRACTION-AUDIT-2` fences off. `scene.js:946`'s `SUM(size_x*size_y)` ranking is
consistent with this (both rank by plan area); no alignment change needed.

### Task 3 — ✅ CLOSED (witness) 2026-07-26 — NO CHANGE NEEDED: the champion already survives selection
`const K = storeys.length >= 4 ? 2 : storeys.length === 3 ? 3 : 4;` (`tour.js:512`) plus 3 corridors
per storey (`:549`) means on 7-storey Hospital the real hall competes for one of **two** slots on its
own floor — and loses to longer corridors under the current metric. §HL-FIRST can only reorder what
selection already admitted, which is why "largest first" can still miss the largest space.
- **Task:** pick the building's top-N by the Task-2 metric FIRST, mark them reserved, then fill the
  remaining per-storey budget as today. `HL_EXTRA = 1` (`:576`) stays the cap on how much of the tour is
  highlights — this changes WHICH stops exist, not how many beats they get.
- **Fence:** `§WATCHDOG-HL-FIRST` corollary — any change to `stops[]` must not silently relocate the
  walk's origin (`seqOriginGuid`, `:585`/`:643`). Re-assert `§HL-ORIGIN` in the witness.

#### ✅ VERDICT — same witness (PR #1013). The task's premise is FALSE; do not implement it.
`survivesSelection=YES` on all 7 buildings, under all 4 metrics: the pool champion is in `stops[]` AND is
what §HL-FIRST elects. Two structural reasons, both now ASSERTED in the witness rather than assumed:
1. **Rooms and corridors never compete.** `§R6-CORRIDOR-SPINE` gives corridors their OWN budget
   (`b.corridors.slice(0,3)`) BEFORE the `K` room picks — the task text ("the real hall competes for one of
   two slots and loses to longer corridors") misread the code. Measured: Hospital rooms=10/≤14,
   corridors=12/≤21 — two separate budgets.
2. **A storey's largest room is always pick #1 of K**, because `b.rooms` is sorted by area descending. The
   ONLY way a champion can be dropped is `§R6-TYPE-DEDUPE` — which fired **0 times across all 7 buildings**
   (every candidate is a `COMPILED` room, and the dedupe exempts those by design), or `§CONNECTED-STOPS`
   dropping an edge-less node, which is deliberate (an unroutable stop can't be flown to anyway).
**If this ever regresses** (a fleet with real IfcSpace names where dedupe drops a champion), the witness
fails with `survivesSelection=** NO **` — THAT is the moment to reserve the slot, not before.

### Task 4 — ⛔ BLOCKED (re-verified 2026-07-26): G1 exits still absent on 3 of 4 buildings
`common/room_graph.js` exports `escapeRoute()` (nearest EXIT by the same Dijkstra) and **no viewer file
calls it** (verified across `viewer/`, `common/`, `modeller/`: only `room_graph.js` itself and
`hallway_backbone.js` mention it). Hospital has `exits=0`, so there is no exit to route to yet — that
is `OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION G1, still open. Sequence: land G1 (real exit nodes), then
wire `escapeRoute()` as the tour's closing leg. Until G1, this task is BLOCKED and must not be faked
with "fly to the lowest storey's biggest door".

**Blocker re-measured 2026-07-26 (post-raster, patches applied):** `exit`-kind nodes per building —
**Hospital 0, Clinic 0, HHS 0, Terminal 5**. `RG.escapeRoute` is exported and callable; still zero viewer
callers.

**⛔ THE BLOCK IS WORSE THAN THIS TASK ASSUMED — and Terminal is NOT a usable partial trial. Full evidence:
`Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md §G1-EXIT-IS-A-LIFT-DOOR` (2026-07-26). Do not re-derive.**
- An `exit` node was produced by a **lift/elevator NAME filter** (`room_graph.js:107`
  `NON_ROOM_DOOR_NAMES`), not by any exterior-door test — no such test existed anywhere in the codebase.
  `exits=0` therefore meant "no door named like a lift", not "no way out".
- **Terminal's 5 exits were 5 ELEVATOR doors**, so the tour's `entrance` on Terminal (= lowest exit node) was a
  lift door. That was exactly Task 1's measured residual: the only 2 remaining wall-illegal chords were the legs
  to/from it, `cause=ENDPOINT_OFF_FLOOR` — a lift car is not walkable floor.
- ✅ **FIXED 2026-07-26, bim-ootb #1014** (watchdog split it out as an active-correctness fix, ahead of the rest
  of G1): E4 no longer creates exit nodes from that filter. **Terminal's tour `illegalChords` 2/91 → 0/84 —
  zero.** Routing graph byte-identical on all 7 buildings, visited stops unchanged. `§TOUR_VERSION v19`,
  `TOUR_CACHE_VER v18`, `room_graph.js?v=12`. ⚠ Terminal now logs `stairDown=-`: no descent finale, because it
  no longer has a lift door to misname as an entrance. **Do not "restore" the finale by relaxing the exit
  rule** — a real entrance comes back with the measured exterior test.
- **Direction settled (watchdog, 2026-07-26):** real IfcDoor-to-outside first, decided by a MEASURED side
  test (sample either side of the door against the walkable raster + footprint) — never envelope synthesis,
  which would be invented geometry that fails silently. Any narrow fallback must log as `§EXIT_SYNTH` so a
  witness can never mistake it for a measured exit.
- **Feasibility is proven, not assumed:** on HHS (full raster coverage) the side test yields **3 candidates
  of 133 doors**, the first a glass revolving-leaf entrance. On Hospital it yields 80–137 because 133 doors
  sit off-raster — so G1's true prerequisite is **raster coverage** (Clinic/Terminal/LTU ship no
  `storey_walkable_raster` table at all), plus a stricter side test.

### Out of scope for this lane (named so nobody re-discovers them)
- `Hospital_ARC` / `SampleCastle_extracted` fall back to the LEGACY Euclidean nearest-neighbour tour
  (no door legality at all, `visited 3/15` and `2/9`). No ordering or metric work will help them until
  their graphs pass `§MAJORITY-LEGAL`. Different lane.
- `§SCRUB_PREPARE_STALL` (1.67s hitch) and `§DLOD_ALL_BOXED` are pacing/render defects already specced
  above — Task 1 will interact with the former's timing, so re-measure it, but do not fix it here.

---

## ▶ §R5-A — port the graph-route tour into `deploy/dev` (SPEC, 2026-07-26; R5 finally gets one)
```
# ⚠ DO NOT REMOVE
SCOPE: R5 (line ~96 of this file) has only ever been a one-liner — "porting to deploy/dev is a separate
later task". Watchdog split it 2026-07-26 into A (code-only, no DB) and B (self-heal loader + raster
patches) and made A the highest-priority task, because deploy/dev is the surface the user TESTS and it
has none of the highlight stack. This is A's spec. deploy/dev ONLY — never deploy/live (PRIME RULE).
Read the log after every run; every claim needs a §-line.
```

### Why A is worth doing at all — the target is LIVE (verified, not assumed)
`deploy/dev/` maps to OCI bucket `sandbox/` (`deploy/OCI_UPLOAD.md` §RULES 5) and
`…/b/bim-ootb-live/o/sandbox/index.html` answers **200, 51106 B** (checked 2026-07-26). The GH-Pages
viewer (`red1oon.github.io/bim-ootb/viewer/viewer.html`, 200) is a SEPARATE, more advanced surface that
already has the whole stack. So this port is not busywork on a dead tree — but it is also not the only
place the feature exists, and the two must not be confused when reading a user report.

### Measured divergence (do not re-derive — this is what makes A a bounded task)
`deploy/dev` is an older fork of the same app, same `setupTour(A)` shape, same `APP` object:

| file | deploy/dev | bim-ootb viewer | note |
|---|---|---|---|
| `helpers.js` `A.dbQuery` | — | — | **byte-identical** (diffed) — the module contract the whole stack needs |
| `tour.js` | 994 lines | 1561 (v19) | ootb's `A.*` surface is a strict SUPERSET of dev's — no dev-only tour API to preserve |
| `navigate_find.js` | 1984 | 5252 | diverged beyond a copy — see scope call below |
| `effects.js` | 92 | 4070 | dev has no cinema stack; `tour.js` already guards `A.cinemaLookDist` absence |
| room stack | **absent** | `common/*.js` | `room_graph.js`, `hallway_backbone.js`, `storey_raster.js`, `room_habitability.js` |

**tour.js v19's ONLY external gaps in deploy/dev are `A.ensureRooms` and `A.getRoomGraph`** (measured:
every other `A.*` it touches is either self-defined or already present, incl. `markDirty`/`loadNavigate`
which live on `APP.` in dev's `main.js`).

### SCOPE CALL — navigate_find.js is NOT ported wholesale (deviation from the dispatch list, stated)
The watchdog's list named `viewer/navigate_find.js`. Measured, a wholesale port additionally needs five
externals dev does not have — `activeGuidFilter`, `filterByGuids`, `buildingName`, `_hbaTenancySpec`, and
`_applyPendingPatch` (which is **R5-B by this very split**). Those belong to the Find panel / HBA / lens
stack, none of which is on the path to "does Clinic show a highlight". So A ports the **two functions the
tour actually needs** (`ensureRooms`, `getRoomGraph`) as a small dedicated bridge, and leaves the Find
panel port as its own future task. If the intent was also to upgrade dev's Find panel, that is a separate
R5-C — say so and it gets its own spec; it is not folded in silently.

### The work
1. Copy flat into `deploy/dev/` (dev is a flat tree, no `common/`): `room_habitability.js`,
   `storey_raster.js`, `room_graph.js`, `hallway_backbone.js` — **verbatim from `bim-ootb/common/`**, no
   edits (they are already browser-IIFE-wrapped and `module.exports`-guarded, see
   [[feedback_browser_iife_wrap_engines]]).
2. Replace `deploy/dev/tour.js` with `bim-ootb/viewer/tour.js` v19 verbatim.
3. New `deploy/dev/room_graph_bridge.js`: `A.getRoomGraph()` (build once per `activeBuilding`, cache —
   same body as navigate_find's `_roomGraphFor`) and `A.ensureRooms()` (A-scope: report what exists; the
   patch/walker self-heal is B).
4. Wire `<script>` tags in `deploy/dev/index.html` in dependency order — habitability → raster →
   room_graph → hallway_backbone → bridge — BEFORE `tour.js`, each with a `?v=` and an `onerror` warn
   like every other tag there.
5. **Graceful degradation is the gate, not an afterthought:** no `storey_walkable_raster` table ⇒
   `room_graph` falls back to room rects (its own documented behaviour); no `spatial_structure` rooms ⇒
   the tour must log `§FLY_ROUTE_REJECT` and fall through to the LEGACY tour unchanged.

### Witness (W-R5A-DEV-GRAPH-TOUR) — what it must prove
Served from a local `deploy/dev` (the same way the OCI sandbox serves it), real user path (press ✈),
§-log values only:
- **Clinic** (ships native IfcSpaces, no patch needed): `§FLY_ROUTE` appears with `stops=N/N`, and the
  §HL-FIRST main hall is the measured area champion — this is the "does Clinic show a highlight" answer.
- **A building with no rooms**: `§FLY_ROUTE_REJECT` + the legacy tour still produces actions ⇒ the port
  cannot make an un-roomed building WORSE than before.
- **No page errors, no `§LOAD_FAIL`** from the new script tags.
Deploy only after that passes, via `deploy/OCI_UPLOAD.md` §RULES (every `oci os object put` carries
`--content-type application/javascript`), then fetch back and verify.

### ✅ §R5-A SHIPPED to the repo 2026-07-26 — W-R5A-DEV-GRAPH-TOUR 10/10 (`deploy/dev/tests/`)
Ported verbatim from bim-ootb **`origin/main`**: `room_habitability.js`, `storey_raster.js`,
`room_graph.js`, `hallway_backbone.js`, `viewer/tour.js` v19 → flat into `deploy/dev/`, plus
`room_graph_bridge.js` (the two externals: `getRoomGraph`, `ensureRooms`). Script tags wired in
dependency order in `index.html`; `setupRoomGraphBridge` called through a `typeof` guard in `main.js`
(a bare identifier in the `_mods` array would ReferenceError the whole viewer down if the script ever
failed to load — the opposite of this port's contract).

**Measured, real user path (press ✈), §-log values only:**
- **Clinic** — `§FLY_ROUTE storeys=3 stops=7/7 skipped=0 illegalChords=0/55 polyPts=3 polyLegs=3/7`
  and **`§FLY_HL_FIRST mainHall="≈ First Floor R20" area=323.4 storey=First Floor ascent="≈ Second
  Floor R22"`**. Highlight-first ordering is now visible in dev, and the elected hall is the same
  323 m² champion §TOUR_HIGHLIGHT_LANE T2 measured independently. **That is the "does Clinic show a
  highlight" question, answered.**
- **SampleHouse** (ships zero rooms) — degrades to the LEGACY tour, `actions=7`. The port cannot make
  an un-roomed building worse; `§R5A_ENSURE_ROOMS … rooms=0 … selfHeal=none(R5-B)` says why, plainly.
- Both: all four modules + bridge loaded, no `§LOAD_FAIL`, no `§R5A_BRIDGE_ABSENT`, no page error.

**Two fixture facts, measured — do not re-derive, and do not "fix" the witness by pointing it at the
local copy:**
1. **The room-bearing DBs are LOCAL — `~/bim-ootb/buildings/` — and OCI must never be fetched for them**
   (user, 2026-07-26: *"instead of going to OCI, why not here locally? All source DBs lie here. But u
   usually lost track."*). Measured: `~/bim-ootb/buildings/Clinic_extracted.db` = **118 rooms** (identical
   to what OCI serves); `deploy/buildings/` = the PRE-room extraction, no `spatial_structure` at all;
   `deploy/dev/buildings/` = a stale mirror, sometimes a 0-byte stub. Same for Hospital (142), Terminal
   (53), LTU (369). The witness now **symlinks the local room-bearing DB into the served tree per run and
   removes it after** — no OCI, no hand-made fixture, repo tree left as found. Full map + the rule:
   memory `project_db_snapshot_divergence_landmine` (2026-07-26 section).
2. The first port copied from `~/bim-ootb`'s **main checkout, 38 commits behind**, and silently
   produced a pre-v19 `tour.js` with no `§HL-FIRST` — the witness caught it (`§FLY_ROUTE` present,
   `§FLY_HL_FIRST` absent), re-copied from `origin/main`, green. **PROGRESS.md's "never measure from
   that checkout" applies to COPYING from it too.**

### ⛔ §R5-A DEPLOY LEG — NOT uploaded, and this is a user decision, not an oversight
`OCI_UPLOAD.md` §RULES 1 ("NEVER upload without first downloading and diffing the target") was run
first, and it stopped the upload for a real reason. Measured 2026-07-26:

| object | size | last-modified | script versions |
|---|---|---|---|
| **live** `bim-ootb-live/o/sandbox/index.html` | 51,106 B | **2026-05-19** (68 days stale) | `tour.js?v=3`, `main.js?v=27` |
| local `deploy/dev/index.html` | 55,692 B | today | `tour.js?v=4`, `main.js?v=36` |
| local `deploy/live/index.html` | 41,624 B | 2026-05-09 | — |

The live object matches **neither** local tree — 599 diff lines vs `deploy/dev`, 293 vs `deploy/live`.
So uploading `deploy/dev/index.html` would not "add five script tags": it would replace a two-month-old
divergent snapshot with 68 days of accumulated unrelated change, on a live outward-facing surface, in
one shot. That is beyond what §R5-A authorises and beyond what a witness on R5-A alone can vouch for.
**✅ RESOLVED 2026-07-26 — no question pending. User directive: the sandbox is LOCAL.** *"Instead of
going to OCI, why not here locally? All source DBs lie here."* So: the OCI `sandbox/` object stays
FROZEN, `deploy/dev` served from localhost IS the sandbox, and building DBs resolve from
`~/bim-ootb/buildings/` (the room-bearing copies — see the fixture rule above). **Do not re-open this
as "should we deploy R5-A to OCI?"** — the answer is no, and the 68-day divergence is a property of an
object nobody is maintaining, not a task. If OCI code deploy is ever revived it is its OWN job with its
own before/after verification, unrelated to R5-A.

---

## ▶ §STAKEHOLDER_STROLL — the tour's PURPOSE, restated by the user, and the 5 tasks it implies (2026-07-26)
```
# ⚠ DO NOT REMOVE
SCOPE: user directive, 2026-07-26 — "a highlight is a nice stroll into the building taking note of
scenic views. That is purpose of architecture, for humans to appreciate. We can ignore going into all
small rooms - just a selection or a checklist as this is a STAKEHOLDER's tour." Plus: use lifts when
they are the only storey connector, mix lift+stairs whichever is graceful, show the lift structure,
and soften the hard jerks. This SUPERSEDES §R6-BUDGET's per-storey coverage model (user's call, not a
re-litigation). Work S1→S5 in order; each is independently shippable and names its own gate.
Read the log after every run; every claim needs a §-line.
```

### The doctrine, in one line
**The tour is a stroll, not a survey.** Coverage is not the goal and never was: a 7-storey Hospital
producing 22 stops and climbing every stairwell is a survey. A stakeholder wants arrival, the main
hall, a few scenic moments, one honest vertical move, and out.

### S1 — §R5-B: port the room injector, so un-roomed buildings can be strolled at all
Today `deploy/dev`'s `ensureRooms` REPORTS only (`selfHeal=none(R5-B)`), so SampleHouse and every
un-roomed building falls to the legacy tour. Port `_applyPendingPatch` + the lazy `lib/room_walker.js`
walk + IDB persist from bim-ootb's `navigate_find.js` into `room_graph_bridge.js`.
- **Gate 1:** SampleHouse goes legacy → `§FLY_ROUTE` with rooms>0.
- **Gate 2:** Clinic's 10/10 stays green.
- **Gate 3 — THE ONE THAT TESTS THE FIX THIS PORT SHIPS (added 2026-07-26 after review: the first two
  gates would not catch a regression of the very bug S1 promises to fix).** Run the injector against
  `deploy/buildings/Duplex_extracted.db` and assert **all 21 authored IfcSpaces survive by name**:
  `A101, A102, A103, A104, A105, A201, …`, each keeping its real IFC guid (`0BTBFw6f90Nf…`), and
  assert **zero** of them are replaced by an `RM_*`/`≈ Level N Rk` row. FAIL = the clobber is back.
- **⚠ The measured basis for that gate — worse than the one-liner in PROGRESS.md said:**
  `deploy/buildings/Duplex_extracted.db` (compiler extraction) has **21 authored IfcSpaces with real
  names and real guids**; `~/bim-ootb/buildings/Duplex_extracted.db` (the viewer copy the injector has
  run against) has **5 rooms, ALL `RM_*` guids, ALL named `≈ Level 1 R1`-style — zero authored names
  survive**. So it is not merely a renaming: 21 authored spaces became 5 compiled ones.
  **Honest limit:** file-comparison alone does NOT prove the injector caused it (these could be two
  different extraction runs — see `project_db_snapshot_divergence_landmine`, which records Duplex as
  the fleet's inverted case). Gate 3 settles it either way by running the injector on the 21-room DB
  and measuring before/after, instead of arguing from archaeology.

#### ✅ S1 SHIPPED 2026-07-26 — W-S1-ROOM-INJECTOR **28/28** (`deploy/dev/tests/witness_s1_room_injector.js`)
Ported from bim-ootb **`origin/main`** (never the local checkout — 41 commits behind at port time;
§R5-A already got burned once by exactly that): `viewer/lib/room_walker.js` → `deploy/dev/lib/`
**verbatim** (diffed byte-for-byte), and `navigate_find.js`'s `_ensureRoomsCore()` → the `ensureRooms`
body in `deploy/dev/room_graph_bridge.js` (v1→v2, `index.html` `?v=` bumped). That one function carries
the whole R5-B payload: patch source → walker → `rooms_meta` stamp → IDB persist, plus the
`§PATCH-FRAME-GUARD` and `§ROOM_WALKER_VERSION_STAMP` guards. §-lines renamed `§R5A_*` → `§S1_*`.

- **Gate 1 — SampleHouse (ships zero rooms, no `spatial_structure` table at all): PASS.**
  `§S1_ENSURE_ROOMS … rooms=0 state=zero` → `§S1_INJECT source=walker rooms=3 rects=3` →
  `§S1_STAMP version=v3` → `§S1_PERSIST idb=ok bytes=1183744` → `§FLY_INJECT status=injected` →
  **`§FLY_ROUTE storeys=1 stops=3/3 skipped=0 illegalChords=0/6`**. It flies the GRAPH route now,
  not the legacy one. That is S1's purpose, met.
- **Gate 2 — Clinic 10/10: PASS**, the §R5-A witness re-run as a child process (its checks, not a
  re-implementation). `§FLY_ROUTE storeys=3 stops=7/7` unchanged. **One of its ten checks was
  RETARGETED, stated not hidden:** G4 asserted the literal `selfHeal=none(R5-B)`, the placeholder
  §R5-A shipped while the injector was unported — false BY DESIGN once S1 lands. It now asserts the
  bridge still logs its state classification. Ten checks in, ten out; the reason is in both headers.
- **Gate 3 — Duplex's 21 authored IfcSpaces: PASS, at two depths.**
  - **G3a (the state machine, in-browser, `{force:true}` — the harshest call the UI can make):**
    `§S1_ENSURE_ROOMS rooms=21 compiled=0 state=none` → `§S1_AUTHORED_KEEP authored=21/21`, and
    `§S1_INJECT` **absent** — the walker is never invoked. All 21 survive by name AND guid, `A101…A205`
    with their real `0BTBFw6f90Nf…` guids, zero `RM_*`/`≈ Level N Rk` replacements. The `state==='none'`
    branch returns ABOVE the force check; that single line is what the gate holds up.
  - **G3b (defence in depth, node-side): `RoomWalker.walk()` called DIRECTLY on the 21-room db,
    state machine bypassed — all 21 authored rows STILL survive** (21 authored + 0 compiled → 21
    authored + 11 compiled rect rows; additive, nothing deleted or renamed).
- **⚠ This SETTLES the spec's own "honest limit" above — and the archaeology answer is: the injector
  did NOT cause it.** At `ROOM_WALKER_V` v3 neither layer is destructive to authored rooms. So
  `~/bim-ootb/buildings/Duplex_extracted.db`'s 5 `RM_*` rooms with zero authored names came from
  something else — a different extraction run, or an older walker — **not from this code path**.
  `project_db_snapshot_divergence_landmine`'s "Duplex is the fleet's inverted case" stands; the
  suspicion that the injector clobbers it does not.
- **⚠ ONE REAL BEHAVIOUR CHANGE — Clinic's elected main hall moved, 323.4 m² → 111.2 m².** Not a
  regression, and now not an unbacked claim either (see the watchdog note below). Gate **G2b** asserts
  the mechanism and prints every figure, so all of it is in the saved log:
  `§S1_ENSURE_ROOMS rooms=118 compiled=118 state=recompute` → `§S1_VERSION_STALE stored=null
  current=v3` → `§S1_INJECT source=walker rooms=207 rects=304` → `§FLY_ROUTE storeys=3 stops=7/7` →
  `§FLY_HL_FIRST mainHall="≈ First Floor R48" area=111.2`. Cause: Clinic ships **118 compiled (`RM_*`)
  rooms with NO `rooms_meta` row**, so the fleet-wide version-stamp check calls them stale and
  recompiles to **207 rooms / 304 rects**. The route is unharmed (`stops=7/7`, highlight-first intact)
  and this is the ported bim-ootb self-heal working as designed ("the inject mechanism exists to cure
  poor data"), so it is NOT reverted here.
  **Provenance of the two numbers, stated because they do not come from the same place:** 111.2 is
  measured by G2b in this run; **323.4 is quoted from §R5-A's own record above** (`mainHall="≈ First
  Floor R20" area=323.4`), taken when `ensureRooms` was still report-only and the shipped 118-room set
  was therefore used as-is. It has NOT been re-measured, and cannot be without reverting the injector.
  This **directly touches §CINEMA_HALL_CANDIDATE's parked 323 m² open question**: that hall is a
  pre-v3 artifact of the shipped 118-room set, so the graph session must re-read it against the v3
  207-room set rather than the earlier figure.
- **⚠ WATCHDOG CORRECTION, 2026-07-26 — recorded because the process failure is the lesson, not the
  numbers.** S1's first report cited the Clinic figures (118→207, 323.4→111.2) from a scratchpad probe
  and terminal output. They were correct, but **no saved log carried them**: the witness's G2 echoed
  only the child process's last 3 stdout lines, dropping every Clinic §-line the child printed. Under
  this project's Log Mandate ("no log line = not done"; an exit code is not evidence) that is not a
  backed claim, however true it happens to be. Two fixes, both in
  `deploy/dev/tests/witness_s1_room_injector.js`: (1) **G2b** — a Clinic gate that measures
  before/after and asserts the mechanism (all-compiled set ⇒ no `rooms_meta` ⇒ `§S1_VERSION_STALE
  stored=null` ⇒ a larger recompiled set ⇒ a hall still elected with a measured area), printing the
  exact counts/areas rather than hardcoding them, so a legitimate walker improvement cannot fail the
  gate; (2) G2 now echoes the child's **full** stdout. Witness went 21/21 → **28/28**.

### S2 — lifts as real vertical connectors (measured basis, zero invention)
`IfcTransportElement` = **0 rows fleet-wide** — there is no lift ELEMENT to read. But the lift DOORS
are real, and they group: **Terminal's 5 lift-named doors cluster to ONE shaft (x,y within 2 m)
spanning all 5 storeys, Aras Tanah → Aras 04.** That is a measured vertical connector. (Hospital,
Clinic, LTU: 0 lift doors — so this is Terminal-only in today's fleet, and that limit gets stated, not
papered over.)
- **Build:** `liftwp` nodes per storey at the shaft, edges between consecutive storeys — same shape as
  `stairwp` lo/hi, weighted as a RIDE (near-zero horizontal effort) not a climb.
- **Choice rule, per the user — expressed as EDGE WEIGHT, not a storey threshold.** The user's intent
  ("stairs if short, lift if it'd be ridiculous to climb") falls out of the graph's own weights with no
  constant to tune: a stair edge costs per-storey CLIMB effort, a lift edge costs a near-fixed WAIT +
  RIDE. Dijkstra then picks stairs for one storey and the lift for many, automatically, on every
  building — which is what `§ABSTRACTION-AUDIT-2`'s no-threshold fence demands.
  - **Hard rule (not a preference):** the lift is used when **no stair connects that storey pair at
    all** — that is a reachability fact, not a cost comparison.
  - ⚠ **CONFIDENCE TAG (added 2026-07-26 after review — the earlier draft stated "lift when the climb
    is ≥3 storeys" with no basis, dressed identically to the measured claims around it):** the 3 was a
    **convention-prior, not measured**, and is therefore REMOVED as a rule. If the weight formulation
    proves insufficient in measurement, any storey count reintroduced must be labelled a
    convention-prior explicitly and justified against real climb/effort data, never smuggled in.
  - The two weights themselves (climb-per-storey, wait+ride) are also priors until measured — state
    them as such in the code comment, and report the elected connector per storey pair in the §-log so
    the choice is auditable rather than asserted.
- **"Show the lift structure":** the beat is lobby → shaft axis → arrival, so the shaft reads as
  architecture, not a teleport.
- **Gate:** Terminal routes storey pairs its stair graph cannot serve; no building loses a stair route
  it already had; `§LIFT_SHAFT storeys=N doors=M` logged per shaft.
- **Fence:** a shaft exists only where lift-named doors exist on ≥2 storeys. Never synthesise one.
- **Gate (not a comment — added 2026-07-26 after review, since a prose "don't regress #1014" is weaker
  than something that fails):** S2's witness must ASSERT that lift-named doors produce `liftwp` nodes
  and **zero `exit` nodes**, on every building — i.e. re-run `witness_exit_not_a_lift.js` (45/45)
  unchanged as part of S2's own suite. A lift becoming an "exit" again must turn a run RED, not rely
  on a reader noticing.

#### ✅ S2 SHIPPED 2026-07-26 — W-S2-LIFT-SHAFT **31/31** (`deploy/dev/tests/witness_s2_lift_shaft.js`)
`deploy/dev/room_graph.js` `§LIFT-SHAFT`. **Measured basis RE-VERIFIED across 6 fleet DBs, not quoted:**
`IfcTransportElement` = **0 on every building** — no lift ELEMENT exists to read. Terminal: **5
lift-named doors, x=693.36 on all five, y-spread 0.19 m**, z 15.91→35.91, Aras Tanah→Aras 04 = ONE
shaft over 5 storeys. Hospital / Clinic / LTU_AHouse / HHS / JKR: **0 lift doors** — Terminal-only in
today's fleet, stated not papered over; every other building no-ops.

Built: one `liftwp` node per served storey at the shaft's real measured door position (carrying
`storey` — the §PATH_LEGAL_STAIRWP_STOREY bug is that a waypoint without it makes `_legalizePath`
skip legality-testing on every chord touching it), an `E11` boarding edge into each storey's
circulation so the shaft is never an island, and `E10` ride edges. Door names come from the existing
`isRoomDoor()`/`NON_ROOM_DOOR_NAMES` predicate — the same doors #1014 stopped turning into `exit`
nodes; they now become what they physically are.

- **Fence holds:** a shaft requires lift doors on **≥2 distinct storeys**; below that,
  `§LIFT_SHAFT_REJECT` and nothing is synthesised. Verified on 3 zero-lift buildings.
- **Nothing else moved:** E3 stair counts identical pre/post on all four (4/6/2/5), and E1/E2/E5-E9
  counts identical too; node counts byte-identical on the zero-lift buildings (645/414/1055).
- **⚠ A MODELLING ERROR I SHIPPED FIRST AND THE NUMBERS CAUGHT.** The first cut used
  CONSECUTIVE-storey ride edges, so a Tanah→Aras 04 journey paid **four** waits —
  `13.02+12.58+12.59+12.69 = 50.88` against the chained stair path's `6.79+3.86+3.96+4.60 = 19.21`,
  so the lift lost every journey on the only building that has one, the exact inverse of "lift if
  it'd be ridiculous to climb". A real lift is boarded ONCE. Ride edges are now **all-pairs with a
  single WAIT**; the per-floor `liftwp` nodes still exist, so this is boarding once, not a teleport.
- **The choice is EDGE WEIGHT, never a storey threshold — worked numbers QUOTED FROM THE LOG**
  (`§LIFT_CONNECTOR`, Terminal; all 10 storey pairs are printed every run):
  `Aras Tanah -> Aras 01  dz=6.79  wLift=13.02  wStair=6.79 → STAIR(cheaper)` ·
  `Aras Tanah -> Aras 04  dz=19.22  wLift=14.88  wStair=NO-DIRECT-STAIR → LIFT`.
  Measured split: **4 pairs elect STAIR, 6 elect LIFT.**
  **⚠ WATCHDOG CORRECTION, 2026-07-26 — three disagreeing tellings of this one example.** The first
  report, the code comment and the actual log each carried DIFFERENT worked numbers (`3.9 m / 12.6`,
  `20.2 m / 15.0 / 19.2`, and the real `6.79 / 13.02`). The arithmetic was self-consistent in each
  case — `12 + 0.15·d` — but two of the three were ILLUSTRATIVE figures computed by hand from the
  constants and matched no run. Worse, the witness was only printing two sample `§LIFT_CONNECTOR`
  lines, so the full table was not in the saved log to quote from. Both fixed: the witness now prints
  every connector line, and every number here and in the code comment is quoted from it. Same class
  of failure as the S1 Clinic figures — hand-computed illustration presented in the same voice as
  measurement.
- **⚠ CONFIDENCE TAGS:** `LIFT_WAIT=12`, `LIFT_RIDE_PER_M=0.15` and the 2 m shaft-grouping distance
  are **convention-priors, NOT measured**, tagged as such in code and in `§LIFT_SHAFTS` every run.
  Their crossover lands near 3-4 storeys on Terminal's 4 m floors — **that is a CONSEQUENCE of two
  priors and is NOT evidence for the "≥3 storeys" rule this spec deleted as unbased.** Do not cite it
  as such. If measurement contradicts them, change the weights, not the shape.
- **⚠ DEVIATION FROM THE STATED GATE, substituted openly.** The gate said re-run
  `witness_exit_not_a_lift.js` (45/45) **unchanged**. That witness lives in **bim-ootb** (repo root,
  `origin/main`) and exercises **bim-ootb's `common/room_graph.js`** — it would pass or fail
  identically whether or not this change exists, because this change is in bim-compiler's
  `deploy/dev` copy. Running it would be evidence about the wrong tree. Its load-bearing assertion is
  reproduced as **G3 here, on the tree S2 modifies**: zero `exit` nodes, all four buildings.
- **⚠ FORK CREATED — someone must port this back.** `deploy/dev/room_graph.js` was **byte-identical**
  to `bim-ootb origin/main`'s `common/room_graph.js` before this edit (diffed). S2 forks it. Unlike
  S3 (tour-local), this is shared engine code.
- **✅ S3↔S2 INTERACTION CHECKED, as S3's sequencing note requires — and it did NOT materialise.**
  W-S3-SCENE-BUDGET re-run with lifts present: **28/28, and every building's elected scene list is
  identical** to the pre-S2 run — Hospital `18→7 hall,ascent,spine,spine,scenic×3` storeysVisited=3;
  Terminal `15→8 hall,ascent,spine×3,scenic×3` storeysVisited=3; Clinic `7→6 hall,ascent,spine,
  scenic×3` storeysVisited=2. Terminal's pool is 50 candidates before AND after: the shaft adds
  vertical connectivity between `circ` nodes, but every room it reaches was already edge-connected
  via stairs, so no room became newly ELIGIBLE. The spec predicted this might change the scene set;
  measured, it does not. Checked rather than assumed — which was the point of the note.

### S3 — a scene budget, not a per-storey budget (this is the "ignore small rooms" ask)
Replace `K = storeys>=4 ? 2 : …` per storey with a WHOLE-BUILDING checklist of scenes:
`arrival → main hall → one ascent highlight → 2-3 scenic stops → finale`, capped ~8-10 stops
**regardless of storey count**. Storeys stop being the iteration unit; scenes are.
- **Gate:** Hospital **22 stops → ≤10**, main hall still first (`§HL-FIRST` + `§HL-ORIGIN` re-asserted);
  Clinic (7 stops today) stays a coherent stroll; no building's stop list becomes empty.
- Small rooms are simply not scenes. The type-dedupe (`§R6-TYPE-DEDUPE`) stays but stops being the
  main filter — the scene checklist is.

#### ✅ S3 SHIPPED 2026-07-26 — W-S3-SCENE-BUDGET **28/28** (`deploy/dev/tests/witness_s3_scene_budget.js`)
`deploy/dev/tour.js`: the per-storey budget (`K = storeys>=4 ? 2 : storeys===3 ? 3 : 4` rooms + up to
3 corridors, **per storey**, unbounded in storey count) is replaced by a whole-building scene
checklist — `§R6-SCENE-BUDGET`. Storeys are no longer the iteration unit; scenes are. Election order:
**hall** (largest measured space building-wide, elected first so a floor sweep can never budget it
out) → **ascent** (largest space on a storey whose measured mean z is above the hall's — the same
two-means comparison §HL-FIRST already uses, no metre threshold) → **spine** (≤3 corridor-class
cruise stops, reserved BEFORE the scenic fill because a pure area ranking loses corridors to rooms on
every building measured) → **scenic** (≤3, largest measured first, type-dedupe still on but no longer
the main filter) → never-empty fallback.

**Measured, same fixture, before AND after in one run (G0 — the baseline is measured, not quoted):**

| building | pre-S3 stops | post-S3 stops | roles elected | storeysVisited | main hall (unchanged) |
|---|---|---|---|---|---|
| Hospital (7 storeys) | **18** | **7** | hall,ascent,spine×2,scenic×3 | 3 | `⚠ Level 1 R14` 315.7 m² |
| Terminal (6 storeys) | **15** | **8** | hall,ascent,spine×3,scenic×3 | 3 | `⚠ Aras 01 R1` 660.0 m² |
| Clinic (3 storeys) | **7** | **6** | hall,ascent,spine,scenic×3 | 2 | `≈ First Floor R48` 111.2 m² |

- **SELECTION changed, ORDER did not.** §HL-FIRST still reorders and still re-derives the hall as the
  largest of `stops`; because S3 always elects that same node, every field of every building's
  `§FLY_HL_FIRST` line is identical before and after — `mainHall`, `area`, `storey`, `ascent`,
  `extras`, `suspectOpenAdmitted` — **except `stops=`, which is precisely what S3 changes.** (The
  commit message and the first report said "byte-identical", which is not literally true for that one
  field; corrected here, since this file is what a later session reads.) §HL-ORIGIN, the A* on-floor
  polyline and the exit rule are untouched.
- **⚠ THE SPEC'S "Hospital 22 stops" IS NOT REPRODUCIBLE — measured pre-S3 baseline is 18**, and the
  cause is known, not hand-waved: Hospital is **142 IfcSpaces, ALL `RM_`, with no `rooms_meta`**, so
  S1's version-stamp check recompiles it exactly as it does Clinic. The 22 was measured PRE-S1; this
  baseline is post-S1/pre-S3. **This is the S3↔S1 interaction, arriving one lane earlier than the
  spec's predicted S3↔S2 one.** The gate's substance is unaffected (a 7-storey survey gets trimmed),
  but the number 22 should not be re-quoted — use 18, or re-measure.
- **⚠ CONFIDENCE TAGS, stated because §STAKEHOLDER_STROLL S2 demands it of its own numbers:**
  `SCENE_BUDGET=10` is a **convention-prior, not measured** (the spec's own "capped ~8-10", taken at
  the ceiling) and is a **CEILING, not a target** — see the correction below. `SPINE_MAX=3` is
  §R6-CORRIDOR-SPINE's existing 3, only re-scoped from per-storey to per-building. `SCENIC_MAX=3` is
  the checklist's own "2-3 scenic stops". All three are reported in `§FLY_SCENE_BUDGET` every run.
  **"Scenic" is NOT scored here** — that is S4's glazing metric; until it lands, scenic == largest
  measured space, the same EXTRACT-ONLY area ranking this file already used. No new invention.
- **"arrival" and "finale" get NO new machinery, deliberately.** Exits are 0 fleet-wide by design
  (#1014: the old `exit` node was a lift-door name filter), so §HL-ORIGIN already starts the walk low
  and the last elected scene IS the finale. Inventing either beat without a MEASURED exterior door is
  what the exit rule forbids; `§G1-EXTERIOR-DOOR-LANE` improves both WHEN it lands.
- **⚠ SELF-CORRECTION, recorded because the witness initially passed the bug.** The first cut treated
  the budget as a TARGET: every building filled to exactly 10, taking **Clinic 7 → 10** — inflating a
  building that was already a stroll, the mirror image of the survey S3 exists to trim. It passed a
  "≤10 and non-empty" check, which structurally cannot see inflation. Fixes: `SCENIC_MAX` bounds the
  fill so the checklist (not the ceiling) sizes the tour; **every** case now measures its own pre-S3
  baseline (not just Hospital); and new **G5 asserts post-S3 stops ≤ pre-S3 stops on every building**.
- **⚠ A TRAP REMOVED FROM THE WITNESS ITSELF:** it first resolved the baseline as
  `HEAD:deploy/dev/tour.js`, which becomes the POST-S3 file the moment S3 is committed — before would
  equal after, G5 would pass trivially, G1's trim check would never fire, and the comparison would go
  green while testing nothing. It now walks `tour.js`'s history and takes the newest revision lacking
  the `§R6-SCENE-BUDGET` marker (resolved this run: `cfc713575`), which is correct at any future date.

#### ⚠ S3 REGRESSION FOUND AND FIXED 2026-07-26 — §SCENE-COMPONENT (W-S3-SCENE-BUDGET **55/55**, 5 buildings)
**The user asked whether the witnesses covered LTU and JKR. They did not — and JKR was carrying a
shipped S3 regression.** S3's original witness gated 3 buildings (Hospital/Clinic/Terminal); S2's
gated 4 (adding LTU_AHouse); **JKR was in neither**, despite being a real local fixture. It is also
the fleet's UNSEEN-CONVENTION case — 21 storeys, 7 disciplines (ARC/PLB/MEP/STR/ACMV/FP/ELEC),
different authoring firm and naming prefix — i.e. the only fixture that tests generalisation past
our own modelling habits rather than just past our own buildings.

**The regression (shipped in `6e8ff5a46`, fixed here):** JKR routed BEFORE S3 (`§FLY_ROUTE stops=4/5
pts=28`) and REJECTED after it (`§FLY_ROUTE_REJECT reason=thin-path pts=1` → silent fall to the
LEGACY tour). Strictly worse than pre-S3.

**Root cause, measured:** JKR's graph has **75 components**. Its two largest rooms — **72.2 m² and
62.4 m²** — each sit ALONE on an island (component sizes 2 and 1), while the real strollable body is
one 70-node component. S3's whole-building area ranking assumed the building is a single walkable
body, so it elected four mutually-unreachable scenes and every leg failed. **`§CONNECTED-STOPS`
cannot catch this** — it drops nodes with ZERO edges, and a two-node island has an edge.

**Fix — `§SCENE-COMPONENT`:** elect scenes from ONE component, the one carrying the most candidates
(the building's real walkable body; ties broken by total measured area). A reachability fact, the
same character as §CONNECTED-STOPS — not a new tuned constant. It refines the main hall from
"largest space in the building" to "largest space you can actually walk to", which is the correct
reading: a hall no occupant can reach is not a tour stop. §HL-FIRST re-derives the hall from `stops`,
so the two stay consistent by construction.

| building | comps | candidates kept | dropped | stops | main hall |
|---|---|---|---|---|---|
| Terminal | 1 | 50/50 | 0 | 15→8 | `⚠ Aras 01 R1` 660.0 — **unchanged** |
| Hospital | 8 | 154/168 | 14 | 18→7 | `⚠ Level 1 R14` 315.7 — **unchanged** |
| Clinic | 7 | 172/199 | 27 | 7→6 | `≈ First Floor R48` 111.2 — **unchanged** |
| LTU_AHouse | 5 | 354/373 | 19 | 15→7 | `⚠ VÅNING 4 R2` 1254.7 — **unchanged** |
| JKR | 2 | 45/46 | 1 | 5→**4, ROUTED again** | `≈ 03 …R1` 83.0 → **`≈ 02 Aras Dua R15` 27.9** |

- **Only JKR's hall moved**, and that IS the fix working: the 83.0 m² room was on the island. The four
  previously-green buildings keep byte-identical halls, so the component filter is not a silent
  re-election everywhere.
- **⚠ NEW GATE G6 — "a graph route that existed pre-S3 must still exist post-S3."** This is the second
  time a COUNT-based check proved structurally blind (the first was the Clinic 7→10 inflation that
  "≤10 and non-empty" passed). When a route dies the stop count simply goes absent and every
  count gate still passes; the assertion has to be on the ROUTE's existence, per building.
- **Honest limits on the two new fixtures, stated not buried:** JKR now strolls 4 stops on **1 storey**
  with `ascent=-` — it routes, but it is a thin stroll, because its walkable body is largely one
  floor. LTU_AHouse also reports `ascent=-`: its hall is already on the top storey (VÅNING 4), so no
  candidate sits above it. Both are data facts, not failures — and both would be worth revisiting if
  S4's glazing metric changes which rooms are eligible.

### S4 — "scenic" is measurable, so measure it (don't hand-pick)
Glazing is present fleet-wide: **windows** Terminal 236, Hospital 131, Clinic 58, LTU 976; **curtain
wall** Hospital 178, Clinic 31. Score a room by the fraction of its boundary carrying glazing (window
+ curtain-wall elements whose position lies on the room's rect edge), and prefer high storeys for the
view beat. Scale-free ratio, no per-building constant (`§ABSTRACTION-AUDIT-2` still holds).
- **Gate:** the elected scenic stops on Clinic + Hospital are rooms that genuinely carry glazing, and
  the ratio is reported per candidate so the choice is auditable from the log.

### S5 — the jerk softener (numbers, never eyeballing)
User: "there are hard jerks needing to pass a softener routine." Suspects, all already in the path:
stair mid-flight points (`§R6-STAIR-FLIGHT`), pause→resume at beats, storey-arrival look-arounds, and
now lift rides.
- **MEASURE FIRST:** sample camera position per frame, derive speed → acceleration → **jerk** time
  series, and locate the spikes by action index. No softener is written before the profile exists.
- **Then:** velocity ramp in/out of every beat + curvature-limited turns (C² continuity).
- **Gate (FUNDAMENTAL LAW — code and maths, never screenshots):** 95th-percentile jerk down ≥50% with
  path length, stop set and stop ORDER unchanged. A recording is not evidence; the time series is.

### Sequencing and what stays put
S1 first (it decides how many buildings can be strolled at all), then S3 (the biggest visible change
for the least code), then S2, S4, S5.
**⚠ S3-before-S2 has a known interaction (named 2026-07-26 after review, rather than left silent):**
S3's scene budget is calibrated against TODAY's stair-only routing, and S2 then adds lift access —
which can make storeys/rooms reachable that were not, changing which scenes are ELIGIBLE (Terminal is
the live case: one shaft spans all 5 storeys). S3's cap is on scene COUNT, not identity, so the budget
itself survives; but **S2 must re-run S3's gate afterwards and report the elected scene list
before/after**. If the list changes, that is expected and fine — silently not checking is not. **Unchanged and not up for renegotiation here:** highlight-first
ordering (#1012/#1013 proved the metric is already right), the A* on-floor polyline, and the exit rule
(`exits=0` until a MEASURED exterior door lands).
**⚠ NOTHING IN THIS LANE WAITS ON THAT (user directive 2026-07-26: "don't wait on those 2 things...
bottom line go for the highlight").** `§HL-ORIGIN` already starts the walk correctly on buildings with
no entrance node — every building in the fleet is one today — so the stroll ships end to end without
exits. `§G1-EXTERIOR-DOOR-LANE` runs on its OWN track and improves the arrival/finale beats WHEN it
lands; it is not a precondition for S1-S5 and must not be cited as one.

## ▶ §MEP_ONLY_FREE_FLY — L on a model with NO architecture (SPEC, 2026-07-30)
**User directive, verbatim across three messages:** *"the DC arch was not give yet as not the issue,
thus L should extend to cover scene"* … *"Thus such without room info it can just free fly"* …
*"unless it regard spaces as arbitrary 'corridors'"*.

**Read this as a decision, not a question: the ARCH package is NOT coming and is NOT the blocker.
Stop gating anything on it.** L must do something useful on a pure-MEP model.

### The model, measured (KUL070-…-OVERALL_complete.db, 87,333 elements, 311 MB)
`doors=0` · `stairs=0` · `IfcSpace=0` · `rel_contained_in_space=0` · `walls=8` · `slabs=1` ·
`storeys=25` · `buildingCentres=1` · renders fine: **85,947 elements, 2,464 instanced groups**.

### ⚠ FINDING THAT CHANGES THE DIAGNOSIS — do NOT start by "fixing buildTour returns null"
`_buildTourInner` pushes **PART 1 orbit and PART 2 approach UNCONDITIONALLY** (`actions.push({type:
'orbit'…})` then `({type:'moveTo'…,name:'Entrance'})`), and the only early `return null`s are
`if (!firstDoor && !bldgCtr)` and the empty-`storeys` guard. **KUL070 has `bldgCtr` and 25 storeys, so
`buildTour()` should already return ≥2 actions and `_startFlyTour` should already call `A._scrubShow()`.**
Waypoint collection (PART 3) is what yields nothing — rooms-or-doors only, both zero — so `pathLen=0`
and no interior flyPath. That degrades the tour; it should NOT suppress it.

**So the reported "L opens no scrubber" is most likely NOT a null tour.** Two live suspects, both
upstream of `buildTour`:
1. **`§FLY_STREAM_WAIT`** — `while (A.streaming && A.flyActive) { await 500ms }` before the tour is
   built. On 85,947 streaming elements this can park at *"Preparing tour…"* for a very long time.
2. **`ensureRooms()`** — `_prepareGraphTour` awaits it; it lazy-loads `room_walker.js` and runs
   `RoomWalker.walk()` over 87,333 elements to conclude, correctly, that 8 walls yield 0 rooms.
   Expensive, and pointless on this model.

**⛔ ONE LOG LINE SETTLES IT — get it before writing code.** Press L and capture the console. Which
appears: `§FLY_STREAM_WAIT ms=…`, `§NEEDLE_INJECT … rooms=0`, `§TOUR_CACHE`, `[TOUR] §SCRUB_PREPARE`,
or `buildTour crashed`? If `§SCRUB_PREPARE` *is* present, the bar renders and the real complaint is a
tour with nothing in it — a different fix from a tour that never starts. **Do not guess between these.**

### §MOF-1 The cheap, certain path — FREE FLY (do this first)
When the DB has no rooms AND no doors, **short-circuit the whole room pipeline**: skip `ensureRooms`,
skip `_buildGraphRoute`, skip the stream wait, and build a free-fly tour directly from geometry we
already have — `buildingCentres` centre + envelope, plus per-storey element-cluster centroids from
`element_transforms` (real positions, nothing invented). Orbit → descend → traverse the volume along
storey centroids → rise out.

Detect it in ONE cheap query, not by catching a failure:
```sql
SELECT (SELECT COUNT(*) FROM elements_meta WHERE ifc_class IN ('IfcDoor','IfcDoorStandardCase')),
       (SELECT COUNT(*) FROM spatial_structure WHERE type='IfcSpace');
```
Log `§FREE_FLY_MODE reason=no-rooms-no-doors doors=0 spaces=0 storeys=25` so it is never mistaken for
a failure. **This is not "inventing rooms"** — it claims no rooms, it claims a camera path. Say so in
the log line; the `roomsWritten=0` refuse-honestly doctrine (`navigate_find.js`) stays intact.

### §MOF-2 The user's richer idea — SPACES AS ARBITRARY CORRIDORS (design, then decide)
Rasterise each storey and treat cells **not occupied by any element bbox** as walkable — corridors
emerge from the voids between trays/ducts/racks instead of from walls. The machinery already exists:
`common/storey_raster.js` (pack/unpack + O(1) point lookup) and
`scripts/build_storey_walkable_raster.js`.

⚠ **But it is starved on this model too, for a reason nobody has hit before:**
`build_storey_walkable_raster.js` derives its extent from `WHERE m.ifc_class LIKE 'IfcSlab%'` — and
**KUL070 has 1 slab.** So MOF-2 needs a second extent source (overall element bbox per storey) and an
occupancy source (element bboxes as obstacles) before the existing raster is usable here. That is a
real change to a shipped script — **spec it, measure it, do NOT bolt it on inside the tour.**

Open question for MOF-2, worth answering before building: in a datacentre the walkable void is mostly
*aisles between racks*, which is genuinely useful — but `bbox`-as-obstacle will over-block, because a
tray's AABB is far larger than the tray. Measure the walkable fraction per storey first; if it comes
out near zero, MOF-2 is dead on AABBs and would need real mesh occupancy.

### §MOF-3 Witness — W-FREE-FLY
- On KUL070: `§FREE_FLY_MODE` fires, `buildTour()` returns ≥1 action, `§SCRUB_PREPARE` appears, and
  the camera position **actually changes over time** — assert a numeric position/tilt time series
  against the intended path, per the project's FUNDAMENTAL LAW. **No screenshots, not even as a
  supplement.**
- **Regression, non-negotiable:** Clinic (118 spaces, 254 doors) and Duplex (5 spaces, 14 doors) must
  take the UNCHANGED room-graph path — `§FREE_FLY_MODE` must NOT fire, and their action counts and
  route must be byte-identical to `origin/main`. Free fly is a fallback, never a replacement.
- Time-to-first-motion on KUL070 before vs after, in ms. If suspect 1 or 2 above is the real cause,
  this is the number that proves it fixed.
