<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# INFORMATIVE FILM OVERLAYS — the film as a BIM report, not a showreel

```
# ⚠ DO NOT REMOVE
SCOPE: overlays that make the BAKED FILM informative — clash pairs, unsupported elements,
critical path — drawn ON the existing flight, never by changing the flight. SPEC ONLY as of
2026-09-01; nothing here is built. Read the log after every run: verification is `§`-tagged
numbers, never screenshots (CLAUDE.md FUNDAMENTAL LAW). Honour this block until DONE.
```

**Why this file exists (user, 2026-09-01):** *"Movie making is not BIM core. It's the informative
graphics that should be more valued by users. Such hassle free DIY bake is good enough. it's
groundwork for more informative movies such as clash pair highlights along the flight path."*
The silent CLI bake (`CINEMA_PATH_EDITOR.md` §CLI_SILENT_BAKE) is the GROUNDWORK; these three
overlays are the point of it. **A new file is justified** — no existing lane owns "informative
overlay drawn into the baked film". Related, not duplicated: `CLASH_GATE_OBB_NARROWPHASE.md`
(the modeller-side gate), `CINEMA_PATH_EDITOR.md` (the film itself), `4D_MODEL_INTEGRITY.md`
(the ownership table — check it before computing any 4D relation).

**Standing constraint for all three:** the user was explicit that the path is not touched —
*"Need not tanpee the path."* These overlays read the flight; they never re-plan it.

---

## §CLASH_QUALIFY — the narrow-phase refinement (GATES §FILM_CLASH_IN_FRAME)

**User, 2026-09-01:** *"there was a pending refinement need for Clash Analysis ie the advanced
clash qualifying - if the meshes really clash."*

**Measured current state, read from the code 2026-09-01 (do not re-derive):** viewer clash is
BROAD-PHASE ONLY. `viewer/measure.js:478` counts pairs from an R-tree over boxes with an active
tolerance (`§CLASH_COUNT total=… tol=…mm rtree=true cached=<discA|discB@tol>`), with a
storey-by-storey cross-join fallback at :498 when the R-tree is not ready. Results cache into
`A._cachedPairCounts`. `viewer/clash_matrix.js:343` builds per-discipline envelopes
(`§CLASH_ENVELOPES`). **There is no mesh-level test anywhere in the viewer clash path.**
`modeller/sdg_gate.js`'s AABB weakness is already specced in `CLASH_GATE_OBB_NARROWPHASE.md`
(over-flags when two boxes overlap but the rotated shapes do not; under-flags because an AABB is a
loose bound on anything rotated) — that analysis applies here unchanged and MUST NOT be re-derived.

**The claim to prove:** a qualified clash set is materially different from the box set, and the
difference is measured, not assumed.

**Design — three tiers, cheapest first, each tier only sees what survived the last:**
1. **R-tree box overlap** — unchanged, keep as the broad phase. It is the only tier that may touch
   all pairs.
2. **OBB / SAT** — Separating Axis Theorem on oriented boxes. `element_transforms` already carries
   `center_x/y/z`, `rotation_x/y/z`, `bbox_x/y/z`. ⚠ **CHECK whether bbox_* are half-extents or
   full extents before using them** — `CLASH_GATE_OBB_NARROWPHASE.md` §1 flags this exact
   ambiguity. Do not improvise the maths; follow that file's §2.
3. **Triangle-level** — only for pairs that survive tier 2, and only if tier 2 proves insufficient.
   Do NOT build tier 3 speculatively; tier 2's measured reclassification decides whether it is
   needed.

**Witness — `witness_clash_qualify.js`. The verdict is the RECLASSIFICATION, not a pass count:**
- `§CLASH_QUALIFY_AB boxPairs=N obbPairs=M demoted=D promoted=P` per discipline pair, per building.
  **`demoted` is the number that justifies the work** — box-flagged pairs the OBB test clears.
- Assert on at least two buildings, and include one with heavy rotated MEP (Hospital: PipeFitting
  3,635 / DuctFitting 811 per `PHOTOREAL_STILL_RENDER.md` §WALL_WINDING_MEASURE).
- **Must report `VACUOUS`** if a discipline pair has zero box candidates — a 0 there means nothing.
- **Must report `NO-OP`** if `demoted=0 && promoted=0` — that is the honest outcome that says the
  refinement is not worth shipping, and it must be reportable rather than dressed up.
- Tolerance is a real parameter (`tol` above): assert the reclassification AT THE SHIPPED TOLERANCE,
  not at 0, or the comparison is against a set nobody uses.

**⛔ Gate:** §FILM_CLASH_IN_FRAME does NOT ship on unqualified pairs. Broadcasting box false
positives at 15 fps into a deliverable film is worse than not showing clashes at all — a viewer
cannot tell a false positive from a real one, and the film is the artefact that leaves the building.

---

## §FILM_CLASH_IN_FRAME — clash pairs light up as they enter the shot

**User, 2026-09-01:** *"Clash pairs highlighted as they fall into frame."* and *"The easier thing -
clash pairs appearing even not yet building up."*

**Claim:** during a bake, every qualified clash pair whose elements enter the camera frustum is
highlighted for a readable beat, and pairs whose scheduled placement has not yet arrived are shown
as GHOSTS — without the buildup ever placing an element early.

**Two rules that carry the whole design:**

1. **GHOST, NEVER EARLY PLACEMENT.** An element whose schedule date has not arrived is drawn as a
   wireframe envelope plus a marker at the clash point, visually distinct from built geometry — it
   is never handed to the buildup as placed. **Reason:** the film follows the Time Machine
   (`CINEMA_PATH_EDITOR.md` §CPE_BUILDUP_FOLLOW_TM); placing an element before its date makes the
   buildup assert something false, and this project's whole pitch is that the schedule is right.
   The information still arrives on time; only its representation differs. Reuse
   `clash_matrix.js`'s existing envelope machinery (`§CLASH_ENVELOPES`) rather than inventing a
   second envelope renderer.
2. **DWELL, OR IT STROBES.** A pair clipping the frame edge will flicker on and off frame to frame.
   This is the S258-S262 failure class (`project_dlod_geometry_swap_landmine`): a hard per-frame
   visibility toggle popping, independent of WHICH threshold triggers it — four attempts, all
   retracted, hysteresis alone proven insufficient. **Treat flicker as the DEFAULT expected failure,
   not an edge case.** Once a pair lights, it HOLDS for a minimum beat (a stated number of film
   seconds, derived from what is readable at the film's fps — not a guessed constant) even if it
   leaves frame. The pattern that actually shipped in this space is `TM_DLOD_SCALE.md` Phase 3's
   disjoint sets — never a swap-in-place on one slot. Follow that shape.

**Frustum test:** reuse the existing in-view predicate rather than writing a second one —
`time_machine.js`'s `_dlodInView` already does distance + frustum with a camera-pose guard
(`§DLOD_VF_CAMGUARD`). Read `4D_MODEL_INTEGRITY.md` §I first: if this question is owned, call the
owner; if it is not in the table, ADD THE ROW.

**HUD:** one more revolving card in `§CPE_BIG_STATS` (10 slots today, e.g. `20 levels`,
`1,771,249 labour cost`). **`clashes in view: N`, not a static total** — it changes with the camera,
which is what earns it a slot in a moving picture. Note the card list is now full-width during the
fly-out (`§CPE_PIE_FLYOUT_DROP`, PR #1599) — re-check the fit, do not assume.

**Witness — `witness_film_clash_in_frame.js`:**
- `§FILM_CLASH_FRAME i=<frame> inView=<n> ghosted=<g> held=<h>` per frame, asserted against an
  independently computed frustum set — not against the renderer's own answer.
- **Anti-flicker, the load-bearing check:** max on/off transitions per pair across the film must not
  exceed the dwell rule. A pair toggling every frame is a FAIL even if every frame is individually
  "correct".
- **Ghost integrity:** assert that no ghosted element is ever counted as placed by
  `window.tmPlacedCount()` at that cursor. This is the check that proves rule 1 held.
- HUD card value equals the asserted `inView` count on the same frame.
- `VACUOUS` when the building has zero qualified pairs; `INCONCLUSIVE` if no pair ever entered frame
  on the tested flight (a real possibility on a short path — say so, do not report PASS).

---

## §FILM_UNSUPPORTED — elements placed with nothing under them

**Ranked FIRST for value-per-effort: the detection already runs, and it has no flicker problem at
all because it is tied to PLACEMENT, not to the camera.**

**Measured, already shipping as warn-only:** `§SUPPORT_UNCHECKED_SUMMARY n=177/63182
bigVol>1.556m³ zero-candidate buildingModelsSubstructure=true (warn-only — reported not gated)` —
observed live in the Hospital bake log, 2026-09-01. Terminal's count is 236 (`viewer/rates.js:300`,
witness `witness_big_element_support_coverage.js`). Per-element lines carry `guid`, `cls`, `vol`.

**Claim:** at the moment the buildup places an element that has no support carrier, it is marked —
so the film shows structural nonsense in the schedule as it happens, rather than burying it in a log.

**Why this beats clash for a planner:** a clash is a design conflict; an unsupported element being
built is a *sequencing* error — the programme says build this now and there is nothing under it.
That is the film's own subject matter.

**Design:** read the existing summary set, no new detection. Mark at placement, hold for the same
dwell beat as §FILM_CLASH_IN_FRAME so the two overlays read consistently. The mark is on the element
being placed — camera-independent, so no S258 exposure.

**Witness — `witness_film_unsupported.js`:**
- Marked count over the whole film must EQUAL `§SUPPORT_UNCHECKED_SUMMARY n=` for that building.
  A mismatch means the overlay invented or dropped elements.
- Assert each mark lands at the element's own placement frame, within one frame.
- `VACUOUS` if `n=0` on the building tested — do not report PASS on a clean model.

---

## §FILM_CRITICAL_PATH — tint what actually drives the end date

**⛔ BLOCKED ON A PREREQUISITE — read this before speccing further work.** Verified 2026-09-01:
`viewer/cpm_schedule.js` computes **no schedule float and no critical flag**. Its only "floating"
references (`:294`, `:435`) are about physics/support edges, NOT schedule slack — do not mistake one
for the other. `totalFloat` / `freeFloat` / `critical` exist ONLY in `viewer/foreign_schedule.js`
(:100, :152, :169, :359) for IMPORTED P6 / MSP schedules.

**So there are two honest scopes, and they are not the same feature:**
- **(a) Imported-schedule only** — ships today against a P6/MSP import, zero new maths, and is
  immediately useful to anyone who has a real programme. Small.
- **(b) Generated-schedule** — requires a backward pass in `cpm_schedule.js` to produce late
  start/finish and total float before anything can be tinted. That is a real scheduling change,
  belongs to the 4D lane, and must go through `4D_MODEL_INTEGRITY.md` §I's ownership table before
  a line is written. **Do not bolt a float calculation into the film layer** — two sources of
  schedule truth is the anti-pattern this project already names.

**Recommendation: build (a) first**, and let it prove the overlay is worth having before anyone
funds (b).

**Claim:** elements on the critical path are tinted as they are placed, so the film reads as a risk
briefing — this is what slips the project if it slips.

**Witness — `witness_film_critical_path.js`:**
- Tinted set must equal the schedule's own critical set — asserted against `foreign_schedule.js`'s
  `critical` / `totalFloatDays<=0`, not recomputed in the witness.
- `INCONCLUSIVE` when no imported schedule is present — never PASS, and never silently fall back to
  a generated schedule that has no float at all. That silent fallback is the specific way this
  feature would lie.

---

## Build order (recommendation, not a work order)
1. **§FILM_UNSUPPORTED** — detection exists, no camera coupling, no flicker risk, highest value/effort.
2. **§CLASH_QUALIFY** — needed before any clash overlay is honest; its `demoted` count also tells you
   whether the existing clash panel has been over-reporting all along, which is worth knowing on its
   own.
3. **§FILM_CLASH_IN_FRAME** — gated on 2.
4. **§FILM_CRITICAL_PATH (a)** — imported schedules only.
