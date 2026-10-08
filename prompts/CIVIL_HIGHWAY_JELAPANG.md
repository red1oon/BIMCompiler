# CIVIL_HIGHWAY_JELAPANG — first civil-works (highway) IFC set through the viewer

Consolidated 2026-10-08 — full history: prompts/archive/CIVIL_HIGHWAY_JELAPANG_full_2026-10-08.md

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

## ▶ RESUME (2026-10-08 close; merges the old "RESUME HERE" 2026-10-07 block — retired blocks are in the archive)
**State:** Road standards tab live (sign codes ATJ 2A, speed zones ATJ 8/86 + roundabout/junction demo rules, discs on boards, sign-vs-speed ATJ 2B,
HUD layout, toggle `j` — #1947). Model = `~/Downloads/JALAN JELAPANG IFC/CivilWorksPath.db` (carries the Kuantan MOCK site
`site_latlong_source=mock_film_kuantan`, sun only; undo in `mock_site_kuantan.sql` beside it). Film recipe/chapters: FILM_NARRATION.md §11.v7.
Bake/TM defects for outside review: `prompts/CWRoadBakeIssues.md` (Issues A–D).
**Next candidates (user-chosen order):** chainage grid · traffic-management 4D (EXISTING vs new lanes) · lane width / gradient checks from Cross
output + long section (ATJ 8/86) · markings ATJ 2D · Modeller road-works kit on the Bonsai PDF-terrain point cloud (§MODELLER_ROADWORKS).
**Pending user review → then assemble the new film:** chapter clips (§FILM below) → one film with the prior-art end card + air-horn/trucks audio.
**Still open from the old resume block (file does not show them done):** v7 bake proof (`~/Videos/CivilWorks_film_v7_{BEFORE.mp4,page.log,cli.log}`:
`§CW_SOLIDIFY_EVENT civil=true added>0`, `§CW_PACE_DISTINCT`, `§CPE_DAY_COUNTER` advancing, `§CPE_BUILDUP_PLACED_SUMMARY neverDrawn=[]`,
`§GEOREF_SITE lat=3.8`) then re-cut the build-up clips from v7 · ERP clip Ch4 (recorder `scratchpad/erp_clip.js`; facts: push LIGHTING+DRAINAGE →
`§PROJ_PUSH lines=+2`, `§ZOOM_LINKBACK_STORE guids=416`, project 990001, lines live under Phase → Task → Task Line; `plannedAmt=0` — LIGHTING/DRAINAGE
have no CIVIL_RATES rate, don't voice amounts) · assemble v7 film (Ch0 card → Ch1 v2 → v7 build-up + WIP line → Ch4 ERP → Ch5 mobile → close + WIP
card → Chapter End) · Issue D generator fix · 7,612 tied completion instants (same writer?) · sky residual (parked).
Rules learned: whitebox first; all browser runs `flock /tmp/civil_browser.lock`; don't edit the user's DB while their viewer has it open (their save
overwrites it); never pkill with a pattern that matches your own shell. Recorders: `prompts/film_erp_clip_recorder.js`, `prompts/film_sections_clip_recorder.js`
(real GPU). Localhost viewer `http://localhost:8411/viewer/viewer.html?db=buildings/CivilWorksPath.db&bld=CivilWorksPath`.

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

## §SHIPPED index — one line each: feature · bim-ootb PR · sw/asset version · witness pass line · detail in archive (`A:` = archive section)
All merged to bim-ootb main unless marked. Detail, specs-as-written, measurements: `prompts/archive/CIVIL_HIGHWAY_JELAPANG_full_2026-10-08.md`.
**2026-10-04/05 (A: §SHIPPED table)**
- §A units (heuristic deleted) · §B.2a civil disciplines from file name · §I.3 framing · #1844 · witness_import_units_disc.js; SampleHouse 14.0×5.9×3.5 unchanged
- cache-bust import.js?v=5 → worker ?v=13 · #1847
- §M stray-robust ground + civil discipline colours · #1849 · JELAPANG plane −11.10 → 51.74 m; fleet at step 1
- §P shadow box follows camera (+ throttle) · #1850 + #1852 · fleet envelopes → off
- §Q Time Machine civil phases (SEQUENCE_CIVIL, 4D_template_civil.json) · #1851 · witness_civil_phase.js; cache_4d_run identical
- §Q.2 civil trades + parallel finishing (66→60 d), §R.2 5D civil lines (rates null pending) · #1853 · Duplex BOQ 34 lines RM 1,064,715.92 = main
- civil crews reach every reader; _GANTT_CACHE_VERSION 39→40 · #1854
- Alt+S Save PNG / Close overlay without WebGPU bounce (§STILL_OVERLAY_NOGI) · #1856
- §U fog sized after envelope; §TOUR_NO_ROOMS VACUOUS · #1857
- §U civil property labels + Fly Tour flies MAINLINE (2,373 m, 5 signal stops) · #1858
- §V civil clash pairs + one _clashIgnoreSet owner · #1859 + #1860 · witness_clash_civil_pairs.js 11/11
- §V.4 hide box-only rows when pair box total ≥ 1000 · #1861 · witness_clash_boxonly_hide.js 11/11
- §W.1 night lamps at real lamp heads · #1862 + #1863 · witness_civil_night_lamps.js (172 columns / 223 heads within 1.3 cm; 6/6 signals)
- §Z import progress on status line · #1864 · witness_import_feedback.js 6/6
- §Y Measure double-click sizes the element · #1865
- §LOAD roof layer fixed (10,140 → 33 ms) · #1867 · witness_roof_layer_budget.js diff=0 (A: §OPEN §LOAD)
- §NL night step 1 (§CIVIL_LAMP_THROW / §CIVIL_LAMP_GLOW) · #1869 (+#1868 CI no-undef lesson: read cross-file globals via window) · witness 15/15 (A: §OPEN §NL)
**2026-10-06 (A: §SHIPPED 2026-10-06 list + §SPECS)**
- §GLOW_DAY #1875 · §REVEAL_SHELL #1877 · §ALTC_V2 #1878 · §ALTC_PANELS #1879 · §CHAINAGE_V2 #1880 · §ALTC_LABELS #1881 · §ALTC_CHECKS #1882 ·
  §ALTC_V3 + §MC_MOCKUP #1883 · §GHOST_PROBE #1884 (did NOT remove the sky ghost) · §S4_RAW_EPOCH #1885 (20,791 → 60 days) · §PARTNER_DISCS D1/D4/D5/D8 #1886
- §CIVIL_REF_LOOK + §GROUND_CIVIL (earthworks see-through, ROW outline, ground from EARTHWORK) · #1887 (A: §CIVIL_REF_LOOK, §DOCTRINE_AUDIT)
- bbox view per building (§MERGED_DB; rule v2 order-independent) · #1889 · Merged.db vs one-building copy must draw the same count
- §MIXED_PROGRAMME road + bridge alongside · #1890 (sw v1581) · witness_civil_mixed_programme 6/6; makespan 163 d
- §MERGE_PSETS fold element_psets for new guids only · referenced as #1891 (A: §MERGE_PSETS, §ALTC_GROUND_CARDS)
- clash civil witness #1897 · §EW_VOLUME_SURFACE (earthworks volume on 3 surfaces) #1900/#1902 (sw v1594) · witness_ew_volume_surfaces.js 11/0
- §LONG_SECTION + §CROSS_SECTION #1901 (sw v1593) → in-tool Long/Cross §SECTION_CIVIL_MODES #1904 · §WITNESS_CIVIL_SECTIONS PASS 12/12
- Find → ERP Project Order witness #1906 · ERP fold proxies by discipline #1915 · red pill back to civil model §ZOOM linkback #1916
**2026-10-07 (A: §SHIPPED head, §SECTIONS…§SIGNAL_JUNCTION_ZONE)**
- §CW_SOLIDIFY_EVENT #1919 (sw v1598) · witness_cw_solidify_event.js PASS · §CW_PACE_DISTINCT #1920 (sw v1599; proof pending v7 bake log)
- §PROFILE_LENS #1922 · witness 38/38 (Duplex VACUOUS, RED control FAIL) · download-per-run fix #1923 · pending items → OPEN
- PR #1924 ERP detail fail-closed (branches fix/erp-md-upstream, fix/erp-detail-fail-closed) — OPEN per last note, not shown merged
- §CROSS_OUTPUT (Cross PNG + Section sheet) #1926 (sw v1602) · witness 45/45 real GPU
- §CROSS_LIVE_POPUP #1928 (sw v1604, civil_sections.js?v=5) · witness 55/55 · §CROSS_POPUP_COMPACT #1929 (viewer v1606) · witness 56/56
- §ZOOM_BACK_FIELD: no Hospital fall-through #1930 · reload/TM-on skipped + §ZOOM-REUSE #1931 · Find ERP row clipped #1932 (v1609, witness_find_row_clipped.js) ·
  same-item zoom #1933 (viewer v1610, erp v826) · variance box on red-pill back #1935 (v1611, no witness run) (A: §ZOOM_BACK_FIELD)
- §SIGN_CHECK #1937 (sw v1612) · witness_sign_check.js 12/12 (→13 in #1946); OK 107 · UNKNOWN 13 · MISSING 18
- §SPEED_ZONES #1939 (sw v1614) · §WITNESS_SPEED_ZONES 18/18 · lever derived|class|manual included · speed disc on RP. 7 #1940 · true road colour = legend #1941 (v1616, 19/19)
- §ROUNDABOUT_ZONE #1942 (sw v1617, speed_zones.js?v=4) · pass=31 fail=0 · NCHRP 672 demo rule; speed_ramp 30 km/h near-white
- §SIGNAL_JUNCTION_ZONE (generic deriveNode) #1943 (sw v1618, ?v=5) · pass=41 fail=0 · discs on face + MISSING SPEED SIGN group
**2026-10-08**
- §DISC_ON_FACE (a.k.a. §DISC_ON_BOARD_AREA) + §PROFILE_AFTER_LOAD #1944 (v1619) · witness 42/42 · probe: 9 zones, 8 discs, normal·face 1.000
- §SIGN_VS_SPEED + §LABEL_CLEAN #1946 (sw v1621, speed_zones.js?v=8, road_standards.js?v=2, std_values.json?v=2) · §WITNESS_SPEED_ZONES pass=54 fail=0; §WITNESS_SIGN_CHECK pass=13 fail=0
- §RS_TOGGLE (Road standards toggle from Inspect row / `j`, closing reverts colours + discs) #1947 (v1622) · browser probe (4008 reverted, 0 discs); session cleanup of worktrees recorded
- §MEM_GROWTH spec written by another session — spec only (below)

## OPEN / NOT DONE (each: reason · pointer)
**Lens (§PROFILE_LENS_PENDING, shipped #1922):** (1) PNG export is the round lens, should be offscreen rectangular canvas · (2) legend lists series with no data in view
· (3) road-top dips ~2.5 m at 845–865 m, SUSPECT down-ray hits a lower object, needs per-dip hit-element witness first · (4) drain invert only as short dashes (design question).
**Sections / witness:** lens witness "leave" block recompiles shaders under swiftshader (run on real GPU or one collectMeshes pass) (A: §SECTIONS_BLOCKER). UI nits: Time Machine panel overlaps lens
bottom; peek rim-drag didn't land. §SECTION_CIVIL_MODES / §LONG_SECTION open: DLOD-hidden elements not excluded from the cut set; click resolution ≈ 2.7 m/pixel; fleet proof Duplex only.
**§HANDOFF_AUDIT** — neutral loss report + version diff; spec only (A: §NEXT_WAVE). Seed case LIGHTING v1 227 → v2 216 (11 deleted). Chapter 0 film intro: FILM_NARRATION.md §11.v5.
**Merge / data:** Find panel refresh after every fold (`_mergeDbIntoScene` / `_mergeSplitDbIntoScene`) not only on new-building stream (A: §MERGED_DB) · LIGHTING 227 not swapped for the 216 re-export in Merged.db ·
§MERGE_PSETS fold rule: confirm state before relying on it · §CIVIL_GRAPH_GATE (route to GRAPH when chainage section present) and §WORLDBOX_DLOD (use `_origMatrix` for culled slots) and
§ALTC_GROUND_CARDS (ground + outstanding cards) are specs in the archive — file does not show them shipped.
**4D programme:** §PARTNER_DISCS D2/D3/D6/D7 HELD on `feat/civil-partner-discs`, superseded by §MIXED_PROGRAMME (#1890) · ⛔ PLAYED-LAYER GAP (tmGenerateTimeline on a DB with no stored tasks plays CPM display only) ·
earthworks duration count-based, needs volume m³ + output rate · new-phase crews need a cited labour source (§L) · ONE owner function for the CHAINAGE/ROW schedule exclusion (7 inline copies) ·
CPM `time_machine.js _allCivil` template-per-group (A: §DOCTRINE_AUDIT) · Issue D (backwards CH 10 Ground Treatment bar; generator fix needs live civil generate path) · 7,612 tied completion instants.
**§OPEN list (A: §OPEN):** §W.2 centroid vs box LIVE clash broad-phase bug (buildings too; fix shape: rtree from center + local min/max; fleet before/after table) · §LOAD remaining (MEP_SMOOTH/DUCT_SILHOUETTE on civil, KRN_PERSIST full rewrite,
URL loads > 400 MB skip IDB cache) · §CULL_SPHERE (dlod.js:77-81, 1,173 elements) · §NL steps (b) pools beyond 30 nearest, (d) Alt+C dusk · narrowphase S7b/I3/I4 · light_zones uncapped grid ·
P3 near plane · zoom-to-cursor (user: all models or only large?) · hub duplicate discipline list (import_own.js) · 5D quantities are counts · walk/fly speeds, DLOD thresholds, measure snapping unread.
**Standards:** roundabout speed rule ATJ 11/87 not in hand (NCHRP 672 demo rule in use; user supplies copy or manual lever) · size-vs-speed not in the standards (only letter-height tables; §SIGN_VS_SPEED RESULT) ·
11 other ATJ 2B advance distances recorded, not judged (no locatable hazard) · discs on both faces of a board (user OK for demo; traffic-facing only = not done) · 4.10B Mountainous @70 km/h `_unread` ·
§SIGN_CHECK json_overrides DB save deferred (user scope cut; overrides browser-only) · `witness_viewer_i18n.js` timed out identically on main and branch (inconclusive) ·
terrain assumed flat for windows with <30 ground samples (2 of 5).
**ERP side (owned by `ERP_IDEMPIERE_UX_PARITY.md` §MD-UPSTREAM + §BIM-CRUD):** Task Line shows every project's lines in the user's session (#1924 only fails closed) · BIM-pushed project records cannot be deleted
**ERP cross-file pointers (2026-10-08):** viewer variance meaning + CommittedAmt has no ERP writer → `ERP_IDEMPIERE_UX_PARITY.md` §PROJ-VARIANCE · Backup/Restore omits BIM-pushed orders → `ERP_FIRST_SETUP_GUIDE.md` §FS2o-BIM · stale-tab push-store fix ✅ #1938 (§BIM-CRUD) · seed reset clears push store ✅ #1925.
(overlay re-inserts on boot — suspect) · CommittedAmt writers: only viewer/vo_approve.js — a PO + receipt does NOT move the viewer's variance (oracle: iDempiere project commitment roll-up, to cite) ·
planned amount push (§ZOOM_BACK_FIELD item 1) rate path: Beam not re-run in a browser · witness_zoom_linkback_node.js broken on main (old slice regex) · tab-to-front on zoom works only when this ERP tab opened the viewer.
**§MODELLER_ROADWORKS:** not specced, not started (below).

## §FILM — chapter clips (all await user review, NOT spliced into any film)
- ERP ch3 v2: `~/Downloads/CivilWorks_ch3_erp_v2_narrated_AFTER.mp4` · script `prompts/film_narration_civilworks_ch3_erp_v2.tsv` · recorder `prompts/film_erp_clip_recorder.js`
- Sections bonus v3: `~/Videos/CivilWorks_bonus_sections_v3_BEFORE.mp4` (56.4 s / 1466 frames) → `~/Downloads/CivilWorks_bonus_sections_v3_narrated_AFTER.mp4` · script `prompts/film_narration_civilworks_bonus_sections.tsv`
  (user's recording `~/Videos/simplescreenrecorder-2026-10-07_05.29.56.mp4`; card chapter style 1.0 s hold + 0.5 s fade; recorder `prompts/film_sections_clip_recorder.js`). v2 superseded (archived).
- Ch1 v2: `~/Downloads/CivilWorks_AltC_setup_ch1_v2_narrated_AFTER.mp4`; Ch0 + closing cards `prompts/film_ch0_card_v7.py`.
- Road Signs: `~/Videos/CivilWorks_ch_road_signs_BEFORE.mp4` (50.1 s) → `~/Downloads/CivilWorks_ch_road_signs_narrated_AFTER.mp4` (no card; THE one to splice) · script `prompts/film_narration_civilworks_ch_road_signs.tsv`
  · claim wording: rule checking is a paid model-checker feature (Solibri; IFC 4.3 road support "initial"); FOSS IfcTester/IDS can check if someone writes a spec → say "usually", never "not in FOSS".
- Speed Zones EN: `~/Downloads/CivilWorks_ch_speed_zones_narrated_AFTER.mp4` (56.7 s; `~/Videos/CivilWorks_ch_speed_zones_BEFORE.mp4`, user's recording `~/Videos/simplescreenrecorder-2026-10-08_05.57.49.mp4`) · `prompts/film_narration_civilworks_ch_speed_zones.tsv`
- Speed Zones MS: `~/Downloads/CivilWorks_ch_speed_zones_MALAY_narrated_AFTER.mp4` · `…_ch_speed_zones_ms.tsv` · Speed Zones TH: `~/Downloads/CivilWorks_ch_speed_zones_THAI_narrated_AFTER.mp4` · `…_ch_speed_zones_th.tsv`
  (the EN/MS/TH clips currently carry the prior-art card + air-horn/trucks mix baked in; Thai card `~/Videos/CivilWorks_priorart_endcard_THAI.png`). Viewer panel text in shots stays English (user OK).
- **Placement decision (user 2026-10-08):** prior-art card + air-horn/trucks mix goes ONLY at the end of the next assembled CivilWorks film, not on chapter clips.
  Assets: card PNG (`scratchpad rs/priorart_card2.png`, regenerate from the card spec: "PRIOR ART CHECK" large, 8 s hold + 1.5 s fade, ⚠ names ATJ 2B — true now #1946) ;
  audio `~/Videos/CivilWorks_endcard_traffic_AIRHORN_TRUCKS_PREVIEW.wav` (−13 LUFS; CC0 BigSoundBank #0122 bed, #3434 cars, #1255/#1256 trucks, #3438 horn pitched down = sound design, label as such; `~/Videos/*_CC0.wav`).
- Superseded previews (end card v2/v3/v4, traffic/horn/horn+trucks variants, bonus v2): details archived, do not splice.

---
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


## §MODELLER_ROADWORKS — direction (2026-10-07, user; not specced, not started)
> *"Modeller is for creative discussion what others are doing that we can do better ie similar to present strategy, load parts of this CW
> for users to craft any road works. There is a terrain topography IFC under old project IfcOpenShell / terrain to use as sample to build on,
> where it is infused with the present project IFC element set. Terrain also can be for buildings later. We can then add cut and fill feature."*
- Fits the standing Modeller strategy (memory `project_modeller_assemble_handoff_strategy.md`: authoring stays in Revit/Civil 3D, we
  ASSEMBLE + HAND OFF): a road-works kit = parts lifted from CivilWorks (sign + post, lamp column, drain, gabion, kerb/road pieces by
  discipline) placed on a terrain, then cut/fill against that terrain.
- Terrain sample candidates found on disk (which one the user meant = OPEN QUESTION):
  - `~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/bSI_Terrain_TIN_IFC4X3.ifc` (192 KB, buildingSMART TIN sample) and
    `bSI_Terrain_Existing_IFC4X3.ifc` (30.8 MB).
  - Bonsai PDF-terrain addon `~/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/pdf_terrain/` (samples are JSON point clouds, no .ifc);
    port spec `prompts/TERRAIN_MIGRATION.md`.
- Cut/fill: our only volume today is `A.earthworksVolume()` (viewer/earthworks_volume.js, bounded mesh volume, §EW_VOLUME_SURFACE) —
  design surface vs existing terrain is new.
- Next step: a competitive read (what Civil 3D / OpenRoads / InfraWorks / FOSS do for "sketch road on terrain + cut/fill") → spec.
- **ANSWERED (user 2026-10-07):** *"Yes that points cloud, it does appear in Bonsai with its source image perfectly aligned. That can be
  sample reference. User may use that same tool (later we bring over to our PWA) to convert and import here."* → reference terrain =
  the Bonsai PDF-terrain point cloud (`pdf_terrain/samples/survey_highres_extracted.json` + `survey_highres_GV.json`, source image
  `~/bim-ootb/internal/PDF_Terrain/survey_highres.png`). Path today: user converts in Bonsai → exports → imports here; later the converter
  itself comes to the PWA (`prompts/TERRAIN_MIGRATION.md` is that port spec). Terrain also serves buildings later. bSI TIN samples = not the reference.


## §MEM_GROWTH — four memory pieces: point merge + paged DB + evict + chainage tiles (spec 2026-10-08, for review by the handling session)
> User, 2026-10-08: *"perhaps we can use paging to break down larger models?"* … *"Why didn't you name the points
> reduction as the Missing 4?"* … *"Spec'd all 4 in so the session handling can review it."*
Expands §J and `docs/BrowserScaleBenchmark.md` §SCALE (read both first). Spec only — nothing built. NON-IMPACT RULE
above applies to M2/M3 (civil-gated); M4 is general and must prove zero look change on buildings before it touches them.

**Facts this rests on (read, not assumed — bim-ootb `origin/main` 2026-10-08):**
- §MESH_SLIM removed NO points: it drops stored normals (`viewer/import_db_builder.js:100`, `viewer/scene.js:908`) and
  derives them on load (`viewer/streaming.js:2563`). DB 661 → 396 MB; heap unchanged in kind — still ~22 M verts, 3.4–3.8 GB.
- Lamp poles: 227 poles = 7.6 M of 22 M verts, dup ratio 4.8, flat-shaded facet soup (§SCALE).
- DLOD frees nothing: `dlod_nav.js:510 _hideReal` only sets `visible=false` / zero matrix / `setVisibleAt(false)`;
  `_disposeBoxes` (`:471`) frees only the box materials. Room occlusion is interior-only (`dlod_nav.js:12`), occl-BVH
  default off (`:24`) — neither helps an open road and neither frees memory.
- Range streaming exists for URL DBs: `streaming.js:2498` §S260 (`A._useRangeStream`, `A._rangeDb`). Local/IDB DBs open
  whole: `new SQL.Database(bytes)` (`scene.js:1215`, `:1338-1340`). URL loads > 400 MB skip IDB (`scene.js:1788`).
- In-viewer welding is BANNED by an existing owner: `streaming.js` §MEP_SMOOTH_NORMALS — merged meshes address
  elements by `idxStart/idxCount`; picking, per-element hide, BVH, §TRIPLANAR all read that layout; re-indexing breaks all four.
- `city.js:165-167` already disposes owned buffers (BatchedMesh/InstancedMesh/merged) — the one existing dispose pattern to copy.

**Stall impact on driving end to end (answers the user's question):**
| piece | adds a load wait while moving? |
|---|---|
| M4 point merge | **No** — whole model still loads once; just less of it. |
| M1 paged DB | **No** for geometry already loaded; only SQL reads become small disk page reads (OPFS, local). |
| M2 evict | **Yes, possible** — returning to an evicted area re-fetches. Mitigated by M3 prefetch. |
| M3 tiles | **Yes, possible** — on a jump; seamless at drive speed only if tile load < time to reach it. Must be MEASURED (W-M3). |

### M4 — point merge (weld duplicate corners) at DATA level — do FIRST (smallest, no stall, general)
- **Where:** per `component_geometries` row (one geometry = one `vertices` + `faces` blob, `streaming.js:1478`), at
  import (`import_db_builder.js` beside `§MESH_SLIM_IMPORT`) and save (`scene.js` beside `§MESH_SLIM_SAVE`). Each row is
  welded on its own BEFORE any merge, so ranges/picking/BVH are built from the welded data — the §MEP_SMOOTH ban is not crossed.
- **Phase A — look-neutral weld:** merge vertices only when position AND face normal agree (ε to be measured, start 1e-5 m /
  cos ≥ 0.9999). ✅ ANSWERED 2026-10-08: civil loads skip stored normals (`streaming.js:2565` `_useN=false`) and
  `A.blobToGeometry` (`scene.js:2201`) sets the index (`:2228`) then calls `geo.computeVertexNormals()` (`:2252`) — so a
  shared vertex DOES average its faces' normals. Phase A is still look-neutral **only if every face meeting at a welded
  vertex has the same normal** (parallel normals average to themselves). So the weld key is (position, face normal):
  group duplicates by position, then split each group by face normal; never merge across a crease.
- **Phase B — smooth weld for round shapes (poles):** facets of a round pole have different normals, so Phase A saves little
  there. Merging them = smooth look = **needs the user's look ruling** (§SCALE item 5). Reuse §MEP_SMOOTH's measured gate
  (`CURVE_MIN_DISTINCT=16`, `CREASE_DEG=55`) — do not invent a new one. ⛔ BLOCKED on ruling; Phase A ships without it.
- **Buildings:** first a read-only probe over the fleet DBs (no render, no GPU): per class, verts before/after Phase A.
  Apply to buildings only if the probe shows a saving AND the W-M4 look check holds; otherwise civil-only.
- **W-M4 (issue: points stored 4.8× over, costing heap and load time):** `§VERT_WELD rows= vertsBefore= vertsAfter=
  dbBytesBefore= dbBytesAfter=` + on reload `§VERT_WELD_LOAD heapMB= loadMs=` vs the same run unwelded. Look-neutral proof =
  per-triangle derived normal identical before/after (max angle Δ logged), NOT a screenshot. 0 rows welded → `INCONCLUSIVE`.

### M1 — paged local DB (OPFS VFS) — large saved/imported models stop living whole in the WASM heap
- **Gap:** local/IDB DBs open as one `Uint8Array` in sql.js (`scene.js:1215`); 32-bit WASM caps at 4 GB; >400 MB never cached.
- **Design:** store the DB as a file in OPFS and open it through a paged SQLite VFS (official SQLite-WASM OPFS VFS; sql.js
  has none — choice of library is the first decision, record it). Same query API to callers (`A.dbQuery`).
- **Removes:** the 400 MB cache skip (`scene.js:1788`) → a reload of a big model reads from disk instead of re-downloading.
- **W-M1 (issue: whole DB held in heap):** `§OPFS_VFS open bytes= heapMBAfterOpen=` — heap after open must be ≪ DB size;
  `§OPFS_VFS reload source=opfs downloadBytes=0`. Browser without OPFS → logs `§OPFS_VFS unsupported fallback=whole`.

### M2 — evict-behind (DLOD that frees memory)
- **Gap:** `_hideReal` hides, never frees. Elements inside a merged/batched mesh cannot be freed one by one (shared
  buffers, `idxStart/idxCount` layout) — so the **evict unit is a whole owned mesh**, which is why M2 lands WITH M3
  (a tile builds its own meshes; evicting the tile disposes them the `city.js:165-167` way).
- **Rule:** far tile → box proxy (existing DLOD boxes) + dispose its real meshes; near again → re-stream that tile's rows
  (range read or OPFS) through the existing streaming path. Hysteresis distance > DLOD promote/demote, so a camera at a
  boundary does not thrash.
- **W-M2 (issue: geometry never released):** drive out and back; `§DLOD_EVICT tile= vertsFreed= heapMB=` then
  `§DLOD_REFETCH tile= ms=`; heap after leaving must fall back within a stated tolerance of the start. No eviction in the
  run → `INCONCLUSIVE`.

### M3 — chainage tiles (§J, made concrete)
- **Split:** by chainage along the existing route owner (`A.civilRoutePath()` / `civilRouteAt`, §I.2 notes it is undefined
  on mobile — fix that dependency first). Tile ~1 km (to be measured, not assumed); metadata stays whole; geometry per tile.
- **Load:** coarse-first (`§BBOX_EARLY`/`§PROGRESSIVE_FLUSH`), prefetch the next tile(s) in the direction of travel.
- **W-M3 (issue: does driving end to end stall?):** scripted drive centreline start → end at a stated km/h, plus one jump
  start → end. Log `§TILE_STREAM drive maxStallMs= p95FrameMs= peakHeapMB= tilesLoaded= tilesEvicted=` and
  `§TILE_STREAM jump waitMs=`. Pass bar is a number the user rules on; until ruled the verdict prints the numbers only.
  Test data: JELAPANG tiled into ~1 km (no longer real set on hand).

**Build order:** M4-A → (fleet probe) → M1 → M2+M3 together. M4-B waits on the look ruling. Each item: spec check →
implement in a `/tmp/wt-*` worktree off `origin/main` → witness `§`-log read → `✅ DONE (witness)` here.
**Perf budget (CLAUDE.md):** every pass logs verts added/removed and heap at the end.


## §PRIOR_ART_ROAD_STANDARDS — passing web search (2026-10-08, 4 searches; user: "run that prior art search … black card at the end of the film, no voice")
Found SEPARATELY (each covers a part): Autosign (CGS Labs, https://cgs-labs.com/autosign/) — sign/marking DESIGN with national sign
libraries, IFC export (places signs; does not check an existing model) · FHWA IHSDM (https://www.fhwa.dot.gov/publications/research/safety/17098/17098.pdf)
— design-consistency vs speed, desktop, US · IfcOpenShell IfcTester / IDS (FOSS) — property checks if someone writes the spec; no road-sign
spec ships · Solibri — paid rule checking, IFC 4.3 support "initial" · research: ontology BIM compliance (ScienceDirect S0926580524003923),
TUM thesis IfcOpenShell road traffic safety (mediatum 1689801) · Malaysia: JKR-referenced BIM libraries (UiTM 28752), no automated ATJ
road-standards checker found.
NOT FOUND TOGETHER: JKR ATJ 2A/2B/8 rules extracted with page refs + checked on an existing IFC road + in the browser, editable, no install.
Claim wording allowed: "a combination our search did not find elsewhere (8 Oct 2026, passing search)" — never "the only one" / "first".


## §CHAINAGE_GRID — real chainage from the model's own markers + station grid on the road (spec 2026-10-08, user: "something really visually appealing … similar to … Road Signs")
**Measured (CivilWorksPath.db, 2026-10-08):** CHAINAGE = 332 solids (`IfcBuildingElementProxy`, no name/pset/text — every
solid is one glyph piece of 3D text, 1.0 m thick, lying flat). Grouped they spell 36 labels: mainline `0, 100 … 2200` (100 m step,
neighbour gap 74–113 m, median 100) + junction arms `J1A 0/100/200`, `J1B 0/100`, `J2A 0/100/200/400/472.63`, `J2B 0/100/200`.
So the model DOES carry design chainage — only as glyph geometry. Today every chainage shown (Long/Cross, speed zones, status row) is
the inferred route's (`A.civilDriveRoute`, starts at 0 at its own start).

**Reader (pure, no model names — the discipline comes from `std_values.json _chainage_map`):**
1. Glyph solids → labels: single-link cluster on plan (IFC x,y); link when centre gap < `link_k` × the larger glyph's plan diagonal.
2. Text axis per label = principal axis of its glyph centres (one glyph → its own long axis); two senses tried, the one with the higher
   match score wins (fixes 6/9, upside-down labels). Plan view from +Z, never mirrored.
3. Characters = solids whose spans on the text axis overlap (a glyph in several pieces is one character); a space = gap > 0.45 × cap height.
4. Each character is rasterised in the label frame (cap-height normalised, baseline kept) and matched by IoU against the browser's own
   sans-serif glyphs (Arial → Liberation Sans): number token alphabet `0-9 . +`, prefix token `A-Z 0-9`. Score kept per character.
5. Parse: `[PREFIX ]NUMBER`, NUMBER = metres or `k+mmm`. No prefix = mainline; a prefix = its own alignment (arm).
**Anchoring:** each mainline label centre projects onto the drive route → (s_route, chainage). Real chainage at any s_route = piecewise
linear between anchors, slope 1 beyond the ends. CHECK per interval: route length between two markers vs their printed step →
`OK` within `drift_ok_m`, else `DRIFT n m`. Arms: markers only (no centreline in the model) — listed + tagged, no ticks.
**On the road (toggle "Show on road" in the panel):** alignment ribbon on the road top (profile road z + lift) with ticks across it,
minor every 20 m, major every 100 m (Civil 3D / OpenRoads station style), coloured by the speed zone when Speed zones has run, else
one accent; one camera-facing tag `CH 1+200` per marker (arms `J2A 0+400`); hover chip `CH 1+147 · Z4 80 km/h · road 59.2 · ground 57.8`;
a chainage strip along the bottom: zones as colour bands, stations, signs as dots, a cursor at the camera target; drag = fly along.
**Panel:** a "Chainage" section in Road standards (`j`) — title, one-line facts, `Why / sources` collapsed, the interval check
(DRIFT first), stations list (click → fly), arms collapsed.
**Anchor (corrected after the first run):** the station is where the label's TEXT LINE crosses the route — the labels stand
36–113 m beside the road, text running square to it; the nearest-point drop was up to ~20 m off and clamped "0" and "100" onto the
route start. A label whose line does not cross the route (CH 0+000: the drive route starts after it) is listed, not an anchor.
**Owners reused:** `A.civilDriveRoute` / `A.civilRouteAt` / `A.civilGotoChainage` / `A.civilProfilePrepare` (civil_sections.js),
`A._speedZones` (zones + sign chainages). NON-IMPACT: civil-only; a building gets VACUOUS and nothing is drawn. New API:
`A.chainage.read()`, `A.chainage.realAt(sRoute)`, `A.chainage.routeSOf(ch)`, `A.chainage.show()/hide()`.
**Perf:** one mesh for ribbon + ticks, sprites for tags; `§CHAINAGE_GRID_DRAW verts= heapMB=` at the end; hide disposes everything.
**Witness `viewer/tests/witness_chainage_grid.js` — ISSUE: are the stations read from the model's own markers, and do ticks, tags,
hover and strip all agree with them?** (1) mainline reads as a gap-free 0…N step-100 run, monotone along the route by the witness's
own projection; each arm monotone; every character's score logged · (2) RED control: delete one glyph of one label → the run check
FAILS · (3) tags == markers, text == formatted value · (4) tick count == independent count over the anchored range · (5) hover at 3
projected points → chip value == `realAt` of the witness's own projection ±0.5 m · (6) strip drag to 3 x → camera on the route at that
chainage ±1 m · (7) hide → 0 objects left, strip gone · (8) Duplex VACUOUS, never PASS.

**§CHAINAGE_GRID RESULT (2026-10-08, bim-ootb `feat/chainage-grid`, sw v1623, witness 13/13 GPU=sw):** reader 332 solids → 36 labels,
all parsed (mainline 0+000…2+200 = 23, J1A×3 J1B×2 J2A×5 J2B×3), lowest char IoU 0.63 (J2A "7"), read 0.9 s; RED (one glyph of 1300
deleted) → run check fails. Route check (inferred drive route vs printed 100 m steps): 12 OK / 9 DRIFT, worst 500→600 route 88.5 m
(−11.5) — the inferred route is up to ~12 % off per 100 m, so the panel now shows where "(inferred)" chainage was wrong.
No ROAD surface under the route at CH 0+528–0+917 (390 m) → ribbon/tick height interpolated there (400 samples, logged).
Draw: 84 minor + 22 major ticks, 36 tags, 7,188 verts, one mesh + one LineSegments + 36 sprites; hide removes all.
Hover chip at 3 points == own interpolation within 0.2 m; strip clicks put the camera on the route at that s (0.00 m).
NOT done (follow-ups): the other "(inferred)" readouts (speed-zone legend, Long/Cross, status row) still use route s — switching
them to `A.chainage.realAt` changes their numbers, so it needs the user's go (NON-IMPACT rule); arms have tags only (no centreline).

### §CHAINAGE_EVERYWHERE — every chainage readout shows the model's chainage (user 2026-10-08: "yes switch to new chainage.. that is the whole fundamental why chainage is important")
ONE label owner in chainage_grid.js: `A.civilChainLabel(s)` → `CH 1+152` when the markers are anchored, else `1152 m (inferred)`
(today's text); `A.civilChainRange(s0, s1)` → `CH 0+185–0+323`. Internal maths stays in route s (zones, sampling, pick) — only the
TEXT changes. Read happens once after a civil model finishes loading (no panel needed), `§CHAINAGE_AUTO_READ ms=`.
Sites: speed zones (legend, sign rows, HUD card Chainage / Sign at, missing-sign text), Long scrubber + lens footer + profile sheets,
Cross header/popup/PNG/sheet, Alt+C road cards (cpe_road_panels CH range), film status box Chainage row (cinema_maxq).
Witness: existing witnesses' text regexes move to the new format AND assert the printed value == `realAt(s)` of the same s;
witness_chainage_grid gains: every site's text for a known s == `CH fmt(realAt(s))`, and with markers absent (std map removed)
every site falls back to "(inferred)".

## §ROAD_REPORT — "R for Road": one-key prognosis dashboard (spec 2026-10-08; user: "dashboard panel (shortcut 'R') instantly spit out an Automated Prognosis Report" · "can also show what is green and healthy")
**Key:** `R` on a civil model opens/closes the report; on a building R stays Room Cycle (`scene.js _cycleRoom`, unchanged).
Inspect menu row "Road report · R" (civilOnly). NON-IMPACT: buildings see nothing new.
**Findings — every line = chainage + measured value + rule + source; nothing typed by hand:**
| Check | Measured from | Rule / source | Severity |
|---|---|---|---|
| Chainage drift | §CHAINAGE_GRID intervals (route length vs printed step) | % of step vs `_road_report.drift_pct` | ≥ critical → CRITICAL, ≥ warning → WARNING, else HEALTHY |
| Grade | 1 m road profile, chord over `grade_window_m` (both ends on a ROAD surface; interpolated samples never judged) | zone max grade = ATJ 8/86 Table 4.10A–F row (table+page) via §SPEED_ZONES | > max → WARNING; stretches merged |
| Sign codes | §SIGN_CHECK verdicts | ATJ 2A/85 table | UNKNOWN → CRITICAL, MISSING → WARNING (its own SEV map) |
| Missing speed sign | §SPEED_ZONES MISSING SPEED SIGN rows | zone start without a speed sign | WARNING |
| Advance placement | §SIGN_VS_SPEED CHECK rows | ATJ 2B/85 cl.2.2.8 | WARNING |
| Environment (wetland/buffer) | none in the model (0 psets match wetland/buffer/environment, 2026-10-08) | — | NOT CHECKED, says why |
Thresholds `drift_pct {critical 10, warning 5}`, `grade_window_m 20` live in std_values.json `_road_report`, tagged "demo default
(editable)" — no standard gives prognosis cut-offs. The ATJ limits themselves are the cited table values.
**Panel:** title "Road report", chips CRITICAL n · WARNING n · HEALTHY n · NOT CHECKED n; groups in that order, HEALTHY collapsed
with one-line totals (e.g. "Grade within ATJ limit: 1,840 m of 2,110 m", "Signs OK 107 of 138"); each line in the user's format
`[CRITICAL] CH 0+500 to 0+600: 11.5% drift …`; click → fly (chainage) or focus (sign); Copy / Download .txt = the same lines.
**Witness `witness_road_report.js` — ISSUE: is every line in the report a measured, sourced fact, and does R open it only on roads?**
drift lines == own interval recompute; grade stretches == own chord recompute on the profile + own ATJ lookup; sign counts == own DB
query; text export == DOM lines; R on road → report, R on Duplex → §ROOM_CYCLE (report absent); environment line NOT CHECKED;
RED control (threshold change flips a line's severity).

### §MEM_GROWTH ▶ RESUME HERE (M4-A) — written 2026-10-08 for the next session
**Where this spec lives:** bim-compiler branch `fable/meshdb-livewire` (NOT yet on `master`) — read this file from that branch.
**Status:** spec only, zero code. User asked "can u safely do M4 first without impact to the other Road sign session?" —
checked, answer YES (below). User then parked it for a new session. No go yet to run anything.

**Safety check already done (2026-10-08, bim-ootb `origin/main` @ `5941ada4`) — don't redo, re-verify only if main moved on these files:**
- Road-sign lane (PRs #1937–#1945, last `fix/speed-disc-top-board`) edits `viewer/speed_zones.js`, `civil_sections.js`,
  `road_standards.js`, `std_values.json`. M4 edits `viewer/import_db_builder.js` + the save path in `viewer/scene.js`
  (§MESH_SLIM_SAVE, `:908`). Shared files only `sw.js` / `viewer.html` (version bumps) → CLAUDE.md rule: keep both, higher version.
- Data: speed discs read board geometry through the index (`speed_zones.js:420`, `I ? I.count : P.count`) — a weld keeps the
  same triangles and positions, so board bbox/face is unchanged.
- ⚠ Also check `viewer/silhouette_refine.js` (`SilhouetteRefine.refineGeometry`, called at `scene.js:~2263` on every geometry):
  its gate may read vertex sharing (weld ratio). Confirm a welded civil geometry does not newly qualify — log it.

**Steps (in order):**
1. `git -C ~/bim-ootb worktree list` → reuse or `git worktree add /tmp/wt-m4-weld origin/main -b feat/m4-vertex-weld`.
2. Write `scripts/probe_vertex_weld.js` (node + sql.js, NO browser, NO GPU): open a **copy** of the DB (never the original),
   per `component_geometries`/`base_geometries` row: decode `vertices`/`faces` exactly as `A.blobToGeometry` does (copy its
   decode, cite lines), weld by (position ε, face normal) per the Phase A rule, re-encode. Log per run:
   `§VERT_WELD rows= vertsBefore= vertsAfter= dbBytesBefore= dbBytesAfter= maxNormalDeltaDeg=` (must be 0 within float),
   plus the top 10 classes by verts saved (expect lamp poles). 0 rows → `INCONCLUSIVE`.
   Input DBs (local, `~/Downloads/JALAN JELAPANG IFC/`): `CivilWorksPath.db` 463 MB (current), `JELAPANG.db` 396 MB.
3. Read the log. If the saving is real, wire the same weld into import (`import_db_builder.js` beside `§MESH_SLIM_IMPORT`,
   `:100-115`) and save (`scene.js` beside `§MESH_SLIM_SAVE`), civil-gated via the existing owner `A.isCivilModel()`
   (`streaming.js:321`). One weld function, shared by probe + both paths (no second implementation).
4. Fleet probe (read-only, same script) over the building DBs → decide buildings in/out (spec M4 "Buildings").
5. ⛔ ASK THE USER before the browser reload witness (heap MB + load ms before/after) — it runs a headless browser on the GPU
   (MEMORY: no autonomous bakes/GPU; headless beside a live bake crashed the user's tab once).
6. PR, mark `✅ DONE (witness)` here with the § numbers. Phase B (smooth poles) stays ⛔ on the user's look ruling.

