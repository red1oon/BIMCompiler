# ⚠ DO NOT REMOVE
## ▶ RESUME 2026-08-14 (session end) — read this block first, it supersedes older status prose below
Reveal (Mechanism C) is BUILT AND MERGED: panel #1349, geometry/timeline #1350, visuals #1352, and TWO
real bug-fixes found from live tests — #1353 (buildup topout) and #1354 (preview never replans). **BOTH
FIXES CONFIRMED WORKING on a real building (HHS_Office_Federated) via a fresh Preview log the same
day, independent of the Hospital run that originally found them:** `§CPE_BUILDUP_TOPOUT topoutU=0.333
src=plan.beats.out (reveal round active)` now fires correctly right after `§CPE_REVEAL ON` (previously
stuck at `src=plan.beats.rise`), and `[S200] §DISC_FILTER [MEP]` fires repeatedly through the scrub —
the ARC/STR-hide is genuinely engaging during preview now. User confirmed directly: "Reveal preview POV
timeline issue resolved, and preview does plays back the MEP." **What's left is narrower still:**

0. **⚠ Process note, read before trusting `/home/red1/bim-ootb` as canon again:** mid-session, a
   "cursory examination" read directly from that shared checkout gave FALSE results — its `HEAD` was
   behind `origin/main` (missing #1352/#1353 entirely) AND it had ~117 lines of another session's
   uncommitted, unrelated edits sitting in `viewer/cinema_path_editor.js`. Caught only because the
   evidence (grep for `cpeRevealApplyVisual`) came back empty when it shouldn't have. Every fix this
   session was built and witnessed in a clean worktree off a freshly-fetched `origin/main` — verify
   against that (or `git show origin/main:<path>`), never the shared checkout directly, until this
   project gets the same PreToolUse block bim-ootb's OTHER shared paths already have (see CLAUDE.md's
   own standing warning about this checkout).
1. **CLOSED — SW cache-version was never the real blocker.** #1353+#1354 alone explain everything
   observed, confirmed live on HHS without needing a cache-clear discussion. Still true that no PR in
   this lane bumped `viewer/sw.js`'s `CACHE_VERSION` (still `v1026`) — harmless so far, but bump it on
   the next real content change in this lane rather than relying on luck again.
2. **CLOSED — `§CPE_BUILDUP_TOPOUT` (PR #1353) confirmed live on HHS**, not just witnessed synthetically.
   `topoutU=0.333 src=plan.beats.out (reveal round active)` in the real preview log.
3. **CLOSED — preview-replan (PR #1354) confirmed live on HHS.** `§DISC_FILTER [MEP]` firing repeatedly
   during scrub is the real, user-visible proof the ARC/STR-hide engages in Preview now, not just in a
   witness. User confirmed both the timeline-numbering issue and MEP playback directly.
4. **"Last stick rule" claim — STILL not independently confirmed either way.** User: "code did not obey
   the last stick rule." #1353+#1354 explain every OTHER symptom reported, and the HHS Preview
   confirmation covers the same ground the "last stick" complaint was about (the round behaving
   correctly relative to the stop stick) — but this was never tested as its own explicit claim. Treat as
   very likely already resolved by #1353+#1354; only reopen if something stop-stick-specific is reported
   again after a full bake.
5. **Next verification step, as the user already planned:** bake ONE fresh run (Alt+C, not just
   Preview) — HHS or Hospital — and read the REAL `§CPE_BUILDUP_TOPOUT` / `§CPE_DAY_COUNTER` /
   `§CINEMA_BEATS` / `§CPE_REVEAL_ROUND` log lines from THAT run. Both pasted logs so far were Preview
   runs (`§CPE_PREVIEW click...`), not bakes — Preview is now confirmed working end to end, but the
   actual exported MP4 path (`cinema_maxq.js`'s frame loop, not `_previewFly`) has not been independently
   re-confirmed since #1353/#1354 landed, even though it shares the same `cpeRevealApplyVisual`/
   `buildupTopoutU` calls and should behave identically by construction.

## 6. Surface/material colouring — separate from Mechanism C, hand to its own agent investigation
User, same mp4 review: MEP shows as "metallic blue" where it should read as standard piping/duct
colours (red/brick for fire protection, orange, grey, etc.) — "or the code replaced surfaces in 2nd
round." Also flagged: "the often over use of blue in structure and stairs etc is also boring" — stairs
suggested as concrete grey or cream instead. **User's explicit ask: dispatch this as its own agent
investigation, pointed at whatever existing prompts/# file already owns surface/material color
handling — do not invent a new colour scheme without reading it first.**

**Ruled out already, checked this session, do not re-suspect:** Mechanism C's own `A.filterDiscs`/
`A._applyDiscVisibility` (`panels.js:816-833`) only ever sets `.visible` (plain Mesh) or uses a
zero-scale-matrix/`setVisibleAt` trick (Instanced/BatchedMesh, `helpers.js:36-73`) — none of the three
paths touch `.material`/color/emissive at all. "The code replaced surfaces in 2nd round" is NOT what's
happening; this needs an independent explanation.

**Found this session — read before touching anything, this is a HARD, previously-learned constraint,
not a starting-from-scratch design question:**
- `[[feedback_ifc_colors]]` (memory) — **"Trust IFC colors."** `_getMaterial` (`streaming.js`) uses the
  REAL, PARSED `material_rgba` from the IFC as-is; a class-based fallback (`STD_MAT`) only fires when
  `material_rgba` is NULL. A prior heuristic (`isMonoGrey`/`CLASS_COLOR_FALLBACK`) that overrode
  "monochrome"-looking real IFC colors with class-based ones was REMOVED (commit `9204febc`, S265,
  see `[[project_sc_coloring]]`) because it wrongly clobbered 57% of a real building's genuine (muted,
  earthy) IFC colors. **Read: if MEP genuinely looks "metallic blue," the FIRST hypothesis to check is
  that this is REAL data from the source IFC** (the authoring tool's own default pipe material), not a
  renderer bug — before building any "fix" that overrides real colors, which is the exact mistake this
  memory entry documents already happened once and was reverted.
- **`prompts/MEP_CLASH_REVEAL_MOVIE.md:36-39,106-109`** — this is almost certainly the "related
  prompts/#" the user means. Documents `A.DISC_COLORS` (`viewer/config.js:43`, a 12-discipline hex
  palette) and leaves an EXPLICIT OPEN QUESTION: does the real render path (`_getMaterial`) ever
  consult `DISC_COLORS`, or is that palette only used for placeholders/highlights/nav (never the
  actually-rendered geometry)? Lines 107-108 already predict "blue-duct/yellow-conduit/red-pipe" as
  the convention worth checking for, and propose a discipline-driven base color IF the gap is
  confirmed — read this section fully before proposing anything new, it may already be most of the
  answer.
- **`prompts/WALKER_FIXTURE_RENDER_MATERIAL_AND_GEOMETRY_CHECK.md:26-28`** — a SEPARATE render path
  (walker-placed fixtures) uses a flat `DW_COLOR[disc]` per-discipline color, no `material_rgba` read
  at all — distinct from streaming.js's real-IFC-color-first path. Worth checking which path Hospital's
  MEP geometry actually goes through before assuming it's the same mechanism `MEP_CLASH_REVEAL_MOVIE.md`
  is asking about.
- `docs/FeatureComparison.md:43` — the DOCUMENTED, intended class-based-fallback behavior: "concrete is
  warm grey, steel is reflective, glass is smooth and blue-tinted" — glass, not MEP/structural, is the
  one thing genuinely SPECCED to default blue. If stairs/structure are reading as blue, that is either
  real IFC data, or a class landing in the wrong fallback bucket — not the glass rule misfiring on the
  wrong geometry, unless that's independently confirmed.

**Real design change from the original ask, decided live before building (not silently invented):**
the "20% translucent ARC/STR ghost" is a FULL HIDE instead — checked live on Duplex, ~80% of ARC/STR
geometry is batched/instanced with materials SHARED across disciplines by colour (not owned per-
discipline), so a scoped translucent fade needs per-instance shader work, real effort out of scope
for this pass. Full hide reuses `A.filterDiscs` (already existed) and gets "sunlight plays through"
for free (Three.js excludes invisible objects from the shadow pass) — the user picked this explicitly
over building the shader work. If true partial translucency on batched/instanced content is ever
wanted, that is a real, separate, named follow-up (per-instance alpha via a custom shader or material
cloning), not a quick tweak.

Mechanisms A and B below are SUPERSEDED
by §Mechanism C — the retrace reveal round (2026-08-14, same session, converged through live design
back-and-forth with the user), which folds both into one concrete design, NOW BUILT — see §Mechanism
C's own status note for exactly what shipped and what (if anything) is still open. Read the log after
every run once build
starts. Origin: user idea, discussed same session as the doors-mystery handoff and the prompts/ bloat
consolidation (see `prompts/4D_SCHEDULE_PERFECTION.md` for the unrelated active bug, not this file).

**Built 2026-08-14 (user, "begin to construct that new feature into the alt-c panel as 'Reveal' just
beside the show room titles box"), bim-ootb PR #1349:** a 'Reveal' checkbox now exists in the Alt+C
Film-Maker panel, same row as 'room titles' — `viewer/cinema_path_editor.js` (`#cpe-reveal`, `_state.reveal`/
`origReveal`, threaded through `_buildOverride`/`_isEdited`/`_capturePanelState`/`_syncPanelControls`/
`_applyPanelState`/`_pathsApply` exactly like `roomTitle`) and `viewer/cinema_maxq.js` (`_reveal` captured
at bake time from `_ov.reveal`). **Panel/state plumbing only — no render or pacing behavior.** Hint text
next to the checkbox and the bake-time console log both say so explicitly, so an ON flag is never
silently swallowed or mistaken for a working feature. Witnessed: `witness_cpe_reveal_panel.js` 7/7
(checkbox exists in the same row, off by default, click toggles + fires `§CPE_REVEAL`, OK-with-only-this-
box still returns `override.reveal=true` per Guardrail 2, zero pageerrors); regression-checked
`witness_cpe_room_title.js` still 11/11 (every shared function this touched still clean).

## Mechanism C — retrace reveal round (2026-08-14, supersedes A+B below, BUILT — PR #1350 + #1352)
Converged live with the user through several corrections this session — this is the concrete design to
build, superseding Mechanism A's "scattered pulses along the outbound walk" and Mechanism B's "cycle
during the closing orbit itself" framing. Both problems A and B were trying to solve (MEP visible
in-transit; a per-discipline parade before the film closes) are folded into ONE extra round, inserted
between the outbound walk and the closing orbit.

### The flow, user's own words assembled from the design conversation
1. **Normal** — dive → spin → walk-the-bands, completely unchanged, arriving at the walk's own end
   (the LAST band/stick — see "STOP stick" correction below) exactly as every film does today.
2. **If Reveal is ON, at that point the closing orbit is SUSPENDED (not started yet) and a new round
   begins:**
   a. **Backward leg** — camera retraces the SAME walked path from the last stick back to the first
      stick ("not absolute start but where the first stick is"). No ghost effect specified for this
      leg — plain travel back to the beginning. *(Assumption, not stated explicitly — flagged, not
      invented as fact.)*
   b. **Forward leg** — camera walks the same path again, first stick → last stick ("resume till last
      stick as usual"). This time ARC/STR is ghosted to ~20% opacity for the whole leg, and any
      discipline the camera comes across (proximity-triggered — this is Mechanism A's original density
      idea, now running continuously through this leg instead of only at scattered stop-sticks) reveals
      through the ghost.
   c. **Tail — discipline parade, easing into the orbit** — as this forward leg closes in on the last
      stick, cycle each discipline present in the building one at a time, ~2s each, with ARC/STR FULLY
      REMOVED (not 20% — gone) for that window; camera eases to near-standstill for each; continues
      until every discipline present has had its turn ("exhausted"). Carries over, not restated but not
      contradicted, from the earlier 2026-08-14 pacing quote: a final ~2s with all disciplines shown
      together before ARC/STR covers back — still standing unless the user says otherwise.
   d. ARC/STR restores solid, the suspended orbit resumes and closes the film exactly as it does today
      — Beat 4 (turn-and-rise) → orbit, UNTOUCHED code, per the research below.
3. **Time Machine buildup — CHECKED, not frozen (revised 2026-08-14, supersedes the "disengaged" ask
   below the line).** User asked to verify rather than assume: "the stop or last stick does not stop
   buildup it seems. Check that first." **Confirmed in code, `cinema_maxq.js:144-168`
   (`§CPE_BUILDUP_TOPOUT`, shipped 2026-08-02):** buildup is deliberately paced to reach 100% at
   `plan.beats.rise` — the START OF THE ORBIT — not at the stop stick. It is explicitly still climbing
   through the whole turn-and-rise beat today, on every existing film; that's the fix that stopped
   Hospital's roof/solar panels finishing inside the closing orbit's last ~1.4s where nobody could see
   them land. **Consequence for round 2: do NOT freeze/disengage buildup.** Once round 2 is inserted
   between the walk and the (now-later) orbit, `plan.beats.rise` shifts later automatically, and the
   EXISTING `_buildupTAt`/`_workCursorAt` machinery keeps buildup climbing smoothly through round 2,
   finishing right before the (shifted) orbit start — same mechanism every film already uses, zero new
   pacing code needed. This also means buildup is naturally closest to complete near round 2's TAIL
   (approaching the last stick again), which is exactly where step 2c's discipline-parade/full-reveal
   already sits — the two were never actually in conflict once this was checked. The §STOP-stick reveal
   breather section below is RETRACTED by the user for the same reason ("since we are flying thru 2nd
   round, thus we need not adjust present stop to have all finishes ended before it") — moot now that
   round 2 gives buildup the extra real seconds it needs, no 2s-margin bookkeeping required.
4. **Preview parity, hard requirement** (user, 2026-08-14: "during preview, it can also go along so
   user confident it is working"): round 2 must play in the live in-editor Preview/scrub fly-through,
   not only the exported bake — the user wants to see it working before committing to a full export.
   Precedent already in this codebase: `roomTitle`'s `roomTitleLiveStart`/`roomTitleLiveTick`/
   `roomTitleLiveStop` triple, called from the preview-fly tick loop AND driving the same visual state
   the bake reads — same pattern to follow here, not a new architecture.

### Corrected terminology and facts (code research this session, viewer/effects.js + viewer/tools.js +
viewer/panels.js — read this before writing anything, several things in Mechanism A/B below drifted)
- **Beat order of a baked film**: dive → spin → walk (bands/hose) → turn-and-rise → orbit. Composed by
  `poseAt(tNorm)` inside `_cinemaPathPlan()`, `viewer/effects.js:4687` (builder) / `~6296-6360`
  (`poseAt`'s if/else chain over beat boundaries `tD,tS,tO,tR`). `cinema_maxq.js` does not reimplement
  this — it calls `plan.poseAt(tNorm)` (`cinema_maxq.js:862-868`).
- **"STOP stick" is a real, specific thing in the code**: `_labelOf()`/`ROW_LABEL` in
  `cinema_path_editor.js` (~602-623) name exactly the LAST band `'stop'` — "end of the WALK, not the
  film; its far end stretches the orbit." That is what "the STOP stick"/"last stick" means throughout
  this file. (Separately, the `hold>0` pause mechanism — §CPE_STICK_HOLD — can fire on ANY interior
  band, not just this one; do not conflate "a stick with a hold" with "the STOP stick.")
- **The discipline code is `ARC`, not `ARCH`**, in `A.DISC_COLORS` (`viewer/config.js:43-48`). This
  file has been writing "ARCH/STR" — that's this file's own drift, not the user's; the user's own
  quotes always said "ARC/STR." Use `ARC` going forward to match the real data.
- **The closing orbit does not care where the camera physically is.** Its start pose (`pivot`,
  `exitAz`, `orbitRadius`) is computed once from the ARC bounding box + exit-door geometry — nothing
  runtime-camera-dependent (`viewer/effects.js:4709-4718`, `5241`, `5250-5256`, `6217-6259`). The
  turn-and-rise beat (Beat 4, `viewer/effects.js:6361-6374`) is what bridges "wherever the camera last
  was" to that fixed pose, and lands exactly on it by construction. **This means round 2 can be inserted
  right after the outbound walk (Beat 3) and hand off into the existing Beat 4→orbit unchanged**, as
  long as Beat 4 receives round 2's actual end pose as its new starting point instead of the walk's raw
  `exitOuter` — and since round 2 ends back at the last stick (same point `exitOuter` already is), Beat
  4 needs NO retuning at all.
- **No reverse/retrace utility exists** (checked `cinema_path_editor.js`, `cinema_maxq.js`,
  `effects.js` for reverse/retrace/backward — nothing). Don't reverse the `bands` array — the walk is
  already parameterised by fraction `f∈[0,1]` via `_outPos(f)` (`viewer/effects.js:5120`, called from
  Beat 3's `_beat3Pose`). Round 2's backward leg is just `_outPos(f)` sampled 1→0; the forward leg is
  the same curve sampled 0→1 again. Reuses the exact walked geometry, no second path to keep in sync.
- **A full-hide, discipline-scoped primitive already exists and is reusable as-is**:
  `A.filterDiscs(list)` / `A.filterDisc(disc)` (`viewer/panels.js:746-779`) + `A._applyDiscVisibility`
  (`~816-833`) — shows ONLY the disciplines named, hiding the rest via `.visible=false` on every
  mesh/instanced/batched element keyed by its own `userData.disc`/`meta.disc`. This is exactly the tail
  step (2c above, "ARC/STR FULLY REMOVED") — call it with the complement of `['ARC','STR']`. Because
  it's a hard `.visible=false`, Three.js already excludes it from the shadow pass for free — this is
  the primitive that makes the "sunlight plays through" full-reveal moment work correctly with zero
  extra shadow code.
- **No existing primitive does a discipline-SCOPED translucent ghost** (the 20% forward-leg effect,
  2b above). `A.toggleXray` (`viewer/tools.js:228-267`) is the only opacity-ghost mechanism that exists,
  and it is global — every material, no discipline filter. Building the scoped version means mirroring
  its opacity-flip logic but walking only ARC/STR elements, using the same `userData.disc`/`meta.disc`
  lookup `filterDiscs` already reads.
- **`toggleXray` never touches `castShadow`** (confirmed reading `tools.js:228-267` line by line — only
  `transparent`/`opacity`/`side` change). A translucent mesh still casts a full, solid-looking shadow in
  Three.js by default. For the user's "will sunlight play through" ask during the 20% forward leg (not
  just the fully-hidden tail, which already gets this for free per above): the new scoped-ghost function
  must ALSO set `castShadow=false` on the same ARC/STR elements while ghosted, and restore it after —
  this is real, separate work, not a side effect of the opacity change.

### What actually got built (2026-08-14, bim-ootb PR #1350 geometry + #1352 visuals)
- **New beat inserted between Beat 3 (walk) and Beat 4 (turn-and-rise)**, `effects.js`'s
  `_cinemaPathPlan`/`poseAt`, gated on a new `_cpeReveal` module var (set from `ov.reveal` in
  `A.cinemaPathPlan`'s wrapper, same pattern as `_cpeBands`/`_cpeHose`). A new boundary `tV` (between
  `tO` and `tR`) is zero-width — `tV===tO` exactly — whenever reveal is off or the building has no
  non-ARC/STR discipline, so `poseAt`'s new branch is unreachable and every existing film is
  byte-identical to before this feature (Guardrail 2, verified).
- **Duration is real and additive**, not squeezed from the existing runtime: `A.cpeRevealDiscsPresent()`
  (one shared implementation, called from both `effects.js`'s plan builder and
  `cinema_path_editor.js`'s own `_naturalDuration()`) counts actual live non-ARC/STR elements; the
  round costs `2×(walk length/speed) + 2s/discipline + 2s`, and the panel's own duration estimate
  includes it so `nFrames` grows to fit.
- **Position** reuses `_outPos(f)` — the exact curve Beat 3 already walks — sampled backward (1→0)
  then forward (0→1) again. No reverse-path utility existed or was needed.
- **Gaze**, found and fixed while witnessing (not assumed correct on paper): the round's seam blends
  must anchor to the ACTUAL rate-limited gaze Beat 3/4 render at `tO`/`tV` (`_gazeRateAt`), not the
  raw `_beat3EndDir` — anchoring to raw measured a real 63°/12° instantaneous jump on Duplex; now
  0.39°/0.02°. A latent bug in `_gazeRateBuild`'s own copy of the Beat 4 formula (still referencing
  the old `tO` boundary) was caught and fixed at the same time.
- **Visual layer — real design change from the original ask, decided live, not silently substituted:**
  the "20% translucent ARC/STR ghost" became a FULL HIDE. Checked live on Duplex: ~80% of ARC/STR
  geometry is batched/instanced with materials SHARED across disciplines by colour, not owned
  per-discipline — true partial translucency needs per-instance shader work, real effort out of scope
  for this pass. Full hide reuses `A.filterDiscs` (already existed, `panels.js` §NAV_FIND_002) and gets
  "sunlight plays through" for free (Three.js excludes invisible objects from the shadow pass) — no
  `castShadow` code needed after all. `A.cpeRevealVisualAt(plan, tNorm)` is a pure function (phase +
  which discs to show, computed from `plan.beats`/`plan.reveal`); `A.cpeRevealApplyVisual(plan, tNorm)`
  applies it, snapshotting whatever discipline filter was already active (Role filter, Find isolate) on
  entry and restoring exactly that on exit — never a blind "show everything" — and skips the
  scene-traversing `_applyDiscVisibility` call when nothing changed since the last tick.
- **Preview parity** (user: "during preview, it can also go along so user confident it is working"):
  both `cpeRevealVisualAt`/`cpeRevealApplyVisual` are called identically from the bake loop
  (`cinema_maxq.js`, per-frame) and the preview-fly tick loop (`cinema_path_editor.js`'s
  `_previewFly`) — camera geometry already gets this for free (both read the same `plan.poseAt`), the
  visual layer needed the explicit second call site. Restore-on-exit added to both loops' existing
  exit contracts (same pattern as `ghostGroundRestore`/`roomTitleLiveStop`) — normal completion,
  cancel, and the bake's throw/finally path.
- **TM buildup — checked, not frozen** (see the dated note above): naturally keeps climbing through
  the round via the existing `plan.beats.rise` topout mechanism, no new pacing code needed.
- Witnessed 27/27 (`witness_cpe_reveal_round.js`) + regression-clean on `witness_cpe_reveal_panel.js`
  (7/7) and `witness_cpe_room_title.js` (11/11).

### Retired / superseded open items (were unresolved when this file was spec-only, resolved by the
above before or during build — kept for the record, not to be re-litigated)
- ~~Backward leg ghost?~~ Resolved: plain retrace, no visual override — confirmed correct, matches
  the user's own description of the flow.
- ~~Forward leg pace?~~ Resolved: same speed as the outbound walk (`totalLen/CINEMA_WALK_MPS`).
- ~~Whitewash risk for a translucent ghost (Open Question 1)?~~ MOOT — there is no translucent ghost;
  full hide has no coverage-stacking failure mode to measure.
- **Still genuinely open, not addressed by the above:** the density-threshold question from the
  original Mechanism A ("comes across" a discipline) doesn't apply to the built design either — the
  forward leg now shows ALL non-ARC/STR disciplines together for its whole duration, not a
  proximity-triggered subset. If a future ask wants the forward leg to be selective (only reveal what's
  actually nearby, not everything at once), that is new scope, not a bug in what shipped.

## ORIGIN — the ask, verbatim shape
During movie-making, a "Reveal" checkbox that does two things:
1. **Final-orbit discipline parade** — at the start of the final orbit, the movie slows, ARCH/STR
   ghosts to reveal the other disciplines, a status caption names which one ("Electrical", "Fire
   Protection", "Mechanical", ...), cycling through each, then all together, then ARCH/STR solidifies
   again as the orbit rises to close the film.
2. **In-transit ambient reveal** — while the camera is travelling through the building mid-film (not
   just the final orbit), wherever there's a dense cluster of already-meshed MEP nearby, ARCH/STR
   ghosts briefly (~2s) to let it read, then returns solid — without altering the baked camera path's
   timing/pacing at all, purely a render-layer overlay.

## CORRECTIONS TO THE USER'S OWN FRAMING — verified against current code, 2026-08-13
The user named "Alt-Z x-ray" as the reusable primitive. Checked live in `deploy/dev`:
- **Alt+Z X-ray is DEAD** — `deploy/dev/scene.js:1174`: `// §S280: Alt+Z X-Ray removed — too costly,
  OutlinePass replaces it`. Do not design against it; it no longer exists.
- **The live x-ray today is the plain `X` key** → `A.toggleXray` (`deploy/dev/tools.js:83`). It flips
  `transparent=true, opacity=0.3, side=DoubleSide` on every material already in `A._matCache` — a
  **global**, all-disciplines, flag-flip (no rebuild, cheap). Room lens / Find highlight already reuse
  this same primitive (`navigate_find.js:406-497`). It is NOT per-discipline as-is.
- **Alt+X is the wireframe bbox ghost** the user called "not good ghost" — confirmed still real
  (`tour.js:115` references "switching to Alt-X bbxes", 2026-07-16) and matches the standing finding
  below. Discipline-colored, instanced `BoxGeometry` wireframes, drawn from `element_transforms.bbox_*`
  — free, but reads as an outline, not a ghost-fill.

## THE HARD CONSTRAINT — already proven, do not re-test from scratch
Standing finding (Alt+X design history, 2026-06-07): **a filled/translucent whole-envelope ghost
WHITEWASHES dense buildings (Hospital 63k / Terminal 48k / LTU 122k) at ANY opacity.** 0.12→0.05 was
tried and did not fix it — the cause is **coverage** (every overlapping translucent face fills the
whole silhouette; MAX-blend already caps the stacking), not opacity magnitude. Only Duplex-scale
(~1.1k elements) looked fine filled. This is the exact reason Alt+X shipped as wireframe-bbox instead
of a filled shell.

**"Extra weak" opacity alone will NOT dodge this on the buildings that matter most (Hospital, Terminal,
LTU).** This is the single biggest risk in mechanism B below and must be measured on a real dense
building before any render-approach decision, not eyeballed — per this project's own FUNDAMENTAL LAW
(numeric proof, not screenshots).

## Mechanism A — in-transit ambient reveal pulses
- **Trigger (refined 2026-08-13, user clarification):** NOT a continuous per-frame density poll while
  moving — anchored to the path's own planted waypoints ("sticks", CPE's existing term for a dropped
  pin). Fires only from a STOP stick (a waypoint where the baked path pauses), not while the camera is
  still travelling. This directly answers/replaces Open Question 3 below (no re-fire/flicker risk from
  continuous polling, since it only evaluates at discrete stop points).
- **Duration/opacity, user's own reasoning:** ~2s, and only PARTIALLY faded (not near-invisible) —
  brief enough + partial enough that the user doesn't lose visual/spatial memory of the envelope while
  it's ghosted. First-guess parameter: **opacity 0.2** (fainter than the current live x-ray's 0.3
  default — that 0.3 is just the existing `toggleXray` value, not a proposed answer, see note below).
  0.2 is reasonable to try here specifically because A's footprint is local (see whitewash note below)
  — this number is NOT validated for Mechanism B.
- **At a stop stick, condition:** local MEP density near the camera (still) crosses the threshold —
  i.e. the stick location determines WHEN to check, the density check still determines WHETHER to fire.
- **Reuse, don't build new:** the R-tree already built for clash detection (`measure.js`, deferred to
  first clash-panel open) is the natural spatial index for "elements within radius R of camera position,
  discipline ≠ ARC/STR" — no new spatial structure needed.
- **Reuse:** `A.DISC_COLORS` (`config.js:20`) already enumerates the discipline codes (ARC, STR, MEP,
  ELEC, FP, ACMV, PLB, HEAT, HVAC, SAN, VENT) and every element already carries its discipline as a
  WHERE-column per `docs/internal/WalkerDoctrine.md` — this is the same data Alt+X's discipline-colored
  ghost already reads, reuse the same filter, don't invent a new discipline lookup.
- **Hard constraint from the user, verbatim:** must not break camera path stride — this has to be a
  pure render-layer opacity tween keyed to elapsed film-time or camera position, with the camera's own
  advancement completely untouched by whether a pulse is firing.
- **Possible escape from the whitewash problem:** because this only ghosts elements local to the
  camera (not the whole building), the affected silhouette is small against the rest of the solid
  scene — plausible it sidesteps the coverage problem above. **Unverified — first thing to witness
  before committing to filled-fill for A specifically** (A's exposure is much smaller than B's, so it
  may get away with filled where B can't).

## Mechanism B — final-orbit discipline parade
- Slow the orbit at its start; ghost ALL of ARCH/STR (whole-building, not local — this is the case most
  exposed to the whitewash problem above); cycle disciplines one at a time with a status caption
  ("Electrical", "Fire Protection", "Mechanical", ...); show all together; resolve ARCH/STR back to
  solid as the orbit completes.
- **Orbit is 3 phases, not a flat shot throughout (2026-08-13, user, verified against code)** —
  `tour.js:1506-1519`, the `orbit` action, is 3 phases against progress `to` (0→1):
  1. `to < 0.2` — climb-in from the approach pose up to the orbit's elevated height.
  2. `0.2 ≤ to < 0.6` — **plateau at full `tiltDeg` (35-40°, an "atop"/elevated look-down angle)**,
     constant height (`orbitH`).
  3. `to ≥ 0.6` — descent: `effectiveTilt = tiltRad * (1 - descentProgress²)` unwinds the tilt toward
     flat/level WHILE camera height falls toward `_groundY`, both finishing together at `to = 1`.
  The discipline-cycle/solidify choreography needs to be keyed to these same three phases rather than
  assuming a constant camera angle and running an independent caption timer alongside it.
- **Pacing/dwell model (2026-08-14, user, verbatim):** "slowing down the cam last move after last
  element mesh appearance? That slowing down is almost standstill adding perhaps 2 secs for each DISC
  with final 2 secs is all DISC together before ARC/STR covers back and path resumes as normal. **No
  change in path.**" Read as the timing model for the phase-mapping above: the slow-down is
  EVENT-triggered (the last element mesh of the current discipline appearing), not a fixed clock offset
  — camera speed eases toward near-zero at that moment, holds ~2s per discipline while its caption
  reads, then ~2s once more for all-disciplines-together, then resumes normal orbit speed as ARCH/STR
  solidifies. Pacing/dwell only, added ON TOP of the existing baked orbit geometry — path
  (position/radius/tilt) untouched, the same "pure render-layer, camera advancement untouched"
  constraint already stated for Mechanism A.
- **Not yet reconciled (one open item — this used to be duplicated across two sections, consolidated
  2026-08-14):** how the ~2s×N-discipline dwell fits inside the 3-phase orbit above — almost certainly
  the elevated plateau (phase 2, already the natural fit for "widest/most stable view"), without
  stealing time from climb-in or descent, or the orbit's total duration needs to grow to absorb it.
  Decide once Open Question 1 (render approach) is settled — render approach affects how long each
  discipline actually needs to read on screen.
- **Render-approach candidates for the ARCH/STR ghost (open, no decision yet):**
  1. Filled weak-opacity shell — the user's original suggestion. Proven risky per the hard constraint
     above on any building bigger than Duplex-scale.
  2. Reuse `OutlinePass` — already the current replacement for the old costly Alt+Z x-ray per
     §S280 — show ARCH/STR as a silhouette/outline instead of a filled translucent shell. Sidesteps
     coverage entirely by construction (no filled faces to stack).
  3. Reuse Alt+X's existing wireframe-bbox ghost as-is for B, rather than building a new filled
     variant — it's already proven not to whitewash, already discipline-colorable, already free.
- **Skip disciplines with zero elements in the building being filmed** — per WalkerDoctrine, small
  residential buildings (SH/DX/SC) walk `duplex_rules.db` and can be missing whole disciplines (e.g. no
  FP/sprinkler) that Terminal-class buildings have. Don't cycle an empty caption for a discipline the
  building never had.
- **Caption text/order:** reuse `A.DISC_COLORS`' existing code set for which disciplines exist and in
  what order; a human-readable label map (ELEC→"Electrical", FP→"Fire Protection", etc.) needs to be
  checked against the locale files (`deploy/dev/locales/*.js` already has `ui_xray_found` etc. — check
  for existing discipline label strings before inventing new ones) rather than hand-writing new labels.

## STOP-stick reveal breather — RETRACTED (2026-08-14, user, superseded by §Mechanism C)
**Retracted by the user same day it was written:** "since we are flying thru 2nd round, thus we need
not adjust present stop to have all finishes ended before it." Moot once round 2 exists — buildup keeps
climbing through round 2 exactly as it already does through today's turn-and-rise beat
(`§CPE_BUILDUP_TOPOUT`, see §Mechanism C item 3), so round 2's own length is the breather; no schedule-
side or stick-placement enforcement needed. Kept below for the record, not to be resumed.

**Original text (historical, do not act on this):** Now that MEP's 4D schedule is pushed toward the end of
the buildup timeline (schedule-generator side, out of scope for this file), the risk is the LAST MEP
mesh appearing AT OR AFTER a STOP stick's own timestamp — leaving zero runway for either the
discipline-parade dwell (Mechanism B, above) or the ambient pulse (Mechanism A, which fires only from a
STOP stick) to actually read before the path holds/resumes. User's own framing: **the very last mesh
appearance must land at STOP-stick time minus 2s, never after** — a minimum 2s breather between "last
thing appears" and "path holds at the stick," so the reveal has room to sink in rather than firing on
top of geometry that is still appearing.
- **Where this constraint is enforced is NOT decided** — could be the schedule generator leaving 2s of
  slack before a stick's timestamp, or the stick-placement logic checking the schedule and
  refusing/nudging a stick that would otherwise land within 2s of the last mesh. Needs a design pass;
  not assumed to be either side by default.
- **Relates to, does not resolve:** the open Auto-4D heavy-item-duration item ([[project_cpm_4d_generator_lane]],
  #1317, still open) — that lane controls WHEN MEP elements finish appearing; this constraint is a
  downstream consumer of that timeline, not a fix to it.
- **Interacts with Open Question 2** (density threshold for Mechanism A's trigger) — a stick that fails
  the 2s-breather check may also need excluding from firing a pulse at all: nothing has finished
  revealing yet to reward looking at.
- Not built. Same "measured, not eyeballed" discipline as everything else here — first step once
  prioritized is measuring how often a real bake's STOP sticks currently violate this 2s minimum, on a
  building with MEP scheduled late (Hospital or Terminal), before designing the fix.

## Open questions (Mechanism A/B, RETIRED — kept for the record, not applicable to the built §Mechanism C)
Mechanism C's own build notes above are the current status; these predate it and were never
individually re-answered once C replaced A/B wholesale — most are moot by construction (there is no
translucent ghost to whitewash, no proximity-triggered pulse, no discipline caption/HUD in what
shipped). Do not resume any of these unprompted; they describe a design that was superseded, not one
still being decided.
1. **Render approach for B** (filled-weak vs. OutlinePass silhouette vs. reused Alt+X wireframe-bbox).
   Decide only after measuring coverage% on one real dense building (Hospital or Terminal) — same
   discipline this project already applied to the original Alt+X whitewash finding. This is the one
   question that can sink the whole "extra weak x-ray" framing if the answer is "still whitewashes."
   **A specific opacity value (0.2, 0.3, or anything else in the filled-shell family) does NOT answer
   this question** — 0.12→0.05 was already tried on a filled ghost and didn't fix the whitewash, so no
   number in this family is expected to fix it either; the fix (if needed) is a different render
   technique (outline/wireframe), not a smaller opacity.
2. **Density threshold for A's trigger** — how close a radius, how many non-ARC/STR elements, before a
   pulse fires (now only evaluated AT a stop stick, per the 2026-08-13 refinement above, not continuously
   while moving). No existing precedent to reuse; first guess needs tuning against a real flythrough.
3. ~~Re-fire behavior for A~~ — **answered 2026-08-13**: tied to discrete stop sticks, not continuous
   polling, so no per-frame flicker risk. Residual question: does the SAME stop stick re-fire if the
   camera pauses there more than once (e.g. scrubbing back), or only once per bake?
4. **Caption/HUD mechanism** — checked `tour.js` for an existing status-text overlay during bake and
   found none obviously named; needs a dedicated look (or confirmation it doesn't exist yet) before
   assuming one can be reused for the discipline captions.
5. **Is "Reveal" a single global toggle or per-building?** Small residential buildings can have near-zero
   MEP disciplines extracted — the checkbox should probably no-op quietly there rather than cycle empty
   captions, needs a decision on how that's surfaced (disabled checkbox? silent skip?).
6. ~~STOP-stick reveal breather enforcement point~~ — **RETRACTED 2026-08-14**, see the dedicated
   section above. Superseded by §Mechanism C existing at all.

## Competitive scan — "does any other BIM viewer do this?"
Checked 2026-08-13 (web search, not a vendor-doc deep dive — read as "not found," not "proven absent"):
Navisworks, Twinmotion, Enscape, Fuzor, BIM 360/ACC. All of them expose manual discipline/category
visibility toggles. The cinematic-focused viz tools (Twinmotion, Fuzor) support scripted/keyframed
animations that CAN include visibility or material overrides at fixed points a human sets by hand —
Fuzor's cinematic mode specifically lists "visibility options" among its keyframeable effects. **No
tool found that automatically senses proximity/density of nearby disciplines during a generated
flythrough and auto-triggers a ghost-reveal choreography** — that combination (live density sensing +
auto-triggered pulses tied to a generated, not hand-keyframed, camera path) doesn't show up in what's
documented for these tools. If it holds up, this is a genuine differentiator, consistent with this
project's existing "not a smaller Revit" positioning (`prompts/PREFAB_LASSO_MACRO_LIBRARY_DIALOGUE.md`).

Sources:
- [Twinmotion vs Enscape in 2026 - Vagon](https://vagon.io/blog/twinmotion-vs-enscape)
- [Product Review: Real-Time Rendering with Fuzor | AUGI](https://www.augi.com/articles/detail/product-review-real-time-rendering-with-fuzor)
- [Twinmotion vs Enscape: In-Depth 2026 Comparison](https://www.myarchitectai.com/blog/twinmotion-vs-enscape)

## Status
BUILT AND MERGED, 2026-08-14 — bim-ootb PR #1349 (panel), #1350 (geometry/timeline), #1352 (visuals),
#1353 (buildup-topout fix), #1354 (preview-replan fix). Both #1353/#1354 were found from the user's
OWN live Hospital test, not pre-emptively — see the `▶ RESUME` block at the top of this file for the
full diagnosis chain and what's left to re-verify. The 'Reveal' checkbox in the Alt+C Film-Maker panel
now bakes AND previews a real out-and-back retrace round with ARC/STR hidden to show every other
discipline, cycling one-at-a-time in the tail, buildup guaranteed complete before the round starts.
Witnessed 36/36 on `witness_cpe_reveal_round.js` + regression-clean on both sibling witnesses.
Mechanisms A and B (and their own Open Questions above) are retired, superseded by §Mechanism C
wholesale — do not resume them unprompted. Named, real follow-up if ever wanted: true per-instance
translucency for the ~80% of ARC/STR geometry that's batched/instanced (would need custom shader work
or material cloning) — full hide was the user's own explicit choice over building that, not a
placeholder awaiting it.

## Findings 2026-08-14 — surface/material colour investigation (dispatched agent, §6 handoff)

**Task:** answer why HHS_Office_Federated's cinema-reveal bake shows MEP as "metallic blue" instead of
trade colours, and STR/stairs as "boring blue," per §6 above. Investigation only, per the handoff's own
instruction — nothing built, nothing pushed.

### Method — real numbers, not a guess
Queried `buildings/HHS_Office_Federated_extracted.db` (`elements_meta` table) directly — the actual
extracted DB this building's bake reads from — and traced `A._getMaterial`
(`viewer/streaming.js:338-491`, read at `origin/main` via `git show`, since the shared `~/bim-ootb`
checkout was dirty + stale this session, same caution the `▶ RESUME` block at the top of this file
already flags) line by line, plus every `A.DISC_COLORS` consumer across the whole `viewer/` tree
(`git grep DISC_COLORS origin/main -- viewer/`).

### §6's three named things, resolved
1. **`[[feedback_ifc_colors]]` "trust IFC colors" — checked, correctly implemented, NOT the bug.**
   `_getMaterial` line 475: `if (!rgbaStr && stdMat) { ... }` — the `STD_MAT` class fallback strictly
   only fires when `material_rgba` is NULL/empty. Confirmed real IFC colour is used as-is whenever
   present. This part of the code is doing exactly what the doctrine requires.
2. **`MEP_CLASH_REVEAL_MOVIE.md`'s open question — ANSWERED, definitively: `_getMaterial` NEVER reaches
   `A.DISC_COLORS`.** Grepped every `DISC_COLORS` reference in `viewer/` (13 files: `city.js`,
   `dlod_nav.js`, `export_5d.js`, `measure.js`, `navigate_find.js`, `panels.js`, `time_machine.js`,
   `streaming.js:266`, plus standalone copies in `boq_charts.html`/`import.js`/`rates.js`/
   `wizard_classify.js`). Every single one is a placeholder/highlight/nav-minimap/UI-swatch/BOQ-chart/
   import-preview/wizard-preview consumer. `streaming.js:266` — the one hit inside `streaming.js`
   itself — is `_drawBboxPlaceholders`, the wireframe LOADING placeholder shown before real geometry
   streams in, not the real render. `_getMaterial` (the function that actually ships colour in a
   recorded/baked frame) has zero references to `DISC_COLORS` anywhere in its 150-odd lines. Confirmed,
   not assumed.
3. **`docs/FeatureComparison.md:43`'s glass-blue rule — real, and NOT what's causing MEP/STR/stairs.**
   Checked directly: `IfcCurtainWall`/`IfcWindow` STD_MAT entries are the only two genuinely blue-tinted
   glass entries, and HHS's own curtain-wall glazing (438 `IfcPlate` elements, real populated
   `material_rgba` = `0.502,0.502,1.000,0.250` — genuinely blue, 25% opaque) independently confirms this
   convention is real and is being read correctly. This is a real, correct, unrelated contributor to the
   overall "everything reads blue" impression in the shot — not a misfire, not MEP/STR's cause.

### The real root cause — direct DB query, `elements_meta` in `HHS_Office_Federated_extracted.db`
```
discipline counts:      MEP=3399  ARC=1774  STR=1707
MEP material_rgba:      NULL=3390 (99.7%)   has_rgba=9
STR material_rgba:      NULL=0    (0%)      has_rgba=1707 (100%)
```
**MEP — root cause (b)+(c), a real, confirmed gap, NOT real IFC data:**
Essentially every MEP element in HHS (3390/3399) has NULL `material_rgba`. Their `ifc_class` breakdown:
`IfcFlowFitting`=1381, `IfcFlowSegment`=1284, `IfcFlowTerminal`=725 — exactly the "IFC2x3 generic-MEP
convention (Clinic/LTU/**HHS**...)" `streaming.js` already names in its own comment at line ~457. All
three land in `STD_MAT` (streaming.js:376-378):
```
IfcFlowSegment:  r:0.48 g:0.52 b:0.58  rough:0.40 metal:0.30
IfcFlowFitting:  r:0.50 g:0.53 b:0.57  rough:0.40 metal:0.30
IfcFlowTerminal: r:0.45 g:0.50 b:0.55  rough:0.40 metal:0.30
```
All three are blue-leaning (b>r), moderate-metal, low-roughness — glossy, cool-toned metal. Under this
viewer's PBR pipeline (envMapIntensity 0.6 + ACES) this is exactly what reads on screen as "metallic
blue." **This is effectively HHS's WHOLE MEP discipline** — confirmed by direct query, not eyeballed.
It is a discipline-BLIND class fallback: `STD_MAT` is keyed only on `ifc_class`, and IFC2x3's generic
`IfcFlow*` classes carry no trade information in the class name itself — so fire protection, plumbing,
HVAC, all identically-classed elements get the identical flat blue-grey metal look regardless of
`elements_meta.discipline` (FP/PLB/ACMV/etc.), even though that column is already populated and already
selected in the same SQL row (`streaming.js:109,170,2067` all `SELECT ... m.discipline ...`).
`A.DISC_COLORS` already has the variety the user wants (FP=`0xcc8844` brick/orange, ACMV=`0xcc4444`
red, PLB=`0x8844cc` purple, HEAT=`0xff6644` red-orange) — it is simply never consulted here.

**STR — root cause (a), genuinely real IFC-authored data, per doctrine correctly trusted, no code fix
warranted:** 100% of STR elements (1707/1707) have real, populated `material_rgba`.
`IfcMember` (1450 elements, `element_name` = "Rechteckiger Pfosten..." — German for curtain-wall
mullion/post, "with cover profile") carries `material_rgba = 0.384,0.400,0.463` and
`material_name = "≈ Purple"`. `IfcColumn` (257) carries `material_rgba = 0.937,0.969,0.969` and
`material_name = "≈ White"`. The `≈` prefix is the exporting authoring tool's own generic
approximate-colour naming for an unassigned/default material — not a deliberately chosen "structure =
blue" trade convention by anyone — but it is genuinely real, populated data sitting in the source IFC.
Per `[[feedback_ifc_colors]]`, this must NOT be overridden by any fix; the correct action is telling the
user this is a fact about HHS's own source authoring, not a renderer bug.

**Stairs — root cause (c), same fallback-bucket mechanism as MEP but a DIFFERENT class, not the stair
tread itself:** `IfcStair` (12) + `IfcStairFlight` (8), all 20 elements NULL `material_rgba`, all
discipline ARC. `STD_MAT[IfcStair]` = warm grey (`r:0.68 g:0.66 b:0.63`, metal:0.00) — NOT blue.
`IfcStairFlight` has no `STD_MAT` entry at all → the generic default (`r=g=b=0.7`, metal:0.08) — also
NOT blue. **The stair tread material is not the source of "boring blue."** The far more likely
contributor: HHS's 14 `IfcRailing` elements (`element_name` = "Railing:Stahl (1) - Horizontal" — German
for steel railing), both `material_name` AND `material_rgba` blank/NULL, landing in
`STD_MAT[IfcRailing]` = `r:0.40 g:0.42 b:0.45, metal:0.55` — the single bluest-leaning, most reflective
entry in the entire `STD_MAT` table. Stair railings are visually prominent, highly reflective, and
directly adjacent to every stair a camera passes — the most plausible source of "stairs read blue,"
same fallback-bucket mechanism as MEP, a different `ifc_class`.

### Verdict, per §6's (a)-(d) options
Not a single answer — genuinely a mix, confirmed with real numbers for each piece:
- **MEP "metallic blue" = (b)+(c) combined, a real and fixable gap.** `A.DISC_COLORS` exists and already
  has the trade variety wanted; `_getMaterial` never reaches it; HHS's actual MEP data (IFC2x3 generic
  `IfcFlow*` classes, 99.7% NULL rgba) falls into a class-only, discipline-blind fallback bucket that
  happens to be uniformly blue-grey metal for every trade alike.
- **STR "boring blue" = (a), real data, no fix.** 100% populated, genuinely blue-leaning per the source
  IFC's own generic material naming — this is a fact to tell the user, not a bug to patch.
- **Stairs "boring blue" = (c), same mechanism as MEP, wrong element (railings, not treads).** The tread
  fallback is already warm/neutral grey; the adjacent steel railings' fallback is the bluest, most
  metallic entry in the whole table.
- **A fourth, unprompted finding:** HHS's curtain-wall glazing (438 `IfcPlate`, real blue-translucent
  data) reinforces the overall "everything reads blue" impression across the whole bake, independent of
  MEP/STR — correct behaviour per the documented glass-blue rule, not a bug, just worth naming so the
  next session doesn't re-attribute it to the MEP or STR mechanisms above.

### Precise fix — named, NOT implemented (per this task's explicit scope)
Thread `discipline` (already selected in every relevant SQL row, `streaming.js:109,170,2067`, column
index 3 in the row array — see `_drawBboxPlaceholders`'s own `rows[i][3]` read at line 246 for the same
pattern already in use elsewhere in this file) as a 4th argument:
`A._getMaterial(rgbaStr, ifcClass, matVariant, discipline)`. Inside `_getMaterial`, for exactly the
discipline-ambiguous IFC2x3 generic classes (`IfcFlowSegment`, `IfcFlowFitting`, `IfcFlowTerminal`,
`IfcFlowController`, `IfcFlowMovingDevice`, `IfcFlowTreatmentDevice`, `IfcEnergyConversionDevice` — the
ones whose `STD_MAT` entries currently share one flat "generic metal" look regardless of trade), when
`!rgbaStr` (still real-IFC-colour-first, unchanged), tint the base colour toward
`A.DISC_COLORS[discipline]` instead of the current flat blue-grey value — reusing DISC_COLORS' EXISTING
12 hex values, inventing nothing new, exactly what `MEP_CLASH_REVEAL_MOVIE.md`'s own item 5 already
specified. Does **not** touch classes with real material-specific `STD_MAT` data already (`IfcPipe`/
`IfcDuct`/`IfcCableCarrier` in the IFC4 convention already look like pipe/duct) and does **not** touch
anything with a real, non-null `material_rgba` (STR/glazing stay exactly as they are, per doctrine).
Every `_getMaterial` call site (`streaming.js:1228,1281,1360,1482,1630,1652,1828`) already has the same
row that supplies `rgba`/`ifcClass` — this is a threading change, not a new query.
Separately flagged, not resolved: whether `IfcRailing` should also join this discipline-tint list, or
get a distinct warmer/neutral-metal `STD_MAT` value instead (railings aren't really a "trade," so tinting
them toward `DISC_COLORS[ARC]` — itself blue, `0x4488ff` — would not obviously fix "stairs read blue");
needs its own small decision, not assumed here.

### Note on `A.DISC_COLORS` itself
Even if the fix above ships, `A.DISC_COLORS.STR = 0x44cccc` (teal/cyan) and `.ARC = 0x4488ff` (blue) are
themselves cool-toned — the palette does NOT give a warm/grey/brownish option for structure by default.
The user's ask for structure/stairs specifically ("brownish, grey-metallic") is not answered by wiring
DISC_COLORS in; it would need either a different STR hex value in `config.js:43-48`, or (since STR's
actual HHS colour is real IFC data anyway, per the verdict above) no code change at all — just user
awareness. FP (`0xcc8844` brick/orange), ACMV (`0xcc4444` red), PLB (`0x8844cc` purple), and HEAT
(`0xff6644` red-orange) already cover the "red/brick/orange" MEP variety the user asked for, unchanged.

## Findings 2026-08-14 (session 2) — Hospital blue-tint on real-colored beams/railings, bim-ootb PR #1361 MERGED

**Task:** user watched a baked mp4 (Alt+C, Hospital building) and reported beams and stair
railings/steps reading strongly, "horribly" blue. Explicit ask: "investigate proper and not offer
pivot reasons" — real measurement required, screenshots/eyeballing banned as evidence per this
project's own doctrine (`docs/TestArchitecture.md` §Browser Testing, archived at
`docs/archive/TestArchitecture.md` in this repo). One theory (triplanar metal texture) was already
disproven in a prior pass — not re-litigated here. This session's own first pass leaned on live-
rendered-pixel measurement as the primary discovery tool; **corrected mid-session per explicit user
methodology feedback** ("i rather u look at the formula table than at real DB cases because it is
all abstract") to lead with the code's own formula/config tables and PBR math, with live rendering
kept only as a final confirmation step. This section is written in that corrected order.

### 1. Formula/config-table analysis (primary — read before the live numbers below)

**STD_MAT metalness table** (`viewer/streaming.js` `_getMaterial`, read at bim-ootb `origin/main`
`b2d96dc`, which already includes PR #1356's `§MEP_DISC_TINT` fix from earlier this same session —
not re-derived, cross-checked against the live file):
```
IfcBeam:     metal 0.65 rough 0.35   ← steel I-beam
IfcMember:   metal 0.60 rough 0.40   ← steel section
IfcPlate:    metal 0.70 rough 0.30   ← steel plate    (HIGHEST metal in the whole ~30-entry table)
IfcRailing:  metal 0.55 rough 0.35   ← brushed steel
——— next-highest reflective classes in the SAME table, for scale ———
IfcTransportElement: metal 0.50   IfcPipe/PipeFitting/PipeSegment: metal 0.45
IfcDuct/DuctFitting/DuctSegment: metal 0.40   IfcCableCarrier: metal 0.35
```
These 4 classes (Beam/Member/Plate/Railing) are the 4 highest-metalness entries in the entire table —
roughly 20-55% higher than every other reflective class. `opts.roughness = Math.max(0.08, stdMat.rough
* 0.75)` (line ~554) tightens all 4 to an effective roughness of 0.225-0.30 — fairly glossy/mirror-like.

**envMapIntensity was a flat global constant, never varied per class** (`streaming.js` line 557,
before this fix): `if (A._envMap) { opts.envMap = A._envMap; opts.envMapIntensity = 0.6; }` — applied
identically to concrete, glass, every MEP class, and these 4 steel classes alike. Nothing in the
formula table already discounted reflection strength for the classes carrying the highest metalness —
the two levers (metal, envMapIntensity) multiply, so the highest-metal classes get proportionally the
MOST envMap-reflection contribution while paying no compensating discount.

**`A.DISC_COLORS`** (`viewer/config.js:43-48`) — checked and ruled out as a factor here: `ARC:
0x4488ff` (blue) and `STR: 0x44cccc` (teal) are themselves cool-toned, but `_getMaterial` never
consults `DISC_COLORS` for Beam/Member/Plate/Railing (that tint path is scoped to
`DISC_TINT_CLASSES = {IfcFlowSegment, IfcFlowFitting, IfcFlowTerminal}` only, PR #1356's territory) —
irrelevant to this specific complaint, ruled out by reading the code, not by testing.

**The sky itself — computed directly from the shader's own formula, not eyeballed.** `A.updateSky(45,
180)` (`viewer/scene.js:289`, unconditional on init) configures `viewer/lib/Sky.js`'s Preetham/Nishita
shader (`turbidity=4, rayleigh=2, mieCoefficient=0.005, mieDirectionalG=0.8`, `scene.js:206-209`) with
the sun at elevation 45°/azimuth 180°. `rayleigh=2` is DOUBLE the shader's own built-in default (1,
`Sky.js:75`) — a deliberate choice in this codebase that makes the sky MORE saturated-blue than the
stock three.js demo. Rather than assume what that produces, the shader's exact GLSL math (vertex +
fragment, `viewer/lib/Sky.js:89-311`) was ported line-for-line to plain JS and run with these exact
constants (script: `analytic_sky_color.js`, no browser involved):
```
sunPosition (unit, elev=45 az=180): [0.0000, 0.7071, -0.7071]

dir=zenith (straight up):
  rawLinear=[3.235e-1, 1.043e+0, 2.850e+0]   ← B is 8.8x R in LINEAR light, pure Rayleigh-scattering physics
  after ACESFilmic(exposure=0.45)+sRGB: [126,203,238]  hue=198.8°  sat=0.767  ← strongly saturated blue

dir=horizon, anti-solar side (the reflection angle a level-camera sees off a VERTICAL member
  — matches the railing/beam-web live-render geometry below):
  rawLinear=[3.365e+0, 4.202e+0, 4.528e+0]
  after ACES+sRGB: [241,244,245]  hue=195.0°  sat=0.167  ← paler but still a real, measurable blue

dir=reflect-toward-sun (the geometry a TOP-FLANGE/upward-normal surface sees from a ~45°-elevated
  camera — this direction is EXACTLY coincident with the sun position, cosTheta=1.000):
  rawLinear=[1.368e+1, 2.669e+1, 4.340e+1]  → clips to [254,255,255] even after ACES's highlight
  compression — analytically explains (not just empirically observes) why a top-flange/upward-facing
  test angle blows out to pure white regardless of envMap or metalness settings; see §3 below.
```
This alone establishes, from the code's own configured constants (not a guess, not a screenshot):
**the sky IS real, legitimately, strongly blue at zenith (sat=0.767) and still measurably blue even at
grazing/horizon angles (sat=0.167) — this is real PBR physics from `rayleigh=2`, not a bug in the sky
shader.** The question is only whether these 4 STD_MAT classes' unusually high metalness lets that
real (legitimate) sky colour dominate over their own real, correctly-trusted IFC albedo underneath.

**PBR reasoning from these two tables together:** in the metallic-roughness workflow, a surface's
outgoing radiance splits between a diffuse term (weighted `(1-metalness) × albedo`) and a
specular/IBL term (at high metalness, tinted BY the albedo and dominated by the envMap sample; at low
metalness, achromatic `F0≈0.04` Fresnel reflectance still contributes, just not albedo-tinted). At
metal=0.55-0.70 (vs 0.35-0.50 for every other reflective class) and a genuinely saturated blue envMap
sample, these 4 classes are structurally the most exposed in the entire table to exactly this failure
mode — high enough metalness for a strong specular/IBL contribution, but not touching a real-colour
channel that doctrine (`[[feedback_ifc_colors]]`) already forbids overriding. This — not a re-guess,
not a pivot — is why the formula tables alone already point at `metal`/`envMapIntensity` as the two
levers to test, in that order, before touching anything else.

### 2. Live-render confirmation (secondary — same production pipeline, used to validate §1's hypothesis)

Loaded the REAL `viewer/viewer.html?db=...&bld=Hospital` in headless Chromium (playwright-core +
SwiftShader, this repo's own `tests/playwright.config.js` infra) against the Hospital DB, and in-page
constructed test surfaces via the REAL `A._getMaterial()` fed a LIVE `A.dbQuery()`-read real
`material_rgba` (confirmed live, not assumed: `IfcBeam` cream `0.920,0.900,0.850` 1970/1970 populated;
`IfcRailing` grey `0.741,0.733,0.725` 93/93 populated — this specific numeric check is the one
DB-row-level lookup this investigation actually needed: confirming the NULL-vs-real gating condition
that decides whether STD_MAT's fallback even applies, not exploratory DB mining), lit by the REAL
`A.scene` lights + `A._envMap` (PMREM of the same Sky shader from §1), rendered by the REAL
`A.renderer` (ACESFilmic, exposure 0.45, ColorManagement disabled — both untouched) to an offscreen
`WebGLRenderTarget`, read back via `renderer.readRenderTargetPixels` — no screenshot, every value is a
`§HOSPITAL_BLUE_MEASURE` log line. Script: `measure_hospital_blue.js`.

⚠ **Note on `buildings/Hospital_extracted.db` versions, found while setting this up:** the
OCI-hosted production copy (`objectstorage.../buildings/Hospital_extracted.db`, last-modified
2026-06-05) is STALE — `IfcBeam` material_rgba is 100% NULL there (would fall into plain STD_MAT
fallback, not this "real colour shifted by envMap" mechanism at all). The shared `~/bim-ootb` checkout's
copy (2026-08-03, newer) has `IfcBeam` 100% populated real cream, matching this file's own earlier
`§Findings 2026-08-14` background exactly, and is what the user's own session actually had loaded —
used for all measurement here (copied read-only into the test worktree, gitignored, not committed).

**'up' (top-flange, upward-normal) test geometry clipped to pure white — even with envMap OR
metalness independently zeroed** (`BEAM_no_envmap`/`BEAM_no_metal` both `[255,255,255]`), which at
first looked like a broken test. §1's analytic port explains it exactly: this camera/mesh geometry's
reflection direction is coincident with the sun position (`cosTheta=1.000`), so it's hitting the
DIRECT sun specular hotspot (DirectionalLight intensity 4.4), a real but DIFFERENT phenomenon
(overexposure, not blue tint) from what this investigation is about — noted as a separate, unfixed,
out-of-scope observation below, not silently discarded.

**'side' (vertical member, level camera — a railing baluster or beam web) gave clean, informative
numbers, BEFORE the fix (envMapIntensity=0.6 global):**
```
                     out_srgb            hue     sat    light   metal  rough  envMapIntensity
BEAM_side_production [128,127,134]     248.6°   0.028   0.512   0.65   0.26   0.6
BEAM_side_no_envmap  [111,110,107]      45.0°   0.018   0.427   0.65   0.26   0.6   (envMap removed)
BEAM_side_no_metal   [190,188,189]     330.0°   0.015   0.741   0.00   0.26   0.6   (metal→0)
BEAM_side_albedo_only[246,243,237]      40.0°   0.333   0.947   —      —      —     (pure albedo, no lights)
BEAM_side_pmrem_probe [70, 70, 93]     240.0°   0.141   0.320   1.00   0.26   0.6   (white albedo, pure envMap)

RAIL_production      [127,126,134]     247.5°   0.032   0.510   0.55   0.26   0.6
RAIL_no_envmap        [113,112,111]     30.0°   0.009   0.439   0.55   0.26   0.6   (envMap removed)
RAIL_no_metal          [172,171,176]    252.0°   0.031   0.680   0.00   0.26   0.6   (metal→0)
RAIL_albedo_only       [223,222,221]     30.0°   0.030   0.871   —      —      —
RAIL_pmrem_probe       [70, 70, 93]     240.0°   0.141   0.320   1.00   0.26   0.6
```
Confirms §1's hypothesis directly: `no_envmap` flips both classes OUT of blue (beam 248.6°→45.0°,
rail 247.5°→30.0°) and collapses saturation (beam 0.028→0.018, rail 0.032→0.009) — envMap is the
dominant lever, exactly as the formula tables predicted. `pmrem_probe` (white albedo, metal=1, same
roughness) independently reproduces almost the SAME [70,70,93] hue=240°/sat=0.141 for both classes —
direct confirmation that §1's "the sky itself is genuinely blue at this roughness/angle" finding is
what's actually landing on screen, not an artifact of this specific base albedo.

**One real nuance found, not assumed:** `metal→0` fixes the BEAM a lot (sat 0.028→0.015) but barely
moves the RAILING (sat 0.032→0.031, essentially unchanged) — because the beam's bright cream albedo
(0.92,0.90,0.85) gives the diffuse term, now at full strength, enough warm energy to outweigh the
residual `F0=0.04` dielectric envMap reflection, while the railing's near-achromatic grey albedo
(0.74,0.73,0.72) can't. Roughness was tested too (0.35→0.8, near max): only a small effect on either
class (beam sat 0.028→0.024, rail 0.028→0.028 unchanged) — the sky is fairly uniform-hued across the
practical roughness-blur range at this reflection angle, so blurring more doesn't desaturate it much.
**This is why the fix below targets `envMapIntensity`, not `metalness` alone** — metalness helps
unevenly depending on the underlying real albedo's brightness, but `envMapIntensity` scales the exact
IBL term §1 identified directly, for both classes alike, regardless of their real colour.

Fog ablation was attempted (`BEAM_side_fog_far400` vs `_nofog`, distance 400) and came back BIT-FOR-BIT
IDENTICAL — a floating-point-precision artifact of this test harness's own isolation trick (mesh/camera
offset 5×10^5 units from world origin to guarantee no interference from the real streamed building
geometry, which breaks fog's camera-to-fragment distance math at that offset magnitude), not a real
measurement of fog's contribution. Not re-attempted given the time-box — envMap+metal was already
established as dominant and real, and typical interior walkthrough camera-to-beam distances are well
under the range where this building's auto-scaled fog density (capped 0.004) would matter anyway.
Hemisphere-light colour (`0xb0c4de`, real, checked: `viewer/scene.js:188`) was also ablated
(`hemi_white`): a real but modest secondary contributor (sat 0.028→0.021, ~25% of the effect size
`no_envmap` showed) — not touched by the fix, out of scope (a scene-global light colour, not a
per-class STD_MAT lever, and too small a share of the effect to justify touching lighting).

### 3. Fix — targeted, formula-table-grounded, real-colour untouched

`viewer/streaming.js`: added an optional `envInt` field to the STD_MAT table, read only for the 4
classes identified in §1, reusing the exact same per-class-lookup pattern `metal`/`rough` already use
(zero new plumbing):
```js
IfcBeam:    { r:0.55, g:0.57, b:0.60, rough:0.35, metal:0.65, envInt: 0.18 },
IfcMember:  { r:0.50, g:0.52, b:0.55, rough:0.40, metal:0.60, envInt: 0.18 },
IfcPlate:   { r:0.48, g:0.50, b:0.53, rough:0.30, metal:0.70, envInt: 0.18 },
IfcRailing: { r:0.50, g:0.49, b:0.47, rough:0.35, metal:0.55, envInt: 0.18 },
...
if (A._envMap) { opts.envMap = A._envMap;
  opts.envMapIntensity = (stdMat && stdMat.envInt != null) ? stdMat.envInt : 0.6; }
```
0.6→0.18 chosen as a real cut (30% of the global default) rather than zeroing reflectivity outright —
these classes should still read as recognizably metallic, just without the sky dominating their hue.
Every other class (concrete, glass, other MEP, IfcStair, everything PR #1356 already fixed) keeps
`envMapIntensity=0.6` exactly as before — this is a 4-class-scoped override, not a global change.
**No real colour channel touched** — `r`/`g`/`b` in these 4 STD_MAT entries are UNUSED whenever real
`material_rgba` is present (per `[[feedback_ifc_colors]]`, `_getMaterial`'s `!rgbaStr && stdMat` gate,
unchanged) — Hospital's real cream beam/grey railing colours pass through exactly as extracted, only
the reflection strength changed. ColorManagement/ACES/tonemapping/exposure: untouched, as instructed —
§1+§2 together gave strong, real evidence pointing at `metal`×`envMapIntensity`, so there was never a
need to reach for those.

### 4. Re-measured after the fix — same live-render methodology, same pipeline

```
                     BEFORE (envInt=0.6)          AFTER (envInt=0.18)
                     out_srgb    hue    sat        out_srgb    hue    sat      Δsat
BEAM_side_production [128,127,134] 248.6° 0.028  → [117,115,116] 330.0° 0.009   -68%
RAIL_production       [127,126,134] 247.5° 0.032  → [118,117,119] 270.0° 0.008   -75%
```
Both flip fully out of the blue hue band (was 247-249°) — beam lands at 330° (near-neutral/slightly
warm) and railing at 270° but at sat=0.008 that hue angle is effectively noise (below both classes'
own `no_envmap`-with-envMap-fully-removed reference: beam 0.018, rail 0.009 — railing's AFTER number,
0.008, is now even LOWER-saturation than "envMap completely off"). Brightness (`light`) barely moved
(beam 0.512→0.455, rail 0.510→0.463) — these classes still read as reflective, just no longer
blue-dominated. `SANITY_WHITE`/`*_albedo_only` (unaffected control probes, don't touch envMapIntensity)
came back bit-identical before/after — confirms the fix is scoped exactly as intended, nothing else
moved. IfcMember/IfcPlate share the identical mechanism and STD_MAT structure (now `envInt:0.18` too)
but were not independently live-probed (no representative real-rgba row pulled for them in this
harness) — same fix, same expected effect, reasonable to extend without a separate probe given §1's
mechanism is now understood analytically, not just observed for two classes.

**Left open, honestly, not silently dropped:** the 'up'/top-flange direct-sun-specular clipping found
in §2 (a real overexposure phenomenon, white not blue, driven by `DirectionalLight` intensity/position
— a different subsystem this task was explicitly told not to touch without strong evidence) is
UNFIXED — noted for a future pass if a real bake shows a beam actually washing out white at a
near-mirror sun-reflection viewing angle, which is a narrow, specific camera geometry, not the general
complaint this session addressed.

### Regression check — PR #1356's MEP-tint fix (§6/`§MEP_DISC_TINT`)

Re-ran that fix's own witness pattern (`§MEP_TINT_WITNESS`/here `§MEP_TINT_REGRESSION`) live against
HHS_Office_Federated on this branch (which carries BOTH PR #1356 and this session's `envInt` change):
`total_elements=3390`, `by_code` breakdown and `distinct_colour_codes=7` — bit-identical to PR #1356's
own logged result. Expected and confirmed, not just diff-read: this fix only touches
`IfcBeam`/`IfcMember`/`IfcPlate`/`IfcRailing`'s STD_MAT entries and the `envMapIntensity` line;
`DISC_TINT_CLASSES`/`_mepNameHint` (PR #1356's own code, `IfcFlowSegment`/`Fitting`/`Terminal`) is a
completely separate branch, untouched.

### Status
Investigated, fixed, measured before/after, regression-checked. bim-ootb branch
`fix/hospital-blue-color`, commit `07fe29d`, PR #1361 — MERGED (auto-merge, squash), same session as
PR #1356.

## Findings 2026-08-14b — SUPERSEDED, folded into §Findings 2026-08-14 (session 2) above
This section originally held a standalone diagnosis (formula-table + Fresnel/PBR math, same
mechanism, same `measure_hospital_blue.js` measurement) written independently and slightly ahead of
the fuller investigation above. Both reached the identical root cause
(`metal`/`roughness`/`envMapIntensity` never gated on real-vs-NULL `rgbaStr` the way color is, so
grazing-angle Fresnel lets the genuinely-blue Preetham sky dominate `IfcBeam`/`IfcMember`/`IfcPlate`/
`IfcRailing`'s hue regardless of real albedo). Rather than keep two near-duplicate essays side by
side, this one is trimmed to a pointer — §Findings 2026-08-14 (session 2) above is the complete,
canonical record: same diagnosis, PLUS the shipped `envInt` fix, before/after re-measurement, and the
PR #1356 regression check this section didn't have yet when it was written.

## §CPE_DISCIPLINE_REVEAL_PULLOUT — 2026-08-14 (session 3), pull-out + repeated-lap restructure, bim-ootb PR #1362

**Task, dispatched from bim-compiler:** the user iterated live on this feature's own shape across
several turns of the dispatching session (not carried into this build agent's context — restated in
full in the dispatch prompt). Net result: a genuine RESTRUCTURE of §Mechanism C above, replacing the
there-and-back retrace round with a pull-out + a single repeated forward lap. §Mechanism C's own
sections above (through the "Status" block) describe the SUPERSEDED shape — kept for the historical
record, not to be resumed. This section is the current, shipped design.

### The new shape, as dictated
1. **No backward retrace at all.** Round 2 is simply the same path flown again, start to stop, same
   forward direction as round 1 — not a there-and-back. User's own words: "There is no retrace
   backwards... it is just resume as stick start to stop another round which we call 2nd round."
2. **A pull-out beat between round 1's end and round 2's start.** At the moment the camera first
   arrives at the last stick, a brief dolly-back move, then round 2 begins. Buildup's 100%-complete
   moment moves to the END of this pull-out (not the instant of arrival, not way after) — the direct
   fix for the bug the previous shape had: completion pinned exactly to arrival read as "way before"
   the round finished, per the ▶ RESUME block at the top of this file.
3. **During round 2:** unchanged from the old "ghost" phase — all non-ARC/STR disciplines shown
   together, real IFC colours, room titles behave exactly as round 1 (no discipline-name override).
4. **Only after round 2 ends:** the camera slows down (explicitly NOT a pause — "not pause but slows
   down") while cycling each discipline 2s at a time (unchanged number), and during each slot the room
   title UI element is replaced by the discipline's name. "Good touch" nice-to-have: show the
   discipline's element quantity/cost alongside its name if a lookup exists cheaply.

### Decisions made building this — flagged explicitly as author's calls, not user-dictated
The dispatch prompt named these as open/ambiguous and asked for the smallest reasonable call, made
visibly rather than silently:
- **Pull-out duration: 1.5s**, matching the tail's own 2s/discipline granularity. **Pull-out distance
  is DERIVED, not invented**: `CINEMA_REVEAL_PULLOUT_SEC(1.5) × CINEMA_PULLBACK_MPS(6.5) = 9.75m`,
  reusing the existing closing-orbit pull-back speed constant per the dispatch's own instruction.
  Witnessed exactly: `pull-out displacement === 9.75m` to float precision.
- **Pull-out direction ("angle of attack"): the direction Beat 3 was actually travelling when it
  reached the last stick** — a straight dolly-back opposite that direction, gaze held CONSTANT
  through the whole pull-out (no gaze blend). Round 2 then begins with a clean CUT back to the first
  stick (not a continuous camera move) — "resume as stick start" reads as a genuine restart, like a
  loop, not a camera flight back to the beginning. Witnessed: the tP→tV seam is a real, walk-scale
  position jump (~20m on the test building), the exact OPPOSITE of the old there-and-back's
  continuity property at this seam — proof the retrace leg is genuinely gone, not just renamed.
- **No ARC/STR visual override during the pull-out itself** — plain, solid, camera just retreats. It
  is a transition beat belonging to neither round, same treatment the ORIGINAL Mechanism C gave its
  own backward leg ("no visual override, matches the user's own description of the flow").
- **The tail's slow-down is NOT a new camera motion.** The disc-parade tail is folded directly into
  the EXISTING rise/turn-and-rise beat's own time budget (`_useSec.rise` grows by `tailSec`, driving a
  larger `[tV,tR]` span) rather than becoming its own beat. `poseAt`'s Beat 4 branch is CODE-IDENTICAL
  to before this restructure — same `_beat4Pose`/`_cinemaEaseFloored` formula, just stretched over
  more seconds. Because the SAME pull-back distance now takes MORE time, average speed is measurably,
  continuously lower for exactly as long as captions cycle (never literally frozen — satisfies "not
  pause but slows down") and the beat naturally regains its normal pace approaching the real orbit
  hand-off. This was the smallest change that satisfied "blend into it rather than inventing an
  unrelated camera motion" literally — zero new pose code for the tail's motion.
- **The final "all disciplines together" tail slot was KEPT, not dropped.** The dispatch prompt's own
  instruction: only keep it if the user asked for it elsewhere in this file's existing content. They
  did, repeatedly and without retraction — the ORIGIN ask ("cycling through each, then all together"),
  the Mechanism B pacing quote ("final 2 secs is all DISC together before ARC/STR covers back"), and
  Mechanism C's own flow §2c ("a final ~2s with all disciplines shown together... still standing
  unless the user says otherwise"). `tailSec = 2×discs.length + 2` is unchanged from before.
- **Caption text during the all-together slot: "All Disciplines"** — the dispatch prompt's caption ask
  ("replaced by the discipline's name") was written for the per-discipline slots specifically; the
  all-together slot wasn't separately addressed. Smallest reasonable extension rather than leaving the
  caption blank while ARC/STR is hidden and everything is shown (which would read as an unexplained
  gap right after several readable captions).
- **Discipline label source: `A.PHASE_MAP`** (`config.js`), not a new label table. It already carries
  friendly names for the common trades (`ELEC→'3-Electrical'`, `FP→'3-Fire Protection'`, ...) keyed by
  the SAME discipline codes `A.DISC_COLORS`/`cpeRevealDiscsPresent` use — stripped of its leading
  sort-order prefix (`'3-Electrical'→'Electrical'`). Degrades to the raw code for `SAN`/`VENT`/`HEAT`/
  `VOID` (real `DISC_COLORS` codes `PHASE_MAP` has no entry for) — never a fabricated label. This is
  exactly what `MEP_CLASH_REVEAL_MOVIE.md`'s own §Mechanism B section had already flagged as the right
  place to look ("checked against the locale files... rather than hand-writing new labels") — checked
  `A.PHASE_MAP` first per that note, found it sufficient, no locale-file change needed.
- **Quantity/cost "good touch": element COUNT + a ROUGH cost estimate, not the full unit-aware BOQ
  figure.** A real discipline-level qty/cost aggregation already exists — `boq_charts.html`'s own
  `qto_cache` pipeline, which resolves quantity by UNIT (linear-M via bbox length for duct/pipe/cable,
  area-M2 via bbox for slabs/walls, else count) before multiplying by `A.MATERIAL_COSTS`' rate. That
  exact logic lives in a separate SQL.js-loaded page context, not the live viewer's `A.dbQuery`, and
  porting its full unit-resolution (LINEAR_CLASSES/AREA_CLASSES bbox joins) would be real, separate
  work — out of proportion to a "nice to have, include if reasonably cheap" ask. What shipped instead:
  a new `A.cpeRevealDiscQtyCost(discs)` reusing the SAME `A.dbQuery`/`elements_meta` pattern
  `cpe_room_title.js`'s `_storeyLadderForGroups` already uses, `GROUP BY discipline, ifc_class`,
  summing `COUNT(*) × A.MATERIAL_COSTS[ifc_class].rate` per discipline — reuses the EXISTING rate
  table verbatim (no new number invented), but is a rougher figure than the BOQ page's (treats every
  element as one unit against its class's rate, not the real linear/area quantity). Labelled honestly
  in the caption as "N elements, ~cost" rather than presented as a precise BOQ total. **Named follow-on,
  not built:** porting `boq_charts.html`'s unit-aware qty resolution into this live-viewer path for an
  exact figure, if the rough estimate proves unsatisfying in practice.

### Two real bugs found and fixed BEFORE this ever shipped (witness-driven, not eyeballed)
1. **Pull-out gaze anchored to the wrong signal.** First cut held the pull-out's gaze at the raw
   `_beat3EndDir` (Beat 3's un-rate-limited final direction). The witness measured a **78.85° gap**
   between that and the gaze ACTUALLY rendered on screen the instant before (`_gazeRateAt`'s
   rate-limited signal) on `HHS_Office_Federated` — exactly the class of bug `§CPE_GAZE_CONSTANT_RATE`
   and `_revealSeamDir` already exist to prevent elsewhere in this same file (the ORIGINAL Mechanism C
   build hit the same mistake once, at a different seam, and fixed it the same way). Fixed by anchoring
   to `_revealSeamDir(tO)` instead — re-measured at exactly `0.000°`.
2. **A latent double-fold risk in the tail-into-rise fold.** The first cut mutated `_useSec.rise`
   in place to fold the tail in. `plan.sec.rise` feeds `cinema_path_editor.js`'s `s.baseSec.rise`,
   which `_buildOverride()` echoes straight back as the NEXT plan's `riseSec` override on every
   replan within one editing session (band drag, checkbox toggle, etc., all while Reveal stays
   checked) — so each round-trip would have folded the tail in AGAIN, growing the rise beat without
   bound across repeated edits. Never shipped: caught while tracing the override round-trip, before
   any bake. Fixed by keeping the fold entirely local to a new `_riseFolded` variable (used only for
   `_shapeTotal`/`tR`) — `_useSec.rise`/`plan.sec.rise` now stay the TRUE unfolded pull-back budget
   always, invariant to reveal state, safe to round-trip through the override channel any number of
   times. Witnessed directly: `sec.rise` identical off vs. on, and identical across 3 repeated
   round-trips through the same override object.

### What actually got built
- **New beat boundary `tP`** (pull-out's own end), inserted between the existing `tO` (round 1's walk
  end) and `tV` (renamed in meaning: now round 2's own end, the real "STOP" per the spec, not the old
  whole-round end). `plan.beats` gained `pullout: tP`. Guardrail 2 preserved exactly as before: reveal
  off or no non-ARC/STR discipline present makes `tP===tV===tO` (zero-width, unreachable), so an
  off/empty-building film stays byte-identical to before this feature ever existed.
- **`_pullOutPose(w)`** — new pose function, dolly-back along `-_revealSeamDir(tO)`, gaze constant.
- **`_revealPose(w)`** — simplified from the old there-and-back version (no more back-leg/tail
  branches, no more `backW`/`fwdEndW` splitting): now purely round 2's forward lap, `_outPos(w)`
  eased, travel-tangent gaze, with only an END seam blend into Beat 4's actual `e4=0` gaze (no start
  blend — round 2 begins with a deliberate cut, blending gaze across a position cut would not read as
  continuous motion anyway).
- **`_buildupTopoutU`** (`cinema_maxq.js`) now returns `plan.beats.pullout` (tP) instead of
  `plan.beats.out` (tO) when the reveal round is active — degrades to `.out` for an older cached plan
  without a `pullout` field (DEGRADE, DON'T DISABLE, this lane's own established rule).
- **`A.cpeRevealVisualAt(plan, tNorm)`** restructured into four zones instead of three: pull-out
  (null), round 2 (`ghost`), the tail folded into `[tV,tR]`'s first `tailSec` seconds
  (`tail-one`/`tail-all`, using the plan's own `reveal.riseSec`+`reveal.tailSec` to find the split),
  rise-proper (null again).
- **`A.cpeRevealCaptionAt(plan, tNorm)`** — new pure function, the discipline-name caption override.
  Returns null everywhere except the tail's own slots, where the caller (bake or preview) swaps it in
  for the normal room-title lookup and swaps back automatically once the tail ends (same null-fallback
  mechanism in both call sites — no separate "restore" step needed). Wired into BOTH `cinema_maxq.js`'s
  `_captureFrame` title-info line and `cpe_room_title.js`'s `A.roomTitleLiveTick` (extended with two
  new optional trailing args, `plan`/`tNorm`, backward-compatible) — one pure function, two callers,
  matching this whole lane's established "preview and bake read the same functions" discipline (this
  project was bitten twice already by exactly this class of divergence, PR #1354's own fix).
- **Room titles work even when the "room titles" checkbox is off but Reveal is on** (discovered while
  wiring the preview call site — the two are separate checkboxes, and the disc-parade caption
  shouldn't require room titles to also be enabled). Fixed a related staleness risk at the same time:
  `roomTitleLiveStart` is now called whenever EITHER checkbox is on (with `totalSec=0` — an
  effectively-empty timeline — when only Reveal is on), so a PRIOR run's real room-title segments can
  never leak into a run where the user has since turned room titles off.
- **`A.cpeRevealDiscLabel(d)`** and **`A.cpeRevealDiscQtyCost(discs)`** — new small helpers, see the
  decisions section above for what they reuse and what they deliberately don't attempt.
- **`A.cpeRevealDiscsPresent()`, `A.filterDiscs`, the full-hide visual mechanism** — entirely
  unchanged, reused as-is from the original build.

### Witnessed
New witness `witness_cpe_reveal_pullout.js` (Puppeteer, real building —
`HHS_Office_Federated_extracted.db`, the git-tracked fixture; `buildings/Duplex_extracted.db`, the
ORIGINAL Mechanism C witness's fixture, is gitignored/OCI-only and wasn't present in the fresh
worktree this build used, per this project's own worktree-hygiene rule against reusing the shared
checkout): **51/51**, covering the Guardrail-2 off-path, all four beat boundaries and their real
widths, the exact pull-out displacement/gaze-constancy proof, the deliberate tP→tV cut vs. the old
seam's continuity, the tV→tR seam's UNCHANGED continuity, buildup topout timing (not "way before", not
"way after"), the no-double-fold regression (3 repeated round-trips), all four visual zones, the
caption swap-in/out at exactly the tail's own boundaries, the discipline-label/qty-cost helpers, and
the preview-replan parity check (toggling Reveal alone widens the EDITOR'S OWN live plan, not just a
freshly-built one). Regression-checked clean: `witness_cpe_reveal_panel.js` 7/7, `witness_cpe_room_title.js`
11/11 — the checkbox wiring and the room-title pipeline are both untouched by this restructure.
The superseded `witness_cpe_reveal_round.js` (tested `backSec`/`fwdSec`/a retrace leg that no longer
exist) was removed rather than left permanently red.

### Status
BUILT, WITNESSED (51/51 new + regression-clean), bim-ootb branch `feat/cpe-reveal-pullout-restructure`,
PR #1362. §Mechanism C above (through its own "Status" section) describes the SUPERSEDED there-and-back
shape — do not resume it. Named follow-on, not built: the full unit-aware BOQ-accurate quantity/cost
figure for the tail caption (see the decisions section above) — the rough count×rate estimate shipped
instead is honestly labelled, not silently presented as precise.

## Findings 2026-08-15 — live Hospital bake review, v1029 confirmed loaded, 2 real items open

User watched a real Alt+C Hospital bake running the actual merged code (`§BUILD_VERSION v1029` in the
boot log — confirmed this is post-#1362, not stale; the log also showed the new `pullout`/`round2`/`tail`
beat names live in `§CINEMA_BEATS`, not the old `reveal`/`rise` terms). Verdict: "not bad," two real
gaps named. Discussed only, NOT fixed, per explicit instruction this session.

### 1. The Round-1→Round-2 hard cut reads as a jarring sudden switch, not smooth
Confirms the exact ambiguity the build agent itself flagged and left as its own (undictated) call:
"your 'resume' wording could mean either [smooth or a hard cut] — this picked the cut." Live observation
now settles it — the cut needs to not be sudden. NOT decided or built: candidate directions only —
(a) a quick crossfade/dissolve across the cut, (b) replace the teleport with a fast eased fly-back
covering the same displacement, (c) a brief motion-blur snap. Different cost/complexity per option;
needs a real decision before anyone builds it, not a default pick.

### 2. Still reads blue, no reds — root cause identified, NOT the same bug as before, NOT fixed
PR #1361's `envInt` fix only covers 4 classes: `IfcBeam`/`IfcMember`/`IfcPlate`/`IfcRailing`. It never
touched the MEP-adjacent classes that carry the SAME grazing-Fresnel-vs-flat-`envMapIntensity=0.6`
mechanism §Findings-session-2 above proved mathematically: `IfcPipe`/`IfcPipeFitting`/`IfcPipeSegment`
(metal=0.45), `IfcDuct`/`DuctFitting`/`DuctSegment` (metal=0.40), `IfcCableCarrier` (metal=0.35) — all
still flat at 0.6, all still moderately reflective, all still theoretically exposed to the same
grazing-angle blue-mirroring §Findings-session-2 §2 derived from Schlick's equation.

**The direct hit, real data, not a guess:** Hospital's ONE genuinely-red real-IFC-data element is
`IfcPipeFitting` under discipline FP — 1298 elements, real `material_rgba = 0.843,0.137,0.102` (a real,
saturated red — presumably sprinkler/fire-line pipe fittings). It sits exactly in this untreated
metal-bracket. Very likely getting the same grazing-edge blue wash the beam/railing had before #1361 —
just never measured or fixed for this specific class.

**Separately, confirmed as a non-issue, not a bug:** PR #1356 (`§MEP_DISC_TINT`, the family-name-based
MEP colour classifier) is a complete no-op on Hospital. `DISC_TINT_CLASSES` only matches the IFC2x3
generic classes (`IfcFlowSegment`/`Fitting`/`Terminal`) HHS exports with. Hospital's MEP uses different,
specific IFC4-style classes (`IfcDuctSegment`, `IfcPipeSegment`, `IfcFireSuppressionTerminal`, etc.) that
never match `DISC_TINT_CLASSES` — so #1356's logic never runs on Hospital at all, and never could have
added the "brick red and other colours" variety the user originally asked for on THIS building. Whatever
colour Hospital's MEP shows is 100% real IFC data, unmodified — the only lever available here is the
envMapIntensity fix above, not the name-classifier.

**Named fix candidate, NOT built:** extend #1361's `envInt` override (or an equivalent, possibly lower
for these since their metalness is already lower than Beam/Railing were) to
`IfcPipe`/`IfcPipeFitting`/`IfcPipeSegment`/`IfcDuct`/`IfcDuctFitting`/`IfcDuctSegment`/`IfcCableCarrier`.
Should be measured the same way #1361 was (real headless pixel readback, before/after, on Hospital's real
`IfcPipeFitting` red data specifically) before shipping — do not assume the same 0.18 value transfers
without checking, these classes start at lower metalness than Beam/Railing did.

## §CPE_DISCIPLINE_REVEAL_FLYBACK + §CPE_DISCIPLINE_REVEAL_ORDER — 2026-08-16, resolves the two
## open items named in the 2026-08-15 Findings section above (not fixed there, decided here)

User re-raised item 1 from 2026-08-15 ("cuts to it abruptly instead of smoothly") and added two new
asks. Two decisions needed real user input (per that section's own "needs a real decision before
anyone builds it" rule) and were asked directly:
- **Seam fix — "Fast eased fly-back" chosen** over crossfade/dissolve or motion-blur-snap: replace
  the pull-out→round-2 teleport with an actual camera flight covering the same displacement, eased
  in/out, over a short duration.
- **Discipline sort metric — "Average element bbox size, ascending" chosen** over element count.
  Extraction check (read-only agent, confirmed against real schema, not assumed): `elements_meta`
  has NO dimension column at all — `A.cpeRevealDiscQtyCost`'s existing `count` was always a proxy,
  never a real size. `element_transforms.bbox_x/bbox_y/bbox_z` (always present, part of the standard
  10-table extraction schema, guid-joined to `elements_meta`) is the real per-element geometry.
  `qto_cache` was checked and REJECTED as a source: it's a lazy/optional write-back cache (not
  guaranteed to exist for an arbitrary loaded building) and its `qty` column mixes units (M/M2/EA/KG
  across ifc_classes), not dimensionally comparable across disciplines without normalizing first.

### 1. Fly-back — smooths the tP→tV seam (2026-08-15 item 1)
New sub-beat inserted between pull-out (`tO..tP`) and round 2's forward lap (now `tF..tV` instead of
the old `tP..tV`) — `tP..tF`. Duration `totalLen / CINEMA_PULLBACK_MPS` (reused constant — the
file's own "flying, not walking" rate, already used for the pull-out's own distance and the
rise/pull-back beat — not a new speed invented). This is real added time (e.g. ~7.7s on a 50m walk,
vs. round 2's own ~21.7s at the normal `CINEMA_WALK_MPS` pace) — "fast" relative to the walk it
mirrors, not instant.

**Path, not a straight line.** Retraces the SAME `_outPos(f)` curve the walk itself already
validated as collision-free, backward (`f: 1→0`), rather than a straight-line cut between the
pull-out's end point and the first stick — a straight line between two points on a bent corridor
risks clipping through walls at any turn, exactly the class of bug this file's `_revealSeamDir`/
`§CPE_GAZE_CONSTANT_RATE` machinery already exists to prevent elsewhere. This is the SAME backward-
retrace the original (pre-#1362) Mechanism C used, just compressed to `CINEMA_PULLBACK_MPS` pace
instead of the walk's own `CINEMA_WALK_MPS` (that original retrace ran at walk pace and DOUBLED the
film's length — the exact cost #1362 removed it to avoid; this fly-back reintroduces the safety of
retracing the path without reintroducing that cost).

**Seams, reusing this file's own existing idiom** (`_dirBlend`/`_cinemaSmoothstep`/
`CPE_REVEAL_SEAM_FRAC`, the same pattern `_revealPose`'s own ending blend already uses — no new
blending math): position blends from the pull-out's actual final (off-path, retreated) point onto
the path's `f=1` point over the fly-back's first `CPE_REVEAL_SEAM_FRAC` width, then retraces
`_outPos(1-e)` for the remainder. Gaze holds at the pull-out's own "angle of attack" direction
(`_revealSeamDir(tO)` — same constant-gaze choice pull-out already made) through the position blend,
then blends into the forward travel tangent at `f=0` (`_revealTravelDir(0,1)`) over the FINAL
`CPE_REVEAL_SEAM_FRAC` width, so round 2's own opening gaze picks up with zero kink — same contract
`_revealPose`'s end seam already keeps at the Beat 4 handoff.

**Cross-file duplication, same precedent as the pull-out's own `1.5` literal:**
`cinema_path_editor.js`'s `_naturalDuration()` estimate (client-side seconds guess that sizes the
bake's frame count) must grow its `revealSec` estimate by `len / 6.5` (the same `CINEMA_PULLBACK_MPS`
value, duplicated as a literal — `effects.js` stays the one authoritative source, this is an
estimate only, exact seconds are always computed there at plan-build time).

### 2. Discipline order — smallest granularity first, MEP forced last, "All Disciplines" unchanged
`A.cpeRevealDiscsPresent()` currently returns `Object.keys(counts)` — insertion order from scene
traversal, not a deliberate ordering. Add a sort, in that one function (shared by both
`effects.js`'s plan builder and `cinema_path_editor.js`'s duration estimate — one implementation,
per this function's own existing header comment):

```sql
SELECT m.discipline, AVG(t.bbox_x * t.bbox_y * t.bbox_z)
FROM elements_meta m JOIN element_transforms t ON m.guid = t.guid
WHERE m.discipline IN (...) AND t.bbox_x IS NOT NULL AND t.bbox_x > 0
GROUP BY m.discipline
```

Sort ascending by that average volume — smallest-average-element disciplines (finest granularity)
reveal FIRST, while the viewer's attention is freshest. The literal `MEP` discipline code (a real,
separate code in `A.DISC_COLORS`/`A.PHASE_MAP` alongside `ELEC`/`FP`/`ACMV`/`PLB`/`HVAC`/`SAN`/
`VENT`) is forced to the LAST position regardless of its measured size — user's own framing,
2026-08-16: MEP reads as "most easily sighted" (its ducts/pipes/cable-trays are large and obvious
even glimpsed briefly), so it doesn't need the early slot the way small/fine disciplines do. Degrade
path if `A.dbQuery` is unavailable or the query fails: fall back to the original unordered list —
DEGRADE, DON'T DISABLE, same rule `cpeRevealDiscQtyCost` already follows one function above it.

**"All Disciplines" stays the very last slot, unchanged (user confirmed 2026-08-16: "of course All
Disciplines the very last").** That combined view is `cpeRevealVisualAt`'s existing `idx >= n`
fallback (`phase: 'tail-all'`) — it is NOT a member of the sorted `discs` array, so no code path
needs to change for this; it already always plays after every individual discipline slot, MEP
included. This item is a confirmation, not a build task.

### 3. Fade between each discipline in the tail parade
Real architecture constraint found (not assumed): `A.filterDiscs`/`A._applyDiscVisibility` (the
ONLY filtering mechanism in this app, per that function's own header comment) is a pure boolean
`obj.visible = true/false` toggle across all three mesh representations (plain `Mesh`,
`InstancedMesh`, `BatchedMesh`). There is no per-element opacity channel in this pipeline today —
`InstancedMesh`/`BatchedMesh` share ONE material across every instance in the batch, so animating
`material.opacity` would fade the WHOLE batch (including elements outside the current tail slot),
not just the discipline entering/leaving. A true per-element alpha crossfade is real, separate work
(a vertex-color alpha channel or per-instance attribute — not present in the current schema), named
here as an explicit follow-on, NOT built in this pass.

**What ships instead — an overlap window, the closest honest approximation `filterDiscs` can give
without that engineering:** at each `tail-one` boundary, the outgoing and incoming discipline are
BOTH kept visible together (`A.filterDiscs([outgoing, incoming])`) for a short window (candidate:
~0.4s, mirroring this file's other short-beat granularities) before dropping to just the incoming
discipline. This softens the hard swap into a brief overlap rather than an instant cut, using only
the existing visibility mechanism — it is not a literal opacity dissolve, and is documented as such
here so it is never mistaken for one later.

### Status
BUILT, WITNESSED 2026-08-16, bim-ootb branch `feat/cpe-reveal-flyback-order` (worktree
`/tmp/wt-reveal-smooth`, off fresh `origin/main` `81d2ecd`). `effects.js?v=20->21`,
`cinema_path_editor.js?v=14->15`, `sw.js` CACHE_VERSION v1043->v1044, `EFFECTS_V` v20->v21.

All three items implemented as specced: new `_flyBackPose`/`tF` beat boundary (position/gaze-
continuous both sides, replacing the teleport), `A.cpeRevealDiscsPresent`'s ascending-AVG(bbox
volume) sort with MEP forced last (query against `element_transforms`, DEGRADE-not-DISABLE if
`A.dbQuery` unavailable), and the `CPE_REVEAL_FADE_SEC` overlap window in `A.cpeRevealVisualAt`'s
tail-one branch (`visDiscs` widens for 0.4s at each boundary, `discs` — the caption identity —
always names the incoming discipline only).

`witness_cpe_reveal_pullout.js` extended (not a new file): 60/60 PASS, including the OLD "tP -> tV
is a real CUT" assertion REPLACED with its opposite (both new seams now continuous, position < 5cm
and gaze < 2deg on the real fixture) — this is the direct regression proof the 2026-08-15 "abrupt,
not smooth" report is fixed. Regression-clean: `witness_cpe_reveal_panel.js` 7/7,
`witness_cpe_room_title.js` 11/11.

**Honest fixture gap, not fixed here:** the git-tracked fixture (`HHS_Office_Federated_extracted.db`
— the same one the original pull-out witness chose, `Duplex`/`Hospital` are OCI-distributed and
gitignored, not pulled into this worktree per the project's own worktree-hygiene rule) has only ONE
non-ARC/STR discipline (`MEP`, 3399 elements — real DB fact, checked directly, not assumed). The
sort comparator and the fade's overlap window are only exercised end-to-end against a single-
discipline building here; both correctly no-op/degrade on it (verified — the sort skips its own
query+log when `discs.length <= 1`, the witness gates those specific assertions the same way rather
than asserting a false positive). The MEP-forced-last placement and the 2-discipline overlap window
are proven correct by construction (comparator logic reviewed, tested against the one real
discipline present) but not by a real multi-discipline bake. Follow-on, not blocking: re-run
`witness_cpe_reveal_pullout.js` against `Hospital_extracted.db` (or any OCI-fetched multi-discipline
building) once one is available in a worktree, to get the `§CPE_REVEAL_DISC_ORDER` log line and the
2-discipline `visDiscs` overlap exercised against real data instead of a single-discipline fixture.

## §CPE_REVEAL_LENS_QUAD_OFF — 2026-09-04 — SPEC: the lens quads stay lit through the one-discipline slots
> **USER, 2026-09-04:** *"On the reveal exit pull away path, i raised about the 'lights quads' always
> visible obscuring the respective DISCipline display. U did mention before to turn off ie zero the
> color so they go invisible. THis will be the next to improve the Reveal runs."*

### The defect, located exactly (code read, not inferred)
`§CPE_TAIL_LIGHTS_ALL_ONLY` (#1649) already turns the lamps off for a one-discipline slot, and
`A._cpeRevealLightsOff` is the flag that says so (`cinema_maxq.js:1568`). It is honoured in **two**
places only:
- `effects.js:4575` — `_glowOn()`, the ROUND glow sprite, returns early.
- `effects.js:4991` — `A._nightPLScale = 0`, the real point lights.

**The `§GLOW_LENS_QUAD` path has no such guard.** `_glowLensOn()` (`effects.js:~4764-4910`) stages
its rect/round quads from fixture world data with no reference to `_cpeRevealLightsOff` at all — so
through every one-discipline slot the quads keep drawing additively over the trade being revealed.
That is the "always visible, obscuring the respective DISCipline display" the user is describing.

It persists rather than flickering because of `§R10`'s stage-keep guard (`effects.js:4328`): a bake
frame calls `_teardownStillRefine(reason, keepStaging=true)`, and when the TM-visible fixture count
is unchanged the quads are deliberately NOT disposed. Correct for performance, and it is why the
quads survive from frame to frame.

### The fix — zero the colour, do NOT tear down
The quad is a `MeshBasicMaterial` with `blending: THREE.AdditiveBlending`, `color: 0xffffff`,
`toneMapped: false` (`effects.js:~4830`). An additive surface at `color = 0` contributes **exactly
zero** to the frame — invisible, with no dispose and no rebuild, so `§R10`'s stage-keep guard stays
intact and `_glowLensStagedCount` keeps its meaning. Tearing the quads down per slot would fight
that guard and pay a dispose+rebuild on every transition.

So: one guard, same flag, same shape as the round sprite's, applied to the quad's material rather
than its lifetime — `_cpeRevealLightsOff ? 0 : 1` as a colour scalar, set where the slot flag is
already evaluated per frame. No new constant, no new flag, no class list.

### Witness claims (must be able to say NO-OP, VACUOUS, WRONG)
- `§CPE_REVEAL_LENS_QUAD_OFF slot=<disc> quads=<n> colorScalar=0` on every one-discipline slot, and
  `colorScalar=1` on the all-together slot. **VACUOUS** if `quads=0` (nothing staged — the verdict
  must say INCONCLUSIVE, not PASS; `§GLOW_LENS_QUAD_GATE 0 fixtures placed yet` is that case).
- **NO-OP guard:** the quads must still be *staged* (`_glowLensStagedCount` unchanged across the
  slot) — a fix that accidentally tears them down is a different behaviour, not this one.
- **WRONG:** any frame in a one-discipline slot whose drawn quad count > 0 with a non-zero colour.
- Numeric proof, not a look: per-slot mean luma of the fixture-quad pixels, from the staged-frame
  census the bake tap already provides — it must drop to the floor on one-discipline slots and
  return on the all-together slot.

### Status
SPEC ONLY — not implemented. Next item for the Reveal lane. Baseline film for any before/after is
`~/Downloads/Hospital_silent_bake_2026-09-05.mp4` (`PHOTOREAL_STILL_RENDER.md` §BME.11, the user's
own words: *"we shall use that as the baseline to proceed"*).
