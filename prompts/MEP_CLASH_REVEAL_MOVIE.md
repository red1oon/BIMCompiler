# ⚠ DO NOT REMOVE — MEP Clash-Reveal Movie lane. Read the log after every run (CLAUDE.md Log Mandate:
exit code is not evidence). This file keeps ONLY the compact recap plus everything ACTIVE; the full
history behind every closed item lives in `archive/`:
`MEP_CLASH_REVEAL_MOVIE_archive_2026-09-06.md` (§1-§37, 1,878 lines),
`..._archive_2026-09-11.md` (§38-§56, the screen-furniture spec + the flicker saga, 1,095 lines),
`..._archive_2026-09-14.md` (the §57-§96 tint era, §PENDING, §91 and §94-§96, 5,508 lines).
Consolidate again on sight past ~2,400 lines — don't wait to be asked.

> **SESSION OPENER — paste this to start the next session:**
> *Read `bim-compiler/prompts/MEP_CLASH_REVEAL_MOVIE.md` — start at this NEXT SESSION DO THIS line,
> then the ONE-LINE STATE, then §128 — read §128.0 FIRST: it holds the silent-DB paths and the SQL to
> interrogate them, the ready-made bake invocation with its gotchas, and the witness discipline, so
> nothing has to be re-derived. §128 is the live work; §115-§127 shipped but is not yet proven on
> frames; everything above §97 is closed and lives in `archive/`. The whole live file is ~600 lines —
> read it. Code: worktree `/tmp/wt-storey-cut`, branch `feat/storey-section-cut`, based at `d51362c3`,
> ALL UNCOMMITTED. Films the report is against: `~/Downloads/HHS_FULL_1080p24_2026-09-14.mp4` and
> `~/Downloads/Terminal_FULL_1080p24_2026-09-14.mp4`. Silent DBs: `~/Downloads/<Name>_silent.db`
> (HHS_Office_Federated, Terminal, Hospital). Every bake goes through
> `/tmp/wt-bake-perf/bake_scope.sh` or it kills the session (§128.0).*
>
> **NEXT SESSION, DO THIS:** the storey-reveal leg (`cpe_storey_reveal.js`) is broken in shared code and
> leaks past its own window on every building — go to §128, reproduce it on any silent DB, write a
> witness that FAILS before changing a line, fix it once for all models, and touch nothing else in the
> film. Judge from § lines in the `.log`, never from frames — frames are the user's report, not your
> evidence.

**ONE-LINE STATE (2026-09-14 hand-off — THE REVEAL IS NOT DONE):** the closing reveal is a per-storey
SECTION CUT whose plane faces the camera (§102, one rule, no world axis, no Z branch), a pass = one
storey WITH its floor slab after a ground-slab pass (§106), pseudo storeys found by DOOR COUNT with
the roof as the last pass (§103), slot time weighted by element quantity and solved by bisection
(§107/§110/§120), the cut scoped to the building with the ceiling on its own materials (§105/§112) and
per-member banding read from `element_transforms.center_z` (§125/§127). Interior lights are OFF from
the last stick, all four emitter families (§116/§118). **BUT §128: the user reports on frames that
floor slabs are not drawn, a blue tint draws ahead of walls, the storey order is wrong and the last
storey's animation is missing — the SAME four on BOTH HHS and Terminal, so it is one defect in the
shared code, and on Terminal the last storey's ARC is still missing at ORBIT END, i.e. the leg leaks
past its own window. Every witness on those bakes reports PASS. START AT §128. Scope is the storey-
reveal leg and its restore ONLY — the rest of both films is accepted.** The
method is fixed and not negotiable: read code and data first (GIGO), express each symptom as a number
that must be zero, prove the witness can FAIL before believing a PASS, no band-aid fixes, no
per-building treatment, abstract comments. Code in worktree `/tmp/wt-storey-cut` on branch
`feat/storey-section-cut`, all UNCOMMITTED. Verdicts LOCKED: no tint, no fade, no darkening, no lit
edge, no rake, clash/Sanity layers stay on.

**New session, in this order:** §128 FIRST (its §128.0 holds the DB paths, the bake invocation and the
witness discipline). Then §97 for the locked rulings, §102-§114 for how the cut works today, §115-§127
for what shipped but is not yet proven on frames. Everything else is closed — see the archive above.

## CLOSED BAND — compact recap (full detail in `archive/MEP_CLASH_REVEAL_MOVIE_archive_2026-09-14.md`)
The lane began 2026-08-07 as a triage against a competitor MEP-coordination capture; the finding was
that it needed a new CAMERA MODE + VISIBILITY MODE over data that was already real. Merged and closed
since, in order: auto camera-path generation (the beat mechanism everything rides on); §CLASH_FILM_P1/
P2/P3 mesh-true clash markers with on-screen tol/depth labels; §MESH_OVERLAP_DEPTH; §CLASH_HUD_CARD;
§NIGHT_BUILDUP_GATE and the PL intensity convention; §SUN_ARC_TOPOUT_SNAP (shipped then REVERTED on the
user's ruling — the linear 55deg->6deg arc was always correct); §PL_TOPOUT_UNPIN (#1690);
§STOREY_HIGHLIGHT_REVEAL's tint era (§57-§93) — abandoned, measured, replaced by the section cut;
§FLYTHRU_DIMENSIONS; §ENDING_CHOREOGRAPHY; the §PENDING band; §91 (bake kills the session — the rule
survives as §128.0's bake block); §94 (section-cut implementation spec); §95/§96 (the three fleet
reveal windows and the first cross-fleet run).
**Still open from that band and NOT part of §128:** §57.3 HHS cruise-beat flicker (~74-76s; read
§58.2b first, it rules out the interior point-light system); §58.3 storey darkening, reproduced live
but only on software rendering; §ELEMENT_LABEL, spec-only, never built.

## §97 USER RULINGS ON THE REVEAL, 2026-09-13 — read before re-proposing anything below
**97.1 NO DARKENING OF THE OTHER STOREYS.** Proposed in session (tint replaced by darkening the
already-revealed storeys, with everything restored on the last storey), then ruled out by the user:
*"should the darken lower storeys happen? I think better not.. it be over drawing"*. Same standing as
§92.8 and the sun-arc revert — **do not re-propose without a new user ask.** The supporting evidence,
so nobody re-derives it: the cut already carries the contrast (geometry present vs removed is a
stronger cue than a tonal one, so darkening is a second signal for the same fact); it would cost
~46k per-instance `setColorAt` writes per slot against the tint's 2-51 (Level 4 alone is 11,470
elements, §92 working notes); and `§SUN_ARC_STEP` reads 7.9deg-17.7deg through these windows, so much
of the building is already in shadow and would not visibly change. The "restore everything at the
end" payoff the darkening was meant to buy is already delivered geometrically — §96.2, the sweep
finishes at the queried model top and the building is whole in the final slot.

**97.2 THE CUT IS ONE BEAT ON WHICHEVER AXIS THE CAMERA WANTS.** User: *"It is simply dynamic in
reveal to cam pov either ZXY, reverse section cut build into cam"*. So there are not two features:
the plane always starts at the FAR face and travels INTO the camera, and the axis is chosen from the
camera. For an overhead rig that is the vertical axis (the rising cut IS "toward the camera"); for an
eye-level rig it is horizontal. §96.2's Hospital behaviour already satisfied this; the horizontal case
had to be corrected twice to match (§96.8 direction, §96.9 below).

**97.3 SNAP THE HORIZONTAL AXIS TO WORLD X OR Y, NOT THE CAMERA DIAGONAL.** User: *"i meant is just X
or Y depending on angle of cam. And it be less confusing."* An axis-aligned section reads as a
section; a plane normal taken from the raw camera-forward reads as an arbitrary slice. Implemented by
comparing |fwd.x| against |fwd.z| (DB X/Y map to scene x/z — the loader's axis swap sends iy -> -z)
and logged as `worldAxis=` on `§STOREY_CUT_AXIS`. Verified live on HHS: `axis=XY pitchDeg=10.4
worldAxis=X`.

**97.4 THE SWEEP IS CUMULATIVE ACROSS THE WINDOW — one arrival, not one per slot.** User: *"It is not
doing it storey by storey! ... If it follows the timings"*. The first horizontal implementation drove
depth from `cut.k`, which runs 0..1 INSIDE each storey's slot, so the whole sweep restarted every slot
and the building vanished and rebuilt once per storey. Correct form is `prog = (idx + k) / n`: each
slot advances the plane one step toward the camera and then holds, so the storey timings pace a single
arrival. The vertical axis never had this bug — its cut Z climbs the storey ladder cumulatively by
construction — which is why the two axes disagreed and why §97.2's "one beat" framing is the test any
future change must pass.

**97.5 AXIS-CHOICE THRESHOLD — do not replace 25deg with a strict dominant-axis rule.** A strict
"whichever of Z/X/Y the camera most aligns with" flips where |fwd.y| overtakes the horizontal
magnitude, i.e. at exactly 45deg. Hospital's reveal rig measures 45.7deg drifting to 47.2deg across
its window (§93.5) — 0.7deg from the boundary and on it for the whole beat. The 25deg threshold
expresses the same intent without that instability; Terminal (-2.0deg) and HHS (10.4deg) are nowhere
near either boundary.

## §98 THE REVEAL IS ONE BEAT: STOREY = OUTER LOOP, SECTION CUT = INNER LOOP (2026-09-13, settled
## with the user across a long live iteration — read this before touching cpe_storey_reveal.js)

**98.1 THE SHAPE, in the user's own words:** *"a. X or Y storey by storey reverse section cut in 1.5s,
then .5s pause, then the next upper storey does the axis section reverse cut"* and *"The storey is
main loop, the reverse section cut is the inner loop"*. So: the outer loop walks the storeys upward;
inside each storey's slot a plane sweeps from the FAR face toward the camera, filling that storey in;
then a pause; then the next storey up. Storeys ABOVE the current one are hidden outright, storeys
BELOW are already solid.

**98.2 IT IS EXPRESSED AS `keep = (y <= ceil) AND ((y <= floor) OR (f.p >= d))`.** That is an AND over
an OR, which one plane array cannot say in either mode. THREE's TWO clipping levels say it exactly:
`renderer.clippingPlanes` is ALWAYS intersected with the material's, so the ceiling goes GLOBAL and
the (floor OR sweep) pair goes on the material with `clipIntersection = true`. Nothing else in this
viewer sets the global array. `clipIntersection` was already in this build (`navigate_find.js:1818`,
§ROOM-CLIP, THREE r184) — this is reuse, not a new trick.

**98.3 THREE CORRECTIONS THE HORIZONTAL CASE NEEDED, each caught by the user on frames.**
- **Cumulative, not per-slot.** The first version drove depth from the slot-local fraction, so the
  whole sweep restarted every storey and the building vanished and rebuilt once per storey. The
  vertical axis never had this bug (its cut climbs the storey ladder by construction).
- **Snap the axis to world X or Y**, not the camera-forward diagonal (*"i meant is just X or Y
  depending on angle of cam. And it be less confusing"*). An axis-aligned section reads as a section;
  a diagonal one reads as an arbitrary slice.
- **LATCH the axis for the whole window** (*"HHS was starting on one axis when it switched to another.
  Perhaps it just persist? ... it is still consistent and that is more important optics"*). Both halves
  of the decision were being recomputed per frame, so a rotating camera flipped the cut 90deg mid-beat.
  The sweep SIGN is latched too, or the sweep reverses when the camera crosses the diagonal. Note the
  log was hiding it: `_cutAxisLogged` keyed on `'XY'` alone, so a world-axis flip never printed. Any
  log gate must key on the FULL decision.

**98.4 MEASURED AXIS FACTS.** Hospital's reveal rig is 45.7deg->47.2deg DOWN at a locked 20 m;
Terminal's is -1.8deg->0.0deg at 20 m; HHS's is 10.4deg. §97.5's warning stands — do not replace the
25deg threshold with a strict dominant-axis rule, which flips at exactly 45deg with Hospital sitting
on the boundary for its whole beat.

## §99 WHAT SHIPPED WITH IT, AND THE ONE THING THAT DID NOT

**99.1 THE SLAB LEADS.** (*"the floor slab to cut first too ... this lends to visual cognition well"*.)
Within a storey's sweep the plate arrives over the first `SLAB_LEAD_FRAC` (0.35) and the rest of the
storey follows onto a ground the eye can already read. Separable because the batch bucket key carries
`ifcClass` (`streaming.js:2210`, §BATCH_BUCKET_CLASS_PAINT), so a BatchedMesh holds exactly one class
and its material can take its own plane. Two material groups, two plane arrays, same global ceiling.

**99.2 THE BANDS ARE REAL SLAB ELEVATIONS, NOT MIDPOINTS OF STOREY MEANS.** §94.2 predicted this
refinement; the user found it on frames first (*"I don't see the floor slabs section reveal. The top
roof came first before the storey in it"*). Measured on HHS: Level 1's band by midpoint ran 0.74..4.30
while Level 2's floor slab sits at 3.50..3.98 — INSIDE it — so with slabs leading, the storey above's
plate arrived first and capped the storey being revealed. Real bottoms are -0.21 / 3.50 / 7.00.
On Hospital the difference is up to 1.3 m per boundary (midpoints gave
`[171.77,177.27,182.22,186.93,191.37,195.39,198.81]`, real slabs give
`[171.66,176.66,181.66,186.66,191.66,196.66,199.66]`), `fromSlab=7 fromMidpointFallback=0`.

**99.3 THE PLATE CLASSES ARE DERIVED FROM THE DB.** The band query pinned `ifc_class='IfcSlab'`, which
silently misses any model whose plates are `IfcCovering`/`IfcPlate`. It now asks the DB which classes
the building carries, filters them through a seed regex, and uses that SAME set for both the band
boundaries and the material split so the two halves cannot disagree. Both HHS and Hospital resolve to
`[IfcSlab,IfcPlate]`. A model with none falls back to midpoints and nothing leads —
`§STOREY_CUT_BOUNDS` prints `slabClasses=[...] fromSlab= fromMidpointFallback=`, so a miss is visible.

**99.4 THE LIT CUT EDGE WAS BUILT, THEN REMOVED ON THE USER'S CALL — do not rebuild it without a new
ask.** *"that edge liting is noisy with something going ahead first ... let's try with no such gimmick.
Conservative look, storey by storey sweep horizontally revealing more buildup action. Thus the code is
cheap and simple, static"*, plus *"it gives relative longer linger time for viewers to appreciate its
gradual buildup"*. The noise was structural: the slab leads, so geometry arrives AHEAD of any marker
riding the main sweep. "Light the edges as they appear" would need a per-frame edge-detection pass
over the scene — real cost for decoration. 123 lines removed. What it cost to learn, so nobody repeats
it: a `LineLoop` draws at 1 device pixel whatever the bake resolution (WebGL ignores
`LineBasicMaterial.linewidth`); a ribbon laid FLAT is seen edge-on by a shallow camera (a 3 m
diagnostic width projected to ~0.5 m and drew 4-260 px); and pixel-counting a 38%-opacity mark is not
a test — `#66ccff` at 0.38 over a dark interior composites near `(76,115,134)` and fails any naive
"is it cyan" threshold, so a zero count proves nothing.

**99.5 AN INSTRUMENT WORTH KEEPING.** `§MAXQ_FAIL` reports a message with no location. Three bakes were
spent narrowing a crash by elimination; a `§STOREY_CUT_FAIL` try/catch that prints `e.stack` found it
in ONE five-frame run — and the culprit was a stale `out.planes.length` in a LOG line, not in the cut.
Add the stack capture FIRST next time. Decoration is also wrapped so it can never abort a bake; that
guard fired for real (`§STOREY_CUT_EDGE FAILED ... CUT_EDGE_W is not defined`) and the bake still
finished `fileOk=true`.

**99.6 AXIS OVERRIDE FOR A/B:** `window.__storeyCutAxis = 'XY' | 'Z'` (unset = derive). The open
question it exists for: does a VERTICAL cut also read under an OVERHEAD rig? If yes, the Z branch and
the 25deg threshold can both go. Not yet run.

## §100 THE RAKE — MEASURED, THEN DROPPED. LOCKED, do not re-propose.
A tilted plane (`f.p - k*y >= c`) to overlap storeys, with `k` derived from the model. Baked on HHS:
`k=7.14 tiltFromHorizontalDeg=8.0`. It works mechanically and DESTROYS the beat — the tilt is exactly
what removes discreteness, so one plane cannot give overlap AND storey identity; at prog 0.34 the card
read "Level 2" over one diagonal slice of the whole building. User: *"The rake seems ugly and cheap...
Drop that for simplicity."* `CUT_RAKE_OVERLAP = null`. Code path kept only so the finding reproduces.

## §101 THE SUN HALT — CLOSED, cause was the cut's own hold, not the sun.
`PHOTO_SUN_AZIMUTH` is a CONSTANT (`effects.js:2681`): measured across 289 frames the azimuth is
-110.0000deg with ZERO change while elevation moves -3.01deg, so shadows never rotate anywhere in the
film — they only lengthen along one bearing. The halt is reveal-specific because `_armCut` sets
`clipShadows = true`, making the shadow-casting geometry the CUT: the slot holds for its last quarter
(27 frames of sweep, then 9 frames frozen, eight times on Hospital), and each storey adds ~26m of cast
shadow at 10.8deg, so the shadow leaps then dead-stops. Camera is not the cause — 0.11 m/frame
throughout. **Do not touch the arc without a new user ask** (§SUN_ARC_TOPOUT_SNAP was shipped and
reverted once already). User after §110's longer sweeps: *"Shadow flow smooth."*

## §102 ONE RULE FOR THE CUT: THE PLANE FACES THE CAMERA (2026-09-13, user; SUPERSEDES §97.3/§98.3)

**102.1 THE ASK, and it reverses an earlier ruling.** *"Angle of cut I want to review not to be XYZ
but simply from afar towards cam pov. This also ensure standard code applicable irrespective of
angle."* Then, on the Z branch: *"It replaces the Z rule too. Thus there is only ONE rule. Period."*
So §97.3's world-X-or-Y snap and §97.5's 25deg threshold are both RETIRED, on the user's own later
call. Do not re-snap to a world axis without a new ask.

**102.2 PITCH IS DISCARDED — the plane stays VERTICAL.** Baked both readings on Hospital at 854x480
to settle it: `mode=level normal=-0.792,0.000,0.611 tilt=0.0` against `mode=raw
normal=-0.553,-0.716,0.426 tilt=45.7`, same rig, `camPitchDeg=45.7`. Taking the full camera vector
tilts the plane by the rig's pitch, which is geometrically the rake already dropped in §100.6 — so
the bearing is taken from the camera's AZIMUTH only. `raw` was then deleted; there is one path.

**102.3 WHAT IT DELETED.** `CUT_PITCH_DEG`'s test, the `useX`/`sign` world-axis snap, the whole
`axis === 'Z'` branch, and §99.6's open A/B question. The latch survives (§98.3's reasoning is
unchanged — a bearing is a camera quantity, so a rotating camera would rotate the cut mid-beat).
Proof it fires on the case that used to go Z: `§STOREY_CUT_BEARING ... camPitchDeg=45.7` on Hospital.

## §103 PSEUDO STOREYS — DERIVED FROM DOOR COUNT, NOT ELEMENT COUNT (2026-09-13, user)

**103.1 THE ROOF IS ITS OWN LAST PASS.** *"Since roof is highly visible, it can be accepted as a last
single pass."* So the TRAILING run of pseudo bands is not absorbed downward — it becomes one final
pass. Only INTERIOR pseudo bands absorb into the storey below.

**103.2 DOORS ARE THE PREDICATE.** *"I suspect 0 doors is the pseudo floor thus has to combine with
another."* Measured, and the gap is wide on both fleet buildings: Hospital's occupied storeys carry
56/73/88/96/114 doors while Level 6 carries 5, Level 7A 0 and Level 7 1; HHS carries 34/39/43 against
Roof Level's 0. `PSEUDO_FRAC = 0.10` of the MEDIAN door count puts the line at 6.45 (Hospital) and
3.65 (HHS) with nothing near it. Element count could not see Level 6 at all (1,487 elements = 20.8%
of median, comfortably "real") — that is the floor the user spotted on the card.
**CONSEQUENCE, FLAGGED AND NOT YET OVERRULED:** Hospital's roof pass is `{Level 6, Level 7A, Level 7}`
= 1,756 elements, so Level 6 — a real band 30x bigger than the plant decks — rides the roof pass.

## §104 THE SWEEP IS MANDATORY, AND THE WINDOW IS SIZED BY THE BUILDING (2026-09-13, user)

*"Too fast, mandatory 1.5s to reveal each storey."* The fit used to pack storeys in at
`MIN_SLOT_SEC=1.0`, so Hospital's 12.04s window split 8 ways into 1.51s slots whose SWEEP was
0.75 x 1.51 = 1.13s. Two changes: the slot budget is the real `CUT_SWEEP_SEC + CUT_PAUSE_SEC = 2.0s`,
and the reveal window is sized as the sum of the slots the building actually needs instead of a fixed
`STOREY_REVEAL_WINDOW_SEC = 10`. Fixed 10s was the §92.4 defect twice over — too fast at 8 storeys,
then TRUNCATING the top group once the slot budget became real.
**EPSILON, worth recording:** the window arrives in cpe_storey_reveal.js as `windowFrac x durationSec`
and comes back 11.99987 for a 12.00s window, so a bare `floor()` said 5 slots and truncated the top
group off a window sized precisely to hold it. `+ 1e-6`.

## §105 THE CUT IS SCOPED TO THE BUILDING, NOT THE SCENE (2026-09-13, user)

*"Silhouette background buildings still got cut scoped into action. This points to code not been
abstract to apply consistently to any building."* Correct, and the cause is scoping at BOTH clipping
levels: `renderer.clippingPlanes` is global to everything drawn, and `_armCut` walked
`A.collectMeshes`, which traverses the whole scene (`helpers.js:20`, excluding only `A.ground`).
HHS exposed it because its bands are low (`tops=[3.50,7.00,15.07]`, so storeys 1-2 put the ceiling at
3.50m/7.00m and beheaded the context city there); Hospital's sit at 164-204m, above its context —
which is exactly why the same code looked building-specific.
**THE FIX:** arm only objects that carry a storey (that IS the test for "the building being
revealed"); the renderer's global array is left EMPTY; the ceiling half of §98.2's predicate becomes
visibility. Measured: `contextObjsUntouched=45 globalPlanes=0` on both buildings. A material shared
across the subject/context boundary is cloned for the CONTEXT side (always the smaller set) —
`contextClonesForSharedMat=0` on both, so the fleet does not actually share any.

## §106 THE GROUND SLAB LEADS, EVERY OTHER SLAB TRAVELS WITH ITS STOREY (2026-09-13, user)

**106.1 THE ORDER.** *"Floor slabs after the ground one goes along with its storey it's supporting.
1. Ground floor slab. 2. 1st storey. 3. Floor slab together with its 2nd storey..."* A slab supports
the storey ABOVE it and §99.2 already bands from real slab bottoms, so every slab from the 2nd up is
already inside the band of the storey it carries. The GROUND slab is the exception — nothing below it
— so it takes a pass of its own at the front, one extra slot.

**106.2 ACCOMPANYING, NOT LEADING — §99.1's SLAB_LEAD_FRAC IS RETIRED.** *"I see the floors still not
accompanying 2nd storey onwards."* The 0.35 lead put the plate down over the first 35% of the slot and
only then swept the storey onto it. With the ground plate now having its own pass, every remaining
slab rides the SAME plane as its storey: `slabK === restK`. Three kinds of slot, and the log names
each: ground-slab (`slabK` sweeps, `restK=0.00`), Level 1 (`slabK=1.00`, `restK` sweeps), every storey
above (`slabK === restK`).

**106.3 THE SLOT INDEX IS NO LONGER THE GROUP INDEX** — the ground-slab pass occupies slot 0 without
being a group, so `_applyHideAbove` must use the band index `si` (resolved by name), not `cut.idx`.
Missed on the first bake: the top two slots hid nothing.

## §107 SLOT TIME (2026-09-13, user) — WEIGHTED BY QUANTITY, PAID FOR OUT OF THE LULL

**107.1 WEIGHTED.** *"This gives more time slots to each storey not to rush is needs > 2s due to its
qty."* A storey's sweep scales with how much arrives in it, against the median storey. Slots are no
longer equal, so `storeyRevealVisualAt` reads cumulative `_slotBounds` instead of `1/list.length`.

**107.2 STEAL BEFORE GROWING — and the film never gets longer.** *"Taking up path time as it is, not
lengthening the movie duration"* and *"if U can steal time from prior to the lull ie mid pull out, it
be good effect for smoothness."* So the window first runs BACK through the beats that feed the orbit
(reveal, then flyback, then pullout) at no cost to anything — those seconds are already in the film.
Only the shortfall past that lull grows the pull-back's share, solving
`rise/(shapeWithoutRise + rise) = wantRealSec/durationSec`, capped at `RISE_GROW_MAX = 0.45`.
Measured: Hospital `lullBehindSec=77.37 stolenSec=40.24 pullbackGrewBy=0.00` — free. HHS measures
**0s for reveal, flyback AND pullout**, so it is the one case that must grow (2.74 -> 3.87s shape,
later 7.39s at §110's budget). Stealing from neighbours alone does NOT generalise — that was tried
first and left HHS truncating Level 3.

## §110 EACH PASS BREATHES (2026-09-13, user)

*"Make each slab+storey reveal to enjoy as much slot time as it helps in cinematic effect."* The base
sweep is no longer pinned at §104's 1.5s FLOOR — it is SOLVED from the window the film can afford
(pauses off the top, the rest divided by the sum of the quantity weights), clamped to
`[CUT_SWEEP_SEC, CUT_SWEEP_MAX]` with `CUT_SWEEP_MAX = 2 x CUT_SWEEP_SEC`. Twice the floor: enough for
a heavy storey to read as an event, short enough that the beat never stalls on one plate.
HHS lands on `baseSweepSec=3.00`, slots 3.00/3.00/3.55/2.84s, window 14.40s, `scale=1.000`.
**GOTCHA:** the want is computed in TWO places (effects.js sizes the window, cpe_storey_reveal.js
splits it). Widening only one left the grown pull-back wasted — the window still asked for the old
1.5s-floor figure. One base, both places.

## §108 THE BLUE TINT WAS STILL RUNNING UNDER THE CUT (2026-09-13, user)

*"Why is there lingering blue tint? Remove any stale effects."* and *"2nd floor got drawn twice."*
ONE cause, two symptoms. `_applyTint` was still painting each slot's facade subset with `COLORS[0] =
0x2979ff`, dead since §98 replaced the tint with geometry but never switched off — and because the
ground-slab pass and Level 1's pass are two slots on the SAME storey, that storey got tinted,
restored and tinted again, which is what read as a storey drawn twice. `STOREY_REVEAL_TINT = false`.
The clash-marker hide (`_hideMarkers`) travelled with it and is also gone — both contradict this
file's own locked verdict, *"no tint ... clash/Sanity layers stay on"*. `_restoreTint()` STAYS: it is
the restore path and a no-op when nothing is touched. The ground-slab pass now captions "Ground slab"
and cards the slab footprint, so no slot repeats a storey name.

## §109 FLAGS (2026-09-13, user: *"Use good array flags to mark once drawn"*)

`_drawn[]` per slot plus `_drawnOrder[]`, reset whenever the fit is recomputed. Re-entering a slot
after another has run in between logs `§STOREY_REVEAL_REDRAW` rather than being absorbed — it is the
defect §97.4 was fixed for once already, and it must never be silent again. Zero hits since.

## §111 WHOLE-OBJECT VISIBILITY CANNOT EXPRESS A CEILING (2026-09-13)

**111.1 THE REPORT AND THE MEASUREMENT.** *"The last HHS still showing 2 storeys at once!!"* NOTE:
§111 fixed only the BETWEEN-OBJECTS half of this; the report recurred and the real cause turned out to
be §112 below — the ceiling that §105 removed. Read §112 before treating §111 as the fix. The
measurement here still stands and the defect it names is real: of HHS's 411
armed objects, **120 span 2-3 bands**. §105 replaced the global ceiling plane with whole-object
visibility, which is exact only while an object belongs to one storey — and it does not. The
InstancedMesh path buckets by GEOMETRY HASH ALONE (`streaming.js` ~L2220, a caveat that file already
records), so one plate geometry is carried on every floor; and HHS's 629 `storey='Unknown'` IfcPlates
run z 0.15..10.55, the full building height. Showing such an object shows every storey it touches.

**111.2 THE PARTIAL FIX — the ceiling goes PER INSTANCE (necessary, not sufficient — see §112).** Both container types can hide one member:
BatchedMesh has `setVisibleAt`, and InstancedMesh uses this codebase's own zero-scale convention
(`helpers.js` `A.filterInstancedMesh`). Each instance's band is computed once at arm time from its own
matrix / `getBoundingBoxAt`. Single-band objects keep whole-object visibility. Measured on HHS:
`multiBandObjs=120 perInstanceCeiling=120 spanUnhandled=0`, and **1,621 instances** that were visible
during slot 1 no longer are. Everything is restored on exit (`perInstanceObjsRestored=120`).
`spanUnhandled > 0` in any future log means some container can still show two storeys at once.

## §112 THE CEILING WAS NEVER OPTIONAL — §105's VISIBILITY SWAP WAS A REGRESSION (2026-09-13)

**112.1 THE REPORT.** *"Still 2 storeys at once, then the upper storey cut again."* and *"How can you
redraw things twice? ... Why prior was ok?"* Prior WAS ok: the original code put the ceiling on
`renderer.clippingPlanes`, a real clip plane, so it cut INSIDE objects as well as between them.

**112.2 WHAT §105 BROKE, and it is one regression with two symptoms.** Removing the global array to
stop it beheading the context city (§105) left the material predicate as
`(y <= floor) OR (p >= d)` with NO ceiling. Whole-object visibility cannot substitute, because it is
all-or-nothing per object and the ceiling also clips WITHIN one. So any geometry protruding above the
current band lost its cap: the sweep revealed it EARLY (two storeys at once), and when the floor rose
at the next slot the part above the new floor was gated by `p >= d` again and SWEPT A SECOND TIME
(the upper storey cut again). §111's per-instance work was necessary but treated only the between-
objects half; it could never fix the within-object half.

**112.3 THE FIX — the predicate becomes pure AND by splitting materials per ROLE.** The AND-over-OR
is what forced the ceiling onto the global array in the first place: one material had to serve both
"already revealed" and "currently sweeping". Give each original material TWO clones and let an
object's ROLE pick which it wears, and every clause is a plain intersection:
    revealed : [ceil]          — solid to the ceiling, protrusions wait their turn
    current  : [ceil, sweep]   — inside the band AND past the sweep
    hidden   : [ceil] + visible=false
Roles are reassigned on slot boundaries only. Cost measured: 2 clones per material — HHS 29 -> 58,
Hospital 104 -> 208. The renderer's global array stays EMPTY, so §105's silhouette fix survives.
A multi-band container cannot wear `current` (its already-revealed members would sweep twice), so it
wears `revealed` and its members are gated individually on band AND on their own projection along the
latched bearing — the same far->near order the plane draws, at member granularity.

**112.4 A NAME COLLISION WORTH RECORDING.** §111 stored the InstancedMesh matrix backup as `rec.mat0`;
§112 then used `mat0` for the original material. Two meanings, one key — the instance restore and the
material restore silently clobbered each other. Renamed to `imat0`. Found by reading the field list,
not by a bake.

## §113 THE WITNESS — the invariants, as numbers that must be zero (2026-09-13, user)

*"Once done check the WITNESS logging debug says bugs are gone, then only do low HHS all features ON
test."* `§STOREY_CUT_WITNESS` prints once per slot, computed from the LIVE SCENE rather than inferred
from slot arithmetic, and states PASS/FAIL itself:
- `aboveVisible` / `aboveInstVisible` — objects or members from a band ABOVE the one being revealed
  that are still drawable. Nonzero = two storeys at once.
- `ceilPlaneMissing` — armed materials in use that do not carry the ceiling plane. This is the §112
  defect expressed directly.
- `roleRegressions` — an object's role must be MONOTONE, hidden(0) -> current(1) -> revealed(2).
  A backwards step IS a second draw. This is the §109 flag idea, generalised and made continuous.
- `revealedInstTurnedOff` — a member of an already-revealed band that went dark again.

**IT EARNED ITS KEEP ON THE FIRST RUN.** `ceilPlaneMissing` came back 234, then 67, then 0 — exactly
the per-slot HIDDEN counts, because hidden objects were still wearing their ORIGINAL material. Not
visible on screen, so no bake would ever have shown it; but anything that turned such an object back
on by another path (x-ray, a panel filter, the buildup schedule) would have reintroduced the
protrusion leak. Fixed by giving hidden objects the ceiling-clipped variant too, so the invariant
"everything armed is ceiling-clipped" holds unconditionally.
**VERIFIED:** HHS and Hospital both PASS on every slot, 0 FAILs, 0 `§STOREY_REVEAL_REDRAW`.
Hospital carries **1,411** multi-band objects, all handled (`spanUnhandled=0`).

## §114 SUPERSEDED — see §128.7 for the films this hand-off is about.

## §115-§127 SHIPPED THIS SESSION BUT NOT YET RE-PROVEN ON FRAMES (2026-09-13/14)
All in worktree `/tmp/wt-storey-cut`, branch `feat/storey-section-cut`, UNCOMMITTED. Each is logged;
none of it survives §128's frame report unchallenged, so read §128 before trusting any of it.
- **§115 per-storey light cap** — the reveal publishes `A._storeyCutCeilY`; the fixture SELECTION drops
  fixtures above it (`§STOREY_CUT_LIGHT_GATE`). Superseded in practice by §116 but still in the code.
- **§116 interior lights OFF from the last stick** (user: *"Better just hide them all at pull out or
  last stick as not really needed"*). `A._ilPastStick` = are we past `beats.out`; `A._interiorLightsOff`
  = is the gate applied. They are SEPARATE ON PURPOSE — tying the witness to the gate flag lets the
  falsifiability control silence the check it exists to trip.
- **§117/§118 INTERIOR_LIGHTS_WITNESS — FOUR emitter families, not one.** PointLight pool, nav
  PointLights, glow sprites, the lens quad, and the emissive fixture materials. §115 capped ONE and
  read PASS while fixtures were visibly lit. Every count prints over its DENOMINATOR so a zero can be
  told from an absent family. FALSIFIABILITY CONTROL RUN (`window.__ilForceOn`): 0 PASS / 3 FAIL, and
  it named `lensQuadLive=1 emissiveMatsLit=8/8` — the two families that had been missing.
- **§119 the fit is memoized** — `_fitList` ran EVERY FRAME (1,460 duplicate `§STOREY_REVEAL_SLOTS`
  lines on a 414-frame clip) and reset §109's `_drawn[]` each time, so the flags could never fire.
- **§120 per-slot clamp + bisection** — `CUT_SWEEP_MAX` clamped the BASE, so a heavy storey got
  `base x ratio` and reached 5.83s (ceiling 3.0) while the rescale pushed others to 1.37s (floor 1.5).
  Terminal found it; Hospital and HHS both sit near ratio 1.0 and never showed it.
- **§121 STOREY_ARCH_WITNESS + §126 the census** — per (group, discipline), armed ELEMENTS against a
  DB census built THE SAME WAY the reveal assigns them. A denominator built any other way is not a
  check. STILL FAILING: 271 elements (~0.6%) on Terminal, untraced.
- **§122 persistence** — a storey that has had its pass STAYS ON. The old code restored `e.vis0`, the
  visibility captured at ARM time, freezing whatever transient Time-Machine state existed on the
  window's first frame: 556 already-revealed objects dark by the last slot, growing every slot.
  `persistCeilCut` is INFORMATIONAL — the ceiling is monotone, so it cannot clip what it previously
  allowed, and counting it would make the witness unsatisfiable on any double-height space.
- **§124 slotId, not array position** — `getBoundingBoxAt`/`setVisibleAt` take the BATCH's own
  `slotId` (§S260 stores it per member); indexing by the position in `_batchMeta` silently failed.
- **§125/§127 elevation comes from the MODEL, not the scene graph.** InstancedMesh instances all
  reported the SAME height, and that height (17.50 m) matched ZERO elements in the DB. Banding now
  reads `element_transforms.center_z` per guid, the same number the census uses, so the scene and the
  witness agree by construction rather than by coincidence. This moved Terminal's ARC from
  33,814 / 97 / 9 to 12,651 / 18,310 / 2,532 against 12,658 / 18,286 / 2,530.
- **§CPE_FLAGS_PORTABLE_2** (`scene.js`, `effects.js`) — `_buildOverride()` carries SIX film flags;
  the portable `cinema_path` table stored FOUR. `clash`, `measure`, `storey_reveal` appended after
  `day_counter`, reader probes for `storey_reveal` separately from `buildup`, absent columns stay
  `undefined` (NOT false) so the consumer default still applies. New `§CPE_FLAGS_RESTORE` line.

## §128 OPEN — THE REVEAL IS STILL WRONG ON FRAMES. START HERE. (user, 2026-09-14)

**128.0 OPERATING BASICS — everything below is here so no session has to go hunting. Read once.**

*THE DATA. Query it before forming any theory; the answer to most of §128 is in these tables.*
```
~/Downloads/HHS_Office_Federated_silent.db     ~/Downloads/Terminal_silent.db     ~/Downloads/Hospital_silent.db
python3 -c "import sqlite3;c=sqlite3.connect('<db>');[print(r) for r in c.execute('<sql>')]"
```
| table | what it answers |
|---|---|
| `elements_meta` (guid, ifc_class, storey, discipline, element_name) | what exists, on which storey, in which discipline. `storey='Unknown'` is common and is NOT an error (Terminal: 94% of ARC) |
| `element_transforms` (guid, center_z, bbox_x/y) | the ELEVATION of every element — the authority for banding (§127) and for any census |
| `spatial_structure` (type, name, parent_guid) | which storeys are DECLARED (`IfcBuildingStorey`); §60.1 drops elements_meta storeys that are not declared |
| `cinema_path` | the authored path + the portable film flags (§CPE_FLAGS_PORTABLE / _2). Column count tells you which build wrote the file |

*THE BAKE. It is ready-made; do not write another.*
```
cd /tmp/wt-storey-cut && bash /tmp/wt-bake-perf/bake_scope.sh node cli_silent_bake.js \
  --db <Name>_silent --out /tmp/wt-storey-cut/out/<tag>.mp4 --gpu real \
  --width 854 --height 480 --fps 15 --measure --storey-reveal --clip <in>:<out> --port <uniq>
```
- `bake_scope.sh` is MANDATORY (§91.4) — it is a memory scope; without it the bake takes the session
  down with it. It is NOT in the worktree; call it at that absolute path.
- `--db <Name>_silent` resolves via `buildings/<Name>_silent.db` -> symlink -> `~/Downloads/...`.
- Writes THREE files next to `--out`: `.mp4`, `.stdout` (progress + the §CLAIM summary) and `.log`
  (the full page console — **this is where every § witness line lands**).
- `--clip in:out` bakes a FRACTION of the film. Use it: the reveal window is the last ~15-25s, so a
  clip is a 2-3 minute turnaround instead of 25+. Full film only to deliver.
- Quick-check resolution is `854x480@15` (§59.6); `640x360@10` for a pure log probe. Full delivery is
  `1920x1080@24`.
- `--tap <file.js>` injects JS before page load — this is how a falsifiability control forces a defect
  ON (§118's `window.__ilForceOn`). Use it; do not add debug flags to the CLI.
- **Port gotcha (cost one restart):** a killed bake leaves its `--port` bound and the next launch dies
  `EADDRINUSE` before any § line prints. Use a fresh port; reap stale scopes (§91.7).
- **Profile gotcha:** each run makes `/tmp/silent-bake-profile-<port>/` holding a ~300-550MB cached
  copy of the DB. Delete them when done or /tmp fills (4.8G accumulated in one session).
- Success is `§CLI_BAKE_WALL ... fileOk=true`. `fileOk=false` with `§MAXQ_IDB_LOST` is memory
  pressure, not your code — rerun on a clean system.

*THE WITNESS DISCIPLINE. This is the whole method; §128.3 is the evidence for why.*
1. Express the symptom as a COUNT THAT MUST BE ZERO, computed from the DB or from the drawn scene —
   never from the same variable the code under test already trusts.
2. Print every count over its DENOMINATOR (`lit=0/200`, `ARC 12651/12658`). A bare zero cannot be told
   from an absent family, and that exact ambiguity produced a false PASS twice in one session.
3. Build the FALSIFIABILITY CONTROL first: force the defect on via `--tap` and require the witness to
   FAIL. A witness that has never failed has proven nothing.
4. Only then fix. Re-run the control (must FAIL) and the treatment (must PASS).
5. Verify on ALL THREE silent DBs. Two are always the control for the third.
6. **Do not judge from frames.** Frames are what the user reports; they are not evidence you can act
   on. Every claim in a hand-off must trace to a § line in a `.log` you actually read (CLAUDE.md's
   Log Mandate). Exit code alone is not evidence.

**128.1 THE REPORT, verbatim, against `~/Downloads/HHS_FULL_1080p24_2026-09-14.mp4` at the 1:47 mark:**
*"the storey reveal already has bugs. The floor slabs does not get drawn, and storey by reveal not
proper. There seems to be a draw ahead of walls in tint blue and others appearing and then omission of
the last level 3 animation."* Four distinct symptoms, all on ONE clip, all on a build whose witnesses
report PASS.

**128.1b THE DEFECT IS IN `cpe_storey_reveal.js`. IT IS NOT A PROPERTY OF ANY MODEL.** Observed on
`HHS_FULL_1080p24_2026-09-14.mp4` and `Terminal_FULL_1080p24_2026-09-14.mp4`; user: *"same impact also
on the Terminal just landed, not only that the whole ARC is missing in the last storey to orbit end."*
Two models that share NOTHING but the code — different storey vocabularies, discipline mixes, element
counts, container types and authored paths — produce the identical four symptoms. That is the
signature of a defect in the shared path, and **it will reproduce on Hospital and on every other
building in the fleet.** Do not wait for a third report to treat it as general.
Consequences for the fix, and these are requirements, not preferences:
- The cause lives in the reveal leg's own logic — band assignment, role assignment, the material
  variants, the per-member gate, or the restore. It does not live in a model.
- A fix is CORRECT only if one code change repairs every building. If a candidate explains one model
  and not the other, it is not the cause; keep looking.
- No name lists, no per-model constants, no threshold tuned until one log turns green. Every constant
  in this leg is a ratio or a duration and must stay that way.
- Regression-test on all three silent DBs (HHS, Terminal, Hospital). Two of them are the control for
  the third.

**128.1c IT LEAKS PAST ITS OWN WINDOW, AND THAT IS THE SHARPEST CLUE ON OFFER.** The missing ARC on
the last storey persists *to orbit end* — i.e. beyond the reveal window entirely. The reveal is
supposed to be confined to the last `windowFrac` of the pull-back and to restore everything it touched
on the way out (`§STOREY_CUT_CLEAR materials=… visibilityRestored=… perInstanceObjsRestored=…
materialsRestored=…`). So either the clear is not running, or it is running and does not actually undo
what was done — §122 changed the applied "on" state to `true` while the restore still writes back
`vis0`, and the per-member path restores through a different route than it sets. NEEDED, and it is a
number that must be zero: after the window, for every object and every member the reveal armed, the
count whose visibility / material / instance matrix differs from what it was at arm time. Run it on a
clip that spans the window's END, not its middle.

**128.1d SCOPE — DO NOT WIDEN IT.** User: *"All the rest seems OK thus do not impact or touch the
others. It is ONLY this Storey Reveal leg affecting till end of film."* Everything else in both films
is accepted: buildup, clash, measure, Sanity/Egress, the camera path, the lighting work. The defect
lives in the storey-reveal leg and its restore. Change nothing outside that leg, and prefer a fix that
makes the leg leave the scene exactly as it found it over one that compensates downstream.

**128.2 THE STANDING METHOD, in the user's own words — this governs the whole next session.**
*"i always contended that the way to debug is to look at code and data as it is GIGO. WITNESS logging
is crucial. No band aid fix nor custom treatment."* And: *"Make comments also abstract in nature."*
So: read the code and the DB first, express each symptom as a number that must be zero, and make the
witness FAIL before changing anything. No per-building constants, no name lists, no threshold tuned
until a log turns green.

**128.3 WHY THE EXISTING WITNESSES DID NOT CATCH ANY OF IT — the real lesson of this session.**
Every witness written so far checks a predicate the CODE already believes. `§STOREY_CUT_WITNESS`
reports role monotonicity, above-cut visibility and ceiling-plane presence; all PASS on this very
bake. None of them looks at what is actually DRAWN. This session repeated that mistake four separate
times — §115 counted one light family of four and read PASS; §113 proved roles were monotone while
556 revealed objects sat dark; §121's first census used a declared-labels-only denominator and made a
real shortfall look like a 500x over-count; §125 banded from the scene graph and got a height that
exists nowhere in the data. **A witness that cannot fail proves nothing, and a witness built from the
same assumption as the code under test is not independent.** Build the next ones from the DB and from
the drawn result, and run a FALSIFIABILITY CONTROL for each (§118's `__ilForceOn` is the pattern:
force the defect ON and require the witness to FAIL) before believing any PASS.

**128.4 THE FOUR SYMPTOMS, and the witness each one needs. None of these exist yet.**
- **Floor slabs not drawn.** §106.2 retired `SLAB_LEAD_FRAC` and made `slabK === restK` for every
  storey above the ground pass — so the slab has no separate treatment left and may simply never be
  reaching its material variant. NEEDED: per slot, the count of slab-class elements that are armed,
  in the `current` role, and inside the sweep — against the DB's own slab census for that band.
  `_slabClasses` is derived per building (§99.3); check it resolved non-empty on HHS.
- **Draw ahead of walls IN TINT BLUE.** §108 set `STOREY_REVEAL_TINT = false` and that was asserted
  FROM CODE, never witnessed. `COLORS[0]` is `0x2979ff`. Either the tint path still runs, or another
  system paints blue in this window (x-ray wash, the clash markers, a discipline palette). NEEDED: a
  witness that counts materials whose colour/emissive was mutated by the reveal, over its denominator
  — and a control that forces the tint back on and requires a FAIL.
- **Storey-by-storey not proper / things appearing out of order.** The order the WITNESS checks is
  role order, which is derived from `cut.si`. NEEDED: the order things are actually DRAWN — per slot,
  which bands have drawable geometry, from the scene, not from the slot arithmetic.
- **Last storey omitted, and its ARC still missing at orbit end (both buildings).** The final slot
  may be truncated by the window fit, its sweep may finish before its slot does, or the last band's
  members may never leave the `hidden` role and never be restored. Check `§STOREY_REVEAL_SLOTS`
  `shown` vs `storeysAvailable`, the last slot's `sweepSec` against its `slotSec`, and whether the
  final `§STOREY_CUT_WITNESS slot=` equals `groups-1` on BOTH bakes. Then §128.1c's restore witness —
  that the last storey is dark *after* the beat is the part the slot arithmetic cannot explain.

**128.5 A CONTRADICTION WORTH RESOLVING FIRST — now on two buildings.** This same bake logs 3 slots PASS, `persistGone=0`,
`lensQuadLive=0`, `emissiveMatsLit=0/4` and 0 redraws — while the user sees slabs missing, a blue
tint, and a missing final storey. Either the witnesses measure the wrong frames (they sample at slot
boundaries and just before `_captureFrame`, not across the whole window) or they measure the wrong
things (§128.3). Settle WHICH before writing a line of fix: pull the frames at the 1:47 mark and name
the mechanism, do not reason forward from the logs that already disagree with the picture.

**128.6 ALSO OPEN, lower priority.** §121's 271-element ARCH shortfall on Terminal (~0.6%, spread
across ACMV/ARC/PLB/ELEC/MEP, with two cells reading OVER — `ARC 440/427`, `ACMV 583/566` — which
smells like band-boundary rounding, not lost geometry). And the HHS `.db` predates
§CPE_FLAGS_PORTABLE (14-column `cinema_path`, saved 2026-09-02 against the fix's 2026-09-04): re-save
it from a current build and `--buildup` stops being necessary.

**128.7 WHERE THE CODE IS.** Worktree `/tmp/wt-storey-cut`, branch `feat/storey-section-cut`, based at
`d51362c3`, everything from §102 onward UNCOMMITTED and unpushed. Films in `~/Downloads/`:
`HHS_FULL_1080p24_2026-09-14.mp4` (the one the report is against, 3,131 frames, 130.4s, all features),
`Terminal_FULL_1080p24_2026-09-14.mp4` (2,017 frames, 84.0s, the user's edited 6-waypoint path).
Bake intermediates in `/tmp/wt-storey-cut/out` (~90 mp4s, 479 MB) are disposable.



