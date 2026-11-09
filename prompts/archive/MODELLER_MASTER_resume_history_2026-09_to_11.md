<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — ARCHIVE of superseded MODELLER_MASTER.md resume/session blocks (moved 2026-11-09, owner: "consolidate progress, removing stale")
History only. The entry point is `prompts/MODELLER_MASTER.md` §RESUME 2026-11-09c; everything still standing from these blocks is listed there under "Carried forward". Moved verbatim, in the order they sat.

## ▶ §RESUME 2026-11-10 — START HERE: a REAL-UI Modeller film of the HVAC + FP walk (owner, 2026-11-09)
> Owner: *"perhaps we need to prep more so that it is a good film, with proper steps in Modeller and the elements coming on where we zoom into it maintaining canvas in frame for realism and proof it works."*
**Where things stand (all measured, logs in the private walk folder 61–78; read §WALK-REPORT-CARD below for detail):**
- **Walker fix merged, bim-ootb #2752 (`16b3c205`).** Borrowed band rows are re-anchored to the building's own floors and placed only on a host.
  - Private set: 96 sprinkler heads, all on LEVEL 1 ceilings; 70 wall alarms; 11 drawn FP items; ACMV 554 drawn runs + 205 drawn terminals.
  - The sprinklers-on Viewer export completes (7,228 elements).
- **The last film was a stills cut** (`WalkReport_Insight_AFTER_2026-11-09.mp4`, 120 s): canvas grabs, report markers, page-level clipping. It proves the data, not "it works in the Modeller". Report + zip: `report_2026-11-09_after/`.
- **Visibility law (learned the hard way):** a shot claimed to show an element must log its projected size in px and a ray-first-hit = that element. A crosshair at a point proves nothing. A sprinkler head is 0.03 × 0.03 × 0.06 m: at the 55° FOV it needs ≤ 0.9 m for ~70 px, and a pendant head is seen from BELOW its ceiling.

**Target film (one continuous real-UI take, the whole Modeller window in frame, cuts only over waits).** Recorder = `scripts/film_modeller_trailer.js` (CDP screencast, `jump()` cuts, `settle`, beat gates on `§` lines), extended. Clicks aim through `modeller/tests/e2e_harness.js` `window.__e2e`. Beats, each gated on its own `§` line:
1. Open icon → local row → the building appears (cut over the load).
2. Outliner → ACMV row → the walk's build-up draws the drawn runs + terminals one by one on the canvas (§D64 reveal, 2–7 s). This is "elements coming on" and already exists.
3. FP row → heads, alarms, drawn items come on.
4. X-ray icon.
5. Zoom-ins from the Outliner (Walked Fixtures leaf → fly-to): a drawn terminal, a drawn FP item, a sprinkler head from below, a duct run. Every zoom witnessed by px + ray.
6. Top / plan view.
7. Export → Viewer → the 4D/5D page (real buttons).
Cards: the house chapter cards (FILM_NARRATION 2026-11-03). Numbers only from `§` lines.

**Prep before the take, ranked. Each is spec-first with its witness; items 1-4 are bim-ootb product work, not film hacks:**
1. **Type-set select + zoom in the Outliner (owner, 2026-11-09: *"The elements created in the Outliner panel on left should be able to be seen to be populated and type set can be selected where the canvas should zoom to."*).** Checked against the original spec, `prompts/MODELLER_ZOOM_TO_SELECTION.md`:
   - **Built:** `zoomToSelection()` (`modeller.html:1220`, frustum-fit `_fitDistForBox`, FLY-YIELD), fired by `setSelectionIds` on every selection; witness `modeller/tests/witness_e2e_zoom_to_selection.js`.
   - **Built:** the Walked Fixtures category populates after a walk: disc → type (class) → leaf, with count and provisional label (`dw_instances_outliner.js`).
   - **Built:** a walked LEAF click → `Bonsai.frameInstanceRow` (`modeller.html:1393`) selects it (`pickInstance`) and flies to it (`bonsai_outliner.js:755`).
   - **GAP 1, the type set:** a walked class row (id `dwc|disc|cls`) selects and zooms NOTHING. `selectGroup` skips `dwp|` leaves by design ("an unresolvable leaf… is SKIPPED, never guessed", `bonsai_outliner.js:336`), and `zoomToSelection` reads `selBox()` from feature meshes only. Walked instances are not in that selection model.
     - Spec next, as an addendum to MODELLER_ZOOM_TO_SELECTION.md: a type-row click selects all its instances (instance highlight, the `pickInstance` family) and frames their UNION box with the same `_fitDistForBox` / `_lerpCam` (one owner of framing, no second zoom).
     - Witness: every instance of the set is highlighted (count = the row's count), and the union box's projection fills the frame by the frustum-fit rule. Red control: main does nothing.
   - **GAP 2, "seen to be populated":** confirm the Walked Fixtures rows appear and their counts update as the walk commits, and that the category is open and scrolled into view after a walk. Measure first: whether it is collapsed/off-screen after a walk is UNMEASURED. Then fix if needed.
2. **Size-aware, host-aware single framing.** `frameInstanceRow` calls `_frameTo(point, 1.5)`, which floors at `max(1.5, 2) × 1.8` = 3.6 m (`modeller.html:1506`), oblique from ABOVE. A 0.06 m head is then ~10 px and hidden by its own ceiling (measured in the report run).
   - Distance from the element's size and the 55° FOV (the `_fitDistForBox` rule, which already exists); for a ceiling-hosted device (`hostState=bound`, host a covering/slab), approach from BELOW the host.
   - Witness: projected px ≥ threshold and ray-first-hit = the element. Regression: the existing fly-to/zoom witnesses.
3. **A real section/cut control in the Modeller UI.** None exists (0 hits for clipping/section in `modeller/`); the report used a page-level `renderer.clippingPlanes`. For "proper steps", a visible tool is needed. This is the owner's call: build it, or rely on X-ray + from-below framing only (zero new UI).
4. **Visible cursor in the take.** Headless screencast draws no pointer, so clicks are invisible. Add a recorder-side cursor overlay at each `__e2e` click point, stated as an overlay. Recorder work, not product.
5. **On-screen privacy.** The Outliner and status show the file name and storey names of the private set. **Owner question: who sees this film?** If outside the owner's team, take a film COPY of the DB with neutral storey/file names (logged mapping; data unchanged otherwise) or mask the Outliner text. Decide before recording.
6. **Wall-alarm residual.** 13 of 70 wall-hosted alarms are > 3 m above the highest slab/roof top at their spot, and 2 are outside every box (coarse box test; untraced; probably tall walls). Trace before the take, or caption it as open.
7. **Wait budget.** Open + ACMV + FP walk on this set takes minutes. The recorder `jump()`s over each wait and logs it (`§FILM_JUMP`), so the film never pretends real time.

**Not needed:** the Viewer bake (owner: "we can then do away with baking"); synthetic markers in the take (keep them for the report only).
**Owner rulings 2026-11-09 (asked this session):** item 5 → **film a neutral-name COPY** of the DB (storey/file names neutralised, logged mapping, data otherwise unchanged). Item 3 → **no section tool**: X-ray plus from-below framing only, zero new UI.
**Item 1 built 2026-11-09:** bim-ootb branch `feat/outliner-typeset-zoom`, W-E2E-TYPESET-ZOOM 9/0 (RED on main 2/5). Spec + RESULT: `MODELLER_ZOOM_TO_SELECTION.md §TYPESET`. GAP 2 was real: after a walk the Walked Fixtures header sat at y=8159 px, off-screen; it now scrolls into view as rows are added. A mid-reveal type click lost most tints (62/102): fixed in the same PR.
**First step next session (was):** answer item 5 (and item 3's build-or-not) with the owner; then build 1 (spec addendum first) → 2 (one PR each, witness first); then extend the recorder (4, 7); then one rehearsal take with every beat gated; then the take.


## §WALK-REPORT-CARD SPEC (2026-11-09, owner) — proof of work from the Modeller canvas; no Viewer bake
> Owner: *"Can the FP sprinklers be walked into too? … just close up snap shots of the placed elements … begin with … a topology map of all the placed devices … Animation is not crucial … Important is proof of work. A report card giving engineers as much useful info as they be the judge."* · *"Showing the 4D5D HTML is one good shot to include."* · *"can we get good canvas view in Modeller during the walk?"* · *"we can then do away with baking."* · *"show how the Modeller icons features work where and how to bring about such."*
**Inputs:** a COPY of the walk input with `fp_sprinklered=yes`, set by the documented tool (`mains_to_db.js --sprinklered=yes`). Sprinkler heads are the walker's band placement: rule-placed, `Provisional=TRUE`, NOT drawn (the set holds no sprinkler sheet). They are labelled that way on every card. Source DB never written.
**Run (one page, real GPU, `flock gpu.lock`, `nvidia-smi` first, 1920×1080, the bake's `real` flags):**
1. **How-to shots, the real UI:** the Open icon (`#b-open`) and its panel, the local-file row, the Walk entry for each discipline, the drawn-only view. Each shot names the icon's id and tooltip, read from the DOM, not typed.
2. **Walk** ACMV then FP through `window.discWalk` (the same call the Walk menu makes). The walk's § lines are kept verbatim.
3. **Topology map:**
   - (a) Modeller canvas overviews: an iso view of the whole building, then one top view per storey, all placed devices visible.
   - (b) A plan map per storey drawn from the committed op rows themselves (positions, kind, provenance colour): an SVG, so every dot is an op row.
   - (c) The previous film's overview frames, as the opening.
4. **Close-ups:** the camera is set with `window.A` (`camera`/`controls`, Z-up) to a fixed oblique offset from the element's own placement point. No animation; the frame is grabbed after two rendered frames.
   - Every drawn FP item and every drawn terminal.
   - Sprinkler heads, band ducts and drawn duct pieces: a deterministic sample per storey (sorted by op id, every k-th, k stated). The full list is in the CSV.
5. **Export** the Viewer DB (the same call as before), then open `viewer/boq_charts.html` (4D/5D Analytics) on it and shoot the page.
**Card per element (data from the op row and its `_dw` record, never re-derived):** op id, discipline, kind, IFC class / object type, storey, x/y/z (local frame), the height basis and its label, provenance, provisional, host state, sheet piece. Derived and labelled as such: height above the storey's stated elevation; for sprinklers, the distance to the nearest other head (engineers judge spacing; no pass/fail threshold is invented).
**Report:** one local HTML file plus a CSV of every placed element plus the PNGs, kept in the private walk folder. Never published, never committed. Sections: how-to, topology, per-discipline counts by provenance and basis, close-ups, 4D/5D, the § lines, limits.
**Witness lines:** `§CARD-SHOT kind= op= file=` per image; `§CARD-SAMPLE disc= kind= total= shot= k=`; `§CARD-CSV rows=` = the committed placements counted from the op log (so a missing row shows); `§CARD-UI icon=<id> title=<tooltip>`. A shot whose element is outside the camera frustum is logged `OUTSIDE` and is not presented as proof.

**§WALK-REPORT-CARD RESULT (2026-11-09).** Built and kept private: the report folder plus a zip in the private walk folder; scripts `report_run.js`, `report_build.py`, `page_shots.js`; logs 61-68 read.
- **Walk:** bim-ootb main `6c694c43`, the real RTX 4060 (`§CARD-GPU`), started by clicking the real Outliner rows (`§CARD-WALK row-click:done` ×2). 3,164 op rows, `§CARD-CSV rows=3164` = the op log.
- **Sprinklers on:** `§FP-SPRINKLERED value=yes`; FP committed 2,000 (band 1,772, shims 185, schedule 43) plus 11 drawn items.
- **Shots:** 9 how-to UI shots (element id + tooltip read from the DOM), X-ray via `#b-xray`, 8 storey-band canvas plan cuts framed on the op points, 361 section-cut close-ups (0 OUTSIDE), 15 SVG plan maps from the op rows, the 4D/5D and MEP report pages.
- **FINDING 1 (for the owner):** every band row (ACMV 392, FP 1,772, shims 185) carries the borrowed reference building's storey NAMES and HEIGHTS, not this building's. Box test against this building's slab/roof world boxes:
  - FP band: 939 more than 3 m above the highest top at their plan point, 205 uncovered by 0.5-3 m, 365 outside every box, 263 within the stack.
  - ACMV band: 308 floating, 75 outside.
  - The drawn rows sit within the stack: ducts 553/554, terminals 204/205.
  - So band-placed sprinklers are not credible on this set. That is a walker defect: the band's storey ladder is not this building's.
- **FINDING 2:** the sprinklers-on Viewer-DB export aborts in web-ifc `CloseModel` (heap 4,384 MB vs 3,004 MB without). The 4D/5D shot therefore uses the film run's walked DB, labelled so.
- **Instrument notes:**
  - Close-ups need X-ray plus a section window; a plain oblique shot is blocked by the roof (first capture).
  - "Fit" frames far outliers, so frame on the op points instead.
  - `boq_charts.html` / `mep_report.html` need `bld=` = `elements_meta.building`, or they show "No data".

**§WALK-REPORT-CARD follow-ups (2026-11-09, owner: "Re-anchor + host", "fix the rest ongoing").**
- **Insight film cut** with the house chapter cards (FILM_NARRATION 2026-11-03 spec, card background measured `#0b0f17`). 96.7 s, 8 cards + 15 stills; every number from logs 62/68. Kept private.
- **FIX MERGED: bim-ootb #2752 (`16b3c205`).** Borrowed band rows are re-anchored by storey order to this building's floors and placed only on a host. Source floors ship as the self-heal rules patch `modeller/patches/terminal_rules.db.sql`.
  - W-BAND-REANCHOR 9/0.
  - Private FP band heads 1,880 (939 floating) → 96, all inside.
  - Public ARC residents unchanged (they state no storey elevations; the limit is stated in band spec §12).
  - Spec + RESULT: bim-ootb `prompts/DISC_WALK_BAND_NO_HOST.md` §12.
- ✅ **Re-walk on merged main (`16b3c205`), log 71:**
  - `§DW-RULES-PATCH rows=7 ok`; FP `reanchorNoHost=1812`; FP 209 placements, ACMV 207.
  - **The sprinklers-on Viewer export now completes**: 7,228 elements, 208,728,064 bytes = expected.
  - The MEP report BOQ gains its FP section (`§MEP_BOQ sections=4`).
  - Report "after" (log 74): 0 borrowed storey names; 96 ceiling-hosted heads, all within the slab stack.
  - **Residual for engineers:** 70 wall-hosted band devices (alarms), of which 13 are more than 3 m above the highest slab/roof top, 19 uncovered and 2 outside. Not traced; likely tall walls.
  - "After" film cut (106.2 s); report + zip kept private.
  - Instrument note: `boq_charts.html` needs `bld=` = `elements_meta.building`.
- **Owner, 2026-11-09: "Examine the film, we cannot even see a single sprinkler."** Correct: the film's sprinkler stills showed no head.
  - Measured cause: a head is 0.03 × 0.03 × 0.06 m, shot from 5 m, looking DOWN at its ceiling; a pendant head hangs under the ceiling.
  - Fix (private `sprinkler_shots.js`, log 76): close-ups from BELOW the ceiling, at a distance computed from the head height and the 55° FOV. Each shot is witnessed by its projected px (88 px) and a ray-first-hit test; 9 of 10 VISIBLE.
  - Overview and plan carry a stated 0.35 m marker per FP device.
  - Film re-cut (120.2 s). A frame check on the final mp4 finds head pixels in the 3 close-up segments and markers in 2.
  - **Rule kept: a shot claimed to show an element must log that element's projected size and an unobstructed ray. A crosshair at a point proves nothing about what is visible there.**

## ▶ §RESUME 2026-11-09b — (superseded as entry point by §RESUME 2026-11-10 above)
**Run on bim-ootb main `8541065f`, private set, local headless (software GL, no GPU). Every number is read from the saved run logs in the private walk folder (`41`→`42_page_run_chunked`, `45_carry_film_v3`).**
1. ✅ **Page run, chunked copy:** walk ACMV + FP done, 3,507 ops, 554 drawn lines + 11 drawn markers. `§VIEWERDB §DRAWN-TABLES lines=554 markers=11 byBasis={void-middle:393, exposed-under-structure:102, on-roof-surface:59} offsetRows=4`. Export 7,531 elements, 192,434,176 bytes, written = expected (8 MB chunks; the old one-string copy timed out). Heap after build 3,004 MB.
2. ✅ **Viewer open:** `§DRAWN-OVERLAY lines=554 markers=11 byBasis={…, owner-stated:11} sceneObjects=23`; `§DRAWN-ONLY hidden={IfcFlowTerminal:45, IfcAirTerminal:392, IfcAlarm:77} hiddenTotal=514 shown=7017 overlay=565 elements=7531`. 0 page errors.
3. ✅ **Carry into a COPY (`walked_film.db`), private script `carry_film.py`:** camera path 4 rows + scene camera 1 row moved by `film_offset − route_offset` = 1 m in y; read back exact (maxDelta 0.0). **Frame proof, chained** (`§CARRY-FRAME-CHAIN`): film → walk input, same GUIDs, n=6,458, max 0.0000 m; walk input → walked export, world bbox, n=5,377, max 0.0000 m. Material names + rgba: 5,105 by GUID, 1,319 by class + world bbox within 1 mm (unique on both sides, 0 ambiguous), 31 film elements unmatched (left unnamed, counted). All 5 elements with corrected names (3 distinct corrections) arrive.
**Found on the way (the Viewer-DB export goes through an IFC, so it carries the export gaps of §RESUME 2026-11-08b):**
- **ARC GlobalIds are regenerated** (1,350 film elements have no GUID match; only the M3B-carried rows keep theirs). Export gap (1). A GUID-only film carry misses them; the bbox key above covers it for this film.
- **`material_name` is NULL on every exported element, and rgba is a generic class colour** (walls 0.92/0.90/0.85), not the authored IFC colour. Export gap (2). The carry restores the film DB's names + rgba.
- **IfcWallStandardCase is written as IfcWall** (298 → 301).
- **Instrument trap:** `element_transforms.center_*` is defined differently after the export. 968 shared elements read > 1 cm off on centre (up to 2 m) while their world bboxes are identical (max 0.0). Prove position on `element_world_bbox`, never on `center_*`.
4. ✅ **NEURO verb 6** (bim-ootb #2736, main `c43d5b72`), `viewer/tools/film_path_vis.js` on `walked_film.db`, read only (sha1 unchanged), 2,400 samples (240 agrees): **verdict=SEES, no blind band.** Per band, lines/554 and markers/11: band 0 517 and 5 (70 of its 119 samples are still, the opening spin), band 1 364 and 1, band 2 96 and 0, band 3 286 and 8, off-path 554 and 11. The 4 bands together see 548/554 lines and all 11 FP markers from inside. The carried path passes every band centre within 0.044 m (the default-plan red control misses by 4-21 m). At 240 samples the bands got only 23 samples, so use ≥2,400. Not checked: pixel size, storey (no storey column in the drawn tables), the findings-beat hide. Counts sent to the design lane.

   Re-checked on #2737 (`7f08bdc5`): resample 240 → 1,680 on its own (band 1 had 3 < 20), and the inside-only line reads 548/554 and 11/11, the same as the hand count.
5. ⚠ **Baked on the owner's word, relayed by the design lane ("Bake now, check after"). NOT yet fit for the owner.** bim-ootb `c43d5b72`, sw v1703, `--gpu real --drawn-services` under `gpu.lock`, film + log kept private (never committed). 2,080 frames, all converged, 0 page errors, `§CLI_BAKE_POSECHECK` MATCH, `§CLI_BAKE_DRAWN_SERVICES drawnServices=1`. start() keeps the overlay: at frame ~1713 the cease sweep found all 23 objects still drawing.
   - **DEFECT 1 (measured in the log):** from the closing movement (`storey-reveal-onset`, frame ~1714) to the end (2079), `§FINDINGS_CEASE_3D` hides the drawn-services lines, markers and labels as UNREGISTERED depthTest:false objects. That is 366 frames with 0 overlay where verb 6 said SEES (DRAWN_SERVICES_FILM §3, the named open hazard). Fix: register the overlay as its own layer; whether it is exempt from the ending-orbit cease is the owner's call.
   - **DEFECT 2 (code read, not measured per frame):** the build-up ignores the drawn-only isolate. `viewer/tm_render.js:353-397` sets batched slots from the schedule alone, and no `tm_*.js` file reads `A.activeGuidFilter` (set by `panels.js:862-864`). The build-up covers 7,169 of 7,171 elements, so the 514 hidden borrowed/walked devices most likely reappear as they are built. Fix: the TM reveal honours the active isolate (one owner of visibility), or bake with `--no-buildup`. To confirm, a probe frame counts visible slots of the hidden GUIDs.
   - The bake has no per-frame overlay count. Add a `§DRAWN-OVERLAY` frame line (visible objects per frame) so the next bake can be judged from its log.
   - Captions filled from § lines (343 m of duct, 205 terminals; 11 FP items at 1.2 m), not burned yet. Design lane asked: fix + re-bake, re-bake `--no-buildup`, or owner ruling first.

6. ✅ **Fixed + re-baked** (owner: "Exempt drawn services", "Fix, then re-bake"). bim-ootb **#2742** (merged `1f693f14`), spec + RESULT in bim-ootb `prompts/DRAWN_SERVICES_FILM.md` §7-§8:
   - The overlay registers as the film layer `drawn.services`; the ending-orbit cease keeps that NAMED subject layer, and the net is unchanged for everything else.
   - `tm_render.js` ANDs the build-up with the active isolate (the `§REVEAL_DOOR_LEAK` split).
   - New per-frame `§DRAWN-OVERLAY-FRAME` line.
   - W-DRAWN-FILM-FRAME 6/0: P0 on main 47/125/191/237 of 299 → 0, plus red controls. W-CEASE 35 → 39/0. Regressions unchanged.
   - **Re-bake on `1f693f14`:** `visible=23/23` and `hiddenGuidVisible=0/514` on all 2,080 frames; cease `subject=23`; MATCH; 0 page errors. Captions burned (343 m, 205 terminals, 11 items at 1.2 m), windows from the verb-6 bands. Burn checked by bottom-band PSNR: 13-20 dB inside the windows, 49-53 dB outside. Captioned cut kept private; the first cut kept as "before". Sent to the design lane, which checks before the owner sees it.
7. ✅ **§BIMDOC-OPEN app side** (owner: "Shared file store, Modeller session"). bim-ootb **#2747** (merged `6c694c43`):
   - `common/file_store.js`: OPFS `bim_files/<sha256>`, dedup by hash, re-hash on get, sweep by the set of hashes still referenced, persist and same-origin logged.
   - `?open=store:<sha256>&name=` hands the file to each app's existing open route: Viewer IFC; Modeller IFC, DB and DXF.
   - W-FILESTORE 16/0, with red controls for altered and absent entries.
   - Headless `persist()` returns `granted=false`, which is logged.
   - Spec: bim-ootb `prompts/BIMDOC_OPEN_FILE_STORE.md`. The ERP side (put/sweep from attachments) is built separately.

**Next:** the design lane's verdict on the captioned cut; the ERP side of §BIMDOC-OPEN is someone else's build (`nvidia-smi`, design lane brings the owner the bake request, `cli_silent_bake.js --drawn-services` on `walked_film.db`). The bake is the first real test of `start()` keeping the overlay objects (DRAWN_SERVICES_FILM §6).

## ▶ §RESUME 2026-11-09 — (steps 1-3 done in 2026-11-09b above; steps 4-5 still stand)
**Goal (owner):** HVAC + FP walked successfully on the private ARC, then a film. The owner said *"go till that"*; the bake still goes through the design lane (`bim-compiler-8c`), with an `nvidia-smi` check first.
**Landed today (bim-ootb), each verified at its merged head:**
- **Drawn walk:**
  - #2725 drawn walk (mains_to_db, `--federate`, ACMV runs at void-middle height, drawn terminals replace borrowed);
  - #2726 FP equipment in the walk;
  - #2727 owner rulings: exposed under structure, `fp_sprinklered=unknown` means heads off, 1.2 m wall mount, outline floor test, storey match by elevation, federated storeys in metres, drawn-only view;
  - #2728 floor first;
  - #2729 point positions from block geometry, not the INSERT point;
  - #2730 + #2731 on the roof surface (highest roof layer on the deck).
- **Film path:** #2733 drawn services reach the film: `drawn_walk_line` / `drawn_walk_marker` export, the `viewer/cpe_drawn_services.js` film beat, the drawn-only view, `cli_silent_bake.js --drawn-services`.
- Specs: bim-ootb `prompts/DISC_WALK_DRAWN_INTEGRATION.md` §1-§11a, `prompts/DRAWN_SERVICES_FILM.md`.
- bim-compiler #425: NEURO prompt verbs 6-7 (`film_path_visibility`, `film_path_propose`). **The owner has started the NEURO session for them.**
**Private set, measured (design lane checked each step against its independent reads):**
- ACMV: drawn 555 pieces / 343.066 m, placed 554 (void 393, exposed 102, on roof 59), 1 plan only with a stated reason.
- Terminals: 205 of 221 placed.
- FP: 11 of 11 at 1.2 m; sprinkler heads off (1,926).
- Export tables: lines 554, markers 11, offset rows 4.
**Next, in order:**
1. **Re-run the page run** with the chunked export copy: the old single-string copy hit the protocol timeout on a large DB. The script and the paths are in the private walk folder (the design lane has the location), and the script takes `BIMOOTB_TREE`.
2. Open the exported Viewer DB in the Viewer: `drawnServicesEnable(true)`, then read `§DRAWN-OVERLAY` / `§DRAWN-ONLY`.
3. Carry the corrected film DB's `cinema_path` by `p_new = p_film + film_offset - route_offset` (GUID-checked) and the corrected material names into it.
4. When the NEURO session lands verb 6, run it on that DB, then send the design lane the per-band counts. A band that sees nothing goes to the owner.
5. `nvidia-smi`, then the design lane brings the owner the bake request and captions (numbers from § lines), then `cli_silent_bake.js --drawn-services`.
**Lessons:**
- 3 squash orphans this session; a follow-up commit goes on a fresh branch (memory `feedback_followup_fresh_branch_not_open_pr`).
- Privacy covers coordinates, sheet codes and the project folder name.
- bim-compiler master has no auto-merge; merge your own verified PR directly.
- Workers: Sonnet, one report each; verify every claimed witness yourself.

## ▶ §RESUME 2026-11-08b — (superseded as entry point by 2026-11-09 above)
**▶ NEXT SESSION, owner's choice 2026-11-08 ("Build pieces, then film"). Goal: a film of HVAC + FP walked successfully on the private ARC.** In order, each spec-first with a witness:
1. **Wire the drawn-mains reader into the walk.** ACMV on a building with held duct sheets: `§WALK-MAINS drawn=<m>`, runs from `drawn_route` rows, fit through the route's own `ifc_grid_axis`.
   - How a user supplies sheets is still the owner's §7 Q2. For the film, the sheets can be passed by the harness.
2. **Height §7.1:** the middle of the ceiling void, labelled provisional; no ceiling or no structure above means no z. Then ask the owner (through the design lane) about the Axis-only IfcDuctSegment export.
3. **§FP-EQUIPMENT** (spec below): the fire-equipment sheet's cabinets, extinguishers and blankets at their drawn spots. NO sprinklers, so the walk's band FP heads stay out of the film by the owner's ruling.
4. **Walk** a fresh open of the private ARC IFC on the open route. Carry the corrected film DB's camera path by `p_new = p_film + film_offset - route_offset` (now 1 m in y on both routes), plus the corrected material names. Assert by GUID residual.
5. **Bake only on the owner's word**, through the design lane. Check `nvidia-smi` first, and never beside a live owner bake. Use the playbook in `prompts/FILM_NARRATION.md`; the film states its limits ("no sprinklers drawn; asked"; "duct heights provisional").

**LATEST (end of session):**
- **Offset fix, bim-ootb #2711, merged (owner: "same input now").** Both routes pass the same rows to the pin: `GeorefFrame.pinInput`, the import's set; W-ONE-FRAME F1d. **✅ Confirmed on the private ARC (design lane, main 545f8a5e):** both routes give the IDENTICAL offset (= the import's earlier one); grid exact, 222/222 at 0.00 mm; the film DB coincides with both fresh opens to 0.0000 m over 2,093 GUIDs. The film-path shift is now the same on both routes (1 m in y, from the federated film DB); the carry rule still applies. **ONE FRAME (A) is DONE on the private set; the film path is clear on the frame side.** The stated-placement rule is out.
- **Privacy:** the private site's coordinates had leaked into public files. Scrubbed by #2718 (owner: "Scrub files only"; NO history rewrite, NO force-push). Far fixtures use the generic point (500000, 3000000). Never write a private number into a public file (memory `feedback_private_project_no_names_in_public`).
- **ONE FRAME (A), bim-ootb #2710 (`fbe06d64`), merged and live.** W-ONE-FRAME 28/0. Public far Duplex round trip: drift 0.497 m → 0.0000 m. The import's lat/long reader was broken and is fixed: the private ARC now records lat/long/true north on both routes.
- **Design lane on the private ARC:** the grid is EXACT on both routes. The film DB coincides with a fresh open on both routes: residual 0.0000 m over 2,093 GUIDs.
- **BUT the routes give different offsets:** 11 m apart in y. Cause under trace: each route passes its own element list to `GF.range()`, a midpoint of extents. Fix in progress on branch `fix/one-frame-same-input`, worktree `/tmp/wt-frame2`: both routes pass the SAME set (W-ONE-FRAME F1b, with a red control). If no worker report exists, re-dispatch from the branch.
- The design lane's alternative, an offset from the file's STATED placement, changes the rule's meaning: it needs the owner's word.
- **Film camera-path RULE:** `p_new = p_film + film_offset - route_offset`. The film DB is a federated ARC+STR open with its own offset. Never copy coordinates raw. Assert a GUID-matched residual (a bbox test is too weak).
- **Private round trip after (A):** the export is 750 MB (was 598). The re-open failed (web-ifc out-of-bounds), so B is INCONCLUSIVE. The walk placed 2,823 (was 2,831): the origin-anchored band grid (owner: leave it). Mesh dedup in the export fixes should bring the size back under the limit.
- **Next (design lane's order):** the film path first: fresh open on the open route, Walk ALL, height §7.1, then §FP-EQUIPMENT below. After that, export (B) and the export fixes (1)-(5).

**Landed today, live, fetched back (bim-ootb):**
- #2698: P7, Viewer totals leave provisional devices out.
- #2700, #2701, #2704: the drawn-mains reader `modeller/drawn_mains.js`.
  - Plan-level duct centrelines, fitted to ONE held grid. Grid tags are read inside linked-model blocks. US NCS layer rows. Guarded mirror correction. Tie-break: more tags, then the sheet's storey.
  - W-DRAWN-MAINS 53/0.
  - **Real set (design lane):** 4 private duct sheets fit at 0 mm; 343.07 m against an independent 343.1 m. Mirror correction confirmed (one duct sheet 107 → 2 unjoined).
- #2702 grid carrier `ifc_grid_axis`, both IFC open routes, W-IFC-GRID 29/0. MERGED as `8d1ede96`. Live (Viewer sw v1700, Modeller sw v245).
- Spec for all of it: bim-ootb `prompts/DISC_WALK_DRAWN_MAINS.md` §4.2a, §4.3, amendments 1-3 and the RESULTs.
**Owner's goal (relayed 2026-11-08): HVAC + FP walking succeed on the private ARC, then a film of it. Rulings:**
- FP "walked" = "Drawn equipment + ask". Place the fire equipment the fire-equipment sheet draws (cabinets, extinguishers, blankets) at its drawn spots. No sprinklers until the reviewer answers or sends FP drawings, and the film says so. The package holds no sprinkler or FP pipe sheets.
- Film input = "Fresh open + corrected path". Walk on a fresh open of the private ARC IFC (rooms present), then carry the corrected film DB's camera path and material names into it for the bake. Bake only on the owner's word, through the design lane.
- The film is baked from the walked DB, not the exported IFC, so the export fixes (1)-(5) must not block the walk or the film.
**Export round trip (W-EXPORT-ROUNDTRIP, #2705/#2706):**
- Public Duplex and SampleHouse: positions exact. Storeys, GlobalIds, spaces, fills/voids, psets, types, site and MEP systems are all lost.
- Private ARC: the same, plus 1,284 of 4,147 matched elements moved > 1 cm (median 7 mm).
- Hypothesis: float32 precision at map coordinates, since the open route keeps raw map coords. Being tested on Duplex shifted to a far map-scale point.
- Fix order: (0) frame/position (ONE FRAME on the open route, if the precision test confirms); then the walk on a fresh open + height for the film; then export (1) GlobalId + storeys, (2) all bodies + discipline + colour + mesh dedup via the existing geometry_hash sharing, (3) spaces/psets/fills/voids/types/grid, (4) site lat/long/true north + name, (5) MEP systems + ports.
**§FP-EQUIPMENT SPEC (2026-11-08; data measured by the design lane on the private the fire-equipment sheet sheet; owner's FP ruling "Drawn equipment + ask"). Not built. Move it into bim-ootb `prompts/DISC_WALK_DRAWN_MAINS.md` as §10 when building.**
- **Reader:** the drawn-mains reader (`modeller/drawn_mains.js`) gains an `equipment` role: point items, no runs. It reuses the same sheet fit (one held grid), the nested-block expansion, missing-block logging and the mirror guard.
- **Rows (US NCS, fine to commit):**
  - equipment = top-level INSERTs on `M-EQPM` and `P-SANR-FIXT`;
  - KIND from block-name words, not the layer (extinguishers are split across both layers): `FIRE CABINET` → cabinet; `EXTINGUISHER` → extinguisher (foam 9 L and 4 kg dry powder families); `Fire_Blanket` / `FB` → blanket;
  - grid = `S-GRID` LINE + `S-GRID-IDEN` MTEXT (the existing patterns cover it);
  - the layer-0 linked-model INSERT is background: ignore it for equipment.
- **Duplicates:** the sheet stacks copies at one spot, 16 inserts for 11 distinct items. Collapse identical kind + block name + position within 10 mm and log `stacked=`. Distinct on that sheet: cabinets 3, blankets 4, foam extinguishers 2, powder extinguishers 2.
- **IFC class (design lane's advice; the owner may overrule):** IfcFireSuppressionTerminal, PredefinedType USERDEFINED, ObjectType from the word (FIRECABINET / FIREEXTINGUISHER / FIREBLANKET); HOSEREEL only when the sheet says hose reel (these cabinets say "EMPTY"). Discipline FP. One data row per word. Not IfcFurnishingElement.
- **Provenance:** `drawn` position, sheet + fit numbers. **Height: none stated. Ask the design lane / owner before giving one** (no wall-mounted height rule is held).
- **Witness:** the stack of 3 at one spot gives 1 item (red control: no collapse gives 3). The mirror guard logs fired=no on this sheet (a real negative). The kind comes from the word even when the layer differs.
- **Film:** FP = these items at their drawn spots; the film states "no sprinklers drawn; asked".
**Owner's rulings today:**
- Viewer totals: "Leave them out".
- Grid: "Yes, keep the grid".
- **Queue: carrier → export gaps (storeys + routed runs reach the IFC) → height (§7.1) → fit real sheets.**
**Next, in order:**
1. ✅ Grid carrier on the private ARC, both routes EXACT (design lane): open route 222/222 axes, 24/24 grids, tags and storeys equal, ends 0.00 mm in the map frame; import route the same at 0.00 mm after its own element-frame offset. So the reader can take each route's grid directly. STR not run.
2. **Export gaps** (owner's queue item 2): spec draft written, `§EXPORT-ROUNDTRIP` below; measure first. Also the owner's ONE-FRAME ruling, corrected: "Local + recorded offset" on both routes. The change is the Modeller OPEN route (this lane) plus site lat/long on both. Spec before code; see §EXPORT-ROUNDTRIP. Measured in G2 (§RESUME 2026-11-07): the walked export held 0 `IfcBuildingStorey` (everything contained directly in the building), none of the routed runs (0 swept solids, 0 ports), and 2,323 of 6,461 elements on the merged import. Owner of the writer: `modeller/bonsai_ifc.js`.
3. Height §7.1, then fit real sheets through the carrier, then the owner's §7 Q2 (how a user supplies sheets).
**For the owner, open:**
- The design lane proposes exporting a run as an IfcDuctSegment with an Axis representation only (no Body), labelled provisional height. Ask when the height step comes up.
- Still not changed: the 4D schedule, egress FP presence, rule_report sufficiency and the offline QTO still count provisional devices.
- Origin-grid band finding not ruled; the design lane advises against spending on it.
**Notes:**
- Heap climbs 75 → 394 MB across 4 sheets in one process (reader, not traced).
- bim-ootb ESLint no-undef gate: every new browser global goes in `eslint.globals.json`, or fast-checks fails.
- **Pages now serves MINIFIED files.** Seen from the `8d1ede96` build: a fetch-back is no longer byte-identical to git. Verify by content markers (a `§` tag, a table name), not `cmp`.
- Worktrees used today are all pruned.

## ▶ §RESUME 2026-11-08 — (superseded as entry point by 2026-11-08b above)
**Landed since 2026-11-07c, all live and fetched back:** #2691 trunk on real wall boxes · #2692 trunk is a proposal (N10) · #2695 §11 band rows provisional (modeller sw v242; IFC set `BIMOOTB_Walk`; Viewer DB keeps it in `element_pset_common`) · doctrine §4 band line (owner's OK) · all 29 bim-compiler + 10 build/ walker witnesses on the shipped walker; nothing executable reads `build/disc_walker.js`.
**Next, in order:**
1. **✅ DONE (W-PROV-TOTALS 15/15), bim-ootb #2698 (`50fbbc28`, viewer sw v1699), live and fetched back (`provisional_totals.js` byte-identical).** One owner `viewer/provisional_totals.js`; 74 swaps in 17 files; resident DBs run the same `COUNT(*)`; all-provisional class stays at (0); rows listed and labelled `· provisional`. Spec + RESULT: bim-ootb `prompts/DISC_WALK_BAND_NO_HOST.md` "§11 P7". **For the owner, not changed:** 4D schedule still schedules provisional devices; `egress_sanity.js` counts provisional sprinklers as FP present; `rule_report.js` sufficiency probes; offline `mep_qto_populate.js`. **Design lane finding, not ruled (2026-11-08):** band cells snap to a grid anchored at world 0,0 (`disc_walker.js:851-852,876`), so open vs import frames give 47 of 706 matching band spots; provisional only, fix waits for the owner. Original item text: **§11 P7, Viewer totals leave provisional out** (owner: *"Leave them out"*; spec `prompts/DISC_WALK_BAND_NO_HOST.md` §11 Viewer paragraph). A provisional device in a Viewer DB = a row in `element_pset_common` with `pset='BIMOOTB_Walk' AND name='Provisional' AND value='TRUE'`. **One shared exclusion, not a patch per panel** (AD-layer spirit): one function in the Viewer returning that predicate, applied at every count site. Count sites found by `grep -nE "GROUP BY (m\.)?ifc_class" viewer/*.js` (2026-11-08): `diff.js:359`, `cpe_resource_panel.js:667`, `cost_panel.js:86`, `decoder.js:244`, `rule_report.js:345`, `fx_cinema_path_plan.js:189` (per room), `nf_panel_search.js:272,287`, `nlp.js:112-144`; also check `clash_report.js`, `print_sheet.js`, `light_zones.js`, `nf_isolate_drill.js`, `fx_still_refine.js` for counts. The Find panel's room injection and auto-inject are NOT touched (owner's boundary); only totals change. Witness P7: same DB's totals with and without provisional rows, red control a switch that counts them; a DB with no walk set must give byte-identical totals. **Design lane confirmed (2026-11-08):** `nf_panel_search.js:272,287` (`_populateTypes`, the Type dropdown's "(n)" and "n matches") IS a total, inside the ruling. (a) A type whose rows are all provisional stays in the dropdown with count 0, so its devices can still be found; no provisional count in the label (owner chose "leave them out", not "count them labelled"). (b) The list a chosen type opens and any "n results" line are count sites too: same shared exclusion, so label and result count agree; the devices themselves stay listed and labelled.
2. **Drawn-mains reader** (owner's go, after §11: done). Spec `prompts/DISC_WALK_DRAWN_MAINS.md`; ducts first; pipe layers need their own data row before FP/PLB (design: water sheets' centreline layer held only fitting stubs). Run height ruled in §7.1 (middle of the ceiling void, provisional; no ceiling or no structure above = plan only; centrelines, no assumed depth). Open item: where each open route holds the building grid; §4.2 says refuse if none.
3. **Owner, open:** remove `build/disc_walker.js` (now unread); gate ELEC like the others (it still reaches `planTrunk` automatically); roof_bound B2 red, unclassified; Clinic still has 2,514 trunk crossings, not traced.
**Instrument lessons from today, so nobody repeats them:** a red control that defaults to a live tree goes vacuous the moment its fix merges (twice): pin it to a commit. W-MEP-OPENPATH's tube census raced a redraw; it now re-takes the census until stable. A router module used without `DiscWalker` on its global falls back to row boxes and says `boxFromRow` in its log: read that line.

## ▶ §RESUME 2026-11-07c — START HERE (paused for a machine suspend, owner's request; then §RESUME 2026-11-07b below)
**✅ MERGED 2026-11-08: §11 band rows provisional, bim-ootb #2695 (`c5ddd579`, modeller sw v242), live and fetched back; the owner saw the fleet effect (placed 68,237 → 950, 79 walks at 0) and approved it and the doctrine §4 line. RESULT in the spec. Next: P7 Viewer class and room totals leave provisional out (owner: "Leave them out", spec §11 P7), then the drawn-mains reader (owner's go, ducts first). The text below is the pre-merge record.** ~~In flight~~ , pushed, NOT merged, NOT tested: bim-ootb branch `feat/band-provisional`, worktree `/tmp/wt-prov` (if /tmp was cleared: `git worktree add /tmp/wt-prov feat/band-provisional`). It is §11 of `prompts/DISC_WALK_BAND_NO_HOST.md` (owner, relayed: "Yes to all four"; scope fixed by the design lane: EVERY band row is provisional, bound, unhosted AND not judged; P2 per class = placed + provisional + refused = input).
- **Built in the commit:** `p.provisional` on every band row; `placed`/`provisional` split on all three walk paths (`_countSplit`, red switch `__dwCountProvisional`); the §11 trap guarded in `_discWalkOneBody` (refused, LOD400 and fallback branches use placed + provisional) and in `walk_node_harness`; status `N placed · M provisional`; walk-all total; Outliner `n placed · m provisional`; leaf label `· provisional`; `_dw.provisional` committed and read back; fleet columns. Modeller sw v242.
- **Not built, in order:** (1) IFC: design chose option (a). Custom set `BIMOOTB_Walk` (not `Pset_`) with `Provisional`, `Provenance`, `HostState` on EVERY walked fixture; one set per distinct value combination + one `IfcRelDefinesByProperties` each; log count and heap. Witness: export, re-open, read back, provisional count = `w.provisional`; red controls: flag off reads false, writer switch off writes no set. Say in the PR whether an IFC validator was run. (2) `viewer_db_export.js`: confirm `_dw` (or an equivalent) carries the flag into an exported DB. (3) List for the owner, do not change: the Viewer may count walked rows in class or room totals when opening an exported DB; the Find panel stays out of scope. (4) Witnesses P1-P6 in W-BAND-NO-HOST; P5 MUST include a walk whose only rows are not-judged band rows (PLB on an ARC-only resident) and show it takes no refused or §SCHED-FALLBACK path. (5) Fleet before/after vs main; print every walk whose placed goes to 0 by name (long: PLB and STR on ARC-only files). (6) Doctrine §4 GENERATED line: show the owner the text at merge.
**Consumer list so far (goes in the PR):** takes a count: walker `placed` (3 paths), `_dwLod400Only`, refused/fallback branches, status, `§DISC-WALK` log, walk return, walk-all total, Outliner count, node harness, fleet table. Presence only: trunk list, reveal duration. Labels: `_commitDiscWalk`, `dw_instances_outliner.js`, op-log read-back. Still to read for counts: `bonsai_outliner.js`, `bonsai_itemdrag.js`, `modeller_history.js`, `str_walker_outliner.js`. No count: `bcf_export.js`.
**Landed today, after §RESUME 2026-11-07b:** #2681 host search; #2682 no stub runs (ACMV, FP, PLB); #2686 held reason; #2687 no band duct/pipe pieces; #2691 trunk on real wall boxes; #2692 trunk is a proposal (ELEC still reaches `planTrunk` automatically: owner); doctrine §4 rewritten with the owner's OK; all 29 bim-compiler walker witnesses on the shipped walker (§WITNESS-REPOINT). **Open for the owner:** remove `build/disc_walker.js` (nothing executable reads it now); gate ELEC like the others?; roof_bound B2 red and unclassified; the drawn-mains reader still waits for the owner's go (run height is now ruled, §7.1 of the mains spec).

## ▶ §RESUME 2026-11-07b — START HERE (session close; then §RESUME 2026-11-07 below for specs and measured results)
**Roles, relayed by the design session 2026-11-07, not told to this session directly:** *"you execute, I design"*. That session (notes: git-excluded `prompts/*_POC.md`) writes specs; this lane builds them. Its specs state owner approvals; check with the owner where an approval amends a locked doctrine section.
**Landed, live, fetched back (bim-ootb main `0295309a`, viewer sw v1698, modeller sw v235):** #2676 one record of a file's stated rooms on both JS routes (`ifc_spaces`, `spacesOf` reads it first) · #2677 declared storey ladder (`storey_elevation`), `§DUP_SHELL`, `§OPEN-VIEWER-SAVED`, page-order walk harness, W-WALKED-EXPORT-DB, W-WALK-ROUTED-NODE.
**✅ MERGED bim-ootb #2681 (`6b4d61f3`, modeller sw v236): host search by footprint and height, every band device accounted for.** Owner saw stop condition 2's table and said merge as built; doctrine §4 rewritten with the owner's OK. Read `prompts/DISC_WALK_BAND_NO_HOST.md` §10, §10.3. Band density stays open for the owner. Spec for drawn mains: bim-ootb `prompts/DISC_WALK_DRAWN_MAINS.md` (not built; design lane holds its own questions).
**⛔ Owner's questions, one at a time, in this order:**
1. **Band no-host rule, the spec's stop conditions 1 and 3 fired.** Terminal on its own rules keeps 15-30 % of ACMV, ELEC and FP. PLB and STR place nothing on any building (no host rule for them), 36 walks go to zero. Bound devices do not move and accounting holds on 85 of 85. Should it stand as written, apply only to classes a host rule covers, or does the host search's reach need looking at first?
   **Evidence added at close, design session's check (private notes, ledger F74; its advice, the owner has NOT ruled, do not build as decided):** `hostBind` itself looks like the first defect. Real devices at their real positions through the shipped `hostBind` with the same rule rows, Terminal + Hospital + JKR, 4,853 devices: 4,692 sit under a covering's plan box, 591 are refused (475 of those under a box), 4,262 bound onto only 978 distinct spots, moved a median of 1.4 to 2.75 m. Limits: 4,692 is an upper bound (no height check, `IfcCovering` not filtered by type, so floor finishes may count); band positions after a fix are untested. Code confirmed this session, `modeller/disc_walker.js` TOP/BOTTOM/CENTER branch: reach is measured to the host's centre (`Math.hypot(p.x - h.x, p.y - h.y)`, then `best > reach`), and a bound device takes the host's centre (`x: bh.x, y: bh.y`, L1444). W-BAND-NO-HOST's own 87 of 723 stacked devices is the same effect. **Advice, in order:** (1) host by footprint and height for area hosts, the device keeping its own XY, point hosts like windows unchanged; (2) apply the rule only where a host rule exists, PLB and STR reported as not judged; (3) re-run the fleet table with the same stop conditions, the test being that a real device stays put. This changes `hostBind`, which the band spec's §3 says stays as it is, so it needs the owner's word and a spec change first.
   **✅ OWNER RULED 2026-11-07 (answer to this question, option "Fix host search first"):** area hosts bind by footprint and height with the device keeping its own XY, point hosts unchanged; PLB and STR reported as not judged; re-run the fleet table with the same stop conditions. `hostBind` may change; the band spec is amended first (§3, on the branch). **Also the owner's, via the design session, then confirmed by the owner in the doctrine wording:** no ceiling object is not a refusal: placed, labelled `unhosted`. Other host rules refuse.
2. **G3 sequence ruling (§J.4).** Declared ladder only: midair 359 of 6,461 (baseline 384), but declared members fold into other tasks. Deriver axis: labels keep their tasks, midair 840. Default stays ladder only.
   **✅ OWNER RULED 2026-11-07 (option "Heights only, for now"):** ladder only stays the default; `levelSource:'deriver'` stays opt-in; labels that fold stay as they are until §J.4 is written.
3. **G1(b): where does an HVAC main's shape come from?** Routed runs today are unconnected stubs. Design lane's candidate: only from a drawn centreline, else no main and the walker says so. No reader for mains exists.
   **✅ OWNER RULED 2026-11-07 (option "Drawn centreline only"), for a file with no ducts in it:** a main exists only where a drawn centreline is held, otherwise no main and the walker says so; stub runs stop for these files. The reader for drawn mains is its own specced job.
   **✅ OWNER RULED 2026-11-07: the same for FP and PLB ("HVAC, FP and PLB"). ✅ MERGED bim-ootb #2682 (`c47562ad`, modeller sw v237), live, fetched back:** on a file with none of the service no pattern run is made, `§WALK-MAINS ... none reason=no sheet held`; real runs keep routing and say `real=`; a file holding the service with no routing row says `held=<n> real=0 reason=no routing rule pairs them` (§9.1, 7 fleet walks, modeller sw v238). Bridge engine witnesses run behind `__dwKeepPatternStubs`. `prompts/DISC_WALK_DRAWN_MAINS.md` §9, §9.1 RESULT. An FP `nn` routing row for Hospital is a separate job: measured data, not started.
4. **`§DUP_SHELL` is live and hides duplicates on residents** (HHS 142, Clinic 33, Duplex 1; display only). Tell the owner; undo is one line in `streaming.js`. ✅ Told, 2026-11-07; no objection so far.
5. Open on the design session's list: Modeller-route room finishes; whether the "complex" class is right for the private set.
**✅ Band duct and pipe pieces with no main: owner agreed they stop. MERGED bim-ootb #2687 (`6c3cb3ac`, modeller sw v239), live, fetched back:** counted as refused, reason `no-main`; fleet placed 110,583 → 68,237; SampleCastle and SampleHouse ACMV go to zero (35 mm flow pieces, not the window grilles). Mains spec §9.2 RESULT. W-TERM-NOSPACES T6, T8 and W-DWWALK-HOSTBIND W4 assert band pipes: update them when those scripts are repointed at the shipped walker.
**⛔ For the owner, open, in this order:** (a) band density: the design lane measured on the private set, after #2681, ACMV: terminals 706 against 269 drawn, and inside rooms positions no better than random points (bound 2.88 m vs 2.96, band 2.55 vs 2.73, schedule 1.47 vs 1.25). So the host search removed the pile-ups, it did not make borrowed positions accurate; (b) height of a drawn run (mains spec §7), which blocks any solid.
**§WITNESS-REPOINT (spec, 2026-11-07, design session's point, under the witness law).** Issue: `scripts/witness_*` tested `build/disc_walker.js`, an older copy, so W-TERM-NOSPACES and W-DWWALK-HOSTBIND stayed green while the shipped walker changed. Fix: the 7 walker scripts read the walker and rules through `scripts/dw_tree.js` (`DW_TREE`, default `~/bim-ootb`), which prints `§DW_TREE tree= commit= behindOriginMain=` and prints INCONCLUSIVE on a stale tree. Claims updated to the rule: W3, W4 (accounting, not "keeps the count"); T6, T8 grade the band GENERATOR through `{noHostBind}`; new T6b proves a user walk places no band pipe and counts each. `build/disc_walker.js` itself is left alone. **§WITNESS-REPOINT sweep 2026-11-07 (owner, relayed by the design session: repoint the remaining 19, "go with your take", this sweep only).** All 19 now read `scripts/dw_tree.js`; only walker, rules and seed trunk moved, fixtures stayed. Shipped walker = bim-ootb main `16b0b65a`.
| Witness | On `build/` copy | On shipped walker, as first run | Now | Class |
|---|---|---|---|---|
| assemble_connect, generalize_curve, generalize_xbuild, riser_trunk, route_face_surface, rule_connector, seed_default, seed_trunk, walkback_mep | pass | same | same | no change (6/0, 7/0, 7/0, 7/0, 6/0, 4/0, 6/0, 6/0, 8/0) |
| hostbind_agnostic | 11/0 | 10/1 (H1: 17 bound, expected 37) | 11/0 | **rule changed on purpose:** bisected to bim-ootb `0885b742` (§STOREY-UNKNOWN-EXCLUDE, §STOREY-ZBAND, own witness). Exact count updated to 17 with the reason. Crossing walker and rules shows it is the walker, not the data. Same 17 on the walker before today's rules |
| occ_true_midpoint | 17/0 | 15/2 | 17/0 | only runs H1 as a sub-check |
| rotation_convention | 13/0 | 9/4 | 13/0 | same |
| true_midpoint | 18/0 | 17/1 | 18/0 | same |
| hostbind_rotation | crash, 4 fail | same | INCONCLUSIVE | **tests something not there:** `_hostAxis` is in neither walker. Obsolete candidate for the owner |
| space_occupancy_exclusion | crash | same | INCONCLUSIVE | pre-fix walker it compares against is gone (old scratch path). `OCC_BASELINE_DW` to run it. Candidate for the owner |
| assemble | crash | same | INCONCLUSIVE | `library/disc_patterns.db` has no `_import_joint_piece_types`. Fixture absent, not judged |
| corridor_trunk | 5/1 | 5/1 | 5/1 | **FAILS, before and after, not caused by the repoint:** CT3 falsifier, 14 of 14 fixtures reach with or without door carving. Not traced |
| dx_walkback_rsgt | 13/1 | 13/1 | 13/1 | **FAILS, before and after:** W4 LOD400. Not traced |
| seedtrunk_engine | 5/1 | 5/1 | 5/1 | **FAILS, before and after:** E1 hard-codes the spike (25 served, 8 refused); the engine gives 26 and 7. Not traced |
**The 3 reds, traced 2026-11-07, stopped at the cause; nothing changed, still red:**
- **corridor_trunk CT3: an instrument error that hides a real defect in the shipped router.** Door carving DOES matter, and the falsifier works when the walls are in the right place: on true wall boxes (mesh middle) reach is 1 of 14 without doors, 14 of 14 with. The witness blocks walls at row centres, which leaves a gap. **`modeller/seed_trunk.js` `wallsNear` reads the same row centres in production.** Row-to-mesh shift: Duplex p50 0.122 m, max 3.120 m, 34 of 57 walls over 10 cm; SampleHouse max 0.879 m, 2 of 5. Scratch copy of the router on true boxes: served and refused unchanged, trunk length Duplex 217.6 → 187.6 m, SampleHouse 67.3 → 61.2 m. So trunks detour around walls that are not there. Not fixed: own spec and PR, owner's go.
- **seedtrunk_engine E1: walker changed on purpose.** Bisected across the 38 commits on `disc_walker.js` + `seed_trunk.js`: 25/8 up to `7a8e71db`, 26/7 from `8d161fa4` (2026-07-09, the true-midpoint port). Holds at every commit sampled after it. Its hard-coded numbers are a re-baseline candidate, with that reason. Not changed.
- **dx_walkback_rsgt W4: the witness reads the wrong source, neither a walker change nor a shipped data gap.** `noHash` 0, `placedMeshless` 0, the one failure is `dangling=SUPPLY_DIFFUSER`, hash `816d4dbdc5aec706` (20 rows of `rule_space_schedule`, on both rules DBs). It looks in `library/component_library.db`, which has no such row. The page resolves rule meshes from the served `Duplex_geo.db` (§DW-RULES-MESH), and that file holds it (fetched back, 2,016 bytes of vertices). The claim's own message also prints a pass-shaped sentence while failing. Not changed.
**build/ witnesses repointed 2026-11-07 (owner, relayed: "Yes to all four"; sub-checks first, then the rest, done as one sweep).** All 10 read `scripts/dw_tree.js`; shipped walker bim-ootb `29c22c9f`. Before (build copy) → after (shipped), each: disc_walk_generalize 49/0 → 49/0, disc_walk_duplex_generalize 12/0 → 12/0, disc_walk_density 43/0 → 43/0 (the 3 sub-checks), disc_prim 10/0 → 10/0, disc_route_nnchain 6/0 → 6/0, disc_tube_render 5/0 → 5/0, disc_walk_erp_equivalence 14/0 → 14/0, disc_walk_erp_landed 4/0 → 4/0, disc_walk_shim 6/0 → 6/0, **disc_walk_roof_bound 8/2 → 8/2: B2 COUNT-EXACT fails on both** (SampleCastle roof 8,334 vs 8,918 before, 7,706 vs 8,237 after; Duplex 2,808 vs 3,644, then 2,179 vs 2,868), not caused by the repoint, not traced. The 4 scripts that call the sub-checks, now wholly on shipped code: true_midpoint 18/0, occ_true_midpoint 17/0, rotation_convention 13/0, terminal_geosplit 12/0.
**The 3 reds, closed 2026-11-07.** CT3: the router fix (bim-ootb #2691, §TRUNK-BOX) and the witness's grid both read the real box; CT3 passes (1 of 14 without doors, 14 of 14 with), and its new CT3 RED shows row centres would hide it (14 of 14). E1: re-baselined to 30 / 26 / 7 citing `8d161fa4`, found by a binary search that assumes the value held after that commit; same on real boxes. W4: reads the served geometry file the page reads (base and version from the resident table, INCONCLUSIVE if unreachable), 12 of 12 meshes resolve; its unused 230 MB library load is gone. All three witnesses' failure lines now print `CLAIM NOT MET:` so a red can't read as a pass.
**build/ gap, counted:** 15 `build/witness_*.js`, 10 load `build/disc_walker.js`: disc_prim, disc_route_nnchain, disc_tube_render, disc_walk_density, disc_walk_duplex_generalize, disc_walk_erp_equivalence, disc_walk_erp_landed, disc_walk_generalize, disc_walk_roof_bound, disc_walk_shim. **3 are sub-checks of `scripts/witness_*`:** generalize and duplex_generalize (called by true_midpoint, occ_true_midpoint, rotation_convention, terminal_geosplit), density (occ_true_midpoint, rotation_convention, terminal_geosplit). So those 4 are green partly on old code. Outside the owner's sweep: a separate question. Stale `build/disc_walker.js` comments in rotation_convention say LIVE: fix when next touching that file.
No new failure is a walker regression. No assertion was loosened, nothing deleted, no walker change. **Still on the old copy:** `build/witness_disc_walk_generalize.js`, `_duplex_generalize.js`, `_density.js`, which live in `build/` and are run as sub-checks by true_midpoint and occ_true_midpoint, so those two are partly old-copy. `build/disc_walker.js` stays; whether to remove it is the owner's, once nothing reads it.
**Next for this lane once told:** build the drawn-mains reader (`prompts/DISC_WALK_DRAWN_MAINS.md`, not before the owner says so; it must find where each open route holds the grid). The design session runs the private ARC through the shipped import route and scores it; tell it when anything merges. W-DWWALK-HOSTBIND W3 still asserts the old count against `build/disc_walker.js`: update it when that script is repointed at the shipped walker.
**Baselines: state which code.** G RESULTS below are main `8dcd3ecf`, film DB. Re-import gives real rooms, so `spaces=0` stops being true on a fresh import. The film DB stays at 0 until re-imported, and it needs the private `BakeFilm_material.storey_elevation.sql` for the ladder (tested on a scratch copy only; the source DB was never written).
**Private outputs, not in any repo:** `modeller_lane_2026-11-07/` in the private project folder: logs, score per room, attribution, fleet JSONs, the storey patch, `walked_film.ifc` (553 MB, for the owner's Revit test; it holds 0 storeys, no routed runs, and only 2,323 of the DB's 6,461 elements).
**Witnesses are run by hand, none in CI.** W-E2E-EXPORT-DB is 5 PASS / 1 FAIL on main too (`§KRN_SEAL_ERR Database closed`), not caused here. W-UX-DISC B3, B4, B6 fail on main too. LTU_AHouse hits the sql.js wasm limit in the node fleet runner, so it is not judged.
**Do not repeat:** a harness that fails the real worker's `Init` reads as "0 rows" (it did, briefly); a local `Terminal_geo.db` resolves 0 rule hashes (use the served one); `pkill -f` with a pattern in the same shell kills that shell.

## ▶ §RESUME 2026-11-07 — read second (FP + HVAC walk on a real ARC+STR IFC: the foundation and the findings, implementation lane; then §RESUME 2026-11-02 below)
**Lane split, owner 2026-11-07:** a separate session reviews the private project's information (drawings, finishes, rooms, ledger; its notes are the git-excluded `prompts/*_POC.md` and `LOD400_UPGRADER.md`). That is INPUT here: read it, do not edit it, do not run its tools. THIS lane implements findings and does the gruntwork first. Names of the private set never go in this file (public repo); say "the private set".
**Material:** the private set's film DB `BakeFilm_material.db` (ARC+STR Revit IFCs, 6,461 elements, 32 IfcCovering, 53 compiled rooms), in the private project folder under `~/Projects/`; symlinked, gitignored, at bim-ootb `buildings/BakeFilm_material.db` and `..._extracted.db`. Scratch copies only: never write the source DB. Work in a `/tmp/wt-*` worktree (`git worktree list` first).
**Read first, in order:** `CLAUDE.md` (PRIMAL LAW, AD-layer law) → `docs/internal/WalkerDoctrine.md` §1-§3, §7 → `prompts/4D_MODEL_INTEGRITY.md` §E, §I (re-open before each measurement), §I.3/§I.3a, §J.4, §M.3 → code: `modeller/disc_walker.js` (dwBorrow ~L56, dwWalk ~L2460, `§WALK-HOSTBIND`, `§DW-CAP`, `_loadRuleShims`, `routeChains`), `modeller/routewalker.js`, `real_placement_resolver.js`, `bonsai_ifc.js` L225-275 (§M3-WALKED-CLASS), `modeller.html` `_commitDiscWalk`, `modeller/tests/witness_walked_export.js`, bim-compiler `scripts/witness_borrow_fp.js` (+ `logs/witness_borrow_fp_2026-09-24T0210.log`), `scripts/film_deterministic_bim/fp_walk.js` (`DISC=FP|ACMV`, `FP_JSON=`).
**BASELINES (measured 2026-11-07, scratch copy, `terminal_rules.db`; claim any improvement against these, from § lines):**
| walk | placed | classes | host-bind (BOTTOM of IfcCovering) | chains |
|---|---:|---|---|---|
| FP | 2,272 | 2,163 IfcFireSuppressionTerminal + 109 IfcAlarm | 565 bound / 1,598 refused | 0 |
| ACMV | 3,649 | 3,619 IfcAirTerminal + 15 IfcDuctSegment + 15 IfcDuctFitting | terminals 1,071 / 2,548; ducts 8 / 7 | 0 (`DuctSegment→DuctFitting:no-endpoints`, `§WALK-PATTERN REFUSE routewalker.js pattern engine not loaded`) |
4D (`node scripts/cache_4d_run.js BakeFilm_material`, cache `~/.cache/bim4d/BakeFilm_material/`): `§TM_PLAYED_LAYER midairPlayed=384` of 6,461 (IfcBeam 163 of 3,760, IfcSlab 71, IfcMember 39, IfcFlowTerminal 29, IfcFooting 28, IfcColumn 27), `midairCpmDisplay=349`; geometry check `§RULE_COVERAGE floating_member judged=3760 findings=37` (a SEPARATE test, not a subset). Storey ladder is `source=center_z` (7 compiled storeys, `object_type=COMPILED`) while the IFCs declare 8 (ARC, metres) + 11 (STR, MILLIMETRES); 3,718 members sit in a declared storey that has no task and fold into another task; 43 element pairs overlap at bbox IoU > 0.9 (one tall element is two coincident shells, IoU 0.985) = the shimmer.
**GRUNTWORK, in order (spec section first for each; `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>` and move on; a witness must be able to print NO-OP / VACUOUS / WRONG):**
- **G1 HVAC foundation (owner: "begin building some underlying foundation for HVAC first").** (a) Load `routewalker.js` in the node harness the way `modeller.html` does; re-run `DISC=ACMV`; goal `§WALK chains>0` with `chainByRule` printed. (b) Give duct pieces ports/endpoints (doctrine §3, oracle `W-WALKBACK-MEP`): find what `dwWalk` expects and what the terminal_rules rows carry; no invented geometry. (c) Score walker air terminals against the DRAWN HVAC from the private notes (ledger F63: the four duct sheets centrelines 343.1 m, terminals and equipment as XY blocks), per room, count and XY. Report the gap; do not tune to it.
- **G2 Write-back, run it for real.** Open the film DB in the Modeller, Walk all services, export IFC, count `IFCFIRESUPPRESSIONTERMINAL` / `IFCAIRTERMINAL` in the file; the witness `witness_walked_export.js` is INCONCLUSIVE here (its marked shed set `.../dxf2bim_film_work/why/cli/marked` is absent), so add a leg that runs on this DB. Revit import is the owner's step. Until a count exists, say "built, not run".
- **G3 Storey ladder from the IFC.** Convert each file's storey `Elevation` by its `IfcUnitAssignment`, merge one ladder, give every declared storey that holds elements a task. New §I row first (owner of "which storey is this element on?"; LevelDeriver is wired and OFF, §I.3a). Witness: ladder monotone in metres, 0 storeys with elements and no task, fleet non-regression via the persisted caches.
- **G4 Duplicate shells (`§DUP_SHELL`), generic.** Same class + same material + overlap above a threshold: hide the later one, log `kept= hidden= iou=`; different-material pairs are kept and logged. Witness: the 43 pairs listed, the coincident-shell pair resolved, fleet pair counts unchanged where none exist.
- **G5 Attribute the 384 before any fix** (§J.6 style: by class, task, relation of the elected support, in the structural pool or not). Re-run the cache after G3 and G4 and compare to the baseline. The sequence rule (§J.4) is still unwritten: any fix that needs it is `⛔ BLOCKED`.
**Owner decisions, do not guess:** the host rule for a ceiling-poor IFC (may a compiled room's ceiling plane host? 1,598 FP and 2,548 ACMV terminals are refused today, refusal is the honest answer until told); which rules DB class this building takes (the baselines used `terminal_rules.db` = "complex"); any productivity or sequence ruling.
**§G1 SPEC (written before the code, 2026-11-07).** Issue: the baseline's `chains=0` was measured by a harness that (i) never loads `routewalker.js` and (ii) calls `dwWalk` bare, i.e. the LEGACY path, while the page calls `{schedule:true,geoDb,avoid}` first and falls back (`modeller.html` `_discWalkOne`). So the baseline cannot say whether the live path routes.
- **G1(a) harness + witness, bim-ootb `modeller/tests/walk_node_harness.js` + `witness_walk_routed_node.js`.** Same order as the page: `WalkRules.rulesDb(name)` (`dwOpen`), `WalkRules.scheduleDb(name)` (`dwScheduleSource`), `_dwEnsureBorrow`'s rule, the REAL `rwInit` (only `_rwFetchCached` replaced by a file read, node has no IndexedDB), `SeedTrunk` global, §ANCHOR-BLIND delete, `dwWalk(schedule:true)` then §SCHED-FALLBACK. DB path by env, never written (hash before/after). Claims: engine loaded (`§RW_INIT patterns>0`, else INCONCLUSIVE); RED CONTROL `_rwReady=false` reproduces the baseline's REFUSE (proves the engine is what changes it); `chainSegs>0` with `chainByRule` printed (0 segs prints the refusal cause, not PASS); placements unchanged by routing; each run's ends sit on a real anchor. A resident that is ARC-only gets the same run, so nothing is shaped to one building.
- **G1(b) ports.** Find by code read + rows what `dwWalk` expects (`routeChains` pairs REAL `elements_meta` rows by `rule_routing`; generated pieces are not in the DB, so `no-endpoints` on an ARC+STR file is the honest state, not a missing port). No invented geometry; a port claim must trace to a `terminal_rules` row or an IFC port.
- **G1(c) score.** Walker terminals vs the drawn terminals, per room, count and XY, from private-lane data (`rosetta/assigned.json`, 248 of 269). Report only, no tuning. Results go to the private notes; this file gets generic counts only.

**§G3 SPEC (written before the code, 2026-11-07).** Issue: an imported file's own storey `Elevation` is never kept. So the ladder comes from compiled mid-wall rows (`source=center_z`), and a member declared on a storey missing from that ladder folds into another task. Owners stay as §I has them; no second copy.
- **Carrier, `storey_elevation` (import path: `viewer/ifc_declared_storeys.js`, `import_worker.js`, `import.js` merge, `import_db_builder.js`). CORRECTED while building: the first text named a new `ifc_storeys` table, but the shared extractor already writes this one (§L1.6), so that would have been a second owner.** `guid, name, elevation_attr_m, placement_z_m`. `unit_scale` from the file's `IfcUnitAssignment` (SI prefix or conversion-based unit, feet included). `elevation_m` is rounded to 0.1 mm (Revit float noise) and is in the geometry frame (minus the import's whole-metre z offset). A name `normalizeStorey` folds (`… Ceiling`, `… TOS`) is counted, not written: no rung. **Not `spatial_structure`: the Find panel's rooms are untouched** (`nf_tree_lens.js:297` reads IfcSpace only, and this writes no room).
- **Ladder, `_storeyDatumCandidates`:** `storey_elevation` goes ahead of a compiled rung, after `spatial_structure.elevation`, when present; `_chooseStoreyDatum`'s frame test still judges it. **CORRECTED by the witness 2026-11-07: this test does NOT catch a unit error.** A millimetre ladder read at scale 1 still contains the geometry's median and passes. So the unit reader, proven by hand-calculated cases plus two independent readers on the real files, is the only guard.
- **Level, `LevelDeriver.readLookups`:** where the table exists (an extractor-route DB too), its rows replace the compiled `STC_` rows (declared wins, §S34.3: *declared where the element reaches the storey it claims, geometry where it does not*).
- **Task grid: WITHDRAWN from the spec after measuring (see §G3 RESULT).** The spec had the §TPL_LEVEL_AXIS deriver axis switch on per building when the frame test chose `ifc_storeys`. Measured, that raises played midair 384 → 840, so the axis stays opt-in (`levelSource:'deriver'`, unchanged) and the choice goes to the owner. No table = the candidate list is exactly what it was; `_GANTT_CACHE_VERSION` is not bumped.
- **Existing DB:** a generic tool (`tools/ifc_storeys_patch.py <ifc>...`) writes the patch SQL. Private DB patched on a scratch copy only.
- **Witness `W-IFC-STOREYS`.** Units hand-calculated (m, mm, ft) + a reference plane not a rung; RED: the same mm file read at scale 1 must be refused by the frame test; no table = same choice as before; real set: ladder monotone in metres, 0 storeys with elements and no task, printed name→task; fleet: run.json schedule unchanged against main's cache (not vacuous: states which buildings were compared).

**§G4 SPEC (written before the code, 2026-11-07).** Issue: two elements occupying one place fight on screen (the shimmer). Rule as ordered: same class + same material + overlap above a threshold: hide the later one, log `kept= hidden= iou=`; different-material pairs are kept and logged.
- **Measured first, on a 28-degree-rotated plan: the axis-aligned box is the wrong test (§E).** Two different members share an AABB at IoU 0.949 and their real mesh-frame IoU is 0.360; hiding on AABB would delete a real member. So AABB finds candidates only. The verdict is box IoU in a frame fitted to each mesh (PCA of its vertices), the smaller of the two frames, threshold 0.9 (the threshold the baseline's pair count was stated at).
- **`viewer/dup_shell.js` (pure), called once from the local-DB branch of the stream queue, before the camera sort.** "Later" = later in DB order, in a chain the first stays. Display only: `elements_meta` and every count, schedule and export are untouched. An instance rotation, or no mesh at hand (range-served split DB), is `unjudged`: logged, never hidden. Cost on the § line (`ms=`, `meshesRead=`), no buffer kept.
- **Witness `W-DUP-SHELL`.** Hand-built: identical pair hidden; shifted coincident pair hidden; two parallel diagonal walls (AABB high, real overlap low) NOT hidden (RED: AABB alone would hide them); different material kept and logged; different class never paired. Real set: every pair listed with its verdict. Fleet: pair counts per building, each stated, so a resident that has duplicates is named rather than passed.

**§G RESULTS (2026-11-07, from § logs; a rules engine, not custom to any design; room-level detail stays in the private lane folder `modeller_lane_2026-11-07/` under the private project).**
- **BASELINE CORRECTION.** The table above is the bare legacy `dwWalk`, not what the page runs. The page's order on main (`8dcd3ecf`), same DB: ACMV 2,405 (681 IfcAirTerminal, 1,080 IfcDuctFitting, 644 IfcDuctSegment; hostBound 238), FP 2,067 (1,904 + 163 IfcAlarm; hostBound 141). `§DW-SPACE-TYPE spaces=0 VACUOUS`: the DB's 53 rooms are all `RM_`, excluded on purpose, so these are measured bands. Claim improvements against these, and state which code a number used; the band no-host rule below will lower them.
- **G1(a) ✅ DONE (W-WALK-ROUTED-NODE, `modeller/tests/witness_walk_routed_node.js`).** Engine loaded in node through the real `rwInit`; red control with the engine off reproduces the baseline refusal. ACMV `chainSegs=1826`, FP 1,344. **But W6 FAILS, and it should: these runs are not a network.** ACMV 3,649 nodes in 1,823 components, largest 5, seed not on it; FP 2,680 / 1,336 / largest 10. 8.6 km of duct against 343 m drawn. Causes, code read: (i) `_rwPairSegments` (inherited from `RouteWalker.java:218-234`) lets a junction pick itself as nearest, `minDist===0`, so a junction-to-junction step fires only from a junction already used; (ii) ACMV's pattern has no METER step, so none ever is; (iii) on this DB the seed door has storey `Unknown`, so FP's METER step finds no junction either. Probe, not shipped: removing the self-pair and re-keying the seed gives 9,642 runs, 2,386 components, largest 326. So patching the pairing does not produce a network. Duplex ACMV: 0 runs (`0/0@77`), so a no-network result is not special to this building.
- **G1(b) ⛔ BLOCKED: where does an HVAC main's shape come from?** `routeChains` pairs REAL `elements_meta` rows, so `no-endpoints` on a file with no ducts is the honest state, not a missing port. No port source exists: `rule_connector` has ELEC and FP rows only, `ad_assembly_connector` and `ad_bom` hold no duct assembly (the sprinkler has one, §D65). Design lane's candidate: the plan route comes only from a drawn centreline where a drawing is held, otherwise no main and the walker says so (fits doctrine §4). No reader for mains exists.
- **G1(c) ✅ DONE, report only, no tuning.** Walker 681 air terminals against 269 drawn devices (267 assigned to rooms, all four assignment rules). 101 land inside an author's room, 580 outside every room at that level (434 at or above the top room floor, 464 outside all rooms in plan). Of 44 rooms with a drawn device: walker places 0 in 33, exact count in 0, per-room count r=0.636. Nearest walker terminal to a drawn device: ground band median 2.78 m (independent-points baseline 1.57 m), upper band 10.43 m (baseline 1.72 m). So the walker's positions do not track the drawn ones, and are worse than chance at this density.
- **G3 ⛔ BLOCKED on one ruling (ladder shipped).** Table + candidate + tool built per §G3 SPEC. Written to the extractor's existing `storey_elevation`; both JS routes agree on public Duplex. Ladder monotone in metres, 12 rungs from two files in different units; two independent readers agree on all 19 storeys (worst diff 0). **Fleet non-regression PROVEN:** Duplex 1,119, HHS 6,839, Terminal 48,428, Hospital 63,182 elements: `els`, `sched`, `play`, `tasks` byte-identical main vs branch. **The ruling:** ladder only = played midair 359 (baseline 384) but declared members fold (2,669 of one roof storey's 3,718 land under another level; 4 declared storeys have no task). Ladder + deriver axis (`levelSource:'deriver'`) = labels keep their tasks (1 storey without a task, its elements sit 24 m from their declared level, so geometry wins), midair 840. Near-rung merge probe (design lane's candidate, 0.25 m with no stated source): overrides 1,001 → 77, midair 855, so near rungs are not the cause; 586 of the 855 have their elected support in a different task. That is the unwritten §J.4 sequence rule. Default stays ladder only.
- **G4 ✅ MERGED #2677, one fleet effect for the owner to see.** W-DUP-SHELL 9 of 9. Private set: 40 same-class candidates (the resume's 43 was counted differently; 46 including different-class pairs): 21 hidden, 16 different material kept, 3 different shape kept (AABB 0.949 vs real 0.360). The coincident tall shell (0.985) is hidden. **Residents are affected: HHS 142 hidden (124 + 36 columns, 17 doors), Clinic 33, Duplex 1, Terminal 50 unjudged (no mesh in that DB).** All display only. Different-discipline pairs are kept (Clinic 250 IfcSpace pairs), added so a discipline toggle cannot take away the only visible copy.
- **G5 ✅ DONE: attribution of the 384 (`SupportSweep` owners, instrument reproduces 384).** By class: IfcBeam 163, IfcSlab 71, IfcMember 39, IfcFlowTerminal 29, IfcFooting 28, IfcColumn 27. Relation of elected support: bearing-below 242, carrier-above 95, embedded 47. All 384 elected supports are in the structural pool. Same task 278, cross-task 106. Early by ≤1 d 161, 1-7 d 88, 7-30 d 133, >30 d 2. After G3 ladder only: 359 (310 unchanged, 49 new, 74 gone). G4 cannot move it: display only. Any further fix needs §J.4: ⛔.
- **G2 ✅ DONE (W-WALKED-EXPORT-DB, 8 of 8).** Real page, software rendering, Open → Walk ALL → export. File on disk, counted independently of the writer: IFCAIRTERMINAL 681, IFCFIRESUPPRESSIONTERMINAL 1,904, IFCALARM 163, IFCDUCTSEGMENT 644, IFCDUCTFITTING 1,080; before the walk 0 of each. **Gaps the run shows:** 0 `IfcBuildingStorey` in the file, everything contained directly in the building; only 2,323 of the DB's 6,461 elements come through the seed, so 4,138 non-ARC elements are not in this export; none of the 3,170 routed runs are in the file (0 swept solids, 0 ports); 553 MB from 192 MB before the walk, because each fixture writes its own mesh. Revit import is the owner's step; the file is in the private lane folder. Counts are before the band no-host rule.
- **Found by G2's first real run, generic, FIXED on the branch (`§OPEN-VIEWER-SAVED`):** Open treated ANY DB with `kernel_ops` as a native op-log. A building DB the Viewer has saved carries that table, so the Open imported 0 ops and showed nothing, with no message. Element rows now decide. Native exports have none, so they are unaffected (W-E2E-EXPORT-DB: same 5/1 on branch and main).
- **Also seen, not fixed, scope:** a merged multi-file import drops `relFills` and `bomTree` (no `rel_fills_host`, no `bom_tree` on the film DB), and `_lengthUnitScale` in `import_worker.js` misreads a conversion-based length unit as metres for its georef math.
- **Instrument error, recorded so nobody repeats it:** serving `Terminal_geo.db` from the local checkout resolved 0 of the rules' mesh hashes and read as a product refusal. Use the real served geometry.

**Done this session, so do not redo:** the explainer film (`~/Videos/Deterministic_BIM_behind_the_scenes_EN_2026-11-07_v8.mp4`, footage source, the 1080p bake clip in ~/Videos (name starts with the project word), kept), record in `FILM_NARRATION.md` §DETERMINISTIC_BIM_FILM; pipeline `scripts/film_deterministic_bim/` committed (bim-compiler `7fd64ee26`); doctrine §7 added. No bake without the owner's go (GPU).

## ▶ §RESUME 2026-11-02 — (read second; superseded as entry point by §RESUME 2026-11-07 above; its queue and HOLDs still stand)
**Landed from the DXF2BIM lane (bim-ootb; detail + measured tables in bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` `### P-X SPEC`, `### P-X2 SPEC` and their RESULTs):**
- **P-X, bim-ootb #2520 (sw v204): IN objective, "a user's OWN IFC must get what the residents get" (§STRATEGY item 1). Was UNVERIFIED; now MEASURED and BUILT.**
  The Modeller's raw-IFC open (`openIfcFile`) now runs the shared extractor (`modeller/ifc_open_db.js` in `modeller/ifc_open_worker.js`), not the Viewer's import worker.
  - The residents' rule: drop the IfcSpace + IfcOpeningElement element rows and keep every discipline.
  - W-IFC-OPEN-ONE: on 6 residents' source IFCs the opened DB = the resident (rows, centres, bboxes, meshes, `rel_fills_host`). The Viewer import's meshes are byte-identical, and 3 falsifiers fail as they should.
  - The old path's filename rule had seeded `*_ARC.ifc` STR members as ARC: IFC-opened Duplex 215 → **196 = the resident**, SampleHouse 58 → 38.
  - The open DB now holds `element_pset_common` / `element_type` / `spatial_structure`, so U7's second read of the file is gone.
  - So §STRATEGY line 25's "`rel_fills_host` UNVERIFIED" is ANSWERED (Duplex 50, HHS 218, Clinic 403, Garage 220, Hospital 665 = the residents'). Queue item (c) "IN-check" is done for the residents' own sources + 2 Revit files. A third-party IFC beyond those is still open, and so is a georeferenced (>10 km) one: the extractor has no rebase.
- **P-X2, bim-ootb #2522 (sw v206): the extractor writes the IFC's element-level IfcRelAggregates into `rel_aggregates`** (it wrote storey → building only). These are the pairs the residents only had through their patches.
  - All 7 residents: 0 missing (e.g. HHS 2,096, Hospital 9,454).
  - On the IFC-opened Duplex, `§NOGEO_COMPOSE composed=3` (IfcRoof + 2 IfcStair); it was `UNRESOLVED count=3`.
  - The seed count stayed 196: the composed parents are not drawn.

**Two Modeller items moved here from the DXF2BIM lane (they are Modeller core, not 2D → BIM):**
- **M-1 Walk-all on an IFC-opened building does nothing.** W-E2E-WALK-IFCOPEN G4: SampleHouse/ifc and Duplex/ifc give `§WALKALL walkOk=false … walked=0 refused=0`.
  - The .db leg (SampleCastle) walks: FP placed 126, 3 honestly refused.
  - Same 2 FAIL on bim-ootb main BEFORE P-X and after P-X / P-X2 (16 PASS / 2 FAIL each time), so P-X did not cause it.
  - This breaks §STRATEGY IN + ASSEMBLE ("walkers FILL IN services" on a user's own IFC). Defect; diagnose and fix.
- **M-2 Composed aggregate parents (IfcRoof, IfcStair, IfcCurtainWall …) are not drawn after P-X2. DECIDED (on red1's recorded direction): correct, keep it.**
  - A parent has no mesh of its own. Its LOD400 geometry IS its parts (slab, flights, railings, panels), each seeded as itself.
  - Drawing the parent too would double the geometry or put a union box where no mesh exists, which the no-box rule refuses.
  - The composed transform serves grouping: Outliner / BOM tree / select-the-whole-stair.
  - Left to measure, not to decide: for each composed parent, how many of its parts are drawn. Stair `IfcMember` parts are discipline STR and the ARC seed does not draw them; the residents behave the same.

**red1's question for this lane (2026-11-02): "why would DISC Walker do roof and stairs? Is it applicable only during basic ARC without such?"**
- **The recorded direction already answers the first half:**
  - red1 2026-09-26: "the tiled roof is PREFAB ARC/STR the user reshapes along its axis like any other element; walkers FILL IN services (MEP)". The roof walk row was removed (#1785); the engine keeps only a §ROOF-PATTERN verdict (present / refuse).
  - Stair/railing/curtain generators are out of scope (§STRATEGY "Out of scope").
  - So the Disc Walker should do neither roofs nor stairs. M-2 is the ARC seed and the composer, not the walker.
- **The lane must confirm from code, with file:line:**
  - whether any walker path still generates, places or refuses roof or stair geometry (the §ROOF-PATTERN verdict, stair footprints in `storey_*`, `rel_aggregates` reads in `cross_edges.js`);
  - whether "absent discipline" (WalkerDoctrine) means the walker only ever runs on an ARC-only building with that MEP discipline missing, or also on a building that already carries it.
- Answer in this file with the citations. Do not re-open "generate the roof" (red1, 2026-09-26).

**M-1 ✅ DONE (witness) 2026-11-02, bim-ootb branch `fix/modeller-walk-ifcopen` (sw v207). Walk ALL on an IFC-opened building.**
- **SPEC.** Rule: a walk's LOD400 gate waits for a geometry buffer only when one can arrive. A resident fetches a `_geo.db` (`_forkEditable` sets `__dwGeoBuf`); a disk-opened `.db` has none and says so with `__dwGeoNone = true` (`_forkLocal`, str_walker_outliner.js:256, §D61); an IFC open has none either (its meshes are in the opened DB, P-X) but set neither flag. Witness claim: no discipline waits on a geo buffer an IFC open does not have; Walk ALL completes with every discipline walked or honestly refused (never a box).
- **CAUSE (proved from the logs, not assumed).** `_dwLod400Only` (modeller.html:4296) loops `while (!__dwGeoBuf && !__dwGeoNone && < 60 s)`. On the IFC path both are unset, so EVERY discipline waits the full cap. Before-log, Duplex/ifc: `§DW-LOD400-REFUSE disc=ACMV … geoBuf=false waited=60087ms`, ELEC `waited=60071ms`, then PLB, FP: 4 x 60 s, while the witness waits 60 s for `__dwAllDone`. The walk itself was fine (it completed in the standalone probe, refusals identical). That is why the witness read `walked=0 refused=0 walkOk=false`. Same on main before P-X and after P-X2 (16/2 each time): P-X did not cause it.
- **FIX.** `openIfcFile` (str_walker_outliner.js, before `_seedPending`): `__dwGeoBuf = null; __dwGeoNone = true` + `§M1-IFC-GEONONE`. And `_forkEditable` now clears `__dwGeoNone = false`, so a resident opened later in the same tab (which DOES fetch a geo db) does not inherit the flag from an earlier IFC/disk open and skip its wait.
- **WITNESS.** W-E2E-WALK-IFCOPEN, main -> branch: G4 SampleHouse/ifc `walked=0 refused=0` -> `walked=0 refused=4`; G4 Duplex/ifc `0/0` -> `walked=1 (FP 38) refused=3`; Walk ALL on Duplex/ifc 4 x 60 s -> 2.3 s; G5 Duplex/ifc oplog 196 -> 238 (+38 placed +4 runs/fittings); SampleCastle/db unchanged (FP 126, 3 refused). 16 PASS / 2 FAIL -> **21 PASS / 0 FAIL** (new G7 NO-GEO-WAIT: waits 0-1 ms on all, fails on the pre-fix code; G8 below). Honest refusals remain: duplex/farm ACMV, ELEC, PLB placements have no `rule_mesh_binding` hash, so they refuse under §WALK-LOD400-ONLY (identical to SampleCastle).

**Q ✅ DONE 2026-11-02. "Why would DISC Walker do roof and stairs? Only on a basic ARC without such?"**
- **Roof.** The walker never generates one. The only roof path is `_tessellatingWalk` (disc_walker.js:625-668, called from `placeMeasured` :723-729): a row whose mined unit tiles its source area (fill >= TESS_FILL, `roof`/IfcPlate on terminal_rules only; duplex_rules and farm_rules have no such row) walks per element on the building's OWN array, and ends in `§ROOF-PATTERN-PRESENT` (:659-664: "already present, nothing to generate, 0 placed"), `§ROOF-PATTERN-REFUSE` (:656) or `-NOPLATES` (:643). It returns zero placements every time. The Outliner has no roof row (modeller.html:5847, #1785) and Walk ALL skips `STR` and `roof` (:4833, §WALKALL-MEP-ONLY). So it agrees with red1 2026-09-26. Residue: `discWalk('roof')` is still callable (the engine keeps the verdict), and the `roof` key is still in the roster on terminal_rules residents.
- **Stairs.** No stair geometry is generated, placed or refused. IfcStair is only READ as a position: `defaultSeed(bdb,{classes:['IfcStair']})` as SP's STACK riser proxy (disc_walker.js:1695, honest refusal when absent), and IfcDoor/+IfcStair as the default trunk seed (:2620-2630). IfcRoof is read as a clash envelope (:2024). `rel_aggregates` is read at cross_edges.js:358 (`readAggregates`) as 'aggregates' edges only; the composing of geometry-less parents is the open path, `composeGhostsFromAggregates` (str_walker_outliner.js:869+), not the walker.
- **"Absent only?" No, only the BUTTON is.** `disciplines()` (disc_walker.js:2653) lists every discipline the rules cover, whatever the building has. The Outliner shows a walk row only for roster disciplines not already drawn as real tree nodes (modeller.html:5836 `absent = ds.filter(!present)`; :5837 no absent -> no row). But the Walk ALL handler (:4826-4833) walks the whole roster minus STR/roof with NO present-filter, and `discWalk(disc)` runs on a present one (the witness's G2 calls it for STR). So where the code DISAGREES with "fills in the missing": Walk ALL on a building that already carries ELEC/PLB walks them again. Not changed here: needs a call (see below).
- ~~⛔ BLOCKED: should Walk ALL skip a discipline the building already carries?~~ **DECIDED 2026-11-02 (red1: "decide for me as u know my direction"): YES, skip it.**
  - Direction: walkers FILL IN services (red1 2026-09-26). WalkerDoctrine walks an ABSENT discipline. The per-discipline row already shows only disciplines not drawn (`modeller.html` ~5836).
  - Walk ALL must use that SAME present-filter: one owner of "which disciplines are absent", no second list. A discipline the building already carries is authored, and re-walking it would add invented MEP on top of authored MEP.
  - **M-4 ✅ DONE (witness) 2026-11-02, bim-ootb #2535 (sw v210), spec = "M-4 SPEC" below.** (was: not built yet)
  - original ask:
    - spec it; Walk ALL calls the row's present-filter;
    - witness on a building that carries a discipline: it is listed as present and skipped with a `§` line, 0 placed;
    - falsifier: the filter off → it walks.

**M-4 ✅ DONE (witness) 2026-11-02, bim-ootb #2535 (sw v210).** W-E2E-WALK-ALL main 16 PASS / 2 FAIL -> branch **18 PASS / 0 FAIL** (new §C/§D; the file's §B now opens in a fresh browser context because the op-log persists per origin and a prior walk is, correctly, now "carried").
- W-a Clinic (elements_meta `ARC/MEP/PLB/STR`; roster ACMV,ELEC,FP,PLB): main walked PLB again (`PLB 2835` ops on top of the 3 authored) -> FAIL; branch `§WALKALL-PRESENT roster=[ACMV,ELEC,FP,PLB] skipped=[PLB(building)] walking=[ACMV,ELEC,FP]`, PLB ops 0, ACMV 1016 / ELEC 406 / FP 1145 still walked (placedTotal 2056 vs 2646 on main).
- W-b Duplex (carries none): 1st Walk ALL identical old -> new: walked ACMV,ELEC,PLB,FP, placedTotal 177, 210 `_dw` ops; §A A1-A10 and §B B1-B3 unchanged (proxy toast once).
- W-c 2nd Walk ALL: main re-walked all 4 (`_dw` ops 210 -> 423); branch `skipped=[ACMV(walked 27),ELEC(walked 102),PLB(walked 39),FP(walked 42)] walking=[]`, ops 210 -> 210.
- W-f falsifier (`_dwPresence` forced "nothing carried"): PLB walked again, 2835 ops -> W-a's property false, as it must be.
- Regression (branch): witness_e2e_walk_ifcopen 21/0 (= main), witness_e2e_walk 8/0, witness_walk_lod400_only 7/0, witness_farm_rules fail=0 judged=5, witness_first_steps_mep rc0, walk_after_seed rc0, str_rewalk_commit rc0. witness_modeller_disc_walk: 6/2 (B3/B4, a 250 ms wait on the STR click) once, 8/0 on rerun; the SAME file on main also gave 6/2 once under load average 23 (a concurrent batch), 8/0 otherwise = timing flake, not caused by M-4. Runner `§ALLWITNESS PASS=109 ENV=9 FAIL=1 of 119` = expected (only the LT7 `-witness_dxf_libtypes:ENV` line). Logs: session scratchpad `m4/`.

**M-4 SPEC (2026-11-02, Modeller lane; witness W-E2E-WALK-ALL §C/§D = bim-ootb `modeller/tests/witness_e2e_walk_all_disciplines.js`).** Decided above (red1); this is the build.
- **CAUSE (file:line, bim-ootb main before the fix).** The Outliner rows decide "absent" inline in `_registerDiscRoster` (`modeller.html` ~5836: a disc is present iff a `n.disc` node exists in the BOM tree, i.e. `elements_meta.discipline` of the opened DB). `window.discWalkAll` (`modeller.html` ~4826-4833) took `DiscWalker.disciplines()` (`disc_walker.js:2653`, every discipline the rules cover) minus `['STR','roof']` and nothing else. So a building that carries PLB (Clinic_ARC.db: `ARC 1984 / MEP 99 / PLB 3 / STR 534`) had PLB walked again on top of the authored PLB; a second Walk ALL re-walked everything the first placed (the rows had the same hole: a walked disc stays listed, by design, to re-walk by hand).
- **"Already carries" in code = BOTH:** (1) `building`: a disc node in the BOM tree built from the opened DB (same test as the rows); (2) `walked`: a committed, un-undone GEOM op in the op-log with `parameters._dw.disc == D` (`Bonsai.oplog._geomOps()`, `bonsai_oplog.js:300`). Not `__dwWalks` (in-memory, set before commit, survives nothing).
- **RULE (one owner).** `window._dwPresence(ds, roots)` (new, `modeller.html`, above `discWalkAll`) returns `{building, walked, absent, fill}`: `absent` = roster minus `building` (the rows' list, unchanged behaviour: a walked disc keeps its re-walk row and its "N placed"), `fill` = `absent` minus `walked`. The rows now call it (inline test deleted); Walk ALL walks `fill` and logs `§WALKALL-PRESENT roster=[..] skipped=[D(building)|D(walked n)] walking=[..]`; `__dwAllResult.skipped` carries the list. No second list.
- **Witness claim.** W-a Clinic: carried disc listed skipped with the `§` line, 0 ops of it, absent ones still walked/refused. W-b Duplex (carries none): counts unchanged versus main (walked/refused/placedTotal printed old -> new). W-c 2nd Walk ALL in one session skips what the 1st walked, 0 new `_dw` ops. W-f falsifier: `_dwPresence` forced to "nothing carried" -> the carried disc IS walked again (W-a would fail). INCONCLUSIVE when nothing carried / nothing walked.

**M-2 ✅ DONE (witness; measure only, nothing changed).** `§AGG-PARTS-DRAWN` is logged by `buildSeedOps` (arc_editable.js `_aggregatePartsDrawn`, one summary + one line per composed parent). Duplex IFC-opened (Duplex_ARC): `composedParents=3 parts=11 drawn=7 undrawn=4 undrawnBy={"IfcMember/STR/discipline-not-ARC":4}`: IfcRoof 1/1 drawn; each of 2 IfcStair 3/5 drawn, the 2 undrawn per stair are IfcMember, discipline STR. Duplex resident: identical (`composedParents=3 parts=11 drawn=7 undrawn=4`, same class/discipline). W-E2E-WALK-IFCOPEN G8 asserts parents>0 and drawn+undrawn=parts (INCONCLUSIVE if 0 parts). As recorded, the parents themselves are not drawn; the 4 stair members are the ARC seed's `discipline='ARC'` filter, same on residents.

**Next for this lane, in order (updated 2026-11-03 at the close; M-1, Q, M-2, M-3, M-3(b) and M-4 are all ✅ above):** (1) RC-1..RC-4 (the pre-existing reds the DXF2BIM release check found, listed above; each FAILs on the pre-session base too) · (2) the carried rows' gaps M-3(b) left (no per-element colour/material, `element_type` / `element_pset_common` / `element_dxf2bim`, storey) · (3) the Hospital export peak (~3.6 GB heap) not split into carry on/off · (4) then the §RESUME 2026-10-02 queue (§SLIDE-REAL-WALLS Phase B Duplex …) and its Open-panel question for red1.

**M-3 SPEC (2026-11-02, Modeller lane; witness W-WALKED-EXPORT = bim-ootb `modeller/tests/witness_walked_export.js`).** Done-claim (red1 via owner): *"a walked shed reaches the Viewer with every class intact, and with ELEC 69 / FP 30 under their own classes and disciplines."*
- **Re-measured on bim-ootb main (8984af69 driver, rerun on origin/main):** Convert shed -> Export Viewer DB = 513 rows; reopen that .db (op-log 309); Walk ALL (ELEC 69 + FP 30 placed, op-log 565); export = 507: IfcMember 168->0, IfcFooting 32->0, IfcFan 13->0, IfcOpeningElement 2->0, IfcBeam 35->46, +198 `IfcBuildingElementProxy`/ARC "Element NNN".
- **Cause (a), walked fixtures typed Proxy:** `modeller/modeller.html` `_commitDiscWalk` (~L4987-5040) commits a walked fixture as GEOM_INSERT with `params._dw = {disc, storey, prov, ifc, host}` and NO `params.ifc_class`; `modeller/bonsai_ifc.js:230` read only `P.ifc_class`, so every walked fixture fell to `IfcBuildingElementProxy` (name `Element <id>`, line ~246) and the extractor's own class->discipline rule (`dxf2bim/ifc_extract_core.js` `DISC_MAP`: IfcProxy -> ARC, IfcLightFixture -> ELEC, IfcFireSuppressionTerminal -> FP) filed it under ARC. The class was never dropped: the op carries it as `_dw.ifc`.
- **Rule (a):** the IFC writer reads the class the op already carries (`P.ifc_class || P._dw.ifc`); a class web-ifc can create is written as itself (no second class table); only an uncreatable class is a Proxy. Discipline stays the extractor's one rule. Fixes walked fixtures for EVERY building, not only the shed.
- **Cause (b), reopen drops authored non-ARC bodies:** `_openBuffer` -> `_seedArcEditable` (`str_walker_outliner.js` ~L710) -> `arc_editable.js` `buildSeedOps` selects `m.discipline='ARC'` only (~L229), then `_seedStrWalk` overlays the WALKED STR skeleton (that is IfcBeam 35->46, a regenerated approximation, not the authored 35). So authored STR members/footings and ACMV fans never re-enter the op-log and the next export has no source for them. IfcOpeningElement is removed by design (the residents' rule: voids are GEOM_CUT, not rows).
- **Measured against the residents (same driver, Duplex Open -> Export Viewer DB):** 196 elements, ARC only (Wall 57, Window 24, Door 14, Furnishing 61, Slab 21, Covering 13, Railing 4, StairFlight 2). So the shed's reopen behaves exactly like a resident: VISION-LOCK "ARC = the edited substrate". §STRATEGY IN ("authored parts survive") says the opposite for non-ARC. Both are red1's words; carrying non-ARC bodies through reopen also decides how they meet the STR-skeleton walk (double girders) and whether an export of a resident grows 10x with its MEP. Not built.
- **Witness claim (W-WALKED-EXPORT):** X1 ELEC/IfcLightFixture rows == ELEC placements; X2 FP/IfcFireSuppressionTerminal rows == FP placements; X3 no Proxy rows added by the walk; X4 the Viewer opens the export ("DONE ... N elements"), 0 page errors; X5 falsifier: the same export with `_dw` hidden returns the Proxy rows; INCONCLUSIVE if the walk placed nothing. Baseline run against main's writer (`M3_MAIN_IFC=`) must FAIL X1-X3.

- **M-3 RESULT (bim-ootb #2527, sw v208):** (a) ✅ DONE (witness): `bonsai_ifc.js` class = `ifc_class || _dw.ifc || library.get(hash).ifc_class`; any class web-ifc can create is written as itself. W-WALKED-EXPORT PASS X1-X5: shed after reopen + Walk ALL exports ELEC/IfcLightFixture 69, FP/IfcFireSuppressionTerminal 30 (= the walk's placed counts), the walk's pipework as PLB/IfcPipeSegment 30 + PLB/IfcPipeFitting 60 + MEP/IfcFlowFitting 9 (extractor DISC_MAP by class, not the walker's FP), IfcBuildingElementProxy 198 -> 0; Viewer "DONE — 507 elements", 0 page errors. Baseline (main writer, `M3_MAIN_IFC=`) FAILs X1-X3; falsifier X5 PASS. Runner PASS=108 ENV=9 FAIL=1 (LT7) of 118.
- **M-3(b) ~~⛔ BLOCKED: reopen carries non-ARC authored bodies or stays ARC-only?~~ DECIDED 2026-11-02 (red1's own done-claim: *"a walked shed reaches the Viewer with every class intact"*; §STRATEGY IN "authored parts survive"; VISION-LOCK "ARC = the edited substrate" governs what is EDITED, not what is discarded): an opened building's authored non-ARC bodies (STR members, footings, beams, columns, ACMV fans, any discipline) survive Open -> (edits / Walk) -> Export > Viewer database.** Shed PRE -> POST (before this fix) lost: Member 168, Footing 32, Fan 13, OpeningElement 2.

**M-3(b) SPEC (2026-11-02, Modeller lane; witness W-WALKED-EXPORT X6-X11; bim-ootb branch `fix/modeller-authored-survive`).**
- **Cause, file:line (bim-ootb main 08f46e3d).** (1) `arc_editable.js buildSeedOps` selects `m.discipline='ARC'` only (~L229), so a reopen never puts non-ARC rows in the op-log. (2) `str_walker_outliner.js _seedStrWalk` (~L779) overlays the WALKED skeleton (`swbRenderOps`, provenance `derived:grid` / `derived:str-walk`): a regenerated approximation, IfcBeam 35 -> 46. (3) `viewer_db_export.js` builds the IFC from the op-log only (`bonsai_ifc.js build`), so the next export has no source for what was not seeded. Measured at the shed: Member 168->0, Footing 32->0, Fan 13->0, OpeningElement 2->0 (no GEOM_CUT: the shed's DB carries no slide tables), Beam 35->46.
- **What the skeleton is for (measured, `swbRenderOps` str_walker_bridge.js:244).** Its columns are `_state.base.walked` (grid points derived FROM the building's own IfcColumn rows), its girders the bay spans between them: a column-framed building with authored STR gets a regenerated copy of what it already has (shed: 96 columns + 11 extra girders on top of the authored 96 + 35). It never exists without authored columns (wall-bearing: 0 columns -> nothing to render). So the rule is skip-when-authored: the export skips a skeleton op of class C when the opened building's authored bodies of class C are carried (`bonsai_ifc.js` `skipDerivedClasses`, `§M3B-BUILD derivedSkeletonSkipped=142` = 96 + 46). The skeleton stays in the SCENE (editing/walk substrate unchanged).
- **Mechanism chosen: PASS-THROUGH, folded transiently at export (no scene mesh, no op-log row).** `viewer_db_export.js carryRest()` reads the opened DB (`window.__dwBuf` + `__dwGeoBuf`) with the SAME seed code the ARC seed uses, complemented: `ArcEditable.buildSeedOps(db, geo, {rest:true})` (`where = NOT (arc where)`: one owner of "which rows are ARC", the same real-mesh resolve / refuse rules, nothing seeded as a box). Their meshes are registered for the duration of the export only, each body is folded by the renderer's OWN `Library.foldInsert` (world positions, the lesson of §XEDGE-GEOWIRE: no re-derived transform), written by `Bonsai.ifc.build({carried})` under its ORIGINAL GlobalId, then released (`hasRealGeometry`/`releaseRealGeometry`). GlobalIds the writer's counter would reuse are moved to n+2^30*j (`bonsai_ifc.js guid`), so ids stay unique and carried ones keep their identity. Not an op-log change: nothing is signed, undo/redo/save of the ARC model are untouched.
- **IfcOpeningElement: via the rel rows.** A Modeller-exported .db keeps its openings as IfcOpeningElement + `rel_fills_host` + `element_world_bbox`; the reopen has no cut for them. `carryRest()` rebuilds a GEOM_CUT-shaped record from those rows (void = the row's world bbox, parent = the host's fid via `__arcFidByGuid`, filling = the filling's fid) and `build()` writes it through the SAME GEOM_CUT branch (IfcOpeningElement + IfcRelVoidsElement + IfcRelFillsElement). An opening a resident already turned into a GEOM_CUT (slide seed) is skipped, never doubled. A resident whose openings were dropped by the P-X rule has no opening row: unchanged.
- **Compared with RE-SEED (the rejected option; measured, WALKED-EXPORT `M3B_HEAVY=1`).** Re-seed commits the non-ARC bodies as GEOM_INSERT rows: one scene mesh + one op-log row each, resident for the whole session, paid at Open by every user whether or not they ever export. Pass-through costs 0 scene meshes / 0 op-log rows and a transient fold at export (largest single mesh at a time). Numbers: see the RESULT line (shed, Duplex, Hospital_ARC 7,471 STR rows). Re-seed would also have needed a second answer for "are they editable" (the gizmo would grab them) which the decision says they need not be.
- **Witness claim (W-WALKED-EXPORT, extended; the `§BLOCKED M-3(b)` info line becomes judged checks).** X6 every PRE discipline/class is still at its PRE count after reopen + Walk ALL + export (12 classes, 513 rows) · X6b GlobalIds unique, each carried body keeps its PRE GlobalId, `rel_fills_host` back (2 -> 2) · X6c carried bodies keep their place (world bbox PRE = POST, 1 cm) · X7 no doubling (IfcBeam 35 not 46, IfcColumn 96 not 192) · X8 falsifier: the same session with the carry OFF fails X6 naming the lost classes · X9 resident leg (Duplex Open -> Export, node truth from the resident DB) · X11 the same on the P-X IFC open (Duplex-IFC, truth by page SQL on `__dwBuf`) · X10 (`M3B_HEAVY=1`) Hospital_ARC: carried rows = DB truth, op-log/scene unchanged by Open. INCONCLUSIVE when the shed set / the walk / the truth is empty. FAIL on main is shown by running this witness against main's code (RESULT line).
- **M-3(b) ✅ DONE (witness) 2026-11-02 (bim-ootb #2531 merged 1047400e, sw v209; logs `/tmp/claude-1000/-home-red1-bim-compiler/eb052dc9-d990-46dc-8047-ba9d4cf63cae/scratchpad/m3b/`: `run10_final.log`, `main_baseline.log`, `runner_branch.log`).**
  - **Shed, reopen + Walk ALL + export, per class (main -> now):** IfcMember 0 -> 168 · IfcFooting 0 -> 32 · IfcFan 0 -> 13 · IfcOpeningElement 0 -> 2 (via the rel rows: `rel_fills_host` 0 -> 2) · IfcBeam 46 -> 35 (authored, skeleton girders not exported) · IfcColumn 96 -> 96 (not 192) · plus the walk's ELEC/IfcLightFixture 69, FP/IfcFireSuppressionTerminal 30, PLB/IfcPipeSegment 30, PLB/IfcPipeFitting 60, MEP/IfcFlowFitting 9. Rows 507 -> 711 (= PRE 513 + 198 walked); the Viewer opens it ("DONE — 709 elements" = 711 less the 2 opening rows, the Viewer's own rule), 0 page errors. All 346 carried GlobalIds kept, world bbox PRE = POST to 3e-8 m.
  - **Resident leg (Open -> Export, ARC unchanged):** Duplex 196 -> 215 (+ STR IfcBeam 8, IfcFooting 7, IfcMember 4 = the resident DB's own non-ARC bodies, node truth `Duplex_ARC.db`); the P-X IFC open of Duplex (Duplex-IFC row) 196 -> 215, the same 19. Hospital_ARC (heaviest): 7,471 STR bodies carried (IfcMember 7,122, IfcColumn 349 = DB truth), exported rows 7,013 -> 14,484 (old derived as 14,484 - 7,471), skeleton columns skipped 349. Open adds 0 scene meshes / 0 op-log rows (scene 7,362 = op-log 7,362).
  - **Measured comparison, pass-through vs re-seed.** Pass-through (`§M3B-CARRY`): shed 344 bodies, 73 distinct meshes, 14,388 mesh verts, +0 scene meshes, +0 op-log rows, 10-14 ms, heap 130 -> 130 MB; Hospital 7,471 bodies, 1,132 distinct meshes, 130,467 verts (largest single mesh 1,718), 412 ms, heap 621 -> 774 MB while registered, released after the build (`released 1132`). Re-seed (`§M3B-COMPARE`, M3B_RESEED_TRIAL=1, shed): +344 op-log rows (565 -> 909), scene meshes 542 -> 885 (+63%), +2.2 s at Open, resident for the session; on Hospital it would add 7,471 instance meshes / 602,779 instance verts (~0.10 GB at the 0.17 GB/Mvert budget) on top of 7,362 meshes; the Hospital re-seed commit itself did not finish in 20 minutes of wall-clock in the headless software renderer (run6_heavy.log, aborted by me), so no completed Hospital re-seed time exists. The whole Hospital export peaks at heap 3,619 MB (791 MB IFC); not split carry-on vs carry-off, so the carry's own share of that peak is the 153 MB above, not a measured total. Chosen: pass-through (meets 1-2, costs nothing at Open, which every user pays; re-seed also makes bodies gizmo-grabbable, which the decision says is not needed).
  - **Witness:** W-WALKED-EXPORT PASS X1-X9, X6b, X6c, X11 (+ X10 with `M3B_HEAVY=1`); falsifier X8 (carry off) fails X6 naming ACMV/IfcFan 13->0, ARC/IfcOpeningElement 2->0, STR/IfcFooting 32->0, STR/IfcMember 168->0. **The same witness against main's code FAILs X6, X6b, X6c, X7, X9, X11 (+ X4 there)**, `main_baseline.log`. Regression: runner `PASS=109 ENV=9 FAIL=1 of 119` (LT7 only; same as main's expected), W-VIEWERDB, W-IFC-OPEN-ONE, W-IFC-VALID PASS in it; W-E2E-WALK-ALL 13/0, W-ARC-SOURCE-PARITY 8/0, W-E2E-WALK-IFCOPEN 21/0, W-S9-IFC-KEY 1/0, W-IFC-EXPORT-SEED 7/0, W-ARC-EDITABLE 9/0. (`witness_arc_editable_smoke` exits MODULE_NOT_FOUND in this environment; not in the runner, untouched by this change.)
  - **Not carried, same as the ARC rows today:** per-element colour/material (`material_rgba`), `element_dxf2bim` / `element_type` / `element_pset_common` rows, storey assignment (an op without `storey` is contained in the building). A fidelity item for ARC and non-ARC alike, not opened here.

**RC findings (2026-11-02, from the DXF2BIM lane's release check: 49 Modeller authoring witnesses on bim-ootb main a483a005; bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` `### RC SPEC` + RESULT).** 44 PASS. These 4 FAIL the same way on the pre-session base 7aa68244, so they are pre-existing and owned here. Each was re-run alone and held:
- **RC-1** W-E2E-SCALEROT S2 DRAG-GHOST: "no ghost" (ScaleGhost not live during the drag).
- **RC-2** W-CLIPBOARD-KEYS K1 paste-at-pointer: `"no empty ground point in view"`. Decide whether the witness's view setup or the paste rule is wrong; the log does not say which.
- **RC-3** W-E2E-INSERT I5 VISIBLE: framebuffer unchanged `pix 5392611→5392611`. This is a pixel gate; per the PRIMAL LAW prefer a `§`-value check of the inserted op.
- **RC-4** W-E2E-EXPORT-DB E1: a stale expectation of 3 export rows (native/ifc/bcf). The menu has 8 (`native, vdb, ifc, load, regrep, analytical, bcf, dxf`); update the witness to the menu's owner, not a hand list.
- ENV: W-MODELLER-GIT-HISTORY needs `playwright`, which the bim-compiler `node_modules` lacks.

## ▶ §RESUME 2026-10-02 — START HERE (session close; then read §RESUME 2026-09-30 below — its rules and queue still stand)
**Landed and LIVE 2026-09-30 → 10-02 (all witnessed vs LIVE; modeller sw v76, viewer v1458):**
- Core reds to zero (#1792) · slide real walls SampleHouse, 2/7 slideable after the M5 check (#1793, BIMCompiler #154) · one gesture = one undo (#1794)
- §S8 edit→cost Δ in Modeller + Viewer, one pricing basis (#1796, #1801) · §S9 Project Order / VO from the Modeller, any-IFC key (#1797, #1798)
- §GEOM-KEEP-RG walk-erased-building fix (#1801) · §GRID-SPAN-GATE live span colours + "Add one more?" (#1803, #1806)
- §THREADS step 1, read-only category scrubber "Viewing: <Cat>" (#1807, #1812, #1815)
- Guide: First Steps Parts 1–5 + ModellerGuide sections, published via safe_gh_deploy.
**Decided by red1 (recorded where noted):** D4c = option (b) per discipline (this file) · CORE BEFORE LOOKS (§RESUME 2026-09-30) ·
S9 flow PO / variant / VO + Q1–Q5 answers (`TM_4D5D_VARIANCE_LANE.md` §S8/§S9-ANSWERS) · row 38 span gate · row 39 threads:
step 1 only · row 40 scripted edits ⏸ HOLD, generative layout out of scope.
**On HOLD (red1: "allow time to ponder a better shape"):** §THREADS step 2 scoped undo — branch `wip/history-threads-scoped-undo`
@034999b7, pushed, unmerged. It breaks W-MODELLER-GIT-HISTORY G5/G6, cause not found (`HISTORY_PARALLEL_TIMELINE.md`
§THREADS-STEP2-HOLD) · §DOC-THREADS / §ADHOC-WF-BATCH (`AGENT_QUEUE.md`) · row 40.
**Open findings, not built:** rows 35 (fixture drag handle), 37 (pipes unclickable under x-ray; x-ray stays on after a walk undo),
the multi-select Delete N-undo, §GRID-SPAN-GATE RESULT items (walker artefact girders, crossing-neighbour rule, girder boxes not
split), the First Steps witness re-run vs LIVE after #1812/#1815 (only run on localhost).
**Next queue item:** §SLIDE-REAL-WALLS Phase B **Duplex** (36 slideable, passes M5), then SampleCastle (5) — see §SESSION 2026-09-30b.
Also open: the Open-panel menu (red1 2026-10-02): the "FROM IFC" rows duplicate SH/DX and weren't asked for, and the
"wall-bearing / column-framed" tags confuse. Pending red1's call: hide the IFC rows behind a test flag (4 witnesses click them) and
drop or tooltip the tags, plus an "Open a building — the list explained" dictionary section in the ModellerGuide.

## ▶ §RESUME 2026-09-30 — START HERE (supersedes §RESUME 2026-09-27 as entry point; read that block second).
## A corrected "Close the Modeller Gap" session prompt. Every status below was checked on 2026-09-30 against bim-ootb
## `origin/main` @ `3f962fb7` and this file on bim-compiler `origin/master` @ `659524c4e`.

**Why this block exists:** red1 pasted an outside draft prompt ("Close the Modeller Gap", written by DeepSeek). Its rules
were right, but its work list was the **2026-07-30 status column** of §OPEN LIST. That column is superseded by §SWEEP
2026-09-15 and §STRATEGY-ASSEMBLE-HANDOFF 2026-09-27. Launch sessions from THIS block, not from that draft.

**What that draft had WRONG (all verified closed or changed — do NOT redo):**
- Row 34 anchor save: ✅ bim-ootb #1787 MERGED 2026-09-27 (W-E2E-ANCHOR-SAVE-ROUNDTRIP 6/6). IFC half: #1747.
- Rows 19, 23, 24, 28, 32: ✅ closed in §SWEEP (#73, #1704, #1738). Row 23's D3 wording is dead; what is left open is the
  `ELEC over-count 1754 vs real 833 = 2.11×` finding. **→ 2026-09-30: that 2.11× was the legacy walk; the production walk measures
  0.91–1.05× (§SESSION 2026-09-30). Stale.**
- Row 12 `rel_fills_host`: ✅ #1749. Row 36 empty IFC export: ✅ #1747 (the export is still THIN — see §IFC-EXPORT-DEPTH).
- Row 29 (grid ⊗ BOM): NOT blocked any more. §VISION-REVIEW says it fits the strategy → it joins the queue after the catalog rebind.
- Row 14: its Dining_Chair example no longer reproduces (upright, 1.227 m). §STRATEGY answers the row: rebind the mesh from the
  restored BOM libraries, or refuse the insert. Never a box.
- Per-layer slab colours: optional in the LOD400 file. PBR / BCF import (row 25): deferred by design. Neither is Tier-1 work.

**THE QUEUE — in this order (§STRATEGY queue + §VISION-REVIEW move-up). Nothing outside it without red1's word:**
1. **§SLIDE-REAL-WALLS Phase B** (spec + Phase M result: `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §SLIDE-REAL-WALLS).
   Order SampleHouse 7 → Duplex 36 → SampleCastle 5.
   **→ SampleHouse ✅ DONE 2026-09-30b (W-E2E-SLIDE-REAL 9/0 LIVE, #1793): 2 slideable after M5 (5 refused, brep bodies carry
   their openings). Duplex 36 (M5-clean) and SampleCastle 5 = next sessions.** Witness W-SLIDE-REAL-WALL, RED on today's main (refusal).
   Check first whether a Phase B branch already exists (§STRATEGY said "in progress" on 2026-09-27; on 2026-09-30 no
   branch and no main commit found by grep).
1b. ✅ DONE 2026-10-02 **§GRID-SPAN-GATE (row 38, red1 2026-10-02)** — wire the EXISTING span check into the grid drag, then "split the bay". Spec in row 38.
2. **§IFC-EXPORT-DEPTH** — storeys, materials, Psets, void relations. Round-trip witness on Duplex.
3. **IN-check** — open a third-party IFC locally and measure that its openings, fills and storeys survive (does the local
   open path write `rel_fills_host`?). Measure only; the gap found becomes its own row.
4. **Insert-with-opening** — on the Phase B substrate.
5. **Row 14 catalog rebind + C1 + C2** (no-box violations, live): retire LOD200 (`#b-lod`, `foldInsert` `boxArrays`);
   rewrite `ModellerGuide.md:216`. A product with no real mesh → insert REFUSED.
6. **§SLOPE-HANDLES** — generalise the shipped gizmo handles (R1). Do not build a second handle system.
7. **REPLACE verb + C3** (gate scale to plain-extrusion hosts only). Declared placeholders (`placeholder:true`).
8. **Row 29** grid ⊗ BOM (`CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`).

**⚖ CORE BEFORE LOOKS (red1 2026-09-30: *"I rather focus on the core Modeller operationality rather than aesthetic unless
the building blocks are confidently well WITNESSED and tested"*).** Work on how the Modeller LOOKS is PARKED: row 13 (N8AO /
§ROW13-RESCOPE), row 11's on-screen colour, per-layer slab colours, row 25 PBR, lighting/shadow tuning. It unparks only
when the core witness net is green on bim-ootb main with no known-red entries. Today it is not: W-E2E-INSTHIDE H1-rig ·
dw_rot_units · git_history · terminal_walk · render_fidelity · W-DISC-DENSITY D3/D4 (list in §RESUME 2026-09-27; net state in
`WITNESS_INTERFACE_FRAMEWORK.md` §MODELLER-NET-AUDIT). Each known red counts as core work: fix it, or re-point the witness
RED-first with the reason written down. Never delete it to get green.
**→ 2026-09-30 (§SESSION 2026-09-30 below): all six worked — git_history ✅ 8/0 · INSTHIDE ✅ 17/0 · dw_rot_units ✅ · terminal_walk ✅ 11/0 ·
render_fidelity ✅ (was a stale claim) · DISC-DENSITY D3/D4/D4b ✅ with D4c answered 2026-09-30 (option b, per discipline once its router is proven — build slice queued).
Three of them hid product bugs (twin-hide dead, walk facing dropped, band envelope on raw origins) — all fixed on that PR.**
**Still open, and worth doing BETWEEN queue items only when they are cheap:** row 6 (Terminal 0 MEP — accept or fix) ·
row 10 (Terminal open speed on the LIVE URL; local was 20,592 ms headless — do not diff that against the old 14 s) ·
row 11 material DATA only (names/RGB into the IFC export — queue item 2; on-screen colour is aesthetic, parked) · row 22 (revert-a-RED, rtree prune) ·
the §XEDGE residual 11 · ~~the ELEC 2.11× over-count~~ (stale 2026-09-30 — legacy-walk number; production 0.91–1.05×).
**Do not start:** anything cosmetic (see CORE BEFORE LOOKS) · row 7 (heavy, red1's word first) · rows 25, 26, 30 (deferred) · the SampleCastle sporenkap refusal
(honest, stays RED) · re-opening rows 1 and 4, the ARC-only filter, or the renderer LOD audit.
**⛔ red1's calls — ask ONCE each, then move on:** row 15 (220 MB `component_library.db`: GH or OCI?) · row 21 · row 27 · row 31.

**Rules for the session (from the draft, plus what it left out):**
- The §PRIME LESSON order for any "looks wrong" report: curl every live asset (size + magic header) → read what the code
  substitutes when an asset is missing → check SW version + precache → only then explain.
- Spec paragraph first, naming the falsifier. If none can be named → ⛔ with the one question.
- RED-first: show the witness fail on unmodified main. Then prove the fix FIRES (grep a real `§` line), then prove it on
  the LIVE URL for anything user-visible (real bytes, not a 200).
- Bump `modeller/sw.js` `CACHE_VERSION` on every served change — read it from the file (it was **v64** @ `3f962fb7`).
- DB changes: SQL patch + self-heal loader, never a binary. One commit per fix. Never soften a gate.
- Worktrees: run `git worktree list` first and reuse one if it exists; new ones go in `/tmp/wt-*`; never edit `~/bim-ootb`.
  At close, prune only worktrees that have 0 commits ahead, are clean, and have no live process in them. The 13 listed in §RESUME 2026-09-15 hold real work — leave them.
- Sub-agents run on Sonnet. Findings go in THIS file (a dated section), not `MEMORY.md`. Push before you end —
  0 commits ahead of origin.
- Mark every item in its own row: `✅ DONE (witness)` or `⛔ BLOCKED: <one question>`. Rows closed elsewhere must be
  closed in the table too.

**Report at session end — this format only:**
```
§ SESSION <date>
Worktree: <path> · branch: <name> · sw: v<NNN>
Done:     ✅ <item> — <one line> · witness: <name> (<n/n>) · PR/commit: <ref>
Blocked:  ⛔ <item> — <the one question>
Stale-claims found: <file:line> claimed open, verified shipped at <sha>
Next session starts at: <queue item>
```
"Is it done?" is binary: yes only if every queue item is ✅. Otherwise no, and name the blocker.

## ▶ §SESSION 2026-09-30 — Part A of red1's "make the CORE witness net trustworthy" prompt: the six known reds, to zero.
## Measured on bim-ootb `origin/main` @ `8311ba5f` (baseline logs first), fixed on branch `fix/modeller-core-net`
## (worktree `/tmp/wt-mnet-core`), bim-ootb PR **#1792 — MERGED 2026-09-30 10:04 UTC as `5c5b01b4`**. Every number below is read from a saved run log.
**Method (the prompt's, kept):** re-run each red on unmodified main → root-cause from code + `§` lines → fix the code
RED→GREEN, or re-point the witness RED-first with the reason in its header. Nothing deleted, nothing loosened. **Three of
the six were hiding PRODUCT bugs behind an INCONCLUSIVE or empty-population witness** — the §CRISIS shape again.

| item | on main 8311ba5f | cause (file) | what shipped | now |
|---|---|---|---|---|
| **git_history** | 7/1 — G6 `active=[1,2] want=[1,4]` | `modeller_history.js` `_restore`: a commit node replays through the LIFO boundary (`O.undo()/O.redo()`); a direct switch between two non-trunk tips leaves {B,C} freshly undone beside D, so the lowest-id-undone pick was B | **§MHIST-SWITCH-TARGETED** — when the boundary's own pick is not one of the node's `ids`, replay them through the existing `setUndone` (§MHIST-ROWS); the linear path is untouched (gridundo U6 still 8/0). `§MHIST_TARGETED` logs the divergence | ✅ **8/0** |
| **W-E2E-INSTHIDE H1-rig** | 2/1 INCONCLUSIVE — no pose found, so H1–H9 had not run since 2026-09-26 | rig: the ARC walls/slabs occluded every twin. **PRODUCT (found once the rig ran):** `modeller.html` `_dwTwinFids` matched `placement.z` exactly, but since §LIVEWIRE a hash placement commits its SEAT there and the centre in `_dw.cz` → 0 twins → the eye hid only the instance = **zero visible change on every LOD400 walk fixture** (§I5b-TWIN's own measurement: instance-only = 0/12 pixels) | **§I5b-TWIN-CZ** (match the centre). Rig: §IH-ISOLATE (ARC hidden for the walk leg, re-applied after every eye click — `_applyHidden` resets all visible), §IH-FRONT (frontmost object by raycast replaces the 24-px readPixels hashes: two reads with no scene change differed = PIXEL-AS-PROOF), controls H1-pre / H3-ctl / H5-pre, the camera re-posed after every real click (the select fly moved it). `FALSIFY=1` → H1/H2/H3 RED | ✅ **17/0** |
| **dw_rot_units** | 1/5 — `recs=0`: SampleHouse ELEC refuses under §WALK-LOD400-ONLY (28 hashless legacy placements), the witness judged nothing | **PRODUCT:** `disc_walker.js` `placeSchedule` wrote each wall-anchored device's facing (`_schedFacing`/`_snapToWall`) to `rot`; the renderer (`makeRotationZ(p.yaw)`) and the commit (`placement.rot = p.yaw·180/π`) read `yaw` → **all 102 Duplex ELEC fixtures were drawn and signed at 0°** | **§SCHED-YAW** — emit `yaw` = the facing in the mesh's own frame: the thin horizontal axis (read off the vertex buffer — receptacle `031416…` is 0.0587 m deep on local X, `23c614…`/`4730c9…` on local Y) is the depth and turns onto the wall normal. Witness re-pointed to the Duplex ELEC production walk: 58 wall-anchored; R2 preview / R3 signed rot **39/58 → 58/58**; R4 measures the folded WORLD footprint against the wall run | ✅ **6/0** (R4 52/52 flat along the wall; RED with main's `disc_walker.js`: 3/3 — R2/R3 39/58, R4 33/52) |
| **terminal_walk** | 5/5 — FP/ELEC `placed=0` on SampleHouse | the witness asserted a HOUSE loads `terminal_rules.db` (contradicts the Walker Doctrine) and that FP/ELEC place >0 there — under LOD400-only both refuse (FP 17 + ELEC 28 hashless legacy placements, `§DW-LOD400-REFUSE`) | re-pointed to the building class the rules were mined for: Terminal resident (FP **974** / ELEC **744** LOD400 fixture instances == placed, routed tubes counted apart, gate flags == red instances) + one house claim (duplex_rules.db loaded at WALK time, FP → honest refuse, 0 instances, no box). `FALSIFY=1` blanks `resolveHashes` → T4/T5/T6/T7 RED (run, 5/5 red as designed) | ✅ **11/0** |
| **render_fidelity** | GREEN — SH 646 / DX 186 / SC 74 / HHS 311 tris/element, verdict REAL ×4; `BREAK=1` trips ×4 (now `tris=2 hardFail=N`: §GEO-SERVED-DEGRADED draws nothing) | **STALE CLAIM** — nothing to fix | — | ✅ stale |
| **W-DISC-DENSITY D3/D4** | 5/3 — D3 `ELEC 33/35 FP 368/703` (graded **35 of 878** ELEC: measured-band placements carry a Terminal `storey_scope`, not a substrate storey — scope-blind), D4 vacuous, D4b ACMV −28% (the whole-disc oracle counted duct runs) | re-baselined on the LOD400 production walk: D3 grades each banded placement against ITS band's ARC envelope + the engine's logged `§NOSPACES-TOPUP`; D4/D4b per CLASS. **That exposed PRODUCT:** `placeMeasured` built its band bbox + cells from RAW `element_transforms.center` (§BUG-A: the placement-line origin) → top-up grid points up to **9.9 m outside the real building** (OFFBOX PLB 47 / ELEC 142 / FP 79 / ACMV 93) | **§BAND-MIDPOINT** — envelope + cells on `_trueMidpoint` (cached per guid); the COUNT keeps the miner's raw-bbox parity. D3 OFFBOX **0** ×4; fixture classes 0.89–1.84×; ACMV/FP terminals **0 / 7 / −1 %** | ✅ D3 · D4 · D4b · **⛔ D4c** (below) |
| **ELEC 2.11× over-count** | — | **STALE:** 2.11× was the LEGACY walk the witness no longer drives (§NET-AUDIT WRONG-PATH, 2026-09-27). Production measured-band walk: ELEC **878/833 = 1.05×** at 8311ba5f, **761/833 = 0.91×** after §BAND-MIDPOINT; per class LightFixture 0.89×, ElectricAppliance 1.84× (35/19) | FINDING line re-worded; the per-class verdict is D4 | ✅ stale |

**⛔ BLOCKED — the one question (D4c):** `placeMeasured` places RUN classes as banded fixtures because `rule_placement` carries their
mined rows: PLB/IfcPipeSegment **748 vs 3,821 real (0.20×)**, ACMV/IfcDuctSegment 268/568 (0.47×), IfcDuctFitting 464/713 (0.65×).
Keep them as the Stage-1 fill, or exclude Segment/Fitting classes from the fixture walk and leave runs to the router (§MEP-ROUTE-DISC)?
W-DW-DENSITY-TE stays **8/1** (D4c RED, honestly labelled) until answered.
**✅ ANSWERED 2026-09-30 (red1): option (b), PER DISCIPLINE, gated on proof.** Placing fixtures (stage 1) and routing
runs (stage 2) are the two stages of ONE walk, like normal MEP practice: terminals first, then distribution. Runs come from the
router only. The rule is: exclude `*Segment`/`*Fitting` run classes from `placeMeasured` for a discipline ONLY once
its router is witnessed drawing that discipline's runs on the real Open → Walk path (router runs vs real count per class,
before/after). PLB qualifies now (the guide's W-MEP-OPENPATH table: Duplex 18 runs, Terminal 2,915). ACMV/ELEC/FP keep the
stage-1 pieces until their routers are proven. The code has had patterns since §MEP-ROUTE-DISC 2026-09-26, but the live
guide still says "placed but not yet routed". Measure which is true first. red1 also asked: the re-route after a fixture or
gridline move (MEP stays visible, `W-MEP-REROUTE`) is fine "if it is not costly". Its cost at Terminal scale is UNMEASURED;
measure it in the same slice.
**Regression on the touched paths (history restore · `_dwTwinFids` · `placeSchedule` yaw · `placeMeasured` midpoints), all on the
branch, serial:** gridundo 8/0 · delete 8/0 · undo_resurrect 5/0 · mep_reroute 9/0 · oleye 5/0 · instpick **8/0** (two earlier runs
7/1 on P4 ROW-FRAMES with Δtarget 30.4 m then 3.6 m — the 1.5 s wait vs the 1.1 s fly; 8/0 on unmodified main too → timing flake,
not this branch) · walk 8/0 · dw_oplog 6/0 · dedup_render 4/0 · walk_lod400_only 7/0 · livewire 12/12 · storey_band SC=PASS
DUPLEX=PASS (placed=102 outliers=0) · walk_all 13/0.
**Served change:** `modeller.html` · `disc_walker.js` · `modeller_history.js` → `sw.js` CACHE_VERSION **v64 → v65**. Live proof (real bytes,
`https://red1oon.github.io/bim-ootb/modeller/`, fetched after the merge): `sw.js` `CACHE_VERSION = 'v65'`, `modeller.html` carries
`§I5b-TWIN-CZ`, `disc_walker.js` carries `§SCHED-YAW` ×4.
**Stale claims found:** this file :122-123 and :169-170 listed `render_fidelity` as red — GREEN at 8311ba5f; :97 / :129 / row 23 "ELEC
2.11× over-count" — a legacy-walk number, not the production walk's.
**Part B (§SLIDE-REAL-WALLS Phase B):** STARTED, not finished — handed to a Sonnet session: **§HANDOFF-SLIDE-SH 2026-09-30** below.

## ▶ §SESSION 2026-09-30b — §SLIDE-REAL-WALLS Phase B on SampleHouse (from §HANDOFF-SLIDE-SH) + one gesture = one undo.
## Opus session on red1's word (2026-09-30). bim-ootb worktree `/tmp/wt-slide`, branches below; bim-compiler `fix/slide-sh-uncut-check`.
## Every number is read from a saved run log (scratchpad `slide/`), not from memory.

**SPEC §ONE-GESTURE-ONE-UNDO (written before the fix).** A *gesture* = everything ONE user action commits: one Move-gizmo
release / arrow nudge / rotate / scale / item-drag drop / Accept click — the primary op for every selected target PLUS every
induced rider (hosted-by door/window rides, fills-opening rides, GEOM_CUT_MOVE voids). The group boundary lives in ONE place:
`bonsai_oplog.js commitGesture()` — one signed `gesture-grp-N` gid that `O.undo()/O.redo()` already treat as one LIFO step (§P8)
and `modeller_history.js` records as ONE node. Rule: a gesture that lands >1 row commits through it; a 1-row gesture keeps
`commit()` byte-unchanged. **Falsifier:** real Open Duplex → real click on a wall that hosts fillings (asked of
`SdgCascade.ridersFor`) → Move tool → real X-arrow drag → ONE Ctrl+Z must return active length to pre-gesture and every
centre (wall + riders) to pre ≤1e-6 m; ONE Ctrl+Y re-applies all rows; Save after the undo not blocked.

**SPEC §CUT-THROUGH.** A GEOM_CUT void face flush (|Δ|<0.1 mm) with the parent's bounding face is pushed 1 cm outward before the
OCCT boolean. The region removed INSIDE the parent is unchanged; it removes the float32-vs-float64 coplanar skin.
**Falsifier:** W-E2E-SLIDE-REAL E3 — a thickness-axis ray through each opening centre must pass the host mesh.

**SPEC M5 §UNCUT-IS-SOLID (generator).** The "uncut" host body must be SOLID at every IfcOpeningElement of its host: a line through
each opening box centre along the host's thickness axis crosses the uncut body ≥2 times; one miss refuses the whole host, named.
**Falsifier:** W-SLIDE-REAL-WALL W7 on the pre-M5 patch → cuts=[0,0,0,2,2,0,0] (RED, `SLIDE_PATCH=<old patch>`).

| item | result | witness (log) | PR |
|---|---|---|---|
| Frame trap (handoff step 1) | Witness re-pointed to the SERVED pair (`SampleHouse_ARC.db` + served `SampleHouse_geo.db`, fetched from the app's own registry). **Correction to the handoff:** `element_transforms.center` in `*_ARC.db` is the vertex CENTROID, not the AABB midpoint (Wy4: served world y∈[-1.3914,-1.1014] vs center±bbox/2 = [-1.3627,-1.0727]) → W2 checks position vs the served baked fold and extent vs `bbox_*`, never center±bbox/2. Also: sql.js MEMFS owns the passed buffer → each Database now gets its own copy. | W-SLIDE-REAL-WALL | #1793 |
| **M5 — 5 of the 7 "slideable" SampleHouse openings were NOT slideable** | Browser E5 caught it: after sliding a window on host 23 the open span was `[-1.53,1.22]` = old ∪ new. Cause: hosts `3cUkl32yn9qRSPvBJVyWy4` / `…Ww5` are **IfcFacetedBrep** bodies exported WITH their openings in the faces — disabling IfcRelVoidsElement subtraction leaves them holed (0 triangles over any opening centre). Phase M's "tris uncut ≠ cut" could not see it. Generator M5 now refuses such hosts (line through each opening centre must cross the uncut body ≥2×): **SampleHouse 7 → 2 slideable** (host `…WXt`, IfcBooleanClippingResult, 2 doors). Duplex probe with M5: **36/38 still slideable**, 0 M5 refusals (2 tessellation-failed, as Phase M). | W-SLIDE-REAL-WALL **9/0** (pre-M5 patch `SLIDE_PATCH=…` → **1/8**, W7 cuts=[0,0,0,2,2,0,0]) | #1793 + bim-compiler this PR |
| §CUT-THROUGH (worker) | Flush void faces pushed 1 cm out: the IFC opening is exactly wall-deep and doors start at the wall base → a 0.3 µm float32 skin closed every hole. `§CUT-THROUGH cut=… flushFaces=3` in the page log. | W-E2E-SLIDE-REAL E3 (without the fix: **0/2 open**) | #1793 |
| Browser proof (handoff step 3) | Real Open: `§SLIDE-SEED uncutHosts=1/1 openings=2 cuts=2`, host promoted, 0 `§LAYER-SOLID-SEED-REFUSE`, world AABB Δ=0; real `#b-itemdrag` drag of door fid 11: `GEOM_MOVE dy=0.455` + `GEOM_CUT_MOVE cutId=39 dy=0.455`, one `gesture-grp-39`; open span `[-0.53,0.27]` → `[-0.07,0.73]`, old centre solid / new open; one Ctrl+Z → len 42→40, door Δ=2.1e-9, spans back; the 5 brep-host fillings still refuse. | W-E2E-SLIDE-REAL **9/0 local, 9/0 LIVE** (v66) | #1793 |
| Re-point (handoff step 4) | `witness_opening_slide.js` S0 → sketched plain-extrude host: S1–S7 now JUDGE (was 7 INCONCLUSIVE every run) **11/0**. `witness_e2e_opening_slide.js` O0 → REAL-SPLIT (5 refuse / 2 form) **8/0**; its `exitItemDrag` guard never fired (module-scoped) — now clicks the button. | W-DAGEVU-SLIDE, W-E2E-OPENING-SLIDE | #1793 |
| **One gesture = one undo** | RED on LIVE main v65: Duplex wall #112 + riders 73/42: 196→199, one Ctrl+Z → 198, residual **0.417 m** (G2/G4). Fix: `modeller.html _commitUserGesture` — move/rotate/scale gestures with >1 row go through `commitGesture` (item-drag already did). App log: `§ONE-GESTURE gid=gesture-grp-197 rows=3` · `§GESTURE-UNDO … rows=3 active=196` · `§GESTURE-REDO … rows=3`. Save after undo: `§SAVE_SNAPSHOT`, no block. | W-E2E-GESTURE-UNDO **6/0 local + LIVE** (v67); W-FIRST-STEPS **9/0/0 LIVE** | #1794 |

**Regression (serial, on the combined branch):** gridundo 8/0 · delete 8/0 · move 7/0 · rotate 7/0 · scale 7/0 · dm_rotscale 12/0 ·
cut 6/0 · cut_move(e2e) 12/0 · cut_move.mjs 26/0 · arc_editable 9/0 · gesture_undo(node) 9/0 · sdg_cascade 7/0 · undo_resurrect 5/0; CI e2e green on both PRs.
**Live bytes:** `sw.js` v67; `bonsai_kernel_worker.js` carries `§CUT-THROUGH`; the patch carries 3 `slide_*` inserts; `modeller.html` carries `_commitUserGesture` ×4.
**Stale claims:** `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §SLIDE-REAL-WALLS Phase M table "SampleHouse slideable 7" → **2** (M5); this file §HANDOFF-SLIDE-SH "3 hosts / 7 openings / canCut ×3" → 1 / 2 / 1.
**Not done / found, left for its own row:** multi-select Delete still commits one row per id (N undo steps); autoroute/fixture placement commit per op — not user single-gesture edits in this sense, not changed.
**Next session:** Duplex (36 slideable, M5-clean) → SampleCastle (5). Regenerate with `gen_slide_host_patch.py` (M5 included), append to `Duplex_ARC.db.sql`, extend W-SLIDE-REAL-WALL / W-E2E-SLIDE-REAL per building.

**⇒ §HANDOFF-SLIDE-SH below is DONE for SampleHouse (✅ §SESSION 2026-09-30b above, bim-ootb #1793/#1794). Kept for history; its host/opening counts are superseded by M5 (1 host / 2 openings).**

## ▶ §HANDOFF-SLIDE-SH 2026-09-30 — §SLIDE-REAL-WALLS Phase B, SampleHouse only. Started by Fable 2026-09-30, handed to a
## Sonnet session on red1's word (save Fable tokens). Everything below is measured; nothing here has run in a browser yet.
**Where the work is:** bim-ootb branch `feat/slide-real-walls-sh` @ `e8acba00` (ONE "WIP:" commit, pushed, **NO PR**, worktree
`/tmp/wt-slide` — REUSE it). It branched from main `d5977e4e`, i.e. BEFORE #1792 landed → `git merge origin/main` first; `sw.js`
will conflict → keep the higher CACHE_VERSION, then bump to **v66** for this change. bim-compiler: the generator is on master
(this PR).
**Built so far (file → what it does):**
- bim-compiler `scripts/gen_slide_host_patch.py` — per `IfcRelFillsElement` re-measures the Phase M rules (box opening,
  through-wall, bake == opening subtraction, frame proof) and emits `slide_hosts` (the host's UNCUT body — verts float32 /
  faces int32 — in the SERVED mesh frame: world − `element_transforms.center`, rotated by −`rotation_z`; hash sha256[:16]) +
  `slide_openings` (the opening's own solid as a WORLD box c1/c2 = the GEOM_CUT `void`). Run:
  `python3 scripts/gen_slide_host_patch.py --ifc reference/residential/Ifc4_SampleHouse.ifc --bldg SampleHouse --arc-db <modeller/SampleHouse_ARC.db> --geo-db <served SampleHouse_geo.db: curl GEO_BASE/SampleHouse_geo.db?v=3> --out <patch> --append`
  → `§SLIDE-PATCH-SUMMARY fills=7 slideable=7 hosts=3 openings=7` (uncut 121/144/12 tris vs baked 106/106/44; frame Δ ≤ 1 mm).
- bim-ootb `modeller/patches/SampleHouse_ARC.db.sql` — the generated section appended (13.6 KB, `X'hex'` blobs, 47 statements).
  The existing loader (`str_walker_outliner.js _applyPendingPatch`) applies it to the ARC db on every open — NOT yet seen in a browser.
- bim-ootb `modeller/arc_editable.js` §SLIDE-SEED — `_slideTables(db)` reads both tables (uncut blob recentred by
  `RealGeometry.recenter`, the fold's §ARC-ANCHOR contract); `buildSeedOps` folds a slide host with `realGeomHash` = the uncut
  hash + `params.slideHost = true`, asset flagged `uncut: true`; `seedArc` then commits ONE `GEOM_CUT {parent: host fid,
  void: {c1, c2}, slide: {opening, filling, fillingFid}, provenance: 'ifc:opening-box'}` per opening as its own idempotent group
  `arcseed-cuts-<name>` (after the hosts, parent from the bridge; `outputGuid` = the opening guid), logs
  `§SLIDE-SEED building=SampleHouse uncutHosts=3/3 openings=7 cuts=7`, returns `slideCutIds / slideCutOps / slide`.
- bim-ootb `modeller/bonsai_library.js` — `registerRealGeometry` keeps `uncut`; new `isUncutBody(hash)`.
- bim-ootb `modeller/bonsai_kernel.js` `_insertCutLayerSeed` — an uncut real body with no layer index seeds as ONE range
  (buildTriFace + sewAndSolidify, the "single-range seed" the Phase M verdict named) → `Bonsai.canCut(host)` **true ×3** (node).
- bim-ootb `modeller/bonsai_itemdrag.js` — `beginSlideSession` accepts `ctx.uncutHostOf(host)` beside `plainBoxOf`; the production
  ctx passes `uncutHostOf` (= `Library.isUncutBody` on the op's `realGeomHash`). The §CUT-MOVE rider machinery is unchanged.
- bim-ootb `modeller/tests/witness_slide_real_wall.js` — **W-SLIDE-REAL-WALL** (pure node: `SampleHouse_extracted.db` + the patch):
  W0 control (main's substrate refuses 7/7 — RED-first built in) · W1 patch applies · W2 seed-uncut · W3 cuts · W4 sessions · W5 ops · W6 replay.
**Verified vs not:** VERIFIED (node, `scratchpad/slide/w_slide1.log`): W0 ✓ (refused 7/7 without the tables), W1 ✓ (3 hosts, 7 openings),
W6 ✓ (second seedArc adds 0 rows, 46→46); seed log `uncutHosts=3/3 cuts=7`; `canCut=[true,true,true]`; for the 2 fillings that reached
W4/W5 a slide session FORMED carrying exactly its own cut (`§ITEMDRAG §SLIDE host=1 axis=x t∈[-9.577,2.808] … §CUT-MOVE cuts=#41(F=1)`)
and `resolveDrop` produced `GEOM_MOVE {dx:0.2}` + ONE `GEOM_CUT_MOVE {cutId:41, parent:host, dx:0.2}` rider — the mechanism works
end to end in node. NOT verified: W2/W3/W4/W5 as written (3/4 RED for the frame trap below), anything in a browser (loader → seed →
worker fold with the void subtracted → the re-cut host vs the baked mesh → a real drag moving the hole → Ctrl+Z), the live site.
**Exact next step:** (1) fix the witness's frame TRAP: `modeller/SampleHouse_extracted.db` `base_geometries` blobs are in the
create_shape/placement local frame, while the SERVED `SampleHouse_geo.db` (what production AND the generator use) is world −
center — the two differ by **4.5087 / 7.9520 / 5.4646 m** on the 3 hosts (exactly the numbers the generator's first run refused
with). So the node control's baked fold cannot be the W2 reference: compare the uncut fold's WORLD AABB against
`element_transforms` center ± bbox/2 (DB truth), and compute W3's inside/through and `wallFills` from the UNCUT host boxes (then all
7 fillings reach W4/W5, not 2). (2) `cd /tmp/wt-slide && node modeller/tests/witness_slide_real_wall.js` → expect 7/0.
(3) Browser witness on the e2e harness (`t.open('SampleHouse')`): assert `§SLIDE-SEED … cuts=7` on the real Open; the 3 host fids
are in `Bonsai._computeSeeds(ops).promoted` and no `§LAYER-SOLID-SEED-REFUSE`; the rendered host is the worker solid (tris ≠ the
uncut buffer, world AABB == `element_transforms`); a REAL item-tool drag of a door commits `GEOM_MOVE` + `GEOM_CUT_MOVE`; after the
fold a point at the OLD hole centre is inside solid and at the NEW one is open (raycast, numbers); Ctrl+Z restores. (4) Re-point
`witness_opening_slide.js` S0 — once the patch is live its "every real host refuses" claim is RED by design; it becomes the
sketched-host (plain-extrude) witness. (5) `sw.js` v66, PR, merge, live bytes.
**Traps hit:** ifcopenshell `use-world-coords=False` is NOT the shipped local frame (the shipped one is world − center, R(−rz),
from the DB row — verify with the generator's frame check, never assume) · the IFC is in mm (placement matrix) while
`create_shape` geometry comes back in m · the patch goes to the ARC db only (the geo db is untouched; the uncut blobs live in the
ARC db tables — by design) · GEOM_CUT rows carry `outputGuid` = the opening guid (the ARC bridge is built from the host ops only,
unaffected) · `git merge origin/main` will conflict on `sw.js`.
**Witness state:** W-SLIDE-REAL-WALL written (node); RED on main's substrate proven by its own W0 control (7/7 refuse); 3/4 on the
WIP for the frame reason above; no e2e witness yet.

## ▶ §RESUME 2026-09-27 — (superseded as entry point by 2026-09-30 above; read it second)
- **Merged/merging:** bim-ootb #1786 (root JS tidy, MERGED) · #1787 (row 34 anchor save, MERGED) · **#1788** (net-audit
  batches 1-3 + pattern rows 1/3/6/8 + room-inject + LOD400-or-refuse everywhere: walks, re-open fold, assemblies,
  geometry-less seed; auto-merge on — verify it landed). Detail + numbers: `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`
  §FOLD-NO-BOX-DONE; witness-net state: `WITNESS_INTERFACE_FRAMEWORK.md` §MODELLER-NET-AUDIT.
- **⛔ red1 decisions pending:** (1) slide an opening along a REAL wall? (today refused: every real host has the opening
  baked in; #1710's slide was never user-reachable) · (2) catalog inserts with no mesh / at LOD200 still fold boxes
  (527/794 products) — refuse them (removes LOD200 + those products) or rebind meshes first (row 14 / §CATALOG-REBIND,
  also needs `library/DX_BOM.db` + `SH_BOM.db` restored — 0 bytes locally).
- **Known red, pre-existing on main:** W-E2E-INSTHIDE H1-rig (no fixture pose); node dw_rot_units · git_history ·
  terminal_walk · render_fidelity; W-DISC-DENSITY D3/D4 need re-baselining on the LOD400 walk (§WALK-LOD400-ONLY note).
  **→ all worked 2026-09-30, see §SESSION 2026-09-30 (render_fidelity was already green — a stale claim).**
- Worktrees: `/tmp/wt-mnet-audit` (PR #1788 branch) and `/tmp/wt-mnet-base` (detached main, comparison) — prune both
  once #1788 is merged; `/tmp/wt-bc-netaudit` = this docs branch.

**▶ 2026-09-27 BACKLOG (red1 direction): §SLOPE-HANDLES — drag an axis / apex / edge of a sloped element along its natural build
lines, as the industry does (Revit sub-element + slope-arrow editing, ArchiCAD pet-palette offset-edge / move-node, SketchUp
push-pull). Measured state on bim-ootb main: NO face/edge/vertex handles exist (0 hits for push-pull/faceDrag/edgeDrag/vertexDrag);
grid drag is orthogonal-plan only and §ROTATION-GUARD refuses tilted elements; `dagevu_engine.js:23` AngleEdge ⛔ PAUSED "no
measured roof-slope data"; row 30 (roof height scale, wrong axis, dead). Industry default to honour: a stretch KEEPS THE PITCH
(ridge rises); apex-proportional is an explicit scale, never the default. Data path (non-invent): the slope plane is measurable
from the source mesh's own face normals / the IFC's extrusion direction — measure first (Phase M), like §SLIDE-REAL-WALLS.
Sequence: after §SLIDE-REAL-WALLS and insert-with-opening (same host/cut substrate).
**DESIGN (red1 2026-09-27: "a universal handler set that is abstract to accommodate any natural handling"):** ONE handle
abstraction, not a tool per element type. Every element EXPOSES handles derived from its own extracted geometry; each handle =
`{ kind: point|edge|face|axis, anchor (where it sits), dofs: the natural build lines it may move along (wall long axis,
slope-plane down-direction, ridge line, extrusion direction, grid line), invariants it must keep (pitch, thickness, face
offset), constrain(candidate) → { delta } | refusal }` — exactly the shape `HostFillEdge.constrain()` already has (1-DOF along
the host, delta-honest bounds, never a clamp). Cascades stay DAGeVu edges (anchor/ride). Existing drags become instances:
grid-line drag = axis handle on a grid line; opening slide = edge handle on the host long axis; roof stretch = edge handle on the
eave keeping pitch; apex drag = point handle on the ridge (explicit pitch change). Handles are only offered where their build
line is MEASURED from the source (no measured slope ⇒ no slope handle — refused, never guessed).**

## ▶ §RESUME 2026-09-26b — (superseded as entry point by 2026-09-27 above; read it second). Then §RESUME 2026-09-26 below, then §STRATEGY 2026-09-24.
## Every number was measured on the combined branch bim-ootb `feat/modeller-next-0926`. Specs: `prompts/Modeller/NEXT_0926/`.

**▶ "resume Modeller session" (red1's trigger phrase) — do exactly this, in order:**
1. Read this block, then the §RESUME 2026-09-26 block and §STRATEGY 2026-09-24 below (method rules + traps).
2. State of the world at the 2026-09-26 reboot: **everything is merged** — bim-ootb main `b0826a5a` (#1769, sw v50),
   BIMCompiler master (#125 + this note). No Modeller work lives in any `/tmp/wt-*` worktree; nothing is unpushed.
3. ⏸ 2026-09-26c: red1 said HOLD on headless runs (Alt+S testing on :8624); still not re-run. First task: run the five witnesses NOT yet re-run on merged main (held so red1's Alt+S on :8624 stayed light) in a
   fresh worktree off origin/main, with `NODE_PATH=~/bim-ootb/tests/node_modules:~/bim-compiler/node_modules` and the
   gitignored `Terminal_arcstr_proof.db` + `Terminal_plates_proof.db` copied from `~/bim-ootb/modeller/`:
   `witness_e2e_walk_all_disciplines.js` · `witness_e2e_walk.js` (5/3 on the pre-#1769 base) · `witness_e2e_save.js` ·
   `witness_route_pattern_bridge.js` (6/4 red since #846 — expected, it is NEXT 1 below) · `witness_e2e_walkall_terminal_scale.js`.
   Compare each red against origin/main `1069c70c` before calling it a regression. **Ask the photoreal session / red1
   before a heavy headless run if red1 is testing Alt+S** (headless Chrome slows the look port).
4. Then work the NEXT list below in order. Data calls: decide them yourself (simplest sourced option, checked against
   the `*_silent.db` references) — red1 wants "simple and workable … visually and generally correct".
5. Merge convention: one combined branch, one PR at session end (bim-ootb auto-merges on green checks); update this block.

**§WITNESS RE-RUN 2026-09-26c (merged main `b0826a5a`, logs in session scratchpad/wit/):** W-E2E-WALK-ALL 13/0 (63 s) ·
W-E2E-WALK 8/0 (9 s) · W-SAVE-COMPLETEIT 11/0 (11 s) · W-TERMINAL-WALKALL-PERF 6/0 (100 s; Walk-ALL 73.6 s, PLB 2,915/2,915 +
FP 623/623 + ACMV 807/807 signed, 1 group each) · W-ROUTE-PATTERN-BRIDGE 6/4 (P3-P6, the known NEXT #1 retarget).
**🔴 NEW FINDING (scope-blind green):** the Modeller's catalog has been EMPTY since #550 (2026-06-27, modeller/ split).
`modeller/bonsai_library.js:34` fetches `modeller/dagevu_catalog.json`; the file stayed at `viewer/dagevu_catalog.json`
(live: modeller URL 404, viewer URL 200 / 274,212 B). Log: `§LIBRARY catalog loaded products=0`. Effect measured on Terminal:
every bend fitting fails to fold — 726× `GEOM_INSERT unknown component FITTING_ELBOW_GENERIC` + 468× `…TEE_GENERIC`
(= 2 × the 597 in `§BEND disc=PLB joints=597`). So §PRODUCTIVITY's "597 fittings" are signed rows that never render, and
W-TERMINAL-WALKALL-PERF T6 NO-ERROR does not see it. Any catalog insert (picker, assemblies) is likewise unresolvable.
**→ FIXED, bim-ootb PR #1770 (`fix/modeller-catalog-path` @ 22c123fa, auto-merge on; spec SPEC_CATALOG_PATH.md):** catalog +
geometries fetched from `../viewer/`; sw v51; a 2nd latent bug it exposed — `_dwUpgradeFitMeshes`'s scrubTo wiped the dwRoot tube
layer (Duplex tubes 33 → 0) — now redraws like every other re-fold. New T7 FOLD-CLEAN: base 1,194 unknown / 0 products → 0 / 837.
9-witness sweep base = fix (only T7 moved); Duplex fittings real mesh 3/3 (was 0/3). Cost: W-WALK-GESTURE 7 → 47 s, W-MEP-REROUTE 16 → 46 s.

**⚖ DECISION (red1 2026-09-26): the tiled roof is PREFAB ARC/STR the user reshapes along its axis like any other element; walkers
FILL IN services (MEP).** → no roof walk row in the Outliner (bim-ootb PR #1785, §ROOF-PREFAB); the engine keeps the §ROOF-PATTERN
verdict so no fabricated plates can return. Do not re-open "generate the roof" without red1.
**Assessment 2026-09-26 (asked by red1) — next priorities (specs written: WITNESS_INTERFACE_FRAMEWORK.md §MODELLER-NET-AUDIT · MODELLER_BOM_CATALOG_SPEC.md §CATALOG-REBIND · this file §IFC-EXPORT-DEPTH):** (1) audit the witness net for scope-blind / vacuous / wrong-path checks
(every defect found this session hid behind a green witness: empty catalog 3 months, roof row never worked); (2) data quality:
restore `library/DX_BOM.db` + `SH_BOM.db`, rebind catalog meshes (row 14); (3) IFC export depth (Psets, storeys, materials).

**▶ 2026-09-26e (resumed) — rows 8 + 22 closed, row 14 parked.** Row 8 → **bim-ootb PR #1782**: roof walk returns a VERDICT
(present / refuse), never the band fill; the Outliner roof row had NEVER walked for a user (discWalk upper-cased 'roof' → 'ROOF',
§DISC-CASE fix); W-ROW8-ROOF-PATTERN 1/6/1 → 7/0, W-E2E-ROOF-PATTERN 2/1 → 3/0, 10 regression witnesses base = fix. Row 22 part 2 →
UBBL clauses read from the gazette (UBBL_RULES_GATE.md §SOURCED, hash-pinned); only room size is checkable on today's data, and the
shipped demo applied bedroom minimums to every room → **PR #1781** (§UBBL-TIERS: real violations = any-room floor 43(b)/43/44 proviso;
"would fail if habitable" = 42(1)/42(2)/44(1)(a); Duplex 8 false violations → 0, 10 "check"). By-laws 181 (exit ≥ 700 mm) and 168(5)
(door swing) need escape-route / swing data we do not extract. **Row 14 PARKED:** catalog meshes are bound by a name/footprint
heuristic (many are the wrong part — e.g. two different roofs share one flat-roof mesh), and `library/DX_BOM.db` + `SH_BOM.db` are
0-byte locally, so the catalog cannot be regenerated safely; needs those libraries restored + a mesh re-binding pass (Fable-sized).
Not the Viewer's concern: only the Modeller reads `viewer/dagevu_catalog.json`.

**NEXT #1-#5 DONE; #6 handed over.** One combined bim-ootb branch (row 7 + #2/#3 + #4 + #5).
| item | result (base → fix) | spec |
|---|---|---|
| Row 7 grid | red1 picked **0.1039 (true centres)**, then **"on the beams"** (median line fit). The bridge reads true mesh centres via `CrossEdges.readBoxes` (#1744's reader, not re-derived) and re-inits after the geo fetch (§STRWALK-GEO — without it the fix never fires on split residents). Terminal: facade gridlines on the beam lines (0 mm, were 107/161 mm off), 131/158 columns exact (was 92), grid 18×10 and membership unchanged, skeleton column z fixed (63 off, max 3.944 m). Headline RMS 0.0939 → **0.1323**: it now measures only by-design facade eccentricity; **no estimator lowers it without minting fake lines** (measured). Wall-bearing semi-grid unchanged (mean). | SPEC_ROW7.md |
| #2 re-route signed | 1 m Duplex move: 0 new signed rows → keep 16 / new 5 / retire 6, bend fittings re-derived (3 kept / 2 new / 2 retired); one Ctrl+Z / Ctrl+Y, no new rows. `bonsai_oplog.undo/redo` skip rows a re-route owns (`_treeOwned`). W-MEP-REROUTE 5/3 → 9/0 | SPEC_MEP_SIGN.md |
| #3 sign all | `DW_CHAIN_COMMIT_CAP` 60 → Infinity. The old "1.6-2 s per sweep" was the per-sweep-commit era. Terminal PLB 60 → 2,915 signed, walk 16.5 → 24.0 s. **Hospital 60 → 19,331, PLB walk 69.6 → 123.2 s, +19k solids — kept (every step signed), red1 may re-cap big buildings.** | SPEC_MEP_SIGN.md |
| #4 ACMV/ELEC/FP | `_RW_PATTERN_DISC` covers all four; 10 sourced rows added to `mep_rw.db` ad_mep_pattern (FP_TERMINAL_01 ×4, ACMV_TERMINAL_01 ×3 from SJTII_Terminal; ELEC_DUPLEX_01 ×3 from Ifc2x3_Duplex); products FP_Drop_Pipe 21.3 mm · Terminal_Rect_Duct_150x150 · Duplex_EMT_Conduit_29. Combined: Terminal runs signed **4,345/4,345** (PLB 2,915 + FP + ACMV). Engine-measured zeros kept as EXPECTED 0 gates (SampleCastle FP/ACMV, ELEC on Duplex/Terminal). | SPEC_MEP_ROUTE_DISC.md |
| #5 NNCHAIN | N4/N6 retargeted to the routePattern bridge's identity (rule/kinds/product/path) and id-targeted setUndone. 6/2 → 8/0. Test-only. | SPEC_NNCHAIN.md |
| #6 viewer routewalker | **Handed over to the Viewer lane, not taken**: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites that §RW-RUNBOX (L2) fixed in `modeller/routewalker.js`. | — |

**§PRODUCTIVITY now (one Walk ALL Services, combined branch):** Duplex 221 generated (185 fixtures + 33 runs signed + 3 fittings) / 29 flagged · SampleCastle 525 / 9 · Terminal 9,284 (4,342 + 4,345 signed + 597) / 60.

**Combined-branch witnesses:** W-ROW7-TRUE-CENTRE 6/0 · W-ROW7-GRID-BASELINE 5/0 (pinned to the mean fit it recorded) · W-E2E-ROW7-GEO-REINIT 6/0 · W-MEP-REROUTE 9/0 · W-WALK-GESTURE 4/0 · W-ROUTER-NNCHAIN 8/0 · W-MEP-OPENPATH 33/0 (M5-M7 per discipline, M8 all-signed). STR/grid: STR-REWALK-COMMIT 9/0 · GRIDMOVE-REAL 8/0 · STR-INTO-ARC 11/0 · STRWALK-SMOKE 9/0 (row 7 branch).

**DATA CALLS — DECIDED (red1 2026-09-26: "keep things simple and workable and not worry about the finer points as long
bigger issues are resolved ie visually and generally correct. The silent DBs are references u can work with").** All five
stay at the shipped default: FP starts at the seed door (as CW) · ACMV one product 150×150 (the mode in Terminal 53/420 AND in
the Hospital_silent reference, 437 of 4,816 IfcDuctSegment) · ACMV mains + drops, no plant step · ELEC mains only · Hospital
signs every run. Rule going forward: take the simplest sourced option, check it against the `*_silent.db` references
(Hospital_silent, HHS_Office_Federated_silent), ask red1 only when something is visibly or generally wrong.

**NEXT, ranked:** 1. ✅ DONE 2026-09-26c — bim-ootb PR #1771 (test-only): W-ROUTE-PATTERN-BRIDGE 6/4 → 10/0 ×2 (engine seam now uses the production `{schedule:true, geoDb}` opts; P6 = coverage honesty on unmapped STR; waits for the ARC seed). Found on the way → **FIXED, PR #1779 (§WALK-AFTER-SEED)**: the Walk row is usable 4.4 s (Duplex) / 24.0 s (Terminal) before the ARC seed commits; a Walk in that window signed its rows before the seed's and lost its layer. Walks now await `window.__arcSeedReady`; W-WALK-AFTER-SEED base 1/3 → 4/0; W-E2E-WALK's early op-log read fixed (8/0 ×2) · 2. ✖ RETIRED 2026-09-26c (red1: the Java backend is deprecated — OOTB is a JS PWA with no Java; memory java-bridge SUPERSEDED 2026-08-06). The 10 rows live in bim-ootb `modeller/mep_rw.db`, which is the source of truth; nothing to carry into `IFCtoERP.java` · 3. HospitalGarage grid (140 columns off-lattice: 15×102, colRMS 1.20 m — the 1D axis clustering doesn't describe it; its own row) — ✅ DONE 2026-09-26c (Fable agent) — bim-ootb PR #1774: ONE lattice rotated −2.000° (= the IfcSite placement, 0 IfcGrid in the IFC); `swDetectRotation` (all-pairs mod-90 mode + support gate) → 15×103 / 1.193 m / 6 exact → **17×29 / 0.0607 m / 132 of 140 exact**; Terminal unchanged; Hospital refused by the support gate (wings at −5°/+10°). Open: the authoring grid still drags world-axis lines (fine at 2°; a rotated authoring grid is its own row). Spec SPEC_ROW7_HGARAGE.md · 4. ✅ DONE 2026-09-26c — bim-ootb PR #1772: a plain Ctrl+Y resurrected the lowest-id undone row (an undone walk's row, or a deleted row) instead of the edit. Rows a history node leaves undone now sit in `oplog._treeUndone`, skipped by redo(). W-UNDO-RESURRECT base 3/2 → 5/0; 7-witness sweep base = fix (spec SPEC_UNDO_RESURRECT.md) · 5. then the older rows from §RESUME 2026-09-26. **Row 9 ✅ 2026-09-26c — bim-ootb PR #1773:** edit-time ORANGE toast gets an Accept
button → one signed gesture (Save's own heal ops, shared `_healOps`), one hop, re-checked; W-ORANGE-ACCEPT base 1/1 → 5/0, Save/gate
witnesses base = fix. Accept follows Save's heal rule (moves the UNMOVED partner) — in the witness it moved a wall 0.5 m and raised 2
new RED, reported not applied; red1 may want the heal to move the pulled element instead (not changed). **Stale witness found:**
W-SAVE-BLOCKED-HEAL-INDUCED 0/2 on main — its fixture needs "unrelated" neighbours, none exist since §XEDGE-3AXIS (every Duplex element
has edges) → **fixed PR #1778** (fixture found by simulating the real gate; 7/0). **Row 22:** part 1 ✅ PR #1775 (RED toast → one-click Revert = one Ctrl+Z, only while the edit is still latest; W-RED-REVERT base 1/1 → 4/0) ·
part 3 ✅ PR #1776 (§GATE-SCALE: the gate's `seen` map threw RangeError past ~300 moved on Terminal; spatial grid → identical results,
100 moved 3,119 → 10 ms, 1,000 moved 40 ms; W-GATE-SCALE base 4/1 → 5/0) · part 2 ⛔ BLOCKED: *which gazetted UBBL clause + value for corridor width and door swing?* UBBL_RULES_GATE.md §1b verified only By-Laws 39/42; its corridor/stair/dead-end figures have conflicting sources and no door-swing clause is cited — building a named check on them would invent the number. **Row 11 ✅ PR #1777** (§COLOR-PARITY: the element's authored `material_rgba`
r,g,b, the Viewer's rule; palette only for NULL — W-COLOR-PARITY base 3/1 (all 196 Duplex + 1,077 HHS on the palette) → 4/0, fallback
leg INCONCLUSIVE: no NULL rgba in either). Stale/red witnesses seen, not touched: W-E2E-CUT C6 (pixel, red on main). **Row 8** — Fable agent measured it; parent review changed the outcome (spec SPEC_ROW8_ROOF_PERELEMENT.md §REVIEW). Today's roof walk is a
BULK FILL (Terminal 10,584 of 33,324 plates at the flat band-mid z, RMS 2.627 m) and FABRICATES arrays elsewhere (Clinic 331 on glazing,
Hospital 47,526). But Terminal's 33,324 real plates are `discipline='ARC'` — the seed already puts them on screen, so a "per-element walk"
would only re-place them (RMS 0 by identity, 33k duplicate rows). Fix: a tessellating row (fill ≥ 0.5, derived) measures the array and
reports `§ROOF-PATTERN-PRESENT … nothing to generate` (0 placed) or REFUSES — never the fill. W-ROW8-ROOF-PATTERN (node) base 1/6/1 →
7/0. Branch feat/row8-roof-perelement (/tmp/wt-row8-roof), committed locally, NOT pushed — its browser regression runs wait on the GPU
(paused 2026-09-26 for the photoreal lane's Alt+S runs). Also **W-E2E-CUT C6 → PR #1780** (it compared pixels after a re-select click
that hit another element; now the cut element's own mesh fingerprint: changed by the cut, restored exactly by the undo). **Rows 13/25** stay deferred by design (§OPEN LIST).
**Row 14 ⛔ BLOCKED — re-sourced 2026-09-26c, the row's premise is wrong.** Measured over `viewer/dagevu_catalog.json` × `dagevu_geometries.json`
(794 products with a real mesh; `§ROW14-CATALOG`): 201 mesh extents == declared w/d/h (Z-up) · 52 same numbers, axes permuted · 14
placeholder dims (d=h=1) · 527 no match. The permuted ones are mostly the METADATA's order, not the mesh (SLAB_SH_SIMPLE whd 0.165/13.97/5.77,
mesh 13.97×5.77×0.17 Z-up — correct slab); Dining_Chair h=0.45 but its mesh is 1.227 m tall and ROLE__CHAIR_A (same mesh) says h=1.227.
So "bake an axis permutation into the vertices, witness tallest-axis==h" would bake BAD METADATA into good meshes. The measured fix is the
other way: for mesh-bearing products take w/d/h FROM the mesh extents (non-invent; changes LOD-200 proxy box sizes). The catalog files are the
Viewer's (`viewer/`), so it is cross-lane. *Question for red1: OK to derive the shared catalog's w/d/h from the real mesh extents (Modeller +
Viewer proxy sizes change), instead of the row's vertex bake?*

**NEW TRAPS:**
- **sql.js: two `new SQL.Database(sameBuffer)` share storage** — a DROP on one showed in the other (measured). Always pass a fresh `new Uint8Array(fs.readFileSync(...))` per db in node witnesses.
- **Signing everything makes walks commit later.** W-WALK-GESTURE went 1/3 once under load, snapshotting before the walk's history node existed. Wait on `__dwRowsByDisc[disc].walk` + `ModellerHistory.pending()`, not `__dwWalks`.
- **A Terminal-scale commit blocks the page > 180 s** — puppeteer `protocolTimeout` 900 s in W-MEP-OPENPATH, or a finished walk reads as walked=false.

## ▶ §RESUME 2026-09-26 — (superseded as entry point by 2026-09-26b above). Then read §STRATEGY 2026-09-24 (the thesis + lanes) and §RESUME 2026-09-21
## (method rules + traps). Written at session close; every number was measured on merged main.

**WHERE IT STANDS.** The generate-then-edit loop runs end to end on the real Open path. A bare ARC building → "Walk ALL
Services" places fixtures, routes plumbing, and SIGNS it at measured Duplex pipe sizes. One Ctrl+Z undoes the whole walk.
Moving a fixture re-routes its pipes. Merged + live: bim-ootb **#1762** (§STRATEGY L0-L7 + §XEDGE-3AXIS) and **#1768**
(§GATE-STOREY-FLOOR + §PRODUCTIVITY + cut-layers witness aim); BIMCompiler **#121 #122 #123**; docs site deployed.

**MEASURED §PRODUCTIVITY** (one Walk ALL Services, generated / flagged for review): Duplex 206/29 · SampleCastle 514/9 ·
Hospital 39,979/22 · Terminal 7,854/60 · HHS/Clinic/HospitalGarage/SampleHouse 0 flagged. This proves "little left to fix",
NOT "X times faster" (there is no hand-modelling baseline).

**CLOSED THIS STRETCH (don't re-open):** next-list #1 residual 11 (the rx/ry guard, 11 → 0) · #4 datums 802→657→643 =
CORRECTIONS (138 → 0 not-real planes on the live render) · row 6 re-framed + routed · L6 PLB stays unattached (red1) ·
Cut on a layered wall PROVEN (W-E2E-CUT-LAYERS 10/0; the old L3 red was the witness's aim, not the pick).

**NEXT, ranked (my recommendation; red1 had not picked one at close):**
1. **Row 7 — grid residual** (the "drag and the building follows" handle). ⚠ DECISION OUTSTANDING: chase **0.1039 m**
   (true mesh centres, the honest number) or 0.0939 m (what ships, flattered by the anchor defect in
   `str_walker_bridge.js:22/38/50`). Recommended: 0.1039. Confirm with red1, then run it as ONE Fable session (tough).
2. Re-routed runs are unsigned and bend fittings are not re-derived after a move (§MEP-REROUTE scope note).
3. Terminal signs 60 of 2,915 runs (DW_CHAIN_COMMIT_CAP, occt-bounded).
4. Route ACMV / ELEC / FP. They are placed but not routed; the pattern bridge covers CW/SP only.
5. Retarget W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs).
6. `viewer/routewalker.js`: same vertical-post clash box at 3 sites. VIEWER scope, not the Modeller's; hand it over, don't take it.
Then the older rows: 9 (apply ORANGE suggestions) · 22 (one-click revert, UBBL checks, rtree at scale) · 11 (real colours) ·
8 (roof per-element) · 13/25 (SSAO/outline, PBR, BCF import) · 14 (re-source its example first).
Blocked on red1: 15 (220 MB component_library.db: GH or OCI?) · 27 · 29 · 21/26/31 (never requested).

**DISPATCH (red1):** Opus by default; Fable agents for genuinely tough items (red1, 2026-09-25). A Fable agent WILL hit the
usage limit mid-run: resume it with its own context after the reset, never restart it.

**NEW TRAPS / METHOD (each cost a wrong answer first):**
- **An all-zero count is a claim, not a result.** "0 flagged" on 8 residents was the gate sinking fixtures underground.
  Cross-check any all-green number against the app's own per-step log before reporting it.
- **A same-line `// comment` can swallow object keys.** A scripted edit silently dropped 4 DiscWalker API exports and
  `node --check` passed. After any scripted edit to an object literal, grep the diff for mid-line `//` and check exports with
  `node -e "require(...)"`.
- **Snapshot after the ASYNC re-fold, not at the row flip.** With signed GEOM_SWEEP rows, undo/redo finish later. Wait on
  `ModellerHistory.pending()` + two macrotasks (W-WALK-GESTURE).
- **Witnesses that read the op-log length early race the seed** (read 0) under load. W-E2E-WALK and W-E2E-WALK-IFCOPEN do
  this. A base red with "oplog 0→N" is that race, not a regression.
- **A walk also commits routed-network rows** (sweeps + bend fittings). Any "op-log grew by placed count" assertion must count
  them from the op-log.
- **Do not "improve" routewalker pairing to next-nearest.** Measured: Duplex 18 fixtures → 110 runs, reaching 50 m targets.


## ▶ §RESUME 2026-09-21 — read THIRD (after §RESUME 2026-09-26 and §STRATEGY 2026-09-24 above). Supersedes the 2026-09-15 block below, which is kept for its
## history but is NO LONGER the entry point. Written at session close; every number below was measured.

**WHAT THIS SESSION DID.** The 2026-09-15 block ordered a re-verify sweep of the 34-row §OPEN LIST. That
sweep ran, and then four of the rows it surfaced were actually fixed. Merged: bim-ootb **#1738 #1744
#1747 #1749 #1750 #1753**; bim-compiler **#105-#118**.

| row | was | now |
|---|---|---|
| 36 | IFC export emitted an **empty file** for every resident (592 bytes, 0 products) | ✅ #1747 — Duplex 196→196, SampleCastle 3,225→3,225, round-tripped through re-import |
| 12 | `rel_fills_host` on 3 of 8 residents → **#1706's anchor/ride engine inert on 5** | ✅ #1749/#1750 — 943 new rideable edges; ride now works on **7 of 8** |
| 35 | the LIVE guide contradicted shipped behaviour for a week | ✅ site consolidated onto master (#106) + published; verified live |
| 28 | "293 tilted elements render with IDENTITY" | ✅ does NOT reproduce — 230 genuinely rotated, **0 dropped** (#1738) |
| 24 | `smoke_arc_only.js` silently ran 1 of 2 buildings | ✅ root cause `e2e_harness.js:349` `process.exit()` (#1738) |
| 19 · 23 · 32 | verified-open | ✅ closed / re-pointed — see §SWEEP |
| 7 | "0.104 m residual, needs a heavy session" | **re-measured** (#1753) — baseline not stale, the shipped path under-reports it. See the row. |

**THE ONE PATTERN WORTH INHERITING: `element_transforms.center_xyz` is the IFC placement ANCHOR, not the
volumetric centre.** Any consumer treating `[center ± bbox/2]` as a world box is displaced — measured
median 78 mm, up to 425 mm. **Three consumers found:**
1. `cross_edges.js` — **FIXED** (#1744). 843 of 9,817 abuts edges were wrong; now 11.
2. `str_walker_bridge.js:22/38/50` — row 7's grid. Re-measured, **not** fixed (see row 7).
3. `scripts/compile_rooms.py` — Viewer room injection. **Recorded, unmeasured.** Its exposure is NOT
   uniform: `door_dims` reads extents only and is safe (934/934 correct); the position readers are not.
   `SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. **Measure before touching.**

**WHAT TO CHASE NEXT, ranked.** Detail in §SWEEP FOLLOW-THROUGH and the rows themselves.
1. ✅ **DONE 2026-09-24 on branch `fix/xedge-3axis` (§STRATEGY, non-MEP gaps): the rx/ry guard, 11 of 11.** **The residual 11** (#1744's honest RED). Two suspects, never measured apart: `_readBoxes`' `rx/ry`
   guard — whose stated premise is the same false claim corrected in #1738, so it fires on real data and
   the 3-axis path it distrusts is now itself witnessed, making it probably liftable — and the 1,301 of
   3,225 elements with no resolvable blob. **Measure which, before changing either.**
2. **Row 7's heavy session** — now has what it lacked: it must decide WHETHER it chases 0.0939 m (what
   ships) or 0.1039 m (the honest number). Starting without that decision is how it stalls again.
3. **Row 6** — Terminal serves 0 MEP on the real open path.
4. ✅ **CLOSED 2026-09-25 — CORRECTIONS, 0 box-caused artifacts** (802 → 657 → 643). Method: independent
   re-derivation of the datum definition (cross_edges.js deriveDatumsAnchored: ≥3 faces within 50 mm, greedy window),
   instrument-checked (reproduces 802/657/643 exactly from the shipped boxes; live mesh boxes == current boxes within
   1.2 µm on 3,225/3,225), then each datum tested on the LIVE render (≥3 supports within 50 mm of its plane):
   OLD 802 → **138 not real**; #1744's 657 → 5 not real (all its tilted-guard boxes); current **643 → 0 not real**, 2 unclear
   (held only by aggregate ghost rows, no mesh), 3 real alignments not emitted because the greedy window cuts them (a
   property of the definition, identical in the Python oracle — a spec note for red1, not a defect). #1744 also lost 6
   real planes and made 1 spurious one through the rx/ry guard; #1762 restored/removed all 7. 76 count changes are
   re-clusterings (plane kept, merged with a neighbour ≤ 97 mm). Row 7 stays un-linked. Evidence: session scratch
   probe_datums.js + analyze_run2-4.log (two runs, identical). The original line read: Datums 802 → 657 (SampleCastle, from #1744). Still unverified as a *correction* rather than a new
   artifact. ⚠ It does NOT bear on row 7 — I claimed it did and that is retracted (#118).
5. Rows 8 · 9 · 11 · 13 · 14 · 22 · 25. **Row 14's cited example does not reproduce** — re-source it or
   its witness is green on arrival.
6. Blocked on the user, nothing built: 15 · 21 · 26 · 27 · 29 · 31.

**METHOD RULES THIS SESSION PAID FOR. Each one cost a wrong answer first.**
- **Diff against a BASELINE before claiming — or clearing — a regression.** Running 11 witnesses on the
  fix AND on unmodified `origin/main`, side by side, is what caught `witness_e2e_save` breaking (green →
  3/2) *and* proved four other failures were pre-existing. Without the baseline both conclusions were
  unavailable.
- **Never re-derive a transform you can read.** `cross_edges.js` re-implemented "world = centre + R·vert"
  and called it "the same final numbers, fewer steps". It was wrong for 798 of 934 elements. #1747's IFC
  export instead reads the renderer's own baked world vertices, so parity is structural.
- **Wait on a CONDITION, not a duration.** My own witness lied twice: a fixed sleep, then "name matches
  and the bridge stopped changing" — which the PREVIOUS building's untouched bridge satisfies, because
  `__dwName` flips at open START while `__arcFidByGuid` is rebuilt later. Null the globals, wait for
  repopulation (#1750). **Any witness opening more than one resident needs this.**
- **The instrument check comes FIRST, and it is not a formality.** Two probes measured the wrong quantity
  and looked conclusive: comparing a rendered AABB to `element_transforms.bbox_*` proves nothing, because
  `extractIFCtoDB.py:181` defines those columns AS the world AABB. Both W-ARC-3AXIS and
  W-ROW7-GRID-BASELINE now open with a control that voids the run if the decode is wrong.
- **Prove a fix FIRES on merged main, not that it shipped.** A sibling session had two commits stranded
  by auto-merge in one night. Every fix here was re-run against `origin/main` after merging.
- **Docs publish ONLY via `scripts/safe_gh_deploy.sh`.** CLAUDE.md bans bare `mkdocs gh-deploy`; I
  reached for it twice before reading that, and was blocked both times — correctly. The guard caught a
  real deletion (`glassbowl_data.db`) that I had also found by hand.

**TRAPS — state of the world, so nobody re-discovers these.**
- **CI `system-is-real` has NEVER been green — 198 of its last 200 runs failed, back to 2026-07-05.**
  A red X on a bim-compiler PR is **no signal**; check whether the failure is new before believing it.
  87% of it is unpassable by construction. Fully diagnosed in `LFS_QUOTA_AUDIT.md` (#107).
- ~~**`playwright` is NOT installed**~~ ⚠ WRONG, corrected 2026-09-24: it is at `~/bim-ootb/tests/node_modules` (1.59.1); set `NODE_PATH` for bare requires (§STRATEGY). Original: `witness_str_into_arc`, `witness_green_report`,
  `witness_modeller_xedge_lens`, `witness_arc_editable_smoke`, `sdg_gate/cascade_smoke` crash on
  `Cannot find module 'playwright'`. Pre-existing, unrelated to any change here. `puppeteer` IS available
  (resolved from `~/bim-compiler/node_modules`), which is how every witness here ran headless.
- **Gitignored local fixtures.** `modeller/Terminal_arcstr_proof.db` (.gitignore:49) and
  `docs/glassbowl_data.db` exist on the primary checkout's DISK but not in git, so a fresh `/tmp/wt-*`
  has a 0-byte placeholder. That is why W-ROW7-GRID-BASELINE prints INCONCLUSIVE rather than passing over
  an empty population, and why a docs deploy from a fresh worktree aborts. Not a bug — know it.
  `glassbowl_data.db` now also has a durable OCI copy (`§GLASSBOWL-OCI`).
- **Terminal declares ZERO void/fill relations in its source IFC.** Its ride gap is a SOURCE DATA gap,
  asserted in W-RFH-RESIDENTS F4. **Do not "fix" it by fabricating edges.**

**HYGIENE.** This session created and pruned **21** worktrees; **0** of mine remain. 33 `/tmp/wt-*`
survive from other sessions — not mine to prune, and several hold unpushed work (see the 2026-09-15
block's table). `.claude/worktrees/agent-*` are harness-managed; never remove those by hand.

## ▶ §RESUME 2026-09-15 — ⚠ SUPERSEDED by §RESUME 2026-09-21 above. Kept for its history (the worktree
## table is still the current one); it is NOT the entry point. Written by the session that did NOT touch
## the Modeller, so you inherit facts, not a handover story.

**WHAT THE LAST SESSION DID, AND WHY IT MATTERS TO YOU: nothing in `modeller/`.** It ran the Viewer 4D/5D
lane (`TM_4D5D_VARIANCE_LANE.md` §S7 — the construction window on an element). Merged to bim-ootb `main`:
#1731 #1732 #1733 #1735 #1736 #1737; to bim-compiler `master`: #101 #102. Touched `viewer/*` and
`tests/audit_sw_precache.js` only. **No `modeller/` file was edited, so nothing below is stale because of
it** — but two of its by-products are yours to know:
- `viewer/sw.js` is at **`CACHE_VERSION` v1177**. Bump from there, never from a remembered number.
- `tests/audit_sw_precache.js` was hardened (#1737): it now strips comments before pairing quotes, so an
  apostrophe or a `]` in a `PRECACHE_ASSETS` comment no longer silently drops every later entry. Before
  that fix it reported files unchanged for months as "unlisted" and said nothing about the real cause. If
  you add a modeller asset to a precache list, that gate is trustworthy again.

**VERIFIED NOW, not carried forward from prose (2026-09-15):**
- `modeller/tests/` holds **216 witnesses**. Last `modeller/*` work landed **2026-09-11**: the §DAGEVU
  relationship-edge engine and the cut-move arc (`#171x` series — GEOM_CUT_MOVE, GEOM_CUT_RESIZE, cut
  frame under a 90°-multiple GEOM_ROTATE, §DAGEVU-SLIDE).
- **Nothing is in flight.** Both modeller worktrees (`/tmp/wt-dagevu-engine` `feat/dagevu-slide`,
  `/tmp/wt-dagevu-resume-doc` `docs/resume-dagevu-engine`) are `ahead=0 dirty=0` — fully pushed, clean,
  prunable. No one is mid-edit.

**⚠ THE §OPEN LIST BELOW WAS HARVESTED 2026-07-30 AND IS ~6 WEEKS STALE.** Its 34 rows predate the entire
DAGeVu engine arc. **That sweep has now been DONE — see §SWEEP 2026-09-15 immediately below this block.**
All 34 rows were re-marked against `origin/main` @ `3e8c6be2`; 8 moved, 2 new rows were found, and 4
witnesses were actually run. **Read §SWEEP's verdict column, not the 2026-07-30 status column** — where
they disagree, §SWEEP is the measurement and the old column is prose. Do not trust row ordering as
priority. Row 34's "NEXT SESSION START HERE" is spent: it is answered in §SWEEP (and it split in two).

**Row 34 ("anchor export/save leak") — ANSWERED 2026-09-15, both code paths read. Full verdict in
§SWEEP.** Short form: the IFC path cannot leak an anchor because it never handles `GEOM_INSERT` at all —
but that also means it exports NONE of the ARC seed (now row 36, the bigger finding). The Save / Native
`.db` path DOES carry the anchors, because `exportDb` is a raw byte dump of the whole signed op-log with
zero filtering; whether that is a leak or correct behaviour is a call, and it is unwitnessed either way.
`saveModelDb` named in the row does not exist — the real path is `runSave() → Bonsai.exportDb()`.

**HYGIENE — swept 2026-09-15, partly done, and the remainder is NOT yours to prune.** The sweep ran over
all 22 outstanding `/tmp/wt-*` worktrees: **14 pruned** (the 5 this session created, plus 9 verified
`ahead=0 dirty=0` — including both dagevu ones). **13 remain, and every one of them holds real work:**

| state | worktrees | why it stays |
|---|---|---|
| unpushed commits (`no-remote` branch) | `wt-bake-perf` · `wt-batch-class-paint` · `wt-idb-cache-timeout` · `wt-krn-persist-race` · `wt-rule-findings-film` · `wt-storey-cut` · `wt-storey-reveal-list` | the branch was never pushed — pruning DESTROYS the commits |
| merged but dirty | `wt-bake-schedguard` (3) · `wt-buildup-placed` (27) · `wt-scrapbook` (1) | uncommitted changes on top of a merged branch |
| ahead and dirty | `wt-88-ab` (56 ahead, 4 dirty) · `wt-v87` (2 ahead, 17 dirty) · `wt-storey-reveal` (73 dirty) | someone's live in-progress work |

**Do not prune any of the 13 without the owner's word.** `wt-storey-cut` alone carries 359 dirty files.
If you add worktrees, prune YOUR OWN at close (`ahead=0` AND `dirty=0`), and leave these alone.

**METHOD RULES THIS LANE EARNED THE HARD WAY LAST SESSION — they apply here unchanged:**
- **A number that decides scope gets measured before it decides anything.** Three times in one session a
  plausible figure stood in for a measurement: a timing taken from the wrong function, a code comment's
  cap turned into a prediction, and a cross-file diff read as code drift. All three were wrong, all three
  were caught only because something forced a re-check.
- **A diff that decides scope must hold every variable but one.** The third of those varied two — the file
  AND the code version — then blamed the code. In THIS lane that trap is live: `*_extracted.db` and
  `*_silent.db` are different files with different completeness (Hospital: 64,150 transforms vs 63,917).
  Never diff across two building DBs and attribute the difference to code.
- **Prove a fix FIRES, not just that it shipped** — grep a real log line, never "code changed".

