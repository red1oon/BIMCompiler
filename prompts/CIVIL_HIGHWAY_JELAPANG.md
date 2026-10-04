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

## ⚖ NON-IMPACT RULE — civil work must not change how existing buildings behave (user, 2026-10-05)
> User: *"note in the specs that this new CW does not impact present buildings behaviour"*

Every civil change in this file is **gated on civil data** (the CIVIL_DISCS codes from file names, a
slab-less model, or a site envelope beyond building scale) so a building model never takes the new path.
Each PR states the gate and proves it on the fleet (Hospital, Terminal, LTU_AHouse, Duplex):
| Change | Gate | Fleet proof |
|---|---|---|
| #1844 units (§A) | none needed — the removed rule never fired below 1.5 km | SampleHouse 14.0×5.9×3.5 m before = after |
| #1844 disciplines (§B.2a) | civil words in file name; space-split matches civil words only | 464 IFC names: 13 change, all road/furniture/drainage |
| #1844 framing (§I.3) | full envelope > 2× p2–98 core | Hospital 1.8 / Duplex 1.3 / Terminal 1.15 → KEEP |
| #1849 ground (§M) | §GROUND_Y step 4 only (no slab/storey match) | all 4 resolve at step 1 |
| #1850 shadow follow (§P) | whole-site texel > 0.25 m (env > 256 m) | envelopes 151 / 126 / 69 / 22 m → off |
| §Q TM civil phases (#1851, merged) | element discipline ∈ CIVIL_DISCS; civil template only when ALL elements civil | cache_4d_run before/after, civil table ACTIVE: 4 buildings run.json identical |
| §Q.2 civil trades + parallel (#1853) | trades referenced only by SEQUENCE_CIVIL; `placement:'logic'` only in the civil template | same fleet run: identical; witness_sequence_template_lock PASS |
| §R.2 5D civil lines (#1853) | CIVIL_RATES keyed by civil discipline in boq_charts | BOQ headless Duplex: 34 lines / RM 1,064,715.92 / labour 103,231 = main |
A civil change that cannot name its gate and its fleet proof does not ship.

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
7. §I.1 — zoom-to-cursor for all models, or only large ones?
8. §I.2 — can you get the CRS code from the designer (Civil 3D drawing settings)?

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

## §H Navisworks feature parity — for a road (2026-10-04, user: "Navisworks has Walk … can we have them?")
Status read from shipped code/log names — **none yet exercised on JELAPANG** (every row needs a `§`
reading on the re-imported road before it is claimed).

| Navisworks | Ours (shipped, building-tuned) | Road gap |
|---|---|---|
| Orbit / Pan / Zoom / Focus | orbit controls, `resetCamOrbit` (A), pivot (Q) | none expected |
| **Walk** (gravity, collision, crouch) | `walk.js` (phone step/GPS, floor = **storey** levels `:248-254`, "no floor/stair snap" `:470`); `cpe_walk.js` (finger / gamepad) | road has no storeys → walk.js floor logic has nothing to snap to. **Need: gravity onto the surface below** (raycast down; BVH already built, `§BVH_DEFERRED built=5094`) |
| Third-person avatar | staffage car mesh already loads (`§STAFFAGE_CAR_MESH verts=2058`) | reuse as the driven car |
| Fly | `toggleFlyAround` (L), fly tour | tour is room-graph based → needs centreline |
| Viewpoints | share links / hash state, history | none expected |
| Sectioning | section tool + scissors | needs "square to road at chainage" (§E.5) |
| Measure | `toggleMeasure` (M) | none expected |
| Clash Detective | clash matrix / narrow / report / snag | works once disciplines exist (P2) |
| TimeLiner (4D) | Time Machine + auto-4D | chainage axis (P5) |
| Quantification | QTO / rates, 4D5D export (4) | per-km (§E.6) |
| Search / selection sets | Find (data-driven) | pset fields (§E.2) |
| Redline / comments | snags, issues (I) | none expected |
| Animator | CPE films | drive-through film (§G.6) |
| Appearance Profiler | colour palette | colour by pset (sign code, EXISTING vs new) |

**The one new feature a road needs: DRIVE** = walk + gravity onto the road surface + car eye height
+ speed in km/h + optional auto-drive along the P4 centreline, car mesh as avatar. Eye height and
design speed values must be cited (JKR Arahan Teknik / AASHTO), not chosen. Spec it after P4.

---

## §I Auto zoom sizing + GPS site-walk for large models (2026-10-04, user ask)

### I.1 Zoom — framing is already auto; ZOOM DIRECTION is the large-model gap
- **Initial fit is already sized from the model:** `streaming.js:3891-3900` envelope → `dist =
  max(80, envelope×1.5)`, `far = max(10000, dist×5)`. After P1 the road frames at ≈3,150 m, far
  ≈15,750 m; `controls.maxDistance = 20000` (`scene.js:161`) has room. No change needed — witness it.
- **Gap:** OrbitControls dollies toward a FIXED target (the site centre). On a 2 km road, zooming
  in always heads to the middle; reaching a spot 1 km away means pan-zoom-pan, and dolly slows as it
  nears the target. **Fix: `controls.zoomToCursor = true`** — supported by our shipped
  `lib/OrbitControls.module.js`. Zoom goes toward the point under the pointer/pinch (Google Earth /
  Navisworks behaviour).
- **Impact:** changes zoom feel on EVERY building (one-line change, but universal). Options for
  review: on for all, or on only when `envelope > N` (N from the site profile, P4). Witness: wheel
  steps over a far point → camera-to-point distance shrinks while the point stays under the cursor
  (screen-space drift in px, asserted), on Hospital + JELAPANG.
- Near plane: stays P3 (measure first).


### I.3 Strays shrink the VIEW, not the model — LTU measured (2026-10-04)
User: "LTU … due to large strays ends up very small — same with this highway?" Measured with the
same web-ifc probe on all 9 `internal/UNMERGED/LTU_AHouse_*.ifc`: every file spans 119–174 m,
**except PLB = 426.0 × 260.7 m** (strays). Shipped `LTU_AHouse_extracted.db` x 199.6→625.1
(= 426 m). All < 1500 ⇒ the units heuristic **never fired on LTU** — P1 does not change LTU.
LTU looks small because the camera fit uses the full min/max envelope (`streaming.js:3870-3891`):
PLB strays stretch it from ~170 m to 426 m, so the building is framed ~2.5× too far. Different
cause from JELAPANG (real ×0.001 shrink), same symptom.
**Fix (separate, small): robust framing** — envelope from the 2nd–98th percentile of element
centres instead of min/max, strays still loaded and visible. Impact: initial camera on EVERY
building (only changes where strays exist). Witness: per fleet building, envelope before/after;
LTU ~426 → ~170 m expected; buildings without strays change < 5%.

### I.2 GPS site-walk — `walk.js` exists, but its anchor assumes a building
How it works now (read `walk.js`):
- Anchor = nearest **door** (`:40` `findNearestDoorPosition`), else the building centre (`:44`).
  JELAPANG has no doors → anchor = site centre, **~1 km from wherever the user stands**.
- GPS → model = metres from the anchor's GPS fix (`:268-273`, flat 111,320 m/deg — fine over 2 km),
  rotated by true north (`:275`). JELAPANG true north = `0 (source=default_zero)` → **unknown**, so
  the blue dot can move in the wrong direction.
- Height snaps to **storey** floors (`:283-293`) — none on a road.

So on the road today the blue dot would start in the wrong place and may track in the wrong
direction. Two fixes, best first:
1. **Real georeferencing (no anchor at all).** The model's coordinates (x ≈ 27.6–29.7 km,
   y ≈ −24.2 to −22.9 km, metres) look like a Malaysian state grid (a Cassini-Soldner state
   grid is a candidate — **unconfirmed**). The Civil 3D drawing has its coordinate system set —
   **ask the designer for the CRS code**. With it, GPS lat/long → model x/y is an exact projection:
   blue dot right anywhere on the 2 km, north solved, no tap. (IFC2X3 can't carry it; IFC4.3
   `IfcMapConversion` can.)
2. **Two-tap anchor (fallback when no CRS).** User taps where they stand on the model at two
   spots ≥ ~50 m apart while GPS records each → solves offset + rotation from measurements.
   Replaces the door anchor for sites without doors.
- **Height:** drop storey-snap for sites; put the dot on the surface below (raycast — same need as
  DRIVE, §H). One shared "ground under point" function, not two.
- **Witness (no field trip needed):** feed recorded GPS fixes (synthetic track along known model
  points converted through the CRS) → blue dot within X m of the expected model point; with no CRS
  and no two-tap → `§WALK_GPS INCONCLUSIVE no georef`, never a silent wrong dot.

---

## §J Very long roads (100 km) — DLOD is not enough; it needs section streaming (2026-10-04)

**What our DLOD does today (read `dlod.js`, `dlod_nav.js`, JELAPANG log):** draw-time only.
`§DLOD_ENABLE mode=per_slot_frustum` hides instances outside the camera view; `dlod_nav.js` swaps to
boxes while moving. Real geometry **stays loaded** — geometries are shared and "disposed never"
(`dlod_nav.js:475`, `:1397`). So DLOD saves GPU draw work, **not memory**.

**Why that matters at 100 km:** memory, not drawing, is the limit (§F.2). At JELAPANG density
(423.9 MB geometry per this 2 km set; estimate, linear) 100 km ≈ **~21 GB** — beyond the browser's
4 GB wasm ceiling by ~5×, and beyond the GPU too. No amount of hiding fixes that; the data must
never all be in memory at once.

**Design (industry-standard hierarchical LOD — the approach of OGC 3D Tiles / Google Earth):**
1. **Chainage tiles.** Cut the road into sections (~1–2 km, size from measured MB per tile) at
   import/extract time; one geometry pack per tile, keyed by chainage range (needs P4 centreline).
2. **Load near, coarse far, drop behind.** Full-detail tiles only within a view distance of the
   camera; tiles further out shown as a light proxy (road surface ribbon / decimated slabs /
   bbox); tiles out of range evicted (geometry actually disposed — the step today's DLOD never does).
3. **Per-tile origin.** Each tile's coordinates relative to its own centre → sub-mm precision at
   any length (beats the ±50 km → 3.9 mm global case in §F.1).
4. **Metadata stays whole.** `elements_meta` (names, discipline, psets) for all 100 km is small —
   Find / QTO / 4D work on the whole road; only geometry streams.
5. **Reuse, don't add a second engine:** extend the existing DLOD to own load/evict (one
   implementation per responsibility). `city.js` already loads many buildings into one scene —
   check whether it unloads before choosing it as the base (NOT checked yet).

**§J.1 Swapping without a freeze (user: "it may pause as Google Earth does?").**
- Google Earth doesn't stop — it shows coarse first and sharpens as data lands. We already do that
  pattern on load: `§BBOX_PLACEHOLDERS` → `§BBOX_EARLY` boxes before meshes → `§PROGRESSIVE_FLUSH`
  in batches of 500. Tile swap reuses it: proxy stays on screen until the full tile is ready.
- **A road is easier than a globe:** travel is 1-D along chainage, so the next tile is predictable —
  prefetch ahead in the direction of travel, evict behind. Pause only if the user jumps far (e.g.
  "go to km 80"), and then it's coarse-first, not blank.
- **Origin reset is free:** shifting the floating origin to the new tile is a matrix offset — no
  visible pause. Pauses come from parsing/uploading on the main thread → parse in a worker, upload
  in a per-frame budget. Witness: frame-time max during an end-to-end fly stays under budget
  (`§FPS_MODE` max-frame + `§TILE_LOAD` ms).

**Prerequisites:** P1 (units), P4 (centreline/chainage). **Data needed to prove it:** a longer
real road set — or JELAPANG tiled into ~1 km pieces as a synthetic test (tile count, MB resident
while flying end to end, evictions; `§TILE_LOAD`/`§TILE_EVICT` lines, resident MB never > budget).

---

## §K BIM partner's wish-list — feasibility against THIS data (2026-10-04)
Partner's 8 items, each scored against what JELAPANG actually carries (measured from the IFC
`Design Parameter` psets) and what we already run. ✅ data in hand · 🟡 derivable / partial · ⛔ data missing.

**Extra data found for this:** DRAINAGE psets carry `02_Type` (ROADSIDE DRAIN TYPE 5 ×32, TOE DRAIN
TYPE 5 ×33, SCUPPER ×28, MEDIAN DRAIN TYPE 5 ×24+3, …, EXTENSION CULVERT ×6), `03_Dimension`
(600×600 mm ×79, 1500×1500 ×33, 1500×1300 ×17, 900×900 ×15, 1200×1200 ×4), culvert 1200 mm RCP ×6,
and one culvert's invert levels (in 58.55 → out 57.03 m). LIGHTING psets: only 6 named (TRAFFIC
SIGNAL); **no wattage / lumen / photometric data** for any lamp.

| # | Item | Fit | What it would be | Blocker / data needed |
|---|---|---|---|---|
| 1 | Vehicle simulation | 🟡 | DRIVE (§H) at design speed; **swept-path check** of a design lorry through the roundabout (EXISTING LANE -ROUNDABOUT is in the data) | vehicle dimensions from the standard; centreline (P4). Multi-car traffic flow = a traffic simulator's job, not ours |
| 2 | Lighting lux | ⛔→🟡 | point-by-point illuminance on the road surface (inverse-square × cosine — standard method) as a heat map | **lamp photometry (IES files) + wattage** — not in the IFC; target lux from the Malaysian road-lighting code (designer to cite) |
| 3 | Best route for new utilities | 🟡 | shortest corridor path avoiding existing drains/culverts/sign footings with clearance — our routing + clash engine as the cost | existing-utility data (not in set); ROW width (`31_Lebar_ROW` empty) |
| 4 | Traffic management | ✅/🟡 | **4D by chainage showing lane closures per phase** — EXISTING LANE -J1A/-J1B vs new MAINLINE / J2A / J2B is exactly the input | phase plan from the contractor; chainage (P4) |
| 5 | Drainage flow | 🟡 | flow direction from drain-bottom slope (geometry), connectivity drain→culvert by proximity, capacity by Manning's equation from the extracted sizes | 106 pipes/structures were **skipped by the exporter** — network incomplete; roughness value from the standard |
| 6 | Follow road standard | 🟡 | **rule check**, same engine as our Structural Sanity / Egress findings film (§RULE_FILM): lane widths measured from geometry, sign codes valid against the JKR sign list (codes ARE in the data: WD. 39a, RP. 13 …), clearances | the standard's rule values (JKR road design Arahan Teknik) supplied + cited — never chosen by us |
| 7 | Flood mitigation | ⛔ | hydraulic modelling (catchment, river levels) — specialist GIS/hydraulics territory | terrain (skipped), rainfall, catchment. We could **display** imported flood results, not compute them |
| 8 | Rainfall calculation | 🟡 | **runoff from the road itself** — rational method Q = C·i·A: A = paved area computed from road-surface geometry | rainfall intensity (IDF) for the site from the Malaysian stormwater manual (MSMA); runoff coefficient from same |

**Combined win: 5 + 8** — road runoff (8) vs drain capacity (5) per drain section → "this drain is
under-sized" findings, shown in the model like clashes. Needs only MSMA values + the skipped pipes.

**Recommended order:** 6 standards check → 4 traffic management 4D → 5+8 drainage capacity →
1 drive + swept path → 3 utility route → 2 lux (after IES files) → 7 display-only.
**Ask the partner for:** lamp IES files + wattage · the CRS code (§I.2) · re-export with drainage
pipes/structures + earthwork surface as 3D · the JKR standard clauses to check against · TMP phases.

---

## §L Default standards pack — suggest lux / drain sizes when the designer's data is missing (2026-10-04)

**Rule (fits the PRIME RULE):** a value taken from a **published standard, cited to clause**, is
extraction — not invention. Allowed, on four conditions:
1. Every default lives in a **standards table** (`std_values`: quantity, value, unit, standard,
   edition, clause/table, source-status) — never a constant in JS.
2. **Source-status** is one of: `primary` (read from the standard itself) · `secondary` (quoted by
   a third party — usable for a draft, flagged) · `user` (partner/designer supplied). Output shows it.
3. **Designer data always wins.** A default only fills a field the IFC leaves empty.
4. Anything computed from a default is labelled **SUGGESTED (per <standard> <clause>)** in its own
   colour — never presented as the design.

### L.1 Lighting — what the research found
- Malaysian code: **MS 825** (Part 1:2007 principles; **Part 4:2012 lighting classes**; Part 5
  calculation; Part 6 measurement). Drafts of Parts 4 and 5 were out for public comment
  Nov–Dec 2025 (jsm.gov.my). The class values are **behind the standard's paywall** — buy MS 825-4 to
  make them `primary`.
- **EN 13201-2** (European; MS 825-4 appears to follow the same class scheme — **unconfirmed**)
  M-classes, `secondary` (performanceinlighting.com): M1 L=2.00 cd/m², U0 0.40, Ul 0.70 · M2 1.50,
  0.40, 0.70 · M3 1.00, 0.40, 0.60.
- **What we can do:** (a) **check** — given lamp positions + photometry, compute luminance/illuminance
  on the road grid (the MS 825-5 / EN 13201-3 point method) vs the class target → pass/fail heat map;
  (b) **suggest** — given the road class, propose pole spacing for a reference luminaire. (b) still
  needs ONE photometric file (IES) — a manufacturer's published file the user picks from a catalogue,
  recorded as the assumption. Without any IES file only (a)'s target can be shown, not a result.

### L.2 Drainage — what the research found
- Malaysian manual: **MSMA 2nd Edition** (DID/JPS). Rational method **Q = C·i·A / 360** with C
  from **MSMA Table 2.5**; rainfall intensity i from MSMA's IDF for the nearest station.
- Manning's n for reinforced concrete pipe ≈ **0.012** — `secondary` (generic, not yet read from MSMA).
- **What we can do:** paved area A per drain catchment from road-surface geometry → Q → required
  size by Manning → **suggest the smallest standard pipe/drain ≥ required**, compare with what's
  modelled (sizes ARE in the drainage psets, §K). Standard pipe size list must come from a cited
  source (MS / manufacturer catalogue), not typed in.

### L.3 First step (spec'd, not started)
Buy/obtain **MS 825-4** and **MSMA 2nd Ed. Table 2.5 + IDF for Perak/Ipoh station** → fill
`std_values` as `primary`. Until then any demo runs on `secondary` values with the flag visible.

Sources: https://www.jsm.gov.my/images/Public%20Comment/1%20Nov%20-%2031%20Dec%2025/Draft%20MS%20825-4_202X_PC.pdf ·
https://www.performanceinlighting.com/au/en/en-13201-2-2015 ·
https://www.scribd.com/doc/293680050/MSMA (MSMA reference copy — verify against DID original)

---

## §M Road floats high above the shadow-mode ground (user note 2026-10-04, after #1844 went live)
**Cause (code read + measured on JELAPANG_AFTER.db):** the ground plane height comes from
`tools.js:8-90` §GROUND_Y — steps 1–3 need IfcSlab / storey names (road has neither), so it falls to
step 4 **`MIN(center_z)`** = **−11.1 m**. Element bottoms by discipline:
ROAD 51.1 → 78.7 m (median 57.2) · DRAINAGE 42.9 → 70.6 · FURNITURE 52.8 → 65.1 ·
**LIGHTING −18.1 → 68.4, p5 = −0.6** — a few lighting elements sit at/below 0 m (likely blocks
inserted at elevation 0 in Civil 3D — a source-data stray, same family as LTU's PLB strays).
So the plane sits at −11 m and the road (real elevation ~51–79 m) floats **~62–90 m** above it.
**Two limits, stated honestly:**
1. A stray-robust floor (e.g. low percentile of element bottoms instead of MIN) would put the plane
   at ~51 m — touching the road's LOW end.
2. The road itself climbs ~28 m over 2 km; any FLAT plane leaves the high end up to ~28 m above it.
   The real ground for a road is the terrain surface — which the exporter skipped (EARTHWORK TIN, §B.3).
**Fix options (for review, not coded):** (a) robust floor = p2 of element bottoms when no slab/storey
rule matched — small change, applies only to step-4 models; (b) ask the designer to export the
earthwork/existing-ground surface as 3D → use it as the ground. (a) now, (b) when data arrives.
Owner: `tools.js` §GROUND_Y (one owner — `A.groundIfcZ` is reused by CPE ghost-ground, so the change
flows to them; check `cinema_maxq.js:272` consumer).

---

## §N 4D/5D on a road — what it produces today and what's needed (2026-10-04)
**Today (code read, bim-ootb main):** 4D/5D key on `ifc_class`. JELAPANG is 5674 × `IfcBuildingElementProxy`, so:
- **5D:** every element gets `rates.js:53` `IfcBuildingElementProxy {rate:850, unit:'EA', desc:'Misc Element'}`
  → 5674 × 850 = **RM 4.82 M, meaningless** — a 1.9 km road slab costs the same as one sign.
- **4D:** every element gets `rates.js:289` `{phase:'Architecture Envelope', sequence:5, resource:'MASON'}` —
  one building phase for a whole road.
**What a road needs (non-impact: keyed on the CIVIL discipline codes from #1844, so no building changes):**
1. **5D quantity basis by discipline, measured from geometry:** ROAD → m² (plan area) / m³ (solid
   volume) · MARKING → m (length) · DRAINAGE → m (length, size from `03_Dimension` pset) · SIGNAGE /
   LIGHTING / FURNITURE → EA. Rates from **JKR Schedule of Rates (cited, `std_values` §L)** — never typed.
2. **4D phases by discipline:** earthwork/drainage → pavement → furniture / signage / lighting / marking
   (typical road sequence — to be cited from JKR spec, not assumed), **ordered by chainage band** (needs P4).
3. **Gate:** read `4D_MODEL_INTEGRITY.md` §I ownership table + §E before touching 4D (CLAUDE.md PRIMAL LAW 0);
   use the cached-run witness path (`scripts/cache_4d_run.js`).

## §O Priority list — non-impact items (for "what can we fix now", 2026-10-04)
Ranked by value ÷ risk; "non-impact" = cannot change any building's output.
1. **§M ground floor** — stray-robust floor only on models with no slab/storey match (step 4). Small.
2. **Civil discipline colours** — `rates.js:524` / `import.js:628` have no rows for the 6 civil codes → all
   fall to default. Add 6 rows. Trivial.
3. **§SITE_PROFILE log-only (P4 first half)** — centreline + route length logged, read by nothing yet.
   Settles the "7 km" with a number; unblocks chainage 4D/5D, nav, drive.
4. **5D civil quantity basis (§N.1)** — measured quantities per civil discipline; rates column stays
   empty/flagged until JKR rates are supplied. Replaces the meaningless RM 4.82 M with real m²/m/EA.
5. **Pset extraction to an additive table (§E.2)** — sign codes, component names, drain sizes into a new
   table; existing columns untouched. Feeds Find + 5D.
Not non-impact (need review): zoom-to-cursor (all models), near plane (all), hub disc-list dedupe.

### §O results (2026-10-05, work-to-zero pass)
- ✅ **#1847 MERGED (live, sw v1470)** — cache-bust: #1844 changed `import.js` but not its tag
  (`viewer.html` `import.js?v=4`) → cached browsers kept the old worker; user re-dropped live and still got
  `§CAMERA envelope=2x1x0m`. Fetched back live: `import.js?v=5` → `import_worker.js?v=13`.
  **Lesson: bump the script tag of EVERY changed file, on every page that loads it.**
- ✅ **1. §GROUND_ROBUST + 2. civil colours** — bim-ootb PR #1849 (sw v1471), **open, awaiting the user's localhost
  check**, served at `:8401`. Witness (same SQL on real DBs): JELAPANG reaches step 4 → plane −11.10 → **51.74 m**;
  Hospital / Terminal / LTU_AHouse / Duplex resolve at **step 1** → unchanged. All CI fast-check steps pass locally.
- ⛔ **3. route length** — principal-axis binned-median polyline on ROAD+MARKING+FURNITURE centres is UNSTABLE:
  2,816 / 3,126 / 3,583 m at 100 / 50 / 25 m bins (junction roads J2A/J2B + existing lanes spread 528 m
  laterally). Not shipped. Solid number: **main-axis extent 2,348 m (lower bound)**, axis bearing 22.8°.
  **Question:** can the designer export the alignment (IFC4.3 IfcAlignment, or a LandXML alignment from
  Civil 3D)? That gives route length and chainage exactly; deriving it from solids is a guess.
- ⛔ **4. 5D civil quantities** — 5D owner = `mep_qto_populate.js` → `qto_cache` (keyed ifc_class/storey/
  **discipline** — civil codes slot in) priced from `rates/cidb2024_my.json` (CIDB N3C 2024, SMM2 building items):
  **no road / drain / sign / marking items in it.** **Question:** which civil rate source — JKR Schedule of
  Rates (Jadual Kadar Harga) for road works, or CIDB N3C civil items? Quantities (m² / m / EA) can be built once
  the source fixes the units to measure in.

---

## §P Lamp posts cast no shadow (user, 2026-10-05) — ✅ CODED, bim-ootb PR #1850 (open, on localhost :8401; user confirmed shadows appear, then reported lag → §SHADOW_FOLLOW_THROTTLE pushed to the same PR)
**Cause (code read, `tools.js` §S276b):** shadow box = ±envelope with one 2048² map. JELAPANG env 2114 m →
**2.064 m/texel**; lamp elements (181 tall >3 m, median height 13.9 m, plan-min-width median 1.85 m incl. arm,
pole itself thinner) are sub-texel → no shadow. Sun distance ≈ 4.7 km also stretches the depth range, so the
fixed bias −0.0005 ≈ metres of world depth.
**Fix §SHADOW_FOLLOW:** when whole-site texel > 0.25 m (env > 256 m), box fits the camera neighbourhood,
half = clamp(1.2 × camera-to-target distance, 40 m, env), refit 150 ms after each camera move, sun DIRECTION
kept (TM sun-cycle owns it). Texel at camera distance 30 / 100 / 300 / 1000 m → 0.039 / 0.117 / 0.352 /
1.172 m. Fleet (Hospital 151, LTU 126, Terminal 69, Duplex 22 m envelopes) → texel ≤ 0.147 m → follow OFF,
unchanged. Log `§SHADOW_FOLLOW half=… texel=…`. Not yet read from a live browser run.

## §Q Time Machine has no discipline breakdown (user, 2026-10-05) — ✅ CODED, bim-ootb PR #1851 (open, localhost :8402)
**Cause (code read):** 4D phase owner = `schedule_author.js` `matchNameOverride()` → `matchRule(cls)` with
tables in `rates.js` (`4D_MODEL_INTEGRITY.md` §I row "what phase/trade is this element?"). Class-only.
JELAPANG = 5674 × IfcBuildingElementProxy → `rates.js:289` one phase `Architecture Envelope` / MASON.
An engine-level `breakdownByAttribute(db, sched, task, 'discipline')` exists (`schedule_author.js:2998`,
sync op `'breakdown'`) but **no UI calls it** — and on the old all-ARC import it would SKIP (single_group).
**Design (civil-only, so no building changes):** a civil override layer ahead of the class rule —
`rule = civilRule(discipline) || matchNameOverride(...) || matchRule(cls...)`, `civilRule` only for the
CIVIL_DISCS codes from #1844. Call sites that must all carry discipline (one relation, every consumer):
`schedule_author.js:555` (`_buildScheduleElements`), `:1871` (`materializeDefault`), `:2134` (width
re-derive), `time_machine.js:3605` `_classifyRule`, `schedule_diff.js:144`. Their SELECTs don't read
`m.discipline` today — add it.
**Civil phase order (default, `secondary` per §L):** EARTHWORK → DRAINAGE → ROAD (pavement) →
FURNITURE / SIGNAGE / LIGHTING / MARKING (finishing). Source so far: JKR road-works method statements
quoting JKR Standard Specification for Road Works (JKR/SPJ/2008) — primary document not yet read.
**Concrete design (2026-10-05):**
1. `rates.js` gets `SEQUENCE_CIVIL` keyed by discipline — DRAINAGE→`Drainage` seq 2, ROAD→`Pavement` 3,
   FURNITURE→`Road Furniture` 4, SIGNAGE→`Signage` 4, LIGHTING→`Road Lighting` 4, MARKING→`Road Marking` 4,
   EARTHWORK→`Earthworks` 1. **resource = the trade the proxy class gets today (MASON)** so durations equal
   today's per-element calc — no new trade/productivity invented; durations are flagged NOT civil-calibrated.
2. Phase owner: `civilRule(discipline)` consulted before `matchNameOverride`/`matchRule` at every site that
   assigns a phase; the sites' SELECTs add `m.discipline`. Non-civil discipline → `civilRule` returns null →
   path byte-identical.
3. **Separate template `rates/4D_template_civil.json`** (copy of calendar/duration/capacity rules; civil
   phases, scope `building`, deps: Earthworks→Drainage→Pavement→{Furniture,Signage,Lighting,Marking} FS).
   `4D_template.json` is NOT edited (editing it would add "phase absent" reports to every building's log).
   Time Machine picks the civil template only when every element's discipline ∈ CIVIL_DISCS.
4. Expected JELAPANG result: tasks Drainage(200) → Pavement(4008) → Furniture(1011) ∥ Signage(138) ∥
   Lighting(227) ∥ Marking(90); Earthworks reported absent (0 elements).

**§Q result (2026-10-05):** witness `viewer/tests/witness_civil_phase.js` — JELAPANG 1 phase → 6 tasks: Drainage 200
(d0–3) → Pavement 4008 (d3–48) → Road Furniture 1011 (48–60) → Signage 138 (60–62) → Road Lighting 227 (62–65) →
Road Marking 90 (65–66); Earthworks absent (`_empty_ok`). Finishing trades are logically parallel (all FS after
Pavement) but serialized by capacity levelling because all four book MASON — resolves when civil trades/rates exist.
Duplex identical ON/OFF. **Fleet non-impact, civil table ACTIVE:** `cache_4d_run` main (3fd88da61c41) vs branch
(a243e908765d) — Duplex, Terminal, Hospital (63,182 els / 36 tasks), LTU_AHouse: run.json els/sched/play/tasks
identical; witness.log differs only in ms. Existing 4D witnesses identical to main (band_monotonic 5/6 FAIL pre-existing).
**Gate before coding:** this changes `schedule_author.js` → the 4D run cache key (CLAUDE.md PRIMAL LAW 5)
invalidates; run `scripts/cache_4d_run.js` before/after on the 4 fleet buildings and assert their
schedules are byte-identical (civil layer never fires on them), plus JELAPANG → 4 phases in that order.

## §R Civil rate source — decided: JKR (2026-10-05)
User: "obtain std default from CIDB or JKR whichever is more commonly used." Research:
- **JKR "Jadual Kadar Kerja Kejuruteraan Awam dan Bangunan" (Schedule of Rates for Civil Engineering and
  Building Works), 2023 edition** — itemised unit rates incl. drainage etc.; used for JKR project estimates;
  RM 20 from the Procurement Management Unit, Ministry of Works. JELAPANG's own psets are JKR DAK templates
  → it is a JKR project. **This is the one.**
- CIDB N3C (n3c.cidb.gov.my) publishes INPUTS (material prices, wage rates, machinery hire), not road
  unit rates — useful to build up a rate, not a schedule of rates.
**⛔ BLOCKED: the JKR 2023 SoR is a purchased document** — its values can't be extracted without it. Buy
(RM 20) → fill `std_values` as `primary` → build §N.1 quantities in its units.
Sources: https://myepplus.uitm.edu.my/ep/public/iklan/viewFileLukisan/66655/1259 · https://n3c.cidb.gov.my/n3c/about.php


### §R.3 Free official rate sources found (2026-10-05, at close) — NOT yet wired
JKR's national SoR 2023 is a purchased document (RM 20) — no free official copy found (only scribd/academia
re-uploads, not used). **Official, public, state-level schedules exist inside government tender documents:**
- **Selangor tender "JKH Perabot Jalan"** (state tender portal, FPDF, created 2023-09-27, 38 pp) — saved to
  `~/Downloads/JALAN JELAPANG IFC/rates/Selangor_tender_JKH_Perabot_Jalan_2023-09.pdf` (+ .txt). Measured items:
  regulatory signs RM 800–870/Nos, "lampu isyarat dihadapan" (traffic-signal-ahead) RM 900 / 990, chevron
  delineators (several sizes), thermoplastic line marking per Set by road width (e.g. 300 mm/6 mm AC14 5-line
  3.5 m RM 244, 7.0 m RM 480 …). Source URL: https://tender.selangor.my/uploads/eLDSCJ35WfyBH4nMaIK1wCyVVWWVWJexzXTx1xrV/7.%20JKH%20PERABOT%20JLN.pdf
- Kedah premix repair quotation document (pavement items): https://idaftar.kedah.gov.my/upload/Dokumen%20Meja-509-1395.pdf
- Penang JKR quotation summary (2025): https://ep.penang.gov.my/Dokumen_meja/30715/tender_5-%20RINGKASAN%20SEBUTHARTGA%2007.pdf
**Status label to use:** `regional-official` (state tender schedule; Selangor ≠ Perak where JELAPANG is) — cite the
item letter + page; never present as the JKR national SoR. Mapping JELAPANG pset sign names/codes (16_Name /
17_Code) to these items is the next step. JKR SoR purchase still the `primary` route.

### §R.4 CIDB sourced (2026-10-05, user: "can u source CIDB reference")
- **CIDB N3C** (https://n3c.cidb.gov.my — National Construction Cost Centre) publishes Building Material Price, Labour
  Wage Rates, Machinery Hire Rates & Equipment Purchase Price, cost indices (material/labour/machinery/building),
  Tender Price Index. **Every product page is behind Login + a paid "Pricing Data Plan"** (fetched 2026-10-05:
  `/products/building-materials-price`, `/products/labour-wage-rate` show only Login/Subscription). Old `/n3c/about.php` = 404.
  These are INPUTS (cement, rebar, wage per trade per state), not road unit rates — usable to BUILD UP a rate (or to
  calibrate §Q.2 crews' wage), not to price a road m² directly. ⛔ needs a subscription → user decision.
- `cidb.gov.my/eng/construction-material/` lists no price data (MyCESMM2 = measurement method, not rates).
- **Found instead, free + official:** DBKL (KL City Hall) "Jadual Kadar Harga No. 1: Roadworks" for a 2-year road
  milling/resurfacing contract (12 pp, created 2026-01-02): new road m² items (excavation RM 7.00/m², crusher run 225 mm
  RM 19.24/m², ACB28 50 mm RM 27.00/m², AC 40 mm RM 28.00/m²), mill-and-pave, footpath, manholes, **road marking (4-1)**.
  Saved `~/Downloads/JALAN JELAPANG IFC/rates/DBKL_JKH1_Roadworks_resurfacing.pdf` (+ .txt). Source:
  https://eperolehan.dbkl.gov.my/download/7FFDB0A7-5404-4545-B9C4-C6082F6B8C14 — label `regional-official` (KL ≠ Perak),
  cite item no. Covers ROAD m² + MARKING; with Selangor (§R.3) covers SIGNAGE. Still no free source for drains or lamps.

### §R.2 5D civil layer — design (2026-10-05, user: "include rate source 5D too")
Mirror of §CIVIL_PHASE, same gate, same NON-IMPACT rule:
1. **`rates/jkr_sor2023_my_civil.json`** — the civil rate pack: one item per civil discipline (and per
   pset sub-type where the data carries it, e.g. DRAINAGE `02_Type` + `03_Dimension`, SIGNAGE `17_Code`),
   each with `unit` (m² / m³ / m / EA), `rate` and `source:{doc:'JKR Jadual Kadar Kerja Kejuruteraan Awam dan
   Bangunan 2023', item:'<SoR item no.>', status:'primary'|'pending'}`. **Until the SoR is bought every
   `rate` is null + status `pending`** — never a typed-in number.
2. **`RATES_CIVIL` / `rateForElement(guid)`** — one owner (like `civilRuleFor`) consulted before
   `getRate(ifcClass)`; null for non-civil → building 5D unchanged. Consumers (`export_5d`, BOQ charts,
   variation_order, nlp `calcCost`, diff) call the owner instead of `getRate` directly.
3. **Quantities measured from geometry, per the pack's unit:** ROAD m² = plan area (bbox x·y as first cut,
   true area from mesh later), MARKING / DRAINAGE m = length along the long bbox axis, SIGNAGE / LIGHTING /
   FURNITURE EA. Shown with `UNPRICED (JKR SoR 2023 pending)` instead of today's RM 850 EA × 5674 = RM 4.82 M.
4. Witness: JELAPANG 5D total = sum of priced items only, unpriced count reported (VACUOUS-aware — a total
   of 0 with all items unpriced prints INCONCLUSIVE, never RM 0 as a result); fleet 5D export byte-identical.
**⛔ Needs:** a copy of the JKR SoR 2023 (RM 20, Ministry of Works procurement unit) to make rates `primary`.
Steps 1–4 can ship with null rates first (the meaningless RM 4.82 M disappears, quantities appear).

### §Q.2 / §R.2 result (2026-10-05) — bim-ootb PR #1853 (open, localhost :8402)
- **#1850 squash-merged before its throttle commit** (605d8483 only) → re-landed as **#1852** (merged, sw v1475).
  Same orphan landmine CLAUDE.md names (PR #138) — after pushing a follow-up to an open PR, check it is still OPEN.
- **Civil trades:** finishing was serialized NOT by crew capacity (`§TPL_CAPACITY_LEVEL tasksDelayed=0`) but by the
  template instantiator's within-level `cursor` + edge-from-`prevOnLevel` — shared with buildings. Fixed behind a
  template-declared `placement:'logic'` (civil template only). JELAPANG 66 → 60 days; finishing trades all start d48.
- **5D:** JELAPANG BOQ 1 line × RM 850 'Misc Element' → 6 civil lines, material 0 (UNPRICED, JKR SoR pending),
  labour RM 175,894 (MASON-copied crews, flagged). Quantities counted; m²/m need a mesh measure (next).
- **#1853 MERGED. User then: "only one resource in play all the time" → PR #1854.** The generated programme had six
  crews (headless TM: `§CREW_DEMAND`/`§HR_COST` over 6 CIVIL_* trades) but four READERS re-derived resource/phase
  from the class rule: `schedule_read_4d.js` (Gantt resource → MASON only, phase 'Architecture Envelope'),
  `boq_charts` kernel_ops discipline, `cpe_load_path.js`, `edit_delta.js`. All now go through `civilRuleFor`;
  `_GANTT_CACHE_VERSION` 39→40 regenerates programmes saved before the crews. **Lesson: a new owner must be wired
  into every reader of the relation, not just the writers — grep every `matchRule(`/`rules[cls]` consumer.**
- Probe note: a lamp picked by `LIMIT 1` was one of the ~16 LIGHTING strays ~57 m below the road (§M) — its shadow
  test was vacuous; the user confirmed shadows on the real lamps.

---

## §S Drone fly-through along the highway, orbiting the traffic lights (user, 2026-10-05) — SPEC, not coded
**Ask:** a drone flight over the whole length; at important traffic lights it circles and closes in to near walking height.

**What the data gives today (measured on JELAPANG_AFTER.db):**
- A path from ALL ROAD element centres (principal axis, 100 m bins, median per bin) is NOT clean: 23 bins, **max
  sideways jump 173 m** (median 60 m), one empty gap — the junction roads (ROAD J2A/J2B) and existing lanes pull
  the median between carriageways. Height along it 53.2–64.9 m (real road profile — good for a drone height offset).
- The fix is in the data, not a smarter guess: the road solids carry `01_Component_Name` (**MAINLINE 541**, ROAD
  J2A 211, J2B 94, EXISTING LANE… — §E.0). A path through **MAINLINE** elements only follows one carriageway.
- **Traffic lights:** the LIGHTING psets name **6 × TRAFFIC SIGNAL / TRAFFIC SIGNAL COLUMN** (`15_Name`) — the
  stops. Signs add more candidate stops (GIVEWAY 7, U-TURN 4, TRAFFIC SIGNAL AHEAD 4; `16_Name`/`17_Code`).
- **Both need pset extraction (§E.2)** — today the importer keeps none of these fields. That is the gate.

**Design (reuse, no new engine):**
1. **P-1 pset extraction** (additive table `element_psets`, guid/pset/name/value) — importer + DB builder.
   Feeds this film, Find by sign code, and 5D sub-types. Building DBs gain a table; no existing column changes.
2. **Path:** MAINLINE centres → principal-axis order → bin medians → smoothed spline; drone at road height +
   altitude, looking ahead along the tangent. Where the alignment is exported later (IFC4.3/LandXML, §O-3) the
   spline is replaced by it.
3. **Stops:** each TRAFFIC SIGNAL group (clustered within ~50 m) = one beat: slow down, spiral from drone
   altitude down to eye height while orbiting the signal, one full turn, rise back to the path. Orbit/approach
   beats already exist in the film engine (CPE `§CINEMA_ORBIT_V2`, the Reveal pull-in) — reuse them as the beat.
4. **Pacing:** constant ground speed between stops (km/h from a cited design speed, §H), so a 2.3 km+ flight
   length is predictable; total time logged.
5. **Witness (numbers, not eyes):** `§DRONE_PATH` points/length/max-lateral-jump (must fall well below the
   173 m all-ROAD figure); `§DRONE_STOP n=6` each with min camera-to-signal distance (≤ walking range) and
   orbit swept angle ≈ 360°; camera height time series never below the road surface (raycast).

**Order:** P-1 pset extraction → path + stops spec'd numbers → film beat wiring → witness.

## §T What else is important — ranked (2026-10-05)
1. **Merge #1854** (crews in every reader) once checked on localhost.
2. **Pset extraction (§S P-1 / §E.2)** — unlocks the drone film stops + path, Find by sign code / road part,
   EXISTING vs new lanes, 5D sub-types (drain sizes). Biggest single unlock.
3. **Mesh-measured quantities** — true road area (m²) and marking/drain length (m) from the geometry, so 5D
   stops counting (§R.2 step 3).
4. **From the designer / partner:** JKR SoR 2023 (rates) · CRS code (GPS walk, basemap) · alignment export
   (route length, chainage) · earthwork + drainage pipes as 3D (terrain, drainage network) · lamp IES files.
5. **Road-standard rule check (§K-6)** and **drainage capacity (§K 5+8)** — after psets.
6. Alt+S without WebGPU overlay — proposed by the other session, awaiting user approval (§ 2026-10-05 ~01:20).

---

## §U Fly on a road — fog, no-rooms, and the road route inside the existing Fly Tour (2026-10-05)
- **"Fly shows nothing" — cause (headless probe):** fog density 0.004 (sized at `streaming.js:3801` from the 100 m
  default, before the envelope existed) with the Fly camera ~3 km out → nothing visible. Also the `1.5/env` branch
  hides any site > ~375 m from its own framing distance (0.6 %). **PR #1857 MERGED:** re-size after envelope;
  sites past the 0.004 cap use `sqrt(ln2)/(1.5·env)` (≥ 50 % visible at framing distance) → JELAPANG 0.00026;
  fleet stays on the cap (unchanged). Fly Tour logs `§TOUR_NO_ROOMS VACUOUS` when a model has no rooms.
- **User: reuse Fly, scrubber must appear, markers = traffic stops, no new tour → PR #1858.** Property labels
  (`§CIVIL_PSETS`, civil files only, `element_psets`) + `A._civilRouteTour()` in front of `buildTour()`, built
  ONLY from existing actions (moveTo / flyPath / orbit fullCircle / pause). Headless JELAPANG: path 2,373 m
  (541 MAINLINE pieces, 50 m bins, 30 m up, 25 m/s), 5 stops from 6 signal columns (stop offsets 36/62/80/37/173 m),
  12 actions, **scrubber visible, 12 named ticks**, 131.8 s. Gate: `element_psets` — no fleet DB has it.
- Path max step 189 m (dual carriageway / empty bins) — acceptable for a camera, not a measurement.
- New labelled DB for testing: `~/Downloads/JALAN JELAPANG IFC/JELAPANG_AFTER.db` (replaced; 451 MB).

---

## §V Clash on a civil model — why "no clash items", and the next step (2026-10-05, NOT started)
**Cause (code read):** `clash_matrix.js:17-23` looks up a rule per discipline PAIR from `rules.clash_rules`
(source/target discipline). The rules exist only for building disciplines (ARC/STR/MEP…). The old JELAPANG import
had ONE discipline (ARC) → "Matrix needs 2+ disciplines". After a fresh import (6 civil disciplines, #1844) the
matrix can draw, but **no civil pair has a rule** → no clash items.
**Is it useful? Yes** — partner list §K (drainage vs pavement, lighting vs drains, sign footings vs drains,
furniture vs lighting). **Next session:**
1. Find where `clash_rules` is loaded (rules DB/JSON) and its schema (tolerance, type hard/clearance).
2. Add CIVIL pairs as **hard clash only (tolerance 0 = pure geometry, nothing invented)**: DRAINAGE×ROAD,
   LIGHTING×DRAINAGE, SIGNAGE×DRAINAGE, FURNITURE×LIGHTING, SIGNAGE×LIGHTING. Clearance distances only later,
   cited from JKR / MS standards (§L rule).
3. Expect INTENDED hits (culverts/scuppers pass through the pavement by design) — report them grouped by pset
   `02_Type` (e.g. EXTENSION CULVERT, SCUPPER DRAIN) so a reviewer can mark them intended, never auto-hide.
4. Gate = civil disciplines only → building clash rules untouched (NON-IMPACT). Witness: civil pair counts on
   JELAPANG; Hospital/Terminal clash matrix output byte-identical before/after.

### §V.1 Spec — civil clash pairs (2026-10-05, code read on bim-ootb main @3076755f)
**Second cause found (bigger than the missing rules):** `ignore_classes` is per-rule in `clash_rules.json`, but
FOUR copies of the same loop (`measure.js:193` `_clashWhereParts`, `measure.js:332` `_queryClashesPairRtree`,
`clash_matrix.js:17` `_countClashesRtree`, plus the fallback SQL that uses `_clashWhereParts`) merge EVERY rule's
list into one global ignore set. "ARC vs STR" ignores `IfcBuildingElementProxy` → every query drops proxies →
JELAPANG (5674 elements, ALL `IfcBuildingElementProxy`) can never clash, rule or no rule.
Third: `tolerance_m || 0.025` (`clash_matrix.js:296`, `find_ask.js:75`, `measure.js:400`) turns a 0 tolerance into 25 mm.
**Design:**
1. Civil rules in `clash_rules.json` carry `"family": "civil"`; missing family = `building`. Pairs (hard only,
   `tolerance_m: 0`, `ignore_classes: ["IfcOpeningElement"]`): DRAINAGE×ROAD, LIGHTING×DRAINAGE, SIGNAGE×DRAINAGE,
   FURNITURE×LIGHTING, SIGNAGE×LIGHTING.
2. ONE owner `A._clashIgnoreSet(rules, discA, discB)` (measure.js). Pair given → union of `ignore_classes` over
   rules of THAT pair's family. No pair → `building` family if any building rule has both disciplines in the model,
   else `civil`. The four copies call it. Building pairs: the building-family union = today's union (civil lists add
   nothing new) → identical SQL.
3. Tolerance read as `typeof tolerance_m === 'number' ? tolerance_m : 0.025` — building rules are all non-zero
   numbers → unchanged.
4. Intended hits (culverts through pavement) are LISTED, never hidden; grouped by pset `02_Type` in the witness log.
**Witness `viewer/tests/witness_clash_civil_pairs.js` (headless, real measure.js + clash_matrix.js in vm,
better-sqlite3):** issue = "civil models get 0 clash items". RED on main = JELAPANG count 0 for every civil pair
(no rule / proxies ignored). GREEN = each civil pair count from `_countClashesRtree` equals an independent bbox
oracle over the same rows; `§CIVIL_CLASH_TYPES` groups hits by `02_Type`. NON-IMPACT: Hospital + Terminal +
Duplex + LTU per-building-pair counts identical old code vs new code (same DB). Pair with 0 elements both sides →
VACUOUS, not PASS.

### §V.2 Result (2026-10-05) — bim-ootb PR #1859 (auto-merge on, sw v1480, localhost :8402 = branch `feat/civil-clash`)
Witness `viewer/tests/witness_clash_civil_pairs.js` **11/11, 53 rows** (log: run it, ~55 s):
| Pair (tol 0, bbox) | A | B | hits = oracle | old code |
|---|---|---|---|---|
| DRAINAGE×ROAD | 200 | 4008 | 23,288 | 0 |
| LIGHTING×DRAINAGE | 227 | 200 | 1,040 | 0 |
| SIGNAGE×DRAINAGE | 138 | 200 | 385 | 0 |
| FURNITURE×LIGHTING | 1011 | 227 | 253 | 0 |
| SIGNAGE×LIGHTING | 138 | 227 | 12 | 0 |
`§CIVIL_CLASH_TYPES` (pair-ends by drain `02_Type`): DRAINAGE×ROAD led by ROADSIDE DRAIN TYPE 5 7,557 · TOE DRAIN TYPE 5
5,594 · MEDIAN DRAIN 3,882 … SCUPPER 482 · CASCADE 329 · EXTENSION CULVERT 8. Fleet: Hospital 9 / Terminal 9 / LTU 3 /
Duplex 4 non-empty building pairs, every one same sha1 guid-pair list + count old vs new; no-pair clause identical.
**Read honestly:** these are BOX overlaps. Road pieces have large boxes, so 23,288 is mostly box-only; the mesh-exact
verdict (`clash_narrow.js`) runs per page on cell click in the browser, not in this witness. **Next on this item:**
mesh-true count per civil pair (narrowphase over the full set, headless) — that number is the real civil clash list.
Landmine: Settings → Clash Rules saved overrides (`json_clash_rules`) would hide the new rules for that user.

### §V.3 Mesh-true civil clashes (2026-10-05) — existing `clash_narrow.js`, harness `witness_clash_mesh_narrowphase.js`
Run: `BLD=JELAPANG_AFTER BLD_DIR=~/Downloads/JALAN\ JELAPANG\ IFC GPU=sw`, all 5674 streamed, every geometry with a BVH.
| Pair | box | mesh-true (module) | witness oracle | box-only share |
|---|---|---|---|---|
| DRAINAGE×ROAD | 23,288 | 1,852 (+30 touch-only) | 1,854 | 92.0 % |
| LIGHTING×DRAINAGE | 1,040 | 67 | 67 | 93.6 % |
| SIGNAGE×DRAINAGE | 385 | 4 | 4 | 99.0 % |
| FURNITURE×LIGHTING | 253 | 52 | 52 | 79.4 % |
| SIGNAGE×LIGHTING | 12 | 0 | 0 | 100 % |
| **Total** | **24,978** | **1,975** | **1,977** | 92.1 % |
173 of the 1,975 are flat (thinnest overlap < 1 mm = surfaces resting on each other). Narrowphase 17.5 s total.
Witness 7/10 — the 3 FAILs, none caused by civil data:
- I3: 2 of 23,001 CLEAR pairs disagree — OBB says 0.17 mm apart-ish, the oracle says touching. The 1 mm touch rule, at its edge.
- I4: DB matrix vs scene matrix differ by 3.0e-5 m (limit 1e-5). That's float32 precision at 2 km coordinates (~6e-5 m step), not a wrong transform.
- I5: synthetic case S7b (cubes face to face, OBB stage off) → CLASH, expected CLEAR. Pure maths in node (`summary(node) 15/1`),
  independent of the building → a pre-existing narrowphase defect; flagged, not chased here.
Harness bug fixed (bim-ootb #1860): it read tolerance with `|| 0.025`, so it would have run civil at 25 mm.
In the viewer: matrix cell click marks mesh-true per 200-row page; the "Total" stays the box count; Ask/Find skips mesh above 3,000 box hits.

### §V.4 Spec — hide box-only rows on big pairs (user, 2026-10-05: "any thousands means no need to show bbox clashes")
- `clash_rules.json` `display.hide_box_only_above: 1000` (the user's number). When the pair's BOX total (the count
  `_countClashesAsync` already computes) is ≥ it, the clash list skips rows whose mesh verdict is CLEAR (today: struck
  through + "bbox-only"). Rows not yet judged still show until their verdict lands. Header says "N box-only hidden".
- Applies to every model, not only civil (user's rule is by count) — e.g. Hospital ARC×STR 11,906 box hits.
- Below the limit: unchanged (struck-through rows stay visible). 0 or missing = off.
- Witness: headless render of `_renderClashList` with judged rows above/below the limit — hidden count = CLEAR count above,
  0 below; every visible row is CLASH or unjudged above the limit.

### §V.4 Result — bim-ootb PR #1861 (MERGED, sw v1481); harness tolerance fix PR #1860
Witness `witness_clash_boxonly_hide.js` 11/11 (JELAPANG, GPU=sw): DRAINAGE×ROAD 23,288 box → page of 200 = 174 hidden,
26 real (20 shown + "6 more"); SIGNAGE×DRAINAGE 385 → 0 hidden. Header "Total: N" no longer wiped by the mesh refresh.

---

## ▶ RESUME HERE (2026-10-05, session closing — read this first)
**Live on main (bim-ootb):** #1844 units+disciplines+framing · #1847 cache-bust · #1849 ground+colours ·
#1850/#1852 shadow follow + throttle · #1851 TM civil phases · #1853 civil crews + parallel + 5D lines ·
#1854 crews in every reader · #1857 large-site fog + Fly no-rooms message.
#1858 civil psets + road Fly Tour (merged). **Open PR: #1859** civil clash pairs (§V.2, auto-merge on) — check
`gh pr view 1859` before any follow-up push (the #1850 orphan: follow-up pushed after an auto-merge).
**Localhost:** `/tmp/wt-civil-units` served at **http://localhost:8402** (branch `feat/civil-clash`, = #1859);
`/tmp/wt-civil-shadow` at :8401 (old, merged branch — prune when idle). Use `localhost`, not the LAN IP (WebGPU
needs a secure context — other session's note). Test DB: `buildings/JELAPANG_PSETS.db` and `buildings/JELAPANG_AFTER.db` → symlinks to
`~/Downloads/JALAN JELAPANG IFC/JELAPANG_AFTER.db` (labelled, 451 MB; rebuild with the fixed importer if lost).
**Next, in order:** (1) Fly Tour scrubber fails on the user's run (handed over 2026-10-05, undiagnosed) · (2) mesh-measured quantities (road m², marking/drain m) for 5D
§R.2 step 3 · (3) Find by property (sign code / road part) on `element_psets` · (4) road-standard rule check §K-6.
**Waiting on the user / partner:** JKR SoR 2023 (rates) · CRS code · alignment export (IFC4.3/LandXML) ·
earthwork + drainage pipes as 3D · lamp IES files · approval of the other session's no-WebGPU Alt+S overlay.

**UPDATE at close (2026-10-05 ~03:45):**
- **#1858 MERGED** (civil property labels + road route in Fly Tour). Live check: `tour.js?v=19` on Pages contains
  `§CIVIL_ROUTE_TOUR`, live `import_worker.js` contains `§CIVIL_PSETS`.
- **⛔ OPEN — user: "Fly tour not working yet, timeline scrubber does not appear."** Headless on localhost with
  the labelled DB showed the route + scrubber (12 ticks), so the user's run differs — NOT yet diagnosed. First
  check: does the user's DB have `element_psets` (only imports done with the #1858 importer do — an older saved
  import or a fresh import before the deploy has none → `_civilRouteTour` returns null → old orbit fallback, no
  scrubber)? Read the user's log for `[TOUR] §CIVIL_ROUTE` / `§CIVIL_ROUTE skip` / `§TOUR_NO_ROOMS`.
  If `§CIVIL_ROUTE skip mainline=0`: the DB lacks psets → re-import. If absent entirely: tour.js cache/version.
- **Clash is owned by ANOTHER session** (user). #1859 (civil clash pairs) merged to main from branch
  `feat/civil-clash`, which is now checked out in `/tmp/wt-civil-units` (so localhost:8402 serves that branch).
  A background agent this session launched for clash was stopped at the user's instruction — do not resume it,
  do not touch clash files or that worktree.
**Rules that bit this session:** bump the script tag of EVERY changed file on EVERY page (#1847) · a new owner
(civilRuleFor) must be wired into every READER, not just writers (#1854) · fleet non-impact proof = cache_4d_run
before/after with the civil table ACTIVE (`scratchpad/cache4d_civil_on.js` pattern) + headless BOQ for 5D.

---

## §W Building features reusable on roads (2026-10-05)
**Geo-reference: NONE in JELAPANG** — IFC2X3 (no IfcMapConversion), `site_latitude/longitude` unknown,
`true_north_source=default_zero`; coordinates ~28.6 km E / −23.5 km N sit in an unknown local grid → CRS code
needed from the designer (§I.2). Anything sun/GPS/basemap-based waits for it.

### ACTIVE (user, 2026-10-05) — the ONLY one to build now
**Night mode treats road lamps and traffic lights as light sources; Alt+S renders them (photoreal / "surreal").**
- Cause (code read, bim-ootb main): the ONE owner `A._loadNightFixtures` (`viewer/tools.js:1462`,
  §NIGHT_FIXTURE_VOCAB — shared by night point lights, §PHOTO_EMBER, §LAMP_SHAPE_COLOUR, §FIXTURE_EMISSIVE)
  selects luminaires by element NAME containing 'light'. JELAPANG names are `IfcBuildingElementProxy_<id>`
  → zero fixtures → night mode / Alt+S have no lamps.
- Fix shape: inside that SAME owner (no second selector), a civil branch: elements with discipline LIGHTING
  (CIVIL_DISCS) are fixtures; traffic signals identified by `element_psets` `15_Name` LIKE 'TRAFFIC SIGNAL%'
  (6 columns) — signal colour/emissive is a presentation choice, label it. Lamp HEAD = top of the element bbox,
  not its centre (poles median 13.9 m tall). Strays: ~16 LIGHTING elements sit ~57 m below the road (§M) —
  exclude by the same p2-bottom ground (§GROUND_ROBUST) or report them.
- Gate: discipline LIGHTING only exists in civil imports → building fixture lists byte-identical (prove on
  Hospital/Terminal/LTU/Duplex: §NIGHT_MODE fixture count + positions before = after).
- Witness: JELAPANG fixture count from the owner (expected ≈ 227 LIGHTING minus strays, with 6 signals flagged),
  §PHOTO_EMBER lamp count in an Alt+S run — numbers, not screenshots. Use localhost (WebGPU needs a secure context).

### §W.1 Spec as built (2026-10-05, this session) — branch `fix/civil-fly-night`
User rules this round: "behave as expected when imported fresh, all injection needed is done, or lazy when Fly is
called" · "consider road street/traffic lights" · "elegant, does not impact nor hard code project values in algorithm".
- **Night (`tools.js` A._loadNightFixtures, same owner):** selector = discipline LIGHTING (civil-only). Light at the
  LAMP HEAD read from the element's own mesh: pole = mean of vertices in the bottom 1 m; top band = top 0.5 m;
  head = top-band vertices at the far end from the pole (each side → a double-arm column gives 2 heads; < 0.8 m
  offset = lantern on top). World = DB centre + (local − local mid), rotation_z applied. Rejected + counted:
  STRAYS = below the largest jump in sorted LIGHTING bottoms when that jump exceeds the tallest column (smaller group
  only) — tried and REJECTED first: one ground datum (`groundIfcZ` p2 51.7 m → 67 real poles dropped, the road climbs
  47→68 m) and nearest-8-neighbours (dropped 3 real short columns incl. a traffic signal, ~80 m from any other element);
  and height < 2.5 m (bases/boxes; presentation rule). JELAPANG: gap 46.3 m vs tallest 33.4 m → 172 columns / 223 heads
  lit, 9 buried + 46 short skipped, 6/6 signals lit. PR **bim-ootb #1862** (sw v1482, auto-merge). NO pset label is
  read (the handover's `15_Name` idea dropped per "no project values") → signals light because they are LIGHTING
  columns, not because of their name. Measured mesh (JELAPANG): single-arm head 1.3–2.9 m off the box centre,
  double-arm heads 7.5 m apart.
- **Fly (`tour.js` A._civilRouteTour):** label names/values moved to **`viewer/civil_labels.json`** (route_path,
  route_stops + label; Settings-editable, registry in panels.js) — the algorithm holds no project strings.
  **§CIVIL_ROUTE_LAZY:** no labels table / no route_path match → route over every ROAD-discipline piece (stops
  need labels) instead of the orbit fallback. A pre-#1844 import (all ARC, e.g. `JELAPANG.db`) has no ROAD → needs
  re-import (nothing lazy can recover a discipline the file names were never read for).
- **Diagnosis of "scrubber does not appear":** fresh browser import of all 7 IFCs on main → labels kept
  (102,495 rows), §CIVIL_ROUTE 2,373 m / 5 stops / 12 actions, scrubber visible (`witness_civil_fresh_import_fly.js`
  7/7). So the failing run opened an import saved before #1858 → no labels → orbit fallback. The lazy route fixes that.
- Witnesses: `witness_civil_night_lamps.js` (heads at column top ±5 cm, inside the column plan box, some > 0.5 m off
  centre, no stray lit, signal columns lit, Alt+S world list = same list; lazy Fly with labels dropped in page memory
  plays + scrubber) · `witness_civil_fresh_import_fly.js`. Fleet: 0 LIGHTING-discipline rows in all 27 buildings/*.db.

### §Y Measure — item size by double-click (user, 2026-10-05) — SPEC
User: "we place dots to get its length … getting items length is good new idea … double click already gives area.
What if that area is highlighted (the original effect months ago, somehow gone) with its dimensions along its axes?"
**Why the highlight vanished (code read, measure.js:1471 `handleMeasureDblClick`):** elements are drawn in shared
BatchedMesh/InstancedMesh batches now. `hits[0].object` is the whole batch: `_highlightMesh` clones the batch
material (tints all or nothing) and `_meshArea` sums the batch's triangles, not the element's. Same defect on the
"tap same dot" path (measure.js:1330). Mouse NDC also uses window size, not the canvas rect (the click path was fixed, S246b).
**Design (reuse, one owner):**
1. Resolve the element: batchId/instanceId → guid via `A._batchMeta` / `A._instanceGuids` (the picking.js:333
   resolver — call it, don't copy it).
2. Highlight = an overlay mesh built from the element's OWN geometry (`meshCache[hash]`) + its DB world matrix —
   the clash reveal already does exactly this (measure.js ~700–760, red/blue overlap meshes); reuse that builder.
3. Area = triangle area of that element geometry (world scale).
4. Dimensions along the element's own axes: local geometry box (rotation from the element transform) → 3 dimension
   lines on the box edges labelled with metres; the longest = "length". Curved items (a road strip): the box gives
   the chord — say "chord" and report the mesh's centre-line length only when computed (later).
5. Witness by numbers: double-click on known elements → resolved guid = the element hit, dims = its local box
   (±1 mm), area = its own triangles, overlay vertex count = its geometry; a batch with >1 element proves the area
   is no longer the batch sum.

### FUTURE (recorded, not started)
Model comparison/diff of design revisions · snags/issues with QR for inspection · variation orders on civil
rates · rule-findings film for road standards · 2D plan view of the corridor (storey-free) · cross-sections
square to the road · measure-based lane widths/clearances · chainage grid overlay · staffage cars on the road ·
sun path (needs CRS) · ERP fold → JKR asset register.

---

## Status
- 2026-10-04: §0 measured, §A cause read from code, A.3 answered by probe (web-ifc already metres),
  §C redesign + §PLAN (P1–P5, impact) written.
- 2026-10-04 (later): **P1 + P2 + §I.3 framing CODED** — bim-ootb branch `fix/civil-units-disc-framing`
  (worktree `/tmp/wt-civil-units`, localhost `http://127.0.0.1:8401`), sw v1469, NOT merged.
  Witness `viewer/tests/witness_import_units_disc.js` (real worker in vm), BEFORE→AFTER:
  SIGNAGE 2.0×1.2 m ARC → 2023.7×1196.8 m SIGNAGE; LIGHTING 2.0×1.2 → 2048.8×1189.3 m LIGHTING;
  DRAINAGE 2004.6 m / MARKING 2004.3 m / FURNITURE 1940.0 m each own discipline; EARTHWORK INCONCLUSIVE
  (0 elements); SampleHouse 14.0×5.9×3.5 m ARC 38 / STR 20 both sides (regression guard).
  Filename sweep 464 names: first cut changed "IFC4 Demo Library.ifc" → DEMO (wrong) → space-split
  limited to civil words → 13 changes, all road/furniture/drainage files.
  Framing impact: plain p2–98 tightened Hospital 151→85 m (real wings) → gated on full > 2× core:
  LTU 426→126 m TRIM; Hospital 1.8, Duplex 1.3, Terminal 1.15 KEEP. Browser §FRAME_ROBUST line not
  yet read from a live run. ROAD.ifc (278 MB) not run through the witness (time).
- 2026-10-04: **LIVE** — bim-ootb PR #1844 squash-merged `011dd746`, CI fast-checks + e2e green, Pages
  serves sw v1469 (fetched back: `UNITS_V3`/`CIVIL_DISCS`, `FRAME_ROBUST`, `import_worker.js?v=13`,
  `streaming.js?v=79`). Full 7-file federated build in Node (incl. ROAD.ifc) = `JELAPANG_AFTER.db`:
  5674 elements, 2114×1296×96 m, ROAD 4008 / FURNITURE 1011 / LIGHTING 227 / DRAINAGE 200 /
  SIGNAGE 138 / MARKING 90, georef offset (28608,−23548,0). User confirmed it works on localhost.
  **Next: §PLAN P3 measure (near plane on the real-size road), then pset extraction (§E.2).**

## 2026-10-05 ~01:20 — Alt+S on JELAPANG_AFTER.db: NO STALL REPRODUCED (headless, this machine)
red1: "process seems to stall towards the end … maybe it is too big". URL tested = red1's own:
`http://192.168.1.22:8402/viewer/viewer.html?db=/buildings/JELAPANG_AFTER.db#bld=JELAPANG&cx=1169&cy=542&cz=226`
(served tree /tmp/wt-civil-units @15f2909a). Runner = Playwright headless, `--use-angle=gl`, 1600x900, under gpu.lock.
- Model: 5,674 elements, ALL IfcBuildingElementProxy, extent 2,137 x 1,324 x 120 m; DB 428 MB; page heap 1.72 GB flat.
- Light-zone grid: `§LIGHT_ZONE VACUOUS no boundary geometry (guids=0)` -> `§SOURCED_LIGHT skipped` (BOUNDARY list has no
  proxies). Grid NOT built — so the uncapped 0.5 m grid (would be ~2.8e9 cells / 5.5 GB at this extent, light_zones.js:343)
  is NOT the stall. It is a latent risk for any civil model that DOES carry IfcSlab/IfcWall.
- Shadow: `§STILL_SHADOW_FIT env=4653 … texel 0.8178 at 8192 mode=single` — fits, 89 ms.
- Timeline after press: staging 1.8 s, `§STILL_REFINE done` 1.0-2.8 s, `§PHOTO_AO done` 0.4 s, `§FAULT OK`; toast hidden,
  `_stillRefineActive=true busy=false`; 133 s of heartbeats after, page responsive. Run twice, same result.
- `§GI_STILL_OFF reason=no-webgpu` in both runs: http://192.168.1.22 is not a secure context, so `navigator.gpu` is absent
  (gi_still.js:917). Same holds in red1's Chrome on that URL, so the GI bounce stage is not in red1's path either.
- RESOLVED same night from red1's own console log (Chrome, RTX 4060 Vulkan, 1544x961): it is NOT a hang. The log ends at
  `§PHOTO_AO done … (frozen with AO — stays until interaction)` = the normal end, identical to the headless runs.
  CAUSE: on http://192.168.1.22 `navigator.gpu` is absent (not a secure context) -> `§GI_STILL_OFF reason=no-webgpu`.
  The Save PNG / Close overlay is built ONLY by gi_still.js (:867, WebGPU path). effects.js:5973 just hides the toast when
  refine ends, and `§STILL_LOCK` swallows clicks (only Esc exits). So the user sees a frozen picture, no status, no button.
  Not size-related; hits every building opened from a LAN IP. Workaround: open via http://localhost:8402/… (secure context).
  Proposed fix (awaits red1 OK, UI change): on the no-bounce path show the same overlay (Save PNG / Close) when §PHOTO_AO done.
