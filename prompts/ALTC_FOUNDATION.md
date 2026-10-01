# ⚠ DO NOT REMOVE — §ALTC_FOUNDATION spec: the lighting foundation Alt+C films need (2026-09-25)
# SCOPE: spec only, no code. What a film (Alt+C: cinema_maxq.js recorder loop + cli_silent_bake.js) must
#   have so that the finished Alt+S look can be carried into it frame by frame, whatever the current Alt+S
#   fixes (§STILL_SHADOW_EDGE, §ZONE_OPEN_SKY, §SOURCED_DAYLIGHT) turn out to be. Read the log after every
#   run: every claim below is a file:line or a record line, every witness is a § line or node maths — no
#   frame judging, no ray grids. Sources read: bim-ootb /tmp/wt-shadow-edge (feat/still-shadow-edge
#   @5c48105a, sw v1351) and bim-compiler prompts/PHOTOREAL_STILL_RENDER.md @7613fa219 ("the record").
#   "not measured" means exactly that. Honour this block until the lane is DONE.

**ARCHITECTURE RULE (red1 2026-09-25): "make Alt+S the source of truth in managing such lighting so that Alt+C merely
inherits."** Every lighting decision (lamp pick, sky field, sun fit, glass, meter, cove) lives in ONE Alt+S function of
(camera, sun, time, visible geometry) with no still-only state; Alt+C calls the same functions per frame and adds ONLY
continuity (fades/hysteresis on picks, per-shot exposure hold, stable shadow boxes). No new look logic behind
`!A._maxqActive`; a film-only branch may exist only for smoothing, named as such. Gate: every Alt+S look commit lists
the functions it adds/changes and confirms the film path calls them (or names the smoothing it still needs).

**SHOW-STOPPER REVIEW of the Alt+S-truth rule vs the bake loop: prompts/ALTC_SHOWSTOPPERS.md** (Opus agent, 2026-09-25,
read-only on /tmp/wt-daylight 5bae708a; watchdog spot-checked effects.js:4235 once-guard, cinema_maxq.js:3535, light_zones.js:129
cache key without time). Stoppers S1-S5: no per-frame function (build+decide fused), look gated `!A._maxqActive`, 4D build-up
vs a timeless zone cache, per-frame cascades unstable, zone lamp pick needs the 84-ray grid. All have remedies; none blocks the
rule. RULE ADDENDUM: every Alt+S lighting function is written as BUILD (per building, cached) + DECIDE (per camera/frame, ray-free,
ms-scale).

## ▶ §FROM THE STILLS SESSION 2026-10-01 — merge before the next bake (red1: "alt-c can proceed to bake after you")
fix/fast-bake lacks the commits of origin/fix/sky-surface after 22a8e253 (as of 2b91cc22 v1522: also §SKY_FIELD_FURNITURE (re-keys sidecars — Hospital NOT re-baked), §LAMP_CONTACT_SHADOW (Alt+S only), §LAMPS_RATED_DEFAULT (still data path only), &dusk=1; red1: dusk is an Alt+C matter) (6d725a81 added 05:5x: proxies by name RAL 7035 / luminaires RAL 9016 = all views; §GLASS_TONE_STILL = Alt+S only): 0bd4e6c8 + 1a9a7eea §MEP_SERVICE_COLOUR v1/v2 (MEP painted by service, BS 1710:
fire red pipe / orange-enamel fittings / brass sprinkler heads, water green, drainage black, ducts galvanised — replaces the HUD
DISC_COLORS palette; applies at material creation = canvas, stills AND films; &mephue=disc = old) and 81a1b359 §LAMP_SHADOW_TOPK
(still-only data path, default off — no film effect). No light_zones.js change -> sidecar key unchanged, no re-bake. In /tmp/wt-fastbake:
`git fetch origin && git merge origin/fix/sky-surface`; sw.js conflict -> keep BOTH precache additions, take the HIGHER CACHE_VERSION.
Witness: viewer/tests/witness_mep_service_colour.js (headless, no GPU) PASS 7/7 on sky-surface.

## ▶ §RESUME 2026-10-01 08:30 (Opus, Alt+C session) — READ FIRST next session
STATE: bim-ootb fix/fast-bake sw v1533 (pushed, no PR, not merged/OCI) = fix/sky-surface (Alt+S v1516-1525, merged) + tonight's Alt+C
work: §FAST_BAKE FB1/FB2, §FILM_INHERIT (gate, lamp data, per-shot shadow edge, window pull, glass env/mirrors), §PREBAKE PB1/PB2,
§LOADPATH_STACK_ONLY (freeze 13 s -> 0.45 s/frame), §LOADPATH_CLIP_CLOCK/_CLIP_SKIP, §132 twins (none found: signature too strict),
§FILM_CAM_LIGHT (eye light back), ADAPT up 6 / down 4, §INTERIOR_LIGHTS_ARC (lamps off only with no ARC). Worktree /tmp/wt-fastbake.
Bake tool: scripts/bake_hires_offline.sh with BAKE_W/H/FPS/TAG/EXTRA (e.g. --frame-range 1065:1365 --no-load-path --write-prebake).
Deliverables (~/Downloads): Hospital_silent_ARCfull_long_AFTER_..._0655.mp4 (red1: "looks all good"), ..._ARCfull_lamps_AFTER_..._0733.mp4.
OPEN, in order:
1. BOUNCE SPLIT (0733 clip): bottom 43% frozen from frame 1. PROVEN the bounce engine: same 30 frames with &filmbounce=0 -> bottom changes
   every frame (11.5 luma/frame, 0 frozen; session scratchpad split/nobounce.log). That bake's GI orientation check FAILED both ways
   (§GI_STILL_ORIENT_GEOM backfacing asRead=79.88% reversed=77.84%, §GI_ROW_PROBE top=0 bottom=0); the good 0655 clip read asRead=0.04%.
   Only code change between them: v1532 lamps ON from frame 0. Next: read gi_still.js engine start (material copy) vs lamp data / glow.
2. LIGHT FIELDS STALE: the merge's §SKY_FIELD_FURNITURE edits light_zones.js -> rebake Hospital_silent (+HospitalAjaibPath) sidecars
   (scratchpad bake_file.js; ~40 min each, GPU) before judging films; otherwise in-bake rebuild (lower quality, +3 min).
3. LAMP DATA REBUILDS ~every frame (283 x ~220 ms + cove/IR): films feed the frustum-picked `needed`; feed all placed fixtures (as Alt+S)
   -> expect p50 3.3 -> ~2.6 s/frame. §INTERIOR_LIGHTS_WITNESS counts only the pool (FAIL poolLit=0/122 while 122 data lamps lit).
4. Torch vs eye light: both on; red1 "Keep if the impact is better" — unjudged. Twins: relax the signature (class sequence) if wanted.
5. N1 exterior shadow base gap at the wing: re-judge on a v1530+ whole-building clip (§FILM_SHADOW_EDGE range 917 m, nb 0.22 m).
6. §FILM_INHERIT ON only on whole-building frames; the per-zone switch (F5) for build-up is not built.

## ▶ §STILL→FILM INHERITANCE 2026-09-30 (Opus, end of the still-lighting session) — READ FIRST for the Alt+C bake session
State: bim-ootb **fix/sky-surface @22a8e253, sw v1515** (pushed; NOT merged to main / look / OCI). Served locally :8664 from /tmp/wt-surf.
Baked sidecars (gitignored, local only): /tmp/wt-surf/buildings/patches/{Clinic,Hospital,Terminal}_meta.db.lightfield.bin +
HHS_Office_Federated_extracted.db.lightfield.bin, key 21324567:90186 (light_zones.js v1511 code hash). Any light_zones.js code edit re-keys
ALL four (Hospital bake = 48 min). Full still record: PHOTOREAL_STILL_RENDER.md top blocks (§DEV RESUME 2026-09-30 NIGHT).
Which of the day's Alt+S fixes a FILM (A._maxqActive, cinema_maxq.js) inherits today — code-read, file:line on the branch:
| fix (sw) | function / where | film gate | film inherits? |
| §SKY_FIELD_EXACT_OPEN v1506, §SKY_FIELD_SMOOTH v1507, §SKY_FIELD_OPEN_ROOF v1511 | light_zones.js field() -> SourcedLight.stage | effects.js:4624 `!A._maxqActive && SourcedLight.stage` | NO — films never stage sourced light (showstopper S2). They reach films only when F1 (light set as world data) lands. The baked sidecars are camera-independent = F1-ready. |
| §GI_REDIST_DEFAULT_OFF v1509 | gi_still.js:841 redistU default 0 | Alt+S bounce only | films use the GI composer path (effects_gi_poc.js:133/497 A._giComposerActive) — NOT measured whether it reads redistU |
| §MIRROR_OWN_MAT + §MIRROR_PARALLAX v1508-09 | effects.js _mirrorOwnApply (staging) + glass_fresnel.js capture | v1515: `if (A._maxqActive) skipped` | NO by design: films skip the §GLASS_ENV capture (effects.js ~6000 `!A._maxqActive`), so a film mirror would show the sky HDRI indoors. Film mirrors = plain MEP material (not mirror-finished). NEEDS: a per-shot room capture (F-list item) |
| §BEAM_UNDER_SLAB v1510 | streaming.js _getMaterial polygonOffset on IfcBeam | none (material-level) | YES — every render mode |
| §WINDOW_PULL v1512 | gi_still.js windowPull after the still composite | Alt+S overlay only | NO — films need their own per-frame version (depth/zone mask is ~0.9 s/frame at 1440p; exposure EV15 from LightLaw) or a per-shot one |
| §CSM_READBACK_GLASS v1507c4 (merged v1513) | effects.js _csmReadback | _cascadeFit(film) returns null (effects.js:3353) | NO — films keep §STILL_SHADOW_FIT (F2 not built); the glass-capped readback bug class applies to F2 when built |
| §STILL_RES_DEFAULT_1440 v1514 | effects.js _stillResApply | `if (A._maxqActive) return` | NO — films keep their own size; 4k FAILS the bounce on the 8 GB card (358,369 WebGPU errors) — relevant if films ever run the bounce at 4k |
| IFC-AS-MODELLED ruling (red1) | — | — | applies to films too: authored-model defects are not compensated |
**Alt+S STANDARD (red1 2026-09-30 "wrap this hi res as std in alt-s"): stills are 1440p by default (v1514 §STILL_RES_DEFAULT_1440,
2776x1440; red1's v1515 Hospital stills confirmed 2776x1440); &stillres=window = the quick size; 4k is NOT offered (bounce FAILS on the
8 GB card). Films keep their own size (_stillResApply returns under A._maxqActive).**
**HOW MUCH OF Alt+S A FILM GAINS TODAY: one fix (§BEAM_UNDER_SLAB). Everything sky/ground/lamp-field sits behind showstopper S2
(effects.js:4624, films never stage SourcedLight) — the baked sidecars are camera-independent (F1-ready), so lifting S2 is the lever that
carries the whole day's field work into films at once.**
**FIRST STEP NEXT SESSION — a few-seconds POC bake (measure before building):** from /tmp/wt-surf (so the film loads v1515 + the local
sidecars): `cd /tmp/wt-surf && flock /tmp/claude-1000/gpu.lock node cli_silent_bake.js --db Hospital --seconds 3 --gpu real
--out <scratch>/poc_hosp.mp4 --log <scratch>/poc_hosp.log` (usage: cli_silent_bake.js:1-70; path source = the DB cinema_path table —
check the building has one, else --plan/--override). Read the log: §CLI_BAKE_PROGRESS ms/frame, §SOURCED_LIGHT (expect NOT staged = S2),
§LIGHT_FIELD_DB (does the film even load the sidecar), §MIRROR_OWN_MAT skipped, 'Uncaptured WebGPU' = 0. Then an arm with S2 lifted
(film stages SourcedLight once per shot) to see what the field adds per frame and at what cost.
**§POC_BAKE RESULT 2026-09-30 21:10 (Opus, log = session scratchpad poc_hosp.log, NOT committed):** `/tmp/wt-surf` v1515,
`--db HospitalAjaibPath --seconds 3 --gpu real` (RTX 4060 8 GB; another session's witness_s9 ran on the GPU during it). Aborted at the 12-min
`--timeout-min` cap, but the file was delivered (§MAXQ_DONE frames=30 bytes=654999; §MAXQ_QUALITY unconverged=0; 'Uncaptured WebGPU'=0; no pageerror).
- Setup ~6.5 min before frame 1: load 45 s, two Alt+S-style stagings (57 s, 252 s), §GI_STILL copy to the bounce engine 70 s (§GI_FILM built 1280x720 ms=70298).
- §CLI_BAKE_FRAMES poses=30 p50=5.2 s/frame, worst 360 s (= frame 1, carries the setup). Steady rate 4.5-5.6 s/frame.
- S2 CONFIRMED: §SOURCED_LIGHT "installed … inert until an Alt+S stages it"; no stage line in the film.
- SIDECAR NOT LOADED: §LIGHT_FIELD_PATCH none HospitalAjaibPath.db (404) + §LIGHT_FIELD_DB skip reason=no-table. The sidecar is keyed on
  Hospital_meta.db; the film DB (the one with cinema_path) is HospitalAjaibPath.db, so even with S2 lifted the film would find no field. The lookup
  must resolve by building (bld=Hospital), not by the path DB's file name. This comes before the S2 arm.
- §MIRROR_OWN_MAT skipped (film) — as designed at v1515.
**§BAKE_SPEED A/B 2026-09-30 21:41 (Opus): v1515 vs the Z22 v1478 baseline, SAME command** (`--db HospitalAjaibPath --gpu real --fps 15
--frame-range 0:90`, 1280x720, GPU lock held, no other bake; logs session scratchpad z22b/v1515.log vs deaf078b…/z22/before.log):
| | v1478 (09-28) | v1515 (today) |
|---|---|---|
| §CLI_BAKE_WALL | 442 s | 504 s (+62) |
| §CLI_BAKE_FRAMES p50 / mean / worst | 2346 / 4259 / 182,263 ms | 2335 / 4584 / 207,118 ms |
| steady rate (trailing 10, last 3) | 2.37 / 2.17 / 1.93 s | 2.40 / 2.25 / 2.02 s |
| load (§CLI_BAKE_LOADED) | 25.2 s | 37.7 s |
| MAXQ_START -> 1st staging | 47 s | 76 s |
| §GI_STILL copy building to bounce engine | 63.9 s | 66.3 s |
| §GI_STILL orientation check | 65.1 s (measured) | 0 (§GI_ORIENT_CACHE hit) |
| mp4 / WebGPU errs / unconverged | 2,068,088 B / 0 / 0 | 2,071,282 B / 0 / 0 |
VERDICT: nothing broken; STEADY frame cost unchanged (~2.3 s p50). The earlier "5 s/frame" (§POC_BAKE) was the 3-s squeeze of the whole
path (camera indoors) + a concurrent GPU witness, not a regression. v1515 setup is ~60 s slower (load +12 s, pre-staging +29 s) even with
the orientation check gone — NOT yet attributed. Where a bake's time goes (v1515): ~55 % setup before frame 1, ~45 % frames. Faster-bake
levers, largest first: (1) the §GI_STILL building copy 66 s + two full Alt+S stagings (122 s and 186 s marks) — once per film but paid
every bake; (2) frames 1-16 warm-up (§FRAME_COST running mean 106 s at i=1 -> 2.5 s at i=25); (3) steady 2.3 s x frames (20 renders/frame:
taa=8 ao=12 + one bounce). Next: per-stage timing of frame 0 and of the two stagings, then spec.
**§BAKE_SPEED BREAKDOWN 2026-09-30 22:00 (Opus, read from z22b/v1515.log timestamps + the shipped §STILL_STAGE_MS/§GI_FILM lines — no new
bake).** 504 s wall = ~340 s before frame 1 + ~185 s of 90 frames. CORRECTION to §BAKE_SPEED above: there is NO frames-1..16 warm-up — §FRAME_COST
perFrameMs is a RUNNING MEAN that includes frame 0; by §CLI_BAKE_PROGRESS stamps frame 1 -> 81 took 182.6 s = 2.28 s/frame from frame 1 on.
| setup stage (v1515) | s | source line |
|---|---|---|
| page load | 37.7 | §CLI_BAKE_LOADED |
| staging #1 — sky-portal film cache | 70.8 of 75.5 | §STILL_STAGE_MS portals=70812 / §SKY_PORTAL_FILM_CACHE ms=70792 |
| staging torn down (§PHOTO_STAGING off +127.4) and re-applied — portal cache AGAIN | 53.0 of 54.8 | §STILL_STAGE_MS portals=52974 |
| bounce engine: copy building (progressive compile, 1537 chunks, worst 509 ms vs 40 ms budget) | 66.3 | §GI_FILM built ms=66473 |
| first bounce frame | 75 (f=1 ms=141,821 incl. above) | §GI_FILM f=1; f=2 ms=152 |
The sky-portal classification is 124 s = 36 % of setup, 25 % of the whole 90-frame bake. It is camera-independent (sky_portal.js:171-192
"classify EVERY pane's inward side ONCE") yet runs per staging (stage() sets film=null, sky_portal.js:174) and brute-forces 462 panes x 2 sides x 5
rays against every visible mesh (~4.9k, Raycaster.intersectObjects, no BVH). v1478 paid 42.6 + 45.2 s for the same (v1515 +36 s = the unattributed
setup growth). Per-frame bounce is only 0.11-0.15 s of the 2.28 s; the rest is the 20-render still-refine burst (taa=8 ao=12).
**FASTER-BAKE SPEC (proposed, not built — each item BUILD cached + DECIDE per frame, no look change):**
- FB1 portal cache per BUILDING, not per staging: keep the classified pane set across unstage/stage (key = building + pane count). Saves the
  second pass, −53 s. Witness: second §SKY_PORTAL_FILM_CACHE line reads `reused` ms<50; per-frame portal set identical (paneKey list equal).
- FB2 portal classification off the brute-force raycast: prefilter targets by the ray's segment AABB (rays are ≤60 m) or reuse the light_zones
  column grid (the same "covered = solid above" test, record R2). Target <5 s. Witness: inward side per pane identical to the brute-force pass on
  all 425 panes (Terminal + Hospital), else FAIL.
- FB3 persist it: pane inward-sides are camera-independent — write them into the lightfield sidecar (same BUILD key) so a bake pays 0 s.
- FB4 bounce-engine copy for a CLI bake: the 40 ms progressive budget exists for UI responsiveness; a headless bake has no UI — measure one bulk
  compile vs 1537 chunks. Unknown gain, measure first.
- FB5 (optional, look-changing, ask red1): a draft-bake mode at 960x540 / taa 4 for checks; steady 2.28 s is the renders, not the model.
Expected with FB1+FB2: 90-frame Hospital 504 -> ~385 s; full 2,027-frame path setup share falls from ~340 to ~220 s.
**§FAST_BAKE RESULT 2026-09-30 22:26 (Opus): FB1+FB2 BUILT — bim-ootb fix/fast-bake @68771ccf (off fix/sky-surface), sw v1517, pushed, no PR.**
sky_portal.js: anyHit() = first-object/first-triangle ray (same boolean as intersectObjects), filmCache keyed on the visible glass (pane keys).
First try keyed on the visible TARGET count too and never reused (the two stagings differ by one non-glass object, 4855/4856) — dropped.
| same z22 command, Hospital 90 fr | v1515 | FB2 only | FB1+FB2 |
|---|---|---|---|
| §CLI_BAKE_WALL | 504 s | 411 s | **385 s** |
| portal classification staging #1 / #2 | 70.8 / 53.0 s | 25.8 / 27.3 s | 26.8 / 0 s (reused=462) |
| p50 frame | 2335 ms | 2348 ms | 2367 ms |
| mp4 bytes | 2,071,282 | 2,070,125 | 2,081,490 (+0.5 %, not pixel-judged) |
§FAST_BAKE_WITNESS (&portalwitness=1) PASS panesJudged=462 mismatches=0 on BOTH arms (fresh: fast 26.0 s vs brute 44.8 s; reuse: cache vs a
fresh brute pass on the second staging's 4856 targets). WebGPU errors 0, pageerror 0, unconverged 0 on all runs. Logs: session scratchpad fb/, fb2/.
FB3 (persist the pane sides in the lightfield sidecar, −27 s more) and FB4 (bulk bounce-engine compile, 64-66 s) remain.
### §FILM_INHERIT spec 2026-09-30 (red1: "not going ahead if there are no new changes from alt-s … U know my direction. See to it")
GOAL: the film calls the SAME Alt+S SourcedLight (zone grid, sky-view field incl. §SKY_FIELD_EXACT_OPEN/SMOOTH/OPEN_ROOF, ground field,
lamp binding) — no film-only look logic; the film adds only a per-frame GATE (continuity). bim-ootb fix/fast-bake, sw v1518.
- I1 FIELD BY BUILDING (scene.js A._lightFieldByBuilding, main.js before primeDb): opened db has no light_field_cache row -> fetch
  patches/<activeBuilding>_meta.db|_extracted.db.lightfield.bin, insert the row into the live A.db; light_zones.js primeDb/build do
  their own key (code hash) + fp (geometry) checks. light_zones.js NOT edited (an edit re-keys all 4 baked sidecars; Hospital = 48 min).
  Witness: §LIGHT_FIELD_BY_BUILDING found … then §LIGHT_FIELD_DB restore, and the zone build reports a cache hit (no 16 s + 67 s build).
- I2 STAGE (effects.js staging): `(!A._maxqActive || A._filmParity) && SourcedLight.stage` (was `!A._maxqActive`, showstopper S2).
- I3 GATE per frame (cinema_maxq.js A._filmGeomWhole -> effects.js A._filmParityStep -> SourcedLight.filmGate): uSLParams.x on only
  while the whole building is on screen = no build-up and no storey reveal in the film, or past the fixtures' own relight boundary
  (plan.beats.rise / topout). Reason: the grid + field describe the FINISHED building (S3) — during build-up a storey without its roof
  would be cut to indoor sky = black exteriors. Off = the film's previous model. Uniform only, no recompile. &filminherit=0 = control.
- I4 PORTALS (sky_portal.js frame): with the field on, portals park at intensity 0 (Alt+S retires them under the field); they
  re-aim as before when the gate is off. Light count / shadow units unchanged (no recompile). Known difference kept: the film's
  uniform budget still reserves the portal slots, so its lamp cap is lower than Alt+S's (named, not smoothed).
- NOT YET (next): F5 build-up-aware field — per-zone enclosedFrac(t) from boundary-element placement, so build-up frames inherit too
  (on Hospital_silent the gate is ON only from relightFrac 0.959 = the last 4 %). S5 zone lamp pick (prepare, 84 rays) stays still-only.
WITNESS per run: §LIGHT_FIELD_BY_BUILDING found, §SOURCED_LIGHT on … zonesCache=, §SKY_VIEW_FIELD on, §FILM_INHERIT_GATE lines at the
expected boundary, §FILM_PARITY_FRAME portal=retired(field) while ON, WebGPU/pageerror 0, ms/frame vs §FAST_BAKE 2.37 s; control arm
&filminherit=0 must show gate OFF throughout and equal the pre-change film.
**§FILM_INHERIT WITNESS a90 2026-09-30 23:05 (fix/fast-bake WIP, sw v1518; log scratchpad inh/a90.log):** I1 found the sidecar by
building (Hospital_meta.db, key 21324567:90186) and §LIGHT_FIELD_DB restored it, BUT §ZONE_IDB_CACHE miss "geometry changed" — the path
db's boundary geometry differs from Hospital_meta's by mm in the bounds and 20556.206 vs 20581.83 in one sum -> full build: §SKY_VIEW_FIELD
sweepMs=117408, §SOURCED_LIGHT ms=160393 (setup +160 s). I2/I3/I4 work: every §FILM_PARITY_FRAME sourced=on portal=retired(field);
staged: field (1.55 M active cells), ground field, §GLASS_REFL_OPEN 27,214 cells, §IRC_MAX day IR 318 zones, lamps 122/122 bound, cove 534
zones. 0 WebGPU / pageerror / unconverged. COST: trailing rate 5.0-5.1 s/frame vs 2.2 s (§FAST_BAKE), GI_FILM bounce ms 130 -> 260.
§FILM_INHERIT_GATE printed nothing (logs only a CHANGE; stage already sets on) — fix: log the first call. NEXT: control (&filminherit=0)
vs on, same persistent --profile (zone cache warm) to split shader cost from staging.
**§FILM_INHERIT mid-clip 2026-10-01 01:33 (sw v1519, Hospital_silent frames 1116:1326 = tn 0.380-0.465, 960x540, all flags but storey
reveal; log scratchpad mid/mid.log; ~/Downloads/hospital_silent_inherit_mid.mp4):** §FILM_GEOM_WHOLE f=0 tn=0.3801 whole=1 (topoutU 0.3607)
-> gate ON; f=250 tn=0.4653 whole=0 why=discs-hidden:ARC+STR -> OFF. §SOURCED_OWN_COST 0.21 ms/render (CPU hook is NOT the cost).
COST: 13.3 s/frame with the gate ON vs 2.4 s OFF on the same clip (x5.5); this scene holds 68,910 visible meshes (§FRAME_COST, overlays
on) vs 4,892 on HospitalAjaibPath (x1.45 there) -> GPU shader cost scales with what is drawn; §PHOTO_AO avgRenderMs 363. Wall 3579 s.
§FRAME_QA i=1202 lumaMean=17 darkPct=88.7 (camera inside at the load-path shot) — dark by design or the indoor sky cut: control pending.
Also: §MAXQ_FRAME_TIMEOUT i=242 (1 unconverged), §HUD_OVERLAP_WORST hud.pathmap x loadpath.card FAIL — not attributed yet.
Sidecars: bake.js (full-quality, §SKY_FIELD_EXACT_ALL 2125 s) made patches/HospitalAjaibPath.db.lightfield.bin (6,930,474 B, 38 min);
an in-bake rebuild skips EXACT_ALL (160 s) = NOT the Alt+S field -> per-path-db sidecars are needed for parity, not only speed.
**§FILM_INHERIT CONTROL 2026-10-01 (same clip, &filminherit=0; mid/ctl.log; ~/Downloads/hospital_silent_mid_CONTROL_noinherit.mp4).
RETRACTION: the "x5.5 shader cost" in the mid-clip entry above is WRONG — the control runs the same window at 13.5 s/frame too (frame 186:
13.53 vs 13.42). The 13 s/frame stretch (clip frames ~83-250) is pre-existing, not the inherited lighting.** Real cost of the inheritance:
Hospital_silent clip wall 3579 vs 3452 s (+3.7 %), mean frame 8551 vs 8240 ms; HospitalAjaibPath 90 f 3.0-3.6 vs 2.1-2.5 s (+45 %, 4.9k meshes).
Luma (§FRAME_QA, 375 frames both arms): gate-ON window (250 f) mean 116.6 inherit vs 126.4 control, dark% 23.5 vs 20.4, per-frame |dLuma| up
to 105 (e.g. i=1156 199 vs 139 brighter, i=1236 70 vs 107 darker) = the Alt+S model visibly changes the film; gate-OFF window (125 f) 128.5 vs
127.9, max |dLuma| 10.9 = off equals the old film. The dark frame i=1202 is dark in BOTH (17 vs 26, darkPct 88.7 vs 84.9): the load-path shot.
HUD pathmap x loadpath.card overlap FAILs in BOTH (pre-existing). 1 unconverged frame in the inherit arm only (i=242 timeout).
Hospital_silent.db.lightfield.bin baked (6,912,376 B, fieldMs 2,348,558 = 39 min, full-quality EXACT_ALL).
### §IDLE_PREWARM STUDY 2026-10-01 (red1: "study how 'pre processing in background' when user idles can squeeze away runtime costs")
Existing pattern to copy (no new mechanism): effects.js:2125 §PHOTO_PREWARM (requestIdleCallback, idempotent, the press keeps its own
call as fallback — "DEGRADE, DON'T DISABLE") and time_machine.js:9828 tmWarmXrayElements (pure idle, no timeout, skipped while
streaming / _maxqActive / _stillRefineActive). A headless CLI bake has no idle user: there the same work must come PRE-BAKED (sidecar in
patches/, like the light field) or from a persistent browser profile. Setup costs measured on Hospital_silent (mid2.log, 960x540, before
frame 1 at ~620 s):
| cost | s | kind | idle-prewarm (viewer) | pre-bake (CLI + viewer) |
|---|---|---|---|---|
| load-path shot search (§LOADPATH_BEARING -> §LOADPATH_SHOT) | 155 | pure data: camera path x geometry | yes | YES — key = path + geometry fp; biggest item |
| bounce-engine copy (§GI_STILL stage, §GI_FILM built) | 62-66 | GPU objects, per page | yes (arm GiFilm build at idle) | no (GPU); bulk compile (FB4) untested |
| first bounce frame / shader pipelines | ~60-75 | GPU pipeline compile | yes (warm one render at idle) | partly — Chrome GPUPersistentCache with a fixed --profile |
| window classification (§SKY_PORTAL_FILM_CACHE) | 27 | pure data: glass x geometry | yes | YES — into the light-field sidecar (FB3) |
| light field (zones/sky/ground/glass) | <1 (was 160) | pure data | done | DONE (patches/<db>.lightfield.bin) |
| MEP smooth normals / HDRI / ground tex | ~2 | CPU | DONE (§PHOTO_PREWARM) | — |
| page + DB load | 38 | I/O | — | no |
Squeezable per bake: ~155 + 27 s by pre-bake (data), ~60-75 s by a persistent shader cache, ~65 s only by idle warm in a live viewer.
~5 min setup -> ~1.5-2 min for a CLI bake; near 0 extra for an interactive Alt+C started after the viewer idled. Every item keeps its
in-line call as the fallback and logs `src=prewarm|sidecar|built` so the saving is a log fact. Not built.
### §PREBAKE spec 2026-10-01 (red1: "build the pre-bake items to operate gracefully and safely. NO film bake or use GPU yet")
Two pure-data setup steps get a per-DB sidecar `buildings/patches/<db>.prebake.json` (gitignored, derived — like the lightfield.bin):
- PB1 LOAD-PATH SHOT (cpe_load_path.js loadPathBuild, the §LOADPATH_BEARING -> §LOADPATH_SHOT span, 155 s on Hospital_silent): cache
  buildingBox, the hold-point `shot`, per-candidate {visibleHops, footprint, minMemberPx, memberPx} in pick.valid order, and the winner.
  KEY = code (the ?v= of cpe_load_path.js + cinema_maxq.js script tags) + items fingerprint (count, bbox sum, first/last guid) + path
  fingerprint (5 sampled bake poses, 3 dp, + filmSecFull/topoutU/beats) + camera (fov, outW x outH) + candidate chains hash.
  HIT only if the key matches AND the stored winner guid equals items[winner].guid; anything else = compute as today (logged reason).
- PB2 WINDOW SIDES (sky_portal.js film cache, 27 s): inward side per pane key; KEY = FNV hash of the pane-key list (the same sig FB1
  uses in-page). HIT fills the film cache; a pane missing from the record is classified as today.
- LOAD: main.js, beside §LIGHT_FIELD_BY_BUILDING — fetch patches/<opened db>.prebake.json once; 404 = none. Never blocks: a record that
  arrives late is simply not used.
- WRITE: every build/classification that COMPUTED records itself into A._prebakeOut; cli_silent_bake.js --write-prebake writes it to
  <root>/buildings/patches/<db>.prebake.json at the end of a bake (a normal bake produces it; no separate GPU run).
- SAFETY: miss/stale/corrupt -> today's path, one §PREBAKE line with src=sidecar|computed and reason=. &prebake=0 ignores the sidecar.
  &prebakecheck=1 computes anyway on a hit and compares (shot tNorm + winner guid; every pane side) -> §PREBAKE_CHECK PASS|FAIL.
  BUILT 2026-10-01 bim-ootb fix/fast-bake sw v1524 (scene.js A._loadPrebake/_prebakeRecord, main.js, cpe_load_path.js loadPathBuild,
  sky_portal.js, cli --write-prebake, .gitignore). Node witness viewer/tests/witness_prebake_loader.js 8/8 PASS. NOT run in a browser yet
  (no GPU, red1). First GPU run: a bake with --write-prebake writes the file; the next bake must log §PREBAKE loadPath src=sidecar +
  §PREBAKE portal src=sidecar, and one run with &prebakecheck=1 must log §PREBAKE_CHECK PASS.
### §FRAME_COST STUDY 2026-10-01 (red1: "keep studying our alt-c where we can make more saving"; read from mid2.log, no GPU run)
NORMAL frame (960x540, pre-freeze, 86 frames): 1.9 s p50 = still-refine 8 samples 0.76 s + AO fold 12 renders 0.66 s (51 ms/render)
+ capture/HUD/encode 0.30 s (AO done -> §FRAME_QA) + ~0.2 s other per-frame steps (exposure meter render, sun/fill pins, §PERF_TRAVERSE
13 ms over 74k objects, §LOADPATH_PIXEL_DIAG_PRE_HUD getImageData, §FRAME_HASH).
FREEZE frame (165 frames): refine 6.77 s + AO 4.90 s (407 ms/render = x8) + 1 §STILL_REFINE_RESTART cam-moved per frame (clip-clock bug —
full films pin the camera). CAUSE of x8: §LOADPATH_BATCH_UNPACK containers=4872 elements=63059 — the whiten look hides every
BatchedMesh/InstancedMesh container and draws its elements as individual meshes (cpe_load_path.js:815-840, §129 FIX 3), so the scene goes
from 4,983 held / 25,948 instances to 73,797 held objects (§FRAME_COST i=86) — ~69k draw calls per render, 20 renders per frame.
| lever | saving per Hospital film | look change | status |
|---|---|---|---|
| S1 freeze whiten WITHOUT un-batching: building drawn with one white clipped scene.overrideMaterial pass (the GI geom pass already does this, §GI_STILL geom pass mode=scene.overrideMaterial), stack/twin clones in a second pass (they are depthTest=false, renderOrder 999 already) | freeze frame ~13 -> ~2 s: ~12 min with reuse (≈66 rendered freeze frames), ~30 min without | none intended — needs a pixel witness vs today's whiten on 3 freeze frames | proposal |
| S2 freeze frame reuse (full film, camera pinned) | 99 of 165 freeze frames skipped (record: 199/265 on 1080p) | none | EXISTS (§129.57); clips fixed by §LOADPATH_CLIP_CLOCK |
| S3 pre-bake setup (§PREBAKE PB1+PB2) | ~3 min | none | BUILT, not run |
| S4 per-frame diagnostics every Nth frame (§LOADPATH_PIXEL_DIAG getImageData, §FRAME_HASH/§FRAME_QA qaEvery=1) | not measured; bounded by the 0.2 s "other" | none | measure first |
| S5 AO fold 12 -> 6 renders | ~0.33 s/frame = ~16 min | softer/grainier corner shading | red1's call |
BUILT 2026-10-01 (fix/fast-bake sw v1525, no GPU): S5 as ao 12 -> 8, NOT 6 — 8/8 is the measured row in cinema_maxq.js §MAXQ_FRAME_BUDGET
(RMS 0.37, at the noise floor); 6 never measured (red1: the earlier 40 -> 20 halving showed no grain). ~0.2 s/frame, ~10 min per Hospital film.
S4: §LOADPATH_PIXEL_DIAG_PRE_HUD now on freeze frames only, as its own comment always said (it ran on every frame, 16 getImageData each).
S1 NOT built blind: the un-pack exists because container-level colour changes on BatchedMesh never reached the pixels (§129 FIX 3, cause
never found) and a one-material pass would have to spare the overlays (stack/twin clones, clash boxes, datum) through TAA, AO and bounce
passes. FIRST GPU STEP (one freeze clip, no film): on 3 freeze frames log the whitened pixels (§LOADPATH_PIXEL_DIAG) with the un-pack vs a
container-material white (colorsTexture nulled + material swapped), to find why the earlier attempt failed; build S1 only on that result.
**§CHECKPOINT T1 2026-10-01 06:24 (sw v1530, Hospital_silent frames 1150:1215 + freeze, 960x540 15 fps; /tmp/bake_Hospital_silent_2026-10-01_0613.log;
~/Downloads/Hospital_silent_freeze_AFTER_960x540_15fps_2026-10-01_0613.mp4):** delivered, 230 frames, 0 WebGPU/pageerror/unconverged.
- STACK-ONLY FREEZE: §LOADPATH_STACK_ONLY hidden=4153 -> restored 4153; freeze frames 0.45 s/frame (was ~13 s); §FRAME_REUSE_TOTAL 118/230;
  §LOADPATH_HOLD cameraMoved=false PASS; §LOADPATH_RESUME stepAtResume=0.0000 PASS; §LOADPATH_CUT OFF (stack-only); no un-pack.
- CLIP CLOCK: §LOADPATH_HOLD_INSERT armTnMatch=true (freeze inside this clip) — the post-freeze resume is exact.
- TWINS: sameSig=0 — no other chain with the exact (class@storey) hop sequence on Hospital; the signature is too strict to find any.
- LAMP DATA: dataPath=1 on the restage; §LAMP_DATA film=1 lamps=0 placed=1274 — this window is inside the §116 interior-lights-off span
  (last stick 0.353 -> relight 0.959), so 0 lamps is the film's own rule, not a defect; poolLitPrev=0 every frame (no double lamps).
- SHADOW EDGE: §FILM_SHADOW_EDGE range 916.8 m (was the sun-distance ~19,748 m), normalBias 0.2209 = (R+1.5) texels; the range grew 59x in
  shot 3 by <0.1 m each (grow-only works; the log line is chatty).
- GLASS ENV: §FILM_GLASS_ENV capture#1 ms=405 (once, shot 3); §MIRROR_OWN_MAT never applied — no mirror meshes found in view.
- WINDOW PULL: ran on the inside freeze frames, skipped by its own rule (outside exposure 1.156 >= inside 0.47).
- PREBAKE: loadPath computed 153.8 s + portal recomputed (key-mismatch: different visible glass at this tn) -> file written with both parts
  (294,359 B, merge kept); the next bake of the same range reads them.
### §RED1 FILM NOTES 2026-10-01 (red1 watching ~/Downloads/Hospital_silent_ARCfull_AFTER_1920x1080_15fps_2026-10-01_0543.mp4; "just take note")
Liked: the eye-adaptation exposure going indoors -> outdoors. Asked (study only): the dark passage (frames 1106-1136) — torch IS on
(§CAM_TORCH film on, 450 lm), exposure adapts ~1 EV/s (capped=down) but the passage needs ~7 EV in ~2 s -> luma 3-12; LightLaw.ADAPT decides.
- N1 Exterior shadows at the wing still show a GAP, not touching their base. Fact to check first: that clip was baked at sw v1527, BEFORE
  §FILM_SHADOW_EDGE (sw v1530): films then used normalBias 2 x texel and the ~19.7 km sun-distance depth range (the base-gap cause
  §STILL_SHADOW_EDGE fixed for stills). v1530 logs range 916.8 m / normalBias 0.2209 m. Open: re-judge on a v1530+ whole-building clip;
  if the gap stays, measure it (predictedBaseGap line of §STILL_SHADOW_EDGE) at the wing's sun elevation.
Measured lessons that carry to films: exact-covered sky cells cost -0.5..-1 EV indoors (the meter answers small F lifts) — any film sky
term must be judged on exposure, not only on F; the LEAK grid reads under+bounce, not the final composite; a patch/blockiness metric must
be checked against a fake-grid control (wall "blocks" were a distance-bias artefact).

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
**red1 ruling (2026-09-25): "the steady static control is acceptable; the more dramatic path, that risk must be
weighed."** Watchdog decision: F3 DEFAULT = steady (exposure fixed per film, or per shot from the meter, held; changes only
at cuts). The crossing ramp is an OPT-IN flag (--exposure-ramp), OFF by default, built LAST in the film lane, and only
after the crossing-path witness passes. Risks weighed: a ramp is one more moving term (pulsing if the meter's inputs jump),
needs a cited rate, and interacts with lamp fades + bounce; steady has one known cost: a shot that walks in from outside
stays at the outside look until the next cut (accepted by red1).
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
