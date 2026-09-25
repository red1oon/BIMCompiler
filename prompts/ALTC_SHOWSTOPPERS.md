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
