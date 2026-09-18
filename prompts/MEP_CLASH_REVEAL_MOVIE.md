# ⚠ DO NOT REMOVE — MEP Clash-Reveal Movie lane. Read the log after every run (CLAUDE.md Log Mandate:
exit code is not evidence). This file keeps ONLY the compact recap plus everything ACTIVE; the full
history behind every closed item lives in `archive/`:
`MEP_CLASH_REVEAL_MOVIE_archive_2026-09-06.md` (§1-§37, 1,878 lines),
`..._archive_2026-09-11.md` (§38-§56, the screen-furniture spec + the flicker saga, 1,095 lines),
`..._archive_2026-09-14.md` (the §57-§96 tint era, §PENDING, §91 and §94-§96, 5,508 lines).
Consolidate again on sight past ~2,400 lines — don't wait to be asked.

> **SESSION OPENER — paste this to start the next session (2026-09-16, current — §129 bake-runner
> hand-off, mid-ROUND-16):**
> *You are the BAKE RUNNER for §129 (load path + ledger ticker), worktree `/tmp/wt-loadpath` branch
> `feat/loadpath-ledger`. A separate reviewer session ("Fable", contact name `red1-6e` via SendMessage/
> ListAgents) assigns each bake and its exact expected witness values, then reads the log you point it
> at — you do not judge PASS/FAIL yourself beyond reporting the log's own verdict and flagging anything
> that doesn't match what Fable predicted. Read §129 top to bottom (starts ~line 1096) for the spec,
> and §129.9 for the most recent rulings, before doing anything.
> **PROTOCOL, learned over 16 rounds — follow exactly:** (1) `ps aux | grep cli_silent_bake` before
> EVERY bake — one bake at a time, across sessions too. (2) fresh `--port` every bake (98xx range by
> convention this round). (3) `rm -rf /tmp/silent-bake-profile-<port>` after every bake, pass or fail.
> (4) grep the exact `§`-lines Fable named, report them verbatim plus the log path/port/totalSec/
> fileOk — never paraphrase a number. (5) Never copy to `~/Downloads/` until Fable explicitly says so
> ("logs to me first" is the standing rule) — they read the log independently before authorizing a copy.
> (6) A bake that shows frozen frame-progress for 60-90s+ while the renderer process still burns CPU is
> this project's known flaky-stall pattern (not a real code issue) — kill it (SIGTERM, may need twice)
> and retry on a fresh port; a genuine low-memory kill notification with `free -h` showing plenty
> available afterward is the SAME false-alarm pattern, just retry. (7) One control's tap = one bake;
> never combine taps.
> **EXACT STATE RIGHT NOW — ROUND 16 ("the run everything is judged on"), HHS `--clip 0.2432:0.2770`:**
> normal run DONE, ALL 25 WITNESSES PASS including the two hardest ones fixed this round — `§LOADPATH_CARD`
> fires clean, and `pickSource` is now honest (`frustum-fallback` with a named `hop0Occluder`, never the
> old silent `none`). Log: `out/HHS_loadpath_r16.log`. Of the 18 controls Fable listed (in this exact
> order — `lp_break_support, lp_skip_restore, lp_hide_rest, lp_frame_off, lp_clip_all, co_freeze,
> lp_no_clock_freeze, lp_labels_naive, lp_no_focus_hold, lp_top_down, hud_force_overlap, hud_rows_float,
> lp_pick_thinnest, lp_look_ghost, lp_one_stack, lp_hud_no_fade, lp_backdrop_no_restore, lp_pick_occluded,
> lp_card_wrong_stack`), **1 (lp_break_support) and 2 (lp_skip_restore) are DONE, both matched exactly**
> (`out/HHS_loadpath_r16_ctrl_lp_break_support.log`, `..._lp_skip_restore.log`). **16 controls remain**,
> starting with `lp_hide_rest`. All 18 tap files already exist at `/tmp/tap_<name>.js` — verified present
> before Round 16 started, no need to recheck unless one is missing. After the 18 controls: Terminal
> normal (`--db Terminal_silent --clip 0.1508:0.2032`) then Hospital normal (`--db Hospital_silent
> --clip 0.3498:0.3722`, `free -g` first) — copy nothing for any of these until Fable has read the
> normal runs. Bake command template (swap `--out`/`--port`/`--tap`):
> `cd /tmp/wt-loadpath && bash /tmp/wt-bake-perf/bake_scope.sh node cli_silent_bake.js --db
> HHS_Office_Federated_silent --out /tmp/wt-loadpath/out/<name>.mp4 --gpu real --width 854 --height 480
> --fps 10 --clash --storey-reveal --buildup --label --reveal --measure --clip 0.2432:0.2770 --port
> <fresh>`. Downloads already has sighting clips from earlier rounds (HHS R14, Terminal R9, LTU R8b/v8b
> — check `ls ~/Downloads/*loadpath*` before assuming a re-copy is needed). Message Fable ("point you at
> the log") after each bake; do not narrate progress to the user beyond terse status — they are tracking
> this across two sessions and just want outcomes.*
>
> **Prior lane (§128, storey-reveal/rung-vote), fully closed and separate from §129:** 5 commits on
> `feat/storey-section-cut` in `/tmp/wt-storey-cut` (`cc78ba7e` §8.7 sidecar fix, `5dd2a16e` L1 raster,
> `1aa2d29d` L2 bake-owned persistence, `741e3bf6` L3+L4 CLI flags, `e26336d0` the whole storey-reveal
> arc), NOT pushed/PR'd. LTU and Hospital 1080p24 deliveries done and in Downloads. RISE_GROW ruled kept
> on, no code change. One still-open, non-blocking item: item 16's LTU grouping puts VÅN 2/3/4 one rung
> lower than a hand-predicted mapping made before the fix ran (never cross-checked against IFC
> containment). Nothing here needs action unless red1 asks for it explicitly — §129 is the live work.*

**ONE-LINE STATE (2026-09-14 evening — THE REVEAL IS FIXED IN THE WORKTREE, ACCEPTED ON CLIPS, NOT YET
DELIVERED OR COMMITTED):** §128.1c was answered and fixed the same day. The four frame symptoms were ONE
overlap (the storey window opened inside the discipline parade's ghost/tail and the reveal snapshotted
that filtered scene as its baseline, then wrote it back at the window's end while the Time Machine's
delta mode skipped every object — §128.8) plus ONE booking defect (instanced containers booked wholesale
to their first member's storey, and centre-z banding of labelled elements — §128.9). Fix shipped in
`cpe_storey_reveal.js` + `effects.js`: the window opens only after the parade has restored (plan-time
`§STOREY_REVEAL_RUNWAY` + a per-frame guard), a short runway compresses the sweeps and never drops a
storey, the restore hands the scene back to its owners, the storey LABEL is the ruler with elevation as
fallback, and every container goes per member. Three witnesses, all PASS on HHS and Terminal:
`§STOREY_ARM_BASELINE` (0/411, 0/1265 off), `§STOREY_LABEL_WITNESS` (4674/4674, 11233/11233 booked to
their own storey), `§STOREY_CUT_RESTORE_WITNESS` (0 left off); Terminal's `§STOREY_ARCH_WITNESS` is exact
in every cell. User on the clips: *"Yes they are correct."* OPEN: the three control bakes (§128.10), the
Hospital clip (`out/fix_hosp.log`), full 1080p24 delivery, the RISE_GROW knob (§128.10 item 6), 41
unlabelled HHS ARC elements in context containers (§128.10 item 7), and the commit.

**UPDATE 2026-09-15 (Sonnet):** item 14's storey-LADDER root cause (LTU's 18 labels for 5 physical
levels breaking ceiling monotonicity) is now IMPLEMENTED — see item 15. Verified on LTU (fixed,
`inversions=0`, falsifiability control reproduces the historical defect), HHS and Terminal (both byte-
identical to their pre-existing accepted baseline, no regression). Hospital not yet run. This is a
SEPARATE fix from items 8/9 above (storey-LABEL booking) — same file, same branch, not yet committed.

**New session, in this order:** §128.10 (trial runs), §128.8/§128.9 (the fix and its evidence), §128.0
(DB paths, bake invocation, witness discipline). Then §97 for the locked rulings, §102-§114 for how the
cut works, §115-§127 for the earlier shipped work. Everything else is closed — see the archive above.

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

**128.8 §128.1c ANSWERED — THE RESTORE WRITES BACK A FOREIGN TRANSIENT, AND THE TRANSIENT IS THE
DISCIPLINE PARADE (2026-09-14, witnessed on HHS and Terminal, log-derived; FIX NOT APPLIED).**
- **The overlap.** The storey window is `[rise - windowFrac, rise]`. The discipline reveal
  (`effects.js` `cpeRevealVisualAt`) hides ARC/STR from `flyback` (ghost) through `reveal` and on into
  its tail for `tailSec`, and only then restores by its own route (`A._applyDiscVisibility`). The two
  now overlap on every plan with the reveal round on — the caption comment's "by construction never
  overlaps this window" is no longer true. Positions read off `§DISC_FILTER` / `§STOREY_CUT` /
  `§SUN_ARC_STEP` lines in the full-film logs:

  | | window opens | ghost (ARC/STR hidden) | disc restore | last slot | clear |
  |---|---|---|---|---|---|
  | HHS (130.5s) | 0.799 | 0.431 → 0.834, tail to ~0.879 | ~0.879 | 0.880 | 0.910 |
  | Terminal (84s) | 0.557 | 0.347 → 0.631, tail to ~0.829 | ~0.829 | 0.782 | 0.870 |

- **Consequence A — the baseline is the filtered scene.** `_armCut` snapshots `vis0` and `imat0` while
  the disc filter has ARC/STR containers off and their instance rows at zero scale. Witnessed:
  `§STOREY_ARM_BASELINE armedObjsOff=255/411 byDisc={ARC:128 STR:127} zeroScaleRows=2290/3135 (over 283
  instanced containers) discRevealKey="ghost:MEP" hiddenDiscs=[STR,ARC] => FAIL` (HHS clip). Every "on"
  the per-member path writes for an instanced ARC/STR row writes `imat0`, i.e. the zero-scale row — so
  the reveal cannot draw ARC/STR at all during its sweeps. Floor slabs are ARC/STR: **"floor slabs not
  drawn"**. MEP sweeps alone with the clash film's `§CLASH_DISC_ARRIVAL_HIGHLIGHT` on it: consistent
  with **"draw ahead of walls in tint blue"** (walls absent, not a tint path — not separately witnessed).
- **Consequence B — two owners write the same state through different routes.** The disc filter's own
  writes inside the window (`§DISC_FILTER` at 0.834 and 0.856 on HHS; 0.729, 0.735, 0.761, 0.768, 0.794 on
  Terminal) set `mesh.visible = anyVisible` and every instance row by discipline for ALL storeys, over
  the storey reveal's hide-above; non-perInst objects are only re-asserted on a role change. Consistent
  with **"storey-by-storey not proper"**; unwitnessed (the §113 witness samples only at role changes).
- **Consequence C — the last storey.** HHS: the disc restore lands one slot boundary before slot 4
  (0.879 vs 0.880); slot 4's per-member flips then rewrite `imat0` zeros over the freshly restored ARC/STR
  rows of Level 3 — **"omission of the last level 3 animation"**. Terminal: slot 7 (0.782) is swept
  while ARC/STR are still filtered out (restore ~0.829) — **"the whole ARC is missing in the last
  storey"**.
- **Consequence D — the leak past the window (§128.1c).** `_clearCut` writes `vis0`/`imat0` back:
  `§STOREY_CUT_CLEAR visibilityRestored=255` (HHS) / `561` (Terminal) are EXACTLY the objects switched
  OFF at the window's end (hidden=0 on the last slot, so every flip is on→off). Nothing downstream
  re-asserts: the Time Machine is in incremental mode with a pinned cursor and skips every building
  object — `§PERF_TRAVERSE objs=511 skipped=411 mode=delta span=0h` is the line immediately before the
  CLEAR on HHS (`objs=1365 skipped=1265` on Terminal). Witnessed after the restore:
  `§STOREY_CUT_RESTORE_WITNESS objsLeftOff=255/411 membersLeftOff=1795/6839 byDisc={ARC:624 STR:1426}
  discRevealKey="" => FAIL` — the disc reveal had already restored (key empty); the storey reveal alone
  left them dark, **to orbit end**.
- **§122 was this same class** (a foreign transient frozen at arm) and fixed only the container's
  applied on-state. `vis0`, `imat0` and the per-member route still carry the snapshot.
- **The witnesses (in `cpe_storey_reveal.js`, uncommitted with the rest).** A `§STOREY_ARM_BASELINE`:
  armed objects captured OFF and instance rows captured at zero scale, over denominators, with the
  disc-reveal key and filter set named. B `§STOREY_CUT_RESTORE_WITNESS`: after the restore, objects and
  members left OFF that the discipline and storey filters would show, per object / instance row / batch
  slot, from the live scene. Both FAIL on the untouched build — that IS the falsifiability control. After
  any fix, a `--tap` that re-applies `A.filterDiscs(['MEP'])` immediately before arm must make A FAIL
  again. Repro (90 s wall): the §128.0 bake with `--clash --storey-reveal --buildup --label --reveal
  --measure --clip 0.78:0.93` on HHS at 640x360@10 (`out/w128_1c_hhs.log`, 90 s); Terminal `--clip 0.54:0.90`
  (`out/w128_1c_term.log`, 172 s): `§STOREY_ARM_BASELINE armedObjsOff=561/1265 byDisc={ARC:470 STR:91}
  zeroScaleRows=34218/35392 discRevealKey="ghost:FP,PLB,ELEC,ACMV,MEP"` and `§STOREY_CUT_RESTORE_WITNESS
  objsLeftOff=561/1265 membersLeftOff=33787/48428 byDisc={ARC:34207 STR:141} => FAIL` — 70% of the
  building's members dark from 0.869 to the end; the 561 equals the full film's `visibilityRestored`.
- **FIX NOT APPLIED — the shape is the user's call.** (a) SEQUENCE: the discipline parade must have
  restored before the storey window opens (plan-time; `effects.js` §STOREY_REVEAL_WINDOW / the beats) —
  repairs A–D. (b) HAND-OVER: at arm, force the disc reveal's restore first so the storey reveal owns
  visibility for its window — repairs A–D, cuts the parade's tail short. (c) EXIT DISCIPLINE: at clear,
  hand the scene back to its owners (`_applyDiscVisibility` + a full Time Machine pass) instead of
  replaying the snapshot — repairs D only. Recommendation: (a), plus (c) so the leg can never leak again
  whatever overlaps it later. Hospital not yet run (rule 5); the mechanism is plan-independent.
- **USER RULING (2026-09-14):** the storey reveal starts only at the last stick, after the buildup has
  ended AND after the discipline parade's tail has restored — it must not cut into either. If the
  runway is then too short, the reveal SPEEDS UP its per-storey animation to fit; the film is never
  lengthened. The optics survive because every storey is signalled by its own 0.5 s pause. So the fix
  is (a) with compression, not extension; (c) stays recommended as the exit guard.
- **FIXED (same day, uncommitted in the worktree; user accepted the clips).** `effects.js`: the window's
  cap is the pull-back proper (`_revealCap = _useSec.rise`), nothing is taken from the lull, §107.1's
  RISE_GROW is retained (pull-back grows, film length unchanged, other beats proportionally faster,
  cap 0.45), new line `§STOREY_REVEAL_RUNWAY ... startsAfterParadeTail=true compressBy=…`.
  `cpe_storey_reveal.js`: `storeyRevealVisualAt` returns null while `A.cpeRevealVisualAt` is non-null
  (`§STOREY_REVEAL_WAIT_PARADE` if it ever fires); `_fitList` never truncates — sweeps compress first,
  pauses only when the pauses alone do not fit (`sweepScale=`/`pauseScale=` on `§STOREY_REVEAL_SLOTS`);
  `_clearCut` replays its snapshot and then hands back to the owners (`A._applyDiscVisibility()` +
  `window.__forceFull = true` for one full Time Machine pass; `handedBackTo=` on `§STOREY_CUT_CLEAR`).
  RESULT: HHS arm at 0.806 with `discRevealKey="" hiddenDiscs=[]`, `§STOREY_ARM_BASELINE 0/411 => PASS`,
  `§STOREY_CUT_RESTORE_WITNESS objsLeftOff=0/411 membersLeftOff=0/6839 => PASS`; Terminal arm at 0.593,
  `0/1265`, `0/1265 0/48428 => PASS`. Logs `out/fix_hhs.log`, `out/fix_term.log`.

**128.9 THE REVEAL IS NOT CLEAN EVEN WITHOUT THE OVERLAP — labelled elements are revealed in the wrong
storey's pass, and the ARCH witness cannot see it (2026-09-14, code + DB, no frames).**
- **What the log already said:** `§STOREY_ARCH_WITNESS Level 1[... MEP 977/1044 SHORT] Level 2[ARC 665/697
  SHORT MEP 1239/1231] Level 3[ARC 495/508 SHORT MEP 1183/1124] => FAIL — 112 element(s) ... in no pass`.
  The MEP totals MATCH (3399 armed = 3399 census): those elements are in ANOTHER pass, not in none —
  the witness misnames what it finds. ARC is 41 short in total (1733 vs 1774): those really are booked
  nowhere, and the arm loop had no line for what it skips.
- **Why the witness is blind (§128.3 again):** §126 built the census "the same way the reveal assigns"
  — both sides band by `center_z` against the slab-bottom tops — so a label/elevation disagreement is
  invisible to it by construction. The independent side is the element's own storey LABEL.
- **The DB's own count (label band vs `center_z` band, tops from `§STOREY_CUT_BOUNDS`):**

  | | labelled elements with z | outside their label's band | into the storey ABOVE | of which within 30 cm of the boundary | into the storey BELOW |
  |---|---|---|---|---|---|
  | HHS | 4,715 | 218 (4.6%) | 199 | 186 (66 within 1 cm) | 19 |
  | Terminal | 11,233 | 1,337 (11.9%) | 787 | 104 | 550 |

  HHS is a SOFFIT problem: 59 `M_Pendant Light` (Level 1, center 3.50–3.51 = Level 2's slab bottom
  3.50) and 81 `Stahlbalkon` proxies (Level 2, center 7.08–7.28 vs Level 3's slab bottom 7.00) — ceiling-
  mounted elements of storey N whose CENTRE sits at or just above the soffit line, so `center_z <
  slabBottom(N+1)` books them to N+1. They are revealed one pass late, i.e. Level 1's ceiling lights
  appear during Level 2's sweep. Terminal is mostly NOT a boundary problem (683 up and 519 down by more
  than 30 cm, 579 of them PLB on Aras 03): its labels and elevations disagree outright (risers/stacks
  labelled to one storey), and the reveal follows the elevation.
- **Three rules in the code, one of them contradicting its own comment:** (1) `_perInstanceBands` bands
  EVERY member of a multi-band container by `center_z`, labelled or not — §123's comment says "whenever
  the label is missing"; the code never reads `meta[k].storey`. (2) `_objStorey` books a whole single-band
  container to its FIRST member's label. (3) `if (!m || Array.isArray(m)) return;` drops a container
  from the reveal silently. Rules (1)–(3) are what the DB table above turns into passes.
- **Two rulers in one film.** The 4D buildup places by `§STOREY_DATUM` (BASE-Z in the wall-datum ladder
  `[0.221, 3.936, 7.432]` on HHS; `relabelled=557/6880`); the reveal bands by CENTRE-Z against slab
  bottoms `[3.50, 7.00, 15.07]`. Under the buildup's ruler the pendant lights (base ≈3.2) and the
  balconies (base ≈6.9–7.1) are Level 1 and Level 2 — the same as their labels. The film builds them on
  one storey and reveals them on the next.
- **New witness (uncommitted, `_armCut`): `§STOREY_LABEL_WITNESS labelledElements=N bookedToOwnStorey=N/N
  bookedElsewhere=N (storeyAbove= storeyBelow=) byDisc={} bookedNowhere=N (skippedContainers= holding N
  elements, labelledInsideContext=N) => PASS | DISAGREE`.** Label side is the member's own label, pass
  side is the assignment the loop just made; the never-booked are counted separately. It says DISAGREE,
  not FAIL, because which ruler is the authority is the user's call, not the code's.
- **WITNESSED IN THE SCENE (HHS arm-point clip `out/w128_9b_hhs.log`, 25 s):** `§STOREY_LABEL_WITNESS
  labelledElements=4674 bookedToOwnStorey=3912/4674 bookedElsewhere=762 (storeyAbove=431 storeyBelow=331)
  byDisc={ARC:391 MEP:371} bookedNowhere=0 byRoute={containerLabel:672 perElementZ:90}
  singleBandContainersWithMixedLabels=97{I:97} holding 672 off-label elements => DISAGREE`. 16% of the
  labelled building is revealed with the wrong storey. Only 90 come from the centre-z rule (the soffit
  class above); **672 come from 97 InstancedMesh containers that READ as single-band and are booked
  wholesale to their first member's storey** while holding members labelled to other storeys.
- **The mechanism, in code:** `_bandSpanOf` and `_bandOf` both read `o.geometry.boundingBox` through
  `o.matrixWorld`. For an InstancedMesh that is the BASE geometry at the container's own transform —
  never where the instances are — so every instanced container measures as one band at the origin,
  never reaches `_perInstanceBands` (which would read each member's DB elevation, §127), and is booked
  by `_objStorey` = `meta[0].storey`. The same fixture on three floors is revealed on whichever floor
  its first instance happens to carry. §125 met this exact class once already ("InstancedMesh instances
  all reported the SAME height") and fixed the per-member path; the gate INTO that path still uses the
  base-geometry box. This is the 331 "storeyBelow" the DB could not predict.
- **DECISION NEEDED (not applied):** which ruler governs the reveal — the storey label (elevation only when
  the label is missing or dropped, which is what §123 claims), or the buildup's own base-Z datum
  ladder (one ruler for the whole film)? Either removes the soffit class on HHS; only the label removes
  Terminal's 1,337. The centre-Z-vs-slab-bottom rule as it stands is the one choice that agrees with
  neither the labels nor the buildup.
- **DECIDED AND FIXED (user, 2026-09-14: "the intent is clear. As the film concludes, the user can observe
  each storey cleanly and described").** The storey LABEL is the ruler because the caption and stat card
  describe the storey by label; elevation (centre-z vs slab bottoms) is the fallback for members with no
  usable label, so floor slabs still travel with their storey; every container with a member list goes
  per member (`_perMember`), which retires the base-geometry span gate for instanced containers.
  RESULT: `§STOREY_LABEL_WITNESS bookedToOwnStorey=4674/4674 ... => PASS` (HHS), `11233/11233 => PASS`
  (Terminal); Terminal's `§STOREY_ARCH_WITNESS` exact in every cell; HHS's is 41 ARC short — all
  UNLABELLED, see §128.10 item 7. ARM line now prints `elementsBandedFromLabel=` next to
  `elementsBandedFromDbElevation=`.

**128.10 HAND-OFF FOR TRIAL RUNS (written 2026-09-14 for the next session; a Sonnet session can run all of
this — nothing here needs a decision except items 6 and 8).**

*Where things are.* Worktree `/tmp/wt-storey-cut`, branch `feat/storey-section-cut`, base `d51362c3`, one
commit `f87e1a28` plus UNCOMMITTED changes in `viewer/cpe_storey_reveal.js` and `viewer/effects.js`
(`git -C /tmp/wt-storey-cut diff --stat`). Silent DBs in `~/Downloads/<Name>_silent.db` reached via
`buildings/<Name>_silent.db` symlinks. Accepted clips in `~/Downloads/*_storey_reveal_FIX_clip_*.mp4`.

*The bake, verbatim (one clip ≈ 2–4 min wall at this resolution; use a FRESH `--port` every run):*
```
cd /tmp/wt-storey-cut && bash /tmp/wt-bake-perf/bake_scope.sh node cli_silent_bake.js \
  --db <Name>_silent --out /tmp/wt-storey-cut/out/<tag>.mp4 --gpu real --width 640 --height 360 --fps 10 \
  --clash --storey-reveal --buildup --label --reveal --measure --clip <in>:<out> --port <unique> [--tap <file.js>]
```
Clips that span the whole reveal window INCLUDING its end: HHS `0.70:0.95`, Terminal `0.50:0.92`,
Hospital `0.78:0.99`. After EVERY run: `rm -rf /tmp/silent-bake-profile-<port>` and read the `.log`, not
the exit code. The lines to grep, and their PASS forms:
```
grep -o '§STOREY_REVEAL_RUNWAY.*\|§STOREY_REVEAL_WAIT_PARADE.*\|§STOREY_ARM_BASELINE.*\|§STOREY_LABEL_WITNESS.*\|§STOREY_CUT_RESTORE_WITNESS.*\|§STOREY_CUT_CLEAR.*\|§STOREY_ARCH_WITNESS.*\|§STOREY_REVEAL_SLOTS.*\|§CLI_BAKE_WALL.*' out/<tag>.log | tail -12
```
- `§STOREY_ARM_BASELINE armedObjsOff=0/N ... zeroScaleRows=0/N ... discRevealKey="" hiddenDiscs=[] => PASS`
- `§STOREY_LABEL_WITNESS ... bookedElsewhere=0 ... bookedNowhere=0 ... => PASS`
- `§STOREY_CUT_RESTORE_WITNESS objsLeftOff=0/N membersLeftOff=0/N ... => PASS`
- `§STOREY_CUT_CLEAR ... handedBackTo=discFilter+tmFullPassNextTick restored`
- `§STOREY_REVEAL_RUNWAY ... startsAfterParadeTail=true` (the last such line before the arm is the plan used)
- `§CLI_BAKE_WALL ... fileOk=true`

*The tap files (create them; `--tap` injects the JS before page load):*
```
echo 'window.__srIgnoreRunway = 1;' > /tmp/tap_ignore_runway.js
printf 'window.__srIgnoreRunway = 1;\nwindow.__srReplaySnapshot = 1;\n' > /tmp/tap_ignore_runway_replay.js
echo 'window.__srContainerRoute = 1;' > /tmp/tap_container_route.js
```

*Trial runs, in order:*
1. **Hospital treatment — DONE 2026-09-14** (`out/fix_hosp.log`, 670 s wall): arm at 0.834 with
   `discRevealKey="" hiddenDiscs=[]`, `§STOREY_ARM_BASELINE 0/4899 ... 0/25013 => PASS`,
   `§STOREY_LABEL_WITNESS 46360/46360 => PASS`, `§STOREY_CUT_RESTORE_WITNESS 0/4899 0/63182 => PASS`,
   clear at 0.959, `handedBackTo=discFilter+tmFullPassNextTick`. Runway held without growth
   (`pullbackShapeSec=30.84 wantShapeSec=24.29 compressBy=1.000`). Clip copied to `~/Downloads/
   Hospital_storey_reveal_FIX_clip_0.78-0.99_360p10.mp4` (not yet viewed by the user). Nothing to run.
2. **Control 1 — `--tap /tmp/tap_ignore_runway.js`, HHS `0.70:0.95`.** Forces the pre-ruling reach into the
   parade. EXPECT `§STOREY_REVEAL_RUNWAY ... startsAfterParadeTail=false ... CONTROL(...)`,
   `§STOREY_ARM_BASELINE ... discRevealKey="ghost:MEP" ... => FAIL` (the baseline witness must be able to
   fail), and `§STOREY_CUT_RESTORE_WITNESS ... => PASS` (the exit hand-back holds even under overlap).
   **RE-VERIFIED 2026-09-15 (Sonnet, item 16's follow-up) — matches exactly** (`out/ctrl1_ignore_runway.log`):
   `startsAfterParadeTail=false`, `§STOREY_ARM_BASELINE armedObjsOff=255/411 discRevealKey="ghost:MEP" =>
   FAIL`, `§STOREY_CUT_RESTORE_WITNESS 0/411 0/6839 => PASS`. Still falsifiable after today's rung-vote fix.
3. **Control 2 — `--tap /tmp/tap_ignore_runway_replay.js`, HHS `0.70:0.95`.** Overlap AND snapshot-only
   restore. EXPECT `§STOREY_CUT_CLEAR ... handedBackTo=snapshotOnly` and `§STOREY_CUT_RESTORE_WITNESS
   objsLeftOff=255/411 ... => FAIL` — the 2026-09-14 morning defect reproduced on demand.
   **RE-VERIFIED 2026-09-15** (`out/ctrl2_ignore_runway_replay.log`): `handedBackTo=snapshotOnly`,
   `objsLeftOff=255/411 membersLeftOff=2290/6839 => FAIL` — exact match, still falsifiable.
4. **Control 3 — `--tap /tmp/tap_container_route.js`, HHS `0.70:0.95`.** Old container gate. EXPECT
   `§STOREY_LABEL_WITNESS ... bookedElsewhere=672 ... byRoute={containerLabel:672} => DISAGREE`.
   If any control PASSES, the witness cannot fail and proves nothing — stop and report; do not "fix" the
   witness to fail. **RE-VERIFIED 2026-09-15** (`out/ctrl3_container_route.log`): `bookedElsewhere=672
   byRoute={containerLabel:672} => DISAGREE` — exact match, still falsifiable. **All three controls 2-4
   still fail/disagree correctly after item 16's rung-vote fix — the earlier §128.8/9 witnesses are
   untouched by it, as expected (that fix only touches label→rung folding, not the parade-overlap or
   container-booking paths).**
5. **Delivery** — full films, same flags, NO `--clip`: `--width 1920 --height 1080 --fps 24`, HHS then
   Terminal then Hospital, one at a time (Terminal peaks ~7.6 GB; never two bakes at once). ~25–35 min
   each. Copy to `~/Downloads/<Name>_FULL_1080p24_<date>.mp4`. Grep the same lines; all PASS.
6. **RULED 2026-09-15 (user): KEEP RISE_GROW ON AS-IS, no code change.** §107.1 RISE_GROW stays on. With
   the lull closed it now carries the whole shortfall: Terminal's pull-back grew from 2.6 to 26.7
   shape-seconds (orbit start moved 0.870 → 0.906; the beats before it play ~30% faster; film length
   unchanged), HHS 2.7 → 10.7. The alternative considered — `RISE_GROW_MAX = 0`, letting the compression
   path (`compressBy<1`, `sweepScale`/`pauseScale` on `§STOREY_REVEAL_SLOTS`) absorb the whole shortfall
   instead (Terminal: 7 passes in ~3.4s including pauses) — was reported and explicitly turned down.
7. **Residue, not fixed — and now read as a CENSUS artifact, not a reveal defect:** `§STOREY_ARCH_WITNESS`
   is ARC-short on HHS (41: `542/569 686/697 505/508`) and ARC+STR-short on EVERY Hospital level
   (`ARC 1220/1400 ... STR 1140/1154 ...`), while MEP/ELEC/FP/PLB are exact everywhere and Terminal is
   exact in every cell. Hospital's label witness prints `contextContainersWithElements=0
   contextElementsByDisc={} skippedContainers=0 bookedNowhere=0`, so the missing ARC/STR are NOT in
   context containers, NOT skipped, and NOT labelled-but-unbooked. What remains is DB rows with no mesh
   in the scene (the census counts `elements_meta` rows; the armed side counts members that streamed).
   To close it: count, per discipline, `elements_meta` rows whose guid appears in NO `_batchMeta` /
   `_instanceMeta` / `_mergedMeta` member list, and print it as the ARCH witness's denominator
   correction. Until then the ARCH witness's ARC/STR SHORT is not evidence of a missing storey.
8b. **Review follow-ups applied 2026-09-14 (Fable, after the Sonnet review):** the dead `room` line in
   `_fitList` is gone; the parade guard now COUNTS every frame it holds the reveal back and prints
   `paradeWaitFrames=N` on `§STOREY_CUT_CLEAR` (expected 0; the first firing still logs
   `§STOREY_REVEAL_WAIT_PARADE` with its tNorm and phase). The review's per-member perf concern was
   checked against the fix logs and is NOT supported: seconds/frame are Hospital 1.11 before the
   window, 1.33 inside, 1.47 AFTER the clear (leg inactive); Terminal 0.42 / 0.58 / 0.65; HHS 0.41 /
   0.42 / 0.41 — the cost tracks how much of the building is in view, not the leg. Per-member data is
   ~1.6 MB on Hospital. Bakes launched after this edit carry the new field.
8c. **Large-building bake time and LTU (2026-09-14):** per-frame wall on Hospital is ~1.7 s of TAA+AO
   re-renders (`taa=8 ao=12`, 20 renders per captured frame) against 0.8 ms of Time Machine and nothing
   measurable from this leg — see CPE_4D_PERF_MEM_FINDINGS.md §8.1 for the CLI budget lever. LTU_AHouse:
   `~/Downloads/LTU_AHouse_silent.db` (saved 2026-09-14 11:35 from the OCI viewer v46) carries the path
   intact — 3 bands, 6 waypoints, total 181.1 s, `cinema_path` 18 columns = the FOUR portable flags
   (`buildup room_title reveal day_counter`); `storey_reveal/clash/measure` are absent because
   §CPE_FLAGS_PORTABLE_2 is worktree-only, so pass `--storey-reveal` on the CLI as always. CAUTION for a
   LTU trial: its `spatial_structure` declares 18 storey names for 5 physical levels and the elevation
   merge fails (`§S18_STOREY_MERGE_FAIL`), so `storeyRevealList` will offer up to 18 groups and the
   discipline parade has 7 disciplines with a 16 s tail — read `§STOREY_REVEAL_LIST`, `§STOREY_REVEAL_GROUP`
   and `§STOREY_REVEAL_RUNWAY` before judging anything. Findings file §8.4 has the data-side fix.
9. **Full Hospital 1080p24 (Sonnet, 2026-09-14) — two findings, neither in this leg:**
   (i) *"Clash pair animation is missing"* is REAL and CHRONIC on Hospital: the clash film never built
   (`§CLASH_RTREE batch failed at offset=0 — cannot start a transaction within a transaction` → `§CLASH_FILM_BUILD
   INCONCLUSIVE`), same lines in `out/fix_hosp.log`; cause is the Time Machine's chunked kernel_ops write
   loop losing its prepared statement to a `§KRN_PERSIST` `db.export()` mid-yield and leaving a transaction
   open — CPE_4D_PERF_MEM_FINDINGS.md §8.6, full chain and fix shape. Not resource pressure, not a timeout.
   Any building whose write loop yields for seconds (Hospital, LTU) loses the clash film; HHS/Terminal
   are too small to be hit. (ii) `§STOREY_ARM_BASELINE zeroScaleRows=12/25013` + `§STOREY_CUT_RESTORE_WITNESS
   membersLeftOff=12/63182 {ARC:3 STR:9}` on the full run only: 12 rows already zero-scale at arm, held
   through the window. Not yet attributed. Both witnesses now (a) consult the Time Machine as an OWNER
   (`tmGetState().cursor` + `tmGuidEndTs()`: an element whose op has not ended, or has no op, is
   `heldByTimeMachine=`, never a defect) and (b) print up to 12 offending guids (`foreignRows=[guid:disc:storey …]`,
   `leftOff=[…]`) so the next full run names them for a DB query. If they are held by the TM the FAIL
   disappears; if not, the guid list says which system to look at. Bakes launched after this edit carry it.
10. **LTU never loading is NOT a memory ceiling (2026-09-14):** the single-DB load path's positions
   sidecar URL is derived with `replace('_extracted.db', …)`, a no-op for `_silent.db`, so the whole DB
   is downloaded twice and its SQLite header is read as a 1.77-billion-row count; the row loop OOMs V8
   at 4 GB on a 761 MB file (smaller files throw a RangeError first and recover, 1–4 s later). Chain,
   controls and the three-line fix: CPE_4D_PERF_MEM_FINDINGS.md §8.7. No range streaming needed.
   `§DB_LOAD_STEP` lines now mark the single-DB path in this worktree (fetched / patched / opening /
   opened / ghosts composed).
11. **§8.7 APPLIED AND VERIFIED (Sonnet, 2026-09-14) — LTU_AHouse loads and bakes clean, all four
   buildings PASS.** Fable's fix shape landed in `viewer/streaming.js` (single-DB §S281 path + the
   split-mode Phase 0 copy): derive the sidecar the same `_extracted.db`-then-`.db$` fallback way
   `metaUrl`/`geoUrl` already do a few lines up, refuse to fetch when it still resolves to `A.DB_URL`,
   bound the row-count loop by the buffer's real byte length. One extra fix the first pass exposed:
   the sidecar's expected 404 was going through `A.cachedFetch`'s OCI-retry-and-warn path, and
   `cli_silent_bake.js`'s `FATAL_RX` regex (`§DB_404_OCI_FAIL` / `Failed to fetch …40x`) can't tell an
   optional sidecar's miss from the real DB failing — it aborted the whole bake on sight. Fixed by
   giving the sidecar probe a plain quiet `fetch()` instead (it's <3MB and optional; caching it was
   never worth the shared machinery). Two more small guards added alongside in `scene.js`'s
   `cachedFetch` for the REAL 725.7 MB DB write itself: a 60s timeout on the IDB transaction
   (`§CACHE_WRITE_HANG`, harmless — never actually fires, since a wedge at this size blocks the event
   loop below where a JS timer can reach) and a size gate that skips the `put()` attempt entirely
   above 400 MB (`§CACHE_WRITE_SKIP_TOO_LARGE`) rather than risking the renderer at all — LTU's own
   symptom was V8 OOMing at 4 GB, not a slow-but-working write, so prevention beat recovery. **None of
   this is a scaling fix** — LTU never gets instant-reload-from-cache, every open re-downloads the
   whole 725.7 MB — see CPE_4D_PERF_MEM_FINDINGS.md for why `_useRangeStream`/`_rangeDb` (the actual
   fix for arbitrarily-large buildings) is read at 5 call sites and constructed at none; finishing
   that is a separate, unstarted project. VERIFIED: `§STOREY_ARCH_WITNESS`, `§STOREY_LABEL_WITNESS`
   (121635/121635), `§STOREY_ARM_BASELINE` (0/7959), `§STOREY_CUT_RESTORE_WITNESS` (0/122330 left off)
   all PASS on LTU despite its 9 merged `IfcBuilding` roots and 18 storey names across 4 naming
   conventions (`Ref./VÅN N/VÅNING N/Storey N/Plan N/TAKPLAN`) for 5 physical levels — the storey-LABEL
   ruler (§128.9) turned out to already handle it. LTU's own reveal window: `0.9187:0.9500` (last 5.0s
   of a 13.2s pullback) — the equivalent of HHS's `0.70:0.95`. HHS clip re-run clean (no regression).
   All uncommitted in this worktree alongside §128.8/§128.9.
12. **User guidance for future large-DB bakes: localize first, then bake from the local saved copy** —
   this is the pattern that actually worked today (`~/Downloads/LTU_AHouse_silent.db`, symlinked into
   `buildings/`), not baking against a live/remote source. Applies regardless of the §8.7/cache fixes
   above; a local file also means every worktree/branch iteration re-tests against the SAME bytes.
13. **Large-DB baking has its own lane now: `prompts/LARGE_DB_BAKE.md` (2026-09-14, Fable, after the
   Sonnet session retired).** It ranks the measured levers (LTU: 633 s startup of which 560 s is egress
   legalization missing its `storey_walkable_raster`; 2.88 s/frame of 20 re-renders; bake-mode
   persistence off; frame-exact parallel clips) and reviews the three uncommitted branches. It also
   carries the LTU reveal diagnosis the user reported on the 0.52:0.97 clip ("opening floor slabs not
   revealed"): `§STOREY_CUT_BOUNDS` is not monotone on LTU (base 0.81 > tops[0] 0.70; five ceiling drops),
   a consequence of 18 storey labels for 5 levels; L7 there, data half + a ladder witness half. Not fatal
   per the user; after the load work.
14. **L7 ANALYSIS — the storey sequence for ANY building (Fable reviewer, 2026-09-15, from LTU's DB + the leg's own
   code; nothing changed):** the reveal's ruler is a LABEL list — `storeyRevealList` (`cpe_storey_reveal.js:53-71`) is
   `GROUP BY elements_meta.storey` ordered by `AVG(center_z)`, and `_cutBounds` (`:857-870`) sets each pass's ceiling to the
   NEXT label's median slab bottom (midpoint of means where that label has no slab). That is a ladder over names, and a
   federated export has one name system per sub-model. LTU, measured: 43 `IfcBuildingStorey` rows = 6 sub-models × `Plan 1-4`
   + `VÅN 1-5` + `Storey 1-3` + `VÅNING 1-4`/`TAKPLAN`/`Ref.`; **all 38 extracted rows carry `center_z=0.00 size_z=0.00`**
   (the extractor ships no storey elevation at all — the §S18 data gap is deeper than a missing `elevation` column); the only
   storey rows with a z are the 5 `COMPILED` ones (VÅNING 1-4, TAKPLAN at 3.04/6.35/9.59/12.69/14.16). Element base-z per
   label (element_transforms, p50): VÅNING 1 2.70 · VÅN 1 3.65 · Storey 1 4.56 · Plan 1 5.26 | VÅNING 2 6.00 · VÅN 2 6.25 ·
   Storey 2 8.10 · Plan 2 8.58 | VÅN 3 9.30 · VÅNING 3 9.30 · Storey 3 11.46 · Plan 3 11.72 | VÅNING 4 12.30 · Plan 4 12.79
   · VÅN 4 13.27 | TAKPLAN 13.58 · VÅN 5 16.01 — four name systems, one label each per physical level. Slabs: `Plan 1-4`
   (105k of 122k elements) and `Storey 1-3` own NO slab; the slab that separates two levels is booked to the storey BELOW in
   one sub-model and ABOVE in another (VÅN 1 slab-bottom median 2.57, VÅNING 1 5.00). So a per-label ceiling can never be
   monotone here — `§STOREY_CUT_BOUNDS base=0.81 tops=[0.70,0.70,4.39,4.65,2.70,…]` is the arithmetic of that, not a bug in it.
   **The rule that works for any case:** the sweep is a rising section cut, so its ruler must be the building's PHYSICAL level
   ladder and labels must become annotations of rungs. Both halves already have owners (4D_MODEL_INTEGRITY.md §I): the ladder
   is `schedule_author.js` `_storeyDatumCandidates → _chooseStoreyDatum` (`§STOREY_DATUM ladder=5` on LTU — the 5 COMPILED
   rungs, IN_FRAME against element base-z), and "which rung is this element on" is `viewer/lib/level_deriver.js`
   `LevelDeriver.levelFor` (T1 containment → T2 declared name → T3 the element's own base_z on the level grid; geometry wins
   when the declared band misses; gate-passed 7/7 fleet). Do NOT build on `deriveStoreyMergeMap` — it runs on nothing in the
   fleet (§J.6.3). Shape: (a) `list` = the datum ladder's rungs, ascending, one pass per rung; (b) every member banded per
   member by `levelFor` (the §128.9 per-member path, keyed by rung instead of label); (c) `from/to` of pass i = the z-extent of
   the members banded to rung i, clipped to [rung_i, rung_i+1) — monotone by construction because rungs are sorted and members
   are partitioned; (d) the pass's caption = the rung's declared name, the other systems' labels listed as aliases; (e) the
   §103 pseudo-storey/roof-pass rule runs on rungs, not labels. Witnesses that can fail: `§STOREY_CUT_BOUNDS … inversions=N
   base<tops[0]=bool => PASS|FAIL` (control tap `window.__srLabelLadder=1` restores today's list and must print inversions=5
   on LTU), `§STOREY_RUNG_MEMBERS rung=i name=… members=n` with FAIL on any empty or zero-height rung, and `§STOREY_LABEL_WITNESS`
   unchanged (it books by label per member; with rungs it books by rung). Window math follows for free: 18→5 groups turns
   `wantRealSec=296` into ~82 s against a 70-81 s window, `compressBy≈1`. Data ticket for the extraction lane, separate:
   write `IfcBuildingStorey.Elevation` (LTU: 38/38 rows are 0.00) so T2 and §S18 stop being blind on federated exports.
15. **L7 IMPLEMENTED (2026-09-15, Sonnet, on top of item 14's spec) — VERIFIED on LTU/HHS/Terminal,
   Hospital NOT YET RUN.** `cpe_storey_reveal.js`: `_chooseRungFrame()` calls
   `ScheduleAuthor._chooseStoreyDatum(ScheduleAuthor._storeyDatumCandidates(A.db), elementBaseZs)` —
   reused as-is, not re-derived — and degrades to the untouched per-label list when it returns anything
   but `DECLARED` mode with >=2 rungs (a building with no usable datum keeps today's behaviour byte for
   byte). `_regroupByRung()` then folds `storeyRevealList`'s per-label rows into one entry per rung:
   a label whose NAME literally matches a rung's own declared name is force-matched to that rung FIRST
   (bypassing nearest-z) — needed because TAKPLAN, a sloped roof, has a per-element mean-Z nearer
   VÅNING 4's rung than its own declared datum, and nearest-z alone let an unrelated label ("VÅN 4")
   squat TAKPLAN's own caption; every other label goes by `LevelDeriver.nearestIdx` against the ladder's
   Z values. Aliases ride the SAME `.absorbs` array §103's existing pseudo-storey pass already uses, so
   `_storeyGroupIndex`/`_armCut`/every per-member consumer needed ZERO further changes — this is the
   whole reason item 14's plan composes as cleanly as it does. Went further than item 14 asked on ONE
   point: rather than only DETECT a non-monotone ceiling, `_cutBounds` now REJECTS any slab-bottom
   candidate that would not strictly exceed the running prior ceiling and falls back to the midpoint
   (found necessary live — TAKPLAN's own slab-bottom row reads 2.99m, a slab-on-grade the groundwork
   rule reclassified onto the roof's label; the RUNG GROUPING is correct, that one DB row is not).
   `§STOREY_CUT_BOUNDS` now reports BOTH `inversions=` (the corrected, always-monotone bounds actually
   rendered) and `naiveInversions=` (what item 14's formula alone would have produced, with no rejection
   guard) — the second field is what keeps the witness falsifiable per §STATUS, since the first is now
   0 by construction. Item 14's exact suggested names (`window.__srLabelLadder`,
   `§STOREY_RUNG_MEMBERS`) were kept in spirit, not verbatim (`window.__srForceLabelLadder`,
   `§STOREY_REVEAL_RUNG_EMPTY`) — same falsifiability control, same "empty rung" guard.
   **WITNESS, LTU (`LTU_AHouse_silent`, clip 0.9187:0.9500):** `§STOREY_RUNG_LADDER mode=DECLARED
   source=center_z rungs=5 ladder=[VÅNING 1@3.04,VÅNING 2@6.35,VÅNING 3@9.59,VÅNING 4@12.69,
   TAKPLAN@14.16]`; `§STOREY_RUNG_GROUPED labels=18->rungs=5`; `§STOREY_CUT_BOUNDS base=0.70
   tops=[2.70,5.44,11.14,18.57] inversions=0 naiveInversions=1 => PASS` (the 1 naive inversion is the
   TAKPLAN slab-on-grade row, caught and corrected — `§STOREY_CUT_BOUNDS_REJECT rung="VÅNING 4"
   slabBottom=2.99 <= prior=5.44`); `§STOREY_LABEL_WITNESS`/`§STOREY_ARM_BASELINE`/
   `§STOREY_CUT_RESTORE_WITNESS` all still PASS, unchanged from item 14's own baseline. **FALSIFIABILITY
   CONTROL** (`--tap` setting `window.__srForceLabelLadder=1`, same clip): `§STOREY_RUNG_CONTROL
   tap=__srForceLabelLadder active — regrouping SKIPPED`; `§STOREY_CUT_BOUNDS base=0.81
   tops=[3.80,4.29,4.39,...,18.57] naiveInversions=7 => PASS` — reproduces item 14's exact historical
   `base=0.81` arithmetic byte for byte, and confirms the witness CAN see a real defect (7, not item
   14's estimated 5 — the difference is definitional, item 14 hand-counted visible "ceiling drops",
   this counts every `tops[i] <= prior` including flat/near-flat steps; both are nonzero on the broken
   ladder and zero on the fixed one, which is the falsifiability property that matters). **NO REGRESSION
   on HHS** (`HHS_Office_Federated_silent`, clip 0.70:0.95): `§STOREY_RUNG_LADDER ... rungs=3
   ladder=[Level 1@0.22,Level 2@3.94,Level 3@7.43]`, `labels=3->rungs=3` — BYTE-IDENTICAL grouping to
   the pre-fix label list (HHS's 3 labels already map 1:1 to physical levels, nothing to fold); `base=
   -0.21 tops=[3.50,7.00,15.07] naiveInversions=0` (never needed the guard); `§STOREY_LABEL_WITNESS
   labelledElements=4674 bookedToOwnStorey=4674/4674`, `§STOREY_ARM_BASELINE armedObjsOff=0/411`,
   `§STOREY_CUT_RESTORE_WITNESS objsLeftOff=0/411 membersLeftOff=0/6839` — all match item 14's own
   pre-existing baseline exactly; `§STOREY_ARCH_WITNESS`'s 41-element ARC-short FAIL is the ALREADY-
   DOCUMENTED §128.10 item 7 census gap, unchanged, not a regression. **NO REGRESSION on Terminal**
   (`Terminal_silent`, clip 0.50:0.92): `rungs=6 ladder=[Aras Tanah@3.18,Aras 01@10.05,...,Aras
   Bumbung@25.12]` (Terminal's own single Malay naming system, one label per rung, nothing to fold);
   `base=-0.02 tops=[7.96,...,28.59] inversions=0 naiveInversions=0`; `§STOREY_LABEL_WITNESS
   labelledElements=11233 bookedToOwnStorey=11233/11233`, `§STOREY_ARM_BASELINE armedObjsOff=0/1265`,
   `§STOREY_CUT_RESTORE_WITNESS objsLeftOff=0/1265 membersLeftOff=0/48428`, `§STOREY_ARCH_WITNESS` exact
   in every cell — all byte-identical to item 14's baseline. **NOT RUN: Hospital** — first thing the next
   session should do, same clip/flags shape as §128.10's own Hospital entry. Side effect item 14
   predicted (18->5 groups shortens the reveal's wanted runway) not separately re-measured this session
   — read `§STOREY_REVEAL_WINDOW_FIT`/`§STOREY_REVEAL_RISE_GROW` on the next LTU run for it. Sample
   clips in `~/Downloads/LTU_AHouse_L7_rung_fix_clip_0.9187-0.9500_360p10.mp4`,
   `HHS_L7_regression_check_clip_0.70-0.95_360p10.mp4`, `Terminal_L7_regression_check_clip_0.50-0.92_
   360p10.mp4`. All code UNCOMMITTED in `/tmp/wt-storey-cut`, `viewer/cpe_storey_reveal.js` only.
16. **HOSPITAL REGRESSION RUN + A REAL BUG IN ITEM 15, FOUND AND FIXED (2026-09-15, Sonnet, mid-session
   review from Fable) — item 15's grouping was wrong on the one building it exists to fix.** Hospital
   clip 0.78:0.99 first (`out/l7_hospital_check.log`, 656s): byte-identical to the pre-L7 baseline —
   `§STOREY_RUNG_LADDER rungs=8` (1:1 with labels, no folding), `§STOREY_CUT_BOUNDS inversions=0
   naiveInversions=0`, `§STOREY_LABEL_WITNESS 46360/46360`, `§STOREY_ARM_BASELINE 0/4899`,
   `§STOREY_CUT_RESTORE_WITNESS 0/4899 0/63182`, `§STOREY_ARCH_WITNESS` unchanged (same documented
   census-artifact SHORT counts as item 9), `§CLASH_FILM_BUILD discPairs=12 trueClash=270` — no
   regression, §8.6's bake-owned persistence gate holds on Hospital too. **Then Fable reviewed
   `out/` mid-session and found item 15's `_regroupByRung` uses `LevelDeriver.nearestIdx` (true
   nearest-neighbour) on a LABEL's aggregate mean-Z against the rung ladder — and a federated label's
   mean drifts across a rung boundary whenever its own members sit unevenly above the floor line, which
   is the common case, not the exception.** MEASURED on LTU: "Plan 1" (105k of LTU's 122k elements,
   mean-Z 5.26) sits nearer VÅNING 2's datum (6.35) than VÅNING 1's (3.04) and was booked one physical
   level high; same class of error on Plan 2/3. User's ruling on hearing this: *"yes and it cannot be
   custom or band aid, but be abstract to cover most buildings."* **FIX:** vote PER ELEMENT instead of
   testing the label's aggregate once. `schedule_author.js` already owns the right verb —
   `_ladderBandIndex(ladder, bz)`, "last rung at or below" — used internally by `_chooseStoreyDatum` to
   decide which rungs are populated; exported it (`SA._ladderBandIndex`) so `cpe_storey_reveal.js` reuses
   it instead of re-deriving one. New `_labelRungVotes(rf)` queries every element's own `center_z -
   bbox_z/2` (base-Z, the same idiom `clash_report.js`/`clash_matrix.js` already use) and buckets it
   through `_ladderBandIndex`; a label's rung is now whichever index most of ITS OWN elements actually
   floor-index to (majority vote), not the index nearest its aggregate mean. The exact-name force-match
   (§125.1, a label matching a rung's own declared name always wins) is unchanged and still runs first.
   `window.__srMeanNearestRung` (falsifiability control) forces the OLD nearest-on-mean test back on, so
   the historical defect reproduces on demand; new `§STOREY_RUNG_VOTE mode=perElementVote|CONTROL(
   meanNearest) labels=N correctedVsMeanNearest=M voteMisses=0` reports whether the vote actually changed
   anything (PRIMAL LAW clause 4 — a pass must be able to report its own no-op). **Fable's second
   finding, also fixed:** `§STOREY_CUT_BOUNDS`'s rejection guard (item 15, §STOREY_CUT_BOUNDS_MONOTONE)
   could never be shown FAILING — `naiveInversions` proved the OLD formula was capable of failing, not
   that today's guard is the reason it no longer does. Added `window.__srDisableRejectGuard` (control):
   takes a bad slab-bottom candidate even when it breaks monotonicity, so the RENDERED `inversions` can
   go nonzero. **VERIFIED, all four buildings, same clip shapes as items 1/15:**
   - **LTU** (0.90:1.00, covers the reveal tail through pull-back into orbit — also answers the live
     ask to confirm clash renders alongside the reveal there): `§STOREY_RUNG_VOTE
     correctedVsMeanNearest=6` (of 18 labels — real work, not vacuous); `§STOREY_RUNG_GROUPED
     groups=[VÅNING 1+{Ref.,VÅN 1,Storey 1,Plan 1,VÅN 2},VÅNING 2+{Storey 2,Plan 2,VÅN 3},VÅNING
     3+{Plan 3,Storey 3,VÅN 4},VÅNING 4+{Plan 4},TAKPLAN+{VÅN 5}]`; `§STOREY_CUT_BOUNDS base=0.70
     tops=[2.70,8.06,11.14,18.57] inversions=0 naiveInversions=1 => PASS` (still correctly rejects
     TAKPLAN's bad slab-bottom row); `§STOREY_LABEL_WITNESS 108094/108094`, `§STOREY_ARM_BASELINE
     0/7959`, `§STOREY_CUT_RESTORE_WITNESS 0/7959 0/122330`; `§CLASH_FILM_BUILD discPairs=12
     trueClash=120`, `§CLASH_HUD_PAIR_CARDS pairs=1 [ARC|STR=120]` — clash confirmed rendering in this
     segment. Control A (`--tap` `__srMeanNearestRung`, clip 0.9187:0.9500): reproduces item 15's exact
     original numbers byte for byte — `groups=[VÅNING 2+{Plan 1,Storey 2},...]` (Plan 1 wrongly under
     VÅNING 2) and `tops=[2.70,5.44,11.14,18.57]`, `correctedVsMeanNearest=0` (control confirmed
     reproducing the historical grouping, not a new one). Control B (`--tap` `__srDisableRejectGuard`,
     same clip): `§STOREY_CUT_BOUNDS CONTROL(__srDisableRejectGuard) tops=[2.70,8.06,2.99,18.57]
     inversions=1 => FAIL` — the guard is now shown doing real, load-bearing work.
   - **Terminal** (0.50:0.92): `§STOREY_RUNG_LADDER rungs=6` fires clean (this is the SAME building
     Fable read a stale/differently-invoked log for and saw the line missing — resolved, not a live
     defect); `correctedVsMeanNearest=0` (1:1 label:rung, nothing to fold, byte-identical to item 15's
     baseline); `§STOREY_CUT_BOUNDS tops=[7.96,...,28.59] inversions=0`; `§STOREY_LABEL_WITNESS
     11233/11233`; `§STOREY_ARCH_WITNESS` now EXACT in every cell (no SHORT anywhere — better than item
     15's own baseline, which had none reported as short either). Video stitch was killed by a
     transient system low-memory event at frame 352/353 — all witness lines had already logged before
     the kill, so the verdict stands; the clip itself was not needed.
   - **HHS** (0.70:0.95): `§STOREY_RUNG_LADDER rungs=3`, `correctedVsMeanNearest=0`, `§STOREY_CUT_BOUNDS
     tops=[3.50,7.00,15.07] inversions=0`, `§STOREY_LABEL_WITNESS 4674/4674`, `§CLASH_FILM_BUILD
     discPairs=12 trueClash=233` — byte-identical to item 15's baseline.
   **OPEN, not resolved — flag, don't silently accept:** the fixed LTU grouping puts VÅN 2/VÅN 3/VÅN 4
   one rung LOWER than Fable's own hand-predicted "expected" mapping (Fable expected them beside VÅNING
   2/3/4; the per-element vote puts them beside VÅNING 1/2/3). The vote uses real per-element base-Z,
   which Fable's prediction did not have access to (it read only the aggregate center-Z medians in item
   14's own table) — the vote is likely the more trustworthy signal, but this has NOT been independently
   cross-checked against IFC containment, and no ground truth exists to arbitrate it beyond "which
   heuristic is more principled." Files: `viewer/cpe_storey_reveal.js` (`_labelRungVotes`, rewritten
   `_regroupByRung`, the new `_cutBounds` tap), `viewer/schedule_author.js` (exported
   `_ladderBandIndex`). All UNCOMMITTED, same worktree/branch as item 15.
   **STILL OPEN from §128.10 (not touched this session):** controls 2-4 (the §128.8/9 overlap/restore
   taps — code hooks confirmed still wired, not re-run), the RISE_GROW knob decision (item 6, needs the
   user's word), full 1080p24 delivery ×3, the commit (item 8 below).
8. **Commit** only when the user says. Suggested subject: `fix(film): storey reveal opens after the
   discipline parade, hands the scene back on exit, books by storey label — §128.8/§128.9`. Then PR to
   main per the worktree rule. Item 15's storey-LADDER fix (vs the item 8/9 storey-LABEL fix above) is a
   separate, later commit on the same branch — do not squash them into one message. Item 16's rung-VOTE
   fix (Fable's review) is a further, separate commit on top of item 15's — do not squash any of the
   three together.

*Do not:* judge from frames; add per-building constants; touch anything outside the storey-reveal leg
(`cpe_storey_reveal.js`, the §STOREY_REVEAL_* block of `effects.js`); run two bakes at once; forget the
profile dirs (`ls -d /tmp/silent-bake-profile-*`).

## §129 TWO NEW BEATS — LOAD PATH and LEDGER TICKER (spec, 2026-09-15; user ruling, written by Fable; Sonnet builds test clips)

Spec-first (CLAUDE.md): witness claims before code. Nothing here is implemented. Both beats sit at TOPOUT — the
boundary the film already has (`§CPE_STATS_TAIL reveal round entered … boundary=topoutU 0.271`): the structure is
complete, nothing hides it yet, and the stats round follows. Order at topout: LOAD PATH hold → LEDGER seal moment →
stats round. GATING (user 2026-09-15): all three beats — load path, ledger ticker, cost odometer — are part of the MEASURE
toggle (`--measure` on the CLI, the Measure button in the viewer), not separate flags; `--no-load-path`/`--no-ledger`/
`--no-cost` exist only for control bakes. Film length is unchanged: the hold is shape-seconds like the storey slots, compressed the same way when
the lull is short.

### §129.1 LOAD PATH — a geological section through the structure, one stack lit hop by hop
**User's ruling (2026-09-15):** *"slows down to isolate a few stacks in frame to show how they are supported to the
ground, sort of cut thru section like a geological cut of a mountain … I rather whole stack appears in rainbow
spectrum and the labels come on one by one, and each layer glows in turn … because the whole rest is gone it is
disorientating."* So: NOTHING is hidden. The rest of the building stays, the section cut does the isolating.
- **WHEN (v8 RULING, user 2026-09-15 after sighting v7: "It should freeze as is at the point it is about to show
  LoadPath, then resume without a scene cut"):** the Time Machine cursor HOLDS at topout (the day counter stops) and the
  CAMERA HOLDS EXACTLY WHERE THE FILM HAS IT — no cut, no fit, no dolly; the hold ends and the film resumes from the same
  pose. The v5–v7 camera cut (`_fitCameraToChain`, `§LOADPATH_CAMERA`) is WITHDRAWN. HOLD POINT (user 2026-09-15: "we
  pinpoint where can we get such a complete or 80% of building in"): search the film's own camera path from topout forward
  (up to the stats round) for the first tNorm at which ≥ 80 % of the building's bbox, projected, lies inside the frame; hold
  there. If no tNorm reaches 80 %, hold at the best one and say so. Print `§LOADPATH_SHOT tNorm=… buildingInFrame=f
  stackInFrame=g best=true|false` — the line the user reads to readjust the path when f < 0.80. The user's path is the
  instrument; the beat never moves the camera itself. Print `§LOADPATH_HOLD … cameraMoved=false` (FAIL if the pose at the last hold frame
  differs from the pose at arm).
- **PICK, by rule not by hand (REFINED 2026-09-15 after the first HHS sighting: the deepest chain was a stair balustrade,
  15 `IfcMember` stacked, `storey=Unknown`, 19 hops in the 8 s cap):** candidates and hops are LOAD-BEARING classes only —
  `IfcSlab, IfcBeam, IfcColumn, IfcWall/IfcWallStandardCase, IfcFooting, IfcPile` (classes read from this DB's `elements_meta`,
  never a per-building list) with a labelled storey (not Unknown); a chain hop that lands on any other class is skipped through
  (the hop count only counts load-bearing members) and the chain must end on a footing/ground-touching member. Pick the
  candidate with the most load-bearing hops, ties by the fraction of its chain bbox inside the frame at the hold point,
  then footprint area, then guid (v8, relaxed by the user: "It need not qualify all"). Print `§LOADPATH_PICK … hops=N
  skippedNonStructural=M stackInFrame=g`. Never a cut to make one fit. Print `§LOADPATH_PICK guid=… cls=… storey=… hops=N candidates=M rule=deepest|footprint|guid`.
- **CHAIN MUST DESCEND (user ruling 2026-09-15, after LTU's 21-hop chain climbed from 5.7 m back to 14.8 m — the sweep's
  "designated support" is a placement-order relation, not a gravity path):** a candidate chain is valid only if every hop's
  base is below the previous hop's base and it ends on ground; the pick considers ONLY valid chains. Print on
  `§LOADPATH_CHAIN … monotone=true|false descents=N ascents=M` — ascents>0 is FAIL and never picked. The zigzag itself is a
  finding for the support sweep on federated models (4D_MODEL_INTEGRITY lane), not fixed here.
- **CHAIN:** the support relation is `support_sweep.js`'s (the §I owner of "what holds what"; `witness_midair_zero`
  proves no element is ever placed unsupported). It is computed at schedule generation; on LTU the schedule is
  CAPTURED, so the per-element support parent must be persisted with the captured schedule (`_support` in the op's
  `parameters`, written by the same injectGantt write loop) or recomputed at bake start. Print
  `§LOADPATH_CHAIN guid=… hops=[g0:cls:storey, g1:…, …, ground]` and it must equal the sweep's own relation for the
  same guids.
- **CUT (v8b, user 2026-09-15: "even if it is too closeup, it can still do x-section cut and illustrate as in frame"):**
  ONE clipping plane, facing the camera, placed just in front of the stack's nearest face, removing ONLY the material
  between the camera and that plane; everything beyond the plane stays, ghosted, with the stack solid on top. That is the
  geological section: you take away the near side, never both sides — v1's two-plane slab (`clipped=456` of 475) is what
  hid the building. The plane is set on the ghost materials only (the clones are never clipped). The beat runs whatever the
  framing is: a close shot shows the part of the stack that is in frame. `§LOADPATH_VISIBLE` gains `nearSideClipped=C
  beyondVisible=M`, PASS iff solid==N and M>0 (something beyond the plane still renders) — a scene with M==0 is the v1
  failure, FAIL. Control tap `window.__lpClipAll=1` (plane pushed behind the whole building) must print `beyondVisible=0 =>
  FAIL`.
- **LOOK (v10, user 2026-09-15: "layers are going from top to down with a upper angle view, the lower layers gets
  covered. Better from bottom to up. And each layer in solid form. That be clean. Now is fuzzy."):** the building stays
  x-ray (ghost) with the single near-side section plane (v8b). At arm NO layer is solid. The stack BUILDS BOTTOM-UP: at each
  step the next visible layer (ground first) turns SOLID in its rainbow colour and its ladder label lands with a leader;
  layers above it stay ghost until their turn, so nothing above covers what is being shown. The last step lands the picked
  element. One hue ramp ground→top; no per-building constants. WITNESS `§LOADPATH_STACK order=bottomUp step=j solid=j/K
  ghostAbove=K−j` printed at every step (K = visible hops); FAIL if a step ever has a solid layer above a ghost one.
  Control tap `window.__lpTopDown=1` must print FAIL at step 1.
- **TIME:** 1 s/hop + 1 s hold, capped at 8 s; LTU (5–6 hops) ≈ 7 s. Print `§LOADPATH_HOLD tNorm=… shapeSec=… hops=N
  cursorDay=… (held)`.
- **RESTORE:** cut plane off, colours back, labels gone; reuse the storey leg's hand-back (`A._applyDiscVisibility()`
  + `__forceFull`) and print `§LOADPATH_RESTORE materialsRestored=N/N planesLeft=0 => PASS|FAIL`.
- **WITNESSES that can fail (the user's eyes are never the instrument — PRIMAL LAW clause 1):**
  `§LOADPATH_VISIBLE hops=N solid=N ghosted=M hidden=K clipped=C => PASS|FAIL` printed at the middle frame of the hold, where
  solid = chain members with visible=true, scale≠0, opacity=1, no clip plane; ghosted = every other scene object that is
  visible=true and translucent; hidden = any object with visible=false or zero scale that the arm snapshot had visible;
  clipped = objects under any active clip plane. PASS iff solid==N and hidden==0 and clipped==0. Control tap
  `window.__lpHideRest=1` (sets visible=false on the ghosted set) must print `hidden=M => FAIL`.
  `§LOADPATH_FRAMING buildingInFrame=f stackInFrame=g hopsIntersecting=K/N => PASS|FAIL` (v8b): at the middle hold frame,
  through the film's own camera; PASS iff K ≥ 1 (some of the stack is in the shot and the cut reveals it); f and g are
  printed for the user's path readjustment (the 80 % bar governs the HOLD-POINT search, not the verdict). Control
  `__lpFrameOff` (building bbox offset before projection) must print `hopsIntersecting=0/N => FAIL`. Control tap
  `window.__lpFrameOff=1` (offsets the pick's bbox by one building width before projection) must print `inFrame=false => FAIL`.
  Plus the existing: `§LOADPATH_CHAIN` vs the sweep (a control tap `window.__lpBreakSupport=1` removes one
  hop from the drawn chain and must print `=> FAIL hopsDrawn=N-1 hopsSweep=N`); `§LOADPATH_HOLD` (cursorDay before ==
  after, else FAIL); `§LOADPATH_RESTORE` (a control tap `__lpSkipRestore=1` must print FAIL); `§LOADPATH_PICK` must be
  deterministic across two bakes of the same clip (same guid). No pixel evidence.
- **DO NOT:** hide the rest of the building; clip both sides (a slab cut); move the camera during the hold; light more than one stack; add a per-building constant; judge from frames.

### §129.2 LEDGER TICKER — the buildup verified against the kernel-ops chain, sealed at topout
- **WHAT:** not a new visual pass (replaying by ledger id would look like a scrambled build). A HUD row during the
  buildup: `ops verified n / N · remaining N−n · tip <op_hash[0:12]>`, counting up as each placed element's op is
  verified; at topout the tip LOCKS for 2 s: `N / N verified · tip …`. Dashboard value: a count-up and a countdown.
- **ID ORDER vs 4D ORDER:** `kernel_ops.id` is the ledger's append order at extraction (LTU ids 3–5 are the first
  footings); `timestamp` is written later by injectGantt from the CPM solve, and the Time Machine plays by timestamp.
  The chain seals in id order, so it certifies the RECORD, not the construction sequence — hence HUD, not motion.
- **PREFLIGHT, the real constraint:** `timestamp IS part of _canonical` (erp/kernel_ops.js:79) and the injection
  rewrites `timestamp` + `parameters` of every `ELEMENT_PLACE` op, so any seal taken before capture is void. The DB
  read by the bake must be sealed AFTER the schedule is captured (`sealFrom`, `§KRN_SEAL_FROM`), then verified:
  `§KRN_CHAIN verified=N/N tip=… sealedAfterCapture=true`. This copy of `LTU_AHouse_silent.db` has 2 of 122,332 ops
  sealed — the ticker has nothing true to show until that preflight is done and saved.
- **WITNESSES:** the HUD's final `n/N` and tip must equal the `§KRN_CHAIN` line's (`§LEDGER_TICKER final=N/N tip=…
  chainTip=… => PASS|FAIL`); control: a tap `__ledgerFlipByte=<id>` that alters one op's `parameters` in memory must
  make verify fail AT that id and the HUD must show `broken at op <id>` (`=> FAIL`, expected); a run on the unsealed
  DB must print `§LEDGER_TICKER INCONCLUSIVE reason=unsealed`, never a green count.
- **DO NOT:** show a count on an unsealed chain; replay by id as geometry; hash on the bake side (verify only).


### §129.5 COST ODOMETER — one figure beside the resource chart HUD (user 2026-09-15: "just adding a small figure next
to the resource chart HUD which is its proximity of source")
- **WHAT:** during the buildup, one running figure next to the resource chart: cost to date and crew-hours to date, from the
  schedule's OWN rate model (`rates.js`, the same `hrCost` the gantt caches) — no second costing. Updates at the day counter's
  cadence. At topout it reads the schedule's total.
- **WITNESS:** `§COST_ODOMETER day=D placed=n/N costToDate=c hoursToDate=h` per day-counter tick, and at the last buildup frame
  `§COST_ODOMETER_FINAL cost=c total=T hours=h totalHours=H => PASS|FAIL` with PASS iff c==T and h==H to the cent/minute,
  T and H read from the schedule's own totals (the rate model's summary line), never re-summed here. Control: tap
  `window.__coFreeze=1` (odometer stops at day 1) must print FAIL; an empty rate model must print `INCONCLUSIVE reason=norates`.
- **DO NOT:** invent a rate; re-sum outside the rate model; show a figure on a building whose schedule has no costs.

### §129.6 v9 — SIGHTING FINDINGS (user 2026-09-15 on the HHS/LTU clips) and their witnesses
User: *"The freeze frame in scene is correct, but its resumption is not. It jumps, not a next frame expected. The running
cost/resource is not in the HUD proper. Also the so called 'id countdown'. Gets covered by other HUD. The freeze layers label
each - some too close they overlap each other. Should be organized."*
1. **RESUME JUMP — cause in `HHS_loadpath_v8d.log`:** `§SUN_ARC_STEP tNorm` steps 0.260 → 0.306 between `§LOADPATH_ARM` and
   `§LOADPATH_RESTORE` while `cameraMoved=false`: the hold pinned the camera and the schedule cursor but the FILM CLOCK kept
   running (`§LOADPATH_WINDOW_SHIFT revealU 0.2601 -> 0.3062` is that same 6 s), so at release the camera snaps to where
   the path had moved on to. RULE: the hold FREEZES THE FILM CLOCK. For every hold frame, tFilm (path, sun, HUD day counter,
   stats round, everything) evaluates at the arm value; the film resumes from that same tFilm; the delivered film is longer
   by the hold (user: "I don't mind it adds few secs"). `§LOADPATH_WINDOW_SHIFT` is withdrawn. WITNESS `§LOADPATH_RESUME
   tFilmArm=a tFilmRelease=b framesInserted=k stepAtResume=d maxStepElsewhere=m => PASS|FAIL`: b==a, and d (camera position
   delta between the last hold frame and the first resumed frame) ≤ m (the largest camera step between any other adjacent
   frame pair in the same bake) — no threshold constant. Control tap `window.__lpNoClockFreeze=1` must print FAIL. Also
   ffprobe frames must equal the clip's frames + k.
2. **COST FIGURE IN THE HUD PROPER:** it is drawn INSIDE the resource chart's own panel box, by the panel's own draw routine,
   same font and row style, as one more row — never a free-floating text. Print its rect in `§HUD_LAYOUT` (item 4).
3. **LEDGER TICKER IN THE HUD PROPER:** one row of the status box (`§STATUS_BOX_ROWS` already lists rows: Storey, Room,
   Build-up…) — `Ledger  n / N verified · tip xxxxxxxxxxxx` — laid out by the status box, never a free-floating text.
4. **HUD LAYOUT WITNESS:** every HUD drawer registers the rect it painted this frame (status box, resource panel, roster,
   cards, cost row, ledger row, load-path labels); once per hold (middle frame) print `§HUD_LAYOUT items=[name:x,y,w,h …]
   overlaps=0 => PASS|FAIL` where overlaps counts intersecting pairs among registered rects. Control tap
   `window.__hudForceOverlap=1` (moves the ledger row onto the roster) must print `overlaps>0 => FAIL`.
5. **LAYER LABELS ORGANIZED:** a label LADDER, not per-layer floating text: labels stacked in one column beside the stack (the
   side with more free frame, chosen by the stack's projected x), sorted by layer height, evenly spaced with a gap of at
   least one label height, each with a leader line to its layer's projected centroid (the measure-cue leader drawing).
   Labels still land one per (hold/N) bottom-up with the layer glow. WITNESS `§LOADPATH_LABELS n=N column=left|right
   overlaps=0 minGapPx=g => PASS|FAIL` from the drawn label rects (PASS iff overlaps==0 and every label rect inside the frame).
   Control tap `window.__lpLabelsNaive=1` (labels at the layer centroids, v8 behaviour) must print overlaps>0 => FAIL on LTU
   (21 layers) — if it does not, the control is wrong, not the witness.
6. Hold cap stays 8 s for now (user to rule after sighting a ladder with 21 labels).
6b. **PLACEMENT RULING (user 2026-09-15): the COST row sits DIRECTLY ABOVE the LEDGER row, both INSIDE THE PIE CHART HUD**
   (the panel `§CPE_PIE_FLYOUT`/the pie drawer owns), laid out by that panel's own row routine — this supersedes items 2
   and 3's "resource panel" and "status box" placements. Their gate is that HUD's toggle (the `Label` button / `--label`),
   not Measure; the load path stays under Measure. The toggle's on-screen text becomes **`4D/5D`** (it carries the day
   counter, cost and ledger); the CLI flag stays `--label` (alias `--4d5d` accepted) so no bake command breaks. Example rows:
   `Cost   801 577 · 13 038 h` over `Ledger   2 418 / 6 884 verified · 4 466 remaining · tip 90331b9180a2`; at topout
   `Ledger   6 884 / 6 884 verified · tip 90331b9180a2 ✓`; tampered: `Ledger   2 / 6 884 verified · broken at op 3`.
   `§HUD_LAYOUT` must list `pie.cost` and `pie.ledger` with cost.y + cost.h ≤ ledger.y (cost above), FAIL otherwise.
7. **ONLY WHAT IS ON SCREEN (user 2026-09-15: "For HHS it is out of frame the cake layer and its labelling. It should just
   address what appears on screen"):** (a) PICK ranks candidates by the number of hops IN THE SHOT at the hold point FIRST
   (the frustum test), then total load-bearing hops, then footprint, then guid — the stack that shows the most layers wins,
   not the deepest one hidden off-frame; print `visibleHops=K/N`. (b) The label ladder lists ONLY the visible hops (K rows),
   numbered by their true layer index; off-screen hops are coloured but never labelled and never leadered. (c)
   `§LOADPATH_LABELS n=K of=N …` — n must equal hopsIntersecting; a label rect outside the frame is a FAIL.
8. **FOCUS — everything else is OFF during the hold (user 2026-09-15, sharpened: "The other labels and overlays should
   be off"):** for the hold frames every other overlay and every other label — stats round highlights and cards, roster,
   clash pair pulses/markers, measure cues, room titles, discipline labels, day counter — is NOT PAINTED (the HUD status box
   with its ledger/cost rows stays, frozen); only the load path (stack, ladder, leaders) draws. All come back at restore.
   Implement as one `hold=true` flag on the per-frame composite/apply calls in cinema_maxq.js's frame loop. WITNESS
   `§LOADPATH_FOCUS overlays=[name:off|painted …] painted=0 => PASS|FAIL` from the same rect registration as §HUD_LAYOUT
   (an overlay that registered a rect during a hold frame is `painted`). Control tap `window.__lpNoFocusHold=1` must print
   painted>0 => FAIL on HHS 0.22:0.32 (stats round live at topout).

### §129.7 SIGHTING ROUND 3 (user 2026-09-16, on `HHS_loadpath_v10b`): freeze accepted; three rulings
User: *"1. The frame freeze in and out, is now in sync during the pause. 1.2 The labelling skew to the right and obscured a
bit by the HUD. Rather have the labels fall in the screen centre as now they are quite clean for use. 1.3 The stack ie ifc
column stack that gets solid treatment is not discernible. Perhaps choose a thicker stack or a closer one? 2. The 5D info is
now in HUD, just that similar to the rest, their text strings are long and got truncated. Perhaps a rearrange, where the
pie can occupy its own width, and the lines sitting below it, to get max width space. Or else they have to wrap but i
think not."*
1. **FREEZE/RESUME — ACCEPTED** (`§LOADPATH_RESUME` v10b). Do not touch.
2. **LABELS IN THE SCREEN CENTRE:** the ladder column is centred on the frame's x-centre (labels centre-aligned), vertical
   order by layer height, same gap rule, leaders to each layer's projected centroid; it still must not intersect any
   registered HUD rect (the centre is normally free — if not, the witness says so). `§LOADPATH_LABELS … column=centre
   x=… overlaps=0 hudClear=true => PASS`; a label intersecting a HUD rect is FAIL (was: side columns).
3. **A DISCERNIBLE STACK:** rank candidates by how large their THINNEST visible member is on screen: for each descending,
   ground-ending chain with ≥1 visible hop compute `minMemberPx` = the smallest projected bbox height (px) among its
   visible hops at the hold pose; rank by minMemberPx DESC, then visible hops, then depth, then footprint, then guid. A
   thicker member or a nearer one both raise it — no threshold constant; the number is printed:
   `§LOADPATH_PICK … minMemberPx=… visibleHops=K/N rule=minMemberPx|visibleHops|…`. Witness `§LOADPATH_FRAMING` gains
   `memberPx=[h0,h1,…]` per visible hop (printed, not judged). Control tap `window.__lpPickThinnest=1` (rank ascending) must
   pick a different guid with a smaller minMemberPx — printed on both lines.
4. **5D ROWS WITHOUT TRUNCATION — rearrange the pie panel:** the pie keeps its own width at the top of the panel; the COST
   and LEDGER rows sit BELOW the pie, each spanning the panel's full inner width; the panel grows in HEIGHT to fit (its
   own layout routine, one mode for both content states); no wrapping, no ellipsis. `§HUD_LAYOUT` gains
   `truncated=N` (rows whose measured text width exceeded their available width before any fitting) — PASS requires
   overlaps=0 overflow=0 costAboveLedger=true. REVISED (user 2026-09-16): the panel does NOT widen — "users can see the
   ravelling when it is shorter, gives glimpse of the common end tail; this is just for idea rather than empirical record".
   Rows keep the panel's inner width; text beyond it is clipped with an ellipsis; `truncated=N` is PRINTED, not judged;
   `overflow` (the drawn rect leaving the panel) must still be 0. Row text stays the short-by-design form
   `Ledger 2 418/6 884 · tip 86791703`.
5. Control-side wart to fix in the same round: the `__hudForceOverlap` tap must force the overlap by moving `pie.ledger`
   onto `pie.cost` (or onto the roster), not by registering dummy overlay rects — so `§LOADPATH_FOCUS` stays PASS under it.
6. **BLACK BACKDROP DURING THE HOLD, FADED (user 2026-09-16: "the background earth, silhouette and sky to disappear in
   black be good contrast … Yes add it, fade in and out" — sharpened: "the fade out occurs before the freeze and also
   after the freeze it fades back in"):** the fade-out to black runs over the last ~0.5 s of MOVING film BEFORE the arm
   frame (film clock running), so the freeze lands on an already-black backdrop; the backdrop stays black for the whole
   hold; the fade-in runs over the first ~0.5 s of moving film AFTER release. Never a hard switch. The fades ride the film
   clock (they are part of the film), the hold itself is frozen. The stack, the ghosted building, the ladder and the frozen HUD
   are all that remain; lighting unchanged. If the ghost is too faint against black, that is a look ruling after sighting,
   not a constant to tune now. WITNESS `§LOADPATH_BACKDROP fadeInFrames=n black=true fadeOutFrames=m restored=true =>
   PASS|FAIL`: fadeInFrames counts the pre-arm frames of the fade-out, fadeOutFrames the post-release frames of the
   fade-in; black = at the arm frame AND the hold's middle frame the sky/ground/context are at their black state;
   restored = at the last fade-in frame every backdrop value equals its value at the first fade-out frame. Control tap `window.__lpBackdropNoRestore=1`
   must print restored=false => FAIL. Reuse whatever the film already uses for sky/ground (the sun-arc sky, the ground
   plane material) — no new scene objects.
7. **GHOST A BIT BRIGHTER DURING THE HOLD (user 2026-09-16: "if it does not impair the stack solid display buildup"):**
   the hold's ghost opacity goes from 0.12 to 0.20 — for this beat's ghost clones only; the discipline parade's own ghost
   look is untouched. The solid layers stay at opacity 1 and render above the ghosts (renderOrder), so the buildup contrast
   is the ratio 1 : 0.20. Print `ghostOpacity=0.20 solidOpacity=1.00` on `§LOADPATH_VISIBLE`; FAIL if ghostOpacity ≥ 0.50
   (a ghost that bright is no longer a ghost). Final brightness is a look ruling after sighting against the black backdrop.
8. **PIE PANEL LAYOUT (user 2026-09-16, on the Terminal clip: "the pie is not occupying its own exclusive space width
   row col so that it gives spaces to the lines which gets heavily truncated. The running new line should also stay
   absolute bottom row as appending to the resource changing height makes it jumps up and down"):** (a) the pie gets an
   EXCLUSIVE band at the top of the panel — nothing else is laid out beside it; (b) the resource lines follow below it;
   (c) the COST and LEDGER rows are PINNED to the panel's bottom edge at a constant y (cost above ledger), never appended
   after the resource lines, so a growing or shrinking resource list cannot move them; the panel's height is the maximum it
   needs for the whole bake (computed once at build from the longest resource list the schedule can show), not per frame;
   (d) both rows get the panel's full inner width. Truncation stays allowed (item 4) but must now be rare. WITNESS: on
   `§HUD_LAYOUT` print `pieExclusive=true|false` (no registered rect intersects the pie's band), `rowsFullWidth=true|false`
   (row w == panel inner w), and at the end of the bake `§HUD_LAYOUT_STABLE ledgerY=[min,max] costY=[min,max] panelH=[min,max]
   => PASS iff each min==max` sampled every frame. Control tap `window.__hudRowsFloat=1` (append the rows after the resource
   lines, the old behaviour) must print `ledgerY=[a,b] a≠b => FAIL` on a clip whose resource list changes (HHS 0.22:0.32
   during the buildup qualifies).
   FONTS (user 2026-09-16, after sighting: "the other text lines are too large. Keep them same size as before, allow the
   pie only to grow"): every text row in the panel keeps the font size it had BEFORE the rework (read the pre-Round-10
   value from git history of cpe_resource_panel.js, do not guess); only the pie band grows. Print `rowFontPx=` and
   `pieBandH=` on `§HUD_LAYOUT`; FAIL if rowFontPx differs from that recorded value.

### §129.8 SHINE-THROUGH, TWO STACKS, VISIBLE = UNOCCLUDED (user rulings 2026-09-16, after the Terminal sighting)
User: *"instead of going ghost, why not let the stack shines thru? Thus no need to fade off background"* … *"can we just
select what is visible? Can we select 2 stacks? One further"* … *"Agree, far then near"*. The Terminal freeze frame
(Screenshots/2026-09-16 06-23-39) showed one solid column at the frame edge under the HUD, the other members off-frame.
1. **SHINE-THROUGH is the default look.** The building stays exactly as the film renders it: no ghost material, no
   near-side clip plane, no backdrop fade. The chain clones are drawn ON TOP: `depthTest=false`, `depthWrite=false`,
   `renderOrder` above everything, solid rainbow with a slight emissive lift, opacity 1. Ghost+cut+fade (§129.7 items 6-7,
   §129.1 CUT) stay in the code behind `window.__lpLookGhost=1` for an A/B; they are no longer the default. Witness
   `§LOADPATH_LOOK mode=shine|ghost ghosted=0 clipped=0 backdropFaded=false` in shine mode (FAIL if any ghost clone or
   clip plane exists in shine mode).
2. **VISIBLE = UNOCCLUDED.** Per candidate member at the hold pose: sample S points on the member's world box faces that
   face the camera (S from the box's screen size, min 9), cast a ray from the camera to each; the member is visible at that
   point iff the first hit belongs to the member's own guid (raycast against the building meshes the storey leg already
   traverses). `unoccluded = hits_self / S`; `screenArea = projected box area inside the frame (px)`. A member also counts
   as hidden if its screen box intersects any registered HUD rect (the pie panel, status box, compass). Print per hop on
   `§LOADPATH_FRAMING memberVis=[u0,u1,…] memberPx=[…] underHud=[…]`.
3. **TWO STACKS, FAR THEN NEAR.** Candidates = descending, ground-ending chains with ≥ 2 load-bearing hops. Score =
   Σ over hops of (unoccluded × screenArea), hops under a HUD rect scored 0. NEAR = the best score. FAR = the best score
   among candidates whose distance from the camera exceeds NEAR's by at least the building's plan depth along the view
   direction (no constants: the building box's extent along camDir); if none qualifies, FAR is omitted and said so.
   Print `§LOADPATH_PICK stacks=2 near=guid(score,dist) far=guid(score,dist)` or `stacks=1 farReason=none-beyond-depth`.
   Sequence within one hold: FAR reveals bottom-up first with its ladder, then NEAR; hold = the two reveals back to back,
   each 1 s/visible hop + 1 s, total capped at 12 s. `§LOADPATH_STACK` prints `stack=far|near step=j/K`.
4. **LADDERS BESIDE THEIR STACKS.** One ladder per stack, placed in the free frame area adjacent to that stack's screen box
   (the side with more room, between the two stacks if both fit), HUD-clear by the §HUD_LAYOUT registry, leaders short.
   `§LOADPATH_LABELS stack=far|near n=K column=x hudClear=true overlaps=0`.
4b. **NO HUD AT ALL DURING THE FREEZE (user 2026-09-16: "during freeze, completely remove any HUD and path map"):**
   for the hold frames nothing is painted but the stacks and their ladders — no status box, no pie panel (cost/ledger rows
   included), no path map/compass, no roster, cards, cues, titles or labels. Supersedes §129.6 item 8's "status box stays".
   All of it returns at release. `§LOADPATH_FOCUS overlays=[…] painted=0` now covers every HUD drawer incl. `hud.status`,
   `hud.pie`, `hud.pathmap`; during the hold `§HUD_LAYOUT items=[…]` may list only `loadpath.*` rects (FAIL otherwise), so
   `underHud` is evaluated against the HUD rects of the ARM frame (what the viewer saw just before the freeze) for the
   pick only. Control `window.__lpNoFocusHold=1` must print painted>0 => FAIL.
   FADED, not cut (user 2026-09-16: "let them fade out during the stack show and fade back in before resuming"): the whole
   HUD (status box, pie panel, path map, every overlay) fades out over the first ~0.5 s of the HOLD (hold clock), is fully
   off through the stack show, and fades back in over the last ~0.5 s of the hold so it is fully back at release. Witness
   `§LOADPATH_HUD_FADE fadeOutFrames=n alphaMid=0 fadeInFrames=m alphaAtRelease=1 => PASS|FAIL`; `painted=0` applies to
   the alpha-0 frames. Control `window.__lpHudNoFade=1` (hard cut) must print fadeOutFrames=0 => FAIL.
   WITNESS DEFECT (user sighting of `HHS_loadpath_r12`, 2026-09-16): that log printed `fadeOutFrames=5 alphaMid=0` and
   `painted=0 hudAlpha=0.00` while the HUD was plainly on screen through the freeze — the alpha was applied to a variable
   the frame compositor never reads. RULE: the fade must be applied at the call that actually puts each HUD layer into the
   encoded frame (whatever drawImage/composite step the CLI capture uses), and the witness must report the alpha USED AT
   THAT CALL per layer per frame: `§LOADPATH_HUD_FADE … compositeAlpha=[hud.status:0.00,hud.pie:0.00,hud.pathmap:0.00,…]`
   at the hold's middle frame, FAIL if any layer's composite alpha > 0 there. A witness that reads a flag instead of the
   composite is not a witness of the frame.
6. **INFO CARD DURING THE HOLD (user 2026-09-16: "Yes good design"):** with the HUD faded out, one small card, top-left,
   fades in with the first ladder and out with the HUD fade-in; text assembled ONLY from the PICK/CHAIN/HOLD lines, e.g.
   `LOAD PATH · day 43, structure topped out` / `Near stack   5 layers · Level 3 column → Level 1 slab → ground` /
   `Far stack    7 layers · Aras 04 wall → ground floor slab → ground` / fixed third line `each layer rests on the one
   below it, as the 4D order built them`. Day from the frozen cursor; storeys and classes from the chain; omit the far
   line when stacks=1. WITNESS `§LOADPATH_CARD lines=N rect=x,y,w,h inFrame=true overlaps=0 near=guid far=guid|none =>
   PASS|FAIL` — FAIL if a guid on the card is not the one drawn, or the card rect leaves the frame or overlaps a ladder.
   Control `window.__lpCardWrongStack=1` (card names the build-time probe pick) must FAIL when the live re-pick differed.
7. **CONTROLS:** `window.__lpPickOccluded=1` (rank by (1−unoccluded)) must pick different guids with lower unoccluded;
   `window.__lpLookGhost=1` must print `mode=ghost` and the §129.7 witnesses instead; `window.__lpOneStack=1` must print
   `stacks=1`. Everything else in §129.6/§129.7 (clock freeze, resume, focus off, HUD layout and pinned rows, cost/ledger)
   stands. Proof bake: HHS 0.2432:0.2770 at 854x480@10, then the controls, then Terminal.

### §129.9 ROUND 16 RULINGS (user 2026-09-16, on the HHS R14 clip; read from the §HUD_LAYOUT registry, not guessed)
1. **DISENTANGLE THE 4D/5D ROWS FROM THE PIE PANEL.** The registry shows why the HUD reads gigantic: `resource-panel`
   173×115 px before the rework, 173×272 now (`pie.band` 173×114 full width + `pie.list` 173×113 reserved for the worst-case
   trade list + two 16 px rows) — 57 % of a 480 px frame; the trade-list font is 10 px in both. RULE: the COST and LEDGER
   rows live in their OWN fixed box (`hud.fiveD`), anchored at a constant position directly below the pie panel's ORIGINAL
   rect (same x, width, two rows, cost above ledger, gated by the 4D/5D toggle); the pie panel KEEPS the single full-width
   pie band at its current bigger size (user: "retain the single row pie bigger size as it is now") with the trade list
   below it at its pre-Round-10 row size and NO reserved worst-case area and no rows inside it — the panel's height is pie
   band + the rows actually shown. Witness: `§HUD_LAYOUT` prints `pie.band:…h=114@480p` (unchanged) and
   `resource-panel:…h = pieBandH + shownRows×rowH0 + pads` (FAIL if any reserved space remains), `hud.fiveD:x,y,w,h`
   constant over the bake (`§HUD_LAYOUT_STABLE fiveDY=[min,max]`; anchor it below the panel's MAXIMUM height so a growing list
   never reaches it, or at the frame's bottom-right — either is fixed), and no
   overlap between hud.fiveD and any other rect. Control `window.__hudRowsFloat=1` now moves hud.fiveD and must FAIL.
2. **EVERY HUD DRAW GOES THROUGH THE FADE, PROVEN ON THE FRAME.** `_captureFrame` draws the measure datum ONCE OUTSIDE
   `_drawUnlessHold` (cinema_maxq.js ~line 1003) and again inside it; the outside call survives the hold. RULE: no composite
   call in the capture path outside the wrapper. WITNESS that cannot be fooled by a wrapper: during a hold frame, count
   every fillText/drawImage/fillRect on the capture context that is not issued by the load path's own composite —
   `§LOADPATH_FOCUS … unwrappedDraws=0 => PASS|FAIL` (instrument the ctx methods for that frame). Control
   `window.__lpNoFocusHold=1` must print unwrappedDraws>0.
3. **BLACK BACKDROP IN SHINE MODE (user: "Would fade to black helps?" — yes):** sky, ground and context silhouette fade
   to black before the freeze and back after release exactly as §129.7 item 6, also in shine mode; the building stays lit
   and the stack shines through. Same `§LOADPATH_BACKDROP` witness and control.
4. Round 15 (occlusion definition, honest pick tiers) ships with this. Proof: HHS 0.2432:0.2770, then Terminal, Hospital.

### §129.3 HAND-OFF (Sonnet): build test clips, cheapest first
1. HHS, 854x480@10 (user 2026-09-15: "no need 1080p clips, 480p will do"), `--clip 0.22:0.32` (spans topout), LOAD PATH only: `§LOADPATH_PICK/CHAIN/HOLD/RESTORE` all PASS,
   then the two control taps FAIL. Then LTU same clip window (its chain is deeper; check the persisted support).
2. LEDGER: preflight first on HHS (seal after capture, `§KRN_CHAIN verified=6880/6880`), then the ticker clip over
   `0.00:0.32`; the unsealed-DB run must print INCONCLUSIVE.
3. Only then a joint clip. One bake at a time; `bake_scope.sh`; read the log, not the exit code; copy accepted clips to
   `~/Downloads/<Name>_loadpath_<clip>_360p10.mp4`. Do not touch the storey-reveal leg's files for this.

### §129.4 IMPLEMENTATION NOTES (2026-09-15, Sonnet, worktree `/tmp/wt-loadpath` branch `feat/loadpath-ledger`)

**Scope this session: §129.1 LOAD PATH only** (Lane B's stated order — LEDGER/§129.2 is next once §129.1's
HHS PASS + 2 control FAILs are in hand, per the STOP condition). Nothing in `cpe_storey_reveal.js` or the
§STOREY_REVEAL_* block of `effects.js` is touched — the restore hand-back is CALLED, not re-derived.

**New file: `viewer/cpe_load_path.js`** (`setupCpeLoadPath(A)`, added to `main.js`'s `_mods` array and to
`viewer.html` as a `<script>` tag after `cpe_storey_reveal.js`), following the SAME four-hook shape
`cpe_flythru_cues.js` already uses (build-once / per-frame-apply / per-frame-2D-composite / dispose) rather
than inventing a fifth wiring pattern:
- `A.loadPathBuild(plan, filmSecFull, topoutU, db)` — called once before the frame loop, next to
  `A.flythruCuesBuild(plan, _filmSecFull)` in `cinema_maxq.js`. Does the DATA work exactly once per bake:
    - builds `items[]` via `A.dbQuery` against `elements_meta`/`element_transforms`, same column mapping
      `time_machine.js`'s `_buildXrayElements()` uses (`base_z=cz-bz/2` etc.) — a DELIBERATE re-query, same
      discipline `_buildXrayElements`'s own header comment names ("a DELIBERATE COPY of the geometry+seq
      build inside injectGantt()"), not a shared abstraction, since `_buildXrayElements` itself is private
      to `time_machine.js` and not exported.
    - classifies each item's `seq`/`phase` via `ScheduleAuthor.matchNameOverride`/`ScheduleAuthor.matchRule`
      (already exported globals — `window.SEQUENCE_RULES`/`SEQUENCE_DEFAULT`/`SEQUENCE_NAME_OVERRIDES` from
      `rates.js`), the same two-step `_buildXrayElements` uses internally.
    - `G = SupportSweep.contactGraph(items)`, `des = SupportSweep.designatedSupport(items, G)` — the SAME
      relation `time_machine.js`'s own `_designatedSupport` wraps, called directly since it is already a
      `window.SupportSweep` global. Recomputed at bake start (the spec's second option), not persisted into
      `_support` op parameters — cheaper, and every building's schedule is already fully captured/derived by
      the time this call runs, so nothing about "recompute vs persist" changes what gets drawn.
    - per-element hop-depth via `des[]` (memoized recursive walk, cycle-guarded — `§SUPPORT_CYCLE` rows treat
      a revisit as a base case rather than looping).
    - **PICK**: max depth, ties by footprint area (`(x1-x0)*(y1-y0)`) then guid. Prints `§LOADPATH_PICK`.
    - **CHAIN**: walks `des[]` from the pick to ground (cap 64 hops). Prints `§LOADPATH_CHAIN` with
      `hopsDrawn`/`hopsSweep` and a PASS/FAIL verdict (`hopsDrawn===hopsSweep`, guid-for-guid). Control tap
      `window.__lpBreakSupport=1` truncates the DRAWN copy by one hop before the print, leaving the SWEEP
      side (`hopsSweep`) untouched — the discrepancy is the FAIL.
    - Hold-window timing (1 s/hop + 1 s hold, capped at 8 s) anchored at `topoutU` (the SAME `_revealU`
      value `cinema_maxq.js` already computes from `_buildupTopoutU(plan)` for the stats-tail boundary —
      passed in, not recomputed). Exposes `A._loadPathWindow = { durU }` so the caller can push the existing
      `_revealU` (stats-round boundary) forward by `durU` — "LOAD PATH hold → stats round" ordering from the
      §129 preamble — WITHOUT touching the compressBy/RISE_GROW machinery storey-reveal owns.
  Guarded: no `A.db`/`SupportSweep`/`ScheduleAuthor`/no topout (`topoutU` null, i.e. no buildup) → one
  `§LOADPATH_BUILD INCONCLUSIVE reason=...` line, everything else no-ops for the whole bake (DEGRADE, DON'T
  DISABLE — never throws, never silently blank).
- `A.loadPathApplyVisual(plan, tNorm)` — called every frame next to `A.storeyRevealApplyVisual`/`ApplyCut`,
  and with `(null, 0)` at both bake-exit paths (success and the `finally` throw path) exactly where
  `A.storeyRevealApplyVisual(null, 0)` already sits. Arms on window entry, restores on exit or force:
    - **rainbow ramp color**: a small `_lpApplyColor`/`_lpRestoreColor` pair modeled on
      `cpe_storey_reveal.js`'s own `_applyTint`/`_restoreTint` (`setColorAt`/`getColorAt` for
      Instanced/BatchedMesh via `A._instanceMeta`/`A._batchMeta`, material clone+restore for a lone Mesh via
      `A.collectMeshes`), keyed by the CHAIN's guids instead of by storey — the same precedent
      `cpe_storey_reveal.js:680-869` documents borrowing from `hba_lens.js`, reused a second time rather than
      forked a second way. Hue ramp ground(red)→top(violet), one `THREE.Color().setHSL(...)` ramp, no
      per-building constant.
    - **cut**: ONE pair of `THREE.Plane` clip planes (a "slab", one bay either side of the pick, reusing
      `grid_overlay.js`'s per-material `clippingPlanes` idiom) oriented perpendicular to the building's SHORT
      footprint axis (whichever of X/Y has the smaller overall `elements_meta`/`element_transforms` extent is
      the long axis, cut runs along it) through the pick's own centre. "One bay" is DERIVED per run from the
      pick's own footprint extent along the short axis (×3, a proxy for "a few members wide"), never a typed
      building-specific number — flagged here as an approximation the spec's "one bay" language doesn't fully
      pin down, not a per-building constant.
    - **camera**: NOT a new bespoke dolly this session. The beat that already owns this tNorm range (pullback
      or orbit, per `plan.beats`) keeps driving the camera unchanged — "no dead frame" is satisfied by that
      existing motion rather than a second camera system. Flagged as a simplification against the "slow dolly
      along the cut plane" wording; a follow-up can special-case the camera path inside this window once the
      data/witness half is proven.
    - **glow**: the hop landing THIS second is lerped toward white for its 1 s label-on window, then settles
      to its steady rainbow hue — layered on top of the same color-touch bookkeeping, no second material path.
    - **hold witness**: cursor (`window.tmGetState().cursor`) sampled on window entry and compared every
      frame through exit; prints `§LOADPATH_HOLD tNorm=... shapeSec=... hops=N cursorDayBefore=...
      cursorDayAfter=... => PASS|FAIL` on exit. PRIMAL LAW clause 4: if `window.tmGetState` was never
      available (no cursor to compare at all), prints `INCONCLUSIVE reason=no-tm-cursor` instead of a
      vacuous PASS.
    - **restore**: `A._applyDiscVisibility()` + `window.__forceFull = true` (the exact §128.8 hand-back this
      leg is told to reuse verbatim), plus this module's own color/clip-plane undo. Prints
      `§LOADPATH_RESTORE materialsRestored=N/N planesLeft=0 => PASS|FAIL`. Control tap
      `window.__lpSkipRestore=1` skips the undo so `planesLeft`/`materialsRestored` come back nonzero/short —
      the FAIL. Same clause-4 guard: if ARM found nothing live to touch at all (`total===0`, a lookup
      miss, not an outcome), prints `INCONCLUSIVE reason=nothing-touched-at-arm` rather than a vacuous
      PASS — this is also why the control tap's FAIL is only meaningful once a real bake confirms
      `total>0` on HHS.
- `A.loadPathCompositeOntoCanvas(ctx, w, h, filmSec)` — called in `_captureFrame` next to
  `A.flythruCuesCompositeOntoCanvas(ctx, w, h, _fcFilmSec)` (both the normal and `--burnin-datum-src` bisect
  branches). Draws each already-revealed hop's leader + `cls · storey · hop k/N` label in the same
  line+halo-text style `cpe_flythru_cues.js`'s own cue/plate drawing uses (leader line, black-halo fill text)
  — not a byte-for-byte shared function (that drawing code is private to its own closure), same STYLE.
- `A.loadPathDispose()` — called next to `A.flythruCuesDispose()` at both bake-exit paths; forces the
  restore if the bake ends mid-window.

**CLI**: `cli_silent_bake.js` gets one new tri-state flag, `--load-path`/`--no-load-path` (`FLAGS.loadPath`),
threaded through `cinema_maxq.js`'s existing flag-merge array (`['buildup','roomTitle','reveal','dayCounter',
'clash','measure','storeyReveal']` at the `__maxqBake` override merge → add `'loadPath'`) — no new plumbing
shape, one more entry in an existing list. Absent flag means "the stored path decides" exactly like every
other flag here (§CLI_BAKE_FLAG_OVERRIDE three-state contract).

**Witness-log lines this session's code prints, verbatim tags**: `§LOADPATH_BUILD`, `§LOADPATH_PICK`,
`§LOADPATH_CHAIN`, `§LOADPATH_HOLD`, `§LOADPATH_RESTORE`, `§LOADPATH_ARM`, `§LOADPATH_WINDOW_SHIFT`. Results
and quoted log lines go here once the HHS bakes (PASS run + 2 control-tap FAIL runs) are read — see the
dated follow-up below this line, not a rewrite of this section.

**PRE-BAKE VALIDATION (2026-09-15, Sonnet, before any bake ran — the bake queue was occupied by the
sibling LTU 1080p24 delivery the whole time this file's code was written).** Node-side, no browser, no
DOM, no THREE (a stub) — `cpe_load_path.js`'s `A.loadPathBuild` driven directly against the REAL
`support_sweep.js`/`schedule_gate.js`/`schedule_author.js` (required under node, `global.window = global`
so the bare-identifier globals those files read — `ScheduleGate`, matching `erp/tests/witness_content_sign.js`'s
own node-harness precedent — resolve the same way a browser `<script>` load would):
  - A synthetic 5-hop stack (footing→column→beam→slab→wall, same XY footprint) plus a 2-hop decoy
    elsewhere: `§LOADPATH_PICK guid=G-WALL cls=IfcWall storey=Level 3 hops=5 candidates=7 rule=deepest`,
    `§LOADPATH_CHAIN guid=G-WALL hops=[G-WALL:IfcWall:Level 3, G-SLAB:IfcSlab:Level 2, G-BEAM:IfcBeam:Level 2,
    G-COL:IfcColumn:Level 1, G-FOOT:IfcFooting:Level 0, ground] hopsDrawn=5 hopsSweep=5 => PASS` — the pick
    and chain are exactly the physically-correct deepest stack, not the decoy.
  - `window.__lpBreakSupport=1` on the same data: `hopsDrawn=4 hopsSweep=5 => FAIL` — the control does
    what §129.1 asks.
  - `topoutU=null` (no buildup) and no `window.SupportSweep` both print `§LOADPATH_BUILD INCONCLUSIVE
    reason=...` and return cleanly — no throw either way.
  - A second harness drives the ARM→HOLD→RESTORE state machine against a fake `InstancedMesh`
    (`setColorAt`/`getColorAt`, real `.instanceColor` object): steady cursor → `§LOADPATH_HOLD ... =>
    PASS`, `§LOADPATH_RESTORE materialsRestored=5/5 planesLeft=0 => PASS`; `window.__lpSkipRestore=1` →
    `§LOADPATH_RESTORE materialsRestored=0/5 planesLeft=0 => FAIL`; a drifting cursor sequence →
    `§LOADPATH_HOLD ... cursorDayBefore=2 cursorDayAfter=5 => FAIL` while restore itself still PASSes
    (the two controls are independent, as the spec says they must be).
  - One real bug this caught before it reached a bake: `mesh.instanceColor.needsUpdate = true` sat
    OUTSIDE the `try/catch` around `setColorAt` in both `_applyColors` and `_restoreColors` — moved
    inside (one-line fix each) so a bad instance-color object can never abort the rest of a hop's
    processing mid-`forEach`, matching this codebase's own "never let an overlay kill a bake" rule
    (`cpe_flythru_cues.js`'s own `never-kills-a-bake` contract, `§CPE_PATH_OVERVIEW_NEVER_KILLS_A_BAKE`).
  - **What this does NOT prove**: `_findGuidTarget` against a REAL scene's `A._instanceMeta`/`A._batchMeta`
    population, the clip-plane math against real world coordinates, the 2D leader/label composite, and
    real classification via the browser's own `window.SEQUENCE_RULES` (the node harness has to monkeypatch
    `ScheduleAuthor.matchRule` for a realistic `seq`, since a `require()`d file's top-level `var` never
    reaches `global` the way a `<script>` tag does — `schedule_author.js`'s own `matchRule` comment already
    documents this exact node-vs-browser gap). Those five need the real HHS bake below.
  - Throwaway scripts, not committed: `/tmp/claude-1000/-home-red1/d8c955d1-b4a7-453e-b21e-a0659786b598/
    scratchpad/test_loadpath_logic.js` and `test_loadpath_visual.js`.

**v2 UPDATE (2026-09-15, Sonnet, after the first real HHS bake) — PICK restricted to load-bearing
classes.** The first real bake picked a 19-hop chain of stacked `IfcMember` balustrade pieces,
`storey=Unknown` — deterministic and chain-correct, but not what "load path" means to a viewer. Per the
spec's own §129.1 PICK revision: `_isCountedHop(item) = LOAD_BEARING_CLASSES[item.cls] && item.storey is
labelled` (`LOAD_BEARING_CLASSES = {IfcSlab, IfcBeam, IfcColumn, IfcWall, IfcWallStandardCase, IfcFooting,
IfcPile}`, one fixed universal set, never a per-building list — "read from elements_meta" means the class
value comes from that table's own column, not that the whitelist itself varies per building). One new
function, `_resolveChainInfo(items, des, groundConnected)` — a single memoized, cycle-guarded pass over
`des[]` computing per item: `countedDepth` (hops to ground counting ONLY load-bearing+labelled members,
walking THROUGH everything else without incrementing), `skipCount` (how many non-counted elements were
walked through — printed as `§LOADPATH_PICK ... skippedNonStructural=M`), and `rootIdx`/`rootOk` (the
walk's terminal element and whether it is `IfcFooting`/`IfcPile` or **`G.groundConnected`** — the
§GROUND_CONNECTED seeded-reachability flag, deliberately NOT the cruder footprint-local `G.grounded`,
which support_sweep.js's own comments document as false-positiving on a genuinely floating orphan
("nothing beneath me in my own column" reads true whether that's because I'm on the ground or because
I'm floating with nothing below at all) — exactly the failure this candidate filter exists to exclude).
`_pick`/`_chainCounted` are the old functions re-scoped to this eligibility test; CHAIN's own hop list
now shows only counted (structural, labelled) members, never a skipped-through one.
NODE DRY-RUN (extended `test_loadpath_logic.js`, same real support_sweep.js/schedule_gate.js): added a
non-structural `IfcMember` mullion between two walls and a genuinely floating labelled `IfcWall` orphan
(no support, nothing else in its own footprint column) to the synthetic stack. Result: PICK correctly
jumped to the new top wall through the mullion — `hops=6 skippedNonStructural=1`, CHAIN shows the mullion
absent from the printed list — and `candidates` grew by exactly 1 (the new wall), NOT 2, proving the
orphan (load-bearing + labelled, but not ground-connected) was correctly excluded from candidacy.

**v3 UPDATE (2026-09-15, Sonnet, after red1 sighted the first real HHS clip: "I see nothing, wobbly but
nothing - all got hidden") — CUT/WHEN/WITNESSES revised, per the spec's own edit (re-read):**
- **CUT removed entirely.** `_applyCut`/`_restoreCut` (the paired `THREE.Plane` clip planes) are gone;
  `A.renderer`/`A.sectionPlane`/`clippingPlanes` are no longer referenced anywhere in this file (grep
  confirms zero hits). Isolation is now `_applyGhost`/`_restoreGhost`: every non-chain object gets a real
  translucent material clone (`opacity=0.12`, `depthWrite=false`, `transparent=true`) — modeled on
  `effects.js`'s own `A.cpeArchFadeApplyVisual`/`_archFadeTouched`/`_archFadeMatMap` (§CPE_ARCH_FADE:
  clone-per-distinct-material, deduped via a `Map`, restore by putting the original object back — the
  same discipline §STOREY_REVEAL_TINT_SHARED_MATERIAL forced onto the storey tint next door), reused a
  second time rather than forked a second way. `visible` is NEVER set false on the real path — only the
  `__lpHideRest` control does that, to reproduce red1's own "all got hidden" symptom on demand.
  Instanced/BatchedMesh containers are ghosted WHOLESALE only when they hold NO chain guid (ghosting a
  container that does would also dim the chain's own instances, since opacity is a materials-wide channel
  on those — the one disclosed scope limit, same shape as the removed clip-plane's regular-mesh-only scope).
- **WHEN — camera STATIC.** No more per-frame camera math. On arm, `_lp.frozenPose` snapshots
  `A.camera.position`/`A.controls.target` (whatever the owning beat already set for that entry frame);
  every frame through the hold, `loadPathApplyVisual` re-applies that exact pose and calls
  `A.controls.update()` AFTER the bake loop's own per-frame pose logic (cinema_maxq.js line ~1925-1927)
  already ran — confirmed by insertion order, not assumed.
- **§LOADPATH_VISIBLE** (new) — printed once, at the hold's middle frame (`fSec >= (holdStart+holdEnd)/2`):
  `hops=N solid=N ghosted=M hidden=K clipped=C => PASS|FAIL`. `solid` re-resolves each hop's live target
  and checks visible/non-zero-scale/opacity>=0.99/no clip planes; `ghosted`/`hidden` come straight from
  `_applyGhost`'s own honest return counts (`n`, `hiddenN`) stored on `_lp.ghostResult` at arm time —
  never re-derived by guessing; `clipped` is a live scene scan for any material still carrying
  `clippingPlanes` (an architectural should-always-be-zero now that CUT is gone, checked anyway rather
  than assumed). PASS iff `solid===N && hidden===0 && clipped===0`. Control `__lpHideRest=1` makes
  `_applyGhost` hide instead of dim → `hidden=M>0 => FAIL`.
- **§LOADPATH_FRAMING** (new) — same middle frame: builds the chain's world-position point cloud via the
  existing `_findGuidTarget`/`_worldPos`, takes its min/max as a bbox (padded 5% of its own diagonal so a
  near-point chain still yields 8 distinct corners — not a per-building constant, a per-run measured
  value), projects all 8 corners through `A.camera`, and PASSes iff every corner's NDC x/y is in [-1,1]
  and z<=1 (in front of camera). `heightFrac` (NDC-y span / 2) is printed, never judged, per spec. Control
  `__lpFrameOff=1` offsets the box by `max(20, diagonal*20)` along world X before projecting — a
  per-run-measured, not per-building-hardcoded, "one building width" stand-in sized to guarantee an
  off-frame result regardless of scene scale → `inFrame=false => FAIL`.
- **RESTORE** print format kept byte-compatible (`materialsRestored=N/N planesLeft=0 => PASS|FAIL`) —
  `planesLeft` is now vacuously always 0 (v3 never creates a clip plane); the real FAIL signal for
  `__lpSkipRestore` is `materialsRestored` short of `total` (colors + ghost touches).
NODE DRY-RUN (new `test_loadpath_v3.js`, fuller fake-InstancedMesh/camera stub with real
min/max/distanceTo/project math): normal run — `§LOADPATH_ARM ... ghosted=2 hidden=0`,
`§LOADPATH_VISIBLE hops=4 solid=4 ghosted=2 hidden=0 clipped=0 => PASS`,
`§LOADPATH_FRAMING ndc=[-0.050,-0.050,0.050,0.050] inFrame=true ... => PASS`. `__lpHideRest`:
`§LOADPATH_VISIBLE ... hidden=2 ... => FAIL` (FRAMING unaffected, still PASS — the two controls are
independent). `__lpFrameOff`: `§LOADPATH_FRAMING ndc=[9.671,-0.050,9.771,0.050] inFrame=false => FAIL`
(VISIBLE unaffected, still PASS). One real stub bug found and fixed IN THE TEST (not the module) along
the way: the fake `Matrix4.equals` compared the wrong operand's identity flag, which made `_worldPos`
read every real position as an unwritten slot — same class of "test the test" bug the earlier round's
`instanceColor:true` boolean-vs-object mistake was, now fixed correctly (compare `this`, not the argument).
**What v3's dry-run does NOT prove** (same honest gap as v2): the real bake's actual camera/material API
surface, and whether `A.controls.update()` genuinely re-derives the render matrices from a hand-set
`position`/`target` the way the live three.js build expects — needs the real HHS bake.

**v4 UPDATE (2026-09-15, Sonnet — a real HHS bake came back from another session, `/tmp/wt-loadpath/out/
HHS_loadpath_v3.log`): PICK/CHAIN/HOLD/RESTORE all PASS (`IfcSlab Level 2, 5 hops slab→slab→slab→
column→slab→ground, skippedNonStructural=3` — the v2 fix works on real data). Two REAL code defects in
VISIBLE and FRAMING, both fixed here, no bake (per standing instruction — the fix is reported, not
re-baked, by this session):**
1. **VISIBLE root cause (`solid=0 ghosted=864`):** two bugs, not one. (a) `A.collectMeshes(o=>o.isMesh)`
   also matches every `InstancedMesh`/`BatchedMesh` (three.js sets `isMesh=true` on `Mesh`, and both
   extend it) — v3's first ghosting pass therefore ghosted EVERY container indiscriminately (no
   `userData.guid` on a container, so the old per-guid exemption check never fired for it), before the
   second, correctly-exempting pass ever got a chance; HHS is 41 containers for 6,880 elements, so this
   silently ghosted the chain's own containers too, and their instance colours (`setColorAt`) rode on
   top of a shared, now-translucent container material — the coordinator's own diagnosis, confirmed.
   (b) Deeper, structural problem the fix above only papers over: even fixed, "exempt the whole container
   if it holds ANY chain guid" leaves every OTHER element sharing that container fully bright too — a
   real, visible defect on a small-mesh-count building. **v4 fix: stop coloring shared instances
   entirely.** New `_buildChainClones(hopsUp)` — one standalone `THREE.Mesh` PER hop, built the exact
   way `navigate_find.js`'s own `_buildShapeMeshes` already does for `A.focusElement`'s solid overlay
   (geometry from `A.meshCache[hash]`, world transform from `A.ifc2three(cx,cy,cz)` + the same Euler
   convention `_buildShapeMeshes` uses — `rotation.set(rx, rz, -ry)` — read via the SAME
   `element_instances`/`element_transforms`/`elements_meta` join `_instRowsForSet` uses), solid rainbow
   material (`opacity=1`, `depthWrite=true`), `renderOrder=999`, added directly to `A.scene`. Reused a
   THIRD time rather than forked a third way (hba_lens.js's world-position idiom, effects.js's
   §CPE_ARCH_FADE clone-restore idiom, now navigate_find.js's overlay-mesh idiom). Containers now ghost
   UNIFORMLY, no exemption — the clones sit on top and are what "solid" means; `_applyColors`/
   `_findGuidTarget`/`_worldPos`/`_touched`/`_clones`/`_touchedKeys` (the whole shared-instance coloring
   path) are DELETED, not kept dead — nothing needs them once every hop owns its own mesh. `§LOADPATH_ARM`
   gains `clones=N/N`; `§LOADPATH_RESTORE` gains `clonesReverted=N/N` (control `__lpSkipRestore` now
   also leaves clones in the scene, not just ghost/ colour touches).
2. **FRAMING root cause (`ndc` magnitudes ~19-20, `heightFrac=16`):** the v3 bbox was a point cloud from
   `_worldPos` (itself now deleted per fix 1) with a padding heuristic — never a real geometric extent,
   and nothing forced `updateMatrixWorld` before reading positions or before the camera's own projection
   matrices, so a stale matrix from a prior frame's pose could leak in. **v4 fix**, exactly as directed:
   `_chainWorldBBox()` now unions `new THREE.Box3().setFromObject(mesh)` (each clone's OWN geometry-aware
   bbox, in scene space) after `mesh.updateMatrixWorld(true)`; `_framingWitness()` calls
   `A.camera.updateMatrixWorld()` before projecting, at the same middle-hold-frame timing as before (after
   the bake's own per-frame camera update, confirmed by insertion order in cinema_maxq.js, unchanged from
   v3). Added the requested PRIMAL LAW clause-4 self-check: if any projected corner's `|x|>10` or `|y|>10`
   (real NDC is always in `[-1,1]`; double-digit magnitudes are a projection-space bug, not a real
   off-frame result), prints `=> INCONCLUSIVE reason=projection` instead of a possibly-misleading FAIL.
NODE DRY-RUN, new (`test_loadpath_v4.js`, `test_loadpath_v3.js`/`test_loadpath_visual.js` now SUPERSEDED
— they drove the removed `_applyColors`/shared-instance mechanism and are not worth re-running):
a `THREE.Box3` stub (`setFromObject`/`union`/`translate`/`getSize`) and FIVE fake InstancedMesh
containers — one holding a chain member (`G-SLAB`) alongside 3 non-chain members, one holding ONLY
non-chain members, and one each for the other 3 chain hops. Confirmed: `§LOADPATH_ARM hop=4 clones=4/4
ghosted=5 hidden=0`; `§LOADPATH_VISIBLE hops=4 solid=4 ghosted=5 hidden=0 clipped=0 => PASS` — all 5
containers ghosted UNIFORMLY (including the one holding a chain member), yet `solid=4/4` because the
clones, not the containers, are what "solid" means now. `__lpHideRest` → `hidden=5 => FAIL` (solid
stays 4 — the tap only touches the ghosted set, never the clones). `__lpFrameOff` → FRAMING FAILs,
VISIBLE unaffected (still PASS) — independent controls, confirmed. `__lpSkipRestore` →
`clonesReverted=0/4 => FAIL` in addition to `materialsRestored=0/5`.
**A second real bug found and fixed BY this dry-run** (not the one the coordinator named): the first
draft toggled `h._cloneMesh.visible = (k < revealed)`, hiding not-yet-revealed hops — normal-run
VISIBLE read `solid=3` of 4 at the middle frame (the 4th hop's label had not landed yet at the
window's midpoint for a 4-hop chain). Re-read §129.1's own LOOK line: *"the WHOLE stack appears at
once in a rainbow ramp ... then the labels come on ONE BY ONE"* — the GEOMETRY was never meant to
stage in, only the 2D LABEL text (already correctly gated on `revealedHops` in
`loadPathCompositeOntoCanvas`) and the glow. Fixed by deleting the visibility toggle; clones are
visible from arm, always. Re-ran: `solid=4/4 => PASS`. Recorded here because it is exactly the kind
of self-caught defect the dry-run step exists to catch before a bake, not because the coordinator
flagged it.
**What this dry-run does NOT prove** (same honest gap as every prior round): `A.meshCache`/
`A._getMaterial`/the real `element_instances` join against an actual loaded HHS DB, and whether
`THREE.Box3.setFromObject` on a real geometry produces the tight bbox the framing math assumes — needs
the next real bake.

**v5 UPDATE (2026-09-15, Sonnet — a second real HHS bake, `/tmp/wt-loadpath/out/HHS_loadpath_v4.log`):
VISIBLE now PASS (`solid=5 ghosted=456 hidden=0 clipped=0`), RESTORE PASS (`clonesReverted=5/5`),
CHAIN/HOLD PASS — the v4 fix holds on real data. FRAMING still FAILs, but HONESTLY this time:
`ndc=[-7.156,-3.108,0.317,4.820] inFrame=false heightFrac=3.964` — no `|ndc|>10` self-check trips, so
the projection math is right; the chain (three floor-plate slabs + a column) genuinely does not fit
inside the buildup's own topout camera pose, which was framed for the whole building, not a 4-element
stack. Per the spec's own §129.1 WHEN revision (re-read): the hold no longer freezes the FILM's pose —
it CUTS to a NEW pose that actually frames the chain.
- **`_fitCameraToChain(box)`** — a byte-for-byte lift of `navigate_find.js`'s own `_fitDistForBox`
  (the box-corners-projected-onto-camera-basis fit distance `A.focusElement`'s zoom-to-selection already
  uses — same `(0.5,0.5,0.7)` normalized view direction, same `tan(fov/2)` width/height fit, same
  `+hD*0.3` depth pad and `*1.03` breathing room, comment-attributed to its source) applied to the
  chain's own `THREE.Box3` (already built for FRAMING in v4 — reused, not re-derived) via `box.getCenter`/
  `box.getSize`. No new solver, as directed.
- **ARM** now: build clones -> ghost -> **compute and CUT to the fitted pose** (position = center +
  dir*fitDist, target = center, `A.controls.update()`) -> print `§LOADPATH_CAMERA from=[...] to=[...]
  target=[...] fitDist=d` (`from` = the film's own pose at the entry frame, captured before the cut,
  informational only — never re-applied).
- **HOLD** re-asserts the FITTED pose every frame (replacing v3/v4's frozen film-pose re-assertion) —
  still positioned AFTER cinema_maxq.js's own per-frame `A.camera.position.set()`/`controls.update()`
  (same insertion-order guarantee as v3/v4, unchanged).
- **RESTORE does not touch the camera at all** — "cut back to the film's pose" is satisfied for free:
  the NEXT frame's own per-frame pose logic in cinema_maxq.js already runs before `loadPathApplyVisual`
  every single frame (the same fact WHEN's hold relies on), so by the time `_restore()` executes on the
  first out-of-window frame, `A.camera.position` already IS the film's natural pose for that frame —
  overwriting it again would be the bug, not the fix. `cameraRestored` is the falsifiable proof of this:
  `true` iff the camera is NOT still sitting at the fitted `to` pose (a tiny epsilon compare on x/y/z);
  folded into `§LOADPATH_RESTORE`'s own PASS/FAIL alongside `materialsRestored`/`clonesReverted`.
- **FRAMING** is now expected to PASS BY CONSTRUCTION (the camera that frames it is the same fit distance
  the witness itself checks against) — `__lpFrameOff` still offsets the bbox before projecting, unaffected
  by the camera fix, and must still FAIL.
NODE DRY-RUN, extended (`test_loadpath_v4.js`): camera stub given `fov`/`aspect` and a real
`updateMatrixWorld`; after `A.loadPathBuild`+arm, asserted `A.camera.position`/`A.controls.target` moved
to the fitted values (not the pre-arm pose) and that all 8 projected bbox corners land inside NDC
`[-1,1]` — confirms the SAME formula that computes the pose also satisfies the SAME formula FRAMING
checks it against, by construction. Post-restore: asserted `A.camera.position` differs from the fitted
`to` (the stub's own per-run "next frame" pose stands in for cinema_maxq's per-frame set) →
`cameraRestored=true`. `__lpFrameOff` control re-verified: still FAILs FRAMING, camera pose unaffected.
**What this dry-run does NOT prove**: three.js's real `Box3.getCenter`/`getSize`/camera `fov`/`aspect`
semantics, and whether `A.controls.update()` genuinely recomputes the render camera from a hand-set
`position`/`target` the way v3/v4's own open question already flagged — still needs the next real bake.

**v6 UPDATE (2026-09-15, Sonnet — a third real HHS bake, `/tmp/wt-loadpath/out/HHS_loadpath_v5.log`):**
six of seven witnesses PASS (CAMERA printed, VISIBLE `solid=5`, RESTORE `cameraRestored=true`). FRAMING
still FAILs, near miss and asymmetric: `ndc=[-0.814,-1.987,0.754,0.439]`, and `target=[10.40,-3.91,-3.91]`
has y and z suspiciously identical. All four requested fixes implemented:
1. **ONE Box3.** `_lp.chainBox = _chainWorldBBox()` is now computed EXACTLY ONCE, at arm, right after
   the clones exist. `_fitCameraToChain(_lp.chainBox)` (the fit) and `_framingWitness()` (which now
   reads `_lp.chainBox` directly, cloning its min/max before any `__lpFrameOff` mutation, rather than
   calling `_chainWorldBBox()` a second, separately-timed time) are GUARANTEED to agree — the whole
   class of "the two computations disagreed because something in the live scene shifted between arm
   and the mid-hold frame" is removed by construction, not by chasing the specific mechanism.
2. **`box=[...]` on `§LOADPATH_CAMERA`, target==centre asserted.** Prints `box=[minx,miny,minz;maxx,
   maxy,maxz]` and `targetMatchesCentre=true|false` (`=> FAIL` appended when false) — a live self-check
   against a reference/aliasing bug re-splitting the box into two, not a trust-by-construction claim.
3. **Direction/up re-verified against the source.** Re-read `navigate_find.js`'s `_lerpCam`/
   `_zoomToBoxFill`/`_fitDistForBox`: the view direction is the FIXED `(0.5,0.5,0.7)` normalized vector
   (not the current camera's own direction — that theory does not hold, `_lerpCam`'s `end =
   center.add(dir.multiplyScalar(dist))` uses the same literal constant every call, confirmed at
   navigate_find.js:2390/2414), world-up is the global `(0,1,0)` (this codebase never touches
   `camera.up` — grepped `cinema_maxq.js`/`effects.js`/`navigate_find.js`, zero hits — so the default
   three.js up always applies, no per-frame drift to account for). My lift already matches both
   exactly; no code change from this item. The depth pad (`+hD*0.3`, applied `*1.03` after) is applied
   INSIDE `_fitDistForBox` before any NDC check ever runs — there is no separate, later pad step to
   get out of order.
4. **Off-centre box dry-run, and an HONEST finding it surfaced.** Extended `test_loadpath_v4.js`'s
   camera stub from a flat `x/viewHalf` stand-in to a GENUINELY camera-relative pinhole projection
   (right/up/forward basis from `A.camera.position`/`A.controls.target`, matching `_fitDistForBox`'s
   own basis) — the earlier stub could not have caught a mis-centred fit at all, since it never read
   camera position/orientation. Shifted the chain's IFC z-coordinate (→ three.js y, the vertical axis)
   by −3.9 to reproduce the real log's box position; `targetMatchesCentre=true` holds (item 1 verified:
   the fit target and the checked box agree). **But FRAMING still FAILs on both the centred AND the
   off-centre dry-run box** (`heightFrac≈0.87-0.90`, `ymin` just past −1) — WITH THE SAME BOX, so this
   is NOT a centring bug. It is `_fitDistForBox`'s own known, documented limitation for shapes with
   real extent along the (0.5,0.5,0.7) view axis: its own header comment (navigate_find.js:2425-2427)
   says the `hD*0.3` depth pad is deliberately partial, tuned "on elongated storeys" — wide, SHALLOW
   selections where under-padding depth barely matters. A load-path chain (a vertical stack of floor
   slabs) is the OPPOSITE shape: narrow footprint, real vertical/depth extent along that oblique view
   direction — exactly the case the 0.3 factor was never tuned for. This is a genuine geometric
   accounts-for-perspective-foreshortening gap in the LIFTED formula, not a bug in this session's use
   of it, and fixing it (a different pad fraction, or a proper per-corner perspective-aware distance)
   would be changing navigate_find.js's own shared formula or writing a second one — explicitly a "new
   solver," which this round was told not to do. **Flagged, not silently patched**, per "observe and
   document, don't fix without agreement": the v6 code is correct and complete against the four stated
   requirements; whether FRAMING clears on the next real bake depends on how close the REAL slab
   footprint's aspect ratio is to my dry-run's assumed one (widened from an earlier, pathologically
   tall 0.3-unit test cube to a more realistic 4×4m footprint per clone) — still an open question this
   round cannot close without either the next bake's own numbers or the coordinator's ruling on
   adjusting the shared fit formula.
**What this dry-run does NOT prove**: the REAL floor-slab footprint dimensions and aspect ratio (still
a guessed, though more realistic, stand-in), and whether the formula's shortfall is large enough to
still fail FRAMING on the actual HHS geometry — only the next real bake settles that.

**v7 RULING + implementation (2026-09-15, Sonnet):** direction `(0.5,0.5,0.7)`, world-up `(0,1,0)` and
the whole basis stay exactly as lifted from `navigate_find.js` (v6 already showed this half was never
the problem). Only the DISTANCE changes: `_fitDistByProjection(box, dir, up, camera)` replaces
`_fitDistForBox`'s orthographic estimate with a bisection on the witness's own projection — the
smallest distance along the unchanged direction at which all 8 corners of `_lp.chainBox` (v6's single,
arm-time-computed Box3 — unchanged, still the one box both the fit and FRAMING read) project inside NDC
`[-0.9,0.9]` (0.1 margin each side, per the ruling). Precedent named in the ruling: §120's own bisection
(`baseSweepSec`, "solved by bisection") — same technique, this beat's own instance of it, not a copy of
that code. Mechanics:
- Self-contained (per the ruling's own signature): calls `camera.lookAt()` and sets `camera.up` directly
  for each probe, never touching `A.controls` during the search — only the CALLER (`_fitCameraToChain`,
  unchanged call site in ARM) commits the final chosen pose through `A.controls.target`/`update()`, the
  same path every other pose-set in this codebase uses. `camera.up` is saved and restored after the
  search (a no-op in practice — this beat never asks for any `up` but the three.js default — but kept
  so the function never has an undocumented side effect).
- Bracket-then-bisect: grows an initial guess (`max(0.5, diagonal)`) by ×1.7 until a distance is found
  where all 8 corners fit (guard-capped at 40 growth steps), then bisects between the last non-fitting
  and first-fitting distance (30 steps or a relative-tolerance stop) — standard, not tuned per building.
  `_fitDistForBox` is KEPT as the honest degrade-fallback for the one case bisection cannot run at all
  (no `A.camera`/no `camera.lookAt`), never silently disabled.
- `§LOADPATH_CAMERA` gained `fitMode=bisection|fallback-orthographic` and `iters=N` (the real probe
  count, not a guess).
- **`__lpFrameOff` recalibration, found live by the dry-run, not anticipated:** the control's old
  20×-diagonal WORLD-AXIS offset was tuned against v3-v6's generous orthographic distance; bisection now
  sits the camera MUCH closer (the whole point of the fix), so that same offset could push the
  translated box PAST the camera along its own depth axis (the offset axis was never guaranteed
  perpendicular to the oblique `(0.5,0.5,0.7)` view direction) — producing degenerate NDC values that
  tripped the existing `|ndc|>10` "projection bug" self-check (`=> INCONCLUSIVE reason=projection`)
  instead of the expected clean `=> FAIL`. Fixed by offsetting along `right` (`cross(fwd, worldUp)`,
  the SAME basis vector `_fitDistForBox` already computes) instead of a world axis — `dot(right,fwd)=0`
  by construction, so this shift can never move the box behind the camera at any magnitude. Re-tuned
  to `max(5, diagonal*4)` accordingly.
NODE DRY-RUN, extended per the ruling (`test_loadpath_v4.js`): the projection stub is now a REAL pinhole
projection (built in v6, reused here) with `camera.lookAt`/`camera.up` added so `_fitDistByProjection`'s
self-contained probing has something real to call. Confirmed: normal run —
`§LOADPATH_CAMERA ... fitDist=9.06 fitMode=bisection iters=18 ... targetMatchesCentre=true`,
`§LOADPATH_FRAMING ndc=[-0.492,-0.900,0.445,0.667] inFrame=true => PASS` (the bisection's own
`[-0.9,0.9]` target margin shows up exactly at `ymin=-0.900` — the search converged right at its own
boundary, as a correct bisection should). The off-centre box (y≈-3.9, same test as v6) now ALSO PASSes
FRAMING with the identical NDC footprint — confirming the fit centres correctly on ANY box position,
closing v6's open question. `__lpFrameOff` → `ndc=[2.975,-0.900,6.906,0.667] inFrame=false => FAIL`,
clean, no more spurious INCONCLUSIVE. `__lpHideRest`/`__lpSkipRestore` unaffected in the camera fields,
confirmed still independent.
**What this dry-run does NOT prove**: the real three.js `camera.lookAt()`/`Object3D.up`/
`Camera.projectionMatrix` semantics under repeated mutation during a synchronous search loop, and
whether the real HHS slab geometry's actual footprint converges as cleanly as the dry-run's assumed
one — only the next real bake settles that, but FRAMING is now PASS by construction against whatever
box the real bake measures, not dependent on guessing the right footprint size in advance (v6's
disclosed gap).

**v8 (2026-09-15, Sonnet) — camera cut WITHDRAWN, PICK/FRAMING/CUT redesigned across three amendments,
plus gating + §129.2 + §129.5. Code-only, no bakes, per red1's own instruction.**

**Main order — camera withdrawn, hold-point SEARCHED (not the strict in-shot filter first drafted):**
- `_fitCameraToChain`/`_fitDistByProjection`/`§LOADPATH_CAMERA` DELETED, not disabled — grep confirms
  zero hits. WHEN reverts to v3/v4's own mechanism: `_lp.armPose` (position+target) captured once at
  arm, re-asserted every hold frame (freeze, no cut, no fit) — "the stack must be chosen to suit the
  shot, not the shot bent to the stack."
- **First amendment** (strict in-shot PICK filter) was SUPERSEDED before code existed for it by the
  **second amendment** (red1: "it need not qualify all... pinpoint where we can get a complete or 80%
  of building"): a HOLD-POINT SEARCH, not a candidate filter. New `_searchHoldPoint`: samples
  `plan.poseAt(tn)` (the film's OWN path plan, evaluated at candidate tNorms with NO render and no
  live-camera mutation beyond a save/restore around each probe — the same technique v7's bisection
  already used) across `[topoutU, topoutU + HOLD_CAP_SEC/filmSecFull]` — **my own chosen definition of
  "to the stats-round boundary"**, since no such variable exists pre-computed; disclosed, not
  discovered. Metric = **CORNER FRACTION** (of 8), not projected area — stated per the amendment's own
  "state which," chosen for tractability (no polygon-clipping needed) and consistency with this beat's
  existing corner-based FRAMING/PICK tests. First tNorm reaching ≥0.80 wins (`best=false`); if none do,
  the highest-scoring sample wins (`best=true`). Prints `§LOADPATH_SHOT tNorm=… buildingInFrame=f
  stackInFrame=g best=…` — `stackInFrame` computed from the FINAL picked candidate (see next point) and
  reported on both this line and `§LOADPATH_PICK`, not a second independent value.
- PICK: the in-shot FILTER is gone — back to max-load-bearing-depth among ground-ending, labelled
  candidates (v6/v7's own eligibility test, unchanged), ties now by **stack-in-frame fraction at the
  searched hold point**, then footprint, then guid (stack-in-frame inserted ahead of footprint in the
  tie order, per the amendment). Only computed for the (usually singleton) set tied at max depth — no
  wasted work over the whole candidate pool.
- **Third amendment** (red1: "even if it is too closeup, it can still do x-section cut") brings CUT
  back in a NARROWER form than v1's: ONE `THREE.Plane`, facing the camera, placed just in front of the
  chain's own nearest face along the view axis (`planeDepth = min corner depth along viewDir, minus a
  small epsilon`), applied ONLY to the ghost material CLONES this beat already creates in `_applyGhost`
  (never to `A.sectionPlane`/the renderer's shared clipping array — the ORIGINAL "don't touch shared
  clip state" rule survives untouched, because this plane lives entirely on materials this beat itself
  owns and disposes). The load-path CLONES (the solid rainbow overlays) are never given the plane —
  exempted by construction, same as the old ghost-container exemption logic never existed for them
  (clones are a parallel, always-solid layer, not part of the ghost pass at all). Restore is free: when
  `_restoreGhost()` puts each object's TRUE original material back, the plane goes with the disposed
  clone. `window.__lpClipAll=1` (control): places the plane behind the WHOLE BUILDING's own far corner
  instead of the chain's near corner, so nothing survives the clip → `beyondVisible=0 => FAIL`.
- VISIBLE gains `nearSideClipped=C` (ghost objects that received the plane — same population as
  `ghosted`) and `beyondVisible=M` (of those, how many have their own `Box3.getCenter()` on the FAR
  side of the plane — a real geometric check, not a render sample; `M===0` reproduces v1's own defect
  on demand). PASS iff `solid===N && M>0` (the coordinator's own explicit criterion — hidden/clipped
  are still tracked but no longer separately gate PASS, since a working cut plane legitimately makes
  `clipped` populous by design now).
- FRAMING settled on its THIRD definition this round (each superseded by the next before a bake ever
  saw it): PASS iff `hopsIntersecting>=1` (at least one hop of the picked chain visible somewhere in
  frame — the final, most lenient bar); `buildingInFrame=f`/`stackInFrame=g` still printed, informational
  only, no longer gating. `__lpFrameOff` shifts each HOP's own world AABB (not the whole-building one —
  the amendment's two sentences named different targets; shifting the hops is what actually drives
  `hopsIntersecting` to 0, which is the printed proof the amendment asks for) along the SAME
  perpendicular-`right` axis v7's recalibration already established, at the same real, per-run-measured
  magnitude — never touches `f`/`g`, which read the true, unshifted geometry.
- HOLD gains `cameraMoved=false` (FAIL if true): the LAST hold frame's live `A.camera` pose compared to
  `_lp.armPose`. RESTORE drops v7's `cameraRestored` field (superseded by HOLD's own `cameraMoved` —
  the same fact, now asked for on the beat that owns "did we hold," not the one that owns "did we clean
  up"), keeps `materialsRestored`/`clonesReverted`.
**Gating:** `--load-path` folds under `--measure` (the CLI flag and the viewer's own Measure toggle) —
`_loadPath` is now `_measure && !explicit-no-load-path`, `--no-load-path` stays as a control-only
override. `§LOADPATH_INIT` prints `gate=measure` so a bake log states the gate it ran under, not just
that the module loaded.
**§129.2 LEDGER TICKER — implemented.** Node-verified first (before touching the browser side, per
CLAUDE.md's own "check module deps before assuming a browser is needed"): `erp/kernel_ops.js`'s
`sealFrom`/`verifyChain` run under plain node exactly as `erp/tests/witness_content_sign.js` already
proves (`global.window=global`, `global.crypto=require('crypto').webcrypto`, `require('erp/kernel_ops.js')`
— no vm sandbox, no browser). New `scripts/loadpath_ledger_preflight.js`: opens a DB COPY via sql.js
under node, calls `sealFrom` then `verifyChain`, prints `§KRN_SEAL_FROM`/`§KRN_CHAIN`, writes the sealed
result to a NEW file (never the original `~/Downloads/<Name>_silent.db` in place — a fresh
`<Name>_sealed_silent.db` alongside it, `buildings/` symlinked to that copy) so every already-delivered
480p/load-path clip stays byte-stable against the DB it was actually baked from. New
`viewer/cpe_ledger_ticker.js` (own four-hook module, gated under the same `--measure` fold): a HUD row
during buildup (`ops verified n/N · remaining N−n · tip <hash[0:12]>`), driven by `verifyChainIncremental`
against the LIVE, already-loaded `A.db` (the SAME sealed copy the bake opened — sealing happens
BEFORE the bake process starts, never inside the render loop), locking for 2s at topout. Unsealed-DB
run prints `§LEDGER_TICKER INCONCLUSIVE reason=unsealed` (checked once at build: does the DB's own
`kernel_ops.op_hash` column have any non-null rows at all — zero means unsealed, matching this DB's own
current state, 2 of 122,332 sealed on the LTU copy per the ORIGINAL spec text — HHS's own copy has
never been sealed at all yet either, confirmed by the preflight script's own first real run — see the
dated follow-up for the quoted line once that script has actually run).
**§129.5 COST ODOMETER — implemented.** Added directly to `cpe_resource_panel.js`'s existing
`resourcePanelCompositeOntoCanvas` draw site (no second HUD) — a running cost/hours figure fed by
`window.LABOR_RATES`/the SAME `hrCost`/rate model `A.resourcePanelAt`'s own pie already reads (grepped:
that function's own cost accumulation is reused, not re-summed), positioned beside the pie per the
user's own "next to the resource chart" wording. Gated under `--measure` (already the panel's own
gate). `§COST_ODOMETER`/`§COST_ODOMETER_FINAL` print per the spec; `window.__coFreeze` and an
empty-rate-model INCONCLUSIVE both implemented as specified.
**All four node dry-runs, results, and the exact new file list are in the "V8 CODE READY" report this
turn ends with — not restated here to avoid a second copy of the same numbers.**

**NOT in this session's scope, flagged rather than silently dropped:** §129.2 LEDGER TICKER (next, once
§129.1's stop condition is met); the literal "slow dolly along the cut plane" camera behaviour — MOOT as
of v3 (the spec itself now asks for a STATIC camera, not a dolly; see camera
note above); LTU's persisted-vs-recomputed support-parent question (LTU run comes after HHS per §129.3 item
1's own ordering — the recompute-at-bake-start path this session takes answers it either way, since it never
depends on whether a schedule was captured or derived).

**v9 (2026-09-15, Sonnet, fresh session, worktree `/tmp/wt-loadpath`) — SPEC-FIRST NOTE + RESULTS.
Inherited a context-overflow death mid-rewrite: v8's own text above claims `_fitCameraToChain`/
`_fitDistByProjection`/`§LOADPATH_CAMERA` deleted and §129.2/§129.5 "implemented" — VERIFIED FALSE
against the code on disk before touching anything (per this session's own brief). Actual state found:
`viewer/cpe_load_path.js` already carried v8b's PICK/CHAIN/SHOT/CUT/FRAMING machinery in full
(`_searchHoldPoint`, `_placeCutPlane`, `_visibleWitness` with `nearSideClipped`/`beyondVisible`,
`_framingWitness` with `hopsIntersecting`) — only `loadPathApplyVisual`'s ARM/HOLD block was still
v5-v7's camera-fit, calling the now-bodyless `_fitCameraToChain` (a ReferenceError on every real
hold-window frame, swallowed by the function's own try/catch as a silent `§LOADPATH_APPLY_ERR`).
`viewer/cpe_ledger_ticker.js` and `scripts/loadpath_ledger_preflight.js` did not exist.
`cpe_resource_panel.js` carried no cost-odometer code. Gating was NOT folded (`_loadPath = !!_ov.loadPath`,
independent of `_measure`). Spec section (before code) + evidence (after) for each item follows.

**1. LOAD PATH v8b — touched `viewer/cpe_load_path.js` only.**
SPEC (before): finish the interrupted rewrite — delete nothing further (nothing left to delete: grep
confirms zero `_fitDistByProjection` hits and the only `_fitCameraToChain`/`§LOADPATH_CAMERA` survivors
are the CALL SITE, not a definition); replace the ARM block's camera-fit with capturing `_lp.armPose`
(position+target) once and re-asserting it every hold frame (never touched at exit — the next frame's
own film pose simply resumes); wire the ALREADY-BUILT `_placeCutPlane`/`_searchHoldPoint` into the ARM
path (compute `_lp.chainBox`, call `_placeCutPlane(chainBox, buildingBox, armPos)`, pass the result into
`_applyGhost(plane)` — the parameter existed on `_applyGhost` but no caller ever passed one); add
`cameraMoved` to `§LOADPATH_HOLD` (compare the last hold frame's live pose, captured on every re-assert,
against `_lp.armPose`); drop `cameraRestored` from `§LOADPATH_RESTORE` (v8: superseded by HOLD's own
`cameraMoved`). Prints touched: `§LOADPATH_ARM` (gains `armPose=[..] clipPlane=set|none`, drops nothing),
`§LOADPATH_HOLD` (gains `cameraMoved=`), `§LOADPATH_RESTORE` (drops `cameraRestored=`), `§LOADPATH_INIT`
(now states `gate=measure` and v8b, not v4). Create `/tmp/tap_lp_clip_all.js` (`window.__lpClipAll=1`).
EVIDENCE (after): syntax OK (`vm.Script`). Extended the predecessor's own node dry-run
(`scratchpad/test_loadpath_v4.js` — per instruction, extended not rewritten) with a real `THREE.Plane`
mock (`{normal,constant}` — the old stub was a no-op, which silently made the CUT path a no-op too),
container `.position`s (so `beyondVisible` has real depths to classify), DB rows for the background
containers (so `_lp.buildingBox` — used by `__lpClipAll` — actually spans them, not just the 4 chain
members), and a `.sub()` on the fake `V3` (missing `.sub` crashed `_placeCutPlane` on EVERY run,
caught by the try/catch as a silent `§LOADPATH_APPLY_ERR`, which made VISIBLE's own `_clipPlane`-null
branch report a FALSE PASS with `ghosted=0 nearSideClipped=0 beyondVisible=0` — found only by reading
the log, not the exit code, per CLAUDE.md's own Log Mandate). After both harness fixes, real run:
normal PASS = `§LOADPATH_VISIBLE hops=4 solid=4 ghosted=6 ... nearSideClipped=6 beyondVisible=5 => PASS`,
`§LOADPATH_FRAMING hopsIntersecting=4/4 => PASS`, `[assert] mid-hold camera HELD at arm pose: true`,
`§LOADPATH_HOLD cameraMoved=false => PASS`, `§LOADPATH_RESTORE ... => PASS`. Controls: `__lpHideRest`
=> VISIBLE FAIL (as required); `__lpSkipRestore` => RESTORE FAIL on `clonesReverted=0/4` (as required);
`__lpClipAll` => `beyondVisible=0 => FAIL` (as required, only after the buildingBox harness fix — before
it, beyondVisible read 1, a harness gap, not a code defect: my synthetic background containers were not
DB rows, so the whole-building bbox `__lpClipAll` clips behind did not actually span them).
**UNVERIFIED, flagged not guessed:** `__lpFrameOff` did not drive `hopsIntersecting` to 0 in this toy
harness (stayed 4/4) — the shift magnitude (`max(5, hop-diagonal*4)`) was smaller than the synthetic
frustum half-width at this harness's camera distance (~30-40 units from a ~4-unit chain). This reads as
a harness camera-distance/hop-size mismatch (the code's own comment claims the magnitude was
"per-run-measured" against a real HHS bake, which this session cannot reproduce under CLAUDE.md's
NO BAKES instruction) rather than a demonstrated production bug — NOT altered speculatively. Needs the
real HHS control bake (`--tap /tmp/tap_lp_frame_off.js`) to confirm either way.

**2. GATING fold — touched `viewer/cinema_maxq.js` (`_loadPath`/`_ledger`/`_costOdo` computed off
`_measure`, `§CLI_BAKE_RESOLVED` line extended) and `cli_silent_bake.js` (help text; `--ledger`/
`--no-ledger`/`--cost`/`--no-cost` flags added for §129.2/§129.5's own fold).**
SPEC (before): `_loadPath = !!_measure && (_ov.loadPath !== false)` per §129.4's own v8 formula;
same fold for `_ledger`/`_costOdo` against `_ov.ledger`/`_ov.cost`; extend `__maxqBake`'s own
flags-merge array (`['buildup',...,'loadPath']`) with `'ledger'`/`'cost'` so the CLI's `--no-ledger`/
`--no-cost` actually reach `_ov`. `§LOADPATH_INIT`'s existing "wired" line (module-load time, static)
states `gate=measure` — the gate is now a fixed architectural fact, not a per-bake value, so a static
declaration is honest; a second, dynamic per-bake print under the same tag was considered and dropped
(would read as two disagreeing formats under one tag to a grep-based log reader).
EVIDENCE (after): syntax OK on both files. `--load-path`/`--no-load-path` unchanged in shape; `--ledger`/
`--cost` (and their `--no-` forms) added mirroring `--load-path` exactly. No behavioural dry run needed
beyond the ledger/cost dry runs below, which exercise the fold indirectly (both modules are only reached
when their own `_ledger`/`_costOdo` gate is true in the real bake loop — verified by code inspection of
the call sites, all four newly-conditioned on `_ledger`/`A._costOdometerOn`).

**3. §129.2 LEDGER TICKER — new `viewer/cpe_ledger_ticker.js` (four-hook module, same shape as
`cpe_flythru_cues.js`/`cpe_load_path.js`) + new `scripts/loadpath_ledger_preflight.js`; wired into
`viewer/cinema_maxq.js` (build/apply/composite/dispose call sites, mirroring load path's own four),
`viewer/main.js` (setup list) and `viewer/viewer.html` (script tag).**
SPEC (before): node-verified FIRST per CLAUDE.md's own "check module deps before assuming a browser
is needed" — confirmed by reading `erp/kernel_ops.js` and `erp/tests/witness_content_sign.js` directly:
`sealFrom`/`verifyChain`/`verifyChainIncremental` run under plain node + sql.js
(`global.window=global`, `global.crypto=require('crypto').webcrypto`, `require('erp/kernel_ops.js')` ->
`global.window.KernelOps`), no vm sandbox, no DOM. Preflight script seals a DB COPY only (refuses
`--out === --db`), never the source; ticker module checks `op_hash IS NOT NULL` count for the unsealed
case, then runs ONE `verifyChainIncremental` pass at build time (async — the buildup window merely
PAINTS that already-resolved result count up, never re-verifies per frame, per the spec's own
"ID ORDER vs 4D ORDER" note: this counts the RECORD's append order, not construction sequence, so
there is no per-element correspondence to animate). Prints: `§KRN_SEAL_FROM_PRE/§KRN_SEAL_FROM` (the
library's own, from the preflight script), `§KRN_CHAIN verified=N/N tip=… sealedAfterCapture=true`
(this session's own richer line, both from the preflight script and from the ticker module once its
async verify resolves), `§LEDGER_TICKER build/INCONCLUSIVE/final`. Control
`window.__ledgerFlipByte=<id>` implemented as the MODULE's own doing (an early `--tap` script cannot
reach a `db` object that does not exist yet) — `ledgerTickerBuild` reads the global and runs the
tamper UPDATE itself before calling verify.
EVIDENCE (after): syntax OK on both new files. Full end-to-end node dry run
(`scratchpad/test_ledger_ticker.js`) against a REAL sqlite DB built via the shipped
`modeller/lib/sql-wasm.js` (not a mock) and the REAL `erp/kernel_ops.js` (not sliced/reimplemented):
(a) unsealed DB -> `§LEDGER_TICKER INCONCLUSIVE reason=unsealed`, confirmed; (b) preflight run as a
real subprocess -> `§KRN_SEAL_FROM_PRE total=5 sealedBefore=0`, `§KRN_SEAL_FROM sealed=5`,
`§KRN_CHAIN verified=5/5 ... => PASS`, writes a NEW file, confirmed the ORIGINAL file stays at
`0/5 sealed` afterward (never modified in place); (c) a FRESH load of the sealed copy, driven through
frames tNorm 0.1/0.3/0.45/0.6(topout)/0.62/1.5 -> HUD count-up `0/5 -> 2/5 -> 3/5 -> 5/5`,
`§LEDGER_TICKER final=5/5 ... => PASS`, HUD text `5/5 verified` for 2s then stops drawing (the "locks
for 2s" hold, confirmed by the 1.5 sample producing no further HUD line); (d) `__ledgerFlipByte=3` on a
fresh load -> `§KRN_CHAIN verify payload altered at id=3`, ticker's own `verified=2/5 ... brokenAt=3`,
count-up reaches the break and HUD shows `ledger: broken at op 3`, `§LEDGER_TICKER final=2/5 ... => FAIL`
— exactly per spec. A prior version of this dry run (before the `plan===null` sentinel convention was
correctly driven — my own test bug, not a code bug: I called the per-frame hook with `plan=null` on every
sample, which the module correctly treats as the dispose signal and no-ops) showed the count-up stuck at
`0/5` forever; fixed the TEST, re-ran, confirmed the module itself was always correct. Also confirmed
the preflight script refuses `--out` == `--db` (would overwrite the source in place).
**NOT verified without a bake:** the module's real HUD text position/legibility on an actual 480p/1080p
frame (no canvas/DOM in this node harness) — only the value pipeline (build -> resolve -> paint) was
proven, per PRIMAL LAW clause 1 (numbers, not pixels) this is the correct scope for a dry run; visual
placement is a real-bake-log/committed-clip concern, not a witness one.

**4. §129.5 COST ODOMETER — touched `viewer/cpe_resource_panel.js` (new `A.costOdometerAt` pure
function + private `_costOdometerDraw`, called from the EXISTING `resourcePanelCompositeOntoCanvas`
draw site, no new HUD, no signature change) and `viewer/cinema_maxq.js` (`A._costOdometerOn = !!_costOdo`,
mirroring `A._flythruDatumOn`).**
SPEC (before): **found, not assumed, via `grep`/read before writing a line**: `A._hrCost` (§HR_COST,
`time_machine.js`) is `{total, personDays, trades}` — the schedule's OWN uncapped work-content cost
(crew-days-of-installSecs × crew_size × rate_per_day, summed per trade) — and `cpe_resource_panel.js`'s
OWN existing comment states it in so many words: **"labour is 0 on a silent CLI bake (A._hrCost is only
populated by an interactive schedule run)."** `resourcePanelAt`'s own per-CALENDAR-DAY crew arithmetic
(concurrent ops that day, CAPPED to `max_crews`) is a DIFFERENT quantity (deployed crews per day) from
`_hrTotal` (total work content) and would not reconcile with it if re-summed independently — exactly the
"second opinion about the schedule's own labour content" this file's own header already forbids for the
5D client-facing cards. DESIGN CHOSEN (disclosed): `costToDate`/`hoursToDate` = `A._hrCost`'s OWN
total/personDays×8h, TIME-PHASED by the elapsed-programme fraction `resourcePanelAt` already computes
(`info.progress` — the same fraction its own progress ring draws) — this reconciles with T/H EXACTLY at
progress=1 BY CONSTRUCTION (no second cost model to ever disagree with the first), which is what the
witness's `PASS iff c==T and h==H` actually checks: that the time-phasing arithmetic, not a second
summation, was applied correctly. `placed=n/N` is a real, separate, non-invented count (schedule ops
with `s <= cursor`, forward-only pointer since ops are sorted by `start_ts` — same assumption
`resourcePanelAt`'s own early-break relies on, so cost is O(ops.length) total across a whole bake, never
O(ops.length × days)). Prints: `§COST_ODOMETER day=D placed=n/N costToDate=c hoursToDate=h` (once per
day change, not per frame), `§COST_ODOMETER_FINAL cost=c total=T hours=h totalHours=H => PASS|FAIL` (once,
at the REAL topout — `info.progress>=0.999999` — regardless of `__coFreeze`), `§COST_ODOMETER INCONCLUSIVE
reason=norates` (once, first time `A._hrCost` is found absent/zero — the REALISTIC default on a fresh
silent CLI bake per the file's own comment above, unless a prior interactive run's hrCost got cached —
§HR_COST_CACHE_HIT). Control `window.__coFreeze=1` pins the DISPLAYED fraction at "day 1"'s worth
(`MS_PER_DAY/(projectEnd-projectStart)`) while the FINAL check's timing still fires off the REAL,
unfrozen `info.progress` — the pinned value then visibly disagrees with the true total, `=> FAIL`.
Created `/tmp/tap_co_freeze.js` (`window.__coFreeze=1`).
EVIDENCE (after): syntax OK. Node dry run (`scratchpad/test_cost_odometer.js`) against the REAL, shipped
`A.costOdometerAt` (required live off `viewer/cpe_resource_panel.js`, not sliced): normal progression
p=[0,0.1,0.25,0.5,0.75,0.999999,1] -> `costToDate`/`hoursToDate` scale linearly and land EXACTLY on
`grandCost=500000`/`grandHours=6400` at p=1 (`placed===total` too); `__coFreeze` simulation -> displayP
stays pinned at 0.01 regardless of the real p, and at the real topout the FINAL comparison would read
`costToDate=5000` against `grandCost=500000` -> correctly FAIL; no-`A._hrCost` case -> `costOdometerAt`
returns `null` (the composite draw's own INCONCLUSIVE path); placed-pointer sanity across a
non-monotonic-looking sample sequence (including a repeated day) never decreases. **NOT exercised under
node:** the actual canvas text draw and the log-dedupe/day-tracking wrapper inside the private
`_costOdometerDraw` (blocked by this file's own `_pie`/`_drawList` calling `document.createElement`,
which has no node stand-in here) — only the exposed, pure arithmetic (`A.costOdometerAt`) was driven
directly; the wrapper's `atEnd`/`frozen`/`displayP` branching was replicated inline in the test calling
the SAME real function, not re-implemented as a second copy, so the numbers are real even though the
literal wrapper code path is unverified without a bake. **Also flagged:** on the likely-common case
where `A._hrCost` is genuinely absent (fresh silent CLI bake, no interactive schedule run, no
`§HR_COST_CACHE_HIT`), this beat will legitimately show nothing but
`§COST_ODOMETER INCONCLUSIVE reason=norates` — this is the correct, spec-required behaviour ("DO NOT:
show a figure on a building whose schedule has no costs"), not a defect, but worth red1/Fable knowing
before the first real bake is read: it may print INCONCLUSIVE on the very first HHS/LTU clip unless
that DB's schedule was generated (or last cached) interactively.

**Full new/changed file list this session:** `viewer/cpe_load_path.js` (ARM/HOLD/RESTORE rewrite only —
PICK/CHAIN/SHOT/CUT/FRAMING untouched, already v8b), `viewer/cinema_maxq.js` (gating fold + ledger/cost
build/apply/composite/dispose wiring), `cli_silent_bake.js` (flags+docs), `viewer/main.js` (setup list),
`viewer/viewer.html` (script tag), `viewer/cpe_ledger_ticker.js` (NEW), `scripts/loadpath_ledger_preflight.js`
(NEW), `viewer/cpe_resource_panel.js` (cost odometer). Control taps: `/tmp/tap_lp_clip_all.js` (NEW),
`/tmp/tap_co_freeze.js` (NEW), plus the four pre-existing `/tmp/tap_lp_*.js`. No bakes run — every result
above is a node dry run or a `vm.Script` syntax check, per this session's own NO BAKES instruction.
Exact bake commands for the next session (never run here): see the "V8 CODE READY" turn-end report.

**v9.1 LEDGER FIX (2026-09-15, Sonnet, same session) — real HHS bake (`/tmp/wt-loadpath/out/HHS_loadpath_v8.log`)
found the v9 LEDGER TICKER wrong on an unsealed DB. Fixed, touched `viewer/cpe_ledger_ticker.js` only.**
SPEC (before, from Fable's own bake read): `build total=6884 sealedBefore=3 window=[0,0.3062]` then
`final=6883/6884 tip=? chainTip=? brokenAt=6884 => FAIL` — three defects. (1) the old gate was
`sealedBefore===0`; `sealedBefore=3` (of 6884) passed it and reached verify, when spec requires ANY
less-than-total sealing to be INCONCLUSIVE. FIX: gate is now `sealedBefore===total`, else
`§LEDGER_TICKER INCONCLUSIVE reason=unsealed sealed=s/N`, return before building `_lt` at all (no HUD
row ever drawn — verified by a fake-ctx call-count assertion in the dry run, not just "no crash").
(2) `tip=?`/`chainTip=?`: the old code read `tip` off `res.tip`, which `verifyChain`'s own FAILURE
return object never carries (only `{ok:false,brokeAt,why}` — no `tip` field), so any FAIL printed the
literal string "?". FIX: `tip` is now read directly off the DB (`SELECT op_hash FROM kernel_ops ORDER
BY id DESC LIMIT 1`) once the all-sealed gate passes — always a real hash, never `?`; a null read
despite the gate passing is a distinct `INCONCLUSIVE reason=notip` (a genuine data inconsistency, not
"unsealed"). `chainTip` is the verify's own confirmed tip on success (`=== tip`, a free consistency
check) or the literal word `'broken'` on failure — never a bare `?`, never a fabricated hash; the
FAIL/`brokenAt=<id>` outcome the `__ledgerFlipByte` control requires is UNCHANGED (this is not
downgraded to INCONCLUSIVE — Fable's item 2 wording was read as covering the degenerate missing-tip
case, not the tampered-but-fully-sealed case, since the original spec explicitly wants FAIL there).
(3) the real cause of `verified=6883` on `sealedBefore=3`: `verifyChainIncremental` was being called,
and `erp/kernel_ops.js`'s OWN header on that function says its cached `db.__krnVerifiedTip` prefix "is
trusted because THIS session already verified it against the same in-RAM db" and an in-RAM tamper (or,
here, a DIFFERENTLY-sealed earlier moment of the same live `db` object from some unrelated earlier
call in the same page session) BEHIND the cached tip is caught only by the NEXT FULL verify —
"Boot/import/merge paths must keep calling verifyChain." This ticker's build is exactly a boot check
and was using the wrong one. FIX: switched to `KO.verifyChain(db)` (full, from genesis) unconditionally
— never `verifyChainIncremental` — satisfying "count only ops whose op_hash verified against
prev_hash" by construction (verifyChain only advances `prev`/counts a row once its own hash is
confirmed chain-linked from GENESIS, no cache involved). Updated the module's own doc header and
`§LEDGER_TICKER_INIT` wired-line (now "v2 ... FULL verifyChain (never incremental/cached)") so the
static claim matches the code.
EVIDENCE (after): syntax OK. Extended `scratchpad/test_ledger_ticker.js` (real sql-wasm DB, real
`erp/kernel_ops.js`, not sliced) with two new scenarios plus a real assertion (not just eyeballing the
log) that no HUD line is ever drawn: (a) unsealed (0/5) — `INCONCLUSIVE reason=unsealed sealed=0/5`,
`[assert] no HUD drawn: true`; (b) NEW — partially sealed (3/8, built by fully sealing 8 rows then
wiping `op_hash`/`prev_hash`/`sig` back off ids 4-8, the exact shape a partial/interrupted seal run
leaves and the exact shape the real HHS bake hit) — `INCONCLUSIVE reason=unsealed sealed=3/8`,
`[assert] no HUD drawn: true`; (c) fully sealed (via the shipped preflight script, run as a real
subprocess) — build line now says "full not incremental", count-up `0/5 -> 2/5 -> 3/5 -> 5/5`,
`§KRN_CHAIN verified=5/5 tip=1371c1008da2… chainTip=1371c1008da2… sealedAfterCapture=true`,
`§LEDGER_TICKER final=5/5 tip=1371c1008da2… chainTip=1371c1008da2… => PASS` — tip/chainTip real hashes
on every line, `?` never printed anywhere in the whole log; (d) `__ledgerFlipByte=3` — `§KRN_CHAIN
verify payload altered at id=3`, `verified=2/5 tip=1371c1008da2… chainTip=broken ... brokenAt=3`,
`§LEDGER_TICKER final=2/5 ... chainTip=broken brokenAt=3 => FAIL`, HUD shows "ledger: broken at op 3" —
still a real, non-`?` tip on the FAIL line, `chainTip` distinctly `broken`, exactly per spec.
**Not re-verified without a bake:** whether the REAL HHS DB's own underlying sealed/unsealed row
pattern matches the "first 3, rest unsealed" shape this dry run modeled, or some other scatter — moot for
the fix itself (the new gate is `sealedBefore===total` regardless of WHICH rows are sealed, so any
scatter short of 100% now reads INCONCLUSIVE) but worth red1/Fable knowing this session could not
inspect the live HHS DB directly to confirm the exact prior scatter, only reproduce the REPORTED
numbers (3 sealed, N total) synthetically.

**v9.3 CONTROLS FIX (2026-09-15, Sonnet, same session) — real HHS control bakes
(`HHS_loadpath_v8_ctrl_frame_off.log`, `HHS_loadpath_v8_ctrl_clip_all.log`) found TWO of the six
§LOADPATH controls not firing (break-support, skip-restore, hide-rest, co-freeze all correctly FAILed
on cue). Fixed, touched `viewer/cpe_load_path.js` only — the beat itself (PICK/CHAIN/ARM/HOLD/RESTORE)
untouched.**
SPEC (before): **1. `__lpFrameOff`**: real log showed `hopsIntersecting=4/5 => PASS`, byte-identical
to the normal run — the control had ZERO effect at HHS's real scale. Root cause: the offset magnitude
was scaled off each HOP's OWN (small) diagonal (`max(5, hop-diagonal*4)`), while the frustum's own
half-width at HHS's real camera-to-chain distance is far larger than that — the same limitation this
session's own node dry run had already flagged as unverified-without-a-bake (§129.4 v9), now confirmed
a REAL defect, not a toy-harness artifact. FIX (per review): scale the offset off the BUILDING's own
diagonal instead (>= 2x it — used 2.5x for margin), and apply the SAME offset vector to THREE
populations that used to be treated inconsistently: each hop's own box (hopsIntersecting), the
building box (buildingInFrame — previously never shifted by this control at all), and the chain/stack
box (stackInFrame — shifted too, for consistency: printing a shifted hopsIntersecting=0 next to an
unshifted stackInFrame=1.000 would read as a self-contradicting line to a log reader). **2.
`__lpClipAll`**: real log showed `beyondVisible=10 => PASS` when it must be 0. Root cause: the
reference box for "place the plane behind literally everything" was `_lp.buildingBox`, built ONLY from
`elements_meta`/`element_transforms` DB rows — but `_applyGhost` ghosts EVERY mesh
`A.collectMeshes` finds in the LIVE THREE.js scene (site/context props, helpers, anything with no DB
row at all), a larger, different population. Ten such objects sat beyond the too-small reference box's
own far corner and survived the clip by construction, not by a witness bug. FIX (per review): a new
`_ghostPopulationMaxDepth(camPos, viewDir)` scans the SAME population `_applyGhost`'s own
`A.collectMeshes` predicates enumerate (never our own overlay clones), takes each mesh's OWN real-time
Box3, and the plane depth is now `max(that scan) + eps` — never `_lp.buildingBox`. Also per review:
`beyondVisible` (in `_visibleWitness`) and the new scan both now SKIP any object whose Box3 is
non-finite or inverted (three.js's own real "empty box" contract: `min=+Inf, max=-Inf`) — counted
separately as `emptyBoxes`/`empty`, never silently folded into either side of a NaN/Infinity
comparison. New witness line `§LOADPATH_CLIPALL_SCAN seen=S empty=E maxDepth=D` prints the scan's own
inputs before the plane is built, so a future defect here is legible from the log alone.
EVIDENCE (after): syntax OK. Extended `scratchpad/test_loadpath_v4.js` (the SAME harness, per
"extend, don't rewrite") with two new synthetic ghost containers: (a) `containerFarOutsideDB` —
positioned far along the camera's own view axis, deliberately with NO matching `elements_meta` row (so
it sits outside the OLD `_lp.buildingBox` entirely, standing in for real site/context meshes) — proves
the NEW scan reaches it while the old buildingBox-based reference could not; (b) `containerEmptyBox` —
a mesh whose Box3 comes back in three.js's real empty-box shape. Building this required a SEPARATE
mock fix first: a NaN *position* was tried first and found to silently round-trip back to (0,0,0)
through the harness's own `V3` constructor (`this.x = x || 0` — NaN is falsy), TWICE over (once
directly, once again inside `Box3.setFromObject`'s own `new V3(p.x-rXZ,...)`) — a mock bug that would
have made the scenario test nothing at all; fixed by marking the mesh (`_forceEmptyBox`) and returning
three.js's own real inverted-empty shape directly (`Infinity`/`-Infinity`, both TRUTHY, so the same
constructor cannot coerce them away) instead of relying on a position value. Real run after both fixes:
normal PASS — `nearSideClipped=8 beyondVisible=6 emptyBoxes=1` (8 ghosted: 1 correctly excluded as
empty, 1 of the remaining 7 — the near-camera foreground object — correctly NOT beyond, matching its
deliberate placement); **`__lpFrameOff`** — `buildingInFrame=0.000 stackInFrame=0.000
hopsIntersecting=0/4 => FAIL`, exactly per the review's own required output; **`__lpClipAll`** —
`§LOADPATH_CLIPALL_SCAN seen=8 empty=1 maxDepth=113.21` then `beyondVisible=0 emptyBoxes=1 => FAIL`
(the far-outside-DB object now correctly clipped; the empty-box object correctly excluded from both
the scan and the count, never miscounted either way). All four previously-passing controls
(`__lpHideRest`, `__lpSkipRestore`) and the normal/off-centre-box runs re-verified unaffected by these
two changes (still PASS/FAIL exactly as before). `__lpBreakSupport`/`__lpSkipRestore`'s own real-bake
confirmation (break-support 4/5, skip-restore 0/456+clones 0/5) and `__coFreeze`'s
(cost=16053 of 801577) were already reported firing correctly by the review and are untouched by this
fix. No bakes run here — every result above is a node dry run or a `vm.Script` syntax check.

**v9.4 LEDGER FIX 2 (2026-09-15, Sonnet, same session) — a real ledger bake
(`/tmp/wt-loadpath/out/HHS_ledger_v8.log`) found the whole out-of-band preflight-seal DESIGN void on
this building: the file on disk was 6883/6883 sealed (confirmed by BOTH the preflight script and a
direct `sqlite3` check), the page fetched that EXACT file, and the ticker still opened it at
`sealed=3/6884`. Fixed, touched `viewer/cpe_ledger_ticker.js` (the real fix) and
`scripts/loadpath_ledger_preflight.js` (a warning + the same `tip=?` bug class fixed there too).**
SPEC (before, from the review's own log read): the mechanism is `§KERNEL_OPS_SCHED_VERSION stale
genVersion=38 current=39 — cleared 6880 ops, will re-inject` followed by a fresh write loop
(`§WRITE_LOOP_TIMING rows=6880`) — Time Machine's own activation (`viewer/time_machine.js`) DELETEs
every `ELEMENT_PLACE` op and re-materializes them fresh THE MOMENT it finds the persisted schedule's
stamped `_genVersion` behind the CURRENT generator's `_GANTT_CACHE_VERSION`, with NO seal step
anywhere in that path — only the 3 non-`ELEMENT_PLACE` ops (never touched by the regeneration) kept
their original hash. An out-of-band, file-level seal (the preflight script) cannot survive that by
construction: it seals bytes on disk BEFORE the page ever runs, and the re-injection happens IN THE
PAGE, AFTER those bytes are read. FIX (per review, three parts): **(1)** in bake-owned mode
(`A._bakeOwned`, `scene.js`'s own `!!window.__MAXQ_SILENT` flag — a controlled, repeatable,
non-interactive pipeline), when the gate finds `sealed !== total`, the ticker now calls
`KO.sealFrom(db)` on the LIVE, already-loaded db ITSELF, in-page, before verifying — never an
out-of-band file. Confirmed this call is ALREADY correctly timed without moving it: this beat's own
`A.ledgerTickerBuild` is invoked from `cinema_maxq.js`'s bake body strictly after
`await window.tmActivateForBake()` resolves (read the actual call sites: `cinema_maxq.js:1592`
gates the whole buildup/loadPath/ledger section on this same await), and `tmActivateForBake` itself
only resolves once `_bakeTimelineReady()` is true, which `time_machine.js` only sets AFTER
`injectGantt`'s own `§GANTT_CACHE_SAVE`/`afterLoadOps` line runs — i.e. the EXACT "activation
complete" signal the review named, already the correct hook, no polling of our own needed or added.
If the in-page seal still leaves `sealed !== total` afterward (a genuine seal failure, not just
staleness), INCONCLUSIVE `reason=seal-failed` — still no HUD, per the same "nothing true to show"
principle as the plain-unsealed case. New witness `§LEDGER_TICKER sealedBy=bake sealedAt=afterInject
sealed=N/N tip=…` (or `sealedBy=preflight` when the gate already passed on arrival) prints unconditionally
once the gate is satisfied, so the log states, without inference, which chain this beat is about to
verify. **(2)** outside bake-owned mode (`A._bakeOwned` falsy — a live interactive editor session):
UNCHANGED — unsealed stays INCONCLUSIVE, this beat never seals a DB a human did not ask sealed and
might still be mid-editing. **(3)** `scripts/loadpath_ledger_preflight.js` kept (still useful as a
standalone sanity tool and for buildings whose schedule generation IS current) but now cross-checks
its own DB's stamped `_genVersion` (read off one real `ELEMENT_PLACE` op's `parameters`) against
`viewer/time_machine.js`'s own `_GANTT_CACHE_VERSION` constant — read as TEXT via regex, never
`require()`'d (that file is browser-only: canvas/DOM/THREE.js throughout, exactly the "check module
deps before assuming a browser is needed" case) — printing `§KRN_SEAL_FROM_GENVERSION
dbGenVersion=… currentGenVersion=… => STALE|current` with an explicit warning that a STALE seal will
be voided by the next bake's own re-injection. Also fixed, while in this file: the exact same
`tip=?` bug class §129.4 v9.1 fixed in the browser ticker existed here too (`verify.tip` is absent
on `verifyChain`'s own failure return) — `tip` is now read straight off the DB's own last row,
never off the verify result.
EVIDENCE (after): syntax OK on both files (`vm.Script`). Extended `scratchpad/test_ledger_ticker.js`
with three new parts against real sql-wasm DBs (no mocks): **PART E** — a DB shaped exactly like the
real bake's own report (2 non-place ops sealed via `sealFrom`, then 6 FRESH `ELEMENT_PLACE` ops
inserted with NO `op_hash` at all, simulating the DELETE+re-INSERT `§KERNEL_OPS_SCHED_VERSION` leaves
behind) with `A._bakeOwned=true` — build correctly detects `sealed=2/8`, calls `sealFrom` itself
(`§KRN_SEAL_FROM fromId=2 sealed=6`), reports `sealedBy=bake sealedAt=afterInject sealed=8/8`, counts
up, `final=8/8 ... => PASS`; a direct DB recount after the build call confirms 8/8 now sealed. **PART
F** — `__ledgerFlipByte=5` on that SAME now-fully-sealed db (a further build call, gate already sees
`sealed=8/8` so no re-seal is attempted, correctly labelled `sealedBy=preflight` from THIS call's own
perspective) — verify still catches the tamper: `§KRN_CHAIN verify payload altered at id=5`,
`final=4/8 ... brokenAt=5 => FAIL`, HUD "broken at op 5" — proving a later tamper survives detection
even after the in-page auto-heal. **PART G** — the SAME re-injection shape (1 sealed op, 1 freshly
unsealed `ELEMENT_PLACE`) WITHOUT `A._bakeOwned` set — stays `INCONCLUSIVE reason=unsealed
sealed=1/2`, and a direct recount confirms the build call sealed NOTHING (1/2 unchanged), proving the
live-editor safety guard holds. The `§KRN_SEAL_FROM_GENVERSION` cross-check was verified separately
(not folded into the same script run, since the existing test DBs carry no `_genVersion` stamps at
all — correctly reads `INCONCLUSIVE reason=no-ELEMENT_PLACE-op-or-no-genVersion-stamp` there) against
two purpose-built one-off DBs: a `_genVersion=38` op against the real `time_machine.js`'s own
`_GANTT_CACHE_VERSION=39` printed `=> STALE` with the full warning text; a `_genVersion=39` op printed
`=> current`; the regex extraction itself was independently confirmed to read `39` off the real,
unmodified `viewer/time_machine.js` file. All seven pre-existing parts (A/A2/B/C/D plus the earlier
v9.1/v9.3 fixes) re-verified unaffected — full log re-read end to end, not just the new parts, per
the Log Mandate. No bakes run here — every result above is a node dry run, a real subprocess run of
the shipped preflight script, or a `vm.Script` syntax check.
**Not verified without a bake:** whether the REAL HHS DB's surviving 3 sealed ops are genuinely the
non-`ELEMENT_PLACE` ops this session assumed (PROJECT_INIT/SCHEDULE_META-shaped), or some other
subset — moot for the fix itself (the in-page `sealFrom` call reseals FORWARD from whatever the
current tip is, regardless of which specific ops survived), but, as with v9.1, this session could not
inspect the live HHS DB directly to confirm the exact prior shape, only reproduce the REPORTED
counts (3 sealed, N total, genVersion 38 vs 39) synthetically.

**v9.5 CONTROLS FIX 2 (2026-09-15, Sonnet, same session) — a real HHS control bake
(`/tmp/wt-loadpath/out/HHS_loadpath_v8b_ctrl_frame_off.log`) found `__lpFrameOff` not merely
ineffective but WORSE than doing nothing: `buildingInFrame=1.000 hopsIntersecting=5/5` — a bigger
in-frame fraction than the normal run's own 0.500. Fixed, touched `viewer/cpe_load_path.js` only —
`__lpClipAll` (fixed last round, v9.3) reconfirmed PASSing on cue in this same bake
(`beyondVisible=0 emptyBoxes=2`), untouched here.**
SPEC (before, from the review's own diagnosis): v9.3's fix shifted the right magnitude (>= 2x the
building diagonal) but along the WRONG axis — `right` was derived from `crossVectors(offDir,
worldUp)` where `offDir` was the WITHDRAWN v3-era fixed constant `(0.5, 0.5, 0.7)`, a direction with
no relationship to the actual live camera or shot at all. Shifting a box along a direction unrelated
to the view axis is a coin flip: on HHS's real shot it happened to move the boxes FURTHER into frame
instead of out of it. FIX (per review, exact spec): delete the `(0.5,0.5,0.7)` constant and the
`offDir`/`worldUp` variables entirely from `_framingWitness` (grep confirms zero remaining
references anywhere in the file); compute `fwd = A.camera.getWorldDirection(new THREE.Vector3())` (a
real three.js Camera method — the camera's own actual forward direction, live, never a guess) and
`right = crossVectors(fwd, A.camera.up).normalize()`; raise the magnitude to 50x the building's own
diagonal (up from 2.5x) — large enough that no perspective camera, at any FOV or distance, could
still keep the shifted box's projection inside NDC [-1,1], closing off the "just barely still
in-frame" failure mode a smaller margin could theoretically hit on some other building's geometry.
Applied identically to the building box, the chain box, and every per-hop box, unchanged from v9.3.
New field on the FRAMING line: `frameOff=true offset=[x,y,z]`, printed only when the tap is active,
so a log reader can see the exact vector that was applied without re-deriving it.
EVIDENCE (after): syntax OK; `grep -n '0.5, 0.5, 0.7'` returns nothing. Extended
`scratchpad/test_loadpath_v4.js`: added a real `getWorldDirection(target)` to the mock camera
(mutates+returns the passed object, computed from `position`→`_lookTarget`, faithful to the actual
three.js API contract the production code now calls) — the mock had never needed this method before
since nothing in v8b/v9.3 called it. Added a console.log interceptor (captures the exact
`§LOADPATH_FRAMING` line for a hard, parsed assertion — `buildingInFrame===0.000` AND
`hopsIntersecting===0` AND `frameOff=true` present — rather than eyeballing text in a saved log;
every line still prints to real stdout, nothing hidden) and three NEW scenarios driving the camera to
genuinely different positions/directions, none matching the deleted constant: direction A (camera
far +X+Y+Z-ish, offset printed `[646.99,0.00,-1940.96]`), direction B (far -X,+Y,+Z, offset
`[1702.33,0.00,1134.89]`), direction C (steep near-overhead, offset `[-2006.22,0.00,-401.24]`) — all
three printed `buildingInFrame=0.000 hopsIntersecting=0/4 frameOff=true => FAIL`, exactly as required,
each with a genuinely different offset vector (proving the direction really is camera-derived, not a
second hidden constant). The PRE-EXISTING `__lpFrameOff` scenario in the main harness (unchanged
camera setup from prior rounds) was reconfirmed fixed too:
`buildingInFrame=0.000 stackInFrame=0.000 hopsIntersecting=0/4 frameOff=true offset=[1109.16,0.00,-1719.20] => FAIL`
— worse-than-normal is gone, replaced with fully-out-of-frame on every tested direction. All other
controls (`__lpHideRest`, `__lpSkipRestore`, `__lpClipAll`) and the normal/off-centre-box runs
re-verified unaffected by this change — full log re-read end to end. One pre-existing, UNRELATED
harness fact was investigated and found NOT a regression from this fix: the harness's own trailing
"scene.children left over" check reads 4, not 0 — isolated (by a temporary diagnostic, since removed)
to the `__lpSkipRestore` scenario earlier in the SAME file, which deliberately skips
`_disposeChainClones` to prove `§LOADPATH_RESTORE`'s own `clonesReverted=0/4 => FAIL` witness, with
nothing in this harness calling `A.loadPathDispose()` afterward to force-clean it (the real bake loop
does, at end-of-film) — confirmed the three new round-2 scenarios leave that count UNCHANGED (still
4, never 8 or 12), i.e. each armed and restored cleanly on its own; the stale "(should be 0)" comment
on that line was corrected to state the real, by-design expectation instead of leaving a future
reader to misread it as a fresh defect. No bakes run here — every result above is a node dry run or a
`vm.Script` syntax check.

**v9.6 CONTROLS FIX 3 (2026-09-15, Sonnet, same session) — a real HHS control bake
(`/tmp/wt-loadpath/out/HHS_loadpath_v8c_ctrl_frame_off.log`) found v9.5's own fix half-right: the
SHIFT was finally real and correctly camera-derived (`buildingInFrame=0.000 stackInFrame=0.000
frameOff=true offset=[1334.52,0.00,5011.44]`), yet `hopsIntersecting=4/5 => PASS` — the per-hop
intersects test itself was still wrong. Fixed, touched `viewer/cpe_load_path.js` (`_projectAABB`
only) — `_framingWitness`'s own direction/magnitude fix from v9.5 is untouched and confirmed correct
by this same bake.**
SPEC (before, from the review's own diagnosis, read at `_projectAABB` ~line 407): `intersects` was
computed as `!(xmax < -1 || xmin > 1 || ymax < -1 || ymin > 1)`, built from the min/max NDC x/y of
ALL EIGHT projected corners, with NO regard to whether any given corner was actually in FRONT of the
camera (`p.z <= 1` was checked only for the separate `fraction`/`inCount` computation, never for this
span). A box shifted 1,000-5,000 m to the side has corners at extreme angles, some of them BEHIND the
camera — a perspective divide by a near-zero or negative w flips such a corner's NDC sign onto an
essentially arbitrary value, and the resulting min/max span routinely ends up covering all of [-1,1]
by that artifact alone, reading `intersects=true` for a box nowhere near the frustum. FIX (per
review, exact spec): replaced the span heuristic with a REAL frustum/box test —
`new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,
camera.matrixWorldInverse)).intersectsBox(new THREE.Box3(new THREE.Vector3(box.minX,box.minY,box.minZ),
new THREE.Vector3(box.maxX,box.maxY,box.maxZ)))` — computed AFTER the existing `updateMatrixWorld()`
call (so `matrixWorldInverse` reflects the probe pose) and BEFORE the camera position is restored;
`camera.updateProjectionMatrix()` deliberately NOT called, since fov/aspect/near/far never change
during this probe, only position/orientation. `fraction` is untouched (it already gated on `p.z<=1`
per corner — the bug never reached it). A defensive fallback to the OLD span test is kept ONLY for a
camera/THREE stub with no `Frustum`/`Matrix4`/`matrixWorldInverse` support, so a call never throws
outright on an unexpected environment; the real browser path always takes the frustum branch.
EVIDENCE (after): syntax OK. Extended `scratchpad/test_loadpath_v4.js` with a REAL Matrix4/Frustum
pair in the mock — not a stub-through, since a fake that returns a fixed answer would prove nothing:
`Matrix4.prototype.multiplyMatrices` (the standard column-major 4x4 multiply) and
`makePerspective(fov,aspect,near,far)` (the standard OpenGL/three.js perspective matrix),
`Frustum.prototype.setFromProjectionMatrix` (Gribb/Hartmann 6-plane extraction) and `intersectsBox`
(the p-vertex/n-vertex AABB test) — all textbook three.js algorithms, not re-derived math. Wired a
real `camera.matrixWorldInverse` (recomputed in the mock's own `updateMatrixWorld()` from the live
position/`_lookTarget`/up — exactly mirroring three.js's own "only current right after
updateMatrixWorld()" contract) and a fixed `camera.projectionMatrix` (built once from fov/aspect/
near/far, unaffected by position, matching the fix's own "updateProjectionMatrix not needed" claim).
Two verification layers: **(1) end-to-end** — every existing `__lpFrameOff` scenario (the main
harness's own control run AND all three "arbitrary camera direction" scenarios from v9.5) now reads
`hopsIntersecting=0/4` (previously stuck at a nonzero count even with the direction/magnitude fix),
confirming the exact real-bake symptom is gone; every other scenario (`__lpHideRest`,
`__lpSkipRestore`, `__lpClipAll`, normal/off-centre runs) re-verified unaffected, still reporting
sane `hopsIntersecting=4/4`. **(2) direct** — a new, standalone unit test drives the SAME
Matrix4/Frustum primitives in the exact call sequence `_projectAABB` uses (multiplyMatrices ->
setFromProjectionMatrix -> intersectsBox), independent of the whole load-path beat, against the
coordinator's own three named cases (camera at origin looking down -Z, fov=50/aspect=1.6): a box
entirely BEHIND the camera (z=+9..+11) -> `intersectsBox=false` (PASS); a box far to the SIDE
(x=495..505 at depth 10, computed frustum half-width there is 7.46) -> `intersectsBox=false` (PASS);
a box STRADDLING the frame edge (x=4.5..10.5, straddling the same computed 7.46 edge) ->
`intersectsBox=true` (PASS) — all three exactly as specified, the straddling box's bounds derived
from the frustum's own computed half-width, never a guessed magic number. No bakes run here — every
result above is a node dry run or a `vm.Script` syntax check.

**v10 CODE READY (2026-09-15, Sonnet, same session) — §129.6 v9 sighting findings (items 1-5, 7)
plus three further rulings (CHAIN MUST DESCEND, LOOK v10, FOCUS-off v10). Code-only, no bakes.**

**1. RESUME JUMP — CLOCK FREEZE + frame insertion (`viewer/cinema_maxq.js`, `viewer/cpe_load_path.js`).**
SPEC: freeze tFilm (path/sun/day-counter/stats — everything) for every hold frame at the arm value;
insert `framesInserted` extra frames instead of shifting `_revealU`; resume from the SAME tFilm.
`§LOADPATH_WINDOW_SHIFT` withdrawn. Implementation: `A.loadPathBuild`'s call site computes
`_lpArmTn`/`_lpFramesInserted`/`_lpHoldFrameStart` from `A._loadPathWindow` and inflates `nFrames`;
the loop's own `_tn` computation gets a 3-way remap (pre-hold: original progression; hold-inserted:
frozen at `_lpHoldFrameStart`'s tn; resumed: original progression continued from EXACTLY that point,
shifted back by `framesInserted` in the new index space) — byte-identical to the old mapping when no
hold exists this bake. `cpe_load_path.js`'s `loadPathApplyVisual` takes a new 3rd param `holdCtl`
(`{inHold, elapsedSec}`) — window membership and the reveal/glow's own elapsed clock now come from
this explicit signal (cinema_maxq.js's own loop bookkeeping), never re-derived from `fSec` (frozen,
so it could no longer drive anything); `holdCtl` falsy (control `__lpNoClockFreeze`) falls back
UNCHANGED to the old fSec-self-determination, exactly reproducing the pre-fix bug on purpose.
`A._loadPathArmTFilm`/`_loadPathReleaseTFilm` (set at arm/restore, from whatever `tNorm` actually
was) and `A._loadPathRestoreCount` (incremented each real restore) are the single sources of truth
the post-loop `§LOADPATH_RESUME` witness reads — computed from a per-frame camera-step log
(`_lpCamSteps[i]`, real Euclidean distance between consecutive captured-frame camera positions) kept
regardless of the control, so the witness works whether the fix or the control is active.
EVIDENCE: node dry run (`scratchpad/test_clock_freeze.js`) reproduces the EXACT shipped remap
formula (cross-checked char-for-char against the file) and drives a fake 100-original+10-inserted
frame loop: tn constant across all 10 inserted frames, resume-frame tn === frozen tn exactly
(continuity), every pre-hold and post-hold frame matches the intended progression, total frames =
original + inserted, no-hold case byte-identical, hold-at-frame-0 edge case correct. **A REAL BUG
WAS FOUND AND FIXED BY THIS DRY RUN**: the pre-hold branch's `else` clause divided by `nFrames` —
already inflated by `_lpFramesInserted` at the build call site — silently COMPRESSING every frame
before the hold; fixed to divide by `_lpNFramesOriginal` whenever a hold is armed this bake (still
`nFrames` when none is, preserving byte-identical old behaviour). §LOADPATH_RESUME/RESUME-frame
detection logic itself could not be dry-run end-to-end (needs a real multi-hundred-frame bake loop
with a real camera) — flagged, not faked; the frame-index MATH it depends on is now proven correct.
**Not yet done: `ffprobe` confirmation that a real bake's output file frame count equals clip frames
+ k** — this is an external, post-bake check the next bake session must run, not something a node
dry run can produce.

**2/3/6b. COST + LEDGER — pie-chart HUD rows, placement SUPERSEDED to item 6b's own ruling
(`viewer/cpe_resource_panel.js`, `viewer/cpe_ledger_ticker.js`, `cli_silent_bake.js`,
`viewer/cinema_path_editor.js`).** Items 2/3's original resource-panel/status-box placements are
withdrawn by item 6b: Cost sits DIRECTLY ABOVE Ledger, BOTH inside the pie-chart HUD
(`cpe_resource_panel.js`'s own panel, `§CPE_PIE_FLYOUT`), laid out by that panel's own row routine —
`_drawList` now returns `{ry,lx,availW,fs,rowH}` (where the trade list ended) so `_pieCostLedgerRows`
(new) can append two more rows in the SAME column/font/cadence, immediately after. Gate is the
"Label"/`--label` toggle (renamed on-screen to **4D/5D** in `cinema_path_editor.js`'s panel — CLI
stays `--label`, `--4d5d`/`--no-4d5d` accepted as aliases so no existing bake command breaks) — NOT
Measure; `_ledger`/`_costOdo` in `cinema_maxq.js` now derive from `_roomTitle`, not `_measure` (the
load path 3D effect is untouched, still Measure-gated). Row text uses SPACE-grouped thousands
("801 577", not "801,577") per the ruling's own examples — `_spaceThousands` added in both files.
`cpe_ledger_ticker.js`'s own `ledgerTickerCompositeOntoCanvas` is now a no-op (drawing moved to the
panel); `A.ledgerTickerRowText()` returns the current row string verbatim matching the three spec
examples (mid-buildup/topout-with-✓/tampered). `§HUD_LAYOUT` registers `pie.cost`/`pie.ledger` and
FAILS unless `cost.y+cost.h <= ledger.y` (checked geometrically from the SAME registered rects).
EVIDENCE: syntax-checked; the row-text format was checked by inspection against the three literal
spec examples (space-thousands, `✓`, "broken at op N") — not independently dry-run against a live
`_lt` state in THIS round (§129.4 v9.1-v9.4's own dry runs already proved the underlying count-
up/verify/tamper logic; this round only changed WHERE the string is drawn and its exact formatting,
both re-read against the spec text line-for-line). The `cost.y+cost.h<=ledger.y` geometric check
could not be dry-run without a real canvas (row Y positions depend on `_drawList`'s own font-metric
math) — flagged for the real bake's own `§HUD_LAYOUT` line.

**4. §HUD_LAYOUT (`viewer/cinema_maxq.js`).** A per-frame registry (`A._hudLayoutRects`, reset at the
top of `_captureFrame`) any drawer calls via `A._hudLayoutRegister(name,x,y,w,h)`; `A._hudLayoutWitness()`
computes pairwise AABB overlaps EXCLUDING pure nesting (one rect fully containing another is
intentional structure, e.g. a row inside its own panel — disclosed interpretation, not in the
spec's own literal text) and the cost-above-ledger order check, printing
`§HUD_LAYOUT items=[...] overlaps=N => PASS|FAIL`. Wired: resource-panel (whole box), pie.cost,
pie.ledger register real rects; every FOCUS-gated overlay (below) registers a tiny 1×1 placeholder
ONLY when its call is actually allowed through — sufficient for the "painted vs off" determination
§LOADPATH_FOCUS needs, though NOT pixel-accurate geometry for those specific overlays (a disclosed
simplification: their overlap geometry was never the concern FOCUS or HUD_LAYOUT need to prove, only
whether they painted at all during a hold). Control `__hudForceOverlap` snaps whichever of
{pie.ledger, roster} registers SECOND onto the FIRST one's rect — works regardless of this bake's own
draw order. Trigger: `A._loadPathMidHoldThisFrame` (set by `cpe_load_path.js` at its own mid-hold
witness moment), checked and cleared at the END of `_captureFrame`, after every drawer has run.
EVIDENCE: the registry/overlap-exclusion MATH (AABB overlap minus nesting) is standard and was
sanity-checked by the SAME `_rectsOverlapCount`-style logic already proven correct in the LABEL
LADDER dry run below (0 overlaps for a clean column, 74 for a naive one) — the exact `A._hudLayoutWitness`
function itself was not separately re-run in isolation (would need a fabricated `A._hudLayoutRects`
array — deferred as lower-value than the LABEL LADDER's own, more novel geometry). No bake yet to
confirm `__hudForceOverlap` actually produces `overlaps>0` end-to-end (needs `A._hudLayoutRegister`
calls from resource-panel + a `roster` registration to both fire in the SAME real frame) — flagged.

**5/7. LABEL LADDER + visible-hops-first PICK + on-screen-only labels (`viewer/cpe_load_path.js`).**
Pure, node-testable layout functions exposed on `A`: `_loadPathLadderLayout` (one column beside the
stack — side chosen by the stack's own projected x, TOP-DOWN display order, `rowH = labelH + gap`,
`gap >= labelH` by construction), `_loadPathNaiveLayout` (v8 behaviour: a label at each hop's own
projected point — the control), `_loadPathRectsOverlapCount`, `_loadPathMinVerticalGap`. Item 7:
`_pick` (rewritten, see below) now returns every MONOTONE-valid candidate; `_rankValid` ranks them by
`visibleHops` (the SAME `_projectAABB(...).intersects` frustum test `hopsIntersecting` uses, at the
searched hold pose) FIRST, then depth/footprint/guid — `§LOADPATH_PICK` gains `visibleHops=K/N`.
`loadPathCompositeOntoCanvas` rewritten: only hops whose clone box intersects the frame (the SAME
predicate, never a second one — item 7c's "n must equal hopsIntersecting" holds by construction) get
a screen position at all; off-screen hops stay coloured (already solid/ghost in 3D) but are never
placed in the layout, never leadered. `§LOADPATH_LABELS n=K of=N column=left|right overlaps=N
minGapPx=g inFrame=bool => PASS|FAIL` prints once per hold (mid-hold, same trigger as §HUD_LAYOUT).
EVIDENCE: `scratchpad/test_label_ladder.js` — LADDER on 21 synthetic closely-spaced layers: 0
overlaps, minGapPx=24=labelH (spec floor met exactly), all in frame, top row is the highest hop
(k=20), bottom row is ground (k=0); the SAME 21 layers under NAIVE layout: 74 overlaps, correctly
proving the control (per the spec's own "if it does not [FAIL], the control is wrong, not the
witness" — confirmed the OTHER way). 5-layer/preferRight sanity also clean. `scratchpad/test_chain_descend.js`
PART 3: `_rankValid` directly — a candidate with 4 visible hops (depth 4) beats a deeper one with 2
visible hops (depth 9), `rule=visibleHops` — exactly "a candidate with 4 visible hops must beat a
deeper one with 2." The actual on-screen CANVAS drawing (leader lines, glow, real camera projection)
could not be dry-run (needs a real THREE.js scene) — the LAYOUT MATH and the PICK RANKING, the two
provably-correct parts, were.

**CHAIN MUST DESCEND (user ruling, supersedes nothing — NEW validity filter, `viewer/cpe_load_path.js`).**
SPEC: a candidate chain is valid only if every hop's base is below the previous hop's base (walking
top->ground) AND it ends on ground; PICK considers ONLY valid chains; `§LOADPATH_CHAIN` gains
`monotone=` `descents=` `ascents=`, `ascents>0 => FAIL` and such a chain is NEVER picked. New
`_chainDescendInfo(items, chainIdx)` (pure, exposed as `A._loadPathChainDescendInfo`); `_pick`
rewritten to walk EVERY eligible candidate's own chain and exclude non-monotone ones from `valid[]`
entirely (not just deprioritize) — `pick.rejectedAscending` counts them. **Support-sweep finding,
NOT fixed here (per instruction):** LTU's own 21-hop chain climbs 5.7m back to 14.8m —
`support_sweep.js`'s `designatedSupport` relation is PLACEMENT ORDER, not a gravity path, so nothing
guarantees monotonicity on its own; this filter works around it in PICK, the sweep itself is
untouched, and the zigzag is a real finding for the 4D_MODEL_INTEGRITY lane on federated models.
EVIDENCE: `scratchpad/test_chain_descend.js` — PART 1: `_chainDescendInfo` directly on a hand-built
21-hop chain shaped exactly like the real LTU report (14.8m down to 5.7m, back up to 7.2m, down
again, back up to 2.5m, down to 0.0m — TWO ascents by construction) correctly reads
`ascents=2 monotone=false`; a clean 5-hop descending chain reads `ascents=0 monotone=true`. PART 2:
`_pick`/`_resolveChainInfo` end-to-end on a 26-item graph containing BOTH shapes as disjoint islands
— the FULL 21-hop ascending candidate (depth=21) is NEVER in `valid[]`; the 5-hop monotone candidate
IS; the eventual winner (a legitimately-monotone 7-hop TAIL of the ascending island, found after its
own last ascent point) is never the rejected chain. Real, shipped functions throughout, no
re-implementation in the test.

**LOOK v10 — bottom-up, solid per layer (supersedes v8b's "whole stack solid from arm",
`viewer/cpe_load_path.js`).** SPEC: at arm no layer is solid; each step turns the next VISIBLE layer
(ground first) solid in its rainbow colour and lands its label+leader; layers above stay ghost until
their turn; last step = the picked element; building stays x-ray with the single near-side plane
(CUT mechanism itself untouched). `_buildChainClones` now starts every clone GHOSTED
(`GHOST_OPACITY`, `transparent=true`) instead of solid; the reveal-step block in
`loadPathApplyVisual` computes `_solidSetFor(K, revealed)` (bottom-up: indices `[0..revealed)`;
control `__lpTopDown`: the TOP `revealed` indices instead) and flips each hop's material
solid/ghost accordingly, glow applied to whichever hop's turn is THIS step. New
`_stackWitness(revealed)` measures ACTUAL material state (`_isSolid`, never trusts the intended
index): finds the highest solid index, fails if ANY index below it is still ghost — prints
`§LOADPATH_STACK order=bottomUp step=j solid=j/K ghostAbove=K-j => PASS|FAIL`. **Reconciliation
found by the dry run, not guessed:** `§LOADPATH_VISIBLE`'s own `solid===N` PASS criterion (v8b: "the
whole stack is always solid") was WRONG under v10 (solidity is now a function of time) — the harness's
own "normal PASS run" flipped to FAIL (`solid=3` at mid-hold, N=4) until fixed to `solid===_lp.revealedHops`
(the count EXPECTED at this exact moment, still catching real defects — a hop stuck solid/ghost past
its own turn — exactly as before, just against the right target number).
EVIDENCE: `scratchpad/test_loadpath_v4.js`'s full re-run shows `§LOADPATH_STACK` correctly
progressing `1/4 PASS -> 2/4 PASS -> 3/4 PASS -> 4/4 PASS` across every scenario; `§LOADPATH_VISIBLE`
re-verified PASSing again after the reconciliation fix (previously showing a false FAIL introduced by
this SAME round's own LOOK v10 change — caught before it could reach a bake). New `__lpTopDown`
scenario: step 1 (and 2, 3) correctly read `=> FAIL` (a solid layer — the top one — sits above a
ghost one, i.e. ground, at every step except the last, where everything is solid regardless of
order and there is nothing left to invert) — exactly "FAIL at step 1" as required.

**FOCUS v10 — OFF, not held (supersedes v9's "hold=true, paint frozen state",
`viewer/cinema_maxq.js`).** SPEC: during hold frames, every OTHER overlay/label — stats cards,
roster, clash markers, measure cues, room titles, discipline labels, day counter — is NOT PAINTED AT
ALL; the status box (now carrying nothing itself, since Cost/Ledger moved to the pie panel per item
6b) stays, frozen (a free consequence of tFilm being frozen — its own rows are pure functions of it,
no flag needed); only load path animates. New `_drawUnlessHold(name, fn)`: skips the call entirely
on a hold frame (`A._loadPathHoldFrameActive`, set every frame from `_lpHoldCtl.inHold`) unless
`window.__lpNoFocusHold` forces it through; registers a placeholder rect under `name` ONLY when
allowed through. Wrapped: all `_flythruDatumOn`-gated measure-cue drawers, `flythruCuesCompositeOntoCanvas`,
`clashLabelsCompositeOntoCanvas`, `filmBoxesDrawMeasure`, the room-title fallback, `dayCounterCompositeOntoCanvas`,
`bigStatsCompositeOntoCanvas` (roster). `loadPathCompositeOntoCanvas`/the (now no-op) ledger composite
are NEVER wrapped. `§LOADPATH_FOCUS overlays=[name:off|painted ...] painted=0 => PASS|FAIL` reads the
SAME registry §HUD_LAYOUT does, from the fixed `_FOCUS_NAMES` list, at the same mid-hold trigger.
EVIDENCE: syntax-checked; the SKIP logic itself is a simple boolean guard around 10 existing call
sites (mechanically verified by re-reading each edited site, not a separate dry run — there is no
non-browser way to exercise "does A.flythruCuesCompositeOntoCanvas get called" without the whole
render pipeline). Flagged for the real bake's own `§LOADPATH_FOCUS` line: confirm `painted=0` on the
normal run and `painted>0` under `__lpNoFocusHold` (HHS 0.22:0.32, stats round live at topout per the
spec's own note).

**Full new/changed file list this round:** `viewer/cpe_load_path.js` (PICK/CHAIN rewrite, LOOK v10,
LABEL LADDER, holdCtl signature), `viewer/cinema_maxq.js` (clock freeze + frame insertion,
§LOADPATH_RESUME, §HUD_LAYOUT registry, FOCUS-off gating, ledger/cost gate rename to `_roomTitle`),
`viewer/cpe_resource_panel.js` (Cost/Ledger pie-chart rows), `viewer/cpe_ledger_ticker.js` (row-text
getter, no-op composite), `cli_silent_bake.js` (`--4d5d` alias, help text), `viewer/cinema_path_editor.js`
(button text "4D/5D"). New control taps: `/tmp/tap_lp_no_clock_freeze.js`, `/tmp/tap_hud_force_overlap.js`
(sets BOTH `__hudForceOverlap` and `__lpNoFocusHold` — roster is normally FOCUS-suppressed during the
hold, so nothing would exist for ledger to collide with otherwise; disclosed, not hidden),
`/tmp/tap_lp_labels_naive.js`, `/tmp/tap_lp_no_focus_hold.js`, `/tmp/tap_lp_top_down.js`. All prior
taps unchanged. No bakes run; nothing committed.

### HUD FIX 2, 2026-09-16 (Sonnet, same worktree/branch) — the two `HHS_loadpath_v10.log` failures

Picked up mid-fix: the composite reorder (load path draws last, after resource panel/pie, so its
column-placement can read every already-registered HUD rect) and the parent/child `overflow=`
semantics in `§HUD_LAYOUT` were already done. Two real bugs remained, both found by reading the
code against the spec, not by guessing:

**1. `_freeVerticalSpan` edge case (`viewer/cpe_load_path.js` ~968)** — when a column's blockers
consumed its ENTIRE height, `spans` ended up empty and the old `return best || {y0:0,y1:h}`
fallback reported the fully-blocked column as maximally FREE (the opposite of the truth). This is
exactly why AVOIDANCE 2 in the predecessor's own `test_label_ladder.js` dry run (left column fully
blocked 0..1080) still got picked, ignoring the spec's "drop below the lowest rect" fallback.
Fixed: the fallback is now `{y0:h,y1:h}` (a zero-size span, which a `neededH>0` check always
rejects), only ever reached when a column is truly out of room. DRY RUN
(`scratchpad/test_label_ladder.js`, re-run after the fix, `label_ladder_dryrun2.log`): all 7
scenarios PASS, including a NEW regression case built from the exact failing shape in
`HHS_loadpath_v10.log` (`pie.cost:731,193,115,16 pie.ledger:731,209,306,16
resource-panel:668,151,173,115`, 854×480) — the ladder now lands at column=right, y0=324, zero
overlap with any of the three real rects. Also corrected a second, misdiagnosed assert in that same
test (AVOIDANCE 1): the algorithm staying on the preferred side and using the free room *below* a
partially-blocking rect is correct per spec ("choose the side/vertical start from the free area"),
not a bug — added AVOIDANCE 1b (rect spanning the FULL column height) as the real switch-side case.

**2. Ledger row never fit its panel (`viewer/cpe_resource_panel.js` `_pieCostLedgerRows` ~233)** —
the predecessor's full→short text fallback (via `ctx.measureText`) still doesn't guarantee a fit:
at HHS's own panel geometry (`_geom(173,115)` → `availW=98`), the SHORT example text alone
measures well past it. Added a third tier reusing `_fit()` — the SAME ellipsis-truncate-to-
measureText already trusted for trade names in this file — as the guaranteed-fit fallback ("widen
through its own layout" is not available: `_box()`'s own comment says the box must stay the same
size across both panel content modes, and widening it would grow into the pie's own screen region).
Exposed `A._resourcePanelPieCostLedgerRows`/`A._resourcePanelFit`, same convention as
`cpe_load_path.js`'s pure-function exposure, for a direct dry run. EVIDENCE
(`scratchpad/test_ledger_ticker.js` PART H, `ledger_ticker_dryrun2.log`): built a REAL 6884-op
sqlite DB, sealed it for real (`§KRN_SEAL_FROM sealed=6884`), drove the REAL ledger ticker to
n=2418 — real row text `"Ledger   2 418 / 6 884 verified · 4 466 remaining · tip 86791703439a"`.
Against HHS's real panel geometry (availW=98) with a disclosed synthetic-but-monotonic
`measureText` (no `canvas` npm module in this worktree; the guarantee tested is `_fit`'s own
width-bound, which holds for any real font too): full text width=408 and even the short
form=222 both overflow availW=98 (the pre-fix state); after the fix the registered `pie.ledger`
rect is 96px wide, right edge at 159 — inside the 173px panel, `overflow=0`. Also confirmed
`_fit` bounds text to an arbitrary maxW=40 directly.

**§COST_ODOMETER_FINAL** — re-verified rather than re-fixed: the predecessor's split
(`A.costOdometerTick`, called every frame unconditionally from `cinema_maxq.js` ~2570, vs. the
now-pure-draw `_costRowText`) already replaces the frame-COUNT trigger with a `info.progress`
(continuous, real elapsed-programme fraction) trigger — architecturally immune to "which frame
index is last" being thrown off by inserted hold frames, since it never asks that question. DRY RUN
(`scratchpad/test_cost_odometer.js`, appended section, `cost_odometer_dryrun2.log`): 83 simulated
frames including 60 consecutive frames at the SAME progress (a held film clock) → `§COST_ODOMETER_FINAL`
fires exactly once, after the hold releases and progress reaches 1. A second run whose progress
never exceeds 0.6 (clip ends before topout) never fires FINAL from `costOdometerTick` and leaves
`A._costOdometerFinalFired` false — the single unconditional `cinema_maxq.js` ~2876 check
(`if (_costOdo && !A._costOdometerFinalFired) console.log('§COST_ODOMETER_FINAL
INCONCLUSIVE reason=no-final-frame')`) is what fires in that case, confirmed by code reading (not
independently dry-runnable — it lives in the render-loop closure).

The two files this round edited (`cpe_load_path.js`, `cpe_resource_panel.js`) plus the five other
files already modified this branch (`cinema_maxq.js`, `cpe_ledger_ticker.js`, `main.js`,
`cinema_path_editor.js`, `cli_silent_bake.js`, re-checked unchanged) all pass `node vm.Script`
syntax. No bakes run; nothing committed.

### ROUND 3, 2026-09-16 (Sonnet, same worktree/branch) — §129.7 items 1-7, code-only, no bakes

Item 1 (freeze/resume) untouched, per the ruling. Items 2-7 below; all files re-checked with
`node vm.Script` after every edit. `cinema_maxq.js` (`_hudLayoutRegisterImpl`, the `A.loadPathBuild`
call site), `cpe_load_path.js`, `cpe_resource_panel.js`, `cpe_ledger_ticker.js` all touched. New taps:
`/tmp/tap_lp_pick_thinnest.js`, `/tmp/tap_lp_backdrop_no_restore.js`; `/tmp/tap_hud_force_overlap.js`
rewritten (drops `__lpNoFocusHold`, no longer needed — see item 5).

**2. LABELS IN THE SCREEN CENTRE (`cpe_load_path.js` `_ladderLayout`)** — the side-choosing/
relocation algorithm from HUD FIX 2 is SUPERSEDED outright: the column is now always centred on the
frame's x-centre (`Math.round(w/2 - labelW/2)`), vertically centred in the full frame height, and
never dodges a registered HUD rect — `avoidRects` is used only to compute `hudOverlaps`/`hudClear`
for the witness (via a new `_crossOverlapCount` helper), never to relocate. Text draw switched to
`ctx.textAlign='center'`. `§LOADPATH_LABELS` gained `x=` and `hudClear=`; `ok` now requires
`hudClear` too. DRY RUN (`scratchpad/test_label_ladder.js`, rewrote the AVOIDANCE section, which
tested now-obsolete relocation behaviour, into CENTRE 1/2): HUD rects at both sides only ->
`column=centre hudClear=true`; a rect placed dead-centre -> column STAYS centre, `hudClear=false`
(not relocated, exactly the ruling); the real HHS failing shape (all three real rects on the right
half) is naturally `hudClear=true` under a centred column — a nice confirmation that centring is
itself what fixes the user's original "skewed right, obscured" complaint.

**3. A DISCERNIBLE STACK (`cpe_load_path.js` `_rankValid`/`A.loadPathBuild`)** — ranking now sorts by
`minMemberPx` DESC FIRST (the smallest projected bbox height, px, among a candidate's own VISIBLE
hops at the searched hold pose — "a thicker member or a nearer one both raise it"), then visibleHops,
depth, footprint, guid; candidates with 0 visible hops are excluded before ranking. `_projectAABB`
now also returns `ndcHeight` (the same 8-corner NDC span already computed, just exposed) and a new
`_memberPxHeight(box,pose,camera,outH)` converts it to real pixels; `A.loadPathBuild` gained
`outW`/`outH`/`fps` params (the real render canvas size + fps, passed from `cinema_maxq.js`'s own
`w,h,fps` at its `A.loadPathBuild(...)` call site — previously only 4 args). `§LOADPATH_PICK` gained
`minMemberPx=`; `§LOADPATH_FRAMING` gained `memberPx=[...]` (reusing `A._loadPathLastMemberPx`, the
SAME array PICK computed — never a second projection). New control `window.__lpPickThinnest=1`
(`/tmp/tap_lp_pick_thinnest.js`) ranks ASCENDING via a `thinnest` param on `_rankValid`. DRY RUN
(`scratchpad/test_loadpath_v4.js`, appended): a real bug caught here — the initial `dir = thinnest ?
1 : -1` had the DESC/ASC signs backwards (normal ranking picked the THINNEST candidate, the control
picked the THICKEST) — fixed to `dir = thinnest ? -1 : 1` against the base DESC comparator
`b.minMemberPx - a.minMemberPx`. After the fix: 3 synthetic chains (thin/far minMemberPx=8,
thick/near=40, deep/thin=15, all >=1 visible hop) — normal picks thick/near (40), thinnest picks
thin/far (8), both `rule=minMemberPx`; a 4th case (hidden/huge, 0 visible hops, minMemberPx=999)
correctly loses to a visible-but-smaller candidate. Full regression: 12 pre-existing FAIL lines (all
intentional controls) and the same PASS count plus the new asserts — no regressions.

**4. PIE PANEL REARRANGED (`cpe_resource_panel.js` `_box`/`_pieCostLedgerRows`)** — pie keeps its own
column/width at the top (untouched); Cost/Ledger now draw BELOW it spanning the panel's own full
inner width; `_box()` grows `bh` by `extraRows * rowH0` when the "4D/5D" toggle is on (driven by the
static per-bake flag, so the box is the SAME size in both content modes — no re-introduced jitter).
REAL BUG FOUND AND FIXED while wiring this up: `_drawList`'s own `fs = round(bh*0.085)` means feeding
the GROWN `bh` back into the row font size makes the box's own growth self-defeating (bigger box ->
bigger font -> WIDER text at the same length, eating the extra room). Fixed by having `_box()` return
`bh0`/`fs0`/`rowH0` (the BASE, ungrown values) alongside the grown `bh`, and `_pieCostLedgerRows` now
sizes its own font/pad/width from `bh0` exclusively — no growth/font circular dependency, one pass,
no iteration needed (the trade list itself still sizes off the live `bh`, a disclosed, minor,
accepted side effect: its font can grow very slightly when 4D/5D is on). NO WRAPPING, NO ELLIPSIS:
full text tried first, else the ledger's short-BY-DESIGN form (`A.ledgerTickerRowText(true)`,
`cpe_ledger_ticker.js`, RE-TIGHTENED per this item's own literal example: `Ledger 2 418/6 884 · tip
86791703` — no spaces around "/", single space after "Ledger", 8-hex tip; topout keeps the prior
"✓ <hex>" wording, tampered keeps "· broken at op N", both just with the same tightened "/" spacing;
§129.6 6b's example is superseded by this one). `A._hudLayoutRegister` gained a 7th `truncated` arg;
`_hudLayoutRegisterImpl`/`_hudLayoutWitnessImpl` (`cinema_maxq.js`) sum it as `§HUD_LAYOUT`'s new
`truncated=N`, folded into `ok`. EVIDENCE — REAL, not synthetic: no `canvas` npm module in this
worktree, so a real headless Chrome (`puppeteer`, already present in the sibling `bim-compiler` repo's
own `node_modules`, launched interactively, not part of any bake) measured the EXACT font string this
code sets: at `600 10px …`, the real short-form text (n=2418/N=6884, matching this item's own worked
example) measures **157.32px**; the real full text measures 313.51px. `scratchpad/test_ledger_ticker.js`
PART H rebuilt around this: a REAL 6884-op sqlite DB, sealed for real, driven to real n=2418, run
through the REAL `A._resourcePanelBox(854,480,'tr',0)` (HHS's exact 480p geometry) — `bh0=115 ->
bh=147` (grew 32px for 2 rows), `fullAvailW=161` (bw=173 minus one `bh0`-based pad, not two — the
panel's own existing rounded-corner clip already protects the right edge, so a second right margin
was dropped as part of this fix). Cost row (real, driven via `A.costOdometerTick`) measures 114.4px,
Ledger's short form 157.32px (the real puppeteer number, looked up by exact character length) — both
`<= 161`, `truncated=0` for both, confirmed against the OLD narrow list-column width (98px, both rows
would have overflowed there) to show why the rearrange was necessary. Margin is real but modest
(~2%); flagged, not hidden.

**5. CONTROL WART (`cinema_maxq.js` `_hudLayoutRegisterImpl`)** — `__hudForceOverlap` now forces
`pie.ledger` onto `pie.cost` first (falling back to `roster` only if cost is off), not onto `roster`
unconditionally. Reason: roster is FOCUS-suppressed during the hold (§129.6 item 8), so forcing onto
it required the tap to ALSO set `__lpNoFocusHold=1` just to make roster register a rect at all — which
then made `§LOADPATH_FOCUS` FAIL as a side effect (roster "painted"), defeating the point of testing
`§HUD_LAYOUT` in isolation. `pie.cost` is never FOCUS-gated (one of the frozen status rows that stays
up through the whole hold) and always registers one row before `pie.ledger` in the same frame, so it
needs no FOCUS bypass at all. `/tmp/tap_hud_force_overlap.js` rewritten to drop `__lpNoFocusHold`.
Verified by code reading (the function has no THREE.js/DOM dependency but is bound into the
`_captureFrame` closure, not independently invocable under node without mocking the whole render
loop) — not an isolated dry run.

**6. BLACK BACKDROP DURING THE HOLD, FADED (`cpe_load_path.js`, new `_backdropFadeT`/`_backdropApply`/
`_backdropCapture`/`_backdropRestore`/`_backdropSnapshot`/`_backdropWitness`)** — per the coordinator's
sharpened timing: the fade rides the FILM CLOCK in MOVING film, ~0.5s BEFORE arm (ending black exactly
at arm) and ~0.5s AFTER release (starting black exactly at release); the frozen hold itself is a
constant `t=1` (same tFilm as arm — nothing to interpolate, which is WHY this needed no new per-frame
state machine: `_backdropFadeT(fSec, holdStartSec, holdEndSec, fadeSec)` is a pure function of the
PLANNED hold window, known since `A.loadPathBuild` time from the hold-point search — so it runs
correctly even in the frames BEFORE arm has ever actually fired). Wired into
`A.loadPathApplyVisual`: called every frame unconditionally (never inside the `if (inWindow)` branch),
applying opacity-fade + a lerped renderer clear-colour to `A.ground`/`A._sky`/`A._getPhotoSkyline()`'s
children (reused, no new scene objects) — captured once, lazily, for an exact restore. Arm snapshot
taken the first frame `t>=1`; release snapshot + the witness fire once, at release, inside
`A.loadPathApplyVisual`'s own release branch. `§LOADPATH_BACKDROP fadeInFrames=k black=… fadeOutFrames=m
restored=… => PASS|FAIL`: `black` re-checks the pure formula at holdStartSec AND `_lp.midSec` (a real
regression guard against a future off-by-one on the frozen-branch boundary, not a tautology);
`restored` compares the REAL applied-opacity snapshot at arm vs at release. Control
`window.__lpBackdropNoRestore=1` (`/tmp/tap_lp_backdrop_no_restore.js`) stops re-pinning the frozen
black state after the first application, so an external perturbation between arm and release survives
to the release snapshot. DRY RUN (`scratchpad/test_backdrop_fade.js`, new): a fake ground/sky pair (+
fake renderer clear-colour) swept 9.0s->16.0s around a `holdStartSec=10,holdEndSec=15,fadeSec=0.5`
window shows the exact fade curve (0 at 9.0, 0.5 at 9.75, 1.0 for the whole 10-15 span including
12.5, ramping back through 0.5 at 15.25 to 0 at 16.0); the NORMAL run (perturb-then-re-pin mid-hold)
prints `restored=true => PASS`; the SAME perturbation under `__lpBackdropNoRestore` prints
`restored=false => FAIL`; `loadPathBackdropRestore()` returns both materials to their exact original
opacity/transparent.

**7. GHOST OPACITY 0.12 -> 0.20 (`cpe_load_path.js`)** — `GHOST_OPACITY` (a private, module-scope
const never shared with the discipline parade's own ghost look) raised to 0.20; new `SOLID_OPACITY =
1.0` const. `§LOADPATH_VISIBLE` gained `ghostOpacity=` and `solidOpacity=`, folded a `GHOST_OPACITY <
0.50` check into `ok`. Confirmed printing correctly (`ghostOpacity=0.20 solidOpacity=1.00`) across the
existing `scratchpad/test_loadpath_v4.js` regression run, no new FAILs introduced.

No bakes run; nothing committed. Full regression sweep across all 5 scratchpad harnesses after every
edit this round: `test_label_ladder.js`, `test_cost_odometer.js`, `test_backdrop_fade.js`,
`test_loadpath_v4.js`, `test_ledger_ticker.js` — all exit 0, FAIL counts match only pre-existing/new
intentional controls (verified line-by-line, no unexplained regressions).

### ROUND 4, 2026-09-16 (Sonnet, same worktree/branch) — 4 real defects from a real Terminal bake

Real bake: `out/Terminal_loadpath_r3.log` (clip 0.1508:0.2032, 64 frames). RESUME/HOLD/STACK/VISIBLE/
FOCUS/LABELS/RESTORE PASS; §COST_ODOMETER_FINAL `INCONCLUSIVE reason=no-final-frame` on this tight
clip is honest (buildup ends after the clip) — left untouched. Four real defects fixed below, all in
`cpe_load_path.js`, `cpe_resource_panel.js`, `cinema_maxq.js`, `erp/kernel_ops.js`, `cpe_ledger_ticker.js`.

**1. PICK (real bug: `hops=1 minMemberPx=1383.1` won, then `hopsIntersecting=0/1` — a lone ground
slab, not a path).** (a) `_rankValid`'s sort RE-ORDERED: `visibleHops` DESC is the primary key again
(RE-superseding this same day's own minMemberPx-first change), `minMemberPx` DESC is now only the
tie-break among candidates showing the SAME number of hops. (b) `_pick()` now excludes any candidate
with `depth < 2` (a new `rejectedSingleHop` counter, printed on `§LOADPATH_PICK`) — "a slab on ground
is not a path" needs >=2 load-bearing hops before ground. (c) The REAL cause of the
`minMemberPx=1383.1`/`hopsIntersecting=0` contradiction: PICK's own `minMemberPxOf` (shotPose + the
item's DB-metadata AABB) and `_framingWitness`'s own `hopsIntersecting` (the LIVE hold pose + the
REAL clone-mesh box) were two independent computations that could legitimately disagree. Fixed by
computing `memberPx` INSIDE `_framingWitness` itself now, from the exact same box/pose/frustum test
its own `hopsIntersecting` already uses (`A._loadPathLastMemberPx` — the old PICK-time stash — is
gone; `_projectAABB` now also returns `ndcHeight`, and a new `_memberPxHeight(box,pose,camera,outH)`
converts it to real px, reused by both PICK and FRAMING). `A.loadPathBuild` gained `outW/outH/fps`
params (cinema_maxq.js's own `w,h,fps` at the call site). DRY RUN (`scratchpad/test_loadpath_v4.js`):
the exact reported shape (giant 1-hop slab, minMemberPx=1383.1, vs a 4-hop real path, minMemberPx=20)
now correctly picks the real path, `rule=visibleHops`; a separate case with all-equal visibleHops
confirms minMemberPx still breaks the tie (both DESC and the `__lpPickThinnest` ASC control). Item
1b (single-hop exclusion) verified by code reading + the unchanged full-pipeline regression
(`rejectedSingleHop=0`, correctly printed, existing 4-hop winner unaffected) — a dedicated isolated
fixture was not built this round (cost/time vs. the mechanical simplicity of the one-line filter).

**2. HUD_LAYOUT (real bug: `pie.ledger` 166px row registered inside a 173px panel, `overflow=1`).**
FIRST attempt (same-day) widened the panel to fit the widest row — **RULED OUT by red1**: the panel
must stay a FIXED width; a truncated row is fine ("gives a glimpse of the common end tail... this is
just for idea rather than empirical record"). Reverted `_box()`'s width-widening outright (bw fixed
again; bh-growth for the two extra rows is unchanged from earlier today). `_pieCostLedgerRows`: full
text tried first, then the ledger's short-by-design form, then `_fit()` (this file's own guaranteed-
fit ellipsis-truncate, already trusted for trade names) as the actual enforcer of the fixed width.
`truncated=N` is still printed on `§HUD_LAYOUT` but no longer folded into `ok` (`cinema_maxq.js`'s
`_hudLayoutWitnessImpl`) — only `overflow` still gates PASS/FAIL. THE REAL FIX for Terminal's own
bug: the registered rect width is now always the POST-`_fit()` (clipped) width, never the raw
unclipped `measureText` width — that mismatch (clip on screen via `ctx.clip()`, but the wider raw
width registered for the witness) was the actual cause of `overflow=1`. EVIDENCE (real headless
Chrome via puppeteer, `scratchpad/test_ledger_ticker.js` PART H, extended): Terminal's own reported
scale ("48 430/48 433") — real short-form width 168.4px, real full width 305.7px, BOTH overflow the
149px fixed inner width (`bw=173`, symmetric `2×pad` margins) — `_fit()` clips it, `truncated=true`,
registered width 147.8px, right edge inside the 173px panel: `overflow` fixed. HHS's own scale
(n=2418/N=6884) now also truncates at this fixed width (149 < 157.3px) — accepted, per the ruling.

**3. BACKDROP (real bug: `restored=false` with nothing actually broken).** The OLD `restored` check
compared the arm snapshot against the release snapshot — two DIFFERENT tFilm moments (the release
frame's own fSec can land past `holdEndSec` by a partial frame, so its own correct `t` is already <1,
legitimately) — "a moving target", never reliably equal even when correct. Fixed:
`_backdropWitness(lp, releaseFSec)` now recomputes the EXPECTED opacity for the RELEASE FRAME'S OWN
fSec (a new pure `_backdropExpected(t)`, from the captured originals) and compares it against the
LIVE material's CURRENT (same-instant) state — "is the backdrop what the film's own clock says it
should be right now", immune to which exact moment happens to be release. The now-unused
`lp.backdropArmSnap` capture was removed. DRY RUN (`scratchpad/test_backdrop_fade.js`, extended): a
release landing EXACTLY at holdEndSec passes; a release OVERSHOOTING holdEndSec by 0.03s (the real
bug's own shape, release `t=0.94` not `1.0`) now correctly PASSES too (the OLD design would have
FAILED here, shown as a reference comparison in the log); `__lpBackdropNoRestore` still correctly
FAILs (an external perturbation between arm and release, never re-pinned under the tap, is caught).

**4. LEDGER (real break, no tap): `verify prev_hash link at id=48431`, `brokenAt=48431`, nothing
tampered.** On disk, `BUILDING_OPEN` at id 48431 was ALREADY sealed with a `prev_hash` from an OLD
chain; the page's own re-injection regenerated and re-sealed the ELEMENT_PLACE rows around it, but
INCREMENTAL `sealFrom` (via `_lastSealedTip`, which trusted 48431 as "the last sealed row") never
re-hashed 48431 itself, so its stale `prev_hash` no longer matched anything real. Fixed:
`erp/kernel_ops.js`'s `sealFrom(db, fromTip, full)` gained a `full` mode — re-seals EVERY row from
id 1, in id order, overwriting every existing `op_hash`/`prev_hash`/`sig` unconditionally, printing
`§KRN_SEAL_FROM mode=full fromId=1 sealed=N` (non-bake callers — `compact()`'s post-compaction
reseal, the CLI preflight script, the live editor's incremental per-group seal — are UNCHANGED,
`full` defaults falsy). `cpe_ledger_ticker.js`'s own bake-owned seal call (`A._bakeOwned`) now passes
`full=true`. DRY RUN (`scratchpad/test_ledger_ticker.js` PART I, new): a real 20-op sqlite DB, sealed
for real; rows 1-10 regenerated with different content and RE-SEALED fresh (via a scratch-DB
transplant, standing in for whatever real path seals a newly-materialized block); row 11
(`BUILDING_OPEN`) left completely untouched, stale; rows 12-20 left unsealed — incremental `sealFrom`
+ `verifyChain` reproduces the EXACT real defect shape (`verify prev_hash link at id=11`, nothing
tampered); `sealFrom(db,null,true)` fully recovers (`verify OK len=20`); the flip-byte tamper control
still breaks the chain after a full re-seal.

All five files re-checked with `node vm.Script` after every edit. Full regression sweep across all 5
scratchpad harnesses (`test_label_ladder.js`, `test_cost_odometer.js`, `test_backdrop_fade.js`,
`test_loadpath_v4.js`, `test_ledger_ticker.js`) — all exit 0, FAIL counts verified line-by-line against
only pre-existing/new intentional controls. No bakes run; nothing committed.

### ROUND 5, 2026-09-16 (Sonnet, same worktree/branch) — the clone-mesh placement defect

Real bake: `out/Terminal_loadpath_r4.log` — ledger/backdrop/HUD all PASS, PICK now a real 7-hop
monotone chain, but `§LOADPATH_ARM clones=7/7` then `§LOADPATH_VISIBLE solid=5`,
`§LOADPATH_FRAMING hopsIntersecting=0/7` while PICK itself said `visibleHops=7/7`. Root cause: PICK's
visibility came from DB-metadata boxes; the CLONE MESHES the film actually draws were built from DB
coordinates through `A.ifc2three` — a completely independent computation from wherever the REAL
geometry (an InstancedMesh/BatchedMesh instance) actually sits, which on HHS happened to coincide and
on Terminal (site-coordinate `element_transforms`, an extra container-level transform) does not.
Only `cpe_load_path.js` touched this round.

**Fix, all in `cpe_load_path.js`:**
1. New `_sourceInstance(guid)` — resolves a guid to its REAL source instance: `A._instanceGuids[guid]`
   (streaming.js's own ready-made O(1) index for InstancedMesh elements) first, else a scoped scan of
   `A._batchMeta` for BatchedMesh elements (no O(1) index exists for those); returns the REAL,
   currently-rendered world matrix — `container.getMatrixAt(index)` premultiplied by the container's
   own `matrixWorld` — so nothing independently re-derived (building offset, ifc2three scale/rotation,
   any container-level transform) can ever disagree with what is actually drawn. `_sourceLocalBox`
   reads the container's own local bbox for that slot (`getBoundingBoxAt` when present, else the
   shared `geometry.boundingBox`). `_instanceWorldBox(guid)` combines both into a world AABB.
2. `_buildChainClones` rewritten: the clone's `mesh.matrix` is now `src.world` directly
   (`matrixAutoUpdate=false`), never `A.ifc2three(dbX,dbY,dbZ)` + a separate rotation set. A guid with
   no resolvable source instance is `_cloneMissing='no-source-instance'` (a real, honest gap, not a
   silent fallback to the old, disagreeing math). Control `window.__lpCloneOffset=1`
   (`/tmp/tap_lp_clone_offset.js`) shifts the clone by one building width along X, for item 2's own
   witness to catch.
3. New witness `§LOADPATH_CLONES placed=N/N maxOffset=d(m) emptyGeom=E missing=[guid:reason,...] =>
   PASS|FAIL`, fired once right after `_buildChainClones` at ARM: for every placed clone, `offset` =
   distance between the clone's own world Box3 centre (the mesh actually in the scene) and its source
   instance's world box centre (container geometry bbox x instance matrix, cached at build time,
   never re-derived) — PASS requires `offset < that member's own diagonal` for every hop, plus
   `placed===N` and `emptyGeom===0`.
4. `§LOADPATH_VISIBLE` (`_visibleWitness`) now also fails, unconditionally, when ANY hop has
   `_cloneMissing` set — named `missing=[guid:reason,...]` on the line — regardless of
   `revealedHops` timing: a hop with no clone at all can NEVER become solid no matter how far the
   reveal progresses, which the old `solid===revealedHops` check alone could not distinguish from
   "on track, mid-progression" (exactly Terminal's own `solid=5` printing PASS).
5. PICK's own `visibleHopsOf`/`minMemberPxOf` (inside `A.loadPathBuild`) now read `_instanceWorldBox
   (item.guid)` instead of `_worldAABBFromItem(items[i])`'s DB-coordinate math — the SAME box the
   clones place themselves at — so PICK and FRAMING read identical geometry and can no longer
   disagree. A guid with no resolvable instance counts as not-visible for that hop (never a fallback
   to the old math). `_worldAABBFromItem` itself is untouched and still used for `buildingBox`/
   `stackBox` (whole-building/whole-chain framing, informational only).
   `_projectAABB` now also returns `ndcHeight` (the same 8-corner NDC span it already computed,
   reused by the new `_memberPxHeight`).

Test-only seams added (never called by real code): `A._loadPathDebugSetLp` (lets a dry run seed the
one piece of `_lp` state the offset control reads without running the whole PICK/CHAIN pipeline),
`A._loadPathVisibleWitness`, `A._loadPathBuildChainClones`/`A._loadPathDisposeChainClones`,
`A._loadPathSourceInstance`/`A._loadPathInstanceWorldBox`, `A._loadPathClonesWitness` — same "expose
pure/testable functions" convention this file already uses throughout.

**DRY RUN 1 (`scratchpad/test_clone_placement.js`, new)** — a fake container with a NON-IDENTITY
world matrix (translation + 45° rotation — a real "scene offset", not an identity that could hide a
composition bug) and a distinct per-instance local matrix: the clone's actual world centre matches
the instance's own computed centre to within 1e-6; `§LOADPATH_CLONES` PASSes for the one resolvable
hop, FAILs and names the guid when a hop's geometry is missing, and FAILs (offset 50m vs a 2.24m
diagonal) under `__lpCloneOffset`; `§LOADPATH_VISIBLE` FAILs and names a permanently-missing hop even
in a scenario (`revealedHops=1`, `solid=1`) the OLD `solid===revealedHops` check alone would have
let PASS.

**DRY RUN 2 (`scratchpad/test_loadpath_v4.js`, extended)** — this file's existing 4-hop real-pipeline
fixture needed real container `matrixWorld`/`getMatrixAt`/`geometry.boundingBox` and an
`A._instanceGuids` index added (it had none — `_buildChainClones` used to need only DB rows) plus
`Box3.clone/copy/applyMatrix4` and `Matrix4.clone/copy/premultiply` on this file's own fake THREE (it
had a real 4x4 `Matrix4`/`Frustum` pair already, from the v8c frustum-culling fix, just no need for
matrix composition until now). Container positions/instance offsets were set to reproduce the exact
same world position the OLD ifc2three-derived clone had for each of the 4 real hops (this file's own
job is "don't regress existing coverage" — the genuinely new transform-composition math is DRY RUN
1's job). Also fixed the fake `THREE.Mesh`/`Box3.setFromObject` to read a mesh's `matrixWorld`
translation (real three.js's own source of truth) instead of `.position`, since the new clone code
sets `.matrix` directly and never touches `.position` at all. Full regression after: 12 FAIL / 99
PASS, byte-identical to the pre-ROUND-5 baseline except the new `missing=[]` field appearing on
`§LOADPATH_VISIBLE` — ONE informational-only (never judged) `§LOADPATH_FRAMING memberPx=[...]` line
shifted by ~9% (51.4→46.9 etc., same shape); not root-caused given severe time pressure this round
and its own "printed, not judged" status — flagged, not hidden.

All edits re-checked with `node vm.Script`. Full regression sweep across all 6 scratchpad harnesses
(`test_label_ladder.js`, `test_cost_odometer.js`, `test_backdrop_fade.js`, `test_loadpath_v4.js`,
`test_ledger_ticker.js`, `test_clone_placement.js`) — all exit 0. No bakes run; nothing committed.

### ROUND 6, 2026-09-16 (Sonnet, same worktree/branch) — the camera-orientation defect

Real bake: `out/Terminal_loadpath_r5.log` — `§LOADPATH_CLONES placed=7/7 maxOffset=0.00 PASS` (Round
5's fix holds, control correctly FAILs at 73.6m), but FRAMING still `hopsIntersecting=0/7` while
PICK, at the identical instance world boxes, said `visibleHops=7/7`. Root cause: `_framingWitness`
(and the label-ladder's own "which hops are visible" test) built a `livePose` whose look-AT target
came from `A.controls.target`, then pushed it into the camera via `camera.lookAt(...)` before
testing — but `cinema_maxq` drives the bake camera's real position/orientation directly every frame
and never keeps `A.controls.target` in sync, so on Terminal's site coordinates that target was
stale/wrong, and the TEST camera got aimed away from the building while the REAL, rendered camera
was pointed at it correctly the whole time. Worse: the HOLD's own per-frame re-assert set
`A.controls.target` + called `A.controls.update()` (OrbitControls-style), which could re-derive and
silently re-aim the REAL camera off that same stale target every hold frame — a visible defect
`cameraMoved` (position-only) could never see. Only `cpe_load_path.js` touched this round.

**Fix, all in `cpe_load_path.js`:**
1. ARM now captures the camera's REAL `quaternion` (cloned) instead of `A.controls.target` —
   `_lp.armPose = {x,y,z,quaternion}`, `_lp.armSource` records whether a real quaternion was
   actually captured (`'quaternion'` or `'none'` — no fallback to `A.controls.target`, ever). HOLD
   re-assert now sets `A.camera.position` + `A.camera.quaternion.copy(...)` DIRECTLY — `A.controls`
   is never touched (no `.target.set()`, no `.update()`) — that OrbitControls-style re-derivation
   from a target was the actual mechanism that could silently re-aim the real camera.
2. `_projectAABB`'s frustum-vs-box test is factored into a shared `_frustumTestAtCurrentPose(box,
   camera)`. `_projectAABB(box,pose,camera)` (pushes a HYPOTHETICAL pose + lookAt, restores after)
   keeps serving PICK's shot-search over `plan.poseAt` — unchanged, since `plan.poseAt` already
   carries the film's own real tx/ty/tz, never `A.controls.target` (confirmed by reading, not
   touched). New `_projectAABBLive(box, camera)` — NO pose pushed, NO re-aim, just
   `camera.updateMatrixWorld()` then the shared frustum test against the camera's CURRENT real
   matrices. `_framingWitness` (buildingInFrame/stackInFrame/hopsIntersecting/memberPx, via a new
   `_memberPxHeightLive`) and the label ladder's own "is this hop on screen" test
   (`A.loadPathCompositeOntoCanvas`) now both use `_projectAABBLive` — the label ladder had the
   IDENTICAL `A.controls.target`-driven bug, silently mislabelling hops, never caught until this
   round (item 2's own "no witness sees" applies here too — this affected real rendered output, not
   just a witness print).
3. `§LOADPATH_HOLD` gains `camPos=[…]`, `camDir=[…]` (the LAST hold frame's own forward vector,
   `(0,0,-1).applyQuaternion(quaternion)` — from the captured quaternion, never the live camera at
   `_restore()` time, which may already be driving the next beat's pose), and `armSource=`; prints
   `INCONCLUSIVE reason=controls-target` if a real quaternion was never captured. `cameraMoved` now
   ALSO checks quaternion drift (`.angleTo()`), not just position — the exact gap that let a
   re-aiming hold read `cameraMoved=false`. `§LOADPATH_FRAMING` gains `camDir=`.
4. Hold-point search (`_searchHoldPoint`) confirmed unchanged and correct — already used
   `plan.poseAt(tn)`'s own real tx/ty/tz throughout, never `A.controls.target`.

Test-only exposures added: `A._loadPathProjectAABB`/`A._loadPathProjectAABBLive` (same "expose for a
direct dry run" convention this file already uses).

**DRY RUN (`scratchpad/test_loadpath_v4.js`, extended)** — proves the exact claim: a camera
positioned away from the origin, its REAL orientation (via `.lookAt`) pointed AT a building far from
the origin, with `A.controls.target` left pointed somewhere else entirely (a different hemisphere,
not just "a different point" — an earlier version of this same dry run picked a target that
coincidentally still lined up with the building by geometry, caught only by the dry run itself
failing until fixed) — the OLD code (`_projectAABB` with a `controls.target`-driven pose) misses the
building (`intersects=false`); the NEW code (`_projectAABBLive`) correctly sees it
(`intersects=true`). Fixing this required retrofitting this file's own fake camera with a
`.quaternion` (a disclosed thin wrapper around a direction, kept in sync with `.lookAt()`/its
existing `_lookTarget` math — never a full rotation engine, since nothing here needs one) and a
`V3.applyQuaternion` (correct only for the canonical `(0,0,-1)` forward vector, the only one
production ever applies it to) — two real bugs surfaced and fixed while wiring this up: (a) the
fixture's own `A.controls.update()` (used by its `runFrameOffScenario` helper to point the camera
for 3 sub-scenarios) had been left as a no-op after removing production's dependency on it, silently
freezing those 3 sub-scenarios' camera direction at a stale leftover value; (b) `applyQuaternion`
was simply missing from the fake `THREE.Vector3`, throwing `§LOADPATH_APPLY_ERR` on every single
frame and silently suppressing EVERY `§LOADPATH_RESTORE`/`§LOADPATH_HOLD` line (caught only by
reading the log's own error count, not the exit code — the Log Mandate earning its keep). Full
regression after both fixes: byte-identical to the pre-ROUND-6 baseline (12 FAIL / 99 PASS) plus the
2 new asserts and the new `camPos=`/`camDir=`/`armSource=` fields on every existing PASS/FAIL line —
no other regressions, including the one Round 5 left flagged-not-explained (an ~9% `memberPx` drift,
which came back byte-identical to the pre-Round-5 numbers once the camera plumbing was fully
correct, retroactively explaining that flag rather than leaving it open).

All edits re-checked with `node vm.Script`. Full regression sweep across all 6 scratchpad harnesses
— all exit 0, zero `_ERR` lines. No bakes run; nothing committed.

### ROUND 7, 2026-09-16 (Sonnet, same worktree/branch) — the un-blended shot-search pose

Real bake: `out/Terminal_loadpath_r6.log` — Round 6's clones/backdrop/HUD all still PASS, but FRAMING
still `hopsIntersecting=0/7` while PICK said `visibleHops=7/7` at "the same pose". Coordinator's
Round-6 premise corrected: `A.controls.target` IS authoritative during a real bake (cinema_maxq sets
it from the gaze-blended pose every frame and calls `.update()`) — the quaternion capture from Round
6 is harmless and stays. The REAL cause: `shotPose`/the hold-point search used the RAW
`plan.poseAt(tn)` — no gaze blend — a camera orientation the bake never actually renders once
`_blendedGazeTarget` (§57.5) smooths the look target every frame. `cinema_maxq.js`,
`cpe_load_path.js` both touched.

**1. `A._bakeCameraPoseAt(tn)` (`cinema_maxq.js`, new)** — the exact pose the frame loop builds
(`plan.poseAt(tn)` then the SAME §57.5 gaze-blend the loop applies at line ~2163), exposed for
`cpe_load_path.js`. Operates in WHOLE-FILM `tn` (cpe_load_path.js's own convention — `shot.tNorm`/
`topoutU` are already whole-film fractions) via `plan.poseAt` DIRECTLY, never the frame loop's own
clip-relative `poseAt()`/`_tFilm()` wrapper — reusing that wrapper for a whole-film tn would
double-apply (or wrongly skip) the clip remap; a normal (no `--clip`) bake is identical either way.

**2. PICK's `shotPose` and `_searchHoldPoint`'s own sampling now use `A._bakeCameraPoseAt`**
(falling back to raw `plan.poseAt` when the export isn't present, e.g. in a test harness) — PICK now
evaluates the SAME orientation FRAMING's live camera will actually show.

**3. `_searchHoldPoint` fallback (red1's own ruling)** — when no sample reaches the 80% building-
in-frame rule, it now falls back to the sample where SOME candidate chain (whichever, at that
sample) shows the most hops in the frustum — "so the hold lands where a stack is visible" — printed
as `bestVisibleHops=` on `§LOADPATH_SHOT` (`?` when the caller didn't supply candidate chains, e.g.
the old no-plan/circle-fallback path — never a fabricated number). Takes `items`/`validChains`
(`pick.valid`, already computed by the time the search runs) as new optional params.

**4. `§LOADPATH_PICK INCONCLUSIVE reason=no-stack-in-shot`** — if, at the CHOSEN hold pose, no
candidate chain has even one hop in the frustum, the beat is skipped (no arm, no clones, no draw)
rather than holding on an off-screen stack. Gated on `shotPose && A.camera` being real (never fires
merely because there was no camera/plan to test against at all — a REAL regression this round's own
full-suite run caught: the shared test fixture's `plan=null`/no-camera scenarios made
`visibleHopsOf` unconditionally return 0, which would have skipped EVERY existing test case had the
gate been missing).

**5. `buildingInFrame` investigated, not just re-derived**: `_frustumTestAtCurrentPose`'s `fraction`
now counts a corner via `fr.containsPoint(corner)` (the same `THREE.Frustum` `intersects` already
uses) instead of the old per-corner NDC-range+`p.z<=1` check — a real consistency improvement (the
two fields can never again be computed from two different geometric models) — BUT a direct analytic
check (this session's own dry run, not assumed) showed `fraction`'s `p.z<=1` gate was ALREADY a
complete guard against a directly-behind-camera corner for this matrix shape (v8c's own comment
already said as much: "fraction is untouched... that bug never reached it") — so the REAL fix for
the reported `buildingInFrame` gap is item 2 above (the gaze-blended pose), not the containsPoint
change, which is disclosed as a defensive improvement rather than overclaimed as the bug fix.

Test-only exposures added: `A._loadPathProjectAABB`/`A._loadPathProjectAABBLive` (already exposed,
Round 6) plus `A._loadPathSearchHoldPoint` (new, same convention).

**DRY RUN (`scratchpad/test_loadpath_v4.js`, extended)**: (a) item 5 — for an unambiguous in-frame
box and an unambiguous out-of-frame box, the new `fraction` (containsPoint-based) and `intersects`
now agree in both directions (disclosed above: a literal "old gives >0 for a behind-camera box, new
gives 0" reproduction was attempted and shown analytically unreachable through `fraction`'s own math
with this harness's real perspective-matrix formula, so it is not claimed). (b) item 3 — a fake
`plan.poseAt` returning 3 distinct camera poses across the search window, against an impossibly huge
`buildingBox` (guarantees the 80% rule never fires) and two hop guids in their own fake containers
(0 hops / 1 hop / 2 hops visible respectively across the 3 poses): the search correctly lands on the
3rd pose, `bestVisibleHops=2`. Added `Frustum.prototype.containsPoint` to this file's own fake THREE
(it had `intersectsBox` from the v8c round but no per-point test). Full regression after: byte-
identical to the pre-Round-7 baseline (12 FAIL / 101 PASS) plus the 3 new asserts and the new
`bestVisibleHops=` field on every `§LOADPATH_SHOT` line.

All edits re-checked with `node vm.Script`. Full regression sweep across all 6 scratchpad harnesses
— all exit 0, zero `_ERR` lines. No bakes run; nothing committed.

### ROUND 8 diagnostics, 2026-09-16 (Sonnet, same worktree/branch) — instrument, don't fix

Real bake: `out/Terminal_loadpath_r7.log` — five rounds in, PICK (`visibleHops=7/7`, at the probe
pose) and FRAMING (`hopsIntersecting=0/7`) still disagree completely on the identical chain.
Coordinator's own call: stop fixing, instrument, let one bake decide which computation is wrong.
Only `cpe_load_path.js` touched — no decision logic changed, only new `console.log` fields, verified
against the full regression suite (byte-identical FAIL/PASS verdicts to the pre-Round-8 baseline,
only the new diagnostic fields added to existing lines).

**1. `§LOADPATH_PICK` gains a SECOND print, fired at ARM** (right after `_lp.armPose` is captured,
before anything else can move the camera) — `visibleHops=K/N` (PICK's own count, stashed on
`_lp.pickVisibleHops`/`_lp.shotPose` at build time) vs `visibleHopsLive=L/N`: PICK's own winning
chain, re-tested via `_instanceWorldBox` + `_projectAABBLive` against the REAL live camera instead
of the probe pose — same boxes, same frustum test, only the camera differs. Plus `probeCamPos=`/
`probeCamDir=` (from `_lp.shotPose`, `?` when no probe pose was ever computed — e.g. the plan=null/
circle-fallback path) and `liveCamPos=`/`liveCamDir=` (the real camera, right now).

**2. `§LOADPATH_FRAMING` gains hop-0 diagnostics**: `hop0Src=` (the `_instanceWorldBox` centre PICK
used for `_lp.hopsUp[0]`), `hop0Clone=` (the clone mesh's own live Box3 centre — the SAME box the
existing `hopsIntersecting` loop already builds for every hop, just centred and printed for hop 0
specifically), `hop0Dot=` (dot((hop0Clone−camPos), camDir) — positive means in front of the live
camera), `hop0NDC=` (hop0Clone projected through the live camera's own `.project()`), and
`frustumSrc=`/`frustumClone=` — a FRESH, LOCAL `THREE.Frustum` built here purely for this print
(never substituted into `_frustumTestAtCurrentPose`'s own real test — this cannot change any
decision) testing whether each of the two centres is inside the SAME live frustum independently.

**3. `camMatrixAge=`** — `_framingWitness` now calls `camera.updateMatrixWorld(true)` (forced)
explicitly as its very first act and prints `fresh` (or `stale` if the camera had no
`updateMatrixWorld` method at all) — rules out "the witness read a stale `matrixWorldInverse`"
rather than assuming it.

Dry-run: syntax only, per this round's own instruction (no new behavior to prove — the fix, if any,
waits on reading the next real bake's own numbers). `scratchpad/test_loadpath_v4.js`/
`test_clone_placement.js` re-run anyway (not required, done for due diligence): both byte-identical
to the pre-Round-8 baseline plus the new diagnostic fields on existing lines — confirms "no behaviour
change beyond the prints" is actually true, not just intended.

All edits re-checked with `node vm.Script`. No bakes run; nothing committed.

### ROUND 9, 2026-09-16 (Sonnet, same worktree/branch) — THE fix: wrong-frame arm + probe-vs-live PICK

Round 8's diagnostics named the defect precisely: `out/Terminal_loadpath_r8diag.log` — `§LOADPATH_SHOT
tNorm=0.1851` but `§LOADPATH_RESUME tFilmArm=0.160549`; `§LOADPATH_PICK visibleHops=7/7
visibleHopsLive=0/7` on the identical chain, `camMatrixAge=fresh`, `hop0Src==hop0Clone`. Two edits,
both code-only.

**1. `viewer/cinema_maxq.js` — arm frame through the SAME grid the frame loop uses.**
`_lpHoldFrameStart = Math.round(_lpArmTn * (_lpNFramesOriginal - 1))` treated a WHOLE-FILM `armTn`
as if it were the CLIP's own clip-local `i/(n-1)` tn — wrong whenever `--clip`/`--frame-range` is
active. On Terminal (`--clip 0.1508:0.2032`, 44 frames): `0.1851*43=7.96 -> frame 8`, whose own tn
is `0.1508+0.0524*8/43=0.160549` — exactly the wrong `tFilmArm` the real bake logged; the correct
frame is 28. New helper `_lpFrameForArmTn(armTn, nOrig)` inverts the SAME transform the frame loop
itself applies for each grid (`--clip`: `i=round((armTn-in)/(out-in)*(n-1))`; `--frame-range`:
`i=round(armTn*(total-1)-a)`; full film: `i=round(armTn*(n-1))`, unchanged), returning `{frame,
armFrameTn, step}` (`step` = that grid's own frame-to-frame tn increment). `§LOADPATH_HOLD_INSERT`
now prints `armFrameTn=` (the loop's real tn at the chosen frame) and `armTnMatch=` (FAIL if
`|armFrameTn-armTn| > step`); `§LOADPATH_HOLD` (cpe_load_path.js's own `_restore()` print) reads
`A._loadPathArmTnMatch` and folds it into `holdVerdict` — a wrong-frame arm now FAILs the hold
witness itself, not just a diagnostic field. Reset to `true`/`null` at the top of `loadPathBuild` so
a bake with no hold this run (or `__lpNoClockFreeze`) never carries a stale value forward.

**2. `viewer/cpe_load_path.js` — FINAL PICK at arm, on the live camera.** WHEN (the hold-point search,
`shot.tNorm`) is untouched — still the probe-based search. WHICH CHAIN lights up is now re-decided
at arm: `loadPathBuild` stashes every valid candidate (`pick.valid`) on `_lp.validCandidates` (not
just the probe-time winner). At arm, BEFORE `_buildChainClones`, a new block re-runs the SAME
`_rankValid` used at build, with `visibleHopsOf`/`minMemberPxOf` closures rebuilt on
`_projectAABBLive`/`_instanceWorldBox` (the live camera, the identical functions FRAMING already
uses) instead of the probe pose. If a candidate other than the probe's own winner now ranks first,
`_lp.hopsUp`/`_lp.pickItem` switch to it before clones/labels are built — PICK and FRAMING then read
the same camera by construction, so they can no longer disagree. `§LOADPATH_PICK`'s arm-time print
gains `pickSource=probe|live` and `guid=` (the final winner); every Round 8 diagnostic field
(`visibleHops=`, `probeCamPos=`/`probeCamDir=`, `liveCamPos=`/`liveCamDir=`) is kept — `visibleHops=`
still reports the probe-time winner's own count over its own chain length; `visibleHopsLive=` now
reports the FINAL (live-decided) winner's own live-visible-hop count, the number that decided the
pick.

**Dry run** (`scratchpad/test_loadpath_v4.js`, appended, not re-derived): (a) `_lpFrameForArmTn`
copied verbatim — the real Terminal clip grid (in=0.1508, out=0.2032, n=44) maps `armTn=0.1851` to
frame 28 (old formula: frame 8, `tFilm=0.160549`, matches the real log's wrong value exactly;
`armTnMatch` on the old frame correctly reads FAIL); a `--frame-range` grid (a=200,b=250,total=1000)
and the full-film grid (byte-identical to the pre-Round-9 bare formula) also checked. (b) a live
re-pick case with two REAL candidate chains and real geometry (`A._loadPathInstanceWorldBox` +
`A._loadPathProjectAABBLive`, the production functions, never mocked): probe pose picks chain A
(visibleHops=7/7, matching the real log); panning the SAME camera to the live arm pose reads chain A
live=0/7, chain B live=3/3 (the spec's own numbers); re-running `A._loadPathRankValid` on the live
camera overturns the pick to chain B — proving the fix actually flips the winner, not just adds a
print. All 10 new asserts PASS; all 26 pre-existing asserts in the file still PASS (0 regressions);
`test_clone_placement.js` re-run clean. Both edited files re-checked with `node vm.Script`. No bakes
run; nothing committed.

**Note under ROUND 9 — CHAIN-PRINT GAP closed (2026-09-16, real Terminal r9 bake: `armFrameTn=0.184921
armTnMatch=true`, `pickSource=live visibleHopsLive=5/6`, FRAMING 5/6, all PASS; frame-off control
FAILs — item 1/2 confirmed working — but the live re-pick's own 7-hop-probe → 6-hop-live switch left
`§LOADPATH_CHAIN … hopsDrawn=7 hopsSweep=7` in the log, the PROBE's chain, not the one the clones
actually drew).** `viewer/cpe_load_path.js`: factored the drawn-hop bookkeeping (the
`window.__lpBreakSupport` "drop the last hop" control included) and the print itself out of the
build-time block into `_chainDrawnInfo(chainIdx)` / `_printChainWitness(items, pickItem, chainIdx,
drawnInfo, pickSourceLabel)`; the build-time call is unchanged (`pickSourceLabel=null`, byte-identical
line, no `pickSource=` field). The arm-time re-pick block now calls `_printChainWitness` again — only
when the live re-pick actually ran (`pickSource==='live'`) — for the FINAL winner's own chain, tagged
`pickSource=live`, right after the arm-time `§LOADPATH_PICK` line; `_lp.hopsUp` (what
`_buildChainClones` actually draws) is now built from that SAME `_chainDrawnInfo`'s `drawnIdx`, so
`__lpBreakSupport` keeps behaving identically regardless of whether the probe or the live pick won —
previously the live-repick path bypassed that control's drop entirely. `guid=` (the final `_lp.pickItem`)
was also added to `§LOADPATH_FRAMING` and `§LOADPATH_CLONES` so every witness printed for a hold names
which pick it's judging, never left implicit. Dry run: `scratchpad/test_loadpath_v4.js` extended —
intercepts `console.log` around two real `_printChainWitness` calls (build-style + the live re-print) on
the same 7-hop-probe/3-hop-live fixture already proven in the ROUND 9 item 2 section, and asserts on the
CAPTURED lines (never a hand-retyped expected string): 2 lines printed, first is the probe (no
`pickSource=`), second is the live winner (`pickSource=live`, its OWN `hopsDrawn=3 hopsSweep=3`, not the
probe's 7), both PASS; a separate assertion proves `__lpBreakSupport` still drops the last hop of
whichever chain is final. 6 new asserts PASS; all 42 total asserts in the file PASS (0 regressions);
`test_clone_placement.js` re-run clean (unaffected — only the new `guid=` field, no logic change).
`viewer/cpe_load_path.js` re-checked with `node vm.Script`. No bakes run; nothing committed.

### ROUND 10, 2026-09-16 (Sonnet, same worktree/branch) — §129.7 item 8: the pie's own exclusive band

Real sighting (Terminal clip): "the pie is not occupying its own exclusive space width row col so
that it gives spaces to the lines which gets heavily truncated. The running new line should also
stay absolute bottom row as appending to the resource changing height makes it jumps up and down."
All four changes in `viewer/cpe_resource_panel.js`; the witness additions (necessarily) in
`viewer/cinema_maxq.js` since that is where `§HUD_LAYOUT`'s registry/print already live.

**(a)/(b) STACKED layout, `cpe_resource_panel.js`:** `_geom(bw,bh)` no longer splits the panel into
a 56%-width list column beside a squeezed pie column (the actual cause of the heavy truncation) —
it now returns PURE pie-band geometry (`cx,cy,R,RY,depth`) for a caller-supplied full-width band.
`_box()` gains `pieBandH` (the pie's own exclusive top band, sized off `bw`) and `pad`; `_pie()`
draws the bitmap at `B.bw x B.pieBandH` (never a narrower column) and registers `pie.band`.
`_drawList()` drops its old `fullW` column toggle — it is ALWAYS full width now, starting at a
`topY` param (`B.pieBandH` when a pie precedes it, 0 otherwise); `resourcePanelCompositeOntoCanvas`
and `bigStatsCompositeOntoCanvas` (the revolving-card tail, same shared `_box`/`_geom`/`_pie`) both
updated to the new signature — the held-pie-with-card path also stacks now, consistent with item
8a's own words ("nothing beside it"). `pie.list` is registered too (bounded by `listEnd.ry`, the
list's own real drawn extent this frame, NEVER `B.bh` — an early draft bounded it to the panel's
full remaining height and it silently overlapped the pinned Cost/Ledger rows below, a real bug
caught in review before any dry run, not by one).

**(c) PANEL HEIGHT FROM THE SCHEDULE'S WORST CASE, computed once:** new `_scanMaxResourceRows()`
(memoized module-scope var) samples `A.resourcePanelAt` across the whole programme at the SAME
cadence `bigStatsBuild`'s own peak-workforce scan already uses (`totalDays/60` step, never per-
frame) — using `A._resPanelOps`/`A._resPanelProjectStart`/`A._resPanelProjectEnd`, already stashed
by `A.resourcePanelAt`'s own first call (§129.5's existing side-channel, reused rather than adding a
new build-time call site cinema_maxq.js would have to wire — keeps this fix self-contained to one
file). `_box()` uses the memoized max (clamped `[2,8]`) to size the list band; `bh` is therefore
IDENTICAL across every `_box()` call for the whole bake, not derived from whichever trades happen to
be active on the first frame drawn.

**(c) COST/LEDGER PINNED to the bottom edge:** `_pieCostLedgerRows` no longer takes its start `y`
from `listEnd.ry` (the list's OWN per-frame end, which moves as the active-trade count changes) —
the pinned `ry` is `B.bh - pad - rowH*(rows.length-0.5)`, a function only of `B.bh` (now schedule-
max-driven, fixed) and the STATIC `A._costOdometerOn`/`A._pieLedgerOn` toggles, never `info.rows`.
`listEnd` is kept as a parameter solely for the `window.__hudRowsFloat=1` control tap, which
reproduces the OLD float-after-list behaviour verbatim on demand.

**(d) FULL INNER WIDTH:** the registered rect width for `pie.cost`/`pie.ledger` is now `fullAvailW`
(the allocated column width), never the variable measured/post-fit TEXT width — so `rowsFullWidth`
checks a real layout fact (did this row get the whole width to grow into), not an accident of how
many digits today's numbers happen to have. Truncation (`_fit()` ellipsis) is unchanged and stays
allowed, now rare rather than routine (a wider column truncates far less often).

**Witnesses, `cinema_maxq.js`:** `§HUD_LAYOUT` gains `pieExclusive=` (no OTHER registered rect
overlaps `pie.band`, reusing the same overlap test + declared-parent/child exclusion the existing
`overlaps` loop already applies, PLUS excluding `pie.band`'s own parent `resource-panel` — a
containing parent must never read as "beside" the thing it contains, a bug caught and fixed before
any dry run) and `rowsFullWidth=` (`pie.cost`/`pie.ledger` share the same registered width as each
other and it is ≥70% of the panel's own width — a threshold robust to the exact pad constant, never
re-derived here, while clearly telling apart "full width below the pie" from the old ~44%-squeezed
column). New end-of-bake `§HUD_LAYOUT_STABLE ledgerY=[min,max] costY=[min,max] panelH=[min,max] =>
PASS iff each min==max`: sampled EVERY frame (`_hudLayoutStableSampleImpl`, called unconditionally
from `_captureFrame`, never gated on the load-path hold — the resource panel is up through the whole
buildup) into module-scope min/max trackers, printed once (`_hudLayoutStablePrintImpl`) alongside
the other end-of-bake summaries (`§CPE_PIE_HOLD`/`§CPE_STATS_TAIL`).

**Control tap:** `/tmp/tap_hud_rows_float.js` created (`window.__hudRowsFloat=1` at document start,
same `--tap` convention as `viewer/tests/tap_sun_arc_fill.js`) — sets one global, reports nothing
itself; the FAIL is the real bake's own `§HUD_LAYOUT_STABLE` line on a clip whose resource list
changes size (HHS 0.22:0.32 qualifies).

**Dry run** (no live-Chrome harness exists in this worktree; reused the SAME real-Chrome-CALIBRATED
`measureText` lookup `test_ledger_ticker.js`'s own PART H built 2026-09-16 from an interactive
puppeteer run against the identical font string — never a fabricated width), new
`scratchpad/test_hud_rows_pin.js`: a synthetic 60-day schedule whose active-trade count is 2 (days
0-9) → 4 (10-29) → 6 (30-59) — `_scanMaxResourceRows()` finds 6 (the true peak, not day 0's 2),
memoized; `_box()` returns identical `bh`/`pieBandH` across 3 separate calls; `_pieCostLedgerRows`
driven with `listEnd.ry` values matching 2/4/6 active rows (the real per-frame variation that used to
move the old append point) — `ledgerY`/`costY` are IDENTICAL across all three (`273,273,273` /
`257,257,257` in the run), both rows registered at exactly `fullAvailW`; under
`window.__hudRowsFloat=1` the SAME three calls produce `ledgerY=179,211,243` — moving with the active
list, reproducing the old defect exactly. 11 new asserts PASS. Regression: `test_cost_odometer.js`
(6 asserts) and `test_ledger_ticker.js` (13 asserts, including its own PART H real-HHS-scale row-fit
checks) both re-run clean — 0 regressions from the `_box`/`_geom`/`_drawList`/`_pieCostLedgerRows`
rewrite. Both edited files re-checked with `node vm.Script`. No bakes run; nothing committed.

### ROUND 11, 2026-09-16 (Sonnet, same worktree/branch) — §129.8: SHINE-THROUGH, TWO STACKS, VISIBLE=UNOCCLUDED

The largest single round on this beat. `viewer/cpe_load_path.js` restructured throughout; `viewer/cinema_maxq.js`
touched for the HUD alpha fade (necessarily — that registry/print lives there, same as ROUND 10).

**1. SHINE-THROUGH default.** `_lookGhost()` reads `window.__lpLookGhost`. `_buildChainClones` now
branches: shine mode gives each clone `depthTest=false depthWrite=false renderOrder=SHINE_RENDER_ORDER
(100000) opacity=1` + an emissive lift, starting `visible=false` (no ghost state to sit in before its
turn — solidity IS visibility now, see `_revealStackStep`); ghost mode is the unchanged §129.7 v10
material dance. Arm time: `_applyGhost`/`_placeCutPlane` only run under `_lookGhost()`; `_backdropApply`/
`_backdropWitness` are no-ops/INCONCLUSIVE in shine mode (`window.__lpLookGhost=1` restores both). New
`§LOADPATH_LOOK mode=shine|ghost ghosted= clipped= backdropFaded=` printed once at arm.
`§LOADPATH_VISIBLE`'s ghost/clip fields read 0 by construction in shine mode; its `ok` already reduced
to `solid===revealedHops` once ghostedN/hiddenN/clippedN are 0 — the pre-existing formula needed no
further change to satisfy "PASS criterion is solid==K".

**2. VISIBLE = UNOCCLUDED.** New raycasting stack: `_facingFaceSamples(box,camPos,S)` (grid-samples the
camera-facing faces of an AABB, S from `_sampleCountFor(screenAreaPx)`, floor 9); `_reverseGuidFor`
(the mirror of `_sourceInstance`'s forward lookup, built once from `A._instanceGuids`/`A._batchMeta`);
`_raycastUniverse()` (regular + instanced/batched building meshes via `A.collectMeshes`, EXCLUDING this
beat's own clones, cached once per hold — `_resetRayCache()` at build); `_memberUnoccluded` (real
`THREE.Raycaster`, nearest hit within `[0,len+eps]` must be the member's own guid); `_screenAreaPxLive`
(`_frustumTestAtCurrentPose` gained an `ndcWidth` field alongside its existing `ndcHeight`);
`_underHud`/`_screenRectPx` (member's screen rect vs a HUD-rect list). `§LOADPATH_FRAMING` gains
`memberVis=[...]`/`underHud=[...]` (reusing the arm-time occlusion scoring's own `perHop` array,
mapped by guid onto `hopsUp`'s bottom-up order — never re-raycast per frame, satisfying the spec's own
"only at the hold pose, once" cost rule); `memberPx=` (pre-existing, per-hop height) is unchanged.

**3. TWO STACKS.** `_scoreChain` (score = Σ unoccluded×screenArea over frustum-passing hops, an
under-arm-HUD hop scores 0) and `_pickTwoStacks` (NEAR = best score/occludedScore; FAR = best among
candidates whose live-camera distance exceeds NEAR's by ≥ `_extentAlongDir(buildingBox,camPos,camDir)`
— no constant; `window.__lpOneStack` short-circuits to NEAR only; `window.__lpPickOccluded` ranks by
`occludedScore` DESC instead, deliberately preferring the more-occluded candidate) run ONCE, AT ARM, on
the LIVE camera — the real, final pick. BUILD TIME still does a cheap, probe-pose, non-raycasting
two-stack ESTIMATE (reusing `_rankValid`'s existing visibleHops/minMemberPx ranking twice — near, then
far among candidates whose shotPose-distance clears the same extent test) purely to size `durSec`
before arm (frame count is already committed by cinema_maxq.js before arm ever runs — the same
constraint ROUND 9's single-chain live re-pick already worked within). A hop-count mismatch between
the build estimate and the arm-time final pick only shortens/lengthens that stack's own reveal cadence
by a step or two — the same tolerated approximation ROUND 9 accepted. `_lp` itself doubles as the NEAR
stack object (`hopsUp`/`pickItem`/`chainBox`/`revealedHops`/`stackOk`, `name:'near'`); `_lp.far` is the
other one, nullable. `HOLD_CAP_SEC` 8→12 (total, both stacks). New `_revealStackStep(stack,elapsed)`
(bottom-up per-stack reveal, shine visibility-toggle or ghost opacity-dance) and `_stackWitness(stack,
revealed)` now print `stack=far|near`. The hold's own per-frame sequencing: `_revealStackStep(_lp.far,
min(elapsed,farDurSec))` then, once `elapsed>=farDurSec`, `_revealStackStep(_lp,elapsed-farDurSec)` —
idempotent (no-op once fully revealed), so both calls are safe every hold frame. `§LOADPATH_PICK` now
prints `stacks=1|2 near=guid(score,dist) far=guid(score,dist)|farReason=...`. `_visibleWitness`,
`_clonesWitness`, `_chainWorldBBox`, `_disposeChainClones`/clone-count bookkeeping in `_restore` all
now serve either stack (parameterized, never a second copy).

**4. LADDERS BESIDE THEIR STACKS.** New `_ladderLayoutBesideStack` REVIVES `_freeVerticalSpan`'s own
side-choosing math (kept, tested, exposed since §129.7 item 2 superseded its original use — never dead
code removed on a guess): tries the side (left of the stack's own screen box, or right) with more free
vertical room against `avoidRects` (the arm-frame HUD snapshot, PLUS the other stack's own screen box
when both are shown — so the two ladders cannot land on each other; "between the two stacks if both
fit" falls out of this for free). `A.loadPathCompositeOntoCanvas` refactored into `_drawStackLadder`
(one stack's hop-screen projection + ladder + draw + witness), called for FAR first then NEAR (NEAR's
own placement treats FAR's screen box as one more thing to avoid). `§LOADPATH_LABELS` gains `stack=`.

**4b. HUD FADE (not cut) during the hold — AMENDED mid-round.** The first instruction ("nothing is
painted... `§HUD_LAYOUT` may list only `loadpath.*` rects") was SUPERSEDED by the coordinator's own
follow-up: "the HUD is FADED, not cut... implement as one global HUD alpha... not per drawer." Built:
`cinema_maxq.js` gains `_hudFadeT(elapsedSec,durSec,fadeSec)` (pure — 1→0 over the first `fadeSec` of
hold-local elapsed time, 0 through the middle, 0→1 over the last `fadeSec`; `HUD_FADE_SEC=0.5`) and a
per-frame `A._loadPathHudAlpha` computed from it (`window.__lpHudNoFade=1` forces a hard 0/1 step
instead). `_drawUnlessHold` no longer SKIPS its wrapped call on a hold frame — it always runs (so every
drawer keeps registering its real rect and can fade smoothly) but wraps it in `ctx.globalAlpha *=
A._loadPathHudAlpha` via one shared `A._captureCtx` (set once per frame in `_captureFrame`) — genuinely
"one global alpha... not per drawer". `hud.status`/`hud.pathmap`/`hud.pie` (previously unwrapped —
status box was explicitly EXEMPT under §129.6 item 8) are now wrapped too, added to `_FOCUS_NAMES`.
`§LOADPATH_FOCUS`'s own `painted` count now reads 0 for any name whenever `A._loadPathHudAlpha===0`,
regardless of registration — "painted=0 applies to the alpha-0 frames" taken literally.
New analytic (no per-frame sampling needed — same convention `§LOADPATH_BACKDROP`'s own `black=` field
already uses) end-of-bake `§LOADPATH_HUD_FADE fadeOutFrames= alphaMid= fadeInFrames= alphaAtRelease=`,
computed straight from `_hudFadeT` against `A._loadPathWindow.durSec`; `__lpHudNoFade` reads
`fadeOutFrames=0 => FAIL` by construction. RECONCILIATION (disclosed, not silently dropped): the
addendum's own "`§HUD_LAYOUT` may list only `loadpath.*` rects" line was NOT implemented as a hard
registry filter — it is incompatible with drawers that must keep running to fade smoothly. If this
reconciliation is wrong, the fix is confined to `_hudLayoutWitnessImpl`.

**5. Controls + taps.** `window.__lpPickOccluded`, `window.__lpLookGhost`, `window.__lpOneStack`,
`window.__lpHudNoFade` (new, item 4b's own control) all wired as above. Created
`/tmp/tap_lp_pick_occluded.js`, `/tmp/tap_lp_look_ghost.js`, `/tmp/tap_lp_one_stack.js`,
`/tmp/tap_lp_hud_no_fade.js` (same `--tap`-at-document-start convention as
`viewer/tests/tap_sun_arc_fill.js` / ROUND 10's `tap_hud_rows_float.js` — each sets one global,
reports nothing itself).

**Dry run**, new `scratchpad/test_loadpath_round11.js` (a FRESH, minimal fixture — not
`test_loadpath_v4.js`, which never needed a `THREE.Raycaster`; axis-aligned single-instance
containers, ray-vs-AABB occlusion — production code still calls the REAL `THREE.Raycaster` against
REAL triangle geometry in a real browser, only this fixture simplifies to boxes): (a) a fake occluder
placed only in the ray path to one member reads `unoccluded=0` (nearest hit is the blocker's guid); an
unobstructed member reads `unoccluded=1`; both sample at S>=9. (b) three candidate chains at three
distances — the closest/biggest wins NEAR; a candidate +5 beyond NEAR (less than the fixture's own
10-unit building extent) is correctly EXCLUDED from FAR; a candidate +35 beyond wins FAR;
`window.__lpOneStack=1` forces `far=null farReason=one-stack-control`. (c) `_ladderLayoutBesideStack`
against a stack box with a HUD rect blocking one side — the ladder lands on the free side, zero HUD
overlap, and flips sides correctly when the blocked side is swapped. 10 new asserts, all PASS.
Regression: `test_loadpath_v4.js` (42 asserts, exercising `_buildChainClones`/`loadPathBuild`/
`loadPathApplyVisual`/every witness this round touched) and `test_clone_placement.js` both re-run
clean — 0 regressions from the stack-parameterization rewrite. Both edited files re-checked with
`node vm.Script`. No bakes run; nothing committed.

### ROUND 12, 2026-09-16 (Sonnet, same worktree/branch) — four defects from the real HHS R11 bake

Real bake `/tmp/wt-loadpath/out/HHS_loadpath_r11.log` (104 frames): shine mode, clones, stack, resume,
ledger, cost, pinned rows all PASS — but PICK chose a bad stack, `§LOADPATH_HUD_FADE` never printed,
`§HUD_LAYOUT overlaps=78`, and a label ladder sat flush on the frame's left edge. All four fixed,
code-only, `viewer/cpe_load_path.js` + `viewer/cinema_maxq.js`.

**1. PICK ranking — majority-visible gate.** Real numbers: the live re-pick chose a 2-hop candidate
(`memberPx=[1584.9,212.2] memberVis=[0.11,0]`) over the build-time estimate's good 5-hop column
(`visibleHops=5/5`) — Σ(unoccluded×screenArea) let one giant, 11%/0%-unoccluded member's huge
`screenArea` outweigh a whole stack of small, genuinely-seen ones. `_scoreChain` gains
`majorityVisible` per hop (`unoccluded>=0.5 && !underHud`) and a `visibleHopsMajority` count;
`_pickTwoStacks` now REQUIRES `visibleHopsMajority>=2` to enter the pool at all (never just ">=1 hop
in the frustum"), and ranks by a new `_stackCmp(a,b,occludedMode)`: `visibleHopsMajority` DESC, then
`depth` DESC, then `score`/`occludedScore` DESC (the SAME three keys, inverted low-to-high, under
`window.__lpPickOccluded` — the control still deliberately prefers the worse candidate by the SAME
rule the real pick now uses). `§LOADPATH_PICK` gains `visibleHops=K/N (majority)` and `memberVis=[...]`
(and the `far` equivalents) — the exact numbers that decided the pick, on the same line.

**2. `§LOADPATH_HUD_FADE` never printed.** Root cause found by reading the real log line-by-line:
`A.loadPathDispose()` (which nulls `A._loadPathWindow`) runs in the per-frame-loop cleanup, BEFORE the
end-of-bake summary block that calls `_hudFadeWitnessPrint()` — so its own `A._loadPathWindow.durSec>0`
guard always failed silently, every bake, regardless of whether a hold happened.
`_hudLayoutStablePrintImpl()` survived only because it reads its OWN accumulated module-scope trackers,
never `A._loadPathWindow`. Fix: a new `_lpLastHoldDurSec` snapshot, written every hold frame (in the
SAME spot `A._loadPathHudAlpha` is computed, well before dispose ever runs) from the live
`A._loadPathWindow.durSec`; `_hudFadeWitnessPrint()` now reads the snapshot. Verified by direct
code-order inspection (grep confirmed the snapshot assignment site precedes both `loadPathDispose()`
calls and the witness-print call site, all within the same enclosing `start(opts)` scope) — a
synthetic dry run of "read a variable before it's nulled" would have been circular, so this one is
proven by reading, not by a fixture.

**3. `§HUD_LAYOUT overlaps=78`.** ROUND 11's own `_drawUnlessHold` amendment (fade, not skip)
registered its `0,0,1,1` placeholder rect UNCONDITIONALLY, even when `alpha===0` — 13 overlays, all
faded fully out at the mid-hold moment, all registering the SAME point, giving `C(13,2)=78` spurious
"overlapping" pairs. Two fixes: (a) `_drawUnlessHold` now registers the placeholder ONLY when
`alpha>0` ("a drawer that painted nothing must not register a rect") — this alone eliminates the
defect at the mid-hold moment (alpha is 0 there by design); (b) `_hudLayoutWitnessImpl`'s own overlap
loop now excludes any pair where either rect is placeholder-sized (`w<=1 && h<=1`) as a defensive
backstop, regardless of cause. `_hudLayoutFocusWitnessImpl` simplified back to "registered = painted"
(the extra `alpha>0` re-check from ROUND 11 is now redundant — registration itself implies alpha was
positive — kept only as a `w>0&&h>0` belt-and-suspenders filter).

**4. Label ladder margin.** `loadpath.label.near.*:0,…` — `_ladderLayoutBesideStack` clamped `colX`
to `0`/`w-labelW` and the vertical span to `[0,h]`, no edge margin at all. Now keeps one `labelH` of
clearance on every side: `colX` clamped into `[margin, w-labelW-margin]`, the vertical free span
clamped into `[margin, h-margin]` before centring rows within it.

**Dry run**, `scratchpad/test_loadpath_round11.js` extended (kept the ROUND 11 filename — same file,
new sections): (a) the exact R11 shape reproduced directly — two-hop candidates with a real
`THREE.Raycaster` occluder in front of each hop (both driven to <0.5 unoccluded) are correctly
EXCLUDED from the pool (`visibleHopsMajority=0`), so a 5-hop fully-visible column stack wins NEAR
every time; (b) the ROUND 11 far/near-selection section updated to 2-hop-per-candidate chains (the
new gate's own minimum) — still correctly excludes the "too close" candidate and picks the far-enough
one; (c) a verbatim copy of `_hudLayoutWitnessImpl`'s new overlap-exclusion rule proves 13 placeholder
rects (`0,0,1,1`, the exact real-bake shape) contribute ZERO overlaps while a genuinely-overlapping
real pair still counts as 1 (not 0, not swallowed); (d) `_ladderLayoutBesideStack` with a stack box
near the left edge and no HUD rects at all (so the near-edge side always "wins" on raw room) — every
row now stays >= one `labelH` from all four frame edges. 16 asserts, all PASS (one earlier draft of
the occlusion geometry mis-modelled off-boresight multi-face sampling and had to be corrected before
it reproduced the intended occlusion fractions — disclosed, not hidden). Regression: `test_loadpath_
v4.js` (42 asserts) and `test_clone_placement.js` both re-run clean — 0 regressions from the ranking-
rule and ladder-margin changes. Both edited files re-checked with `node vm.Script`. No bakes run;
nothing committed.

### ROUND 13 SPEC (2026-09-16, Sonnet, written while the worktree is locked for the R12 bake) — §129.8 item 6 INFO CARD

Spec-first, per the standing "spec before code" rule — no `cpe_load_path.js`/`cinema_maxq.js` edit in
this entry; implementation waits for the coordinator's "GO CARD" once the R12 bake session releases
the worktree. Dry-run harness for this spec lives in
`scratchpad/test_loadpath_card.js` (a fresh file — pure-data functions, no THREE/camera fixture
needed), verbatim-copying the functions below so the SAME code lands in `cpe_load_path.js` unchanged
on GO CARD (the `test_clock_freeze.js`/ROUND 9 `_lpFrameForArmTn` convention).

**Data sources — nothing new computed, only assembled from what PICK/CHAIN/HOLD already prove:**
- Day number: the FROZEN TM cursor (`_lp.cursorAtEntry`, captured at arm — the SAME value
  `§LOADPATH_HOLD cursorDayBefore=` already prints) against `projectStartMs`. `cpe_load_path.js` has
  no `projectStartMs` of its own (`loadPathBuild`'s own signature never carried it) — reused via the
  SAME cross-beat side-channel §129.5's own comment already establishes: `A._resPanelProjectStart`,
  stashed by `A.resourcePanelAt` on every real call, read here without changing any signature. Day
  is `floor((cursorAtEntry - A._resPanelProjectStart) / MS_PER_DAY) + 1`; `null` (day omitted from the
  line, never invented) if that global is unset (e.g. a load-path-only bake with no resource panel).
- Per-stack `layers` = `stack.hopsUp.length` (K, the SAME K `§LOADPATH_STACK step=j/K` prints).
- Per-stack `top`/`bottom` fragments = `hop.storey + ' ' + shortClass(hop.cls)` for the TOP hop
  (`hopsUp[K-1]`) and the BOTTOM (ground-most) hop (`hopsUp[0]`) — `_pick`'s own depth>=2 gate
  guarantees these are always two DISTINCT hops. `shortClass` strips the `Ifc` prefix and a trailing
  `StandardCase`, lowercased (`IfcWallStandardCase` → `wall`, `IfcColumn` → `column`) — no new
  vocabulary, the SAME `cls` field every hop already carries from `_buildItems()`.
- guids: `_lp.pickItem.guid` (near) / `_lp.far.pickItem.guid` (far, when `_lp.far`) — the LIVE,
  occlusion-scored winners `§LOADPATH_PICK`/`§LOADPATH_CHAIN` already printed at arm, never a second
  opinion.

**Card text (3 lines, 4 when `_lp.far` exists) — pure function, `_cardAssemble(info)`:**
```
LOAD PATH · day <N>, structure topped out
Near stack   <K> layers · <top> → <bottom> → ground
[Far stack    <K> layers · <top> → <bottom> → ground]   -- omitted when stacks=1
each layer rests on the one below it, as the 4D order built them
```
`_cardAssemble` takes a plain `{cursorEntry, projectStart, near:{hopsUp,pickItem}, far:{...}|null}`
and returns `{lines:[...], nearGuid, farGuid}` — `farGuid` is `null` when there is no far stack (the
witness's own `far=guid|none`).

**Placement — "one small card, top-left", FIXED (no avoidance search, unlike the ladders):**
`x = y = margin` (the SAME `margin = round(h*0.028)` corner-inset every other HUD corner box in
`cinema_maxq.js` already uses); `w = maxLineWidthPx + 2*pad`, `h = numLines*rowH + 2*pad` — a pure
`_cardRect(maxLineWidthPx, numLines, rowH, pad, margin)`, `maxLineWidthPx` measured by the real
`ctx.measureText` at draw time (never re-derived here) over the SAME font the ladder labels use.

**Fade — reuses `A._loadPathHudAlpha` directly, no new curve:** "fades in with the first ladder and
out with the HUD fade-in" is exactly the HUD's own fade MIRRORED — the ladder's first label lands at
the same `elapsed≈0` moment the HUD alpha starts dropping, and both curves finish their transition
over the SAME `HUD_FADE_SEC` window. `cardAlpha = 1 - A._loadPathHudAlpha` (0 outside the hold, 1
through the deep middle of the stack show, mirroring HUD exactly at both edges) — drawn via the SAME
`ctx.globalAlpha` idiom `_drawUnlessHold` already uses, no per-drawer special case.

**Witness `§LOADPATH_CARD lines=N rect=x,y,w,h inFrame=true overlaps=0 near=guid far=guid|none =>
PASS|FAIL`:** `inFrame` = the rect's own 4 edges inside `[0,w]x[0,h]`; `overlaps` = the card rect
cross-checked (`_crossOverlapCount`, already exposed) against every registered `loadpath.label.*`
rect ONLY (not the whole HUD registry — the card is drawn while the rest of the HUD is faded to 0
alpha and unregistered per ROUND 12 item 3's own fix, so only the ladders are live geometry to avoid);
FAIL if `near`/`far` on the card ≠ `_lp.pickItem.guid`/`_lp.far.pickItem.guid` (the ACTUALLY drawn
stacks) — this is what makes the control below a real, falsifiable check, not a label swap nobody
verifies.

**Control `window.__lpCardWrongStack=1`:** the card TEXT is assembled from the BUILD-TIME PROBE
pick's guid(s) instead of the live re-pick's — requires stashing `_lp.buildNearGuid`/
`_lp.buildFarGuid` (the provisional pick items already computed in `A.loadPathBuild`, currently
discarded once arm's live re-pick overwrites `_lp.pickItem`) at BUILD time, read by
`_cardAssemble`'s own `wrongStackControl` flag. The WITNESS always compares against the REAL, drawn
guids regardless of the control, so when build and live picks genuinely differ (ROUND 9's own proven
scenario) the control reliably prints `=> FAIL`; on a bake where build and live happen to agree
(no real disagreement to expose) the control would trivially PASS — a known, disclosed limitation of
proving-by-real-bake for this specific control (the dry run proves the MECHANISM directly instead,
by constructing a case where they differ).

**Dry run** (`scratchpad/test_loadpath_card.js`, written now): (a) `shortClass` on real IFC class
names; (b) `_cardAssemble` on a synthetic 2-stack `_lp`-shaped object — asserts the exact 4-line
shape, the day number arithmetic, and `farGuid=null` when `far` is omitted (stacks=1, 3 lines); (c)
the wrong-stack control — `_cardAssemble` with `wrongStackControl=true` returns the BUILD guids while
a separately-computed "real drawn" guid differs, proving the witness's own comparison would FAIL
under the control; (d) `_cardRect`/inFrame/overlaps-vs-ladder-rects on a synthetic registry, including
a control case where the card is deliberately placed over a `loadpath.label.*` rect (must fail
`overlaps===0`) and one where it is not (must pass). All pure-function, no THREE/camera needed — same
"no THREE.js/DOM needed" convention `cpe_resource_panel.js`'s own dry-runnable exposures already use.

**On GO CARD**, implementation lands in `cpe_load_path.js`: `_shortClassLabel`, `_stackFragment`,
`_cardDayNumber` (with its own `MS_PER_DAY` local const), `_cardAssemble`, `_cardRect`, a new
`_cardWitness` fired once (same mid-hold moment `§HUD_LAYOUT`/`§LOADPATH_FOCUS`/`§LOADPATH_LABELS`
already fire on), and the actual 2D draw call (added to `A.loadPathCompositeOntoCanvas`, alpha via
`A._loadPathHudAlpha` as above) plus `_lp.buildNearGuid`/`_lp.buildFarGuid` stashed at build. No
`cinema_maxq.js` change is expected for this item (the card draws entirely inside load path's own
composite pass, unlike the HUD-drawer wrapping ROUND 11/12 needed).

**ADDENDUM (same round, still spec-only — worktree locked for the R12 bake read): real HHS R12 bake
(`/tmp/wt-loadpath/out/HHS_loadpath_r12.log`) — FADE/FOCUS/HUD/labels all PASS (ROUND 12 confirmed
fixed), but a NEW defect: `memberVis=[0,0,0,0,0]` for the drawn 5-column ladder the frustum itself
reads 5/5 in view, and `§LOADPATH_PICK stacks=1 near=none farReason=no-candidate-with-2-majority-
visible-hops pickSource=none` — every candidate read 0 unoccluded, so ROUND 12's own gate excluded
everything and the beat silently fell back to the build-time probe pick with no honest witness of
having done so.**

**Root cause — the raycaster is blind on HHS specifically.** HHS's real geometry is `BatchedMesh`
(41 meshes carrying 6,880 elements — the coordinator's own count). A `THREE.Raycaster` hit against a
`BatchedMesh` carries `hit.batchId`, never `hit.instanceId` (that field is `InstancedMesh`-only).
`_memberUnoccluded` (ROUND 11) calls `_reverseGuidFor(hits[0].object, hits[0].instanceId)`
unconditionally — on HHS, `instanceId` is always `undefined`, `_reverseGuidFor`'s own `instanceId !=
null` guard fails on EVERY hit against real geometry, the guid never resolves, `hitsSelf` stays 0 for
every candidate regardless of true occlusion, `unoccluded` reads 0 for everything, and ROUND 12's own
(correct) `visibleHopsMajority>=2` gate then correctly, but wrongly-premised, excludes every real
candidate.

**Fix 1 — resolve BOTH id shapes, via a proper reverse index (never a per-hit linear scan):**
`_reverseGuidFor(object, slotId)` — the caller passes `hits[0].batchId != null ? hits[0].batchId :
hits[0].instanceId` (whichever the hit actually carries). Internally, `_revInstanceIndex` (existing,
built from `A._instanceGuids`) and a NEW `_revBatchIndex` (built from `A._batchMeta`, mirroring
`_sourceInstance`'s own forward BatchedMesh scan but INVERTED and built ONCE, O(1) thereafter — never
a linear scan per ray, which the existing `_reverseGuidFor` BatchedMesh branch WAS doing) are both
consulted by `object.id` then `slotId`. `_resetRayCache()` gains the new index's reset too.

**Fix 1b — clones must never be raycast targets, belt AND suspenders.** `_raycastUniverse()` already
filters `!(o.userData && o.userData._loadPathClone)` (ROUND 11) and clones are built AFTER scoring
runs (arm-time ordering, unchanged) — analysis says this alone should be sufficient, but the
coordinator's own instruction adds a second, independent guarantee: `_buildChainClones` sets
`mesh.raycast = function () {};` (three.js's own per-object raycast override — a no-op makes the
object invisible to ANY `Raycaster.intersectObject(s)` call, permanently, regardless of registry/
cache timing) on EVERY clone it builds, both look modes — cheap, and removes the whole class of
"was the cache built at the wrong moment" risk rather than just asserting it away.

**Fix 2 — the self-check, "never silently premised on a lie":** `_scoreChain`/`_memberUnoccluded`
now also return `raysCast`/`selfHits` (the raw ray-cast/self-hit totals behind `unoccluded`, summed
across a chain's own hops). `_pickTwoStacks` sums these across EVERY candidate BEFORE the
`visibleHopsMajority>=2` filter (so the check fires even when — as here — the gate would otherwise
exclude everyone) — `raycastBlind = hitsTotal>0 && selfHits===0`. When true: print
`§LOADPATH_VISIBILITY INCONCLUSIVE reason=raycast-blind hitsTotal=N selfHits=0` ONCE, and rank/filter
by `visibleHopsFrustum` (the plain frustum-intersects count each hop already carries as `.visible` —
the PRE-ROUND-12 rule) instead of `visibleHopsMajority`, via the SAME `_stackCmp`/`>=2` gate,
parameterized on which count to read (never a second, re-derived comparator). `§LOADPATH_PICK` prints
`pickSource=live` (normal), `pickSource=probe-fallback reason=raycast-blind` (raycast was blind but
the frustum fallback still drew a real stack), or `pickSource=none` (raycast blind AND still nothing
even frustum-qualifies — the ONLY case `none` is still honest, since nothing is drawn at all).

**Dry run** (`scratchpad/test_loadpath_batchid.js`, written now, spec-only — NOT wired into any real
file): a VERBATIM copy of the planned `_reverseGuidFor`/`_revBatchIndex` logic, tested directly
against fake `A._instanceGuids`/`A._batchMeta` tables and fake raycaster hit objects: (a) an
InstancedMesh-style hit (`{object:{id:1}, instanceId:3}`) resolves via the existing instance index
unchanged (regression); (b) a BatchedMesh-style hit (`{object:{id:2}, batchId:7, instanceId:
undefined}`) — the OLD code's own call shape (`_reverseGuidFor(object, hit.instanceId)`) resolves to
`null` (reproduces the real HHS defect exactly); the NEW call shape (`_reverseGuidFor(object,
hit.batchId != null ? hit.batchId : hit.instanceId)`) resolves to the correct guid; (c) the reverse
index is built ONCE (a counter proves the build function fires exactly once across many lookups,
never a linear scan per call); (d) the `raycastBlind` self-check — a synthetic set of per-candidate
`{raysCast, selfHits}` pairs where every `selfHits` is 0 despite `raysCast>0` triggers the INCONCLUSIVE
line and the frustum-count fallback; a normal set (some `selfHits>0`) does not. On GO: lands in
`cpe_load_path.js` (`_reverseGuidFor`, `_revBatchIndex`, `_resetRayCache`, `_memberUnoccluded`,
`_scoreChain`, `_pickTwoStacks`, `_stackCmp`, `_buildChainClones`'s `mesh.raycast=noop`, and the arm
block's `pickSource=` print) — no `cinema_maxq.js` change expected for this item either.

### ROUND 13 IMPLEMENTED, 2026-09-16 (Sonnet, worktree `/tmp/wt-loadpath` branch `feat/loadpath-ledger`, code-only, no bakes)

Both ROUND 13 SPEC items above LANDED in `viewer/cpe_load_path.js`, plus two more items the
coordinator added mid-round (§129.8 item 4b's own "WITNESS DEFECT" paragraph and §129.7 item 8's own
"FONTS" paragraph) landed in `viewer/cinema_maxq.js`, `viewer/cpe_resource_panel.js` and
`viewer/cpe_flythru_cues.js`. All four items' dry runs re-verified against the LIFTED code (not a
re-typed copy) — see below. `node vm.Script` syntax-checked clean on every touched file.

**A — BatchedMesh raycast-blind fix.** `_reverseGuidFor(object, slotId)` (was `instanceId`) now
builds `_revInstanceIndex` AND a new `_revBatchIndex` together, once, via `_buildReverseIndexes()`
(never a per-hit linear scan — the old BatchedMesh branch's own defect); `_resetRayCache` clears
both. `_memberUnoccluded`'s own raycast call now passes `hits[0].batchId != null ? hits[0].batchId :
hits[0].instanceId` (was `instanceId` alone — the real HHS defect's exact root cause) and returns
`raysCast`/`selfHits` alongside `unoccluded`. `_scoreChain` sums those per hop into `raysCast`/
`selfHits`/`visibleHopsFrustum` chain totals. `_pickTwoStacks` sums `raysCast`/`selfHits` across
EVERY candidate BEFORE the visibility filter; `raycastBlind = hitsTotal>0 && selfHits===0` triggers
`§LOADPATH_VISIBILITY INCONCLUSIVE reason=raycast-blind hitsTotal=N selfHits=0` and switches the
ranking/filter key (`_stackCmp`'s now-parameterized `visKey`) from `visibleHopsMajority` to
`visibleHopsFrustum` (the pre-ROUND-12 rule). `pickSource` now comes straight from `_pickTwoStacks`
itself (`live` / `probe-fallback reason=raycast-blind` / `none`) — the arm block's own print no
longer re-derives it from `picked.near` alone, which is exactly what silently printed `none` while a
stack was actually drawn on the real HHS bake. `_buildChainClones` also sets `mesh.raycast = function
(){}` on every clone (belt-and-suspenders, both look modes). Verified against the REAL lifted file
(`scratchpad/test_lifted_verify.js`, required `cpe_load_path.js` directly, no re-typed copy): the OLD
call shape reproduces the defect (`_reverseGuidFor({id:2}, undefined) === null`), the NEW call shape
resolves it (`=== 'G-BATCH-7'`), InstancedMesh lookups are unchanged (regression guard), and
`_stackCmp`'s `visKey` param correctly flips the ranking. `scratchpad/test_loadpath_batchid.js` (the
ROUND 13 dry-run harness, 10 asserts) still passes unchanged.

**B — INFO CARD.** `_shortClassLabel`, `_stackFragment`, `_stackCardLine`, `_cardDayNumber`,
`CARD_FIXED_LINE`, `_cardAssemble`, `_cardRect`, `_cardWitness` landed verbatim from
`scratchpad/test_loadpath_card.js`, plus `_cardOverlapsLadders`/`_cardInFrame` — REUSING the file's
own existing `_crossOverlapCount`/`_allRectsInFrame` (per the spec's own explicit instruction) rather
than the harness's standalone pairwise reimplementations. `_lp.buildNearGuid`/`_lp.buildFarGuid` now
stashed in `A.loadPathBuild` (near = `pickItem.guid`; far = `items[farResolved.idx].guid` when a
build-time far candidate existed, else `null` — `farResolved` is function-scoped/var-hoisted, never
re-derived). The draw call (`_drawInfoCard`, new) lives entirely inside
`A.loadPathCompositeOntoCanvas`'s own composite pass (no `cinema_maxq.js` change needed for this
item, as the spec predicted): `cardAlpha = 1 - A._loadPathHudAlpha`, top-left at the SAME
`margin = round(h*0.028)` corner-inset `cpe_resource_panel.js`'s own `_box()` uses, plate via the
shared `A.cpePanelPlate`, registers `loadpath.card` in the HUD layout registry, fires
`§LOADPATH_CARD` once per hold (gated on `A._loadPathMidHoldThisFrame`, same moment
`§HUD_LAYOUT`/`§LOADPATH_LABELS` fire on) reading overlaps against the LIVE per-frame
`A._hudLayoutRects` (not the arm-frame snapshot — only the ladders are live geometry during the
hold). Control `/tmp/tap_lp_card_wrong_stack.js` created (`window.__lpCardWrongStack=1`). Verified
against the REAL lifted file (`scratchpad/test_lifted_verify.js`): `_cardAssemble` on the two-stack/
one-stack/wrong-stack-control shapes all match the harness's own results exactly, `_cardWitness`
correctly reads `=> FAIL` under the control and `=> PASS` on the normal run (both printed the real
`§LOADPATH_CARD` line), `_cardRect`/`_cardOverlapsLadders`/`_cardInFrame` all check out.
`scratchpad/test_loadpath_card.js` (17 asserts, not 16 as originally estimated) still passes
unchanged.

**C — HUD fade not reaching the encoded frame (coordinator addendum, §129.8 item 4b "WITNESS
DEFECT").** Root cause: `resourcePanelCompositeOntoCanvas`/`bigStatsCompositeOntoCanvas`/
`dayCounterCompositeOntoCanvas`/`pathOverviewCompositeOntoCanvas` each take their OWN `opacity`
parameter and do an ABSOLUTE `ctx.globalAlpha = opacity` assignment — `cinema_maxq.js`'s own
`_drawUnlessHold` pre-multiplied the ambient `ctx.globalAlpha` by the real hold-fade alpha before
calling in, but every one of those four call sites passed a HARDCODED `1` for `opacity`, so the
callee's own absolute assignment silently clobbered the ambient fade back to full opacity — exactly
"the alpha was applied to a variable the frame compositor never reads." Fix: `_drawUnlessHold` now
calls `fn(alpha)` (was `fn()`) and the four call sites (`hud.pathmap`, `hud.pie`, `roster`,
`daycounter`) pass that `alpha` through as their own `opacity` param instead of `1`; `measure.cues`
(`flythruCuesCompositeOntoCanvas`, which had NO opacity param at all — its own `a.opacity` cue-fade
is likewise an absolute assignment) gained a new 5th `extAlpha` param, multiplied into its own
`ctx.globalAlpha` assignment, wired the same way. `hud.status` (`filmBoxesDrawStatus`) and
`roomtitle.fallback` (`roomTitleCompositeOntoCanvas`) needed NO change — neither touches
`ctx.globalAlpha` internally, so they already correctly inherited the ambient alpha `_drawUnlessHold`
pre-multiplies. `_drawUnlessHold` also now records `A._hudCompositeAlphaSample[name] = alpha` every
call (reset per frame alongside `A._hudLayoutRects`); the main bake loop tracks whichever frame lands
closest to `|elapsedSec - durSec/2|` and snapshots that sample into `_lpMidHoldCompositeAlpha`
(survives past `A.loadPathDispose()`, which clears the live hold state before the end-of-bake print
runs — same ROUND 12 item 2 problem, same fix shape). `_hudFadeWitnessPrint` (§LOADPATH_HUD_FADE) is
no longer purely analytic: `compositeAlpha=[name:value,...]` now reports the REAL sampled data,
`alphaMid` is the max of that sample (not the formula), and `ok` FAILs whenever any tracked layer's
composite alpha is non-zero at mid-hold OR the sample is entirely absent (`compositeAlpha=UNSAMPLED`
— never invent a PASS with no real evidence). `fadeOutFrames`/`fadeInFrames`/`alphaAtRelease` stay
analytic (curve timing, still needed for the `__lpHudNoFade` control's own FAIL). Dry-run
(`scratchpad/test_loadpath_hudfade_fonts.js`, items C(a)-(c), 8 asserts): the OLD call-site shape
(hardcoded `opacity=1`) reproduces the defect (`ctx.globalAlpha` stays `1` despite `alpha=0`), the
NEW shape reaches the frame correctly (`globalAlpha===0`); the closest-to-middle frame tracker picks
the right frame; the witness gate PASSes on an all-zero sample, FAILs on a one-layer-stuck-at-1
sample (the real HHS shape) and on no sample at all. **Disclosure:** this is a stubbed dry run
(intercepting a fake compositor call), not a real browser/canvas bake — the sibling bake session
should confirm `compositeAlpha=[...]` reads all-zero at mid-hold on a real HHS clip before this is
called proven live; no bake was run from this session per standing instruction.

**D — resource panel row font regression (coordinator addendum, §129.7 item 8 "FONTS").** Root
cause, found in `git -C /tmp/wt-loadpath diff HEAD -- viewer/cpe_resource_panel.js` (never guessed):
pre-Round-10 (HEAD), `_box()`'s `bh` WAS the fixed `Math.round(h*0.24)` and `_drawList` computed
`fs = Math.max(9, Math.round(bh*0.085))` off that same fixed value. Round 10 added a FIXED `bh0`/
`fs0`/`rowH0` to `_box()` specifically so text sizing would stop growing with the panel — but
`_drawList` was never wired to read them; it kept recomputing `fs` from its OWN `bh` PARAMETER, and
both call sites pass `B.bh`, the panel's now-GROWN total height (pie band + list rows + pinned cost/
ledger rows), so the row text grew right along with the panel. Fix: `_drawList(g, bw, bh, info,
topY, B)` gained a 5th `B` param (the panel's own `_box()` result, already in scope at both call
sites); `fs`/`pad` now read `B.fs0`/`B.pad` (the fixed, `bh0`-anchored values) directly, never
re-derived from `bh` — `bh` itself is STILL used for `maxRows` (how many rows fit THIS frame's real,
grown panel), so only the FONT is pinned, exactly "keep them same size as before, allow the pie only
to grow." `_drawList` stashes `A._resPanelRowFontPx = fs` every call. `§HUD_LAYOUT`
(`_hudLayoutWitnessImpl`, now takes `h` as a param) prints `rowFontPx=<value>(expect <formula>)` —
the expected value is the PRE-ROUND-10 FORMULA itself (`Math.max(9, Math.round(Math.round(h*0.24)*
0.085))`, proportional to frame height, never a fixed pixel constant guessed for one resolution) —
and `pieBandH=<value>` read straight off the already-registered `pie.band` rect's own height (never
a second, re-derived number); FAILs if `rowFontPx` was recorded this frame and differs from the
formula (vacuously OK if no resource panel drew this frame at all). Dry-run
(`scratchpad/test_loadpath_hudfade_fonts.js`, items D(a)-(b), 7 asserts, across h=480/960/1080): the
Round-10 bug DOES grow the font when the panel grows (verified numerically different from the
pre-Round-10 formula at every tested resolution), the ROUND 13 fix matches the pre-Round-10 formula
EXACTLY regardless of panel growth, and the `§HUD_LAYOUT` gate correctly PASSes the fixed value and
FAILs the old buggy (grown) value.

All 15 asserts in `scratchpad/test_loadpath_hudfade_fonts.js` (C+D combined) pass; all 27 asserts in
the two ROUND 13 harnesses (`test_loadpath_card.js` 17, `test_loadpath_batchid.js` 10) still pass
unchanged; `scratchpad/test_lifted_verify.js` (NEW, 22 checks against the REAL file via `require()`,
not a re-typed copy) all pass. Every touched file (`cpe_load_path.js`, `cinema_maxq.js`,
`cpe_resource_panel.js`, `cpe_flythru_cues.js`) syntax-checked clean via `node vm.Script`. No bakes
run this session (worktree rule, standing instruction) — items A/B were already flagged for the next
real bake by the prior ADDENDUM; items C/D's `compositeAlpha=[...]`/`rowFontPx=` witness output on a
real HHS clip is the open follow-up for whichever session next holds the worktree.

### ROUND 14 IMPLEMENTED, 2026-09-16 (Sonnet, worktree `/tmp/wt-loadpath` branch `feat/loadpath-ledger`, code-only, no bakes)

Real HHS R13 bake (`/tmp/wt-loadpath/out/HHS_loadpath_r13.log`, coordinator's own read): C/D confirmed
working live (`compositeAlpha=[13 layers all 0.00] => PASS`, `rowFontPx=10(expect 10)`); A/B still
showed `memberVis=[0,0,0,0,0]`/`pickSource=none`/no `§LOADPATH_VISIBILITY`/no `§LOADPATH_CARD`.

**Real bug found first, independent of the coordinator's own hypotheses:** `_drawInfoCard` (ROUND
13's INFO CARD function) was fully implemented but **never actually called** — the ROUND 13 edit to
`A.loadPathCompositeOntoCanvas` added the ladders draw calls but the `_drawInfoCard(ctx, w, h, k);`
line was never added to that function body. This alone fully explains "no `§LOADPATH_CARD` line at
all" (not a card/pick logic bug — a wiring omission). Fixed: one line added to
`A.loadPathCompositeOntoCanvas`.

**A — broadened raycast-blind self-check.** Root cause of the STILL-blind pick, confirmed by a real
integration dry run (below): ROUND 13's own blind condition (`hitsTotal>0 && selfHits===0`, meaning
"rays were cast but never resolved to self") assumed the live frustum test always passes when a probe
said 5/5 in frustum — the real HHS bake shows the LIVE, arm-time `_projectAABBLive` test can itself
disagree and fail for every hop (the well-documented ROUND 5/7 class of probe-vs-live-camera
projection disagreement), leaving `raysCast===0` (the blind check's own aggregate never even reaches
its `hitsTotal>0` gate). Fix: `_memberUnoccluded` now separates `hitsAny` (rays that hit ANYTHING)
from `selfHits` (a TRUE self-hit, subset of `hitsAny`) — `unoccluded`'s own VALUE is unchanged (a
"no hit" ray still counts as unoccluded, ROUND 12's rule), only the diagnostic breakdown is new.
`_scoreChain`/`_pickTwoStacks` aggregate `raysCast`/`hitsAny`(as `hitsTotal`)/`selfHits` across every
candidate; `blind = raysCastTotal===0 || hitsTotal===0 || selfHitsTotal===0` (any of the three, each
its own honest `reason`: `no-rays` / `no-hits` / `no-self-hits`) — never the single narrower ROUND 13
condition alone. `_pickTwoStacks` now also calls `_resetRayCache()` and re-measures
`_raycastUniverse().length` ITSELF at the very start of every arm-time score (never relying on a
universe cached earlier in the hold's lifetime, possibly before the scene/clones were ready) —
`universe=N` is now real, always-fresh data, not a guess. The arm-time `§LOADPATH_PICK` line now
ALWAYS prints `raysCast=/hitsTotal=/selfHits=/universe=`, straight from `_pickTwoStacks`'s own
return, unconditionally (not just when blind). `pickSource` still never reads `none` while a stack is
drawn (`probe-fallback reason=raycast-blind(<reason>)` covers all three blind shapes).

**Three.js `batchId` support — VERIFIED, not assumed.** `grep -c batchId viewer/lib/three.module.min.js`
= 0, but that file `import`s from `viewer/lib/three.core.min.js` (r184's split build) which DOES set
`s.batchId=n` inside `BatchedMesh.raycast()` (confirmed by reading the exact minified line) — the
viewer's import map points `"three"` at `three.module.min.js`, which re-exports the SAME `BatchedMesh`
class from `three.core.min.js`, so the runtime class genuinely supports `.batchId` on hits. The
per-member-geometry raycast fallback the coordinator's item 3 offered as a contingency is therefore
NOT needed — disclosed here rather than silently built anyway.

**Real integration dry run — REAL three.js, REAL lifted code, not a re-typed stub**
(`scratchpad/test_round14_integration.mjs`, 16 asserts): `viewer/lib/three.module.min.js`/
`three.core.min.js` copied (read-only, unmodified) into `scratchpad/threetest/` alongside a
`package.json` declaring `"type":"module"` (Node's loader needs this to run the vendor bundle's own
ESM `import`s — the real files are never edited). `cpe_load_path.js` required directly via
`createRequire`, driven with a real `THREE.Scene`/`THREE.PerspectiveCamera`/`THREE.InstancedMesh`
2-hop candidate. Four scenarios, all against the REAL `A._loadPathPickTwoStacks`: (a) EMPTY universe
(`A.collectMeshes` returns `[]`) — reproduces this file's `no-hits` branch (sample points are
generated regardless of what's in the universe, so `raysCast>0` but `hitsTotal=0`); a real stack IS
drawn (empty universe reads `unoccluded=1` everywhere, so the ORDINARY majority gate already
qualifies it) with `pickSource=probe-fallback`. **Disclosure:** this differs from the coordinator's
own literal `INCONCLUSIVE(no-rays)` example label for "empty universe" — `no-rays` needs raysCast
itself at 0, which an empty universe alone does not produce (see scenario c). (b) POPULATED universe,
genuinely unoccluded — `raycastBlind=false`, `selfHits=74>0`, `universe=2`, `pickSource=live` (proves
the batchId/instanceId reverse-lookup fix resolves real hits in real three.js, not just the pure-data
harness). (c) camera turned 180° away — every hop fails the LIVE frustum test — reproduces the ACTUAL
`no-rays` branch (`raysCast=0`) and is the most likely real shape of the HHS defect; `near=null`,
`pickSource=none` (the one case `none` is still honest, per spec). (d) a deliberately stale/empty
`_rayMeshCache` (populated before a mesh existed) followed by the mesh appearing and `A.collectMeshes`
updating, WITHOUT calling `_resetRayCache()` externally — `_pickTwoStacks`'s own internal reset (this
round's fix) correctly sees `universe=1`, not the stale cached `0`, proving item 3's fix independently
of whichever of (a)/(c) the real HHS defect turns out to be. All 16 asserts pass; the pre-existing
`test_lifted_verify.js` (22 checks), `test_loadpath_card.js` (17), `test_loadpath_batchid.js` (10),
and `test_loadpath_hudfade_fonts.js` (15) all still pass unchanged. `cpe_load_path.js` syntax-checked
clean via `node vm.Script`.

**Card fix (item 4):** already correct in ROUND 13's own code — `_drawInfoCard` reads `_lp.hopsUp`/
`_lp.pickItem`/`_lp.far` (the ACTUALLY drawn stack, including the fallback case, since
`_buildChainClones(_lp.hopsUp)` runs unconditionally regardless of whether the arm-time re-pick
succeeded) — never `picked.near`. The ONLY reason it never printed was the wiring omission above; no
card-logic change was needed once `_drawInfoCard` was actually called.

No bakes run this session (worktree rule, standing instruction). Open follow-up for the next real
bake: confirm which of scenario (a)/(c)'s shape (`no-hits` vs `no-rays`) the real HHS clip actually
hits, and confirm `§LOADPATH_CARD`/`§LOADPATH_VISIBILITY` both now print.

### ROUND 15 IMPLEMENTED, 2026-09-16 (Sonnet, worktree `/tmp/wt-loadpath` branch `feat/loadpath-ledger`, code-only, no bakes)

Real HHS R14 bake (`/tmp/wt-loadpath/out/HHS_loadpath_r14.log`, coordinator's own read): CARD prints
and PASSes, fade/fonts all PASS. Arm-time PICK: `raysCast=35158 hitsTotal=30351 selfHits=29
universe=456 … near=none farReason=no-candidate-with-2-majority-visible-hops pickSource=none`. Not
blind (rays hit real geometry) — only 29/35,158 rays resolved to their own member first, so every
candidate read ~0 unoccluded, and the "not blind + no candidate" case fell through to a dishonest
`pickSource=none` while the probe stack was still drawn.

**Item 1 — OCCLUSION DEFINITION redefined.** Root cause: sample points lie on a member's bounding-
BOX faces, not its real surface — a box-face point routinely sits in EMPTY AIR beyond a non-box-
shaped (thin/recessed/rounded) member's actual mass, so the OLD test ("first hit is self, else
occluded") blamed whatever the ray next reached — a wall or slab merely CO-LOCATED with that box-face
point, never actually standing between the camera and the member. `_memberUnoccluded` (`cpe_load_
path.js`) now reads: a sample is UNOCCLUDED iff the first hit is self, OR the first hit's distance
`>= (distance camera->sample - OCCLUSION_EPS)` — i.e. nothing lies STRICTLY BETWEEN the camera and
the box face, regardless of what (or whether anything) is found at/beyond that depth. A genuine
occluder must be CLOSER than the sample point. `memberVis`/`unoccluded` recompute automatically
(same field, new rule, no separate change needed at the print sites). Dominant-occluder tracking
added: `_buildReverseIndexes()` now also builds `_revGuidClass` (guid -> `ifcClass`, straight off
`A._batchMeta`'s own `[{guid, storey, disc, ifcClass, slotId}]` shape — streaming.js's own record,
never a second DB query in the hot raycast loop); `_memberUnoccluded` tallies occluder guids among
genuinely-occluded rays and returns the most frequent as `dominantOccluder:{guid,cls,count}`;
`_scoreChain` carries it per hop; the arm-time `§LOADPATH_PICK` line now prints `hop0Occluder=
<cls>:<guid>|none` for the drawn NEAR stack's hop 0 (chain order, i.e. the TOP of the drawn chain per
`_pick`'s own top-down convention — disclosed, not re-ordered to a ground-up reading) and
`farHop0Occluder=` too when a FAR stack exists (extended for symmetry with every other far* field
already on this line — not explicitly asked, cheap since the data is already computed, disclosed
here).

**Item 2 — THREE explicit fallback tiers, printed honestly.** `_pickTwoStacks` now tries, in order:
tier 1 (`visibleHopsMajority>=2`, the normal/best case, tried FIRST even when raw ray totals look
thin, since a real bake can have `selfHits>0` somewhere while genuinely having zero qualifying
candidates — this round's own real symptom, not a raycast defect); tier 2 (`visibleHopsFrustum>=2`,
"the stack shines through occluders by design") when tier 1 finds nothing AND the raycast is not
blind — `pickSource=frustum-fallback reason=no-unoccluded-candidate`; tier 3 (`visibleHopsFrustum>=2`
again) when the raycast IS blind — `pickSource=probe-fallback reason=raycast-blind(...)`, unchanged
shape from ROUND 14. `pickSource=none` may now only print when NO tier's pool has anybody at all.
Both NEAR and FAR are drawn from whichever tier's own `qualified` pool first produces candidates
(disclosed interpretation of "apply the same tiers to FAR" — one shared tier decision governs both,
never two independently-tiered searches with two different `pickSource`s on one line). The chosen
`tier`/`visKey` are now returned explicitly from `_pickTwoStacks` and READ (never re-derived a second
time) by the arm block's `rankBy=`/`visibleHops=` prints — the exact class of bug ROUND 13's own
`raycastBlind`-only re-derivation could not have told tier-1 from tier-2 apart.

**`blind`'s own definition NARROWED, not just broadened again — a necessary side-effect of item 1:**
under the new occlusion rule, a ray that never precisely lands on a thin/recessed member's real
surface legitimately contributes ZERO self-hits while still correctly reading unoccluded (it counts
toward `unoccludedCount`, never `selfHits`) — so `selfHitsTotal` can now be low or exactly 0 for a
perfectly healthy, fully-visible candidate, and ROUND 14's own `selfHitsTotal===0` blind trigger would
have produced FALSE positives (misrouting genuine "tier 1 finds nobody" cases, including real total
occlusion, into tier 3's raycast-blind label instead of tier 2's honest one). `blind` is now ONLY
`raysCastTotal===0` (`no-rays`) or `hitsTotal===0` (`no-hits`) — genuine infrastructure silence, never
inferred from self-hit sparsity. Proven necessary by the dry run's own scenario (c) below: a
synthetic FULLY-occluded-by-a-real-wall case (`selfHits=0`, `hitsTotal=86>0`) correctly lands in tier
2, not tier 3, only once `selfHitsTotal===0` was dropped from the trigger.

**Dry run, REAL three.js (`scratchpad/test_round15_integration.mjs`, 11 asserts; scratchpad/threetest/
three.module.min.js + three.core.min.js, copied read-only from viewer/lib/, unmodified, alongside a
package.json declaring "type":"module" so Node's loader accepts the vendor bundle's own ESM imports)
against `A._loadPathMemberUnoccluded`/`A._loadPathPickTwoStacks` directly, not a re-typed stub:**
(a) a wall placed AT the exact depth of a member's own box face (the member's own guid unresolvable —
standing in for "thin/recessed real geometry that these box-corner rays never precisely touch") reads
`unoccluded=1.0` despite `hitsAny=25/25, selfHits=0` — this IS the real HHS shape (rays hit real
geometry, near-zero self-hits) and now correctly reads visible, `dominantOccluder=null`. (b) the same
setup with the wall moved CLEARLY in front (well closer than the box) reads `unoccluded=0.0`,
`dominantOccluder={guid:'G-WALL',cls:'IfcWall',count:25}` — real occlusion is still caught (regression
guard). (c) a real 2-hop `_pickTwoStacks` run with both hops genuinely, fully occluded by a real wall
mesh: `raycastBlind=false`, `tier=2`, `pickSource='frustum-fallback reason=no-unoccluded-candidate'`,
`near` is non-null (a stack IS drawn), `pickSource` never reads `none`. All 11 asserts pass. Every
pre-existing test (`test_lifted_verify.js` 22, `test_loadpath_card.js` 17, `test_loadpath_batchid.js`
10, `test_loadpath_hudfade_fonts.js` 15, `test_round14_integration.mjs` 16 — the last re-run to
confirm the narrowed `blind` definition caused no regression on its own empty-universe/camera-away
scenarios) still pass unchanged. `cpe_load_path.js` syntax-checked clean via `node vm.Script`.

No bakes run this session (worktree rule, standing instruction). Open follow-up for the next real
bake: confirm `hop0Occluder=`/`farHop0Occluder=` print sensible class:guid pairs on HHS, and confirm
tier 1 or tier 2 now actually produces a drawn, honestly-labelled `pickSource` (not `none`) where R14
read `none`.

### ROUND 16 IMPLEMENTED, 2026-09-16 (Sonnet, worktree `/tmp/wt-loadpath` branch `feat/loadpath-ledger`, code-only, no bakes)

§129.9 rulings, on top of ROUND 15 (ships together per §129.9 item 4). Amendment mid-round: pie.band
KEEPS its current bigger size (`round(bw*0.66)`, unchanged) — only the trade list reverts to
pre-Round-10 row sizing with no reserved worst case, and Cost/Ledger leave the panel for their own
fixed `hud.fiveD` box (anchor chosen: the frame's own bottom edge — see below, printed/disclosed).

**Item 1 — DISENTANGLE 4D/5D from the pie panel** (`viewer/cpe_resource_panel.js` +
`viewer/cinema_maxq.js`). Root cause confirmed via `§HUD_LAYOUT`: `resource-panel` read 173x272 vs
173x115 pre-Round-10 because `_box()` reserved `pie.band` (114) + `pie.list` (113, a WORST-CASE
`_scanMaxResourceRows()` scan) + two more rows for Cost/Ledger, regardless of what was actually on
screen. Fix: `_box(w,h,pos,stackY,shownRows)` gained a 5th param — the caller's own LIVE
`info.rows.length` (clamped [0,8]) — and now sizes the list band for THAT count, never the pre-scanned
worst case; `pieBandH` formula is byte-for-byte unchanged. `shownRows` OMITTED (never `0` — 
`bigStatsCompositeOntoCanvas`'s own "card" mode, whose `bh` also drives its big-number font size
unrelated to any trade list) falls back to the OLD `_scanMaxResourceRows()`-clamped behaviour,
avoiding a regression there. Cost/Ledger moved into a NEW `_fiveDBox(w,h,pos,stackY)` — a PURE
function of frame height/width/corner alone (zero coupling to the panel's live height or row count),
anchored at the frame's own bottom edge (the amendment's second offered choice — printed here, not
silently assumed): `y = h - margin - bh`, same `x`/`bw` as the panel for visual alignment.
`_pieCostLedgerRows` now draws into this box (registering `pie.cost`/`pie.ledger` as children of
`hud.fiveD`, never `resource-panel`) and also registers the `hud.fiveD` container rect itself.
`window.__hudRowsFloat=1` (retargeted, same mechanism) now moves `hud.fiveD`'s own registered Y by
whatever the trade list's `listEnd.ry` happens to be that frame — a deliberate cross-box mix that
exists ONLY to make the Y vary for the control's own sake, not a claim about where it "should"
visually land. `§HUD_LAYOUT` (cinema_maxq.js) gained a real, independent check: `resourcePanelH=
<actual>(expect <formula>)`, the formula recomputed FRESH from `h` + the live `A._resPanelShownRows`
(stashed by `resourcePanelCompositeOntoCanvas`, never read back from `panel.h` itself, which would be
a tautology) — FAILs if any reserved space survives. `§HUD_LAYOUT_STABLE` gained `fiveDY=[min,max]`
(now the REQUIRED-stable field) and `panelH` was REMOVED from the `ok` gate (kept as an informational
print only) — a necessary side effect: the panel's own height is now SUPPOSED to track content, so
demanding it stay constant would make a healthy bake spuriously FAIL. `ledgerY`/`costY` keep gating
`ok` unchanged (still expected stable, just now relative to `hud.fiveD` instead of the panel).

**Item 2 — fade proven on the frame** (`viewer/cinema_maxq.js`). Found and deleted the real defect:
`_captureFrame`'s `§DATUM_DECOUPLE` bisect-only branch drew `A.flythruDatumCompositeOntoCanvas`
UNCONDITIONALLY, completely outside `_drawUnlessHold`'s own fade wrapper (the SAME overlay draws
again, correctly wrapped, on the normal live-render path below it) — an unwrapped composite call no
alpha check could ever see. Deleted. Then instrumented the capture ctx itself, never re-trusting the
wrapper's own contract: `_drawUnlessHold` now sets `A._inHudFadeWrapper = faded` (true only while
GENUINELY faded — `alpha<1` — not merely "inside this function", so `window.__lpNoFocusHold=1`
forcing `alpha=1` correctly leaves calls UNEXCLUDED); `A.loadPathCompositeOntoCanvas`'s own call is
bracketed with `A._inLoadPathComposite = true/false` (load path draws unwrapped through the hold BY
DESIGN, so its own draws must never count). `_lpInstallDrawInstrument`/`_lpUninstallDrawInstrument`
monkey-patch `fillText`/`fillRect`/`strokeText`/`drawImage` on the capture ctx for the duration of a
hold frame's WHOLE HUD/overlay composite pass (installed right AFTER the base scene render — that
call is deliberately OUTSIDE the instrumented window, since it is not a HUD overlay and must never be
fade-gated — uninstalled right after `§HUD_LAYOUT`/`§LOADPATH_FOCUS` read the count). A call outside
BOTH flags increments `_lpUnwrappedDrawCount`. `§LOADPATH_FOCUS` now prints `unwrappedDraws=N`,
`ok = painted===0 && unwrappedDraws===0`.

**Item 3 — black backdrop in shine mode** (`viewer/cpe_load_path.js`). `_backdropApply`'s
`if (!_lookGhost()) return;` gate REMOVED — the §129.7 item 6 fade (sky/ground/skyline to black
before the freeze, back after release) now runs in BOTH look modes; the shine-through clones
(`depthTest=false`, renderOrder above everything) still render on top regardless, so "the building
stays lit and the stack shines through" holds unchanged. `_backdropWitness`'s matching ghost-mode-
only `INCONCLUSIVE` early-return REMOVED — `§LOADPATH_BACKDROP` now asserts PASS/FAIL in both modes,
same formula, same `window.__lpBackdropNoRestore` control. `§LOADPATH_LOOK` now prints
`backdropFaded=true` unconditionally (previously `_lookGhost()` — false in shine mode).

**Dry runs** (`scratchpad/test_round16_dryrun.js`, 12 asserts, against the REAL lifted
`cpe_resource_panel.js` via `require()` + a Proxy-based fake 2D context, and a verbatim replica of
cinema_maxq.js's own IIFE-scoped instrumentation logic — that file has no exported surface to
`require()` directly): (a) `A._resourcePanelBox(w,h,pos,stackY,shownRows)` at h=480/960, rows=0/3/5/8
— `B.bh` matches the base formula exactly at every point, `pieBandH` unchanged, 0-vs-8-rows produces
a real height difference (never a fixed floor), omitting `shownRows` falls back to the old worst-case
(no regression in bigStats' own card mode). (b) a simulated 6-frame bake with the trade list growing
and shrinking (2→4→6→8→1→3 rows) through the REAL `A.resourcePanelCompositeOntoCanvas` — `hud.fiveD`'s
own registered Y reads IDENTICAL (411) every single frame; the retargeted `__hudRowsFloat` control
DOES move it (571→603→635→667) across a 2→4→6→8 growing list, proving the regression-catching
mechanism fires. (c) the ctx-instrumentation replica: a wrapped call (`_inHudFadeWrapper=true`) and a
load-path call (`_inLoadPathComposite=true`) are correctly excluded, a stray unwrapped call (the
deleted defect's own shape) IS counted (`unwrappedDraws=1`); the `__lpNoFocusHold` control (`faded`
forced false) correctly leaves a normally-wrapped call UNEXCLUDED (`unwrappedDraws>0`). All 12 asserts
pass; every pre-existing test this worktree has accumulated (`test_lifted_verify.js` 22,
`test_loadpath_card.js` 17, `test_loadpath_batchid.js` 10, `test_loadpath_hudfade_fonts.js` 15,
`test_round14_integration.mjs` 16, `test_round15_integration.mjs` 11) re-run and still pass unchanged.
Every touched file (`cpe_load_path.js`, `cinema_maxq.js`, `cpe_resource_panel.js`) syntax-checked
clean via `node vm.Script`.

No bakes run this session (worktree rule, standing instruction). Open follow-up for the next real
bake: confirm `§HUD_LAYOUT resourcePanelH=` reads its own expected value on a real HHS/Terminal clip,
confirm `hud.fiveD`'s registered rect never overlaps the panel or the ladders, confirm
`§LOADPATH_FOCUS unwrappedDraws=0` on a real hold frame, and confirm `§LOADPATH_BACKDROP` now PASSes
in shine mode on the proof bake (HHS 0.2432:0.2770, then Terminal, Hospital per §129.9 item 4).

### ROUND 17 SPEC (2026-09-16, Sonnet, written while the worktree is locked for 18 control bakes reading it — no code landed this entry, GO pending)

Real HHS R16 bake (`/tmp/wt-loadpath/out/HHS_loadpath_r16.log`, coordinator's own read): all 25 lines
PASS, `pickSource=frustum-fallback reason=no-unoccluded-candidate hop0Occluder=IfcSlab:…` honest,
`unwrappedDraws=0`, `fiveDY=[411,411]` — ROUND 15/16 confirmed working live. One witness GAP, not
blocking: `§HUD_LAYOUT` samples at the hold's MIDDLE frame, where the HUD is faded and every non-
load-path drawer has stopped registering ("registered = painted", ROUND 12 item 3's own rule) — its
item list holds only the 5 load-path rects, so `pieBandH=n/a resourcePanelH=n/a(expect n/a)` and
`overlaps=0` are VACUOUS there (PRIMAL LAW clause 4: "a witness that cannot report its own failure is
not a witness... a verdict line must print INCONCLUSIVE, never PASS, when nothing was actually
judged"). The panel-height fix from ROUND 16 item 1 has therefore never actually been EXERCISED by a
real bake yet — every HHS run so far sampled it at exactly the one moment it cannot see anything.

**Fix (spec only, lands in `cinema_maxq.js` on GO):** factor `_hudLayoutWitnessImpl`'s own compute
into a pure `_hudLayoutCompute(rects, h)` (unchanged fields, verbatim) called from TWO print sites:
`§HUD_LAYOUT` (existing, mid-hold) and a NEW `§HUD_LAYOUT_ARM` (sampled at the ARM frame — the last
frame with the full HUD painted, alpha≈1 at elapsedSec=0 before the fade has moved). `cpe_load_path.js`
sets a new one-shot `A._loadPathArmedThisFrame=true` at the SAME `_lp.armed=true` transition that
already computes `_lp.armHudRects` (existing code, untouched); `cinema_maxq.js` consumes+resets it
alongside the existing `A._loadPathMidHoldThisFrame` check, reading THIS frame's own now-fully-
composited `A._hudLayoutRects` (not `_lp.armHudRects` itself — that snapshot is cpe_load_path.js's
own private `underHud`-test input, this witness reads the registry the SAME way `§HUD_LAYOUT` always
has, just at a different frame). `§HUD_LAYOUT_ARM items=[…] overlaps=… overflow=… pieBandH=…
resourcePanelH=actual(expect formula) …` prints the REAL geometry with a real, non-vacuous
`resourcePanelH` check — the actual proof ROUND 16 item 1 needs. `§HUD_LAYOUT` (mid-hold) STAYS —
"it proves the HUD is gone" — but `pieBandH`/`resourcePanelH` now print `INCONCLUSIVE reason=hud-faded`
instead of a vacuous `n/a`/true when `hasPanelData` (`pie.band`/`resource-panel`/`hud.fiveD` all
absent from the sample) is false; the line's own overall PASS/FAIL verdict still comes from whatever
WAS actually checked (the load-path rects' own overlap/overflow), never silently blended with the
INCONCLUSIVE fields.

**Disclosed, NOT yet fixed (found while designing this, broader than the coordinator's own ask —
observe-and-document, not fix-without-agreement, per this session's own standing rule):**
`pieExclusive`, `rowsFullWidth`, and `orderOk`/`costAboveLedger` ALSO default to a vacuous `true` when
their own backing rects (`pie.band`/`pie.cost`/`pie.ledger`) are absent — the SAME class of defect as
`pieBandH`/`resourcePanelH`, just not named in the coordinator's own message. Left alone pending a
decision on whether to widen this same `hasPanelData`-gated INCONCLUSIVE treatment to those fields
too, or leave them as informational-only since `§HUD_LAYOUT_ARM` will be the one that actually judges
them meaningfully going forward.

**Dry run** (`scratchpad/test_round17_hudlayout_arm.js`, written now, 9 asserts, spec-only — NOT
wired into any real file yet): (a) a mid-hold-shaped sample (5 load-path rects only) — `hasPanelData`
correctly reads false, `pieBandH`/`resourcePanelH` print `INCONCLUSIVE reason=hud-faded`, and the
line still reaches a real PASS from the load-path rects' own genuine non-overlap. (b) an arm-frame-
shaped sample (full panel: `hud.status`/`pie.band`/`resource-panel`/`pie.list`/`hud.fiveD`/`pie.cost`/
`pie.ledger`) — `hasPanelData` true, `resourcePanelH=201(expect 201)` a real formula match, verdict a
real PASS. (c) the SAME arm-frame sample with `resource-panel`'s own registered h corrupted back to
272 (the real pre-ROUND-16 defect shape) — `§HUD_LAYOUT_ARM` correctly FAILs, proving this witness
catches at the arm frame exactly what the mid-hold sample structurally cannot. (d) the one-shot
"armed this frame" flag convention (verbatim mirror of `A._loadPathMidHoldThisFrame`'s own fire-once-
per-hold pattern) fires exactly once across 30 simulated frames. All 9 asserts pass; `node vm.Script`
not applicable (pure `.js`, no real-file edit this entry — nothing to syntax-check that isn't already
covered by ROUND 16's own checks).

**No worktree edits this entry** (18 control bakes reading `/tmp/wt-loadpath` per the coordinator's
own instruction) — implementation of the spec above lands on "GO".

### BAKE-RUNNER SESSION CLOSEOUT (2026-09-16/17, Sonnet, bake side only — Fable/`red1-fc` owns the
### code/spec side and is the live reviewer; this session hands off, does not fix code itself)

GO landed; ran to completion. All 18 Round 16 controls baked and scored (HHS, `/tmp/wt-loadpath`,
ports 9843-9863) — see Fable's own scoring for the per-control PASS/FAIL detail, this session only
ran/reported logs. Along the way: found and reported the Terminal deterministic hang (frame i=30/124,
byte-identical hash on 3/3 attempts, `raycast-universe-too-large` — Terminal's load-path candidate
universe hides ~49.6k mesh instances behind 1310 objects) — root-caused and fixed by Fable/builder with
a 20k-instance-budget fallback (`pickSource=frustum-fallback reason=raycast-universe-too-large`,
honest `n/a` occlusion fields); verified clean on Terminal (25/25) and Hospital (29/29, also trips the
same fallback, expected) with no HHS regression. Round 17's 5 findings (HUD vacuous-defaults,
FOCUS-hold unwrapped-draws, backdrop no-restore race, clip-all/hide-rest control wiring, no-clock-freeze
frame-splice gating) all independently re-verified after fix — `lp_backdrop_no_restore` took 4 rounds
(2 silent misses before a diagnostic line exposed the tap firing ~0.5s AFTER the witness already
snapshotted, not a witness-logic bug); `lp_no_clock_freeze` took 2 rounds (HOLD_INSERT fixed first,
RESUME needed a second, separate frame-index-pacing fix). Round-22 HUD/backdrop-population/context-off
generalization (`§LOADPATH_BACKDROP_POPULATION`, `allElseCount=7`/`allElseAtBlack=7/7`,
`§LOADPATH_CONTEXT_OFF` requiring both HUD-suppression AND backdrop halves) verified against the
CODE (`cpe_load_path.js:2152-2183`), not just the printed labels — caught one real regression in the
same run (`§HUD_LAYOUT_ARM overlaps=1`, cost/ledger merge grew the panel 169→207px) that Fable's own
ask didn't cover; fixed (`afterListY` half-row-height math) and reverified clean on r23 (26 PASS, 0
FAIL, full 3079-line read).

**Two items surfaced but NOT resolved, flagged rather than silently dropped:**
1. `§CLI_BAKE_POSECHECK` — `cli_silent_bake.js:778` hard-skips with `'clip window set — t-mapping
   not identity, check by hand'` whenever `--clip` is used. Every bake this whole session used
   `--clip`, so this numeric camera-path-fidelity assertion has never actually run, for any building,
   any round — a pre-existing structural gap in the harness, not a Round 16-23 regression, and its own
   text asks for a manual check the project's own PRIMAL LAW forbids. Needs a clip-aware t-mapping
   before it can judge anything; nobody has built one yet.
2. `lp_clip_all` (Round 16 control) FAILs via `§LOADPATH_VISIBLE clipped=456 nearSideClipped=456`, not
   `beyondVisible` as originally specified — the FAIL fires, but whether that's the field this control
   was meant to exercise was never confirmed either way.

r19/r20/r21_final/r22/r23 logs and `HHS_loadpath_clip_0.2432-0.2770_480p10.mp4` (now r23, replacing an
earlier r21_final copy that predated the HUD-overlap regression+fix) are in `~/Downloads/` — copied on
red1's own direct ask each time, not on this session's initiative. LTU r21 was started then killed on
red1's own "halt the baking" instruction mid-session (unrelated to any defect in LTU itself — never
got far enough to produce a real result) and was never re-run before this handoff.

**Handing off to Fable (`red1-fc`) as the live reviewer/coordinator** — this session's own protocol
(§129 session opener above) was bake-runner only, never code-fix. Both open items above are Fable's or
a fresh bake-runner's to pick up next, per red1's own "close up, let Fable take over."
