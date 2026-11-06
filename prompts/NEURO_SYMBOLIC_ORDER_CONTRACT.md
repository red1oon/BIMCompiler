# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES (2026-11-07: §3 is extracted, §4 witnesses exist). No gate may be built from this file without the
owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an external proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the
details were invented. This file keeps only the part that survives, and refuses the rest.

## 1. Position (consistent with "No AI inside")
- The proposer (JEPA, LLM, scan-to-BIM, a human) is OUTSIDE the compiler. Its output is an **untrusted ORDER**, same
  class as an IFC import or a C_Order. It is never authored data and never a ground truth.
- PRIME RULE holds: every value in the compiled result traces to (a) the order as submitted, or (b) a DB/verb result.
  Nothing is "snapped" silently — any rounding is a logged, reversible transform with its delta recorded (`§ORDER_SNAP`).

## 2. What the Gemini text claimed vs what the repo says (verified 2026-11-06)
| Gemini claim | Repo fact | Source |
|---|---|---|
| G1 geometry/topology, G2 physics/structural capacity, G3 relational completeness | G1–G6 = **count, volume, digest, tamper, provenance, isolation** (compiler-reconstruction proofs) | `docs/archive/TestArchitecture.md` L6, L17, L33 |
| "certified safe", "legally binding", "flawless" | No structural-analysis engine exists; a pass means *reconstruction-consistent*, not engineered-safe | same + absence of any load/capacity gate |
| JEPA emits element types, profiles, loads | JEPA yields latent vectors; the vector→`IFCBEAM/W12X26` step is the unsolved model, not a "snap matrix" | (external; not in repo) |
| JEPA reads the error log and self-corrects | needs a planner/LLM in the loop; out of scope here | — |
| SQLite in browser = "tamper-proof" | G4 (tamper) covers the compiled digest, not a user-editable local file | `TestArchitecture.md` L6 |

## 3. EXTRACTED 2026-11-07 (from running the code, not memory; log lines below come from `OrderContractWitnessTest`)
**Headline: nothing in the compile path can reject an order today.** Every gate reports; none stops the output.
`BuildingWriter.java:1110` "diagnostic — does not block emission" · `CompilationPipeline.java:1536` forces validation to LOG ·
`:1796-1802` prints `[FAIL]` and carries on · `VerbStage.java:117` logs a warning. So FAILS below means "a gate says no", not "the order was stopped".
G1–G3 compare to a reference DB (`RosettaStoneGateTest.java:39-45`), so they have nothing to judge a new order against.

### 3.1 Defect → gate (`§ORDER_COVERAGE`, Duplex, population 265, one injected element per row)
| Defect | Verdict | What fired |
|---|---|---|
| Clean element (control) | NONE | nothing, as it must |
| Same-class overlap, 50 mm offset | FAILS | `CHECK PLACEMENT` P06 only. Eyes P06 calls any partial overlap a "JOINT" and marks it PROVEN (`SameClassOverlapProof.java:71`) |
| Door inside a slab (cross-class) | **NONE** | P06 is same-class only; `CHECK CLASH` is MEP×structure only |
| Pipe inside a beam | DETECT_ONLY | `CHECK CLASH` lists it, verb still returns pass (`CheckClashVerb.java:76-85`); default recipe runs it only when routes exist (`VerbStage.java:140`) |
| Pipe through a wall | **NONE** | walls are not in `CHECK CLASH`'s structural classes |
| Unsupported: column 50 m above its storey | **NONE** | P04 builds the storey band from all elements INCLUDING the one judged, so it cannot fail (`CheckPlacementVerb.java:190-206`, `EyesProofRunner.java:154-163`) |
| Unsupported: beam 200 m from the building | **NONE** | same; matches the §1 prediction. Browser `§STRUCT_SANITY floating_member` is IfcBeam-only and an on-demand panel, not an order gate (read, not run). BIMEYES §S14: the support judges disagree by 3154 |
| Unit: mm as m, 3100 m wall | FAILS | P02, only because 3100 exceeds its 1000 m limit |
| Unit: mm as m, 800 m wall | **NONE** | under the limit, so P02 passes. `DataIntegrityTest` D-2 (>100 m) checks the catalog, not orders |
| Unit: m written as km (0.2 mm thick) | FAILS | P03 |
| Unit: metres in a mm field (BEDROOM) | FAILS | validator area rule, only for a category with a rule |
| Unit: mm×1000 in a mm field | **NONE** | validator has minimums only (`actual < required`, `PlacementValidatorImpl.java:349`) |
| Unknown IFC class in the output | **NONE** | no gate checks the class |
| Unknown category at the validator | **NONE** | PASS |
| Unknown product, `placeItem` | FAILS | "Product not found" |
| Unknown BOM, `CHECK BOM` | FAILS | "not found" |
| Unknown product, compile walk | warns and skips | `OrderLineWalker.java:133-136` drops the line to stderr (read, not run). The order silently loses it |
| Duplicate guid | FAILS | `elements_meta.guid` UNIQUE, a raw SQL error |
| Duplicate position, new guid | FAILS | P05 + P06 |
| Duplicate order line | NONE (read) | current `c_orderline` DDL has no UNIQUE (`BuildingWriter.java:352`) |

`§ORDER_COVERAGE_SUMMARY defects=17 none=8 verdict=DISPROVED` — the claim "every defect class is rejected by a named gate" is false.

**Other findings from the same run:**
1. **`PROPOSED` is not a gate.** `proposal_status` has writers only (`OrderMutationService.java:223`, W004); no main code reads it, the walker filters on `IsActive` alone, and it defaults to `ACCEPTED`.
2. **`AD_Clash_Rule` has 6 rows and no reader.** The only main-code mention is the comment `CompilationPipeline.java:1553`, which says 0 rows.
3. **Live bug, not fixed here: the validator's category filter is dead.** `library/validation.db` (from `V002_validation_seed.sql:34`) stores `bom_category`; the loader reads `m_product_category_id` (`PlacementValidatorImpl.java:173`), so every MY rule applies to every room. A legal 2000×3000 kitchen is BLOCKed by `UBBL_BEDROOM_MIN_AREA` (`V1_legal_kitchen`). DV017 renames `ad_val_rule_param.param_name` in ERP.db, not this table's `name` column. `PlacementValidatorImplTest` fails 6 of 19 on this DB: 4 from this bug, 2 (`w_dv_mined_wire_*`) expect mined rules from ERP.db, absent here.

### 3.2 Order shape: reuse, no new JSON
- **WHAT:** `c_order` + `c_orderline` (`BuildingWriter.java:352`): `family_ref`, `M_Product_ID`, `host_type`, `Parent_OrderLine_ID`, `Line`, `Qty`, `Discipline`, `locator_ref`, `is_reference_class`. The four mutations (Replace, Compress, Remove, Add) already express a variant (`docs/internal/ProjectOrderBlueprint.md` §1.1).
- **Placement on the line:** `dx/dy/dz` are parent-relative metres (`BomDropper.java:411`); `aabb_*_mm` are millimetres. Two units on one row, undeclared in the DDL, which is the unit-error surface in §3.1.
- **HOW:** `W_Verb_Node` + `W_Verb_NodeProduct`. **Judged through:** `PlacementRequest` → `ValidationVerdict`, whose own doc says it does not care who created the request (`PlacementRequest.java:9`). That is this contract's seam, and it already exists.
- **WHERE:** `elements_meta` + `elements_rtree` in output.db, written by the compiler, never by the proposer.
- ⚠ `library/output_template.db` still has the older element-list `c_orderline`; `BuildingWriter.java:350` says that shape was replaced. Do not copy it.

### 3.3 Reject line: map to existing fields
`§ORDER_REJECT order=<c_order.Value> line=<C_OrderLine_ID> id=<guid|locator_ref> rule=<ruleName|proofId> measured=<actualValue> tolerance=<requiredValue> unit=<mm|m|m2> std=<standardRef>`
Fields come from `ValidationVerdict`; `AD_Validation_Result` (V001) already stores the same row. `W_Validation_Result` has no measured or required column, and `CheckPlacementVerb.ProofResult` carries only an evidence string, so P01–P06 cannot fill `measured` without a change. Nothing emits this line yet.

### 3.4 Snap (`§ORDER_SNAP_WITNESS`): `verdict=DISPROVED`
| Case | Result |
|---|---|
| S1 bedroom 2800 wide, grid 500 | **Hidden.** Raw order BLOCKs on `UBBL_BEDROOM_MIN_DIM`; snap rounds to 3000 first (`DesignerAPIImpl.java:903-917`), then validates (`:951`). Result: `success=true`, only a `GRID_SNAP` entry, no rule |
| S2 10002 mm vs 1 mm tolerance, grid 1000 | Accepted, moved 2 mm. Logged, but snap has no tolerance input, so it cannot reject |
| S3 verb form, (10.002,…) spacing 1000 | Pass, moved **998 mm** (rounds up). Logged, not rejected |
| S4 10.0004 m, spacing 1 | **Silent.** 0.4 mm lost in the mm conversion; verb says "no change" |
| S5 a BLOCK that survives snapping | `success=true`, element returned, rule appears only as an adjustment (`DesignerAPIImpl.java:960-972`) |
| S6 already on grid | NO-OP reported |
| S7 validator off | VACUOUS: `success=true` with nothing judged |

## 4. Witness claims (written first; each names the issue it proves)
- **W-ORDER-REJECT-COVERAGE** — proves/disproves: "every defect class in §3.1 is rejected by a named gate". Output is the
  table with NONE rows — NONE rows are the finding, not a failure. INCONCLUSIVE if the order population is empty.
- **W-ORDER-SNAP-LOSSLESS-LOG** — proves/disproves: snapping never hides an out-of-tolerance order (an order at 10.002
  vs tolerance 0.001 must be REJECTED before snap, not passed after). Must be able to report NO-OP and VACUOUS.

### 4.1 Witness design (spec, 2026-11-07) — `BonsaiBIMDesigner/src/test/java/com/bim/designer/OrderContractWitnessTest.java`
Read-only over shipped code; adds no gate, changes no gate. Fixtures are the same local files the existing tests use
(`DAGCompiler/lib/input/Duplex_extracted.db`, `library/validation.db`; both gitignored, root overridable with `-Dbim.fixture.root`).
A missing or empty fixture prints `INCONCLUSIVE` and aborts; it never passes.
- **Coverage:** copy the real Duplex DB, inject ONE defective element per class, run every gate that can read it
  (`CHECK PLACEMENT`, `CHECK CLASH`, `EyesProofRunner.proveFromDB`, `PlacementValidator`, `placeItem`, `CHECK BOM`), and print
  `§ORDER_COVERAGE defect=… verdict=…`, counting only results that name the injected guid (the real DB has its own baseline findings).
  Verdicts: **FAILS** = a gate returned fail/BLOCK · **DETECT_ONLY** = a gate reported it but still returned pass · **NONE** = nothing fired.
- **Coverage controls:** a clean injected element must fire nothing; the same-class overlap must fire P06. If either breaks, the harness is blind and the test fails.
- **Snap:** the 2800→3000 grid-snap case, the 10.002 case, plus NO-OP (already on grid) and VACUOUS (validator inactive), each printing `§ORDER_SNAP_WITNESS case=… verdict=…`.
- **Pinned:** both witnesses assert the recorded table, so a future gate fix turns the test red and forces §3 to be updated.
  A green run therefore means "the table is still accurate", NOT "orders are safe".

## 5. Explicit non-goals
Structural capacity checks, code compliance, "certification", any claim of engineering safety. Those need a licensed
engineer and a real analysis engine; out of this lane until the user says otherwise.

## STATUS
2026-11-06 spec drafted. 2026-11-07 §3 extracted; both §4 witnesses built and run. Nothing in shipped code changed.
Run: `mvn -o -pl BonsaiBIMDesigner -am test -Dtest=OrderContractWitnessTest -Dpipeline.tests.skip=false -Dsurefire.failIfNoSpecifiedTests=false`; read the `§ORDER_*` lines.
⛔ BLOCKED, owner decisions: (a) build a reject gate at all, and at which seam; (b) fix the dead category filter (§3.1 finding 3). Neither was started.
⛔ (c) **The witness test is not committed.** It is untracked in the primary checkout at the §4.1 path. Pre-commit Gate 3 blocks any staged `*Test.java` because the tamper seal is already broken on master, for two reasons unrelated to this test: `.git/hooks/pre-commit` carries the NO-LFS guard line that `scripts/pre-commit` lacks (so the script's suggested `cp` fix would delete the guard), and the sealed files' super-hash no longer matches (expected `8e08c46f…`, actual `8c66c625…`). Not bypassed and not re-sealed.
