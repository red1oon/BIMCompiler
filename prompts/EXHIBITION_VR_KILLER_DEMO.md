# ⚠ DO NOT REMOVE — scope: roadmap/index only, no implementation yet. Read the log after every run.

# Exhibition VR Killer Demo — the three pillars (defined 2026-08-08)

## Origin
User's own framing, stated directly 2026-08-08, after the gamepad/WebXR lane's first two PRs
shipped: this VR experience is assessed as the strongest crowd-puller/first-impression asset in
the whole project ("the main door key") — see `project_cpe_walk_gamepad_lane.md`'s Positioning
note. The user named the three specific experiences that make it a KILLER demo, not just a novelty:

1. **Clash analysis** — zoom in, reveal, reconstruct.
2. **Find space** — walk-thru path.
3. **Time Machine 4D** experience.

This file is the index tying those three to the specs/code that already exist, and naming the real
gap for each. Do not re-derive this mapping — it's settled, read it.

## Pillar 1 — Clash analysis: zoom in, reveal, reconstruct
- **Zoom in — REAL, shipped, working today (not VR-specific).** `A._flyToClash(idx)`
  (`viewer/measure.js:619`) computes the exact 3D overlap bbox and flies the camera there with a
  padded cutaway clip. Already wired into 4 desktop UI entry points.
- **Reveal — PARTLY real.** A global x-ray/ghost toggle exists (`A.xrayOn`, `viewer/tools.js:227`)
  and `A.DISC_COLORS` (12 disciplines, `viewer/config.js:43`) is live. The GAP named in
  `MEP_CLASH_REVEAL_MOVIE.md`: no **discipline-scoped hide** (hide ARCH+STR only, leave MEP
  colored/opaque) — global-only today. Data column (`elements_meta.discipline`) already exists;
  this is a visibility filter to build, not new data to extract.
- **Reconstruct — LEAST defined pillar-1 piece, not yet spec'd precisely.** Read as either (a) the
  camera-path-into-the-clash idea from `MEP_CLASH_REVEAL_MOVIE.md` (walking down a ghosted corridor
  toward the clash, not just snapping to it), or (b) a Time Machine-style "watch it get built"
  replay local to just the clashing elements. Needs a decision before spec'ing, not invented here.
- **VR wrapper** — `CPE_WALK_WEBXR_FINDPANEL.md`'s clash-list slice is the "point at a clash, fly
  to it" piece; spec'd, not built.

## Pillar 2 — Find space, walk-thru path
This is the most mature pillar — the whole gamepad/WebXR-stub lane already targets it directly:
- Walk mode (trackpad/WASD/gamepad) — **shipped**, PR #1251.
- WebXR session lifecycle stub — **shipped**, PR #1253 (locomotion itself still an honest stub).
- Point-at-Find-results-panel-in-VR — **spec'd**, `CPE_WALK_WEBXR_FINDPANEL.md`, not built.
- Comfort-locomotion (teleport, only needed if free joystick-flying stays in the VR experience,
  per the same-day comfort discussion) — **not spec'd yet**, named as high priority given exhibition
  framing (`project_cpe_walk_gamepad_lane.md`'s Demo-readiness gap item 2).

## Pillar 3 — Time Machine 4D experience
- The underlying cinematic camera system is real: `time_machine.js`'s scripted "flythrough"/
  "panoramic"/"hero" scene types (tight tracking at a fixed ~12m distance, cut-based scene changes)
  already drive the 4D construction-sequence playback on desktop — confirmed genuinely "tame"
  motion (scripted + cuts, not user-driven continuous flight), which is the comfort-safe pattern
  for VR (same reasoning as a VR rollercoaster — see the same-day comfort discussion).
- **NEW, unverified gap named here for the first time:** whether Time Machine's playback camera/
  render path is compatible with an active WebXR session has NOT been checked. `time_machine.js`
  does run its own independent rAF loops (`_bgBuildRaf`, `_giConvergeRaf` — confirmed during the
  render-loop investigation for `CPE_WALK_WEBXR_VR.md`), but those are for storyboard-building/GI
  convergence, not confirmed to be the actual playback-camera render step itself. Needs a read of
  how Time Machine drives the camera during playback (likely via main.js's normal render path,
  which is exactly what a `renderer.xr.enabled` session takes over) before assuming "just works
  in a headset." Flag this as the first open question for whoever specs Pillar 3 — do not assume
  either way.

## Performance reality check (measured 2026-08-08, real numbers via witness, not estimated)
Headless-Chrome witness (`renderer.info` after settle, flags: `--use-gl=angle
--use-angle=swiftshader` needed for WebGL to init at all in this sandbox) against the real
`/tmp/wt-sandbox` buildings. Compared against Meta's own WebXR guidance (<100 draw calls
comfortable, >500 even strong GPUs struggle — draw calls, not triangles, are the real ceiling on
Quest-class hardware):

| Building | Draw calls | Triangles | Elements |
|---|---|---|---|
| Duplex | 89 | 345,604 | 88 |
| HHS_Office_Federated | 374 | 1,452,255 | 356 |
| Hospital | 471 | 1,619,286 | 460 |

**CORRECTION (same day, second measurement pass): the 471-draw-call Hospital number above was a
mid-stream snapshot, not the settled final state — do not treat it as Hospital's real number.** A
longer follow-up run watched the same building keep climbing past that point: **1,657 draw calls,
5.97M triangles**, still rising when the test was stopped. Hospital's real fully-loaded draw-call
count is unknown and likely higher than either number logged so far.

**Real element counts, confirmed from the app's own load logs (not the earlier witness's flawed
`elementCount` field, which was a bad scene-graph fallback):** Duplex 1,140, HHS_Office_Federated
6,839, Hospital **63,182**.

**Occlusion culling already exists in the codebase — `viewer/dlod_nav.js`** (`§ROOM_OCCL`, real
WebGL2 occlusion queries, structural-occluder decouple), spec'd in full at
`FLY_TOUR_DLOD_SCALE.md`, toggled by the real **'o' key → `window.toggleDlodNav()`**
(`scene.js:1566`). `NAV_MIN_ELEMENTS = 50000` (`dlod_nav.js:59`) gates the large-building tier —
Hospital (63,182) crosses it, HHS (6,839) doesn't, matching the user's own recollection exactly.
Room-based occlusion (`roomOcclEnabled`) defaults **true** once the pill is on — real occlusion,
not just frustum culling — confirmed **user preference: stays a manual pill toggle, not
auto-engaged, so the user stays in control.** Nothing to change there, it already works that way.

**Occlusion-ON test for Hospital — INCONCLUSIVE, not confirmed working or not working.** Two
attempts, both blocked: `§DLOD_NAV_TOGGLE on=true blocked=streaming` — the app's own busy-gate
refused the toggle because Hospital was still mid-load, even after ~100s of waiting in this sandbox.
**Root cause is the test environment, not the app:** this sandbox runs headless Chrome on
SwiftShader (pure CPU software rendering, no real GPU) — far slower than any real target hardware
for a 63,182-element buffer upload. Whether occlusion actually helps Hospital's draw-call count is
still an OPEN QUESTION — needs either a GPU-accelerated test machine or real target hardware to
answer, not this sandbox as currently configured. Do not read the inconclusive attempt as "occlusion
doesn't help" — it never got the chance to run.

One unexplained, honestly-flagged number from the FIRST (471-call) measurement: Hospital reported
2,274,552 GL_LINE draws (`renderer.info.render.lines`) — not investigated, likely edge-outline
rendering, not confirmed. May also have been a mid-stream artifact given the correction above —
re-check alongside any future occlusion test rather than trusting it in isolation.

**Real-GPU retest attempt (2026-08-08, via the user's own real Chrome, not the sandboxed
headless/SwiftShader witness) — PAUSED, observed but not diagnosed.** Confirmed this machine has
real GPU hardware (NVIDIA RTX 4060 Max-Q), so a real-Chrome retest should have sidestepped the
SwiftShader bottleneck above. Instead, the page state was static/stuck for 15+ seconds
(`calls=6, triangles=0, lines=2274552, geometries=12`, unchanged across two checks) — looks like a
real lag, not just slow streaming. **Per the user: another concurrent session is already
investigating a related lag/memory hiccup (triggered by Night mode, noted earlier same session) —
do not diagnose or fix this here, resume the Hospital perf retest once that other session's fix
lands.** One incidental finding from this attempt worth keeping: the 2,274,552-line number appeared
almost immediately (`calls=6, triangles=0`) — consistent with it being an early wireframe/bbox
loading-placeholder, not final geometry; still not fully confirmed, but less mysterious than
originally flagged.

## Status
No new spec written for Pillar 1's "reconstruct" or Pillar 3 yet — this file is the index/roadmap,
not the spec. Next real work, in the priority order already set by the demo-readiness gap: (1)
hardware in hand, (2) comfort-locomotion decision, (3) build `CPE_WALK_WEBXR_FINDPANEL.md`'s clash
slice (serves Pillar 1 AND 2 at once), (4) spec Pillar 3's WebXR compatibility question, (5) define
"reconstruct" precisely for Pillar 1.

---

## §MEASURE_OVERLAY_VS_DEMO — where the fly-through measurement lane fits (2026-09-07)
Written from a reflection session while a concurrent session builds
`prompts/MEP_CLASH_REVEAL_MOVIE.md` §FLYTHRU_DIMENSIONS (§1-§15, consolidated 2026-09-07). That file
owns the spec; this section owns only the question **does it serve the killer demo, and which part of
it does.** Numbers below are that file's own measured ones (§11, `out/ft_maths.log`, 2026-09-07) — none
are re-derived here.

**1. It lands in Pillar 2, and it is the piece Pillar 2 was missing.** Pillar 2 ("find space, walk-thru
path") is the most mature pillar — walk mode shipped (PR #1251), WebXR lifecycle shipped (PR #1253) —
but a walk with no number on screen is a game engine. A walk that measures as it goes is BIM. The
overlay is Pillar 2's evidence layer, not a fourth pillar.

**2. The killer number is WALKABLE AREA, not envelope volume.** §11 measured three numbers for the same
Hospital storey: bbox **15,072 m²**, gross raster **11,678 m²**, walkable-from-mesh **6,481 m²**
(Level 1). Every competing viewer can print the first. The third is derived from the building's own
triangulated mesh (`scripts/build_storey_walkable_raster.js`, 7 storeys present) and **appears nowhere
in the IFC** — that is the differentiating claim. §FLYTHRU_DIMENSIONS §11 already reaches this
conclusion ("Walkable is the better capability claim") but the stated baseline leads with B1 envelope,
which is the one number that proves nothing to a BIM audience. Order the beats: envelope as the
opener (scale-setting), walkable as the point.

**3. Level 7A is the demo's own proof-shot, already measured.** Bbox **4,495 m²** vs raster **617 m²** =
**7.28x**. That is not an approximation argument, it is "the number your current tool shows you is 7x
wrong, here is the real one, on screen, in the same second." It sells the raster (§3.2/§3.3) without
a slide.

**4. SCOPE RISK — the film scheduler is MP4-only; the primitives are not.** §14's sequential slot budget
(2.7 s per cue, cues assigned to precomputed path windows) exists because a baked film's camera path is
known in advance. **In VR the viewer owns the camera, so nothing can be scheduled** — a cue must be
selected live from where the head is looking. The two primitives (§3.1 chord, §3.2 raster) are
camera-agnostic and serve both vehicles; the scheduler and the window assignment serve only the bake.
Build the primitives as viewer API surface (`A.*`), keep the scheduling in `cinema_maxq`/film code.
If the primitives land inside film-only code, Pillar 2 and the exhibition demo get nothing from this
lane, and it will have to be written twice.

**5. DELIVERY RISK — the lane is converting session time into spec, not into demo.**
`MEP_CLASH_REVEAL_MOVIE.md` is 977 lines; §FLYTHRU_DIMENSIONS §1-§15 were all written on 2026-09-07,
and its own §10.4 states **no bake has ever drawn one of these cues** (only staged stills with the
camera pointed by hand). Bakes are held pending a user go-ahead. The objective in this file's title is
to LAND a demo — so one `--clip` with B1+B2 actually drawn outranks §16 onward. Treat "a cue has
survived a real frame" as the lane's next gate, not more sections.

**6. THE ESCALATION that makes it killer rather than nice — geometry → money.** Every cue in
§FLYTHRU_DIMENSIONS stops at a dimension. The film's only beat that crosses into commercial value is
`§MEASURE_BUILDING_CARD` at the close (census `doors=440 windows=131 walls=1468`, envelope volume, and
a **material cost estimate** — correctly not labelled a total, since `labour=0` on a silent bake).
The chain past that already ships: BIM→ERP fold + Variation Order round-trip (`proj_fold.js`/
`vo_fold.js`, live 2026-06-15, [[project_bim_to_project]]). **A single cue that runs measured area →
quantity → BOQ line → PO is worth more to the demo than eight geometry cues**, because clash detection
and dimensioning are table stakes for Navisworks/Solibri and the fold is not. Not proposed as scope for
the current lane — recorded as the direction the baseline should be built to extend into, so the cue
graphic is not designed in a way that forecloses it.

**7. CALENDAR — which meeting this asset is for.** The venue for this demo is the **2026-09-26
conference** (Track 2, property developers with real IFCs — [[project_sysnova_kazifarms_bim_scoping]]).
The **2026-09-08 Kazi Farms meeting is NOT it**: that client has no IFC (a 2D site-plan PDF), and their
own dashboard shows the real pain as 65% of 468 active projects missing schedule data. The asset for
that meeting is the 4D/BOQ data feed, not the measurement overlay. Do not spend the overlay lane's
remaining time against the 09-08 date.
