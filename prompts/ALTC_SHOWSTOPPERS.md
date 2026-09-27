# ⚠ DO NOT REMOVE — §ALTC_SHOWSTOPPERS: read-only review of the "Alt+S is the source of truth, Alt+C merely inherits" rule against the bake loop (2026-09-25)
# SCOPE: read-only review. No file in any repo edited, no git state changed, no server, no browser, no bake run.
#   Question: which bake steps make "call the Alt+S lighting function every frame" impossible, wrong or unaffordable.
#   Every claim is a file:line or a record line; "not measured" means exactly that; no invented numbers.
#   Read the log after every run: any measurement proposed below counts only from its full console log, never from an exit code.

## Sources read
- Code: `W` = /tmp/wt-daylight (feat/sourced-daylight @5bae708a). It contains /tmp/wt-int (feat/sourced-light-int @e61c116b)
  plus origin/feat/sourced-light-int's 6 newer commits (§STILL_SHADOW_CASCADE b67862a5..c56769bf) plus §SOURCED_DAYLIGHT /
  §SKY_VIEW_FIELD / §LUX_CHECK (746662af..5bae708a). Checked with `git merge-base --is-ancestor` (read-only).
  `cinema_maxq.js`, `tools.js`, `gi_still.js`, `cli_silent_bake.js` are byte-identical in /tmp/wt-int and W, so their line
  numbers hold for both. `effects.js`, `sourced_light.js`, `light_zones.js`, `sky_portal.js`, `shadow_cascade.js` lines are W's
  (wt-int has no cascades and no sky field).
- Specs: bim-compiler prompts/ALTC_FOUNDATION.md (all, incl. §1 inventory) = "ALTC"; prompts/PHOTOREAL_STILL_RENDER.md
  = "PSR" (§WATCHDOG RESUME :12-113, §RESUME LATE :115-308 incl. §STILL_SHADOW_CASCADE :325-413, §FILM_PARITY :611-730,
  §SKY_VIEW_FIELD :1018-1050, §LUX_CHECK :1051-1110, §GLASS_VEIL :1111-1141, §LAMP_ZONE_PICK :1149-1167, §METER_HIST :1169-1195,
  cove :794).
- Frame budget used below (record): Terminal 1080p control 0.93 s/frame, parity 1.93 s/frame, first frame 111 s (ALTC:72);
  HHS 1080p 0.95 vs 0.78 s/frame (PSR:661). Hospital full-film per-frame cost: not measured (ALTC:104).
- Costs quoted from the brief and not found in a file I read: zoneCap 0.7-1.2 s, Terminal ~140 s first press (the code comment
  at effects.js:4217 records "a Terminal press took ~120 s vs ~13 s"). Marked "brief" where used.

## How the bake loop really runs today (the facts every row below depends on)
1. SETUP: `start()` sets `A._maxqActive = true` (cinema_maxq.js:2434). Warm-up fold `A.startStillRefine()` (cinema_maxq.js:3050)
   runs the FULL staging `_applyPhotoStaging` (effects.js:4216) with `A._filmParity` true (effects.js:4241). Then a FULL
   teardown `A.stopStillRefine(true)` (cinema_maxq.js:3069), 2 rAF + 3 s sleep (:3070), and only THEN the 4D build-up is armed
   (`tmActivateForBake` :3090, `tmFollowTimeline` :3107).
2. PER FRAME (loop :3521): keep-staging stop (:3535) → `tmSetCursor` (:3694; synchronous `renderAtTime`, time_machine.js:9743-9746)
   → `startStillRefine` (:4005). Frame 0 re-runs the whole staging (the warm-up teardown cleared `_photoStagingOn`); every later
   frame returns early at the §PHOTO_DOUBLE_APPLY_GUARD (effects.js:4235). → `_sunArcStep` (:4023) → `GiFilm.arm` once (:4035) →
   `_filmParityStep` (:4036 → effects.js:4712-4740) → fill pin (:4037 → effects.js:2780-2821) → fold wait (:4038; 8 TAA + 12 AO,
   cinema_maxq.js:503) → reuse key (:4540-4557) → `_captureFrame` (:4572 → :1599; one more `_composer.render()` :1655; bounce hook :1665).
3. CAPTURE/ENCODE: webp blob per frame (cinema_maxq.js:2145) → IDB → WebCodecs mp4 after the loop (:2202-2228). No lighting
   function runs in encode.
=> The Alt+S lighting functions are NOT called per frame today. They run once at frame 0 (inside a one-shot staging) and the
   film then runs only `_filmParityStep` (glow/inside test, shadow-fit centre, portal re-aim). Most Alt+S look steps are also gated
   out of films entirely (`!A._maxqActive`, list in STOPPER S2).

## Table — every Alt+S lighting function against the bake steps

| step | Alt+S function | file:line | per-frame cost (cited or "not measured") | verdict | what makes it OK |
|---|---|---|---|---|---|
| setup | staging as a whole (`_applyPhotoStaging`) | effects.js:4216-4705; guard :4235 | per-frame restage measured "~660 ms/frame" BEFORE zones/field/cascades existed (cinema_maxq.js:3531-3533, §BAKE_FAST_PATH_COST) | STOPPER (S1) | nothing yet: no per-frame entry point; needs a build/decide split |
| setup | light budget (`SkyPortal.budget`) | sky_portal.js:88-119; called effects.js:4434 | once per staging, JS only | OK | counts fixed per film (pool tools.js:2141-2153, pads sky_portal.js:196-203) |
| setup | zone grid `LightZones.build` (+ §GLARE audit) | light_zones.js:127-266; cache key :129 (building + guidMap count) | Hospital build 2184 ms, Clinic 404, Terminal 1462; auditMs 1469/272/659 (PSR:290-291) | OK per building; STOPPER per frame (S3) | cache (:129) — but the key has no 4D cursor, see S3 |
| setup | camera zone + visible zones `SourcedLight.prepare` (12x7 = 84 raycasts on all meshes) | sourced_light.js:277-296; gated `!A._maxqActive` effects.js:4435 | 2.3 s/press (PSR:146); "zoneCap 0.7-1.2 s" (brief) — measured by `§STILL_STAGE_MS zoneCap=` (effects.js:4438, :4663) | STOPPER per frame (S5) | nothing: needs a ray-free camZone/visible-zone source (ALTC F1) |
| setup | zone texture upload RG16UI | sourced_light.js:406-417 (keyed `texKey`), field G :345 (keyed `rgFieldKey`) | Hospital 2 x 20.7 MB (PSR:938); `uploadMs=` logged (sourced_light.js:353-355), value not read | OK | uploaded once per building; a repeat `stage()` does not re-upload while the key holds |
| setup | sky-view field F (`LightZones.field`) | light_zones.js:492-523 (cached `Z.field` :493); `fieldOn` = `!A._maxqActive` sourced_light.js:301 | cost cap "first press <= +3 s Hospital" (PSR:1030); measured `sweepMs=` not read | OK on cost; STOPPER on gate (S2) and 4D (S3) | camera-free AND sun-free (CIE overcast weights; no `A.sun` read in light_zones.js:477-523): one build per building |
| setup | `SourcedLight.stage` (unstage + 3 scene traversals + push to every material + `glassOn` + onBeforeRender hook + §METER + §LUX_CHECK + ADF cross-check) | sourced_light.js:399-454; gated effects.js:4574 | not measured as a whole; meter `ms=` and field `ms=` logged | STOPPER per frame (S1) | split: texture/field/glass-depth parts are once per film; only bind + meter are pose work |
| per render | lamp/portal zone binding `bindLights` in `scene.onBeforeRender` | sourced_light.js:204-233, hook :430-441 | runs on EVERY render (fold 20 + capture 1 + meter/readback renders); `atLamp` only for a moved light (position cache :210); not measured | OK (not measured) | cached light order (:203), position cache |
| per frame | §SKY_PORTAL stage (collectPanes + 10 raycasts per pane) | sky_portal.js:121-249 | 3.4-3.8 s per stage (PSR:1041) | STOPPER per frame; film uses `frame()` instead | film pane cache (:182-192) + `frame()` re-aim (:251-271); ms in `§FILM_PARITY_FRAME portal=` (effects.js:4737) |
| per frame | §SKY_PORTAL film pane cache | sky_portal.js:182-192; cleared by every unstage (`film = null` :274) | classified once, 843-989 ms (ALTC:151) | WRONG today (S3b) | built at frame-0 staging = frame-0 glazing only |
| per frame | portals vs field | portals retired only when `!A._maxqActive` (sky_portal.js:87, :127) | — | STOPPER (S2) | Alt+S = field + 0 portals; film = 32 portals, no field: two light models |
| per frame | sun move `_sunArcStep` → sun map re-render | effects.js:2719-2742 (`shadowMap.needsUpdate` :2724/:2734) | 8192 map on Hospital = 512 MB (PSR:369, D1); per-frame shadow ms not measured in films (ALTC:43) | RISK (measure M1) | unavoidable: the sun moves (ALTC F2/F6) |
| per frame | §STILL_SHADOW_FIT film box | `_stillFitApply(true)` effects.js:3158-3243 via `_filmParityShadowFit` :3514; per-shot boxes :3198-3206; precompute :3518 | JS only, not measured | OK | size fixed per shot, centre texel-snapped (:3203) |
| per frame | §STILL_SHADOW_EDGE depth fit + (R+1.5)-texel bias | `_stillEdgeDepth` effects.js:3254-3291; skipped for films (`!film`, :3221; films keep 2 x texel :3220) | JS only | STOPPER on gate (S2) | OK per shot (F2: depth union per shot) |
| per frame | §STILL_SHADOW_CASCADE (4 maps, SDSM readback, PSSM splits, D8 fallback) | `_stillCascadeApply` effects.js:3441-3513; readback :3349-3390; D8 single :3422-3440; `_cascadeOn` = `!A._maxqActive` :3294-3297; film entry returns null :3393 | per call one extra full-scene 160x90 render + `readRenderTargetPixels` GPU sync (:3364); every used cascade re-renders whenever the sun map does (:4694) = up to 4 x 4096^2 passes per frame; press wall 55.8 vs 55.6 s (PSR:409); per frame not measured | STOPPER per frame (S4) | per-shot fixed splits/boxes/mode (F2), no readback per frame |
| per frame | cascade light count | lights added only if `_cascadeOn()` (effects.js:3308-3328), removed at every full teardown (:3870) | a count change = recompile, 40-108 s (ALTC:49); link 46.4 s Hospital (PSR:131) | OK if the film follows Alt+S (m=4 fixed, C1); RISK R1 | m fixed per session (PSR:355-357) |
| per frame | lamp pick (frustum + top-up; zone rank only with `_sourcedCap`) | tools.js:1947-2012 (`_zoneCap` :1987); pool slots :2141-2221 | runs 3x per frame (keep-staging teardown effects.js:5446-5449, restart, fill pin :2802); not measured | RISK (R6) + WRONG (frustum-based; §LAMP_ZONE_PICK not built) | pool count frozen (tools.js:2141-2153), stable slots (:2181-2207); needs fades (ALTC F1) |
| per frame | §STILL_GLOW daylight / camera-inside | `_filmParityStep` effects.js:4716-4732; `_stillCamInside` up-ray on all visible meshes :4189-4215 | one scene traverse + raycast per frame; not measured | RISK (0↔full step, ALTC:53; inside rule differs from Alt+S camZone, R4) | uniforms only (:4728), no recompile |
| per frame | lamp calibration + portal exposure | effects.js:4422-4424; sky_portal.js:154 | constant | RISK (R11, leak) | computed once per film from the staged sun intensity (`updateSky` moves the sun, not its intensity: scene.js:268-330) |
| per shot | §METER (Stevens 0.33 incident meter) | sourced_light.js:533-546; `meterRead` 160x90 float render :468-502; inside = camZone :446 | `ms=` logged per press (:543), value not read; 1.16-stop swing between two poses of one zone (ALTC:218) | OK per shot / STOPPER per frame | ALTC F3: once per shot, held |
| per shot | §LUX_CHECK | sourced_light.js:371-397 | log only | OK | not a look decision |
| once | §GLASS_FRESNEL clones | glass_fresnel.js:22-73 (films: effects.js:4573) | clone programs compile on first use (ALTC:61) | OK | kept for the film |
| once | glass out of the sun shadow pass | `glassOn` sourced_light.js:236-246, inside stage | one traverse | OK once; blocked only by the S2 gate | material swap once per film (ALTC F6) |
| — | §GLASS_VEIL | not built (spec PSR:1111-1141) | — | RISK (R10) | per-material clone once; camera side per frame must be stable |
| — | §METER_HIST | not built (spec PSR:1169-1195) | — | OK if per shot | same as §METER |
| — | cove base light | not built (spec PSR:794) | — | RISK (R9) | analytic uniform term, no light objects |
| per frame | eye light §CAM_LIGHT | effects.js:4637 (`!A._maxqActive` → films keep it ON) | uniform | WRONG (S2 list) | off in Alt+S with calib; on in films |
| capture | bounce `GiFilm` / `__giCaptureFrame` | gi_still.js:891-975; hook cinema_maxq.js:1665 | build 8.0-8.5 s once per film (ALTC:65); Hospital still first build 116 s (PSR:660); 53-61 ms/pass HHS 720p, +0.13 s/frame Terminal 1080p (ALTC:65); full-frame float readback + JS per-pixel loop every frame (gi_still.js:932-941) | OK per frame (1 pass); RISK (R7) | bounce renderer sees no lights = no pipeline rebuild on light changes (gi_still.js:515-520); rebuilt only on size change (:914-919) |
| capture | frame reuse inside load-path holds | cinema_maxq.js:4540-4574 | saves frames | RISK (R3) | key = HUD alpha, load-path rev, camera, compass elevation, day text; no light state |

## STOPPERS (plain English, each with the minimal remedy)

**S1. There is no per-frame Alt+S function to call — Alt+S lighting is one monolithic, one-shot staging.**
`_applyPhotoStaging` (effects.js:4216) runs once per cycle (guard :4235) and a film keeps it for the whole film (cinema_maxq.js:3535,
:4005). Inside it, each Alt+S step mixes once-per-building work with the per-pose decision in one call:
`SourcedLight.stage` (sourced_light.js:399-454: unstage, 3 whole-scene traversals, a push to every material, glass swap, render hook,
meter render, lux/ADF), `SkyPortal.stage` (3.4-3.8 s, PSR:1041), `SourcedLight.prepare` (84 raycasts, 2.3 s, PSR:146). Calling those per
frame redoes building-level work every frame; the one time the film DID restage per frame it cost ~660 ms/frame, before any of these
existed (cinema_maxq.js:3531-3533). Against a 0.93-1.93 s frame (ALTC:72) that is unaffordable.
Minimal remedy: split each Alt+S step into `build(building)` (cached, runs at warm-up) and `decide(camera, sun, t, geometry)` (pure,
uniforms/light positions only). Alt+S = build + decide; the film = build once + decide per frame + smoothing. `SkyPortal.frame`
(sky_portal.js:251-271) is the only function already shaped this way.

**S2. The Alt+S look is gated OUT of films, so today the film cannot inherit it.**
Still-only gates on look decisions: zones/cap `prepare` (effects.js:4435), `SourcedLight.stage` (:4574), sky field `fieldOn`
(sourced_light.js:301), portal retirement (sky_portal.js:87), cascades `_cascadeOn` (effects.js:3294-3297), edge depth fit `!film`
(:3221), cascade film entry `return null` (:3393), portal shadow bias (sky_portal.js:207), sky occlusion (effects.js:4569), eye light (:4637).
Consequence: an Alt+S still lights through glass with the sky field and 0 portals; a film lights it with 32 portals (8 shadowed) and no
field, no zone binding, no indoor sky cut — a different light model, not smoothing. Meanwhile lamp calibration and portal exposure leak
INTO films through `installed()` tests (effects.js:4422; sky_portal.js:154), as ALTC:94-97 found.
Minimal remedy: ALTC F0 gate hygiene, done per function as S1's `decide` parts land: every look gate becomes
`(!A._maxqActive || A._filmParity)`; anything left still-only must be named smoothing.

**S3. 4D build-up: the zone grid and sky field describe ONE geometry state for the whole film.**
`LightZones.build` caches on building + guidMap count (light_zones.js:129) — the 4D cursor is not in the key, so the first build wins
for the session; the field (`Z.field`, :493) and daylight panes (`Z.day0`, :388) ride on it. Opened to films, the first call would be
the warm-up staging, which runs BEFORE the build-up is armed (cinema_maxq.js:3050 vs :3090) → the FINISHED building. Then every frame of
the build-up treats a storey whose roof and walls are not placed yet as COVERED/indoor: its hemi/ambient/IBL is cut to F or to 0
(`uSLParams.z`), so its sun-shadowed faces render black — the black_exterior class — for most of the film (the lights-off window alone
is 60-75% of the Hospital/Terminal films, ALTC:69). The other way — rebuild from current geometry per frame — costs Hospital 2184 ms
build incl. audit (PSR:290-291) + field sweep (cap +3 s, PSR:1030) + a 41 MB re-upload (PSR:938) per frame, and pops zones mid-shot.
The build also reads a MIXED state if it ever runs mid-build-up: plain meshes and BatchedMesh slots are taken even when Time Machine
hid them (no `visible` / `getVisibleAt` test, light_zones.js:42-68), while zero-scaled InstancedMesh slots are dropped (:63).
Minimal remedy: ALTC F5 — keep the finished-building grid (built at warm-up), add one `enclosedFrac_z(t)` per zone from boundary-face
placement timestamps (a per-zone float uploaded per frame) and scale the indoor sky cut by it; lamps and glazing fade in at placement.

**S3b. (existing defect, same class) The film's portal pane cache is the glazing visible at FRAME 0.**
The warm-up teardown clears the cache (`unstage` → `film = null`, sky_portal.js:274); frame 0 re-stages after `tmSetCursor`
(cinema_maxq.js:3694 before :4005), and `collectPanes` keeps only `o.visible` meshes (sky_portal.js:40) → on a build-up film, glazing
placed after frame 0 never gets a portal. This contradicts ALTC row 23 ("pane set frozen at staging (finished building)").
Minimal remedy: build the pane cache (and any camera-free table) at warm-up and keep it through the warm-up teardown.

**S4. Cascades called per frame are unstable and not repeatable.**
`_stillCascadeApply` (effects.js:3441-3513) takes its splits and boxes from THIS frame's 160x90 depth readback (:3349-3390), so split
distances, boxes and texels change every frame — shadow edges crawl (the single-map fit already measured "16 size changes in 120
frames" before per-shot boxes, effects.js:3207-3209). It is also path-dependent: the D8 single fallback re-sizes and releases the sun map
(:3426); the next call reads that new sun size as the cascade size (:3466-3467) and the memory cap then drops cascades (:3478), so the
result depends on the previous frame's mode and each flip reallocates a 512 MB map. Every call adds a full-scene render plus a GPU-sync
readback (:3364), and every used cascade re-renders whenever the sun map does (:4694) — which is every film frame (:2724/:2734).
Minimal remedy: ALTC F2 — per SHOT, from the plan's sampled poses (the precompute exists, effects.js:3518): fixed mode (cascades or
single, decided once per film), fixed splits, fixed box sizes (sphere fit); per frame only the texel-snapped centre moves; no readback per frame.

**S5. The zone-aware lamp pick depends on a ray grid.**
The camera zone and "zones the frame shows" come from `prepare`'s 84 raycasts against every mesh (sourced_light.js:283-290), 2.3 s/press
(PSR:146). §LAMP_ZONE_PICK makes that same input the lamp rule for stills AND films (PSR:1156-1159). Per frame it is unaffordable; in
films today `_sourcedCap` is null (prepare gated, effects.js:4435), so the zone rank never runs (tools.js:1987).
Minimal remedy: camera zone = `LightZones.at(camera)` (light_zones.js:272, no rays); visible zones = zone bboxes vs the frustum or a
zone-id readback, per ALTC F1; the same function serves Alt+S (which also meets PSR:146's own target of <200 ms per press).

## RISKS
- **R1 Warm-up double link.** The warm-up full teardown (cinema_maxq.js:3069) removes the cascade lights (effects.js:3870) and the
  portals (sky_portal.js:273-282); the page renders in nav state for 2 rAF + 3 s (:3070); frame 0 adds them back. If three releases the
  staged programs in between, the film links twice (46.4 s Hospital link, PSR:131; first film frame 111 s, ALTC:72). Not measured.
- **R2 GPU memory / Context Lost.** C3 caps cascades at 512 MB (PSR:360-361), but in D8 single mode the three cascade maps (rendered
  once at add, effects.js:3321) are not released while the sun map is re-sized to 8192 (:3426) = 512 + 3 x 128 MB; the line prints
  `memMB` for the sun size only (:3436). Plus the zone texture 41 MB (PSR:938), portal maps 8 x 512^2 (sky_portal.js:168-173), the
  film's own WebGPU bounce renderer (gi_still.js:914-919) and, in-window, the Alt+S bounce renderer kept until Alt+Shift+S
  (gi_still.js:61, :676, :881) — two WebGPU devices beside the WebGL context; their sizes are not measured. "1 GB is a Context Lost
  risk" (PSR:361); a lost context ends the film at that frame (cinema_maxq.js:3527).
- **R3 Frame reuse keeps no light state.** The key (cinema_maxq.js:4552-4557) has no lamp, portal, exposure, fade or seed term. Any
  continuity state that advances per frame INDEX (F1/F5 fades, F7 re-seed) freezes on reused hold frames and jumps at hold exit. Key the
  fades on film time (frozen in a hold) or add a light-state hash to the key.
- **R4 Two "inside" rules.** Alt+S meters "inside" from the camera zone (sourced_light.js:446); films decide it with an up-ray against the
  CURRENT geometry (effects.js:4208-4214) — under an unbuilt roof the two disagree. The meter must also run after that frame's lamp set is
  decided (today the fill pin re-picks the pool after staging, effects.js:2798-2803).
- **R5 In-window vs CLI.** CLI `--gpu sw` never gets WebGPU (cli_silent_bake.js:300) → `§GI_FILM_OFF` (gi_still.js:955-961): no bounce
  while Alt+S has one. In-window: Time Machine may already sit at a partial cursor before Alt+C → the first zone build (warm-up) would
  cache partial geometry (light_zones.js:129); a prior Alt+S leaves its cache and its bounce renderer. The lamp cap and shadowed-portal
  count come from backend caps (sky_portal.js:95-117) — headless gl-egl and the user's desktop Chrome may differ, giving different lamp
  sets at the same pose. A hidden tab parks the in-window bake (cinema_maxq.js:726, :3538); headless is never hidden.
- **R6 Lamp pick cost.** `_nightUpdateLights` runs 3x per frame (ALTC:52; effects.js:5449, :2802) plus a whole-scene up-ray per frame
  (effects.js:4208-4211). Not measured.
- **R7 Bounce.** Rebuilt every film (disarm disposes, gi_still.js:967-971): 8.0-8.5 s (ALTC:65), 116 s for a Hospital still's first
  build (PSR:660). F4's N sub-passes multiply the +0.13 s/frame (Terminal 1080p). Blank grabs are guarded only when the bounce is armed
  (gi_still.js:905-912); the no-bounce capture path has no guard (cinema_maxq.js:1674).
- **R8 Sky field: fine per frame.** Camera-free and sun-free, cached, uploaded once (light_zones.js:492-523; sourced_light.js:345). Its
  only film problem is S3. `stageField` also re-runs the ADF cross-check on every stage (sourced_light.js:363; cached base `Z.day0`).
- **R9 Cove (not built).** Spec keys it on "rooms with 0 portals and 0 lamps" (PSR:794); with portals retired every room has 0 portals.
  It must key on the zone's placed-lamp inventory at time t (not the capped per-frame pick) and fade at placement, or it flickers with the pick.
- **R10 Glass veil (not built).** Clones once per material (OK); its `cameraSide=in|out` (PSR:1136-1138) must come from the same stable
  inside rule as R4.
- **R11 Leaks already in films.** Physical lamp multiplier (effects.js:4422-4424) and portal exposure 1 (sky_portal.js:154) key on
  `installed()`, not on zones/meter running (ALTC F0). Any parity clip on this tree is judged under that leak.

## Measure before the film lane starts (one line each, with the log line that measures it)
1. **FIRST:** per-frame shadow cost on a 5 s Hospital parity clip, single 8192 vs 4 x 4096 cascades (the only per-frame cost S4's remedy
   cannot remove; ALTC:43 says it is unmeasured) — no film line exists yet; spec'd as `§FILM_SHADOW f= ... shadowMs=` (ALTC:184-185), timed
   with gl.finish as witness_still_shadow_edge.js does; frame total from `§MAXQ_FRAME ... perFrameMs=` (cinema_maxq.js:4659).
2. Warm-up vs frame-0 link (R1): `§STILL_STAGE_MS ... link= (first frame, newPrograms=)` (effects.js:4663-4668) — two lines per film.
3. Hospital parity per-frame baseline: `§MAXQ_FRAME ... perFrameMs=` (cinema_maxq.js:4659) + `§FILM_PARITY_FRAME ... ms=` (effects.js:4737) + `§GI_FILM ... meanMs=` (gi_still.js:948).
4. Zone/field/cap first-press costs per building: `§STILL_STAGE_MS zoneBuild= skySweep= audit= zoneCap= portals= sourcedStage= shadowFit=` (effects.js:4663) and `§SKY_VIEW_FIELD ... sweepMs= uploadMs=` (sourced_light.js:353-355).
5. Cascade call cost and memory (S4, R2): `§STILL_SHADOW_CASCADE ... memMB= ... ms=` (effects.js:3500-3512) — plus the real resident total in D8 mode (the single-mode line :3436 under-reports; needs a per-light map sum).
6. Meter cost per shot: `§METER ... ms=` (sourced_light.js:543).
7. Program count across the film: `renderer.info.programs.length` per frame — spec'd as `programs=` in `§FILM_LIGHTS` (ALTC:160-161); today printed only in `§STILL_SHADOW_CASCADE ... programs=` (effects.js:3512).
8. Lamp churn on the current pick (baseline for F1 fades): `§LAMP_CAP_CHURN entered= left= maxStep= stepPctOfMax=` (tools.js:2216).
9. Reused frames inside holds (R3): `§FRAME_REUSE run ended ... reused=` and `§FRAME_REUSE_TOTAL` (cinema_maxq.js:4567, :4726).
10. Blank grabs (R7): `§GI_FILM_BLANK_GRAB ... total=` (gi_still.js:909) and `§GI_FILM done ... blankGrabsRecovered=` (gi_still.js:969).

## 2026-09-27 — review vs §LIGHT_ONE_SCALE
READ-ONLY (no code edited, no browser, no bake). Tree `/tmp/wt-lamp` = bim-ootb `fix/lamp-truth` @c539f129 (look lineage +
§SKY_SHELL_RAYS 808f578f, §METER_ONE_RULE fc8b07f6, §METER_EV 1b5f1c0b, §LIGHT_ONE_SCALE fixes 3-4 c539f129). Judged against
PHOTOREAL_STILL_RENDER.md §LIGHT_ONE_SCALE L1/L1a/L2/L3, §METER_EV, ALT+C RULINGS R1-R3. Line numbers re-found on this tree
(the 2026-09-25 table above cites the retired /tmp/wt-daylight). No gi_film*.js exists: `GiFilm` is gi_still.js:975-1042.
cli_silent_bake.js is at the repo root. HARD CONSTRAINT (red1): overlays (clash/measure boxes, rule findings film, captions,
discipline reveal, CPE paths, HUD) are out of scope of every remedy below — each remedy is in the light/exposure path only.

**Headline: a film today is NOT lit by §LIGHT_ONE_SCALE at all, parity or not.** One call-site gate, effects.js:4438
`if (!A._maxqActive && window.SourcedLight) SourcedLight.stage(A)` (no `_filmParity` carve-out), removes zones, sky field,
lamp data + §LAMP_EN, §IRC_MAX IR, cove + §COVE_IR and the §METER from every film. What films inherit is only the calibration
arithmetic (effects.js:4265 block is `!A._maxqActive || A._filmParity`) -> lamp multiplier + portal exposure 1.

| Alt+S light function | Alt+S file:line | Alt+C calls it? (gate) | per frame / per shot, cost | determinism | 4D build-up (R2) | flicker risk |
|---|---|---|---|---|---|---|
| §METER_EV meter / meterRead / remeter | sourced_light.js:1149, 1226, 1243 | NO — stage() effects.js:4438 and remeter effects.js:5623 are both `!A._maxqActive` only (meter() itself has no gate) | one 160x90 float render + sync readback (+ zone-mask render in mode zone); `ms=` logged, value not read; per frame never tried | pure log-average of a fixed readback: deterministic for a fixed frame | reads the frame as drawn -> follows build-up by construction | as a per-frame JUMP: high (R1 forbids); as a per-frame target eased at a cited rate: low |
| §SOURCED_LIGHT_CALIB (luxPer) | effects.js:4265-4290 | YES under parity (`!A._maxqActive \|\| A._filmParity`, :4265) | JS only, once per staging | pure arithmetic | computed once at warm-up on the finished-building sun | none |
| zones `LightZones.build` | light_zones.js:197, key :129 | NO (only inside stage()) | Hospital 2184 ms / Clinic 404 / Terminal 1462 (record) — per building, not per frame | deterministic | key = building + guidMap count: no 4D cursor -> R2 "enclosed" needs a per-stage key | n/a |
| sky field §SKY_VIEW_FIELD / §SKY_SHELL_RAYS | sourced_light.js:711 fieldOn, :756 | NO; and portals are never retired for films: sky_portal.js:87 `retired()` requires `!A._maxqActive` | per building (sun-free, camera-free) | deterministic | field is built on the finished building -> wrong while walls/roof are missing (R2) | n/a in films today; films keep up to 32 portals (sky_portal.js:89) |
| lamps: data path + §LAMP_EN | sourced_light.js:333-336 `lampWanted` (explicit `!A._maxqActive`), enApply :510 | NO (doubly excluded); films use the tools.js capped pool | pool update runs ~3x per frame (record); not re-measured | pool pick is frustum/list order (`_zoneCap` tools.js:2067 needs `A._sourcedCap` from prepare(), `!A._maxqActive` effects.js:4294) | lamps appear with their elements (pool) | pool churn = pop-in (record R6); no fades |
| §IRC_MAX IR share | sourced_light.js ~421-490 | NO (inside stage()) | per building | deterministic | per-zone flux balance on the finished zones — wrong before enclosure | n/a |
| §COVE_LIGHT + §COVE_IR | sourced_light.js:858-1046 | NO (inside stage()) | per building (key :991) | deterministic | L1a "no real source" must be re-judged as lamps arrive (R2) | n/a |
| glass Fresnel / §GLASS_ENV | glass_fresnel.js:57 stage, :100 capture | stage YES (effects.js:4437 parity carve-out); capture NO (effects.js:5662 `!A._maxqActive` only) | capture = 6-face cube, not measured | deterministic | env would need a re-capture per build-up stage | low |
| gi_still bounce -> GiFilm | gi_still.js:925-1042; armed cinema_maxq.js:4035 | YES under parity, same dials as Alt+S | one SSGI pass per frame, `§GI_FILM f= meanMs=`; OFF in the default CLI (`--gpu sw`, cli_silent_bake.js:107/300 -> no WebGPU -> §GI_FILM_OFF) | per frame deterministic; blank-grab retry up to 3x | reads the drawn frame -> 4D-correct | low (blank-grab fallback, record R7); but it inherits audit #56 (bounce after the tone curve, albedo 0.5) |
| N8AO fold | effects.js:5205, consts :4857-4859 | YES, always (bake's own fold), budget 8 TAA + 12 AO (cinema_maxq.js:503, :2443) vs Alt+S 16 + 24 | ~450 ms of a 1989 ms Hospital frame (record, not re-measured) | deterministic for a fixed budget | occludes what is drawn | low (less converged); inherits audit #54 (AO over direct light) |
| shadow cascades | effects.js:3142 `_cascadeOn`, :3072 `csmRun = !film && ...` | NO by design; films use the single-map fit (:2996, :3589 parity carve-out) | cascade = SDSM readback + up to 4 maps per sun move | n/a | single map re-fit per frame -> follows build-up | low; coarser penumbra than the still |

**Alt+C's OWN light values that diverge from the law (all live on this tree unless marked):**
- D1 `FILM_FILL_AMBIENT 0.785 / FILM_FILL_HEMI 1.257` (effects.js:2775) written at :4446-4451 when `A._maxqActive && (!A._filmParity
  || A._filmFillRestore)`; `_filmFillRestore` defaults TRUE (:4104, off only with `&filmfill=alts`) => on even under parity. It
  overwrites the §STILL_BASE result (ambient x &base 0 = 0, hemi x &sky 2 = 1.234, :4382-4394) — i.e. re-adds a sourceless
  ambient 0.785 (audit #24 says 0) — and becomes `A._photoFillBase` (:4453). Breaks L1 + R3.
- D2 §SUN_ARC_FILL pin `_bakeFillPin` (effects.js:2623-2660, every frame via `A._sunArcFillPin`) holds ambient/hemi at that
  base whatever the sun elevation: while `_sunArcStep` (:2562) moves only the sun direction, sun intensity stays 4.4 (4315)
  and the sky term never follows the sun/sky split for the elevation. Breaks L1 (one clear-sky model for sun + sky).
- D3 `_nightPLScaleStaged` + §PL_TOPOUT_UNPIN `PL_TOPOUT_TARGET 1.0` (effects.js:2616-2621, 2636-2640): on this tree
  `_nightPLScaleStill` = 1.0 (tools.js:1100, §STAGED_PL_CUT retired), so staged 1.0 -> target 1.0 = a NO-OP ramp (delete);
  and lamp level in films is `NIGHT_LIGHT_INTENSITY 2.0` (tools.js:1309, eye-tuned) x the calibrated `_stillLampMul`, with
  decay `NIGHT_LIGHT_DECAY 1.0` for control films (tools.js:2261, 1321) vs the still's 1.5 — L1 for control films.
- D4 CAM_LIGHT 3 / 4 m / 0xffdca8 (effects.js:381) ON in every film: `_camSourcedOff` (:4501) contains `!A._maxqActive`, so
  the admitted non-source Alt+S turns off stays on in films. Breaks L1a (the cove is the only added source).
- D5 exposure: no meter in films => the film runs at the staging exposure 0.45 x PHOTO_EXPOSURE_SCALE 0.85 = 0.3825
  (effects.js:4318; x &stillexp :4428) for the whole film, whatever the view or sun. Breaks L3 and R1 (meter every frame,
  ease at a cited rate). Also SUPERSEDES ALTC_FOUNDATION F3 ("never per frame"): R1 (red1 2026-09-26) ruled per-frame metering
  with eased adaptation; §METER_EV cites the rate (3 stops/s up, 1 down).
- D6 portals vs field (sky_portal.js:87): films light windows with up to 32 SpotLights, Alt+S with the sky-view field —
  a different transport model (L2), not a magnitude. `PORTAL_EXPOSURE_EYE 10` is correctly replaced by 1 when calibrated
  (sky_portal.js:154) — negative finding, not a divergence.
- D7 LATENT (time_machine.js, no `_maxqActive` awareness): `applySunCycle` (:2584, called from `renderAtTime` :2318) writes
  `sun = 0.05 + dayFactor x 4.4`, `ambient = 0.15 + 0.6 d`, `hemi = 0.1 + 1.1 d` (:2707-2709) whenever `_sunCycle` is on, and
  `tmActivateForBake` (:9789-9794) reuses an active TM session without resetting it; Fly-Tour exposure ease
  `toneMappingExposure += (1.3|1.15 - cur) x 0.08` per frame (:2034-2039, gated `_camFollow && _cineStoryboard`, not set by
  cinema_maxq.js). Not observed in a bake; nothing prevents it. Break L1/L3 when triggered.
- D8 §GLASS_ENV capture absent in films (effects.js:5662): glass reflects the HDRI, not the lit scene (minor L2).

**Ranked stoppers (why a film cannot yet inherit the law):**
1. **S-LAW-1 the one gate** (effects.js:4438, :5623; sourced_light.js:335; sky_portal.js:87): the entire §SOURCED_LIGHT chain
   is still-only. Remedy = the 2026-09-25 S1 split (build per building / per build-up stage; bind + meter per frame) — no
   film inherits L1/L2 until it exists.
2. **S-LAW-2 no exposure law in films** (D5): fixed 0.3825 all film; R1 needs the §METER_EV meter per frame (one 160x90
   readback, cost `§METER ms=` to be read) eased at 3 stops/s up / 1 down. Best first step: it is camera-only, needs no zones,
   and reads the same `LightLaw` values (fix/light-law-module).
3. **S-LAW-3 FILM_FILL_RESTORE default-on** (D1+D2): films re-add a sourceless ambient 0.785 and pin a non-physical fill every
   frame. Remedy: default `_filmFillRestore` false under parity; fill from the same sky model as the sun (L1).
4. **S-LAW-4 R2 needs a 4D-aware zone/field/cove key**: the zone cache key (light_zones.js:129) and field/cove keys have no
   build-up stage, so "interior lighting only once ENCLOSED" has no data to switch on.
5. **S-LAW-5 portals vs field** (D6): two window-light models; film parity is impossible while films keep portals.
6. **S-LAW-6 CAM_LIGHT on in films** (D4): one-condition fix (drop `!A._maxqActive` from :4501), L1a.
7. **S-LAW-7 lamp pool pick/decay** (D3): frustum pick, no §LAMP_EN, decay 1.0 on control films, NO-OP topout ramp.
8. **S-LAW-8 latent TM writers** (D7): add a `_maxqActive` guard to applySunCycle / the Fly-Tour ease before any film
   exposure work, so nothing else writes exposure/sun during a bake.
9. (quality, not law) cascades still-only; GiFilm off in the default software-GPU CLI; N8AO + GiFilm inherit audit #54/#56.
Witness to open before any remedy: one parity bake log on Hospital, read for `§FILM_FILL_RESTORE`, `§SUN_ARC_FILL_PIN drift=`,
`§CAM_LIGHT on`, `§SKY_VIEW_FIELD off (film)`, absence of `§METER`/`§LIGHT_LAW` — each line proves one row above.

**§FILM_LAW — SPEC (2026-09-27; coordinator dispatch "make films follow the same optics law as the Alt+S still"; bim-ootb
branch `fix/film-law` from `fix/light-law-module` @39959e8a, tree /tmp/wt-film, sw v1465).** Light/exposure path ONLY — the
overlays (clash/measure boxes, rule findings film, captions, discipline reveal, CPE paths, HUD) are not edited and draw the same
things (red1 HARD CONSTRAINT). Every step is gated `A._maxqActive && A._filmParity`: the control clip (`--film-parity 0`) and
Alt+S are unchanged. One commit per step.
 S1 FILM EXPOSURE LAW (stopper S-LAW-2, D5; R1; L3 via §METER_EV). Replaces the fixed 0.3825 for parity films.
   - LAW: `LightLaw.ADAPT = { up: 3, down: 1 }` EV100 stops per second (UE `speed_up 3.0 / speed_down 1.0` [UE-CES], HDRP
     "dark->light 3 / light->dark 1" [HDRP-EXP]; engine_light_laws.md lines 56/118/143). `up` applies when the target EV100
     is ABOVE the current one (scene got brighter = eye goes dark->light), `down` when below. LAW.version 1 -> 2, so lawHash
     changes for the still too (a law value was added — same file, still and film agree by construction).
   - FORMULA (pure, node-tested): `LightLaw.adaptEv(evPrev, evTarget, dt)` = evTarget when evPrev is null (the first frame
     takes its target — no ramp-in), else evPrev + clamp(evTarget - evPrev, -down x dt, +up x dt). Linear capped rate: it
     cannot overshoot (the step never exceeds the remaining gap). UE's exponential tail inside 1.5 stops
     (`r.EyeAdaptation.ExponentialTransitionDistance`) is NOT reproduced: its closed form is not in the cited sources, and
     linear only arrives sooner, never overshoots (recorded deviation, no invention).
   - PER FRAME (effects.js `A._filmExposureStep(i, fps)`, called by cinema_maxq.js right after the fill step, before the
     fold is awaited): target = the §METER_EV chain on this frame — `SourcedLight.meterRead(A, {mode, quiet:true})` (160x90
     float readback, same mode rule as the still: &metermode / APP._stillMeterMode / 'hist') -> Lcd = L x luxPer ->
     `LightLaw.ev100` -> eased EV -> `LightLaw.exposureFromEv(EV, luxPer, acesDiv)` -> renderer.toneMappingExposure.
     dt = 1 / fps of the bake (frame clock, never the wall clock: deterministic, same film at 15 or 24 fps adapts in the
     same seconds). luxPer = the calibration the parity film already computes (effects.js:4265 block). `quiet` only
     suppresses the per-call §METER_HIST line (no change for the still, which never passes it).
   - LOG per frame: `§FILM_EXPOSURE f= targetEV= EV= exposure= Lcd= first=0|1 capped=up|down|- ms=`. VACUOUS lines (no
     calibration / no luminance read) hold the previous exposure and say so. Opt-out (control): `&filmexp=0` /
     APP._filmExpOff = true -> `§FILM_EXPOSURE off (control)` once, fixed staging exposure as before.
   - STATE: reset at each film staging and at teardown (teardown restores the staging exposure first). A resumed
     `--frame-range` run starts from its own first-frame target (logged first=1) — deterministic per run.
   - LAW PROOF: `LightLaw.log(A, 'film-first')` on the first metered frame and `'film'` every 24th — lawHash per film equals
     the still's (same file), liveHash carries this frame's exposure/ev.
 S2 NO SOURCELESS FILM FILL (stopper S-LAW-3, D1+D2; L1; R3). `_filmFillRestore` default FALSE under parity: the film takes
   the §STILL_BASE result exactly as Alt+S (ambient x &base 0 = 0, hemi x &sky 2). Opt-in back-compat: `&filmfill=restore` /
   APP._filmFillRestore = true / cli `--film-fill restore` (logged `§FILM_PARITY ... fill=restore (opt-in, NOT the law)`).
   The per-frame §SUN_ARC_FILL pin no longer WRITES ambient/hemi in a parity film without restore: it checks them against the
   staged still base and logs `§FILM_FILL_CHECK drift=none|...` (a witness, not a writer — a drift exposes stopper 8's
   latent writers instead of masking them). Lamp budget/plScale/pool part of the pin untouched (stopper 7, not this pass).
   ⚠ supersedes red1's 2026-09-24 "restored is better" (§FILM_FILL_RESTORE) by §LIGHT_ONE_SCALE L1 — re-approval by numbers.
 S3 CAM_LIGHT OFF IN FILMS (stopper S-LAW-6, D4; L1a): `_camSourcedOff` also true for `A._maxqActive && A._filmParity &&
   A._stillCalibOn` (the film's own calibration switch; &calib=0 keeps it on as in Alt+S). §CAM_LIGHT line says `off (film,
   L1a)`.
 S4 (SPEC ONLY this pass — see plan below): the sourced chain in films under R2/R3.
 CHECKS: node --check each edited file; `viewer/tests/witness_film_exposure_unit.js` (witness_kit contract) on adaptEv:
   step up 4 stops and down 4 stops at 30 fps -> per-frame delta <= 3/30 up and <= 1/30 down, reaches the target in
   ceil(4 x 30 / 3) = 40 frames up and 120 frames down, never overshoots, bit-identical on a second run, first frame = target;
   redControl = an uncapped ease (jump) is detected as a violation. INCONCLUSIVE if light_law.js lacks adaptEv / nothing judged.
 GPU WITNESS (queued by the coordinator, NOT run here) — see "§FILM_LAW — GPU witness" below.
**§FILM_LAW — DONE S1-S3 (code + node witness; GPU witness QUEUED, not run).** bim-ootb `fix/film-law` pushed @3688b3c5 (base
39959e8a): S1 d3166849 (+a8b1bad1 teardown clears the film's _meterLast, +78b4e14f/3688b3c5 log fields), S2 51a401ba, S3
b7a6af87. Files: light_law.js (v2, ADAPT + adaptEv), effects.js (_filmExposureStep, fill default, fill check, camlight),
cinema_maxq.js (one call after the fill pin), sourced_light.js (meterRead opts.quiet), cli_silent_bake.js (--film-fill law|restore,
--film-exposure 0|1), viewer.html ?v= light_law 2 / sourced_light 55 / effects 110 / cinema_maxq 9, sw v1465. No overlay file
touched (diff stat: 8 files, none of clash/measure/findings/captions/reveal/CPE/HUD code). node: witness_film_exposure_unit.js
`§WITNESS_FILM_EXPOSURE_UNIT pass=4 fail=0 ran=12` (up: 40 frames to +4 EV, max rise 0.1/frame; down: 120 frames, max fall
0.0333/frame; no overshoot; bit-identical rerun; 15 vs 30 fps both 1.3333 s; redControl jump detected). FOUND BY THE WITNESS:
float summation left the EV 1e-14 short -> one extra frame (41 vs 40); fixed with a 1e-9 EV landing tolerance.
witness_light_law_unit.js still pass=4 (41 rows). lawHash is now 611dfd50 (v2; was 5368cb0a — ADAPT is a law value).

**§FILM_LAW — GPU witness (for the coordinator's queue; one GPU agent, real GPU, NOT software).**
 RUNS (Hospital, `bim-ootb` tree /tmp/wt-film @3688b3c5, serve it, real GPU so GiFilm runs as in production):
  A. NEW: `node cli_silent_bake.js --db HospitalAjaibPath --gpu real --fps 15 --frame-range 0:90 --out /tmp/film_law_new.mp4
     --log /tmp/film_law_new.log` (defaults: parity 1, fill law, exposure meter). Same flags as the lane's usual Hospital bake
     (if the lane's reference bake adds --clash/--measure/--label, add the SAME ones to A, B and C — overlays must be ON to
     judge that they are unaffected).
  B. BASE (same flags, tree /tmp/wt-law @39959e8a — the light-law module without §FILM_LAW) -> /tmp/film_law_base.log.
  C. CONTROL on the new tree: `--film-exposure 0 --film-fill restore` -> /tmp/film_law_ctl.log (must reproduce B's light lines).
  D. Alt+S on the new tree at the pose printed by A's `§FILM_EXPOSURE f=0 ... cam=[..] tgt=[..]`, SAME db (HospitalAjaibPath), one press;
     read its `§METER ... EV100=` and `§LIGHT_LAW tag=remeter lawHash=`. If f=0 is an interior pose, also press at the first
     frame whose `skyPx` > 20% of 14400 (outside) — the outside pose isolates the exposure law from stopper S-LAW-1 (no zones /
     field / lamp data in films yet).
 ASSERTIONS (read the logs, no pixels; each prints PASS / FAIL / INCONCLUSIVE):
  1. `§FILM_EXPOSURE` present on every captured frame of A (90 lines, VACUOUS count reported; > 10% VACUOUS = INCONCLUSIVE).
  2. Speed limit: for consecutive frames, EV[f] - EV[f-1] <= 3/15 + 1e-9 and >= -1/15 - 1e-9; `capped=` frames counted
     (0 capped frames over the whole clip = the limit was never exercised -> report INCONCLUSIVE for this row, not PASS).
  3. No overshoot: EV never crosses targetEV in the direction it moves (same rule as the unit witness).
  4. First frame: `first=1` on f=0 only; EV(f=0) = targetEV(f=0) exactly.
  5. Still parity of the law: |EV(A, f=k) at the outside pose - EV100(D, same pose)| <= 0.3 when that frame is not capped
     (use targetEV of the film frame). An interior pose may differ by more — record the delta as the stopper-1 residual, not a fail.
  6. lawHash: every `§LIGHT_LAW tag=film-first|film` line in A = the Alt+S `§LIGHT_LAW` lawHash in D = 611dfd50 (node value).
  7. S2: A shows `§FILM_PARITY on fill=alt-s (ambient 0, §FILM_LAW S2)`, no `§FILM_FILL_RESTORE ambient` line, `§FILM_FILL_CHECK
     ... drift=none` (any drift line = a latent writer, stopper 8 — FAIL with the writer's values), and every §FILM_EXPOSURE line
     ambient=0.000 hemi=<the §STILL_BASE hemi of the press>. C shows the restore line (control intact).
  8. S3: A shows `§CAM_LIGHT off (film, L1a: not a real source)` and camLight=0 on every §FILM_EXPOSURE line; C shows the
     same line (C only changes fill/exposure) — B shows `§CAM_LIGHT on`.
  9. Overlays unchanged: for every overlay §-tag family in B (§CLASH_*, §MEASURE_*, §FINDINGS_*, §HUD_*, §CPE_REVEAL*/§CPE_TAIL*,
     room titles / captions, §LOADPATH_HUD*) the count of lines and every numeric field except ms= / timings are identical in A
     (diff of the tag-filtered, timing-stripped lines). Zero overlay lines in B = INCONCLUSIVE (overlays were not on).
  10. Program count: `programs=` on §FILM_EXPOSURE constant from f=1 to the end (f=0 may add the meter's float-target programs
     once; report that delta). Frame time: mean §FILM_EXPOSURE ms= reported (the per-frame meter cost — the number S4 needs).
  11. C's §FILM_EXPOSURE `off (control)` line present and its exposure constant all clip (= B's staging exposure 0.3825 x
     &stillexp) — the opt-out works.

**§FILM_LAW S4 — SPEC ONLY (not implemented this pass): the §SOURCED_LIGHT chain in films under R2/R3 (stopper S-LAW-1).**
 Why not now: S-LAW-1 is the whole chain behind one gate (effects.js:4438 stage, :5623 remeter, sourced_light.js:335 lampWanted,
 sky_portal.js:87 retired, effects.js:4294 prepare) and R2 has no data to switch on (stopper 4). Not "small".
 SPLIT (R3: camera-free terms once per building / build-up stage; per frame only sun, camera, exposure):
  4a. KEY: add a build-up stage to the zone / sky-field / cove / IR cache keys (light_zones.js:129; sourced_light.js field key
      ~:756, cove key :991, irKey). Stage = a hash of the set of PLACED enclosure elements (walls, slabs, roofs, windows) at the
      TM cursor, quantised to change only when an enclosure element is added (not per frame). Cost: a set hash per frame
      (O(placed) once per change, index by _metaGen like §SHADOW_FRONTIER's _fcIdx). Witness: key changes exactly on enclosure
      adds over a buildup film; constant over a no-buildup film.
  4b. ENCLOSED test (R2): a zone is "enclosed" when its boundary cells are all SOLID in the stage's grid AND a roof slab
      covers it; unenclosed zones read as OUTDOORS (zone id 0: sun + sky + shadows + bounce). Comes free from building the zone
      grid on the stage's placed geometry (4a) — LightZones.build already floods from outside; an open room joins zone 0.
      Cost: one zone build per stage change — Hospital 2184 ms / Clinic 404 / Terminal 1462 (record) per build; with N stages
      that is N x build. Cap: build only on stage changes at least K frames apart (K from the film's own pacing), reuse
      otherwise; log `§FILM_ZONES stage= built= ms=`. Needs a cost number from the GPU witness first (row 10).
  4c. FADE (R2 "switch fades over a few frames"): per zone, blend factor 0->1 over a fixed frame count (film clock, not wall)
      when it becomes enclosed — a uniform per zone (texture row), no recompile. Constant program count (R3).
  4d. STAGE ONCE PER FILM: lift the `!A._maxqActive` gate at effects.js:4438 / :4294 / sourced_light.js:335 for parity films,
      with SourcedLight.stage() doing only the camera-free parts at staging (install uniforms, lamp data + §LAMP_EN, IR, cove on
      the current stage); its meter() replaced in films by S1's §FILM_EXPOSURE (already the same chain). Per frame: camZone
      bind (cheap, LightZones.at) + the S1 meter. Remeter (effects.js:5623) stays still-only — S1 meters every frame anyway.
  4e. PORTALS vs FIELD (stopper 5): sky_portal.js:87 retired() for parity films once the field exists on the stage (4a);
      until then keep portals (a film with neither would lose window light). Constant light count -> constant programs.
  4f. LAMPS (stopper 7): lamp data path (lampWanted) in films + §LAMP_EN; lamps enter with their elements (the pool's order
      replaced by the data list filtered by placed guids); decay 1.5 as the still. Fade-in over the same frame count as 4c.
 ORDER + COST: 4a (small, keys only) -> 4b (one zone build per stage — the main cost) -> 4d (gate lift, needs 4a/4b so the
 finished-building field is never used on an unfinished building) -> 4c -> 4e -> 4f. Each on its own fix/ branch with a GPU
 witness (per-frame §-lines; overlay counts unchanged; programs constant). S4 cannot be judged before the S1 GPU witness gives
 the per-frame meter ms and the program-count behaviour.
 ⛔ red1: (1) S2 retires the §FILM_FILL_RESTORE look you approved 2026-09-24 ("restored is better") in favour of L1 + the S1 meter
 — confirm by numbers from the GPU witness (restore stays available via --film-fill restore). (2) R2's "enclosed" = walls + roof
 of THAT space (4b) — confirm a space with walls and no roof yet is lit as outdoors.
