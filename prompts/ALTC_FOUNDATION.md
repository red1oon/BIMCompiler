# ALTC FOUNDATION — consolidated state (switched 2026-10-02, red1 go)
Consolidated from the 641-line original (read in full), 2026-10-02. The full original is archived: prompts/archive/ALTC_FOUNDATION_full_history_2026-09-25_to_2026-10-02.md (grep it by § tag; `Lnnn` refs below point into it).
Append new dated state to §1 and REPLACE superseded lines; do not let this file regrow into history (git + the archive keep it).
Every line carries its source section. `Lnnn` = line in the 641-line original (it may have shifted since). §1 top bullet, §2 items 1/2/7, §3 BUILT note and §7 were corrected by the Alt+C session 2026-10-02 03:25 from its live state (logs + git); everything else is as generated.
Alt+C = film recorder (cinema_maxq.js + cli_silent_bake.js). Alt+S = still. bim-ootb = viewer repo. sw vNNNN = service-worker version.

## 0. RULES THAT GOVERN THIS LANE
- ARCHITECTURE RULE (red1 2026-09-25) L10-15: Alt+S is the source of truth for lighting; Alt+C only inherits. Every lighting decision lives in ONE Alt+S function of (camera, sun, time, visible geometry). A film may add only continuity (fades, hysteresis, per-shot exposure hold, stable shadow boxes). No new look logic behind `!A._maxqActive`; a film-only branch is allowed only for smoothing and must be named as such. Each Alt+S look commit lists the functions it adds/changes and confirms the film path calls them.
- RULE ADDENDUM (§ALTC_SHOWSTOPPERS, prompts/ALTC_SHOWSTOPPERS.md) L17-22: write every lighting function as BUILD (per building, cached) + DECIDE (per camera/frame, ray-free, ms-scale). Stoppers S1-S5 (no per-frame function; look gated `!A._maxqActive`; 4D build-up vs timeless zone cache; per-frame cascades unstable; zone lamp pick needs the 84-ray grid) all have remedies; none blocks the rule.
- STANDING OK (§BAKE_QUEUE, red1 2026-10-02) L53-55: "Both of you have my confidence to proceed working with each other without my further go ahead. I only feedback on exceptional basis." Alt+C and Alt+S sessions (Alt+S = bim-compiler-db) coordinate GPU work, sidecars and merges directly. GPU discipline unchanged: gpu.lock, one headless render at a time, >= 3 GB free before a full bake (red1's Chrome).
- red1 ruling 2026-09-25 (§F3) L500-506: camera-dependent light is acceptable in a film if it flows. Criterion = CONTINUITY, not camera-independence: max per-frame change per term <= 1/F of its range, 0 one-frame jumps. Per-shot balance is intended.
- red1 ruling 2026-09-25 (§F3) L507-512: "the steady static control is acceptable; the more dramatic path, that risk must be weighed." F3 default = steady exposure (fixed per film, or per shot from the meter, changes only at cuts). Crossing-ramp is opt-in `--exposure-ramp`, OFF, built LAST, only after the crossing-path witness passes.
- red1 ruling 2026-10-01 (§RESOLVE_BY_BUILDING) L67: "Hope fixes will abstract able to handle any building IFC set."
- red1 ruling (§STILL→FILM) L112: authored-model (IFC) defects are not compensated, in films too.
- red1 ruling 2026-09-30 (§FILM_INHERIT) L190: "not going ahead if there are no new changes from alt-s … U know my direction. See to it."
- Instrument rule: a record without a § line or a node-maths number is not a claim. Witness is maths on the zone grid/plan or one logged § line per frame, no frame judging, no ray grids (header L1-8).

## 1. LATEST STATE (newest first)
- ▶ 2026-10-02 06:15 (Alt+C session bim-compiler-8e). To-do 1-3 DONE: sky-surface @f78a6579 merged into fix/fast-bake = **sw v1544** (77ace8f3,
  pushed; both-side files bumped sourced_light 78, tools 73, gi_still 46); HHS/Terminal k21324567 sidecars renamed in (old kept as .k1b214d46);
  Hospital_silent sidecar released by Alt+S (bim-compiler-72): key 21324567:90186, occluderTris 5,819,012, restorecheck §ZONE_IDB_CACHE hit,
  names patch md5-identical in wt-surf and wt-fastbake. To-do 4 RUNNING since 04:51: Hospital 24 fps, 4,963 frames, log
  /tmp/bake_Hospital_silent_2026-10-02_0451.log; boot read: §LIGHT_FIELD_PATCH applied key 21324567:90186, §ZONE_IDB_CACHE hit 56 ms, 0 §GI_FILM_OFF,
  0 Uncaptured. 06:15 = frame 1,952 (39%), mean 2.40 s/frame. red1: "prepare to pull the plug, but gather all the intel first".
- §FRAME_PHASES (2026-10-02, measured from the bake logs, no GPU run; scratchpad a0e48414…/phases.py, gaps.py). Per frame, mean ms:
  | bake | setup (4D tick, staging) | light (lamp/cove/IR + meter) | TAA 8 | AO 8 | capture (HUD + webp + hash) | total |
  | Hospital 24 fps now (f 50-1924) | 393 | 287 | 547 | 591 | 570 | 2,397 |
  | Hospital 15 fps 10-01 1417 | 439 | 349 | 695 | 801 | 609 | 2,907 |
  | HHS 15 fps 10-02 0230 | 186 | 123 | 245 | 279 | 556 | 1,397 |
  Old Alt+C for scale: Hospital 1.27 s/frame (RESUME_2026-09-02 §MEASURED); per render then AO 27 ms / TAA 49 ms (AGENT_QUEUE U-7), now ~70 ms / ~65 ms.
  - Item 3 (lamp rebuild) RE-MEASURED: 191 of 1,873 frames rebuild; their light step 922 vs 215 ms -> ~0.7 s x 10% = **~70 ms/frame (~3%)**.
    Rebuild frames are slow in EVERY phase (TAA 898 vs 507, AO 948 vs 550) = heavy interiors, not the rebuild. The earlier "20-30%" was wrong.
  - Capture is ~560 ms on every building (resolution-bound): _captureFrame composites HUD then `c.toBlob('image/webp', 0.92)` (cinema_maxq.js:2169),
    hashed + re-encoded to H.264 anyway. Biggest flat cost: 4,963 x 0.56 s = 46 min of this bake. Not yet split webp vs HUD in the log.
  - Exposure meter (§SUN_ARC_FILL_PIN -> §FILM_EXPOSURE) 141 ms/frame: SourcedLight.meterRead renders the scene again at 160x90 every frame.
  - TAA 8 + AO 8 = 16 full renders = 1.14 s (47%). AO legacy mode in films (effects.js:5553, off when A._maxqActive).
  - MP4 stitch 138 s / 2,937 frames (1417) — small.
  - SAVING CANDIDATES (to A/B after this bake lands, GPU busy): S-A webp -> jpeg q0.95 at capture (est. -250 ms, look = H.264 anyway; prove by
    per-frame RMS vs webp); S-B meter on a 1-frame-old capture or every 2nd frame (est. -70..-140 ms; exposure eases, prove §FILM_EXPOSURE EV delta);
    S-C sample budget taa/ao 8/8 -> 6/6 at 24 fps (est. -285 ms; quality sweep per CPE_4D_PERF_MEM_STUDY RMS rule); S-D fixed lamp set (~-70 ms).
- 06:25 red1: "stop. we experiment with savings is more crucial" -> Hospital bake KILLED at frame ~1,955 (partial, no film). Alt+S told GPU free.
- §SPEED_AB SPEC (2026-10-02, red1 go). Goal: cut s/frame with no visible change. All arms opt-in URL switches; defaults unchanged until proven.
  - S-A `&capfmt=jpeg` (`&capq=` default 0.95): _captureFrame encodes JPEG instead of WebP 0.92 (cinema_maxq.js both toBlob sites). §CAPTURE_ENC logs
    encode ms + bytes per frame (also on the control arm, so the WebP cost is measured, not estimated).
  - S-B `&metereach=N`: §FILM_EXPOSURE meters (SourcedLight.meterRead) only every Nth film frame and on a gate snap; between, it eases toward the last
    target. Log `metered=0|1`.
  - S-C `--still-budget 6,6` (exists, cli_silent_bake.js:240).
  - Clip: Hospital_silent, full 24 fps grid, `--frame-range 1880:1940` (heavy interior, 3-5 s/frame in the killed run), 1920x1080, --visual-panel.
  - Witness (numbers, no eyes): per arm s/frame from §FRAME_HASH spacing + §CAPTURE_ENC/§FILM_EXPOSURE; picture change = ffmpeg PSNR/SSIM of each arm's
    mp4 vs the control mp4, frame by frame. Pass = SSIM >= 0.99 mean and min >= 0.98 (8-bit H.264 both sides). A run where the clip has <50 frames
    or any arm's §FRAME_HASH count differs = INCONCLUSIVE.
- §SPEED_AB RESULT (2026-10-02 08:12, sw v1545 45a7ed7d, Hospital_silent --frame-range 1880:1940 = 324 frames incl. the load-path freeze, 53 reused;
  logs scratchpad a0e48414…/ab/*.log, phases.py on the 59 rendered heavy-interior frames; ctrl was partly GPU-shared, ctrl2 = the baseline):
  | arm | setup | light | TAA | AO | capture | total ms | encode ms | luma vs ctrl mean/max | EV vs ctrl max | PSNR vs ctrl dB |
  | ctrl2 (repeat) | 463 | 838 | 949 | 1044 | 955 | 4,252 | 360 | 0.02/0.12 | 0.000 | 44.9 (noise floor) |
  | A jpeg | 430 | 724 | 900 | 861 | 433 | 3,350 | 23 | 0.02/0.14 | 0 | 40.0 |
  | B metereach=4 | 294 | 149 | 1042 | 873 | 719 | 3,078 | 260 | 1.02/**21.0** | **0.710** | 38.2 |
  | C budget 6/6 | 300 | 527 | 580 | 674 | 824 | 2,906 | 259 | 0.06/1.46 | 0 | 44.1 |
  | ABC | 401 | 196 | 1060 | 778 | 649 | 3,087 | 34 | 0.98/21.0 | 0.710 | 36.5 |
  - Pipeline is deterministic before encode (ctrl vs ctrl2: EV identical, luma <= 0.12). SSIM vs ctrl is NOT a usable gate: ctrl2 itself reads mean 0.9885
    min 0.918 (H.264 noise), every arm sits inside it — judge by pre-encode luma (§FRAME_QA) + EV + PSNR against the ctrl2 floor instead (§SPEED_AB gate amended).
  - A PASS: pre-encode picture identical, encode 360 -> 23 ms, capture -0.5 s. PSNR 40 dB = encoder difference only.
  - B FAIL: exposure lags up to 0.71 EV, a 21-level luma jump — the meter must run every frame. But it costs ~0.7 s in heavy frames -> next: a cheaper meter
    (read the finished frame's 64x36 like §FRAME_QA, or meter at lower res), not a skip.
  - C PASS: luma max 1.46, PSNR 44.1 ~ noise floor; TAA+AO -0.74 s.
  - 08:32 red1 ("what if without LoadPath ON? can we leave it to run on its own while Wifi off?"): load path costs ~264 freeze frames x ~0.9 s
    = ~4 min of ~3 h -> kept ON. FULL Hospital bake QUEUED on gpu.lock (runs after arms AC + M): sw v1546 @5f371412, `BAKE_EXTRA="--visual-panel
    --still-budget 6,6 --url-query &capfmt=jpeg"`, log /tmp/wt-fastbake/out/Hospital_silent_hires_2026-10-02_0832.log, lands ~/Downloads/
    Hospital_silent_full_AFTER_1920x1080_24fps_2026-10-02_0832.mp4. Estimate ~2.1 s/frame x 4,963 = ~2.9 h (was ~4 h). Meter fix (&meterprime=auto,
    arm M) NOT in it — unproven at launch. On landing: §LIGHT_FIELD_DB key 21324567:90186, §ZONE_IDB_CACHE hit, §GI_FILM done errFrames=0, ffmpeg
    black/freeze scan, §FRAME_QA luma 2345-2360, §CAPTURE_ENC fmt=jpeg, §MAXQ_FRAME_BUDGET taa=6 ao=6.
  - 08:40 Alt+S fix/sky-surface @436b85cc sw v1546 = §WIND_FLIP (flipped-winding geometries DoubleSide; patches geometry_wind_flip): Hospital 127/20,609
    flagged, §FAULT identical on/off (their commit) -> queued Hospital bake kept WITHOUT it. MERGE 436b85cc into fix/fast-bake after it lands, before any
    HHS film (2,801/4,710 flagged); sw clash v1546 both sides -> v1547; check the light-field fingerprint still hits (the names patch moved it).
  - 08:45 red1: "kill the hospital bake, do these first" -> queued full bake killed (never started). §WIND_FLIP merged = sw v1547 (5f5eeecc).
  - AC (jpeg + 6/6) PASS: heavy frames 4,252 -> 3,293 ms (-23%), EV identical, luma max 1.45, §GI_FILM errFrames=0. M (&meterprime=auto) NO GAIN:
    EV identical but prime forced 20/49 frames (new programs keep appearing); run disturbed by an unrelated GPU witness (/tmp/wt-threads-2) -> dropped.
  - Code read (effects.js ~5160-5510 + lib/TAARenderPass.js): TAA and AO are ALREADY folded — the 8 AO steps continue TAA jitter samples 9-16 (16-entry
    table) and add N8AO quads (~34 ms) + one depth-prime render; shadow maps already autoUpdate=false. So 6/6 = 12 of 16 jitter samples, 6 AO accumulations.
- §SPEED_PAR SPEC (2026-10-02, red1 go). Two levers beyond §SPEED_AB.
  - P1 PARALLEL SPLIT: K=2 cli_silent_bake instances at once on disjoint --frame-range halves, own ports/profiles, one gpu.lock held for the pair;
    seams are frame-exact by design (cli_silent_bake.js:130). Test on HHS_Office_Federated_silent (smaller VRAM), 24 fps, jpeg + 6/6, frames
    1800:1920 (away from the load-path freeze at ~26%): single 1800:1920 vs pair 1800:1860 + 1860:1920. Witness: render-span seconds (first->last
    §FRAME_HASH, boot excluded), VRAM peak (nvidia-smi every 2 s), §GI_FILM errFrames/gpuErrors=0, §FRAME_QA luma per global index pair vs single
    (must match <= 0.15, the ctrl/ctrl2 floor). Pass = pair span <= 0.65 x single span with 0 GPU errors.
  - P1 RESULT (09:01, HHS 1800:1920, jpeg + 6/6): FAIL. single = boot 51 s + render 84 s (0.71 s/frame, was 1.40 at webp + 8/8 = HALF);
    pair = 221 s wall vs 143 s: pb sat ~107 s in boot while pa rendered, then rendered alone — two Chrome bakes do NOT render concurrently on
    this GPU (VRAM was fine: pair peak 2.4 GB). Seam: pb luma +2.3 at 1860, then ~-1.1 for 30+ frames (pa part 0.057 = floor) -> film state
    carries history (exposure ease, probably bounce) — any piece split needs >= 1-2 s pre-roll frames discarded. Pieces = resilience only, no speed.
  - Audit (subagent, verified): L1 _waitFoldDone polls 100 ms (cinema_maxq.js:763, ~50 ms idle/frame); L2 effects.js:6159/6169 env-map/glow safety
    timers armed EVERY frame (60 s each -> ~25 live); 2x _raf2 per frame (cinema_maxq.js:3592, 4126). §STILL_RES resize: 0 lines -> not firing.
    HHS capture split (sw v1548): compMs 225 / enc 62 / hash 7 / idb 11 ms — the composite (inside it a composer render + bounce hook) is the cost.
    §BAKE_LEAN (&bakelean=1, sw v1550) = L1 + L2; §CAPTURE_PARTS (sw v1549) splits composer / draw3d / hud. HHS base vs lean test running.
  - §CAPTURE_PARTS (sw v1549, HHS): composer 7 / draw3d 222 / hud 8 ms — draw3d = the bounce hook. §BAKE_LEAN (&bakelean=1) NO GAIN (0.725 vs 0.700).
  - §GI_FILM_PARTS (sw v1551, HHS, ms/frame): grab 86 (WebGL frame -> 2D + blank probe + colour copy) / geom 25 (WebGPU bounce) / read 58 (float
    33 MB) / loop 49 (JS float->byte) / comp 2. &gifast=1 (no Math.max/min) PASS 0.724 -> 0.686 s/frame, luma 0.071/0.77 (HHS floor 0.069/0.79).
  - §GI_FILM_8BIT &gi8=1 (sw v1552) PASS: rgba8 bounce target -> HHS 0.724 -> **0.565 s/frame (-22%)**; bounce 220 -> 110 ms (read 25, loop 6);
    luma vs base 0.060/0.62, compositeMean 116.6 vs 116.5, errFrames=0 gpuErrors=0. Remaining grab ~61 ms is mostly the required WebGL readback.
  - BAKE RECIPE now (all opt-in, defaults unchanged): `--still-budget 6,6 --url-query &capfmt=jpeg&gi8=1`. HHS 24 fps ~3,275 x 0.565 = ~31 min
    (was ~76 at webp 8/8). Hospital not yet measured with gi8 (bounce ~179 ms there).
  - P2 CAPTURE OVERLAP: first SPLIT the remaining capture (jpeg made encode 23 ms, capture still ~430 ms): §CAPTURE_ENC compMs (HUD composite),
    §CAPTURE_TAIL hashMs + idbMs (sw v1548, logging only). Build the overlap only on the part the split shows is the cost.
  - ABC did not add up (TAA 1060 with taa=6): with the meter skipped its warm-up work moves into the first TAA render; single run, noisy. AC (A+C) arm queued.
- ▶ RESUME 2026-10-02 04:00 (Alt+C session closing; red1: "do not start as we resume in new session") — supersedes the 03:25 state + §BAKE_QUEUE blocks.
  - bim-ootb fix/fast-bake **sw v1543**, pushed, no PR, worktree /tmp/wt-fastbake. Since v1533: v1534 §GI_FILM_CARRY C1-C4 (§3) · v1538 merge
    fix/sky-surface v1526-1531 (surface names, plaster, furniture polish reach films; §FLOOR_CONTACT/§OBJECT_CONTACT OFF under A._maxqActive) ·
    §IFC_SURFACE_NAMES patches for the film DBs (HHS_Office_Federated_silent 2,628 names, Hospital_silent 18,841; scripts/ifc_surface_patch.js
    --db <X>_silent.db; Terminal_silent needs none) · v1539 §FILM_BLANK_FRAME + §FILM_GATE_EXPOSURE_SNAP · v1540 merge feat/freeze-perf-panels
    (CCTV panel in the load-path freeze, §FREEZE_BANDS) · v1541 §FREEZE_ANIM + plain-English copy · v1542 §FREEZE_PERF_ROOMS · v1543 STALE needs
    camera motion. bake_hires_offline.sh: gpu.lock + saved day corner (BAKE_DAY overrides). Freeze-panel spec: PERFORMANCE_AS_CLASH.md §19-§19.4.
  - DELIVERED 2026-10-02: ~/Downloads/HHS_Office_Federated_silent_full_AFTER_1920x1080_15fps_2026-10-02_0230.mp4 (104.8 MB, 2,047 fr, key
    1b214d46:90224, §ZONE_IDB_CACHE hit, bounce on all 2,044 frames, 0 blank). Terminal DELIVERED 04:02: ~/Downloads/Terminal_silent_full_AFTER_1920x1080_15fps_2026-10-02_0322.mp4 (69.7 MB, 1,381 fr, 40 min,
    key 1b214d46, §ZONE_IDB_CACHE hit, bounce 1,374 frames 0 errors/rebuilds, 0 blank, CCTV panel 47 rooms PASS, §FREEZE_ANIM settled once,
    §CPE_REVEAL_LEAK 47 lines — item 9).
  - Queue script STOPPED (scratchpad 9e876aa6/queue.sh). Hospital NOT started (red1). TO DO, in order:
    1. merge origin/fix/sky-surface @f78a6579 into fix/fast-bake (§SKY_FIELD_FURNITURE REVERT -> key 21324567:90186, §DOME_GLOW = red1's wall-lamp
       half-sphere, §ZONE_EYE_SKIP_OPEN, §LOCAL_EXPOSURE_BILATERAL); sw.js conflict: keep both, higher CACHE_VERSION +1.
    2. rename patches/HHS_Office_Federated_silent.db.lightfield.bin.k21324567 and Terminal_silent...k21324567 over the 1b214d46 files.
    3. Hospital_silent sidecar: the Alt+S session (PHOTOREAL_STILL_RENDER.md resume) is rebaking it WITH the 18,841 names (no-names one = STALE,
       moved aside). Release only on its message: key 21324567:90186, occluderTris ~5.8M, restore = §ZONE_IDB_CACHE hit WITH the names patch.
    4. Hospital full bake at **24 fps** (red1 2026-10-02: "next bake after this, Hospital should be at full 24fps"; HHS 15 fps took 50.5 min at
       ~1.45 s/frame, Hospital 15 fps ~2.3 s/frame x 2,937 -> at 24 fps ~4,700 frames, plan ~3 h): BAKE_W=1920 BAKE_H=1080 BAKE_FPS=24 BAKE_TAG=full_AFTER BAKE_EXTRA="--visual-panel" scripts/bake_hires_offline.sh
       Hospital_silent (saved corner = tl). Read: §LIGHT_FIELD_DB key match, §ZONE_IDB_CACHE hit, §DOME_GLOW, no §GI_FILM_OFF, frames 2345-2360
       luma (the 10-01 flash: 105.7 -> 87.8 -> 110), §FILM_BLANK_FRAME.
    5. LTU (red1 2026-10-02 12:40: "it was my silent db but i just didn't save as _silent_"): ~/Downloads/LTU_AHouse.db IS the film DB —
       cinema_path 3 pins, 61.2 s, OLD schema (no buildup/room_title/reveal/day_counter/clash/measure/storey_reveal -> read as off, effects.js:10512),
       no 4D tables (tasks/schedules). Linked /tmp/wt-fastbake/buildings/LTU_AHouse_silent.db -> it. patches/LTU_AHouse_silent.db.sql = GEOREF +
       storey_walkable_raster only (no IFC names, no WIND_FLIP). Asked Alt+S for the sidecar (key 21324567) + whether names/WIND_FLIP blocks are
       needed — after the Hospital bake, on red1's go.
  - Coordination: red1 standing OK (2026-10-02) — Alt+C and Alt+S sessions arrange GPU / sidecars / merges directly; red1 only on exceptions.
    GPU: gpu.lock, one headless render, >= 3 GB free before a full bake. Per-DB artifacts (patches .sql, .lightfield.bin) are keyed on the DB file
    name AND fingerprinted on geometry/material names — a new patch can stale a sidecar (§4 §RESOLVE_BY_BUILDING).
  - The 10-01 Hospital film (…_noLoadPath_AFTER_…_1417.mp4) is superseded: occluder defect (in-bake rebuild), no bounce after f=1071, black 2:35.
- RESOLVED (merged at v1533, then v1538): merge from the stills session (§FROM THE STILLS SESSION 2026-10-01) L24-30 — fix/fast-bake lacked origin/fix/sky-surface after 22a8e253. Includes §MEP_SERVICE_COLOUR v1/v2 (0bd4e6c8, 1a9a7eea; MEP painted by service per BS 1710; canvas, stills AND films; `&mephue=disc` = old), §LAMP_SHADOW_TOPK 81a1b359 (still-only, default off), 6d725a81 (proxies RAL 7035, luminaires RAL 9016 = all views). §GLASS_TONE_STILL, §LAMP_CONTACT_SHADOW, §LAMPS_RATED_DEFAULT are Alt+S only. Dusk (`&dusk=1`) is an Alt+C matter (red1). Procedure: in /tmp/wt-fastbake `git fetch origin && git merge origin/fix/sky-surface`; sw.js conflict = keep BOTH precache additions, take the HIGHER CACHE_VERSION. Witness viewer/tests/witness_mep_service_colour.js PASS 7/7.
- SUPERSEDED by the 03:25 state above — §RESUME 2026-10-01 08:30 L32-37: fix/fast-bake sw v1533 (pushed, no PR, not on main/OCI) = fix/sky-surface (Alt+S v1516-1525) + Alt+C work: §FAST_BAKE FB1/FB2, §FILM_INHERIT (gate, lamp data, per-shot shadow edge, window pull, glass env/mirrors), §PREBAKE PB1/PB2, §LOADPATH_STACK_ONLY (freeze 13 s -> 0.45 s/frame), §LOADPATH_CLIP_CLOCK/_CLIP_SKIP, §132 twins (none found: signature too strict), §FILM_CAM_LIGHT (eye light back), ADAPT up 6 / down 4, §INTERIOR_LIGHTS_ARC (lamps off only with no ARC). Worktree /tmp/wt-fastbake. Bake tool scripts/bake_hires_offline.sh with BAKE_W/H/FPS/TAG/EXTRA (e.g. `--frame-range 1065:1365 --no-load-path --write-prebake`).
- Deliverables (~/Downloads) L38: Hospital_silent_ARCfull_long_AFTER_..._0655.mp4 (red1: "looks all good"); ..._ARCfull_lamps_AFTER_..._0733.mp4 (the bad-bounce clip).

- ▶ 2026-10-02 10:41 HHS 24 fps DELIVERED (red1 "Do the HHS then. Let it run"; then "pause after HHS" — nothing queued; review with Alt+S, red1
  decides next): ~/Downloads/HHS_Office_Federated_silent_full_AFTER_1920x1080_24fps_2026-10-02_0934.mp4 (164 MB, 3,274 fr, 136.4 s), sw v1552 @7498bb61
  (§WIND_FLIP rows=2801) + recipe `--still-budget 6,6 --url-query &capfmt=jpeg&gi8=1`. §CLI_BAKE_WALL 3,650 s (est. ~75 min without the recipe;
  first 40% 0.97 vs 1.41 s/frame at the 02:30 15 fps bake; the 0.565 s/frame slice estimate was a light stretch — corrected).
  PASS: key 21324567:90186, §ZONE_IDB_CACHE hit, §GI_FILM done 3268 meanMs=100 errFrames=0 gpuErrors=0, unconverged=0, 0 Uncaptured, 0 blank,
  ffmpeg 0 black / 0 freeze to frame 3274. FAIL (unchanged vs 02:30): §CPE_REVEAL_LEAK ARC:17 (57 lines), §HUD_OVERLAP_WORST 324x216,
  §INTERIOR_LIGHTS_WITNESS poolLit 0/122, §CLI_BAKE_POSECHECK maxErr 50.1 m. Quality discussion with Alt+S (bim-compiler-72) sent 10:43.
  Alt+S review (bim-compiler-72, 10:50, numbers/code only): 0934 is the first film on key 21324567 (02:30 used stale 1b214d46) and on
  §ZONE_EYE_SKIP_OPEN (no counter line — gap). §DOME_GLOW does NOT reach films: §FIXTURE_FACE 0 lines in both film logs; effects.js startStillRefine
  gates _fixtureFaceApply / lampSync / meterFinal on !A._maxqActive ("Alt+S only (films: uFixFace 0)") = an inheritance gap (§0 rule), red1 to decide.
  IFC names were in both films (§PATCH_APPLY 2,637 -> 5,440 statements = +2,801 WIND_FLIP rows). Proposed still checks (~10 min GPU each, on red1's
  go): gi8 banding at HHS …880424616 + …878367234 (|dLf| p50/p99, new edges |dLf|>=15, floor-patchy vs default-twice floor); 6/6 flat-wall local
  std; §WIND_FLIP film-start line + raycast count of first hits on the 136 flagged FRONT_SIDE elements, default vs &windflip=0.
  Open: Hospital recipe clip (ACG) INCONCLUSIVE — every phase slower incl. TAA/AO, GI grab 635 ms = GPU contention (an oci_patch_gate.js run
  outside gpu.lock overlapped the window); re-run with a free GPU when red1 resumes.

- §REVEAL_DOOR_LEAK (2026-10-02 11:05, red1 "bad separation of concern" / "PROCEED"). FOUND by §REVEAL_TRAP (&revealtrap=1, sw v1554, HHS slice
  1285:1345): the 17 leaked ARC meshes are all IfcDoor plain meshes (guids 3XrBtx9eX7mQE6EqWHP…), re-shown by time_machine.js:1685 renderAtTime
  `obj.visible = true` (single-mesh showReal branch) <- tmSetCursor <- cinema_maxq.js:3764, every frame. time_machine.js has never consulted
  hiddenDiscs (its own note :694); the reveal writes once per slot, the 4D tick every frame, so the last writer wins.
  SPEC: final visibility of a single mesh = built at cursor (4D owner, 4D_MODEL_INTEGRITY §I "is it on screen at cursor?") AND its discipline is
  shown (discipline filter owner, panels.js _applyDiscVisibility / A.hiddenDiscs). renderAtTime keeps computing "built" and writes visible only
  through one helper `_discShown(obj)` (false when obj.userData.disc is in app.hiddenDiscs). No change to placed/frontier/staged logic.
  Witness: the same slice with &revealtrap=1 -> §CPE_REVEAL_LEAK lines = 0 and §REVEAL_TRAP lines = 0; §PERF_TRAVERSE/§GEO_ORDER/§SUPPORT_CYCLE
  unchanged vs the trap run; outside the round (hiddenDiscs empty) behaviour is identical by construction.
  WHY NOW (red1: "the 4D never put back before"): renderAtTime has always re-written SINGLE meshes every tick — its delta skip exists only for
  Batched/Instanced (time_machine.js:1736/:1806). §SURFACE_R10 (735c0dd3, PR #1763, 2026-09-24) splits doors with hardware into 2 materials and
  a split element never enters a batch (streaming.js:989-1003) -> HHS doors became single meshes -> re-shown every tick. Before 09-24 they were
  batched and skipped once built (topout 0.26 < reveal 0.40). Option B (single meshes join the delta skip) rejected: changes every single mesh.
  RESULT sw v1555 a7ebeafd (pushed): trap2 slice — §REVEAL_TRAP 17 -> 0, ARC/STR §CPE_REVEAL_LEAK 2 -> 0 (one pre-hide line at slice start,
  hiddenDiscs=[], in both runs = slice artifact), §PERF_TRAVERSE discKept=17 hiddenDiscs=[STR,ARC] every pass; §GEO_ORDER/§SUPPORT_CYCLE/
  §HOSTED_BEFORE_HOST/§DEQ_REPAIR identical; GI errFrames 0; frame 1285 luma equal (doors re-shown after it), 1286+ +1.4..3.2 (doors gone).
  Not yet re-measured: Hospital 48 / Terminal 74 (expected same cause — their split doors), next full film.

## 1R. REVIEWER TAKE (bim-compiler-19, 2026-10-02; numbers only, no frame judging — PRIMAL LAW)
Reviewed: ~/Downloads/HHS_Office_Federated_silent_full_AFTER_1920x1080_15fps_2026-10-02_0230.mp4 + /tmp/bake_HHS_Office_Federated_silent_2026-10-02_0230.log. Goal context (red1): the film is a hook for the long tail of DIY BIM users; first look matters, so polish is justified, but it needs a finish line.
- PASS (measured): 2,047 frames 1920x1080 15 fps 136.5 s 105 MB; §CLI_BAKE_WALL 3029 s aborted=no fileOk=true; §MAXQ_QUALITY unconverged=0; §FRAME_REUSE_TOTAL 3/2047; §GI_FILM done staleFrames=0 errFrames=0 rebuilds=0 gpuErrors=0 (orientation asRead=1.26%, vs 79.88% in the bad 0733 Hospital clip); blankGrabsRecovered=115; ffmpeg blackdetect(d=0.2) 0 segments + freezedetect(d=1.5 s) 0 segments, scan completed over 2047 frames.
- FAIL lines the bake itself printed (unattributed, need an owner):
  1. §INTERIOR_LIGHTS_WITNESS poolLit=0/122 past topout (2 samples). Known: this witness counts only the pool, not the data-path lamps (§2 item 3) — so it may be a witness false alarm; not proven either way for HHS.
  2. §CPE_REVEAL_LEAK LEAKED={"ARC":17} across ~8 slots (tNorm 0.41-0.80; ghost:MEP / tail-one:MEP / tail-all:MEP; hiddenDiscs=[STR,ARC]). A discipline the round did not ask for is visible. Looks real.
  3. §HUD_OVERLAP_WORST hud.pathmap x loadpath.infopanel.near overlap 324x216 px (rects [1566,30,324,216] [1542,30,355,248]). Also FAILed in the Hospital clips (pre-existing, §FILM_INHERIT mid-clip) — a real on-screen layout defect.
- NOT MEASURED here: whether any frame is "one look" quality (red1's call; no screenshot as evidence). Light-field sidecar used for this bake = 1b214d46 (stale after the f78a6579 merge, see §1).
- Verdict: technically clean and deliverable; 3 FAILs open. Finish line proposed (red1 to confirm): film clean = 0 black/frozen, §GI_FILM errFrames=0, and the three FAILs above each either fixed or proven a false alarm. After that, stop tuning the look.
- TERMINAL (reviewed 2026-10-02 04:03; ~/Downloads/Terminal_silent_full_AFTER_1920x1080_15fps_2026-10-02_0322.mp4, log /tmp/bake_Terminal_silent_2026-10-02_0322.log): PASS = 1381 frames 1920x1080 15 fps 92.1 s 69.7 MB; §CLI_BAKE_WALL 2394 s aborted=no fileOk=true; unconverged=0; §FRAME_REUSE_TOTAL 7/1381; §GI_FILM done staleFrames=0 errFrames=0 rebuilds=0 gpuErrors=0 blankGrabsRecovered=77; ffmpeg 0 black + 0 freeze segments (scan completed). FAILS: (a) §CPE_REVEAL_LEAK LEAKED={"ARC":74} on 39 slots (HHS had ARC:17) — real, scales with the building; (b) §HUD_OVERLAP_WORST same pathmap x infopanel overlap 324x216 px (3rd film in a row); (c) §INTERIOR_LIGHTS_WITNESS PASSED (pool 110->122/122 lit past topout) then FAILed ONCE at +2069 s with poolLit=0/122 — one frame-sample, unattributed; (d) NEW: §CLI_BAKE_POSECHECK maxErrVsOverridePlanM=75.85 (MISMATCH), meanDistVsDerivedPlanM=46.7 "the stored path, not the derived one" — the baked camera path differs from the derived plan by up to 75.9 m; not explained in the log, needs an owner (may be by design for an authored path; unproven).
- HOSPITAL: NOT baked yet (queue stopped; red1: resume in a new session, "do not start"). Reviewer pick-up when it lands: (1) §GI_FILM done errFrames=0 gpuErrors=0; (2) sidecar occluderTris ~5.8M, NOT 0, key 21324567:90186, §ZONE_IDB_CACHE hit WITH the 18,841 names; (3) same ffmpeg scan: `ffmpeg -nostats -i <mp4> -vf "blackdetect=d=0.2:pix_th=0.10,freezedetect=n=-60dB:d=1.5" -an -f null -` expect 0 black_start / 0 freeze_start, confirm the scan reached the last frame; (4) the FAIL lines below (§2 items 9-11); (5) luma frames 2345-2360 (the 10-01 flash 105.7 -> 87.8 -> 110) via §FRAME_QA, not by eye. Record the numbers here as a new TERMINAL-style bullet.
- Count note: reviewer grep found 39 §CPE_REVEAL_LEAK lines (all ARC:74) in the Terminal log; the Alt+C resume says 47. Likely counting method (§CLAIM echoes vs [con] lines); the leak size ARC:74 is the same either way — re-count with one stated command before quoting.

## 2. OPEN ITEMS (from §RESUME 08:30 L39-50, status per later sections)
1. BOUNCE SPLIT: CLOSED. Root cause = GPU out-of-memory (§3); C1-C4 BUILT v1534, STALE rule amended v1543.
2. LIGHT FIELDS: the furniture change was REVERTED on fix/sky-surface (233b6295, key 21324567:90186) but fix/fast-bake still carries it (key 1b214d46:90224) until the post-Terminal merge. HHS/Terminal _silent sidecars at 1b214d46 exist (Alt+S, 02:0x) and are used by the running queue; the Alt+S session rebakes all three _silent sidecars at 21324567 (Hospital first). Over budget, shellSoup drops ALL occluders (Hospital occluderTris=0) — the 10-01 1417 Hospital film carries it.
3. LAMP DATA REBUILDS ~every frame (283 x ~220 ms + cove/IR): films feed the frustum-picked `needed`; feed all placed fixtures as Alt+S does. Expected p50 3.3 -> ~2.6 s/frame. §INTERIOR_LIGHTS_WITNESS counts only the pool (FAIL poolLit=0/122 while 122 data lamps lit).
9. §CPE_REVEAL_LEAK: the reveal round leaks ARC meshes it hid (Hospital 10-01: 48; HHS 10-02: 17, 58 lines; Terminal 10-02: 74) — open, not investigated; grows with building size. Slots seen: ghost:MEP, tail-one:MEP, tail-all:MEP with hiddenDiscs=[STR,ARC].
10. §HUD_OVERLAP_WORST hud.pathmap [1566,30,324,216] x loadpath.infopanel.near overlap 324x216 px: FAILs in the Hospital 10-01, HHS 10-02 and Terminal 10-02 films — a standing on-screen layout bug in every film; open, not investigated (reviewer take §1R).
11. §CLI_BAKE_POSECHECK Terminal 10-02: maxErrVsOverridePlanM=75.85 MISMATCH, meanDistVsDerivedPlanM=46.7 ("the stored path, not the derived one") — baked path differs from the derived plan; may be by design for an authored path, UNPROVEN; check HHS's value too before deciding it matters.
12. Finish line for the showcase film (reviewer proposal, red1 to confirm): per film 0 black/0 frozen, §GI_FILM errFrames=0, and items 9-11 each fixed or proven a false alarm; then stop tuning the look. Audience (red1): long-tail DIY BIM users; first look matters.
10. §FREEZE_ANIM on short freezes: HHS's 6 s freeze never printed a settle line (two-stack reveal + 0.5 s CCTV stagger); scale the stagger to the hold.
11. §GI_FILM_CARRY flash check: §FILM_GATE_EXPOSURE_SNAP fired but the 15-frame slice moved the meter only 0.075 EV (full film: 0.81 EV); a 1-frame
    -4 luma dip stays at the switch (render-level). Prove on the Hospital full bake.
4. Torch vs eye light: both on; red1 "Keep if the impact is better" — unjudged. Twins: relax signature (class sequence) if wanted.
5. N1 exterior shadow base gap at the wing: re-judge on a v1530+ whole-building clip (§FILM_SHADOW_EDGE range 917 m, nb 0.22 m). The judged clip was baked at v1527, BEFORE §FILM_SHADOW_EDGE (v1530) L314-315.
6. §FILM_INHERIT is ON only on whole-building frames; per-zone switch (F5) for build-up not built.
7. Unbuilt: §RESOLVE_BY_BUILDING (§4), FB3/FB4 (§5), S1 (§6). (§GI_FILM_CARRY C1-C4 BUILT; S4 built per §6.)
8. Dark passage frames 1106-1136 (red1 asked, study only) L311: torch on (450 lm), exposure adapts ~1 EV/s capped down, passage needs ~7 EV in ~2 s -> luma 3-12; `LightLaw.ADAPT` decides.

## 3. §BOUNCE_SPLIT ROOT CAUSE + §GI_FILM_CARRY SPEC (2026-10-01) L76-96
- CAUSE (measured, not the lamps): the 0733 bake's bounce renderer ran OUT OF GPU MEMORY. A parallel stills session (scratchpad 4a28e70a/c1, shots.sh, Alt+S bounce stills, same RTX 4060 8 GB) logged at 07:38:17 `§GI_CARRY verdict=FAIL gpuErrors=60781 ... VK_ERROR_OUT_OF_DEVICE_MEMORY`; the bake built its bounce engine 07:37:08-07:38:21.
- Why it ran together: shots.sh holds /tmp/claude-1000/gpu.lock; scripts/bake_hires_offline.sh does NOT (no flock).
- Why the film saw nothing: build() replaces renderer.onError (gi_still.js ~621), muting three.js's "Uncaptured WebGPU" line; filmFrame never read the error count; the still's §GI_CARRY has no film twin.
- Symptoms explained: §GI_ROW_PROBE top=0 bottom=0, texFlip no difference, stale geometry pass = frozen bottom 43% from frame 1. Proof it is the engine: same 30 frames with `&filmbounce=0` -> bottom changes every frame (11.5 luma/frame, 0 frozen) L40-42.
- v1532 lamps-ON is CLEARED: repro at v1533, frames 1065:1095, lamps ON from f=0: §GI_STILL_ORIENT_GEOM asRead=0.04% (= the good 0655 clip), §GI_FILM_CARRY gpuErrors=0, no STALE. (The bad bake read asRead=79.88% / reversed=77.84%.)
- BUILT v1534 (gi_still.js filmFrame, bake_hires_offline.sh). Witness: a real OOM at build -> §GI_FILM_CARRY f=1 FAIL gpuErrors=5 -> §GI_FILM_REBUILD -> rebuilt 63 s -> f=2 OK (scratchpad 9e876aa6/bs/st.log). AMENDED v1543: STALE counts only when the camera moved — inside the load-path freeze a frozen camera gives identical passes (HHS 10-02 02:15: 3 false STALEs, 0 GPU errors, bounce OFF for 74%); re-run HHS 02:30 held the bounce through the freeze. Forced-drop rebuild crash seen 10-01 was the test switch left on through the rebuild (fixed, test-only). SPEC as built (each a § line): C1 §GI_FILM_CARRY per frame (WebGPU errors since last frame + pass fingerprint vs last; equal = STALE) + §GI_FILM_CENSUS on frame 1. C2 self-heal: FAIL/STALE frame shows the app frame WITHOUT bounce, disposes and rebuilds next frame; max 2 rebuilds per film, third -> §GI_FILM_OFF reason=gpu-failures; witness = forced-drop run (`__GI_STILL_INJECT_GEOM_DROP`). C3 a §GI_ROW_PROBE that drew nothing is not an answer (not stored in `__giOrientDecided`; no orientation measured with GPU errors goes to §GI_ORIENT_CACHE, since localStorage outlives the page). C4 scripts/bake_hires_offline.sh runs node under `flock /tmp/claude-1000/gpu.lock` (§BAKE_SCRIPT logs the wait).

## 4. §RESOLVE_BY_BUILDING — next abstraction (2026-10-01) L67-74
- Building-agnostic today: §FILM_BLANK_FRAME, §FILM_GATE_EXPOSURE_SNAP, §GI_FILM_CARRY + gpu.lock, freeze panels (any IfcSpace/compiled room set; INCONCLUSIVE when none), saved day-counter corner.
- NOT agnostic: per-DB artifacts keyed on the DB FILE NAME: patches/<db>.sql (§IFC_SURFACE_NAMES, georef, raster) and patches/<db>.lightfield.bin.
- Measured cost: Hospital_meta got the surface names, Hospital_silent film did not (fixed by hand, 18,841 rows); HHS/Terminal _silent had no sidecar; Hospital_silent sidecar went stale silently.
- SPEC: resolve by building identity (the `bld=` the §LIGHT_FIELD_DB line prints), not file name; the § line names the file taken and why; key mismatch stays a logged rebuild. Owner: scene.js `_applyPendingPatch` + the light-field loader (Alt+S lane) — coordinate.
- Partial fix already built: §FILM_INHERIT I1 `A._lightFieldByBuilding` (scene.js, main.js) fetches patches/<activeBuilding>_meta.db|_extracted.db.lightfield.bin L193-196. Measured gap before it (§POC_BAKE L131-133): film DB HospitalAjaibPath.db found no sidecar (404, reason=no-table).

## 5. §FILM_INHERIT + FASTER BAKE (2026-09-30 → 10-01)
### 5a. §FILM_INHERIT (fix/fast-bake, built; sw v1518-1519) L190-209
- GOAL: film calls the SAME Alt+S SourcedLight; film adds only a per-frame GATE. I1 field by building; I2 stage `(!A._maxqActive || A._filmParity) && SourcedLight.stage` (lifts showstopper S2); I3 per-frame gate (cinema_maxq.js `A._filmGeomWhole` -> effects.js `A._filmParityStep` -> `SourcedLight.filmGate`, uniform uSLParams.x on only while whole building on screen: no build-up, no storey reveal); I4 portals park at intensity 0 under the field. `&filminherit=0` = control.
- Known kept difference: film uniform budget still reserves portal slots, so its lamp cap is lower than Alt+S's (named, not smoothed).
- NOT YET: F5 build-up-aware field (per-zone enclosedFrac(t)). On Hospital_silent the gate is ON only from relightFrac 0.959 (last 4%).
- Witness a90 (2026-09-30 23:05) L210-217: I1 found the sidecar by building (key 21324567:90186) and restored it, BUT §ZONE_IDB_CACHE missed "geometry changed" (path db differs from Hospital_meta by mm in bounds; 20556.206 vs 20581.83 in one sum) -> full build: §SKY_VIEW_FIELD sweepMs=117408, §SOURCED_LIGHT ms=160393. I2/I3/I4 work. 0 WebGPU/pageerror/unconverged. §FILM_INHERIT_GATE logs only a CHANGE, so printed nothing (fix: log the first call).
- Mid-clip 2026-10-01 01:33 L218-226 + CONTROL L227-235 (Hospital_silent frames 1116:1326, 960x540): gate ON at f=0 (whole=1, topoutU 0.3607), OFF at f=250 (discs-hidden:ARC+STR). RETRACTION: the "x5.5 shader cost" was WRONG; control also runs 13.5 s/frame in that window (pre-existing). Real inheritance cost: Hospital_silent wall 3579 vs 3452 s (+3.7%); HospitalAjaibPath 90 f 3.0-3.6 vs 2.1-2.5 s (+45%, 4.9k meshes). Luma gate-ON window mean 116.6 (inherit) vs 126.4 (control), dark% 23.5 vs 20.4, per-frame |dLuma| up to 105 = Alt+S model visibly changes the film; gate-OFF window 128.5 vs 127.9, max |dLuma| 10.9 = off equals the old film. Dark frame i=1202 dark in BOTH (load-path shot). HUD pathmap x loadpath.card overlap FAILs in BOTH (pre-existing). 1 unconverged frame in the inherit arm (i=242 timeout).
- Per-path-db sidecars are needed for parity, not only speed: an in-bake rebuild skips EXACT_ALL (160 s) = NOT the Alt+S field. Sidecars baked: HospitalAjaibPath.db (6,930,474 B, 38 min), Hospital_silent.db (6,912,376 B, 39 min, EXACT_ALL) L225-235.
### 5b. §FAST_BAKE (fix/fast-bake @68771ccf, sw v1517) L135-189
- A/B v1515 vs v1478, same command (Hospital 90 fr, 1280x720): steady frame ~2.3 s p50 UNCHANGED; wall 442 -> 504 s; nothing broken. ~55% of a bake is setup before frame 1.
- Setup breakdown (v1515): page load 37.7 s; sky-portal classification 70.8 + 53.0 s (staged twice) = 124 s = 36% of setup; bounce-engine copy 66.3 s (1537 chunks, 40 ms UI budget). No frames-1..16 warm-up exists (correction: §FRAME_COST is a running mean including frame 0).
- BUILT FB1 (portal cache per BUILDING, `filmCache` keyed on visible glass) + FB2 (`anyHit()` first-hit ray instead of full intersect): Hospital 90 fr 504 -> 385 s. §FAST_BAKE_WITNESS (`&portalwitness=1`) PASS panesJudged=462 mismatches=0 on both arms. WebGPU errors/pageerror/unconverged 0.
- NOT BUILT: FB3 persist pane sides in the sidecar (-27 s); FB4 bulk bounce-engine compile (64-66 s, measure first); FB5 draft-bake 960x540/taa 4 (look-changing, ask red1).
### 5c. §IDLE_PREWARM STUDY + §PREBAKE (2026-10-01) L236-272
- Existing pattern to copy: effects.js:2125 §PHOTO_PREWARM; time_machine.js:9828 tmWarmXrayElements. A headless bake has no idle user, so the same work must come PRE-BAKED (sidecar) or from a persistent browser profile.
- Setup costs on Hospital_silent (before frame 1 at ~620 s): load-path shot search 155 s (pure data, pre-bakeable); bounce copy 62-66 s (GPU, per page); first bounce frame/shader ~60-75 s (GPU pipeline); window classification 27 s (pre-bakeable); light field <1 s (was 160); page+DB load 38 s.
- §PREBAKE built (bim-ootb fix/fast-bake sw v1524): sidecar `buildings/patches/<db>.prebake.json` (gitignored). PB1 load-path shot (cpe_load_path.js `loadPathBuild`), PB2 window sides (sky_portal.js). HIT only if key matches and stored winner guid equals items[winner].guid; anything else = compute as today (logged reason). `&prebake=0` ignores; `&prebakecheck=1` compares -> §PREBAKE_CHECK PASS|FAIL. Node witness viewer/tests/witness_prebake_loader.js 8/8 PASS.
- §CHECKPOINT T1 2026-10-01 06:24 (sw v1530, Hospital_silent 1150:1215 + freeze): PB written (294,359 B); portal recomputed (key mismatch, different visible glass at this tn). First real use of the written file still pending.
- Still unverified in a browser (header says "NOT run in a browser yet" as of the §PREBAKE entry): the expected next-bake lines `§PREBAKE loadPath src=sidecar`, `§PREBAKE portal src=sidecar`, one `§PREBAKE_CHECK PASS`.

## 6. §FRAME_COST STUDY (2026-10-01) L273-308
- NORMAL frame (960x540): 1.9 s p50 = still-refine 8 samples 0.76 s + AO fold 12 renders 0.66 s + capture/HUD/encode 0.30 s + ~0.2 s other.
- FREEZE frame was ~13 s (x8): §LOADPATH_BATCH_UNPACK containers=4872 elements=63059 turned 4,983 held objects into 73,797 (~69k draw calls x 20 renders/frame) — cpe_load_path.js:815-840, §129 FIX 3.
- BUILT: §LOADPATH_STACK_ONLY (freeze 13 s -> 0.45 s/frame; §FRAME_REUSE_TOTAL 118/230; §LOADPATH_HOLD cameraMoved=false PASS; §LOADPATH_RESUME stepAtResume=0.0000 PASS). S5 AO 12 -> 8 (NOT 6: 8/8 is the measured row in `cinema_maxq.js` §MAXQ_FRAME_BUDGET, RMS 0.37; 6 never measured), ~0.2 s/frame, ~10 min per Hospital film. S4 §LOADPATH_PIXEL_DIAG_PRE_HUD now freeze-frames only.
- NOT BUILT: S1 (white override pass without un-batching): not built blind because the un-pack exists since container colour changes on BatchedMesh never reached pixels (cause never found). First GPU step: log whitened pixels on 3 freeze frames with un-pack vs container-material white.
- CHECKPOINT T1 facts: §FILM_SHADOW_EDGE range 916.8 m (was ~19,748 m), normalBias 0.2209 = (R+1.5) texels; §FILM_GLASS_ENV capture#1 405 ms once; §WINDOW_PULL skipped by its own rule (outside 1.156 >= inside 0.47); §MIRROR_OWN_MAT never applied (no mirrors in view); lamps=0 inside the §116 interior-lights-off span (film's own rule).

## 7. CONTRADICTIONS / STALE SPOTS IN THE ORIGINAL — RESOLVED by the Alt+C session 2026-10-02 03:25
- sw version: v1543 is current; §RESUME 08:30's v1533 is the 10-01 morning state (superseded, §1).
- §RESUME item 2 (rebake after §SKY_FIELD_FURNITURE): superseded — the change was reverted on fix/sky-surface; see §2 item 2 for which key each branch carries.
- §RESUME item 1 L43 next-step ("read gi_still.js engine start vs lamp data / glow"): stale — the lamps were cleared by repro; root cause = GPU OOM; item CLOSED (§2 item 1).
- Line-number inventories (§STILL→FILM table L105-111, §1 inventory L339-375): HISTORICAL — cite trees 5c48105a / v1515; do not use their line numbers. Row 13 "Films have NO zone binding" is superseded by §FILM_INHERIT I2 (films stage SourcedLight on whole-building frames). Current file:line for the `installed()` sites: effects.js:4465 (`_calibOn`), sky_portal.js:116/132/176 (F0 item's effects.js:4167 / sky_portal.js:141 are old).
- `installed()` leak claim (§2 VERDICT L392-400): STILL UNMEASURED. Code-read 2026-10-02: `SourcedLight.installed()` is true whenever the module is loaded (staged or not), so films reach those four sites; whether a film then takes the physical lamp scale is not shown by any film log. Stays an open F0 item.
- §MEP_SERVICE_COLOUR in films: applied at material creation (streaming.js:777/847), no film gate, so films get it by default — but it prints NO § line (0 in the 10-01 Hospital and 10-02 HHS film logs): code-read, unwitnessed in films.

## 8. DESIGN SPEC F0-F8 (2026-09-25, UNBUILT unless §1-§6 say otherwise) L412-603
Frame: bind light to the WORLD (zones/probes/stable cascades), render each film frame like a still. All witnesses are node maths or one § line per frame. F-numbers below are the original's.
- F0 gate hygiene: a step is `!A._maxqActive` (still only, must not leak) or `(!A._maxqActive || A._filmParity)` (carried). `installed()` tests that decide a LOOK value (effects.js:4167, sky_portal.js:141) become `SourcedLight.isActive()`. Witness `witness_film_gates.js` (STILL_ONLY / CARRIED / LEAK; LEAK target 0).
- F1 light set as WORLD data (clustered shading, zone = cluster): one LIGHT TABLE per film from the finished building (`§FILM_LIGHT_TABLE`), fixed light-object pool, zone-driven (not frustum-driven) assignment with hysteresis (D_in < D_out) and an F-frame fade (F = 12 at 24 fps, "a choice to log, not a tuned number"); nothing steps 0<->full. Witness `witness_film_light_table.js`: constant point/spot count, max |dw| <= 1/F, crossWall = 0; per-frame `§FILM_LIGHTS` with `programs=` constant after frame 0.
- F2 shadows (stable CSM, Valient + PSSM): per-shot fixed far box (built: §FILM_FIT_PER_SHOT), per-shot depth range + sphere fit + a second near-cascade light; per-shot `d_ref` for portal bias. WAITS for §STILL_SHADOW_EDGE (same functions). Witness `§FILM_SHADOW` per frame.
- F3 exposure: fixed 0.383 per film today, or the still's meter once per shot; never per frame. Watchdog add: a continuous outside<->inside shot needs a time-limited ramp at a CITED rate (opt-in `--exposure-ramp`, last). Crossing-shot test path poses (red1 approved 2026-09-25) L513-517: outside `…1790319885328` cam [-5.529,-0.544,-42.321] -> café `…1790320117679` cam [-7.990,-7.785,-24.269], target [4.014,-6.761,2.325]; today it would FAIL (0.383 outdoor exposure holds, café stays at outside look).
- F4 bounce: N spatial sub-passes per frame (`--bounce-passes N`, cost 53-61 ms/pass HHS 720p, Terminal 1080p +0.13 s/pass; N=4 ~ +0.5 s/frame arithmetic only, not measured); DDGI = later F4b; temporal reprojection rejected (ghosting, warm-up at every cut). Witness `§GI_FILM f= passes=N ms= passVar=`.
- F5 4D build-up: zones from the FINISHED building; enclosedFrac_z(t) = placed boundary faces / all; lamp on at its placement ts with an F-frame ramp; pane by placed area fraction. Witness `witness_film_buildup_lights.js`. (= the "NOT YET F5" of §5a.)
- F6 moving sun: per-frame uniforms already; replace the 6° daylight-glow step with a 2° ramp; inside test = zone test with hysteresis, not up-ray. Witness `§FILM_SUN`.
- F7 determinism: keep the LCG (cinema_maxq.js:700-706), re-seed per frame from (film idx, frame idx), SSGI frame id = frameIdx x N + pass, log `seed` in §STILL_POSE. Witness: bake the same 5 s clip twice, `§FILM_HASH` all pairs equal.
- F8 shader programs compiled once per film: `renderer.info.programs.length` may change only at frame 0 (111 s first frame).
- ORDER (§4 of the original L605-633): F0 + leak check -> F8/F7 instruments -> F4 sub-passes -> F1 + F5 -> F3 -> F6 in parallel with Alt+S lanes. WAIT for Alt+S: F2 (§STILL_SHADOW_EDGE), F1 zone BINDING in films (§ZONE_OPEN_SKY + §SOURCED_DAYLIGHT, else films go black indoors as exteriors did at v1337), the fill-default flip (red1's call). Then re-cut parity clips (Terminal facade, Hospital interior, 5 s, 1080p24, control + parity) with per-frame lines and the cost projection before any full film.
- Open decisions (L635-641): F (12 frames) and D_in/D_out fixed from the first clip's `§FILM_LIGHTS` churn line; film shadow radius (1 vs the still's 1.5) decided with F2; eye light in films (off under parity once F1 binds zones; until then part of the judged eb3a41c1 look).
- Still-vs-film gaps measured in the old inventory that remain unrecorded as fixed: film ground reads warmer/darker than Alt+S at the same pose/sun (cause not found; 85 ground uniforms equal) L344; frame-reuse key carries no lamp/portal state L370; lights-off window covers 60.6% (Hospital) / 74.5% (Terminal) of the film L372; Alt+S fill default RESTORE flips under red1's principle 1 (red1's decision).
