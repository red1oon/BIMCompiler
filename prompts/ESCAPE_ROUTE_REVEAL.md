<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ESCAPE ROUTE REVEAL — animate the real worst-case escape path during the closing orbit

```
# ⚠ DO NOT REMOVE — SCOPE
BUILT 2026-09-20 on bim-ootb `feat/escape-route-reveal` — §7 records every hook point this doc left
open, §8 records a finding that CONTRADICTS §3 below, §9 records what is still not built. §0-§6 are
kept as written (the spec as agreed with red1), NOT retro-edited to match the code. Where §3 and §8
disagree, §8 is what shipped and says why. Every visual choice below reuses an existing,
already-proven technique from this codebase — this doc's own job is to name exactly which one, not
to invent new render/animation mechanics. Read `bim-ootb
common/room_graph.js`'s own header before touching escapeRoute()/escapeRouteViaProtectedStair() —
same caution `prompts/Viewer/FindRooms/ROOM_GRAPH_REAL_AABB.md` already gives, this doc only READS
that function's output, never changes it.
CONCEPT DOC: `prompts/Viewer/FindRooms/ROOM_GRAPH_REAL_AABB.md` (the door-position fix that makes
this animation's path more accurate) and `prompts/EGRESS_HARDENING.md` (the protected-exit-stair
fix + occupant-load rule this reuses `escapeRoute` alongside).
```

## §0 — What this is

During the closing orbit (the last beat of an Alt+C bake, after storey-highlight), when the
"Escape Route" toggle is ON: the single worst-case room (the one already behind `rule_checklist.js`
`_rcLongestExitSteps()`'s headline "Longest path to exit" number) shines through, an orange dotted
line traces its REAL computed escape route to the exit, and a titled info panel counts up the
distance in two independently-derived units (steps, and real walking time) as the line draws. The
camera eases (slows its angular motion) for this window so the reveal has room to read; nothing else
about the film's own clock slows — the day counter, the sun position, everything driven by `tNorm`
proceeds exactly as it would without this toggle on.

## §1 — Why this is cheap: it's an existing-technique inventory, not new mechanics

Every piece below already has a working precedent in this codebase. This doc's job is naming which:

| Piece | Reused from | Not reinvented |
|---|---|---|
| The real path itself | `common/room_graph.js` `escapeRoute()`/`escapeRouteViaProtectedStair()` (§EGRESS_HARDENING) | No new pathfinding |
| Which room to show | `rule_checklist.js` `_rcLongestExitSteps()`'s own worst-case selection | No new room-picking logic |
| Room shine-through | The discipline-reveal / storey-reveal "ground shine-thru, facade-only tint" technique already shipped for ARC/STR-hide-to-show-MEP | No new render pass |
| Labelled leader lines ("Start"/"Exit") | The Measure feature's own numbered-bubble/leader-line dimension convention | No new annotation system |
| Info panel chrome | Whichever existing HUD panel component the freeze/load-path beats already use for their own info card — **confirm the exact component at implementation time**, this doc does not assert a file:line for it | No new panel design |
| "Prove the number as it animates" | The load-path ledger's own cumulative counter-while-drawing pattern (§129.x) | No new counter idiom |
| Single Alt+C panel toggle, icon-button | The compass/egress/clash/etc. one-entry-per-feature convention (`cinema_path_editor.js`) already established this week | No new toggle idiom |

## §2 — Scene choreography, exactly as worked out with red1

1. **Trigger:** its own toggle, gated OFF by default, same icon-button convention as the other 7
   Alt+C panel entries (compass, buildup, room-title, reveal, clash, measure, storey-highlight).
2. **Timing:** plays within the closing orbit (`plan.beats` — the closing orbit is a real, already-
   named beat in `cinema_maxq.js`, confirmed via `plan.beats.rise` marking its start and an existing
   duration calc at `cinema_maxq.js:1669`), after the storey-highlight beat ends.
3. **Camera:** eases its angular orbit speed for this window. **This is a NEW, additive parameter —
   do not reuse `tNorm`/`_tnFilm` or the §129.1 freeze/hold flag for it.** Those drive the day
   counter, the sun compass, and every other time-based system in the film; slowing them would slow
   everything else too, which red1 explicitly ruled out ("the clock does not slow of course"). This
   needs its own local easing curve applied only to the orbit's angular-position interpolation.
4. **Room reveal:** the worst-case room shines through (existing discipline-reveal technique).
5. **The path:** an orange dotted line, tracing the REAL `escapeRoute()`/`escapeRouteViaProtectedStair()`
   path from that room to its real exit — not a straight line, the actual computed route (through
   doors, corridors, stairs as applicable).
6. **Labels, with leader lines (Measure's own convention):**
   - **"Start"** — fixed, at the room.
   - **"Exit"** — fixed, at the exit.
   - **A live counter** — NOT a static number. Counts up in sync with the dotted line's progressive
     draw, from 0 to the real total, in TWO units simultaneously (see §3).
7. **Other overlay signage:** hidden for this window (compass readout, other HUD panels) — but via
   its OWN hide flag, not the §129.1 freeze flag (that flag also stops `tNorm`, which item 3 above
   rules out). A new, beat-scoped "other overlays suppressed" gate, same shape as `_drawUnlessHold`
   already uses for the freeze case, just a different trigger condition.
8. **Info panel:** titled **"Escape Route"** (red1: "unambiguous" — deliberately not reusing the
   Sanity/Egress WARNING-orange association by leaving the title in no doubt about intent), showing:
   - the live steps count (see §3),
   - the live min:sec count (see §3),
   - **the assumed walking speed itself** (red1's own addition — disclosure, not just the derived
     numbers), labelled clearly as an assumption, matching this project's own citation discipline.
9. **No freeze.** Distinct from §129.1 — confirmed, not reused. The panel's VISUAL STYLE may still
   match the freeze beat's own info-card chrome (§1's table), but the underlying hold/pause mechanism
   is not invoked.

## §3 — The two numbers, and why they're NOT equally rigorous (disclose both honestly)

Both derive from the SAME real distance — `escapeRoute()`'s own `distance` field, already the exact
value `_rcLongestExitSteps()` reads today. Two different unit conversions, two different evidence
tiers:

- **Steps** — `distance / 0.75m`. **Uncited.** `rule_checklist.js`'s own comment already admits this:
  "a standard adult-stride ergonomic convention from OUTSIDE this project (no stride-length constant
  exists anywhere in this codebase to extract)." Keep the existing `~` disclosure convention on this
  number in the panel — it was already honest before this feature, stay honest now.
- **Min:sec** — `distance / 1.19 m/s`. **Cited, real standard**: SFPE's default unimpeded horizontal
  walking speed, 1.19 m/s (verified via WebSearch 2026-09-20 — NIST's own bounding-defaults paper on
  egress models cites this SFPE figure; see Sources below). This is the MORE rigorously grounded of
  the two numbers, and the panel should show the speed value itself (§2 item 8) so a viewer can see
  which standard produced it — the point of showing the assumption, not just the derived time.
- **Do not silently present them as equally solid.** One is a real cited standard, one is an admitted
  placeholder from outside this project. The panel showing the walking-speed number itself is what
  keeps this honest without needing two different visual treatments.

**Sources (for the record, not to be re-derived):**
- SFPE default unimpeded walking speed 1.19 m/s — NIST, "Bounding Defaults in Egress Models"
  (tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913547).
- Cross-reference / context on how SFPE's figure compares to NFPA 130 and simulation defaults —
  Thunderhead Engineering, "Comparing NFPA 130, SFPE, and Pathfinder"
  (thunderheadeng.com/docs/2026-1/pathfinder/examples/applications/comparing-nfpa-130/).

## §4 — Where this touches the codebase (confirm exact line refs at implementation time)

- `common/room_graph.js` — **read-only for this feature.** `escapeRoute()`/
  `escapeRouteViaProtectedStair()` already return everything needed (`path`, `doors`, `distance`,
  `exitGuid`). No change needed here.
- `rule_checklist.js` — read-only too: reuse whichever room `_rcLongestExitSteps()` already
  identifies as the worst case, don't re-derive room selection.
- `cinema_maxq.js` — new per-frame beat logic: the closing-orbit-window gate, the new camera-ease
  parameter (§2 item 3 — must NOT touch `tNorm`/`_tnFilm`), the dotted-line draw-progress state, the
  two live counters, the new "other overlays suppressed" flag (§2 item 7 — sibling to but distinct
  from the freeze flag).
- `cinema_path_editor.js` — new Alt+C panel toggle, icon-button style matching the other 7.
- Whichever module owns the discipline-reveal shine-through and the Measure leader-line/label
  drawing — **not identified precisely in this pass**; grep for the existing techniques named in
  §1's table before writing any new drawing code.
- Info-panel component — **not identified precisely in this pass**; confirm which existing HUD panel
  (freeze beat's own card, or `cpe_film_boxes.js`'s §HUD_BOX/§STATUS_BOX family) is the right one to
  reuse for chrome before building a new one.

## §5 — Witness requirements (same discipline as every other feature in this lane)

- Assert the rendered dotted line's progressive length at frame N matches
  `(N / totalRevealFrames) × escapeRoute().distance`, not a visual "looks about right" check.
- Assert both counters (steps, min:sec) match `distance/0.75` and `distance/1.19` at every sampled
  frame of the reveal, in sync with the line's own progress — not just at the final frame.
- Assert the "other overlays suppressed" flag is true only during this beat's window and restores
  correctly after — same class of check §129.1's own freeze flag already has.
- Assert `tNorm`/the day counter/the sun compass's output are BYTE-IDENTICAL with the toggle on vs.
  off, at matching wall-clock-equivalent frames — proving the camera-ease genuinely doesn't touch
  film time, not just asserting it by code review.
- No screenshot/frame comparison as evidence for any of the above — this project's own FUNDAMENTAL
  LAW (bim-compiler CLAUDE.md).

## §6 — Task list, dependency order

1. Confirm exact hook points for the two "not identified precisely" items in §4 (shine-through
   module, info-panel component) before writing any code.
2. Wire the camera-ease parameter, verified NOT to touch `tNorm` (witness first, per §5).
3. Wire the "other overlays suppressed" flag, sibling to but independent from the freeze flag.
4. Render the dotted line + Start/Exit leader labels, sourced from a real `escapeRoute()` call on
   the room `_rcLongestExitSteps()` already picks.
5. Wire the two live counters + the walking-speed disclosure line in the "Escape Route" panel.
6. Add the Alt+C panel toggle (icon-button, matching the existing 7).
7. Witness pass per §5, all items.
8. Bake and review — first real visual check, only after the numeric witnesses above already pass.

## §7 — BUILT (2026-09-20, bim-ootb `feat/escape-route-reveal`)

Every hook point §4/§6.1 left open is now confirmed against real code on bim-ootb `origin/main`
(104ee009), not asserted. New file `viewer/cpe_escape_route.js` (~500 lines) owns the feature; the
edits elsewhere are wiring only.

| §4 item | CONFIRMED as |
|---|---|
| the path | `common/room_graph.js` `escapeRoute()` — READ-ONLY, untouched |
| the drawn line's geometry | `shortestPath(room, escapeRoute().exitGuid).polyline` (§RASTER-ASTAR, floor-hugging). `escapeRoute()` returns no polyline — checked. The two distances are asserted equal before the polyline is used, and a disagreement falls back to the route's own anchors |
| which room | argmax of `escapeRoute().distance` over `graph.nodes` — the INVERSE of `_rcLongestExitSteps`, not a second selection rule. A threshold filter cannot remove a maximum, so `max over rows == max over all rooms` whenever a row exists. W-ESC-1 asserts the identity against the real evaluator (Hospital: both 253.013209, both ~337 steps) |
| shine-through | `cpe_storey_reveal.js:249`'s scoped-x-ray pattern (`A.toggleXray` + `_xrayByUs`), applied to the room's `A.allRoomVolumes()` box rather than to storey meshes — a ROOM has no per-mesh membership in this schema |
| leader lines + labels | `clash_labels.js`'s plate/leader/halo language, same colours and metrics |
| info panel chrome | `cpe_resource_panel.js` `bigStatsCompositeOntoCanvas`, through the existing `{card,idx,n,opacity}` shape — no new panel drawing exists |
| "other overlays suppressed" | `cinema_maxq.js` `_hudGate()`, a sibling of `_hudHold` with its own trigger `A._escRouteHudSuppress`. The spec guessed the name `_drawUnlessHold`; that is the loadpath lane's, reached through `_hudHold`, and is NOT used |
| the toggle | `cinema_path_editor.js`'s TOGGLES table, one row `cpe-escape-route`, icon `I.route` (already this UI's route icon, panels.js Pick Walk) |
| the camera ease | see below |

**The camera ease, §2 item 3.** `poseAt(tNorm)` was split into `poseAtFilm(tFilm)` plus
`poseAt(tn) = poseAtFilm(_tFilm(tn))` — no path changed. The bake loop hands `poseAtFilm` an EASED
film fraction; `_tnFilm` itself is assigned once per frame and never rewritten, so the day counter,
the sun arc, the sun compass and the buildup cursor all still read the real one. The warp is

    warp(w) = w + (A/16π)·(2·sin2πw − sin4πw),  A = 1.2, identity outside the window

with `warp(0)=0`, `warp(1)=1`, `warp'(0)=warp'(1)=1` and `warp' = 1 + (A/4)(cos2πw − cos4πw)` —
0.40× at mid-reveal, 1.34× peak, monotone. **A first cut used 16π's place for 8π; the real
derivative was then `1 + (A/2)(…)`, minimum −0.2, and the camera ran backwards mid-reveal.** It is
invisible in a picture and W-ESC-4c is what caught it.

**Window.** `[rise + 0.15·L, rise + 0.70·L]` where `L = 1 − beats.rise` — inside the closing orbit,
strictly after the storey reveal (which ends AT `beats.rise`), leaving the orbit's last 30% to the
§MEASURE_BUILDING_CARD roll. On Hospital: 4.0 s in, 8.9 s long, 4.9 s of tail.

**Witness** — `bim-ootb/witness_escape_route_reveal.js`, 36 checks, all passing on real
`Hospital_meta.db`, no pixel-derived evidence anywhere (W-ESC-7 asserts that about its own bytes).
`viewer/tests/witness_sun_compass_wiring.js` gained `escapeRoute` as a subject: 79 checks, all pass.

## §8 — FINDINGS: `escapeRoute().distance` IS NOT A DISTANCE

**This contradicts §3's premise and changes what the film prints. Found while building, measured,
not guessed.**

`escapeRoute().distance` is a penalty-weighted Dijkstra **cost**. `common/room_graph.js`'s own
§UTILITY-ROUTING-PENALTY multiplies any edge touching a utility-tagged room by
`UTILITY_EDGE_PENALTY = 8` so the search prefers corridors — correct as a routing preference, but it
leaves the returned figure in cost units, not metres.

Measured 2026-09-20 on real DBs:

| DB | rooms | utility nodes | worst-case cost vs its drawn route | median ratio | inflated >5% |
|---|---|---|---|---|---|
| `Hospital_meta.db` | 156 | 23 | **253.0 vs 48.8 m — ratio 5.19** | 0.50 | 19 / 149 |
| `Terminal_meta.db` | 43 | 0 | 96.2 vs 106.1 m — ratio 0.91 | 0.89 | 3 / 40 |

A median of 0.50 on Hospital means that for most rooms the cost is *half* the drawn walk (the
A*-refined floor-hugging polyline is longer than the straight-chord edge weights it was summed
from). So the figure is wrong in both directions, not merely conservative.

**What the film does.** The two counters read the **drawn route's own measured 3D length**
(`walkM`) — the thing the picture actually shows. Hospital's worst room reads ~65 steps / 0:41 over
48.8 m, not the ~337 steps / 3:33 the cost would give. The card also prints the metres, so neither
derived number stands alone. Every build logs
`§ESCAPE_ROUTE_COST_IS_NOT_A_DISTANCE … graphCost=… vs drawnWalk=… ratio=…`, on every building,
whether or not it looks bad. W-ESC-1e/1f assert the split.

**What the film does NOT do.** Which room is still chosen by the **cost**, deliberately, so the
reveal stays pointed at the room the Egress panel's headline is about.

**NOT FIXED — needs red1's call.** `viewer/rule_checklist.js` `_rcLongestExitSteps()` and
`viewer/egress_sanity.js`'s `circulation_distance` rows both divide that same cost by 0.75 m and
present the result as a travel distance. On Hospital that makes the shipped headline
"Longest path to exit — ~337 steps" a penalty-inflated number for a 48.8 m walk. This predates the
feature and changing a figure the Egress report already shows is not this lane's decision. The
options, for the record: (a) have `escapeRoute()` return raw metres alongside the cost and have the
rule read that; (b) leave the rule and relabel its headline as a routing cost; (c) leave both and
document. Not chosen here.

## §9 — ALSO NOT BUILT, stated rather than left to be discovered

- **The preview shows the room glow only** — not the dotted line, not the card, not the camera ease.
  The line and the card are composited onto the CAPTURE canvas (`_captureFrame`), which the preview
  has no equivalent of; the clash labels and the day counter have never appeared in a preview
  either. The ease is deliberately kept out of `_applyCameraPose` because that function also serves
  the SCRUB drag, where a pose not matching the playhead under the user's finger would be a bug.
- **No room glow where `A.allRoomVolumes()` excludes the room** (non-habitable by
  `RoomHabitability.spaceHabitable`). The line and both labels still draw; the build log says
  `roomBoxes=0` and why.

## §10 — X-RAY IS NOT WORTH IT, MEASURED AND RULED (2026-09-20)

**red1's ruling, verbatim:** *"x-ray even be bad to judge 3D space from experience. So i go for no
x-ray since it save time, and the info is already clear and intuitive enough — user would get the
idea right away."* Then, after watching the A/B clips: *"u can see x-ray has no effect."*

**The measurement.** Two 88-frame 854x480 bakes back to back, same box, same clip, same DB, only
the x-ray differing (via a temporary `window.__escNoXray` dev tap, since removed):

| | wall | per frame |
|---|---|---|
| with x-ray | 334 s | 4.24 s |
| without | 146 s | **1.40 s** |

**2.3x the wall clock, 3.0x per frame — essentially the entire cost of the reveal window.**

⚠ These figures were taken WITHOUT the loadpath lane's §129.57 frame-reuse (which cuts ~22.9 min
off a Hospital 1080p bake by reusing 199 of 265 byte-identical freeze frames at ~6,892 ms each —
red1-1c, 2026-09-20). They are therefore an UPPER BOUND on the x-ray's share of a bake once that
lands. The x-ray's own per-frame multiplier is unaffected: it was measured as a paired A/B on the
same frames.

**Why it was buying nothing.** `tools.js` `A.toggleXray()` sets `opacity 0.3, transparent, DoubleSide`
on every cached material. 0.3 is **per surface**, not through a building: the eye receives `0.7^n`
of the interior after n surfaces, and `DoubleSide` makes every wall two of them.

| surfaces | 3 | 5 | 8 | 10 | 15 |
|---|---|---|---|---|---|
| interior reaching the eye | 34% | 17% | 6% | **3%** | 0.5% |

Through a hospital that is milk, not glass — which is exactly what red1 read off the first bake
("the whole building looks very solid"). A strength parameter was briefly added to `A.toggleXray`
so the beat could push to 0.12/FrontSide; red1's ruling landed first and it was reverted. **Alt+Z
is byte-identical to shipped.**

**Nothing is lost.** The route line is composited in 2D onto the capture canvas and the room glow
is `depthTest:false`, so both read through the building on their own. The x-ray only ever added
interior CONTEXT around them. The beat now touches no scene material at all.

Landed on bim-ootb `feat/escape-route-reveal` @ `0f191c15`. W-ESC-11a-e assert: no `toggleXray`
call, no material-cache access, Alt+Z unchanged, the glow still shines through, and
`cpe_storey_reveal.js` keeps its own — the ruling was NOT applied to another lane.

### §10.1 — the storey reveal's x-ray: ALREADY GONE ON THE LIVE BRANCH

**CORRECTED 2026-09-20, same day, by red1.** The first version of this section said the fix was to
merge `feat/storey-section-cut`. That is WRONG and is left here as a correction rather than quietly
rewritten: **that branch is RETIRED** (red1's word). Do not merge it, do not chase its 69 unpushed
commits.

The live branch is **`feat/loadpath-ledger`** (`c131bd4f`, 101 ahead of `origin/main`). Verified
read-only, 2026-09-20: its `cpe_storey_reveal.js` contains **zero `A.toggleXray()` calls** and still
carries `storeyRevealStatCardAt`. So on the branch that matters, the x-ray is already gone AND the
per-storey info panel is real — red1: *"The storey reveal info panel do give fresh level by level
info."*

What remains true is only the measurement of the OLD beat as it still stands on `origin/main`,
which is what every bake off main still gets: `_enterWindow()` calls `A.toggleXray()` with no
arguments for the whole 5 s window, tinting 6,601-10,769 meshes per storey, at **4.13 s/frame**
against **1.57 s/frame** for the un-x-rayed orbit in the same 1080p bake — 2.6x, independently
matching the 3.0x from the dedicated A/B. That cost disappears when `origin/main` catches up with
`feat/loadpath-ledger`.

**The open design question, red1's steer to the loadpath session (2026-09-20):** *"consider the
older storey reveal tinting."* Worth stating why it is not just nostalgia. The old tint beat's
payload was never the glow — it was the per-storey card; the glow was a pointer. Its real defect was
needing an x-ray to see the tint THROUGH the building, and that is now measured as useless. **A
SOLID tint with no x-ray has never been tried.** A storey's own facade is on the building's exterior
and reads directly from an orbit, so the tint may carry perfectly well at a third of the cost. That
is the cheap experiment, not a rewrite. NOT BUILT, NOT THIS LANE'S — recorded for whoever picks it up.

## §11 — PROPOSED, NOT BUILT: the `o` box-proxy look instead of a wash

red1, seeing the Find-panel Path view as wireframe boxes: *"I wonder if converting to bboxes or full
DLOD frame (which looks cool)"*, and *"at end, it restores back which can be cool too if apply the
gradual restore as experienced when user comes close effect. This also showcase our DLOD feature."*

**Name the right module.** Three things are called DLOD and only one is the look:
- `viewer/dlod.js` — per-slot/instance **frustum culling**. Invisible by construction; it only
  removes what is already outside the view cone. Nothing to showcase.
- `viewer/dlod_nav.js` — **this is the `o` shortcut** (`panels.js:1486`, `{ id: 'dlodnav', key: 'o' }`,
  comment "key 'o' (bOx; 'b' is Background)"). Its own drawer text: "Boxes far/off-screen elements
  while you fly/orbit · Real mesh within 50 m + in view · **Off during Time Machine, Find isolate,
  Cinema**".
- the Alt+X merged bbox ghost (`navigate_find.js` `toggleMergedGhost`) — the same look, a different
  owner.

**The gradual restore already exists and is already tuned.** `dlod_nav.js:64,67`:
`PROMOTE_DIST = 38 m`, `DEMOTE_DIST = 60 m`, `FADE_FRAMES = 10` — "§8 FINDINGS #4: N=10 sufficed;
5 and 20 both worse". A 10-frame overlay-hoist cross-fade, measured, shipped.

**Why no bake has ever shown it:** `dlod_nav.js:400` returns `'cinema'` on `_maxqActive` and fully
disengages. Letting it run in a bake is the whole change.

**The one thing that does NOT transfer for free.** The closing orbit flies at **radius 102 m**
(measured, this bake's own `§MAXQ_START`), well past `DEMOTE_DIST = 60`, so the entire building
would stay boxed for the whole beat — which IS the look red1 wants. But "restore as you come close"
never fires, because a closing orbit pulls AWAY. The fade back to solid would have to be driven by
the beat's own clock, not by camera distance: the same `FADE_FRAMES = 10` envelope, a different
trigger. That is the only new mechanism this needs.

**Open question for whoever picks it up:** the Cinema exclusion is deliberate (FLY_TOUR_DLOD_SCALE
§3) and the reason is not recorded in `dlod_nav.js` itself. Find it before overriding it — a bake
rendering box proxies instead of real geometry may be exactly what that gate exists to prevent.

## §12 — SPEC: THE TWO RULES THE FIRE DEPARTMENT ACTUALLY ASKS ABOUT (not built)

red1, 2026-09-20: *"spec the common path and remoteness rules."* Both verified by WebSearch the
same day; sources at the foot of this section.

**The uncomfortable framing this section exists to fix.** `viewer/rates/egress_rules.json` carries
five rules — `door_clear_width`, `circulation_distance`, `isolated_room`, plus §EGRESS_HARDENING's
space-coverage and door-occupant-load. Grepped 2026-09-20: **nothing on exit count, nothing on
common path, nothing on remoteness.** And what §0-§11 draws is the SINGLE SHORTEST route. Code
barely regulates the shortest route; it regulates that a **second, independent one exists, is
reachable soon enough, and is far enough away.** The built beat answers a question the fire
department does not ask, while the three it does ask are unimplemented. That is the gap.

### §12.1 — Rule: `common_path_of_egress_travel` (IBC 2021 §1006.2.1)

The distance from the most remote point in a space to the point where an occupant **first gains a
choice of two paths**. Two independent triggers in Table 1006.2.1 — occupant load, and this
distance; exceeding either requires two ways out.

    warning_m: (none — this is a hard limit, not a ramp)
    critical_m: 30.5   # 100 ft, SPRINKLERED (Group B/F/S)   CITED
    critical_m_unsprinklered: 22.9   # 75 ft                  CITED

**How it is computed on our graph, and why the graph is the right structure.** For the subject
room, route to EVERY exit node, not just the nearest (MEASURED: all 8 Hospital exits from one room
in **605 ms**, so this is affordable once per bake). Rank by the measured 3D polyline length. The
**divergence node** is the last node shared by the primary route and the best alternate. The
common path is the measured length from the room to that node.

⚠ **MEASURED FROM THE CENTROID, NOT THE MOST REMOTE POINT.** The code measures from the most remote
point in the space; our graph node is a room centroid. This UNDERSTATES the regulated quantity by
roughly half the room's own diagonal — it under-flags, the opposite bias to `circulation_distance`.
State it on the row; do not silently present a centroid measurement as the code quantity.

⚠ **A room whose routes never diverge has an INFINITE common path** — every exit is reached through
one corridor. That is a real and serious finding, and it is not the same as `isolated_room`. Report
it as its own severity, never as a large number.

### §12.2 — Rule: `exit_remoteness` (IBC 2021 §1007.1.1)

Where two exits are required they shall be placed **not less than one-half of the maximum overall
diagonal dimension** of the building or area served apart, measured in a straight line between
them; **one-third** where the building is sprinklered throughout per §903.3.1.1/§903.3.1.2. The
code's own stated purpose: *"assists in providing independent means of egress"* — one fire must not
be able to take both. This is red1's own "other routes may be blocked" instinct, written into code.

    ratio_unsprinklered: 0.50   # of the max overall diagonal   CITED
    ratio_sprinklered:   0.333  #                                CITED

**Nearly free to compute.** We already have every exit node's real position (8 on Hospital, all on
Level 1 — five `M_Single-Flush` at 1.12-1.14 m, two `M_Double-Flush` at 2.01 m, one
`Overhead Door at Dock` at 3.03 m). The diagonal comes from `element_transforms` per storey. It is
one subtraction and one comparison per exit pair, with no pathfinding at all. Measure to any point
along the doorway width per the section's own measurement clause; door centre is the available
approximation and must be labelled as such.

### §12.3 — SPRINKLERED IS NO LONGER AN ASSUMPTION, AND THIS MATTERS EVERYWHERE

Every threshold above forks on sprinklered/unsprinklered, and so does the SHIPPED
`circulation_distance` rule — its `critical_m: 60.96` is the **sprinklered** I-2 figure and
`egress_sanity.js`'s header already admits the occupancy is assumed. **We can now check the
sprinkler half.** MEASURED 2026-09-20 on real DBs:

| DB | `IfcFireSuppressionTerminal` | other FP |
|---|---|---|
| `Hospital_meta.db` | **1,354** | 6,228 pipe segments, 5,900 fittings, 861 controls, 8 valves |
| `Terminal_meta.db` | **909** | 80 `IfcAlarm` |

So `IfcFireSuppressionTerminal` is the extractable sprinkler head, with a real position. A rule that
currently ASSUMES sprinklered can state it as EVIDENCE — and, just as importantly, can say
"unsprinklered, so the stricter threshold applies" on a building that has none. **Occupancy class
is still unextractable** (`project_metadata` carries only building name and import date), so that
half of every citation stays an assumption. Say which half is which on every row.

## §13 — SPEC: THE VISUAL LANGUAGE (not built)

red1, 2026-09-20: *"if we not only map the longest common route, but also alternatives in blue
colour perhaps. Also since u mentioned sprinklered, it be good if the route has a grey tube casing
it and the HUD panel has a legend explaining what yellow, red, casing means."*

### §13.1 — the colours ARE the rule

✅ **APPROVED by red1, 2026-09-20** — *"Agree with your color code."* Proposed as the reading that
makes each colour carry a code quantity rather than a decoration; ratified. Do not re-litigate the
assignment; changing any one of these changes which rule the picture is drawing.

| colour | segment | the rule it draws |
|---|---|---|
| **RED** | room → divergence node | the COMMON PATH. No choice exists here: one blockage takes everyone. Its length is exactly the quantity §1006.2.1 caps at 30.5 m / 22.9 m. Red because it is the dangerous stretch, and it goes red-ALARM when over. |
| **YELLOW** | divergence → nearest exit | the primary route, once a choice exists. Reuses §PATH_ORANGE `0xff9100`, the Find panel's own route colour — red1 reads that as yellow and it is already the established "this is the walk" colour. |
| **BLUE** | divergence → each other exit | the alternates, ranked by measured length, dimmer with rank. Blue because it is deliberately NOT the warning family — an alternate existing is the GOOD news. |
| **GREY TUBE** | any segment with cover | sprinkler coverage along the route (§13.2). Its ABSENCE is the finding, not its presence. |

Drawn with the existing 2D-composite machinery (`escapeRouteCompositeOntoCanvas`) — one more
polyline per colour, same dash/halo treatment, no new render path.

### §13.2 — the grey tube is evidence, with a cited radius

A route segment is CASED where a `IfcFireSuppressionTerminal` lies within **3.23 m horizontally on
the same storey**. That number is derived, not chosen: NFPA 13 light hazard (which covers hospitals)
caps coverage at **225 ft² per sprinkler and 15 ft maximum spacing**; on a compliant 15x15 ft grid
the furthest any point can be from a head is the half-diagonal, 15·√2/2 = 10.6 ft = **3.23 m**.

⚠ This is a PROXIMITY test, not a hydraulic coverage calculation. It cannot see obstructions,
ceiling height, head type or whether the system is even charged. It answers "is there a head near
this walk", which is worth drawing, and it must not be captioned as "this route is protected".
A gap in the casing along a long common path is the picture worth having.

### §13.3 — the legend

A legend is now REQUIRED, not optional: four visual channels carrying four different meanings is
past what a viewer infers. Put it in the existing `bigStats` card slot — the Escape Route card
already owns that slot for its window, so this is a layout change inside one card, not a new box
(and §ESCAPE_ROUTE_HUD_RESERVE means the plates will keep clear of it automatically once
`A._hudStackBottom` grows).

    Escape Route — <room>
    RED    28 m no choice      limit 30.5 m (IBC T1006.2.1, sprinklered)
    YELLOW 41 m to nearest exit
    BLUE   3 alternates, nearest +12 m
    GREY   sprinkler cover, NFPA 13 light hazard 3.23 m

Every row carries its own number and, where one exists, its cited limit. The walking speed
disclosure (§3) stays — it is the card's own honesty rule and a legend does not displace it.

### §13.5 — the citations as HUD footnotes

red1, 2026-09-20: *"those citations can be footnotes in the HUD in brief, wow for users to nod at."*

Right instinct, and it is the cheapest credibility this film can buy: the numbers are already
cited in the code and in this doc, and putting the source on screen is what turns "some software
said 28 m" into "IBC says 30.5 m and this is 28". The viewer nods because the claim is checkable.

**THE TRAP, and it is the whole design problem.** A citation on screen IS a credibility claim. Half
of every citation here is an assumption (§12.3: occupancy class is unextractable), and one number
has no source at all (§3: the 0.75 m stride, "a standard adult-stride ergonomic convention from
OUTSIDE this project"). A footnote block that prints `IBC 2021 T1006.2.1` next to a
centroid-measured quantity, or that lets the stride sit in the same visual register as SFPE's
1.19 m/s, **launders the weak numbers with the strong ones** — and it does it more effectively than
having no footnotes at all, because the reader has now been told to trust the block. §3's rule
("do not silently present them as equally solid") gets HARDER here, not easier.

**The rule: a marker glyph carries the evidence tier, and the tier is visible before the source is
read.** Numbered superscripts are CITED. An asterisk is UNCITED. A cited row whose MEASUREMENT is
approximate says so in its own footnote, in the footnote's own words, not in a symbol.

    Escape Route — ≈ Level 4 R1
    RED     28 m  no choice            limit 30.5 m ¹
    YELLOW  41 m  to nearest exit
    BLUE    3 alternates, nearest +12 m
    GREY    sprinkler cover ³
    4:23 mins walk ²  ·  ~418 steps *
    ────────────────────────────────────────────
    ¹ IBC 2021 T1006.2.1 — I-2 sprinklered, both assumed; measured from room centre
    ² SFPE 1.19 m/s      ³ NFPA 13 light hazard, 3.23 m
    * 0.75 m stride — no source; this project's own convention

**It fits, measured against the real card.** `cpe_resource_panel.js` `_box()` gives
`bw = 0.36h, bh = 0.24h` — **389 x 259 px at h=1080**. Title ~20 px + four legend rows at ~20 px +
a rule + three footnote lines at ~13 px comes to ~145 px of the 259 available, at the padding
`_box` already applies. No taller card, no second box, no new panel — a content change inside the
slot the Escape Route card already owns for its window. At 854x480 the same layout is 173 x 115 px
and the footnotes fall below legibility: **drop the footnote block under a height threshold and
keep the markers**, rather than shrinking it into decoration. The § log carries the full sources
either way, which is where a reader who actually wants to check them should be sent.

**Register**, reusing what the HUD already has rather than inventing: footnotes in the day
counter's context colour `rgba(255,255,255,0.62)` at weight 500 — the same register
`clash_labels.js` uses for its `[tol/clash]` fact row. The legend rows themselves take each
segment's own colour, so the legend is self-demonstrating: the word RED is drawn in the red the
route uses.

⚠ **Never abbreviate a citation to the point where it cannot be looked up.** `IBC 2021 T1006.2.1`
is brief and findable. `IBC` alone is not a citation, it is a logo.

### §13.6 — the hydra silhouette IS the verdict — do not tidy it away

red1, on seeing the colour scheme described, 2026-09-20: *"it be amazing, though hydra like
looking, but its giving a x-section of what an escape route plan that is thought out well and
extracted from a dropped IFC on the fly is."*

**The busyness is not a flaw to be cleaned up. It is the reading, available before any number is.**
The silhouette encodes the verdict:

| what it looks like | what it means |
|---|---|
| a HYDRA — short red stub, many blue heads fanning early | the divergence point is close to the room and the alternates are many. **Good egress.** |
| a SNAKE — long red spine, heads only at the very end | a long common path; everyone funnels the same way and only gets a choice at the door. **Bad egress**, and §12.1's number will say so. |
| a red line with NO heads at all | routes never diverge — the infinite common path of §12.1. **The worst case, and it is legible as a shape.** |

Hospital `Level 4 R1` is a SNAKE: 8 alternates spanning 311.8-363.4 m, a 17% spread, all funnelling
down the same stairs (§13.4). That building reads as a snake because it IS one.

⚠ **A future "let's reduce the clutter" pass — capping the alternates drawn, merging near-identical
heads, thinning the fan — would destroy this.** It would make a snake and a hydra look the same.
If the frame is genuinely too busy, drop the FAINTEST heads by rank and SAY SO on the legend
("3 of 8 shown"), never silently. This is the same ruling §CLASH_LABEL's own TOP_N carries — red1
accepted clutter there too ("clutter acceptable… motion sieves them out").

**And the "dropped IFC on the fly" part is the load-bearing claim, so keep it true.** There is no
authoring step anywhere in this chain: no fire-engineering model, no tagged escape routes, no
human-placed exit signs. The route is Dijkstra over door adjacency measured from real door
footprints (`common/room_graph.js`, the buffered-distance match rule in its header), the exits are
name-filtered real exterior doors with lifts excluded (`NON_ROOM_DOOR_NAMES`, room_graph.js:127),
and the sprinkler cover is real `IfcFireSuppressionTerminal` positions. Every line on screen traces
to a row in the dropped file. **If any future version needs a human to mark up the model first, it
has lost the only thing that makes it worth showing.**

### §13.4 — what this does NOT become

Not a Google-Maps route chooser. MEASURED on Hospital `Level 4 R1`: all 8 alternates fall between
311.8 m and 363.4 m — a 17% spread — because they funnel down the same stairs and only diverge on
the ground floor. **On this building the alternates are one route with different doors at the end,
and that IS the finding** (it is what a long common path looks like). A viewer must not be shown
three fat distinct routes that the building does not have. Draw what diverges, where it diverges.

**Sources (verified 2026-09-20, not to be re-derived):**
- IBC 2021 §1007.1.1 exit separation, 1/2 and 1/3 diagonal — https://up.codes/s/two-exits-or-exit-access-doorways
- IBC 2021 Chapter 10 Means of Egress — https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress
- §1006.2.1 common path of egress travel, 75/100 ft — https://codes.iccsafe.org/s/IFC2021V2.0/chapter-10-means-of-egress/IFC2021V2.0-Pt03-Ch10-Sec1006.2.1
- Remoteness purpose, "independent means of egress" — https://www.sgh.com/insight/spark-notes-multiple-exits/
- NFPA 13 light hazard 225 ft² / 15 ft spacing — https://blog.qrfs.com/214-maximum-and-minimum-sprinkler-distance-rules-part-1-standard-spray-fire-sprinklers/

## STATUS — BUILT and witnessed; one finding open for red1

Scene fully worked out with red1 across several turns (trigger, timing, camera behaviour, visual
language, panel content, the two counters and their honesty asymmetry). Implemented 2026-09-20 on
bim-ootb `feat/escape-route-reveal`; 36/36 feature witness checks and 79/79 panel-wiring checks pass
on real data. §8's finding — the Egress report's own "Longest path to exit" headline is derived from
a penalty-weighted cost, not a distance — is observed and documented, NOT fixed.
