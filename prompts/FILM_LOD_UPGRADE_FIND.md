# ⚠ DO NOT REMOVE
SCOPE: ONE film. The Palm Jebel Ali Mosque (PJAM; name released by the owner 2026-11-18) on canvas: first the Modeller's own LOD feature (layer split drawn per layer), then the Viewer's Find panel locating each kind of added work and flying to it. House style: `prompts/FILM_NARRATION.md` (split screen, typed line + REAL key sounds, voice after return, two-colour cover card, last card with prior art + credentials + guide link, lower frame cropped/zoomed to the part that changes). Read the log after every run; the exit code is not evidence. Films are never pushed; only scripts and this file are.

## ▶▶ RESUME HERE FIRST (2026-11-18, session bim-compiler-a3): rc4 BUILT, waiting for the owner's review
rc4 = `~/Videos/film_lod_upgrade_find/LOD400_Upgrade_Finding_the_added_work_EN_rc4.mp4` (196.7 s; §FILM rc4 RESULT at the end). It closes the owner's rc3 review (§FILM rc4 SPEC S1-S6). The guide section is LIVE: https://red1oon.github.io/BIMCompiler/ModellerGuide/#upgrade-add-rule-based-detail-lod-400. Next: the owner's notes on rc4. Open in the private lane: the Python generator's weld caps (bim-ootb #3276 fixed the JS).

## ▶ RESUME HERE (2026-11-18, design session bim-compiler-28)
- **Gaps:** G1 CLOSED (`JPAM_film.db`, 679 added, SHA d6f6a992). G3 CLOSED (terms below). G2, G4a and G4b are being fixed in bim-ootb, one PR each, from the specs S-G2 / S-G4a / S-G4b in this file. Capture (G5) waits for them.
- **Beat 2 decision (design lane):** there is NO in-Modeller "upgrade LOD" button. The upgrade IS the rule scripts. So beat 2 uses the house split screen as intended:
  - the top strip types the real commands (`build_jpam.py`, `rebar_from_schedule.py --schedule-json ...`, `gen_gussets.py`) with their § verdict lines;
  - the bottom shows the Modeller on the result, once S-G2 lands.
  
  A missing in-app button is stated plainly, never implied.
- **Find terms:** while S-G4b is open, type single words: `layer` 220 · `plate` · `bolt` 51 · `fillet` 51 · `reinforcing` 306 · `gusset` 2.
- **Card rule:** the rebar card must not say "matches the schedule everywhere": §PJRB_STATED FAILs on 2 beams.
- **GPU:** peers bim-compiler-8e and bim-compiler-f8 acked give-way; 9b has not replied. Message all three "capture done" afterwards.

## Owner brief (2026-11-18, verbatim)
*"Do a film, showing the Jebel mosque on canvas and how the Find can locate the added work, smoothly navigating to each. Ensure illustration is clear or zoom into frame for legibility of the Find panel. Show first the Modeller side, feature that upgrades LOD. Fix any gaps before that. Ask other sessions to give way if you need the GPU."*

## Gaps to close BEFORE any capture (each: measure, fix or record, § line)
- **G1, one DB with all the added work.** Today it is spread over `JPAM.db` (220 layer parts + 150 connection parts), `JPAM_rebar.db` (306 beam bar sets) and `JPAM_gussets.db` (1 gusset joint, 3 parts). Build `JPAM_film.db` = JPAM.db + the rebar and gusset rows, with `upgrade_changes` merged and renumbered. Witnesses: IDENT (no original row changed) and COUNTS (= 220 + 150 + rebar sets + 3), on a copy.
- **G2, the Modeller shows the upgrade.** Measure which DB the Modeller draws per layer: §LAYER-GATE needs `component_geometry_layers` (`modeller/arc_editable.js:119-145`). Open the candidate in the real Modeller (headless) and read its §LAYER-GATE / per-layer lines: how many hosts were drawn as layers? If the Modeller cannot show the upgrade on PJAM, that is a gap to report with the measured reason. Do not fake it with the Viewer.
- **G3, Find terms that hit each kind**, measured as the panel's own SQL (`viewer/nf_panel_search.js:363`) on JPAM_film.db:

  | Term | Finds |
  |---|---|
  | `layer` | 220 layer parts |
  | `Fin plate` | 50 fin plates |
  | `bolt assemblies` | 50 bolt groups |
  | `fillet welds` | 50 weld groups |
  | (rebar name term, to be read from the rebar set names) | the beam bar sets |
  | (gusset name term, to be read) | the 1 gusset joint |

  Find returns at most 50 rows. Each kind's first hit is the one flown to.
- **G4, fly-to and the parts view.** Clicking a Find row flies to that element (read its § line). The parts view (bim-ootb #3223) hides the hosts that have parts, so layer pieces are visible (`§PARTS_VIEW hostsHidden=88 partsShown=220` expected on load).
- **G5, legibility.** Capture at device scale 2. Each Find beat is cropped/zoomed to the Find panel + result list, then to the flown-to element.

## Beats (each typed line is the Find text, typed with real key sounds; voice after Enter)
1. Cover card: `LOD 400 UPGRADE  ·  CH 1` / "Finding the added work" / "Palm Jebel Ali Mosque · rule-based detail on the author's own model".
2. Modeller: the mosque opened; per-layer walls (if G2 passes; else the measured gap is stated on a card, not hidden).
3. Viewer: the whole mosque. Find `layer`: 220, fly to one wall's layers (parts view on).
4. Find `Fin plate`: 50, fly to a joint under the roof.
5. Find the rebar term: fly to one beam's bars.
6. Find the gusset term: the 1 joint built. A card states that 56 of 57 brace ends were refused, and why (from `§GUS_COUNTS`).
7. Last card: prior art read, credentials (#3219, #3223, #910, #919, #924, §9 PR, witness verdicts from the logs), key-sound credit, guide link (checked `§FILM_GUIDE`).

Wording: "configuration only, capacity not checked" wherever steel joints are on screen.

## GPU rule
Before any GPU render, message the busy peer sessions to give way. Run `nvidia-smi` before and log it. Never render beside a live user bake. Software GL (swiftshader) is the fallback.

## GAP SPECS 2026-11-18 (written BEFORE any code; each is a change to shipped bim-ootb code, so none is made here)
Source of every cited line: bim-ootb `origin/main` @ e3ee5436. Each spec names the issue it proves or disproves.

**S-G2, the Modeller draws the 220 layer pieces beside their 88 whole hosts, and draws none of the steel/rebar parts.**
- Issue proved: the Modeller has no parts view. Its ARC seed takes every `discipline='ARC'` row (`modeller/arc_editable.js:263`), so a host and its layer parts are both seeded and overlap; the STR/MEP parts (fin plates, bolts, welds, rebar, gusset) are not ARC and are not seeded at all. `§LAYER-GATE` (`arc_editable.js:119-155,461-463`) only arms when the opened DB has `rel_material_layer_set`; it refuses envelope-only hosts, it does not split anything. Per-layer solids exist only inside a Cut (`§LAYER-SOLID-SEED`, `bonsai_kernel_worker.js:358-400`) and are fused into ONE solid.
- Spec (ONE implementation, no second hide rule): the Modeller seed calls the Viewer's pure `partsKeepSet(rows, all)` (`viewer/parts_view.js:14-27`) on `element_parts` and does not seed a host that has at least one child present; it logs `§MOD_PARTS_VIEW hostsHidden=N partsShown=M`. Parts of any discipline that a host owns are seeded when `element_parts` links them (not only ARC).
- Witness claim (names the issue): opening the film DB in the headless Modeller must print `§MOD_PARTS_VIEW hostsHidden=181 partsShown=529`, and the seeded set must contain 0 of the 181 hosts and all 529 parts. The current baseline, measured below, is 88 hosts + 220 parts seeded together and 0 of 309 non-ARC parts.
- Until this lands the film cannot show beat 2 as written: use the allowed fallback (the measured gap on a card), or shorten beat 2 to what the Modeller does show (the open model with 1755 ARC elements).

**S-G4a, opening the Find panel cancels the parts view.**
- Issue proved: `A.openFindPanel` runs `A.filterByGuids(null)` on every open (`viewer/nf_panel_search.js:88`, the "fresh open clears any prior isolate" rule), so the parts view that loaded with the DB (`hostsHidden=181`) is gone the moment the Find opens and the 181 hosts cover their parts again. `parts_view.js` keeps `_on` set, so `A.partsView(true)` then returns early and cannot re-apply (`parts_view.js:41-46`).
- Spec: Find's "clear prior isolate" restores the parts-view isolate when it is on (a `A.partsViewKeep()` accessor, or `A.partsView` re-applies instead of returning early); a Find-made isolate is still cleared. Logs `§PARTS_VIEW kept_over_find isolate=N`.
- Witness claim: after `openFindPanel`, `A.activeGuidFilter.size` = 7137 - 181 = 6956 (now `null`); after a result click the picked guid is in the isolate.
- Film workaround that needs no shipped change (harness only, stated on screen as nothing): after Find opens, call `A.partsView(false); A.partsView(true)`. Measured below: isolate 6956 kept through the search and the click.

**S-G4b, the space key is swallowed in the Find box.**
- Issue proved: while the Find panel is the focused panel, `scene.js:3565-3567` routes `' '` (no modifier) to the panel nav and `preventDefault`s it, with no `notInput` guard (the guard variable exists at `scene.js:3539` and is used by the Tab and Backspace branches). Typing `Fin plate` leaves `Finplate` in the box and finds 0. Every multi-word term in G3 (`Fin plate`, `bolt assemblies`, `fillet welds`) is affected, and so is any user typing a phrase.
- Spec: add `notInput ||` handling so a space typed into an INPUT/TEXTAREA is not routed (arrow keys keep their routing only as today). No other key changes.
- Witness claim: typing `Fin plate` into the Find box leaves exactly `Fin plate` and the panel reports 50 found (now `Finplate`, 0 matches).
- Film workaround that needs no shipped change: single-word terms (`plate`, `bolt`, `fillet`), measured in G3 and G4 below.

## GAPS RESULT 2026-11-18
Logs are private (outside this repo), under `lod_sandbox/jpam/log/`: `film_db.log`, `film_g2_modeller.log`, `film_g3_find.py` (prints its own § lines), `film_g4_viewer.log`. Builder: `lod_sandbox/jpam/build_film_db.py`. Headless runs: software GL only (swiftshader), no GPU used, no `nvidia-smi` needed. The standing sandbox server on port 8399 did not answer and `/tmp/wt-sandbox` is gone, so the runs used a read-only `git archive origin/main` export in the session scratch folder served on a private port (not a worktree).

**G1: CLOSED.** One DB, same SHA on two runs (`d6f6a992817cf8dc`).
```
§FILMDB_IDENT RB_old_rows_equal_base=True GU_old_rows_equal_base=True film_old_rows_equal_base=True RB_added_rows_equal_source=True RB_geometry_bytes_equal_source=True RB_rtree_equal_source=True GU_added_rows_equal_source=True GU_geometry_bytes_equal_source=True GU_rtree_equal_source=True changes_prefix_equal_base=True changes_tail_equal_sources=True changes_seq_contiguous=True -> PASS
§FILMDB_COUNTS elements=7137 (base 6828) layer=220 conn=150 rebar=306 gusset=3 added_total=679 expected=220+150+306+3 rtree=7137 element_parts=529 upgrade_changes=1030 (base 563 + rebar 408 + gusset 59) -> PASS
§FILMDB_DETERMINISM runs=2 distinct_sha=1 -> PASS
```
The spec's "220 + 150 + rebar sets + 3" is 679 and holds. `upgrade_changes` 1030 = 563 + 408 (306 ADDED, 92 NOT_BUILT, 10 REFUSED) + 59 (3 ADDED, 56 REFUSED). Caution for the film: the rebar run's own verdict is `failed_witnesses=STATED` (7 bar sets differ from the schedule on 2 beams, `§PJRB_STATED ... -> FAIL`), so a card must not say the rebar matches the schedule everywhere.

**G2: OPEN (measured).** Real Modeller, headless, both candidates:
```
Jebel_ARC.db   §ARC §LAYER-GATE armed multiLayer=115 layeredHashes=88 refused=9   (+ 9 §LAYER-ENVELOPE-REFUSE) | §ARC-SEED committed=971 skipped=15
JPAM_film.db   (no §LAYER-GATE line: no rel_material_layer_set table) | §ARC-SEED building=JPAM_film committed=1755 skipped=6
JPAM_film.db   §G2_SEEDED {"total":1755,"LY":220,"CR":0,"RB":0,"GU":0,"orig":1535,"layerHostsAlsoSeededWhole":88,"layerHosts":88}
```
The gate shows only on the source model and only as a refusal; no DB is drawn "per layer" by the gate. On the film DB the Modeller seeds all 220 layer pieces AND all 88 whole hosts (overlapping), and none of the 150 fin-plate parts, 306 bar sets or 3 gusset parts (not ARC). Reason and fix: S-G2 above (needs code). Beat 2 therefore cannot show the upgrade as written.

**G3: CLOSED.** The panel's own SQL on the film DB (`LIMIT 50` shows at most 50; totals counted without it; building `Source` gives the same counts):
| Term | total | by kind | first hit |
|---|---|---|---|
| `layer` | 220 | 220 layer parts | ceiling layer, GROUND FLOOR |
| `Fin plate` | 50 | 50 fin plates | fin plate, MOSQUE ROOF |
| `bolt assemblies` | 51 | 50 joints + 1 gusset | joint bolts |
| `fillet welds` | 51 | 50 joints + 1 gusset | the gusset's welds (sorts first) |
| rebar: `reinforcing` (class IfcReinforcingBar) | 306 | all 306 bar sets | `Beam bottom bars 3 x 3T20 [stated "3T20" ...]`, EAST BUILDING T/WALL |
| gusset: `gusset` | 2 | the 1 joint's plate and bolts (its weld row has no "gusset" in its name) | the joint's bolts, MOSQUE ROOF |

Real names read: the 306 rebar sets have 122 distinct names (`Beam bottom|top|side bars N x ...`, `Beam stirrups N x T10 @ 150`, each ending `[stated ... | mark GB1 ... dxf ...]`); the 3 gusset parts are `Gusset plate 10 x 70 x 185 mm, web T ...`, `2 x M20 bolt assemblies, pitch 60, through angle leg and gusset ...`, `2 fillet welds 5 mm to support (web T) ...`. Shortest unique-to-kind term: rebar `dxf` (3 characters, 306, but meaningless on screen), word-like `reinforcing` (306) or `stirrups` (92); gusset `web` (3, 2 rows) or `gusset` (6, 2 rows). Use `reinforcing` and `gusset`. Because of S-G4b the film must type single words for the steel joints: `plate` (546 total, the first 50 shown are all fin plates), `bolt` (51), `fillet` (51).

**G4: OPEN (two defects, one workaround each).** Real Viewer, headless, JPAM_film.db opened with Ctrl+O:
```
§PARTS_VIEW hostsHidden=181 partsShown=529 elements=7137 byHostClass={"IfcBeam":92,"IfcMember":1,"IfcWallStandardCase":52,"IfcSlab":16,"IfcCovering":20}
```
The expected `88 / 220` was for JPAM.db alone; the film DB also hides 92 beams (they host the rebar) and 1 member (the gusset's brace). Fly-to works and is exact (numbers, not a picture):
```
§G4_FLY term="layer"       guid=GEN-LY-30bE...-1  target_to_element_m=0.0000 camera_to_element_m=8.83 expected_cam_dist_m=8.83
§G4_FLY term="plate"       guid=GEN-CR-...-B-PL   target_to_element_m=0.0000 camera_to_element_m=0.96 expected_cam_dist_m=0.96 isolate before=6956 after=6956 picked_in_isolate=true
§G4_FLY term="bolt"        guid=GEN-CR-...-B-BT   target_to_element_m=0.0000 camera_to_element_m=0.64 expected_cam_dist_m=0.64
§G4_FLY term="reinforcing" guid=GEN-RB-...-BOT    target_to_element_m=0.0000 camera_to_element_m=5.57 expected_cam_dist_m=5.57
§G4_FLY term="gusset"      guid=GEN-GU-...-A-BT   target_to_element_m=0.0000 camera_to_element_m=0.63 expected_cam_dist_m=0.63
```
Open defects (specs above): S-G4a, Find open sets the isolate to `null` (`isolate_size_right_after_Find_opens=null`; hosts cover their parts again); workaround `A.partsView(false); A.partsView(true)` gives `isolate_size=6956`, kept through search and click. S-G4b, the space is swallowed (`§KBD_ROUTE panel=find key=  ` then `input.value="Finplate"`, `0 matches`).
Also: the first `layer` hit is a ceiling layer, not a wall; for "one wall's layers" pick a wall row in the list (the Find shows 50 of 220).

**Blocking the film:** S-G2 (Modeller beat 2, needs code or a card), S-G4a and S-G4b (each has a harness/typing workaround that needs no shipped code). G5 (capture legibility) not started, as agreed. Nothing was edited in `bim-ootb` or `bim-compiler`.

## FILM RESULT 2026-11-18
**Output (never committed):** `~/Videos/film_lod_upgrade_find/LOD400_Upgrade_Finding_the_added_work_EN_rc1.mp4` · 153.625 s · 3687 frames at 24 fps · 1920x1080 · 15,968,509 bytes · sha256 `f8ac2b8757a4a0efcc56e5a56761a56fba07ff7d544973da8b008fa90b7ca487`. English only, two-voice dialogue (Kokoro), key sounds eklee/qubodup. Scripts: `scripts/film_lod_upgrade_find/` (capture_modeller.js, capture_viewer.js, facts.js, guard.js, cards.js, narr.js, tsv.js, beatlen.js, record.js, build.sh). Logs: `~/Videos/film_lod_upgrade_find/out/` and `.../work/logs/`.

**Beats:** cover · 4 Modeller beats (each types the real script command, copies its real § verdict lines from `jpam/log` and `conn_rules/log`, nothing re-run; the Modeller below on JPAM_film.db) · card "what the four scripts added" · Viewer whole mosque (parts view) · Find `layer` / `Fin plate` / `reinforcing` / `gusset` (real key presses into the real Find box, the Viewer's own fly-to captured frame by frame) · gusset card (1 of 57, why) · last card.

**GPU:** `nvidia-smi` logged before every GPU run (`work/logs/nvidia_smi_before_*.log`: P8, 697-771 MiB, other sessions idle). Chrome ANGLE on the RTX 4060, device scale 2 (1280x720 css). Smooth navigation = `requestAnimationFrame` replaced by a manual queue (Viewer) / `performance.now` + rAF virtual clock (Modeller): one capture = one step of the app's own animation (Viewer `animFly` t += 0.02, 50 steps; Modeller `_frameTo` 1100 ms at 1000/24 ms). `bim-compiler-8e` was not reachable by name when the "capture done" message went out; `-f8` and `-9b` were told.

### Per-beat § lines (capture)
```
§FILM_PANELS_CLOSED tm-close,clash-matrix-close
§FILM_PARTS [27.4] §PARTS_VIEW hostsHidden=181 partsShown=529 elements=7137 byHostClass={"IfcBeam":92,"IfcMember":1,"IfcWallStandardCase":52,"IfcSlab":16,"IfcCovering":20}
§FILM_ISOLATE start=6956 (6956 = 7137 elements - 181 hosts hidden by the parts view)
§FILM_SHOT beat=viewer_whole frames=1 crop=whole viewport target_guid=- target_to_element_m=- §PARTS_VIEW hostsHidden=181 partsShown=529 elements=7137 byHostClass={"IfcBeam":92,"IfcMember":1,"IfcWallStandardCase":52,"IfcSlab":16,"IfcCovering":20}
§FILM_ISOLATE after_find_open=6956
§FILM_PANEL_CHECK beat=find_layer term="layer" box="layer" count="50 found" rows=50 crop_vs_live_px=0 crop_vs_changed_text_px=385 -> PASS
§FILM_ISOLATE beat=find_layer parts of the same host: 3, host drawn: null, isolate size 3; pulled back with the wheel: camera 8.826 -> 9.386 m from the part, 43 frames
§FILM_SHOT beat=find_layer frames=94 (50 of the Viewer's own fly + pulled back) crop=scene(87,181,907,358)@1.5+panel(slices)@2.0 target_guid=GEN-LY-30bEwRvZrE1xK0cs7DmKxD-1 target_to_transform_center_m=0 target_to_geometry_m=0 camera_to_element_m=8.826 expected_cam_dist_m=8.826 steps_with_motion=49 isolate before=6956 after=6956 count="50 found" class=IfcBuildingElementPart storey=GROUND FLOOR
§FILM_PANEL_CHECK beat=find_fin term="Fin plate" box="Fin plate" count="50 found" rows=50 crop_vs_live_px=0 crop_vs_changed_text_px=318 -> PASS
§FILM_FLY_MISS beat=find_fin the Find fly ended 2.775 m from the part's own geometry (elements_rtree centre): its element_transforms.center is not the part's own centre (facts.js §FILM_CENTRE). A.zoomToGuid was tried and does not move the camera for these parts (no per-guid mesh), so no second step is filmed.
§FILM_ISOLATE beat=find_fin parts of the same host: 3, host drawn: 3D5QSRXD1ErO1q65K0AzsZ, isolate size 4; pulled back with the wheel: camera 3.424 -> 3.47 m from the part, 43 frames
§FILM_SHOT beat=find_fin frames=94 (50 of the Viewer's own fly + pulled back) crop=scene(87,181,907,358)@1.5+panel(slices)@2.0 target_guid=GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL target_to_transform_center_m=0 target_to_geometry_m=2.775 camera_to_element_m=0.964 expected_cam_dist_m=0.964 steps_with_motion=49 isolate before=6956 after=6956 count="50 found" class=IfcPlate storey=MOSQUE ROOF
§FILM_PANEL_CHECK beat=find_rebar term="reinforcing" box="reinforcing" count="50 found" rows=50 crop_vs_live_px=0 crop_vs_changed_text_px=224 -> PASS
§FILM_ISOLATE beat=find_rebar parts of the same host: 4, host drawn: null, isolate size 4; pulled back with the wheel: camera 5.573 -> 5.927 m from the part, 43 frames
§FILM_SHOT beat=find_rebar frames=94 (50 of the Viewer's own fly + pulled back) crop=scene(87,181,907,358)@1.5+panel(slices)@2.0 target_guid=GEN-RB-1ys0ZPPjX6tO0ZNAbl4tBB-BOT target_to_transform_center_m=0 target_to_geometry_m=0 camera_to_element_m=5.573 expected_cam_dist_m=5.573 steps_with_motion=49 isolate before=6956 after=6956 count="50 found" class=IfcReinforcingBar storey=EAST BUILDING T/WALL
§FILM_PANEL_CHECK beat=find_gusset term="gusset" box="gusset" count="2 found" rows=2 crop_vs_live_px=0 crop_vs_changed_text_px=397 -> PASS
§FILM_ISOLATE beat=find_gusset parts of the same host: 3, host drawn: 3D5QSRXD1ErO1q65K0AzcC, isolate size 4; pulled back with the wheel: camera 0.663 -> 0.703 m from the part, 43 frames
§FILM_SHOT beat=find_gusset frames=94 (50 of the Viewer's own fly + pulled back) crop=scene(87,181,907,358)@1.5+panel(slices)@2.0 target_guid=GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT target_to_transform_center_m=0 target_to_geometry_m=0.028 camera_to_element_m=0.635 expected_cam_dist_m=0.635 steps_with_motion=49 isolate before=6956 after=6956 count="2 found" class=IfcMechanicalFastener storey=MOSQUE ROOF
§FILM_GHOST_WATCH changes=9 [+34.6s=6956 +49.1s=3 +53.4s=6956 +64.1s=4 +68.4s=6956 +78.4s=4 +82.6s=6956 +92.1s=4 +96.1s=6956] end=6956 no empty isolate seen; session s=131.8
§FILM_VIEWER_DONE beats=4 panel_checks_ok=4/4
```
```
§FILM_WARN the Modeller still says "verifying" after 45 s (its own status text; the seed is done: §ARC-SEED line above)
§FILM_MODELLER §ARC §ARC-SEED building=JPAM_film committed=2126 skipped=6 disc=ARC idempotent=false
§FILM_MODELLER §ARC §MOD_PARTS_VIEW hosts=181 hostsHidden=88 partsSeeded=529 generatedSeeded=150 (a host with present parts is not seeded: its geometry IS its parts; non-ARC parts of any discipline are seeded)
§FILM_SHOT beat=mod_start frames=1 crop=whole window target_guid=- target_to_element_m=- (Zoom to fit)
§FILM_HIDE beat=mod_conn every seeded feature but the joint's own 3 parts is hidden: features_hidden=2123 (the Outliner eye's own call, Bonsai.setFeatureVisible)
§FILM_SHOT beat=mod_conn frames=28 crop=window band(0,181,1280,358)@1.5 target_guid=GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL target_to_element_m=0.004 transform_center_to_geometry_m=2.775 selected=true hidden=2123 seeded={"fid":true,"anchor":false} §FRAME_FEATURE fid=1506 centre=[-4.88,8.77,9.12] dist=3.60
§FILM_SHOT beat=mod_layers frames=28 crop=window band(0,181,1280,358)@1.5 target_guid=GEN-LY-0HXMLqIt99pQaffYvMYxGm-2 target_to_element_m=0.0046 transform_center_to_geometry_m=0 selected=true hidden=0 seeded={"fid":true,"anchor":false} §FRAME_FEATURE fid=1605 centre=[44.64,6.32,1.75] dist=11.54
§FILM_SHOT beat=mod_rebar frames=28 crop=window band(0,181,1280,358)@1.5 target_guid=GEN-RB-1ys0ZPPjX6tO0ZNAbl4tBB-BOT target_to_element_m=0.0037 transform_center_to_geometry_m=0 selected=true hidden=0 seeded={"fid":true,"anchor":false} §FRAME_FEATURE fid=2029 centre=[10.81,-17.52,-1.19] dist=8.37
§FILM_HIDE beat=mod_gusset every seeded feature but the joint's own 3 parts is hidden: features_hidden=2123 (the Outliner eye's own call, Bonsai.setFeatureVisible)
§FILM_SHOT beat=mod_gusset frames=28 crop=window band(0,181,1280,358)@1.5 target_guid=GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT target_to_element_m=0.0044 transform_center_to_geometry_m=0.028 selected=true hidden=2123 seeded={"fid":true,"anchor":false} §FRAME_FEATURE fid=1598 centre=[-1.07,-10.13,9.01] dist=3.60
§FILM_MODELLER_DONE beats=4 all_target_to_element_within_5cm=true
```

### Facts read (not typed)
```
§FACTS §FILM_CENTRE GEN-CR- parts=150 element_transforms.center to the part's own bounds centre: min 1.068 median 3.415 max 3.711 m; over 0.5 m: 150
§FACTS §FILM_CENTRE GEN-GU- parts=3 element_transforms.center to the part's own bounds centre: min 0.019 median 0.028 max 0.053 m; over 0.5 m: 0
§FACTS §FILM_CENTRE GEN-LY- parts=220 element_transforms.center to the part's own bounds centre: min 0.000 median 0.000 max 0.000 m; over 0.5 m: 0
§FACTS §FILM_CENTRE GEN-RB- parts=306 element_transforms.center to the part's own bounds centre: min 0.000 median 0.000 max 0.000 m; over 0.5 m: 0
§FACTS §FILM_CENTRE connection parts whose center equals their HOST BEAM's center: 150 of 150; original elements 6458, center off its bounds centre by more than 1 mm: 6
§FACTS find term="layer" total=220 by_kind={"GEN-LY-":220} shown(LIMIT 50)=50 first=GEN-LY-30bEwRvZrE1xK0cs7DmKxD-1 | IfcBuildingElementPart | *Default Metal 120.0 mm (layer 1 of Compound Ceiling:CEILING
§FACTS find term="Fin plate" total=50 by_kind={"GEN-CR-":50} shown(LIMIT 50)=50 first=GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL | IfcPlate | Fin plate 10 x 130 x 312 mm (rules: AISC 360-16 + defaults;
§FACTS find term="reinforcing" total=306 by_kind={"GEN-RB-":306} shown(LIMIT 50)=50 first=GEN-RB-1ys0ZPPjX6tO0ZNAbl4tBB-BOT | IfcReinforcingBar | Beam bottom bars 3 x 3T20 [stated "3T20" | mark GB3 S-401-SC
§FACTS find term="gusset" total=2 by_kind={"GEN-GU-":2} shown(LIMIT 50)=2 first=GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT | IfcMechanicalFastener | 2 x M20 bolt assemblies, pitch 60, through angle leg and gus
§FACTS §FILM_GUIDE url=https://red1oon.github.io/BIMCompiler/BIMUserGuide/ http=200 anchor=Y (the Find panel section only) mentions={"fin plate":0,"gusset":0,"rebar":0,"reinforc":0,"element_parts":0,"parts view":0,"rule-based":0,"LOD400 Upgrade":4} covers_the_added_work=N
§FACTS modeller committed=2126 hostsHidden=88 partsSeeded=529 generatedSeeded=150
§FACTS VERDICT PASS bad=0 lines=20
```

### Checks
```
§FILM_FRAME_CHECK beat=find_layer t=86.54s panel_count_read="50 found" video_frame_vs_card_still_differing_px_share=0.01376 -> PASS
§FILM_FRAME_CHECK beat=find_fin t=97.21s panel_count_read="50 found" video_frame_vs_card_still_differing_px_share=0.01725 -> PASS
§FILM_FRAME_CHECK beat=find_rebar t=114.58s panel_count_read="50 found" video_frame_vs_card_still_differing_px_share=0.01575 -> PASS
§FILM_FRAME_CHECK beat=find_gusset t=123.29s panel_count_read="2 found" video_frame_vs_card_still_differing_px_share=0.01630 -> PASS
§FILM_FRAME_CHECK_VERDICT PASS 4/4
```
```
§GUARD P proof talk or first/novel/unique: none
§GUARD N not-said (live link, capacity claimed, compliance, schedule matches everywhere): none
§GUARD caveat "configuration only, capacity not checked" spoken on added,find_fin: yes
§GUARD rebar says the schedule check FAILS on 2 beams (F.rebar.stated_verdict=FAIL): yes
§GUARD C viewer: panel checks 4/4, camera target within 6 cm of the element's own geometry on 3/4, KNOWN DATA FAULT (fly ends over 0.5 m off, narrated and on screen) on find_fin, isolate at start 6956 after Find open 6956 end 6956
§GUARD C modeller: seed committed=2126 beats 4, framing centre within 5 cm of the geometry's centre (elements_rtree) on 4/4
§GUARD private names in facts or narration: none
§GUARD_VERDICT PASS judged=31 bad=0
```
```
§K2_LEVEL keys (mixed, typing windows) mean rms -33.7 dB, mean peak -9.3 dBFS; voice mean rms -16.7 dB -> keys are 17.0 dB under the voice rms
§K2_VERDICT PASS beats=8 bad=0 audible=True
```
```
§KEYS typed=342 of 342 returns=8 of 8 track_s=153.625 film_s=153.625 peak_before_scale=1.606
§KEYS_VERDICT PASS
```
```
§FILM_DONE dur=153.625 frames=3687 planned=3687
```
```
§CARDS_DONE beats=13 stills=1061 too_tall=0 key_stills=342 return_stills=8 max_terminal_rows=12 font=31px (one size for the whole film)
```

Voice fit: every beat DETAIL, tone checks OK (`out/fit.log`). Check T (one font size): `cards.js` prints `font=31px` for every terminal still; rows taller than the strip scroll 3 px per frame, 0 cut. Check Z (cropped picture differs step to step by a measured share): NOT run for this film.

### Findings the film surfaced (reported, not hidden)
1. **DATA FAULT (new):** all 150 connection parts (fin plates, bolts, welds) have `element_transforms.center` equal to their HOST BEAM's centre (150 of 150), 1.07-3.71 m (median 3.42 m) from the part's own bounds (`elements_rtree`); the 6,458 original elements, 220 layer parts and 306 bar sets match their bounds to 0 mm, the 3 gusset parts to 2-5 cm. The Viewer's Find flies to `center_*`, so the Fin plate fly ends 2.775 m from the plate (the yellow box floats mid-beam). The Modeller frames from geometry and is right (0.004 m). G4's earlier `target_to_element_m=0.0000` compared against the same table, so it could not see this. The film says it plainly (voice, terminal line, left-pane numbers). Fix belongs in the generator (write each part's own centre); the film DB was not touched and no generator was re-run. `A.zoomToGuid` was tried as a second step and does not move the camera for these parts (no per-guid mesh), so it is not filmed.
2. **Shell-ghost lens:** watched for the whole session (about 130 s, Find open from about 35 s): no empty isolate was seen (`§FILM_GHOST_WATCH`: the only isolate changes are this harness's own 3-4 element isolates and their restores to 6956). Find keeps the parts view (#3231): 6956 before and after Find opens.
3. **Wall layers:** every wall layer in the Find's first 50 rows (and most of the 220) carries a vendor prefix of the source model, so no wall row is flown to; the first hit (a ceiling layer) is. The Modeller beat uses a gypsum-board layer of a wall.
4. **Parts need isolating to be seen:** the added parts sit inside architecture and concrete, so each Find beat isolates the picked element's own parts (`A.filterByGuids`, the call the parts view uses) and pulls back with the mouse wheel; the Modeller joint beats hide every other seeded feature (`Bonsai.setFeatureVisible`, the Outliner eye's call). Both are logged (`§FILM_ISOLATE`, `§FILM_HIDE`). There is no in-Modeller "upgrade LOD" button; the film says so.
5. **Guide:** `§FILM_GUIDE` http=200, Find-panel anchor present, but the guide has no section on rule-based LOD 400 parts, the parts view or finding them (its "LOD400 Upgrade" section describes the geometry weld only). The last card and voice say so; no link to a page that does not cover it. Gap to close in the guide before posting.
6. Weak spot: the `§FILM_FRAME_CHECK` compares a decoded video frame to its card still (1.4-1.7 % pixels differ, H.264 and captions); the panel-count proof is `§FILM_PANEL_CHECK` (crop equals a live clip, differs when the count text is changed).

## FILM rc2 2026-11-18
**Why:** rc1's Fin plate beat narrated a data fault (the Find landed 2.775 m from the plate: stored centre = host beam's). The data was fixed (generated parts now store their own bounds centre; world vertices unchanged), so only that beat changed.
**What changed (scripts only):** `capture_viewer.js` takes `BEATS=<id>` (one beat) and has a witness-only `find_plate` term (`BEATS=find_plate`); new `merge_beat.js` copies the rc1 capture folder and replaces one beat (viewer.json entry + its frames), rc1 folder untouched; `facts.js` asserts every generated kind within 1 mm of its own bounds centre (was: asserts the fault); `narr.js` fin beat now speaks the measured fly distance (`viewer.find_fin.fly_mm`); `guard.js` fails the build if the fin fly is over 10 mm; `cards.js` shows the landed distance instead of the fault line.
**Run:** `BEATS=find_fin node capture_viewer.js <export> <dir>` (GPU, `nvidia-smi` logged first, P8) -> `merge_beat.js` -> `WORK=... OD=.../out_rc2 OUTMP4=...rc2.mp4 ./build.sh`. Other beats (Modeller and the other three Find beats) are the rc1 captures.
**Measured:** fin plate fly: `target_to_geometry_m=0` (rc1 2.775), camera 0.964 m, 49 steps with motion, panel check PASS; guard PASS judged=30 bad=0; K2 PASS. rc2 149.5 s, 3588 frames (rc1 153.6 s). Media stay outside the repo.

## FILM rc3 SPEC 2026-11-18 (written before any capture or code)
**Why:** rc1 / rc2's Modeller section types four Python commands and says *"There is none. The upgrade is a rule script."* That is no longer true: the Modeller's Upgrade pill (bim-ootb #3238 rebar, #3241 welds, #3243 layers, #3248 joints, #3252 gussets, #3260 beam rebar, #3268 Add-on IFC + sliced runs; spec bim-ootb `prompts/MODELLER_LOD_UPGRADE_PILL.md`) runs the same rules in the browser, with parity to those scripts. Owner (2026-11-18): *"proceed with the next tasks, so we can put in together with the film"*; rc3 shows the pill with every pack. The Viewer Find beats (rc2 captures on `JPAM_film.db`) are kept as they are.
**Two models, measured, not chosen for looks:** the layer sets exist only in the architecture extract (`material_layers`, `rel_material_layer_set`, `component_geometry_layers`); the combined model (architecture + structure, the one the steel and rebar rules ran on) carries the layer RESULT, not its source, so the Layers pack applies to 0 there (W-LODUP-BEAMBARS REGISTRY on the combined model: `layers(0)`). So:
- **Model A, the architecture extract as read** (no added row): the Layers beat.
- **Model B, the combined model with every added row removed** (`JPAM_base.db`, built by a private script from `JPAM.db`: every `GEN-*` row deleted from the element tables, the rtree, `element_parts`, `upgrade_changes`, `task_elements`; `kernel_ops` left as is because it is a hash chain, its GEN rows counted and logged). Witnesses: BASE_IDENT (every non-GEN row of the element tables equals `JPAM.db`'s), BASE_COUNTS (6,458 elements, 0 GEN rows in any table but `kernel_ops`), BASE_DETERMINISM (two builds, one SHA-256). The steel, gusset, beam rebar and Add-on IFC beats.
- The two Shed-only packs (Rebar from DXF schedules, Truss welds) are shown in the dialog with their own "applies to 0" on the mosque, and the voice says so. Nothing is run that does not apply.
**Beats (replacing mod_conn / mod_layers / mod_rebar / mod_gusset):**
1. `mod_open` (Model B): the arrow pressed; the dialog's six rows with the page's own "applies to N" read from the DOM.
2. `mod_layers` (Model A): Run Layers; the page's `§LODUP_RUN` / `§LODUP_LAYER_SUMMARY` lines; the Modeller frames one wall layer by its own `selectByGuid` (the rc1 guid if the JS pack writes it, which parity says it does).
3. `mod_joints` (Model B): Run Steel joints; 50 joints; frame one fin plate with the rc1 hide-the-rest rule.
4. `mod_gussets` (Model B, after joints: the gusset pack sees the live joint parts as neighbours): Run; 1 of 57; frame it.
5. `mod_beambars` (Model B): Load schedule… (the marks JSON through the row's own file button), applies to 92, Run; frames captured DURING the run at real time (the panel's own "x of N" progress: the page is not frozen); `§LODUP_YIELD maxSliceMs`, `§LODUP_BEAMBAR_STATED` FAIL on 2 beams; frame one beam's bottom bars.
6. `mod_ifc` (Model B): Add-on IFC, IFC2X3, NO frame loaded (a frame file holds private site offsets: never on screen); the browser download is kept and checked by `witness_lodup_ifc_check.py` (validate, solids); `§LODUP_IFC_WRITTEN` parts / bytes.
**Click beats are not typed.** Nothing is typed in beats 1-6, so they carry no key sounds (house rule: real key sounds for typed lines only; never a fake keystroke for a mouse click). The top strip names the control pressed (`click ▸ Upgrade`, `click ▸ Run · Layers`, ...) and then shows the page's own `§` lines, verbatim from the capture's console log. The voice starts after the click.
**Lower frame:** the Upgrade panel crop at zoom (legibility, as the Find slices) on the left, the Modeller scene on the right.
**Cross-check to the Viewer section:** the set of generated GUIDs live in the Modeller after the five runs (A: layers; B: joints, gussets, beam rebar) must equal the `GEN-*` GUIDs of `JPAM_film.db` the Viewer beats use (679), so the Find beats show the very parts the button made. `§FILM_RC3_SAME_PARTS` prints both counts and the two differences; a difference FAILs the build.
**Narration and cards:** every number is read from the capture's `§` lines; the "added" card is re-titled "what the Upgrade button added"; the rebar line keeps "the check says fail on 2 beams"; the steel beats say "configuration only, capacity not checked". The close card adds the bim-ootb pill PRs. No claim that there is no button. Guard additions: the old "There is none" sentence is not said; the SAME_PARTS check passed.
**GPU:** the captures run on the GPU after `nvidia-smi` is logged and the peer sessions are asked to give way; software GL for smoke runs only.
**Output:** `~/Videos/film_lod_upgrade_find/LOD400_Upgrade_Finding_the_added_work_EN_rc3.mp4` (never committed; never overwrites rc1/rc2).

## FILM rc3 RESULT 2026-11-18
**Output (never committed):** `~/Videos/film_lod_upgrade_find/LOD400_Upgrade_Finding_the_added_work_EN_rc3.mp4` · 188.833 s · 4532 frames at 24 fps · 18,315,658 bytes · sha256 `b16ace6c31b0cce8cf033b351c60e5d4813ac0788deb38f915a0a6baff0ee7df`. Captures: bim-ootb `f51ab6e7` export (Model B, after #3276) and `64e3c3dc` (Model A: the Layers code is the same in both); Viewer beats = the rc2 captures, unchanged. Logs: `~/Videos/film_lod_upgrade_find/work_rc3/logs/`, `out_rc3/`.
**New scripts:** `capture_pill.js` (the Upgrade pill on one model per run, switchable virtual clock: real time while a pack runs, one 1000/24 ms step per capture while the Modeller frames a part; every run starts from Zoom to fit); `facts.js` reads `pill_A.json` / `pill_B.json`; `cards.js` click beats (`click ▸ <control>`, no key sound, the voice starts at the click still: `tsv.js` / `beatlen.js` honour `click`); `narr.js` six new Modeller beats; `guard.js` checks the old "there is no button" sentence is not said, the pill frames, SAME_PARTS and the IFC check.
**Measured (all from the page's own § lines, then checked against the Python runs' lines):**
```
§FILM_RC3_PAGE_VS_PYTHON layers.added=220 joints.joints=50 joints.parts=150 joints.failures=0 gussets.joints=1 gussets.ends=57 beambars.sets=306 beambars.beams=92 ifc.elements=459 ifc.parts=470 ifc.mesh=PASS gussets.refused.REFUSED_CLASH=22 gussets.refused.NO_ATTACHMENT=13 gussets.refused.GAP_TOO_LARGE=4 gussets.refused.NO_ROOM=17 -> PASS
§FILM_RC3_SAME_PARTS made_by_the_button=679 (A 220 + B 459) film_db_generated=679 only_made=0 only_film_db=0 -> PASS
§FILM_RC3_FRAMES mod_layers=0.002 mod_joints=0.004 mod_gussets=0.004 mod_beambars=0.004 (Modeller framing centre to the part's own centre, m; limit 0.05) -> PASS
§FILM_RC3_IFC_CHECK §LODUP_IFC_PY_VALIDATE schema=IFC2X3 roots=1528 validate_errors=0 -> PASS
§FILM_RC3_IFC_CHECK §LODUP_IFC_PY_SOLIDS breps=6287 invalid=0 {} -> PASS
§GUARD_VERDICT PASS judged=38 bad=0
§CARDS_DONE beats=15 stills=1063 too_tall=0 key_stills=31 return_stills=4 max_terminal_rows=13 font=31px (one size for the whole film)
§FILM_DONE dur=188.833 frames=4532 planned=4532
§KEYS_VERDICT PASS · §K2_VERDICT PASS beats=4 bad=0 audible=True · every beat's voice DETAIL, every tone check OK
```
Beam rebar in the browser: 306 sets in 47.6 s (shown 4x faster, said on the bar), longest stretch on the page thread 26 ms; the dialog's own "beam x of 92" counts up while it runs.
**Findings the film surfaced (reported, not hidden):**
1. **The fin-plate weld beads were inconsistently wound** (100 of 100, one bead per pair inside out): the Add-on IFC's own MESH check failed on the first capture. Fixed in bim-ootb #3276 (`f51ab6e7`, P4 FIX SPEC / RESULT), then Model B was re-captured. The private Python generator has the same bead builder: open in the private lane.
2. **The Add-on IFC refuses** when a storey has no elevation (the combined model carries none): the film shows the refusal, then loads a storeys-only file (storey heights copied from the author's IFC; no site placement, no shift, so no private offset reaches the screen) and exports.
3. **459 added parts are written as 470 IFC parts:** 11 bar sets of mixed diameters are split by diameter (as the Python writer does); the voice says both numbers.
4. **Four packs show 0 at open** on the combined model: the two Shed packs, Layers (its layer sets are in the architecture model, so the Layers beat runs there), and Beam rebar until its schedule is loaded. The guard caught a first narration that said three.
5. **The beam rebar pack does not print its own schedule (STATED) check in the browser**; the film shows the Python run's `§PJRB_STATED ... -> FAIL` on the same 306 sets (SAME_PARTS), labelled as such. Follow-up for the pack.
6. The guide still has no section on this work (unchanged from rc1; the close card says so).

## FILM rc4 SPEC 2026-11-18 (owner review of rc3; written before any change)
Owner, verbatim: *"The early part is not showing how u get to the pill icon. It jumped to show already opened option. That gap can confuse. Can at least a snap shot of the pill icon be spliced in? Also one part is blank on canvas and also the IFC exporting, its is not clear how the discipline is chosen as nothing on canvas."* · *"The IFC file save as filename should be snapped. The canvas should be smaller i suspect it didn't zoom out when it should"* · *"What is 'fail schedule' means? Is it the 4D ?"* · *"Can we do the guide also so that the film can report positively the guide is done and give the link on the last page bottom space"*.
- **S1 pill snapshot:** `capture_pill.js` takes a toolbar clip (the pill rect is in `pill_*.json` `rects.pill`) before the click; `cards.js` shows it zoomed in the left pane with a ring on the arrow; strip `click ▸ Upgrade (the arrow, top right)`.
- **S2 no blank canvas:** Escape before every Zoom to fit; a new card-time check `§FILM_BLANK_SCAN` (share of scene-pane pixels off the background; < 2 % = blank) must report 0 blank Modeller stills, else the build FAILs; Viewer fly stills below 2 % are dropped and counted (`§FILM_BLANK_DROP beat= n=`).
- **S3 scene pane:** two captures per still (scene with the dialog hidden; the dialog as an element screenshot); scene crop x 242..1280, y 0..720 at about 1.31.
- **S4 IFC beat:** before the first press, the original elements are hidden with `Bonsai.setFeatureVisible` (the Outliner eye) so the canvas shows only the added parts; voice: no discipline is picked, every part the button added goes in, the model stays out; a "saved as `<name>` (<MB>)" still read from the download folder.
- **S5 wording:** "bar table on the drawings" for the S-401 schedule; guard keeps the FAIL sentence (update its regex to the new words).
- **S6 guide:** a BIMUserGuide section on the Upgrade button; `facts.js` `covers_the_added_work` must turn true from the deployed page's own words; the close card shows the section's link in its bottom space.

## FILM rc4 RESULT 2026-11-18
**Output (never committed):** `~/Videos/film_lod_upgrade_find/LOD400_Upgrade_Finding_the_added_work_EN_rc4.mp4` · 196.708 s · 4721 frames · 19,910,595 bytes · sha256 `c73d242256d172c749b1c7cc0fd07d546efc119fa2e874a04c7af9232eafb8b9`. Captures on bim-ootb `700fbdcb` (with #3276 weld winding, #3282 download names); Viewer beats = the rc2 captures. Logs: `~/Videos/film_lod_upgrade_find/work_rc4/logs/`, `out_rc4/`.
| Owner point (rc4 SPEC) | Done, measured |
|---|---|
| S1 how to reach the pill | the first stills of mod_open show the toolbar zoomed with the arrow ringed (`the Upgrade pill: the up arrow at the top right`), then the click, then the dialog |
| S2 blank canvas | Escape before every Zoom to fit (`capture_pill.js fitAll`); `§FILM_BLANK_VERDICT PASS modeller_beats_with_blank_stills=0` (rc3: gussets 29, beam rebar 261 blank stills); Viewer fly frames under 2 % dropped: find_fin 7, find_rebar 12, find_gusset 7 (`§FILM_BLANK_DROP`). Left as is: find_rebar's 14 typing stills show the previous beat's last view (a selection box on the ground plane; sparse, not empty; same as rc2) |
| S3 canvas less zoomed | the dialog is its own clip (`<shot>.panel.png`), the scene is captured with it hidden: scene pane = the whole canvas right of the Outliner at 1.31 (rc3: 2.27) |
| S4 IFC beat | `§FILM_PILL_IFC_SHOWN originals_hidden=1535 added_parts_shown=459`: the canvas shows only what goes in the file; voice: no discipline is picked, every part the button added goes in, the model stays out; strip shows `saved as JPAM_base_addon_IFC2X3.ifc (50.7 MB, the browser's download folder)` (#3282) |
| S5 "schedule" | voice says "the bar table from the drawings"; the FAIL stays: "those beams cannot hold the stated bars" |
| S6 guide | ModellerGuide "Upgrade — add rule-based detail (LOD 400)" + toolbar row, deployed by `safe_gh_deploy.sh` (guard PASS, canaries 200); `§FILM_GUIDE http=200 anchor=Y covers=Y`; the close card says the guide has the section and prints the link in its bottom space |
Checks: facts PASS (bad=0), guard PASS 38/0, cards 0 too tall, `§FILM_DONE frames=4721 planned=4721`, every voice DETAIL, every tone OK, KEYS PASS, K2 PASS.
