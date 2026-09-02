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

## ▶ RESUME — START HERE (supersedes the §HOSPITAL_META_DB_STALE block below — read this first)

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
**Also found: Terminal (48,428 elements) has ZERO `_matCache` entries at all**, before and after
staging — almost certainly its DLOD (`A._useDlodPath`) rendering path bypasses the whole STD_MAT/
`_matCache` material system universally, not just for batched outliers. Means Alt+S's entire
material-boost/triplanar/envmap/room-probe layer may be a no-op on DLOD-path buildings — not
chased further this session (Clinic, the building actually in question, is unaffected — its
piping-equivalent classes, `IfcFlowSegment`/`IfcFlowFitting` under the IFC2x3 generic-MEP
convention, ARE in `_matCache` normally), but worth a dedicated session if Alt+S quality on large
buildings (Terminal/Hospital/LTU) is ever specifically checked.
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
