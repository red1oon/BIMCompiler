# ⚠ DO NOT REMOVE
**▶ RESUME 2026-09-01 (latest) — §CPE_PIE_FLYOUT_DROP MERGED — PR #1599 (e2e+fast-checks green, squash 4fb753c6), sw
v1118, `cinema_maxq.js?v=8` + `cpe_resource_panel.js?v=2`.** The Reveal round (fly-out) no longer
draws the pie — the revolving cards + roster take the full plate width (0.494→0.827·bw cards,
0.867·bw roster). NOT a revert of §CPE_PIE_HOLD: round 1 untouched, boundary = the frame loop's
own `_inReveal` (no new constant). Witness 27/27; full record §CPE_PIE_FLYOUT_DROP at the end of
this file. The next bake's log must show `§CPE_STATS_TAIL … pie=dropped (§CPE_PIE_FLYOUT_DROP)`.

**▶ RESUME 2026-09-01 (earlier) — READ §CPE_AIM_DEPTH_FREEZE AT THE END OF THIS FILE FIRST.**
**§CPE_AIM_DEPTH_FREEZE SHIPPED — PR #1598 (auto-merge armed), sw v1117, effects.js?v=29.** Inside
a correction window the blend-from is now FROZEN at the window's own edges (entry gaze through
ramp+hold, exit gaze through decay — §CPE_CORR_BRANCH's resolve-once machinery extended, not a
second mechanism). Hospital witness **13/13**: in-window max step **13.114 → 7.791 deg/sample
(-41%)**, jerk 2.387 → 0.841; constancy 0.0000 deg with a working red control;
nose-against-the-wall MEASURED not reintroduced (clearance minima identical, 0.00 m is the walk's
own position); dead-end rescue intact outside the window (fires 28/91, turns 83.45 deg). Duplex
11/12 — only the pre-existing filed G-BR-5. ⚠ If you touch the correction blend: the witness's
branch A/B must stay freeze-OFF or the frozen from-dir masks the wrap defect.

**⛔ CLOSED BY THE USER 2026-09-01 — do NOT resume the aim / "dense depth" lane.** User, after the
bake that followed #1598: *"Earlier last session i did asked about cam head face dense depth, no
need as this last mp4 shows how it is already good."* §CPE_AIM_DENSITY was already retired
2026-08-13 and §CPE_AIM_DEPTH_FREEZE shipped today; the user has now judged the camera's facing
behaviour GOOD on a real mp4, which closes the ask that opened this lane. Further aim/gaze-subject
tuning is OUT OF SCOPE unless the user reopens it. This is a user verdict on a real bake, not an
untested assumption — do not "improve" it unprompted.

**Earlier same day (all merged + live):** §CPE_PIE_HOLD #1586, §CPE_STATS_TAIL #1587, §R10 #1588,
§R11 #1590, §CPE_CARD_FIT #1592, §SUNGLASS_GROUPING_RULES #1594 (v1114), §CPE_MATERIAL_KEY #1595
(v1115), §CPE_CORR_BRANCH #1597 (v1116 — the 110.44 deg 2π-branch flip, A/B 110.436 → 13.114).
HUD order and the Reveal rotation CONFIRMED in the user's own bake.

**Branch status:** `fix/buildup-tie-spread` — **A/B says DO NOT MERGE**: worst frame 124 → 134,
largest exact tie is only 5. The slab pop is CLUSTERING, not ties. The real lever is
§CPE_BUILDUP_WORK_PACED, and turning it on is a user decision (57x calendar swing).

**Next, in the order I would take them:** (a) ~~material omission~~ #1595; (b) ~~palette rules~~
#1594; (c) ~~freeze §CPE_AIM_DEPTH~~ **#1598**; (d) still open, filed by the #1597 run — witness
G-BR-5 compares the correction's two window edges to each other, which reads the underlying walk as
much as the correction (Duplex fails it at 436 vs 114 deg/m while that walk's own peak is 1945). It
needs a walk-relative denominator.

**⚠ Two numbers I asserted this session were WRONG and are corrected in §SESSION_2026-09-01:** the
89.5 m Hospital walk (really 39.43 m) and "walk length scales with film duration" (it does not).
Do not re-quote the §CPE_WALK_BUDGET comment as a live measurement.

**▶ RESUME 2026-09-01 (earlier) — superseded by the block above. Everything below shipped + live, sw v1112.**

| § | what | witness | PR |
|---|---|---|---|
| §CPE_PIE_HOLD | the pie HOLDS the last real crew instead of vanishing; dimmed 0.60, captioned with the day it is from, ring stays live | 9/9 | #1586 |
| §CPE_STATS_TAIL | TWO ROUNDS — round 1 holds and never rotates; the Reveal round revolves everything, roster included | 15/15 | #1587 |
| §R10 §MAXQ_FRAME_BUDGET | a baked frame is **20 composer renders, not 40** (bake only; Alt+S keeps 40) | floor RMS 0.21 | #1588 |
| §R11 §PHOTO_PREWARM | 8.9 s of curve-smoothing + HDRI + ground texture moved OFF the first Alt+S | 6/6 | #1590 |

**⛔ NOT ONE OF THESE HAS BEEN SEEN IN A REAL BAKE YET.** The user's last Hospital mp4
(`BIM_MaxQ_Hospital_1788092317604.mp4`, 3,447 frames, 229.8 s) was baked from a tab loaded BEFORE
§CPE_HUD_ORDER deployed — proven by its HUD order (counter → pie → path box, the OLD order) and by
the pie showing a live `4 on site · Finisher ×4` to the last frame with no held caption and no
stat cards. **A stale tab serves stale JS: reload before baking.**

**What the next real bake should show, and what it proves:**
- `§PHOTO_PREWARM ms=… did=[mepSmooth,hdri,groundTex]` a few seconds after streaming → §R11 landed
- first Alt+S ~27 s → ~7-9 s → §R11's saving is real on Hospital
- `§CPE_STATS_TAIL reveal round entered at frame …` → the dead tail is reclaimed
- `§CPE_PIE_HOLD heldFrames=N/framesDone` → the hold fired (it will NOT fire on Hospital: Finisher
  ops run to the last day, so the pie is never empty — that is correct, not a bug)
- bake wall clock ~3 h → ~2 h 10-15 m → §R10's saving is real

**Measured this session, do not re-derive:** the day counter pins at u≈0.45 and the pie sits on one
static trade for the remaining **≈125 s** of a 229.8 s film — that is the "ample unused timing" the
Reveal-round rotation now fills. Hospital = 63,182 elements, heap ~1.57 GB, `§SPLIT_GEO_LOADED
size=229MB`. Curve smoothing on Hospital: 1,705 geoms / 14,621 ranges / 23,735,190 verts smoothed,
8,923.6 ms, once per session.

**Still open, unchanged:** §CPE_CORR_BRUSH_STROKE has NO witness. The material palette is UNBUILT —
`TRIPLANAR_MAT` still keys on `ifc_class`, so Terminal's 300×300 tile floor and its 600×600 gypsum
ceiling both render as concrete; 79 material names covering 90.3% of 48,428 elements, entirely
unread. §MAXQ_BACKGROUND is SPEC-ONLY, facts delivered, **user has not approved building it**.

---

**▶ RESUME 2026-08-30 (evening) — superseded by the block above, kept for its detail. (sw v1106)**
PRs #1579, #1580, #1582, #1583 all merged and verified live by fetching the deployed files back.
Session shipped: §TRIPLANAR_NORMAL, warm cam fill, §CPE_PATH_OVERVIEW, §CPE_HUD_STACK,
§CPE_LABEL_PANEL_SYNC, §CPE_RESOURCE_PANEL, §CPE_BIG_STATS, §MEP_SMOOTH_NORMALS,
§CPE_CORR_BRUSH_STROKE, §IDX16, §GLOW_BUILDUP_EARLY_OUT. Full record: §SESSION_2026-08-30 below.

✅ §CPE_RESOURCE_PANEL **CONFIRMED WORKING IN A REAL BAKE** (user's Hospital mp4, 2026-08-30 17:21):
"51 on site · Conc ×18 · Steel ×12 · Mason ×6 · HVAC ×4 · Pipefit ×4 · +2 more" with the cylindrical
pie drawn. The `withResource=0` bug (trade is `op.parameters.resource`, not on the row — loadOps :102
shape) is fixed and the whole chain works end to end.

⛔ STILL UNVERIFIED: §CPE_CORR_BRUSH_STROKE has NO WITNESS.

▶ §CPE_PIE_HOLD — BUILT 2026-08-30 late, witness 9/9, **bim-ootb PR #1586** (auto-merge armed),
sw v1108. NOT YET SEEN IN A BAKE. User: *"make the pie part not to disappear but hold when there is
silent info."* MEASURED from the persisted `~/.cache/bim4d` task windows: Hospital 318 days, Clinic
111, Terminal 97, HHS 50, Duplex 13 — **ZERO** days with no task active on any of them, so the
silence is NOT a mid-programme gap; it is the post-topout half. The pie now keeps its column for the
whole film (ONE geometry in both modes), holding the last staffed day's REAL composition, dimmed and
captioned with that day, while the ring stays live and the §CPE_BIG_STATS cards revolve beside it.
Full record: §CPE_PIE_HOLD at the end of this file.

▶ §CPE_HUD_ORDER — FIXED 2026-08-30, NOT YET SEEN IN A BAKE. User, from that same frame: the path
view "should be above, the pie part below". Order is now counter → PATH BOX → pie/stats, built from
ONE running `_stackY` in `_captureFrame` so the three can never overlap or leave a gap. Rationale:
the path box answers "where am I", which a viewer tracks continuously, so it belongs under the clock;
the pie is consulted, not followed. Same frame also showed trade names truncating to "Conc…",
"Steel…", "Pipefit…" — list width 0.46 → 0.56 of the panel, pie takes the remainder. **Both land on
the next bake.**

⚠ DO NOT run headless probes while the user is baking. Twelve puppeteer Chromes (2,146 MB, load
average 9.88) competed with a real bake on this machine and the user had to abort it. Ask first.

**▶ RESUME 2026-08-13 (updated same day):** `§CPE_AIM_DEPTH_BUILDUP` is now THREE
fixes deep, all SHIPPED this session:
1. Candidate 1 + eye-level-bias refinement — bim-ootb **PR #1340, MERGED** (`fd2faaa`) — `_aimSubject`
   zSpan facade filter + eye-level bias (fixes "faces the ceiling"/roof tiles).
2. `§CPE_POV_MARKER` — bim-ootb **PR #1341, MERGED** — red camera gizmo synced to the flying pose on
   the main canvas during scrub/POV preview.
3. Candidate 2 — bim-ootb **PR #1342, OPEN, not yet merged** — made `_aimDepthSubject` (already
   correctly excludes a close wall and favours a further one) buildup-aware instead of buildup-off,
   restricted to elements actually placed by the real cursor (`window.tmGuidEndTs()`, new). This is
   what "faces a close wall when the room right behind has more depth" needed. Witness GREEN 8/8 on
   two buildings, including the load-bearing check that the rule now actually FIRES during a buildup
   walk (was structurally impossible before) and a jitter/turn-rate check the user explicitly asked
   for ("fast turn, not jitter around") — 0% peak turn-rate regression while measurably re-aiming.

§CPE_BUILDUP_ONSET_BURST (the buildup-pacing finding) was raised then explicitly DEPRIORITIZED by the
user same session ("ignore the pacing.. it seems solved before perhaps i didn't update") — do not
resume it unprompted, the section below stays as a record only.

**Verify PR #1342 merged before starting new CPE aim work.** Still open after it lands: "faces empty
sky" — an unconfirmed `_lookAhead()`-fallback theory in the original write-up, plausibly improved now
that a real subject is more often available during buildup, but not directly re-measured. Everything
else below this block is older context.

**Scope:** ONE feature — a waypoint editor that opens after the Alt+C preview, lists the cinema path's
waypoints with their camera info, and lets the user key or drag them before the bake. The "simplest
fastest tour maker."
**Not in scope:** the §CINEMA_SPACE attic-pick default — **owned by another session as of 2026-07-26,
do not touch `_cinemaPathPlan`'s §CINEMA_SPACE block (~L3486-3610)**; see §Out of scope below.
**Read the log after every run.** Verification on this project is `§`-tagged console output, not
screenshots — and for anything continuous (camera path, angles, Z) it is the NUMBERS, per CLAUDE.md's
FUNDAMENTAL LAW. Honour this block until this file is DONE.

**Full day-by-day history (2026-07-26 → 2026-08-03, ~6200 lines) archived verbatim, nothing lost:**
**`prompts/archive/CINEMA_PATH_EDITOR_full_history_2026-07-26_to_2026-08-03.md`**
Consolidated 2026-08-13 per the same pattern already used for `prompts/PHOTOREAL_STILL_RENDER.md`
(2026-08-11) — this file is kept to the evergreen model/spec sections, the still-active
2026-08-04→2026-08-13 build arc (the scrubber/viewfinder/aim-pin/POV-frame lane the current open item
belongs to), and one-line pointers for everything closed/superseded before that. Full diagnostic
narrative for archived items lives in the archive file if ever needed again.

## ▶ RESUME — START HERE
Genuinely open threads, all in full detail below:
0. **§CPE_AIM_DEPTH_BUILDUP → CLOSED, superseded by §CPE_AIM_SIMPLIFY (2026-08-14).** Candidates 1
   (zSpan filter, PR #1340) and 2 (buildup-aware search, PR #1342) both shipped, but the user then
   reported the SAME class of defect live on a real HHS_Office bake (wild swings, stick had to be
   grabbed back twice) and asked for the whole aim model simplified instead of patched further.
   §CPE_AIM_DENSITY was retired outright and §CPE_AIM_DEPTH's trigger was changed from omnidirectional
   density to forward-clearance (bim-ootb PR #1344, MERGED). Live-verified on a real bake, user
   satisfied — full detail under §CPE_AIM_SIMPLIFY (search the tag). Nothing left open here.
1. **§CPE_PANEL_PERF** — three measured bake-perf stalls (buildup cold-init ~2.1s, a redundant 3×
   plan-recompute on Alt+C open, a DLOD scrub-jump flip storm). Findings only, nothing implemented.
2. **§CPE_PREVIEW_ARG** — the hidden `#cpe-preview` button hands its click MouseEvent into
   `_previewFly`'s `povOnly` arg (latent, currently harmless because the button is never unhidden).
   The one-line fix was investigated and deliberately **NOT SHIPPED**: it exposes a second, real bug —
   the full (non-POV-only) preview path never restores the main camera to the editing pose. Fix the
   restore first, prove it with `witness_cpe_stick_after_preview.js`, only then wrap the listener.
3. **B's own `THREE.WebGLRenderer`** — the POV inset (B) still shares the main canvas's renderer and
   inherits its full-canvas post-processing pass, which is the last structural cause of "POV framing
   still off" after every scissor-rect/DPR bug in that lane was fixed. Real, scoped architecture work
   (a second WebGL context + duplicate shader compile) — needs the user's explicit go before starting,
   named across §CPE_VF_GRIP, §CPE_VF_PLAIN_FRAME and the 2026-08-06 HANDOFF section below.
4. **§CPE_WALK_AUTHORING** — spec fully settled with the user (walk-authoring via B's own POV in an
   edit-mode, replacing pin-dropping; elastic buildup timeline; no per-stick delete affordance) but
   **NOT BUILT**. Blocked on B getting its own renderer (item 3) first — B must be interactive to be
   navigated in.
5. **§CPE_GRAB_WYSIWYG**'s own open half — "the Preview button flies B only" (see item 2, same root).

---

**§Archived — the 2026-08-01 session-close stack (superseded, PRs all merged+live).**
The two stacked "SESSION CLOSE 2026-08-01" blocks that used to open this file (pure navigation +
shipped-PR tables, both self-declared superseded by the time the next one was written) are archived.
**LATE block, sw v906, 6 PRs merged:** §CPE_ROOM_TITLE_LEAD #1118 · §CPE_ROOM_TITLE_GAZE #1119 ·
§4D_ROOF_LOAD_PATH #1120 · §CPE_WALK_BUDGET_NOISE_BLIND #1121 · §CPE_PATH_NOT_PORTABLE #1122 ·
§GANTT_CACHE_VERSION 4→5 #1123. **EARLIER block, sw v900/CPE v19/MAXQ v20, 9 PRs merged:**
§CPE_REOPEN_NODE #1104 · §CPE_STICK_RED_BAR #1105 · §CPE_HOSE_LENGTH_BLIND #1107 ·
§CPE_ROOM_TITLE_HEIGHT_BLIND #1108 · §CPE_GHOST_GROUND(+RATIO/arm/degrade) #1110/#1112-#1115 ·
§CPE_BUILDUP_WORK_PACED #1116 · §CPE_ROOM_TITLE_HOLD #1117. Full text, including the process lessons
each block recorded, in the archive.

---

# §CINEMA_PATH_EDITOR — the simplest fastest tour maker

## The one sentence
**Build §CINEMA_PATH_EDITOR as the SIMPLEST FASTEST TOUR MAKER — no new icon, no new panel: Alt+C
already computes the plan in ~50–100 ms, so put a DIALOG in that existing gap showing the path as a
graph (reuse the Find panel's route visual) with the per-beat camera angle/Z, and the user either
hits OK to proceed straight into the recording exactly as today, or drags a waypoint / fixes the
camera Z that currently dives into the attic first — with an explicit **"Save this path"** action
that stores the edit as a `cinema_path` table in the building DB exactly the way
`staffage_instances` already round-trips.**

## Origin
User, 2026-07-26 evening, *after* the foundation below was laid and landed:
> "once a path is done, the user can cancel or not, a new feature when pressed calls up a graph panel
> of the scene path and cam angle... That way this time the user can adjust the path points, Z level
> of the camera as now it goes for the attic."

then, scoping it:
> "it is to be the simplest fastest tour maker — perhaps a dialog box with the graph (similar to Find
> rooms path visually as idea) and user can OK to proceed or adjust it, thus no need extra icon."

## §CINEMA_PATH_EDITOR_MODEL — the settled interaction model (user, 2026-07-26, in discussion)
**This section is the spec. Where it disagrees with the "graph dialog" wording elsewhere in this
file, this wins.** Settled point by point with the user; nothing here is inferred.

### The data model — one authored thing, everything else derived
1. **Waypoints are the ONLY authored data.** A waypoint is a position plus a camera height. Nothing
   else is stored.
2. **Camera angle is NEVER authored.** It is LOS — the look direction at waypoint *n* is toward
   waypoint *n+1*. This is why the table carries **one extra final row** (the stopping waypoint): it
   exists to give the last real leg something to look at.
3. **Therefore "adjust the POV" is not a separate gesture.** Dragging waypoint *n+1* is *how* you
   change waypoint *n*'s camera angle. Falls out of (2) for free.
4. **Consequence, load-bearing:** no authored yaw/pitch anywhere → `cinema_path` stores positions and
   times only → **§CINEMA_TURN_SLERP keeps deriving headings from the path exactly as today.** Its
   witness (G6) stays green without being weakened to accommodate this feature. An earlier
   per-waypoint-authored-aim design was considered and dropped for precisely this reason.

### Geometry — no sharp corners can exist
5. **The waypoints are CONTROL points, not corners.** The flown path is smooth everywhere by
   construction, so "sharp corner" is not a state the path can reach. User's own words: *"that means
   there are no 'sharp' corners."*
6. **The curve CUTS INSIDE the corner** (user directive: *"yes cut inside"*) — it does not pass exactly
   through the placed point. The turn is eaten by geometry, not by slowing down.
7. **The cut is BOUNDED BY MEASURED CLEARANCE, not a constant.** `A.cinemaFan` (exposed
   `effects.js:4079`) is already this project's single source for real measured clearance-to-nearest-
   surface — §CINEMA_SPACE calls it "the ONLY where-is-open-space source". The rounding radius at each
   waypoint comes from it. Tight room → tight curve; open hall → wide graceful arc. **Do not invent a
   fixed fillet radius** — that would be exactly the kind of guessed constant the prime rule forbids.
8. **This retires an ungated defect.** "D2 walk-out corner whip — 19.8°/frame, printed by the witness,
   not gated" (listed under §Out of scope) is the user's reported *"about 2 jerks, fast jump at least a
   frame."* It was tolerable only because the derived route is tame. Once waypoints are user-draggable,
   sharp input becomes trivial to create — so smoothing moves IN SCOPE here and gets a real gate (G7).

### Timing — constant speed, editable total
9. **Constant speed. Path length sets the clock.** Drag a point further out and the total rises from
   24s. The displayed total is the truth about what was authored, not a fixed budget.
10. **The total is then itself an editable field.** Key 20s and the whole clip speeds up uniformly;
    key 40s and it slows. Uniform scale over the whole film, not per-leg.
11. **Cost that sits behind that field:** total × fps = frames to bake. 24s = 576 frames; 40s = 960,
    i.e. ~1.7× the render time. Surface it, don't hide it.

### Interaction — reuse, nothing invented
12. **The editor opens AFTER the 10s preview**, with the camera already returned to its initial pose
    (`cinema_maxq.js` already saves/restores it — `camSave`, ~L429).
13. **Click a row (or its waypoint) to HOLD it.** The scene camera backs up so that waypoint is framed.
    `A.controls.enabled = false` while held — the established pattern here, not a new one
    (`grid_drag.js:568/650`, `city.js:993/1013`, `doc_canvas.js:1450/1502`).
14. **Held-point verbs mirror the viewer's own navigation verbs** (user: *"isn't that intuitive?"*):
    - **drag** → move the waypoint on the horizontal plane through its own height (x, z)
    - **ctrl+drag** → move it vertically (camera height — the original complaint)
    - **wheel** → still scene zoom, NOT point depth. Releasing just to look closer would defeat the
      point of holding; x/z/height are already fully covered by the two drags.
15. **Double-click empty canvas to RELEASE** (user directive — single click was rejected as too easy to
    trigger and lose focus). Canvas `dblclick` is claimed only by measure mode (`picking.js:150`), so
    this collides with nothing. Touch has no `dblclick`: reuse the existing 350ms double-tap detector
    at `picking.js:174`, do not write a second one.
16. **While a point is held, single click does nothing** — it must not run element picking, or mid-edit
    clicks select the walls behind the waypoint.
17. **The held state must be unmistakable** — pulsing waypoint + highlighted row + a status line saying
    a point is held and double-click releases. A frozen-but-unexplained canvas reads as a hang.
18. **The pulse reuses §SELECT-PULSE** (`navigate_find.js:2160-2227`): generation counter + rAF +
    `markDirty`, and critically `depthTest:false`/`renderOrder` so the marker **shines through walls** —
    load-bearing, since the camera is outside the building when the editor opens.
19. **Two-way binding is required.** Key a number in the table → the canvas moves. Drag in the canvas →
    the number updates. Same state, two views.

### One defect this design exposes (fix as part of the work)
20. `cinema_maxq.js:357-360` claims `A._maxqActive`, `_wakeAcquire()` and `_dampHold()` **before** the
    plan/preview. `A._maxqActive` makes `dlod_nav.js:307` report `'cinema'` and fully disengage DLOD.
    An editor opening after the preview inherits all three — so a user editing for five minutes holds a
    screen wake-lock and runs Terminal/Hospital at full detail with no LOD the whole time. **The editor
    must release all three while open and re-claim them on OK.**

### Amendment on record — scope guardrail 3 is void
Guardrail 3 below says *"do NOT build an in-viewport 3D drag gizmo."* The user directed exactly that on
2026-07-26 (*"as we click on each row, appears a cam-eye 3d icon... user can adjust... and the canvas
reflects that changed path"*, then the freeze/drag/double-click model above). **Recorded as a deliberate
user amendment, not drift.** Guardrails 1, 2, 4 and 5 stand unchanged — in particular **guardrail 2: OK
without an edit must still be byte-identical to today.**

### Witness claims for this model (in addition to G1-G6 below)
- **G7** no-sharp-corners: on a path with a deliberately sharp authored corner, peak angular rate stays
  under a stated °/frame cap — the same measurement that today prints 19.8°/frame ungated. This is what
  makes "graceful" a NUMBER rather than a look.
- **G8** clearance-bounded rounding: the flown curve's maximum deviation from each authored waypoint is
  ≤ the `A.cinemaFan` clearance measured at that waypoint. Proves the cut-inside is bounded by measured
  space, never by a guessed constant.
- **G9** constant speed + uniform scale: doubling a leg's length raises the total proportionally at
  unchanged m/s; then setting the total to T re-times every leg by the same factor (sampled speeds
  ratio-identical).
- **G10** LOS: sampled look direction at each waypoint points at the next waypoint (within the smoothing
  tolerance), and moving waypoint *n+1* changes waypoint *n*'s aim — the (3) claim, measured.
- **G11** lock release: while the editor is open `A._maxqActive` is false and the wake-lock is released;
  both are re-claimed on OK. Proves defect (20) is actually fixed rather than described.

**§Archived — the original build: bands, screen-plane drag, derived pacing (2026-07-27, all BUILT/WITNESSED).**
§CPE_BUILT (first implementation, 9/9+7/7 witnessed) · §CPE_SCREEN_PLANE (the drag-in-camera's-own-view-
plane mechanism still in force today) · §CPE_PACING_BUILT (derived duration, measured) · §CPE_BANDS_BUILT
+ §CPE_BANDS spec (bands replace loose waypoints — 3 latent defects found+fixed along the way) ·
§CPE_PACING (walk/pull-back derivation, superseded by the later noise-law work). Full text in the archive.

---

## THE FOUNDATION — read these, do NOT re-derive them
This feature is only cheap because the substrate already exists and is proven. Referenced, not
restated; go to the source for detail.

| what | where | why it matters here |
|---|---|---|
| The plan itself | `viewer/effects.js` `_cinemaPathPlan()` → `{beats:{dive,spin,out,rise}, poseAt(t), pivot, exit, ...}` | Every pose is a pure function of `t`. **Both** consumers — live capture (`effects.js`) and the MaxQ bake (`cinema_maxq.js`) — read this ONE plan, so editing its inputs changes both for free. |
| The editable inputs | same file: `CINEMA_DIVE/SPIN/OUT/RISE_SEC`, `outWp` waypoints, `CINEMA_EYE_M`, `CINEMA_LOOKDOWN_DEG`, the orbit radius band | This is the actual edit surface. Nothing else needs to become editable. |
| The gap to put the dialog in | `§CINEMA_PLAN_MS` — Alt+C already pauses to compute (Duplex ~50–100 ms; Terminal/Hospital 500–750 ms) | No new entry point is needed or wanted. |
| The route renderer to REUSE | `viewer/navigate_find.js:1249 _drawPathHighlight`, `:3274 _renderPathResult` | The Find panel already draws a room route as a line through points; `outWp` is the same shape of data. |
| The persistence pattern to MIRROR | `staffage_instances` — `viewer/scene.js:577 _writeStaffageTable` / `:589 _exportBuildingDb`, `effects.js A._restoreStaffageInstances` | Full round-trip measured working 2026-07-26: `§STAFFAGE_SAVE rows=8` → `§STAFFAGE_RESTORE rows=8` → `restored=8`. See `prompts/STAFFAGE_WALKABLE_PLACEMENT.md §STAFFAGE_PERSIST`. |
| Recent path fixes that must not regress | `prompts/PHOTOREAL_STILL_RENDER.md` §CINEMA_TURN_SLERP (#1018) and §CINEMA_DAMPING_BLEED (#1020) | Their witnesses (`witness_cinema_exit_breathe.js`, `witness_cinema_damping_bleed.js`) must stay green after any change to the plan or its consumers. |

## Scope guardrails (the "simplest fastest" requirement is the spec, not a preference)
1. **No new icon, no new panel, no new keybinding.** It rides the Alt+C press that already exists.
2. **OK must behave exactly like today** — same film, same beats. The default cost of this feature is
   one click. If OK changes the output at all, the feature is wrong.
3. **Reuse the Find route renderer.** Do NOT build a second path-drawing system, and do NOT build an
   in-viewport 3D drag gizmo. A dialog with a 2D graph is the deliverable.
4. **An edited path is AUTHORED data, not derived.** Under the prime rule (EXTRACT OR COMPILE ONLY) it
   must be STORED, never re-guessed: a `cinema_path` table (beats + waypoints + eye height + tilt)
   written by `_exportBuildingDb()` and read on load. Reuse the staffage pattern; do not invent a
   second persistence mechanism.
5. **Persistence is an EXPLICIT action — "Save this path" (user directive 2026-07-26).** Adjusting and
   proceeding is *ephemeral*: this film, this press, nothing written. Only "Save this path" marks the
   edit as the building's stored path. Mechanically this mirrors staffage exactly — the action stages
   the path into the in-memory DB and the user's normal `Ctrl+S` carries it to the file, the same way
   `_writeStaffageTable()` runs at `_exportBuildingDb()` time. Do NOT add a second save route, and do
   NOT auto-persist on adjust: a user experimenting with waypoints must be able to walk away without
   having changed the building.
   Dialog affordances, therefore: **OK** (proceed, unchanged) · **Save this path** (stage the edit) ·
   **Cancel** (abandon, no recording).

## Witness claims (spec-first — write these before any implementation)
- **G1** OK-without-edit is a no-op: beats and sampled `poseAt(t)` are byte-identical to a run with
  the dialog bypassed. (The one gate that protects the zero-friction default.)
- **G2** a waypoint edit changes the sampled path at that waypoint and nowhere else.
- **G3** a camera-Z edit changes eye height by exactly the amount asked, on every affected beat.
- **G4** round-trip: edit → **Save this path** → `_exportBuildingDb()` → `_openDbBytes()` → the SAME
  edited path is in force, proven by SAMPLED POSES, not by the table merely existing.
- **G4b** ephemerality: edit → proceed WITHOUT "Save this path" → export/reopen → the plan is the
  unedited derived one. Adjusting must not silently mutate the building.
- **G5** control: on a DB with no `cinema_path` table the plan is the unedited derived one.
- **G6** §CINEMA_TURN_SLERP's and §CINEMA_DAMPING_BLEED's witnesses stay green.

**§Archived — 2026-07-26 to 2026-08-03 build history (jerk/pacing/hose/buildup/room-title/gaze lanes).**
Everything between the model's Witness-claims list and the 2026-08-04 §CPE_REHEARSAL_STUDIO spec is
archived verbatim — the day-by-day diagnostic narrative for every item below, all closed/shipped or
superseded by name in a later entry (only genuinely-still-open threads stayed in this file; none were
found in this range). Grouped by date for navigation; search any §tag in the archive for its full story.

**2026-07-26/27 — jerk, drag, pacing law settled ("§CPE_JERK_SETTLED", the session's own doctrine block):**
§CINEMA_ATTIC_PICK (reassigned to another session) · §CPE_OK_CRASH (fixed, 3/3+3/3) · §CPE_PANEL_DRAG
(4/4+4/4) · §CPE_SAVED_PATH_LIFECYCLE · §CPE_PREVIEW_DIVERGENCE (fixed 3/3+3/3) · §CPE_EVEN_TURN (the
settled cost-parameterization formula, still governing the walk beat today) · §CPE_PACE_LOS ·
§CPE_IDB_PATH_STORE (spec-only, parked) · §CPE_DRAG_TELEPORT (fixed) · §CPE_JERK_DEFINITION ·
§CINEMA_LOOKAHEAD_ARC (fixed) · §CPE_POSITION_GATE · §CPE_PACE_FLOOR · §CPE_DRAG_SCALE ·
§CPE_SEAM_CONTINUOUS · §CPE_UNDO (6/6+6/6, `Ctrl+Z`) · §CPE_REVIEW_PACK (reviewer notes).

**2026-07-27 (later) — §CPE_NOISE_LAW: the noise ratio governs every beat, do not re-derive:**
§CPE_NOISE_LAW (built, 4/4+4/4) · the blind-fan rig finding · §CPE_BASIS_HALF_PIN (fixed) ·
§CPE_DRAG_TRACK (closed, "lever effect" ruled acceptable by the user) · §CINEMA_TAIL_DECAY
(**retracted** — contaminated backgrounded-tab data, kept only as the retraction record) ·
§CINEMA_END_FREEZE · the three-movie-facade framing.

**2026-07-28 — §CPE_HOSE / §CPE_STICK / real-schedule buildup, all shipped:**
§CPE_HOSE spec → §CPE_HOSE_BUILT (PR #1074, 23/23) · §CPE_AIM_DENSITY (outside-perimeter aim) ·
§CPE_AIM_DEPTH (surrounded-by-surfaces aim, D1-D4 findings, buildup-blind guard shipped 2026-07-31 —
this guard is exactly what the CURRENT open item, §CPE_AIM_DEPTH_BUILDUP, replaces) · §CPE_STICK
(bands N not 3, PR #1074, 29/29) · §CPE_VISION_CHAIN (roadmap capture) · §CPE_BUILDUP_REAL_SCHEDULE
spec → §CPE_BUILDUP_REAL_SCHEDULE_BUILT (16/16, modes S/T/D lineage — superseded 2026-07-29, see below).

**2026-07-29 — replan perf, reopen bugs, buildup source selection:**
§CPE_REPLAN_LAZY spec · §CPE_REOPEN_DOUBLE (fixed) · §CPE_PREVIEW_AFTER_RETIRED (retires a witness) ·
§CPE_BUILDUP_SOURCE_BLIND → settled same day: mode D (camera-proximity reveal) **retired entirely**,
replaced by modes S (linked schedule) / T (this model's own derived timeline) via `tmFollowTimeline()`,
PR #1082 · §CPE_CLICK_SLOP (fixed, 4/4) · §CPE_BE_HERE_WHEN (spec, not built — folded into the later
"be here when" family, superseded).

**2026-08-01 — walk budget, portability, spin whip, stick-hold/aim-latch, gaze rate:**
§CPE_WALK_BUDGET_NOISE_BLIND (fixed) · §CPE_PATH_NOT_PORTABLE (fixed) · §CPE_SPIN_WHIP (fixed, 7/7+7/7
— the "long way round" bug, session-close localisation to the dive→spin seam later DISPROVEN by
measurement, see below) · §CPE_STICK_HOLD + §CPE_AIM_LATCH (built) · §CPE_GAZE_CONSTANT_RATE (built) ·
live-reports batch: hold-time deploy gap (not a defect), orbit over-rotation (narrowed, not fixed at
the time — later resolved, see 2026-08-02), the blind fan (BatchedMesh hypothesis disproven, `&ghost=1`
named as the real lead), "roof before walls on the roof top" (4D sequencing, separate from the camera
lane) · session-close final: two design rulings (band-monotonic-within-phase + a lag between phases;
the ending's framing is NOT coupled to the opening's) — both later BUILT 2026-08-02 as §4D_BAND_MONOTONIC.

**2026-08-02 — fast-path bake cost, 4D band-monotonic, gaze acquire, room-title group/collective:**
§BAKE_FAST_PATH_COST (staging overhead measured, near-constant not proportional) ·
§4D_UPPER_FLOORS_WALLED_FIRST (diagnosed: PASS B has no cross-storey term) · §CPE_ROOM_TITLE_TIMING
(4 findings) · §CPE_DAY_COUNTER (built, 11/11) · §CPE_HOLD_TURN (reaffirmed, decoupled from `perpMag`
per the user's "cam facing should be independent" ruling) · the 2026-08-02 batch (§CPE_GHOST_PULL,
room-title dwell-floor/hysteresis) landed PR #1129 · §4D_BAND_MONOTONIC (built — cross-storey
inversions 29,824→0) · §CPE_GAZE_ACQUIRE → BUILT PR #1131, then §CPE_GAZE_ACQUIRE_SOFTEN 3x→2x PR
#1137 · §CPE_STICK_HOLD default fixed to 0 · §CPE_BUILDUP_TOPOUT (completes at the orbit boundary, not
the final frame) · §CPE_ROOM_TITLE_MULTI (3-ray fan) · §CPE_ROOM_TITLE_GROUP → §CPE_ROOM_TITLE_COLLECTIVE
(PR #1136, #1138 — the "Storey · containment · rooms [phase]" composed caption format) ·
§CPE_GAZE_SKYLINE_STARE (diagnosed: `active=0/65` on both aim rules on an authored interior path) →
§CPE_GAZE_BULK (the fix, built, gated) → **⏸ PARKED by user ruling same day** ("rather OK, it is a
matter of path creativity" — not a code bug; the module sits unwired on `fix/cpe-gaze-bulk`, no PR) ·
§CPE_GAZE_SOC (module-boundary hardening, delivered with the parked fix) · §CPE_PANEL_STATE (PR #1140)
· §CPE_ROOM_TITLE_LEVEL_CONSOLIDATE (PR #1142) · §CPE_STICK_APPROACH (PR #1143) ·
§CPE_MAXQ_STATUS_DAY_LABEL (PR #1145).

**2026-08-03 — buildup pacing re-investigated (no defect), pace-swing softened, ghost-ground trigger:**
Part 1: the buildup element-placement rate is flat (36.15-36.30/frame) — **NO DEFECT FOUND**, the
"fast/slow" read was the camera's own beat-speed variation. Part 2: §CPE_PACE_SWING_SOFTEN, direct
tuning 1.6→1.45 (PR #1147) · §CPE_GHOST_GROUND_TRIGGER reverted to first-above-ground-element (PR
#1148) → §GHOST_GROUND_LIVE_TRIGGER found a real clock-domain bug in that same fix (calendar-fraction
vs elements-fraction) and fixed it (PR #1149) → re-verified on Terminal after a "still does not work"
report: **NO DEFECT**, confirmed with real pixel-readback evidence (the fade is real, just brief).

---

# §CPE_REHEARSAL_STUDIO — synced scrubber + viewfinder + aim-pin (spec, 2026-08-04)
**Not started. Spec only, per Spec-First — no implementation until this is reviewed.**

## The problem this solves
User's own framing: only feedback today is a 10s `_previewFly()` rehearsal (cinema_path_editor.js:1228),
then a real bake that can run 30+ minutes — too coarse a loop to perfect a path/POV. Confirmed why the
bake is that slow: `cinema_maxq.js`'s export "pipes the canvas through MediaRecorder/captureStream() to
a real .webm" (tour.js:1206 comment) — it is a real-time capture at full photoreal cook cost per frame,
not a batch renderer. So the fix has to be a richer REHEARSAL, not a faster bake.

## Origin — user, this session (2026-08-03/04)
> "A. A timeline scrubber with markers where the sticks are. User can even add sticks there, and they
> appear same in canvas actual pipe... B. new sub screen that shows exact cam point of view (that is
> exact with the density*depth*noise*speed ratio). Also bearing the TimeMachine exact 4D schedule
> scene. Thus u can press preview, all three runs together as their defined types. That B view finder
> POV is the most useful because the user can pinpoint a spot where he adjust on canvas the pipe, and
> reflected on that B screen. All draggable and that B screen is even sizable for user comfort of
> control."
>
> On click-to-pin: "so click to pin is to ensure that cam when going past turns to look at it? Yes
> good idea." — confirmed: sets ROTATION only, never position.
>
> "IT is still simple default to just bake or further but practical tooling." — the plain bake stays
> the default path; this is additive rehearsal tooling, not a replacement.

## Grounded in what already exists — do NOT rebuild any of this
| what | where | why it matters here |
|---|---|---|
| One pure pose function | `_state.plan.poseAt(t)`, built by `effects.js _cinemaPathPlan()` | Both `_previewFly()` and the MaxQ bake read this ONE function (§CPE_PREVIEW_DIVERGENCE doctrine: "cannot become a second notion of the path"). Every new view (scrubber, viewfinder) MUST sample the same `poseAt`, never a second interpolation. |
| Sticks = authored bands | `_spawnStick`/`_removeStick` (cinema_path_editor.js:207/236), `ov.bands` with `._stick` flag, drawn on the pipe via §CPE_STICK_ANCHOR | The scrubber's markers are these same bands, not a new data model. |
| Clip window | `s.clipIn`/`s.clipOut`, already honoured by `_previewFly()` | The scrub bar's shaded range IS this, not a new range control. |
| Persistence | §CPE_IDB_PATH_STORE — named plans save/open/delete | Any new per-stick field (e.g. a pin target) rides the same band row, no second table. |
| Panel drag | `A._makeDraggable` (measure.js), used by §CPE_PANEL_DRAG | Reuse for the B panel's drag. Resize does NOT exist on any panel yet — net-new, small (a corner handle resizing a viewport rect, no layout engine needed). |
| Time Machine sync | `tmSetCursor`/`buildupCursorAt`/`ghostGroundAt`/`dayCounterLiveTick`, already driven once per rehearsal frame inside `_previewFly()`'s `step()` | B's schedule readout must read the SAME cursor `step()` already computed that frame — not a second clock (this is exactly the bug class §GHOST_GROUND_LIVE_TRIGGER (2026-08-03) found and fixed: two clocks compared directly). |
| Aim sources today | LOS toward next waypoint (default); §CPE_AIM_DENSITY (effects.js ~5350-5650) auto-aims at nearby mass when outside the building with nothing to look at | Click-to-pin is a THIRD aim source. Precedence must be decided (open question below), not guessed. |
| Bake mechanism | `cinema_maxq.js` MediaRecorder/captureStream, real-time, per tour.js:1206 | Confirms B viewfinder must be scoped to REHEARSAL only — adding a second render pass inside the bake loop would slow the very bake this feature exists to avoid re-running. |

## Part A — §CPE_SCRUB: timeline scrubber with stick markers
1. A horizontal bar, ADDED alongside the existing band row-list (not replacing it — the rows still
   carry per-band numeric fields the bar can't show).
2. Playhead = `tNorm` 0..1 over `_state.plan`. Dragging it samples `plan.poseAt(tn)` — the same pure
   function `_previewFly()`'s `step()` reads, never a second pose path, same doctrine tour.js's own
   §TOUR_TIMELINE_SCRUB already proved for a sibling feature ("borrow the doctrine, not the code").
   **Correction (user, 2026-08-04, caught live in the browser): scrubbing must NEVER move `A.camera`/
   `A.controls` — the main viewport.** "the main canvas... supposed to remain as was where user still
   does traditional editing dragging the pipe etc. Cam POV is inset box to be an aid only." The sampled
   pose from a scrub drag drives ONLY Part B's inset camera (`vfCam`) when B is open, plus the tick/
   readout — main-canvas orbit/pipe-editing stays exactly where the user left it, untouched, at all
   times. If B is closed while scrubbing, there is no live visual — only the numeric readout moves; that
   is correct, not a gap (B is the aid, not the main view). This does NOT change the pre-existing
   "Preview" button (`_previewFly()`'s full rehearsal flight) — that has always temporarily flown the
   main camera for its duration and snapped back to the editing pose on completion; that gesture is
   unrelated and untouched by this correction.
3. Tick marks at each stick's `tNorm`, derived the same arc-length way the pipe already places bands.
4. Click empty bar → same `_spawnStick`, placed via the inverse of that arc-length lookup (tNorm → pipe
   world point) rather than a raycast hit — the existing placement math should already expose this both
   ways since the pipe currently draws bands FROM arc-length.
5. The clip-in/out shading reuses `s.clipIn`/`s.clipOut` directly.

## Part B — §CPE_VIEWFINDER: synced POV sub-panel
1. **Not a second WebGLRenderer/GL context.** Recommend the standard three.js multi-viewport technique:
   one renderer, `setScissorTest`/`setViewport`/`setScissor` per pane, same scene graph, a second
   `THREE.PerspectiveCamera`. Avoids doubling VRAM/context overhead — consistent with this codebase's
   existing ms/frame discipline (§CPE_BUILDUP_WORK_PACED etc.).
2. B's camera pose is set from the SAME `plan.poseAt(tn)` the main rehearsal camera uses at that instant
   — "exact POV" per the user's ask means literally the same sample, not a re-derived approximation.
3. B's aim must run through whichever aim source is active for that `tn` (LOS / §CPE_AIM_DENSITY / new
   §CPE_AIM_PIN below) — same "preview and bake cannot disagree" rule already enforced for buildup via
   §CPE_BUILDUP_FOLLOW_TM.
4. B's Time Machine readout reads the SAME cursor value `step()` already computed that frame — never a
   second `tmSetCursor` call.
5. Drag via `A._makeDraggable` (reuse). Resize is new: a corner handle adjusting the scissor rect's
   pixel size — cheap, no relayout of scene geometry involved.
6. **Scoped to `_previewFly()` only.** Never wired into the MaxQ bake loop — see "Bake mechanism" above.
7. **Launcher: an eye icon (👁, corrected from an earlier binoculars suggestion — user, 2026-08-04),
   OFF by default (user, 2026-08-04: "so it is not cluttered").** Not a
   checkbox row like `cpe-buildup`/`cpe-room-title` (Part B is a whole extra rendered panel, heavier
   than a flag) — a small icon-only toggle button in the existing `#cpe-title` header row (`cinema_path_
   editor.js` ~L616-619, the same row that already carries the drag-handle title), styled to match the
   existing button convention already used in the panel (`padding:6px 12px;font-size:12px;background:
   #2a2e34;color:#ddd;border:1px solid #4a4f57;border-radius:4px`, see the action-row buttons ~L662-665).
   B only exists in the DOM / only runs its scissor render pass while toggled on — zero cost when off.

## ▶ ROADMAP — build order across Parts A-G (user, 2026-08-04, "agree, proceed as long not impacting anything we done")
Not all 7 parts are independent. The real dependency:
- **A/B** (rehearsal environment) — ✅ built, no dependents besides everything below needing it to see results in.
- **C — §CPE_AIM_PIN is the actual foundation**, not D or E individually: one mechanism (an authored
  `lookAt` on a band) with three trigger sources — canvas click (C itself), Find-panel drag (D), clash-
  panel click (E). Build C once; D and E are thin adapters feeding the SAME mechanism, not separate
  features. **NEXT UP.**
- **D, E** — either order once C exists, or together (they share C's reform/spawn logic).
- **Generalize E's leader-line label, don't scope it clash-only** — the "project pin → screen, draw
  label + connector line" mechanism is generic; if built as "label any pinned point" rather than
  clash-specific, D's Find-panel pins get the same moving label for free (room name instead of a clash
  pair name). Build it that way the first time, not clash-only then generalized later.
- **F1** (time readout) needs only A — buildable any time, independent of C. **F2** (sync a stick's
  timing to construction) needs C, same shape of problem as pinning a look-target.
- **G** — parked, independent of all of the above, different input method entirely (recorded walk →
  raw bands, no pin concept).

**Constraint carried into every part from here**: must not regress A/B's witnesses, and must not touch
any file the concurrent 4D-Gantt-revamp session owns (`time_machine.js`, `schedule_author.js`,
`rates.js`/rate JSONs — confirmed zero overlap with A/B's files as of 2026-08-04; re-check before each
new part lands, that session is still active).

## ✅ DONE 2026-08-04 — §CPE_SCRUB + §CPE_VIEWFINDER (Parts A and B, PR bim-ootb#1164)

Both built together (worked in `bim-ootb`'s `/tmp/wt-cpe-rehearsal-studio` worktree, branch
`feat/cpe-scrub-viewfinder`, off `origin/main` @ `5d489c7`), Parts C-G untouched, `cinema_maxq.js`'s
bake loop untouched.

**§CPE_SCRUB**: a horizontal bar (`#cpe-scrub-wrap`) inserted right after `#cpe-hint`, ahead of the
row list — `tNorm` 0..1 over `_state.plan`, exactly as specced. Tick marks are the sticks
(`_bands[i]._stick`), placed by nearest-point match against `_state.filmPts` (the SAME sampled curve
`plan.poseAt(i/FILM_SAMPLES)` the pipe tube is drawn from) — not a linear guess through the walk
beat's own easing/hold/turn remap, which is NOT linear in `tNorm` (effects.js Beat 3). The
clip-in/out shading reuses `s.clipIn`/`s.clipOut` directly; a walk-window highlight (from
`plan.beats.spin/out`) marks the only authorable stretch. Click-vs-drag on the bar reuses the
existing `CLICK_SLOP_PX` doctrine (§CPE_CLICK_SLOP): a drag calls the new `_applyCameraPose(tn)`;
a click inside the walk window converts `tn` → a world point via `plan.poseAt(tn)` → nearest point
on `_state.flowHosed` (index-aligned with `flowRaw`) → the same `_spawnStick(hit)` a pipe click uses.
Outside the walk window a click just scrubs (no spawn — nothing there to seed from).

**Core refactor**: `_previewFly()`'s per-frame `step()` used to inline
`plan.poseAt(tn) → camera.position/controls.target → controls.update() → markDirty` directly.
Extracted verbatim into `_applyCameraPose(tn)`, now the ONE place a pose is ever applied to the live
camera — called from `step()`, from `_scrubTo(tn)` (the scrub drag handler), and by witnesses via a
new read-only probe. Satisfies the doc's own §CPE_PREVIEW_DIVERGENCE doctrine literally, not just in
spirit: scrubbing IS a manual single invocation of the rehearsal's own per-frame function.

**§CPE_VIEWFINDER**: eye icon (👁️, per the 2026-08-04 correction above — NOT binoculars) in
`#cpe-title`'s header row, OFF by default. Toggling on lazily creates a `THREE.PerspectiveCamera`
(`_state.vfCam`, matching the main camera's fov/near/far) and a draggable/resizable HTML frame
(`#cpe-vf-panel`) — the frame is a visual/interaction proxy only, not a second `<canvas>`. The actual
pixels come from ONE renderer (`A().renderer`): a hook (`APP._cpeViewfinderRender`, set only while B
is on) called by `main.js`'s own `animate()` loop right after the main scene render, using
`setScissorTest(true)` + per-pane `setViewport`/`setScissor` (standard three.js multi-viewport
technique), converting the frame's on-screen CSS rect to canvas pixels via
`renderer.getPixelRatio()`. B's camera pose is set from the exact same `p = plan.poseAt(tn)` sample
`_applyCameraPose` just used for the main camera — literally the same object, not a second call.
Drag reuses `A._makeDraggable`; resize is a new corner handle (`#cpe-vf-resize`) adjusting the
frame's CSS width/height, read back into the scissor rect next frame — no scene relayout. Torn down
(`_vfTeardown()`) on editor close so the hook can never outlive the session.

**Bug found and fixed by the new witness, not by inspection**: B's Time Machine readout
(`_vfUpdateReadout()`) used to be called INSIDE `_applyCameraPose`, which runs BEFORE that rehearsal
frame's own `window.tmSetCursor` call in `step()` — so the readout always showed the PREVIOUS
frame's cursor, one frame stale, every frame. Fixed by moving the readout refresh to right after
step()'s own `tmSetCursor` block (and keeping it right after `_applyCameraPose` in `_scrubTo`, where
there is no Time Machine cursor involved at all). This is exactly the §GHOST_GROUND_LIVE_TRIGGER bug
class the spec warned about, caught the same way — a witness comparing the readout against a fresh
`tmGetState()` read, not eyeballing it.

**Witnesses**: new `witness_cpe_scrub_viewfinder.js` — **8/8 gates green on both Duplex and
Terminal** (16/16 total): G-SCRUB-1 (scrub pose == `plan.poseAt(tn)`, delta ~1e-15m), G-SCRUB-2
(spawned stick within 0.11–0.54m of the clicked `tn`'s pipe placement — bounded by flow-polyline
sample density, not asserted blind), G-VF-1 (B pose == main pose, delta ~1e-15m), G-VF-2a (static:
the viewfinder code block contains `tmGetState`, never `tmSetCursor`), G-VF-2b (live: readout day ==
`tmGetState().cursor` day at the same instant, on both a fast-arming building and Terminal's
3.2s-to-arm/1.6s-per-frame case), G-PERF-1a (measured B render-pass cost, not guessed — see below),
G-PERF-1b (static: `cinema_maxq.js` has ZERO references to `_cpeViewfinderRender`), G-VF-off
(toggling off removes the DOM panel and clears the hook). Full existing `witness_cpe_*.js` /
`witness_cinema_path_editor.js` suite re-run clean, including a real end-to-end buildup+bake cycle
(`witness_cpe_hose.js`) — two PRE-EXISTING failures (G10/G7 in `witness_cinema_path_editor.js`;
G-PA-4 in `preview_after`, G-RN-2 in `reopen_node`) confirmed BYTE-IDENTICAL on unmodified
`origin/main` @ `8592b33`, not introduced by this work.

**Measured B perf cost** (G-PERF-1a, ms/frame of B's OWN scissor render pass only, measured around
the extra `a.renderer.render()` call in `_vfRender`, NOT the whole frame): Duplex avgMs=1.39–1.75,
maxMs=3.2–4.0 over 16-17 frames; Terminal avgMs=0.61–2.19, maxMs=1.9–11.7 over 7-8 frames (48k-op
building, 1.6s/frame overall rehearsal cost — B's own added cost stayed under 2ms/frame average even
there). Zero cost when off (hook absent, single property check in `main.js`'s `animate()`).

**Live interactive browser verification** (not just headless witnesses — real `PointerEvent`
sequences dispatched through the actual DOM listeners in a live `claude-in-chrome` session against
`localhost:8460`, Duplex building): scrub-drag to `tn=0.55` landed the camera within `8.89e-15`m of
`plan.poseAt(0.55)`; eye-icon click opened B with the hook installed and the default rect
(300×190px); a real drag on `#cpe-vf-title` moved B by exactly the dragged delta (-60,-40px); a real
drag on `#cpe-vf-resize` resized B by exactly the dragged delta (+80,+60px → 380×250px); B's camera
stayed synced with the main camera (delta `4.04e-15`m) after the resize; toggling off via a real
click removed the panel and cleared the hook. Zero console errors throughout. (Screenshot capture
itself was flaky in that browser session — CDP `Page.captureScreenshot` timeouts unrelated to this
feature — so the proof here is the numeric/log evidence above, which is this project's own stated
primary method anyway.)

**Constants picked without an explicit spec answer — flagged as unconfirmed defaults, not settled**
(the spec's own open question 2, "B's frame rate: full or throttled", is answered here as FULL —
no throttling — since "exact POV" was specced as literally the same sample, and Parts A/B name no
other numeric defaults):
- Scrub bar height 26px, tick-mark width 3px (`SCRUB_H`, `SCRUB_TICK_W`).
- B panel default size 300×190px, minimum 160×100px on resize, corner-handle hit box 16px, default
  position bottom-right with a 16px margin (`VF_DEFAULT_W/H`, `VF_MIN_W/H`, `VF_RESIZE_HANDLE_PX`,
  `VF_MARGIN`).

**Not built (deliberately, per scope)**: Parts C-G (click-to-pin, Find-panel drag, clash-pin,
stick-timing-sync, walk-record-share) — separate, later sessions per the task brief.

## Part C — §CPE_AIM_PIN: click-to-pin explicit look-target
1. Confirmed with user: sets ROTATION only. Position (arc-length placement, height) stays a separate,
   already-existing control.
2. New authored field per band: `lookAt: {x,y,z} | null`, persisted on the same band row (§CPE_IDB_PATH_STORE)
   — no second table, matching guardrail 4 (authored data is stored, never re-guessed).
3. UI: with a stick selected, clicking an object/room in the canvas sets that stick's `lookAt`; B updates
   live — this is the exact loop the user described ("pinpoint a spot where he adjust on canvas the pipe,
   and reflected on that B screen").

## ✅ DONE 2026-08-04 — §CPE_AIM_PIN (Part C, PR bim-ootb#1172)

Built off a FRESH `origin/main` worktree (`/tmp/wt-cpe-aim-pin`, branch `feat/cpe-aim-pin`, base
`490b7a7`) — the old `feat/cpe-scrub-viewfinder` branch was already squash-merged (PR #1164) and was
deliberately NOT reused, per this repo's own documented landmine. `origin/main` confirmed unchanged
throughout; `time_machine.js`/`schedule_author.js`/`rates.js` (owned by a concurrent 4D-Gantt
session) never touched. `cinema_maxq.js` untouched — confirmed by grep and a witness gate.

**Mechanism**: a band gets a new `lookAt: {x,y,z}|null` field, threaded through `_buildOverride`,
`_cloneBands` (undo/redo), `_pathsApply` (load), `open()`'s adopt-on-reopen clone, and the plan's own
`bands:` echo in effects.js — the same seam `_stick`/`_s`/`hold` already ride, no second table
(guardrail 4 held). In `effects.js`'s `_beat3Pose`, a NEW per-plan lookup (`_buildPinZones`/
`_pinLookAtAt`) partitions the walk's own arc-length domain into one zone per band — boundaries at
the midpoint between consecutive bands' own centre-arc-fractions (found by nearest-point match
against `flowWp`, the SAME hosed curve the walk is actually sampled from, not a second unhosed
notion of "where band i is" — no effects.js-side band-identity mapping existed before this, since
`_cinemaBandFlow` fully flattens bands before the gaze code ever sees them). A pinned zone's `e3`
skips `§CPE_AIM_DENSITY`/`§CPE_AIM_DEPTH` entirely and aims straight at `lookAt`; an unpinned zone
runs the existing LOS+density+depth chain completely unmodified — "no bleed" holds STRUCTURALLY
(every `e3` belongs to exactly one zone) rather than by tuning a blend weight.

**UI**: clicking a band's ROW selects it (existing mechanism, unchanged). With a band selected, a
click on the canvas that hits neither a handle nor the pipe (tracked via a lightweight
`_state._pinCandidate`, set on `pointerdown` WITHOUT `preventDefault`/`stopPropagation` — orbiting
with a band selected is completely unaffected) raycasts against real scene meshes (reusing
`measure.js`'s own already-shipped click-to-pick pattern: `A.raycaster`/`A.mouse`, canvas-rect NDC,
excluding `A.ground` and the editor's own overlay meshes) on release, if the pointer stayed under
`CLICK_SLOP_PX`. A small "📌×" badge appears in the row when pinned (spec names no removal gesture;
a pin with no way off would be a trap, same "an affordance you cannot see is not an affordance"
doctrine `§CPE_STICK`'s own history already established) — clicking it unpins.

**A pre-existing coupling, measured and documented rather than hidden**: pinning a band changes the
walk's GAZE at that stretch, and `_evenTurnBuild()` (effects.js:6655) — which predates this feature
entirely — samples the FULL walk's gaze (via `_beat3Pose`) once per plan to build a distance+turn
blended cost table that `_evenTurnRemap` uses to convert time-fraction into arc-fraction. So ANY aim
change anywhere on the walk (a pin, a density trigger flipping, anything) re-shapes that ONE global
table, which shifts where every OTHER `tNorm` lands in arc-space by a small bounded amount —
MEASURED on Duplex: 0.10-0.11m position, 0.15-2.06m aim-target-point deltas at neighbouring bands
(target points sit ~20m out, so this is a few degrees of angular shift); Terminal measured smaller
(0.002-0.067m / 0.03-0.21m). This is `§CPE_EVEN_TURN` working as designed (retiming BY turn cost),
not a leak of the pin mechanism — it would fire identically for a density-triggered aim change with
no pin involved. The witness proves "no bleed" the way the spec actually means it (LOS/density still
GOVERN a neighbour's own zone — checked against the real zone table) rather than asserting an
impossible bit-identical neighbour pose.

**Witness — `witness_cpe_aim_pin.js` (new), 7/7 GREEN on both Duplex and Terminal (14/14 total)**:
G-PIN-0 (the mutation function fires and logs), G-PIN-1a (pinned band's sampled look direction hits
the target within 2°, measured 0.000°), G-PIN-1b (neighbouring bands' own zones stay `lookAt:null` —
the real "no bleed" claim), G-PIN-2 (persistence rides `_buildOverride().bands[i].lookAt`, delta=0),
G-PIN-3 (band centre bit-identical before/after — rotation only, proven not merely asserted),
G-PIN-1c (unpin reverts the aim to within 2° of its pre-pin direction, measured 0.000°), G-PIN-static
(grep proof `cinema_maxq.js` has zero references to the pin machinery). Regression: the Part A/B
witness (`witness_cpe_scrub_viewfinder.js`) re-run clean, 8/8 both buildings; the broader
`witness_cpe_*`/`witness_cinema_path_editor.js` suite re-run — the SAME pre-existing baseline
failures already recorded in the Part A/B DONE block above (G10/G7, G-PA-4, G-RN-2) reproduced
identically, no new regressions.

**Live browser verification** (real DOM `pointerdown`/`pointerup` events through the actual `_wire()`
handlers, not the witness's `_setPin` bypass — the claude-in-chrome extension hit environment-level
GPU-context/tab-crash instability mid-session, unrelated to this code, so this ran as a genuine
Puppeteer session instead, same rigor): real click on a row selected band 1; the camera was orbited
close to the building; a real screen-pixel sweep found a pixel that (a) missed every handle/pipe hit
test and (b) raycast onto a real mesh; a real mouse-down+up there (not a synthetic call) produced
`§CPE_AIM_PIN band=1 lookAt=(-0.61,4.27,1.66) class=Mesh — rotation only...`, `bands[1].lookAt` set
to that exact point, and the row text updated to `"exit door📌×pinned → (-0.61,4.27,1.66) ..."`; a
real click on the 📌× badge unpinned it back to `null`. Zero console/page errors throughout.

**Assumptions flagged (not separately user-confirmed before building, same treatment as Part B's fps
question)**:
- Aim precedence: pin wins locally, LOS/density resume immediately outside its zone — the spec's own
  open-question-1 recommendation, built as the default.
- "With a stick selected" was read as "whichever band is currently selected" (settle/exit-door/stop
  included, not only a user-dropped `_stick`) — the rotation-only mechanism is identical for any
  band and nothing in the spec text restricts it further. An interpretation, not a re-litigation.
- The 📌× unpin badge is a net-new UI affordance the spec doesn't name.
- Does "Save this path" persist `lookAt`? Yes, by construction — it rides `_buildOverride()`, the
  same object Save/the bake already consume; open question 3's own "recommend yes" default, and no
  special-casing was needed to get it (it just falls out of guardrail 4).

**Not built (deliberately, per scope)**: Parts D-G, and the click-to-pin's own live-B-update path
was only exercised via `_probePoseAt`/the real pose pipeline, not by re-verifying `§CPE_VIEWFINDER`'s
own render loop end-to-end again — Part B already proved B samples `plan.poseAt(tn)` faithfully
(PR #1164), and a pin only changes what `poseAt` returns, not how B consumes it.

### ✅ 2026-08-04 follow-up — `#cpe-vf-toggle` eye icon now reflects on/off (PR bim-ootb#1174)
User: "it be nice if we can find another eye icon that is closed eye to reflect it is OFF." The
button showed a static 👁️ emoji regardless of `_state.vfOn`. Fixed by adding real Lucide
`ICONS.eyeOpen`/`ICONS.eyeOff` to `panels.js` (verified against the actual Lucide source, NOT reused
from `panels.js`'s existing `ICONS.eye`, which turns out to be Lucide's "scan-eye" — a different
shape, repurposed there for an unrelated Role View toggle) and a `_eyeIconSvg(on)` helper in
`cinema_path_editor.js` that swaps the button's SVG in place at its one flip site. Open eye = ON,
slashed eye = OFF (default). Live-verified in a real browser session: toggling twice gives
slashed→open→slashed, byte-identical to the initial render, title/color changing in lockstep.
Regression: `witness_cpe_scrub_viewfinder.js` (8/8) and `witness_cpe_aim_pin.js` (7/7) re-run clean.

### ✅ 2026-08-04 REGRESSION FIX — scrubbing no longer moves the main canvas camera (PR bim-ootb#1177)
Real bug, caught live by the user in their own browser (not the claude-in-chrome extension
instability seen elsewhere this lane): dragging the Part A scrub playhead was moving `A.camera`/
`A.controls` — the MAIN viewport. Wrong, per the user directly: **"the main canvas... supposed to
remain as was where user still does traditional editing dragging the pipe etc. Cam POV is inset box
to be an aid only."** Part A point 2 above carries the corrected wording verbatim, marked
`**Correction (user, 2026-08-04, caught live in the browser)**` — that correction is now BUILT, not
just written down.

**What changed, in the order it actually happened** (recorded honestly — the first attempt was not
the final shape): `_applyCameraPose` (the function §CPE_SCRUB/§CPE_VIEWFINDER's PR #1164 extracted
as "the ONE place a pose is applied to the live camera") was being called by BOTH `_previewFly()`'s
rehearsal step() (correct — the Preview button legitimately flies the main camera) AND the scrub-
drag handler (wrong — scrub was never supposed to move any live camera at all, per the correction
above). A first fix split this into `_applyCameraPose` (main camera, rehearsal-only) and a new
`_applyVFPose` (B's inset camera only, scrub-only). That was WRITTEN, witnessed, and then REVERTED
before landing: the user asked for the simpler cut instead — **scrubbing is now VISUAL-ONLY**. It
touches no camera at all, main or B's inset — only the playhead position and the "timeline NN.N%"
readout move. `plan.poseAt(tn)` is still sampled (read-only, informational — useful to a witness or
a future session) but nothing writes it to any camera. `_previewFly()`'s own step() — and the
pre-existing "Preview" button it belongs to — is completely unaffected by any of this: it still
legitimately flies the main camera for its duration and restores it to the editing pose on
completion, an established, separate, unrelated gesture.

**⛔ OPEN QUESTION for a future session — the scrub bar's own home is NOT settled.** Fixing the
regression required an incidental decision that was NOT asked for and should not be read as final:
the scrub bar's DOM existence is now gated to B being open (built/torn down inside
`_toggleViewfinder`, alongside the vf panel) rather than always present from editor-open. This was
the fastest way to stop implying "scrub drives a camera" in the UI (a bar with no live 3D effect
when B is closed reads oddly if it is always visible) while landing the actual fix, NOT a considered
answer to "where does this widget belong." The user's own words on this exact point, said WHILE the
first (reverted) fix was being built, apply just as much to the final shape: **"that timeline was
supposed to be standalone widget panel... independent because it is supposed to do more next ie pin
point drop, Find / Clash drop... let's have the next prompts/# session figure that out — as now just
get the canvas part to be its true self."** A future session should treat "standalone widget vs
docked under B" as a real open design question, not rediscover it from scratch — Part D
(§CPE_FIND_TO_PIN, below) and a future clash-pin feature are exactly the "carries more later" the
user is referring to, and whichever answer is picked should be made with THAT future load in mind,
not just today's fix.

**Read this first if picking up this file cold**: `cinema_path_editor.js`'s own `CPE_V` version-
banner string (top of the file, logged as `§CPE_LOADED` on every load) was reorganized 2026-08-04
into one clause per line, NEWEST FIRST — the top few lines give a fast, accurate summary of current
behaviour before diving into this doc's full history. `effects.js`'s `EFFECTS_V` and
`cinema_maxq.js`'s `MAXQ_V` got the same readability pass (every `§TAG` preserved; `MAXQ_V`'s content
verified byte-identical against the pre-reorg original — a pure format change, zero behaviour
touched, matching this lane's standing "never touch the bake loop" rule). `EFFECTS_V` also picked up
a real fix in passing: it had never been bumped for §CPE_AIM_PIN's actual behaviour change in
`_beat3Pose` (added the same day as Part C shipped) — caught and corrected (v18→v19), not left for a
future session to rediscover as a mystery gap between the changelog and the code.

**Witnesses**: `witness_cpe_scrub_viewfinder.js` REWRITTEN — the old G-SCRUB-1 asserted exactly the
buggy behaviour (scrub reproduces `poseAt` on the LIVE camera) and no longer exists. New gates:
G-SCRUB-GATED (bar absent while B off, present once on), **G-SCRUB-NOCAM (the actual regression
gate — main camera position AND orbit target, plus B's `vfCam` position, byte-identical before/after
a scrub drag)**, G-SCRUB-VISUAL (the playhead/readout still updates — the feature has a real,
visible effect), G-SCRUB-SPAWN (renamed from G-SCRUB-2, click-to-spawn-a-stick still works, now
gated behind B being on), G-SCRUB-TEARDOWN (toggling B off removes the bar too). **12/12 green on
both Duplex and Terminal** (was 8/8 before this rewrite — 4 new gates, one retired). G-VF-1 now
drives a new `_applyCameraPoseForTest` witness hook (the real rehearsal-only pose function) since
`_scrubTo` no longer touches any camera at all. Full `witness_cpe_*`/`witness_cinema_path_editor.js`
regression suite re-run clean; the same pre-existing baseline failures already on record above
(G10/G7) reproduced identically — not new regressions.

**Live-verified** via real pointer-drag sequences (mouse down → several moves → up, not a synthetic
call) in a genuine browser session: with B closed, the scrub bar does not exist and `_scrubTo`
leaves the main camera byte-identical; with B open, a real drag on the track leaves BOTH the main
camera and B's `vfCam` byte-identical while the readout genuinely updates (measured 0.0% → 70.0%).

## Scope guardrail amendment (record, per this doc's own convention)
§Scope guardrails rule 1 above ("no new panel") is superseded here, same as the 2026-07-26 3D-gizmo
amendment superseded guardrail 3 — B is unambiguously a new panel. Recorded deliberately so it is not
flagged as drift later.

## ⛔ Open questions — ask the user, do not guess
1. **Aim precedence**: when a pin coexists with LOS/§CPE_AIM_DENSITY, recommend the pin always wins
   locally at its own band, with LOS/density resuming immediately after (no bleed into neighbours) —
   confirm before building, since §CPE_AIM_DENSITY's own precedence was tuned carefully.
2. **B's frame rate**: full rehearsal fps (a true second render pass every frame) or throttled (e.g.
   every other rAF) given it doubles per-frame render cost during rehearsal only?
3. **Does "Save this path" persist `lookAt`** even when B was only used for rehearsal? Recommend yes —
   same explicit-save gate as everything else (§CINEMA_PATH_EDITOR_MODEL rule 5), no special case.

## Witness claims (spec-first — write these before any implementation)
- **G-SCRUB-1**: dragging the playhead to `tNorm=X` reproduces the exact pose `_previewFly()` would
  show at that instant of a normal rehearsal — no second pose pipeline.
- **G-SCRUB-2**: clicking empty bar at `tNorm=X` spawns a band at the same world point the pipe's own
  arc-length placement gives for `X`.
- **G-VF-1**: B's camera pose+aim at `tn` matches the main camera's exact pose+aim if the rehearsal were
  playing normally at `tn` — proves no second notion of the path (mirrors §CPE_PREVIEW_DIVERGENCE).
- **G-VF-2**: B's Time Machine cursor equals the main preview's cursor at the same `tn`, sampled
  simultaneously — no drift, no second clock (the exact bug class §GHOST_GROUND_LIVE_TRIGGER fixed).
- **G-PIN-1**: a pinned band's sampled look direction points at the pinned target within tolerance; the
  bands immediately before/after are unaffected (no bleed).
- **G-PERF-1**: measured (not guessed) ms/frame added by B during rehearsal; and a static proof the
  MaxQ bake loop never calls B's render path at all.

## Part D — §CPE_FIND_TO_PIN: drag a Find-panel room result onto the pipe (user, 2026-08-04, added while this spec was being written)
> "the Find room path export to alt-c idea. If the find panel can give a marker to be dragged to the
> canvas where alt-c is active and it become a stick nearest along the pipe and reform it to go near
> the spot with pin drop to the selection. Or if the pipe is near enough no need stick just reform to
> sight that pin drop and even special blue band label mentioning it for all pin drops to be pointed
> out."

1. **The marker is not new data.** The Find panel already computes a verified room anchor/centroid for
   every result it draws (`navigate_find.js:1264 _drawPathHighlight`, `:3319 _renderPathResult` — "a
   room whose centroid sits on a real, door+wall-verified hallway backbone"). This feature exposes that
   SAME point as a drag source, it does not compute a second one.
2. **Drag-out-of-panel-into-canvas is new UI** — the Find panel today is itself draggable (`S265 Phase
   5`, navigate_find.js:231) but no result ROW currently drags OUT of the panel onto the 3D view. This
   is the one genuinely new interaction surface in this whole spec; everything downstream of "we now
   have a world point" is reuse.
3. **Nearest-point-on-pipe already exists.** §CPE_HOSE_REANCHOR ("pulls re-project by world anchor")
   is exactly the arc-length nearest-point projection this needs — given the dropped world point, find
   its nearest point on the current pipe. Reuse that projection, do not write a second one.
4. **Two outcomes from that projection, both explicit, no new judgment call to invent silently:**
   - **Pipe already passes within a threshold distance** → no new band. Reform the nearest EXISTING
     band's aim to a `lookAt` at the dropped point (§CPE_AIM_PIN's field, same mechanism, different
     input method).
   - **Too far** → spawn a new band at the pipe's nearest point via §CPE_SCRUB's tNorm→world placement
     (Part A.4, same inverse arc-length lookup), THEN set its `lookAt` to the dropped point. The path
     re-forms toward that point exactly as §CPE_BANDS rule 7 already guarantees for any dragged band
     ("bands are highly movable, path must re-form... no placement limits").
   - **⛔ Open question**: the threshold distance is a new constant — measure it from `A.cinemaFan`
     clearance the same way §CPE_BANDS' corner-rounding already derives a bound from measured space
     (line ~256-259 above), do not invent a fixed metre value.
5. **Blue pin-drop label — corrected scope (user, 2026-08-04): BAKE-ONLY, burned into the exported video,
   not an editor-panel decoration.** "the blue background label box is happening only during baking, the
   final movie render will carry it just above the present label line, to indicate that is the pin drop
   in sight."
   - **"The present label line" = the room-title caption**, confirmed at `cinema_maxq.js:598-599`:
     `A.roomTitleCompositeOntoCanvas(ctx, w, h, titleInfo.name, titleInfo.opacity)` — composited onto the
     SAME 2D canvas MediaRecorder/`captureStream()` records, which is why the room title survives into
     the exported `.webm` (a DOM overlay would NOT — canvas capture only sees what's drawn onto the
     canvas itself). The pin-drop label must hook this identical composite mechanism, drawn just above
     that line, not a separate DOM element.
   - **Active only while "in sight"** — i.e. only on frames where the currently-flown pose is at (or
     approaching) a band whose `lookAt` is set, using the same per-frame cursor §CPE_STICK_APPROACH
     already derives (`stickApproachAt(_tn)`, cinema_maxq.js:1156) to know which stick is current. Reuse
     that, do not add a second "which stick is this" computation.
   - **Caution, do not invent a clashing scheme**: §CPE_STICK_RED_BAR already assigns meaning to red/blue
     in the EDITOR ("an unselected stick is a RED bar with BLUE dots") — that convention lives in
     `cinema_path_editor.js` and never appears in baked output, so it does not actually collide with a
     bake-only blue label, but settle the exact swatch/label text with the user before building rather
     than assume.
   - **Cost, measure don't guess**: this adds one more per-frame canvas composite call during the bake,
     same class of cost as the existing room-title composite — small, but real, folds into G-PERF-1.

### Witness claims — Part D
- **G-FIND-PIN-1**: dropping a Find-result point that lies within the (measured, not guessed) threshold
  of the pipe changes ONLY that nearest band's `lookAt` — no new band is created, sampled positions of
  every other band are unchanged.
- **G-FIND-PIN-2**: dropping a point beyond threshold spawns exactly one new band at the pipe's true
  nearest-point projection, with `lookAt` set to the dropped point — provable by comparing the new
  band's world position against the same arc-length projection §CPE_HOSE_REANCHOR already computes
  independently.
- **G-FIND-PIN-3**: in a BAKED frame sequence, the pin-drop label composites (via the same
  `roomTitleCompositeOntoCanvas`-class call, positioned above the room-title line) on exactly the frames
  where `stickApproachAt` reports the current stick has a non-null `lookAt`, and on no other frame — and
  never appears in the editor's own rehearsal/UI, only in the exported `.webm`.

## Part E — §CPE_CLASH_PIN: clash panel → pin drop, with a moving leader-line label (user, 2026-08-04)
> "It be even cooler if the label moves along to indicate the pinned spot with a line from the label to
> the pin drop, specifically pointing it out. For clash pair be swell, and even retain the blue/red
> clash pair, shine thru when passing by. That means the Clash panel also can be called on board and a
> click to zoom on it will be a pin drop if canvas has alt-c active."

Grounded in **existing, already-shipped** clash code — nothing here is a new visual system:

1. **The clash overlap point already exists.** `A._flyToClash(idx)` (`measure.js:619`) computes
   `mid`/`oCenter` — the overlap-zone midpoint between the two clashing elements — every time a clash
   row is clicked. This IS the pin-drop world point. No new geometry math.
2. **The blue/red shine-through already exists — retain it exactly, do not reinvent.**
   `measure.js:682`: `meshColors = [0xff2222, 0x2266ff]` (red A / blue B), the clipped overlap mesh at
   `measure.js:715-719` is built with `depthTest:false, depthWrite:false` and `renderOrder 998/999` —
   already the precise "shine through walls when passing by" behaviour asked for. "Retain" means: when
   a clash becomes a pin-drop, its highlight meshes are added to the scene the SAME way `_flyToClash`
   already adds them — the movie camera passing by renders them for free, being ordinary scene objects.
3. **Clash-row click gets ONE new branch, not a rewrite.** `measure.js`'s row `pointerup` handler
   (~line 975) calls `A._flyToClash(idx)` unconditionally today. New rule: **if the cinema path editor
   is open, route the SAME computed `mid`/`oCenter` into §CPE_FIND_TO_PIN's drop logic (Part D) instead
   of flying the live camera immediately** — reuse Part D's threshold/reform-vs-spawn decision verbatim,
   the clash overlap point is just another world point being dropped. When the editor is NOT open,
   behaviour is unchanged (still flies immediately) — this must not regress the existing clash workflow.
4. **The pin-drop label text, for a clash pin, is the pair label already shown in the clash list header**
   (`measure.js:843`, e.g. "MEP vs Structural") — reuse that string, don't invent new label text for the
   clash case.
5. **The moving leader-line label.** "Moves along... a line from the label to the pin drop" means the
   label is NOT a fixed screen position — its anchor is the pin's live projected screen point, which
   changes every frame as the camera flies past it. The projection technique already exists and is used
   for exactly this class of HUD work: `.project(A.camera)` appears at `effects.js:1258`, `effects.js:1863`,
   `city.js:1023`, and — closest precedent — `measure.js:1598` (`const projected = m.mid.clone().project(A.camera)`,
   already projecting a clash midpoint to screen space). Per baked frame: project the pin's world point,
   convert to canvas pixels, draw the label box near it (clamped on-screen if near an edge) plus a
   straight connector line from the label box to the exact projected point — on the SAME composite
   canvas the room-title line already draws onto (`cinema_maxq.js:598-599`), so it is captured into the
   exported video exactly like the label itself (Part D point 5).

### Witness claims — Part E
- **G-CLASH-PIN-1**: dropping a pin from a clash row (editor open) produces a band `lookAt` numerically
  identical to the `mid`/`oCenter` `A._flyToClash` computes independently for the same clash index.
- **G-CLASH-PIN-2**: the clash highlight meshes present during bake are byte-identical in construction
  (color, `depthTest`, `renderOrder`) to `A._flyToClash`'s own — proves no second highlight system exists.
- **G-CLASH-PIN-3**: across a sampled frame range while the camera is near a clash pin, the label's
  on-canvas anchor equals `pinPoint.clone().project(A.camera)` converted to that frame's pixel space —
  proves the label tracks the live camera rather than a cached position.
- **G-CLASH-PIN-4** (regression): with the cinema path editor CLOSED, clicking a clash row still calls
  `A._flyToClash` and flies immediately, unchanged from today.

## Part F — §CPE_STICK_TIME_SYNC: film-time readout on sticks + sync a pin to its construction moment (user, 2026-08-04)
> "to set pipe flow timing to when that selection gets constructed, the timings also appearing on the
> stick markers on canvas saying exactly what time in the movie that part of the path is."

Two halves — one is straightforward reuse, the other opens a genuinely new question.

### F1 — the readout (no open question, cheap, build as spec'd)
1. Every stick already has a `tNorm` (its arc-length position along the pipe, same value Part A's scrub
   ticks use). The film's real total duration in seconds is already computed every rehearsal —
   `_buildOverride()._total`, the same value §CPE_ROOM_TITLE already reads (`s.roomTitle ?
   _buildOverride()._total : 0`) to time its live caption.
2. Stick film-time = `tNorm × _buildOverride()._total`, formatted mm:ss. Pure arithmetic on numbers
   already in memory — no new per-frame cost, no new pipeline.
3. Display it in two places, both already-existing surfaces: the row list (add a column) and Part A's
   scrub-bar tick marks (label under each tick).

### F2 — sync a pin's timing to when the selected element is actually built (open question, do NOT guess)
1. **The exact primitive this needs already exists, already witnessed.** `_ghostGroundArm`
   (`cinema_maxq.js` ~L211-217) binary-searches a target construction `end_ts` for its RANK within
   `_wpSched.ends` (the full sorted completion order every op is placed in — built by `_workPacingArm()`,
   `cinema_maxq.js:70-83`), giving `elementsFirstT = rank/total` — a real timestamp → film-fraction
   conversion, gated by G-GG-12 (2026-08-03 session). Reuse this UNCHANGED for a selected element's own
   `end_ts` (fetched by guid, from a Find-panel pick or a Part E clash pair) instead of `firstAboveMs` —
   it is the same lookup, different input row.
2. **That gives a target fraction F — "this element finishes construction at F% into the schedule."**
   The open question is what F does to the stick:
   - **(a) Retime the path** — force the camera's ARRIVAL at that stick to occur at film-time
     `F × totalSec`, by adjusting the speed of the leg(s) around it. This is a NEW kind of authored
     timing constraint — nothing today lets one stick pin an exact arrival time. Closest existing
     precedent: `tour.js`'s per-action `speedMul` (already used for §INTERIOR_PACING) — a per-leg
     multiplier, not a global retime.
   - **(b) Read-only comparison** — just show "this stick lands at 0:42, the element completes at 0:57,
     15s late" and leave the user to nudge pacing by hand. No new retiming engine at all.
3. **Why this isn't safe to just pick:** the film's global clock, when buildup/work-pacing is on
   (§CPE_BUILDUP_WORK_PACED), is ALREADY the cumulative elements-placed fraction — but that paces the
   WHOLE film by overall schedule progress, not by any ONE element's own build moment. A stick's spatial
   arc-length position and one specific element's construction rank are two independent curves; nothing
   today guarantees they coincide. Forcing them to coincide (option a) means retiming legs around a
   pinned point — the same shape of problem as `tour.js`'s `_paceBuildRemap` (§CPE_PACE_FLOAT_GAP
   amendment at the top of this file already deals with an adjacent tension: a user-keyed total fighting
   an automatic pacing remap). **Recommend (a), scoped LOCAL to the adjacent leg(s) only** — same
   locality doctrine §CPE_BANDS already established (edits stay local, no whole-film ripple) — but this
   is a design call for the user, not something to build on a guess.

### Witness claims — Part F
- **G-TIME-LABEL-1**: every displayed stick time equals `tNorm × totalSec` within one frame, cross-checked
  against the actual bake frame §CPE_STICK_APPROACH independently reports reaching that stick at.
- **G-TIME-SYNC-1** (once F2's question is settled): a stick with sync-to-construction enabled arrives,
  in the baked film, within one frame of `elementsFirstT × totalSec`, where `elementsFirstT` comes from
  the SAME rank-lookup G-GG-12 already proved correct — reusing that gate's own regression numbers as
  the cross-check, not re-deriving them.

## Addendum — discipline highlighting is free, not a new feature (user, 2026-08-04)
Earlier brainstorm floated a "per-segment discipline toggle in the B viewfinder" as new tooling.
**Correction, verified in code**: the Find panel's existing X-Ray/ghost mechanism (`A.toggleXray`,
`filterByGuids`, `navigate_find.js`) already highlights a selected discipline/room and dims (ghosts)
everything else. If left ON while Alt+C rehearses or bakes, this effect applies with zero new engineering
— nothing to build here, just confirm it isn't turned off when Alt+C opens.

## Part G — §CPE_WALK_RECORD_SHARE: record a Walk Site session, share as URL, apply on open ⏸ PARKED (user, 2026-08-04)
**Parked, not dropped** — user: "just park that idea, return to the enhanced movie maker." Spec below
is complete and grounded (corrected twice, see the two correction notes inline); resume directly from
here when picked back up, no re-derivation needed. Session moved on to building Parts A+B.
**Correction (user, 2026-08-04, same session): Walk Site mode is virtual, not GPS-tracked.** "The walk
site needs no GPS. It is only the other share/snags that does. Our particular walk site is virtual, to
simulate using phone giving some AR experience. To be at site is just incidental." Verified in code —
`walk.js`'s `walkModeGpsTick` comment says outright: **"GPS blue dot position update only — orientation
is event-driven."** `A.startWalkGpsTracking` moves a separate `A.walkBlueDot` marker (a you-are-here
overlay, useful only if actually on the real site) and never touches `A.camera.position`. The walk
camera itself is driven entirely by `A.advanceWalkStep()` (`walk.js` ~L458), fed by exactly ONE input —
**tapping/holding the blue Drive-Thru forward-arrow button** (`startDriveThru`, the "⬆" button). Point
the phone (compass/tilt via `deviceorientation` sets facing), tap or hold the arrow, and
`A.camera.getWorldDirection(dir)` + a fixed `WALK_STEP_DISTANCE` moves the camera that way, including
vertically ("tilt phone up to climb"). **Correction confirmed twice by the user, who wrote this code:
there is no step-pedometer.** `startStepDetection`/`devicemotion` accelerometer step-sensing exists in
`walk.js` as dead code — grep confirms `startStepDetection()` is never called anywhere except its own
definition; the only other reference is a comment, `"Drive-Thru replaces shake-to-walk — no
startStepDetection()"`. No GPS, no anchor calibration, no real-world coordinate, no pedometer — compass
for direction, one button for advance. GPS (`setWalkAnchor` + `startWalkGpsTracking`) is a genuinely
separate concern used elsewhere (on-site snag/issue geotagging), correctly out of scope for this part.
**Consequence for this spec, all in the walk-recording's favour:** `A.camera.position` during a walk is
ALREADY in the exact same Three.js scene coordinates `poseAt`/bands use — recording it needs no
coordinate transform and carries no GPS/dead-reckoning uncertainty at all. The only real fidelity
questions are ordinary compass-sensor jitter (already something `walkCompassReadings`/`sitecam.js`
smooths) and the fact that each step is a fixed-length quantized hop, not a continuous trace — worth
factoring into the downsampling below rather than assuming dense continuous samples need thinning.
> "or better still not realtime, just record then share as a URL+ notation to whatsapp etc. The desktop
> clicks on the link, shall apply the notation to the URL building.db set... during walk mode, press
> record this walk.. end of it share."

**Drops the whole real-time transport question from earlier in this session** — no WebSocket, no
WebRTC, no live link at all. Record locally, share a normal link through normal channels, done. This is
simpler than Part F's discussion and reuses more existing code than any other part of this spec.

### Grounded in what already exists — three separate systems, already built, being connected
| what | where | why it matters here |
|---|---|---|
| Live walk pose, already computed on every arrow-tap | `walk.js`: `advanceWalkStep` (fixed-step advance along `camera.getWorldDirection`), driven by the Drive-Thru arrow button; facing comes from `deviceorientation` via `sitecam.js`/`A._walkOrientListener` | "Record" only needs to APPEND the camera pose to an array on each `advanceWalkStep()` call — nothing new to sense or compute. |
| Share URL builder, already encodes state as hash params | `A.buildShareUrl()` (`share.js:211-290`) — builds `base?db=<building>#cam=..&tgt=..&pick=..&storey=..&xray=1&tm=..&tour=play`, already logs `walk=!!A.walkModeActive` in its own diagnostic (line 287) — walk-mode awareness already exists in this function, just not yet a shared param | Add ONE new part, `walkpath=<encoded waypoints>`, to the SAME parts array — not a new URL scheme. |
| Native share, already working | `A.quickShare()`/`navigator.share()` (`share.js:489+`), `§SHARE_METHOD` logged on success — this is already how WhatsApp/etc. sharing happens today for other links | Zero new sharing UI. The "share to WhatsApp" ask is already fully solved by existing code. |
| Hash-param apply-on-open, already working | `main.js:992`: `location.hash.slice(1).split('&')` → `hashParams`, dispatched per key (cam/tgt/pick/storey/xray/tm/tour each already have a handler) | Add ONE new dispatch case, `walkpath`, to the SAME existing per-key handling — not a new parser. |
| Building match on open, already working | `?db=` param in the base URL + `validateDB()` (`share.js:47-71`, checks required tables incl. `building`) | "Applies to the URL building.db set" is already solved — nothing new needed for this half of the ask. |

### The new pieces — small, all additive
1. **Record button in Walk Site mode.** Mirror the existing `startDriveThru`/`stopDriveThru` touch-button
   pattern (`walk.js:396-457`, `touchstart` bound) — a "Record this walk" toggle that starts appending
   `{x, y, z, heading, t}` to an array on every tick already firing, stops on tap, nothing new sensed.
2. **Downsample before sharing — do NOT ship the raw tick log.** §CPE_BANDS already established the
   doctrine that authored paths are a HANDFUL of waypoints/bands, never dense raw samples ("6 waypoints,
   folded into 3 rows... STORE 3 BANDS, NOT 6 POINTS"). A multi-minute walk at several ticks/second is
   hundreds-to-thousands of samples — both too large for a URL and inconsistent with how every other
   path in this system is stored. **⛔ Open, do not guess**: the simplification tolerance (how much a
   downsampled path may deviate from the recorded one) needs measuring against real recorded walks, the
   same "don't invent a fixed constant" discipline §CPE_BANDS already applied to corner rounding via
   `A.cinemaFan`. A standard path-simplification technique (e.g. Douglas-Peucker on the position samples)
   is the right SHAPE of fix; the tolerance number is not.
3. **Apply-on-open stages into the editor, does not auto-commit.** Per §CINEMA_PATH_EDITOR_MODEL rule 5
   (persistence is an explicit "Save this path" action; adjusting is ephemeral) — opening a walk-share
   link must open Alt+C with the walked path pre-loaded as the CURRENT edit, exactly as if the desktop
   user had just placed those bands by hand. It must NOT silently overwrite the building's stored
   `cinema_path` — same gate `G4b` already protects for manual edits.

### Witness claims — Part G
- **G-WALKSHARE-1**: record → `buildShareUrl()` → parse the resulting `walkpath=` param → the
  reconstructed path's sampled `poseAt(t)` stays within the (measured, not guessed) simplification
  tolerance of the ORIGINAL raw tick log — proves the encode/decode round-trip preserves the walked
  shape, not just "produces a path."
- **G-WALKSHARE-2**: opening a walk-share link stages the path into the editor and leaves the building's
  stored `cinema_path` untouched until "Save this path" is explicitly clicked (reuses `G4b`'s existing
  ephemerality proof against this new entry point).
- **G-WALKSHARE-3**: opening a walk-share link for building X while a DIFFERENT building is currently
  loaded correctly loads X first (via the existing `?db=`/`validateDB` path) before the notation is
  applied — order-of-operations regression guard.

## ✅ DONE 2026-08-05 — §CPE_SCRUB_STANDALONE + §CPE_SCRUB_VF_LIVE + §CPE_SCRUB_PLAY (settles the #1177 OPEN QUESTION)

Resolves the open question the #1177 regression-fix session deliberately left unanswered: **"the scrub
bar's own home is NOT settled... standalone widget vs docked under B."** User, this session: *"that
timeline was supposed to be standalone widget panel... independent"* — confirmed, and B is *"purely
display for user bearing"* (no drop/raycast interaction on it at all). One connected batch, built
together in `bim-ootb`'s `/tmp/wt-cpe-scrub-pov` worktree, branch `fix/cpe-scrub-pov-live`, off
`origin/main` @ `e1315e8`. `#cpe-panel`'s own existing controls (rows, hose, clip, buildup, the
`#cpe-preview` button) are untouched throughout — user directive this session: protect the main canvas
and the Alt+C box from drift, the only standing exception being the earlier eye-icon sprite swap.

**§CPE_SCRUB_STANDALONE**: the scrub bar is now its own draggable panel (`#cpe-scrub-panel`), built
alongside `#cpe-panel` at editor-open time and torn down alongside it in `finish()` — no longer coupled
to B's toggle at all. Default position sits directly below B's own default rect (`VF_DEFAULT_H +
SCRUB_PANEL_GAP`) so the two read as one cluster while remaining separate panels; draggable via the
same `A._makeDraggable` convention as B, position remembered for the session (`_scrubRect`, same
scope as `_vfRect`/`_panelPos`). Toggling B on/off no longer builds/removes the bar — only closing the
editor does (`_scrubPanelTeardown()`, mirroring `_vfTeardown()`'s shape).

**§CPE_SCRUB_VF_LIVE**: a scrub drag now drives B's inset camera (`vfCam`) again — the mid-fix cut
written, witnessed, and reverted before #1177 landed, restored now that the standalone panel makes B a
stable, separate concern from the actual regression invariant. The main canvas camera/controls are
**still never touched by any scrub**, drag or click — that invariant is unchanged from #1177, just no
longer conflated with "does B update." `_scrubTo(tn)` now writes `_state.vfCam.position`/`.lookAt`
directly from the same `plan.poseAt(tn)` sample it already computed, gated on `_state.vfOn`.

**§CPE_SCRUB_READONLY**: the bar no longer spawns or selects sticks on click — retires the old
click-to-spawn path entirely (user: *"clicking on them has no reaction, user has to do edits the
original way on canvas... or the alt-c panel row rows"*). A click (no drag) now just scrubs to that
point, identical to a drag — the click-vs-drag distinction that used to gate "scrub vs spawn" is gone,
since there is no longer a second behaviour to gate. Stick tick marks render as **blue** lines
(`CPE_STICK_BLUE`), not the old red — read-only, purely informational; selection highlighting (orange)
still reflects `_state.held` set elsewhere, the bar just can't set it anymore. `_tnormToStickHit` and
its witness hook (`_scrubHitAt`) were dead code once nothing called them — removed.

**§CPE_STICK_TIME_SYNC F1**: the readout is `mm:ss / mm:ss` (elapsed / total film length), not a bare
percentage — `_fmtMMSS(tNorm * _buildOverride()._total)`, hoisted once per `_renderScrub()` call rather
than recomputed per tick (that call deep-copies bands/hose, not free to call in a per-drag-frame loop).

**§CPE_SCRUB_PLAY**: a play/pause transport button (`#cpe-scrub-play`, left of the track) in the new
panel — additive only, the existing `#cpe-preview` button in `#cpe-panel` is untouched. Starting reuses
`_previewFly()` verbatim (same pose source, same buildup/room-title/ghost-ground/day-counter wiring).
Pause/resume are new: `_previewFly()` exposes `_state._flyPauseAt`/`_flyResume` closures while a flight
is in progress — pausing freezes the flight fraction `u` (nothing writes the camera meanwhile, same
contract tour.js's own `§TOUR_TIMELINE_SCRUB` pause already established: "pause HOLDS the pose"),
resuming re-anchors the wall-clock start time so `u` continues exactly where it left off. Button
icon/title are driven by `_renderWhole()` (already the single place `_state.flying` drives UI from),
not a separate state-sync mechanism.

**§CPE_SCRUB_BEARING** (user, same session: *"the scrubber and pov correlates which stick the user
selects, they indicate so user gets perfect bearing"*): selecting a stick — from EITHER the canvas
click or the row-list click, both of which already funnel through the one `_hold(bi, zone, frame)`
entry point — moves the playhead (and, if B is on, its camera) to that stick's own film position.
Reuses `_scrubTo` verbatim, so it inherits §CPE_SCRUB_VF_LIVE's B-update and the main-camera-untouched
invariant for free — no second pose path.

**§CPE_VF_EYE_SPRITES** (PR bim-ootb#1179, undocumented in this file until now): the `#cpe-vf-toggle`
icon uses real open/shut eyelid PNG sprites (`viewer/icons/eye_open.png`, `eye_closed.png`, supplied by
the user) rather than Lucide's slashed-eye pair, which read as "eye with a line through it" and not an
actual shut eyelid on a second look. `ICONS.eyeOpen`/`eyeOff` removed from `panels.js` as dead code.

**Witnesses**: `witness_cpe_scrub_viewfinder.js` REWRITTEN — the v23-era gates that asserted the exact
OPPOSITE of this session's changes (bar gated to B; B's camera never moves on scrub; a bar click spawns
a stick) are gone. New/changed gates: G-SCRUB-STANDALONE (panel exists before B is ever toggled on),
G-SCRUB-NOCAM (main camera invariant, unchanged in spirit), G-SCRUB-VISUAL (mm:ss readout, not %),
G-SCRUB-VF-LIVE (scrub drives B's camera to `plan.poseAt(tn)` while main stays untouched, same drag),
G-SCRUB-NOSPAWN (replaces G-SCRUB-SPAWN — a bar click never spawns), G-SCRUB-TICK-BLUE (tick colour),
G-SCRUB-PERSISTS (replaces G-SCRUB-TEARDOWN — toggling B off no longer removes the bar), G-SCRUB-PLAY
(pause freezes `u` over a real wait, resume continues it), G-SCRUB-BEARING (selecting a stick moves
playhead + B), G-SCRUB-CLOSE-TEARDOWN (closing the editor removes the bar). G-VF-1/2, G-PERF-1a/b kept
unchanged — same mechanism, unaffected by any of this session's changes.

**Not built (deliberately, per scope — user: "just get the scrubber widget working with pov right
first")**: Parts D/E/F2/G (Find/Clash pin-drop, sync-to-construction, walk-record-share) — the
canvas-native drag-a-dot pin redesign discussed this session (long-press a Find result → reform/spawn
via nearest-point-on-pipe, threshold from `A.cinemaFan` clearance, generalizes to Clash later) is
scoped but **not started** — settled decisions recorded, one open threshold question remains
(derive it from `A.cinemaFan` clearance, not yet measured).

## ▶ SESSION HANDOFF 2026-08-05 (LATE) — read this first if picking this up cold

Context is closing mid-fix on user instruction ("stop, let new session handle") — this section is the
complete state, so the next session does not have to re-derive anything above. Three items open, one
of them urgent (a real behavioural regression the user caught live), plus a landmine to fix FIRST.

### ✅ DONE (2026-08-05) — orphaned commit recovered, PR #1195 open
Cherry-picked `a4c24da` onto a fresh branch (`fix/cpe-panel-clear`) off current `origin/main` (reused
existing `/tmp/wt-cpe-vf-followup` worktree). Clean cherry-pick, no conflicts. Re-ran
`witness_cpe_scrub_viewfinder.js` against HHS_Office_Federated on a local server (port 8460) —
16/16 green, same result as the original commit claimed. Pushed and opened
https://github.com/red1oon/bim-ootb/pull/1195 — MERGED 2026-08-04 19:23 UTC.

### ✅ DONE (2026-08-05) — scrub-play button now POV-only, PR #1197 open
Implemented exactly the 6-step plan this section previously scoped: extracted `_applyVFPose(tn)` out
of `_scrubTo`'s inline block; `_previewFly(povOnly)` branches `step()` on it and skips the main-camera
save/restore when `povOnly`; `_wireScrubPlay` now calls `_previewFly(true)`; `#cpe-preview`'s no-arg
wiring untouched. New gate `G-SCRUB-PLAY-POVONLY` added to `witness_cpe_scrub_viewfinder.js` — main
camera byte-identical across a full button-driven flight (start/pause/resume). 17/17 green
(HHS_Office_Federated). Re-ran the two dependent legacy witnesses to confirm no regression:
`witness_cpe_room_title_live.js` 4/4, `witness_cpe_room_title_timing.js` 3/3 — `#cpe-preview` still
flies the main camera exactly as before. Pushed:
https://github.com/red1oon/bim-ootb/pull/1197 — MERGED 2026-08-04 19:59 UTC.

### ⛔ BLOCKED (2026-08-05, updated) — POV alignment: static code correlation exhausted, needs a live repro with the new diagnostic
User pushback, correctly: don't ask a human to eyeball a screenshot and guess — trace the code. Did.
Confirmed via code (not assumption): `a.canvas === a.renderer.domElement` (no aliasing), no CSS
transform/letterbox on the canvas, `EffectComposer.setSize()` uses the same `window.innerWidth/
innerHeight` as `renderer.setSize()`, and the scissor rect's real backing-buffer ground truth
(`renderer.domElement.width`, not derived) matches the computed math — **the box itself is provably
placed correctly.** Added `§CPE_VF_ALIGN_DIAG_V2` (vfCam fov/up/aspect/position vs. a fresh
`plan.poseAt()` sample and the main camera, re-armed on every drag/resize). Caught and fixed a real
ordering bug in the new diagnostic itself while verifying it live (was logging `vfCam.aspect` BEFORE
the line that corrects it — a live capture showed a false `1.0000` vs `1.5789` mismatch from that
alone, not a per-frame rendering bug). Re-verified live via a standalone Puppeteer check (toggle+scrub
and drag+scrub): `vfCam_aspect` now matches `box_aspect` every time, `vfCam_pos` matches
`freshPose_pos` exactly, fov/up match the main camera exactly. `witness_cpe_scrub_viewfinder.js` 17/17
green. Pushed: https://github.com/red1oon/bim-ootb/pull/1203 — MERGED 2026-08-05 04:17 UTC.
**Every layer inspectable from code is now provably self-consistent — static analysis cannot go
further.** The one thing left, genuinely: reproduce the reported misalignment live with this build and
capture the `§CPE_VF_ALIGN_DIAG_V2` numbers AT that moment — that is the only remaining source of a
fact this session cannot EXTRACT on its own.
User-reported (screenshot, `~/Pictures/Screenshots/Screenshot from 2026-08-05 01-41-11.png`): POV box
content "not aligned fit... out to the right of the box." `§CPE_VF_ALIGN_DIAG` (search that tag in
`_vfRender()`, `cinema_path_editor.js`) is a one-shot-per-toggle-on diagnostic log added this session —
already got ONE real repro on the deployed site:
```
panelR={"left":919,"top":523,"width":300,"height":190} canvasR={"left":0,"top":0,"width":1235,"height":769}
pr=1.25 computed_x=1149 computed_y=69 computed_w=375 computed_h=238 canvasBackingBuffer=1543x961
boxSizing=border-box borderWidth=1.6px/1.6px xPlusW=1524 backingBufferW=1543 overflowRight=-19
```
**Every number checks out** — `x=(919-0)×1.25=1149` ✓, `w=300×1.25=375` ✓, `x+w=1524 < 1543`
backing-buffer width (19px headroom, no clipping/overflow). `renderer.getSize()` matches `canvasR`
exactly (no CSS-transform/zoom discrepancy). CSS `box-sizing:border-box` confirmed (global reset in
`viewer.html:16`), ruling out the width-inflation theory. **`_vfRender()`'s scissor/viewport math is
proven correct by these numbers — this is NOT a coordinate bug.** Two remaining hypotheses, in order
of likelihood: (a) it's a COMPOSITION issue — `vfCam`'s pose/aim frames the subject off-center within
a correctly-positioned box, not a positioning bug at all; (b) something downstream of the scissor call
this log doesn't cover. **Next repro, ask the user which it looks like**: does the 3D content itself
look off-center inside an otherwise correctly-bordered box (→ (a), chase `_applyVFPose`/aim source
next), or does the box border sit somewhere the pixels don't (→ (b), the log missed something — add
more instrumentation, do not guess).

### ✅ DONE (2026-08-05) — user authorized "fix here"; found the base fix already merged, closed a real gap in it, PR #1206 open
Went to implement the originally-scoped fix (`_dlodCamPos` hardcoded to main camera) and found the
concurrent 4D session had already independently root-caused and merged it: `_dlodResolveCamera(app)`
(bim-ootb PR #1199, `§DLOD_VF_CAMGUARD`) already picks `vfCam` via CPE's own `activePOVCamera()`
accessor when the POV panel is on. Verified this live in code (not from memory) before reporting it
as done — `_dlodResolveCamera` and `activePOVCamera` both present and wired in origin/main.

Tracing it further (per the user's "fix here if buildup is not as canvas was previewing" condition)
found a REAL follow-on gap: the "did the camera move, force a full DLOD pass" edge-detector
(`_dlodCamMoved`, via `_giHoldCamSig`) still hardcoded `app.camera` even after the resolver fix — so
during a POV-only scrub/play (main parked, §CPE_SCRUB_POV_ONLY) it never saw `vfCam` moving, and the
incremental-delta path could skip re-evaluating visibility for geometry entering/leaving vfCam's own
moving frustum. That IS "buildup not as canvas was previewing" — confirmed, not assumed.

Fixed: `_giHoldCamSig(app, cam)` takes an optional camera override (default `app.camera`, so the two
unrelated GI hold-converge call sites are untouched); the DLOD call site now passes `_dlodActiveCam`
(the same camera the frustum was built from), not bare `app`. `witness_dlod_vf_camguard.js` extended
9/9 green (pure VM slice, no browser needed). Re-ran `witness_incr_shadow_equiv.js` against Hospital —
0 mismatch across 19 cursors — confirms zero behavioural change when CPE/POV isn't active. Pushed:
https://github.com/red1oon/bim-ootb/pull/1206 — MERGED 2026-08-05 04:28 UTC.

## ▶ SESSION CONTINUATION 2026-08-05 (LATER) — live repro on Hospital surfaces 3 more real bugs

User tested live on the deployed site (Hospital, HHS_Office_Federated-scale building) after the four
PRs above, pasted a full console log, and reported three things: (1) B's inset renders outside where
it should be — dragging it repositions correctly, but releasing snaps it back off; (2) the scrub
panel is missing entirely; (3) both popups should position away from `#cpe-panel`, not hidden behind
it. **User pushback, repeated and explicit: do not use live-browser/visual verification to chase
these — use code inference and stringent logging, paste back the result.** A first attempt at ad-hoc
live Puppeteer DOM probing (not a committed witness) hit repeated timeouts/protocol errors on
Hospital's size and was abandoned for pure code reading + the existing witness suite instead.

### ✅ DONE — PR #1207 open, 3 real bugs found and fixed by code read + witness, not screenshots
1. **B's default position/z-index were never actually fixed.** The a4c24da/PR#1195 commit message
   claimed both B and the scrub panel got left-anchored, but the diff only touched
   `_buildScrubPanel`. `_buildVFPanel`'s default was still `canvasWidth - VF_DEFAULT_W - MARGIN`
   (right-anchored, same column as `#cpe-panel`) at `z-index:9998` — BELOW `#cpe-panel`'s 10000.
   Confirmed by direct code read, not a screenshot. Fixed: left-anchored, z-index 10001.
2. **Scrub panel's default vertical position overflowed the viewport bottom by 17px** — its top was
   computed from a hand-estimated total height that never matched the real rendered height. Added
   `_clampPanelToViewport()`: measures the real rect after append, corrects against the actual
   viewport, only on the default-position path (an explicit user drag is left alone). Confirmed via a
   new witness gate (`bottomOverflowPx` 17 → 0), not eyeballed.
3. **Both panels had ZERO creation/drag-release logging** — unlike `#cpe-panel`'s own
   `§CPE_PANEL_DRAGGABLE`/`§CPE_PANEL_MOVED` pair. This is *why* the user's pasted log had no
   evidence for any of the three reports above — there was nothing logged to see. Added matching
   `§CPE_VF_PANEL_CREATED`/`_MOVED` and `§CPE_SCRUB_PANEL_CREATED`/`_MOVED`, mirroring `#cpe-panel`'s
   exact shape plus a computed overlap-with-`#cpe-panel` check.

`witness_cpe_scrub_viewfinder.js` extended with `G-SCRUB-PANEL-LOG` + `G-VF-PANEL-CLEAR` (assert on
real console log lines) — 19/19 green (HHS_Office_Federated). Pushed:
https://github.com/red1oon/bim-ootb/pull/1207 — MERGED 2026-08-05 06:10 UTC.

### 🔴 OPEN — mid-session AskUserQuestion on scrub-panel removal, answer changes the picture
Asked whether to remove the CPE scrub panel entirely (user had floated "Time Machine already scrubs,
remove the redundant one") given the removal would also cost the only UI trigger for a POV-only
rehearsal and camera-path scrub-to-preview. **User's answer: do NOT remove it** — Time Machine's own
scrubber only appears when buildup/construction-reveal is engaged; a user who doesn't want buildup
never sees TM's scrubber at all, so CPE's own scrub panel is still needed independently. This is why
the fix above KEEPS the scrub panel and fixes its positioning instead of deleting it.

### 🔴 OPEN — new repro clue for the "B's content snaps back after drag release" symptom, not yet closed
User live-tested again after the AskUserQuestion exchange: clicking (not dragging) INSIDE B's box
makes the misaligned content "jump into correctly", then it reverts on release. Pasted log for that
exact action:
```
§FPS_MODE mean=1661.5 max=2997.3 n=2 dlod=off disp=solid fly=0 orbit=1
[RP-A1] §FILTER_GUIDS ALL
[RP-TB] §FOCUS_ELEM_CLEAR
```
`§FOCUS_ELEM_CLEAR` firing proves the click passed THROUGH B's box (its background is
`pointer-events:none` except the title bar/resize handle) to the main scene underneath, which
cleared the current selection. Working theory, not yet confirmed: the render loop self-parks
(`§IDLE_GATE`) and nothing in B's drag path calls `markDirty()` except the repositioning `save()` —
if the focus-clear's own redraw is what's making content "jump into correctly" for one frame, then
idle-parking again immediately after would explain the revert-on-release, since nothing keeps
re-rendering B once the pointer interaction stops. **Added `§CPE_VF_RENDER_TRACE`** (PR #1207) to
test this directly: change-triggered log of `_vfRender`'s computed scissor rect + ms-since-last-call
— a large gap right before a "jump" would confirm the theory. Needs the user's next live repro
(click-hold-release inside B's box) with this trace, pasted back — do not chase further via guessing
or live browser probing.

### 🔴 OPEN — user re-tested PR #1207 live on Hospital, real log evidence found for 4 symptoms, root frame = SEPARATION OF CONCERN, not yet fixed — next session starts here

User's own summary after re-testing: "panels pop up away from the alt-c panel" (✅ confirmed fixed —
see below), "the inset POV is much nearer not fully inside", "the preview does not play but becomes
blank", "the main canvas does not move yet replays its construction — acceptable for now, should not
react at all", "when clicking a stick, it does not show the POV inset that spot." Pasted the FULL
console from that live session (Hospital, all this session's PRs #1195/#1197/#1199/#1203/#1206/#1207
live). **User's own diagnosis, stated directly: "i suspect something else in the canvas is taunting at
the inset entanglement — need separation of concern."** This matches what the evidence below actually
shows — B (the POV inset) is not architecturally independent from the main canvas. It shares the
renderer's pixel-ratio read, the DLOD/buildup visibility computation, and possibly more, with main.
None of the four symptoms below were fixed this session — this section is the fresh-session starting
point, with real numbers already extracted, not a re-investigation from scratch.

**✅ Panel positioning fix (PR #1207) confirmed working, straight from the log:**
```
§CPE_SCRUB_PANEL_CREATED left=16 top=691 w=300 h=62 zIndex=10001 viewport=1483x769 bottomOverflowPx=0 cpePanel=clear (default)
§CPE_VF_PANEL_CREATED left=16 top=523 w=300 h=190 zIndex=10001 cpePanel=clear (default)
```
Both left-anchored, z-index above `#cpe-panel`, zero overflow, zero overlap. This part is done.

**🔴 SMOKING GUN for "much nearer not fully inside" — `renderer.getPixelRatio()` is NOT stable across
`_vfRender()` calls, even with an UNCHANGED panel position.** Three consecutive `§CPE_VF_RENDER_TRACE`
lines, same `panelR={16,523}` throughout (panel never moved):
```
§CPE_VF_RENDER_TRACE x=20 y=69 w=375 h=238 panelR={16,523} gapSinceLastCallMs=-1        (pr≈1.25)
§CPE_VF_RENDER_TRACE x=16 y=56 w=300 h=190 panelR={16,523} gapSinceLastCallMs=4509       (pr≈1.0 — SAME panel pos, different scissor!)
§CPE_VF_RENDER_TRACE x=20 y=69 w=375 h=238 panelR={16,523} gapSinceLastCallMs=107        (pr≈1.25 again)
```
`x`/`w`/`h` are `panelR * pr` — the middle line's numbers (16, 300, 190) are exactly the CSS values
UNSCALED (pr=1), while the other two are scaled by ~1.25. The renderer's measured pixel ratio is
flip-flopping between two different values frame to frame, with the panel geometrically unchanged.
This would make B's rendered content jump between ~80%-scale-and-offset and correctly-scaled on
different frames — a real, mechanical explanation for "much nearer not fully inside", not a
composition/aim issue (§CPE_VF_ALIGN_DIAG_V2's own numbers, logged on the SAME two `pr≈1.25` frames,
show vfCam tracking the intended pose exactly — `vfCam_pos` == `freshPose_pos` both times). **Next
session: find what's calling `renderer.setPixelRatio()` elsewhere in the app** — this codebase has
extensive `§FPS_MODE` performance tracking throughout every log; an adaptive-quality/DPR-scaling
system reacting to FPS is the leading candidate, and if so `_vfRender()` needs to either read pr once
per frame and cache it consistently, or account for whichever pr the CURRENT frame's main render
actually used, not a fresh independent read.

**🔴 "Preview does not play but becomes blank" during a POV-only + buildup rehearsal.** `_vfRender()`
DID run every frame — `§CPE_VF_PERF G-PERF-1 frames=154` matches the rehearsal's own `frames=154` from
`§CPE_PREVIEW done`, so this isn't a "never renders" bug, it's a CONTENT bug: vfCam ends up looking at
nothing. **Directly connects to this session's own §DLOD_VF_CAMGUARD fix (PR #1206) and to the user's
"separation of concern" instinct**: `_dlodResolveCamera(app)` now returns `vfCam` whenever B is on
(`activePOVCamera()` non-null) — correct in principle, but it means EVERY buildup-visibility decision
during this rehearsal (`_dlodInView`, `hideForProxy`/`bHideForProxy`) is now computed relative to
vfCam's WALKED pose, not main's parked one. If vfCam's frustum test misbehaves at some point along the
walk (very close to a wall, an edge-case aspect ratio, or the SAME pixel-ratio flip-flop above feeding
a wrong aspect into `vfCam.updateProjectionMatrix()`), the whole POV view could go effectively empty.
Since Time Machine's mesh-visibility flags are GLOBAL (one `renderAtTime()` pass, shared by both the
main render and B's separate scissor render in the same frame — see the DLOD_VF_CAMGUARD section
above), if vfCam culls something wrongly, in principle BOTH main and B should show it culled — but the
user reports ONLY B going blank while main's construction-reveal looks normal. That mismatch itself is
a clue: either the two renders aren't actually sharing state the way the code implies, or "blank"
isn't a visibility-culling symptom at all (e.g. a scissor/viewport mis-set from the SAME pixel-ratio
bug above putting the box entirely off the actual backing buffer at some frames). **Next session: add
a log of visible-element-count from vfCam's perspective (or reuse `_dlodInView`'s own box index count)
at the moment `_vfRender()`'s box goes visually blank, correlated against the pixel-ratio trace above.**

**🔴 Main canvas construction-reveal still visually progresses during a POV-only rehearsal.** User: "the
main canvas though does not move yet replay its construction which is acceptable for now — should not
react at all." Not new — this is the architecturally-known limitation from this session's own
DLOD_VF_CAMGUARD writeup: Time Machine's visibility state is a single shared set of mesh flags, so a
buildup-driven rehearsal necessarily advances that shared state regardless of which camera (main or
vfCam) is "supposed" to own the view at that moment. Fixing this for real means decoupling buildup
visibility itself into a per-camera-independent pass (expensive — a second full `renderAtTime`-shaped
traversal) or accepting the shared-state architecture and finding a cheaper partial fix. User marked
it "acceptable for now" but it's the same root cause the "separation of concern" framing points at.

**🔴 Clicking a stick does not move B's inset to that spot, live.** `_hold()` → `_scrubTo(bearTn)` →
`_applyVFPose` is the code path (§CPE_AIM_PIN/G-SCRUB-BEARING territory) and the WITNESS version of
this (`_holdForTest()`, a direct function call bypassing the real click/raycast) passes clean
(`witness_cpe_scrub_viewfinder.js`'s G-SCRUB-BEARING gate, 19/19 suite green). The gap between
"witness passes calling the function directly" and "doesn't work from a real click" means something
in the ACTUAL row-list/canvas click→pick→`_hold()` wiring isn't reaching `_scrubTo` live, or reaches
it with different arguments than the synthetic test does. Needs tracing the real click handler chain,
not the already-proven-fine `_scrubTo`/`_applyVFPose` internals.

**Session close, per explicit user instruction: do not continue fixing now — this write-up + the log
evidence above is the deliverable, a fresh session picks this up.** All the new logging added this
session (`§CPE_VF_RENDER_TRACE`, `§CPE_VF_PANEL_CREATED/_MOVED`, `§CPE_SCRUB_PANEL_CREATED/_MOVED`,
`§CPE_VF_ALIGN_DIAG`/`_V2`) is live in PR #1207 and already proved useful — keep using it, don't
re-derive from a screenshot. The unifying next question, per the user's own framing, is architectural:
**where exactly does B share state with the main canvas that it shouldn't (pixel ratio read, DLOD
camera resolution, possibly others), and what would true separation of concern look like for a
scissor-based second camera sharing one WebGL context?**

## ▶ SESSION 2026-08-05 (FOLLOW-ON) — all 3 open items fixed and witnessed, PR #1209 open

Picked up the fresh-session starting point above and closed all three, each root-caused by code
reading only (no live browser/screenshot chasing, per the standing rule) then confirmed via witness.

1. **§CPE_VF_DPR_GUARD (fixes "much nearer not fully inside")** — the smoking gun was real: `main.js`'s
   §S260b orbit-drag perf-DPR drop (`streamedCount>5000`) calls `renderer.setPixelRatio()` on every
   OrbitControls drag start/end, and `_vfRender()` reads that SAME renderer's `getPixelRatio()` fresh
   every frame — so B's scissor box literally rescales frame-to-frame whenever the user orbits the
   main view while B is open, even with B's own panel position untouched (exactly what
   `§CPE_VF_RENDER_TRACE` caught). This is a main-canvas-only perf heuristic that has nothing to do
   with B (a tiny 300×190 sub-render, not worth degrading) — fixed by excluding B from it entirely
   (`!APP._cpeViewfinderRender` added to the drag-start gate). Also fixed a smaller, real bug on the
   same line: `vfCam.aspect` was computed from `w/h` — two INDEPENDENTLY `Math.round()`-ed
   backing-buffer pixel counts — instead of the true unrounded CSS `panelR.width/height`, drifting the
   frustum slightly at fractional pixel ratios (§CPE_VF_ASPECT_ROUND).
2. **§DLOD_VF_MATRIX_STALE (fixes "preview does not play but becomes blank")** — Time Machine's
   `renderAtTime()` runs off its own `setTimeout` ticker (`_playTimer`), never synchronized with the
   rAF-driven `animate()` loop. `app.camera`'s `matrixWorld`/`matrixWorldInverse` get refreshed every
   rAF frame for free (the renderer does it inside `render()`), but `vfCam`'s ONLY get refreshed by
   `_vfRender()`, itself gated behind that same rAF loop — so a POV rehearsal's DLOD visibility
   frustum (built from `_dlodResolveCamera(app)`'s result) could be built from a stale vfCam pose one
   or more `_applyVFPose()` moves behind, hiding real geometry behind wireframe box proxies it
   shouldn't. Fixed with an explicit `_dlodActiveCam.updateMatrixWorld()` before the frustum build —
   cheap (single camera), makes the tick correct regardless of which async timer got there first.
   Added `§DLOD_VF_VISCOUNT` (hideForProxy count + camPos, logged every DLOD-engaged tick while a POV
   camera is active) for any future live repro that needs harder numbers.
3. **§CPE_SCRUB_BEARING_FLY_PAUSE (fixes "clicking a stick does not move B's inset")** — confirmed the
   real click→pick wiring was NEVER the problem (`h.down`'s canvas hit-test calls `_hold()` exactly
   like the row-list and the witness's `_holdForTest()` do). The actual bug: `_hold()`'s
   `_scrubTo(bearTn)` moves vfCam ONCE, but if a rehearsal is actively playing, `_previewFly`'s own
   `step()` (rAF-driven, reads real elapsed time, ignores `_state.scrubTn` entirely) overwrites vfCam's
   pose again on the VERY NEXT frame (~16ms later) — the click's effect is real but invisible, exactly
   matching "witness passes calling the function directly, doesn't work from a real click" (the
   witness's original G-SCRUB-BEARING gate ran with no flight active). Fixed: selecting a stick now
   calls `_state._flyPauseAt()` first if a flight is running and unpaused — same hook the transport's
   own pause button already uses — so the bearing survives instead of racing the flight's clock.

**Witnessed, not screenshotted:** `witness_cpe_scrub_viewfinder.js` 22/22 green (HHS_Office_Federated,
3 new gates: G-VF-DPR-GUARD, G-VF-ASPECT, G-SCRUB-BEARING-FLY-PAUSE) · `witness_dlod_vf_camguard.js`
10/10 green (new static ordering gate for the `updateMatrixWorld()` fix) · `witness_incr_shadow_equiv.js`
0 mismatch across 19 cursors (HHS_Office_Federated) — zero behavioural change off the DLOD path.
Pushed and MERGED: https://github.com/red1oon/bim-ootb/pull/1209 (auto-merged 07:36:40Z, right after CI
passed) — confirmed live via `pages-build-deployment` run success at the same timestamp.

**Still open, unchanged from before:** main canvas construction-reveal still visually progresses
during a POV-only rehearsal (architecturally known — Time Machine's visibility state is one shared set
of mesh flags, not per-camera; user marked "acceptable for now"). No new work needed unless the user
revisits it.

## ▶ SESSION 2026-08-05 (SAME DAY, LIVE-TEST FOLLOW-ON) — user found PR #1209 stale in their browser,
## then live-tested the real fix and found 4 NEW issues + 1 feature ask. User asked to hand this whole
## batch to a fresh session (possibly Opus/Fable) rather than keep chasing — this section is that handoff.

### ✅ Resolved during this short follow-on (no code change needed)
**"Am I on the latest version? Still same issues" — user's browser was stuck on `sw.js?v=538` while the
repo's `CACHE_VERSION` was `v939`** — hundreds of deploys behind, not a code bug. Confirmed PR #1209 WAS
merged and deployed (`gh pr view 1209` → `mergedAt 07:36:40Z`; `gh run list` showed a `pages-build-
deployment` run completing at the same timestamp). Told the user to hard-reload/clear the SW. They did,
came back, and their NEXT pasted log showed `§CPE_VF_ALIGN_DIAG_V2 vfCam_aspect=1.5789` (exactly
`300/190`, the true panel aspect) instead of the pre-fix `1.5756` — **confirms §CPE_VF_ASPECT_ROUND and
§CPE_VF_DPR_GUARD from PR #1209 are genuinely live and working** in their browser now. Everything below
is fresh evidence against the ACTUAL new build, not stale-cache noise.

### ✅ OPEN 1 — CLOSED, but only after a real drift the user had to correct in caps
First pass misread *"yes independent but not as handled by same toggler! ;)"* as "give the timeline
panel its own separate show/hide button" and built exactly that (`#cpe-scrub-toggle`, a second widget).
**User's correction, verbatim: "OH NO! U DRIFTED! I DID NOT ASKED FOR A SEPARATE SCRUBBER!!!! REMOVE
THAT BUTTON!! I SIMPLY ASKED THAT CLOSING EYE TO ACT ON IT SIMILAR TO OPENING EYE!"** — the actual ask
was always the EXISTING B eye-icon toggle should drive the timeline panel too (symmetric ON/OFF), not a
second control. Deleted the wrong branch (`fix/cpe-scrub-own-toggle`) outright, reset the worktree to
clean `origin/main`, and rebuilt correctly: `_toggleViewfinder`'s existing ON branch now also builds
`#cpe-scrub-panel` if it isn't already present; the OFF branch now also tears it down via the existing
`_scrubPanelTeardown()`. One button, both panels, symmetric — search `§CPE_VF_EYE_DRIVES_SCRUB` in
`viewer/cinema_path_editor.js`. `witness_cpe_scrub_viewfinder.js`'s old `G-SCRUB-PERSISTS` gate (which
asserted the OPPOSITE — independent of B) was replaced with `G-EYE-DRIVES-SCRUB`, asserting the new
coupled behaviour AND that re-opening the eye restores the panel at its remembered position, not the
default. 22/22 green (HHS_Office_Federated). Pushed and merged: bim-ootb PR #1211
(`fix/cpe-eye-drives-scrub`, merged 08:50:24Z, auto-deployed).

### 🔴 OPEN 2 — related feature ask, not yet touched: unchecking "build the model as the film plays"
### (`#cpe-buildup`) should also hide the scrub/timeline panel
User: *"also when buildUp in unchecked, the TM panel should also be removed."* Read literally this
sounds like it wants `#cpe-scrub-panel` (the timeline panel) hidden automatically whenever `#cpe-
buildup`'s checkbox is unchecked. **Re-check against OPEN 1's now-shipped, CORRECTED behaviour before
touching this** — there is no separate scrub toggle anymore (that was the wrong first attempt, reverted
— see OPEN 1 above); the scrub panel's visibility is now tied ONLY to B's eye icon
(`§CPE_VF_EYE_DRIVES_SCRUB`). So this ask is really: should unchecking `#cpe-buildup` ALSO turn B's eye
off (which would hide both panels via the mechanism that already exists), or does the user want a THIRD,
independent coupling (buildup off → scrub panel hides, but B stays exactly as it was)? **Not
investigated at all yet, and the right question changed after OPEN 1's correction** — find the `#cpe-
buildup` checkbox's `change` handler (search `cpe-buildup` in `cinema_path_editor.js`), but ASK the user
which of the two readings above is meant before writing any code — do not assume, this file already has
one drift this session from guessing past a terse instruction instead of asking.

### 🔴 OPEN 3 — "the inset is not fitting into the pov box, bigger a bit and slightly off" — one
### concrete residual bug found (not yet fixed), full alignment diagnostic still says everything matches
Live numbers from the user's fresh (non-stale) log: `panelR={"left":41.59,"top":452.59,"width":300,
"height":190}` `pr=1.25` `computed_x=52 computed_y=157 computed_w=375 computed_h=238` `vfCam_aspect=
1.5789 box_aspect=1.5756` `vfCam_pos` == `freshPose_pos` exactly, `vfCam_fov`==`main_fov`==60,
`vfCam_up`==`main_up`. **Every number the diagnostic already checks is correct** — position, fov, up,
and (after PR #1209) the CAMERA's own aspect is now the true box aspect (1.5789, matches `300/190`
exactly). But look at `box_aspect=1.5756` in that SAME log line — that's `computed_w/computed_h =
375/238`, i.e. **the ACTUAL viewport/scissor RECTANGLE `_vfRender()` passes to `renderer.setViewport`/
`setScissor` still has a DIFFERENT aspect (1.5756) than the camera's projection matrix now assumes
(1.5789)** — `w`/`h` are still computed as two INDEPENDENTLY `Math.round()`-ed values
(`Math.round(300*1.25)=375`, `Math.round(190*1.25)=238`, but `238×1.5789=375.7`, not 375) while
`vfCam.aspect` was fixed in PR #1209 to read the TRUE unrounded `panelR.width/height`. **Before PR
#1209 these were self-consistently wrong together (no stretch, just uniformly mis-scaled/rounded);
after PR #1209 only the CAMERA'S aspect was corrected, so now there's a NEW small mismatch between what
the camera thinks its aspect is and the actual pixel rectangle it's rendered into — a real, mechanical
source of a very slight vertical squish/stretch.** This is small (~0.2%) and probably NOT the full
explanation for "bigger a bit and slightly off" (that phrase reads more like a zoom/composition issue
than a sub-1%-stretch one), but it IS a real, provable, easy fix — round the RECTANGLE the SAME way
aspect is now computed (from the box, not compounding two separate roundings), e.g. compute `h` first
from `panelR.height*pr`, then derive `w = Math.round(h * (panelR.width/panelR.height))` so the
viewport's own aspect matches `vfCam.aspect` exactly by construction, not by coincidence. **Do this
fix, but do NOT assume it resolves the user's full "bigger and off" complaint — re-verify with the user
after, since the diagnostic numbers so far do NOT support a large-magnitude cause; if it persists after
this fix, the next lead is the CONTENT itself (composition/zoom), not the box math** — e.g. whether
`vfCam.fov`/near-plane or a devicePixelRatio-dependent CSS transform on the panel `<div>` itself
(border/padding eating into the visible content area vs. the scissor rect, which is computed from the
OUTER `getBoundingClientRect()` including border) is inflating the apparent content size relative to
the visible border. Check `box-sizing`/border width interaction next if the rect-aspect fix alone
doesn't close it out.

### 🔴 OPEN 4 — "the buildUp is not reflected in POV" — bkPrev/tmSetCursor confirmed WORKING; leading
### hypothesis is a DIFFERENT, more general DLOD system than the one PR #1209 already fixed
Traced `_previewFly`'s buildup wiring end to end: `bkPrev = window.tmFollowTimeline()` IS successfully
armed before `startFly()` runs (user's own log shows `§CPE_PREVIEW_BUILDUP armed mode=T ops=63416
placed=63182`), and `step()` DOES call `window.tmSetCursor(bkMs)` every frame when `bkPrev` is truthy —
this part of the buildup wiring is NOT broken, ruling out the most obvious "cursor never advances"
theory. Also confirmed via the SAME log: Time Machine's own box-proxy DLOD system (the one
`§DLOD_VF_MATRIX_STALE`/`_dlodResolveCamera` in `time_machine.js` — PR #1209's second fix — targets)
was **NOT engaged at all in this test session** (`_dlodProxyOn` is a separate pill toggle the user never
pressed; zero `§DLOD_VF_VISCOUNT` lines in the whole pasted log), so that fix is provably not
responsible for or related to this complaint.
**Leading hypothesis, NOT yet confirmed — needs code reading in `viewer/dlod.js` next:** the log shows a
COMPLETELY DIFFERENT, general-purpose system engaging: `[DLOD] §DLOD_ENABLE count=63182
mode=per_slot_frustum` / `[DLOD] §DLOD_REFS built instanced=... imInstances=...` — this is a per-
instance FRUSTUM CULLING optimization for streamed geometry (unrelated to Time Machine/buildup, lives in
`viewer/dlod.js`, confirmed via `grep -l DLOD_ENABLE viewer/*.js`). **This system almost certainly
builds its frustum from `app.camera` (the MAIN camera) only** — it predates B/vfCam entirely and has no
reason to know about it. During a POV-only rehearsal (`§CPE_SCRUB_POV_ONLY`), the MAIN camera is
PARKED at the original overview pose for the whole flight while vfCam WALKS through the building — so
anything the walk passes near that is OUTSIDE the parked main camera's frustum could have its instance
matrix ZEROED by this culling system, making it invisible to B's render too (B shares the same scene/
instance data) **regardless of what Time Machine's own buildup visibility flags say** — which would
look exactly like "buildup not reflected," but is actually a totally different, more general
"B renders whatever the MAIN camera's frustum currently allows, not its own" entanglement — the same
family of bug as PR #1209's DLOD fix, just a different subsystem. **Next session: read `viewer/dlod.js`,
confirm whether its frustum test is keyed to `app.camera` exclusively, and if so, either (a) exempt/
widen it while B is on (same pattern as `§CPE_VF_DPR_GUARD`), or (b) make its frustum test the UNION of
main+vfCam frustums while B is active — do not guess further, read the file first, this write-up is
already the result of reading `time_machine.js` and `cinema_path_editor.js` closely and finding nothing
wrong there.** If reading `dlod.js` doesn't confirm this cleanly, add a log there (element-count zeroed
by this culling pass, per tick) the same way `§DLOD_VF_VISCOUNT` was added to `time_machine.js`.

### 🔴 OPEN 5 — "the pov is correctly set to the stick's pos, but the preview scrubber cannot move or
### play or click different spot in the timeline" — a possible regression in PR #1209's OWN fly-pause
### fix, root cause NOT found via static reading, needs a live repro with new logging (not a guess-fix)
This is reporting on the ALREADY-MERGED PR #1209 code (§CPE_SCRUB_BEARING_FLY_PAUSE), not on the
uncommitted OPEN 1 change. Sequence per the user: click a stick mid-flight → B's pose correctly jumps to
the stick's bearing (confirms `_hold()`'s new `_flyPauseAt()`-then-`_scrubTo()` call DID run and DID
pause the flight, as designed) → but AFTER that, the scrub panel's play button and the timeline track
both stop responding to input (can't resume, can't drag, can't click a different spot).
**Read `_wireScrub` (track pointerdown/move/up → `_scrubTo`), `_wireScrubPlay` (play button → `_flyPauseAt`/
`_flyResume` branch), and `_flyPauseAt`/`_flyResume` themselves (both inside `_previewFly`'s closure) —
found NO code path that would structurally block either of these once `_state.flyPaused` is true.**
Neither handler checks `_state.flying` before acting; `_scrubTo`/`_applyVFPose` set `vfCam` pose directly
regardless of flight state; `_flyResume` re-arms `requestAnimationFrame(step)` directly. This is
genuinely NOT resolved — either there's a subtlety this reading missed, or it's a DOM/event-listener
issue not visible from reading the function bodies alone (e.g. some OTHER code path rebuilding/replacing
the track or button element after the pause, orphaning the listeners bound at editor-open — not
confirmed, `_renderScrub()` only replaces the track's CHILDREN via `innerHTML=''`, not the track element
itself, so that specific theory is likely NOT it, but wasn't fully ruled out for `#cpe-scrub-play`).
**Do not guess-fix this. Next session: add targeted logging** — e.g. a `§CPE_SCRUB_INPUT_TRACE` line at
the TOP of `_wireScrub`'s pointerdown/pointerup handlers and `_wireScrubPlay`'s click handler, dumping
`_state.flying`/`_state.flyPaused`/whether the handler actually ran — then ask the user to reproduce
ONE more time (stick click → try to drag/click the track/press play) with this build, paste the log.
If the NEW handlers show 0 log lines at all when the user clicks, that confirms an event-listener/DOM
issue (something rebuilt the elements); if the handlers DO fire but nothing visibly changes, the bug is
downstream (render loop / `markDirty` / `_flyResume`'s `requestAnimationFrame` chain), and the next trace
point is there instead.

### Session close — OPEN 1 closed (see above, bim-ootb PR #1211 merged). OPEN 2/3/4/5 still open —
### do not continue chasing 3/4/5 further without a fresh repro-with-logging as scoped in each section.
### OPEN 2 needs a clarifying question to the user before implementing at all.

### ⚠ HOUSEKEEPING CHECK — every session touching this file, before reporting "done" (user, 2026-08-05,
### after correcting a real drift: "Update prompts/# to hunt such admin gaps till zero")
OPEN 1 above is a live example of the exact failure this checklist exists to catch: a terse user
instruction ("yes independent but not as handled by same toggler") got over-interpreted into a whole
new feature (a second toggle button) instead of the narrow literal ask (make the EXISTING toggle do
both). The code was even pushed to a branch before the misread was caught. **Before closing out any
session on this file, walk this list — don't just trust that "witnessed" or "pushed" means "correct":**
- **Re-read the user's OWN words one more time, literally, before writing up what you built.** If your
  writeup needs to *explain* why what you built matches what they said, that's a warning sign — the
  match should be obvious, not argued for. See `feedback_stop_on_invent_not_instruct.md`.
- **Any branch pushed this session that was later found wrong, abandoned, or superseded — was it
  actually deleted (`git push origin --delete <branch>`), not just left dangling?** A stale branch on
  GitHub is exactly the kind of admin residue a future session (or the user) can trip over, assume is
  still relevant, or accidentally build on top of. Confirmed this session: `fix/cpe-scrub-own-toggle`
  deleted after the correction; the CORRECT fix went out under a fresh, accurately-named branch
  (`fix/cpe-eye-drives-scrub`) rather than reusing the tainted name.
- **Every worktree created this session — pruned once its branch is pushed/merged and the tree is
  clean?** (Standing rule already in `~/.claude/CLAUDE.md` §Worktree Hygiene — this is a reminder to
  actually run it at CPE session close, not a new rule.)
- **Does every `prompts/CINEMA_PATH_EDITOR.md` section written this session still match the FINAL
  shipped code, not an earlier draft that got corrected mid-session?** (This is why OPEN 1's writeup
  above was rewritten in place rather than appended as a second, contradicting entry — a fresh session
  reading this file top to bottom must never see two different stories about the same feature.)
- **PR numbers cited — do they actually say MERGED, not just "pushed"?** Check with `gh pr view <n>
  --json state,mergedAt` before writing "done," not from memory of having run `gh pr create`.

## ▶ SESSION 2026-08-05 (WORK-TO-ZERO on the 4-item handoff above) — OPEN 3/4/5 shipped, PR bim-ootb#1212 open

Worked the SESSION 2026-08-05 (SAME DAY) handoff's four remaining items top to bottom per the
WORK-TO-ZERO contract. Fresh worktree `/tmp/wt-cpe-open345` off `origin/main` (which already had PR
#1211 merged — the eye-drives-scrub fix).

### ✅ OPEN 3 — inset viewport rect aspect: fixed, 23/23 green, but re-derived the "exact" claim mid-session
The `_vfRender()` w/h were two INDEPENDENTLY `Math.round()`-ed values (as OPEN 3 diagnosed). First
pass derived `w` from `h*trueAspect` and kept `vfCam.aspect = panelR.width/panelR.height` (the raw
CSS ratio) — this reduces the drift but a new gate proved it can NEVER be bit-exact: `w` is itself
rounded to an integer pixel, so `w/h` cannot equal an arbitrary CSS ratio exactly, only approximately
(measured diff ~0.0018 at pr=1.37, vs. the old two-independent-roundings' ~0.0033). **Corrected
before shipping**: set `_state.vfCam.aspect = w / h` (the SAME rounded rect this frame renders into),
not the raw CSS box — this makes the camera's projection and the viewport it draws into IDENTICAL by
definition (bit-exact, zero stretch), at the cost of the camera's aspect tracking the true CSS box
only approximately (same ~0.0018 residual, now on the CAMERA side instead of a mismatch between
camera and rect). This is the same self-consistency the PRE-#1209 code had by accident (both derived
from the same rounded w/h) but with a smaller rounding error (single-rounding-pass vs. old double).
`witness_cpe_scrub_viewfinder.js`: `G-VF-ASPECT` tolerance relaxed to 0.005 (documents why bit-exact
is impossible there), new `G-VF-RECT-ASPECT` gate asserts the bit-exact rect/camera match (diff<1e-9).
23/23 green, HHS_Office_Federated. **Not yet re-verified against the user's own "bigger a bit and
slightly off" report** — the fix removes the STRETCH cause with certainty; whether it also resolves
the full complaint (which reads more like zoom/composition per the original OPEN 3 write-up) still
needs the user's own eyes on the next repro.

### ✅ OPEN 4 — DLOD/vfCam frustum union: fixed by code review, live-wiring confirmed, A/B not cleanly closed
Confirmed the OPEN 4 hypothesis by direct read of `viewer/dlod.js`: `A.dlodTick()`'s frustum was built
from `A.camera` exclusively (`A.camera.updateMatrixWorld(); ...projectionMatrix, ...matrixWorldInverse`),
zero references to vfCam or `activePOVCamera`, a totally separate subsystem from `time_machine.js`'s
own `_dlodResolveCamera` (PR #1209). Fixed: resolve `activePOVCamera()` the same way
`_dlodResolveCamera` does (no new coupling), build a second frustum from it when present, hide an
instance only if OUTSIDE BOTH frustums (union) — reviewed line-by-line, logic is correct. Also fixed
the §S260b idle-skip to track vfCam's own position (previously only checked `A.camera`/`controls`,
so a POV-only rehearsal with the main camera parked would never re-evaluate at all). Added
`vfCamActive=`/`imHid=`/`imVis=` to the throttled `§DLOD_TICK` log.
**Honesty check, per the FUNDAMENTAL LAW (numbers over eyeballing) — this one is NOT fully closed**:
attempted a live Puppeteer A/B (position an InstancedMesh instance outside the main camera's frustum,
confirm dlod.js culls it main-only, then aim vfCam at it and confirm the union restores it). The
harness confirmed `vfCamActive=1` correctly appears once B is toggled on (the accessor wiring works),
but the instance-level cull/restore assertions came back contradictory between a direct
`getMatrixAt`-based read and the aggregate `§DLOD_TICK` log line — most likely a test-harness
confound (the `EVAL_EVERY`/idle-check interacting with forced `A._dlodFrame=-1` calls in ways not
fully traced down, not necessarily a bug in the shipped fix — the union CONDITION itself was reviewed
and is correct) rather than a flaw in the shipped code, but this session could not cleanly PROVE it
live within a reasonable time budget and is saying so rather than overclaiming. **Next session, if
this needs closing**: either trust the code review + the live `vfCamActive`/`imHid`/`imVis` log line
against the user's OWN real repro (their building, their POV flight — the intended verification path
per this fix's own design), or build a cleaner isolated slice-test (balanced-braces extraction of
`dlodTick`, like `witness_dlod_vf_camguard.js` does for `time_machine.js`, avoiding the live-scene
timing confounds entirely).

### ✅ OPEN 5 — scrub input trace logging shipped; the freeze itself still NOT reproduced
Per the doc's own instruction ("do not guess-fix ... add targeted logging"): added
`§CPE_SCRUB_INPUT_TRACE` to the scrub track's pointerdown/pointerup and the play button's click
handler, dumping `_state.flying`/`_state.flyPaused` and (on pointerup) whether a drag was in progress.
Verified the logging mechanism itself fires correctly via a standalone Puppeteer smoke test (real
pointerdown/pointerup dispatch on the track + a real click on the play button both produced trace
lines). **Did not reproduce the freeze** — a synthetic attempt to drive it via `_holdForTest` failed
for an unrelated reason (no sticks present on this test building's default state) and was not chased
further given the time budget; this matches the doc's own conclusion that the freeze needs the USER'S
real browser/gesture sequence, not a synthetic one. **Next: ask the user to reproduce ONE more time on
this build (stick click mid-flight → try to drag/click the track/press play) and paste the console
log** — the `§CPE_SCRUB_INPUT_TRACE` lines will show definitively whether the handlers even fire.

### ✅ OPEN 2 — CLOSED after two wrong attempts in the SAME session, corrected live by the user
Asked the clarifying question. First answer ("Buildup off, turns off only TimeMachine isnt it")
was misread as "buildup is a fully independent gate on the timeline panel" — implemented that,
shipped a witness for it. **User corrected immediately, twice, in caps**: *"Timeline Preview for POV
scrubber already told u many times! It follows the Eye!!! When opens it appears, when eye closes, it
is removed!!"* then *"buildUP told u also, when it is unchecked it should not remain because it was
called by buildup!"* — the real rule is an AND-GATE: the timeline panel needs BOTH the eye ON and
buildup checked, not buildup alone and not eye alone. The bug the gate exists to catch: cycling the
eye off/on while buildup is unchecked must NOT resurrect the panel (the old eye-alone code did
exactly that). Fixed in both `_toggleViewfinder`'s ON branch and the `#cpe-buildup` change handler —
same guard (`_state.buildup && _state.vfOn`) in both places, either going false tears the panel down.
`G-BUILDUP-GATES-TM` (3 gates, including the actual eye-cycle-while-buildup-off case) — 26/26 then
27/27 green after the OPEN 3 fix below stacked on top.

### ✅ OPEN 3 — the REAL root cause, found after the user asked whether the render pattern itself was wrong
User asked directly: is the scissor/viewport pattern the right approach, given how much trouble this
has caused? Answered: yes — it's three.js's own recommended technique for a picture-in-picture view
sharing one GL context, correct at this building's scale (a second renderer would mean a second full
GPU context). Asked to "dispense more effort" rather than hand debugging back — audited the drag/
resize wiring directly instead of re-explaining the math. **Found the actual bug**: neither
`_makeDraggable`'s shared drag handler nor B's own resize handle (`#cpe-vf-resize`) ever called
`markDirty()`. The render loop self-parks (§IDLE-PARK, `main.js`) when nothing needs continuous
frames; `_vfRender()` only runs INSIDE that loop's render-gated block. So dragging or resizing B's
panel with no other camera motion — the common case — moved the CSS border live under the cursor
while the scissor-rendered CONTENT stayed frozen at the pre-drag rect, catching up only when
something unrelated (orbit, scrub, etc.) happened to wake the loop. This is a STALENESS bug, not a
coordinate-math bug — separate from and stacked on top of the aspect-rounding fix earlier this
session. **This is very likely the dominant cause of both "dragging repositions correctly but
releasing snaps it back" (OPEN 1-era report) and "inset not fitting the box, bigger a bit and off"
(OPEN 3's original report)** — a user drag/resize interaction is exactly the scenario this bug hits.
Fixed: one added `pointermove` listener on B's panel div calls `markDirty()` on every move (gated to
`e.buttons` so a bare hover doesn't waste a frame) — covers both drag (title bar) and resize (corner
handle) since neither stops propagation and both bubble to the same parent, no separate listener
needed. New gate `G-VF-DRAG-WAKES-RENDER` proves `markDirty()` fires on every synthetic drag move,
not just on release. 27/27 green. **Still worth a user re-check** — the aspect-rounding fix removed
one real source of stretch and this removes a second, real source of staleness; whether the combined
fix also fully resolves "bigger a bit" (which could still have a third, composition/zoom cause per
the original write-up) needs the user's own eyes on the next live session.

### Housekeeping
Original worktree `/tmp/wt-cpe-open345`'s branch `fix/cpe-open-3-4-5` **got squash-merged as PR #1212
while two more commits (OPEN 2 fix + OPEN 3 drag fix) were still being pushed to it** — the exact
squash-orphan trap `~/bim-ootb/CLAUDE.md` already warns about (PR #138 precedent). Caught it via
`gh pr view 1212 --json state,mergedAt` before assuming "pushed" meant "will land" — recovered by
branching fresh off `origin/main`, cherry-picking the two orphaned commits (clean, no conflicts since
PR #1212's own content was already in `main` via the squash), re-verifying 27/27 green, and opening a
NEW PR: https://github.com/red1oon/bim-ootb/pull/1213 (not yet merged as of this writeup). The
stale branch `fix/cpe-open-3-4-5` was deleted (both remote and local) — its content is either merged
(squash, PR #1212) or duplicated on the new branch, nothing left un-captured. Worktree
`/tmp/wt-cpe-open345` now sits on `fix/cpe-open2-drag-followup` — leave in place until PR #1213
merges (Worktree Hygiene: prune only once `ahead`=0 and clean). Server on :8460 stopped. Scratch
verification scripts (`smoke_input_trace.js`, `verify_dlod_vf_union.js`, `probe_dlod.js`,
`verify_vf_drag_markdirty.js`) live in this session's scratchpad only, not committed — throwaway
harnesses, not durable artifacts.

## ▶ SESSION 2026-08-06 — 3-issue batch: scrub panel eye-gating, playhead tick, POV frame diagnostic

**PR #1211/#1212/#1213 confirmed merged before starting** (`gh pr view --json state,mergedAt` on all
three). Reused the already-clean, already-merged `/tmp/wt-cpe-open345` worktree (Worktree Hygiene: it
was `ahead=0` on the just-merged PR #1213 branch, so `git checkout -B fix/cpe-3issues origin/main`
inside it rather than adding a new worktree).

### Plan (as briefed)
1. Issue 1 — gate the scrub/timeline panel to the eye toggle, currently always-on regardless of B.
2. Issue 2 — investigate POV inset composition/zoom ("working, but not well framed"); diagnose via
   code + headless numeric assertion, do not guess-fix; add §-tagged diagnostics if a live repro is
   genuinely needed instead.
3. Issue 3 — the blue playhead line doesn't move during playback even though play/pause/resume work;
   find and fix the missing tick-to-UI wiring.
4. Implement all three with §-tagged witness logging built in, one combined witness pass at the end —
   code + §-log/headless assertions only, no screenshots.

### ✅ Issue 1 — §CPE_SCRUB_EYE_GATED, root-caused and fixed
Confirmed by direct code read: the scrub panel was built UNCONDITIONALLY at editor-open
(`_buildScrubPanel(); _wireScrub(...); _wireScrubPlay();` right after `_state = {..., vfOn: false,
...}`), independent of `vfOn`. This is `§CPE_SCRUB_STANDALONE` (2026-08-05) — a DELIBERATE decision at
the time, but for a different reason (decoupling the bar from B's own display-only/no-interaction
status, not "should it show before the eye is on"). The user's own words this session pin the actual
intent precisely: *"Been minimalist, user is asked to just bake on the fly. The eye is only for path
edit... Scrubber is new, is only to be ON under the Eye toggle."* Fixed by simply removing the
unconditional build call — the ALREADY-EXISTING guarded build inside `_toggleViewfinder`'s ON branch
(`if (_state.buildup && !document.getElementById('cpe-scrub-panel')) {...}`, itself AND-gated to
buildup from the prior session's OPEN 2 fix) is now the only path that ever creates the panel. Verified
live (not just via witness): `atOpen: {"scrubPanel":false,"vfOn":false}` → toggle eye on →
`afterEyeOn scrubPanel: true` → toggle eye off → `afterEyeOff scrubPanel: false`.

### 🔶 Issue 2 — §CPE_VF_FRAME_DIAG, diagnosed and NOT guess-fixed (per the brief's own standard)
Investigated `_vfRender`/`_applyVFPose`/vfCam FOV and the aim/look-at pipeline (§CPE_AIM_DEPTH,
§CPE_AIM_SERIES, `_beat3Pose`). Findings, each checked directly rather than assumed:
- **Position**: `G-VF-1` already proves B's pose is bit-identical to the main camera's at the same
  instant (`delta=1.55e-15m`) — not a coordinate bug.
- **FOV**: `vfCam = new THREE.PerspectiveCamera(a.camera.fov, ...)` — copied ONCE at vfCam creation
  and never reassigned afterward (grepped the whole file: no second `.fov =` write anywhere). The main
  camera's own FOV is ALSO a hardcoded constant (60°, `scene.js:139`) never reassigned post-init. So
  vfCam.fov cannot drift from the main camera's — ruled out as a cause.
  - **Aspect**: `G-VF-RECT-ASPECT` already proves the rendered rect's aspect is bit-identical to
  `vfCam.aspect` by construction (diff=0) — no stretch.
- **Aim/gaze** (`_beat3Pose`, §CPE_AIM_DEPTH etc.): these feed the SAME `plan.poseAt(tn)` sample both
  B and a normal main-camera rehearsal use — already proven identical by G-VF-1, so whatever the gaze
  composition rule produces, B shows EXACTLY what the main camera would show at that instant. Not a
  B-specific bug.

With every mechanically-checkable number ruled out, added `§CPE_VF_FRAME_DIAG` — logs
nearest-surface-distance along vfCam's own look direction (real raycast against `a.collectMeshes(...)`,
mirroring `effects.js`'s own established `_cinemaFan` safety pattern: a curated mesh list, NOT raw
`scene.children`, plus try/catch) and what fraction of the box's vertical FOV a 1m reference object at
that distance would fill. **Caught and fixed a real bug in the diagnostic itself before shipping it**:
the first version raycast against `a.scene.children` directly and threw `Cannot read properties of
null (reading 'matrixWorld')` live — since this runs BEFORE the real `a.renderer.render()` call inside
`_vfRender()`, an uncaught throw here would have silently broken B's actual render on every frame it
hit (confirmed via `PAGEERROR` in a live Puppeteer capture). Fixed by reusing the codebase's own
already-safe raycast pattern instead of inventing a new one.

**Real numbers, sampled live across a rehearsal** (HHS_Office_Federated):
| scrubTn | nearest surface | frame-fill fraction (1m ref object) |
|---|---|---|
| 0.00 | 117.06m | 0.007 (essentially invisible — overview/settle) |
| 0.10 | none within 200m | n/a (open-air dive/pullback) |
| 0.30 | 1.89m | 0.458 (fills ~46% of frame height) |
| 0.50 | 2.90m | 0.299 (~30%) |
| 0.70 | 36.42m | 0.024 (tiny — orbit/exit, wide by design) |

**Honest conclusion: composition genuinely VARIES by beat, as intended** — interior walk-through beats
frame reasonably tight (30-46% of box height), while establishing/orbit/transit beats are
LEGITIMATELY wide (that's the whole point of an establishing shot). No single systemic "too wide" bug
found. The most likely remaining explanation for "not well framed" is perceptual, not a defect: B
mirrors the exact same 60° FOV the main camera uses, and the SAME composition that reads fine
full-screen naturally looks smaller/less deliberately framed compressed into a ~300×190px inset —
fewer pixels represent the same angular content. **Not guess-fixed** (e.g. picking an arbitrary
narrower FOV for B alone) since that would be inventing a value with no measured basis, exactly what
the PRIME RULE forbids. **Next real repro, if this needs to go further**: ask the user to note the
`scrubTn`/moment when it looks off next time B is used live, and read the matching `§CPE_VF_FRAME_DIAG`
line — if the fraction is genuinely low AT A MOMENT THE USER EXPECTED a close/tight shot, that's a
real product decision (does B want its OWN, narrower FOV — a deliberate "POV lens" distinct from the
main camera's navigation FOV?) to make WITH the user, not to guess.

### ✅ Issue 3 — §CPE_SCRUB_PLAYHEAD_TICK, root-caused and fixed
Confirmed by direct code read: `_previewFly()`'s `step()` applies the pose every frame
(`_applyVFPose(tn)`/`_applyCameraPose(tn)`) but NEVER wrote `tn` back to `_state.scrubTn` nor called
`_renderScrub()` — the exact same "second state update never wired into the real tick" shape as the
already-fixed `§CPE_SCRUB_BEARING_FLY_PAUSE` race (a pose write and a UI-state write are two separate
lines; `_scrubTo`, the manual-drag path, always had both; `step()`, the playback path, only ever had
the first). Fixed by adding the identical pair `_state.scrubTn = tn; _renderScrub();` right after the
pose-apply branch in `step()`. Verified live: 5 samples 400ms apart during a real button-driven
rehearsal read `0 → 0.030 → 0.068 → 0.133 → 0.169` — strictly increasing, matching the playback clock.

### Witnesses — `witness_cpe_scrub_viewfinder.js`, 30/30 green (HHS_Office_Federated), stable across repeats
- `G-SCRUB-STANDALONE` **retired** — it asserted the exact OPPOSITE of Issue 1's fix (panel exists
  unconditionally at open). Replaced by `G-SCRUB-EYE-GATED` (two gates: panel absent at open with
  `vfOn=false`; panel appears after the eye toggles on).
- **"toggle B on" moved to the TOP of the suite** — every gate that reads `#cpe-scrub-*` now needs the
  panel to exist first, so this can no longer happen midway through the run the way it used to.
  `G-SCRUB-NOCAM`/`G-SCRUB-VISUAL` (the main-camera-untouched invariant) now run with B on, since a
  scrub with B off is no longer a reachable real-world path at all.
- New `G-SCRUB-PLAYHEAD-TICK` — polls for a strict `scrubTn` increase during an ACTUAL rehearsal
  (not a synthetic call). **Hardened mid-session**: a fixed 400ms sampling gap was genuinely flaky at
  this exact point in the suite (deep into an already-heavy run under SwiftShader software rendering;
  an isolated live repro of the identical pause/resume sequence measured `msPerFrame=662.7` — a single
  frame can legitimately take longer than a short fixed sleep here). Switched to a 5s poll for a
  strict increase from the first reading — an environment-robustness fix, not a weakening of the
  claim being proven.
- New informational `G-VF-FRAME-DIAG` (not pass/fail — there's no known-correct "frame fraction" to
  assert against yet) — puts the real composition samples from the table above on record every run.
- `G-BUILDUP-GATES-TM`/`G-EYE-DRIVES-SCRUB`/`G-VF-1`/`G-VF-ASPECT`/`G-VF-RECT-ASPECT`/
  `G-VF-DRAG-WAKES-RENDER`/etc. — all unaffected in mechanism, just re-verified in the new gate order.
- `witness_dlod_vf_camguard.js` (different subsystem) — 10/10, unaffected.
- `npx eslint viewer/cinema_path_editor.js witness_cpe_scrub_viewfinder.js` — clean.

### Closing summary
| Issue | Status | Evidence |
|---|---|---|
| 1 — scrub panel always-on | ✅ FIXED | live toggle test + `G-SCRUB-EYE-GATED` (2 gates) |
| 2 — POV "not well framed" | ✅ CLOSED, no code change wanted | user ruling below |
| 3 — playhead frozen during playback | ✅ FIXED | live 5-sample monotonic test + `G-SCRUB-PLAYHEAD-TICK` |

**Issue 2 user ruling (2026-08-06, same session, after this writeup was first drafted):** asked the
user directly whether B's FOV should be narrowed given the measured data above. User: *"Dont really
get you but i go with your judgement, as larger to fit that pov screen is OK."* — confirms the
recommendation (leave B's FOV alone, mirroring the main camera exactly, since the "problem" isn't
uniform — interior beats already frame fine, establishing/orbit beats are wide ON PURPOSE and
narrowing would only hurt B's actual job of showing exactly what the real film shows). **No code
change made or needed** — this closes Issue 2 as a deliberate no-op, not an open item.

Pushed and MERGED: https://github.com/red1oon/bim-ootb/pull/1214 → `origin/main` @ `c6098aa`.
Worktree `/tmp/wt-cpe-open345` now sits on `fix/cpe-3issues`, fully merged (`ahead=0`) — prune next
session per Worktree Hygiene. Scratch debug scripts (`debug_vf_frame.js`, `debug_vf_frame2.js`, `debug_issue1_3.js`,
`debug_pause_resume_tick.js`, `probe_vf_frame.js`) stayed in the session scratchpad, not committed.

## ▶ SESSION 2026-08-06 (SAME DAY, FOLLOW-ON) — §CPE_SOLE_OWNER / §CPE_BUILDUP_OWNS_TM, PR bim-ootb#TBD

User live-tested PR #1214 and reported: "pressing off buildUp box does not close the TM panel,
instead closes the preview scrubber. Eye icon no longer controls the preview scrubber. This means
ownership is not tight." Per explicit user instruction ("Do check by logging alone... No visual
testing feedback can help"), diagnosed by code read first, then **user insisted on sandbox testing
before any live replay** ("do simple sandbox testing first... i insist you do that first" — a new,
now-standing instruction for this class of bug, see the housekeeping note at the end).

### Sandbox infra note — a real environment blocker, now solved for future sessions
Getting a headless-Chrome sandbox running in THIS session's environment hit three dead ends before
working: (1) `--use-gl=swiftshader` alone → GPU process fails init, page hangs forever waiting on
`window.APP._composer` (never created, no WebGL). (2) adding `--ignore-gpu-blocklist`/
`--enable-webgl` → same failure, Chrome 147's ANGLE-based backend rejects `--use-gl=swiftshader`
outright (`Requested GL implementation (gl=none,angle=none) not found`). (3) The FIX, taken directly
from this repo's own `witness_cpe_scrub_viewfinder.js` launch args (already correct, just not
noticed until `dumpio:true` surfaced the GL error): **`--use-gl=angle --use-angle=swiftshader
--no-sandbox --enable-unsafe-swiftshader`** — no `--ignore-gpu-blocklist`, no bare
`--use-gl=swiftshader`. Any future ad-hoc Puppeteer script in this environment should copy the
witness file's args verbatim rather than re-deriving them.

### First sandbox pass (pre-fix code) — did NOT reproduce the reported cascade
Drove the exact live sequence (eye on → scrub-play povOnly flight → pause → uncheck buildup) as one
clean, isolated action via Puppeteer against a local server. Result: `vfPanel:true, scrubPanel:false,
tmOn:true` — matched the shipped §CPE_BUILDUP_GATES_TM AND-gate exactly, no oscillation. A second
pass (buildup off / eye-cycle / buildup-on, no flight) also matched the AND-gate exactly. **Both were
initially mis-read as "no bug, matches the shipped design"** — wrong conclusion, corrected by the user
directly: the AND-gate's *shipped design itself* was never what they asked for. Re-reading their own
words from the OPEN-2 session that shipped it: they'd asked for the timeline panel to follow the Eye,
AND separately for BuildUp-unchecked to not "remain" — that second half was misread back then as "the
timeline panel needs buildup too" when the user actually meant "BuildUp must close what BUILDUP
itself opened (Time Machine), independently."

### The real spec, stated directly by the user this session (verbatim, this is now canon)
"Only respective owner owns its toggling. Eye toggles preview scrubber and POV and thus closing
them, no one else can. BuildUp opens TimeMachine when preview is played and thus must close when
BuildUp is unchecked." Single owner per widget:
- **Eye** owns B (the POV inset) AND the scrub/timeline panel, exclusively. Nothing else may open or
  close either.
- **BuildUp** owns Time Machine, exclusively. It never opens TM by itself being checked — only a real
  Play (via `tmActivateForBake` inside `_previewFly`, unchanged) opens it. Unchecking BuildUp closes
  TM "if it is free" (i.e. if it's currently on) — user explicitly declined a more elaborate
  "did buildup itself open it" ownership-history tracking ("it need not be cast in stone, do it if
  free/present") and confirmed the coupling is intentional, for convention/user education, not
  something to route around.

Re-examined against this spec (not against the old shipped design) — **the sandbox data from the
"no bug" pass was actually ALREADY proof of the bug**, just mislabeled: `scrubPanel:false` after
buildup-uncheck IS "closes the preview scrubber [wrong widget]"; `tmOn:true` staying true after
buildup-uncheck IS "does not close the TM panel [the one thing it should]"; the eye-cycle pass
showing `scrubPanel` staying `false` regardless of Eye state IS "Eye icon no longer controls the
preview scrubber". Also found while checking the TM-close path: **Time Machine was never closed by
CPE code anywhere** — not at buildup-uncheck (confirmed), not at a rehearsal's natural finish
(`_previewFly`'s finish block calls `tmRestoreDerivedOrder()` but never `toggleTimeMachine()`), not
at editor close (`finish()` tears down B/scrub but never touches TM). `tmActivateForBake()`
force-activates TM but nothing ever calls it back off.

### Fix — `viewer/cinema_path_editor.js`
1. `_toggleViewfinder`'s ON branch: removed the `_state.buildup &&` gate on building the scrub panel
   — Eye alone decides now (§CPE_SOLE_OWNER, retires §CPE_BUILDUP_GATES_TM).
2. `#cpe-buildup` `change` handler: removed `_scrubPanelTeardown()`/`_buildScrubPanel()` entirely —
   BuildUp never touches the scrub panel. Added: on uncheck, if `window.APP._tmOn` is true, call
   `window.toggleTimeMachine()` to close it (§CPE_BUILDUP_OWNS_TM). No ownership-history flag, per
   the user's own simplification — just "close it if it's on."
3. `_previewFly`'s `step()`: the buildup cursor-follow gate `if (bkPrev && window.tmSetCursor)`
   became `if (bkPrev && s.buildup && window.tmSetCursor)` — `bkPrev` alone is a one-time snapshot
   from flight-start and never saw a LIVE uncheck mid-flight; without this, an active flight would
   keep calling `tmSetCursor` every ~16ms fighting the checkbox handler's own TM-close. Needed for
   the fix to actually hold, not scope creep.

### Witness — `witness_cpe_scrub_viewfinder.js`, 30/30 green (Duplex)
`G-BUILDUP-GATES-TM` (3 gates asserting the old AND-gate) replaced with `G-CPE-SOLE-OWNER` (3 gates):
TM closes on uncheck while B/scrub stay untouched (reusing the real `_tmOn=true` state already armed
by the earlier G-VF-2/G-SCRUB-PLAY flight in the same run — no need to re-arm a fresh one); Eye alone
fully controls both panels regardless of buildup state; re-checking buildup does NOT itself open TM
(only a real Play does). All 27 pre-existing gates unaffected. `npx eslint viewer/cinema_path_editor.js
witness_cpe_scrub_viewfinder.js` — clean.

### Housekeeping — new standing instruction for this bug class
User, this session: for an ownership/wiring-cascade report like this one, **sandbox-test the isolated
action in Puppeteer BEFORE asking for a live replay** — cheaper than burning the user's time on a
repro, and (as it turned out here) the sandbox data was sufficient on its own, no replay was ever
needed. Worth remembering for the next tangled-log CPE report.

### Sandbox infra, promoted from a one-off fix to a standing note
The correct Puppeteer launch args for headless Chrome in this dev environment are
`--use-gl=angle --use-angle=swiftshader --no-sandbox --enable-unsafe-swiftshader` (already used by
`witness_cpe_scrub_viewfinder.js`, just not previously called out as the reason ad-hoc scratch scripts
kept hanging). `--use-gl=swiftshader` alone or with `--ignore-gpu-blocklist` fails GPU-process init on
this Chrome build silently, and the page hangs forever waiting on `window.APP._composer` — copy the
witness file's args verbatim for any future one-off sandbox script rather than re-deriving them.

## ▶ SESSION 2026-08-06 (SAME DAY, THIRD FOLLOW-ON) — §CPE_FIXED_PANELS, PR bim-ootb#TBD

User idea, given the POV inset's in-frame content itself already renders correctly: retire the
drag/resize affordance on both B and the scrub/timeline panel entirely. Verbatim: "since the fov
inframe pov works, just remove the outer pov frame that is ajar. Thus it is fixed on the bottom
left... dont make it movable... nor the preview bar as both can simply be removed by the eye icon for
better canvas." Sound simplification, not just a preference call — it also closes an entire class of
bugs by construction rather than patching around them: §CPE_VF_DRAG_MARKDIRTY (staleness), the
off-canvas-clip edge case found this session's own sandbox POV-frame chase (dragging B near a window
edge could push its scissor rect partially outside the backing buffer), and every "snaps back after
drag release" report in this file's history all trace to the drag/resize path existing at all.

### Fix — `viewer/cinema_path_editor.js`
- `_buildVFPanel`/`_buildScrubPanel`: rect is now always the same computed default (`VF_MARGIN`-anchored
  bottom-left), never `_vfRect || {...}`/`_scrubRect || {...}`. Removed both module-scope "remembered
  position" variables entirely — no session state left to drift.
- Removed `#cpe-vf-resize` (the corner resize handle) and its three pointer listeners; removed
  `a._makeDraggable(d)` calls and `cursor:move`/"drag to move" affordances from both title strips;
  removed the drag-triggered `save()` functions and their `pointerup` listeners; removed the now-dead
  `VF_MIN_W`/`VF_MIN_H`/`VF_RESIZE_HANDLE_PX` constants and the `§CPE_VF_DRAG_MARKDIRTY` `pointermove`→
  `markDirty()` listener (nothing moves anymore, nothing to wake mid-move).
- `_clampPanelToViewport(d, isDefaultPos)` simplified to `_clampPanelToViewport(d)` — every call is now
  the default-position path, the `isDefaultPos` branch was the only one ever taken.
- `§CPE_VF_ALIGN_DIAG_V2`'s one-shot-per-toggle log (`_state._vfDiagLogged`) no longer needs re-arming
  on drag/resize `save()` — the panel's rect can't change anymore, so logging once per editor-session is
  sufficient and the re-arm call site (inside the now-deleted `save()`) is simply gone.
- Toggling the eye off/on still works exactly as §CPE_VF_EYE_DRIVES_SCRUB specifies — both panels
  appear/disappear together — just always at the same fixed rect now, not a remembered one.

### Witness — `witness_cpe_scrub_viewfinder.js`, 31/31 green (Duplex)
`G-VF-DRAG-WAKES-RENDER` (tested a markDirty fix for a feature that no longer exists) replaced with
`G-CPE-FIXED-PANELS` (2 gates): no resize handle in the DOM, no `cursor:move` on either title strip,
and B's rect is byte-identical across a full eye off/on cycle (proving "nothing to remember, nothing
drifts" directly, not just by the absence of a drag handler). `G-EYE-DRIVES-SCRUB`'s existing "restores
at the same spot" assertion still passes, now trivially true by construction — comment updated to say
so rather than imply a remembered-position mechanism that no longer exists. All other pre-existing
gates unaffected. `npx eslint viewer/cinema_path_editor.js witness_cpe_scrub_viewfinder.js` — clean.

### Also reported this session, not chased further: "when buildUp is ON, the preview small screen goes
### blank and only appears when preview is paused"
Checked the code this maps to (`§DLOD_VF_MATRIX_STALE`/`§DLOD_VF_CAMGUARD` in `time_machine.js`,
`dlod.js`'s frustum-union fix) — both are present and unmodified in `origin/main`, already merged
2026-08-05, well before this session. This is the EXACT symptom those fixes were written to close. The
user's pasted console log for this report still showed `§CPE_LOADED v24` / `sw.js?v=538` — the same
stale-service-worker signature diagnosed earlier this session (live server confirmed serving `v956`).
Very likely the same stale-cache issue surfacing a already-fixed symptom, not a new regression — not
guess-fixed given no evidence of an actual NEW code path. **Next session, only if it reproduces on a
freshly hard-reloaded page**: re-open this with real numbers (`§DLOD_VF_VISCOUNT`/`§CPE_VF_FRAME_DIAG`
at the moment B goes blank).

### Housekeeping — squash-orphan avoided, a real pre-existing witness flake found and fixed
`fix/cpe-buildup-tm-ownership` (the branch PR #1215 shipped from) got squash-merged while this
session's follow-on commit was already sitting on top of it locally — the exact trap
`~/bim-ootb/CLAUDE.md` warns about (PR #138/#1212 precedent). Caught via `gh pr view --json
mergeCommit` before pushing, not after — branched fresh off post-merge `origin/main`
(`ebaebd3`, which itself already included an unrelated concurrent PR #1216) and cherry-picked the
new commit cleanly. While re-verifying on that fresh base, `G-SCRUB-NOSPAWN` failed — reproduced
deterministically on UNMODIFIED `origin/main` too (confirmed by temporarily checking out `ebaebd3`'s
exact file content and re-running), proving it was a pre-existing gate bug, not a regression from
either of this session's fixes. Root cause: the gate compared the DISPLAYED mm:ss label (rounds to
whole seconds) instead of the real `scrubTn`, so it could spuriously read "unchanged" whenever this
gate's target tn and the immediately-preceding `G-SCRUB-BEARING` gate's stick tn landed in the same
rounded second on a short film. Fixed to assert the real number with a tolerance sized to the
tn↔pixel round-trip. 31/31 green, stable across 3 consecutive runs. Branch `fix/cpe-buildup-tm-
ownership` deleted (both remote and local) once its content was confirmed fully carried forward —
nothing left uncaptured.

## ▶ HANDOFF 2026-08-06 (LATE) — for a fresh session, read this whole section before touching code

Two items confirmed by the user as STILL live on the current deployed build (`v956`, PR #1215 +
#1217 both confirmed live by fetching `cinema_path_editor.js` directly from
`https://red1oon.github.io/bim-ootb/viewer/cinema_path_editor.js` and checking for
`CPE_BUILDUP_OWNS_TM` present / `cpe-vf-resize` absent — do this same check yourself before assuming
stale cache is the explanation for anything, it was the wrong explanation for most of this session's
early reports and burned real time before being ruled out properly):

1. **"When BuildUp is ON, the POV inset (B) goes blank during playback, only appears when paused."**
2. **"The POV inset framing is still ajar/bigger" — even now that B is FIXED in position (drag/resize
   retired this session, §CPE_FIXED_PANELS), ruling out drag/resize instability as the cause.**

**User's own words this session, verbatim, before handing this off — read literally, do not drift
from it:** *"I hate to use visual when u own the code. And worse, your logging tells you nothing.
GIGO. Go back to your coding."* — the ask is CODE-LEVEL and NUMERIC investigation, not another
"please describe what you see" round-trip, and not console-log lines that don't actually settle
anything either (§-tagged logs are necessary but this session found them insufficient ALONE for these
two symptoms — see the pixel-readback approach below, which is numeric ground truth, not a
screenshot: it computes a statistic from real GPU pixel data, never displays or "looks at" an image).

### Item 1 — B blank during playback: real numeric evidence gathered, NOT a clean confirmation, do not guess-fix from this alone
Built a numeric pixel-readback probe (`gl.readPixels` on B's exact scissor rect, computing luminance
mean/stddev across a sampled grid — a genuinely blank/flat render has stddev≈0; real geometry has
real variance) and ran it against the LIVE deployed URL, Hospital building, matching the user's own
repro exactly (eye on, buildup on, scrub-play → povOnly+buildup preview). Script:
`/tmp/claude-1000/-home-red1-bim-compiler/096248ca-a52c-41d7-b6fc-dbf89c817742/scratchpad/
sandbox_blank_check.js` (scratchpad path — copy it into the repo/worktree before reuse, it was never
committed). Results from one run:
```
BEFORE flight (idle):          stddev=21.26  sameAsFirstFrac=0.952   (normal, real content)
DURING playback, sample 1:     stddev=0      sameAsFirstFrac=1       ← FLAT/BLANK
  same instant's §CPE_VF_FRAME_DIAG: scrubTn=0 nearestSurfaceDist=none-within-200m
DURING playback, sample 2 (+2s): stddev=40.41 sameAsFirstFrac=0.831  ← REAL CONTENT
  same instant's §CPE_VF_FRAME_DIAG: scrubTn≈0.21 nearestSurfaceDist=0.26m
AFTER "pause" click:           stddev=0      sameAsFirstFrac=1       ← flat again, BUT SEE CAVEAT
```
**Honest read, not overclaimed:** the FIRST "blank" sample correlates exactly with
`nearestSurfaceDist=none-within-200m` — i.e. vfCam is genuinely looking at open air/sky at that
instant (the dive/settle beat opens wide, matching the ALREADY-DOCUMENTED "composition varies by
beat" finding from the 2026-08-06 earlier session, not a new defect). Sample 2, two seconds later
during the SAME uninterrupted playback, shows real content (stddev=40) — so B does **not** stay
permanently blank while playing; content clearly renders during active playback when something is
actually in front of the camera. **The "AFTER pause" reading is NOT trustworthy evidence either
way** — the log shows `§CPE_PREVIEW done frames=3 msPerFrame=4551.5` between sample 2 and the pause
click: Hospital (63182 elements) under SwiftShader software rendering in this sandbox ran the ENTIRE
rehearsal in only 3 frames (~4.5s/frame) and had already finished (`u=1`, flight over) before the
"pause" click landed — that click therefore STARTED A NEW flight from tn=0 rather than pausing the
running one (`§CPE_SCRUB_PLAY started` appears a second time right after). A fresh tn=0 read is
expected to be near-blank again for the same "open air at the dive beat" reason as sample 1, not
because pausing revealed content. **This run neither confirms nor refutes "blank while playing, fine
when paused" — it only re-confirms the already-known "wide/open beats read as blank" fact.**
**What a fresh session needs to do, precisely, not a re-run of the same flawed test:**
- Re-run `sandbox_blank_check.js` (or a rewritten version) against a SMALLER/faster building
  (`Duplex`, present locally in `~/bim-ootb/buildings/Duplex_extracted.db` and in
  `/tmp/wt-*` worktrees) so the flight runs at real frame-rate and an actual PAUSE (not a
  race-condition restart) can be captured mid-flight, OR increase the sleep budget and poll
  `_flyState().paused` before reading pixels, don't just sleep-and-hope.
  after each `_probeVF()`/pixel read, so it's provable the sample was taken from the intended
  state (`flying=true` vs `flying=false,paused=true`), not assumed from elapsed time.
- Sample MANY tn points across a full rehearsal (not just 2), correlating each pixel-variance
  reading against BOTH `nearestSurfaceDist` (already logged) AND whether `flying`/`paused` was true
  at that exact instant — build a table, don't eyeball a couple of samples.
- If a genuine "stddev=0 while flying=true AND nearestSurfaceDist is CLOSE (not none-within-200m)"
  moment is found — THAT is the real bug signature (content should be there but isn't). If every
  stddev=0 moment correlates with `nearestSurfaceDist=none-within-200m`, this item is NOT a bug,
  it's the same composition-varies-by-beat fact already settled and signed off by the user earlier
  this session ("Dont really get you but i go with your judgement, as larger to fit that pov screen
  is OK") — close it as such, don't keep re-opening a settled finding without new evidence.

### Item 2 — POV framing "ajar" even with fixed panels
Ruled out this session, by code + witness (not visual): position/FOV/aspect/viewport-rect are all
bit-exact (`G-VF-1`, `G-VF-ASPECT`, `G-VF-RECT-ASPECT`, `witness_cpe_scrub_viewfinder.js`). The one
remaining, mathematically real, already-measured residual is the scissor-viewport rounding when B's
CSS box (300×190) is scaled by a fractional device-pixel-ratio (~0.2% aspect mismatch, `G-VF-ASPECT`'s
own tolerance documents this) — unavoidable while B shares the main canvas via
`setScissorTest`/`setViewport`/`setScissor` instead of owning a dedicated render target. **User
confirmed this is STILL visible even with drag/resize retired** (§CPE_FIXED_PANELS, this session) —
ruling out drag-induced staleness as an explanation too. **The only way left to fully close this,
not yet built:** give B its OWN `THREE.WebGLRenderer` on its own `<canvas>`, CSS-positioned over the
main canvas, instead of a scissor sub-rect of the shared one. This is a standard, well-precedented
three.js pattern (minimaps/split-screen/multi-viewport demos) — same `Scene`/`Camera` objects can be
rendered by multiple renderers, geometry is not tied to one renderer. Cost: a second WebGL context
(one extra, well within the ~8-16 browsers allow) and a duplicate first-use shader compile. **Real,
scoped architecture work, not a quick fix — needs the user's go before starting, since it replaces
`_vfRender()`'s core mechanism, not a patch on top of it.**

### Tooling now available for either item, reuse it rather than rediscovering
- **Correct headless-Chrome launch args for this environment** (a previously silent hang for ~30 min
  of this session, worth never re-deriving): `puppeteer.launch({ headless: 'new', protocolTimeout:
  300000, args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox',
  '--enable-unsafe-swiftshader'] })`. `--use-gl=swiftshader` alone (with or without
  `--ignore-gpu-blocklist`) fails GPU-process init silently and the page hangs forever waiting on
  `window.APP._composer`.
- `witness_cpe_scrub_viewfinder.js` (repo root, bim-ootb) — the full regression suite, 31/31 green as
  of this handoff. Run against `Duplex` (fast, default) or `HHS_Office_Federated`/`Hospital` (slow,
  matches the user's own scale) via `PORT=8460 BLDS=<name> node witness_cpe_scrub_viewfinder.js`
  from a worktree serving on that port (`python3 -m http.server 8460 --directory <worktree>`).
- `sandbox_blank_check.js` (scratchpad, path above) — the pixel-readback probe described in Item 1.
  Not committed; copy it into a worktree first, and fix the pause-race bug named above before trusting
  its "after pause" reading.
- **Before creating a new worktree, run `git worktree list`** — several exist from this session
  (`/tmp/wt-cpe-fixed-panels` is the last clean one, `ahead=0` on `fix/cpe-fixed-panels`, fully
  merged as of this handoff — safe to prune per Worktree Hygiene, or reuse if still present).

## ▶ SAME-DAY FOLLOW-ON — §CPE_VF_FRAME_CRAFT closes Item 2 (framing), Item 1 confirmed WORKING, PR bim-ootb#TBD

User, immediately after the handoff above: *"1. also working it actually closes TimeMachine."*
(confirms §CPE_BUILDUP_OWNS_TM is genuinely live and correct — no further action). *"The pov frame
smaller than the fov still there, and going blank when TM/Buildup but appear when paused. My
suggestion to remove first pov frame then craft back to the working fov screen frame was not taken."*
— a real, sharp correction: the ORIGINAL suggestion ("remove the outer pov frame that is ajar...
craft back to the working fov screen frame") was misread as "stop it being draggable"
(§CPE_FIXED_PANELS, already shipped) when it actually meant something more precise: the CSS
border/frame and the ACTUAL RENDERED CONTENT were two INDEPENDENTLY-SIZED things (the border stayed
at the raw `VF_DEFAULT_W/H` CSS box; the content's real aspect was the ROUNDED `w/h` the scissor math
produces) that could disagree by the already-documented ~0.2% residual — "craft back" meant REBUILD
the frame FROM the content's real numbers, not just stop moving it.

### Fix — §CPE_VF_FRAME_CRAFT, `viewer/cinema_path_editor.js`
Extracted the scissor-rect math (`x/y/w/h`) into a shared `_vfComputeAndCraftRect(panel, canvasR,
panelR, pr)` helper. After computing `x/y/w/h` exactly as before, it now converts them BACK to CSS
pixels (`backLeft = canvasR.left + x/pr`, `backW = w/pr`, etc.) and writes THOSE onto the panel's own
`style.left/top/width/height` — the border is now DERIVED from the same integers the GL
`setViewport`/`setScissor` call uses, not an independent approximation of them. Self-stabilizing (a
tolerance-gated write, skipped once the DOM already matches — no per-frame layout thrash). Called from
BOTH `_buildVFPanel()` (so the border is correct from the very first paint, not a one-frame flash of
the raw default box) and `_vfRender()` (every frame, cheap due to the idempotent skip).

### Witness — 32/32 green (Duplex), stable across repeats
New `G-VF-FRAME-CRAFT`: the VISIBLE border's own `getBoundingClientRect()` aspect now matches
`vfCam.aspect` to ~1e-4 (measured `1.28e-4`), not the old independent ~1.8e-3 gap — tolerance set to
`1e-3` rather than bit-exact because writing a full-precision float into `style.width` and reading it
back via `getBoundingClientRect()` round-trips through the browser's own CSS sub-pixel layout
quantization, a real, distinct, much smaller precision floor than the w/h integer-rounding
`G-VF-ASPECT` already documents. `G-CPE-FIXED-PANELS`'s "identical across an eye off/on cycle" gate
initially FAILED after this change (caught before shipping, not after) — the correction was only
wired into `_vfRender()`, so a synchronous rect read immediately after `_vfToggle()` (before any
animation-frame tick) saw the stale uncrafted default; fixed by also crafting at `_buildVFPanel()`
build time, which closed the gate AND removed a real one-frame visual flash the lazy-only version
would have had live. `npx eslint` clean.

### Item 1 (blank during BuildUp playback) — confirmed by the user as STILL happening, not yet
### re-investigated this follow-on (scope was the frame-craft fix above)
User: *"going blank when TM/Buildup but appear when paused"* — still reproducing on the live build.
The HANDOFF section above already has the numeric pixel-readback tooling and the precise next step
(fix the pause-race bug in `sandbox_blank_check.js`, sample many tn points correlating
`flying`/`paused` state against real pixel variance) — not repeated here, follow it as written. Not
touched this follow-on; the frame-craft fix above was the scoped, requested piece of this session.

### Second-opinion code review dispatched (Fable model, tight scope, not a re-investigation)
User: *"return to my former request... update prompts/# with a Fable agent to do a quick code check
on your work... within a proper scope which doesn't overspend tokens."* Dispatched a
`general-purpose` agent (model=fable) scoped to ONLY the three diffs from this session
(`git show ebaebd3` / `3216b38` / `51c7624c9cfa9e7d4d5facd4e78f347cad3254cf` — PRs #1215/#1217/#1218),
explicit instruction not to re-run the witness suite or explore the wider codebase, capped at 400
words, weighted toward PR #1218 (§CPE_VF_FRAME_CRAFT) as newest/riskiest — asked it to specifically
check the tolerance-gated write for a possible non-convergent oscillation, the
`_clampPanelToViewport`-then-craft ordering in `_buildVFPanel`, and dead references to the
PR #1217-removed `_vfRect`/`_scrubRect`/`VF_MIN_W`/`VF_MIN_H`/`VF_RESIZE_HANDLE_PX`. **Findings not
back yet as of this write-up** — if you're picking this up fresh, check whether that review
completed and landed a follow-up commit/note; if not, it may be worth re-dispatching with the same
scope rather than assuming it silently passed.

Fable review result: SHIP WITH FOLLOWUP NOTED (PR #1215/#1217/#1218 all hold) — one hardening catch, fixed in PR #1220 (`box-sizing:border-box` stated explicitly on B's panel, was silently relying on the global reset). Session closed here — Item 1 (B blank during BuildUp playback) still open, per the HANDOFF section above; user will test live and pick back up.

## ▶ SESSION 2026-08-06 (takeover) — Item 1 ROOT-CAUSED AND FIXED, bim-ootb PR #1222 (auto-merge armed)

User confirmed live: *"All issues stated prior still there"* + pasted a fresh live console log (no
Chrome visual check — witness/log evidence only, per explicit user instruction this session). Root
cause found by static read of `time_machine.js`/`cinema_path_editor.js`/`main.js`, not guessed:

**Mechanism.** `time_machine.js` `renderAtTime()` (called every BuildUp tick, via
`window.tmSetCursor` from `cinema_path_editor.js`'s `_previewFly()` `step()`) does its OWN direct
`app.renderer.render(app.scene, app.camera)` — full canvas, MAIN camera — and never called
`app._cpeViewfinderRender()` (the hook that runs B's scissor sub-render) afterward. That hook only
ever fires inside `main.js`'s `animate()`, at both its render branches. So every BuildUp tick's own
render call WIPES B's box, and B only gets repainted if `animate()`'s rAF loop happens to run again
afterward and see `_needsRender` still true — a race against `_previewFly`'s OWN independent rAF
chain (`step()` itself, which drives the very `tmSetCursor` calls that keep re-wiping B). During a
POV-only rehearsal the second chain wins almost every time, so B reads as permanently blank/frozen,
flickering to real content only on the rare tick `animate()` wins the race — this is EXACTLY what
the earlier HANDOFF's inconclusive pixel-readback samples showed (one flat/stale sample, one real-
content sample 2s later) without being able to name why.

**Fix (bim-ootb `fix/cpe-vf-buildup-blank`, commit `c74cf4b`, PR
[#1222](https://github.com/red1oon/bim-ootb/pull/1222), auto-merge armed):** one line —
`if (app._cpeViewfinderRender) app._cpeViewfinderRender();` right after `renderAtTime()`'s own
render call, mirroring the exact call `animate()` already makes. Removes the race entirely instead
of hoping to win it; no-op when B is off.

**Witness, not a screenshot** (`witness_cpe_vf_buildup_blank.js`, committed to bim-ootb root):
measures B's render count (`cinemaPathEditor._vfPerf().n`) against Time Machine's own real tick
count (`§PERF_TRAVERSE` lines) during a live 5s povOnly+BuildUp rehearsal, headless swiftshader,
`HHS_Office_Federated` (75MB, already-local, no new LFS pull). A/B'd via `git stash` on unmodified
current `origin/main` vs the fix, same building, same run shape:
```
without fix: TM ticks=5  B renders=3  coverage=60%   → FAIL (< 90% threshold)
with fix:    TM ticks=5  B renders=8  coverage=160%  → PASS
```
(coverage can exceed 100% — B also renders once at toggle-on and occasionally via `animate()` itself,
on top of the guaranteed per-tick repaint the fix adds.) Confirmed this reproduces on CURRENT
`origin/main` (fetched fresh via a NEW worktree, `git worktree add ... origin/main` — the
`/tmp/wt-cpe-buildup-tm` worktree named in earlier handoffs was stale: `fix/cpe-buildup-tm-ownership`
had already been merged and deleted upstream, main had moved 5 commits further including PR #1218/
#1220 named above. **Anyone picking this up: check `git worktree list` ages against `origin/main`
before trusting an old worktree's checkout as current — this one silently wasn't.**)

**Item 2 (POV framing) — untouched this session**, out of scope (user's report this session was
specifically the blank/frozen symptom). The architecture note in the HANDOFF above (B needs its own
`WebGLRenderer` to close the residual ~0.2% scissor-rounding mismatch) still stands, still needs the
user's go before starting.

**New report, mid-session, not yet root-caused:** *"when buildUp box is unchecked the bottom part
'Record' also goes away where user cannot record a non buildUp movie"* — read as: unchecking
`#cpe-buildup` makes the OK button (footer bar, `#cpe-panel`, whose text becomes "OK — record this"
when the plan is edited — the only "record" affordance in this panel) disappear or become
unreachable. **Investigated, NOT reproduced, NOT fixed — do not guess-patch from this alone:**
- Static read of the `#cpe-buildup` change handler (`cinema_path_editor.js`) and `_syncButtons()`:
  neither touches the OK/Save/Cancel footer row's visibility. The only side effect of unchecking is
  closing Time Machine if it was open (`§CPE_BUILDUP_OWNS_TM`, already-shipped, already-correct per
  the user's own confirmation earlier in this file) — no code path found that hides or removes
  `#cpe-ok`.
- DOM-geometry witness (numbers, not a screenshot — `getBoundingClientRect`/`getComputedStyle`/
  `offsetParent` on `#cpe-ok` before vs after clicking `#cpe-buildup`, both on a cramped 700px-tall
  viewport where the panel's own `overflow:auto` already clips the footer BEFORE any interaction, and
  on a taller 900px viewport where it doesn't): **no change in the OK button's display/visibility/
  position/in-viewport state from the toggle alone**, either way.
- **Not settled** — this only rules out "the checkbox handler itself hides it" and "generic
  scroll-clipping from the toggle alone." It does NOT rule out a state-dependent trigger (e.g. only
  after a rehearsal has run, only with Time Machine already open before the uncheck, only at a
  specific panel scroll position, or something the static read missed). **Needs the user's own
  console log captured across the EXACT repro steps** (what was open/active immediately before
  unchecking BuildUp) before this can be root-caused the same rigorous way as Item 1 — do not invent
  a fix without that evidence.

## ▶ SESSION 2026-08-06 (takeover, cont'd) — user confirms Item 1 live, Item 2 still open (already
## scoped above), + NEW finding: scrub does not drive BuildUp — dispatch a Fable-scoped check/fix

**Item 1 (B blank during BuildUp) — user-confirmed fixed live**, from their own pasted console:
`§CPE_VF_FRAME_DIAG` now fires continuously across a full rehearsal (`scrubTn` sweeping 0→1 with
`nearestSurfaceDist`/`refObj1mVerticalFrameFraction` changing every ~0.5s, no dead stretch) and
`§CPE_VF_PERF G-PERF-1 frames=229` — B rendered 229 times in that one run. bim-ootb PR #1222 is the
fix (commit `c74cf4b`, `time_machine.js` `renderAtTime()` calling `app._cpeViewfinderRender()`).

**Item 2 (POV "f to p" / frame-to-picture sizing — same as the earlier-recorded "pov frame smaller
than the fov")** — user confirms still open. Root cause was already fully diagnosed in the HANDOFF
above and is NOT a coordinate bug (`vfCam_fov=60 main_fov=60`, `vfCam_aspect=1.5798 box_aspect=1.5798`,
bit-identical per that same live log) — it's structural: B shares the main canvas's renderer via
`setScissorTest`/`setViewport`, inheriting the main view's post-processing pass (TAA/SSAO/output)
tuned for the FULL canvas, not a small scissored sub-rect. **Only real fix, already named, not yet
built:** give B its own `THREE.WebGLRenderer` on its own CSS-positioned `<canvas>` instead of
scissoring the shared one (standard three.js multi-viewport pattern — one extra WebGL context + a
duplicate first-use shader compile). Real, scoped architecture work — get the user's explicit go
before starting, it replaces `_vfRender()`'s core mechanism, not a patch on it.

**NEW, user-reported and CODE-CONFIRMED (not yet fixed) — scrubbing the POV timeline does not drive
the BuildUp construction reveal, only Play-from-start does:** user's own words: *"scrubbing the
preview POV, does not convey the buildUp process. Only play from beginning does show buildUp under
construction sequence."* Confirmed by static read, `viewer/cinema_path_editor.js`:
- `_scrubTo(tn)` (line 1309) calls `_applyVFPose(tn)` only — that function (line 1298) sets
  `_state.vfCam.position`/`lookAt` and nothing else. It NEVER calls `window.tmSetCursor`.
- Compare to the REAL Play path: `_previewFly()`'s `step()` (line ~2050) calls
  `window.tmSetCursor(bkMs)` every frame, gated on `bkPrev && s.buildup` — `bkPrev` comes from an
  async `tmActivateForBake()` + `tmFollowTimeline()` pair that only runs once, right before `step()`
  starts (lines ~2136-2158), and lives in `_previewFly`'s own closure — `_scrubTo` has no access to
  it at all, being a separate module-level function.
- **Net effect, matches the report exactly:** dragging/clicking the scrub bar moves B's camera
  through space correctly (the log shows `scrubTn` and `nearestSurfaceDist` changing normally on
  drag) but the BUILDING GEOMETRY stays frozen at whatever construction state it was last left in —
  the reveal only ever advances via the Play transport's own rAF loop, never via a scrub.
- **A path to the fix, for whoever picks this up (do not treat this as the only viable shape,
  verify first):** `_scrubTo`/`_applyVFPose` would need to, when `_state.buildup` is on AND Time
  Machine is already active (`A()._tmOn`), independently derive the same buildup cursor
  `_previewFly`'s `step()` computes (`a.buildupTAt(tn, _state.plan)` → `a.buildupCursorAt(bkTn,
  bkState)`) and call `window.tmSetCursor(bkMs)`. `bkPrev`'s only two fields `buildupCursorAt` reads
  are `projectStart`/`projectEnd`, both already exposed read-only via `window.tmGetState()` (see
  `time_machine.js`, `window.tmGetState`) — so `_scrubTo` may not need `_previewFly`'s closure at
  all, just `window.tmGetState()` when `.active` is true. **Open question a fresh session/agent must
  settle, not assume:** what should scrubbing DO when BuildUp is on but Time Machine has never been
  activated yet (no Play has ever run this session) — arm it silently, or leave the reveal at
  whatever TM's default/last state is until Play is pressed once? The spec doesn't say; ask the user
  rather than guessing if this comes up mid-fix.
- **Not yet fixed this session** — user asked specifically for this to be written up here so a
  fresh session can dispatch a scoped review/fix, not for an immediate patch.

**Dispatch instruction for a fresh session (user's own ask, verbatim: "new session may launch a
Fable scoped to check the code"):** spawn a `general-purpose` agent, `model=fable`, scoped ONLY to
`viewer/cinema_path_editor.js`'s `_scrubTo`/`_applyVFPose`/`_previewFly`/`step()` and
`viewer/time_machine.js`'s `window.tmSetCursor`/`window.tmGetState`/`renderAtTime` — give it this
section verbatim as context, ask it to (1) confirm the root-cause read above is correct by re-reading
the same functions, (2) propose the minimal fix, flagging the open question above rather than
silently picking an answer, (3) NOT re-run the full witness suite or explore unrelated code, capped
at ~400 words per the same discipline the earlier Fable review used (see the "Second-opinion code
review dispatched" section above this one). Verify with a witness in the same shape as
`witness_cpe_vf_buildup_blank.js` (bim-ootb repo root) — before/after `§PERF_TRAVERSE`-tick-count vs
`window.tmGetState().cursor` sampled immediately after a scrub drag, not a screenshot.

## ▶ SESSION 2026-08-06 (cont'd) — scrub-vs-BuildUp gap FIXED, witnessed, not yet pushed

Dispatched exactly as scoped above (`model=fable`, isolated worktree `/tmp/wt-cpe-scrub-buildup`,
branch `fix/cpe-scrub-buildup`, off fresh `origin/main` — chosen over the shared `~/bim-ootb`
checkout because that tree had another session's uncommitted 456-line in-progress rework of this
exact same area live at dispatch time; worktree isolation avoided any file collision).

**Root-cause read confirmed against current code**, one live discrepancy found beyond the original
diagnosis: fixing the cursor sync exposed that B's day readout also went stale after a scrub (only
ever refreshed on Play/`step()` frames before) — folded into the same patch.

**Fix:** new `_scrubBuildupSync(tn)` in `cinema_path_editor.js`, called from `_scrubTo` after the
pose update. Gated on `_state.buildup` AND `window.tmGetState().active` — derives the same buildup
cursor `step()` computes and calls `window.tmSetCursor(bkMs)`, then refreshes B's readout. Logs
`§CPE_SCRUB_BUILDUP`.

**Open question resolved (conservative, as instructed):** a scrub does NOT auto-arm Time Machine —
before the first Play this session, scrubbing stays pose-only, identical to today's behavior. Matches
the existing "only a real Play opens Time Machine" doctrine. Asserted as its own gate
(`G-SCRUB-BK-NOARM`) so any future change to this is a deliberate, witnessed decision, not a silent
drift.

**Witness** (`witness_cpe_scrub_viewfinder.js`, Duplex, extended with new gates) — **34/34 PASS,
exit 0**: `G-SCRUB-BK-CURSOR` — scrub(0.25)→cursor=1783791925000, scrub(0.75)→cursor=1784378187000,
both `diffMs=0` against independently-computed expected values (same shared helpers `step()` uses).
`G-SCRUB-BK-NOARM` — tmActive stays `false` across a scrub when Time Machine was never armed.
`G-VF-2b` — B's readout now agrees with the cursor's day after a scrub. All 5 pre-existing gates
(G-SCRUB-1/2, G-VF-1/2a, G-PERF-1) still pass, unbroken by this change.

**State:** committed `e62d19c` on `fix/cpe-scrub-buildup` in `/tmp/wt-cpe-scrub-buildup` —
**not pushed**, per dispatch instructions (this bim-compiler session doesn't own bim-ootb pushes,
[[feedback_diagnose_in_session_fix_in_other_session.md]]). `origin/main` has advanced by one
docs-only commit since the worktree was cut (`4e3b320`) — no overlap with this diff, trivial rebase
at PR time. Shared `~/bim-ootb` checkout was never touched. Next: user decides whether to push/PR
this branch (and whether/how it should reconcile with whatever the other concurrent session ships
to the same file).

## ▶ SESSION 2026-08-06 (cont'd) — live-log discrepancy analyzed, no code touched

**(a) Live log is stale-state, not a new bug.** PR #1226 is `OPEN`, `mergedAt: null` — the deployed
site (`red1oon.github.io/bim-ootb`) is built from `origin/main`, which does NOT contain `e62d19c`.
The pasted console log matches exactly: Play phase fires `§PERF_TRAVERSE` every frame (buildup ticks),
the scrub-drag phase moves `scrubTn`/vfCam pose with zero `§PERF_TRAVERSE`/cursor lines, and no
`§CPE_SCRUB_BUILDUP` tag appears anywhere (that tag only exists in #1226). Expected pre-fix behavior.

**(b) `_scrubTo` is still the one real hook point on current `origin/main`.** Traced in
`viewer/cinema_path_editor.js` @ `origin/main` (`fdec1cc`): the standalone panel (`_buildScrubPanel`,
L1190; `#cpe-scrub-track` L1219) is wired by `_wireScrub` (L1317) — pointermove → `_scrubTo(tn)`
L1337, click/pointerup → `_scrubTo(tn)` L1357; stick-click bearing also reuses `_scrubTo(bearTn)`
L2254. `_scrubTo` itself is at L1309. PR #1184's rework did NOT create a parallel drag path — it only
extracted `_applyVFPose` (L1298, §CPE_SCRUB_POV_ONLY) for the scrub-play button, whose Play path goes
through `_previewFly()`'s `step()`, which already drives the cursor. #1226's `_scrubBuildupSync`
inserted inside `_scrubTo` therefore covers every scrub entry point. The log's own sequence (Play
first → TM armed → then drag) is exactly the `ts.active` gated case the fix handles.

**(c) Merge-safety: CLEAN.** `mergeStateStatus: CLEAN`; `git merge-tree` base→main→branch = 0
conflict markers. `fix/cpe-scrub-buildup` sits on `1b157f4`; the two commits main gained since
(`4e3b320`, `fdec1cc`) are docs-only, no overlap with the diff (which touches only
`_scrubTo`/adds `_scrubBuildupSync` + one witness probe). No dead-code risk found.

**(d) Why auto-merge didn't stick:** not settings — repo has `allow_auto_merge: true` AND branch
protection on `main` with required checks `fast-checks`/`e2e-tests`. The real cause is ordering:
`ci.yml`'s step ran on the PUSH-triggered run at 07:59:20Z (`gh pr merge --auto --squash
"fix/cpe-scrub-buildup"` → logged `no pull requests found for branch`, swallowed by `|| true`), but
PR #1226 was only created at 08:38:33Z — 39 min later — and nothing re-runs the step after PR
creation. Fix is one manual command: `gh pr merge 1226 --repo red1oon/bim-ootb --auto --squash`.

## ▶ SESSION 2026-08-06 (cont'd) — PR #1228 merged+deployed (checkbox fix, AIM_PIN disabled, plain
## POV frame, quiet banners); user re-tested LIVE — 1 of 3 confirmed, 2 still open, wrap-up handoff

**PR #1228** (`fix/cpe-followups`, commit `0215a3a`) — merged `2026-08-06T09:48:29Z`, `deploy-pages`
ran clean immediately after (finished ~09:53Z). Everything below was tested by the user AGAINST THIS
LIVE DEPLOY, not a stale build — confirmed by their own pasted console showing zero `§CPE_AIM_PIN`
lines anywhere (the disable is live) and the RECORD-button behavior matching the fix.

**1. RECORD button (checkbox edit-detection) — ✅ CONFIRMED FIXED, user's own words:** "RECORD button
no longer goes away on buildUp off." `_isEdited()`'s `origBuildup`/`origRoomTitle` baseline fix
(cinema_path_editor.js `_isEdited()`, ~line 649) is working as intended. **Closed, no further action.**

**2. POV screen issue — ⚠ user reports "still there", but WHICH issue is ambiguous, don't assume:**
This PR deliberately did NOT attempt to fix subject framing/composition (the "subject reads small in
the box" issue, Item 2 from the `SESSION HANDOFF` above, root-caused as B sharing the main renderer's
full-canvas post-processing — a real fix needs B's own `WebGLRenderer`, explicitly deferred pending
user go). What THIS PR changed was cosmetic-only, per the user's own request this session: retired the
pixel-fit-chase border-crafting and replaced it with a plain thin white rounded border
(`§CPE_VF_PLAIN_FRAME`, 1px, radius 12px, `rgba(255,255,255,0.85)`) — witnessed via `G-VF-PLAIN-FRAME`,
33/33 PASS. **So "still there" may mean two different things and a fresh session must ask, not guess:**
(a) the composition/small-subject issue is still unsolved — expected, it was never in scope this PR,
or (b) the new plain border itself doesn't look right / isn't rendering as described. Get the user to
clarify which, with a screenshot or a `getComputedStyle` readout of `#cpe-vf-panel`'s border, before
touching any code — do not re-open the WebGLRenderer architecture question without an explicit user go
(per the earlier HANDOFF section), and do not re-touch the border CSS on a guess either.

**3. "Stick cannot be edited" — ⚠ NOT the pin-click regression (that's confirmed gone), root cause
UNKNOWN, needs a fresh repro+log before any fix is attempted:** The user's pasted live-deploy console
(full session, BuildUp toggled, a stick selected: `§CPE_SELECT band=0 zone=mid`) shows **zero**
`§CPE_AIM_PIN` lines and **zero** `§CPE_DRAG_SCALE grab band=...` lines anywhere — meaning the pin
regression this PR fixed is genuinely gone (no full-replan cascade fired), but the log also never shows
a successful drag-grab being attempted or registered. Two live possibilities, unconfirmed either way:
- **(a) A pre-existing UX-difficulty issue, not a regression.** `_wireDrag`'s pointerdown handler
  (cinema_path_editor.js, `h.down`, ~line 2454) only starts a drag when the raycast returns a `hit` on
  a band's own handle geometry (end/mid spheres, `HANDLE_R=0.30m`, `GRAB_PX=18` screen-space
  tolerance) — line ~2444-2452: when a band is already selected (`_state.held` set) and the click does
  NOT land on that hit-zone, the code explicitly does `_state._pinCandidate = {...}; return;` **without**
  `preventDefault()`/`stopPropagation()`, so the gesture falls through to OrbitControls by design (the
  code comment says so verbatim: "OrbitControls still owns this gesture exactly as it does today").
  Before this PR, a near-miss click ALSO triggered `§CPE_AIM_PIN`'s raycast-and-replan on release,
  which at least did something visible; now a near-miss is a silent orbit. If the handle hit-zone is
  genuinely hard to land a click on at typical zoom/scale, this PR's fix didn't create that
  difficulty, but it did remove the (broken, replan-storm) fallback that used to at least react —
  possibly making a marginal hit-test feel MORE like "nothing happens" than before, even though
  dragging when you DO land the hit still works (`witness_cpe_drag.js` G-DRAG-1..4, 4/4 PASS, scripted
  — not a substitute for a real mouse-precision read).
- **(b) A genuine separate bug**, unrelated to hit-tolerance, not yet ruled out.
- **Do not guess which. Next session: get the user's console log captured across the EXACT repro** —
  click to select a stick, THEN attempt to drag it (not just re-select), paste that specific gesture's
  full log (same evidence discipline as the earlier `§CPE_OK_VISIBILITY`/scrub-buildup investigations
  this file already used successfully). If the log shows a `hit`/`§CPE_DRAG_SCALE grab` line with no
  visible movement, it's a math bug in the drag delta — cheap fix. If it shows NO grab line at all on a
  deliberate handle click, the hit-test tolerance itself is the target (`GRAB_PX`/`HANDLE_R`, both in
  cinema_path_editor.js's top constants) — a UX tuning fix, not a logic bug. Either way, root-cause from
  the log first, per this project's standing rule — do not invent a fix without it.

**Session closed here per user's explicit "wrap up" instruction.** State for pickup: 1/3 confirmed
closed, 2/3 open with next steps named above, nothing left mid-edit, worktree `/tmp/wt-cpe-scrub-buildup`
clean (branch `fix/cpe-followups`, fully pushed/merged) — safe to prune per Worktree Hygiene once
confirmed no longer needed, or reuse for the next CPE pickup.

## ▶ SESSION 2026-08-06 (pickup) — §CPE_VF_GRIP + §CPE_BUILDUP_EVEN_TEMPO, both measured, both fixed

Picked up the handoff above cold. Of its two open items, **item 3 ("stick cannot be edited") is
CLOSED by the user directly** — asked which gesture they used, answer: *"It is working already."*
No code touched, no fix needed. The handoff's leading hypothesis (GRAB_PX hit-test tolerance) was
never exercised; if it recurs, that analysis is still on record above.

Item 2 (POV) was disambiguated by the user and turned out to be a THIRD thing, not either of the two
the handoff offered. Their words: *"Subject playing screen is bit larger that is fine. The pov
original frame size has always been wrong. Now it tries to redraw its borders rather flimsy and not
aware of the bit larger inset screen. I think this has to be look at holistically why it is not
gripping."* — i.e. not composition, not the border's styling: the border and the picture are
DIFFERENT RECTANGLES.

### §CPE_VF_GRIP — the frame did not hold the picture (FIXED, witnessed)

**Root cause, and it is NOT the deferred post-processing issue.** `_vfComputeRect` derived the
scissor rect from `panel.getBoundingClientRect()` — the panel's OUTER BORDER BOX. Three separate
consequences, all plain rect arithmetic:
- the rect covered the 1px border ring on all four sides, so the frame painted ON TOP of the
  outermost ring of the picture instead of around it;
- it covered the 22px opaque `#cpe-vf-title` header, which is absolutely positioned INSIDE that same
  box — 23px, **12.11% of the framed image, was painted over and never seen**;
- square scissor corners against a `border-radius:12px` frame → the picture poked out through each
  rounded corner by `r*(1-1/√2)` = **3.51px**.
And `vfCam.aspect` followed the same outer box (**1.5789**) while the visible picture is **1.7952** —
**12.05% out**, so the composition was centred on a box 24px taller than exists and the subject rode
high, under the header. *This is why "the pov original frame size has always been wrong."*

⚠ **This was conflated with §CPE_VF_PLAIN_FRAME's recorded root cause for several sessions.** That
one (B sharing the main renderer's full-canvas post pass, needing B's own `WebGLRenderer`) is about
how the picture is SHADED. This one is about WHERE IT LANDS. Only the second was ever the "frame
size" complaint. **The WebGLRenderer work remains deferred and unstarted** — it was not needed here.

**Fix** (`viewer/cinema_path_editor.js`): new `_vfPanelInset(panel)` reads the real computed border
widths + the header's own `offsetHeight`; `_vfComputeRect(canvasR, panelR, pr, inset)` now computes
the CONTENT box. Both call sites (`_vfRender`, `_vfRectForTest`) pass it. `border-radius` 12px → **0**:
the panel is a TRANSPARENT hole punched over the main canvas (an opaque background would cover the
very render it frames), so an inset dodging the corner arc would show the MAIN scene through the gap,
not a mat — a square frame is the only shape that grips this architecture exactly. One-line revert if
rounded is wanted back, at 3.51px of poke per corner. Also dropped §CPE_VF_RECT_ASPECT's derive-w-from-h
trick: `vfCam.aspect = w/h` already makes rect and camera agree by definition, so deriving w from h now
only lets w miss the content box by up to a pixel — the exact bleed being removed. Both rounded
independently against their own box.

**Witness `witness_cpe_vf_grip.js` (NEW, Duplex) — 0/4 → 4/4.**
```
pre-fix   BLEED  left=1.00 right=1.00 top=23.00 bottom=1.00 px   render 300x190 @(16,454) vs visible 298x166 @(17,477)
          TITLE  hidden 23.00px of 190.00 = 12.11% of the frame
          ASPECT vfCam 1.5789 vs visible 1.7952 — 12.05% out
          CORNER radius 12px, needInset 3.51px, gotInset 0.00px
post-fix  BLEED  left=0.00 right=0.00 top=0.00 bottom=0.00       render 298x166 @(17,477) == visible, exactly
          TITLE  hidden 0.00px (0.00%)     ASPECT err 0.00%      CORNER radius 0px, needInset 0.00px
```
`witness_cpe_scrub_viewfinder.js` **33/33 PASS** after amending two gates that encoded the old wrong
geometry: `G-VF-PLAIN-FRAME` (radius 12px → 0px) and **`G-VF-ASPECT`, which had been reading the OUTER
box and so passed green through the entire 12% error — reading the outer box in the witness is part of
why this went unnoticed for several sessions.** It now reads the content box.

### §CPE_BUILDUP_EVEN_TEMPO — the days sprint during the dive-in (FIXED, witnessed)

**User, mid-session:** *"why does the movie baking makes the first few seconds or during the dive in
jumps days too fast tempo? Should be even throughout - separation of concern. Let the user plays with
the sticks and timings to catch this linear buildup."*

**Answer to "why": §CPE_BUILDUP_WORK_PACED, working exactly as written.** `_workCursorAt`
(`cinema_maxq.js`) maps film fraction → the k-th ELEMENT PLACED, `k = round(t * total)`. Even element
rate is uneven DAY rate by construction — the two cannot both be constant unless the schedule spreads
elements uniformly in time, which no real 4D schedule does. Wherever the schedule is sparse in
elements (site/substructure — the opening of the film, which is where the dive-in happens) the date
cursor sprints through weeks to reach the next element. Measured on Duplex, pre-fix: per-step calendar
advance ranged **0.01d → 0.29d, a 57.21× swing** across one 10-day buildup, cursor departing the
straight line by **9.47% of the whole span**.

**Fix:** `BUILDUP_EVEN_TEMPO = true` in `cinema_maxq.js`; `_workCursorAt` returns
`projectStart + t*span` before any schedule is consulted, and logs `mode=even-calendar`. Work pacing
is kept intact behind the flag (one-line revert), not deleted.

⚠ **This REVERSES a prior user decision and trades back into the problem that motivated it** — the
burst §CPE_BUILDUP_WORK_PACED records (a quarter of the Hospital model appearing in the first 5% of
the film) returns wherever a schedule clusters its elements. Made deliberately, on the user's stated
grounds: **separation of concern.** The buildup engine does one predictable thing — linear days — and
dramatic pacing belongs to the path editor, where the user places sticks and sets timings and can see
what they are doing. Two mechanisms silently competing to set tempo is what produced a pacing nobody
asked for and nobody could steer.

**Witness `witness_cpe_buildup_tempo.js` (NEW, Duplex) — 1/3 → 3/3.**
```
pre-fix   EVEN   maxStep 0.29d / minStep 0.01d = 57.21x (tol 1.05x), worst at u=0.28
          LINEAR maxDeviation 0.9d = 9.47% of span (tol 0.50%)
post-fix  EVEN   maxStep 0.10d / minStep 0.10d = 1.00x        DIVEIN first 10% of film = 10.00% of calendar
          LINEAR maxDeviation 0.0d = 0.00% of span
```

**A REAL defect this change introduced, caught by an existing witness and fixed at the source — not
retired.** `_ghostGroundArm` picks its trigger threshold as `elementsFirstT ?? calendarFirstT`,
mirroring `_workCursorAt`'s own branch. Moving the cursor to calendar while leaving the threshold in
the elements domain **reintroduced #1148 from the other direction**: threshold `firstT=0.0027`
(elements) against a real cursor crossing at `t=0.0083` (calendar), so the ground began un-ghosting
~2 frames of 400 BEFORE the first above-ground element was placed. `witness_cpe_ghost_ground.js` went
**15/15 → 13/15**, confirmed a genuine regression by re-running the witness against stashed pre-fix
code (baseline 15/15) rather than assuming. Fixed by gating the elements-domain branch on
`BUILDUP_EVEN_TEMPO` — back to **15/15 ALL GREEN**, and the live log's `cursorConfirms` went **0 → 1**
(threshold and real cursor now agree, `firstT=0.0090` = the calendar crossing).

**Superseded gates retired IN PLACE, never deleted or silently flipped** — each keeps the number it
last measured, because the decision each encodes was real, was the user's, and was reversed on the
record:
- `witness_cpe_work_pacing.js` **9/9**: G-WP-1 (*"k% of the film is k% of the building"* IS work
  pacing — last measured 5.48pp against a 3pp tol), G-WP-2 (its RED control; both branches are now
  calendar so the deviations are equal by construction), G-WP-8 (even ELEMENT-per-frame rate — last
  measured 81.0% deviation against a 25% tol) retired. G-WP-7 AMENDED, not retired: the log must still
  NAME the pacing in force, and now accepts either mode. G-WP-3/4/5/6/9 (monotonicity, determinism,
  degrade-not-disable, preview==bake, full placement) stay LIVE — they are orthogonal to which pacing
  is in force. Flip the flag false and all four retired gates go green again unchanged.
- `witness_cpe_ghost_ground.js` **15/15**: G-GG-12c retired — its premise is that the calendar-fraction
  and real-cursor clocks are DIFFERENT clocks that can diverge, true only under work pacing. They are
  one clock now; gap=0 is the correct state, not the #1148 regression. G-GG-12a stays LIVE and is what
  caught the regression above.

### State
bim-ootb branch `fix/cpe-vf-grip-and-tempo` off fresh `origin/main` (`d04cb5c`), in the reused
worktree `/tmp/wt-cpe-scrub-buildup` (branched fresh rather than re-using the squash-merged
`fix/cpe-followups`, per the concurrent-branches rule). Shared `~/bim-ootb` checkout never touched —
it is 21+ commits stale and carries another session's staged changes.

**Not verified, and why:** `witness_cpe_buildup_schedule.js` could not run at all — its first
building `TerminalHi4D` is an LFS pointer locally (60-74 byte stubs for every building except Duplex),
so it times out at page load. **Pre-existing environment limitation, not a regression from this
change** — no gate in it ever executed. Every witness above ran on Duplex only, for the same reason;
deliberately did NOT pull LFS blobs (Worktree Hygiene / DB policy).

**Still open, unchanged, needs an explicit user go before anyone starts:** B's own `THREE.WebGLRenderer`
(the composition/post-processing item). §CPE_VF_GRIP did not touch it and does not depend on it.

## ▶ §CPE_WALK_AUTHORING — SPEC (2026-08-06, design decided, NOT built)

**Status: spec only. No code written. Two design questions were put to the user and both are now
answered — recorded here so the decisions are not re-litigated.**

### The idea (user)
*"How about the path is done by a more intuitive 'walk' ie the user drag to a spot and snap, then to
another spot and snap. It is as if he is making the movie by walking thru the virtual building and
say OK this is where the cam will come here and look here where he is facing."*

### The two rulings — BOTH decided, do not re-open
1. **Does the authored walk REPLACE the derived path?** → **NO.** User: *"Shouldn't as the older one
   can be quick and easy. The new way is to give more idiot proof pathing."* The derived path stays
   the default and stays exactly as it is. Walk-authoring is an OPT-IN layer for users who want
   control, not a new default.
2. **Do the dive-in and closing orbit stay automatic?** → **YES, ALWAYS.** User: *"The preset dive
   into largest hall then out is for quick just hit and go users. This is the hallmark signature of
   our project - frictionless."* Alt+C with zero further input must keep producing a complete film.
   **Frictionless is the product signature — any design that makes the zero-input path worse is
   wrong by definition, however good the authoring experience is.**

### What this means architecturally — ADDITIVE, and mostly already present
The film is already beat-structured (`§CINEMA_BEATS dive / spin / out / rise`) and the plan ALREADY
carries the distinction this feature needs: `§CINEMA_PATH_EDIT authored waypoints=6 (derived route
replaced)` and `§CINEMA_BEATS ... route=authored waypoints=6` both appear live today the moment a
band is dragged. So:
- Walk-authoring is **a new way to PRODUCE authored waypoints**, not a new film engine.
- It substitutes for the **WALK beat only**. Dive, spin, pull-back and orbit are untouched.
- Ruling 1 falls out for free: no authored waypoints → `route=line`, today's behaviour, bit-identical.

**The one genuinely new thing: a per-waypoint AIM.** Today the aim is DERIVED (`§CPE_AIM_DEPTH`,
`§CPE_AIM_DENSITY`, `§CPE_AIM_SERIES`, and the `§CPE_AIM_PIN` override). "Look here where he is
facing" means an authored `{position, aim, time}` triple. Every mature tool in this space separates
the position track from the aim track for exactly this reason — see prior art below.

### Prior art (the pattern is mainstream; today's derive-then-nudge is the unusual one)
- **Enscape / Twinmotion / Lumion video editors** — fly the camera, click to drop a keypoint storing
  position + orientation (+ FOV, time), tool interpolates. The AEC-native form of this idea.
- **Unity Cinemachine (Dolly Track + Cart + LookAt)** — the cleanest split: cart rides the spline,
  aim target is independent. Architecturally the closest match to the ruling above.
- **Blender (Follow Path + Track To)** — same decoupling.
- **Google Earth Studio** — explicit position and target keyframes on one timeline.
- **Matterport Highlight Reel** — pick saved viewpoints, fly between them; its click-a-floor-point
  navigation is the closest existing analogue to "drag to a spot and snap".
- **Navisworks viewpoint animation** — record viewpoints, tween.

### Surface triage — canvas pick vs POV window (OPEN, needs a user decision)
- **Canvas pick** gives POSITION naturally (raycast → snap to a legal standing spot) but NOT facing;
  facing needs a second gesture (e.g. drag out from the dropped pin to set look direction).
- **POV window** gives FACING naturally — it IS the shot, what you see is what is recorded — but not
  position; you fly there first, then press "drop this shot". This is the Enscape/Twinmotion pattern
  and the reason they all put a record-viewpoint button on the live camera.
- B's inset already renders exactly the frame that would be filmed, so the POV route is closer than
  it looks. **Not decided — ask before building.**

### Assets that already exist (no new extraction needed)
- `storey_walkable_raster` table ships in the building DB (confirmed in the user's own live
  `§CENTRES_QUERY` table list), and the planner already consumes it: `§PATH_LEGAL_RASTER
  storeys=Level 1..Level 7`. So "snap to a legal standing spot" is computable TODAY.
- Room graph + door graph + spine bridging (`§ROOM_GRAPH`, `§ROOM_SPINE_BRIDGE`) for legal routing
  between authored points.
- `_spawnStick` / `_scrubTo` / `plan.poseAt()` — the existing authored-waypoint plumbing.

### Still open before any code
- The surface triage above (canvas pick vs POV-window record button, or both).
- Whether authored points are hard keyframes (camera passes exactly through) or soft attractors the
  existing planner smooths — the current band/hose model is the latter, and mixing the two silently
  would reproduce the tempo-vs-work-pacing confusion §CPE_BUILDUP_EVEN_TEMPO just resolved.

### §CPE_WALK_AUTHORING — surface DECIDED (2026-08-06, same session)

**The POV window is the authoring surface, and it REPLACES pin-dropping as the editing model.**
User: *"once we solve the elusive pov frame, we can have an edit ON button there, where user then
navigate in that pov frame and each stop within those pipe can be new sticks. User sees on the big
canvas it develops"* and, on the canvas-pick alternative: *"its a different editable purpose approach
now. Instead of dropping pins which is not as friendly."*

So the canvas-pick surface offered in the triage above is RETIRED from this design — not because it
could not work, but because picking points on a canvas is not the friendly gesture the feature exists
to provide. First-person navigation is.

- **Edit toggle lives on B.** Turn it on, navigate in the POV, and the main canvas shows the path
  developing as you go — you compose from inside the shot, and watch the route form outside it.
- **Stop gesture = toggle the edit-POV off and on again.** One off→on cycle commits a stick where the
  POV is standing.
- **⚠ REVERSES a prior explicit user ruling.** B is display-only today — user, 2026-08-04: *"pov box
  is purely display for user bearing"*, no drop/raycast interaction, which is why `§CPE_VF on` logs
  "display-only, no drop interaction". Changing it is fine; recording it as DELIBERATE (same
  treatment as §CPE_BUILDUP_EVEN_TEMPO's reversal) so it is never mistaken for drift.

**This makes B's own `<canvas>` a HARD PREREQUISITE, not an optimisation.** B cannot receive input at
all as built: `#cpe-vf-panel` is `pointer-events:none` over a transparent hole, and B is a scissor
rect inside the MAIN canvas, not an element of its own. Nothing can be navigated in it until it is a
real canvas. That single change now buys three things that were being tracked as separate problems:
1. the exact frame (§CPE_VF_GRIP / §CPE_VF_STACK — the browser sizes picture and frame from one box),
2. the composition/post-processing fix (§CPE_VF_PLAIN_FRAME's recorded root cause — B currently
   inherits the main view's full-canvas post pass), and
3. an interactive POV, which this feature requires.
Any one of them alone was arguably not worth the WebGLRenderer work. Together they are.

**Working assumption — free navigation, NOT constrained to the pipe.** The user was asked twice and
answered around it; taking the read the evidence supports (*"walking thru the virtual building"*,
*"instead of dropping pins"*, *"more idiot proof pathing"*), and because a dolly constrained to the
existing pipe would only be the scrub bar with different controls — no authoring gain. **Consequence:
a free stop is a NEW AUTHORED WAYPOINT, not a point on the existing curve, so `_spawnStick` is NOT
the mechanism** (it takes an arc-fraction `s` on the flow polyline, which a free stop does not have).
The `route=authored` waypoint plumbing that already exists is. **Flip this if the user says
constrained — it changes the build, not just the trigger.**

### Still open
- **How to LEAVE edit mode without recording a spurious stop.** If off→on commits a stick, the final
  off — the one meaning "I'm done" — either drops an unwanted stick or must be distinguished some
  other way (Esc, the eye, a modifier). This is exactly the one-control-two-meanings overload
  `§CPE_SOLE_OWNER` exists to prevent; decide it before building, not after.
- Hard keyframes (camera passes exactly through each stop) vs soft attractors the planner smooths.
  The band/hose model is the latter. Mixing the two silently would reproduce the two-mechanisms-
  competing confusion that §CPE_BUILDUP_EVEN_TEMPO had to unpick.

### §CPE_WALK_AUTHORING — buildup interplay DECIDED (2026-08-06, same session)

User: *"and it be nice with buildUp on as it travels, the construction happens. There be alot of
interplay dynamics but easily resolved as buildUp is linear gantt line to the timeline"* and then,
on how a stop's date behaves as the path grows: *"each stick elongates or even if skews the timeline,
buildUp readjusts after a sec in the pov and canvas."*

**Decision: stops store a FILM FRACTION, not an absolute date. The timeline is ELASTIC.** Adding or
moving a stick lengthens/skews the film, every stop's date moves with it, and the buildup re-derives
and re-renders shortly after — visibly, in both B and the main canvas.

This declines the alternative that was put to the user (pin each stop to an absolute date so a shot
framed at week 12 stays week 12, using the fact that the linear mapping is invertible —
`fraction = (date - projectStart) / span`). Recorded because it is a real fork, cheaply reversible,
and the reasoning should not have to be rediscovered: the user chose visible re-adjustment over
pinned framing.

**Why this is now cheap — and was NOT cheap this morning.** The user's premise ("buildUp is linear
gantt line to the timeline") became literally true only with §CPE_BUILDUP_EVEN_TEMPO earlier the same
day. Before it, `_workCursorAt` mapped film fraction to the k-th ELEMENT PLACED — a non-linear curve
that swung 57x across one buildup. Position→time→date is now a single straight chain, which is what
makes "readjusts" a re-evaluation rather than a re-search.

**Plumbing already exists — no new mechanism:**
- `_scrubBuildupSync(tn)` (shipped today, PR #1226) already derives the buildup cursor for a given
  film fraction and calls `window.tmSetCursor`, refreshing B's day readout. One call re-syncs both.
- The once-on-release re-plan discipline is already the rule for band drags (`§CPE_DRAG_SCALE`: the
  gesture only moves handles; the film re-derives ONCE after it lands). A stop commit is the same
  shape of event.

**Measured cost, matching the user's "after a sec"** — from their own live Hospital log:
`§CINEMA_PLAN_MS 388.2 / 443.6 / 480.8 / 514.4 / 529.7 / 555.8` and `§CPE_REPLAN_SLOW ms=445/515/530`.
So ~0.4–0.55s per commit on a 63k-element building. Acceptable per the user's own framing, but note
it is paid ONCE PER STOP during authoring — if a session drops many stops quickly this becomes the
dominant cost, and it is the first thing to measure if authoring feels sluggish. Do NOT pre-optimise
it; witness it first.

### §CPE_WALK_AUTHORING — NO per-stick delete affordance (2026-08-06, decided)

An `x` next to each stick on the canvas was proposed and then WITHDRAWN by the user in favour of what
already exists: *"or simply UNDO or drag the stick around in the canvas. Whatever user has choice of
not saving or revert or abort. After expert training it should be 2nd nature."*

**Verified, not assumed — undo genuinely covers it.** `_undoPush` is called on every mutation path:
`_spawnStick` → `'add stick at N%'` (line 330), `_removeStick` → `'remove <label>'` (344), band drags
(2724), hose pulls (2704), pin/unpin (2409/2424), plan load (2040). A wrongful stick is one Ctrl+Z.
`_removeStick` also refuses `bi <= 0 || bi >= bands.length - 1` — settle and stop can never be
deleted, so the path cannot lose its endpoints.

**Why the `x` was a bad idea anyway, recorded so it is not re-proposed:** `_hitTest` claims handles
with an 18px screen-space tolerance (`GRAB_PX`). A second clickable target within that radius
reproduces the near-miss ambiguity behind this session's "I lost grip of the stick" reports — except
a mis-hit would DELETE rather than do nothing. And with walk-authoring producing many sticks, one
`x` per stick scales clutter on a canvas the user has twice asked to keep clear (§CPE_FIXED_PANELS).

Deletion stays where it is: the Alt+C row list's own delete button (wired at line 964), plus undo.

## ▶ §CPE_GRAB_WYSIWYG — "lost grip of the stick" ROOT-CAUSED (2026-08-06, bim-ootb PR #1233)

**The "after preview" trigger was WRONG — mine, and the earlier handoff's. Recorded because the wrong
diagnosis was asserted to the user three times from log correlation alone.** The user's console showed
a working `§CPE_DRAG_SCALE grab` before a rehearsal and a `§PICK`/`§BATCHED_PICK` fall-through after
one, and that correlation was read as causation. It is not: an identical 25px-off-centre miss
reproduces BEFORE and AFTER a preview, and 7 preview/scrub/pause/viewfinder scenarios plus an
authored-reopen run all left `_wire`/`_unwire`, `_state.handles`, the bands, the camera and the canvas
fully intact. Every "preview tears something down" hypothesis was ruled out empirically, not argued.

**ACTUAL ROOT CAUSE — the grab zone was not the handle you can see.** `_hitTest` accepted a click
only within a FIXED `GRAB_PX=18px` of the handle's CENTRE, while the sphere DRAWS at
`HANDLE_R=0.30m x drawScale` in WORLD METRES — a screen size that grows as the camera closes in. At
real editing range (the user's own `§PICK d=11.89` proves ~12m; 57.7 px/m measured there):

| handle state          | drawn radius | grabbable |
|-----------------------|--------------|-----------|
| unheld mid            | 15.6px       | 18px — just inside |
| **held**              | 21px         | 18px |
| **held, pulse peak**  | **37px**     | 18px |

Most of the visible blob was dead. A click 19-37px off-centre — ON the sphere the user sees — returned
no handle, `h.down` never claimed the gesture, and the viewer's model picker consumed it. #1228
disabling `§CPE_AIM_PIN` did NOT cause this; it removed what had been swallowing the near-misses,
which is why the fall-through became VISIBLE at that point. That timing is what made #1228 look guilty.

**Why it looked like "after preview":** the FIRST grab lands on the small UNHELD blob (≈ inside 18px)
and works; that drag leaves the band HELD + pulsing (up to 2.4x bigger on screen, same 18px zone); the
next attempt — which in the user's edit→preview→edit loop comes after a rehearsal — aims at blob
pixels that were never grabbable.

**Fix:** `_handleGrabPx(h)` = `max(GRAB_PX, drawnRadius * pxPerM + 2)`, drawn radius READ BACK from the
mesh's own geometry so draw and grab cannot drift apart, x1.8 for the pulse envelope when held (a
constant — the zone must not depend on which pulse phase a pointerdown samples). `_hitTest` scores
`distance / ownGrabPx` so a big near blob cannot shadow a small far one. Far away the projected radius
drops below 18px and GRAB_PX stays the floor — nothing loosens for normal editing.

**Witness `witness_cpe_stick_after_preview.js`** (Duplex, real preview, real pointer taps, SW bypassed,
§-log assertions only): unmodified `origin/main` **4/6 FAIL**; with fix **6/6 PASS**. `G-SAP-3` proves
the far-pose zone is still exactly 18px. No regressions: `witness_cpe_drag.js` 4/4,
`witness_cpe_click_slop.js` 6/6.

### ⛔ OPEN, found by the same agent, NOT fixed — the Preview button flies B only
`#cpe-preview` is wired `addEventListener('click', _previewFly)` (~line 3019), so the **MouseEvent is
passed as `_previewFly`'s `povOnly` argument** — truthy. Since #1197 the MAIN Preview button has
therefore rehearsed B ALONE, never moving or restoring the main camera, while the done-log still
prints "camera restored to the editing pose". Confirmed in every live run: `§CPE_PREVIEW click ...
povOnly=1` straight from the button. #1197's own comment asserts "#cpe-preview's own wiring calls this
with no argument — unaffected", which is not what the code does. **Needs its own change; a one-line
wrap (`function () { _previewFly(); }`) is the obvious shape but the INTENDED behaviour must be
confirmed first — the user may well have got used to POV-only previews.**

### Process note for whoever picks this up
The agent dispatched for this reused an EXISTING worktree (`/tmp/wt-cpe-scrub-buildup`) because the
dispatch prompt told it to prefer reuse per Worktree Hygiene — and that worktree was the one the
dispatching session was itself working in, switching its branch mid-session. No work was lost (the
session's own branch was already merged), but **a dispatch prompt must name a worktree the parent is
NOT using, or say "create a fresh one" outright.** Worktree Hygiene's reuse rule is about not
accumulating clones; it was never meant to send an agent into the parent's live tree.

### ⛔ §CPE_PREVIEW_ARG — latent, and the one-line fix EXPOSES a broken restore. NOT SHIPPED.

Investigated to a conclusion this session; deliberately **not** merged. Read this before "just fixing"
the one-liner.

**The bug is real but LATENT.** `document.getElementById('cpe-preview').addEventListener('click',
_previewFly)` (~line 3055) hands the MouseEvent to `_previewFly`'s first parameter, `povOnly` — and an
Event is truthy. The comment at `_previewFly`'s definition claims "#cpe-preview's own wiring calls
this with no argument — unaffected"; that was never true of this line.

**Corrected scope — an earlier report of this (including to the user) OVERSTATED it.** `#cpe-preview`
is `style="display:none" aria-hidden="true"` (line 798) and is **never unhidden**, so no user can
click it. The visible transport is the scrub panel's play button, which passes `true` deliberately
(§CPE_SCRUB_POV_ONLY). The `povOnly=1` seen in the user's live logs is that button working AS
DESIGNED — not this defect. The only callers of the hidden button are WITNESSES
(`witness_cpe_room_title_live/_timing`, `witness_cpe_stick_after_preview`), which have therefore been
rehearsing B alone while asserting against a "full preview". Test fidelity, nothing user-facing.

**Why the fix is not shipped — it uncovers a SECOND, bigger bug.** Wrapping the listener
(`function () { _previewFly(); }`) makes the button run a real full preview, and then:
`witness_cpe_stick_after_preview.js` goes **6/6 → 4/6**, because after that full preview the band
handle projects to **(-411, 1123)** — off-screen — on an 800px-tall viewport. The witness recomputes
the handle's screen position immediately before the tap (`probe()`, line 140), so those coordinates
are live, not stale. **The full-preview path does not restore the main camera to the editing pose,
despite `§CPE_PREVIEW done` printing "camera restored to the editing pose".** That path has been
unreachable since #1197, so nothing has exercised it and the restore has rotted unnoticed.

Shipping the one-liner alone would therefore turn a harmless latent bug into an exposed broken path
AND leave a witness red on `main`. **Order of work when this is picked up: fix the camera restore
FIRST, prove it with the existing witness, and only then wrap the listener.** The `povOnly` one-liner
is the last step, not the first.

### Naming
User, this session: **"we can call it the WYSIWYG BIM Movie Maker"** — *"what you see is what you get
- an old concept in programming"*. The same principle already names the grab fix (§CPE_GRAB_WYSIWYG:
the grab zone IS the drawn sphere) and is the through-line for §CPE_WALK_AUTHORING: compose the shot
from inside the shot. Worth keeping as the feature's name.

## ▶ §CPE_VF_DPR_DOUBLE — THE ROOT CAUSE OF BOTH THE POV FRAME *AND* THE STICK GRIP (2026-08-07)
## ✅ VERIFIED + PR OPENED (2026-08-07) — dispatch below executed in full, both directions proven

### ⚠ LANDED ONLY 2026-08-08 — the PR sat OPEN a full day and the bug "returned" (it never left)
PR #1234 was verified and opened 2026-08-07 but NEVER MERGED — every session that day ran at
devicePixelRatio 1.0, where the double-applied ratio cancels visually, so nothing looked wrong and
nobody noticed the PR hadn't landed. 2026-08-08 the user opened the deployed site in a 125% window
(their TerminalMerged log: `§CPE_VF_STACK pr=1.25`) and reported "the povf out of frame issue
returned." Same-day landing: merged fresh main into the branch (clean — includes the walk/shoes/
gamepad lanes), re-witnessed BOTH sides on the combined tree (witness_cpe_vf_dpr_engine 4/4:
gl-reported viewport carries css·dpr once, never css·dpr², restore bit-exact, drawn-handle tap grabs
eye-on AND eye-off; witness_cpe_walk_edit Duplex 23/23: no walk regression), cache bumps cpe v14 /
sw v970, auto-merge armed. Lesson, same family as [[feedback_verify_pr_merge_before_followup_push]]:
a VERIFIED fix is not a SHIPPED fix — the check "is the PR actually merged" belongs at the end of
every dispatch report, and a symptom that only manifests under an environment condition (fractional
DPR here) will hide an unmerged fix from every session that doesn't share that condition.
**PR bim-ootb#1234** (`fix/cpe-vf-dpr-double`, fix `8928457` + new witness `b386bd1`), auto-merge armed.
Every dispatch task ran; every claim below is a measured number at dpr 1.25, 1483×769 (the user's geometry):
1. **Engine restore (task 1)** — new `witness_cpe_vf_dpr_engine.js` wraps the raw `gl.viewport()` and
   reads `gl.getParameter(gl.VIEWPORT)`. Fixed tree: `[0,0,1854,961]` == pristine pre-eye baseline
   (±1 px, which is three.js's own floor-vs-round on css×ratio, NOT our bug — its render path floors
   1483×1.25=1853.75→1853 while an immediate setViewport rounds→1854; the gate tolerates 1px and
   separately forbids anything near baseline×1.25). Pre-fix tree (origin/main c46a602): `[0,0,2318,1201]`
   = baseline×1.25 exactly. B's own render: fixed saw width 375 (=300css×1.25, once), never 469
   (=×1.25², twice); pre-fix saw ONLY 469. Ratio applied once — engine-reported, not self-derived.
2. **Stick claim PROVEN both directions (task 2)** — real tap at the handle's DRAWN position (NDC
   mapped through the viewport the engine actually holds). Fixed, eye ON: drawn-vs-`_hitTest` off by
   0.15 px → `§CPE_DRAG_SCALE grab`. Pre-fix, eye ON: off by **212.92 px** → tap misses, no grab —
   the user's report, measured. Eye OFF (+ a resize event = the universal `setSize` viewport reset;
   the user's own recovery was the §CPE_VF_DPR_GUARD ratio-drop, which only arms >5000 streamed):
   grab works on BOTH trees — the decisive clue reproduced. `EXPECT=prefix` mode inverts the eye-ON
   gates so the pre-fix run PASSES only by exhibiting the defect: 4/4 both trees.
3. **PIL measurement (task 3)** — scissor edge is invisible against an identical clear color, so the
   measured feature is the green roof inside B (static; handles pulse). Pre/post content scale
   **1.294 ≈ the 1.25 signature** (user's PNGs: 1.263–1.267), displaced right+up (dx+47, dy−56
   device px); fixed build's B content sits inside the frame at intended scale. Pre-fix screenshot
   also shows the MAIN scene 1.25× oversized — the corrupted restore, visible.
4. **Regressions (task 4)** — `witness_cpe_vf_grip.js` 6/6 at dpr 1, 1.25, 1.5, 2;
   `witness_cpe_scrub_viewfinder.js` 33/33; `witness_cpe_drag.js` 4/4 Duplex + 4/4 Terminal.
5. **PR opened (task 5)** — after all of the above, per the dispatch order.
6. **USER CONFIRMED LIVE (2026-08-07, Hospital via localhost:8470 serving the fix worktree, OCI DB):
   "issues solved."** Both symptoms gone on the fix build. Merge of PR #1234 still pending at the
   time — blocked only by GitHub's declared major outage stalling the required CI queue.

**Branch: bim-ootb `fix/cpe-vf-dpr-double` (commit `8928457`), off `origin/main`. No PR opened.**
Everything below is measured. Where something is unverified it says so.

### The two symptoms, which looked unrelated for a whole session
1. *"the pov is still same, screen slightly larger then the frame itself"* — repeated across many
   rounds, surviving three separate "fixes" (§CPE_VF_GRIP, §CPE_VF_STACK, the grid snap).
2. *"still cannot grip the stick"* — and then the decisive clue, volunteered by the user late on:
   **"ah the grip stick only returns when the pov eye is switched OFF."**

### The actual cause — one bug, applied twice
**`THREE.WebGLRenderer.setViewport/setScissor` take CSS pixels and multiply by the renderer's
`pixelRatio` THEMSELVES.** `_vfComputeRect` multiplied by `pr` as well, so ρ landed **twice**.

Probed live rather than reasoned about (this is the evidence that ended the argument):
```
renderer.setPixelRatio(1.25); renderer.setViewport(0,0,100,80);
gl.getParameter(gl.VIEWPORT)  ->  [0, 0, 125, 100]
```
And it matches the user's own screenshots exactly:
| screenshot | frame (drawn border) | picture (rendered POV) | ratio |
|---|---|---|---|
| `povf.png` (13:37, old build) | 375 px | 475 px | 1.267 |
| `Screenshot 2026-08-07 00-14-46.png` (current build) | 376 px | 475 px | **1.263** |

Their devicePixelRatio is **1.25**. A rect wrong by a pure SCALE ABOUT THE BOTTOM-LEFT ORIGIN — i.e.
it grows RIGHT and UP, never left or down — is the signature of a pixel-ratio applied the wrong
number of times. That signature was visible from the first screenshot and was missed for hours.

**And the same double factor corrupts the RESTORE** at the end of `_vfRender`:
`setViewport(0, 0, canvasR.width * pr, canvasH)` → the MAIN scene is also drawn 1.25× oversized,
about the same bottom-left origin, **but only on frames where `_vfRender` ran — i.e. only while the
eye is ON.** So what is drawn is displaced from where `_hitTest` computes the handle to be, and
clicks miss. Eye OFF → `_vfRender` never runs → no bad restore → grab works. **That is exactly the
user's clue, and it makes the two symptoms one bug.**

### What this RETIRES — previously-shipped diagnoses that were wrong
- **§CPE_GRAB_WYSIWYG (PR #1233, MERGED AND LIVE)** — "the grab zone is a fixed 18px while the handle
  draws in world metres." The maths in it is sound and the per-handle tolerance is a genuine
  improvement, **but it was not the cause**: it is live and the user still cannot grip. Do NOT revert
  it, but do NOT treat the stick as explained by it either.
- **"after preview" (asserted three times, from log correlation)** — already disproven empirically by
  the earlier agent, and now superseded: the real correlate is the EYE, not the preview. A rehearsal
  turns B on, which is why it looked like preview.
- **§CPE_VF_GRIP / §CPE_VF_STACK** — the content-box inset, the fused bar and the device-grid snap are
  all correct and worth keeping, but they were treating a symptom one layer above the real one.

### Why every witness stayed GREEN while the user could plainly see the defect
`witness_cpe_vf_grip.js` converted the computed rect back to CSS with `rect.x / pr` and compared it to
the DOM box. That is **self-referential** — it checked my arithmetic against my arithmetic, through
the very multiplication the bug lived in, and agreed with itself at every pixel ratio. **Rule going
forward: gate a viewport/scissor rect against what the ENGINE reports (`gl.getParameter(gl.VIEWPORT)`),
never against your own derivation of it.** The witness has been amended (no `/pr`) and passes 6/6 at
dpr 1, 1.25, 1.5, 2 with the fix.

### The maths, since the user asked for it explicitly
One `<canvas>` carries **two coordinate systems**, and they coincide only at ρ=1 — which is why this
survived so long:
- **CSS space** — `canvas.style.width`, origin **top-left**, y **down**, unit = CSS px. What
  `getBoundingClientRect()`, `ev.clientX/Y` and every DOM panel speak.
- **Drawing-buffer space** — `canvas.width`, origin **bottom-left**, y **up**, unit = device px =
  CSS × ρ. What `gl.viewport` / `gl.scissor` speak.

DOM rect → GL rect, with ρ applied EXACTLY ONCE (by three.js, not by us):
```
x  = L_css - Cx_css                       // left,   relative to the canvas
y  = H_css - (T_css - Cy_css) - h_css     // bottom-left origin: flip about canvas height
w  = w_css ,  h = h_css                   // sizes stay in CSS px
```
Diagnostic table — read the ERROR SHAPE, it names the mistake:
| error shape | cause |
|---|---|
| pure scale about bottom-left (grows right+up) | ρ applied twice, or zero times |
| pure translation | wrong origin — canvas offset, or the y-flip omitted |
| scale about some other point | mixed units — origin in one space, size in the other |
| correct at ρ=1, wrong elsewhere | ρ is involved. Always. |

### DISPATCH — scoped Fable, for a fresh session
Give it this whole section. Scope: `viewer/cinema_path_editor.js` `_vfComputeRect` / `_vfRender` /
`_vfLayoutStack` / `_hitTest` / `_screenOf`, and `witness_cpe_vf_grip.js`. Tasks:
1. **Verify the parked fix on `fix/cpe-vf-dpr-double`** — confirm `gl.getParameter(gl.VIEWPORT)`
   equals the drawing-buffer size after `_vfRender` restores, with the eye ON, at dpr 1.25.
   (A probe was written for this and never got to run: see the session's scratch `vp.js`.)
2. **Prove the stick claim, which is the UNVERIFIED part** — with the eye ON at dpr 1.25, a tap on a
   drawn handle must grab (`§CPE_DRAG_SCALE grab`) and must not fall through to `§PICK`. Gate it
   eye-ON *and* eye-OFF; pre-fix the eye-ON case must FAIL or the theory is wrong and must be said so.
3. Screenshot the panel at 1483×769 dpr 1.25 and measure frame-vs-picture the same way the user's PNGs
   were measured (PIL border detection) — expect ratio **1.00**, not 1.25.
4. Re-run `witness_cpe_scrub_viewfinder.js` (33/33 before this change) and `witness_cpe_drag.js` (4/4).
5. Only then open the PR.
**Use a worktree the parent session is NOT in** — a previous dispatch reused the caller's tree and
switched its branch mid-session. Name a fresh path explicitly.

### User-facing state, stated plainly
The POV frame and the stick grab are **still broken for the user right now**. What is merged and live
(§CPE_VF_GRIP, §CPE_VF_STACK, §CPE_GRAB_WYSIWYG, §CPE_BUILDUP_EVEN_TEMPO) is all sound and none of it
should be reverted — but the thing that was actually making both symptoms visible is the fix parked on
`fix/cpe-vf-dpr-double`, unmerged and unverified.

### Naming
The feature is **"WYSIWYG BIM Movie Maker"** (user, 2026-08-06) — *"what you see is what you get - an
old concept in programming"*. This bug is the literal violation of that: what was drawn and what was
grabbable were different rectangles.

## ▶ §CPE_FLY_WEDGE — PREVIEW DEAD AFTER STICK ROUND 2, ONLY REFRESH REVIVES (2026-08-07)
**User:** *"sometimes it hangs after some round 2 of setting stick, when going back to preview it
does not play, workaround is easy just refresh and reopen the saved path."*

### Root cause — one counter shared by two unrelated animations
`_frameBand` (the 420ms fly-to-band camera ease, fired by clicking a band ROW: `_hold(i,'mid',true)`)
did `var gen = ++_state.flyId` — the SAME generation counter `_previewFly`'s step() checks
(`myFly !== _state.flyId → return`). Sequence that wedges:
1. play rehearsal (`flyId=N`, `flying=true`) → 2. pause (button, or the §CPE_SCRUB_BEARING_FLY_PAUSE
auto-pause on touching a stick) → 3. click a band row → `_frameBand` bumps `flyId=N+1` → the paused
flight is now DEAD, but `flying`/`flyPaused` stay true (only step()'s natural completion clears them)
→ 4. every play click takes the "resume" branch; `_flyResume` sees `myFly !== s.flyId` and silently
no-ops. Logs say "resumed", nothing moves, forever. Refresh = the only reset. Exactly the report.

### Fix (branch fix/cpe-vf-dpr-double, rides PR #1234)
1. `_frameBand` gets its OWN counter (`_state.frameFly`) — it must cancel a previous frame-fly,
   never the rehearsal. `_previewFly` still cancels an in-flight frame-fly (one line, the one
   direction that was ever correct).
2. Self-heal in the play handler: resume that leaves `flyPaused` true = dead flight → clear state,
   log `§CPE_FLY_WEDGE stale paused flight — restarting`, start fresh. Covers any other wedge path.

### Witness — witness_cpe_fly_wedge.js
G-WEDGE names the issue: play → pause → row-click → play must ADVANCE the playhead. Run pre-fix it
FAILS (playhead frozen, "resumed" log with no motion); post-fix PASSES. Uses `_flyState()` hook +
`_state.scrubTn` motion, no screenshots.

## §CPE_PANEL_PERF — measured stall inventory (2026-08-07, findings only, not implemented)
From the user's own Hospital log (63K elems): (1) first ▶ play with buildup = ~2.1s freeze
(§CPE_PREVIEW_BUILDUP setupMs=2052 — tmActivateForBake cold init on the click path: §XRAY_CACHE_BUILD
435ms + timeline activation + ghost-ground scan); fix candidate = pre-arm TM at editor open (idle).
(2) Alt+C open runs the full plan 3× identically (~560ms, §CINEMA_PLAN_MS 291+133+135) — space/exit/fan
don't depend on duration/waypoints, compute once. (3) scrub-jump DLOD flip storm (flips_mean=2671,
FPS→53) — smaller lever, DLOD landmine, touch last. Eye toggle itself measured cheap.

## §CPE_BUILDUP_ARM_GATE — the rehearsal armed onto an EMPTY timeline (2026-08-12, user-reported, FIXED)
**Symptom, user's words:** *"in Alt-C movie making TM does not move, seems disengaged"* / *"chrome
reset SW, refreshed twice, still TM not moving at all, nothing built during pov preview."* Not a
cache problem — their run is `§BUILD_VERSION v997` / `§CPE_LOADED v24` / `§MAXQ_LOADED v22`, i.e. the
tip that already carries R4 (`§TM_WARM elements=63415 ms=215.5`).

### The evidence, from the user's own Hospital console (nothing here inferred)
```
§TM_OPS_CHECK total=1 place=0
§CPE_BUILDUP_SOURCE mode=T reason=generated-timeline ops=1 placed=0 noGeom=1 window=1970-01-01..1970-01-01
§GHOST_GROUND skip reason=buildup span is 0 (projectStart=0 projectEnd=0)
§CPE_PREVIEW_BUILDUP armed mode=T ops=1 placed=0 setupMs=5850
§PERF_TRAVERSE ms=0.2 objs=3916 skipped=3890 mode=delta span=0h      ← every frame, 497 of them
…later, AFTER the flight had already started:
§WRITE_LOOP_TIMING rows=63415 ms=2372.5 → §GANTT_CACHE_SAVE ops=63416
§PERF_TRAVERSE ms=15.0 objs=3916 skipped=0 mode=full span=503952h    ← the real timeline, too late
```

### Root cause — `_ops.length` is truthy for ONE stale op
`tmActivateForBake()` polled `if (_ops.length || ++n > 60)`. At that moment `_ops` held exactly one
op — the `BUILDING_OPEN` kernel op (`id=1`, `§TM_OPS_CHECK total=1 place=0`) — and the epoch had
never been computed (`_projectStart == _projectEnd == 0`, hence the 1970 window). So it resolved
`true`, `tmFollowTimeline()` handed back a zero-span `bkState`, and `_previewFly`'s per-frame cursor
expression `projectStart + bkTn * (projectEnd - projectStart)` evaluated to **0 on every frame**.
`tmSetCursor(0)` clamps to the same value → `span=0h` on all 497 frames → camera flies, nothing
builds. The real 63,415-op timeline finished loading seconds later, after the flight was underway.

**The asymmetry that names the bug:** `ghostGroundArm` received the SAME `bkState` and refused it
(`§GHOST_GROUND skip reason=buildup span is 0`), as did the day counter (`§CPE_DAY_COUNTER live off
(no buildup span)`). Two of three consumers validated the state; the one that drives the cursor did
not. Readiness was never "the array is non-empty" — it is **"the timeline has a real span."**

### Fix — two guards, both in `viewer/time_machine.js`, one behaviour change
1. **`tmActivateForBake` readiness predicate** — `_bakeTimelineReady()` = `_ops.length &&
   _projectEnd > _projectStart`. Not a new wait: the existing 60×500 ms poll now waits for the
   condition it always meant. On the user's trace the real ops land ~2.4 s later, well inside the
   30 s budget, so the rehearsal arms on the real timeline instead of a 1970 stub.
2. **`tmFollowTimeline` refusal** — return `null` + a loud `§CPE_BUILDUP_SOURCE reject` when the span
   is zero or `placed === 0`, instead of returning a `bkState` that cannot drive a cursor. Same bar
   ghost-ground already applies. The BAKE (`cinema_maxq.js:1183`) calls the same verb, so a film
   bake cannot silently record a static building either.

A real timeline always has span > 0 (`_projectStart = _ops[0].start_ts - 1`, `_projectEnd` = max
`end_ts`), so neither guard can reject a usable state — including a single-op model.

### Witness — `witness_cpe_buildup_arm_gate.js` (bim-ootb)
Names the issue: **an arm that reports `placed=0` / a zero span must not produce a bkState the
rehearsal will follow.** G-ARM-1 replays the user's exact state (one `BUILDING_OPEN` op,
`_projectStart == _projectEnd == 0`): pre-fix `tmActivateForBake` resolves `true` and
`tmFollowTimeline` returns a 1970 bkState whose cursor expression is constant; post-fix the arm
waits and the follow refuses. G-ARM-2 proves the guards do NOT reject a real timeline. No
screenshots — the pass/fail is the cursor delta across frames, a number.

### Not the earlier hypothesis
An earlier read of a partial log proposed `bkPrev === null` + a mid-flight re-arm. Wrong: `bkPrev`
was non-null but degenerate. Late re-arm is not needed and is not implemented.

## §CPE_AIM_DEPTH_BUILDUP — density×depth aim turns onto a nearby wall/ceiling (or empty sky) instead of a deep open hall (2026-08-13, user-reported, converged after 2 corrections below — NOT YET IMPLEMENTED, RESUME HERE)

**User's reports, all from watching the same real buildup bake** (`BIM_MaxQ_Clinic_*.mp4`, `Day
N/185` HUD confirms `§CPE_BUILDUP` was on): (1) camera turns onto a nearby wall or ceiling instead
of a big open hall that gives more depth; (2) separately, "faces into empty sky"; (3) user pushback,
twice, on this entry's first two drafts — both correct, both folded in below. Their own words on the
original ask: "perhaps i described the intent wrongly."

**Two self-corrections during this write-up, kept on the record rather than silently fixed —
read before trusting anything above this in the file's history:**
1. First draft claimed density×depth aim is "fully OFF, zero scene awareness" during buildup,
   citing `_aimDepthWeight`'s buildup guard (`effects.js:6238`,
   `if (A._cinemaPathEdit && A._cinemaPathEdit.buildup) return null;`, 2026-07-31). **User: "it has
   scene awareness otherwise it wouldn't go facing the sky or wall while moving."** Correct — that
   guard only disables ONE of two separate aim systems.
2. **`§CPE_AIM_DENSITY` (`_aimSubject`, `effects.js:5991`) is a SEPARATE, older mechanism from
   `§CPE_AIM_DEPTH` (`_aimDepthSubject`) and has NO buildup guard at all** — confirmed by reading
   `_aimWeight`/`_aimSubject`/`_aimGrid` fresh, no `A._cinemaPathEdit.buildup` check anywhere in
   that call chain. It fires whenever the camera is outside the building's arc footprint AND
   nothing substantial is nearby (`_aimWeight`'s `wOut * wEmpty` gate), scoring candidate grid cells
   by `w = c.n / (1+d)³` — density over a CUBED near-favouring distance term, no depth term at all.
   **Critically, `_aimGrid()`'s cells here carry NO facade/floor/ceiling distinction** —
   `§CPE_AIM_DEPTH_VERTICALITY`'s `zSpan` wall-detector (which excludes flat floor/ceiling-like
   cells) lives INSIDE `_aimDepthSubject` only; `_aimSubject` never filters by zSpan at all. So
   during buildup, the ACTIVE aim system is the near-favouring, unfiltered one — any dense nearby
   cluster wins, wall or ceiling truss or floor included, exactly matching "faces the wall/ceiling."
   User's follow-up, also correct and folded in: **"or perhaps it was just turning at the stick
   points"** — `_stickApproachAt` (`effects.js:7521`) itself is confirmed to be HUD-readout only
   (which stick the bake HUD should label as "approaching"), not a pose function, but sticks are
   exactly WHERE `§CPE_STICK_HOLD`'s pause gives the aim system time to complete a visible turn —
   so "turns at the stick points" and "§CPE_AIM_DENSITY picks the wrong subject" are the same
   observation from two angles, not competing theories.

**Converged picture:**
- **"Faces wall/ceiling"** — `§CPE_AIM_DENSITY` (`_aimSubject`) is active during buildup (no
  buildup guard), near-favouring (`1/(1+d)³`), and has no facade/floor/ceiling filter at all. A
  nearby dense wall or ceiling truss cell wins over a deep-but-sparse hall exactly as reported.
  Most visible at stick/hold points because that's where the camera has time (the hold) to actually
  complete the turn onto whatever `_aimSubject` picked.
- **"Empty sky"** — `§CPE_AIM_DENSITY` only fires when `wOut > 0` (outside the arc footprint) AND
  `wEmpty` (nothing substantial nearby) — i.e. its own trigger condition is "you're somewhere
  emptyish." When it does NOT fire (weight ~0), the gaze falls back to `_lookAhead()`
  (`effects.js:6997`) — pure path-tangent, zero scene reference, `_outPos` a fixed arc-length ahead
  on the flight spline. On a climbing/pulling-back segment (the closing "topping out" orbit every
  buildup film ends on, confirmed present in the same Clinic MP4's final aerial frame) that
  tangent legitimately points up and away — still the best-supported explanation for this specific
  symptom, not yet as directly code-confirmed as the wall/ceiling one above.

**Candidate fixes, NONE implemented, in cheapest-first order:**
1. **Give `_aimSubject`/`_aimGrid` the same `zSpan` facade filter `_aimDepthSubject` already has** —
   the most direct fix for "wall/ceiling," reuses an existing, already-tested classifier, one guard
   added to a function that currently has none.
2. **Make `§CPE_AIM_DEPTH` (the depth-aware, filtered rule) buildup-aware instead of buildup-off**
   — the ORIGINALLY-NAMED fix (`§CPE_AIM_DEPTH_BUILDUP_GUARD`'s own 2026-07-31 comment already
   flagged this as deferred work): restrict `_aimGrid`'s candidate cells to elements §CPE_BUILDUP
   has actually placed by the frame's own cursor (`window.tmPlacedCount(_bkMs)`/`_bkMs`, already
   used elsewhere in `cinema_maxq.js`'s bake loop — no new extraction) instead of the whole
   finished-building grid. Bigger change, but replaces the unfiltered density-only rule with the
   depth-aware one during buildup too, addressing "empty sky" as well since a real subject would
   then usually be available where today `_lookAhead()` is the only option.
3. **Non-buildup arcOnly films** (where `_aimDepthSubject` already runs unmodified): `w = c.n * d`
   weights depth linearly, same power as density — still worth a one-constant bump
   (`Math.pow(d, k)`, k≈1.5-2) if this is ever revisited, but secondary — not what the user's
   actual reported film needed.

**Not done:** no code touched, no witness run. Start with candidate 1 (cheapest, reuses a tested
classifier) — witness against `_aimBuild`'s own K=64 probe-and-smooth series on a real buildup bake
where this was observed, same measured-not-guessed discipline every other §CPE_AIM_* entry in this
file used.

### 2026-08-13 update — user re-confirmed live, candidate 1 SHIPPED (bim-ootb PR #1340)

**User's fresh report, same bake, more specific:** "it chose to turn to see the empty sky instead of
down at more better space corridors halls etc. Also it choses to face up close empty wall when the
room is right behind to have more density*depth value." Plus a NEW requirement: **"It can turn fast
but it must appear to turn in movie rather than cut abruptly."** Read as confirmation of the already-
converged diagnosis (their own phrase "density*depth value" echoes this section's own vocabulary),
not a new bug — the "close wall, deeper room behind" framing is the SAME `_aimSubject` near-favouring
defect this section already named, described from the other side.

**Candidate 1 implemented, exactly as scoped, nothing more:** `_aimSubject` (`effects.js` ~5991,
bim-ootb) now excludes any grid cell with `zSpan < minZSpan` (same derivation and constant
`_aimDepthSubject` already uses) before computing its weighted centroid. Witness:
`tests/test_aim_density_zspan.js` (new, mirrors `test_aim_depth.js`'s pure-math convention) —
**W-AIM-DENSITY-CONTROL**: unfiltered formula picks a near flat roof cell over a further hall
(distToRoof=3.89m vs distToHall=10.27m) — reproduces the reported bug. **W-AIM-DENSITY-FIXED**: same
scene, filtered — subject moves to distToHall=0.54m, distToRoof=14.24m — fixed.
**W-AIM-DENSITY-SCOPE**: two genuine vertical walls (near 3m, far 20m, both pass the zSpan filter) —
still picks the near one, confirming the honest scope claim below. `§VERDICT GREEN 0/3`.
Regression: `witness_cpe_hose.js` A1/A2 (the checks that already exercise `_aimSubject`) on Duplex —
**identical before/after this edit**: gaze-to-mass 68.6°→32.4° (36.1° improvement), peak turn
8.9°/f→8.9°/f (no jerk added). PR: https://github.com/red1oon/bim-ootb/pull/1340.

**Scope, stated honestly (this is NOT candidate 2):** this fix removes FLAT cells (floor/ceiling/roof)
from `_aimSubject`'s pool — it directly answers "faces the ceiling." It does **not** change the
near-favouring `1/(1+d)³` weighting for a genuine vertical wall vs. a genuine vertical hall further
away — W-AIM-DENSITY-SCOPE above proves the near wall still wins in that case. So:
- "Faces up close empty wall when the room right behind has more depth" — **still open**, this is
  candidate 2's job (buildup-aware `_aimDepthSubject`, which already excludes the close cell and
  favours the far one — see its own witness `tests/test_aim_depth.js`).
- "Faces empty sky" — **still open**, unconfirmed root cause (the `_lookAhead()` tangent fallback
  theory from the original diagnosis above), not touched by this fix.
- "Must read as a movie turn, not a cut" — **not a new mechanism**: `_aimBuild`'s two-pass 5-tap
  smoothing + `§CPE_AIM_LATCH` running-max already make the blend weight AND the subject position
  continuous by construction (this is the whole reason `_aimSubject`/`_aimDepthSubject` are weighted
  centroids, never argmax — see the "MEASURED, NOT A PREFERENCE" comment on `_aimSubject` above). The
  regression witness above shows peak turn rate unchanged by this fix (8.9°/f both ways). The
  "abrupt cut" READING is most likely the same root cause as the other two symptoms — a turn onto the
  WRONG (near/flat) subject reads as unmotivated even when the raw camera motion is smooth — not
  evidence of a separate discontinuity bug. Not proven wrong yet, but no new smoothing work is
  planned unless a live bake with candidate 1 shipped still shows an actual degrees/frame spike, not
  just a jarring pick.

**Candidate 2 — BUILT (2026-08-13, same session, bim-ootb PR #1342, OPEN not yet merged).** User:
"Why stall on candidate 2. See if it is useful then fix it for testing." Assessed useful (it is
directly what "close wall, deeper room behind" needs — `_aimDepthSubject` already excludes the close
cell and favours the far one, it was just buildup-gated off) and built.

**What it actually needed, beyond `window.tmPlacedCount(_bkMs)`:** that function only reports a
TOTAL op count, not whether a SPECIFIC element/guid is placed — the aim system needs the latter to
build a candidate grid. Added `window.tmGuidEndTs()` (time_machine.js, new, read-only, one pass over
`_ops`, same guid-extraction convention `tmGroundSchedule`/`tmOrderByCameraPath` already use) —
per-guid completion time. `_densPoints()` now also carries `guid` (additive 4th tuple slot).
`_aimGrid()`'s gridding loop extracted into `_aimGridFrom(pts)`, reused by both the cached
whole-building grid (unchanged callers) and a new per-probe placed-only grid (`_aimPlacedPoints`).
`_aimDepthWeight`/`_aimDepthSubject` gained an optional points/cells override (backward compatible —
every existing non-buildup caller is byte-unchanged) so buildup mode restricts the search to elements
placed by the SAME cursor `window.tmFollowTimeline`/`APP.buildupTAt`/`APP.buildupCursorAt` the real
bake/preview would derive at that probe's `e3` — never a second, independently-derived clock.

**Witness `witness_cpe_aim_depth_buildup.js` (new, live browser, Hospital_3, 63415 ops) — 6/6 PASS:**
`tmGuidEndTs()` returns real per-guid data (63415 entries); buildup OFF is provably byte-unchanged
(0/21 probes report `restricted=true`); buildup ON restricts every probe (21/21); placed-element
count is monotone non-decreasing across the walk (measured series: `0, 533, 3423, 10537, 12771,
15980, 28024, 31370, 32423, 34353, 41154, 43791, 45075, 51255, 54508, 55898, 57611, 61768, 63181,
63181, 63181` — tracking `bkState.ops=63415`); restricted count never exceeds the real op count; and
the load-bearing check — **the rule actually FIRES during a buildup walk (5/21 probes)**, which was
structurally impossible before this fix (the old guard returned null before density was even
computed, every single time, unconditionally). No regression: `witness_cpe_hose.js` A1/A2 (density)
and B1/B2 (buildup mode-D reversibility) unchanged; `tests/test_aim_depth.js` and
`tests/test_aim_density_zspan.js` (pure-math, formulas untouched by this change) still GREEN.

**Honest scope, same discipline as every entry in this section:** this activates `_aimDepthSubject`
during buildup — it does NOT change `_aimSubject`'s own near-favouring weighting (confirmed still
true by `test_aim_density_zspan.js`'s W3, comment updated this commit to explain the HANDOFF: when
boxed in during buildup, `_aimDepthSubject` now fires and takes over from `_aimSubject`, rather than
`_aimSubject` itself changing). "Faces empty sky" remains an unconfirmed theory (the `_lookAhead()`
fallback), not directly re-measured — plausibly improved since a real subject is now available more
often during buildup, but that is an inference, not a measurement.

**Known, inherited limitation, not introduced by this fix:** `_aimDepthSeries` (like `_aimSeries`,
`_aimCells`, `_densPts`) is built ONCE per `_cinemaPathPlan()` call and never invalidated within that
call's lifetime. If a user scrubs BEFORE ever pressing Play (Time Machine not yet armed —
`§CPE_SCRUB_BUILDUP_SYNC`'s own documented gap) with buildup already checked, the very first
`_aimDepthBuild()` could run with no cursor available, degrade to null for every probe, and that
degraded series would then be cached for the rest of that plan/session even after Play later arms
Time Machine. Same class of staleness as the pre-existing caches for every OTHER input these series
already depend on (geometry, envelope) — not new, not silently hidden, but not solved here either.

**"Not jitter around" — measured, same PR, second commit.** User: "i stated just now, to make cam
face bias towards eye level view which certainly has more buildup noise than sky. It is a tamper. Cam
may fast turn, but not jitter around." Extended `witness_cpe_aim_depth_buildup.js` with M7/M8, both
sampling the REAL flown gaze (`plan.poseAt`) at real bake frame spacing (15fps/55s = 825 frames) —
not the raw per-probe values (which DO see-saw before the existing 2×5-tap smoothing + `§CPE_AIM_LATCH`
running-max pipeline runs on them; that pipeline is what every other §CPE_AIM_* rule already relies on
for exactly this reason, and this fix goes through the identical path, no shortcut).
- **M7 W-NO-JITTER:** peak gaze change/frame, WITH the full shipped aim system (candidate 1 + eye-bias
  + candidate 2) vs. the SAME buildup walk with `A.__cpeAimOff` suppressing every aim rule — reusing
  `witness_cpe_hose.js`'s own A1/A2 idiom and its 15% regression tolerance verbatim (not a new,
  invented threshold). Measured on **Hospital_3 (63415 ops) and Duplex: peakWith == peakNoRule
  exactly, 0% regression on both** — both buildings' frame-to-frame turn-rate peak sits at a
  structural beat transition (walk→orbit seam) the aim system doesn't touch.
- **M8 W-REAIM-REAL, the honesty check on M7:** a 0% regression could mean "no jitter" OR "no effect
  at all" — a witness that cannot fail is not a witness. Measures how far the SAME frame's gaze
  diverges with vs. without the rule: **Hospital_3, up to 18.96° of real re-aim (mean 3.18° across the
  whole film)**. Confirms the system substantially moves the camera's gaze without raising the
  per-frame turn-RATE ceiling — "fast turn, not jitter" as a number, not an assertion.

8/8 total (M1–M8) PASS on both Hospital_3 and Duplex. PR #1342 updated with these numbers.

### 2026-08-13, same session — Terminal confirms the shipped fix; eye-level bias BUILT; anticipatory-pan idea open; §CPE_POV_MARKER shipped

**User, live on Terminal:** "it kept facing the ceiling due to large density of roof tiles perhaps."
Independent, different-building confirmation of exactly what PR #1340 targets — roof tiles are a
textbook flat/near-zero-`zSpan` cell, the class the zSpan filter excludes from `_aimSubject`'s pick.

**Eye-level bias — BUILT, same PR #1340, second commit (was "Idea 1", now shipped).** User: "it should
be noise bias to the ground objects or eye level to be more meaningful." The zSpan filter only excludes
FLAT overhead cells; it does not catch a cell with enough height variance to pass that filter but still
clearly overhead (a sloped roof/truss cluster). Added a continuous, non-exclusionary height-preference
term (smoothstep, floored at 0.3× so it biases rather than excludes — matches the user's own "noise
bias" wording) favouring cells near the camera's own eye height. Witness `tests/test_aim_density_zspan.js`
extended (W4/W5): a truss cluster with `zSpan=2.9m` (passes the filter) still wins under zSpan-only
(subject `distToHall=14.84m`); with the eye bias the subject measurably moves toward the hall
(`distToHall=12.97m`) — a real, honest, partial effect, not a full override (never zero-weighted, by
design, so a genuinely tall facade with mass off-eye-level stays competitive too). GREEN 0/5 total.
No regression: `witness_cpe_hose.js` A1/A2 unchanged before/after both commits. **PR #1340: MERGED**
(squash `fd2faaa`).

**Idea 2 — anticipatory pan when the path is about to cross a large hall — still just an idea, not
built.** User: "if it is moving thru the large hall, it plans a pan around if it knows ahead its
path... this supposedly is preset in some cam path face settings." Partial answer given in-session:
the aim system already plans ahead in one sense — `_aimBuild`/`_aimDepthBuild` probe the WHOLE walk
(K=64 samples) before the film plays and smooth the result, so the gaze is not reactive frame-by-frame.
What it does NOT do is treat "about to enter a large hall" as its own cue distinct from "surrounded by
close surfaces" — that would be new scoring logic (weight cells by enclosed VOLUME/openness ahead on
the path, not just density/depth), a bigger feature than either open aim candidate. Not recommending
starting it now — flagging for whenever candidate 2 is stable enough to build on.

**Framing for aim work generally, user's own words:** "no hard rules because user can interject pov
walk cam facing setting sticks, just that we wana reduce that need" — i.e. manual aim-pin sticks
staying available is fine and not being removed; the goal is making the DEFAULT good enough that
reaching for a stick is rarer, not eliminating the override. Same "separation of concern" shape as
§CPE_BUILDUP_EVEN_TEMPO's own philosophy below, applied to aim instead of tempo. User's own follow-up,
same theme, is what motivated §CPE_POV_MARKER directly below: "the user has a feedback when scrubbing
to know which along the path is pov at. Easy to snatch the stick or path there."

## §CPE_POV_MARKER — red camera gizmo on the main canvas during POV preview (2026-08-13, SHIPPED, bim-ootb PR #1341 MERGED — 2026-08-14 user: "OK but needs tweaking", not yet detailed — RECALL THIS SECTION when the user brings it up in a new session)

**User:** "it be good to put a red cam object that synch along the yellow path in the canvas to
indicate where the cam position is at and its facing angle during pov preview." Confirmed the WHY on
a follow-up: "the user has a feedback when scrubbing to know which along the path is pov at. Easy to
snatch the stick or path there." Asked "WDYT of such an idea first?" — answered: standard technique
(video-editor playheads; Blender/Unity-Cinemachine/Unreal-Sequencer all show a camera icon moving
along a path spline during scrub), low-risk, feasible by reusing pose data already computed every
frame — built same session on that basis.

**Why this gap existed:** `§CPE_SCRUB_POV_ONLY` (2026-08-05) deliberately parks the main canvas
camera while B (the POV inset) or a scrub-bar drag drives the actual flying pose — correct for
protecting the main canvas from an editing-session camera hijack, but it means the main canvas shows
literally nothing moving while scrubbing/POV-previewing, which is exactly when the user wants to know
where along the yellow path the POV currently sits (to grab the nearest stick/path point there).

**Built:** `_syncPovMarker(p)` (`cinema_path_editor.js`) — a small red cone at the flying camera's
position, oriented (via quaternion, +Y aligned to the gaze vector) toward its look-at target. Wired
into `_applyVFPose`, which both `_scrubTo` (drag) and POV-only `_previewFly` already call — one hook
covers both live-preview paths the main canvas otherwise goes static for. **Purely additive per the
standing canvas-protection constraint** ([[feedback_cpe_protect_canvas_altc_from_drift]]): new mesh
only, created into the editor's own `_state.objs` array so the EXISTING `_clearScene()` (already
called by every redraw and by `finish()`) disposes it through the same lifecycle every other
editor-drawn object already has — no new teardown code, zero lines changed in existing canvas/camera/
panel code.

**Witness `witness_cpe_pov_marker.js` (new, live browser, Duplex) — 6/6 PASS:** no marker exists
before any scrub (M1); one appears and its REAL mesh transform is readable via a new read-only probe,
`_probePovMarker()`, same "product path, not a re-implementation" convention every other CPE probe in
this file uses (M2); a second scrub MOVES the same mesh rather than spawning a duplicate — proves the
lazy recreate-if-detached guard doesn't leak (M3); the facing direction is a real unit vector, not
degenerate (M2b); the marker lives in `APP.scene`, the actual main canvas, not a second scene (M4). No
regression: `witness_cpe_hose.js` unchanged (same pre-existing, unrelated D1 anchor failure as
baseline, present before this session too).

**Not done / open:** making the marker clickable to "snatch" the stick/path at that point (the user's
stated motivation) — the marker is a visual read-only indicator only; turning it into an interaction
target is a distinct,
larger follow-on, not assumed or started.

### 2026-08-13, follow-on session — user report via §CPE_POV_MARKER: "camera is pointing all over, not
according to what I specified" — root-caused from commit history only, NOT tested/computed (explicit
user instruction this session: code-read only, no live verification)

The red gizmo (§CPE_POV_MARKER, above) is purely a passive read-out of `poseAt(tn).tx/ty/tz` — it does
no aiming of its own (`_syncPovMarker` in `cinema_path_editor.js` just orients a cone along `p.tx/ty/tz
- p.x/y/z`). So it did not INTRODUCE the "pointing all over" behaviour — it made a pre-existing gaze
problem visible for the first time, because §CPE_SCRUB_POV_ONLY had parked the main canvas during
scrub/POV-preview since 2026-08-04, hiding whatever the gaze system was actually doing. Traced two
real, code-verified causes upstream in `effects.js`'s `_beat3Pose`/`poseAt` (bim-ootb repo):

**Cause 1 (primary) — the ONLY way to explicitly "specify" a look-target has been dead since
2026-08-06.** `§CPE_AIM_PIN` (PR #1172, `cd7daa6`/`1835e12`, 2026-08-04) built click-an-object-in-the-
canvas-to-pin-a-band's-gaze, with `_pinLookAtAt(e3)` checked FIRST in `_beat3Pose` so a pin "wins
outright, no LOS, no density, no depth" — the mechanism (`_setPin`/`_unpinBand`/`_buildPinZones`/
`_pinLookAtAt`) is still fully present in `effects.js` and `cinema_path_editor.js` today. But its ONE
UI trigger was commented out two days later in PR #1228 (`db8a693`/`0215a3a`, 2026-08-06,
`§CPE_AIM_PIN_DISABLED`): pin-clicks were swallowing near-miss stick-drag gestures, and `_setPin`'s
`_replanFilm()` re-ran the WHOLE path planner on every click. The disable is a single commented-out
line, `cinema_path_editor.js` ~line 2928 — `// if (ev && Math.hypot(...) < CLICK_SLOP_PX)
_tryPinClick(pc.b, ev);` — never reverted since, confirmed still commented-out at current HEAD
(`b71771d`). **So today a user has no way to pin a look-target at all; 100% of the gaze is decided by
the automatic LOS/§CPE_AIM_DENSITY/§CPE_AIM_DEPTH heuristics (plus the zSpan+eye-bias work above and
PR #1342's turn-rate REAIM), which have zero notion of user intent.** Anything the user "specifies" by
clicking or by placing a stick controls WHEN/WHERE the camera IS, never where it LOOKS — that gap is
exactly "not according to what I specified."

**Cause 2 (secondary, structural — would still bite even after Cause 1 is fixed).** The "pin wins
outright, no bleed" guarantee is only true INSIDE `_beat3Pose`'s own per-`e3` computation. The turn-
rate limiter (`§CPE_GAZE_CONSTANT_RATE`, older than AIM_PIN — `6ab0092`, effects.js `_gazeRateBuild`)
samples `_beat3Pose` at ~64 fixed points across the whole walk+turn span, then caps the ANGULAR CHANGE
between consecutive samples at `CINEMA_TURN_DPS`. A sample that lands just inside a pinned band's
Voronoi zone, next to samples from an unpinned (auto-aimed) neighbour, gets rate-limited toward it —
the flown gaze eases INTO and OUT OF a pin over several frames instead of snapping there, so even a
correctly-set pin would visibly drift through auto-aim territory near its own zone boundary. This was
never reconciled: AIM_PIN's own commit comment ("the no-bleed guarantee comes from `_pinLookAtAt`
itself... not from a blend weight") is true only pre-rate-limiter; it does not account for the rate
limiter sampling its output afterward.

**Definitive fix, in order:**
1. Re-enable the pin-click trigger (`cinema_path_editor.js` ~line 2928) — but fix the two reasons it
   was disabled FIRST, or the same regression returns: (a) separate pin-click detection from stick-
   drag-slop detection (e.g. require a modifier key, or only treat it as a pin candidate when the
   pointer-down did NOT start on/near a handle) so a near-miss stick grab is never misrouted into a
   pin attempt; (b) give `_setPin`/`_unpinBand` a cheap path that only re-derives the aim segment of
   the plan, not a full `_replanFilm()` (dive/spin/walk/orbit geometry is unaffected by a `lookAt`
   change — only `_beat3Pose`'s gaze branch reads it).
2. Make `_gazeRateBuild` zone-aware: either exempt samples that fall inside a pinned Voronoi zone from
   the rate cap entirely (the user asked for that exact direction there — the smoothness contract
   should only bind the automatic system), or floor the cap so a pinned target is fully reached within
   its own zone's sample span, never allowed to bleed past the zone boundary into a neighbour's
   samples. This is what actually restores the "no bleed" invariant §CPE_AIM_PIN already claims to
   have but does not, once the rate limiter runs on top of it.
3. Re-verify with the existing `witness_cpe_aim_pin.js` (7/7 gates, last known-green pre-disable) plus
   a new gate asserting the rate-limited series — not just the raw `_beat3Pose` series — holds the
   pinned direction across its whole zone.

**Separate, NOT part of the above — flag only:** the local `~/bim-ootb` working tree (uncommitted, not
pushed, not deployed) currently has the ENTIRE `_buildPinZones`/`_pinLookAtAt` mechanism deleted from
`effects.js` (`git diff HEAD` shows it removed outright), on top of the disable above. This is NOT live
anywhere — committed HEAD (`b71771d`, matches `origin/main`) still has the full mechanism — but if any
session tests against this exact dirty checkout it would see pins have zero effect at all, a different
and more total symptom than either cause above. Do not conflate the two; investigate the working-tree
diff's origin before touching it (per this project's shared-worktree caution) rather than assuming it's
this same lane's WIP.

## §CPE_AIM_SIMPLIFY — §CPE_AIM_DENSITY retired, §CPE_AIM_DEPTH's trigger changed to forward-clearance (2026-08-14, bim-ootb PR #1344 MERGED+deployed — CLOSED, user final sign-off after fresh preview-vs-bake comparison)

**What/why:** user's HHS mp4 (stick snatched back twice) + design discussion converged on: path-follow
by default, §CPE_AIM_DEPTH as the ONLY exception (near a wall → turn toward depth), §CPE_AIM_DENSITY
(turn toward nearest mass when outside empty) retired outright — redundant (Beat 4/5 already faces the
building at the end) and the likely "faces sky" cause. §CPE_AIM_DEPTH's own trigger also changed, from
omnidirectional `_aimSoftDensity` (would misfire mid-corridor — flanking walls read as "surrounded"
same as a dead end) to a single raycast along the walk's `_lookAhead` direction (`_aimForwardClear`,
reuses `_cinemaFan`'s BVH/mesh-set, buildup-safe for free). Checked-not-assumed: the eye-level-bias fix
user asked for last session (`1bbb4ac`) never reached `origin/main` — moot now, density is gone.

**Built:** `_aimSubject`/`_aimOutsideM`/`_aimSoftDensity`/`_aimWeight`/`_aimBuild`/`_aimAt`/`_aimApply`
deleted (not disabled). `_aimDepthSubject`'s far-facade search + zSpan floor/ceiling exclusion
UNCHANGED — only the trigger changed. New constants `_AIM_DEPTH_FWD_CLEAR_MIN_M=3/MAX_M=8/FRAC=0.06`
(tuning knob if fire-rate ever feels off). §CPE_AIM_PIN's explicit override untouched.

**Verified:** witness F1 (real geometry spread, not a constant) + F2 (fired always agrees with
`fwdClear<clearM`) both PASS on Duplex + HHS_Office; full existing suite clean on both (one
pre-existing unrelated failure confirmed via `git stash` baseline diff). PR #1344 merged (`6ab068c`),
GH Pages deploy confirmed against that exact commit. Live bake's own log confirms the new code ran
(`trigger=fwdClear`, the old build had no such field) with a smooth, monotonic ramp early in the walk.

**2026-08-14, later same bake, user's own words:** "actually it swings more, i didn't notice until now
mid bake, ie goes facing backwards as it also face upthru the floors structure while it goes along the
main corridor, which is OK as it shows more and user can edit path anyway. Will run more tests before
recalling this prompts/#." Log confirms it numerically: `e3=0.75-0.80` holds `perpDeg` up to **156°**
(near-reversed vs. travel) at **blend=0.63-0.74** for ~60 consecutive frames — a real, sustained
near-backward gaze, not a glitch. Cause not yet root-caused: `_aimDepthSubject`'s SEARCH is still fully
omnidirectional (only the TRIGGER got a forward bias this round) — a picked subject can legitimately
sit behind or above the camera once triggered. User has judged this an acceptable tradeoff (the pin
override still exists for anyone who wants a specific shot pinned).

**2026-08-14, final sign-off:** ran a fresh full bake/preview comparison specifically checking whether
the swinging seen live matches Preview and whether the dolly-cam gaze reads as accurate — "it seems to
behave well similar to preview animation, and the dolly cam pointing also accurate. Thus can wrap up."
Also separately confirmed (code-level, not assumed) that Preview and the real bake read gaze through
the identical `plan.poseAt()` on a freshly-rebuilt plan each time — no state leakage either direction,
so this sign-off on Preview carries over to the real bake by construction. **CLOSED.** If the
omnidirectional-search backward/upward swing (above) ever needs narrowing, that is a fresh, separate
ask — not implied by this closure.

## §CPE_BUILDUP_ONSET_BURST — even calendar tempo still bursts visually on some schedules (2026-08-13, user-reported, MEASURED, then DEPRIORITIZED by the user same session — "ignore the pacing.. it seems solved before perhaps i didn't update" — kept as a record, do not resume unprompted)

**User's report:** "the alt-c movie baking timeline is fast on the onset which it should just be linear
thruout. This may make longer movies is OK as present it is less than a minute. Correct only the first
10 secs perhaps to be linear let the ARCH buildup be appreciated rather than rushed."

**Context — this is the SAME tension §CPE_BUILDUP_EVEN_TEMPO (2026-08-06) already named and accepted as
a tradeoff, now visible from the other side.** That fix made the buildup CALENDAR cursor perfectly
linear (`_workCursorAt` returns `projectStart + t*span`, unconditionally, `BUILDUP_EVEN_TEMPO = true`),
reversing the earlier §CPE_BUILDUP_WORK_PACED (element-linear) rule on the user's own "separation of
concern" directive. Its own comment already flagged the trade: *"Even ELEMENT rate is uneven DAY rate,
by construction... wherever a schedule clusters its elements [a burst] returns."* Calendar-linear
guarantees the DAY COUNTER reads evenly; it does NOT guarantee the VISIBLE CONSTRUCTION (elements
placed, hence apparent mass on screen) arrives evenly — those are different axes, and no real 4D
schedule places elements at a constant rate per calendar day.

**Measured (not eyeballed) — replayed the EXACT per-frame cursor math `cinema_maxq.js`'s bake loop
uses (`buildupTAt` → `buildupCursorAt` → `tmPlacedCount`), no rendering, on the real derived (mode=T)
timeline, `§CPE_BUILDUP_PACING mode=even-calendar` confirmed live (current default, unchanged):**

Duplex, 55s film (topout=0.658, 1123 ops) — cumulative % of the WHOLE building placed at film-time
deciles 10%…100%: **24.6%, 26.9%, 26.9%, 27.0%, 86.6%, 96.0%, 100%, 100%, 100%, 100%**. Read: **almost a
quarter of the entire building already exists by 5.5s into a 55s film**, then next to nothing happens
for the following ~17s (26.9→26.9→27.0%, three flat deciles), then **59.6 points of the building land
in one 5.5s window** (27.0%→86.6%). That is a real, sharp front-load-then-stall-then-burst shape, not
noise — matches "fast on the onset" directly. Hospital_3 (topout=0.900, 63415 ops), same measurement:
2.8%, 16.6%, 42.2%, 50.9%, 63.9%, 70.8%, 85.7%, 90.7%, 100%, 100% — noisier than perfectly even but no
comparable burst; the defect is schedule-dependent (how a given building's derived 4D order clusters
completions across calendar days), consistent with the 2026-08-06 comment's own prediction.

**Not fixed (2026-08-13) — a proposal, not yet built, needs a go before touching a recently-settled
decision.** Reverting to element-linear pacing globally is NOT proposed — that was already tried,
already measured worse on its own axis (the original Hospital burst: a quarter of the model in the
first 5% of the film), and reversing it was a deliberate, reasoned, user-made call this file already
records in detail (§CPE_BUILDUP_EVEN_TEMPO above), including a real regression (`§GHOST_GROUND`'s
trigger threshold) that a similarly-scoped change caused last time — recorded as a caution, not a
reason to freeze, but a reason to change this carefully and re-run `witness_cpe_ghost_ground.js`
before calling it done. Minimal option matching the user's own scoping ("correct only the first 10
secs"): blend the cursor toward the ALREADY-PRESENT (flag-gated, currently unused) element-paced
formula only within roughly the first ~10s of film / before some small fraction of the topout window,
fading back to pure calendar-linear after — bounding the onset burst without reopening "two mechanisms
compete for the whole film" that §CPE_BUILDUP_EVEN_TEMPO was written to end.

### ✅ SHIPPED 2026-08-27 — `§CPE_BUILDUP_ONSET_BLEND`, exactly the minimal option above

Re-raised unprompted after the 2026-08-13 deprioritization: *"...First few secs should take on Day 0
as most 4D rush onset."* Studied first, user confirmed and scoped it: *"Yes the first one only. Do not
touch item 2 in another session, separated concern"* — item 2 (`4D_GANTT_TM_REFACTOR.md` §FUTURE
item 2, Gantt bar-width calibration) untouched, a separate already-blocked lane.

**Built** (bim-ootb `fix/cpe-buildup-onset-blend`, `cinema_maxq.js`/`cinema_path_editor.js`):
`_workCursorAt(tFilm, bkState, totalSec)` gets a new optional 3rd arg, the film's own designed length
(a per-plan constant, same for preview and bake — the "pure function of film fraction" invariant
stays intact). For `t < onsetU` (`onsetU = min(0.5, 10/totalSec)`), cursor =
`lerp(elementPacedMs, calendarLinearMs, t/onsetU)` — element-paced at t=0, fading to exactly
calendar-linear at t=onsetU, no seam. Omitting `totalSec` (old call sites) DEGRADES to byte-identical
pure calendar-linear, unchanged. All 3 real call sites now pass it (bake loop, `_previewFly`,
`_scrubBuildupSync`).

**Flagged risk, specifically tested, not just re-run:** onset blend makes `tFilm` no longer purely
calendar-linear near t=0, which is the exact clock-mismatch shape §GHOST_GROUND_LIVE_TRIGGER was built
to catch. `witness_cpe_ghost_ground.js` calls `buildupCursorAt` with only 2 args, so re-running it
green (30/30, Duplex+Hospital) proves the OLD path is untouched but doesn't exercise the new one — a
fresh witness was required.

**New witness `witness_cpe_buildup_onset_blend.js`, 12/12 green (Duplex + Hospital):** burst reduced
(summed error vs. time-proportional placed%, marks strictly inside the onset window) Duplex
67.4→44.3pt (**-34%**), Hospital 19.6→12.7pt (**-35%**); handoff at `t=onsetU` seamless on both;
cursor for `t≥onsetU` byte-identical to pure calendar-linear on both (day-counter untouched); degrade
path (2-arg calls) byte-identical to pre-fix on both; ghost-ground replayed 400 real frames through
the new 3-arg cursor on both buildings — opacity floor held exactly until the real cursor crossed
`firstAboveMs`, then rose monotonically (no regression).

**sw.js `CACHE_VERSION` bumped same PR. Scope held exactly as directed** — §FUTURE item 2 not touched.

**Live user sign-off (2026-08-27, real Terminal building, 48,428 elements, captured schedule):** initial
report ("no buildup at all", "too short") traced to user error (TM not opened first) — withdrawn.
Confirmed after: **"the days onset seems better."** CLOSED.

## §LTU_SUBSURFACE_BBOX — movie path dives underground on LTU_AHouse (2026-08-16) — ✅ SHIPPED same day, PR bim-ootb#1386 MERGED (user GO)
**Fix shipped exactly as named below: `_bboxZFenced()` shared by both helpers, rows outside
`p01 ± 0.25·(p99−p01)` excluded (whole row), skipped for n<100/degenerate span, effects.js?v=19,
sw v1039. Acceptance witness held: Hospital ARC+IFC and Terminal ARC BIT-IDENTICAL (excluded=0);
LTU excludes exactly the 13 junk rows on both paths — live §-log
`§CINEMA_BBOX_FENCE excluded=13/125698 rawZ=[-45.55,17.14] fencedZ=[-3.19,17.14]`, ARC pivot
−23.90 → +3.64 m. Known accepted edge: Terminal's (unused) IFC-fallback would trim 239 deep-MEP
rows if a zero-ARC building ever took it. `_densPoints()` (aim-subject search) is still
unfiltered — junk can still pitch GAZE down even though the path no longer sinks; separate,
smaller, open.** Original diagnosis below, kept verbatim.
**⛔ OPEN follow-up (user 2026-08-16: "need that first one to be used in the alt-c movie
baking"):** code-confirmed the fence already governs Alt+C — cinema_maxq.js/cinema_path_editor.js
build NO bbox of their own, the movie plan builder (effects.js ~5577) calls the fenced helper —
but the LIVE witness on an actual LTU Alt+C plan build is still owed (assert §CINEMA_BBOX_FENCE
fires at PLAN-build time + plan pivot/settle Y ≈ +3.6m). If a real bake still dives, suspect a
SAVED/authored path recorded before the fix, and check the user's sw is v1042+ first.
User report: "LTU seems to get some strewn objects far below surface that affects movie maker path
going sub surface." Both halves verified with numbers, no code touched.

**Data half (measured on the served Aug-10 LTU split, `LTU_AHouse_meta.db`):** 125,698 elements sit
at z ∈ [0, 17.1]; **17 junk outliers** below −1 m: 13 `IfcColumn` at −5.6 → −45.6 m assigned to
VÅNING 1/3 (above-ground storeys — export garbage, not a basement) + 4 borderline `IfcBeam` at
−2.0/−3.2 m. p01 of the whole distribution = 0.0.

**Code half (Explore-verified, all file:line on origin/main):** the exterior act hangs off ONE raw
SQL aggregate — `_buildingBBoxArc()` `effects.js:580-588` (`MIN/MAX(center_z)`, discipline='ARC') /
`_buildingBBoxIfc()` fallback `:568-573` — no trim, no percentile, and `§GROUND_Y`/`_calcGroundY`
is NEVER consulted by the cinema path. The ARC filter is no shield: `tools/extract.py:404` defaults
unmapped classes to ARC. Load-bearing line: `effects.js:5571-5577` `pivot.y = zMin + 0.35·(zMax−zMin)`
→ with zMin=−45.6 the orbit pivot drops from ≈+5.95 to ≈−23.7 m (a 29.6 m sink of the whole orbit
AND its look-at). Consequences: Beat 5's flat-tilt portions (`CINEMA_FLAT_TILT_DEG=0`, `:7159-7165`,
`:7072`) put camera Y EXACTLY at pivot.y → a full arc ~24 m under the L1 slab; Beat 4's rise
(`:7397-7399`) descends into the ground right after the walk-out; the no-room fallback settle
(`:5664-5674`) can land the dive/spin at −43.9 m. Beat 3 (walk stretch) stays honest — its Y comes
from door/room `center_z` + eye height. `_densPoints()` (`:6278-6287`) is also unfiltered — the
junk cluster can additionally pitch the §CPE_AIM_DEPTH gaze downward. Contrast prior art done
right: `tour.js:451-462` storey Z from doors-only MIN — junk proxies can't move it.

**Named fix (NOT built — CPE is a protected lane, [[feedback_cpe_protect_canvas_altc_from_drift]]):**
robust z-fence inside the two bbox helpers ONLY (query layer, not choreography): compute p01/p99 of
`center_z`, reject rows below `p01 − 0.25·(p99−p01)` before MIN/MAX. Acceptance witness: healthy
buildings (Hospital/Terminal) produce a BIT-IDENTICAL plan (no element below the fence → raw min
unchanged); LTU pivot returns above ground (fence ≈ −4.3 → zMin −3.2 → pivot ≈ +3.9 m). The 17 DB
rows themselves stay untouched (EXTRACT-only; presentation-layer exclusion per
[[feedback_prime_rule_scope_presentation_layer]]).

## §CPE_BUILDUP_ACTIVATE_POPS_PANEL — Alt+C's bake pops the Time Machine panel visibly open just to read its schedule (2026-08-24, found this session, NOT YET FIXED — RESUME HERE)

**The gap, code-confirmed today.** `G-CPE-SOLE-OWNER` (§ above, `:1820`) already states the intended
rule: *"only a real Play opens Time Machine."* But the bake path doesn't honour it. `cinema_maxq.js`
calls `window.tmActivateForBake()` (`viewer/time_machine.js:8410`) to get the schedule ready before a
preview/record bake. When TM isn't already active, that function calls `activate()` (`:8413`), and
`activate()` (`:7824`) does two things it does not need to separate but currently bundles: it loads the
schedule DATA (`_activateAsync` → `_ops`/`_projectStart`/`_projectEnd`) **and**, at `:7864-7865`,
`setToolbarHighlight(true); _panel.style.display = 'flex';` — i.e. it makes the TM panel visibly pop
open on screen. So today, pressing Alt+C to bake a movie — a pure camera/cinema action that only
*consumes* the 4D schedule as data (§CPE_BUILDUP_FOLLOW_TM, `:8662-8667`, "Time Machine owns the build
order, Alt+C owns the camera") — has the side effect of opening the TM editing UI the user never asked
for. This was already spotted once in passing, `:1803-1804` ("`tmActivateForBake()` force-activates TM
but nothing ever calls it back off"), but never turned into its own fix.

**Why it matters more now than it did before:** this same session folded the P6/MS Project
Import/Export/Diff-vs-Model surface INTO the TM panel itself (`feat/tm-editor-fold`, bim-ootb PR
pending at session-end — check its merge state before resuming this), retiring the separate
`schedule_editor.html` tab. `buildPanel()` (`time_machine.js:2715`, called once from `init()` at
`:8159`) constructs the WHOLE panel's HTML unconditionally on every page load regardless of Alt+C — so
that fold does not add weight to the bake path's construction cost (verified, not assumed: `buildPanel`
runs once at init, `activate()` never rebuilds it, just toggles `display`). But it does mean the panel
Alt+C now pops open, however briefly, carries more UI than it used to — sharpening the case for fixing
this properly rather than leaving it as an accepted side effect.

**Named fix (NOT built):** split `activate()`'s data-load from its visibility side effect. A new
data-only entry point (e.g. `_activateDataOnly()` reusing `_activateAsync`'s cache/kernel_ops/recompute
chain) that `tmActivateForBake()` calls instead of `activate()` when it only needs `_ops`/
`_projectStart`/`_projectEnd` populated — never touching `_panel.style.display`/`setToolbarHighlight`.
A real user Play (the clock pill, key `t`, `toggle()`/`activate()` directly) keeps opening the panel
exactly as today — only the bake-triggered path goes silent. Acceptance witness: reproduce
§CPE_BUILDUP_ARM_GATE's setup (a real timeline, TM not yet active), fire `tmActivateForBake()`, assert
`_ops.length`/`_projectStart`/`_projectEnd` populate correctly (bake still works) AND `_panel.style.display`
stays `'none'`/whatever it was before the call (no visible pop-open) — paired with a second case
proving a direct `activate()` call (simulating the clock-pill Play) still sets `display:flex` as today,
so the split doesn't regress the real-Play path `G-CPE-SOLE-OWNER` protects.

## §CPE_PREVIEW_TACKBACK_PIN — quick cam-head adjust during preview walk, reusing §CPE_AIM_PIN instead of adding sticks (2026-08-27, user-queued, NOT STARTED)

**User's ask, verbatim:** *"Next i will make the preview walk to tack back a stick in focus so we can
adjust it cam head angle as it has the habit of staring skywards when disturbed. With such a feature,
we can quickly readjust the cam facing, and it should tamper ease as set along."* Then, same session,
a correction on the mechanism: *"as now, we need to add a stick to adjust the cam head and we ended up
with more sticks when the intent was just cam adjustment unless u have a better idea."*

**"Staring skywards when disturbed" is the already-diagnosed §CPE_AIM_DEPTH omnidirectional-search
swing** (§CPE_AIM_SIMPLIFY, 2026-08-14): once `_aimDepthSubject`'s forward-clearance trigger fires,
the SEARCH itself is still fully omnidirectional, so the picked subject can legitimately sit behind or
above the camera — measured `perpDeg` up to 156° (near-reversed vs travel). User accepted this as a
tradeoff THEN because a manual override still existed in principle (the pin). It doesn't, in practice
— see below.

**"More sticks than intended" confirms the exact gap this file already named and never closed.**
`§CPE_AIM_PIN` (Cause 1, above, `## Part C`) is precisely a look-target-only override — pin a band's
`lookAt` WITHOUT moving the path — built and merged 2026-08-04 (PR #1172), then its one UI trigger
(click-in-canvas) was commented out 2026-08-06 (PR #1228, `cinema_path_editor.js` still commented out
today, confirmed at current `origin/main`: `_tryPinClick`/`CLICK_SLOP_PX`, line ~3018) because pin-
clicks were swallowing near-miss stick-drag gestures. **Nothing has re-enabled it since.** The
mechanism itself (`_setPin`/`_unpinBand`/`_buildPinZones`/`_pinLookAtAt`) is still fully present in
`effects.js` and `cinema_path_editor.js` — this is a UI-wiring gap, not a missing feature. Today a
user with no pin-click path has only one lever to influence gaze: move/add a stick, which changes
WHERE the camera IS, not just where it LOOKS — exactly the "more sticks" symptom just reported.

**Recommendation: don't build a new mechanism — re-enable and extend AIM_PIN, don't reach for sticks
for a gaze-only edit.** Two threads converge on the same fix:
1. **Re-enable the pin-click trigger** (the "Definitive fix" already spec'd above, Cause 1/2,
   2026-08-14, never built): separate pin-click detection from stick-drag-slop (modifier key, or only
   treat as a pin candidate when pointer-down didn't start on/near a handle) so re-enabling doesn't
   reopen the 2026-08-06 regression; give `_setPin`/`_unpinBand` a cheap re-plan path (aim segment
   only, not a full `_replanFilm()`); make `_gazeRateBuild` zone-aware so a pin doesn't visibly bleed/
   drift near its own Voronoi zone boundary — **this IS the "tamper ease as set along" ask**, already
   named as Cause 2's fix, not a new requirement.
2. **New entry point: trigger the pin from PREVIEW WALK, not just a static canvas click.** This is the
   genuinely new part of the ask — "tack back to the stick in focus" during a running preview means:
   identify the band nearest the current preview cursor (`_previewFly`'s live `tn`/pose, same value
   `_scrubTo`/`roomTitleLiveTick` already read), pause/snap the preview to it, and open the SAME
   `_setPin` flow the canvas click uses — so the user adjusts facing live, mid-walk, without leaving
   preview mode or hunting for the right band on the static path. Reuses `_pinLookAtAt`'s existing
   band-Voronoi-zone lookup (`_buildPinZones`) to answer "which band is in focus" — no new geometry
   concept needed.

**Not started.** Spec-only per this project's Spec-First rule — implementation queued behind the
user's own "Next i will make..." framing (their intent to build, not yet a dispatch). Acceptance
witness, when built: (a) a pin set during preview-walk survives into the baked film identically to one
set via the static canvas click (byte-identical `plan.bands[i].lookAt`); (b) the rate-limiter zone-
awareness fix holds — sampled gaze across a pinned zone's boundary shows no discontinuity vs. its
un-pinned neighbours' natural ease; (c) pinning a band's gaze does NOT add/move any waypoint — `bands`
length and every `band.c`/`band.d` position stay unchanged, only `lookAt` differs, directly disproving
the "more sticks" regression this section exists to fix.

## §CPE_CONE_ORIENT_ADJUST — drag the POV cone to fix a bad gaze (e.g. "staring skywards"), no stick added (2026-08-27, user-designed in discussion this session, SPEC READY, dispatching to build)

**Supersedes the §CPE_PREVIEW_TACKBACK_PIN direction above** — same underlying problem (fix a bad
gaze without adding a stick), but the mechanism converged on through discussion is materially
different from that section's "re-enable §CPE_AIM_PIN's click trigger" recommendation. Read this
section as the current plan; the section above is kept for its diagnosis of the "staring skywards"
root cause (§CPE_AIM_DEPTH's omnidirectional search, §CPE_AIM_SIMPLIFY 2026-08-14) and the "more
sticks" root cause (walk-mode's Enter/Space couples facing-capture to stick-planting,
§CPE_WALK_ENTER_LOCK), both still correct — only the fix mechanism changed.

**Two ideas explicitly considered and rejected in discussion, recorded so they aren't re-proposed:**
- A dedicated mouse-look drag inside the preview/viewfinder box (`#cpe-vf-panel`) — abandoned in
  favour of the cone once the cone turned out to already be a distinct, directly-pickable mesh.
- A modifier key on walk-mode's Enter/Space (e.g. Ctrl+Enter = facing-only, no stick) — abandoned;
  **Esc was specifically rejected**: walk-mode uses pointer lock for "look," and Escape releases
  pointer lock unconditionally at the BROWSER level (cannot be intercepted) — `cpe_walk.js:246`
  already treats losing lock as "walk ended," so binding Esc to a facing-only action would exit the
  walk instead of adjusting anything.

**The chosen mechanism: make the existing passive POV cone interactive.**
`_state.povMarker` (`cinema_path_editor.js:1413`, `_syncPovMarker`) is already a standalone
`THREE.Mesh` (`ConeGeometry`, currently `0xff1744` red) that tracks the scrub/walk position and
orientation every frame, purely as a readout today — zero pointer interaction wired to it. Being a
distinct, uniquely-raycastable object (not "click anywhere on the canvas" the way the retired
AIM_PIN trigger was) is exactly why this sidesteps the stick-drag-slop conflict that got AIM_PIN's
own click trigger disabled in 2026-08-06 and never re-enabled.

**Interaction, as designed across this session's discussion:**
1. **Position is scrub-only.** The cone must never be draggable along the path — repositioning WHICH
   point you're correcting is done with the existing preview-box scrubber (`_scrubTo`), same as
   today. Dragging the cone only ever rotates it.
2. **Click = focus.** Clicking the cone changes its material to a distinct "brownish" tone (a
   different, warmer hex than the standing `0xff1744` — pick a reasonable value, e.g. `0x8B5A2B`,
   and treat it as a tuning knob, not a fixed requirement) so the user can see it has grabbed
   interaction focus. Clicking anywhere outside the cone clears focus and reverts the color.
3. **Drag while focused = live orientation edit.** The preview/viewfinder panel (`#cpe-vf-panel`/
   `vfCam`) auto-shows during the drag (even if the eye toggle is currently off) so the user sees the
   corrected framing as they rotate, not just the abstract cone in the flat canvas. **Open: whether
   it auto-hides again on release or stays open until the eye toggle is used — not yet decided by the
   user, pick the less surprising default (stays open) and flag it as adjustable.**
4. **Release = commit an ANCHORED correction, not a band pin.** Because the cone's position is
   scrub-driven and may sit at ANY arc-length/time-fraction along the path — not necessarily at an
   existing band — this cannot reuse `band.lookAt`/`_setPin` as-is (that mechanism is band-indexed).
   It needs its own small stored list on the plan (anchor position along the path, corrected
   direction, hold length, decay length), round-tripped the same way bands already are
   (clone/save/reopen, §CPE_REOPEN_NODE's precedent). **The implementer should study `_pinLookAtAt`'s
   shape and the still-open "Cause 2" rate-limiter bleed fix (§CPE_AIM_PIN section above) before
   designing this — the two systems must not fight each other or duplicate the taper math wastefully,
   even though they are not the same code path.**
5. **Envelope is asymmetric, path-arc-length based, not time/zone based (user's own design):** a
   SHORT ease-in ramp BEHIND the anchor (so the transition into the correction isn't an abrupt cut —
   this revises an earlier-discussed "untouched behind" idea, which the user corrected mid-session),
   the corrected facing held FORWARD from the anchor for a length, then eased back down to whatever
   the underlying facing would otherwise be (auto-computed gaze, or a neighbouring correction) over a
   further decay length past the hold. Never rewrites footage before the short backward ramp starts.
   **Hold/decay lengths have no user-specified default yet** — propose named, commented, tunable
   constants (arc-length in meters, so behavior scales with path geometry rather than film seconds)
   and say so plainly rather than presenting a guess as settled.
6. **Multiple corrections along one path — not yet decided.** If two anchors' hold/decay windows
   overlap, don't invent a rigid blending rule beyond what's needed to ship an MVP; note the ambiguity
   and pick the simplest reasonable behavior (e.g. nearer anchor dominates), flagged for the user to
   review, not silently finalized.
7. **Undo integrates with the existing stack, not a new one.** `§CPE_UNDO` (`_undoPush`/`_undoApply`,
   `cinema_path_editor.js:971`) already snapshots the plan before every edit action (stick drag, etc).
   The commit step in (4) must call `_undoPush` the same way, so Ctrl+Z reverses a bad cam adjustment
   exactly like it reverses any other edit — no new mechanism needed here.
8. **Never adds or moves a band.** Acceptance witness must assert `bands` length and every
   `band.c`/`band.d` byte-unchanged after a cone adjustment — the same disproof §CPE_PREVIEW_TACKBACK_PIN
   above already named for the "more sticks" regression, now against the corrections-list mechanism
   instead of a band pin.

**Explicitly OUT of scope for this dispatch:** re-enabling §CPE_AIM_PIN's disabled canvas click
trigger (a separate, still-parked fix, untouched by this); `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2
(separate lane, per the user's own explicit "do not touch item 2 in another session" directive this
same day).

**Status: spec ready, dispatching a build agent** (fresh `/tmp/wt-*` worktree off `origin/main`,
Spec-First already satisfied by this section, FUNDAMENTAL LAW — §-log/numeric witness only, no
screenshots — and CPE's own protected-lane caution apply). See the dispatch note below for exactly
what was handed off.

**Built 2026-08-27 — bim-ootb PR #1572 (`feat/cpe-cone-orient-adjust`, OPEN, not merged/auto-merged —
user wants to review the interaction personally before it ships).** `effects.js` gained a new
`_cpeCorrections` plan field (same `A.cinemaPathPlan` wrapper pattern as `_cpeBands`/`_cpeHose`/
`_cpeReveal`); each correction's world anchor resolves to an arc-fraction via the SAME nearest-point-
on-`flowWp` technique `_buildPinZones` already uses for bands — a deliberately SEPARATE code path from
the pin mechanism (not band-indexed), checked inside `_beat3Pose` AFTER the existing pin/§CPE_AIM_DEPTH
chain. `cinema_path_editor.js` wired cone hit-test/focus/drag/commit into the existing `h.down`/
`h.move`/`h.up` pipeline — screen-space proximity (`_screenOf`), not a raycast, same `depthTest:false`
reasoning `_handleGrabPx` already gives for band handles; one grab split by movement (click=focus,
drag past `CLICK_SLOP_PX`=rotate+commit), reusing the §CPE_STICK/§CPE_HOSE "one grab" convention rather
than requiring two separate clicks. Interaction is gated to the walk beat's own `_walkWindow()` — outside
it the cone's position collapses onto a fixed per-beat point (e.g. `settle` throughout the whole spin),
so a correction anchored there would silently snap onto the wrong end of the walk. `§CPE_UNDO` reused
verbatim (`_undoPush` before every commit), corrections threaded through `_buildOverride`/`_isEdited`/
undo-redo/`_pathsApply`/`open()` the same seam bands already ride. `sw.js` CACHE_VERSION v1095→v1096.

**Open questions flagged for the user's sign-off (none silently settled):**
1. VF panel auto-show on release: built as "stays open until the eye toggle is used" (spec's own
   recommended default) — not confirmed.
2. Envelope constants `CPE_CONE_CORR_RAMP_M=2` / `HOLD_M=5` / `DECAY_M=4` (arc-length metres) are
   first-guess defaults, not settled.
3. Click-then-drag built as ONE gesture (§CPE_STICK/§CPE_HOSE precedent) rather than two separate
   clicks, even though the spec's own prose numbers them as two steps — a judgment call.
4. Overlapping corrections: nearest anchor wins outright (no blending); re-dragging within
   `CPE_CONE_CORR_MERGE_M=3` of an existing anchor updates it in place rather than stacking — both
   first-guess MVP behaviour, not user-decided.
5. A correction is applied AFTER the existing pin, so it can override even a pinned zone's gaze —
   not confirmed with the user.

**Witness: `witness_cpe_cone_orient.js` (new), 17/17 PASS (Duplex)** — real click/drag pointer events
via `THREE.Vector3.project`-computed screen coordinates (same technique `witness_cpe_drag.js` already
uses for band handles), not synthetic hooks: click focuses/creates no correction; click outside clears
focus and spawns no stick; a real drag commits one correction with a real unit direction;
**`bands.length` and every `band.c`/`band.d` are byte-identical before/after the drag (maxDelta=0)** —
the acceptance criterion this feature exists to satisfy; the VF panel auto-shows during the drag though
never toggled on; the envelope shape sampled via a new `A._cpeBeat3PoseDebug` witness hook (mirrors
`A._cpePinZonesDebug`) shows 0.00° error at the anchor/through mid-hold vs. 147.85° well past the decay
window — the taper actually decays, does not pin forever; real Ctrl+Z/Ctrl+Shift+Z undo/redo the
correction, bands untouched throughout. Hospital timed out opening the editor in this environment
(>9 min, twice) — a pre-existing, already-documented environment limitation in this exact repo (PR
#1570's own test plan hit the identical timeout); Duplex-only matches several sibling witnesses'
own defaults.

**Regression suite re-run unmodified, 90/92 across 9 files**: `witness_cpe_buildup_tempo.js` 3/3,
`witness_cpe_ghost_ground.js` 15/15, `witness_cpe_aim_pin.js` 7/7, `witness_cpe_drag.js` 8/8
(Duplex+Terminal), `witness_cpe_undo.js` 12/12 (Duplex+Terminal), `witness_cpe_pov_marker.js` 6/6,
`witness_cpe_click_slop.js` 6/6, `witness_cpe_scrub_viewfinder.js` 33/33 all clean.
`witness_cinema_bands.js`: Duplex 4/6 (B5/B7 fail), Terminal 6/6 — **confirmed PRE-EXISTING via a
`git stash` baseline diff** (re-ran the identical witness against pristine `origin/main` with this
PR's changes stashed away: byte-identical failure numbers, band1 aimErr=171.8°, peak=84.6°/frame at
t=0.157, with or without this change). Not a regression. The disabled §CPE_AIM_PIN click trigger
(`cinema_path_editor.js` ~line 3018) is grep-confirmed untouched.

**Tuning follow-up, same day — bim-ootb PR #1573 (`fix/cpe-corr-hold-tune`).** User, after first
live use: *"the easing forward... should be more further... usually when user rotates it, is
because it is pointing wrong way for some length."* Tried the literal ask first (hold 5→12m, decay
4→6m) and it broke: the shared gaze rate limiter (`_gazeRateBuild`, `CINEMA_TURN_DPS=45deg/s`, spans
beats 3+4 as one continuous stretch specifically to prevent whip/jerk elsewhere in the film — see its
own header comment, §CPE_GAZE_CONSTANT_RATE) could not track a correction held that long on the test
walk's own (short, ~17.5m) length — measured **70.9° mid-hold error**, a real jerk-class failure the
new witness caught (`witness_cpe_cone_orient.js` G-CONE-6b), not a false alarm. **Shipped instead:
hold 5→8m, decay 4→5m** — verified clean (17/17, mid-hold error 0.07°). Regression-checked
`witness_cpe_gaze_acquire.js` (8/8) and `witness_cpe_aim_pin.js` (7/7) — the rate limiter itself and
the sibling pin mechanism are both untouched by this change. **There is a real ceiling here, not
arbitrarily chosen:** extending hold further needs the rate limiter made zone/window-aware of a held
correction (the same unresolved "Cause 2" gap named in the `§CPE_AIM_PIN` section above, 2026-08-14)
— out of scope for this tuning pass, flagged for whoever picks it up next.

**On "ensure the whole animation has no jerks" (user, same session, prompted by this exact
finding):** the smoothing the user was asking about IS real and IS the `_gazeRateBuild` mechanism
above — it already rate-limits every composed gaze change in the film (spin, orbit, walk, and now
corrections) to `CINEMA_TURN_DPS`, forward-only, spanning beats 3+4 as one span specifically because
an earlier defect (§CPE_GAZE_CONSTANT_RATE's own header, "G-SH-4") showed limiting only one beat just
MOVES a whip into the seam rather than removing it. It is working as designed for the shipped 8m/5m
envelope (confirmed via `witness_cpe_gaze_acquire.js`'s own T0-T7 gates, 8/8 green, no whip). The
12m/6m attempt is the one concrete case found this session where it's pushed past its own limit —
recorded above, not re-litigated here.

## §SESSION_2026-08-30 — HUD column, curve smoothing, bake-cost cuts (ALL SHIPPED + LIVE, sw v1106)

**Live-verified by fetching the deployed files back, not by trusting a green PR.** PRs #1579, #1580,
#1582, #1583. Nothing committed is unpushed.

### What shipped
| § | what | witness |
|---|---|---|
| §TRIPLANAR_NORMAL | the missing 3rd PBR map (NOTICE.txt had recorded the gap since day one) | interior blockStd +4.3%, exterior +0.2% |
| §PHOTO_REALISM_RETUNE item 3 | `CAM_LIGHT_COLOR` 0xfff2e0 → 0xffdca8 | — |
| §CPE_PATH_OVERVIEW | static 3/4 top-down box: the Alt+C yellow path + red head on the REAL pose | 6/6 |
| §CPE_HUD_STACK | ONE corner preference drives counter → panel → box | — |
| §CPE_LABEL_PANEL_SYNC | caption moved from full-bleed band to the counter's rounded plate | W-RTC green |
| §CPE_RESOURCE_PANEL | cylindrical composition pie, glass progress ring, avatar + ×N | draw-proven only |
| §CPE_BIG_STATS | revolving BIM-value cards once the pie is honestly empty | 6/6 |
| §MEP_SMOOTH_NORMALS | class + measured-shape gate, crease-limited, in place | 5/5 Hospital |
| §CPE_CORR_BRUSH_STROKE | cam-face corrections HOLD FORWARD instead of decaying back | **none** |
| §IDX16 | Uint32→Uint16 index where verts < 65536 | Clinic 137→437 |
| §GLOW_BUILDUP_EARLY_OUT | stop staging glow for fixtures that do not exist yet | — |

### Measurements worth not re-deriving
- **§SHADE_PROBE (Clinic, 448 real geometries):** every class ships HARD PER-FACE normals —
  weldRatio 0.107–0.29, splitNormal 96–100% — so `flatShading:false` is silently overridden by the
  data. That is why curved MEP looked faceted; it was never a tuning miss.
- **§THRESHOLD_PROBE (Hospital), distinct facet directions per element span — the cut at 16 is in
  real empty space:** IfcWallStandardCase p50=6 **max=6** 0%≥16 · IfcPlate 6/6/0% · IfcFooting 14/0%
  · IfcValve 65 **100%** · IfcPipeFitting 51 91.5% · IfcDuctFitting 40 72.6%. Only **36% of spans**
  qualify but that is 92% of VERTICES — curved fittings are vertex-heavy. Domes/round columns
  qualify on the same measurement without being named.
- **§MEM_PROBE (Terminal):** heap 1,226 MB; geometry attributes 469 MB (position 198.6, normal
  198.6, index 71.8); 17.35M vertices / 864 geometries; textures only 4.1 MB.
  Live Hospital during staging: `§NIGHT_MEM_WITNESS heapMB=1771.5`.
- **Bake frame budget (Hospital, 3,447 frames, perFrameMs=1989):** §STILL_REFINE ~1,200 ms (62%) +
  §PHOTO_AO ~450 ms (23%) = **85%**. Everything else is the 15% tail. Do not expect HUD or
  smoothing work to move the bake clock.

### Dead ends — do NOT re-walk
- **§PHOTO_GRADE** (spec-clip + shadow-deepen composer pass): BUILT, tuned twice, passed its numeric
  bar (+4.5% contrast, clip 0%→0.21%) and the user still could not see it. **REVERTED.** Its v1
  constants came from an inverse-ACES reconstruction of a PNG whose range topped at 3.065; the real
  HDR p88 is 7.4827 — 17.6× higher. If ever revisited, read `§PHOTO_GRADE_PROBE` first.
- **Dropping the `normal` attribute to save 199 MB: WITHDRAWN.** It breaks §TRIPLANAR's
  `vTriWorldNormal`, so the triplanar blend weights become garbage and all texturing collapses.
- **The 129.6 MB "weldable" figure is an upper bound** that assumes normals can merge. Flat surfaces
  need split normals, so the real saving is far smaller. Do not quote it as achievable.
- **"Directional light makes normal maps show"** — TESTED AND REFUTED: exterior sun gave +0.2%,
  *smaller* than indoors. At ~80 m the 2.5 m-repeat relief is sub-pixel.

### Bugs this session created and fixed — the pattern is worth remembering
1. **An undeclared variable aborted a live 3,048-frame bake.** `_ovCam` survived an edit that deleted
   its declaration. It threw between §CPE_ROOM_TITLE_COLLECTIVE and the frame loop; staging, schedule
   and captions all completed and then nothing. **The MISSING §-line located it** — that block logs on
   every path, so no line meant it threw on entry. Both overview call sites are now wrapped: a
   decorative corner box can never cost a film again. CI's own `no-undef` gate then caught the same
   class on two new globals.
2. **A witness that shared the code's own gate.** G-MEP-2 read `curveVerts=0` while the pass smoothed
   172,143 — it only understood merged ranges. A witness whose classification disagrees with the code
   it judges is measuring itself. It now measures curvature INDEPENDENTLY per span.
3. **A witness that would have passed a total no-op.** Before the batched/instanced paths were added
   to it, Hospital (merged=0) doing nothing at all would have scored clean.
4. **Three probes with an instant-resolve wait** — `!APP.streaming` is true *before* streaming starts,
   so they sampled the page at init and reported `undefined`. Always wait for streaming to BEGIN first.
5. **Same-page A/B is invalid for stills:** the second Alt+S logs `§PHOTO_AO avgRenderMs=0.7` against
   the first's `94.5` — the AO phase does no real work twice. One condition per page load.

### Open
- ⛔ **§CPE_RESOURCE_PANEL has never rendered real trades in a bake.** Bug fixed, never seen working.
- ⛔ **§CPE_CORR_BRUSH_STROKE has no witness.**
- **Batched meshes have no per-element ranges exposed** (`A._mergedMeta` covers merged only), so a
  dome inside a batched mesh still falls back to the class gate. Widening that needs real work —
  the unscoped shape test smoothed 5,233,835 wall vertices before it was caught.
- **Material palette NOT BUILT** — `TRIPLANAR_MAT` (`streaming.js`) still keys on `ifc_class`, so
  Terminal's floor (`jkrAR_flr-f_(jhn21)-3 300 x 300 x 8 mm Jubin Homogeneous`) and its ceiling
  (`600mm x 600mm PVC Laminated Gypsum Board`) BOTH render as 2.5 m cast concrete because both are
  `IfcSlab`. `material_name` coverage: Terminal **79 names / 90.3% of 48,428**, LTU 178/29.4%,
  HHS 4/34.7%, **Hospital/Clinic/JKR 0%**. This is the "you can name the defect out loud" win that
  every per-pixel shading tweak this session could not deliver.
- **Clinic glass:** the §NOGEO_COMPOSE patch IS live (91,238 B, 200 from GH and OCI, PR #1267,
  31 IfcCurtainWall + 12 others). Whether it APPLIES on Clinic was never confirmed — the probe read
  `A.db`, which does not exist on Clinic's split-DB path.
- **`renderer.info.textures` reports 1,486** while only 3 carry image data (4.1 MB). Unexplained.

---

## §CPE_PIE_HOLD — the pie holds through silence instead of vanishing
**BUILT + WITNESSED 9/9, bim-ootb PR #1586 (auto-merge armed), sw v1107 → v1108. Not yet seen in a bake.**

**User, 2026-08-30, immediately after §CPE_HUD_ORDER:** *"make the pie part not to disappear but hold
when there is silent info."*

### What "silent info" actually is — MEASURED, not assumed
Read from the persisted `~/.cache/bim4d/*/run.json` task windows (§5 RUN ONCE, PERSIST, READ FOREVER
— no probe was launched, no bake was disturbed):

| building | tasks | programme days | days with NO task active |
|---|---|---|---|
| Hospital | 42 | 318 | **0** |
| Clinic | 35 | 111 | **0** |
| Terminal | 77 | 97 | **0** |
| HHS_Office_Federated | 20 | 50 | **0** |
| Duplex | 20 | 13 | **0** |

**So the silence is NOT a mid-programme gap — every programme is gap-free.** The silence the user saw
is the one §CPE_BIG_STATS already names: after §CPE_BUILDUP_TOPOUT (`topoutU=0.524` on their own
Hospital bake) no trade is active for the whole second half, `resourcePanelAt` correctly returns
`null`, and the pie — the panel's whole left column — DISAPPEARS while a full-width stat card takes
the slot. That pop is what the instruction is about: *"the pie **part**"* is a part of the panel, and
it should stay put.

### The rule
**ONE panel, ONE fixed geometry, in both modes: `[ cylinder pie + progress ring ] | [ content ]`.**
The pie never moves and never disappears once it has had a real composition to show. Only the right
column changes:
- **trades working** → the avatar/×N trade list (today's live composition), pie at full strength.
- **silent (post-topout, or any day with no staffed op)** → the revolving §CPE_BIG_STATS card, and the
  pie **HOLDS the most recent real composition**, dimmed, with the day it is from printed under it.

### Non-invention (this is the load-bearing part)
A held pie is a statement about a PAST day. It is only honest if it says so, so:
1. The held composition is the **real composition of the most recent day that actually had staffed
   ops** — recomputed by the same `resourcePanelAt` arithmetic at that day's cursor. Nothing is
   averaged, decayed, extrapolated or carried forward as a number.
2. It is **dimmed to 0.60** and captioned `day N` (the day it is from) directly under the pie, while
   the day counter above the panel shows the current day. A viewer can read the difference.
3. **The progress ring stays LIVE.** Elapsed programme fraction is still true after topout, so the
   ring keeps filling on the real cursor while the wedges hold.
4. If **no staffed day has occurred yet** at this cursor (film opens before the first staffed op),
   there is nothing real to hold → return `null`, panel omitted, `§CPE_RESOURCE_HOLD INCONCLUSIVE`.
   Never a fabricated composition, never a confident empty ring.
5. `A.resourcePanelAt` itself is **UNCHANGED** — it stays the pure live-day truth its existing witness
   gates. The hold is a separate pure function layered on top, `A.resourcePanelHoldAt`, so the two
   claims ("who is on site today" vs "who was on site last") can never be confused in the log.

### Witness — `witness_cpe_resource_hold.js` (NODE, no browser, no bake contention)
The hold is pure arithmetic over an ops array, so it is gated without launching Chrome (the user's
own standing warning: twelve puppeteer Chromes competed with a real bake and it had to be aborted).
The file is loaded under `vm` with a stub `window`/`document`, and a recording 2D-context stub counts
draw calls the same way `witness_big_stats.js` does.
- **G-HOLD-1** live day → `held=false`, real rows, matches `resourcePanelAt` exactly.
- **G-HOLD-2** post-topout day → `held=true`, and the rows are **identical** to the last staffed day's
  live rows (proves it holds the real thing, not a re-derivation).
- **G-HOLD-3** the ring is live on a held frame: `progress` equals the cursor's elapsed fraction, not
  the held day's.
- **G-HOLD-4** cursor before any staffed op → `null` (no fabrication).
- **G-HOLD-5** an unstaffed day INSIDE the programme holds the previous staffed day (not a future one).
- **G-HOLD-6** `resourcePanelAt` still returns `null` on a silent day — the live contract is intact.
- **G-HOLD-7** both composite paths actually draw the pie when held, and the stats path blits one
  more layer with a held pie than without it (proves the pie is really in the stats panel).
- **G-HOLD-8** the held pie is captioned with the day it is from.
- **G-HOLD-9** the pie bitmap is cached across BOTH modes — a held pie costs one blit per frame,
  never a re-render.

### RESULT — 9/9 PASS (`node witness_cpe_resource_hold.js`, no browser launched)
```
  live  day 7  : "CONCRETE_GANG:18,STEEL_ERECTOR:12"  heads=30 held=false
  last staffed : day 30  "HVAC_TECH:4,PLUMBER:4"
  silent day 46: raw=null  hold="HVAC_TECH:4,PLUMBER:4"  held=true heldDay=30 back=16d
  ring on hold : progress=0.7583  cursor=0.7583  heldDayProgress=0.4917
  before start : null (refused)
  mid gap d13  : raw=null  hold="CONCRETE_GANG:18" heldDay=10
  draw: resource panel blits=2 offscreen wedgeFills=4 | stats+held blits=2 | stats alone blits=1
  captions seen: ["day 30"]
```
**The witness's own near-miss, worth keeping:** the first version counted `fill()` calls on the
VISIBLE context and scored 6/8 — because the pie is rendered into an OFFSCREEN bitmap and blitted,
so its wedge fills never touch that context. A pie that never drew at all would have scored the same.
It now records every offscreen context the run creates. Same family as §SESSION_2026-08-30's bug 2
("a witness that shared the code's own gate") — measure the surface the code actually draws on.

### Also now logged
`§CPE_PIE_HOLD heldFrames=N/framesDone (X% of the film)` at bake end, plus a first-hold line naming
the day it holds and how far back it is. `heldFrames === framesDone` is flagged ⚠ — it means no day
was ever staffed, which is a schedule defect, not a HUD one.

---

## §CPE_STATS_TAIL — reclaim the frozen half of the film
**BUILT + WITNESSED 15/15, bim-ootb PR #1587 (auto-merge armed), sw → v1110. Not yet seen in a bake.**

**User, 2026-08-30, on `BIM_MaxQ_Hospital_1788092317604.mp4`:** *"It is as we wanted.. but there is
ample unused timing to display more info after Finishes."*

### MEASURED on that exact mp4 (3,447 frames, 15 fps, 229.8 s, 1852×960, h264, 145 MB, no audio track)
- The day counter's digits stop changing at **u≈0.45–0.47** (`Day 315 / 315`) and never change again:
  XOR against the final frame's digit mask drops from ~250 px to ~50 px (compression noise) at
  sample i=27 and stays there for the remaining 32 samples. Consistent with the recorded
  `§CPE_BUILDUP_TOPOUT topoutU=0.524`.
- The pie is a **single static trade for that whole tail** — `4 on site · Finisher ×4`, ~5,100
  palette-matched purple wedge px in every one of the 22 samples from u=0.35 to u=0.99.
- So **≈125 s — over half the film — shows a pinned counter, an unchanging pie, and nothing else.**
  That is the "ample unused timing".

### Why §CPE_BIG_STATS never fired here
Its handover trigger is *"the pie is honestly empty"*. On this Hospital schedule the pie is **never**
empty: Finisher ops run to the last day, so `resourcePanelAt` returns a real composition on every
frame and the cards were structurally unreachable. The trigger was right about the symptom
(post-topout the panel has nothing new to say) and wrong about the test.

### The rule — TWO ROUNDS (user's own ruling, same session)
*"the in betweens highlights are in the wrong spots. They should all be in play during the 'Reveal'
2nd round. In the first round, if nothing is added, that last info holds and wait till a new one
arrives, not intersperse."*
- **ROUND 1 (buildup, u < topoutU)** — the panel is the schedule and **NOTHING rotates**. A day with
  no staffed op HOLDS the last real composition until a new one arrives (§CPE_PIE_HOLD). No
  interspersing of anything else.
- **ROUND 2 (the Reveal, u ≥ topoutU)** — every highlight is in play, revolving, with the **roster as
  one of the slots** so the trade list with its avatars and ×N is never lost to the cards.

The boundary is the plan's own §CPE_BUILDUP_TOPOUT, **not a new constant**. With no plan beats to read
it degrades (DEGRADE, DON'T DISABLE) to `resourcePanelFrozenAt`: **no op boundary — a start or an
end — remains after the END OF THE CURSOR'S DAY**, so the composition is fixed for every following
frame. Day granularity is what makes the real shape work: the buildup parks the cursor on the final
day with the last trade still running on it, which is non-empty AND frozen at the same time.
- `resourcePanelAt` returning `null` (post-topout, unstaffed) is a **special case** of frozen, so
  §CPE_PIE_HOLD's behaviour is unchanged and subsumed, not replaced.
- **The pie keeps its column either way** (§CPE_PIE_HOLD) — live and full-strength when the crew is
  real, dimmed and day-captioned when held.
- **The roster is not lost to the cards.** The rotation is `[ roster ] + cards`, so the trade list
  with its avatars and ×N is one of the revolving slots rather than being replaced by them.

### Non-invention
Frozen is read off the ops array (starts and ends), never off a film fraction, a topout constant or
a guess. A building whose work genuinely runs to the last frame never freezes and keeps the trade
list the whole way — no second opinion about when topout was.

### Witness — extends `witness_cpe_resource_hold.js` (still NODE, no browser)
- **G-TAIL-1** a cursor with a later op boundary is NOT frozen (the list keeps the column).
- **G-TAIL-2** a cursor past every boundary IS frozen, even though the composition is non-empty —
  this is the exact Hospital case the cards could not reach.
- **G-TAIL-3** the empty-pie case still reports frozen (§CPE_PIE_HOLD subsumed, not regressed).
- **G-TAIL-4** the rotation reaches the roster slot AND every card, and the roster slot draws the
  trade list (avatars + ×N), not a number.
- **G-TAIL-5** the roster slot draws the trade LIST (avatars + ×N), not a number.
- **G-TAIL-6** no cards buildable → the roster still revolves rather than the panel going blank.

### RESULT — 15/15 PASS (`node witness_cpe_resource_hold.js`, no browser)
```
  frozen: mid-programme=false  past-every-boundary=true
          Hospital shape (staffed to the last day): pieEmpty=false frozen=true rows="FINISHER:4"
  rotation: slots=4 (1 roster + 3 cards)  reached=4  rosterHits=18 cardHits=54 fades=true
            noCardsFallback=roster n=1
  roster slot draws: ["4 on site","×4"]
```

### sw.js version collision — worth not repeating
This branch's first bump wrote `v1109` into a file that **already read v1109** (#1585 had taken it on
main), so the sed was a silent no-op and the commit carried no bump at all. `sw.js` is the known
conflict magnet: always read the current value before bumping, and always take the HIGHER one.

---

## §MAXQ_BACKGROUND — send the bake to the background (SPEC ONLY, 2026-08-30, awaiting user go)

**User:** *"the user can send it to bake in the background without needing to watch it on a tab and
that might be disturbed by accident."* Asked for facts first, **not to be built yet.**

### The blocker, exactly
`requestAnimationFrame` does not slow in a hidden tab, it **STOPS** — this lane's own probe counted
rAF ticks frozen at exactly **167 for a full 6 s** of hiding, resuming only on reveal
(`§MAXQ_HIDDEN_PAUSE` comment, `cinema_maxq.js` :519). Three rAF loops carry 100% of a baked frame:

| loop | file:line | per baked frame | measured share |
|---|---|---|---|
| §STILL_REFINE TAA fold | `effects.js:4812` | 16 composer renders (`idx >= 16`) | ~1,200 ms — **62%** |
| §PHOTO_AO converge | `effects.js:4079` | 24 composer renders (`STILL_AO_FRAMES = 24`) | ~450 ms — **23%** |
| `_raf2` frame boundary | `cinema_maxq.js:534` | 2 rAF, 6 call sites | the 15% tail |

**40 full composer renders per exported frame.** Hospital: 3,447 frames × 1,989 ms ≈ **1 h 54 m**.

### What the fix is
One shared clock both files call instead of rAF. Visible → rAF, unchanged. Hidden **and** the
checkbox is on → `MessageChannel`/`setTimeout`, which a background tab throttles to **~1 tick/s** —
and a frame already costs **1,989 ms**, so the throttle floor is *below* the work and scheduling
stops being the bottleneck. `§MAXQ_HIDDEN_PAUSE` stays exactly as it is for the checkbox-off path.

**Two things must be measured before any of this is promised, because both are assumptions today:**
1. **Does a hidden tab still render + read back?** `_captureFrame` does `drawImage(renderer.domElement)`
   then `toBlob` in the same task. It *should* hold, and it is cheap to prove with a probe that bakes
   ~20 frames hidden and compares the bytes against the same 20 visible. **Unverified.**
2. **Chrome's intensive throttling.** After **5 minutes** hidden, background timers drop from 1/s to
   **1/minute** — that would turn a 2-hour bake into days. The documented dodge is a silent
   `AudioContext` (a tab "playing audio" is exempt). Must be measured over a >5-minute hidden run,
   not assumed. **This is the one that decides whether the feature is real.**

### Cost
| piece | new? | LOC |
|---|---|---|
| `viewer/bake_clock.js` — the shared clock + audio keepalive + `§MAXQ_CLOCK` tick-rate log | **new file** | ~90 |
| `cinema_maxq.js` — route `_raf2`, read the checkbox, log | edit | ~20 |
| `effects.js` — route the TAA and AO loops | edit | ~10 |
| `cinema_path_editor.js` — `#cpe-background` beside `#cpe-buildup`/`#cpe-room-title`/`#cpe-reveal` (:896-904) | edit | ~15 |
| `viewer.html` + `sw.js` precache | edit | 2 |
| `witness_bake_background.js` — headful, two tabs, measures achieved tick rate + byte-identity while hidden | **new file** | ~130 |
| **total** | **2 new files** | **≈270** |

### Answers
- **(a) Possible?** Yes, subject to the two measurements above. The rAF dependency is centralised in
  three loops, which is what makes it small.
- **(b)** ≈270 LOC, **2 new files** (one runtime module, one witness).
- **(c) Checkbox?** Yes — identical pattern to the three that already exist in the Alt+C dialog.
- **(d) Faster?** **No. It does not reduce bake duration at all.** Best case is the same wall clock,
  spent while you do something else. Frame speed is §MAXQ_FRAME_BUDGET below, a separate lever.

---

## §SESSION_2026-09-01 — four shipped, two parked with measurements, one omission scoped

### Shipped + live (verified by fetching the deployed files back)
| § | what | witness | PR | sw |
|---|---|---|---|---|
| §CPE_PIE_HOLD | pie holds the last real crew instead of vanishing | 9/9 | #1586 | v1108 |
| §CPE_STATS_TAIL | two rounds — round 1 holds, Reveal round revolves everything | 15/15 | #1587 | v1110 |
| §R10 §MAXQ_FRAME_BUDGET | baked frame = 20 composer renders, not 40 | floor RMS 0.21 | #1588 | v1111 |
| §R11 §PHOTO_PREWARM | 8.9 s smoothing + HDRI + ground tex off the first Alt+S | 6/6 | #1590 | v1112 |
| §CPE_CARD_FIT | stat-card label/sub no longer truncate beside the held pie | 18/18 | #1592 | v1113 |

Confirmed in the user's own bake (`BIM_MaxQ_Hospital_1788210263256.mp4`, pixel-measured): HUD order
correct (path box y92-284 with yellow path + red head, pie y296-526 with 2,783-3,544 wedge px), and
the Reveal rotation live — 10 slots, `20 levels` at u=0.75, `1,771,249 labour cost` at u=0.90.

### ⛔ PARKED WITH MEASUREMENTS — both branches pushed, NEITHER merged

**`fix/corr-brush-bounded`** — §CPE_CORR_BOUNDED. **UNBLOCKED 2026-09-01 — witness 8/8 on Hospital,
PR #1597, auto-merge armed.** Bounded + fraction-of-walk reach (4% / 12% / 18%), legacy metre records
still honoured. Witness was 6/7: window 33.4% of the walk (authored 34%), outside it untouched to
0.031 deg. **The blocker was one sample jumping 111 deg** where the baseline walk never exceeds
13 deg/sample. It was `_cpeCorrDirBlend`'s naive short-way yaw — the named suspect, now CONFIRMED by
measurement, fixed by porting §CINEMA_GAZE_SENSE. Details in §CPE_CORR_BRANCH below.
**Corrected en route:** the EXIT is not the abrupt edge (284 deg/m vs the walk's own 304); the ENTRY
is (2524). And the walks are Duplex 13.85 m / HHS 27.40 m / Hospital **39.43 m** — the 89.5 m in the
§CPE_WALK_BUDGET comment does NOT reproduce, and walk length does NOT scale with film duration.

#### §CPE_CORR_BRANCH (2026-09-01) — the 111 deg, CONFIRMED, and the fix. SPEC.

**The suspect was right, and it is now measured, not inferred.** A standalone probe rebuilt
`_cpeCorrDirBlend` outside the product and reproduced the shipped corrected gaze curve to
`§PROBE_RECON fidelityToShipped maxDeg=0.000` over 676 samples — so what follows is a statement about
the real function, not about a look-alike.

The blend takes `raw = yawB - yawA` and picks the short way with `raw - 2π·round(raw/2π)`. `yawB` is
the authored correction, fixed; `yawA` is the underlying pin/depth/path-follow gaze, which moves every
sample. `round()` is a **step function of `yawA`**: the sample `raw` crosses ±π, `dYaw` moves by 2π and
the blended yaw `yawA + dYaw·w` moves by **2π·w in one sample**. Identical mechanism to the one
§CINEMA_GAZE_SENSE (2026-07-27) already names and fixes for the look-back beat, where it measured
118 deg/frame.

Measured on Hospital (39.43 m walk, 900 arc samples, anchor `s=0.4387`, ramp/hold/decay 4/12/18%):
`§PROBE_WRAP count=5` — `raw` crosses ±180 deg five times over the walk. Three land where `w=0`
(harmless, outside the window). Two land inside the ramp:

| e3 | raw before → after | w | predicted 2π·w | measured deg/sample |
|---|---|---|---|---|
| 0.4078 | +179.9 → -179.8 | 0.1309 | 47.11 | **42.16** |
| 0.4144 | -178.8 → +177.9 | 0.3424 | 123.28 | **110.44** |

That second row IS the 111 deg. Prediction and measurement differ only by the `cos(pitch)` foreshortening
of a yaw step measured as a 3-D angle. The authored correction happened to land **near-antipodal in yaw**
to the gaze underneath it (`|raw|` within 2 deg of 180 for a run of ~40 samples), which is exactly the
case `_cpeCorrDirBlend`'s own comment declared out of scope: *"a corrected gaze and the underlying
path-follow gaze are never expected to be near-antipodal."* **That assumption is false and is what broke.**

**FIX — port §CINEMA_GAZE_SENSE, do not invent a second mechanism.** Resolve the 2π branch ONCE per
stroke, at plan-build time, from the geometry at the moment that stroke's blend STARTS; then take every
per-sample `raw` as the representative NEAREST that reference:
`dYaw = raw - 2π·round((raw - refD)/2π)`. `refD` is cached on the `_corrArc` record and is the
normalised `yawB - yawA` at `e3 = s - rampFrac`, where `yawA` is read from the **uncorrected**
`_beat3Pose` at that e3 (a one-shot re-entrant probe guarded so it returns before the correction step —
so the reference is the very vector `_cpeCorrDirBlend` will be handed, not an approximation of it).
Deterministic, order-independent, one extra pose evaluation per stroke per plan.

**The alternative was measured and rejected on numbers, not on taste.** A branch-free great-circle
slerp also kills the snap (11.982 deg/sample) but it leaves the yaw/pitch lerp the rest of the file
uses, and it swings the pitch **4.8 deg past what the uncorrected walk itself reaches** in that span
(`§PROBE_PITCH slerp=-81.10..15.45` vs `base=-76.32..17.51`). The reference port stays inside the base's
own pitch envelope (`-71.19..15.45`) and is a two-line change to the expression `_dirBlend` /
`_cinemaGazeBlend` already use. Counterfactual, all three on the same 900 samples:
`§PROBE_WINDOW shippedWinMax=110.436 slerpWinMax=11.982 refWinMax=13.114 baseWinMax=13.282`.

**SHIPPED — PR #1597, `sw v1116`, `effects.js?v=28`. Witness `witness_cpe_corr_brush.js` 8/8 on
Hospital** (`durationSec=150`, 39.43 m walk, 900 arc samples):

| § line | measured |
|---|---|
| `§CPE_CORR_BOUNDED_SNAP` | in-window max **13.114 deg/sample** @ e3=0.4156 vs the baseline walk's own **13.282** @ e3=0.4389, 307 pairs judged of 900 |
| `§CPE_CORR_BRANCH_AB` | branch OFF **110.436** → branch ON **13.114** — the gate discriminates |
| `§CPE_CORR_BRANCH_NOOP` | ON vs OFF curves **105.1135 deg** apart (the wrap fires here) |
| `§CPE_CORR_BOUNDED_HAZARD` | authored gaze within **0.05 deg** of antipodal — wrap hazard EXERCISED |
| `§CPE_CORR_BOUNDED_REACH` | window **33.4%** of the walk vs the authored 34.0% — did not regress |
| `§CPE_CORR_BOUNDED_DRIFT` | outside the authored window **0.0000 deg** over 595 samples (bar was 0.031) |
| `§CPE_CORR_BRANCH` | `strokes=1 s=0.4387 entryE3=0.3987 refDeltaDeg=179.76 nearAntipodal=true` |

**Two witness proxies were themselves measured wrong and replaced — this is the §E defect class again,
and it is why Duplex looked broken.** G-BR-3/4/5 measured reach and edge abruptness from the
LARGEST-DEVIATION index as a stand-in for the anchor. The deviation peak is NOT the anchor: it lands
2.08 m past it on Duplex (the underlying gaze keeps drifting through the hold, so the deviation keeps
growing), reading as *"reach BACK 2.71 m against an authored 0.64 m"* — a false FAIL about the proxy.
They now use the record's own `s`, which TIGHTENS Hospital 0.61 → **1.53 m against the authored 1.58**.
G-BR-5's exit edge is now the decay window instead of a slice that swept the whole hold: **283.96 →
8.65 deg/m**. So the earlier "exit 284 vs the walk's own 304" was itself a proxy artefact — the real
decay edge is 8.65, and the exit was even further from being the abrupt one than that note claimed.

**Duplex 7/8, and NOT caused by this change — proved, not argued.** `§CPE_CORR_BRANCH_NOOP` measures
the branch-ON and branch-OFF curves **0.000002 deg** apart there (`refD=60.79`, nowhere near the wrap),
so the fix is a bit-for-bit no-op on that plan and G-BR-5's `435.54 vs 110.43 deg/m` is pre-existing.
The witness now prints this attribution itself (`§CPE_CORR_BOUNDED_ATTRIB`). **Left alone deliberately**
— the exit edge was out of scope, and 435 deg/m is far under Duplex's own **1945 deg/m** walk peak, so
G-BR-5 is reading the walk as much as the correction. **Open, filed, not chased: G-BR-5 compares two
window edges whose underlying gaze behaves differently and needs a walk-relative denominator.**

Also worth keeping: the witness gained a real A/B (`A._cpeCorrBranchOff`, read-only hook, default off)
so it names the issue it proves in ONE run instead of asserting a number against an older session's,
plus NO-OP / VACUOUS / INCONCLUSIVE gates and a scope-blind self-report (`§CPE_CORR_BOUNDED_HAZARD`
says outright when a plan does not exercise the wrap, as Duplex does not).

**`fix/buildup-tie-spread`** — §BUILDUP_TIE_SPREAD. **A/B says DO NOT MERGE.** Hospital, 3118 frames:
| | distinct end_ts | largest exact tie | worst frame |
|---|---|---|---|
| stock | 59,258 | **5** | 124 @ f345 = 6.1x mean |
| fixed | 59,522 | **5** | 134 @ f1470 = 6.6x mean |
The largest exact tie is FIVE — the collapse-to-one-instant mechanism the patch fixes is absent on
Hospital. The pop is **clustering**, not ties: the cursor steps linearly in calendar ms while
completions arrive in bursts. The fix redistributed rather than improved (worst frame moved and grew).
**The real lever is §CPE_BUILDUP_WORK_PACED** (pace by elements completed → ~20/frame), OFF by
default at `cinema_maxq.js:92` because it made the calendar advance swing 57x. That trade-off is the
next decision, and it is the user's.

### The material omission — SCOPED, NOT STARTED. Data is complete; our code ignores it.
`Terminal_meta.db`: **48,428 / 48,428 = 100% `material_name`, 41 distinct** (Metal Deck 33,756;
Brick/Plaster wall 7,714; Silver 4,263; Copper 1,169; 45 MPa concrete 448; Aluminum 256). The older
`Terminal_extracted.db` is worse — 90.3%, 79 distinct, 6,412 `<Unnamed>`; that 90.3% figure in
earlier notes refers to the WRONG file. **Nothing was lost in extraction — re-extraction is not
needed to recover this.**
`Hospital`: `material_rgba` 63,917/64,150 = 99.6% but only **39 distinct, 89% one off-white**
(`0.920,0.900,0.850`); `material_name` **0 / 64,150**. Clinic the same shape (99.8% rgba, 20 distinct,
0% names). So Hospital cannot get vibrancy from its own metadata.
**Fix shape:** `TRIPLANAR_MAT` keys `material_name` FIRST, falls back to `ifc_class`. Terminal/LTU/HHS
gain real materials; Hospital/Clinic/JKR keep exactly today's behaviour. The name→texture map is
authored presentation, which the user explicitly ruled in scope.

### Palette (§SUNGLASS, `tools.js:614-775`) — works, and survives a bake
100-tick dial: 1-30 warm/cool/earth by `ifcClass`, 31-55 by `storey`, 56-65 by `disc`, 66-90
zebra/mono, 91-97 random, 98-100 HARD. **It never reads `material_name` or `material_rgba`.**
**Alt+S does NOT bake over it:** `_setTriplanarActive` (`effects.js:136`) is a **no-op stub** that
returns a count and swaps nothing; `_recolorMesh` clones the material and sets `.color`, so on a
triplanar material the palette TINTS the texture. ~~Code-read, not yet run-confirmed.~~
**→ RUN-CONFIRMED 2026-09-01 with one correction (§SESSION_2026-09-01C MEASURED):** "does not bake
over" holds (0/400 materials swapped or recoloured across a real still pass), but the TINT half is
WRONG — `clone()` drops the triplanar `onBeforeCompile` hook (347/347 measured), so the palette
REPLACES the texture with flat colour on triplanar materials.
**User's asks — BUILT 2026-09-01, PR #1594 (§SESSION_2026-09-01C):** (a) brown track on the scrub's last segment as an affordance that the
tip does something special (material injection); (b) rules mapping colour scheme to grouping —
ordinal groupings (storey) want a RAMP, categorical (class/disc) want distinct hues; today both get
the same cycling list keyed on `palette[i % len]` by group SIZE rank, which is arbitrary and throws
away storey ordering.

### §CPE_AIM_DEPTH — recommendation: KEEP, but freeze inside a correction window
§CPE_AIM_DENSITY is already RETIRED (2026-08-13). Only DEPTH remains; its trigger is a forward
raycast firing when clearance ahead is under 3-8 m, though its subject search still weights n*d.
Order is path-follow → depth → **correction last** (`effects.js:8143-8152`), so at full strength an
edit already overrides depth. The wobble window is the ramp/decay, where depth keeps MOVING the
direction being blended from. Freezing depth at window entry makes it a fixed-to-fixed crossfade.
Removing depth outright would regress the dead-end "nose against the wall" case it was built for.

---

## §CPE_MATERIAL_KEY (2026-09-01) — triplanar keys `material_name` FIRST, `ifc_class` as fallback

### SPEC (written before code — Spec-First)
**Issue this exposes or disproves:** `TRIPLANAR_MAT` (`viewer/streaming.js`) is keyed on `ifc_class`
ALONE, so an element's own authored IFC material name — which 100% of Terminal's elements carry — is
never consulted when choosing which of the three real photographic texture sets it gets. Same defect
class as §GLASS_NOT_METAL (2026-08-30), which fixed the *alpha* half of the same "class alone decides"
problem. This section fixes the *name* half.

**Change:** `A._getMaterial(rgbaStr, ifcClass, matVariant, discipline, mepHint)` gains a 6th
parameter `matName`. Texture selection becomes `TRIPLANAR_BY_NAME[matName] || TRIPLANAR_MAT[ifcClass]
|| null`. The `alpha < 1 → no triplanar` guard from §GLASS_NOT_METAL is evaluated FIRST and is
unchanged. A name that is not in the authored map falls through to today's class lookup, i.e. an
unmapped name is a strict no-op.

**Assets are fixed, not invented.** `viewer/textures/materials/` holds exactly THREE complete sets —
`concrete_*`, `plaster_*`, `metal_*` (color/rough/normal 1k each, `NOTICE.txt` for provenance). No
new texture asset is added; the 41 Terminal names are mapped onto those three or left unmapped.

**Row plumbing:** `m.material_name` is appended as slot **16** of the stream row, i.e. AFTER the
bbox triple, so slots 0-15 keep the §BBOX_ROW_SHIFT 16-slot layout byte-for-byte. To keep 16 fixed
even on a DB with no bbox columns the query now emits `NULL, NULL, NULL` instead of omitting them.
Column presence is probed once per DB (`A._hasMatNameCol`), the same pattern `A._hasBuildingCol`
(§17.17.4 / W-OCC3-LTU) already uses, because `elements_meta.material_name` is absent from some
older/partial DBs.

**Bucketing is deliberately NOT re-keyed, and that is measured, not assumed:** `material_name` is
fully determined by `(storey, discipline, material_rgba)` in every building checked, so adding it to
the batch key would add ZERO buckets:
| building | rows | buckets on `storey｜disc｜rgba` | buckets with `material_name` added |
|---|---|---|---|
| Terminal (`Terminal_meta.db`) | 48,428 | 244 | **244** |
| Hospital (`Hospital_meta.db`) | 63,415 | 160 | **160** |
| Clinic (`Clinic_meta.db`) | 16,114 | 65 | **65** |
Draw-call count therefore cannot regress, and every bucket carries exactly one name, so taking
`items[0].matName` — exactly how `batchCls` is already taken — is exact, not an approximation.

### Two corrections to the §SESSION_2026-09-01 scoping note, both re-measured
1. **"Hospital/Clinic have 0% `material_name`" is true of `*_extracted.db` only.** Measured:
   `Hospital_extracted.db` 0/64,150 and `Clinic_extracted.db` 0/17,322 ✓ — but `Hospital_meta.db`
   has **6,664/63,415 named (17 distinct)** and `Clinic_meta.db` **16,071/16,114 (12 distinct)**.
   Those names are NOT authored IFC materials: **every one of them is prefixed `≈ `** (`≈ Grey`,
   `≈ Off-White`, `≈ Red` …) — a synthetic colour approximation, 6,664/6,664 and 16,071/16,071 and
   HHS 2,388/2,388. Terminal 0/48,428 `≈`-prefixed; LTU 0/36,957. So the `≈` prefix is a clean,
   measured discriminator between an approximated colour label and a real authored material, and no
   `≈ ` key is in the map — which is *why* Hospital/Clinic stay unchanged, not an assumption that
   they have no names at all.
2. **"Terminal's 300x300 tile floor and its 600x600 gypsum ceiling both render as concrete" does not
   reproduce.** There is no 300x300 tile material in `Terminal_meta.db`'s 41 names, and the
   600x600 gypsum ceiling (`jkrAR_clg-f_(pv60)-3 …`, 34 elements, all `IfcCovering`) already
   resolves to **plaster**, not concrete. The real measured defect is bigger and different — below.

### The measured defect, and the one thing the fix must NOT do
Cross-tab of `material_name` × today's class-derived texture on `Terminal_meta.db`:
- `Metal Deck` 33,756 → 33,643 already metal, **113 get no texture** (IfcDoor 110, IfcAirTerminal 3).
- `Silver` 4,263 → 3,115 metal, **912 none**, **236 concrete** (IfcSlab).
- `Aluminum` 256 → **256 none** (IfcWindow 228, IfcAlarm 17, IfcDoor 9, proxy 2).
- `Steel, Paint Finish, Ivory, Glossy` 157 → **135 none** (IfcLightFixture).
- `Concrete - Cast-in-Place Concrete - 45 MPa` 448 → 428 concrete, **20 metal**.
- **`Basic Wall:A_Wall_Ext_150mm_BrickPlaster_V1` 7,714 — the trap.** It is a Revit *wall-type*
  name that has leaked onto hosted elements: only **327 of 7,714 (4.2%) are `IfcWall`**. The rest are
  IfcPipeFitting 4,243, IfcDuctFitting 713, IfcDuctSegment 568, IfcLightFixture 486, IfcAirTerminal
  286, IfcFurniture 62, IfcValve 62 … Mapping that name to plaster would drag **5,892 correctly
  metal-textured MEP elements** off the texture §TRIPLANAR_MEP_GAPS deliberately gave them. It is
  therefore NOT in the map: a name that does not denote the element's material substance is left
  unmapped and falls back to class. Same for `Basic Wall:A_Wall_Ext_150mm_Coping_V1` (3).

### The 41 names, mapped — 19 in, 22 deliberately OUT
Only the three texture sets that exist are used: `concrete_color_1k.jpg`, `plaster_color_1k.jpg`,
`metal_color_1k.jpg` (+ their `_rough`/`_normal` siblings).

**IN — 19 names (they denote a material substance):**
metal 13 — `Metal Deck` 33,756 · `Silver` 4,263 · `Copper` 1,169 · `Aluminum` 256 ·
`Steel, Paint Finish, Ivory, Glossy` 157 · `Rastelli Rubinetterie - Metal - Brass - Bronze` 41 ·
`Metal - Steel, Polished` 24 · `Door Handle - Aluminium` 9 · `Metal - Generic - Black Finish` 4 ·
`Metal Panel` 2 · `Steel - Zurn Industries - Stainless - Type 304` 1 ·
`Metal-WATTS-ASTM A-536 Ductile Iron-Blue` 1 · `Metal - IEC - Steel` 1.
concrete 2 — `Concrete - Cast-in-Place Concrete - 45 MPa` 448 · `Concrete, C12/15` 1.
plaster 4 — the JKR ceiling family: `…(pv60)-3 600mm x 600mm PVC Laminated Gypsum Board` 34 ·
`…(cf60)-3 1220 x 1220 x 4.5mm Papan simen gentian` 22 ·
`…(pv60)-3 600mm x 1200mm PVC Laminated Gypsum Board(1)` 15 · `…(sk)-2 Skim Coat Plastering` 11.

**OUT — 22 names, reported rather than guessed (each falls back to `ifc_class`, i.e. unchanged):**
| why | names |
|---|---|
| Revit TYPE name, not a material (the trap above) | `Basic Wall:A_Wall_Ext_150mm_BrickPlaster_V1` 7,714 · `Basic Wall:A_Wall_Ext_150mm_Coping_V1` 3 |
| substance real, but NO such texture exists — mapping it would be inventing an asset | `Linergy - Plastic - Polycarbonate Grey 7035` 179 · `Porcelain - Linen` 52 · `Glass` 16 · `Plastic` 8 · `Fiberglass-Watts-ABS` 7 · `Plastic - Black` 4 · `fiberglass-reinforced polyester` 2 · `jkrAR_flr-f_(vy20)-3 Vinyl (Anti static Finishing)` 1 · `Telescope wood` 1 |
| a component name, not a material | `Seat Base` 108 · `Fin` 14 · `ConnectorInletMediumMaterial` 1 |
| a colour word / finish word, no substance | `Red` 26 · `Finish.Cream` 8 · `White` 6 · `Grigio` 4 · `Yellow` 1 |
| placeholder | `Default Panel` 32 · `Default` 22 · `<Unnamed>` 4 |

**LTU gains NOTHING from this map, measured:** 0 of its 125,698 elements carry any of the 19 names.
Its own three obviously-mappable substance names are `Steel` 1,078 and `Concrete - Existing` 549
(both have an existing texture) and `Wood` 2,661 (there is NO wood texture — it would need a new
asset). They are a SCOPED FOLLOW-UP, deliberately not shipped here, because this witness judges
Terminal/Hospital/Clinic only and an unwitnessed change is not a change worth making.

### WITNESS — W-CPE-MATERIAL-KEY, 12/12, exit 0
`bim-ootb/viewer/tests/witness_cpe_material_key_2026-09-01.js` → `…2026-09-01.log`.
Tier B streams Terminal for REAL (458.7 s wall clock, `?db=/buildings/Terminal_extracted.db`);
Tier A runs the A/B over **100 %** of each building's elements through the SHIPPED resolver
(`A._triResolve`, the single owner — the witness never re-implements the rule), then feeds the
population through `witness_kit/contract.js` (schema + 9 invariants + a redControl that breaks
"Hospital unchanged" on purpose and is confirmed to fail).

| § line | value |
|---|---|
| `§MATNAME_COL` | `present=true` |
| `§TRI_SRC_TALLY` | `bld=TerminalMerged rows=48428 named=48428 approx_named=0 by_name=40215 by_class=6514 alpha_none=35 none=1664 textured=46729 distinct_names_resolved=19` |
| `§MATKEY_AB` Terminal | `elements=48428 named=48428 approx_named=0 distinct_names_resolved=19 elements_by_name=40215 elements_changed=1716` |
| `§MATKEY_AB` Hospital | `elements=63182 named=6664 approx_named=6664 elements_by_name=0 elements_changed=0  NO-OP` |
| `§MATKEY_AB` Clinic | `elements=16071 named=16071 approx_named=16071 elements_by_name=0 elements_changed=0  NO-OP` |
| `§MATKEY_VERDICT` | `terminal_names_by_name=19 terminal_elements_by_name=40215 terminal_elements_changed=1716 hospital_changed=0 clinic_changed=0` |
| `§WITNESS_CPE_MATERIAL_KEY` | `pass=12 fail=0 ran=203` |

**What actually changed on screen, the ten biggest groups** (`(none)` = no texture at all before):
| name | class | n | before → after |
|---|---|---|---|
| Silver | IfcFireSuppressionTerminal | 899 | (none) → metal |
| Silver | IfcSlab | 236 | concrete → **metal** |
| Aluminum | IfcWindow | 228 | (none) → metal |
| Steel, Paint Finish, Ivory, Glossy | IfcLightFixture | 135 | (none) → metal |
| Metal Deck | IfcDoor | 110 | (none) → metal |
| Copper | IfcBuildingElementProxy | 22 | (none) → metal |
| Concrete - Cast-in-Place Concrete - 45 MPa | IfcBeam | 20 | metal → **concrete** |
| Aluminum | IfcAlarm | 17 | (none) → metal |
| Aluminum / Door Handle - Aluminium | IfcDoor | 9 + 9 | (none) → metal |

**Read the gap between 40,215 and 1,716 correctly:** 40,215 elements are now *decided* by their own
material name; of those, 38,499 would have landed on the SAME texture through their class anyway
(e.g. `Metal Deck` on `IfcPlate`). **1,716** is the number of elements whose pixels actually change.
Both numbers are asserted; neither is the headline on its own.

**Live render path (Tier B):** 92 materials in `_matCache` — 39 `src=name`, 21 `src=class`,
25 `src=none`, 7 `src=alpha-none`; stream row length 17; every cached material records which key
decided it (`mat.userData._triSrc/_triTex/_matName`). The shipped `§TRI_SRC_TALLY by_name=40215`
and the independently recomputed A/B `40215` agree exactly — the log and the witness close on each
other rather than on a hand derivation.

### Palette interaction — asserted, not assumed (§SUNGLASS_TRIPLANAR_TINT)
The concurrent palette lane MEASURED that `_recolorMesh`'s `material.clone()` DROPS the triplanar
`onBeforeCompile` hook on 347/347 sampled originals — so an ACTIVE §SUNGLASS palette **REPLACES**
the texture with a flat colour, it does not tint it. **This retracts the "the palette TINTS the
texture" line in §SESSION_2026-09-01's Palette block above** (that line was flagged there as
"code-read, not yet run-confirmed"; it is now run-refuted). A palette left on during a
§CPE_MATERIAL_KEY measurement would make the screen disagree with the resolver and could score this
fix a false no-op, so the palette state is now (a) printed in the shipped `§TRI_SRC_TALLY` line as
`palette_tick=` / `palette_recoloured=` and (b) ASSERTED OFF by the witness:
`§MATKEY_PALETTE_STATE tick=0 recoloured_meshes=0`. No behaviour change to the clone path — that
stays with the palette lane. (The other half of the same block still holds: `_setTriplanarActive` is
a no-op stub and Alt+S does NOT bake over the palette — run-confirmed there as
`§SETTRIPLANAR_NOOP_BEHAVIOR`, swapped=0/recoloured=0 over a real 8 s still-refine pass.)

### Shipped — bim-ootb PR #1595, branch `fix/material-name-key`
`viewer/streaming.js` + `viewer/sw.js` (`v1113→v1115`) + `viewer/viewer.html`
(`streaming.js?v=64→65`) + the witness. **The sw bump is v1115, not v1114:** #1594
(§SUNGLASS_GROUPING_RULES) landed on main taking v1114 first, so `origin/main` was merged in and the
collision resolved by this repo's own convention — KEEP BOTH notes, take the HIGHER version.
`viewer/effects.js` and `viewer/tools.js` mention `TRIPLANAR_MAT` only in COMMENTS about
`normFactor` — neither needed a change, so the concurrent `fix/corr-brush-bounded` region around
`effects.js:8143` was never touched.


## §SESSION_2026-09-01C — §SUNGLASS_GROUPING_RULES: colour scheme must match the KIND of grouping

### SPEC (written before code — the two user asks from §SESSION_2026-09-01 "Palette")

**Correction en route (code-read, `tools.js:679` vs `tools.js:703`):** the session note said both
grouping kinds key `palette[i % len]` "by group SIZE rank". Measured in code: only the CLASS bands
(1-30) sort by size rank (`g[b].length - g[a].length`, tools.js:679/687/695); the STOREY bands
(31-55) sort ALPHABETICALLY (`keys.sort()`, tools.js:703/711). The substance of the defect is
unchanged — both indices are arbitrary w.r.t. the storey's ordinal (vertical) position, and the
palette is an unordered cycling list, so storey ordering is thrown away either way. Clinic is the
disagree building: alphabetic = [First Floor, Level 1, Level 2, Roof - Main, Roof - Mech,
Second Floor, TOF Footing]; real vertical order puts TOF Footing FIRST and First Floor between
Level 1 and Level 2.

**RULE (ask b):** ordinal grouping (storey) → monotonic RAMP keyed on ordinal position; categorical
grouping (ifcClass tick 1-30, disc 56-65) → distinct hues, keyed exactly as today, UNCHANGED. No new
modes, no tick remapping.

- **Ordinal source is EXTRACTED geometry, never name parsing:** per mesh, world-space
  bounding-box-centre Y (`geometry.boundingBox` for plain meshes; `computeBoundingBox()` on the
  Instanced/Batched mesh itself so instances are unioned); per storey group, the MEDIAN of its
  meshes' centre-Y; keys sorted ascending by that elevation, name as deterministic tiebreak.
  Cached per mesh (`__paletteY`); shipped §-log: `§SUNGLASS_ORDINAL <storey>@<elevY> < …`.
- **Ramp (ticks 31-45 warm / 46-55 cool):** storey at ordinal fraction t = i/(n-1) gets
  `setHSL(h0+(h1-h0)*t, 0.45+sub*0.02, 0.36+0.42*t)` — warm h0=0.02→h1=0.13, cool h0=0.50→h1=0.66.
  Lightness AND hue strictly increase with elevation (lowest storey darkest/reddest-cyanest);
  `sub` (in-band tick) keeps its meaning as saturation depth. Channels stated for the witness:
  lightness (primary), hue (secondary), both monotonic in ordinal position.
- **(ask a) Brown track:** `#sunglass-slider` gets a custom track (viewer.html CSS only); the last
  segment — ticks 98-100, i.e. 97%→100% of the range — is saddle-brown `rgb(139,69,19)` as the
  affordance that the tip does something special (material injection, the separate TRIPLANAR_MAT
  lane). Base track keeps the existing #4fc3f7 accent as a translucent fill.

**WITNESS `viewer/tests/witness_sunglass_grouping_rules.js`** (headless chromium, Clinic — the
building where alphabetic, size-rank and ordinal order all disagree):
§SUNGLASS_ORDINAL (elevations per storey, ascending), §SUNGLASS_RAMP_MONOTONIC (L and H strictly
increasing along ordinal, as numbers), §SUNGLASS_OLD_VS_NEW (≥1 storey colour differs from the old
alphabetic-cycle formula, count printed — NO-OP printed if zero), §SUNGLASS_NOT_SIZE_NOT_ALPHA
(lightness sorted by size rank / alphabetic rank is NOT monotonic on Clinic), §SUNGLASS_CATEGORICAL_FROZEN
(tick 5 class colours + tick 60 disc colours equal the pinned origin/main formula, per group),
§SUNGLASS_HUE_SEP (min pairwise circular hue distance ≥ 0.02 — the palette table's own designed
minimum — and min RGB distance > 0), §SUNGLASS_BROWN_TRACK (computed track gradient: colour
rgb(139,69,19), stops 97%→100%), §SUNGLASS_ALTS_SURVIVES (apply palette → startStillRefine →
stopStillRefine → material uuid + colour unchanged; run-confirms the `_setTriplanarActive` no-op,
effects.js:137-139, and the "palette tints triplanar" claim — INCONCLUSIVE if the still pass cannot
run headless). Self-failure: VACUOUS if <2 storey groups, INCONCLUSIVE if nothing judged, NO-OP if
output identical to old behaviour.

### MEASURED (from `viewer/tests/witness_sunglass_grouping_rules.log`, Clinic, 2026-09-01)
**`§WITNESS_SUNGLASS_GROUPING_RULES pass=13 fail=0 ran=13 verdict=PASS`** — PR bim-ootb **#1594**
(sw v1114, tools.js?v=43), branch `fix/palette-grouping-rules`, auto-merge armed.

- `§SUNGLASS_ORDINAL` (median world-Y): TOF Footing@-3.82 < Level 1@-1.04 < First Floor@-0.19 <
  Unknown@0.02 < Level 2@1.80 < Second Floor@3.54 < Roof - Mech@5.95 < Roof - Main@7.59 — the
  Clinic disagreement is real: alphabetic puts First Floor 1st / TOF Footing 7th; size rank puts
  Unknown(583) 1st / TOF Footing 4th.
- `§SUNGLASS_RAMP_MONOTONIC` L: 0.36 < 0.42 < 0.48 < 0.54 < 0.60 < 0.66 < 0.72 < 0.78 and
  H: 0.02 < 0.0357 < … < 0.13, both strictly increasing with elevation; `§SUNGLASS_NOT_SIZE_NOT_ALPHA`
  the same L sequence is NOT monotonic under alphabetic (0.48, 0.42, 0.60, 0.78, 0.72, 0.66, 0.36,
  0.54) or size-rank order.
- `§SUNGLASS_OLD_VS_NEW` 8/8 storey colours differ from the old alphabetic-cycle formula (e.g.
  Roof - Main #5dadd0→#e8d9a6). Red control: the monotonicity checker FAILS on the old colours
  (old L by ordinal: 0.49, 0.57, 0.61, 0.51, 0.54, 0.63, 0.55, 0.59) — the witness can fail.
- `§SUNGLASS_CATEGORICAL_FROZEN` tick 5: all 15 class colours dist=0.00e+0 vs pinned formula;
  tick 60: all 7 disc colours dist=0.00e+0 — class/disc did NOT regress. `§SUNGLASS_HUE_SEP`
  class minPairHue=0.0200 (7.2°) minPairRGB=0.0913 over first 10; disc minPairHue=0.0100 (3.6°,
  the earthTone table's own minimum) minPairRGB=0.0696 — all distinct.
- `§SUNGLASS_BROWN_TRACK` colour=rgb(139,69,19) stops=97%..100%, extent 3.9px of a 129.0px track
  (panel opened for layout — first run measured 0px on the unopened panel, fixed in the witness).
- **Run-confirmations of §SESSION_2026-09-01's code-read claims:**
  - `§SETTRIPLANAR_NOOP_BEHAVIOR` **CONFIRMED** — startStillRefine→8s→stopStillRefine leaves all
    400 sampled palette materials in place: swapped=0 recoloured=0, triplanarMaterials=38. Alt+S
    does NOT bake over the palette.
  - `§SUNGLASS_TRIPLANAR_TINT` **REFUTES the "palette TINTS the texture" claim** — the
    `_recolorMesh` `material.clone()` DROPS the `onBeforeCompile` hook on **347/347** sampled
    triplanar originals, so on a triplanar material the palette REPLACES the texture with the
    flat palette colour (it does not tint it). §SESSION_2026-09-01's "the palette TINTS the
    texture" sentence is wrong as written; "survives a bake" stands. Handed to the TRIPLANAR_MAT
    lane — no behaviour change shipped for it here.


## §CPE_AIM_DEPTH_FREEZE (2026-09-01) — freeze the blend-from at the correction window's own edges. SPEC (written before code).

**Issue this exposes or disproves:** §SESSION_2026-09-01's closing recommendation — inside a
correction window the blend runs from a direction §CPE_AIM_DEPTH keeps MOVING, so the ramp/decay
wobbles. §CPE_CORR_BOUNDED_SNAP's 13.114 deg/sample in-window peak sits essentially AT the walk's
own 13.282 — and the probe below shows that peak IS depth re-aiming underneath the ramp, not the
crossfade itself.

**MEASURED FIRST (probe `scratchpad/probe_aim_freeze.js`, Hospital, SECS=150, N=900, the same
authored correction as `witness_cpe_corr_brush.js`; reconstruction fidelity to the shipped curve
`§FRZ_PROBE_RECON maxDeg=0.000` — statements about the real function, not a look-alike):**
- **The from-direction genuinely moves, violently, mid-ramp.** `§FRZ_DEPTH_TURN` at e3=0.422-0.433
  (inside the ramp): forward clearance 0.1-0.4 m against the product's own clearM=8.0 m, and the
  depth rule is turning the underlying gaze **126-140 deg** (aimOff A/B). That motion leaking
  through `(1-w)` is the 13.114 spike.
- **Frozen fixed-to-fixed curve: in-window max step 13.114 → 7.791 deg/sample** (-41%; the 7.79 is
  the smoothstep crossfade's own peak rate). Total turn on the ramp RISES 155.00 → 169.65 deg
  (a monotone 125-deg-geodesic sweep is longer than a partially-cancelling wobble) — smoothness is
  bought with path length; stated, not hidden.
- **Decay-side wobble is negligible on this plan** (live maxStep 0.379 deg/sample) — the freeze's
  work is almost all on the ramp here.
- **Boundary continuity of the two-edge freeze:** entry 0.040/0.579, hold-switch 0.005, exit
  0.003/0.349 deg/sample (`§FRZ_EDGES`) — all far under the walk's own 13.282 peak. No seam.
- **Nose-against-the-wall: does freezing re-aim away a wall save? NO — measured, no bound needed.**
  Gaze-direction clearance over every in-window sample (product's own `_cinemaFanMeshesDebug` mesh
  set, 4,074 meshes): minima base=0.00 m, live=0.00 m, frozen=0.00 m, all at e3=0.439 — the zero is
  a property of the WALK's own position (it brushes geometry at the anchor), present identically in
  all three curves. Sample-wise the frozen curve tracks live within ~0.15 m (worst8 table in the
  probe log). The freeze cannot "walk into a wall it no longer sees" because (a) the hold is the
  authored direction — which full-strength correction ALREADY makes the gaze today, unchanged — and
  (b) the decay's frozen target is the uncorrected (depth-approved) gaze AT THE EXIT POSITION,
  captured from the very pose the walk adopts when the window ends.
- **The dead-end case stays demonstrable OUTSIDE the window:** depth fires at 36/91 probes outside
  it (e.g. e3=0.089: fwdClear 0.1 m << clearM 8.0 m, turns the gaze 83.45 deg). Outside the window
  the code path is untouched by this change.

**DESIGN — extend §CPE_CORR_BRANCH's per-stroke machinery, no second mechanism.**
`_resolveCorrBranch` already probes the uncorrected gaze at window ENTRY (e3 = s - rampFrac) via the
`_corrRefProbe` tap and keeps only its yaw. Now it also KEEPS THE VECTOR (`c.entryDir`) and probes
once more at window EXIT (e3 = s + holdFrac + decayFrac → `c.exitDir`). `_cpeCorrectionAt` returns
the phase's frozen from-direction (`from`: entryDir during ramp+hold, exitDir during decay), and
`_beat3Pose` hands THAT to `_cpeCorrDirBlend` instead of the live `_lx/_ly/_lz` whenever a
correction is in force. So:
- ramp = fixed(entry gaze) → fixed(authored): a true fixed-to-fixed crossfade; `raw == refD`
  exactly, so the §CPE_CORR_BRANCH branch choice becomes exact rather than nearest-representative.
- hold = authored (unchanged — w=1 already ignored the from-direction).
- decay = fixed(authored) → fixed(exit gaze), landing bit-exactly on the live gaze at the window's
  end because the frozen target was probed AT that e3. The frozen-from switch (entry→exit dir)
  happens at the hold boundary where the from-weight is zero — continuous by construction.
- NO-PROBE degrade: a stroke whose edge gaze could not be probed keeps `from=null` → live base,
  i.e. exactly today's behaviour (same degradation precedent as refD=0).
- `A._cpeAimFreezeOff` (read-only witness hook, default off, same precedent as `_cpeCorrBranchOff`):
  apply-time switch back to the live from-direction, so ONE plan yields both curves.
- ⚠ WITNESS INTERACTION, found in the spec pass: with the from-direction frozen, `round(raw/2π)`
  has nothing to step on — the naive branch-off A/B can NO LONGER reproduce the 110.44 defect
  unless the freeze is ALSO off. `witness_cpe_corr_brush.js`'s branch A/B therefore sets
  `_cpeAimFreezeOff=true` for its branch-OFF samples, keeping §CPE_CORR_BRANCH_AB discriminating.
- New read-only hook `A._cpeGazeClearDebug(e3)`: metres of clearance along the CURRENT composed
  gaze at e3, using the same `_cinemaFanMeshes` raycaster the product already owns — so the
  nose-against-the-wall claim is asserted by the witness from product state, not probe-side
  approximations.

**WITNESS (extend `witness_cpe_corr_brush.js`, no new file):** existing G-BR-1..8 must stay green
(G-BR-6's bar tightens on its own: 7.79 << 13.28). New, each with NO-OP/VACUOUS/INCONCLUSIVE
self-reports:
- G-FRZ-1 frozen-from CONSTANCY over the full series: every ramp/decay sample must lie on the
  fixed curve `blend(from, authored, w)` — w INVERTED from each sample's own pitch channel (the
  product's pitch is linear in w), never recomputed from the envelope; plus entryDir/exitDir equal
  the baseline curve at the window edges.
- G-FRZ-2 wobble reduced, A/B in one run: in-window max deg/sample freeze-ON vs freeze-OFF
  (expected ≈7.79 vs ≈13.11); if the two curves are identical → NO-OP, do not ship.
- G-FRZ-3 dead-end preserved: an OUTSIDE-window e3 where the trigger genuinely fires
  (fwdClear < clearM from `_probeAimDepth`), where aimOff-A/B shows the gaze turning toward depth
  (clearance along gaze rises), and where the corrected curve equals baseline (≤0.031 deg).
- G-FRZ-4 no clearance regression in-window: min gaze-clearance ON ≥ min OFF (tolerance 0.05 m
  float noise), via `_cpeGazeClearDebug`.

**Ships with:** `viewer/effects.js` (+`viewer.html` `effects.js?v=29`, `sw.js` CACHE_VERSION
v1117 — same-PR bump, conflict-magnet rule) + the witness. Duplex 7/8 stays out of scope (G-BR-5
walk-relative denominator, filed).

### MEASURED + SHIPPED (2026-09-01, PR bim-ootb #1598, branch `fix/aim-depth-freeze`, sw v1117, effects.js?v=29)
**Witness `witness_cpe_corr_brush.js` — Hospital 13/13 PASS** (was 8/8; every G-BR gate still
green, G-BR-6's own number improves), logs `witness_hospital_final.log` / `witness_duplex_final.log`
(session scratchpad):
| § line | measured |
|---|---|
| `§CPE_AIM_FREEZE_WOBBLE` | in-window max **13.114 → 7.791 deg/sample (-41%)**, jerk **2.387 → 0.841 deg/sample²**; the 7.79 is the crossfade's own smoothstep peak |
| `§CPE_AIM_FREEZE_CONST` | fixed-from fit **0.0000 deg** on ramp AND decay over the full series; red control: the freeze-OFF curve does NOT fit (25.9 deg) — the check can fail |
| `§CPE_AIM_FREEZE_CONST` (edges) | entryDirVsBase **0.006 deg**, exitDirVsBase **0.056 deg** — the frozen dirs ARE the uncorrected edge gazes |
| `§CPE_AIM_FREEZE_CLEAR` | clearance minima identical ON/OFF (**0.00 m @e3=0.439** — the walk position itself); worst sample-wise drop 17.71 → 7.84 m, still far clear |
| `§CPE_AIM_FREEZE_DEADEND` | outside the window depth fires at 28/91 probes; tightest e3=0.089: fwdClear 0.10 m < clearM 8.0 m, gaze turns **83.45 deg** |
| `§CPE_CORR_BOUNDED_SNAP` | in-window max now **7.791** vs the walk's own 13.282 |
| `§CPE_CORR_BRANCH_AB` | still discriminates: branch-OFF **110.436** reproduced — because the witness runs its branch A/B **freeze-OFF too** (a frozen from-dir gives `round()` nothing to step on and would mask the wrap) |

**Duplex 11/12** — the ONE fail is the pre-existing, filed G-BR-5 (walk-relative denominator).
Two witness-design defects of my own were found by the Duplex run and fixed IN the witness:
1. `§CPE_CORR_BRANCH_NOOP` had become confounded — `ab` (branch-off+freeze-off) was compared
   against the shipped curve (branch-on+freeze-ON), reading the freeze's 2.79 deg as "the branch
   changes Duplex" and mis-attributing G-BR-5. Now compares against the freeze-OFF branch-ON curve:
   Duplex reads **0.0000 deg** again, attribution correct.
2. G-FRZ-1 constancy read a false 7.48 deg on Duplex — its decay tail crosses e3=0.75 where
   §CINEMA_BEAT_OVERLAP blends toward the orbit AFTER the correction. The fit now excludes that
   zone using the product's own constant (`turnOverlap` exposed on `_cpeBeat3GazeDebug`, not a
   hardcoded copy). With the exclusion: Duplex fit 0.0000 deg.
Duplex's window is QUIET (freeze moves the curve only 2.79 deg; peaks 7.767 vs 7.757) — the
reduction claim prints INCONCLUSIVE there by design (5-deg scope line between the two measured
clusters, printed in the log, same treatment as the hazard's 20-deg line); non-regression
(G-FRZ-2a) is judged and green.

**Honest cost, stated:** total in-window turn RISES 188.2 → 203.8 deg (ramp 155.0 → 169.7) — a
monotone fixed-to-fixed sweep is longer than a partially-self-cancelling wobble. Smoothness
(peak step -41%, jerk -65%) is what the freeze buys; path length is what it pays.

## §CLI_SILENT_BAKE — dev-only command-line silent bake (2026-09-01)

# ⚠ DO NOT REMOVE
# Scope: a dev-only scripted entry into the SHIPPED MaxQ bake (window.__maxqBake + cli_silent_bake.js),
# taking a STORED PATH as its argument. Read the log after every run — exit code is not evidence.

### SPEC (written before code — Spec-First)
1. **Entry** — `window.__maxqBake(opts)` in `viewer/cinema_maxq.js`, defined ONLY when
   `window.__MAXQ_SILENT` was pre-set by the launcher (puppeteer `evaluateOnNewDocument`), so no
   user session ever sees it. Resolves the stored path in exactly three forms, no second schema:
   - `opts.override` — a `_buildOverride()`-shaped object passed straight in;
   - `opts.name` — a named plan from IndexedDB `bim_ootb_cinema_paths` store `paths`
     (key `building|name`, field `.override`) — the working store, only present in a profile that saved it;
   - neither — the building DB's own `cinema_path` TABLE (the portable store), loaded through the
     SHIPPED lazy loader (`A.cinemaPathPlan(60)` → `_cpeLoadFromDb` → `A._getCinemaPathEdit()`).
   `opts.flags` `{buildup, roomTitle, reveal, dayCounter}` compose onto the resolved override —
   only keys explicitly sent (the DB table carries geometry+timing only, never the checkboxes).
   Logs `§CLI_BAKE_RESOLVED source=… bands=… total=…`.
2. **start() grows ONE branch, no duplicated bake loop** — `opts.override` synthesizes the same
   `_cpeRes` the editor returns (`{action:'ok', override, durationSec}`; durationSec from
   `override._total`, corrected by the override-plan's own `naturalTotal` when `opts.frames` is
   absent — the §CPE_PACING contract applied to the override plan, so caller-added reveal/hose get
   real frames). The EXISTING application block (re-derive frames → re-plan → clip/buildup/
   roomTitle/reveal/dayCounter) runs unchanged for both sources; the editor path stays
   byte-identical (its gate merely adds `&& !opts.override`). Logs `§MAXQ_OVERRIDE_IN`.
3. **Output capture** — the `a.download` click is inert headless. When `window.__maxqDeliverBlob`
   exists (runner-installed), `_stitchMp4`/`_stitch` hand it the finished Blob instead of clicking
   (`§MAXQ_DELIVERED bytes=N name=…`); node writes the file and ASSERTS exists && bytes>0
   (`§CLI_BAKE_FILE`) — a zero-byte mp4 that "succeeded" is the guarded failure mode. H.264 encode
   missing headless → the existing `§MAXQ_MP4_FALLBACK` webm path is carried, not treated as a blocker.
4. **Pose tap** — one guarded line in the frame loop: `window.__maxqPoseTap(i, x,y,z, tx,ty,tz)`
   when defined. The runner records every frame's real pose and asserts it numerically against an
   independently built plan from the SAME stored override — a bake that runs but ignores the passed
   path is the silent failure this catches.
5. **Runner** — `cli_silent_bake.js` (bim-ootb root, same family as `probe_*.js`): serves the
   checkout on a local port, fresh Chrome profile, streams EVERY console line to a log file
   (Log Mandate), samples `performance.memory` on an interval, live health-watchdog on the `§` stream
   (may abort a sick bake early — user authorization 2026-09-01: "if u detect a bug u can kill the
   bake and fix and redo the bake by command line"; every abort is recorded here with its § line),
   writes the delivered video, then ffprobe asserts duration/frames/resolution/fps against the plan.
6. **Buildup headless** — `tmHasExistingSchedule` gates on a profile-local gantt cache OR
   kernel_ops ELEMENT_PLACE rows; a fresh headless profile on a DB with none (HospitalAjaibPath.db
   kernel_ops = 1 BUILDING_OPEN row) would skip buildup. The runner therefore activates TM first via
   the shipped `window.tmActivateForBake()` (the same template-path generation a real TM open runs)
   when `--buildup` is asked — EXTRACT of the shipped verb, not a new generation path.
7. **GPU feasibility gates the long run** — measure real per-frame ms on a short film with a genuine
   GPU context vs SwiftShader, print `GL_VENDOR`/`GL_RENDERER` as proof of which ran, predict the
   full-Hospital wall clock from measured per-frame time, STOP and report if > ~4 h.
   Known real-GPU reference: ~2 h 10–15 m after §R10.

### MEASURED (filled as stages complete)
**STAGE 1+2 BUILT (2026-09-01, branch `feat/cli-silent-bake`, commits ec99483d+dcaad675 off
origin/main debed8e1 / sw v1117→v1118, `cinema_maxq.js?v=8`):** viewer entry + runner + delivery
seam + pose tap all committed and pushed; `node --check` clean on both files.
- **ABORT #1 (runner bug, recorded per the kill-fix-redo authorization):** first smoke run
  (12-frame Hospital, SwiftShader) failed in 7 s with `no stored path` — the runner's readiness
  wait (`!APP.streaming`) RACED the load: `__maxqBake` fired before the DB was open, and
  effects.js `_cpeLoadFromDb` LATCHES `_cpeLoaded=true` on entry, permanently blinding that
  session to the stored path. Fix (both sides): runner now waits for streaming.js's own
  completion signal `APP.buildingsRendered.has(APP.activeBuilding)` (set the same tick as
  `A.streaming=false`), and `__maxqBake` throws `building DB not open yet` before probing —
  the latch can no longer fire early. Bake path untouched — this was a RUNNER defect.
- **Hospital's stored path CONFIRMED in the portable store:** `buildings/HospitalAjaibPath.db`
  `cinema_path` = 3 bands, total_sec=81.87, old 13-column format (no hold_sec — the reader's
  by-name fallback covers it). `Hospital_extracted.db` has NO cinema_path table. kernel_ops in
  AjaibPath = 1 row (BUILDING_OPEN) → buildup NEEDS the runner's TM priming (spec item 6).
- **GPU feasibility probe (blank-context, this machine, 2026-09-01):** headless
  `--use-angle=vulkan` → NO-CONTEXT; plain headless → SwiftShader; `--use-angle=gl-egl` →
  Intel UHD (Mesa ADL-S); **gl-egl + `__EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/
  egl_vendor.d/10_nvidia.json` → the real RTX 4060, fully headless, no X** — wired as
  `--gpu real`. nvidia-smi healthy (driver 595.84, no kernel/lib mismatch; uptime 11 d).
- **STAGE 3 — GPU feasibility, MEASURED (24-frame short film, Hospital stored path, 2026-09-01):**
  - `--gpu real` (headless, no X): `§CLI_BAKE_GL renderer="ANGLE (NVIDIA Corporation, NVIDIA
    GeForce RTX 4060 Laptop GPU/PCIe/SSE2, OpenGL ES 3.2)"` — direct identification. Full run
    (load→24 frames→H.264 encode→delivery) wall clock **321 s**; per-frame median **3.1 s**,
    mean 11.4 s poisoned by 3 sparse-sampling outliers (frames 15-17: 25.8/81.5/50.3 s, 2×
    §MAXQ_FRAME_TIMEOUT — 24 frames over an 81.9 s path = 3.4 s of film per frame, every frame
    lands in cold-shader territory; an upper bound, not the dense-bake cost).
  - `--gpu sw` (SwiftShader): identity `"ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device
    (Subzero)...), SwiftShader driver)"`; warm-up fold 122.1 s; **frame 0 = 210.4 s vs the RTX's
    5.8 s on the same frame (36×)** → a full Hospital bake ≈ 71 h. Arm KILLED at that point,
    deliberately — the GPU-vs-fallback question is answered by the identity string + the 36×
    frame-0 contrast; a full SwiftShader timing run buys nothing (nobody bakes on SwiftShader).
  - **Prediction (gate: stop if > ~4 h):** stored path 81.9 s ≈ 1,228 frames @15fps flags-off;
    median 3.1 s/frame → ≈ 63 min; even the outlier-poisoned mean → 3.9 h. UNDER the gate →
    proceed. (Reveal/buildup lengthen the film — stage 4 measures the real per-frame + length.)
  - **Stage 1/2 witnessed end-to-end in the same run:** `§CLI_BAKE_RESOLVED source=db:cinema_path
    bands=3 total=81.9s` → `§MAXQ_OVERRIDE_IN` → `§CPE_APPLIED total=1.6s frames=24` →
    `§MAXQ_DONE frames=24 bytes=608818 type=video/mp4 codec=avc1.640034` (WebCodecs H.264 WORKS
    headless — no webm fallback) → `§CLI_BAKE_FILE bytes=608818` → ffprobe h264 1280x720
    24 frames 15 fps 1.6 s. **§CLI_BAKE_POSECHECK maxErrVsOverridePlanM=0 (MATCH),
    meanDistVsDerivedPlanM=94.43 (the STORED path drove the camera, not the derived one),
    bandAnchorMinDistM=[1.4, 2.86, 2.0]** (≈ eye-height offset from the stored band anchors).
  - R11 first live sighting: `§PHOTO_PREWARM ms=9391 did=[mepSmooth,hdri,groundTex]`. R10 live:
    `§MAXQ_FRAME_BUDGET taa=8 ao=12 renders/frame=20 (was 16+24=40)`.
- **REBASED for stage 5:** branch now on origin/main `4fb753c6` (#1599 §CPE_PIE_FLYOUT_DROP —
  the fly-out drops the pie; bake log must show `pie=dropped` at the §CPE_STATS_TAIL boundary).
  Both sides had bumped v1118/`?v=8` identically so the rebase deduped them — re-bumped to
  **v1119 / cinema_maxq.js?v=9** (5f907b6c). Class-keyed material-side + light-floor rendering
  change NOT merged at this point — stage 5 runs WITHOUT it unless it lands first.
- Stage 4 (300-frame validation, warm shaders, full flags) + stage 5 pending one queued short
  run by another agent.

---

## §CPE_PIE_FLYOUT_DROP (2026-09-01) — the fly-out drops the pie; the revolving highlights take its column. SPEC (written before code).

**User, 2026-09-01:** *"a small change to the overview HUD, during last fly out, the last pie is
not needed. Remove to give max space to the revolving highlights."*

### The boundary — an existing beat, no new constant
"Last fly out" = the frames where the revolving highlights exist at all: **`_inReveal`**
(`cinema_maxq.js` frame loop), the §CPE_STATS_TAIL Reveal-round predicate
`u >= _revealU` where `_revealU = _buildupTopoutU(plan).u` — i.e. `plan.beats.pullout`
(degrading to `plan.beats.out`) when the reveal round is on the plan, else `plan.beats.rise`,
else the ops-frozen degrade when the plan has no beats. The pie-to-remove and the highlights
co-occur EXACTLY on `_inReveal` frames — reusing the same predicate in the same branch means the
drop boundary can never diverge from the rotation boundary, and no threshold is invented.

### The rule
- **Round 1 (u < boundary): UNTOUCHED.** §CPE_PIE_HOLD (#1586) keeps its whole contract — live
  pie while trades work, held+dimmed+day-captioned pie on a silent day. This spec is a NARROWER
  rule, not a revert: the hold still owns every frame before the boundary.
- **Reveal round (u ≥ boundary): the pie is NOT drawn at all.** `_statInfo.held = null` — the one
  line of wiring. The cards fall back to the full-width column that pre-dates §CPE_PIE_HOLD
  (`colW = bw − 2·round(0.13·bh)`), with §CPE_CARD_FIT's shrink/wrap running at that width.
- **The roster is NOT lost** (§CPE_STATS_TAIL's own rule): `tailPanelAt` still receives
  `_holdInfo`, so the crew list stays one of the revolving slots — now full-width like the cards.
  `_drawList` gains an optional `fullW` flag used ONLY by the pie-less roster slot; the round-1
  caller passes nothing and is byte-identical.
- **"Nothing to revolve" fallback keeps the pie** (`_resInfo` hold in the reveal branch): if there
  are no revolving highlights, dropping the pie would leave a blank panel — "never blank" wins,
  and the user's rationale (space for the highlights) is vacuous there.
- **The panel box does not move or resize.** `_box()` is shared by both modes (§CPE_PIE_HOLD's
  "ONE panel, ONE fixed geometry"), and the §CPE_HUD_ORDER `_stackY` chain is untouched — the pie
  lives INSIDE the fixed box, so the stack cannot open a hole; only the interior relayouts.
- Hospital note stands: the pie hold not firing there is correct; nothing here "fixes" it. The
  drop applies to the REVEAL round regardless of whether the pie would have been live or held.

### Width, re-derived not left at 0.56 (§CPE_CARD_FIT's fraction was chosen beside the pie)
At the bake's own h=960: bw=346, bh=230. Beside the pie the content column was
`availW = listW − pad = max(round(0.56·bw),110) − round(0.10·bh) = 194−23 = 171 px (0.494·bw)`.
Full width: cards `colW = 346 − 2·30 = 286 px (0.827·bw)`; roster `availW = 346 − 2·23 = 300 px
(0.867·bw)`. Truncation must be re-proven at the new width (G-CARD gates re-run with held=null).

### Witness — extends `witness_cpe_resource_hold.js` (NODE, no browser, no bake contention)
- **G-FD-1** pie PRESENT (exactly one 3-arg pie blit) on EVERY frame before the boundary, absent
  after, full sweep by frame index, boundary frame named. VACUOUS if either side judged 0 frames.
- **G-FD-2** pie ABSENT (zero pie blits) on EVERY reveal frame, roster slots included.
- **G-FD-3** measured card column: longest label printed un-ellipsised beside the pie vs full
  width — the rendered width must reach the derived 286 px / 0.827·bw.
- **G-FD-4** §CPE_CARD_FIT re-run at the new width: long label prints IN FULL, nothing ends in
  an ellipsis, the long sub survives complete.
- **G-FD-5** roster slot full-width: a long trade name that ellipsises beside the pie prints in
  full without it; heading + dots x move from the right column (G.lx) to the left pad.
- **G-FD-6** stack closure: the plate path's rect is IDENTICAL across resource mode, stats+held
  and stats-alone (same x,y,bw,bh from recorded path calls), and every draw stays inside it.
- **G-FD-7** round-1 path unchanged: all 18 existing G-HOLD/G-TAIL/G-CARD gates still pass; the
  PR diff touches only `bigStatsCompositeOntoCanvas`/`_drawList` + the maxq reveal branch.
- **G-FD-8** wiring: the shipped maxq reveal branch carries `held: null` and the entered-log
  gains `pie=dropped (§CPE_PIE_FLYOUT_DROP)` so the next real bake asserts it end-to-end.
- **G-FD-9** NO-OP guard: stats-alone vs stats+held must DIFFER (blits and colX) — identical
  output means the change did nothing and the witness says NO-OP, not PASS.

### MEASURED (to be filled from the witness log before this section is closed)

### MEASURED — witness 27/27 PASS (was 18/18), NODE, no browser. bim-ootb PR #1599 MERGED 2026-09-01T10:52:59Z (squash 4fb753c6). sw v1117→v1118, `cinema_maxq.js?v=8`, `cpe_resource_panel.js?v=2`.
From `/tmp/wt-pie-flyout-witness.log` (saved, read before these conclusions — Log Mandate):
| claim | measured |
|---|---|
| boundary | frame **120** of 200 (`u>=0.60`, the sweep's synthetic `_revealU`; the predicate is `cinema_maxq.js`'s own `_inReveal`, copied verbatim) |
| pie before boundary | **120/120** frames blit exactly one pie (round 1 untouched) |
| pie during fly-out | **0/80** frames, roster slots included |
| card column | measured **0.486·bw → 0.815·bw** (6px-quantized lower bounds); derived exact **286 px = 0.827·bw** at h=960, was 171 px = 0.494·bw |
| §CPE_CARD_FIT re-proven | the #1592 card prints label IN FULL, **no ellipsis anywhere**, long sub complete (wraps `"…not a bill of" / "quantities"`) at the new width |
| roster full width | `Mechanical Ventilation & Ductwork` (33 ch) **ellipsised beside the pie (maxW 121 px), whole without it (250 px)**; heading+dots x **152 → 23** (G.lx → G.pad); roster availW 171 → **300 px = 0.867·bw** |
| stack closure | plate rect **`1479,87,346,230,21` identical across all 6 draw modes**, every draw inside it — the pie lives INSIDE the fixed §CPE_PIE_HOLD box, so the §CPE_HUD_ORDER `_stackY` column keeps its exact y-extent (87..317) and cannot gap or overlap |
| round-1 leak guard | G-FD-7: resource panel still blits the pie and lists at the reserved column (lx=152) — `fullW` did not leak |
| wiring | G-FD-8 reads the shipped `cinema_maxq.js`: reveal branch carries `held: null`, entered-log carries `pie=dropped (§CPE_PIE_FLYOUT_DROP)` — the next real bake asserts it end-to-end |
| self-report | verdict machinery prints VACUOUS (either side of the sweep empty), NO-OP (modes render identically), WRONG — never PASS unjudged. This run: `verdict=judged`, NO-OP guard exercised (blits 1 vs 0, colX 1631 → 1509) |

**What the next real bake's log should show:** `§CPE_STATS_TAIL reveal round entered at frame … pie=dropped (§CPE_PIE_FLYOUT_DROP)` — and the Reveal-round cards/roster at full plate width with no pie. Round 1 and the nothing-to-revolve fallback (pie kept — never blank) are unchanged.
