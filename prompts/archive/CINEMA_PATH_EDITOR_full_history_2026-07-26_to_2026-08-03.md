# CINEMA_PATH_EDITOR — full verbatim history, 2026-07-26 to 2026-08-03
# This is the archived day-by-day build history of the Cinema Path Editor lane, moved out of
# `prompts/CINEMA_PATH_EDITOR.md` on 2026-08-13 per the same consolidation pattern already applied to
# `prompts/PHOTOREAL_STILL_RENDER.md` (see that file's own archive note, 2026-08-11). Every section below
# is byte-for-byte what was in the live file — nothing summarized, nothing dropped, only moved. The main
# file keeps a one-line pointer to each of these, plus everything from 2026-08-04 onward (the
# scrubber/viewfinder/aim-pin/POV-frame arc, still actively cross-referenced by the current open thread)
# and the evergreen model/foundation spec sections, in full.
# Read `prompts/CINEMA_PATH_EDITOR.md` first — this file is reference only, not the entry point.

---


**Scope:** ONE feature — a waypoint editor that opens after the Alt+C preview, lists the cinema path's
waypoints with their camera info, and lets the user key or drag them before the bake. The "simplest
fastest tour maker."
**Not in scope:** the §CINEMA_SPACE attic-pick default — **owned by another session as of 2026-07-26,
do not touch `_cinemaPathPlan`'s §CINEMA_SPACE block (~L3486-3610)**; see §Out of scope below.
**Read the log after every run.** Verification on this project is `§`-tagged console output, not
screenshots — and for anything continuous (camera path, angles, Z) it is the NUMBERS, per CLAUDE.md's
FUNDAMENTAL LAW. Honour this block until this file is DONE.
**▶ RESUME 2026-08-04+ — the 2026-08-02 five-item list below this block is STALE, unverified this
session — a huge amount shipped 2026-08-03 that may have already touched some of it (buildup pacing
was directly re-investigated, see below); check current state fresh rather than assuming either
resolved or still-open.**

**Shipped 2026-08-03 (live sw v929, this session, all merged to `bim-ootb` main):** §CPE_PANEL_STATE
saved-path checkboxes/day-counter/cursor (#1140) · §CPE_ROOM_TITLE_LEVEL_CONSOLIDATE + bake-compositing
fix (#1142) · §CPE_STICK_APPROACH bake-HUD feedback (#1143) · §CPE_BUILDUP_DEFAULT_ON (#1144) ·
§CPE_MAXQ_STATUS_DAY_LABEL (#1145) · §CPE_PACE_SWING_SOFTEN 1.6→1.45 + buildup-pacing re-investigated,
**no defect found** — real per-frame replay showed a flat 36.15-36.30 elements/frame rate; "fast/slow"
was the camera's own beat-speed variation, not the buildup (#1147) · §CPE_GHOST_GROUND_TRIGGER fixed
TWICE — first to first-above-ground-element not 5%-share (#1148), then a real clock-domain bug in that
same fix (elements-placed vs calendar-fraction comparison) found and fixed (#1149), then independently
RE-VERIFIED with real pixel readback on a second building (Terminal) — confirmed working, not a defect.

**Still genuinely open, next priority for a fresh session (see `prompts/GANTT_ACCURACY.md`'s own
2026-08-04+ RESUME block for the full spec):** "4D happens too fast" / no staggering within a phase —
this lives primarily in the GANTT/schedule-generation lane (the "AUTHOR" system), not this file, but
the SYMPTOM was observed through a Cinema Path Editor bake, so a session working this file should read
that RESUME block too before assuming it's out of scope here.

**Unrelated, same-session, cross-file:** an LTU_AHouse floor-flicker report is being investigated in
`prompts/PHOTOREAL_STILL_RENDER.md` §LTU_FLOOR_FLICKER — mechanism suspected (transparent-sort
instability between §GHOST_GROUND and §Z_STACK_XRAY_STAGING, both default-ON as of today) but not yet
pixel-proven as of this file's last edit; check that file for the current state before re-diagnosing.

---
**▶ SUPERSEDED 2026-08-02 — status unverified, read the note above before acting on this:**
read `§ SESSION CLOSE 2026-08-01 (final)` at the END of this file first (search
`SESSION CLOSE 2026-08-01 (final)`). Live sw v911. Take them in this order: (1) the 20-slice element
histogram — cached vs forced-regenerate ops — because the reported buildup pacing may be a STALE GANTT
CACHE and not a defect at all; (2) jerks at every stick join (`unmeasuredJoins=2/2` is the tell);
(3) the blind fan (`ghost=1` is the lead — my BatchedMesh guess is DISPROVEN, verify with a log line
first); (4) orbit over-rotation (it is the GAZE, and Beat 4 must approach tangentially); (5) noise ratio
still missing on `rise`+`orbit`, and facing absent in Beat 1+Beat 5. `feat/cpe-hold-turn` (v912) is
UNMERGED and RED on purpose — rebase to v913, and do NOT close its open question by lowering the gate.**

**⚠ READING ORDER for a fresh session:** §CINEMA_PATH_EDITOR_MODEL (settled data model) → §CPE_BUILT
(what shipped) → §CPE_LIVE (browser run + the defect it caught) → **§CPE_BANDS (next build, spec ready,
NOT implemented)** → **§CPE_PACING (measured, ONE user decision open)**. The "graph dialog" framing in
the original sections is SUPERSEDED throughout.

**STATUS 2026-07-27 (session end):** everything specced in this file is BUILT AND WITNESSED.
- §CPE_BANDS + full-film tube → **merged to main, PR #1026**.
- §CPE_SCREEN_PLANE + §CPE_PACING → **PR #1027, auto-merge armed, e2e was still running at session
  end. FIRST THING NEXT SESSION: confirm #1027 landed** (`gh pr view 1027 --json state`); if CI went
  red, that is the only loose end.
- The pacing decision is ANSWERED — user: *"I already said derived"* — dive, spin and orbit are all
  derived. Built. **One thing is left to LOOK AT, not decide: the derived totals do not match the
  ~15s/~40s expectation** — see §CPE_PACING_BUILT.

**REVIEWING this work?** Go straight to **§CPE_REVIEW_PACK** — mechanism-by-mechanism explanation,
every measured number with the log line that produced it, and the 7 known issues I did NOT fix.
It opens by naming the highest-risk thing to check first (I changed two failing gates and they
went green — verify I corrected the instruments rather than lowered the bar).

## ▶ SESSION CLOSE 2026-08-01 (LATE) — READ THIS FIRST, it supersedes the earlier 2026-08-01 block

**Live: viewer sw v906.** Six PRs shipped, ALL MERGED, all witnessed. Nothing half-landed.

| § | PR | what it fixed |
|---|---|---|
| §CPE_ROOM_TITLE_LEAD | #1118 | caption opens 2s before the doorway; 3s slot or SKIP (no flash) |
| §CPE_ROOM_TITLE_GAZE | #1119 | caption the room the camera LOOKS INTO — Hospital 1 → 15 captions |
| §4D_ROOF_LOAD_PATH | #1120 | helipad-hut roofs scheduled 277 days BEFORE their own walls |
| §CPE_WALK_BUDGET_NOISE_BLIND | #1121 | walk seconds priced by CONTENT change, not degrees turned; `/3` turn tax removed |
| §CPE_PATH_NOT_PORTABLE | #1122 | a saved path could not leave the machine, and the skip was silent |
| §GANTT_CACHE_VERSION 4→5 | #1123 | §4D_ROOF_LOAD_PATH could not REACH an already-cached browser |

**⚠ THE LAST ONE IS THE LESSON OF THE DAY.** #1120 was correct, witnessed 9/9, merged — and the user
still saw roofs first, twice, including after a hard reset. Cause: `_GANTT_CACHE_VERSION` gates the
`gantt:v<N>:<building>` **IndexedDB** key, and its own comment already said to bump it "whenever
schedule-GENERATION logic changes — sequence rules, schedule_gate.js gating logic" and warned that
"a logic fix alone does NOT reach a browser that already generated+cached a schedule". #1120 changed
BOTH named things and the bump was missed — by the builder AND by my review of the diff. The v4 note
already recorded the identical miss from 2026-07-18 in the user's own words ("hard reset didn't fix
it"). **Written down once, repeated anyway. Before closing ANY fix that changes ordering, rates,
gating or rules, ask: what caches this?**

**RESUME AT — one spec, two coupled halves, agreed with the user and NOT yet built:**
1. **§CPE_GAZE_CONSTANT_RATE.** User: *"its turning speed be at a constant speed thus allowing the
   user to define the arc well ... couldn't turn in time before the user has dragged the path to
   another spot."* MEASURED this session on Hospital: the gaze closes 87.7° → 0° off the building bulk
   monotonically over t=0.56→0.80, peak **3.9°/s** — under 9% of `CINEMA_TURN_DPS` (45°/s), the film's
   own single turn rate used by the spin and the orbit lap. The gaze is the THIRD turn and the only
   one not rate-governed; its speed is an emergent by-product of a weight field (`blend`/`seamTaper`/
   `openTaper`). Make it rate-governed, and LOG a shortfall (`needed X° in Y s at 45°/s → short by Z s`)
   instead of silently lagging. ⚠ Must still taper to zero at the seams — §CPE_AIM_DEPTH_OPEN_TAPER
   exists because a rule at full strength on a beat boundary produced "cam turning is too abrupt".
   **⚠ AMENDED by the user at session close — this is the load-bearing half:** *"the turn should be
   AWARE AT ONSET."* Not "turn at a constant rate once triggered" — **plan the turn from the start of
   the leg**. A weight-driven blend is late BY CONSTRUCTION: it can only rise after its trigger
   condition is met, so it always begins reacting after the thing it should have anticipated. The rule
   is: at the START of a leg, compute the bearing the gaze must END on, and slew toward it at the
   constant rate from t0 — arriving on time by construction rather than by luck. That also makes the
   shortfall knowable AT PLAN TIME (before a single frame is baked), which is what makes the arc
   authorable: the editor can say "this leg is 1.2 s short of the turn you asked for" while the user
   is still dragging.
2. **§CPE_STICK_HOLD.** User's own proposal: a `hold` property per stick row, default 0; set 1s and
   the path eases to a stop at that stick's midpoint and away again. **These two are ONE feature, not
   two:** model rule 2 makes the gaze LOS-derived, so a hold ALONE just hovers with the camera still
   pointing where it already pointed. Hold gives the turn a budget; constant rate spends it.
   Three constraints, each already bitten this lane: (a) the clock must COST the hold or it is
   §CPE_HOSE_LENGTH_BLIND a fourth time, and it is AUTHORED so it is added AFTER the noise multiplier,
   never scaled by it; (b) it amends §CINEMA_PATH_EDITOR_MODEL rule 9 ("constant speed") — amend it
   explicitly, do not let it quietly stop being true; (c) `cinema_path` needs a `hold_sec` column and
   the loader must tolerate tables written without it (portability was only fixed today).

**⚠ LOCALISED AT SESSION CLOSE — the user's "turn starts too late" is the DIVE→SPIN SEAM, and it is
the SPIN WHIP.** User: *"It was coming out of the dive towards the edge is what i saw."* Measured on
Hospital, gaze angle off the building bulk: **t=0.150 → 35.8°, t=0.200 → 76.9°, t=0.250 → 101.9°**
(dive ends 0.170, spin ends 0.186). Coming out of the dive the gaze does not merely fail to turn
toward the mass — it **opens AWAY from it by 66°** across the seam, which is where
`§CINEMA_SPIN class=behind(full-lap) finalSpinDeg=-523` executes. So this is open item #3 (the spin
whip costed on a CAPPED 180°) with a measured signature and a named moment, NOT a separate defect.
Fix the spin's budget-vs-motion mismatch and re-measure this seam BEFORE building the gaze rate law —
the rate law may be treating a symptom of the whip.

**⚠ AND ONE THING STILL NOT DIAGNOSED — do not assume it is the same mechanism.** The user reports the turn
should begin ~3-4s in and only starts by ~6s. On the full 148s film those marks land at **t≈0.02–0.04,
inside the DIVE**, not the pull-back. The dive has its OWN drift: gaze goes **0° → 23° off the bulk over
the first 15s** while descending toward the settle point. Measure that beat before speccing it.

**Still open, unchanged:** the 534° spin whip (`spinDeg=487` on the crafted Hospital path — costed on a
CAPPED 180°, same budget-vs-motion family as §CPE_HOSE_LENGTH_BLIND and the walk budget: **that family
has now produced FOUR instances, sweep for more**); orbit loses the ground (`granted=132.7` vs
`requested=72.2`, +27m); §CPE_AIM_DEPTH D4 buildup-aware gaze. `MIN_DWELL` is CLOSED as deliberately
kept (user ruled).

**Test asset built this session:** `~/bim-ootb/buildings/HospitalAjaibPath.db` carries a hand-written
`cinema_path` — 3 bands derived from Level 1's own element cloud by PCA, verified end-to-end
(`§CINEMA_PATH_RESTORE bands=3 total=81.9s`, `route=authored`). Note it also reproduces the spin whip.
The user's real 'Ajaib' is still only in their IndexedDB; #1122 makes Ctrl+S export it from now on.

## ▶ SESSION CLOSE 2026-08-01 (EARLIER, superseded above) — READ THIS FIRST, then §CPE_ROOM_TITLE_LEAD
**Live: viewer sw v900, CPE v19, MAXQ v20.** Nine PRs shipped, all merged, all witnessed. Nothing in
this session is half-landed; there is no cleanup owed.

**SHIPPED (each RED-first, each with its own witness):**
| § | PR | what it fixed | witness |
|---|---|---|---|
| §CPE_REOPEN_NODE | #1104 | an added stick did not survive OK→re-open; OK now stages. Provenance travels at 3 seams. | 9/9 |
| §CPE_STICK_RED_BAR | #1105 | a stick is a RED bar with BLUE dots (all-blue read as a smudge) | 10/10 |
| §CPE_HOSE_LENGTH_BLIND | #1107 | **the editor costed a curve that is never flown** — 107.55 m vs 173.53 m on the user's own record; films ran 1.57x fast | 5/5 |
| §CPE_ROOM_TITLE_HEIGHT_BLIND | #1108 | captions named rooms 11–21 m BELOW the camera | 5/5 |
| §CPE_GHOST_GROUND (+RATIO, +arm, +degrade) | #1110/#1112/#1113/#1114/#1115 | the foundation is built and BURIED under the ground plane; ghost it until the building rises | 11/11 |
| §CPE_BUILDUP_WORK_PACED | #1116 | **the film advanced DAYS, the building went up in bursts** — 24% of the model in the first 5% of the film | 7/7 Duplex + 7/7 Hospital |
| §CPE_ROOM_TITLE_HOLD | #1117 | captions flashed past unread (4 of 6 under 2s); 3s floor, next room replaces | 8/8 |

**OPEN, in the order I would take them:**
1. **§CPE_ROOM_TITLE_LEAD** (specced this session, NOT built) — name the room ~2s BEFORE entering.
   Has one question the user must answer, do not guess it: does the lead apply to the film's FIRST
   caption (a room name over the dive)?
2. **§CPE_AIM_DEPTH D4 — buildup-aware gaze.** `§CPE_AIM_GRID elems=63182` is the FINISHED building,
   so the camera aims at mass that is not poured yet; measured `active=0/65` on the user's last three
   paths. Design already sketched: per grid cell, the earliest placement time, then a prefix count at
   the cursor. Cheap, and now that §CPE_BUILDUP_WORK_PACED exists the cursor is trustworthy.
3. **The 534° spin whip.** `§CINEMA_SPIN class=behind(full-lap) finalSpinDeg=-534.4` executed against
   a budget costed on a CAPPED 180° — same defect family as the hose length (budget on one number,
   motion on another). Turn the short way, or cost the real angle.
4. **Orbit loses the ground.** `requested=72.2 granted=132.7 clamped=true dY=26.92` — the elastic
   band's floor overrode the ask by 84% and lifted it 27 m, so the final beat is silhouettes against
   sky with no ground in frame.
5. `MIN_DWELL` (1.4s) still DROPS rooms crossed faster than that, before the new hold applies. Would
   ADD captions rather than lengthen them — the user has not asked for it; do not smuggle it in.

**⚠ TWO PROCESS LESSONS THIS SESSION COST REAL TIME — both already in the code as comments:**
- **A witness that sets up a state the browser never reaches is worse than no witness.**
  §CPE_GHOST_GROUND shipped 9/9 green and could not fire in a real bake, because the witness set
  `ground.visible = true` before arming while photoreal staging only turns it on INSIDE the frame
  loop. Two live rounds lost. Every new gate now arms in the regime the bake actually has.
- **A cross-module feature must DEGRADE, not disable.** Ghost ground spans cinema_maxq + time_machine
  + tools; one stale service-worker copy silently killed it, and three of its early exits logged
  nothing. Both are fixed, and §CPE_BUILDUP_WORK_PACED was built with the fallback from the start.

**RESUME AT:** **§CPE_JERK_SETTLED** (the LATER 2026-07-27 session-end block, near the end of this
file). Jerk and drag are both SOLVED and witnessed there; the elegant formula that solved them is
recorded as settled doctrine and must not be re-derived.

**▶ FORWARD QUEUE (agreed with the user 2026-07-29): `prompts/CINEMA_DELIGHT_BATCH.md`** — six delight
items (hover-scrub, room titles, suggested clips + suggested detours, film audio, Find→Film, speed
ramps) with costs, traps and four open questions that must be answered before building. It also names
the cost that bites first: `§CPE_REPLAN_SLOW ms=600–1000` on EVERY edit on Terminal.

**NEXT DIRECTION (agreed 2026-07-28, spec-only, nothing built): §CPE_HOSE** at the END of this file —
whole-path editing by arc-length falloff (the band and the hose unified as one gesture), §CPE_CLIP
in/out markers, and the §CPE_BUILDUP construction checkbox (= §MAXQ_TIME mode D in
`PHOTOREAL_STILL_RENDER.md`). Read its §2 ARC-LENGTH LAW first — a world-distance falloff re-introduces
the out-and-back bug that removed §CPE_DRAG_REACH in #1038.

**⚠ 2026-07-27 (later, live user run on Hospital):** OK-after-an-edit CRASHED the bake on shipped
main — `§CPE_OK_CRASH`, root-caused, fixed and witnessed 6/6 (`witness_cpe_ok_bake.js`, the first
gate that walks editor → OK → bake instead of the plan seam). Read **§CPE_OK_CRASH** at the end of
this file before anything else on this lane.

**VISION CAPTURE (2026-07-28, interim — not a spec, commits to no new build order): §CPE_VISION_CHAIN**
at the END of this file — the user's own end-to-end sequencing for where this lane goes (space-awareness
→ auto-hose → edit → buildup POC → smart markers → real schedule data later), written down so it isn't
only in one person's head. Read for context; the "still open" list at its end is real work, not decided.

---


---

## §CPE_BUILT — implemented and witnessed 2026-07-27 (`bim-ootb` `feat/cinema-path-editor` @ `bc242be`)
**Status: the model above is BUILT. All gates green except where noted.** Files: new
`viewer/cinema_path_editor.js`; `viewer/effects.js` (corner rounding + override wrapper + persistence
read); `viewer/scene.js` (`cinema_path` write + `A.three2ifc`); `viewer/cinema_maxq.js` (hook + lock
release); `viewer/sw.js` v851→v852.

### Measured results — `witness_cinema_path_editor.js` 9/9 on Duplex AND Terminal
| gate | result |
|---|---|
| G1 OK-without-edit byte-identical | `maxPoseDiff=0` (exactly zero, both buildings) |
| G2 edit changes the path, not the dive before it | `maxDelta=4.30m firstDiffT=0.3375` vs `diveEnds=0.250` |
| G3 height moves by what was asked | straight path: `[1.5000,1.5000]`, err `0.00e+0` |
| G5 control, no authored path | `authored=false route=line`, replan diff `0.00e+0` |
| **G7 no sharp corners** | **7.5°/frame** on a 90° dog-leg, cap 12 — was 19.8 ungated |
| G8 deviation ≤ measured clearance | `dev=1.70m` vs `clear=7.31m/11.35m` (Duplex), `60.00m` (Terminal) |
| G9 constant speed | length ×1.371 → time ×1.371 exactly, at 2.10 m/s (Duplex) / 4.16 m/s (Terminal) |
| G10 LOS aim → next waypoint | `aimErr=0.7°` (Duplex), `5.8°` (Terminal) |
| G12 elastic orbit | endY −4.14→−0.14; clamp fires and is logged (`requested=31.9 granted=45.0 clamped=true`) |

`witness_cinema_path_persist.js` **7/7**: G4b writes no table without an explicit save; G4 round-trips
through a REAL page reload (`_openDbBytes` navigates) at `maxPoseDiff=0.0000m`; G11 proves
`_maxqActive=false` observed from INSIDE the open editor.

### Two real defects the witnesses caught — both were silent, neither was visible in review
1. **`settle` did not follow waypoint 0.** Beats 1-2 flew to the §CINEMA_SPACE pick while Beat 3
   started from `outWp[0]`, so editing row 0 teleported the camera at the beat seam. G3 measured it
   exactly: a 1.5m edit gave `[0.000, 1.508]` — the `0.000` IS the seam.
2. **`odx/odz` still pointed along the DERIVED exit.** Beat 3's gaze falls back to it in the last
   half-metre of the walk, and Beat 4 assumes it is the direction Beat 3 ends on. With an authored
   path the gaze SNAPPED onto the old bearing: **115.2°/frame**, six times worse than the whip this
   feature set out to retire. Both fixed by re-aiming them at the authored path.

### G3's second-order term, reported not hidden
On a path WITH corners the same 1.5m height edit lands at `[1.465, 1.508]`, spread 3.5cm. Not a height
error: raising the path makes the corner fans hit different geometry, so the rounding radius — and with
it the arc-length parameterization — legitimately shifts. Gated exactly on a straight path; printed as
`INFO` on a cornered one.

### ⚠ G6 finding — 5 of 6 pre-existing cinema witnesses are ALREADY RED on `origin/main`
Verified by running each on both the branch and unmodified `origin/main`, and diffing: **byte-identical
output in every case**, so this feature regresses nothing. But the baseline itself is not green:
- `witness_cinema_orbit_v2` — **PASS** (6/6) on the branch.
- `witness_cinema_damping_bleed` — **CRASHES** on both (180s `waitForFunction` timeout at its line 65).
  This is the §CINEMA_DAMPING_BLEED witness the scope header names as must-stay-green; it cannot
  currently prove anything either way.
- `witness_cinema_exit_breathe` — 5/7 on both. Fails its own G0 precondition (`oci 0/1` — one run
  fetched from object storage, so the two runs are not the same film) and G1.
- `witness_cinema_flat_ending`, `witness_cinema_reciprocal`, `witness_cinema_glazing` — FAIL identically
  on both.
**Not fixed here — out of this file's scope, and fixing a red baseline under a feature branch would
hide which change moved which number.** Named so it is a known state, not a surprise. Note
`witness_cinema_reciprocal` needs `HHS_Office_Federated_extracted.db` present or it reports a
misleading `PLAN FAILED` that looks like a code fault.

### §CPE_LIVE — first real-browser run, user, Hospital, 2026-07-27 (`b0db992`)
**The interaction model works end to end in a real browser**, proven by the user's own pasted console:
`§CPE_OPEN waypoints=3 pathLen=29.0m speed=4.83m/s` → `§CPE_HOLD i=0 controls.enabled=false` →
`§CPE_DRAG i=1 axis=xz` → `§CPE_RELEASE why=dblclick` → `§CPE_CLOSE action=ok edited=true total=32.6s`
→ `§CPE_APPLIED total=32.6s frames=489` → bake started. Constant-speed re-timing confirmed live:
pathLen 29.0→70.4m took the film 24.0→32.6s and the frame count 360→489.

**Why Hospital shows only 3 rows** (user asked): not a limit. `§ROOM_GRAPH … exits=0`, so `§CINEMA_EXIT`
fell back to `src=db-doors`, and the graph-route branch only runs for `EXIT::` nodes. The derived route
is therefore `settle → door → outside` — 3 points, 1 corner. A building whose room graph yields exits
gets the corridor waypoints too. User's verdict: *"3 points is also good, simple just adjust intended
edges."*

**⚠ The defect the live log exposed that every witness had missed.** `_cinemaFan` returns
`CINEMA_FAN_FAR` (60) for a ray that hits nothing, so a fan hitting nothing AT ALL reports `min=60.0`:
```
§CINEMA_DIVE ... fanMin=60.0 fanMax=60.0 fanMean=60.0 ... enclosed=0%
§CINEMA_CORNERS ... rMin=15.00 rMax=15.00 maxDeviation=7.50m
```
That is **"unknown"**, not "60 metres of space" — but the rounding read it as a measurement, fell
through to the 40%-of-leg cap, and cut **7.50m inside a hand-placed waypoint**. G8 "passed" only by
comparing that cut against the same fictional 60m. **Terminal was in the same state (`2/2` corners
unmeasured), so its earlier G8 pass was vacuous too** — `clear=60.00m` was printed in the run log and
read past. Fixed: no-hit → UNKNOWN → capped at the existing 3m nudge budget (Terminal's corner radius
4.80→3.00m, deviation 2.40→1.50m), and G8 hardened so measured corners must fit the measurement while
unmeasured ones must obey the cap. **Lesson worth keeping: a sentinel value that is numerically
plausible will pass a gate that compares against it. The live run found it; the headless suite could
not, because it was grading itself with the same sentinel.**

**Log hygiene fixed in the same pass:** `§CINEMA_CORNERS` fired on every `pointermove` (dozens of
identical rows/second in the user's paste) — now only on a shape change or once a second, and it names
`unmeasuredCorners=n/m`. `§CPE_HOLD` no longer re-logs an unchanged hold. `§MAXQ_START` is printed
before the editor opens, so `§MAXQ_START_REVISED` now prints when an edit changes the frame count.

**UI feedback, user-directed same session** (*"status feedback, the buttons should pulse louder perhaps
some orange"*): held waypoint is ORANGE and breathes continuously at 12Hz — throttled deliberately, an
every-frame `markDirty()` would defeat the renderer's idle parking for as long as a point is held (63k
elements on Hospital). A 300ms settle was wrong here: a frozen canvas with a static dot is exactly the
state that reads as a hang. Buttons now carry the status — OK turns orange and breathes when an edit is
queued, "Save this path" lights only when there is something to save, reports `Path saved` and does NOT
close the editor (staging is not recording), and a state line answers "what happens if I stop now?".
Blue waypoints kept clearly visible — the user initially read them as non-functional, then corrected
themselves (*"those 2 blue dots is part of the scene"*), so they are secondary, not de-emphasised away.

### Still open on this lane
- ~~The editor has not been driven by hand in a real browser~~ — **DONE 2026-07-27, see §CPE_LIVE.**
  Still unexercised by hand: ctrl+drag (height), the total-seconds field, and "Save this path" →
  `Ctrl+S` → reopen. Only xz-drag, row-click hold and double-click release have live evidence.
- `witness_cinema_path_editor.js` runs Duplex + Terminal only. Hospital/JKR/LTU_AHouse unrun.

## §CPE_SCREEN_PLANE — BUILT (user, 2026-07-27). Supersedes model items 13-17
> *"Whenever user touch canvas, it reacts without double click... user does that to adjust it to be
> 'facing' so that the dot when moved is merely facing X/Y ranging. Ie the dot when touched, can only
> move in that Xy sense."* … *"u only move up/down left/right, thus u merely adjust your canvas to be
> facing correctly first."*

**The canvas is NEVER frozen.** A drag on a handle moves it in the CAMERA'S OWN VIEW PLANE; everything
else falls through to OrbitControls. Drag and orbit are told apart by the hit-test on pointerdown, not
by a mode.

Why this is better than what it replaced: the freeze only ever existed because dragging and orbiting
competed for one gesture. Resolving that by hit-test instead of by mode **deletes** the freeze, the
double-click release, the touch double-tap, and ctrl+drag-for-height — height is now just a drag from
a side view. Mobile works for free, since nothing depends on a modifier key. Item 17 ("the held state
must be unmistakable, a frozen canvas reads as a hang") is moot: nothing freezes.

### Grab zones — BUILT as specified, with one cosmetic gap
User check, 2026-07-27: *"touching pipe end will pivot its end. Touching mid will take whole length
without pivoting."* **That behaviour is in and verified on merged main:**
`zones = [{p:e[0],z:'a'}, {p:b.c,z:'mid'}, {p:e[1],z:'b'}]`; an end calls `_rotateAbout(b, d.z==='b', p)`
(pivot about the far end, length invariant), `mid` translates the whole band.

⚠ **Cosmetic gap, NOT behavioural — the only thing outstanding on the editor.** The *band* is drawn as
a thin line (`_mkLine`); only the *film* is drawn as a tube. So you grab a small sphere sitting at the
band's end rather than the pipe end itself. Functionally identical today because a band is only
~1–1.3m, so its three spheres span it — but it does not READ as a pipe with grabbable ends, which is
how the user describes it. Fix is small: render each band with `TubeGeometry` at a slightly larger
radius than the film tube, and extend the hit-test from three points to "nearest third of the band's
screen-space length" so the whole pipe is grabbable rather than three dots on it.

**Inherent cost, accepted by the user:** from a top-down view you cannot change height, and from a side
view you cannot move along the view axis. Some moves take two steps — orbit, then drag. That IS the
workflow, not a defect.

## §CPE_PACING_BUILT — derived duration, BUILT and MEASURED 2026-07-27
Every beat is now a measured distance or angle over a stated rate. Frame count follows the plan
(`cinema_maxq` derives `nFrames` from `plan.naturalTotal`) instead of setting it.

| beat | rate | source quantity |
|---|---|---|
| walk | `CINEMA_WALK_MPS` 1.3 m/s | flown path length |
| pull-back | `CINEMA_PULLBACK_MPS` 6.5 m/s | orbitRadius − exit radius |
| dive | `CINEMA_DIVE_MPS` 20 m/s | approach distance, **capped at the envelope** |
| spin | `CINEMA_TURN_DPS` 45°/s | turn angle, **capped at 180°** |
| orbit | `CINEMA_TURN_DPS` 45°/s | one 360° lap = 8.0s |

Beat FRACTIONS are derived-seconds over the natural total, so they no longer depend on `durationSec`
at all — which is what makes "set the total and the whole clip scales uniformly" true by construction
rather than by arithmetic in the editor.

### ⚠ dive distance and spin angle are NOT building properties
They are properties of **where the user was standing** when Alt+C was pressed. Measured on
LTU_AHouse: a **746m approach** and a **522° spin**, producing a 93.6s film of which 37.3s was dive and
11.6s spin. Pacing them raw makes runtime depend on the user's pose, which contradicts the entire
premise. Hence the caps — approach at the envelope, spin at a half turn (the most ever needed to face
anywhere). This distinction is the real finding of the pacing work: **walk and pull-back are building
properties; dive and spin are pose properties; the orbit is a constant lap.**

### Measured derived totals (2026-07-27, warm headless rig)
| building | total | frames@15 | dive | spin | walk | pull-back | orbit |
|---|---|---|---|---|---|---|---|
| Duplex (DX) | **26.1s** | 392 | 2.5 | 0.8 | 9.7 | 5.1 | 8.0 |
| JKR | 32.8s | 492 | 3.0 | 1.0 | 14.3 | 6.5 | 8.0 |
| Terminal | 39.1s | 586 | 3.4 | 0.8 | 19.5 | 7.4 | 8.0 |
| LTU_AHouse (LTU) | **55.4s** | 832 | 6.7 | 4.0 | 23.0 | 13.7 | 8.0 |

### 🔎 WHAT TO LOOK AT NEXT — the totals do not match the ~15s/~40s expectation
Duplex lands at 26.1s against ~15s; LTU at 55.4s against ~40s. **The ratio is right (2.1× vs the
expected 2.7×); the offset is not.** The arithmetic says exactly where it goes: walk + pull-back ALONE
give **14.8s and 36.7s** — almost exactly the expectation. Everything above that is dive + spin +
orbit, and the **orbit's fixed 8.0s lap is the single largest constant on a small building** (8 of
Duplex's 26.1s).
So the open question is not "derived or fixed" — that is settled and built — but **whether the orbit
lap and the arrival belong inside the number the user was picturing.** Three ways to close it, none
picked:
1. The expectation counted only the interior act + recede; the orbit is extra. Nothing to change —
   just report totals split as "film 14.8s + orbit 8s".
2. The orbit lap should be faster on small buildings (rate scaled by envelope rather than a constant
   45°/s).
3. `CINEMA_WALK_MPS` / `CINEMA_PULLBACK_MPS` want tuning together, which moves both endpoints.
**Measure before choosing** — the table above is the baseline to move against.

## §CPE_BANDS_BUILT — implemented and witnessed 2026-07-27 (`feat/cinema-path-editor` @ `5eb69df`)
All of §CPE_BANDS below is BUILT, plus the full-film tube. New file gates:
`witness_cinema_bands.js` **6/6 on Duplex AND Terminal** — these REPLACE G7/G8/G10, which assumed
corner-fillet geometry over free waypoints; that green was re-earned, not carried.
`witness_cinema_path_editor.js` 9/9 both (loose waypoints still supported).
`witness_cinema_path_persist.js` 7/7 against the 3-band schema, round-trip through a real page reload.
`witness_cinema_orbit_v2.js` PASS (regression check on the shipped derived path).

| gate | result |
|---|---|
| B1/B2 bands flown straight at exactly their authored length | err ≤ 2.2e-16, nothing inserted inside a band |
| B3 curve leaves/arrives ALONG each band direction | ≤ 10° at every join |
| B4 connector bow ≤ measured clearance (or the conservative cap where unknown) | bow 0.26–0.29m vs clearance 0.86m |
| B5 no sharp corners, seeded layout | ≤ 12°/frame cap met on both buildings |
| B6 fold | 3 bands → 6 waypoints → flown as authored |
| B7 LOS runs along the band | passes outside the deliberate look-back blend |

### ⚠ THREE LATENT DEFECTS IN SHIPPED CODE, exposed by band geometry — all measured, all fixed
None of these were introduced by bands; bands merely reached them. Each was predicted arithmetically
and then confirmed against a measurement, per the FUNDAMENTAL LAW.
1. **`_cinemaGazeBlend` chose the look-back's turn direction with a PER-FRAME test.** The frame
   `|dYaw|` crossed `CINEMA_TURN_ANTIPODAL_RAD`, `dYaw` moved by 2π and the gaze snapped by `2π × w`.
   At the observed frame `e3=0.906` → `turnW3=0.341` → predicted `2π × 0.341 = 123°`; **measured
   118°/frame**. Fixed by taking the representative of the raw delta NEAREST a per-plan reference —
   continuous, and still lands exactly on the pivot bearing at w=1 (which Beat 4's handoff needs).
   ⚠ A first attempt (freezing the plus-way branch as a per-plan constant) made it WORSE — 178°/frame,
   sustained. Recorded so nobody retries it.
2. **The look-ahead collapse guard measured HORIZONTAL distance only.** Any near-vertical stretch of
   path tripped it while the look-ahead was metres away — just above rather than ahead. Terminal's
   walk-out climbs ~17m with x/z barely moving: target jumped `(-0.80,-6.19,-1.14)` →
   `(-21.82,-25.65,-1.67)`, **113°/frame at t=0.411**. Now a 3D test — what the guard always meant.
3. **The spin's destination bearing came from the next waypoint even with no horizontal baseline.**
   With bands that waypoint is the settle band's own far end, short and near-vertical → **27°/frame at
   the Beat2→3 seam**. Guarded with the same 0.5m the look-ahead guard uses; a normal door-length
   first leg is untouched, so the derived film is unchanged there.

**Net:** seeded band path went 118 → **9.8°/frame** (Duplex), i.e. bands now fly *smoother than the
derived route* (9.8 vs 12.5). Terminal derived measures 11.3.

**Behaviour change to be aware of:** fix (2) alters the DERIVED film on any building whose walk-out
has a near-vertical stretch (Terminal does). That is a defect removal, not a regression — but it is a
visible change, so do not expect frame-identical output to pre-`5eb69df` on such buildings.

### Residual, NOT gated
An adversarial layout (three bands aimed away from each other, forcing the path to double back twice)
peaks at **30.9°/frame** with a total turn of ~365° over 89 frames (mean 4.1). Printed as `INFO` by
the witness rather than gated: a near-reversal genuinely cannot be flown as gently as a normal route,
and pretending otherwise would mean weakening the gate that protects the realistic case. Revisit only
if a real user path hits it.

## §CPE_BANDS — the spec (settled with the user 2026-07-27) — IMPLEMENTED, see above
**Read this before touching the editor again.** Settled in discussion; user quotes inline. Supersedes
the "3 draggable points" shape in §CINEMA_PATH_EDITOR_MODEL — the *data model* (waypoints only, LOS
aim, constant speed) is unchanged; what changes is that each anchor becomes a rigid **band**.

### The idea
> *"Let the first not a point but a band... a stretch say about 5% of the inside... so is the exit...
> by manipulating that, u can have creative curves"*

A point gives position only. A band gives position **and direction** — its two ends are a tangent, and
tangents are what actually shape a curve. That is the whole reason this is worth building.

### The rules (all settled, do not re-litigate)
1. **Three bands, one per existing anchor:** settle, wp1(exit door), stop. No bands added or removed.
2. **A band is a SHORT STRAIGHT segment.** > *"the bands are short straight parts of the path. When
   they are moved their length and straightness does not morph.. keep that steady for now."*
   Rigid. Dragging never bends or resizes one.
3. **Grab zones:** > *"when clicking on one end it pivots.. in the middle it is the whole length moving
   as one."* End = pure ROTATION about the far end (not a resize — length is invariant).
   Middle = translation of the whole band.
4. **Length is therefore NOT draggable** → it needs a number field on the row. The "5% of the inside"
   seed is the actual length, not just a starting size (I initially got this wrong and was corrected).
5. **6 waypoints, folded into 3 rows.** > *"in a way the 3 bands are actually 6 waypoints"* … *"but
   efficiently folded into 3."* The table stays 3 rows. The flown path expands to 6 points at plan
   time, flies, and discards them.
6. **STORE 3 BANDS, NOT 6 POINTS.** `cinema_path` becomes 3 rows of (anchor xyz, direction, length).
   Rigidity then survives save/reload **structurally** — six free points would just be six points, free
   to bend apart on the next session. Safe to change the schema: no building in the wild has the table
   (every restore to date logs `§CINEMA_PATH_RESTORE none`).
7. **Bands are highly movable, and the path must re-form.** > *"user can drag it to a far end, the path
   has to bounce back."* No placement limits. Connector curvature scales with its own span, so a 5m gap
   and a 60m gap both read as one continuous curve.
8. **Authored is authored.** Drag a band through a wall and the camera goes through the wall — the same
   settled doctrine that already governs the derived straight-line route, and it applies more strongly
   to a point placed by hand. Do not add collision fighting.

### Geometry consequences — this REPLACES the corner-fillet approach
- **No rounding INSIDE a band** — that is the straight part; rounding it is the morphing rule 2 forbids.
- **The connector between two bands is tangent-matched at BOTH ends**: it leaves a band along that
  band's own direction and arrives at the next along that one's. A cubic Hermite whose tangents ARE the
  band directions and whose handle length scales with the span. If the connector arrives from any other
  direction you get a kink exactly at the band end — the opposite of the goal.
- The `A.cinemaFan` clearance bound still caps how far a connector may bow. Note it is WEAK outside
  (the fan sees no geometry there, so the conservative cap applies, not a measurement — see §CPE_LIVE).
- `_cinemaRoundCorners` (effects.js) is therefore superseded for the authored path; keep it for the
  derived path or replace both, but do not run it across band interiors.

### Still open on bands
- **Does the camera TRAVEL the settle band during the spin?** Asked, not answered. Travelling it gives
  the drift-and-look that the settled *"no robotic abrupt stop and turn"* ruling asks for, but changes a
  beat that has existing witnesses. My recommendation: travel it, after first confirming no witness
  asserts a stationary spin.
- Dive origin and orbit are still NOT authorable. §CPE_LIVE's complaint is only half closed by the tube
  (visible ≠ editable). Decide later whether they become bands 4 and 5.

### Also asked, also NOT YET BUILT — the full-film tube
> *"the whole flight path must be visible… Render the FULL path as one continuous highlighted curve —
> dive origin → settle → wp1 → stop → orbit… Dragging any of the three must re-derive and re-render
> that whole curve live."* And: *"the flight path should a thicker perhaps blue/yellow pipe depending on
> background colour to contrast."*

Draw it by sampling `plan.poseAt(t)` across t=0..1 — that curve IS the flown film, so it cannot drift
from what the bake flies. Tube geometry, colour chosen against background luminance (yellow on dark,
blue on light), re-checked on background toggle.
**Perf is NOT a blocker — measured, warm:** re-plan 13ms Duplex, 82ms Terminal; sampling 240 poses
0.3ms. (The `§CINEMA_PLAN_MS 456.8` in a live log was a COLD first plan — do not design around it.)

### Engineering risk assessment (asked directly: "is the engineering of the 3 bands an issue?")
Not mathematically. The constrained Hermite is craft, not research. The real risks are process:
1. **G7/G8/G10 are invalidated by construction** — they assume free waypoints + corner fillets. That
   green is RE-EARNED, not carried. Rewrite them for band+connector before claiming the feature works.
2. **Another session owns `_cinemaPathPlan`'s §CINEMA_SPACE block (~L3486-3610)** — keep the footprint
   outside it, as the current implementation already does.
3. **Sequence bands and pacing separately.** Both touch timing; landed together it is impossible to say
   which change moved which number.

## §CPE_PACING — total duration must be DERIVED, not fixed (user, 2026-07-27). MEASURED, ONE DECISION OPEN
Consolidated user ask, three parts:
1. **Interior:** slower constant m/s, re-applied on every edit so dragging always retimes to hold it.
2. **Exterior:** pull back from NEAR to the final orbit distance, rather than starting far.
3. **Total:** falls out of (1) and (2) applied to each building's real geometry — not one fixed number.
   Expectation to CHECK, not to hit: small (DX) ≈ 15s, large (LTU) ≈ 40s.

### The current model is inverted — measured, not asserted
Today total is fixed (360 frames / 15fps = 24s) and speed is whatever makes the derived walk fit
`CINEMA_OUT_SEC`=6s. So **the bigger the building, the faster the camera**: Duplex 2.10 m/s, JKR 3.10,
Terminal 4.22, LTU_AHouse 4.99. Exactly backwards. Frames must become a CONSEQUENCE of duration, not
its cause (`cinema_maxq.js` currently derives duration from `nFrames`).

### Measured geometry (2026-07-27, warm, headless ANGLE rig)
| building | walk pathLen | envelope | near R | final R | pull-back | lap @finalR |
|---|---|---|---|---|---|---|
| Duplex | 12.6m | 50.0 | 11.6 | 45.0 | **33.4m** | 282.7m |
| JKR | 18.6m | 60.3 | 12.0 | 54.3 | 42.3m | 341.3m |
| Terminal | 25.3m | 67.8 | 12.9 | 61.0 | 48.1m | 383.3m |
| LTU_AHouse | 29.9m | 134.6 | 32.1 | 121.1 | **89.0m** | 761.1m |

Duplex→LTU: pull-back 2.7×, envelope 2.7×. The user's 15s→40s expectation is 2.7×. **The ratio is
already present in the real measurements** — nothing needs inventing to produce it.

### The result that decides the design
Taking ONLY the two quantities the user named — interior walk at a constant **1.3 m/s**, exterior
pull-back at **6.5 m/s**:

| | walk | pull-back | sum |
|---|---|---|---|
| Duplex | 9.7s | 5.1s | **14.8s** |
| JKR | 14.3s | 6.5s | 20.8s |
| Terminal | 19.5s | 7.4s | 26.9s |
| LTU_AHouse | 23.0s | 13.7s | **36.7s** |

14.8s vs the ~15s expectation, 36.7s vs ~40s. **These constants were not tuned to hit those numbers** —
they are measured path length and measured pull-back distance over two stated speeds.

### ⛔ THE ONE OPEN DECISION — ask the user first, do not guess
The three beats above are still FIXED: dive 6s + spin 2s + orbit 8s = **a 16s floor**, which alone
exceeds the 15s small-building expectation. Add them back unchanged and totals become 30.8s (Duplex)
and 52.7s (LTU), and the spread collapses from 2.5× to 1.7× — i.e. the expectation is only met if those
three ALSO stop being fixed seconds.
**Question put to the user, unanswered at session end:** do dive / spin / orbit become derived too —
dive paced by its real approach distance, spin by its real turn angle, orbit by a constant angular rate
— or do they stay fixed and the real totals land nearer 31s and 53s?
⚠ Note `CINEMA_DIVE_SEC`'s comment says the dive is deliberately time-boxed and *"never clamped, never
distance-proportional"* (§CINEMA_SIMPLE). Deriving it CONTRADICTS a settled ruling — that is exactly why
this is a user decision and not an implementation choice.


---

## §CINEMA_ATTIC_PICK — the dive target ⛔ REASSIGNED, NOT THIS SESSION'S (user, 2026-07-26)
> **"ignore the default attic issue — as another session is handling."**
>
> The "do this FIRST" ordering below is therefore VOID for this file's lane, and the §CINEMA_SPACE block
> in `_cinemaPathPlan` (~L3486-3610) is **another session's working set** — the path-editor work must not
> edit it. Kept below only as the reference record of what that other lane owns. The editor is designed
> so it does not care which room the picker chooses: the settle point is just waypoint 1, draggable.

<details><summary>original folded-in brief (now another session's)</summary>

**Do this FIRST, before the dialog.** Not a priority argument to re-run — the reasoning is simply that
this editor's value is inversely proportional to how often it is needed: a good default makes the
dialog a one-click OK (the differentiator), a bad default makes editing mandatory (just a worse
conventional tool). Fixing the default first also gives the dialog's G1 no-op gate something worth
being a no-op about.

**Symptom:** the dive "goes for the attic" — the camera settles in a top-level/roof void instead of a
real occupiable space.

**What the picker actually does today** (`viewer/effects.js` §CINEMA_SPACE, ~line 3386): ranks ALL
room-graph nodes with rects by `area / (1 + dCtr / (envelope*0.5))` — "largest space nearest the
centre" — takes the single top-ranked one, applies ONE enclosure sanity check, and falls to
bbox-centre if that fails. Live JKR evidence from the user's own log:
```
§CINEMA_SPACE cand=0pNy6pOyf7JPmXRLgxs3sW area=135.2 enclosed=0%   mep=0% chosen=false
§CINEMA_SPACE cand=0BTBFw6f90Nfh9rP1dlXr2 area=27.7  enclosed=100% mep=0% chosen=true (rank=2, skipped 1 disqualified above)
```
So the enclosure gate DOES fire and DOES skip candidates — meaning an attic that reads `enclosed=100%`
will win on area alone. Start by capturing the same `§CINEMA_SPACE` lines on a building that actually
exhibits the attic dive; do not theorise from JKR, which chose a 27.7 m² room.

**⚠ ANTI-DRIFT — do NOT "fix" this by adding floor-level weighting.** That was explicitly ruled out by
the user on 2026-07-20 and the ruling is quoted in the code's own comment: *"abandon the 'next largest
room' idea... It is disastrous for sure. Just back to original 'go to largest space within 4 sec'."*
There is deliberately **no** floor-level weighting and no multi-candidate search. A fix must come from
a different angle — e.g. a stronger occupiability probe (headroom, real floor beneath, reachability
from the room graph) — not from re-ranking by storey. Re-read that comment block before touching it.

</details>

## Out of scope — each has its own session, do not fold them in here
- `§STAFFAGE_PAX_REJECT tried=72 placed=3` with all rejection counters 0 — 69 unattributed
  rejections, the reason only ~3 figures ever appear. `prompts/STAFFAGE_WALKABLE_PLACEMENT.md`.
- **Scene jumping on reopen** — NOT reproduced through `_openDbBytes()` (camera 0.00 m, target
  0.00 m). Needs the user's actual repro route first.
- **D2 walk-out corner whip** — 19.8°/frame on current main, printed by the witness, not gated.
- **JKR path-crossing** — `prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` §18.

## Two small already-diagnosed items to land alongside (both root-caused, neither started)
- **Restore staffage on LOAD**, not on the first Alt+P press. The round-trip works; the trigger is
  wrong. Details + measurements: `STAFFAGE_WALKABLE_PLACEMENT.md §STAFFAGE_PERSIST` (ANSWERED section).
- **MP4 loses one pixel row** on odd-height canvases: frames grabbed at `w×h`, encoder configured at
  `(w & ~1, h & ~1)`, drawn 1:1. `cinema_maxq.js` `_stitchMp4`.

---

## §CPE_OK_CRASH — OK after an edit kills the bake (user live run, Hospital, 2026-07-27)

**SPEC FIRST. Do not implement before reading this section.** Reported by the user immediately after
§CPE_SCREEN_PLANE landed: *"satisfied the 'pipe band 2 waypoints with mid translatable' working..
however hits error when OK the editor box"*. The grab model itself is fine — the drag worked, the
editor closed, the plan re-derived. The bake is what died.

### The user's own console, the three lines that matter
```
§CPE_CLOSE action=ok edited=true total=54.4s
§CPE_LOCKS re-claimed for the bake (maxqActive=true)
§CINEMA_PATH_EDIT authored waypoints=6 (derived route replaced) orbitScale=0.991 orbitDY=-0.90m
§MAXQ_WAKELOCK acquired (screen stays awake for the bake)
[S274] §ERR_PROMISE Cannot read properties of undefined (reading 'length')
Uncaught (in promise) TypeError: ... at Object.start [as startMaxQualityOrbit] (cinema_maxq.js)
```
The re-plan SUCCEEDED — `§CINEMA_PATH_EDIT authored waypoints=6` is the edited path being flown. The
throw is one line later, in the log statement that reports what just happened.

### Root cause — a stale log line, not a stale path
`cinema_maxq.js:507` (the `§CPE_APPLIED` line) reads `_cpeRes.override.waypoints.length`. That field
**no longer exists**: §CPE_BANDS changed `cinema_path_editor.js` `_buildOverride()` to return
`{ bands, diveSec, spinSec, outSec, riseSec, _total, _naturalTotal, _scale, _pathLen }` — bands, not
waypoints. `effects.js` was ported (it reads `ov.bands` and expands via `_cinemaBandWaypoints`, which
is why the plan is correct); the one consumer in `cinema_maxq.js` was not.

**Why review missed it and the witnesses missed it:** `witness_cinema_bands.js` drives
`A.cinemaPathPlan(dur, override)` directly — the plan seam, not the bake. Nothing in the suite ever
walks the actual user path *editor OK → `start()` continues → bake*. The one line of code between
those two is exactly where the defect sat. (This is `feedback_test_real_user_path_not_seams` charging
its rent a second time.)

**Blast radius: total.** Every edited path is unbakeable on shipped main; only the untouched-OK
guardrail-2 path survives, because that branch never dereferences the override. §CPE_SCREEN_PLANE
therefore shipped a feature whose entire purpose — edit, then record — cannot complete.

### The fix
Report the count the plan actually flew, derived from the shape the editor actually returns:
`bands.length * 2` for a band override (§CPE_BANDS rule: 3 bands fold to 6 waypoints), falling back
to `waypoints.length` if a legacy loose-waypoint override is ever handed in, and to `?` if neither.
No behaviour change to the path, the plan or the bake — this is a log line, and it must stay one.

### Witness — `witness_cpe_ok_bake.js`, the missing user path
Runs Duplex + Terminal. Each gate names what it proves or disproves:
- **K1 (the reported crash)** — open the real editor, KEY a real band edit (the `y` field, the same
  state mutation a drag makes), click the real `#cpe-ok`, and let `start()` continue. PASS = zero
  page errors and the run reaches the bake. FAIL = the `TypeError` above. This gate is RED on
  `origin/main` by construction; if it is not, the fix is not the fix.
- **K2 (the log tells the truth)** — `§CPE_APPLIED waypoints=N` must EQUAL the `N` in the
  `§CINEMA_PATH_EDIT authored waypoints=N` printed by the plan it just built. Not crashing is not
  enough: a hardcoded `0` would also not crash and would lie in every future bug report.
- **K3 (guardrail 2 unbroken)** — OK with NO edit still reaches the bake and still logs
  `§CPE_APPLIED none`. Proves the fix did not move the crash into the other branch.
- The bake is cancelled at frame 0 (`startMaxQualityOrbit()` re-entry sets `_cancel`) so the gate
  costs seconds, not the full cook. Reaching `§MAXQ_IDB_READY`/`§MAXQ_CANCEL i=0` IS "reached the
  bake" — everything past line 507 that the crash denied.

### Measured — RED then GREEN, same rig, same gates (2026-07-27, `fix/cpe-ok-override-crash`)
Headless ANGLE/SwiftShader, local server on 8402, real editor DOM, real `startMaxQualityOrbit`.

**On `origin/main` (unpatched), Duplex — 1/3:**
```
FAIL K1  editorOpened=true edit=-0.47→1.03m reachedBake=false pageErrors=1
         ← THE REPORTED CRASH: Cannot read properties of undefined (reading 'length')
         applied: (§CPE_APPLIED never printed)
FAIL K2  §CPE_APPLIED waypoints=n/a vs §CINEMA_PATH_EDIT authored waypoints=6
PASS K3  untouched OK reaches the bake — the crash only ever hit EDITED paths
```
**With the fix — 3/3 Duplex AND 3/3 Terminal:**
```
Duplex    K1 reachedBake=true pageErrors=0 | §CPE_APPLIED total=26.5s frames=26 waypoints=6
Terminal  K1 reachedBake=true pageErrors=0 | §CPE_APPLIED total=40.1s frames=40 waypoints=6
both      K2 §CPE_APPLIED waypoints=6 == §CINEMA_PATH_EDIT authored waypoints=6
both      K3 §CPE_APPLIED none — derived plan unchanged
```
K3 passing RED is the diagnosis in one line: only the edited branch dereferenced the dead field.
Regression: `witness_cinema_bands.js` **6/6** on Duplex, unchanged.

### The bug reporter half — NOT this branch
The user's next sentence (*"Error submission hits error in Gmail should have send via GH"*) is the
same defect class — the mailto path had no URL length cap while the GitHub path has capped at 8000
since §S280 — but it is **owned by another session and already shipped as PR #1028** (cascades the
log-line count until the URL fits ~1800 chars; measured 8202 → 1561). Do not re-fix it here.

---

## §CPE_PANEL_DRAG — the editor panel is draggable (user, 2026-07-27)

User, after firing a full run: *"happy with how editor behaves.. but can u make the editor panel
draggable"*. The panel is anchored `position:fixed; top:60px; right:12px` and covers a fixed 412px
strip of the viewport — exactly where the bands often sit once the user has orbited to face the axes
they want to drag in (§CPE_SCREEN_PLANE makes "turn to face the plane" the normal gesture, so the
panel WILL end up over the handles).

### Reuse, do not invent — this is model item 14's rule applied to the panel itself
`A._makeDraggable(el)` (`measure.js:13`) is this viewer's ONE panel-drag utility: ~10 panels already
use it (`navigate_find`, `panels`, `issues`, `clash_matrix`, `grid_overlay`, `print_sheet`, `hba_lens`,
`measure` ×2). It grabs the top `el._dragStrip` px (30 desktop / 50 mobile, overridable), arms on
pointerdown but only captures after 4px of movement (so a stationary tap still reaches child
controls), and switches the panel from its right-anchor to free `left/top`. **Do not write a second
one**, and do not edit `_makeDraggable` — it is shared by every one of those panels.

Applied here as: the header div gets `id="cpe-title"` + `cursor:move`, and `_dragStrip = 36` so the
grab zone is exactly the header — the rows below it carry number inputs whose keyed edits must never
fling the panel.

### Why this cannot disturb the path — the thing actually worth gating
`_wire()` installs `pointermove`/`pointerup` on **window** (capture phase). Those are the handlers
that move a band. They are guarded by `_state.drag`, which is only ever set by `h.down` — and `h.down`
is bound to **the canvas alone**. So a header drag cannot become a band drag. That is an argument;
the witness makes it a measurement.

### Scope note, stated not smuggled
Beyond the literal ask, the dragged position is **remembered for the session** (module-scope
`_panelPos`, re-applied on the next open). A panel that forgets where you put it every time Alt+M
re-opens it is a half-feature. It is three lines, it is gated (D4), and it is called out here rather
than slipped in. Nothing is persisted to the DB — this is not `cinema_path` state.

### Witness — `witness_cpe_panel_drag.js`, Duplex + Terminal
- **D1 the ask** — pointerdown on `#cpe-title`, move by a known (dx, dy), pointerup: the panel's
  `getBoundingClientRect()` must have moved by EXACTLY that delta (±1px). Proves the drag is wired
  and 1:1 — a scaled or offset drag would still "look draggable" and be wrong under the hand.
- **D2 the risk** — that same drag must leave the path untouched: **no `§CPE_DRAG` line**, and band
  centres bit-identical before and after. Disproves the window-level-handler collision above.
- **D3 the grab zone** — an identical drag started on a ROW (below the strip) must NOT move the
  panel. Proves keyed edits and row clicks can't fling it.
- **D4 the scope note** — after close and re-open, the panel is back where the user left it.

### Measured — 4/4 Duplex AND 4/4 Terminal (2026-07-27, `feat/cpe-draggable-panel`)
```
D1  panel (976,60) -> (1156,180) = moved (180.0,120.0), asked (180,120)
    §CPE_PANEL_DRAGGABLE handle=cpe-title strip=36 at default anchor
    §CPE_PANEL_MOVED dx=180 dy=120 left=1156 top=180 (remembered for this session)
D2  §CPE_DRAG lines 0 -> 0 | band centres IDENTICAL before and after
D3  panel (1156,180) -> (1156,180) = moved (0.0,0.0) when the drag starts on a row
D4  left at (1156,180), re-opened at (1156,180)
```
**A witness bug worth recording, since it will bite the next puppeteer gate here:**
`page.evaluate(() => window.APP.startMaxQualityOrbit(...))` with a CONCISE arrow body RETURNS the
bake's promise, so `evaluate` waits for the entire cook and dies on `protocolTimeout` after 180s —
it looks exactly like a hung viewer. Use a BLOCK body (`() => { ...; }`) so nothing is returned.

---

## §CPE_SAVED_PATH_LIFECYCLE — "when Saved the edited path, how do we open it?" (user, 2026-07-27)

Answered from the code, end to end. **There is no "open" action, by design — a saved path is not a
document you load, it is state the plan picks up.**

| step | what actually happens | log line |
|---|---|---|
| "Save this path" | `cinema_path_editor.js:664` → `A.stageCinemaPath(_buildOverride())` sets `A._cinemaPathEdit` **in memory only**. Editor stays open — staging is not closing. | `§CINEMA_PATH_STAGE` |
| **Ctrl+S** (Save Building; `scene.js:2136`, also the panel item at `panels.js:1302`) | `A.saveModelDb()` → `_exportBuildingDb()` → `_writeCinemaPathTable()` drops+rewrites a `cinema_path` table — one row per band (IFC anchor, unit dir, length) plus the beat seconds. | `§CINEMA_PATH_SAVE bands=3 total=…s` |
| next Alt+M on that file | `A.cinemaPathPlan()` calls `_cpeLoadFromDb()` **lazily at the first plan** — before anything can observe the derived route — and rebuilds the bands. The editor then opens on the user's path. | `§CINEMA_PATH_RESTORE bands=3 total=…s — authored path in force` (or `none (no cinema_path table) — derived path`) |

### Two consequences the user needs stated, not discovered
1. **It is per-FILE, and a building served from OCI is read-only.** Ctrl+S produces a downloaded
   `.db` via Save-As; the path lives in that local copy. Loading the OCI URL again gets the derived
   path — nothing writes back to the bucket. (Same shape as `staffage_instances`; not a new rule.)
2. **⛔ No UI drops a saved path.** `A.clearCinemaPath()` exists and logs `§CINEMA_PATH_CLEAR`, but
   NOTHING calls it — console only. So once a file carries `cinema_path`, every Alt+M authors from it
   until it is cleared by hand. **Named as a gap and offered to the user; not built unprompted.**
   If picked up: a "Use derived path" button in the editor next to "Save this path" is the whole job.

### One defect found while reading this path — FIXED
`A.stageCinemaPath` logged `waypoints=' + (ov.waypoints ? … : 0)` → a flat **`waypoints=0` on every
save**. Same stale-field species as §CPE_OK_CRASH (§CPE_BANDS replaced `waypoints` with `bands`), but
GUARDED, so it never threw and therefore never got noticed. Now reports `bands=3 waypoints=6` and says
outright that staging is not saving. Worth noting as a pattern: the crash was found in one afternoon
because it threw; its silent twin sat in the same feature untouched. **When a field is renamed, grep
every consumer — the guarded ones are the ones that survive to lie later.**

---

# 2026-07-27 (evening) — three items from the user's second live Hospital run

**RESUME HERE.** Two defects + one agreed-for-later design, all three raised by the user after a full
edit→OK→bake on Hospital. §CPE_PREVIEW_DIVERGENCE is the lead for both defects and is ALREADY
MEASURED in the user's own pasted console — read it first.

## §CPE_PREVIEW_DIVERGENCE — the baked film is NOT the film the user authored ⚠ MEASURED, NOT FIXED

The user's report for item 1 is *"It has a frame jump"*. Before touching curvature, look at this,
because it is bigger than a corner: **the plan built when the editor closes differs from the plan the
user was editing against — in the pivot, the dive and the spin.** Straight from their console, same
session, minutes apart:

| | while editing (every live re-plan) | after OK, the plan that BAKES |
|---|---|---|
| `§CINEMA_PIVOT src` | `arc-bbox-centre` pivot=(-7.3,-2.8,18.0) | **`controls-target(plausible)`** pivot=(0.0,0.0,-0.0) |
| `§CINEMA_DIVE` | `diveDist=14.2m` yaw0=-163.2° pitch0=4.2° | **`diveDist=77.2m`** yaw0=90.2° pitch0=-48.1° |
| `§CINEMA_SPIN` | `dYawRawDeg=11.4 class=already-facing(no-spin) finalSpinDeg=0.0` | **`dYawRawDeg=118.1 direct-turn finalSpinDeg=118.1`** |
| `§CINEMA_EXIT facingDot` | `0.980` | **`-0.471`** |
| `§CINEMA_PACING` | `natural=99.1s = dive 2.5 + spin 0.8 + walk 71.2 + pullback 16.7 + orbit 8.0` | `natural=99.9s = dive 3.9 + **spin 2.6** + walk 71.2 + pullback 14.3 + orbit 8.0` |

**The user previewed a film with no spin at all and got one that turns 118° at the start.** This is
not a subtle regression — it is the first two beats of every edited film. It reproduces in the
EARLIER Hospital run too (preview `arc-bbox-centre`/dive 25.4m/spin 45.8° → bake
`controls-target`/dive 62.8m/spin 107.8°), so it is not a one-off.

**Lead, to be confirmed not assumed:** `finish()` restores the camera to `_state.camSave` and calls
`a.controls.update()` before resolving. The pivot picker then sees a DIFFERENT `controls.target` than
the one in force during editing and switches source from `arc-bbox-centre` to
`controls-target(plausible)` — pivot (0,0,-0) is suspiciously the origin, i.e. a target that was never
re-aimed. Everything downstream (dive distance, `facingDot`, the spin) is derived from the pivot, so
one wrong branch moves all of them together, exactly as the table shows.

**Verify like this, numerically:** capture `A.controls.target` + `A.camera.position` at editor OPEN,
at every live re-plan, and immediately before the post-OK `cinemaPathPlan` call; log them as one
`§CPE_PIVOT_TRACE` line. If the target at bake ≠ the target during editing, that is the defect and
the fix is to plan the bake against the SAME pivot input the editor previewed — not to re-derive it.
**Gate: `§CINEMA_PIVOT src` and `diveDist` must be identical in the last editing re-plan and in the
post-OK plan.** Until that is true, no amount of corner smoothing will make the film match the preview.

### ✅ FIXED AND WITNESSED 2026-07-27 — `witness_cpe_preview_divergence.js` 3/3 Duplex + 3/3 Terminal

**The witness found it is BROADER than the pivot branch.** On Duplex the pivot `src` stayed the same
in both plans and the film still diverged:
```
RED (origin/main), Duplex — camera dollied 93.3m -> 23.3m from target mid-edit
  FAIL P1  editor: pivot=controls-target @0,0,0  dive=21.7m   spin=0.0deg
           bake:   pivot=controls-target @0,0,0  dive=91.3m   spin=0.0deg     <- 4.2x
  PASS P3  untouched camera: editor and bake agree exactly (91.3m both)
```
`diveDist` is measured from the LIVE camera to the settle point, so **any** camera movement while the
editor is open rewrites the film's opening beat — the pivot-branch flip the user hit on Hospital is
one extra symptom stacked on top, not the whole defect. P3 passing RED is the proof of mechanism:
leave the camera alone and the two agree to the metre.

**Fix:** an explicit `_camBasis` on the plan wrapper. Every editor re-plan is pinned to the camera
pose captured at editor OPEN — which is the pose the bake plans from, because `finish()` restores
exactly that before resolving. Same "set inputs, call the untouched `_cinemaPathPlan`, restore in
`finally`" pattern the beat-second overrides already use; the 600-line plan function is not touched.
The basis rides a COPY of the override, never the override itself — `_buildOverride()` is also what
"Save this path" stages, and pinning a STORED path to one session's camera would be this same bug
inverted. New log line: `§CPE_CAM_BASIS`.

```
GREEN  Duplex    editor dive=91.3m spin=0.0deg  ==  bake dive=91.3m spin=0.0deg   (dollied 93.3->23.3m)
       Terminal  editor dive=143.7m spin=57.9deg == bake dive=143.7m spin=57.9deg (dollied 119.9->30.0m)
       P2 3 re-plans across a large camera move -> 1 distinct pivot on both buildings
       P3 no-move regression clean on both
```
**Second property, free and arguably the bigger one:** looking at the path from another angle can no
longer change the path. §CPE_SCREEN_PLANE *tells* the user to orbit before dragging, so the previous
behaviour meant the documented gesture silently rewrote the film.

## §CPE_EVEN_TURN — item 1 proper: no sharp turns, no camera discontinuity

User: *"if the pipe is facing another way and then ensuing path is a sharp turn, it has to be even
curved out to never have any sharp sudden turns. And the ensuing frames connected do not jump the
camera pos/pov that breaks continuity."*

Two separate obligations, gate them separately:
1. **Position C1** — the flown curve must not kink at a band join. `§CPE_BANDS` B3 already gates
   tangent continuity, so the mechanism exists; what the user hit is the connector being *allowed
   too little room to turn*. Their log: `§CINEMA_BANDS ... maxBow=2.13m **unmeasuredJoins=2/2**` —
   BOTH connectors fell back to the conservative no-hit cap (`nudgeCap=3`) because the fan measured
   nothing, so a hard direction change had to be crammed into a bounded bow. **That is the knob**:
   when clearance is genuinely unknown, a conservative bow is the safe choice for a WALL and the
   wrong choice for a TURN. Decide what an unmeasured join should do — measured clearance stays
   authoritative wherever the fan does return a hit.
2. **Gaze C1** — the per-frame camera turn rate. The existing number to beat is the ungated
   **D2 walk-out corner whip: 19.8°/frame**, and `witness_cinema_bands.js` B5 caps the seeded layout
   at 12°/frame (adversarial layout measured 12.1). The user's edited layout is closer to adversarial
   than to seeded, which is consistent with a visible jump.
**Gate:** peak deg/frame AND peak metres/frame across the WHOLE film (not just the walk) on a
user-shaped edited path, with the §CPE_PREVIEW_DIVERGENCE fix in place — a 118° phantom spin would
otherwise dominate any number this gate produces. Report both peaks and where in `u` they fall.

### 🔬 MEASURED 2026-07-27 — `witness_cpe_even_turn.js`. TWO HYPOTHESES TRIED, BOTH DISPROVEN

**Instrument committed, fix NOT — nothing shipped from this pass.** The witness is the value here: it
turned "sharp jerk" into numbers, and those numbers killed the two obvious fixes before either
reached a PR. Current measured baseline on `origin/main`, hostile 3-band layout (bands aimed apart):
```
Duplex    T2 peak = 29.1 deg/frame at u=0.281   (839deg total / 360 frames, mean 2.3)
Terminal  T2 peak = 70.2 deg/frame at u=0.370   (879deg total / 360 frames, mean 2.4)
          seeded (non-hostile) layouts: 7.6 and 7.8 deg/frame — comfortably under the 12 cap
```

**Hypothesis 1 — "the no-hit bow cap crams the corner." DISPROVEN, the cap never binds.**
Built it (probe the join along its own bow direction with `A.cinemaLookDist` instead of falling back
to the 3m sentinel cap — deliberately NOT re-reading `CINEMA_FAN_FAR` as space, per §CPE_LIVE), then
measured what was actually binding:
```
Duplex    bow 0.26m / 0.29m  against MEASURED clearance 0.86m / 0.87m
Terminal  bow 0.74m / 0.67m  against the 3m cap, and the bow ray ALSO returns 60.00 (no hit)
```
**Every bow is far under its own budget.** `k` never shrinks, so the cap is not in play on either
building. The corner is sharp because the connector SPAN is short relative to the direction change,
not because the bow was crammed. Reverted rather than shipped: unexercised code behind a vacuous gate
is exactly what §CPE_LIVE's lesson warns about.

**Hypothesis 2 — "average the gaze look-ahead across its window." DISPROVEN, made it WORSE.**
`ah = _outPos(e3 + 0.15)` is one point at the window's far edge; replacing it with the mean of 5
samples across the window measured **29.1 → 37.0 deg/frame on Duplex**. Reason, and it is general:
on a path that DOUBLES BACK the window straddles the fold, so the mean lands near the fold itself —
close to the camera — and a short look vector has an unstable direction. **A positional low-pass is
the wrong instrument for a reversing path.** Do not retry this.

### ➡ WHERE THIS GOES: fold §CPE_EVEN_TURN INTO §CPE_PACE_LOS — they are one problem
`deg/frame = (deg/metre) × (metres/frame)`. The geometry term is the user's own authored layout and
is theirs to choose; the only other lever is **metres per frame**. So "never have any sharp sudden
turns" is delivered by *spending more frames where the direction changes fast* — which is the user's
own rule (*"if too much is happening, slow down"*) with **turn rate as one of the busyness terms**,
alongside the fan hit-fraction. One mechanism satisfies both items; building them separately would
be two systems fighting over the same frames.
**Revised gate for the combined work:** T2 (peak deg/frame under cap on a hostile layout) must go
green *because* the pace slowed there — reported together with the m/frame at that same `u`, so the
gate shows the mechanism and not just the outcome.

## §CPE_PACE_LOS — item 2: even speed inside, brake only for what is actually ahead

User: *"too slow and thus gives uneven speed. It has to maintain same speed inside building and apply
brake when too near or facing an object not to crash into or zoom past but slows down just abit not
overdoing."*

**Measured:** `CINEMA_WALK_MPS = 1.3` (`effects.js:3319`) is a flat constant with no proximity term
at all. Their edited walk was **92.5 m ⇒ 71.2 s of the 99.5 s film (72%)** at that fixed pace, and
1492 frames — at the ~4.6 s/frame their §MAXQ_FRAME reported, ≈1.9 hours of cook. The runaway bake
they saw is a straight consequence of the pace, not a separate bug.

**The brake the user is describing ALREADY EXISTS — do not invent a second one.** `tour.js:1111-1165`
carries §INTERIOR_PACING / §INTERIOR_PACING_LOS, settled with this same user on 2026-07-25/26:
- `_invPace(d, ref, min)` — *"the simple inverse formula"*, far ⇒ fast, near ⇒ slow;
- `_losPace(pts, i)` — a SINGLE forward raycast along the leg via the already-exposed
  `A.cinemaLookDist`, `REF=3m` reads as neutral — chosen precisely because an omnidirectional fan-min
  braked for furniture off to the side (the courtyard bug);
- **`PACE_SWING = 1.6`, ONE knob**, symmetric: `MIN=1/1.6`, `MAX=1.6`. This is literally the user's
  *"slows down just abit not overdoing"*, already tuned with them across three live-review rounds;
- `_paceBuildRemap` redistributes time along the path AND rescales the total via `meanFactor`.
It is wired to Fly Tour's flyPath/moveTo/orbit and **not** to the cinema walk-out.

**The work:** raise the cinema base pace (1.3 m/s is a literal pedestrian and the user has now twice
called the result too slow), then apply the EXISTING remap to the walk beat. Two constants, one
reused module — not a new pacing system.
### ⚠ AMENDMENT (user, same evening) — the signal is SCENE BUSYNESS, not just distance ahead
> *"The simple rule is scene busy or noise.. if too much is happening, slow down"*

**This supersedes a pure-LOS reading of the section above.** LOS distance answers *"am I about to hit
something"*; it does NOT answer *"is there a lot going on in this shot"*. A camera crossing a wide but
densely furnished plant room is not close to anything and still deserves to slow down, because there
is something to look at. Distance-ahead alone would fly it.

**Do NOT resolve this by bringing back the omnidirectional fan-MIN.** That was tried and retired for
cause (§INTERIOR_PACING_LOS, 2026-07-26 — a courtyard traversal read slow because a low wall or a
piece of staffage off to the side tripped the min). The user's rule is a **DENSITY/COUNT**, not a
MIN, and the two fail differently: a min brakes for one nearby thing; a density does not fire in an
empty courtyard at all. Record this distinction — it is the reason this is not a re-litigation.

**Deterministic candidates only** (PRIME RULE: the same building must produce the same film on any
machine):
- **fan hit FRACTION** — `A.cinemaFan` already casts 32 rays and is the project's blessed
  clearance source. `hits within R / 32` is a density, costs nothing extra, and is already computed
  at each sample. Strongest candidate.
- **elements in the view frustum** at the sample pose (count of instances/GUIDs) — the most literal
  reading of "how much is happening", deterministic from the DB, but needs a real cost measurement
  before it goes in a per-sample loop.
- **⛔ NOT frame time / FPS / DLOD flip counts.** They measure the MACHINE, not the scene: pacing off
  them makes the same building bake a different film on a different GPU. Tempting because
  `§FPS_MODE`/`§DLOD_TICK` are right there in the log — and wrong for exactly the reason the prime
  rule exists.

**Combine, don't replace:** forward LOS keeps its job (never crash into or zoom past what is directly
ahead); busyness is the second term for "a lot is happening here". Both feed ONE `PACE_SWING`-style
knob so re-tuning stays a single number, per the user's standing *"every edit, it is just a single
number change"*.
**Gate this too:** report per-sample busyness alongside speed, and show that the slow samples are the
busy ones — the number, not the impression.

**Gate:** on an edited path, (a) speed in open interior is CONSTANT within the ±`PACE_SWING` band —
report min/mean/max m/s, not a "feels right"; (b) the slow samples coincide with genuinely low
`cinemaLookDist`, i.e. the brake fires for what is AHEAD, not for anything nearby; (c) the resulting
frame count for the user's Hospital edit lands in minutes, not hours — report it.

## §CPE_IDB_PATH_STORE — agreed, spec-only, NOT NOW (user, 2026-07-27)

User: *"on save it goes to DB.. ok fair for now.. later should be its own in IndexDB first separate
table of saved waypoints if u agree with the idea spec it first for later once we cleared this big
pathing achievement."*

**Agreed, and for a reason the current design already exposes** — see §CPE_SAVED_PATH_LIFECYCLE:
today a saved path can only live inside the building `.db`, so (a) a building served read-only from
OCI can never keep one without the user downloading a private copy, (b) one file holds exactly ONE
path, (c) saving a path means rewriting a 260 MB binary. An IndexedDB store fixes all three, and it
is the same shape the viewer already uses for `bim_ootb_logs` and `bim_ootb_cinema_maxq`.

Sketch, to be settled with the user when it comes up — **do not build from this**:
- store `bim_ootb_cinema_paths`, key `buildingId + name`, value = the band override + `_total` +
  beat seconds (the exact `_buildOverride()` object, IFC-space like `cinema_path` already is);
- MANY named paths per building ⇒ the editor grows a small list: Save as… / Load / Delete;
- the `cinema_path` TABLE STAYS as the portable/exchange format — IndexedDB is the working store,
  Ctrl+S remains how a path travels with the file to someone else. Read order at plan time:
  staged override → IndexedDB (if a path is selected) → `cinema_path` table → derived;
- this also gives `A.clearCinemaPath()` a home in the UI, which §CPE_SAVED_PATH_LIFECYCLE flags as
  missing today.
**Open question for the user when this starts:** should a path selected from IndexedDB auto-apply on
load, or only when picked from the list? (Today the DB table auto-applies, silently.)

### ⚠ AMENDMENT to §CPE_PACE_LOS (user, 2026-07-27) — graceful, not just bounded
> *"but do tamper measure not to have extreme change in speed.. graceful. If busy slows down, when not,
> picks up.. user wont get bored."*

Two separate constraints, and the existing `PACE_SWING` clamp only delivers the first:
1. **RANGE** — how slow/fast pace may get. `PACE_SWING=1.6` already bounds this.
2. **RATE** — how FAST pace may change from one sample to the next. **Nothing bounds this today.** A
   path that steps from wide-open to tight in one sample would jump between the two clamp ends
   instantly — inside the allowed range, and still a lurch. The user's "graceful" is this second one.
**Therefore:** rate-limit the pace-factor series along the path (a per-metre cap on Δfactor, or a
smoothing pass over the factors before `_paceBuildRemap` consumes them) — bounded acceleration, not
just bounded speed. And the "picks up" half is load-bearing too: the brake must RELEASE in open
space, not ratchet down and stay there, or the film ends up uniformly slow — which is the complaint
that started this.
**Gate:** report peak |Δspeed| per second AND per metre across the whole film, not just min/mean/max
speed. A film can sit inside the speed band the whole way and still lurch; only the derivative shows it.

### ⚠ AMENDMENT 2 to §CPE_PACE_LOS (user, 2026-07-27) — the total field stays the global speed knob
> *"remember there is also the overall speed control ie the total time of movie length in the panel
> can be set to a faster when reduced, or otherwise"*

Already built (`_state.userTotal`, `§CPE_TOTAL`, uniform `scale` in `_buildOverride`) and it must
survive the pacing work intact. **The interaction is the trap:** `tour.js`'s `_paceBuildRemap` does
TWO things — it redistributes time along the path AND rescales the action's own total via
`meanFactor`. The second one would silently fight an explicitly-keyed total: the user types 40s, the
remap decides the path is open and hands back 31s. So:
- **User has keyed a total → the brake REDISTRIBUTES within it only. `meanFactor` rescaling is OFF.**
  Their number is the film's length, full stop.
- **User has not keyed one → the derived total stands, and `meanFactor` may inform it** (that is the
  §CPE_PACING "length is a consequence of the building" model, which the user already ratified).
**Gate:** with a keyed total of T, the baked film's duration is T ± one frame, no matter how busy or
open the path is — while the WITHIN-film speed still varies. Both halves in one gate, or the brake
can quietly eat the user's setting and still look right.

**Three knobs, one film — keep them straight, they are not interchangeable:**
| knob | scope | owner |
|---|---|---|
| total seconds (panel field) | the WHOLE clip, uniform | the user, explicitly |
| busyness/noise temperament | WITHIN the clip, per sample | derived from the scene |
| `PACE_SWING` + the new rate limit | how far and how fast the second may move | one tuning constant each |

**Attribution — record it, it is the user's design, not a port of Fly Tour's brake:** user, 2026-07-27,
*"looking forward to that overall noise speed temperament which is my novel idea for a cinematic
experience"*. `tour.js`'s §INTERIOR_PACING_LOS is the nearest existing MECHANISM and is reused for
that reason, but it is a distance brake for navigation. What is being built here is different in
kind: pace as a function of how much the scene has to SAY at each moment — busy frame lingers, empty
frame moves on. Keep the framing (and the credit) in any doc or release note that describes it.

### 🔴 THIRD HYPOTHESIS ALSO FAILED — unified pace remap built, measured NO effect on the peak

Built the combined mechanism the user asked for (jerk + speed as one): a time↔distance remap over the
walk, three busyness terms combined by **MAX not product** (turn deg/m, fan hit-FRACTION, forward LOS),
clamped to `PACE_SWING=1.6`, rate-limited per metre, wired into Beat 3 so `e3` becomes
`_pace.u(smoothstep(...))` — position AND look-ahead both read the remapped distance. Base pace raised
`1.3 → 2.3 m/s` (arithmetic: their ~15s expectation against the 26.1s derived ⇒ ~1.8×).

**Measured on Duplex, hostile layout: 29.1 → 29.4 → 29.4 deg/frame. No effect whatsoever.**
The rate limiter was found and fixed mid-pass (a symmetric clamp toward the neighbour FLATTENED the
1m corner peak back to ~1; changed to a MAX-dilation that preserves peaks and ramps neighbours up) —
and the number still did not move. **Reverted: an unproven mechanism must not ship.**

**Beat boundaries measured, so the peak is located, not guessed:**
`dive=0.094 spin=0.124 out=0.510 rise=0.700` — the peak at `u=0.279` is squarely INSIDE the walk
(beat 3), which is the beat the remap rewrites. So the remap reaches the right beat and still changes
nothing.

**⛔ RUN THIS DIAGNOSTIC FIRST, before writing any more code.** Three plausible fixes have now been
built and killed by measurement; the fourth must start from data, not from a theory:
1. Log the `_pace` factor SERIES (not just min/mean/max) against distance, and read it at the sample
   nearest `u=0.279`. **If the factor there is ~1.0, the busyness terms are not firing on this
   layout** — most likely because the hostile path sits outside the building, so fan and LOS both
   read nothing and only the turn term is live. That would make the whole result an artefact of the
   SYNTHETIC test layout, not of the mechanism — and the real check becomes a user-shaped edit.
2. If the factor IS at the 1.6 cap there, then a 1.6× slowdown genuinely cannot fix a 29°/frame
   corner, and the honest conclusion is that `PACE_SWING` (the user's own "don't overdo it, have a
   speed range") BOUNDS how much pacing can smooth a hostile corner. Report that trade-off to the
   user rather than quietly widening their range.
3. Only then decide. Do NOT retry: the bow-ray probe (cap never binds), or the positional look-ahead
   average (measured worse, 29.1→37.0).

**Ready to apply once the above is answered, independently useful and NOT shipped:**
`CINEMA_WALK_MPS 1.3 → 2.3` alone shortens every film ~1.8× and takes the user's 1015-frame /
~26-minute Hospital cook to roughly 570 frames. Held back only because they asked for the jerk and
the speed to land together.

---

## §CPE_DRAG_TELEPORT — the mid-band drag teleports and cannot be dragged back (user, 2026-07-27)

> *"the drag of the waypoint seems to misbehave went off to a spot user didnt put. Draging it back,
> still flew back."*

**Root cause, and `c0` proves the intent.** `h.move` for `zone='mid'` assigned the projected cursor
point ABSOLUTELY — `b.c.x = p.x; b.c.y = p.y; b.c.z = p.z` — so the band's new centre became wherever
the grab ray met the view plane, **not** the old centre plus the gesture. `_state.drag.c0` (the
centre at pointerdown) was captured on the line above and **never read anywhere in the file** — the
delta form was clearly intended and never wired.

Two consequences, both exactly what the user described:
1. Any depth error in the grab point `p0` becomes an immediate **teleport** — the band lands where
   the ray happens to cross, not under the cursor.
2. The next drag re-anchors its plane at the already-wrong depth, so **"dragging it back" moves it
   wrong again**. The error compounds instead of cancelling.

**Measured in their own log:**
```
§CPE_DRAG band=1 zone=mid centre=(-14.26, 39.24,-33.54)   floorY=-15.47, settle y=-13.8
§CPE_DRAG band=1 zone=mid centre=(-15.04, 41.65,-25.45)   ← the "drag it back" attempt, still up there
pathLen 32.3m -> 40.3 -> 52.0 -> 161.7m       walk 24.9s -> 124.4s      k=[0.55,0.55] -> [0.09,0.55]
```
y=+39 against a floor at −15.5 is **~55m above the floor** — the band was flung into the sky, and the
5× path length is why their film ballooned to 148s.

**Fix (one line, shipped):** `b.c = c0 + (p - p0)`. A zero-pixel drag is now a zero-metre move by
construction, and any `p0` depth error cancels out of the difference instead of accumulating.
End-drags (`_rotateAbout`) are absolute by nature — rotate the band to aim at the cursor — and are
correct as they stand; only the mid/translate branch was wrong.

**⚠ NOT YET WITNESSED — this is the one thing outstanding on it.** The gate to write:
- **G-DRAG-1** zero-pixel drag ⇒ centre unchanged to 1e-9 (the invariant the absolute form breaks).
- **G-DRAG-2** a known pixel delta ⇒ centre moves by exactly the corresponding world delta in the
  view plane, and by **zero along the view normal** (the band must not change depth at all).
- **G-DRAG-3** drag out and back to the same pixel ⇒ centre returns to its start within 1e-6. This is
  literally the user's "dragging it back" and is the gate that would have caught this.

---

# ⛔ SESSION END 2026-07-27 (LATER) — §CPE_JERK_SETTLED — READ THIS FIRST

**Both of the user's headline asks are now BUILT, MEASURED and PUSHED.** The earlier session-end
block below is kept for its dead-end record only; its status table is STALE and must not be quoted.

## The user's asks, answered against numbers
| their words | state |
|---|---|
| "1. NO JERK" | **DONE.** Hostile-layout peak 29.1 → **6.7** deg/frame (Duplex), 46.8 → **7.3** (Terminal), cap 12. `witness_cpe_even_turn.js` **PASS 3/3 both**. |
| "2. EVEN SPEED NOISE" | **DONE** — and it is the *same* mechanism, not a second feature. See the formula below. |
| "that jerk was happening at the 2nd wp1 after the settle" | **ROOT-CAUSED THERE EXACTLY.** It was an 81° DISCONTINUITY at the Beat2→Beat3 seam. Now 0.18°. |
| "out of control drag" | **DONE.** `witness_cpe_drag.js` **4/4 both** (PR #1038 branch). |

`witness_cinema_path_editor.js` **9/9 both**. Branches pushed, both green, neither merged yet:
- `fix/cpe-drag-reach-revert` @ `96f9f66` — drag 4/4. (PR #1038, needs merge.)
- `feat/cpe-even-turn` — jerk + seam, merged up to `origin/main` already, witnesses green.

## §CPE_JERK_DEFINITION — what a jerk IS (settled, user 2026-07-27)
User's own definition, verbatim: *"pov sudden position, turn angle too large, need even out between
frames."* Operationally, THREE measurable things — a fix must not trade one for another:
1. **Gaze sweep per frame** — the angle between consecutive frames' gaze DIRECTION vectors (3D).
2. **Position step per frame** — metres between consecutive frames' camera positions.
3. **Discontinuities** — detected by re-sampling the same neighbourhood at **100× density**: a real
   turn shrinks ~100×, a genuine STEP stays the same size. This test is what found the 81° seam and
   it is the single most useful diagnostic in this lane. Reuse it.

**Do NOT measure yaw.** Yaw is degenerate near-vertical: on Terminal it read 46.8 deg/frame where
the gaze sat at 87.2° pitch (horizontal component 0.049) and the TRUE sweep was 7.2. The old T2 gated
yaw and was chasing an instrument artefact.

**Where the camera POINTS is the USER'S creative control** (their explicit ruling, 2026-07-27:
*"Gaze angle is user control, why u wana fix? Fix only jerks, speed etc."* / *"user creativity .. leave
to them its intuition"*). We own only how fast it may CHANGE. Do not "fix" a camera aim, a chosen
exit, or a path's steepness because it looks odd — that ruling also killed a line of investigation
into Terminal's 83.4° first walk leg, which is CORRECT AS DESIGNED (dive into a big space → exit →
orbit is the intended film).

## §CPE_EVEN_TURN — the elegant formula (THIS IS THE SETTLED ANSWER, do not re-derive)
**The mistake every earlier attempt made:** keep frames evenly spaced in TIME/DISTANCE, then try to
fix a corner by MULTIPLYING speed there. Bounded by `PACE_SWING`, a multiplier can divide a peak by
at most 1.6, against a measured 29.1 deg/frame needing 2.4×. **H3 moving 29.1 → 29.4 was an
arithmetic ceiling, not bad tuning.** No amount of pacing work can beat that ceiling.

**The fix — make pace the PARAMETERIZATION, not a correction.** Step frames at equal increments of a
blended cost:

    dc = (1-w)·(ds/S)  +  w·(dθ/Θ)

with `S` the walk's arc length, `Θ` its total gaze turn. If every frame advanced the same `Δc = 1/N`,
each term would be bounded on its own, by construction:

    Δθ ≤ Θ / (w·N)          — turn per frame, at most 1/w × the perfectly-even Θ/N
    Δs ≤ S / ((1-w)·N)      — distance per frame, at most 1/(1-w) × nominal speed

### ⚠ CORRECTION (review, 2026-07-27) — Δc is NOT constant, and the delivered range is 2.4×, not 1.6×
The paragraph above described the mechanism in isolation. **The shipped code composes the remap with
the ease** — `_evenTurnRemap(_cinemaSmoothstep(t))` (`effects.js`, Beat 3) — and `_cinemaSmoothstep`
is `t²(3-2t)`, whose derivative **peaks at 1.5** at the midpoint. Frames are uniform in TIME, so cost
advances at up to `1.5/N` per frame and **every bound above carries a ×1.5**:

    Δθ ≤ 1.5·Θ / (w·N)      Δs ≤ 1.5·S / ((1-w)·N)

**So `1/(1-w)` is the per-cost-step range, NOT the speed range the film delivers.** Delivered range is
`1.5/(1-w) ≈ 2.4×`: against `CINEMA_WALK_MPS = 2.3` the walk peaks near **5.5 m/s**, and §CPE_WALK's
"2.3 m/s pace" is a **MEAN**, not the pace — read any gate asserting 2.30 as asserting the average.

The ease is deliberate and should stay (zero rate at both beat seams, so the walk neither starts nor
stops abruptly); the ×1.5 is its price. What is **not** settled is whether 2.4× is inside what the user
meant by *"don't overdo it"* — the gaze half passes comfortably (7.3 measured against the 12 cap), but
the POSITION half of §CPE_JERK_DEFINITION is still ungated, so nothing measures the metres-per-frame
this bound governs. **Gating the position step is what turns this from an argument into a measurement**
— it is already the top known gap, and this correction is the reason it matters more than it looked.

`w` itself is still **not tuned**: the single dial was chosen by the user, and the turn bound falls
out of it. Slow-in-the-turn and pick-up-in-the-open are not imposed by a brake — they are what equal
cost stepping DOES, and the brake releases in open space for free because there is no dθ to pay for.
This is simultaneously ask 1 (no jerk) and ask 2 (even speed noise): one mechanism, both asks.

Implementation: `viewer/effects.js`, `_evenTurnBuild()` + `_evenTurnRemap()`, applied to Beat 3's
progress. The cost table samples `_beat3Pose()` — the REAL poses — never a re-implementation of the
gaze rule, so the table and the film cannot drift apart. Guard: `Θ < 1e-3` falls back to pure arc
length (today's behaviour) so a straight walk is untouched.

## §CINEMA_LOOKAHEAD_ARC — the jerk the user kept reporting. FOUND, FIXED, WITNESSED (2026-07-27)
**The user was right and the code was wrong.** After §CPE_EVEN_TURN and §CPE_SEAM_CONTINUOUS shipped,
Hospital still jerked. Gated at last (see §CPE_POSITION_GATE below) it measured **81.0 deg/frame at
u=0.312, INSIDE the walk**, and the 100× density test returned **ratio 1.0× — a true STEP**.

**Cause.** Beat 3's look-ahead had a collapse guard: *if the point at `u+0.15` is within 0.5 m,
substitute `(odx, 0, odz) × 20`.* That substitute is a DIFFERENT vector, switched to in one frame.
The measured gaze went `(-0.230, 0.973, -0.019)` → `(-0.733, 0.000, 0.680)`. **The `y` of exactly
0.000 is the substitution's fingerprint** — that is how to recognise this class of bug again.

**What did NOT work, and why it is the lesson:** searching forward for the first point that clears
the 0.5 m radius. It only shrank the step (81.0 → **21.3**, still ratio 1.4× = still a step), because
on a folding path the first-clearing point can itself jump. **Any rule of the form "if the look-ahead
is too close, use something else" contains a switch, and a switch is a step.** Window size was never
the variable; the THRESHOLD was.

**The fix — remove the threshold entirely.** The look-ahead is the point a fixed **ARC LENGTH**
further along the path (`L = 0.15 × walkLen`, the same 0.15 the fraction window meant, now in metres).
Arc length is monotone in `u`, so that point always exists and always moves continuously, on **any**
path shape. Nothing to collapse, nothing to substitute. The `(odx,odz)` fallback survives for exactly
one case — a walk of zero length, where there is no path to read a direction from, and where Beat 4
opens on `(odx,0,odz)` anyway.

| | Hospital peak | 100× ratio | verdict |
|---|---|---|---|
| before | 81.0 deg/frame | 1.0× | STEP |
| forward-search (rejected) | 21.3 | 1.4× | still a STEP |
| **arc-length (shipped)** | **11.2** | **92.9×** | **fast turn, under the 12 cap** |

`_lookAhead()` in `viewer/effects.js` is now the ONE look-ahead rule — Beat 3 and the
§CPE_SEAM_CONTINUOUS opening direction both call it, so they cannot drift apart.

**Witnessed:** `witness_cpe_even_turn` **4/4 on Duplex, Terminal AND Hospital** (Hospital added this
session — it had never been gated, which is why this survived three sessions of "fixed" claims).
No regression: `witness_cinema_path_editor` 9/9, `witness_cpe_undo` 6/6, `witness_cpe_ok_bake` 3/3.

## §CPE_POSITION_GATE — T5, the ungated half of §CPE_JERK_DEFINITION (2026-07-27)
The user's definition names *"pov sudden position"* FIRST; every gate until now measured only the
gaze sweep. A camera can hold a perfectly steady aim while teleporting.

**T5 in `witness_cpe_even_turn.js`.** Cap is DERIVED per beat, never picked: each beat is a smoothstep
of its own time fraction and smoothstep's derivative peaks at exactly 1.5, so a smooth traverse cannot
exceed **1.5× that beat's own mean step**. Two stated exceptions:
- **the walk gets 1.5 × PACE_SWING = 2.4×** — it is deliberately cost-parameterized (§CPE_EVEN_TURN),
  so holding it to 1.5× would gate the FEATURE, not a defect;
- **the spin is exempt by name** — an in-place turn, whose motion T2 already owns. Exempted by name
  rather than a magnitude threshold, because a threshold would just be a number chosen to straddle
  the three buildings (measured means: Duplex 0.01 m, Terminal 0.02 m, Hospital 0.03 m per frame).

**Measured walk ratios: Duplex 2.4×, Terminal 2.3×, Hospital 2.4× against the 2.4× allowance** — the
corrected derivation below, confirmed empirically rather than argued. **No teleport on any building.**

⚠ **Hospital's 17.22 m/frame at u=0.914 is the ORBIT at 1.4× its own mean** — 360° in 8 s at a 91 m
radius. Smooth by construction, NOT a step; it was briefly mis-called a bug this session. It is
genuinely fast (~189 m/s) and may be what reads as "too fast" on large buildings, but that is an
orbit-duration design constant and a separate decision. Do not re-diagnose it as a jerk.

## §CPE_PACE_FLOOR — the 2-second pause. Built, MEASURED, and it collides with T2. ⛔ USER DECISION
**User, live on Hospital, 2026-07-27:** *"eventually it moves but it must be 2 secs pausing there in
movie later"*. A STALL, the exact opposite of the jerk §CPE_EVEN_TURN was built for.

**Cause, and it is our own bound being half-written.** `PACE_SWING` is a RANGE, but only its fast
half was ever enforced: `Δs ≤ 1.5·S/((1-w)·N)` caps how FAST the walk gets, and NOTHING capped how
slow. Where `dθ` dominates a cost step, `ds → 0` and the camera crawls. Hospital's walk turns
**488° over 36 m**, so one corner can eat the whole budget. Measured with no floor:
**min = 0.000 m/frame, 596× slower than the beat mean — a dead stop.**

**Instrument note worth keeping.** A flat floor CANNOT measure this: every beat is a smoothstep of
its own time fraction, so its first and last frames legitimately approach zero speed (that ease is
what makes the seams smooth), and a flat floor duly reported a "stall" at `u=0.524` — which IS
`beats.out`, the walk's own end. T6 therefore compares each frame against what the ease alone
predicts there, `expected(e) = mean × 6e(1-e)`, and gates `measured/expected ≥ 1/PACE_SWING`.

**The fix built (parked, not merged):** clamp the cost slope against normalised arc so cost cannot
accumulate faster than `PACE_SWING × uniform`. Clamp-then-renormalise does NOT work — rescaling by
the shrunk span multiplies every slope by `1/span > 1` and puts back exactly what the clamp removed
(measured 53–57% against a 63% floor). The removed cost must be redistributed to the segments not at
the cap: water-filling, bisect `k` such that `Σ min(k·raw_i, SWING·dArc_i) = 1`. Feasible because
`Σ SWING·dArc = 1.6 > 1`.

**⛔ WHY IT IS PARKED — the dial cannot satisfy both gates at once.** With the floor in:

| | T6 stall (floor 63%) | T2 jerk (cap 12°/frame) |
|---|---|---|
| no floor | 0% — dead stop | Duplex 10.6 / Terminal 6.9 / Hospital 11.2 ✅ |
| water-filled floor | 60–62% — still short | **Duplex and Hospital go RED** |

Slowing less in the corner necessarily turns more per frame. **`PACE_SWING = 1.6` is not wide enough
to hold both the 12°/frame jerk cap and a no-stall floor on these layouts.** This is precisely the
trade-off the earlier spec said to take back rather than resolve by widening a user's number to make
a gate green. The question: **widen `PACE_SWING`, accept the stall, or accept more jerk?** Everything
is built and measured; only the choice is missing.

## ▶ FOUR ASKS CAPTURED 2026-07-27, NOT YET BUILT (user, live, mid-session — do not lose these)
1. **"the sudden jump of the wp to a high position on top of building still happening"** — the
   §CPE_DRAG_SCALE item below, confirmed still live by the user AFTER §CINEMA_LOOKAHEAD_ARC shipped.
   Measured at 0.453 m/px on Hospital; blocked only on the 1:1-vs-precision-modifier decision.
2. **"when orbiting outside the cam remains pointed to the building in the centre.. since our wp
   before follows the path"** — user observation about the orbit beat's gaze. Recorded verbatim;
   NOT yet analysed, and it is not obvious whether they are reporting it as correct-and-good or as
   a defect. Ask before building.
3. **"the stick band should curve along more.. now it is short, if twisted its curve still short..
   having more make it more useful to craft"** — bands are too short to author with; a twisted band
   should produce a longer curve. Relates to §CPE_SCREEN_PLANE's known cosmetic gap (bands drawn as
   thin lines, ~1–1.3 m, three grab spheres). Likely the same fix: longer bands rendered as tubes
   with a nearest-third hit-test.
4. **"why cant we have sense of time/timer.. measure in the code"** — DONE for the bake readout as
   §MAXQ_ETA_TICK (PR #1046): status every frame, console throttled on elapsed ms not frame index.
   The principle generalises and the user stated it as a general one.
5. **"after edit and OK, it should do the 10 sec fast preview again, so user sees the impact before
   final decision"** — OK currently commits straight to the bake. It should re-run the existing 10s
   fast preview on the EDITED path first, so the edit is seen before the ~25-minute cook is
   committed to. The preview loop already exists (`cinema_maxq.js`, the 10s authored path preview
   noted in §CINEMA_DAMPING_BLEED), so this is a wiring job, not a new mechanism. Sequence the user
   described: edit → OK → 10s preview → then decide. Buildable as specified; no open question.

## §CPE_DRAG_SCALE — "wp1 jumps to way high" MEASURED. ⛔ ONE USER DECISION, then it is buildable
**User, 2026-07-27, live on Hospital:** *"it still has another bug where the wp1 jumps to way high"*,
with `§CPE_DRAG band=1 zone=mid plane=view centre=(2.88,-16.72,-26.43)` against `floorY=-15.47` —
the waypoint 1.25 m below the floor.

**This is NOT a delta bug.** §CPE_DRAG_TELEPORT is fixed and `G-DRAG-4` measures the mapping at
0.9973× / 0.9991× — the handle tracks the cursor correctly. It is not a plane bug either:
§CPE_SCREEN_PLANE settled that a drag moves the handle in the camera's view plane and that height
comes from a side view, and the user accepted that cost explicitly.

**What was never settled is the SCALE.** The view plane sits at the handle's distance from the
camera, so world-metres-per-pixel grows with that distance. Measured (`probe_drag_scale.js`, fov 60,
700 px viewport, from the real opening camera):

| building | handle dist | m/px | a 50 px flick moves | walk length |
|---|---|---|---|---|
| Duplex | 91 m | 0.151 | **7.5 m** | 12.6 m |
| Terminal | 138 m | 0.227 | **11.4 m** | 25.3 m |
| Hospital | 274 m | **0.453** | **22.7 m** | 29.8 m |

**On Hospital a 50-pixel nudge throws a waypoint 76% of the entire walk.** That is the mechanism
behind "jumps to way high", and it is worst exactly where the user hit it. 1:1 with the cursor is
correct *on screen* and far too coarse *in the world*.

⛔ **BLOCKED — the one question, because the answer contradicts a settled model either way:**
should a drag stay pinned 1:1 under the cursor (§CPE_SCREEN_PLANE's "the dot when touched can only
move in that XY sense"), meaning the fix is *zoom in first* and this is workflow, not defect — or
should a precision modifier (e.g. Shift = 0.1×) break 1:1 while held? Do NOT pick one silently:
1:1-under-the-finger is the user's own stated model, so reducing it is their call, not a bug fix.

Everything needed to build either is measured and in hand; only the choice is missing.

## §CPE_SEAM_CONTINUOUS — the discontinuity, and why it goes in the WALK
The Beat2→Beat3 seam stepped **81° in one frame** on Terminal (at the user's reported wp1-after-
settle). Proven a STEP not a fast turn by the 100× density test: it stayed 81°. Cause: the spin ends
on a LEVEL gaze while the walk opens aimed up a 16m climb (walk-out leg 1 measured `run 1.85m,
rise 15.98m` = 83.4°).

Fix: the walk now OPENS on exactly the direction the spin handed over, and eases onto its own aim
over `_openU`, sized at the project's existing `CINEMA_TURN_DPS`. **81° → 0.18°.**

**⚠ It is closed inside the WALK, deliberately — do not "simplify" this into the spin.** That was
tried and measured: paying for it in the spin makes the spin's DURATION depend on the authored path,
which shifts every beat fraction before it and breaks G2's "an edit changes nothing before it".
`§CPE_SEAM_CONTINUOUS seamGapDeg=` logs the seam every plan; it must stay ~0.

## ✅ THE TWO "RED" GATES WERE BROKEN INSTRUMENTS — RESOLVED, both now PASS
**Earlier in this same session I recorded G2 and G7 as red on `origin/main` and framed G2 as a spec
tension needing a user decision. BOTH of those conclusions were WRONG and are retracted here.**
Neither gate was measuring a jerk; both were measuring themselves wrong. `witness_cinema_path_editor.js`
is now **9/9 on Duplex and 9/9 on Terminal**.

**G7** measured `planS` (the 90° dog-leg) but filtered frames with `planA.beats` — a DIFFERENT plan,
from a different path, whose walk occupies a different fraction of the film. The window was misaligned
with `planS`'s own walk, so the gate sampled beats the walk's pacing does not govern (the spin runs on
a clock, not on the path). That is precisely why G7 sat at 15.7/20.4 **to the decimal** while every
other jerk number moved: the peak it reported was never in the walk.

| window fixed | Duplex | Terminal |
|---|---|---|
| pristine `origin/main` | 4.4 | 6.9 | ← **already passing**; there was never a defect |
| this branch | 3.3 | 4.6 | ← pacing improves an already-good number |

**§CPE_EVEN_TURN did not fix G7 and must not be credited with it.**

**G2** compared the two films at the same PERCENTAGE through. The edited path is longer, and §9
("path length sets the clock") means the edited film legitimately RUNS LONGER — `cinema_maxq.js:414`
sets the real bake's frame count from `plan.naturalTotal`, so that is the product's actual behaviour,
not a theory. Sampling both at the same normalized `t` lines second 3 of a 24s film against second 4
of a 32s one, and reports the opening as "changed" when nothing about it moved. Beat seconds are
derived independently of path length (the dive from its own distance), so **at equal REAL time the
opening is identical by construction**. Compared at equal absolute seconds:
`firstDiffT=0.155 vs diveEnds=0.114` (Duplex), `0.1425 vs 0.111` (Terminal) — the edit changes things
only AFTER the dive.

**⛔ The "when an edit lengthens the path, absolute seconds or fractions?" question is WITHDRAWN.**
There is no conflict with §9 and no user decision is needed. Do not ask it.

**The lesson, worth more than either gate:** two instrument bugs in a row, both of which would have
been read as product defects. `feedback_verify_checker_before_code_under_test` earned its place —
when a number refuses to move while everything around it moves, suspect the meter, not the engine.

## §CPE_UNDO — Ctrl+Z on the editor, reflected in the history line ✅ BUILT & WITNESSED
**User, 2026-07-27:** *"also put in the prompts/# to allow UNDO, Ctl-Z as reflecting in the history
line to take effect so a misplaced can be easily reverted?"*

**Why it is not a nicety:** direct manipulation is only safe to experiment with if a bad drag costs
nothing to reverse. Dragging a band back BY HAND is exactly the gesture §CPE_DRAG_TELEPORT measured
as unreliable (a 12.6m residue on the return drag). Undo makes the reversal exact — measured
residue **0.00e+0 m**.

### The one design call, and why (do NOT "improve" this into the model op-log)
A waypoint edit is **TRANSIENT editor state** until the user explicitly saves the path
(§CPE_BUILT persistence). It therefore has **no signed kernel op to flip**. So §CPE_UNDO is a LOCAL
snapshot stack, *not* `KernelOps` / `UniversalHistory.undo()`:
- routing it through the model op-log would **mint fake model ops** for edits that may never be
  saved, and
- Ctrl+Z would then undo *the wrong thing* once the editor closed.

The history **line** still shows it, via `UniversalHistory.recordEvent('CINEMA_PATH_EDIT', label)` —
the existing **read-only detail-event** channel (`universal_history.js`, `HISTORY_SESSION_EVENTS.md`
A1). That satisfies the user's ask exactly ("reflecting in the history line") without faking a model
change. **If a future session is tempted to unify these, this paragraph is the reason not to.**

### Rules
1. Snapshot **BEFORE** every mutation, never after — that is what makes the restore exact.
2. Cover **BOTH** input routes: canvas drags AND keyed panel edits. §CINEMA_PATH_EDITOR_MODEL item
   19 makes panel and canvas the same state, so an undo covering only one is a trap.
3. A new edit **clears the redo stack** (standard linear undo; the same rule UniversalHistory
   applies to a new op after a step-back).
4. The keydown listener is added on open and **removed on close** — it must never shadow any other
   Ctrl+Z (notably `grid_drag.js`, which owns the same binding when grid drag is active).
5. Depth cap `_UNDO_MAX = 50`.
6. Bindings: `Ctrl+Z` undo, `Ctrl+Shift+Z` / `Ctrl+Y` redo. Capture phase + `preventDefault`, so the
   browser's own text-undo does not fight it while a number input has focus.

### Witness — `witness_cpe_undo.js`, **6/6 Duplex, 6/6 Terminal**
Driven by a **REAL keystroke** through the browser's input pipeline, not an exposed seam, so it
proves the binding a user actually presses (per `feedback_test_real_user_path_not_seams`).

| gate | measured |
|---|---|
| U1 drag then Ctrl+Z restores exactly | dragged 14.26m / 22.18m → residue **0.00e+0 m** |
| U2 Ctrl+Shift+Z redoes | 0.00e+0 m from the dragged position |
| U3 empty stack is a safe no-op | 0 m drift, 0 page errors |
| U4 reaches the history line | 3 `CINEMA_PATH_EDIT` events observed on the channel |
| U5 keyed panel edit undoes too | 0.00e+0 m residue |
| U6 a press that never MOVES leaves no phantom undo entry | found by review; snapshot moved to first real movement |

No regression: `witness_cinema_path_editor` 9/9 both, `witness_cpe_ok_bake` 3/3 both.
Shipped as `CPE_V v8`, `cinema_path_editor.js?v=9`, `sw CACHE_VERSION v863`.

### Known follow-on, NOT built
Undo currently covers **band geometry** (centre, direction, length). It does **not** cover the
total-seconds field or the orbit stop-row elasticity. Neither is a "misplaced drag", which is what
the user asked for, so this is a deliberate scope line rather than an oversight — but if either later
becomes draggable, extend `_undoPush` to snapshot it in the same call.

## §CPE_REVIEW_PACK — for a reviewing session (Sonnet). READ BEFORE OPENING THE DIFF
Everything below is what a reviewer needs that the diff alone does not tell you: how each mechanism
works, and where I think it is weak. Nothing here is aspirational — every number is measured and the
log line that produced it is named.

### ⚠ SCRUTINISE THIS HARDEST: I changed two failing gates and they went green
This is the single highest-risk thing in the change set and it deserves the reviewer's first hour.
`witness_cinema_path_editor.js` G2 and G7 were RED; I edited both gates and both now PASS.
**Verify I corrected the instruments rather than lowered the bar.** The specific claims to re-check:
- **G7** — I changed which plan's beat boundaries define the sample window (`planA.beats` →
  `planS.beats`). Claim: it was measuring `planS` through `planA`'s window. **Falsifiable check:**
  run the fixed witness against pristine `origin/main` `effects.js` — I measured it **already
  passing at 4.4 (Duplex) / 6.9 (Terminal)**. If main passes with the fixed window, the old 15.7/20.4
  was never a real defect. If it does NOT reproduce, my fix is wrong and G7 must go back to red.
- **G2** — I changed the comparison from equal NORMALIZED time to equal ABSOLUTE SECONDS. Claim:
  §9 makes the edited film legitimately longer, so equal-percentage compares different moments.
  **Load-bearing evidence:** `cinema_maxq.js:414` sets the real bake's frame count from
  `plan.naturalTotal`. If that line does not do what I say, my justification collapses and the
  change is a gate weakening. Check that line first.
- **T1 in `witness_cpe_even_turn.js`** — I DEMOTED it from a gate to an INFO line. It gated the
  bow-ray rescue hypothesis. Judge whether retiring it is honest or convenient.

### The change set, mechanism by mechanism
**1. `§CPE_EVEN_TURN` — `viewer/effects.js`**
- `_evenTurnBuild()` (~L4576) samples `_beat3Pose(e)` at 241 points, accumulating arc length `s` and
  3D gaze turn `θ`, then builds a normalised cost table `_etC[i] = (1-w)(s_i/S) + w(θ_i/Θ)`.
- `_evenTurnRemap(u)` (~L4606) is its monotone inverse: binary search + linear interpolation.
- Beat 3 calls `_beat3Pose(_evenTurnRemap(smoothstep(t)))` instead of `_beat3Pose(smoothstep(t))`.
- `w = 1 - 1/CINEMA_PACE_SWING` = 0.375 (`_etW`, ~L4574). **`w` is not tunable by feel** — see the
  §CPE_EVEN_TURN formula section above for why 1/(1-w) IS the speed range.
- **Why the table samples `_beat3Pose` and not a re-derivation of the gaze rule:** if the table and
  the flown film computed the aim by two different code paths they would drift apart silently. This
  is deliberate; do not "optimise" it into a cheaper approximation of the gaze.
- Guard: `Θ < 1e-3` ⇒ `w = 0`, i.e. pure arc length = today's behaviour on a straight walk.

**2. `§CPE_SEAM_CONTINUOUS` — `viewer/effects.js`**
- `_openDir` (~L4230) = the direction the walk wants to open on, from `_outPos(0)`→`_outPos(0.15)`
  with the same 0.5m collapse guard Beat 3 itself uses.
- `_handDir` / `_openDeg` / `_openU` (~L4257) = the direction the spin hands over (level, on the
  spin's final bearing), the gap between them, and how much of the walk the handoff needs at
  `CINEMA_TURN_DPS`.
- In `_beat3Pose` the gaze is smoothstep-blended from `_handDir` onto the walk's own aim across
  `_openU`, so `e3=0` looks EXACTLY where the spin left off.
- `§CPE_SEAM_CONTINUOUS seamGapDeg=` is logged every plan and must stay ~0.
- **The trap:** closing this in the SPIN instead is the obvious-looking simplification and it is
  wrong — it makes the spin's duration path-dependent, which shifts every earlier beat fraction and
  breaks G2. I tried it, measured it, reverted it. Do not re-suggest it.

**3. `§CPE_UNDO` — `viewer/cinema_path_editor.js`**
- `_undoPush(label)` L369, `_histEvent` L376, `_undoApply` L383, `_undo`/`_redo` L399.
- Snapshot points: first real drag movement (`h.move`, guarded by `drag.snapped`), keyed centre
  edit L429, keyed length edit L447. Keydown handler `h.key` L688, removed in `_unwire`.
- Local snapshot stack, NOT the model op-log — reasoning in §CPE_UNDO above; that reasoning is the
  part to review, the code is small.

### Measured, with the source of each number
| claim | measured | where |
|---|---|---|
| jerk, hostile layout | Duplex 29.1 → 6.7, Terminal 46.8 → 7.3 deg/frame (cap 12) | `witness_cpe_even_turn.js` T2 |
| jerk, realistic layout | 4.5–7.8 deg/frame | same, INFO line |
| seam discontinuity | 81° → 0.18° at 100× sampling density | `diag` + `seamGapDeg` |
| undo exactness | 0.00e+0 m residue | `witness_cpe_undo.js` U1 |
| drag 1:1 | 0.9973× / 0.9991×, direction 0.01°/0.00° | `witness_cpe_drag.js` G-DRAG-4 |
| plan cost (Alt+C budget) | Duplex 16.5 vs main 15.5 ms; Terminal 77.0 vs main 86.6 ms | `§CINEMA_PLAN_MS` |

Green: `witness_cpe_even_turn` 3/3, `witness_cpe_undo` 6/6, `witness_cpe_drag` 4/4,
`witness_cinema_path_editor` 9/9, `witness_cpe_ok_bake` 3/3 — all on BOTH Duplex and Terminal.

### Issues I know about and did NOT fix — verify I have not understated these
1. **The position half of the jerk is UNGATED.** The user's definition names "sudden position"
   FIRST, and T2 gates only the gaze sweep. `_evenTurnRemap` bounds `Δs` mathematically, but nothing
   asserts it. **This is the biggest real gap.** Add per-frame metres to `turnPeak()`.
2. **Pacing covers the WALK only.** Dive, spin, turn-and-rise and orbit run on a clock, not on the
   path, so `§CPE_EVEN_TURN` cannot touch a jerk that lives in them. Unknown whether one does.
3. **The opening blend uses normalised LERP, not SLERP.** Fine for the angles seen (it stays
   monotone and continuous) but it is not a constant angular rate through the blend. If a future
   layout produces a large `_openDeg`, revisit.
4. **`_openU` clamps at 1.** A very short walk with a large handoff angle means the blend spans the
   ENTIRE walk. Not observed; no gate covers it.
5. **Undo does not cover the total-seconds field or the orbit stop-row elasticity** — only band
   geometry. Deliberate scope line (neither is a "misplaced drag"), but state it, do not discover it.
6. **`_UNDO_MAX = 50` is an invented constant.** Small, bounded, harmless — but it is invented, and
   this project's prime rule says to name such things rather than let them pass as derived.
7. **G6 baseline is still red on main** (`witness_cinema_exit_breathe`, `_flat_ending`,
   `_reciprocal`, `_glazing`, and `_damping_bleed` crashes). Pre-existing, untouched, NOT caused by
   this work — see §CPE_BUILT G6. Do not attribute them here.

### How to run everything
`python3 -m http.server 8403 --bind 127.0.0.1` (buildings are symlinked from
`~/bim-ootb/buildings/`), then `PORT=8403 node witness_<name>.js`. The drag witness lives in
`/tmp/wt-drag` on port 8402. **Both worktrees already exist and are clean — reuse them, do not
create new ones** (worktree hygiene, CLAUDE.md).

## ▶ NEXT SESSION — executable, in order
1. **Merge PR #1038** (`fix/cpe-drag-reach-revert`, 4/4 green) and open+merge a PR for
   `feat/cpe-even-turn`. Both are pushed and green; nothing to re-run first.
2. **§CPE_UNDO — Ctrl+Z on the editor, landing in the history line.** Spec below. This is the
   user's live ask (2026-07-27) and the top item.
3. **Gate the position half of the jerk definition.** T2 gates gaze SWEEP only. Add the per-frame
   POSITION step (metres) to `turnPeak()` in `witness_cpe_even_turn.js` and gate it — the user's own
   definition names "sudden position" FIRST and it is currently ungated. Only known real gap in the
   jerk lane.
4. **Do NOT add the pitch term to `_spinDeg`** — tried this session; it makes the spin's duration
   path-dependent and shifts every earlier beat fraction. Reverted; must stay reverted.
5. Nothing else outstanding. Both previously-"red" gates were instrument bugs (above), and there is
   no pending user question.

## Rig
`python3 -m http.server 8403 --bind 127.0.0.1` (buildings are symlinked from
`~/bim-ootb/buildings/`), then `PORT=8403 node witness_cpe_even_turn.js`. Drag witness runs on
`/tmp/wt-drag` port 8402. Both worktrees exist and are clean — **reuse them, do not create new ones**
(worktree hygiene rule in CLAUDE.md).

---

# ⛔ SESSION END 2026-07-27 (EARLIER) — SUPERSEDED BY §CPE_JERK_SETTLED BELOW

**The user's three asks are NOT done. Two of three have nothing shipped. Do not report progress on
them without re-measuring.** Everything below is measured, not remembered.

## Answer the user's own three questions, honestly, before anything else
| their question | answer |
|---|---|
| "is the jerk solved?" | **NO.** Nothing shipped. THREE hypotheses built and all three disproven by measurement. |
| "is the out of control drag solved?" | **PARTLY.** Teleport-on-touch is fixed and gated. **Out-and-back still FAILS (G-DRAG-3).** |
| "is the even noise speed ratio applied?" | **NO.** Only the flat base pace shipped. The temperament — their own idea — is not in the product. |

## ⚠ FIRST ACTION, before writing any code
**PR #1038 is open and unmerged: it removes the §CPE_DRAG_REACH cap and adds `witness_cpe_drag.js`.**
The cap is ON MAIN (merged in #1037) and is **known harmful** — `G-DRAG-3` measured it breaking the
user's exact "drag it back" case. Merge #1038, then **run `witness_cpe_drag.js` immediately** — it was
NOT re-run after the removal. Expected: G-DRAG-3 flips to PASS. If it does not, the residue has a
second cause and the cap was never the whole story.

Run it with the standing rig: `cd <worktree> && python3 -m http.server 8402` (symlink
`buildings/{Duplex,Terminal}_extracted.db` from `~/bim-ootb/buildings/`), then `node witness_cpe_drag.js`.

## What actually shipped today (all merged, all witnessed unless noted)
| PR | what | gates |
|---|---|---|
| #1029 | §CPE_OK_CRASH — OK after an edit no longer kills the bake | 3/3 + 3/3 |
| #1030 | §CPE_PANEL_DRAG — panel drags by its header | 4/4 + 4/4 |
| #1031 | §CPE_PREVIEW_DIVERGENCE — the film you edit is the film that bakes | 3/3 + 3/3 |
| #1032 | `witness_cpe_even_turn.js` — turn-rate instrument, no production change | T2 RED by design |
| #1035 | §CPE_DRAG_TELEPORT — drag is a DELTA, not the cursor point | ⚠ ungated when merged |
| #1036 | `CPE_V` fingerprint so `§CPE_LOADED` identifies the build | — |
| #1037 | §CPE_WALK 2.3 m/s base pace **+ the harmful reach cap** | pace verified 2.30 both |
| #1038 | **OPEN** — removes the cap, adds `witness_cpe_drag.js` | G-DRAG-3 not re-run |

## The three dead ends — DO NOT RETRY THESE
1. **Bow cap** (§CPE_EVEN_TURN H1). The cap never binds: Duplex bows 0.26/0.29m against MEASURED
   0.86/0.87m clearance; Terminal 0.74/0.67m against a 3m cap. `k` never shrinks.
2. **Gaze look-ahead window mean** (H2). MEASURED WORSE: 29.1 → 37.0 deg/frame. On a path that
   doubles back the window straddles the fold, the mean lands near the fold, and a short look vector
   has an unstable direction.
3. **Pace remap over the walk** (H3). 29.1 → 29.4, i.e. nothing — even after fixing a real bug in its
   rate limiter mid-pass (a symmetric clamp toward the neighbour FLATTENED the 1m corner peak; a
   MAX-dilation that preserves peaks and ramps neighbours up is the correct form and is what to
   re-use). Beat boundaries were measured (`dive=0.094 spin=0.124 out=0.510 rise=0.700`) so the
   peak at `u=0.279` IS inside the walk — the remap reaches the right beat and changes nothing.

## ⛔ THE DIAGNOSTIC THAT MUST RUN BEFORE HYPOTHESIS 4
Log the pace FACTOR SERIES (not min/mean/max) against distance and read it at `u=0.279`:
- **~1.0 there** ⇒ the busyness terms are not firing on the synthetic hostile layout (its path likely
  sits outside the building, so fan and LOS both read nothing and only the turn term is live). Then
  the whole 29 deg/frame result is a TEST ARTEFACT and the real check is a user-shaped edit.
- **at the 1.6 cap** ⇒ a 1.6× slowdown genuinely cannot fix a 29 deg/frame corner, and `PACE_SWING` —
  the user's own *"don't overdo it, have a speed range"* — bounds what pacing can do. **Take that
  trade-off back to the user; do not widen their range to make a gate green.**

## The user's settled direction for the temperament (all recorded above, do not re-ask)
- *"if too much is happening, slow down"* — a DENSITY (fan hit-fraction), never the fan MIN that was
  retired for the courtyard bug.
- *"graceful"* — bound the RATE of change, not just the range. Use the MAX-dilation form.
- *"have a speed range… don't overdo"* — `PACE_SWING = 1.6`.
- *"picks up… user wont get bored"* — the brake must RELEASE in open space, not ratchet down.
- *"the cam pos/pov must not shift without interim frames"* — turn rate is a busyness TERM;
  `deg/frame = (deg/metre) × (metres/frame)` and metres-per-frame is the only lever we own.
- Total-seconds field = a pure uniform compress/elongate of the finished film. A keyed total must
  never be rescaled by `meanFactor`.
- **Attribution:** the noise-temperament model is the USER'S design idea, not a port of Fly Tour's
  distance brake. Keep the credit in any doc or release note.

## Also still open
- `A.clearCinemaPath()` has no UI — once a file carries a `cinema_path`, every Alt+M authors from it.
- §CPE_IDB_PATH_STORE — specced, parked at the user's request.
- `witness_cinema_exit_breathe` / `_flat_ending` / `_reciprocal` / `_glazing` were ALREADY RED on
  main before this session (see §CPE_BUILT G6). Not caused by this work.

---

# ▶ HANDOVER 2026-07-27 (late) — read this first in a new session

## The one lesson this session actually taught
**Four separate "defects" in this lane were broken instruments, not broken code** (G7, G2, then
`witness_cpe_even_turn` T2 and `witness_cinema_bands` B5). The last two both sampled `dur * fps` — a
fixed 24s film — while the product bakes `plan.naturalTotal` seconds (`cinema_maxq.js:414`), and
§CPE_TURN_BUDGET now makes that grow with route turn. **The film is no longer 24s.** `deg/FRAME`
falls with frame count, so every jerk number argued over for two sessions was measured at a duration
no user ever sees. Fixing the instrument alone moved Hospital 21.6 → 5.6 and Duplex 20.4 → 5.2.

**Before believing any gate in this lane, check what duration it samples.** When a number refuses to
move while everything around it moves, suspect the meter — `feedback_verify_checker_before_code_under_test`
has now earned its place four times here.

## Shipped and green (PR #1047 + #1042/#1044/#1046)
`witness_cpe_even_turn` **5/5 on Duplex, Terminal AND Hospital**; `witness_cinema_bands` 6/6;
`witness_cinema_path_editor` 9/9; `witness_cpe_undo` 6/6; `witness_cpe_ok_bake` 3/3.

## 🔴 LIVE BUG, user-reported 2026-07-27, NOT reproduced in a witness yet — take this first
**"UNDO did not revert the jump in wpts when dragged too far."** §CPE_UNDO is live and correct on
its own gates (`witness_cpe_undo` 6/6, U1 residue 0.00e+0 m, driven by a REAL keystroke), so the
gates are passing while the user's actual gesture fails — which means the witness does not reproduce
the gesture. **Build the repro first; do not "fix" undo against gates that already pass.**

ALREADY RULED OUT by reading the code — do not re-walk these:
- `_replanFilm()` does NOT reseed `_state.bands`. It only recomputes `filmPts`/`plan` from
  `_buildOverride()`, which READS `_state.bands`. A restore is not being overwritten by the replan.
- The snapshot is taken BEFORE mutation on the first real move (`h.move`, `drag.snapped` guard), so
  a huge first-move jump is still captured pre-jump.
- `h.key` is registered on `window` in capture phase with `preventDefault`, removed in `_unwire`.

STILL SUSPECT, in order:
1. **Two drags, one Ctrl+Z.** If the user jumps, then drags BACK to correct, that is TWO undo
   entries — one Ctrl+Z reverts only the correction and looks like "undo did nothing". Cheapest to
   check, and if it is this the fix is UX (coalesce a gesture pair, or surface undo depth), not the
   stack.
2. **The jump may not be band geometry at all.** Undo covers centre/direction/length only
   (deliberate scope line, §CPE_UNDO "Known follow-on"). If dragging too far also moves something
   outside that set, undo cannot restore it BY DESIGN and the scope line is the bug.
3. `_scheduleReplan`'s debounce firing across the undo — believed harmless (it reads restored
   bands) but not proven.

Reproduce with a drag of the SCALE the user actually hits: §CPE_DRAG_SCALE measured 0.453 m/px on
Hospital, so a 50px flick moves a waypoint 22.7m. `witness_cpe_undo` U1 drags 14-22m on
Duplex/Terminal — a much milder gesture than the failing one.

## ⛔ NEXT, in order — every one is specified, none is guesswork
1. **The spin-at-wp1 (user, live, 2026-07-27: "at wp1 it can spin around itself one full rev").**
   **⚖ USER RULING, same day, settled — do NOT re-litigate:** *"no reason to if it follows its path,
   even at wp1, no reason not to follow."* A full revolution is therefore a DEFECT, never a stylistic
   choice and never something to detect-and-permit. **The gaze follows the path. Full stop.** Any fix
   that "smooths" a revolution rather than removing it is wrong by this ruling.
   Likely causes to check FIRST, in this order, before touching anything: (a) the arc-length
   `_lookAhead` can point BACKWARDS where the route folds, since arc length keeps advancing through a
   fold — the look-ahead point is then behind the camera and the gaze swings through 180°+;
   (b) `_cinemaGazeBlend` taking the long way round a wrap boundary. Both are cheap to instrument.
   **NOT NOTICED BY ANY GATE, and T2 structurally cannot see it** — it measures deg per FRAME, and a
   360° revolution spread smoothly over many frames passes. Hospital accumulates 888° of gaze sweep
   across the film (~2.5 revolutions) with T2 green. **The instrument to build: NET vs ACCUMULATED
   gaze rotation over a short stretch of path.** Accumulated ≈360° with net ≈0° IS a spin-in-place.
   Build the gate FIRST, then look for the cause — that ordering is what worked every time this
   session and guessing first is what wasted it.
2. **§CPE_LOOK_HOME keyed to the WALL CROSSING.** User narrowed it themselves: *"the only concern is
   when leaving building outer wall — cam turns towards centre of building, or face perpendicular to
   path towards building centre."* Do NOT implement it by widening `CINEMA_TURN_OVERLAP`: that was
   tried at 0.75 and reverted — it starts the blend while still inside, broke G10 (Terminal wp1
   aimErr 36.5° vs 25 cap), and was the sole cause of Duplex's 15.5 deg/frame. `exitOuter` is
   already computed in the plan; key off that crossing.
3. **The 10s preview after OK** (§ ask 5) — must fly the EDITED plan through the SAME `poseAt` the
   bake uses, or it re-creates §CPE_PREVIEW_DIVERGENCE.
4. **§CPE_DRAG_SCALE** — still open, still one user decision (1:1 vs a precision modifier).
5. **Screen dims / brightness flash at the jerk spot** (user, live). Suspect the photoreal staging
   re-firing on camera movement (`§STILL_REFINE` / `§PHOTO_AO` / `§NIGHT_MODE` cycle constantly in
   their logs), NOT the camera — T5 already proves there is no position teleport.

## Dead ends — do NOT retry, all measured
- **Noise-speed as a SPEED heuristic** (`v = clamp(avgNoise/noise, 1/SWING, SWING)`), per-segment
  AND windowed. Both measured WORSE on jerk (11.2 → 16.5 → 18.3) because a speed law has no bound on
  turn-per-frame, and windowing removes the slowdown exactly at the corner needing it. The blended
  cost `dc = (1-w)ds/S + w·dθ/Θ` is kept because `Δθ ≤ Θ/(w·N)` is PROVABLE. The user's instinct that
  one abstract structure covers it was right — the missing half was FRAMES (§CPE_TURN_BUDGET), since
  with N fixed the mean is Θ/N no matter how you redistribute.
- **Clamp-then-renormalise** for the pace floor: rescaling by the shrunk span multiplies every slope
  by `1/span > 1` and restores exactly what the clamp removed. Use the water-filling bisection.
- **Pitch term in `_spinDeg`** — makes the spin's duration path-dependent, breaks G2.

---

# ▶ SESSION 2026-07-27 (latest) — §CPE_NOISE_LAW: the noise ratio now governs the DIVE, and the ease no longer governs the film

## Retracted: the "LIVE BUG — undo does not revert a far drag" above is NOT A BUG
**User, 2026-07-27: "UNDO does work, i was pressing the wrong key.."** The 🔴 LIVE BUG block in the
previous handover is closed with no code change. Nothing was altered in `cinema_path_editor.js`.
Do not re-open it, do not build the far-drag repro that block asks for.

## The user's method, examined as asked ("examine the noise ratio method from me, if it is not well written")
It is a good method and it was written badly — three specific faults, all now fixed here:
1. **It was scattered** across §CPE_PACE_LOS + two amendments, §CPE_EVEN_TURN + a correction,
   §CPE_TURN_BUDGET and §CPE_PACE_FLOOR. No single place stated the law, so each session rebuilt
   its own reading of it.
2. **Every sentence was phrased about THE WALK.** Nothing said it governs the whole film — which is
   exactly why the dive never got it. The user's correction: *"it governs thrughout"*.
3. **"Noise" meant two different things** in two sections (gaze turn per metre vs scene busyness)
   and only the first was ever built. So *"still not using noise ratio"* was literally true.

## ⚖ THE LAW, as the user settled it this session — do NOT re-derive, do NOT re-litigate
- *"it governs thrughout"* — every beat, not the walk alone.
- *"isnt it best to use the bbxes to smell out the frame rate"* — the signal is **bbox**, not the ray
  fan. (Proved necessary: see the blind-fan finding below.)
- *"20% density, 80% noise ie rate of change"* → final: **"i would say its 100% rate of change of
  bbxes"**. Density is NOT the signal.
- *"because if frame not changing, not matter how dense the animation is not moving makes a boring
  show"* — the reason. A dense but static frame is a still; lingering on it is the boredom.
- *"when outside building it changes as the building is far off, or it hits the max ... We are in a
  range, thus no worry"* — **no outside/inside special case, no panorama branch.** The swing bounds
  both failure modes. Do not add a clamp.
- *"thus it is not using the noise ratio"* (on seeing the stalls) — the diagnosis was correct and is
  now measured: the per-beat smoothstep spanned **20x** while the law modulated only 1.1–1.5x.

## Built (`viewer/effects.js`, branch `fix/cpe-noise-law-dive` off `origin/main` @ fa6d251)
1. **`_densityAt(p)`** — count of `element_transforms` bbox centres within `CINEMA_FAN_FAR` of the
   point, counted in IFC space (one point converted, never the 48k rows). DB truth, deterministic,
   no new constant.
2. **The dive's cost table** — noise = normalised |central difference of that count| along 64
   uniform points of the dive line; cost per metre = `1 + (SWING-1)·noise`; frames stepped at equal
   cost via `_diveRemap` (same monotone-inverse shape as `_evenTurnRemap`).
3. **The dive's SECONDS bought by the same number** — `_diveEff/CINEMA_DIVE_MPS × (1+(SWING-1)·meanNoise)`,
   the §CPE_TURN_BUDGET half generalised to Beat 1.
4. **`_cinemaEaseFloored`** — `a·t + (1-a)·smoothstep(t)`, `a = 1/PACE_SWING`. Applied to the dive,
   the walk and the rise. Ends still 0→0 and 1→1, so no beat boundary and no path moves, but the
   rate at every seam is now `1/1.6` of the beat mean instead of ZERO.
5. `CINEMA_PACE_SWING` hoisted to module scope — one dial, read by every beat.

## Measured — `witness_cpe_noise_law.js`, **4/4 Duplex, 4/4 Terminal** (N5 below is the exception)
| gate | Duplex | Terminal |
|---|---|---|
| N1 slower where the bbox neighbourhood changes fastest | 1.17x slower | 1.44–1.68x slower |
| N2 residual after the ease inside [1/1.6, 1.6] | 0.68–1.04x | 0.72–1.16x |
| N3 pacing changed, path did not (dive still lands on settle) | 5.8e-15 m | 3.6e-15 m |
| N4 plan budget | 62 ms (was 80) | 226–295 ms (was 204) |
| **raw dive speed spread, before → after the floored ease** | **20x → 1.82x** | **25x → 1.64x** |
| N5 dive stall | **0.00 s** | **0.00 s** |

## 🔴 STILL OPEN, measured this session, NOT fixed — take these first
1. **Terminal's WALK stalls 2.27 s** (34 frames under beat-mean/1.6, at u=0.195). N5 catches it; the
   floored ease fixed the dive and the rise but not this. It is the parked §CPE_PACE_FLOOR
   trade-off, now with a live user report behind it ("last wpt stalling as the first one") and a
   number. The walk's `_paceFloor` bounds the COST slope against uniform arc, not the DELIVERED
   speed — that is the gap to close.
2. **Outside the envelope the gaze spins AWAY from the building** (user, live, 2026-07-27). Relates
   to §CPE_LOOK_HOME (next-list item 2) and to the earlier orbit-gaze observation. Not analysed.
3. **`witness_cpe_gaze_spin.js` (new, S1/S2)** — net-vs-accumulated gaze, the instrument T2
   structurally cannot provide. **PASSES on Duplex, Terminal AND Hospital on the DEFAULT plan**, so
   the reported "full rev at wp1" does not reproduce without an edited path. Worst waste: 15.2 deg
   (Duplex walk), 6.5 deg (Hospital orbit). Run it against an EDITED path next.

## ⚠ THE BLIND FAN — a rig finding that invalidates other measurements, not just this one
On Terminal in the headless rig `_cinemaFanMeshes()` returns **ZERO meshes**. Every `_cinemaFan`
call then reports the `CINEMA_FAN_FAR` sentinel, every `§CINEMA_SPACE` candidate reads
`enclosed=0%`, and the settle **falls back to bbox-centre at y=-31.5 (below ground)**. Any
fan-derived number measured on Terminal in this rig is meaningless. `§CPE_NOISE_LAW` logs
`elems=` for exactly this reason, and the law uses bboxes so it keeps working (Terminal:
`elems=48428`, noise 0.21→0.77→0.72→0.34 across the descent, where the fan saw nothing).

## Instrument corrections made this session — verify these rather than trust them
Three gates were wrong before they were right, each for a stated reason:
- N1 first measured density change **between consecutive FRAMES** — large wherever the camera moves
  fast, so it measured the pacing it was judging and read *inverted* (0.67x "faster where busier").
  Now sampled on uniform PATH position, as the law does.
- N1/N2 then compared **raw metres per frame**, which is dominated by the ease (the noise peak sits
  mid-dive, exactly where smoothstep peaks at 1.5). Now both divide the ease out.
- N2's expected model was **stale by one build** — still `6e(1-e)` after the beat moved to the
  floored ease, reading 0.55x. Now `a + (1-a)·6e(1-e)`.
This is the fifth, sixth and seventh broken instrument in this lane. `feedback_verify_checker_before_code_under_test`.

## Not a defect — the per-frame staging cycle in the bake log
`§PHOTO_STAGING on/off`, `§STILL_REFINE start/cancelled`, `§PHOTO_AO start/done/off` cycling once
per `§MAXQ_FRAME` is MaxQ's DESIGN: `cinema_maxq.js` calls `startStillRefine()` and waits for the
fold on every frame, so each frame is a converged photoreal still. It costs ~1.5–2 s of the
~2.3 s/frame and it is the reason a 914-frame Hospital bake runs ~35–45 min. Frames are captured
after `§PHOTO_AO done`, so the output is consistent; the flashing is the live viewport only. Do not
"fix" it without deciding to trade quality for time.

## ⚠ REGRESSION CHECK after the floored ease — `witness_cpe_even_turn`: T2 better, T5/T6 RED
Run immediately after the change, both buildings, same rig:
- **T2 (the jerk) IMPROVED**: peak gaze sweep **4.1 deg/frame** on both (was 5.2 Duplex / 6.9–7.3
  Terminal, cap 12). Flooring the ease did not cost jerk; it bought some.
- **T5 RED on Duplex, green on Terminal.** Believed a STALE MODEL, not a defect: T5 allows the walk
  `1.5 × PACE_SWING` because it is cost-parameterized and every other beat only `1.5` — but the DIVE
  is now cost-parameterized too (§CPE_NOISE_LAW), so its allowance is the same `1.5 × 1.6` the walk
  already gets. **Verify before changing it** — run T5 against `origin/main` and against this branch
  and compare which beat trips.
- **T6 RED on both.** Two causes tangled and they must be separated before either is "fixed":
  (a) its expected model is `mean × 6e(1-e)`, i.e. plain smoothstep — stale by one build now that
  the walk uses the floored ease (this is the identical correction N2 needed, where it moved the
  reading from 0.55x to 0.68x); and (b) Terminal's walk really does stall **2.27 s** (N5, above).
  Fix the model FIRST, then see how much stall is left.

## ⚖ RULING — the stalls are ACCEPTED (user, 2026-07-27). §CPE_PACE_FLOOR's parked question is answered
> *"i thnk the stalls are ok, it may mean a sec or two pause which is fine in the film"* ...
> *"but if the noise ratio tempers it a bit also ok"*

This closes the trade-off that was parked as "widen PACE_SWING, accept the stall, or accept more
jerk?" — **accept the stall.** Consequences, all applied:
- `witness_cpe_noise_law` N5 is a **REPORT with a 3 s ceiling**, not a 0.5 s gate. Gating a pause the
  user calls good film-making was gating their taste. The number still prints every run.
- **T6 must get the same treatment** (still RED, and it is now red against an accepted behaviour).
  It also still divides out plain smoothstep while the walk uses the floored ease — fix the model
  first, then demote it to a report with the ruling quoted.
- Tempering was done by FINISHING the law, not by adding a mechanism: the walk's cost increments are
  now weighted by the same bbox rate of change the dive uses, so a corner whose content is not
  changing stays cheap. Terminal's pause **2.27 s → 2.07 s**. Tempered "a bit", exactly as asked.

### The radius finding — a fixed neighbourhood makes the term INERT
A 60 m neighbourhood is constant across a 12–36 m walk: the walk's noise series measured
`maxChange=0` on BOTH buildings, i.e. the term did nothing and the crawl was untouched. The radius
is now **half the beat's own travel**, capped at the fan horizon (`_noiseRadius`): Duplex 6.3 m,
Terminal 12.7 m, and `maxChange` 0 → 157 / 219. Any future beat that adopts the law must pick its
radius the same way — this is the difference between the law running and merely being installed.

### 🔴 The one thing this widened — T5, and it is REAL, not a stale model
`T5 walk: peak 0.13m vs mean 0.04m = 3.0x against its 2.4x allowance` (Duplex, u=0.697). My earlier
guess that T5 was stale is **WRONG and is corrected here**: the dive passes at 1.2x, so the model is
fine — the walk's position spread genuinely widened, because the noise weight multiplies a cost that
was already spread by `1/(1-w)`. Worst case is `1.5 × SWING × SWING = 3.8x`, which is outside the
one dial the user set. **Next session decides: make the noise weight mean-neutral for the walk, or
state 3.8x as the walk's new bound.** Do not merge this branch into a release without that decision.
Branch: `bim-ootb` `fix/cpe-noise-law-dive` @ 5d89659 (pushed, not merged).

## 🔴 §CPE_BASIS_HALF_PIN — FOUND from the user's console, FIXED, and the gate CANNOT see it
**User, live Hospital, 2026-07-27: "Drag still jumps."** Their log settles it. Same session, same
edit — the plan while editing vs the plan at OK:

| | editing (every re-plan) | baking (at OK) |
|---|---|---|
| `yaw0 / pitch0` | −88.9° / **−16.9°** | +91.5° / **−81.0°** |
| `§CINEMA_EXIT facingDot` | +0.456 (cost 15.4) | **−0.450** (cost 16.8) |
| `§CINEMA_SPIN` | −35.3° | **504.3°, `class=behind(full-lap)`** |

A **different exit door** and **a full extra lap of spin**. The 504° also explains the earlier
"at wp1 it can spin around itself one full rev" — it is not in the default plan (which is why
`witness_cpe_gaze_spin` passes on all three buildings), it appears only in the BAKED plan after an
edit.

**Root cause:** `yaw0/pitch0` are read from `A.camera.getWorldDirection()` — the camera's
**ROTATION** — but `_withCamBasis` pinned only `camera.position` and `controls.target` and never
re-aimed. Editor re-plans therefore ran the pinned POSITION with the user's live orbited ROTATION,
while `finish()` sets position + target + `controls.update()`, which does re-aim, so the bake ran
the real basis. §CPE_PREVIEW_DIVERGENCE was only half closed. **Half a pin is not a pin.**

**Fixed:** `lookAt(basis target)` + `updateMatrixWorld` inside the swap; original quaternion
restored in the `finally`.

### ⚠ THE GATE IS BLIND TO THIS — build P4 before trusting this area again
`witness_cpe_preview_divergence` is **3/3 on both buildings after the fix — and it was ALSO 3/3
before it.** It MOVES the camera between editor and bake and never ROTATES it, which is exactly the
half that was broken. **P4, the missing gate:** orbit the camera while the editor is open (rotation
only, no translation), then compare the editor's last plan against the bake's plan on `yaw0`,
`pitch0`, the chosen exit GUID and `finalSpinDeg`. It must fail on `origin/main` and pass here — if
it passes on both, this diagnosis is wrong and the numbers above need re-deriving.
This is the **eighth** broken instrument in this lane; `feedback_verify_checker_before_code_under_test`.

## "Edited preview still not there" — NOT a regression, never built
Their log goes `§CPE_CLOSE action=ok edited=true` → `§CPE_LOCKS re-claimed` → `§CPE_APPLIED
frames=1409` → `§MAXQ_FRAME i=0/1409`. No second `§MAXQ_PREVIEW`; the only one ran BEFORE the editor
opened. This is **ask 5** of the FOUR ASKS block ("after edit and OK, it should do the 10 sec fast
preview again"), still unbuilt. It is a wiring job on the existing preview loop, and it must fly the
EDITED plan through the same `poseAt` the bake uses or it re-creates §CPE_PREVIEW_DIVERGENCE.

---

# ▶▶ START HERE — NEXT SESSION (2026-07-27, LATER session close). Everything below the next rule is
# the PREVIOUS handover, kept for its rulings; items 1, 2 and 3 of its list are now DONE.

**Merged to `main` as PR #1052 (`998750e`).** The user is flying it. `fix/cpe-drag-rationale` is a
docs-only follow-up, pushed, not yet merged.

## Done this session
| item | § | proof |
|---|---|---|
| 1 merge the branch | — | was ALREADY merged as PR #1050 before the session started. The 31-line delta vs `main` was only `§RESET_AMBIENT_AUTO`, which `main` deliberately reverted in #1048 — not missing cinema work. Do not re-check this. |
| 2 build P4 | §CPE_BASIS_HALF_PIN | `witness_cpe_preview_divergence.js` P4 ORBITS mid-edit (P1-P3 only dolly, which is exactly why they were blind). **RED on the half-pin: 3/4** — editor `yaw0=5.0 pitch0=-13.3 exit=1hOSvn6df7F8 spin=-500.6`, bake `yaw0=-135.0 pitch0=-43.3 exit=2OBrcmyk58Nu spin=0.0`. **GREEN fixed: 4/4** Duplex, Terminal, HHS_Office. The RED signature reproduces the user's live Hospital report (different exit door + a full extra lap). |
| 3 the 10s preview after OK | §CPE_PREVIEW_AFTER | `witness_cpe_preview_after.js` 4/4 Duplex + HHS_Office. G-PA-3 on HHS: the edited preview's `poseAt(0)` and the bake's first frame are **0.00m apart**. RED on the old build 1/4 (G-PA-4 correctly still passes there). One implementation, two call sites; `poseAt` resolves `plan` at call time so the second run flies the EDITED plan through the bake's own function. Edit-only, so guardrail 2 survives. |
| — the drag residual | §CPE_DRAG_TRACK | NEW, arose from the user flying the merge. See the ruling below. |

## §CPE_DRAG_TRACK — the drag question is CLOSED. Do NOT reopen it.
The user flew the merged build and reported: *"much better, as it delays the path but the wpts still
jumpy but its more intuitive to handle"*, then *"and the wypt jerk is gone.. great"*. Measured — two
stages that pull opposite ways, and measuring either alone explains neither:
- **cursor → band: 0.47x** (Duplex), 0.44x (Terminal), 0.46x (HHS). The handle lands ~103px behind a
  194px gesture. `§CPE_DRAG_SCALE`'s constant `envelope/canvasHeight` rate equals true perspective at
  exactly one depth; everywhere else cursor-lock is impossible by construction.
- **band → path: +1.98m** of path per metre of band (Duplex), +1.61m (HHS). This is the "lever".
- `§CPE_DRAG_LAND_FIRST` is provably clean: out-and-back residue **0.0000m**, and the re-plan on
  release moves the placed band **0.0000m**. That is the jerk the user says is gone.

**RULINGS (2026-07-27, shown the numbers):**
> *"I think it is fine.. the slight jump is no longer exagerated, it is in small measures so the user
> able to hold and see it coming back quicker than before... which is more of a feature as user need
> not drag further on fear of losing to big jump."*
> *"Its like a lever effect. Move small length, it exagerates bigger but not jump as the path has not
> react yet until release."*
> *"the amplification is good in sense the user need not do much dragging as it is hard over canvas
> that is overlay to get XY plane."*

So it **LOGS, it does not GATE** — the app emits `§CPE_DRAG_TRACK` on every real gesture, derived
in-app from the gesture's own pixels and the camera frustum, independent of `_dragBasis` so it can
contradict that code rather than echo it. The witness check is a drift report only (0.20-0.85x;
**1.00x means §CPE_DRAG_TELEPORT's frightening leaps are back**). Cursor-lock is NOT the goal here
and a future session must not "fix" the 0.45x.

## CLOSED, was item 4 — the dive base rate. Do NOT reopen, do NOT ask for a number.
User, 2026-07-27: *"The dive is OK as it has slowed down leave it alone."* `§CPE_NOISE_LAW` already
did the job. The previous handover's "decide it with a number, with them" was itself off-doctrine —
the noise ratio **governs throughout** (a settled ruling, see below), so there was never a constant
to ask them to pick. `CINEMA_DIVE_MPS = 20` stays as it is. Asking again is the drift this note exists
to stop.

## ⛔ §CINEMA_TAIL_DECAY — RETRACTED. The Hospital film below is CONTAMINATED DATA, not a pacing
## measurement. Do NOT act on it. Kept only because the retraction is the finding.
**User, 2026-07-27, after it was written:** *"The hospital just before was frozen tab due to been out
of focus."* That bake ran backgrounded. rAF throttled, `§MAXQ_FRAME_TIMEOUT` captured frames "as-is"
that had never converged, and consecutive captures ended up near-duplicates — which is precisely why
the measured inter-frame change collapsed toward the end. The ~30% tail is the CAPTURE dying, not the
camera slowing. Every structural conclusion drawn from it below (orbit/rise lack a noise term →
therefore the film ends dull) is unsupported by that artifact.

**The lesson, worth more than the retracted claim:** measuring the delivered artifact is only sound if
the artifact was produced under valid conditions. "It came out of the real pipeline" is not the same
as "it is valid evidence". Ask how the bake ran before drawing anything from a film.

**The re-use, which IS valuable — this makes open item 8 detectable.** A backgrounded bake now has a
fingerprint readable straight off the MP4 with no console access: the inter-frame change decays toward
zero over the final seconds while the earlier beats look normal. Any future "is this film any good"
check should run the ffmpeg command below FIRST to reject contaminated captures before analysing
pacing at all.

---

## §CINEMA_TAIL_DECAY — the original (retracted) entry, for the method only
The user pointed at their newest bake (*"Latest MP4 in downloads can be indication what speeds"*) —
`~/Downloads/BIM_MaxQ_Hospital_1785146208680.mp4`, baked 17:56 local on the MERGED build, so it is
the current law's real output, not a lab run. **45.4s, 681 frames @15fps, 1852x960.**

Measured the way the law itself defines the signal — 100% rate of change — with no eyeballing:
```
ffmpeg -v error -i FILM.mp4 -vf "scale=160:-1,format=gray,tblend=all_mode=difference,\
signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=yavg.txt" -f null -
```
`YAVG` per frame = mean absolute inter-frame difference (0-255 grey) = how much of the frame is
changing. Per-second means:

| beat | seconds | rate of change |
|---|---|---|
| dive | 0-3s | **25-42** — fastest in the film, peak 41.9 at 2s |
| interior walk | 8-15s | 5-9 |
| walk, later | 19-21s | ~14 |
| spike | 26s | 21.5 |
| **exterior tail** | **40-45s** | **3.4-5.3 — slowest in the film** |

`mean 11.54  min 3.34  max 41.87  spread 12.5x  p90/p10 4.58x`

**Two findings, and they point opposite ways:**
1. **No stalls anywhere** — nothing falls below 25% of the mean. The floored ease is doing its job on
   the delivered artifact, not just in the witness. `§CPE_NOISE_LAW`'s dive-stall claim holds up.
2. **The film ends on its quietest 6 seconds.** The tail decays monotonically from 13.9 at 34s to
   3.44 at 45s — ~30% of the mean, and 12x slower than the dive. The exterior orbit+rise is where
   the pacing now falls over, NOT the dive (which the user has explicitly closed).

`CINEMA_PACE_SWING = 1.6` can bend a beat by at most ±1.6x; the delivered spread is 4.58x (p90/p10).
The orbit/rise beats take their seconds from `360 / CINEMA_TURN_DPS` and `_pullDist /
CINEMA_PULLBACK_MPS`, neither of which carries a noise term — so structurally the exterior beats
never got the treatment the dive and walk got.

### ⚠ CORRECTED SAME SESSION — the long tail decay is NOT general. Do not chase it as one.
A second film, `~/Downloads/TerminalHiQ.mp4` (18:29, same merged build, WITH the edited preview,
user-confirmed working), measured the same way — **44.1s, 662 frames**:

| | Terminal 07:16 (before today) | **Terminal 18:29 (today)** | Hospital 17:56 |
|---|---|---|---|
| p90/p10 | 4.90x | **3.86x** | 4.58x |
| last-6s mean vs film mean | 94% | **81%** | ~30% |
| min second | 3.50 | **0.52** | 3.34 |

Terminal's tail holds at 81% — nothing like Hospital's ~30%. **The exterior neglect is real in the
code but only bites on some geometry**, so the Hospital reading was over-generalized when first
written above. Also note the delivered evenness IMPROVED 4.90x -> 3.86x against yesterday, on a film
twice as long (the harder case) — the user's *"much better than yesterday"* is corroborated, and this
is the number to defend in future changes.

### §CINEMA_END_FREEZE — the actual residue, small and specific
Both films end on their quietest second, and Terminal's is a near-total halt: the last seconds run
`... 15.0, 5.3, 0.52` against a mean of 12.10 — a 23x drop inside 1.5s, and a 103.7x spread across
the film driven entirely by that one second. Hospital does the same thing more gently (3.44). The
camera stops dead before the film ends. Bounded, reproducible, visible in a single number
(`min second`) the user can check.

⚠ **Hospital's 3.44 is NOT evidence for this** — that film was a backgrounded bake (see the
retraction above) and its whole tail is invalid. The claim rests on **Terminal alone**, which the user
watched and confirmed good, so its 0.52 is a real film ending on a real halt. Before building
anything here, bake one more foreground film and check whether the last-second collapse repeats. One
artifact is not a pattern — that is the mistake the retraction above records.

## The three-movie facade — why this lane is not a side feature (user framing, 2026-07-27)
> *"this 3 movie scrubbable TM, Fly, and MaxQ gives the facade signals"*
> *"Distro is no issue as the videos are progresively shown and noted by growing number beginning
>  awareness in reddit, oSARCH and Linked as Youtube"*

**TM (Time Machine), Fly (Fly Tour) and MaxQ are one family, not three features** — three scrubbable
films that together are the product's outward-facing surface. The videos ARE the distribution channel
(reddit, OSArch, LinkedIn, YouTube), and awareness is already growing off them. So a pacing defect in
MaxQ is not a polish item: it is a defect in the thing that reaches people.

Two consequences for anyone working this lane:
- **Judge the delivered film, not the code path.** The ffmpeg rate-of-change measurement above is the
  right instrument, and it applies to all three members — a TM or Fly clip can be measured the same
  way and compared against MaxQ's numbers.
- **Do not treat "it markets itself" as someone else's problem to solve later.** It is already
  working; the job is to not ship a film that undercuts it. That is exactly what a silently
  backgrounded bake does (item 8), which is why it is promoted.

## Still open — in order
5. **§CINEMA_END_FREEZE (above)** — the camera stops dead in the final ~1.5s (Terminal's last second
   reads 0.52 against a mean of 12.10). Bounded and reproducible. Gate it on the delivered MP4's
   `min second`, a number the user can check themselves. Give `orbit`/`rise` the noise term the dive
   and walk already carry — but treat §CINEMA_TAIL_DECAY as building-dependent, NOT as a general
   defect: Terminal's tail is fine at 81% of mean, only Hospital's collapsed.
6. **Outside the envelope the gaze spins away from the building** (user, live, never analysed).
   Almost certainly the same exterior-beat neglect as §CINEMA_TAIL_DECAY — do them together.
7. **T5 / T6 are RED, different answers each.** T5: the walk's position step is 3.0x against a 2.4x
   allowance — REAL (noise weight multiplying an already-spread cost, worst case 1.5·SWING²=3.8x).
   Decide: mean-neutral walk noise, or state 3.8x as the bound. T6: stale model (still plain
   smoothstep) AND it gates a stall the user has ACCEPTED — fix the model, then demote it to a
   report quoting the ruling, exactly as G-TRACK-1 was demoted above.
8. **Background-tab bake degrades QUALITY, not just speed — PROMOTED, this is the one that silently
   ruins output.** `§MAXQ_FRAME_TIMEOUT i=683 capturing as-is` is a frame that never converged, and
   the Hospital film above proves it reaches the delivered MP4: a whole backgrounded tail of
   near-duplicate frames that a viewer would read as the film stalling. The user lost a 45s Hospital
   bake to it today and only knew because they remembered the tab was unfocused. Options: drive the
   fold off timers rather than rAF, or refuse to advance while `document.hidden` and log the pause.
   **Whichever is chosen, the bake must SAY it was backgrounded** — a film that degrades silently is
   worse than one that pauses. Detector already exists (ffmpeg command above): tail change decaying
   toward zero while earlier beats look normal.
9. **`GL_INVALID_OPERATION: Feedback loop formed between Framebuffer and active Texture`** floods the
   console at load. A pass samples the texture it renders into; those draws are DROPPED by the
   driver. Undiagnosed — note it before trusting any still/AO frame timing.

## Rig notes learned the hard way this session
- `/tmp/wt-turn` on port 8403, buildings symlinked. **Reuse it.** `PORT=8403 node witness_<name>.js`.
- **puppeteer's default `protocolTimeout` (180s) is too short** — a blocking plan blows it and the
  abort READS LIKE A PRODUCT FAILURE. Both cinema witnesses now set `protocolTimeout: 900000`. The
  wrapper's `exit=0` lied; the log is what showed the crash. Read the log, every time.
- **Hospital's editor does not open inside 300s under swiftshader** — P4's Hospital coverage is a rig
  limitation, not a gate result. Use **HHS_Office_Federated** instead (user's instruction: *"need not
  use DX et al, just HHS_Office"*), which completes and is where the 0.00m G-PA-3 came from.

---

# ▶▶ (PREVIOUS handover — 2026-07-27 earlier session close). Everything above this line is history.

**Branch: `bim-ootb` `fix/cpe-noise-law-dive` @ `5b63f1e`, pushed, NOT merged.** The user has never
flown any of it — their live Hospital runs are all on `origin/main`, which is why every "still not
fixed" report tonight is expected rather than contradictory. **Merging it is step 0.**

## What is on that branch (all witnessed, none in front of the user yet)
| § | what | gates |
|---|---|---|
| §CPE_NOISE_LAW | the dive is paced by bbox rate-of-change; dive seconds bought by the same number | `witness_cpe_noise_law` 5/5 + 5/5 |
| §CPE_NOISE_LAW (walk) | the walk's cost carries the same term; radius = half the beat's travel | Terminal pause 2.27s → 2.07s |
| floored ease | `a·t+(1-a)·smoothstep`, `a=1/PACE_SWING`, on dive/walk/rise | dive spread 20x → 1.82x, dive stall 0.00s |
| §CPE_DRAG_SCALE | drag rate is building-derived, not camera-distance-geared | 0.151→0.063 (Duplex), 0.227→0.085 (Terminal) |
| §CPE_DRAG_LAND_FIRST | no re-plan during a drag; the film re-derives once on release | `witness_cpe_drag` 4/4 + 4/4 |
| §CPE_BASIS_HALF_PIN | the pin now re-aims the camera, not just moves it | ⚠ gate is BLIND, see below |
| §CPE_HOLDER_INTEGRITY | asserts the calc never writes back into the authored bands | never fired = holder is clean |
| §LOG_SPAM_THROTTLE | RENDER_LOOP / IDLE_GATE park+wake: first 3, then every 25th | — |
| `witness_cpe_gaze_spin` | NEW: net-vs-accumulated gaze, sees a revolution T2 structurally cannot | 2/2 Duplex, Terminal, Hospital |

## Do these in order
1. **Merge the branch.** Nothing below can be judged by the user until it is live.
2. **Build P4 — the rotation gate.** `witness_cpe_preview_divergence` was 3/3 BEFORE and AFTER the
   §CPE_BASIS_HALF_PIN fix, so it cannot see it: it moves the camera and never ROTATES it. P4:
   orbit while the editor is open, then compare the editor's last plan with the bake's on `yaw0`,
   `pitch0`, exit GUID and `finalSpinDeg`. **It must be RED on `origin/main`** — if it is green on
   both, the §CPE_BASIS_HALF_PIN diagnosis is wrong and its numbers need re-deriving.
3. **The 10s preview after OK (ask 5) — still unbuilt**, confirmed from their log: `§CPE_CLOSE` →
   `§CPE_APPLIED` → `§MAXQ_FRAME i=0` with no second `§MAXQ_PREVIEW`. Wiring job on the existing
   preview loop; must fly the EDITED plan through the same `poseAt` the bake uses.
4. **The dive base rate.** User: *"the dive in ... its same too fast"*. The law bends ±PACE_SWING
   around `CINEMA_DIVE_MPS = 20`, and measured only ×1.15 dive-seconds on Terminal. 20 m/s is 8.7×
   the walk pace and is a flat constant of exactly the kind `CINEMA_WALK_MPS = 1.3` was before the
   user called it a pedestrian. **Decide it with a number, with them.**
5. **T5 / T6 are RED and each needs a different answer.** T5: the walk's position step is 3.0x
   against its 2.4x allowance — REAL, caused by the noise weight multiplying an already-spread cost
   (worst case 1.5·SWING² = 3.8x). Decide: make the walk's noise weight mean-neutral, or state 3.8x
   as the walk's bound. T6: stale model (still plain smoothstep) AND it gates a stall the user has
   now ACCEPTED — fix the model, then demote it to a report, quoting the ruling.
6. **Outside the envelope the gaze spins away from the building** (user, live, not analysed).

## Rulings settled tonight — do NOT re-litigate, do NOT re-derive
- The noise ratio **governs throughout**, every beat, not the walk alone.
- The signal is **bboxes**, **100% rate of change**, no density term. *"if frame not changing, not
  matter how dense the animation is not moving makes a boring show"*.
- **No outside/inside or panorama special case** — *"We are in a range, thus no worry"*.
- **Stalls are fine**: *"a sec or two pause which is fine in the film"*; tempering is optional.
- **No clamps** — *"putting stupid clamps only breaks other stuff"*; fix the source instead.
- The MaxQ per-frame `STILL_REFINE`+`PHOTO_AO` cycle is the bake's DESIGN, not a defect.
- UNDO works (the earlier LIVE BUG was a wrong keypress) — do not rebuild the far-drag repro.

## Rig
`/tmp/wt-turn` on port 8403 serves this branch, buildings symlinked, clean and pushed. **Reuse it.**
`PORT=8403 node witness_<name>.js`. Read the log after every run — exit code is not evidence.

## Two live observations added at close (2026-07-27), both already half-answered
1. **"the trick to avoid wpt jump is to put a delay after dropping it, as holding it long ensure it
   does not jump"** — this CONFIRMS §CPE_DRAG_LAND_FIRST rather than adding a new cause. Holding
   still lets the in-flight 120 ms re-plan finish and settle BEFORE release; releasing quickly drops
   the waypoint while a ~1 s re-plan is still in flight, and it lands afterwards on a changed plan.
   The fix already on the branch removes mid-drag re-plans entirely — it is their "delay after
   dropping", done at the source. **They have not flown it yet** (branch unmerged), so their
   workaround is still the only thing available to them. Verify against this exact gesture after
   merging: fast drag + instant release, on Hospital.
2. **"if i do something else on another tab it may leak... giving it focus by going to the console
   seems to restore it"** — NOT a leak, it is background-tab rAF throttling, and the log measures
   it: on `§TAB_VISIBILITY visible=false` the fold's own timings balloon (`STILL_REFINE done
   elapsedMs` 850 → 11190 → 25589 → 45355; `PHOTO_AO totalMs` 750 → 21695) and `perFrameMs` goes
   2156 → 12168, ending in `§MAXQ_FRAME_TIMEOUT i=683 — capturing as-is`. Refocusing restores it
   because rAF un-throttles. **A frame captured on that timeout is a frame that never converged**,
   so a backgrounded bake silently degrades quality, not just speed. Same root cause family as
   §MAXQ_IDB_SALVAGE (which already blames background throttling). Options to weigh: drive the fold
   off timers rather than rAF, or refuse to advance while `document.hidden` and log the pause.
3. **`GL_INVALID_OPERATION: Feedback loop formed between Framebuffer and active Texture`** floods the
   console at load until Chrome silences it ("too many errors"). A pass is sampling the texture it
   is rendering into — real, unrelated to pacing, and it means those draws are DROPPED by the
   driver. Not diagnosed; note it before trusting any still/AO frame timing.

---

# §CPE_HOSE — the whole path editable, clips off it, and a construction checkbox
**Discussed and AGREED with the user 2026-07-28. SPEC-ONLY — nothing here is built, and the user's
own framing was "No hard laying out yet." What follows is the settled INTENT plus the traps found by
reading the shipped code; the build order and the open questions below are deliberately unresolved.**

## Origin — the user's proposal, verbatim
> *"I like to explore a bit on the alt-c mechanism we just did. U agree we use that? As i wana propose
> something that expands further the 3 point edit system. What if we make the whole path editable? And
> clicking any point will open an aribitary '3 point band' or just dragging a point where the whole
> path is like a long rubber hose, reacting only by proximity to the point been dragged, and the rest
> just curves along. The final start stop also draggable. Now the next stage is tricky but kills two
> birds. It is to mark start and stop along the path so a clip can be derived. Such usefullness is the
> user can create any walk thru or viewing talking point on the fly. And this construction bit is a
> checkbox to animate its buildup as cam goes along. As in movies or other's animation, its giving the
> impression and not chronologically accurate. But the elements laying on each other according to its
> part in the 4D is educational."*

## Why Alt+C is the right base — the reason is structural, not preference
The editor draws the path by sampling `plan.poseAt(t)` (§CPE_BANDS "Also asked" → shipped as the
full-film tube). **The tube the user drags IS the film the bake flies.** Any other editing surface
would be a second implementation of the path, free to drift from it. Cost is already measured and is
not a blocker: re-plan **13 ms Duplex / 82 ms Terminal**, sampling 240 poses **0.3 ms** (§CPE_BANDS).
Live deformation is affordable on today's numbers.

## 1. The hose and the band are ONE gesture at two falloff radii (agreed)
Rule 2 of §CPE_BANDS — *"the bands are short straight parts of the path… their length and
straightness does not morph"* — is settled and stays settled. It does NOT conflict with this proposal
once the two are unified rather than shipped side by side:
> **radius → 0 = today's rigid band pivot. Large radius = the rubber hose.** One control, one mental
> model. Do not ship "click for a band" AND "drag for a hose" as two affordances — that is where this
> gets fiddly to use, and it is the one thing in the proposal I pushed back on (user agreed).
This also answers **FOUR ASKS item 3** (*"the stick band should curve along more.. now it is short, if
twisted its curve still short.. having more make it more useful to craft"*) — that complaint and this
proposal are the same complaint, and the falloff radius is its general answer. Band tangent-authoring
survives: the tangent is still what shapes the curve, which is the whole reason bands beat points.

## 2. ⚠ THE LAW: falloff is measured in PATH ARC-LENGTH, never in world distance
A world-space influence radius deforms an out-and-back path's RETURN leg — 2 m away in space, far
away in the film. **This exact class of bug is why the `§CPE_DRAG_REACH` cap was removed** (#1038,
*"G-DRAG-3 measured it BREAKING out-and-back"*). A world-distance hose walks it back in through the
front door. Falloff parameterises on `t` / arc length along the path. Non-negotiable; witness it on an
out-and-back before anything else about the hose is believed.

## 3. Storage: store the DRAG OPERATIONS, not the resulting curve
§CPE_BANDS rule 6 stores **3 bands, not 6 points**, deliberately — rigidity then survives save/reload
*structurally*. A free-form hose cannot store a polyline without discarding that guarantee. Resolution:
> persist each edit as `(arc-length position, falloff radius, displacement)` **layered on the derived
> path** — not the deformed polyline.
Small; reload-safe; the authored intent survives a re-derived base path (different building version,
changed dive origin); and it composes with the existing §CPE_UNDO snapshot stack instead of fighting it.

## 4. A hose can make a curvature spike a rigid band structurally could not — SHOW it, don't forbid it
§CPE_EVEN_TURN, §CPE_POSITION_GATE and the jerk gates are all downstream of the curve, so they still
apply unchanged. But rule 8 stands — **authored is authored**, no collision fighting, no silent
correction. The editor should REPORT the jerk/curvature after a drag (the numbers already exist), so
the user sees what they made and decides. Correcting it for them would be the same paternalism the
band rules already rejected.

## 5. §CPE_CLIP — in/out markers. The cheapest part, and the biggest product win
`poseAt(t)` is already normalised 0→1 and `cinema_maxq.js` already accepts `opts.frames`. A clip is:
```
poseAt(t0 + t * (t1 - t0))
```
That is close to a one-line change to the existing bake loop. Named markers along the path ARE the
user's *"viewing talking point"*.
- **Markers live in the `bim_ootb_cinema_paths` IndexedDB store already sketched in §CPE_IDB_PATH_STORE**
  — same shape (many named entries per building, keyed `buildingId + name`). **Do not mint a second store.**
- **Two birds, and the second is bigger than clips:** the same markers can drive a LIVE walkthrough
  with stops, not only a bake. Author once → present live, or cook a film from any segment.
- Start/stop draggable (the user's *"final start stop also draggable"*) is the degenerate case of the
  same marker mechanism — t=0 and t=1 markers — not separate machinery.

## 6. §CPE_BUILDUP — the construction checkbox = §MAXQ_TIME mode D
Wires to `prompts/PHOTOREAL_STILL_RENDER.md` §MAXQ_TIME mode D (*construction ordered BY the camera
path*) and its 2026-07-28 code-read addendum. Mode D is a **re-sort of the synthetic build order**
(`injectGantt()` re-keys `start_ts` from arc-length along the flight) — no new render path. This
checkbox is its UI.

**The honest label is FORCED, not a hedge.** There is no 4D schedule in the data: `Terminal_Hi.db` has
no `tasks`/`task_elements` tables at all, `Hospital_extracted.db` has them EMPTY (`tasks=0`). So it can
only ever be a DERIVED assembly order. The user reached the same conclusion independently — *"its
giving the impression and not chronologically accurate"* — and the educational claim survives intact,
because elements still land in dependency-plausible order (Z-band + `SEQUENCE_RULES`). **Say "derived
build order", never "the schedule"**, or a BIM audience will ask for the P6/MSP link.

Two consequences, one free win and one trap:
- ✅ **Key the reveal to ARC LENGTH, not to time** → when §CPE_PACE_LOS slows the camera in a tight
  space, the buildup slows with it automatically. The construction breathes with the pacing for free.
- ⚠ **With a clip, compute the buildup over the WHOLE path, then sample it by the in/out window.**
  Re-normalising the buildup to the clip makes every clip start from bare ground — wrong, and far less
  interesting than a clip that opens on a partially-built building.

## Open questions — NOT decided, ask before building
1. **Falloff shape** — linear, smoothstep, or gaussian in arc length? Affects how "hose-like" it feels;
   pick by trying, not by argument.
2. **Is the radius per-drag or a persistent editor setting?** (Per-drag is more expressive; persistent
   is fewer controls. The "simplest fastest tour maker" scope guardrail argues for persistent.)
3. **Do markers survive a path edit that changes arc length?** A marker at `t=0.4` means a different
   place after a big drag. Anchor markers to arc-length-from-start, to a nearest waypoint, or accept
   the drift?
4. Does §CPE_BUILDUP force ARC-only (§MAXQ_TIME's ARC = 35,553 of 48,433 on Terminal), or is the
   discipline filter a second checkbox?

## Witness claims — write these before any implementation (spec-first)
- **W-HOSE-ARC** — drag on an out-and-back path deforms ONLY the near-in-`t` leg; the return leg's
  sampled poses are unchanged within tolerance. This is §2's law, and it is the FIRST gate.
- **W-HOSE-BAND** — falloff radius 0 reproduces today's rigid band pivot pose-for-pose (the unification
  in §1 is real, not approximate).
- **W-HOSE-RELOAD** — save → reload → the path re-forms from stored drag ops, poses match within
  tolerance (§3's structural guarantee).
- **W-CLIP-WINDOW** — a bake with markers `[t0,t1]` produces frames whose poses equal
  `poseAt(t0 + t*(t1-t0))`, and `frames` scales with the window.
- **W-BUILDUP-SAMPLE** — a mid-path clip with the checkbox on OPENS on a partially-built model:
  placed-element count at the clip's first frame is > 0 and < the count at its last frame (§6's trap).
- **W-BUILDUP-PACE** — reveal rate tracks arc length, not wall clock: where pacing slows, elements per
  second falls proportionally.

## Explicitly NOT in this section
Dive origin and orbit authorability (§CPE_BANDS "still open" — bands 4 and 5), the §CINEMA_SPACE
attic-pick (owned by another session), and collision avoidance on an authored path (rule 8 forbids it).

## §CPE_AIM_DENSITY — outside the perimeter with nothing near, turn perpendicular to the mass
**User directive, 2026-07-28, given with "proceed to implement":**
> *"when the rope passes the final building perimeter and no substantial building part nearby, then
> camera turns perpendicular towards the densest nearest part of the building."*

**Why it is needed:** the hose lets the user fling a stretch of path far outside the building. The walk
gaze is a LOOK-AHEAD along the path (`_beat3Pose` → `_lookAhead`), so out in open ground the camera
looks at *nothing* — empty sky/ground for seconds of film. This rule gives those stretches a subject.

**The trigger — two conditions, both measured, neither guessed:**
1. **Outside the perimeter** — the pose is outside the building footprint (IFC-space XY bbox, the same
   `base`/`envelope` the plan already computes), not merely far from the last waypoint.
2. **Nothing substantial nearby** — `_densityAt(pose, R_near)` is at/below a floor, where `R_near` is
   DERIVED from the building (a fraction of `envelope`), not a picked metre value. `_densityAt` and
   `_densPoints` already exist for §CPE_NOISE_LAW — reuse, do not invent a second proximity system.

**The aim:** find the densest cluster (coarse grid over `_densPoints()`, cell count scored against
distance so it is the densest *nearest* part, not the densest part of the site), then aim at it **with
the along-path component projected out** — that is literally "perpendicular": the camera turns side-on
to its own travel and faces the mass. If the cluster lies dead ahead or dead behind (the projection
degenerates), fall back to the unprojected direction rather than inventing a sideways look.

**Blending is mandatory, not polish.** A gaze that snaps on when the trigger fires is exactly the jerk
§CPE_JERK_DEFINITION and §CPE_EVEN_TURN exist to kill. Ramp in and out on smoothstep over a fraction of
the path, so the rate is zero at both ends. **Gate: peak deg/frame must not regress** — the existing
turn witness is the instrument, and this change must be run against it, not merely eyeballed.

Witness: `§CPE_AIM_DENSITY outside=1 nearDens=<n>/<floor> R=<m> cell=(x,y,z) elems=<n> perpDeg=<d>
blend=<w>` — plus the unchanged peak-turn number, to prove the ramp did not buy the subject with a jerk.

## §CPE_AIM_DEPTH — surrounded by close surfaces, face the FURTHEST dense one (2026-07-31, IMPLEMENTED)
**User directive:** *"the camera auto faces where the building fills up its canvas scene POV and is
furthest. Ie if it is flying into area with a floor, a left side wall and front wall, it turns to face
which is further."* Clarified: *"must be logical as stated to also X depth distance where if it is near
a wall along a corridor it wont face dense fleeting but look to a more distance facade."*

**Mirror of §CPE_AIM_DENSITY, opposite trigger.** That rule fires OUTSIDE the perimeter with nothing
near (an empty flight needs a subject). This fires when the camera is **surrounded by close surfaces**
— a corridor, a corner — the opposite regime. Both reuse the SAME grid (`_aimGrid`/`_densPoints`) —
one proximity system, not two.

**Why "furthest" is not just taste:** a near subject sweeps across the frame far faster than a distant
one for the same camera translation (angular rate ~ v/d). Facing the closest dense thing — the
"fleeting" corridor wall the user named — is the worst subject choice available, not a neutral one:
it maximises gaze angular velocity, the exact quantity §CPE_EVEN_TURN already exists to bound. This
rule is that same argument applied to WHICH subject is chosen, not how fast the camera moves.

**Trigger:** soft density (`_aimSoftDensity`, reused) within a TIGHT radius (`envelope × 0.05` —
deliberately stricter than §CPE_AIM_DENSITY's `0.12` "near": that means "nothing substantial", this
means "close enough to whip past") crosses a floor → continuous smoothstep, `§CPE_AIM_DENS_FLOOR`-style
constant (10), same shape as the existing rule's trigger.

**Subject — weighted centroid, weight = count × distance (inverted from §CPE_AIM_DENSITY's
count/(1+d)³):** that rule rewards NEAR; this rewards FAR. Bounded to a search bubble
(`envelope × 0.30`) so it stays "the furthest of the NEARBY facades", not a site-wide reach, and
excludes cells inside the trigger's own close radius (the fleeting wall can't win by being dense).

**MEASURED correction, found by the witness before shipping — the floor pollutes a plain distance-only
centroid.** First cut: weighted centroid over ALL nearby cells beyond the close radius. `tests/
test_aim_depth.js`'s synthetic corridor (floor + close left wall + further front wall, left wall made
DENSER on purpose) came back **RED** — the subject landed near the floor centroid, 1.1m from the near
wall, nowhere near the intended far wall. Cause: a floor is broad and moderately-close-on-average, and
a plain distance-weighted average blends it in with the walls rather than choosing between them —
"face the furthest wall" is a discrete choice among surfaces, not a blend of everything nearby.
**Fix — verticality filter, reusing the SAME grid cells:** `§CPE_AIM_GRID` cells now also track
`zMin`/`zMax` (purely additive, §CPE_AIM_DENSITY only ever reads `n/x/y/z`, unaffected). A cell only
counts as a facade candidate if `zSpan > cellSize × 0.3` — a wall's points span real height within one
cell, a floor/ceiling's do not. No new proximity data, no new pass over `element_transforms`.

**Aim + blending — reused verbatim from §CPE_AIM_DENSITY, not reinvented:** the fading (never
switching) perpendicular projection, and the seam taper that is gone by the walk→orbit hand-off. That
rule's own comments record measuring TWICE that a hard switch — not the subject choice — was the
actual jerk source; re-deriving that lesson here would be pointless when the exact same machinery
applies unchanged.

**Witness:** `tests/test_aim_depth.js` (pure-math replica, no browser needed — same whitebox convention
as `tests/test_host_order.js`) — W-AIM-DEPTH-TRIGGER (boxed-in trigger fires), W-AIM-DEPTH-SUBJECT
(picks the further wall, not the closer denser one — **RED before the verticality fix, GREEN after**),
W-AIM-DEPTH-CONTROL (with the close-exclusion disabled, confirms the naive version really would have
picked the close wall — proves the exclusion is load-bearing). **Not yet run:** a live/headless peak
deg/frame regression witness (the `§W-HOSE A2`-style jerk gate `§CPE_AIM_DENSITY` itself was held to)
— the pure-math witness proves the SUBJECT SELECTION is correct, not yet that composing it with
§CPE_AIM_DENSITY and the rest of the gaze pipeline stays inside the turn-rate bound on a real building.
Do that pass before calling this fully closed, same bar as the rule it mirrors.

**Shipped:** `viewer/effects.js` (`_aimDepthWeight`/`_aimDepthSubject`/`_aimDepthBuild`/`_aimDepthAt`/
`_aimDepthApply`, wired into `_beat3Pose` right after the existing `_aimApply` call — the two compose
rather than race since their triggers are near-disjoint by construction: one needs low density nearby,
the other needs high density AT CLOSE RANGE). Witness: `§CPE_AIM_DEPTH e3=<t> floor=<n>
subject=(x,y,z) perpDeg=<d> blend=<w> seamTaper=<w>` + `§CPE_AIM_DEPTH_SERIES` (build-time probe/smooth
report, mirrors `§CPE_AIM_SERIES`).

### ⚠ LIVE-TEST FINDINGS 2026-07-31 — the "not yet run" caveat above was right to flag this
The predicted gap surfaced the same day, live, on a Hospital buildup bake. Three distinct defects,
found in order as the user tested — each one real, none guessed at:

**D1 — radii saturate on a large building (MEASURED, PARTIALLY FIXED).** `_AIM_DEPTH_CLOSE_FRAC`/
`_AIM_DEPTH_SEARCH_FRAC` are pure envelope fractions. On Duplex (envelope~15m) that's corridor-scale
(0.75m/4.5m) and correct — the shipped witness (`tests/test_aim_depth.js`) used exactly that scale.
On Hospital (envelope=147m) the SAME fractions give Rclose=7.4m/Rsearch=44m — big enough that
`§CPE_AIM_DEPTH_SERIES` reported `active=65/65 maxBlend=1.00` (the rule never turned off for the
whole walk) and the "furthest facade" subject landed at `(45.0,82.9,180.4)` — within a few metres of
the building's own measured centroid (`§CENTRES_RESULT` gives `46.2,93.0,181.3`), not a specific
nearby wall. **Fix applied:** clamp both radii to an absolute-metre range (`Rclose` 1.5–4.5m, `Rsearch`
4–18m) so a huge building can no longer balloon the search into "half the site." **MEASURED this did
NOT fully fix it**, and this matters more than the radius itself: 40 real sample points inside
Hospital's actual geometry triggered "boxed in" 40/40 times at the old uncapped radius and STILL
38/40 at the new clamped one. The real problem is `_AIM_DEPTH_DENS_FLOOR=10` (elements-within-radius
to count as "surrounded") — a building with 63,182 elements puts 10+ within almost any few-metre
radius almost everywhere, so shrinking the radius barely moves it. **What the floor actually needs:**
scaled against the building's OWN typical local density (e.g. elements per m³ over its footprint),
not a fixed absolute count — so "surrounded" means "denser than this building's own norm," which
adapts across building sizes the way the radius clamp alone cannot. **Not built** — this is a
calibration that needs live visual iteration (does the trigger feel right at the tuned value?), not
something to guess at from a spreadsheet. Do this FIRST in the next session, before anything else in
this file, using the same 40-point-sample harness as a starting instrument.

**D2 — no incoming-seam taper (FIXED).** `§CPE_AIM_DENSITY`'s existing `wSeam` only taper the OUTGOING
end (walk→orbit, near e3=1). Neither aim rule had the mirror for the INCOMING end (spin→walk, e3 near
0) — the pre-existing `_openU`/`wOpen` blend (right before either aim rule runs) eases the gaze from
wherever the spin left off, but §CPE_AIM_DEPTH then overrode that eased direction at near-full
strength from e3=0 (D1's saturated trigger meant `blend=1.00` immediately), discarding the handoff the
instant it happened. **Proof, from the user's own pasted log, not inferred:** `§CPE_SEAM_CONTINUOUS
seamGapDeg=94.6–100.2` (that witness's own comment: *"must be ~0"*). **Fix:** `_aimDepthApply` now
takes an `openU` parameter and applies the SAME smoothstep-over-`_openU` taper the caller's own seam
blend uses — zero rate at the seam, by construction, same shape as the existing outgoing taper.
Witness gains `openTaper=<w>` in the `§CPE_AIM_DEPTH` log line. **`§CPE_AIM_DENSITY` has the identical
structural gap** (no incoming taper either) but wasn't touched — its trigger (outside+empty) rarely
coincides with e3≈0 so it hasn't manifested; flagged here, not fixed, per minimal-blast-radius on a
already-shipped, already-witnessed feature nobody reported broken.

**D3 — blind to §CPE_BUILDUP (FOUND BY THE USER, GUARDED, NOT YET PROPERLY FIXED).** User, watching a
buildup bake at frame 60/1386 (168/63,416 elements placed): *"it is turning when buildup has not shown
any construction yet, so it has to look at actual bbxes that are formed?"* — exactly right. `_aimGrid`/
`_densPoints` query the WHOLE finished building unconditionally; `_aimDepthBuild()` precomputes the
entire gaze-subject series ONCE at EDIT time, before any bake exists. The buildup cursor
(`window.tmSetCursor`/`tmPlacedCount`, `viewer/cinema_maxq.js` ~:780-805) only exists INSIDE the bake
loop, advanced frame-by-frame — by the time it's known, the gaze targets were already locked in. This
is not a coefficient to tune, it's an edit-time-vs-bake-time architecture mismatch: camera POSITION
(`poseAt`) and construction STATE (`tmSetCursor`) both already update per-frame; only the GAZE got
planned as a single precomputed pass that never talks to the buildup timeline at all.
**Interim guard shipped:** `_aimDepthWeight` returns `null` (rule fully inert) whenever
`A._cinemaPathEdit.buildup` is true, falling back to the plain look-ahead — buildup films stop staring
at unbuilt geometry today, at the cost of §CPE_AIM_DEPTH doing nothing during buildup until the real
fix lands. `§CPE_AIM_DENSITY` has the same blind spot and was NOT guarded — same reasoning as D2,
not reported broken, its outside+empty trigger is a poor fit for buildup films anyway (buildup walks
are normally interior).
**The real fix, next session:** move subject-selection out of `_aimDepthBuild()`'s edit-time probe
series and into `cinema_maxq.js`'s per-frame loop, where `_bkState`/`tmSetCursor`/`tmPlacedCount`
already exist. Needs a new primitive — `tmPlacedCount(ms)` returns a COUNT, not positions; the aim
rule needs the actual placed guids' centroids (or an equivalent "grid of only-placed elements as of
this cursor") to score against. Also needs the per-frame ordering in `cinema_maxq.js` reconsidered:
today `poseAt(_tn)` (which would call the aim rules) runs BEFORE `tmSetCursor(_bkMs)` advances the
cursor for that frame — the aim rule would still see the PREVIOUS frame's placed-state unless that
order changes too.

**Deliverables:** bim-ootb PR #1101 (original D1/D2/D3-blind implementation, live-tested same day) +
follow-up PR #1103 (D2 fix + D1 partial + D3 guard, this section). `sw.js`/`effects.js` cache-bust bumped.
**Not closed** — D1 needs a live-tuned density floor, D3 needs the bake-loop restructure above. Both
named precisely so neither needs rediscovery.

### ⚠ D3 GUARD CONFIRMED DEAD ON ARRIVAL — root cause, traced not guessed (2026-07-31, same day)
Re-tested live by the user immediately after #1103 deployed, on a `source=captured` (real linked
schedule) buildup bake: `§CPE_BUILDUP_SOURCE ... capActive=true` fires, confirming buildup IS on, yet
`§CPE_AIM_DEPTH_SERIES ... active=62/65 maxBlend=1.00` — the guard did not gate it. **Not a caching
issue** (the seam-taper fix from the SAME deploy IS visibly active: `§CPE_SEAM_CONTINUOUS
seamGapDeg=0.000`, was 94.6–100.2 — so the new code is definitely running).

**Traced the actual wiring, `viewer/effects.js`:**
- `A._cinemaPathEdit` — the field the guard reads — is set in exactly TWO places: `A.stageCinemaPath(ov)`
  (`:6406-6416`, fired ONLY by the editor's "Save this path" named-plan button) and `_cpeLoadFromDb()`
  (`:6381-6404`, the legacy `cinema_path` table restore). **Neither fires on a normal edit→OK→bake
  flow.** For an ordinary session (author bands, hose-pull, tick buildup, OK, bake — exactly what was
  tested) `A._cinemaPathEdit` is simply stale or `null` — it never reflects the override actually
  driving that bake.
- The override that DOES drive the bake travels a different path entirely:
  `A.cinemaPathPlan(durationSec, ov)` (`:6463-6494`) receives `ov` as an **explicit function argument**
  from the editor, not via `A._cinemaPathEdit`. It unpacks `ov.hose`/`ov.waypoints`/`ov.bands`/the four
  `*Sec` timing keys into module-level `_cpeWp`/`_cpeBands`/`_cpeHose`/`_cpeSecOverride` before calling
  the real planner `_cinemaPathPlan(durationSec)` (`:4572`, takes ONLY `durationSec` — no override
  parameter at all, everything else arrives via those module-level vars).
- **`ov.buildup` is never unpacked into anything.** `A.cinemaPathPlan` reads five specific keys off `ov`
  and drops the rest — `buildup` is not one of the five. It has NO representation anywhere inside
  `_cinemaPathPlan()`'s scope, which is the scope `_aimDepthWeight`/`_beat3Pose`/`poseAt` all live in.
  `cinema_maxq.js` gets `buildup` a completely different way — straight off `_cpeRes.override.buildup`
  in its own bake-loop closure, never through `A.cinemaPathPlan` at all.

**Why the D3 spec (above) was already half-right and still wrong in the same breath:** it correctly
identified that the buildup CURSOR doesn't exist until the bake loop. It missed that the buildup
BOOLEAN doesn't reach the gaze-planning scope AT ALL, cursor or no cursor — there was never a wire to
disconnect, one has to be built. `A._cinemaPathEdit.buildup` was a plausible-looking field that happens
to share a name with the real thing and happens to be legitimately `true` right after a "Save this
path" click (which is likely why it looked plausible during a first read of the code, without tracing
an actual live call) — but it is not what a normal OK→bake reads.

**The actual fix, next session, in order:**
1. Thread `buildup` through `A.cinemaPathPlan(durationSec, ov)` the same way the four `*Sec` keys
   already are — a new module-level var (e.g. `_cpeBuildupOn`), set/restored in the same
   save/try/finally block at `:6472-6493`.
2. Change `_aimDepthWeight`'s guard to read that module-level var instead of `A._cinemaPathEdit.buildup`.
3. **Verify with a real live bake**, not just a code read this time — the exact mistake that shipped
   the broken guard in the first place. `§CPE_AIM_DEPTH_SERIES active=0/65` on a `buildup=1` bake is
   the pass condition; nothing less counts as fixed.
This is a small, precisely-scoped fix — the size that was missing was accurate tracing, not code.

### D4 — NEW, live-observed same session, NOT YET IN CODE: "facing the sky" — elevation-blind verticality filter (hypothesis, traced not proven)
User, watching a buildup bake: *"it seems to be facing the sky.. perhaps its judgement of depth gone
awry."* Measured from the `§CPE_AIM_DEPTH` lines around the cancel point (frame 348, e3≈0.199):
subject Z holds 181.9→183.9 across consecutive frames — in-range for the building (`medZ` Level
4/5 = 184.8/189.6), not an absurd floating value, `blend=1.00` throughout (mid-walk, no taper active).

**Traceable mechanism, not a guess:** `§CPE_AIM_DEPTH_VERTICALITY` (D1's own fix, further up this
file) explicitly REWARDS cells with large height-span to tell a wall from a floor. An atrium wall,
lift shaft, or any feature spanning many storeys scores very highly on exactly that filter — including
if the camera itself is several floors LOWER. A subject at Z~183 with a camera down around Z~165-170
(a plausible lower-floor position on this walk) would perpendicular-project into a steep upward tilt —
which is what "facing the sky" would look like from ground level with nothing solid above to block it.

**Not confirmed** — the pasted log slice has the subject's Z but not the camera's own Z/pose at those
frames, so the camera-vs-subject elevation delta that would prove this is not yet measured. **Next
session, before touching the filter:** pull `p3`/camera Z alongside the existing `§CPE_AIM_DEPTH`
line (it already has `p`/`p3` in scope in `_aimDepthApply`, just isn't logged) and compare against the
reported subject Z at the same frame — if the delta is large and positive (subject well above camera),
this is confirmed and the fix is straightforward: the verticality filter needs a "height relative to
the CAMERA's current elevation" term, not just "does this cell span a lot of Z in isolation" — a tall
atrium should not outscore an actual nearby wall at the camera's own floor.

**User's own follow-up, same session, and it reframes this as the SAME root cause as D3, not a second
one:** *"its densest must be behind it as the foundation got laid.."* — correct, and sharper than the
elevation-delta framing above. In a buildup sequence, foundation and lower floors are laid FIRST
chronologically, so "what is actually dense/already-built" at any point in the sequence should read as
mass BEHIND/BELOW the camera's current progress, not an abstract "tall cell" from the finished
building. `_aimGrid`/`_densPoints` has zero notion of construction order — same blind spot D3 already
names. **This means D4 may not need a separate fix at all.** Once D3's real fix lands (subject
selection restricted to only already-PLACED elements as of the buildup cursor, per the plan already
written in D3's own section above), the density grid AIM_DEPTH scores against would correctly exclude
not-yet-built upper floors — an unbuilt atrium wall could no longer win regardless of its raw height-
span, because it simply wouldn't be in the candidate set. **Next session: build D3's real fix FIRST,
then re-test D4's "facing the sky" scenario before assuming it needs its own change.** Only add the
camera-elevation term (previous paragraph) if D4 still reproduces after D3 is genuinely buildup-aware.

## §CPE_AIM_DEPTH — SESSION CLOSE 2026-07-31, RESUME HERE NEXT SESSION
Four findings this session, D2 shipped and confirmed live, D1/D3/D4 open. **Read this block first,
top to bottom, before touching any code** — the mistake made twice today (D1's radius clamp, D3's
buildup guard) was shipping a fix verified only by reading code, never by a live bake. Every item
below names its own live pass/fail condition; do not close one without running it.

**Status:**
- **D1 (radii saturate on large buildings) — PARTIAL, insufficient.** Metre-clamp shipped (no
  regression, small improvement: 40/40→38/40 triggered on a 40-point Hospital sample). Root cause is
  `_AIM_DEPTH_DENS_FLOOR=10`, a fixed count that means nothing on a 63K-element building. Needs scaling
  against the building's own local density baseline. **Live pass condition:** the trigger should be
  selective — off in open interior space, on only when genuinely boxed in — not near-universal like the
  original 40/40.
- **D2 (no incoming-seam taper) — FIXED, CONFIRMED LIVE.** User's own log: `§CPE_SEAM_CONTINUOUS
  seamGapDeg=0.000` (was 94.6–100.2) and `§CPE_AIM_DEPTH ... blend=0.02 openTaper=0.02` easing in from
  the seam instead of snapping to full strength. No further work needed on this item.
- **D3 (blind to §CPE_BUILDUP) — GUARD SHIPPED BUT DEAD, ROOT CAUSE TRACED PRECISELY (see block above,
  "D3 GUARD CONFIRMED DEAD ON ARRIVAL").** Confirmed live twice: `capActive=true` yet
  `§CPE_AIM_DEPTH_SERIES active=62/65`. The exact 3-step fix (thread `buildup` through
  `A.cinemaPathPlan`'s existing unpack pattern, `:6472-6493`) is written above with line numbers — this
  is implementation-ready, not re-investigation. **Live pass condition:** `active=0/65` on a
  `buildup=1` bake, nothing less.
- **D4 (facing the sky, elevation-blind verticality) — HYPOTHESIS, TRACED, LIKELY THE SAME ROOT CAUSE
  AS D3, NOT YET MEASURED OR FIXED.** User's own reframe: "densest must be behind it as the foundation
  got laid" — the density grid has no construction-order awareness, same blind spot as D3. **May not
  need a separate fix at all** — re-test after D3's real fix lands before adding anything new (see
  block immediately above for the full reasoning).

**Priority order:** D3 first (implementation-ready, smallest diff, AND per the reframe above may fix
D4 as a side effect, so building D4-specific code before D3 risks solving a problem D3 was already
going to solve). Re-test D4 against a real buildup bake once D3 is done — only add the
camera-elevation term if it still reproduces. D1 last — it's the one that genuinely needs iterative
visual tuning, not a one-shot fix, so don't start it until D3/D4 are settled and testing is clean.

**Deliverables so far:** bim-ootb PR #1101 (D1/D2/D3-blind original implementation) + PR #1103 (D2 fix
+ D1 partial + D3 guard, later found dead). No PR yet for the D3 real fix or D4.

## §CPE_TITLE_BAND_COUNT — SHIPPED BUT DID NOT FIX THE REPORTED BUG (2026-07-31)
User report: reopening a stored path (`§CPE_IDB_PATH_STORE`) with more than 3 authored bands still
shows only 3 in the editor panel. Found and fixed one real, confirmed bug on the way: the panel title
text was hardcoded to `"— 3 bands"` at panel-build time and never updated afterward (`cinema_path_editor.js`,
now reads `_state.bands.length` live, updated every `_renderRows()` call — shipped in bim-ootb PR #1101).

**User re-confirmed the underlying bug is STILL PRESENT after that fix**, reported three times across
the session (*"still not showing the extra node in the list during opening"*, twice more). **This has
never actually been diagnosed** — every attempt so far, including this session's, lacked the one piece
of evidence that would prove or disprove where the fault is: **a console log segment that includes
`§CPE_PATH_LOADED`**, which only fires inside `_pathsApply()` when the user clicks **Open** next to a
saved plan in the dropdown. Every log pasted this entire session was from a fresh Alt+C edit-and-bake
session — none of them exercised that button. Code-reading `_pathsApply`/`_buildOverride`/`open()`
found nothing obviously wrong (all three correctly use `.length`-driven arrays, no hardcoded counts),
which is not evidence of correctness — see D3 above for what "looks right by reading" cost this
session twice already. ~~**Next session: get the `§CPE_PATH_LOADED` segment before any further code
reading or guessing.**~~

**✅ SOLVED 2026-07-31 (same day) — and the evidence being demanded was the WRONG LINE.**
`_pathsApply`/`open()` were never at fault: `finish('ok')` staged nothing, so the authored bands did
not survive the bake and the next Alt+C re-seeded the derived three. `§CPE_PATH_LOADED` was never
going to appear because the user was not using the `saved ▾ open` button — the line that told the
whole story was `§CPE_OPEN src=seeded bands=3`, present in every log they pasted. **Full diagnosis,
line numbers and witness in §CPE_REOPEN_NODE below; do not re-open this block.**
**Standing lesson:** when a log line you asked for three times never arrives, question whether the
user's route emits it at all before questioning the user.

## §CPE_REOPEN_NODE — the added node does not survive OK, and an unselected stick looks like every other band (spec 2026-07-31)
**User, 2026-07-31:** *"the new nodes has to be darker blue when not selected to stand out, but if the
listing has the new node, it be easier to spot"* → *"better fix those two as i can hardly pick out the
extra node without been listed"*. Two defects, one symptom: **after authoring a stick you cannot find
it again** — not in the 3D pipe (it is drawn identically to a seeded band) and not in the panel list
(after a re-open it is not there at all).

### D-A — ROOT CAUSE FOUND, and it is NOT the dropdown-Open path the last session was chasing
§CPE_TITLE_BAND_COUNT (immediately above) spent a whole session asking for a `§CPE_PATH_LOADED`
segment and never got one. **That log line was never going to exist, because the user was not using
that route.** `§CPE_PATH_LOADED` only fires in `_pathsApply()` (the `saved ▾ open` button); the user's
"opening" is **Alt+C again**. Traced end to end in the code, `origin/main`:

| # | file:line | what it does |
|---|---|---|
| 1 | `cinema_path_editor.js:1637` | `a.stageCinemaPath(_buildOverride())` is called from **the `Save this path` button ONLY** |
| 2 | `cinema_path_editor.js:1631` | the `OK` button calls `finish('ok')` — which resolves the override to the caller and **stages nothing** |
| 3 | `cinema_maxq.js:624` | that override is used for THIS bake — `A.cinemaPathPlan(nFrames/fps, _cpeRes.override)` — and then dropped on the floor |
| 4 | `cinema_maxq.js:494` | the NEXT Alt+C plans with **no `ov` at all** — `A.cinemaPathPlan(nFrames/fps)` |
| 5 | `effects.js:6466` | `ov === undefined` → `_cpeLoadFromDb(); ov = A._cinemaPathEdit || null` → **null** (nothing staged, and the `cinema_path` DB table only exists after Ctrl+S) |
| 6 | `effects.js:6342` | so the plan returns `bands: null` |
| 7 | `cinema_path_editor.js:1454` | `authored = !!(plan.bands && plan.bands.length >= 2)` → **false** → `_cinemaSeedBands(plan.waypoints)` → back to the derived 3 |

So the stick is not "missing from the list" — **it no longer exists**, and the list is telling the
truth. §CPE_REOPEN_DOUBLE's adopt-don't-re-seed fix is correct and is not implicated: it only runs
when `plan.bands` is populated, and on this route it never is.
**The evidence already in every log the user pasted** is `§CPE_OPEN src=seeded bands=3` — asking for
`§CPE_PATH_LOADED` was asking for the wrong line for four sessions running.

**Fix:** `finish('ok')` stages the override the same way `Save this path` already does, when and only
when there was an edit (`edited === true`, Guardrail 2's own test — an untouched OK must stay
byte-identical and stage nothing). Cancel stages nothing. This is in-memory only: `stageCinemaPath`
sets `A._cinemaPathEdit`; the `cinema_path` table is still written solely by Ctrl+S Save Building, so
the on-disk contract is unchanged.

**Second half — provenance is thrown away and then GUESSED back.** `_buildOverride()` (`:426`) maps
bands to `{c,d,len}` only, dropping `_stick`/`_s`. Both readers therefore infer stick-ness from
POSITION — `_pathsApply` (`:932`) and `open()`'s `clone` (`:1461`) both use `i > 0 && i < n-1` — which
says *every* middle band is a stick. Harmless while the only per-stick affordance was the `×` button;
**not harmless once colour depends on it (D-B), because the colour would then lie about which node
the user added.** So `_buildOverride` carries `_stick`/`_s`, and both readers prefer the stored flag,
falling back to the index rule only when it is absent (records saved before this change keep their `×`).

### D-B — an unselected stick is drawn exactly like a seeded band
`_redrawScene` (`:364-379`) colours by ZONE and by HELD, never by provenance: bar `0xffffff`, mid
`0xffffff`, ends `0x4fc3f7`, anything held `0xff8c00`. A node the user dropped is pixel-identical to
one the seeder produced.
**Change (one rule, KISS):** a band with `_stick` that is NOT held draws its bar and all three handles
in **dark blue `0x1565c0`** — a colour already in this file's palette (`:98`, the light-scene contrast
colour). Sizes are untouched, so mid-vs-end still reads by radius, and held-orange still wins over
everything. The panel row for a stick gets the matching cue so the list and the pipe agree: label in
`#64b5f6` (readable tint of the same hue on the dark panel) and, when not selected, a `#1565c0`
left border where a selected row shows `#ff8c00`.

### Witness claims — `witness_cpe_reopen_node.js`, and what each proves or disproves
| gate | proves / disproves |
|---|---|
| G-RN-1 | **RED on `origin/main`.** Spawn a stick (rows N→N+1), click OK, let the bake finish, re-open Alt+C: the panel lists **N+1** rows and the log says `§CPE_OPEN src=authored bands=N+1`. Today it says `src=seeded bands=3` — the node is gone. |
| G-RN-2 | Guardrail 2 is intact: open, touch nothing, OK → `A._getCinemaPathEdit()` stays null and the next open is still `src=seeded`. An unedited OK must not silently pin a path. |
| G-RN-3 | Provenance is CARRIED, not guessed: after the re-open of a 4-band path whose stick is at index 2, exactly ONE row has a `×` and it is row 2 — not rows 1 and 2. Disproves the index inference. |
| G-RN-4 | Colour by provenance: via a new read-only `_probeHandles()` hook, every handle of the spawned stick reads `0x1565c0` while it is unheld, every handle of a seeded band reads its existing zone colour, and grabbing the stick turns its held handle `0xff8c00`. Numbers off the real meshes — not a screenshot (CLAUDE.md FUNDAMENTAL LAW). |

**Not in scope here:** D1/D3/D4 of §CPE_AIM_DEPTH (different subsystem, different session), and the
`saved ▾ open` route — it was never broken; G-RN-3 covers it only insofar as it now reads stored
provenance.

### ✅ BUILT AND WITNESSED 2026-07-31 — `bim-ootb` PR #1104, CPE v17, viewer sw v890
`witness_cpe_reopen_node.js`, **Duplex 9/9** (`PORT=8437 node witness_cpe_reopen_node.js`).
**RED first, on `origin/main` with only the read-only probe hook added: 3/9** — `rows 4 -> 3`,
`§CPE_OPEN src=seeded bands=3`, `_cinemaPathEdit=null`. The node was gone, exactly as traced.

| gate | measured (fixed build) |
|---|---|
| G-RN-1 | rows `4 -> 4` on re-open, `§CPE_OPEN src=authored bands=4 waypoints=8` (main: `4 -> 3`, `src=seeded bands=3`) |
| G-RN-1b | `§CPE_OK_STAGED bands=4 sticks=1` (main: no such line, `_cinemaPathEdit=null`) |
| G-RN-2 | untouched OK → `_cinemaPathEdit=null`, next open `src=seeded`, `§CPE_OK_STAGED=0` — Guardrail 2 holds |
| G-RN-3 | removable rows `[1]`, want `[1]` — one ×, at the dropped index |
| G-RN-3b | row 1 border `rgb(21,101,192)`, label `rgb(100,181,246)` |
| G-RN-4a | stick handles `a:0x1565c0 mid:0x1565c0 b:0x1565c0`; seeded `a:0x4fc3f7 mid:0xffffff b:0x4fc3f7` ×3 |
| G-RN-4b | grabbed stick mid handle `0xff8c00` — selection stays the loudest state |

**One thing the witness found that the spec above did not predict:** the plan's own band echo
(`effects.js:6342`) also stripped `_stick`/`_s`. With only the editor-side fix in place G-RN-3 was
still RED (`labels=[settle | stick @ 15% | stick | stop]`, no × anywhere) — the plan is what a
re-open reads from, so provenance had to be carried at THREE seams, not two. Third one added.

**A fourth thing fixed on the way, because it defeated the whole point of the ask:** `_labelOf`
called EVERY middle band a "stick" (§CPE_STICK's blanket rule, written when the count was 3), so a
list with one added node read `settle | stick @ 15% | stick | stop` — the user's own node was one of
two identical words. Non-stick middles are `exit door` again. New gate G-RN-3c.

**Regressions run, both against this build AND `origin/main`:**
- `witness_cinema_path_editor.js` 7/9 — **identical on both**; G7/G10 are pre-existing (§CPE_AIM_DEPTH
  lane), and **G1 OK-without-edit byte-identity is `maxPoseDiff=0` on both sides**, which is the gate
  the staging change could plausibly have broken.
- `witness_cpe_click_slop.js` was **1/4 on `origin/main` as well** — harness rot, never a product
  regression, and worth recording because it would have been misread as one: the editor opens at the
  pre-dive orbit pose where Duplex's entire 15 m walk projects into a **~30 px smear, every pixel of
  it inside a band handle's `GRAB_PX=18` radius**, so every gesture resolved to a handle drag and the
  witness reported "sticks do not spawn". Repaired here (look closer first — free, because
  §CPE_PREVIEW_DIVERGENCE pins re-plans to the OPEN pose — plus a handle-clearance requirement on the
  chosen pixel, plus re-finding the pixel after G-CS-2 bends the pipe away from it). **Now 4/4.**
  Any future CPE witness that clicks the pipe needs the same two helpers.

## §CPE_ROOM_TITLE_GAZE — caption the room the camera is LOOKING INTO (user ruling 2026-08-01)
**User ruled on §CPE_ROOM_TITLE_FLYOVER_BLIND's two options: "Label what the camera looks at".** Not
as a fallback — as THE rule. Containment is replaced, not supplemented.

**Why this is not a bigger change than it sounds.** The gaze ray STARTS at the camera, so when the
camera is inside a room the nearest hit IS that room. Walk films keep the captions they have, with a
forward bias through doorways — which is §CPE_ROOM_TITLE_LEAD's own semantics arriving for free from
geometry instead of from a 2s offset. The flyover case is where the two rules diverge, and that is
exactly the case with one caption in 148 seconds.

**The mechanism — ray vs. room AABB, and NOTHING is invented.**
1. `plan.poseAt(tn)` already returns the look target `(tx,ty,tz)` beside the position. Direction is
   `target − position`, converted to IFC by the existing `A.three2ifc`. No new aim machinery, and
   deliberately NOT `§CPE_AIM_DEPTH`'s `subject` — that lives inside `_cinemaPathPlan`'s closure, only
   exists during the walk beat, and is a density centroid rather than a point on the model.
2. Each room node is already an AABB: its `rects` give x/y, and the storey band already used by
   `_roomAtIfcPoint` gives z (`cz ± pitch`). Standard slab test, nearest positive hit wins.
3. **⚠ Do NOT ray-MARCH.** Stepping needs a step size, and any step size is an invented constant that
   either skips through small rooms or costs 400 steps a sample. The slab test is exact, needs no
   constant, and is the SAME O(rooms-per-sample) cost the point test already pays — 34 ms on Hospital's
   987 samples today, so the budget is known before a line is written.
4. **The storey band is REUSED, not relaxed.** A ray that passes 20 m above a room does not hit its
   AABB, so §CPE_ROOM_TITLE_HEIGHT_BLIND's rule survives intact — captions still cannot name a room the
   camera never geometrically reaches. This is what keeps the fix from re-opening PR #1108's bug.
5. Everything downstream is untouched: §CPE_ROOM_TITLE_LEAD's 3s-slot-or-skip arbitration is what stops
   a sweeping gaze from strobing captions, and it already exists and is already gated.

**⚠ The wording promise changes, and the honest limit must be stated.** A caption now means "the room
being looked into", not "the room you are in". During the ORBIT beat the target is the building pivot,
so the gaze resolves to whatever central room the ray crosses and would hold one caption for the whole
lap. **Measure this before deciding whether the orbit should caption at all** — do not assume either way.

### Witness claims — `witness_cpe_room_title_gaze.js`
| gate | proves / disproves |
|---|---|
| G-GZ-1 | **RED today, on the real thing.** Hospital's 147.9s plan yields 1 caption by containment; gaze yields more, measured as a number, not "some". |
| G-GZ-2 | truthfulness: every captioned room is one the ray DEMONSTRABLY enters — recompute the hit independently and assert the room's AABB contains the hit point. Never a fabricated name. |
| G-GZ-3 | the storey band still bites: a ray passing above a room's AABB does not caption it (PR #1108's bug stays closed). |
| G-GZ-4 | nearest-hit, not any-hit: with two rooms on the same ray, the NEAR one is captioned. |
| G-GZ-5 | a camera INSIDE a room still captions that room — walk films do not regress. |
| G-GZ-6 | the orbit beat is MEASURED and reported: how many captions it produces and whether one name holds the whole lap. |
| G-GZ-7 | cost: the pre-pass stays within the same order as the point test on Hospital's 987 samples (`ms=` in §CPE_ROOM_TITLE_TIMELINE), so the slab test's budget claim is checked, not assumed. |
| G-GZ-8 | the log names which rule produced the timeline, so a stale cache cannot silently serve containment captions while the spec says gaze. |

## §CPE_ROOM_TITLE_GAZE_LIVE — measured on LTU_AHouse, v902, and MIN_DWELL RULED ON (2026-08-01)
**User, after previewing both buildings on the shipped gaze build:** *"Previews shows labels coming
out fine for both Hospital and LTU so lets leave it and await the full bake mp4."*

Same building, same editor, one version apart:
```
v901 containment:  segments=3/4  suppressed=6   rejectedByHeight=9    ms=25.4  totalSec=51.5
v902 gaze:         segments=5/6  suppressed=42  gazeMissedAll=56/338  ms=37.7  totalSec=50.7  lead=4/5
```
3 → 5 captions. `rejectedByHeight=0` because the point test is no longer on the path at all;
`gazeMissedAll=56/338` = 17% of samples where the ray left the building entirely (sky). Cost 25 → 38 ms,
inside the budget §CPE_ROOM_TITLE_GAZE predicted from the slab test.

**⚠ `MIN_DWELL` is now the dominant filter, and it STAYS — user ruled, do not re-litigate.** 338 samples
→ 282 hit a room → 48 candidate runs, of which `MIN_DWELL` deletes **42 (87%)**, up from 6 under
containment. The gaze sweeps across rooms, so it manufactures short-lived candidates that containment
never produced. **This makes retiring it MORE dangerous, not less** — the arbitration is greedy and
takes the FIRST candidate in each 3s window, so without the filter a 0.15s sweep glimpse could claim a
slot ahead of the room the camera actually flew through. Open item #5 is therefore CLOSED as
"deliberately kept", not "not yet done".

**The refinement that was offered and NOT taken (record it, do not build it):** when several candidates
compete for one 3s slot, caption the one the gaze rested on LONGEST rather than the first seen. That
would replace the 1.4s constant with a comparison — nothing invented — and make a glimpse unable to
outrank a dwell. Offered 2026-08-01; the user chose to leave the behaviour alone pending a full bake.
Pick this up only if the baked mp4 shows a wrong room winning a caption.

**Also confirmed in the same run — the 4D refresh took:** `§CPE_BUILDUP_SOURCE source=captured
leafTasks=6 covered=122667/122667 pct=100% — REAL LINKED SCHEDULE`, and `§CPE_WORK_SCHEDULE
workInFirst10%OfCalendar=0.1%` against 32.1% on the previously generated timeline. LTU now drives its
buildup from the user's authored 6-phase schedule at full coverage.

## §CPE_ROOM_TITLE_FLYOVER_BLIND — a 148s film gets ONE caption, and the lead is not why (measured 2026-08-01)
**BUILT AND LIVE (PR #1118, v901). The lead works — and it made a bigger problem visible.** The user's
own preview log on Hospital, a 147.9s buildup film:
```
§CPE_ROOM_TITLE_DIVE src=plan.beats diveEndSec=10.13
§CPE_ROOM_TITLE_TIMELINE segments=1/1 suppressed=2 rejectedByHeight=306 storeyPitch=5.0m
                         lead=1/1@2s held=0/1@3s skipped=0(<3s) totalSec=147.9 ms=34.2
```
| number | what it means |
|---|---|
| 987 | samples over the film (147.9s ÷ `SAMPLE_DT` 0.15s) |
| **306 (31%)** | over a room's FOOTPRINT but >1 storey pitch (5.0 m) from its datum — **flying over it, not in it** |
| 3 | room-dwells that existed at all; 2 more died to `MIN_DWELL` |
| **1** | captions in a 148-second film |
| `lead=1/1@2s` | the one caption DID lead its doorway by the full 2.0s — §CPE_ROOM_TITLE_LEAD is not the defect |

**Do NOT "fix" this by relaxing the height band.** That band IS §CPE_ROOM_TITLE_HEIGHT_BLIND (PR #1108),
shipped the day before against the user's own complaint — *"u can see the room labels are Level 2 two
rooms when we are flying quite high"*. Widening it re-introduces exactly that bug. `MIN_DWELL` is not
the lever either: retiring it buys at most 2 captions here, out of 306 losses.

**⚠ LTU_AHouse FAILS DIFFERENTLY — measured 2026-08-01 on the same v901 build, and it changes the
`MIN_DWELL` decision.** User's own preview log, a 51.5s film:
```
§CPE_ROOM_TITLE_TIMELINE segments=3/4 suppressed=6 rejectedByHeight=9 storeyPitch=3.2m
                         lead=2/3@2s held=0/3@3s skipped=1(<3s) totalSec=51.5 ms=25.4
```
| | Hospital (147.9s) | LTU_AHouse (51.5s) |
|---|---|---|
| samples | 987 | 344 |
| rejected by height (flying over) | **306 = 31%** | **9 = 2.6%** |
| suppressed by `MIN_DWELL` | 2 | **6** |
| captions shown | 1 | 3 |

LTU is NOT flyover-blind — its camera is down among the rooms. Its dominant loss is `MIN_DWELL`
dropping SIX rooms crossed in under 1.4s, before the 3s-slot arbitration ever saw them. So
§CPE_ROOM_TITLE_GAZE is the fix for Hospital's failure mode and barely touches LTU's. **This is the
first real evidence for open item #5 (retire `MIN_DWELL`)**: the skip rule already makes strobing
impossible, so the dwell filter's only remaining job is stopping a sub-frame corner-clip from
claiming a 3s slot — and on LTU it is instead deleting two thirds of the film's rooms. Still the
user's call, still not smuggled in.

Also on record from that run, NOT part of this lane: `§CINEMA_SPACE` reported `enclosed=0%` for all
six candidate rooms on LTU, so `§CINEMA_DIVE` fell back to `src=bbox-centre` instead of settling
inside a room. The enclosure measure finds nothing on this building. Worth its own look.

**The real statement:** room titles answer *"which room am I in / entering"*, and a wide buildup
flyover is never in one. The feature is sound; it is aimed at the walk beat and this film mostly has
no walk beat. Two honest directions, NOT yet chosen by the user, do not build either unasked:
- **(a) Accept the scope.** Captions are for walk-heavy films; a flyover legitimately has few. Cheapest,
  and arguably correct — naming a room you are 20 m above is the lie the height band exists to prevent.
- **(b) Name what the camera is LOOKING AT, not what it is inside.** `§CPE_AIM_DEPTH` already computes
  and logs a per-frame `subject=(x,y,z)` — the point the gaze is resolved onto. Resolving THAT to a room
  would caption a flyover truthfully ("looking into Ward 3") without touching the containment rule or
  the height band. Reuses a number that already exists; needs its own spec before any code, and needs
  the user to rule on the wording, because "the room you are heading into" and "the room you are looking
  at" are different promises to a viewer.

## §CPE_ROOM_TITLE_LEAD — name the room you are HEADING INTO, ~2s early (requested 2026-08-01, NOT built)
**User, while a bake was running:** *"room labelling i got a suggestion is that should not wait to be
in the room but as it is heading towards a room, about 2 secs before will be view point friendly.
Take note."*

**What this changes, stated plainly:** §CPE_ROOM_TITLE's premise to date is *"the room you are IN"* —
a caption starts at the first sample whose camera position falls inside that room's plan rect. The
request changes it to *"the room you are ENTERING"*. That is a real semantic shift, not a timing
tweak: for ~2s the caption names a space the camera has not reached, which is exactly the point
(a viewer reads the name as the doorway approaches, the way a documentary lower-third arrives just
before the subject does), but it must be described as a lead-in, never as "where the camera is".

**SETTLED 2026-08-01 — three user rulings, asked and answered before any code:**
> Q: does the lead apply to the film's FIRST caption (a room name over the dive)?
> **A: "Yes, clipped to dive end."**

> *"for every room too... not wait till inside room it can be too late as 3 secs optimum label
> appearance"*

> *"even though just left room,.. but when new room appears, it tries to show also up to 3 secs..
> and if misses, then skips"*

**The rule, in the user's own terms — a caption is a 3-SECOND SLOT that OPENS 2s BEFORE the doorway:**
1. **`LEAD = 2.0s`.** A caption appears at `show = tStart - LEAD`, never at entry. *"not wait till
   inside room, it can be too late."*
2. **Every room is a candidate for the lead, including the first.** The first caption's `show` is
   clipped to the END OF THE DIVE, so a room name never appears over empty sky with the building
   still distant — the user's ruling, and the reason the plan must expose its beat fractions.
3. **A shown caption gets its full `MIN_HOLD = 3.0s`, or it is not shown at all.** *"it tries to show
   also up to 3 secs.. and if misses, then skips."* This RETIRES the flash: today a room entered 1.5s
   after the last one produces a 1.5s label that nobody can read. It is now either a proper 3s
   caption or nothing.
4. **Skipped, never DELAYED.** A candidate whose slot would open inside the previous shown caption's
   guaranteed 3s is dropped. Pushing it later instead would put the name on screen after the camera
   is already through the door — the exact failure rule 1 exists to kill.
5. **The new caption's APPEARANCE ends the previous one** — *"even though just left room... when new
   room appears"*, the user's own replacement rule from §CPE_ROOM_TITLE_HOLD (*"it can replace so"*).
   So spans never overlap and the 0.4s FADE does the crossfade, exactly as today.
6. **The hold stays a FLOOR, not a cap.** An 8s dwell is still an 8s caption:
   `end = min( max(show + MIN_HOLD, tEnd), nextShow or totalSec )`.

**What this makes TRUE that was not true before:** `MIN_HOLD` becomes a real guarantee. The shipped
§CPE_ROOM_TITLE_HOLD could still be cut below 3s by a fast next room (its own G-TH-3), so a caption
could still flash. Under rule 3 the only caption that may be shorter than 3s is the last one, clipped
by the end of the film — and that is gated, not assumed.

**⚠ `MIN_DWELL` (1.4s) STAYS, deliberately.** Rule 3 makes strobing impossible on its own, so the
dwell filter is no longer load-bearing for that — but it still stops a 0.15s clip through the corner
of a toilet from claiming a 3s slot and starving the hall entered a second later. Retiring it is
open item #5 from the 2026-08-01 session close and is still the user's call, not something this
section smuggles in. The log keeps reporting `suppressed=` beside the new `skipped=`.

**Seam this needs — and it ALREADY EXISTS, do not add it again.** The dive end is
`plan.beats.dive * totalSec`. `_cinemaPathPlan` has exported `beats:{dive,spin,out,rise}` since
`effects.js:6336`. ⚠ This section originally specced adding it, and the build did — as a DUPLICATE
key in the same object literal, silently legal JS and completely dead. It was caught only because a
regression baseline run made `git show HEAD:viewer/effects.js` grep-positive for a line that was
supposed to be new. **Zero lines of `effects.js` are needed for this feature.** **Degrade, don't
disable** (this lane's own lesson): a plan without `beats` — a re-opened authored path, a stale
cached `effects.js` — still leads, it just skips the dive clip and says so in `§CPE_ROOM_TITLE_DIVE`.

### Witness claims — `witness_cpe_room_title_lead.js`
| gate | proves / disproves |
|---|---|
| G-TL-1 | **RED today.** A caption appears LEAD seconds before the camera enters the room, not at entry. |
| G-TL-2 | the lead never produces negative time, and the first caption never opens before the dive ends. |
| G-TL-3 | **the skip rule.** A room entered too soon after the last caption is DROPPED, not flashed — no shown caption is ever shorter than MIN_HOLD. |
| G-TL-4 | the replacement rule: the previous caption ends exactly when the new one APPEARS, so no two captions are ever on screen at once (the fade still crosses them). |
| G-TL-5 | the hold is still a floor, not a cap — an 8s dwell is not cut to 3s. |
| G-TL-6 | ordering and monotonicity survive: starts stay ordered, no segment ends before it starts. |
| G-TL-7 | on a REAL timeline every caption satisfies all of the above — the synthetic gates cannot drift from the product (the §CPE_ROOM_TITLE_HOLD precedent, G-TH-7). |
| G-TL-8 | the log says how many captions led, and how many were skipped for want of 3s. |
| G-TL-9 | **degrade, not disable:** a plan with no `beats` still produces led captions, and names the missing dive clip in the log. |

## §CPE_BUILDUP_WORK_PACED — the film advances DAYS; the building goes up in BURSTS (spec 2026-08-01)
**User, after two buildup bakes:** *"but construction came on too fast.. is the path and TM
consistent?"* → *"as long it is consistent as i find this seems to be at random"*.

**Not consistent, and their own logs prove it — same film fraction, two runs:**
| run | film t | placed | ops total |
|---|---|---|---|
| A | 0.054 | **210** / 63,421 | 63,421 |
| B | 0.053 | **15,485** / 63,416 | 63,416 |

0.3% of the building up in one run and **24%** in the other, at the same moment in the film. The op
totals differ too (63,421 / 63,426 / 63,416 across three runs) because Hospital has no linked
schedule — `§CPE_BUILDUP_SOURCE mode=T reason=generated-timeline` — so the 4D is DERIVED FRESH each
time. That is the "random".

**Root cause, one line:** `cinema_maxq.js` advances the buildup by CALENDAR —
`cursor = projectStart + t * (projectEnd - projectStart)` — and the derived order does not spread work
evenly over days. Thousands of elements share nearby timestamps, so a quarter of the model lands in
the first 5% of the film and the remaining 95% has little left to raise. Every downstream feature
inherits it: §CPE_GHOST_GROUND's reveal window collapsed to a few frames on run B
(`groundOpacity=1.000` by frame 60) for exactly this reason, not because its own rule was wrong.

**The rule: pace by WORK, not by date.** Film fraction `t` maps to the **k-th element placed**, not
the k-th day: `k = round(t * totalOps)`, `cursor = sortedEnds[k-1]`. Then 10% of the film is 10% of
the building on ANY model, and it no longer depends on how the generated timestamps happen to
cluster — which is precisely the consistency the user is asking for. Calendar pacing remains the
fallback when the op schedule is unavailable, and the log says which is in force.

**⚠ Deliberately NOT a re-key.** This changes only which cursor value a given FRAME asks for. The
Time Machine's own op order and timestamps are untouched (§CPE_BUILDUP_FOLLOW_TM stands — the film
plays the timeline, it does not author one). `tmRestoreDerivedOrder` still hands the user's timeline
back exactly as it was.

**⚠ And it must not repeat §CPE_GHOST_GROUND's mistake:** the schedule lives in `time_machine.js`
while the pacing lives in `cinema_maxq.js`, so a stale cached copy of either must DEGRADE to calendar
pacing with a named log line, never silently disable the film.

### Witness claims — `witness_cpe_work_pacing.js`
| gate | proves / disproves |
|---|---|
| G-WP-1 | the claim itself: at t = 0.1/0.25/0.5/0.75, the placed fraction equals t within tolerance. This is what "10% of the film is 10% of the building" means, and it is measured on the real op schedule. |
| G-WP-2 | **RED on calendar pacing.** The same model, same fractions, paced by date — the deviation is large (Hospital run B: 24% of the work at 5% of the film). Without this the gate above could pass on a model that happens to be evenly spread. |
| G-WP-3 | the cursor is monotone non-decreasing across the film — a building does not un-build. |
| G-WP-4 | **determinism**: two independent arms produce identical cursors for identical fractions. The user's "seems to be at random" must be answerable with a number. |
| G-WP-5 | degrade, don't disable: with `tmWorkSchedule` hidden the way a stale cache would, pacing falls back to calendar and says so — the film still bakes. |
| G-WP-6 | preview and bake ask for the same cursor at the same film fraction. |

## §CPE_GHOST_GROUND — the foundation is BUILT and BURIED; ghost the ground until it rises (spec 2026-07-31)
**User, watching a buildup bake of Hospital:** *"or because cam was too high, and foundation has not
emerged?"* → *"How about we reveal the foundation by eliminating the night ground mode? ... Or is
there a way to make the foundation beams seen thru? at least until its above slabs appears that we
can have then back to underground hidden?"* → *"and it be cool when they return back to opaque
gradually rather than right away"*.

**Their diagnosis beat mine, and the log settles it.** I had blamed the spin rate
(`finalSpinDeg=-534.4` executed against a budget costed on a capped 180°, still a real defect, still
open). But the opening of a buildup film is worse than fast — it is **occluded**:
```
§CPE_BUILDUP frame=120/2219 t=0.054 placed=210/63421     ← 0.3% built at the spin
§GROUND_Y src=gf-storey-slab(Level 1) z=165.36            ← the ground plane sits at the L1 slab
§SFX_PLAY src=tm phase=Substructure                       ← every beat through the opening
```
Those 210 placed elements are **substructure — below `z=165.36`, under an opaque paved plane**
(`§GROUND_MAP key=paved`, `§PHOTO_SHADOW casters=4043`). They are not missing from the film; they are
buried in it. No camera or gaze change could have revealed them.

**Rejected: switching the ground off** (the user's own first idea, and they flagged the risk
themselves). It takes `§PHOTO_SHADOW`'s 4,043 casters and the sense of a site with it — the
foundation would float in blackness. Fixing visibility by deleting the thing that makes it read as
construction is not a fix.

**The rule:** while the buildup has placed NOTHING at or above the ground plane, the ground renders
at low opacity — you see the pile caps and ground beams through it, like a survey drawing. The
moment the first at-or-above-ground element lands, the ground fades **gradually** back to opaque and
stays there for the rest of the film.

**Trigger, and why it needs no new data:** `element_transforms` already carries each element's bottom
(`center_z - bbox_z/2`) and the Time Machine already orders every op in time. One pass gives the
cursor timestamp of the first op placing an element with `bottom >= groundZ - 0.05` — the ground-floor
slab itself qualifies, which is exactly the user's *"until its above slabs appears"*. `tools.js`
already computes `groundZ` for the plane's own placement (§GROUND_Y); it just needs exposing.

**Fade, per the user's follow-up:** not a cut. Opacity eases (smoothstep) from `GHOST` to 1.0 over a
fixed span of FILM time after the trigger, computed in film-fraction so it is identical in the
10 s preview and the 148 s bake.

**Applies to preview AND bake, one function.** Both already drive the cursor —
`cinema_path_editor.js:1054` and `cinema_maxq.js:797` — so the tick hangs off those two call sites and
the rehearsal cannot disagree with the film (the §CPE_ROOM_TITLE precedent: one draw routine, two
consumers).

⚠ **Restore on exit, unconditionally.** The ground material is shared with normal viewing; a bake
that leaves `transparent=true, opacity=0.22` behind ghosts the ground for the rest of the session.

### Known risks, stated not buried
1. **Shadows on a ghosted plane read thin.** `receiveShadow` stays on; if it looks wrong the answer
   is holding shadows until the fade completes, not lowering the ghost further.
2. **Night mode is dark-on-dark** — grey concrete under a dark translucent plane. May need the
   substructure lifted (brighter material / the xray treatment) to actually read. NOT in this section.

### Witness claims — `witness_cpe_ghost_ground.js`
| gate | proves / disproves |
|---|---|
| G-GG-1 | the trigger is real: `tmFirstAboveGroundMs(groundZ)` returns a timestamp strictly INSIDE the project span, and the ops before it are all below-ground. Disproves "it fires at t=0" (which would make the feature a no-op) and "it never fires". |
| G-GG-2 | **RED before this section.** At a cursor early in the buildup the ground is fully opaque (`opacity=1`), so a below-ground element is occluded. After: opacity is the ghost value. |
| G-GG-3 | the fade is GRADUAL and monotone — sampled across the trigger, opacity rises from ghost to 1.0 in more than one step, never decreases, and reaches exactly 1.0. (The user asked for this explicitly; a cut would pass a naive before/after test.) |
| G-GG-4 | it never ghosts again after the fade: sampled at the end of the film, opacity is 1.0. |
| G-GG-5 | no leak — after the run ends, `A.ground.material.transparent/opacity` are back to their pre-run values. A ghosted ground left behind would follow the user into normal navigation. |
| G-GG-6 | preview and bake agree: the same film-fraction yields the same opacity through both call sites. |

## §CPE_ROOM_TITLE_HEIGHT_BLIND — a title card names the room you are FLYING OVER (spec 2026-07-31)
**User, flying the Hospital film:** *"u can see the room labels are Level 2 two rooms when we are
flying quite high."* Correct, and the mechanism is exact.

`cpe_room_title.js:_roomAtIfcPoint(ix, iy, iz)` (`:27-43`) decides "which room is the camera in" with
a **plan-rect test only**:
```js
if (ix < r.x0 || ix > r.x1 || iy < r.y0 || iy > r.y1) continue;   // x/y only
var dz = Math.abs((n.cz || 0) - iz);
if (dz < bestDz) { bestDz = dz; best = n; }                        // z only RANKS, never REJECTS
```
Height is used to disambiguate stacked storeys and **nothing else** — it can never disqualify a
match. So a camera 40 m above the roof, or mid-pullback, still resolves to whichever room's footprint
it happens to be over, and the z-closest tie-break hands it the nearest storey — "Level 2". The room
graph carries no vertical extent (`{guid, kind:'room', rects, cx, cy, cz}` — `cz` is the space
centroid's z, `common/room_graph.js:248` and `:327`), so there is nothing to test against today.

**Why this bites HERE and not in the Find panel:** every other consumer of `_roomAtIfcPoint`-shaped
logic asks about a point that is already known to be inside the building (a picked element, a walk
node on a storey raster). The cinema camera is the first consumer that spends most of its runtime
OUTSIDE the building — dive, pullback and orbit are all above or beyond it — and it asks the same
question from up there.

**The rule (deterministic, derived from the building, no constants invented):** a room may only claim
the camera if the camera is within **one storey pitch** of that room's own `cz`. The pitch is the
median gap between the distinct storey z values the graph already carries — the building states its
own floor-to-floor, nothing is assumed. Outside that band: **no title**, never a fabricated one
(the same rule `:78` already applies to "no room here").

**⚠ THE BAND WAS SPECCED AT HALF A PITCH AND MEASURED WRONG — recorded because the instinct to halve
it will recur.** Half a pitch broke `witness_cpe_room_title_timing.js` (3/3 → 1/2, its one real
Duplex segment deleted). The measurement that settled it, taken before touching the number:
```
Duplex room datums (cz):  -0.63 (T/FDN)   1.62 (Level 1)   4.63 (Level 2)   6.40 (Roof)   pitch 2.25m
Duplex's OWN derived walk, camera IFC z:  2.09 → 2.47 → 2.83 → 3.13 → 3.72 → 4.46 → 4.92
```
The building's own cinema path CLIMBS, and spends its middle **1.2–1.5 m above Level 1's datum** —
inside the building, legitimately captioned, and outside a half-pitch band. One pitch also states
something true rather than tuned: *a room stops claiming you when you are a full floor from its
datum.* The user's case is rejected by roughly **6x** that margin, so nothing was weakened to make a
test pass.

**Explicitly NOT in scope:** giving rooms real vertical extents in the room graph. That is the
better long-term answer and it is a `common/room_graph.js` change affecting every consumer — this
section fixes the title card against the data that exists today.

### Witness claims — `witness_cpe_room_title_height.js`
| gate | proves / disproves |
|---|---|
| G-RTH-1 | control: a synthetic pose AT a real room's own `cz`, over its rect, still titles that room. Guards against the fix simply switching titles off. |
| G-RTH-2 | **RED today.** The SAME x/y raised by two storey pitches yields NO segment. Today it returns the room and captions it. |
| G-RTH-3 | the boundary is the stated one, not an accident: at 0.9 x pitch above `cz` a title is still produced; at 1.6 x pitch it is not. |
| G-RTH-4 | the log tells the story — `§CPE_ROOM_TITLE_TIMELINE` gains `storeyPitch=<m> rejectedByHeight=<n>`, so "why did my film have no captions" is answerable from the console instead of guessed. |
| G-RTH-5 | no regression at floor level: a walk sampled at storey height produces the same segment count as before the change. |

### ✅ BUILT AND WITNESSED 2026-07-31 — `bim-ootb` PR #1108, viewer sw v893
`witness_cpe_room_title_height.js` **Duplex 5/5**; **RED on `origin/main` 2/5** — `z=cz+4.51m →
segments=1 name="⚠ Roof R1"`, i.e. 4.5 m above the room and still captioned as if inside it.
Regressions re-run and GREEN on both sides: `witness_cpe_room_title.js` 11/11,
`witness_cpe_room_title_timing.js` 3/3 (the segment the half-pitch band had deleted is back, and it
is the same `≈ Level 1 R1` / `realSec=[1.65,3.90]` the baseline produced).
The log now carries the diagnosis: `§CPE_ROOM_TITLE_TIMELINE segments=0 suppressed=0
rejectedByHeight=81 storeyPitch=2.3m` — `rejectedByHeight` counts samples over a room's FOOTPRINT but
outside its storey band, so "why did my film have no captions" is read, not guessed.
**Single-storey buildings:** no pitch is derivable, `storeyPitch=0.0` is logged and the height test is
DISABLED (behaviour identical to before) rather than run against an invented number.

## §CPE_REOPEN_PATHLEN — a saved path re-opens 61% LONGER than it was saved (OPEN, measured 2026-07-31)
Found while answering the user's *"do u notice the fly to the front of the building before turning in,
i dont see such a path"* — that question resolved as expected behaviour (see below), but the record
read out of their live IndexedDB on the way did not.

**Measured, from the user's own browser** (`bim_ootb_cinema_paths` / `paths`, key
`Hospital|plan 07-30 19:41`, the record that baked the 92.4s / 1386-frame mp4):

| field | at SAVE (stored in the record) | at RE-OPEN (`§CINEMA_BEATS` on load) |
|---|---|---|
| `_pathLen` / `pathLen` | **107.5 m** | **173.5 m** (+61%) |
| bands | 3 — `(7.5,-11.6,12.2)`, `(-28.1,-10.3,-19.1)`, `(-25.6,14.3,22.7)`, len 4.52 each | same 3 |
| hose ops | 7, all `s=0.10..0.27`, mags 4.0–15.4 m | same 7 |

**Already ruled out, do not re-check:** §CPE_HOSE_REANCHOR. Every one of the 7 ops carries its world
anchor `a` (`nullCount: 0`) — verified by reading the record, not by reasoning about it. So this is
NOT ops re-projecting by arc-fraction onto a different polyline for want of an anchor.

**✅ ROOT CAUSE FOUND 2026-07-31, and it is one line — `_flownLength()` MEASURES THE UNDEFORMED CURVE.**
Neither candidate below was it; the two functions measure two different curves:

| | file:line | curve measured |
|---|---|---|
| editor | `cinema_path_editor.js:432` | `a.cinemaBandFlow(_state.bands)` — the RAW band flow, **hose never applied** |
| plan | `effects.js:4936` → `:5004` | `_cinemaHoseApply(_cinemaBandFlow(_cpeBands), _cpeHose)` — the **deformed** curve |

The editor already HAS the deformed curve (`_flowHosed()`/`_state.flowHosed`) and uses it for drawing
and hit-testing — §CPE_STICK_ANCHOR's "what you grab is what you see" — but the LENGTH/DURATION maths
reads the raw one. So 107.5 m (raw) vs 173.5 m (hosed) on the user's record is not a round-trip
failure at all: **both numbers are correct measurements of different curves, and the editor is
measuring the one that is never flown.**

**⚠ THE REAL DAMAGE IS NOT THE NUMBER — IT IS THE PACING, AND IT IS IN THE USER'S OWN LOG.**
`_naturalDuration()` (`:438`) divides that short length by the walk speed, and `_buildOverride`
stores the result as `_total`. The bake then treats `_total` as an OVERRIDE. The user's line:
```
§CINEMA_PACING natural=145.0s = ... walk 112.3 ... (walk 173.5m @2.3m/s) override=true running=92.4s
```
The path's natural duration is **145.0 s**; the editor asked for **92.4 s** because it had costed a
107.5 m walk. The film is therefore run **1.57x faster than the 2.3 m/s walk pace it claims** — every
hose pull silently buys speed instead of time. That is the mechanism behind "the walk feels like
flying", and it is not the 25 m climb alone.

**Fix:** `_flownLength()` measures the hosed curve (`_state.flowHosed` when current, else
`_flowHosed(_flowRaw())`). Cost is negligible — `cinemaHoseApply` over ~84 points x 7 ops, and it
already runs every redraw.

### ✅ FIXED AND WITNESSED 2026-07-31 — `bim-ootb` PR #1107, CPE v19, viewer sw v892
`witness_cpe_hose_length.js`, **Duplex 5/5**. **RED with only the one expression reverted: 3/5** —
`G-HL-3 clock=15.32m` against a flown `15.80m`, and `G-HL-5 _total=6.43s` against the `6.86s` the
flown path needs. G-HL-4's tolerance was TIGHTENED after it passed on the RED build (0.5 m absolute
swallowed Duplex's 0.48 m deformation) — **a gate that green-lights the bug it exists to catch is a
decoration**, and this one nearly shipped as one.

**Confirmed on the user's REAL record, not a synthetic case.** Read out of their live IndexedDB and
run through the SHIPPED `cinemaBandFlow`/`cinemaHoseApply` (never a re-implementation):
```
raw   107.55 m  == the stored _pathLen 107.55, exactly
hosed 173.53 m  == the pathLen the plan reported on reopen, exactly
ratio 1.614
```
Both stored numbers were right all along. Nothing was lost in the round-trip.

**Superseded candidates (recorded so they are not re-walked):** (a) the flown polyline the ops are applied
to differs between save and load (`_flowRaw` → `cinemaBandFlow(bands)` → `cinemaHoseApply`), so the
same displacement lands on a different curve; (b) `_pathLen` is captured at save from
`_naturalDuration()`/`_flownLength()` at a moment when the deformed curve differed from the one the
re-plan builds. Both are checkable headlessly: apply the stored override twice — once through
`A.cinemaPathPlan(dur, ov)` and once through the editor's own `_refreshFlow()` — and compare the
flown lengths. No live browser needed.

**Why it matters:** the film's whole pacing hangs off `pathLen` (`§CINEMA_PACING walk = pathLen/2.3
m/s`), so a path that re-opens 61% longer re-times every beat around it. The user has ALREADY accepted
the fly-in as a quirk to live with (below); this one is not in that category — it is a saved artifact
that does not restore to itself.

## §CPE_DIVE_IS_DERIVED — "the fly to the front before turning in" is expected, and is a CAMERA-POSE effect (settled 2026-07-31)
User: *"i dont see such a path, kinda strange"* → after the explanation: *"If it is due to the path
just that it is an effect, then it is OK because the user can play with its quirks and enjoy living
with it."* **Settled as expected behaviour — do not file it as a bug, do not "fix" it.**
The saved record contains ONLY the walk (bands + hose ops) plus four beat DURATIONS. There is no
fly-in geometry in it and there cannot be: the dive is Beat 1, computed at bake time from
(a) `§CPE_CAM_BASIS` — the camera pose at the moment Alt+C was pressed, on that bake
`cam=(135.8,181.0,135.8)`, 264 m out and 181 m up — to (b) the settle point §CINEMA_SPACE chose,
`(-7.3,-14.4,18.0)`. That is `diveDist=269.3 m` in `diveSec=6.1 s` ≈ 44 m/s, arriving pointed inward.
**The only lever today is where the camera is when Alt+C is pressed** — §CPE_STICK's "dive and orbit
remain underivable" is what makes it so. Making the arrival face authorable was OFFERED and NOT taken
up; treat it as an idea, not a queued item.

## §CPE_PREVIEW_BUTTON — a Preview button, NOT auto-preview (settled 2026-07-28)
User, in sequence: *"and the preview must always repeat each time an edit is done"* → *"Or a preview
button"* → **"thus no auto preview needed"**. Settled: **an explicit Preview button on the editor
panel.** It re-runs the existing 10 s fast preview on the CURRENT edited path. No preview fires on its
own — auto-preview after every drag would hijack the authoring gesture, which is why the user landed
here. Supersedes FOUR ASKS item 5's "OK → preview → decide" sequencing for the edit loop (the button is
available at any time, so the OK path needs no special case).
Small requirement that makes it useful rather than decorative: the button must show when the path has
changed since the last preview (stale marker), so "have I seen this version?" is answerable without
guessing. Witness: `§CPE_PREVIEW click stale=<0|1> edits=<n>`.

## §CPE_HOSE_BUILT — implemented and witnessed 2026-07-28 (`bim-ootb` PR #1074, `feat/cpe-hose`)
**23/23 green on Duplex + Hospital_3 (63,415 ops)** — `witness_cpe_hose.js`, `PORT=8421 node witness_cpe_hose.js`.
Built exactly as §CPE_HOSE / §CPE_AIM_DENSITY / §CPE_PREVIEW_BUTTON specify, with ONE stated
deviation (below) and three measured corrections that are now doctrine.

| gate | claim | measured |
|---|---|---|
| W-HOSE-ARC | falloff is arc-length, not world distance | out-and-back twin 0.5 m away in SPACE, half a film away in ARC — moved **0.00e+0 m**; grab point moved 12.000 m of the 12 asked |
| W-HOSE-REACH | reach governs reach | r=0.10 → span 0.195; r=0.30 → span 0.595; r=0.02 → 0.035 (the point-edit end of the continuum) |
| W-HOSE-PLAN | ops reach the FLOWN path | Duplex pathLen 15.3 → 132.5 m; Hospital_3 68.2 → 780.6 m |
| A1 §CPE_AIM_DENSITY | gaze turns toward the mass | angle to centroid 72.4° → 40.0° (Duplex), 75.1° → 61.7° (Hospital_3) |
| A2 §CPE_AIM_DENSITY | no jerk bought with it | peak gaze change **15.8°/f vs 15.8°/f** (Duplex), **43.5 vs 43.5** (Hospital_3) — zero added |
| B1 W-BUILDUP-SAMPLE | mode D opens a clip part-built | placed 0 → 59,161 (mid) → 63,415, monotone (Hospital_3) |
| B2 | mode D is reversible | `tmRestoreDerivedOrder` restores projectStart/End exactly |

### ⚖ THE THREE CAUSES OF THE AIM JERK — measured, and two of my hypotheses were WRONG
Recorded because the next session's first guess will be the same as mine was.
| # | hypothesis | peak deg/frame | verdict |
|---|---|---|---|
| 1 | the argmax subject cell flips frame to frame | 78.5 | smoothing it made it **WORSE** (95.2) — not the cause |
| 2 | the perpendicular projection reverses as the subject crosses the travel axis | 95.2 | real (fixed by fading the projection with `k`), but not the peak |
| 3 | **the rule still held the gaze at the walk→orbit seam** (probe: peak at t=0.8706 against `beats.out=0.8700`) **and aimed against the INSTANTANEOUS tangent**, inheriting the path's own corner rate | 88.4 → 24 → **15.8** | ✅ this was it |
**Settled, do not re-derive:** (a) taper the rule to zero over `CINEMA_TURN_OVERLAP` so Beat 4 picks
up the gaze it was designed to pick up; (b) the travel direction is the local TREND (finite difference
over ~3% of the walk), not the instantaneous tangent — "perpendicular to travel" means to where the
camera is generally heading; (c) the weight and the subject are FIELDS along the path, probed at 65
samples and 2×5-tap binomial smoothed (the §CPE_NOISE_LAW idiom), which also makes the per-pose cost a
lerp instead of a density scan.

### ⚠ DEVIATION FROM §CPE_HOSE.1, stated not buried
The spec argued the hose and the band should be ONE gesture at two falloff radii, and warned against
shipping two affordances. **Shipped: both.** Band handles stay the precise/tangent control — they carry
the length and direction semantics §CPE_BANDS rules 2 and 6 structurally depend on — and the pipe drag
is the hose. The continuum is real and witnessed (reach 2% → 0.035 span, effectively a point edit), but
removing the handles would redesign settled, witnessed behaviour and was out of scope for this PR.
**If the user wants the full unification, that is a deliberate follow-up, not a bug fix.**

### Still open from §CPE_HOSE's own question list (unchanged, still needs the user)
1. falloff shape — shipped as `(1-u²)²`; one line to change.
2. reach is a PERSISTENT editor setting (resolved by the "simplest fastest" guardrail), 15% seed.
3. marker anchoring across a path edit — markers are film-fraction `t`, so a big drag moves what they
   point at. Not yet decided.
4. ARC-only for §CPE_BUILDUP — shipped WITHOUT the filter; the witness reports the ARC count
   (10,941/63,415 on Hospital_3) so the question can be answered from data rather than taste.

## §CPE_STICK — bands are N, not three (BUILT + witnessed 2026-07-28, PR #1074)
**User, after flying §CPE_HOSE on JKR:** *"So u still retrain those three sticks? I cannot do the
intended any part of hose to get arbitrary stick."* — against their ORIGINAL ask, which had two
halves and only one shipped: *"clicking any point will open an aribitary '3 point band' **or** just
dragging a point where the whole path is like a long rubber hose."*

**Their own log said why the hose was unreachable, and it was not the falloff maths.** Every grab in
the session was `§CPE_DRAG_SCALE grab band=… zone=mid`; there is no `§CPE_HOSE grab` line anywhere and
every preview reported `hoseOps=0`. Cause, from the same log: `§CINEMA_BANDS … flown=84` — the hose
hit-tests the WALK polyline, while the drawn pipe is the whole film. On that run the walk was
`pathLen=18.4 m` against `diveDist=67.6 m` and an orbit `granted=54.3`, so **~15% of the visible pipe
was grabbable and nothing showed which 15%.** An affordance you cannot see is not an affordance.

### What shipped
- **Click the pipe → a rigid band is seeded there** (`A.cinemaSeedStick`, in effects.js so the witness
  exercises the shipped function): centre ON the curve, direction = the LOCAL TANGENT, length
  inherited. Inserted in ARC ORDER between settle and stop, never appended. Removable via a `×` on its
  row; settle and stop are not removable (the dive lands on one, the orbit stretches off the other).
- **Click vs drag on the pipe is one grab, split by what the hand does** — release without moving and
  you get a stick; move and you bend the pipe. No modifier to remember.
- **The walk is drawn as a FATTER tube** over the thin film pipe, so the authorable stretch is visible.
  Dive and orbit remain underivable — this makes an existing limit VISIBLE, it does not remove it.
- **§CPE_PREVIEW drives the buildup** (see push-back below). **§CPE_PREVIEW_REDUNDANT:** the pre-editor
  10 s rehearsal is removed; it still runs when `opts.editor === false`.

### ⚖ SUPERSEDES §CPE_BANDS rule 1, and ONLY rule 1
"Three bands, one per anchor, no bands added or removed" is now "N bands". **Nothing else about a band
changes** — rigid length, end=rotate/mid=translate, tangent authoring, store-bands-not-points all
stand, and they are what make a spawned stick worth having. `_cinemaBandWaypoints` and
`_cinemaBandFlow` were already written as loops over `bands.length`, so the plan side needed NO change.

### Push-back the user invited, and the numbers behind it
> *"i dont expect buildup preview can be done as it be heavy engine work... I would expect maybe meshed
> batch or some occlusion happening"*

**There is no new engine work.** Time Machine already drives per-element visibility through BatchedMesh
`setVisibleAt` and InstancedMesh zero-scale matrices — that is what its playback does today on 122k-
element buildings. The preview moves the same cursor. Costs: re-key is a ONE-OFF 12–14 ms (1,120 ops);
per frame it is `renderAtTime`, measured in `TM_INCREMENTAL_RENDER_PERF.md` at 2.0 ms on the delta path
and ~23 ms full at 16k objects, and a 10 s preview steps the cursor far under `_INCR_MAX_SPAN_MS` so the
delta path engages. The one case that pays full price is DLOD engaged on a very large building, and it
is now VISIBLE as `§CPE_PREVIEW msPerFrame` rather than a mystery.

### ⚠ THE WITNESS WAS WRONG THREE TIMES BEFORE THE CODE WAS — read before writing the next gate
| # | instrument | read | why it was wrong |
|---|---|---|---|
| 1 | two films compared pose-by-pose at equal `t` | 98.4 m | a stick lengthens the walk, so duration and beat fractions move — equal-`t` samples land on DIFFERENT BEATS (dive vs walk). A re-timing, not a jump. |
| 2 | walks resampled by ARC FRACTION | 2.578 m | the stick inserts its own length, so the two polylines differ in total length and fraction-matching compares points offset by ~a stick along a curve |
| 3 | gated in absolute metres | — | a budget that passes on a house and fails on a terminal for identical behaviour |
**The correct instrument: point-to-curve (one-sided Hausdorff) deviation, gated at 0.6× the stick's own
length.** Replacing a curved arc with a rigid chord of the same length deviates by the sagitta, so "it
did not jump" means *the disturbance is bounded by the thing you dropped*. Measured: **0.640 m against
a 1.13 m budget (Duplex, 1.89 m stick, 15.3 m walk); 1.222 m against 4.58 m (Hospital_3, 7.64 m stick,
68.2 m walk)**; seeded tangent vs local tangent `dot=1.000000` on both.
Gates: **S1** dropped stick is a no-op · **S2** moving it moves the path (52.5 m / 500.3 m) · **S3**
removing it restores the film exactly (`0.00e+0 m`). 29/29 green overall.

### Still open after this
- **Dive and orbit are still not authorable** (§CPE_BANDS "still open" — bands 4 and 5). "Any part of
  the path" is blocked on THAT, not on the hose or the stick. It is now at least honestly signposted.
- Marker anchoring across a path edit (§CPE_HOSE open question 3) — markers are film-fraction `t`, so
  a large edit moves what they point at.

## §CPE_VISION_CHAIN — the roadmap in one place, so it isn't only in the user's head (interim capture, 2026-07-28)
**Not a new spec.** Nothing here commits to new build order beyond what's already ✅ elsewhere in this
file. This exists because the user laid out the full end-to-end chain in conversation and asked for it
written down before it's only recoverable from a chat log.

### Origin — the user's own framing, lightly cleaned up for reading, not reworded in substance
> *"Task data can be injected as the build sequence can base on later. Building in parts is on the heels
> of recent success of functional space injection giving awareness of where large halls, stairs and
> storeys are, a fast simple hose path is granted. Then it can be edited. Now the whole length. Then
> more build up animation — as a POC first. Then intelligent marker placing, i.e. set to nearest room,
> stairs climbing — all to lead in speed and ease of use, besides being utterly free."*

### The chain, mapped to what exists vs what's still vision
| step | what it is | status |
|---|---|---|
| 1. Space awareness | knowing where halls/stairs/storeys are | prior work, not owned by this file — see `FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md` |
| 2. Fast simple auto-hose path | GENERATE a first-pass path FROM space awareness, not hand-placed | **NOT built** — §CPE_HOSE/§CPE_STICK only EDIT a path that already exists from the Alt+C plan; nothing yet proposes a path from room/hall/stair layout |
| 3. Edit the whole length | drag-edit with arc-length falloff | ✅ built — §CPE_HOSE_BUILT, §CPE_STICK (N arbitrary bands, 29/29 green, PR #1074) |
| 4. Build-up animation, POC first | construction reveal synced to camera travel | ✅ POC built — §CPE_BUILDUP / W-BUILDUP-SAMPLE, honestly labeled DERIVED order, not a real schedule (no `tasks` data exists in the source DBs today) |
| 5. Intelligent marker placing (nearest room, stairs-climbing) | §CPE_CLIP markers snapped to space semantics instead of raw arc-fraction | **NOT built** — §CPE_CLIP markers are `t`-fraction only; §CPE_HOSE open question 3 already flags they don't survive a path edit, and nothing yet snaps a marker to "nearest room" or recognizes a stair-climb |
| 6. Real task data injected later | replace the derived buildup order with an actual linked schedule when one exists | **NOT built, explicitly deferred** — the DERIVED-order honesty label in §CPE_BUILDUP is the placeholder; swapping in real `tasks`/`task_elements` rows is a data-availability problem, not a code problem, once a building actually has one |

### Why "free" is load-bearing, not a footnote
Checked against the closest professional analogues (2026-07-28 research pass): Synchro and Navisworks
TimeLiner do step 4 — cinematic camera + construction sequence — but require a REAL linked schedule as
input; neither has a derived-order fallback for a building that never got 4D data attached. Twinmotion/
Enscape/Lumion do a step-3-equivalent camera path but waypoint-based, not proximity-falloff hose editing
— and none of the four (Synchro, Navisworks, Twinmotion/Enscape/Lumion) are free. The chain above isn't
a cheaper clone of any one of them; the entry point (no schedule required to start, more accurate if one
is added later, free throughout) is different from all of them.

### Open, in the user's stated order — not yet spec'd, flag before starting any of these
1. Auto-generate a first-pass hose path from room/hall/stair/storey space-awareness data (step 2) — needs
   its own spec; nothing in this file currently produces a path FROM space data, only edits one that
   already exists.
2. Marker placement snapped to space semantics ("nearest room", "stairs climbing") instead of arc-fraction
   `t` — extends §CPE_CLIP and would resolve §CPE_HOSE open question 3 (marker anchoring across an edit)
   at the same time, since a room-anchored marker doesn't drift the way a `t`-fraction one does.
3. Real task-data injection path for §CPE_BUILDUP — **✅ DONE (witness) 2026-07-28, 16/16 GREEN on
   `feat/cpe-buildup-schedule`. See §CPE_BUILDUP_REAL_SCHEDULE (the spec) and
   §CPE_BUILDUP_REAL_SCHEDULE_BUILT (the measured result) at the end of this file.** §CPE_BUILDUP now
   branches: a building with dated leaf `tasks` reveals in real `schedule_start` order (proven on
   `TerminalHi4D.db` — 5 phases, 0 interleaving pairs, vs mode D smearing all 5 into 23 days with 4/4
   pairs interleaving); a building without one keeps today's derived order **bit-identical** (gated
   against a control repeat of the old call, `0/40` frames differ). Three findings worth carrying
   forward: (a) the "author a schedule in the Viewer and save it to the DB" half was **already shipped**
   (`schedule_author.js` / `schedule_editor_ui.js` / `foreign_schedule.js`) and was verified, not
   rebuilt; (b) `TerminalHi4D.db`'s schedule is `materializeDefault`'s output, **not** a P6 import — the
   id/naming fingerprint is decisive, so the "no float, no logic, no resources" honesty bound still
   applies; (c) the §BILLBOARD_INJECT panel + 4 floodlights are **already bound** to leaf tasks
   (Architecture / MEP Final), because `materializeDefault` covers 100 % of `elements_meta` by
   construction. One ⛔ question remains open for the user — see that section's "Still open".

---

# §CPE_BUILDUP_REAL_SCHEDULE — feed §CPE_BUILDUP a REAL schedule when the building has one (2026-07-28)
**Spec-first. Written before any code**, per CLAUDE.md §Standing Rules. Closes §CPE_VISION_CHAIN open
item 3 / chain step 6. Cross-references, does not repeat: **§CPE_BUILDUP** (the checkbox + the DERIVED
-order honesty label), **§CPE_HOSE_BUILT** (what shipped in PR #1074), **§CPE_VISION_CHAIN** (why this
is next), `PHOTOREAL_STILL_RENDER.md §MAXQ_TIME mode D` (the re-key), and
`prompts/archive/XER_IMPORT_P6_ADOPT_LANE.md` (the foreign-programme adopt seam — already shipped, NOT
rebuilt here).

## 0. ⚠ THREE THINGS THAT ALREADY EXIST — do not rebuild any of them (verified by reading the code, 2026-07-28)
This section exists to STOP a fresh session re-implementing shipped work. Each claim below was read out
of the actual files, not assumed.

| already built | where | what it does |
|---|---|---|
| **Real-schedule READ path** | `viewer/time_machine.js` `injectGantt()` → the `_cap` IIFE (~line 3121) | Probes `tasks` for **dated, non-summary leaf** rows (`WHERE schedule_start IS NOT NULL AND schedule_finish IS NOT NULL AND (is_summary IS NULL OR is_summary = 0)`), builds `guid → task` from `task_elements` (earliest-starting task wins on a multi-link guid), then OVERLAYS the real task window + real task name onto every covered element's `kernel_ops` row (`_captured=1`). Uncovered elements keep generative timing. Sets `_capActive`, `_coveredCount`, `_coveragePct`; logs `§GANTT_SOURCE captured …` / `§4D_COVERAGE …`, or `§GANTT_SOURCE generated` when absent. **`is_summary` is ALREADY honoured — the root task is already excluded.** |
| **Schedule AUTHORING in the Viewer, with DB persistence** | `viewer/schedule_author.js` (`materializeDefault`, `assignElement`, `activeSchedule`, `persistDb`), `viewer/schedule_author_ui.js` (✎ Author wizard), `viewer/schedule_editor_ui.js` (WBS/Gantt/CPM editor, `doGenerate`, `doImportP6`) | Writes `schedules`/`tasks`/`task_elements` directly and debounce-persists the mutated db back into the shared IndexedDB building cache (§SE-6, PR #770). **This IS "author a schedule in the Viewer and save it to the DB". It shipped.** |
| **Foreign-programme import (P6 XER / PMXML / MSPDI)** | `viewer/foreign_schedule.js` (`parseForeign` → `toScheduleData` → `adoptIntoDb` → `autoBind`), driven by `schedule_editor_ui.js doImportP6` | Same four tables. W-FGN 22/22 green. See `archive/XER_IMPORT_P6_ADOPT_LANE.md`; the write-back side is a separate lane (`XER_PMXML_WRITER_LANE.md`) and the real-`.xer`-fixture gate is still ⛔ (`XER_REAL_FIXTURE_PROOF.md`) — neither is in scope here. |

**Consequence: the original two-half framing collapses.** "Half 2 — author/inject a schedule from the
Viewer and save it to the DB" is **ALREADY BUILT** and needs verification, not construction. The only
genuinely missing link is half 1, and it is a *one-branch* defect described in §2.

## 1. The JSON-in / DB-out shape the authoring path actually uses (user: *"atm we working with the 4d json settings in view that users will either import to or edit from"*)
There are **two** JSON surfaces, and they are different things. A spec that conflates them will send the
next session to the wrong file.

**(a) `rates/sequence_rules.json` — the 4D *rules* JSON. THIS is the one the user edits/imports.**
`viewer/rates.js loadSequenceRules()` fetches it, deep-merges any user override from
`localStorage['json_sequence_rules']`, and applies `SEQUENCE_RULES` / `SEQUENCE_DEFAULT` /
`LABOR_RATES` **in place** onto the globals (object identity preserved, so existing references stay
valid). Fallback on any failure = the hardcoded objects. Logs `§RATES_JSON loaded=json|json+override|fallback rules=<n> labor=<n>`.
Shape: `{ SEQUENCE_RULES: { "<ifc_class substring>": {phase, sequence, resource} }, SEQUENCE_DEFAULT: {phase, sequence, resource}, LABOR_RATES: {…} }`.
The class→phase match is **longest-substring containment**, and `schedule_author.js matchRule` is a
deliberate exact replica of `time_machine.js matchRule` so authored phases equal what `injectGantt`
would have grouped.

**(b) `ForeignSchedule.toScheduleData()`'s return value — the *interchange* JSON.**
`{schedules[], tasks[], taskSequences[], calendars[], taskElements[], _meta}` → `adoptIntoDb(db, data)`.
This is the P6/MSP import shape only; `taskElements` is always `[]` (P6 carries no model guids —
binding is the separate `assignElement` / `autoBind` craft).

**The flow, end to end, all of it already shipped:**
`sequence_rules.json (+localStorage override)` → `SEQUENCE_RULES` → `ScheduleAuthor.materializeDefault(db, SEQUENCE_RULES, {start, phaseDays})`
→ `schedules`/`tasks`/`task_elements` rows → `persistDb()` → IndexedDB → next load → `injectGantt()`'s `_cap` → real dates on `kernel_ops`.
**This spec adds NOTHING to that chain.** It only stops §CPE_BUILDUP from throwing the result away (§2).

## 2. THE DEFECT — §CPE_BUILDUP destroys a real schedule 100% of the time
`cinema_maxq.js` (~line 724) runs, with no branch of any kind:
```js
_bkState = window.tmOrderByCameraPath(function (t) { … }, nFrames);
```
`tmOrderByCameraPath` (`time_machine.js` ~4873, §MAXQ_TIME mode D) **overwrites `op.start_ts` and
`op.end_ts` for every op** with `reveal = (floor(cameraS·frames) + zRank)/frames`, then re-sorts and
re-derives `_projectStart`/`_projectEnd`. It runs *after* `injectGantt()` has already written the real
task windows onto those same ops.

**Therefore: a building WITH a real linked schedule currently produces a byte-identical buildup film to
one with no schedule at all.** The §CPE_BUILDUP honesty label ("derived build order, not a construction
programme") is not merely cautious — it is currently *unconditionally true by construction*, even when
the data would support the stronger claim. That is the whole bug.

## 3. THE FIX — one branch, two new read-only TM verbs, zero change to the render path
**Non-negotiable: when no real schedule is present, the code path must be BIT-IDENTICAL to today.**
§CPE_BUILDUP's derived mode is shipped and witnessed (W-BUILDUP-SAMPLE, B1/B2 in §CPE_HOSE_BUILT); this
work must not perturb it. That is what `W-SCHED-FALLBACK` gates.

**3.1 `window.tmScheduleSource()` — a pure read, no side effects.** Returns
```
{ source: 'captured' | 'derived', leafTasks, summarySkipped, covered, total, pct,
  projectStart, projectEnd, ops }
```
built from the already-maintained `_capActive` / `_coveredCount` / `_coveragePct` / `_projectStart` /
`_projectEnd` plus a `tasks`-table count for `leafTasks`/`summarySkipped`. It must NOT trigger
`injectGantt` and must NOT mutate anything.

**3.2 `window.tmOrderBySchedule()` — the captured branch, and it deliberately does almost nothing.**
The correct implementation of "order the reveal by the real schedule" is **to leave `_ops` alone.**
`injectGantt`'s `_cap` has *already* keyed every covered op to its task window, `loadOps()` reads them
back `ORDER BY timestamp`, and `computeDays()` has already set `_projectStart`/`_projectEnd` to the real
project epoch. So this verb: validates (`_capActive && _ops.length`), counts coverage, **performs no
write**, and returns the SAME object shape `tmOrderByCameraPath` returns
(`{ops, placed, noGeom, projectStart, projectEnd}`) plus `source:'captured'` — so `cinema_maxq.js`'s
per-frame cursor loop needs **no change whatsoever**. Because it writes nothing, `_bkSaved` stays null
and `tmRestoreDerivedOrder()` is a genuine no-op: there is nothing to restore, which is *stronger* than
restoring correctly (`W-SCHED-REVERSIBLE`).

**Within-phase order is NOT flat, and that is already handled.** §PLAYBACK-STAGGER (2026-07-19) sorts
each task's covered guids bottom-up by `center_z` and distributes them linearly across that task's own
`[start, finish]` window instead of collapsing them onto it. So the reveal is *real phase order between
phases, real-Z order within a phase* — the derived Z-band discipline survives as the tie-break, exactly
as `zRank` does in mode D. Nothing new is needed for this.

**`wbs_parent` is NOT a sort key.** Ordering is `schedule_start` (present on every leaf). `wbs_parent`'s
only roles are (a) identifying the root/summary ancestry that `is_summary` already filters out, and
(b) a stable tie-break for two leaves sharing an identical `schedule_start`. Sorting *by* `wbs_parent`
would be inventing a hierarchy semantic the data does not carry.

**3.3 The branch in `cinema_maxq.js`** — replaces the unconditional call:
```js
var _ss = (typeof window.tmScheduleSource === 'function') ? window.tmScheduleSource() : null;
if (_ss && _ss.source === 'captured') _bkState = window.tmOrderBySchedule();
else                                  _bkState = window.tmOrderByCameraPath(poseFn, nFrames);
```
Every existing `§CPE_BUILDUP_SKIP` guard is retained unchanged. If `tmOrderBySchedule()` returns null
(schedule present but unusable), **fall through to `tmOrderByCameraPath`** — a degraded real schedule
must never be worse than no schedule.

**3.4 The user-visible label must move with the data.** §CPE_BUILDUP's "say *derived build order*, never
*the schedule*" rule stands **only in the derived branch**. In the captured branch the status string
names the real source and its coverage. It must still not overclaim (§5).

## 4. Witness claims — named before implementation, in the style of §CPE_HOSE's list
Rig: `witness_cpe_buildup_schedule.js`, same harness shape as `witness_cpe_hose.js` (puppeteer,
SwiftShader ANGLE, `PORT=8421`, real viewer page, `§`-log + numeric state only — **no screenshots**,
FUNDAMENTAL LAW).

- **W-SCHED-REAL-ORDER** — on a building whose `tasks` are populated, the buildup reveal follows the
  SCHEDULE, not the camera. Proof is numeric and cannot pass by accident: for every consecutive pair of
  leaf phases ordered by `schedule_start`, **max(reveal cursor of phase *i*) ≤ min(reveal cursor of
  phase *i+1*)** across all covered elements — i.e. phases do not interleave. Mode D provably CANNOT
  satisfy this (its reveal key is camera proximity, which scatters every phase across the whole film);
  so this gate is exactly the difference between the two orders. Report per-phase
  `[firstFrame, lastFrame]` windows.
- **W-SCHED-FALLBACK** — on a building with NO usable `tasks` (`§GANTT_SOURCE generated`), the code path
  is unchanged: `tmScheduleSource().source === 'derived'`, `§MAXQ_TIME mode=D` still prints, and the
  frame-by-frame `placed` series is **identical** to the same run with this change reverted. This is the
  regression gate; without it the change is not shippable.
- **W-SCHED-REVERSIBLE** — after a captured-branch buildup, every op's `start_ts`/`end_ts` equals its
  pre-bake value **exactly** (diff = 0 on all ops), and `_projectStart`/`_projectEnd` are unchanged. A
  bake must never leave the user's Time Machine re-ordered. (Stronger than mode D's restore, because
  nothing was written.)
- **W-SCHED-MONOTONE** — the captured branch still satisfies §CPE_BUILDUP's own trap: `placed` is
  monotone non-decreasing across frames, starts at/near 0, ends at/near total, and a MID sample is
  strictly between — so a §CPE_CLIP still opens on a partially-built model.
- **W-SCHED-COVERAGE** — the reported coverage is real, not asserted: `covered + generated == total`,
  `pct` matches, and the count of elements bound in `task_elements` equals what `_cap` says it covered.
- **W-SCHED-BILLBOARD** (§6) — the billboard panel and the 4 floodlights are each bound to a leaf task
  and therefore appear in the captured reveal, with their frame index reported.
- **W-SCHED-AUTHOR-ROUNDTRIP** — author → save → reload → §CPE_BUILDUP consumes it. Because the
  authoring path already exists (§0), this is a **verification** gate over shipped code, not a gate on
  new code: run `ScheduleAuthor.materializeDefault(db, SEQUENCE_RULES, {start:'2026-01-01', phaseDays:30})`
  on a building that has none, confirm `tmScheduleSource()` flips `derived → captured`, and confirm
  W-SCHED-REAL-ORDER then passes on that building too.

## 5. The honesty rule, updated — what may and may NOT be claimed
§CPE_BUILDUP's original label was forced by there being no data at all. With data, the label becomes
*conditional*, and it must still be bounded by what the data actually carries.

`TerminalHi4D.db` (`~/Downloads/OPEN SOURCE BIM/`, 306 MB, `building_name=TerminalMerged`,
`import_date=2026-05-02`) contains, **verified by direct query, 2026-07-28**:
- `schedules`: **1 row** — `SCH_AUTHORED | Authored Schedule | PLANNED | 2026-01-01`
- `tasks`: **6 rows** — `TASK_ROOT` (`is_summary=1`, name `Project`, 2026-01-01→2026-05-31, `P150D`)
  + 5 dated leaves, contiguous 30-day windows: Superstructure (01-01→01-31), MEP Rough-in (01-31→03-02),
  Architecture (03-02→04-01), MEP Final (04-01→05-01), Finishes (05-01→05-31).
- `task_elements`: **48,433 rows = 100.0 % of `elements_meta` (48,433)**. Superstructure 35,061 /
  MEP Rough-in 9,477 / MEP Final 2,377 / Architecture 1,260 / Finishes 258.
- **`resource`, `is_critical`, `total_float`, `free_float`: ALL NULL on every row. `task_sequences`
  table: absent. `predefined_type`: `CONSTRUCTION` on all 6.**

**PROVENANCE — settled by evidence, not inference.** This schedule was produced by
`ScheduleAuthor.materializeDefault(db, SEQUENCE_RULES, {start:'2026-01-01', phaseDays:30})` — the exact
call at `schedule_editor_ui.js:503` / `:653` ("Generate first draft" / "Regenerate"). Every field
matches that function's literals: `schedId='SCH_AUTHORED'`, `INSERT INTO schedules VALUES (…, 'Authored
Schedule','PLANNED', start)`, `rootId='TASK_ROOT'` named `'Project'` with `is_summary=1`, leaf ids
`'TASK_' + _slug(name)` (hence `TASK_MEP_Rough_in` from `"MEP Rough-in"`), 30-day contiguous windows
from `_addDays(start, cursor*30)`, `resource` written as literal `null`, and 100 % element coverage
because the loop assigns **every** row of `elements_meta`. It is **NOT** the foreign-import path:
`adoptIntoDb` would have produced `A:`/`W:`-prefixed task ids, `status='Imported'`, a populated
`task_sequences`, and an **empty** `task_elements`. (Recorded because it was guessed both ways during
this session; the id/naming fingerprint is decisive.)

**So the permitted claim is:** *"a real, per-element, saved phase assignment — five dated construction
phases covering 100 % of the model, authored in the Viewer and persisted to the IFC-native 4D tables."*
**The forbidden claims are:** "a CPM schedule", "critical path", "float", "resource-loaded", "imported
from P6/Primavera", or anything implying predecessor logic. **There is none in this file.** The
importer that *would* carry that data is shipped and separate (§0 row 3); this DB simply did not come
through it. Nothing in the code or the UI copy may imply otherwise.

**The two labels, verbatim, so a future session does not re-invent them:**
- derived branch → `derived build order (not a construction programme)` — unchanged from §CPE_BUILDUP.
- captured branch → `linked schedule: <n> phases, <pct>% of elements` — states scope, claims no logic.

## 6. §BILLBOARD_INJECT elements in the 4D — user directive: *"this has to be part of the 4D generate feature"*
The billboard panel + 4 corner floodlights (`PHOTOREAL_STILL_RENDER.md §12 §BILLBOARD_INJECT` /
`§BILLBOARD_ART`, SQL in `migration/billboards/terminal_billboard.sql` + `terminal_billboard_floodlights.sql`)
did not exist when §CPE_BUILDUP or the foreign-schedule lane were designed. **Checked directly against
`TerminalHi4D.db`, 2026-07-28 — they are ALREADY BOUND. No patch needed:**

| guid | ifc_class | discipline | bound to |
|---|---|---|---|
| `BB0BIMOOTBSIGN000001A` | `IfcBuildingElementProxy` | ARC | **`TASK_Architecture`** |
| `BB0BIMOOTBFLOOD000001`…`4` | `IfcLightFixture` | ELEC | **`TASK_MEP_Final`** (all four) |

**Why it worked without anyone arranging it, and where the real risk is.** `materializeDefault` iterates
`SELECT guid, ifc_class FROM elements_meta` and assigns **every** element via `matchRule`, falling back
to `SEQUENCE_DEFAULT` when no rule matches — so coverage is 100 % *by construction*, and anything
present in `elements_meta` at generate time is bound automatically. The floodlights landed in MEP Final
because `IfcLightFixture` matches an ELEC rule; the panel landed in Architecture via the proxy/default
route. **The actual gap is ORDERING, not the rule:** an element injected into `elements_meta` **after**
the schedule was authored is left unbound, is skipped by `_cap.guidTask`, and silently falls back to
generative timing inside a film the user believes is schedule-driven. In this DB the billboard SQL was
applied *before* generate, so it is covered.

**Two requirements this section adds, therefore:**
1. **W-SCHED-BILLBOARD** (§4) asserts these 5 guids are in `task_elements` and reports the frame at
   which each is revealed — so a regression that drops decorative/proxy elements from the 4D is caught
   by a number, not noticed later in a film.
2. **`tmScheduleSource()` must report `covered`/`total`/`pct` and the captured-branch status string must
   surface it**, so a partially-bound model (post-authoring injection) is *visible* rather than silent.
   **Anything below 100 % coverage is a real, reportable condition, not a rounding detail.**
   ⛔ **BLOCKED — one user decision, not inventable:** *when a model has been edited since its schedule
   was authored (coverage < 100 %), should the buildup (a) reveal the unbound elements on their
   generative fallback timing, (b) hold them to the end of the last phase, or (c) refuse the captured
   branch and fall back wholly to mode D?* Shipping (a) — today's `_cap` behaviour, the smallest change,
   and the only option that alters nothing — and flagging the count in the log until the user rules.

## 7. Explicitly NOT in this section
A P6/MSP **importer** (shipped — §0 row 3), the P6 **writer** (`XER_PMXML_WRITER_LANE.md`), the real-
`.xer` fixture gate (`XER_REAL_FIXTURE_PROOF.md`, ⛔ blocked on a user-supplied export), CPM/float/
resource derivation for a schedule that carries none, a new authoring UI (shipped — §0 row 2), and
§CPE_VISION_CHAIN items 1 and 2 (auto-hose path, space-semantic markers) which remain unspecced.

## §CPE_BUILDUP_REAL_SCHEDULE_BUILT — implemented and witnessed 2026-07-28 (`bim-ootb` `feat/cpe-buildup-schedule`)
**16/16 GREEN** — `witness_cpe_buildup_schedule.js`, `PORT=8433 DER_BLDS=Duplex,Hospital_3 node witness_cpe_buildup_schedule.js`,
log `W_SCHED_run5.log`. Built exactly as §3 specifies, with **one measured correction to §3.1 that the
witness caught before it shipped** (below). **Half 2 was NOT built — it already existed** (§0); it was
verified instead, by `W-SCHED-AUTHOR-ROUNDTRIP`, over a real page reload.

### The headline number — the §2 defect, measured on both sides
Same building (`TerminalHi4D`), same 48,433 ops, the two orders side by side:

| leaf phase | `schedule_start` | CAPTURED reveal window | mode-D reveal window (the defect) |
|---|---|---|---|
| Superstructure (35,061) | 2026-01-01 | 2026-01-01 .. 2026-01-30 | 2026-03-05 .. 2026-03-27 |
| MEP Rough-in (9,477) | 2026-01-31 | 2026-01-31 .. 2026-03-01 | 2026-03-08 .. 2026-03-27 |
| Architecture (1,260) | 2026-03-02 | 2026-03-02 .. 2026-03-31 | 2026-03-09 .. 2026-03-28 |
| MEP Final (2,377) | 2026-04-01 | 2026-04-01 .. 2026-04-30 | 2026-03-09 .. 2026-03-28 |
| Finishes (258) | 2026-05-01 | 2026-05-01 .. 2026-05-30 | 2026-03-13 .. 2026-03-28 |

**Captured: 5 clean, non-overlapping phase windows across the real Jan–May programme, 0 interleaving
pairs. Mode D: all five phases smeared into the same 23 days, 4/4 consecutive pairs interleaving.**
That contrast is `R1` + `R2` — and `R2` exists precisely so `R1` cannot pass for a reason unrelated to
the fix: a gate mode D also satisfied would prove nothing.

### The gate table
| gate | claim | measured |
|---|---|---|
| SRC | the source is detected | `source=captured leafTasks=5 summarySkipped=1 covered=48433/48433 pct=100%` |
| **R1 W-SCHED-REAL-ORDER** | reveal follows the schedule | 5 leaf phases, **0 interleaving pairs** |
| **R2 discriminator** | the gate discriminates | mode D interleaves **4/4** consecutive pairs |
| **V1 W-SCHED-REVERSIBLE** | the captured branch writes nothing | 48,433 ops, `sumStart delta=0 sumEnd delta=0`, `tmRestoreDerivedOrder()=false` |
| V1b | mode D still restores exactly | `sumStart delta=0 sumEnd delta=0` after re-key + restore |
| **M1 W-SCHED-MONOTONE** | a clip still opens part-built | placed `0 → 45,248 (mid) → 48,433` over 40 frames, monotone |
| **C1 W-SCHED-COVERAGE** | coverage is real, not asserted | `task_elements` distinct bound guids **48,433** == `_cap` covered **48,433** == elements **48,433**, 100% |
| **B1 W-SCHED-BILLBOARD** | §6, the decorative elements are in the 4D | 5/5 bound: panel → Architecture (frame 23/39), 4 floodlights → MEP Final (frame 31/39) |
| **F1 W-SCHED-FALLBACK** | no schedule → refuse, do not guess | Duplex + Hospital_3: `source=derived leafTasks=0 capOps=0`, `tmOrderBySchedule()=null` |
| **F2 regression** | the derived path is untouched | Duplex + Hospital_3: branch result **exactly equals a repeat of the old call** — `ops`, `placed`, `noGeom`, `arc`, window all equal, checksum `sumStart delta=0 sumEnd delta=0`, placed series `0/40` frames differ |
| **A1 W-SCHED-AUTHOR-ROUNDTRIP** | author → save → **reload** → consumed | Duplex: `derived → RELOAD → captured`; 6 phases / 1,119 assignments; after reload `tasks=7 task_elements=1119 covered=1119/1119 pct=100%`, **0 interleaving pairs** |

### ⚠ MEASURED CORRECTION TO §3.1 — `_capActive` alone is the WRONG test, and the witness caught it
The first run failed at setup: `tmOrderBySchedule()` returned null on `TerminalHi4D` — a building with
a complete, 100%-bound real schedule. **`_capActive` is set by `injectGantt`'s `_cap` overlay, so it is
a RUN-SCOPED SIDE EFFECT, not a property of the data.** `activate()` deliberately SKIPS `injectGantt`
when the db already carries usable `ELEMENT_PLACE` ops with `_end_ts` (`time_machine.js` ~4462) — the
cached/shipped-timeline fast path — which is exactly the state of any building whose schedule was
authored in an earlier session and persisted. Confirmed by direct query: all 48,433 of TerminalHi4D's
`kernel_ops` carry `"_captured":1` and `"_task":"TASK_*"` with timestamps spanning the real
2026-01-01..2026-05-30 window, and `_capActive` was still `false`.

**Corrected rule, now in the code:** the source is decided by the OPS THEMSELVES —
`captured ⇔ (dated leaf tasks exist) AND (_capActive OR any op carries parameters._captured)`.
Coverage likewise counts `capOps` off the loaded ops FIRST, falling back to `_coveredCount` only when
ops have not been reloaded yet: `_coveredCount` tallies `_cap`'s UPDATE executions against
`kernel_ops`, so a db with duplicate `ELEMENT_PLACE` rows for a guid inflates it past the element count
(measured **2238 on a 1119-element Duplex** — a 200% "coverage" — during an intermediate run).
**Had this shipped on `_capActive` alone, the feature would have been silently dead on exactly the
buildings it was built for.**

### ⚠ THE F2 INSTRUMENT WAS WRONG TWICE BEFORE THE CODE WAS — read before touching that gate
| # | instrument | read | why it was wrong |
|---|---|---|---|
| 1 | both paths in ONE page, compare the placed series frame by frame | 1/40 frames differed | mode D's tie-break `zRank = i/(n-1)` is the op's INDEX in the current `_ops`. Re-key re-sorts; restore re-sorts back — and for ops with TIED original timestamps the stable sort preserves the *camera* order, not the load order. A second pass starts from a different permutation. Pre-existing non-idempotence in SHIPPED mode D (its `noGeom` branch sets `camS = zRank`, so index changes leak into values), not a regression. |
| 2 | one path per FRESH page load | `ops=1120` vs `1121`, windows 4.6 s apart | `injectGantt` anchors the generated timeline on `new Date()` — every load has a different epoch — and the IDB building cache PERSISTS across loads in one browser profile, so a stray op from load 1 is present in load 2. A differential across two different inputs is not a differential. |
| 3 | ✅ **the correct one: a CONTROL.** One page. Three consecutive DIRECT passes (the old code), then the branch. Gate = branch **exactly equals pass 3**. | GREEN | Measures the branch against a repeat of the OLD call, so the shipped artifact is held constant on both sides. **No invented tolerance anywhere.** The control also proves the artifact converges: sumEnd deltas vs pass 1 were `0, -1.75, -1.75` (Duplex) and `0, 192, 192` (Hospital_3) — settled by pass 2, so pass 3 is a stable control. |

### What shipped
- `viewer/time_machine.js` — `window.tmScheduleSource()` (§3.1, pure read), `window.tmOrderBySchedule()`
  (§3.2, the captured branch — **writes nothing**), `window.tmPhaseWindows()` (§4, the aggregate numeric
  instrument: per-leaf-task first/last reveal + an all-ops checksum; never ships 10^5 rows to a caller).
- `viewer/cinema_maxq.js` — the §3.3 branch, plus the §5 status label that moves with the data
  (`🎬 Building to the linked schedule (5 phases, 100% of elements)` vs the unchanged derived wording).
  Every existing `§CPE_BUILDUP_SKIP` guard retained; a captured-but-unusable schedule falls THROUGH to
  mode D, never to nothing.
- `viewer/sw.js` — `CACHE_VERSION` v873 → v874 (both changed files are precached).
- `witness_cpe_buildup_schedule.js` — the 16 gates above.
- **No DB binary touched, no migration needed:** the schema already exists and `TerminalHi4D.db` already
  carries the rows. Nothing in this change writes to a building db.

### The §-log line
```
§CPE_BUILDUP_SOURCE source=captured leafTasks=5 summarySkipped=1 covered=48433/48433 pct=100%
  capOps=48433/48433 capActive=false window=2025-12-31..2026-05-31
  — REAL LINKED SCHEDULE, reveal follows schedule_start (no re-key, no float/logic in this data)
```
`capActive=false` in that line is not a defect — it is the corrected detection working: the schedule was
authored in an earlier session, so `injectGantt` never re-ran, and the ops themselves are the evidence.

### Still open after this
- ⛔ **BLOCKED (§6, needs the user, one question):** when a model has been edited since its schedule was
  authored (coverage < 100 %), should the buildup (a) reveal unbound elements on their generative
  fallback timing, (b) hold them to the end of the last phase, or (c) refuse the captured branch
  entirely? **Shipped (a)** — today's `_cap` behaviour, the smallest change, the only option that alters
  nothing — with the count surfaced in `§CPE_BUILDUP_SOURCE` until the user rules. Not encountered in
  practice yet: every building tested is at 100 %.
- **Two pre-existing defects this work MEASURED but did not fix** (out of scope, named so they are not
  rediscovered): (1) shipped mode D is not idempotent across a save/restore cycle — its `noGeom` branch
  uses `camS = zRank`, an index, so a tie permutation leaks into values (bounded, converges after one
  pass, `0/40` frames in the placed series once settled); (2) `injectGantt` re-run in place can insert a
  SECOND set of `ELEMENT_PLACE` ops on top of the existing ones, which is what inflated `_coveredCount`
  to 200 %. The shipped `tmRefoldSchedule()` (§TM-REFOLD) is the correct verb and avoids (2).
- §CPE_VISION_CHAIN items 1, 2 and 5 (auto-hose path, space-semantic markers) remain unspecced.

---

# §CPE_REPLAN_LAZY — cache the entry derivation; make re-deriving it a BUTTON (spec 2026-07-29)

**Item 0 of `prompts/CINEMA_DELIGHT_BATCH.md`.** Written before implementation, per Spec-First. Nothing
here changes the film's SHAPE — this is an equivalence-gated performance change plus one new control.

## 0. The defect, from the user's own console (not a hypothesis)
`§CPE_REPLAN_SLOW ms=600–1000` on EVERY edit on Terminal (48,433 elements, 4 bands). Across EIGHT
consecutive drags in that session, the expensive block printed **byte-identical values** — same
`§CINEMA_SPACE` candidate, same `§CINEMA_DIVE` settle point, same `§CINEMA_EXIT` door, same cost, same
runner-up. `§CINEMA_PLAN_MS ~550` of the total is that block: `fanRays=32 spaceCands=52 exitCands=135`.
A band drag changes the walk geometry; it cannot change which room the camera dives into or which door
it walks out of, because §CPE_PREVIEW_DIVERGENCE already **pins the camera basis to the pose the editor
opened with** precisely so orbiting cannot change the film.

## 1. The seam — VERIFIED by reading the code, branch `feat/cpe-stick`
| what | where |
|---|---|
| `_cinemaPathPlan(durationSec)` opens | `viewer/effects.js:4572` |
| §CINEMA_SPACE chosen candidate | `:4749` |
| §CINEMA_DIVE settle | `:4795` |
| §CINEMA_EXIT chosen door | `:4874` |
| **`if (_cpeBands && _cpeBands.length >= 2)`** — the authored-path block | **`:4929`** |
| `§CINEMA_PLAN_MS` (plan close) | `:6135` |
So the PREFIX is `4572 → 4928` and everything the editor can touch — bands, hose, clip, pacing,
§CPE_NOISE_LAW probes, `poseAt` — acts at or after `:4929`. The line is clean and it is not a
refactor of anyone's working set to respect it.

## 2. Phase A — MEASURE BEFORE CACHING (no behaviour change, ship-able on its own)
Do not assume the 550 ms is where the prose says it is. Split `§CINEMA_PLAN_MS` into a breakdown and
read it on Terminal with 4 bands over 8 drags:
`§CINEMA_PLAN_MS total=<n> bboxMs=<n> spaceMs=<n> diveMs=<n> exitMs=<n> flowMs=<n> paceMs=<n> poseMs=<n>`
**This measurement DECIDES phase B's shape:** if `spaceMs+diveMs+exitMs` dominates, memoise those three
blocks in place (smallest possible change); if the cost is spread across the prefix, memoise the whole
prefix as one object. Either way the cache key below is the same.

## 3. Phase B — the cache key, and what is deliberately NOT in it
**IN the key** (anything that can legitimately change the entry):
`buildingId` · `A._metaGen` · the pinned camera basis (position, world direction, controls target) ·
the §CINEMA_PIVOT mode and pivot point · the arcBbox extents.
**NOT in the key** (all consumed at or after `:4929`): bands, hose ops, clip in/out, pace/beat-second
overrides, band count, undo state.
**Invalidate on:** any key change, editor OPEN, building switch, `_metaGen` bump, and the explicit
button in §4. Miss ⇒ recompute the prefix and log why (`reason=open|key|button|first`).

## 4. Phase C — `re-derive entry`, the control the user implied
> User: *"Cant that be lazy only when user press that feature?"*

Re-deriving the entry is a real thing a user may WANT — a different room to dive into, a different door
to walk out of — it just must not happen eight times by accident while dragging a stick. A button in the
CPE panel drops the memo and forces one recompute, logging `prefixMs` so the cost is visible as a number
rather than hidden in every drag. **This turns a hidden 550 ms tax into an explicit feature**, and it is
part of THIS task, not a follow-up.

## 5. Witness claims — named before implementation
- **W-REPLAN-CACHE (the gate — equivalence, NOT speed).** For N ≥ 20 random band/hose edits, the cached
  plan and the same plan with the memo disabled must agree on ~200 sampled `poseAt(t)`: position within
  **1e-6 m**, yaw/pitch within 1e-6 rad. Same discipline as `§INCR_VERIFY mismatch=0` in the Time
  Machine work, where an equivalence witness caught exactly this class of bug.
  *Proves/disproves:* whether the memo silently pins the film to a stale settle point or door.
- **W-REPLAN-INVALIDATE.** A building switch and a `_metaGen` bump must each produce a MISS, and the
  recomputed prefix must differ from the previous one where the model differs.
  *Proves/disproves:* the failure mode above — a cache that is never invalidated always "passes" W-1.
- **W-REPLAN-SAVING.** `§CPE_REPLAN_LAZY hit=<n> miss=<n> savedMs=<n> prefixMs=<n>` over a scripted
  8-drag sequence: hits = 7, misses = 1, and `savedMs` is reported as a measured number.
  *Proves/disproves:* that the saving is real and not a hope. **A regression in `§CPE_REPLAN_SLOW` on
  Terminal is the user-facing number this whole item exists to move.**
- **No regression:** `witness_cpe_hose.js` stays 29/29 on Duplex, with the D1 Hospital_3 known-limit
  unchanged (recorded, not tuned).

## 6. Explicitly NOT in this section
Any change to WHICH space, door or pivot the plan picks; any change to pacing (§CPE_SPEED_RAMP is item 6
and must never share a PR with a pacing change); hover scrub, room titles, cues, detours (items 1–5).

---

# §CPE_REOPEN_DOUBLE — the band count DOUBLES on every re-open of an authored path (2026-07-29)
> User: *"Bug where it seems to dupe more bars upon alt-c cancel and resume, so when i reopen saved
> path it gave me back my last count."*

## The mechanism, read from the code — it is exact, not approximate
Two functions with reciprocal fan-out, composed in a loop:
- `_cinemaSeedBands(wp)` (`viewer/effects.js`) emits **one band per waypoint** — `for (i = 0; i < wp.length; i++) bands.push(...)`.
- `_cinemaBandWaypoints(bands)` emits **two waypoints per band** (its two ends) — which is why
  `§CPE_OPEN` prints `waypoints = bands.length * 2`.

`open()` seeds from `a.cinemaSeedBands(plan.waypoints, plan.pathLen)` — **unconditionally**, including
when the plan it was handed was itself BUILT from authored bands. So once a path is staged:

| cycle | authored bands | plan waypoints | bands on next open |
|---|---|---|---|
| 1 | N | 2N | **2N** |
| 2 | 2N | 4N | **4N** |

**The count doubles per open, forever.** Cancel is irrelevant — `finish('cancel')` correctly returns
`override: null`; what feeds the doubled plan is the staging from an earlier *Save this path* / OK
(`A._cinemaPathEdit`), which the plan wrapper re-applies on every subsequent plan. And *"reopen saved
path gave me back my last count"* is `_pathsApply` behaving CORRECTLY — it restores exactly the record
that was saved, which by then was already inflated.

**This corrupts saved plans**, so it outranks the performance work: every save taken after a re-open
stores a band list the user never authored.

## The fix — the plan already carries the answer and `open()` ignores it
`_cinemaPathPlan` already returns `bands: _cpeBands ? …map(c,d,len) : null` (`viewer/effects.js`) — the
authored bands, verbatim. So:
```
var seeded = (plan.bands && plan.bands.length >= 2) ? plan.bands : a.cinemaSeedBands(plan.waypoints, plan.pathLen);
```
Middle bands are re-flagged `_stick: true` on adoption, exactly as `_pathsApply` already does, so the
`×` remove affordance survives a re-open. Derived (unauthored) plans are untouched: `plan.bands` is
`null` there, so the seeder still runs and a first open is byte-identical to today.

## Witness claims
- **W-REOPEN-STABLE (the gate).** Open → author N bands → build the override → re-plan with it →
  re-open: band count is **N, not 2N**, and each adopted band equals the authored one within 1e-6 in
  centre, direction and length. *Proves/disproves:* the doubling, and that adoption is not a re-seed
  wearing a different name.
- **W-REOPEN-DERIVED.** With no override, the seeded count and geometry are unchanged from today.
  *Proves/disproves:* that the fix did not alter the derived first-open path.
- `§CPE_OPEN` gains `src=authored|seeded` so a pasted console says which branch ran.

---

# §CPE_PREVIEW_AFTER_RETIRED — OK records; it does not preview first (user, 2026-07-29)
> User: *"also when OK, do not run preview again as there is already a Preview button"*

## This is the SECOND half of a cut already made once
`§CPE_PREVIEW_REDUNDANT` (2026-07-28) removed the 10 s rehearsal that ran **before** the editor opened,
on the user's reasoning *"I see the initial preview is redundant. Straight showing this is good as
preview button is always there and serving well."* The comment justifying that removal is still in
`viewer/cinema_maxq.js` and its argument covers this case verbatim — the pipe shows the path without
flying it, and §CPE_PREVIEW_BUTTON flies the current edit on demand, as many times as wanted.

`§CPE_PREVIEW_AFTER` — the 10 s flight that runs **after OK**, between §CPE_APPLIED and frame 0 — was
written for a build where **the editor could not preview at all**. Its own comment says so: *"Until now
the only 10s rehearsal ran BEFORE the editor opened, so it showed the DERIVED path… The film you
actually authored went straight to a ten-minute bake unseen."* §CPE_PREVIEW_BUTTON landed after it and
closed that gap directly, with a stale marker (`Preview ●`) that answers *"have I seen THIS version?"*
The post-OK preview has been ten forced seconds proving something the user already chose when to see.

## The change — one block, and only when the editor ran
In `cinema_maxq.js`, inside `if (_cpeRes && _cpeRes.override)`, delete:
```js
if (opts.preview !== false) {
  if (await _runPreview('edited', '🎬 Preview of YOUR edit (10s) — the ' + nFrames + '-frame bake follows; Alt+C cancels')) {
    _cancelledOut('the edited-path preview'); return;
  }
}
```
**`_runPreview` STAYS.** The `opts.editor === false` branch (scripted/witness bakes, where there is no
panel and therefore no Preview button) is the one caller that still needs a rehearsal, and it keeps it.
`opts.preview` keeps its meaning for that caller. Nothing else in the OK path changes: §CPE_APPLIED,
§CPE_CLIP, §MAXQ_START_REVISED and the frame re-derivation all still run, and guardrail 2's untouched-OK
no-op is untouched.

**What the user loses, stated plainly:** OK is now irreversible-ish in one respect — the last chance to
catch a bad edit before a long cook was that forced flight. The replacement is the Preview button plus
its stale marker, which is *better* (any time, repeatable, and it tells you when you are looking at an
older version) but it is **opt-in**, so a user who never presses it bakes unseen. That is the trade the
user is asking for, and it matches how they already ruled on the pre-editor preview.

## Witness claims — this RETIRES an existing witness, it does not just add one
`witness_cpe_preview_after.js` (4 gates, G-PA-1…4) exists **to prove the post-OK preview runs.** Deleting
the feature without re-aiming that witness would leave a green-by-neglect file asserting the opposite of
the shipped behaviour — the exact defect class §CPE_IDB_PATH_STORE's `waypoints=0` log and §CPE_REOPEN's
stale `_markClip` comment belong to. Re-aim it in the same commit:
- **G-PA-1 → inverted (the gate).** After an EDITED OK, **no** `§MAXQ_PREVIEW start phase=edited` line
  appears between `§CPE_APPLIED` and `§MAXQ_FRAME i=0`, and the frame-0 pose still equals the edited
  plan's `poseAt(0)` within 1e-6. *Proves/disproves:* that the removal cut the rehearsal and not the
  edit — a bake that silently reverted to the derived plan would also print no edited preview.
- **G-PA-2 → keep, re-pointed at the BAKE.** The old gate resampled the edited preview to prove it flew
  the authored film. With the preview gone, sample the first N baked frames instead: they must diverge
  from the derived plan's poses by the same margin the old gate measured. *Proves/disproves:* the same
  property (the edit reached the flown path), through the only flight left.
- **G-PA-3 → keep unchanged in intent.** `§CPE_PREVIEW_DIVERGENCE` still holds: the bake's frame 0 is
  the edited plan's `poseAt(0)`.
- **G-PA-4 → repair, it is ALREADY STALE.** It asserts an untouched OK gets *exactly one* preview,
  `phase=derived` — but §CPE_PREVIEW_REDUNDANT removed that derived rehearsal on the same day this file
  landed. **Verify its current state before re-aiming** (it may be RED on `main` right now, in which
  case say so rather than quietly rewriting it). Correct claim: an untouched OK runs **zero** previews.
- **No regression:** `witness_cpe_hose.js` stays 29/29 on Duplex, D1 Hospital_3 known-limit unchanged.

## Explicitly NOT in this section
The Preview button's own behaviour, the stale marker, the clip window it honours, or the buildup it
drives; the `opts.editor === false` rehearsal; §CPE_REPLAN_LAZY (still item 0 of the delight batch).

---

# §CPE_BUILDUP_SOURCE_BLIND — Alt+C bakes mode D on Hospital, and the log never says why (user, 2026-07-29)
> User: *"another serious alt-c/TM interaction, Hospital has a proper schedule, but when done in alt-c
> it takes a bad one that flattens too much too early"*

**Diagnosed from the user's pasted console plus the DBs themselves. Four findings, only one of which
is the thing they saw.** Nothing here is implemented yet — this is the spec.

## 0. What their console actually proves
```
§TIME_MACHINE ON — 63439 ops, 182 days, project: 1/1/2026 → 7/29/2026
§GANTT_MINI tasks=36
§GANTT_CACHE_HIT ops=63421                        ← generated timeline, restored from cache
§CPE_BUILDUP ON — reveal follows the camera path (derived build order, NOT a construction programme)
§MAXQ_TIME mode=D … span=18042087338ms — DERIVED BUILD ORDER re-keyed to the camera path
```
There is **no `§GANTT_SOURCE captured` line** and **no `§CPE_BUILDUP_SOURCE` line of any kind**. Both
absences are load-bearing evidence, and the second one is finding 4.

## 1. Hospital has NO linked schedule — its 4D is GENERATED, and that is not a criticism of it
Measured on `~/bim-ootb/buildings/Hospital_extracted.db` (263 MB):
```
CREATE TABLE tasks (task_id TEXT PRIMARY KEY, schedule_id TEXT, name TEXT,
                    start_date TEXT, finish_date TEXT, duration_days REAL, status TEXT);
tasks: 0 rows      schedules: 0 rows      task_elements: 0 rows
```
So `injectGantt`'s `_cap` overlay — the ONLY writer of `parameters._captured` — never runs, `capOps`
is 0, and `tmScheduleSource()` correctly answers `derived`. **`§GANTT_MINI tasks=36` is not the tasks
table:** `_ganttTasks` is built in `time_machine.js` (~3816) by GROUPING ops into phase × storey bands.
The 36 bars in the TM drawer are a view of the generated timeline, not 36 schedule rows.

**The user's premise is right in substance and wrong in mechanism.** Hospital's 4D *is* real work —
`schedule_gate.js` gates every element by its true geometric Z, bottom-up, in storey bands, and
§PLAYBACK-STAGGER spreads each phase across its own window. It is a deterministic, model-derived build
order. It is simply not a *captured* one, so §CPE_BUILDUP_REAL_SCHEDULE's captured branch is right not
to fire. **Do not "fix" this by loosening the captured test** — that would let the film claim a linked
schedule it does not have, which is the §5 honesty rule.

## 2. ⚠ THE DEFECT THE USER SAW — mode D throws the generated timeline away too
`tmOrderByCameraPath` **re-keys all 63,439 ops to camera-path proximity**, discarding the bottom-up,
storey-banded order the TM drawer is showing at that very moment. Proximity to a flight path has no
relationship to storey order: Hospital's dive lands at bbox-centre `settle=(-7.3,-14.4,18.0)` and the
walk is 73.6 m through a building of `boundingR=91.4`, so everything near that short walk reveals at
once, on every storey, in the first fraction of the film. **That is "flattens too much too early",
exactly.**

This is §CPE_BUILDUP_REAL_SCHEDULE §2's defect — *"mode D destroys a real schedule 100% of the time"* —
recurring for the GENERATED case, which that section fixed only for the captured case. The generated
order is also an order worth respecting.

**The fix is a third mode, not a widened test. §CPE_BUILDUP_MODE_T — "follow the Time Machine".**
`tmOrderBySchedule()` already proves the shape: it writes NOTHING and returns the same object
`cinema_maxq.js`'s cursor loop consumes, because `_ops` are ALREADY in timeline order the moment the
timeline exists. Mode T is that function minus its `leafTasks > 0` precondition. Selection becomes:
captured schedule → mode S; a timeline exists but is generated → **mode T**; no timeline at all →
mode D. Mode D stops being the default and becomes what you ask for when you WANT the reveal keyed to
the flight.
- **⚠ Do NOT delete mode D.** It is the right answer for a building with no 4D at all, and it may be
  the better *look* for a short film. It becomes a choice, and the checkbox grows a third state or a
  small select — decide with the user, do not invent the control.
- **⚠ Wording, per §5 and the three tiers.** Mode T is *"follows this model's derived 4D timeline"* —
  never *"the schedule"*, never *"a construction programme"*. Only mode S may say *linked schedule*.

## 3. ⚠ TWO INCOMPATIBLE `tasks` SCHEMAS — §3.1's query THROWS on one of them
| db | tasks columns | rows |
|---|---|---|
| `Hospital_extracted.db` | `start_date`, `finish_date`, `duration_days` — **no `is_summary`, no `schedule_*`** | 0 |
| `JKR_extracted.db` | `schedule_start`, `schedule_finish`, `is_summary`, floats, `is_critical` … | 0 |
| `Terminal`, `Duplex` | no `tasks` table at all | — |

`tmScheduleSource()` queries `schedule_start / schedule_finish / is_summary`. On Hospital's schema that
raises `no such column`, which the `catch` turns into `leafTasks = 0` — **indistinguishable from "this
building has no schedule".** Today that is harmless (0 rows either way), but it is a live landmine: the
day a building carries populated `start_date`/`finish_date` rows, it will be reported as having no
schedule, silently, and mode D will eat it. **W-SCHED-SCHEMA:** a db with populated rows in EITHER
schema must report `source='captured'`; a caught SQL error must log `§CPE_BUILDUP_SOURCE probe_failed
reason=<sqlite message>` rather than being folded into the same 0 the empty case produces.

## 4. ⚠ THE PREVIEW NEVER ASKS — `cinema_path_editor.js` calls `tmOrderByCameraPath` unconditionally
`cinema_path_editor.js:1001`:
```js
if (ok) bkPrev = window.tmOrderByCameraPath(function(t) { return s.plan.poseAt(t); }, 60);
```
No `tmScheduleSource()` consultation at all — the whole §3.3 branch exists only in `cinema_maxq.js`.
So on a building that DOES have a captured schedule, **the Preview button shows mode D while the bake
records mode S**: the rehearsal disagrees with the film it is rehearsing. It is not corruption — line
989 calls `tmRestoreDerivedOrder()` on completion, so the ops are put back — but it is the same class
of divergence §CPE_PREVIEW_DIVERGENCE exists to forbid, and it matters MORE now that
§CPE_PREVIEW_AFTER_RETIRED makes the button the only rehearsal there is.
**Fix: lift the mode selection into one shared verb both callers use.** Two call sites choosing the
buildup source by different rules is the root cause; a copy of the branch into the editor would just
be the same bug twice.

## 5. ⚠ AND NOBODY LOGS THE CHOICE — this is why the diagnosis needed a DB dig
`cinema_maxq.js:737` only prints when it TRIES the captured branch. When `source === 'derived'` it says
**nothing**: no line names the source, the leaf-task count, the coverage, or the reason. The user's
console therefore cannot answer *"why mode D?"* — it took opening `Hospital_extracted.db` to find out.
**Make the choice unconditionally loud, in BOTH callers:**
```
§CPE_BUILDUP_SOURCE mode=S|T|D reason=captured|generated-timeline|no-timeline
  leafTasks=<n> capOps=<n>/<ops> capActive=<0|1> covered=<n>/<n> pct=<n>% window=<iso>..<iso>
```
A pasted console must answer which order the film used and why, on its own — the standing rule from
§MAXQ_LOADED's *"u got to make the logs tell u"*.

## Build order and witness claims
1. **§5 first, on its own** — the log line, both call sites, no behaviour change. It is the instrument
   every other gate here reads, and it is what makes the next live report self-diagnosing.
   *Gate:* Hospital prints `mode=D reason=no-captured-schedule leafTasks=0 capOps=0/63439`.
2. **§3** — schema-tolerant probe + `probe_failed` logging. *Gate:* W-SCHED-SCHEMA above.
3. **§4** — one shared selection verb; the preview and the bake must return the SAME mode for the same
   building. *Gate:* W-BUILDUP-PREVIEW-AGREES — on a captured-schedule building, preview and bake log
   the identical `mode=`. RED today by construction.
4. **§2 mode T** — last, because it is the only one that changes what the film looks like, and it needs
   the control decided with the user first. *Gate:* W-BUILDUP-MODE-T — on Hospital, the reveal order
   must correlate with element Z (bottom-up) rather than with distance to the path; report Spearman
   against both, and mode T must beat mode D on the Z correlation by a stated margin.

## ✅ SETTLED SAME DAY — the user ruled before any of it was built, and it is simpler than the spec above
> *"do not bake anything for TM.. as i said, it is user's own plan"*
> *"this practices good separation of tasks"*
> *"so buildup it gives as it is basis"*

**The open question below is CLOSED and mode D is retired from the film path — do not re-open either.**
There is no three-way selector, no *"reveal along the flight path instead"* sub-option, and no control
to design: **Time Machine owns the build order, Alt+C owns the camera.** The buildup takes the TM
timeline AS IT IS and plays it. That is also the §CPE_BUILDUP_SETTLED ruling (2026-07-29c) applied one
level down — authorship belongs to the user, who previews the TM and places their markers; the camera
must not invent an order for them.

~~⛔ Open question: mode D still has a use — do you want it as a choice, or gone?~~ **Answered: gone.**

### Built and shipped 2026-07-29 — `bim-ootb` PR #1082, CPE v15, MAXQ v17, sw v880
One verb, `tmFollowTimeline()` (`time_machine.js`), used by BOTH callers. It writes nothing, because
`_ops` are already in timeline order the moment the timeline exists:
- **mode S** — captured/linked schedule; delegates to `tmOrderBySchedule()`, unchanged.
- **mode T** — this model's own derived 4D timeline, followed verbatim.
- **no mode D.** `tmOrderByCameraPath` is left in place and unchanged, and **nothing calls it.** It is
  still correct at what it does; re-keying a timeline to camera proximity is simply not something the
  film may do. ⚠ Do not re-wire it into the buildup path.

§4 (preview vs bake divergence) and §5 (nothing logged the choice) closed in the same commit, both as
consequences rather than as separate fixes — one shared verb cannot disagree with itself, and it logs
`§CPE_BUILDUP_SOURCE mode=S|T reason=… leafTasks=… capOps=… placed=… window=…` unconditionally.
§3 (the two `tasks` schemas) is **still open** — harmless today because both are empty, and W-SCHED-SCHEMA
above still names the gate for the day one of them is populated.

**Wording, unchanged in force:** mode S may say *linked schedule*; mode T says *this model's 4D
timeline* — never *"the schedule"*, never *"a construction programme"*. The checkbox now reads
*"build the model as the film plays (follows the Time Machine, not a programme)"*.

---

# §CPE_CLICK_SLOP — a click on the pipe can never spawn a stick, because there is no pixel threshold (user, 2026-07-29)
> User: *"when i made a new node in the pipe, it does not show up in the alt-c panel list as first time
> using. I know it can appear after refresh. But immediate as before is important helpful."*

## The mechanism — exact, from the code and confirmed by their own console
§CPE_STICK's contract is *"ONE grab, split by what the hand does: let go without moving and you get a
stick; move and you bend the pipe."* `h.up` implements the split correctly:
```js
if (!d.op) { if (d.hit) _spawnStick(d.hit); return; }   // never moved -> stick
```
**But `h.move` has no threshold.** The FIRST `pointermove` of any size creates the op:
```js
if (!d.snapped) { d.snapped = true; _undoPush(...); d.op = {...}; _state.hose.push(d.op); }
```
A physical mouse click emits at least one `pointermove` of 1–2 px in almost every case (tremor, or the
pointer drifting between down and up). So `d.op` is truthy by the time `h.up` runs and **the stick
branch is unreachable in practice.** The `mag < 1e-4` cancel below it does not save the gesture either:
at Hospital's `rate=0.192 m/px`, ONE pixel is 0.19 m of displacement — four orders of magnitude above
that threshold — so the click lands as a real, recorded hose pull.

**Their console proves it:** five `§CPE_HOSE grab` → `§CPE_HOSE landed` pairs (smallest `disp=1.84m`),
**zero `§CPE_STICK` lines**, and `§CINEMA_BANDS bands=3 waypoints=6` unchanged from first plan to last.
No node was ever created — the panel list was right.

## ⚠ And "it can appear after refresh" was §CPE_REOPEN_DOUBLE, which is now FIXED
That half is not a second feature — it was the doubling bug. Re-opening used to re-seed from
`plan.waypoints` (2 per band), so bends showed up as extra rows on the next open. §CPE_REOPEN_DOUBLE
(PR #1081, this same day) removed that, which also removed the accidental route by which a hose pull
eventually became a row. **Do not "restore" it.** The right fix is to make the CLICK work, which is
what the user asked for in the first place ("immediate as before is important helpful").

## The fix — a click slop, and nothing else
Gate the op's creation on the gesture exceeding **`CLICK_SLOP_PX = 4`** from `sx0/sy0` (standard click
slop; at 0.192 m/px that is 0.77 m, comfortably below any intentional bend). Below it the grab stays
a candidate click, the pipe does not deform, no undo entry is pushed, and `h.up` reaches
`_spawnStick`. Above it the gesture becomes a hose pull exactly as today — including `_undoPush`,
which must stay on the crossing, not on pointerdown, or a click would leave an undo step that does
nothing (the reason it was moved off pointerdown in the first place).
- **Do NOT add a modifier key or a mode.** The one-grab-split-by-the-hand rule is settled doctrine;
  this is a bug in how "did the hand move" is measured, not a reason to re-litigate the gesture.
- **Do NOT apply it to the band-handle drag** (`h.down`'s `hit` branch). That path has no click action,
  so a threshold there would only add lag.

## Witness claims
- **W-CLICK-STICK (the gate).** A synthetic pointerdown → pointermove of **2 px** → pointerup on the
  fat pipe spawns exactly one stick: `§CPE_STICK added`, `bands` N→N+1, a new row in `#cpe-rows`, and
  **no** `§CPE_HOSE landed` line. *Proves/disproves:* the defect exactly — 2 px is the jitter a real
  click carries, and it is what makes the current build take the wrong branch.
- **W-CLICK-DRAG.** The same gesture with a **20 px** move produces a hose pull and NO stick: one
  `§CPE_HOSE landed`, `bands` unchanged. *Proves/disproves:* that the slop did not turn small
  intentional bends into stray nodes.
- **W-CLICK-UNDO.** A 2 px click leaves the undo stack able to remove the stick, and a 0 px press
  leaves NO undo entry at all (G-DRAG-1's existing property, which must survive).

### ✅ WITNESSED 4/4 (2026-07-29) — and the RED was the instrument three times over
`witness_cpe_click_slop.js` first shipped RED with an honest "the harness cannot land a gesture" note.
It lands now, and §CPE_CLICK_SLOP passes: **G-CS-1** 2 px grab → rows 3→4, `§CPE_STICK added=1`, no
`§CPE_HOSE landed`; **G-CS-2** 20 px grab → one `§CPE_HOSE landed`, bands unchanged; **G-CS-3** Ctrl+Z
back to 3; **G-CS-4** 0 px press → rows 3→4. Shipped in `bim-ootb` PR #1084, sw v882.

**⚠ THE ROOT CAUSE IS A REAL PROPERTY, not merely a test bug — know it before writing any pipe test.**
`h.down` checks `_hitTest` (band handles) **BEFORE** `_hitTestPath` (the pipe). A pixel inside a
handle's grab radius is therefore a **BAND DRAG and can never be a stick**, however exactly it sits on
the tube. The witness was choosing exactly such a pixel every run. `_probePipe` now returns
`{pipe, band}` and the picker rejects any pixel with a band under it.

**Three hypotheses were measured and each was WRONG** — recorded so none is re-tried: (1) the blind
42 px canvas sweep was too coarse (true, but fixing it did not fix the gate); (2) the CPE panel was
occluding the point (`elementFromPoint` proved `APP.canvas` was topmost); (3) CDP input was not
reaching a capture-phase `pointerdown` (switching to real `PointerEvent` dispatch did not fix it
either — though that change was KEPT, since it removes CDP synthesis from the loop entirely).
This is `feedback_verify_checker_before_code_under_test` earning its place four times in one session.

**⚠ Second-order consequence worth its own thought, NOT yet specced:** every stick you add covers more
of the pipe with handle grab radius, so the pipe gets progressively harder to click as a path gets
denser. Nobody has hit this yet and it is not today's defect — but it is the reason a "click the pipe"
affordance degrades with use, and §CPE_HOVER_SCRUB will make it visible. Decide it there.

---

# §CPE_BE_HERE_WHEN — the shot the demo caught by ACCIDENT, made authorable (user, 2026-07-29)
> User, on their published demo: *"the path happens to catch the right impression onset the
> construction and approaching the block it caught just in time the outer wall paneling of the floors,
> and glimpse of the inner rooms exhaust covers"*
> *"now i am not sure which next step can top that wow"*

## The insight — that shot was LUCK, and luck is a feature request
Two independent clocks coincided: the camera's arrival at the block, and the 4D's installation of the
façade panelling. The camera passed the rooms while the exhaust covers were still visible — i.e. in the
window AFTER the MEP was installed and BEFORE the envelope closed over it. Nobody authored that. Drag
one band and it is gone.

**§CPE_WHEN_HERE (item 7) is specced as a READ — "mark a place, get its construction window." The thing
that tops the demo is the WRITE:** pin a point on the path to a moment in the timeline and let the
PACING solve for it. *Be **here** when **that** is being built.*

## Why now, and not before today
- **§CPE_BUILDUP_FOLLOW_TM made the target stand still.** Until this morning the reveal was re-keyed to
  the camera path, so "when is this built" changed every time a band moved — there was nothing stable to
  solve against. Mode T fixed that as a side effect, and it is what makes this feature possible at all.
- **The mechanism exists.** This is a constraint on pacing, and pace redistribution is already built.
  ⚠ **Same law as §CPE_SPEED_RAMP: fold the constraint INTO the cost integrand, never as a multiplier
  after it**, or §CPE_EVEN_TURN's turn-per-frame bound breaks and the jerk comes back. That lane cost
  several sessions and three dead ends; do not re-learn it here. The peak-deg/frame witness is the gate.
- **The glimpse-before-occlusion moment is only available in a 4D film.** In a finished model those
  exhaust covers are behind a wall. This is not a prettier picture than a rendered walkthrough — it is a
  picture a rendered walkthrough structurally cannot take. That is the defensible claim, and it is the
  same honesty tier already settled: a film cut against a real schedule, not a nice movie.

## ⚠ The honest limit — state it in the UI, do not fake around it
It only works where the schedule HAS that ordering. On a building whose 4D installs the envelope before
the MEP, there is no window to arrive in. **The feature must report "no such window on this building"
rather than inventing one or nudging the schedule** — nudging the schedule would be the camera authoring
the build order again, which is exactly what §CPE_BUILDUP_FOLLOW_TM removed on the user's ruling.

## Shape to explore (NOT yet a build plan — spec it properly before any code)
- Pick a target: an element, a room, or a phase (`_sfxPhases` already derives phase changes per tick).
- Derive its window from the SAME `_ops` the buildup plays — never a second notion of "when".
- Solve pacing so the camera's `t` at that point maps to a cursor inside the window; report the achieved
  offset as a NUMBER, and report failure when the window cannot be hit within the pacing bounds.
- **Witness sketch:** `§CPE_BE_HERE_WHEN target=<guid|room|phase> window=<iso>..<iso> cameraT=<f>
  cursorAt=<iso> offsetDays=<n> hit=1|0 peakTurnDeg=<n> (bound=<n>)` — plus the unchanged jerk gate.

## Relationship to the queue — this does NOT displace Find→Film
`prompts/CINEMA_FIND_TO_FILM.md` stays the next POC: it is the CORRECTNESS instrument, and it is what
makes a route trustworthy. This is the one that makes a route CINEMATIC. **They compose** — pick the
ward in Find, film the route, arrive as it is built. Build them in that order, not this one first.

# §CPE_WALK_BUDGET_NOISE_BLIND — the walk's SECONDS bypass the noise law entirely (user, 2026-08-01)

**User, after adding nodes:** *"also look at the timing overall, when at extra node length, it seems
to slow down too much"* → then the ruling: *"it shuld be controlled by that noise-speed ratio we setup
before to govern thruout"*.

**They are right, and it is measurable from their own LTU_AHouse log — same session, one edit apart:**
```
derived  (3 waypoints)  §CINEMA_PACING walk 15.2s   pathLen 29.6m
authored (6 waypoints)  §CINEMA_PACING walk 19.9s   pathLen 34.6m
```
| | derived | authored | change |
|---|---|---|---|
| path length | 29.6 m | 34.6 m | **+16.9%** |
| walk seconds | 15.2 s | 19.9 s | **+30.9%** |
| ↳ travel (`len / 2.3`) | 12.87 s | 15.04 s | +16.9% |
| ↳ **turn charge** | **2.33 s** | **4.86 s** | **+108.4%** |
| ↳ implied degrees | 35.0° | 72.8° | +108% |

Travel tracks length exactly, as constant speed requires (§CINEMA_PATH_EDITOR_MODEL rule 9). **More
than half the extra time from adding a node is TURN CHARGE**, and the turn charge is where two things
go wrong.

## Defect 1 — the walk budget has NO noise term at all
`effects.js:5755-5757`:
```js
dive:  Math.max(CINEMA_DIVE_MIN_SEC, _diveEff / CINEMA_DIVE_MPS * (1 + (CINEMA_PACE_SWING - 1) * _diveBusy)),
out:   totalLen / CINEMA_WALK_MPS + _walkTurnDeg() / (CINEMA_TURN_DPS / 3),
```
The **dive**'s seconds are multiplied by `(1 + (PACE_SWING-1) * busy)` — the user's rate-of-change law,
applied to the budget. The **walk**'s seconds are raw metres plus raw degrees. `PACE_SWING` still
governs the walk's frame SPACING (§CPE_EVEN_TURN, `speedRange=1.60x`), so the film redistributes time
inside the beat correctly — but the size of the beat is decided before the noise law is ever consulted.
`§CPE_NOISE_LAW beat=walk`'s own log line claims it *"tempers the turn-driven crawl: a corner whose
CONTENT is not changing stays cheap"*. It tempers the spacing. It does not temper the bill.

## Defect 2 — the turn rate contradicts its own comment
`effects.js:5150-5153`, immediately above `_walkTurnDeg`:
> *"No new constant — rotation is charged at `CINEMA_TURN_DPS`, the rate the spin and the orbit lap
> already turn at, so a degree of turning costs the same wherever it occurs."*

The code charges `CINEMA_TURN_DPS / 3` = **15°/s**, not 45°/s. A degree of walk turning costs **three
times** what the spin pays for the same degree, and the `/3` is exactly the kind of unexplained
constant the comment is asserting does not exist. At the honest 45°/s the authored path's turn charge
would be 1.62 s instead of 4.86 s, and walk seconds would rise +22% instead of +31% for a +17% path.

## ⚠ THIS IS THE THIRD INSTANCE OF ONE DEFECT FAMILY — name it and check the rest
Budget computed on one number, motion executed on another:
1. **§CPE_HOSE_LENGTH_BLIND** (FIXED, PR #1107) — clock costed 107.55 m, camera flew 173.53 m, films ran 1.57x fast.
2. **The 534° spin whip** (OPEN, session-close item #3) — `finalSpinDeg=-523.0` executed against a budget costed on a **capped 180°** (`§CINEMA_PACING`: *"spin raw 523deg capped 180deg @45deg/s"*, visible in the same LTU log).
3. **This** — walk budget priced without the noise law that governs everything else.
A sweep for any other place where a cost and its motion read different quantities is worth one pass.

## The rule to apply — one law, every beat
> The walk's seconds go through the SAME `(1 + (PACE_SWING - 1) * busy)` treatment the dive already
> uses, with `busy` from the walk's own `§CPE_NOISE_LAW beat=walk` probe — so a corner in a static
> area is cheap and a corner where content is changing buys its frames. And a degree of turning is
> charged at `CINEMA_TURN_DPS`, matching the comment that is already there, with the `/3` removed or
> justified in writing.

**⚠ Do NOT introduce a new dial.** `CINEMA_PACE_SWING = 1.6` is the single bounded knob and the user
settled its meaning 2026-07-27 (*"100% rate of change"*, no density term — `effects.js:5648`). This
change makes the walk obey it; it does not add a second one.

## Witness claims — `witness_cpe_walk_budget.js`
| gate | proves / disproves |
|---|---|
| G-WB-1 | **RED today, on the user's own case.** Adding waypoints that lengthen the path 16.9% raises walk seconds 30.9%; after the fix the excess over length is attributable to measured busyness, not to a flat degree tax. |
| G-WB-2 | the walk budget responds to busyness at all: two paths of EQUAL length and EQUAL turning through areas of different `§CPE_NOISE_LAW` change score get different walk seconds. Today they get identical ones — that is the RED. |
| G-WB-3 | bounded by the one dial: across any path, walk seconds/metre never varies by more than `PACE_SWING` (1.6x). No new knob appears in any log line. |
| G-WB-4 | a degree of turning costs the same in the walk as in the spin — the claim `effects.js:5150-5153` already makes in prose. |
| G-WB-5 | constant speed survives (§CINEMA_PATH_EDITOR_MODEL rule 9): with busyness held flat, time ratio still equals length ratio — the existing `witness_cinema_path_editor.js` G9 must stay green. |
| G-WB-6 | the total the editor DISPLAYS equals the total the bake runs — the §CPE_HOSE_LENGTH_BLIND invariant is not re-broken by re-costing the walk. |

## ⚠ §CPE_WALK_BUDGET_NOISE_BLIND — CORRECTION to Defect 1 above, read this BEFORE building
**"The walk budget has NO noise term at all" is WRONG and must not be built against.** Read after the
correction below; the measured table and Defect 2 stand unchanged.

`effects.js:5751` states the author's actual intent, in the comment on `_natSec` itself:
> *"the user's rule, **already applied to the walk in `out` below via `_walkTurnDeg`**"*

So the walk's budget DOES carry a term meant to be its noise term — the turn charge. **The real defect
is that it measures the WRONG QUANTITY.** `_walkTurnDeg()` sums the path's **direction change**; the
user's settled law (2026-07-27, `effects.js:5648`, *"100% rate of change"*) is the **rate of change of
CONTENT**. A corner in an empty yard is billed exactly the same as a corner inside a dense plantroom.

**And the content signal already exists, one beat away.** `effects.js:6272-6284` probes 33 points along
the walk, differences them into `nzC`, and normalises by `nzMax` into `noiseAt(e) ∈ [0,1]` — the same
shape as the dive's `_diveBusy`. But the cumulative cost it feeds is then normalised to 1
(`c[i] /= acc`), so **it redistributes frames and buys ZERO seconds**. Its own log line already claims
the behaviour the budget does not have: *"tempers the turn-driven crawl: a corner whose CONTENT is not
changing stays cheap."* It tempers the spacing. It does not temper the bill.

**Restated defect 1:** the walk's seconds are bought by GEOMETRY (degrees turned); the user's law
prices CONTENT (rate of change). The dive already does it right — `_diveEff / CINEMA_DIVE_MPS *
(1 + (PACE_SWING - 1) * _diveBusy)`. The walk must take the same shape.

**Target form (one law, same shape as the dive, no new dial):**
```js
out: (totalLen / CINEMA_WALK_MPS + _walkTurnDeg() / CINEMA_TURN_DPS)
       * (1 + (CINEMA_PACE_SWING - 1) * _walkBusy)
```
The `/3` disappears **because its job is now done honestly**: it existed to inflate the turn charge as
a stand-in for busyness, and busyness is now measured. This also settles Defect 2 — a degree costs
`CINEMA_TURN_DPS`, exactly as `effects.js:5150-5153` already claims in prose.

**⚠ SEQUENCING CONSTRAINT, found by reading — do not discover it in the debugger.** `_walkBusy` is
`mean(nzC) / nzMax`, derivable from the EXISTING series with no new probe and no new constant — but
that series is built inside `_etBuild` (~L6272), which runs **after** `_natSec` (L5748) needs it. The
mean must be hoisted, or computed early from the same primitives (`_densityAt`, `_noiseRadius`,
`_beat3Pose`). **Reuse them; do not write a second density probe** — §CPE_NOISE_LAW's own comment
records that a fixed-radius probe measured `maxChange=0` on both buildings and was inert.

**Gate G-WB-2 is the one that matters** and it is now precisely statable: two paths of EQUAL length and
EQUAL total turning, through areas of DIFFERENT content-change score, must get different walk seconds.
Today they get identical ones, because the only thing the budget can see is degrees.

# §CPE_PATH_NOT_PORTABLE — a saved path CANNOT leave the machine, and nothing says so (user, 2026-08-01)

**User, after saving Hospital's 'Ajaib' path and exporting the DB so it could be baked elsewhere:**
*"I saved under bim-ootb/buildings/HospitalAjaibPath.db"* → measured: **no `cinema_path` table in it**
→ *"if not extractable that means it is a faulty design on our part"*. **They are right.**

**MEASURED:** `~/bim-ootb/buildings/HospitalAjaibPath.db` (262 MB, saved 05:02) versus the original
`Hospital_extracted.db` — the export GAINED `kernel_ops`, `rooms_meta`, `storey_walkable_raster` and
**did not gain `cinema_path`**. The named plan exists only in IndexedDB.

## The chain, all three links verified by reading
1. `scene.js:663` `_writeCinemaPathTable(db)` writes the table **only if `A._cinemaPathEdit` is set** —
   in-memory, current-page-session state.
2. `cinema_path_editor.js:~993` — opening a named plan from IndexedDB sets `_state.staged = false` and
   **never calls `A.stageCinemaPath`**. After any reload, `A._cinemaPathEdit` is `null`.
3. The guard `if (!ov || !ov.bands || ov.bands.length < 2) return;` returns **SILENTLY** — no `§` line.

⇒ *Open a saved plan → Ctrl+S → a 260 MB file with no path in it and no warning.*

## Why this is a DESIGN fault, not a bug
Three places promise portability and the code delivers it only in the one case the user is least
likely to be in (authored and saved without ever reloading):
- §CINEMA_PATH_EDITOR_MODEL: *"stores the edit as a `cinema_path` table in the building DB exactly the
  way `staffage_instances` already round-trips."*
- `cinema_path_editor.js:906`: *"the building DB's `cinema_path` table = the PORTABLE format, still
  written on Save … so the plan travels with the file when it is saved to disk."*
- `§CINEMA_PATH_STAGE`'s own log line: *"STAGED ONLY; Ctrl+S (Save Building) writes the cinema_path
  table into the .db."*
The IDB store was added as the WORKING store beside the portable one (§CPE_IDB_PATH_STORE). In
practice it **replaced** it: every route that populates IDB leaves the DB path unwritten.

**Same species as §CPE_GHOST_GROUND's lesson, which this lane already paid for once:** a cross-module
feature whose early exits log nothing. It was written down; it happened again in a different file.

## The fix
1. **Opening a named plan RE-STAGES it** — `A.stageCinemaPath(ov)` in the IDB open handler, so
   `_cinemaPathEdit` reflects what is actually loaded. One line, and it makes Ctrl+S honour its own log.
2. **The guard must SPEAK.** `§CINEMA_PATH_WRITE skipped reason=no-staged-path` (or `bands=<n><2`), so
   a save that drops the path is visible instead of silent. **A silent early exit on the only route
   that makes a feature portable is the defect**, more than the missing call is.
3. Consider staging on load of the editor itself, so "authored" survives a reload — but rule 1 first;
   do not widen this into a session-persistence feature without asking.

### Witness claims — `witness_cpe_path_portable.js`
| gate | proves / disproves |
|---|---|
| G-PP-1 | **RED today.** Save a plan → reload → open it from IDB → write the DB → no `cinema_path` table. After the fix the table is present with the same band count. |
| G-PP-2 | round-trip fidelity: bands read back from `cinema_path` reproduce the same anchors/directions/lengths (IFC space) within float tolerance. |
| G-PP-3 | the skip is LOUD: with nothing staged, the save logs a named reason instead of returning silently. |
| G-PP-4 | `§CINEMA_PATH_RESTORE` on a fresh load of that written DB reports the path restored and `§CINEMA_BEATS route=authored` — end-to-end, not just table presence. |
| G-PP-5 | no regression: a save with no authored path still produces a valid DB and does not create an empty `cinema_path`. |

---

# §CPE_SPIN_WHIP — the spin turns 523°, is billed for 180°, and pays no noise ratio (user, 2026-08-01)
> *"Also reduce the spin whip in the end to be not more than 360 degrees, and to also apply the noise
> speed ratio."*

Open item #3 of the session-close list, now with the user's own two-part directive attached. It is the
**DIVE→SPIN seam** localised at session close: coming out of the dive the gaze opens **AWAY** from the
building bulk by 66° (t=0.150→35.8°, t=0.200→76.9°, t=0.250→101.9°, dive ends 0.170, spin ends 0.186),
and that is exactly where `§CINEMA_SPIN class=behind(full-lap) finalSpinDeg=-523` fires.

## The two defects, both read directly out of `viewer/effects.js` (not inferred)

**Defect 1 — the "long way around" is implemented as short-way-PLUS-a-whole-extra-lap.**
`effects.js:5090-5091`:
```js
} else if (dYawAbsDeg > CINEMA_BEHIND_DEG) {     // BEHIND_DEG = 120
  dYaw += (dYaw >= 0 ? 1 : -1) * 2 * Math.PI;    // |raw| + 360  →  480°..540°
}
```
For the behind class `|raw| ∈ (120°, 180°]`, so the executed sweep is `|raw| + 360 ∈ (480°, 540°]` —
the measured 523° and 534°. **The genuine long way around is the OPPOSITE direction, not one more
lap:** `360 − |raw| ∈ [180°, 240°)`. It ends on the identical bearing (`yaw0 + dYaw ≡ spinTo mod 2π`,
so `_handYaw`/`_handDir` — which go through `cos`/`sin` — are unchanged), it is still longer than the
short way for every angle in the class, so §CINEMA_SPIN_MOTIVATED's *"helps shows around the place"*
survives intact, and it satisfies the user's ceiling with 120° of margin. The ceiling is then a
**structural invariant, not a clamp**: no branch can produce > 360°.

**Defect 2 — the BUDGET is costed on a capped 180° and carries no noise term.** `effects.js:5785,5799`:
```js
var _spinDeg = Math.min(180, Math.abs(dYaw) * 180 / Math.PI);   // ← the cap IS the defect
spin: Math.max(CINEMA_SPIN_MIN_SEC, _spinDeg / CINEMA_TURN_DPS),
```
523° of motion bought 180°/45 = 4.0 s of film. That is the **fourth instance** of the
budget-on-one-number / motion-on-another family (§CPE_HOSE_LENGTH_BLIND, §CPE_WALK_BUDGET_NOISE_BLIND,
the dive's envelope cap, this). And it is the **only beat with no noise term left** — the dive
(`effects.js:5798`) and the walk (`:5804`) both carry `* (1 + (SWING−1)·busy)`; the spin does not,
in a law the user settled as *"it governs thrughout"*.

## The fix — two lines of law, one new probe
1. **Motion.** Behind case turns the other way: `dYaw -= sign(dYaw) · 2π` (magnitude `360 − |raw|`).
   Class name in the log becomes `behind(long-way)`; `full-lap` is retired because no lap is flown.
   A defensive `Math.abs(dYaw) <= 2π` assertion logs `capped=` if it ever trips — it cannot, by
   construction, and the log line says so.
2. **Budget = the angle actually flown.** `_spinDeg = |dYaw|·180/π`, no `Math.min(180, …)`. With
   defect 1 fixed this is ≤ 360, so removing the cap cannot produce the 12 s runaway the cap was
   presumably guarding against (523/45 = 11.6 s); the worst case is now 240/45 = 5.3 s.
3. **The noise ratio applies.** `spin: max(MIN_SEC, _spinDeg / TURN_DPS · (1 + (SWING−1)·spinBusy))`,
   the identical shape the dive and walk use — same `_densityAt`/`_noiseRadius` primitives, same
   `CINEMA_PACE_SWING` dial, **no new constant**.

**`spinBusy` — how a beat that travels ZERO metres gets a rate-of-change signal.** The camera does not
translate, so `_densityAt(settle)` is constant and the dive's line-probe shape cannot be reused as-is.
What DOES change is the neighbourhood the gaze sweeps THROUGH. So probe the ARC, exactly as the dive
probes its line: 32 points at `settle + r·(cos θ, sin θ)` for θ stepping from `yaw0` to `yaw0 + dYaw`,
count with `_densityAt(p, r)`, then the same normalised mean |central difference|. The radius comes
from the existing rule (`_noiseRadius(travel)` = half the beat's own travel, capped at the fan
horizon) applied to the spin's own travel — **the arc the gaze sweeps at the fan horizon**,
`|dYaw| · CINEMA_FAN_FAR`. Derived from the beat, not picked. A spin that sweeps across a dense wing
buys more seconds than one that sweeps across an empty yard, which is the whole point of the law.

## Witness claims — `witness_cpe_spin_whip.js` (must be RED on `origin/main`)
| gate | proves / disproves |
|---|---|
| G-SW-1 | **the ceiling.** Over ≥ 12 forced spin geometries per building (start yaw swept round the circle), `|finalSpinDeg| ≤ 360` on every one. **RED on main:** the behind class produces 480–540°. |
| G-SW-2 | **the turn is still MOTIVATED.** For every behind-class case the executed sweep is still LONGER than the short way (`|final| > |raw|`) — the fix must not silently degrade "turn around to it" into the short turn. |
| G-SW-3 | **the end bearing is unchanged.** `(yaw0 + finalSpin) − spinTo ≡ 0 (mod 360)` on every case, and `§CPE_SEAM_CONTINUOUS handoffYawDeg` is congruent to main's for the same geometry — the whip is removed without moving where Beat 3 starts. |
| G-SW-4 | **budget == motion.** `naturalSec.spin · CINEMA_TURN_DPS / busyMult == \|finalSpinDeg\|` within log precision. **RED on main:** it equals a flat 180 for every behind case, whatever the motion. |
| G-SW-5 | **the noise ratio is in force.** Two spins of the SAME angle at different content-change scores (same geometry translated bodily 3000 m into empty space — translation cannot change the angle) get DIFFERENT spin seconds, and the multiplier stays within `[1, CINEMA_PACE_SWING]` read from the log, not hardcoded. **RED on main:** no busy term exists, the two are identical. |
| G-SW-6 | **the seam.** Re-measure the reported signature on Hospital: gaze angle off the building bulk across t=0.150/0.200/0.250. Main opens AWAY by 66°; the fix must reduce that opening. Reported as a NUMBER either way — if it does not shrink, the seam has a second mechanism and §CPE_GAZE_CONSTANT_RATE inherits it. |
| G-SW-7 | no regression: `naturalTotal == Σ naturalSec.*` and replanning twice is byte-identical (the new density read introduces no nondeterminism) — the §CPE_HOSE_LENGTH_BLIND invariant. |

## ✅ BUILT + WITNESSED 2026-08-01 (late) — `fix/cinema-spin-whip`, **7/7 Hospital, 7/7 Duplex**
RED-first: the same file scored **3/7 on both** against `origin/main` (`RED_spin_whip.log`), with the
whip measured at **534.0 / 523.5 / 511.5 / 501.0 / 494.4°** across the swept headings and `spinSec`
pinned at a flat **4.00 s** (= the capped 180/45) for every behind-class case whatever the motion.

| gate | after |
|---|---|
| G-SW-1 ceiling | Hospital worst `\|final\|` **534.0 → 231.0°**, Duplex **494.4 → 225.6°**, over-360 count **0/16** on both |
| G-SW-2 still motivated | 5 behind cases Hospital / 1 Duplex, degraded-to-short **0** (e.g. raw 151.5 → 208.5, raw 174 → 186.0) |
| G-SW-3 end bearing | worst residual **0.000°** over 14 spinning cases — Beat 3 starts exactly where it did |
| G-SW-4 budget == motion | `flownDeg == \|finalSpinDeg\|` on all 16; mismatches **0**; e.g. flown 208.5° × busyMult 1.2614 → **5.844 s** (was a flat 4.00) |
| G-SW-5 noise ratio | Hospital **4.9989 s busy vs 4.0000 s** at 3000 m out (Duplex 4.4153 vs 4.0000); busyMult ∈ [1.0000, 1.3842] against `swing=1.6` **read from the log** |
| G-SW-6 | see below — the finding |
| G-SW-7 no regression | self-consistency **0.00e+0** over 16 plans; replan-twice diffs all **0.00e+0** |

**Regression sweep, all against the same rig:** `witness_cpe_noise_law` 0, `witness_cpe_walk_budget`
**6/6 both buildings**, `witness_cpe_hose_length` 5/5, `witness_cpe_gaze_spin` 0.
`witness_cinema_path_editor` (G10, G7) and `witness_cpe_even_turn` (T2, T6) fail — **identical
failure sets on `origin/main`, verified by running both against it**, so pre-existing and untouched
(T6 is the stall the user already ruled ACCEPTED). One real break was found and fixed: G-WB-4 parses
the spin's rate out of `§CINEMA_PACING`, whose *"spin raw 523deg capped 180deg @45deg/s"* clause this
change rewrote — the regex now reads the new phrasing and still accepts the old.

## 🔴 THE SESSION-CLOSE LOCALISATION IS **DISPROVEN** — the seam is NOT the whip
The header of this file states *"the user's 'turn starts too late' is the DIVE→SPIN SEAM, and it is
the SPIN WHIP"*, and told the next session to fix the whip and re-measure the seam. **Done, measured,
and the hypothesis is false.** G-SW-6 samples the gaze angle off the building bulk BEAT-RELATIVE
(25 points from dive-end to spin-end — a fixed `t=0.200` is unsound here, because this fix re-paces
the spin and moves `tD`/`tS`, so the same `t` lands in a different beat before and after):

| | spin motion | seam peak, gaze off bulk |
|---|---|---|
| Hospital | 534.0 → 231.0° (**2.31× less**) | 141.2 → 143.2° (**+2.0**) |
| Duplex | 494.4 → 225.6° (**2.19× less**) | 114.3 → 114.3° (**0.0**) |

**The spin magnitude more than halved and the swing-away did not move.** So the seam does not track
the spin at all. G-SW-6 was rewritten to assert that measured fact rather than the refuted prediction
— deliberately, and recorded in the witness itself, because a gate whose tolerance was widened until
+2.0 passed would have buried exactly this result.

**Where it actually lives:** Beat 1 holds the HEADING at `yaw0` for the whole dive *by design*
(`poseAt`, "HEADING **UNTOUCHED**" — load-bearing, since the exit is chosen at t=4 s by position AND
facing). The gaze angle off the bulk therefore grows across the dive purely because the camera
POSITION moves, with no turn at all. That is precisely the *"dive has its OWN drift, 0° → 23° off the
bulk over the first 15s"* item flagged **NOT DIAGNOSED** at session close. **§CPE_GAZE_CONSTANT_RATE
inherits the seam**, with this measurement as its starting evidence — and it should be built against
the DIVE's held heading, not against the spin.

---

# §CPE_STICK_HOLD + §CPE_AIM_LATCH — a hold buys the turn, density×depth aims it, the latch keeps it (user, 2026-08-01)
> *"Putting hold at 1 sec (put that as default for the last stick) will teach them 'ah, it slows a sec
> stop a sec, then ease out while the cam is turning to the building'."*
> *"while aimed already at a centre, and when the path continues, it should remain so"* … *"ie at
> perpendicular angle"* … *"the last spin is all a 'straight circle'"*

## What already exists — do NOT rebuild any of it (verified in code this session)
- **The aim target is already `density × depth`:** `_aimDepthSubject` (`effects.js:5563`) weights grid
  cells `w = c.n * d` (far-favouring), mirrored by `_aimSubject` (`:5315`) at `c.n / (1+d)³`
  (near-favouring). Both are POSITION-derived, so a stationary camera still has a subject.
- **The perpendicular aim is the DESIGN, not a defect** — §CPE_AIM_DENSITY's own directive is *"turns
  perpendicular towards the densest nearest part"*. `_aimDepthApply` strips the along-travel component
  (`px = vx − T.x·dot·k`, `k=1` beyond ~20° off travel, fading only where the subject is dead ahead and
  the perpendicular is degenerate). **A session briefly called this a defect needing rethink; the user
  corrected it. It is correct as built. Do not "fix" it.**
- **Turn budgets exist** in Beat 3: §CPE_SEAM_CONTINUOUS's `_openU`, §CPE_EVEN_TURN's cost
  parameterization, and `_walkTurnDeg`'s charge at `CINEMA_TURN_DPS`.

## The three real gaps
1. **No hold.** `cinema_path` has 13 columns and none is `hold_sec`; the panel row has x/z/y/len only.
   (`_hold()` in `cinema_path_editor.js:1142` is the SELECTION handler — a name collision, not dwell.)
2. **The aim does not persist.** `w = A0.w · wSeam · wOpen2` is re-derived every frame: `A0.w` decays
   with local density, so leaving the pocket drifts the gaze back to look-ahead; `wSeam` is forced to
   **zero across the final 25%** of the walk (`e3 > 1 − CINEMA_TURN_OVERLAP`). That taper IS the
   "forceful turn at the end" the aim rule was introduced to prevent.
3. **Nothing turns during a stop.** Not because the subject is missing (it isn't) but because there is
   no stop to turn during.

## The build
**§CPE_STICK_HOLD.** A `hold` seconds field per stick row, **default 0, and 1.0 on the LAST stick** so
the beat teaches itself on first open. Costed as AUTHORED time: `walkSec = out + Σhold`, added **AFTER**
the noise multiplier, never scaled by it (§CPE_HOSE_LENGTH_BLIND's family, fourth-instance rule).
Amends §CINEMA_PATH_EDITOR_MODEL rule 9 ("constant speed") explicitly — speed is constant *except* at
authored holds.

*Shape — a raised-cosine RATE DIP, not a flat freeze,* so velocity is continuous and there is no jerk
to pace away. Per hold `h`: plateau `P = h/2` at zero rate, cosine ramps `R = h/2` either side. Then
`∫dip = P + R = h` exactly — the hold costs precisely its authored seconds, with a genuine full stop
in the middle and a graceful slow-in/ease-out around it, which is the beat the user described. Total
window `1.5h`. Built as a table and inverted monotonically — the same idiom as `_diveRemap` /
`_evenTurnRemap`, no new constant.

**§CPE_AIM_LATCH.** Once the aim engages (weight crosses its floor, or a hold begins), **latch the
subject point and pin the weight at 1**; keep the perpendicular projection unchanged. Tracking a
latched world point from a moving camera is continuous by construction, so this does not reintroduce
the hard-switch jerk whose two measurements `_aimApply`'s comments already record. **Drop `wSeam`'s
outgoing taper:** on the orbit, perpendicular-to-travel IS radially inward — the user's *"the last spin
is all a straight circle"* — so the aim law and Beat 4 already agree and the taper was severing an
agreement, not preventing a conflict.

**Persistence.** `hold_sec` column on `cinema_path`; the loader must tolerate tables written without it
(portability was only fixed in #1122 — read the column list defensively, default 0).

## Witness claims — `witness_cpe_stick_hold.js` (must be RED on `origin/main`)
| gate | proves / disproves |
|---|---|
| G-SH-1 | the column exists end-to-end: a `hold` set in the panel survives save → reload → re-open. **RED:** no `hold_sec` column at all. |
| G-SH-2 | **the clock costs it.** `walkSec(hold=1) − walkSec(hold=0) == 1.0 s` exactly, and the difference is NOT scaled by the noise multiplier (same path, two busy regimes, same delta). **RED:** hold is free time. |
| G-SH-3 | **the camera actually stops.** Speed at the hold centre is ~0 while time advances, and `∫` of the removed travel time equals the authored seconds within tolerance. |
| G-SH-4 | **no jerk buying it.** Peak deg/frame and peak m/frame across the hold window stay inside the bounds §CPE_EVEN_TURN already gates — the raised-cosine dip must not trade a stall for a whip. |
| G-SH-5 | **the turn happens during the stop.** Gaze angle toward the latched subject closes measurably across the hold window (camera stationary, so this can only be rotation). **RED:** nothing turns. |
| G-SH-6 | **it remains so.** After the hold, as the path continues, the aim stays perpendicular-to-travel toward the SAME latched centre — subject identity unchanged and blend still 1 at the final walk frame. **RED:** `wSeam` forces it to 0 over the last 25%. |
| G-SH-7 | the last stick defaults to 1.0 s on a freshly derived path, and every other stick to 0. |
| G-SH-8 | no regression: `naturalTotal == Σ naturalSec.*`, replan deterministic, and a path with all holds 0 is byte-identical to today. |

## §CPE_GAZE_CONSTANT_RATE — BUILT 2026-08-01, and it exists because §CPE_AIM_LATCH exposed the need
**Not specced ahead of time; found by a gate.** Removing §CPE_AIM_LATCH's outgoing `wSeam` taper (the
user's *"the turning should be thruout, till the end of clip"*) made G-SH-4 measure a **29.01
deg/sample gaze whip at w=0.850 on Hospital**, against **2.62** there on `origin/main`. So the taper
had been **masking a fast swing INSIDE the walk** — not merely smoothing the Beat 4 hand-off, which is
all its own comment claimed. Re-tapering would have undone the user's directive, so the swing is
bounded at its cause.

**The law:** the COMPOSED gaze — look-ahead, seam blend, §CPE_AIM_DENSITY and §CPE_AIM_DEPTH together
— is sampled and rate-limited to **`CINEMA_TURN_DPS`**. Not a new constant and not a new opinion: it
is the rate the spin, the orbit lap and the walk's own turn charge are already priced at, finally
applied to the thing that actually rotates.

Three properties that make it safe, each for a stated reason:
- **Sampled in TIME, not in `e3`.** With §CPE_STICK_HOLD a hold stops travel while time runs, so a
  limit per unit of travel would be unbounded exactly where the camera is parked and turning — the
  one place the feature deliberately creates rotation.
- **Forward-only, so it LAGS rather than anticipates** — correct for a camera operator, and safe only
  because §CPE_AIM_LATCH already made Beat 4 open on Beat 3's real final gaze. `_beat3EndDir` reads
  the LIMITED series, never the raw pose; handing Beat 4 the raw direction would reintroduce the seam
  step this pair of rules exists to remove.
- **Applied in `poseAt`, not inside `_beat3Pose`** — so `_beat3Pose` stays the raw signal
  §CPE_EVEN_TURN's cost table samples, and that table keeps measuring turn DEMAND rather than the
  post-limit result.

**Measured:** Hospital walk peak **29.01 → 3.40 deg/sample** with the limiter in (and the residual
3.40 turned out to be the Beat2→3 boundary, not the walk — see the witness correction below).

### Two witness corrections this session, both MEASURED, both worth keeping written down
1. **G-SH-5's path had no turn in it.** The first cut used three COLLINEAR bands, so the look-ahead
   gaze had nothing to turn toward and the gate measured 0.02° of rotation across a genuinely parked
   camera — reading as *"the hold does not turn the camera"* when the truth was *"this path never
   asked it to."* A hold buys time for a turn; a test with no turn to make cannot show it. Now a
   dog-leg with the held stick on the corner.
2. **G-SH-4 measured a beat boundary, not the walk.** `walk[0]` sits exactly on `t = beats.spin`,
   which `poseAt` routes to **Beat 2** (`if (tNorm <= tS)`), so the first delta was the Beat2→3 seam.
   That seam is §CPE_SEAM_CONTINUOUS's gate, not this file's.
   **This is the eighth and ninth broken instrument in this lane** — `feedback_verify_checker_before_code_under_test`.

G-SH-4 now asserts the law ABSOLUTELY (`45 deg/s × sampling interval`) rather than comparing against
an `origin/main` baseline: a baseline compare accepts whatever main happened to do; this accepts only
what the law claims.

### ⚠ G-SH-5 passes, but read what it actually says — the hold buys DWELL, not (yet) TURN
`witness_cpe_stick_hold.js` is **8/8 Hospital, 8/8 Duplex**, RED-first at 3/8 and 2/8. G-SH-5 is the
one gate whose green needs reading rather than trusting:

```
camera parked=true (moved 4.6e-4m over 12 samples; at mean speed it would have covered 0.89m)
Gaze off the building bulk: 58.9deg -> 58.9deg across the stop (rotation 0.00deg)   [Hospital]
                            42.6deg -> 42.6deg                                       [Duplex]
```
The camera genuinely stops, and it does not drift away — but it rotates **0.00°** during the hold.
Two reasons, both structural and both fine:
1. The aim rules **saturate** (`maxBlend 1.00`, `active=65/65`) well before the stick, so the turn onto
   the building has already happened by the time the hold arrives.
2. The residual 40–60° off the bulk is the **perpendicular projection doing its job** — a broadside
   tracking shot points side-on, not at the centre. 0° off the bulk would mean the perpendicular rule
   had stopped working.

So `_holdBoostAt` (the time-indexed weight ramp) is built, wired, and correct, but **inert on paths
where the aim is already saturated** — it has nothing left to add. It will do work on a path whose
walk heads away from the mass. **Do not "fix" this by forcing rotation during a hold**; the honest
next step, if the user wants a visible turn at the stick, is a path/subject where the aim is not
already committed, or an explicit "look at X during this hold" author control — not a synthetic spin.

---

# ▶ LIVE REPORTS 2026-08-01 (late) — read before resuming; two are OPEN, one was a deploy gap
User tested LIVE (`github.io`, `§BUILD_VERSION v907`) and reported three things.

## 1. "i dont notice the hold time" — NOT A DEFECT, a DEPLOY GAP
`v907` is PR #1125 (§CPE_SPIN_WHIP) and nothing else. Their own log proves it:
`§EFFECTS_LOADED v17 (§CINEMA_LOOKAHEAD_ARC … §CPE_EVEN_TURN … §CPE_SEAM_CONTINUOUS)` — no
`§CPE_STICK_HOLD` and no `§CPE_GAZE_CONSTANT_RATE` line anywhere in 300+ lines. The hold/latch/rate
work is on **`feat/cpe-stick-hold`** (v909), unmerged. §CPE_SPIN_WHIP *is* live and working
(`§CPE_SPIN_WHIP flownDeg=0.0 ceilingDeg=360`, `§CINEMA_SPIN class=already-facing(no-spin) capped=false`).

## 2. 🔴 OPEN — "it is also spinning more than one full round in the end"
**NOT YET DIAGNOSED — do not assume the mechanism.** The reading so far, from code not measurement:
`_orbitPose` sets `az = exitAz + _cinemaAzU(u)·2π` — a hardcoded **FULL 2π lap** anchored at `exitAz`.
Beat 4 then translates `exitOuter → orbitStart`, and `orbitStart = _orbitPose(0)` sits at that SAME
`exitAz` (since `exitAz = atan2(exitOuter − pivot)`), so Beat 4 is radial, not azimuthal — meaning the
lap alone should be exactly 360°. So the extra rotation is more likely the **Beat 4 turn-to-face
(`turnW4`, up to 180° of gaze) landing ON TOP of a full 360° lap**, which reads as "more than one
round". **This is the §CPE_SPIN_WHIP family again** (a full lap ADDED to an existing angular
displacement instead of being the total) — the fifth instance if it holds.
**Measure first:** accumulate camera azimuth about `pivot` AND gaze yaw across `[tR, 1]`, and
separately across `[tO, tR]`, on a real path. If total apparent rotation > 360°, decide whether the
lap should be `360° − whatever Beat 4 already covered`, exactly as the spin's long-way fix did.

## 3. 🔴 OPEN — THE BLIND FAN IS REAL IN A LIVE BROWSER, not a headless-rig artifact
The §CPE_NOISE_LAW session recorded the blind fan as a *rig* finding ("on Terminal in the headless
rig"). **It is not rig-specific.** Live Chrome, Hospital, 63182 elements fully streamed:
```
§CINEMA_DIVE src=bbox-centre (no enclosed candidate among top 6)
  fanMin=60.0 fanMax=60.0 fanMean=60.0     ← every ray = the CINEMA_FAN_FAR sentinel: ZERO hits
  settle=(-7.3,-14.4,18.0) floorY=-16.09
§CINEMA_SPACE … enclosed=0%   on ALL SEVEN candidates (315.7m², 219.4m², 97.1m², …)
```
So §CINEMA_SPACE disqualifies every real room and the dive falls back to **bbox-centre** — the film
never dives into a space at all. **Likely cause, unverified:** the scene is BatchedMesh-dominated
(`§CONTRACT_CHECK batch=38172 instanced=25010 merged=0`) and `_cinemaFanMeshes()` almost certainly
does not collect `BatchedMesh`, so the raycast has nothing to hit. **Check that first** — it is one
grep, and if true it invalidates every fan-derived number on every large building, live and headless.

**Corroboration for §CPE_STICK_HOLD's G-SH-5 caveat, from the user's own live log:**
`§CPE_AIM_SERIES active=0/65 maxBlend=0.00` and `§CPE_AIM_DEPTH_SERIES active=65/65 maxBlend=1.00`.
The depth rule is **saturated everywhere** on a real building, exactly as the witness measured — which
is why a hold currently buys DWELL and not TURN. That caveat is confirmed live, not a rig artifact.

## 4. User directive, same session — the next lane
> *"noise speed ratio and auto cam head facing algorithm thruout"*

Both laws are to govern **the whole film**, not selected beats. Status against that bar:
- **Noise ratio:** dive ✅, walk ✅ (#1121), spin ✅ (§CPE_SPIN_WHIP). **Still missing: `rise` and
  `orbit`** — `_natSec.rise = _pullDist/CINEMA_PULLBACK_MPS` and `_natSec.orbit = 360/CINEMA_TURN_DPS`
  carry no `(1 + (SWING−1)·busy)` term. This was already named as open in the 2026-07-27 session
  ("Give `orbit`/`rise` the noise term the dive has") and is now re-asked directly. Finish it.
- **Auto cam head facing:** §CPE_AIM_LATCH + §CPE_GAZE_CONSTANT_RATE now govern **Beats 3 and 4**
  (built, unmerged). They do **NOT** govern **Beat 1 (dive — heading held at `yaw0` BY DESIGN)** or
  **Beat 5 (orbit — aims at `pivot` by its own geometry)**. "Thruout" means those two beats next;
  the dive is the one the user's original "turn starts too late" report actually landed in.

## ⚠ CORRECTIONS 2026-08-01 (latest) — one user correction, one of MY OWN hypotheses DISPROVEN

### A. §CPE_STICK_HOLD default was on the WRONG BAND — fixed
> *"u placed that 1 sec in the middle instead of the last ie exit. I corrected that."*

The first cut read *"last stick"* as the last **spawned** band (`length-2`, since the stop row is not
a spawned stick) and so put the 1 s in the **middle of the walk**. The user means the **EXIT** — the
last band, where the camera pauses before the pull-back. Now `i === bs.length - 1`.
G-SH-7's expectations move with it: 3 bands → `[0,0,1]`, 5 → `[0,0,0,0,1]`, 2 → `[0,1]`.

### B. 🔴 THE BLIND FAN — my "BatchedMesh" hypothesis is WRONG, do not chase it
The previous entry guessed `_cinemaFanMeshes()` does not collect `BatchedMesh`. **Read the code: it
already does.**
```js
return (o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible &&
       !o.isSprite && o.userData.staffageKind === undefined && !(A.sky && o === A.sky) &&
       !_isGhostGeometry(o);
```
`A.collectMeshes` is a plain `scene.traverse` + predicate, so nothing is lost there either.
**The live URL is the clue I missed the first time:**
`viewer.html?db=…Hospital_extracted.db**&ghost=1**`, and the log carries
`§SHELL_GHOST_AUTO meshCacheKeys=20609` + `§SHELL_GHOST_BBOX boxes=4316`.
**So the leading hypothesis is now `!_isGhostGeometry(o)` excluding the ENTIRE building** whenever the
viewer is opened in ghost mode — which is exactly how the user opens it. Every ray then returns the
`CINEMA_FAN_FAR` sentinel, every §CINEMA_SPACE candidate reads `enclosed=0%`, and the dive falls back
to bbox-centre. The remaining candidate cause, if that is not it, is `o.visible` being false under
`§DLOD_ENABLE … mode=per_slot_frustum` at plan time.
**Verify before fixing** (this hypothesis has already been wrong once): log
`§CINEMA_FAN_MESHES n=<count> ghost=<bool> dlod=<bool>` inside `_cinemaFanMeshes()`, open with and
without `&ghost=1`, and compare. If ghost is the cause, the fan must fall back to the ghost/shell
geometry rather than treating a ghosted building as empty space.

### C. 🔴 ORBIT OVER-ROTATION — mechanism narrowed, fix NOT obvious, do not guess it
> *"it is also spinning more than one full round in the end"*

Narrowed by reading, still unmeasured. **POSITION is not the problem:** `_orbitPose` sets
`az = exitAz + _cinemaAzU(u)·2π` — exactly one lap — and Beat 4 moves `exitOuter → orbitStart` which
sit at the SAME `exitAz`, so Beat 4 is radial, contributing no azimuth. **The excess is the GAZE:**
Beat 4 turns the gaze from `_beat3EndDir` onto the pivot bearing (`turnW4`, up to ~180°), and then
Beat 5's inward aim rotates a further full 360° across the lap. Apparent total = *Beat 4's turn + 360°*.
Same family as §CPE_SPIN_WHIP (a lap ADDED to an existing displacement rather than being the total) —
**the fifth instance.**
⚠ **The obvious fix is wrong.** Shortening the lap to `360° − beat4turn` would stop the orbit being a
full circle, and the user explicitly wants one: *"the last spin is all a 'straight circle'"*. The real
answer is that **Beat 4 should approach the orbit tangentially** so its turn is the FIRST PART of the
lap rather than extra rotation before it. Measure first: accumulate gaze yaw separately across
`[tO, tR]` and `[tR, 1]` on a real path, then decide.

## 🔴 OPEN, NEW 2026-08-01 (late) — "the roof before the walls still happening on the roof top"
**Different subsystem from everything above — this is 4D buildup sequencing, not the camera path.**
Reported live during a MaxQ buildup bake on Hospital (`§MAXQ_FRAME i=55/921`, cancelled at frame 55).

**Do NOT assume §4D_ROOF_LOAD_PATH (#1120) failed.** That fix promoted slabs to roof role by load
path and the earlier log shows it FIRING on this very building:
`§GANTT_OVERRIDE 10 slabs promoted to roof role (seq=8) by load path — base_z above the average
midheight of their XY-overlapping walls`. So 10 slabs *were* re-roled. The user still sees roof
before walls **on the roof top**, which means either (a) more than 10 slabs need promoting and the
`base_z > avg midheight of XY-overlapping walls` test misses the rest, or (b) the ordering defect is
not slab ROLE at all but the storey BAND — note `§GANTT_STOREY_Z reassigned=9457 no-storey elements
to nearest real storey by median Z`, which is a very large reassignment and could place rooftop walls
in a band ABOVE their own roof.

**Measure before touching either:** for the specific rooftop elements the user can see, dump
`storey / band / seq / class / base_z` for the roof slabs AND the walls under them, and check whether
the walls' `seq` really is later than the slab's, or whether they simply landed in a different band.
`§GANTT_OPS_FIRST20` already prints that shape — widen it to the rooftop band rather than inventing
a new probe. §SUPPORT_CHECK reported `floating=0/10979 … gated=63415 (0=solved)`, so the support
invariant believes it is satisfied — if the walls really are late, that check is ALSO wrong and is
the better place to start.

---

# ▶ SESSION CLOSE 2026-08-01 (final) — START HERE NEXT SESSION
**Live: viewer sw v911.** Read this block, then the §-sections it points at. Do NOT re-walk the file.

## SHIPPED AND LIVE (verified by fetching the served files back, not by trusting the merge)
| § | PR | what it fixed | witness |
|---|---|---|---|
| §CPE_SPIN_WHIP | #1125 | the spin flew 534°, was billed for 180°, paid no noise ratio | 7/7 + 7/7 |
| §CPE_STICK_HOLD + §CPE_AIM_LATCH + §CPE_GAZE_CONSTANT_RATE | #1126 | a hold buys the turn its time; the aim never weakens; the gaze is capped at `CINEMA_TURN_DPS` across Beats 3+4 (Duplex raw **339 → 45 deg/s**) | 8/8 + 8/8 |
| §CPE_STICK_HOLD default → exit band | #1127 | the 1 s was landing mid-walk, not on the exit | 8/8 + 8/8 |
| §4D_WALLS_BEFORE_ROOF | `fcc06a1` | the main roof deck started **277 days before its own walls** | 7/7 (RED 1/7 first) |

## ⚠ UNMERGED, and it is RED on purpose — `feat/cpe-hold-turn` (v912)
**§CPE_HOLD_TURN.** The hold shipped buying DWELL but no TURN, because the turn was made contingent on
the aim WEIGHT having headroom — and §CPE_AIM_DEPTH saturates at `maxBlend=1.00` on any real building.
User: *"the visible turn must happen independently … Otherwise why the pause?!"*
**The fix, derived not invented:** the aim rules point PERPENDICULAR TO TRAVEL, and the live log records
what that costs — `perpDeg=62.8` / `perpDeg=112.9`. **Perpendicular-to-travel is undefined when there is
no travel**, so the projection now fades with the camera's own speed (`_holdDipAt`, the same dip that
removes the travel seconds — the signal itself, not a proxy).
**Measured: Duplex 0.00 → 22.99° of turn, gaze closing 24.4° → 1.6° off the building. Hospital 0.15°, RED.**
Named cause for Hospital, not guessed: `k = smoothstep(perpMag/0.35)` already fades the projection where
the subject is near the travel axis, so at that stop there is no perpendicular component left to release.
**The open design question — do NOT answer it by lowering the gate:** when the subject is already dead
ahead at a hold, what should the camera turn onto? (bulk instead of the density×depth subject? or is
dwell-only correct there?) ⚠ **Rebase to v913 before landing — the 4D merge took v911.**

## 🔴 OPEN, each with its measurement named
1. **Orbit over-rotation** (user: *"spinning more than one full round in the end"*). Position is fine —
   the lap is exactly `exitAz + _cinemaAzU(u)·2π` and Beat 4 is radial. The excess is the GAZE: Beat 4
   turns onto the pivot bearing (~180°) and Beat 5 then adds a full 360°. Fifth §CPE_SPIN_WHIP-family
   instance. ⚠ Shortening the lap breaks the user's *"the last spin is all a 'straight circle'"* — the
   answer is Beat 4 approaching **tangentially**. Measure gaze yaw across `[tO,tR]` and `[tR,1]` first.
2. **The blind fan.** `fanMin=fanMax=fanMean=60.0` (all sentinel), all 7 §CINEMA_SPACE candidates
   `enclosed=0%`, dive falls back to bbox-centre — **in live Chrome, not the headless rig**. ⚠ My
   "BatchedMesh" hypothesis is **DISPROVEN**, `_cinemaFanMeshes` already collects it. The lead is
   `&ghost=1` (the user's own URL) making `!_isGhostGeometry(o)` exclude the whole building. **Verify
   with a `§CINEMA_FAN_MESHES n= ghost= dlod=` line before fixing — this has been wrong once.**
3. **Noise ratio still missing on `rise` and `orbit`** — every other beat has it. Open since 2026-07-27,
   re-asked directly: *"noise speed ratio and auto cam head facing algorithm thruout"*.
4. **Facing absent in Beat 1 (dive, heading held at `yaw0` BY DESIGN) and Beat 5 (orbit, aims at pivot)**.
   "Thruout" is not yet true. The dive is where the original *"turn starts too late"* actually landed.

## ⚖ TWO DESIGN RULINGS FROM THE USER THIS SESSION — build against these, do not re-litigate
**A. Sequencing: "nothing appears without support" + "build floor by floor".** These are ONE idea —
floor-by-floor is the **cycle-free approximation** of the support DAG, because gravity makes the band
index a topological order. Agreed shape: **band-monotonic WITHIN a phase, with a lag between phases**
(a global floor gate would serialize the project and destroy the trade train — the bands already carry
`Superstructure:119, MEP Rough-in:4272, Architecture:1203, …` simultaneously). Keep **"nothing without
support" as the role-blind GATE** policing what banding cannot see (roof-on-its-own-walls, cantilevers,
the uncoped parapet §4D_WALLS_BEFORE_ROOF left open). ⚠ Audit `§GANTT_STOREY_Z reassigned=9457` FIRST —
a beam at an interface can band either way by median Z, and a band rule enforces a wrong order
confidently. User's live repro: *"beams on upper floors going further without waiting for slabs on lower
floors"* — beams and slabs are both `Superstructure`, so it needs **no role inference at all** and is the
better witness subject than the roof case.
**B. The ending's framing must not be the opening's.** User set a near-full-frame opening and the ending
matched it. **They are NOT coupled** — `fillDistance = (boundingRadius / looseTan) · CINEMA_FILL_MARGIN`
reads the building and the FOV, never the opening pose; they coincide because "fill the frame" is what
the user chose for the opening too. **So pulling the opening back will NOT give the ending room — tell
the user before they spend a bake on it.** The opening is a CONTINUITY anchor (§CINEMA_POV), the ending
is a FRAMING decision; one control must not serve both. ⚠ Check the clamp first:
`§CINEMA_ORBIT_ELASTIC requested=103.8 granted=132.7 clamped=true` — the ending control may already
exist and simply not be honoured (session-close open item #4). A bookend mode is worth having as an
OPT-IN, and ties into open item 1 above since both live on the orbit.

## ⚠ INSTRUMENTS BROKEN THIS SESSION — the count is now ELEVEN in this lane
- G-SH-5 used three **collinear** bands (no turn to make) → read as "the hold does not turn the camera".
- G-SH-4's first sample sat on `t=beats.spin`, which `poseAt` routes to **Beat 2** → gated the wrong seam.
- G-SH-5 again: passed on *"already aimed"*, which is what let a **0.00° hold ship to the user**.
- `§SUPPORT_CHECK floating=0/10979` — `auditFloating` only offers its wall pool to `seq>4` slabs, so a
  roof it FAILED to promote read clean. **This is why the 277-day defect survived a merge.**
`feedback_verify_checker_before_code_under_test` is not a formality in this lane; it is the main failure mode.

## 🔴 OPEN, NEW — "some jerks at each stick change … must be a smooth handler thruout" (user, live mp4)
Reported from the baked film, at **every band-to-band join** — not at one stick, at each of them.

**Do NOT start by widening a smoothing constant.** Three candidates, and the existing logs already
narrow them:
1. **The join geometry itself.** `§CINEMA_BANDS bands=3 waypoints=6 flown=84 connectors=2 k=[0.55,0.55]
   maxBow=0.55m unmeasuredJoins=2/2`. **`unmeasuredJoins=2/2` is the tell** — the fan measured NOTHING
   at either join (same blind-fan family as open item 2), so the connector radius fell back to the
   conservative cap instead of the real clearance. A join built on a guessed radius is where a
   position kink would live.
2. **The pace, not the path.** §CPE_EVEN_TURN parameterizes the walk by blended cost, and a band change
   steps `dθ/ds` discontinuously — cost-rate discontinuity ⇒ speed step ⇒ read as a jerk even on a
   geometrically smooth curve. `§CPE_EVEN_TURN … boundPerFrameTurn=1045.9deg/N speedRange=1.60x x1.5`.
3. **§CPE_HOLD_TURN interaction** (only on the unmerged branch): the projection fade is driven by the
   dip, so a hold AT a join composes a gaze swing with a join — check whether jerks coincide with the
   held band or appear on all of them.

**Measure first, and measure the RIGHT quantity:** sample `poseAt` densely across the walk and report
**per-frame position step AND per-frame gaze degrees**, then locate the peaks against the band-join
fractions. If the peak is in POSITION → candidate 1. If in GAZE only → candidate 2 (and
§CPE_GAZE_CONSTANT_RATE already caps gaze at 45 deg/s, so a gaze jerk would mean the limiter is not
covering that seam). `witness_cpe_even_turn`'s T2/T5 already compute both — extend it to report the
band-join fractions rather than writing a new probe.

⚠ **The user's words are "smooth handler THRUOUT"** — same standing directive as the noise ratio and the
facing law. Whatever is built must cover every seam (band joins, Beat2→3, Beat3→4, Beat4→5), not the
one that was reported.

## 🔴 OPEN, NEW — "the building up is getting faster in the starting.. and not enough in the mid"
Reported on the same baked film, immediately after §4D_WALLS_BEFORE_ROOF landed. **That timing is the
first thing to check, and it is NOT a coincidence to dismiss:** that change re-roled a 2091 m² deck
from `Superstructure` to `Architecture` and moved it **+450 days**, and it added geometric wall-carrier
dependencies. Both alter how many elements fall in each slice of the timeline — which is exactly what
§CPE_BUILDUP_WORK_PACED paces the film by.

**The suspect, and it is measurable in one query.** §CPE_BUILDUP_WORK_PACED advances the film by
ELEMENTS PLACED, not calendar days ("10% of the film is 10% of the building"). That is only even
pacing if the work CURVE is even. Re-sequencing bulk work later leaves a front-loaded curve: many
cheap elements early, a starved middle. So the reported symptom is what a *correct* work-paced film
looks like over a *newly lumpy* schedule — the defect may be in the SCHEDULE, not the pacing.

**Measure before touching either:** bin `kernel_ops` placement timestamps into 20 equal slices of the
project span and print elements-per-slice, on `origin/main` and on the merged 4D fix. If the curve got
more front-loaded, the fix is in the sequencing (or in a deliberate re-balance), NOT in the film. If
the curve is unchanged, then §CPE_BUILDUP_WORK_PACED's cursor is at fault and the pacing is the bug.
`§GANTT_SOURCE captured tasks=6 covered=63415` and `§4D_COVERAGE … pct=100 window=2026-01-01..2026-06-30`
already print the shape — extend, do not invent.

⚠ Only **6 leaf tasks / 6 phases** cover 63,415 elements (`§AUTHOR_MATERIALIZE … phases=6 leafTasks=6
assignments=63415`). With that few buckets, one phase moving re-shapes a large fraction of the curve at
once — a strong prior for the schedule being the cause rather than the film.

### ⚠ AND CHECK THE 4D GENERATE PATH ITSELF (user, 2026-08-01: *"i think the recent change in the 4D generate"*)
The user suspects the **4D generate/apply flow**, not only §4D_WALLS_BEFORE_ROOF. Treat these as ONE
suspect set — they all rewrite the same op stream the film is paced by:
- `§AUTHOR_UI_DRAFT` → `§AUTHOR_MATERIALIZE schedule=SCH_AUTHORED mode=dated phases=6 leafTasks=6
  assignments=63415` → `§AUTHOR_UI_APPLY` → `§TM_REFOLD wasActive=true clearedPlaceOps=63415`.
  A regenerate CLEARS and re-injects all 63,415 place ops, so any change in how they are dated or
  distributed re-shapes the buildup curve wholesale.
- `§AUTHOR_UI_DATES start=2026-01-01 span=180d phases=6` — the film's whole span comes from here.
- **`_GANTT_CACHE_VERSION` was bumped 5→6 by §4D_WALLS_BEFORE_ROOF**, and #1123 exists precisely because
  a stale cache once stopped a sequencing fix reaching a browser. So a user can be running a MIX: new
  code, cached old ops (`§GANTT_CACHE_HIT ops=63417` vs `§GANTT_CACHE_SAVE ops=63418` appear in the same
  session log). **Confirm which op set produced the reported film before drawing any conclusion from it.**

**Cheapest discriminator, do this FIRST:** compare the 20-slice element histogram for (a) cached ops,
(b) a forced regenerate on `origin/main`, (c) a forced regenerate on the merged fix. If (a) differs from
(c), the user was watching a stale-cache film and there may be no pacing defect at all.

---

# ▶ SESSION 2026-08-02 — the FAST-PATH bake, analysed from its log tail
**Bake recipe (user, verbatim):** *"without adding any sticks. Just T to 4Dgenerate applied, then alt-C,
set opening canvas position, then just record."* Hospital, URL carries **`&ghost=1`**.
**Evidence:** the user's console tail, frames ~790→820 only. Head of log NOT yet supplied — see §NEED below.

## §BAKE_FAST_PATH_COST — where the 21.6 minutes went (measured, not estimated)
`§MAXQ_DONE frames=820 bytes=35795585`, `§MAXQ_MP4 … 54.7s of footage`, final
`§MAXQ_FRAME i=819/820 elapsedMs=1297897`.

| quantity | value | source |
|---|---|---|
| wall clock | **1,297,897 ms = 21.6 min** for **54.7 s** of film | `§MAXQ_FRAME` final |
| lifetime mean | **1,583 ms/frame** (1297897/820) | derived |
| tail rate | **2,184 ms/frame** (frames 794→819) | `perFrameMs=2159…2204` |
| still refine | ~**850 ms**/frame, `samples=16` | `§STILL_REFINE done elapsedMs=843…918` |
| photo AO | ~**670 ms**/frame, `frames=24`, `avgRenderMs≈25.7` | `§PHOTO_AO done` |
| **unaccounted (staging churn)** | **~660 ms/frame ≈ 9 min of the 21.6** | 2184 − 850 − 670 |
| mp4 encode | **16,309 ms total (1.3%)** | `§MAXQ_MP4 encoded … ms=16309` |

**The bake gets ~38% SLOWER as it runs** (1,583 mean vs 2,184 at the tail) — scene weight rises with the
buildup, so the film's last third is where the time is. Encoding is NOT the bottleneck; staging is.

**⚠ Do NOT read `§STILL_REFINE cancelled … elapsedMs=1800` as 1.8 s of wasted work.** That `elapsedMs`
is cumulative-since-refine-START (850 refine + 670 AO + teardown), and the refine had already logged
`done` at 845 ms. It is a bookkeeping cancel at frame end, not a discarded pass. (Recorded because the
number is 1.8 s and sits next to a real 660 ms of overhead — easy to double-count.)

**The churn itself, per frame:** `PHOTO_STAGING on → NIGHT_MODE on → GLOW_SPRITE staged 1272 →
GROUND_MAP paved → PHOTO_SHADOW enabled casters=4054 → refine → AO →` then the entire teardown
(`AO off, GLOW_SPRITE removed 1272, NIGHT_MODE off, PHOTO_SHADOW disabled, GROUND_MAP cleared,
GROUND_ALBEDO restored, PHOTO_STAGING off`) and immediately re-staged for the next frame. `cinema_maxq.js`
~L96 already documents this as deliberate ("staging … runs per frame INSIDE the capture loop … and off
again after each frame").
**It is justified in principle** — the buildup changes which meshes exist, so sprites/casters must be
rebuilt — **but at the tail it is provably a no-op**: `1272 → 1272` sprites and `casters=4054` identical
every frame. A dirty-check (restage only when the placed-set changed) reclaims the 660 ms where nothing
moved. Quality is not the constraint: `§MAXQ_QUALITY frames=820 unconverged=0` — every frame converged,
so `samples=16`/`AO frames=24` have headroom too, but those are the user's quality call, the churn is not.

## §4D_UPPER_FLOORS_WALLED_FIRST — user, 2026-08-02: *"upper floors gets walled first.. as seen on last stretch"* + *"the floor slabs coming on too fast"*
**Both symptoms are ONE mechanism, and it is a KNOWN, DELIBERATE trade — not a regression.**

`viewer/time_machine.js` L3454-3460 records it in its own words: the **support gate REPLACED the band
gate** on 2026-05-30 — *"REPLACES the old center-Z band gate ('band N waits N-1') that floated beams over
still-building tall columns"*. That swap fixed floating (**1127/1970 → 0/1970**) and, in exchange, **gave
up floor-by-floor progression entirely.** Nothing in the current model orders one storey against another
for non-structure.

**Why walls go top-down-ish** (`viewer/schedule_gate.js` L128-140, PASS B):
```js
var nonst = elements.filter(e => e.seq > 4)
  .sort((a,b) => (a.seq - b.seq) || (a.base_z - b.base_z));   // trade FIRST, height second
…
var ph = collapsePhase(el.storey);                            // per-STOREY trade gate
for (s in pt) if (+s < el.seq && pt[s] > tg) tg = pt[s];
```
A wall (`seq 6`) is gated by exactly two things: (1) `geoGate` — overlapping **structure strictly below**
it; (2) `phaseTrade[ph][seq]` — earlier trades **on its own collapsed storey**. There is **no cross-storey
term**. So Level 3's walls need only Level 3's structure + Level 3's earlier trades; if Level 2 carries a
slow earlier trade, **Level 3 is walled first and the model considers that correct.** Exactly what the
user saw.

**Why slabs burst:** slabs are `seq ≤ 4` → PASS A, sorted `(base_z, seq)`, gated only by overlapping
structure strictly below, then crew-capped project-wide. A whole floor plate's slabs become eligible the
instant the columns/beams under them top out, so they arrive **plate-at-a-time**. The rate ratio against
walls is real and readable from `rates.js?v=7` (confirmed loaded, `viewer.html:861` — this is NOT the
`rates.js` JSON landmine): **CONCRETE_GANG `max_crews:3`** vs **MASON `max_crews:2`** (ROOFER 1,
STEEL_ERECTOR 3). Slabs get 50% more crews AND sit in the unblocked pass; walls trickle behind two gates.
⇒ *"slabs too fast"* and *"upper floors walled first"* are the same asymmetry seen from two ends.

**This is Design Ruling A, already settled 2026-08-01 — the fix is specified, just not built:**
*band-monotonic WITHIN a phase, with a lag between phases*, keeping "nothing without support" as the
role-blind gate. The user has now reported the predicted symptom on **WALLS (Architecture)** as well as
the beams/slabs case. **Do NOT re-litigate the ruling; implement it.** ⚠ Audit
`§GANTT_STOREY_Z reassigned=9457` FIRST — PASS B's trade gate is keyed on `collapsePhase(el.storey)`, a
**storey NAME**, so 9,457 elements reassigned by median Z are grouped by that reassignment. A band rule
laid on top of a wrong grouping enforces a wrong order confidently.

## §CPE_ROOM_TITLE_TIMING — user, 2026-08-02: *"look into the rooms labelling timing"*
Read from `viewer/cpe_room_title.js` @ `origin/main`. Constants: `SAMPLE_DT 0.15s`, `MIN_DWELL 1.4s`,
`FADE 0.4s`, `MIN_HOLD 3.0s`, `LEAD 2.0s`. Four findings, ranked:

1. **TWO independent strobe-limiters, and the first one silently loses rooms.** `MIN_DWELL=1.4s`
   pre-filters segments (L245, `suppressed++`) *before* the lead/hold arbitration ever runs. But the
   arbitration's own spacing rule — `if (show < lastShow + MIN_HOLD) skip` (L317) — **already** guarantees
   captions are ≥3 s apart, which is the anti-strobe property `MIN_DWELL`'s comment claims to provide
   ("six small rooms in four seconds must not strobe six titles"). `MIN_DWELL` is now **redundant AND
   lossy**: a room genuinely crossed in 1.2 s is discarded even though LEAD+HOLD would have given it a
   perfectly readable 3 s caption opening 2 s before the doorway. **Highest-value single change.**
2. **The film's first caption gets ZERO lead.** L316:
   `if (!sel.length && diveEndSec > 0) show = Math.max(show, Math.min(s.tStart, diveEndSec));`
   When `diveEndSec >= s.tStart` this collapses to `show = s.tStart` — the caption lands **exactly on the
   doorway**, not 2 s ahead. The clamp exists so caption #1 isn't thrown over the dive (correct intent),
   but it converts the lead-in to an on-the-nose label for the one caption the viewer meets first. The
   in-code comment even names this failure ("the exact failure the lead exists to kill") while the
   arithmetic reintroduces it for `sel.length === 0`.
3. **A skipped caption is dropped, never re-slotted.** `lastShow` is the previous caption's SHOW time, not
   its END. If A opens at t=10 and its room ends at 11.5, a B entered at 12.5 (`show=10.5`) fails
   `10.5 < 13` and is **dropped**, even though the screen is free from 11.5. The user's own rule was
   *"if misses, then skips"*, so this is defensible — but on a dense walk it is the main caption-loss
   term, and `skipped=` in `§CPE_ROOM_TITLE_TIMELINE` is the number that says how much.
4. **No hysteresis on the sample run.** Segments are contiguous same-`guid` samples at 0.15 s. One stray
   sample (a gaze flicking through a wall) splits a single 2 s dwell into two ~1 s fragments and
   **both** die to `MIN_DWELL` — the room vanishes entirely. Merging same-`guid` segments separated by a
   1-sample gap costs nothing and removes a whole class of missing captions.

⚠ **This bake may not have had captions on at all** — `_roomTitle = !!_ov.roomTitle` (`cinema_maxq.js`
L840) and the editor checkbox is **off by default** (`cinema_path_editor.js` L1609). The recipe the user
described does not tick it. The head-of-log `§CPE_ROOM_TITLE_TIMELINE`/`_DIVE` lines settle it.

## §CPE_DAY_COUNTER — user, 2026-08-02: *"a Day # counter should be at a corner, to indicate progress"*
**Position: TOP RIGHT** (user, 2026-08-02: *"Suggesting top right"*) — and it does not collide with
§CPE_ROOM_TITLE, which is a documentary lower-third. Two overlays, two corners, no arbitration needed.
**Spec (follow the §CPE_ROOM_TITLE precedent exactly, do not invent a new overlay path).**
- **Composite into the 2D canvas, never the DOM.** `cinema_maxq.js` L446-448 already states why: the
  title is drawn onto the 2D frame so it reaches *"the actual exported bytes (a DOM caption never
  would)"*. A DOM day-counter would be invisible in the mp4 — the same trap, already documented.
- **The value is already computed** — no new derivation. The per-frame cursor is `_bkMs =
  _workCursorAt(_bkT, _bkState)` (`cinema_maxq.js` L1000) and the epoch is the schedule's `baseMs`.
  `Day # = floor((_bkMs − projectStart)/86400000) + 1`. **EXTRACT, do not re-date.**
- **It is also the honest instrument for the pacing complaint.** Burning the day number into the frame
  makes *"faster at the start, not enough in the mid"* a number the user can read off the film instead of
  a feeling — and it satisfies the FUNDAMENTAL LAW (maths, not eyeballing) for a symptom that has so far
  only ever been reported visually. **Build this before re-baking for pacing.**
- Log line: `§CPE_DAY_COUNTER frame= day= of= cursor=` so the on-screen value is checkable against
  `§CPE_BUILDUP` without watching the film.

## §NEED — the ONE thing that unblocks the pacing verdict (no re-bake required)
`§CPE_BUILDUP` is logged at `i === 0 || i === nFrames-1 || i % 60 === 0` (`cinema_maxq.js` L1004).
For an 820-frame bake that is **~14 checkpoints already printed in the SAME log the user pasted** — each
carrying `t=` and `placed=N/63419`. **That IS the buildup histogram, at 1/60-frame resolution, for free.**
Even pacing ⇒ `placed` rises ~4,645 per checkpoint. Front-loaded ⇒ the early deltas are larger.
**Ask for the HEAD of that same console log, nothing else.** It also carries the four other missing
answers: `§GANTT_CACHE_HIT` vs `§GANTT_CACHE_SAVE` (which op set produced this film — the stale-cache
discriminator), `§CPE_BUILDUP_PACING mode=work|calendar`, `§CPE_ROOM_TITLE_TIMELINE`, and
`§CINEMA_BANDS`/`§CINEMA_SPACE`/fan lines.

**Two facts the tail already settles:**
- **`placed=63419/63419`** — this bake's op count. Prior sessions logged 63415 / 63417 / 63418. The count
  drifts per regenerate; quote it when comparing histograms or the arms won't be comparable.
- **`&ghost=1` is confirmed present in the user's real bake URL**, and `§GHOST_GROUND restored opacity=1`
  fired. That is the standing lead for the blind fan (open item 2) observed live, not assumed. Still needs
  the `§CINEMA_FAN_MESHES n= ghost= dlod=` line before any fix — this has been wrong once.
- **Sticks: none.** `connectors=0`, so this bake **cannot** reproduce the jerk-at-stick-join item
  (`unmeasuredJoins=2/2`). That item needs a stick-bearing bake; do not grade it from this film.

## §CPE_HOLD_TURN — REAFFIRMED BY THE USER ON THE LIVE BUILD, 2026-08-02
User, on this bake: *"cam face turning is working but at that last secound hold, it stops turning is the
issue i raised before.. cam facing should be independent"*.

**This is a confirmation, not a new defect — and it is the strongest possible one.** This bake ran
**`origin/main` = v911, where §CPE_HOLD_TURN is NOT merged**. The shipped behaviour there is exactly
"a hold buys DWELL but no TURN", so the user is watching the precise failure `feat/cpe-hold-turn` (v912,
worktree `/tmp/wt-spin`) already exists to fix. **Stop treating v912 as speculative — it has a live repro
from the user, twice, in their own words.**

**The user has now also answered the open design question, and the answer is a principle, not a case
split.** The session close left it open as *"when the subject is already dead ahead at a hold, what
should the camera turn onto?"* — the user's reply is **"cam facing should be independent"**.

⚠ **Read the consequence before building:** v912 currently fades the turn with
`k = smoothstep(perpMag/0.35)`, i.e. the turn is *derived from the subject's perpendicular offset*. That
is the very coupling the ruling rejects, and it is the named cause of the **Hospital 0.15° RED**. If the
facing is independent, the turn at a hold must **not** be gated on `perpMag` at all — which means the
Hospital RED is expected to go GREEN by removing the coupling, **not** by lowering the gate (the
session-close prohibition still stands, and this satisfies it: the gate is unchanged, the derivation is).
Re-measure Duplex (currently 0.00 → 22.99°) after decoupling; it must not regress.

**Also note the standing "thruout" law applies here too** — same directive as the noise ratio and the
facing law. An independent facing must hold at EVERY seam (band joins, Beat2→3, 3→4, 4→5, and the orbit),
not only at the last-second hold the user happened to name. ⚠ **Rebase to v913 before landing — the 4D
merge took v911.**

## ✅ BUILT 2026-08-02 — branch `feat/cpe-0802-batch` (off `fcc06a1`, pushed, sw v913)
| § | what | witness |
|---|---|---|
| §CPE_DAY_COUNTER | Day N / total, TOP RIGHT, composited into the exported bytes | `witness_cpe_day_counter.js` **11/11** |
| §CPE_GHOST_PULL | a hose pull now has a ROW (+ an `x`) — the "working but ghost stick" | `witness_cpe_click_slop.js` **6/6** (G-CS-5/6 new) |
| §CPE_ROOM_TITLE_DWELL_FLOOR + _HYSTERESIS | 1.4s→0.45s floor, one-sample dropout bridged | `..._lead` **10/10**, `..._hold` **8/8** |

**§CPE_GHOST_PULL — the diagnosis, since it was NOT what it looked like.** Not a race:
`_spawnStick` is synchronous and calls `_renderRows` before returning, so no click can be lost in a
window. §CPE_STICK splits one grab by what the hand does — release inside `CLICK_SLOP_PX` = STICK,
move first = HOSE PULL. Press-and-drag is a PULL *by design*. The defect was downstream: `_renderRows`
iterated `_state.bands` only, and pulls live in `_state.hose`, so a pull bent the path for real and
had **no representation in the panel** — unseeable, unselectable, unremovable, and past Ctrl+Z's reach
once buried. Same family as §CPE_CLICK_SLOP (which fixed the ACCIDENTAL case); this fixes the
DELIBERATE one. `#cpe-rows` is now a MIXED list — every row carries `data-cpe-row="band"|"pull"`,
because the existing witness counted bare children and would otherwise have gone red for no product
reason.

**⚠ RETRACTED — this block previously claimed the dive clamp was measured destroying the first
caption's lead. It was an instrument fault, mine.** The `firstLead=` line printed
"TRUNCATED by the dive clamp" for ANY short first lead, but `show = Math.max(0, tStart - LEAD)`
clamps at the FILM START too. Corrected instrument, same Duplex film:
`firstLead=0.00s/2s(filmStart)` — **the dive clamp does not bite here at all.**
The instrument now names its cause (`full` / `filmStart` / `diveClamp` / `other`).
⇒ **The design question is NOT live.** Do not spend a user decision on "on-the-nose vs skip" until a
real film actually reports `(diveClamp)`. Also tried and REVERTED: giving the first caption its full
lead when `tStart <= diveEndSec` (reasoning: entering mid-dive means the room IS the dive target, so
the name is over its own subject, not empty sky). It turned **G-TL-2** red, and G-TL-2 encodes the
USER'S OWN RULING. A witness encoding a user ruling is not a gate to lower on a hunch — doubly so
once the motivating evidence had evaporated. Documented in the code so it is not retried.
**The twelfth broken instrument in this lane.** `feedback_verify_checker_before_code_under_test`
applies to instruments you add THIS session, not only inherited ones.

**§BAKE_FAST_PATH_COST — second data point, from the 1670-frame bake of 2026-08-02.** The staging
overhead is **near-CONSTANT, not proportional to scene weight**, which is the signature of a fixed
teardown/restage and makes the dirty-check the single biggest win available:
| | frame ~800/820 (full building) | frame ~110/1670 (nearly empty) |
|---|---|---|
| `avgRenderMs` | 25.7 | 4.0 |
| refine + AO | 850 + 670 = 1520 ms | 370 + 280 = 650 ms |
| `perFrameMs` | 2184 | 1200 |
| **overhead** | ~660 ms | **~550 ms (46% of the frame)** |
⚠ **Correction to this file's earlier reading:** `cand=0` in `§PERF_TRAVERSE` is NOT "nothing placed".
`§GROUP_SPARK_TICK … recent=27..128` is the placement signal and it is healthy. Do not build a
pacing argument on `cand`.

⚠ **Witness PORT trap, cost 300s of dead run:** `witness_cpe_click_slop.js` defaults to **8433**,
the `witness_cpe_room_title_*` family to **8443**. A run against the wrong port hangs on
`waitForFunction` and reads as a product failure. Serve the worktree and pass `PORT=` explicitly.

## 🔴 STILL OPEN after 2026-08-02 — in priority order
1. **§4D generate band-monotonic (Design Ruling A)** — the user's own top ask (*"4D generate need to
   really studied"*). Diagnosis is DONE and written above (§4D_UPPER_FLOORS_WALLED_FIRST): PASS B has
   no cross-storey term, so walls are free to run top-down. Not yet implemented. Audit
   `§GANTT_STOREY_Z reassigned=9457` FIRST — the trade gate keys on a storey NAME.
2. **Staging dirty-check** — restage only when the placed-set changed; ~46% of a light frame.
3. **§CPE_HOLD_TURN decouple + rebase v912 → v913** — the user reaffirmed it live on 2026-08-02.
4. **The HEAD of a bake log** — still the cheapest unblock for the pacing verdict (~14 `§CPE_BUILDUP`
   checkpoints + `§GANTT_CACHE_HIT/SAVE` + `§CPE_BUILDUP_PACING mode=`).

## ✅ §4D_BAND_MONOTONIC BUILT 2026-08-02 — Ruling A implemented, measured on real Hospital
`viewer/schedule_gate.js` + `_GANTT_CACHE_VERSION` **6 → 7** (mandatory — 35,484 elements re-ordered).
Witness `witness_4d_band_monotonic.js` **6/6**; it runs **BOTH** schedulers over the same geometry
(`origin/main`'s saved as `tests/_schedule_gate_main.js`) so "before" is MEASURED, not asserted.

| | before | after |
|---|---|---|
| non-structure cross-storey inversions | **29,824** | **0** |
| structure inversions | 551 | 551 (intentionally unchanged) |
| project span | 170d | 176d (+3.5%) |
| trades at project midpoint | 5 | 5 (trade train survives) |
| floating elements | 0 | 0 (`tests/test_schedule_gate.js`) |

**67% of all cross-storey pairs were inverted, worst by 107 days.** The user's "upper floors gets
walled first" was not a misread of the film — it was the dominant behaviour of the scheduler.

**TWO AUDIT CATCHES — this is why the ladder is logged rather than trusted:**
1. **`Unknown@184.5m(9457)` took a rank between Level 3 and Level 4** on the very first run. The
   §GANTT_STOREY_Z population is scattered through the whole building, so its median z is a centroid,
   not a level; ranking it gated 9,457 elements against Level 3 and held all of Level 4 behind a
   fiction. Excluded from the ladder, keeps every geometric gate. **The ruling's warning was exactly
   right and it fired on the first attempt.**
2. **PASS A is intentionally UNGATED — both alternatives measured and rejected.** Gate without
   re-sorting: 551→519 (6%, a lower bound that does nothing). Gate WITH re-sorting by rank:
   inversions→0 **but 2,341 elements FLOAT again** (members 2304/7127, beams 15/1970, slabs 22/35) —
   `geoGate` reads a grid of already-placed elements, so re-ordering places elements before their own
   supports. **Floating wins; "nothing without support" is the hard gate.** Cross-storey STRUCTURAL
   ordering is now a named open item, gated as *unchanged* (T2b) so nothing can move it silently.

🔴 **"Slabs coming on too fast" is NOT fixed and is a DIFFERENT problem.** It is a RATE, not an
ordering defect — structure inversions were only 551/2316 while non-structure was 29,824. A whole
floor plate becomes eligible the instant its columns top out, then competes only for CONCRETE_GANG's
**3** crews (MASON has 2, ROOFER 1). The fix is crew caps / eligibility smoothing, not monotonicity.

## 🔴 REMAINING after 2026-08-02
1. **Slab burst** (above) — crew-cap / eligibility smoothing.
2. **Cross-storey STRUCTURAL ordering** — 551 inversions; needs a way to order PASS A without
   re-sorting it (the re-sort floats 2,341). Perhaps a second structural pass, or gating on
   `bandTrade[r-1]` computed from a pre-pass rather than read live.
3. **Staging dirty-check** — ~46% of a light bake frame; restage only when the placed-set changed.
4. **§CPE_HOLD_TURN decouple + rebase v912 → v913.**
5. **HEAD of a bake log** — still the cheapest unblock for the buildup-pacing verdict.

## ✅ LANDED 2026-08-02 — the 2026-08-02 batch is on `main` and SERVED (PR #1129, `fc58210`)
**The batch was built, witnessed and pushed on 2026-08-01 — and no PR was ever opened.** `origin/main`
sat at `fcc06a1` (v911 behaviour) for the whole session that followed, which is why the user's 01:43
bake (`BIM_MaxQ_Hospital_1785606234882.mp4` — 111.3s, 15fps, 1852×960, 1670 frames) could not contain
§4D_BAND_MONOTONIC, §CPE_DAY_COUNTER, §CPE_GHOST_PULL or the room-title dwell/lead fixes. User's own
words on that bake: *"not yet applied latest changes though"*. **Built ≠ landed. Check for an open PR
before reporting a lane as shipped.**

**One CI failure on the way in, and it was a plain omission:**
```
viewer/main.js  16:54  error  'setupCpeDayCounter' is not defined  no-undef
```
`§CPE_DAY_COUNTER` added `viewer/cpe_day_counter.js` (a global-scope `<script>` engine,
`function setupCpeDayCounter(A)`), wired it into `main.js`'s setup list and into `sw.js`'s
`PRECACHE_ASSETS` — but never added the name to `eslint.globals.json`. Its sibling
`setupCpeRoomTitle` was already registered. Fixed in `2893866`. **Adding a new `viewer/*.js` engine is
a THREE-place edit: `viewer.html` `<script>`, `sw.js` `PRECACHE_ASSETS`, and `eslint.globals.json`.**

⚠ **Local `npx eslint` cannot be trusted as the gate on this machine.** `eslint.config.js:7` pulls
`globals.browser` from the npm `globals` package; a bare `npx` resolves a version WITHOUT the WebCodecs
globals, so it reports 3 phantom `VideoEncoder`/`VideoFrame` errors in `cinema_maxq.js` that CI does not
have (CI's lock-pinned copy has them — its log reported exactly ONE error). Node here is v18.19.1, which
also breaks eslint 10's `stylish` formatter (`util.styleText is not a function`) — use `-f json`. Read
the CI log for the truth, not the local run.

**Verified SERVED by fetching the files back (not by trusting the merge):**
`viewer/sw.js` → `CACHE_VERSION="v913"` + `cpe_day_counter.js` in `PRECACHE_ASSETS`;
`viewer/time_machine.js` → `_GANTT_CACHE_VERSION=7`; `viewer/cpe_day_counter.js` → HTTP 200 with
`setupCpeDayCounter` present. Both CI checks green (`fast-checks` 23s, `e2e-tests` 57s).

**▶ THE NEXT BAKE IS A ONE-SHOT MEASUREMENT — do not waste it.** The 6→7 gantt bump forces a schedule
REGENERATE rather than a cache hit, so this is the run that settles §NEED (open item 5, "the HEAD of a
bake log"): `§GANTT_CACHE_HIT` vs `§GANTT_CACHE_SAVE`, `§CPE_BUILDUP_PACING mode=`, the ~14
`§CPE_BUILDUP` checkpoints, `§GANTT_STOREY_Z`. It decides whether the front-loaded buildup pacing is a
real defect or was a stale gantt all along. Also confirm the Day #/total badge is in the EXPORTED BYTES,
not merely on screen — the trap `cpe_day_counter.js`'s header names.

## 🔴 REMAINING after the #1129 landing
1. **Slab burst** — a RATE, not ordering (CONCRETE_GANG has 3 crews); crew-cap / eligibility smoothing.
2. **Cross-storey STRUCTURAL ordering** — 551 inversions; the re-sort fix floats 2,341 elements.
3. **Staging dirty-check** — ~46% of a light bake frame.
4. **§CPE_HOLD_TURN** — `feat/cpe-hold-turn` is 2 ahead / **1 behind** `main`, still NO PR. Rebase onto
   `fc58210` (v913). Per the user's ruling the turn must NOT be gated on `perpMag` — the Hospital 0.15°
   RED goes green by removing the coupling, not by lowering the gate.
5. **§NEED — the HEAD of a bake log** (see the one-shot above).

## 🔴 §CPE_GAZE_ACQUIRE — user 2026-08-02: *"the cam head turning to face density*depth ... Seems a bit slow during this baking. It be nice if it does so right away gracefully"*
**DIAGNOSED IN CODE, not guessed. The cause is a deliberate, documented mechanism — so this is a
design change with a ruling attached, not a bug fix.**

`viewer/effects.js:6748` — the composed gaze (look-ahead, seam blend, §CPE_AIM_DENSITY, §CPE_AIM_DEPTH)
is passed through a HARD RATE CAP:
```js
var maxAng = CINEMA_TURN_DPS * stepSec * Math.PI / 180;   // CINEMA_TURN_DPS = 45  (effects.js:4077)
var nxt = _rotToward(cur, raw[i], maxAng);                // effects.js:6754
```
and `_rotToward`'s own header states the intent plainly: *"Forward-only, so it LAGS rather than
anticipating; that is correct for a camera operator."* **The lag the user is seeing is the feature.**

**THE ARITHMETIC OF THE COMPLAINT** — the cap is CONSTANT, so acquiring a subject θ° off-axis costs
θ/45 seconds at a flat rate with no fast start: 45° → 1.0 s, 90° → 2.0 s, 150° → 3.3 s, and the whole
way it turns at exactly the same speed. That is why it reads as "slow" rather than "smooth": a real
operator whips onto a subject and *decelerates* onto it. A constant rate has no acquisition at all.

**THE FIX SHAPE (specced, not built): keep a bounded peak, replace the flat rate with an EASE-OUT
acquisition.** Let the per-probe cap scale with the residual angle — fast while far off-axis, decaying
as it converges — e.g. `maxAng = CINEMA_TURN_DPS * stepSec * (1 + k*smoothstep(residual/θ0))`. Peak
turn rate stays explicitly bounded and logged; the crawl goes away; the arrival is *graceful* because
the rate is smallest exactly where the gaze settles. Still a pure function of `w3`, so `poseAt` stays
order-independent and replans stay byte-identical.

**⛔ THE RULING THIS NEEDS — do not change `CINEMA_TURN_DPS` to "fix" it.** That constant is NOT a
gaze setting: `effects.js:5932-5943` prices the **spin**, the **orbit lap** and the **walk's own turn
charge** off the same 45 — raising it re-times every film ever baked, including the one the user just
approved. The acquisition curve must be a SEPARATE, gaze-only multiplier over the shared cap. Decision
needed: what peak is acceptable (2×=90°/s? 3×=135°/s?), knowing §CPE_GAZE_CONSTANT_RATE exists
*because* an unbounded swing measured **29.01 deg/sample at w=0.850 on Hospital** and was judged a whip.

**WITNESS CLAIM before any code** — `witness_cpe_gaze_acquire.js`, RED on `origin/main`:
1. time-to-acquire (residual ≤5° of the density×depth subject) DROPS for a θ≥60° acquisition;
2. peak deg/sample stays ≤ the agreed multiple of `CINEMA_TURN_DPS` — no whip reintroduced;
3. the rate at arrival is STRICTLY LOWER than the rate at onset (that is what "gracefully" means, and
   a flat-rate implementation fails it while still passing 1 and 2).
The numbers already exist to compare against — `§CPE_GAZE_CONSTANT_RATE` logs `rawPeakDps` vs
`limitedPeakDps` every bake, which is the before/after instrument, not a new one.

**⚠ Not the same thing as `feat/cpe-hold-turn` (v912, still unmerged, still no PR).** That branch is
about the turn during a §CPE_STICK_HOLD and carries the user's standing ruling that the turn must NOT
be gated on `perpMag`. This item is the acquisition RATE anywhere in beats 3+4. Fix them separately.

**Unrelated finding while measuring, recorded so it is not rediscovered:**
`witness_cinema_path_editor.js` **G10** ("LOS aim points at the next waypoint ≤25°") is **RED on clean
`origin/main`** — Duplex `aimErr=150.5deg d=0.01m`, Terminal `aimErr=25.4deg d=0.22m`. Duplex's is a
degenerate probe (aim direction over a 1 cm baseline is meaningless), Terminal's is 25.4 against a 25
threshold. **The instrument is at fault, not the gaze** — G10 needs a minimum-baseline guard before it
can be trusted either way. It is NOT evidence for or against §CPE_GAZE_ACQUIRE.

## ✅ §CPE_GAZE_ACQUIRE — BUILT, WITNESSED, MERGED 2026-08-02 (PR #1131, `1fa1906`, sw v915)
The §CPE_GAZE_ACQUIRE section above specced this and asked the user for a peak multiple. **The user
declined the question** — *"A cam head turn is well described, u need nothing further but your common
sense"* — so 3× was chosen and justified in the code comment rather than asked about. Recorded because
the asking was the error: the request was already unambiguous.

**The change:** the per-probe allowance now scales with the RESIDUAL angle — full 3× (135 °/s) far
off-axis, smoothstepping to **exactly 1.0×** as it converges. `CINEMA_TURN_DPS` is UNCHANGED and must
stay that way (it also prices the spin, the orbit lap and the walk turn budget); this multiplies over it.

| | flat cap (shipped) | §CPE_GAZE_ACQUIRE |
|---|---|---|
| 90° acquisition | **2.00 s** | **0.90 s** |
| rate at onset | 45 dps | **135 dps** |
| rate at arrival | 45 dps | **40.9 dps** |
| settled gaze (≤2° residual) | 45 dps | **45 dps — bit-identical** |

`witness_cpe_gaze_acquire.js` **8/8**, RED on `origin/main` (0/6, curve absent). **T6 is the load-bearing
claim** — rate at arrival strictly below rate at onset. A "just turn faster everywhere" implementation
passes T5 (faster) and FAILS T6, which is the difference between *gracefully* and a whip.

⚠ `_rotToward` and the curve were HOISTED to module scope. They are pure, and they had been trapped
inside the per-plan `_cinemaPathPlan(durationSec)` closure — so `A.gazeAcquireCap` assigned in there
did not exist until a plan was built, and the witness's T0 failed against working code. **Anything a
witness must drive cannot live inside that closure.**

### ⚠ HARNESS FACT THAT COST A WRONG ANSWER — read before running any cinema witness
**Most `witness_cpe_*` / `witness_cinema_*` files do NOT start their own server.** They expect one
already listening on a fixed port (`const PORT = process.env.PORT || 8402`, `|| 8403`, …), and on a
miss puppeteer dies with `ERR_CONNECTION_REFUSED` — which reads as **exit 1, i.e. a FAILING WITNESS**.
First regression pass reported **13 of 15 red**; with one server per worktree and `PORT=` set, four of
those (`gaze_spin`, `spin_whip`, `walk_budget`, `orbit_v2`) were **green all along**. Run them as:
`(nohup python3 -m http.server 8500 &) ; PORT=8500 node witness_x.js` from the worktree under test.
`witness_cpe_day_counter.js` and `witness_cpe_gaze_acquire.js` DO self-serve (they `listen(0)` on a
free port) — copy that pattern for new witnesses so this trap stops being re-paid.

**Known RED on clean `origin/main`, NOT caused by any of this session's work** (verified by running the
identical set on a clean worktree): `witness_cinema_path_editor` **G10** (degenerate 0.01 m baseline —
instrument fault, needs a minimum-baseline guard), `witness_cpe_even_turn` **T6** (walk pace floor),
and `tests/audit_specs.js` (5 SKIP paths in `38-sh-dx-2d-runtime.spec.js`).
**The gate this change most risked — `witness_cinema_path_editor` G7 "no sharp corners: peak ≤12
deg/frame on a 90-deg dog-leg" — PASSES**, as does `witness_cpe_even_turn` T2 ("peak gaze sweep under
12 deg/frame on a hostile layout"). Those two are the ones that would catch a reintroduced whip.

---

# ✅ SESSION 2026-08-02 (post-bake) — three user reports off the 1761-frame Hospital bake, ONE PR (#1135, sw v917)
All three RED-first, witnessed, merged together. Files: `cinema_path_editor.js`, `cinema_maxq.js`,
`cpe_room_title.js`, `sw.js`, four witness files.

## §CPE_STICK_HOLD — the DEFAULT is 0. An unset hold is no hold. (user correction)
User, after the bake showed a 1s pause at a settle stick they never set: *"of course not as default
is zero. When i specify an issue, it shows what my intent is."* The 2026-08-01 quote "putting hold at
1 sec (put that as default...)" was a ONE-PATH instruction that got over-generalised into
`CPE_HOLD_DEFAULT_SEC = 1.0` seeding the last band of every fresh path. Now 0. The seeding SHAPE is
kept (a future non-zero default would still land on the EXIT band per the 2026-08-01 correction) but
seeds 0 everywhere. `witness_cpe_stick_hold` G-SH-7 rewritten to assert `[0,0,0]`; G-SH-1..4 still
prove a TYPED hold works exactly as shipped (1.0s costed as authored time, camera really stops).

## §CPE_BUILDUP_TOPOUT — construction completes at the closing-orbit boundary, not the final frame
User: *"the top roof solar panels never gets to be shown - it stops shy of the last task."* Log
agreed: `placed=62700/63421` at frame 1740 (t=0.989), `63421/63421` only on frame 1760/1761 — the
buildup rode the film fraction 1:1, so 100% completion coincided with the last frame BY CONSTRUCTION
and the final 721 elements (567 Sunpower panels among them) were on screen ~1.4s. No pacing weight
can fix a completion point pinned to the final frame (the §HELIPAD_ROOF_SEPARATION tables already
proved that class of fix impossible). The completion point itself moved: buildup fraction =
`min(1, tFilm / plan.beats.rise)` — complete when the closing orbit begins; the pull-back shows the
topping-out, the orbit circles the FINISHED building. Fallback topout 0.92 for beat-less plans
(older cache / re-opened authored path) — degrade, don't disable. ONE implementation
(`APP.buildupTAt`) drives preview (cinema_path_editor.js) and bake (cinema_maxq.js) so they cannot
disagree. New log: `§CPE_BUILDUP_TOPOUT topoutU=… src=plan.beats.rise|fallback`.
`witness_cpe_buildup_topout` G-BT-1..4 (complete at rise + monotone; linear on [0,rise] so
§CPE_BUILDUP_WORK_PACED is compressed not distorted; fallback; real plan resolves from own beats).
⚠ Related, diagnosed NOT a film defect: the user's TM showed the panels at **Day 118** while the
film's timeline had them in the last 721 ops — the bake ran on a CACHED gantt (`§GANTT_CACHE_HIT
ops=63416`), the TM scrub was a FRESH generate. Two schedule vintages, converges at sw v916+/cache
v8. Nothing missing from either timeline. Separately noted: the 567 panels are
`IfcBuildingElementProxy`, no SEQUENCE_RULES entry of their own (seq 6 default, `_DEFAULT` crew) —
a rules entry is a candidate improvement, NOT built.

## §CPE_ROOM_TITLE_MULTI — the caption fan fills centre-ray misses, never overrides a hit
User: *"Room labelling poor."* Bake: `gazeMissedAll=59/783`; LTU evidence 257/740 (35%). One ray
grazing a doorway jamb hits no room even when one dominates the view. Rule: centre ray first; on a
MISS ONLY, two rays ±10° HORIZONTALLY (FAN_DEG=10, inside a quarter of the planner's own 60° cone),
nearest fan hit wins. ⚠ HORIZONTAL ONLY, deliberately — a vertical fan ray re-opens
§CPE_ROOM_TITLE_HEIGHT_BLIND (#1108); horizontal offsets preserve the ray's vertical geometry so
#1108 stays closed BY CONSTRUCTION and G-RTM-3 measures it (100 over-flights, 0 leaks). Measured on
the real Hospital film: **34 of 61 misses recovered** (`gazeFanRecovered=34`, missed 61→27). The
probe now returns the WINNING ray (`dir`, fan=1) and G-GZ-2 verifies truthfulness along it — same
property, correct ray. `witness_cpe_room_title_multi` G-RTM-1..4; regressions gaze 8/8, height 5/5,
lead ALL GREEN, hold ALL GREEN.
⚠ NOT touched, by ruling: `skipped=11(<3s)` implements the user's own "tries to show up to 3 secs..
if misses, then skips" — a fast walk through small rooms legitimately drops captions. If the user
wants those named too, that is a NEW ruling (queue vs. skip), not a defect.

# ✅ §CPE_ROOM_TITLE_GROUP — constant, composed, tempered labelling (PR #1136, sw v918, 2026-08-02)
**User ruling, three parts given live:** *"anything that comes within range of path or sight are
pointed out so inaccurate labelling is diminished"* → composed format *"Storey 2, Corridor Hall,
Rooms 2,3"* → *"in single lines.. tempered that manner... not fast flashing each."*

**The rule as built:** room captions keep EVERY precision rule (dwell floor, 3s-or-skip, lead, hold)
untouched; the gaps are filled by WINDOWED COMPOSITION. A window closes at the first natural change
point after the 3s floor; its single line shows only what is true of the WHOLE window: storey (only
if every sample resolves the same ladder rung), containment room (only if the camera stayed inside
it), the UNION of rooms the gaze rays resolved (first 5 named + "+N more"), else the building name.
Storey ladder = elements_meta's own storey column averaged over element z. Key separator TAB
(corridor guids contain '|').

**Measured, Hospital 147.9s:** coverage 69% → 94%, 4 fill segments, shortest 5.1s, 0 overlaps,
honesty recomputed at every fill segment — 0 wrong. One 3-ray pass answers caption + sight set
(pre-pass 425ms → 129ms, back inside G-GZ-7's 340ms budget).

**Two designs measured and rejected on the way:**
1. Single coarse gap label (containment-else-storey-else-building) — user corrected mid-build to
   the composed format.
2. Absorb-short-runs-into-predecessor tempering — let a stale "Level 2" survive a dive to z=295
   (nearest rung Level 7). Tempering must never extend a claim beyond what stays true; unanimity-
   over-the-window is the fix, and G-RTG-3 recomputes it at start/mid/end of every fill segment.

**Instrument updates that are NOT bar-lowering:** lead witness excludes `group:1` segments (a fill
has no doorway to lead); height witness excludes them too (an honest building-label over-flight is
not #1108's room-named-from-above). Both properties still gated on room captions; the fill has its
own witness (witness_cpe_room_title_group.js G-RTG-1..5).

# ⛔ OPEN — §CPE_GAZE_SKYLINE_STARE: the cam face-turn fails, staring into empty skyline (user, live bake 2026-08-02)
**User, during the Hospital bake around Day 90+:** *"a bad staring into outside skyline with no
building facade, ie cam face turn is failing."* Reported for a NEW SESSION to tackle — do not fold
into unrelated work.

## NOT caused by the 2026-08-02 PRs — verified, not assumed
- #1133 (stagger), #1135 (hold/topout/fan), #1136 (group labels) touch `time_machine.js`,
  `cinema_maxq.js`, `cinema_path_editor.js`, `cpe_room_title.js`, `sw.js` + witnesses ONLY.
  **`viewer/effects.js` — owner of every pose/gaze/aim rule — is untouched**; its last change is
  #1131 (§CPE_GAZE_ACQUIRE), already live in the user's accepted earlier bake.
- **The defect was already armed BEFORE those merges:** the user's own preview log (pre-#1135 code,
  same authored path) shows BOTH gaze correctors inert across the whole film:
  `§CPE_AIM_SERIES probes=65 active=0/65 maxBlend=0.00` (empty-view aimer) and
  `§CPE_AIM_DEPTH_SERIES probes=65 active=0/65 maxBlend=0.00` (boxed-in aimer). 0 of 65 probes ever
  engaged — nothing in the film can turn the camera onto the facade when the base path looks out.
- Buildup topout (#1135) only makes construction COMPLETE EARLIER — at any film moment MORE facade
  exists than before it, so it cannot have removed a facade from view.

## Leads for the next session, all already on record in this file — MEASURE before building
1. **Why is `active=0/65`?** The aim weight is a field along the walk; its trigger predicate never
   fired once on this authored path. Extract the trigger INPUTS (not the weight) along the reported
   window and find which term kills it. This is the first number to get.
2. **§CPE_GAZE_CONSTANT_RATE slews toward the leg's END bearing computed at leg start** — faithful
   by construction to a BAD target: if an authored stick's end bearing points out the glazing, the
   constant-rate law delivers the stare on time. Check what the end bearing was on the day-90+ leg.
3. **§CPE_AIM_DEPTH D4 (open item, never built): the aim grid weighs the FINISHED building**
   (`§CPE_AIM_GRID elems=63182`). With buildup ON, density can exist where nothing is yet revealed —
   an aimer that DID engage could still face not-yet-built facade, which reads as empty skyline.
4. Locating the moment: Day 90+ maps to film t via the bake's own `§CPE_DAY_COUNTER frame=N day=D`
   lines — read the frame band from the bake log, do not re-derive from pacing formulas (work
   pacing + topout make day↔t nonlinear twice over).

## The verification bar (FUNDAMENTAL LAW — this lane has violated it before)
The proof is a NUMERIC time series: gaze-direction-vs-building-bulk angle (the same measurement
that localised the spin whip: "t=0.150 → 35.8°, t=0.200 → 76.9°") across the reported window,
before and after any fix — never a screenshot, never "it looks better".

## §CPE_GAZE_SOC — harden separation of concern while fixing it (user directive 2026-08-02)
The stare is hard to attribute because THREE camera concerns are interleaved inside `effects.js`'s
~7k-line planner: WHERE the camera is (waypoints/bands/beats), WHEN it moves (noise law, budgets,
holds), and WHERE IT LOOKS (gaze sense, spin, acquire, aim series, depth aim, latch, constant-rate
— at least seven rules composing one direction, each a weight field inside the plan). Any session
editing pacing is one merge conflict away from disrupting facing, and a facing failure has no
single owner file. Harden while fixing, not after:
1. **Extract the gaze into its own module** (`viewer/cinema_gaze.js` or equivalent): input = the
   flown position series + the building fields; output = ONE direction per t. `poseAt` COMPOSES
   position + gaze; nothing else may write the look target. The precedent is already in this lane:
   `cpe_room_title.js` is exactly this shape for captions — own file, pure functions, witnessable
   without a bake — and it is why the caption lane ships without breaking the camera.
2. **Provenance per frame, logged:** a `§GAZE_SRC` series naming WHICH rule owns the direction at
   each probe (base-path | spin | acquire | aim | depth-aim | latch). The skyline stare would have
   named its owner from the user's own console paste instead of costing a diagnosis session. Same
   move as §CPE_BUILDUP_SOURCE: the log states the rule in force, a stale cache cannot lie.
3. **The gaze module gets its own witness harness**: feed it a synthetic path + a real building,
   assert the angle-vs-bulk time series — no bake, no camera, no screenshot. The G-SH/G-GZ pattern,
   applied to the thing that currently can only be measured through a full plan.
4. **Boundary rule going forward:** pacing PRs may not touch the gaze module and vice versa —
   reviewable from the diff's file list alone, the same way this session PROVED non-disruption in
   one `git show --stat` because captions live in their own file.

## §CPE_GAZE_SKYLINE_STARE addendum — how it "crept back in" despite refreshed code (user challenge 2026-08-02)
**"Pre-existing" above means pre-dating the 2026-08-02 PRs ONLY — not "was always there."** The
user's accepted reference film is 2026-07-29; since then `effects.js`'s gaze law was rebuilt SIX
times: #1101/#1103 (§CPE_AIM_DEPTH), #1121 (walk budget), #1125 (spin whip), #1126 (§CPE_STICK_HOLD
+ §CPE_AIM_LATCH + §CPE_GAZE_CONSTANT_RATE), #1131 (§CPE_GAZE_ACQUIRE). Refreshing code prevents
STALE code; it does not protect against NEW code changing composed behaviour — and no merge in that
list was gated by a film-level "gaze stays on the building bulk" witness. Each gated its own rule's
property; the COMPOSITION regressed in green. That is §CPE_GAZE_SOC's case in one sentence, and the
standing composed-gaze angle-series witness it prescribes is the guard that was missing.
**Bisect order for the next session:** #1126 first (constant-rate slews toward a bearing computed
at LEG START — faithful to a bad target by construction; the authored path's leg-end bearings are
the thing to dump), then #1131 (acquire re-timing), then the aim-depth pair. ⚠ Second variable:
the path is AUTHORED and has been re-edited since 2026-07-29 — the leg pointing at the skyline may
itself be newer than the accepted film. Dump `§CPE_CAM_BASIS` + the band directions from the saved
path record BEFORE blaming any law.

# §CPE_GAZE_BULK — the stare DIAGNOSED (measured 2026-08-02, this session) + the fix spec

## The measured cause — no bisect needed, the composition has a HOLE, not a culprit merge
All numbers from the saved path record (`buildings/HospitalAjaibPath.db` `cinema_path` table,
saved 2026-08-01, the day before the bake) + `element_transforms` (63,182 rows — matches the
user's own `§CPE_AIM_GRID elems=63182`, so it IS the baked building):
1. **The authored path is fully INTERIOR.** Bands: c=(10,92.3,167.5)→(36.3,95.9)→(57.3,94.6),
   all inside perimeter x∈[−11.7,89.5] y∈[1.2,152.1]. `_aimWeight`'s first term is
   `outM<=0 → return 0` (outside-the-perimeter trigger) — so the empty-view aimer is
   STRUCTURALLY inert on any interior path. That is the exact kill term behind
   `§CPE_AIM_SERIES active=0/65` (lead 1 answered).
2. **The depth aimer is hard-disabled for EVERY buildup film** — §CPE_AIM_DEPTH_BUILDUP_GUARD
   (`effects.js` `_aimDepthWeight`: `if (_cinemaPathEdit.buildup) return null`, landed #1103
   2026-07-31, inside the regression window). That is `§CPE_AIM_DEPTH_SERIES active=0/65`.
3. **Therefore on this film NOTHING can turn the camera onto mass** — the composed gaze
   degenerates to pure look-ahead (path tangent at walk end). The end-leg bearing (0.94,−0.35,0)
   points 157° off the bulk centroid ((46.2,93.0) vs end point (57.3,94.6)); the eye-level
   corridor ahead of it (±8m lateral, ±6m z) holds 1764 elements in 0–10m, 291/230/3 in
   10–40m, ZERO beyond — the bearing runs off the east edge (x≈89.5) into open sky. The
   constant-rate law then delivers that bearing faithfully. The stare is the base path's own
   tangent, not any one law's regression — the six merges REMOVED the two rules that used to be
   able to intervene on some films, and no rule was left whose TRIGGER looks at what the gaze
   actually sees.

## The fix — §CPE_GAZE_BULK, an empty-GAZE corrector (trigger = what the camera SEES)
Both existing triggers test where the camera STANDS (outside-perimeter / boxed-in). The missing
rule tests the GAZE RAY: per probe of the composed raw gaze (the same 512-sample series
§CPE_GAZE_CONSTANT_RATE already builds), compute
- `seen` = soft density (same (1−u²)² kernel as `_aimSoftDensity`) accumulated in a ~20° cone
  along the gaze, 1–45m ahead — "is anything in view";
- `bulkDir` = density-weighted centroid of elements within 60m of the camera — "where the mass
  is";
- `w = (1 − smoothstep(seen/FLOOR)) × smoothstep(near-mass/FLOOR)` — correct ONLY when the view
  is empty AND real mass is actually nearby to face (a genuine all-sky moment stays authored);
- smooth w with the house 2×5-tap pass, NO latch (a corridor that turns back to healthy
  look-ahead must release), slerp raw→bulkDir by w, THEN the existing acquire+rate limiter
  bounds the result — the law order is corrector-before-limiter so no new rate can leak in.

## §CPE_GAZE_SOC delivered with it (per the standing directive above)
- New file `viewer/cinema_gaze.js` (IIFE/setup-function pattern, same as `cpe_room_title.js`):
  owns raw-series sampling, the §CPE_GAZE_BULK corrector, the acquire cap + constant-rate
  limiter (moved verbatim), and per-probe provenance. `poseAt` beats 3+4 read ONLY its output.
- `§GAZE_SRC` log: per-probe owner series (los | aim | depth | bulk | beat4-pivot, + rate-clamp
  marker), so the next console paste NAMES the rule in force.
- Witness `witness_cpe_gaze_skyline.js` (root, puppeteer pattern of `witness_cpe_stick_hold.js`),
  ground truth computed from `element_transforms` directly (never from the module under test):
  - G-GZ-1 REPRO: on the real authored path record + buildup regime, the PRE-FIX composed gaze
    has a ≥3s window where gaze-cone mass ≈0 while ≥5k elements sit within 60m (the stare,
    stated as numbers). RED before the fix, and the fix must close it (post-fix window <0.5s).
  - G-GZ-2 PROVENANCE: `§GAZE_SRC` covers all probes; in the (pre-fix) stare window the post-fix
    owner is `bulk`.
  - G-GZ-3 NO-REGRESSION: on a path whose gaze-cone mass is everywhere healthy, corrector w≡0
    and the output series is identical to the pre-module composition (the extraction changed
    nothing when the new rule is silent).
  - G-GZ-4 RATE LAW: limited peak dps ≤ CINEMA_TURN_DPS × GAZE_ACQUIRE_MAX, unchanged.
- Boundary rule: pacing PRs may not touch `cinema_gaze.js`; gaze PRs may not touch pacing —
  enforceable from the diff file list.
⚠ NOT in scope here (stays open as §CPE_AIM_DEPTH D4): reveal-aware subjects during buildup.
§CPE_BUILDUP_TOPOUT (#1135) means the late film — where this stare lives — is already topped
out, so full-building bulk is the correct target for the reported window; D4 remains the fix
for EARLY-film aiming and the buildup guard on the depth aimer stays exactly as is.

## §CPE_GAZE_BULK — ⏸ PARKED (user ruling 2026-08-02, same day as the diagnosis above)
User, on the finished second bake: *"rather OK, it is a matter of path creativity"* — the skyline
stare is chiefly the AUTHORED path's own end-leg bearing, to be solved by authoring, not by a new
auto-turn rule. And on the current turn feel: *"The cam face turns rather obvious been more
pronounced, still OK, was more graceful before"* — a corrector that ADDS auto-turning goes the
wrong way. So: the diagnosis above STANDS (measured, correct, do not re-derive), the corrector is
PARKED. Branch `fix/cpe-gaze-bulk` (bim-ootb, pushed, no PR) holds the working module:
`viewer/cinema_gaze.js` (§CPE_GAZE_SOC shape: builder + §GAZE_SRC provenance + verbatim
acquire/rate-limit move) + `effects.js` delegation with inline fallback — compiles, UNWIRED
(no viewer.html tag, no sw precache), zero behavior change on main. Witness never written.
**User's own hypothesis, recorded:** *"perhaps it reacted bit late, thus explaining why the sky
gaze"* — consistent with the measured mechanism: the constant-rate limiter is FORWARD-ONLY (it
lags by design, documented in its own comment), so from a bad Beat-3 end bearing the recovery
turn arrives late by construction. If this lane is ever resumed, an ANTICIPATORY limiter (look
ahead in the raw series, start the turn early) may fit "graceful" better than the bulk corrector.

# §CPE_GAZE_ACQUIRE_SOFTEN — peak 3x → 2x (user, 2026-08-02: "was more graceful before")
The 3x cap (135°/s peak when >60° off-axis, #1131) reads as "rather obvious… more pronounced".
Soften to GAZE_ACQUIRE_MAX = 2 (90°/s peak): still strictly faster than the flat 45°/s that read
as "a bit slow" (the request that created the rule), still decaying to exactly 1.0x on-subject.
One knob only — GAZE_ACQUIRE_FULL/DEAD untouched. Witness: witness_cpe_gaze_acquire.js T1–T6 are
curve-property claims, not constant checks — all six must stay green at 2x, and T5's measured
time-to-acquire will sit between the 3x value and the flat 2.00s.

# §CPE_ROOM_TITLE_COLLECTIVE — ONE composed caption everywhere + live [phase] (user, 2026-08-02)
User: *"grouped together in single label… it is caption optics"*, format confirmed verbatim:
**"Storey - 1 Corridor Hall Rooms 2,3 [MEP Rough in]"**.
1. **One format, all captions.** §CPE_ROOM_TITLE_GROUP's composed line (storey · containment ·
   rooms-in-sight) currently renders only in the GAPS between precision room captions; the
   room-dwell captions still show a bare room name — two optics. Now EVERY caption window
   composes the same single line. The room-dwell timeline (dwell floor, 3s-or-skip, lead, hold,
   hysteresis — all settled rules) is UNTOUCHED: only the `name` a dwell segment carries becomes
   the composed line for its window (storey if unanimous, containment if unanimous, union of
   sighted rooms — same rules the gap composer already applies, one composer function, two
   callers).
2. **[Phase] at DRAW time, never plan time.** During a buildup film the caption gains a trailing
   `[<phase>]` naming the collective being built — the SAME live TM state the bake already drives
   (the sfx line `§SFX_PLAY src=tm phase=…` proves the per-frame phase is in force at draw). Plan
   time cannot know it: day↔t is nonlinear twice over (work pacing + topout). No buildup, or no
   phase in force → no bracket, never a guessed one.
3. Witness (extend witness_cpe_room_title_group.js or sibling): (a) every rendered caption in a
   sampled plan matches the composed grammar; (b) a dwell caption's room appears in its own
   composed line; (c) with a synthetic phase in force the draw routine appends exactly one
   `[phase]`; (d) timing series (open/close times) byte-identical to pre-change — optics only.

## ✅ §CPE_GAZE_ACQUIRE_SOFTEN — DONE (PR #1137, merged 2026-08-02, sw v919)
GAZE_ACQUIRE_MAX 3→2 (135→90 °/s peak). witness_cpe_gaze_acquire.js 8/8 green at 2x: T5 90°
acquired in 1.18s (flat was 2.00s), T6 onset 90dps → arrival 40.9dps, T7 real-run peak 90dps.

## ✅ §CPE_ROOM_TITLE_COLLECTIVE — DONE (PR #1138, merged 2026-08-02, sw v920)
User's refinement, recorded verbatim: *"the right term to use is 'composition' comprising of
various types of labels together in a single line to difuse pinpointing too much any particular
item resulting in inaccuracy."* Shipped exactly as specced: one _lineFrom grammar, two callers
(gap fill + dwell rename pass, label-only, captioned room seeded first past the 5-name cap);
[phase] resolved at draw from A.tmFrontierPhase (time_machine.js refreshes per tick, null at
completion). witness_cpe_room_title_collective.js G-RTC-1..5 all green (20/20 dwell captions
composed, double-build byte-identical on guid/times/name, bracket exactly when a phase is in
force); regressions witness_cpe_room_title_group.js 5/5 + witness_cpe_room_title_multi.js 4/4.
⚠ Separate finding from the user's 2026-08-02 second bake log: it ran a STALE viewer —
`placed=62699/63420 at frame 1740 (t=0.989)` is byte-for-byte the pre-#1135 signature (topout
NOT in force; the -1 element is the absent NamePlate). The bake was served from OCI
(`viewer.html?db=https://objectstorage…`), so #1133–#1138 are live on GH Pages main but NOT on
the OCI-served viewer copy until that deployment is refreshed — worth knowing before judging
any pre-refresh bake against post-#1135 behavior.

# ▶ RESUME — CPE lane state at 2026-08-02 close (for any executor session)
**No open CPE build item.** Everything through §CPE_ROOM_TITLE_COLLECTIVE is ✅ merged (#1133,
#1135, #1136, #1137, #1138 — sw v920). §CPE_GAZE_BULK is ⏸ PARKED by user ruling — do NOT build
it unless the user reopens it; branch `fix/cpe-gaze-bulk` holds the module, the diagnosis section
stands as the record. §CPE_AIM_DEPTH D4 (reveal-aware aiming) remains a named open lead, not
scheduled. The next EXECUTABLE spec is in `prompts/GANTT_ACCURACY.md` ▶RESUME
(§Z_STACK_XRAY_STAGING — assigned to an executor session, spec complete).
Operational note: the OCI-served viewer copy predates #1135 (stale-bake signature on record
above) — a deploy refresh is needed before any live-URL bake reflects v918+ behavior.

## ✅ DONE 2026-08-02 — §CPE_PANEL_STATE: saved paths carry the panel context they were recorded under (PR #1140)

**Feature:** `_pathsSave` (viewer/cinema_path_editor.js, IndexedDB `bim_ootb_cinema_paths`) now writes a
`panelState` sub-object beside the override; `_pathsApply` restores it through the app's own setters.
Old records without `panelState` skip loudly (`§CPE_PANEL_STATE none on record`) — no throw, same as before.

**What was found and persisted (real names, from the code):**
1. **Checkboxes — the full census.** The CPE panel holds the only checkboxes active in a cinema session
   (`viewer/panels.js` has zero `type="checkbox"` inputs; time_machine.js none either):
   - `#cpe-buildup` → `_state.buildup` ("build the model as the film plays")
   - `#cpe-room-title` → `_state.roomTitle` (room-title cards, §CPE_ROOM_TITLE)
   Persisted as `panelState.checkboxes = {buildup, roomTitle}` (name→boolean). The sibling control
   `#cpe-day-counter` (a `<select>`, §CPE_DAY_COUNTER_POS corners tr/tl/br/bl/off → `_state.dayCounter`)
   is persisted as `panelState.dayCounter`.
2. **Total time** = the Time Machine project span. Real variables: `_projectStart` / `_projectEnd`
   (viewer/time_machine.js:31-32), read via the public `window.tmGetState()` (time_machine.js ~5357).
   Persisted as `tmProjectStart`, `tmProjectEnd`, `tmSpanMs` (= projectEnd − projectStart). No setter
   exists (the span is derived from the op-log), so restore is a DRIFT CHECK: mismatch → loud
   `§CPE_PANEL_STATE span drift` warn, never a write. There is no `spanDays`/`totalDays` state variable —
   `totalDays` at time_machine.js:2442 is a local computed for the big counter's text, not state.
3. **Day counter position** = `_cursor` (time_machine.js:30, "current time (ms) in the project timeline"),
   read via `tmGetState().cursor`, RESTORED via `window.tmSetCursor(ms)` — time_machine.js's own "ONE
   public cursor setter". Restore only writes when TM is active (tmSetCursor renders); otherwise logged
   (`tm-inactive-now`). Checkbox/select restore goes through each control's existing `change` handler via
   `dispatchEvent(new Event('change'))` (precedent: panels.js:552) — never a bare DOM/state poke.

**Portability decision:** scene.js `_writeCinemaPathTable` (the portable `cinema_path` table) was
inspected and deliberately NOT extended. Its schema is per-band rows (seq, ifc_x..hold_sec) — it does not
carry hose/clip/buildup/roomTitle/dayCounter today either; adding panelState there is a schema evolution
(append-only columns or a settings row + named-column reader fallback per the §CPE_STICK_HOLD version-skew
rule) and is out of scope for this pass. The IndexedDB working store is where named plans round-trip.

**Witness:** `witness_cpe_path_portable.js` extended with G-PS-1..4 (Duplex, real Alt+C → save → reload →
open route). RED on pre-fix code — 16/20, the drop proven:
```
FAIL  G-PS-1 ... rec keys=key,building,name,savedAt,meta,override — panelState MISSING
FAIL  G-PS-2 ... #cpe-buildup=false #cpe-room-title=false #cpe-day-counter=tr  LOG: no §CPE_PANEL_STATE line
FAIL  G-PS-3 ... cursor now=1785682818945 saved=1784160971939 diff=1521847006ms tmActive=true
```
GREEN after fix — 20/20 (`WITNESS PASS (20/20)`):
```
§CPE_PANEL_STATE restored buildup=1 roomTitle=1 dayCounter=bl tmCursor=restored ms=1784161039596 tmSpanMs=2415782694
PASS  G-PS-1 ... panelState={"checkboxes":{"buildup":true,"roomTitle":true},"dayCounter":"bl","tmActive":true,"tmCursor":1784161039596,"tmProjectStart":1783267199999,"tmProjectEnd":1785682982693,"tmSpanMs":2415782694}
PASS  G-PS-3 ... cursor now=1784161039596 saved=1784161039596 diff=0ms tmActive=true
PASS  G-PS-4 ... saved={buildup:true,roomTitle:true,day:bl,cursor:1784161039596,span:2415782694} restored={...cursor:1784161039596,...}  DRIFT: §CPE_PANEL_STATE span drift saved=2415782694ms now=2415801505ms
```
G-PS-4 note: byte-for-byte holds for every RESTORABLE value; the span is re-derived by TM on each load and
differs by ~20s across reloads (derived-synthesis nondeterminism, not restorable state) — the contract is
that the drift is REPORTED, and the warn line above is exactly that report firing.

**Regressions (concurrent-PR neighbors), all green:** `witness_stagger_support_order.js`
(§STAGGER_SUPPORT_VERDICT G-SSO-1..4 PASS), `witness_zstack_xray_staging.js` (§XRAY_STAGING_VERDICT
G-XRAY-1..4 PASS), `witness_cpe_room_title_collective.js` (§W-RTC all green, labelled=20/20).

**Deploy:** sw.js CACHE_VERSION v921 → v922 (cinema_path_editor.js is precached).

## ✅ DONE 2026-08-02 — §CPE_ROOM_TITLE_LEVEL_CONSOLIDATE: shared level prefix named ONCE, not per room (PR #1142)

**Bug report (user, this session):** multi-room captions on the same storey were not consolidating
the shared level prefix — illustrated as "Level 2 R1, Level 2 R3" instead of one shared prefix with
a comma-joined room list. Per this project's hard rule, the user's exact numbers were treated as
illustrative, not literal — ground truth was extracted from a real bake before any code was touched.

**Real evidence found (not re-derived, not guessed):** the #1136/#1138 build session's own scratchpad
witness logs (`/tmp/claude-*/.../7398ebd5-.../scratchpad/{w_group2,wf_group,wf_gaze,wr_gaze}.log`),
driving the REAL production functions (`A.roomTitleBuildTimeline`/`A.roomTitleOpacityAt`) on the real
147.9s Hospital film, already contained the exact defect, unnoticed because no existing gate checked
for it:
```
≈ Level 4 Hall/Corridor 2, ≈ Level 4 Hall/Corridor 1, ⚠ Level 4 R1, ≈ Level 4 R4
```
— the "Level 4" prefix repeated once per sighted room instead of heading the list once.

**Root cause, diagnosed from the real composer (`viewer/cpe_room_title.js` `_lineFrom`, shared by
the gap-fill composer AND §CPE_ROOM_TITLE_COLLECTIVE's dwell-caption composer — one function, two
callers, per #1138):** the sight-list per-room dedupe only stripped a room's own embedded storey
prefix (room names are literally "Level 4 R1" etc.) when the WINDOW's camera-position storey test
(`stSame`/`stU`, computed from where the CAMERA stood across the window) was unanimous — a stricter,
independent test from "do the sighted ROOMS themselves share a level." Whenever `stSame` was false
(a window straddling a storey-band edge, or a genuinely mixed-storey sight), the fallback passed
`null` to the dedupe helper, nothing stripped, and the prefix repeated per room. This was a
**consolidation defect only** — no separate room-numbering/indexing bug was found; the room
identities themselves (R1, R4, Hall/Corridor 1/2) were correct in every sample, just not grouped.

**Fix:** group the sight list by each room's OWN storey prefix (extracted against the same ladder
`_storeyLadderForGroups` already builds — never invented), independent of `stSame`. A room whose own
prefix matches the already-announced top storey (or has no ladder-matching prefix) lands in a shared
"loose" bucket (bare name only, no header repeated); rooms sharing a prefix not already announced are
merged under ONE header. `RED_STORY_PREFIX_OF` uses `indexOf(...) >= 0` (not `startsWith`) because
room names carry a leading confidence marker glyph (`"≈ Level 4 R1"`, `"⚠ Level 4 R1"`) — matching the
same permissive semantics the pre-existing `dedupe` helper already used.

**Bake path verified, not inferred (coordinator-requested scope addition):** read `cinema_maxq.js`
directly — `_captureFrame` (:478-491) calls `A.roomTitleOpacityAt(_titleSegs, i/fps)` (:1082) and
passes `.name` UNMODIFIED into `A.roomTitleCompositeOntoCanvas` (:486). No separate/duplicated
composition logic exists on the bake side; it is the exact same shared function this fix touches.
New gate **G-RTC-7** reproduces that exact two-call chain (not a re-implementation) across every
segment of the real film and asserts the painted canvas text carries no repeated prefix.

**Witnesses — RED before, GREEN after, all on the real Hospital film, all real production functions:**
- `witness_cpe_room_title_group.js` **G-RTG-6** (new): RED `3 repeats` (counts 4×/2×/2× across the
  film's fill segments) → GREEN `0 repeats`. G-RTG-1/2/4/5 stay green. G-RTG-3/coverage numbers
  showed run-to-run variance across repeated GREEN runs (e.g. 94% vs 96-97% coverage, one G-RTG-3
  midpoint mismatch) — **confirmed pre-existing, not caused by this fix**: re-running the UNMODIFIED
  `origin/main` code twice back-to-back showed the same class of variance in the original
  #1136-build-session logs (`w_group.log` vs `w_group2.log` vs `w_group3.log` disagreed run to run on
  identical code), and this session's own machine was under load average 6-8 with 16 concurrent
  Puppeteer/Chrome instances from other agents at the time — a real, load-sensitive characteristic of
  this headless-GPU bake witness, tracked here rather than silently ignored. The property this fix
  actually targets, G-RTG-6, was green in 6/6 repeated runs.
- `witness_cpe_room_title_collective.js` **G-RTC-6** (new, dwell-caption `.label`): RED `15 repeats`
  → GREEN `0 repeats`.
- `witness_cpe_room_title_collective.js` **G-RTC-7** (new, the exact bake-path chain): RED
  `18 repeats` (24 segments driven through `roomTitleOpacityAt`→`roomTitleCompositeOntoCanvas`) →
  GREEN `0 repeats`.
- Regressions green: G-RTC-1..5, `witness_cpe_room_title_multi.js` (G-RTM-1..4),
  `witness_cpe_room_title_height.js` (Duplex 5/5), `witness_cpe_room_title_lead.js` (Duplex 10/10),
  `witness_cpe_room_title_hold.js` (Duplex 8/8).

**Day-counter default-visibility (coordinator-requested scope addition) — NOT a bug, no code change
made:** traced `cinema_path_editor.js:1722-1726` (fresh editor state: `buildup:false, roomTitle:false,
dayCounter:'tr'`) and `cinema_maxq.js:1042/1056-1066` (the day counter fires whenever
`_buildup && _bkState` is true AND `_dayPos !== 'off'`, logging `§CPE_DAY_COUNTER frame=... day=...`;
`_dayPos` defaults to `'tr'`, i.e. VISIBLE, the instant buildup is on). The day counter already
defaults to shown (top-right) whenever the `#cpe-buildup` checkbox is on — it is gated on `buildup`
alone (logically necessary: no schedule, no day to count), exactly the same "off unless the checkbox
is set" design the room-title feature itself documents in its own header comment. Re-ran the existing
`witness_cpe_day_counter.js` (unit-level, already in the repo) fresh: **17/17 green**, including
T3a-c proving `dayCounterAt`→`dayCounterCompositeOntoCanvas` reaches the exported canvas bytes in the
top-right corner only — the same class of end-to-end proof as G-RTC-7. A live full-MaxQ-bake
reproduction (checking both checkboxes through the real editor DOM) was attempted three times and
blocked each time by real machine resource contention (`§HBA_GATE timeout — still streaming`,
consistent with the same load-avg-6-8/16-concurrent-agent condition noted above) — not a code issue,
documented rather than silently dropped. **If the user actually wants BOTH `buildup` and `roomTitle`
checked BY DEFAULT (not just correctly wired once checked), that is a UX-default decision for the
user to make, not something to invent unilaterally — named here as an open question, not built.**

**PR:** #1142, merged `8f31606` (verified via `gh pr view --json state,mergedAt,mergeCommit` +
`git show origin/main:viewer/cpe_room_title.js` content check — not fire-and-assume). **Deploy:**
sw.js CACHE_VERSION v922 → v923 (cpe_room_title.js is precached; no new precached files added).
PR: https://github.com/red1oon/bim-ootb/pull/1140 (auto-squash-merge enabled; verified merged — see below).

## 2026-08-02 — §CPE_STICK_APPROACH DONE: MaxQ bake HUD shows "approaching Stick k/N"

**User ask:** the bake status bar should also show which "stick" (waypoint band on the authored
camera path — confirmed as `cinema_path_editor.js`'s established term, `_stick===true` on a band the
user explicitly dropped, per §CPE_REOPEN_NODE's own rule: settle/exit-door/stop bands are never
sticks even though they're also entries in `bands`) the camera is currently heading toward, so a user
watching a live bake gets structural feedback ("about to swing past stick 4, that doesn't look right").

**Grounding confirmed, not the user inventing a word:** read `§CPE_STICK`, `§CPE_STICK_RED_BAR`,
`§CPE_STICK_HOLD`, `§CPE_STICK_ANCHOR`, `A.cinemaSeedStick` (effects.js:4433-4445), and the
`_stick`/`_s` fields riding on bands per §CPE_REOPEN_NODE (effects.js:6864-6870, then 6910-6947 after
this change). `_s` is each stick's arc-length fraction along the WALK (0=settle, 1=stop), assigned at
spawn time (`cinema_path_editor.js` `hit.s`) and already carried through the override → plan
round-trip — no new authored field, just reading what's already there.

**The math reused, not re-derived:** Beat 3's own `poseAt` branch (effects.js ~6259-6260) computes
`var e3 = _evenTurnRemap(_cinemaEaseFloored(_holdMap(w3)));` — the walk's live arc-fraction chain,
holds included. `stickApproachAt(tNorm)` calls the SAME chain (same closures, same tables, built by
the same `_evenTurnBuild()`/`_holdBuild()` calls already in `_cinemaPathPlan`) rather than a cheaper
second estimate, because a stick with a `§CPE_STICK_HOLD` dwell on it spends beat-seconds without
advancing arc — a naive time-fraction estimate would report the camera "past" a held stick while it
is still parked in front of it. Measured directly: G-STK-6 below.

**Implementation:**
- `effects.js` `_cinemaPathPlan()`: new `_stickList` (built from `_cpeBands` filtered to `_stick===true`,
  ordered along the path, `{index, s}` per stick) + `_stickApproachAt(tNorm)` (dive/spin → stick 1;
  walk → `e3` via the reused chain, first stick with `s >= e3` wins; rise/orbit → null, nothing left
  to approach). Exposed on the returned plan as `stickCount` and `stickApproachAt`. `stickCount===0`
  (no editor bands, or bands with no user-dropped sticks — the common unedited-bake case) is a
  complete no-op: `stickApproachAt` always returns null, exactly the old behaviour.
- `cinema_maxq.js`: a thin `stickApproachAt(tNorm)` wrapper next to `poseAt`, applying the SAME
  `_tFilm` clip remap so a clipped bake reports the stick that matches the pose actually flown that
  frame. Called once per frame alongside `pose = poseAt(_tn)`. The `§MAXQ_ETA_TICK` status-bar text
  gets one appended clause: `, approaching Stick k/N` — same per-frame cadence as the rest of the bake
  HUD, no separate timer.

**Before / after (example):**
- Before: `🎬 MaxQ frame 342/576 — 210s, ~45s left (Alt+C / cinema icon cancels + saves partial)`
- After (path has sticks, nearing the 4th of 9): `🎬 MaxQ frame 342/576 — 210s, ~45s left, approaching
  Stick 4/9 (Alt+C / cinema icon cancels + saves partial)`

**Witness — `witness_cpe_stick_approach.js` (new), G-STK-1..7, Duplex 7/7, first green run, no fudging:**
a 5-band fixture (settle, 3 sticks at explicit KNOWN `_s = [0.25, 0.50, 0.75]`, stop) with a hold on
the middle stick. G-STK-1 wiring (stickCount + `_s` echo survive band→plan). G-STK-2 start (before the
walk, and at w3=0, reports stick 1). G-STK-3 monotonic (801-sample scan, index never regresses).
G-STK-4 mid-stick-1/just-past-stick-1 (found via the function's own 1→2 transition, ±1 sample: stick 1
then stick 2). G-STK-5 near-end (at `beats.out` and through the rise, always null — every stick passed).
G-STK-6 **hold-awareness, the reason this reuses the real chain**: at the no-hold twin's own measured
2→3 transition w3, the HELD plan (same w3, its own beats) is still ≤ stick 2 — the dwell measurably
delays the transition, and far from the hold both plans agree. G-STK-7 the unedited derived plan
(`A.cinemaPathPlan(DUR)`, no override) has `stickCount=0` and is null everywhere — the common case.

**Regression, all green, unchanged:** `witness_cpe_stick_hold.js` 8/8 (the `_holdMap`/`_holds` chain
this feature reads), `witness_cpe_reopen_node.js` 10/10 (the `_stick`/`_s` provenance this feature
reads). `witness_cinema_bands.js` B5/B7 FAIL — confirmed **pre-existing**, not caused by this change:
stashed this feature's edits and reran on the identical base commit, same two failures, same numbers
(peak=104.0 deg/frame, aimErr pattern identical) — a real baseline defect in that witness/path shape,
tracked separately, not this session's to fix.

**`witness_maxq_mp4.js` — environmental, not a regression, verified by direct baseline comparison
(not assumed):** both CASE A and CASE B timed out at their own internal 240s cap under real machine
load (load avg 6.66, 26 concurrent chrome/node processes from other agents at the time — the same
condition #1138's DONE entry above already documented as making this class of full-bake witness
unreliable). Zero page errors both runs — not a crash, a genuinely slow frame cook under contention.
Verified NOT caused by this change: swapped this branch's `effects.js`/`cinema_maxq.js` back to the
pre-change commit (`8f31606`) in the same loaded environment and reran — CASE A failed identically
(elapsed 243251ms vs this change's 243289ms, same `§MAXQ_MP4 configured/encoded/mux: NONE` signature).
Restored this branch's files immediately after (verified `git status --short` clean against HEAD).

**PR:** #1143, merged `1768db4` (verified via `gh pr view --json state,mergeable,autoMergeRequest`
showing `state:MERGED` + `git show origin/main:viewer/effects.js` containing 4 `§CPE_STICK_APPROACH`
hits + `git show origin/main:viewer/sw.js` showing v924 — not fire-and-assume). CI (`fast-checks`,
`e2e-tests`) both passed before auto-merge landed. **Deploy:** sw.js CACHE_VERSION v923 → v924
(effects.js + cinema_maxq.js are both precached).
PR: https://github.com/red1oon/bim-ootb/pull/1143

## ✅ DONE 2026-08-02 — §CPE_MAXQ_STATUS_DAY_LABEL (Day # + room label on the bake HUD)

Same family as §CPE_STICK_APPROACH directly above: two more live values appended to the SAME
per-frame MaxQ bake status line, while a bake is running (NOT the exported video — that overlay
path was already confirmed correct and untouched). User asked for the current **Day #** and the
current **room label** to be visible during the cook, the same way stick-approach already is.

**Grounded in already-computed values, nothing recomputed:** `cinema_maxq.js`'s per-frame loop
already computes `_dayInfo` (via `A.dayCounterAt(_bkMs, ...)`, null when the day-counter is off for
this bake — `_dayPos === 'off'`) and `_titleInfo` (via `A.roomTitleOpacityAt(_titleSegs, i/fps)`,
returning `{name, guid, opacity}` or null between rooms / when §CPE_ROOM_TITLE is off) — both
purely for the `_captureFrame(w, h, _titleInfo, _dayInfo)` canvas-compositing call that already
existed. This feature reads those SAME two variables at the SAME point in the loop where the
stick-approach clause is appended — no second computation, no new state.

**Implementation:** `cinema_maxq.js` gets one new pure function, `_maxqStatusDayRoomSegs(dayInfo,
titleInfo)`, declared next to `_status()` and exposed on `window.APP` (as
`maxqStatusDayRoomSegs`) through the file's existing `_attach` `setInterval` poll — the same
"APP may not exist at parse time" pattern `startMaxQualityOrbit`/`ghostGroundArm`/etc. already use
(⚠ a first attempt assigned `window.APP.maxqStatusDayRoomSegs` directly at module top-level and
would have thrown `TypeError: Cannot set properties of undefined` — `main.js` creates `window.APP`
in a LATER `<script>` tag than `cinema_maxq.js`; caught before commit by checking every other
top-level `window.APP.*` assignment in the file, all of which go through `_attach`). The formatter
returns `{dayTxt, roomTxt}`:
- `dayTxt = dayInfo ? ', Day ' + dayInfo.day + '/' + dayInfo.totalDays : ''`
- `roomTxt = (titleInfo && titleInfo.name) ? ', "' + titleInfo.name + '"' : ''`

Both are appended into the existing `_status(...)` call, ordered Day → room label → stick-approach
(existing segments untouched). Exposing this as a pure, witnessable function follows the exact
precedent `A.dayCounterAt`/`A.roomTitleOpacityAt`/`stickApproachAt` already set — the witness gates
the real formatter directly, no live bake needed.

**Before / after (example, all three live features present):**
- Before: `🎬 MaxQ frame 342/576 — 210s, ~45s left, approaching Stick 4/9 (Alt+C / cinema icon
  cancels + saves partial)`
- After: `🎬 MaxQ frame 342/576 — 210s, ~45s left, Day 42/214, "Level 2 R3", approaching Stick 4/9
  (Alt+C / cinema icon cancels + saves partial)` — this exact string is asserted verbatim by
  witness G-DRL-7 below, not paraphrased.

**Witness — `witness_cpe_maxq_status_day_label.js` (new), G-DRL-1..7, 11/11 GREEN, RED confirmed
pre-fix** (`git stash` reverting only `cinema_maxq.js` → `T0 module loaded` fails, `maxqStatusDayRoomSegs`
absent, exit 1 — then `git stash pop` restored and reran GREEN): G-DRL-1 Day # at day-1/mid-span/
last-day checkpoints, exact `dayInfo.day`/`dayInfo.totalDays` echo, no off-by-one on the final day.
G-DRL-2 day-counter off (`dayInfo=null`) → empty segment, never "Day null/null". G-DRL-3 room label
present → exactly `, "Level 2 R3"`. G-DRL-4 room label absent (`titleInfo=null`) → empty segment.
G-DRL-5 **the gap case**: `titleInfo` a real non-null object but with an empty/null `.name` (mid-
crossfade with nothing covering the frame) → still empty, never `', ""'` — a present-but-nameless
object must be told apart from an absent one, and both must produce nothing. G-DRL-6 a 4-frame
sequence (day-counter on throughout; room label on → gap → on(different room) → off) proving the
segments track frame-to-frame, not just in isolation — the gap frame's room segment goes empty and
the NEXT frame's real room recovers cleanly, no staleness. G-DRL-7 composition order: both segments
present, assembled into the exact spec status line, asserted Day-index < room-index < stick-index.

**Regression, all green:** `witness_cpe_stick_approach.js` 7/7 (needed an external server —
`feedback_witness_needs_external_server_port.md` — self-served a temp dual-root server: worktree
code first, `~/bim-ootb` fallback for gitignored `buildings/*.db`, same technique
`witness_cpe_day_counter.js` already uses internally). `witness_cpe_day_counter.js` 17/17.
`witness_cpe_room_title_collective.js` all 7 checks green (self-serving, no server needed).

**PR:** #1145, merged `d128648` (verified via `gh pr view --json state,mergeCommit,mergedAt` showing
`state:MERGED` + `git show origin/main:viewer/sw.js` showing `CACHE_VERSION = 'v926'` +
`git show origin/main:viewer/cinema_maxq.js | grep -c CPE_MAXQ_STATUS_DAY_LABEL` = 3 — not
fire-and-assume). CI (`fast-checks`, `e2e-tests`) both passed before auto-merge landed. **Deploy:**
sw.js CACHE_VERSION v925 → v926 (no new precached files — `cinema_maxq.js` was already listed).
PR: https://github.com/red1oon/bim-ootb/pull/1145

# ✅ SESSION 2026-08-03 — §CPE_BUILDUP "fast start, slow middle" investigated (NO DEFECT FOUND) + §CPE_PACE_SWING_SOFTEN (direct tuning, 1.6→1.45)

**Bug report:** user, on a real Hospital §MAXQ bake: the buildup reveal (elements appearing as the
film plays) starts too FAST, then the MIDDLE is relatively SLOW. Ground truth from that session's own
logs: `§CPE_WORK_SCHEDULE workInFirst10%OfCalendar=0.6%` (this model's raw calendar is extremely
bursty — exactly what `§CPE_BUILDUP_WORK_PACED` (PR #1116) was built to fix by pacing on ELEMENT
INDEX instead of calendar days), `§CINEMA_PACING natural=148.5s = dive 8.7 + spin 0.8 + walk 117.3
+ pullback 13.7 + orbit 8.0`, `§CPE_BUILDUP_TOPOUT topoutU=0.938`.

## Part 1 — is the buildup ELEMENT-PLACEMENT RATE actually uneven? Measured: NO.

Read `_workCursorAt`/`_buildupTAt` in `viewer/cinema_maxq.js` (§CPE_BUILDUP_WORK_PACED,
§CPE_BUILDUP_TOPOUT) — by construction, `bkT = min(1, tFilm/topoutU)` and `tFilm = i/(nFrames-1)`
is uniform per FRAME (constant fps), so the element-index target `k = round(bkT * total)` is
provably linear in real seconds. Confirmed no cross-contamination from `§CPE_NOISE_LAW`'s busy-
weighted camera pacing (`_walkBusy`/`_diveBusy`) — grepped, neither symbol appears anywhere in
`_workCursorAt`/`_buildupTAt`.

**Measured on the real Hospital DB** (`~/bim-ootb/buildings/Hospital_extracted.db`, 63,415 ops),
replaying the EXACT per-frame bake pipeline (`buildupTAt` then `buildupCursorAt`, nFrames=1905 —
the user's own log's frame count) and sampling `tmPlacedCount` every 20 frames:

| checkpoint (tFilm) | placed | rate (elements/frame) |
|---|---|---|
| 0.10 | 6,878 | 36.23 |
| 0.25 | 17,236 | 36.15 |
| 0.50 | 34,465 | 36.23 |
| 0.75 | 51,697 | 36.20 |

Full 20-frame-resolution sweep (0→1755, the whole pre-topout film): rate stayed in **36.15–36.30
elements/frame, worst deviation 0.7%** — a flat line, not fast-then-slow. Post-topout (frames
1760–1904): placed stays pinned at 63,415/63,415 (the designed dwell). `tmWorkSchedule().ends` tie-
cluster check: **49,903 distinct timestamps / 63,415 ops, largest tied group = 9, median group = 1**
— ruled out the other candidate mechanism (a burst-then-plateau from many ops sharing one `end_ts`,
since `tmPlacedCount` counts by `end_ts <= cursor`); the ties are too small to matter.

**Conclusion: the buildup index-pacing mapping is not the defect — it already delivers what its
own spec promises, an even elements-per-second rate, measured to within noise.** No code change
made to `_workCursorAt`/`_buildupTAt`/`_buildupTopoutU`. Root-cause read (not directly measured,
stated as the most likely explanation): the CAMERA beat structure makes a genuinely flat placement
rate LOOK uneven — the dive is a fast ~8.7s swoop covering a lot of ground quickly (reads as
"fast"), the walk is a slow deliberate ~117s amble through the SAME even rate (reads as "slow"
purely because the camera itself creeps), and the walk's own busy-area slowdown (Part 2 below)
most likely compounds this further.

**Witness:** extended `witness_cpe_work_pacing.js` (not duplicated — this is the file G-WP-1..7
already live in) with **G-WP-8** (frame-by-frame reveal rate stays within a 25% band of its own
mean across the pre-topout film — real numbers logged, not just pass/fail) and **G-WP-9** (the
post-topout dwell stays exactly flat at `total`). G-WP-8's rate uses a windowed block (not a raw
1-frame diff) — Duplex is small enough (1,119 ops/1,905 frames) that a literal per-frame diff is
pure integer-count noise, which isn't what a viewer perceives as "fast/slow" either. **Result:
`witness_cpe_work_pacing.js` 18/18 GREEN (Duplex 9/9, Hospital 9/9)** — real numbers in both logs,
not synthetic.

## Part 2 — §CPE_PACE_SWING_SOFTEN: direct tuning request, independent of Part 1's finding

Mid-task instruction: soften `CINEMA_PACE_SWING` (`viewer/effects.js`) — the "the noise density×depth
ratio that slows the camera walk in busy/dense areas" — "the slowdown is currently too strict." This
constant is extensively documented earlier in this file (§CPE_EVEN_TURN, §CPE_NOISE_LAW sessions) as
"the user's ONE pacing dial," reached at `1.6` after a real widen/narrow jerk trade-off ("widen
PACE_SWING, accept the stall, or accept more jerk") and flagged "not tunable by feel."

**Grounded, not guessed, per the ask.** The user's own suggested range (1.3-1.4x) was tested FIRST,
not assumed: at both 1.35 and 1.4, `witness_cpe_even_turn.js`'s **T5** (the fast-side jerk cap,
`1.5 * PACE_SWING`) goes RED on Duplex — the walk's real cost-parameterized step hits **3.0x its
own mean**, and the narrower cap (2.0x-2.025x at 1.35-1.4) flags a legitimate fast turn as a
discontinuity. Binary-searched from there: **1.5 safe, 1.45 safe, 1.4 unsafe** (repeated runs,
same result each time) → **settled on `CINEMA_PACE_SWING = 1.45`**, the largest reduction from 1.6
that introduces no new T5 failure on either regression building (Duplex, Terminal).

**Real before/after on Hospital** (`A.cinemaPathPlan(24, null)`, real `§CPE_WALK_BUDGET_NOISE_BLIND`
log line, `busy=0.432` both times — same building, same walk):

| | swing | busyMult | outSec |
|---|---|---|---|
| before | 1.6 | 1.2591 | 18.322s |
| after | 1.45 | 1.1943 | 17.380s |

A 25% cut in the busyness CORRECTION itself (`busyMult - 1`: 0.2591 → 0.1943), same mechanism
(`w = 1-1/PACE_SWING` in §CPE_EVEN_TURN still derives from this one constant — nothing duplicated,
nothing hand-tuned separately).

**Pre-existing gap found, NOT caused by this change, NOT fixed here:** `witness_cpe_even_turn.js`'s
**T6** (the SLOW-side stall floor, `1/PACE_SWING`) is RED at the ORIGINAL `1.6` baseline too —
confirmed by testing `origin/main` unmodified before touching anything (`git stash`, re-ran, same
FAIL at `swing=1.6`: "slowest frame is 49% of the ease's own prediction... floor is 62.5%"). Out of
scope for this task; named here for whoever picks up `§CPE_PACE_FLOOR` next.

**Witness mirrors updated to match** (`witness_cpe_even_turn.js` line ~157, `witness_cpe_noise_law.js`
line ~26) — neither witness can import the source constant, both hardcode a local copy that must be
kept in sync by hand; both were stale-checked and fixed as part of this change.

**Regression, all green:** `witness_cpe_noise_law.js` **10/10** (Duplex 5/5, Terminal 5/5).
`witness_cpe_even_turn.js` **8/10** (Duplex 4/5, Terminal 4/5) both BEFORE and AFTER this change —
identical pass/fail pattern, confirming T6 is untouched by this PR (same failure, same magnitude
class) and T5 (the one gate this change could plausibly break) stays green.

**Deploy:** sw.js CACHE_VERSION v926 → v927 (`effects.js` is precached). `EFFECTS_V` bumped v17→v18.

**PR:** https://github.com/red1oon/bim-ootb/pull/1147 — verify merge status before treating this as
landed (see this file's own standing rule: never fire-and-assume a PR merge).

# ✅ DONE 2026-08-03 — §CPE_GHOST_GROUND_TRIGGER: reverted to first-above-ground-element, not 5% share

**The complaint (user, twice, direct, from real bakes):** the ground plane stays x-ray/ghosted
"quite further on" than it should — it should go opaque essentially the MOMENT the first slab(s)
appear above ground. Real log evidence on Hospital: `revealFrac=0.05` — opaque only once 5% of ALL
above-ground work (3,123 elements) is placed.

**The historical tension (read in full before touching this threshold again):**
- `#1110` (`ed10bb9`/`fb2e053`) shipped the ORIGINAL rule: opaque at the first at-or-above-ground
  element (`tmFirstAboveGroundMs`, MIN(end_ts) over above-ground ops). Measured on Hospital:
  t=0.0162 — 2.4s of a 147.9s film.
- `#1112` (`74a8e27`/`6397e45`) REPLACED that with `§CPE_GHOST_GROUND_RATIO`: opaque once
  `GHOST_REVEAL_FRAC=0.05` (5%) of the model's own above-ground total is placed. This was a
  DELIBERATE, REASONED widening — the commit's own rationale: the first-element trigger fired
  "before the camera lands," judged too brief to be legible. Not a bug; a design call, measured
  and stated at the time.
- 2026-08-03: the user watched real bakes and said, twice, directly, that even 5% reads as "quite
  further on" than wanted. This is current, live, repeated testimony overriding a documented prior
  design rationale — per this task's own instruction, implemented literally (revert to
  first-above-ground-element), NOT split the difference at some self-chosen value between 1.6% and
  5%.
- **Flagged, not decided unilaterally:** #1112's "too early to be legible" concern was real and
  measured, not invented. Reverting trades back into that exact risk — a ~2-3s-of-100+s-film ghost
  window. Worth a look on a real bake to confirm the ghost still reads as intentional before it's
  gone. If it doesn't, the next lever is `GHOST_FADE_SEC` (currently 3.0 film-seconds, unchanged
  by this PR) or camera pacing near the opening — not re-widening the trigger back toward a ratio.

**The fix — `viewer/cinema_maxq.js` `_ghostGroundAt`:** dropped the `byWork` ratio curve
(`frac = placedAbove/aboveTotal`, gated at `GHOST_REVEAL_FRAC`) entirely. The function now runs a
single smoothstep (`byTime`, unchanged formula/constants — `GHOST_OPACITY=0.22`,
`GHOST_FADE_SEC=3.0`) from `_ggSpan.firstT`, which was ALREADY being computed from
`tmGroundSchedule`'s `firstAboveMs = sched.ends[0]` (`time_machine.js`, added in #1112 as
infrastructure but previously only used as a secondary time-floor under the byWork ratio gate) —
the identical `MIN(end_ts) over above-ground ops` value #1110's now-superseded
`tmFirstAboveGroundMs` computed. No new data path, no invented condition — this is the pre-#1112
diff's trigger, read via `git show 74a8e27`/`git show ed10bb9` before writing a line of code, wired
onto the already-shared `tmGroundSchedule` plumbing.

**Kept unchanged, confirmed by explicit check before editing:**
- Opacity MECHANICS (smoothstep math, `GHOST_OPACITY`, `GHOST_FADE_SEC`, `depthWrite` handling) —
  shared between the Alt+M bake and the `cinema_path_editor.js` REHEARSAL via the same
  `window.APP.ghostGroundArm/ghostGroundAt/ghostGroundRestore` exports (`cinema_maxq.js:1267-1269`,
  called from `cinema_path_editor.js:1286/1307/1330`). Only the THRESHOLD moved, confirming the
  task's own premise — no shared-rendering-code changes needed.
- All #1113-1115 hardening: degrade-not-disable fallback (`tmGroundSchedule` missing → coarse
  proxy, `firstAboveMs = bkState.projectStart`, i.e. essentially-immediate — consistent with, not
  contradicting, the new intent), every arm-refusal names itself in the log, lazy arm-on-first-tick
  (`_ggTried`), arm-while-hidden (`A.ground.visible` never gated).
- `effects.js`'s Alt+S still-photo shadow system — untouched, different lane, not read or edited.

**WITNESSED** — `witness_cpe_ghost_ground.js`, extended (not replaced) G-GG-8: computes, from the
SAME real `tmGroundSchedule` data the product uses, both (a) the new opaque-point and (b) where the
RETIRED 5%-share rule would have fired, as a real quantified RED-vs-GREEN — not a re-run of old
code, a direct read of the same schedule the old rule consumed:

| Building | first above-ground element (new trigger) | ground reaches opaque | retired 5%-rule would have fired | gap closed |
|---|---|---|---|---|
| Hospital | t=0.0227 | t=0.0550 (gap 0.0323, one fade window) | t=0.0648 (3,123rd above-ground element) | 0.0422 film-fraction, 3,122 elements |
| Duplex   | t=0.0083 | t=0.0400 (gap 0.0317, one fade window) | t=0.1315 (50th above-ground element) | 0.1232 film-fraction, 49 elements |

`witness_cpe_ghost_ground.js`: **Duplex 11/11, Hospital 11/11** (all 11 gates, including the
existing G-GG-1..7/9/10/11 hardening gates, unaffected by the trigger-only change).

**Regression:**
- `witness_cpe_buildup_topout.js` **4/4** — buildup pacing/topout mapping untouched (expected;
  this PR never touched that code).
- `witness_cpe_ok_bake.js` K3 — **FAILS**, but confirmed a PRE-EXISTING, UNRELATED flake: reproduced
  identically (2/2 runs) on a pristine, unmodified `origin/main` checkout at the exact commit this
  branch was based on AND rebased onto (`4d617b9`), with zero files from this change present. K3
  gates `cinema_path_editor.js`'s waypoint-apply guardrail (`§CPE_APPLIED none` on an untouched OK)
  — nothing this PR touched. Named here per this file's `§CPE_PACE_FLOOR`-style precedent (flag for
  whoever picks it up next), not fixed under this task's scope.

**Deploy:** sw.js CACHE_VERSION v927 → v928 (`cinema_maxq.js` is precached). `MAXQ_V` bumped v20→v21.

**PR:** https://github.com/red1oon/bim-ootb/pull/1148 — merged (`06a6c79`), verified via
`gh pr view 1148 --json mergedAt,mergeCommit,state` (`MERGED`, not just auto-merge-enabled).

**Worktree:** `/tmp/wt-ghost-ground-trigger` — pruned after merge verification (branch fully pushed,
tree clean, no other session found inside it).

## 2026-08-03 §GHOST_GROUND_LIVE_TRIGGER — #1148 was correct in isolation, broken live (RESOLVED)

**The report:** user watched a REAL Hospital MaxQ bake, not the witness. Log:
```
§CPE_DAY_COUNTER frame=60 day=50 of=214 pos=bl cursor=1771488418668
§CPE_BUILDUP frame=60/1820 t=0.035 cursor=1771488418668 placed=2238/63418 groundOpacity=0.220
```
`groundOpacity=0.220` is EXACTLY `GHOST_OPACITY` — the floor, `v=0`, not mid-fade — at `t=0.035`
with 2,238 elements already placed. #1148's own G-GG-8 measured the trigger firing at t≈0.0227 and
reaching full opacity by t≈0.0550 on Hospital; t=0.035 sits BETWEEN those, where the ground should
already be mid-ramp. #1148's code (`rule=first above-ground element`) was confirmed present and
unmodified on `origin/main` — the code hadn't regressed, the live BEHAVIOR had never matched what
G-GG-8 measured.

**Root cause, found from real logging (not guessed):** `_ghostGroundArm` (`viewer/cinema_maxq.js`)
computed the trigger threshold ONCE, as a CALENDAR-TIME fraction:
`firstT = (sched.firstAboveMs - bkState.projectStart) / span` — both `firstAboveMs` and `span` are
epoch-ms, so `firstT` answers "what fraction of the CALENDAR has elapsed when the first
above-ground op's `end_ts` occurs." `_ghostGroundAt` then compared this against `tFilm` every
frame. That was correct back when the buildup cursor stepped linearly through the calendar — but
**`§CPE_BUILDUP_WORK_PACED` landed the SAME DAY as #1148** and changed `tFilm` into an
ELEMENTS-PLACED fraction instead (`_workCursorAt`: `t=0.10` means the 10th-percentile element by
completion order, not 10% of the calendar — confirmed directly: `t=0.035`,
`placed=2238/63418=0.0353≈t`). Two different clocks were being compared directly, and #1148's own
witness (G-GG-8) never caught it because it fed synthetic `t` values straight into `ghostGroundAt`
in isolation — it never replayed a REAL cursor the way the bake loop actually drives it. Measured
divergence on the real schedules: Hospital `calendarFractionT=0.0218` vs the CORRECT
`elementsFractionT=0.0074` (rank 468/63,415); Duplex `calendarFractionT=0.0083` vs
`elementsFractionT=0.0052` (rank 6/1,143) — on both buildings the old rule stayed ghosted LONGER
than correct, matching the user's exact observation.

**New diagnostic logging added (the user explicitly asked for this, not just the fix):**
`§GHOST_GROUND_TICK` — periodic, every ~5 FILM seconds while the ground is still ghosted/fading,
shows `tFilm`, `firstT`, `cursorMs`, `firstAboveMs`, `fired`, `fallback`, `opacity` — the exact gap
that made this bug take this long to pin down (previously ONLY an "armed" and a "restored" line
existed, nothing in between). `§GHOST_GROUND_TRIGGER_FIRED` — one-shot, logged the exact frame the
trigger condition first becomes true, with `cursorConfirms=1/0` cross-checking the precomputed
threshold against the real cursor independently.

**The fix — `viewer/cinema_maxq.js`:** `_ghostGroundArm` now precomputes the trigger threshold in
the SAME domain `tFilm` is actually in: when work-pacing is armed (`_wpSched` present — reused via
`_workPacingArm()`, not re-derived), binary-search `sched.firstAboveMs`'s RANK within
`_wpSched.ends` (the full sorted end_ts order every op is placed in) and use `rank/total` — this is
provably the exact value at which `_workCursorAt(elementsFirstT) === firstAboveMs`, i.e. the same
indexing the bake loop's own cursor mapping uses. When work-pacing is NOT armed, falls back to the
calendar-fraction (mirroring `_workCursorAt`'s own degrade branch) — same "degrade, don't disable"
discipline as #1113-1115. `_ghostGroundAt` compares `tFilm` against this single precomputed
`_ggSpan.firstT`, unchanged shape otherwise (still one smoothstep, still `GHOST_OPACITY`/
`GHOST_FADE_SEC` unchanged).

**A live-latch design was tried and rejected before committing** (per an early coordinator
suggestion: "when any above-ground gets rendered, off — foolproof, state not clock"). Implemented
as `_ggFiredAtT = tFilm` on the first frame the real cursor crossed `firstAboveMs`, then faded from
that latched value. This BROKE the pre-existing `G-GG-6` gate (preview/bake curve agreement):
latching on "whatever `tFilm` the function first happens to be called with" makes the fade curve
depend on sampling density — exactly the class of bug G-GG-6 was written to catch (measured
2026-07-31, a 2219-frame bake vs a 600-frame rehearsal tracing different curves for the identical
film under an earlier per-call rate limiter). Caught by re-running the FULL witness suite before
committing, not assumed safe. Reverted to the precomputed-constant design above; `cursorMs` is
still threaded through as a parameter but used ONLY for the confirmatory one-shot log, never to
move the threshold.

**Real per-frame evidence (Hospital, from the witness's new G-GG-12 replay — real cursors from
`A.buildupCursorAt`, the same call the bake loop makes, not synthetic `t` values):**
```
armed rule=first above-ground element aboveOps=62450 belowOps=965 firstAboveMs=1654644218000
  triggerT=0.0074 (domain=elements-placed) calendarFractionT=0.0218 elementsFractionT=0.0074(rank 468/63415)
G-GG-12c REGRESSION PROOF: old (calendar-fraction, #1148) would fire at frame 9 (t=0.0225)
  | new (real cursor, this fix) fires at frame 3 (t=0.0075) | frame gap=6
```
Before the fix's threshold is crossed, opacity is pinned EXACTLY at `0.22` on every real-cursor
frame (G-GG-12a); once crossed, opacity rises monotonically to `1.0` by end of film (G-GG-12b).

**WITNESSED** — `witness_cpe_ghost_ground.js` extended with:
- **G-GG-12a/b/c** — real per-frame replay (400 synthetic frames per building, real cursors via
  `A.buildupCursorAt`): opacity pinned at floor pre-trigger, monotone rise to opaque post-trigger,
  and the regression proof above (old vs new trigger frame, computed from real schedule data, not
  by invoking retired code).
- **G-GG-13** — asserts both new log lines (`§GHOST_GROUND_TRIGGER_FIRED`, `§GHOST_GROUND_TICK`)
  actually appear.
- Added a small read-only accessor, `window.APP.ghostGroundDebugState()`, so the witness asserts
  against the ACTUAL live `firstT` the fix computed rather than re-deriving its own guess.

**Duplex 15/15, Hospital 15/15 (30/30 total)** — every pre-existing #1148 gate (G-GG-1..11) stays
green alongside the four new ones.

**Regression:** `witness_cpe_buildup_topout.js` **4/4** — unaffected (exercises `_buildupTAt`, not
the ghost-ground trigger).

**Deploy:** sw.js CACHE_VERSION v928 → v929 (`cinema_maxq.js`/`cinema_path_editor.js` already
precached, no new files). `MAXQ_V` bumped v21→v22.

**PR:** https://github.com/red1oon/bim-ootb/pull/1149 — merged (`4f6e9a9`), verified via
`gh pr view 1149 --json state,mergedAt,mergeCommit` (`MERGED`, not just auto-merge-enabled).

**Worktree:** `/tmp/wt-ghost-ground-live-fix` — to be pruned after this record is written (branch
fully pushed, tree clean, nobody else found inside it).

## 2026-08-03 — #1149 re-verified on Terminal (a different building than #1149's own Duplex/Hospital
gates) after user report "still does not work" — NO DEFECT FOUND, confirmed with real material +
pixel evidence, not just re-reading the trigger logic

**The report:** user re-tested #1149 on Terminal and said "still does not work" — but their OWN pasted
console log already showed the trigger firing early and correctly (`§GHOST_GROUND_TRIGGER_FIRED
tFilm=0.0099` — under 1% into an 828-frame film). Two candidate explanations were named up front:
(1) the user simply hadn't looked past frame ~6-50 (the ~3s fade window is a sliver of an ~828-frame
film), or (2) a real "logged vs rendered" clobber — the SAME bug class already found once that same
day in a different feature (room-title captions computed correctly but not reaching exported bake
frames) — where per-frame photoreal staging (`§GROUND_MAP`/`§GROUND_ALBEDO`/`§GROUND_COLOR_ORDER_FIX`,
all firing every single frame per the log) could be resetting `A.ground.material.opacity/transparent`
back to something else AFTER `_ghostGroundAt` sets it but BEFORE `_captureFrame()` reads the canvas.

**Static read first:** traced the actual per-frame call order in `cinema_maxq.js`'s bake loop —
`A.stopStillRefine(true)` (teardown of the PREVIOUS frame, line 1026) → `_ghostGroundAt(...)` (sets
opacity/transparent/depthWrite, line 1062) → `A.startStillRefine()` (re-stages photoreal — this IS
where `_applyPhotoStaging()` runs `_applyGroundTexture('paved')`/`_setGroundColor(...)`, line 1073) →
cook (TAA/AO fold + `_reassertPhotoShadowCoverage`/`_reassertPhotoMatBoost`/`_reassertPhotoEnvMap`
ticks) → `_captureFrame()` → `A._composer.render()` (line 1083). Staging genuinely runs AFTER the
ghost-set and genuinely restages every frame (confirmed: `A.stopStillRefine(true)` never passes
`keepStaging`, so `_teardownPhotoStaging()` — full revert — fires every frame, then `startStillRefine`
fully re-stages) — so the clobber SHAPE the user's hypothesis describes is structurally possible. But
reading every writer of `A.ground.material` in `effects.js`/`tools.js`: `_setGroundColor` and
`_applyGroundTexture` (the functions behind `§GROUND_MAP`/`§GROUND_ALBEDO`/`§GROUND_COLOR_ORDER_FIX`)
only ever touch `.color`/`.map`/`.visible` — never `.opacity`/`.transparent`/`.depthWrite`. The three
per-tick reassert functions touch `envMapIntensity`/`roughness`/`envMap`/`castShadow` on OTHER
materials, never ground opacity. `_ghostGroundAt`/`_ghostGroundRestore` are the ONLY two writers of
ground opacity/transparent/depthWrite in the whole codebase.

**Real-browser confirmation (not just code-reading, per this project's whitebox law):** built a
harness (`/tmp/wt-ghost-ground-clobber-check`, fresh `origin/main` @ `d4da218`, includes #1149) that
loads Terminal with real Time Machine data, arms `§CPE_GHOST_GROUND` for real (`aboveOps=47577
belowOps=851 firstAboveMs=1674888960000 triggerT=0.0081`), then replays the EXACT real bake-loop
sequence — teardown → `_ghostGroundAt` → `startStillRefine` (real staging) → ~400ms of real cook
ticks → `A._composer.render()` — sampling `A.ground.material.{opacity,transparent,depthWrite}` at
all four checkpoints, across 10 frames spanning `t=0.0005` (well before trigger) through `t=0.3` (well
after). **Result: identical at all four checkpoints, every sampled frame, every trigger phase** — e.g.
`t=0.02`: `{opacity:0.3147, transparent:true, depthWrite:false}` unchanged from ghost-set through
staging through cook through the actual composer render; `t=0.1`: `{opacity:1, transparent:false,
depthWrite:true}` likewise unchanged. Zero clobbers across the full sweep.

**Pixel evidence** (camera pinned 80m directly above the ground-plane center, looking straight down,
same technique as the skyline-shadow `gl.readPixels` check earlier the same day): ghost frame
(`t=0.001`, opacity=0.22, transparent=true) → avg sampled pixel `[47,51,57]` (cool blue-grey, the
translucent ground blending with what's behind/below it); opaque frame (`t=0.9`, opacity=1,
transparent=false) → avg pixel `[22,15,11]` (warm dark brown, the ground's own paved-texture color
alone). The COLOR CHARACTER changes exactly as translucency-vs-opaque predicts — the opacity value
that's SET is the value that's RENDERED, confirmed in actual captured pixels, not just material state.

**§-log trace from the same run** matches the doc's own description of the per-frame cycle exactly:
every frame logs `§GROUND_MAP key=paved → §GROUND_ALBEDO → §GROUND_COLOR_ORDER_FIX → §PHOTO_STAGING
on`, then next frame's teardown logs `§GROUND_MAP key=none map=cleared → §GROUND_ALBEDO restored →
§PHOTO_STAGING off` — real, every frame, exactly as the user's pasted log showed — but this cycle is
entirely on the color/map/visibility channel; the ghost's `§GHOST_GROUND_TICK`/
`§GHOST_GROUND_TRIGGER_FIRED` opacity values ride through it untouched.

**Verdict: NO DEFECT. #1149's fix works correctly on Terminal, same as it does on Duplex/Hospital.**
The user's "still does not work" report is not explained by a rendering/clobber bug — evidence points
to explanation (1) named up front: the fade is real but occupies only ~45 frames (`GHOST_FADE_SEC=3.0`
× 15fps) out of an 828-frame film, starting under 1% in. No code change made — witness gates
untouched (still 30/30 per #1149's own record above). Worktree `/tmp/wt-ghost-ground-clobber-check`
pruned after this record was written (test-only branch, never pushed).

