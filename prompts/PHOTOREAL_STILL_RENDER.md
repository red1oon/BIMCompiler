# ⚠ DO NOT REMOVE — Photoreal Still Render: spec for the "photoshop finish" idea (2026-07-15)
# SCOPE: a camera-still render mode aiming for archviz-marketing-image quality. Distinct from
#   MOBILE_PERF.md (that's runtime navigation speed — this is a deliberately expensive, idle-only,
#   opt-in still). Read the log after every run. This file is the spec — no implementation without
#   reading §HONEST VERDICT first; don't build past what that verdict promises.
# Full day-by-day history (2026-07-15 → 2026-08-11, ~7400 lines) archived verbatim, nothing lost:
#   prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md
#   Consolidated 2026-08-11 per user ask ("prompts/# has got too long") — this file kept to the
#   evergreen spec + the still-OPEN threads only. Closed/shipped work is a one-line pointer with
#   its commit/PR; full diagnostic narrative for closed items lives in the archive if ever needed.

## ▶▶▶▶▶ §RESUME 2026-09-24 EVENING — START HERE: §FILM_PARITY (Alt+S look -> Alt+C films, verbatim)
Supersedes every block below (they are history + evidence). Written by the watcher (red1-fe) at session close.

**red1's objective:** "the Alt+S to Alt+C ad verbatim is the objective." The approved Alt+S look must come out of Alt+C
films unchanged. red1 has given the watcher standing authority on technical picks; LOOK sign-off on films stays his.

**⚠ OPEN DEFECT, FIRST (watcher, 2026-09-24 ~19:25, v1294 = live):** after an Alt+S still red1 "has to refresh the
viewer as it is stuck to continue". The viewer doesn't come back after the still (his still
~/Downloads/bounce_still_1790247910581.png, Hospital atrium stair, &ghost=1 URL). Suspects, all new today: §STILL_LOCK
not releasing (APP._stillLockOn left true, main.js cancel paths returning early), §STILL_GHOST_OWNERSHIP restore / the held
§SHELL_GHOST_AUTO build running on Esc, or the bounce overlay not closing. Get the log tail after Esc (§STILL_LOCK off,
§STILL_GHOST_OWNERSHIP restored, §PHOTO_STAGING off, any error), reproduce on his URL, fix, witness "Esc -> nav works
(camera moves, §FPS_MODE orbit=1)". Hotfix PR, prove live. Also that still shows the far floor/room washed near-white again
at an interior aerial pose: re-check against the §FLOOR_WASH pick (lamps 16 / 25 m).

**✅ SHIPPED (was HOTFIX FIRST) — #1764 live v1294 (watcher, 2026-09-24 ~18:40; LIVE since #1763 / sw v1293):** Alt+S on a
`&ghost=1` URL renders GHOST BOXES, not the model. red1's v1293 console (OCI Hospital + &ghost=1): §STILL_LOCK on →
§STILL_ROOMS lazily loads navigate_find + NEEDLE (rooms recompiled 1,053 ms) → `[MG] §SHELL_GHOST_AUTO meshCacheKeys=20609
(deferred build)` → `§SHELL_GHOST_BBOX boxes=4518` → still staged with `§PHOTO_SHADOW_FRUSTUM_COVERAGE inFrustum=6`,
`§PHOTO_SHADOW_FORCE_REASSERT visMeshes=41`, GI compile 41 renderables, `§FPS_MODE disp=bbox`. NOT memory (heap 1.9 GB,
GPU 2.4/8 GB). Fix (spec first): Alt+S owns the display mode like §DLOD_STILL_OWNERSHIP owns DLOD: suspend ghost /
shell-ghost (and hold its deferred build) at staging, restore at teardown, log `§STILL_GHOST_OWNERSHIP`; check §STILL_ROOMS
triggers no other deferred build. Witness on red1's exact URL: visMeshes ≈ full count, disp=solid during the still. Small
hotfix PR off fresh origin/main, CI auto-merge, prove live.

**State at close (verify before trusting — `git -C /tmp/wt-shadow log -1`, `curl -s 127.0.0.1:8600/viewer/sw.js`):**
- bim-ootb `feat/shadow-size-by-envelope`, worktree /tmp/wt-shadow, served on http://127.0.0.1:8600 (restart recipe in the
  13:10 block below). Last seen @6f1df03d sw v1292, **31 commits ahead of origin, NOT merged, NO PR**.
- **BLOCKER before any merge:** red1's desktop console on v1292 (Hospital from the OCI URL + `&ghost=1`) printed
  `effects.js:2934 Uncaught`, and §EFFECTS_INIT/§EFFECTS_LOADED never printed, so Alt+S did nothing. The served effects.js
  passes `node --check` and line 2934 is `var _stillBaseSaved = null;` → suspect a stale/mismatched file after 6f1df03d
  (merged origin/main, "kept our sw/viewer/effects sides") or a truncated uncaught promise. Reproduce on HIS URL on a
  clean profile, real GPU, and show §EFFECTS_LOADED + a staged Alt+S. Add that URL shape to the fleet smoke.
- red1 RULED: **remove §STILL_GUARD** ("let it load normally, it's a user learning curve"); keep §STILL_LOCK (Esc-only).
- Then the end PR: fleet smoke (Hospital, Terminal, HHS, Clinic, JKR, LTU, Duplex; 0 PAGEERROR, nav fps vs main, one
  Alt+S each, DLOD on split meshes) → one PR, CI auto-merge → `git merge-base --is-ancestor` → prove live
  (red1oon.github.io/bim-ootb sw version + § markers). Hut-wall shading is pre-existing and does NOT gate the PR.
- **2026-09-24 evening, renewed session (dated lines):**
  · BLOCKER CAUSE: while merging origin/main (6f1df03d), effects.js line 2934 held `<<<<<<< HEAD` for a few minutes; 8600 serves
    the working tree live and sw had ALREADY been bumped to v1292, so red1's browser cached the conflicted effects.js under v1292.
    Fixed by v1293 (5b81ef61). Lesson: never bump sw before every conflict is resolved; resolve conflicts off the served tree.
  · §STILL_GUARD REMOVED (red1 ruling). §STILL_LOCK hole fixed: clicks inside the bounce overlay (picture, Save PNG) bubbled to
    main.js's window pointerdown and cancelled the still; main.js cancel paths now return while APP._stillLockOn.
  · witness_oci_ghost_url.js (red1's exact URL: OCI .../o/buildings/Hospital_extracted.db + &ghost=1, clean profile, real GPU):
    §EFFECTS_LOADED, 0 page errors, Alt+S stages + bounce, overlay click + Save PNG keep the still, Esc exits.
  · FLEET SMOKE on 5b81ef61 (witness_fleet_smoke.js, real GPU): 7/7 PASS, 0 errors, one Alt+S each completes + Esc exits.
    Nav render median ms: Hospital 54.8, Terminal 19.1, HHS 4.6, Clinic 8.7, JKR 10.1, LTU 173.8 (main 153.8: +13%, p90 equal
    177), Duplex 1.5. DLOD on split meshes: zeroed when looking away and restored on Hospital/Terminal/HHS/Clinic/JKR/LTU;
    Duplex (1 split mesh, 2 instances) never zeroed — DLOD likely inactive on a building that small (restore trivially 0).
  · Atrium portal priority: area x facing placed 639 m2 vs 540 m2 nearest-first, composite 93.24 vs 93.06 — no lift; default kept.
  · KNOWN COST (watcher accepted): LTU nav median +13% (173.8 vs 153.8 ms, p90 equal) from the R10 glass draws red1 chose.
  · **SHIPPED: bim-ootb PR #1763, squash merge 735c0dd3 (ancestor of origin/main confirmed), CI green (fast-checks needed
    `/* global Buffer */` in 7 node witnesses for the no-undef gate, 203c65f6).** LIVE on red1oon.github.io/bim-ootb: sw.js
    CACHE_VERSION="v1293"; markers present in the minified live files (§ is escaped as \xA7): SURFACE_RULES(_CLASS/_COLOUR/_TALLY)
    + SURFACE_R10 in streaming.js, SKY_PORTAL + LIGHT_UNIFORM_BUDGET in sky_portal.js, GLASS_FRESNEL in glass_fresnel.js,
    STILL_LOCK in effects.js, GI_APP_FRAME in gi_still.js, APP._stillLockOn in main.js; "STILL_GUARD refused" absent (removed).
    Next session: §FILM_PARITY off fresh origin/main (feat/shadow-size-by-envelope is merged; do not reuse it).
  · **HOTFIX spec §STILL_GHOST_OWNERSHIP (live since #1763, red1 "Alt+S goes into bboxes"):** on `&ghost=1` URLs the
    navigate_find auto-trigger (§SHELL_GHOST_AUTO, deferred merged-ghost build) was set off by §STILL_ROOMS' lazy navigate load
    and built the ghost shell MID-still (visMeshes 41, disp=bbox). Fix: (1) the auto-trigger also waits while APP._stillLockOn
    / _stillRefineActive / _photoStagingOn (same rule as §FLY-NO-AUTO-GHOST), re-checked when its idle callback fires;
    (2) Alt+S staging owns the ghost view like §DLOD_STILL_OWNERSHIP: if ghostXrayOn(), toggle it off for the still, back on at
    teardown; log `§STILL_GHOST_OWNERSHIP suspended= restored= autoBuildHeld=`. Branch fix/still-ghost-ownership off
    origin/main. Witness: red1's URL, visMeshes ~ full during the still, §SHELL_GHOST_AUTO only after exit.
  · **HOTFIX SHIPPED: PR #1764, squash f4109331 (ancestor of origin/main), LIVE sw v1294** (live navigate_find.js carries
    "STILL_GHOST_OWNERSHIP autoBuildHeld", effects.js "STILL_GHOST_OWNERSHIP suspended", main.js navigate_find.js?v=60).
    witness_still_ghost_ownership.js on red1's URL: visibleMeshes 4972 during the still (was 41), ghost build only after Esc,
    ghost-on-before-press suspended/restored; red1: "it works". localhost:8600 serves /tmp/wt-ghost (fix/still-ghost-ownership,
    = main).
  · **QUEUE (before §FILM_PARITY; red1: "the non-DLOD flag may cost heavy; any way to reduce its load?") — §STILL_CULL, spec
    next session:** (1) sun shadow map rendered ONCE per still (autoUpdate=false after the first staged frame; scene frozen),
    refine ms before/after; (2) instead of un-culling all 63k at the DLOD pause, keep DLOD culling for anything neither in the
    view frustum nor inside the view's sun-ward shadow volume (camera frustum swept toward the sun, clipped at the envelope), so
    off-screen roof casters stay and parts behind the camera / away from the sun stay culled. Witness: roof-through-sky stays
    fixed (Terminal hall pose), zero-scaled counts + refine ms before/after on Hospital. Speeds every film frame too.

**The approved Alt+S look = v1290 defaults** (sw v1290, 65c471b1): sky 2.0 (hemi), base 0 (flat ambient), lamps 16,
reach 25 m, decay 1.5, bounce gain 1.0 / ao 0.55 / §GI_RECEIVER albedo-estimate on, sky portals (all planar glazing,
nearest-first, cap 32), Fresnel glass on glazing-only clones, surface rules R1-R10, concrete tone 0.55/4 m, lamp colour by
shape (round amber 0xffdca8, rect white), daylight: no window glow, lamps off only when the camera is outside.
Colour fix `&srgbfix` stays OFF (it darkened exteriors ~40%; a future re-balance lane).
**References (protect in every change, re-shoot side by side):** ref1 ~/Downloads/bounce_still_1790230280204.png
(Hospital courtyard 13:51), ref2 ..._1790231488686 (Hospital aerial, bounce off the middle wing), ref3 ..._1790240550314
(spiral stair close-up), ref4 ..._1790242559558 (Terminal hall, "this is the one"), ref5 ..._1790242929806 (Terminal
facade face-on: "the see-through lit-up inside is surreal" — THE look to carry into films).

**§FILM_PARITY — the lane (spec first, then build):**
1. Bounce in Alt+C: a proper option, ON by default, checkbox off; the "copy bake command" carries it (today only the dev
   `--tap` sandbox gi_bake_tap2.js via cli_silent_bake does). No WebGPU → stands down with a logged §GI_*_OFF.
2. Every Alt+S-only gate in viewer/effects.js made film-capable, per frame over a MOVING sun (lines at close):
   3969, 4020 (§STILL_GLOW daylight rule — evaluate per frame, films pass through dusk), 4053 (§STILL_BASE sky/base),
   4078 (lamps: strength/reach/decay + §LIGHT_UNIFORM_BUDGET + §STILL_LIGHT_PAD), 4105 (§SKY_PORTAL), 4106
   (§GLASS_FRESNEL), 5644; also the lamp shape colours. 4104 §SKY_OCCLUSION stays opt-in (rejected as a default).
3. Hard rules for films: constant light count across ALL frames (a count change recompiles ~110 materials: 40-108 s);
   portal shadow maps once per frame at most; the bounce renderer with lighting.enabled=false (§GI_PRESS_COST); nothing
   shared stays changed across an await (§GI_SCENE_BORROWED holds the app frame).
4. Proof: 5 s control clip + 5 s parity clip at target size before ANY full film; per-frame § lines show each feature
   applied; one frame of the parity clip next to ref5/ref1 at the same pose. Never send red1 a film before its check.

**Queue after parity:** atrium daylight (`&portalsort=area` exists, 1c85ae96 — measure the atrium), roof-deck moiré at
distance (fade/coarsen the R1 texture), lamps-seen-lit-from-outside-by-day puzzle (red1's 17:38 Terminal still), real
reflections (cube map at Alt+S time vs SSR; must NOT dim the see-through interiors), hi-res Alt+S (1080p/4K independent
of the window), first-build compile (~62 s), view-fitted sun frustum (jagged edges; nav looks smooth only because its sun
is fixed high), fake bounce lights, ceiling-only base, colour-correct re-balance, hut walls, probe grid.

**Working rules:** serve on 8600 as you go; every recap "localhost:8600 serves <branch>@<real sha>, sw vNNNN"; bump sw +
?v= on every served change; one push + PR + auto-merge at session END then prove live; § log evidence, never guesses;
look at every frame before describing it; gate every capture on full load + THIS press's completion lines; keep GPU test
runs short (red1 shares the GPU); never hand red1 a git/permission decision.

## ▶▶▶▶ §RESUME 2026-09-24 13:10 — START HERE (supersedes the PM block below; that block is history)

**On localhost:8600 (red1 judges here):** bim-ootb `feat/shadow-size-by-envelope` @ **6750db1b**, sw **v1253**, tree
/tmp/wt-shadow, PUSHED (backup), **NO PR** (the open items below gate the one end-of-session PR).
URLs: http://127.0.0.1:8600/viewer/viewer.html?db=/buildings/Hospital_extracted.db (also Terminal_extracted.db,
HHS_Office_Federated_extracted.db). Dials: `&base=0.25` raises the Alt+S base light (0..1, default 0);
`&surf=off` = old surfaces; console `APP._sunShadowRestoreEnabled=true` = parked restore pass; `&tri=big` (superseded).
**Restart 8600 after a reboot** (/tmp dies): `git -C ~/bim-ootb worktree add /tmp/wt-shadow feat/shadow-size-by-envelope`
(fetch first), symlink any missing DB into /tmp/wt-shadow/buildings (serve_tree falls back to ~/bim-ootb/buildings anyway),
then `setsid nohup node ~/bin/serve_tree.js /tmp/wt-shadow 8600 > /tmp/serve8600.log 2>&1 < /dev/null &`.
**Live on main already:** #1759 row probe (sw v1235), #1760 film fill (v1240).

**red1 RULED today (all on the branch unless noted):**
- Surfaces §SURFACE_RULES R1-R9 ON by default ("cleaner, no more drab surfacing"); floors before substance (R4).
- R10 openings: split glass/frame + door handle/leaf (merged from feat/surface-r10 ac6c5524); glass alpha = building's own.
- Film fill restored 0.785/1.257 (#1760 LIVE). Alt+S keeps #1601's fill, and now scaled by the base dial.
- Daylight Alt+S (sun > 6°, dusk mood off): NO window glow; lamps OFF only when the camera is OUTSIDE (rooms roomAt, up-ray
  fallback); films unchanged (§STILL_GLOW af75fb41).
- Alt+S base light (ambient+hemi) = dial, default 0 = real sources only; deep interiors go dark by design (§STILL_BASE fac153dd).
- Shadow restore pass: PARKED (off; depth fix kept behind the flag).
- Alt+C bounce: ON by default with an off checkbox, the copy-bake-command line carries it, no WebGPU -> stands down + logs.
- Probe-grid lighting: survey written (§PROBE_GRID_SURVEY); first step = one measured 4 m sky-only Hospital bake.
- Also on the branch: DLOD paused during Alt+S, 8192 Hospital map, status-at-once, §STILL_POSE pose log.

**OPEN, in order (all gate the end PR):**
0. **FIRST — red1's two rulings after eyeballing 8600 (dials to tune live on 8600):**
   (a) "Alt+S is too dark. It seems not to take in enough sky ambient light." At base=0 the SKY (hemi) is scaled away
   together with the flat ambient (§STILL_BASE scales both). Split the dial: `&sky=` scales hemi (the sky from above),
   and `&base=` scales the flat ambient only. Sky default > 0, value picked by red1 by eye. Both read at every press.
   (b) "Indoor lighting is not throwing enough, so it is a knob." Add `&lamps=<scale>` (and a range multiplier) for the
   fixture point lights in Alt+S, read at every press. Mind the `(A._nightPLScale || 1)` trap in tools.js (~2052/2087):
   0 must mean 0. Facts from source: the Alt+S lamp set is §NIGHT_STILL_FRUSTUM (tools.js ~1842): fixtures whose position
   is inside the camera frustum, capped at 200 (a sanity ceiling, not a creative limit), plus the §BAKE_INTERIOR_TOPUP
   branch; the nav budget is nearest-N to the camera (sorted by distance, ~1790). The Alt+S intensity is
   NIGHT_LIGHT_INTENSITY 2.0 x fade x _nightPLScale (_nightPLScaleStill 0.5 in staging, §STAGED_PL_CUT); the range/decay
   are NIGHT_LIGHT_RANGE / NIGHT_LIGHT_DECAY. Log per still: `§STILL_BASE sky= base= lamps= range= camInside=`.
   **§STILL_DIALS spec (2026-09-24 PM, renewed session):** Alt+S only (`!A._maxqActive`); films and nav unchanged.
   Read once per press, URL then console override (`APP._stillSky/_stillBaseScale/_stillLamps/_stillLampDecay`).
   - `&sky=` 0..2, default **1** = hemi at #1601's Alt+S value (0.617), i.e. what Alt+S had before §STILL_BASE.
     Default is a start point for red1's eye, not a ruling.
   - `&base=` 0..2, default 0 = flat ambient off (unchanged meaning, now ambient ONLY).
   - `&lamps=` 0..4, default 1 = today's lamp strength. A plain multiplier on each fixture light, checked with
     `typeof === 'number'`, never `||`, so 0 gives intensity 0 (no `|| 1`). Films' `_nightPLScale || 1` untouched.
   - Range, from source: NIGHT_LIGHT_RANGE = 0 = infinite reach already; a range MULTIPLIER on 0 does nothing.
     The real reach lever is the fall-off: `&lampdecay=` 0..2, default NIGHT_LIGHT_DECAY 1.0; lower = throws further.
     Set on every Alt+S lamp (new and reused); nav lamps get NIGHT_LIGHT_DECAY back at teardown.
   - Log per press: `§STILL_BASE sky= base= lamps= decay= range=0(inf) hemi= ambient= camInside= lampsOn=`.
   - Proof: one headless Alt+S press per dial arm on Hospital gated on 63,182 elements (VACUOUS otherwise), reading
     the logged hemi/ambient and the sum of lamp intensities; lamps=0 must log sum 0.
   - red1 (via watcher): `&sky=` default 1.0 (old Alt+S hemi), `&base=` default **0.25**. Tuned by eye on 8600.
   - red1 LOOK ruling 13:3x ("I think we got it"; off-sun walls read dark): base default **0**; sky default **1.5**,
     range 0..3; bounce MORE: **§GI_STILL_GAIN_DIAL** `&bounce=` 0..3 (APP._stillBounceGain, window.__GI_STILL_GAIN),
     default 1.0 (was 0.6), read at EVERY press: gain and AO become TSL uniforms on the kept renderer (fixes
     §GI_DIALS_FIRST_BUILD for gain/AO; slices/steps still first-build). Log `§GI_STILL gain= ao= applied`.
     bim-ootb f42f1c37, sw v1256.
   - Gate note: the page's JOIN says 63,415 for Hospital, Hospital_meta.db's own JOIN says 63,182 (the loaded set).
     witness_still_glow.js takes `--want 63182` and logs both.
   **§LAMP_SHAPE_COLOUR spec (red1 via watcher: "round lights soft amber, rectangular ones white; it gives good
   reflective play on the surfaces"):** Alt+S only (films/nav keep §NIGHT_LIGHT_MIX). Shape from each fixture's OWN
   mesh (A.meshCache[ghash], local X/Z = plan, local Y = up), never its name: fill = convex-hull plan area / plan
   bbox area; aspect = long/short side. ROUND: fill 0.70-0.86 and aspect <= 1.25 (a disc is 0.785). RECT: fill >= 0.93.
   Anything else, or no mesh loaded = AMBIGUOUS, keeps its §NIGHT_LIGHT_MIX colour. Exit signs keep their green.
   Colours from the existing palette (tools.js): round = NIGHT_WARM 0xffdca8 (~2900K, "downlight/sconce/pendant";
   softer than NIGHT_MIX_AMBER 0xffb45c), rect = NIGHT_MIX_WHITE 0xffffff. Light and glow sprite take the same colour.
   Log once per press: `§LAMP_SHAPE_COLOUR bld= round= rect= ambiguous= noMesh= exit=`; run Hospital, Terminal, HHS.
1. **Rooftop hut walls show no away-from-sun shading** (red1 disputes the glow explanation for opaque huts). Opus agent
   STOPPED mid-run, no verdict. Evidence in scratchpad wallshadow/ (hut.js, log_hut_{base,sunonly,surfoff,trioff,
   nopoints,noambhemi}.txt, sheet_hut_base_vs_sunonly.png, sheet_hut_variants.png). Two LEADS, unproven: (a) its last
   line: "the triplanar chunk skips `batchingMatrix`", i.e. for BatchedMesh the triplanar world position/normal ignores
   the per-instance transform; (b) §MEP_SMOOTH_NORMALS smoothed 15,591,853 verts in 1,166 geoms at staging, far beyond
   MEP; check whether hut walls are in it (smoothed box normals light every face alike). Next: sun-only N·L per face
   from the buffer normals + the shader normal, one variable at a time.
2. **R10 gaps** (feat/surface-r10 @ 250b8546 = WIP witness with the full-count gate; agent stopped): (1) glass-shadow arm
   re-run with the gate (a "before" of 0 vs 4,272 smelled of a short load); (2) force DLOD on split meshes, zero-scaled >0
   then restored, both groups together; (3) Alt+S bounce with split meshes on the real GPU; (4) LTU fps before/after
   (draws +17%, transparent 18->489).
3. §STILL_GLOW / §STILL_BASE: one clean Alt+S witness run on this build (the latest arm's load was short; the stopped run
   was the check of the new lines). Stills for red1: courtyard (no glow, no lamps), interior (lamps on), dusk (both).
   Beam/railing check with the lamps off.
4. Hospital mid-wing arms, if still needed after 1 (texel/frustum/filter known from source; the view-fitted frustum
   is the lever to test).
5. Bounce composite shifted sideways on alternate shots after __giStillRelease (scratchpad dials/run2/); then gain stills.
6. Alt+C bounce option (spec'd above). 7. Probe grid first bake.
**Renewed session 2026-09-24 PM (bim-ootb feat/shadow-size-by-envelope, local commits, 8600 serves each):**
- 4e18a35d..327f6a66: §STILL_DIALS (sky 2.0 / base 0 / lamps 2.0 / lampdecay 0.8), §LAMP_SHAPE_COLOUR + §LAMP_SHAPE_FACE
  (HHS rect 260 round 150; Hospital rect 1260 round 12 noghash 14; Terminal rect 748 round 66 noghash 28; 0 ambiguous),
  §GI_STILL_GAIN_DIAL (&bounce= &ao=, uniforms per press; witness_gi_gain_dial.js PASS), §STILL_CAMINSIDE_SPARSE
  (room-index miss falls through to the up-ray), §GI_STILL_TERM modes, §GI_RECEIVER (bounce x albedo estimate, not the
  lit colour: courtyard 0.8%->4.9%, L1 13%->32%; SSGI dials &girecv= &girad= &githick= &gisteps= &giint=),
  §STILL_LAMPS_OUTSIDE (&lampsout=1, default 0 pending red1).
- REFERENCE LOOK (red1: "quite good outside"): ~/Downloads/bounce_still_1790230280204.png, Hospital courtyard, sw v1262
  defaults (sky 2, base 0, lamps 2, lampdecay 0.8, bounce 1, ao 0.55, girecv 1). Its §STILL_POSE is not in our logs yet
  (it is red1's own press); closest logged pose = pose_p1 cam [-62,38,-4] tgt [-16,-2,-4]. Re-shoot after every
  glass/portal/ceiling change, side by side for red1.
- REFERENCE 2 (red1: "really good; see the bounce on the wall from the middle wing"): ~/Downloads/bounce_still_1790231488686.png,
  Hospital from above, sw v1265 defaults (sky 2, base 0, lamps 2, lampdecay 0.8, bounce 1, ao 0.55, girecv 1, concrete 0.55,
  concretetile 4, portal 1, lampsout 0). These defaults are the BASELINE: do not move them without red1. Re-shoot refs 1+2
  after every lighting/glass change.
- §GLASS_FRESNEL spec (red1: "reflection has to follow the physics: a lit surface reflects well"): Schlick Fresnel at FULL
  strength, never scaled by opacity; the reflected content's own brightness decides how strongly it shows (sunlit facade
  / sky opposite drowns the interior view; dark surround lets you see in). Source = sky env now, cube-map/SSR later. No
  strength dial, only on/off for comparison. Log `§GLASS_FRESNEL mats= f0=`.
- **§STILL_LAG (red1 "getting laggy", measured 2026-09-24, witness_still_lag.js, Hospital L1, real GPU, headless):**
  portal=0: refine 3.9 s / 2.2 s, bounce passes 1.6 s / 37.2 s (press 1 / 2). portal on (placed 32, 8 shadowed):
  refine 11.6 s / 4.7 s, bounce passes 1.5 s / 34.9 s. First build, both arms: geometry-pass compile ~62 s, orientation
  ~50-54 s (red1 desktop: 67.6 s / 12.7 s). Heap flat press 1->2 (~1.9 GB). READ: portals cost refine time (x3 on press
  1, x2 on press 2): shadowed spots re-render + recompile. But the 10x bounce slowdown on press 2 happens WITH portals
  off too, so it is NOT the portals: the kept WebGPU renderer's second shot is the suspect. The first-build compile is
  also portal-independent. Headless runs share red1's GPU: no GPU runs while he is eyeballing.
  Fix queue when resumed: (1) press-2 bounce slowdown (kept renderer), (2) portal shadows rendered once per still +
  constant light count across presses, (3) first-build compile 62 s. Then view-fitted shadow frustum (watcher call),
  then Fresnel glass. Ref 2 pose (watcher, from red1's paste): cam [-39.469,12.563,50.109] tgt [3,-4,3] fov 60.
- **§SKY_OCCLUSION spec (red1: "indoor floor too bright, not taking in shadows"; resumed 2026-09-24):** Alt+S only.
  At staging, render ONE top-down orthographic depth map (DepthTexture, 2048^2) over the building envelope; hidden in
  that pass: transparent glazing (glass lets sky in), sprites/lines/points, sky, ground. Shader: THREE.ShaderChunk
  patched ONCE at load (loader.js, right after three loads, before any material compiles): lights_pars_begin gets a
  skyOccVis() (uniforms uSkyOcc/uSkyOccMap/uSkyOccMat/uSkyOccKeep/uSkyOccBias/uSkyOccTexel; STANDARD/LAMBERT/PHONG/TOON
  only; uSkyOcc=0 returns 1 = nav and films unchanged); the hemi irradiance, the env irradiance and the env radiance
  are multiplied by it. Lookup at world pos + 0.5 m along the world normal (a facade samples open air outside it, a
  floor samples under its ceiling), 3x3 PCF, bias 0.3 m. vis = mix(1, keep, coveredFraction), keep = &skyocc= 0..1
  (default 0.15). Uniform values are pushed into every scene material's program uniforms from scene.onBeforeRender
  (a recompile re-clones them), so there is no recompile and no light-count change. Map rendered once per still, disposed
  at teardown. Log `§SKY_OCCLUSION map= texel= coveredFrac= mats= ms=`. Proof: refs 1+2 (outdoor) show no change, L1
  interior floor darker.
- (was PAUSED 2026-09-24 at 84541b9f / v1266; RESUMED by red1, whole queue: sky occlusion -> lag -> Fresnel -> compile -> view-fitted shadow -> fake bounce -> SSR vs cube -> ceiling base.)
- **OPEN (2026-09-24):** (a) the "missing building" frames — cause found: the bounce's first build hides app meshes
  across awaits (~60 s progressive compile); app renders in that window showed a half-hidden building. Fixed by
  §GI_SCENE_BORROWED (app holds its frame). The earlier unexplained frame is consistent with it. (b) The bounce read a
  near-black app frame (appMean 13.3) on some presses (ref re-shoot press 2; Fresnel witness press 1 at pose_p1) while
  the saved WebGL frame was normal (mean 119): the canvas read during/after heavy WebGPU work; not chased yet.
  (c) Poses: "p2_courtyard_low" [-44,2,-6] is BELOW ground (Hospital ground y = -15.9) — do not use. Courtyard pose
  checked by eye: courtyard_a cam [-40,1.8,-4] tgt [-10,3,-4] (ref 1 stand-in).
- **§STILL_GUARD + §STILL_LOCK spec (red1, 2026-09-24):** GUARD at the user entry (toggleStillRefineUI, i.e. Alt+S and
  the pill): refuse to start when A._bboxPlaceholders.length > 0 (bbox not cleared), A.streaming (not complete), or
  A.xrayOn (display mode). Ghost glass keeps its state private (not checked, logged n/a); DLOD has no bbox stand-ins
  (it only zero-scales, and Alt+S already pauses it). Toast "Still loading — Alt+S when the model is solid" (or the
  X-ray wording); log `§STILL_GUARD refused reason=` / `ok`. The bounce's own Alt+S handler stays silent on a refusal.
  LOCK from a UI start until the still is released: a window capture-phase listener swallows pointer/touch/wheel/
  contextmenu/dblclick everywhere except inside #gi-still-overlay (Save PNG / Close), and every key except Escape
  (Alt+S included). Esc = the only exit: closes the bounce overlay and tears the still down ('cancelled (Esc)').
  Log `§STILL_LOCK on` / `off blocked=<n>`. Programmatic starts (bake, witnesses) are not locked.
- REFERENCE 3 (red1: "the bounce is very good on the slab by the stairs"): ~/Downloads/bounce_still_1790240550314.png,
  spiral-stair close-up, v1287. Pose not logged; nearest stair close-up to be picked by eye. Atrium pose (checked by eye):
  cam [-5.355,-13.58,9.984] tgt [-5.355,-11.28,-2.316].
- §FLOOR_WASH findings (2026-09-24, dials default OFF, 9d790e5f): colour pipeline uses authored sRGB as linear (walls 0.92
  where 0.828 is right); §LIGHT_STACK: 132 lamps all reach the atrium floor point, sum 74x the strongest. Finite reach at
  lamp strength 2.0 is uniformly too dark (composite 88 vs 187 now); proposal: reach 20 m/decay 1.5 + per-lamp strength
  raised (arms lamps 8 / 16), awaiting the watcher's pick. Sheets: ~/Downloads/atrium_wash_sheet.png, atrium_reach_sheet.png.
- **REFERENCE 4 + APPROVED LOOK (red1 17:35, "I think this is the one"):** ~/Downloads/bounce_still_1790242559558.png,
  Terminal hall, sw v1290 (bim-ootb 65c471b1). The v1290 Alt+S defaults are LOCKED as the approved look: sky 2.0, base 0,
  lamps 16, lamprange 25 m, lampdecay 1.5, srgbfix OFF, bounce 1.0, ao 0.55, girecv 1, concrete 0.55 / tile 4 m,
  portal 1 (budget 19 incl. 8 shadowed, lamps 132 padded), Fresnel glass ON (glazing clones), lampsout 0, skyocc not
  installed. §FILM_PARITY carries exactly these into Alt+C. Ref 4 pose: not logged (red1's press); nearest Terminal hall
  pose not yet found (table cluster IFC x 103.6-109.6, y -38.3..-11.4, "Aras Tanah").
- **FUTURE LANE — colour-correct re-balance (parked, watcher 2026-09-24):** authored sRGB colours are used as linear
  (ColorManagement off + new THREE.Color(r,g,b) + sRGB output). &srgbfix=1 converts them in Alt+S, but on its own it
  darkens every look red1 approved (aerial composite 92.5 -> 75.4, courtyard_a 73.2 -> 45.0; atrium 186.7 -> 173.3).
  A fix needs a matching exposure/fill re-tune across refs 1-4; not now.
- GLASS: frosting causes measured (all panes opacity 0.3 double-sided = ~0.51 effective, grey 737278 diffuse lit like a
  wall, non-R10 glazing roughness 0.22-0.49). red1 then said (direct, 2026-09-24): glass "got the right effect thruout";
  the problem is interiors seen THROUGH it are drab. Glass change PARKED; nothing changed on glass.
- Drab interiors from outside: daylight + camera outside = lamps OFF (earlier ruling), so rooms get only the flat hemi.
  &lampsout=1 is served for red1's eye; sky portals (queued) are the window-light source.
- OPEN, not chased: Hospital's room index has 2 rects for the whole building; roomAt callers (RoomWalker
  .buildCameraRoomIndex: effects.js _stillCamInside, dlod_nav.js room leg) are likely blind on Hospital.
- Off-frame bounce (a sunlit source outside the view) is beyond screen space: the PROBE GRID is the answer; it moves up
  after the sky portals.
- **§SKY_PORTAL spec (built next):** Alt+S only. Panes = R10 split window meshes, pane box from the aPane=1 vertices
  (local bbox -> world via instance/matrixWorld; thin axis = normal; the two long axes = pane size). Inward side = the
  side whose up-ray (0.5 m off the pane) hits building geometry within 30 m; both/neither -> skipped, logged. Candidates:
  panes within PORTAL_RANGE 40 m of the camera, nearest first, cap &portalcap= (default 32). One SpotLight per pane,
  just outside the pane, aimed inward, half-angle 70 deg, penumbra 1, decay 2; the nearest &portalshadow= (default 8)
  cast shadows at 512 (pane casts nothing since R10, frames cast = mullion shadows), the rest unshadowed (can leak
  through walls — logged). RectAreaLight NOT used: RectAreaLightUniformsLib is not in viewer/lib (checked 2026-09-24).
  Intensity: physical base I = H x A / pi (H = staged hemi intensity, A = pane area; a diffuse pane of radiance H/pi),
  x PORTAL_EXPOSURE 10 (start value for red1's eye: the unoccluded hemi already lights interiors everywhere, so a
  physical portal is drowned) x &portal= 0..3 (default 1). Colour = hemi sky colour x the pane's own colour HUE
  (normalised to max 1; no alpha dimming, red1's glass ruling). Log `§SKY_PORTAL placed= shadowed= unshadowed=
  capped= skipped= intensity= ms=`. Cost: render ms with/without, real GPU, HHS + Hospital. Teardown removes all.
- Queue: sky portals (shadowed spots for the nearest 4-8 panes, RectAreaLights beyond, hue-only filter, &portal=),
  then the ceiling-only base (&ceil=), then the probe grid. Hut walls + R10 gaps still gate the end PR.

**Awaiting red1's ruling (films, NOT changed):** tools.js lamp intensity uses `(A._nightPLScale || 1)`, so a scale of 0
becomes 1. The film's §CPE_TAIL_LIGHTS_ALL_ONLY lights-off slot has therefore never switched lamps off. Alt+S now gates
on its own flag (§STILL_GLOW). Fixing it globally would change films.
**Flaky headless loads (open, not chased):** Terminal streamed 48,428 / 47,928 / 29,928 / 0; Hospital sometimes 8,682 or
62,682 of 63,182. Every witness must gate on elements WITH transforms (elements_meta JOIN element_transforms per building;
Hospital 63,182, not elements_meta's 63,415) and print VACUOUS otherwise.
**Agents:** red1 rests Fable when tokens are low; Fable clears the hard unknowns, then Opus/Sonnet do the follow-on.

## ▶▶▶ §RESUME 2026-09-24 PM — START HERE (supersedes the block below for what is open)
**Served on localhost:8600:** bim-ootb `feat/shadow-size-by-envelope` @ eb854d69, sw v1247, from /tmp/wt-shadow
(`node <scratchpad>/serve_tree.js /tmp/wt-shadow 8600`, started with setsid). PUSHED as a branch for backup; **NO
PR yet**, on purpose: the watcher ruled nothing merges that could make Alt+S worse, and the Hospital mid-wing
shadow question below is unresolved; its suspects (8192 map, DLOD pause, surface rules) are all on this branch.
**Live on main already:** #1759 row probe (sw v1235), #1760 film fill (sw v1240).
**On the branch, witnessed:** §DLOD_STILL_OWNERSHIP, §SHADOW_SIZE_BY_ENVELOPE (8192 Hospital), §SUN_SHADOW_RESTORE_DEPTH
(fix kept, pass OFF by default = PARKED), §STILL_STATUS_FIRST, §TRI_BIG_ONLY switch, §SURFACE_RULES R1-R9 DEFAULT ON
(red1: "cleaner"), film fill merged in. Witnesses: viewer/tests/witness_{dlod_still_ownership,tri_big_only,
still_status_first,surface_rules}.js.
**OPEN, in the watcher's order (fable agents stopped by red1 to save tokens; nothing half-written in any tree):**
1. Hospital mid-wing shadows (red1: "shadows may disappear ... mid in between wings") + the film-vs-Alt+S "wall
   facing away from the sun" pair. Arms and required logs: see the watcher's brief (A1/A2 8600 before/after the bounce,
   B live main, C1 ?surf=off, C2 4096, C3 DLOD; D1 film staging via A._maxqActive=true vs D2 Alt+S, logging the
   sun, fill, env/envInt, bounce gain, and N·L of the off-sun wall). Only poses exist so far: scratchpad shadow_ab/pose_p1.json, pose_p2.json.
   ADDED (red1 via watcher): is the jagged edge part of the same problem? Per arm, one line: shadow texel (m) at the
   parapet and at the mid-wing wall, and the filter in use. KNOWN FROM SOURCE, before any run: the photo shadow is
   PCFShadowMap (effects.js:3164; tools.js:942), shadow.radius never set (= three's default 1). The sun camera is
   ORTHOGRAPHIC, so the texel is the SAME everywhere in the frustum: 2*env/size = 0.088 m at 8192 on this branch,
   0.177 m at 4096 on main (Hospital env 362). What differs by place is the footprint on the surface: a texel
   stretches to texel / sin(angle between surface and sun), e.g. a flat roof at a 10° sun gets 0.088/0.174 = 0.51 m
   steps along the sun direction, while a sun-facing wall gets ~0.09 m. So the saw-tooth is area-per-map at grazing
   incidence, with a 1-texel PCF that does not hide it. To confirm per arm: the logged frustum bounds and whether the
   mid-wing point is inside it (a point OUTSIDE the frustum gets no shadow at all, which would explain missed walls).
   LEVER TO TEST WHEN THE RUN RESUMES (watcher, not now): Alt+S is ONE still view, so fit the sun frustum to the
   camera's VISIBLE receivers instead of the whole 362 m envelope. The texel shrinks many-fold where it matters. Test it
   as one variable next to PCFSoft / radius. Caveat to log: casters OUTSIDE the view (a wing behind the camera) must
   still land in the frustum: extend it toward the sun over the envelope's height, or shadows go missing (the
   same symptom as the mid-wing report). Log the fitted bounds + texel per arm.
   TEST POSE (red1, 11:43): ~/Downloads/bounce_still_1790221419718.png, Hospital, looking down into the courtyard
   between two wings; roof items cast shadows (the helicopter's falls lower-left, so the sun is behind the right
   wing), yet the courtyard floor and both inner facades carry no wing shadow, and the right wing's inner (off-sun)
   facade is bright. Both of red1's points in one frame. The PNG has no pose, and no console line logs the camera at
   Alt+S; red1 was asked (via the watcher) to paste: JSON.stringify({cam:APP.camera.position.toArray(),
   tgt:APP.controls.target.toArray(),fov:APP.camera.fov,aspect:APP.camera.aspect,sun:APP.sun.position.toArray(),
   sunTgt:APP.sun.target?APP.sun.target.position.toArray():null,sunI:APP.sun.intensity,db:location.search,w:innerWidth,h:innerHeight})
2. Bounce composite shifted sideways on alternate shots after __giStillRelease (HHS, camera logged identical,
   appMean 119.25 every shot). Evidence: scratchpad dials/run2/. Then the bounce-gain stills 0.6/1.0/1.4 for red1
   (the bounce dials apply only at first build, §GI_DIALS_FIRST_BUILD).
3. §SURFACE_R10 openings: spec + additions approved; /tmp/wt-r10 branch feat/surface-r10 created at eb854d69,
   NO code yet. The measurement to port is in scratchpad r10/.
3b. §SURFACE_R10 BUILT (Opus agent, /tmp/wt-r10 feat/surface-r10 @ ac6c5524, local): split counts match the
   measurement exactly (Hospital 118/118, Terminal 223/228, LTU 951/976); paneCasters=0. Closing 4 gaps before red1
   looks: glass-shadow arm with a full-load guard, DLOD forced on split meshes, the Alt+S bounce on the real GPU with
   split meshes, LTU cost in fps. Then merge into the served branch after §STILL_GLOW.
OPEN (record, not chased): headless page loads are FLAKY. Terminal streamed 48,428 / 47,928 / 29,928 / 0 in different
   runs, and Hospital sometimes 8,682 or 60,682 of 63,182. It hits every witness: each must gate on the full element
   count (elements_meta per building vs guidMap) and print VACUOUS otherwise.
4. Bounce as a proper Alt+C film option (today only the dev --tap). red1 AGREED (2026-09-24, via watcher): ON by
   default, a checkbox to switch it off; covers the in-browser film AND the "copy bake command" line (it must carry
   the option, not the dev --tap); no WebGPU -> stands down with a logged §GI_*_OFF and the film still bakes. Spec
   first. Proof before any big bake: 5 s control clip + 5 s bounce clip, and a log showing the bounce ran per frame.
   Order unchanged: mid-wing/off-sun-wall report, the shift, gain stills, R10 (Opus agent running in /tmp/wt-r10), then this.

## ▶▶ §RESUME 2026-09-24 — START HERE. The bounce is LIVE on the real site; three items open.
Everything in §GI_BUILT below is history + evidence; this block is the state.

**LIVE on https://red1oon.github.io/bim-ootb/ (sw v1234):** Alt+S bounce still (desktop + WebGPU + three
r186; phones/no-WebGPU log `§GI_STILL_OFF`). Merged: bim-ootb #1756 (bounce + film tap, sandbox),
#1757 (viewer: r186 core/webgpu, viewer/gi_still.js, gate), #1758 (§GI_ORIENT_RATIO). Fleet check
(7 buildings, r185 vs r186) identical. A browser still showing the OLD Alt+S = its service worker;
reload twice / close all tabs (red1 hit this 2026-09-24).

**On a branch, tested, NO PR yet** — bim-ootb `feat/shadow-size-by-envelope` (8a938d9c, de29cb96;
worktree /tmp/wt-shadow, served on http://127.0.0.1:8600/index.html by
`node <scratchpad>/serve_tree.js /tmp/wt-shadow 8600` — /tmp, gone after reboot):
  1. §GI_ROW_PROBE — red1's desktop reads rows the OPPOSITE way to headless (flipOut=true, Clinic
     20.93% vs 0.01%); the live #1758 fallback ("no flips") is therefore WRONG on his machine at an
     undecided view. Probe witnessed 0/2048 vs 2048/0 (injected). **Ship this first** — it is a live
     correctness fix. sw/effects version bumps already in the branch (v1235, effects.js?v=40).
  2. §SHADOW_SIZE_BY_ENVELOPE — Hospital 8192 (0.088 m texel, 512 MB freed on exit), Clinic/HHS 4096.
     BUT red1's 07:21 Hospital still (Downloads/bounce_still_1790205672390.png, taken on this build)
     STILL shows the sawtooth under the parapet: resolution alone does not fix it. Hypothesis (NOT
     measured): the grazing-sun PCF kernel widening (`§SUN_SHADOW_RESTORE kernelMaxScale=4`). Next:
     one-variable A/B on Alt+S at that pose, kernel scale 4 vs 1, before any PR of the size change.

**OPEN — film interiors gloomier than Alt+S stills (red1: "old issue, shadow ON can darken
interiors").** NOT the lamps (red1 ruled it out: lamps are on early and it is still gloomy). Lead:
LOADPATH_FREEZE_POLISH_RESUME.md §134 "A REAL DEFECT FOUND" — PR #1601 (2026-09-01) halved fill
(ambient 0.785->0.386, hemi 1.257->0.617); bake prints sunFillRatio=4.387 vs TM's 2.155, so shadowed
interiors get ~2x the contrast. The honest experiment there is still undone: one clip with fill
restored (runtime override, no file edit) vs as-is, same frames, red1 judges.

**WATCHER HANDOFF (2026-09-24, red1-20 -> fresh session).** The working session is `red1-ff`
(local, find it with ListAgents). red1's arrangement: it sends its recaps to the watcher; the watcher
answers routine calls on red1's behalf within the set direction and keeps it from veering; LOOK
rulings and scope changes go to red1 himself. Rules it has been given: serve ALL work on
http://127.0.0.1:8600/index.html as it goes (sw/?v bump when Alt+S changes; every recap states
"localhost:8600 serves <branch>@<sha>, sw vNNNN"), ONE push + PR + CI auto-merge at session END,
then prove on the live site; never hand red1 git decisions; § log evidence, never guesses.
Its queue, in order (as of 08:40): (1) DLOD off during Alt+S — red1's 08:37 Terminal still
(Downloads/bounce_still_1790210272668.png) shows sky/sun through the roof; only Time Machine pauses
DLOD today (time_machine.js:9312); also confirm bakes (TM pause, §DLOD_BAKE_PROXY :9331);
(2) fill-restore A/B clips for gloomy interiors (HHS film frames 168-288, --no-load-path; clip B valid
only if EVERY per-frame §SUN_ARC_FILL_PIN reads ambient 0.7850 / hemi 1.2570) — result goes to red1
for the look; (3) low-sun (~10 deg, 228 az) shadow re-run on Hospital at 8192: k4 / k1 / shadows OFF,
each logging elevation + NdotL/kScale at the parapet (first A/B at 45 deg was INCONCLUSIVE: kScale
only 1.41x). Also noted open, not chased: red1's 07:21 still is left-right mirrored vs headless.
**NEW OBSERVATION (red1, 2026-09-24): rugged surfacing is overdone on SMALL parts.** Doors and some
beams get the same rough triplanar texture as big walls and slabs — "not appropriate and overdone as
big walls, slabs already have them". Evidence in red1's own logs: `§TRIPLANAR_INIT class=IfcDoor
tex=textures/materials/metal_color_1k.jpg`, `class=IfcBeam`, `IfcMember`, `IfcFlowTerminal`,
`IfcRailing` all receive a triplanar map (`§TRI_SRC_TALLY ... textured=46729` of 48428 on Terminal).
Not traced yet: which rule assigns triplanar by class/name (search §TRIPLANAR_INIT in viewer/). Likely
direction for red1 to confirm: apply the rugged maps by SIZE or class (walls, slabs, columns, big
coverings) and give small parts (doors, beams, members, fittings, railings) a smooth material. Queue
after the three items above; red1 judges the look on localhost.
**§SUN_SHADOW_RESTORE IS INERT — MEASURED (2026-09-24, Hospital, 8192 map, sun 10° alt / 228° az).**
Low-sun re-run, three arms (k4 / k1 / sun.castShadow off), same pose, real GPU. Each still printed its
own `§SHADOW_SIZE_BY_ENVELOPE size=8192` and `§SHADOW_KERNEL_AB ... sunElev=10.0deg kScale(flatRoof
NdotL=0.174)=4.00` (k1: 1.00). The widening WAS live per pixel (k4 crop meanK 3.29, max 4), but the
pass's own shadow term classed **0 of 1,439,424 frame pixels as shadowed, and 0 as edge**, in both arms
(`§AB_KSCALE_READBACK`). Cause: the shader does `step(sc.z, texture2D(tShadowMap, sc.xy).r)` with
`tShadowMap = A.sun.shadow.map.texture` (effects.js ~4500). In this three build the WebGL shadow map
writes depth to a separate `map.depthTexture`; `map.texture` is an RGBA8 colour attachment (readback
.r ≈ 0.76 where sc.z ≈ 0.24), so the step never fires and the pass returns the AO colour untouched.
**Not a r186 regression:** the WebGL shadow-map allocation in three.module.min.js is byte-identical
before and after #1757, and §SUN_SHADOW_RESTORE landed 2026-08-14, after r185 (06-27), so it has
likely never worked. With shadows OFF the parapet edge is clean, so the stair-step is the native
PCFShadowMap edge (0.088 m texels at 8192), not geometry. The kernel dial cannot fix it. Fix
direction (red1's call, NOT done): sample `map.depthTexture` (compareFunction null for this path)
instead of `map.texture`. Evidence: scratchpad shadow_ab/ (sheets, debug readbacks, logs), spike
edit uncommitted in /tmp/wt-shadow-kernel. Open, not chased: red1's 07:21 still is left-right mirrored.
**§SUN_SHADOW_RESTORE_DEPTH — SPEC (red1 ruled FIX, 2026-09-24).** The pass reads the shadow map's
DEPTH: `tShadowMap = A.sun.shadow.map.depthTexture`, declared `sampler2DShadow` and sampled
`texture(tShadowMap, vec3(sc.xy, sc.z + bias))`. Reason: the app uses PCFShadowMap, and for that type
three sets `depthTexture.compareFunction` (three.module.min.js: `this.type===PCFShadowMap ?
compareFunction=...`), so a plain sampler2D read of it is undefined; a shadow sampler is how three's
own PCF shader reads it. The lit test is unchanged (1 = lit, 0 = shadowed; hardware 2x2 compare
filtering gives fractions at the boundary, which the edge detector already handles). No depthTexture
-> the pass stands down and logs `§SUN_SHADOW_RESTORE_SRC none` (never reads the colour attachment
again). Log once per still: `§SUN_SHADOW_RESTORE_SRC depthTexture compare=<fn>`.
**Test (proves the defect gone):** same Hospital pose, sun 10°/228°, 8192 map: the pass's own shadow
term must class a NON-ZERO number of shadowed and edge pixels (`§AB_KSCALE_READBACK`, was 0/0), and
the k4 vs k1 crops must differ. Then red1 judges the parapet edge on localhost.
**§TRI_BIG_ONLY — TRACED + SPEC (2026-09-24), a switch, NOT a change of the maps.** Source: bim-ootb
`viewer/streaming.js` `A._triResolve` — authored material NAME first (`TRIPLANAR_BY_NAME`, e.g.
'Metal Deck' 33,756, 'Silver' 4,263 — this is how IfcDoor gets metal), IFC CLASS second
(`TRIPLANAR_MAT`: concrete for wall/slab/column/footing/stair, plaster for covering, METAL for beam,
member, plate, railing and every MEP class). Size is never consulted. A per-element SIZE rule cannot
be applied cleanly: one material is shared per batch and built from the batch's FIRST element
(`_getMaterial(items[0]...)`). So the proposal is by CLASS. BIG = {IfcWall, IfcWallStandardCase,
IfcSlab, IfcColumn, IfcFooting, IfcStair, IfcStairFlight, IfcCovering, IfcRoof}: those keep the rough
maps. Every other class drops them during the still (flat colour, no grain). Measured sizes, Terminal,
median 2nd-largest bbox dim: Wall 3.50 m, Slab 1.92, Covering 2.45 vs Door 0.95, Beam 0.75,
Member 0.40, Plate 0.15, FlowTerminal 0.39.
**Switch:** `?tri=big` on the viewer URL, or `APP._triBigOnly = true` in the console; takes effect on the
next still frame (per-material `uTriActive`, re-asserted in onBeforeRender), no restream. Default OFF =
byte-identical look. `TRIPLANAR_MAT` / `TRIPLANAR_BY_NAME` untouched until red1 rules.
**Log:** `§TRI_BIG_ONLY_TALLY` per class, rows textured now vs rows textured under the switch (via the
app's own `_triResolve`, not re-derived).
**Test:** the tally prints, and with the switch on during Alt+S every non-BIG triplanar material
reads uTriActive=0 while BIG ones read 1 (`§TRI_BIG_ONLY_ACTIVE`). red1 judges the look.
**BUILT + WITNESSED (bim-ootb c1b2f08d, local; served on 8600):** `§TRI_BIG_ONLY_TALLY` Terminal
texturedNow=46,729 -> texturedUnderSwitch=1,305 (Slab 700/700, Wall 333/333, Column 158/158, Covering
82/82, StairFlight 32/32; Plate 33,324/0, Door 133/0, Beam 432/0, Member 442/0, Railing 34/0, all MEP 0).
`§TRI_BIG_ONLY_ACTIVE` during Alt+S: on {big 15 on, small 46 off}; off {big 15 on, small 46 on}.
Witness: viewer/tests/witness_tri_big_only.js.

**Other open, lower:** app-side run-to-run glow haze (not the bounce; control has it; parked by red1);
cause of the rare empty app render under the tap (guarded + logged `§GI_BAKE_TAP BLANK_GRAB`); Alt+S
status message appears late = the app's own synchronous still staging (measured 70 s headless HHS,
~5 s on red1's desktop), not the bounce; free look dials untried (drop the film's second AO layer;
bounce gain > 0.6); the film tap is still sandbox-only (gi_bake_tap2.js via cli_silent_bake --tap).

**Films delivered 2026-09-23/24** (~/films/, copies in ~/Downloads): HHS whole path 480p + 1080p
(`hhs_gi_full_1080p.mp4`), Hospital whole path 480p + 1080p (`hospital_gi_full_1080p.mp4`, 2h43m).
Check policy agreed with red1: no full-length control; 5 s control clip before a big bake + self-checks.

## §STILL_STATUS_FIRST (2026-09-24) — SPEC: Alt+S says so AT ONCE
**red1:** on Alt+S the status must appear immediately; today it shows only after the app's synchronous still
staging (~5 s on his desktop, 70 s headless HHS), so nothing tells him the press registered. **Source:**
scene.js:3228 (Alt+S) and panels.js:428 (button) call A.toggleStillRefine() -> startStillRefine() ->
_applyPhotoStaging() synchronously inside the key event; gi_still.js's toast is set in a setTimeout that
cannot paint until that returns. **Rule:** the two USER entry points call `A.toggleStillRefineUI()`: if a
still is on it toggles off as before; otherwise it shows the status toast (same element/style as
gi_still.js, `#gi-still-toast`), waits for one animation frame plus a macrotask (the frame is committed),
THEN calls startStillRefine(). Programmatic callers (bake, witnesses) keep the synchronous
toggleStillRefine/startStillRefine unchanged. A second press while pending is ignored. The toast hides when
the still is ready (busy clears) unless gi_still has taken it over. **Log:** `§STILL_STATUS painted t=`,
`frame t=`, `stagingStart t= gap=<ms since painted>`. **Test:** headless Alt+S keypress -> the three lines in
that order, gap < ~100 ms, and the still still completes (and the bounce still runs where supported).

## §PROBE_GRID_SURVEY (2026-09-24) — SURVEY ONLY, no code. Queued AFTER the wall-shadow fix and R10.
**Goal (red1):** replace the even ambient + hemi base (a flat fill that lights a deep corridor as brightly as a
window bay) with light that comes from real sources: sky and sun entering through the openings.
**1. What fits our r186 setup — from the shipped library files, not from memory:**
- **three's WebGL renderer ALREADY reads a probe grid natively.** three.module.min.js: a scene object with
  `isLightProbeGrid` is collected in the render list (`pushLightProbeGrid`), defines `USE_LIGHT_PROBES_GRID`, and the
  standard lighting chunk adds `getLightProbeGridIrradiance(worldPos, worldNormal)`: a trilinear lookup in a
  `sampler3D probesSH` atlas (9-term L2 spherical harmonics, RGB = 27 floats packed as 7 RGBA texels per probe, z padded),
  bounded by `probesMin/probesMax` at `probesResolution`, sampled half a cell along the normal (cheap leak damping).
  The renderer reads `.texture`, `.boundingBox`, `.resolution` from the object. **The grid CLASS is not in our lib
  files** (no LightProbeGrid constructor in three.core/module), so it is a three add-on to vendor, or a small object
  we write with those three fields. The baker (cube capture per probe -> SH projection) is ours to write; three ships
  `LightProbe` + `SphericalHarmonics3`, and the add-on `LightProbeGenerator.fromCubeRenderTarget` does the projection.
- **WebGPU (the Alt+S bounce renderer) has no grid support** (three.webgpu.min.js: only LightProbeNode). That does not
  matter: the bounce starts FROM the app's finished WebGL frame, so the grid's light is already in it.
- **Baked lightmaps:** needs a second UV set on every mesh; our geometry is instanced/batched from hashed blobs with no
  lightmap UVs, and one element instance per hash would need its own texels. Rejected for the whole-building case.
- **three-gpu-pathtracer, stills only:** not installed (not in node_modules); ground truth for one still, minutes per
  frame. Useful as the REFERENCE to judge the grid against, not as the runtime path.
- **DDGI-style (live-updating probes with visibility):** the right shape long-term (moving sun during a film), but a
  per-probe ray/depth pass per frame. Start with a static bake per sun state; the film's sun arc would need one bake
  per sampled sun position, or a sky-only grid plus the existing real-time sun.
**2. Placement from our rooms data, not a blind grid.** One grid object = one axis-aligned box at one spacing (what
the shader reads). Rooms data decide which probes are VALID and how they may see: `spatial_structure` (Terminal 59
rows, HHS 17, Hospital_silent 79; Hospital_extracted has none) and the app's room graph (navigate_find.js
`_roomGraphFor`, rooms + doors + exits). Use: (a) invalidate probes inside solids, or outside any room/envelope, and
fill them from their room's valid neighbours; this is the main leak cure, because a probe inside a wall sees black
or outdoors. (b) Weight openings: a probe sees the sky only through IfcWindow panes and open doors. (c) Per-room
brightness sanity: a probe must not be lit by a room it has no door or opening to.
**3. Hospital numbers.** ARITHMETIC now, to be MEASURED before any decision. Structural extent 116 x 134 x 47 m.
Probes/atlas (7 RGBA texels each): 4 m spacing 11,832 probes, 0.7 MB half-float; 2 m 93,264, 5.2 MB; 1 m 746,112,
41.8 MB. Bake = 6 renders per probe (cube) of the whole building: 11,832 x 6 = 71k renders at 4 m. The wall time,
the file size after compression, the runtime cost (one extra 3D-texture lookup x 7 per pixel), and the phone impact
(sampler3D + half-float support; fallback = today's ambient) must each be MEASURED on Hospital, headless and on red1's
desktop, before it ships. Distribution: a per-building file on OCI next to the DB (the DB rule), not git.
**4. Dependencies:** R10 glass panes FIRST: today's black opaque windows would block the sky, and the grid would bake
dark rooms. The wall-shadow fix FIRST, so walls receive the sun that the grid's bounce is built on. The §SURFACE_RULES
roughness also matters (a smooth floor reflects the grid's light differently from a rough one).
**5. Scope:** ONE grid per building feeds browsing, Alt+S and Alt+C films the same way (all are the WebGL frame).
Behind a switch (default off until red1 judges). Keep a base floor of about 25% of today's ambient + hemi, so deep
rooms with no probe light never go black. Film sun arc: sky-only grid + real-time sun first; per-sun-position bakes
only if red1 asks.
**FIRST STEP when reached (watcher, accepted 2026-09-24):** ONE measured 4 m sky-only bake on Hospital (bake time,
compressed size, fps on desktop, a phone estimate) BEFORE any wiring.

## §SURFACE_RULES (2026-09-24) — SPEC, sent to the watcher BEFORE any code. Supersedes §TRI_BIG_ONLY.
**red1:** surfaces are too rough and materials hard to tell apart. "keep the metal deck rough; ... it is floor
slabs and small beams that are given rough surfaces; not to do so, as that is not realistic in real life."
"if floor slabs are marble like done is OK, just not rough." Rules must be general (no one-off names),
balanced, and tied to how the real surface is finished.
**Why it looks rough today (source, bim-ootb viewer/streaming.js):** only three textures exist (concrete,
plaster, metal). Each is pushed hard: contrastBoost 1.6 / 1.5 / 1.9 plus a normal map. They are handed out
by authored name, then class, and METAL covers beams, members, plates, railings and all MEP, so most of the
model wears the same coarse metal grain. Materials that differ in life (painted steel, galvanised pipe, timber
door) then read alike, because the texture swamps their base colours.
**Signals the rules may use (all present in the data, no names):** (1) IFC class; (2) the SUBSTANCE of the
authored material via a small lexicon (metal / concrete / plaster-gypsum / timber / glass / stone-tile),
absent -> class default; (3) ROLE from geometry: FLAT = thinnest bbox axis vertical; ROOF LAYER = a flat
element with no other flat element above it over its footprint (1 m grid of the building's own elements);
UPRIGHT = thinnest axis horizontal. Not usable: exterior vs interior (no reliable field in any of the 3
DBs) — stated, not guessed. One material is shared per batch, so a batch takes its members' MAJORITY
outcome, not its first element's.
**Measured, so the roof rule is geometric, not by height:** Terminal's 'Metal Deck' plates (33,324, all flat,
0.11x0.15x0.5 m) sit 33-42 m, mostly NOT within 6 m of the top (2,522 are); HHS's 629 plates are UPRIGHT
(facade panels); Hospital's 2,211 plates are mostly upright (127 flat).

| # | Surface (role + substance) | Real-life finish (reason) | Texture | Look: base colour · roughness · texture scale/strength |
|---|---|---|---|---|
| R1 | ROOF LAYER, metal (deck, sheeting) | exposed, weathered profiled sheet | metal ON | IFC/class grey · 0.55 · tile 0.6 m, contrast 1.9 -> 1.2 |
| R2 | ROOF LAYER, other (membrane, tile, concrete) | exposed to weather | its substance's map ON | class colour · 0.8 · contrast x0.7 |
| R3 | Exposed structural concrete: IfcWall, IfcColumn, IfcFooting, IfcPile (substance concrete/absent) | board-marked / cast finish | concrete ON | warm grey · 0.85 · tile 2.5 m, contrast 1.6 -> 1.1 |
| R4 | FLAT floor slab (IfcSlab not roof layer), stairs, ramps | finished floor: screed, tile, stone | OFF | class grey, slightly lighter · 0.35 (polished; marble-like sheen OK) · envInt 0.3 |
| R5 | Finished walls/ceilings: IfcWallStandardCase, IfcCovering, substance plaster/gypsum | painted plaster / board | OFF | light warm white · 0.75 · none (reads as paint by colour) |
| R6 | Steel sections: IfcBeam, IfcMember, IfcPlate NOT roof layer | painted / galvanised steel, fabricated | OFF | cool mid grey · 0.45 · none; metal kept |
| R7 | Fabricated small parts: IfcDoor, IfcRailing, IfcWindow frame, IfcFurniture | factory finish | OFF | colour carries identity: door timber brown, railing dark steel, furniture wood · 0.5-0.65 |
| R8 | MEP: pipes, ducts, fittings, terminals, valves | galvanised / painted, colour-coded | OFF | keep MEP hue coding · 0.4 · none |
| R9 | Glass (alpha < 1) | glazing | OFF (unchanged) | unchanged |

Distinctness comes from base colour + roughness first; texture is kept only where the real surface is
visibly coarse at building scale (R1-R3). No row keys on one material string; 'Metal Deck' stays rough
because it is a metal ROOF LAYER (R1), the same row that would catch any building's roof sheeting.
**Delivery:** behind a localhost switch (`?surf=rules` / `APP._surfRules = true`), default = today's look, until
red1 rules. **Log:** `§SURFACE_RULES_TALLY bld=... rowCounts R1..R9 (rows now textured -> textured under rules)`
per building (Terminal, HHS, Hospital), plus `§SURFACE_ROOF_LAYER flat=.. roofLayer=..` so the geometry test
is visible. **Test:** tallies print on all three; during Alt+S with the switch on, textured materials are
exactly R1-R3 (`§SURFACE_RULES_ACTIVE`); red1 judges the look on localhost.

**§SURFACE_RULES — REVISION 1 (watcher review, 2026-09-24).**
**(1) R1 measured BEFORE code** (read-only probe scratchpad roof_layer.py, extracted DBs, FLAT = thinnest bbox
axis vertical, 1 m grid, a flat element is a ROOF LAYER when < 50% of its cells have another flat element whose
bottom is at/above its top). First pass: only 16,297 / 33,324 Terminal deck pieces passed, because the sloped
deck's OWN strips overlap inside a 1 m cell (171,813 cover hits were Metal Deck over Metal Deck). Rule
refined, general: **pieces of the same surface (same class + material) above do not count as cover** (a sloped
roof made of strips). Result: Terminal Metal Deck **33,225 / 33,324 (99.7%) roof layer**; the 99 others sit
under a ceiling board, a floor slab or ducts. Roof-layer slabs: Terminal 5/469 flat, HHS 17/83, Hospital 8/35.
Coverings: 0 (Terminal), 2 (HHS), 0 (Hospital). The deck stays rough through R1, with no name involved.
**(2) Precedence, first match wins:** R9 glass (alpha < 1) > R10 single-style opening > R8 MEP (by class:
colour-coded services are never retextured) > R1/R2 ROOF LAYER (any envelope class: slab, plate, roof,
covering) > FLOOR (a flat non-roof IfcSlab / stair / ramp -> R4, whatever it is cast from; accepted 2026-09-24) > SUBSTANCE (concrete -> R3, plaster/gypsum -> R5, metal -> R6, timber/stone-tile -> smooth, their
class colour) > CLASS default (R3 walls/columns/footings, R4 flat slabs/stairs, R6 steel, R7 fabricated
parts). Substance beats class, so the IfcWall vs IfcWallStandardCase split (an authoring artefact) no longer
decides rough vs smooth: a plaster IfcWall is R5 and a concrete IfcWallStandardCase is R3. A roof-layer
IfcSlab is R2 (its substance's map, strength x0.7); a non-metal roof-layer plate is R2 too.
**(3) No invented colours.** Rows change ROUGHNESS, TEXTURE on/off/strength and envInt only. Base colour
stays what it is today: the authored IFC / surface_styles colour where one exists; STD_MAT's class default
only where rgba is NULL (existing rule §S265c, unchanged). The table's colour words describe today's
defaults, not new values. Log: `§SURFACE_RULES_COLOUR authored=n classDefault=n` per building.
**(4) Majority flips:** a batch takes its members' majority row; `§SURFACE_RULES_TALLY` also prints
`againstOwnRow=n` (elements whose own row differs from their batch's) per row.
**R10 (from the watcher's trace): single-style opening.** IfcWindow / IfcDoor whose whole mesh carries ONE style
(Terminal windows 228/236 black opaque, doors 110/135 one near-white handle style; Hospital 118/131, JKR 83/83,
LTU 976/976 windows opaque). A data gap, never silent: `§SURFACE_OPENING_SINGLE_STYLE bld= class= n=`. Window:
pane split from frame by geometry, pane -> class-default glazing, frame keeps the authored colour; if the split
is not clean, the whole element gets class-default glazing, and the path taken is logged. Door: leaf -> smooth
R7 finish. Multi-style / glass-styled openings untouched. **Split feasibility is being measured (geometry,
read-only) before any R10 code.**

**§SURFACE_RULES — BUILT (bim-ootb 4c8c8d4f, local, served on 8600; default OFF, `?surf=rules` at load).**
One deviation from rev 1, recorded: a FLAT non-roof slab/stair is R4 BEFORE substance. Otherwise Terminal's 322
'Concrete - Cast-in-Place' slabs would be R3 rough, against red1's "floor slabs smooth" (a floor is a finished
surface whatever it is cast from). Substance still beats class for walls. Witness viewer/tests/witness_surface_rules.js:
Terminal roofLayer 33,217, R1 32,826 (deck rough, 165 against own row), R4 733, textured 46,729 -> 32,921;
HHS roofLayer 118, textured 5,600 -> 278; Hospital roofLayer 488, textured 51,516 -> 1,320; colours all
authored or class default, unchanged. Only R1/R2/R3 materials carry a texture; switch off = today's 61
textured materials on Terminal. Terminal note: walls/columns/railings resolve R5 (plaster) through the leaked
'…BrickPlaster' type name (smooth, as a plastered brick wall reads). Doors/windows resolve R6 (metal names);
R10 will own them. **Look: red1 on localhost.**
**§SUN_SHADOW_RESTORE — PARKED (watcher ruling for red1, 2026-09-24).** Stays OFF by default (32fa52e8,
`§SUN_SHADOW_RESTORE OFF (default)` witnessed on 8600). The depth-texture fix (62ef1985) stays behind
`APP._sunShadowRestoreEnabled = true`. Evidence: with the fix it fires (low-sun Hospital crop shadowedPx 25,012,
edgeBandPx 18,395 at k4 / 9,753 at k1, was 0/0), but it paints blocky halos: the edge band is 36% of the frame at k4,
and the stair-step reads MORE clearly (sheet ~/Downloads/hospital_shadow_edge_before_after_fix.png; stills and
readbacks in the photoreal scratchpad shadow_ab/). The parapet saw-tooth is the native PCF edge, present with or
without the pass. Nobody missed it (inert since 08-14). A later session may tune it; no tuning this session.

**§SURFACE_R10 — SPEC (openings with a single style), from the read-only geometry measurement (2026-09-24,
scratchpad r10/: spec.md, measure_windows.py, windows_all.log, doors_all.log).** Data = what the viewer renders
(<B>_meta.db + <B>_geo.db when split, else _extracted.db; blobs decoded as scene.js blobToGeometry).
Single-style window = IfcWindow with material alpha >= 1 (reproduces the IFC counts: Terminal 228, Hospital 118,
JKR 83, LTU 976).
**Window split rule (per MESH, counted per element; windows share meshes, e.g. Terminal 228 -> 31):**
oriented frame from the mesh's own face normals (n = largest area-weighted normal cluster, >= 40% of area; u = the
largest in-plane cluster; v = n x u). NOT the bbox thin axis: 40 of 118 Hospital windows are rotated ~10° in their
local frame, and the bbox rule fails all of them. PANE triangle: |normal·n| >= 0.95, no vertex within 1 mm of the
oriented box's in-plane edges; patches grouped by depth (0.5 mm) + shared position; a patch is PANE when area >= 2%
of the elevation, min side >= 120 mm, solidity >= 0.85 (rejects hollow sash rings). CLEAN = best pane depth level
covers >= 50% of the elevation, inset >= 10 mm on all four sides, and the frame remainder is a ring. Split per
TRIANGLE, not per connected component: JKR and LTU weld the glass to the frame (a component split fails 54 + 466).
**Measured:** Terminal 223/228 clean (97.8%; the 5 are DG glazed screens whose main sheet is flush to the edge);
Hospital 118/118 (100%); JKR 54/83 at a 50% normal floor, 67/83 at 40%; the other 16 are LOUVRES, with no pane in life
either; LTU 951/976 (97.4%; 25 divided-light windows whose muntins are welded coplanar). Fleet 1,346 / 1,405 (95.8%).
**Look:** pane triangles -> the class-default glazing (IfcWindow STD_MAT, alpha + reflection); frame keeps the
authored colour. Not clean -> the whole element stays as authored (NOT whole-element glass: a louvre or a muntin
grid is not a pane), logged. Louvres stay slats.
**Doors:** Terminal 130/134 single-style doors have separable hardware (4-6 small components, 0.5-1.3% of area): the
handle keeps the authored (handle) colour, and the rest gets the class-default door finish, smooth (R7). Hospital doors are
already brown with no handle geometry: untouched. LTU: hardware found on 578/606.
**Implementation shape:** geometry groups on the shared mesh (one group per material: pane / frame, or hardware /
leaf), a material array per mesh; decided once per mesh hash at stream time, so instances cost nothing extra.
**Logs:** `§SURFACE_OPENING_SINGLE_STYLE bld= class= n=`, `§SURFACE_R10_SPLIT bld= windows clean=/fallback=
(reasons) doors hardware=/leafOnly=`. **Test:** the counts above reproduce in the app's own log per building;
default on with the surface rules; red1 judges the look.
**R10 additions (watcher review):**
(1) SHADOWS THROUGH GLASS. three.js casts shadows per MESH, not per group, so a split pane still blocks the sun
unless handled. Rule: the pane group's material gets `alphaTest`-free transparency AND the mesh's shadow pass
uses a customDepthMaterial that discards pane triangles (a per-vertex/per-group attribute `aPane`), so frames
still cast and panes do not. Witness as a SEPARATE arm from the mid-wing question: sun on an interior floor
behind a Hospital window, lit-pixel count on that floor patch from the pass's own shadow term (or the
readback tool), before vs after; `§SURFACE_R10_SHADOW paneCasters=0 frameCasters=n`.
(2) BATCHING. Per path, witness that the groups + material array survive: instanced (shared mesh hash), merged
(bucket merge bakes per-element index ranges; the split must be applied before the merge or the merged buffer
must carry the group), batched (BatchedMesh takes ONE material; a split element leaves the batch and goes
instanced/single), DLOD (zero-scale per instance, unaffected). Also that the Alt+S bounce geometry pass (one
override material ignores groups; fine, it only needs depth/normals) and the shadow depth pass (customDepthMaterial
above) still draw split meshes. Log `§SURFACE_R10_PATHS instanced=n merged=n batchedMoved=n single=n` per building.
(3) COST. Log draw calls (renderer.info.render.calls) and transparent-object count before/after on LTU (976
windows) and Terminal, same pose: `§SURFACE_R10_COST drawCalls a->b transparent a->b`.

## §DLOD_STILL_OWNERSHIP (2026-09-24) — SPEC: Alt+S must not let DLOD hide roof casters
**Defect (red1, ~/Downloads/bounce_still_1790210272668.png, Terminal hall 08:37):** sky and sun shafts
come through the roof. red1: "DLOD is removing the off frame roof where the Sun shines thru."
**Source:** dlod.js zero-scales InstancedMesh slots outside the camera frustum (`§DLOD_ENABLE
mode=per_slot_frustum`). A zero-scaled roof slot casts no shadow, so the sun reaches inside. Only the
Time Machine pauses DLOD (time_machine.js §DLOD_TM_OWNERSHIP, `_dlodPausedByTm`); nothing on the
Alt+S path does, so the still inherits the nav-mode culling.
**Rule:** `_applyPhotoStaging` (shared by Alt+S and the cinema/bake path) pauses DLOD if it is on,
and `_teardownPhotoStaging` re-enables it ONLY if staging paused it (a user's own DLOD-off is not
ours to flip; a bake where TM already paused it is a no-op). While staging holds, `dlodEnable`
(e.g. streaming.js after a stream completes) must not switch it back on; it records the request and
teardown honours it. Logs: `§DLOD_STILL_OWNERSHIP paused=1|0 ...` at staging, `restored=1|0` at teardown.
**Tests (prove the defect gone):** headless, Terminal, same hall pose, before/after the change:
DLOD state + zero-scaled instance count during the still (expect 0 after), and the gi_still.js
geometry pass sees the same unculled roof. Bake: an existing log must show DLOD already off for
every frame (TM owns it); say whether `§DLOD_BAKE_PROXY` hides roof casters too.

## ▶ §GI_BUILT (2026-09-23) — THE BOUNCE IS RUNNING, ON Alt+S LIVE AND IN THE BAKE. READ THIS FIRST;
## §WEBGPU_SSGI_SPIKE below is the investigation that preceded it and is now history, not the state.

**Nothing is shipped. Nothing under `viewer/` is committed.** Everything below lives in the bim-ootb
worktree `/tmp/wt-ssgi-webgpu-spike` and in `/tmp` roots that a reboot destroys — see WHERE THINGS
LIVE. Merged to main is only the sandbox source itself (PR bim-ootb#1755, squash `4818b3f0`:
28 files, all under `sandbox/spike_ssgi_webgpu/`, plus one `.gitignore` line; no shipped file).

### What works today, measured, not claimed
| | before | after |
|---|---|---|
| Alt+S first press (HHS, 664 objects) | **127 065 ms** one synchronous block | **3 003 ms** |
| Alt+S whole shot | 128.2 s | **5.7-7.0 s**, 2.8-3.6 s on later presses |
| Film, per frame, all 12 features, 1080p | 0.78 s (no bounce) | **0.95 s** (+22%) |

- **Alt+S** — press it as always. The app's own still runs untouched to completion, THEN the bounce
  is composited over the finished picture; a Save PNG / Esc bar appears. `Alt+Shift+S` releases the
  renderer. red1's verdict on the stills: "these are the ones to publish".
- **The film** — `gi_bake_tap2.js` through `cli_silent_bake.js --tap`, 614 frames at 24 fps.

### The architecture, and why it is this and not the obvious one
The obvious version (v1) re-rendered the whole scene with a second renderer and pasted the result in.
It silently dropped everything the app draws that the second renderer does not — red1 found four in
one viewing: the window lights (they are bloom, a post pass), the stack-freeze blackout, the
discipline reveal, and the sun shadows. Marker counts proved the app's own logic ran correctly in
every case (`§GLOW_LENS_QUAD` 68/68, `§PHOTO_GLOW_SPRITE_GATE` 615/615,
`§CPE_REVEAL_LENS_QUAD_OFF` 42/42, `§LOADPATH_HOLD` 3/3 against the r185 baseline) — the pixels just
never reached the frame.

**v2 starts FROM the app's finished frame.** That frame is the colour input; the second renderer
computes only depth and surface normals with ONE shared override material; the output is
`colour x AO + colour x GI`, re-encoded with `sRGBTransferOETF`, and composited back where the
geometry pass drew. Everything the app draws survives by construction. Consequences worth keeping:
1. **One shared material is what killed the 127 s stall.** WebGPU builds one render pipeline per
   render object, synchronously, on the main thread — `three.webgpu.js:85689-85720` only takes the
   async branch when `compileAsync` passes it a promise array. 292 of them back-to-back was the hang.
2. **No tone mapping and no exposure in this renderer.** The colour is already tone-mapped at the
   app's exposure; sampling decodes sRGB and the output re-encodes it, so an untouched pixel comes
   back unchanged (`mode 'coloronly'` measures compositeMean == appMean, meanAbsDiff 0).
3. **Coverage comes from DEPTH, never from alpha or brightness.** Four attempts failed on this.
   `SSGINode.updateBefore` wraps its quad render in `renderer.setClearColor(0xffffff, 1)`
   (`vendor/SSGINode.js:391`) and `PassNode.updateBefore` never sets a clear colour of its own
   (`three.webgpu.js:42967-43043`), so the frame comes back cleared WHITE at alpha 1 — there was
   never an empty signal to read. `depth.r.lessThan(0.999999)` is the honest test.
4. **The app's own frame must be drawn first.** The bake hook REPLACES cinema_maxq's
   `ctx.drawImage(A.renderer.domElement)`, so a correct mask over nothing is still black. Draw the
   app frame, then the bounce layer over it. Sky measured back at 173.0 against the app's own 170.5.
5. **Orientation is decided by MATCHING, never assumed.** Score the bounce layer against the app's
   frame both ways round (and, in the still, over all four combinations of texture-v and readback
   row order), keep the better, log the margin. A brightness-based test was tried and flipped the
   wrong way the moment red1 turned sky and ground on — it measured exactly what those settings change.
6. **Transparent meshes are left OUT of the geometry pass** (§GI_GLASS_SKIP). One opaque material
   records glass as a solid wall, and the hall fills with milky sheets; excluded, glass keeps the
   app's own pixels. Terminal has 26 such meshes at opacity 0.25.

### Dials (console; take effect only when the bounce renderer is BUILT — first Alt+S, or after Alt+Shift+S)
- **§GI_DIALS_FIRST_BUILD (2026-09-24, measured):** the dials below are baked into the output shader when the bounce renderer is FIRST built, and it is reused, so they apply to the first Alt+S of a session only, or after Alt+Shift+S releases the renderer. (Four HHS shots with different dials came out identical, compositeMean 106.76, until __giStillRelease() ran between them.)
- `window.__GI_STILL_AO` — occlusion blend, default **0.55**. 1.0 was red1's "eerie bouncing" on an
  aerial: at distance nearly every probe reads occluded and the whole building dims.
- `window.__GI_STILL_GAIN` — bounce strength, default **0.6**. At 1.0 a white hall measured
  compositeMean 163.68 against appMean 159.81 — it was adding light, not shaping it.
- `window.__GI_SLICES` / `window.__GI_STEPS` — sample counts, default 3/16 (the node's "high").
- `window.__GI_GLASS_OPACITY` — what counts as glass, default 0.9.

### WHERE THINGS LIVE — all of it is in /tmp and dies on reboot
- Worktree `/tmp/wt-ssgi-webgpu-spike` (branch `spike/ssgi-webgpu`), sandbox dir
  `sandbox/spike_ssgi_webgpu/`: `gi_still.js` (live Alt+S), `serve_gi_live.js` (dev server, port
  8600), `gi_bake_tap2.js` (film), `gi_bake_tap.js` (v1, superseded), `run_gi_still_headless.js`
  (puppeteer verifier — USE IT, do not ask red1 to test), `vendor/*.appbound.js`.
- **One uncommitted edit to a shipped file**: `viewer/cinema_maxq.js` §GI_CAPTURE_HOOK, 20 lines —
  `if (typeof window.__giCaptureFrame === 'function') await it; else` the original drawImage line.
  Inert without the hook.
- `/tmp/bake-r186-root` — a symlink farm of the worktree with only `viewer/lib/three.webgpu.min.js`
  and `three.core.min.js` replaced by r186. Rebuild it if it is gone; nothing tracked was touched.
- **ONE three.js instance, always.** A private copy makes `light instanceof THREE.Light` false, the
  renderer ignores the app's lights and every frame is black (measured: own lights 479 280 lit
  pixels, app's lights 0). That is what `vendor/*.appbound.js` exists for.

### §GI_STILL_ORIENT_GEOM (2026-09-23) — SPEC: orientation by surface direction, not by colour
**Defect, measured** (witness `witness_gi_orient_indoor.js`, HHS 1280x720, no edits): the colour
`composite` score picks between the two colour-upright candidates by margins of 0.08-0.33 (red1's
Terminal indoor press: 0.05), and picked the upside-down one at 3 of 4 poses (aerial, cinema
frames 240, 300). Upside-down AO/GI/mask over upright colour = red1's "smearing".
**Rule:** a front-facing surface's view normal n and the camera ray r through its pixel satisfy
n·r <= 0. Render the packed view normal RAW (no OETF, no colour transform) once; count covered
pixels with n·r > 0.05|r| with readback rows as-is and reversed. Fewer = flipOut. Measured
separation 0.06-1.8% against 21-32%, all 4 poses. flipTex is then the one of the two whose colour
`composite` score is lower at that flipOut. If both counts are within 2x of each other, log
UNDECIDED and keep the colour decision.
**Test (proves the defect gone):** the same witness at the same 4 poses must print RIGHT at all 4,
and at a Terminal indoor pose; `run_gi_still_headless.js` must still pass (incl. injected flip).

### §GI_SHARED_ATTR_WIDEN (2026-09-23) — SPEC: the second renderer must not rewrite the app's geometry
**Defect, measured.** Film v2 vs a same-frame no-tap control: 355/614 frames lose slabs, walls,
stairs (all BatchedMesh). Reproduced outside the bake (`witness_tap_before_after.js`, pose 460): one
tap capture, then the app's OWN frame differs by 67.7 levels, 48% of pixels. State diff across one
capture (`witness_batched_state.js`): 60/128 BatchedMesh index arrays Uint16Array -> Uint32Array,
and the app's next multiDrawStarts double (216 -> 432). Cause, in source:
`three.webgpu.min.js:84196-84214` (WebGPUAttributeUtils.createAttribute) widens non-normalized
8/16-bit arrays and writes `bufferAttribute.array = array` onto the SHARED attribute; the app's
WebGL buffer stays 16-bit (version unchanged, no re-upload) while BatchedMesh.onBeforeRender
(`three.core.min.js:27803+`) now computes byte offsets at 4 bytes/index -> draws read garbage.
Camera coordinateSystem was measured and RULED OUT (<=0.07 levels).
WebGPU reads the index format from `index.array`'s type at draw time (`three.webgpu.min.js:89025`),
so the fix is a swap, not a restore: before each second-renderer render, every 8/16-bit
non-normalized attribute (index included) of the scene gets a 32-bit copy we own (0xffff -> 0xffffffff
on a Uint16 index, as upstream does), rebuilt whenever the attribute's version moves; after the
render the app's own array is put back and every BatchedMesh gets `_visibilityChanged = true` so its
draw list is rebuilt at 2 bytes/index. Applies to `gi_bake_tap2.js` AND `gi_still.js`.
**Tests (prove the defect gone):** `witness_batched_state.js` -> no idxType change, no mdStart
change after tap+app; `witness_tap_before_after.js` -> tapVsBase ~0 at 460/150/60; film re-bake
vs the control -> the >5%-pixels-off-by-60 count drops from 355/614 to ~0 (only bounce shading left).

### §GI_TAP_SYNC_GRAB + §GI_TAP_GLASS_SKIP (2026-09-23) — SPEC: the two faults left after §GI_SHARED_ATTR_WIDEN
After the widen fix the film still differed from the control on 129/614 frames, in two groups.
1. **Frames 469-591, the load-path freeze, show the whole building instead of the blackout.**
   Debug bake (dumps at hold frames): the app canvas copied at the hook's FIRST line is correct
   (black + stack); the same canvas copied after `await ready` shows an older picture with the whole
   building, with `renderer.info.render.frame` unchanged (0 WebGL renders in between). A WebGL
   canvas does not keep its pixels past the task that drew them (the rule gi_still.js's
   grabAppFrame already states). **Rule:** copy the app frame synchronously at hook entry, before
   any await; that one copy is both the colour input and the underlay. Never read
   `A.renderer.domElement` after an await.
2. **Six single frames (350-413) go near-black.** Under scene.overrideMaterial the WebGPU renderer
   copies `transparent` but not opacity from the source (`three.webgpu.min.js:65410-65414`), so a
   fading/glass mesh is a solid occluder in the geometry pass. **Rule:** same as §GI_GLASS_SKIP on
   Alt+S — hide transparent meshes below opacity 0.9, A._sky and raw-GLSL ShaderMaterials for the
   geometry pass only, restore in `finally`.
**Test:** re-bake with the verbatim command vs the no-tap control; frames with >5% of pixels off by
>60 must fall from 129 to ~0, the blackout's dark share must match the control (~54%) at 480/520/600.
**Result of that re-bake:** 129 -> 10. Blackout matches (52.3/54.3/50.6 vs 52.4/54.3/50.5). But 4 NEW
single-frame dropouts (12, 49, 122, 604 — the app's own picture near-empty) appeared with the
`.visible` flip, the only change that writes app state; app code runs during the awaited WebGPU work.
**Amendment — skip by LAYER, never by `.visible`:** the geometry pass renders through its OWN camera
(copied from A.camera every frame) that sees only layer 31; every object except glass/sky/raw-GLSL
gets bit 31 each frame. The app never uses layers (grep: 0 calls) and its camera lacks bit 31, so
nothing the app reads changes. Also stops WebGPU rewriting A.camera.coordinateSystem.
The remaining 6 (350-413) are camera cuts where the tap film's 3D lags the HUD by one frame —
identical in both tap runs, absent in the control; separate open item.

### Open
- **DONE 2026-09-23: v2 film re-baked and checked frame-by-frame against a same-frame no-tap control**
  (`~/films/hhs_ssgi_2026-09-22/hhs_gi_v2_24fps.mp4`, `_small.mp4` 6.3 MB sent to red1; control
  `hhs_control_notap_24fps.mp4`). Frames off by >60 on >5% of pixels: 355 -> 129 -> 10 -> **3**.
  Blackout dark share 53.3/55.2/51.5% vs control 52.4/54.3/50.5%. PASS/FAIL tally identical (35/7).
  Superseded films kept with suffixes _BROKEN_batched / _widenonly / _visibleskip.
  **Still open:** frames 491, 592, 593 — at the freeze's layer-placed steps the new stack clone reaches
  the tap picture one frame late (app logged §LOADPATH_STACK on the same frames in both runs, so it is
  render-side). Tap film is darker overall (luma 90.9 vs 99.2): tap2 applies AO and bounce at FULL
  strength, not Alt+S's __GI_STILL_AO 0.55 / __GI_STILL_GAIN 0.6 — red1's look call.
- **§GI_TAP_DIALS (2026-09-23, red1: "proceed in tuning")** — SPEC: the film uses the SAME output
  formula and dials as Alt+S (`ao = 1 - K + K*AO`, `rgb = C*ao + C*GI*gain`, K=__GI_STILL_AO default
  0.55, gain=__GI_STILL_GAIN default 0.6) — the stills red1 approved for publishing. Test: film mean
  luma moves toward the control (was 90.9 vs 99.2) while the per-frame compare stays at <=3 frames off.
  Then the whole saved path (no --clip) at 854x480/24fps.
- **§GI_READBACK_ROWPAD (2026-09-23, red1: "smearing across")** — DEFECT, measured: the whole-path
  480p film (854 wide) came back with every row sheared sideways. `readRenderTargetPixelsAsync` at
  854x480 returned 1,658,840 floats vs 1,639,680 expected = rows padded to 864 px (256-byte WebGPU
  row alignment; RGBA float = 16 B/px, so any width not a multiple of 16), last row unpadded. 1920
  and 1280 are multiples of 16 — every earlier test was blind to it. red1's Alt+S window (1666x864)
  is NOT, so the live still was sheared too. **Rule:** after every readback, if length != w*h*4,
  stride = (len/4 - w)/(h-1) px (must be an integer >= w), copy each row's first w px. Both
  gi_bake_tap2.js and gi_still.js readRT. **Test:** tap at 854x480 and gi_still at 1666x864 headless
  -> composite vs app frame meanAbs back to the ~7-10 level of aligned sizes, no streaks.
- **§GI_TAP_EMPTY_GRAB (2026-09-23)** — whole-path 480p after the rowpad fix: 45/3275 frames off,
  of which 13 are single-frame blanks in the tap film only (app picture empty, HUD drawn) at RANDOM
  frames (161,166,239,1083… vs 153,160,1176… the run before) — ~0.4%. CORRECTION: the 4 blanks on the
  1080p clip were NOT caused by the `.visible` flip; the layer switch coincided, it did not fix them.
  SPEC: at hook entry, sample the synchronous grab; if it is empty (no alpha), log §GI_TAP_EMPTY_GRAB
  with `renderer.info.render.frame` delta since the previous capture, re-render the app
  synchronously (A._composer.render()) and grab again, log whether the second grab has pixels.
  TEST: a ~300-frame 480p clip (random 0.4% → expect ~1-3 events): every event logged, 0 blank
  frames in the output (self-referenced flash test, no control needed).
  **RESULT — the grab is NOT empty, the app rendered an empty scene.** 301-frame clip, flash at film
  frame 94 = capture 95: `GRAB_DROP lum=13.3 prevLum=91.2 rgb=8,8,24 alpha=255 clear=#080818
  appRendersSinceLastCapture=185` — opaque clear colour only, and the app renders on its own between
  captures (rAF/refine), i.e. also DURING the tap's awaited WebGPU render, while the shared scene
  still carries `overrideMaterial = GI_BAKE_GEOM` (a NodeMaterial the WebGL renderer cannot draw) and
  the widened index arrays. **Rule (§GI_TAP_NO_SHARED_ACROSS_AWAIT):** nothing shared stays mutated
  across an await. The geometry pass renders SYNCHRONOUSLY (`pipeline.render()`), override + widen set
  and restored around that one call; only the readback (touches nothing shared) is awaited.
  TEST: same clip length, 0 flash frames, 0 GRAB_DROP at the flash signature.
  **RESULT: the sync render did NOT remove it** (2 flashes, same signature) — kept anyway, it is the
  right rule. Root cause still UNKNOWN: on random captures one app composer render comes back as the
  flat clear colour (#080818); the per-frame count of 185 renders is normal (8 refine + 12 AO passes).
  **Guard (§GI_TAP_BLANK_GRAB):** a flat clear-colour grab right after a normal frame -> re-render
  synchronously, grab again, log `BLANK_GRAB ... lum now=`. 301-frame clip: 3 blanks, all 3 recovered
  (114.9/129.8/121.8 vs the frames before), 0 flash frames in the output. Open: why that one render is
  empty, and why never in a no-tap run (0 in 3275 control frames).
  Amended: the brightness condition (prevLum > 20) is dropped — blanks inside the dark load-path
  freeze (whole-path 935, 941) slipped past it; a genuinely empty frame re-renders to itself.
- **DELIVERED 2026-09-23: whole saved path, 480p/24, 3275 frames** (`hhs_gi_fullpath_480p.mp4`,
  `_small.mp4` 9.9 MB sent to red1). Vs `hhs_control_fullpath_480p.mp4`: meanAbs 5.2, luma 74.2 vs
  77.4, PASS/PARTIAL/FAIL 46/8/4 in both, 16 blanks caught+recovered, freeze dark share within 3 pts,
  escape route 156.21 m fully drawn. Only difference: a sun/lamp glow haze the APP draws on in one run
  and off in the other over ~60 frames, at a different place each run (1990-2050, then 2495-2556),
  plus 708-711 — app-side glow timing, not the bounce. Superseded films kept with suffixes
  _SMEARED_rowpad / _BLANKS / _darkblank.
- **OPEN (pre-existing, NOT the bounce) — jagged sun-shadow edges on long roof edges (red1, 2026-09-24).**
  Same sawtooth in the no-bounce control (hr_clip_ctl vs hr_clip_tap, frame 200). Cause in the log:
  `§PHOTO_SHADOW texelPerM=5.7` / `texel=0.177m` on Hospital (env=362) vs 11.4 on HHS (env=180) — one
  map stretched over twice the width; low sun (10 deg) stretches each step. Options by cost: 8192 map
  (4x memory ~512 MB), camera-following or cascaded shadow maps (the proper fix, real work), softer
  filtering (hides steps, blurs edges). red1: weigh benefit vs cost once the code settles.
- **§SHADOW_SIZE_BY_ENVELOPE (2026-09-24, red1: "Agree on the shadow 5 lines work") — SPEC.** The photo
  sun-shadow map is a fixed 4096 (bim-ootb viewer/effects.js ~3268) spread over +-env; Hospital's env
  (362) is twice HHS's (180), so its texels are twice as coarse (0.177 m vs 0.088 m, texelPerM 5.7 vs
  11.4). Make the size follow env: size = 4096 * 2^ceil(log2(env/180)), clamped to [4096, 8192] and to
  renderer.capabilities.maxTextureSize. HHS unchanged (4096); Hospital 8192. Bias already derives from
  the texel (texelWorld = 2*env/mapSize), release on still-exit already frees whatever size was raised.
  Cost: 8192 = 4x memory (~512 MB, stills/bakes only) + 4x shadow-pass pixels (bake time: measure).
  TEST: Alt+S headless on the new tree — Hospital logs texelPerM ~11.3 and the still completes;
  HHS still logs 11.4 at 4096 (no change); §SHADOWMAP_RELEASE frees the raised size on exit.
- **§GI_ROW_PROBE + §SHADOW_SIZE threshold (2026-09-24, from red1's own desktop log, Clinic, v1235).**
  (a) red1's desktop Chrome read `asRead=20.93% reversed=0.01% -> flipOut=true` — the OPPOSITE row
  order to every headless run (flipOut=false). So §GI_ORIENT_RATIO's "measured platform answer (no
  flips)" fallback is WRONG on his machine: at an undecided view it would shade upside down. SPEC:
  when undecided and no decisive answer yet this session, render a PROBE — a horizontal plane below a
  level camera, geometry material, same renderer, same readback path (incl. the test-injection hook) —
  and read which half the drawn pixels land in: bottom half as read = flipOut=false, top = true.
  Decisive by construction, per machine. flipTex stays false (every decisive reading, headless AND
  red1's desktop). TEST: undecided live view -> "row-order probe" and flipOut=false headless; same view
  with __GI_STILL_INJECT_READBACK_FLIP -> probe says flipOut=true; 4 HHS poses still RIGHT.
  (b) §SHADOW_SIZE_BY_ENVELOPE doubled Clinic (env 198 -> 8192, 512 MB, texel 0.048 m) though 4096
  already gives 0.097 m (~HHS's 0.088). SPEC: 8192 only when the 4096 texel exceeds 0.12 m (env > 245).
  TEST: Clinic 4096, HHS 4096, Hospital 8192.
- Look dials with NO bake cost, not yet tried: film AO applied twice (tap's SSGI AO over the app's N8AO)
  — drop the tap's; bounce gain above 0.6 (colour bleed barely visible at Hospital distances; 1.0
  washed out Terminal's white hall). Judge on a 5 s clip at 2-3 settings.
- **DONE 2026-09-24: Hospital FULL length 1080p/24 with bounce, all features** (red1: "full length as i
  got full machine up") — `~/films/hospital_ssgi_2026-09-23/hospital_gi_full_1080p.mp4` (245 MB, copy in
  ~/Downloads; `_small.mp4` 19.9 MB sent). 4963 frames, 9752 s wall = 2 h 43 min (1.96 s/frame; my
  concurrent live-site tests shared the GPU). Self-checks: 0 errors, 0 flash, 0 flat frames, 274 blank
  grabs all recovered, verdicts 51/14/4 = the 480p run, escape route 156.20 m fully drawn.
- **PAUSED 2026-09-23 by red1 ("kill the bake, will resume later"): Hospital 1080p ending, 1-hour
  budget.** 5 s 1080p clip pair (frames 3600:3720) CLEAN vs control (0 off, 0 flash, 2.2 s/frame).
  NOTE the 1080p film grid is 4699 frames, not 4963 (`§FRAME_RANGE_OOB b=4963 > full film
  frames=4699` — first attempt refused). Resume verbatim:
      rm -rf /tmp/silent-bake-profile-8613; cd /tmp/bake-r186-root && node cli_silent_bake.js \
        --root /tmp/bake-r186-root --db Hospital_silent \
        --out ~/films/hospital_ssgi_2026-09-23/hospital_gi_end_1080p.mp4 \
        --log ~/films/hospital_ssgi_2026-09-23/hospital_gi_end_1080p.log --gpu real \
        --chrome-args "--enable-unsafe-webgpu" --port 8613 --width 1920 --height 1080 --fps 24 \
        --frame-range 3336:4699 --tap /tmp/wt-ssgi-webgpu-spike/sandbox/spike_ssgi_webgpu/gi_bake_tap2.js \
        --buildup --label --4d5d --reveal --clash --measure --storey-reveal --load-path --ledger \
        --cost --escape-route --sun-compass
  Needs `/tmp/bake-r186-root` and `buildings/Hospital_silent.db -> ~/Downloads/Hospital_silent.db`
  (both in /tmp — rebuild after a reboot). Check policy agreed with red1: no full-length control;
  a 5 s control clip before each big bake + self-checks (flash/blank/errors/escape route).
- **§GI_LIVE (2026-09-23, red1: "i mean the upgrade to Viewer") — SPEC: bounce on Alt+S in the LIVE viewer.**
  bim-ootb#1756 merged + deployed (sw v1232) but the live viewer never loads gi_still.js and ships
  three r185, so live Alt+S has no bounce. Change, one PR, off fresh origin/main:
  1. `viewer/lib/three.core.min.js` + `three.webgpu.min.js` -> official three@0.186.0 minified builds
     (416 KB + 821 KB; export names identical to the tested unminified r186, 635/447), webgpu's
     `./three.core.js` import rewritten to `./three.core.min.js`. `three.module.min.js` (the WebGL
     renderer the app draws with) UNCHANGED — the exact mix every bake and the dev server ran today.
  2. `viewer/gi_still.js` + `viewer/lib/gi/{three.tsl.appbound.js,SSGINode.appbound.js}` — imports made
     RELATIVE (the absolute `/viewer/...`, `/sandbox/...` paths break under Pages' `/bim-ootb/`).
  3. Gate: registers its Alt+S hook ONLY on a desktop (no coarse pointer) with `navigator.gpu` and
     THREE r186; otherwise logs `§GI_STILL_OFF reason=...` and Alt+S stays exactly as today.
  4. viewer.html script tag; sw.js precache the 3 new files + CACHE_VERSION bump.
  TESTS (before PR): (a) fleet — every buildings/ DB loads on OLD (origin/main) vs NEW tree, plain
  static server, same `§CONTRACT_CHECK` counts, no new `§LOAD_FAIL`/pageerror/§UPGRADE_THREE_FAIL;
  (b) Alt+S headless on the NEW tree served plainly (no in-memory swap) at 1666x864: §GI_STILL result
  + ORIENT_GEOM right + app frame unchanged after; (c) gate: headless with WebGPU disabled ->
  §GI_STILL_OFF and the app's own still completes; (d) CI fast checks.
- **§GI_LIVE merged (bim-ootb#1757) + §GI_ORIENT_RATIO (2026-09-23).** Live-site witness (real
  red1oon.github.io, HHS_Office_Federated_extracted from OCI, default view, 1666x864): r186 loaded,
  rows unpadded, still completes — BUT `§GI_STILL_ORIENT_GEOM asRead=0.02% reversed=0.20%` ->
  `colour (geometry UNDECIDED)` and colour picked flip/flip (margin 0.49) = upside-down shading.
  Cause: the decision rule `hi >= 2*lo + 1` carries a 1-POINT absolute floor sized for the indoor poses
  (21-32 vs 0.1-2); at a low-contrast view the signal is a 10x RATIO on ~90,000 samples but under 1
  point. (My first witness also printed PASS on this — it matched /geometry/ inside "geometry
  UNDECIDED"; regex anchored.) SPEC: decide by geometry when `hi >= 3*lo && hi - lo >= 0.1` points.
  REVISED after measuring: the ratio alone is not enough — the same view read 0.02% vs 0.20% then
  0.02% vs 0.09% (mostly camera-facing walls: flipping rows barely changes which surfaces face away).
  FINAL RULE: decisive (`hi >= 3*lo && hi-lo >= 0.1`) -> geometry; undecided -> the last decisive
  answer this session, else the MEASURED platform answer flipTex=false flipOut=false (every decisive
  reading today: 13 runs, 9 poses, 3 servers). Never colour (wrong in every weak case measured).
  RESULT: live view -> "measured platform answer (no flips)"; 4 HHS poses RIGHT; full Alt+S incl.
  injected flip RIGHT (geometry decisive 30.5% vs 0.04%); app frame unchanged after (0.96).
- (superseded) **The film needs one full re-bake on v2** to confirm the four features return. v2 is verified on a
  120-frame test (orientation `same=10.5 flipped=130.4`, clear 12%), not yet on a full 614-frame run.
- The bake's `exposure=1.8` in v1 is gone in v2 by design; if a v2 film reads dark, that is the first
  thing to check, not the last.
- Alt+S on Hospital still pays ~68 s on the first press (5 080 renderables). Inherent: ~13 ms per
  render object, no async door. Later presses are seconds.
- **§S277b is NOT resolved.** This runs on desktop with a real GPU, operator-controlled. red1 has
  said Alt+S is desktop-only by design, which removes the mobile hazard but not the fleet re-test.

## ▶ §WEBGPU_SSGI_SPIKE (2026-09-22) — native TSL bounce-light/AO investigated for Alt+S/Alt+C, weighed against §S277b — supersedes nothing below, read alongside RESUME

### Why this was opened
§RENDER_HONEST_SCORE (this file's own history, `COMPETITIVE_TWINMOTION_HORIZON.md`) rates interior
5/10 vs exterior 8/10 — AO darkens creases but can't add bounced fill light, and the Alt+C film
spends most of its runtime indoors. The prior bounce-light attempt (`§PHOTO_SSGI`,
`effects_gi_poc.js`, third-party `realism-effects` library) was rejected 2026-07-17 by the user's
own live verdict — "not accurate or crisp," plus ghosting/fragility — and defaulted off
(`A._stillSSGIEnabled = false`, still true today). This session checked whether anything changed
since, given a year+ of upstream three.js work.

### What's confirmed, not guessed (isolated worktree `/tmp/wt-ssgi-webgpu-spike`, branch
`spike/ssgi-webgpu`, `sandbox/spike_ssgi_webgpu/` only, nothing committed, 1.8GB of disposable
artifacts, zero shipped files touched)
- **The vendored `realism-effects` library (used by Alt-S/Alt-G's SSGI fold) is dead upstream** —
  last commit 2024-02-03, its `poisson-recursive` branch 2023-09-21. No patch to pull. The "not
  crisp" verdict from 07-17 has no upstream fix available.
- **three.js's own first-party TSL node GI (`SSGINode`+`GTAONode`, `mrdoob/three.js` #31839→#31895,
  Sept 2025→Jun 2026) runs correctly on this app's real geometry** — tested on Clinic (61
  BatchedMesh/9,644 slots + 531 InstancedMesh), Duplex, Hospital: real bounce light (GI luminance
  mean 0.15 in a previously pure-black corridor), 0 NaN, clean normals/velocity on BatchedMesh (the
  exact class of geometry that broke the old library). Needs the r186 core specifically (already
  vendored unused at `viewer/lib/three.webgpu.min.js`, dated Jun 27 — r185 throws a TSL build error
  on these nodes). Per-frame GPU cost measured 1-4ms — cheap, vs. the old N8AO-in-bake estimate of
  ~317ms/frame that ruled GI out of Alt+C entirely.
- **Quality is real but scene-dependent, not a clean win.** A close, low-contrast interior corner
  (Hospital, real cinema-path pose) converged clean — soft AO gradient, no visible grain. A
  high-contrast corridor (Duplex, hard directional sun + dark void) stayed visibly grainy even at
  1000-frame convergence, because `TRAANode`'s temporal blend is a fixed 5%-per-frame EMA
  (~20-frame time constant) — more frames past that plateau, don't help, and one artifact got worse
  at 1000 frames. Same class of finding as before: crispness is not free, contrast-dependent.
- **Camera motion does NOT ghost/flicker — but the first two debugging passes chased a phantom.**
  A 240-frame then 576-frame (full real HHS saved path, see below) moving-camera sequence appeared
  to freeze solid after frame 0 across two sessions of tracing `PassNode`/`SSGINode`/`GTAONode`
  internals. Actual cause, found on the third pass: the SPIKE's OWN camera-framing code computed an
  infinite far-plane for HHS's Batched/InstancedMesh (a bounding-box check that silently no-ops on
  that geometry type) — a one-line bug in our own test harness, not in three.js. Once fixed: the
  real HHS saved path (61.04s, its own `cinema_path` DB table — see below) rendered end to end,
  every beat (dive/walk-out/rise/exterior orbit/pullback) sampled for adjacent-frame ghosting —
  none found. Lesson worth keeping: check your own harness before tracing vendor internals two
  sessions deep.
- **HHS has a real saved/authored cinema path**, `buildings/HHS_Office_Federated_silent.db`'s
  `cinema_path` table (4 `seq` rows = 4 bands of ONE composite path, not alternatives — traced to
  `effects.js:9203` `_cpeLoadFromDb`), total 61.04s — not the generic 24s this whole investigation
  initially assumed from an old default-constant comment. `cinema_maxq.js`'s real bake path also
  defaults to 15fps, not the 24fps used elsewhere in the app — two separate places this session's
  early tests got the wrong constant from stale assumptions instead of reading the real per-building
  data; corrected once found.

### The constraint that actually matters — §S277b, found late, should have been checked first
`docs/internal/CINEMATIC_RENDERING.md`/`ROADMAP.md` record that §S276 (2026-05-24) already tried
WebGPU as the app's PRIMARY renderer and rolled it back to WebGL: compat-mode (WebGPU-on-WebGL2,
transpiling TSL→GLSL) measured 9.2s for 44 materials on a weak iGPU; a software "swiftshader"
adapter must be explicitly detected/rejected or it poisons the canvas and blocks the WebGL fallback;
on this dev machine specifically, Chrome/Dawn's PRIME handling on Linux exposes ONLY swiftshader
natively for native WebGPU — reaching the real NVIDIA adapter needs explicit launch flags or a
system GPU-mode switch; mobile `compileAsync` hangs outright. **This spike never tested or
contradicts any of that** — it only ever ran headless, flag-forced onto the real GPU
(`--enable-unsafe-webgpu --enable-features=Vulkan`), matching `cli_silent_bake.js`'s own existing
`--gpu real` convention for the OPERATOR-controlled bake path, never the live/any-user's-browser
path §S277b is about. That's a materially different scenario, not a refutation — but it means this
spike's clean results say nothing about whether WebGPU is safe for live navigation, only about an
offline, flag-controlled bake process.

### Dual-GPU-context risk — RESOLVED 2026-09-22, it works
The one real architectural unknown above is no longer open. A standalone sandbox harness (not
`cli_silent_bake.js`, no shipped file touched) booted a second, fully independent
`WebGPURenderer`+`SSGINode`/`GTAONode`/`TRAANode` pipeline in the same page as the real app's live
`WebGLRenderer`, on the real GPU (`adapter=nvidia/lovelace`, not SwiftShader). The app's own WebGL
context stayed alive throughout (`contextLost=false`). Drove 4 real poses from HHS's actual saved
path via `window.APP.cinemaPathPlan(61.04, ov).poseAt(t)` at t=0/10/30/61s — all rendered correctly
(t=10s: real interior corridor; t=61s: real exterior aerial orbit). 32-62ms/frame after warmup.

### Open, blocked on a permission gate, not a technical one
The one-function opt-in patch to `cinema_maxq.js`'s `_captureFrame()` (draw from a parallel readback
canvas when `window.__giWebgpuRenderFrame` exists, byte-identical when absent) is scoped but was
refused by the permission system as a shared/production-file edit, even inside the disposable
worktree — correctly requires explicit human sign-off, not an in-thread agent instruction. Separately
found: `cli_silent_bake.js`'s real `--gpu real` launch is missing `--enable-unsafe-webgpu`/
`--enable-features=Vulkan` (confirmed needed on this box) — a second small additive change needed
there too before a real bake could use this path. Nothing in `viewer/` has been changed.

### Verdict
Alt+S (single cost-insensitive still) is the safer candidate — bounce light is real and confirmed,
clean in low-contrast framing, same known noise-in-high-contrast tradeoff as every prior attempt.
Alt+C integration is technically scoped and the motion/ghosting question is answered clean, but sits
behind one untested architectural risk (dual GPU context) and needs to be squared with §S277b's
existing, deliberate WebGPU-deferral reasoning before any shipped file is touched. Nothing in
`viewer/` has been changed by this investigation.

### ✅ ALL 3 QUEUED FOLLOW-ONS CLOSED 2026-08-16+1 — PR bim-ootb#1409 MERGED+LIVE (CI green,
fast-checks+e2e both SUCCESS, confirmed on `origin/main` @ 6a0f89a)
1. ✅ **§MIRROR_TRUE_REFLECT — SHIPPED.** Confirmed case (a) from the costed branch below: Clinic's
   22 `M_Mirror` elements carry `material_rgba` 0.843,0.843,0.843,1.000 — a direct DB query showed
   it's not shared with any other `IfcFlowTerminal` fixture in the building, so streaming.js's
   rgba+class `_matCache` key already makes the mirror material genuinely exclusive. Fix: a
   name-keyword DB lookup (same pattern as `§PHOTO_EMBER`'s `EMBER_WORDS`, cached per building) that
   bypasses `_photoEnvExempt` for mirror-only materials, forces near-zero roughness (0.03 vs the
   metal path's `roughness*0.4`), and lets `_reassertPhotoMatBoost` mark it room-probe-eligible.
   **Live-verified headless on Clinic**: mirror material roughness 0.03, envMapIntensity boosted
   0.05→0.15, `envMap` swapped to the real room-probe capture (not the sky) — while a control
   grab-bar material (same class, different rgba) stayed fully untouched (`_photoBoosted=false`,
   still exempt), proving the fix doesn't leak into other `IfcFlowTerminal` fixtures.
2. ✅ **§TRIPLANAR_MEP_GAPS — SHIPPED.** Added the 4 named classes
   (`IfcFlowController`/`IfcFlowMovingDevice`/`IfcFlowInstrument`/`IfcFlowStorageDevice`) to
   `TRIPLANAR_MAT`'s metal group, **plus `IfcValve`** — a real gap the original diagnosis missed,
   found by cross-checking every `STD_MAT` class with `metal>0.3` (the table's own documented rule)
   against `TRIPLANAR_MAT`'s keys; `IfcValve` had 111 live elements on Terminal and none on any
   triplanar entry, silently falling back to a fake procedural-grain perturbation instead of the
   real photo texture. **Live-verified headless on Terminal** (a different, larger building than
   the original diagnosis): both `IfcValve` and `IfcFlowController` materials now compile with the
   real `uTriNorm` triplanar shader (`§TRIPLANAR_INIT class=IfcValve` / `class=IfcFlowController`
   fired, `onBeforeCompile` contains `uTriNorm`) instead of the flat/fake-grain fallback.
3. ✅ **§EXTERIOR_FLAT_SHADOW — INVESTIGATED, VERDICT = candidate (a), no code change.** Two
   numeric checks settle (a) vs (b):
   - **Shadow-frustum coverage is NOT the gap, on either building tested.** Clinic:
     `outsideFrustum=0` (of 565 casters), `texelPerM=10.3` (~9.7cm/texel). Terminal (much bigger —
     28MB source, ~3x Clinic's element count): `outsideFrustum=0` (of 577 casters),
     `texelPerM=11.3` (~8.9cm/texel), shadow-camera frustum `env=182m` — sized to the FULL building
     envelope by `_enablePhotoShadows()`'s own `_env` computation, not a local/partial box. Both
     buildings: fine resolution, zero geometry clipped from the shadow camera's view.
   - **N8AO is architecturally contact/crease-only, confirmed from its own config, not assumed.**
     `STILL_AO_RADIUS = 32` (`effects.js` — pixels, `screenSpaceRadius` mode) means N8AO can only
     ever sample and darken pixels within 32 SCREEN pixels of a depth discontinuity (a corner,
     crease, or contact point) — this is the fundamental limit of every screen-space AO technique,
     not a bug in this codebase's tuning. A broad, flat exterior wall panel far from any corner has
     no nearby depth-different geometry within that radius, so it legitimately reads AO≈1.0
     (no darkening) — exactly candidate (a)'s prediction from the costed branch below.
   - **Verdict: this is EXPECTED N8AO behaviour, not a fixable gap** — no code change made. If the
     user wants broad-surface darkening away from creases (not contact-AO), that needs a genuinely
     different mechanism (e.g. a stronger sun-vs-fill light ratio so orientation-based N·L falloff
     reads more dramatically, or a distance-based fake ambient-occlusion pass) — named here as a
     possible future ask, not built, since the diagnosed item itself doesn't call for it.
   - Witness scripts (this session, not committed): scratchpad `witness_mirror_true_reflect.js`,
     `witness_triplanar_mep_gaps.js`, `witness_exterior_flat_shadow.js` — headless Chrome 147 needs
     `--use-angle=swiftshader --enable-unsafe-swiftshader` (not the older `--use-gl=swiftshader`,
     which now fails WebGL context creation outright — "GL_VENDOR = Disabled" — worth recording,
     cost real time this session). Terminal specifically needs its split trio symlinked
     (`Terminal_meta.db`/`_geo.db`/`_positions.bin`, not just `_extracted.db`) — the split-detect
     logic hangs (guidMap stays 0 indefinitely, no console error) if only the combined DB is present
     but a stale split reference still gets probed.

### ✅ Follow-on session same day (2026-08-16+1, cont.) — sw.js cache bump + mirror metalness,
user-tested live, WRAPPED
- **PR #1409 shipped but never went live — root cause found+fixed, PR bim-ootb#1411 MERGED+LIVE.**
  #1409 touched only `effects.js`/`streaming.js` and never bumped `sw.js` `CACHE_VERSION`, so
  browsers with an existing install kept serving the pre-#1409 bundle (documented bug class —
  `feedback_sw_version.md`: "zero §-tags appear in logs" — exactly what happened, user's live
  console showed zero `§MIRROR_TRUE_REFLECT` output despite a full Alt+S cycle completing). Fix:
  `CACHE_VERSION` v1052→v1053, `viewer.html` `effects.js?v=24`/`streaming.js?v=63`. Confirmed live
  via `curl` against the served `sw.js`/`viewer.html` post-deploy.
- **§MIRROR_TRUE_REFLECT_METALNESS — real second bug, PR bim-ootb#1415 MERGED+LIVE (bundled its
  own sw.js bump this time — v1053→v1054 — same PR, learned from the miss above).** User re-tested
  after the cache fix and reported "still not reflection in mirror." #1409's roughness-only fix
  left `metalness` at `STD_MAT.IfcFlowTerminal`'s 0.30 — `MeshStandardMaterial`'s diffuse/specular
  split is driven by metalness, not roughness, so at 0.30 the shader still blended ~70% diffuse
  albedo into the output; even a sharp, boosted envMap reflection read as a faint sheen, not a
  mirror image. Fix: force `metalness=0.95` for mirror materials specifically (same `isMirror`
  exclusivity gate), save/restore on teardown. Live-verified headless on Clinic: metalness
  0.30→0.95 confirmed, `_photoOrigMetalness` saved for restore. **User-confirmed live**: mirror now
  visibly reflects via Alt+S (user initially thought it worked without Alt+S — corrected: "it is
  from alt-s that the mirror effect comes about").
- **Two follow-on mirror-quality observations, understood not urgent, not built:** (1) "still
  metallic" — the room-probe capture is only 128×128 (`§MIRROR_ROOM_PROBE ... size=128`), too
  low-res for a crisp mirror image, reads as a soft/grainy metal sheen instead; a real fix needs a
  higher-res probe and/or a lower-metalness glass-mirror-tuned look instead of the metal path. (2)
  "reflects what is outside the room too" — expected, not new: the probe is ONE fixed capture
  point for the WHOLE building (the existing "35% up from lowest point" pivot heuristic from
  #1407), not per-room/per-mirror — if that one point has line-of-sight to a window, every mirror
  in the building shows it. Real fix = per-mirror local probe (expensive) or a smarter per-room
  probe placement — this is literally the original "§MIRROR_TRUE_REFLECT — real per-mirror
  reflection" ask from the very first costed branch below, items 1 (metalness/roughness) only
  partially closes it. Named here for a future session, not costed yet.
- **§EXTERIOR_FLAT_SHADOW revisited — user pushed back with a real physics question ("will it be
  darker on wall away from the Sun? ... I don't see that is so"), leading to a SEPARATE, more
  severe finding than the AO-contact verdict above:** a rigorous live A/B (same scene, only
  `A.sun.castShadow` toggled true/false, raw render, two ground points symmetric around the
  building) showed **byte-identical pixels** — the ground gets ZERO contribution from the sun's
  real directional shadow, confirmed on Clinic in plain-nav Shadow mode ('h'). A guaranteed solid
  occluder box placed directly overhead a sample point only moved luminance by 0.7/255 (consistent
  with SSAO's small contact-only darkening, not a real cast shadow). Ruled out `§GROUND_DETAIL`'s
  `onBeforeCompile` ground shader patch as the cause (stripping it entirely made zero difference to
  the same test). Ruled out frustum coverage (already proven clean above). Live THREE.js revision
  confirmed **r185** (a stale log label elsewhere claims r184 — not proven as the cause, just an
  inconsistency worth another look). **⛔ USER RE-TESTED LIVE AND COULD NOT REPRODUCE — "ground
  shadow gone away. False alarm or there is a mem race conflict."** Per this same file's own
  `§GROUND_RECT_ARTIFACT` precedent (closed the same way earlier today), the user's live call
  wins — not chased further, no code changed. The headless A/B evidence above is real and
  reproducible in THAT run, so if this resurfaces, re-run `witness_ground_shadow3.js`/
  `witness_ground_shadow_bisect.js` (scratchpad `7d2a0b3a-.../scratchpad/`, not committed) as a
  starting point rather than re-deriving from scratch — but do not assume it's still broken without
  a fresh live check first.
- **§TRIPLANAR_MEP_GAPS user-confirmed live, unprompted positive**: "now even piping is smooth
  metallic and no longer jagged." Some pipes still read jagged per the user — expected, not a new
  bug: only the classes actually added to `TRIPLANAR_MAT` today (IfcValve/IfcFlowController/etc.)
  got the real texture: any remaining jagged pipe is a class not yet in that table, not a
  regression in what shipped.
- **Lane closed by explicit user instruction ("wrap up and close") — next session picks up
  `prompts/CPE_4D_PERF_MEM_STUDY.md` ("the mem hog prompt"), not this file.**

### ⛔ OPEN TASKS FOR NEXT SESSION (2026-08-16 closeout, 3 items — costed, not started) — CLOSED
above, kept for the original cost/diagnosis reasoning
1. **§MIRROR_TRUE_REFLECT — real per-mirror reflection.** Corrected root cause (supersedes the
   "batched elements bypass `A._matCache`" theory in the §MIRROR_ROOM_PROBE section below, which
   was wrong — traced further, `A._getMaterial()` runs uniformly across batched/instanced/merged
   paths and DOES populate `_matCache` for all of them). The REAL reason Clinic's real
   `IfcFlowTerminal "M_Mirror"` elements get nothing: `STD_MAT.IfcFlowTerminal` carries
   `envInt: 0.05` (`viewer/streaming.js` ~line 421) — the SAME fixed-low-reflection override
   applied to pipes/ducts by §HOSPITAL_BLUE_TINT/§PIPE_DUCT_BLUE_TINT to kill a blue-sky-tint bug.
   That sets `mat.userData._photoEnvExempt = true`, which is `_reassertPhotoMatBoost`'s very FIRST
   early-return guard — skips envMapIntensity boost, roughness scale, AND the room-probe
   eligibility flag entirely, for the whole class, mirrors swept up in a fix meant for pipes.
   **Cost, not yet determined which case applies (check first, ~15-30 min, same methodology as
   the already-documented §PHOTO_EMBER_EXCLUSIVE lesson):** if the mirror's real IFC colour
   already lands it in its OWN exclusive `_matCache` key (not shared with other `IfcFlowTerminal`
   fixtures like diffusers/grilles) — **~1-2h**: exclude mirror-named elements from the exemption
   (name-keyword query, same proven vocabulary pattern as `§PHOTO_EMBER`'s `EMBER_WORDS`), force
   near-zero roughness + the room-probe texture, verify live. If the material IS shared with
   other non-mirror fixtures — **~2-3h**: needs a per-element material split/clone for just the
   mirror sub-set (can't touch the shared key without boosting the fixtures sharing it too).
2. **§TRIPLANAR_MEP_GAPS — texture-grain amplifier reads "selective" on piping.** User: "i notice
   it replaces selectively in some piping but not exactly similar next to it." Found via code
   read (NOT yet visually confirmed against the user's actual observation — do that first):
   `TRIPLANAR_MAT` (`viewer/streaming.js` ~line 518) covers `IfcPipeSegment/Fitting`,
   `IfcDuctSegment/Fitting`, `IfcCableCarrier*`, and the generic-MEP `IfcFlowSegment/Fitting/
   Terminal` — but NOT `IfcFlowController`, `IfcFlowMovingDevice`, `IfcFlowInstrument`,
   `IfcFlowStorageDevice` (valves, dampers, pumps, gauges) — real MEP runs mix these in among
   segments/fittings, so an uncovered fitting sitting between two textured pipe segments on the
   SAME run would render flat/plain right next to heavily-streaked neighbours — exactly the
   symptom described. **Cost: ~30-45 min** — add the missing classes to `TRIPLANAR_MAT`'s metal
   group (a few lines, same convention as the existing entries), verify live that they pick up
   the grain and the "selective" look is gone.
3. **§EXTERIOR_FLAT_SHADOW — surfaces away from any wall don't darken.** User: "the surface of
   building away from wall does not get darker shadow effect." NOT INVESTIGATED yet — two
   candidate readings, need a live check to tell which: (a) N8AO by design only darkens contact/
   crease areas (near-adjacent geometry) — a broad open exterior wall far from any corner
   legitimately stays bright under AO, nothing to occlude against, this would be EXPECTED
   behaviour, not a bug; (b) real self-shadowing (the sun's own shadow map, `A.sun.shadow`) isn't
   reaching/covering distant exterior surfaces — a real gap, possibly a frustum-coverage issue
   (this file already has instrumentation for exactly this — `§PHOTO_SHADOW_FRUSTUM_COVERAGE`
   logs an `outsideFrustum` count; check it on the building/surface in question). Cost not
   estimated — investigation first (~20-30 min to tell (a) from (b) live), then cost depends on
   which.

### ✅ §MIRROR_ROOM_PROBE — SHIPPED 2026-08-16, PR bim-ootb#1407 (auto-merge armed)
User: "what does it take for mirrors to truly reflect... try the single room-representative probe
first" (asked after diagnosing a "jagged pipe surface" + "whitewashed" scene — see the
`§TRIPLANAR_CONTRAST`/`PHOTO_ENVMAP_BOOST=3.0` diagnosis in this session's chat, not yet acted on
below). Every glossy/metal material only ever reflected the static sky/HDRI env map — no local
scene reflection existed anywhere. Shipped: one `CubeCamera` capture at a representative interior
point (reuses `_cinemaPathPlan`'s own "35% up from the lowest point" pivot heuristic), used as
`envMap` for the existing `isGlossy` material set instead of the sky. Verified live on Clinic
(17,279 elements, real building the user was looking at — its console log is in this session's
chat): probe builds, ≥1 glossy material picks up the room-probe texture.
**A per-element "real mirror" boost was attempted and DROPPED, not shipped**: Clinic's real
`IfcFlowTerminal "M_Mirror:Mirror 600mm x 900mm"` elements (22 of them, user pasted a live pick
of one) render via the BATCHED mesh path — confirmed from the user's own console log
(`§BATCHED_PICK batchId=2`) — and `A._matCache` (what this whole boost/envmap system reads) only
covers instanced/merged-tracked elements. A batched element's material never gets a
`color|class|discipline` key in `_matCache` at all, so a per-element mirror boost has nothing to
attach to regardless of how the guid lookup is written (traced through `A.guidMap` →
`_batchMeta`/`_instanceGuids`/`findMeshByGuid` — batched elements use a SEPARATE identity system).
Fixing that needs a batched-mesh-aware boost path — a bigger, separate task, named here not built.
**RETRACTED 2026-09-21 — "Terminal has ZERO `_matCache` entries" was wrong, re-checked live.** A
fresh headless probe (`probe_matcache_dlod.js`, puppeteer/swiftshader, full 48,428/48,428 elements
streamed) found `_matCache` populated normally: 92 entries before AND after Alt+S, 14 materials get
the envmap boost, `§MIRROR_ROOM_PROBE` builds, `§TRIPLANAR_PERF materials=60` fires. A Clinic control
run (54 entries, populated) confirms the probe method itself was sound. The DLOD-bypass theory was
never possible in the first place: `A._useDlodPath` is hardwired `false` at both stream-queue paths
(`viewer/streaming.js:397,452`, §S262) since the 2026-05-23 initial-migration commit — i.e. already
false when this paragraph was written on 2026-08-16. Why that day's probe read zero is not
reconstructible from current code; treat it as a probe/timing artifact from that session, not a real
defect. Alt+S's material-boost/triplanar/envmap/room-probe layer is confirmed live on large
buildings — no dedicated session needed here. (The batched-mesh mirror gap two paragraphs up is
unaffected by this retraction — still real, still unfixed.)
**Real bug found+fixed in the same pass**: dispose+rebuild every Alt+S cycle leaked +1
texture/cycle, compounding (measured C1/C2/C3 exit deltas: 25, 1, 1 — same bug CLASS as
§ALTS_MEM_HOG above, found via the identical bisection discipline). A bare isolated
build+dispose loop OUTSIDE the real staging pipeline did NOT reproduce it — leak was specific to
disposing the RT while real materials still referenced its texture (most likely a stray render
between reset-envmap and dispose triggers a phantom re-upload three.js then never tracks). Fixed:
build the probe ONCE, keep it alive, reuse across cycles (only disposed on a real building
switch) — same "created once, reused" discipline this file already uses for `A._camLight`.
Re-verified: 3 full cycles, texture/geometry/program counts flat every exit.
**Still open, not yet started**: the "jagged pipe" / "whitewashed" diagnosis from earlier this
session — `contrastBoost=1.9` (metal group, highest of 3) at `tileMeters=0.6` (finest tile) is the
likely source of the pipe's "jagged" streak read (texture-space contrast, not geometric aliasing
— TAA correctly doesn't touch it); `PHOTO_ENVMAP_BOOST=3.0` (glossy envMapIntensity multiplier,
tuned pre-§TRINORM_LINEAR when metal read near-black) is the likely "whitewash" source now that
metal's real darkness bug is already fixed. User said "try the room probe first" — this ships
that; the contrastBoost/envMapBoost retune is the natural next step if the room probe alone isn't
enough (not yet judged live).

### ✅ ALL 3 ITEMS CLOSED 2026-08-16 (were: OPEN TASKS from the prior closeout) — see PR links in each
1. ✅ **§GROUND_RECT_ARTIFACT — CLOSED 2026-08-16, user: "the rect shadow cloud is gone. False
   alarm."** Original report: "alt-s seems to have a large rect cloud cover over it," suspected as
   a §GROUND_DETAIL (#1388) regression from the paved normal map's 780m tile (rectangular slab
   joints amplified through lighting) and/or the 90m `floor()`-cell blotch (both real, hard-edged
   mechanisms — confirmed mathematically mid-investigation, a `floor()`-quantized per-cell hash is
   piecewise-constant with discontinuities at every cell boundary by construction) — but the user's
   live browser no longer showed it and called it a false alarm before the attribution rig
   finished. A GLSL smoothing fix for both mechanisms was drafted and verified working but NOT
   shipped (dropped per user's false-alarm call — avoid unsolicited scope creep on a
   no-longer-reported symptom). **Redirected instead, same session: §GROUND_EARTH_DEFAULT — PR
   bim-ootb#1393 (auto-merge armed).** User: "more realistic even surface feel" — switches
   `_applyPhotoStaging()`'s Alt+S/Alt+C bake ground texture from 'paved' (concrete_floor_01, the
   texture carrying the rectangular joint pattern above) back to 'earth' (no such structure), and
   reorders the Shadow-mode toggle cycle (`_SG_CYCLE` in tools.js) so 'earth' is the first real
   choice instead of 'grass'. §GROUND_ALBEDO's existing gain calibration carries over unchanged —
   earth's measured mean (0.1599) is within 3% of paved's (0.155). Verified headless (Duplex, cold
   cache): first `toggleShadow()` press → `_shadowGroundKey='earth'`; Alt+S staging's real
   `§GROUND_MAP key=earth` log confirms both nor/rough maps loaded.
2. ✅ **§LTU_SUBSURFACE_BBOX in Alt+C — WITNESSED 2026-08-16, live plan build confirmed working,
   no dive.** Triggered the REAL Alt+C entry point (`A.cinemaPathPlan(24)`, the same function
   `cinema_maxq.js` calls — not a synthetic stand-in) headless on `LTU_AHouse_extracted.db`
   (125,698 elements; only the DB needs to be open for this — `_buildingBBoxArc()`/
   `_cinemaPathPlan()` read `A.dbQuery`, not streamed THREE.js mesh, so no need to wait out the
   many-minutes full mesh stream). Confirmed exactly as predicted:
   `§CINEMA_BBOX_FENCE excluded=13/9712 rawZ=[-45.55,16.31] fencedZ=[-3.19,16.31]
   fence=[-3.78,18.89]` fires during PLAN build — the fence throws out real subsurface junk
   (raw Z min -45.55 → fenced -3.19). `A._cinemaPathEdit` confirmed empty (no saved/authored
   waypoints for LTU — the named "predates the fix" suspect doesn't apply here, ruled out
   directly rather than inferred). **Pivot Y**: a fresh headless page's `A.controls.target`
   defaults to the origin, which happens to pass `_cinemaPathPlan`'s "plausible" proximity check
   for LTU's geometry and wins the pivot over the arc-bbox centre — not a bug, just means a
   fresh-load probe doesn't exercise that branch by default. Forcing it (parking
   `controls.target` on the camera's own nose, exactly the "replanted target" failure case
   `§CINEMA_PIVOT`'s own guard is written to reject) gives `pivotSrc=arc-bbox-centre
   pivot=(6.3,-4.1,87.8)` — **not** the pre-fix −24 dive, but also not the session's own +3.6m
   estimate; the ~7.7m gap is `A.ifc2three()`'s per-building Z-datum offset (the +3.6 estimate
   was raw-IFC-Z arithmetic, before that offset applies — real building-specific calibration, not
   an error in the estimate's logic). The `§CINEMA_DIVE` settle point in both plan variants
   (`settle.y=-9.2`, `floorY=-10.94`) sits just above the real floor, consistent with a working,
   non-diving plan. **Verdict: the bbox fence works, LTU does not dive underground on a real Alt+C
   plan build.** Not chased further: whether `ifc2three`'s Y-offset for LTU specifically should
   itself read closer to the +3.6 estimate — low priority since the practical symptom (diving to
   −24) is gone. Witness script: scratchpad `probe_ltu_bbox_fence.js` / `_fence2.js` (this
   session, not committed).
3. ✅ **§ALTS_MEM_HOG — DONE (witness) 2026-08-16, PR bim-ootb#1391 (auto-merge armed).** Root
   cause found and fixed: `_teardownPhotoStaging()` called `_showPhotoProps(false)`, which only
   sets `.visible=false` on `_photoUplights`/`_photoSkyline`/`_photoSkylineLights` and does
   nothing at all for `_photoSparkles` (they froze at whatever visibility the last accumulation
   frame's sun-glint test left them — a live "sprite left glowing after Alt+S exit" bug). None of
   it disposed GPU resources — the whole photo-prop tree (~30 PointLights, 40 skyline-box meshes,
   1 window-sparkle Points cloud, ~24 glint sprites) stayed allocated after every REAL Alt+S exit,
   only ever freed later by a building switch (`_showPhotoProps(true)`'s own rebuild guard).
   Headless-measured on `HHS_Office_Federated` (Hospital's 63,917-element stream alone exceeded
   300s under this sandbox's swiftshader-only headless Chromium — no real GPU here, same caveat
   `VIEWER_MEMORY_LEAK.md` already documents; the LEAK MECHANISM is building-size-independent, only
   the absolute heapMB magnitude doesn't transfer): before fix, `startStillRefine()` →
   `stopStillRefine(true,false)` left textures 225/225, geometries 417→380, programs 49→44,
   sceneChildren 633→388 — **42 scene objects never freed** vs the pre-staging baseline. After fix:
   0 leftover objects, geometries/programs fall all the way back to the 364/12 baseline. Ran 2 full
   Alt+S on/off cycles back-to-back post-fix: cycle-2-exit vs cycle-1-exit delta = 0 on every
   counter — confirms no per-cycle growth (the one remaining one-time +22 textures/+32 programs on
   cycle 1 only is legitimate singleton-cached lazy-init — HDRI PMREM env map, N8AO scratch render
   target — not a leak). Fix: `_teardownPhotoStaging()` now calls `_disposePhotoProps()` (the same
   function the building-switch path already used) instead of the hide-only path. Probe scripts:
   scratchpad `probe_alts_mem_hog.js` / `probe_alts_mem_hog_2cycle.js` (this session,
   `aa515841-…` scratchpad — not committed, throwaway).

### ✅ §TRINORM_LINEAR — 2026-08-16 (8th session): BOTH open Alt+S bugs SOLVED, one mechanism — PR #1383 MERGED + LIVE (fetched back from production: streaming.js carries 4.8763, sw v1037)
**§ONGOING_TINT (bluish/darkish piping) and §RED_GREY_MYSTERY (red valve → literal black) were the
same bug, and it was NOT degenerate normals, NOT a stale shader program, NOT data:** every
triplanar `normFactorRGB` (and the scalar before it) was derived from the JPG's **sRGB byte
means**, but the shader multiply runs in **linear** light (textures are `SRGBColorSpace` —
GPU-decoded before `texture2D` returns). Under-normalized 2.0–2.4×, so the "centred at 1.0"
product actually centred at 0.42–0.53, and the contrast line `(x-1.0)*boost+1.0` clamps every
texel below `1-1/boost` to **literal zero**:
- metal (boost 1.9): 41.4% of texels → multiply-by-0 → the valve's pure-black pixels (719/1681
  grid samples); surviving mean multiply `[0.000, 0.011, 0.071]` — blue-dominant near-black =
  "bluish tint … greyer piping gets similar dark treatment" verbatim. Applies to ALL metal
  classes (Beam/Member/Plate/Railing/Pipe*/Duct*/CableCarrier*/Flow*), which is why it was
  widespread, colour-independent, and Alt+S-only (`uTriActive` gates staging).
- concrete/plaster: uniform ×0.467 / ×0.53 multiply — the systemic "Alt+S too dark" backdrop.
**Fix (PR #1383, branch `fix/trinorm-linear-space`, streaming.js?v=62, sw v1037):**
`normFactorRGB` = inverse LINEAR mean — concrete 2.0755, plaster [1.9428, 1.9262, 2.0172],
metal [4.8763, 4.0250, 3.3988]. Multiply centres at 1.000/channel, 0.00% texels clamp to zero,
contrastBoost unchanged. Witness: isolated valve, raw single-frame render, black 719→**0**,
meanRGB [119,79,66] vs triplanar-off reference [117,80,66] (brightness restored, only grain
remains). Offline texture-histogram + live uniform-variant probes in scratchpad
`aa515841-…/scratchpad/` (`probe_noop_recompile.js`, `probe_stale_uniform_diff.js`,
`probe_contrast_crush_confirm.js`, `witness_trinorm_fix.js`, `*.log`). Scene-wide A/B at the
default far view (raw render, 16k-sample grid): black 22→1, meanLum 124→126 — no regression,
the big deltas are close-up on metal surfaces as expected.
**How the prior sessions' probes all lied — two traps, record permanently:**
1. **Every shader-checkpoint probe REPLACED `mat.onBeforeCompile`** — which is where the
   triplanar patch lives — so every "clean" checkpoint was testing a triplanar-stripped shader.
   The "unresolved contradiction" (all stages clean, full shader black) was exactly this. Never
   assign `onBeforeCompile` on a material that already has one without composing the original.
2. **The `uTriActive=0` rule-out was silently undone** by the material's own per-frame
   `onBeforeRender` self-heal (re-asserts from `A._stillRefineActive` — §TRIPLANAR_RECOMPILE_FIX).
   Toggle `A._stillRefineActive` itself, or the toggle never survives to the render.
**Consequences for earlier verdicts:** the §RED_GREY_MYSTERY "root cause = degenerate vertex
normals" verdict below is **SUPERSEDED — wrong**. The 24 zero-magnitude normals are a real data
quirk but sit on zero-area triangles (rasterize nothing) — consistent with the repair changing
zero pixels. `A._repairDegenerateNormals` stays disabled; no longer a suspect for anything
user-visible. The earlier `length(normal)` "NaN spread" reading was a probe artifact (curved-mesh
interpolated `vNormal` length, not NaN).
**Still open after this:** (a) user visual confirm of Alt+S on live once #1383 deploys — expect
visibly brighter triplanar surfaces (metal especially); AO/exposure tunings were calibrated
against the crushed baseline and may want a revisit — user's call; (b) §SKY_SYNC_REGRESSION
(sky-dome sun-disc vs shadow direction mismatch, revert #1381) still open, separate;
(c) §HOSPITAL_META_DB_STALE regenerated split DBs still awaiting explicit user go to upload.
**(b) and (c) both CLOSED later the same day — see §SKY_SUNPOS_INIT and §HOSPITAL_DATA_SHIPPED
below.**

### ✅ §SKY_SUNPOS_INIT — 2026-08-16 (same session, cont.): black-sky-on-Alt+S SOLVED — PR #1384 MERGED + LIVE
User re-reported "sky is black again" after #1383 went live. Root cause found by code read +
live repro, NOT the #1380 uniform-copy mistake: `scene.js updateSky()` gated its `sunPosition`
uniform copy on `_sky.visible`, the init-time `updateSky(45,180)` runs while the sky is hidden
(so the Sky shader kept its stock `(0,0,0)` sun vector), and since #1379 the non-dusk Alt+S
shows the sky WITHOUT calling `updateSky` → first Alt+S of a fresh session = Preetham with a
zero sun = fully black sky. **Live-reproduced numerically** (sky band 192/192 black px, uniform
read back `[0,0,0]`) and **the #1381 equivalence question is answered**:
`normalize(A.sun.position)` equals the `setFromSphericalCoords` direction to 1e-16 (sun.position
is a pure direction ×5000, no offset/parent transform). Fix: uniform copy now unconditional
(scene.js?v=56, sw v1038) — a uniform write on a hidden object is free, so `visible = true` is
safe from any caller. Witness on fixed code: sky band 0/192 black, meanRGB [178,211,236].
§SKY_SYNC_REGRESSION's "mismatch still open" thread is thereby CLOSED for the fresh-load case —
the "stale sun-disc vs shadow" report was this same uninitialized/stale uniform.

### ✅ Same-day follow-ons (2026-08-16, all user-GO'd, all MERGED): #1386 §LTU_SUBSURFACE_BBOX (movie path no longer dives underground — full record in CINEMA_PATH_EDITOR.md), #1388 §GROUND_DETAIL (ground nor/rough maps + linear-mean-normalized detail multiply + anti-tiling blotch — user ask "ground surface material… not that realistic"), #1389 §STAGED_PL_CUT (night PLs halved during staging only, restores slab shadow play in bakes — full record in NIGHT_AND_FIXTURE_LIGHTING.md)

### ✅ §HOSPITAL_DATA_SHIPPED — 2026-08-16 (same session): stale split DEPLOYED to OCI + self-heal patch for cached users — DONE, VERIFIED
User asked "so the meta dbs can be uploaded whole to OCI? LTU, Terminal too?" — answered + done:
- **Hospital**: regenerated split (meta 23.3MB/geo 239MB/positions 1.5MB from `/tmp/split_test`)
  uploaded to the `bim-ootb` bucket `buildings/` prefix. ⚠ **Bucket convention discovered: DB
  objects are gzip-compressed with `content-encoding: gzip`** (old objects all were; a first raw
  upload was redone gzipped). All 3 fetch-back verified: decompressed md5 == local raw md5.
  Staleness re-confirmed on the actual served bytes first (old: IfcBeam 0/1970,
  IfcPipeSegment 0/14452 etc.; new: 100%).
- **LTU/Terminal need nothing**: LTU's split on the bucket is fresh (re-uploaded 2026-08-10);
  Terminal audited fine 2026-08-15 (split newer than source).
- **Cached users** (cachedFetch serves IDB blobs with NO revalidation — an OCI re-upload alone
  never reaches them): colour backfill appended to `buildings/patches/Hospital_meta.db.sql`
  (+ `viewer/buildings/patches/` mirror), shipped through `scripts/oci_patch_gate.js`
  (PASS → UPLOAD_VERIFIED, verifier committed, manifest committed) — PR #1385 MERGED. One
  guarded UPDATE: every previously-uncoloured element in 23 classes gets the single value the
  new extraction assigned them all (`0.920,0.900,0.850,1.000` — one DISTINCT value, checked);
  empty-rows-only guard = no-op on the new DB, never touches the 233 aggregate ghosts.

**§RED_GREY_MYSTERY — 2026-08-15/16 (7th session, updated, session closed — handed to a fresh
Fable session next.) ⚠ Historical record — its "GENUINELY STILL UNSOLVED" item and
degenerate-normal verdict are resolved/superseded by §TRINORM_LINEAR above.**

### Shipped this session — MERGED to `main`, LIVE on production (`red1oon.github.io/bim-ootb`)
PR #1379 (TAA fix + sun separation), #1380 (follow-up same day — point-light restore, see below),
#1381 (revert — see §SKY_SYNC_REGRESSION below). All merged, all live.
1. **§STILL_REFINE_JITTER_MISMATCH — TAA smoothing was silently half-broken, now fixed and live.**
   `viewer/lib/TAARenderPass.js` used a 32-entry jitter table while the still-refine loop only ran
   16 accumulate frames — a "converged" still was a 50/50 blend of 16 real jittered samples + 1
   plain unjittered hold-frame. Fixed: matching 16-entry table, zero extra cost.
2. **§PHOTO_SUN_SEPARATION — Alt+S no longer force-overrides the sun position, now live.** Was:
   unconditional reset to a fixed 6°-elevation dusk + reddish sky drama + forced night-mode amber
   glow, every press, regardless of real time-of-day. Now: sun position/sky-drama/warm-tint default
   OFF (plain daylight); old package still reachable via `APP._photoDuskMood = true` for A/B,
   not deleted. Alt+C's movie noon→dusk sun arc is a fully separate code path — confirmed
   untouched, never touch `PHOTO_SUN_ELEVATION`/`_AZIMUTH` constants themselves, only the call site.
3. **Point-light fixture illumination restored (PR #1380), now live.** Removing the whole
   night-mode force-toggle (item 2) also silently removed ~200 supplementary point lights it loads
   as a side effect — REAL illumination, not mood; beam/railing (`envInt:0` by an earlier,
   unrelated fix, so zero sky-reflection by design) leaned on them for visible sheen and went
   flat/dark without them. Fixed: night-mode's point-light toggle now fires UNCONDITIONALLY every
   Alt+S (and its intensity/exposure override, which just restores the real pre-toggle daytime
   values — not mood either); ONLY the warm-tint COLOUR override stays dusk-mood-gated.
4. **§SKY_SYNC_REGRESSION — shipped broken, reverted same session, DO NOT retry blind.** Attempted
   to fix a real sky/shadow-direction mismatch (sky dome showing a stale sun-disc position vs
   where shadows actually fall) by copying `A.sun.position` (normalized) into the Sky shader's
   `sunPosition` uniform whenever the sky is made visible. **Shipped without live verification —
   broke the sky entirely (rendered fully black in production), because this app's reflections are
   sampled FROM the sky as the env map, so it also killed reflections everywhere, not just on the
   originally-reported element.** Reverted (PR #1381) back to the known-good
   `if (A._sky) { A._sky.visible = true; }` only. **The mismatch is still real and still open** —
   re-derive the fix properly next time: `scene.js`'s own `updateSky()` builds the sky uniform via
   `setFromSphericalCoords(1, phi, theta)`, NOT by normalizing `A.sun.position` — check whether
   `A.sun.position` carries anything beyond a pure direction (offset, non-uniform scale via a
   parent transform, etc.) before assuming `.normalize()` is equivalent, and test live (screenshot
   or — per this project's own rule — better yet a numeric colour/luminance read of the sky
   pixels) BEFORE merging, not after a user reports it broken.
5. **§ONGOING_TINT — user's last observation this session, NOT resolved. IS a rendering bug, not
   a data/colour issue. §HOSPITAL_META_DB_STALE is NOT the cause of this — settled, don't
   re-litigate it here.** §HOSPITAL_META_DB_STALE (further below in this file) is a real, separate,
   smaller, already-scoped issue about MISSING colour data — it is unrelated to this symptom and
   was already proposed and rejected once this session as an explanation; do not re-propose it for
   §ONGOING_TINT without genuinely new evidence. After all 4 fixes above: "bluish tint still there
   though darker, but the greyer piping gets similar dark treatment. Thus it is just replacing the
   too bluish with another similar set of too darkish." **A grey element going BLACK is not
   explained by any colour-data gap — grey is a legitimate, valid RGB value; something in
   RENDERING has to actively zero it out.** That is the exact same failure shape as
   §RED_GREY_MYSTERY's already-found root cause on the one red valve (degenerate/zero-length
   vertex normals → `normalize(vec3(0))` → NaN → literal `[0,0,0]`, independent of the element's
   real base colour — proven on THAT element by the diffuseColor probe reading 100% healthy while
   the final pixel was still black). **This session's disabled normal-repair scan already measured
   how widespread the same raw defect is across this ONE building, unprompted by this specific
   complaint** — worth re-reading directly: `meshesScanned=4368 meshesAffected=1552
   degenTotal=72077` (from the `§NORMAL_REPAIR` log line, `A._repairDegenerateNormals` in
   `streaming.js`, currently commented out at its call site). 1,552 of 4,368 meshes in Hospital
   carry at least one degenerate normal — more than a third. That is a very plausible explanation
   for "greyer piping gets similar dark treatment" being a WIDESPREAD pattern, not one isolated
   valve. **Next session: do NOT chase a data/DB theory for this — pick up exactly where
   §GENUINELY STILL UNSOLVED (below) left off** on the one confirmed element, since the repair
   itself was verified to change ZERO rendered pixels there (the real mechanism is still not
   found, only the data-level symptom), then check whether the SAME "recompile clears it" lead
   generalizes to grey piping elements too.
1. **§STILL_REFINE_JITTER_MISMATCH — TAA smoothing was silently half-broken, now fixed.**
   `viewer/lib/TAARenderPass.js:35` used a 32-entry jitter table (`_JitterVectors[5]`) while
   `effects.js`'s still-refine loop only ever ran 16 accumulate frames — a "converged" still was
   actually a 50/50 blend of (16 real jittered samples) + (1 plain unjittered hold-frame), which is
   why edges looked jagged on EVERY object, not just the broken one. Fixed: switched to the
   matching 16-entry table (`_JitterVectors[4]`), zero extra render cost. Verified:
   `taaAccumulateIndex=16` converges cleanly.
2. **§PHOTO_SUN_SEPARATION — Alt+S no longer force-overrides the sun.** User: "Sun should be a
   separation of concern" + "too dark contrasting unrealistic ... too cartoonish." Alt+S used to
   unconditionally reset the sun to a fixed 6°-elevation dusk (`PHOTO_SUN_ELEVATION`/`_AZIMUTH`,
   still used by the Alt+C movie sun-arc — untouched), boost the sky toward reddish drama
   (turbidity/rayleigh/mie), and force night-mode's amber glow on — all regardless of whatever real
   time-of-day was already active. **New default: none of that happens** — sun/sky/night-mode stay
   exactly as they already are (plain daylight, if that's what's active). **Old behavior still
   reachable, not deleted** — user explicitly asked to compare, not lose it: set
   `APP._photoDuskMood = true` before pressing Alt+S to get the full old dusk package back
   (sun position + sky drama + night-glow + warm-evening tint), leave unset/false for the new
   default. Verified live both ways (sun position unchanged by default, forced-different with the
   flag, shadows confirmed still enabled+casting either way — user's explicit "don't break that").

### GENUINELY STILL UNSOLVED — next session starts HERE, do not re-derive from scratch
**A real element (Hospital `IfcValve` guid `0HuLVU0hf5gxwY8y9yDvc0`, isolated with zero possible
neighbour occlusion — including same-BatchedMesh slots via `setVisibleAt`, not just other meshes)
still renders literal `[0,0,0]` on ~43% of its own pixels under Alt+S.** This session ruled out,
by direct raw-single-frame-render test (NOT the TAA-accumulated composite, which was found to mask
real differences — always test with `A.renderer.render(A.scene, A.camera)` directly, never
`A._composer.render()` for a differential "does toggling X change anything" test):
- AO, shadow-restore blend, sun shadow map (incl. bias), triplanar, env reflection, batch-neighbour
  occlusion, backface culling (`mat.side` is already `DoubleSide`), vertex colours (none exist on
  this material — no `color` attribute at all), material maps (none — no map/aoMap/alphaMap/
  normalMap/roughnessMap/metalnessMap), opacity/alphaTest/transparency (all default/off).
- **Geometry-data normals**: found 24 genuinely zero-magnitude vertex normals on this element's own
  mesh (raw CPU-side buffer read, real in-range positions, not padding) — built and verified a
  repair (`A._repairDegenerateNormals` in `streaming.js`, currently commented out/disabled at its
  call site): recompute-from-triangle first, nearest-valid-neighbour-by-position fallback when the
  vertex's own triangles are ALL zero-area (confirmed the actual case here — every one of the 24 sits
  on a degenerate triangle, so simple per-face recompute alone doesn't reach them). **The repair is
  confirmed 100% effective at the DATA level** (read back live: 0 degenerate vertices remain, at
  every checkpoint across the full staging sequence — streaming-complete, post-isolation,
  mid-staging, fully-converged, all confirmed clean in one unbroken test) **but changes ZERO
  rendered pixels**, tried 3 different GPU-upload-forcing strategies (`needsUpdate=true`, swap in a
  genuinely new `BufferAttribute` object, `renderer.properties.remove(geom)` to drop cached GPU
  state) — none moved the black-pixel count at all. **This means the 24 raw-degenerate vertices are
  NOT the (or not the sole) cause of the visible black — that causal link, assumed earlier this
  session from a correlated but not confirmed in-shader `length(normal)` probe, does not hold up.**
- **Stage-by-stage shader probe, real finding, most valuable lead for next session**: patched
  `mat.onBeforeCompile` with early-`return` checkpoints at successive points in the ACTUAL compiled
  shader (not a synthetic isolated fragment) and re-rendered raw each time. Every single checkpoint
  came back **100% clean (zero black pixels)**: `diffuseColor.rgb` right after `#include
  <color_fragment>` (pre-lighting), `length(normal)` right after `#include
  <normal_fragment_maps>` (post-repair — was NOT clean pre-repair, matches expectation),
  `reflectedLight.directDiffuse + indirectDiffuse` right after `#include <lights_fragment_end>`,
  `outgoingLight` right after `#include <opaque_fragment>` (post envmap/specular combine),
  and the fully-tonemapped+colorspace-converted `gl_FragColor.rgb` right before `#include
  <fog_fragment>`. Fog itself was also directly ruled out (`material.fog = false` + forced
  recompile — same black count as fog-on, 721 both times). **Every stage tested individually is
  clean, yet the FULL unmodified shader (no early-return patches) still outputs black at those
  exact pixels.** This is an unresolved contradiction — most likely explanation not yet tested:
  something about the shader RECOMPILE each probe triggers (`mat.needsUpdate = true`) inadvertently
  fixes or sidesteps the real bug as a side effect (e.g. a stale/mismatched compiled-program cache
  for this exact material+light-count combination, separate from anything in the GLSL source
  itself) — test THIS directly next: patch a checkpoint that changes NOTHING (a true no-op
  replace-with-itself) and confirm whether the mere act of forcing recompile alone clears the black,
  independent of which checkpoint/probe content is used. If recompiling alone fixes it, the real bug
  is a stale compiled shader program (e.g. from a light-count change after initial compile — this
  scene ends up with up to 47 `PointLight`s active during staging) never getting recompiled for this
  specific material through the normal path, not anything in the source data or GLSL logic.
- Test infra: `verify_site2` (port 8403, `python3 -m http.server 8403` from
  `/tmp/claude-1000/-home-red1-bim-compiler/2a545224-.../scratchpad/verify_site2`, symlinked to
  `/tmp/wt-triplanar-metal-cast/viewer`) — restart the server if the port's not listening
  (`ps aux | grep 8403`). Every probe script referenced above lives in this session's scratchpad
  (`8929c17e-...../scratchpad/probe_*.js`, `witness_*.js`) — reuse the pattern (isolate via
  `setVisibleAt`, raw `A.renderer.render()` per differential test, `A.startStillRefine()` +
  `_stillRefineBusy===false` wait for the real converged case) rather than rebuilding from scratch.
- User's standing instruction, unchanged: "if u say near black, that is rejected" — this must
  resolve to a real, understood, FIXED mechanism or a clearly-still-open item, never a write-off.

The findings below (§1-4) are from earlier sessions the same day and are unrelated to this open
item — already fixed/parked, do not re-open.**

### Fixed / verified earlier this session (real evidence, not assumed)
1. **Reflection tuning (envInt) — DONE, LIVE, verified on `origin/main`.** 27 STD_MAT classes
   exempted from Alt+S's ×3 reflection boost, beam/railing at `envInt:0`, 25 others at `0.05`.
   `streaming.js?v=61`, `sw.js` `v1031`+. This was correct and complete for what it targeted
   (sky-reflection strength) — it was never able to fix the other two bugs below, which are a
   different layer (base colour data, and a separate texture-multiply effect).
2. **§HOSPITAL_META_DB_STALE (data bug) — fix built + verified LOCALLY, NOT DEPLOYED.**
   `Hospital_meta.db`/`Hospital_geo.db` (the split files the live viewer actually streams) are
   dated 2026-06-04/05 — 2 months older than the current combined source, which already has real
   colour for classes the split copy is missing (confirmed class-by-class: `IfcBeam` 0/1970 in the
   stale split vs 1970/1970 in the current combined source; same pattern for `IfcPipeSegment`,
   `IfcDuctSegment/Fitting`, `IfcFireSuppressionTerminal` — all 0% in the stale split, 100% in the
   current source). Regenerated via the existing `scripts/split_db.sh` into `/tmp/split_test/`
   (Hospital_meta.db/geo.db/positions.bin) — confirmed live: the same beam's
   `mesh.material.color` goes from wrong `8c9199` (STD_MAT's grey fallback) to correct `ebe6d9`
   (matches the real `0.920,0.900,0.850`). **Not yet uploaded to the live OCI bucket — needs an
   explicit go-ahead before touching production, per this project's PRIME RULE. User has not yet
   said go.** Audited other split buildings the same way: Terminal is fine (its split is newer
   than its source); Clinic's split file is old by date but its actual colour coverage checked out
   complete for the classes inspected; HHS_Office_Federated doesn't use split mode locally.
3. **§TRIPLANAR_METAL_CAST (a second, separate code bug, Alt+S-only) — fix built, NOT committed,
   NOT deployed.** The triplanar system (Layer 3, "8 distinct triplanar materials" — that phrase
   traced to a real 2026-07-15 witness count, archived in
   `prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md` line 236, not
   a designed 8-material system) multiplies a real photographed texture onto every metal/
   concrete/plaster-class element's colour, Alt+S/Alt+G only. Measured the 3 actual texture files
   directly: concrete is exactly grayscale (no bug possible), plaster is ~2% off (negligible), but
   **`metal_color_1k.jpg` has a real, systematic per-channel cast** (mean RGB `0.4901, 0.5353,
   0.5784` — B 18% above R) that the old scalar `normFactor` (a single brightness number) never
   corrected, and the metal group's contrast-boost (1.9×, the strongest of the 3 groups) then
   amplified that cast — dulling/cooling ANY colour under it (real or STD_MAT fallback alike) only
   during staging. **Fix:** replaced the scalar `normFactor` with a per-channel `normFactorRGB`
   (measured inverse means: metal `[2.0406, 1.8679, 1.7290]`) so the multiply is a true identity
   `(1,1,1)` on average for any colour, only real grain survives. Built in worktree
   `/tmp/wt-triplanar-metal-cast` (branch `fix/triplanar-metal-color-cast`, off `origin/main`
   `77f8234`) — 3 files touched in `viewer/streaming.js`: the `_TRI_CONCRETE`/`_TRI_PLASTER`/
   `_TRI_METAL` definitions, the `_triNorm` construction (now a `THREE.Vector3`), and the shader's
   `uniform float uTriNorm` → `uniform vec3 uTriNorm`. **Verified two ways:** (a) live uniform
   read post-fix, no pixel sampling: `uTriNorm = [2.0406, 1.8679, 1.729]`, exact match, no NaN, no
   shader compile error (`gl.getError()==0`); (b) real pixel test, the beam, both with its correct
   real cream colour AND with the grey STD_MAT fallback, wide non-crevice pose, 717 confirmed
   on-target samples each: Alt+S comes out hue 0-5° (warm/neutral) in BOTH cases — no longer
   bluish either way. **NOT yet committed, NOT a PR, NOT deployed — user's explicit instruction
   this session: "I rather u do not fix that [extraction] script" (item 4 below) but this
   triplanar fix was explicitly confirmed wanted ("the red is confirmed then fix the alt-s
   effect... the grey is also confirmed fallback then treat similar not bluish") — this one IS
   meant to ship, just hasn't been committed/PR'd/deployed yet.**
4. **Extraction-script gap — found, root-caused, EXPLICITLY PARKED, do not touch without new
   instruction.** `DAGCompiler/python/extractIFCtoDB.py`'s `get_colour_for_element()` (the actual
   function that builds a building's combined source DB from its real IFC — confirmed this is the
   one, not `tools/extract.py` which builds a different Rosetta-reference DB) only reads colour via
   direct per-instance geometry styling (`IfcStyledItem`/`StyledByItem` on the geometry itself) —
   it never reads colour via material ASSOCIATION (`IfcRelAssociatesMaterial` → the material's own
   defined render colour), which is how Revit typically colours structural elements ("this beam's
   material is Steel, Steel has a colour"). Real numbers, multiple buildings, not just Hospital:
   | building | class | has colour / total |
   |---|---|---|
   | Hospital | IfcBeam | 0 / 1,970 |
   | Terminal | IfcBeam | 432 / 432 |
   | Terminal | IfcColumn | 122 / 158 |
   | Terminal | IfcMember | 312 / 442 |
   | LTU_AHouse | IfcBeam | 819 / 1,144 |
   | LTU_AHouse | IfcColumn | 1,365 / 1,785 |
   | LTU_AHouse | IfcMember | 2,283 / 2,349 |

   Hospital is total (0%) because its source IFC apparently has zero redundant per-instance
   styling for these classes; Terminal/LTU are partial (70-97%) because their exports happen to
   carry some redundant styling the buggy function can still pick up. **User's explicit ruling
   this session: do NOT fix this now** ("I rather u do not fix that script as i fear it is
   pivoting and drifting") — parked, not touched, not re-opened without new instruction. If ever
   revisited: fixing means re-running full IFC extraction (the function takes a live `ifcopenshell`
   element, not a `.db` row) against the ORIGINAL source IFC — not a `.db`-side patch — and a
   partial "colour-only" re-run mode vs a full geometry re-extraction was never confirmed to exist,
   check before assuming either is cheap.

### §RED_GREY_MYSTERY — ROOT CAUSE FOUND 2026-08-15 (5th session same day), FIX NOT YET WRITTEN
**Both named candidate causes from the prior session (stale AO depth-prime, AO/shadow-restore
per-pixel bug) are RULED OUT by direct test — the real mechanism is a THIRD thing, deeper than
either guess: a genuine geometry-data defect (zero-magnitude vertex normals) on this specific
element's own mesh, unmasked by staging's lower light levels.** Full chase, in order, each step
empirically tested (not guessed) on `verify_site2` (fixed data + fixed triplanar code, port 8403,
worktree `/tmp/wt-triplanar-metal-cast`) — reuse the same 8 probe scripts in
`/tmp/claude-1000/-home-red1-bim-compiler/8929c17e-.../scratchpad/probe_*.js` if this needs
re-verifying rather than re-deriving:

1. **Methodology hole found in the PRIOR session's own isolation test**, before ever reaching the
   two named candidates: `witness_isolated_red.js` hides every other scene *mesh* but the target
   (`0HuLVU0hf5gxwY8y9yDvc0`, an `IfcValve`) is drawn by a `BatchedMesh` (id 3365) holding **92
   elements in one shared buffer** — hiding "every other mesh" left all 91 neighbours in the SAME
   batch fully visible and able to occlude/shadow the target. `mesh.setVisibleAt()` was never
   called. Fixed with true single-slot isolation (`setVisibleAt(i, false)` for all 91 others) —
   **made no measurable difference** (729→729 black px), so this hole didn't change the verdict,
   but it means the original "zero possible neighbour occlusion" claim was never actually true and
   should not be trusted at face value again without checking `setVisibleAt` support first.
2. **Both prior-session candidate causes are wrong.** Toggling `A._sunShadowRestoreEnabled`,
   `A._stillAOAdapter.enabled`, and `A.sun.castShadow` (+ a 20× bias diagnostic) all independently
   made **zero difference** to the black-pixel count, once tested correctly (see next point) — N8AO,
   the shadow-restore blend, and the sun shadow map are all innocent.
3. **Real methodology trap hit mid-session, worth recording for next time**: the very first round
   of "toggle X, call `A._composer.render()` once more, resample" tests all came back suspiciously
   *identical* — including swapping the element's material for flat-white `MeshBasicMaterial`,
   which should have looked nothing like the real material but read the exact same RGB. Cause:
   `A._composer.render()` after `startStillRefine()` has converged doesn't give a fresh single-sample
   frame — TAA's `accumulate=true` buffer is 16-deep, so one more call only blends ~1/17 of a new
   sample into 16/17 of old history. Every "no difference" conclusion from that first round was
   **unverified, not disproven**. Fix: bypass the accumulator entirely — raw `A.renderer.render(A.scene,
   A.camera)` — for every differential test from that point on. (This also cleanly excludes AO and
   the shadow-restore blend from raw-render results *by construction*, since both are composer-only
   passes — independently reconfirming point 2 for those two.)
4. **Redone properly (raw render, single frame, no accumulation): sun shadow off, triplanar off
   (`uTriActive=0`), and `envMapIntensity=0` — still zero difference** (725/725/727 black px,
   baseline 725). Batch-neighbour occlusion, AO, shadow-restore, sun shadow, triplanar, and env
   reflection are now ALL independently ruled out by direct measurement, not inference.
5. **Unlit `MeshBasicMaterial` swap via raw render (the first *reliable* version of that test):
   ZERO black pixels, full coverage.** This proves the geometry itself has no gaps/holes at this
   camera pose — rules out mesh completeness and (combined with `mat.side` already being
   `THREE.DoubleSide`, confirmed live, not `FrontSide`) rules out backface culling too.
6. **Direct in-shader probe of `diffuseColor.rgb` right after `#include <color_fragment>`
   (pre-lighting): ZERO black pixels.** The base albedo (no `map`, no `aoMap`, no vertex-colour
   attribute — confirmed, `geometry.attributes` is only `position`+`normal`) is completely healthy
   everywhere. The defect is proven to live specifically in the **lighting stage**, which is the
   one stage that depends on the surface normal.
7. **Direct in-shader probe of `length(normal)` right after `#include <normal_fragment_maps>`**
   (the same `normal` variable `lights_physical_fragment` uses, confirmed from the actual
   `three.module.min.js` chunk source — no normal/bump map on this material, so `_maps` is a
   no-op and `normal` at this point is exactly `normalize(vNormal) * faceDirection` from
   `normal_fragment_begin`, which is mathematically guaranteed to be unit length unless the
   source is degenerate): **734/1681 sampled pixels read a clean ~1.0 length; the other 947 read a
   scattered, non-clustered spread from ~0.39 to ~0.95** — not a physically real distribution for a
   post-`normalize()` vector (floating-point noise would cluster near 1.0, not spread continuously
   down to 0.39). Consistent with `normalize(vec3(0))` → NaN at some vertices, then NaN propagating
   through interpolation and getting written to the 8-bit framebuffer as an inconsistent small value
   per pixel (undefined-but-typically-low GLSL→u8 NaN conversion behaviour), not a genuine geometric
   normal length.
8. **Confirmed directly in the raw geometry buffer (CPU-side, no shader involved):** this element's
   own `BatchedMesh` slot (`getGeometryRangeAt(48)` → `vertexStart=64168, vertexCount=37880`,
   bounding sphere radius 0.51 — matches the valve's real size, so this is genuinely this element's
   own dense ~16,420-triangle mesh, not shared/padding data) contains **24 vertices with a raw
   `normal` attribute magnitude near zero** — real mesh data, not inert padding (checked: their
   `position` values are small, in-range local coordinates on the valve's actual surface, e.g.
   `[0.143, -0.387, 0.178]`, not origin/garbage). That's 24 of the 51 total degenerate-normal
   vertices found across the *entire 92-element batch* concentrated on this ONE valve instance —
   this specific element's tessellation is unusually bad, not a universal per-vertex background
   noise rate.
**Verdict:** this is a **real, previously-undiagnosed 4th bug** — a geometry-generation defect
(zero-magnitude vertex normals on specific curved/detailed elements, at least this valve) that
produces literal `[0,0,0]` fragments through ordinary NaN propagation in standard PBR lighting.
It is NOT caused by AO, shadow, triplanar, envMap, or batch-neighbour occlusion (all independently
disproven above), and it is NOT "near black is just how ambient light works" — per the user's
standing instruction ("if u say near black, that is rejected"), this is not being written off:
it's a confirmed, mechanistically-understood defect with a named data location, just not yet
patched. It surfaces specifically under Alt+S staging (not plain nav) because staging's much lower
overall light level (`toneMappingExposure` 0.3825 vs nav's 0.45, dusk sun at 6° elevation) is
what pushes the NaN-corrupted fragments' *effective* darkness over the threshold where a viewer
would notice — plain nav's brighter, higher-exposure lighting was very likely masking the exact
same defect as an unremarkable slightly-dim patch, not a genuine absence of the bug.
**Not yet done, next session or on go-ahead:**
- No fix has been written. The likely fix shape (NOT yet verified/built): detect
  near-zero-magnitude normals at geometry-load time (either in the extraction pipeline,
  `DAGCompiler/python/extractIFCtoDB.py`, or as a viewer-side self-heal on the `normal`
  BufferAttribute after streaming) and replace them with a recomputed face normal (cross-product of
  the triangle's edge vectors) instead of the degenerate stored value — needs its own witness
  before shipping, not assumed correct from this diagnosis alone.
- Only ONE element (`0HuLVU0hf5gxwY8y9yDvc0`) was chased to full root cause. Whether other
  elements/buildings carry the same defect at a rate that matters for the ORIGINAL "red/grey dark/
  bluish" user complaint (as opposed to being a rare, easy-to-miss edge case) is unmeasured — the
  extraction-script gap (item 4, above, explicitly parked) is a separate, already-understood issue
  and should not be conflated with this one.

### Test infrastructure left running/available, reuse don't rebuild
**⚠ RETIRED 2026-08-16 (post-§TRINORM_LINEAR):** verify_site2 (8403) server stopped and
`/tmp/wt-triplanar-metal-cast` pruned (branch fully pushed+merged, clean) — the mystery they
existed for is solved. Still standing: `/tmp/wt-sandbox` (8399). This session's probes/witnesses
+ logs: scratchpad `aa515841-…/scratchpad/`. Historical list below kept for the probe-script
pattern references only.
- `/tmp/wt-sandbox` (port 8399) — standing sandbox, STALE Hospital data, unfixed code — baseline/
  regression reference.
- `/tmp/split_test/` — regenerated Hospital_meta.db/geo.db/positions.bin, correct colour data,
  not yet uploaded anywhere.
- `/tmp/wt-triplanar-metal-cast` (git worktree, branch `fix/triplanar-metal-color-cast`) — the
  triplanar per-channel fix, uncommitted.
- Scratchpad `verify_site/` (port 8402, fixed data + unfixed code), `verify_site2/` (port 8403,
  fixed data + fixed code), `verify_site3/` (port 8404, stale data + fixed code) — the 2×2 combos
  used to isolate which fix caused which effect. `witness_isolated_red.js` there is the
  hide-everything-else isolation harness — reuse it for the mystery above, don't rebuild it.

### Methodology lessons, hard-won this session — apply immediately, don't re-learn
- **Never call `A.renderer.render()` yourself to "sample" after Alt+S has already converged** —
  that bypasses the composer's real AO/TAA output and silently re-renders a plainer frame than
  what's actually on screen. Read the canvas exactly as the app's own internal loop left it
  (no extra render call) for any post-convergence sample.
- **An automated "pick the camera offset with the most raycast hits" pose-selector is biased
  toward bad poses** — close-up/crevice angles maximize on-screen coverage (more hits) but also
  maximize AO/shadow crushing. Don't reuse that heuristic without capping minimum distance or
  checking the result isn't degenerate.
- **Isolating a target by hiding everything else removes occlusion ambiguity but may introduce ITS
  OWN artifact** (see candidate cause 1 above) — don't trust an isolated-element result at face
  value without checking whether AO/depth state was correctly re-primed for the new (empty)
  scene.
- **`mesh.material.color.getHexString()` (a direct property read) is far more reliable than pixel
  sampling for verifying base colour assignment** — reach for it first; pixel sampling is only
  needed to check what LIGHTING does to that colour, and even then a large flat surface (a beam)
  samples far more reliably than a small, tightly-packed element (a coupling/valve).

## §HOSPITAL_META_DB_STALE — supersede notice
The block below (§HOSPITAL_META_DB_STALE, originally written earlier the same day) is now folded
into the numbered list above — kept in place for its full diagnostic detail (DB timestamps, exact
queries) rather than duplicated, but its resume-first status is superseded by the block above.

**§HOSPITAL_META_DB_STALE — REAL ROOT CAUSE FOUND 2026-08-15 (3rd session same day, user: "That
red metal even up close does not look red at all. Bluish railings and beams still there.") — THIS
is why the envInt/reflection work below never fully closed the complaint. Read this block FIRST,
before the reflection-tuning history below — that work was real and correct but was fixing a
SECOND, smaller effect on top of this larger, primary one.**

- **Root cause, proven not guessed:** `buildings/Hospital_meta.db` + `Hospital_geo.db` (the
  split-DB pair the live viewer actually streams from — confirmed via `§CACHE_WRITE_OK
  Hospital_meta.db` in a real session log, even when the URL param requests
  `Hospital_extracted.db`, the split-detect logic silently prefers meta+geo when present) are
  **dated 2026-06-04/05 on disk** (`ls -la --time-style=full-iso`). `Hospital_extracted.db` —
  the single combined source DB — is dated **2026-08-03**, almost 2 months NEWER. The split was
  never regenerated after whatever pass added/fixed real `material_rgba` values in the extracted
  DB. Direct query, stale `Hospital_meta.db` on disk: **56,751 of 63,415 elements (89.5%) have
  `material_rgba IS NULL`, including 1,970/1,970 IfcBeam (100%) and most IfcRailing.** The CURRENT
  `Hospital_extracted.db` has real, correct, warm-cream colour (`0.920,0.900,0.850`) for every one
  of them — confirmed via direct `sqlite3` query against the file, not the app.
- **This is why beam/railing never actually looked right despite the envInt=0 fix below:** with
  `rgbaStr` null, `streaming.js`'s `_getMaterial()` correctly (and separately, not a bug) falls
  back to the class default `STD_MAT.IfcBeam = { r:0.55, g:0.57, b:0.60, ... }` — a **cool
  blue-grey "generic steel" placeholder**, `b` slightly the dominant channel — that IS the blue the
  user kept seeing. The envInt work fixed the SKY-REFLECTION contribution correctly; it was never
  able to fix the BASE ALBEDO because the base albedo data itself never reached the deployed file.
  Live-confirmed the material itself, not just the DB: real GPU witness against a real beam
  (`3PPIAPsErEhBLQrdgjAPap`, `meshId=626, instanceIndex=2`) on the stale meta.db —
  `mesh.material.color.getHexString()` = `8c9199` = `[140,145,153]`, an EXACT match for
  `STD_MAT.IfcBeam` converted to 0-255 — proof positive it's the null-fallback, not a rounding or
  reflection artefact.
- **Fix regenerated and verified locally, NOT yet deployed (needs explicit go-ahead — this
  touches the live OCI bucket, `PRIME RULE` production boundary):**
  `scripts/split_db.sh` (bim-compiler, already existed, does the right thing — `.clone` + drop
  geometry tables, no rewrite of `elements_meta`) re-run against the current
  `Hospital_extracted.db` in an isolated `/tmp` copy. Regenerated `Hospital_meta.db`: **63,917/
  64,150 elements (99.6%) now have real `material_rgba`**, all 1,970 IfcBeam included, confirmed
  `0.920,0.900,0.850` intact. Live GPU witness against the REGENERATED files (served from an
  isolated scratch dir, shared `~/bim-ootb` checkout untouched — the auto-mode classifier
  correctly blocked writing into that shared tree, worked around by staging in
  `scratchpad/verify_site/` instead, symlinking `viewer/` read-only): same beam,
  `mesh.material.color.getHexString()` now `ebe6d9` = `[235,230,217]` — **exact match to the true
  DB colour.** Root cause fixed at the data level, verified by rendering, not assumed.
- **Residual, small, EXPECTED effect, not a bug — don't re-chase:** even with the correct warm
  base colour, the SAME beam's actual rendered pixel in ambient-only shadow (no direct sun, this
  session's now-familiar camera-below-looking-up pose) still reads mildly cool
  (`[94,101,113]`, B the highest channel) — because the scene's native `THREE.HemisphereLight` sky
  colour is genuinely `0xb0c4de` (light steel-blue) and this surface has no direct sun on it. This
  is the SAME class of effect as §PHOTO_METAL_BLUE_TINT's ambient-only-shadow finding below,
  correctly proportioned, real physics, not a data bug — the difference now is the base colour
  UNDER that shadow tint is correct cream, not a wrong cool-grey to begin with.
- **Not yet done, real next steps if this is picked up again:**
  1. **Deploy the regenerated `Hospital_meta.db`/`Hospital_geo.db`/`Hospital_positions.bin` to the
     live OCI bucket** (`deploy/OCI_UPLOAD.md` §RULES — remember `--content-type` on every object)
     — this is the actual fix reaching the user; everything above is proven but inert until this
     ships. Regenerated files currently sitting in `/tmp/split_test/` (this machine only, not
     committed — per the DB-changes doctrine, these are never git/LFS).
  2. **Audit every OTHER split-mode building for the same staleness** (`Terminal`,
     `HHS_Office_Federated`, `Clinic`, any building shipping a `_meta.db`+`_geo.db` pair) — compare
     `_extracted.db` mtime vs `_meta.db`/`_geo.db` mtime, re-split any that are behind. Not checked
     this session, Hospital was the only one investigated (it's what the user was actually
     looking at).
  3. **The general-rule question (user asked directly, "why can't all this be as a general
     rule?"): make staleness structurally impossible, not a thing to remember.** Concrete options,
     not yet built or decided: (a) a pre-deploy check that fails loudly if `_meta.db`/`_geo.db` are
     older than their source `_extracted.db`; (b) fold `split_db.sh` as a mandatory last step of
     whatever pipeline writes/patches `_extracted.db`'s `material_rgba`, so a split file can
     structurally never exist without its source's latest data; (c) drop the split optimization
     for the metadata table specifically (keep geometry split, since that's the actual size win)
     so `material_rgba` always comes from a single always-current source. Worth deciding, not
     invented/chosen here.

## §PHOTO_METAL_BLUE_TINT — reflection-only history, real and shipped, but NOT the full story (see block above)
**§PHOTO_METAL_BLUE_TINT — MOSTLY CLOSED 2026-08-15, resume here first if the user reports ANY more
"still blue/bluish/dark" complaint on beams/railings/pipes/ducts/MEP devices.** Session chased a
single root cause across 5 shipped PRs (#1367, #1369, #1371, #1370, #1373) on bim-ootb — do NOT
re-diagnose from scratch, read this block first.

- **Root cause (confirmed, code-grounded):** metal/glossy materials reflect the scene's sky
  environment map (physically real — same as any polished surface reflecting its surroundings), and
  a SEPARATE Alt+S/Alt+G-only pass (`_reassertPhotoMatBoost`, effects.js) blindly multiplied that
  reflection strength x3 (+ tightened roughness x0.4) on every metal/glossy material with zero
  awareness of a per-class tuning (`STD_MAT[...].envInt`, streaming.js) that already existed to fight
  this exact effect on 4 classes. Non-null (real, authored) IFC colors were NEVER touched — verified
  repeatedly, `if (!rgbaStr && stdMat)` gates all hue changes; only the REFLECTION STRENGTH (a
  physical/rendering setting) is shared per-class regardless of null status, which is correct
  (a red-painted beam and a grey one reflect light identically in reality).
- **Current shipped state, VERIFIED BY READING `origin/main`'s RAW FILE CONTENT directly (not just
  `gh pr view` merge status — see the landmine below on why that matters):**
  - 27 STD_MAT classes (all structural-steel + MEP: beam/member/plate/pipe*/duct*/cablecarrier/
    flow*/valve/alarm/fireSuppressionTerminal/lightFixture/sanitaryTerminal/airTerminal/
    energyConversionDevice/electricAppliance/buildingElementProxy/transportElement) are now
    `_photoEnvExempt` — the Alt+S/Alt+G triple-boost pass skips them entirely.
  - `IfcBeam` and `IfcRailing` specifically: `envInt: 0` (zero sky reflection, pure albedo) — direct
    user request ("get rid of those railings and overhead beams from been recolorized").
  - The other 25: `envInt: 0.05` (was 0.6 uncapped → 0.18 → 0.05, three successive tightening passes
    this session, each user-driven: "still blue" → cut further → cut further again).
  - `viewer.html`: `streaming.js?v=61`. `sw.js`: `CACHE_VERSION = 'v1031'`.
  - Glass (`IfcCurtainWall`, `IfcWindow`) deliberately left alone — full reflectivity there is the
    wanted glint effect (§PHOTO_HOTSPOT), never reported as a problem.
- **Real numeric test, not a screenshot (this session's own GPU witness, Hospital, real streamed
  geometry, real Alt+S convergence, camera at a real beam's exact DB-recorded position, Level 4):**
  709 non-metal sample pixels R=96.1 G=88.1 B=89.0 (blue LOWER than red/green); 191 metal sample
  pixels R=119.1 G=116.7 B=117.4 (blue essentially neutral, -0.5). **Caveat: this test ran BEFORE the
  final #1373 fix (beam/railing→0, +13 recovered MEP classes) was confirmed on `main`** — it's real
  evidence the mechanism works, not a post-#1373 re-verification. Re-run it first if picking this back
  up, using the SAME method (raycast-grid + `gl.readPixels`, bucket by real `material.metalness`, not
  visual inspection) before touching any more code.
- **HARD LESSON, apply to every future PR here or anywhere else on this project:**
  `gh pr merge --auto --squash` can lock the squash content to whatever the branch HEAD was when
  checks passed — pushing MORE commits to that same branch afterward does NOT reliably get included,
  even though `git push` succeeds and the branch shows the commits. This bit this session TWICE: PR
  #1371's second commit (13 MEP classes + a version bump) silently never landed despite being pushed
  and the PR showing MERGED — only caught because the user kept reporting the exact symptom that
  commit was supposed to fix, and only proven by reading `origin/main:viewer/streaming.js` directly
  (`git show origin/main:<path>`), not by trusting `gh pr view --json state,mergedAt`. **Going
  forward: push ALL intended commits to a branch BEFORE enabling `--auto`, and after any merge,
  verify by reading the actual file content on `origin/main`, never just the merge/PR state.**
- **Ambient/hemi fill — RE-INVESTIGATED 2026-08-15 (second session same day), verdict CHANGED from
  "not yet coded" to "measured, understood, NOT a color bug, decision needed before any fix":**
  the entry below this one (as originally written) guessed the cause was `PHOTO_HEMI_SKY_COLOR`'s
  cool-violet HUE (a photo-staging-only tint). **That guess is now falsified by a real numeric
  witness** (raycast-grid + `gl.readPixels`, same convention as the reflection witness above,
  GPU `ANGLE (NVIDIA RTX 4060)`), and the true mechanism is broader and simpler:
  - **Target: a real Victaulic Grooved Coupling, Hospital Level 5, guid
    `0HuLVU0hf5gxwY8y9yDwsP`, confirmed non-null real IFC color `0.843,0.137,0.102` (hex `d7231a`,
    255-scale `[215,35,26]`, true luminance 72.6).** Confirmed via `mesh.material.color` read
    directly off the live `THREE.InstancedMesh` (not the DB) that the material IS exactly this
    color — the color pipeline is NOT the bug, ruled out first.
  - **This happens in PLAIN NAV, before any Alt+S/photo staging runs at all** — so it is not a
    dusk-mode-only issue. Camera posed realistically (looking up at the ceiling-mounted fitting
    from ~1.2m below, the way a person actually sees it, not a straight-down macro shot — a
    straight-down pose was tried first and hit a specular hotspot artifact instead, a dead end
    worth skipping next time). 127 confirmed on-target pixels (guid-matched via raycast, not
    guessed): rendered median RGB `[77,13,12]`, luminance **26.5 — 36.5% of the true 72.6.**
  - **Control sample, same session: a nearby neutral/light-grey Victaulic Elbow on the SAME pipe
    run** (guid `0HuLVU0hf5gxwY8y9yDwsQ`, same camera offset, same method, 181 confirmed pixels):
    real material colour (read from the live mesh, not the DB — a separate, uninvestigated
    discrepancy exists between this element's DB `material_rgba` `0.920,0.900,0.850` and its
    rendered material `9499a1`/`[148,153,161]`, not chased further this session, flagged below)
    luminance 152.5 → rendered luminance 63.5, **41.6% of true.**
  - **Verdict: the red joint's 36.5% and the grey elbow's 41.6% are the same ballpark — this is
    UNIFORM ambient-only shading, not a red-specific or colour-specific darkening.** This renderer
    has no bounce/GI; a surface with no direct sun on it is lit by ambient+hemi fill alone, and at
    native (non-photo) intensity that fill leaves ~37-42% of true albedo luminance, for ANY colour.
    The reason a RED joint specifically reads as "gone black" while a grey one still reads as "a
    visible dim grey" is arithmetic, not a bug: red's OWN true luminance is already low (72.6, vs a
    near-white's 200+) because luminance is G-dominated (`Y=0.2126R+0.7152G+0.0722B`) and a
    saturated red has almost no G. The same proportional cut that leaves grey at a legible 63.5
    pushes red down to 26.5 — indistinguishable from black to a viewer, even though nothing
    singled red out.
  - **What this means for a fix, and why none was applied this session:** the earlier hypothesis
    ("ambient/hemi COLOR is the next lever") is retired — it's INTENSITY/no-GI, not hue. A global
    ambient/hemi intensity boost is the obvious lever, but §MOVIE_SHADOW_TM and
    §PHOTO_CONTRAST_DIALBACK elsewhere in this file are a direct prior instance of exactly that
    lever being tried and REVERTED because it flattened shadow/spotlight contrast — re-pulling it
    without a narrower, colour-legibility-only mechanism (e.g. a small shadow-side luminance floor
    scoped to real/non-null saturated colours only, leaving the global fill and shadow contrast
    untouched) risks re-breaking what that revert fixed. **This is a real product decision (accept
    physically-correct-but-perceptually-black shadow rendering, vs. spend a narrow fix on
    legibility) — not something to invent unilaterally.** Not yet asked/decided as of this entry.
  - **Loose thread, not chased:** the grey elbow's rendered material (`9499a1`) doesn't match its
    own DB `material_rgba` (`0.920,0.900,0.850`) at all — that element streams via the `BatchedMesh`
    path (bucketed by `[storey,disc,rgba]`), and the mismatch wasn't root-caused this session (ruled
    out one candidate: the "§S260d near-white taming ×0.92" rule doesn't apply here, `b=0.850` is
    not `>0.85`). Separate from the red-joint investigation above; flagging so it isn't lost.
  - Witness scripts (not committed, scratchpad only):
    `witness_indoor_red_darkening_v3.js` + `witness_reference_grey_v2.js`, both against the standing
    `/tmp/wt-sandbox` (localhost:8399) — reusable if this is picked up again, same GUIDs/offsets.
  - **Follow-up same session, user pushback ("it's a bright area, why completely not red — investigate
    harder"): three more real tests, one dead-end honestly retracted.**
    1. **Colour-assignment audit, 6 more real red elements, both code paths:** every one checked —
      `IfcPipeFitting` Tee/Coupling variants (InstancedMesh) and `IfcValve`/
      `IfcDistributionControlElement` (BatchedMesh, guids `0HuLVU0hf5gxwY8y9yDvc0/vcG`,
      `2NvWEO1Wb9Jwl21EQJp70a`) — every single one has the CORRECT material colour
      (`d7231a`/`ff0000` matching their real DB `material_rgba` exactly). **No red-colour-assignment
      bug exists on either streaming path.** (The one mismatched element found earlier, the grey
      Elbow rendering `9499a1` instead of its true cream `0.920,0.900,0.850`, does NOT generalize to
      reds — still an open, unexplained, separate loose thread, not chased further.)
    2. **Dead end, tried and RETRACTED — do not re-chase:** added a synthetic `new
      THREE.PointLight(0xffffff, 100000, 0, 1)` right next to the same red coupling and re-rendered —
      ZERO pixel change, even at absurd intensity, even on a plain (non-instanced) `THREE.Mesh`
      (the ground plane), even after forcing `material.needsUpdate`/`A.markDirty()`/a second render
      call. `renderer.info.programs.length` DID increase (16→21, proving a shader recompile for the
      new light count genuinely happened) yet the pixel still didn't move — looked at first like a
      real "point lights don't illuminate this scene" engine bug. **Falsified by the next test below
      — this was a test-harness artifact (most likely a camera/target-positioning mismatch in the
      ad-hoc probe, never root-caused further since a working alternative existed), not a real bug.
      Do not report "point lights don't work" from this project's own history — it's wrong.**
    3. **Decisive real-mechanism test: `A.toggleNightMode()`** (the actual shipped fixture-glow
      code path, not a synthetic light — `§NIGHT_MODE on fixtures=1286 ... glowMats=8`,
      `nightLights=30` real point lights added) **on the SAME red coupling, same camera pose:
      luminance 26.5 → 81.9 (3.1x), RGB `[77,13,12]`→`[174,58,47]`, staying clearly red/warm-toned
      throughout.** Proves the shipped lighting mechanism works correctly end-to-end on this exact
      element — a real nearby light source DOES correctly restore visible red brightness. This is
      why the point-light dead-end above was retracted rather than reported.
    - **Net effect on the earlier verdict: unchanged, now on firmer ground.** The material and the
      real lighting mechanism both check out correct. What remains is exactly what the first pass
      found: ordinary ambient-only shadow (no direct sun, no nearby active light) reads at ~37-42%
      of true luminance for ANY colour, and saturated red's low baseline luminance means that
      ordinary dimming crosses into "looks black" territory sooner than it would for other colours.
      If the user's "bright area" report was Alt+S/G dusk mode or plain daylight nav with NO nearby
      active light source on that specific element, this is that same, already-measured effect —
      not a new bug. If a future report is pinned to a moment where a real nearby light IS on (night
      mode, fixture glow, camera fill-light) and the element still doesn't recover, THAT would be a
      genuinely new lead worth its own witness — not yet observed this session.
  - **No true indoor/outdoor occlusion for the env-map reflection** — every material's `envMap` is the
    SAME global sky capture regardless of whether that surface can actually see the sky (an indoor
    pipe "reflects" the exterior sky through the walls). This session mitigated it by crushing
    reflection intensity near-zero on the affected classes rather than fixing the underlying
    architecture (no per-element or per-pixel occlusion test feeds the env map). Cheap enough for now
    that this may never need real fixing, but it's the honest root cause if intensity tuning alone
    ever stops being enough.
- **Explicitly ruled out / do NOT revisit:** Hospital's pipe/duct classes are ~100% real (non-null)
  IFC color, mostly a generic Revit default (`0.920,0.900,0.850`, confirmed via direct DB query,
  36,331 elements share this exact value) — proposed treating that default as equivalent-to-null so it
  could get real trade colors like HHS's null elements do; **user ruling: "NO CHANGE!!!" — Hospital's
  extracted data is not to be touched, full stop, this door is closed.**
- **Colour-swap system (separate from the reflection bug above, unaffected by any of this session's
  fixes, already correct going in) — for when a piece has genuinely NO IFC colour:** name-match first
  (`A._mepNameHint`, streaming.js) — duct→grey, sprinkler/groove/coupling/victaulic→orange (FP),
  diffuser/grille/exhaust→red (ACMV), dwv/sanitary→magenta (SAN), pipe→purple (PLB), light/sconce/
  lamp→yellow (ELEC); falls back to the discipline column (`A.DISC_COLORS`) if no name match — HHS's
  unlabelled MEP is flat `"MEP"` discipline → green; only truly unclassifiable pieces (no name match,
  no discipline) land on the flat blue-grey `STD_MAT` default. Real, non-null colours are NEVER
  touched by any of this — confirmed and reconfirmed multiple times this session.

Other open threads, all below in full detail:
0. **§WEATHER_ADVANCED_MODE** — SPEC ONLY, no code. Opt-in bake-only weather (the Twinmotion/Lumion
   parity ask). Most of the machinery is already shipped; start at the Phase 1 overcast preset, not
   at clouds. Flagged against the schedule-accuracy-first ruling — a decision, not a queued task.
1. **§LTU_FLOOR_FLICKER** — MaxQ bake floor flicker on `LTU_AHouse`. Mechanism-confirmed
   (transparent-sort instability, ghost-ground × x-ray-staging), NOT pixel-proven, NOT fixed.
2. **§SHADOW_FRONTIER** — shadows on in-progress/ghosted construction elements during a MaxQ bake.
   Mechanism traced, no code bug found (unlike the sun-arc bug below), genuinely needs live
   evidence next. **User ruling 2026-08-11: not serious, nice-to-have only if free — don't burn a
   session on it.**
3. **§PHOTO_AO_TUNING / §PHOTO_AO_SCALE / §PHOTO_AO_EDGE** — CLOSED 2026-08-13. The N8AO
   ambient-occlusion fold went too dark → far bright/up close dark → no visible edge/corner shadow,
   across 3 same-day rounds. Three fixes SHIPPED (bim-ootb PR #1331 flat retune + denoise bump,
   #1334 screenSpaceRadius distance-scale fix, #1335 intensity 2→4) plus a real SW precache
   staleness bug found+fixed along the way (PR #1332) and a related night-PointLight near-field
   fix (#1336, decay 1.5→1.0). **Correction (2026-08-13): PR #1337 is NOT part of this chain** —
   checked live via `gh pr view 1337`, it's `§GLOW_LENS_SOFT_EDGE`/`§GLOW_LENS_SHAPE_FIT` (fixture
   glow quad softening in `effects.js`, merged 2026-08-12T19:48Z), unrelated to N8AO. Previously
   miscited here as a 4th AO fix — fixed, don't re-cite it against AO work. **User confirmed live,
   real bake MP4 (Clinic): "much better," and Alt+G+Night nav "amazing."**
4. **§SUN_SHADOW_DROWNED — shipped part CLOSED 2026-08-14 (PR #1346, MERGED, confirmed via
   `gh pr view 1346`). The slab/wall asymmetry it left behind reopened same day as
   §SUN_SHADOW_GRAZE_SCALE — also CLOSED 2026-08-14/15 (PR #1363, MERGED).** PR #1346 itself:
   mask/blend restore pass in `_buildStillAO()`, samples `A.sun.shadow.map` directly, mirrors
   three.js's own `getShadow()` chunk, restores AO-eroded contrast at the detected sun-shadow
   boundary only, denoise/AO tuning fully untouched. (§SUN_SHADOW_GRAZE_SCALE below: pixel-proof
   found the fix's shader logic sound but no measurable synthetic-pose effect — closed anyway on
   the user's own live-bake read, "shadows are sharp enough," same as #1346's own closure pattern.)
   Real-pixel witness: +18.7% contrast at the shadow edge, 40x scoped away from
   ordinary AO corners. User's own live gut-check (fresh HHS_Office_Federated Alt+C bake, hard reset
   confirmed `§SUN_SHADOW_RESTORE_INIT_OK` live): "not evident to be diff[erent] onset" at first,
   then later in the same bake "strong shadows on walls and different surfaces.. this is good sign,"
   closed with "I am OK as this is as good as it can get but is good enough." Root cause: Alt+S/Alt+C's
   N8AO denoise was bumped in PR #1331 for indoor noise; Alt+G's was never touched — the fix borrows
   sharpness from the already-correct shadow map instead of touching denoise. Full diagnostic trail
   (10 rounds of user corrections, 2 ruled-out hypotheses, the witness methodology, PR #1343's
   insufficient partial fix that preceded #1346): archived in
   `prompts/archive/PHOTOREAL_STILL_RENDER_SUN_SHADOW_DROWNED_2026-08-13_to_2026-08-14.md`.

   **§SUN_SHADOW_GRAZE_SCALE — CLOSED 2026-08-15, bim-ootb PR #1363 MERGED (auto-merge armed
   2026-08-14, confirmed via `gh pr view 1363`).** User kept seeing "slab shadows still soft, wall
   shadows now strong" across multiple fresh bakes after #1346 shipped (HHS_Office_Federated AND
   Hospital). This thread traced why, built a fix, verified it COMPILES/RUNS clean, then a first
   pixel-proof attempt was RETRACTED as an N8AO-noise artifact (null-control proved it), and a
   corrected zero-noise methodology was built and run to a decisive answer: the fix's shader logic
   is verified sound (its kScale widening genuinely engages at grazing incidence, reaching ~91% of
   its cap at real shadow-boundary pixels) but produced ZERO measurable image difference on every
   SYNTHETIC pose/elevation tested this session (Hospital, tour-path pose, both grazing elev=6 and
   normal elev=40) — root-caused to the mask being mathematically binary per pixel, so a wider
   kernel only matters where erosion exceeds the base 4px reach, and no such case was found in the
   tested scenes. Full trail in the entry below (search `Corrected methodology BUILT and RUN`).
   **Closed anyway** on a REAL Hospital MaxQ bake (`BIM_MaxQ_Hospital_1786724035476.mp4`, landed
   2026-08-15) — user's own live read: "shadows are sharp enough. Previous was too soft. U may
   close." Same closure pattern as #1346 itself (a real bake's visual read outweighing a synthetic
   witness that couldn't reproduce the exact erosion case). Committed
   `408efb0` on `fix/sun-shadow-kernel-graze`, merged onto `origin/main`@`2b86a47` first (12 commits,
   clean fast-forward, no conflicts) before pushing.

   - **Mechanism, code-grounded (not the earlier camera-angle guess, which had unresolved direction
     ambiguity — superseded):** `_srFrag`'s edge-detect (`effects.js` ~3564-3579, confirmed still at
     that location on `origin/main`) uses a FIXED `kernelPx=4` screen-space neighbor tap with no
     angle-awareness. The live console log's own `§PHOTO_SHADOW_BIAS worldBias=…m … grazeElev=6`
     and `§PHOTO_SUN_SHADOW_REACH elevation=6.0 … shadowReach=413` lines (pasted by the user
     mid-session, from a real Hospital bake) show the codebase ALREADY compensates shadow BIAS for
     grazing sun elevation elsewhere (`_reassertPhotoShadowCoverage`) — the restore kernel has no
     equivalent. At low sun elevation, light hits a horizontal GROUND/slab at near-grazing incidence
     (inherently wide/bias-eroded boundary) but hits a sun-facing WALL at near-normal incidence
     (tight boundary) — same sun, same frame, opposite effect depending on surface orientation. A
     flat `kernelPx=4` was implicitly tuned against the wall case.
   - **Real numeric baseline, obtained from the user's own just-landed bake, current SHIPPED code
     (no fix applied yet)** — `~/Downloads/BIM_MaxQ_Hospital_1786691108809.mp4`, frame `h_010.png`
     (Day 412/412, low/grazing sun elevation, extracted via `ffmpeg -sseof -6`), same
     ffmpeg+numpy FWHM methodology as the #1346 witness (script rewritten this session at
     `/tmp/wt-sun-shadow-kernel-graze/measure_shadow_edge.py`, per-row max-gradient FWHM + 8px
     plateau contrast):
     | surface | rows/cols | edge width | edge contrast |
     |---|---|---|---|
     | wall (shaded facade split, rows 370-480, x 600-780) | n=110 | median 2.0px, mean 2.23, std 0.48 | mean **103.4** |
     | ground (plaza shadow, rows 650-850, x 600-1500) | n=191 | median 2.0px, mean 2.83, std **1.32** | mean **40.1** |

     Width is close on both (the scan partly locks onto rock/material edges on the ground — a real
     limitation of this method, don't over-read the width column). **Contrast is 2.5× weaker on the
     ground** and far noisier (std 1.32 vs 0.48) — this is the real signature. Reframes the fix
     target: a too-narrow `kernelPx` doesn't uniformly blur the ground boundary, it makes the 8-tap
     mask fire PARTIALLY (some taps cross the boundary, some don't → `edge` comes back as a weak
     fraction, not 0 or 1) → `mix(aoColor, sharpColor, edge*strength)` only partially restores → a
     low-contrast wash, not a wide blur. A wider grazing-angle kernel should make more/all taps
     cross the real boundary → `edge≈1` → full restore.
   - **Fix built, real-GPU compile/run VERIFIED, pixel-effect NOT yet verified:** worktree
     `/tmp/wt-sun-shadow-kernel-graze` (fresh off `origin/main`@`f5db8f9`, branch
     `fix/sun-shadow-kernel-graze`, **uncommitted working-tree diff, not yet a commit or PR** — the
     diff is sitting there, `git diff -- viewer/effects.js` shows it). Adds a per-PIXEL adaptive
     `kScale` to `_srFrag`: reconstructs a screen-space surface normal via `dFdx`/`dFdy` of the
     depth-reconstructed world position (no extra G-buffer needed), takes
     `NdotL = abs(dot(normal, sunDir))`, and widens `kernelPx` by `clamp(1/NdotL, 1, kernelMaxScale)`
     (`kernelMaxScale=4.0`). Per-pixel (not per-frame/per-elevation) on purpose — a wall and a slab
     can both be in frame at the same sun elevation with very different local incidence. Needed
     `extensions: { derivatives: true }` on the `THREE.ShaderMaterial` (WebGL1-mode GLSL under this
     renderer's default — `dFdx`/`dFdy` don't work without it). `sunDir` uniform recomputed every
     frame from `A.sun.position - A.sun.target.position` (the arc moves the sun every capture).
     Real-hardware-GL witness (`witness/harness.js`-style `playwright-core` launch,
     `--use-angle=gl`, NOT swiftshader — puppeteer+swiftshader was tried first and was too slow to
     even finish one 16-sample TAA accumulate in a reasonable smoke-test window, a dead end worth
     skipping next time) at
     `/tmp/wt-sun-shadow-kernel-graze/witness_sun_shadow_graze_scale.js`: PASS on
     `ANGLE (NVIDIA GeForce RTX 4060 Laptop GPU…)` — `SUN_SHADOW_RESTORE_INIT_OK kernelPx=4
     strength=1 kernelMaxScale=4` fired, `STILL_REFINE done`/`PHOTO_AO done` both completed, **zero
     shader/compile errors, zero page errors**. This only proves it doesn't crash — it does NOT
     prove it improves the contrast numbers above.
   - **A LAN dev server may still be up** from this session at `http://10.253.10.188:8400` (bind
     `0.0.0.0`, `python3 -m http.server` in the worktree above, Hospital + HHS_Office_Federated DBs
     symlinked into `viewer/buildings/` and `buildings/`) — check with `curl -sI
     http://localhost:8400/viewer/viewer.html` before assuming it's alive; restart if not
     (`cd /tmp/wt-sun-shadow-kernel-graze && python3 -m http.server 8400 --bind 0.0.0.0 &`).
   - **Pixel-proof attempted 2026-08-14, RETRACTED same session — the first "real" result was a
     measurement artifact, not a fix effect. Caught before it shipped; recording the trap so it is
     not re-walked.** Method: single converged Hospital still, real MaxQ tour path pose
     (`A.cinemaPathPlan(24).poseAt(0.8)` — reuses the SAME camera formula the real film flies, not a
     hand-rolled bbox pose; two bbox-derived poses were tried first and failed for instructive reasons
     kept below), sun elevation=6 (`A._sunArcStep(1.0)`, matches baseline `grazeElev=6`), toggled
     `A._shadowRestoreMat.uniforms.kernelMaxScale.value` between 4.0 (fix) and 1.0 (old flat-kernel,
     byte-identical to pre-fix shipped code) across successive `A._composer.render()` calls on the
     same frozen camera — the same single-build-A/B pattern that worked for #1346. First pass found a
     small, correctly-directioned-looking signal (grazing surfaces ~11% more affected than wall-like
     ones, classified via `THREE.Raycaster` NdotL against the real scene). **A null-control killed
     it:** rerunning with NO real toggle at all (kernelMaxScale set to the SAME 4.0 both times)
     produced the identical magnitude (grazing meanAbsLumDelta 1.39 vs the "real" run's 1.40;
     normal-incidence 1.29 vs 1.26) — proving the whole signal was render-call-order noise, not the
     uniform being changed. Root cause: `_composer.render()` re-invokes `n8.render()` (N8AOPass)
     every call, and N8AO's own internal dither/jitter state advances per call regardless of camera
     or uniforms — #1346's own witness never hit this because its effect (+18.7%) was far above this
     noise floor; this fix's effect, whatever it is, is not. Doubling `kernelMaxScale` (4→8) and
     doubling `strength` (1→2) were also tried against this same flawed methodology and *also* showed
     no movement — **that result is equally untrustworthy, not evidence either lever is saturated.**
   - **Corrected methodology BUILT and RUN (2026-08-14, same session) — clean, zero-noise, and
     decisive: kernelMaxScale/strength measurably do NOTHING on this test scene, but a direct shader-
     level check shows the mechanism itself is working correctly. This is a real, evidenced result,
     not another false start — read in full before touching this fix again.** Built
     `witness_graze_scale_frozen.js`: one `_composer.render()` call to freeze
     `A._shadowRestoreMat.uniforms` (tAO/tSharp/tDepth/tShadowMap/shadowMatrix now hold one frame's
     static content, `n8.render()` never called again), then a manual full-screen quad
     (`A.renderer.render(quadScene, quadCam)`) reusing that SAME material for each sample — verified
     visually (`quad_only_render.png`) that this draws the real composited scene, not a blank/garbage
     buffer. **Sanity is now perfect, not just small:** reconverge (ON→ON) sumAbsDiff=0 EXACTLY,
     null-control (same value twice) sumAbsDiff=0 EXACTLY — the noise from the render-loop method is
     fully eliminated. **Result: kernelMaxScale 1→4, 1→8, and strength 1→2 each produced
     `meanAbsDiff=0` across the WHOLE frame** (Hospital, tour-path pose `poseAt(0.8)`), tested at BOTH
     grazing elevation=6 (`_sunArcStep(1.0)`) AND non-grazing elevation~40 (`_sunArcStep(0.3)`) — same
     zero result at both, ruling out "wrong elevation" as the explanation.
   - **Why zero, root-caused via direct shader inspection, not guessed:** built
     `probe_mask_visualize.js`, a shader clone of `_srFrag`'s edge-detect that outputs `sC` (raw
     shadow term) and `edge` (the restore mask) as pixel colour instead of the final blend, sharing
     the SAME frozen uniforms. Confirmed `canRestore`'s preconditions are all true this frame
     (`sunCastShadow/hasShadowMap/sunShadowRestoreEnabled` all true) and the mask genuinely fires:
     `edgeMax=255`, 52,620/1.44M pixels (3.7%) have `edge>10` — real shadow boundaries ARE present
     and ARE being detected. Extended the probe to also output `kScale/kernelMaxScale` as a channel:
     at those firing pixels, **`kScale` averages 91% of its max (0.25-1.0 range, mean 0.91)** — the
     per-pixel grazing-incidence widening genuinely engages and reaches near its 4x cap, exactly as
     designed. **So why does widening the search radius change nothing?** `edge` is built from
     `max(abs(sC - shadowAt(tap)))` across 8 taps, and both `sC` and every `shadowAt(tap)` are hard
     `step()` outputs — strictly 0.0 or 1.0, never a fraction. `edge` is therefore mathematically
     BINARY at the pixel level: the instant ANY one tap disagrees with the center, `edge=1`, full
     restore, regardless of how many taps agree. **This falsifies the original fix rationale written
     earlier in this section** ("the 8-tap mask fires PARTIALLY... a weak fraction, not 0 or 1") — that
     was written from the symptom (weak plateau contrast in a real bake) before the shader math was
     read this closely; the mechanism cannot produce a partial per-pixel value at all. What a wider
     kernel actually changes is SPATIAL: which pixels register `edge=1` in the first place (a pixel
     5-14px from a true boundary that a narrow 4px kernel can't reach, but a widened one can). On
     THIS scene, at the pixels where `edge` already fires, it already fires at kernelPx=4 (the
     un-widened base) — there is no ring of "boundary within 14px but not within 4px" pixels for the
     widening to newly catch, so nothing changes when the cap is raised.
   - **Honest bottom line: the fix's own logic is verified sound (kScale computes correctly, engages
     at grazing incidence, is not a no-op in the shader), but this session found ZERO scene/pose where
     it produces a measurable image difference** — meaning there is still no positive evidence it
     helps the user's original complaint (soft floor-slab shadows in a real bake), only evidence it
     doesn't break anything and isn't dead code. The gap is most likely POSE-SPECIFIC: the real
     baseline (`ground` contrast 40.1 vs `wall` 103.4, §above) came from an actual user-recorded
     MaxQ Cinema MP4 (Hospital Day 412/412), not a synthetic headless pose — the erosion band that
     baseline shows must be wider than 4px SOMEWHERE in that real bake, or the ground/wall contrast
     gap wouldn't exist pre-fix. This session's synthetic tour-path pose (`poseAt(0.8)`, same
     building) apparently never crosses a boundary that wide, at either elevation tried. **Next step,
     if this is picked up again: stop hand-deriving poses and instead run this fixed build through an
     ACTUAL MaxQ Cinema bake (or get the user to run one) and re-apply the SAME ffmpeg+`
     measure_shadow_edge.py` methodology used for the pre-fix baseline** — that is how the baseline
     numbers were obtained and is the only way confirmed so far to reproduce the real symptom; more
     headless bbox/tour-pose engineering has diminishing returns after this session's three failed
     framings (§below) plus this one's zero-signal result.
   - **Two bbox-pose attempts that FAILED before the tour-path pose worked, don't repeat them:**
     (a) `dist=span*1.3` from centroid (the "establishing shot" distance) put the building far enough
     away that a fixed `kernelPx=4` screen-space kernel already covers a huge world-space footprint,
     saturating the shader's `edge` mask to ~binary regardless of `kScale` — measured deltaPct=0, a
     zoom artifact, not a real null result. (b) `dist=span*0.75` from centroid put the camera INSIDE
     the campus bbox (a large, irregular multi-wing footprint — "0.75x the diagonal span from
     centroid" is not reliably outside an elongated shape), producing clipped/backface-visible
     wireframe-looking artifacts that were briefly mistaken for a streaming/DLOD placeholder issue
     (it wasn't — `§CONTRACT_CHECK streamed=63182 orphans=0` had already fired well before this pose
     was tried). The fix that actually worked: stop hand-deriving a pose from the bbox at all, call
     `A.cinemaPathPlan(24)` and use `plan.poseAt(0.8)` — the same formula the real MaxQ film flies —
     screen-verified via a cheap pre-AO screenshot before committing to a full 24-frame AO converge.
   - **Ruled out this session, don't re-chase these:** (a) plain camera-viewing-angle-only
     explanation (ambiguous which direction it cuts — superseded by the light-incidence-angle
     explanation above, which is unambiguous); (b) TAA history / N8AO depth-dirty state carrying
     over between consecutive MaxQ-loop stills — read `viewer/lib/TAARenderPass.js` and
     `effects.js`'s `_startStillAOPhase`/`_stillAODepthDirty` directly, both correctly reset every
     still, not the bug; (c) the per-frame `§STILL_REFINE cancelled (interaction)` / `§PHOTO_AO off`
     lines the user sees in EVERY MaxQ frame's log — read `cinema_maxq.js`'s actual loop order,
     this is normal `§MAXQ_STAGE_KEEP` teardown that fires AFTER `_captureFrame()` already grabbed
     that frame's pixels, not a bug that discards the shadow before capture; (d) user's "sunlight
     passing through not-yet-appeared 4D structure" hypothesis — checked against a real live log's
     `§SHADOW_FRONTIER_AT_CAPTURE`/`§PHOTO_SHADOW_FRUSTUM_COVERAGE` lines, `castShadowFalse=0` and
     `outsideFrustum=0` throughout the portion checked, force-reassert was actively catching/fixing
     drift every frame — no evidence of it being the cause, though the "last bit" (near-complete
     structure) of a run was never actually reached in the checked log, so this isn't fully closed
     either, just not supported by what was checked; (e) a full-video 4D construction-tour MP4 (not
     a single frozen still) IS valid evidence for this bug — `cinema_maxq.js` calls
     `A.startStillRefine()` on every captured frame of a MaxQ Cinema run, not just a dedicated Alt+S
     still, so the whole shadow-restore pipeline runs on every frame of a tour bake too; (f) dark
     blobs with bright specular highlights on the ground in some frames are rock/crater DECAL
     geometry, not shadows — don't re-measure those as shadow edges.

Closed this session, confirmed working live: §CAM_LIGHT (camera fill-light) and §SUN_ARC
(noon→dusk sweep) — see their one-line status below, full story in the archive.

## §WEATHER_ADVANCED_MODE — SPEC ONLY (2026-08-12, user ask: "can we incorporate what they have as an advanced mode during baking?") — NOT STARTED, NO CODE

**Context for the ask.** Twinmotion and Lumion both ship weather (rain, snow, fog, wind, seasons;
Twinmotion adds volumetric clouds) AND 4D construction phasing in the same tool, so "a film with
weather while the 4D reveal runs" is an existing, documented competitor workflow, not white space.
This viewer currently has **no weather at all** — the sky is a clear-sky Preetham model with no cloud
geometry (see the §PHOTO_SKY comment in `effects.js`, which says so explicitly).

**The surprise on inspection: most of the hard half is already shipped.** Verified against
`origin/main` before writing this — nothing below is assumed:

| already live | where |
|---|---|
| Scene fog colour + density saved, re-tuned for the shoot, restored on teardown | `effects.js` `_photoFogColorSaved` / `A.scene.fog.density = Math.min(..., 0.00006)` |
| **Wet ground** — 6 seeded circular puddles, per-puddle roughness drop + diffuse darkening via a ground-material `onBeforeCompile` injection, plus `§GROUND_WETNESS_OVERRIDE` | `effects.js` §PHOTO_PUDDLE |
| Real photographed HDRI env, swapped in at staging and restored at teardown, loaded by filename from `viewer/textures/hdri/` | `effects.js` §LAYER2_HDRI (`belfast_sunset_puresky_1k.hdr` — currently the ONLY file in that dir) |
| Sun travel 55°→6° per frame of the bake | `effects.js` §SUN_ARC `_sunArcStep` |
| Staffage/entourage trees with real spatial placement + ground seating | `effects.js` §STAFFAGE |

So the gap vs Lumion/Twinmotion is exactly four things: **clouds, precipitation particles, snow
accumulation, and an overcast lighting state.** Everything else a weather preset needs is wired.

**Recommended order — cheapest real gain first. Do NOT start at clouds.**

1. **Phase 1 — an "Overcast / after rain" preset. Highest realism-per-line in the whole list, and it
   needs no new rendering technique at all.** It is a preset over knobs that already exist: add one
   overcast `.hdr` beside the sunset one (the loader takes a filename in a single place), raise fog
   density above the current `0.00006` cap, drop `A.sun.intensity` and lift hemi/ambient for diffuse
   sky-dome light, and leave the shipped puddles on. **The structural reason this is the right first
   move:** the one genuine conflict between an HDRI sky and §SUN_ARC is that an HDRI has its sun
   baked at a fixed position while the arc sweeps — and an overcast sky has *no visible sun disc*, so
   that conflict simply does not arise in this preset. Free pass on the hardest integration problem.
2. **Phase 2 — rain streaks.** GPU points / instanced quads in a camera-locked volume, additive.
   Modest cost. Deliberately AFTER Phase 1: rain particles over dry ground read fake, and the wet
   ground that sells them is the part already built. Rain without Phase 1 is the wrong order.
3. **Phase 3 — clouds.** Either a scrolling cloud-layer texture on a dome (cheap, moves, fake
   parallax) or raymarched volumetrics (real, expensive). Budget reality from this file's own Layer 4
   note: N8AO alone already costs ~317 ms/frame extra on an RTX 4060, and volumetrics are the same
   order — so this is bake-only and will lengthen a bake noticeably. A cloudy HDRI gives photographed
   clouds for free in reflections but cannot move or parallax, and its baked sun WILL fight §SUN_ARC
   in any non-overcast preset.
4. **Phase 4 — snow accumulation.** The payoff shot for "seasons", and the biggest lift: needs an
   up-facing-normal blend in the triplanar shader (`streaming.js` Layer 3). Snow as particles alone,
   with no accumulation on roofs and sills, will not read.

**Honesty constraints on whatever ships.**
- This closes the "no weather at all" gap. It will not match Lumion's weather quality, and the
  positioning must not claim it does — the durable differentiator remains *the film and the 4D
  sequence are derived from the IFC itself, in a browser, with no export round-trip*, not atmosphere.
- `docs/BIMUserGuide.md` §"Sun, sky and shadow while the film records" currently states in print:
  *"There is no weather: no rain, no snow, no cloud shapes."* That sentence must be updated in the
  same PR as whatever phase ships, or the manual becomes false.
- Advanced mode must be **opt-in and bake-only**, like Alt+J/SSGI — never a default that slows every
  film or changes an existing bake's look without being asked for.

### §SUN_START_TIME — one setting: start time. Fixed 6-hour film. (user spec 2026-08-12, reaffirmed) — FEASIBLE, NOT STARTED

**User decision, final:** a **fixed 6-hour duration** and **one setting: the start time**. Default
**12:00**. No span setting, no dusk anchoring, no solar calculation. The film runs
`startTime → startTime + 6h`.

**What each setting produces** (hour → elevation via the sine Time Machine already uses,
`time_machine.js` `applySunCycle`: `elevation = sin((t/24)·2π − π/2)·90` — no new maths):

| start | end | sun elevation | shadow length / height |
|---|---|---|---|
| 06:00 | 12:00 | 0° → 90° | sunrise → overhead |
| 08:00 | 14:00 | 45° → 77.9° | 1.00 → 0.21 |
| 09:00 | 15:00 | 63.6° → 63.6° | 0.50 → 0.50 (peaks overhead mid-film) |
| 10:00 | 16:00 | 77.9° → 45.0° | 0.21 → 1.00 |
| 11:00 | 17:00 | 86.6° → 23.3° | 0.06 → 2.32 |
| **12:00 (default)** | **18:00** | **90° → 0°** | **0 → sunset** |

**The one range bound, and it is mechanical, not a preference:** with a fixed 6-hour span, any start
later than 12:00 ends after 18:00 — below the horizon, i.e. the film ends in the dark (13:00 start ends
at −23.3°). So the setting's range is **06:00–12:00**. That is the whole rule: *the film is six hours,
so noon is the latest you can start.*

#### Implementation — deliberately small

- `PHOTO_SUN_ELEVATION_START` and `PHOTO_SUN_ELEVATION_END` stop being constants and become
  `elevationForHour(startHour)` and `elevationForHour(startHour + 6)`. `_sunElevationAt(tNorm)` keeps
  interpolating between them exactly as it does now. `_sunArcStep` is untouched.
- Setting range 06:00–12:00, default 12:00. One control.
- Persist the chosen start time with the saved Cinema path, so re-baking an old plan gives the same
  film.
- `§PHOTO_SUN_SHADOW_REACH` (frustum) and `§PHOTO_SHADOW_BIAS_SCALE` (grazing term) are computed once
  at staging from a single elevation — they must use whichever end of the chosen window is **lower**,
  since with a settable start that is no longer always the end frame (e.g. a 06:00 start is lowest at
  the START). One `Math.min`, no new machinery.

#### Two consequences of the default worth recording (statements of fact, not objections)

1. The default **changes today's shipped look**: 55° → 6° becomes 90° → 0°. The opening is an overhead
   sun (short shadows — what `PHOTO_SUN_ELEVATION_START`'s own comment describes as reading flat), and
   the film now ends at the horizon rather than 6° above it.
2. At the 0° end, `§PHOTO_SUN_SHADOW_REACH`'s existing `_elevDeg > 0.5` guard skips frustum widening
   (`height/tan(0)` is unbounded). Practically the last frames are at sunset and near-dark, so there is
   nothing to widen the frustum for — the guard already handles it correctly, no change needed.

#### Witness

1. Assert the logged per-frame elevation matches `elevationForHour` for the chosen window, first and
   last frame, at three start times.
2. Assert the setting rejects/clamps a start later than 12:00.
3. Re-run `scripts/witness_shadow_bias_ab.js` at the window's lowest elevation — shadow contrast there
   must be no worse than today's measured −15.2 mean luminance drop.

#### Not in this spec

Real solar geometry (site latitude/longitude + date). It would make the hour label literally true and
make shadows rotate as well as lengthen, and it reuses this same setting — but it is explicitly out of
scope here. Recorded only because the measured coincidence is worth keeping: on 12 Aug at London's
latitude real solar noon is 53.6°, within 1.4° of the 55° hand-tuned into the current constant.

### Separation + re-render architecture (answered 2026-08-12, verified against `origin/main`)

**Q: keep it separate so it can't disturb the working bake — and can we render over the same frames,
or must it be anew?**

**Separate: yes, and the pattern already exists — copy it, don't invent one.** Alt+J/SSGI is already
opt-in and deliberately excluded from the bake path. Advanced weather is the same shape: one flag read
at `_applyPhotoStaging` time, plus a `_weatherStep(tNorm)` called beside the existing
`_sunArcStep(tNorm)` in `cinema_maxq.js`. Flag off ⇒ every existing code path executes exactly as it
does today, byte-identical output. No new architecture needed.

**Anew, not over the same frames — and the reason is structural, not a preference:**
- `cinema_maxq.js` `poseAt(tNorm)` is a **pure function of tNorm** over the saved plan
  (`plan.poseAt(tNorm)` with the §CPE_CLIP window remap as the ONE place the clip is applied), and the
  4D buildup order is derived from that same `plan.poseAt`. So re-running a saved plan reproduces the
  **identical** film frame-for-frame — same camera, same reveal — with only the atmosphere different.
  That is a re-shoot of the same take, not a similar one.
- The saved frames cannot support the alternative. `_captureFrame()` renders the composer, draws into a
  2D canvas, composites the room title / day counter, and `toBlob('image/webp', 0.92)` — **flat RGB, no
  depth, no normals, no motion vectors.** A flat 2D rain overlay could be composited onto that;
  volumetric fog, clouds with correct occlusion, wet reflections and — decisively — **any shadow
  change** cannot. Compositing cannot fix a shadow, which is the thing being asked for.

**⚠ CORRECTION (same day, before anyone scoped against it): the IndexedDB frame store is NOT a cache
and gives NO second-bake speedup today.** An earlier note in this section called sub-range re-rendering
a free capability. It is not free — it is achievable, which is a different claim. Verified in
`cinema_maxq.js`:
- one fixed store, `IDB_NAME = 'bim_ootb_cinema_maxq'`, `IDB_STORE = 'frames'` (line ~412);
- **`await _idbDelete()` at the START of every bake** (line ~1124), immediately before `_idbOpen()`;
- **`await _idbDestroy(db)` at the END** (line ~1458).

So the frames are a scratch buffer that exists only between capture and mux, wiped at both ends. **A
second bake today costs exactly what the first did.** Nothing is reused.

**What IS achievable, and its real limit.** `poseAt(tNorm)` determinism means any frame index is
independently reproducible, so frames COULD be kept — keyed by (plan hash, frame index, settings hash)
— and an advanced pass could then re-render only the frames it actually changes and re-mux the rest.
But note where that does and does not pay:
- **Whole-film weather change: no saving at all.** Every frame's pixels change, so every frame is
  re-rendered regardless. An advanced bake costs a full bake plus whatever weather costs per frame.
  The expense is the per-frame `_composer.render()` + SSAA/N8AO + `toBlob`, not the muxing.
- **Sub-range change: real saving.** The dusk-shadow case (re-shoot only the last ~20% of frames at a
  higher arc-end elevation) is exactly the shape that benefits, and is the case worth building for.

**⚠ Load-bearing constraint — do not simply delete the deletes.** The start-of-bake `_idbDelete()`
exists because a leftover/blocked store caused a real, diagnosed hang: "stuck right after
§MAXQ_PREVIEW done, zero further lines" (LTU, v810/MAXQ v7 — see the §MAXQ_IDB comment block at
line ~510, which documents the three guards added: track+close our own connection, purge a pending
delete BEFORE opening, and race the open against `IDB_OPEN_TIMEOUT_MS`). Any frame-persistence design
must keep those guards intact and add explicit invalidation + a storage budget (360–576 webp frames at
bake resolution is not free disk), not remove the cleanup that fixed a shipped bug.

### The dusk shadow at the end of the film — not a bug, and weather will NOT fix it

User observation on the landed mp4: the shadow stops working toward the end, "hardly noticeable."
That is the cosine law, not a defect. `PHOTO_SUN_ELEVATION = 6` is the arc's end elevation, and direct
sun on horizontal ground scales with `sin(elevation)` — `sin(6°) = 0.105`, about a tenth of the noon
term. A shadow is the *removal* of direct light, so when there is barely any direct light left there is
barely any shadow to see. **Measured, same building, same session, same fix:** mean luminance drop on
shadowed pixels was **−32.7 at 55° vs −15.2 at 6°** — less than half the contrast (scratchpad
`witness_shadow_bias_ab.js`).

Weather mode makes this WORSE, not better: an overcast preset removes directional shadows entirely.

**The actual lever is the arc's end elevation, not the atmosphere.** Ending at ~12–15° instead of 6°
roughly doubles the direct-light term (`sin 12° = 0.208`, `sin 15° = 0.259`) while still throwing long
shadows (`1/tan 12° = 4.7×` building height). **Put that inside advanced mode**, not in the shared
constant — the default film's look then stays exactly as shipped, honouring "separate so as not to
disturb this." Measure the contrast at the candidate elevation with the existing A/B witness before
committing to a number; the sine law predicts ~2× but that is a prediction, not yet a measurement.

**Priority flag, stated once and then it is the user's call.** `feedback_schedule_accuracy_over_movie_polish.md`
(user ruling 2026-08-05) puts movie-maker polish behind 4D schedule accuracy, and
`prompts/4D_SCHEDULE_PERFECTION.md` still carries an open punch list. Weather is polish by that
definition. Worth deciding explicitly rather than drifting into it.

## HONEST VERDICT (read this before anything else)
**No — this will not be "truly photorealistic" in the indistinguishable-from-a-photograph sense.**
It CAN get meaningfully closer than flat-CG look — plausibly "good archviz render" quality (the
SketchUp+Enscape / Twinmotion tier) — but not camera-photograph quality. Three structural reasons,
not effort/time reasons — more budget doesn't remove them:
1. **The geometry itself is idealized.** IFC-derived meshes have no real-world imperfection — no
   chips, stains, dust, slight panel misalignment, weathering.
2. **Materials are auto-assigned by class, not hand-tuned per surface.** Even with a real texture
   library, a script picking "concrete" for every `IfcSlab` can't replicate an artist choosing
   exactly the right weathered-concrete variant for one specific wall.
3. **No per-shot human grading.** An automated "press a key, get a still" pipeline can't do the
   manual exposure/color/DoF/composition tuning a professional render gets — it's a batch process,
   not an art director.
None of this means the effort is wasted — flat-CG to good-archviz is a real, visible, worthwhile
jump. Just don't scope or promise beyond it.

## STATUS — Layers 1-3 shipped and are baseline behavior; Layer 4 (GI) opt-in only
Full original spec (triplanar shader sketch, texture sourcing, technical approach) is in the
archive if ever needed again — kept out of this file because all three are long since shipped and
live, confirmed as recently as today's witness run (`§TRIPLANAR_PERF materials=12` and
`§LAYER2_HDRI_READY belfast_sunset_puresky_1k` both fired on a real load, 2026-08-11):
- **Layer 1** (Alt+S TAA still-refine, 16-sample jittered accumulation) — shipped, baseline.
- **Layer 2** (real photographed HDRI env, Poly Haven CC0) — shipped, baseline.
- **Layer 3** (triplanar PBR diffuse+roughness on dominant envelope classes) — shipped, baseline.
- **Layer 4** (GI/bounce light): baked lightmaps and full path-tracing both ruled out structurally
  (no UV2 infrastructure; `InstancedMesh`/`BatchedMesh` incompatibility) — SSGI shipped once as the
  DEFAULT, hit real bugs (ghosting, noise/transparency), reverted to default OFF, kept **opt-in only
  via Alt+J**. Deliberately EXCLUDED from the MaxQ/Cinema Orbit bake path — N8AO alone already costs
  ~317ms/frame extra on an RTX 4060 ("a recording with GI active would be a ~3fps slideshow").
  User ruling 2026-08-11: do not pursue further unless another concrete innovation to test.

## NOT IN SCOPE (this spec)
- True photograph-indistinguishable output (see §HONEST VERDICT — structurally unreachable here).
- Baked lightmap GI (blocked — no UV2 infrastructure, separate project if ever pursued).
- Real path tracing on full buildings (blocked — InstancedMesh/BatchedMesh incompatibility).

---

## §LTU_FLOOR_FLICKER — MaxQ bake floor flicker on `LTU_AHouse` (2026-08-03) — CAUSE MECHANISM CONFIRMED, static-camera pixel proof shows NO flicker under isolated conditions (motion-coupled case still open), NOT fixed
User report: floor flicker in a successful MaxQ bake (MP4) on `LTU_AHouse`.

**Two hypotheses REFUTED with real evidence:**
1. **Z-fighting / meta-extracted DB mismatch** — a real `2.39999999` vs `2.39999961` divergence
   exists, but is dead data: `LTU_AHouse` serves in split-DB mode (`viewer/streaming.js` §6.9,
   `meta.db`+`geo.db`), and `extracted.db`'s value is never read on that path. Live-confirmed:
   `§GROUND_Y src=gf-storey-slab(VÅNING 1) z=2.40` matches `meta.db` bit-for-bit. Not systemic
   (Hospital: byte-identical in both files; Duplex: no meta.db, doesn't apply).
2. **DLOD swapping** — `dlod_nav.js:307` fully disengages DLOD for the entire bake
   (`app._maxqActive`), every frame. No swap-threshold oscillation is possible during a bake.

**Live suspect (mechanism-confirmed, NOT pixel-proven): transparent-sort instability** between
the ghost-ground fade (`cinema_maxq.js` `_ghostGroundAt()`, `m.transparent=!solid`) and x-ray
construction-staging (`time_machine.js` `_buildXrayElements()`, no slab exclusion) — both went
default-ON the same day as this report. Ground plane Z == ground-floor slab Z by construction
(`tools.js` `_calcGroundY()` reads the identical row). THREE.js's transparent-pass sort is a
function of camera-to-object distance; for two near-coincident semi-transparent surfaces, small
camera-position deltas frame-to-frame can flip which sorts first.

**Pixel-proof status, real GPU bakes (RTX 4060, `--use-gl=angle --use-angle=gl
--ignore-gpu-blocklist --enable-gpu` — swiftshader was measured ~45x too slow for this building
size, use the GL flags for any future LTU/Terminal/Hospital-scale headless witness):**
- First attempt (authored dive path): diff signal dominated by ordinary camera motion, inconclusive.
- **Static-camera Pass 1** (camera pinned, content NOT frozen): two large diff bursts, but spanning
  0-100% of frame height/width — matches this building's own logged reveal-pacing batches, not a
  ground-plane-height band. Camera motion isolated; content-population was not.
- **Static-camera Pass 2** (camera pinned AND construction cursor frozen at the exact
  `§GHOST_GROUND_TRIGGER_FIRED` threshold): diff traces a single smooth hump matching the ghost
  fade's own `smoothstep` formula analytically — **no alternating/oscillating signature found**
  under fully-isolated conditions. Rules out flicker from the opacity ramp alone or static-scene
  numerical instability — does **not** disprove the original camera-motion-coupled hypothesis
  (a fully static camera can't exercise "small camera-position deltas flip sort order" by
  construction — zero motion ⇒ provably stable sort, that's not evidence either way for a moving
  camera).
- Confirmed: no `renderOrder` is set anywhere on the ground plane or x-ray-staged elements
  (grepped the whole `viewer/` tree) — the sort-order collision precondition is real and
  unaddressed. A `renderOrder` fix, if the motion-coupled case is later confirmed, is genuinely new
  ground, not colliding with any existing convention.
- **Blocked, not abandoned:** reading the ACTUAL ground-floor slab's live `renderOrder`/
  `_tm_xrayStaged`/material state at the trigger moment needs the `BatchedMesh`/`InstancedMesh`
  per-instance index (there's no single per-slab scene node to traverse to) — not done, named as
  the concrete next step.

**Status: NOT FIXED.** Per this project's own no-screenshot/log-not-visual-proof rule, a
`renderOrder` fix should not ship without the pixel-level confirmation described above. Next
session: re-run the static-camera harness (`scratchpad/ltu_flicker_probe_static*.js` pattern) with
the camera pre-positioned at ground level near the slab, spanning the trigger window, WITH the
camera genuinely moving this time (small deltas, not fully static) to actually exercise the
motion-coupled hypothesis one way or the other.

---

## §CAM_LIGHT + §SUN_ARC — camera fill-light + noon→dusk sun sweep (2026-08-11) — CLOSED, confirmed working live
**§CAM_LIGHT**: short-range `THREE.PointLight` riding the camera during Alt+S/Alt+C staging.
Shipped `bim-ootb` PR #1284. User-confirmed working live, watching a real bake: "bright torch light
seems to follow camera is working."

**§SUN_ARC**: `PHOTO_SUN_ELEVATION_START=55°` ("high noon") sweeping to the existing dusk value
(6°, unchanged) across the film — `_sunArcStep(tNorm)` calling `A.updateSky()` every frame, forcing
`shadowMap.needsUpdate=true` since `updateSky()` doesn't touch the shadow map itself. Shipped PR
#1284, but hit **two real regressions same day, both landmines of the same kind**:
1. **Call-order bug** (PR #1284 as shipped): `_sunArcStep()` was called BEFORE
   `A.startStillRefine()`, which internally re-runs `updateSky(PHOTO_SUN_ELEVATION, ...)` (the fixed
   dusk value) as part of its own per-frame staging reset — every frame's swept elevation was
   immediately overwritten back to static dusk before capture. Fixed: moved `_sunArcStep()` to
   AFTER `startStillRefine()`. PR #1288.
2. **SW cache-version miss, TWICE in the same session on the same file:** #1284 edited
   `cinema_maxq.js`/`effects.js`, both in `sw.js`'s `PRECACHE_ASSETS` (cache-first, keyed by
   `CACHE_VERSION`) — shipped without bumping the version, so already-installed PWAs kept serving
   stale code no matter what was merged. Caught and fixed for #1284 (v978→v979, PR #1285) — then
   **#1288 made the identical mistake** (touched `cinema_maxq.js`, zero version bump), which is
   exactly why the user's live retest still showed no arc after #1288 supposedly fixed it. Fixed:
   v980→v981, PR #1289. **Lesson, sharpened: this rule needing to be caught twice in one day means
   it isn't self-enforcing from memory — treat "bump CACHE_VERSION" as a hard pre-merge checklist
   item for any `cinema_maxq.js`/`effects.js` diff.**

**Confirmed working, sandbox witness (not eyeballing — headless Puppeteer, isolated worktree, real
merged code, log read after the run):** `§SUN_ARC_STEP` fired `elevation=55.0/42.8/30.5/18.3/6.0`
at `tNorm=0/0.25/0.5/0.75/1`, exact linear sweep, cross-validated against `A.sun.position.y` read
independently from live scene state (fell `4095.76→522.64` in lockstep — the sun object genuinely
moves, not just the printed number). **User confirmed live on a real bake same day: "sun is
working."** Tuning constants (`CAM_LIGHT_INTENSITY=3`, `PHOTO_SUN_ELEVATION_START=55`) are
first-pass, unmeasured guesses — whether they look RIGHT (not just whether they run) is still
subjective/unverified, not a bug.

**Instrumentation shipped for ongoing verification (PR #1290, v981→v982), no logic changed:**
`§SUN_ARC_STEP tNorm=... elevation=...` on every arc step (direct elevation readout — the older
`§PHOTO_SHADOW sunDist=...` line is camera-target distance, not elevation, and is a misleading
proxy). `§PHOTO_SHADOW_FORCE_REASSERT visMeshes=... flippedOn=...` on the forced reassert that
fires once per MaxQ-captured frame right before capture.

## §SHADOW_FRONTIER — shadows on in-progress/ghosted construction elements (2026-08-11) — OPEN, mechanism traced, no proven bug, LOW PRIORITY (user: "nice to have if free")
User report: shadows not affirming on in-progress constructed beams. Later clarified: specifically
whether interior sun/shadow interplay through open (not-yet-enclosed) construction gaps tracks
4D progress correctly, or fights with Alt+S staging's per-frame teardown/rebuild.

**Traced the full mechanism, found no provable code bug** (unlike §SUN_ARC above, which was a
clean call-order mistake). `time_machine.js:1439-1473` (`renderAtTime`'s per-mesh shadow-flag
block): frontier (actively-installing) meshes get `castShadow = !!app._shadowOn` — gated on the
SEPARATE Sunglass toggle, almost certainly `false` during a MaxQ bake; already-placed non-staged
meshes get `castShadow=false` UNCONDITIONALLY every tick (`§S259`). Both look like the reported bug
— BUT `effects.js`'s `_reassertPhotoShadowCoverage(force=true)`, called from `_finishStillRefine()`
at the end of every captured frame's accumulation, does an unconditional full-scene traverse
setting `castShadow=receiveShadow=true` on every visible mesh, no exception for frontier/staged —
runs AFTER the construction-tick stomp and BEFORE the frame is captured. On paper the loop closes.

**Sandbox witness attempt (2026-08-11):** ran a headless Puppeteer witness calling the real shipped
`A._sunArcStep()`/`A.toggleStillRefine()` directly. Confirmed both new log lines fire correctly with
sane, cross-validated numbers — but that run had **no active Time-Machine construction playback**,
so there were no frontier/staged elements to stomp in the first place. `flippedOn=0` there means
"nothing needed fixing," not "the stomp-then-correct cycle was exercised and passed." A follow-up
witness (driving the TM cursor through two points mid-late in the schedule via `window.tmSetCursor`/
`window.tmGetState`, to actually create staged elements and read their `castShadow` before/after)
was scoped and scripted (`scratchpad/witness_shadow_construction_interplay.js`, not run — 2+
still-refine cycles under swiftshader software rendering, ~126s each measured, so several minutes
total) but **deprioritized mid-session per user ruling: not serious, nice-to-have only if free.**

**Ran the script (2026-08-11, revisited then re-closed same session).** Result: inconclusive, not
negative — the test itself was flawed, not the shadow mechanism. `snapshot()` counted meshes with
`o.isMesh && o.userData.guid`, which returned **zero** at both T1 and T2 (`T1_STOMPED guids=0`,
`T2_STOMPED guids=0`) — this building's geometry is entirely `BatchedMesh`/`InstancedMesh`
(confirmed separately in the §LTU_FLOOR_FLICKER section above), so the individually-meshed
population this script checked never existed to measure. Real finding, though: `§XRAY_EDGES
staged=0/6880` — for HHS_Office_Federated's actual derived build order, the x-ray-ghost mechanism
never triggers at all (no element's support carrier ever finishes after its own reveal), so that
specific "ghosted in-progress" visual state may not even occur in this building's data. Second
cursor-advance cycle (T2) never completed within its 180s budget — resource contention with T1's
own still-running AO tail (194.976s), a script sequencing gap (didn't wait for AO settle before
advancing), not evidence of anything broken.

**Closed 2026-08-11, not pursuing further** — then REOPENED same day when the user hit a sharper,
more specific version of the same underlying problem while actively baking. See
§MAIN_BUILDING_SHADOW below for the full reopened investigation, current status, and the concrete
next step for a fresh session (`if ever revisited` above is superseded — it WAS revisited).

## §MAIN_BUILDING_SHADOW — main building casts NO shadow at all; skyline props + Time Machine's native Shadow mode both DO — ✅ SOLVED 2026-08-12 (PR #1302): shadow.bias is normalised depth, so -0.0005 meant 9.87 m here vs 0.305 m in the working path
User's own established facts (do not re-litigate, do not re-verify — treat as given):
- The main building (HHS_Office_Federated) casts **no shadow whatsoever**, at any point in a
  MaxQ bake, confirmed repeatedly across several fresh live bakes same session.
- The decorative skyline silhouette props (`_buildPhotoProps()`, simple `THREE.Mesh` boxes) DO
  cast a visible shadow, in the SAME bakes, SAME scene.
- Time Machine's own native Shadow mode (`A.toggleShadow`, tools.js, the 'h' pill — a completely
  separate system from PHOTO_SHADOW) already renders shadows correctly and always has.
- Rejected explanations, do not re-propose: dense/thin closely-packed geometry needing a
  different shadow bias (guessed, never verified, user explicitly rejected — "IT IS NOT DENSE").
  Ghost-ground opacity ramp (real mechanism, real log evidence, but user rejected it as a pivot
  away from the actual ask — the differential is main-building-vs-skyline, not early-vs-late).

**Shipped this session (all real, all self-verified before shipping, all still live) — do NOT
re-diagnose these, they are closed and working:**
- PR #1293 `§PHOTO_SUN_SHADOW_REACH` — shadow frustum now widens at low sun angles so the
  building's own long dusk shadow doesn't get clipped (was a real, separate, now-fixed bug).
- PR #1295 `§PHOTO_SHADOW_TARGET_CENTRE` — shadow camera now aims at the real building bbox
  centre via `A.ifc2three()`, not wherever the view camera happened to be looking (was a real,
  separate, now-fixed bug — same failure shape as the already-fixed `§CINEMA_PIVOT`).
  Instrumented in #1296 (`§PHOTO_SHADOW_TARGET` log).
- PR #1298 `§PHOTO_SHADOW_FRUSTUM_COVERAGE` — real `THREE.Frustum` test proves 100% of casters
  are geometrically visible to the shadow camera at every angle tested (noon AND dusk). Confirmed
  live on real bakes: `inFrustum=170+ outsideFrustum=0`, every single frame, no exceptions.
- PR #1299 — shadow map resolution doubled 2048→4096 for the bake-only path (was washing out
  small rooftop-scale detail; unrelated to the main-building-zero-shadow problem but a real fix).
- PR #1300 `§SHADOW_FRONTIER_AT_CAPTURE` — real `castShadow` check on the actively-installing
  (frontier) geometry, read at the exact moment each frame is captured, both for individually-
  meshed AND `BatchedMesh`/`InstancedMesh` objects (batch-wide flag, the finest grain this
  renderer allows). Confirmed live on 24+ consecutive real captured frames: `batchCastShadowTrue`
  exactly matches `batchObjsContainingFrontier` every time, `batchCastShadowFalse=0` throughout.

**So: castShadow flags ✓ (both frontier-specific and the general ~170-mesh population, proven
with real numbers across dozens of frames), frustum coverage ✓ (100%, both elevations), shadow
map resolution ✓ (doubled), shadow-camera target ✓ (aimed at the building, not drifting), deploy/
cache correctness ✓ (`§PHOTO_SHADOW_TARGET`/`§PHOTO_SHADOW_FRUSTUM_COVERAGE` both confirmed firing
on real live bakes). Despite all of this, the user's direct, repeated, live observation stands:
still no shadow from the main building.**

**Went one level deeper — read the actual bundled three.js source** (`viewer/lib/three.module.min.js`,
not the app code) to check whether `BatchedMesh`'s shadow-pass inclusion depends on something the
app never computes. Found: the shadow render loop gates each object on
`!object.frustumCulled || frustum.intersectsObject(object)`. Live witness
(`scratchpad/witness_boundingsphere_check.js`) showed every `BatchedMesh` in the scene has
`frustumCulled: true` (so it DOES go through the intersectsObject test) and
`geometry.boundingSphere: null` (the app's own streaming/batching pipeline never computes it) —
BUT the bundled three.js's actual `intersectsObject` implementation checks `object.boundingSphere`
(the BatchedMesh's own top-level one, confirmed present and valid) BEFORE ever falling back to
`geometry.boundingSphere` — so this specific mechanism, while a genuinely odd gap (the app never
computes a value three.js's own newer BatchedMesh-aware code path doesn't even need), is NOT the
cause. Ruled out with the literal engine source, not inferred.

**Status: genuinely stuck.** Every layer checkable from code and console logs has been checked and
comes back clean. This is not for lack of trying — it is the honest limit of what log-only
diagnosis can resolve here.

### ✅ SOLVED 2026-08-12 — `shadow.bias` is NORMALISED depth, not metres (PR #1302)

**Root cause.** `_enablePhotoShadows()` copied `A.toggleShadow`'s proven `A.sun.shadow.bias =
-0.0005` verbatim. three.js applies that constant in **normalised** depth — the bundled
`three.module.min.js`'s own `shadowmap_pars_fragment` does literally `shadowCoord.z += shadowBias`,
where `z` spans `[0,1]` across the shadow camera's `near..far`. Its world-space meaning is therefore
`bias × (far − near)`, and the two paths run wildly different depth ranges (both measured live on
`HHS_Office_Federated`, not derived on paper):

| path | sunDist | near | far | range | what `-0.0005` actually is |
|---|---|---|---|---|---|
| `A.toggleShadow` (tools.js — the path the user confirms has always worked) | 150 m | 7.7 | 617 | 609 m | **0.305 m** |
| `_enablePhotoShadows` (PHOTO_SHADOW) | 5000 m | 250 | 19998 | 19,748 m | **9.874 m** |

**32.4×.** The cause of the range gap: `toggleShadow` repositions the sun to `ctr + env*(0.8,2,0.6)`
(~150 m away) and derives `near/far` from that; the photo path *must not* move the sun —
`A.sun.position` is what `updateSky`, the Sky shader and the lensflare all read, so it stays at
`updateSky`'s `direction * 5000` — and then derives `near = sunDist*0.05`, `far = sunDist*4` from
5000 m.

**Why that erases exactly what the user saw.** A world-space bias of 9.87 m erases any shadow whose
caster→receiver separation *along the sun ray* is under ~10 m. That separation is
`casterHeight / sin(elevation)`, so at the film's 55° opening **nothing under 8.1 m tall cast
anything at all** — every rooftop fixture, and the near part of a short building's own ground
shadow — while the tall skyline silhouette props cleared it easily. That is the
main-building-vs-skyline differential, and it also explains "did not act in the early seconds"
(early = high sun = worst case) and "nor its roof where objects cast no shadow".

**Why every earlier check came back clean.** `castShadow`, frustum coverage, shadow-camera target
and map resolution were all genuinely correct — PRs #1293/#1295/#1298/#1299/#1300 fixed real bugs.
The bias governs the depth *comparison*, which none of those instruments measure.

**Fix (PR #1302).** Hold the WORLD-space bias instead of copying the normalised constant: floor at
`toggleShadow`'s own proven 0.305 m, raised to `texelWorld / tan(lowest arc elevation)` so grazing
dusk sun doesn't self-shadow the ground (acne) — `_enablePhotoShadows` runs once at staging while
`_sunArcStep` sweeps 55°→6° afterwards without recomputing this camera, so the bias has to be safe
at the worst angle the film reaches. Both terms computed from live values. New `§PHOTO_SHADOW_BIAS`
log line. Live on a real load:
`§PHOTO_SHADOW_BIAS worldBias=0.836m bias=-4.234e-5 range=19748m texel=0.088m grazeElev=6`.

**Proof — paired A/B, identical camera pose / sun / geometry, only `shadow.bias` changed:**

| elevation | px darkened | px brightened |
|---|---|---|
| 55° (film opening) | 1,665 | **0** |
| 6° (dusk) | 12,095 | **0** |

Zero brightened at either — the change only ever *adds* shadow. Post-fix, shipped code vs the old
`-0.0005`: 1,599 px darkened at 55°, 1,084 px at 6°, 0 brightened, isolated-dark-pixel fraction
8.3%/8.9% (low ⇒ contiguous cast shadow, not speckle). The dusk 12,095-vs-1,084 gap is the acne the
grazing term prevents: a flat 0.305 m sits below the 0.836 m texel depth-noise floor at 6°, so most
of that 12,095 was ground self-shadow, not building shadow. Witnesses (headless, numeric pixel
counts, no screenshot in the evidence chain), kept out of the session scratchpad so they don't rot:
`scripts/witness_shadow_bias_ab.js`, `scripts/witness_shadow_bias_postfix.js`. Both need a static
server on the bim-ootb tree (`PORT=<port> node scripts/witness_shadow_bias_ab.js`).

**Instrumentation defect found and fixed in the same PR:** `A.sun.updateMatrixWorld()` was missing
before `shadow.updateMatrices()` in the `§PHOTO_SHADOW_FRUSTUM_COVERAGE` block. `updateMatrices`
reads `light.matrixWorld`, **not** `light.position`, so that log could measure a stale sun —
observed `inFrustum=2 outsideFrustum=349` on one load vs `351/0` on a clean one, identical geometry.
The render was never affected (the renderer refreshes matrices before its own shadow pass), but the
log was not trustworthy as evidence. `time_machine.js`'s `applySunCycle` already did this.

**Lesson worth keeping:** a shadow constant copied between two lights is only portable if their
shadow-camera depth ranges match. `shadow.bias` is unitless; `shadow.normalBias` is the one in world
units. Any future path that reuses another path's shadow tuning must compare `far - near` first.

---

**The next step as named BEFORE the fix above (kept for the record — step 4's code-diff is what
found it, though the differential turned out to be the bias, not the `needsUpdate`/`updateMatrixWorld`
candidates guessed here):**
Time Machine's native Shadow mode (`A.toggleShadow`) is PROVEN to work. PHOTO_SHADOW
(`_enablePhotoShadows`, effects.js) is a DELIBERATE, DOCUMENTED reuse of the same underlying
mechanism (see this file's own earlier session notes: "§PHOTO_DUSK_SHADOWS: reuses time_machine.js's
own proven sun-cycle shadow mechanics... NOT reinvented"). Something in the two setups still
differs even though both end up setting the same flags — that differential is the thing to find,
and it needs a **controlled, same-camera-pose, same-building A/B pixel comparison** between the
two, not more flag-reading:
1. Load the building fresh, park the camera at a fixed pose facing the building's own base/ground.
2. Trigger `A.toggleShadow()` (cycle to 'grass' — real Shadow mode ON), capture the canvas, extract
   real pixel/luminance stats near the building's base (same numeric method already used
   throughout this file — mean/std/contrast in a defined region, NOT eyeballing).
3. Toggle Shadow back off, trigger PHOTO_SHADOW instead (`A.toggleStillRefine()`), same camera
   pose, same capture, same numeric extraction.
4. Compare the two numerically. If TM's pass shows a real contrast/darkness signature near the
   base and PHOTO_SHADOW's doesn't, THAT confirms the differential exists visually (closing the
   "is this even real" question definitively) — then diff the two code paths line-by-line
   (`A.toggleShadow` in tools.js vs `_enablePhotoShadows`/`_reassertPhotoShadowCoverage` in
   effects.js) for the one thing that differs beyond what's already been checked here: candidates
   worth checking first are `renderer.shadowMap.needsUpdate` timing/consumption order relative to
   the two systems' different render-loop integration, and whether `A.sun.target.updateMatrixWorld()`
   is being called at the right point relative to `shadow.updateMatrices()` in each path.
This is resourceful and does not require the user's own DevTools — it's a headless Puppeteer
canvas-capture + numeric pixel comparison, the same class of witness already used successfully
several times this session (see `scratchpad/witness_*.js` for the pattern).

### §MOVIE_SHADOW_TM — CONFIRMED GOOD BY USER, live GPU (2026-08-12)
User: *"shadows working great. Note that."* Movie-maker bake shadow strength now matches Time
Machine exactly. Confirmed on the user's own GPU run, numerically not by eye:
`§MOVIE_SHADOW_TM sun=4.400 ambient=0.785 hemi=1.257 fill=2.042 sunFillRatio=2.155` — identical to
TM native `4.4/(0.785+1.257)`. Was 1.245 (42% weaker) because the sun was scaled x0.7 while the fill
was scaled x1.21, and because §SUN_ARC animates the sun ANGLE every frame while the three intensity
scales are applied ONCE at photo-mode entry — so noon frames were lit with dusk values.
Shipped bim-ootb PR #1316, sw v1004. **Strength only** — PHOTO_SUN_COLOR, ambient/hemi colours,
exposure lift, fog, ground albedo, env-map boost, PHOTO_SUN_ELEVATION and both §SUN_ARC endpoints
deliberately untouched, so the dusk LOOK is unchanged. Do not "re-tune" these three scales without
re-checking the ratio against TM's 2.155 — the §MOVIE_SHADOW_TM log line exists for exactly that.

---

## §PHOTO_AO_TUNING — N8AO ambient-occlusion fold reads too dark/noisy during Alt+C bakes (2026-08-13) — TWO FIXES SHIPPED (bim-ootb PR #1331, #1334) + a real SW caching bug found+fixed (PR #1332), AWAITING USER VISUAL CONFIRM
User report: "during alt-c we apply alt-s which puts in shadow noise (alt-G) but it is too dark and
noise." Confirmed real and current on `bim-ootb` `origin/main` (@9d56919, clean worktree — the shared
`/home/red1/bim-ootb` checkout was found dirty/behind mid-session, NOT used for this read):

**Not the standalone Alt+G/GI composer** (`§GI_CINEMA_PRESET`, `effects_gi_poc.js`) — that one is
already excluded from bakes by default, per this file's STATUS section. It's a separate integration:
`effects.js` §PHOTO_AO (~line 3420-3465) builds its own `N8AOPass` inside the native composer, gated
only by `STILL_AO_ENABLED = true` (unconditional, no user toggle), driven from `A.startStillRefine()`
— the Alt+S entry point. `cinema_maxq.js`'s bake loop calls `A.startStillRefine()` on every captured
frame (warm-up + per-frame, `:1136`/`:1296`) and genuinely `await`s the full 24-frame AO converge
(`_waitFoldDone` polls `A._stillRefineBusy`, which `effects.js` only clears at `f >= STILL_AO_FRAMES`
— confirmed by reading the clear site, not assumed) before capturing. So every baked frame gets the
SAME converged AO quality as a manual Alt+S still, not a partial one — bar the rare `_unconverged`/
`§MAXQ_FRAME_TIMEOUT` case (30s cap per frame; worth checking a bake's own log for a non-zero count,
but not the routine explanation).

**First-pass fix attempted then RETRACTED, on-the-record for the next session:** initially proposed
retuning `STILL_AO_RADIUS`/`STILL_AO_INTENSITY` down. Wrong — missed the `§PHOTO_AO_TUNE` comment
sitting right at the definition (`effects.js:3432`, 2026-07-16): this EXACT radius=8/intensity=6 was
already real-GPU A/B tested at still quality (`PHOTO_AO_TUNE_r{8_i6,5_i4,3_i4,1p5_i3}_2026-07-16.png`)
and deliberately KEPT — the earlier "broad mottle" verdict was measured over LIVE NAVIGATION (raw,
unconverged single-frame AO), not the converged still/bake case, and smaller radii read as
near-invisible at whole-building establishing distance. Reverting it now would undo a tested decision
on no new evidence — exactly what this project's rules forbid. No code changed.

**Two better-grounded hypotheses instead, both consistent with "fully converged AO, still reads bad
in the film" and neither yet witnessed:**
1. **Temporal AO flicker/noise, invisible to a single-still A/B by construction.** N8AO's accumulate
   buffer resets on every camera/view-matrix change (confirmed, `effects_gi_poc.js` §GI_POC_GHOST_FIX
   comment, same underlying library). Each Alt+C frame is a NEW pose → AO reconverges from a fresh
   seed every time. Any one frame can individually match the 2026-07-16 still-quality look and still
   differ, pixel-for-pixel, from its neighbours' independently-seeded convergence — reading as
   shimmer/noise ACROSS the assembled movie, a failure mode a static PNG-vs-PNG A/B cannot show at
   all. This is the better fit for "noise" specifically.
2. **AO darkening compounds with §SUN_ARC's dusk sweep, a feature that postdates the AO A/B test.**
   `§SUN_ARC` (shipped 2026-08-11, this file, above) sweeps every Alt+C film from 55° noon to 6° dusk.
   AO darkening is multiplicative on scene radiance, so the identical AO curve reads far heavier on
   the dim back half of a film than on whatever single lighting condition the 2026-07-16 AO A/B was
   shot under — a joint condition (AO × dusk sweep) that was never re-validated together, because the
   sweep didn't exist yet when the AO tuning was tested. Better fit for "too dark" specifically.

**Not pursued further — superseded by a direct user ruling.** Both hypotheses above stayed open
questions; before either got a witness, the user gave a direct live verdict instead: "Alt-G too
dark... affecting Alt-S and movie." Per this project's own standing rule ("the look is the user's
to judge"), a live user verdict on darkness supersedes the 2026-07-16 A/B test it's overriding —
no synthetic re-proof needed before shipping, only a live round-trip to confirm after.

**SHIPPED (2026-08-13), bim-ootb PR #1331, branch `fix/photo-ao-darkness`, commit `81c58e5`:**
- `effects_gi_poc.js` (standalone Alt+G composer): `aoRadius` 8→4, `intensity` 6→2.
- `effects.js` §PHOTO_AO (the Alt+S fold, same pass Alt+C's MaxQ bake runs every captured frame):
  `STILL_AO_RADIUS` 8→4, `STILL_AO_INTENSITY` 6→2, `denoiseSamples` 4→8, `denoiseRadius` 6→12
  (toward n8ao's own library defaults — free at bake/still quality, an offline accumulate, not a
  real-time cost).
- `sw.js` `CACHE_VERSION` v1013→v1014 (`effects.js` is in `PRECACHE_ASSETS`).

**Verified live, real GPU (RTX 4060, headless Chrome, `Duplex_extracted.db`, sandbox-adjacent
worktree, not the shared checkout):** both passes confirmed running the new values end-to-end, not
just present in source — `§WITNESS_GI_CFG {"aoRadius":4,"intensity":2}`, `§PHOTO_AO start frames=24
radius=4 intensity=2`, `§PHOTO_AO done frames=24 totalMs=396 avgRenderMs=3.3` (24/24 converged, no
timeout, no page errors). **This proves the wiring, not the look** — merge/verify on the user's own
next round trip (Alt+G, Alt+S, and one real Alt+C bake), same discipline as every other "shipped,
not yet visually verified" entry in this file.

The two temporal/dusk-sweep hypotheses above are NOT ruled out or disproven — they're just no
longer blocking, since the fix path taken (lower the whole curve) helps both regardless of which
mechanism dominates. If "too dark" persists after this ships, revisit hypothesis 2 (§SUN_ARC
compounding) specifically, since intensity/radius alone don't touch it.

**Real deploy bug found and fixed in between (bim-ootb PR #1332, `sw.js` `CACHE_VERSION`
v1014→v1015):** user tested #1331 live minutes after merge and still saw the old
`radius=8 intensity=6` in the console log. Origin/CDN was already serving the fixed file
(confirmed via curl, `age: 2s`) — the staleness was 100% client-side. Root cause: the SW's
`install` handler used `cache.add(url)`, which fetches through the BROWSER's own HTTP cache: these
static assets serve `Cache-Control: max-age=600`, so a browser that loaded the old `effects.js`
within the previous 10 minutes silently re-precached that same stale response into the NEW
version's cache during install, even though `CACHE_VERSION` itself bumped correctly. This is a
real, repo-wide bug affecting every future deploy of any precached file, not specific to this fix
— switched to `fetch(url, {cache:'reload'})` + `cache.put()` to force a genuine network fetch on
every precache install. **Practical lesson for verifying ANY future `bim-ootb` deploy:** don't
trust `§BUILD_VERSION` alone as proof a specific file's content updated — cross-check the actual
behavior/log line the change should produce, the way this session caught it.

## §PHOTO_AO_SCALE — same day, user follow-up: "far off well lighted, up close dark" — SHIPPED (bim-ootb PR #1334), AWAITING USER VISUAL CONFIRM
After #1331 deployed (past the PR #1332 caching bug above), user reported the flat retune didn't
fix the real symptom: viewed from outside, the building interior reads bright at a distance and
goes dark up close. **This is a distance-SCALE problem, not an overall-strength problem** — #1331
only lowered the same flat curve, which doesn't touch it.

**Root cause:** both N8AO integrations set `aoRadius` as a FIXED WORLD-SPACE distance (metres, was
8 then 4). At `screenSpaceRadius` off (n8ao's default, never touched before), the shader samples a
neighbour position at that literal metre offset regardless of how close the camera is — up close,
a several-metre radius spans the ENTIRE visible wall (broad-area darkening, not contact shadow);
far away (whole-building establishing shot), the same radius is a barely-visible sliver (why it was
bumped from 1.5m to 8m in the first place, 2026-07-16, `§GI_POC_RADIUS_TEST`). No single metre
value is correct at both distances — this was always structurally present, just not diagnosed
until the user's distance-specific report.

**Fix:** `screenSpaceRadius: true` (n8ao's own docs, fetched and read live via WebFetch, not
guessed: "aoRadius represents the size... in pixels, recommended 16-64" in this mode, with
`distanceFalloff` "0.2 in most cases" — this app had never set `distanceFalloff` at all before,
leaving it at n8ao's library default of 1). `aoRadius` 4→**32 (pixels, not metres)**,
`distanceFalloff` unset→**0.2**, in both `effects_gi_poc.js` (Alt+G) and `effects.js` §PHOTO_AO
(Alt+S/Alt+C fold). `intensity` left at #1331's already-lowered 2 — orthogonal axis, not touched.
The effective world-space radius now self-scales with camera distance, so AO should read a
consistent size on screen whether the shot is a far exterior or a close interior.

**Verified live, real GPU (RTX 4060, headless Chrome, `Duplex_extracted.db`, same
sandbox-adjacent-worktree method as #1331):** both passes confirmed running
`screenSpaceRadius=true distanceFalloff=0.2 aoRadius=32`, `§PHOTO_AO` converges cleanly (24/24,
395ms, no timeout/errors). **Proves the wiring, not the look** — pixel radius (32) is a first-pass
value within n8ao's documented 16-64 range, not independently tuned against this app's real
geometry; verify live on the user's next round trip, specifically re-checking the far-vs-close
symptom this targets, before calling §PHOTO_AO_TUNING fully closed.

## §PHOTO_AO_EDGE — same day, 3rd round: darkness cleared, but "completely no edge corner shadow" — SHIPPED (bim-ootb PR #1335), AWAITING USER VISUAL CONFIRM
User confirmed #1334 cleared the darkness (both flat and far-vs-close), then reported the AO effect
had gone too far the OTHER way — no visible contact shadow at corners/edges at all. Asked directly
"what was the measure before" — table for reference:

| stage | radius | intensity | mode |
|---|---|---|---|
| original (since 2026-07-16) | 8m | 6 | world-space |
| PR #1331 (1st retune — "too dark") | 4m | 2 | world-space |
| PR #1334 (2nd retune — cleared, then "no shadow") | 32px | 2 | screen-space |
| PR #1335 (this) | 32px | 4 | screen-space |

**Cause:** `intensity` had been sitting at 2 (down from the original 6) since #1331 and was never
revisited when #1334 changed the radius mechanism entirely (metres → self-scaling pixels) — once
the broad-area over-darkening from the old mode was gone, 2 was too weak to read as any visible
effect at all. **Fix:** one controlled step, intensity 2→4 (not back to 6) in both integrations.
`aoRadius` (32px) deliberately left untouched — single-variable change, so the next round trip
isolates whether intensity alone was the gap or whether radius also needs a nudge.

**Verified live, real GPU, same method:** both passes confirmed running `intensity=4` (radius/mode
unchanged from #1334), converges cleanly (24/24, 395ms, no errors). **Proves the wiring, not the
look** — verify live: corner/edge contact shadow should now read as visible without reverting to
the original over-dark look. If still too weak or too strong, the next lever is intensity again
(not radius, until intensity is confirmed right) — keep changes single-variable per round.

## §PHOTO_REALISM_RETUNE — over-bright/over-reflective washing out shadow contrast + cool indoor read (2026-08-27, user-queued) — **2 of 3 items SHIPPED AND MERGED; item 1 still open**

> ⛔ **HEADING CORRECTED 2026-09-02 (queue item A-4 item 2). It used to read "SPEC ONLY, not built",
> which was already false when written down and got more false afterwards** — a session reading only
> the heading would have re-specced work that is live on `main`. Verified against `origin/main`
> @ `c8a6df61`, in the code, not from the PR titles:
>
> | item | state | evidence in the shipped tree |
> |---|---|---|
> | **1** brightness / staged-PL re-measure vs the post-`§TRINORM_LINEAR` baseline | ⛔ **NOT DONE** | `A._nightPLScaleStill = 0.5` unchanged (`viewer/tools.js:1100`), and no re-measurement against that baseline is recorded anywhere in this file or `NIGHT_AND_FIXTURE_LIGHTING.md` |
> | **2** `PHOTO_ENVMAP_BOOST` 3.0 → 2.0 (the room probe double-counts) | ✅ **SHIPPED** — bim-ootb **PR #1575**, merged `81599696` | `var PHOTO_ENVMAP_BOOST = 2.0;` (`viewer/effects.js:2643`), with the full history comment and `witness_envmap_retune.js` |
> | **3** warm camera fill, `CAM_LIGHT_COLOR` → the `0xffdca8` family | ✅ **SHIPPED** — bim-ootb **PR #1579** (`§TRIPLANAR_NORMAL`), which names "§PHOTO_REALISM_RETUNE item 3" in its own commit message | `var CAM_LIGHT_COLOR = 0xffdca8` (`viewer/effects.js:332`) — the spec text below still says `0xfff2e0`; that value is gone |
>
> **Scope note, so item 2 is not overstated:** #1575 changed the CONSTANT and added a witness. There
> was no separate "room-probe double-counting" code fix — double-counting is the *reason* the
> constant was stepped down, not a second thing that shipped.
>
> The item-1/2/3 prose below is the ORIGINAL spec and is left intact for the trail. Read items 2 and
> 3 as history, not as work to do.

**User's ask, verbatim:** *"we already got things too bright, shiny reflection, it be shadow effects
for realism"* — then, same session: *"Indoor lighting should have more warm lighting."* Studied
first, not invented: both trace to ALREADY-NAMED, unresolved loose ends in this project's own
history, not new problems.

**1. Brightness washing out shadow play — the exact complaint is already on record, only half-fixed.**
`NIGHT_AND_FIXTURE_LIGHTING.md §STAGED_PL_CUT` (2026-08-16) shipped a 0.5× night-fixture-intensity
cut after the user said staged lighting was *"too bright … it also wipe out the ground slab shadow
play during alt-c movie baking."* That section's own closing note flags the loose end: **a LATER
change, `§TRINORM_LINEAR`, made every triplanar surface brighter — "likely why 'too bright'
resurfaced now" — and was never re-measured against the 0.5× fix.** So the shadow-washout complaint
isn't a missing shadow feature; it's existing shadow work (AO retuned carefully above, real sun
shadow maps) getting drowned by brightness that crept back in through a different, later change.
**Named fix:** re-measure current staged brightness (real GPU, same `§PHOTO_AO`-style before/after
numbers) against the post-§TRINORM_LINEAR baseline; if confirmed too bright again, retune
`_nightPLScale` and/or the triplanar brightness gain — single-variable, one round-trip at a time,
same discipline `§PHOTO_AO_EDGE` above already used.

**2. "Shiny reflection" — the envmap boost was tuned for a bug that's since been fixed, never
retuned.** `§MIRROR_ROOM_PROBE` (2026-08-16) diagnosed but did not act on this: `PHOTO_ENVMAP_BOOST
=3.0` (a 3× reflection-intensity multiplier on every glossy/metal material) was tuned *before*
`§TRINORM_LINEAR` fixed metal's real darkness bug — that section's own words: **"the likely
'whitewash' source now that metal's real darkness bug is already fixed... the natural next step if
the room probe alone isn't enough (not yet judged live)."** Nobody judged it live; nobody retuned it.
**Named fix:** with the room probe (already shipped, gives materials a real local reflection instead
of just sky/HDRI) doing more of the reflection work now, `PHOTO_ENVMAP_BOOST` almost certainly no
longer needs 3×. Re-measure live, step it down in one controlled increment (matching `§PHOTO_AO_EDGE`'s
"one controlled step" precedent, not a guess-and-hope multi-variable change), re-check against the
same Clinic building that originally showed the "whitewash"/"jagged pipe" symptoms.

**3. Indoor daytime read is cooler than this project's own established warm palette.** The camera's
fill light — the dominant light source for interior walk shots, per `§CAM_LIGHT`'s own "bright torch
light follows camera" confirmation — is `CAM_LIGHT_COLOR = 0xfff2e0` (`effects.js:332`), barely off
pure white. This project already committed to a real warm tone elsewhere for exactly this purpose:
Night Mode's fixture palette uses `0xffdca8`/`0xffe4b5` (a proper amber) for warm-class fittings
(`tools.js`, downlight/sconce/pendant/surface). So the "cool indoor" read isn't a missing feature —
it's one specific constant sitting far cooler than the palette this codebase already uses everywhere
else for warm interior light. **Named fix:** shift `CAM_LIGHT_COLOR` toward the established
`0xffdca8`-family warmth (a tuning knob, not a redesign — same file, same variable, no new
mechanism), verify live that interior walk shots read warmer without over-saturating exterior/daylit
frames the same light also touches.

**Item 2 SHIPPED 2026-08-27/28 — bim-ootb PR #1575 (`fix/photo-envmap-retune`), MERGED (user: "send
it!") — live on `bim-ootb main`.** `PHOTO_ENVMAP_BOOST` stepped 3.0→2.0 (one controlled increment, matching `§PHOTO_AO_EDGE`'s
own single-step precedent above) — the room probe now supplies part of the reflection that 3.0 was
calibrated for before the probe existed. New witness `witness_envmap_retune.js`. Verified on Clinic
(the building "whitewash" was originally reported on), real GPU, apples-to-apples before/after (both
room-probe-applied): `meanBoostRatio` 3.0000→2.0000, `meanBoostedEnvMapIntensity` 1.8000→1.2000
(track the constant exactly), frame `meanLuma` 174.19→178.02, `stdLuma` 69.65→66.57 —
**not darker, less extreme contrast, zero clipping either side.** Hospital's material-level numbers
confirmed the change reaches its real 17-19 glossy materials the same way, but a clean frame-level
before/after there was blocked by unrelated environment flakiness (a hang, then a puppeteer crash) —
flagged honestly, not claimed as verified. **Items 1 (brightness/PL-scale re-measure) and 3 (warm
camera fill) deliberately NOT touched in this pass** — single-variable discipline, per spec.
**⚠ 2026-09-02: item 3 shipped LATER, in bim-ootb PR #1579 (`§TRIPLANAR_NORMAL`), which cites
"§PHOTO_REALISM_RETUNE item 3" by name — `CAM_LIGHT_COLOR` is `0xffdca8` on `main` today. Only
item 1 is still open.** See the corrected heading table at the top of this section.

**Order, and why:** items 1+2 first (both are literally "step back an already-known-overtuned
constant," lowest risk, most likely source of "too bright/shiny" exactly as reported) — verify those
live before touching item 3, since a warmer camera light on TOP of still-too-bright/too-reflective
staging would make it harder to isolate which change fixed what, the same single-variable discipline
this file's whole AO-tuning history already earned the hard way.

## §PHOTO_SHADING_CEILING — three per-pixel shading attempts all landed 1–7%, none visible to the user (2026-08-30, measured, one change KEPT, one REVERTED)

**Context:** user asked what would improve Alt+S photorealism, then "do only the single thing that
carries the most benefit." Three attempts, all measured on real GPU frames (Terminal departure
lounge, 960x540, one condition per page load). **All three produced sub-visible deltas. The user's
own repeated verdict — "don't notice changes", "I cannot single out a real win" — is correct and
matches the numbers.** Do not re-run these lanes expecting a different answer.

### Baseline, measured on the user's own Alt+S frame (1773x921, Terminal interior)
`meanLuma 139.79  stdLuma 54.21  p99.9 245.1  >250 0.0000%  <16 0.103%`
`gradEnergy 2.35 -> 4.07` is what triplanar texture already buys (+73%, the biggest single win to date).
Flat-surface measurements that motivated the work: **ceiling patch luma std 5.67 / grad 1.61; floor
patch luma std 16.92 / grad 2.00.**

### 1. §PHOTO_GRADE — still-only spec-clip + shadow-deepen composer pass. BUILT, MEASURED, **REVERTED**.
v1 shipped with constants derived from an inverse-ACES reconstruction of a PNG (range topped at
3.065). **`§PHOTO_GRADE_PROBE` then read the REAL scene-linear HDR buffer: luma p45=0.5406
p75=5.6826 p88=7.4827 p95=8.4239 p99=9.5590 max=10.6996; grad p50=0.0154 p90=0.0755 p99=4.2845.**
The v1 pivot of 0.4259 was **17.6x too low** — a p75 pixel scored hi=1.99, clamped to 1.0, so over
75% of the frame had the highlight term saturated; times the 0.35 mask floor that is a 2.75x lift on
flat surfaces. User's live result: mean luma +18.6, 12.94% of pixels over 240, "overlighted."
v2 (pivot at real p95, edge GATING instead of a floor, gain 5.0->3.0) passed its numeric bar —
`meanLuma -2.82, stdLuma +4.5%, >250 0% -> 0.2118%` — and the user still could not see it. **Reverted
on the user's call. A 4.5% contrast shift is below the threshold of noticing.**

### 2. §TRIPLANAR_NORMAL — the missing third PBR map. BUILT, MEASURED, **KEPT** (cheap, correct, marginal).
`NOTICE.txt` recorded the omission from day one: *"Diffuse+roughness only (no normal/AO ...
two-maps-only first pass)"*. Without it every fragment of a flat surface shares ONE normal, so the
lighting term is constant across it. Wired as a whiteout/UDN triplanar blend at
`#include <normal_fragment_maps>` in `viewer/streaming.js`, same still-only `uTriActive` gate,
NormalGL maps from the same ambientCG assets already vendored. A/B switch: `APP._triNormalOff`.
- **Interior pose:** blockStd 11.0039 -> 11.4801 (**+4.3%**), gradEnergy +2.8%. 42/46 materials.
- **Exterior pose:** blockStd 9.214 -> 9.230 (**+0.2%**), gradEnergy +1.4%, but stdLuma 72.15 ->
  77.54 (+7.5%) and meanLuma 197.49 -> 190.08.

### 3. The hypothesis that FAILED — do not repeat it
Predicted the interior result was small because normal maps need DIRECTIONAL light and the interior
is lit near-uniformly (ambient + hemi + ~200 point fixtures + cam torch; `effects.js` §CAM_LIGHT:
*"no bounce anywhere in this pipeline"*). **The exterior sun-side test REFUTED this** — under a
strong directional key the fine-relief gain was 0.2%, *smaller* than indoors. What the exterior
numbers actually show is large-scale facet shading shifting (stdLuma +7.5%, mean -7.4), not fine
relief: at ~80 m the 2.5 m-repeat relief is far below pixel scale and averages out.

### The conclusion worth carrying forward
**Per-pixel shading knobs cannot create contrast the lighting does not have.** Three independent
attempts landed 1–7% and none crossed the visibility threshold. The remaining real wins are the ones
a person can NAME IN WORDS, not measure in percent — material IDENTITY errors:
`TRIPLANAR_MAT` (`streaming.js:519`) keys texture selection on `ifc_class`, so Terminal's floor
(`jkrAR_flr-f_(jhn21)-3 300 x 300 x 8 mm Jubin Homogeneous "non slip"`) and its ceiling
(`jkrAR_clg-f_(pv60)-3 600mm x 600mm PVC Laminated Gypsum Board`) BOTH render as 2.5 m cast concrete
because both are `IfcSlab`; and Terminal's walls are all concrete (`IfcWall` 333) while Hospital's
are all plaster (`IfcWallStandardCase` 1310) — decided by the exporter's class choice, not material.
**The DB already carries the answer and the renderer never reads it:** `material_name` coverage is
Terminal **79 distinct names / 90.3% of 48,428 elements**, LTU_AHouse 178/29.4%, HHS 4/34.7%, and
**Hospital / Clinic / JKR 0%** (90,882 elements with nothing to bind to — any palette needs a
class/storey fallback for them). `tileMeters` 2.5/2.0/0.6 are invented while the material name
literally contains "300 x 300" and "600mm x 600mm". Persistence for a palette is already built —
`A._applyPendingPatch` (`viewer/scene.js:1426`) + `buildings/patches/*.sql`.

### Witness-methodology defects found and fixed here (both produced FALSE verdicts first)
1. **VACUOUS:** `document.querySelector('canvas')` grabbed a 300x150 all-black overlay canvas; the
   witness judged an empty frame and printed **NO-OP**. Use `APP.renderer.domElement`, and print
   INCONCLUSIVE when the readback is black.
2. **CONFOUNDED:** running both A/B conditions on ONE page load is invalid — the second Alt+S logs
   `§PHOTO_AO done avgRenderMs=0.7` against the first's `94.5`, i.e. the AO phase does no real work
   the second time. **One condition per page load.** Witnesses must also assert the poses match and
   both AO phases did real work, or print INCONCLUSIVE.
3. Calibrating constants at one camera pose and scoring them at another (probe pose vs witness pose)
   invalidated a whole round. Same pose, both.

### Unrelated fact established while chasing the user's 1.6 GB tab report (NOT the renderer)
GH Pages 404s on `/buildings/Terminal_*.db` and falls through to OCI, which serves a **monolithic
281,600,000 B `Terminal_extracted.db`**. The local checkout's same-named file is **28,262,400 B and
meta-only** (tables: `elements_meta`, `element_instances`, `element_transforms`, `surface_styles` —
no mesh table); geometry is a separate **261,349,376 B `Terminal_geo.db`**. Same filename, 10x
different content and a different residency model — settle that before attributing memory to
rendering. (`surface_styles` is EMPTY on Terminal/LTU_AHouse_extracted; `material_rgba` is 86–100%
populated fleet-wide except HHS at 34.8%, and IS already used.)

## §PHOTO_SHADING_CEILING — UPDATE 2026-08-30 evening: the shading fault was REAL and is now FIXED

The section above concluded that per-pixel shading knobs land at 1–7% and that the remaining wins
are material-identity ones. **Half of that stands; the other half was wrong, and the user was right.**

**§SHADE_PROBE settled it (Clinic, 448 real streamed geometries):** every class ships HARD PER-FACE
normals — weldRatio 0.107–0.29, splitNormal 96–100% — so `flatShading:false` was being silently
overridden by the data. Curved MEP was not "as good as tessellation allows"; its roundness was being
thrown away at shading time. IfcFlowController carries 189 distinct facet directions, IfcFlowTerminal
128.6, IfcFlowFitting 114.3 — richly tessellated shapes rendered flat.

**Fixed and live (sw v1106): §MEP_SMOOTH_NORMALS.** Gate is the SHAPE — ≥16 distinct facet
directions, where every box class measures EXACTLY 7 — OR'd with a curve-class list for low-poly
ducts (IfcFlowSegment 10.3). Crease-limited at 55°, rewriting normal VALUES in place: no weld, no
re-index, so ranges/picking/BVH/§TRIPLANAR all keep reading the same vertex layout. Witness 5/5 on
Hospital with the user's constraint measured independently: **non-curve changed=0, maxDelta=0 of
6,370,253 vertices.** Hospital went 0 → 14,068 element spans once the batched/instanced paths were
handled (it reports merged=0, so a ranges-only gate reached nothing there). 8.6 s ONCE per session.

**Still true from the section above:** §PHOTO_GRADE was reverted (passed +4.5% contrast, invisible),
the 199 MB normal-drop is withdrawn (breaks §TRIPLANAR's vTriWorldNormal), and the material-identity
lane remains the largest unbuilt win. Full record: `prompts/CINEMA_PATH_EDITOR.md` §SESSION_2026-08-30.

## §WALL_WINDING_MEASURE (2026-09-01) — is FrontSide viable, measured, not feared

**Question.** User wants walls facing away from the sun to render dark. Cause (code-read, this
session): every element material is `THREE.DoubleSide` (`streaming.js:839`, the §S260d line), and
three.js negates the shading normal on back-facing fragments, so diffuse lighting tracks the
CAMERA, not the sun. Candidate fix `THREE.FrontSide` is correct shading but any wrongly-wound face
vanishes. This section measures how much geometry is actually mis-wound, so the choice is data.
MEASUREMENT ONLY — no rendering change shipped with this section.

**Data + validity (all verified this session, not assumed):**
- Source = the DBs the viewer streams (`§SPLIT_GEO_LOADED`): `Terminal_geo.db` (249 MB, 9,394
  unique meshes) + `Terminal_meta.db`; `Hospital_geo.db` (229 MB, 20,609 meshes) + `Hospital_meta.db`
  (`/home/red1/bim-ootb/viewer/buildings/`, Hospital symlinked to `deploy/buildings/`).
- Decode identical to `A.blobToGeometry` (`scene.js:1830`): `vertices`=Float32 xyz, `faces`=Uint32
  tri indices. The viewer's axis swap (x,y,z)→(x,z,−y) has det=+1 (proper rotation) and instancing
  composes with scale (1,1,1), Euler rotations only (`streaming.js:2242,2347`; `element_transforms`
  has no scale column) — so winding measured in the DB IS what the GPU sees.
- Per mesh: signed volume V=Σ det(v0,v1,v2)/6 (divergence theorem; V>0 ⇔ CCW-outward ⇔ FrontSide
  shows the exterior). Winding consistency via directed-edge multiset after welding coincident
  verts at 0.1 mm (the index carries duplicated positions — weldRatio 0.107–0.29, §SHADE_PROBE):
  an interior edge whose two directed copies run the SAME way = winding flip between neighbours
  (the only case a uniform flip cannot repair). Boundary edge (used once) = open shell → no
  meaningful volume, own bucket. Open meshes re-tested at 1 mm and 5 mm weld (false-open detector),
  and sub-bucketed by boundary-edge fraction: near-closed ≤0.5 %, partly-open ≤5 %, sheet >5 %.
- Probe run 2026-09-01, ~14 s/building + ~30 s drill; logs `winding_{Terminal,Hospital}.log`,
  `drill_*.log`, `sheet_census_Hospital.log` (session scratchpad; every number below is a §-line
  from those logs). All 111,610 elements with geometry resolved a mesh — missing_geo=0 both
  buildings, nothing vacuous.

**Terminal — 48,428 elements, every one measured:**
| bucket | elements | % |
|---|---|---|
| uniformly outward, closed | 45,520 | 94.0 % |
| uniformly INVERTED | **0** | **0.0 %** |
| mixed winding | **0** | **0.0 %** |
| open shells | 2,908 | 6.0 % |
Open drill: 49 close at a coarser weld (false-open); 1,702 near-closed, 1,136 partly-open —
**every single one with V>0 (outward)**; true sheets 21 elements (0.04 %). Net: **48,407/48,428 =
99.96 % of Terminal elements are uniformly outward-wound.**
Wall classes: IfcWall 333 = 110 closed-outward + 190 near-closed(+) + 33 partly-open(+) → **100 %
outward, 0 sheets**; IfcSlab 705, IfcCovering 82, IfcPlate 33,324 (the facade) → 100 % closed
outward. (No IfcWallStandardCase/IfcCurtainWall in Terminal.) Triangle-weighted: 38.3 % of drawn
tris are closed-outward, 61.1 % open-but-positive (the big facade/wall meshes are near-closed
solids, not sheets), sheets 0.5 %.

**Hospital — 63,182 elements with geometry (of 63,415; the 233 without include all 178
IfcCurtainWall — containers that decompose into IfcPlate/IfcMember, both 100 % outward):**
| bucket | elements | % |
|---|---|---|
| uniformly outward, closed | 49,434 | 78.2 % |
| outward after open-drill (false-open 1,330 + near-closed 6,747 + partly-open 52, all V>0) | 8,129 | 12.9 % |
| uniformly INVERTED | **2** | **0.003 %** |
| mixed winding | 303 | 0.5 % |
| true sheets | 5,314 | 8.4 % |
Net: **57,563/63,182 = 91.1 % uniformly outward.** The 303 mixed elements are 298
IfcBuildingElementProxy + 5 others — but they are huge meshes: **18.9 % of the building's 15.3 M
drawn triangles.** Sheets by class: IfcPipeFitting 3,635, IfcDuctFitting 811, proxies 714,
IfcWindow 118, IfcDoor 12 — wall classes only 22 (IfcCovering 9, IfcWallStandardCase 8, IfcWall 5).
Wall classes: IfcWallStandardCase 1,310 → 97.6 % closed-outward + 2.4 % open (8 sheets); IfcWall
158 → 86.7 % closed + 16 near/partly-open(+) + 5 sheets; IfcCovering 602 → 98.5 % + 9 sheets;
IfcSlab 35 → 88.6 % + 4 near-closed (1 mixed).

**Shipped `normal` attribute vs winding: 0 % disagreement — BY CONSTRUCTION, there is no shipped
normal.** `component_geometries` has no `normals` column in Terminal_geo, Hospital_geo, or
Hospital_extracted (schema read); the viewer's §NORMALS_PROBE (`streaming.js:1481`) finds none and
`blobToGeometry` falls to `geo.computeVertexNormals()` (`scene.js:1869`) — the on-screen shading
normal is DERIVED from the winding (then §MEP_SMOOTH_NORMALS rewrites values, not sign). So the
§S260d comment "IFC geometry has inconsistent normals" is now measured: the winding is NOT
inconsistent (0 mixed meshes in Terminal, 0.6 % of meshes in Hospital) — what makes lighting track
the viewer is DoubleSide's camera-facing flip alone.

**VERDICT — FrontSide is viable for the walls, with ~zero repair; load-time winding repair is a
solution to a defect that does not exist.**
- The number that drives it: **uniformly-inverted meshes = 0 in Terminal, 2 elements in Hospital
  (0.003 %)** — there is nothing to flip. Wall classes are 100 % outward-positive in Terminal and
  ≥ 96.8 % in Hospital (22 sheet elements ≈ 1 % of wall-class population).
- The real FrontSide cost is not winding but the ONE-SIDED SHEET population + mixed meshes:
  Terminal 21 elements (0.04 %); Hospital 5,617 (8.9 % of elements — open-ended pipe/duct
  fittings, windows, doors, proxy meshes; the 303 mixed alone are 18.9 % of drawn triangles). A
  sheet is invisible from one side under FrontSide regardless of winding — unrepairable by any
  flip, per-face surgery only for the mixed ones.
- So the data reshapes the either/or: **class-keyed side** — FrontSide for the closed classes the
  user is looking at (walls, slabs, coverings, plates, structure), DoubleSide retained for the
  sheet-heavy classes (fittings, windows, doors, terminals, stairs, railings) — same class-keyed
  pattern STD_MAT already uses. Blanket FrontSide would hole out ~9 % of Hospital; blanket
  load-time repair has nothing to repair.
- Honest caveat: the near-closed/partly-open positive shells (Terminal walls: 223/333) have real
  boundary cracks (≤5 % of edges) where FrontSide shows through where DoubleSide today paints the
  interior back face — hairline-bounded, and only where faces are already absent.
- Separate lever, NOT this measurement: ambient 0.785 + hemisphere 1.257 vs sun 4.4 + envMap 0.6
  (`scene.js:178-190`, `streaming.js:839-853`) means even perfectly-wound geometry only drops to
  ~1/3 of lit value on the dark side. Side-flip alone will not give the user dark shadow faces.

## §WALL_SIDE_AND_LIGHT_FLOOR (2026-09-01) — class-keyed side + fill-floor retune. SPEC FIRST; measured numbers appended below after each run.

**Goal (user ask):** walls facing away from the sun render DARK. Input = §WALL_WINDING_MEASURE
(above): winding is consistent (2/111,610 inverted fleet-wide), §S260d's "inconsistent normals"
premise is measured false, and a side-flip alone cannot darken anything because ambient+hemi
≈ 2.04 vs sun 4.4. So the ship is TWO levers together: (1) class-keyed `material.side`,
(2) a lowered non-directional fill — gated by (3) pick integrity, plus perf/mem non-regression
(user, this session: "watch mem hog not to slow down, look for any oppurtunity to perf").

### SPEC S1 — class-keyed side (streaming.js `_getMaterial`)
- Opaque side = `THREE.FrontSide` iff the element's `ifc_class` passes **T1**; else `DoubleSide`.
  Transparent path (`a < 1.0`, streaming.js:819) stays `DoubleSide` — untouched.
- **T1 (the threshold, a number):** pooled across the two measured buildings
  (Terminal_geo + Hospital_geo, the DBs the viewer streams), the class's
  `(true-sheet + mixed-winding + uniformly-inverted)` element fraction is **≤ 2.0 %** of its
  elements-with-geometry, with pooled population **≥ 30**. Classes not measured, or under
  population, default `DoubleSide` (conservative). Rationale for 2.0 %: the measured wall-class
  defect fractions sit at 0–1.4 % fleet-wide while the sheet-heavy classes sit at ≥ 8 %
  (PipeFitting/DuctFitting/proxies, §WALL_WINDING_MEASURE) — 2.0 % separates the two measured
  populations with margin on both sides and admits no class whose FrontSide cost is triangles
  the user can see through. Class table = derived by a fresh per-class census probe (same
  methodology as §WALL_WINDING_MEASURE: signed volume, directed-edge multiset @0.1 mm weld,
  1 mm/5 mm false-open retest, boundary-fraction buckets ≤0.5 %/≤5 %/>5 %), cross-checked
  against that section's published per-class numbers before being trusted.
- `side` is a pure function of `(ifcClass, a<1.0)`. `ifcClass` is ALREADY a cacheKey dimension
  (streaming.js:780) → the material cache CANNOT fragment. Asserted (S6).
- `mat.userData.origSide` (streaming.js:1132) := the RESOLVED side (today it records FrontSide
  for every opaque material while the material is actually created DoubleSide — a latent
  mismatch against the x-ray restore fallback chain, tools.js:337/359). X-ray path
  (streaming.js:1133, tools.js:317-360, walk.js:507/588) reads live `mat.side` at toggle time
  and restores it — stays coherent with no change beyond origSide.
- The §S260d comment at streaming.js:839 is corrected to cite the measurement.

### SPEC S2 — light floor (scene.js:178-190)
- Lighting model (three.js physical lights; every term MEASURED in-harness in
  ambient-equivalent units via single-light probe renders to a linear render target —
  no factor is hand-assumed): fill `F(N) = Ia + Ih·h(N) + Ienv·env(N)`;
  lit `= F + Is·cs·max(0, N·L)`. Real sun vector L = (200,400,300)/‖·‖ = (0.371, 0.743, 0.557);
  representative vertical-wall pair uses the max horizontal N·L = **0.669**.
- **T2 (target contrast):** away-facing/sun-facing ≤ **0.25** for that pair (today ≈ 0.35).
  Rationale: clear-day shade-to-sun luminance ratios span ~1:4–1:10; 1:4 is the conservative
  edge, chosen because the same fill lights the interiors.
- **T3 (interior floor — the constraint that may bind first):** at a real interior standpoint,
  linear frame luminance must retain **p25 ≥ 0.55×** and **mean ≥ 0.70×** the pre-change value.
  Rationale: perceived lightness ~ Y^(1/3) (CIELAB), so these bound the darkest interior
  quartile to ≤ 18 % perceived loss and the room overall to ≤ 11 %. (Interiors keep their sun
  term — `castShadow=false` means the sun lights interior surfaces through walls — only the
  fill fraction of interior light drops.)
- Derivation: one scale k applied to (ambient, hemi) JOINTLY (preserves today's colour
  balance); solve k from T2 given the measured env term; **if that k violates T3, clamp k at
  the T3 floor and report BOTH numbers as a declared conflict** — never silently favour one.
  Sun intensity, envMapIntensity, PHOTO_ENVMAP_BOOST (CPE lane) untouched.

### SPEC S3 — pick integrity (GATES the ship)
- §S260d's stated reason for DoubleSide was "ensures pick works"; `Raycaster` respects
  `material.side`. In the LIVE viewer (real DB, real `A.raycaster`, the picking.js:225-231
  mesh collection): sample real elements of EVERY FrontSide class; cast identical rays
  before (all-DoubleSide, toggled on the live material cache) and after (shipped sides), from
  OUTSIDE toward element centroids and from INSIDE a real room toward inner wall faces.
  Assert per-ray top-hit element identity and hit counts. Any regression → that class drops
  back to DoubleSide and the census table is annotated; the witness re-runs to green before
  ship.

### SPEC S4 — nothing vanishes
- `renderer.info.render.triangles` and `.calls` before vs after: EQUAL (side changes GPU
  culling, not submission — a triangle-count drop means a mesh was lost, a rise means the
  cache fragmented).
- Uncovered-pixel proof: sky mesh hidden, clear colour set to a sentinel, one deterministic
  render per standpoint (exterior sun side, exterior away side, interior), count sentinel
  pixels before vs after; delta ≤ **0.5 %** of the frame. Catches walls holing out.

### SPEC S5 — the actual shading claim
- Per-face N·L census over the real wall-class geometry (world-transformed, the same decode
  as `A.blobToGeometry`): mean linear irradiance of away-facing (N·L ≤ 0) wall faces and
  sun-facing faces, BEFORE (DoubleSide + Ia 0.785/Ih 1.257) vs AFTER (class side + retuned).
  Report the before/after away-face ratio and the contrast pair. If the away face does not
  measurably darken, SAY SO and do not ship part 2. (Expected honest split: for CLOSED walls
  the camera only ever sees front fragments, so part 1 changes their shading by ~0 —
  the darkening is part 2's; part 1's render value is back-face-fragment correctness on the
  open/sheet population + the culling win. The witness measures rather than assumes this.)
- **In-harness verify-then-report:** measured contrast ratio must round to the derived
  prediction within ±0.02 or the run is INCONCLUSIVE.

### SPEC S6 — perf/mem non-regression (user scope addition, same session)
- M1 unique-material count + draw calls per building: before == after (no cache fragmentation).
- M2 backface-culling win: median frame time over ≥ 30 timed renders at the same pose,
  before vs after — FrontSide should be ≤; report the signed number either way.
- M3 heap: `performance.memory.usedJSHeapSize` same building+pose before vs after; known
  Hospital baseline ≈ 1.57 GB; delta above noise (± ~50 MB run-to-run) = flag, do not ship.
- M4 shadow config untouched: `sun.castShadow === false` and `sun.shadow.mapSize` identical
  before/after (the 4096² map cost note stays historical).
- If any of M1–M4 is negative, that part does NOT ship; the number is the finding.

### Witness
- `viewer/tests/witness_wall_side_light_floor.js` (live Playwright harness, own static server,
  real Hospital split DB; Terminal covered by the node-side census + N·L probe). Prints one
  `§WWSLF_*` line per claim, a final verdict line able to say `NO-OP` / `VACUOUS` /
  `INCONCLUSIVE`, exit 1 on any FAIL. Log saved and read before any conclusion.

### MEASURED 1 — per-class census + T1 table (2026-09-01, census_winding_class.js, logs census_{Terminal,Hospital}.log + t1_decision.log in session scratchpad)
- **Probe validity, proven against §WALL_WINDING_MEASURE before trusting anything:** first run
  mis-defined "mixed" as ANY repeated same-direction edge — that counts multi-shell solids
  (shared internal faces carry 2+2 directed copies) and mis-bucketed 2,777 Terminal elements
  (doc says 0). Corrected to the doc's definition (an edge used exactly TWICE, both copies the
  same way). After the fix the cross-check reproduces every decision-relevant number EXACTLY:
  Terminal closed_out 45,520→(with false-open fold-in 47,229 — bookkeeping split only), mixed 0,
  inverted 0, sheets 21; Hospital with_geo 63,182, inverted 2, mixed 303, sheets+open_neg
  5,275+39 = 5,314, outward net 57,563. (My closed/near-closed boundary differs from the doc's
  drill bookkeeping — welding earlier closes more shells — but that split does not feed T1;
  defect = sheet+mixed+inverted+open_negative matches exactly.)
- **T1 applied (≤2.0 % pooled defect, pop ≥30) — FrontSide (25):** IfcAirTerminal, IfcAlarm,
  IfcBeam, IfcCableCarrierFitting, IfcCableCarrierSegment, IfcColumn (0.52 %), IfcCovering
  (1.32 %), IfcDistributionControlElement, IfcDuctSegment, IfcElectricAppliance,
  IfcFireSuppressionTerminal, IfcFooting, IfcFurniture, IfcLightFixture, IfcMember (0.03 %),
  IfcPipeSegment, IfcPlate (0.00 %), IfcRailing, IfcSlab (0.14 %), IfcStair, IfcStairFlight,
  IfcSwitchingDevice, IfcValve (0.17 %), IfcWall (1.02 %), IfcWallStandardCase (0.61 %).
- **DoubleSide kept (10):** IfcPipeFitting 20.4 %, IfcBuildingElementProxy 16.4 %,
  IfcDuctFitting 14.9 %, IfcWindow 32.7 %, IfcFlowTerminal 5.1 %, IfcDoor 2.09 % (just over —
  honest miss, not rounded down), + under-population IfcController(6), IfcFlowController(21),
  IfcRampFlight(1), IfcRoof(2). Unlisted classes default DoubleSide.
- Wider win than the ask: the census shows the SEGMENT MEP classes (pipe/duct/cable runs,
  18k+5k+84 elements) are 100 % closed-outward — they get backface culling for free; only the
  FITTING classes are the open-ended sheet population.

### MEASURED 2 — derive + witness run 1 (2026-09-01, wwslf_derive.log + wwslf_assert.log, session scratchpad)
- **Calibration (in-page single-light probe renders, linear RT):** unit response = 0.31831 =
  1/π exactly (the Lambert albedo/π — the probe measures the real BRDF, nothing assumed);
  hemi 0.6109/unit intensity at horizontal N; envMap term 0.2029 at intensity 0.6 (the PMREM
  IS live in plain nav); sun 0.9578/unit at N=L.
- **Fill model, measured:** fill_old = 0.785 + 1.257·0.6109 + 0.2029 = **1.756** vs sun term
  4.4·0.9578·0.669 = **2.820** → contrast_old = **0.384** (the "roughly a third" of
  §WALL_WINDING_MEASURE, now exact). T2 (0.25) solves k=0.475; **T3's p25-fill floor 0.55 binds
  first at k=0.491 — the declared conflict happened**, clamped at the floor: shipped
  **ambient 0.386, hemi 0.617**, predicted contrast **0.255**.
- **Witness run 1 (Hospital live, 109 sampled elements/28 classes + 12 in-room rays): 19 PASS /
  1 FAIL — the FAIL is the S3 pick gate doing its job.** One ray of 121 diverged:
  `out|IfcElectricAppliance|1cL9Mv$oTAD8jv7e2bmYul` — its origin (target + 8.5 m radial offset)
  lands INSIDE a recessed IfcLightFixture shell; DoubleSide first-hit was that fixture's own
  interior back face, FrontSide resolves to the supply diffuser beyond it. Winding census had
  IfcLightFixture at 0 % defect — the withdrawal is PICK-behavioural, not winding.
  **Action per spec: IfcLightFixture dropped from FRONT_SIDE_CLASSES (25→24), re-run required.**
- Everything else green, with the numbers:
  - S1: 96 live materials — 59 FrontSide / 34 DoubleSide / transparent all DoubleSide,
    0 mismatched, origSide 100 % coherent.
  - S4: submitted triangles identical 10,105,100 = 10,105,100; draw calls 4,001 = 4,001;
    background-pixel delta 0.0000 at all three standpoints (nothing vanished, no cache
    fragmentation).
  - T3 interior (real render, ACES-mapped): mean retention 0.822, p25 retention 0.833 — well
    above the 0.70/0.55 floors, because interiors keep their sun term (castShadow=false).
  - Away facade real render: mean ratio 0.848 (view mixes lit fragments + env specular);
    pure away-face irradiance (S5 census): **0.550** — the actual darkening of the claim.
  - S5 wall-face census (IfcWall+IfcWallStandardCase, area-weighted, real transforms):
    Terminal 69,154 faces, contrast 0.471→**0.329**; Hospital 50,443 faces, 0.463→**0.322**
    (meanNL of lit faces ≈ 0.47, grazing included — the representative pair is 0.384→0.255).
  - M1 materials 96=96, calls Δ0. M2 frame median 2433→2320 ms headless-swiftshader
    (**−4.7 %**, the backface-culling win, sign checked). M3 heap Δ **0 MB** (1,640 MB both
    states, against the memory probe's measured 1,546–1,583 MB baseline). M4 shadow config
    identical (castShadow=false, 512² — the 4096² note was historical; measured value logged).
  - Mean hit-count drop per ray 12.41 (back-face exit hits gone) with first-hit identity held
    on 120/121 — the WYSIWYG contract intact.

### MEASURED 3 — confirmation run 2, merged tree, SHIPPED (2026-09-01, wwslf_assert2.log)
Tree = branch merged with origin/main @4fb753c6 (#1599); sw conflict resolved v1118→**v1119**
(both-notes, higher-version, own-bump rule). **§WWSLF_VERDICT PASS judged=20 fails=0** —
`§WITNESS_WALL_SIDE_LIGHT_FLOOR pass=20 fail=0 ran=20`.
- S3 pick gate GREEN after the IfcLightFixture withdrawal: **121/121 rays, 0 first-hit
  divergences** (outside + in-room), mean hit-count drop 12.36 (back-face exit hits gone —
  expected, identity intact). Final list = **24 FrontSide classes** (S1: 54 front / 39 double
  / transparent all double, 0 mismatched, origSide coherent).
- Same derivation reproduced exactly (calib deterministic): fill 1.756 → 0.966
  ambient-equivalents, contrast 0.384 → 0.255, T3-clamp conflict again declared.
- T3 interior: retention mean 0.822 / p25 0.833 (floors 0.70/0.55) — interiors keep their sun
  term, so the fill cut lands mostly on exterior away faces, as designed.
- M2 honest note: frame median run 1 **−113 ms** (−4.7 %), run 2 **+30 ms** (+1.5 %) on
  ~2 s software-GL frames — the backface-culling win is WITHIN HEADLESS NOISE, sign checked
  both runs; no reliable frame-time claim either way. M3 heap 1,545 MB both states (Δ 0 MB;
  measured baseline band 1,546–1,583 MB). M4 shadow {cast:false, 512²} identical — note the
  4096² figure circulating in the lane brief is NOT what the live sun carries; measured 512².
- Ship state: branch feat/wall-side-light-floor, commit bd5adf10 + merge 2fbea94a; PR + merge
  verification recorded below when landed.
- **LANDED 2026-09-01: bim-ootb PR #1601 MERGED as origin/main d16646db (verified by fetch, not the PR page: sw v1119, FRONT_SIDE_CLASSES, ambient 0.386 / hemi 0.617 all present on main).**

## §SUN_FILL_RATIO (2026-09-02) — the wall away from the sun, in the PHOTOREAL path. SPEC FIRST; measured numbers appended below after each run.

**User ask (AGENT_QUEUE D-1, 2026-09-02 film review):** *"Wall away from Sun shadow?"* — a wall
facing away from the sun should read darker than one facing it.

**Not re-opened here (settled, on record, correct):** shadows are on and correct in Alt+S
(`§PHOTO_SHADOW enabled casters=382 … texelPerM=11.4`); nothing is clipped (`outsideFrustum=0` on two
buildings); N8AO is contact/crease-only by architecture (`STILL_AO_RADIUS = 32` is in SCREEN pixels),
so a broad flat wall legitimately reads AO≈1.0. This is an ORIENTATION read, not an occlusion one.

**Why this is a PHOTOREAL-ONLY defect.** `§WALL_SIDE_AND_LIGHT_FLOOR` (PR #1601, merged `d16646db`,
2026-09-01) already cut the non-directional fill in `scene.js` and took the plain-navigation
away/sun contrast 0.384 → 0.255. The user's complaint is dated AFTER that landed and is about the
FILM. So the only question is narrow: **does #1601's separation survive into the Alt+S / bake path?**
Measured answer: **no.**

### The instrument — `viewer/tests/witness_sun_fill_ratio.js`
Real viewer, real split building DB, the real `A.startStillRefine()` staging. No mock, no synthetic
scene, no screenshot anywhere, no bake.
- **The pair:** two REAL wall elements of the SAME `ifc_class` AND the SAME `material_rgba`, so
  albedo cannot be the confound. One outward normal toward the LIVE sun, one away.
- **Outward is signed by the building centroid, NOT by face area.** A first pass classified by which
  face carried more area and produced 556 "sun-facing" of 602 walls — a wall slab has near-equal
  area on both faces, so that test is degenerate and its answer is a coin flip. The axis is the
  principal eigenvector of the area-weighted orientation tensor of the element's vertical face
  normals (real geometry, real transforms, the same decode as `A.blobToGeometry`); the sign points
  away from the building centroid; **exteriority is then GATED by a 25-ray coverage test** — an
  interior wall's camera lands inside the building and fails. Coverage ≥ 0.88 or the pair is dropped.
- **The sun vector is READ from `A.sun`, never assumed.** `A.updateSky()` repositions the light at
  load: the live direction is `[0.000, 0.707, −0.707]`, NOT `scene.js`'s source constant
  `(200,400,300)` → `(0.371,0.743,0.557)`. Assuming the constant INVERTED the sun/away labels on the
  first run — the sun-labelled wall measured `sun=0.0001` and the away-labelled one `sun=0.494`.
  A whole session's finding would have been reported backwards. Read the live scene, always.
- **Camera:** 12 m standoff, deliberately beyond `CAM_LIGHT_DISTANCE = 4` so the camera torch
  provably cannot contribute, with the FOV narrowed so the wall fills the frame.
- **Luminance is scene-linear.** three.js applies tone mapping ONLY when the destination is the
  canvas, so a `FloatType` render-target read is raw linear radiance (`renderer.toneMapping` is
  ACESFilmic, `scene.js:110`, and is logged). ACES + exposure are monotonic and applied afterwards,
  so a linear "not brighter" verdict survives them; and a uniform exposure scale cannot change a
  ratio at all.
- **Lighting is therefore ADDITIVE**, so each group's share is measured exactly as (all on) −
  (that group off): `sun / ambient / hemi / env / pl / camlight`. **Closure of the sum against the
  total is asserted** — measured 0.990–1.007, so the decomposition is trusted, not assumed.
- **A/B on ONE page load, and the `CPE_4D_PERF_MEM_STUDY §R10` trade-off was RE-CHECKED rather than
  copied:** these are deterministic single renders, not AO/TAA accumulations, so there is no
  first-fold-does-the-work effect and no scene reseed between conditions. `Math.random` is seeded
  anyway, and a **RED CONTROL** re-measures the untouched condition at the end and asserts it
  reproduces.
- The verdict line prints NO-OP / VACUOUS / INCONCLUSIVE and did so for real: Hospital's first run
  ended `INCONCLUSIVE — no albedo-matched exterior pair passed the 0.88 coverage gate`, which is the
  witness refusing to score a population it never judged.

### ⚠ INSTRUMENT COST FOUND — a 4096² shadow map re-rendered on EVERY staged render
Under SwiftShader the staged scene carries a **4096² shadow map over 708 casters plus ~216 night
fixture point lights**, and every camera move ALSO restarts a 16-frame AO+TAA accumulation. A
14-render decomposition ran **>25 minutes with no change to any measured quantity**. This is exactly
the class of instrument cost §R10 warns about, so it is recorded rather than quietly worked around.
It is a SPEED cost, not a noise cost — and that claim is not asserted, it is **gated**: the witness
reads the SAME pose immediately before and after freezing (`shadowMap.autoUpdate = false` +
`_stillRefineActive = false`) and requires the two to agree (`§SFR_FREEZE … relDrift`, gate < 0.005).
The sun's shadow frustum is fixed to the building envelope and the geometry does not move, so the map
is camera-independent and valid for every pose. **No RED number was taken from an un-gated run.**

### The measured cause — it is the envMap, and this codebase already banned exactly this
`_applyPhotoStaging()` swaps `A._envMap` from the procedural sky PMREM to a real photographed HDRI
(`textures/hdri/belfast_sunset_puresky_1k.hdr`, `§LAYER2_HDRI_READY`) and `_reassertPhotoEnvMap()`
then pushes that map onto **every** cached material — matte concrete and plaster included. IBL is a
whole-hemisphere, **non-directional** term and in three.js **it is not shadow-map-occluded**, so it
lands on a wall regardless of which way that wall faces.

This is not a new insight; it is a route around a gate this file already argued for and shipped.
`PHOTO_GLOSSY_ROUGHNESS_MAX = 0.5` exists (`effects.js:2680`) with the comment *"excludes
concrete/plaster/wood (STD_MAT rough 0.6-0.95), whose shadow-darkened diffuse read must stay
untouched"*, and `PHOTO_ENVMAP_BOOST`'s own history records the symptom from when that gate was
missing: *"user reported 'all shadows on building are gone.' Root cause of THAT: env-map/IBL
reflection is NOT shadow-map-occluded in three.js … the old gate applied the boost to EVERY
material."* The gate that was added limits the **intensity multiplier**. The **map swap** was never
gated, so the same defect returned through the other door — and bigger, because the HDRI is far
brighter than the procedural sky it replaced.

### SPEC — the change, and why this knob and not another
**Constraint honoured first: measure before adding light.** The user's standing words are *"we
already got things too bright, shiny reflection, it be shadow effects for realism"*. Every candidate
was scored against the measured decomposition, and the one shipped **removes** light. No sun
intensity was raised; the separation was not bought with brightness.

| candidate | what it does | why NOT it — the number |
|---|---|---|
| raise `A.sun.intensity` | more N·L range | ADDS light against a standing "too bright" complaint; also breaks `§MOVIE_SHADOW_TM`'s deliberate sun/fill parity with Time Machine (`sunFillRatio 4.387` today) |
| cut `scene.js` ambient/hemi again | lowers fill | already clamped at the T3 interior floor by #1601 (`k_T2=0.475` wanted, `k_T3=0.491` bound) — and it is not the large term: measured ambient+hemi ≈ **0.123 of the away wall's 0.582** staged luminance |
| `PHOTO_AMBIENT/HEMI_INTENSITY_SCALE` (staged-only, both 1.0) | lowers staged fill only | same 21% ceiling, cannot reach the target; and `§MOVIE_SHADOW_TM` set both to 1.0 by explicit user directive |
| `_nightPLScaleStill` (0.5) | dims the ~216 fixture point lights | measured `pl = 0.007` of 0.582 on the away wall — **1.2%**. Not the cause. *(This also answers §PHOTO_REALISM_RETUNE item 1 for the EXTERIOR read: the staged point lights are not what washes out a facade.)* |
| `CAM_LIGHT_INTENSITY` (3) | dims the camera torch | measured `camlight = 0.000` at 12 m — `CAM_LIGHT_DISTANCE = 4` means it provably cannot reach an exterior facade |
| **matte materials keep the plain-nav sky env map** | removes the staged HDRI's unshadowed diffuse fill from concrete/plaster, keeps it on glass and metal | **SHIPPED** — the only term big enough (**76%** of the away wall's staged light), it only ever removes light, it needs **no new constant**, and it re-states a policy this file already shipped |

**The change (`viewer/effects.js`, `_reassertPhotoEnvMap`):** the env-map target becomes
room-probe → glossy: `A._envMap` (the HDRI) → **matte: `_photoEnvMapSaved`** (the sky PMREM captured
at staging entry — exactly what plain navigation uses). Glossiness is decided by a new SHARED
predicate `_isPhotoGlossyMat()` (room-probe/mirror flag, `metalness > PHOTO_METAL_THRESHOLD`, or
`roughness <= PHOTO_GLOSSY_ROUGHNESS_MAX`) so the two reassert loops cannot disagree and the outcome
does not depend on which ran first this tick. **No constant is introduced, tuned or fitted** — the
matte term is restored to the value plain navigation already ships, which is the value
§WALL_SIDE_AND_LIGHT_FLOOR derived and T3-clamped.

**Second, required half (teardown).** Matte materials are not in `_photoEnvBoostedMats`, so they
would keep a reference to `_photoEnvMapSaved` after Alt+S exits — and a later `A.updateSky()` regen
DISPOSES the previous render target (`§MEMLEAK_PMREM_DISPOSE`, `scene.js:227`). One pass at teardown
points every cached material back at the live `A._envMap` (`§SUN_FILL_RATIO teardown envMap restored
on N material(s)`), witness-asserted. **This also closes a pre-existing leak: before this change
matte materials kept the staged HDRI as their envMap after Alt+S exited**, so plain navigation after
a photoshoot was not the same plain navigation as before it.

**Named caveat, not hidden.** Under the opt-in dusk mood (`A._photoDuskMood`, default OFF),
`A.updateSky(PHOTO_SUN_ELEVATION, …)` runs *after* `_envMapHdriActive` is set, so the PMREM is not
regenerated and `_photoEnvMapSaved` stays the pre-staging daytime sky; matte walls would then take a
daytime-sky IBL in a dusk frame. The term is small (21% of an away wall's light in plain nav) and
dusk mood is off by default, so it was NOT chased in the same pass — single-variable discipline.
Recorded as the next thing to measure if dusk mood is ever defaulted on.

---

## §MEP_COLOR_SURVIVES_PHOTOREAL — 2026-09-02 (queue D-2)

> **User, 2026-09-02:** *"The bad coloring or material in IFC elements, to get standard MEP look
> during Alt-S and movie, is that tackled? At the moment still see greyish metallic good contrast,
> but if there is use of std color for certain diff devices such as Yellow, Blue, Green, Red. Only a
> certain turn lever is already fire red which is fine."*

### ⚠ THE PALETTE IS AN AUTHORED CHOICE, NOT A PUBLISHED STANDARD

Same boundary PR #1604 shipped under, restated because this section extends that palette's reach.
**No MEP colour convention exists anywhere in the model data** — no `IfcSystem` / `system` column on
any shipped building DB, and the colour columns that do exist are either a single undifferentiated
default or the extractor's own `≈`-prefixed approximations. What is EXTRACTED is the *key*
(`elements_meta.discipline`, `material_rgba`, `material_name`); what is AUTHORED is the
discipline→hue *assignment*, and it reuses `A.DISC_COLORS` (`viewer/config.js:43-49`) **verbatim** —
the same 12-entry table the HUD bars, bbox placeholders, `city.js`, `measure.js` and the §SUNGLASS
band already paint with. **No new colour value is introduced by this section.** It is not, and is
not claimed to be, an industry standard.

### The measured defect — the tint was a total no-op on 4 of 5 buildings

`§MEP_DISC_TINT` (`streaming.js`, 2026-08-14) already supplies a trade colour to MEP. Its gate is
`if (!rgbaStr && stdMat) { … if (DISC_TINT_CLASSES[ifcClass]) … }`. Two scoping failures, both
measured against the shipped meta DBs (`sat_census.log`, `gap2.log`):

**(a) `!rgbaStr` — "the element has no colour" is the wrong question.** MEP elements carrying a
`material_rgba` value:

| building | MEP elements | with an rgba | dominant value | its HSV saturation |
|---|---|---|---|---|
| Hospital | 41,987 | **41,987 (100%)** | `0.920,0.900,0.850,1.000` × 40,563, `material_name` **NULL** | **0.076** |
| Clinic | 12,480 | **12,480 (100%)** | `0.920,0.900,0.850,1.000` × 11,712, name `≈ Off-White` | **0.076** |
| Terminal | 11,844 | **11,844 (100%)** | `1.000,1.000,1.000` × 6,552 / `Silver` × 3,612 (real authored names) | 0.000 |
| LTU_AHouse | 84,675 | **84,675 (100%)** | four fully-saturated trade colours (green/magenta/blue/yellow) | **1.000** |
| HHS_Office_Federated | 3,391 | 1 | — (3,390 NULL) | — |

So the tint fires **only on HHS**. On Hospital and Clinic every MEP element carries an *achromatic
off-white default*, `_TRI_METAL` multiplies over it (`diffuseColor.rgb *= triContrasted`, the shader
already tints rather than replaces), and the result is exactly the user's words: greyish metallic.

**(b) `DISC_TINT_CLASSES` is 3 classes.** `{IfcFlowSegment, IfcFlowFitting, IfcFlowTerminal}` —
the IFC2x3 generic trio. Hospital/Terminal export IFC4-style `IfcPipeSegment` / `IfcPipeFitting` /
`IfcDuctSegment` / `IfcDuctFitting` / `IfcCableCarrier*` / `IfcAirTerminal` / `IfcLightFixture` /
`IfcFireSuppressionTerminal`. **0 of Hospital's 41,987 MEP elements are in `DISC_TINT_CLASSES`.**

**The user's fire-red lever, identified exactly:** Hospital `IfcPipeFitting | FP |
0.843,0.137,0.102,1.000` × **1,298** (+2 `IfcValve`, +1 `IfcDistributionControlElement`) — the
grooved/Victaulic couplings §MEP_DISC_TINT's own comment already names. Saturation **0.879**. It
survives because its own colour carries a hue. That is the tier this change must not touch.

### The rule — ONE owner, three tiers, hue from the first source that has one

`A._mepDiscAlbedo()` (`streaming.js`) is the single owner. Value/luminance always comes from the
element; only HUE is ever supplied.

| tier | test (all EXTRACTED) | outcome |
|---|---|---|
| **1a** | `material_name` present and **not** `≈`-prefixed → a real authored IFC material | **untouched, byte-identical** |
| **1b** | the element's own `material_rgba` has HSV saturation ≥ `T` → its colour already carries a hue | **untouched, byte-identical** |
| **2** | MEP class, no authored name, colour absent or achromatic | hue+saturation from the trade colour, **V from the element's own albedo** |
| **3** | anything else (non-MEP class, no trade colour available) | unchanged — STD_MAT class default |

Within tier 2 the trade colour is the first source that carries a hue: `_mepNameHint(element_name)`
(the authored Revit family name — a *more specific* real-BIM signal) → `A.DISC_COLORS[discipline]`.
An **achromatic** hint carries no trade hue and falls through — this is what finally moves
`_mepNameHint`'s `DUCT` entry (STD_MAT galvanized grey, sat 0.052), which was itself part of the
"uniform grey metal" complaint. A discipline whose legend entry is achromatic (`VOID`, `0x666666`)
supplies no hue either, and the element is left alone.

**Hue transfer is HSV, not HSL.** HSL desaturates hard as L→1, so at the off-white default's
L = 0.885 an HSL recombination returns near-white. HSV keeps chroma: H and S from the trade colour,
**V = max(r,g,b) of the element's own albedo**. The off-white `0.920,0.900,0.850` under FP
(`0xcc8844`, H 30°, S 0.667) becomes `0.920,0.613,0.306` — a solid orange at the element's own
brightness. The metal normal/roughness maps, `metalness`, `envMapIntensity` and the triplanar
multiply are all untouched, so the *"greyish metallic good contrast"* the user complimented is the
shading response, and it survives — only the hue moves.

**When the element has no colour at all** (HHS's 3,390 NULL rows) the trade colour is used verbatim
— **byte-identical to shipped `§MEP_DISC_TINT`**, so that path is preserved, not re-derived.

### `T` — the achromatic threshold, derived from the data, not picked

Over the tier-2-eligible population fleet-wide (MEP classes, no authored name), the distinct HSV
saturations present are `{0.000, 0.033, 0.076, 0.100, 0.588, 0.713, 0.879, 1.000}`. The distribution
is starkly bimodal and the **widest empty band is 0.100 → 0.588, width 0.4884**; its midpoint is
**T = 0.344**. Split: 53,204 achromatic / 85,934 chromatic, and **0 elements lie within ±0.1 of T** —
the classification is not knife-edge and no element's tier depends on the third decimal. The witness
re-measures this gap per run and fails if any element lands inside the band.

### Verification — `viewer/tests/witness_mep_color_photoreal.js` (W-MEP-COLOR-PHOTOREAL)

Tier-A style (the `W-CPE-MATERIAL-KEY` pattern): boot the viewer once on a small building, then for
each meta DB run the real stream `SELECT` through `sql.js` in-page and call the **shipped**
`A._getMaterial()` on every element, reading `mat.color` back. Hues are COUNTED off real material
objects. **No frame, no screenshot** (CLAUDE.md FUNDAMENTAL LAW).

Gates: distinct MEP hues after ≥ before and ≤ the 12-entry legend ceiling; distinct-hue count equals
the count of disciplines that actually reached tier 2; **RED CONTROL** — with `A._mepHueOff = true`
every gate must fail (before==after); **TIER-1 CONTROL** — every tier-1a/1b element's material
`color` is byte-identical before and after, asserted element-for-element, including the 1,298
fire-red Hospital fittings and Terminal's 11,844 authored-name MEP; `T`-gap re-measured live.
Self-failure: `VACUOUS` on an empty population, `NO-OP` when nothing moved, `INCONCLUSIVE` — never
PASS — when nothing was judged.

### MEASURED — 2026-09-02, W-MEP-COLOR-PHOTOREAL **55/55, five buildings, 0 red**

Hues are COUNTED off real `THREE.Material` objects built by the shipped `A._getMaterial()`, plus the
app's own `§MEP_HUE_TALLY` read off a live HHS stream. **No frame, screenshot or film was rendered
or inspected.** Log: `viewer/tests/witness_mep_color_photoreal.log`.

| building | distinct MEP hues pre → shipped | colourless MEP elements pre → shipped | tinted | RED CONTROL (`_mepHueOff`) |
|---|---|---|---|---|
| **Hospital** | **3 → 8** | **40,634 → 0** | 40,634 | 3 hues — the gain disappears |
| **Clinic** | **2 → 5** | **12,467 → 43** | 12,467 | 2 hues — the gain disappears |
| **HHS_Office_Federated** | 6 → 6 | **1,768 → 0** | 3,391 | **0 hues** — the gain disappears |
| **LTU_AHouse** | **4 → 6** | 107 → 91 | 102 | 4 hues — the gain disappears |
| **Terminal** | 2 → 2 | 11,828 → 11,828 | **0** | unchanged — every MEP element is tier 1a |

Hospital's tinted split: `PLB 17,096 · MEP 13,495 · FP 6,832 · ELEC 1,623 · SAN 1,588` — **5 trade
codes, 5 distinct hues painted, no collisions.** HHS: 6 codes → 6 hues, live-confirmed by the shipped
line `§MEP_HUE_TALLY bld=HHS_Office_Federated mep_elements=3391 tinted=3391 distinct_hues=6
trade_codes=6 legend_ceiling=12 T=0.344 inst_mep_uniform=283 inst_mep_mixed=0`.

**Gate 1 is deliberately two-sided.** HHS gains real colour *without* gaining a distinct hue — its
1,768 ducts moved off `_mepNameHint`'s galvanized-grey `DUCT` entry onto a hue other elements
already carried. Counting hues alone would have scored that a NO-OP, which is the exact
scope-blindness PRIMAL LAW 4 names.

**TIER-1 CONTROL:** 98,283 tier-1 elements byte-identical with the rule on and off, asserted
element-for-element. **The user's fire-red lever: 1300/1300 elements, `#d7231a` → `#d7231a`.**

**Terminal's Gate 5 reports VACUOUS, not PASS** — 0 of its elements ever consult `T` (all 11,844 are
settled at tier 1a by a real authored material name), so a min-distance there would mean nothing.

### MIXED-BUCKET SAFETY — a real hazard this change created, measured and closed

The merge/batch path gives a whole `(storey|disc|rgba|matVariant|mepHintCode)` bucket **one**
material built from `items[0]`'s class. **MEASURED: Hospital had 21 of 160 such buckets mixing an MEP
class with a non-MEP one, up to 3,714 non-MEP elements** (Clinic 2/65, LTU 21/231, Terminal 0/244) —
they would have taken an MEP trade hue they do not belong to. The bucket key therefore gains an
MEP-hue-class bit; splitting keeps both halves correct and costs at most 21 extra buckets.

The **InstancedMesh** branch buckets by GEOMETRY HASH ALONE — the same caveat §MEP_DISC_PALETTE
recorded for discipline — and cannot be split without a draw call per hash. MEASURED: Hospital
**0 of 20,609** and Clinic **0 of 8,459** hashes span an MEP and a non-MEP class; LTU_AHouse has
**108 of 51,393** (1,386 elements). On a set that is not uniform on MEP-ness the hue is **SUPPRESSED**
(prior behaviour) and COUNTED (`inst_mep_mixed`), never applied.

### Shipped in bim-ootb PR #1621 · `sw.js` v1126 → **v1127**, `viewer.html streaming.js?v=67 → 68`
Owner: `A._mepDiscAlbedo` (`viewer/streaming.js`). Kill switch for the red control: `A._mepHueOff`
— deliberately NOT a `cacheKey` dimension, so a caller flipping it MUST clear `A._matCache`.

### MEASURED — RED and GREEN, two buildings, real renders (2026-09-02)

Numbers below are the FINAL runs on the shipped tree (branch merged with `origin/main` through
**#1621**, `sw v1128`). Earlier runs on the pre-merge tree agreed to within 0.003 on every headline
figure — the reruns were done rather than assuming #1619/#1621 could not reach this measurement.
Logs: `ship2_clinic.log`, `ship2_hospital.log` (session scratchpad).

Wall pair per building: same `ifc_class`, same `material_rgba`, 12 m standoff, coverage **1.00** on
both sides (every measured pixel is the target element), live sun `[0.000, 0.707, −0.707]`.
Clinic `IfcWallStandardCase | 0.502,0.502,0.502` at N·L ±0.707; Hospital `IfcWall |
0.439,0.498,0.557` at N·L ±0.704. All values are **scene-linear luminance**.

| away-facing ÷ sun-facing | Clinic | Hospital |
|---|---|---|
| plain navigation (what #1601 ships) | **0.2414** | **0.2371** |
| **RED** — Alt+S before this change | **1.0453** | **0.9170** |
| **GREEN** — Alt+S after this change | **0.2388** | **0.2347** |
| derived prediction (no fitted constant) | 0.2388 | 0.2346 |
| RED CONTROL — untouched condition re-measured | drift 0.00051 | drift 0.00001 |
| verdict | `FAIL judged=20 fails=1` (the 1 is the interior-diagnostic closure below, not a shipped claim) | **`PASS-WITH-DECLARED-CONFLICT judged=20 fails=0`** |

**The RED number IS the user's complaint.** On Clinic the wall facing AWAY from the sun measured
**brighter than the wall facing it** (1.0453); on Hospital it was within 8% of it. There was no
sun/shade read in the photoreal path at all. GREEN restores plain navigation's own separation to
within 0.003 on both buildings and lands on the derived prediction to four decimal places — the
change does exactly and only what the decomposition says it does.

**Per-group decomposition, away-facing wall, Alt+S GREEN (Clinic):**
`sun=0.00000 ambient=0.06168 hemi=0.06023 env=0.03355 pl=0.00000 camlight=0.00000 emissive=0.00000`,
closure 1.000. RED's away wall was 0.81332, of which **0.69137 (85%) was the HDRI env term**;
Hospital's was 0.70141 of which **0.58503 (83%)**.

**Nothing got brighter — asserted per pose, not claimed** (GREEN ÷ RED, scene-linear):

| pose | Clinic | Hospital |
|---|---|---|
| exterior, sun side | 0.835 | 0.832 |
| exterior, away side | **0.191** | **0.213** |
| interior standpoints (3 real `IfcSpace` centres each) | 0.334 / 0.542 / 0.651 | 0.535 / 0.293 / 0.498 |

Every pose on both buildings is darker. The separation was bought by REMOVING light: sun, ambient,
hemi, `PHOTO_ENVMAP_BOOST`, `_nightPLScaleStill` and `CAM_LIGHT` are all untouched.

**The HDRI reflection feature is provably untouched:** 43/43 (Clinic) and 70/70 (Hospital) glossy
materials still read the HDRI or the room probe; only the matte set moved (11 of 54 / 26 of 97).

**Instrument controls:**
- **FREEZE CONTROL** — frozen shadow map vs a freshly rendered one at the same pose, taken at the END
  of the run when the scene has long settled: `frozen=0.15546 liveShadowMap=0.15546 relDrift=0.00000`
  (Clinic), `0.14927 / 0.14927 / 0.00000` (Hospital). An earlier placement of this control read
  `relDrift=0.0627` because it sampled BEFORE the staged scene finished converging — that reading was
  **discarded and the control moved**, not explained away.
- **RED CONTROL** — 0.00051 / 0.00001 drift against effect sizes of 0.81 and 0.68.
- **Closure** — the light groups sum to the measured total within 1.000 ± 0.010 on every wall pose.
- **Teardown** — `§SUN_FILL_RATIO teardown envMap restored on 32 material(s), stale _photoBoosted
  cleared on 11`; census after exit `stale=0 leftBoosted=0 leftOrigEnv=0 castShadow=false` on both.

### ⛔ DECLARED CONFLICT — the interior cost, and the trade the user has to price (→ AGENT_QUEUE U-11)
Removing the unshadowed fill costs Alt+S interiors, because staging turns the sun's shadow ON
(`castShadow=true`) and the HDRI had been standing in for all interior daylight:

| interior retention, GREEN ÷ RED | Clinic | Hospital | floor (§WALL_SIDE_AND_LIGHT_FLOOR T3) |
|---|---|---|---|
| mean | 0.510 | 0.411 | ≥ 0.70 |
| p25 | 0.421 | 0.487 | ≥ 0.55 |

**The clamp is priced, not hand-waved** (`§SFR_CLAMP`): keeping fraction **m = 0.388** (Clinic) /
**0.491** (Hospital) of the HDRI matte fill would hold both floors, but the wall separation would then
be **0.5863 / 0.6011** instead of 0.2388 / 0.2347 — the away wall back to ~60% of the sun wall, better
than RED's 105% and not what the user asked for. **Both numbers are on record rather than silently
favouring either half.** Shipped state = the full fix; `m` is the one number to move.

**What actually lights an Alt+S interior after the fix** (`§SFR_INTERIOR_DECOMP`, Hospital, closure
**0.997**): `ambient=0.09682 hemi=0.09422 env=0.05027` of a 0.24252 total — and `pl=0.00000`,
`camlight=0.00000`, `emissive=0.00055`. So the room is left on the non-directional fill alone. The
same probe on Clinic closed at only **0.447**, i.e. the witness reporting that it could NOT account
for 55% of that frame; the standpoint's max pixel is 2.46–3.22 (brighter than any lit wall), which
points at sky geometry visible through a window — unchanged between RED and GREEN, so it DILUTES the
retention figure toward 1.0 and the true interior-surface darkening is stronger than the frame-level
number above. Named, not chased.

**⚠ The `§STAGED_PL_CUT` remedy is OPEN, not refuted — and the first answer was a false one.** The
staged fixture lights are the obvious interior knob. A first sweep reported a clean `0.00000` interior
change, i.e. "the fixtures do not light interiors" — **a FALSE finding manufactured by the
instrument**: `tools.js`'s pooled fixture update (`§STAGED_PL_CUT`, `tools.js:1787/1821`) recomputes
every light's intensity from `A._nightPLScale` on camera moves, so a per-light write is overwritten
before the next render. The sweep now moves that scalar and reads the intensity total back — and on
the corrected run it printed **`INCONCLUSIVE — the sweep never actually changed the staged fixture
light total (0 → 0 → 0)`**, because that pool is CAMERA-PROXIMITY driven (`_fade = min(1, dist/15)`,
lights outside the needed set are set to 0) and is empty once the accumulation loop is stopped for
measurement. **So: `pl` measured 0.00000 on the away facade in every run — it is certainly not the
CAUSE — but whether raising `_nightPLScaleStill` could restore Alt+S interiors is NOT yet answered.
Answering it needs a measurement that keeps the fixture pool live, which the current freeze forbids.**
That is the next thing to build if U-11 goes that way.

## §DUCT_SILHOUETTE — 2026-09-02 (queue D-3) — ✅ DONE (witness), bim-ootb PR pending at time of writing

> **USER:** *"The roundness to jagged curves seems to work on lamps but certain large duct piping
> seems lacking. Is the formula easy? Detecting an element to possess curved surface but having
> jagged and thus candidate to apply."*

**Answer to the user's actual question, first: YES, the formula is easy — it is two lines — and the
detector they are imagining already exists. The split they are seeing is NOT a detection failure at
all. It is SIZE, and it is ~50x wide.**

### §D3.1 — why the existing pass cannot be the fix (do not re-litigate)
`§MEP_SMOOTH_NORMALS geoms=160 ranges=1662 vertsSmoothed=2,074,656 vertsKeptHard=691,414
creaseDeg=55` rewrites **normals** at a 55° crease. It changes **shading**. A faceted cylinder
shades smoothly and its **silhouette stays a polygon**, because the silhouette *is* the geometry.
`streaming.js` already says this in its own header: *"IfcFlowSegment is 10.3 over 26 triangles: a
genuine 10-sided prism, so its SHADING improves here but its silhouette cannot."*

⛔ **Widening `creaseDeg` is NOT the remedy** — it addresses shading, which is not the defect, and it
would round genuine hard edges. `CREASE_DEG` stays 55, and this new pass deliberately reuses the
*same* 55°/2° edge classification so shading and silhouette always describe one surface.

### §D3.2 — THE FORMULA (measured, validated, no fit, no class list, no building name)
For any edge shared by two faces whose dihedral θ is small enough that the shipped smoothing pass
welds across it — i.e. the two facets are *meant* to read as one curved surface — project both faces
perpendicular to that edge. The edge collapses to a point `E`; the two opposite vertices give `A`
and `B`; all three lie on the swept cross-section. Therefore:

```
R      = |EA|·|AB|·|BE| / (4·area(EAB))      circumradius of three points — EXACT
s      = R · (1 − cos(θ/2))                  chord deviation, metres — "the jaggedness"
D_1px  = s · k,   k = (H/2)/tan(fov/2)       = 935.3 px/rad at 1080p, fov 60 (scene.js:139)
```

`s` is how far the flat facet sags inside the ideal arc. **`D_1px` is the distance out to which that
sag still covers a whole screen pixel** — i.e. how far away the element still looks jagged.

**VALIDATED, not asserted.** On Hospital the estimator lands on **R = 525.0 mm and 550.0 mm** — real
1050/1100 mm manufacturing duct sizes — and its segment count agrees **exactly (11 vs 11)** with a
completely independent PCA ring fit. A first, cheaper centroid-based estimator was biased by a
constant 0.653 on triangulated quads and was **discarded**, not corrected by a fudge factor.

### §D3.3 — THE LAMP-vs-DUCT SPLIT, quantified (this is the user's observation, in numbers)
| Hospital class | curve-detected? | mean N | mean s | worst D_1px |
|---|---|---|---|---|
| `IfcLightFixture` | yes | 13.3 | — | **falls out of the offender list at every gate tried** |
| `IfcDuctSegment` | yes | 12.8 | 4.17 mm | **20.8 m** |
| `IfcPipeSegment` | yes | 11.0 | 0.75 mm | 5.2 m |
| `IfcRailing` | yes | 22.7 | 63.98 mm | 154.6 m |
| `IfcBeam` (curved sweeps) | yes | 11.8 | 21.50 mm | 685.5 m |

**Both classes are detected. Both carry the same tessellation quality (N ≈ 11–13). The error is
linear in radius**, so a lamp is sub-pixel past arm's length while an 1100 mm duct is a whole pixel
at **twenty metres**. Detection was never the problem — size was. ⚠ Note the worst offenders on
Hospital are **not ducts at all** but large-radius *curved sweeps* (railings, curved beams); the
user only named ducts because that is what they were looking at.

### §D3.4 — BOTH REMEDIES, COSTED. Recommendation: re-tessellation.
**Remedy B — a silhouette treatment that adds no geometry. VERDICT: no credible option exists, and
that is a finding, not a cop-out.** Priced honestly:
1. **Anti-aliasing** — already shipped (`taa=8`). Softens the edge *pixel*; the polygon outline is
   unchanged. A 3 px sagitta stays 3 px. Cost 0, benefit 0. **Not a remedy.**
2. **Radial rescale onto the mid-radius polygon** — genuinely halves max deviation for free, but it
   **moves real geometry outward by ~s/2** on a model that carries clash detection, measure and QTO.
   Silently inflating every duct by up to 11 mm is falsifying the model. **Rejected on PRIME RULE
   grounds**, and it only buys 2x anyway.
3. **Parallax/POM silhouette** — cannot extend a surface outward past itself, and there is no height
   map. **Not credible.**
4. **Hardware tessellation** — WebGL2 has no tessellation shader. **Not available** (and §S276
   WebGPU is deferred).
5. **Re-extract at a finer IfcOpenShell chord tolerance** — the *correct* fix at the source, but it
   re-tessellates the **whole fleet** instead of the measured tail, requires re-extracting and
   re-uploading every building DB (Hospital alone is 252 MB, fleet 2.2 GB on OCI), and costs **more**
   memory, not less. **Rejected as untargeted.**

**Remedy A — one level of uniform Phong (PN-triangle) subdivision on the qualifying tail. CHOSEN.**
θ halves, so the residual sag drops ~4x. Measured cost, Hospital, through the shipped module:

| gate | refined geoms | instances | +MB per-geometry | +MB per-instance | mean sagitta |
|---|---|---|---|---|---|
| D_1px ≥ 2 m | 3,589 | 8,372 | +107.0 | **+307.0** | 12.324 → 2.457 mm (5.02x) |
| D_1px ≥ 3 m | 2,607 | 6,649 | +85.4 | +241.8 | 14.773 → 2.783 mm (5.31x) |
| **D_1px ≥ 5 m** | **1,419** | **4,019** | **+59.3** | **+159.3** | **21.331 → 3.383 mm (6.31x)** |
| D_1px ≥ 10 m | 860 | 2,898 | +43.5 | +126.1 | 26.991 → 3.646 mm (7.40x) |

The two bounds are real and both are quoted because the answer lies between them: JS-heap cost is
**per geometry** (`A.meshCache` is keyed by geometry hash, so each is refined once), while GPU
buffer cost is **per instance** for anything on the `BatchedMesh` path and **per geometry** for
anything instanced (Hospital `§CONTRACT_CHECK batch=38169 instanced=25013`).

**Gate = 5 m, chosen on the cost curve, not on taste.** Tightening 5 → 3 m costs **+82 MB** for
1,188 more geometries that are mostly small fittings; loosening 5 → 10 m saves only **33 MB** while
dropping 559. And `§R12_HOSPITAL_MEM` already puts Hospital's heap at ~1,577 MB, so the brief's
warning applies directly: **the 2 m gate's +307 MB is the "hundreds of MB is not a win" case and is
rejected.** 5 m is +3.8% to +10.1%.

### §D3.5 — fleet population and result at the shipped gate (through the shipped module)
| building | geoms | curve-detected | refined | instances | +MB perGeom / perInst | mean sagitta mm |
|---|---|---|---|---|---|---|
| Hospital | 20,609 | 15,428 | 1,419 | 4,019 | +59.3 / +159.3 | 21.331 → 3.383 (**6.31x**) |
| Terminal | 9,394 | 7,424 | 28 | 28 | +30.6 / +30.6 | 42.924 → 5.238 (**8.20x**) |
| JKR | 6,877 | 5,342 | 74 | 74 | +10.7 / +10.7 | 47.440 → 4.495 (**10.55x**) |
| Clinic | 9,230 | 4,366 | 59 | 934 | +6.1 / +94.2 | 30.012 → 5.508 (**5.45x**) |
| HHS_Office_Federated | 4,710 | 2,314 | 117 | 388 | +3.9 / +6.9 | 14.591 → 2.848 (**5.12x**) |
| Duplex | 835 | 503 | 6 | 6 | +1.4 / +1.4 | 42.804 → 10.968 (**3.90x**) |

Hospital's refined set is **9.2% of its curve-detected geometry**. The realised improvement beats
the 4x the theory predicts, because the gate selects the worst offenders and those improve most.

### §D3.6 — the shape factor is DERIVED, not tuned
The plain linear midpoint leaves the sag untouched; the *fully* projected Phong midpoint OVERSHOOTS
(a 12-gon goes from −3.4% inside to +3.1% outside — no gain). The damped midpoint
`m' = m − (α/2)·[((m−p_i)·n_i)n_i + ((m−p_j)·n_j)n_j]` is exact on a cylinder at
`α = (sec(θ/2) − 1)/sin²(θ/2)`, whose limit as θ→0 is **exactly 1/2** (`sec x − 1 ~ x²/2`,
`sin²x ~ x²`). It barely moves over the range that matters: **0.527 at N=12, 0.539 at N=10, 0.619 at
N=6.** So `ALPHA = 0.5` is the second-order-exact value, not a knob turned until it looked right.

### §D3.7 — safety, met by construction (the user's standing constraint, without a class list)
*"It must not impact non curve intending surfaces."*
- A midpoint on a **HARD** edge is **never projected**. The midpoint of a straight edge lies **on**
  that edge, so a planar facet keeps the same plane, outline and area.
- Midpoint positions are computed once per **welded representative** pair and shared by both
  neighbouring faces, so a crack is impossible and the result cannot depend on triangle visit order.
- The per-face vertex split of the source data is preserved — nothing is welded or renumbered, so
  picking, per-element hide, the BVH and `§TRIPLANAR`'s `vTriWorldNormal` all still see their layout.
- **No building name, no IFC class list, no material name anywhere in the file.** A round column, a
  curved railing, a dome and a duct are judged by the same two lines of arithmetic (user, 2026-09-02:
  *"No custom code to any particular building has been our rule."*).

### §D3.8 — TWO THINGS THE WITNESS CAUGHT AND THE CODE CHANGED FOR
Recorded because both were plausible on paper and wrong in measurement:
1. **Curved-shell-only refinement + green T-junction closure — MEASURED WRONG, abandoned.** Refining
   only triangles touching a smooth edge and closing the frontier with 1→2 / 1→3 green splits is
   ~2.6x instead of 4x, and it is the obvious optimisation. On real Hospital geometry it drove
   **non-manifold edges 24 → 211** and opened **875 T-junctions**, because a real IFC mesh is not the
   clean two-manifold that argument assumes — it carries edges shared by 3+ faces, and a
   refined/unrefined frontier through one of those cannot be closed by a green split. **Uniform 1→4
   removes the frontier itself**, so a crack is impossible by construction. The extra cost is the
   4x column above and it is paid deliberately.
2. **Midpoints built from whichever per-face copy the loop reached first.** Copies that weld together
   can still differ by up to the 0.1 mm quantum, making the output depend on triangle visit order.
   Now built from the **welded representative**.

### §D3.9 — WITNESS: `viewer/tests/witness_duct_silhouette.js` — **W-DUCT-SIL 10/10, 37 refined
elements across 8 building DBs, red control caught, exit 0**
No browser, no bake, no screenshot anywhere in the chain — it reads real geometry blobs out of the
shipped DBs and calls the shipped module (CLAUDE.md PRIMAL LAW + FUNDAMENTAL LAW).
- **C2 (load-bearing)** — non-curve surfaces unmoved: 0 original vertices lost, every hard-edge
  midpoint within **4 float32 ULP** of its own edge. Stated in ULPs because that is the measurement
  floor: positions live in a `Float32Array` whose ULP at a 35 m coordinate is 4.2 µm, while a real
  displacement would be the sagitta — **millimetres, ~1000x above it**. The red control sets 120 ULP
  and is caught.
- **C3 / C3b** — sagitta improves ≥3.5x fleet-wide and **no element regressed**, re-measured on the
  **output** mesh, not predicted from the formula that motivated the change.
- **C4a** — the uniform-refinement identity `V'=V+E`, `E'=2E+3T`, `T'=4T` holds **exactly** on every
  weld-injective element, with boundary and non-manifold structure exactly doubled.
- **C4b** — direct point-on-edge crack scan, **scoped and declared**: 8 clean-input elements judged
  of 37; the 29 that entered with coincidences and the 2 over the scan cap are named, not passed
  over. Prints `INCONCLUSIVE` rather than PASS if the judged population is empty.
- **C5** — `§SIL_NOOP gateM=1e9 judged=400 refined=0 geometryChanged=0` — the pass declines and says
  **NO-OP**, exercised for real against the same population.
- **C6** — triangle growth is exactly 4x per element, never more.
- Per-building `§SIL_BUILDING` lines print **NO-OP** where nothing qualified (JKR at the 800-geometry
  sample), never a green zero.

### §D3.10 — three measurement traps recorded, so the next session does not pay for them again
1. **A 12-gon round duct has ~14 distinct face normals and therefore FAILS the shipped shape gate
   `CURVE_MIN_DISTINCT = 16`.** It is smoothed only because `IfcDuctSegment` is on
   `MEP_CURVE_CLASSES`. Any future work that assumes the shape gate alone covers round ducts is wrong.
2. **The class gate lets boxes through.** Hospital/HHS `IfcFlowTerminal` includes 12-triangle,
   `distinct=6` tapered boxes (rectangular diffusers) that bypass the shape test entirely via the
   class list. Harmless for shading; it would be a disaster for re-tessellation, which is why this
   pass gates on **shape only** and never reads a class.
3. **A nearly-coplanar triangle pair fits an arbitrarily large circumradius** and reported a
   **4,290.9 mm** bulge on a flat `IfcWallStandardCase`. Two physical guards, not tuned thresholds:
   `s ≤ 0.25 × bbox diagonal`, and **≥ 6 smooth edges** (a real tessellated curve has many facets at
   a consistent step). With the guards on, `IfcLightFixture` drops out of the offender list — which
   independently reproduces the user's own "it works on lamps".

**Files:** `viewer/silhouette_refine.js` (new) · `viewer/scene.js` (`A.blobToGeometry` — the single
geometry choke point, and the only place refinement can happen: both batch paths size their
`BatchedMesh` from `item.geo` at flush time, so an already-refined geometry is reserved for
correctly with no batch change) · `viewer/streaming.js` (reports next to `§MEP_SMOOTH_NORMALS`, so
the shading half and the outline half are read together) · `viewer/sw.js` `CACHE_VERSION v1128→v1129`
+ precache entry · `viewer.html` `scene.js?v=58→59`, `streaming.js?v=68→69`, all in the same commit.

---

## §SFR_FIXTURE_FIRST — U-11 re-scoped: *"Will room lighting be better if it has no Sun?"* + *"it should be LIVELY"* (2026-09-02/03)

> **User:** *"Will room lighting be better if it has no Sun?"* — light a room from its OWN fixtures
> rather than from sun/environment fill.
> **User, same session:** *"About room lighting, it should be LIVELY. So far it has never been,
> though lighting has been BRIGHT."*

**⛔ NOT DONE. Nothing shipped from this section. Read §SFR_NEXT at the bottom for the one blocking
item.** What IS settled below is settled with numbers; what is not is named as not.

### 0. THE HEADLINE CORRECTION — `pl = 0.00000` WAS AN INSTRUMENT ARTEFACT, AND TWO PUBLISHED CLAIMS ABOVE ARE WRONG

`§SUN_FILL_RATIO`'s own record states, twice, that the staged fixture point lights contribute
nothing: *"`pl` measured 0.00000 on the away facade in every run"* and `§SFR_INTERIOR_DECOMP`'s
*"`pl=0.00000` … So the room is left on the non-directional fill alone."* **Both are false.** They
came from one line in `viewer/tests/witness_sun_fill_ratio.js`'s light-group isolator:

```js
if (!W._plI) W._plI = new Map(ls.map(l => [l.uuid, l.intensity]));
ls.forEach(l => { const v = W._plI.get(l.uuid);
                  l.intensity = on ? (v === undefined ? l.intensity : v) : 0; });
```

First use is the **plainNav** decomposition, where night mode is off and there are **zero** point
lights — so the restore map was captured EMPTY and never rebuilt. At Alt+S the ~216 staged fixture
lights are all absent from it, so `off` set every one to 0 and `on` restored
`l.intensity = l.intensity` = **0**. From the first `pl` toggle onward the fixture pool was dark for
the rest of the run. The closure check could not catch it, because the all-on reference render for
the *second* wall side was itself taken after the lights were already zeroed (0 − 0 = 0, closure
1.000). The same bug shape sat in the `env` and `emissive` groups — and the emissive one explains the
other published oddity, `emissive=0.00055` and the Clinic interior decomposition that *"could not
account for 55% of that frame"*: `A._applyNightGlowToMatCache()` CREATES the luminaire/window glow
during staging, so a set captured at plainNav does not contain the materials the group exists to
measure.

**Corrected, both buildings, real renders, fixture pool live and re-selected at every pose**
(`§SFR_INTERIOR_DECOMP`, GREEN/shipped state):

| interior standpoint | total | ambient | hemi | env | **pl (fixtures)** | emissive | closure |
|---|---|---|---|---|---|---|---|
| Hospital `≈ Level 1 R18` | 0.33102 | 0.09045 | 0.08146 | 0.04469 | **0.09724 (29.4 %)** | 0.00387 | 0.960 |
| Clinic `≈ First Floor R62` | 0.32692 | 0.06048 | 0.05472 | 0.03378 | **0.07111 (21.8 %)** | 0.00816 | 0.699 |

**The room is NOT "left on the non-directional fill alone." The fixtures are already its single
largest directional term.** Clinic's 0.699 closure is the sky-through-a-window term this file
already named — unchanged and still not chased.

Away-facade `pl`, corrected: Clinic **0.00753 of 0.16429 (4.6 %)**, Hospital **0.00029 of 0.13786
(0.2 %)**. Still small — so the *conclusion* PR #1622 shipped on (the HDRI matte fill was the cause)
is unaffected — but "certainly not the cause" was being asserted from a number that was not measured.

**Re-proved endpoints with the corrected instrument** (`§SFR_REDGREEN`, `§SFR_CONTROL` drift
0.00000 on Clinic): plainNav **0.2414 / 0.2371**, RED **1.0434 / 1.0608**, GREEN **0.2526 / 0.2839**.
The shipped separation is **0.2526 (Clinic) / 0.2839 (Hospital)**, not the 0.2388 / 0.2347 recorded
above — that pair was measured with the fixture lights artificially at zero. **Use these numbers.**

### 1. THE SECOND DEFECT — THE STILL'S NEAR-FIELD BOOST NEVER FIRES ON AN INTERACTIVE Alt+S

`tools.js` defines two constants *for the frozen still specifically*:
`A._nightNearFadeFloorStill = 1.0` (*"still: no proximity penalty at all"*, `tools.js:1089`) and
`A._nightMaxLightsStill = 50` (`tools.js:1087`). `effects.js`'s §NIGHT_STILL_LIGHTS block applies
them — but it is guarded:

```js
// effects.js:4918
if (A._nightStillBoost &&
    A._nightLights && A._nightLights.length && typeof A._nightUpdateLights === 'function') {
  A._nightMaxLights      = A._nightMaxLightsStill;
  A._nightNearFadeFloor  = A._nightNearFadeFloorStill;   // §NIGHT_NEAR_FADE
```

…and `_applyPhotoStaging()` — the call that turns Night Mode on and **builds those very lights** —
does not run until **`effects.js:4945`**. On the normal path (Alt+S from a session not already in
Night Mode) `A._nightLights` is empty at :4918, the guard is false, and the block is skipped.

**MEASURED LIVE, both buildings, inside a real `A.startStillRefine()`** (`§SFR_POOL` census):
`"maxLights":30, "nearFadeFloor":0.3` at **every one of the five poses on both buildings** — the
NAVIGATION values. §NIGHT_NEAR_FADE's own comment on that floor: *"exactly backwards for the
complaint now being made: standing under a fixture gives the WEAKEST light in the scene… lifted to
full strength for the frozen still."* It is not lifted. Scale of the miss: `intensity = 2.0 ×
(floor + (1−floor)·min(1, d/15)) × plScale`, so at 3 m a fixture gives 0.44 instead of 1.0 (**2.3×**)
and at 1.5 m 0.37 instead of 1.0 (**2.7×**); at ≥15 m the two are identical, so a facade 12 m out is
untouched. Clinic has **240 luminaires within 15 m** of interior0 and Hospital 114 within 15 m of
its interior1 — i.e. essentially every fixture that lights a room is inside the penalty window.

**⚠ SCOPE, and it matters — this is NOT the film explanation.** `startStillRefine()` runs once per
FOLD, so in a bake frame 1 skips the block (night mode still off) and **frames 2…N do fire it**
(that is the 2,026 firings the §VAC comment at `effects.js:4923` already records from
`s5_hospital.log`, *"raised to 200 lights, near-fade floor 1"*), with `_teardownStillRefine`
(`effects.js:4291-4295`) handing the floor back to 0.3 between frames. So: **a FILM already gets the
still floor from frame 2 onward; an interactive Alt+S never does, and neither does a film's first
frame.** Do not sell this as the cause of the drained bright register in the exported films.
This is a real defect in the Alt+S still path and a 2-line fix (move the block below
`_applyPhotoStaging()`), but its measured EFFECT is not yet trustworthy — see §2c.

### 2. WHAT THE LEVERS MEASURE — two-sided gate, both buildings, `m = 0`

Instrument: `viewer/tests/witness_sun_fill_ratio.js`, real viewer, real split DBs, real
`A.startStillRefine()` staging, scene-linear `FloatType` render-target reads, **no bake, no
screenshot, no film**. Logs: `sfr_clinic6.log`, `sfr_hospital6.log` (session scratchpad).

**Liveliness is measured as SHAPE, not level** (`§SFR_LIVELY`), all from the same single render:
`cv = std/mean`; `p90/p10`; `topShare` (share of frame luminance in the brightest decile — 0.10 is
perfectly flat); `tileCV` (cv of 8×6 tile means = the spatial falloff gradient); `wcStd`
(luminance-weighted stddev of the warm/cool axis `(r−b)/(r+b)` = chromatic separation).
**Every figure is a ratio against the CURRENT shipped state (m = 0, post-#1622)** — #1622's own CV
gain is already in the baseline and is not re-claimed.
**The gate is two-sided:** clear the T3 floors (mean ≥ 0.70, p25 ≥ 0.55, §WALL_SIDE_AND_LIGHT_FLOOR)
**AND** keep `cv` and `tileCV` at ≥ 0.98× the shipped value. A lever that buys the mean by flattening
the field would undo #1622 and is scored **REJECT**, not PASS.

| lever | Clinic retMean / retP90 | Clinic cv · tileCV | Clinic verdict | Hospital retMean / retP90 | Hospital cv · tileCV | Hospital verdict | facade separation |
|---|---|---|---|---|---|---|---|
| shipped `m=0` | 0.743 / 0.892 | 1.00 · 1.00 | baseline | 0.598 / 0.545 | 1.00 · 1.00 | baseline | 0.2503 / 0.2723 |
| **fixtures ×2** (`_nightPLScaleStill` 0.5→**1.0**) | **1.284 / 1.731** | ×0.92 · ×1.10 | REJECT (cv) | **0.814 / 0.844** | **×1.58 · ×1.75** | **WIN** | 0.2591 / 0.2717 |
| **fixtures ×4** (scale 2.0) | **2.130 / 3.118** | ×1.02 · ×1.27 | **WIN** | **1.222 / 1.417** | **×2.22 · ×2.57** | **WIN** | 0.2767 / 0.2704 |
| `m` = HDRI fill 0.25 | 0.914 / 1.118 | ×0.83 · ×0.96 | **REJECT** | 0.683 / 0.649 | ×1.05 · ×1.12 | floors missed | 0.4568 / 0.4318 |
| `m` = HDRI fill 0.50 | 1.040 / 1.290 | ×0.75 · ×0.90 | **REJECT** | 0.837 / 0.810 | ×0.92 · ×1.01 | **REJECT** | 0.6737 / 0.5830 |
| `m` = HDRI fill 1.00 (= RED) | 1.293 / 1.599 | ×0.66 · ×0.83 | **REJECT** | 1.146 / 1.133 | ×0.76 · ×0.89 | **REJECT** | 1.0397 / 0.7997 |

**a. The `m` lever is REJECTED, on both buildings, at every sampled fraction.** It is the textbook
failure the two-sided gate exists to catch: it lifts the mean (0.743 → 1.293 on Clinic) while
driving `cv` **down** (×0.66) and `topShare` down (×0.83), i.e. it buys brightness by flattening the
field — and it costs the facade the whole of #1622 (separation 0.2503 → 1.0397). **U-11's `m` option
should be closed, not tuned.** The one HDRI row that is not an outright REJECT (Hospital s0.25,
"shape kept") does not clear the floors.

**b. The fixture route is the only one that raises the field.** At the shippable ceiling
(`_nightPLScaleStill = 1.0` — `A._nightPLScale`'s own nav-tuned default and the value §STAGED_PL_CUT
cut FROM, so no constant is invented) Hospital is a clean **WIN**: floors cleared, `cv` ×1.58,
`tileCV` ×1.75, `topShare` ×1.37, and the **upper register restored 0.545 → 0.844** — the exact
register the real-bake A/B says drained. **The facade is free**: Hospital's separation moves
0.2723 → 0.2717 across the whole ×1…×4 sweep, Clinic's 0.2503 → 0.2767. Clinic at ×2 clears the
floors and raises `tileCV` (×1.10) and `p90/p10` (×1.39) but dips `cv` to ×0.92, so the gate scores
it REJECT; both buildings are a WIN at ×4, which is `_nightPLScaleStill = 2.0` — **an invented
constant, so it is not proposable.**

**c. OPT_F (the near-field floor), OPT_B (decay 2.0) and OPT_D (emissive ×3) are INCONCLUSIVE, not
measured.** OPT_F reports a **darker** frame (retMean 0.563 Clinic / 0.435 Hospital) while the
shipped pool total it produced **rose** (Clinic 147.936 → 171.04 at extSun, live lights 99 → 122).
That is physically impossible for purely additive light — `floor + (1−floor)·fade` is monotone
non-decreasing in `floor` — so the reading is an instrument fault, not a property of the lever.
See §3.

**d. The colour levers (A and C) are CLOSED without a render** — see §SFR_LIVELY option A + C below.

### 3. THE THIRD INSTRUMENT DEFECT — PROBE CROSS-CONTAMINATION, and how it was isolated

This lane has now hit three instrument faults in a row, and they cost more than the measurement did.
Recorded so the next session recognises the shape:

1. **`tools.js`'s pooled fixture update overwrote a per-light sweep** (already on record above) — a
   per-light intensity write is recomputed from `A._nightPLScale` on the next update, so the sweep
   measured nothing and reported a clean 0.
2. **The light-group restore map captured empty** (§0) — manufactured `pl = 0.00000` and two
   published claims.
3. **Probe cross-contamination (new).** In the first clean run the option probes ran in sequence
   within one pose, each restoring what it changed. Two did not restore:
   - `W.setPLDecay` cached ONE scalar base off `ls[0]` — which is a **city-prop** point light with
     `decay = 2`, not a fixture light with `decay = 1` (visible in the `§SFR_POOL` colour census as
     `"decay":"1..2"`). "Restoring" therefore set **every fixture light to decay 2 permanently**,
     dimming the whole far field for the rest of the pose.
   - `W.setNearFadeFloor` let a non-finite value through `f < 0` into `A._nightNearFadeFloor`, where
     `floor + (1−floor)·fade` turns it into 0-or-NaN, and then **rebuilt the pool from it**.

   **How it was isolated — the signature, not a guess:** on both buildings the four option rows
   downstream of the first bad probe reported **byte-identical** `retP25 / retP90 / retP10`
   (Hospital: 0.473 / 0.365 / 0.511 on all four; Clinic interior2: `nearFadeStill` and `decay2` both
   exactly 0.15612). Four different levers cannot produce identical percentiles; a dead pool can.
   Fixes now in the witness: per-light decay base (a Map, not a scalar), a hard range guard on the
   floor, the fallback `m` sweep moved BEFORE any option probe so it can never sit downstream of
   one, and — the general remedy — **every sample now records the pool it was taken against**
   (`pool[live=… sum=… floor=… scale=… decay=…]`) and any row with `poolLive = 0` prints
   `INCONCLUSIVE` instead of a verdict.
4. **A fourth, still open.** Even after those fixes, the baseline sample's own pool disagrees with
   the pose census taken moments earlier (Clinic interior0: `pl_x1` reads `pool[live=46 sum=88.036]`
   against a census of `sum=103.084`; the missing ~16 lights are the city props). Consequence:
   **the interior baseline is not reproducible run to run** — Clinic's baseline `cv` read 1.0825 in
   one run and 0.5207 in the next, a 2× swing in the headline metric, far outside the RED CONTROL's
   own drift (0.00000 Clinic / 0.01278 Hospital). **Until that is closed, no lever's ranking is
   safe and nothing here should ship.**

**Instrument changes that DID gate clean and are worth keeping:**
- **§SFR_FROZEN_POOL.** Refreshing the pool per pose is mandatory (the shipped still branch selects
  by camera frustum, so the pool is pose-dependent) — but on the shipped churn path every pose change
  moves the scene's point-light COUNT, a shader DEFINE, and two full runs sat **>20 min inside a
  single wall pose** recompiling. The witness now runs the SHIPPED `§NIGHT_BAKE_POOL` path
  (`A._maxqActive`), which freezes the slot count and updates position/colour/intensity as uniforms.
  **POOL-MODE CONTROL passes on both buildings: `relDrift = 0.00000`** (same pose, camera untouched).
  Its first version FAILED at 0.179 because it read before the churn-path refresh and so compared a
  stale pool against a fresh one — a confounded control, corrected by reordering, not explained away.
- **FREEZE CONTROL** Clinic 0.00000 / **Hospital 0.00515 (FAIL, gate 0.005)** — Hospital's shadow
  freeze is marginal and its RED CONTROL also failed at **0.01278**. Hospital's run therefore carries
  ~1.3 % instrument drift; the effect sizes above (×1.58, ×1.75) are well clear of it, the `m` rows'
  shape deltas mostly are not.

### 4. WHAT THIS MEANS FOR THE COMPOSITION (sun shafts through windows) — noted, not built

A fixture-lit interior at `_nightPLScaleStill = 1.0` raises the interior's own `topShare` (Hospital
×1.37) and `tileCV` (×1.75) while leaving the facade separation flat (0.2723 → 0.2717). A shaft is a
high-`topShare`, high-`tileCV` feature in the same frame, so the two ADD rather than compete: the
room's ambient floor does not rise (ambient/hemi/env are untouched), only the fixture-lit patches do,
which preserves the contrast a shaft needs to read. The `m` lever would do the opposite — it raises
the whole non-directional floor, which is precisely what washes a shaft out. **Not built, not
measured; recorded as the prediction to test if shafts are ever specced.**

### 5. §SFR_NEXT — the exact next step, and the one blocking question

1. **Close instrument fault #4 first** (§3.4). The baseline sample must reproduce the pose census
   (`pl_x1.pool.sum == census.sum`) before any ranking is trusted. Likely cause to check first: the
   city-prop point lights (`effects.js:660-723`) are in `W.pointLights()` but are NOT rebuilt by
   `A._nightUpdateLights()`, so `W._plBase` and the group-restore maps can disagree about them.
   Add an assertion that the two agree and re-run both buildings. **Everything else waits on this.**
2. Then re-measure OPT_F/B/D with the hardened probes and settle §1's fix.
3. `§NIGHT_STILL_LIGHTS` ordering fix (`effects.js` — move the :4918 block below the
   `_applyPhotoStaging()` call at :4945) is a real, independently-proven defect and is a 2-line
   change; hold it until step 1 lets its effect be measured, so it does not ship unmeasured.

⛔ **THE ONE USER QUESTION (→ AGENT_QUEUE U-11):** the only lever that passes the two-sided gate on
BOTH buildings is `_nightPLScaleStill = 2.0` (fixtures ×4), which is an invented constant. The
largest *repo-native* value, `_nightPLScaleStill = 1.0` (fixtures ×2), passes cleanly on Hospital and
fails Clinic on `cv` alone (×0.92) — and it **partially reverses §STAGED_PL_CUT, a standing user
directive** (*"too bright … reduce PLs or intensity. As it also wipe out the ground slab shadow play
during alt-c movie baking"*). Measured, that directive's stated harm is small at the wall poses
(separation moves ≤ 0.026 across the whole sweep) but **the ground slab was never in the measured
set.** So: *do you accept undoing half of §STAGED_PL_CUT (staged fixture scale 0.5 → 1.0) to get the
interior's own fixtures back, given the away-wall read is measured to cost ≤ 0.026 and the ground
slab is unmeasured?*

### §SFR_LIVELY option A + C — the colour lever is ALREADY at its ceiling, closed WITHOUT a render (2026-09-02, `nlc_spread.log`, `colour_spread_probe.js`)

Candidate A was *"fixture colour temperature (~2700–3000 K warm against a cooler sky)"* and C was
*"per-fixture variation derived from the model's own fixture type/class — not random, not
per-building."* **Both already ship, and what ships is the best of the three the repo can express.**
`A.nightLightColor(name, key)` (`tools.js:1151`) is called from exactly one place
(`A._nightFixtureWorldPositions`, `tools.js:1631`) and ALWAYS with a `key`, so the 20/20/60 hash mix
(`NIGHT_MIX_BLUE 0xa8c8ff` / `NIGHT_MIX_AMBER 0xffb45c` / `NIGHT_MIX_WHITE 0xffffff`) always wins —
the mix the user asked for by name.

Measured on `wc = (r−b)/(r+b)`, the same scale-invariant chromatic axis §SFR_LIVELY scores, over the
real luminaire population selected by tools.js's own §NIGHT_FIXTURE_VOCAB `WHERE` clause:

| building | luminaires | SHIPPED hash mix `wcStd` | option C (white bucket tinted by the model's own name) | the type rule alone |
|---|---|---|---|---|
| Clinic | 884 (47 exit) | **0.2179** | 0.2201 (**+1.0 %**) | 0.1249 (**−42.7 %**) |
| Hospital | 1,272 (57 exit) | **0.2182** | 0.2181 (**−0.1 %**) | 0.0581 (**−73.4 %**) |
| Terminal | 814 (38 exit) | **0.2256** | 0.2286 (**+1.3 %**) | 0.1019 (**−54.8 %**) |

- **Option C as framed — "derive it from the fixture type, not random" — is measurably WORSE, by
  43–73 %.** The type vocabulary collapses a building onto two or three temperatures: Hospital has
  **0** troffer/batten/T8 names and only **64** downlight/sconce/pendant of 1,272, so 1,151 fixtures
  fall to a single `NIGHT_AMBER` fallback. The hash is not "random" in the sense that matters — it is
  FNV-1a over `name|x,y,z`, deterministic across sessions and machines, and it is the only rule that
  keeps three temperatures on a model whose names state nothing.
- **A real doc-vs-code defect, but NOT a liveliness lever:** `NIGHT_WHITE_COOL 0xf2f6ff` and
  `NIGHT_WHITE_WARM 0xfff4e4` (`tools.js:1137/1138`) are **declared and referenced nowhere in
  `viewer/`**, while the §NIGHT_MIX_WHITE comment three lines above states as fact that *"the white
  bucket is neutral by default and tinted a few points when the model says which it is."* It is not.
  Wiring them in moves `wcStd` by **+1.0 % / −0.1 % / +1.3 %**. Fix the comment or wire the
  constants — but do not spend a render on it and do not sell it as liveliness.
- **0 of the 2,970 luminaires on Clinic/Hospital state `cw`/`ww`** (Terminal states 368), so the
  "stated temperature outranks the type default" path is, on the two buildings under test, a
  population of zero. Recorded so no future session re-derives it.

### §SFR_LIVELY option E — exposure/tone cannot add liveliness, BY IDENTITY (no run spent)

`toneMappingExposure` multiplies the linear colour **before** the ACES curve — verified in this
repo's own bundled three.js, not from memory: `viewer/lib/three.module.min.js` contains
`color *= toneMappingExposure / 0.6;` as the first line of `ACESFilmicToneMapping`, ahead of
`ACESInputMat`/`RRTAndODTFit`. A scalar multiply leaves **every** §SFR_LIVELY metric exactly
invariant (`cv`, `p90/p10`, `topShare`, `tileCV`, `wcStd` are all ratios or scale-invariant moments).
So exposure cannot manufacture shape; only the curve can, and it ends in `saturate(color)`, which
compresses the highlights — the register that is already drained. **Ranked last, and closed.**
(Also verified in the same bundle: `toneMapping` is forced to `NoToneMapping` whenever the render
target is not the canvas — `r.toneMapped && (null !== F && !0 !== F.isXRRenderTarget || (Le = e.toneMapping))`
— which is what makes every render-target read in this witness scene-linear.)

## §BAKE_INTERIOR_TOPUP — 2026-09-04 — ✅ SHIPPED (witness), bim-ootb PR #1642

> **USER, 2026-09-04, mid Hospital Alt+C bake:** *"i can visually see that the indoor is gloomy and
> not lively. Discuss. if it is color, or surface, or lighting effects?"* and, minutes later, the
> sentence that decided it: *"I noted that outside the scene of the building is very lively, thus
> indoors can also be."* Later still, on the second bake: *"On indoors, it is still ok, but been
> livelier while maintaining realism be good."*

### §BIT.0 — the three-way answer, with the number that decides each

**It is LIGHTING. Colour and surface are exonerated by measurement, not by argument.**

| candidate | verdict | the number |
|---|---|---|
| colour | **improved**, not regressed | #1621 §MEP_COLOR_SURVIVES_PHOTOREAL + #1604 §MEP_DISC_PALETTE gave MEP its trade colour back instead of uniform grey metal |
| surface | **improved**, not regressed | roughness/metalness are CLASS-keyed (`streaming.js:1219/1233`), untouched this window; #1631 §DUCT_SILHOUETTE added outlines |
| lighting | **the cause** | see §BIT.1 |

A lead that had to be RETRACTED, recorded so it is not re-chased: `~/Downloads/Hospital_silent.db`
carries `material_name` NULL on all 64,150 rows while the served `Hospital_meta.db` has 17 distinct
names, which looked like it would collapse the glossy set and strip the HDRI from everything. **It
does not.** `material_name` never reaches roughness/metalness — the rule is class-keyed — and the
glossy census is IDENTICAL across the two DBs: 56/82 material keys by the parsed `STD_MAT` rule,
59,890/63,182 elements (94.8%); browser-confirmed 97 materials / 71 glossy / 59,924 of 63,316
(94.6%), so #1622's "70/70 Hospital glossy still on the HDRI" holds. The user's local DB is not
handicapped.

### §BIT.1 — the defect: a bake pose can select ZERO fixture lights, and scaling zero is zero

`tools.js _nightUpdateLights`'s still/bake branch (§NIGHT_STILL_FRUSTUM, 2026-08-07) selected
fixture point lights by **frustum-CENTRE containment only, with no floor**. An interior pose is
precisely the case that test answers wrong: the troffers lighting the room you stand in sit
overhead or behind the eye, so the set comes back short — or empty.

Since §NIGHT_BAKE_POOL (2026-09-01) froze the pool size for the whole bake, an empty set no longer
disposes the lights; it leaves **every pooled slot at intensity 0**. The room is then lit by flat
ambient + hemi fill alone. Two consequences worth stating plainly:

- **This is why the exterior stayed lively while the interior did not.** Photo staging turns the
  sun's shadow casting on, so an interior surface is shadow-occluded from the sun and depends on the
  fixtures for everything that is not flat fill; an exterior surface keeps the sun and loses almost
  nothing. One mechanism, both halves of the user's report — and it also explains the older
  "Fly/handsfree is well lit, the bake is dark" split, since navigation never takes the frustum
  branch (§NIGHT_STILL_BOOST_GATE_FIX).
- **It supersedes the U-11 fixture-scale question for the FILM case.** `_nightPLScaleStill` (0.5,
  §STAGED_PL_CUT) *scales this set*. Scaling zero is zero, so no value of that constant could ever
  have reached a pose whose selection was empty. U-11's `m`-lever remains closed and its fixture
  lever remains a live user decision for Alt+S, but neither is the film explanation.

Also live and fixed here: **§BAKE_FRUSTUM_STALE** — the frustum was built from
`camera.matrixWorldInverse` with no `updateMatrixWorld()`, while `cinema_maxq.js` sets the pose and
calls `startStillRefine()` *before* any render of it. The cull was running against the previous
frame's view.

### §BIT.2 — the fix, and what was deliberately NOT taken

Reuse, not reinvention: the in-frustum set is **topped up** to the still budget using the SAME
nearest-to-aim + §NIGHT_SPREAD rule navigation already uses, extracted VERBATIM as
`_nightPickNearest` (§NIGHT_PICK_NEAREST) so nav and bake cannot drift into two selection rules.
Nav calls it with an empty `already` set and is behaviourally identical. The in-frustum set is
**never truncated** — the top-up only fills the remainder. No new constant, no fitted value.

This is the `tools.js` half of the **parked PR #1327 §BAKE_INTERIOR_LIGHTS** (2026-08-12), which
measured the same defect on a headless Duplex bake: 18 fixture lights at frame 0, **0 from frame 1
for the rest of the film**, scene point-light intensity sum 127.39 → 82.39 = exactly
18 × NIGHT_LIGHT_INTENSITY(2.5). That PR sat 312 commits behind main; its own triage note
(2026-09-02) records `viewer/effects.js` as a **non-mechanical** conflict against §NIGHT_BAKE_POOL /
§STAGED_PL_CUT and rules it unsafe to blind-merge. Taking only the `tools.js` half avoids that
conflict entirely.

**NOT taken, on purpose:**
1. #1327's `effects.js` re-arm-gate fix (the gates read `A._nightLights.length`, the OUTPUT of the
   selector). §NIGHT_BAKE_POOL keeps that array full for the whole bake, so the self-latching zero
   is already masked *for films*. It is still live for interactive Alt+S — see U-11's measurement of
   `nearFadeFloor: 0.3, maxLights: 30` at five live poses — and remains open there.
2. #1327's **§BAKE_LIGHT_BUILDUP_GATE**, which would gate the illumination on Time Machine
   placement so a light cannot shine from an un-installed fitting. It is correct in principle and
   the glow sprite already does it (`§PHOTO_GLOW_SPRITE_GATE 0/18 fixtures placed yet` while 18
   point lights shone from those same fittings), but it **REMOVES** interior light during round 1
   of a 4D film, which runs against the user's live ask. It needs its own decision, not a silent
   ride-along.

### §BIT.3 — witness

`viewer/tests/witness_bake_interior_topup.js` — **W-BAKE-TOPUP 8/8, RED control detected.** Whitebox,
no browser: slices `_nightPickNearest` and `_nightUpdateLights` out of the shipped `tools.js` by
brace matching and reads `NIGHT_SPREAD_MIN_M` from the file rather than hardcoding it, so it cannot
pass against a copy that is not what ships. The verdict line prints NO-OP (the top-up never changed
a selection), VACUOUS (no scenario judged) or INCONCLUSIVE (the slice failed) instead of PASS.

```
§BAKE_INTERIOR_TOPUP_ROW bake-interior-frustum-empty fixtures=40 budget=50 inFrustum=0  lit=40
§BAKE_INTERIOR_TOPUP_ROW bake-interior-frustum-short fixtures=40 budget=50 inFrustum=3  lit=40
§BAKE_INTERIOR_TOPUP_ROW bake-wide-frustum-full      fixtures=80 budget=50 inFrustum=60 lit=60
§BAKE_INTERIOR_TOPUP_ROW alt-s-frustum-short         fixtures=40 budget=50 inFrustum=2  lit=40
§BAKE_INTERIOR_TOPUP_ROW nav-no-still                fixtures=40 budget=24 inFrustum=0  lit=24
```

The shipped runtime line to look for in the next bake log is
`§BAKE_INTERIOR_TOPUP inFrustum=N toppedUpTo=M budget=B fixtures=F`, run-length guarded (it would
otherwise fire once per baked frame). An `inFrustum=0` row names itself: *"frustum found NO fixture
centre at this pose; without the top-up this frame had zero fixture light"*.

### §BIT.4 — what is still open

- The **⛔ U-11 fixture-scale decision** (staged `_nightPLScaleStill` 0.5 → 1.0, partially reversing
  §STAGED_PL_CUT) is unchanged and still the user's. It now applies to a set that is actually
  populated, so its measured effect should be RE-TAKEN after #1642 rather than read off the
  pre-#1642 sweep.
- **NOT MEASURED:** how many poses of a real Hospital film actually had `inFrustum=0`. The defect is
  proven structurally and by #1327's Duplex run; the Hospital-specific frequency needs the shipped
  `§BAKE_INTERIOR_TOPUP` line from the user's next bake log. Do not quote a number for it until then.
- #1327 should be closed as superseded-in-part once #1642 lands, with its two untaken halves carried
  forward rather than lost.

## §BAKE_MISSING_ELEMENTS — 2026-09-04 — 🟠 ROOT CAUSE MEASURED (§BME.8), FIX RED/GREEN-PROVEN (§BME.10), bim-ootb PR #1660. READ §BME.10 (newest, at the END of this file) THEN §BME.9 — §BME.1–§BME.6 are the pre-solution record

> **USER, on the landed Hospital silent bake** (`~/Downloads/Hospital_silent_bake_2026-09-04.mp4`,
> 2,937 frames, 195.8 s, sw v1138):
> *"some window glass panels not landed completely, leaving omissions. This maybe with other elements
> too thruout. This seems an anomaly as all this while they land evenly and completely."*
> … *"comparing to previous bake at seconds 47-55"* … *"they are selective not thru out"*
> … *"Even at 1min22sec u can see some chairs but not full table sets. This is erroneus behaviour
> introduced."* … *"before this is was not an issue."*

**THE DEFECT IS REAL AND IT IS NOT SOLVED.** Everything below is measured; the cause is still open.

### §BME.1 — what is CONFIRMED (do not re-derive)
- **Visually confirmed at full build.** Frame at **78 s** (fly-back) reads `Day 310 / 310` — the
  buildup is COMPLETE — and the left elevation still shows bays open to the interior with only a
  couple of infill panels. **So it is NOT schedule pacing.** (The user's own invariant, and it is
  correct: *"In the return to start, the whole buildup is supposed to be fully completed."*)
- Previous bake for contrast: `BIM_MaxQ_Hospital_1788397252225.mp4` (2026-09-03 09:00, 3,118 frames,
  207.9 s) at the same second reads `Day 273 / 507` with the ribbon glazing solid. Different film
  lengths, so timecodes do NOT align frame-for-frame — the Day 310/310 frame is the load-bearing one.
- **It spans classes**: glass panels at 0:47–0:55, and *"some chairs but not full table sets"* at
  1:22. Partial sets of an assembly, across unrelated classes. Not a discipline, not one material.

### §BME.2 — what is RULED OUT, with the number that rules it out
| candidate | verdict | evidence |
|---|---|---|
| schedule / buildup omission | **OUT** | `§CPE_BUILDUP frame=2936/2937 t=1.000 placed=63415/63415`; `kernel_ops` holds exactly 63,415 `ELEMENT_PLACE` ops |
| missing geometry in the DB | **OUT** | every `IfcPlate` 2211, `IfcMember` 7127, `IfcWindow` 131 has an `element_instances` row AND its `geometry_hash` resolves in `component_geometries` — 0 missing |
| placement timing | **OUT** | on the played layer: `IfcWindow` all by 8.7 s, `IfcCurtainWall` 43.4 s, `IfcPlate` 44.6 s, `IfcMember` 44.7 s (buildup spans 0→70.7 s) |
| discipline tagging / selective ARC strip | **OUT** | `IfcPlate` 2211/2211 ARC, `IfcCurtainWall` 178/178 ARC, `IfcWindow` 131/131 ARC (only oddity: `IfcMember` 7122 ARC + **5 STR**) |
| the Reveal ghost | **OUT** | ghost starts at frame 1357 (**1:30**), after the 0:47–0:55 report; and `§DVS_REVEAL_ALL drawn=63182/63182 after filterDiscs(null)` |
| Reveal slot leakage | **OUT** | `§DVS_REVEAL_SLOT` PLB 9121/9121, FP 14357/14357, ELEC 2798/2798, MEP 19670/19670, `leakOtherDiscs=0` |
| non-determinism | **OUT** | the bake seeds `Math.random` with an LCG per frame and restores it (`cinema_maxq.js:686-690`); its only callers are city skyline and staffage props, never a BIM element |

### §BME.3 — TWO RETRACTIONS. Do not resurrect either.
1. **"All 178 IfcCurtainWall are absent, that's the missing glass" — WRONG.** They have **zero**
   `element_instances` (178/178), as do 24 `IfcRoof` and 31 `IfcStair` — the `absent=233` set. They
   are pure aggregate containers whose glazing IS their `IfcPlate`/`IfcMember` children. They were
   never drawable **in any bake, including the ones that looked right**, so they cannot be what
   changed. Still a real schedule-hygiene defect (they inflate `placed=63415` and occupy programme
   time for something that can never appear) — but a DIFFERENT one, and not this.
2. **"§SUN_FILL_RATIO's map swap causes recompile churn" — WRONG, disproven by its own witness.**
   Under a regenerating sky the two-target version recompiles FEWER times (10 vs 16 over 3 regens),
   because the matte set is pinned to a stable reference. The hazard it really carried was the
   STALE REFERENCE, closed by §SFR_UNIFORM_NOT_DEFINE (#1659).

### §BME.4 — THE OPEN LEAD, and the instrument's own blind spot
`viewer/tests/witness_tm_drawn_vs_scheduled.js` (PR #1658, **ships RED on purpose**) compares
SCHEDULED against DRAWN per class per cursor. Two live failures on `Hospital_silent_local`:

- **`other` = missing, but neither §XRAY-staged nor absent — and it persists to `t=1.0`.** This is
  the residue and the best lead: `IfcColumn` maxMissing 109 (**57 not staged**), `IfcBeam` 37 (**23**),
  `IfcSlab` 12 (**10**), `IfcWall` 1 (1). `missWindow_t=0.01..1` — the WHOLE film.
- **`§XRAY_EDGES … staged=544/63415`** — "elements whose last support carrier finishes after their
  own reveal". Every early-film miss is one of these (`t=0.020 sched=716 drawn=603 missing=113
  staged=113`). Same root as §M Q3's 237 indefensible structural midair.

⚠ **THE INSTRUMENT DOES NOT REPRODUCE THE USER'S SYMPTOM YET, AND THAT IS ITS OWN DEFECT.** It loads
the model fully, scrubs the TM cursor, and counts scene-graph visibility. The bake draws each frame
through **photoreal staging**. `IfcPlate 2211/2211 drawn` means "visible objects at that cursor", NOT
"rendered in that frame". Selective loss *inside a staged frame* is invisible to it. **Next session's
first job: census what a STAGED frame actually draws** — hook `onBeforeRender` on the meshes and
count how many fire during one real staged render at the bake's own pose (`plan.poseAt`) at Day
310/310, and extend the class list beyond the glass set to `IfcFurniture` (the 1:22 table report).

### §BME.5 — what shipped this session that touches the render path (suspect list, in landing order)
`#1604 §MEP_DISC_PALETTE` (InstancedMesh discipline resolution — the tag drives BOTH colour and the
`filterDiscs` visibility filter) · `#1622 §SUN_FILL_RATIO` · `#1631 §DUCT_SILHOUETTE` (rewrites
vertex data) · `#1633 §CPE_REVEAL_ARCH_HOLD` · `#1642 §BAKE_INTERIOR_TOPUP` · `#1649
§CPE_TAIL_LIGHTS_ALL_ONLY` · `#1659 §SFR_UNIFORM_NOT_DEFINE`. The user's marker is *"before this it
was not an issue"* and the last clean bake is **2026-09-03 09:00**, so anything merged AFTER
2026-09-03 01:00 UTC is in scope and anything before it is not.

### §BME.6 — reproduction, ready to run
```
cd ~/bim-ootb && node viewer/tests/witness_tm_drawn_vs_scheduled.js      # BLD defaults to Hospital_silent_local
ffmpeg -ss 78 -i ~/Downloads/Hospital_silent_bake_2026-09-04.mp4 -frames:v 1 out.png   # Day 310/310, bays open
```
The user's DB is `~/Downloads/Hospital_silent.db`, symlinked into `buildings/Hospital_silent_local.db`.

### §BME.7 — 2026-09-04 — SPEC: the STAGED-FRAME CENSUS (the instrument §BME.4 asked for)
**Claim under test (W-SDC):** in a frame rendered THROUGH photoreal staging by the real `__maxqBake`
loop (clipped to the film window around 78 s, `--clip in:out`), every element the scene graph says is
visible AND whose bounding sphere lies inside the capture camera's frustum is submitted to the GPU in
the last colour pass before `_captureFrame` reads the canvas. If it is not, the census names the
class, the representation and sample guids — that is the "selective loss inside a staged frame"
§BME.4 said the plain-scene instrument cannot see.
**Instrument:** `cli_silent_bake.js --clip in:out --tap viewer/tests/tap_staged_draw_census.js`
(dev-only, same family as `__maxqPoseTap`). The tap wraps: `renderer.render` (pass tagging —
colour = main scene, no `overrideMaterial`); `BatchedMesh.prototype.onBeforeRender` (reads
`_indirectTexture.image.data[0.._multiDrawCount)`, the exact instance ids three r185 submits —
extracted from `three.core.min.js` `class Eo`, not assumed); `Object3D.prototype.onBeforeRender`
(InstancedMesh: whole-object draw, per-instance = non-zero matrix, `count` vs meta length). Capture
moment = `CanvasRenderingContext2D.drawImage(renderer.domElement)`, `_captureFrame`'s own read.
**§-lines (in the bake log, `§CLI_BAKE_TAP` block, and `<out>_tap.json`):**
- `§SDC_FRAME i= film_t= passes= colorPasses= bmObjs= imObjs= drawnBm= drawnIm=`
- `§SDC_CLASS i= cls= visible= inFrustum= drawn= notDrawn= sample=<guids>` — notDrawn = visible ∧
  strictly-in-frustum (0.05 m margin, so TAA jitter cannot count) ∧ not in the last colour pass.
- `§SDC_INSTANCED i= cls= objs= drawnObjs= countShort=` — `count` < meta length = instances the GPU never sees.
- `§SDC_MAT i= uuid= type= <field>:<old>→<new>` — a drawn material whose visible/opacity/transparent/
  transmission/envMap/depthWrite/program-diagnostic changed between frames.
- `§SDC_BOUNDS_STALE bm= geoms= stale=` — once: `_geometryInfo` sphere vs one recomputed from the batched positions.
**Verdict:** `witness_staged_draw_census.js` reads `<out>_tap.json` through `witness_kit/contract.js`:
PASS = notDrawn=0 and countShort=0 in every frame; INCONCLUSIVE = no frame captured or no colour pass
seen; RED CONTROL = one row mutated to notDrawn=1 must fail.
**Pixel reproduction (separate, numeric):** the clip frame whose film_t is nearest 78 s vs the film's
own 78 s frame (ffmpeg): mean |Δluma| whole-frame and over the left-elevation crop. Reproduces if
both are within 10× the §MAXQ_FRAME_BUDGET noise floor (RMS 0.21). If it does NOT reproduce, the
symptom depends on bake history or environment and the clip must start before topout.

### §BME.8 — 2026-09-04 — ROOT CAUSE FOUND AND MEASURED: dlod.js "restored" 24,992 instances to ZERO matrices it had captured after the Time Machine zeroed them
**Instrument that found it:** the full-film §SDC census (`cli_silent_bake.js --tap`, 2,937 frames, the
film's own DB and path). Per-frame, per-class: `visible` (scene graph) · `inFrustum` · `drawn` (GPU
draw list). Verdict on the render: `notDrawnTotal=2` over 2,937 frames (two IfcRailing slots on the
frustum edge) — **the renderer draws everything the scene graph shows.** The loss is upstream:
- `IfcPlate` visible 2050 → **1081 at frame 718 and never again higher, to frame 2936 (Day 310/310)**;
  `IfcMember` 6206 → 1885; `IfcFurniture` 201 → 22; `IfcWindow` 131 → 85. The lost ones are exactly
  the **InstancedMesh** representation (`imPlaced` 969 → 0 for plates, 4321 → 0 members, 179 → 0
  furniture, frames 712–718 = film 47.5–47.9 s — the user's "0:47–0:55"). BatchedMesh slots untouched.
  **"Selective within a set" = same class, two representations; only the instanced half died.**
- The §-line that fired there: `§DLOD_TICK … imHid=3337 imVis=21676` (frame 714) → `imHid=21 imVis=24992`
  (frame 718): dlod.js's per-instance frustum culler "restored" 24,992 instances into view.
- What it restored: `m._origMatrix`, captured by `_buildRefs()` — which ran at **`§DLOD_REFS built
  instanced=2872 imInstances=25013` at log line 658, AFTER `§MAXQ_FRAME i=0`** and after
  `tmActivateForBake` had zero-scaled every unplaced instance (cursor at day 0). So `_origMatrix` = a
  zero-scale matrix for essentially every instance; every later "restore" wrote zero. Instances that
  never left the frustum after TM placed them survived; every one that left and came back is gone.
- Why the refs were late: `dlodEnable()` (streaming end) marks refs dirty and calls `dlodTick()`, but
  the tick returns BEFORE `_buildRefs()` when the camera is idle. A CLI page never moves the camera
  until the bake's own frame 0 — by then TM owns the matrices. **An interactive bake (every
  `BIM_MaxQ_Hospital_*.mp4` before this) had navigated first, so its refs held real matrices.** That
  is the whole of "before this it was not an issue": the defective film is the first CLI silent bake
  of Hospital. Nothing in #1604–#1659 caused it; dlod.js last changed 2026-08-05.
- The fight is two-way (S258 landmine, `project_dlod_geometry_swap_landmine.md`): TM's own lazy save
  (`_savedInstanceMatrices`, time_machine.js ~1601) reads CURRENT matrices, so an instance dlod.js had
  zeroed before TM's first pass would be saved as zero by TM too.
**FIX (§DLOD_TM_OWNERSHIP): one owner of instance matrices at a time.** TM activation
(`_finishActivate`, the single point both the pill and `tmActivateForBake` reach) calls
`A.dlodDisable('time-machine')` first — dlod.js restores its own hides while `_origMatrix` is still
real, then stands down; `dlodEnable()` refuses while `app._tmOn` (`§DLOD_SKIP_TM`); `dlodTick()` is
gated on `!app._tmOn`; TM `deactivate()` re-enables after `restoreVisibility(true)`.
**Witness:** `viewer/tests/witness_dlod_tm_ownership.js` — the CLI's exact ordering (idle camera →
TM on at day 0 → first camera move → cursor to end → camera out of and back into view); asserts every
placed instance holds a non-zero matrix at the end and the `§DLOD_DISABLE reason=time-machine` line
was emitted. RED before the fix, GREEN after; red control via witness_kit.
**Retractions from this session (do not resurrect):** (1) `§SDC_BOUNDS_STALE stale=14138 worstM=62`
(first tap run) was the tap scanning the VERTEX range, which includes vertices the index never
references; the index-range recomputation three actually uses (`witness_bm_bounds_cull.js`) measured
**stale=0, wronglyCulled=0** at all seven recorded poses. (2) The first two clipped runs (`--clip
0.394:0.402`) showed a Reveal slot at u=0.40 for two unrelated reasons: the bake loop fed the Reveal
its clip-local `_tn` (fixed, §CPE_CLIP_REVEAL_FILM_T), and run B reused run A's Chromium profile, whose
service worker served the pre-fix `cinema_maxq.js` (a fresh `--profile` per run from now on).

### §BME.9 — 2026-09-04 SESSION CLOSE — RESUME HERE
**State:** root cause measured and named (§BME.8: dlod.js ↔ Time Machine matrix ownership, CLI-bake
ordering). Fix + instruments on **bim-ootb PR #1660** (`test/staged-draw-census`, commit 7eafe999,
sw v1139). **Deliberately NOT armed for auto-merge.** Worktree pruned; re-create from the branch.
**What is proven (§-log, primary evidence):** full-film census `scratchpad/full_census.log` of this
session (not persisted — re-run if needed, ~52 min): `§DLOD_REFS built … imInstances=25013` at log
line 658 AFTER `§MAXQ_FRAME i=0`; `§DLOD_TICK … imHid=21 imVis=24992` at frame 718; `§SDC_CLASS`
`IfcPlate imPlaced 969→0`, `IfcMember 4321→0`, `IfcFurniture 179→0` frames 712–718, still 0 at
frame 2936; `notDrawnTotal=2/2937 frames` on the render side. GREEN run of the ownership witness on
the fixed tree: `§DLOD_DISABLE(time-machine)=1`, refs never rebuilt under TM.
**What is NOT yet proven — do these, in order, before merging #1660:**
1. Make `viewer/tests/witness_dlod_tm_ownership.js` go RED on unfixed main. Its far/near pass did
   not evaluate the culler (main.js animate loop self-parks, §IDLE_GATE; `markDirty()` alone did not
   wake it headless). Drive it the way `tour.js:1636` does after each camera set:
   `A._dlodFrame = -1; A.dlodTick();` — then `ROOT=~/bim-ootb LOG=/tmp/dto_red.log node viewer/tests/witness_dlod_tm_ownership.js`
   must print `lost>0` for IfcPlate/IfcMember/IfcFurniture, and the worktree run `lost=0`.
2. The user's ask, verbatim: *"after it is solved, do a silent bake of Hospital_silent.db"*. From the
   PR worktree, FRESH `--profile` (a reused Chromium profile's service worker served stale JS this
   session):
   `node cli_silent_bake.js --db Hospital_silent_local --gpu real --tap viewer/tests/tap_staged_draw_census.js --out ~/Downloads/Hospital_silent_bake_2026-09-05.mp4 --log ~/Downloads/Hospital_silent_bake_2026-09-05.log --profile /tmp/silent-bake-profile-fresh-$$`
   (`buildings/Hospital_silent_local.db` → symlink to `~/Downloads/Hospital_silent.db` in the worktree).
   Pass = `§SDC_CLASS i=2936 cls=IfcPlate … imPlaced=` **≥ 969** (the pre-loss value) and
   `§DLOD_SKIP_TM`/`§DLOD_DISABLE reason=time-machine` present; no `§DLOD_TICK` line after
   `§MAXQ_FRAME i=0`. Then `python3 scratchpad/tap_analyze.py <out>_tap.json` (script lost with the
   scratchpad — 40 lines, re-derive from §BME.7's row schema) or just grep the lines above.
3. Merge #1660 (`gh pr merge 1660 --auto --squash`), then deploy per `feedback_deployment.md`.
**Open threads found on the way (not blocking):** (a) the 53 batched slots the TM delta path leaves
hidden at the end cursor (`§DVS_END_DELTA_VS_FULL delta: missing=53 (B=41 I=12) | full: 0`,
IfcColumn/IfcBeam/IfcSlab) — real, separate, unowned; (b) `§CPE_STATS_TAIL` uses the clip-local `_tn`
as u (log says "u=0.364" in a 0.394–0.402 clip) — cosmetic in clip mode only; (c) the 178
IfcCurtainWall / 24 IfcRoof / 31 IfcStair with no geometry still occupy programme time (§BME.3).

### §BME.10 — 2026-09-04 (later) — ITEM 1 CLOSED: the ownership witness is RED on main and GREEN on the fix
**§BME.9 item 1 is done.** `viewer/tests/witness_dlod_tm_ownership.js` now judges. It could not
before, and the reason was TWO instrument defects, not one — the second is worth keeping because it
is the defect's own signature and would be re-derived otherwise:

1. **The culler never ran.** main.js's animate loop self-parks when idle (§IDLE_GATE) and
   `markDirty()` alone did not wake it headless. `flyTo()` now drives it directly after every camera
   set, the way `tour.js:1636` (`_scrubAfterJump`) does: `A._dlodFrame = -1; A.dlodTick();`.
2. **The near pose looked away from where the refs actually are.** `_buildRefs()` (dlod.js:54)
   reads each instance's world position out of the matrix it finds — and at TM day 0 every unplaced
   instance carries `makeScale(0,0,0)` (time_machine.js:628), translation **(0,0,0)**. So the whole
   ref set collapses onto the **WORLD ORIGIN** with a metadata radius, and the restore-to-zero fires
   only when the origin re-enters the frustum. The film's frame-1170 pose (`[-25,6.32,-3.02] →
   [-44.61,2.67,-1.56]`) has the origin *behind* the camera — that is the entire reason the first
   RED attempt read 25013/25013 non-zero and looked like a passing tree. `poseA` is now
   `[120,80,120] → (0,0,0)`; `poseFar` `[900,600,900] → [1200,0,1200]` keeps the origin behind.

**MEASURED — the pair (§-log, primary evidence):**

| run | tree | §DTO_TM_DAY0 | §DTO_PASS out→back | worst classes lost | §DLOD_DISABLE(tm) | verdict |
|---|---|---|---|---|---|---|
| RED | `ROOT=/home/red1/bim-ootb` @ `2ac311ac` (unfixed main) | `nonZero=0/25013 tmOn=true dlodDisableLines=0` | `0/25013 → 0/25013` | IfcMember 5242 · IfcPlate 1130 · IfcFurniture 179 · IfcWindow 46 (**22 classes, 25,013 instances**) | 0 | `§WITNESS_DLOD_TM_OWNERSHIP pass=3 fail=1 ran=22` |
| GREEN | `/tmp/wt-dlod-tm` @ `9eb1f120` (§DLOD_TM_OWNERSHIP) | `dlodEnabled=false dlodDisableLines=1` | `25013/25013 → 25013/25013` | every class `lost=0` | 1 | `§WITNESS_DLOD_TM_OWNERSHIP pass=4 fail=0 ran=22` |

Red control passed in both runs — the witness can fail. On the RED run the precondition line fires
verbatim as it did in the film: `§DLOD_REFS built instanced=2872 imInstances=25013` **after** TM
zeroed them. On the GREEN run those refs are never built at all under TM (only the mid-stream
`imInstances=2753` set, captured before TM existed).
Logs: `/tmp/dto_red2.log`, `/tmp/dto_green.log`. Commit `9eb1f120` on `test/staged-draw-census`.

**PR #1660 was `DIRTY`/`CONFLICTING` on arrival** — synced, not redone (`git merge origin/main`;
the only conflict was `sw.js`'s version-comment block, resolved by keeping BOTH sides' notes and
taking `CACHE_VERSION = 'v1141'` above main's v1140). Merge commit `74f41526`.

### §BME.11 — 2026-09-04 — ITEM 2 CLOSED: the re-bake is complete at Day 310/310. §BAKE_MISSING_ELEMENTS IS SOLVED
`~/Downloads/Hospital_silent_bake_2026-09-05.mp4` (67.3 MB, 2,937 frames, 48m45s wall, commit
`9eb1f120`, sw v1141, fresh `--profile`, `--tap tap_staged_draw_census.js`). Log
`~/Downloads/Hospital_silent_bake_2026-09-05.log`, tap `..._tap.json` (76,714 rows, 2,937 frames).

**The four classes the user reported are now WHOLE at the last frame** — batched half + instanced
half adds up to the DB's own count, exactly, for all four:

| class | batched visible @2936 | instanced `imPlaced` @2936 | sum | DB total | the defective film |
|---|---|---|---|---|---|
| IfcPlate | 1081 | **1130** | **2211** | 2211 ✓ | 1081 + **0** |
| IfcMember | 1885 | **5242** | **7127** | 7127 ✓ | 1885 + **0** |
| IfcFurniture | 22 | **179** | **201** | 201 ✓ | 22 + **0** |
| IfcWindow | 85 | **46** | **131** | 131 ✓ | 85 + **0** |

`imPlaced` reaches its maximum at frames 607–669 and **holds it to frame 2936** — no collapse at
712–718, which is where 24,992 instances died last time. Render side: `notDrawnTotal=2` over 2,937
frames (the same two IfcRailing slots on the frustum edge, unchanged) and `countShortTotal=0`.

**The ownership hand-off is visible at both ends of the film, and that is the mechanism proof:**
- line 335 `[DLOD] §DLOD_DISABLE reason=time-machine` — *before* frame 0, so `_buildRefs()` never runs
  on TM's zero matrices. Between line 335 and line 38844 there is **not one `§DLOD_TICK` and not one
  `§DLOD_REFS`** in a 38,000-line log.
- line 38844 `§TIME_MACHINE OFF — restored` → 38850 `§DLOD_REFS built instanced=2872
  imInstances=25013` → 38851 `§DLOD_TICK … imHid=0 imVis=25013`. dlod.js takes the matrices back
  only once they are real, and its first tick hides **nothing**. Compare the defective run's
  `imHid=21 imVis=24992` — 24,992 "restored" to zero.

**PR #1660 is MERGED and LIVE** — main `fcd4720c` (2026-09-04 16:41, squash), and the deployed
`viewer/sw.js` at red1oon.github.io returns `CACHE_VERSION = 'v1141'`. §BME.9 items 1, 2 and 3 are
all closed. The `§CLI_BAKE_LOG_TS` follow-up (every bake-log line timestamped, user ask) went out
separately on `chore/bake-log-timestamps` off fresh `origin/main`, since #1660 was already squashed.

### §BME.12 — 2026-09-04 — HHS Office "missing wall slab": NOT the §BME.8 defect, and NOT reproduced. One real but too-small defect found on the way
> **USER, 2026-09-04:** *"Even in HHS Office, it is missing a wall slab on its right side, ground floor."*
> They supplied their live console log (red1oon.github.io, `HHS_Office_Federated_extracted.db`,
> `§BUILD_VERSION v1141`) — a plain load, no bake.

**RULED OUT FIRST, from their own log — this is not what #1660 fixed.** Their session ran **no Time
Machine** (no `§TIME_MACHINE`, no `§DLOD_DISABLE reason=time-machine`), and §DLOD_TM_OWNERSHIP only
bites when TM owns the matrices. Their build already contains the fix (v1141 = main `fcd4720c`).
Their log also rules out a streaming loss outright: `§CONTRACT_CHECK batch=3677 instanced=3162
merged=0 guidMap=6839 streamed=6839 orphans=0` — every element IS in the scene.

**MEASURED on HHS this session (new witness + the existing batched owner), all on `fcd4720c`:**

| question | instrument | result |
|---|---|---|
| is any element absent from the scene? | their `§CONTRACT_CHECK` | 6,839/6,839, orphans=0 |
| is any batched slot left invisible at load? | `witness_dlod_cull_soundness.js` (new, §DCS_BM) | **3,704 slots, invisibleAtLoad=0** |
| are the batched bounds stale (three's per-slot cull)? | `witness_bm_bounds_cull.js`, 36-pose ring | `§BM_BOUNDS_STALE bm=97 geoms=3704 **stale=0** worstM=0` |
| does the batched cull drop anything that is really in view? | same, 36 poses | `WRONGLY_CULLED` **0–2 per pose** (frustum-edge slivers), `wronglyDrawn=0` |
| does dlod's own sphere contain what it culls on? | `witness_dlod_cull_soundness.js` (new) | **RED: 357 / 3,135 instances outside** — see below |
| do the walls/slabs even have geometry? | DB | every `IfcWallStandardCase` 148 / `IfcSlab` 83 / `IfcWall` 12 / `IfcCovering` 43 resolves; 0 unresolved hashes |
| any degenerate or misplaced wall/slab? | DB | none (no zero extent, nothing >200 m off); Level 1 holds 75 of them, z −0.1…3.6 |
| is the runtime DB patch implicated? | `buildings/patches/HHS_Office_Federated_extracted.db.sql` | it writes only `spatial_structure` (109), `rel_aggregates` (2,120), `storey_walkable_raster` (4) — **no geometry, no transforms** |

**The one real defect found — §DCS, undersized cull spheres.** `dlod.js:75-81` culls an instance on
`centre = the instance matrix translation`, `radius = sqrt(bx²+by²+bz²)*0.5` from
`element_transforms.bbox_*`. On HHS that sphere does **not contain** the geometry actually drawn at
**357 of 3,135** instances, because the transform centre is not the geometry's centre — measured
centre offsets up to **0.56 m**:

| class | instances | outside sphere | worst overrun |
|---|---|---|---|
| IfcDoor | 91 | **87** | 0.31 m |
| IfcPlate | 396 | 210 | 0.13 m |
| IfcFlowFitting | 564 | 26 | 0.09 m |
| IfcBuildingElementProxy | 500 | 14 | **0.55 m** (sphere 1.09 m vs 1.64 m needed) |
| IfcWallStandardCase | 9 | 9 | 0.22 m |
| IfcMember | 1177 | 11 | 0.08 m |

`§WITNESS_DLOD_CULL_SOUNDNESS pass=4 fail=1 ran=27`, red control passed. **This is real — it can clip
an element at the frustum edge — but at ≤0.55 m it cannot delete a wall**, and only **9** of HHS's
148 `IfcWallStandardCase` are instanced at all (the rest are batched, which dlod never touches).
Do not close the user's report with it.

**⛔ BLOCKED on one datum, and it is a NUMBER, not a look.** Every pose-independent invariant passes,
so the next instrument has to judge the *specific* view. The viewer already emits the camera in its
share hash (`§HASH_PARSE keys=bld,cx,cy,cz,tx,ty,tz`, `quickShare` / `buildShareUrl`) — **the share
URL of the view with the missing wall** is a coordinate, and a per-GUID drawn census at that exact
pose then decides it without anyone judging a picture. That is the one open question.

### §BME.13 — 2026-09-04 — HHS: #1631 §DUCT_SILHOUETTE CLEARED by A/B; extraction is complete; two broken geometries found (not walls)
User asked which recent change caused it, to weigh dropping it. Answer: **no recent change is
implicated, and there is nothing to drop.**

**#1631 §DUCT_SILHOUETTE (2026-09-02) — CLEARED.** It was the only recent change that rewrites
vertex data, and it runs at `scene.js:1934` on every streamed geometry with no class gate (HHS:
`considered=3269 refined=113 addedVerts=103158`). A/B on the same load, refinement forced off via
`evaluateOnNewDocument` — **identical integrity numbers both ways**:
`geometries=3369 NaN=0 zeroTri=0 badIndex=4 badSphere=0`. Do not revert it; the cost (faceted duct
silhouettes return) buys nothing.

**Extraction is complete — the source IFCs prove it.** `internal/UNMERGED/opensourceBIM_HHS_Office_*`
(architect + construction, the federated pair) against `HHS_Office_Federated_extracted.db`:

| class | architect | construction | source total | in DB |
|---|---|---|---|---|
| IfcWallStandardCase | 112 | 36 | 148 | **148** ✓ |
| IfcWall | 0 | 12 | 12 | **12** ✓ |
| IfcSlab | 75 | 8 | 83 | **83** ✓ |
| IfcCurtainWall | 33 | 0 | 33 | **33** ✓ |

Not one wall or slab was lost between the IFC and the DB.

**Two genuinely broken geometries, found on the way — real, and NOT walls.** Their index buffer
references vertices that do not exist, so those elements cannot draw correctly. Present with
refinement off too, so this is a DB/extraction defect, not code:
- `771efc5271499502` — pos.count **474**, idx.count 2748, **max index 29804**. Used by **6
  `IfcBuildingElementProxy` "CCTV Camera (Paxton10 Mini Bullet, CORE series)"**, Levels 1/2/3, MEP.
- `8be27af97ecbf86e` — pos.count **24**, idx.count 120, **max index 26000**. Used by **1
  `IfcEnergyConversionDevice` "Photovoltaic Module (NBS generic)"**, Roof Level, MEP.

That is 7 elements, all MEP fixtures. Worth its own fix; it is not the user's wall.

**Standing conclusion: the HHS report is not reproduced and not attributed.** Every pose-independent
invariant passes (§BME.12), the data is complete, and the only recent geometry-touching change is
cleared. The open question is unchanged and is a coordinate, not a look: **the share URL of the view
with the missing wall** (`§HASH_PARSE keys=bld,cx,cy,cz,tx,ty,tz`).

**USER, 2026-09-04 (session close on this lane):** *"the issue with Hospital is now solved, and i am
truly happy with the bake result, and we shall use that as the baseline to proceed"* ·
*"Clinic in OCI is now solved.. no more boxed non glass panels"* · the HHS right-side ground-floor
wall stays open. **Baseline for every later comparison = `Hospital_silent_bake_2026-09-05.mp4`
(§BME.11), not the 09-04 film.**
