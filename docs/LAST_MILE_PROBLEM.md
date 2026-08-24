# The Drift
> **Foundation:** [BBC](BOMBasedCompilation.md) · [DATA_MODEL](DATA_MODEL.md) · [BIM_COBOL](BIM_COBOL.md) · [MANIFESTO](MANIFESTO.md) · [TestArchitecture](TestArchitecture.md)

<div class="bim-banner" markdown>
<b>AI cannot repeat an outcome. Determinism is our religion here.</b>
</div>

[Vibe Programming](VibeProgramming.md) under strict architectural supervision built this compiler — but AI cannot see spatial geometry. It doesn't know a wall must sit on a slab, or that two columns can't overlap. Months of frustration revealed a pattern: the code drifts from spec precisely where spatial reasoning is required. This document tracks every known drift point between "it compiles" and "it ships with no AI inside."

See [BIMEyes](EYES_SRS.md) for how we taught the compiler to see. Below is the way we harness in Claude Code AI.

---

## Drift Gate

Before writing code that implements a spec section, the AI MUST:

1. **Quote the spec section** it is implementing
2. **Follow the spec mechanism**, not invent a shortcut — same output via a different path = draft
3. **Ask** if the spec is unclear — never guess
4. **Log a new drift point** before deviating from spec

---

## Session Checklist — 11 Drift Points

Every session ends by checking these 11 areas where AI-generated code is known to drift from spec. Each cites the spec section it guards.

### 1. Input = Output?
**Spec:** [BBC §2.2.1](BOMBasedCompilation.md) count invariant — SUM(non-PHANTOM qty) = output count.
**Prerequisite:** §3 (Compiler Only) must PASS first. If output was not compiled — only extracted — this count is a **draft**, not a verdict. (CP-5)

The compiler must produce exactly the same number of elements as the BOM specifies. Not more (over-production = splitting when it shouldn't), not fewer (lost elements = broken walker).

| Building | Elements | Verdict |
|----------|----------|---------|
| SH | 58/58 | PASS |
| FK | 82/82 | PASS |
| IN | 699/699 | PASS (120 window coordinate shifts — CLUSTER debt) |
| DX | 1099/1099 | PASS (MIRROR dimension swaps accepted) |
| TE | 48428/48428 | PASS (48336/48428 identity-matched = 99.8%) |

### 2. LOD400 Geometry?
**Spec:** [BBC §2.2](BOMBasedCompilation.md) — every leaf product resolves to component library geometry, never a fallback shape.

Zero `GEO_` fallback hashes in output. Every element's mesh traces to a real LOD entry in `component_library.db`. If the compiler generates a placeholder box instead of real geometry, this check catches it.

**Verdict:** PASS — G5 provenance and C8 geometry diversity both GREEN.

### 3. Compiler Only?
**Spec:** [BBC §2](BOMBasedCompilation.md) Compilation Model — every element traces to IFC extraction or BOM template. Nothing invented.

The compiler must never connect to `*_extracted.db` during compilation. It reads only from `{PREFIX}_BOM.db` (the dictionary) and writes to `output.db`. Three tamper rules (T18/T19/T20) enforce zero references to extraction databases in compiler source code.

**MEP_RECIPE cardinal rules** (violation = invention): MEP_RECIPE archetypes are
abstract patterns — never explode recipe runs into per-instance LEAF rows during
compilation. Validation Rules determine final expression; the callout only registers
discipline scope and Qty (= IFC element count). LEAF children come from `*_SYSTEM`
BOM only. See: `OrderLineProductCallout.java` and `IFCtoERP.java` class Javadoc,
and [DISC_VALIDATION_DB_SRS §6.2](DISC_VALIDATION_DB_SRS.md#62-discipline-as-a-sub-bom).

**Verdict:** PASS — 0 violations.

### 4. Openings and Furniture?
**Spec:** [BBC §4](BOMBasedCompilation.md) tack convention — doors sit in walls, windows sit in walls, furniture sits in rooms.

Hosted elements (doors, windows) must reference their host wall via `host_element_ref`. Rotation must match the host face. No overlapping elements within the same product class (P06 proof).

**Verdict:** PASS — rotation witness (W-ROT) proven, P05/P06 zero violations.

### 5. Spec Fidelity?
**Spec:** All sources that dictate output — are they the RIGHT sources?

The real input is a [Construction Order](ProjectOrderBlueprint.md) ([C_Order](MANIFESTO.md#the-order-configure-to-order) → [C_OrderLine](MANIFESTO.md#the-order-configure-to-order)). The order references products from the BOM dictionary, and the compiler explodes it into placed elements. Everything else is supporting data.

| Source | What it dictates | Entry path |
|--------|------------------|------------|
| **C_Order → C_OrderLine** | What to build — the construction order with exceptions | [BIM Designer](BIM_Designer_UserGuide.md) (interactive) or YAML (test harness) |
| `{PREFIX}_BOM.db` | Assembly recipes — the BOM dictionary the order references | [IFCtoBOM pipeline](DATA_MODEL.md) (once per building type) |
| `component_library.db` | Product geometry, meshes, materials, orientation + `ad_slab_spec` (per-building slab overrides) | Extraction + curation |
| `ERP.db` | Validation rules — fire protection, MEP spacing, jurisdiction | [DocValidate](DocValidate.md) rule packs |
| `*.bimcobol` | Verb recipes: PLACE BOM, ROUTE, WIRE, TRIM | [BIM COBOL](BIM_COBOL.md) scripts |
| `BIMConstants.java` | Dimensional fallbacks (wall thickness, door/window dims) | Code constants — `ad_slab_spec` overrides slab thickness |

**Note:** `classify_*.yaml` is how the test harness represents a C_Order — it seeds the order and BOM for Rosetta Stone verification. In production, the [BIM Designer](BIM_Designer_UserGuide.md) creates the C_Order interactively via [BOM Drop](BOMBasedCompilation.md#34-bom-drop--interactive-modification).

The BOM walker must read products from the compile connection, not from extraction. If any value in the output cannot be traced to one of these sources, that's drift.

**Verdict:** PASS — all sources audited.

### 6. Output Path?
**Spec:** [BBC §3.3](BOMBasedCompilation.md) — single path: C_OrderLine → BOM explosion → placed elements.

There must be exactly ONE code path that writes elements to `output.db`. No side-channel insertions, no bulk copies, no shortcut SQL. Element counts verified for all 35 buildings.

**Verdict:** PASS.

### 7. Separate From Input?
**Spec:** [BBC §2](BOMBasedCompilation.md) — `{PREFIX}_BOM.db` is a pure dictionary, never written to during compilation.

The compiler reconstructs element positions from BOM tree traversal — it does NOT copy coordinates from extracted input databases. Evidence:

```
1. World origin     m_bom.origin_x/y/z         → SH: (-9.235, -2.746, -0.470)
2. BOM tree walk    PlacementCollectorVisitor   → accumulate parent + line dx/dy/dz
3. Leaf expansion   anchor + verb offset + ½dim → centroid (cx, cy, cz)
4. AABB write       ElementPersistence          → INSERT elements_rtree
```

The 1mm rounding (maxZ: 2.474 input → 2.473 output from `allocated_height_mm=2473`) is the fingerprint proving the compiler reconstructs from BOM integers, not float copies.

**Verdict:** PASS — T18 guards enforced, BOM tree forensic verified.

**Smoking gun: GEO debug mode (P123).** `bim.geo.debug=true` in BIM.properties
activates a `[GEO] TACK` channel in `PlacementCollectorVisitor`. Every element
emits its tack chain with IFC GUID from the exact line that computed the position.

**Evidence: `evidence/SH_GEO_proof_20260330.log`** — the first full GEO run.

```
[GEO] TACK ENTER SH_BED_SET depth=1: parent=(0.0000,0.0000,0.0000)
        + line=(13.3480,3.6925,0.4700) → anchor=(13.3480,3.6925,0.4700)
[GEO] TACK LEAF  Furniture_Bed guid=1RS53LK$j6KOlAGwxTiY8D
        anchor=(13.3480,3.6925,0.4700) + offset=(0.0000,0.0000,0.0000)
        → LBD=(13.3480,3.6925,0.4700)
[GEO] TACK LEAF  Furniture_Desk guid=3cUkl32yn9qRSPvBJVyZVU
        anchor=(13.3480,3.6925,0.4700) + offset=(0.4230,2.6015,0.0000)
        → LBD=(13.7710,6.2940,0.4700)
```

**Verified result (S100 fleet run, 24 buildings):**

| Metric | Result |
|--------|--------|
| Buildings verified | **24/24** (all extracted RE + CO) |
| Buildings ZERO DRIFT | **22/24** |
| Pre-existing anomalies | 2 (IN double-walk 11.97m, GH 4.7mm accumulation) |
| No-data | 1 (HI — no IFC GUIDs in extraction source) |
| Largest clean run | **CP: 6,584 elements, 21.7M pairs, 0.000mm worst** |
| SH | 58 elements, 1,653 pairs, 0.002mm worst |
| DX | 179 GUID-matched, 15,931 pairs, 0.004mm worst |

The two anomalies are pre-existing architecture issues, not compilation
errors: IN has overlapping BOM paths that double-walk the same GUID through
different coordinate frames; GH has floating-point accumulation through a
deep tack chain. Both are diagnosed from the GEO log without code inspection.

Every spatial relationship in the house — bed to desk, window to wall,
door to room, slab to column — is preserved to 2 microns. The IFC GUID
on each element traces it back to the original IFC entity.

**Three proofs per TACK LEAF line:**

- **A (formula execution):** the line emits from PlacementCollectorVisitor
  line 325 using local variables `anchor`, `offsets[qi]`, `iHalfW`. If it
  emits, the tack math ran. If absent, drift signal.
- **B (data provenance):** `guid=1RS53LK$j6K...` traces this element to
  IFC entity via `m_bom_line_ma`. 58/58 GUIDs carried through.
- **C (spatial fidelity):** relative offset between any two elements in
  compiled output matches extraction within 0.002mm. Not checked per-line
  yet — verified by post-hoc all-pairs join (see evidence log).

**Verification script:** [`scripts/geo_verify.py`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/geo_verify.py)
joins GEO TACK LEAF log against extraction DB by IFC GUID, computes all-pairs
relative offsets, reports MATCH/DRIFT. Verified results:

| Building | Elements | GUID-matched | Pairs | Worst | Drift |
|----------|----------|-------------|-------|-------|-------|
| SH | 58 | 58 | 1,653 | 0.002mm | 0 |
| DX | 1,099 | 179 | 15,931 | 0.004mm | 0 |

```bash
python3 scripts/geo_verify.py \
    "logs/pipeline_Sample House_extracted_20260330_033940.log" \
    DAGCompiler/lib/output/samplehouse.db \
    DAGCompiler/lib/input/SampleHouse_extracted.db
```

**Next step for coder:** add a `[GEO] SUMMARY` line at end of compilation
that emits the all-pairs relative offset count and worst error automatically:
```
[GEO] SUMMARY 58 elements, 1653 pairs, worst=0.002mm, DRIFT=0
```
This makes the proof self-contained in the log — no post-hoc Python needed.

**Usage:**
```bash
# Activate GEO in BIM.properties: bim.geo.debug=true
./scripts/run_RosettaStones.sh classify_sh.yaml
grep "GEO.*SUMMARY" logs/pipeline_Sample\ House*.log
# Output: 58 elements, 1653 pairs, worst=0.002mm, DRIFT=0

# Filter to specific elements (avoids 48K lines on TE)
-Dbim.geo.filter=Desk
```

### 8. Visual Fidelity?
**Spec:** [TestArchitecture](TestArchitecture.md) C8 (geometry diversity) + C9 (axis dimensions) + P06 (overlap).

Three independent proofs triangulate visual correctness: per-instance geometry resolution (C8), axis dimension matching within 1mm (C9), and no same-class element overlaps (P06). [BIMEyes](EYES_SRS.md) adds ~14 per-element geometric proofs.

**Verdict:** PASS.

### 9. Orientation?
**Spec:** [BBC §4](BOMBasedCompilation.md) — rotation is a property of the BOM line, not invented at compile time.

Doors and windows must face the correct direction. `host_element_ref` links each opening to its host wall. Orientation data seeded from extraction (M16/M17 SQL).

**Verdict:** PASS — W-ROT witness proven. Rotation read from `m_bom_line.rotation_rule` (PlacementCollectorVisitor:183).

**PASS (S100-p91):** ProveStage rewired to BOM tree proofs (BomTreeProver). `hasRelationalData()` gate removed — ProveStage now runs for every building with compiled elements. Four BOM-term proof checks: P-PARENT (LEAF within parent extent), P-SIBLING (no sibling tack collisions), P-QTY (LEAF qty vs output count), P-TACK (tack position vs element centroid). SH: P-SIBLING 93/93 PASS. P-PARENT/P-QTY/P-TACK produce advisory WARNs (room origins not persisted in c_orderline — gap for future work). ComplianceStage: jurisdiction=MY, 53ms, 8 proof lines.

### 10. Who Checks the Tests?
**Spec:** [TestArchitecture](TestArchitecture.md) §Anti-Drift — no silent re-seal, no weakened assertions.

The tamper seal (SHA256 of 77 critical files) detects if a test was weakened to make it pass. Every seal change requires a full git diff review. T18-T20 tamper rules cross-validate. C8/C9 provide independent arithmetic verification that tests didn't drift.

**Verdict:** PASS — Seal v14 (77 files). Version bumped during S100 script refactoring (4 shell modules added).

### 11. Factorization?
**Spec:** [BBC §6](BOMBasedCompilation.md) verb factorization — N elements → 1 BOM line with qty=N.

Any code that factorizes BOM lines MUST preserve:
- **Material uniformity** — mixed materials → reject, fall through to unfactored
- **Dimension uniformity** — W/D/H within 50mm
- **Instance identity** — GUID `element_ref` preserved per instance
- **element_name ≠ element_ref** — name = product type (for grouping), ref = instance identity (GUID)

**Verdict:** PASS — material guard, identity threading, and per-instance geometry all verified.

---

## Known Limits

Two pre-existing issues that are accepted, not ignored:

| Area | Issue | Since | Why accepted |
|------|-------|-------|-------------|
| DX MIRROR | G2 volume -0.16%, 89 axis swaps (width↔depth in some walls) | S25 | MIRROR verb is incomplete — tracked in [ACTION_ROADMAP](ACTION_ROADMAP.md) CP-2 |
| TE CLUSTER | 1015/48428 elements differ by 1mm at float rounding boundary | S39c | CLUSTER uses ±10% tolerance for semi-regular grids — by design |

### §12 — Proof Data Gap (ProveStage + ComplianceStage)

**Status:** CLOSED (S100-p91)

Both stages now fire on SH and FK:

| Stage | Step | Code | Gate condition | Result (SH) |
|-------|------|------|---------------|-------------|
| ProveStage | 11 | `BomTreeProver` | `elementCount() == 0` | P-SIBLING 93/93 PASS. P-PARENT 15/28, P-QTY delta=2, P-TACK 0/28 (advisory WARNs). |
| ComplianceStage | 12 | `ComplianceStage` | `jurisdiction != null` | jurisdiction=MY, 53ms, 8 proof lines, submission package written. |

**Remaining advisory WARNs (non-blocking):**
- P-PARENT: room origins (from IFC spatial containment) not persisted in c_orderline → parent extent check uses container tacks only
- P-QTY: delta=2 between LEAF qty sum and output count (static children counted differently)
- P-TACK: BOM walker applies room origins internally; c_orderline LEAF dx/dy/dz are post-walk world positions, not raw tack accumulations. Reconstruction gap = room origins not in output DB.

**What changed (p91):**
1. `BomTreeProver.java` — 4 BOM-term proof checks (no sidecar, no geometry language)
2. `hasRelationalData()` gate removed — ProveStage runs for every compiled building
3. `jurisdiction: MY` added to SH + FK YAMLs → ComplianceStage fires
4. Jurisdiction wired: YAML → ClassificationYaml → C_DocType → BuildingRegistry
5. SC_Run.BuildingID uses root BOM id (c_orderline root family_ref), not project name

### R25 — IFCtoBOM QA Failure Not Propagated to Gate Results

**Status:** CLOSED (S100-p67)
**Root cause:** IFCtoBOM pipeline ABORTs to log file. Rosetta script
treats missing BOM.db as "skip" not "fail." G1-G6 gates don't check
whether output was compiled or extracted.
**Fix:** G0-COMPILED gate (checks c_order > 0) + script fail-loud.
**Buildings affected:** TE (CO_TE). Extraction passes, BOM compilation blocked.

---

## Verb Fidelity — Approximate vs Exact

Not all verbs produce exact results. The distinction matters:

| Verb type | Verbs | Tolerance | Gated? |
|-----------|-------|-----------|--------|
| **Exact** | TILE, FRAME, ARRAY | 0mm | YES — G3-DIGEST must match |
| **Approximate** | ROUTE, CLUSTER | ±20% step, ±10% offset | NO — known tolerance, not gated |

ROUTE's `isUniformRun()` guard rejects non-uniform spacing (±20%). Non-uniform groups fall through to CLUSTER or flat writes. See [BIM_COBOL](BIM_COBOL.md) §19 for verb taxonomy.

---

## Geometric Fingerprint — Shape Identity

*This is one technique within [BIMEyes](EYES_SRS.md), the compiler's full geometric comprehension engine (26 proofs, 3 tiers).*

Dimensionless ratios that prove geometric equivalence regardless of scale:

```
Given AABB dimensions sorted smallest→largest as (S, M, L):

planarity   = S / L    "how thin"       → walls, slabs
elongation  = M / L    "how stretched"  → columns, pipes
squareness  = S / M    "cross-section"  → furniture, terminals
```

| Archetype | Condition | Typical IFC Classes |
|-----------|-----------|---------------------|
| PLANAR | planarity < 0.15, elongation ≥ 0.40 | IfcWall, IfcSlab, IfcPlate, IfcDoor |
| ELONGATED | planarity < 0.15, elongation < 0.40 | IfcColumn, IfcBeam, IfcPipeSegment |
| COMPACT | planarity ≥ 0.25, elongation ≥ 0.50 | IfcFurnishingElement, IfcFlowTerminal |

Implementation: `GeometricFingerprint.java`. Thresholds: planarity 0.15/0.20, elongation 0.40, epsilon 5%.

---

## Pipeline Debug — Log-Based Proofing

Following the Compiere/iDempiere convention, the pipeline uses Java's `java.util.logging` levels. Set the level to see more:

| Level | What you see |
|-------|-------------|
| **INFO** | Pipeline stages, gate verdicts, summary counts |
| **WARN** | Non-fatal anomalies (non-zero origins, assembly stubs, proof violations) |
| **FINE** | Stage timings, per-element proofs, automated Drift checklist |

**Rule:** All diagnostic output (rejected mutations, constraint violations, category mismatches) MUST use `BIMLogger.fine()`, never `System.err`. This ensures rejection messages appear in the FINE drift checklist and can be grepped from logs. `System.err` bypasses log filtering and is invisible to auditors reviewing FINE output.

### INFO — what always shows

```
[INFO ] PIPELINE     PIPELINE: Sample House [EXTRACTED]
[INFO ] PIPELINE     STEP 1: METADATA VALIDATION — starting
[INFO ] PIPELINE     STEP 3: COMPILE TO BUILDINGSPEC — starting
[INFO ] PIPELINE     STEP 4: ROUTE STAGE — starting
[INFO ] PIPELINE     STEP 7: VERB STAGE (BIM COBOL) — starting
[INFO ] PIPELINE     PIPELINE COMPLETE: Sample House — 58 elements
```

IFCtoBOM (extraction) logs verb detection and BOM QA at INFO:

```
[verb] Ground Floor STR: 1 verb patterns (4 instances), 12 unfactored
[ASI] SH_CW_STR seq=20: 3/6 instances have dimension variants (BIM_Slab)
=== BOM QA Validation ===
  [PASS] BOM count                                9 (BUILDING=1, FLOOR=4, SET=4)
  [PASS] Extraction reconciliation                58 extraction LEAFs vs 58 extracted (delta=+0)
```

### WARN — anomalies and proof violations

```
[WARN ] QA           [FAIL] Non-zero BOM origins — 1
[WARN ] PROVER       [VIOLATED] P27_WALL_ROOF_INTERSECTION — Basic Wall:Wall-Ext_102Bwk-75Ins-100LBlk-12P
                     — wall.maxZ=2.821 exceeds roofZ=2.071 by 0.750m at (1.64,-1.25)
```

### FINE — per-element proofs + Drift checklist

FINE adds three things: **stage timings**, **per-element mathematical proofs**, and an **automated Drift checklist** that runs the 11 drift points from this document.

Per-element proofs (4 proofs × 58 elements = 232 lines for SH):

```
[FINE ] PROVER       [PROVEN] P01_POSITIVE_EXTENT — Compound Ceiling:Plain — dx=9.3075 dy=5.6550 dz=0.0570
[FINE ] PROVER       [PROVEN] P04_STOREY_Z_BAND — Doors_IntSgl:810x2110mm — Z[0.000,2.145] within [0.0,3.5]±0.5
[FINE ] PROVER       [PROVEN] P05_NO_DUPLICATE_POSITION — GLOBAL — 58 placements, no duplicate centroids
[FINE ] PROVER       [PROVEN] P06_NO_SAME_CLASS_OVERLAP — GLOBAL — 58 placements, no same-class overlaps
[FINE ] PROVER       [PROVEN] P28_ROOF_COVERAGE — GLOBAL — roof covers walls
```

Automated Drift checklist (runs after PIPELINE COMPLETE):

```
[FINE ] DRIFT        LAST MILE CHECK: Sample House (LAST_MILE_PROBLEM.md §Session Checklist)
[FINE ] DRIFT        §1  Input=Output: expected=58, actual=58 → PASS
[FINE ] DRIFT        §2  LOD400 Geometry: 58/58 OK, 0 warn, 0 fail → PASS
[FINE ] DRIFT        §3  Compiler Only: T18/T19/T20 guard (checked at gate)
[FINE ] DRIFT        §6  Output Path: C_OrderLine → BOM explosion → elements (structural)
[FINE ] DRIFT        §7  Separate From Input: bom.db=library/_SH_compile.db
[FINE ] DRIFT        §11 Factorization: BOM line guards (checked at extraction)
[FINE ] DRIFT        SUMMARY: 6 pass, 0 fail, 2 deferred
```

### Spatial accuracy channels (S147)

Added for duplex mirror verification, applicable to all buildings:

```
[INFO ] SPATIAL-REPORT exact=0 drift=0 shift=215 missing=904 extra=0 | modal=[390,22183,1550] | outliers=16 sym=15 asym=1 | verdict=POSITION_ERROR
[INFO ] SPATIAL-REPORT   class=IfcFurnishingElement total=61 outlier=15 sym=15 asym=0 action=trace_tack_leaf
[INFO ] SPATIAL-REPORT   missing class=IfcFlowTerminal count=105 reason=DISC_EXCLUDED
[INFO ] SPATIAL-REPORT   missing_summary: total=904 disc_excluded=904 not_in_bom=0
```

**Reading the report:**
- `modal` = expected global offset (BOM-local vs IFC-world coords). Not a bug.
- `outliers` = elements deviating from modal. `sym` = real position error, `asym` = SpatialDiff mis-pairing.
- `verdict`: `CLEAN` (0 outliers), `FIX_PAIRING` (asym > sym), `POSITION_ERROR` (sym > asym).
- `action`: `trace_tack_leaf` → investigate white box. `fix_pairing` → fix SpatialDiff.
- `DISC_EXCLUDED` = MEP elements correctly excluded from ARC BOM. `NOT_IN_BOM` = genuinely missing.

IFCtoBOM emits BOM tree shape (in the IFCtoBOM log, not the compilation log):

```
[INFO ] BOM-SUMMARY  type=BUILDING boms=1 total_lines=12
[INFO ] BOM-SUMMARY  type=FLOOR boms=8 total_lines=114
[INFO ] BOM-SUMMARY    bom=DUPLEX_SINGLE_UNIT_STD type=FLOOR children=51 instances=51
[INFO ] BOM-SUMMARY    bom=DX_A103_SET type=SET children=5 instances=15 verbs=105chars
```

LOD rotation for mirrored half-units:

```
[INFO ] LOD-ROTATE   IfcStairFlight guid=MD_UNKNOWN_101_B rotZ=3.1416rad (180.0°) mesh=acb724912fe1015c
```

### Quick commands

```bash
grep VIOLATED logs/pipeline_*.log    # Find any proof failures
grep DRIFT logs/pipeline_*.log       # Automated drift checklist results
grep SPATIAL-REPORT logs/pipeline_*.log  # Spatial accuracy diagnosis
grep BOM-SUMMARY logs/*ifctobom*.log # BOM tree structure
grep LOD-ROTATE logs/pipeline_*.log  # B-side mesh rotation proof
grep "Stage.*completed" logs/pipeline_*.log  # Stage timings
./scripts/rosetta_trace.sh <log> <output.db> [ref.db]  # Cross-box correlation
```

---

## The Last Mile crosses to JavaScript — the Modeller Drop (2026-06-22)

The compiler's Last Mile is won (§1–§12). But the browser **DAGeVu modeller** re-implements the placement
in JS to *drop* a BOM (building / floor / room / furniture SET) interactively — and a port is a new last mile.
This section records the textbook drift the doc predicted, and the proof discipline that closed it.

**The drift (exactly where §7 warned):** `viewer/bonsai_library.js expandAssembly` placed leaves with a naive
`world = parent + yaw·(dx,dy) + dz` sum. It reproduced the *easy* half of the Java reconstruction (`BOMWalker`
was ported faithfully) but reinvented the *hard* half (`PlacementCollectorVisitor`) as a shortcut that **dropped
three of the four §7 terms**:

| §7 term | Java `PlacementCollectorVisitor` | JS `expandAssembly` (before) | Symptom |
|---|---|---|---|
| 1. World/sub-BOM origin | `+ m_bom.origin_x/y/z` on descent | dropped | nested sets off by the parent origin |
| 2. Parent + line accumulate | ✓ | ✓ (yaw only) | — |
| 3. `+ ½dim → centre` | LBD-corner → centroid half-extent | dropped | host **8434 mm** off oracle |
| (mirror) | `MIRROR:X` = axis **reflection** | treated as rotation / ignored | DX scattered **±22.8 m** |

The bake (`scripts/extract_dagevu_catalog.py`) compounded it: it read `m_bom_line.dx/dy/dz` verbatim but never
read `m_bom.origin`, never flagged the LBD convention, and classified FLOOR/SET by `bom_level` not `bom_type`.

**The fix (PR #478, sw v697):** `expandAssembly` now folds the sub-BOM origin, **reflects** (not rotates) under
mirror, and adds the half-extent to recover the box centre — the full §7 four-term chain. Revert-safe: the
single-component INSERT path that already worked is untouched (`W-BOM-SPATIAL` regression PASS).

**The proof — the JS twin of `geo_verify.py`:** `scripts/witness_modeller_drop.js` loads the *shipped* module in
a sandbox and asserts host-placement **== the Java oracle to 0.000 mm** (SH 55 leaves, DX set 5), the catalog
satisfies the §1-style IntraBOM invariant (R1 `|dx|,|dy|<10m`, R2 `|dz|<4.5m`, R3 no absolute leak — leaks=0),
and a known leaf lands at the Java BOM-chain centre to 0.03 mm. *Honest scope:* the `TranslationChainTest` Piano
zone-anchor (0.674, 4.109) is a different runtime path (`BOMTierResolver`, never stored in a BOM) — we prove the
achievable BOM-chain target, no invented coordinates.

**The lesson (the doctrine, restated for ports):** *Porting the walker is not porting the placer, and porting the
algorithm is not porting the proof.* The shortcut survived because the simple-insert witness passed; the case that
exercised the dropped terms was never held to the Java's numeric contract. Carry the invariant across, not just
the idea.

### The §GEO_SUMMARY self-proof — the JS twin of §7's "Next step for coder" (DONE 2026-06-22)

The Java compiler emits its own drift verdict (`[GEO] SUMMARY 58 elements, 1653 pairs, worst=0.002mm, DRIFT=0`).
The modeller drop used to prove correctness only in the *external* witness — if `expandAssembly` drifted again,
the running app stayed silent. **Closed (bim-ootb PR #481, sw v698):** every BOM drop now emits a runtime
`§GEO_SUMMARY` so the modeller polices itself the way the pipeline does:

```
§GEO_SUMMARY BUILDING_SH_STD [BUILDING] 55 leaves, 1485 pairs, worst=0mm, DRIFT=0
```

`bonsai_library.js geoSummary(rootId)` recomputes the proven IntraBOM invariant (faithful to
`witness_modeller_drop.js checkInvariant`) over the expanded placement, scoped by bom_type — R1 `|dx|,|dy|<10m`
+ R2 `|dz|<4.5m` for SET/ROOM leaves, and an R3 absolute-leak gate (all-pairs leaf-centre span vs
`env = max(declared bbox, 10m)+3m`). It is **log-only** — reads the catalog + `expandAssembly` output, never
mutates geometry or the op-log — so it cannot regress geometry.

*Honest design note (NON-INVENT):* the catalog's declared bbox is the parent-**product** aabb, not the laid-out
footprint (`BED_SET` declares 1.2×0.6 m but its five children span 3.5×2.0 m), so a tight "span == declared bbox"
check would false-alarm on **correct** data. The gate therefore uses the same *loose* `max(declared, 10m)+3m`
absolute-leak envelope the external witness proved — it passes coherent sets and fires on the ±22.8 m scatter
that PR #478 fixed. Witness `scripts/witness_modeller_geo_summary.js` (**W-GEO-SUMMARY**): all 57 droppable roots
report `DRIFT=0 / worst=0mm`; the line format matches the Java twin; and **G4 falsifiability** — the gate fires
(`worst=4844mm, DRIFT=1`) on a simulated PR #478 scatter, so the self-proof can fail, not just pass.
Resume card: `prompts/RESUME_MODELLER_FOCUS.md` (top block).

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
