# CIVIL_HIGHWAY_JELAPANG — first civil-works (highway) IFC through the viewer importer

# ⚠ DO NOT REMOVE
- **Scope:** (A) the importer units bug that crushes a 2 km highway ×0.001 — spec, fix, witness;
  (B) a record of how a civil/linear model differs from our building assumptions (findings only,
  no implementation until the user picks an item).
- **Code lives in bim-ootb** (`viewer/import_worker.js`). Work in a `/tmp/wt-*` worktree off
  `origin/main` — the shared `~/bim-ootb` tree is hook-blocked for edits.
- **Read the log after every run.** Exit code / "it loaded" is not evidence. The proof is the
  `§UNITS_V2`, `§GEOREF_REBASE`, `§CAMERA envelope=` and `§FOG_DENSITY` lines, plus the stored
  `element_transforms` extents.
- No visual check is a test (PRIMAL LAW). "Close-up no longer cuts off" must be stated as numbers.

---

## §0 Source set (measured 2026-10-04)

Folder: `~/Downloads/JALAN JELAPANG IFC/` — 7 IFC files + their Civil 3D export logs, and the
browser-import result `JELAPANG.db` (408 MB, imported 2026-10-04T14:28Z).

| File | IfcBuildingElementProxy | Note (from the file's own `.log`) |
|---|---|---|
| JELAPANG_ROAD.ifc (278 MB) | 4008 | mainline 3D solids |
| JELAPANG_ROAD FURNITURE.ifc | 1011 | 39 solids + 972 block refs |
| JELAPANG_ROAD LIGHTING.ifc | 227 | |
| JELAPANG_DRAINAGE.ifc | 200 | 11 pipes + 95 structures + 2 TIN surfaces **skipped** by exporter |
| JELAPANG_ROAD SIGNAGE.ifc | 138 | |
| JELAPANG_ROAD MARKING.ifc | 90 | |
| JELAPANG_EARTHWORK.ifc (5 KB) | 0 | 1 TIN surface **skipped** — no terrain exported |
| **Total** | **5674** | = `elements_meta` row count in `JELAPANG.db` ✓ |

All files: `FILE_SCHEMA(('IFC2X3'))`, exporter `ODA SDAI 24.12` (Civil 3D 2024),
`#8=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)` — **declared unit is metres, no prefix.**

Real extent (raw `IFCCARTESIANPOINT`s with |x|>1000, LIGHTING + SIGNAGE files):
x 27,578 → 29,677 m, y −24,153 → −22,956 m, z −12.1 → 66.7 m ⇒ **≈ 2.10 km × 1.20 km × 79 m**.
(The user describes it as a 7 km highway; bbox diagonal is ≈ 2.4 km. Route length along the
alignment is NOT measured — IFC2X3 carries no IfcAlignment. Do not quote 7 km as a measured value.)

---

## §A Units bug — span heuristic overrides the declared unit

### A.1 Defect (measured)
`JELAPANG.db` `element_transforms`: x 27.56 → 29.69, y −24.24 → −22.91, z −0.011 → 0.085.
Exactly **×0.001** of the raw IFC. Viewer log of the same load:
`§CAMERA envelope=2x1x0m dist=80m`, `§FOG_DENSITY env=100m density=0.00400`,
`§OFFSET ifc=(29, -24, 0)`. Road solids are ~3 cm thick in scene units → near-plane clipping /
cut-off on close-up (user report). No `§GEOREF_REBASE` fired (mid-x 28.6 < 10,000).

### A.2 Cause (code read, bim-ootb `de9682e3`)
`viewer/import_worker.js:666-705` `§UNITS v2`: `_span = max(axis span of centres, max bbox)`;
`if (_span > 1500) autoScale = 0.001` (scales centres, bboxes, verts). Rationale in the comment:
*"No real building spans 1.5km"*. JELAPANG x-span ≈ 2,049 m → classified as millimetres.
The file's declared `LENGTHUNIT` IS read — but only later (`:764-776`, `_lengthUnitScale`) and only
for `§SITE_IDENTITY` site placement, never for this decision.

### A.3 ANSWERED 2026-10-04 — web-ifc already outputs metres; the heuristic is wrong every time it fires
Probe (scratchpad `probe_world.js`, web-ifc **0.0.77** = the viewer's version, same
`COORDINATE_TO_ORIGIN:false`, full `flatTransformation` applied exactly as `import_worker.js:494-502`):

| File | declared | matrix scale | world span (m) |
|---|---|---|---|
| Ifc4_SampleHouse.ifc | MILLI | 0.0010 | 16.9 × 3.9 × 8.7 |
| Hospital_IFC2x3_STR.ifc | MILLI | 0.0010 | 101.5 × 41.3 × 118.8 |
| JELAPANG_ROAD LIGHTING.ifc | METRE | 1.0000 | 2050.4 × 100.3 × 1190.2 |

web-ifc bakes the unit factor into the placement matrix (local verts stay in file units: house
2755, hospital 39,853 — but ×0.001 in the matrix). So every element arrives in **metres** whatever the
declared unit. The `_span > 1500` branch therefore never fires on a mm building (they are already
<1500 m) and ONLY fires on a genuinely >1.5 km metre model — i.e. it is never right. The `:177`
comment "web-ifc is inconsistent" and the `:674` premise "a mm building spans ≥1500" are both
contradicted by this probe for 0.0.77.

### A.4 Rule (decided)
1. **Delete the span heuristic** (`import_worker.js:691-705`): `autoScale = 1` always. Deletion, no new rule.
2. Keep the `:764-776` declared-unit read for raw `GetLine()` values (site placement) — that path
   really is in file units.
3. `§UNITS_V2` line becomes `span=<m> autoScale=1 (web-ifc normalised; declared=<unit>)`.
4. Georef rebase unchanged: mid-x ≈ 28,653 m and mid-y ≈ −23,555 m are > 10 km ⇒ both rebased.
5. Also explains the close-up cut-off exactly: camera near is fixed `0.1 m` (`scene.js:154`); the
   crushed road was ~3 cm thick, so any approach closer than 10 cm clipped the whole surface.

### A.5 Witness — `W-UNITS-DECLARED` (names the issue it proves)
Issue: *declared-metre model over 1.5 km is crushed ×0.001*.
- Input: `JELAPANG_ROAD LIGHTING.ifc` (19.7 MB, smallest file with real coordinates).
- Assert from the `§`-log: `§UNITS_V2 … autoScale=1 declared=METRE decidedBy=declared`;
  `§GEOREF_REBASE` fired with offset x≈28,6xx, y≈−23,5xx.
- Assert from stored transforms: x-span ≥ 2,000 m and ≤ 2,200 m (probe: 2,050.4 m); z-span ≥ 70 m.
- Regression guard: `Ifc4_SampleHouse.ifc` (MILLI) still lands 16.9 × 3.9 × 8.7 m (±0.5) — proves
  mm buildings are unaffected by the deletion, so the witness can tell a fix from a flip.
- VACUOUS guard: if 0 transforms, print `INCONCLUSIVE`, never PASS.
- Downstream (log, not eyes): re-import JELAPANG full set → `§CAMERA envelope≈2100x1200x79m`.
  Then check `§FOG_DENSITY env=` and the camera near/far scale off the new envelope — fog at
  `env=100m` was clamped for a 2 m model; whether it scales to a 2 km envelope is part of the check.

---

## §B Civil vs building — impact findings (record only, no work until picked)

B.1 **Classless model.** 5674/5674 are `IfcBuildingElementProxy`, `storey=Unknown`, names
`IfcBuildingElementProxy_<id>`. Class-driven features are inert here — the load log already says
so: `§SURFACE_RULES_CLASS IfcBuildingElementProxy:R7=5674`, `§MEP_HUE_TALLY VACUOUS`,
`§TRI_SRC_TALLY … NO-OP`, `§4D_PILL_GATE has_schedule=false`. Not yet checked: whether the Civil 3D
property sets carry useful type data (next read before any classification work).

B.2 **Discipline lost in federation.** All 5674 stored as `discipline=ARC`. The only discipline
signal is the **source file name** (ROAD / FURNITURE / LIGHTING / DRAINAGE / SIGNAGE / MARKING).
Stamping discipline from filename is extraction, not invention — mapping to our discipline codes
needs one user decision (which codes a civil set uses).

B.2a **ANSWERED 2026-10-04 — it is list expansion, not new panels.** Find's discipline axis is
data-driven: `find_ask_grammar.js:32` `SELECT DISTINCT discipline FROM elements_meta`; clash matrix
(`clash_matrix.js:98`) and clash report read the same column. The importer ALREADY stamps discipline
from the file name — `import_worker.js:78 discFromFilename()`, which wins over class in
`classifyDisc()` (`:100`). JELAPANG fell to `ARC` for two extracted reasons:
  1. `VALID_DISCS` (`:76`) has no ROAD / FURNITURE / LIGHTING / DRAINAGE / SIGNAGE / MARKING.
  2. The split is `/[_\-]/` (`:81`) — the files use spaces (`JELAPANG_ROAD FURNITURE.ifc` →
     part `"ROAD FURNITURE"`), so even a listed word would not match. Add space to the split.
  Then `DISC_MAP[IfcBuildingElementProxy]` → `'ARC'` default (`:108`).
Fix = add the civil codes + split on space. Colour maps (`import.js:629`, `rates.js:526`) are
hand-listed — new codes need a colour row or they fall to default. Find/clash pick them up with no code.

B.3 **Exporter dropped content.** No terrain (EARTHWORK TIN skipped), no drainage network
(106 pipes/structures skipped as 2D). The viewer cannot show what the IFC doesn't carry — fix is
upstream (export settings) or a separate surface import; record, don't fake a ground.

B.4 **4D for a linear asset.** Buildings sequence by storey; a road sequences by chainage. IFC2X3
has no IfcAlignment, so chainage would have to be derived from element position along the route
— a NEW rule needing its own spec. Not in scope until asked.

B.5 **Building-scale constants.** After §A, the scene is ~1000× larger than anything tested:
camera near/far, fog envelope, DLOD distance thresholds, BVH, walk/fly speeds, film beats that
assume storeys. Each needs a `§` line read on JELAPANG before any claim it "works for civil".

---

## §C Redesign — from "building-centric" to "site-profile" (advice, 2026-10-04)

**Diagnosis.** Our settings don't assume "building" in one place; they assume it in dozens of
constants and in one hidden axis: **height (storeys) is the organising axis.** Level derive, 4D
phasing, section box, film beats, room walker, fly tour all hang off Z/storeys. A road's organising
axis is **chainage** (distance along the route); its Z is nearly flat (79 m over 2 km, mostly terrain).

**Principle: derive a SITE PROFILE from the data once at load, and every scale/axis decision reads it.**
No user "civil mode" switch, no per-project code — the profile is extracted, like units should have been.

| Profile field | Source (extracted) | Replaces |
|---|---|---|
| `envelope` (m, per axis) | stored transforms after §A | already exists (`streaming.js:3891`) — keep as the one owner |
| `shape` = building / linear / campus | plan aspect + height ratio + centreline fit of element centres | implicit "it's a building" everywhere |
| `primaryAxis` = storey(Z) or chainage(s) | building → storeys; linear → centreline through element centres, each element gets `s` | storey-only logic |
| `typicalElement` (m) | median element bbox | metre thresholds in DLOD / measure / snapping |
| `discipline` per element | IFC class, else source file name in a federated drop | `ARC` default |

**What changes, by layer (in the order I'd do it):**
1. **Units** — §A. Delete the heuristic. Prerequisite for everything below. *(small, ready)*
2. **Discipline from source file** — federated drop stamps each element with its file's discipline
   (ROAD/LIGHTING/…). Needs the one user decision in B.2 on codes. *(small)*
3. **Camera + fog from the profile** — near plane follows distance to target (e.g. `dist×0.001`,
   floor 0.05 m) instead of fixed 0.1 m; far already scales (`max(10000, dist×5)`). Fog's
   `min 0.00015` floor (`scene.js:149`) means 6,700 m visibility — OK at 2 km, verify by `§FOG_DENSITY`.
4. **The axis swap — `primaryAxis`** — the real redesign. Build the centreline once (order element
   centres along the road), give each element its chainage `s`. Then the SAME features take `s`
   where they took storey: 4D phases by chainage band, section box = a chainage window, "go to level"
   = "go to km 1.2", fly tour = drive the centreline. One generalisation, not a second set of features.
5. **Gate building-only features by data, not by flag** — rooms/walker, MEP colours, surface rules,
   storey film beats already log NO-OP/VACUOUS on JELAPANG; turn that same evidence into hiding the
   pill, so a road doesn't offer "walk the rooms".
6. **Terrain** — absent from this IFC (B.3). Show nothing rather than a fake ground; ask the
   designer for a surface export.

**What stays as-is:** streaming, batching, BVH, DLOD frustum culling, history/kernel ops, GUID
identity — none of these care about building vs road (load log: 5674/5674 streamed, 0 orphans).

**Not measured yet (must be, before any "works for civil" claim):** walk/fly speeds, DLOD metre
thresholds, measure snapping, shadow camera range (`effects.js:3533` scales by sun distance) — read
each `§` line on JELAPANG after §A lands.

---

## §PLAN — phased, impact-first (2026-10-04, for user review — NOTHING implemented yet)

Order is by blast radius: smallest/most-proven first. Each phase = its own PR in a `/tmp/wt-*`
worktree off bim-ootb `origin/main`, its own witness, its own `§` lines. A later phase does not
start until the earlier one's witness is read green.

### P1 — Units: delete the span heuristic  *(spec §A.4, witness §A.5)*
- **Change:** `viewer/import_worker.js:666-705` → `autoScale = 1`, remove the scale loops; rewrite
  the `:177` and `:666-679` comments to state the probe fact; `§UNITS_V2` gains `declared=`.
  Deletion budget ≈ −20 / +3 lines.
- **Impact (read, not assumed):**
  - Callers: all IFC imports go through this one worker — `viewer/import.js:162/395/452` and the
    hub's `import_own.js:319/322`. `mesh_import_worker.js` (OBJ/STL/…) has no such heuristic — unaffected.
  - `meta.unitScale` → written to `project_metadata.unit_scale` (`import_db_builder.js:34`), and
    passed through `import.js:310/346`, `import_own.js:659/689`. **No reader** found in viewer/modeller
    — it becomes a constant `1`. Keep the column (old DBs carry it), no migration.
  - Buildings: the heuristic never fired on a mm building (probe: house 16.9 m, hospital 101.5 m —
    both web-ifc-normalised, < 1500). **Zero change expected for every building** — the regression
    guard in §A.5 proves it, not this sentence.
  - Already-imported DBs are not rewritten. Only models > 1.5 km were crushed; JELAPANG must be
    **re-imported** (it sits in the user's import IDB — re-drop the 7 files).
  - Offline extractor (bim-compiler Python/Java) is a separate path — unaffected.
- **Witness:** `W-UNITS-DECLARED` (§A.5): JELAPANG LIGHTING x-span 2,000–2,200 m, rebase fired;
  SampleHouse still 16.9 × 3.9 × 8.7 m; INCONCLUSIVE on 0 transforms.

### P2 — Civil disciplines from file name  *(spec §B.2a)*
- **Change:** `import_worker.js:76` add civil codes; `:81` split on `/[_\-\s]+/`.
- **Impact:**
  - **Space split can reclassify existing files.** Any file whose name has a space-separated word
    already in `VALID_DISCS` (EXT, INT, SITE, ROOF, CEIL, DEMO, LAND, FIRE, GAS, AIR …) changes
    discipline on its next import (e.g. a hypothetical `Hospital Site.ifc` → `SITE`). Witness must
    sweep every IFC filename on disk (fleet + JKR + Downloads) and print old→new; any change other
    than the JELAPANG six is listed for the user, not shipped silently.
  - **Duplicate implementation:** `import_own.js:8-24` (hub, index2 only) has its OWN 12-code list +
    alias table and **overwrites** the worker's discipline (`:368-372`). Per one-implementation rule,
    P2 deletes the hub copy and lets the worker's stamp stand — otherwise civil works in the viewer
    but not from the hub. Its alias table (ELECTRICAL→ELEC, SPRINKLER→FP …) moves into the worker
    so no existing hub import loses a mapping.
  - Consumers are data-driven — Find (`find_ask_grammar.js:32`), clash matrix/report, 4D breakdown
    by discipline (`schedule_author.js:3004`) — pick new codes up with no code.
  - Colours: `import.js:629`, `rates.js:526` are hand lists → new codes get a colour row, else default.
- **⛔ Needs one user decision:** the codes. Option shown for review: use the file's own words
  verbatim (ROAD, FURNITURE, LIGHTING, DRAINAGE, SIGNAGE, MARKING). Concern: `FURNITURE` and
  `LIGHTING` clash with building meanings (FF&E, ELEC lighting) — alternatively prefix as civil
  (e.g. `RD-FURN`). The user picks; not invented here.
- **Witness:** `W-DISC-FILENAME` — JELAPANG: 6 disciplines with counts 4008/1011/227/200/138/90;
  filename sweep old→new diff printed; EARTHWORK (0 elements) → VACUOUS, not PASS.

### P3 — Camera near plane  *(measure first — may be unnecessary)*
- After P1 the road is real size; fixed `near=0.1 m` / `far=max(10000, dist×5)` may be fine
  (ratio 10⁵). **Do not change** until a `§` reading on re-imported JELAPANG shows clipping or
  depth fighting. If it does: near follows camera distance. Impact would be EVERY building, walk,
  CPE (`cinema_path_editor.js:1862` copies near) and film — so it needs a fleet before/after table.

### P4 — Site profile (additive, read-only)  *(spec §C)*
- New owner computes `{envelope, shape, primaryAxis, typicalElement}` once at load from stored
  transforms and logs `§SITE_PROFILE`. For a linear site: centreline through element centres +
  chainage `s` per element. **Nothing reads it yet** → zero behaviour change; witness = the profile
  values for the 4 fleet buildings (all `shape=building`) + JELAPANG (`shape=linear`, length ≈ ?).
  This also measures the real route length — settles the "7 km".
- Goes into §I ownership table of `4D_MODEL_INTEGRITY.md` as a new row (one owner).

### P5 — Consumers adopt `primaryAxis`  *(each its own spec later)*
- 4D phasing by chainage band, section box as chainage window, "go to km", fly tour along the
  centreline; building-only pills hidden by their own VACUOUS evidence. Each changes visible
  behaviour → separate spec + review per consumer. Not specced in detail until P4's numbers exist.

### Review checklist for the user
1. P1 go? (deletion; regression guard on SampleHouse)
2. P2 codes — verbatim file words, or prefixed civil codes?
3. P2 — OK to delete the hub's duplicate discipline list (`import_own.js`)?
4. P3 — agree to measure-before-change?
5. §D — Civil switch auto-on from profile + manual override, named "Civil" not "CW"?
6. §E.2 — add pset extraction as step 3?

---

## §D Civil switch — advice (2026-10-04, user asked "perhaps a CW switch?")

**Yes — but auto-set, user-overridable, and not called "CW".**
- **Auto:** P4's `§SITE_PROFILE shape=linear` turns it on at load — a road opens as a road with
  no click. **Override:** one pill/setting flips it (mixed sites: a road with a toll building, or a
  long factory that measures "linear"). The switch changes a *settings bundle* (camera/fog, nav,
  pill set, 4D axis = chainage), never the data.
- **Name collision (extracted):** in our own fleet `CW` already means **Cold Water** — JKR file
  `jkrME23_5a_CW_(BSktLLP_04K-4)…ifc`. A "CW" switch would read as plumbing. Use **Civil**; the
  discipline code `CIV` already exists in `VALID_DISCS` (`import_worker.js:76`).

## §E Industry features for a highway IFC set — research mapped to what THIS set carries

### E.0 What JELAPANG actually carries beyond geometry (measured from the IFC text)
Every element has 5 JKR asset property sets (`01 Jelapang Project Information`, `02 … Design
Parameter`, `03 … DPA`, `04 … DAK (Road)`, `04 … DAK (Perabut Jalan)`), ~130 fields (Malay/English).
**Mostly empty** — chainage/coordinate fields (`03_Koordinat_Mula`, `06_Koordinate_GPS_X`,
`39_Subseksyen_Mula`, `08_Alignment_Length`) are all `$`. **Filled and useful:**
- Signage: `16_Name` (CHEVRON DELINATOR 46, OBSTRUCTION MARKER 36, GIVEWAY 7 …) + `17_Code` JKR
  sign code (WD. 39a/39b 23 each, WD. 24a 15, RP. 13 7 …).
- Road solids: `01_Component_Name` — MAINLINE 541, ROAD J2A 211, ROAD J2B 94, EXISTING LANE -J1B 118,
  -J1A 96, -ROUNDABOUT 62, VBC 6; 2880 blank.
- **Our importer stores none of this** — `element_name` is `IfcBuildingElementProxy_<id>`, no
  property table in `JELAPANG.db`. Pset extraction is the cheapest big win (feature E.2).

### E.1 Feature list, ranked by fit (✅ data in hand · 🟡 derivable · ⛔ data missing)
| # | Feature (industry practice) | Fit | Source in this set |
|---|---|---|---|
| E.1 | **Chainage navigation** — browse alignment, "go to km", 3D view follows (TUM Open Infra / road viewers) | 🟡 | P4 centreline from element centres (no IfcAlignment in IFC2X3) |
| E.2 | **Asset breakdown by property** — Find by sign code / component name; EXISTING vs new lanes coloured | ✅ | psets in E.0 → needs pset extraction in importer |
| E.3 | **Drive-through sign review** — driver-view along the road at traffic speed to spot sign density / blocked signs (FHWA RSA practice) | 🟡 | centreline + existing fly/walk engine; signs are their own discipline after P2 |
| E.4 | **Linear 4D — time-chainage chart** linked to 3D (Linear4D / ScheLo; standard for highways/pipelines) | 🟡 | chainage per element (P4) + existing schedule engine |
| E.5 | **Cross-section at chainage** — section plane square to the road | 🟡 | existing section tool + centreline tangent |
| E.6 | **QTO per km / per component** — sign & lamp counts per km, marking length, pavement solid volume | ✅/🟡 | counts+volumes from geometry; "per km" needs P4 |
| E.7 | **Clash** — drainage vs pavement, lighting vs signage clearance | ✅ | existing clash matrix, data-driven by discipline (after P2) |
| E.8 | **Sight-distance check** on the 3D alignment (research + design-review practice) | ⛔/🟡 | needs terrain + alignment; a raycast approximation along the drive path is possible but would be a NEW rule — spec separately |
| E.9 | **Terrain / cut-fill** | ⛔ | EARTHWORK TIN skipped by exporter (§B.3) |
| E.10 | **Basemap / georef** | ⛔ | GPS fields empty; IFC2X3 has no map conversion; CRS of the ~28 km easting unknown — ask designer |
| E.11 | **IFC 4.3 alignment import** (IfcAlignment, the standard home of stationing) | future | only if designer re-exports IFC4.3 — not verified that their Civil 3D build can |

### E.2 Recommended order (for review)
1. P1 units → 2. P2 disciplines → 3. **pset extraction** (E.2 — unlocks names, sign codes, existing
vs new; also helps every building) → 4. P4 profile + **Civil switch** (§D) → 5. E.1 chainage nav →
6. E.3 drive-through → 7. E.4 linear 4D. E.8–E.11 wait for data from the designer.

### E.3 Sources
- IFC alignment overview: https://wiki.osarch.org/ifc-industry-foundation-classes-ifc-alignment/
- TUM Open Infra Platform (alignment browse + cross-sections): https://www.cee.ed.tum.de/cms/research/research-fields/building-information-modeling-in-infrastructure/tum-open-infra-platform
- Linear 4D with schedule-location charts: https://pure.seoultech.ac.kr/en/publications/linear-4d-system-using-schedule-location-charts-for-infrastructur/
- Time-chainage diagrams: https://schedulereader.com/?p=20820 · https://www.fticonsulting.com/uk/insights/articles/linear-schedules
- FHWA road safety audit (drive-through sign review): https://highways.dot.gov/safety/data-analysis-tools/rsa/fhwa-road-safety-audit-guidelines/post-construction-phase-prompt
- Civil 3D IFC export / corridor solid property data: https://help.autodesk.com/cloudhelp/2024/ENG/Civil3D-UserGuide/files/GUID-C5C9DEEE-2C46-4094-B350-05829C1ED5DC.htm · https://help.autodesk.com/cloudhelp/2023/ENU/Civil3D-UserGuide/files/GUID-BFA65589-25B2-41CE-BCEE-7A68E83D4103.htm

---

## §F Length limits — ours vs Civil 3D (2026-10-04, user: "Civil 3D seems to have a 10 km limit")

**Civil 3D claim:** NOT confirmed — no Autodesk doc found stating a 10 km cap. What IS documented:
float precision loss for civil objects at large coordinates (surfaces fail to rebuild after a big
coordinate move), and the common practice of splitting long jobs into ~4–5 km sections or a
master-in-map-coords + detail-near-origin file pair. Sources: forum.bricsys.com/discussion/comment/59580/ ·
forums.autodesk.com/t5/civil-3d-forum/splitting-up-large-projects-for-design-efficiency/m-p/7673028

**Ours — two different limits; coordinates are NOT the binding one:**
1. **Coordinates (fine to ~100 km).** Element centres are stored as SQLite REAL (double); vertices are
   stored relative to each element's own centroid (`import_worker.js:524-529`) — the "detail file
   near origin" workaround, done per element, automatically. Only the GPU instance matrix is float32,
   after the §A georef rebase to the site middle. float32 step at distance d from origin:
   ±5 km (10 km road) → 0.49 mm · ±50 km (100 km road) → 3.9 mm. (Computed: ulp = 2^(⌊log2 d⌋−23).)
2. **Memory (binding, ~8–9 km for THIS density).** JELAPANG geometry = **423.9 MB, 14.77 M vertices,
   5094 geometries for 5674 elements** (road solids barely repeat). The browser import + sql.js run in
   wasm32 with a hard **4 GB** ceiling (measured on KUL070: `limit is 4294901760 bytes`,
   `IFC_LARGE_PRIVATE_STRESS_TEST.md`). Linear estimate: ~212 MB/km of bbox span → 10 km ≈ 2.1 GB of
   geometry alone, before the IFC bytes and working copies. **Estimate, not measured** — the real
   ceiling must be found by importing a longer set.
   **Ways past it (existing patterns, not new):** offline extractor path (KUL070's 2 GB IFC shipped as
   a 311 MB DB) · one DB per section streamed by chainage (City/multi-building loader) · decimate
   road solids (14.77 M verts for 2 km is heavy tessellation of mostly flat slabs).

## §G Where we can beat the field (proposals — each needs its own spec before work)
Ranked by what we already have running for buildings:
1. **Whole road in a browser link** — no install, phone/tablet, offline on site (PWA). Desktop tools
   (Civil 3D, Navisworks, InfraWorks) need installs and licences.
2. **One drop federates all 7 discipline files** — already works today (5674/5674 loaded, 0 orphans).
3. **4D generated, not authored — by chainage.** Our auto-4D engine + a time-chainage chart. Linear
   schedules are the highway norm but are hand-drawn in planning tools.
4. **JKR asset handover (DAK psets → asset register).** Each sign already carries its JKR code
   (WD. 39a/39b …); the DAK template is JKR's own asset structure. BIM → ERP asset register is our
   ERP fold — a road owner's O&M handover nobody else ties to the model in the browser.
5. **Signed review trail** — kernel-ops ledger records every review action, verifiable.
6. **Drive-through film** baked from the model for stakeholders (our film/CPE engine on the centreline).
7. **No section splitting** — coordinates hold to ~100 km (§F.1); memory is solvable by streaming
   sections, so the user sees ONE road, not 4–5 km files.

---

## Status
- 2026-10-04: §0 measured, §A cause read from code, A.3 answered by probe (web-ifc already metres),
  §C redesign + §PLAN (P1–P5, impact) written. **Next: user reviews §PLAN checklist; nothing coded.**
