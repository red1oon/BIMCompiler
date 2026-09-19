<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ESCAPE ROUTE REVEAL — animate the real worst-case escape path during the closing orbit

```
# ⚠ DO NOT REMOVE — SCOPE
FOUND-NOT-BUILT spec, worked out scene-by-scene with red1, 2026-09-19/20. Nothing built yet. Every
visual choice below reuses an existing, already-proven technique from this codebase — this doc's
own job is to name exactly which one, not to invent new render/animation mechanics. Read `bim-ootb
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

## STATUS — spec only, nothing built

Scene fully worked out with red1 across several turns (trigger, timing, camera behaviour, visual
language, panel content, the two counters and their honesty asymmetry). No code written. Two real
gaps flagged rather than guessed: the exact shine-through/leader-line/panel-chrome component names,
and the camera-ease parameter's own implementation shape — both left for whoever picks this up to
confirm against current code, not asserted here.
