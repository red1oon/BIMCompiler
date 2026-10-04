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

## Status
- 2026-10-04: §0 measured, §A cause read from code, A.3 answered by probe (web-ifc already metres),
  §C redesign written. **Next: implement A.4 (delete heuristic) + W-UNITS-DECLARED, re-import JELAPANG.**
