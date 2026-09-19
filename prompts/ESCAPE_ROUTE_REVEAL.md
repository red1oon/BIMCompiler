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

## STATUS — BUILT and witnessed; one finding open for red1

Scene fully worked out with red1 across several turns (trigger, timing, camera behaviour, visual
language, panel content, the two counters and their honesty asymmetry). Implemented 2026-09-20 on
bim-ootb `feat/escape-route-reveal`; 36/36 feature witness checks and 79/79 panel-wiring checks pass
on real data. §8's finding — the Egress report's own "Longest path to exit" headline is derived from
a penalty-weighted cost, not a distance — is observed and documented, NOT fixed.
