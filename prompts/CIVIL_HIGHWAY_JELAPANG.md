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

## ▶ RESUME HERE (session closed 2026-10-05 midday — user: "wrap up … shall continue later")
**Shipped this session (bim-ootb, all live on main unless marked):** #1866 merged scene = one model (reopen streams every
building, Find scope owner A.sceneScopeBuilding) · #1867 roof-layer 16 s → 33 ms · #1868 Night/Shadow ground no longer
buries the road (civil → p2-bottom) · #1869 road lamps: head glow + mountH throw · #1870 §MESH_SLIM (civil normals not
stored/read; Save NULL+VACUUM → AFTER.db 661 → ~396 MB) · #1871 §FLY smooth route + junction stops. User verdict: "Lights and
ground shadow sun day with light distance normal fog all OK good enough."
**Open, in order:**
1. **PR #1872 §ALTC_HIGHWAY — OPEN, auto-merge on.** First CI run failed no-undef (BIN_M left in the Fly log after the
   civilRoutePath split — would have thrown → room-tour fallback); fixed + pushed (witness_civil_fly_route 4/4 after the split).
   CHECK IT MERGED. Not yet seen in a real bake.
2. **§ALTS_HIGHWAY — branch `feat/alts-highway-dusk` pushed, NO PR, ⛔ awaiting user go for the proof render.** User:
   "alt-s … more towards dusk so the street lighting can be more prominent" + "some bluish sky and orange sunset hues".
   Code: civil still → dusk mood default, sun 2° (`&duskelev=`, 0–10), sky turbidity 4 / rayleigh 2.5 / mie 0.010 / G 0.88
   (buildings keep 6° + turbidity 8). Proof needed (headless Alt+S, CPU, JELAPANG + Duplex): §ALTS_HIGHWAY sunElev, lamps on,
   sky pixel hues (zenith blue, horizon-toward-sun orange) read numerically, Duplex unchanged. User asked for Alt+S BEFORE
   Alt+C ("i mean alt-s first") — Alt+C (#1872) was built on a misread but is civil-gated, kept.
3. **User's first real Ctrl+S of AFTER.db** = the live test of §MESH_SLIM save: expect `§MESH_SLIM_SAVE normalsDropped=7419`,
   ~396 MB; `§MESH_SLIM_SAVE_ERR` = VACUUM ran out of memory (save proceeds unslimmed).
4. Not worked: §CULL_SPHERE (1,173 elements culled while on screen once DLOD engages) · §NL (b) pools beyond nearest 30 ·
   hub import (index.html) lacks rates.js → hub civil imports keep normals + own discipline list · §W.2 clash broad-phase
   (still ⛔ user go) · §MC finish (2 measurement faults, report page, MEP→Model Check button) · §RP road panel · 5D real numbers
   (regional-official rates §R.3/§R.4 + mesh-measured quantities) · Find by property on `element_psets`.
**User is obtaining:** JKR SoR 2023 · terrain/earthwork IFC from the BIM friend (unlocks ground plane, flood display, runoff,
and a true road-edge level for the sign-height rule).

**Waiting on user/partner (ask once, don't re-ask):** JKR SoR 2023 (RM 20) or CIDB N3C subscription (paid, inputs
only) · CRS code of the drawing · alignment export (IFC4.3 IfcAlignment or LandXML) · earthwork surface + drainage
pipes/structures exported as 3D · lamp IES files + wattage · JKR standard clauses · contractor's TMP phases.

**Rules learned (each bit at least once):**
- DB `center` = vertex CENTROID — never `center ± bbox/2` for a true box (§W.2).
- A witness must not share the module's assumption — judge against the RENDERER (scene matrix × geometry).
- No project values in algorithms — labels live in `viewer/civil_labels.json`.
- Bump the script tag of EVERY changed file on every page that loads it (#1847: cached worker survived #1844).
- A follow-up push to a PR with auto-merge on orphans after the squash (#1850→#1852, #1859→#1860, #1862→#1863).
  After pushing, check the PR is still OPEN.
- A new owner must be wired into every READER of the relation, not just writers (#1854 — grep every
  `matchRule(` / `rules[cls]` consumer).
- Software-GL headless plays ~1 frame / few s → sample tours with `A.tourSeek(T)`, not wall clock.
- `pkill -f <pattern>` in the same command line kills its own shell.
- Settings → Clash Rules saved overrides (`json_clash_rules`) hide new built-in rules for that user.

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

## §SHIPPED — all merged to bim-ootb main (2026-10-04 → 10-05)
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
- **§FB Find panel "loses" highway disciplines after a merge — MEASURED 2026-10-05: data intact in the DB; reopen streams ONE building, Find scoped to it.**
  User: import 6 JELAPANG IFCs → save `JELAPANG.db`; merge `IFC_MORE/` (BR1/BR2/BR3-001-002 + Jelapang VBC) → canvas OK,
  Find shows no ROAD/DRAINAGE/… → save `JELAPANG_AFTER.db` (661 MB).
  - DB: `elements_meta` GROUP BY building,discipline — AFTER keeps JELAPANG ROAD 4008 · FURNITURE 1011 · LIGHTING 227 ·
    DRAINAGE 200 · SIGNAGE 138 · MARKING 90 (= `JELAPANG.db` exactly) + new building `Jelapang VBC` PLB 2062 · STR 1851 ·
    ARC 826. Nothing lost on save.
  - Cause: `navigate_find.js:638` `buildTree()` passes `bld = A.activeBuilding`; `_buildDiscTree` (`:4093`) and the storey
    tree add `AND building = ?`. The merge drain (`streaming.js:2080-2092`, §SCENE_MERGE) streams the merged building last,
    so `A.activeBuilding = 'Jelapang VBC'` → Find lists only ARC/PLB/STR. Same scope on reopen: whichever building
    streams last owns Find.
  - Not civil-specific: any Open→Merge scene (Clinic 5-building package) has the same scoping. One-building scope came
    from City mode (one building at a time).
  - Side facts: all 4 merged files landed under ONE building name `Jelapang VBC` (multi-IFC merge = one building); the
    bridge files carry no civil word in the name → classed ARC/PLB/STR (PLB 2062 on a bridge is suspect, not read yet).
  - **CORRECTION (user reopened AFTER.db, console log 2026-10-05): the road is gone from the CANVAS too, not just Find.**
    AFTER.db holds both buildings complete — JELAPANG 5674 meta / 5674 transforms / 5674 instances / 5674 geometries;
    Jelapang VBC 4739 / 4739 / 4739 / 4739. The reopen streams only ONE: `§CENTRES_RESULT rows=2` →
    `§DS_AUTO_START bld=Jelapang VBC dist=2371m` → `§DS_QUEUED elements=4739` → `§MERGE_CONTRACT buildings=1
    rendered={"Jelapang VBC":4739} centres=2`. Cause: single-DB open calls `A.startStreaming()` (`streaming.js:3990`),
    which streams the camera-nearest building ONLY (`:304-316`). The N-building drain (`A._mergePending` +
    `_mergeStreamNext`, `scene.js:1224/1338/1346`) is filled only by a LIVE merge, never by opening a saved DB → the
    other building never streams. Find then follows `activeBuilding` = the one that streamed. The shipped §MERGE_CONTRACT
    line already showed 1 of 2 but does not flag it.
    Applies to every saved merge (Clinic 5-building package would reopen as 1 building).
  - Fix shape (not built): (1) on single-DB open with > 1 building and !CITY_URL, after `startStreaming()` push the other
    `buildingCentres` names into `A._mergePending` → the existing drain streams them (one owner, no new drain);
    `§MERGE_CONTRACT` prints `INCOMPLETE rendered=k of centres=n` when k < n. (2) Find scope below.
    Witness: open AFTER.db → rendered={JELAPANG:5674, Jelapang VBC:4739}, Find disc parents = 9.
    Original Find-only fix shape: when the open scene holds > 1 building and is not City mode, Find's storey/disc trees query
    without the building filter (or group building → disc). Gate = building count > 1 & !CITY_URL, so single-building
    loads are unchanged. Witness: AFTER.db → disc tree parent rows = 9 codes, counts = the GROUP BY above.
- **§FB SPEC — SHIPPED as bim-ootb PR #1866 (auto-merge on). (user go 2026-10-05: "during the first merge … it should refresh and treat both as one … ensure no impact to others").**
  Gate everywhere: `!A.CITY_URL && Object.keys(A.buildingCentres).length > 1` (a MERGED scene). Fleet proof of the gate:
  every hub DB has 1 building (`viewer/buildings/*_extracted.db` + `*_meta.db`, 15 files; the live OCI
  `buildings/Clinic_extracted.db` = gzip, 1 building "Clinic" 16,071) → gate false → byte-identical behaviour.
  City mode keeps its per-building scope (excluded by `A.CITY_URL`).
  1. ONE owner `A.sceneScopeBuilding()` (streaming.js): merged scene → `''` (all buildings), else `A.activeBuilding||''`.
     `§SCENE_SCOPE all buildings=n` / `one bld=X`, logged on change only.
  2. Find's 6 SQL-scope readers call it (`buildTree`, lens probe, `_isolateGuidSet`, `_emitIsolate` total,
     `populateDropdowns`, `runSearch`). Room needle (per-building rooms) unchanged.
  3. Open of a saved merged DB: after the first `streamBuilding`, the other centres go into `A._mergePending` → the
     existing drain (`_mergeStreamNext`) streams them. `§OPEN_ALL_BUILDINGS queued=k first=X`.
  4. `§MERGE_CONTRACT … verdict=COMPLETE|DRAINING|INCOMPLETE` (rendered buildings vs centres, pending queue).
     On COMPLETE in a merged scene, an open Find panel rebuilds (`§FIND_REFRESH why=merge-complete`) → the live merge
     shows all disciplines without reopening.
  Witness `witness_merge_all_buildings.js`: (a) open AFTER-shape DB (2 buildings) → rendered both, verdict=COMPLETE,
  Find disc parents = union; (b) Duplex alone → `sceneScopeBuilding()` = its building, Find disc parents unchanged.
- **§FB night (user 2026-10-05: "street lamps are not lighting up … too dark … was better before") — SAME root cause.**
  `witness_civil_night_lamps.js` on AFTER.db: main → lamps SELECTED identically (227 → 172 columns / 223 heads /
  strayBuried 9) but `noBox=227` — the road building never streamed, so the lights shine on nothing (pass 7/13).
  Fix branch (§FB.3) → `noBox=0`, 223/223 heads on the rendered column tops, 13/13. Control JELAPANG.db (road only) 13/13.
  Witness oracle was scope-blind: "buried" floor = MIN bottom of every non-LIGHTING element on the SITE — the merged
  bridge's piers (−1.4 m) dropped it below the strays. Now scoped to the building(s) carrying LIGHTING (42.9 m both files).
  Open: merged buried=13 vs single 16 at the same floor (3 columns' rendered tops differ) — not read yet.
- **§FB ground — ✅ FIXED bim-ootb PR #1868 (auto-merge): civil model → Step 4 p2 over all (43.46 merged; road-only 51.74 unchanged). Was:** merged scene `§GROUND_Y src=gf-storey-slab(Level 1) z=56.58` — the BRIDGE's storey
  wins step 1; road-only scene resolves `p2-bottom z=51.74`. Ground plane is hidden by default (`§GROUND_INIT
  visible=false`), but shadow/sky/walk read this height. Needs its own spec (whose ground in a merged scene?).
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
- **§MESH_SLIM — large-file mesh (user 2026-10-05: "what about the large file mesh?"; "save and reload be efficient").
  MEASURED on JELAPANG_AFTER.db (7,419 geometries, 21,957,746 verts):** vertices 251.3 MB · faces 97.9 MB (u32) ·
  NORMALS 251.3 MB = 42 % of geometry. Stored normal == its own triangle's face normal (<1°) for 99.95 % of vertices;
  6,528 / 7,419 geometries entirely flat. Shipped fleet DBs carry NO normals — the viewer already derives them with
  computeVertexNormals() from the winding (`streaming.js:1615`, §WALL_WINDING_MEASURE); only BROWSER IMPORTS store them
  (`§BLOB_FETCH normals_pre=155`). Other levers: u32→u16 indices −37.1 MB (needs a format flag, not proposed);
  exact weld −16 % verts (would change the flat look, not proposed); instancing ~0 (shapes are unique per location).
  Proposal (NOT BUILT, needs go): import/save write normals = NULL (fleet format) → ~−251 MB (661 → ~410 MB) on this file;
  smaller save, faster reload, less sql.js heap (whole DB lives in WASM memory). Existing saved DBs: compact on next Save.
  Witness: per geometry, computeVertexNormals() vs the stored normal — angle distribution over JELAPANG + one building
  import; render path proof = the fleet already runs it. Cost to measure: CPU normal compute on load for 22M verts.
- **§MESH_SLIM — ✅ SHIPPED bim-ootb PR #1870 (merged).** A.isCivilModel() owner; civil load ignores stored normals, civil Save
  NULLs + VACUUMs, civil import doesn't write them. witness_mesh_slim.mjs (three.js's own computeVertexNormals): 21,952,369
  verts 100.000 % within 1°, 5,377 stored normals were zero-length; derive 594 ms; AFTER.db copy 661.6 → 395.7 MB.
  Gap: hub index.html loads import_db_builder.js WITHOUT rates.js → hub civil imports still store normals (and §OPEN "hub
  duplicate discipline list" already says hub civil import differs) — fix with that item.
- **§FLY — ✅ FIXED bim-ootb PR #1871 (auto-merge).** User 2026-10-05: "Fly is jerky … should orbit from junction to junction,
  but instead it backs away and returns to the same. It moves facing backwards." Measured: slice medians zig-zag (16 turns
  > 30°, max 125°); 5 signal stops at route points 0-1. §CIVIL_ROUTE_SMOOTH (3-pt moving average → 0 turns > 30°) +
  §CIVIL_ROUTE_JUNCTION (stops within 100 m of route = one junction, radius holds members → 2 junctions). Witness
  witness_civil_fly_route.js: main FAIL 2/4 → branch PASS 4/4. User same day: "Lights and ground shadow sun day with light
  distance normal fog all OK good enough."
- **§ALTC_HIGHWAY — ✅ SHIPPED bim-ootb PR #1872 (auto-merge; user "go ahead with alt-c").** Route seeded from A.civilRoutePath
  (one owner, Fly reads it too) as ov.waypoints when nothing authored; civil pace 25 m/s for drive + pull-back (natural film
  1243 s → 206 s: dive 57 + spin 6 + drive 101 + pull-back 34 + orbit 8); sun 15° → 6°; interior-lights window skipped for civil
  (lamps whole film); civil lamp cap nearest-first. #cpe-panel / cinema_path_editor.js untouched. witness_altc_highway.js 8/8
  (no bake). NOT yet seen in a real bake (bakes need the user's go) — the 57 s approach (dive from the 3 km framing camera) is the
  first thing to judge on a real film. (Original code map kept below.)
  Code map done (read-only agent, all file:line on main @ 2026-10-05):**
  plan = effects.js `_cinemaPathPlan` :7140 (no rooms → bbox-centre dive :7339, facade-fallback exit :7447 → meaningless orbit on a
  road); route seam = `ov.waypoints` :10132 / `A.stageCinemaPath(ov)` :10046 / `__maxqBake` cinema_maxq.js:4902; sun =
  `_sunElevationAt` effects.js:2523 linear 55°→6° (PHOTO_SUN_ELEVATION_END :2515, azimuth const 200, no URL param; graze/day
  tests :3591/:3615/:4573 assume ≥ 6°); lamps = interior-lights gate cinema_maxq.js:3848 zeroes ALL fixtures [beats.out,
  beats.rise) incl. civil heads (glow Points not gated); film lamp cap ≤ 200 in list order (tools.js:2278). Building beats
  (storey reveal, buildup, room title, escape route) are flag-gated / self-VACUOUS. Hooks: (1) civil route points (extract
  tour.js route builder, now smoothed) → ov.waypoints; (2) A._sunArc {start,end} read by _sunElevationAt + clamp graze/day;
  (3) civil guard on the interior-lights gate; (4) detector = A.isCivilModel() at plan creation cinema_maxq.js:2496.
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
