# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES. No reject gate may be built from this file without the owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an external proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the details were invented. This file keeps only the part that survives, and refuses the rest.

## ▶ START HERE (state at 2026-11-07, for a reader new to this project)
**The idea.** An AI, a scan or a person proposes a change to a building. A deterministic compiler, with no AI inside it, computes the result and reports what it can prove. The AI stays outside and its output is treated as untrusted.

**What has been measured** (every number comes from a witness you can re-run, §9):
| Question | Answer today |
|---|---|
| Can anything stop a bad edit? | **Compile path: no**, every gate only reports (§3). **Modeller: yes, in three places**: Save blocks on RED, the engine refuses an opening that would leave its wall, and releasing a RED span commits nothing (§3.5) |
| Compile-path gates, 17 injected defects | 8 fire nothing (§3.1) |
| Modeller's live edit checks, 28 injected defects | 14 fire nothing, 2 of those by design. Every overlap class is caught; floating elements, wrong units clear of the building and invalid coordinates are not (§3.5) |
| Does snapping hide a bad value? | Fixed for one case; four others remain (§3.4) |
| Is a proof report available? | **Yes, live, for one grid move** in the Modeller: what changed, red ink before → after, what was NOT checked (§8). A CLI call returns the same bytes (§11) |
| What did an outside review say? | DeepSeek: "appealing in direction but immature in execution". Claims checked in §10 |

**What has NOT been measured:**
- **No proposer has ever been run through this.** "Better results than AI alone" is a hypothesis, not a finding (§7).
- Speed against working without us has not been measured. The call itself takes 6.6 to 12.9 s (§11).
- Nothing here checks structural capacity, and a pass never means safe (§5).

**Questions still open, where a second opinion is useful:**
1. Is a closed vocabulary (choose from the catalog, §7) too narrow? It is safer, but it gives up much of what makes AI useful.
2. Is `PlacementRequest` the right place for a reject gate, if one is ever built (STATUS)?
3. Is the §7 measurement a fair test of "better than without"?

**Vocabulary.** *Witness:* a test that names the issue it proves and can report its own failure. *Gate:* a check on a model. *Order:* the existing `c_order` + `c_orderline` tables. *Red ink:* findings from the checks. `§TAG` lines are machine-readable log lines. Code cited as `bim-ootb` lives in [red1oon/bim-ootb](https://github.com/red1oon/bim-ootb); the rest in [red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler).

## 1. Position (consistent with "No AI inside")
- The proposer (JEPA, LLM, scan-to-BIM, a human) is OUTSIDE the compiler. Its output is an **untrusted ORDER**, same
  class as an IFC import or a C_Order. It is never authored data and never a ground truth.
- PRIME RULE holds: every value in the compiled result traces to (a) the order as submitted, or (b) a DB/verb result.
  Nothing is "snapped" silently — any rounding is a logged, reversible transform with its delta recorded. That is the requirement; it is not fully met (§3.4), and no code emits a `§ORDER_SNAP` line yet.

## 2. What the Gemini text claimed vs what the repo says (verified 2026-11-06)
| Gemini claim | Repo fact | Source |
|---|---|---|
| G1 geometry/topology, G2 physics/structural capacity, G3 relational completeness | G1–G6 = **count, volume, digest, tamper, provenance, isolation** (compiler-reconstruction proofs) | `docs/archive/TestArchitecture.md` L6, L17, L33 |
| "certified safe", "legally binding", "flawless" | No structural-analysis engine exists; a pass means *reconstruction-consistent*, not engineered-safe | same + absence of any load/capacity gate |
| JEPA emits element types, profiles, loads | JEPA yields latent vectors; the vector→`IFCBEAM/W12X26` step is the unsolved model, not a "snap matrix" | (external; not in repo) |
| JEPA reads the error log and self-corrects | needs a planner/LLM in the loop; out of scope here | — |
| SQLite in browser = "tamper-proof" | G4 (tamper) covers the compiled digest, not a user-editable local file | `TestArchitecture.md` L6 |

## 3. EXTRACTED 2026-11-07 (from running the code, not memory; log lines below come from `OrderContractWitnessTest`)
§3.1–3.4 are the Java compile path. §3.5 is the Modeller, a separate browser code path.

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
| Unit: mm×1000 in a mm field | **NONE** | validator has minimums only (`actual < required`, `PlacementValidatorImpl.java:352`) |
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
3. **Fixed 2026-11-07 (§6.1): the validator's category filter was dead.** `library/validation.db` (from `V002_validation_seed.sql:34`) stored `bom_category`; the loader reads `m_product_category_id` (`PlacementValidatorImpl.java:173`), so every rule applied to every room and a legal 2000×3000 kitchen was BLOCKed by `UBBL_BEDROOM_MIN_AREA`. DV017 renamed `ad_val_rule_param.param_name` in ERP.db, not this table's `name` column. `V1_legal_kitchen` now passes.

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
| S1 bedroom 2800 wide, grid 500 | **Fixed (§6.2): no longer hidden.** Snap still rounds to 3000 and returns `success=true`, but now adds a `pre_snap` entry naming `UBBL_BEDROOM_MIN_DIM` and logs `§SNAP_ROUNDED_PAST_RULE` |
| S2 10002 mm vs 1 mm tolerance, grid 1000 | Accepted, moved 2 mm. Logged, but snap has no tolerance input, so it cannot reject |
| S3 verb form, (10.002,…) spacing 1000 | Pass, moved **998 mm** (rounds up). Logged, not rejected |
| S4 10.0004 m, spacing 1 | **Silent.** 0.4 mm lost in the mm conversion; verb says "no change" |
| S5 a BLOCK that survives snapping | `success=true`, element returned, rule appears only as an adjustment (`DesignerAPIImpl.java:962-989`) |
| S6 already on grid | NO-OP reported |
| S7 validator off | VACUOUS: `success=true` with nothing judged |
| S8 click-to-fix (control for §6.2) | Lands on 3000, no `pre_snap` entry |

### 3.5 The Modeller's live edit checks (`§EDIT_COVERAGE`, bim-ootb `modeller/tests/witness_edit_report_coverage.js`)
A different code path, so it was measured separately: `SdgGate` on the real Duplex (203 solids), `GridSpanGate` on the real Garage lattice (228 girders). `defects=28 none=14 by_design=2`. Generated table: bim-ootb `modeller/edit_report_coverage.json`.
| Defect | Java gates (§3.1) | Live edit checks |
|---|---|---|
| Same-class overlap, door in slab, pipe in structure, pipe through wall | One fails; the rest fire nothing or pass | **RED, all four** |
| Wall driven into a wall it already touches | Not tested | **RED since the fix below.** Fired nothing before it |
| Duplicate position | FAILS | RED |
| Column 50 m up, beam 200 m away | NONE | NONE |
| 3100 m wall clear of the building | FAILS | **NONE** |
| 800 m wall clear of the building | NONE | NONE; RED only if it hits something |
| 0.2 mm thick | FAILS | **NONE** |
| Unknown class | NONE | NONE: the gate receives boxes only |
| Duplicate guid | FAILS | NONE (read): boxes are keyed by feature id |
| NaN coordinates, zero-size box | Not tested | NONE, no throw |
Also: a line dragged past its neighbour has no rule of its own, and the span check uses one material per building, so on a mixed building a steel girder within its own limit can read RED.

**What actually stops an edit in the Modeller today:** (1) Save blocks while RED remains (`modeller.html` `runSave`, W-SAVE-COMPLETEIT); (2) the engine refuses a grid move that would push a held opening out of its wall, and nothing is committed (`bonsai_gridmove.js` `commit`, `§DAGEVU refused`); (3) releasing a drag on a RED span commits nothing and opens the "Add one more?" prompt (W-GRID-SPAN-GATE). An ordinary RED on a committed edit does not undo it: the user is offered Revert. None of these cover the NONE rows above.

**Fixed 2026-11-07 (bim-ootb #2673):** a grid stretch could push a wall through its neighbour with no warning, because touching pairs were always expected contact. Measured on SampleHouse, `gx1` +1 m: wall 23's end moves x=6.12 → 7.12, through wall 22 (6.12..6.41). Now RED `abuts-clash`. RED blocks Save.

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

## 6. Fixes approved by the owner 2026-11-07 ("Go")
Spec for changes to shipped code. These correct bugs that exist with or without a proposer. They do not add a reject gate.
1. **Category filter.** `migration/V016` renames the rule param to what the loader reads. The loader also splits comma lists, because `AU_CEILING_SERVICE` names four categories and an exact-match key would never fire. A rule listed under several categories still counts once. Witness: `V1_legal_kitchen` goes NONE; `w_pv_1`, `w_pv_3`, `kitchen_pass`, `w_infra_snap_4` go green.
2. **Snap hides a violation (S1).** When grid rounding changed the size and the snapped size passes, `snap()` validates the submitted size too. If that BLOCKs, it adds an adjustment with `field="pre_snap"`, `from`=submitted, `to`=required, and logs `§SNAP_ROUNDED_PAST_RULE`. The bbox and `success` do not change, so nothing is stopped. The Blender panel shows it as information without a Fix button, since the snapped size is already legal. Witness: S1 goes OK; new control S8 proves click-to-fix still lands on the required size with no `pre_snap` entry.
3. **Seal repair.** `scripts/pre-commit` gains the NO-LFS guard line the installed hook already has. `verify_test_seal.sh` finds the hook through `git rev-parse --git-path`, so it works in worktrees, and reads the manifest from its new path, `docs/archive/TestArchitecture.md`. Audit before re-sealing: at `7d941768b`, the last seal, the recorded hash reproduces; since then 2 of 76 sealed files changed: `scripts/pre-commit` (`6e54c133a`, Gate 1 lets a commit remove a `library/` binary) and `run_RosettaStones.sh` (`2d330e381`, one mesh-restore step). Neither weakens a gate. Re-sealed as v20, super-hash `dbedb86a…`.
   ⚠ **G4-TAMPER is red and was not fixed:** 73 violations, none in a file changed here (`T19` alone hits lines naming `IfcFlowTerminal`, `T14` is `catch … ignored`). Its procedure asks for green before re-sealing; this re-seal went ahead on the audit above, on the owner's go. G4 is not part of pre-commit.
4. **Test comparison, `BonsaiBIMDesigner` suite, before → after:** 78 → 73 failures, 59 → 59 errors. Now passing: `w_pv_1`, `w_pv_3`, `kitchen_pass`, `w_infra_snap_4`, `DemoHouseTest.w_dh_4`. The remaining failures need local DBs absent from a worktree (`library/ERP.db` is a 16-byte stub). The one "new" line, `InfraVocabularyTest.deriveFacilityTypeViaApi`, is the same test failing on another empty `*_BOM.db`: it iterates a `Map.of`, whose order changes per run.

## 7. Proposer prompts (advice, nothing built, no proposer has been run)
- **Works:** choosing from what exists. Give it the base BOM, its `locator_ref`s and the catalog with sizes; allow only Replace, Remove, Add, Compress; ask for `c_orderline` rows; tell it to say so when nothing listed fits.
- **Does not:** free coordinates (this is where unit and floating errors arrive, the gates' weakest spots), or anything asking for structural safety or loads (§5).
- **"Better than without" is unmeasured.** To measure it, run the same prompts through a real proposer and count defects raw, after the gates, and with a repair loop feeding `§ORDER_REJECT` back. That needs a real proposer and a gate that stops output. Filtering cannot make a proposal good: a valid but poor design passes, and so does anything in the NONE rows of §3.1.
- **What it offers a proposer (2026-11-07):** state intent in a few lines; get back a computed building plus proof of what changed. Speed is unmeasured, so do not pitch "faster". The proof record is `MODELLER_MASTER.md` §EDIT-REPORT, built first for people. A report that omits what was not checked invites a proposer to hide errors in the blind spots.

## 8. The proof report (bim-ootb #2674, live, one grid move)
After a grid move the Modeller shows a panel and logs one `§EDIT_REPORT <json>` line. It reports only; the edit stands. Spec and full results: `prompts/MODELLER_MASTER.md` §EDIT-REPORT.
Measured, real Garage, grid `gy8` +1.5 m:
```
                                       Before  After
Box overlap over 20 mm (1 moved)          2      4    +2
Beam spans over limit (228 girders)      91     91     0
Beam spans needing a depth check         14     19    +5
New: 2 overlaps · 1 driven into a touching wall
Preliminary — the structural engineer confirms.
NOT checked: 11 items
```
- **Proven by** `modeller/tests/witness_edit_report.js`: rows match independent recounts, undo and redo return to Before and After, two fresh Opens give byte-identical JSON, and a deliberately broken report fails it.
- **Honest rows:** a refused or empty check prints "not judged" and no number. Different populations print "inconclusive" and no delta. No NOT-checked list, no report.
- **Why NOT-checked is mandatory:** a proposer told to minimise red ink will find the blind spots. Zero red may only mean the errors moved to where nothing looks.

**How we see the AI (owner's framing and this lane's view, not a measurement).**
- The compiler is not narrow AI: it applies rules and never guesses, and "No AI inside" means no AI in the runtime. A proposer is narrow only when the order format restricts it. They are designer and checker, not rivals.
- What the compiler offers a proposer is closer to a calculator than a speed-up: state intent in a few lines, get a computed form and proof of what changed. AI remains the more versatile side, and it can read a brief or a messy drawing where rules cannot.
- Owner's idea, first step built (§11): this as the backend of a script engine a CLI can call. A saved macro needs no AI; AI is needed once, to turn a new request into a script. The fold itself still runs in a headless page, not in plain Node. `MODELLER_MASTER.md` row 40 (scripted edits) stays on HOLD.

## 9. Re-run the evidence
Fixtures are local files, not in git: without them a witness prints `INCONCLUSIVE`, never a pass.
| Witness | Command |
|---|---|
| Java gates and snap | `mvn -o -pl BonsaiBIMDesigner -am test -Dtest=OrderContractWitnessTest -Dpipeline.tests.skip=false -Dsurefire.failIfNoSpecifiedTests=false`, reading the `§ORDER_*` lines. In a worktree add `-Dbim.fixture.root=<primary checkout>`. `V1_legal_kitchen=FAILS` means that `library/validation.db` lacks `migration/V016`, which no script applies automatically |
| Live checks (bim-ootb) | `NODE_PATH=<node_modules with ajv> node modeller/tests/witness_edit_report_coverage.js` |
| Report (bim-ootb) | `NODE_PATH=<node_modules> node modeller/tests/witness_edit_report.js`; falsifier `EDIT_REPORT_BREAK=1` must fail |
| CLI (bim-ootb) | `NODE_PATH=<node_modules> node modeller/tests/witness_edit_cli.js`. One call: `node modeller/tools/edit_cli.js --building HospitalGarage --grid gy8 --move 1.5` |

## 10. External review: DeepSeek, 2026-11-07
The owner shared this file with DeepSeek. Its verdict: "appealing in direction but immature in execution"; today "a well-documented boundary declaration rather than a usable AI governance layer". Checked against the code:
| DeepSeek said | Check | Verdict |
|---|---|---|
| The compile pipeline cannot reject an order; the gate is parked | §3 | **Correct** for the compile path. This file's START HERE implied it for everything; corrected above: the Modeller has three real stops |
| Doors in slabs and pipes through walls are what AI gets wrong and the model cannot know | §3.1 vs §3.5 | **Half right:** both fire nothing in the Java gates and are RED in the Modeller. A floating column is NONE in both |
| The 8 of 17 blind spots are "precisely" where free-form AI placement will fail | No proposer has run | **A hypothesis.** It may be right; it is not measured |
| A catalog-only proposer keeps risk manageable | §7 | Agrees with §7, equally unmeasured |
| Speed is unmeasured | §5, §7 | **Correct** for any claim about AI. §11 now measures the call itself |
| The contract is "a concrete implementation of JEPA's philosophy" if the loop closes | §2: no JEPA here; a JEPA yields latent vectors, and vector → order is the unsolved model | **An analogy, not a fact.** JEPA learns a world model; this encodes rules. Both refuse to let a generator self-certify, and that is as far as it goes. Do not cite it as alignment |
| "AI provides imagination, the engineering world provides the verdict" | Today the verdict covers only §3.5's RED rows | A fair goal, **not yet true** |
**What it changes:** nothing about the parked gate. It does sharpen the order of work: run a proposer through a real call before arguing further, which needs the call to exist (§11).

## 11. A call a proposer can make — SPEC 2026-11-07 (owner: "for you to proceed")
**Issue:** no proposer can be measured, because no call exists that takes an edit and returns the proof. The owner's CLI idea (§8) and the §7 measurement both need one.
**Design:** a thin CLI, bim-ootb `modeller/tools/edit_cli.js`, that drives the REAL Modeller page headless through the real commit path and prints `§EDIT_REPORT`'s JSON on stdout. **Not** a Node re-implementation of the fold: that would be a second engine beside the page, and two engines disagree. One implementation per responsibility.
- `node modeller/tools/edit_cli.js --building <resident> --grid <id> --move <metres> [--grid … --move …]`
- stdout: JSON only, `{ok, building, edits:[report|refusal], ms}`. Logs go to stderr. Nothing is saved: each run starts from a fresh Open.
- A refusal is an answer, not a crash: an unknown grid line or an engine refusal gives `{refused:true, reason}` and exit 3. Usage error: exit 2.
- It stops nothing and adds no rule. It is not a reject gate. No AI inside it.
**Witness W-EDIT-CLI** (`modeller/tests/witness_edit_cli.js`):
| Claim | Proves or disproves |
|---|---|
| Same edit through the CLI = the in-page report, byte for byte | The CLI is a second, different answer |
| Same CLI call twice = byte-identical `edits` | Not repeatable |
| A different move gives a different report | The comparison above cannot fail |
| stdout parses as JSON, whole | A caller cannot read it |
| Unknown line, and an engine refusal: `refused`, the reason, exit 3 | A refusal reads as success, or crashes |
| Time per run is printed, per building | "Fast" is claimed without a number |
**Not in this step:** running a proposer, bay add, other gestures, a pure-Node engine.

### §11 RESULT 2026-11-07 (bim-ootb #2678)
`§WITNESS_EDIT_CLI pass=10 fail=0`. Through the CLI = the page, byte for byte: SampleHouse `gx1` +1 m (1,804 bytes) and Garage `gy8` +1.5 m (1,877). Same call twice: identical. Four calls at once: same bytes. A different move: a different report, so the comparison can fail. Unknown line and engine refusal: `refused`, the reason, exit 3.
**Time per call:** SampleHouse 6.6 s, Garage 12.9 s; four at once 8.5 s and 16.9 s, on a machine at load 10-14. Almost all of it is opening the building: the report itself cost 7.6 ms. Several edits in one call open once. So it is usable, not yet "fast", and a long-lived session would be the way to make it so.
**Found while building:** the first build returned "not judged" in one 112 s run, and the same call gave 20 → 20 at 9 s and 49 s, so the answer depended on load. The CLI now waits for the seed to arm the Save baseline. **The cause is inferred, not reproduced:** the load test did not reach that slowness.
**Limits:** grid moves only; needs the dev harness and puppeteer, so it is a developer tool for now; a report describes a session that is then discarded.
**Next, needing the owner's go:** the first real proposer. A model gets a building's grid lines and a brief, returns CLI calls, and defects are counted raw and after the report. This uses tokens, and "better than without" stays unmeasured until it runs.

## STATUS
2026-11-06 spec drafted. 2026-11-07: §3 extracted, §4 witnesses committed, §6 fixes shipped, live checks measured (§3.5), gate fix and report shipped (§8), DeepSeek's review checked (§10), CLI shipped (§11).
⏸ **Reject gate PARKED by owner 2026-11-07 until a real proposer exists.** When un-parked: apply only to external orders, at `PlacementRequest`, checking before any snap; then run the §7 measurement. A gate must not apply to extracted buildings: the compile path stays log-only until its rules are proven against them (`CompilationPipeline.java:1536`).
Still open, by design: every row marked NONE in §3.1 and §3.5, snap cases S2–S5. G4-TAMPER still reports 73 older violations (§6.3).
