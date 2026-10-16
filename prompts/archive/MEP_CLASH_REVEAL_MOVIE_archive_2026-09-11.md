# ⚠ DO NOT REMOVE — ARCHIVE of prompts/MEP_CLASH_REVEAL_MOVIE.md §38-§56 (2026-09-08 through
2026-09-09 sessions), consolidated out of the live file on 2026-09-11 because it had grown to 4,669
lines (past the 2,400-line trigger the 2026-09-06 consolidation set). Everything here is
CLOSED/MERGED/FIXED history — the whole "screen furniture" spec (three fixed boxes, plate area,
fly-out beats, §38/§40) and the full flicker root-cause saga (§42-§54: five wrong mechanisms tried
and measured-disproved before the real cause — a datum plane() transform with no lateral-extent
guard — was found and fixed). Read it only when you need the full derivation/measurement behind a
line in the live file's compact recap. §56's two items (Measure box linger, storey-highlight
recognisability) were carried forward and closed in the live file's own §58.1/§58.5 — read those,
not this archive, for their current state.

### 38. ⛔ NEXT SESSION FIRST — two things the user saw in the full 720p film (2026-09-08, `Hospital_FULL_measure_720p_2026-09-08.mp4`)
> **USER:** *"It is good, works well mostly. Still slight flicker in that 9th onwards sec mark when the whole floor slab gets tinted
> but no info box giving its surface area (it is 2+3 wing shape thus no other dims looks feasible). Also during the fly out the wing
> spans should have been marked, even the edge of roof to window sill etc as the canvas was clean for that."*

**38.1 The plate beat at 9.38 s: the tint flickers, and the label was not seen.**
What the log says (`out/Hospital_FULL_measure_2026-09-08.log`): `§SLAB_BEAT_PICK Level 6 @9.38`, `§SLAB_BEAT_TINT meshesTouched=1
(instance colour)`, `§SLAB_BEAT_LABEL on 9.42 ndc=(0.37,0.06)`, `off 14.84 (crossing left the frame)`, envelope done 11.59. So the
label WAS composited — as a textured plane lying IN the plate's plane (§26.2/§25.1) — and the user did not perceive it: from a
camera 63 m off and only just above the roof line it is a foreshortened sliver. Two defects, two hypotheses to MEASURE, not guess:
- **Flicker.** (a) the X diagonals are `LineSegments` 0.03 m above the top face of a 98 m plate, depth-tested — classic z-fight
  at that depth range (use `polygonOffset` or raise to ≥ 0.15 m and re-measure); (b) the tint is an InstancedMesh colour re-lerped
  EVERY frame through the envelope (`setColorAt` + `instanceColor.needsUpdate`) — set once at fade-in and once at fade-out instead.
  Measure first: per-frame pixel variance inside the plate's projected polygon over 9.4–11.6 s in the film (the §26.12 method),
  before and after each change. The datum's own entry latch fires at 10.75 s inside this window — check it is not the datum's fade
  being read as flicker (the §-log says the datum went 74→58 marks smoothly, 0 rises).
- **The info box.** Replace the in-plane textured plane with the SAME 2D panel the indoor hall uses (`A.flythruDrawPanel` at the
  projected crossing, clamped on-screen) — it is what the user calls an "info box" and it is what they saw work for the hall.
  **Its number is the plate's SURFACE AREA, not X × Y**: the plate is a 2+3 wing shape, so the bbox rectangle (and therefore the
  X across it, §26.3's honesty device) is the wrong statement here. Sources, in order of honesty: (1) the slab's own mesh, projected
  to XY — triangle areas summed (the mesh is in the scene during a bake; `A.collectMeshes` by guid / instance id); (2) the storey's
  `storey_walkable_raster` area as a stated LOWER bound; (3) the bbox product only with "(est., bbox)" — never bare. The X diagonals
  go with the bbox: with a true area there is nothing for them to discharge; draw the plate's OUTLINE instead if an edge is wanted.
  Witness: `witness_slab_beat.js` gains "label area = mesh footprint area within 1 %", "panel on-screen at the pop", and the
  flicker metric above as a numeric threshold (state it after measuring the clean film's own variance).

**38.2 The fly-out is a clean canvas and nothing was measured on it.** §37.4 measured the camera INSIDE the building box for the
pull-out/pull-back (69–148.6 s) and so drew nothing; the user saw the WINGS from there — above the roofs, looking down the blocks. The
box test (column-grid plan below the top storey) was right for the 2D setting-out sheet and wrong as a gate for exterior dimensioning.
New beat family, §14-slotted into 69–148 s: **wing spans and facade heights.**
- **Wings**: the plate's plan is 2+3 wings; find them as the connected/rectangular components of the largest plate's footprint
  (the slab mesh projected to XY, or the storey raster's row/column runs) — each wing = a rectangle with a real length and width.
  Cue each wing ONCE with an arrowed length along its own axis (§7's standard cue), one wing per slot, longest-legible-first, the
  same held-legibility rule as §29.8 (t, t+1.1, t+2.1 in frame).
- **Roof edge to window sill**: a vertical dimension on the facade in view — from the roof slab's top edge down to the nearest
  `IfcWindow` sill (bbox bottom) on that facade, both from the DB; one per facade, guarded against the datum's storey figures.
- Placement uses `plan.poseAt` over 69–148 s at 0.25 s like the indoor beats; a subject is cued where it is largest AND held.
- Witness: `witness_flyout_beats.js` — wing lengths equal the component extents, the sill height equals the placed window's
  bbox bottom, no slot overlaps any other layer, each cue composites inside its envelope. PoC first (selection, no GPU), then the
  module, then one 720p bake on the user's go.

**Order:** 38.1 (flicker measured → fixed; area panel), then 38.2. Both ride Measure. Bakes stay user-gated.

**38.1a USER'S DIAGNOSIS (2026-09-08, after §38.1 was written): *"I think it is because it is messed up by the status that flickers
around. Thus it should be its own info panel."*** Ruling: the Measure figures get a DEDICATED info panel — one fixed screen region
owned by Measure alone — not the shared status/caption area that the per-frame HUD (`§CPE_BIG_STATS` card rotation, clash pair
cards, room title, day counter) redraws and repositions every frame. The plate's area, the hall's walkable, the stair going, the door
type, the clear height, the wing spans all post to that one panel while their beat is live; the in-model marks (tint, X/outline,
arrows) stay where they are. Witness: the panel's rectangle is constant for a whole beat (assert its x/y/w/h across the beat's
frames), it never overlaps the clash-card or big-stats rectangles (`§CLASH_LABELS panels=` and the stats panel already log theirs),
and it is empty (not drawn) when no Measure beat is live. Measure the flicker again AFTER this move — the user's reading is that the
churn comes from the neighbouring status, not from the tint itself; the z-fight and per-frame colour suspects in §38.1 are then the
fallback, not the first cut.

**38.1b USER (same minute): *"Status should also be deprecated and appear as below the HUD in its own box like that organises
Storey / Room / BuildUp action etc."*** Ruling on the film's screen furniture, three fixed boxes, none of them roaming:
1. **HUD** — the existing big-stats / clash-card panel, where it is.
2. **Status box, directly BELOW the HUD** — replaces today's free-floating status/caption text (room title, storey caption, buildup
   day/action, disc-parade caption). One box, fixed rectangle, rows in a fixed order: `Storey · Room · Build-up action · …`; a row
   is blank, never removed, when it has nothing to say, so the box never changes size or position.
3. **Measure info panel** (§38.1a) — its own box, elsewhere on screen, fixed rectangle, Measure figures only.
Nothing else writes text to the frame outside those three boxes except the in-model marks. Witness: the three rectangles are
constant across the whole film (assert per frame from their own `§`-lines), pairwise non-overlapping, and every 2D text draw in
`_captureFrame` is attributable to one of them (`§HUD_BOX`, `§STATUS_BOX`, `§MEASURE_BOX` lines carry x/y/w/h). This precedes
38.1's flicker measurement: move the furniture first, then measure the plate again.

### 39. TWO FINDINGS FROM THE TERMINAL + HOSPITAL FULL BAKES (2026-09-08, evening — recorded, not fixed)
Both found by reading the shipped `§`-log of two full all-systems bakes the user asked for as a baseline:
`Terminal_FULL_allsystems_2026-09-08.{mp4,log}` (52.8 s, 1,266 f, commit `5ad96d6a`, sw v1166) and
`Hospital_FULL_measure_2026-09-08.log`. Films and logs are in `~/Downloads/`.

**39.0 What the Terminal baseline confirmed, so it is not re-checked.** `§36 W1`'s flicker fix HOLDS on a
third, untuned building: max frame-to-frame `|Δdrawn|` = **3**, and only **13 of 80** frames change at all,
against HHS's pre-fix swing of **16 in ten frames** (40→6→22). Chain exact — X 54.508 · Y 39.481 ·
Z 19.300, all `delta=0.0000`. `ofNominal` **77%/77%/77%** (HHS was 52%). Zero
`DATUM_DRAW/AT/BUILD failed`. Clash data is RICHER than Hospital's: `trueClash=505 markers=1010
discPairs=12 falsePositivesExcluded=264` against Hospital's 270.

**39.1 ⛔ THE STOREY-REVEAL STATS QUERY THE WRONG STOREYS — `doors=0`, and it is not a counting bug.**
> **USER:** *"it does flash out the main 4 floors just that the cam pov was too near but there was zero
> doors that is what i saw rather."* · *"Perhaps the Room injection was not complete?"*
> **Room injection is NOT the cause** — `rooms_meta` reads `room_count=47`, built `2026-09-08T01:00:10Z`
> (walker v3), with `rel_contained_in_space=1429`. The rooms exist.

MEASURED on Terminal. Every `IfcDoor` in the model sits on a storey the reveal never asked about:
| storey carrying doors | doors | in the reveal's shown set? |
|---|---|---|
| `Aras Tanah` | 63 | **dropped** |
| `Aras 01` | 29 | **dropped** |
| `Aras 02` | 27 | **dropped** |
| `Aras 03` | 9 | **dropped** |
| `Aras 04` | 7 | **dropped** |
| **total** | **135** | **0 shown** |

The five the card cycled were `00 Aras Asas`, `GROUND FLOOR LEVEL`, `Aras Kedai`, `Ground Lev`,
`Level Kedai` — **zero intersection with the door-bearing set**. So `§STOREY_REVEAL_STATS … doors=0
rooms=0 footprint=n/a` is arithmetically CORRECT for the storeys it was handed; it was handed the wrong
five.

**Root cause is §24.12's `§LEVELSPLIT` federation fault, reaching a second consumer.**
`§STOREY_REVEAL_LIST n=22` on a ~6-storey building — the storey table carries duplicate and
alias names across two languages. `§STOREY_REVEAL_FIT windowSec=5.31 storeysAvailable=22 shown=5
slotSec=1.06 TRUNCATED` takes the first five by elevation, which on this table is five ground-level
aliases before it ever reaches `Aras Tanah`. **The datum layer already handles this fault by NAMING it
and refusing to invent a datum (§24.12). The storey reveal has no equivalent — it takes what the table
gives.** That asymmetry is the defect, not the reveal's arithmetic.

⚠ **AND THE TINT AND THE STATS DISAGREE, which is the sharper half.** The same five names produced
`§STOREY_REVEAL_TINT … meshesTouched=` **6 / 1335 / 83 / 14 / 225** — real geometry, and the user
confirms the main floors visibly tinted — while `§STOREY_REVEAL_STATS` returned `footprint=n/a` for four
of the five. **One of the two resolvers is right and they are not the same resolver.** Find which, before
touching either. (A first reading of the low `meshesTouched` values as "the reveal drew nothing" was
wrong and is corrected here: the tint worked; the stats query did not.)

**What a fix must NOT do:** choose between duplicate storey names. §24.12 ruled that resolving a
two-datum storey table is invention. The honest options are to (a) select storeys by the elevation
CLUSTER rather than the raw row, the way `§FLYTHRU_DATUM_LEVELVOTE` already does (modal name, modal
elevation — `clusters=8 needingAVote=5` on Hospital), or (b) rank candidates by their own content
(`meshesTouched`, doors, raster area) so an empty alias cannot win a slot, and say so when one is
skipped. Either way the selector must report what it dropped and why — `TRUNCATED dropped=[…]` names
them but does not say they were empty.

**39.2 ⚠ THE 2D DATUM RE-APPEARS LATE IN THE FILM — `§FLYTHRU_DATUM_LIFE2`, and it should be settled by
the user before it ships.**
> **USER:** *"what u think of the 2D grid still persisting at the end of the movie?"*

It is **not** persistence and not a leak. It is a second scheduled showing, MEASURED in
`Hospital_FULL_measure_2026-09-08.log`:
`§FLYTHRU_DATUM_LIFE2 search=90.53-182.74s (flyback → storey-reveal)` →
`start filmSec=148.70 end=169.10s (hold 18.4s + 2s fade)`, last `drawn=74` at 169.08 s.

**The recorded position, and why this needs a ruling rather than a patch — two settled instructions
pull opposite ways here:**
- **§24.9 (user, 2026-09-07, marked ⛔ RETRACTED against re-opening):** *"During buildup, they are
  occluded and fade off. Their initial appearance function is to give the user a sense of its BIM
  capable."* — **"Second zero is the point"**, and the section explicitly says *do not re-open the
  lifetime*.
- **§37 §MEASURE_TO_THE_END (user, 2026-09-08):** *"extend the Measure coverage all till the end."*

`LIFE2` satisfies the second by repeating the first, and that is the part worth questioning. **The
datum's meaning is structural, not decorative: §17.5 makes the rising build OCCLUDE the setting-out grid,
and that occlusion is what tells the viewer the grid is BEHIND the building rather than painted on the
lens.** At second zero the model is 3 meshes and the reading works. At 148.70 s the building is complete
and nothing is left to reveal it — the grid sits over a finished model, which is precisely the
"painted on the lens" reading the original design was built to avoid.
**So: extending MEASURE to the end is right; re-showing the DATUM is the wrong instrument for it.** The
end of the film wants measurements OF THE FINISHED THING — which §38.2 already specifies in detail (wing
spans, roof-edge-to-sill facade heights, on the clean fly-out canvas the user asked for). Those are new
statements; `LIFE2` is the opening statement said twice.
**✅ RULED BY THE USER, SAME DAY — `LIFE2` STAYS. The concern above is withdrawn, and the reason is
recorded because it is the right one.**
> **USER, 2026-09-08:** *"Since it is just to show a while, i think it serves engineering minds a
> purpose, to view again this time in full built up its markings."*

That is exactly the reason `LIFE2` needed, and it defeats the objection rather than overruling it: **an
engineer reads a setting-out drawing AGAINST the built thing** — gridline A-1 checked against the column
that actually stands on it. At second zero there is nothing to check the drawing against; at 148.70 s
there is. So the two showings make DIFFERENT statements — *this is the setting-out* and *this is what got
built on it* — and §24.9's ⛔ (which forbids re-opening the LIFETIME of the opening beat) is not engaged.
Do not re-litigate this.

⚠ **THE ONE THING THAT FOLLOWS, AND IT IS A REAL RISK — depth behaviour cannot be the same in both
lives.** §17.5 makes the datum depth-test NORMALLY so the rising build occludes it; that occlusion is the
whole reading at second zero. **At 148.70 s the building is COMPLETE, so a depth-tested grid is occluded
by everything** — and `§FLYTHRU_DATUM_MARKS drawn=74` counts marks COMPOSITED, not marks VISIBLE. A
LIFE2 that logs a healthy 74 while showing almost nothing is precisely §24.12's `ofNominal` failure mode
(*"a bubble capped far below nominal still counted as drawn while being invisible"*), and the log as it
stands cannot tell the two apart.
**Measure before assuming it reads:** either sample per-frame visible-pixel coverage of the datum layer
inside LIFE2's window and compare it against LIFE1's, or have LIFE2 report an occlusion ratio of its own
(`§FLYTHRU_DATUM_LIFE2 visibleFrac=`). If it is being buried, the honest fix follows from the user's own
purpose — a drawing recalled to be READ must be legible, so LIFE2 (and only LIFE2) draws shine-through
(`depthTest:false`, §7's cue contract), while LIFE1 keeps the occlusion that gives second zero its
meaning. Two lives, two draw contracts, both deliberate — record it in `FLYTHRU_DRAW_CONTRACT` beside
§17.5's existing exemption so a later session does not "unify" them.

### 40. §38 IN ORDER — the furniture, the plate's area, the fly-out. Spec + measurements (2026-09-08, session 7)
Branch `feat/measure-boxes` off `origin/main` @ `f1ac7ce1` (PRs #1697 + #1699 merged; sw v1168), worktree
`/tmp/wt-storey-reveal`. §38's order is kept: **40.0 measure the flicker → 40.1 the three boxes → 40.2 the
plate's area → 40.3 the fly-out beats.**

**40.0 ✅ THE FLICKER IS MEASURED, AND IT IS NEITHER OF §38.1's TWO SUSPECTS — nor §38.1a's.**
Measured on the film the user watched (`out/Hospital_FULL_measure_2026-09-08.mp4`, 4,699 f, 720p24) with
the §26.12 pixel method, no GPU and no new bake: `scripts/probe_plate_flicker.py` (frames → numpy) plus one
whole-film `ffmpeg signalstats` luma pass (`out/yavg.txt`, `out/plate_flicker.log`). The plate polygon is
the film's OWN `§SLAB_BEAT_DIAG corners=(-37.05,10.60,31.49) …`, projected through each frame's recorded
pose (`*_poses.json`, fov 60) with a near-plane clip — the camera flies OVER the plate, so an unclipped
probe calls every dive frame "behind camera" and reads VACUOUS (the first cut of this probe did exactly
that; it is in the file so the next session does not repeat it).
| what was measured | value | reading |
|---|---|---|
| amber fraction INSIDE the plate, over the envelope hold (env = 1.000, 10.04–10.96 s) | 0.806 0.808 **0.718 0.526 0.073** 0.800 0.805 **0.720 0.687** 0.807 0.804 **0.479** 0.802 … | with the envelope FLAT, the tint signal collapses to 9 % of its held value for ONE frame and is back the next |
| the same amber fraction OUTSIDE the plate polygon (control) | 0.323 0.320 **0.117 0.081 0.0014** 0.306 … | it moves in LOCKSTEP — so the event is not the plate's |
| envelope fit `amberIn = a·env + b` | `0.849·env − 0.117`, residStd **0.149**, residMaxAbs **0.659**, residStd/range **0.185** | 18.5 % of the signal's whole range is NOT explained by the envelope |
| frame-to-frame step | mean │Δ│ **0.0954** vs expected ramp step **0.0312** (excess 0.0642), max │Δ│ **0.727** | the churn is 3× the ramp it should be riding |
| the X diagonals' own 2 px band | mean 0.583 std 0.315 min **0.000** max 0.899 cv **0.540** max │Δ│ 0.844 | the X vanishes completely on those same frames |
| whole-film luma (`signalstats` YAVG, all 4,699 f) | **34 single-frame dips** (darker than BOTH neighbours by > 8 luma) = 0.72 % of the film; mean depth 21.2, max **70.8** | |
| where those 34 dips sit | **15 in 8.96–17.75 s** (the dive), 7 in 80.75–83.25 s (pull-out), 10 in 151.58–159.96 s (reveal round / LIFE2), 2 isolated (39.46, 73.67) | the 9 s mark the user named carries the densest cluster in the film — 10 dips in 9–15 s against 1.0 expected if they were uniform |
| is a dip a global exposure scale? | f231→f232 channel ratios **0.572 / 0.572 / 0.582** (achromatic, 43 % of the light gone) but per-pixel ratio p10 0.171 / p50 0.478 / p90 1.467 | uniformly dimmer in colour, NOT uniform per pixel — some pixels brighten |
**Verdict — the three hypotheses on record are all REFUTED by this, and the ruling changes:**
- **§38.1(a) z-fight of the X diagonals** — refuted: a depth fight on 0.03 m lines cannot move `amberOut`,
  which is measured OUTSIDE the plate and moves identically. **Do not add `polygonOffset`.**
- **§38.1(b) the tint's per-frame `setColorAt` lerp** — refuted for the same reason, and by the envelope fit:
  on the flat hold the lerp writes the SAME colour every frame, yet the signal collapses.
- **§38.1a "the neighbouring status churns"** — refuted as the cause of THIS event: a 2D overlay redraw is
  confined to its own rectangle, and the measured darkening covers 55 % of ALL pixels spread evenly over a
  4×4 grid of the frame. (The status box is still worth building — §38.1b asked for it in its own right and
  §40.1 builds it — but it is not what made the plate flicker.)
- **What it actually is: single-frame WHOLE-FRAME render dips, ~0.7 % of frames, clustered where the scene
  is changing fastest.** The shipped log cannot tell a dipped frame from a good one — frames 231 (good) and
  232 (dipped 45.6 luma) carry the identical `§SHADOW_FRONTIER_AT_CAPTURE frontierGuids=3 …` line and nothing
  else, and `§MAXQ_QUALITY frames=4699 unconverged=0` calls the whole bake clean. **That is a §-log gap of
  the §4 "cannot report its own failure" class**, and it is the next thing to instrument: `_captureFrame`
  should record its own frame's mean luma beside the fold state it captured (`§MAXQ_FRAME_LUMA i= Y= foldMs=
  taa= ao=`), so the NEXT bake names its dipped frames instead of leaving them to a post-hoc ffmpeg pass.
  Root-causing the dip itself (the fold's explicit `A._composer.render()` in `_captureFrame` vs the
  accumulated still, or a shadow/env update landing inside the capture task) needs that instrumentation
  first — it is NOT guessed here.

**40.1 THE THREE FIXED BOXES — SPEC (implements §38.1b, and §38.1a's dedicated Measure panel).**
One owner, `viewer/cpe_film_boxes.js`, which decides all three rectangles from `(w, h, corner, armed)` and
NOTHING else — no text, no content, no per-frame input — so a rectangle cannot move when what it says changes.
- **`§HUD_BOX`** — the column that already exists (day counter → path overview → big-stats/clash card,
  `§CPE_HUD_ORDER`), unchanged in look and position. The box is the column's RESERVED slot: `w = 0.36·h`
  (the widest member, `cpe_resource_panel.js _box`), `x` at the chosen corner's margin `0.028·h`, `h` = the
  sum of the ARMED members' heights + gaps. Armed is decided ONCE per bake, not per frame — a film whose
  day counter drops out for a stretch must not move the boxes under it.
- **`§STATUS_BOX`** — the next slot in the SAME column, i.e. directly below the HUD for a top corner (and
  correspondingly further from the corner for a bottom one; the actual rect is logged either way). Same `x`
  and `w` as `§HUD_BOX`. FOUR fixed rows, fixed order, fixed height — a row is BLANK, never removed:
  1. `Storey` ← `A.storeyRevealCaptionAt` 2. `Room` ← `A.roomTitleOpacityAt`
  3. `Build-up` ← the Time-Machine frontier phase (`A.tmFrontierPhase`, today smuggled into the caption as
     `[phase]` by `roomTitleFinalText` — which is exactly what made the caption plate resize mid-shot)
  4. `Reveal` ← `A.cpeRevealCaptionAt` (the discipline parade). This is §38.1b's "…"; it is the one
     remaining caption source in the code, not an invented row.
  This RETIRES the centred lower-third caption plate as the film's status surface. `A.roomTitleCompositeOntoCanvas`
  stays exactly as it is (the live editor preview and six witnesses drive it); only the bake's `_captureFrame`
  stops calling it.
- **`§MEASURE_BOX`** — Measure figures ONLY, its own fixed rectangle in the corner diagonally opposite the
  HUD column (HUD `tr` → Measure bottom-left). `w = 0.34·h`, height fixed for a title + 4 rows. Every
  Measure module keeps calling `A.flythruDrawPanel(...)` unchanged; that function becomes a per-frame QUEUE
  and `_captureFrame` draws the queue into this one box. **The leader line dies with the roaming panel** —
  a leader from a fixed corner box to a subject 800 px away is a distraction, not a pointer; the in-model
  marks (dimension arrows, tint, outline) are unchanged and still say WHERE. `A.flythruCueCaptionAt`'s
  number stops going through the room-title caption and posts here, where it belongs.
  The box is NOT DRAWN AT ALL when no Measure beat is live (§38.1a), and says so: `§MEASURE_BOX … rows=0 idle`.
- **`§CLASH_LABELS` panels are the one exception, and it is stated rather than assumed:** they are anchored
  to a 3D contact with a leader and a dot, i.e. in-model marks that happen to carry two element names — the
  same family as the dimension arrows §38.1a explicitly leaves in place. They keep their own `panels=[i@x,y,wxh]`
  log line, which already reports their rectangles.
- **Witness `viewer/tests/witness_film_boxes.js`:** (a) each of the three rectangles is IDENTICAL across every
  frame of a whole film (driven over the real film's second range, not one frame); (b) the three are pairwise
  non-overlapping; (c) every 2D text draw in `_captureFrame` is attributable to one of the three or to the
  clash-label exception — asserted by driving `_captureFrame`'s draw chain through a recording 2D context stub
  and checking every `fillText` lands inside one of the four rectangles; (d) a status row with nothing to say
  is BLANK and the box's height does not change; (e) with no Measure beat live the Measure box draws nothing.
  It must be able to say INCONCLUSIVE — a run in which no frame had any text at all proves nothing.

**40.2 THE PLATE'S AREA — SPEC (implements §38.1's info box).** The slab beat's in-plane textured plane is
replaced by a `§MEASURE_BOX` posting, and its number becomes the plate's **mesh footprint area**, sourced in
§38.1's own order of honesty: (1) the slab's own mesh triangles projected to XY, summing only UP-FACING
triangles (world normal `ny > 0`) — summing all of them double-counts a closed solid's top and bottom;
(2) failing that, the storey's `storey_walkable_raster` area as a stated LOWER bound; (3) failing that, the
bbox product, and only ever written `(est., bbox)`. `§SLAB_BEAT_AREA src=mesh|raster|bbox up=… down=…
tris=… m2=… bboxM2=… ratio=…` prints all of it so the source is never guessed. The X diagonals go with the
bbox statement (§38.1: with a true area there is nothing for them to discharge) — the plate keeps its tint
and gains an OUTLINE. `witness_slab_beat.js` gains: the posted area equals the mesh footprint within 1 %;
the panel is on screen at the pop; the source is named.

**40.3 THE FLY-OUT BEATS — SPEC (implements §38.2), PoC BEFORE the module.** Window 69–148 s (Hospital),
`plan.poseAt` sampled at 0.25 s exactly as the indoor beats do; §14 slotting across every other layer;
one subject per 2.7 s slot, longest-legible-first, legibility HELD over (t, t+1.1, t+2.1).
- **Wing spans** — the wings are the rectangular components of the largest plate's footprint. The PoC
  (`scripts/poc_flyout_beats.js`, selection only, NO GPU) finds them by run-length decomposition of the
  storey raster the walkable table already holds, reports each component's extent, and states which ones
  clear the legibility bar in the window. Nothing is cued until the PoC's numbers are in this file.
- **Roof edge to window sill** — roof slab top edge down to the nearest `IfcWindow` bbox bottom on the
  facade in view, both straight from the DB, one per facade.
- Witness `viewer/tests/witness_flyout_beats.js`: wing lengths equal the component extents; the sill height
  equals the placed window's bbox bottom; no slot overlaps any other layer's window; every cue composites
  inside its own envelope.

**40.4 ✅ ALL THREE BUILT + WITNESSED (2026-09-08, worktree `/tmp/wt-storey-reveal`, branch
`feat/measure-boxes` off `origin/main` @ `f1ac7ce1`, commit `62223ff9`, pushed, no PR yet; sw v1169).**
| what | evidence |
|---|---|
| §40.1 three boxes | `viewer/cpe_film_boxes.js`. `witness_film_boxes.js` **12/12** at 1280×720, 1920×1080 and corners `tr`/`bl`/`tl` (`out/witness_film_boxes.log`). At 720p: `§HUD_BOX 1001,20 259x374` · `§STATUS_BOX 1001,403 259x106` · `§MEASURE_BOX 20,572 245x128`, identical on all 392 sampled frames, pairwise disjoint, 0 unattributed text draws. |
| the anti-scope-blind guard | the witness also READS `_captureFrame` and classifies all **13** composite calls against a registry; an unregistered one FAILS. It also asserts `roomTitleCompositeOntoCanvas` survives only in the module-missing `else` branch. |
| §40.2 the plate's area | `witness_slab_beat.js` **18/18** (Hospital, `--nostream`, `out/wsb_boxes_nostream.log`). `§SLAB_BEAT_AREA src=raster m2=3,367 … bboxM2=7,585` and the panel says *"Floor area ≥ 3,367 m² (walkable raster, lower bound)"* — the honest answer with no mesh in the scene. `§SLAB_BEAT_DIAG shape=outline segments=4`; the label plane is gone from the live scene. |
| §40.3 PoC | `scripts/poc_flyout_beats.js` (`out/poc_flyout_beats.log`). Hospital's largest plate is **Level 3, 100.83 × 91.16 m**; its raster decomposes to wings **22.25×72.25 · 23.50×59.75 · 18.00×18.50 · 9.25×29.50 · 20.25×10.50 m**, with a **4.75 m-wide, 42.5 m-long run REJECTED as a corridor**. Sills: roof top 203.62 m, highest Level-2 sill 172.37 → **31.25 m** (N/E/W), **30.59 m** (S). |
| §40.3 module | `viewer/cpe_flyout_beats.js`. `witness_flyout_beats.js` **12/12** Hospital, window **68.84–146.97 s**, 305 samples, 9 subjects, **4 cued: wing1@72.09 s (840 px held) · wing3@74.84 s · wing4@105.84 s · sillE@131.34 s**, 18 rejections each named. **HHS: VACUOUS** — its fly-out window is 0.00 s (§37 measured `out=pullout=flyback=reveal=0.688`), and the witness says so instead of passing. |
**Two mistakes this build made and corrected, recorded so the next session does not repeat them:**
1. **The PoC's first legibility cut accepted ONE endpoint in frame** and scored a 72 m wing at **2,200 px on a
   1,280 px frame** — an arrow running off both sides, which reads as nothing. Both ends must be in frame.
2. **`plan.beats` has NO `round2` field.** `round2` is only the `§CINEMA_BEATS` LOG's label for `beats.reveal`
   (`viewer/effects.js:9055` is the object). Reading `b.round2` fell through to `b.rise` and opened the fly-out
   window to **187.8 s**, putting a wing cue at 168.6 s in the middle of the discipline parade. The window is
   `out → reveal`.
**40.5 ✅ THE MESH FOOTPRINT PATH — MEASURED STREAMED, AND IT NEEDED A FIX FIRST (commit `c345979f`).**
The first streamed run said `§SLAB_BEAT_AREA src=raster … 1 batched slot(s) not addressable`: **Hospital's
picked plate is a BatchedMesh SLOT, not an InstancedMesh instance**, and the first cut of the footprint walker
could not address one — so the mesh path never fired on the very building §38.1 was written about, and the
figure silently fell back to the raster. THREE does expose the per-slot span (`getGeometryIdAt(instanceId)` →
`getGeometryRangeAt(geometryId)` → `{indexStart,indexCount,vertexStart,vertexCount}`, plus
`getMatrixAt(instanceId)`); without that range a walk over a BatchedMesh sums the whole shared buffer, i.e.
the entire building. A THREE build lacking the accessors is still counted and named, never guessed at.
**MEASURED after the fix (`out/wsb_boxes_streamed2.log`, `witness_slab_beat.js` streamed **18/18**, 0 fail):**
`§SLAB_BEAT_AREA src=mesh m2=3,361 up=3,361 down=3,361 tris=1216 meshes=1 bboxM2=7,585 fill=0.443`.
**Up and down agree to the metre** — a closed solid measured from both sides — and the INDEPENDENT walkable
raster says **3,367 m², 0.2 % away**. The panel now reads *"Floor area 3,361 m² (mesh footprint)"* in place of
the old **7,585 m² bbox product**, which was 2.26× too big: that is the §38.1 correction, measured.
**Still open, and NOT done here:** (a) the §40.0 luma-dip instrumentation (`§MAXQ_FRAME_LUMA` in
`_captureFrame`) — the shipped log still cannot tell a dipped frame from a good one; (b) any bake. Bakes
remain user-gated.

### 41. 🏁 RESUME HERE — session close 2026-09-08 (Opus, the §38 session). Read §38 → §40 in order, then this.
**STATE.** bim-ootb branch **`feat/measure-boxes`** @ **`c345979f`** (2 commits off `origin/main` `f1ac7ce1`,
i.e. PRs #1697+#1699 already in), **pushed, NO PR yet**, `sw.js` **v1169**. Spec branch `fable/meshdb-livewire`,
pushed. Worktree **`/tmp/wt-storey-reveal`** holds every log cited below under `out/` — do NOT prune it.
14 files, +1,647/−81. **Nothing is merged to main. No bake was run this session.**

**WHAT SHIPPED (all of §38, in §40's order, each claim one §-witness):**
| § | file(s) | witness | result |
|---|---|---|---|
| 40.1 three fixed boxes | **new** `viewer/cpe_film_boxes.js`; `cinema_maxq.js`, `cpe_flythru_cues.js` rerouted; registered in `main.js`/`viewer.html`/`sw.js` | **new** `viewer/tests/witness_film_boxes.js` | **12/12** ×4 configs (`out/witness_film_boxes.log`) |
| 40.2 plate = surface area | `viewer/cpe_slab_beat.js` | `witness_slab_beat.js` (rewritten asserts) | **18/18** nostream + **18/18 streamed** (`out/wsb_boxes_nostream.log`, `out/wsb_boxes_streamed2.log`) |
| 40.3 fly-out beats | **new** `viewer/cpe_flyout_beats.js`, **new** `scripts/poc_flyout_beats.js` | **new** `viewer/tests/witness_flyout_beats.js` | **12/12** Hospital, **VACUOUS** HHS (`out/witness_flyout_beats*.log`, `out/poc_flyout_beats.log`) |
| 40.0 the flicker | **new** `scripts/probe_plate_flicker.py` (+ one ffmpeg `signalstats` pass) | — (a measurement, not a witness) | `out/plate_flicker.log`, `out/yavg.txt` |

**THE ONE HEADLINE, because it changes what the next session should do:** the 9 s flicker is **not** the
plate. It is **34 whole-frame single-frame luma dips across the film, 15 of them inside 8.96–17.75 s**
(§40.0). §38.1's z-fight and per-frame-`setColorAt` suspects and §38.1a's status-churn suspect are all
refuted by measurement — the same collapse happens OUTSIDE the plate polygon, in lockstep. Nothing was
changed on that basis; the three boxes were built because §38.1b asked for them in their own right.

**⛔ NEXT SESSION, FIRST TASK — `§MAXQ_FRAME_LUMA`, and it is small.** Frames **231 (good)** and
**232 (45.6 luma down)** of the shipped Hospital film carry the **identical** `§SHADOW_FRONTIER_AT_CAPTURE
frontierGuids=3 …` line and nothing else, and `§MAXQ_QUALITY frames=4699 unconverged=0` calls the whole bake
clean. **The shipped log cannot tell a dipped frame from a good one** — a §4 "cannot report its own failure"
defect. Add to `cinema_maxq.js` `_captureFrame`, after the 2D pass and before `toBlob`: read the composited
canvas's own mean luma and print `§MAXQ_FRAME_LUMA i= Y= dY= foldMs= taa= ao=` (and a `§MAXQ_LUMA_DIP` line
when a frame is >8 luma below its predecessor). Only THEN root-cause the dip — the two live suspects are
`_captureFrame`'s own explicit `A._composer.render()` versus the accumulated still fold, and a shadow/env
update landing inside the capture task. **Do not guess between them without that instrumentation.**

**THEN, in order:** (a) open the PR for `feat/measure-boxes`; (b) a 12 s Hospital bake to SEE the three boxes
and the plate's area panel in real bytes — the boxes have never been in a film; (c) the full 720p re-bake
§38 was written against. **All bakes are user-gated.**

**DO NOT REDO / DO NOT RE-LITIGATE:**
- The flicker hypotheses in §38.1 and §38.1a — measured and refuted (§40.0). No `polygonOffset`, no colour change.
- `plan.beats` has **no `round2`** — that name exists only in the `§CINEMA_BEATS` LOG. The object is
  `{dive,spin,out,pullout,flyback,reveal,rise}` (`viewer/effects.js:9055`). The fly-out window is `out → reveal`.
- A dimension cue needs **BOTH** endpoints in frame. One-endpoint legibility scored a 72 m wing at 2,200 px
  on a 1,280 px frame.
- Hospital's floor plate is a **BatchedMesh slot**, not an InstancedMesh instance; per-slot triangles come from
  `getGeometryIdAt` → `getGeometryRangeAt` (§40.5). Without the range a walk sums the whole building.
- `A.roomTitleCompositeOntoCanvas` is deliberately UNCHANGED and still serves the live editor preview and six
  witnesses; only the BAKE stopped calling it. Do not "clean it up".

**COMMANDS.** `node viewer/tests/witness_film_boxes.js [--w --h --pos]` (no browser, ~1 s) ·
`node viewer/tests/witness_flyout_beats.js --db Hospital_silent_local --dur 195.79 --nostream --port 8577` ·
`node viewer/tests/witness_slab_beat.js --db Hospital_silent_local --dur 195.79 [--nostream] --port 8579`
(streamed ≈ 10 min under swiftshader and is the ONLY run that proves `src=mesh`) ·
`node scripts/poc_flyout_beats.js` · `python3 scripts/probe_plate_flicker.py <poses.json> <framesDir> <f0> <f1>`.
Read the log after every run.

**HOUSEKEEPING.** `/tmp/wt-clash-pending` and `/tmp/wt-hud-stats` are both `ahead=0` but carry untracked
`out/` bake evidence cited by §PENDING.2–.4 and §PENDING.5 — **left in place deliberately**, not overlooked.
`git push` to bim-ootb needed `git config lfs.<url>/info/lfs.locksverify false` after one
`lfs.github.com … i/o timeout`; that is the known intermittent LFS pre-push behaviour, not a quota block.

### 42. ⛔→✅ THE FLICKER IS FOUND: `§FLYTHRU_DATUM_LIFE2`, and the cause is `depthWrite` (2026-09-08)
> **USER:** *"It also appeared during closing seconds of a baked movie thus that should give a good clue."*
> · *"The flickers come about again at 2.28 min/sec"* · *"was never happening before, thus it must have been
> an impact during 2D or measure steps"* · *"chase it till zero"*
**The user was right on all three counts and the measurement now says so exactly.** §40.0's verdict — "whole-frame
render dips, ~0.7 % of frames, cause unknown" — was measuring the WRONG QUANTITY: a single-frame *dip* (darker
than both neighbours) is dominated by the buildup, which legitimately changes the picture. The quantity that
isolates the defect is the frame-to-frame **jump** `|ΔY| > 15` measured **per film window**.

**42.1 THE MEASUREMENT (`scripts/probe_film_flicker.py`, four films, no GPU, no re-bake).**
| film | has `LIFE2` datum? | reveal-round jumps `|ΔY|>15` | max `|ΔY|` |
|---|---|---|---|
| `Hospital_FULL_720p_2026-09-07` (pre-Measure) | **no** | **0** / 539 f | 10.2 |
| `Hospital_FULL_measure_2026-09-08` (the film the user watched) | **YES** | **42** / 862 f | **59.6** |
| `Terminal_FULL_allsystems_2026-09-08` | no | **0** / 232 f | 10.8 |
| `HHS_FULL_allsystems_2026-09-08` | no | 2 / 574 f | 24.9 |
**And within the Measure film the boundaries are the datum's OWN logged seconds, to the frame:**
| window | jumps | rate |
|---|---|---|
| cruise 90.00–146.80 s | **1** | 0.018/s |
| reveal round opens, before LIFE2 146.80–148.70 s | **0** | — |
| **`§FLYTHRU_DATUM_LIFE2` DRAWN 148.70–169.10 s** | **42** | **2.06/s** |
| after LIFE2, SAME reveal round 169.10–183.00 s | **0** | — |
| storey reveal + orbit 183.00–195.79 s | **0** | — |
Zero on both sides, 42 in the middle. **2:28 = 148.7 s = the datum's second life switching on.** One frame
(155.27 s) swings **35.5 % of the picture** from RGB 29/32/28 to 185/189/197 — building to sky — in a clean
diagonal band, and back again.

**42.2 THE CAUSE, in one line of code.** `cpe_flythru_datum.js:245` built the ribbons as
`MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: DoubleSide })` — and **THREE's
`depthWrite` defaults to `true`**. A transparent double-sided ribbon that WRITES depth occludes whatever is
drawn after it in the transparent queue; that queue is re-sorted by camera distance every frame, so the
occlusion flips frame to frame. At second zero (LIFE1) the building is 3 meshes and there is almost nothing
to fight, which is why the opening never showed it. At 148.70 s the building is COMPLETE — this is exactly
the depth risk **§39.2 wrote down and asked to be measured before it shipped**, arriving as predicted.
**FIX: `depthWrite: false` on both ribbon materials.** `depthTest` stays **TRUE** — §17.5's "the rising build
occludes the grid" reading is the whole point of the opening, and only the WRITE was ever wrong. §39.2's
open question (should LIFE2 also drop `depthTest`?) is NOT answered here and stays open on its own evidence.

**42.3 THE INSTRUMENT, so this cannot come back silently.** `scripts/probe_film_flicker.py FILM.mp4` reads a
baked mp4's own pixels and prints `§FILM_FLICKER_WIN` per beat window + a `§FILM_FLICKER_VERDICT`. It says
INCONCLUSIVE for a window under 24 frames and **excludes the buildup window from the verdict** — elements
really do appear there, and all four films jump 37–151 times in it with no defect. Baseline recorded
(`out/film_flicker_baseline.log`), non-buildup jumps: **pre-Measure 1 · Measure 43 · Terminal 3 · HHS 27**.
⚠ **HHS's 27 (max |ΔY| 109.7) is NOT explained and is not LIFE2** — HHS has no datum. Open, named, not hidden.

**42.4 WHAT IS AND IS NOT PROVEN.** The LOCATION is proven (42/42 inside LIFE2, 0 outside, replicated against
three datum-free films). The CAUSE is a code fact — a transparent material writing depth — matching the
measured signature (large-area, bidirectional, order-dependent). **The FIX is not yet proven: that needs one
bake.** Do not claim it works until `probe_film_flicker.py` on a fresh Hospital bake shows the reveal round
at 0. **Also retracted here:** §40.0's reading that the 9 s plate flicker and this are one phenomenon — the
dive's churn is the buildup and is present in every film including the pre-Measure one; §40.0's refutation of
§38.1's z-fight/`setColorAt`/status suspects still stands, and no polygonOffset or colour change was made.

**42.5 THE PROPER CONTROL — the user's own clue (*"check 3 days ago MP4 has no such"*), and it found a SECOND
effect.** `~/Downloads/Hospital_1080p24_2026-09-05.mp4` is the same path, the same **4,699 frames / 195.79 s**,
and its log carries **ZERO** `FLYTHRU_DATUM|SLAB_BEAT|INDOOR_BEAT|LINEAR_BEAT` lines — a true pre-Measure twin
of the film the user watched, far better than §42.1's 09-07 film. Same probe, same windows:
| window | **09-05 pre-Measure** | 09-07 (storey reveal, no Measure) | **09-08 with Measure** |
|---|---|---|---|
| buildup + dive | 88 jumps, max 99.2 | 84 | 108, max 99.8 |
| cruise | 1, max 28.1 | 1 | 1, max 32.2 |
| **reveal round** | **0, max 10.1** | **0, max 10.2** | **42, max 59.6** |
| **storey reveal** | 0, max **0.3** *(no storey reveal existed yet — the window is empty, not clean)* | 0, max **0.6** | 0, max **5.3** |
| orbit | 0, max 1.9 | 0 | 0, max 2.0 |
**Two findings, not one:**
1. **The reveal-round flicker = LIFE2** (§42.1–42.4). The 09-05 twin nails it: identical path and frame count,
   0 jumps and max |ΔY| 10.1 where the Measure film has 42 and 59.6.
2. ⚠ **A SECOND, SMALLER EFFECT IN THE CLOSING SECONDS, which is what the user saw there.** Comparing like
   with like — the storey reveal exists in BOTH the 09-07 and 09-08 bakes — its window's max |ΔY| goes
   **0.6 → 5.3, a 9× rise**, on a mean-64 frame (≈ 8 % of the picture's brightness, one frame). It is BELOW
   the probe's 15 threshold, so `§FILM_FLICKER_WIN` reports `jumps=0` and only the `max|dY|` column shows it —
   **the verdict line alone would have hidden this; read the max column.** The datum is already off by then
   (LIFE2 ends 169.10 s), so it is NOT LIFE2. The one Measure change reaching that window is §37.1's storey
   cards querying `storey_walkable_raster` per card. **NOT diagnosed — recorded, with its number.** Next step
   is the same discipline: instrument, do not guess.

### 43. §CLI_BAKE_SW_PURGE — the silent bake ran STALE JS, and it cost a GPU run (2026-09-08)
The first 0–30 s test bake printed the PREVIOUS build's `§SLAB_BEAT_INIT … depth-tested tint + X,
shine-through label` and emitted **no** `§HUD_BOX` / `§STATUS_BOX` / `§MEASURE_BOX` / `§SLAB_BEAT_AREA`
at all: 8 minutes of GPU spent on code that was not in the film, and its numbers read as a REGRESSION
of a fix that was simply absent. **Cause:** `viewer/sw.js` precaches `viewer.html` and every module at
a FIXED `?v=` query, so a browser profile that has ever loaded the viewer keeps serving the OLD
`viewer.html` — a `<script>` tag added this session is then not there at all. Every `witness_*.js`
unregisters the SW and clears caches before judging; **`cli_silent_bake.js`, which makes the
deliverable, never did.** Fixed (commit `4ef5b2a6`): unregister + `caches.delete` + reload right after
the first `goto`, logging `§CLI_BAKE_SW_PURGE unregistered= cachesDeleted=`. Verified on the re-bake:
`box OUTLINE`, `§FILM_BOXES_INIT`, `§FLYOUT_BEATS_INIT`, and
`§SLAB_BEAT_LABEL rows=[Floor area 3,361 m² (mesh footprint) …]` all present.
**Rule: a bake whose log does not show this session's own new §-strings is not evidence — check one
before trusting any bake.**

### 44. ⛔ §42's FIX IS WRONG — MEASURED ON A REAL BAKE, and the LIFE1 culprit is the PLATE BEAT
**Test bake (user's go): Hospital 0–30 s, all layers on, real GPU, 720 f / 30.00 s, `depthWrite:false`
in the build (`out/Hospital_0-30s_fix_2026-09-08.mp4`, copied to
`~/Downloads/Hospital_0-30s_measure_boxes_2026-09-08.mp4`).**
| LIFE1 window 0–11.34 s | jumps `|ΔY|>15` | max |
|---|---|---|
| `Hospital_1080p24_2026-09-05` (pre-Measure) | **1** | 15.4 |
| `Hospital_FULL_measure_2026-09-08` (bug) | 18 | 63.6 |
| **this bake (depthWrite FIXED)** | **23** | 61.1 |
The control window (11.34–30 s, no datum drawn) is comparable across all three — **33 / 31 / 27** — so
the clip IS comparable and **the fix genuinely did not help.**
**AND THE JUMP SECONDS NAME THE REAL CULPRIT.** All 23 land in **8.88–11.00 s**:
`8.88 8.96 9.08 9.17 9.42 9.46 9.50 9.58 9.62 9.67 9.79 9.88 9.92 9.96 10.08 10.12 10.17 10.21 10.29
10.38 10.79 10.96 11.00`. **The datum draws CONTINUOUSLY over 0–11.34 s** — a datum cause would spread
across that whole window. It does not. It sits on `§SLAB_BEAT_PICK sec=9.38` plus its 2.2 s envelope:
**the PLATE BEAT**, which is exactly what the user reported first ("that 9th second mark when the whole
floor slab gets tinted").
**WHAT I GOT WRONG, and why the earlier control failed.** §40.0 refuted §38.1(b)'s `setColorAt`
hypothesis because the amber collapse showed OUTSIDE the plate polygon too. That reasoning assumed a
plate-local cause stays plate-local — **but the tint writes `setColorAt` into a SHARED InstancedMesh /
BatchedMesh colour buffer, so touching one slot can change siblings anywhere in the frame.** The
control did not discriminate, so §38.1(b) was never actually refuted. §42's headline ("the flicker is
FOUND: LIFE2 / depthWrite") is **RETRACTED as a causal claim**; its CORRELATION measurements stand
(42/42 jumps inside LIFE2's window, 0 outside, three datum-free films at 0–2) and still need explaining.
`depthWrite:false` is kept — a transparent material must not write depth — but it is **not this bug**.
**NEXT, and measure before changing anything:** (a) the plate beat's per-frame `setTintIntensity` lerp
re-writes `instanceColor` EVERY frame of its 2.2 s envelope (`cpe_slab_beat.js`) — §38.1(b)'s original
suspect; set it once at fade-in and once at fade-out and re-bake the same 30 s clip; (b) log which
sibling slots share the touched buffer (`§SLAB_BEAT_TINT sharedSlots=`) so the blast radius is a number,
not a theory; (c) LIFE2's 42 jumps are still unexplained and cannot be tested by a 0–30 s clip.

### 46. ✅ THE FLICKER'S ROOT CAUSE — the DATUM'S GEOMETRY IS IN THE SSAO DEPTH PREPASS (2026-09-09)
**Full 1080p all-systems bake (user's go): `Hospital_FULL_1080p_notint_2026-09-08.mp4`, 4,699 f, 242 MB,
1920×1080, 5,979 s wall, 0 unconverged.** Both earlier fixes changed NOTHING:
| window | pre-Measure | tint + depthWrite bug | **no tint + depthWrite fixed** |
|---|---|---|---|
| LIFE1 0–11.34 s | 1 | 18 | **19** |
| LIFE2 148.70–169.10 s | — | 42 (max 59.6) | **42 (max 59.6)** |
LIFE2 is **bit-for-bit the same count, the same max, the same seconds — at a DIFFERENT RESOLUTION.**
Deterministic and resolution-independent, so it is not the tint, not the depth write, not sampling noise.
The camera is smooth throughout (0.10 m/frame, identical to the 0-jump window after it).

**46.1 THE A/B THAT SETTLED IT (`out/L2_nomeasure_2026-09-09.mp4`, clip 0.75–0.87 = 146.8–170.3 s,
everything on EXCEPT `--no-measure`, 564 f):** `§FILM_FLICKER_VERDICT PASS jumps>15=0 max|dY|=9.2`,
against **42 / 59.6** with Measure on. Log confirms Measure was truly off (0 datum lines). **Measure is
the cause, and in that window the ONLY Measure layer alive is `§FLYTHRU_DATUM_LIFE2`.**

**46.2 WHAT IT IS DOING — measured frame-by-frame against the Measure-off twin at the SAME film second:**
```
MEASURE OFF lumas 155.0-155.5s: 56 56 56 56 56 56 56 56 56 56 56 56 56 56   ← perfectly flat
MEASURE ON  lumas 155.0-155.5s: 39 59 55 73 44 53 65 104 57 82 56 57 58 58  ← swings BOTH ways
```
Averaged over the frames, Measure-on is darker on **1.3 %** of pixels and brighter on **10.3 %** — i.e. it
adds no persistent object; it makes individual frames come out WRONG IN BOTH DIRECTIONS around the correct
value. That is a GLOBAL per-frame render error, not geometry.

**46.3 ROOT CAUSE, in code.** `viewer/effects.js:49` — `new SSAOPass(scene, camera, …)`. **three.js's
SSAOPass renders its own depth + normal prepass with an OVERRIDE MATERIAL, which ignores each object's
`depthWrite`.** The datum's ribbons are large, `DoubleSide`, and cover the ground plane and an upright
plane; the AO prepass therefore writes them in as SOLID surfaces and computes occlusion against a screen
covering false geometry, which lands as a whole-frame brightness error that oscillates as the 12-frame AO
budget folds. **This is exactly why §45's `depthWrite:false` could not help — the override material never
reads it** (and it is why dropping the tint did nothing either: the tint was never the LIFE2 mechanism).
**THE FIX IS EXCLUSION, NOT A MATERIAL FLAG:** the datum group must not be visible to the SSAO prepass —
a dedicated layer the AO camera does not render, or hiding `_grp` for the duration of that pass. SSAOPass
has no per-object opt-out, so this needs a small, deliberate change at the pass, not a one-flag edit.
**Not implemented — specified. Do not claim it fixed until `probe_film_flicker.py` on a fresh bake shows
the LIFE2 window at 0.** The same mechanism predicts LIFE1's 19 (the datum draws there too); §44's reading
that LIFE1 is the plate beat is **superseded** — the jumps cluster at 8.88–11.00 s because that is where
the camera is closest to the datum's ground ribbons, not because of the tint (which no longer exists and
did not change the count: 18 → 19).
**Standing correction:** §42 said "the flicker is FOUND" and named `depthWrite`; §44 retracted that and
named the plate beat; **both were wrong on mechanism.** The measurements in each still stand — it is the
causal reading that kept outrunning them. The A/B in §46.1 is the first test that isolated a single
variable, and it should have been the FIRST thing run after §42's correlation, not the fifth.

### 47. ⛔ HANDOFF — THE FLICKER IS STILL OPEN. Read this WHOLE section before touching anything.
**Three hypotheses have been implemented, baked and DISPROVED. Do not re-try them.** The defect is
narrow, perfectly reproducible, and has one clean one-variable A/B behind it. What is missing is the
mechanism, not more measurement of the symptom.

**47.1 THE DEFECT, in numbers (all from `scripts/probe_film_flicker.py`, jumps = frames with `|ΔY|>15`).**
| film | window | jumps | max |ΔY| |
|---|---|---|---|
| `Hospital_1080p24_2026-09-05` (pre-Measure twin: same path, same 4,699 f, ZERO Measure lines) | LIFE1 0–11.34 s | **1** | 15.4 |
| | reveal round | **0** | 10.1 |
| `Hospital_FULL_measure_2026-09-08` (720p, Measure) | LIFE1 | 18 | 63.6 |
| | **LIFE2 148.70–169.10 s** | **42** | **59.6** |
| `Hospital_FULL_1080p_notint_2026-09-08` (1080p, no tint, depthWrite fixed) | LIFE1 | 19 | 63.6 |
| | **LIFE2** | **42** | **59.6** |
| `L2_nomeasure_2026-09-09` (clip 0.75–0.87, everything on but `--no-measure`) | same window | **0** | **9.2** |
**LIFE2 is bit-identical across a 720p and a 1080p bake — same count, same max, same seconds
(150.83, 150.96, 151.00, 151.29, 151.92, 152.88 …).** Deterministic, resolution-independent.
**The camera is smooth throughout** (0.10 m/frame, identical to the 0-jump window right after it).
**Frame-for-frame against the Measure-off twin at the same film second:**
```
MEASURE OFF 155.0-155.5s: 56 56 56 56 56 56 56 56 56 56   (flat)
MEASURE ON  155.0-155.5s: 39 59 55 73 44 53 65 104 57 82  (swings BOTH ways around 56)
```
Averaged over those frames Measure-on is darker on **1.3 %** of pixels and brighter on **10.3 %** — it
adds no persistent object; it makes whole frames come out **wrong in both directions**. At the peak,
**35 % of the picture** flips from RGB 28/31/27 to 182/189/198 (building → sky) in a clean diagonal band,
and back. `§MAXQ_QUALITY unconverged=0` calls every one of those frames converged.

**47.2 RULED OUT — DO NOT RE-TRY (each was implemented, baked, and measured):**
1. **§38.1(a) z-fight of the plate's X diagonals** — the X is gone entirely (§40.2) and nothing moved.
2. **§38.1(b) / §44 the plate tint's per-frame `setColorAt`** — the tint is gone entirely (§45,
   `witness_slab_beat.js` asserts no frame touches a mesh) and LIFE1 went **18 → 19**.
3. **§42 `depthWrite:true` on the datum's transparent ribbons** — set to false (commit `611f3f8f`);
   LIFE2 stayed at exactly 42. (Keep the flag: a transparent material must not write depth. It is
   simply not this bug.)
4. **§38.1a the status caption churning** — a 2D overlay redraw cannot darken 55 % of the frame's pixels
   spread evenly over a 4×4 grid, which is what was measured.
5. **The camera path** — measured smooth, see above.
6. **The buildup** — present at the same rate in every film including the pre-Measure twin.

**47.3 THE ONE HYPOTHESIS STILL LIVE, AND IT IS UNTESTED — `§AO_EXCLUDE` (commits `abf61061` +
`9fc1cc00`).** An AO pass renders its own depth/normal prepass and ignores per-object material flags,
so Measure's annotation geometry could be written into the AO buffer as solid surface, which would
produce exactly a whole-frame error in both directions. `viewer/effects.js` now hides anything marked
`userData.excludeFromAO` for that pass only (`A._aoExcludeWrap`); `cpe_flythru_datum`, `cpe_slab_beat`
and `cpe_indoor_beats` set the flag. **⚠ IT HAS NEVER BEEN TESTED ON THE WINDOW THAT FAILS.** The only
bake since is HHS, and **HHS cannot test it: HHS has NO LIFE2 at all** (`out=pullout=flyback=reveal=0.688`,
the window is 0.00 s). HHS before/after is 27 → 30 non-buildup jumps, i.e. unchanged, and its jumps sit
in the cruise (74–76 s) and buildup where no datum draws — that measures nothing about this defect.
**FIRST TASK: bake `--clip 0.75:0.87` on Hospital with everything on and score that window.** If it is
0, the AO exclusion is the fix. If it is still 42, the AO theory dies and the field is open again.
```
node cli_silent_bake.js --db Hospital_silent_local --buildup --label --reveal --clash --measure \
  --storey-reveal --gpu real --clip 0.75:0.87 --fps 24 --width 1280 --height 720 --port 8568 \
  --out out/L2_aofix.mp4 --log out/L2_aofix.log          # ~10 min
python3 scripts/probe_film_flicker.py out/L2_aofix.mp4 --win "clip:0:23"
```
Compare against the two runs that already exist: **Measure ON = 42 / 59.6** (in the full films) and
**Measure OFF = 0 / 9.2** (`out/L2_nomeasure_2026-09-09.mp4`).

**47.4 IF THE AO THEORY DIES, the next candidates in order, each testable by ONE clip bake:**
(a) bisect Measure itself — the datum is the only Measure layer alive at 148.7–169.1 s, so add a
`--no-datum`-style switch or temporarily return early from `flythruDatumAt` and re-bake that clip;
(b) if the datum is confirmed, bisect the datum — the 3D group vs the 2D composite
(`flythruDatumCompositeOntoCanvas`), by skipping one at a time;
(c) instrument rather than guess: §41's `§MAXQ_FRAME_LUMA i= Y= dY=` in `_captureFrame` — the shipped
log still cannot tell a bad frame from a good one, which is why every diagnosis so far has been
post-hoc ffmpeg archaeology.

**47.5 FOUR TRAPS THAT COST THIS SESSION REAL TIME:**
1. **A bake can run STALE JS.** `cli_silent_bake.js` now purges the service worker (§43) — but always
   confirm this session's own new `§`-strings are in the log before trusting a bake. One 8-minute GPU
   run tested code that was not in the film and read as a regression.
2. **The bake's AO is `N8AOPass` (`§PHOTO_AO`), NOT `SSAOPass`** — `_ssaoPass.enabled = false` ships
   off. The first `§AO_EXCLUDE` wrap went on the wrong pass and would have been a silent no-op that
   looked like a failed fix. Both are wrapped now and each logs its own pass name.
3. **`§FILM_FLICKER_VERDICT` alone hides things — read the `max|dY|` column.** The storey-reveal window
   went 0.6 → 5.3 (9×) with 0 jumps either way (§42.5).
4. **Phase-match, never wall-clock-match, when comparing films of different lengths**, and check a
   control window the change cannot touch before believing a difference (that check is what exposed
   the stale-JS bake).

**47.6 STATE.** bim-ootb `feat/measure-boxes` @ `9fc1cc00`, 7 commits off `origin/main`, pushed, **no PR**,
sw **v1172**. Worktree `/tmp/wt-storey-reveal`. Films: `~/Downloads/Hospital_FULL_1080p_notint_2026-09-08.mp4`
(the user's reference, 242 MB), `~/Downloads/HHS_FULL_480p_aofix_2026-09-09.mp4`,
`out/L2_nomeasure_2026-09-09.mp4` (the Measure-off control — **keep it, it is the baseline**).
**Everything else in §40 is DONE and witnessed** — three fixed boxes 12/12, plate area 18/18, fly-out
beats 12/12 — and the user has accepted Measure on screen ("very good, gives proper labels… a powerful
statement"). **The flicker is the only thing outstanding.**

**47.7 ✅ THE ONE ASSUMPTION UNDER §47.3 IS NOW VERIFIED IN CODE (2026-09-09, no bake needed).**
§46 asserted that the AO pass "ignores per-object material flags" but only checked SSAOPass — which is
NOT the pass that runs. Read the live one instead, `viewer/lib/postprocessing-n8ao.bundle.js`:
```js
let a = t.overrideMaterial; t.overrideMaterial = this.material; e.render(t, r); t.overrideMaterial = a;
```
**N8AO DOES set `scene.overrideMaterial` for its depth/normal render.** An override material replaces
every object's material, so a per-object `depthWrite:false` is never consulted — **§42's fix could not
have worked, and now that is a fact rather than an inference.** The same line also shows the pass goes
through `renderer.render(scene, target)`, which HONOURS `object.visible` — so hiding a group for the
duration of that pass is a mechanically valid exclusion, and `A._aoExcludeWrap` wrapping
`N8AOPass.render` covers this internal render. **Mechanism: confirmed. Fix shape: valid. Outcome: still
untested** — §47.3's clip bake is unchanged as the first task.
⚠ **A reviewer summarising this file has already mis-stated it once** as "SSAOPass's override material" —
that is trap §47.5(2) folded back into the diagnosis. The live pass is **N8AOPass**. If a fix is wired to
SSAOPass it is a silent no-op; check for `§AO_EXCLUDE pass=N8AOPass` in the log before believing any bake.

### 48. ⛔ §47.3's TEST IS RUN — THE AO THEORY IS DEAD (2026-09-09, `out/L2_aofix_2026-09-09.mp4`)
Hospital `--clip 0.75:0.87`, everything on, `§AO_EXCLUDE` live on `N8AOPass`, 564 f, ~10 min:
| run | jumps `|ΔY|>15` | max |
|---|---|---|
| Measure ON, no exclusion (the full films) | 42 | 59.6 |
| **Measure ON, AO exclusion (this bake)** | **36** | **52.7** |
| Measure OFF (`L2_nomeasure_2026-09-09.mp4`) | **0** | **9.2** |
**NOT VACUOUS — checked before reading it** (the HHS lesson): `§FLYTHRU_DATUM_LIFE2 start filmSec=148.75`
fired inside the clip, and the jump seconds map back to **150.55 · 150.96 · 151.01 · 151.34 · 151.92**,
the same seconds as the original 42. The defect was present and the exclusion did not remove it.
**42 → 36 is not a fix.** The AO buffer may be a minor contributor; it is not the mechanism.
**§46 is hereby RETRACTED as the cause** — its code reading stands (§47.7: N8AO really does set
`scene.overrideMaterial`, so `depthWrite` really is ignored), but the prediction it made is falsified.
Keep `A._aoExcludeWrap` — annotation geometry has no business in an AO buffer — and stop treating it as
the answer. **That is FOUR mechanisms implemented, baked and disproved** (X diagonals, plate tint,
`depthWrite`, AO exclusion) against ONE solid fact: **Measure ON = 42, Measure OFF = 0, same window.**

**48.1 NEXT — BISECT, DO NOT THEORISE.** No more mechanism guesses until the layer is pinned. The datum
is believed to be the only Measure layer alive at 148.7–169.1 s (cues/slab/linear end in the dive,
indoor 18–69 s, fly-out 68.8–147.0 s, storey cards 183 s+) — **verify that from the log rather than
assuming it**, then bisect with one clip bake each, same window, changing ONE thing:
1. **datum off, rest of Measure on** — return early from `A.flythruDatumAt` (or add `--no-datum`). If
   this reads 0, it is the datum and nothing else. If it still reads ~36, the datum is innocent and the
   §47.3 chain of reasoning was wrong from the start.
2. **if the datum is guilty, bisect the datum**: its 3D group vs its 2D compositor
   (`flythruDatumCompositeOntoCanvas`) — skip one at a time. LIFE2 has 74 marks and a ground grid;
   the 2D pass has never been suspected and has never been tested.
3. **only then** look for a mechanism, with §41's `§MAXQ_FRAME_LUMA i= Y= dY=` in `_captureFrame` in
   place so the bake NAMES its bad frames instead of needing an ffmpeg post-mortem every time.
**Cost discipline:** each bisect step is one ~10-minute clip bake and answers a yes/no. Four mechanism
guesses have cost roughly two hours of GPU between them; two bisect steps would have cost twenty minutes.

### 49. WHAT ELSE TO PURSUE — leads, instruments and free tests for the session that takes this on
Written 2026-09-09 while §48.1's bisect step 1 is baking. Everything here is either MEASURED or a
concrete check with a stated cost. Order is by cost, cheapest first.

**49.1 ⭐ THE `--tap` STUB IS THE INSTRUMENT YOU WANT — no code change, no rebuild, no branch.**
`cli_silent_bake.js --tap file.js` installs a page script at document start. That is enough to switch
ANY layer off for one bake and put the bisect on the command line instead of in the source:
```js
// out/tap_datum_off.js — the datum DRAWS nothing; every other Measure layer is untouched
(function () { var iv = setInterval(function () { var A = window.APP;
  if (!A || typeof A.flythruDatumAt !== 'function') return; clearInterval(iv);
  A.flythruDatumAt = function () { return 0; };
  A.flythruDatumCompositeOntoCanvas = function () { return 0; };
  console.log('§BISECT_DATUM_OFF stubbed'); }, 50); })();
```
⚠ Stub the DRAW entry points, not `…Build` — other layers read `A.flythruDatumFigures()` (levels,
envelope), so stubbing the build changes a SECOND variable and the test stops being a bisect.
Always print a `§BISECT_*` line from the tap and check it in the log before reading the result.

**49.2 THE DATUM'S OWN MARK CHURN — MEASURED, PARTIAL (free, from the existing 1080p log).**
`§FLYTHRU_DATUM_MARKS drawn=` changes **30 times** inside LIFE2's 489 frames. **12 of the 29 luma jumps
fall within 0.1 s of one of those changes** — about **2.8× chance** (expected ~4.3 if independent).
So the datum's mark count is *involved* but **17 jumps have no mark change at all**. Do not read this as
proof either way; read it as: whatever it is, it is not ONLY the mark ledger.

**49.3 RULED OUT BY CODE READING (free — do not spend a bake on these):**
- **"a Measure layer mutates the scene after the fold converged, so `_captureFrame`'s extra
  `A._composer.render()` captures something different".** Checked: between `_waitFoldDone`
  (cinema_maxq.js:1917) and `_captureFrame` (:2229) the ONLY `A.*` calls are pure lookups —
  `cpeRevealCaptionAt`, `storeyRevealStatCardAt`, `roomTitleOpacityAt`, `tailPanelAt`,
  `resourcePanelHoldAt`, `flythruCueCaptionAt`, `bigStatsCompositeOntoCanvas`. **`A.flythruDatumAt`
  runs at :1821, BEFORE `startStillRefine()` at :1888** — the datum's state is settled before the fold
  begins, so the fold converges *with* it. That theory is dead without a bake.

**49.4 STILL LIVE, IN THE ORDER I WOULD TRY THEM:**
1. **Finish the bisect (§48.1).** Datum off → if 0, it is the datum; if ~36, the datum is innocent and
   four sections of reasoning were aimed at the wrong layer. THEN bisect the datum's 3D group vs its
   2D compositor — **the 2D pass has never been suspected or tested.**
2. **TAA × transparency.** `TAARenderPass` accumulates N jittered samples. The datum's ribbons are
   `transparent: true, side: DoubleSide`; order-dependent blending can resolve differently per jittered
   sample, so the accumulated image need not equal any single sample. This is a DIFFERENT mechanism
   from the AO one that §48 killed, and it has never been tested. Cheap test: make the ribbons opaque
   (`transparent:false`) for one bake via a tap, or drop `DoubleSide` to `FrontSide`.
3. **A free pixel diff you can run today with no GPU:** both films already exist —
   `Hospital_FULL_1080p_notint_2026-09-08.mp4` (Measure ON) and `L2_nomeasure_2026-09-09.mp4`
   (Measure OFF, clip starting at film 146.84 s). At a jump second, diff the two frames and check
   whether the changed region is bounded by the datum's projected ribbon geometry or is unrelated to
   it. That single image answers "is the datum even where the pixels move?".
4. **`§MAXQ_FRAME_LUMA` (§41).** Still not built. Every diagnosis in §42–§48 needed an ffmpeg
   post-mortem because the bake cannot name its own bad frames. Build it before the next mechanism hunt,
   not after.

**49.5 THE PROCESS RULE THIS WHOLE BAND EARNED.** Four mechanisms were implemented, baked and disproved
(X diagonals, plate tint, `depthWrite`, AO exclusion) — roughly two hours of GPU — against ONE fact that
took ten minutes to establish (Measure ON 42, Measure OFF 0). **Bisect to the LAYER before theorising
about the MECHANISM.** A correlation window is not a cause; a plausible code path is not a cause; only a
one-variable A/B is. And check the test is not VACUOUS before reading it — the HHS run "validated" the
AO fix on a building whose LIFE2 window is 0.00 s long.

### 50. ✅ BISECT STEP 1 — THE LAYER IS PINNED: IT IS THE DATUM'S DRAWING, NOTHING ELSE (2026-09-09)
`out/L2_datumoff_2026-09-09.mp4` — Hospital `--clip 0.75:0.87`, everything on, `--tap out/tap_datum_off.js`
stubbing ONLY `A.flythruDatumAt` + `A.flythruDatumCompositeOntoCanvas` (build left intact, §49.1):
| run | jumps `|ΔY|>15` | max |
|---|---|---|
| Measure ON, datum drawing | 42 | 59.6 |
| Measure ON, AO exclusion (§48) | 36 | 52.7 |
| **Measure ON, datum draws NOTHING** | **0** | **8.5** |
| Measure OFF entirely | 0 | 9.2 |
**Stubbing the datum's two draw calls is INDISTINGUISHABLE from turning Measure off** (0/8.5 vs 0/9.2).
Every other Measure layer — cues, slab beat, linear beat, indoor beats, fly-out beats, the three boxes —
is innocent. `§BISECT_DATUM_OFF` is in the log and `§FLYTHRU_DATUM_LIFE2` still resolved its window, so
the run is not vacuous. **Ten minutes of GPU. This is what §42–§48's two hours should have started with.**

**50.1 NEXT — BISECT STEP 2, the datum's 3D group vs its 2D compositor.** Two taps, one bake each:
```js
// A — 3D off, 2D on:  A.flythruDatumAt = function () { return 0; };          // group stays hidden
// B — 2D off, 3D on:  A.flythruDatumCompositeOntoCanvas = function () { return 0; };
```
A reads 0 → the 3D ribbons; B reads 0 → the 2D marks. **The 2D pass has never been suspected**, and it is
the half nobody has looked at: it draws with `globalAlpha` over the finished frame, so if it is guilty
the mechanism is compositing, not rendering, and none of §42–§48's render theories were ever relevant.
**Only after that** is a mechanism worth theorising about — and §49.4(2)'s TAA × transparency lead
applies to branch A only.

**50.2 A FREE MEASUREMENT THAT PRE-ANSWERS STEP 2 — and it points at the 3D half (2026-09-09, no GPU).**
Now that a datum-OFF film exists, the datum's exact contribution can be differenced without a bake.
At film 150.90–151.20 s, both scaled to 480×270:
```
datum OFF: 70 70 70 70 70 70 70      (perfectly flat)
datum ON:  72 69 99 56 58 60 63 68   (swings ±30 around the same 70)
```
On the worst frame the datum changes **40.3 % of the picture**, and the changed region's horizontal runs
are **median 59 px, max 144 px** — large contiguous areas, i.e. **PLANE-shaped, not line-shaped**. Thin
2D strokes and grid bubbles would give median runs of 1–3 px. The changed pixels go **165/171/180
(bright, sky) → 69/64/63 (dark)**.
**Reading: branch A (the 3D group) is the favourite, not branch B.** `§FLYTHRU_DATUM_BUILT` reports
`upright=1(plane)` alongside the ground grid — a large planar surface is exactly what a 59-px median run
looks like. ⚠ This is an INFERENCE FROM SHAPE, not a bisect: run both branches anyway. It is recorded
because it predicts the answer, so if branch B comes back 0 instead, the shape argument is wrong and that
itself is worth knowing.

### 51. 🏁 RESUME HERE — session close 2026-09-09. This SUPERSEDES §47.3's framing. Read §50 → §49 → this.
**⚠ §47 was written when the AO exclusion was the live hypothesis. §48 killed it and §50 pinned the layer.
Do not start from §47.3.**

**51.1 THE FACT, and it is now narrow.** Hospital `--clip 0.75:0.87` (film 146.8–170.3 s, the LIFE2 window),
everything on, one variable changed each time:
| run | jumps `|ΔY|>15` | max |
|---|---|---|
| baseline (datum drawing) | **42** | 59.6 |
| AO exclusion (§48) | 36 | 52.7 |
| **datum draws NOTHING** (`--tap out/tap_datum_off.js`) | **0** | **8.5** |
| Measure off entirely | 0 | 9.2 |
**The datum's DRAWING is the whole cause.** Cues, slab beat, linear beat, indoor beats, fly-out beats and
the three boxes are all innocent — they were on in the 0/8.5 run.

**51.2 NEXT — TWO BAKES, ~10 MIN EACH, AND THE QUESTION IS ANSWERED.** Same clip, one tap each
(pattern and traps in §49.1; the tap that already works is `out/tap_datum_off.js`):
```js
// BRANCH A — 3D off, 2D on
A.flythruDatumAt = function () { return 0; };
// BRANCH B — 2D off, 3D on
A.flythruDatumCompositeOntoCanvas = function () { return 0; };
```
```
node cli_silent_bake.js --db Hospital_silent_local --buildup --label --reveal --clash --measure \
  --storey-reveal --gpu real --clip 0.75:0.87 --fps 24 --width 1280 --height 720 --port 857X \
  --tap out/tap_datum_3d_off.js --out out/L2_bA.mp4 --log out/L2_bA.log
python3 scripts/probe_film_flicker.py out/L2_bA.mp4 --win "clip:0:23"
```
Score against **42 (guilty) / 0 (innocent)**. §50.2's free pixel diff predicts **branch A** — the changed
region is plane-shaped (median run 59 px, 40 % of the frame), not the 1–3 px runs thin 2D strokes make.
**Run B anyway**: if B is the guilty one the shape argument is wrong, the mechanism is COMPOSITING rather
than rendering, and every theory in §42–§48 was in the wrong half of the code.

**51.3 ONLY THEN pick a mechanism.** For branch A the untested lead is §49.4(2) **TAA × transparency** —
the ribbons are `transparent:true, side:DoubleSide` and `TAARenderPass` accumulates jittered samples, so
order-dependent blending need not resolve to the same image twice. Cheap tap test: `transparent:false`,
or `FrontSide`. Build §41's `§MAXQ_FRAME_LUMA` first so the bake names its own bad frames.

**51.4 DEAD — implemented, baked, disproved. Do not re-try:** the plate's X diagonals · the plate tint ·
`depthWrite:false` on the ribbons · AO exclusion · the status caption · the camera path · the buildup ·
"something mutates the scene after the fold converges" (killed by code reading, §49.3).

**51.5 STATE.** bim-ootb **`feat/measure-boxes` @ `9fc1cc00`**, 7 commits off `origin/main`, pushed, **no PR**,
sw **v1172**. Worktree `/tmp/wt-storey-reveal` — **keep it**, it holds every film and log cited here.
Films: `~/Downloads/Hospital_FULL_1080p_notint_2026-09-08.mp4` (the user's reference, all layers, 242 MB) ·
`~/Downloads/HHS_FULL_480p_aofix_2026-09-09.mp4` · `out/L2_nomeasure_2026-09-09.mp4` and
`out/L2_datumoff_2026-09-09.mp4` (**the two zero-flicker controls — keep both, they are the baseline**).
**§40's work is DONE, witnessed and accepted by the user** — three fixed boxes 12/12, plate mesh-footprint
area 18/18, fly-out wing/sill beats 12/12, `§AO_EXCLUDE` and the bake's service-worker purge shipped.
USER, 2026-09-09: *"The Measures is very good, as it gives proper labels to it, viewer shall easily
understand and to know this is all on the fly it be a powerful statement."* **The flicker is the only
thing outstanding, and it is now one bisect step from its mechanism.**

### 52. ✅ BISECT STEP 2 — THE MECHANISM IS 2D COMPOSITING, NOT THE 3D GROUP (2026-09-09)
`§50.2`'s pixel-shape prediction was WRONG. Two clip bakes, `--tap` stubbing one draw entry point each
(pattern: §49.1), Hospital `--clip 0.75:0.87`, everything on:
| run | jumps `|ΔY|>15` | max |
|---|---|---|
| baseline (both halves on) | 42 | 59.6 |
| **branch A** — `flythruDatumAt=0` (3D off, 2D on) — `out/L2_bA_2026-09-09.mp4` | **36** | 53.1 |
| **branch B** — `flythruDatumCompositeOntoCanvas=0` (2D off, 3D on) — `out/L2_bB_2026-09-09.mp4` | **0** | **8.8** |
| datum fully off / Measure off (§50/§48) | 0 | 8.5 / 9.2 |
Both bakes confirmed not vacuous (`§BISECT_DATUM_3D_OFF`/`§BISECT_DATUM_2D_OFF` fired, `§FLYTHRU_DATUM_LIFE2`
resolved in-window both times). **The 3D ribbon group is innocent** (36 ≈ the failed AO-exclusion's 36 in
§48 — a minor contributor at most, same order of magnitude as noise). **The 2D canvas compositor
(`A.flythruDatumCompositeOntoCanvas`, `viewer/cpe_flythru_datum.js:422`) is the whole cause.**
**§50.2's shape argument is retracted as a predictor** (it called this backwards) but the observation stands
as a fact still needing explanation: the changed region really is large/plane-shaped, which now means the
2D canvas draw itself — not a 3D mesh — is putting down a large filled/stroked region wrongly on some frames.
**§49.4(2) TAA × transparency is now DEAD too** — it was a branch-A-only theory (3D material blending); branch
A is innocent, so it cannot be the mechanism.
**CODE READ (no bake spent):** `ctx.save()`/`ctx.restore()` in the function are balanced (line 571/703,
one nested pair at 673/676) — not a compositeOperation or globalAlpha leak into later draws. Every projected
point used for a line/quad IS guarded against behind-camera projection (`.front` checked at lines 520, 565,
returns null/skips the draw) — rules out a naive near-plane perspective-divide blowup on an unguarded path.
**NOT YET FOUND: which of the function's several draw calls (grid bubbles / dimension chains / numeral
text / the upright plane's 2D projection) is the one producing the large region, and on what condition.**
**NEXT — bisect INSIDE the 2D compositor, same discipline, don't theorize:** add a `--tap` or temporary
early-return that disables one drawing block at a time inside `flythruDatumCompositeOntoCanvas` (bubbles,
then dimension chains, then text) and re-run the same 23-frame clip against the same 42/0 scorecard. Cheaper
still: build §41's `§MAXQ_FRAME_LUMA` first so the log names the exact bad frame's second, then read that
one frame's `_lines`/`sidesNow` state directly instead of bisecting blind a third time.
**DEAD, add to §51.4's list:** TAA × transparency (branch-A-only, now moot); the 3D ribbon group as the
primary cause (branch A only reduced 42→36, not to 0).

### 53. §DATUM_DECOUPLE, a second pass that burns the 2D datum layer in AFTER the GPU fold (2026-09-09, user directive: "decoupling separate pass sounds more better design")
**BUILT this session, scoped exactly to §53.4 — testing now.** `viewer/cinema_maxq.js` `_captureFrame`
gained an `A._burninDatumDir` branch (async, guarded — the normal path is byte-for-byte unchanged when
the flag is unset): loads a pre-extracted clean PNG for the frame instead of rendering, runs ONLY
`flythruDatumCompositeOntoCanvas` on top, skips every other overlay (already baked into the clean
source). `cli_silent_bake.js` gained `--burnin-datum-src clean.mp4`, which ffmpeg-extracts that video's
own frames once (cached in `out/<stem>_burninframes/`, reused on a re-run) and threads the URL dir
through `bakeOpts.burninDatumDir`. A frame-count mismatch fails loudly (`§DATUM_DECOUPLE_ERR`, an
unhandled rejection that reaches `__bakeResult.ok=false`), not silently. `node --check` clean on both
files. **KNOWN LIMITATION, not yet fixed:** this first cut does NOT skip the outer loop's still-refine
fold wait (`_waitFoldDone` etc. live outside `_captureFrame`, untouched) — so this run is not yet the
"cheap, no-GPU" version §53.2 describes, only the "no other overlay, no GPU render inside the capture
itself" isolation. Speed is a follow-up if this becomes the permanent architecture; correctness is
what's being tested right now.

**53.6 TWO BUGS FOUND AND FIXED BEFORE THE FIRST CLEAN RUN, both in the harness, not `cpe_flythru_datum.js`:**
1. **Hung entirely, 0 frames/580s+.** `A.startStillRefine()`+`_waitFoldDone()` (the per-frame outer-loop
   fold) never converges without real rendering — MEASURED, first attempt stalled behind `§IDLE_GATE`
   self-parking. Fixed: both calls skip when `A._burninDatumDir` is set (`cinema_maxq.js` ~line 1915-1944).
2. **`burninDatumDir` was silently dropped.** `window.__maxqBake` (the actual entry point
   `cli_silent_bake.js` calls) rebuilds its own literal for `start()` — `{editor, preview, override,
   overrideSource, frames, fps, forceWebm}` — and never forwarded the new field, so `A._burninDatumDir`
   was never set on the FIRST fixed attempt either, silently running the full normal path. Fixed:
   added `burninDatumDir: o.burninDatumDir` to that literal (`cinema_maxq.js` ~line 2545-2547).
3. **~3s dead gap per frame, found AFTER both fixes, on the run that finally worked correctly.**
   `_raf2()` (line 552) waits for two real `requestAnimationFrame` ticks, falling back to a 1500ms
   timeout each if none fire. With no `_composer.render()` to composite, Chromium never schedules a
   real rAF for the page, so both calls (`frame X settle` + `frame X capture`) hit their fallback every
   frame — MEASURED directly in the log: zero lines between `§FLYTHRU_DATUM_MARKS` (end of frame N) and
   `§PERF_TRAVERSE` (start of frame N+1), gap 2.9-3.3s, repeated every frame. Fixed: both `_raf2` calls
   skip when `A._burninDatumDir` is set (lines ~1769, ~1949).
**State when this session paused (user stepping away, machine may be busy elsewhere — bake killed
cleanly, not suspended mid-run per §CLI_BAKE_SIGINT discipline):** all three fixes applied, `node --check`
clean, not yet re-run with all three in place. `out/L2_datumoff_2026-09-09_burninframes/` (564 PNGs)
stays cached — a re-run reuses it, no re-extraction. **NEXT: re-run the same command (§53's
`--burnin-datum-src out/L2_datumoff_2026-09-09.mp4`, clip 0.75:0.87) and score with
`probe_film_flicker.py` against 42 (guilty) / 0 (innocent) per §53.3.** Should now run close to a normal
bake's pace (~1s/frame → ~10 min), not the ~50-75 min the un-fixed harness projected.

**53.0 HOUSEKEEPING, same session, before building.** `/tmp/wt-storey-reveal/out/` had grown to 1.2 GB /
369 files across the whole §24–§52 investigation. Cross-checked every filename against this prompts file
(cited-by-name = kept); removed ~400 MB of uncited ad-hoc frame-dump dirs (`f_blk/f_ctrl/f_tail/f_l2*
/f_pre*/f_sr`, `frames_plate`, `cmpA/cmpB/dA/dB`, all `snaps_*`), profiler temp dirs, and a handful of
stale/discarded logs (`Hospital_0-30s_boxes_2026-09-08.*` — the stale-JS discard §43 describes,
`HHS_FULL_480p_aoexclude_2026-09-09.log`, build/catalogue logs). 792 MB / 284 files remain — every large
file left is a film or log this section or an earlier one names by hand. Nothing cited anywhere in this
file was removed.

**53.1 WHY.** §52 pinned the cause to `flythruDatumCompositeOntoCanvas` (`viewer/cpe_flythru_datum.js:422`),
called once per frame inside `_captureFrame` (`cinema_maxq.js:791-793`) — AFTER `A._composer.render()`
has already finished the whole GPU fold (AO/TAA), onto a fresh 2D canvas snapshot of that finished
image. So it is already temporally last relative to 3D; nothing in the render pipeline can be
reordered to fix this. What CAN change is where the compositor is *invoked* — decoupled from the
GPU bake loop entirely, as a second, cheap pass over already-baked frames.

**53.2 THE DESIGN.**
1. Bake the film with the datum layer suppressed at the source (already possible: `--tap
   out/tap_datum_off.js`, or a proper `--no-datum` flag) — this is the expensive GPU pass, and it
   ships clean (measured: `L2_datumoff` = 0 jumps, max 8.5).
2. Extract that clean bake's frames with `ffmpeg -i clean.mp4 frame_%05d.png` (cheap, no GPU).
3. In the SAME browser page/scene (still needed — the compositor calls `A.ifc2three`, `A.camera`,
   and reads `_lines` built by `flythruDatumBuild`), loop the frame list: load each PNG onto a
   canvas (`drawImage`, no `_composer.render()`, no GPU fold at all), reconstruct `A.camera`'s pose
   for that frame from the bake's own `poses.json` (already produced, already used by
   `probe_plate_flicker.py`/`probe_film_flicker.py`'s siblings), call
   `flythruDatumCompositeOntoCanvas(ctx, w, h, filmSec, filmSecFull)` unmodified, `canvas.toBlob`.
4. Re-mux the resulting frame sequence to mp4 with ffmpeg.
**No change to `cpe_flythru_datum.js` itself for this step** — the same function, same inputs,
different caller and timing. That is the point: it isolates WHEN it's wrong.

**53.3 WHAT THIS BISECTS, and it is a real bisect, not just a workaround.**
- If the decoupled pass **reproduces** the 42/59.6-style jumps on the same film seconds: the bug is
  in the function's own math/state (candidate already read, §52: `_sides` is latched once via
  `if (!_sides) { _sides = sidesNow; }` and never recomputed — worth logging `_sides.key` per frame
  across the LIFE1→LIFE2 relaunch to see if it's reused stale). Fix it there, and the decoupled
  architecture is worth KEEPING anyway (cheaper iteration: no GPU needed to test annotation changes).
- If it does **not** reproduce: the defect depends on being invoked inside the live GPU bake loop —
  e.g. WebGL context / 2D canvas state interaction on the same page, or a timing issue with
  `A._composer.render()` and the 2D read happening in the same tight per-frame loop. That would be a
  DIFFERENT and more surprising finding, and the decoupled pass becomes the permanent fix regardless
  of whether the mechanism is ever fully named.
**Either outcome moves the investigation forward and either outcome ships a clean film** — the
decoupled pass produces the final annotated video either way once it's built.

**53.4 SCOPE, DELIBERATELY NARROW.** Only `flythruDatumCompositeOntoCanvas` moves to the second pass
for this spec. `flythruCuesCompositeOntoCanvas`, `linearBeatCompositeOntoCanvas`, `slabBeatCompositeOntoCanvas`,
`indoorBeatsCompositeOntoCanvas`, `flyoutBeatsCompositeOntoCanvas` and the clash/HUD layers are all
proven innocent (§48, §50, §52) and STAY in the live per-frame pass. Do not decouple layers that
aren't guilty — that would just add a second pipeline with no diagnostic or shipping value.

**53.5 OPEN QUESTIONS FOR WHOEVER BUILDS THIS (answer before coding, not while coding):**
- New script (`scripts/burn_in_datum.js`?) vs. a `cli_silent_bake.js --burn-in-datum <clean.mp4>` mode
  reusing its existing puppeteer/page setup and `poses.json` reader.
- ffmpeg round-trip (extract → PNG → re-encode) vs. keeping frames in memory if the frame count is
  small enough for a single clip (564 frames at 720p is not large).
- Does the live EDITOR preview (not the bake) also need this split, or is the flicker bake-only
  (the fold's TAA accumulation timing may not exist at all in live preview — unconfirmed, check before
  assuming the live path has the same bug).
**NEXT: build the decoupled pass for the LIFE2 clip only (`--clip 0.75:0.87`, the same 23 s window
used throughout §42–§52) and score it — one bake-free-ish run (only the extraction/re-encode needs
`ffmpeg`, the projection pass itself needs no GPU) answers 53.3's either/or.**

### 56. ⛔ TWO NEW ITEMS for the next session, straight from the user, documentation only — no code
touched for either this session, both below are specs to pick up, not fixes already tried.

**56.1 Prolong the Measure info box past its marker's own on-screen life.** User: "the marker line on
canvas may disappear out of frame but the info box should linger on as the next marker has not shown
up yet, so that user can eyeball what just went past." MECHANISM, already traced (no guessing needed
next session): `A.filmBoxesDrawMeasure` (`cpe_film_boxes.js:208`) reads and **drains the WHOLE queue
every single frame** — `var q = _queue; _queue = []` — so the box shows content ONLY on frames where
something actually posted that frame, and goes blank the very next frame nothing does. THREE
independent beats post into this ONE shared queue, each gated by its own "is my marker currently
on-screen" condition, with no linger of their own:
- `cpe_slab_beat.js:517-518` — `if (!_beat || !_labelOn || !A.filmBoxesMeasurePost) return 0;`
- `cpe_flythru_cues.js:449` and `:507`
- `cpe_flyout_beats.js:243`
A per-beat fix would mean touching all three call sites identically (repetition, easy to drift out of
sync). The cleaner fix is almost certainly CENTRALISED, at the shared queue/draw layer itself
(`cpe_film_boxes.js`): when `filmBoxesDrawMeasure` is called on a frame where nothing posted, and the
LAST successfully-posted entry is still within some linger duration, redraw THAT last entry instead
of going blank — clearing it only once the linger expires OR a genuinely new entry posts (whichever
comes first, so a fast-arriving next marker still cuts over immediately rather than queueing behind
a stale one). Use **FILM SECONDS for the linger timer, never wall-clock** — this codebase's own
established pattern everywhere pacing matters (`clash_film.js`'s pulse envelope is the explicit
model: "never performance.now(), so a 15fps and 24fps bake pulse identically and a re-bake is
reproducible"). No linger DURATION has been chosen or measured yet — start by measuring how long a
marker beat's own posting window actually runs today (log evidence, not a guessed number) before
picking one.

**56.2 Storey-level highlight is "hardly recognizable" — CONFIRMED STILL OPEN, this is the SAME
complaint as §55.6 item 1, now reinforced by the user a second time** ("was tried few times without
success"). Facade-only tint (§FACADE_ONLY_TINT, shipped `7e4fa316`) is mechanically correct and
verified on two buildings (§55.2, §55.5) but touches only 3-16 wall elements per storey — visually
too subtle to read clearly on screen, exactly as §55.6 already flagged. §55.6's own next steps still
apply unchanged: do not guess a fix (brighter colour vs a facade outline/edge-glow vs widening which
IFC classes count as facade — currently only `IfcWall`/`IfcWallStandardCase`/`IfcCurtainWall`, not
`IfcWindow`/`IfcDoor`/curtain-wall sub-elements) — extract a witness first (actual on-screen pixel
coverage of the tinted facade vs the rest of the frame, or total facade surface area vs total storey
surface area) before picking a direction. **Two mechanisms (x-ray, darken-above) were already tried
and abandoned before facade-only shipped (§55.1) — this recognisability problem is NOT a reason to
revisit either of those; it is a problem with facade-only's own visual weight, to be solved within
that mechanism** (bigger/brighter/outlined facade tint), not by reverting to a mechanism already
proven to have worse problems (uneven lighting, per-pixel cost, or both).

### 54. ✅✅ THE FLICKER IS FIXED — root cause and fix, both measured (2026-09-09, bim-ootb `2a2d32ec`)
**Session start note:** `/tmp/wt-storey-reveal` had been wiped (tmp cleared between sessions) — the
worktree, `out/L2_datumoff`/`L2_nomeasure`, `tap_datum_off.js`, cached burn-in PNGs, all gone. The
`feat/measure-boxes` branch @ `067d8dd4` was intact and pushed, so nothing was lost — the worktree was
recreated (`git worktree prune` then `git worktree add`), the Hospital DB copied back in from
`bim-ootb/buildings/`, and `tap_datum_off.js` retyped verbatim from §49.1's own listing. Rebuilt clean
plate (`out/L2_datumoff_2026-09-09.mp4`) scored **0 jumps, max|dY|=8.5** — bit-identical to the original
§50 result, confirming the rebuild is faithful before spending it as the burn-in's input.

**54.1 §53.3's BISECT RAN — REPRODUCED.** The decoupled burn-in pass (datum composited onto the clean
plate, GPU fold entirely skipped) scored **47 jumps, max|dY|=62.9**, at the same film seconds as the
live-loop baseline (§48's 150.55/150.96/151.01/151.34/151.92…, within one frame). Per §53.3: reproduction
means the bug is in `flythruDatumCompositeOntoCanvas`'s own math/state, not a live-GPU-loop timing
interaction — **the decoupled architecture, while worth keeping for cheap iteration, was never going to
be the fix.**

**54.2 ROOT CAUSE.** Instrumented `plane()` (`viewer/cpe_flythru_datum.js:518`) to log the max
`|affine basis|` across every `plane()` call in a frame (`maxPlaneScale=`, appended to the existing
`§FLYTHRU_DATUM_MARKS` line), re-ran the same decoupled bake, and correlated per-frame against
`probe_film_flicker.py`'s luma jumps (`out/L2_diag_2026-09-09.log`):
```
frame  dY     maxPlaneScale
  88   21.3   127561
  89   30.2    91854
 108   24.0   280710
 152   55.7   182079
 153   62.9   104096
 195   16.8   152537
```
**All 47/47 jump frames carried a maxPlaneScale of 14,000–385,750 on a 1280×720 canvas** — 10×–300× the
canvas width. `pr()`'s only guard (`vs.z < -0.1`, camera-space depth) tests whether a point is in FRONT
of the camera; it does not bound lateral screen extent. A datum anchor point close to the camera but
off to the side passes that guard while its NDC projection is enormous, and `plane()` builds
`ctx.setTransform`'s basis straight from `U-O`/`V-O` with no magnitude check — one glyph or bubble draw
gets scaled up into a giant colour blob for that single frame (matches §50.2's "35–40% of the frame,
plane-shaped, both directions" measurement exactly: an oversized dark `HALO` stroke swallowing bright
sky pixels, or an oversized `INK` fill, depending which mark went degenerate). §52's own code-read had
already ruled out a *naive, unguarded* near-plane blow-up — this is the guarded-but-insufficient version:
the guard exists, it just only checks depth, not extent.

**54.3 THE FIX.** `plane()` now rejects (returns `null` — same as its existing behind-camera path,
`withPlane()` already treats `null` as skip-draw) any transform whose basis exceeds
`Math.max(w, h) * 4`. A legitimate mark never needs a basis vector anywhere near canvas size, so any
larger multiple is degenerate by construction, not a real large draw. Counted (`degenerate=`, same log
line): **284/489 frames (58%) in the LIFE2 window had at least one mark rejected, 648 rejections total**
— this was firing on more than half the frames, not a rare edge case.

**54.4 VERIFIED, both paths:**
| run | jumps `|ΔY|>15` | max |ΔY| |
|---|---|---|
| baseline (guilty, pre-fix, live loop, §47) | 42 | 59.6 |
| decoupled burn-in, pre-fix (§54.1) | 47 | 62.9 |
| **decoupled burn-in, WITH FIX** (`out/L2_fixed_2026-09-09.mp4`) | **0** | **9.0** |
| **live production GPU path, WITH FIX, no decoupling, no stubs** (`out/L2_livefix_2026-09-09.mp4`) | **0** | **9.3** |
| datum-off / Measure-off zero-flicker controls | 0 | 8.5 / 9.2 |
Post-fix `maxPlaneScale` never exceeds the guard threshold (max observed 5,119 vs cap 5,120 — bounded by
construction). The live-GPU run is the real production path (full fold, AO, TAA, `--gpu real`, no
`--tap`, no `--burnin-datum-src`) — **the fix is not a diagnostic-path artifact, it holds in the actual
shipped pipeline.**

**54.5 STANDING CORRECTION.** §46 named the SSAO/N8AO depth prepass; §48 disproved it (36≠0). §50/§52's
bisect correctly pinned the 2D compositor but stopped at "which draw call" without a mechanism. This is
the mechanism, and it required per-frame numeric instrumentation (`maxPlaneScale`) rather than another
round of mechanism-guessing — consistent with §49.5's process rule: bisect to the LAYER, then instrument,
don't theorise from a correlation window.

**54.6 STATE.** bim-ootb `feat/measure-boxes` @ `2a2d32ec` (7 prior commits + this fix), worktree
`/tmp/wt-storey-reveal`, **not pushed — commit locally, ask before push per session norms.** Diagnostic
films kept in `out/`: `L2_datumoff_2026-09-09.mp4` (clean plate, 0/8.5), `L2_diag_2026-09-09.mp4`
(pre-fix decoupled + maxPlaneScale log, 47/62.9), `L2_fixed_2026-09-09.mp4` (post-fix decoupled, 0/9.0),
`L2_livefix_2026-09-09.mp4` (post-fix live production path, 0/9.3). **§40's work was already DONE and
user-accepted (§51.5); this section closes the one item §51.5 left outstanding — the flicker.** Nothing
else is currently open on this file.

