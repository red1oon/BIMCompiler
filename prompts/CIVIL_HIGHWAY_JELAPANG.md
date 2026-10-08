# CIVIL_HIGHWAY_JELAPANG — civil-works (highway) IFC through the viewer · CONSOLIDATED 2026-10-08 (2nd pass)

```
# ⚠ DO NOT REMOVE
SCOPE: civil/linear IFC sets ("Civil Works", IFC2X3 Civil 3D export) in the viewer + next the Modeller, WITHOUT changing building behaviour.
Spec → code → witness, one item at a time. Code lives in bim-ootb; work in a /tmp/wt-* worktree off origin/main, prune it when pushed.
READ THE LOG after every run — §-lines are the evidence, never a look. Headless runs on the REAL GPU need the user's go (GPU=sw CPU is fine).
ON SCREEN / IN FILMS: never the word "JELAPANG" — say "Civil Works" (memory feedback_no_jelapang_name_in_outputs).
Full history: prompts/archive/CIVIL_HIGHWAY_JELAPANG_full_2026-10-08b.md (this file before this pass) and …_full_2026-10-08.md (before that).
```

## ▶ RESUME — NEXT SESSION: the Modeller reuses the SAME engines ("same ARC", user 2026-10-08)
**Goal:** road-works in the Modeller (§MODELLER_ROADWORKS below: parts from Civil Works placed on the Bonsai PDF-terrain point cloud,
then cut/fill) built on the engines already shipped in the viewer — import, chainage, standards, report. Reuse them; do NOT write a second
chainage, profile or rule engine in the Modeller (one implementation per responsibility).
**Read first, in order:** the OWNERS table just below → §MODELLER_ROADWORKS → memory `project_modeller_assemble_handoff_strategy.md` →
`prompts/TERRAIN_MIGRATION.md` (terrain port spec). Then write the spec section here before any code.
**First questions — answer by reading code, not by asking:** can `chainage_grid.js` / `road_report.js` / `speed_zones.js` /
`road_standards.js` load in the Modeller page as-is? They take `A` + `A.db`; list every `A.*` they call that the Modeller lacks
(`civilDriveRoute`, `civilProfile`, `civilRouteAt`, `isCivilModel`, `createPanel`, `ifc2three`). Where does a Modeller-placed road get its
route? (Today the route is inferred from ROAD elements, tour.js `civilRoutePath`.)

### OWNERS — the engines to reuse (bim-ootb `viewer/`)
| Question | Owner | Notes |
|---|---|---|
| Is this a civil model? | `A.isCivilModel()` streaming.js | the NON-IMPACT gate |
| Drive route / point at s | `A.civilDriveRoute()` effects.js · `A.civilRouteAt(s)` civil_sections.js | inferred from ROAD (tour.js `civilRoutePath`) |
| Road / ground / drain levels | `A.civilProfilePrepare()` / `A.civilProfile()` civil_sections.js | 1 m samples; discipline names from std_values `geometric.model_map` |
| Real chainage from markers | `A.chainage.read(std)` chainage_grid.js (`ChainageGrid.readMarkers`, `anchor`) | glyph reader; `realAt(s)`, `routeSOf(ch)` |
| Chainage TEXT anywhere | `A.civilChainLabel(s)` / `A.civilChainRange(s0, s1)` | "CH 1+152", else "N m (inferred)" |
| Sign codes vs ATJ 2A | `RoadStandards.checkSigns` road_standards.js | `_model_map` (SIGNAGE / 17_Code) |
| Speed zones, max grade, advance placement | `A.speedZones.mount` → `A._speedZones` speed_zones.js | ATJ 8/86 + 2B rows in std_values `geometric` |
| Health report | `RoadReport.build(inp)` road_report.js · `A.showRoadReport()` | sections + severities; `_road_report` cut-offs |
| Volumes | `A.earthworksVolume()` earthworks_volume.js | cut/fill vs a design surface = NEW |
All mapping and cut-offs live in `viewer/std_values.json` (editable in Settings): `_model_map`, `_chainage_map`, `_road_report`, `geometric.*`.

## ⚖ NON-IMPACT RULE — civil work must not change how existing buildings behave (user, 2026-10-05)
> User: *"note in the specs that this new CW does not impact present buildings behaviour"*

Every civil change is **gated on civil data** (CIVIL_DISCS codes from file names, a slab-less model, a site
envelope beyond building scale, or the `element_psets` table) so a building never takes the new path. Each PR
states its gate and proves it on the fleet (Hospital, Terminal, LTU_AHouse, Duplex). Gates per PR: see §SHIPPED.
A civil change that cannot name its gate and its fleet proof does not ship.

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
- §CHAINAGE_GRID #1948 (sw v1623) · witness_chainage_grid 14/14 · real chainage read from the CHAINAGE glyph solids (36 labels), ribbon/ticks/tags/hover/strip
- §CHAINAGE_EVERYWHERE #1949 (sw v1624) · speed zones + Long/Cross text via one label owner; film code untouched · chainage 14/14, speed zones 54/54 (civil_sections needs GPU=real, not run)
- §ROAD_REPORT #1950 (sw v1625) · R on a civil model (a building keeps Room Cycle) · dashboard + .txt + PDF, 5 sections · witness_road_report 12/12
- §ROAD_REPORT polish #1951 (sw v1626, auto-merge on) · witness_road_report 13/13 · grade 2 decimals at the limit, sign chainages de-duplicated, environment terms + ground/drain discipline names in std_values.json

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
**Chainage / report (2026-10-08):** reader for chainage as real text / IfcAnnotation / IFC 4.3 IfcAlignment, ahead of the glyph reader ·
ribbon/ticks/strip on INFERRED chainage when a model has no markers (labelled "(inferred)"; today nothing is drawn) · run the chainage +
report witnesses on a SECOND civil IFC set (only CivilWorksPath proven; std_values mapping was measured on it: 17_Code, (FT\d+) title,
06_No_Route, discipline names from file-name words) · witness_civil_sections after #1949 needs GPU=real (user permission) · curve radius
check (ATJ 8/86 §4.2.3) needs road-edge geometry · traffic-management 4D section for the report (EXISTING vs new lanes) · old film items
(v7 bake proof, ERP Ch4 clip, v7 assembly, Issue D, 7,612 tied instants) — status in the archive `_full_2026-10-08b` RESUME block.

## §FILM — clips (detail + scripts: FILM_NARRATION.md)
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
- **Chainage clip (DONE 2026-10-08):** `~/Videos/Chainage_from_model_letters_narrated_v2_AFTER.mp4` · `prompts/film_narration_chainage_dialogue.tsv` (FILM_NARRATION §CHAINAGE_CLIP)
- **Earthworks / Cut & Fill clip (DONE 2026-10-09):** `~/Videos/Earthworks_cutfill_narrated_AFTER.mp4` (129.65 s; silent master `~/Videos/Earthworks_cutfill_SILENT.mp4`) · user recording `~/Videos/simplescreenrecorder-2026-10-09_06.07.57.mp4` (0.5–66 s) ·
  backdrop = user's latest screenshot `06-10-27` · script `prompts/film_narration_earthworks_dialogue.tsv` · cards `prompts/film_earthworks_clip_cards.py` (FILM_NARRATION §EARTHWORKS_CLIP). Closing black card = air-horn/trucks bed + claim line + prior-art with licence fees.
  Claim wording: user said "extracted"; cut/fill is INFERRED so the card says "computed entirely from a standard IFC2X3 file … No AI. No API call."
- **PRIOR ART — cut/fill + licence fees (web search 2026-10-09, third-party/undated figures, prices vary by region; re-check before quoting outside the film):** Autodesk Civil 3D US$2,870/yr (Autodesk FAQ: autodesk.com/solutions/aec/civil-3d-subscription-faq) ·
  Bentley OpenRoads Designer US$6,057/yr Virtuoso, US$15,142 perpetual (G2 pricing page, updated 2026-03-25: g2.com/products/openroads-designer/pricing) · Trimble Business Center Intermediate US$2,865 / Advanced US$4,405 per licence (reseller listings, billing basis unclear; csdsinc.com / cansel.ca) ·
  12d Model "open price" (quote only) · Novapoint no public price found (only a 2005 trade figure). All compute cut/fill from their own design surfaces; ours infers from the exported IFC alone, in the browser.
- **Road Report clip (DONE 2026-10-08):** `~/Videos/Civil_Works_Road_Report_narrated_AFTER.mp4` · `prompts/film_narration_road_report_dialogue.tsv` (§ROAD_REPORT_CLIP);
  closing black card carries the air-horn/trucks bed + the prior-art line in the allowed wording.

## Current specs (condensed — specs as written + measurements in the archive)
**§CHAINAGE_GRID** — the CHAINAGE solids are 3D text with no name/pset/text (332 solids → 36 labels: mainline 0+000…2+200, arms J1A×3
J1B×2 J2A×5 J2B×3). Reader: cluster pieces → text angle = thinnest strip → split characters → IoU vs browser sans glyphs (several faces)
→ grammar `[PREFIX ]NUMBER` picks orientation and word split. Station = where the label's text line crosses the drive route (labels stand
36–113 m beside the road). Route check per interval (12 OK / 9 DRIFT, worst 0+500→0+600 −11.5 m). Grid: 20 m ticks, 100 m major, tags,
hover chip, bottom strip (drag = fly). Witness `witness_chainage_grid.js` (RED: delete one glyph → run check fails).
**§CHAINAGE_EVERYWHERE** — one label owner; speed zones + Long/Cross use it; markers read once after a civil load (`§CHAINAGE_AUTO_READ`).
No markers → every readout shows "N m (inferred)", the report marks drift NOT CHECKED, and no grid is drawn (see OPEN).
**§ROAD_REPORT** — R / Inspect → Road report. Sections 🗺️ Alignment & Drift · ⛰️ Earthworks · 🚧 Geometric Health · 🚦 Signs · 🌱 Environment;
CRITICAL / WARNING / HEALTHY / INFO / NOT CHECKED; every line = chainage + measured value + rule + source; Copy / .txt / PDF (same lines).
Live run on CivilWorksPath: CRITICAL 4 · WARNING 25 · HEALTHY 5 · INFO 1 · NOT CHECKED 5; worst grade 11.4 % vs 3 % (ATJ 8/86 Table 4.10D).
Witness `witness_road_report.js` (drift / grade / earthworks recomputed independently, txt + PDF == dashboard, R on Duplex → Room Cycle).
**What a different civil set needs** (told to the user 2026-10-08): markers as plain sans 3D letters written square to the road; disciplines
from file-name words (CIVIL_DISCS); pset names per the JKR DAK template — else edit the std_values mapping. Not yet proven on a second set.

## §PRIOR_ART_ROAD_STANDARDS — passing web search (2026-10-08, 4 searches; user: "run that prior art search … black card at the end of the film, no voice")
Found SEPARATELY (each covers a part): Autosign (CGS Labs, https://cgs-labs.com/autosign/) — sign/marking DESIGN with national sign
libraries, IFC export (places signs; does not check an existing model) · FHWA IHSDM (https://www.fhwa.dot.gov/publications/research/safety/17098/17098.pdf)
— design-consistency vs speed, desktop, US · IfcOpenShell IfcTester / IDS (FOSS) — property checks if someone writes the spec; no road-sign
spec ships · Solibri — paid rule checking, IFC 4.3 support "initial" · research: ontology BIM compliance (ScienceDirect S0926580524003923),
TUM thesis IfcOpenShell road traffic safety (mediatum 1689801) · Malaysia: JKR-referenced BIM libraries (UiTM 28752), no automated ATJ
road-standards checker found.
NOT FOUND TOGETHER: JKR ATJ 2A/2B/8 rules extracted with page refs + checked on an existing IFC road + in the browser, editable, no install.
Claim wording allowed: "a combination our search did not find elsewhere (8 Oct 2026, passing search)" — never "the only one" / "first".

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

## §INSPECT_EARTH_ROAD — INFERRED cut/fill + 4D, and road-marking overlay (spec 2026-10-09, user; NOT started)
> *User 2026-10-09:* infer cut/fill from the single model; infer the 4D schedule + resources for it; engineers may later correct the JSON
> when given the original topology. Apply the JKR marking formula to the model and save it back to the DB as our overlay. Both live under
> Inspect → "Earthworks" and "Roadworks" extras. Civil-gated (`A.isCivilModel()`); VACUOUS on Duplex/Hospital/Terminal/LTU_AHouse.
**Measured on CivilWorksPath.db (2026-10-09):** disciplines ARC 826 · CHAINAGE 332 · DRAINAGE 200 · EARTHWORK **1** · GABION 11 · GEOTECH 9145 ·
LIGHTING 216 · MARKING **90** · PLB 2062 · ROAD 4008 · ROW 1 · SIGNAGE 138 · STR 1851. IFC2X3 → no IfcEarthworksCut/Fill, no alignment entity.
MARKING = 90 `IfcBuildingElementProxy` named `IfcBuildingElementProxy_<n>`, psets = project info only (no line type/width/direction); only
discriminator is surface colour: 79 black (597,365 tris) + 11 yellow (12,595 tris). **R1 step 0 MESH-CONFIRMED (2026-10-09; scratch script welds verts at 1 mm, splits connected components, float32 verts / uint32 faces, rotation all 0):**
- **Black ×79 elements → 3,686 pieces.** (a) **58 long pieces (30 elements), 268–698 m, continuous, no 4.5 m stroke / 7.5 m gap signature anywhere** (no dashed lane lines).
  Solid prisms (top = bottom area, checked: up 76.7 m² = down 76.7 m²) so strip width = planarArea / 2 / length = **≈0.155 m (0.308–0.327) and ≈0.20 m (0.397)** → matches ATJ 2D/85 §3.3.1.3
  edge lines 150/200 mm. NOT a double line as a single piece (0.325 m would need 2×100+125 mm; a pair of adjacent pieces is untested). (b) **3,622 small pieces** 0.3–2 m
  (clusters 0.4×0.3 m, 0.9×0.8 m, 2.1×2.0 m; height 0.02–0.15 m) → NOT line strokes; kind unproven (studs/RRPM? glyphs? arrows?).
- **Yellow ×11 elements → 132 pieces:** repeated shapes (≈14.3×11.4 m bbox, 21 m² each ×~60; ≈10×2.9 m; ≈11×1.3 m), one 44×38 m, up to 0.7 m high → area-type markings (hatching/
  chevron/gore?), NOT continuous lines. Kind unproven.
- **Consequence:** the model has edge-line runs but NO readable centre/no-passing line → a centre-line check would be NOT CHECKED, and the REQUIRED no-passing zones (R1 compute) would be
  an overlay for markings the model does not carry. Still open: do two long pieces run 125 mm apart (double line)? where do the long runs sit relative to the route (edge vs centre)? what are the 3,622 small pieces?
**Rule for both:** every inferred row is labelled `INFERRED`, carries its sample count + source, and never overwrites model data. Engineer edits
set `status=engineer` and win over `inferred`.
### E1 — cut/fill bands by chainage (inferred, crude)
- Per station: `d = roadTop − existingGround` from `A.civilProfile()` (ROAD vs GEOTECH/ground series; datum already shared in the profile).
  `d > +tol` FILL · `d < −tol` CUT · else AT-GRADE; `tol` in `std_values.json` (`_cut_fill.tol_m`, editable, SUGGESTED label).
- Volume per band = average-end-area of `|d|` × (road width + side slopes) × length — reuse the `A.earthworksVolume()` bounded-mesh math where it
  applies; no second volume engine.
- Confidence per band = ground sample count; windows < 30 samples (2 of 5 today, line 138) are labelled `FLAT-ASSUMED`, never presented as measured.
- Caveat stated in the panel: EARTHWORK/GEOTECH may be the FINISHED ground, not original terrain → bands are a guess until the engineer supplies topology.
- Output JSON `earth_bands`: `[{ch_from, ch_to, kind, mean_d_m, vol_m3, samples, source, status}]`; engineer edits the same JSON (kind/volume/boundaries).
- Witness `witness_cut_fill_inferred.js`: `§CUT_FILL_INFERRED bands= cut= fill= atGrade= flatAssumed=`; recompute 3 stations independently; RED control
  (lift road +0.5 m → bands flip as computed); engineer-edit round-trip (edit a band → totals + 4D change by the asserted amount); Duplex VACUOUS.
### E2 — inferred 4D schedule + resources for the earthworks
- From E1 bands: one task per band (cut = excavate + haul, fill = import/place + compact), ordered by chainage, durations = `vol_m3 / output_rate`.
- Output rates + crews need a CITED source (§L): candidates already on disk `rates/` (DBKL JKH1 roadworks, Selangor JKH) — transcribe with page refs
  before calling any rate `primary`; until then `SUGGESTED`. No invented rate.
- Replaces count-based earthworks duration (OPEN line 130) only for civil models, only where bands exist; one owner for CHAINAGE/ROW exclusion (line 130) first.
- Resulting schedule JSON is adjustable by engineers (same edit path as E1); Gantt edit → witnessed per PRIMAL LAW §2.
- Witness `§EARTH_4D tasks= totalM3= totalDays= rateSource=`; NOT CHECKED if no rate source.
### R1 — road-marking formula (JKR) applied to the model, saved as overlay
Limits go in `std_values.json` `_sight_zones` / `_markings` with standard + clause/table + source-status; NO JS constants. Transcribed from the files on disk:
| Rule | Value | Source |
|---|---|---|
| Min stopping sight distance | 120→250 · 110→220 · 100→185 · 90→160 · 80→130 · 70→105 · 60→85 · 50→65 · 40→50 · 30→35 m | ATJ 8/86 §4.1.2 Table 4.1 (p.36) |
| Min passing sight distance (2-lane 2-way) | 120→775 · 110→730 · 100→670 · 90→615 · 80→540 · 70→485 · 60→410 · 50→345 · 40→270 · 30→200 m | ATJ 8/86 §4.1.4 Table 4.4 |
| Object heights | 200 mm (stopping) · 1330 mm (passing) | ATJ 8/86 §4.1.5 |
| No-passing line | double unbroken, or unbroken+broken (near-side overtaking) at vertical/horizontal curves where passing SD is short | ATJ 2D/85 no-passing zones (p.14) |
| Min no-passing marking length | ≥ 120 m (extend at the start); gap < 30 m below-min SD → no unbroken line; successive zones < 120 m apart → join | ATJ 2D/85 no-passing zones (p.14) |
| Line widths | centre/lane 100–150 mm; double line gap 125 mm; edge 150/200 mm; transition 200 mm; stop line 300 mm | ATJ 2D/85 §3.3 |
| Lane line stroke | 4.5 m stroke / 7.5 m gap (rural, 150/100 mm) | ATJ 2D/85 §3.3 |
| RRPM colour/spacing | centre + no-passing yellow; lane + edge white; 12 m on curves, 24 m straight | ATJ 2D/85 §4.5.4 Table 4.2 |
- **Compute:** available passing sight distance along the chainage from route plan curvature + `A.civilProfile()` crest geometry (driver eye 1050 mm; object 200 mm stopping / 1330 mm passing, ATJ 8/86 §4.1.5) vs the speed-zone limit (`A._speedZones`) → REQUIRED no-passing intervals (apply the 120 m / 30 m rules above).
- **Read the model's existing MARKING** by geometry only (strip count/gaps/colour) after establishing what the 79 black + 11 yellow elements are (first step, one query).
- **Overlay:** write REQUIRED markings back to the DB as our own table (e.g. `civil_overlay`: kind, ch_from, ch_to, line_type, width_mm, colour, source clause,
  status `inferred|engineer`), NEVER into `elements_meta`. Delivered as a `patches/*.sql` + self-heal loader pair (DB-CHANGES rule), not a binary.
- **Compare:** required vs present → mismatch rows `[SEVERITY] CH range: measured — rule (source)` in Road Report ("Roadworks" section); MARKING absent/unreadable → NOT CHECKED.
- Witness `witness_road_markings.js`: `§ROAD_MARKINGS intervals= requiredNoPassing= presentMarkings= mismatches= overlayRows=`; SSD/PSD recomputed at 3 stations independently;
  RED control (shorten sight distance → a no-passing interval appears); overlay round-trip (save → reload DB → same rows); Duplex VACUOUS; no alignment/marking → NOT CHECKED.
### BLOCKED-ITEM RESULTS (2026-10-09)
**E2 duration — STILL BLOCKED (measured: no productivity source on disk).** `rates/` holds PRICE rates only. `DBKL_JKH1_Roadworks_resurfacing` (resurfacing in KL, not highway bulk earthworks):
1-3-1 excavate to formation level m² 7.00 · 1-3-3 quarry-dust fill ≤1.5 m deep m³ 8.55 · 1-3-4 soft-patch excavate+backfill m³ 142.50 · 1-4-2 break-up pavement m³ 30.40 ·
4-1-1 hot thermoplastic markings (edge/centre/continuous) m² 34.00 · 4-1-2 arrows/alphabets m² 38.00 · 4-1-3 preformed m² 109.25 · 4-1-9 road stud no. 45.50 · 4-1-10 delineator no. 18.00.
`Selangor_tender_JKH_Perabot_Jalan_2023-09` has day rates (Hari) for plant/labour = cost per day, NOT m³ per day. No m³/day or m²/day anywhere in either file (grep'd).
→ E2 splits: **E2a COST (unblocked, partial):** price fill m³ and markings m² from the cited items above, `SUGGESTED`, resurfacing context stated; there is NO bulk cut-to-spoil/haul m³ rate (1-3-4 is a soft-patch repair rate, wrong item). **E2b DURATION (blocked):** needs a cited crew-output source
(user to name one: JKR schedule, CIDB, or a contractor output table); until then the generated tasks carry `duration=NOT SET`, never an invented figure.
**RRPM check — DROPPED (measured, not supported).** The 3,622 small black pieces: nearest-neighbour spacing within an element p5/25/50/75/95 = 0.6/0.6/2.0/3.8/7.2 m (clusters at 1–2, 4, 7 m), NOT the 12 m (curve) / 24 m (straight)
of ATJ 2D/85 Table 4.2; tri counts 12–44 (box-like, 641 at 20), median 50 pieces per element over 48 elements → clustered, glyph-like fragments (text/arrows/symbols) not a studded line. Kind still unproven;
do not build a stud-count check from this data. Road-stud pricing (4-1-9) stays available for a REQUIRED-stud overlay if ever wanted.

**Follow-up 2026-10-09 (user "Go"):**
- **Small black pieces re-measured by rasterising one dense 6×6 m window at 10 cm (own script, no human look):** they form **two straight dotted rows of ~0.4×0.3 m blocks** (pitch ≈0.5–1 m), NOT text/arrow glyphs —
  this CORRECTS the "glyph-like" guess above. Dotted-row kind still unproven (candidates to test: transverse speed-reducing bars ATJ 2D/85 / rate item 4-1-5; junction guide dots); measure row length, orientation vs route, and
  block pitch across all 48 elements before naming it. Still not RRPM (spacing ≠ 12/24 m).
- **E2b duration source — 2 web searches (JKR earthwork output; CIDB output norms): NO citable JKR/CIDB m³/day or m³/h table found.** Only non-Malaysian/unofficial figures (Indonesian cut-and-fill studies ≈12–200 m³/h machine-dependent;
  a UAE forum 28 m³/h for 0.5 m³ bucket) — not `primary`, NOT adopted. Leads, unread: CIDB labour-output report for building works (KL/Selangor/N.Sembilan, 2006/07 — building, not earthwork); UTM production-rate database papers
  (Idrus, Zakaria et al., MATEC BUST 2013 04002/04003). → E2b stays `duration=NOT SET` until the user supplies a document (JKR Analisa Harga / SoR, or a contractor output table) into `rates/`.

**USER RULINGS 2026-10-09 (supersede the items above where they differ):**
1. **Markings / no-passing (R1) = DEFERRED, not dropped.** JELAPANG is a separated two-way highway (divided carriageways) → no centre or no-passing line is required, so the missing centre line is CORRECT, not a defect.
   R1 compute (PSD, no-passing zones, overlay, ATJ 2D/85 centre-line rules) waits for a single-carriageway road. What still applies on a divided highway: stopping sight distance (ATJ 8/86 Table 4.1), curve radius (Table 4.5),
   edge-line audit (the measured 0.155/0.20 m solid runs ARE the expected marking). Rows/columns above that mention "required no-passing" are dormant until then.
2. **E2 rates = the building rate JSON, not a new source.** Measured in `bim-ootb/viewer/rates/`: pack `cidb2024_my.json` (CIDB N3C 2024, RM) and owner-editable `custom_template.json` share one schema
   (`labor`, `equipment`, `equipment_allocation`, `work_packages`…); owners copy + edit it (loaded via `loadRateTemplate`, rates.js). Existing entries are per-ELEMENT productivity (elements/crew-day by IFC class) +
   RM/day: **LABORER RM 95/day, crew 1, NO productivity map** (cidb2024_my.json); no earthwork class, no m³/day anywhere in the pack.
   → E2 prices the bands with the existing day rates (LABORER + the pack's equipment day rates) and adds ONE new productivity key for earthwork bands (m³ per crew-day) to the schema; the shipped value stays EMPTY
   (a placeholder is invented data) → `duration=NOT SET` until the project owner fills it in their copy of the JSON. The engineer edit path for E1 bands and this key is the same JSON. Gate: the key must be read by
   `schedule_author.js _installSecs` (single formula owner, 4D_MODEL_INTEGRITY §I) — not a second duration formula.

### E2c — earthwork plant + clearing speed (user 2026-10-09: excavators/trucks join the equipment list; 4D clearing speed = editable default)
Applies to the rate JSON schema (`equipment`, `equipment_allocation`, `labor`; same owner-editable copy as ruling 2 above). New entries, added to `cidb2024_my.json` + `custom_template.json` + any pack that is to be used for civil:
| Key | Meaning | `rate_per_day` | Provenance |
|---|---|---|---|
| `EXCAVATOR` | cut / load | **null** — no sourced RM/day on disk (DBKL/Selangor have none for excavators) | owner fills; cost shows NOT SET until then |
| `DUMP_TRUCK` | haul cut to fill/spoil | **null** | owner fills |
| `BULLDOZER`, `COMPACTOR_ROLLER` | spread / compact fill (proposed, user said "expand the list") | **null** | owner fills |
| `LABORER` (existing) | ground crew | RM 95/day crew 1 (cidb2024_my.json) | reuse as-is |
Clearing speed, one editable block per template (`earthwork`), every field carrying `source` + `status` (`default-placeholder` until the owner edits it):
- `excavator_output_m3_per_h` — default **20.95**, status `default-placeholder`, source = a published Indonesian cut-and-fill study (Damara Village, Bali; figure taken from a search summary, paper NOT opened, NOT a JKR/CIDB value) — present in the UI as "suggested, replace with your fleet's".
- `shift_hours` default 8 (matches `_productivity_basis_secs: 28800`), `efficiency_factor` default **empty** (not invented; blank = 1.0 and labelled so), `haul_distance_m` default **empty** (comes from mass haul / owner).
- Derived (no new formula owner): band duration → feeds `schedule_author.js _installSecs` as a quantity-based rate (m³ / (output × shift_hours)); trucks needed = excavator output ÷ (truck_capacity_m3 × trips_per_h), trips_per_h from `haul_distance_m` — NOT SET while those fields are empty.
- A tooltip/§-line must print the active values and their `status` (`§EARTH_RATE output= shift= eff= haul= status=`) so a 4D duration is never silent about being a placeholder.
- Witness: change `excavator_output_m3_per_h` ×2 in an owner copy → every earthwork band duration halves (asserted), Gantt bars + total span change, JSON round-trips.

**E2c addendum (checked against origin/main `rates.js SEQUENCE_CIVIL` + `rates/4D_template_civil.json` v0.4.0, 2026-10-09):** the Time Machine ALREADY runs a civil programme: Ground Treatment → Earthworks → Drainage / Slope Protection →
Pavement → Road Furniture → Signage → Road Lighting → Road Marking (order from a secondary source, JKR method statements; primary JKR/SPJ/2008 not read). Gaps: (1) **Pavement is ONE phase** (crew `CIVIL_PAVING` = MASON params,
uncalibrated, per-element duration) — no sub-base / base / binder / wearing-course layers, no spread-and-roll/tar tasks; (2) Earthworks is one crew `CIVIL_EARTHWORKS`, count-based; (3) **calendar conflict:** the civil template runs
`hours_per_shift 24, days_per_week 7` (standing user ruling rates.js SHIFT_HOURS) while E2c above defaults `shift_hours 8` → E2c must READ the template calendar, not carry its own shift length (one owner). Plant (EXCAVATOR, DUMP_TRUCK,
BULLDOZER, COMPACTOR_ROLLER) attaches to the existing `CIVIL_EARTHWORKS` / `CIVIL_PAVING` trades in `equipment_allocation`. Pavement-layer split = future spec item (needs a cited layer sequence + the model's ROAD elements carry no layer info —
MAINLINE/ROAD J2A etc. only).

### E3 — civil programme corrections (user 2026-10-09: "correct those, and if there is sequence conflict, apply CPM"; spec only, nothing built)
Corrects the three gaps in the E2c addendum. Owners unchanged: duration = `schedule_author.js _installSecs`; sequence/solve = `cpm_schedule.js` (ONE dependency DAG, Kahn pass; edges E1 support · E2 host/open · E3 discipline · E4 storey — header read
2026-10-09); phase/trade = `rates.js SEQUENCE_CIVIL` + `rates/4D_template_civil.json`. No second scheduler.
1. **Sequence-conflict rule (applies everywhere below):** the template phase order is only the DEFAULT predecessor list. Where it disagrees with an element-level edge (support / host / chainage flow), the **CPM edge wins** and the
   solved start/finish is what the Gantt shows; the template order is not re-imposed after the solve. Each overridden default is logged `§CIVIL_SEQ_OVERRIDE phase=A->B reason=<edge type> n=` (never silent). Known live case to re-test:
   Issue D, backwards CH 10 Ground Treatment bar (line 131).
2. **Pavement split into layers** (replaces the single `Pavement` phase / `CIVIL_PAVING`): Subgrade preparation → Sub-base → Road base → Prime/tack coat → Binder course → Wearing course. Layer names/order = **secondary**
   (JKR flexible-pavement practice from general knowledge; JKR Standard Specification for Road Works JKR/SPJ/2008 NOT read) → labelled `SUGGESTED`, owner-editable in the template JSON. The model's ROAD elements carry no layer (names MAINLINE / ROAD J2A… only),
   so layer tasks are generated PER CHAINAGE SEGMENT of the road surface, quantity = segment road area (m²), not per-element. Plant on the layers: BULLDOZER/GRADER spread, COMPACTOR_ROLLER roll (E2c list), paver + tar for binder/wearing —
   `rate_per_day` null, output m²/crew-day key EMPTY (owner fills, `duration=NOT SET`), same rule as E2b.
3. **Chainage flow (the civil analogue of CPM E4 "storey"):** segment i of layer k starts after (a) segment i of layer k−1 finishes (FS) and (b) segment i−1 of layer k finishes (FS, same crew). Segment length = `_cut_fill.interval_m`
   (editable, default 100 m, same as E1 bands). Earthworks band i (E1) precedes sub-base segment i. CPM solves the pipeline; critical path is reported by CPM, not recomputed.
4. **Calendar:** civil durations read `4D_template_civil.json calendar` (24 h × 7 d today) via the one existing reader; no shift length elsewhere. `witness_civil_phase.js` re-run after each step (10 green / 12 red / 2 inconclusive on main per
   4D_MODEL_INTEGRITY line 2927 — re-measure, don't assume).
5. **Witness `witness_civil_pavement_layers.js`:** `§CIVIL_LAYERS segments= layers= tasks= overrides= criticalDays=`; assert (a) every layer-k segment starts ≥ layer k−1 same segment finish, (b) flow edge i−1 holds, (c) editing one layer's output key
   changes the CPM finish by the asserted amount, (d) template order contradicting an element edge is overridden and logged (RED control: inject a reversed edge), (e) no civil elements → VACUOUS (building programmes byte-identical, NON-IMPACT rule).

### E4 — resource caps (user 2026-10-09: "crew can grow as schedule dictates; constraints planned later on the JSON and the Timeline injection engine, equipment AND human"; spec only)
- **Default for civil = UNCAPPED:** crews and plant units grow to whatever the CPM-solved schedule needs; the programme length is set by logic + durations, not by headcount. (Building trades keep today's `max_crews` /
  `MAX_CREWS_DEFAULT` 3 — NON-IMPACT rule; civil trades `CIVIL_EARTHWORKS`, `CIVIL_PAVING` etc. read `max_crews: null` = no cap.) Uncapped must still be VISIBLE: a resource histogram per trade/plant
  (`§CIVIL_RESOURCE_PEAK trade= peakCrews= peakUnits= atDay=`) so an unrealistic peak (e.g. 40 rollers) is reported, not hidden.
- **Caps live in the rate JSON, owner-editable, filled later:** human = `labor.<KEY>.max_crews` (exists, §CREW-CAP) · plant = NEW `equipment.<KEY>.max_units` (EXCAVATOR, DUMP_TRUCK, BULLDOZER, COMPACTOR_ROLLER, paver…). Empty = uncapped.
  Optional later: per-phase / per-period caps (e.g. fleet hired from day N) as a `resource_calendar` block — not specced here, only the slot is reserved.
- **Enforcement = the existing crew-leveling pass, not a new scheduler:** `cpm_schedule.js` §S6_CREW_PASS (ES = max(crew-slot availability, in-edges)) already levels human crews; the plant cap is the SAME pass keyed by equipment unit
  (a task needing an excavator takes a free unit slot or waits). The Timeline injection engine (`schedule_author.js` materialize/inject path) only receives the leveled result and writes the bars — it does not level.
  Overridden defaults/waits logged `§RES_CAP_WAIT resource= task= waitedDays=`.
- **Witness `witness_civil_resource_caps.js`:** (a) uncapped run → `§CIVIL_RESOURCE_PEAK` printed and equals an independent sweep of the bars' overlap; (b) set `EXCAVATOR.max_units=2` → no instant has >2 excavator tasks (asserted), project finish moves
  later by the CPM-computed amount; (c) same for `max_crews`; (d) caps empty → byte-identical to uncapped; (e) building models unchanged (VACUOUS for civil caps).

### E5 — cut / fill colouring + shrinking blobs in the 4D (user 2026-10-09: "cut orangy, fill greenish; expands the long earthworks bar that runs minus days before Day 0; the two blobs contract until Day 0 = works completed; easy visual rather than sophisticated apps"; spec only)
**Reading of the ask (ONE assumption to confirm: "blobs" = a cut blob and a fill blob drawn in the 3D/4D view, sized by remaining volume):**
1. **Gantt:** the single Earthworks bar is split into its E1 bands → each band is a sub-bar coloured **CUT = orange, FILL = green** (defaults `rgba` in `std_values.json` `_cut_fill.color_cut` / `color_fill`, SUGGESTED, owner-editable —
   same rule as every limit/colour: no JS constants). Bars keep their CPM-solved dates (E3); earthworks that finish before the programme proper start at negative day-offsets, as today — the split does not move them.
2. **Blobs:** two shapes, one per kind, in the view with the same two colours. Size = REMAINING volume at the playhead: `remaining_kind(t) = Σ_bands vol_m³ × (1 − progress_band(t))`, `progress_band` from the band's own bar
   (0 before start, linear to 1 at finish). At playhead ≤ first earthworks start: full size; as the playhead advances toward Day 0 the blobs contract; **at the last earthworks finish (≤ Day 0) both are exactly 0** → "works completed".
   Scale rule (so size means something, not decoration): blob volume ∝ remaining m³ (cube-root on the linear dimension), with a fixed reference = the TOTAL cut / TOTAL fill, so the cut and fill blobs are visibly comparable to each other
   (mass-haul balance at a glance; unequal blobs = import/spoil).
3. **Data owner:** bands come from E1 (`earth_bands` JSON, engineer-editable); an engineer edit of a band's kind/volume/dates changes the colours, the blob sizes and the CPM bars together (one JSON → three projections).
   No E1 bands (no ground / vacuous) → NOT CHECKED, plain Earthworks bar as today. Civil-gated; building programmes untouched.
4. **Why this and not a heavier visual:** it re-uses the existing Gantt bar renderer + a pair of primitive meshes; no new viewer engine. Per PERF BUDGET: two blobs = a few hundred vertices, state the count in the `§` line.
**Witness `witness_earth_blobs.js` (numbers, not looks):** `§EARTH_BLOBS bands= cutM3= fillM3= colourCut= colourFill=`; at 5 playhead times assert `blobScale_kind(t)` equals an independent recompute of the remaining-volume formula;
assert `colourCut`/`colourFill` equal the `std_values` tokens and differ from each other and from every other phase colour; assert both scales == 0 at/after the last earthworks finish and == full at/before the first start; RED control:
edit one fill band's volume ×2 in the JSON → fill blob's full size ×2^(1/3), CPM duration changes by the E2c amount, Gantt colour unchanged; Duplex → VACUOUS.

### E6 — Inspect entry points: EW and RW icons + panels (user 2026-10-09: "3D on canvas where the EarthWorks feature calculates and injects into the DB; EW and RW icons on Inspect; panels list features pending except cut and fill []"; spec only)
- **Two new Inspect icons, civil-gated (`A.isCivilModel()`; hidden/VACUOUS on buildings), same icon/pill conventions as the existing Inspect items:** **EW** (Earthworks) and **RW** (Roadworks). Each opens a panel listing its features
  as rows `name · status · [ ]`. Only features with a witness-passing implementation are enabled; the rest are shown greyed `PENDING` with the spec section id (no hidden features, no fake buttons).
- **EW panel:** `Cut & Fill [ ]` = the ONE live feature to build first (E1 bands + E5 colours/blobs; the `[ ]` is its on/off toggle — assumed reading of "cut and fill []", default OFF so nothing draws until chosen).
  Pending rows: E2 cost · E2b duration (needs owner-filled output key) · E2c plant list · E4 resource caps · mass haul.
- **RW panel (all PENDING at first):** sight-distance row (SSD) · curve radius · edge-line audit · road-furniture audit (F1) · pavement layers (E3) · markings/no-passing = `DEFERRED (single-carriageway road)`.
- **Run → inject:** toggling Cut & Fill runs E1 on the loaded model and WRITES the result to the DB as our overlay (`earth_bands` rows: ch_from, ch_to, kind, vol_m3, samples, source, status — the same `civil_overlay`-style table as R1,
  never into `elements_meta`), shipped as a `patches/*.sql` + self-heal loader pair (DB-CHANGES rule). Re-open of the saved DB reads the bands back; no recompute needed unless the owner asks (RECOMPUTE button, with a `§` line saying inputs changed).
- **Blobs on the canvas:** E5's two blobs are anchored in 3D at the volume-weighted centroid of the cut bands and of the fill bands (route position at that chainage, offset to the side of the carriageway so they don't sit in the road;
  offset distance = editable default in `std_values.json`). A band click selects its chainage range. (Placement rule is my reading — confirm or give the anchor you intend.)
- **Witness `witness_inspect_ew_rw.js`:** with civil model: both icons present, panels list exactly the declared feature set (count asserted), exactly one feature enabled (Cut & Fill), pending rows carry a spec id; toggle ON →
  `§EARTH_BANDS_SAVED rows=` and a DB reload returns the same rows (round-trip); toggle OFF → blobs removed, no mesh left (vertex count back to baseline, logged); Duplex/Hospital: icons absent (VACUOUS), DOM and scene byte-identical.

**E5/E6 REVISION (user 2026-10-09, confirms toggle + centre-of-bands, then corrects the blob): SUPERSEDES E5 item 2 "Blobs" and E6 "Blobs on the canvas".**
The "blob" is NOT a free-standing shape beside the road. It is a **recolour of the existing ground-contour surface** over the likely-affected area of each E1 band: cut area tinted orange, fill area green (E5 colour tokens).
- **Target surface:** only the ground elements the profile already reads as "ground" (discipline name from `std_values geometric.model_map`; not a new mesh). **Protected, never recoloured:** ROAD, DRAINAGE, GABION, FURNITURE, SIGNAGE, LIGHTING, MARKING, STR,
  ARC/CHAINAGE (the chainage glyphs) and every other non-ground element — a hard exclusion list, asserted.
- **Footprint:** ground triangles whose chainage (route-projected) falls inside the band and within a lateral reach of the carriageway (editable default in `std_values.json _cut_fill.reach_m`, SUGGESTED; wider for cut/fill height `|d|` if
  E1 supplies it). Non-destructive: a colour override layer (same mechanism the viewer already uses for discipline/phase colours), original colours restorable; NO geometry or DB element edited.
- **Contracts toward Day 0:** coloured extent per band = `(1 − progress_band(t))` of its chainage length, receding in the direction work proceeds; fully clear when the band's bar finishes (≤ Day 0). Remaining-volume totals per kind stay in the panel.
- **Likely-area only:** where ground samples are thin (E1 `FLAT-ASSUMED`, <30 samples) the tint is drawn hatched/lighter and labelled `INFERRED` — never presented as measured.
- **Vertex budget (PERF BUDGET):** recolour only (vertex-colour attribute on ground meshes) → log `§EARTH_TINT tris= verts= heapΔ=`; no duplicated buffers.
- **Witness additions (replace the blob-scale checks in `witness_earth_blobs.js`):** at 5 playhead times, coloured ground area per kind = independent recompute of `(1−progress) × band footprint area` within ε; colours of every protected element
  hash-identical before/after (asserted, count printed); toggle OFF → all ground colours restored (hash equal to baseline); no DB `elements_meta` row changed; RED control: add a fake ROAD triangle inside a band → it stays untinted.

**E1/E5 REFINEMENT (user 2026-10-09; supersedes E5-revision "reach" wording and refines E1's classification):**
- **Cross-section rule (the user's formula, replaces point-wise `d` as the primary classifier):** at each station, take existing ground at the left and right of the carriageway vs road top.
  **Ground ABOVE road top on both sides (a slope running through the highway) → CUT. Ground BELOW road top on both sides (ground falls away either side) → FILL.** One side above, one below → SIDE-HILL (split: cut on the high side, fill on the low side).
  Within ε of road top both sides → AT-GRADE. The old `d = roadTop − ground(centre)` stays as the volume driver and as a cross-check (`§CUT_FILL_XCHECK` flags stations where the two disagree).
- **Reach default (replaces the unsourced fixed reach):** the tint spreads laterally to the **daylight (catch) point** — where ground meets the road-top level / design slope along that cross-section — capped by `_cut_fill.reach_max_m`
  (editable, `SUGGESTED`, starts at a conservative value chosen so the tint stays clear of the neighbouring roads; the OWNER tunes it, no look-test in the witness). Daylight absent (ground never meets road level inside the cap) → tint to the cap and label `CAPPED`.
  Reason it is principled and not an eyeball number: the extent follows the contour, so tinted area = the area the contours say is affected.
- **Honest labelling:** every tinted area carries `INFERRED` (from the contour IFC) in the panel + legend; engineers' edits set `status=engineer`.
- **Editable on the canvas = NEXT STEP, TBD:** user drags/reshapes a band's tinted outline → writes back to `earth_bands` (same JSON/DB overlay). Not in the first build; first build is read-only inference + JSON/panel editing. Spec stub only.
- **Feeds the 4D injection engine:** the bands (kind, volume, chainage range, status) are the quantities the 4D earthworks tasks (E2/E2c/E3) are generated from — one JSON, three projections (tint, Gantt, 5D). Positioning (fact for docs, from memory not re-verified):
  Civil 3D itself does not author a construction-schedule 4D; that is done in other tools (e.g. Navisworks / Synchro-class), so inferring bands → 4D in the browser removes a hand-off step. Do not claim more than "we generate a draft programme from the model".
- **Extractability of real cut/fill from the source (answer from memory, NOT verified against Civil 3D export settings or this IFC set):** IFC2X3 has no earthworks entities and no TIN type (a terrain can only appear as generic faceted geometry on IfcSite/proxy, no cut/fill meaning);
  IFC4.3 adds `IfcEarthworksCut` / `IfcEarthworksFill` / `IfcEarthworksElement` with `Qto_Earthworks*` quantities and tessellated geometry, but only exports what the authoring tool chooses to write — Civil 3D's own cut/fill is computed between TIN surfaces inside the app and may not be exported even in 4.3.
  → real values are extractable ONLY if the file carries them; JELAPANG (IFC2X3, measured: 1 EARTHWORK element, no earthworks psets) does not. Our inference is the fallback and is labelled as such. Check any new 4.3 file for those entity classes first (`source=ifc` per the DeepSeek-draft priority list, kept).

**BUILT 2026-10-09 (first slice, user: "build the panels and only that one feature"; fill = BLUE not green, user: avoid vegetation confusion):** bim-ootb branch `feat/ew-cutfill-overlay` @a7241ff1 (PR open, NOT merged — user does the visual test), sw v1627.
`viewer/earthworks_overlay.js` (Inspect **EW** key u + **RW** key k, civil-only rows in `panels.js`), `std_values.json _cut_fill` (station 10 m, step 3 m, reach_max 30 m, tol 0.3 m, orange `#ff8c1a` / blue `#3388ff`, SUGGESTED), `viewer/tests/witness_ew_cutfill.js` **13/13** (CUT/FILL/SIDE-HILL rule, cut volume = independent recompute, road cells never tinted, NO-GROUND not invented, daylight stop, reach cap, EW 5 pending + RW 6 pending, non-civil VACUOUS, colours).
**Deviations from spec:** (1) tint = a SEPARATE draped transparent mesh (raycast off, no `disc`), not a vertex-colour edit of the ground meshes — simpler and non-destructive by construction; protected elements are untouched trivially; (2) road cells masked by a ROAD-discipline cast per cell. **NOT built (still spec):** contraction toward Day 0 / bar progress, DB overlay save + loader (E6), canvas editing, 4D/CPM hookup, E2–E4, F1, RW features. Log lines: `§CUT_FILL_INFERRED`, `§EARTH_TINT`, `§EW_PANEL`, `§RW_PANEL`. Not verified in a live browser by me (user's visual test); `civilCastZ` ground disc = `std_values geometric.model_map.ground_discipline` (EARTHWORK).

**TM × chainage (user 2026-10-09; spec only, TM untouched):** the shipped chainage (`A.chainage.realAt(s)` / `routeSOf(ch)`, glyph-derived real CH) is the natural key for the 4D Time Machine: E1 bands, E3 pavement segments and E5 tint contraction are all addressed by chainage range, so
a task = (phase, CH from–to) instead of per-element guesses; Gantt rows read "Earthworks CH 1+200–1+300"; clicking a bar goes to the chainage (existing `A.civilGotoChainage`); the CPM flow edges (E3 item 3) run along chainage. The bands + task chainage ranges are what gets written back to the DB
as our overlay (`earth_bands`, E6; later `civil_tasks` chainage column) via the patch + self-heal loader pair — NEVER into `elements_meta`. Where drift is high (`DRIFT n m` marker) the range is shown as inferred, as the chainage grid already does.

### F1 — road-furniture audit (user 2026-10-09: reflectors / barriers already in the model → health-check rows)
**Measured (CivilWorksPath.db psets `01_Component_Name`, origin/main `road_report.js` + `road_standards.js` + `std_values.json` grep'd):** the Road Report does NOT cover any of this (no barrier/stud/post/guardrail terms
in the three files; `std_values.json` only has CHEVRON DELINEATOR as a sign). The model carries, in discipline FURNITURE: **ROAD STUD ×940** (yellow, 0.12×0.12×0.02 m discs — these ARE the reflectors; my earlier "small
black pieces ≠ studs" finding stands, they are a different thing) · **FLEXIBLE POST ×32** (0.2×0.2×0.58 m) · **NEW JERSEY BARRIER ×15** · **ROAD KERB TYP B1 ×12**; plus GEOTECH RETAINING WALL ×4, GABION MATTRESS ×11.
No W-beam/guardrail named (2 `IfcRailing` exist, discipline not yet checked).
Rows (all chainage-addressed, civil-gated, VACUOUS on buildings):
| Row | Measured | Rule / source | Status |
|---|---|---|---|
| Road-stud spacing | gaps between consecutive studs along the route | ATJ 2D/85 §4.5.4 Table 4.2: 12 m curves / 24 m straights (already transcribed above) | READY — all inputs in hand |
| Road-stud colour | yellow vs white per side | same table: centre/median yellow, edge/lane white | INFO (divided road: median side yellow) |
| Barrier coverage | m of NEW JERSEY BARRIER per chainage vs median/embankment length | needs a barrier-warrant standard (fill height / slope / curve / hazard) — NOT on disk | NOT CHECKED until a standard is supplied |
| Barrier at fill bands | E1 FILL band with no barrier within its extent | same missing warrant | NOT CHECKED (dormant until warrant + E1) |
| Delineators / flexible posts | count + spacing | ATJ 2D/85 delineator clause (transcribe) | READY after transcription |
Rule: studs spacing is a pure measurement against a cited table; barrier adequacy is NOT inferred without a cited warrant (never an invented threshold).

### Order + gates
E1 → SSD + curve-radius rows → edge-line audit → E2 (rate key owner-filled) ; R1 compute/overlay DEFERRED to a single-carriageway model. Each PR: gate statement + fleet VACUOUS proof + `§` line.
Not in scope: obstruction-based sight lines, true superelevation, original terrain TIN (not in the IFC2X3 export; engineer supplies).

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

## Reference (in the archive, one line each)
§0 source set (7 + 6 IFCs, counts, extents, psets) · §R civil rate sources (JKR SoR pending; Selangor / DBKL regional-official) · §L default
standards pack rule (cited std_values, SUGGESTED label) · §C site profile · §E industry features · §F length limits · §G / §H Navisworks parity ·
§I.2 GPS site-walk · §J 100 km roads · §K partner wish-list · §K-6.1 analyst proposal · §MC model check report · §RP road panel · FUTURE list →
all in `prompts/archive/CIVIL_HIGHWAY_JELAPANG_full_2026-10-08b.md`.
