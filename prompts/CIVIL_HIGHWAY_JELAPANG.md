# CIVIL_HIGHWAY_JELAPANG — first civil-works (highway) IFC set through the viewer

# ⚠ DO NOT REMOVE
- **Scope:** make a civil/linear IFC set (JELAPANG highway, Civil 3D 2024, IFC2X3) work in the viewer
  without changing how buildings behave. Spec → code → witness, one item at a time.
- **Code lives in bim-ootb.** Work in a `/tmp/wt-*` worktree off `origin/main` (shared `~/bim-ootb` is hook-blocked).
- **Read the log after every run.** Exit code / "it loaded" is not evidence — `§`-lines and stored values are.
- No visual check is a test (PRIMAL LAW). Before any 4D change read `4D_MODEL_INTEGRITY.md` §I + §E.
- **Full history** (all specs as written, research detail, rejected attempts): this file at bim-compiler
  `468c34b65` — consolidated 2026-10-05. Section letters below are kept so old commit messages still resolve.

## ⚖ NON-IMPACT RULE — civil work must not change how existing buildings behave (user, 2026-10-05)
> User: *"note in the specs that this new CW does not impact present buildings behaviour"*

Every civil change is **gated on civil data** (CIVIL_DISCS codes from file names, a slab-less model, a site
envelope beyond building scale, or the `element_psets` table) so a building never takes the new path. Each PR
states its gate and proves it on the fleet (Hospital, Terminal, LTU_AHouse, Duplex). Gates per PR: see §SHIPPED.
A civil change that cannot name its gate and its fleet proof does not ship.

---

---

## ▶▶▶ RESUME HERE — NEW SESSION (rewritten 2026-10-07 00:40; older resume blocks retired — full text at bim-compiler `9dd0a3e5f`)
Model = `~/Downloads/JALAN JELAPANG IFC/CivilWorksPath.db` (now carries the Kuantan MOCK site `site_latlong_source=mock_film_kuantan`,
for the sun only — undo in `mock_site_kuantan.sql` beside it). Film recipe/chapters: FILM_NARRATION.md §11.v7. Bake/TM defects for outside
review: `prompts/CWRoadBakeIssues.md` (Issues A–D, each with log lines + code). Working worktree: `/tmp/wt-erp-clip` (bim-ootb, branch
`fix/cw-pace-distinct`); localhost viewer `http://localhost:8411/viewer/viewer.html?db=buildings/CivilWorksPath.db&bld=CivilWorksPath`.
**Shipped 2026-10-07 (civil-only, gated on `isCivilModel()` — "subset treatment of a DocType", user):**
- bim-ootb #1919 MERGED (sw v1598) `§CW_SOLIDIFY_EVENT` — staged road pieces revisited when their support finishes (v6 55 s gap, Issue A).
  Witness `viewer/tests/witness_cw_solidify_event.js` PASS (fleet gate false ×5, building index byte-identical). User's Alt+C preview:
  "works, seems to build in full".
- bim-ootb #1920 (sw v1599, auto-merge) `§CW_PACE_DISTINCT` — civil film paces by distinct completion instants (11,893) so the day counter
  no longer freezes on day 18 (Issue B). Proof pending: v7 bake log.
- Issue D (backwards CH 10 Ground Treatment bar): task start = template-run date, ops 84 d later. Civil-only (fleet caches 0 mismatches).
  DB patch was applied then overwritten by the user's viewer save → bar backwards again; user: leave it. Generator fix open.
**ERP side found in the film work (2026-10-07) — owned by `ERP_IDEMPIERE_UX_PARITY.md` §MD-UPSTREAM + §BIM-CRUD:** Task Line showed every
project's lines in the user's session (master-detail model failed upstream; #1924 only fails closed) and BIM-pushed project records
cannot be deleted (overlay re-inserts them on boot — suspect). ERP chapter clip v2 (`~/Downloads/CivilWorks_ch3_erp_v2_narrated_AFTER.mp4`)
and Sections bonus (`…_bonus_sections_narrated_AFTER.mp4`) await user review — NOT spliced. Recorders: `prompts/film_erp_clip_recorder.js`,
`prompts/film_sections_clip_recorder.js` (real GPU). Lens pending items §PROFILE_LENS_PENDING; Civil guide live (CivilWorksGuide).
**In flight (check first):**
1. **v7 bake** → `~/Videos/CivilWorks_film_v7_{BEFORE.mp4,page.log,cli.log}` (flags as v6 + `--sun-compass`, both fixes). Read log:
   `§CW_SOLIDIFY_EVENT civil=true added>0`, `§CW_PACE_DISTINCT`, `§CPE_DAY_COUNTER` advancing, `§CPE_BUILDUP_PLACED_SUMMARY neverDrawn=[]`,
   `§GEOREF_SITE lat=3.8`. Then re-cut the build-up clips from v7 (user: "redo those clips to get build up well").
2. **ERP clip (Ch4)** — recorder `scratchpad/erp_clip.js` (persistent profile, `ERP_ONLY=990001` reuses the push). Facts so far: push
   LIGHTING+DRAINAGE → `§PROJ_PUSH lines=+2`, `§ZOOM_LINKBACK_STORE guids=416`, project 990001; ERP sign-in automated (GardenAdmin → Log In);
   `§BIM_OVERLAY rows=465` reaches the ERP; lines live under Phase → Task → **Task Line** (Project Line tab filters task-less lines — iDempiere
   standard, not a bug). Red pill returned `§ZOOM-ACROSS no-target` from the wrong tab click — fixed to the real `.idmp-adtab`, re-run queued.
   Deliver to `~/Downloads/` (user). `plannedAmt=0` — LIGHTING/DRAINAGE have no CIVIL_RATES rate (desc says so); don't voice amounts.
**Done this session:** Ch1 v2 narrated (`~/Downloads/CivilWorks_AltC_setup_ch1_v2_narrated_AFTER.mp4`, checkbox line); Ch0 + closing cards
(`prompts/film_ch0_card_v7.py`, WIP speech + 2nd closing statement); `CWRoadBakeIssues.md` dump.
**Next after the two above:** assemble v7 film (Ch0 card → Ch1 v2 → v7 build-up + WIP line → Ch4 ERP → Ch5 mobile → close + WIP card →
Chapter End). Then: Issue D generator fix (needs the live civil generate path reproduced), 7,612 tied completion instants (same writer?),
lens PR witness (`feat/profile-lens`), sky residual (parked).
Rules learned: whitebox first; all browser runs `flock /tmp/civil_browser.lock`; don't edit the user's DB while their viewer has it open
(their save overwrites it); never pkill with a pattern that matches your own shell (killed a queued job twice).

## ⚖ CANONICAL MODEL FILE (user 2026-10-06: "File we using has been told - CivilWorksPath.db")
`~/Downloads/JALAN JELAPANG IFC/CivilWorksPath.db` = CivilWorks.db (renamed: no place name) + the saved Alt+C path (cinema_path). Every
witness default, bake and film uses THIS file. CivilWorks.db = same elements without the path; witnesses written today that default to
CivilWorks.db (#1897 clash, #1900/#1902 volume, #1901/#1904 sections, #1906/#1915 ERP, #1916 link-back) give identical element results — repoint
their defaults when next touched.

## ⚖ POSITIONING — the receiving desk for infrastructure models (user, 2026-10-06)
> User: *"where do u see we might fit in?"* (re InfraGrid3D et al.) → agreed: *"Thus having such advantage, we only need to be 'half as good'"*.

Authoring tools (InfraGrid3D — browser, cloud, roads/utilities/lighting with in-tool clash; Civil 3D; OpenRoads) MAKE the road.
We take any authored IFC and handle everything after it: **cross-vendor clash** (geotech vs drainage from different teams/files —
an in-tool clash cannot see the other vendor's file), quantities/earthworks volume, 4D, film, ERP handoff — in the browser, no
server, deterministic, MIT. **"Half as good" rule:** we do not chase authoring parity (no road design, no alignment editing);
each feature only needs to be good enough to hand off, and must be provably correct (witness), not rich.
Source for InfraGrid3D: a directory listing only (productcool.com/product/infragrid3d) — its IFC 4.3 export is UNVERIFIED;
if it exports, it is a feeder, not a rival. Consequence: the queue below runs differentiators first (clash, volume), looks later.

**NO PLACE NAME ON SCREEN (user, 2026-10-06: "we do not want the name 'JELAPANG' to crop up … replace with 'Civil Works'").**
Done on CivilWorks.db: 292,634 text values renamed (project/building name now "Civil Works VBC", 19,892 building rows, 250,385 pset
names, 14,515 pset values; `quick_check` ok; row count 19,892 = before). `kernel_ops` NOT edited (hash-chained + signed — editing
breaks the chain). Pre-edit copy: `CivilWorks.before_rename.db`; log: `rename_jelapang.log` (same folder). Viewer code has the name
only in comments + test default paths (not shown to users). A fresh re-import of the source IFCs brings the name back.

## §NEXT_WAVE — user 2026-10-06: "I reckoned the rest are yes" (long-section, cross-section, handoff audit, Chapter 0) + "Where to call (a) in the Viewer?"
### §EW_VOLUME_SURFACE — where the bounded volume is seen (spec)
MEASURED: `A.earthworksVolume()` (cpe_road_panels.js:80) is shown ONLY on the Alt+C film's card titled "Coming to this view — planned"
(cpe_road_panels.js:299) — composited at bake time (cinema_maxq.js:2200); no interactive viewer surface; devtools `A.earthworksVolume()` only.
The title is now wrong (it is measured, not planned). Spec: (1) move the volume row to the ground/earthworks card; (2) show the same line in
`model_check_report.html` (a "Quantities" stat card) and in the 4D/5D page's quantities for the EARTHWORK discipline — one owner
(`A.earthworksVolume`), no second computation; civil-gated. Witness: the same string on all three surfaces on CivilWorks.db; buildings show none.
**§EW_VOLUME_SURFACE ✅ DONE — bim-ootb #1902 MERGED 2026-10-06 (sw v1594).** One owner `viewer/earthworks_volume.js` (window.EarthworksVolume;
cpe_road_panels.js wraps it). Line "≈ 22,048 m³ (48 open edges, ±2.3 m³)" on: Alt+C ground card ("Ground works here" — only in stretches with
GEOTECH/GABION), `model_check_report.html` Quantities card, `boq_charts.html` EARTHWORK row (`§EW_VOLUME_SURFACE surface=… verdict=APPROXIMATE`);
planned card no longer carries it; Duplex VACUOUS on all. Witness `witness_ew_volume_surfaces.js` GREEN 11/0 (pass line only in the agent's harness
output, not in /tmp/ews_logs), RED on #1900 tree 6/5. Not re-run after the final sw.js/viewer.html merge.
### §LONG_SECTION — road profile along the route (spec)
Source of the idea: a road-design tool's public listing (linked plan / 3D / long-section views) + our §E ("chainage nav 🟡") / §H.
Sample along the inferred route (`A.civilDriveRoute()`, §CHAINAGE_V2) every Δs: road top z, ground z (raycast down onto EARTHWORK/terrain via
the existing BVH), drain invert z where a DRAINAGE element is crossed. Draw a 2D chart (s on x, z on y, ONE axis) in a panel; click a point →
camera to that chainage (linked view). Label "chainage (inferred)" while the route is inferred — for navigation, not gradient design.
Witness: monotonic s; sampled z equals a direct raycast at 5 random s within 1 cm; click → camera within 1 m of route(s); building → no panel.
### §CROSS_SECTION — section square to the road at a chainage (spec)
Reuse the existing section box; orient it to the route tangent at the picked s (from §LONG_SECTION click or a chainage input); thin slab
(width from the box UI). Witness: box normal · route tangent ≥ 0.999; elements cut at s are exactly those whose bbox spans the plane.
**§LONG_SECTION + §CROSS_SECTION ✅ DONE (witness) — bim-ootb #1901 MERGED 2026-10-06 (sw v1593).** New `viewer/civil_sections.js` ("Road profile"
button + panel; API civilLongSection / civilRouteAt / civilCastZ / civilCrossSection / civilCrossSectionOff / civilSectionCut / civilGotoChainage).
Owners reused: route `A.civilDriveRoute()` (effects.js:10849), gate `A.isCivilModel()` (streaming.js:323), section plane tools.js:475-567 (+2nd plane → 2 m slab).
Δs 10 m (route built from 50 m bins → finer = noise; capped 500 samples). CivilWorks.db: `§LONG_SECTION samples=213 routeLen=2110.3m road=175 ground=51
drain=16 rays=639 heapMB=1985 vertsAdded=0`; raycast match 0.00000 m (5 random s × 3 series, independent caster); click → camera 3e-14 m from route;
`§CROSS_SECTION normal·tangent=1.000000 elementsCut=73 ofIndexed=19892` = independent recompute exactly. `§WITNESS_CIVIL_SECTIONS PASS 12/12`; RED (no file)
FAIL; Duplex VACUOUS (not PASS). Open: fleet proof Duplex only; DLOD-hidden elements not excluded from the cut set; click resolution ≈ 2.7 m/pixel.
### §SECTION_CIVIL_MODES — Long/Cross live INSIDE the Cut section tool (spec; user 2026-10-06: "i rather not clutter viewer but extend from the cut section tool? it has x/y/z. If detected is a CW long profile then give Long/Cross? And a scrubber to drag along the length of the road?")
- DELETE the floating "Road profile" button (`civil-section-btn`, civil_sections.js `_build`). No new top-level control.
- In the existing Cut section panel (tools.js `section-slider-panel`, axis buttons `sec-axis-x/y/z`, `A.setSectionAxis`): when
  `A.isCivilModel()` AND a route exists, add two axis buttons **Long** and **Cross** after X/Y/Z; buildings see X/Y/Z only (unchanged).
- **Cross:** the panel's slider becomes a chainage scrubber 0 … route length (m, "inferred" label); dragging moves the 2 m slab square
  to the route tangent LIVE (`A.civilCrossSection(s)`), shows "chainage N m (inferred)".
- **Long:** the profile chart (`civilLongSection`) shows inside the section panel; the same scrubber moves the chart cursor + camera
  along the route (`A.civilGotoChainage`); clicking the chart sets the scrubber.
- Switching back to X/Y/Z or closing the tool clears the civil slab (fixes the untested "Cut section while civil slab on" path).
- Witness: building → exactly 3 axis buttons, no civil UI; civil → 5; dragging the scrubber to 3 values → normal·tangent ≥ 0.999 at each, cut set
  = independent recompute; Long scrub → camera within 1 m of route(s); X/Y/Z after Cross → 1 clip plane, not 2; no `civil-section-btn` in the DOM.
  Deletion budget stated (lines +/−).
### §PROFILE_LENS — round glass over the 3D view that unrolls the stretch beneath it (spec; user 2026-10-06: "a large round glass that hovers over the canvas and it unrolls a flat profile? Where zooming in or out likewise controls the scope of section")
- Long mode of the Cut section tool = the lens (DEPRECATES the panel chart from #1901/#1904 — delete it; Cross + scrubber stay).
- **REVISED 2026-10-06 (user: "set the size perhaps to 1/3 canvas size, and it magnify to a standard fix length? No zooming. It is like a quick
  purview.. then when needed. output in PDF?"):** lens diameter = 1/3 of the canvas width (capped at the canvas height); FIXED span, NO wheel
  zoom — default 100 m (±50 m around s0; my choice, not a cited standard — one setting, user may change); version 1 = lines (road / ground /
  drain + chainage scale), pre-computed ONCE at 1 m on first Long entry ("preparing profile…"), hover only slices arrays (no raycasts on hover).
  Witness adds frame time lens on vs off (§PROFILE_LENS_PERF) and precompute ms + heap. **PDF:** "Profile PDF" in Long mode opens a new tab with
  the whole road as fixed-length sheets (same span per sheet) + data band (chainage, ground z, road z every 10 m), print CSS → browser
  "Save as PDF" (no new library). Version 2 (real meshes flattened in the lens) only after v1 is measured.
- **REVISED again 2026-10-06 (user: "or PNG?" · "may zoom (your idea). Drag the lens.. then scroll within?"):** the lens is DRAGGED and stays
  where dropped; wheel INSIDE the lens zooms the span (default 100 m, range 50 m … whole road; camera wheel unaffected outside the lens);
  output = Profile PDF tab AND PNG (lens view, and per sheet).
- **REVISED 3 (user: "drag the lens by its circumference. Mouse inside, 2 finger control as expected?"):** move the lens only by its RIM;
  inside: wheel / pinch (two-finger, trackpad ctrl+wheel) = span, drag / pan = slide along the road; inside gestures never reach the 3D camera.
- Hover: lens follows the pointer; centre = nearest route point (chainage s0, "inferred"); draws road / ground / drain profile for [s0−w, s0+w],
  flat, read-only overlay (no scene change). Wheel inside the lens sets w (±25 m … whole road); samples re-taken across the span (fine at small w).
- Click: pin + camera fly (+ Cross cut there if Cross is on). Data band under the curve (chainage, ground z, road z) at the lens scale.
- Print tab (queued after): "Print profile" opens a clean page in a new tab (chart + data band) for paper.
- Prior-art check (2026-10-06, 2 web searches): parts exist SEPARATELY — map-synced profile viewers (Carlson Natural Regrade, QGIS, ArcGIS Pro,
  BikeRouter), cursor loupes (image magnifiers, Infor roadway magnifier). The combination (lens over the 3D model showing the profile of the
  stretch under it, wheel = span) was NOT found — do not call it "first"; date the idea here.
**Find → ERP Project Order on CivilWorks ✅ PASS (witness) 2026-10-06** — `viewer/tests/witness_civil_find_erp_push.js` (PR bim-ootb #1906, witness only).
Wait `§MERGE_CONTRACT verdict=COMPLETE`, Discipline axis, select ROAD+LIGHTING+DRAINAGE+SIGNAGE+MARKING → `§PROJ_PUSH plannedAmt=1302560`,
`§PROJ_PUSH_LINK project=990001 record=990001` (window 130 deep-link), read-back 1 C_ProjectLine `IfcBuildingElementProxy · 4652 ea · price 280`.
My earlier INCONCLUSIVE = instrument (no load wait, 8 s fixed wait). ⚠ LIMIT: proj_fold.js:246-260 makes one line per IFC class → every civil
discipline collapses into ONE "IfcBuildingElementProxy" line. Proposed generic fix (not built): when the class is the generic proxy, group by
discipline (IFC2X3 proxies are generic in any model, not civil-only).
**ERP fold — proxies by discipline (PR bim-ootb #1915 ✅ MERGED 2026-10-06 (CI no-undef fix: window.CIVIL_RATES); decision: proceed — "U decide because that is a test case").**
proj_fold.js: a proxy with a discipline groups by discipline; price from rates.js CIVIL_RATES (same owner as boq_charts.html:1173), null →
qty carried, price 0, "rate not set". Old 280 = rsmeans2024_us.json proxy rate via en_US locale (rates.js:720), a building rate on road
assets. CivilWorks: Road 4008 / Lighting 216 / Drainage 200 / Signage 138 / Marking 90 (sum 4652, price 0). Hospital: amount 64,719,477 and
qty 63,182 identical; its 1 proxy line splits into 5 (ARC 1770, ELEC 1125, FP 6, MEP 2246, PLB 582) → 28→33 lines (intended). SampleHouse
identical (9 lines, 155,360). Node witness tests/poc_proj_fold_proxy_disc.js PASS; browser witness_civil_find_erp_push PASS. Existing
iDempiere Hospital record unchanged; new pushes use the split.
**Red pill (Zoom Across) back to the civil model ✅ — bim-ootb #1916 MERGED 2026-10-06.** Cause: erp/idempiere.html built
`../buildings/<Project.Value>_extracted.db` → `Civil Works_extracted.db` (404); order kept no GUIDs. Fix (+48/−4): push stores
C_Project.Description "BIM src db=<A.DB_URL>" + Note = pushed GUIDs; `_viewerUrl` uses the tag (else the old convention — Hospital
byte-identical), GUID set → find= (long sets via a localStorage token find=@…), main.js resolves the token into the existing applyFindScope
guid path. Node witness witness_zoom_linkback_node.js PASS (644 GUIDs = pushed set, 644/644 real rows); poc_zoom_across.js Hospital 8/8.
Live end-to-end highlight on a real civil load NOT run (load ~30) — parser-level proof only.
### §HANDOFF_AUDIT — neutral loss report + version diff (spec only, build later)
Per import: elements / psets / materials / storey+discipline links kept X of Y, dropped Z (ids listed) vs the source IFC; per re-export
(same FILE_NAME identity, the (f) case): added / deleted / moved / pset-changed vs the previous version. Deterministic; result row in
kernel_ops. Seed case: LIGHTING v1 227 → v2 216 (11 deleted, all GUIDs ⊂ v1). Witness: the v1→v2 case reports exactly those 11.
### Chapter 0 (film) — intro "what this is all about": FILM_NARRATION.md §11.v5 STRUCTURE.

## (retired 2026-10-07) older NEXT SESSION / RESUME blocks — all items DONE or carried into the block at the top; full text at bim-compiler `9dd0a3e5f`.

## §0 Source set (measured 2026-10-04)
Folder `~/Downloads/JALAN JELAPANG IFC/` — 7 IFCs + Civil 3D export logs. Test DB: **`JELAPANG_AFTER.db`**
(451 MB, fresh import with labels). `JELAPANG.db` (408 MB) is the pre-#1844 crushed import — don't test on it.

| File | Elements | Note (from the file's own `.log`) |
|---|---|---|
| JELAPANG_ROAD.ifc (278 MB) | 4008 | mainline 3D solids |
| JELAPANG_ROAD FURNITURE.ifc | 1011 | 39 solids + 972 block refs |
| JELAPANG_ROAD LIGHTING.ifc | 227 | ~16 strays ~57 m below the road |
| JELAPANG_DRAINAGE.ifc | 200 | 11 pipes + 95 structures + 2 TIN surfaces **skipped** by exporter |
| JELAPANG_ROAD SIGNAGE.ifc | 138 | |
| JELAPANG_ROAD MARKING.ifc | 90 | |
| JELAPANG_EARTHWORK.ifc (5 KB) | 0 | TIN **skipped** — no terrain exported |
| **Total** | **5674** | all `IfcBuildingElementProxy`, declared unit METRE |

Extent after #1844: **2114 × 1296 × 96 m**, georef offset (28608, −23548, 0). Route along MAINLINE (Fly path,
50 m bins) **2,373 m**; main-axis extent 2,348 m (lower bound), bearing 22.8°. "7 km" is the user's description —
not measured; exact length needs the alignment export. **No georeference:** IFC2X3, no IfcMapConversion,
`true_north_source=default_zero`, unknown local grid.

**Psets carried** (5 JKR DAK templates, ~130 fields, mostly empty; chainage/GPS fields all `$`). Filled:
signage `16_Name`/`17_Code` (JKR sign codes WD. 39a/39b, RP. 13 …); road `01_Component_Name` (MAINLINE 541,
ROAD J2A 211, J2B 94, EXISTING LANE -J1A/-J1B, -ROUNDABOUT, VBC; 2880 blank); drainage `02_Type` + `03_Dimension`
(600×600 ×79, 1500×1500 ×33 …, culvert 1200 RCP ×6); lighting `15_Name` (6 × TRAFFIC SIGNAL). No lamp photometry.
Stored by the importer for civil files only → `element_psets` (102,495 rows on a fresh import).

---

**NEW SOURCE SET (user 2026-10-06): `~/Downloads/JELAPANG IFC.zip`** (120 MB, 23 files, folder `IFC/`). User plans next session: merge
them into the same DB and save. EXTRACTED 2026-10-06 into `~/Downloads/JALAN JELAPANG IFC/IFC_MORE/` (6 files, byte-checked against the zip): GEOTECH, CHAINAGE, ROW,
GABION MATTRESS, EARTHWORK + ROAD LIGHTING. ROAD LIGHTING new = old minus 11 objects (216 shared GUIDs at identical positions, 0 added; the
11 removed sit in one ~30 m spot at x≈29,648–29,677, 7 of them based at z −1.6/0 m — the buried strays §NIGHT_CIVIL_LAMPS rejected) →
REPLACE the old lighting, do not add (adding duplicates 216 lamps). ROAD / DRAINAGE / FURNITURE / MARKING / SIGNAGE unchanged — not extracted.
Contents (all IFC2X3, Civil 3D export, every object IfcBuildingElementProxy; counts from the files + their export .log):
| file | size | objects | vs what we have |
|---|---|---|---|
| JELAPANG_EARTHWORK.ifc | 8.45 MB | 1 (AcDb3dSolid) | NEW CONTENT — old file was empty (TIN skipped); likely the terrain/earthworks solid |
| JELAPANG_GEOTECH.ifc | 100.5 MB | 9,145 (6 solids + 9,139 block refs) | NEW discipline |
| JELAPANG_CHAINAGE.ifc | 2.15 MB | 332 solids | NEW — chainage markers (may give a REAL chainage for §CHAINAGE, replacing the inferred route) |
| JELAPANG_ROW.ifc | 7.93 MB | 1 solid | NEW — right-of-way boundary solid |
| JELAPANG_GABION MATTRESS.ifc | 0.33 MB | 11 solids | NEW |
| JELAPANG_ROAD LIGHTING.ifc | 19.67 MB | 216 block refs | RE-EXPORT 2026-10-05 (old 19.71 MB from 10-02) |
| ROAD / DRAINAGE / ROAD FURNITURE / ROAD MARKING / ROAD SIGNAGE | unchanged sizes + dates (09-08 / 10-02) | — | same as loaded |
Import gate check (viewer/import_worker.js `discFromFilename`, CIVIL_DISCS = ROAD, FURNITURE, LIGHTING, DRAINAGE, SIGNAGE, MARKING, EARTHWORK):
EARTHWORK maps to EARTHWORK (SEQUENCE_CIVIL phase Earthworks, seq 1). **CHAINAGE, GEOTECH, GABION MATTRESS, ROW match NO civil word → they
would import with no civil discipline** (class fallback). Decide per file before merging (e.g. GEOTECH/GABION → earthworks or a new civil
code; CHAINAGE/ROW → reference/annotation, not built in 4D) — needs a spec + the user's ruling; NON-IMPACT rule applies.

## §SHIPPED — all merged to bim-ootb main (2026-10-04 → 10-07)
- 2026-10-07 #1919 `§CW_SOLIDIFY_EVENT` (gate isCivilModel, witness_cw_solidify_event.js) · #1920 `§CW_PACE_DISTINCT` (gate isCivilModel; civil branch of `_workCursorAt`) — see CWRoadBakeIssues.md §8/§10.
| PR | What | Gate (non-impact) | Witness / fleet proof |
|---|---|---|---|
| #1844 | §A units: deleted the `span>1500 → ×0.001` heuristic (web-ifc 0.0.77 already outputs metres) · §B.2a civil disciplines from file name (space split, civil words only) · §I.3 robust framing p2–98 | units: never fired <1.5 km · disc: civil words · framing: full env > 2× core | `witness_import_units_disc.js`; SampleHouse 14.0×5.9×3.5 m unchanged; 464 names → 13 change, all road; LTU 426→126 m, others KEEP |
| #1847 | cache-bust `import.js?v=5` → worker `?v=13` | — | fetched back live |
| #1849 | §M stray-robust ground (p2 of bottoms) + civil discipline colours | §GROUND_Y step 4 only | JELAPANG plane −11.10 → 51.74 m; fleet resolves at step 1 |
| #1850 + #1852 | §P shadow box follows camera (+ throttle) | whole-site texel > 0.25 m (env > 256 m) | fleet envelopes 151/126/69/22 m → off |
| #1851 | §Q Time Machine civil phases (`SEQUENCE_CIVIL`, `4D_template_civil.json`) | all elements ∈ CIVIL_DISCS | `witness_civil_phase.js`; `cache_4d_run` 4 buildings identical |
| #1853 | §Q.2 civil trades + `placement:'logic'` parallel finishing (66→60 d) · §R.2 5D civil lines, rates null `pending` | civil template / CIVIL_RATES only | fleet identical; Duplex BOQ 34 lines RM 1,064,715.92 = main |
| #1854 | civil crews reach every reader (Gantt read model, BOQ ops, load path, edit delta); `_GANTT_CACHE_VERSION` 39→40 | `civilRuleFor` null for non-civil | — |
| #1856 | Alt+S Save PNG / Close overlay when no WebGPU bounce (§STILL_OVERLAY_NOGI) — the "stall" on a LAN-IP URL | no-WebGPU path only | headless + user console log |
| #1857 | §U fog sized after envelope; `§TOUR_NO_ROOMS VACUOUS` | sites past the 0.004 cap | fleet stays on cap |
| #1858 | §U civil property labels (`element_psets`) + Fly Tour flies MAINLINE, 5 traffic-signal stops on the scrubber | `element_psets` exists | 2,373 m, 12 actions, 131.8 s |
| #1859 + #1860 | §V civil clash pairs (`family:"civil"`, tol 0) + one `_clashIgnoreSet` owner + `typeof tolerance` fix | civil family rules | `witness_clash_civil_pairs.js` 11/11; fleet guid-pair sha1 identical |
| #1861 | §V.4 hide box-only rows when pair box total ≥ 1000 (all models, user's rule) | by count | `witness_clash_boxonly_hide.js` 11/11 |
| #1862 + #1863 | §W.1 night lamps at real lamp heads (from mesh), strays/short rejected, lazy Fly route on label-less imports, `civil_labels.json` | discipline LIGHTING | `witness_civil_night_lamps.js`: 172 columns / 223 heads within 1.3 cm of rendered box, 6/6 signals |
| #1864 | §Z import progress on the viewer status line | — | `witness_import_feedback.js` 6/6 |
| #1865 | §Y Measure double-click sizes the ELEMENT (highlight, area, L×W×H on own axes) — was summing the whole batch | — | — |

**Civil clash numbers (§V.3, mesh-true via `clash_narrow.js`):** DRAINAGE×ROAD 23,288 box → 1,852 mesh ·
LIGHTING×DRAINAGE 1,040 → 67 · SIGNAGE×DRAINAGE 385 → 4 · FURNITURE×LIGHTING 253 → 52 · SIGNAGE×LIGHTING 12 → 0.
Total 24,978 box → 1,975 real (92 % box-only); 173 are flat contacts < 1 mm. Many are INTENDED (culverts/scuppers
through pavement) — listed by `02_Type`, never auto-hidden.

---
- 2026-10-06: #1875 lamp glow hidden by day (§GLOW_DAY) · #1877 road reveal shell incl. pavement (§REVEAL_SHELL) · #1878 film v2 one drive +
  junction orbit (§ALTC_V2) · #1879 data cards on quiet stretches (§ALTC_PANELS) · #1880 chainage levels, lamps never before road (§CHAINAGE_V2)
  · #1881 no building labels on road films (§ALTC_LABELS) · #1882 road checks as VALID/SPECULATIVE formula cards (§ALTC_CHECKS) · #1883 film v3:
  build by pieces completed, no load-path freeze, 8 s approach, grass + compliance mock-up model_check_report.html replaces the MEP tab (§ALTC_V3,
  §MC_MOCKUP) · #1884 no interior room probe on roads + status box Chainage row (§GHOST_PROBE — did NOT remove the sky ghost) · #1885 day counter
  epoch (§S4_RAW_EPOCH, 20,791 → 60 days) · #1886 partner files import as GEOTECH / GABION / CHAINAGE / ROW (§PARTNER_DISCS D1/D4/D5/D8).

## §SPECS — shipped 2026-10-06 (full text at bim-compiler `2278f7df5`; witnesses named in each PR)
| spec | one line |
|---|---|
| §GLOW_DAY | civil lamp glow follows the one daylight flag A._stillWindowGlowOff; soft round dot |
| §REVEAL_SHELL | A.cpeRevealShellDiscs() = ARC+STR (+ROAD on civil) — one owner for what the reveal hides |
| §ALTC_V2 | road film: seed reversed to end at the 5-head junction, orbit pivot = that junction (r 67.5 m), build-up by min(drive mid, 0.5), parade in the drive |
| §ALTC_PANELS | road cards in the build-up drive on the quietest times (plan.walkBusy = the noise law's own probes); model data only |
| §CHAINAGE_V2 | level = chainage section by START along the drive (drawn box, owner A._loadPathInstanceWorldBox); civil trades chain inside a section |
| §ALTC_LABELS | road films: rule-findings film VACUOUS, "Site Envelope", clash tags by SEQUENCE_CIVIL trade |
| §ALTC_CHECKS | road_check.js rows as worked formulas; road_rules.json film_status = the VALID/SPECULATIVE tracking list |
| §ALTC_V3 | build-up by pieces completed; no load-path freeze; approach ≤ 280 m of seconds; grass ground; MEP button → Model Check |
| §GHOST_PROBE | civil models skip the interior room probe; Chainage row via A.civilChainageAt |
| §S4_RAW_EPOCH | reused raw schedule rigid-shifted onto baseMs when epoch-relative |

### §PARTNER_DISCS — the BIM partner's new files defined as civil disciplines (spec 2026-10-06; user: "analyse and define them as new disciplines … proceed here, except for 5 which I will merge manually")
**Measured** (IfcOpenShell 0.8.4 on `~/Downloads/JELAPANG IFC.zip`, world-coordinate geometry; all IFC2X3, every object
IfcBuildingElementProxy, all inside the same corridor x 27,345–29,883 / y −24,670…−22,662 as the road). The partner's own package code is
in each file's IfcBuilding name: 02EW = earthworks, 03RD = road, 04DR = drainage.
| file (IfcBuilding name) | objects | what it is (from its psets) | new code |
|---|---|---|---|
| GEOTECH (C3D24_WIP_F0_**02EW**_GEOTECH JELAPANG SOLID) | 9,145 | ground treatment: 7,575 driven piles under the embankment (350 mm, 18 m, 750 kN, 1.9 m c/c, embankment 5 m), 1,338 soil nails (12 m @ 1.5 m with erosion mat), 228 horizontal drains (12 m @ 3 m), 4 RC retaining walls | GEOTECH |
| EARTHWORK ("Earthwortk without road SOLID") | 1 solid, z 31–90 | the earthworks body with the road cut out (the old file was empty) | EARTHWORK (exists) |
| GABION MATTRESS | 11 | 01_Component_Name "GABION MATRESS", 14_Dimension "300mm THK." — slope / scour protection | GABION |
| CHAINAGE (…**03RD**_CHAINAGE SOLID) | 332 | 3D chainage labels (solids 1.0 m thick, ~5 m across), no psets — setting-out reference, not construction | CHAINAGE |
| ROW (…**03RD**_ROW JELAPANG SOLID) | 1 | corridor "ROW", baseline "ROW Jelapang", station 0+000–7+003, BasicCurb shape — right-of-way boundary | ROW |
| ROAD LIGHTING | 216 | re-export, same psets as the loaded one | LIGHTING (exists) |
**Rules (civil only — every list below is read only for civil codes; NON-IMPACT on buildings):**
- D1 import (import_worker.js CIVIL_DISCS): + GEOTECH, GABION, CHAINAGE, ROW (file-name word match, as for the road set).
- D2 build order (rates.js SEQUENCE_CIVIL; sequence = cpm phase rank ≤ 7, equal = parallel):
  1 Setting Out (CHAINAGE, ROW) · 2 Ground Treatment (GEOTECH) · 3 Earthworks · 4 Drainage + Slope Protection (GABION) · 5 Pavement ·
  6 Road Furniture + Signage + Road Lighting · 7 Road Marking. Source: physical precedence (piles before the embankment they carry,
  earthworks before drains cut into them, pavement before finishing) — same JKR road-works order as §Q, with the two new front phases.
- D3 cpm E3-civil chains by SEQUENCE GROUP (all phases of group k complete → every phase of group k+1); equal sequences no longer chain
  each other (before: phases were chained one after another in sort order, so equal sequences would have been serialised).
- D4 crews (LABOR_RATES, uncalibrated, copied from MASON like the other civil trades): CIVIL_SURVEY, CIVIL_GEOTECH, CIVIL_GABION.
- D5 5D (CIVIL_RATES, rate null pending the JKR SoR): GEOTECH (EA), GABION (M2); CHAINAGE / ROW = "setting-out reference, not priced"
  (so they never fall back to the building class rate "Misc Element").
- D6 4D template (rates/4D_template_civil.json → v0.4.0): phases setting_out, ground_treatment, slope_protection added; logic
  setting_out → ground_treatment → earthworks → drainage + slope_protection → pavement → finishing.
- D7 clash (clash_rules.json, family civil): + GEOTECH vs DRAINAGE (piles / soil nails / horizontal drains against drains). CHAINAGE and
  ROW get no rule (references, never clash).
- D8 colours (rates.js + import.js DISC_COLORS, presentation only).
**Witness** witness_civil_partner_discs.js (node, no browser): every partner file name → its code; SEQUENCE_CIVIL order constraints
(setting out < ground treatment < earthworks < drainage = gabion < pavement < finishing < marking, all ≤ 7); template phases + logic acyclic
and every civil phase has a template phase; CIVIL_RATES covers every civil code; cpm graph on synthetic civil items: E3 edges only from
group k to group k+1, none inside a group; a building item set builds the identical edge list before/after. Fleet: cache_4d_run 4 buildings.
**Status 2026-10-06:** D1/D4/D5/D8 SHIPPED (#1886, witness_civil_partner_import 3/3, main 1/3). D2/D3/D6/D7 HELD on `feat/civil-partner-discs`
(witness_civil_partner_discs 8/8 there, but the browser chainage witness regressed: cell path, lamps before pavement 92).

### §MERGED_DB — the user's merge of the partner files, measured 2026-10-06
`~/Downloads/JALAN JELAPANG IFC/Merged.db` (525 MB, saved 03:29). SQL read-only + one headless load on bim-ootb main `dfb47486`
(probe + logs: bim-compiler session scratchpad `merged_probe.js`, `merged_probe{,3}.log`, GPU=sw).
- **DB complete.** 19,903 elements = JELAPANG 15,164 (road 5,674 + GEOTECH 9,145, CHAINAGE 332, GABION 11, EARTHWORK 1, ROW 1)
  + Jelapang VBC 4,739 (ARC 826, PLB 2,062, STR 1,851). Every element: transform, non-zero bbox, instance, geometry. Same
  corridor coordinates as the road. LIGHTING still 227 (the 216-element re-export was NOT swapped in). Earlier DBs
  (JELAPANG.db, JELAPANG_AFTER.db): 10,413 elements, 0 missing boxes → the earlier merge stripped nothing.
- **Viewer draws all of it.** `§MERGE_CONTRACT buildings=2 rendered={VBC 4739, JELAPANG 15164} verdict=COMPLETE`; every discipline
  db = registered = visible (scene graph). `§DLOD_ENABLE count=19903`. User correction: they DO show on canvas — the gap is the
  **Find panel**. User's live tree summed to 10,413 (Unknown 5,763 = pre-merge); a fresh open of Merged.db gives `§FIND_TREE` Unknown
  15,253 = all 19,903. Cause (code): the only Find refresh after a merge is `streaming.js:2345` (§MERGE_CONTRACT COMPLETE, after a NEW
  building streams). The partner files fold into the EXISTING building name `JELAPANG` → `scene.js` §MERGE_SPLIT_CENTRES `added=[]`
  → no stream, no refresh → an open Find panel keeps the pre-merge tree. Fix shape: refresh Find at the end of every fold
  (`_mergeDbIntoScene` / `_mergeSplitDbIntoScene`), not only on new-building stream complete.
- **Bbox view (Alt+Z / Find lens) = 587 boxes, all ARC** (`§SHELL_GHOST_BBOX boxes=587 discs=1`). Cause = `navigate_find.js`
  `_isEnvelope` (Wall|Slab|Roof|CurtainWall|Covering|Plate): VBC's STR/PLB and every civil element (all IfcBuildingElementProxy)
  are skipped; the all-elements fallback needs envelope < 2 % AND < 200 (here 587/19,903 = 2.9 %). Same on the old DBs (587/10,413)
  → not caused by the merge. Fix shape (spec, not built): decide envelope-vs-all PER BUILDING — a civil building (0 envelope
  elements) boxes all its elements. Gate: buildings with envelope ≥ 2 % unchanged → fleet identical.
  **ORDER-INDEPENDENCE (user 2026-10-06: "does it matter? Users may do any ways above"):** #1889 decided per BUILDING NAME, so a
  one-shot import (road + bridge under one name) still gave the road 0 boxes while two drops gave 15,751. Rule v2: the group is
  "civil" for every element in a SEQUENCE_CIVIL discipline, else its building — the same boxes whatever the drop order. Witness:
  Merged.db and a one-building copy of it (every row building='JELAPANG') must draw the same count.
- **Ground moved down 18.8 m.** `§GROUND_CIVIL civilRows=5675 → p2-bottom over all elements` → `§GROUND_Y z=32.90` (was 51.74 after
  #1849): the p2 of bottoms now lands on pile/earthworks bottoms. **User rule 2026-10-06:** *"our new ground level will be using the
  new one. Old is default in lieu of such ground terrain IFC"* → when an EARTHWORK terrain solid is present, the ground comes from
  it; the p2-bottom rule stays the default only when there is none. ⛔ Open: flat plane at which earthworks height, or hide the flat
  plane and let the earthworks solid be the ground (user's look ruling).
  Same shape as chainage: no EARTHWORK terrain → today's p2-bottom ground, unchanged (JELAPANG_AFTER.db plane stays 43.46 m, measured).

### §CIVIL_REF_LOOK — earthworks see-through, ROW outline, ground under the earthworks (spec 2026-10-06; user: "Earthworks, can it be a soft or outline bbxes or of diff colouring so not to obscure the main hiway?" → "yes go ahead with that look")
Measured (Merged.db, mesh vertices, rotation 0 on both): EARTHWORK true z 30.52–90.44 (naive center−bbox/2 = 29.46 — §W.2 centroid
offset, 1.06 m); ROW true z 1.00–77.76. Both cover the road + GEOTECH when drawn opaque.
- L1 EARTHWORK material: earth colour `DISC_COLORS.EARTHWORK` #8b6b3e (rates.js, already the discipline colour), opacity 0.28,
  depthWrite off, DoubleSide; `userData.origOpacity` = 0.28 so X-ray/restore returns to it. Owner: streaming.js `_getMaterial`.
- L2 ROW: the solid hidden; its outline drawn as edges (EdgesGeometry, crease 30°) in the ROW colour, built once from the mesh
  when the ROW element streams. Picking: ROW is a reference, not built work.
- G1 ground (§GROUND_CIVIL): a model with EARTHWORK geometry → plane z = lowest TRUE earthworks vertex (center_z + local min z,
  from component_geometries; only when rotation_x/y = 0, else the old rule) → `§GROUND_Y src=earthwork-bottom`. No EARTHWORK
  geometry → today's p2-bottom rule, byte-identical (JELAPANG_AFTER.db stays 43.46 m — measured; 51.74 was the road-only value).
- Gate: discipline EARTHWORK / ROW only (CIVIL_DISCS). Fleet buildings have 0 such rows → no material, ground or edge change.
**Witness** `witness_civil_ref_look.js`: Merged.db → EARTHWORK materials transparent at 0.28 + depthWrite false; ROW mesh hidden
and an edge line present with > 0 segments; `§GROUND_Y src=earthwork-bottom z=30.52`. JELAPANG_AFTER.db → `src=p2-bottom z=43.46`
(backward compat). RED control: same witness on main must fail L1/L2/G1.

**§MIXED_PROGRAMME status 2026-10-06:** BUILT — bim-ootb PR #1890 (sw v1581, auto-merge). witness_civil_mixed_programme GREEN 6/6 on
Merged.db: makespan 163 d (24/7 calendar) — GT 0→102 (9,145 el), EW 102→103 (1 el — count-based crew rate, NOT a real earthworks
duration: needs volume m³ + an earthworks output rate), drainage+gabion 103→106, pavement 106→151, finishing 151→163, bridge 102→135.
Fleet cache_4d_run identical. **⛔ PLAYED-LAYER GAP (pre-existing, main identical):** `tmGenerateTimeline` on a DB with no stored
tasks (Merged.db: tasks=0) plays the CPM display only — `§TM_REVEAL_TILED skip reason=no dated task windows (_cap null)`, no
`§TPL_MODEL`, `§CELL_GATE path=CELL` (civil e3 chain not enforced there) → witness_civil_chainage_buildup 0/3 (branch: lamps
before own-section pavement 83/227, 16 lamps in first 2 %). The template programme reaches the scrubber/film only after the
Gantt has materialised tasks. Next: decide the owner that guarantees tasks exist before the played layer is built (§I row
"where inside its bar does it PLAY").

**§CIVIL_GRAPH_GATE (spec 2026-10-06) — cause of the played-layer lamps-before-pavement, MEASURED:** Merged.db `§CELL_GATE repr=99.99%
path=CELL` (JELAPANG_AFTER.db went GRAPH: the partner's 9,145 tightly-contacting ground-treatment pieces lifted representability over
the 0.88 mark). The CELL path files by `LocationAxis` HEIGHT levels (LevelDeriver grid): played-layer probe — LIGHTING cells at levels
0, 5–7, 22–25 vs ROAD 24–31 → lamps in lower height levels are placed before the pavement; EARTHWORK at day 0 alongside GEOTECH.
The road's location is its CHAINAGE section (`lvlSec`, §CHAINAGE_LEVELS), which only the GRAPH path reads (E3-civil + E4 line of
balance, witness 0 lamps before own pavement on JELAPANG_AFTER.db). Rule: `CpmSchedule.run` routes to GRAPH when any item carries a
chainage section (`lvlSec` is a number) — `§CELL_GATE … path=GRAPH reason=chainage`. Gate = civil data only (no building item has
lvlSec) → fleet unchanged. Not an order rule: it picks the path that models the road's location axis.

### §MERGE_PSETS — Open→Merge drops every property (MEASURED 2026-10-06)
Merged.db has 0 `element_psets` rows for GEOTECH / GABION / CHAINAGE / ROW. A fresh import on main DOES store them
(`§CIVIL_PSETS file=JELAPANG_GABION MATTRESS.ifc … values=143`). Cause: `scene.js A._MERGE_META_TABLES` (the fold whitelist) lacks
`element_psets`, so a merge carries meta/transforms/instances/geometry but no properties → drainage sizes, JKR sign codes and the
partner's pile data vanish from any merged model (cards, Model Check, Fly route labels read them). `element_psets` has NO unique
key (guid, pset, name, value — import_db_builder.js:193), so the fold's INSERT OR IGNORE cannot dedupe a re-merge. Rule: fold
`element_psets` rows only for guids NEW to the live DB (the §MERGE_FOLD_TOPUP `A._mergeNewGuids` set, computed before the fold).
Witness `witness_merge_psets.js`: live = JELAPANG_AFTER.db minus its SIGNAGE elements, src = the SIGNAGE elements + psets (real rows)
→ first merge adds every SIGNAGE pset row; a second merge of the same src adds 0. RED on main (0 rows folded).

### §ALTC_GROUND_CARDS — Alt+C cards for the partner's ground works (spec 2026-10-06, queue item d)
Data (JELAPANG_GEOTECH.ifc, instance psets): `15_Name` PILE EMBANKMENT 7,575 (20_PILE_DIAMETER 350mm · 22_DRIVEN_LENGTH 18m ·
21_PILE_WORKING_LOAD 750kN · 23_PILE_SPACING 1.9m c/c) · SOIL NAILING 1,338 (17_Length "12m SOIL NAILING WITH EROSION MAT AT 1.5m c/c") ·
HORIZONTAL DRAIN 228 (17_Length "12m HORIZONTAL DRAIN AT 3m c/c") · 4 RC walls (CorridorName RC WALL, no 15_Name).
- G1 new card kind `ground` (cpe_road_panels.js, same shape as drainage/signs): GEOTECH + GABION elements of the stretch, grouped by
  `15_Name` (value = element count; sub = 22_DRIVEN_LENGTH or 17_Length, text from the file). No psets (a model merged before #1891)
  → one row per discipline with its count. No GEOTECH/GABION in the stretch → no card. Joins the KIND_ORDER rotation.
- G2 `planned` card: the "Terrain profile — planned — no earthwork surface in this model" row is now false when an EARTHWORK body
  exists → that row becomes "Earthworks body (solids) = N" from the DB; models without one keep the planned row.
- G3 (user 2026-10-06: *"can our card then give user a report card? Ie saying what is missing? or an o/s card in red title banner"*):
  card kind `outstanding`, shown ONCE per film, RED title banner "Outstanding — not in this model yet". Rows, each a count (no prose
  claim), only rows > 0: (a) civil pieces with no properties = civil-discipline elements with 0 element_psets rows; (b) disciplines
  with no rate = civil disciplines present whose CIVIL_RATES.rate is null (5D shows quantities, no RM); (c) disciplines measured by
  count, not their unit = present civil disciplines whose CIVIL_RATES.measure is a quantity unit (M, M2, M3) but qtyBasis 'EA'
  (earthworks timed as 1 piece). All rows 0 → no card.
- Gate: GEOTECH / GABION / EARTHWORK rows only — JELAPANG_AFTER.db cards unchanged except none (no such rows); buildings build no cards.
- Witness: witness_road_panels.js — every `outstanding` number = its own SQL/rates count; every number on a `ground` card = COUNT(DISTINCT guid) with that 15_Name (or discipline) over the
  card's guids; the earthworks row = COUNT of EARTHWORK rows. Fixture with psets: Merged.db + the GEOTECH/GABION instance psets read
  from the partner IFCs (IfcOpenShell, same rule as import_worker §CIVIL_PSETS) — what a re-merge after #1891 would store.

### §WORLDBOX_DLOD — the drawn-box owner reads a DLOD-culled (zeroed) matrix (MEASURED 2026-10-06)
`cpe_load_path.js _sourceInstance` (owner behind `A._loadPathInstanceWorldBox`) reads the LIVE instance matrix. DLOD culls an
off-screen InstancedMesh slot by writing a zero-scale matrix (dlod.js:221) and keeps the real one in `_instanceMeta[..]._origMatrix`.
Merged.db: 25 lamp columns read scale 0 → a (0,0,0) box → §CHAINAGE_V2 filed them by centroid (the code's own miss rule) and the
chainage witness (before its guard) put them at the origin's route index. Same read places Load Path member clones (cpe_load_path.js
:487) → a culled hop clones at zero scale. Ruled out: BatchedMesh `getBoundingBoxAt(slot)` vs geometry id — measured 7,911/7,911
slot == geometry id on Merged.db. Fix: when the slot is `_dlodHid` with an `_origMatrix`, use `_origMatrix`. Witness: zero-box
lamps 25 → 0 on Merged.db; chainage witness stays 3/3; `§CHAINAGE_LEVELS fromDrawnBox` rises by the recovered slots.

### §DOCTRINE_AUDIT — 2026-10-06 (user: "check that no doctrine or flow of work is broken … nothing new is invented to patch any gap")
Checked against 4D_MODEL_INTEGRITY.md §B (layers: CLASSIFY = lookup, DECLARE = 4D_template*.json, SOLVE must never discover order).
- ✅ #1887 look/ground: extends the ground owner `tools.js _calcGroundY` (no second ground); height from the mesh. Opacity 0.28 is a
  presentation value (Prime Rule scope = data). ✅ merge top-up: extends the existing merge drain + `streamBuilding`, no rival.
  ✅ bbox per building: extends `_buildMergedGhost`; civil list = `SEQUENCE_CIVIL` keys (the viewer's one civil list).
- ⛔ HELD `feat/civil-partner-discs` must change before it ships:
  1. D3 edits `cpm_schedule.js` to chain phases by `SEQUENCE_CIVIL.sequence` → SOLVE deriving order from CLASSIFY = §B backflow, and a
     second order source beside `4D_template_civil.json` logic. Drop D3; declare the order ONLY in the template (D6).
  2. CHAINAGE / ROW as a "Setting Out" phase with a crew = scheduling work for labels/boundaries that are not built. Existing
     pattern: non-work is excluded from the schedule population (IfcSpace / IfcOpeningElement, schedule_author.js:483-490).
     Exclude them the same way; no CIVIL_SURVEY crew.
  3. CIVIL_SURVEY / CIVIL_GEOTECH / CIVIL_GABION crews "copied from MASON" are invented productivity (as the existing civil crews,
     already flagged uncalibrated). Per §L a default belongs in `std_values` with source + SUGGESTED label; GEOTECH quantity can be
     EXTRACTED from psets (pile length 18 m, spacing) rather than EA.
- ⛔ FOUND: `time_machine.js:4518 _allCivil` uses the civil template only when EVERY element is civil. Merged.db (road + bridge
  4,739) → the BUILDING template schedules the whole road, so no civil order (current or §PARTNER_DISCS) reaches the merged model
  (same root as witness_civil_phase FAIL on road+bridge). Needs a design: template chosen per element group by discipline (civil
  disciplines → civil programme, the rest → building programme), one owner. Not built; needs the user's ruling on how the two
  programmes join (bridge before/after/alongside the road phases).

### §MIXED_PROGRAMME — road + bridge in one 4D programme (spec 2026-10-06; user ruling: "alongside — bridge built during earthworks and pavement")
Supersedes the held `feat/civil-partner-discs` D2/D3/D6 (doctrine audit above). Layers per 4D_MODEL_INTEGRITY.md §B / §I:
- **SELECT** (`time_machine.js _civilSwap`, the one owner): any civil row → `4D_template_civil.json`; no civil row → `4D_template.json`
  (unchanged, fleet 0 civil rows). Today: civil only when EVERY element is civil → Merged.db / JELAPANG_AFTER.db get the building template.
- **DECLARE** (`4D_template_civil.json` v0.4.0, the only place order lives): civil phases ground_treatment → earthworks → drainage +
  slope_protection → pavement → furniture / signage / lighting → marking, PLUS the structure phases copied verbatim from
  4D_template.json (substructure … finishes, their own within/across-level edges). Alongside: `substructure` takes the SAME
  predecessor as `earthworks` (ground_treatment), so the bridge starts with the earthworks and runs through pavement in parallel.
  Engine fact (schedule_author.js:806-900): placement = predecessor FINISH + lag, one within_level predecessor per phase — FS only,
  so "alongside" is declared as a shared predecessor, not SS/FF (no engine change).
- **CLASSIFY** (rates.js, lookup only): SEQUENCE_CIVIL gains GEOTECH → Ground Treatment, GABION → Slope Protection (phase names only).
  No solver edit (D3 dropped). Crews for the new phases: none invented — ⛔ needs a cited labour source (§L); until then the phase
  uses the existing uncalibrated civil crew of the nearest trade, labelled as such, or is left unpriced (user's call).
- **POPULATION:** CHAINAGE / ROW are references, not built → excluded from the schedule like IfcSpace / IfcOpeningElement. The
  exclusion is written inline in 7 places today (schedule_author.js:490/1895, time_machine.js:3972/4446/4525/5056/10129) → ONE owner
  function first (deletes the 7 copies), then the two disciplines added there once.
**Witness:** Merged.db → §CIVIL_TEMPLATE loaded; GEOTECH bars before EARTHWORK; substructure start = earthworks start (shared
predecessor); lamps before pavement = 0; CHAINAGE/ROW in no task. JELAPANG_AFTER.db → civil template now (expected change);
all-civil road-only DB → identical to before (structure phases empty, bridged). Fleet: cache_4d_run 4 buildings identical.

## §OPEN — known issues not yet worked (each needs its own spec first)
- **§W.2 centroid vs box — MEASURED 2026-10-05: LIVE BUG in the clash broad phase, buildings too.**
  `measure.js:164` builds `elements_rtree` from `center ± bbox/2`; `center` is the vertex centroid. Probes
  `prompts/civil_probes/centroid_probe2.py` + `missed_pairs.py` (logs beside them), true box = center + R_z(local min/max),
  rotation convention checked against the renderer (`streaming.js:2548` rotation.set(rotX, rotZ, −rotY) = CCW about IFC Z).
  - Cause is ONLY the shift: stored bbox size = mesh size exactly (0 elements > 1 cm) on JELAPANG, Duplex, Hospital.
  - Elements whose true box sticks out of the index box > 1 cm / > 1 m: JELAPANG 2,218 / 1,304 (max 147 m, curved road
    pieces) · Duplex 317 / 8 (max 3.1 m) · Hospital 21,656 / 265 (max 31 m). Terminal, LTU: NOT measured (`_geo.db`
    hashes match 0 `element_instances` rows — different storage, needs its own read).
  - Probe index-box pair counts = shipped §V.2 counts exactly (23,288 / 1,040 / 385 / 253 / 12) → probe reproduces the
    shipped broad phase. **Candidate pairs the broad phase never hands to narrowphase (true boxes overlap, index boxes
    don't), tol 0, no ignore-classes:** JELAPANG 2,696 (DRAINAGE×ROAD 2,388) · Hospital ARC×STR 3,119 · ARC×MEP 1,587 ·
    MEP×FP 88 · STR×ELEC 62 of 93 · STR×MEP 15 · STR×PLB 15 · STR×FP 4 · Duplex ARC×MEP 220 · ARC×STR 31. Plus as many
    "phantom" pairs (index overlap, true apart) — those are only wasted narrowphase work.
  - A missed CANDIDATE is not yet a missed CLASH — narrowphase on the missed pairs gives that number (fix witness).
  - §V.3's mesh-true civil counts went through the same broad phase → they are under-counts too.
  - Fix shape (proposal, not built): build the rtree from center + per-geometry local min/max (geometry bounding box
    already computed per hash in the viewer) — no DB change. Changes every building's clash candidates → fleet before/after
    table (candidates, mesh-true clashes) required. Also: `§GROUND_ROBUST`/`§GROUND_Y` bottoms, tour.js road heights.
- **§LOAD — slow canvas load, large MB / low element count (user 2026-10-05). MEASURED on JELAPANG_AFTER.db.**
  Bytes: component_geometries 605 of 661 MB; 22.0M vertices / 8.5M triangles for 10,413 elements. LIGHTING 227 poles =
  204 MB / 7.57M verts (~33k verts, ~12k tris per pole); bridge STR 186 MB; ROAD 109 MB. Normals stored per vertex.
  "Consolidate redundant draws" measured: exact (position+normal) weld 22.0M → 18.3M verts (−16 %; ROAD −46 %, MARKING −41 %,
  LIGHTING −2 %, STR −6 %); same shape stored per location (translation-only duplicates): LIGHTING 200 → 162, ROAD 3750 → 3707
  → instancing gains ~nothing. The poles are flat-shaded facet soup (dup ratio 4.8 vs unique positions) — only a crease-angle
  smooth + weld would cut them (lossless for position, changes normals) — needs spec + look ruling.
  Headless timing (GPU=sw; per-frame times inflated, CPU steps real): DB open 3.4 s · `§SURFACE_ROOF_LAYER` 10.1 s (user's real
  log 17.0 s) · `§MEP_SMOOTH_NORMALS` 4.3 s over 10.9M verts · `§DUCT_SILHOUETTE` +4.0M verts (BUDGET_HIT) · both buildings
  COMPLETE 46.6 s · `§KRN_PERSIST` rewrites the whole 646 MB DB after BUILDING_OPEN.
  ✅ ROOF LAYER FIXED — bim-ootb PR #1867: over a 2M-cell budget (fleet max 381,732, JELAPANG 13.4M) judge only envelope classes
  via 16 m buckets; `witness_roof_layer_budget.js` diff=0 on 11 fleet DBs + JELAPANG; 10,140 ms → 33 ms; COMPLETE 36.5 s.
  Open (not worked): which elements `§MEP_SMOOTH`/`§DUCT_SILHOUETTE` take on a civil model (prewarm for Alt+S, runs at load) ·
  KRN_PERSIST full rewrite per op on a 646 MB DB (save/reload efficiency, user asked) · URL loads > 400 MB skip the IDB cache
  (`§CACHE_WRITE_SKIP_TOO_LARGE`) → every reload re-downloads.
- **§CULL_SPHERE (found 2026-10-05, not fixed):** `dlod.js:77-81` culls each instance by a sphere at the instance ORIGIN (vertex
  centroid) with radius = half the bbox diagonal. On JELAPANG_AFTER the true mesh extends > 1 m outside that sphere for 1,173
  elements (ROAD 771, LIGHTING 171, DRAINAGE 122, MARKING 57, ARC 34, FURNITURE 18; worst 167.8 m) → hidden while on screen
  once DLOD engages (≥ 5000 streamed; JELAPANG alone 5674, merged 10,413 `§DLOD_ENABLE`). Same §W.2 class. Fix shape: per
  InstancedMesh, `geometry.boundingSphere` (shared by its instances) transformed by the instance matrix — exact, cheaper.
  Fleet before/after table (hidden counts) required.
- **§NL night look on km roads (user 2026-10-05: "luminosity realistic … lamps really shine out and reflected on surface …
  Alt+C late evening with lamps on … special treatment for outdoor CW roads"; "distance proximity … elements hidden when
  pressing Night").** MEASURED in code (tools.js): nav lights = 30 nearest of 223 heads (`_nightMaxLightsNav`), Alt+S 50;
  point light intensity 2.0, decay 1, range ∞ (indoor-tuned, ~0.2 at 10 m); moon sun 0.15 / ambient 0.2 / hemi 0.08,
  exposure 0.8; night fog colour (0.03,0.03,0.09) at the site-sized density 0.00026 → ~49 % fog at the 3,171 m framing
  distance. → everything beyond the 30 lamps is unlit and fogs to black = "hidden".
  User 2026-10-05 (live, after ground report): "distance reflection on the shiny road, but no street lamps get lighted" —
  consistent with the numbers above: moon/env specular reads at distance; 30 indoor-strength point lights 10+ m up give
  ~0.2 at the road, and no head glows (§GLOW_LAYERS_OFF removed the sprite).
  ✅ STEP 1 SHIPPED bim-ootb PR #1869 (user go 2026-10-05 "still no change in Night lighting"): §CIVIL_LAMP_THROW head
  intensity × mountH/3 (median ×4.63, max ×11.14) + §CIVIL_LAMP_GLOW 6 px Points on all 223 heads; witness 15/15.
  Still open from the proposal: (b) pools for heads beyond the 30 nearest, (d) Alt+C dusk (user go 2026-10-05: "proceed to alt-c
  for hiway mode"). (c) STRUCK — user 2026-10-05: "hidden in Night is due to the raised ground. Fog is OK" (fog = existing
  §U FogExp2, Night only recolours it; JELAPANG 1.7 % at 500 m … 50 % at the 3.2 km framing distance).
  #1868 CI lesson: a bare cross-file global (SEQUENCE_CIVIL) fails the no-undef gate — read it via window.
  Proposal (original, civil gate) (all elements ∈ CIVIL_DISCS, envelope > 1 km).
  (a) every lamp head reads at any distance: emissive head glow from the head list (no light cost);
  (b) light POOL on the road under every head: downward spot (cone) for the nearest N, a cheap ground pool for the rest —
      street lighting is a pool on the carriageway, not an omni bulb;
  (c) night fog density from the camera's view distance, not the whole site, and a moonlit sky colour that is not black;
  (d) Alt+C "late evening": sun just below horizon (dusk sky), lamps on — reuses (a)–(c).
  Witness: per-lamp pool luminance on the road surface below each head vs between heads (numbers from a render target
  readback at the head's projected pixel), lit-head count at the overview, fleet night unchanged (gate false).
- **Narrowphase defect (pre-existing, not civil):** synthetic S7b (cubes face to face, OBB off) → CLASH, expected
  CLEAR (`witness_clash_mesh_narrowphase.js` I5). Also I3 (2 of 23,001 at the 1 mm touch edge) and I4 (3.0e-5 m
  DB-vs-scene matrix = float32 at 2 km, limit 1e-5 too tight).
- **light_zones grid (latent):** uncapped 0.5 m grid (`light_zones.js:343`) would be ~2.8e9 cells / 5.5 GB at
  JELAPANG extent. Not hit today (no boundary geometry → `§LIGHT_ZONE VACUOUS`) — will hit any civil model that
  carries IfcSlab/IfcWall.
- **P3 near plane:** fixed `near=0.1 m` (`scene.js:154`). Not changed — measure on the real-size road first; a
  change hits every building, walk, CPE (`cinema_path_editor.js:1862`), film → needs a fleet table.
- **Zoom-to-cursor (§I.1):** `controls.zoomToCursor = true` (supported by shipped OrbitControls). Changes zoom on
  every model → ⛔ user: all models, or only large envelopes?
- **Hub duplicate discipline list:** `import_own.js:8-24` has its own 12-code list and overwrites the worker's
  discipline (`:368-372`) → civil works in the viewer but not from the hub. Fix = delete hub copy, move its alias
  table into the worker. Changes hub imports → needs review.
- **5D quantities are counts:** ROAD/MARKING/DRAINAGE need m² / m from the mesh; rates all `pending`.
- Not yet read on JELAPANG by `§`-line: walk/fly speeds, DLOD metre thresholds, measure snapping.

---

## §R Civil rate sources (5D)
- **Primary target: JKR "Jadual Kadar Kerja Kejuruteraan Awam dan Bangunan" 2023** (Schedule of Rates) — RM 20
  from the Ministry of Works procurement unit. JELAPANG's psets are JKR DAK templates → it is a JKR project.
  ⛔ purchased document. Pack file `rates/jkr_sor2023_my_civil.json` ships with `rate:null, status:'pending'`.
- **CIDB N3C** (n3c.cidb.gov.my): material / wage / machinery INPUTS, behind login + paid plan. Usable to build up
  a rate or calibrate crew wages, not to price a road m² directly. ⛔ subscription = user decision.
- **Free, official, state-level — label `regional-official`, cite item no. + page, never present as JKR national:**
  - §R.3 Selangor tender "JKH Perabot Jalan" (2023-09, 38 pp) → signs RM 800–870/Nos, signal-ahead RM 900/990,
    chevrons, thermoplastic marking per Set. Saved `…/JALAN JELAPANG IFC/rates/Selangor_tender_JKH_Perabot_Jalan_2023-09.pdf` (+ .txt).
    URL: https://tender.selangor.my/uploads/eLDSCJ35WfyBH4nMaIK1wCyVVWWVWJexzXTx1xrV/7.%20JKH%20PERABOT%20JLN.pdf
  - §R.4 DBKL "Jadual Kadar Harga No. 1: Roadworks" (2026-01, 12 pp) → excavation RM 7.00/m², crusher run 225 mm
    RM 19.24/m², ACB28 50 mm RM 27.00/m², AC 40 mm RM 28.00/m², road marking (4-1). Saved
    `…/rates/DBKL_JKH1_Roadworks_resurfacing.pdf` (+ .txt). URL: https://eperolehan.dbkl.gov.my/download/7FFDB0A7-5404-4545-B9C4-C6082F6B8C14
  - Also found, not saved: Kedah premix (https://idaftar.kedah.gov.my/upload/Dokumen%20Meja-509-1395.pdf), Penang
    JKR 2025 (https://ep.penang.gov.my/Dokumen_meja/30715/tender_5-%20RINGKASAN%20SEBUTHARTGA%2007.pdf).
  - Coverage: ROAD m² + MARKING (DBKL), SIGNAGE (Selangor). **No free source for drains or lamps.**
  - Next: map pset `16_Name`/`17_Code` → Selangor items. Selangor/KL ≠ Perak (JELAPANG) — flag it.
- Witness rule (§R.2): 5D total = priced items only; unpriced count reported; all unpriced → INCONCLUSIVE, never RM 0.

## §L Default standards pack — the rule for suggested values
A value from a **published standard, cited to clause** is extraction, allowed on four conditions: lives in a
`std_values` table (quantity, value, unit, standard, edition, clause, source-status) never a JS constant ·
source-status `primary` / `secondary` / `user` shown in output · designer data always wins · anything computed
from a default is labelled **SUGGESTED (per <standard> <clause>)** in its own colour.
- **Lighting:** MS 825 (Part 4:2012 classes, Part 5 calculation; drafts of 4 & 5 public-comment Nov–Dec 2025,
  jsm.gov.my) — paywalled. EN 13201-2 M-classes `secondary`: M1 2.00 cd/m² U0 0.40 Ul 0.70 · M2 1.50/0.40/0.70 ·
  M3 1.00/0.40/0.60. A lux check needs IES files.
- **Drainage:** MSMA 2nd Ed. (DID/JPS) rational method Q = C·i·A/360, C from Table 2.5, i from IDF (Perak/Ipoh
  station). Manning n ≈ 0.012 RCP `secondary`. Standard size list must come from a cited source.
- First step: obtain MS 825-4 + MSMA Table 2.5 + IDF → `primary`.
- Sources: jsm.gov.my Draft MS 825-4 PC · performanceinlighting.com/au/en/en-13201-2-2015 · MSMA (verify vs DID original).

---

## Reference — research and design not yet built (still valid)

### §C Site profile (design, not built)
Buildings organise on Z (storeys); a road on **chainage** (distance along route). Derive a profile once at load:
`envelope` (exists, `streaming.js:3891`) · `shape` building/linear/campus · `primaryAxis` storey or chainage `s` ·
`typicalElement` (median bbox) · discipline. Log-only first (`§SITE_PROFILE`, read by nothing) → add a row to
`4D_MODEL_INTEGRITY.md` §I. Then consumers adopt `s` one by one: 4D by chainage band, section box as chainage
window, "go to km", fly along centreline. Deriving a clean centreline from solids was UNSTABLE (2,816/3,126/3,583 m
at 100/50/25 m bins, all ROAD); MAINLINE-only is usable for a camera path, not a measurement — the alignment
export is the real fix.
**§D Civil switch:** auto from `shape=linear`, user-overridable, named **"Civil"** not "CW" (CW = Cold Water in
JKR file names; code `CIV` already in `VALID_DISCS`).

### §E Industry features mapped to this data (✅ have · 🟡 derivable · ⛔ missing)
Chainage nav 🟡 · asset breakdown by pset ✅ · drive-through sign review 🟡 · linear 4D time-chainage chart 🟡 ·
cross-section square to road 🟡 · QTO per km 🟡 · clash ✅ (shipped) · sight-distance ⛔/🟡 · terrain/cut-fill ⛔ ·
basemap ⛔ (CRS) · IFC4.3 alignment import (future, if designer can re-export).
Sources: wiki.osarch.org IfcAlignment · TUM Open Infra Platform · Linear 4D (SeoulTech) · schedulereader.com/?p=20820 ·
FHWA RSA guidelines · Autodesk Civil 3D 2023/2024 IFC export help.

### §F Length limits
Civil 3D "10 km limit" — not confirmed; documented issue is float precision at large coordinates, practice is
4–5 km sections. **Ours:** coordinates fine to ~100 km (centres double; verts per-element-relative; float32 after
rebase: ±5 km → 0.49 mm, ±50 km → 3.9 mm). **Memory binds:** JELAPANG geometry 423.9 MB / 14.77 M verts / 5094
geometries; wasm32 4 GB ceiling (measured on KUL070). Estimate ~212 MB/km → ~8–9 km per browser import —
**estimate, not measured.** Ways past: offline extractor, per-section DBs, decimation.

### §G Where we can beat the field
Whole road in a browser link (PWA, offline) · one drop federates 7 files (works) · generated 4D by chainage ·
JKR DAK psets → ERP asset register · signed review trail (kernel-ops ledger) · drive-through film · no section splitting.

### §H Navisworks parity for a road
Orbit/viewpoints/measure/redline/clash: no gap expected. Gaps: **Walk** (`walk.js` snaps to storeys — road needs
gravity onto surface below, BVH exists), **Section** square to road, **TimeLiner** chainage axis, **Quantification**
per km, **Appearance** colour by pset. One new feature: **DRIVE** = walk + ground raycast + car eye height + km/h
(values cited from JKR Arahan Teknik / AASHTO) + auto-drive on centreline, staffage car mesh as avatar.

### §I.2 GPS site-walk
`walk.js` anchors on nearest door (none) → site centre ~1 km off; true north unknown; height snaps to storeys.
Fix 1: CRS code → exact projection (candidate Malaysian Cassini-Soldner state grid — unconfirmed). Fix 2 (no CRS):
two-tap anchor ≥ ~50 m apart. Height = shared "ground under point" with DRIVE. Witness: synthetic GPS track;
no georef → `§WALK_GPS INCONCLUSIVE`, never a silent wrong dot.

**§I.2 findings from the mobile walk mock-up (2026-10-06, `prompts/film_mobile_walk_mock.js`, ~/Videos/CivilWorks_mobile_walk_MOCKUP.mp4):**
the real walk mode RUNS on the road in a phone viewport (toggleWalkMode / advanceWalkStep, §WALK_BASELINE/§WALK_UNLOCK), BUT:
(1) on mobile `effects.js` is skipped (§EFFECTS_SKIP mobile) → `A.civilDriveRoute` undefined → civilRouteAt / civilCastZ / civilGotoChainage
return null on a real phone (the mock shimmed it from civilRoutePath() in-page only); (2) walk has NO ground follow — eye 1.71–2.24 m above
road over 5.4 m (57/75 frames > 0.5 m off 1.7), it rises along the view direction; no storey snap (nearest floor ≥ 12.9 m); (3) setWalkAnchor
picks a door (13 storeys cached) → camera at (−234.6, −3.6, 105.4), far off the route. GPS site-walk needs: route on mobile, ground-snap, route anchor.
Heap 2,477 MB in the phone-viewport run (desktop machine).

### §J Very long roads (100 km) — section streaming
DLOD today saves draw work, not memory (geometry "disposed never", `dlod_nav.js:475`, `:1397`). 100 km ≈ ~21 GB
(estimate). Design: chainage tiles (~1–2 km) · load near / proxy far / evict behind · per-tile origin · metadata
stays whole · extend existing DLOD (check whether `city.js` unloads — NOT checked). Swap without freeze: reuse
`§BBOX_EARLY`/`§PROGRESSIVE_FLUSH` coarse-first; prefetch along travel direction. Prereqs: centreline/chainage.
Test data: longer real set, or JELAPANG tiled into ~1 km pieces.

### §K Partner wish-list — feasibility
| # | Item | Fit | Needs |
|---|---|---|---|
| 1 | Vehicle sim / swept path through roundabout | 🟡 | vehicle dims from standard; centreline |
| 2 | Lighting lux heat map | ⛔→🟡 | IES + wattage; MS 825 target |
| 3 | Best route for new utilities | 🟡 | existing-utility data; ROW width (empty) |
| 4 | Traffic management 4D (EXISTING vs new lanes per phase) | ✅/🟡 | contractor phase plan; chainage |
| 5 | Drainage flow / capacity (Manning) | 🟡 | skipped pipes; roughness from standard |
| 6 | Road-standard rule check (lane widths, sign codes, clearances) | 🟡 | JKR Arahan Teknik clauses |
| 7 | Flood mitigation | ⛔ | display imported results only |
| 8 | Road runoff Q = C·i·A | 🟡 | MSMA IDF + C |
Combined win 5 + 8: runoff vs drain capacity → "drain under-sized" findings shown like clashes.
Order: 6 → 4 → 5+8 → 1 → 3 → 2 → 7.

### §K-6.1 Outside analyst proposal reviewed (2026-10-05) — road-standard checker, measured against JELAPANG_AFTER.db
Proposal: free JKR standards → `std_values` → colour non-compliant elements. Sources named (NOT yet read by us; the
analyst's citations were blank): ATJ 8/86 geometric design (lane/shoulder widths, grades, sight distance), ATJ 2A/85
signs (size per code), ATJ 2D/85 markings (stop line 300 mm, give-way 200 mm, zebra 600 mm), ATJ 13/87 drainage.
Measured (world-axis bbox, `element_transforms` + `element_psets`):
- **Lane width — not doable as proposed.** Road solids are not lanes: MAINLINE plan-min width avg 51.5 m (541 pieces),
  J2A 31.5 m, EXISTING LANE -J1B 17.8 m. Lane width needs a cross-section of the surface + lane lines (MARKING), not
  an element's own-axis width.
- **Markings — not per-line.** 90 MARKING elements, plan width 1.46 m → 698 m long, avg height 2.06 m: each is a
  group of strips. Stop-line / give-way widths need a mesh cross-section per strip.
- **Signs — doable but low yield.** Same code → identical height (WD. 39a ×23 all 3.73 m; WD. 24a ×15 all 1.51 m):
  standard Civil 3D blocks; bbox = post + face. Check = face size per code vs ATJ 2A/85 table, needs face split from post.
  Real value: validating the 17_Code against the ATJ sign list + post height / placement rules.
- Values must be read from the JKR PDFs ourselves before `primary`; `std_values` holds standards, rates stay in the
  rate pack (§R.2), not one table.
- Also seen: `01_Component_Name` = ROAD STUD ×940 (not in §0 list).
- **Standards obtained (2026-10-05), official JKR copies** — live host `epsmg.jkr.gov.my` does not resolve from
  outside Malaysia, fetched via Wayback (`id_` raw). Saved `~/Downloads/JALAN JELAPANG IFC/standards/` (+ `.txt` via pdftotext):
  - `ATJ_2A-85_Pindaan2019_StandardTrafficSigns.pdf` — ATJ 2A/85 (Pindaan 2019), 124 pp. Source
    http://epsmg.jkr.gov.my/images/8/81/ATJ_2A.85_P_2019-WM.pdf (snapshot 20250614112213). e.g. WD. 39a/39b chevron size table, txt L5399.
  - `ATJ_2D-85_original_RoadMarkingDelineation.pdf` — despite the file name, it is ATJ 2D/85 (Pindaan 2019), 79 pp. Source
    http://epsmg.jkr.gov.my/images/9/99/Atj_2d-ori_-_wm.pdf (snapshot 20260307083029). §3.3.2.1 stop line 300 mm (txt L1660), §3.3.2.2 give-way.
  - Also archived there, not downloaded: ATJ 2B/85 (Pindaan 2019) sign application (`images/6/6b/…`), **ATJ 8/86 geometric
    design** (`images/c/c9/BPIS_ATJ_8-86_19062020.pdf`, lane widths), ATJ 5/85, 4/85, 7/85.
  - Status label: `primary` (JKR's own document); values still to be transcribed into `std_values` with clause/table refs.

### §MC Model Check Report — road standards (user, 2026-10-05: "if it can produce similar to the MEP under 4D5D HTML
for buildings, we can replace the MEP tag with this") — SPEC
**Issue it fixes:** on a road model the 4D/5D page's **MEP** button opens a building MEP bill (empty/meaningless for a road);
there is no standards check of the road at all. Also obtained: ATJ 2B/85 (Pindaan 2019) sign application, 67 pp,
`standards/ATJ_2B-85_Pindaan2019_SignApplication.pdf` (Wayback 20250223100803 of `epsmg…/images/6/6b/4._ATJ2B.85(Pindaan_2019)_internal_used_17122019.pdf`).
**Rules v1 — every limit read from the ATJ text (txt line refs), in `viewer/rates/road_rules.json`, never in JS:**
| rule | clause | limit | population (JELAPANG) | measure |
|---|---|---|---|---|
| `sign_mounting_height` | 2B §1.3 "shall" | bottom of sign ≥ 1.8 m above roadway edge (rural; divided-road warning/regulatory) · 2.2 m urban · 1.5 m secondary sign below a major sign | SIGNAGE minus WD.24 | face bottom − road top at the nearest road edge |
| `obstruction_marker_height` | 2B §2.4.2 "should" | bottom ≥ 1.2 m | WD.24a/b (24) | same |
| `sign_lateral_clearance` | 2B §1.4 "should" | nearest sign edge ≥ 0.6 m from shoulder edge (3.6 m from travelled way if no shoulder); chevrons 1.8 m recommended (§2.3.4) | SIGNAGE | plan distance sign → nearest ROAD solid |
| `chevron_spacing` | 2B §2.3.4 "shall" | chevron delineators 6 m apart | WD.39a/b (46) | nearest same-run chevron |
| `rrpm_spacing` | 2D Table 4.2 | lines 12 m (curve) / 24 m (straight); islands/medians 4–12 m | ROAD STUD (940) | spacing inside each stud group |
- **Area type** (rural 1.8 / urban 2.2) is NOT in the data → `road_rules.json` `area_type`, default `rural`, printed in the report
  header as an assumption. "shall" breach = CRITICAL, "should" breach = WARNING.
- **Measurement definitions (geometry, not project values):** sign face = z-slices whose triangle-section coverage along the sign's
  plan axis ≥ 50 % of the face width (a two-post frame covers ~2 post widths, not the span — first probe used vertex EXTENT and
  read two-post signs as faces at ground level). Road top = highest ROAD vertex within 0.5 m (plan) of the nearest ROAD vertex
  (first probe took the nearest vertex, which can be the solid's underside). Candidate ROAD pieces prefiltered by
  `center ± bbox` (full size, not /2 — §W.2 centroid offset). Secondary sign = another SIGNAGE face directly above within 0.3 m plan.
- Stud groups = studs linked at < 1.5 m. Measured: **20 groups, spacing 1.0 m** (nn1 median 1.00, p95 1.00) → matches NO Table 4.2
  row → WARNING per group "1.0 m vs 4–12 m (islands) / 12–24 m (lines)", application not in the data.
- **Sign code coverage** (not a finding): each `17_Code` looked up in ATJ 2A text; RM./GI./WB. codes and some RP./WD. (WD. 3,
  WD. 31, RP. 13 text form "RP 13.") are not text-extractable from 2A → listed "not verified", never flagged.
- Codes without a `17_Code` (18 SIGNAGE elements, names "SIGN NO. n") → judged by geometry only, listed as "no code".
**Surfaces (one evaluator, row shape = StructuralSanity/EgressSanity `{guid,ifc_class,name,storey,rule,severity,ratio}` + `limit`,
`clause`, `measured`):** `viewer/road_check.js` (portable, `dbQuery` in, rows out; Node + browser) →
`viewer/model_check_report.html` (MEP-report styling: header, stat cards, one section per rule, coverage, assumptions, CSV, Share).
`boq_charts.html`: when the model's disciplines ⊂ CIVIL_DISCS the MEP button reads **Model Check** and opens the report; any
building → MEP unchanged (NON-IMPACT gate). Rule-checklist panel adoption = later.
**Witness `viewer/tests/witness_road_check.js`** (better-sqlite3, real DB): per-rule population + finding counts on JELAPANG_AFTER;
two-post sign face bottom > 1 m (proves the slice fix); road top ≥ every ROAD vertex z within 0.5 m (proves top not underside);
Duplex → every rule VACUOUS/INCONCLUSIVE, button stays MEP; a rule with 0 population never prints PASS.

**§MC First run (2026-10-05, WIP commit on `feat/civil-model-check`; harness `prompts/civil_probes/rc_run.js`, log
`rc_run.log`; run with `BSQ=/home/red1/bim-compiler/node_modules/better-sqlite3 node rc_run.js <db>`):** 3.05 s, 302 rows.
| rule | population | findings | measured | read |
|---|---|---|---|---|
| sign_mounting_height | 114 | 74 | −6.02 … 1.78 m | ❌ FAULT — negative heights: road-top band (nearest + 0.5 m) catches a HIGHER road piece (embankment / other carriageway). Needs the road surface directly at the post foot, or the foot's own ground level |
| sign_lateral_clearance | 138 | 138 | all 0.00 m | ❌ FAULT — every sign foot lies inside some ROAD solid's plan (verge/kerb solids are in the ROAD file?). Check which `01_Component_Name` the containing pieces are; carriageway-only pieces may be the right reference |
| obstruction_marker_height | 24 | 24 | 0.60 … 0.74 m vs 1.2 | plausible real finding — verify after the height fault is fixed (same road-top method) |
| chevron_spacing | 46 | 46 | 11.9 … 18.7 m vs 6 | plausible real finding; also check "laterally 6 m apart" reading against ATJ 2B Fig. 10 before reporting |
| rrpm_spacing | 20 groups | 20 | 1.00 m | as predicted (matches no Table 4.2 row) |
- Face detection: two-post "SIGN NO. n" signs now read face bottom 0.87–1.07 m above the (faulty) road top, post coverage
  0.25 m vs width 1.9–2.2 m → the slice method separates post from face; 0 signs without a found face.
- Coverage: 20 codes; only WB. 24a/24b and GI. 9a not found in ATJ 2A text (listed "not verified"); 18 signs carry no code.

### §RP Road panel + Alt+C film (user, 2026-10-05) — REQUEST RECORDED, not specced
> *"We can have a dedicated Road CW Overlay Panel that addresses [the 8 §K items] … then in the Alt-C film making has them
> similar to buildings"*
- One panel, shown only on civil models (same gate as §MC), one tab per §K item, each tab stating its status from §K's table
  (data in hand / derivable / waiting on what). No tab fakes a result for missing data (lux needs IES; flood needs terrain + hydraulics).
- First tab = **6 Follow Road Standard** = §MC's evaluator. Its rows use the StructuralSanity/EgressSanity row shape on
  purpose → the existing building path (`rule_checklist.js` panel + `rule_findings_film.js` film beats) can take them. That is
  the "similar to buildings" route for Alt+C: road findings become film beats through the SAME film code, no second film engine.
- Order follows §K: 6 → 4 traffic management 4D → 5+8 drainage capacity → 1 drive / swept path → 3 utility route → 2 lux → 7 display-only.

### FUTURE (recorded, not started)
Design-revision diff · snags/issues with QR · variation orders on civil rates · rule-findings film for road
standards · 2D corridor plan (storey-free) · cross-sections square to road · lane widths/clearances by measure ·
chainage grid overlay · staffage cars on the road · sun path (needs CRS) · ERP fold → JKR asset register.

## §SECTIONS_BLOCKER study (2026-10-07, user: "quick study what is holding it up") — why Ch "Sections" is not in the film
- Code: bim-ootb `feat/profile-lens` @82dd462c, 3 commits, +412/−66 in 4 files (lens + `witness_civil_sections.js` + viewer.html),
  6 behind main, **no PR**. Worktree `/tmp/wt-profile-lens`.
- The lens itself passes: witness 38/38 claims PASS (Duplex VACUOUS ✓, RED control FAIL-as-expected ✓).
- Blocker = the WITNESS, not the feature: its pre-existing "leave" block (X/Y after Cross) re-sets clip planes on 421 meshes one by one;
  under swiftshader every change recompiles shaders → Playwright protocol timeout. Crashed twice, also at lower load.
- Fix (small): re-set clip planes in ONE `collectMeshes` pass, or run the witness on the real GPU like the bakes (`--gpu real`); rebase on
  main; re-run; PR. Then the clip: Long lens drag (3 s) → Cross slice slide (4 s) → Profile PDF flash (1 s) per FILM_NARRATION §11.v5.
- UI nits found then: Time Machine panel overlaps the lens bottom; lens is an opaque disc (design choice); peek rim-drag didn't land.

## §PROFILE_LENS_PENDING (2026-10-07, user: "publish what is good enough and leave documented the pending") — lens shipped #1922, these open
1. **PNG export = the round lens as drawn** (blue ring, circular crop; axis labels at the rim, the far end of the span clipped). Fix: render
   the PNG from an offscreen rectangular canvas with the same series. Small (~1 h with witness).
2. **Legend lists a series with no data in view** (ground: `§PROFILE_LENS_PRECOMPUTE ground=509` of 2111 samples). Fix: legend only for
   series with ≥1 finite sample in the span. Tiny.
3. **Road-top dips** (~2.5 m at 845–865 m in the lens PNG; ~0.5 m at 75–80 m on PDF sheet 1). SUSPECT, unverified: the down-ray may hit a
   lower object (culvert/drain) instead of the road top. Needs a witness that lists the hit element per dip sample first. Unknown size.
4. **Drain invert drawn only as short dashes** — a drain level exists only where a drain crosses the route; correct data, reads as a glitch.
   Possible: dashed style + legend note. Design question, not a bug.
- Witness downloaded one `profile_818-918m (n).png` into ~/Downloads per run (10 copies) — fixed in #1923 (blob only).

## §CROSS_OUTPUT (spec, 2026-10-07; user: "the 'cross' cut section can pull the line but how do i get the result? Long, yes … PNG and PDF")
MEASURED (bim-ootb origin/main viewer/civil_sections.js:149-206): Cross mode has NO deliverable. It only (a) clips the 3D view to a 2 m slab
square to the route and (b) logs `§CROSS_SECTION … elementsCut=N byDisc={…}` to the console. Long mode has PNG (`A.civilLensPNG`) + PDF tab
(`A.civilProfilePDF`); Cross has neither.
Proposed (NOT built — awaiting user go): in Cross mode add **PNG** + **Section sheet** buttons beside the scrubber.
- Drawing = true cut, not the slab render: intersect each cut element's triangles (the `civilSectionCut` set only) with the mid-plane →
  2D segments in (offset from centreline m, z m), coloured by discipline, ONE scale, chainage + "inferred" in the title.
- Table under it = elements cut: discipline · name · count (from the same `civilSectionCut` result — one owner, no second computation).
- PNG = that drawing; Section sheet = new tab, print CSS → "Save as PDF" (same pattern as Profile PDF, no new library).
- Witness: segment endpoints lie on the plane (|n·p − d| < 1 mm); every element in the table has ≥1 segment or is listed "bbox only";
  table count = `§CROSS_SECTION elementsCut`; Duplex VACUOUS.
- ✅ 2026-10-07 BUILT (bim-ootb PR #1926, sw v1602): Cross mode has "PNG" + "Section sheet" (A.civilCrossOutput / civilCrossPNG / civilCrossSheetHTML). Real triangle∩mid-plane segments for the civilSectionCut set only; table disc·name·count + "bbox only" rows. Witness (CivilWorksPath, real GPU) PASS 45/45: endpoints |n·p−d| ≤ 2.3e-13 m at s=528/1161/1794; segments 2176/1542/1043; elements 44/35/77 (bboxOnly 8/1/1) == §CROSS_SECTION elementsCut; RED on origin/main FAIL; Duplex VACUOUS. `§CROSS_OUTPUT s= segments= elements= bboxOnly= ms=13-28`.

## §CROSS_LIVE_POPUP (spec, 2026-10-07; user: "When we drag scrub the Cross-section, can't we have a pop up giving in realtime in spot besides the cut? Draggable pop up.")
- In Cross mode, a small floating panel (~360×240 px) shows the §CROSS_OUTPUT drawing (same owner `civilCrossOutput`, no second cut code)
  and redraws LIVE while the scrubber is dragged: throttled to one redraw per animation frame, latest chainage wins (measured cost 13–28 ms/cut).
- Placed beside the cut: anchored at the screen projection of the route point at s (offset right/up, clamped inside the canvas) and follows it
  while scrubbing — UNTIL the user drags the panel by its header; then it stays where dropped (a ⟲ button re-anchors). Close ✕ hides it for the
  session; leaving Cross mode / closing the Cut tool removes it. Header shows "chainage N m (inferred) · elements · segments".
- Keeps the PNG / Section sheet buttons (they act on the same s).
- Witness: scrub to 3 chainages → popup drawing's chainage = scrubber s each time and its segment count = `§CROSS_OUTPUT segments` for that s;
  redraws ≤ frames (throttle proven, `§CROSS_LIVE redraws= frames=`); header drag moves it and a later scrub does NOT move it back; leave Cross →
  popup absent; Duplex → no popup (VACUOUS).
