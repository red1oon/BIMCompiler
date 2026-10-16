# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** extend the already-shipped view-based DLOD box-proxy mechanism (`prompts/done/TM_DLOD_SCALE.md`
§9 — real mesh near-camera/in-frustum, wireframe box otherwise) from Time-Machine-only to GENERAL
navigation (Fly Tour, free orbit/pan, plain viewing) so buildings AT OR ABOVE LTU_AHouse's scale
(122k elements, the current largest tested fixture) stay smooth without needing Time Machine active.
Nothing else — no new box-rendering system, no touching the retracted S261 geometry-swap DLOD, no
touching `dlod.js`'s independent frustum-culling (S262). **This is a NEW spec (filed 2026-07-20), not
a re-open of a regression** — MEASURE BEFORE ESTIMATING (this project's standing doctrine): get real
frame numbers on real hardware before any % target is claimed anywhere in a PR or this file.
**Read the log after every run.** Witnesses (§4) all need a `§DLOD_NAV_*` or `§PERF_TRAVERSE` log
line — no claim without one. Target session: **Fable** (execution), NOT Sonnet — this file is
self-contained per `feedback_model_allocation_mastermind_vs_execution.md`; do not rediscover, do not
re-litigate `TM_DLOD_SCALE.md` §1's settled DLOD-naming history.
**COMPANION FILE:** `FLY_TOUR_CORRIDOR_GRAPH.md` owns the SAME file's (`viewer/tour.js`) routing
concerns (WHICH points/order — room selection, storey sequencing, stairs, the §HIGHLIGHTS_FIRST_ROUTING
spec) — this file owns HOW FAST and WHICH WAY THE CAMERA LOOKS along whatever points exist (pacing,
§21-§24, §TARGET_BOUNDED_LOOKAHEAD, §BASE_SPEED_REGRESSION). Read BOTH before touching tour.js.
**Status:** OPEN, filed 2026-07-20. Triggered by a live user question ("how to get true DLOD to
scale LTU above sizes") asked immediately after `prompts/done/TOUR_ROUTE_CACHE.md` §4's fix — the
user's own framing tied the two together ("perhaps it is just the FlyTour isolated case... delve
into its initial"), i.e. Fly Tour is the first real-world path this should cover. **§5 added same
day, then self-corrected same day**: a viability test for a structural culling axis (storey
occlusion) the user's own domain pushback surfaced — the FIRST version of §5 (blanket storey-
partition) was itself RETRACTED after two more rounds of user pushback found it breaks aerial views
and barely helps interior ones; §5's final shape is a two-track split (box-proxy for aerial, room-
level occlusion blocked on data for interior). **§6 added same day**: real-code impact check on
Find Panel + Clash — a required exemption clause (§6's last paragraph) is now part of the design,
not optional, before any DLOD extension ships. **§7 added same day**: real math found the §0-§4
distance-radius test itself gets occlusion backwards (facade-far-but-visible boxed, next-room-near-
but-hidden stays real) — line-of-sight via an existing unused R-tree index is the corrected axis,
not yet designed. **§8 added same day, HARD GATE — read before touching ANY DLOD code in this
repo:** this exact problem class (distance/geometry-threshold visibility swap) has failed FOUR
times already (S258, S259, S261, S262) on edge-on flicker + TM visibility conflicts; hysteresis was
already tried and was insufficient alone. §8 authorizes Fable to INVESTIGATE a cross-fade mitigation
in an isolated prototype and REPORT BACK ONLY — no implementation, no live wiring, no PR, until the
user reviews the findings and explicitly says to proceed.

## VERDICT — read this first, everything below is the archived investigation trail (2026-07-25)

**Symptom:** Fly Tour felt sluggish/laggy on LTU_AHouse (122,330 elements); MaxQ preview and Clash
`_flyToClash` both felt smooth on the same building. §9-§20 spent this file's whole lifetime chasing
nav-DLOD/occlusion tuning as the fix; it helped (real, aerial-only win) but never closed the gap.

**Investigated and RULED OUT as the primary cause (real findings, kept for the record, not the
answer):**
- nav-DLOD box-proxy inadequacy — real win, aerial-distance only, never touched interior legs (§10,
  §19, §22's live re-test: `'o'` gave no improvement inside the building, 67.7ms→77.5ms).
- `walkTick`'s double position-damping bug — real bug, FIXED AND SHIPPED (bim-ootb `0587956`), but
  confirmed via `§WALK_TICK_COST` to cost 0.03-0.14ms — negligible. Fixes motion *feel*
  (a permanent lag-behind), not frame rate. Don't confuse the two axes again (§20 addendum 5 already
  made this mistake once).
- Ray-blast DLOD's (`dlod.js`) full-buffer `instanceMatrix` re-upload per flip — real mechanism, a
  correct fix was designed and verified against the three.js source, then **explicitly NOT shipped**:
  `helpers.js`/`navigate_find.js`/`time_machine.js` all mutate the same InstancedMesh buffers via
  `setMatrixAt`+`needsUpdate` without the same `addUpdateRange` convention — shipping it only in
  `dlod.js` risks silently dropping their writes. Documented in-code, held for the planned DLOD
  consolidation (dlod.js/dlod_nav.js/time_machine DLOD/Find's filter, unified) — NOT done.
- Raw frame_ms magnitude — Clash reads smooth at 99-106ms, same or worse than Fly Tour's "acceptable"
  states. The real reason MaxQ/Clash feel smooth isn't lower cost, it's shorter exposure — brief or
  discontinuous camera motion vs Fly Tour's sustained minutes-long continuous tracking, the only thing
  in this app that gives a human eye long enough to perceive judder at a given frame cost (§21).

**ROOT CAUSE, confirmed live (§22):** LTU_AHouse's scene held **13,453 separate InstancedMesh scene
objects averaging 2.7 instances each** (of 15,946 total scene objects) — `streaming.js`'s own routing
rule sent any geometry hash with 2+ instances to its own object. Three.js's native per-object
frustum-cull traversal cost scales with OBJECT COUNT, independent of draw calls — this is why
box-proxy (draw-call reduction only) hit a floor around 64-100ms even with almost nothing left to
draw. Proven by comparison: a light building (Duplex, ~150 scene objects) ran 4-8x faster than LTU at
a *matching* draw-call count.

**FIX SHIPPED** (bim-ootb, local commit `8ee7aa6`, **NOT pushed**): `streaming.js` §S280e —
geometry hashes with ≤3 instances now fold into the same BatchedMesh bucketing already used for
single-instance elements, instead of spawning their own InstancedMesh. Verified live: scene objects
15,946→4,706, draw calls 15,981→4,698, sustained real-rotation frame time **200-270ms→86.7ms
(~4-5fps→~11.5fps)**. User watched it live and confirmed smooth (visual + the SFX cue both read
clean).

**STILL OPEN, do not claim more than this:**
1. **Not verified against TM/picking/storey-filter** — the changed routing rule is explicitly marked
   "sacred — do NOT change without testing" in `streaming.js` itself, with 16 documented consumers.
   Contract shape is unchanged (every element still lands in exactly one of `_batchMeta`/
   `_instanceMeta`), which is *why* this is expected safe — that's an expectation, not a witness.
2. **The remaining ~86ms is real triangle/GPU cost** (12.9M triangles) — §17's occlusion domain,
   still unsolved, still gated on the false-hide gap. This fix and §17's work are complementary, not
   substitutes for each other.
3. **DLOD consolidation is still needed, and matters MORE at 1M-element scale, not less** — the
   shared-buffer race (`setMatrixAt`/`addUpdateRange` across 4 independent systems) is a correctness
   risk, and this object-count fix doesn't touch it. Do NOT read "the floor is explained" as "the
   system is scale-ready."
4. **Interior route-pacing/pathing** ("avoid tight/attic-type confinements") is a separate, filed
   spec — `FLY_TOUR_CORRIDOR_GRAPH.md` §INTERIOR_PACING_NOT_A_SPEED_FACTOR — not started, not part of
   this verdict.
5. Nothing in this session is pushed to `bim-ootb` origin. Commits: `0587956` (walkTick),
   `8ee7aa6` (streaming.js object-count fix). Push after TM/picking/storey-filter re-test, not before.

## 0. What already exists — reuse, do not reinvent (all shipped, all proven)
- **`viewer/time_machine.js`'s DLOD proxy** (`_dlodEngaged`, `_dlodBuildBoxes`, `_dlodUpdateBoxes`,
  `_dlodBoxIndex[guid].pos/.radius`, `_dlodFrustum`/`_dlodPSM`/`_dlodSphere` reused scratch objects):
  the FINAL shipped rule (`TM_DLOD_SCALE.md` §9) is view-based — FRONTIER/RECENT (TM concepts) always
  real; everything else PLACED renders real only if `distance ≤ 50m AND in-frustum`, else a wireframe
  box (`MeshBasicMaterial`, opacity 0.4, matching `_drawBboxPlaceholders`' established look).
  **Only the "FRONTIER/RECENT always real" clause is TM-specific** — outside TM there is no
  construction cursor, so that clause simply doesn't apply; the distance+frustum test underneath is
  already building-agnostic.
- **Engage gate today:** `_dlodEngaged = toggle && _isLargeBuilding && !app.streaming`
  (`time_machine.js:501`) — hard-gated on TM being the active mode. This is the ONE line that makes
  the whole mechanism TM-only; extending it is centrally this line's job, not a rewrite.
- **`LARGE_BUILDING = 50000`** (`time_machine.js:471`) is the existing size threshold — LTU (122k) is
  ~2.4× over it. "Above LTU sizes" has no shipped meaning yet; §1 below is where that gets defined
  with a real number, not invented here.
- **Pick-exclusion:** `isBboxPlaceholder` (checked `picking.js:257`) + the debug tag `isDlodTmProxy`
  (`TM_DLOD_SCALE.md` §9's last note — use this to tell DLOD boxes apart from ordinary load-time
  placeholders in any future audit; they share geometry/material and are otherwise indistinguishable).
- **`TOUR_ROUTE_CACHE.md`** (just refixed, §4) already solves the ROUTE-PLANNING cost of Fly Tour —
  this spec is about RENDER cost during the tour/navigation itself, a different bottleneck. Do not
  conflate the two; a slow Fly Tour after this spec's fix should point back at `TOUR_ROUTE_CACHE.md`.
- **`TM_DLOD_SCALE.md` §7 already named this as a non-goal for v1**, verbatim: "No Fly-Tour/walk-mode
  integration yet: the tour benefits automatically only via whatever TM window is active. A follow-up
  MAY render far-storey boxes during tours using the same proxy — separate spec, after W-DLOD-PERF
  numbers exist." **W-DLOD-PERF (TM_DLOD_SCALE.md §6) was never actually run** (§8 admits it — no
  browser/GPU access from that CLI session); this spec's §4 W-DLOD-NAV-PERF is the first time real
  numbers for this mechanism exist at all, TM or not. Get those numbers before extending further.

## 1. What "above LTU sizes" concretely means — measure before designing
LTU_AHouse (122k elements) is the largest fixture currently proven end-to-end in this repo (mesh
extraction + room graph + streaming + render, all witnessed elsewhere). Before writing any code:
1. Confirm whether a real fixture bigger than LTU already exists (`grep -c` element counts across
   `deploy/buildings/*_extracted.db` or ask — do not invent a number).
2. If none exists, the cheapest real stress test this codebase already supports without new data is
   a **city view**: `A.buildingsRendered.size > 1` (multiple buildings loaded together — Fly Tour
   already has city-tour code for this, `viewer/tour.js` city-orbit block) — e.g. LTU + LTU again (or
   + Hospital/Terminal) pushes total resident elements well past 122k using only existing DBs. Use
   this to get a first real "above LTU" data point instead of waiting for a bigger single-building DB.
3. Log the actual triangle/draw-call/element counts from whichever path is used — this is the
   `MEASURE BEFORE ESTIMATING` step `TM_INCREMENTAL_RENDER_PERF.md §0` established the hard way; do
   not reuse that file's retracted "8 draw calls" number (`TM_DLOD_SCALE.md` §1 already flagged it
   uncorroborated — real measured LTU healthy state is ~15-16K draw calls, S280c).

## 2. Design shape — generalize the engage gate, not the mechanism
- Add a navigation-scope engage condition alongside the existing TM one:
  `_dlodEngagedNav = navToggle && (elCount > DLOD_NAV_MIN_ELEMENTS) && !app.streaming` — independent
  of whether TM is active. `DLOD_NAV_MIN_ELEMENTS` starts as `LARGE_BUILDING` (50000, proven) unless
  §1's measurement says otherwise for the general-nav case (TM's threshold was tuned for TM's own
  cost profile, not necessarily the right number for free-camera panning).
- Drive the ACTIVE set from resident/placed elements directly (there is no construction cursor
  outside TM — no FRONTIER/RECENT distinction applies), reusing the exact same distance+frustum test
  and cached `_dlodBoxIndex` from `TM_DLOD_SCALE.md` §9. The box/real partition becomes purely
  "in-view real, out-of-view box" everywhere, TM or not.
- Own pill/toggle for nav-scope DLOD, separate from TM's `◧ LOD` pill (different lifecycle — this one
  should be live during Fly Tour and plain orbit, not gated on TM panel visibility). Default OFF,
  same as TM's v1 (`TM_DLOD_SCALE.md` §4/§7 — "No default-ON... default flips only after the user's
  own hardware numbers say so").
- **Landmines, already known, do not re-discover:**
  1. `_metaGen`/`_batchMeta` index-rebuild bump — box InstancedMeshes must NEVER be TM-tracked meshes
     (`TM_DLOD_SCALE.md` §5.1). The still-OPEN `TM_STREAM_REBUILD_COALESCE.md` item (per-batch index
     rebuild during streaming, 50-159ms×10+ on LTU) is a DIFFERENT, already-filed bug — do not fold it
     into this spec, but be aware it's live if profiling shows rebuild cost during a load-then-fly test.
  2. Never touch `_useDlodPath`/`setGeometryAt` (S261, retracted, stays retracted) or couple with
     `dlod.js`'s frustum-culling (S262 doctrine: independent systems, do not merge).
  3. `feedback_no_fake_lod_unbreakable.md`: boxes must always read as obviously-proxy — reuse the
     wireframe look verbatim, no "solid" regression (TM_DLOD_SCALE.md §9 already learned this the
     hard way from a live user correction — do not re-litigate, just reuse the wireframe material).
  4. Fly Tour specifically streams/promotes geometry as it moves (`§FLY_STREAM_WAIT` doctrine,
     `TOUR_ROUTE_CACHE.md` §2) — box proxies must not fight the promote pipeline; gate nav-DLOD off
     during `A.streaming`, same as TM's v1 does.

## 3. Non-goals (v1, mirrors TM_DLOD_SCALE.md §7)
- No camera-distance mesh-swap (`setGeometryAt`), no memory-residency/eviction work — this reduces
  DRAW cost only, not resident GPU memory (say so honestly in any report, per `TM_DLOD_SCALE.md` §1's
  correction of an earlier overstated claim).
- No default-ON, no auto-engage without an explicit user toggle, until §4's numbers justify it.
- Not a fix for `TM_STREAM_REBUILD_COALESCE.md`'s open per-batch rebuild cost — separate, already-filed.

### SCOPE DECISION — 2026-07-21, USER-DICTATED (engage surfaces, settled — do not re-litigate)
Nav-scope DLOD engages ONLY during: free orbit/pan/plain viewing + Fly Tour. Excluded, per the
user's explicit direction ("But not Find Panel and Alt-C movie orbit"):
- **Find Panel isolation active → nav-DLOD disengages ENTIRELY** (stronger and simpler than §6's
  minimum per-GUID exemption, which stays documented below as the fallback shape). Rationale:
  isolation already hides most of the building — there is no draw cost left for DLOD to save, only
  the §6 revert-flicker risk. Re-engage (if the pill is on) when the isolation clears.
- **Alt+C Cinema Orbit: excluded** — visual-quality mode; a wireframe proxy box must never appear
  in a movie frame. Same rationale extends to Alt+P photoreal stills (session note: extended by the
  assistant on the same logic, flagged to the user in-conversation, not independently dictated).
  Accepted tradeoff, on record: Cinema pays full render cost on LTU-scale buildings — if a Cinema
  run is slow there, that is this decision working as intended, not a bug.

## 4. Witnesses (blocking; headless is blind to GPU per TM_DLOD_SCALE.md §6 — real numbers need the
user's machine, `window.__tmTrav`-style stats or an equivalent nav-scope hook)
- **W-DLOD-NAV-EQUIV:** toggle OFF → scene identical to today's Fly Tour / free-orbit rendering,
  byte-for-byte visible-guid set, across a scripted camera sweep. `mismatch=0`.
- **W-DLOD-NAV-PROXY:** toggle ON → in-view real-mesh set matches the distance+frustum test exactly;
  boxed set is the disjoint remainder; log `§DLOD_NAV active=<n> boxed=<n> mode=on|off`.
- **W-DLOD-NAV-PERF:** on LTU (and the §1 city-view stress case if no bigger single fixture exists),
  compare draw calls / triangle count / frame time during an actual Fly Tour run and during free-orbit
  panning, proxy OFF vs ON. This is the FIRST real number for this mechanism outside TM — report it
  plainly, don't extrapolate from TM's (also never formally witnessed) numbers.
- **W-DLOD-NAV-NO-REBUILD:** confirm zero `§PERF_INCR_INDEX` (or equivalent) rebuilds fire from DLOD
  box visibility flips alone during a sustained tour/orbit session (post-streaming).

## 5. Storey occlusion — a SEPARATE, structural culling axis (viability tested 2026-07-20)

**Why this is here and why it wasn't found weeks ago (read before designing more box-proxy work):**
every perf phase to date — TM delta-rendering, box-proxy distance+frustum, plain `dlod.js` frustum
culling, the retracted S261 geometry-swap — asks a CAMERA-RELATIVE question (distance, frustum,
time-window). None ever asked whether the BUILDING'S OWN STRUCTURE already proves an element can't
be seen. That's not a data gap — `elements_meta.storey` has been 100%-populated the whole time — it's
an analysis blind spot: each phase was a reactive fix to a specific live complaint, built by reusing
whatever mechanism already existed (correctly, per this project's reuse-first doctrine), which means
a mechanism that had never been built (structural occlusion) never entered the reuse pool. It surfaced
this session only because the user pushed back on the "wide view = mostly facade" assumption with
"behind the walls can't they be culled" — a domain intuition the camera-relative framing above never
reached for on its own. Both Fly Tour AND Alt+C Cinema Orbit are affected — `effects.js`'s MaxQ film
always "dives" into the largest interior space at floor level (`§CINEMA_SIMPLE decision 3`), so
Cinema is NOT purely exterior/aerial either; occlusion here has to be room/storey-aware for BOTH
entry points, not envelope-only (a naive "hide everything behind the outer shell" rule would go dark
the instant either camera is inside its own dive/walk target — see the conversation this file's git
history sits under for the fuller reasoning).

**Viability test run 2026-07-20 (pure SQL against the real DB, no browser/GPU needed — this only
tests spatial partition, not render cost):** `buildings/LTU_AHouse_extracted.db`, 125,698 elements.
```
SELECT storey, COUNT(*), 125698-COUNT(*), ROUND(100.0*(125698-COUNT(*))/125698,1)
FROM elements_meta GROUP BY storey ORDER BY 2 DESC;
```
| storey (top 5 of 19 distinct labels) | on this storey | elsewhere | % elsewhere |
|---|---|---|---|
| Plan 1 | 44,374 | 81,324 | 64.7% |
| Plan 2 | 28,542 | 97,156 | 77.3% |
| Plan 3 | 18,815 | 106,883 | 85.0% |
| Plan 4 | 13,522 | 112,176 | 89.2% |
| VÅNING 3 | 2,218 | 123,480 | 98.2% |

Even parked on the single biggest floor, **65% of the building is on a different storey** —
opaque floor/ceiling slabs make that a strong occlusion candidate (exception: stairwells/atria with
genuine vertical sightlines — a small exempted set, not a dent in the ceiling). Most storeys clear
90%+. **`storey` coverage is complete** — this is buildable today with no new extraction.

**Same-floor room-level occlusion (walls blocking lateral sightlines) is a SEPARATE, currently
BLOCKED question** — checked `rel_contained_in_space` (element→IfcSpace containment): only 1,608 of
125,698 elements (1.3%) have a room assignment, across 181 spaces. Not a logic problem, a data
problem — do not attempt room-level occlusion until containment extraction coverage is fixed
(separate task, not this spec).

**RETRACTED same day — blanket storey-partition is NOT a good design, don't build it as originally
proposed above.** Two follow-up questions from the user exposed real cracks, confirmed with more
SQL (not hand-waved):
1. **Aerial/exterior views break it.** The tour's own action log (both Fly Tour and Alt+C) mixes an
   opening `orbit`, interior `flyPath` legs at floor height, and a closing `Bird's eye`/`Final` shot.
   A blanket "hide anything not on camera's current storey" rule is only even valid while the camera
   is deep inside ONE floor — during the aerial/orbit legs there is no single "current storey," and
   other floors' facade/roof genuinely ARE visible from outside. The naive rule would punch holes in
   the building during exactly the establishing/closing shots — the same "go dark" failure as
   envelope-only occlusion (§ intro), just triggered from the opposite direction.
2. **Even where valid (camera genuinely inside one floor), storey-level is too coarse to matter
   much.** Queried real room-level containment: the 181 rooms with data average **8.9 elements per
   room** (`rel_contained_in_space`, 1,608 rows / 181 rooms). Compare to Plan 1's 44,374 elements.
   Storey-partition only ever addressed the VERTICAL axis (other floors); the bigger win was always
   the HORIZONTAL axis (other rooms on the SAME floor, 8.9 vs 44,374) — which storey-partition
   cannot touch at all, and which needs room-level containment, currently blocked on the same
   1.3%-coverage data gap named above.

**Corrected shape — two separate tracks, not one storey-partition mechanism:**
1. **Aerial/exterior legs:** use §0-§2's existing distance+frustum box-proxy (already-proven,
   TM_DLOD_SCALE.md §9) — the correct lever for "camera can see a lot at once," not storey partition.
2. **Interior/room legs:** the real win is room-level occlusion (8.9 vs 44k elements), not storey-
   level — but this is gated on a PREREQUISITE, non-optional fix: `rel_contained_in_space` coverage
   needs to go from 1.3% to something usable BEFORE any room-level culling logic is worth designing,
   let alone building. That containment fix is its own task (extraction/compile work, not a render
   change) and belongs in a separate spec — note it here, don't scope-creep it into this file.
3. Storey membership itself is NOT thrown away — it's just not the culling axis. It remains useful
   as an aerial/interior MODE SIGNAL (is the camera's current stop associated with one storey via
   the room-graph/dive-target data both Fly Tour and Cinema already compute for path-planning, or is
   it an orbit/bird's-eye action with no single storey?) — a cheap way to pick which of the two
   tracks above applies at a given tour stop, reusing data already in memory.

## 6. Cross-system impact — Find Panel, Clash (checked 2026-07-20, real code, not assumed)

Any DLOD extension (nav-scope box-proxy from §0-§4, or a future room-level mechanism from §5) writes
to the SAME per-slot visibility state (`_instanceMeta`/`_batchMeta`, `setMatrixAt`/`setVisibleAt`)
that other features already use. Two were checked directly — do not assume the rest of the app is
unaffected without checking each on its own terms; these two aren't a template that automatically
covers everything else.

- **Find Panel's element-precise highlight** (`navigate_find.js` §C, `_hlOverlay`): draws its OWN
  `InstancedMesh` of unit boxes from `element_transforms`, entirely independent of the base scene's
  render state. **Not affected** by DLOD — same architectural pattern as Clash below.
- **Find Panel's isolate mode** (`A.filterByGuids`, `panels.js:839`; also used by `A.isolateRoom`,
  `panels.js:870`, itself limited by the SAME `rel_contained_in_space` 1.3% coverage gap named in
  §5 — not a new finding, the same data gap blocks BOTH room-level occlusion and today's shipped
  room-isolate feature): manipulates the real mesh's per-slot visibility directly via
  `A.collectMeshes`+`A.filterInstancedMesh`/`filterBatchedMesh` (`helpers.js:36-73`) — the exact
  same state DLOD's per-tick traverse (`time_machine.js:1264`, `hideForProxy`) re-asserts every
  tick with zero awareness of Find's isolation. **Confirmed real conflict, not hypothetical:** Find
  isolates a GUID → `filterByGuids` force-shows the real mesh this instant → the very next DLOD
  tick, if that element independently reads as "placed, not frontier/recent, out-of-view," DLOD
  zeroes it back out and shows its box instead. The isolated element visibly reverts. `filterInstancedMesh`/
  `filterBatchedMesh` DO silently no-op on DLOD's box `InstancedMesh` itself (`if (!meta) return`,
  since box meshes are deliberately never registered in `_instanceMeta`/`_batchMeta` per
  `TM_DLOD_SCALE.md` §5.1) — so Find's filter can't corrupt or crash on a box mesh, it just can't
  see or protect a real mesh that DLOD independently decides to hide.
- **Clash** (`measure.js:681-728`, both the full-opacity and clipped-overlap highlight meshes):
  built fresh from `component_geometries` blobs into a separate `A.measureGroup`, not the streamed
  base scene. **Architecturally immune** — always renders true geometry regardless of DLOD state.
  Clash pair detection itself is DB-driven (`A._currentClashRules`), not scene-state-dependent.
- **Picking** (`isBboxPlaceholder`, proven pick-exclusion, `picking.js:257`): clicking a DLOD box
  today correctly no-ops by design — already-shipped, already-correct behavior. Net effect worth
  stating explicitly, not just inherited silently: an element currently rendered as a box is
  unclickable/unselectable until it promotes back to real mesh. Acceptable for TM today; carry the
  same tradeoff into nav-scope DLOD rather than treating it as a new gap to close.

**Required design addition, not optional:** any DLOD engage-condition (§2's `hideForProxy`-equivalent
for nav-scope, and any future room-level mechanism) needs an explicit exemption clause — same shape
as TM's existing FRONTIER/RECENT-always-real rule — that also covers "GUID is currently part of an
active Find isolation set" (`A.activeGuidFilter`, set by `filterByGuids` at `panels.js:840`, already
resident in memory — check that, not a new lookup). Without it, isolate-then-fly on a large building
will visibly flicker/revert the moment nav-scope DLOD engages. Clash needs no equivalent change.

## 7. Distance is the wrong axis — line-of-sight (occlusion) is the right one (2026-07-20)

Real math (SQL against LTU_AHouse_extracted.db) exposed that §0-§2's 50m-radius rule, reused
verbatim from `TM_DLOD_SCALE.md` §9, gets BOTH directions wrong: at a central interior point,
**54.5%** of ALL 125,698 elements (every storey — the building is only 17m tall but 425m×286m wide,
so 50m trivially reaches vertically, it's a horizontal-only constraint in practice) fall within the
"stays real" radius, including elements in adjacent rooms that ARE occluded by a wall 5m away. At
the tour's own logged real orbit radius (`r=255`, from an actual `[WALK] Orbit: r=255 from 27°` log
line earlier this session), **0% of elements** fall within 50m — the entire building would render
as boxes during the tour's own opening orbit / closing bird's-eye shot. Distance is not a proxy for
occlusion; it gets facade-at-255m (visible, nothing occluding it) and next-room-at-5m (invisible,
a wall in the way) backwards.

**Correct axis: line-of-sight / occlusion, not distance.** This codebase already has the
infrastructure for a CPU-side version — `docs/internal/CINEMATIC_RENDERING.md` names an existing
R-tree spatial index (built for clash detection + pick-proximity, explicitly "not a render
optimization" today) that could drive a camera→element raycast test against nearby opaque geometry,
without the GPU occlusion-query latency/driver-inconsistency/per-object overhead concerns raised
earlier in this file's history (see the conversation this file's git history sits under). This
would supersede, not sit alongside, §0-§2's distance-only test — it directly answers "is a wall in
the way," which distance never could.

**Not yet designed or witnessed — two prerequisites before any implementation:**
1. CPU cost of ~125k R-tree-accelerated raycasts per frame/tick is UNVERIFIED — needs its own
   measurement, same MEASURE BEFORE ESTIMATING discipline as everything else in this file.
2. The pop/flicker risk of any hard visibility toggle — see §8, gated, do not build ahead of it.

## 8. Cross-fade/hysteresis investigation — GATED, Fable to REPORT ONLY, no implementation without
explicit user sign-off (filed 2026-07-20)

**This section exists because this exact PROBLEM CLASS has already failed four times in this
codebase** (`prompts/done/S259_BATCHEDMESH.md` §"Why DLOD broke before (S258 disable reasons)",
`prompts/done/S261_DLOD_MILLION.md`, `prompts/done/S262_DLOD_REENABLE.md` — all Three.js/bim-ootb,
not the unrelated Blender-side DLOD lineage in `prompts/done/S179_dlod_rtree_handoff.md`/
`S193_dlod_auto_linker.md`, a DIFFERENT tool with its own separate history, cited here only as a
secondary cross-check, not conflated with this one):
- **S258**: DLOD disabled. Named causes: "wrong-angle onset — thin elements viewed edge-on flicker
  between LOD levels" + "Hourglass conflicts — DLOD and Time Machine both control visibility, they
  fight" (`S259_BATCHEDMESH.md` line 61-63).
- **S259**: proposed BatchedMesh `setGeometryIdAt` as the fix for S258's flicker.
- **S261**: fully built distance-threshold geometry swap (bbox↔real, `setGeometryAt`), INCLUDING a
  **hysteresis band already** (promote at 50m, demote at 80m, explicitly "prevents flicker at
  boundary" — `S261_DLOD_MILLION.md` line 95). Still retracted — hysteresis alone did not fix the
  edge-on flicker or the TM-visibility-fight problem (`TM_DLOD_SCALE.md` §1: "Died on: edge-on
  flicker on thin elements, TM visibility fights, pick broken until promotion completes").
- **S262**: tried to re-enable it, argued "breaks pick" was overstated. Still disabled today
  (`_useDlodPath = false`, hard-set, guarded by whitebox test `dlod_visibility_only`/`§WB_DLOD_VIS`
  asserting `noSwapPath && noPromote` — **do not flip this guard**).
- **Cross-fade/opacity-blend specifically was NAMED but never built or tested** —
  `S261_DLOD_PBR_MILLION.md` lists "Bbox → full mesh fade transition" as a future-steps item; the
  whole lineage was retracted before reaching it. Distinguish clearly from hysteresis (tried,
  proven insufficient alone) — cross-fade is a genuinely untested idea, not a repeat of a known
  failure, but also not a known success.
- **One real difference worth testing on its own merits, not assumed identical:** S258-S262's
  flicker trigger was DISTANCE-threshold crossing (thin element flips LOD at 50m/80m). §7's
  line-of-sight idea triggers on OCCLUSION-boundary crossing (camera rounds a corner) — a different
  geometric event. Same general risk CLASS (any hard per-frame visibility toggle can pop), not
  guaranteed the same failure mode.

**Fable's task — INVESTIGATE AND REPORT, explicitly NOT implement into any shipped path:**
1. Build a small, isolated prototype (scratch/throwaway, not wired into the live viewer) that
   reproduces the S258/S261 edge-on-flicker condition on a thin element (a wall or beam, viewed
   near edge-on, crossing a hard visibility/geometry threshold) — confirm the failure reproduces
   before testing any fix, per this project's `feedback_verify_checker_before_code_under_test.md`
   doctrine (know the failure is real before claiming a fix addresses it).
2. Add an opacity cross-fade (N frames, box and real mesh both rendered at complementary opacity
   during the transition) across that SAME reproduced case. Measure and report: does the flicker
   actually go away, does the transition read as smooth, what N (frame count/duration) was needed,
   any new artifact introduced (z-fighting between the two overlapping representations during the
   fade, since both are visible simultaneously — a risk unique to cross-fade that hysteresis never
   had, since hysteresis never draws both at once).
3. Report findings in this file (§8, dated entry) — reproduction confirmed y/n, cross-fade result,
   concrete numbers, any new artifact found. **STOP THERE.** Do not wire it into `dlod.js`,
   `streaming.js`, or any live path. Do not touch `_useDlodPath` or the `§WB_DLOD_VIS` guard test.
   Do not open a PR. The user reviews the findings and decides whether to proceed — this is a
   report-back task, not an implementation task, given four prior attempts in this exact problem
   class all ended in retraction.
4. **Not authorized without this report:** any live code change to DLOD/box-proxy visibility
   mechanics in `viewer/dlod.js`, `viewer/streaming.js`, or `viewer/time_machine.js`'s DLOD
   sections. §0-§4's nav-scope box-proxy extension and §7's R-tree line-of-sight idea both wait on
   this investigation's outcome before any implementation work starts.

### §8 FINDINGS — 2026-07-21 (Fable, isolated prototype, REPORT ONLY — no live code touched)

**Prototype:** scratchpad-only (`xfade_proto/proto.html` + playwright runner, session scratchpad —
throwaway per task 1; key § lines quoted below are the durable evidence). Thin wall 6m×3m×0.08m
viewed 3° off edge-on (projects a ~4px sliver — S258's condition), real mesh ↔ wireframe bbox proxy
using the shipped §9 look (`MeshBasicMaterial` wireframe, opacity 0.4), hard 50m threshold.
Fully deterministic: frame-index-driven camera, 640×480, SwiftShader software GL, full-canvas
`gl.readPixels` every frame. Metrics are numeric per the FUNDAMENTAL LAW — no screenshots:
`changedPx` (pixels with any-channel delta>10 vs prev frame) and `sumAbsK` (total abs pixel delta,
kilo-units); a CTRL run (always-real, same path) gives the camera-motion baseline (max 7K/frame,
mean 6-8 changedPx). Two camera paths: T = genuine traverse 90→30→90m (2 real crossings);
O = oscillation 50±2.5m + ±0.5° yaw wobble (the flicker trigger). 17 runs total.

**1. Reproduction: CONFIRMED.** Hard toggle on the oscillating path flips 14×/400 frames
(`§XFADE_RUN path=O mode=HARD flips=14 ... maxChangedPx=194`), each flip a 36K single-frame delta
vs 7K motion baseline — a 5× pop repeating every ~30 frames = the recorded edge-on flicker. On the
traverse path each genuine crossing pops 29K in one frame (`§XFADE_POPSUM path=T mode=HARD
worstFrameSumExcessK=29@f134 ctrlMaxFrameSumK=7`).

**2. Hysteresis alone (S261's 50/80 band): exactly matches its historical "insufficient" record.**
Kills oscillation completely (O-path flips 14→0) but the pop at a genuine crossing is BYTE-IDENTICAL
to hard toggle (29K@f134, same frame, same magnitude) — hysteresis fixes decision instability, does
nothing for the swap itself. The prototype independently re-derives why S261 retracted.

**3. Cross-fade alone: NOT a fix either — two new findings.**
(a) **First-frame depth-occlusion step, N-independent:** the first fade frame carries HALF the hard
pop (15K for N=10, 17K for N=20 — same regardless of N) because the real mesh, even at 5-10%
opacity, still writes depth and instantly occludes the proxy's back wireframe lines. A hard
structural pop hiding inside the "smooth" fade.
(b) **On an oscillating decision, fade converts binary flicker into sustained shimmer:** O-path
FADE10 still flips 14×, opacity never settles, mean churn 47 changedPx/frame — WORSE than hard
toggle's 24 (`§XFADE_RUN path=O mode=FADE10 ... meanChangedPx=47`).

**4. The working combination — hysteresis + cross-fade N=10 + depthWrite:false while mid-fade:**
depthWrite-off during the transition removes finding 3a entirely: worst per-frame excess drops
29K (hard) → 11K (naive fade) → **7K — indistinguishable from the camera-motion baseline itself**
(`§XFADE_POPSUM path=T mode=FADE10DW worstFrameSumExcessK=7@f143 ctrlMaxFrameSumK=7`; same for
FADEHYST10DW). Hysteresis supplies decision stability (0 oscillation flips, O-path identical to
CTRL), fade+DW supplies a pop-free transition. N=10 frames sufficed; N=5 and N=20 were both
slightly worse pre-DW (12K/13K) — no reason found to go longer than 10.

**5. Z-fighting (the risk unique to cross-fade): STABLE in this environment.** Worst case tested —
box-shaped wall means proxy and real mesh are EXACTLY coplanar — 58 static frames with both drawn
at 50/50: zero changed pixels across all three variants (`§XFADE_ZFIGHT mode=ZSTATIC ...
totalChangedPx=0 verdict=STABLE`, ditto ZSTATICDW). Caveat: SwiftShader is a deterministic software
rasterizer; a real-GPU spot check on the user's machine is a cheap prerequisite before any go.

**6. Costs/limits found:** draw calls double per transitioning element for N frames (returns to 1
after — transient, bounded); both representations must render in the transparent pass mid-fade
(sorting cost at scale untested). **Biggest implementation-reality gap, untested here:** the
prototype fades a standalone `Mesh` material — the live viewer's real geometry is
InstancedMesh/BatchedMesh with SHARED materials, so per-element opacity needs per-instance alpha
(shader patch) or temporarily hoisting transitioning elements into an overlay mesh; neither is
trivial and neither was prototyped. Also: cross-fade addresses ONLY the pop — it does nothing for
S258's second named cause (TM/Find visibility-ownership fights); that remains §6's exemption-clause
design, a separate mandatory piece of any implementation.

**Verdict for user review:** flicker mechanism reproduced and killed in isolation by
hysteresis + N=10 cross-fade + mid-fade depthWrite-off — worst-frame delta equal to normal camera
motion, zero oscillation churn, zero static-overlap instability (software GL). Open before any
implementation decision: real-GPU z-fight/artifact spot check, and the batched/instanced
per-element-opacity question in finding 6. STOPPED HERE per gate — no live wiring, no PR,
`_useDlodPath`/`§WB_DLOD_VIS` untouched.

### §8 FINDINGS ADDENDUM — 2026-07-21 same day (user: "test against all assumptions before Go")
Both open items from the entry above are now POC'd — same isolated-prototype discipline
(`xfade_proto/proto2.html`), this time mirroring the LIVE stack exactly: the viewer's own three.js
r185 lib copy, BatchedMesh + InstancedMesh + shared `MeshStandardMaterial` per streaming.js §S280d
routing, directional+ambient lighting. Every test ran TWICE — SwiftShader AND this machine's real
GPU (`§P0_GL renderer=ANGLE (NVIDIA... RTX 4060 Laptop GPU ... OpenGL 4.5.0)`, via system Chrome
headless-new + `--use-angle=gl`). Verdicts identical across both renderers except one 1-pixel
nuance noted below.

**A. Real-GPU check: CLOSED, no longer needs the user's machine.** The full proto1 suite rerun on
the RTX 4060 reproduces every SwiftShader conclusion: hard pop 33-34K vs 10K motion baseline,
hysteresis byte-identical pop (33K), fade 12-13K, fade+depthWrite-off **8K — below the 10K
baseline**; z-fight static-overlap STABLE (0 changed px, 58 frames, all three variants) on real
NVIDIA hardware (`proto_gpu.log`).

**B. Per-element opacity on the real mesh types — one NO, two YES:**
- **BatchedMesh built-in alpha: FAILS** (`§P1_VERDICT BATCH_ALPHA=FAILS`, both renderers). r185's
  per-instance `_colorsTexture` is RGBA `Float32Array`, but poking the alpha texel has ZERO pixel
  effect — the batching shader multiplies RGB only. No supported per-element fade inside
  BatchedMesh without patching the batching shader chunk itself (deeper surgery, untested,
  unnecessary given the next finding).
- **Overlay-hoist (Find-Panel `_hlOverlay` pattern): PIXEL-IDENTICAL through the whole cycle**
  (`§P3_VERDICT OVERLAY_SWAP=PIXEL_IDENTICAL swapChg=0`, both renderers). `setVisibleAt(slot,
  false)` + same-frame standalone `Mesh` with same geometry/matrix/material = 0 changed pixels;
  `material.clone()` swap = 0; fading the clone leaves the neighbor element byte-stable (0 changed
  px in its region across all fade steps); restore = 0 vs original baseline. **This is the
  BatchedMesh fade path** — and it never perturbs the shared material at all.
- **InstancedMesh per-instance alpha via onBeforeCompile attribute patch: WORKS**
  (`§P2_VERDICT INST_ALPHA=WORKS`, both renderers): faded instance changes monotonically, sibling
  instance byte-stable, outside region byte-stable, and the transparent-flip itself is 0-delta.
- **Transparent-pass flip at alpha=1** (`§P4`): 0-delta on SwiftShader; on real GPU, 1 (one) changed
  pixel at sub-measurable magnitude with overlapping instances — effectively safe, but the overlay
  approach avoids even that by never flipping the base mesh's material.

**Remaining scale consideration (named, not POC'd — needs the real viewer, i.e. implementation):**
overlay-hoist costs 1 extra draw call per concurrently-fading element for N frames. A camera
rounding a corner could start hundreds of fades in one tick; cap/stagger concurrent fades (or an
InstancedMesh overlay for the fading cohort) is the obvious shape, but measuring that belongs to
the implementation phase this gate still guards. All assumptions testable in isolation are now
tested; still no live wiring, no PR, `_useDlodPath`/`§WB_DLOD_VIS` untouched.

## 9. IMPLEMENTATION DESIGN — v1 (2026-07-21, user said "proceed"; §8 gate satisfied by the two
dated findings entries above; this section is the Spec-First artifact the code cites)

**Module:** new `viewer/dlod_nav.js` (IIFE-wrapped per `feedback_browser_iife_wrap_engines`),
loaded after `time_machine.js` in `viewer.html`. TM's DLOD internals are NOT modified — the four
prior retractions all involved coupling visibility systems; nav-scope is a sibling that reuses the
PATTERN (box-build query, distance+frustum test, wireframe look, pick-exclusion flags) with
mutual exclusion instead of shared state. `_useDlodPath`/`§WB_DLOD_VIS` untouched.

**Engage gate (all must hold, checked every tick — any failure = full disengage+restore):**
`_navPillOn && app.activeBuildingTotal > 50000 && !app.streaming && !app._tmOn (TM owns visibility
when open) && !A.activeGuidFilter (§3 scope decision: Find isolation = full disengage) &&
!A.activeStoreyFilter && A.hiddenDiscs.size === 0 (storey/disc filters own per-element visibility
— same conflict class as Find, same remedy) && !cinema (A._cinemaOrbitActive, new 3-line public
mirror of effects.js's private _cinemaActive) && !A._maxqActive && !A._stillRefineActive (§3:
Alt+C/Alt+P excluded)`.

**Decision rule (per element, §8 combo):** hysteresis two-state — promote to real when
`dist ≤ 50m AND bounding-sphere in exact frustum`; demote to box when `dist > 80m OR sphere+5m
margin outside frustum` (the +5m frustum margin is the angular analogue of the 50/80 distance
band — rotation jitter at the frustum edge must not re-trigger, same reason S261 added 50/80).
Between bands: state holds. Transitions run a 10-frame opacity cross-fade with `depthWrite:false`
on the fading materials (§8 FINDINGS #4).

**Transition mechanics — overlay-hoist for ALL three mesh types (§8 ADDENDUM B: BatchedMesh has
no per-instance alpha; overlay-hoist measured pixel-identical; used uniformly for simplicity):**
demote = hide real slot (Mesh.visible / InstancedMesh zero-scale caching `_origMatrix`, same
convention as `A.filterInstancedMesh` / BatchedMesh `setVisibleAt(false)`) + same-frame standalone
real-copy Mesh (geometry: own for Mesh; shared geo + `getMatrixAt` for InstancedMesh; for
BatchedMesh a new `bm.userData.slotGeo[slotId] = geo` reference recorded at flush — one additive
line in streaming.js, contract structures untouched) + standalone box-copy (wireframe clone);
real-copy fades 1→0 while box-copy fades 0→0.4; on completion overlays are disposed and the box
instance in the nav box-set goes visible. Promote = exact inverse. **Concurrency cap 128:**
transitions beyond the cap in one tick SNAP (today's shipped TM-DLOD behavior — graceful
degradation, not a new failure mode). Fades cancel+snap instantly on disengage.

**Box set:** own per-discipline wireframe `InstancedMesh` set, built with the same
`element_transforms JOIN elements_meta` query + `isBboxPlaceholder` (pick-exclusion, picking.js:257)
+ new `isDlodNavProxy` marker; never registered in `_instanceMeta`/`_batchMeta` (landmine 1);
disposed on pill-off/building switch.

**Driver:** own rAF loop, alive ONLY while the pill is ON (pill OFF = zero listeners, zero per-
frame work — W-DLOD-NAV-EQUIV is structural). Per frame: guard check (flag reads), camera pose
signature compare (TM camguard's string shape); evaluate transitions only on pose change or active
fades.

**Pill:** panels.js tool-registry entry (sibling of 'fly'), same box glyph as `tm-lod`, default
OFF, `isActive` highlight; on <50k buildings the toggle no-ops with a toast + `§DLOD_NAV_GATE`
log (registry is static; TM-style dynamic hiding not available there — accepted v1 tradeoff).

**Witness hooks:** `window.__dlodNav` = {mutations, active, boxed, fades, snaps} + `§DLOD_NAV_*`
log lines; `window.__dlodNavAudit()` recomputes the wanted partition from scratch and returns
mismatch count (drives W-DLOD-NAV-PROXY). W-DLOD-NAV-PERF runs on THIS machine's real GPU
(headless hardware-GL path proven in §8 ADDENDUM) on LTU + a city-view case, OFF vs ON, draw
calls + frame time. W-DLOD-NAV-NO-REBUILD asserts zero `§PERF_INCR_INDEX` and zero
`_instanceMeta`/`_batchMeta` registrations from nav-DLOD during a sustained orbit.

### §9 addition — USER-DICTATED mid-implementation (2026-07-21): "bboxes must not shine thru"
TM's shipped DLOD has an X-ray artifact: wireframe boxes write no face depth, so a boxed region
shows EVERY box through every other box (and through boxed facades). Nav-scope v1 must improve on
this: each per-disc wireframe box InstancedMesh gets a PAIRED depth-only InstancedMesh
(`colorWrite:false, depthWrite:true`, opaque pass ⇒ renders before the transparent wireframes;
same instance matrices, same zero-scale hiding; `isBboxPlaceholder` pick-excluded, marker
`isDlodNavDepth`). Effect: boxed masses self-occlude — only the visible outer shell's wireframes
render. Wireframe look itself unchanged (feedback_no_fake_lod_unbreakable). Fading overlay boxes
(10-frame transitions) deliberately skip the depth pass — a mid-fade element must not pop
neighbors' occlusion; 10-frame inconsistency accepted. TM's own pill keeps its current behavior
(out of scope here; port later if the user asks).

## 10. SHIPPED — 2026-07-21 (PR #935, auto-merge armed)
§9 v1 implemented as `viewer/dlod_nav.js` + pill (panels.js, sibling of Fly Tour) + slotGeo record
(streaming.js) + sw v836. All §4 witnesses PASS on real GPU (RTX 4060, LTU 122k, headless
hardware-GL — `w_nav_run4.log`):
- **W-DLOD-NAV-EQUIV PASS** — pill OFF: `mutations=0` across a 240-frame scripted sweep.
- **W-DLOD-NAV-PERF** (first real numbers for this mechanism, MEASURE-BEFORE-ESTIMATING satisfied):
  OFF baseline wide orbit **112.7ms/frame, 15,675 draw calls** (LTU free-orbit truly runs ~9fps
  today). ON, fully boxed: **17.3ms, 16 draw calls (6.5×)**. Close-in quarter-orbit at 25m with
  29,815 promoted real elements: **52.1ms (2.2×)**, 2,304 cross-fades executed.
- **W-DLOD-NAV-PROXY PASS** — `__dlodNavAudit()` mismatch=0 at settled pose after the promote leg.
- **W-DLOD-NAV-NO-REBUILD PASS** — 0 `§PERF_INCR_INDEX` post-engage; 16 box meshes, 0 registered
  in `_instanceMeta`/`_batchMeta`.
- **Restore PASS** — pill off: 0 nav meshes left in scene, `mutations` symmetric (521,022 total).
**Two mid-implementation corrections that ARE the perf story (recorded for future DLOD work):**
(1) per-slot hiding alone (zero-scale/setVisibleAt) cut only 15,675→13,639 calls — LTU's scene is
~16K SMALL MESH OBJECTS (meshAggs=16104), so the real lever is mesh-LEVEL `visible=false` when
every slot of a mesh is boxed (same `anyVisible` lever as `A.filterInstancedMesh`); (2) first
witness run was vacuous-GIGO (`REALIDX entries=0` — placeholders-only scene from a bad symlink;
8 draw calls should have been the tell vs the known-healthy 15-16K) — caught by reading the log,
not the verdicts. **Known honest costs:** eval spike 25-50ms per 150ms-throttled re-evaluation
while the camera moves (122k index; amortized mean stays 17ms); close-in p95 88.9ms; §7's
line-of-sight axis and any eval chunking remain future work, separate go.

### §10 live-user confirmation — 2026-07-21, Firefox on LTU (user: "working.. aesthetics ok, no
hangs.. slightly improved speeds")
Field log during a Fly Tour: `§DLOD_NAV active≈19-22k boxed≈100-103k eval_ms=9-18` — eval cost on
the user's machine is 9-18ms (vs 25-50ms in the headless witness runs), well inside the 150ms
throttle. Fades pinned at the 128 cap every eval with started=500-1500 (continuous camera motion →
constant transition churn; cap+snap behaving as designed). Depth-pass aesthetics approved.
**Why only "slightly improved" there:** an INTERIOR tour keeps ~20k elements real across most of
the ~16k mesh objects, so mesh-level visible=false rarely triggers — the 6.5× win is the WIDE-orbit
/aerial regime (everything boxed → 16 draw calls); interior legs are bounded by in-view real
geometry, and Firefox's missing WEBGL_multi_draw raises its per-instance BatchedMesh cost baseline
regardless. Expected shape, stated in §5 all along (aerial=box-proxy; interior's real lever is
room-level occlusion, still data-blocked). Remaining named lever for the tour experience: the
TOUR_ROUTE_CACHE.md §5 re-opened IDB fix (planning hang), separate go.
**Same-day field addendum:** user ran Night (N) + Alt+G GI simultaneously with nav-DLOD — "i am
fine with it." Compatible by design (lighting/post-processing modes don't touch per-element
visibility; not gate conditions). Their log also captured the largest live transition wave yet:
`started=47817 eval_ms=34` — one eval absorbed a ~48k-element wave (128 faded, rest snapped via
FADE_CAP) in 34ms, no hang: the cap's graceful-degradation path confirmed at full scale.

### §10 addendum — 2026-07-21 later same day: #942 re-measure + in-flight smoothness (PR #943)
**PR bim-ootb#942 (peer session's idle-deferred rooms warm-up in `toggleDlodNav`) re-measured on
the RTX 4060 as requested:** §DLOD_NAV_ROOMS wall-clock = **952-1188ms** across three runs (their
SwiftShader-confounded 50-100s estimate confirmed as a ~50-100× software-rendering contention
artifact). No W-DLOD-NAV-PERF regression (ON sweep 19.9-21.9ms across runs, same 3245 draw calls).
The change honors the room-blind review conditions (ON-branch only, fire-and-forget, engage
machinery untouched).
**User "still lagging in flight" root-caused with a 600-frame real-tour-flight profile:** the
150ms-cadence monolithic eval cost 42ms/hit (28% duty cycle). **PR #943: scan chunked to ~16k
elements/rAF tick (1.3-1.7ms/chunk, pass ≈8 frames)** → flight mean 96.1→79.5ms, frames>50ms
466→300/600, ON-sweep p95 53.8→37.3. **Negative result, recorded in-code and here — do not
re-try without new numbers:** a per-frame TRANSITION_BUDGET (384) measured WORSE (throttles the
engage/demote wave, scene stays half-real, sweep mean 19.9→92.5ms, draw calls 3245→7984);
transitions are NOT the flight bottleneck. **Honest remainder:** flight p50 ~114ms is genuine
in-view interior geometry cost — §5 track 2 (room-level occlusion, blocked on 1.3% containment
coverage) is the only lever left for interior legs; distance-based DLOD is done squeezing there.

**Prerequisite CLEARED 2026-07-21** — `prompts/done/CONTAINMENT_LTU_STOREY_ALIAS.md` (bim-compiler
PR #55): the 1.3% figure was a storey-naming mismatch (ARC/STR/MEP each spelled the same floor
differently), not a source-data gap. `compile_rooms.py` fix raises LTU_AHouse coverage to 24.2%
(314→30,409 rows), MEP now included.
**Correction — no OCI redistribution needed, ported to the client-side engine instead
(2026-07-21):** rooms aren't baked into a per-building DB and shipped as a static OCI artifact —
`A.ensureRooms()` compiles them client-side, on demand, from whatever DB a user (including one
bringing their own IFC building this codebase has never seen) has loaded, via `room_walker.js`
(the JS port of `compile_rooms.py`). That file had the IDENTICAL bug. bim-ootb PR #950 ports the
fix verbatim (parity witness confirms byte-identical numbers to the Python result) and bumps
`ROOM_WALKER_V` v2→v3, so the existing stage-3 version-stamp self-heal (`§NEEDLE_VERSION_STALE`,
`TOUR_ROUTE_CACHE.md` §6's cache-bust included) recompiles any already-loaded building once and
picks up the wider containment automatically — no DB redistribution, no per-building action at all.
Room-level occlusion (this file's track 2) is unblocked but still NOT implemented — that remains
the next session's job.

## 11. Room-level occlusion — STUDY TASK (2026-07-21, dispatch-ready — study before implementing,
per user directive: "It can be studied by the session first before doing")

**Do not implement from this section alone.** It names the mechanism to reuse, the real numbers
that motivate it, and the open design questions that must be resolved WITH CODE/MEASUREMENT before
any implementation PR — same discipline as §8's "GATED, report only" and §9's "IMPLEMENTATION
DESIGN" that came after it. First pass on this task = answer §11.2 with citations + numbers, write
the answers into this file, THEN a separate go for implementation.

### 11.1 GIVEN — what already exists to reuse (verified in code, not assumed)
- **Containment data is wide enough to build on:** `rel_contained_in_space` now covers 24.2% of
  LTU_AHouse (30,409 rows, all disciplines) post-`CONTAINMENT_LTU_STOREY_ALIAS.md`; self-heals to
  any other building automatically via the version stamp (§10 above).
- **The box-proxy state machine already exists and is the right mechanism to extend, not replace:**
  `dlod_nav.js` maintains `_boxIndex[guid] = {mesh, idx, matrix, pos, radius, state:'real'|'box'}`,
  promoting/demoting per-element on a `PROMOTE_DIST`/`DEMOTE_DIST` + frustum test, with a 10-frame
  cross-fade and a `FADE_CAP` snap-fallback at scale — all of this is DISTANCE/FRUSTUM-based and
  untouched by containment. Room-level occlusion is a SECOND criterion for the same promote/demote
  decision (element's room ≠ camera's current room ⇒ eligible to box), not a parallel system.
- **The `>50k` engage gate (`NAV_MIN_ELEMENTS`, `dlod_nav.js:26`) means dlod_nav today NEVER
  engages on Terminal (48,428 — confirmed live by the user this session, pressing 'o' correctly did
  nothing) or any building under that line** — room-level occlusion, if wired only into
  `dlod_nav.js`, would inherit the same size-blindness unless deliberately generalized. Whether
  that's correct (rooms only matter at scale) or wrong (a Duplex-scale building could still want its
  own interior-vs-exterior split during Fly Tour, cheaply) is 11.2 Q1.
- **Fly Tour ('L' key, `toggleFlyAround` → `_prepareGraphTour` → `A.ensureRooms()`) has NO size
  gate at all** — unlike `dlod_nav`'s 'o' key, it warms rooms on every building regardless of scale
  (confirmed this session: 'L' fires the NEEDLE chain on Terminal, sub-50k, where 'o' does not).
  Room occlusion tied to Fly Tour specifically would not inherit the 50k blindness.
- **Room-per-camera-position is already computed, but only at PLANNING time, not per-frame:** the
  Fly Tour route planner (`tour.js` §FLY_ROUTE / RoomGraph) already knows which room each `flyPts[i]`
  stop belongs to (seen live this session: `{"name":"⚠ VÅNING 1 R95"}` etc. in a real `§TOUR_PATH`
  dump) — this is a PATH-INDEXED lookup (which stop am I nearest, in the planned sequence), not a
  live point-in-room-rect test against the camera's actual current XY. Whether the planned-path
  index is accurate enough for occlusion (camera stays close to its planned path) or a live
  point-in-rect test is needed (same rect data the containment join already uses) is 11.2 Q2.

### 11.2 OPEN DESIGN QUESTIONS — resolve with code + numbers before implementing
1. **Scope by building size or not?** Measure room-count and elements/room on a below-50k building
   (Terminal: 48,428 elements — real per-discipline containment numbers already in
   `CONTAINMENT_LTU_STOREY_ALIAS.md`'s regression set) vs LTU (122k). Is the per-room element count
   (8.9 avg on LTU) similarly worth culling on a smaller building, or does `dlod_nav`'s existing 50k
   gate already mark the point below which this isn't worth the engineering? Answer with the actual
   numbers, not a guess.
2. **Current-room detection: reuse the planned-path index, or a live point-in-rect test?** The
   planned-path index is free (already computed) but only as accurate as "camera follows its planned
   route" — measure how far the ACTUAL camera position (not the plan) drifts from the nearest
   planned stop during a real flight (same `§FLYPATH_INIT`/camera-position log lines already used
   for other Fly Tour proofs this session) before assuming it's good enough. A live test would reuse
   the exact rect-containment math `compile_rooms.py`/`room_walker.js` already do (`abs(x-cx)<=sx/2
   && abs(y-cy)<=sy/2`), just evaluated against the CAMERA position instead of an element's, at
   whatever per-frame or per-N-frame cadence `dlod_nav`'s existing 150ms eval throttle suggests.
3. **Aerial/orbit legs must not lose the room test's own §5-track-1 lesson:** §5 already found that
   a blanket "hide anything not on camera's current storey" rule breaks aerial/orbit shots (no
   single current storey then). Room-level occlusion inherits the same failure mode one level finer
   — during an orbit/aerial `TOUR_PATH` action, there is no "current room" either. Reuse §5's own
   fix shape: gate room-occlusion to INTERIOR legs only (same signal §5.3 already named — storey/
   room membership from the path-planning data marks which actions are interior vs aerial).
4. **Interaction with the existing distance/frustum promote-demote, not a second box mesh set:**
   should room-mismatch be a THIRD demote condition alongside `DEMOTE_DIST`/frustum-margin in the
   SAME `_boxIndex` state machine (an element can be demoted for EITHER reason), or does it need its
   own hysteresis tuning (a room boundary is a hard cut, not a soft distance band — does the same
   10-frame cross-fade look right for "camera walked through a doorway," or does that need to be
   instant)? Needs a real interior-flight video/log comparison, not assumed to be identical.
5. **Below-50k buildings without `dlod_nav` engaged at all:** if Q1 concludes small buildings ARE
   worth it, room occlusion there has no existing box-proxy host to plug into — would need either
   generalizing `dlod_nav`'s engage gate (room-mismatch alone, no size floor) or a separate minimal
   mechanism. Do not build a third DLOD engine (`time_machine.js`'s own is already a cautionary
   precedent per its `assignStoreyByZ` mirroring note in `ROOM_INJECTOR_NEEDLE.md`) — extend
   `dlod_nav.js`'s existing gate/state machine if this is needed, per that doc's needle-sharing
   recommendation applied to this mechanism too.

### §11.2 FINDINGS — 2026-07-21 (STUDY dispatch: measured, not guessed; no implementation code
touched, per the §8 "report only" discipline)

**Method:** Q1 via the CURRENT walker (`lib/room_walker.js` v3 `§CONTAINMENT-ALIAS`, run in Node
against fresh copies of both extracted DBs — harness validated by reproducing §11.1's exact LTU
numbers: 30,409 rel rows / 24.2%). Q2/Q4 via a real Fly Tour flight on LTU in headless
hardware-GL Chrome (`§HARNESS_GL renderer=ANGLE (NVIDIA ... RTX 4060 Laptop GPU ... OpenGL
4.5.0)`), 122,330 elements loaded, CINE-GRAPH route (`§FLY_ROUTE storeys=4 stops=13/14 pts=97
illegalChords=0/92`), **12,628 frames recorded at 60.0fps (16.7ms mean)** of which **11,168 were
interior `flyPath` frames (~186s)**; per-frame camera position + walkActionIdx sampled via rAF,
analyzed offline (numeric log evidence only — no screenshots). Q3 by code reading of the
`df5def1` checkout. Code moved since §11.1 was written: `NAV_MIN_ELEMENTS` is now
`dlod_nav.js:28` (was :26), and #943's `EVAL_CHUNK=16384` chunked eval (`dlod_nav.js:39`,
`_evalChunk` ~:307) landed on top.

**Q1 — Scope by size: YES, keep the >50k gate. Room occlusion below it buys ≤4.2%.**
- LTU (125,698 meta rows): **422 rooms** (301 non-empty), contained **30,409 = 24.2%**, avg
  **72.1**/compiled room, **101.0**/non-empty, median 52, max 962.
- Terminal (48,428): **54 rooms** (40 non-empty), contained **2,045 = 4.2%**, avg 51.1/non-empty,
  median 34, max 176.
- **Correction to Q1's own prose:** "8.9 avg on LTU" was the PRE-alias number (§5's 1,608 rows /
  181 rooms at 1.3% coverage). Post-alias reality is 72–101 elements/room.
- Verdict: Terminal's theoretical max cull is ≤2,045 elements (4.2% of the building) — not worth
  the engineering, and sub-50k buildings render at the healthy baseline without dlod_nav anyway
  (§12). The existing 50k gate marks the right cutoff.
- Parity debt noted (not this task's scope): `scripts/compile_rooms.py --write` yields only
  **314** LTU rel rows — the `§CONTAINMENT-ALIAS` fix lives in the JS walker only (ported there
  per bim-ootb PR #950); the Python source of truth has not received it back.

**Q2 — Planned-path index DISPROVEN; live point-in-rect test required.**
- Measured camera drift from the nearest planned `flyPt` during interior legs: **mean 4.14m /
  median 3.60m / p95 10.37m / max 14.19m** (3D; XY-only mean 3.57m, max 13.56m). The drift is
  by-design: CatmullRom(0.5) smoothing (`tour.js:1160`) + adaptive SMOOTH damping
  (`tour.js:1204-1211`) keep the camera off its stops continuously.
- Direct verdict number: nearest-planned-stop room attribution agrees with a live point-in-rect
  test on only **39.3%** of interior frames (3,731 match + 656 both-null of 11,168). Median drift
  3.6m exceeds the half-width of LTU's typical rooms.
- The live test is cheap: one camera point vs 529 rect rows per eval (same
  `abs(x-cx)<=sx/2 && abs(y-cy)<=sy/2` math, `room_walker.js:1356`) — trivial next to dlod_nav's
  150ms eval throttle. ⚠ It must reuse the walker's own floor-anchor Z resolution
  (`_joinKey`/`floorAnchors`, `room_walker.js:1311-1337`): the harness's naive nearest-cz matching
  produced observable cross-floor picks (VÅNING_2 → VÅNING_1) at rect overlaps.
- Design fact for the null policy: the camera was inside a compiled room **83.7%** of interior
  frames; **16.3%** in no room (doorways/circulation) — "no current room ⇒ no room-based demote"
  needs to be an explicit state, not an edge case.

**Q3 — Interior-vs-aerial signal EXISTS at action granularity (confirmed, with one correction).**
- Interior = `act.type === 'flyPath'` (points are graph room/door/stair nodes at eye height,
  `tour.js:602-604`, actions assembled `:869-870`). Aerial/exterior = `orbit` (`:757-758`),
  `moveTo` Entrance (`:761`), Bird's eye (`:882`), Final (`:894`), and the closing `lookAround`
  — distinguishable from interior look-around beats because only the finale carries
  `lookAtX/lookAtY` (`:900-901`); the interior beats between flyPath segments (`:871-875`) hold
  camera position, so interior-ness persists through them.
- **Correction to §11.1's claim:** the planner carries room display NAMES per point
  (`act.names`, filled only for room/exit/stairwp nodes at `:603`, `''` for doorwp/circ/spine) —
  per-point room GUIDs and storeys (`ifcTrail`, `:576-605`) are computed then DROPPED (not in
  `_buildGraphRouteInner`'s return, `:642`). So the leg-level flag is free today; per-point room
  membership is not — moot given Q2's verdict anyway (live test wins).

**Q4 — Neither instant cut nor bare fade: same 10-frame fade machinery + a ~10-15-frame
membership-stability window.**
- Same flight: **236 room-membership changes** across 11,168 interior frames (**1.27/s** avg);
  gap between changes **median 19 frames (317ms)**, mean 49.3 (822ms), p95 257; 160 non-null room
  visits, median dwell 500ms; **17 A→B→A flap sequences returning within ≤10 frames**.
- Reading: a hard cut at 1.27 changes/s with ~100-1000 elements flipping per room (avg 101
  non-empty, max 962) would be constant popping. A bare 10-frame fade (167ms @60fps) is ~half the
  median transition gap, and the 17 flaps land INSIDE one fade duration — churn, not smoothing.
- dlod_nav's existing machinery already fits: state owned at fade START (`dlod_nav.js:254`),
  `FADE_FRAMES=10` (`:32`), snap beyond `FADE_CAP=128` (`:33`, `:235`) — a room switch is mostly
  snap territory by size, and the cap's graceful path is proven at 48k/34ms (§10). Recommendation:
  reuse it unchanged, gate the room-mismatch criterion on membership being STABLE for ~10-15
  frames first — filters all 17 observed flaps at the cost of ~0.2s switch latency, well under
  the 500ms median room dwell.

**Q5 — Not needed (per Q1).** Terminal's 4.2% / ≤2,045-element ceiling doesn't justify any
mechanism below the gate. If sub-50k containment coverage ever materially improves, the named
(NOT built) generalization is: split `dlod_nav.js`'s single engage gate (`NAV_MIN_ELEMENTS`,
`:28`, checked at `:68`/`:411`) into per-criterion gates — size floor stays for distance/frustum
boxing; the room-mismatch criterion would gate on containment coverage (contained-fraction ×
element count), not raw size. No third DLOD engine, per `ROOM_INJECTOR_NEEDLE.md`.

**§11.3 framing note:** PR bim-ootb #954 (landed `df5def1`) shipped the "Find Panel Room lens
calls `A.ensureRooms()` itself" follow-up — §11.3's second non-goal is now DONE upstream, so it
drops out of the non-goal list naturally; nothing folded into this scope.

**VERDICT: READY for an IMPLEMENTATION DESIGN section (§8→§9 pattern) — no further data needed.**
The design is pinned by the numbers above: (a) live per-eval point-in-rect current-room test with
the walker's floor-anchor Z-join, never the planned-path index (39.3% agreement kills it);
(b) room-occlusion active only during `flyPath` legs (signal exists today, Q3); (c) room-mismatch
as an additional demote criterion inside the existing `_boxIndex` state machine, using the
existing fade/snap path plus a ~10-15-frame membership-stability window (Q4); (d) explicit
"camera in no room ⇒ no room-demote" state (16.3% of interior frames); (e) scope stays >50k /
dlod_nav-hosted (Q1/Q5). Implementation is a separate go, gated on user review of these findings.

### 11.3 Non-goals (v1, same discipline as §3/§7)
- Time Machine occlusion — separate feature, separate go, once §11 settles the mechanism shape here
  (`ROOM_INJECTOR_NEEDLE.md`'s recommendation: share `A.ensureRooms()`, not the box-proxy engine
  itself, which is Fly-Tour/nav-specific machinery TM would need its own engage-gate story for).
- Find Panel's `isolateRoom` warming its own rooms (separate, smaller, already-named follow-up in
  `ROOM_INJECTOR_NEEDLE.md`) — unrelated to this occlusion mechanism, don't fold it in here.

## 12. Perf-history correction — the "R185/BatchedMesh was great, then it got worse" arc (2026-07-21,
user pushed back on a first-pass wrong theory; corrected trace below, cite this before re-asking)

**User's memory, verbatim shape:** first r185+BatchedMesh+DLOD pass felt great on LTU, then perf
"took a turn" during continuous testing since — **without ever pressing N (night) or H (shadow)**.
That last fact rules out a rendering-pipeline/feature-toggle explanation (a first-pass theory blaming
S277's Cinematic Rendering/night-mode lighting cost was wrong and is retracted here, in writing, so a
future session doesn't re-propose it). The real cause traces to the MACHINE, not the app:

1. **2026-05-26/27 — driver update, no reboot (`prompts/done/S280c_PERF_VERIFY.md`).** Two days after
   S276 (r184 BatchedMesh, "LTU 122K verified smooth", `45a393b62`), an NVIDIA driver bump (595.71)
   landed but the machine was never rebooted onto the matching kernel. Firefox's WebGL context
   silently fell back to the **Intel iGPU**, and LTU rendered at **83K draw calls** instead of its
   healthy count. Root-caused and fixed the next day (S280c, `47a69ee`): reboot + threshold/
   consolidation/render-gate fixes restored the real baseline — **~16K draw calls** (2500
   BatchedMesh @ ~87K slots + 13600 InstancedMesh @ ~35K instances).
   **Correction (2026-07-22, user pushback — "how could it run fast in FF for a while" if Firefox
   never had multi_draw?):** the ORIGINAL framing of this point ("no `WEBGL_multi_draw` there")
   wrongly implied Firefox had multi_draw before the iGPU fallback and lost it. Re-verified live,
   empirically, on THIS machine (WebDriver/geckodriver session against real system Firefox, real
   NVIDIA driver 595.71.05 active): `WEBGL_multi_draw` is **absent in Firefox regardless of which
   GPU it's bound to** — confirmed just now, not assumed from old docs. The real mechanism
   (`viewer/scene.js:47-54`): Three.js's `BatchedMesh` doesn't fail without `multi_draw` — it
   silently falls back to **one GL draw call per instance instead of one combined multi-draw call
   per bucket**. Firefox has ALWAYS been on that slower per-draw path on this GPU, including during
   the "fast" period right after S276 — nothing about multi_draw ever changed in Firefox. What
   actually changed was which PHYSICAL GPU was doing the (always-fallback) rendering: a discrete
   RTX 4060 has enough raw throughput to absorb the extra per-draw-call overhead and stay smooth;
   the Intel iGPU does not. The iGPU swap broke it, not a multi_draw regression.
2. **2026-05-24 → broke later → fixed 2026-07-13, i.e. 8 days before this conversation** (memory:
   `project_machine_chrome_firefox_gpu_launchers.md`). The SAME DAY as S276's r185 WebGPU test,
   `~/.local/share/applications/google-chrome-gpu.desktop` was created with PRIME render-offload +
   Vulkan/WebGPU flags, silently shadowing the normal Chrome icon. "Worked for a while, then broke"
   (a later driver bump or Chrome auto-update likely flipped it) — every load started failing WebGL
   context creation outright. Sat broken, invisible from inside the viewer, until 8 days ago.
3. **Permanent, not a regression — see point 1's correction above for the live-verified detail.**
   Firefox on this GPU never supports `WEBGL_multi_draw`, on any GPU it's bound to; BatchedMesh's
   per-instance-draw-call fallback is Firefox's constant state here, not something that broke.
4. **Today's §10 baseline (112.7ms/frame, 15,675 draw calls, wide-orbit OFF) matches S280c's
   "healthy" ~15-16K number almost exactly.** The system is in its normal state today, not a degraded
   one — §9/§10's `dlod_nav.js` box-proxy is a NEW layer stacked on top of that honest baseline, not a
   restoration of lost multi_draw throughput. The felt "took a turn" was most likely one or both
   machine incidents above landing inside the same continuous-testing window, silently, then getting
   fixed without the app itself ever telling the user why.

**Forward-looking question, answered:** if/when this machine's GPU/driver state improves further
(e.g. multi_draw reliably active, no more launcher/driver flukes), does that ADD ON TO today's
`dlod_nav` win, or regress it? **Adds on — the two layers are orthogonal, not competing.**
`dlod_nav`'s win comes from cutting the NUMBER of elements considered "real" at all (distance+frustum
demote to a ~16-draw-call box set); a faster/healthier BatchedMesh path underneath speeds up exactly
the promoted/real subset the same way it always did, and the boxed floor (~16 draw calls, wireframe)
is already near-free regardless of multi_draw. `W-DLOD-NAV-EQUIV` (pill OFF ⇒ byte-identical to
today's ordinary rendering) is the structural guarantee: OFF mode automatically inherits whatever the
underlying baseline is, good or bad, and ON mode multiplies a cut on top of it. **One honest caveat:**
the measured multipliers (6.5× wide-orbit, 2.2× close-orbit) are multipliers against TODAY's ~15-16K
baseline — if that baseline itself gets cheaper, there is less headroom to cut, so the *relative*
multiplier will likely shrink even though the *absolute* frame time keeps improving. Re-measure
(§4 witnesses), don't assume the 6.5×/2.2× numbers carry over to a faster baseline unchanged.

## 13. IMPLEMENTATION DESIGN v1 — room-mismatch demote, STEP 1 ONLY (2026-07-22, user: "spec and
implement a step first here so i can test incremental perf change"; §11.2 FINDINGS is the gate this
satisfies, same §8→§9 pattern)

**Scope of this step, deliberately narrow:** wire ONE new demote criterion (camera's current room ≠
element's contained room) into the existing `dlod_nav.js` `_boxIndex` state machine, live-toggleable
from the console with zero reload, so a real before/after frame-time number can be pulled on THIS
machine before any UI/pill work is done. Full UX polish (a proper pill, a user-facing toggle, default-
on decision) is explicitly deferred to a follow-up step once this number is in hand — this is the
smallest slice that produces a measurable, comparable perf delta.

**Module:** extend `viewer/dlod_nav.js` in place (no new engine — §11.1/§11.2(c) already ruled out a
parallel system). New code additive only; existing distance/frustum demote path untouched when the
new criterion is disabled.

**Current-room detection (§11.2 Q2's verdict — live test, not the planned-path index):**
- Per eval chunk (reuse the existing `EVAL_CHUNK`/`_evalChunk` cadence, `dlod_nav.js:39`/~:307 —
  do NOT add a second timer), compute the camera's current room via the SAME point-in-rect test
  `room_walker.js:1356` already uses (`abs(x-cx)<=sx/2 && abs(y-cy)<=sy/2`), reusing its floor-anchor
  Z-join (`_joinKey`/`floorAnchors`, `room_walker.js:1311-1337`) — the study's harness got cross-floor
  mispicks from skipping this; do not repeat that.
- **Explicit no-room state:** camera outside all compiled rects (measured 16.3% of interior frames)
  ⇒ room-criterion contributes nothing that tick; distance/frustum alone still governs. Never treat
  "no room" as "any room" or "eligible to demote everything."
- **Membership-stability gate (§11.2 Q4):** only update "camera's current room" after N consecutive
  evals agree (N=10-15 frames — the study measured 17 A→B→A flaps inside a single fade window without
  this; a bare per-tick room read would reproduce that churn). Track a small pending-room counter
  alongside the existing per-tick state, reset on disagreement.
- **Gate to interior legs only (§11.2 Q3):** room-criterion active only while the current tour action
  is `flyPath` (`tour.js:602-604`/`:869-870`) or, outside a tour, free navigation (no cheap "am I on
  an orbit/moveTo leg" signal exists outside the tour context — treat non-tour free-nav as interior by
  default, since there is no aerial/orbit leg concept there; only tour-driven orbit/moveTo/Bird's-
  eye/Final legs (`tour.js:757-758,761,882,894`) explicitly disable it).

**Demote/promote integration — SAME state machine, one more OR'd condition:**
- Demote condition becomes: `dist > DEMOTE_DIST OR frustum-margin-exceeded OR (roomOcclEnabled AND
  hasCurrentRoom AND element.containedRoom !== currentRoom)`. Promote is the inverse AND-of-NOTs.
  This is additive to the existing hysteresis (`dlod_nav.js` promote/demote bands) — do not fork a
  parallel demote path.
- Reuse the exact same fade/snap mechanics already shipped: 10-frame cross-fade
  (`FADE_FRAMES`, `:32`), state owned at fade start (`:254`), `FADE_CAP=128` snap fallback (`:33`,
  `:235`). No new transition code.
- Elements with no compiled containment row (75.8% of LTU, per §11.2 Q1) are simply never eligible
  for the room-criterion — distance/frustum still apply to them unchanged. Do not treat "uncontained"
  as its own bucket.

**Step-1 testing lever (the actual deliverable for "test incremental perf change"), NOT a UI toggle:**
`window.__dlodNav.roomOcclEnabled` — a plain boolean, default `false`, flippable live from DevTools
console on an already-loaded, already-flying scene (no reload needed to A/B). When `false`, behavior
and performance must be BIT-IDENTICAL to today's shipped `dlod_nav.js` (this IS the v1 "equivalence"
witness — see below). A real pill/pref-panel toggle is out of scope for this step; note it as the
obvious next step once a real number justifies shipping it broadly.

**Witnesses (blocking, real GPU — headless hardware-GL per every prior witness in this file):**
- **W-ROOM-OCCL-EQUIV:** `roomOcclEnabled=false` ⇒ scene/mutations byte-identical to current shipped
  behavior across a scripted sweep (mirrors `W-DLOD-NAV-EQUIV`'s method exactly).
- **W-ROOM-OCCL-PROXY:** `roomOcclEnabled=true` ⇒ boxed set matches a from-scratch recompute of
  (distance-eligible OR frustum-eligible OR room-mismatch-eligible), `mismatch=0`, same audit-fn
  pattern as `__dlodNavAudit()`.
- **W-ROOM-OCCL-PERF (the actual deliverable):** on the SAME interior LTU flight profile the study
  used (flyPath legs, real GPU, `§HARNESS_GL` real RTX 4060 log line required), report frame time and
  draw calls `roomOcclEnabled=false` vs `=true`, back to back, same route, same machine state. This is
  the first real number for whether room-mismatch demote helps interior legs at all — §10's own
  honest remainder said interior legs are "bounded by in-view real geometry" and named this exact
  mechanism as the only remaining lever; this witness is what confirms or falsifies that, no more
  hand-waving. Log with a `§ROOM_OCCL_*` tag; read the log before any conclusion, per this project's
  Log Mandate.
- **W-ROOM-OCCL-STABILITY:** confirm the flap sequences the study found (17 A→B→A within ≤10 frames on
  the same real flight) no longer trigger a room-state change, using the stability-gate counter.

**Non-goals (this step):** no pill/UI, no default-on decision, no Time Machine port, no Find Panel
fold-in — all already named out of scope by §11.3, unchanged here. If W-ROOM-OCCL-PERF comes back
negative (no measurable win on interior legs), that is a valid, reportable outcome — say so plainly,
do not keep tuning to force a positive number.

### §13 RESULT — 2026-07-22, real RTX 4060, `bim-ootb` branch `feat/room-occlusion-step1` @ `9b5d9dc`
(committed locally only — worker/Watchdog role separation, not yet pushed/PR'd; pending user review)

Implemented exactly as specced above: `viewer/dlod_nav.js`'s `_wantedReal()` gets a third OR'd
demote condition (`roomMis`), a lazy building-keyed camera-room index + per-element room stamp
(`room_walker.js`'s new `buildCameraRoomIndex()`, hoisting the exact `_joinKey` floor-anchor math
`writeRooms()` already used, so the camera-side test can't drift from the containment-side one), a
12-frame membership-stability gate, and interior-leg gating via `app.walkActions[idx].type`. Console
lever `window.__dlodNav.roomOcclEnabled` (default false), zero pill/UI as scoped.

**All 4 witnesses ran on this machine's real RTX 4060 (headless hardware-GL, `§HARNESS_GL` confirmed
each run):**
- **W-ROOM-OCCL-EQUIV: PASS.** `roomOcclEnabled=false` byte-identical to `origin/main`'s shipped
  `dlod_nav.js` across 8 deterministic poses (4 rooms + 4 orbit points) — same hash, same
  real/boxed/mismatch at every pose. (First run raced streaming and showed a spurious 125,698 vs
  122,330 total mismatch; re-ran clean and it resolved — a harness timing artifact, not a code
  difference, logged here so it isn't re-investigated as a regression later.)
- **W-ROOM-OCCL-PROXY: PASS.** Boxed set matches a from-scratch recompute at 3 spots: inside a small
  room (`roomOnlyBoxed=17`), inside a large room spanning most of a floor (`roomOnlyBoxed=4165`), and
  outside all compiled rooms (`roomOnlyBoxed=0, active=false` — explicit no-room state holds).
- **W-ROOM-OCCL-STABILITY: PASS.** A synthetic 24× 5-frame A↔B room flap (faster than any of the
  study's 17 measured real flaps) produced **zero** room-state changes; a genuine hold was still
  accepted in 12 frames both directions — the stability gate filters churn without deadlocking.
- **W-ROOM-OCCL-PERF: small draw-call win, frame-time a wash — honest result, not a dramatic one.**
  Real interior-flight A/B on LTU (122k elements), `roomOcclEnabled` false vs true, same CINE-GRAPH
  route both runs: **OFF** frame_ms mean=106.16 median=113.0 p95=228.6, drawCalls mean=3328. **ON**
  frame_ms mean=105.63 median=117.0 p95=237.5, drawCalls mean=3229, roomChanges=30 (confirms the
  criterion engaged continuously, not a no-op run). ~3% fewer draw calls, essentially no frame-time
  change (p95 marginally worse in this one sample). Matches §10's own prior prediction exactly:
  interior legs are "bounded by in-view real geometry," and room-mismatch only additionally boxes
  elements already inside the distance/frustum-eligible set but in a different room — for a typical
  interior camera position that set is small relative to the ~110k already-boxed baseline, so the
  extra cut is real but modest. **Caveat: only one clean OFF/ON pair, not the full interleaved
  off/on/on/off design** — the headless Chrome session crashed (`Target page, context or browser has
  been closed`) mid-run on the 3rd of 4 planned legs, on two separate attempts, at the same point
  both times. A second independent OFF sample from the first crashed attempt (mean=108.70,
  drawCalls=3317) is consistent with this run's OFF (mean=106.16, drawCalls=3328), giving some
  confidence in the baseline despite the incomplete interleave. The repeated same-point crash is
  itself worth a follow-up look (possible resource accumulation across sequential in-page tour
  restarts) — not chased down as part of this step.

**Where this leaves step 1:** mechanism works exactly as designed and is provably safe (EQUIV/PROXY/
STABILITY all clean), but the perf payoff on THIS building/route is small, not the dramatic win §10
hoped for. Open call for the user: ship this modest win as-is (PR + pill/UI as a follow-up step), hold
for a bigger-payoff scenario (denser multi-room interiors, lower-end hardware where every draw call
counts more), or treat the STUDY's mechanism as validated-but-not-yet-worth-shipping broadly.

**RESOLVED 2026-07-22 — user: "that is what we been waiting for."** Pushed + PR bim-ootb#962 opened,
honest result stated plainly in the PR description (not oversold). This closes step 1.

## 14. GPU capability warning — spec (2026-07-22, user: "u may launch an agent to do now")

**Problem this solves (§12's own root-cause finding):** both real machine incidents that degraded
this app's perf on this machine were **100% silent** — no in-app indication, ever. The iGPU fallback
(§12 point 1) and the broken Chrome launcher (§12 point 2) were each discovered only via felt
slowness over days/weeks, not anything the app told the user. The app already computes renderer
capability at load (`§RENDERER_CAPS` log line, `viewer/scene.js:47-54`) — it just never surfaces
that to the user or compares it against anything. This spec closes that gap.

**Design:**
- At the SAME point `§RENDERER_CAPS` already logs (`scene.js`, right after line 54), read a stored
  "last known good" renderer signature from `localStorage` (key `bim_gpu_lastgood`:
  `{renderer, multiDraw, ts}`).
- **No stored baseline (first-ever run on this browser/profile):** just store the current
  signature. No warning — nothing to compare against yet.
- **Compare current vs stored:** flag DEGRADED if `multiDraw` went `true→false`, OR the renderer
  string looks like it moved from a discrete GPU to an integrated one (simple, documented
  heuristic: previous string matched `/nvidia|amd|radeon/i` and current matches `/intel|uhd|iris/i`
  — do not over-engineer a full GPU classifier here, this heuristic only needs to catch the two
  real incidents already seen, not every conceivable GPU swap).
- **DEGRADED:** show one dismissible toast/banner ("Rendering fell back to a slower GPU (<renderer>)
  — if this seems wrong, check GPU drivers or reboot.") + a `§GPU_DEGRADED_WARN` console line. Do
  NOT nag every load once dismissed for the SAME degraded state — only re-show if the signature
  changes again (e.g. degrades further, or recovers then degrades again).
- **Same or IMPROVED:** silently update the stored baseline, no toast. An improvement (e.g. driver
  fixed, back on the dGPU) should refresh what "good" means going forward, not stay pinned to a
  stale weaker baseline forever.
- Cheap by construction: one `localStorage` read + conditional write, zero additional GPU queries
  beyond what `§RENDERER_CAPS` already does today.

**Witnesses (can run headless, no real degraded hardware needed — this is pure JS logic driven off
a mocked localStorage baseline, not a live GPU-swap):**
- **W-GPU-WARN-FIRSTRUN:** no stored baseline → no toast, baseline gets written.
- **W-GPU-WARN-DEGRADED:** stored baseline = discrete GPU + multiDraw=true; current = integrated +
  multiDraw=false → toast appears, `§GPU_DEGRADED_WARN` logs, baseline is NOT silently overwritten
  by the degraded reading (so the warning would still be meaningful if checked again without a
  session in between — confirm the actual persistence semantics chosen and pin them here).
- **W-GPU-WARN-RECOVERED:** stored baseline = degraded state; current = discrete GPU + multiDraw=true
  → no toast (improvement), baseline updates to the better state.
- **W-GPU-WARN-NONAG:** same degraded signature on two consecutive loads → toast shows once, not
  twice (confirm the exact "don't nag" mechanism, e.g. a session-only dismissed-flag vs a persisted
  one — pin whichever is chosen with a citation here).

**Non-goals:** no attempt to detect WHY the GPU changed (driver/reboot/launcher-flags) — this is a
symptom detector, not a diagnostic tool. No auto-fix action (reboot prompts, driver links) — just
visibility. No change to `§RENDERER_CAPS`'s existing log line itself.

## 15. Interior-lag POCs — GATED, REPORT ONLY, no implementation (2026-07-22, user: "wont it be
better to run POCs on all these? Once we get the formula right, then we know" — same discipline as
§8's cross-fade investigation: measure first, no live wiring, no PR, until reviewed)

**Why this is here:** discussing the "why does Fly still lag with only ~20k 'active' elements"
puzzle surfaced two live, UNMEASURED hypotheses — (1) per-triangle/vertex cost on top of element
count, (2) the `CINEMATIC_RENDERING.md` S277 FPS-notes estimate that "interior views: 60-70% of
in-frustum geometry is occluded" was never actually measured, just estimated back in May. Both are
worth a real number before anyone designs an implementation around them.

### POC-A: Triangle/vertex complexity of the "active" (real, non-boxed) set during interior flight
**Question:** is frame cost dominated by draw-call/CPU overhead (element count), or by raw
vertex/fragment cost (polygon complexity), or split roughly evenly?
- Extend the existing perf-harness pattern (`witness/harness.js`/`w_perf.js` from the room-occlusion
  task, or a fresh copy) to also sample `renderer.info.render.triangles` alongside `.calls`, per
  interior frame, same real-GPU interior LTU flight already used for W-ROOM-OCCL-PERF.
- Report: mean/median/p95 triangles-per-frame alongside the already-known draw-calls-per-frame
  numbers (mean=3328 OFF baseline). Cross-reference against the ~20k "active" element count to get
  an average triangles/element figure — compare that against a few known element classes (a plain
  wall panel vs a railing/stair/MEP run) to judge whether complexity is concentrated in a few
  high-poly classes or evenly spread.
- Cheap, quick — no new infrastructure, just an added sample point on an existing harness.

### POC-B: Real occlusion percentage — replace the untested "60-70%" estimate with a measured number
**Question:** of the ~20k elements distance/frustum currently calls "active" (real) during an
interior leg, how many are ACTUALLY visible (clear line of sight to camera) vs genuinely occluded
(a wall/floor/slab blocks the sightline) — right now, TODAY, on real LTU data, not a May guess?

**Stage 0 — REQUIRED FIRST, sandbox correctness proof (user: "i believe it is just algorithm maths,
in a sandbox, setup of test elements, cam moving to and fro, witnessing of values" — 2026-07-22):**
before this touches the real 122k-element LTU building at all, prove the line-of-sight math itself
is correct against a small, KNOWN-ground-truth synthetic scene — same methodology this file already
used for `§CAMIDX_SELF`/`§CAMIDX_XFLOOR` (room_walker's floor-anchor join proven against
self-consistent synthetic checks before trusting it on real data).
- Build a tiny synthetic scene (plain Node + `three` + `three-mesh-bvh`, no browser/GPU needed — this
  is pure geometry math): a handful of test elements with HAND-PICKED, known positions — e.g. one
  blocking wall plane between camera and a target box (expected: occluded), one target box with clear
  line of sight (expected: visible), one target partially behind a wall edge (expected: boundary case
  — decide and document which way it should classify).
- Move the camera through a small SCRIPTED sweep (to-and-fro along a line, not a full flight) —
  several fixed positions where the expected clear/occluded verdict for each test element is known
  in advance BY CONSTRUCTION (you built the geometry, you know the answer), not estimated.
- At each camera position, run the SAME raycast-occlusion function the real POC-B measurement below
  will use, and witness its output against the hand-computed expected verdict per test element per
  camera position — `mismatch` must be 0. This is the correctness gate: if the algorithm gets the
  synthetic case wrong, fix the math here BEFORE spending any time on the real building.
- Only once this passes cleanly does Stage 1 (below, real LTU data) proceed.

**Stage 1 — apply the proven algorithm to real LTU data:**
- **Reuse, don't rebuild:** `viewer/loader.js` already monkey-patches `THREE.Mesh.prototype.raycast`
  via `three-mesh-bvh`'s `acceleratedRaycast`, and `viewer/streaming.js` (~line 737-752) already
  computes a BVH bounds tree for every mesh geometry AND every BatchedMesh bucket
  (`computeBatchedBoundsTree`) during normal streaming — full-scene accelerated raycasting already
  exists, confirmed by direct grep, not assumed. A line-of-sight occlusion POC is a raycast from the
  camera to each candidate element's center (or bbox corners for a stricter test), checking whether
  anything else in the scene intersects that ray BEFORE reaching the target — reusing this exact
  existing acceleration structure, not building a new one.
- **Method:** during the same real interior LTU flight (headless hardware-GL, real GPU, same route
  already used for W-ROOM-OCCL-PERF), at a sampled cadence (every N frames, not every frame — this
  is a report-only cost measurement, keep the POC's OWN overhead from confounding the frame-time
  numbers being investigated), cast one ray per "active" element from camera position to element
  center. Classify: **clear** (ray reaches target unobstructed) vs **occluded** (something blocks
  it first). Report the real occluded fraction, compared directly against the "60-70%" estimate.
- **Known landmine to test for, not assume away:** a raycast can validly hit the TARGET element's
  own geometry first (self-intersection) — exclude the target mesh/instance itself from the
  occlusion test, the same way picking code already has to (`picking.js`'s existing self-exclusion
  pattern, if one exists — check before writing a new one).
- **From the measured occluded fraction, compute the CEILING, not a promise:** if X% of the active
  set is genuinely occluded, and (per §10's own finding) draw-call savings only materialize when a
  whole mesh/BatchedMesh bucket empties, report BOTH the raw occluded-element percentage AND a
  more honest bucket-level estimate (how many of LTU's ~16,104 mesh objects would have EVERY one of
  their visible instances occluded, vs how many have a mix of occluded+visible instances and
  therefore wouldn't save a draw call even with perfect occlusion culling). This second number is
  the real ceiling on what real occlusion culling could buy — report it even if it's much smaller
  than the raw occluded-element percentage.

### Deliverable
Write findings into this file (dated, cited, real numbers — same format as §11.2 FINDINGS/§13
RESULT) with an overall verdict: is real occlusion culling worth designing as a follow-up spec (§16
IMPLEMENTATION DESIGN, same §8→§9/§11→§13 pattern), not worth it, or is the honest bucket-level
ceiling too small to bother — same "negative result is a valid, reportable outcome" discipline as
every prior POC in this file. **No implementation code in this pass** — raycasting/sampling scripts
for the POC itself are throwaway measurement tools, not the eventual occlusion-culling mechanism.

### §15 FINDINGS — 2026-07-22 (Fable, REPORT ONLY — no shipped file touched; scripts + logs
committed locally in `/tmp/wt-occl-poc` worktree, branch `poc/occlusion-culling-study` off
`e84a079`, NOT pushed/PR'd per dispatch)

**Method + Stage 0 gate (per the user's "prove the algorithm maths in a sandbox first"):** the
line-of-sight classifier lives in ONE file (`witness/occl_classify.js` — center-ray, guid-based
self-exclusion mirroring picking.js's hit→guid resolution, non-element hits ignored, non-finite
distances guarded) and is used VERBATIM by both stages. Stage 0 (`witness/w_occl_stage0.mjs`, plain
Node + `three@0.184` + `three-mesh-bvh@0.8.0`, no browser): hand-placed AABB scene (wall 4×3×0.2 +
3 targets incl. a wall-edge boundary case), 21-pose to-and-fro sweep, expectations from an
INDEPENDENT segment-vs-AABB slab oracle + a 6-row hand-derived literal table.
**`§OCCL0_RESULT checks=63 mismatch=0 handChecks=6 handMismatch=0 selfFirstSeen=35 verdict=PASS`** —
boundary rule pinned: verdict follows the CENTER ray only (a half-exposed element with blocked
center classifies occluded). Stage 1 ran only after this gate. Both Stage 1 runs on real RTX 4060
(`§HARNESS_GL renderer=ANGLE (NVIDIA ... RTX 4060 Laptop GPU ... OpenGL 4.5.0)`), LTU 122,330
elements, DLOD-nav ON, `roomOcclEnabled` default false (shipped state), CINE-GRAPH tour route.

**POC-A RESULT — triangle load is trivial for the GPU; neither triangles nor draw calls explain
interior frame-time variance (`witness/w_occl_poca.log`):**
- 3,000 interior flyPath frames: frame_ms mean=109.03 median=119.4 p95=247.9 (cross-checks §13's
  OFF mean=106.16); triangles/frame mean=3,365,410 median=3,418,136 p95=4,181,646 max=4,704,151;
  drawCalls mean=3,262 median=3,333 p95=4,757; dlodActive mean=19,987 boxed mean=102,343 →
  **168.4 tris/active element, 1,032 tris/draw call** (`§POCA_TRIS`/`§POCA_PER_ELEMENT`).
- Correlations (`§POCA_CORR`): r(frame_ms,triangles)=**0.197**, r(frame_ms,drawCalls)=**0.190**,
  r(triangles,drawCalls)=0.950 (collinear — can't separate observationally). ~3.4M tris is nothing
  for an RTX 4060, yet frames average 109ms → per-triangle GPU cost is NOT the bottleneck; the cost
  rides on object/submission count + per-frame CPU work, consistent with dlod_nav.js's own prior
  W-DLOD-NAV-PERF finding ("the scene is ~15K small mesh objects, the object-level flag is the
  lever", dlod_nav.js ~:175) and §13's 3%-fewer-calls ⇒ frame-time-wash result.
- Census (`§POCA_CENSUS`, all 122,330 elements = 12,955,180 tris): mean 105.9 tris/el, median 92,
  p95 232, p99 828, max 10,726 — complexity is mostly FLAT, not concentrated. Biggest classes by
  triangle share: IfcFlowFitting 24.0% + IfcFlowSegment 20.1% (74,210 MEP elements, avg 62-97
  tris/el — share comes from COUNT, not per-element weight); concentration exists only in IfcDoor
  (606 els, avg 2,302 tris, 10.8%) and IfcFurnishingElement (242 els, avg 2,074 tris, 3.9%) —
  LOD-simplification candidates, but only ~15% of total tris combined. **Verdict: element/object
  count is the axis that matters; per-element polygon complexity is not LTU's problem.**

**POC-B RESULT — the May-2026 "60-70% of in-frustum geometry is occluded" estimate
(`docs/internal/CINEMATIC_RENDERING.md:91`, never measured) was a large UNDERestimate. Measured:
~99% (`witness/w_occl_stage1.log` + `w_occl_stage1_run1_nofrustum.log`):**
- Method: 8 camera poses captured DURING the live tour at 350-interior-frame cadence, then frozen
  and classified after it (full active set per pose, one center-ray per element vs all visible
  element geometry — keeps POC cost out of frame timing; POC-A owns timing). Self-exclusion path
  exercised for real (selfFirst up to 776/pose); `noCenter=0` — full coverage.
- **Run 2 (frustum-split, the honest one), `§POCB_SUMMARY`: occluded fraction of the ACTIVE set
  mean=99.4% median=100.0% min=95.9% max=100.0%; of the IN-FRUSTUM active subset (the estimate's
  own phrasing) mean=99.6% min=97.8% max=100.0%.** Active sets 19,983-36,720/pose; in-frustum
  14,186-36,457; clear-LOS elements were literally 1-826 per pose — an interior camera in LTU truly
  sees a few hundred elements; the ceilings/coverings (24,321 IfcCovering) wall off the 74k MEP
  elements above them.
- **Bucket-level ceiling — the number §15 said matters more — is NOT much smaller: objects whose
  EVERY active element is occluded = mean 98.5% (all-active rule) / 99.1% (in-frustum rule)**
  (`§POCB_BUCKET`, objWithActive 3,291-5,812/pose vs rendererCalls 3,755-5,885 — same magnitude, so
  bucket-emptying maps ~1:1 onto real draw calls). Run 1 (pre-frustum-split, higher-mismatch
  settle) independently agrees: raw 99.8%/bucket 99.5% — the conclusion is insensitive to the
  settle imperfection (audit mismatch was still 21-18,009 at pose freeze even with forced-dirty
  settle; both runs bracket it and agree).
- **Caveats, stated plainly:** (1) the POC's per-element CPU raycast took **91-279 s PER POSE** —
  this measurement method is ~4 orders of magnitude off real-time and is NOT the mechanism; any
  implementation needs GPU occlusion queries (the doc's own WebGL2 suggestion) temporally amortized,
  or a precomputed room/portal visibility structure — never per-frame CPU rays. (2) Center-ray
  granularity can misclassify a partially-visible element as occluded (Stage-0-pinned rule), so the
  raw % is a shade optimistic — but the margin over 60-70% is ~30 points; the conclusion survives
  any plausible correction. (3) One-ray-per-element ≠ pixel truth; bbox-corner rays would tighten
  it (documented option, not needed to answer the gate question). (4) Incidental code finding:
  `streaming.js:748-752` calls `window.computeBatchedBoundsTree` but NOTHING ever defines it — the
  BatchedMesh-BVH step in §15's premise has been a silent no-op guard all along (Mesh BVH via
  `loader.js:203` is real; batched raycast used three r184's native per-instance-visible path,
  which is what made this POC correct w.r.t. hidden slots anyway).

**OVERALL VERDICT: YES — real occlusion culling merits a §16 IMPLEMENTATION DESIGN spec.** The
measured ceiling is ~99% of active elements / ~98.5-99.1% of draw-call buckets during interior
legs — not the 60-70% guessed, and nothing like §13's ~3% room-mismatch cut (room-occlusion only
catches OTHER-room elements; this measures true line-of-sight). Emptying ~98% of buckets would take
interior frames from ~3,300-5,900 draw calls to a few hundred at most — a regime change POC-A says
attacks the RIGHT axis (object/submission count, not triangles). Honesty requirement for §16: §13
proved a 3% call cut moved nothing, so the spec's witness must A/B the actual frame time, not just
the call count — the win is plausible but only the implementation's own W-perf run can prove the
~99% visibility ceiling converts to frame-time. §16 must also pick a real-time mechanism up front
(GPU occlusion query w/ N-frame reuse, or compiled-room portal visibility) — the POC's raycast
method is measurement-only by construction.

## 16. IMPLEMENTATION DESIGN — real occlusion culling (2026-07-22, design only per §8→§9/§11→§13
discipline; no shipped code in this pass, a separate go implements it)

### 16.1 Why §13's mechanism undercounts the §15 ceiling — the gap this design closes
§13's room-mismatch demote (`viewer/dlod_nav.js` `_wantedReal`, shipped on branch `feat/room-
occlusion-step1` @ `e84a079`, NOT yet on `main` — confirmed live, `main`@`df5def1` still has only
the distance/frustum test) only boxes an element when `e.room !== _roomCur` (strict equality,
`dlod_nav.js:394` on that branch) — camera's current room vs the element's OWN room, nothing about
what's actually visible FROM the current room. Two things this misses that §15's ~99% figure
captures: (a) an element in a DIRECTLY-adjacent room through an open doorway is "mismatched" and
gets demoted even though it may be genuinely visible (a false demote §13's own 3-spot PROXY witness
didn't test for, because it only checked "inside a room" / "outside all rooms", never "in the next
room over"); (b) most of what §13 measured as only a 3% additional cut is because distance/frustum
had ALREADY boxed the majority of other-room/other-floor elements — the residual 3% is the SMALL
set that survived distance/frustum but failed room-equality. §15's true line-of-sight test, run on
the SAME building/route, found the ACTIVE set (already distance/frustum-real) is ~99% occluded —
meaning most of what distance+frustum call "real" is other-room/other-floor geometry seen through
open frustum cones but blocked by walls/slabs that room-EQUALITY never flagged because §13 never
asked "can the current room see that room," only "is it the same room."

### 16.2 Mechanism choice — portal/PVS on the compiled room graph, GPU occlusion query as fallback
**Primary: precomputed room-to-room Potentially-Visible-Set (PVS), not a per-frame GPU query.**
Reasons, weighed against the two options this file's own history already put on the table:
- **§7 already flagged GPU occlusion queries' "latency/driver-inconsistency/per-object overhead"
  as a reason to prefer a CPU/precomputed approach** over live hardware queries — that concern
  wasn't resolved, just deferred to when a real design was needed. It's needed now.
- **§15 Stage 1 already proved per-frame CPU raycasting is 4 orders of magnitude too slow**
  (91-279s/pose) — ruling out a live-raycast mechanism too. What's left is something computed
  ONCE (at compile/graph-build time) and looked up cheaply at runtime.
- **The exact data a portal/PVS needs already exists, unbuilt-on:** `common/room_graph.js`'s
  `buildGraph()` already emits `E1` edges (`{a:roomGuidA, b:roomGuidB, doorGuid, storey, kind:'E1'}`
  — a REAL door directly connecting two rooms, `room_graph.js:407-408`), `E2` (room↔CIRC/hallway),
  `E5` (corridor-junction↔junction), `E8` (corridor-room↔junction), and `E3` (stair groups bridging
  storeys ONLY at the stair's own footprint, `:518`, WalkerDoctrine's one trusted stair extractor).
  These edges ARE portals — a doorway or open corridor junction is exactly the "can room A see
  through to room B" relationship a PVS needs, already measured from real geometry, not invented
  for this task.
- **This is the SAME "prepared vocabulary, not real-time logic" principle
  `FLY_TOUR_CORRIDOR_GRAPH.md §VOCABULARY_NOT_REALTIME` already commits this codebase to** — extend
  the compiled graph (a new derived artifact: room→visible-room-set) rather than add a live
  geometric computation per feature. GPU occlusion query would be exactly the kind of "grow its own
  real-time... logic" that section warns against when a compiled alternative exists and is cheap.
- **GPU occlusion query is kept as a named fallback, not discarded**, for the specific case portal/
  PVS cannot handle by construction: open-plan/atrium spaces where room compilation itself is weak
  or absent (§10's storey-occlusion track already named atria/stairwells as the exception to
  opaque-floor culling), or if 16.4's Stage-0 validation shows the 1-hop portal assumption is too
  coarse. Spec for that fallback is in 16.5 — build it ONLY if 16.4 falsifies portal/PVS.

### 16.3 Portal/PVS design
- **Cells** = compiled rooms already in `spatial_structure` (RM_ guids), identical to what
  `buildCameraRoomIndex()` (`viewer/lib/room_walker.js:1285`, `e84a079`) already resolves a camera
  position to — reuse that function verbatim for "what room is the camera in now," unchanged from
  §13's step 1 (including its `_makeJoinKey` floor-anchor Z-join, `:1260` — the exact fix for the
  VÅNING_2→VÅNING_1 cross-floor mispick §11.2 Q2 found).
- **Portals** = graph edges of kind `E1`/`E2`/`E5`/`E8` on the SAME storey (a doorway or open
  corridor junction transmits visibility); `E3` (stairs) transmits ONLY between the two rooms/
  landings the stair group itself directly touches, never "the whole floor above is visible" — this
  mirrors §5's own atrium/stairwell carve-out for storey-occlusion, applied here at room grain.
  Door open/closed state is NOT modeled (no per-frame IFC operation-state exists) — a portal is
  always "open" for this purpose. This is a deliberate CONSERVATIVE bias: it can show a few elements
  through an actually-closed door (safe — a false "still real" costs a few extra draw calls, never a
  popping/missing-geometry bug), never hides something genuinely visible.
- **visibleRoomsFrom(roomGuid)** = `{roomGuid}` ∪ every room reachable via ONE portal hop (depth=1,
  default — see 16.4 for why this needs validating before trusting it, not assuming it). Computed
  once per room via a shallow BFS over the already-built graph's edge list, cached as
  `Map<roomGuid, Set<roomGuid>>` alongside the existing `_pathGraphCache`/`A.getRoomGraph()` (never
  a second graph cache — `FLY_TOUR_CORRIDOR_GRAPH.md` R2's "reuse one cache" rule applies here too).
  Trivial cost: room counts are in the 10s-100s (LTU 422, Terminal 54, §11.2 Q1) — a full BFS over
  every room is microseconds, done once per building load/graph rebuild, not per frame.
- **Runtime integration is a ONE-LINE change to §13's already-shipped-and-witnessed mechanism**,
  not a new state machine: `dlod_nav.js`'s `roomMis` (`:394` on `e84a079`) changes from
  `e.room !== _roomCur` to `!visibleRoomsFrom(_roomCur).has(e.room)` — the exact same OR'd
  criterion slot, the exact same `_roomActive`/interior-leg gating (`:385`), the exact same
  `ROOM_STABLE_N=12`-frame membership-stability gate (`:55`), the exact same fade/snap machinery
  (`FADE_FRAMES`/`FADE_CAP`, unchanged), the exact same explicit no-room state (`_roomActive =
  (_roomCur !== null)`, `:385`). Everything §13 already proved safe (EQUIV/PROXY/STABILITY) stays
  proved safe by construction — only the SET an element is checked against grows from "one room" to
  "one room's visible set."
- **No new UI/pill** (unchanged non-goal from §11.3/§13), no Time Machine port (unchanged non-goal).

### 16.4 Stage 0 — REQUIRED validation before trusting depth=1, same discipline as §15's own Stage 0
**Do not implement 16.3 with depth=1 assumed correct — measure it first**, exactly as §15 refused
to trust its own raycast classifier on real data before a synthetic ground-truth gate.
- §15's own POC scripts (`/tmp/wt-occl-poc`, branch `poc/occlusion-culling-study` @ `6d95ac1`,
  `witness/w_occl_stage1.js`) already compute a per-element CLEAR/OCCLUDED verdict per pose but only
  persist AGGREGATES (`witness/w_occl_stage1_poses.json` — confirmed by direct read: `activeTotal`/
  `occluded`/`clear` counts only, no per-guid rows) — the per-element verdict + guid exists
  transiently in that script's loop (`w_occl_stage1.js:180-194`) and is thrown away. The cheapest
  next step is NOT a new POC: add one line to dump `{guid, verdict, room: e.room}` per classified
  element in that same loop, re-run on the SAME already-captured 8 poses.
- **Validation question:** of the elements classified `clear` (genuinely visible), what fraction
  have `room === cameraRoom` (depth 0) vs `room` reachable via one portal hop from cameraRoom
  (depth 1) vs neither (depth 2+ or no portal path at all — a PVS miss)? Report this distribution
  per pose. If depth ≤1 covers e.g. ≥95% of `clear` elements, depth=1 is the right default. If a
  material fraction of `clear` elements sit at depth 2+ (e.g. visible down a straight double-door
  corridor two rooms over), extend BFS to depth=2 for `E2`/`E5`/`E8` (corridor/junction) edges only
  — corridors are architecturally the case where sightlines legitimately travel multiple hops,
  rooms behind closed doors are not.
- **Report the inverse too:** of elements the PVS at the chosen depth would mark visible (in the
  visible-set), what fraction the ground-truth raycast actually classified `occluded`? This is the
  "false real" rate — the cost of the conservative bias in 16.3. Must stay small enough that it
  doesn't erase §15's ~99% ceiling (a PVS that's visible-set-too-generous just reduces the win, it
  never causes a correctness bug, per 16.3's "safe direction" framing — but report the number rather
  than assume it's small).
- Only once this passes with a stated, defensible depth does 16.3 proceed to implementation.

### 16.5 GPU occlusion-query fallback — spec only, build IF 16.4 falsifies portal/PVS
Kept minimal, per §7's own caution, and scoped to the residual set portal/PVS leaves ambiguous —
never a full per-element per-frame sweep:
- **Per-BUCKET, not per-element:** issue `EXT_occlusion_query_boolean`/`ANY_SAMPLES_PASSED_
  CONSERVATIVE` (WebGL2) queries against each BatchedMesh bucket's own combined AABB proxy — buckets
  are already the draw-call unit (`§10`/`§13`'s own framing: emptying a BUCKET is what saves a
  call), and there are only ~2,500 of them (§0-2 baseline) vs ~110k+ elements, directly answering
  §7's "per-object overhead" concern by construction.
- **Only query buckets portal/PVS left UNRESOLVED** (i.e. contains a mix of visible-set and
  not-visible-set elements per 16.3 — a bucket portal/PVS can already fully resolve either way needs
  no query at all). This bounds query count to the genuinely ambiguous cases.
- **N-frame temporal reuse**, reusing the SAME `ROOM_STABLE_N`-scale window already tuned by §11.2
  Q4/§13's stability gate (~10-15 frames) rather than inventing a new constant — query issued, result
  read back ASYNCHRONOUSLY on a LATER frame (never a synchronous `getParameter` stall, the classic
  occlusion-query correctness bug), reused for the window, re-issued after.
- Non-goal unless 16.4 requires it: do not build this speculatively. Portal/PVS alone, if 16.4
  validates it, is the whole mechanism — this section exists so a future session doesn't have to
  re-derive the shape from scratch if 16.4 comes back negative.

### 16.6 Witness plan — frame-time A/B is the gate, not draw-call count (the session's own mandate)
Same EQUIV/CORRECT/STABILITY/PERF pattern §13 already ran, extended:
- **W-PVS-EQUIV:** mechanism flag off (default) ⇒ byte-identical to §13's shipped `e84a079`
  behavior across the same 8 deterministic poses (regression floor: this design must not silently
  change §13's OWN behavior when the new flag is unset).
- **W-PVS-CORRECT:** `visibleRoomsFrom()` at the chosen depth, computed fresh, matches a from-
  scratch BFS recompute; cross-checked against 16.4's ground-truth clear/occluded split (report
  agreement %, not just "it ran").
- **W-PVS-STABILITY:** reuse §13's exact flap-resistance test (24×5-frame A↔B flap ⇒ zero room-
  state changes) — the stability gate is unchanged, only what's being gated changed.
- **W-PVS-PERF — the decisive witness, per this session's charter:** real interior-flight A/B on the
  SAME machine/GPU/route already used for §13/§15 (LTU CINE-GRAPH tour), mechanism OFF vs ON,
  reporting frame_ms mean/median/p95 AND draw calls AND a NEW number — count of BatchedMesh buckets
  with zero active instances this frame (the thing that actually removes a draw call) — per frame,
  both runs. **Draw-call count alone is not sufficient evidence, per §13's own lesson** (3% fewer
  calls, frame-time unmoved) — report frame_ms honestly even if it doesn't move, and if it doesn't,
  investigate WHETHER the bottleneck is CPU submission overhead that persists even for skipped
  buckets (e.g. `renderer.render()`'s own per-object traversal cost) before concluding occlusion
  culling "doesn't work" — that would itself be a valuable, reportable finding, not a reason to keep
  silently retuning until a number looks good (this file's own standing discipline, §13/§15 both).
- **Non-goals (unchanged):** no pill/UI, no default-on, no Time Machine port, no cross-building sweep
  beyond LTU (+ Terminal as the small-building regression check, matching §13's own pattern).

### 16.7 Open questions for user review before the implementation go
1. Depth=1 vs depth=2-for-corridors default, pending 16.4's actual measured distribution (not
   guessed here).
2. Whether the "false real through an always-open portal" bias (16.4's inverse check) is small
   enough to ship without also modeling door open/closed state — and if not, whether that state is
   even extractable from source IFC data (`IfcDoor.OperationType` is static, not a live position).
3. Whether 16.5's GPU-query fallback is worth building at all if 16.4 validates portal/PVS cleanly,
   or should stay a documented-not-built option indefinitely (matching §15's "throwaway measurement
   tools, not the eventual mechanism" framing for its own raycaster).

### §16 RESULT — 2026-07-22, real RTX 4060, `bim-ootb` branch `feat/room-occlusion-pvs`
(worktree `/tmp/wt-occl-pvs` off `origin/main`@`be8f122`, committed locally only — same worker/
review-later split §13 used, not yet pushed/PR'd)

Implemented exactly as specced: `common/room_graph.js`'s `buildRoomPVS(graph, opts)` (0-1 BFS —
E1/E3 "door crossing" edges cost 1, all circulation edges free, `maxDoorCrossings` default 1) +
`viewer/dlod_nav.js`'s `pvsEnabled` console lever (default false), replacing §13's plain
`e.room !== _roomCur` equality with PVS set-membership inside the SAME `_roomMismatch()` helper
now shared by `_wantedReal` and `__dlodNavAudit` — a genuinely one-line semantic change at the
call site, gated behind its own default-false flag so §13's shipped behavior is provably untouched
when it's off.

**W-PVS-EQUIV: PASS.** `pvsEnabled=false` (with `roomOcclEnabled=true`, §13's mechanism actually
engaged, not both flags dormant) produced a byte-identical 4-pose fingerprint/audit record against
`origin/main`'s shipped `dlod_nav.js` swapped onto disk in its place (the harness's own established
swap method) — `witness/w_pvs_equiv_pvs-off.json` == `witness/w_pvs_equiv_shipped-main.json`,
diff clean.

**W-PVS-CORRECT: PASS.** Pure-Node sql.js run (`witness/w_pvs_correct.js`, no browser) against real
LTU_AHouse (371 rooms) and Terminal (55 rooms): shipped `buildRoomPVS` agreed guid-for-guid with an
INDEPENDENTLY-written reference 0-1 BFS on every room (`mismatchRooms=0` both buildings), every
room's own set contained itself (`selfMissing=0`). Sane, non-degenerate size distribution: LTU
avgVisible=34.4/371 rooms (min 1, max 110), Terminal avgVisible=18.0/55 (min 1, max 33) — the PVS
is neither "just yourself" nor "everything," consistent with corridor chains genuinely linking many
rooms for free while doors still cost a crossing.

**W-PVS-STABILITY: PASS.** Same 24×5-frame synthetic A↔B flap as §13's own test, `pvsEnabled=true`
this time: zero room-state changes during the flap, genuine holds still accepted in 12 frames, and
`§ROOM_PVS_BUILD` logged exactly once (not rebuilt per flap/room-change) — the PVS build is
correctly a per-building one-time cost, not coupled to room-membership churn.

**W-PVS-PERF: two attempts, both incomplete (same recurring crash — §16.8), but together enough to
call the direction.** The 4-run interleaved harness (`witness/w_pvs_perf.js`) crashed on the 3rd
leg both times with the identical `Target page, context or browser has been closed` failure §13's
own PERF run first hit (now seen 3×, see §16.8) — never got a full off1/on1/on2/off2 interleave
either time. Two independent attempts, reported together rather than cherry-picking the friendlier
one:
- **Attempt 1** (off1 only, on1 only): OFF frame_ms=86.26 drawCalls=3205 boxed=102849 | ON
  frame_ms=91.22 drawCalls=3244 boxed=102237 → delta +4.96ms, +39 calls.
- **Attempt 2** (got 3 of 4 legs — off1, on1, on2): OFF frame_ms=83.47 drawCalls=3216 boxed=102709
  | ON (on1+on2 avg) frame_ms=83.40 drawCalls=3223 boxed=102316 → delta **−0.08ms**, +7 calls.
- **Cross-attempt noise floor:** the SAME "off" condition measured 86.26ms in attempt 1 vs 83.47ms
  in attempt 2 — a 2.79ms spread with `pvsEnabled` never touched. Both attempts' on/off deltas
  (+4.96ms, −0.08ms) sit inside or near that noise band. **Honest read: frame_ms shows no
  consistent, distinguishable direction across two independent measurements — a wash, not a
  win and not a measurable regression either, matching §13's own PERF finding almost exactly**
  (a draw-call-adjacent change that doesn't move frame time).
- **What IS consistent across all 3 "on" samples vs both "off" samples: boxed count reliably
  DROPS** (−612, −394) — confirming the structural fact (PVS's visible-set is a strict superset of
  §13's same-room-only test) independent of the noisy frame-time reading. This costs nothing
  measurable and buys nothing measurable on THIS metric — it is a correctness change with a
  performance side-effect too small to detect at this noise floor, not a performance mechanism.

**W-PVS-STAGE0-VALIDATE (added beyond the original plan, per §16.4's own "required before
trusting depth=1" gate): informative but incomplete — real cost measured, not just assumed
small.** Same recurring crash, this time on pose 7/8, in the POC worktree
(`/tmp/wt-occl-poc/witness/w_pvs_stage0_validate.js`, PVS injected verbatim into that worktree's
page context — no files edited there, per §15's own "throwaway measurement, not shipped code"
convention). 6 of 7 completed poses landed `camRoom=none` (this tour's flyPath frames spent little
time inside a compiled room rect vs. doorways/circulation — a route/sampling artifact, not
necessarily representative of §11.2's own 83.7%-in-room figure from a different flight). The one
pose with usable data (`camRoom=RM_VÅNING_1_100`) gave a real, reportable number on the side that
matters: of 6,005 OCCLUDED elements with room data, the PVS still called **1,863 (31.0%)
"visible"** — the documented conservative-bias cost, and it is not small. n=1 pose is not enough to
generalize the exact percentage, but combined with W-PVS-PERF's direction, the shape is consistent
and not encouraging for a performance win from this mechanism alone.

**§16 VERDICT: portal-PVS is a CORRECTNESS fix with a performance effect too small to measure at
this harness's noise floor — confirmed across two independent attempts, not assumed.** It
demonstrably stops §13 from incorrectly boxing elements genuinely visible through an open doorway
(the failure mode §16.1 named), and does so safely (EQUIV/CORRECT/STABILITY all clean). It does
NOT reach §15's ~99% ceiling — the boxed-count direction is consistently down (fewer culled, as the
superset design predicts) but frame_ms shows no consistent direction across two measurements
against a ~3ms cross-run noise floor, and the Stage-0 cross-tab's 31% false-positive rate (n=1
pose, real but not yet generalized) shows the conservative bias has a real, non-trivial cost on the
occluded side. That ceiling is dominated by occlusion INSIDE what a room-adjacency graph already
calls "visible" — same-room partitions, furniture, ceilings hiding MEP directly overhead, floor
slabs — nothing a room graph can see, no matter how it's tuned. Closing that gap needs a mechanism
that judges visibility at object/region grain, not room grain. §17 below specs that mechanism.

**Open call for the user:** ship §16 as a modest correctness fix (console-lever only, as scoped, no
default-on decision per §11.3/§13's own non-goals — it costs nothing measurable to leave available),
or hold it pending §17's outcome and ship both together. Either is consistent with this file's own
"negative-but-real result is reportable, not a failure" discipline (§13, §15).

### §16.8 Standing infrastructure finding — recurring headless-Chrome crash on long real-GPU runs
Both of today's long real-GPU witness runs (§16's own PVS-PERF, and the Stage-0 validation) hit the
identical `Target page, context or browser has been closed` failure that §13's own PERF run first
reported ("the repeated same-point crash is itself worth a follow-up look... not chased down as
part of this step"). Now observed a 3rd time, always on a long-running (minutes, not seconds) real-
hardware-GL headless session doing sustained heavy work (either a multi-leg tour flight or repeated
multi-second CPU raycasts). Still not root-caused (possible resource accumulation across sequential
in-page tour restarts, or a headless-Chrome memory/handle ceiling under sustained real-GL load) —
flagging again, explicitly, so a THIRD recurrence doesn't get re-discovered as a surprise. Named,
not fixed; a real follow-up if long real-GPU witness runs are going to keep being this file's
standard method (they should — screenshots/estimates are exactly what this file's own "math
discipline, not screenshots" rule exists to replace).

## 17. IMPLEMENTATION DESIGN — hierarchical GPU occlusion culling (2026-07-22, design only, per
§8→§9/§11→§13/§15→§16 discipline; motivated by §16's own verdict that portal-PVS cannot reach the
~99% ceiling, and by a live side-investigation into whether this codebase's existing R-tree
(clash detection) or MeshBVH (raycasting) structures could drive it for free)

### 17.1 Why neither existing hierarchical structure is directly usable — verified, not assumed
Prompted externally (a pasted second-AI suggestion) that the project's existing spatial R-tree is
"precisely the hierarchical bounding structure needed" for GPU occlusion queries. Checked directly,
empirically, rather than accepted on description:
- **The SQLite `elements_rtree` (`viewer/measure.js:143`, clash detection/pick-proximity) DOES
  maintain a genuine multi-level internal hierarchy** — confirmed by building the real 122,330-
  element R-tree in Node/sql.js and querying its `_node`/`_parent` shadow tables directly:
  **3,555 internal nodes, real parent→child rows** (e.g. `[2,373]`, `[3,55]`). The hierarchy is
  not hand-wavy; it is real and SQLite maintains it whether or not anything ever reads it.
- **But it is not walkable for this purpose as shipped.** Each `_node` row's bounding box is an
  OPAQUE PACKED BINARY BLOB (SQLite's internal R*-tree cell format) — not queryable columns. The
  R-tree's two proven wins in this project (fast Bonsai preview, fast clash detection) both go
  through its SUPPORTED interface — a flat SQL range query (`WHERE minX<=? AND maxX>=?...`) that
  never requires touching node internals; SQLite walks its own tree invisibly and just returns
  rows. Getting a specific node's actual extent for GPU-query traversal would need a from-scratch
  binary decoder for that cell format — real, bounded, documented work, but not "already there."
- **`three-mesh-bvh`'s `MeshBVH` (already loaded for raycasting, §15) is real and directly
  walkable**, but scoped PER MESH/BATCHEDMESH-BUCKET over TRIANGLES, not across buckets. Draw-call
  buckets in this codebase group by DISCIPLINE (`dlod_nav.js`'s own `_buildBoxes`: `byDisc[d] =
  byDisc[d] || []`), not spatial locality — a single bucket's own bounding box typically spans the
  whole building, so "is this bucket's box occluded" would almost never return true. MeshBVH is the
  right tool for a LATER step (once a spatial region is known-hidden, toggle per-instance
  visibility for whatever of that bucket's instances fall inside it — the SAME per-instance
  mechanism `dlod_nav.js`/BatchedMesh's `setVisibleAt` already use today), not for discovering which
  regions are hidden in the first place.
- **The piece that is actually missing: a hierarchy over ELEMENT POSITIONS, cutting across
  disciplines/buckets, with real (non-opaque) traversable nodes.** Neither existing structure gives
  this. Building one needs NO new query and NO new data: `dlod_nav.js` already holds every
  element's `{pos, radius}` resident in memory (`_boxIndex`, built once per building load from
  `element_transforms`) — a small in-memory spatial tree over that already-resident data is the
  actual missing piece, and it is cheap (see 17.2).

### 17.2 The index — build once per building, over already-resident element data
- **Input:** `_boxIndex`'s existing `{pos, radius}` per element (already in memory, zero new SQL).
  A real AABB (not just a bounding sphere) is preferable for tighter culling — `_buildBoxes` already
  queries `bbox_x/y/z` per element (`dlod_nav.js` ~line 101) and could stash it alongside `pos`/
  `radius` at the same build step, at negligible extra memory cost (3 more floats/element).
- **Structure:** a plain median-split BVH (or an existing small library, e.g. the same family as
  `rbush` — real traversable JS objects with `{minX,minY,minZ,maxX,maxY,maxZ,children|leaf}`, never
  an opaque blob), built ONCE per building load/graph-rebuild event (same cadence as `_roomIdxEnsure`/
  `_pvsEnsure`'s own building-keyed cache). Cost estimate: building a comparable SQLite R-tree over
  the real 122,330-row set took 2.65s wall-clock in-process (measured this session) — a pure-JS
  in-memory median-split build over the same row count, with no DB round-trip, should be
  comparable or faster; MEASURE this directly before committing to it as cheap, not asserted here.
- **Coordinate frame — a named landmine, learned from this project's own history:** build the index
  in the SAME space `dlod_nav.js`'s existing frustum/sphere tests already use (Three.js world
  space, via `camPos`/`e.pos` — NOT raw IFC coordinates). This project has hit a translation/frame
  mismatch bug class before (`FLY_TOUR_CORRIDOR_GRAPH.md`'s §WALKER-PHASE-SENSITIVITY /
  §PATCH-FRAME-GUARD sagas) — do not reintroduce it here by building the tree in a different frame
  than the one it will be queried against.

### 17.3 Traversal + GPU occlusion query design
- **Query target:** WebGL2 `EXT_occlusion_query_boolean` (`ANY_SAMPLES_PASSED_CONSERVATIVE`,
  cheaper/less precise than exact — appropriate here, a coarse ancestor-node test doesn't need
  pixel-perfect answers). One query per VISITED internal node, against a proxy (the node's own AABB
  rendered as a simple invisible box, depth-tested against the already-rendered frame).
- **Top-down, early-out:** start at the tree's top internal nodes (not the root singleton — query
  its children directly, same shape Gemini's own diagram sketched). If a node's query result comes
  back "hidden" (0 samples), mark EVERY element in its subtree as occlusion-hidden this cycle and do
  **not** descend further or query any of its children — this is where the big wins come from (one
  query result culling potentially thousands of elements across many different discipline-buckets
  at once, unlike MeshBVH's per-bucket ceiling). If "visible" (or the query hasn't resolved yet),
  descend to its children on a LATER cycle (17.4).
- **Integration point — reuse §13/§16's own machinery, do not build a second demote pipeline:** a
  new `occlMis` criterion, OR'd into `_wantedReal`'s existing decision alongside `roomMis`, using
  the SAME fade/snap state machine (`FADE_FRAMES`/`FADE_CAP`), the SAME "only demote, never a new
  visual system" discipline §8/§9 already established for this file. An occlusion-hidden element is
  just another reason to want `box`, structurally identical to a distance/frustum/room-mismatch
  demote from the engine's point of view.
- **Async by construction — never block the main thread on a query result.** Issue queries one
  frame, poll `getQueryParameter(query, GL.QUERY_RESULT_AVAILABLE)` on later frames, only read
  `GL.QUERY_RESULT` once available. This is the single most common way hierarchical occlusion
  culling gets implemented WRONG (a synchronous stall) — call it out explicitly in the eventual
  code's own comments, not just here.

### 17.4 Temporal amortization — do not re-traverse/re-query every frame
- **Round-robin the tree across frames**, same amortization shape `dlod_nav.js`'s own `EVAL_CHUNK`
  chunked scan already uses for its distance/frustum pass (§FLY_SMOOTH) — query a rolling subset of
  nodes per frame rather than the whole tree at once, spreading cost instead of bursting it.
  Reuse each node's last query result for a HOLD window before re-querying — start from the SAME
  `FADE_FRAMES=10`-scale constant already tuned for this codebase's own hysteresis rather than
  inventing a new number, and revise only if a witness shows it's wrong for this specific case.
- **Camera-motion-aware re-query priority (not required for v1, name it for later):** nodes nearer
  the camera's current view direction change visibility more often than distant/peripheral ones —
  a v2 lever, not needed to get a first correct-and-safe version working.

### 17.5 Correctness pitfalls to test explicitly, not assume away
1. A parent node's proxy box can be VISIBLE even when every real element inside it happens to be
   individually occluded by DIFFERENT things — this is fine (conservative, same safe-direction bias
   §16.3 already established for portals) and just means "descend further," never a correctness bug.
2. The reverse must never happen by construction: if a query says a node is hidden, everything
   inside it must ACTUALLY be behind that same occluding geometry — verify this against §15's own
   ground-truth classifier (17.6), not assumed from the query semantics alone.
3. Query result staleness across a moving camera — the HOLD window (17.4) trades a few stale
   frames of over-conservatism (kept real one cycle too long) for avoiding query-storm cost; verify
   this doesn't reintroduce the "pop/flicker" failure class §8 was gated against.

### 17.6 Witness plan (same rigor as §13/§16 — frame-time A/B is still the only real bar)
- **W-OCCL-BVH-EQUIV:** mechanism off ⇒ byte-identical to §16's own shipped behavior (same pattern:
  a pure superset lever, never implied by `pvsEnabled`/`roomOcclEnabled` alone).
- **W-OCCL-BVH-CORRECT:** THE important one — cross-check the traversal's hide/show verdict against
  §15's own PROVEN ground-truth classifier (`occl_classify.js`, Stage-0-gated, `mismatch=0`) at the
  SAME captured poses, not a fresh, unproven ground truth. Report false-hide rate (must be ~0 — a
  real correctness bug if nonzero) separately from false-show rate (the acceptable conservative
  residual, report honestly, same as §16.4's 31%).
- **W-OCCL-BVH-STABILITY:** temporal-hold window doesn't flicker under the same synthetic flap
  method §13/§16 already use.
- **W-OCCL-BVH-PERF — the decisive witness:** real interior-flight A/B, same machine/route/method as
  §13/§16's own PERF runs, reporting frame_ms AND draw calls AND bucket-empty count. Given §13 and
  §16 have NOW BOTH shown a draw-call change without a frame-time change, this witness's own
  finding is not assumed — if frame_ms still doesn't move despite emptying far more buckets than
  §13/§16 could, that means the bottleneck is elsewhere (JS-side traversal/query overhead itself,
  or a CPU submission cost independent of bucket occupancy) and must be reported as its own finding,
  not chased by retuning until a number looks good.

### 17.7 Non-goals (v1)
No pill/UI, no default-on, no Time Machine port (unchanged from §11.3/§13/§16). No v2 camera-
motion-aware re-query priority (17.4). No new occluder types beyond what's already in the scene
(no synthetic coarse "room shell" proxies — the real geometry already rendered each frame IS the
occluder, same as §15's own POC used).

### 17.8 Open questions for user review before implementation
1. Is the AABB-tree build cost (17.2, estimated ~2-3s from the SQLite comparison, not yet measured
   for the actual JS in-memory version) acceptable as a per-building-load cost, or does it need to
   be incremental/idle-deferred like `ensureRooms()`'s own pattern?
2. Should 17.1's finding be acted on for `elements_rtree` too (write the binary node-blob decoder,
   since the hierarchy genuinely exists on disk) as an alternative to a fresh in-memory tree, or is
   a fresh JS tree simply less code for the same result? Leaning fresh-tree (this doc's own
   recommendation) but flagged as an explicit choice, not a foregone one.
3. Whether §16 (portal-PVS) and §17 (hierarchical occlusion) should compose (PVS as a first, near-
   free filter; the BVH/GPU-query pass only for whatever PVS didn't already resolve) or whether §17
   alone supersedes §16 entirely — compose is the more consistent choice with this file's own
   "extend, don't discard" pattern (§9→§13 kept both criteria OR'd), tentatively recommended, not
   decided here.

### 17.9 §17.8 DECIDED (2026-07-22, user reviewed, proceed)
1. **Build cost:** not decided up front — MEASURE the real in-memory JS build directly (standalone
   timing script over the actual resident element set) before choosing sync-at-load vs
   idle-deferred. The 2-3s number is an SQLite-round-trip estimate, not the JS structure's own cost,
   and is cheap to pin down first.
2. **Fresh JS tree, not the `elements_rtree` blob decoder.** Decided, closed. The R-tree's cell
   format isn't a supported SQLite interface (reverse-engineering internals for a one-off), and it's
   built in a different coordinate frame (IFC/raw) than 17.2 needs (Three.js world space) — the
   frame conversion alone is most of the work a fresh tree needs anyway.
3. **Compose.** PVS (§16) as a first free filter; BVH/GPU-query only on whatever PVS leaves visible.
   Consistent with §9→§13's own "extend, don't discard." Also reduces live GPU-query volume per
   cycle (already-PVS-culled rooms need no query at all).

### 17.10 CHEAP POC — spec (before full §17 build; de-risks the causal claim, not the engineering)
**Issue this POC proves/disproves, isolated from implementation cost:** §13 and §16 BOTH already
found draw-call reduction with NO measurable frame_ms change. Before spending real effort on the
BVH + async GPU-query mechanism (17.2-17.4), test whether object-grain occlusion demotion moves
frame_ms AT ALL, using a PERFECT oracle in place of the real-time mechanism — decouples "does the
idea work" from "can we build a fast enough approximation of it."
- **Oracle source:** §15's own proven classifier, `witness/occl_classify.js` (Stage-0-gated,
  `mismatch=0`), reused verbatim — same discipline as §16's own witnesses. Extend §15 Stage 1's
  existing per-pose capture (`witness/w_occl_stage1.js`: freeze camera at a captured interior pose,
  enumerate the full active set, classify each) to additionally emit a **guid→occluded boolean map**
  per pose (Stage 1 today only aggregates counts — this POC needs the per-guid verdict list to
  actually demote by).
- **Wiring — smallest possible addition to `dlod_nav.js`, mirrors `_roomMismatch` exactly:** a new
  `_occlOracle` guid-map + `_stats.occlOracleEnabled` console-only lever (default false, inert), a
  `_occlMismatch(e)` test (`occlOracleEnabled === true && _occlOracle && _occlOracle[e.guid] ===
  true`), OR'd into `_wantedReal` alongside `roomMis`. `window.__dlodNav.setOcclOracle(map)` setter
  to inject a pose's hide-map from the witness script. No BVH, no GPU query, no temporal
  amortization — the oracle map itself stands in for all of 17.2-17.4 for this POC only.
- **Measurement — static-pose hold, not a live flight (cheaper, and the oracle is only valid AT the
  pose it was classified for):** at each of Stage 1's captured poses, freeze the camera, sample
  frame_ms over a short window with the oracle OFF then ON then ON then OFF (same off1/on1/on2/off2
  interleave §16's W-PVS-PERF used, to cancel warm-up/GC drift), aggregate delta_ms across poses.
- **What it does NOT test:** build cost, async query correctness/staleness, temporal hold-window
  tuning, or a moving-camera flight — all deferred to the real §17 build IF this POC shows frame_ms
  moves. A negative result here (no delta despite a perfect, zero-cost oracle) is itself a
  reportable, valid finding per this file's own §13/§15 discipline — it would mean the bottleneck is
  JS-side/CPU-submission cost, not draw-call/bucket-occupancy, and §17's real build should NOT
  proceed.
- **Where:** new branch `poc/occl-bvh-oracle` off `feat/room-occlusion-pvs` tip (86b096b) in
  `bim-ootb`, worktree `/tmp/wt-occl-oracle-poc` (reusing the existing worktree-hygiene discipline —
  checked `git worktree list` first, no duplicate). Local only, not pushed — same convention as
  `poc/occlusion-culling-study` (§15) and `feat/room-occlusion-pvs` (§16) itself, both currently
  local-only pending the user's own promote decision.

### 17.11 RESULT — 2026-07-22, real RTX 4060, `bim-ootb` branch `poc/occl-bvh-oracle`
**W-OCCL-ORACLE-PERF ran twice.** First run's boxed/real counts were BIT-IDENTICAL between
oracle-off and oracle-on at every pose despite the audit's own `mismatch` jumping into 5 figures —
a contradiction, caught before trusting it: `dlod_nav.js`'s chunked scan (`_evalChunk`) only re-arms
on a camera-POSE change (`_lastCamSig`), and a frozen-pose A/B never moves the camera, so the oracle
lever toggle never actually triggered a state transition. Fixed by re-arming the scan on an
oracle-lever change too (`_lastOracleEnabled`/`_lastOracleSet`, mirrors the existing room-change
re-arm at line ~374). Reran clean — `mismatch` converges to 0 every run, boxed/real genuinely differ
oracle-off vs oracle-on.

**4 frozen interior poses, off1/on1/on2/off2 interleave (same method as §16's W-PVS-PERF):**

| pose | OFF frame_ms | ON frame_ms | delta_ms | drawCalls Δ | boxed Δ |
|---|---|---|---|---|---|
| 0 | 27.24 | 21.54 | -5.69 (-21%) | -994 | +3810 |
| 1 | 34.05 | 16.69 | -17.36 (-51%) | -3403 | +21255 |
| 2 | 41.64 | 16.69 | -24.94 (-60%) | -4087 | +23049 |
| 3 | 16.69 | 16.68 | -0.01 (n/a — already 98.6% boxed pre-oracle, no headroom) | -337 | +1463 |

`mean_delta_ms=-12.00 mean_delta_calls=-2205 mean_delta_boxed=12394 meanOccludedPct=94.1%`.
Full log: `witness/w_occl_oracle_perf.log` / `witness/w_occl_oracle_perf.json`.

**Two honesty flags, not glossed over:**
1. Poses 1-3 all land at exactly 16.6-16.7ms once demoted (=1/60s) — reads as a vsync/rAF frame cap
   being hit once GPU submission cost drops low enough, meaning the true win at those poses is more
   likely UNDERSTATED by this measurement than overstated.
2. This used a zero-cost precomputed oracle at 4 FROZEN poses, not a live moving flight, and no
   BVH/query/traversal overhead of its own — it isolates the causal claim only, per 17.10's own
   design. The real mechanism (17.2-17.4) still has to prove its own overhead doesn't eat the win —
   that is what W-OCCL-BVH-PERF (17.6) is for, unchanged.

**§17.11 VERDICT: the cheap gate PASSED, decisively.** Unlike §13 (frustum/distance) and §16
(room-PVS), both of which found draw-call reduction with NO measurable frame_ms movement at the
harness's noise floor, object-grain demotion here moved frame_ms in lockstep with draw calls, by as
much as 60% at some poses. The bottleneck this codebase's PERF harness kept finding "elsewhere" is
NOT JS-traversal/CPU-submission-bound at these interior poses — it is genuinely bucket-occupancy-
bound, and finer-than-room-grain culling has real, large headroom to exploit. **§17's real
BVH+GPU-occlusion-query build (17.2-17.4) is justified to proceed** — the POC's job (decide whether
the engineering is worth doing BEFORE doing it) is done.

### 17.12 REAL BUILD — implemented, EQUIV passed, CORRECT FAILED (2026-07-22/23, real RTX 4060,
`bim-ootb` branch `feat/occl-bvh-gpu-query`, off `feat/room-occlusion-pvs` tip)
**Implementation:** `viewer/dlod_nav.js` +397 lines — median-split BVH over `_boxIndex`'s AABBs
(measured 418ms build, 122,330 elements, confirms §17.9-1's 439ms estimate), async WebGL2
`ANY_SAMPLES_PASSED_CONSERVATIVE` occlusion queries per visited node (poll-only, never blocks),
temporal HOLD window at `FADE_FRAMES`-scale, composed with §16's PVS as a further OR'd
`_occlBvhMismatch` criterion. `window.__dlodNav.occlBvhEnabled` (default false).

**W-OCCL-BVH-EQUIV: PASS**, independently re-verified — off-path byte-identical to shipped §13+§16
(`diff` of both JSON runs empty, `mismatch=0` at all 4 poses, zero nodes/queries built while
disabled).

**W-OCCL-BVH-CORRECT: FAILS, two independently-confirmed bugs, not one.**

1. **Off→on re-enable is permanently inert (root-caused in code, not patched).** `_occlDisable()`
   empties the cut and nulls the hide-set; `_bvhEnsure()` early-returns once `_bvh` already exists
   for the current building (line ~493), and cut-reseeding/hide-set-reset only live in the BUILD
   path (lines ~497, ~513-515) — so a simple re-enable within the same building never issues another
   query. First surfaced as "poses 1-3 completely dead" in a same-browser, multi-pose run 1; ruled
   OUT as a witness-harness artifact by running again with a fresh browser per pose (removing the
   off→on re-enable from the test entirely) — confirmed as a real code bug, not a test artifact.

2. **Nonzero, large false-hide rate — the correctness bar itself fails.** Fresh-browser-per-pose
   run: `meanFalseHideRate=31.48%` (per-pose 18.46%/8.48%/82.32%/16.67%, worst case 135 of 164
   actually-visible elements wrongly hidden). The spec's own bar (17.6) is "~0 — a real correctness
   bug if nonzero"; this is decisively over that bar, not a rounding residual. The hide-set also
   never stabilizes — `hidden` oscillates by TENS OF THOUSANDS between 5s samples at a FROZEN
   camera (pose 1: 81,454↔117,721; pose 3: 75,917↔122,078) — every pose reports `settled=timeout`,
   and at pose 3 the applied partition collapsed to `real=103` for the entire 122,330-element
   building.

**Root-cause hypothesis (plausible, consistent with the numbers, NOT separately proven):** occlusion
queries depth-test against "whatever the renderer last drew" (17.3's own design, matching real
occluder discipline, §17.7) — but what's actually drawn includes the ~100k+ nav-DLOD wireframe BOX
PROXIES for already-demoted elements (EQUIV logged `boxVis=121953`), not just real solid mesh. A box
proxy is a rendering STAND-IN, not real occlusion evidence — using it as an occluder plausibly
creates a SELF-AMPLIFYING FEEDBACK LOOP: hiding an element adds another box proxy to the depth
buffer → that proxy occludes MORE real geometry in later queries → more elements hide → more
proxies → runaway, matching the observed 5-figure oscillation and the pose-3 near-total collapse.
If correct, this is a design conflict between the existing box-proxy DLOD system and reusing "last
drawn frame" as the occlusion source (17.7 named this the correct occluder in principle — real
scene geometry — but did not anticipate the box PROXIES contaminating that same depth buffer).

**Status: NOT proceeding to STABILITY/PERF.** This is now a real architectural question, not a
tuning pass — likely fix shape is excluding box-proxy geometry from whatever depth buffer occlusion
queries test against (e.g. a depth-only pre-pass over real/solid meshes only), which is real,
non-trivial engineering, not a quick patch. Open call for the user: invest in that redesign, or stop
here and report §17 as a proven-opportunity/failed-first-implementation result (the causal claim
from 17.10-17.11 stands — object-grain occlusion demonstrably moves frame_ms when correctly
identified — this implementation just doesn't correctly identify it yet), same "negative-but-real
result is reportable" discipline already used for §13/§15/§16, and ship §16's PVS alone as the
practical stopping point.

### §17.13 — depth-buffer exclusion probe, negative result (2026-07-23, Sonnet agent,
`bim-ootb` branch `feat/occl-bvh-gpu-query` @ `92581e2`, committed locally, NOT pushed)

User directive: invest in §17.12's own named fix shape (exclude box-proxy geometry from the
occlusion queries' depth source), normal-effort probe, stop if too hard unless there's something
to ship on top of §19's already-shipped 11.5fps baseline.

**Built exactly as specced:** offscreen `WebGLRenderTarget`, all box-proxy meshes (steady-state
`_boxMeshes` + in-flight fade `boxCopy` overlays) hidden for one `render()` call, real geometry
only, then the raw-GL occlusion queries bind that render target instead of the default
framebuffer — fully decoupled from the visible canvas. W-OCCL-BVH-EQUIV re-verified PASS
(byte-identical off-path). Live diagnostic confirmed the pre-pass wired correctly: render target
bound at query time, all box meshes verified `visible=false` during the pass, zero GL errors.

**W-OCCL-BVH-CORRECT: FAIL, effectively unchanged from §17.12** —
`meanFalseHideRate=31.48%` (per-pose 18.46%/8.48%/82.32%/16.67%, worst case 135/164), hidden-count
still oscillates by tens of thousands at a frozen camera (real RTX 4060, fresh-browser-per-pose,
LTU_AHouse, 4 poses). The fix works as designed but doesn't move the number — **rules out
box-proxy depth contamination as the dominant cause.**

**Root cause REVISED, not just retested:** dumped the BVH's top-of-tree node extents — root spans
~426×18×287m, its two children (where traversal starts, §17.3) still span ~289×287m and
~245×190m — most of the multi-floor building. A coarse `ANY_SAMPLES_PASSED_CONSERVATIVE` query
against a box that large can return "hidden" whenever its screen-space silhouette happens to sit
fully behind SOME near occluder, even though the volume is mostly empty space containing real,
visible geometry elsewhere. A loose-bounding/early-out granularity problem, independent of what's
in the depth buffer.

**Stopped per the task's own stop condition:** fixing granularity needs deeper restructuring
(tighter/smaller top-of-tree nodes, or abandoning whole-subtree hide on large early nodes) than a
bounded pre-pass — out of scope for this probe. PERF A/B (§17.6/17.11) not run — correctness gate
not met, so it doesn't matter per this file's decisive-witness discipline.

**Net result: nothing to ship.** `occlBvhEnabled` stays default `false`; §9/§10/§19
distance-frustum and §16 room-PVS untouched; §19's shipped 87ms/~11.5fps baseline is the standing
result. §17 (object-grain GPU occlusion) is now CLOSED as a proven-opportunity/twice-failed-
implementation — the causal claim from §17.10-17.11 stands (object-grain occlusion demonstrably
moves frame_ms when correctly identified) but two independent implementation attempts (§17.12
box-proxy-as-occluder, §17.13 depth-exclusion) both failed on correctness before reaching perf.
Any future attempt needs the granularity fix as a prerequisite, not a repeat of either of these two.

### §17.14 — size gate on top-level BVH nodes ("skip top-level nodes"), partial improvement,
still FAIL (2026-07-23, Sonnet agent, `bim-ootb` branch `feat/occl-bvh-gpu-query` @ `e91f24d`,
committed locally, NOT pushed — DeepSeek-suggested next step on §17.13's own finding)

**Fix:** `OCCL_MAX_HIDE_DIAG=30` (meters, matching this file's own existing sense of "oversized
proxy" scale — `DEPTH_MAX_RADIUS=25`, §9's slab-exclusion, not an arbitrary new number). A BVH
node whose AABB diagonal exceeds 30m is never trusted with a "hidden" verdict — the query is
skipped and the node is force-descended into its children instead (same outcome as a "visible"
result), including nodes that re-enter the cut via the existing upward hidden-sibling collapse. An
oversized leaf (rare — sparse/far-apart elements, up to 194m diag as deep as depth 10) is left
visible permanently (safe/conservative, §17.5 pitfall 2). Per-depth diagonal distribution logged
once per build (`§OCCL_BVH_BUILD_OVERSIZED`) confirmed a plain depth cutoff would NOT generalize
(deep-tree outliers still hit ~194-210m) — only a direct per-node size gate does.

**W-OCCL-BVH-CORRECT re-run (real RTX 4060, LTU_AHouse, fresh-browser-per-pose, same 4 persisted
poses as §17.12/§17.13):**

| pose | falseHideRate (was §17.13) | gtClear | falseHide |
|---|---|---|---|
| 0 | 4.72% (was 18.46%) | 127 | 6 |
| 1 | 4.94% (was 8.48%) | 162 | 8 |
| 2 | 61.22% (was 82.32%) | 49 | 30 |
| 3 | 18.18% (was 16.67%) | 77 | 14 |

`meanFalseHideRate=22.27%` (was 31.48%) — real, uneven improvement (poses 0/1/2 better, pose 3
flat-to-slightly-worse on a small sample) but decisively still far from the ~0 bar (§17.6). **Not
a pass.** Oscillation is UNFIXED: every pose still reports `settled=timeout`, hidden-count still
swings by tens of thousands at a frozen camera (e.g. pose 0: 73834→98739→98361→…→81170→97867→
76415) — the size gate reduces false-hide rate at some poses but doesn't touch whatever drives the
query-result churn itself.

**Correctness gate: FAIL.** Per this file's decisive-witness discipline, the perf A/B against
§19's 87ms/~11.5fps baseline was NOT run (moot when correctness already fails). `occlBvhEnabled`
stays default `false`; §9/§10/§19 and §16 untouched; nothing shipped is affected.

**Net result: a real, worth-keeping partial fix (roughly halves the false-hide gap at 3 of 4
poses) that does not clear the bar to ship.** The broader BVH-construction redesign (tighter
internal-node bounds, or a different early-out shape entirely) that §17.13 named as follow-up work
is still the prerequisite for a pass — not attempted here, out of scope for this dispatch. §17
remains CLOSED as a proven-opportunity/repeatedly-failed-implementation (three attempts now:
§17.12 raw build, §17.13 depth-exclusion, §17.14 size gate — none clear the correctness bar); any
further attempt should start from the BVH-construction redesign, not another patch on the
traversal/query logic.

### §17.15 — oscillation root-caused (feedback loop, confirmed), fix attempted, ARCHITECTURAL
DEAD END (2026-07-23, Sonnet agent, `bim-ootb` branch `feat/occl-bvh-gpu-query` @ `27edc82`,
committed locally, NOT pushed — user: "plan out and go for it now")

Unlike §17.12-§17.14, which only tracked false-hide rate, this attempt diagnosed the oscillation
itself first, per MEASURE BEFORE ESTIMATING.

**Diagnosis (instrumented, not guessed):** added `window.__dlodNav.occlDebugTrace` (`§OCCL_BVH_FLIP`
per-node trace) and traced 868 verdict flips at a frozen camera (pose 0, real RTX 4060).
**Confirmed:** hiding a guid for display also removes it from the occlusion queries' own depth
source, since the depth-only pre-pass (§17.13) only draws whatever's currently real —
`meanGenDelta=32.83` (other hide-set mutations mid-flight of a single query), `maxHiddenCountDelta
=18,162` guids churning within the SAME single-frame window one query was in flight, `859/868`
flips were `hid→vis` (an occluder vanishing, not camera movement). **Disconfirmed:** async
staleness — `latencyFrames` was exactly 1 for every sampled flip, no growing backlog.

**Fix attempted:** restore each `_occlHidden` guid's cached-matrix real geometry into the
depth-only pre-pass for that one `render()` call, so occl-BVH demoting a guid can never erase its
own ability to occlude something else. Gated behind its own `occlDepthDecoupleEnabled` lever
(default false) so `occlBvhEnabled` alone stays byte-identical to §17.14.

**Result: FAILED, worse not better.** `meanGenDelta` rose 32.83→42.49, `meanAbsHiddenCountDelta`
rose 3669.72→4501.58, hidden-count still swung ~95k-112k (same magnitude as before). Cost
130-172ms per depth-pre-pass call — ≥8× the ~16.6ms frame budget, disqualifying on its own. The
run also hit the standing §16.8 headless-Chrome long-run crash before reaching settle.

**Root cause of the fix's own failure (real architectural finding, not a bug):** the fix only
restores occl-BVH's OWN hidden subset (~95-112k of ~120k boxed) — the remaining ~8-25k guids
boxed by the independent, already-shipped §9/§13/§16 distance/room criteria (plausibly the actual
dividing walls between rooms) stay excluded from the depth source regardless, so the same
"occluder vanished" event keeps happening through that door. A complete version would need to
decouple ALL demoted geometry from ALL DLOD layers — arithmetically equivalent to rendering ~100%
of the building's real geometry every occlusion-query frame, which **directly conflicts with
DLOD's own reason to exist.** This is a genuine architectural dead end for the "restore into a
shared depth pre-pass" fix shape, not an implementation bug to iterate past.

**Stopped per the attempt-4 discipline** — did not re-run the formal 4-pose correctness witness
or the perf A/B (the diagnostic run already falsifies the fix on both correctness and cost;
re-running risked another §16.8 crash for no new information). `W-OCCL-BVH-EQUIV` re-verified
PASS (byte-identical off-path). `occlBvhEnabled`/`occlDepthDecoupleEnabled` both stay default
`false`; §9/§10/§19 and §16 untouched; nothing shipped is affected.

**§17 status: CLOSED, four attempts, all failed correctness** (§17.12 raw build, §17.13
depth-exclusion, §17.14 size gate, §17.15 depth-decouple) — the last one closing not with "needs
more tuning" but with a structural reason further tuning of this fix shape can't work. The
diagnostic instrumentation (`§OCCL_BVH_FLIP`, `occlDebugTrace`) is kept in the tree, inert by
default, for any future attempt that wants to start from a different mechanism entirely (e.g.
§16.5's originally-spec'd GPU-occlusion-query fallback done as its own dedicated depth pass
independent of any DLOD layer, or abandoning per-element occlusion queries for something coarser).
§16's room-PVS remains the practical, shipped stopping point for occlusion — see §17.12's own
framing, now borne out four times over.

## §17.16 — IMPLEMENTATION DESIGN, structural occluder decouple (2026-07-23, design only, NOT
built — user + DeepSeek co-design, pivot not a patch, per §17.15's finding that a shared
occluder/occludee depth source is the actual failure mode of all 3 prior attempts)

**Core principle (DeepSeek, confirmed against §17.15's own evidence):** one scene for display,
one separate, static depth source for occlusion — they never share geometry state. §17.15 built a
half-version of this (restored ONE layer's hidden geometry back into a shared source) and it
failed on both correctness and cost, because the source was still "whatever's currently real," a
population every DLOD layer keeps mutating. The fix isn't restoring more into that shared source —
it's replacing it with a set that was never subject to DLOD state in the first place.

### 17.16.1 Occluder selection — verified schema, `elements_rtree JOIN elements_meta`
Confirmed against the REAL schema (`build/Duplex_mep_extracted.db`, `extract.py:266-273/633-641`
— checked directly, not assumed from another context):
- `elements_meta (id, guid, discipline, ifc_class, element_name, element_type, storey, ...)` —
  `ifc_class` is a stored, first-class column, not derived. Unlike room boundaries (which need
  `room_walker.js`'s walking algorithm because no IFC entity gives pre-computed room polygons),
  structural type needs no geometric computation.
- `elements_rtree (id, minX, maxX, minY, maxY, minZ, maxZ)` — numeric-only rtree module, NO
  `type`/`guid`/`bbox` column of its own (an earlier draft of this section assumed otherwise —
  caught and corrected against the real schema before landing here, not after).
- **Join key verified real, not assumed:** `extract.py:617-641` inserts both tables from the SAME
  `eid` in the same per-element loop iteration — `elements_rtree.id = elements_meta.id` is a sound
  join, confirmed from the actual extraction source.
- **The real selection query, using the rtree for its precomputed bounds (this is the genuine win —
  the BVH builder below skips recomputing AABBs from geometry/`element_transforms` entirely):**
  ```sql
  SELECT r.id, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ, m.guid
  FROM elements_rtree r JOIN elements_meta m ON r.id = m.id
  WHERE m.ifc_class IN (...)   -- exact class list per the prerequisite step below
  ```
- **Prerequisite step, do not skip (MEASURE BEFORE ESTIMATING):** run
  `SELECT ifc_class, COUNT(*) FROM elements_meta GROUP BY ifc_class ORDER BY 2 DESC` on LTU_AHouse's
  real DB first — confirms the actual class strings (do not assume `IfcWall`/`IfcSlab`/`IfcRoof`/
  `IfcCovering` spelling without checking) and gives a real occluder-set-size number before any
  "this is small/cheap" claim is made in code comments or a commit message. §5's SQL (line ~160)
  already proved storey-slabs are strong occluders structurally; this is the analogous real-number
  check for the wall/slab/roof/ceiling filter specifically.
- **Lightweight schema guard, cheap insurance:** the build step should confirm `elements_rtree`'s
  actual columns before relying on them (e.g. read `sqlite_master` or `PRAGMA table_info` once at
  build time, fail loud with a clear message if a differently-shaped DB is ever loaded) — not because
  today's schema is in doubt (it's now verified above), but because this file's own §DB-snapshot
  divergence lessons elsewhere in this project's memory are exactly about assuming schema shape
  holds across every building/DB without checking.

### 17.16.2 Occluder set build — static, no hide-state, built once
- Fetch occluder elements via 17.16.1's verified join query — AABBs come directly from
  `elements_rtree`, no separate bounds computation needed.
- Build a BVH over ONLY this subset (reuse §17.2's median-split builder, or simpler if 17.16.1's
  real count is small enough that a flat list beats a tree — measure, don't assume). This BVH has
  no `res`/`pending`/`hiddenMarked`/hold-window fields — it never changes after build, because its
  members are never subject to DLOD promote/demote. This is the "lightweight spatial model kept
  intact, independent of transient visibility state" the R-tree/BVH principle actually calls for —
  §17.12-15's BVH conflated "spatial index" with "live visibility state machine"; this one is pure
  spatial index, full stop.
- **Never re-touched by any DLOD layer's demote/promote logic.** A wall being distance-boxed by
  §9/§19 or room-boxed by §13 in the DISPLAY scene has zero effect on this structure or on what
  gets rendered into the occlusion depth target below — the two are architecturally unaware of
  each other's state, by construction, not by a per-frame patch.

### 17.16.3 Separate depth target — occluders render unconditionally, every cycle
- New dedicated offscreen `WebGLRenderTarget`, occluder-set-only, opaque real geometry
  (`colorWrite:false`, depth-only, same technique §17.13 already proved works and is cheap for a
  SMALL set — §17.13's version was correctly wired, it was just excluding the wrong thing at the
  wrong granularity, applied to the whole active set instead of a small static occluder set).
- Rendered EVERY query cycle, unconditionally, regardless of what the main display scene currently
  shows for those same wall/slab/roof/ceiling guids (real mesh or wireframe box proxy in the
  visible frame — irrelevant to this pass). No hide/restore logic needed at all — the occluder set
  has no "hidden" concept.
- Resolution: consider a smaller target than the main canvas (e.g. half-res) if 17.16.6's perf
  numbers show it matters — named as a lever, not decided here without data.

### 17.16.4 Query subjects — unchanged population, occluder identity now fully separate
- The elements being TESTED for occlusion are whatever's already eligible per the existing
  §9/§19/§13/§16 gating (distance/frustum/room-mismatch) — no change to that population or its own
  hysteresis/hold-window logic (§17.3/§17.4 already gives it anti-flicker; keep it as a secondary
  defense, not the primary fix — the primary fix is that the thing being queried can no longer make
  its own occluder vanish, because it was never an occluder to begin with unless it's also
  wall/slab/roof/ceiling, in which case IT participates in 17.16.2's static set independent of its
  own display-boxed state).
- Async `ANY_SAMPLES_PASSED_CONSERVATIVE` queries issued against 17.16.3's target, same
  poll-never-block discipline as §17.3.
- **Structural elimination of §17.15's feedback loop, not a mitigation of it:** a query subject
  being hidden in the display scene cannot remove anything from the occlusion depth source, because
  the occlusion depth source is never built from the display scene's current state at all.

### 17.16.5 Integration — replaces §17.12-15's mechanism, does not layer onto it
- **No new pill/UI toggle** — same pattern already used for §13 and §16, neither of which got a
  separate pill: both are internal criteria OR'd into the SAME existing `'o'`-toggled nav-DLOD
  system, gated by an internal flag that defaults off during testing/witnessing then flips to
  default-on once proven (`roomOcclEnabled` did exactly this in §19). This layer follows the
  identical pattern — a code-level lever, not a user-facing surface.
- New lever (name TBD by implementer, e.g. `occlStructEnabled`), default `false`. This REPLACES the
  old whole-building-BVH occlusion path (§17.2-17.4's original design) rather than adding a third
  parallel occlusion system — `occlBvhEnabled`/`occlDepthDecoupleEnabled` (§17.12-15, both already
  default false and already proven failed) can be retired/removed once this is built and witnessed,
  per this project's no-dead-code-left-around discipline, but only after 17.16.6 passes — do not
  delete the failed attempts' code before a working replacement is proven, in case this pivot also
  needs to fall back to what was learned from them.
- §9/§10/§19 (distance/frustum, shipped default) and §16 (room-PVS, shipped default) are OR'd
  criteria for boxing, same integration point as before — untouched, independent, still run first/
  alongside. This design only replaces the THIRD, most-precise layer's internal mechanism.

### 17.16.6 Prebake/cache — lazy, client-side, mirrors `room_walker.js`'s proven pattern
- Matches this codebase's own established precedent (§10's correction: `A.ensureRooms()` compiles
  client-side on demand from whatever DB is loaded, cached, version-stamped self-heal via
  `ROOM_WALKER_V`) — not a new architecture, a reuse of one already proven here.
- Build occluder set (17.16.1 query + 17.16.2 BVH) once per building, first engage or on load;
  cache the fetched element list (guid+transform+geometry ref — small per 17.16.1's real count) to
  IndexedDB keyed by `building + a version constant` (e.g. `OCCL_STRUCT_V`). Whether to also
  serialize the built BVH itself (vs cheaply rebuilding client-side each session from the cached
  element list) is a measure-first call for the implementer — log the build cost first, decide
  after seeing the real number, same discipline as everywhere else in this file.
- Version-stamp self-heal on bump, identical mechanism to `ROOM_WALKER_V` — no new pattern to
  design, port the existing one.

### 17.16.7 Witnesses — same rigor as §17.6/17.11/17.12-15, oscillation stays an equal-weight gate
- **W-OCC2-SELECT:** real `ifc_class` distinct-value + count query result logged
  (`§OCCL_STRUCT_SELECT`), confirms 17.16.1 before any code assumes a specific class spelling.
- **W-OCC2-EQUIV:** lever off → byte-identical to shipped §13+§16 (off-path), mirrors every prior
  EQUIV witness in this file.
- **W-OCC2-CORRECT:** same 4 persisted poses as §17.12-15 for direct comparability —
  `meanFalseHideRate` ~0 AND hidden-count `settled` (not `timeout`) at a frozen camera. BOTH bars,
  same equal weight §17.15 established — this is not optional this time either.
- **W-OCC2-CACHE:** cold load builds + caches; warm reload (same building, same session or a fresh
  one) hits the IndexedDB cache and skips the SQL+build cost — log both timings.
- **W-OCC2-PERF:** ONLY if W-OCC2-CORRECT passes — real-flight A/B against §19's shipped
  87ms/~11.5fps baseline (PR #976), same discipline as every prior PERF witness in this file — do
  not regress it.

### 17.16.8 Non-goals (v1, same discipline as §3/§7/§11.3)
- No occluder mesh simplification (convex hulls, merged geometry) — start with real wall/slab/roof
  geometry as-is, already loaded via the existing `element_transforms` join; only add simplification
  if 17.16.7's real numbers show the occluder pass itself is a cost problem, not assumed upfront.
- No cross-building occluder sharing/precompute-at-extraction-time — this stays a client-side, lazy,
  per-loaded-building cache, same scope boundary `room_walker.js` already established (§10's
  correction: no OCI redistribution, no per-building server-side action).
- **NOT claiming as settled fact (named here to head off re-litigation, per Anti-Drift):** whether
  `elements_rtree` could usefully accelerate §9/§19's existing PER-FRAME distance/frustum test
  (re-querying SQLite every eval cycle vs the current in-memory JS `_boxIndex` walk) is an
  UNVERIFIED idea, not accepted debt — the current approach avoids a repeated JS↔WASM-SQLite
  boundary crossing, and there is no measurement showing SQL re-query would be faster, only that it
  is theoretically possible. If this is ever investigated, it is a separate, measure-first task, not
  part of 17.16's scope, and should not be assumed a win going in.

### §17.16 PRODUCTION RESULT — 2026-07-24, `bim-ootb` branch `feat/occl-bvh-gpu-query` @ `2b51e17`,
committed locally, NOT pushed. Lever `occlStructEnabled` stays default `false` — PARTIAL result.

**Oscillation: SOLVED**, first time in 6 attempts — all 4 persisted poses settled `stable`, never
`timeout`, confirmed in the real production path (not just the sandbox). **False-hide bar: NOT
met** — mean 12.33% (5.23/8.64/8.16/27.27% per pose) vs the ~0 bar. Root-caused, not just measured:
false-hides concentrate on `IfcDoor`/MEP-in-opening elements — LTU_AHouse's extracted walls have no
boolean door/window cutouts (confirmed: box-proxy vs real wall geometry as occluder gave
byte-identical results), a real data characteristic of this building, not a mechanism bug. Absolute
count is tiny (58/79,263 = 0.07%) but the metric's small per-pose denominator (49-363 truly-clear
elements) inflates the %. W-OCC2-SELECT/EQUIV/CACHE all PASS; W-OCC2-PERF skipped per its own gate
(correctness didn't pass). §17.12-15's old dead code NOT retired (gated on a clean pass). Next
step, not yet done: extend the occluder set or add a door/opening-aware exemption so cutout-bearing
walls don't produce this class of false-hide.

### 17.16.9 SANDBOX POC — before the full build (2026-07-23, user + DeepSeek: "build the sandbox
first," same methodology §17.10/17.11 already proved decisive for this exact file)

De-risk 17.16's four core assumptions with the smallest real test, before committing to the full
build (cache/prebake, DLOD-layer integration, cross-fade, UI pill) — same "does the idea work,
decoupled from whether we can build a fast enough production version" split §17.10 already used.

**Four measurements, sequenced cheap-to-expensive, real LTU_AHouse data/schema throughout:**
1. **Structural subset size** — 17.16.1's prerequisite SQL (`SELECT ifc_class, COUNT(*)...`), no
   browser needed. Report the real count and % of 122,330 — no assumed pass/fail threshold (an
   assumed "<15k" wasn't derived from anything in this file); the number informs interpretation of
   #3 below, it doesn't gate on its own.
2. **BVH top-level bounds tightness** — build the JS BVH over the real subset from #1 (no rendering
   needed, pure JS over the join query's AABBs), log the same per-depth diag distribution §17.14
   already logs (`§OCCL_BVH_BUILD_OVERSIZED`-style). Pass bar: root/near-root diag materially
   smaller than the whole-building BVH's measured ~289-408m (§17.13) — a relative improvement
   check against a real prior number, not an arbitrary new one.
3. **Depth-only render cost** — render the real subset into an offscreen depth target (real RTX
   4060, same harness pattern as §17.13's pre-pass), measure ms/call. Pass bar: small relative to
   the ~16.6ms/frame (60fps) budget, and nowhere near §17.15's disqualifying 130-172ms/call finding
   — that comparison is the real bar, not a percentage pulled from nowhere.
4. **Oscillation elimination** — wire real occlusion queries (async, `ANY_SAMPLES_PASSED_CONSERVATIVE`)
   against #3's target for a fixed candidate list (reuse the 4 persisted poses' active sets, same as
   every prior W-OCCL-BVH-CORRECT run). Pass bar: identical to the established one — hidden-count
   `settled` (not `timeout`) at a frozen camera. No cache/prebake, no DLOD-layer OR-integration, no
   cross-fade, no pill — sandbox only tests whether the mechanism itself is sound.

**Scope boundary — sandbox, not production:** no IndexedDB cache (17.16.6), no integration with
§9/§13/§16 (17.16.5), no cross-fade/UI. Throwaway/scratch code acceptable, mirrors §17.10's own
"local only, not pushed" convention.

**Decision gate:** if all four measurements pass their stated bars, proceed to the full 17.16 build
with confidence (same "cheap gate passed, real build justified" language §17.11 used). If any
measurement fails, STOP — report which one and the real numbers, do not proceed to the full build,
same negative-result discipline as §17.12-15. This sandbox is expected to take a small fraction of
the full build's effort, same ratio §17.10/17.11 already demonstrated for this file.

## 18. nav-DLOD root-cause + real-frame_ms wins on LTU_AHouse (2026-07-23, separate from §17's occl-bvh work — this is `dlod_nav.js`, the older distance-based box-proxy system §9/§10 shipped, not §16/§17's occlusion work)

**Starting observation (user):** flying LTU_AHouse (122,330 elements) with `'o'` (nav-DLOD) on, solid
display and bbox-cycle display felt the SAME speed — read at first as "occlusion has hit the bbxes
floor." That reading was wrong; root cause below.

**Root cause, code-confirmed:** Alt+Z's bbox/ghost display cycle (`navigate_find.js` `toggleMergedGhost`)
calls `A.filterByGuids(new Set())` to hide solids for the ghost — an EMPTY Set, but still truthy in JS.
`dlod_nav.js`'s `_gateBlockReason` (`if (app.activeGuidFilter) return 'find-isolation';`) unconditionally
blocks nav-DLOD while any guid filter is set, including this empty one. Pressing `'o'` while in bbox mode
(or with a stale filter left over from Find/isolation) silently logged `on=true` and never engaged — no
error, no `§DLOD_NAV_ENGAGE`, indistinguishable from working. That's what made "solid vs bbox" look like
the same speed: bbox mode was never actually running nav-DLOD's box-proxy system at all — it's a fully
separate mechanism (`§GHOST_XRAY`'s own 28,569-box `SHELL_GHOST_BBOX`, vs nav-DLOD's 122,330-element
index).

**Three PRs shipped (bim-ootb), in order:**
- **#973** `feat/fps-mode-log` — throttled `§FPS_MODE mean=.. max=.. n=.. dlod=.. disp=.. fly=.. orbit=..`
  frame_ms sampler (only counts frames that did real work, post idle-park gate).
- **#974** `feat/dlod-nav-gate-toast` — `toggleDlodNav` now checks `_gateBlockReason` synchronously and
  logs/toasts `§DLOD_NAV_TOGGLE on=true blocked=<reason>` instead of a false `on=true` when a gate
  condition (bbox/ghost isolation, `streaming`, `find-isolation`, etc.) already holds. Diagnostic only,
  zero behavior change to when nav-DLOD actually engages.
- **#975** `fix/dlod-nav-restore-chunk` — two fixes found via #973's real frame_ms data:
  1. `_restoreAll` (disengage path) was a single synchronous loop over the whole 122,330-element index —
     measured **2.5-3.6s frame_ms spike** on every `'o'`-off. Chunked the same way `_evalChunk` already is
     (`_restoreAllNow`, `EVAL_CHUNK` per rAF tick); a re-engage mid-drain force-flushes the pending restore
     synchronously first (`_restoreFlush`) so `_buildBoxes` never races a stale in-flight drain.
  2. `§FPS_MODE`'s `dlod=` tag read pill-intent (`_dlodNavOn`), not real engagement (`_engaged`) — a
     gate-blocked press tagged frames `dlod=on` while nav-DLOD did nothing, which would have silently
     poisoned the exact on/off comparison the sampler exists to make. Now reads `window._dlodNavEngaged`.

**Confirmed live, same session, post-merge — real numbers, not inference:**
- **Disengage freeze is gone.** `'o'` toggled off mid-flight: `§FPS_MODE mean=116 max=207.7 dlod=off` —
  unremarkable, in line with surrounding frames. Pre-#975 this exact moment was 2.5-3.6s.
- **#974's blocked-toast fires correctly in the wild**, twice, different reasons: `blocked=streaming`
  (pressed `'o'` before streaming finished) and `blocked=find-isolation` (pressed `'o'` while a
  pick/ghost isolation filter was still set).
- **First trustworthy `dlod=on` vs `dlod=off` comparison during actual flight** (previously impossible —
  the tag itself lied): clean `dlod=off` sample right before engaging, `mean=219.8 max=285.6`; after the
  one-time engage burst settles (`mean=299.1` for the burst itself, matching the cold-engage-burst finding
  below), sustained `dlod=on` flight: `mean=100-150` across dozens of 2s windows. **Roughly 45-55% mean
  frame-time reduction, real and reproducible**, not a screenshot/feel — this is the first number-backed
  answer to whether nav-DLOD helps on a building this size.
- **New, slightly counter-intuitive finding, not yet acted on:** full ghost/xray mode (nav-DLOD gated off
  the whole stretch, confirmed via `blocked=find-isolation`) measured **~70-90ms mean** during flight —
  FASTER than solid+nav-DLOD-on's ~100-150ms. Expected once stated: nav-DLOD still keeps roughly
  15-30% of elements as full real geometry at any moment (`active=22366 boxed=99964` typical), while
  full-ghost hides essentially all real solids. nav-DLOD beats full-solid, but doesn't reach full-hide.

**Confounds identified, do not misattribute:**
- Cold-engage burst (`active=0 boxed=122330 started=122330`, `mean≈300ms`) is real and reproducible on
  every fresh engage — expected from `_evalChunk`'s design (whole-building reclassification), not a bug.
- `three-mesh-bvh`'s incremental build (`§BVH_DEFERRED`, seen at 6.9s/13.3s/30.4s across runs — highly
  variable, likely CPU-contention-dependent) can coincide with nav-DLOD/bbox testing and inflate frame_ms
  spikes that aren't nav-DLOD's fault.
- The camera-teleport reclassification jank named in an earlier pass of this session turned out to be
  **general, not nav-DLOD-specific** — the same tour-start jank (`mean=550.7 max=1533.1`) recurred with
  `dlod=off`. Likely three.js's own frustum-culling/visibility churn on a large instant camera jump. Don't
  scope a nav-DLOD-only fix at it.
- Do not re-litigate the "R185/BatchedMesh was great, then got worse" arc against this session's data —
  already root-caused to machine/driver state in §12, not app code; this session's slower-than-usual
  module bootstrap (`§UPGRADE_THREE_DONE ms=1057` vs the usual `ms=22-48`) was a cold service-worker cache
  after a hard reset, unrelated to §12's history and unrelated to nav-DLOD.

**Open, not yet done (two real perf candidates, ranked):**
1. Investigate whether nav-DLOD's DEMOTE/PROMOTE distance thresholds can be tightened for buildings this
   size, to box more aggressively and close the ~30-60ms gap to full-ghost speed while still keeping
   nearby real geometry visible. Not started.
2. The general (non-nav-DLOD) camera-teleport jank above — separate investigation, not scoped here.

## 19. Distances tightened + same-room protection (2026-07-23, bim-ootb PR #976, `dlod_nav.js`)

**Change (item 1 above, now done):** `PROMOTE_DIST` 50→38, `DEMOTE_DIST` 80→60 (~25% cut). User
condition: "tightening distances are OK as long as in-room remain solid." To honor that, `_wantedReal`
now exempts elements in the camera's CURRENT room from the distance gate entirely (frustum/hysteresis
still applies) — without this, the tighter distances would box out whatever room the user is standing
in. This requires the existing room-mismatch criterion (§13) live at all times rather than
console-only-off — `roomOcclEnabled` flips from default `false` to default `true` (still flippable to
`false` from the console to fall back to plain distance/frustum, no other behavior change).

**Measured result, same session, real flight on LTU_AHouse — a further, real win on top of §18:**
clean post-burst `dlod=on` samples averaged **87.25ms mean (~11.5fps)**, down from §18's 118.4ms
(~8.4fps) baseline at the old 50/80 distances — another ~26% reduction, landing near the upper end of
the 8.4–13.4fps bound estimated before this was implemented (13.4fps = the full-ghost ceiling, itself
unchanged by this PR). Progression this whole investigation: **~4.5fps (pre-session) → ~8.4fps (§18:
chunked restore + honest tag) → ~11.5fps (§19: tightened distances)**.

**Caveat, not glossed over:** the `§DLOD_NAV` log's `room=` field (added by this same change, for
exactly this reason) read `leg-off` or `none` for the ENTIRE captured run — the camera never settled
inside a resolved room. So the same-room *protection* mechanic was never actually exercised in this
test; the full 87ms→118ms improvement measured above is attributable to the tightened distances ALONE.
The condition the tightening was made safe for ("in-room stays solid") has NOT yet been verified live —
next capture needs a longer interior hold with `room=` showing an actual room name, confirming nearby
same-room elements stay real past 60m, before treating that part as proven.

**New anomaly found, unrelated to this PR, not yet fixed:** `§DLOD_NAV active=0 boxed=204250` — boxed
count EXCEEDED the total element count (122,330) after a disengage→re-engage cycle. Not a rendering
bug (per-element real/box state looked correct), a counter bug — `_passReal`/`_passBoxed` most likely
aren't reset when `_buildBoxes` reruns after a prior scan pass was interrupted mid-pass by a disengage,
so stale counts from the interrupted pass carry into the fresh engagement's first completed pass. Open,
not yet root-caused with certainty, not yet fixed.

**Open for next session:** (1) verify same-room protection with a real in-room hold, (2) fix the
boxed-count-overflow anomaly, (3) discuss why frame time appears to floor around ~65-87ms (~12-15fps)
rather than continuing to drop with further tightening — user flagged this as the next real question
("why the ceiling is at 12fps"), not yet investigated.

## 20. IMPLEMENTATION DESIGN — adaptive mesh-budget distance boost (2026-07-24, design only, NOT
built — user + DeepSeek, orthogonal to §17.16's occlusion track, dispatched in parallel)

**Problem this solves, and what it does NOT solve:** aerial/wide-orbit views already run fast today
(§10: fully-boxed aerial = 16 draw calls, 17.3ms) but look boxy — the fixed §19 distance cutoff
(`PROMOTE_DIST=38`, `DEMOTE_DIST=60`) boxes almost everything from a wide vantage regardless of how
much spare frame-time budget exists. This is a VISUAL fix (spend idle budget to look less boxy when
there's headroom), not a correctness or interior-perf fix — §17.16's occlusion track remains the
lever for the actual interior room-level frame-time cost (§18/19's own finding: aerial is already
fast, interior is where the real cost lives). The two tracks are independent and can ship separately.

### 20.1 Mechanism — closed-loop distance boost, not a ranking system
No new priority/ranking machinery needed: distance is already the existing promote/demote axis, so
widening the effective distance cutoff naturally admits the nearest-first candidates in the exact
order the shipped mechanism already orders them. The design is a small closed-loop controller added
to the existing eval cycle (150ms throttle per §18/19), not a new subsystem:
- State: a single persisted `_budgetBoost` (meters), starts at 0 — at `_budgetBoost=0` this is
  byte-identical to shipped §19 behavior (`PROMOTE_DIST`/`DEMOTE_DIST` unmodified).
- Effective thresholds become `PROMOTE_DIST + _budgetBoost` / `DEMOTE_DIST + _budgetBoost`.
- **Cross-track safeguard, required if §17.16 ships alongside this (user caught this gap
  2026-07-24):** the count this controller reads MUST be measured immediately after distance/
  frustum/room-mismatch (§9/§13's population, the same input §17.16.4 defines as occlusion's query
  subjects) — NOT after §17.16's occlusion further prunes it. Reading a post-occlusion count would
  create a cross-track feedback loop: boost sees a low count → widens distance → occlusion hides
  most of the new candidates anyway → count still low → boost widens further, chasing a target
  occlusion keeps eating, unbounded. Pre-occlusion count keeps the two closed loops decoupled —
  boost fills the distance-based candidate pool to its own target; occlusion independently prunes
  that pool for real visibility, with no awareness of or reaction to boost's state.
- Each eval cycle: read current active/real count.
  - If count < `BUDGET_LOW` watermark: increase `_budgetBoost` by a small fixed step, capped at
    `MAX_BOOST`.
  - If count > `BUDGET_HIGH` watermark: decrease `_budgetBoost` by a small fixed step, floored at 0.
  - Between the two watermarks: hold `_budgetBoost` steady — this dead band IS the hysteresis
    (same anti-oscillation shape as §19's own PROMOTE/DEMOTE band, applied one level up).
- **This is self-limiting by construction, no separate aerial/interior mode detection needed:**
  §18 already found interior flight keeps ~20k elements real most of the time (mesh-level
  `visible=false` rarely triggers), so an interior-scoped budget check would naturally sit at or
  above the high watermark most of the time anyway — boost stays near 0 exactly when it should,
  without any explicit "am I aerial" test.

### 20.2 The 20k figure is a starting guess, not a measured constant — verify before shipping
Per this file's own MEASURE BEFORE ESTIMATING discipline (applied to every other constant here —
`PROMOTE_DIST`/`DEMOTE_DIST`, `DLOD_NAV_MIN_ELEMENTS`, §17.14's `OCCL_MAX_HIDE_DIAG`): before
picking real `BUDGET_LOW`/`BUDGET_HIGH`/step/`MAX_BOOST` values, run a real frame-time sweep on
LTU_AHouse across a range of active-element counts (e.g. 5k/10k/15k/20k/25k/30k, using the existing
close-in numbers as anchor points — §10 already measured 52.1ms at 29,815 promoted) to find where
frame time actually starts climbing meaningfully above the ~17.3ms fully-boxed aerial floor. Set the
watermarks from that real knee, not from the 20k figure named in conversation.

### 20.3 Known, explicit tradeoff — state it, don't hide it
Boosting distance at aerial views deliberately trades away some of §10's 16-draw-call/17.3ms win for
better visuals — this is intentional (spending real headroom under the ~16.6ms/60fps budget) but
must be measured and reported honestly, not assumed free, same discipline §3/§7 already established
elsewhere in this file for other tradeoffs.

### 20.4 Witnesses
- **W-BUDGET-EQUIV:** boost lever off (or `_budgetBoost` forced 0) → byte-identical to shipped §19.
- **W-BUDGET-STABLE:** frozen aerial camera with headroom — `_budgetBoost` converges and holds
  within the dead band, does not perpetually ramp or oscillate.
- **W-BUDGET-PERF:** the real frame-time-vs-active-count sweep from 20.2 — sets the real watermark
  numbers from measured data.
- **W-BUDGET-DELTA (numeric, not visual, per this project's FUNDAMENTAL LAW):** log active-element
  count with boost on vs off at the same aerial pose — quantifies "less boxy" as a real number
  (elements promoted), not a screenshot or a feel.

### §20 RESULT — 2026-07-24, Sonnet agent, `bim-ootb` branch `feat/nav-dlod-budget-boost` @
`71cbaac`, committed locally, NOT pushed. All 4 witnesses PASS.

**Real knee measured (§20.2's own warning confirmed — 20k was wrong, not just unverified):**
frame time is flat to ~3,700 active, then climbs steadily — +15% by 7,795 active, +39% by 11,094,
+75% by 15,616. Real knee is **~10-12k active**, well below the 20k guessed in conversation.
Watermarks set from this data: `BUDGET_LOW=6000`, `BUDGET_HIGH=12000`, `BUDGET_STEP=2m`,
`MAX_BOOST=60m` (PROMOTE 38→98, DEMOTE 60→120 at cap).

**W-BUDGET-EQUIV PASS** (boost off, byte-identical to shipped — mutation count 244675 both, 6
poses). **W-BUDGET-STABLE PASS** (frozen aerial camera, boost converges to ≈44 in ~6s, zero drift
for 10s more — dead band holds, no oscillation). **W-BUDGET-PERF** = the sweep above.
**W-BUDGET-DELTA PASS** (same pose: off_real=16 → on_real=7795-10154, real numeric proof).

**Honest tradeoff, as required by §20.3:** boosted aerial costs ~19-29ms (1.1-1.7×) above the
17.3ms/16-draw-call floor across the dead band, up to ~34ms at the BUDGET_HIGH edge — a deliberate,
self-limiting spend of idle budget, not free, matching the design intent.

**Real bug found and fixed during build, not just a tuning note:** the 150ms controller tick could
fire mid-pass (a full 122k-element pass takes ~130ms, nearly the same cadence), smearing thresholds
across a pass and permanently stranding 1000+ elements once the ramp stopped. Fixed by freezing
thresholds per-pass and re-arming a follow-up pass whenever a completed one was evaluated under a
now-stale boost value — a real, non-obvious race worth remembering if this pattern (periodic
controller tick vs a scan whose duration approaches the tick period) recurs elsewhere.

At `_budgetBoost=0`, byte-identical to shipped `PROMOTE_DIST=38`/`DEMOTE_DIST=60`/room-mismatch
exemption/150ms throttle. `feat/occl-bvh-gpu-query`/`/tmp/wt-occl-bvh` untouched, confirmed.

### §20 addendum — 2026-07-24, live-user real-tour finding: boost is INEFFECTIVE at true wide orbits
Live browser log from the merged local test branch (`local/merged-occl-aerial-test`) caught this
directly, not inferred: during the tour's own opening orbit leg (`[WALK] Orbit: r=255 from 143°`),
`§DLOD_NAV_BUDGET` ramps boost all the way to `MAX_BOOST=60` while `active=0` stays zero the ENTIRE
climb. Not a bug — the math is exact: at `boost=60`, effective `PROMOTE_DIST=38+60=98m`, and the
orbit radius is 255m — 98m cannot reach anything at 255m regardless of cap. **The boost mechanism
as built only helps at moderate aerial distances, not genuinely wide orbits** — "aerial coverage"
is not uniformly solved, only the closer end of it. Worth stating plainly rather than letting the
earlier "good enough" read stand unqualified.

**What FPS is achievable if pursued further (raising `MAX_BOOST` or redesigning to reach 255m+
orbits) — answered from real anchor data already measured, NOT a new measurement, explicit caveat
below:** §20.2's real sweep found frame time flat to ~3,700 active (~16.5-16.7ms), +15% by 7,795
(19.2ms), +39% by 11,094 (23.1ms), +75% by 15,616 (29.1ms). Separately, §10/§19 already measured
20-30k active costing 52-87ms+ (interior-flight-scale numbers). **A 255m-radius orbit plausibly
brings a MUCH larger population within reach than the 10-12k knee this sweep was tuned around** —
the building is 425m×286m, so a wide-enough boost could plausibly sweep in tens of thousands of
elements at once, landing well past the cheap zone and into the same cost regime as interior flight
(52-87ms+, i.e. ~11-19fps) rather than the current fast aerial floor (~17-29ms, ~34-58fps).
**This is an extrapolation from real numbers, not a real measurement at 255m-scale distances
specifically — that measurement has not been done.** The honest, MEASURE-BEFORE-ESTIMATING-correct
statement: pushing `MAX_BOOST` further to actually cover true wide orbits is NOT a free visual win
per the cost curve already on record — it could easily trade away most or all of the aerial speed
advantage this whole track was built to preserve. Before raising the cap, the real next step is
measuring active-element count and frame time AT an actual 255m-scale orbit pose specifically
(not extrapolated from the 5-16k sweep), to find out whether there's a usable middle ground or
whether wide-orbit boxiness and aerial speed are a genuine tradeoff with no free lunch at this
building's scale.

### §20 addendum 2 — 2026-07-24, user: Fly Tour lags even in wireframe mode — rules out pure
render/GPU cost, points at Fly Tour's own JS-side path-follower or its render-loop interaction

User-reported, not yet instrumented: perceived Fly Tour lag persists even in wireframe display
mode. Significant because wireframe should remove nearly all fill-rate/shading GPU cost — if lag
survives that, the bottleneck is unlikely to be primarily GPU rendering cost (DLOD box/real draw
calls, material shading, etc.) and more likely CPU-side: either the per-frame DLOD eval/scan work
itself (§18's `chunk_ms`/`§DLOD_TICK` cost, unaffected by display mode), or — per the still-open
question from the same conversation — Fly Tour's own `walkActionT += dt` spline path-follower
(`tour.js` ~line 940) interacting with the render loop differently than manual OrbitControls'
damping does. A same-session log comparison (manual mouse-wheel zoom vs Fly Tour) found comparable
`§DLOD_TICK flips_mean` and `§FPS_MODE` aggregate numbers between the two, which undercut a simple
"translation churns DLOD, rotation doesn't" story — the wireframe finding narrows it further, away
from render cost, without yet confirming the path-follower hypothesis. **Not investigated further
this session per explicit user instruction ("just document it") — real next step, not done:**
instrument `§FPS_MODE`/`§DLOD_TICK` specifically in wireframe mode during Fly Tour vs manual
translation at matched speed, to see whether the gap (if any) is in CPU eval cost, the path-follower
itself, or something else not yet named.

### 20.5 Scope, worktree
Separate from §17.16 — new worktree `/tmp/wt-aerial-budget`, branch `feat/nav-dlod-budget-boost`,
off `origin/main` (post-PR-#976/#977, NOT off `feat/occl-bvh-gpu-query` — different problem, avoids
two parallel agents touching `dlod_nav.js` in the same branch). Runs in parallel with §17.16's own
track, dispatched the same session.

### §20 addendum 3 — 2026-07-24, real user log (Clash-zoom, not Fly Tour): budget-boost is
room-blind, and active-count does not predict frame_ms the way §20.2's sweep assumed

**Context:** user pasted a real `§`-tagged console capture of clicking a Clash-list item (`_flyToClash`,
`measure.js:619-785` — a 2-second two-point tween to the clash overlap centroid, NOT Fly Tour) on
`local/merged-occl-aerial-test` (`/tmp/wt-merged-test` @ `ac04c47`, served at `localhost:8407`,
combining §20's budget-boost with §17.16's structural occluder work). Two findings, read from the
log, not inferred:

**1. `§DLOD_NAV_BUDGET`'s ramp is room-blind — it chased an unreachable target the entire session.**
The log shows `boost` climbing every ~150ms tick from 2 all the way to `MAX_BOOST=60`
(`dlod_nav.js:98`), while `active` stayed pinned in the 2,257–2,844 range throughout — nowhere near
`BUDGET_LOW=6000` (`dlod_nav.js:92`), the low-watermark that would tell the controller to stop
widening. §20's `_budgetControl()` (`dlod_nav.js:289-296`) has no way to distinguish "active is low
because this is a wide-open aerial view that just needs a bigger radius" (the case it was designed
for) from "active is low because this is a small interior room/clash-adjacent spot and there simply
aren't 6000 elements within reach no matter how far `PROMOTE_DIST`/`DEMOTE_DIST` stretch" (this
case). It ramped to its hard cap and sat there, same failure shape already named for wide orbits in
§20's own earlier addendum (`r=255`, `active=0` the entire climb) — this is the SAME blind spot
surfacing in the opposite geometric regime (too-occluded, not too-far). Not yet fixed — only
observed, at a stationary camera (post-clash-zoom idle), so its cost during actual MOVING Fly Tour
legs (where the loop can't idle-park anyway, per Clue 1 upthread) is still unmeasured, not assumed.

**2. `active` count does not predict `frame_ms` on its own — `§FPS_MODE` settled at mean 88-90ms
with only ~2,800 active, far worse than §20.2's own measured "flat ~16.5ms up to ~3,700 active"
region.** This is NOT a new mechanism — it's consistent with, and reinforces, §16/§17's already-
closed conclusion that frame cost tracks **BatchedMesh bucket occupancy** (how many buckets go
FULLY empty and get skipped), not raw active-element count (§13/§16 both found draw-call cuts with
zero frame_ms movement; only §17's object-grain oracle, §17.11, moved frame_ms, because it was
precise enough to fully empty buckets rather than just thin scattered elements within them). The
hypothesis, not yet confirmed: the ~2,800 active elements near this clash point are scattered across
many different discipline buckets rather than concentrated, so few buckets ever go fully-empty.

**Logging added to test both, without new spam (2026-07-24, `viewer/main.js` on
`/tmp/wt-merged-test`, served at `localhost:8407` — NOT yet ported to any other worktree/branch,
NOT pushed):** `§FPS_MODE`'s existing 2-second-throttled line (`main.js:677-687`, no new timer) now
also carries `calls=`/`tris=` (`APP.renderer.info.render`, the exact same counters POC-A already used
in §15 — reused, not a new measurement method) and `active=`/`boxed=`/`boost=` (read straight from
nav-DLOD's own published `window.__dlodNav` stats, `dlod_nav.js:266`). One line, still 2s-throttled,
now lets `frame_ms`, draw-call count, and nav-DLOD's own state be read together without manually
matching timestamps across `§FPS_MODE` and `§DLOD_NAV_BUDGET` lines. **Caveat before testing: this
worktree serves a service worker (`viewer.html:1018`, `sw.js?v=532`) — a plain refresh may serve a
cached `main.js`; hard-refresh (Ctrl+Shift+R) or clear the SW registration in DevTools before
trusting a capture.**

**Not yet a fix, not yet a measured speed claim — per this file's own MEASURE BEFORE ESTIMATING
discipline.** Next step (user to capture, not yet done): run the SAME enriched `§FPS_MODE` capture
during an actual moving Fly Tour interior leg (not just a stationary Clash zoom), to see whether (a)
budget-boost churns uselessly there too, and (b) whether `calls=`/`tris=` move in step with
`frame_ms` or stay flat while `frame_ms` climbs anyway (the latter would mean the bottleneck isn't
rendering at all, reopening the CPU-side question from addendum 2 on firmer evidence than a felt
"still lags in wireframe" report). Only once both Fly Tour and Clash-zoom captures exist side by
side, with these fields, is there enough to decide whether fixing budget-boost's room-blindness
would actually move Fly Tour's frame time — right now it's a real, real-and-documented bug, not yet
a proven lever.

### §20 addendum 4 — 2026-07-24, THREE fixes shipped to `/tmp/wt-merged-test` (localhost:8407),
all three VERIFIED against real live Fly Tour logs, not assumed

Per addendum 3's own "not yet a fix" caveat, three targeted changes went in, each isolated to its
own file/region so none could interfere with the others:

1. **Budget-stall guard** (`dlod_nav.js` `_budgetControl()`): new `BUDGET_STALL_TICKS=3`/
   `BUDGET_STALL_EPS=50` — after 3 consecutive 150ms ticks where `activeElig` doesn't move beyond
   tolerance, the ramp freezes (logs `§DLOD_NAV_BUDGET_STALL` once) instead of climbing to
   `MAX_BOOST=60` for zero gain. Resumes instantly once `activeElig` genuinely moves.
2. **`calls=`/`tris=` reliability fix** (`main.js` `_renderFrame()`): root cause was
   `EffectComposer`'s multiple internal `renderer.render()` calls each resetting `info.render` under
   default `autoReset`, so only the last pass's tiny stats ever survived. Fix wraps the one real
   render call with a synchronous `autoReset=false` → reset → render → capture → restore, touching
   no other code path.
3. **Fly-Tour DPR parity** (`main.js` `_syncDPR()`): manual-orbit-drag has always gotten a
   resolution discount on heavy scenes (S260b); Fly Tour never did, because it moves the camera by
   direct write (`tour.js`), never firing OrbitControls' `'start'`/`'end'` events. `_syncDPR()` now
   drops resolution whenever EITHER reason wants it, checked once per `animate()` tick.

**Verification, real LTU_AHouse flight, same session, `activeElig=`/`stallN=` added to
`§DLOD_NAV_BUDGET` specifically to make this checkable (not assumed):**
- **Stall guard CONFIRMED working**, first at the opening `r=255` orbit — `boost=2 activeElig=0
  stallN=0` → `boost=4 stallN=1` → `boost=6 stallN=2` → `§DLOD_NAV_BUDGET_STALL frozen boost=6
  activeElig=0` (3 ticks, not the pre-fix 30-tick climb to 60). Repeated correctly mid-interior-leg
  (froze at boost=12 when `activeElig` genuinely plateaued at 3122), and correctly UN-froze and rode
  the ramp down to 0 the instant `activeElig` jumped to 13309 (crossed `BUDGET_HIGH`) — distinguishes
  real movement from stall exactly as designed, not a blanket freeze.
- **DPR-parity fix compounding with the stall guard**: the frozen-boost aerial stretch (`boxed=
  122330` pinned) ran a stable **67-98ms**, better than addendum 3's pre-fix 94.8ms floor for the
  same fully-boxed state.
- **New finding, not previously this clean: `'o'` DOES substantially help INTERIOR legs too** — a
  clean same-flight A/B at essentially the same point in the route: `dlod=on` (`active=9540
  boxed=112790`) ran **mean=95-107ms**; seconds later, right after toggling `'o'` off
  (`§DLOD_NAV_DISENGAGE`), the same leg with the FULL scene rendered (`calls=16033
  tris=11348093`) ran **mean=200-213ms**. Roughly a 2× win, interior, same route position — this
  updates (does not confirm) the earlier working assumption that nav-DLOD "doesn't really
  contribute inside" — per user direction, this stays its own live thread, not dropped, heading
  toward 1M-element scalability.
- **Confound flagged, not misattributed:** `Alt+G` (GI/N8AO preview) and `'n'` (Night mode) were
  toggled mid-flight in this capture and each add real, unrelated cost (one spike hit mean=249.7ms
  right after `Alt+G`) — noted so a future reader doesn't blame nav-DLOD for those specific spikes.

**Where this leaves the numbers — real measured FPS, this session, LTU_AHouse (122,330 elements),
real RTX 4060, `local/merged-occl-aerial-test` + these 3 fixes:**

| Leg | dlod | frame_ms mean | ~fps |
|---|---|---|---|
| Aerial orbit, fully boxed, stall-frozen | on | 67-98 | ~10-15 |
| Interior flyPath | on | 95-107 | ~9.3-10.5 |
| Interior flyPath, SAME spot | off | 200-213 | ~4.7-5 |

This lands close to — not dramatically past — the file's own best prior shipped numbers (§18:
~8.4fps interior; §19: ~11.5fps at the tightened-distance aerial point). That's expected and
honest: today's three fixes are hygiene/parity fixes (stop wasted work, close a missing discount),
not a new culling mechanism — they were never going to multiply the win the way §19's distance
retuning or a working occlusion mechanism would.

**What's actually left for a further "sure" win, stated plainly:** the only mechanism in this whole
file ever PROVEN to move interior frame_ms substantially is §17.10-17.11's oracle POC (up to 60%
reduction, object-grain occlusion, a PERFECT zero-cost stand-in for the real mechanism). Every real
attempt to build that mechanism (§17.12 raw BVH, §17.13 depth-exclusion, §17.14 size-gate, §17.15
depth-decouple, §17.16 structural-occluder-decouple) either failed correctness outright or landed
PARTIAL (§17.16: oscillation solved, false-hide 12.33% vs the ~0 bar, not shipped). So the honest
expectation, not a guess:
- **Without solving §17.16's remaining false-hide gap:** further gains from here are small,
  incremental (tens of %, not a multiplier) — things like tuning `EVAL_CHUNK`/throttle cadence,
  extending the DPR discount more aggressively, or trimming composer/effects cost specifically
  during Fly Tour. None of these are proven yet either — MEASURE BEFORE ESTIMATING still applies.
- **If §17.16's false-hide gap gets closed** (door/opening-aware exemption for cutout-bearing
  walls, named as the next step in that section, not yet done): the ~99% occlusion ceiling §15
  measured and the oracle's up-to-60% frame_ms reduction become reachable — that is the one
  currently-known path to a genuinely large multiplier on interior legs, not just a modest tightening.
- Anything claimed beyond this needs its own real measurement before being stated as expected —
  this file's own standing rule, restated because it's the honest answer here too.

### §20 addendum 5 — 2026-07-24, SESSION CLOSEOUT: pivot away from DLOD-side theories, camera-math
ruled out, one open question left for next session — read this before resuming

**User directive driving this pivot, stated plainly, do not re-litigate:** "I don't think occlusion
or DLOD is the issue... During Clash Analysis I can turn everything on, no experience of lag. Even
if is, the cost is too little." After addendum 4's confirmed fixes, two more theories were floated
this same session and should be treated as **considered, not settled — deprioritized by user
direction, not disproven**, so a future session doesn't either blindly chase them OR blindly assume
they were ruled out:

1. **`§WALK_TICK_COST` instrumentation** — added to `main.js` (wraps `APP.walkTick()` alone, isolates
   its own execution time — spline eval, per-tick `A.status.textContent` write — from render/DLOD
   cost entirely). **Never actually queried** — the user redirected before a capture was taken. It's
   live, inert until `walkMode` is on, 2s-throttled, zero risk left sitting there. If a future session
   wants the CPU-path-follower question closed with a real number, this is already in place — just
   run a Fly Tour leg and read `§WALK_TICK_COST`. Do not re-add it if it's still there.
2. **Re-partition "snap burst" spike theory** (max/mean jitter, e.g. `mean=101.9 max=457.6`,
   correlated with large `started=` counts in `§DLOD_NAV` lines — `FADE_CAP=128` caps smooth
   cross-fades, everything past the cap snaps synchronously in one frame) — **user does not accept
   this as the real driver of remaining lag**, given Clash tolerates "everything on" with no felt
   lag. Not implemented, not measured further, explicitly set aside per user direction — do not pick
   this back up without a fresh reason to.

**What WAS closed this session, by reading real code, not guessing — safe to build on:**
- **Camera-path math is NOT the differentiator.** `tour.js`'s own `'orbit'` action
  (`tour.js:1068-1121`) is pure trig/smoothstep per frame (`cos`/`sin`, `t*t*(3-2t)` easing, one
  `controls.update()` call) — structurally identical in cost-character to MaxQ's analytic beat plan
  (`effects.js`'s `_cinemaPathPlan`). Neither has anything the other lacks; there is no code trick to
  port from one to the other. This closes the "maybe Fly Tour's orbit math itself is expensive"
  question — it isn't.
- **The one unifying variable across every smooth-vs-laggy comparison made this session is SCOPE,
  not mechanism:** Clash's zoom never renders more than a few meters around a clash point; MaxQ's
  beats stay inside ONE room (§5: "always dives into the largest interior space"); Fly Tour's own
  opening/closing `'orbit'` action is the one case that deliberately sweeps 255m out around the
  WHOLE 425×286m building — nothing else in this app ever attempts that. This is consistent with
  every prior finding in this file (§5's storey-occlusion origin story, §15's ~99% interior-occlusion
  measurement, §18/§19's aerial-vs-interior split) — not a new mechanism, a restated confirmation of
  the same axis from a fresh angle.
- **Real numbers already on record for that ONE wide-orbit case, same session, same building:**
  335-360ms mean without nav-DLOD engaged, 63-98ms with it (stall-guard-frozen). Whether this
  constitutes "the DLOD win that matters" or is beside the point of the user's remaining complaint
  is the open question below — stated as fact here, not as an argument either way.

**OPEN QUESTION for next session — this is where the session ended, answer it before doing anything
else DLOD-side:** does felt roughness now concentrate in the **aerial open/close orbit legs** (where
tonight's own numbers show a large, measured DLOD win: 335→63-98ms) or in the **interior middle**
of the flight (where an early session finding — Fly Tour with `'o'` fully off — already called
interior "hardly noticeable," and this session's clean on/off A/B found nav-DLOD helping there too,
~1.3-2×, smaller than the aerial win but real)? The user has not yet answered this directly. Do not
guess — ask, or get a fresh log capture with the user narrating which leg felt rough. This single
answer determines whether remaining work is "accept the current numbers as the practical floor for
this session's fixes" or "something in this file's own diagnosis is still incomplete."

**File state, not committed, not pushed — same convention as every other entry in this file:**
`/tmp/wt-merged-test` (branch `local/merged-occl-aerial-test` @ `ac04c47`, served live at
`localhost:8407`) has THREE uncommitted fixes from this session: `viewer/dlod_nav.js` (budget-stall
guard + `activeElig=`/`stallN=` logging), `viewer/main.js` (calls/tris reliability fix, Fly-Tour DPR
parity, `§WALK_TICK_COST` instrumentation) — all syntax-checked, all verified against real logs in
addendum 4 except `§WALK_TICK_COST` (added, unqueried, see above). `viewer/tour.js`'s own uncommitted
diff (`§FLY_INTERIOR_SLOWDOWN`, a 0.4× interior-speed experiment) predates this session, is
untouched, and is NOT part of this session's work — do not attribute it to these fixes or revert it
without checking whose work it is first.

## §21 — MaxQ/Clash-vs-FlyTour smoothness comparison, walkTick damping bug found+fixed, ray-blast
DLOD upload race found+NOT-shipped (2026-07-24, real logs + live browser, `local/merged-occl-aerial-
test` @ `0587956`, committed locally, NOT pushed)

**Trigger:** user pushback that MaxQ preview and Clash `_flyToClash` both feel "supersmooth" while
Fly Tour doesn't, even with nav-DLOD on/off making no felt difference — "have we isolated the factor
beyond features and occlusion (which I admit their impact)."

**1. MaxQ is not a fair comparison at all — confirmed in code, not assumed.** `effects.js:3893-4061`
(`A.startCinemaOrbit`) pipes the canvas through `captureStream()`/`MediaRecorder` and downloads a
`.webm` — what reads as "smooth" is a **played-back video file**, decoupled from render cost by the
decoder's fixed playback rate, not a live interactive path. `cinema_maxq.js`'s own 10s live preview
(`§MAXQ_PREVIEW`, lines 389-424) IS live, though, and runs at a LARGER radius (`envelope×2.5`, i.e.
~1062m on LTU) than Fly Tour's own measured r=255 orbit, with nav-DLOD fully disengaged
(`dlod_nav.js:348`) — i.e. 100% real geometry, wider than Fly Tour ever goes, and it's fine. This
directly disproves "too much real geometry in view at range" as sufficient explanation on its own.
(One in-code correction made as part of this: `cinema_maxq.js`'s own `§MAXQ_STREAM_FIRST` comment
previously stated the disproven "boxes were for speed" theory as fact — corrected in place.)

**2. Frame_ms magnitude is not the differentiator either — proven by the user's own Clash capture.**
Real `§FPS_MODE` during Clash-list navigation (full scene, `dlod=off` by Clash's own design):
`mean=99.1-106.4ms` sustained, same or worse than Fly Tour's own "acceptable" states (63-116ms). Yet
Clash reads as smooth. Ruled out: frame cost itself.

**3. What actually differs: exposure duration, not cost.** Clash's `_animFly` (`measure.js:619-771`)
is a single 2s tween then a **static** camera while the user reads the clash detail. A human eye
can't register judder in a hop that short, and a static frame looks identical at any fps. MaxQ's live
preview and Clash's tween are both brief/discontinuous; Fly Tour is the only thing in this app asking
for continuous tracked motion over **minutes**. Same per-frame cost, only one of them gives a human
eye long enough exposure to perceive it as stutter.

**4. A genuine, geometry-independent cost floor was found, not yet fully proven.** Best-case sample
in a real capture (nav-DLOD on, fully boxed aerial orbit, `calls=16`): frame_ms still **63.9-101.5ms**
— cutting draw calls 15,981→16 only bought ~200-300ms→~65ms, not the ~1000x reduction geometry-driven
cost would predict. Something costs ~60ms/frame independent of what's drawn. **Not yet isolated to a
cause** — the decisive test (empty-scene `§FPS_MODE`) was proposed but not run this session.

**5. `walkTick` vs `pvStep`/`_animFly` line-by-line: one real bug found, fixed, shipped.**
`tour.js`'s `walkTick` (927-1216) ran an "adaptive smoothing" epilogue **unconditionally** after every
action, re-lerping the already-eased position back toward the previous frame at `SMOOTH=0.6` even in
steady cruise — throttling real travel speed to ~60% of intended every frame while `walkActionT`
advanced the full `dt` regardless. `pvStep`/`_animFly` have no equivalent second pass. **Fixed**: now
a no-op below the 0.5m/frame jump threshold; real transition-jump damping (the epilogue's actual,
stated purpose) untouched. **Confirmed via live `§WALK_TICK_COST` capture that this was never a
frame-rate factor** (mean 0.03-0.14ms throughout, negligible next to 60-200ms frame times) — this
fixes motion *feel* (a permanent lag-behind in steady cruise), not fps. User's own follow-up capture
after this fix confirmed sluggishness persists unchanged — expected, since the bug never touched
frame cost. Committed (`0587956`).

**6. Ray-blast DLOD (`dlod.js`, §6.8, separate from `dlod_nav.js`/the `'o'` key, always-on above 5000
elements) — a real upload-cost mechanism found, a real fix explored and verified correct, REVERTED
before shipping because it's unsafe standalone.** `dlodTick()`'s per-instance flip
(`obj.setMatrixAt(...)` + `instanceMatrix.needsUpdate=true`) triggers a **full InstancedMesh buffer
re-upload** on any flip (confirmed against the vendored three.js source: empty `updateRanges` ⇒ full
`bufferSubData`) — already suspected in-code by a prior session (`dlod.js:26-29`, dated 2026-07-23,
one day before this file existed) and never resolved. User's real Clash capture showed `flips_mean`
in the thousands per tick continuously. Fix explored: `instanceMatrix.addUpdateRange(idx*16,16)` per
flip — verified correct against the vendored three.js source (`addUpdateRange`/`updateRanges` on
`BufferAttribute`, inherited by `InstancedBufferAttribute`), applied, syntax-checked, and live-tested
in the real browser (patch confirmed loaded via `dlodTick.toString().includes('addUpdateRange')`) —
live orbit looked smooth to the user, but the synthetic drag-test numbers were noisy/inconclusive
(same 100-270ms range as before), so no numeric win is claimed. **Reverted before commit**: found
`helpers.js` (`filterInstancedMesh` — Find isolate/room-isolate/storey+discipline filters),
`navigate_find.js`, and `time_machine.js`'s own DLOD ALL call `setMatrixAt`+`needsUpdate` on the SAME
InstancedMesh objects without ever calling `addUpdateRange`. Before this exploration, every plain
`needsUpdate=true` always forced a full upload, so no caller could ever starve another's write;
partial ranges from dlod.js alone would silently drop any of those other callers' changes if both
fire on the same mesh in the same frame — a real, not hypothetical, regression risk. Left reverted,
documented in-code (`dlod.js`) for **the planned DLOD consolidation** (dlod.js/dlod_nav.js/
time_machine.js DLOD/Find's filter, unified — user's own stated motivation: incoming 1M-element-scale
testing makes this fragmentation a correctness liability, not just a perf one). Do not re-attempt the
addUpdateRange fix in dlod.js alone without also fixing the other three call sites in the same change.

**7. Open question from §20's own closing addendum — STILL UNANSWERED, not addressed this session:**
does felt roughness concentrate in aerial legs or interior legs? This session pursued a different,
real thread instead (walkTick, ray-blast DLOD) and found real things, but did not close that question.
Next session: still the first thing to resolve before further DLOD-side work.

**Net position after this session:** one real motion bug shipped (walkTick). One real, evidenced,
geometry-independent cost-floor candidate named but not proven (needs the empty-scene test). One
real upload-cost mechanism found and a correct fix designed, explicitly held back pending the
consolidation because shipping it alone is unsafe. The core comparison (why MaxQ/Clash read smooth
and Fly Tour doesn't) is now understood as an exposure-duration effect on top of a floor that isn't
yet explained — not a code bug, not solved by more occlusion work alone.

## §22 — the §21 cost floor, ROOT-CAUSED AND FIXED live (2026-07-25, real browser, `local/merged-
occl-aerial-test` @ `8ee7aa6`, committed locally, NOT pushed)

**§21's "unexplained ~60ms floor" is explained — it was never geometry-independent, the earlier
test just hadn't controlled for scene-object count.** Live comparison, same session: a light
building (Duplex, ~150 total scene objects) sustained ~11-27ms/frame; LTU_AHouse reduced to a
similarly tiny draw-call count via nav-DLOD (`calls=16`) still cost 63.9-101.5ms — proving the
floor tracks something OTHER than draw calls. Direct live count (`scene.traverse()`,
`isInstancedMesh`/`isBatchedMesh`) found it: **LTU_AHouse had 13,453 separate InstancedMesh scene
objects averaging only 2.7 instances each** — `streaming.js`'s own routing rule
(`elements.length >= 2 → InstancedMesh`, `streaming.js:970-972`, marked "sacred — do NOT change
without testing TM, picking, storey/disc filter") sent every low-count geometry hash to its own
scene object. Each pays three.js's native per-object frustum-cull traversal every frame regardless
of visibility — a cost that scales with OBJECT COUNT, independent of draw calls, and independent of
anything nav-DLOD/dlod.js/box-proxy ever touched (all of which only ever reduced draw calls).

**Fix (`streaming.js` §S280e):** hashes with `LOW_INSTANCE_BATCH_MAX=3` or fewer instances now fold
into the same multi-geometry BatchedMesh bucketing already used for single-instance elements
(bucketed by storey|disc|rgba|matVariant — a bucket already holds many different geometries, so a
few instances of the same geometry is not a new capability, just a wider net). `_batchMeta`/
`_instanceMeta` contract shape unchanged — every element still lands in exactly one, via the same
`_registerBatchSlot`/`_registerInstanceSlot` calls the 16 documented consumers already read.

**Verified live, LTU_AHouse, real RTX 4060:**
| metric | before | after |
|---|---|---|
| scene objects (`scene.traverse()` count) | 15,946 | 4,706 |
| InstancedMesh objects | 13,453 | 1,997 |
| draw calls (full load) | 15,981 | 4,698 |
| sustained-rotation frame time (continuous rAF, not synthetic drag) | 200-270ms (~4-5fps) | **86.7ms (~11.5fps)** |

Draw-call reduction is a side effect of consolidation (fewer, bigger BatchedMesh buckets), not the
target — the object-count/traversal fix is the actual lever. User watched the live rotation and
confirmed "very smooth" — consistent with, not just asserted alongside, the measured number.

**What this does NOT fix, stated plainly:** 12.9M triangles are still real geometry cost — the
remaining gap to 60fps (~16ms) is now legitimate GPU/rasterization cost, the domain §17's occlusion
work was already aimed at, not object-count overhead. This fix and §17's occlusion work are
complementary, not competing — this removed a JS-side traversal tax that was independent of and
additive to whatever occlusion eventually ships.

**NOT YET VERIFIED, do not treat as fully shipped:** this changes the exact routing rule
`streaming.js` itself flags as sacred, with 16 documented consumers (`time_machine`, `picking`,
`helpers`, `walk`, `dlod`, `ghostglass`, `grid_views`, `scene`, `doc_canvas`, `city`,
`wizard_classify`, `nlp`, `tools`, `main`). **Time Machine, picking, and storey/discipline filtering
have NOT been re-tested against this change.** The contract shape is unchanged (every element still
in exactly one of `_batchMeta`/`_instanceMeta`), which is why this is *expected* to be safe — but
that is a reasoned expectation, not a witness. Re-test those three specifically before calling this
done, same discipline as every other change in this file's history.

**§22 correction, 2026-07-25, real user capture, `meshAggs=4532` confirmed (post-fix, verified real
version — a stale-cached `viewer.html` cost one earlier false reading, resolved via close-tab + SW
unregister + hard-reload):** the earlier "'o' gives no additional win inside the building" claim
(single static point, 67.7ms off vs 77.5ms on) was too small a sample and caught a bad moment.
**Corrected with sustained real Fly Tour interior motion, same session:** `'o'` OFF interior legs
ranged 89-180ms (`calls` 2100-4600, swinging with view openness); the same interior legs with `'o'`
ON (`active=20-36k boxed=87-102k`) settled to a tight, consistent **86-96ms** (`calls` 970-1700).
**`'o'` does help indoors too, post-fix — modestly, and more importantly it makes frame time far
more stable, not just lower on average.** Aerial remains the larger win; this doesn't overturn that,
it corrects "interior gets nothing" to "interior gets a real, smaller, stabilizing benefit."

## §23 — NEXT TASK: MaxQ's live preview is smooth at full geometry; find out why before assuming
interior needs another draw-call optimization (2026-07-25, not started)

**The contradiction §21's "exposure duration" theory left unresolved, user re-raised it directly:**
today's object-count fix gave interior only ~10-15% (95-107ms→86-96ms with `'o'` on) — real, but not
what makes Fly Tour feel smooth. Meanwhile `cinema_maxq.js`'s **live 10-second preview** (`pvStep`,
BEFORE the recorded-video bake — not the MediaRecorder path §21 already ruled out as a fair
comparison) is: continuous real-time rendering, full geometry, nav-DLOD fully disengaged, a *wider*
dive/orbit radius than Fly Tour's own orbit, running a full 10 seconds — long enough that "too brief
to judge" doesn't cover it either. And it reads smooth. Same building, same renderer, same
post-today's-fix scene. That's a real, unexplained gap, not a solved one — do not close this file
believing the MaxQ comparison is settled.

**The concrete, checkable difference, not yet measured:** MaxQ's interior dive targets and centers
on the **single largest room** (`§CINEMA_SPACE`, `effects.js` `_cinemaPathPlan`) — bounded to one
enclosure's contents. Fly Tour's `flyPath` legs travel **through** a sequence of rooms/corridors —
at any given point it can be looking down a corridor or through an open doorway into adjacent spaces,
exposing more geometry to the frustum than a single centered room ever would, even at similar overall
triangle budgets.

**Task:** measure `renderer.info.render.calls`/`.triangles` at (a) MaxQ's actual interior dive pose
and (b) several of Fly Tour's `flyPath` interior poses, same building (LTU_AHouse), same session,
post-object-count-fix. If MaxQ's pose has substantially fewer triangles actually in frustum, that
confirms room-level occlusion (§17, already the named remaining lever, still gated on the false-hide
gap) is what actually closes this gap — not another draw-call/object-count optimization, which is
what §21/§22 already exhausted. If the triangle counts are comparable and MaxQ is still smoother,
that reopens the mechanism question entirely and this section's hypothesis is wrong — say so plainly
if that's what the numbers show, don't force the room-boundedness explanation to fit.

**Prerequisite state for whoever picks this up:** the object-count fix (`8ee7aa6`) and walkTick fix
(`0587956`) are local-only in `/tmp/wt-merged-test` (`bim-ootb`, branch
`local/merged-occl-aerial-test`, no upstream configured) — NOT pushed anywhere. Verify TM/picking/
storey-filter against `8ee7aa6` before pushing (§22's own open item), independent of this task.

## §24 — this section's hypothesis picked up + live-measured, real code fix shipped elsewhere
(2026-07-26; full writeup lives in `FLY_TOUR_CORRIDOR_GRAPH.md`'s
`§TARGET_BOUNDED_LOOKAHEAD` section, not duplicated here — that file owns `flyPath`/pacing
implementation history)

§23's room-boundedness hypothesis was real but the actual mechanism was a MaxQ/Clash-vs-flyPath
TARGETING difference, not (only) frustum triangle exposure at a fixed pose: MaxQ/Clash both derive
their look-at target + distance from something bounded (room extent / clash overlap size); `flyPath`
used a fixed 0.05-of-total-arc-length lookahead fraction, which stayed meters-scale for MaxQ/Clash's
own short bounded beats but blew out to tens of meters ahead on `flyPath`'s full-storey routes. Fixed
by capping the lookahead to an absolute arc-length distance (`LOOKAHEAD_M=5`) instead of a fraction of
total path length. Live-measured on LTU_AHouse (real browser, `renderer.info.render.triangles`,
position held constant, only look-at orientation changed): mean triangles across one interior leg
dropped 18% (5.11M→4.18M), worst single point 6.7x (9.41M→1.40M). §23's own still-unmeasured "MaxQ
pose vs Fly Tour pose triangle count" comparison was superseded by this more direct A/B (same building,
same leg, isolating the lookahead variable itself) rather than run separately — don't re-run it unless
a reason emerges to distrust this result specifically.

## §25 — CLOSED this round (2026-07-26, user: "the perf is pretty good now... focus on the path
for next session, clean up here, close")

**Shipped to `bim-ootb` main, all live** (PRs #985→#988, `viewer/tour.js`):
- `§TARGET_BOUNDED_LOOKAHEAD` — flyPath gaze capped to an absolute look-ahead distance, not a
  fraction of total path length (§23/§24 above).
- `§PACE_SWING`/split fast-slow caps — the LOS/height/distance inverse-pacing clamp, tuned across
  several live-review rounds down to `PACE_FACTOR_MIN=1/3` (courtyard hasten, user's explicit X3),
  `PACE_FACTOR_MAX=1.6` (near-object slowdown, validated against small rooms).
- `§BASE_SPEED_REGRESSION` — `INTERIOR_PACE_FACTOR` 0.3→1.0, the real root cause of "cannot be a
  whole 2 minutes" (a flat dampener silently reintroduced a multi-minute crawl that an earlier
  §R6-PACE round had already fixed once).
- `§CRUISE_CAP`/`§ENTRANCE_LOOKAHEAD` — the entrance moveTo's base duration was distance-INDEPENDENT
  (a real bug: dist=10/50/100/300m all gave the identical 1.5s), so no near-target deceleration
  could ever be felt regardless of pacing-curve tuning; fixed at the root (capped cruise speed) not
  patched at the curve.

**Measured result this session:** ~10.6 fps sustained during interior Fly Tour with DLOD nav-culling
on (mean frame time 94.7ms, real RTX 4060, LTU_AHouse, `§FPS_MODE` log) — matches the already-shipped
§22 baseline (86.7ms/~11.5fps) closely. **Stated plainly: raw rendering FPS did NOT move this
session** — every fix here touches camera position/gaze/timing, never triangle or draw-call counts,
so none of it could move that number. What changed is motion FEEL (no more multi-minute crawls,
graceful accel/decel near objects, no more staring through doorways/down corridors). The remaining
~85-95ms/frame floor is real GPU/triangle cost (12.9M triangles, LTU_AHouse) — §17's occlusion-culling
domain, already CLOSED as a 4-times-failed-correctness architectural problem (§17.12-§17.16), not a
free win sitting on the table. A code-level pass over `dlod.js`/`helpers.js`/`navigate_find.js`/
`time_machine.js` this session found no NEW unshipped low-hanging fruit beyond what §17.15/§17.16
already named (the `addUpdateRange` partial-buffer-upload fix, still correctly reverted — unsafe
standalone across 4 `setMatrixAt` call sites without the full DLOD consolidation).

**Next session: `FLY_TOUR_CORRIDOR_GRAPH.md` §HIGHLIGHTS_FIRST_ROUTING** (biggest hall/room first,
turn around, stairs when present, before touring the rest) — a routing/ordering change, orthogonal
to everything closed here (this file owns pacing/speed/gaze; that file owns which points/what order).
Confirmed no interaction: whatever stop order that spec settles on inherits this session's fixed
base speed and bounded look-ahead for free. Do not re-open this pacing thread without a new,
specific, live-reproduced complaint — the four rounds of tuning above are validated against real
user live-review, not guesses.

## §26 — ⚠ SERIOUS, UNFIXED: `_boxIndex` null-deref crash on rapid DLOD-nav toggle (2026-08-08)

**Found live on `red1oon.github.io`, LTU_AHouse, `viewer/dlod_nav.js`, real console stack:**
```
Uncaught TypeError: Cannot read properties of null (reading '1I_$5N3tj3shirkTIDgMMy')
    at _evalChunk (dlod_nav.js?v=1:4:16259)
    at _tick (dlod_nav.js?v=1:4:20508)
```
The unreadable property name is a GUID — something is reading `null[<guid>]`. Not from tonight's
night-lighting session's own changes (that session never touched this file) — pre-existing, found
by accident while investigating an unrelated "still lags" report on LTU_AHouse.

**Reproduction pattern seen in the log** (rapid `o` — toggleDlodNav — presses): TWO
`§DLOD_NAV_DISENGAGE reason=pill-off` lines fire back to back, with a `§DLOD_NAV_BUILD`/
`§DLOD_NAV_ENGAGE` pair sandwiched between them but no visible re-press of `o` logged between the
two disengages — i.e. the toggle fired faster than the engage/disengage cycle can cleanly settle.

**Root cause, traced by direct code read (not fully execution-verified — this is the leading
hypothesis, next session should confirm with a live repro + breakpoint before patching):**
- `_boxIndex` (`dlod_nav.js:164`) is nulled in exactly one place: `_disposeBoxes()` (`:378-386`,
  `_boxIndex = null` at `:384`).
- `_evalChunk(app)` (`:1552`) reads `_boxIndex[guid]` at `:1581` with **no null-guard** — it checks
  `!_guidArr || !_guidArr.length` at the top (`:1553`) but never checks `_boxIndex` itself.
- `_evalChunk` is called from exactly one place: `_tick()` at `:1751` (`if (_scanPending)
  _evalChunk(app);`), one chunk per animation frame while a scan pass is in progress.
- Toggling DLOD-nav OFF (`:1809-1819`) does `cancelAnimationFrame(_rafId)` (killing the MAIN
  `_tick` rAF chain) then calls `_restoreAllNow(app, 'pill-off', _disposeBoxes)` — this starts a
  **separate, uncoordinated** multi-frame drain loop (`_restoreAllNow`, `:1656-1690`) that
  schedules its OWN `requestAnimationFrame(step)` calls, NOT tracked by `_rafId` and therefore
  **not cancelled by anything**. When that drain finishes (`finish()`, `:1673-1682`), it
  unconditionally calls `onDone()` = `_disposeBoxes`, nulling `_boxIndex` — with no check for
  whether a NEWER engage has since rebuilt it.
- If the user toggles back ON before that old drain finishes, `_tick` resumes, rebuilds a FRESH
  `_boxIndex` (`_buildBoxes`/`_buildRealIndex`, `:1704-1705`) and starts scanning against it. The
  OLD drain is still running in the background, decoupled from this new session. When the old
  drain eventually finishes, its `_disposeBoxes` call nulls the FRESH `_boxIndex` out from under
  the actively-running new scan — the next `_evalChunk` call crashes on `_boxIndex[guid]`.
- This needs the two toggles close enough together that the old restore drain (a multi-frame,
  `EVAL_CHUNK`-sized loop over up to `boxIndex`'s full guid count — up to 122k entries on
  LTU_AHouse) hasn't finished before the new engage starts and runs a scan pass — consistent with
  it surfacing on LTU_AHouse (largest tested building) under rapid toggling, not smaller buildings.

**Why this matters beyond a console error:** an uncaught exception thrown from inside a
`requestAnimationFrame` callback (`_tick`) breaks that specific rAF chain silently — no visible
crash dialog, just DLOD-nav's tick loop dying mid-session, which would present exactly as "lag" or
"nav mode stuck" without any obvious cause, since nothing after that point re-schedules `_tick` for
that chain. Genuinely worth fixing, not a cosmetic console-log issue.

**Not fixed this session — deliberately, out of scope for the night-lighting work in progress and
found only by accident. Two candidate fix directions for next session to evaluate, not prescribe:**
1. Add the missing null-guard to `_evalChunk` (`if (!_boxIndex) return;` alongside the existing
   `_guidArr` check) — cheapest, stops the crash, but doesn't address the underlying stale-drain
   race (state could still silently corrupt without the exception surfacing it).
2. Make `_restoreAllNow`'s `onDone` callback generation-aware — tag each restore drain with the
   `_engaged`/session generation it started under, and skip `_disposeBoxes` if a newer engage has
   superseded it by the time the drain finishes. Addresses the root cause, more invasive.
Confirm the race with a live repro (rapid `o` `o` `o` on LTU_AHouse, breakpoint in `_disposeBoxes`)
before picking a fix — the hypothesis above is a code-read diagnosis, not yet a witnessed one.

## §27 — ⚠ USER PRIORITY DIRECTIVE (2026-08-08): chase §26 + the BVH-stall re-measurement to ZERO next session

**Watchdog's own read was "stop, both are correctly filed as next-session material, not blockers."
User overrode that explicitly: "this is serious... chase this mem issue till zero as it affects
everything else."** Treat this the same as the project's standing WORK-TO-ZERO backlog contract
(`CLAUDE.md`) — this is now that contract's item, not an optional "if time permits" note. Don't
re-litigate whether it's worth doing; that call was already made.

**The two items, both from the same LTU_AHouse session, both real, both witnessed with numbers —
work them in this order:**

1. **§26 above — `_boxIndex` null-deref crash in `dlod_nav.js`.** Confirm the generation-race
   hypothesis with a live repro (rapid `o` `o` `o` on LTU_AHouse + breakpoint in `_disposeBoxes`),
   then fix it — §26 names two candidate directions (null-guard in `_evalChunk` vs. making
   `_restoreAllNow`'s `onDone` generation-aware). An uncaught exception inside a `requestAnimationFrame`
   callback silently kills that tick chain — this is a plausible contributor to "lag" reports that
   have no other explanation, not just a console-log nuisance.

2. **`§BVH_DEFERRED` 41-54s on LTU_AHouse, re-measured from `TM_INCREMENTAL_RENDER_PERF.md`'s
   never-closed "17.4s, same-tab thread contention" hypothesis.** Two real runs this session:
   cold geo cache → `ms=41109`; warm geo cache → `ms=54175` (**worse**, ruling out cache-coldness
   as the driver). Not correlated with night-mode on/off in either run. Next step, already named
   and not yet run: a clean-vs-busy A/B on LTU_AHouse — same building, same cache state, one run
   with no other interaction until `§BVH_DEFERRED` completes, one run toggling DLOD-nav/scrubbing
   the tour concurrently. If the busy run is reliably worse, that confirms thread contention as the
   cause and points at the fix (defer other main-thread work while this build runs, or chunk it
   more aggressively); if not, the 41-54s figure needs a different explanation and this task isn't
   done at "confirmed a hypothesis" — keep going per WORK-TO-ZERO until the actual cause is fixed,
   not just diagnosed.

**"Affects everything else" — why this outranks other backlog items:** both mechanisms sit in the
main render/interaction thread of every large building this viewer opens (LTU_AHouse is the largest
tested, but the same code paths run on every building), not behind a feature flag or an opt-in
toggle — a fix here compounds across every future session's testing on any building at this scale,
where a bug specific to e.g. one night-mode constant would not.

**Session end = both items ✅ (fixed + witnessed) or ⛔ (blocked on a named, specific question) —
not "diagnosed, filed for later" again. That already happened once this session.**

## §28 — §27 CHASED TO ZERO (2026-08-08, follow-on session): both items closed

**1. §26 `_boxIndex` null-deref race — ✅ FIXED + WITNESSED.** Confirmed the generation-race
hypothesis by direct code trace, not just belief: `_restoreAllNow()`'s first synchronous `step()`
call schedules its own `requestAnimationFrame(step)` continuation — a handle the module's `_rafId`
never tracks. A rapid OFF→ON toggle makes `_tick()` force-complete that drain early via
`_restoreFlush()` (so the fresh re-engage can rebuild `_boxIndex` without racing it), but the
drain's stale leftover `step()` still fires on a later frame regardless, sees the loop already
finished, and calls `finish()` a SECOND time — disposing whatever `_boxIndex` is CURRENTLY live
(the freshly rebuilt one). `_evalChunk` then reads it as null on its very next call.
Live-witnessed on real GPU (RTX 4060 passthrough, headless Chrome, LTU_AHouse 122,330 elements,
`witness_boxindex_race.js`, scratch/not checked in): unfixed build reproduces the EXACT field
stack trace (`Cannot read properties of null (reading '<guid>')`) on rapid `o`/`o`; fixed build
(closure-local `_done` flag makes `finish()`/`step()` idempotent per invocation) shows zero
crashes across repeated 2-press and 3-press toggle patterns, `__dlodNavAudit()` mismatch=0
afterward — structurally correct, not just crash-silenced. **Shipped: bim-ootb PR #1259, MERGED
2026-08-08T05:03:01Z.**

**2. `§BVH_DEFERRED` 41-54s stall — ✅ FIXED (root cause was NOT a new dlod_nav/streaming bug).**
User flagged mid-session: "i strongly suspect the just concluded night lighting work is the
culprit though denied by that session." That suspicion was right. The night session's own
`§NIGHT_STILL_BOOST_GATE_FIX` (commit `0316db7`, PR bim-ootb#1255) — nav mode silently running
the still-capture branch's ~200-light cap instead of the intended 30-light nav budget — had been
written, tested, and pushed, but **left unmerged** ("denied" = not prioritized as the stall's
cause, not actually ruled out). A controlled real-GPU A/B (RTX 4060, LTU_AHouse, `db=` URL
load + `toggleNightMode()` + `toggleDlodNav()`/orbit-drag interaction during the stream+BVH
window) isolated it cleanly:
| variant | §BVH_DEFERRED |
|---|---|
| buggy (~200 lights, confirmed `nightLights=153` in the witness log) + BUSY interaction | **did not complete within 90s** (worse than the field's 41-54s) |
| buggy (~200 lights) + IDLE (no interaction) | 8.8s |
| fixed (30 lights) + BUSY interaction | 9.8s |

Light count alone (idle) is cheap; interaction alone (fixed-light busy run, and separately the
original §27 clean/busy runs before the light bug was isolated) is cheap. Only the COMBINATION —
the still-unmerged bug's ~200-light rebuild firing on every `_nightControlsListener`
camera-movement event, competing with the BVH's cooperative `setTimeout(_bvhBatch, 0)` chain on
the same main thread — produces the catastrophic stall. This also explains §27's own earlier
"not correlated with night-mode on/off" finding: that test toggled Night on/off but never paired
it with sustained interaction DURING the stream/BVH window, so it never hit the specific
combination that triggers the starvation.
**Fix: merge the existing PR, no new code needed.** Synced bim-ootb PR #1255 with current main
(conflicts: `sw.js` CACHE_VERSION bump, `viewer.html` cache-buster — both mechanical, `.md`-safe
per this repo's own sw.js conflict-magnet doctrine), CI green, **MERGED
(`00d1925`, 2026-08-08T04:56:04Z)**.

**Closeout:** both §27 items are ✅ DONE — PR #1255 and PR #1259 both MERGED to bim-ootb main.
No further "affects everything else" investigation needed unless a NEW report surfaces after both
land; if it does, re-open with a fresh witness rather than assuming these two mechanisms recur.

---

## §17.17 — the §17.16 mechanism was never actually engaged: FBO-binding bug, occluder self-test, and coplanar bias (2026-08-12, SPEC then BUILD)

**Premise correction to §17.16's own root-cause claim.** §17.16 closed by attributing its 12.33%
false-hide residual to "LTU_AHouse's extracted wall meshes have no boolean door/window cutouts,"
citing as evidence that swapping box proxies for real occluder geometry produced BYTE-IDENTICAL
results. A follow-on probe (2026-08-12) falsified both halves. (a) Direct measurement — mapping each
door/window's world centre into its host wall's local frame and rasterizing wall-thickness occupancy
— found LTU's 1539 openings have a mean aperture blockage of 0.0035 and **0.0% genuinely solid**:
the booleans ARE baked into the extracted meshes, whatever `IfcRelVoidsElement` extraction did or
did not record. (b) The byte-identical result is explained by a mechanism bug, not by geometry
equivalence: **neither variant was ever sampled.** A live FBO probe on real hardware measured
`beginQueries=256 / boundToDefaultFramebuffer=256 / matchedOccluderPrepassFbo=0` — every single GPU
occlusion query depth-tested the DEFAULT canvas framebuffer, which DLOD contaminates with its own
box-proxy depth writes. The dedicated occluder-only depth target was written every issue cycle and
read never. This is exactly the depth-contamination class §17.16 was built to eliminate; it simply
never engaged, so §17.16's architecture has in fact never been measured at all.

### 17.17.1 The binding fix (`W-OCC3-BIND`)
`_occStructPrepass` (`viewer/dlod_nav.js`) restores `setRenderTarget(prevTarget)` before returning,
handing the display framebuffer back BEFORE `_occStructIssueQueries` issues its raw-GL queries.
§17.13's working `_occlDepthPrepass` deliberately does the opposite — it returns with the depth RT
still bound and documents that the caller restores it. `_occStructIssueQueries` already calls
`setRenderTarget(prevTarget)` at the end of its batch, so the early restore is pure bug, not a
paired teardown. **Fix: delete the early restore, keep returning `prevTarget`.** One line. Witness =
the FBO probe's own counters inverted (`matchedOccluderPrepassFbo` = every query) plus settle
behaviour: an A/B on Hospital already showed timeout→stable and a 5x cut in query volume from this
line alone. This fix is a PREREQUISITE for every number below — all prior §17.12-17.16 correctness
figures were measured against a contaminated buffer and are not comparable.

### 17.17.2 Occluder self-exclusion (`W-OCC3-SELF`)
**Issue it proves or disproves:** are elements being hidden by their own depth contribution? The
occluder set is `IfcWall/IfcWallStandardCase/IfcSlab/IfcRoof`; the query SUBJECT population is the
UNCHANGED §9/§19/§13/§16 active set, which CONTAINS those same walls and slabs. A wall renders into
the occluder depth target, then its own world AABB is drawn as a query proxy under LEQUAL against
that same depth — a test the element can only marginally pass and which precision alone can flip.
The post-fix Hospital hide-set was directly observed to contain its own occluders, with `IfcWall`
among the false-hidden classes. **Fix: a guid that is a member of the occluder set is never a valid
query subject.** Filter at candidate-accumulation time in `_evalChunk` (so `occlStructCandidates`
and query volume both reflect it) AND hard-guard in `_occStructIssueQueries` (correctness does not
depend on the candidate list being fresh); purge any occluder guid from `_occ2Hidden` when the
occluder scene is built, so a live lever flip cannot strand stale hidden state. Direction of error
is conservative: an occluder is simply never demoted by this criterion, which is what §17.16's own
"occluders are static, never DLOD-mutated" principle already implies.

### 17.17.3 Coplanar/thin-subject depth bias (`W-OCC3-BIAS`)
**Issue it proves or disproves:** is the residual false-hide a depth-coincidence artifact rather
than real over-occlusion? The false-hidden classes measured post-binding-fix are `IfcCovering`,
`IfcFireSuppressionTerminal`, `IfcMember`, `IfcPlate` — thin elements sitting flush with, or
recessed inside, exactly the structural surfaces that make up the occluder set. Their AABB's
camera-facing face is at or behind the host wall/slab surface already in the depth buffer, so
LEQUAL rejects every fragment and `ANY_SAMPLES_PASSED_CONSERVATIVE` returns 0 for a genuinely
visible element. **Fix: inflate the queried AABB by a bias in world units before issuing** — a
depth bias expressed in metres rather than in `polygonOffset` units, so the number is interpretable
and does not vary with depth-buffer precision. Two levers, because a paper-thin plate embedded in a
200 mm wall needs to clear the whole host thickness while a normal-sized subject needs only to clear
coincidence: `occlStructBiasM` (all subjects) and `occlStructThinBiasM` (subjects whose smallest
AABB extent is under `occlStructThinM`). **Values are NOT asserted here — they are swept and
measured.** Inflation is strictly the conservative direction (a bigger proxy can only turn hidden
into visible, never the reverse), so the cost of an over-large bias is missed true-occlusion, i.e.
lost perf, never a wrongly-vanished element.

### 17.17.4 LTU_AHouse unblock — single-building fallback (`W-OCC3-LTU`)
Scoped strictly to let the target building stream for this measurement; NOT a schema migration.
`CPE_4D_PERF_MEM_FINDINGS.md §R6` measured the blocker: the 2026-08-10 re-extracted
`LTU_AHouse_meta.db` has no `building` column, so the centres bootstrap logs `§HELPERS_QUERY_ERR
no such column: m.building` → `§CENTRES_RESULT rows=0` → `startStreaming()` finds no building and
returns silently; geo loads, zero meshes ever stream. R6 named two options — re-extract, or a
code-side single-building fallback. **Take the fallback** (re-extraction is a bigger, riskier,
out-of-scope job, and this repo bans committing DB binaries outright regardless). Probe the column
once via `PRAGMA table_info(elements_meta)`; when absent, treat the DB as containing exactly ONE
building, derive its label from the DB URL basename (an EXTRACTION from a real source, not an
invented name), and drop the `m.building = ?` predicate from the bootstrap + stream + recolour
queries on that path only. DBs that carry the column are untouched and take the identical code path
they take today — that equivalence is the witness.

### 17.17.5 Gates
- `occlStructEnabled` / `occlBvhEnabled` defaults stay **FALSE** throughout. Nothing here is a
  default-behaviour change; this is lever-gated, additive work.
- `W-OCC3-EQUIV` is non-negotiable and comes FIRST: lever off ⇒ counters all zero and the partition
  identical to shipped. A correctness number measured without it is not evidence.
- Correctness is measured on **LTU_AHouse specifically** — Hospital-only results do not close this
  out, LTU is the building the whole §17 investigation has been about.
- PERF (frame-time cost of leaving the lever on) has NEVER been measured in §17's history because
  correctness never cleared its bar first. Measure it anyway this time and report it as
  informative-only; it is not a ship gate while false-hide is non-zero, same discipline §17.13/
  §17.14 used.
- This session REPORTS numbers. It does not flip a default. That decision is the user's.

### 17.17.6 RESULT — measured 2026-08-12, real RTX 4060, real LTU_AHouse (122,330 elements)
Branch `bim-ootb fix/occl-struct-fbo-selfexclude-bias` @ `7818c27` (pushed, no PR — arming is the
user's call). `witness/` is gitignored, so the numbers live here and in the commit message.
Four deterministic poses derived from the building's own element-centre cloud and persisted
(`witness/w_occ3_poses_ltu.json`) — §17.16's original 4 poses were never committed and are
unrecoverable, so NOTHING here is comparable to its "12.33%".

**W-OCC3-LTU: PASS.** §R6's blocker reproduced exactly and cleared:
`§SINGLE_BLD_FALLBACK reason=no-building-column` → `§CENTRES_RESULT rows=1 bldCol=false` →
122,330 elements streamed, `resident=122330` — R6's own measured streamable count, on the nose.

**W-OCC3-EQUIV: PASS.** Lever off at all 4 poses ⇒ `mismatch=0`, every occlStruct counter zero.

**W-OCC3-CORRECT** — falseHide / gtClear:
| pose | gtClear | bind (§17.17.1) | + self (§17.17.2) | + bias (§17.17.3) |
|---|---|---|---|---|
| 0 | 107 | 36 (33.64%) | 35 (32.71%) | **10 (9.35%)** |
| 1 | 17 | 3 (17.65%) | 0 (0.00%) | **0 (0.00%)** |
| 2 | 117 | 66 (56.41%) | 44 (37.61%) | **0 (0.00%)** |
| 3 | 1 | 0 (0.00%) | 0 (0.00%) | **0 (0.00%)** |

mean-of-poses **26.92% → 17.58% → 2.34%**; pooled 105/242 → 79/242 → **10/242 (43.39% → 4.13%)**.
Settle = `stable` at every pose for every variant, never `timeout`. Query volume at pose 0:
94,784 → 53,248 → 48,576 issued (~49% cut). The bias removed `IfcCovering` entirely (8 → 0) —
exactly the thin architectural class §17.17.3 predicted — leaving a residual that is MEP, not
architecture: `IfcFlowSegment`×8, `IfcFlowFitting`×1, `IfcBeam`×1.

**The residual is mostly a METRIC artifact, not a mechanism error — and the distinction is a real
design question, not a rounding call.** Re-classifying pose 0's 10 survivors with the STATIC
occluder set added to the ground truth's occluder list (`w_occ3_fhdiag.js`, falseHide=10/107
reproduced exactly): **8 flip to `occluded`, 2 stay `clear`** (both `IfcFlowSegment`).
The metric's ground truth uses "everything currently VISIBLE in the display scene" as its occluder
population; this mechanism's entire premise is a static occluder set deliberately NOT subject to
DLOD state, so the depth buffer contains walls/slabs the display scene has demoted. An element
correctly hidden behind such a wall scores as a false hide purely from that mismatch.
⚠ Do NOT quietly bank the 8 as "correct". In nav mode a demoted wall is drawn as a WIREFRAME BOX,
so it does not visually occlude — whether it SHOULD occlude is exactly the question §17.16's static
premise answers "yes" by construction and the §17.14 metric (kept unchanged here for comparability)
answers "no". Both numbers are therefore reported and neither is chosen here:
**10/242 = 4.13% by the unchanged metric, 2/242 = 0.83% after accounting for the population
mismatch** (pose-0 mean-of-poses 2.34% and 0.47% respectively).

**W-OCC3-PERF: INCONCLUSIVE — reported as such, not forced to a number.** Interleaved off/on/off/on
× 300 frames at pose 0: median 44.6 / 46.7 / 27.1 / 43.1 ms. The two OFF legs differ from each other
by 17.5 ms, which EXCEEDS the on-vs-off difference, so this run supports no frame-cost claim in
either direction. This is §17's first PERF attempt at all (every prior section gated PERF behind a
correctness pass that never arrived); it needs its own run on an idle machine, not a tail-end leg of
a correctness witness. One incidental real number worth keeping: with the lever settled at pose 0
the display's active population falls from ~31,700 to 1,587 (~95% fewer real elements) — the size of
the prize, still unpriced.

**Open, named, NOT done here:** (a) the 2 genuine `IfcFlowSegment` false-hides — long thin pipes
whose smallest AABB extent clears the 0.12 m "thin" threshold, so they take the 0.05 m bias, not the
0.25 m one; a bias SWEEP (`PROBE_SWEEP=0,0.05,0.15,0.25,0.5 node witness/w_occ3_correct.js`, already
wired) is the next measurement, not a guess at a new constant. (b) the demoted-wall-occludes
question above — a decision, not a measurement. (c) a real PERF run. (d) `occlStructEnabled` stays
default **FALSE**; arming it is the user's call on these numbers.
