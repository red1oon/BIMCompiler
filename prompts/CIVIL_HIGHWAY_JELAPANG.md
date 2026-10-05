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

## ▶ RESUME HERE (consolidated 2026-10-06; full history: this file at bim-compiler `2278f7df5`)
**State:** bim-ootb main live at sw v1577. Road work so far is all merged (§SHIPPED). Current documentary: `~/Downloads/BIM_HIGHWAY_v3c_narrated_AFTER.mp4`
(127.6 s; recipe FILM_NARRATION.md §11.v3c). The user merges the partner files into the DB manually (next session works on that DB directly).
**Open, in order:**
1. **§PARTNER_DISCS build order** — the partner files now IMPORT as GEOTECH / GABION / CHAINAGE / ROW (#1886) but schedule by class (no civil
   phase). The full order (setting out → ground treatment → earthworks → drainage + gabion → pavement → finishing → marking) is on WIP branch
   `feat/civil-partner-discs`; it tipped the merged road schedule onto the CELL path (no §CPM_RUN; lamps before pavement 0 → 92, first-2 %
   lamps 16) — find which change (renumbered sequences vs group chain vs §CELL_GATE quantity) before shipping. Then: clash GEOTECH × DRAINAGE,
   4D template phases, film narration of the new disciplines. Measure on the user's merged DB.
2. **Sky mirror ghost** — still present in v3c (user). Ruled out: lamp glow (#1875), room-probe reflection (#1884), glass mirrors. Next:
   get the second, list every drawn object above the model at that frame (sky surface, ghost ground, fog, TAA/SSR history).
3. **Build order along the route** — drive-order correlation 0.30 (need ≥ 0.8); E4 loses ~4,970 of 7,685 edges to cycles through the section
   milestones (§CHAINAGE_V2). A real chainage may now come from the partner's CHAINAGE labels (332 solids).
4. **Next bake (user):** after the build-up, the finished highway night-lit, sunset → dusk / nightfall. Ghost x-ray intro needs a supported
   see-through mode (a --tap translucency stalled the bake at frame 0).
5. **Road checks:** 4 of 5 rules SPECULATIVE (road_rules.json film_status) — fix sign/marker height (road-edge level picks a higher piece) and
   lateral clearance (all 0.00 m), then flip the status with the reason.
6. Pre-existing on main, not this lane: witness_reveal_arch_hold + witness_tail_lights_all_discs throw "ARCH_BULK_CUT_FRAC is not defined";
   witness_civil_phase reports FAIL on a merged road+bridge DB (its building rule does not fit a merged model) — on main too.
**Rules learned:** bake only on the user's go; `cd /tmp/wt-x || exit` before any edit/commit in a script (a failed worktree add once let
commands commit another session's work in the shared ~/bim-ootb — undone, nothing lost); `pgrep/pkill -f` patterns can match their own
shell — match a port or PID; the CLI bake needs `--override` when the DB has no saved path (use `A.civilDriveRoute()`).

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

## §SHIPPED — all merged to bim-ootb main (2026-10-04 → 10-06)
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
  db = registered = visible (scene graph). `§DLOD_ENABLE count=19903`. So "new elements not seen" is NOT a load gap. Not yet measured:
  what covers them on screen — EARTHWORK is one opaque solid 2,539 × 2,008 × 60 m (z 29.5–89.4) and ROW one red solid
  2,071 × 1,334 × 77 m; GEOTECH piles (avg 15.6 m tall) sit inside the embankment; §CULL_SPHERE may hide long pieces.
- **Bbox view (Alt+Z / Find lens) = 587 boxes, all ARC** (`§SHELL_GHOST_BBOX boxes=587 discs=1`). Cause = `navigate_find.js`
  `_isEnvelope` (Wall|Slab|Roof|CurtainWall|Covering|Plate): VBC's STR/PLB and every civil element (all IfcBuildingElementProxy)
  are skipped; the all-elements fallback needs envelope < 2 % AND < 200 (here 587/19,903 = 2.9 %). Same on the old DBs (587/10,413)
  → not caused by the merge. Fix shape (spec, not built): decide envelope-vs-all PER BUILDING — a civil building (0 envelope
  elements) boxes all its elements. Gate: buildings with envelope ≥ 2 % unchanged → fleet identical.
- **Ground moved down 18.8 m.** `§GROUND_CIVIL civilRows=5675 → p2-bottom over all elements` → `§GROUND_Y z=32.90` (was 51.74 after
  #1849): the p2 of bottoms now lands on pile/earthworks bottoms. **User rule 2026-10-06:** *"our new ground level will be using the
  new one. Old is default in lieu of such ground terrain IFC"* → when an EARTHWORK terrain solid is present, the ground comes from
  it; the p2-bottom rule stays the default only when there is none. ⛔ Open: flat plane at which earthworks height, or hide the flat
  plane and let the earthworks solid be the ground (user's look ruling).

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
