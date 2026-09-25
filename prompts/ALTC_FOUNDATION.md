# ⚠ DO NOT REMOVE — §ALTC_FOUNDATION spec: the lighting foundation Alt+C films need (2026-09-25)
# SCOPE: spec only, no code. What a film (Alt+C: cinema_maxq.js recorder loop + cli_silent_bake.js) must
#   have so that the finished Alt+S look can be carried into it frame by frame, whatever the current Alt+S
#   fixes (§STILL_SHADOW_EDGE, §ZONE_OPEN_SKY, §SOURCED_DAYLIGHT) turn out to be. Read the log after every
#   run: every claim below is a file:line or a record line, every witness is a § line or node maths — no
#   frame judging, no ray grids. Sources read: bim-ootb /tmp/wt-shadow-edge (feat/still-shadow-edge
#   @5c48105a, sw v1351) and bim-compiler prompts/PHOTOREAL_STILL_RENDER.md @7613fa219 ("the record").
#   "not measured" means exactly that. Honour this block until the lane is DONE.

## 0. How to read this
- "Alt+S" = one press of the still: `_applyPhotoStaging` (effects.js:3966-4411) runs ONCE, then the
  TAA/AO fold (16 + 24 composer renders, effects.js:4711-4712) and the 8-pass bounce (gi_still.js:58, 662-711).
- "Alt+C" = the recorder loop (cinema_maxq.js:3521 `for i < nFrames`). Per frame it: sets the 4D cursor
  (:3694 `tmSetCursor`), poses the camera, `startStillRefine()` (:4005, staging kept across frames by
  §MAXQ_STAGE_KEEP :3528-3535), moves the sun (:4023 `_sunArcStep`), runs `_filmParityStep` (:4036), pins
  the fill (:4037), waits for the fold (:4038, budget cinema_maxq.js:2436-2446), captures (:4572 →
  `_captureFrame` :1599, bounce hook :1665).
- `A._filmParity` (effects.js:3988) = "a film stages the Alt+S look"; `!A._maxqActive` alone = Alt+S only.
- Line numbers are from the tree above. The film-parity branch (feat/film-parity @eb3a41c1) is MERGED into
  this tree's ancestry (feat/sourced-light was cut off eb3a41c1, record line 646-647), so what is in the
  tree is what films have.

## 1. INVENTORY — every Alt+S lighting/look step, and what it does in a film

Legend, "depends on": CAM = camera pose, SUN = sun direction/elevation, GEO = visible geometry (the 4D
build-up changes it per frame), NONE = building/world constant. "Film path": Y = runs in a parity film,
N = Alt+S only (`!A._maxqActive`), F = film-only code.

| # | Step (§) | file:line | depends on | film path | what goes wrong in a film (source / record) |
|---|---|---|---|---|---|
| 1 | Parity switch, fill default | effects.js:3988-3993 | NONE | F | Fill default = RESTORE (0.785/1.257, :3992, :4321) — a sourceless fill that "WILL FLIP under §SOURCED_LIGHT principle 1" (record 243-244). |
| 2 | §DLOD_STILL_OWNERSHIP pause | effects.js:3998-4002 | GEO | Y (bake disengages DLOD itself, cinema_maxq.js:2451) | Every instance drawn and cast into the 8192 map every frame; §STILL_CULL culled 0 of 25,040/35,510 — "not reducible this way" (record 371-373). Cost, not a look defect. |
| 3 | §PHOTO_PAINT_SEED, puddles | effects.js:4009-4014 | NONE | Y | Film freezes `Math.random` to an LCG seed 987654321 (cinema_maxq.js:700-706); Alt+S rolls the real `Math.random` (:4009) → "skyline towers differ (films seed Math.random)" (record 506). Determinism is right; parity with a given still is not. |
| 4 | Ground texture/albedo/colour | effects.js:4018-4045, :4361-4365 | NONE | Y | OPEN: "film ground reads warmer/darker than Alt+S at the same pose/sun (cause not found; all 85 ground uniforms equal)" (record 244-245, 507-509). |
| 5 | HDRI env map | effects.js:4067-4073 | NONE | Y | none read. |
| 6 | Sun left as-is (dusk mood off) | effects.js:4075-4101 | SUN | Y; film: `_sunArcStep` per frame (:2719-2741) | Per frame `updateSky` + `shadowMap.needsUpdate` (:2724, :2734): the sun map re-renders every frame (correct, the sun moves; cost not measured for 8192 in a film). §SUN_ONE real sun when the compass is on (:2712-2731). |
| 7 | Material env boost | effects.js:4131-4133, :3130-3135 | NONE | Y | `m.needsUpdate = true` on first boost (:3134): one recompile per material, once. Fine. |
| 8 | `_enablePhotoShadows` (map size, near/far, bias, radius) | effects.js:3311-3520 | SUN, GEO (bbox) | Y (once per film, staging kept) | near/far = sunDist×0.05..×4 = 19,748 m (:3441-3442; record 103, 3237-3239). Radius 1.5 only for Alt+S, films keep 1 (:3489). The frozen bias "sized for the worst angle the film reaches" (:3471-3473) is the base-gap history (§129.45, :3495-3508). |
| 9 | §STILL_SHADOW_EDGE depth fit + (R+1.5)-texel normalBias | effects.js:3248-3273 | SUN, GEO, CAM (box) | N — `edgeLine` only when `!film` (:3221) | Films keep the 19,748 m range and `normalBias = 2×texel` (:3220). Alt+S gets range/65536 + (R+1.5)×texel (:3265-3266). Not carried. |
| 10 | §STILL_SHADOW_FIT / §FILM_FIT_PER_SHOT | effects.js:3158-3233, :3274-3289; cinema_maxq.js:3504-3520 | CAM, SUN, camInside (:3169) | Y, per frame (:4455) | Box fixed per shot, centre texel-snapped (:3198-3205); grow-only 32 m steps when no shots (:3206-3217). Film texel 0.06-0.07 m vs Alt+S ~0.02 m "by design" (record 521). Before per-shot: "changed size 16x in a 120-frame clip — the texel changes each time and edges would crawl" (:3207-3209). A shot that outgrows its box grows once (:3200, counted). |
| 11 | §STILL_DIALS lamps / §SOURCED_LIGHT_CALIB | effects.js:4152-4176 | SUN intensity (:4162) | Y | `_calibOn` keys on `SourcedLight.installed()` (:4167), which is set at page load (scene.js:46) — a parity film gets the PHYSICAL lamp multiplier (:4169) while zone binding, indoor hemi=0 and the meter (rows 13, 27) do NOT run in films. Read from source, not measured: parity films after 3395ae42 would have physical-scale lamps under the full restore fill. Same for portals: `PORTAL_EXPOSURE` 1 vs 10 keys on the same test (sky_portal.js:141). |
| 12 | §LIGHT_UNIFORM_BUDGET / §LIGHT_TEXTURE_BUDGET | sky_portal.js:81-107 (called :4179) | NONE | Y | One light count per still/film (pool capped :2144). A count change "recompiles ~110 materials, 40-108 s" (record 434, 773). OK as is. |
| 13 | §SOURCED_LIGHT prepare/stage (zones, lamp+portal binding, glass out of the shadow pass, §METER) | effects.js:4180, :4314; sourced_light.js:244-314 | GEO (zones cached per building, light_zones.js:51), CAM (12×7 ray grid :252-258, camZone, meter) | N | Films have NO zone binding: lamps light through walls/slabs (BEFORE stack 54-87% leaked, record 648-651). No glass depth discard in films (sourced_light.js:203-213 is called from stage). `prepare` costs 2.3 s/press (record 91) — a per-frame call is out. |
| 14 | §LAMP_SHAPE_COLOUR | effects.js:4182-4188 | NONE | Y | none. |
| 15 | Lamps born: `toggleNightMode` → `_nightUpdateLights` (bake pool) | effects.js:4191-4215; tools.js:1912-2221 | CAM (frustum pick :1955-1962, cap :1980-2019), GEO (build-up gate :1934), NONE (pool count :2143-2153) | Y | `needed` is rebuilt every frame from the frustum; slots are stable per fixture (:2181-2207) but a fixture entering/leaving the cap steps 0↔full (§LAMP_CAP_CHURN :2208-2218 measures it; §LAMP_CAP_FADE only when the nearest cap is on, :1328, default OFF record 531). `_nightUpdateLights` runs 3× per frame: the per-frame teardown with the NAV budget :5172, the restart with the still budget :5915, the pin :2802 (the full teardown :4551 runs once at film end) — "935 disagreements" between the torn-down and restarted sets (tools.js:1707-1712). §NIGHT_BAKE_POOL_REATTACH (:2155-2162) was the "films bake with NO interior lamps" defect on main (record 490-495). |
| 16 | §STILL_GLOW daylight / camera-inside | effects.js:4225-4253; per frame :4440-4453; inside test :3939-3964 | SUN (elev > 6°, :2660), CAM (rooms index or up-ray) | Y, per frame | A one-frame step: `day` and `inside` are booleans; glow and lamps go 0↔full the frame they flip (:4450-4451, :4446). Up-ray "an overhang can fool it" (:3964); Hospital's room index holds 2 rects (:3951-3953). |
| 17 | §STILL_BASE sky/base | effects.js:4260-4273 | NONE | Y (then overridden by row 19 unless `--film-fill alts`) | Pinned per frame by `_bakeFillPin` (:2780-2821) from `A._photoFillBase` (:4328). Under §SOURCED_LIGHT the hemi is only meaningful outdoors. |
| 18 | §ALBEDO_SRGB / `&stillexp` | effects.js:4285-4310 | NONE | N | Off by default; stays off (record 446). |
| 19 | §FILM_FILL_RESTORE | effects.js:4321-4327 | NONE | F | ambient 0.785 / hemi 1.257 everywhere, indoors too — the sourceless fill red1's principle 1 removes. |
| 20 | §SUN_ARC_FILL_BASE + `_bakeFillPin` | effects.js:4328-4331, :2780-2821; cinema_maxq.js:4037 | NONE (pins staged values), film time (topout ease :2774-2778) | F | `plScale` eases 0.5→1.0 after topout × lampMul (record G1b, 454-457): lamp output doubles at dusk by design. |
| 21 | §CAM_LIGHT (eye-riding PointLight) | effects.js:4366-4379 | CAM | Y — and stays ON: `_camSourcedOff` is `!A._maxqActive && …` (:4376) | Intensity 3, reach 4 m (:381). Not a real source (record: "at 2 m it gave ~0.75 of the 0.73 metered incident light", :4375). Films keep it. |
| 22 | §MIRROR_ROOM_PROBE cube | effects.js:4396, :3904-3926 | GEO (rendered at staging) | Y, once per film | The probe holds the building as it stood at staging (finished) for the whole film. Not measured. |
| 23 | §SKY_PORTAL stage + film `frame()` | effects.js:4312; sky_portal.js:109-204, :208-228 | CAM (≤40 m, nearest :122-124), GEO (`collectPanes` reads VISIBLE meshes :36), hemi at stage time (:137, frozen in the film cache :177) | Y, per frame | Per-frame re-rank re-aims a slot from one pane to another in ONE frame (:216-222) and re-renders its shadow map (:224). Pane set is frozen at staging (finished building). Intensity uses the staging hemi `H` (:221), not the frame's — harmless while the pin holds the hemi constant, wrong once the hemi becomes zone-dependent. §SKY_PORTAL_INSIDE 0.3 m (:14) fixed the white discs. |
| 24 | §GLASS_FRESNEL clones | effects.js:4313; glass_fresnel.js:42-73 | NONE (one clone per material, kept :23) | Y | Clone programs compile on first use; then constant. |
| 25 | §STILL_POSE line / PNG chunk | effects.js:4401-4409 | — | Y (`film: true`) | none. |
| 26 | §STILL_SHADOW_RENDERS counter | effects.js:4412-4428 | — | N (`_shCounting = !A._maxqActive`, :4422) | No per-film count of sun/portal shadow renders exists. |
| 27 | §METER (indoor exposure) | sourced_light.js:316-407 (from stage :306-309) | CAM (inside), scene light | N | Films: exposure fixed at 0.45 × 0.85 = 0.383 (scene.js:129; effects.js:2635, :4197). No per-frame metering today — good; but no per-shot value either. |
| 28 | Bounce: still 8-pass accumulation vs film 1 pass | gi_still.js:58, :693-711; GiFilm :885-972; hook cinema_maxq.js:1665 | CAM (screen-space) | Y | One pass per frame, no history (:887 "a film cannot accumulate over a moving camera"). §GI_FILM_BLANK_GRAB recovered 5-10/120 blank grabs (:895-911; record 516-517). Cost: build 8.0-8.5 s once; 53-61 ms/frame (HHS 720p); Terminal 1080p +0.13 s/frame (record 496, 503). Bounce dials read per frame (:923-928). |
| 29 | TAA/AO fold per frame | effects.js:4729-4733, :5953; cinema_maxq.js:2436-2446 | CAM | Y | Bake budget `MAXQ_STILL_BUDGET` (8/12, cinema_maxq.js:2438) vs Alt+S 16/24. Each film frame already is a "mini-still" fold. |
| 30 | Frame reuse | cinema_maxq.js:4540-4574 | hud alpha, load-path rev, camera, sun elevation, day text | F | Key had no film time and no Sanity state (§FRAME_REUSE_SANITY, record 510-512; #1767 live). No lamp/portal state in the key either (:4552-4557) — a light change with a still camera inside a hold would be reused. Not measured. |
| 31 | 4D build-up visibility | cinema_maxq.js:3694; time_machine.js:1419, :1673-1690 (visible), :1697/:1709 (castShadow false unless `_shadowOn`), :1896-1910 (promotion cap 500); effects.js:2970 `_reassertPhotoShadowCoverage` | GEO | F | The visible set changes every frame; zones (row 13), panes (row 23), mirror probe (row 22) are all derived from the FINISHED building at staging. Lamps and glow are gated by placement (`A._tmIsVisible`, tools.js:1934; effects.js:2560, :5422-5449) — a step, no fade. |
| 32 | §116/§129.41/§129.47 lights-off window | cinema_maxq.js:3804-3850; tools.js:2085-2088 | film time | F | Off from beats.out to beats.rise: Hospital 60.6 %, Terminal 74.5 % of the film (record 577-586) vs red1's rule (freeze, discipline reveal, full ARC hidden only). |
| 33 | §CPE_TAIL_LIGHTS_ALL_ONLY | cinema_maxq.js:3994; effects.js:5910 | film time | F | `_nightPLScale = 0` (a uniform). Fine. |
| 34 | §STOREY_CUT_LIGHT_GATE | tools.js:2089-2095 | film time | F | Lamps above the cut go to slot intensity 0. Count constant. Fine. |
| 35 | First-frame compile | — | — | F | "First frame 111 s with lamps (shader compile, once) vs 14 s" (record 504). Cost split 1080p Terminal: control 0.93 s; parity no lamps 1.05; +132 lamps 1.80; +bounce 1.93 s/frame; full film ~66 min vs ~32 (record 503-504). |

## 2. VERDICT on the hypothesis

**Confirmed, with one sharpening and one addition.**

Confirmed: Alt+S decides its light for one pose, once. The table shows three classes of decision:
(a) world/building state that is camera-independent (rows 5, 7, 12, 13-zones, 14, 22, 23-panes, 24);
(b) per-pose picks (rows 10, 13-prepare, 15-frustum pick, 16-inside, 21, 23-nearest, 27, 28); (c) sun-dependent
(rows 6, 8, 9, 11, 16-daylight). feat/film-parity moved (a) to once-per-film (pane cache sky_portal.js:165-179,
pool tools.js:2141-2153, pads :182-188) and re-runs (b)/(c) EVERY FRAME with the same pick functions
(`_filmParityStep` effects.js:4435-4463, `SkyPortal.frame` sky_portal.js:208-228, the frustum pick tools.js:1955).
A per-frame nearest pick is exactly a pop: rows 15, 16, 23 each step 0↔full in one frame; the record measured the
fit's own version of it ("16 size changes in 120 frames", effects.js:3207-3209) and the lamp cap's (§LAMP_CAP_CHURN).
The 4D build-up is the part the parity build did not touch at all: zones, panes and the probe come from the
finished building (row 31), lamps switch at placement with no fade (tools.js:1934; effects.js:5422-5449).

Sharpening: "no continuous scene state" is only half the reason the attempts stalled. The other half is that
the STILL kept moving under the film branch. §SOURCED_LIGHT (zones, binding, glass discard, meter), §STILL_SHADOW_EDGE
(depth fit, (R+1.5) texels, near cascade) and everything queued after them are gated `!A._maxqActive` with no
`|| A._filmParity` (effects.js:4180, :4314, :3221, :3489, :4376, :4422). So each Alt+S fix widened the gap it was meant
to close. Worse, two of them leak half-way into films by accident: the lamp calibration (:4167) and the portal exposure
(sky_portal.js:141) key on `SourcedLight.installed()` (true at load, scene.js:46), not on `stage()` — a parity film on
this tree gets physical-scale lamps and portals (100-700× weaker than the old 16, record 653) under the full restore
fill and with no zone binding. Read from source, not measured; it must be checked (§FILM_PARITY_FRAME + §SOURCED_LIGHT_CALIB
lines from one 5 s clip) before any further parity clip is judged.

Addition: the record's other blockers, none of them "moving target":
- Films baked with no interior lamps at all (§NIGHT_BAKE_POOL_REATTACH, tools.js:2155-2162; record 490-495) — fixed on the branch.
- Blank app-canvas grabs at capture, 5-10/120 (§GI_FILM_BLANK_GRAB; record 516-517) — guarded, cause not found.
- Frame reuse inside a load-path hold froze a live Sanity wave (§FRAME_REUSE_SANITY, record 510-512) — fixed (#1767); the key still carries no light state (row 30).
- Film ground warmer/darker than Alt+S, cause not found after excluding uniforms, textures, composer, camera, seed, encode, bounce (record 507-509).
- Cost: parity ≈ 2× control per frame; first frame 111 s; Hospital full-film projection not measured (record 469-470, 503-504).
- Lights-off window covers 60-75 % of the film vs red1's three cases (row 32).
- The eye light stays on in films (row 21) — a sourceless source.
- Fill default RESTORE (row 19) flips under principle 1; the decision is red1's (record 531-535).

## 3. FOUNDATION — the minimum camera-independent, frame-stable set

Prior art (record §ALTC_FOUNDATION, lines 548-573) is the frame: bind light to the WORLD (clusters/zones, probes,
stable cascades) and render each film frame like a still (sub-samples, warm-up). Each piece below names its technique.
"ours" marks what none of the cited work covers. Costs are from the record or "not measured". Every witness is
maths on the zone grid / plan in node, or one logged § line per frame checked by a script — no ray grids, no pixels.

### F0. Gate hygiene (prerequisite, one edit class) — ours (a housekeeping rule, not a technique)
Rule: an Alt+S lighting step is either `!A._maxqActive` (still only, and then it must not leak) or
`(!A._maxqActive || A._filmParity)` (carried). Every `installed()` test that decides a LOOK value (effects.js:4167,
sky_portal.js:141) becomes a `SourcedLight.isActive()` test (sourced_light.js:421) so lamps/portals go physical only
where the zones and the meter also run. Until F1 carries the zones into films, films keep the 16 multiplier and
exposure 10 — the eb3a41c1 look the clips were judged on.
Witness: `witness_film_gates.js` (node, static): greps effects.js/sky_portal.js/sourced_light.js for `_maxqActive`
and `installed()` and prints each site as STILL_ONLY / CARRIED / LEAK; LEAK count target 0; a new site with no class
fails. Seconds. Plus one clip line: `§SOURCED_LIGHT_CALIB … applied=16.0000` on a control clip.

### F1. Light set as WORLD data — clustered forward shading (Olsson, Billeter, Assarsson, HPG 2012), our cluster = the light zone
Mechanism:
- Zones are built once per film from the FINISHED building (light_zones.js `build`, cached per building :51; the
  §ZONE_OPEN_SKY rule and `zoneInfo` apertures when that lands, record 137-157). Zone id per fragment is already a
  3D texture fetch in the shader (sourced_light.js:44-71); per light a zone id uniform (:180-187). This IS the
  clustered-shading loop: the program never changes with the light count; the light LIST is data (PZ/SZ arrays).
  three.js's ClusteredLighting is WebGPU-only, point lights only, no shadows (record 558-559) — we keep the WebGL
  path and the principle.
- One LIGHT TABLE per film, built at film start, camera-independent: every fixture (position, colour, shape,
  `__guid`, zone via `atLamp`, placement ts from `tmGuidEndTs`, effects.js:5422-5433), every pane cell
  (`collectPanes` with the inward side classified once — the existing §SKY_PORTAL_FILM_CACHE, sky_portal.js:169-179 —
  its zone via the cell 0.3 m inward, its contributing guids + areas, record 617-627), every zone's aperture and
  daylight factor (§SOURCED_DAYLIGHT, record 674-692; a texture channel, no light objects). Logged once:
  `§FILM_LIGHT_TABLE bld= zones= lamps= panes= bound=/ unbound= skylights= ms=`.
- The light OBJECT pool stays fixed for the film: N_point = `_stillLampCap`, N_spot = `budgetCap` with the pads
  (tools.js:2141-2153; sky_portal.js:182-188) — already so. What changes: the per-frame ASSIGNMENT is zone-driven,
  not frustum-driven. Active zones per frame = zones whose cell bbox is within D of the camera (a bbox test over a
  few hundred zones, sub-ms) plus the camera's own zone (`LightZones.at(camera)`, no rays; the 12×7 ray grid of
  `prepare` :252-258 is dropped for films). Zone weight w_z(t) has HYSTERESIS and a FADE: enter at d < D_in, leave at
  d > D_out (D_out > D_in), and w ramps over F frames (F = 12 at 24 fps = 0.5 s; a choice to log, not a tuned number).
  A lamp's intensity = base × w_zone × placementFade (F5) × the existing multipliers (tools.js:2202). A pane keeps its
  spot slot until its zone leaves; free slots take new panes at w = 0 and ramp. Nothing ever steps 0↔full.
- "Nearest 40 m" (sky_portal.js:8, :122) and the list-order/nearest cap (tools.js:1980-2010) are replaced by the zone
  rank already written for Alt+S (§LAMP_CAP_ZONE tools.js:1987-1999: camera zone, then visible zones, then nearest) —
  with "visible zones" = active zones by distance, since a per-frame ray grid is out.
Cost: table once (zones: `§LIGHT_ZONE … ms=` per building, not quoted here; pane cache 843-989 ms once, record 496);
per frame: a zone bbox loop + ≤200 lamp writes + ≤32 spot writes = uniform uploads, JS sub-ms (not measured; the
witness logs it).
Witness (node, seconds, no browser): `witness_film_light_table.js` takes the persisted zone grid (Uint16 + org/dim
from `LightZones.get()`, dumped once by an existing Alt+S run) and the plan's poses (the same `poseAtFilm` samples
`_filmFitPrecompute` uses, cinema_maxq.js:3513-3518) at K samples per shot and computes the assignment offline:
asserts (1) point/spot COUNT identical at every sample (= the pool), (2) max |Δw| per frame ≤ 1/F, (3) crossWall = 0
(a lamp whose zone ≠ a sampled surface's zone contributes 0 — `witness_sourced_crosswall.js` already prints
`crossWall=N`), (4) zone churn: enters/leaves per shot, printed. Per bake frame one line:
`§FILM_LIGHTS f= points=lit/N spots=lit/M activeZones= entered= left= maxStep= programs=`, where `programs` =
`renderer.info.programs.length`; a script asserts `programs` constant after frame 0 and `maxStep ≤ 1/F`.

### F2. Shadows — stable cascaded shadow maps (Valient, ShaderX6 2008) + PSSM splits (Zhang et al. 2006), sharing the still's §STILL_SHADOW_EDGE fit
Mechanism:
- Per SHOT (plan.beats intervals, cinema_maxq.js:3504-3520): the far box size is fixed (§FILM_FIT_PER_SHOT,
  effects.js:3278-3289 — Valient's fixed projection size) and the centre snaps to whole texels per frame (:3203) —
  already built. Add: the DEPTH range per shot = the union over the shot's samples of `_stillEdgeDepth`'s extent
  (effects.js:3248-3263) + pad, so bias = range/65536 and normalBias = (R+1.5)×texel hold in films exactly as in the
  still (:3265-3266). Today the film branch skips this (`!film`, :3221) and uses 2×texel (:3220).
- Because the sun MOVES, the light basis turns each frame; the snap is done in the frame's basis (record G2, 462).
  Valient's sphere-fit (a bounding sphere so rotation does not change the extent) is the right form for a moving
  light: per shot, fit a SPHERE to the union of the sampled view slices, size the ortho box to its diameter; the box
  then never changes with the sun's rotation inside the shot. Log `§FILM_FIT_SHOT sphereR= box= texel=`.
- Near cascade: the still's §STILL_SHADOW_EDGE item 3 (record 117-126): a second shadow-only DirectionalLight
  (colour 0), slice [near, S=35 m], mix by `smoothstep(S-3, S, depth)`; ONE extra light for the whole film (count
  constant, F1), its box sized per shot by the same sphere rule, centre snapped per frame. PSSM gives the split
  rule if a third cascade is ever wanted; two is the spec.
- Both maps re-render every frame (the sun moves): unavoidable. Portal shadow maps: only on re-aim (sky_portal.js:224);
  with F1 a re-aim happens only when a slot changes pane, i.e. rarely.
- §PORTAL_SHADOW_BIAS (record 223-231): per portal `d_ref` = its distance to the camera → in a film d_ref changes per
  frame; take d_ref per SHOT (min distance over the shot's samples, the tightest texel) so the bias does not breathe.
Cost: sun map per frame not measured in films (the still's refine incl. 16 TAA frames is 4.5-6.4 s, record 373);
the witness times both shadow passes with `gl.finish` per frame as `witness_still_shadow_edge.js` does.
Witness (logged maths): per frame `§FILM_SHADOW f= shot= texelFar= texelNear= centreDeltaTexels=(dx,dy) range=
normalBias= bias= predictedBaseGap45= shadowMs=`. A script asserts: texel constant within a shot (0 changes), centre
deltas are integers in the light basis (|dx − round(dx)| < 1e-6), predictedBaseGap45 < 0.05 m in the near cascade,
range < 2 × (building diagonal + kept props). No ray grid; the ray-vs-lookup grid stays an Alt+S instrument.

### F3. Exposure — fixed per film, or the still's meter frozen per shot; never per frame (red1 rule 5; engines adapt in f-stops/s — Unreal auto-exposure — which is rejected here)
Mechanism: exposure = 0.383 for the whole film (today's state, row 27), OR, once §METER is accepted for Alt+S, the
SAME meter run ONCE per shot at the shot's first frame with the shot's mid-point sun (one 160×90 float render,
sourced_light.js:328-363; ms logged in §METER) and held for the shot. A cut is a cut: the value may change only at a
shot boundary. Within a shot the camera moves and the exposure does not — a real film. No dial, no curve.
Cost: 0 per frame; one meter render per shot.
Witness: `§FILM_EXPOSURE f= shot= exposure= stops= source=fixed|meter` per frame; a script asserts 0 changes inside
any shot and lists the values at boundaries. Seconds.
**red1 ruling (2026-09-25): camera-dependent light is ACCEPTABLE in a film if it flows — "consistency in frame to frame
changes".** So the film criterion is CONTINUITY, not camera-independence: every light term per fixed surface point
(§CAMDEP_SURFACE sample sets) may change with the camera, but by at most a stated per-frame step (fades over F frames,
F1 hysteresis; exposure per F3). Witness: max per-frame change per term per point <= 1/F of its range; 0 one-frame jumps.
red1 added: "as in cinematic film, lighting changes to give a balance to the scene to scene movement" = per-SHOT balance
is intended (a cinematographer rebalances each setup): the meter (red1's chosen mode) sets each shot's balance, changes
land at cuts or as smooth ramps inside a shot, never as jumps. Automatic from cited metering; still no hand dial (rule 5).
**Crossing-shot test path (red1 2026-09-25, both poses approved):** outside looking in (…1790319885328, cam
[-5.529,-0.544,-42.321]) -> entering the café (…1790320117679, cam [-7.990,-7.785,-24.269]), same target [4.014,-6.761,2.325].
red1: "will it evolve smoothly frame to frame". Witness on that path (e.g. 120 frames): per-frame §FILM_EXPOSURE + the
§CAMDEP_SURFACE terms at fixed points; PASS = no one-frame jump, exposure ramp within the cited rate, lamps/portals fading.
Today it would FAIL: films hold 0.383 (outdoor) so the café stays at the outside look; per-frame picks jump.
For stills §CAMDEP_SURFACE stays a REPORT (which terms depend on the camera), not a FAIL.

**Watchdog add (2026-09-25, red1: "during alt-c lighting may fluctuate while in scene"):** confirmed risk: today's
Alt+S meter swings 1.16 stops between two poses in the SAME zone (§STILL_CAMDEP: café corner 18.2 vs stair 8.2, same
lamps), so a per-frame meter would pulse. Rule stands: never per frame. One case per-shot freezing does not cover: a
CONTINUOUS shot that crosses outside<->inside (flythrough through a door): frozen = indoor near-black or outdoor blown.
For those shots only (detected from the plan: camera zone changes 0 <-> indoor inside one shot), a time-limited ramp
between the two frozen meter values, rate quoted from a cited source (engine eye-adaptation speed in f-stops/s from its
docs, or a published human adaptation figure), logged `§FILM_EXPOSURE ... source=ramp`. Witness: max |d stops/d frame|
<= the cited rate / fps, 0 changes inside non-crossing shots. Metering MODE is whatever red1 picks for Alt+S (§METER_HIST A/B).

### F4. Bounce — MRQ sub-samples per frame now (Unreal Movie Render Queue: spatial sub-samples, warm-up); DDGI probes (Majercik et al., JCGT 2019) as the next step, not this one
What the film has: one SSGI pass per frame (gi_still.js:887, :931), no temporal history. So there is nothing to
warm up and nothing to reproject; the flicker source is per-frame noise (the still averages 8 passes, :58, :700-710).
Recommendation: (a) N spatial sub-passes per frame, averaged — the still's own loop with `opts.passes` (:693), run
inside `filmFrame` (:931-932 becomes a loop over `renderGeom`/`readRT` with an accumulator, as :700-710). Reasons:
it is the still's exact bounce (parity = the same composite), it is camera-independent in the sense that matters
(no history to break at a cut), and its cost is known: 53-61 ms per pass (HHS 720p, record 496); Terminal 1080p
+0.13 s per pass (record 503) → N = 4 ≈ +0.5 s/frame at 1080p (arithmetic from the record; not measured as a run).
N is a bake flag (`--bounce-passes N`, default to be set from the clip cost line, not guessed here).
Why not temporal reprojection (SSGINode has a temporal filter, lib/gi/SSGINode.appbound.js:183-185): it "introduces
typical TAA artifacts like ghosting" (its own comment) and needs warm-up frames at every cut (MRQ: 32+ frames,
record 552) — cost and a new artefact class.
Why not DDGI now: no three.js core support (record 566-567); a probe volume with per-probe visibility is a new
render path; and the baseline red1 approved IS the SSGI composite. DDGI is the right answer to the one thing
sub-samples cannot fix — light from surfaces that left the frame — and our zones are its natural probe layout
(one probe set per zone; DDGI's visibility term is its leak fix, record 567-568). Queue as F4b after F1-F3.
Witness (logged renderer state, not a picture): per frame `§GI_FILM f= passes=N ms= passVar=` where passVar = mean
absolute difference between pass 1 and the N-average over the float buffer `readRT` already returns (:705) — the
noise the average removes, in the renderer's own numbers; a script asserts passVar(N) < passVar(1) and prints
ms/frame and the projected full-film time (frames × ms + build) BEFORE any full bake (record G4 rule, 469-470).
Determinism of the seed is F7.

### F5. 4D build-up — ours (none of the cited work has geometry appearing over time)
Rules, each deterministic, none tuned:
- Zones come from the FINISHED building, once per film (F1). Rebuilding the voxel grid per frame is out
  (Hospital ≈ 3.2 M cells, record 661; `§LIGHT_ZONE … ms=` per build).
- A zone is ENCLOSED only to the extent its boundary is built: at zone build, record per zone the guids that
  rasterised its boundary faces (`boundaryDraws` already carries guids per draw, light_zones.js:22-46; add a per-face
  owner, cost one Uint32 per boundary face — not per cell; count logged). enclosedFrac_z(t) = placed boundary faces /
  all boundary faces, from `tmGuidEndTs`. Indoor sky keep for zone z = `uSLParams.z` + (1 − enclosedFrac_z(t)) × (1 −
  `uSLParams.z`): an unbuilt room is outdoors, a built one is indoors, in between it fades. One float per zone in a
  texture channel, uploaded per frame (a Uint16 per zone, hundreds of bytes).
- A lamp switches on at its own placement ts (`__guid` → `tmGuidEndTs`, the gate tools.js:1934 already uses) with a
  ramp of F frames (F1's F), not a step. Synthetic fixtures (no guid) follow their zone's enclosedFrac.
- A pane cell switches on by the placed AREA fraction of its contributing guids (its intensity × fraction), so a
  facade lights up bay by bay as it is glazed, never all at once.
- The daylight factor per zone (§SOURCED_DAYLIGHT) is × the pane's placed fraction the same way (Ag_z(t)).
- Shadow casters: `_reassertPhotoShadowCoverage` (effects.js:2970) already forces castShadow on visible meshes each
  frame; time_machine's own castShadow=false for placed meshes (time_machine.js:1709) is overridden by it. Nothing new.
Witness (node, seconds): `witness_film_buildup_lights.js` reads the light table + `tmGuidEndTs` dump and asserts
(1) enclosedFrac_z(t) is monotone non-decreasing for every zone, (2) lamps whose on-time precedes their zone's first
boundary placement = 0 (excluding synthetic), (3) per shot, the count of light on/off events and the max per-frame
step (≤ 1/F). One bake line per frame: `§FILM_BUILDUP f= cursorMs= zonesEnclosed=n/N lampsOn=n/N panesOnArea=%`.

### F6. Moving sun — per-frame uniforms only (already the case; the derived state must also be continuous) — ours in the small
- The sun is a pure function of film time (`_sunElevationAt` effects.js:2680-2681, or the compass :2712-2718), set per
  frame with `updateSky` + `shadowMap.needsUpdate` (:2724/:2734). Keep.
- Daylight glow: replace the 6° step (`day = el > PHOTO_SUN_ELEVATION`, :4443, :4450) with a ramp over
  [6°, 6°+2°] on the emissive uniform (no `needsUpdate`, as :4451 already does). The lamps-outside flag (:4446) rides
  on `inside`, which becomes a zone test (F1: `LightZones.at(camera)`) with the same hysteresis, not the up-ray.
- Sun through glass: the glass depth discard (sourced_light.js:203-213) is a material swap — once per film, not per frame.
- Depth range per shot (F2) covers the sun's motion; the still's per-press fit is the same code.
Witness: per frame `§FILM_SUN f= elev= az= glowEI= lampsOutside=`; a script asserts |ΔglowEI| ≤ glowEI/F per
frame and that elevation is monotone (arc) or matches the compass table.

### F7. Determinism — seeded randomness (standard practice; MRQ renders are deterministic per frame index)
- Keep the LCG (cinema_maxq.js:700-706). Add: re-seed from (film index, frame index) at the top of each frame, so a
  re-bake of one clip reproduces the film's frames, not a run-dependent sequence.
- SSGI noise: `SSGINode` rotates temporally by `frame.frameId` (lib/gi/SSGINode.appbound.js:9, `_temporalRotations`);
  set the bounce renderer's frame id = frameIdx × N + pass so each frame's N passes and their noise are a function of
  the frame index alone. PCF taps rotate by `gl_FragCoord` (r186, record 101-103) — deterministic. TAA jitter index
  restarts per fold — deterministic.
- Alt+S parity with a given still: log the still's seed in `§STILL_POSE` (:4404-4408 carries the pose already; add
  `seed`), and let `--seed` on the CLI reproduce it.
Witness: bake the same 5 s clip twice; the bake already hashes frames (record 503 "frame-hash deltas");
`§FILM_HASH f= sha=` per frame, a script asserts all 120 pairs equal and names the first mismatch. Minutes for the
two clips, seconds for the check.

### F8. Shader programs compiled once per film — ours (a rule the record already states: constant light count, record 773)
- Sources of a recompile, all read in source: a light COUNT change (pool/pads hold it, F1), `mat.needsUpdate` (only
  the first env boost :3134, glass clones on first use, teardown restores :4476 — none per frame under parity
  :4451), `SourcedLight.push` re-pushing on a program-count change (:294-296 — a detector, not a cause).
- Rule: `renderer.info.programs.length` may change only at frame 0 (the 111 s first frame, record 504).
Witness: `programs=` in `§FILM_LIGHTS` (F1) per frame; assert constant from frame 1. Add
`§FILM_COMPILE firstFrameMs= programs=` once. The film's "warm-up" is frame 0's compile, paid once.

## 4. ORDER — what first, what in parallel, what waits

Now, in parallel with the Alt+S lanes (they touch `!A._maxqActive` code in `_stillFitApply`/`_stillEdgeDepth`,
light_zones.js `build`, sky_portal `collectPanes`/`stage`, sourced_light `stage`/`meter`; the items below touch
cinema_maxq.js, gi_still.js `GiFilm`, tools.js's bake-pool branch (:2141-2221), sky_portal.js `frame()`, and
`_filmParityStep` — film-gated code):
1. **F0 gate hygiene + the leak check** — one 5 s clip's `§SOURCED_LIGHT_CALIB`/`§FILM_PARITY_FRAME` lines decide
   whether parity clips on this tree are even the eb3a41c1 look. Half a day; blocks every later clip judgement.
2. **F8 + F7 instruments** — `programs=` per frame, `§FILM_HASH`, re-seed per frame, SSGI frame id. These are the
   rulers every other piece is measured with. Cheap.
3. **F4 sub-passes** — `GiFilm` only; the `--bounce-passes` flag; the cost line and projected film time.
4. **F1 assignment with hysteresis + F5 on-times** — the pool branch and `SkyPortal.frame()`; the light table can be
   built against the CURRENT LightZones API (`at`, `atLamp`, `get`) and re-pointed at `zoneInfo` when §ZONE_OPEN_SKY
   merges (it changes what "outside" means, not the API). The node witness runs on the dumped grid of either.
5. **F3 per-shot exposure** — additive; a `meter()` call per shot when §METER is accepted, else fixed 0.383.
6. **F6 glow ramp / zone inside test** — `_filmParityStep` only.

Must WAIT for the Alt+S fixes (same functions, would conflict):
- **F2 shadows** waits for §STILL_SHADOW_EDGE (depth fit + near cascade land in `_stillFitApply`/`_stillEdgeDepth`;
  the film then removes its `!film` gate at :3221 and its `2×texel` at :3220, and adds the per-shot sphere/depth
  union). Do not edit those functions while feat/still-shadow-edge is open.
- **F1's zone BINDING in films** (opening effects.js:4180/:4314 to `|| A._filmParity`, the glass discard, indoor
  hemi 0) waits for §ZONE_OPEN_SKY + §SOURCED_DAYLIGHT, because the film's "indoors = no sky" needs the open-sky
  rule and the daylight term or films go black indoors the way v1337 exteriors did (record 31-32, 139-143). Until
  then films keep the restore fill (red1's decision, record 531-535).
- The fill default flip (row 19) is red1's call after §SOURCED_LIGHT is judged on Alt+S.

Then: re-cut the parity clips (Terminal facade, Hospital interior, 5 s, 1080p24, control + parity), each with the
per-frame lines above and the cost projection, before any full film (record 476-482 rule).

## 5. Open questions (decisions, not unknowns to measure)
- F (fade frames) and D_in/D_out (zone activation distances): stated as 12 frames and "to log" — the first clip
  fixes them from its `§FILM_LIGHTS` churn line; not tuned per building (red1 rule).
- Whether the film's shadow radius follows the still's 1.5 (effects.js:3489 keeps 1 for films): with F2's
  per-shot texel it should be the same rule as the still; decide with F2.
- The eye light (row 21) in films: off under parity when F1 binds the zones (it is not a source); until then it is
  part of the eb3a41c1 look the clips were judged on.
