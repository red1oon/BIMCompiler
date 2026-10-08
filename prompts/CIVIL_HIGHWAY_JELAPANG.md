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
