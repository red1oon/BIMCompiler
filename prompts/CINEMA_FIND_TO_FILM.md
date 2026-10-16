# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** §CPE_FIND_TO_FILM ONLY — pick rooms in Find, get a route, film it. Promoted to the next big
POC by the user 2026-07-29. Nothing else in the Cinema queue belongs in this file.
**Read the log after every run.** Verification here is `§`-tagged console output and NUMBERS, never a
screenshot and never "the film looks right" — CLAUDE.md's FUNDAMENTAL LAW applies with full force in
this task precisely BECAUSE the film is the thing being watched (see §"instrument, not proof" below).
**Spec before code, including test code.** Answer the ⛔ blocking question before Phase A.
**Parents (read their settled rules first, do not re-litigate them):**
`prompts/CINEMA_PATH_EDITOR.md` — §CPE_BANDS (esp. rule 8 "authored is authored"), §CPE_STICK,
§CPE_HOSE, §CPE_IDB_PATH_STORE, §CPE_PREVIEW_DIVERGENCE, §CPE_CLICK_SLOP.
`prompts/CINEMA_DELIGHT_BATCH.md` §5 — the original scoping this plan promotes.
Honour this block until this file is DONE.

## State it builds on (all merged to `bim-ootb` main, 2026-07-29)
CPE **v16**, MAXQ **v17**, sw **v882**. PRs #1081 (§CPE_REOPEN_DOUBLE), #1082 (§CPE_PREVIEW_AFTER_RETIRED
+ §CPE_BUILDUP_FOLLOW_TM), #1083/#1084 (§CPE_CLICK_SLOP, witnessed 4/4).
- **Band count is arbitrary** (§CPE_STICK, 2026-07-28) — a 5-room tour is simply 5+ bands. This task was
  impossible before that shipped.
- **The `bands`-shaped override is the handoff format** — the same object §CPE_IDB_PATH_STORE saves and
  `A.stageCinemaPath` stages. Find→Film does not need a new interchange type.
- **OK no longer previews** (§CPE_PREVIEW_AFTER_RETIRED) and **the buildup follows the Time Machine**
  (§CPE_BUILDUP_FOLLOW_TM) — so the check loop below is Preview-driven and costs 10 s, not a bake.
- **Room-to-room routing already exists** — `§13 Stage B` raster-constrained A*, the yellow polyline
  that hugs real floor. This task CONSUMES it; it does not rewrite it.

# ▶ PROMOTED 2026-07-29 — §CPE_FIND_TO_FILM is the NEXT BIG POC, and the user named a second reason for it
> User: *"The find to film should be the next big POC because it will also validate the path as been
> correct. The Film maker preview can quickly confirm it."*

## The new rationale, and it is the stronger one
Item 5 was justified on PRODUCT value — *"show me the lobby, the ward, the roof"* is what a client asks
for. The user has now named a **verification** value that is arguably worth more: a filmed route is a
*test* of the room-to-room path. Walking the camera through the route exposes, visibly and in one pass,
every failure the pathfinder can produce — clipping a wall, missing a door, taking a floor change that
does not exist, entering a room the user never selected. **And §CPE_PREVIEW makes the loop cheap:** you
do not bake to check, you press Preview and watch 10 s.

**This makes Find→Film an INSTRUMENT, not only a feature.** Frame it that way in the build: the film is
how room-graph routing gets validated at LOD400 scale, on real buildings, without a human reading
coordinates. That is the same inversion as the rest of the project — the model proves itself by being
compiled into something you can watch, rather than by being asserted about in a report.
⚠ **But it is not a substitute for the numeric gate.** Per CLAUDE.md's FUNDAMENTAL LAW, "the film looks
right" is NOT the proof. The witness below asserts containment and door traversal NUMERICALLY; the film
is what makes a failure *obvious to a human*, and what makes the numeric gate worth trusting is that it
runs on the same route the film flies. Both, not either.

## Build plan
**Phase A — the handoff, nothing else.** A `▶ Film` button beside the existing room-to-room route in the
Find panel. It converts the route to the `bands`-shaped override the plan already accepts (the same
object §CPE_IDB_PATH_STORE stores) and opens the CPE **pre-loaded** — not a bake. The user has been
consistent that they want to see and adjust before committing to a cook, and the verification loop above
only works if the editor opens.
- **Consumes, already exists:** the room-to-room route (`§13 Stage B` raster-constrained A*, already
  shipped), the `bands` override, §CPE_STICK's arbitrary band count (a 5-room tour is simply 5+ bands —
  impossible before 2026-07-28), §CPE_PREVIEW.
- **⚠ The trap, restated because it is the whole risk:** the between-room route must come from the ROOM
  GRAPH, never straight lines between room centres, or the camera walks through walls. §CPE_BANDS rule 8
  ("authored is authored") lets a USER drag a path through a wall; it does not license the GENERATOR to.
- **Gate (W-FIND-FILM-A):** `§CPE_FIND_FILM rooms=<n> routeLen=<m> bands=<n> src=room-graph` and the
  flown path enters every selected room's bbox, in the selected order. Assert containment, not appearance.

**Phase B — the validation instrument the user asked for.** Turn Phase A into a repeatable check: for a
set of room pairs on a real building, film-plan each route and assert numerically that it (i) enters
both rooms, (ii) crosses only real door/stair openings, (iii) never passes through a wall element's
bbox. Report per-route PASS/FAIL with the numbers.
- **Gate (W-FIND-FILM-B):** on Hospital, N≥10 room pairs — zero wall intersections, every hop through a
  real opening, and the count of routes that FAIL is reported rather than tuned away. **A known-limit is
  a recorded result, not a bug to hide** — same treatment as `witness_cpe_hose.js`'s D1 on Hospital_3.

**Phase C — only if A and B are clean.** Multi-room ordering UX (reorder the stops), and whether a room
can be visited twice. Do not design this before B has told you what the router actually does.

## ⛔ Open question for the user, before Phase A
**Does `▶ Film` use the rooms you have SELECTED in Find, or the route already drawn there?** They are not
the same: the drawn route is a pair (from → to), while a "tour" is an ordered N. Recommend: the button
takes whatever the panel currently has — 2 rooms gives a 2-stop film, N selected gives an N-stop tour in
selection order — so there is one button and no mode. Confirm before building, since it decides whether
this is a small handoff or a new selection model.
