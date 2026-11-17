# ⚠ DO NOT REMOVE
SCOPE: ONE film. The Palm Jebel Ali Mosque (PJAM; name released by the owner 2026-11-18) on canvas: first the Modeller's own LOD feature (layer split drawn per layer), then the Viewer's Find panel locating each kind of added work and flying to it. House style: `prompts/FILM_NARRATION.md` (split screen, typed line + REAL key sounds, voice after return, two-colour cover card, last card with prior art + credentials + guide link, lower frame cropped/zoomed to the part that changes). Read the log after every run; the exit code is not evidence. Films are never pushed; only scripts and this file are.

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
