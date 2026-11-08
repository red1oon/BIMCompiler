# Test Architecture — QA Hardening Plan

> **Foundation:** [BBC](BOMBasedCompilation.md) · [DATA_MODEL](DATA_MODEL.md) · [BIM_COBOL](BIM_COBOL.md) · [MANIFESTO](MANIFESTO.md) · [ACTION_ROADMAP](ACTION_ROADMAP.md) · [SourceCodeGuide](SourceCodeGuide.md)

<div class="bim-banner" markdown>
<b>9 verification gates. Not sampled — proven.</b> 6 mathematical proofs (G1-G6: count, volume, digest, tamper, provenance, isolation) plus 3 pipeline gates (seed, extraction, geometry verify). If a building compiles, every element is accounted for. The proof is arithmetic, not assertion. No AI in the gates.
</div>

## Anti-Drift Policy (read first)

**These rules override all other instructions. No exceptions.**

1. **No Magic Coordinates.** If a transform requires a hardcoded (x,y,z) instead of a derived DAG offset, STOP. Ask for the parent matrix. Use named constants referencing a standard (IRC/NFPA/IEC) or derive from the database.
2. **No Invented Data.** If the BOM spec is unclear or missing, DO NOT invent a placeholder. Stop and request the specific file or data model. Every `child_product_id` must resolve. Every MAKE needs an M_Product stub.
3. **No Silent Geometry.** Before modifying geometry (scale, translate, mesh bind), state the intended math. Duplicate vertex arrays are waste — check the mesh cache first, normalize hashes to mm precision.
4. **No Hallucinated Success.** If a test fails, state the exact error. Do not weaken assertions, add workarounds, or re-seal without explaining why.
5. **Verify Before Commit.** Run `DataIntegrityTest` (D-1b catches ALL orphan types). Run `RosettaStoneGateTest` (G1-G6). Both must be GREEN.
6. **No Weak Assertions.** No `assertNotNull` as sole verification, no `assumeTrue(false)` (use `@Disabled("TICKET:")`), no digest "not empty" checks — compare to golden value or expected reference.
7. **No Silent Failures.** No `catch (Exception ignored) {}` — log or fail. No `|| true` in scripts — capture exit codes. No write-then-read-back as sole proof — cross-check against reference.
8. **No Silent Re-seal.** Every `[SEAL]` commit must explain WHY the test changed. Review the diff before accepting.
9. **No `System.err` for debug.** Use `BIMLogger.fine()` for rejection messages, constraint violations, and diagnostic output. `System.err` bypasses log-level filtering and is invisible to the FINE drift checklist. Easy to grep: `System\.err` in Java source = drift.

---

## Truth Model (2026)

The verification regime is **three regimes over three surfaces** — not one gate covering all. Each
surface is owned by the regime that can actually prove it; conflating them is how 111 ungoverned
moves once passed unwatched.

| Surface | Truth regime | Fires | Status |
|---|---|---|---|
| **Compiler** (BOM → `output.db` reconstruction) | RosettaStone **G1–G6** (count, volume, digest, tamper, provenance, isolation) — `RosettaStoneGateTest.java`, `scripts/run_RosettaStones.sh` | Rarely, **by design** — the static path matured (116/157 PASS, gate code stable since 2026-05) | Mature |
| **Browser viewer + Red Pill editor** | `§`-log whitebox witnesses (primary) + Playwright (wiring only) + the **G8-GOVERNANCE Red Pill round-trip** (identity + governed-delta — every coordinate change is BOM-explained) | Every PR (bim-ootb CI) + on every governed drag | Live (`docs/RedPillRosetta.md`, W-REDPILL-ROSETTA) |
| **ERP** (AD-driven app, ledger folds) | `scripts/poc_*.js` → `build/erp/poc_*.log` witnesses via `run_witness.sh`; oracle-equivalence diffs | Per change, headless | Active |

**Why the frontier moved.** RosettaStone proves the compiler's *inverse* path (read a BOM, rebuild,
assert every element lands at the reference coordinate). That path is stable, so the gates rarely
need to fire — maturity, not rot. The product is now **browser-first**, and the new capability is the
*forward* path: grammar → 2D grid → drag → re-modelled building. That output is governed by the
whitebox witnesses and the **G8-GOVERNANCE** gate (`RedPillRosetta.md` §5) — the dynamic-truth peer
of G5-PROVENANCE: G5 traces every element to the library; G8 traces every **movement** to a BOM
relationship. This is an **extension** of the truth model, not a replacement — the Java gates remain
the static-compiler authority.

**CI reality (corrected).** There is **no CI in this repo (bim-compiler)** that runs the Java gates —
`.github/workflows/` holds only `docs.yml` (mkdocs) + `traffic.yml` (analytics). So a commit that
fails G1-COUNT *cannot* "break CI" here; the Anti-Drift rule #5 ("both must be GREEN") is a **local**
discipline, enforced by the developer, not by automation. (The **bim-ootb** deploy repo *does* gate
PRs — `fast-checks` + `e2e-tests` are required on `main`.) See [§CI](#ci-system-is-real-gate).

**"Is the system real" entrypoint.** One runner — `scripts/system_is_real.sh` — answers the question
deterministically by fanning out **one** check per regime, fail-fast, each emitting a one-line
verdict: (a) one RosettaStone building (G1-COUNT/G2-VOLUME), (b) the browser local gate
(`deploy/dev/test_all.js` + `audit_specs.js`), (c) one ERP witness (`run_witness.sh`), (d) the Red
Pill round-trip (`§REDPILL-RS`, checked out from bim-ootb). A2 builds it; A3 wires the headless
subset into CI. No regime is silently skipped — a step with no input `log()`s "pending", never passes blank.

---

## Hardening Status

### CRITICAL Fixes (C1–C13)

| # | Fix | Status | Notes |
|---|-----|--------|-------|
| C1 | Golden digest verification | PARTIAL | BOMDigestVerifyTest tree walk DONE. HelloWorldVerbTest golden comparison pending |
| C2 | Content spot-check assertions | DONE | SpotCheckContractTest per-element AABB verification |
| C3 | Gate count cross-validation | DONE | Live query from extraction DB, not hardcoded |
| C4 | DX furniture centroid test | DONE | `@Disabled("TICKET:")` — DX coordinate frame fix deferred |
| C5 | SQL injection | DONE | All PreparedStatement with `?` placeholders |
| C6 | Negative tack offsets | OPEN | 3 m_bom_line records with negative dx/dy/dz |
| C7 | StackedDuplexWitnessTest → JUnit | DONE | Already JUnit 5 |
| C8 | Geometry diversity (C8 SQL) | DONE | Per-instance GUID resolution via I_Geometry_Map. All 5 buildings PASS |
| C9 | Per-element axis dimensions | PASS RM / WARN (JE/HI/SC) | W-AXISDIM-1: X→X, Y→Y, Z→Z within 1mm. DX 87 swaps accepted (S58c). **W-RM-C9 DONE (S104):** `rosetta_fidelity.sh` now uses 50mm centroid proximity join + nearest-neighbour guard (`ROW_NUMBER` on distance) — eliminates rank-match false positives. RM: 160→0. Deduped elements have no output partner in window, skipped. GUID-based matching still blocked for factored products (BOMWalker verb expansion has no per-instance IFC GUID thread) — JE/HI/SC remain WARN. |
| C10 | Mesh centroid fingerprint | DONE | Advisory — facing direction via mesh centroid offset |
| C11 | P06 same-class overlap sharpness | DONE | Cross-product exempt, same-product flagged, IfcPlate 50mm tolerance |
| C12 | G5 GEO_ slab fallback | DONE | Slab flows through MeshBinder to LOD_ library geometry |
| C13 | No parametric mesh in pipeline | SPEC | G5-PROVENANCE Check 6: zero GEO_ hashes. 28 call sites identified |
| C14 | GEO all-pairs relative offset | DONE | [`scripts/geo_verify.py`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/geo_verify.py): SH 1,653 pairs 0.002mm, DX 15,931 pairs 0.004mm. ZERO DRIFT. See [LMP §7](LAST_MILE_PROBLEM.md#7-separate-from-input) |

### HIGH Fixes (H1–H7)

| # | Fix | Status |
|---|-----|--------|
| H1 | Derive test expected values from data (remove magic numbers) | OPEN |
| H2 | Verb wrappers for raw SQL | DONE — T16 tamper rule: 0 violations |
| H3 | Data-driven BOM category mapping | OPEN |
| H4 | Remove building type string checks | OPEN |
| H5 | Fix error suppression | DONE — all log `[WARN]`, resource leak fixed |
| H6 | Semantic witness verification (AABB vs extraction envelope) | OPEN |
| H7 | Re-enable default Maven test phase | DONE — `pipeline.tests.skip` property; `mvn test` runs BIMBackOffice (20/20). BonsaiBIMDesigner needs component_library.db — skipped from default phase |

### MEDIUM Fixes (M1–M6)

| # | Fix | Status |
|---|-----|--------|
| M1 | Remove invented coordinates from backup code | OPEN |
| M2 | Centralize thresholds in BIMConstants | OPEN |
| M3 | Track C_OrderLine as Phase F debt | DONE |
| M4 | Automate expected_elements derivation | OPEN |
| M5 | Remove @Order test dependencies | OPEN |
| M6 | Document ST→RE mapping in data model | OPEN |

---

## Traceability Matrix — Spec → Test → Witness

**Purpose:** When a BBC.md section changes, this table shows exactly which
tests are affected. When a test fails, this table shows which spec it traces
to. Without this mapping, spec changes silently orphan tests.

### BBC.md §1–§3 — BOM Structure and Compilation Model

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §1 Three BOM dimensions | Category+Owner+SpaceSize govern selection | CompilerContractTest | G1-COUNT | PASS |
| §1.1 Disciplines as metadata | No switch(docBaseType) in BOM path | DriftGuardTest D6 | G4-TAMPER | PASS |
| §2 Compilation Model | Every element traces to IFC or template | DataIntegrityTest D-1/D-4 | G5-PROVENANCE | PASS |
| §2.1.6 Count invariant | SUM(non-PHANTOM qty) = output count | ExtractedBOMWalkTest | G1-COUNT | PASS |
| §2.2 Recursive placement | Walker decides BOM-vs-leaf by m_bom existence | BOMWalkerTest | W-DS-15 | PASS |
| §2.2 component_type ignored | No code branches on BUY/MAKE/PHANTOM | DriftGuardTest | G4-TAMPER | PASS |
| §3.3 Instant Drop | C_OrderLine → BOM explosion → elements | RosettaStoneGateTest | G1-G6 | PASS |
| §3.3 Instant Drop | bomDrop() creates C_Order + 58 elements | BomDropTest | W-DROP-1..6 | PASS |
| §3.4 BOM Drop | Interactive tree navigation, swap/add | SelectionCascadeTest | W-GEN-1b | PASS |
| §3.5 Selection Cascade | Category + AABB fit + volume rank | SelectionCascadeTest | W-GEN-1a..g | PASS |
| §3 GENERATIVE | DemoHouse BOM + UBBL + BIMEyes | DemoHouseTest | W-DH-1..5 | PASS |
| §2.2 BOM tree integrity | P-PARENT: every non-root BOM has a parent | BomTreeProver | P-PARENT | IMPLEMENTED |
| §2.2 BOM tree integrity | P-SIBLING: no duplicate children under same parent | BomTreeProver | P-SIBLING | PASS |
| §2.2 BOM tree integrity | P-QTY: all BOM line quantities > 0 | BomTreeProver | P-QTY | IMPLEMENTED |
| §4.0 BOM tree integrity | P-TACK: all dx/dy/dz finite and parent-relative | BomTreeProver | P-TACK | IMPLEMENTED |

### BBC.md §4 — Tack Convention

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §4.0 LBD offsets | dx = child.minX - parent.minX | BomValidator | W-TACK-1 | IMPLEMENTED |
| §4.1 World coord reconstruction | element_LBD = origin + Σ(tack) | PlacementCollectorVisitorTest | SB-2 | PASS |
| §4.1 Origin convention | Only BUILDING BOM has non-zero origin | BOMChainMathTest | — | PASS |
| §4.2 BUFFER invariant | parent.width = SUM(children.allocated_width) | BomValidator | W-BUFFER-1 | IMPLEMENTED |
| §4.3 Centroid drift fix | ScopeBomBuilder uses minX not centroidX | — | W-TACK-1 | IMPLEMENTED |

### G4_SRS — output.db

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §22.3 | compile() produces elements | CompileBridgeTest | W-COMPILE-1..5 | PASS |
| §2.1-3 | CreateNew/Save/Recall lifecycle | — | — | SPEC ONLY |

### DocValidate — Validation Engine

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §15.1 | 3-tier validation (per-disc, cross-disc, vertical) | PlacementValidatorImplTest | 7 tests | PASS |
| §15.3 | Non-Disturbance protocol | NonDisturbanceTest | 6 tests | PASS |
| §15.5 | 17 mining rules (M1-M17) | — | V004_mined_rules.sql | SQL SEEDED |

### LAST_MILE — Geometry Fidelity

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| #8 | Per-instance geometry diversity | GeometryFidelityTest | W-GEODIV-1 | IMPLEMENTED |
| #9 | Per-element axis dimensions | GeometryFidelityTest | W-AXISDIM-1 | IMPLEMENTED |
| #8/#9 | Mesh centroid fingerprint | GeometryFidelityTest | W-MESHDIR-1 | IMPLEMENTED (advisory) |

### Compilation Logging Regime (S147)

Structured log channels emitted by every compilation run. Grepable, parseable,
actionable. Designed for session pickup — any coder can read the state without
running the pipeline again.

| Channel | Emitted by | Module | What it proves |
|---|---|---|---|
| `SPATIAL-REPORT` | CompilationPipeline.GeometryStage | DAGCompiler (black box) | Modal shift, outlier count (sym/asym), per-class diagnosis, missing elements by discipline |
| `BOM-SUMMARY` | IFCtoBOMPipeline (post-commit) | IFCtoBOM (white box) | BOM tree shape: type/count/children/instances/verbs per BOM |
| `LOD-ROTATE` | MeshBinder.bind() + BuildingWriter | DAGCompiler (white box) | B-side LOD meshes received rot=π — per-element confirmation |
| `TACK LEAF` | PlacementCollectorVisitor.onLeaf() | DAGCompiler (white box) | Per-element: anchor + offset + half-extents + AABB + transform state |
| `TACK GUID` | PlacementCollectorVisitor.onLeaf() | DAGCompiler (white box, FINE) | GUID resolution path: MA/LINE_REF/GENERATED + base vs prefixed |
| `LMP-DIFF` | CompilationPipeline.GeometryStage | DAGCompiler (black box) | Per-element AABB comparison (output vs reference), modal shift, outliers |

**Post-hoc tooling:**
- `rosetta_trace.sh <log> <output.db> [ref.db]` — correlates black box outliers
  with white box TACK, DB inventories, and emits prioritised action items.

**Box separation rule:** White box (GEO/TACK) logs what the walker computes.
Black box (LMP-DIFF/SPATIAL-REPORT) compares output vs reference DBs.
Neither inspects the other during execution. `rosetta_trace.sh` reads both
outputs post-hoc.

**Invariants (from BBC.md §4.3):**
- I-GUID-1: Every element_ref matches 22-char IFC pattern (ElementIdentity contract).
- I-GUID-2: SpatialDiff identity overlap ≥ 95% when reference DB available.
- I-GUID-3: SpatialDiff uses identity-based matching (not position fallback).
- I-GUID-4: Zero GENERATED guidSource for extracted buildings.

### BIMEyes — Geometric Comprehension

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| EYES §4.4 | P25 ROOM_VALIDITY | RoomValidityProof | W-ROOM-VALID | IMPLEMENTED |
| EYES §4.5 | P26 BUILDING_COMPLETENESS | BuildingCompletenessProof | W-BLDG-COMPLETE | IMPLEMENTED |
| EYES §4.6 | P27 WALL_ROOF_INTERSECTION | WallRoofIntersectionProof | W-DH-ROOF-1/3 | IMPLEMENTED |
| EYES §4.6 | P28 ROOF_COVERAGE | RoofCoverageProof | W-DH-ROOF-2 | IMPLEMENTED |
| BIM_COBOL §17.3 | TRIM WALLS TO ROOF | TrimWallsToRoofVerbTest | W-TRIM-1..7 | IMPLEMENTED |
| EYES §10 | 24 proof classes, PlacementProver facade | EyesProofRunner | W-EYES-NONDISTURB | IMPLEMENTED |
| EYES §P05/P06 | IFC source duplicate + cross-discipline co-location jitter | PlacementCollectorVisitor | W-TE-PROOF | PASS |

### BIM_Designer_SRS — UX + Flywheel + Compile Bridge

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §27.5 | Flywheel Advisory Panel (FL-2) | FlyAdvisoryTest | W-FL-ADVISORY-1..5 | PASS |
| §27 FL-5 | Shape advisory (class-shape mismatch) | FlyAdvisoryTest | W-FL-SHAPE-1/2 | PASS |
| §22.3 | compile() with CompilationPipeline | CompileBridgeTest | W-COMPILE-1..5 | PASS |

### DISC_VALIDATION_DB_SRS — Database Split

| Spec Section | Requirement | Test Class | Witness/Gate | Status |
|---|---|---|---|---|
| §6 Phase 1 | Schema + seed + references | DiscValidationDBTest | W-DV-DB-* | PASS |
| §6 Phase 2 | CalibrationDAO reads from ERP.db | DiscValidationDBTest | W-DV-DB-DUAL-READ | PASS |
| §12h C_BPartner | Generative devices have C_BPartner_ID matching jurisdiction | — | W-BPARTNER | SPEC ONLY |

### Gap Summary

| Status | Count | Meaning |
|---|---|---|
| PASS | 37 | Spec → test → green. Proven. |
| IMPLEMENTED | 12 | Test exists but advisory (not gating). |
| SQL SEEDED | 6 | AD_Val_Rule SQL written, not code-tested. |
| SPEC ONLY | 24 | Spec written, test spec defined, code not yet written. |
| PENDING | 3 | Spec exists, no test spec yet. |

**Rule:** No code change without checking this matrix first.
**How to use:** PASS row touched → run its test. SPEC ONLY → write the test. PENDING → write the spec first.

### Executable Traceability — Code-Level Enforcement

**`@Traces` annotation on every test class:**
```java
/** @Traces BBC.md §4.0 — LBD tack convention */
class BomValidatorTest { ... }
```

**`// Implementing` citation before code changes:**
```java
// Implementing BBC.md §4.1 — world coord reconstruction (R16 origin convention)
double worldX = buildingOrigin.x + accumulatedDx;
```

**T21:** Orphan test detection (tests without `@Traces`). Advisory.
**T22:** Spec-code alignment (spatial code without citation). Advisory.

---

## Layer 4 — Data Integrity Guards

Guards DATA against wrong dimensions, products, or offsets in `{PREFIX}_BOM.db`.
Oracle: `component_library.db` — extracted from IFC files by IfcOpenShell (external).

| Check | What It Catches |
|-------|-----------------|
| D-1/D-1b | Orphan products (ALL component types) |
| D-2 | Dimension mismatch (M_Product dims) |
| D-3 | Count match vs extraction |
| D-4 | Product existence in library |
| D-5 | AABB vs extraction envelope |

**Status: ALL PASS** — `DataIntegrityTest.java`, 6/6 PASS.
To cheat D-1 through D-5, you'd have to fake the IFC source files themselves.

---

## Layer 5 — Static Analysis

SpotBugs + PMD. Advisory, not blocking.
- SpotBugs HIGH: 2 FIXED (FileWriter encoding)
- PMD: 507 findings deferred — legacy style debt from early sprint iterations (mostly dead code, empty catches), deferred in favour of architectural correctness. Not blocking. Contributions welcome.

---

## Drift Prevention Checklist

| Drift Type | Guard | What To Do |
|------------|-------|------------|
| Orphan product | D-1b | Every MAKE child_product_id needs M_Product stub |
| Geometry stagnation | Mesh cache | If adding a mapper, add `Map<String, Mesh> meshCache` |
| Transform hash collision | MeshBinder mm-precision | `LOD_{refHash}_{tx_mm}...` — use `Math.round(val * 1000)` |
| Zero-delta transform | EdgeVertexTest X5a | Fix BOM offsets, not the test |
| Magic coordinates | T12 | Use named constants or derive from DB |

---

## Tamper Seal — Trust Boundary Hash Manifest

SHA256 hash of 76 files. Super-hash = hash of all hashes.

**Three defense layers:**
1. **Hash seal (L1)** — any byte change = SEAL BROKEN
2. **Structural guards (L2)** — ArchUnit, G4-TAMPER T1-T16, cross-DB joins, EntityType guards
3. **Git diff review (L3)** — every `[SEAL]` commit shows exact diff

**Sealed:** 2026-11-07 (v20: hook carries the NO-LFS guard; audit in prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §6.3)
**Super-hash:** `dbedb86a71ca9082965279310ec18d5e0474db3b60dfb6a9a1d83c544b46e10f`

```
bash scripts/verify_test_seal.sh            # quick check
bash scripts/verify_test_seal.sh --detail   # show which files changed
```

### DAGCompiler Tests (30 files)
```
7addd1ce  contract/ArchitectureTest.java
d6268785  contract/RosettaPlacementTest.java
e2698f5b  library/AnchorComputationTest.java
0fc52eb2  contract/TranslationChainTest.java
7242cc8e  coordinate/LocalCoordTest.java
1afd3801  contract/PhantomLayoutTest.java
0caa9ff2  contract/PlacementCollectorVisitorTest.java
6571b255  contract/BOMWalkerTest.java
9d89b537  library/StallDividerParamsTest.java
42ea02ad  contract/VerbStageTest.java
4448ba05  contract/ExtractedGeometryTruthTest.java
35ba5edd  contract/EdgeVertexTest.java
ca4a7160  contract/OutputTemplateTest.java
4be6d56d  contract/BOMDigestVerifyTest.java
7840e0c0  contract/StructuralCrossCheckTest.java
c83b47be  arch/DriftGuardTest.java
f895bea2  contract/CompilerContractTest.java
fe217577  contract/RosettaStoneGateTest.java
92a514e2  contract/ExtractedBOMWalkTest.java
a0ecbdc7  contract/BomChainIntegrityTest.java
760c3582  contract/BOMChainMathTest.java
001f9466  contract/SpatialPlacementVisitorTest.java
e9e95b2a  contract/StTemplatePipelineTest.java
1e8b5c49  contract/BuildingRegistryTest.java
6a9aad3e  contract/IntraBOMRelativeTest.java
2cc63657  contract/MetadataIntegrityTest.java
8e367c6e  contract/DataIntegrityTest.java
290afd7b  contract/FurnitureGeometryTest.java
4cf6d635  contract/StackedDuplexWitnessTest.java
```

### BIM_COBOL Tests (27 files)
```
9f35fe2f  CheckBomVerbTest.java
142bb5c6  CoverWithRoofVerbTest.java
6a1e1293  RouteSprinklersVerbTest.java
1c189cf9  RosettaStoneTest.java
53831c65  ConnectFittingsVerbTest.java
b8d3edad  CheckPlacementClashTest.java
2616bfed  CheckRoomComplianceTest.java
26422d9f  WireLightingVerbTest.java
3159edd5  VerifyPlacementVerbTest.java
81ca9121  TileSurfaceVerbTest.java
7c9c693c  ArrayVerbTest.java
b617201c  VerbStageIntegrationTest.java
72299520  VerbNodePersisterTest.java
ad490cdc  verb/PlaceBomVerbTest.java
4f9b6563  verb/FloorVerbTest.java
42e3958d  verb/ConvenienceVerbTest.java
31fb92d8  VerbRegistryTest.java
6e3a37c4  verb/ReportVerbTest.java
faae62bb  F5IntegrationTest.java
80bb92d7  HelloWorldVerbTest.java
77b9bf60  verb/SyntheticBomPrimitiveTest.java
171b655b  verb/BuildingVerbTest.java
255c02b9  verb/UtilityVerbTest.java
1e6dfc0d  verb/OverrideRoofVerbTest.java
db2b0c62  verb/FixOpeningBboxVerbTest.java
92ee1dab  verb/BuildSpatialStructureVerbTest.java
cc2906e9  PrimeRuleWitnessTest.java
```

### ORMSandbox + TopologyMaker Tests (6 files)
```
181e34fa  EmptySpaceTest.java
da2e12d2  W_Verb_NodeTest.java
2154c0bc  BuildingInspectorTest.java
f86d52fe  OrderLineInterfaceContractTest.java
50f65541  BasePOTest.java
aeaa7e09  TopologyBatchProcessTest.java
```

### Critical Production Files + Hook (10 files)
```
71bdeabf  CompilationPipeline.java
d9b29826  BuildingCompiler.java
7a1b759c  PlaceBomVerb.java
87f8aa95  EnBlocVerb.java
a1ce5479  WalkThruVerb.java
b366f5e8  MBOM.java
4970aa07  MBOMLine.java
127f1cdd  run_tests.sh
ecb8cde6  run_RosettaStones.sh
e6ac9ef2  lib_rosetta_helpers.sh
ef6543c4  rosetta_compile.sh
9b714362  rosetta_integrity.sh
46a36520  rosetta_fidelity.sh
86d6460e  pre-commit
```

### Rosetta Stone Coverage

**Gate:** `./scripts/run_RosettaStones.sh` — S190 fleet: 21 buildings, 116/157 PASS, 4 ALL GREEN (BR, MO, RL, WI). 9-gate system.

| PFX | EL | GATES | Notes |
|-----|----|-------|-------|
| BR | 33 | 9/9 | ALL GREEN |
| MO | 2791 | 9/9 | ALL GREEN |
| RL | 1 | 9/9 | ALL GREEN |
| WI | 1 | 9/9 | ALL GREEN |
| DX | 1169 | 8/9 | MetadataMissing (IfcOpeningElement) |
| SH | 65 | 8/9 | MetadataMissing (generative MEP) |
| TE | 33848 | 2/4 | Extraction reconciliation |

### Browser Testing — Whitebox Debug Logging (Primary)

**§-tagged console output is the primary browser verification method.** The coder
reads the log to confirm values are correct — not Playwright assertions.

Every module emits `§`-prefixed log lines with structured key=value data.
After any code change, the coder opens browser console (or captures via
`page.evaluate` in a test harness) and reads the `§` lines to verify:

| Log tag | Module | What coder checks |
|---------|--------|-------------------|
| `§HELPERS_READY` | helpers.js | All 4 shared functions wired |
| `§DB_LOADED size=NMB` | streaming.js | DB fetched, size reasonable |
| `§BOOTSTRAP centres=N` | streaming.js | Building count matches DB |
| `§DS_QUEUED bld=X elements=N` | streaming.js | Correct building selected, element count |
| `§GROUND minZ_ifc=X` | streaming.js | Ground plane positioned at correct Z |
| `§STOREY_FILTER X` | panels.js | Storey isolation applied |
| `§PICK class "name" disc storey` | picking.js | Correct element identified on click |
| `§XRAY ON/OFF` | tools.js | X-ray state toggled |
| `§SECTION ON axis=X range=[a,b]` | tools.js | Section cut bounds computed from mesh bbox |
| `§WALK_DOOR picked (x,y,z) dist=Nm` | walk.js | Nearest door found, distance plausible |
| `§WALK_STOREYS N levels cached` | walk.js | All storeys detected with floor elevations |
| `§WALL_XRAY class=X storey=Y` | walk.js | Wall identified, storey correct |
| `§WALL_MEP found=N near wall` | walk.js | MEP behind wall detected, count reasonable |
| `§NLP_HIGHLIGHT n=N/M` | nlp.js | Correct GUIDs highlighted (N found of M requested) |
| `§DIFF added=N removed=N changed=N` | diff.js | Variance counts match expectations |
| `§CAMERA envelope=WxDxHm dist=Nm` | streaming.js | Camera positioned at correct distance |
| `§TRUE_NORTH X°` | streaming.js | Grid rotation angle extracted from DB |

**Verification protocol:**
1. Change code → open browser → open console (F12)
2. Read `§` lines — are values correct? Do counts match the DB?
3. If a value is wrong, the `§` line pinpoints which function, which query
4. Fix → re-check → commit only when `§` lines prove correctness

**When to add a new `§` line:** When a function computes a value that
could be silently wrong. The log line IS the test. Example:
```javascript
// In walk.js — after computing nearest door
console.log(`§WALK_DOOR picked (${x},${y},${z}) dist=${d}m from ${n} doors`);
// Coder reads this: is the position inside the building? Is dist reasonable?
```

**Advantages over Playwright:**
- Instant (no 20s browser launch, no 2min suite run)
- Shows actual values (not just pass/fail)
- Works for visual state Playwright can't see (camera position, material opacity)
- Coder learns the system by reading the log — builds mental model
- Catches wrong-but-plausible values (e.g. door at wrong storey — Playwright wouldn't know)

### Playwright E2E Tests (Secondary — Wiring Only)

~75 desktop specs, 19 spec files. Suite in `deploy/dev/tests/`.

**Playwright is kept for wiring and deploy integrity only:**
- Script tags load without errors
- Buttons exist and are clickable
- DB queries return non-empty results
- Import/export workers fire
- Wizard multi-step flow completes

**Playwright is NOT used for:**
- Visual correctness (SwiftShader = black pixels)
- Value verification (§ logs are sharper — they show the actual number)
- Camera position checks (headless timing differs from real browser)
- Mobile UX (simulated viewport ≠ real device)
- Round-trip state (needs IndexedDB + visual — use DB-level Node.js tests)

See `reference/residential/PlaywrightAnalysis.md` §Playwright Scope for full boundary.

## CI: system-is-real gate

`.github/workflows/ci.yml` (Lane A / A3) is the first CI that runs a truth-model check on **every PR
+ push to `master`** — the witness discipline finally reaches the default branch, not just the local
tree. It wraps `scripts/system_is_real.sh` (CI=1) and is **explicit about coverage — no silent caps**:

| Regime | In CI | Why |
|---|---|---|
| Browser local gate (`test_all.js`) | **GATED** | node-builtin only, deterministic, headless-safe |
| ERP witness (`run_witness.sh`) | **GATED** | after `npm ci` (better-sqlite3) |
| Red Pill **G8-GOVERNANCE** (`§REDPILL-RS`) | **GATED (best-effort)** | witness lives in bim-ootb — cross-repo checkout needs a PAT; without one it DEFERS (logged SKIP), never silent-green |
| Anti-drift audit (`audit_specs.js`) | **WARN** | surfaced, not gated — pre-existing skip-guard debt (`38-sh-dx-2d-runtime`); it is the hard gate in the Playwright-change workflow, not the smoke |
| Compiler RosettaStone **G1–G6** | **DEFERRED** | no Java/IFC build in fast CI — run locally via `scripts/run_RosettaStones.sh`; a cached-build CI step is the next increment |

A PR that breaks the browser local gate or an ERP/Red Pill witness goes **RED**; a clean PR goes
green. The combined log is uploaded as a build artifact (`system_is_real-log`). `docs.yml` (mkdocs)
and `traffic.yml` (analytics) are untouched. The corrected truth: there **is** now a CI gate — but it
covers the headless subset above, **not** the Java G1–G6 gates (those stay a local discipline until
the cached-build step lands). This is the honest version of the old "changes break CI" claim.

---

### Test Summary

| Suite | Count | Runner | Role |
|-------|-------|--------|------|
| §-tagged console logs | ~30 tags across 10 modules | Browser console / F12 | **Primary** — value verification |
| Playwright (browser E2E) | ~75 specs | `npx playwright test` | Secondary — wiring/deploy checks |
| BonsaiBIMDesigner (Java) | 408/414 | `mvn test` (needs component_library.db) | Backend gates |
| BIMBackOffice (Java) | 20/20 | `mvn test` | Backend gates |
| Rosetta Stone fleet | 116/157 gates PASS | `./scripts/run_RosettaStones.sh` | Pipeline proof |

*See [StrategicIndustryPositioning.md](StrategicIndustryPositioning.md) — the gates are a key differentiator in the competitive scorecard.*

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
