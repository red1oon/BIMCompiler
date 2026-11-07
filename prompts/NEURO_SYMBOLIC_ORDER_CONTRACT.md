# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES + the proposer test + the stop on outside calls. **No paid model calls** (owner, 2026-11-08). No gate beyond §15.1 without the owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an outside proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the details were invented. This file keeps only the part that survives. **Consolidated 2026-11-08;** the full earlier text, with every superseded spec and run note, is in `prompts/archive/NEURO_SYMBOLIC_ORDER_CONTRACT_full_2026-11-06_to_2026-11-08.md`.

## ▶ RESUME HERE (2026-11-08)
**State:** everything specified here is shipped and witnessed. **Nothing is waiting on the owner.** Next work, each needing its own go:
1. A free hand-off rehearsal of the stop (§14.6). It is a rehearsal, never a measurement.
2. The Java `PlacementRequest` gate, once an outside order really arrives there (STATUS).
3. Browser boot weight, its own file: `prompts/BROWSER_BOOT_WEIGHT.md`.
4. Not started, each its own go: the report for bay add and other gestures, a session total at Save, beam and column rules on a live edit, a shift in the Modeller's UI, a film of the report.

**⛔ No paid model calls (owner, 2026-11-08):** *"prepare best effort product without incurring any API call costs unless it is a 3rd party free one or in a sandbox here where you mock or mimick such a AI proposal."* `run.js` refuses without `--model-calls`, and no session passes that flag (`feedback_no_paid_model_calls.md`). The three model runs (§12 to §14) were made before this directive, through the owner's claude.ai plan login. Their `$` figures are Claude Code estimates, not charges.

**Shipped:**
| What | Where |
|---|---|
| This contract; §3 Java coverage and snap witnesses; `V016` category-filter fix, snap `pre_snap`, seal v20 | BIMCompiler #383, #384 |
| Live-check coverage; wall driven into a touching wall is RED; the red ink report | bim-ootb #2671, #2673, #2674 |
| `edit_cli`; first proposer test | bim-ootb #2678, #2679 |
| Block shift, the report names the limit and the bay, own grids, lattice boxes, **3-axis move fix** | bim-ootb #2685 |
| A shift hinges at one plane; `edit_cli` standalone with `--url` | bim-ootb #2688 |
| W-PROPOSER-GUIDE; the puppeteer load message | bim-ootb #2689 |
| No model calls without a flag; hand-off mode; `bay_add.js` on first use | bim-ootb #2697 |
| **The stop on outside calls**; the edit report on first use (sw v244) | bim-ootb #2699 |
| Specs, pre-registrations, results, the public guide, BROWSER_BOOT_WEIGHT | this lane's BIMCompiler PRs from #385 to #399 |

**Known and open. Do not re-derive; do not claim otherwise:**
- **Owner's question, open:** the live Save gate on a rotated building uses world boxes, so it can block on phantom overlaps (§13.6).
- **Stale labels, not changed:** the Open list calls SampleCastle, Clinic, HHS and Terminal column-framed; their `_ARC.db` files hold 0 IfcColumn rows (§13.2).
- **Before a shift gets a button:** copy-paste of an element carrying a HINGE keeps its plane, and a shift does not re-walk the STR tab.
- **Measured once, not re-run by a witness:** the guide's "116 of 122 Hospital lines refuse a shift" and "16 of 16 single moves red".
- **Not run:** the report panel on a phone-sized screen; "Add one more" end to end through the report.
- **Observed, not investigated:** a real +1.2 m mouse drag of gy8 after an undo recomposed 0 elements, while a scripted +1.5 m on a fresh Open recomposed 1.
- **Inferred, not reproduced:** one 112 s CLI run that returned "not judged". The settle wait addresses the suspected cause.
- **Still failing, unrelated:** G4-TAMPER, 73 old violations (§6.3); `witness_clipboard_keys` K1; two `playwright` smokes.

**Landmines:**
- **The primary checkout is on `fable/meshdb-livewire`, another lane's branch.** Do not commit there; work in a `/tmp/wt-*` worktree off `origin/master`. It holds an untracked copy of this file: delete it before merging master into that branch, or git refuses the merge.
- **Shed witnesses** need `SHED_MARKED_DIR`, `SHED_MARKED` and `SHED_RAW_DIR` set to `~/.cleanup_holding_2026-11-06/videos/dxf2bim_film_work/why/cli/marked` and `…/why/raw`, or they print MISSING. **That folder holds the only copy found. Raise it with the owner before anyone clears it.**
- **`library/validation.db` is gitignored.** `V016` was applied by hand, and no script applies V-series migrations. Without it `V1_legal_kitchen` fails.
- **Never symlink a primary checkout's `library/` into a worktree** for a full suite run. It wrote to `library/work_sh.db`.
- **The public guide:** change a number in `docs/ProposerGuide.md` and W-PROPOSER-GUIDE must change with it. Publish only through `scripts/safe_gh_deploy.sh`; from a worktree, copy `docs/glassbowl_data.db` in first or the guard aborts (`DOCS_DEPLOY_POLICY.md`).
- **Public repos:** grep every diff, commit message and PR body for the private client names (`feedback_private_project_no_names_in_public.md`). **Sealed files** need a `[SEAL]` commit that explains why.
- **Re-check the instrument before quoting numbers.** Across §13 and §14 that found a live bug, a meaningless overlap count, floors left behind and a broken install path, all before they reached a result.

## ▶ START HERE (state at 2026-11-08, for a reader new to this project)
**The idea.** An AI, a scan or a person proposes a change to a building. A deterministic compiler, with no AI inside it, computes the result, reports what it can prove, and on an outside call stops an edit that adds red. The AI stays outside, and its output is treated as untrusted.

| Question | Answer today |
|---|---|
| Can anything stop a bad edit? | **Outside calls: yes.** `edit_cli` undoes an edit whose report shows new red and returns the report and the reason (§15.1). **Modeller, a person's own edits:** Save blocks on RED, the engine refuses an opening that would leave its wall, and releasing a RED span commits nothing (§3.5). **Java compile path: no**, every gate only reports (§3) |
| Compile-path gates, 17 injected defects | 8 fire nothing (§3.1) |
| Modeller's live edit checks, 28 injected defects | 14 fire nothing, 2 of those by design. Every overlap class is caught; floating elements, wrong units clear of the building and invalid coordinates are not (§3.5) |
| Does snapping hide a bad value? | Fixed for one case; four others remain (§3.4) |
| Is a proof report available? | **Yes, live, for grid moves and shifts:** what changed, red ink before → after, the limit and the bay, what was NOT checked (§8). The CLI returns the same bytes (§11) |
| Did it help a real proposer? | Last measured run (§14, before the stop): right outcome 15 of 30 alone, 24 of 30 with the report. Six finals stayed RED, 3 knowingly over the span limit. **Small test, our briefs, about 10 real decisions** |
| Can an outsider try it? | **Yes:** one file, the live site, the Hospital. [AI Proposer Guide](https://red1oon.github.io/BIMCompiler/ProposerGuide/) |
| What did an outside review say? | DeepSeek: "appealing in direction but immature in execution" (§10) |

**What has NOT been measured:** whether a proposer does better with the stop (a model run would cost, §14.6); the size of the gain from the report, since the three tests are small and not comparable; speed against working without us; structural capacity, which nothing here checks, so a pass never means safe (§5).

**Open questions, where a second opinion is useful:**
1. Is a closed vocabulary (choose from the catalog, §7) too narrow? It is safer, but it gives up much of what makes AI useful.
2. Is `PlacementRequest` the right place for the compile path's gate, when outside orders arrive there?
3. What would make the proposer test a fair measure of "better than without", at no cost?

**Vocabulary.** *Witness:* a test that names the issue it proves and can report its own failure. *Gate:* a check on a model. *Order:* the existing `c_order` + `c_orderline` tables. *Red ink:* findings from the checks. *Shift:* a grid line and every later line on its axis moved together. `§TAG` lines are machine-readable log lines. Code cited as `bim-ootb` lives in [red1oon/bim-ootb](https://github.com/red1oon/bim-ootb); the rest in [red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler).

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

## 7. What a proposer should be told
- **Works:** choosing from what exists: the lines from `--lines`, the two edits, the catalog with sizes. Tell it to decline when nothing fits.
- **Does not:** free coordinates, where unit and floating errors arrive, the gates' weakest spots; or anything asking for structural safety or loads (§5).
- **Measured (§12 to §14):** the model chose a shift on 24 of 30 first proposals, but never found the clean shift on G5; it read a refusal's reason well; kept an over-limit edit it knew about. Its forecast of problems did not separate good proposals from bad ones.
- **The guide's prompt** adds two rules the tests did not state: treat a stopped or left-behind result as bad, and decline rather than keep a bad edit with a note. **Not measured.**
- A report that omits what was not checked invites a proposer to hide errors in the blind spots, so the NOT-checked list is mandatory.

## 8. The proof report (bim-ootb `modeller/edit_report.js`, `edit_report_panel.js`)
After a grid move or a shift, the Modeller logs one `§EDIT_REPORT <json>` line and shows a panel. For a person it reports only: the edit stands. Spec and slice-1 results: `prompts/MODELLER_MASTER.md` §EDIT-REPORT.
- **Rows:** box overlap among moved elements; beam spans over the limit and needing a depth check, whole building, **naming the limit, the material and each changed over-limit bay** (§13.4); new red and orange kinds; new pairs; the NOT-checked list.
- **Honest rows:** a refused or empty check prints "not judged" and no number; different populations print "inconclusive" and no delta; no NOT-checked list, no report. Words: never safe, compliant or OK.
- **Loads on first use:** its two files load on the first committed grid move (§15.2).
- **Proven by** W-EDIT-REPORT: rows equal independent recounts, undo and redo return to Before and After, two fresh Opens give byte-identical JSON, and a deliberately broken report fails it.

## 9. Re-run the evidence
Fixtures are local files, not in git: without them a witness prints `INCONCLUSIVE`, never a pass. bim-ootb commands need `NODE_PATH` with puppeteer (here `~/bim-compiler/node_modules`).
| Witness | Command |
|---|---|
| Java gates and snap (§3) | `mvn -o -pl BonsaiBIMDesigner -am test -Dtest=OrderContractWitnessTest -Dpipeline.tests.skip=false -Dsurefire.failIfNoSpecifiedTests=false`; in a worktree add `-Dbim.fixture.root=<primary checkout>`. `V1_legal_kitchen=FAILS` means `library/validation.db` lacks `V016` |
| Live checks (§3.5) | `node modeller/tests/witness_edit_report_coverage.js` |
| The report (§8) | `node modeller/tests/witness_edit_report.js`; falsifier `EDIT_REPORT_BREAK=1` must fail |
| The CLI and the stop (§11, §15.1) | `node modeller/tests/witness_edit_cli.js` |
| Block shift (§14.1) | `node modeller/tests/witness_block_shift.js`; falsifier `SHIFT_BREAK=1` must fail |
| The public guide (§14.3) | `node modeller/tests/witness_proposer_guide.js` against the live site; `--no-page` before publishing; falsifier `GUIDE_BREAK=1` |
| Proposer scorer (§12) | `node modeller/tests/proposer_test/run.js --stub`, no model call |
| Regression after touching a shift or the report | W-BAY-RIDE, W-DXF-ADD-BAY (shed variables), W-SDG-GATE, W-GRID-SPAN-GATE, W-E2E-MOVE, W-E2E-GRIDSTRETCH-MULTI, W-CUT-MOVE, W-E2E-CUT-MOVE |

## 10. External review: DeepSeek, 2026-11-07
Verdict: "appealing in direction but immature in execution". Checked against the code: right that the compile path cannot reject an order (still true); half right on doors in slabs and pipes through walls (missed by the Java gates, RED in the Modeller); its claim that the blind spots are where AI fails was a hypothesis then, and the tests have not measured it since. Its JEPA framing is an analogy, not alignment: both refuse to let a generator self-certify, and that is as far as it goes. "AI provides imagination, the engineering world provides the verdict" is now true for outside calls, for the RED rows only.

## 11. The call a proposer makes: `edit_cli` (bim-ootb `modeller/tools/edit_cli.js`)
Drives the **real** Modeller page headless through its real commit path and prints JSON: one engine, not a Node copy of the rules. One file plus puppeteer 24; `--url` drives any page, and by default the live site when it stands outside a repo (§14.2).
- `--building <resident>`, `--lines`, `--grid <id> --move <m>`, `--shift <id> --move <m>`, edits applied in order. `--own-grid` for wall-bearing buildings (§13.2), `--lattice-boxes` for a rotated one (§13.6), `--report-only` to turn the stop off (§15.1).
- stdout: JSON `{ok, building, edits, ms, model?, gate?}`. Exit 0 every edit reported · 3 refused or stopped · 2 usage · 1 failed. Nothing is saved: each call starts from a fresh Open.
- **Proven:** byte for byte the page's own report; repeatable, including across separate installs; refusals and stops read as answers.
- **Limits:** grid moves and shifts only; the app's own buildings only; 40 to 75 s per call on the Hospital, almost all of it opening the building.

## 12. The proposer test (bim-ootb `modeller/tests/proposer_test/`)
**Method, fixed before each run and pushed first:** 10 briefs (`briefs.json`, half are traps), 3 repeats, one isolated model with no tools and no project files, not told the limits. **Arm A** = its first proposal and forecast. **Arm B** = the same run continued, with the report fed back, up to 2 revisions, may decline. Each attempt is judged by `edit_cli` from a fresh Open.
**Classes:** CLEAN · PARTLY_JUDGED (nothing moved, only spans judged) · RED · STOPPED (§15.1) · LEFT_BEHIND (§14.1) · REFUSED · DECLINED · INVALID · FAILED. Orange does not count. **Right outcome:** goal met by arithmetic, CLEAN or PARTLY_JUDGED, no lines crossed; or DECLINED on the briefs marked impossible.
**The three runs, `claude-sonnet-5-5`, all before the no-cost directive:**
| Run | What changed before it | Right outcome A → B | Read it with |
|---|---|---|---|
| §12, 2026-11-07 (#2679, `results_2026-11-07.json`) | first run | 3 → 10 | a shift was judged line by line, and 9 runs used the app's default grid: both overstate the gain |
| §13 (#2685, `results_v2_2026-11-07.json`) | shift as one edit, own grids, stop at a judged-fine result, limit named, lattice boxes | 15 → 24 | all 12 clean Garage shifts left the floors behind, and 2 briefs depended on a wider tolerance |
| §14 (#2688, #2689, `results_v3_2026-11-07.json`) | the hinge (§14.1), LEFT_BEHIND | **15 → 24** | the current one. CLEAN 15 → 21, RED 6 → 6, REFUSED 6 → 0, LEFT_BEHIND 3 → 0, DECLINED 0 → 3 |
**What §14 shows:** a shift was the missing word (24 of 30 first proposals); the report turned 9 runs right, all through a refusal or left-behind notice and its reason; **a report alone does not stop a proposer that has decided:** on G4 it named the 12 m limit in all 6 revisions and kept the 13 m bay, which is why §15.1 exists; its forecast did not separate good from bad (problems forecast on 14 of 15 bad first proposals, 10 of 15 good).
**Limits, before any headline:** about 10 real decisions (17 different brief-and-edit pairs in 54 attempts); we wrote the briefs; one model; orange does not count; the three runs are not comparable; **the size of the gain is not established.**
**Now:** `--model-calls` is required to call a model, and no session passes it. `--handoff <dir> --answered-by "<who>"` rehearses for free (§14.6).

## 13. What the second run needed (2026-11-07)
### 13.1 One edit for a block shift
Superseded by §14.1. The first form stretched crossing members uniformly, which left a sideways error and floors behind.
### 13.2 Only grids derived from the building
**Measured 2026-11-07, real Open of each resident:**
| Resident | Measured | Grid |
|---|---|---|
| HospitalGarage | 140 columns, RC, 17×29 lines, rotated −2° | its columns |
| Hospital | 349 columns, **material unreadable, so spans are not judged**; 69×55 lines | its columns |
| SampleCastle, Clinic, HHS | 0 IfcColumn rows in the `_ARC.db`, walk as wall-bearing | walls, with `--own-grid` |
| SampleHouse, Duplex | wall-bearing | walls, with `--own-grid` |
| Terminal | 0 IfcColumn rows in `Terminal_ARC.db`; not opened | not read |
Without `--own-grid` a wall-bearing building uses the app's default grid. `--lines` states `grid_source`, and the runner refuses `app-default`, so a proposer is never told a default grid is the building's.
### 13.3 Stop at a judged-fine result
CLEAN and PARTLY_JUDGED end a run, so "not kept" is said only after a bad result.
### 13.4 The report names the limit and the bay
`GridSpanGate.tally` carries the limit and every bay; the span-over-limit row adds `limit`, `material` and `over_limit_changed` (`{bay, before, after, newly_over}`, newly over first, at most 8, with the total). No new threshold.
### 13.5 Witnesses
See §9.
### 13.6 Found before any model call: the 3-axis bug and rotated boxes
1. **Fixed (#2685):** any `GEOM_MOVE` rebuilt a 3-axis placement with yaw only, so the plain Move tool also turned the element and changed its height (Garage wall 22 rose 10.03 m). W-BLOCK-SHIFT A1, A2.
2. **On a rotated building, world boxes are metres wide** around long members (a 0.2 m beam at −2° has a 4.38 m box), so the Garage read about 1,900 overlaps before any edit. **`--lattice-boxes`** judges in the lattice frame. It is used for single-line moves with tolerance 20 mm + `|d|·sin|θ|`, stated in the row label; a shift is judged at plain 20 mm (§14.1). It has no effect at θ = 0, and the app never sets it.
3. **Owner's question, open:** the live Save gate on a rotated building still uses world boxes.
### 13.7 Pre-registration
Superseded: the method is in §12, and each run's registration is in the archive.

## 14. The hinge, the CLI for outsiders, the guide, no paid calls (2026-11-07 to 08)
### 14.1 Everything crossing a shift's line follows, by one rule
A shift has one plane, `at = X − b` on the lattice axis, where `b` = max(0.3 m, the largest half-width of a column centred on the line + `EDGE_TOL`), the engine's own band. **Every vertex at or beyond the plane travels the block's vector; every vertex before it stays.** No scale and no local axis, so there is no sideways error on any yaw.
- **How:** a `HINGE` command on the existing `GEOM_GRID_MOVE`, folded in `foldInsert` (`bay_add.js` `shift`, `bonsai_library.js`). Wholly-beyond elements are plain `GEOM_MOVE` with their riders; an element already carrying a HINGE gets `at: null`.
- **Follows when crossing:** the classes the grid governs, `IfcMember`, `IfcCovering`, and `IfcBuildingElementProxy`, because the Garage's floors are proxies by their own names. Anything else crossing stays and is named in `change.left`.
- **Refused:** a filling straddling the plane; a crossing element carrying a `GEOM_CUT` or other parent-mutating op.
- **Proven:** W-BLOCK-SHIFT checks every crossing vertex with no tolerance (68,336 vertices, 22 elements, 0 off); on G1 the floors follow and the overlap count is unchanged (1565 → 1565).
- **Limits:** copy-paste of a HINGE keeps its plane, and a shift does not re-walk the STR tab. Both are unreachable while a shift has no button.
### 14.2 The CLI needs one file and can drive the live site
See §11. Found by doing it as an outsider: the newest puppeteer needs Node 22 and is ESM-only, so the guide pins version 24, and the CLI now says why it would not load.
### 14.3 The public guide
https://red1oon.github.io/BIMCompiler/ProposerGuide/ , source `docs/ProposerGuide.md`, test case **the Hospital** on the live site. It covers getting started, a worked example, every result kind, the stop, how to read a report, the NOT-checked list, a prompt for the AI, what was measured, the buildings, and troubleshooting. **W-PROPOSER-GUIDE:** the published commands from one downloaded file, in an empty folder, against the live site, and every number on the published page; 16/0 on 2026-11-08.
### 14.4 Witnesses
See §9.
### 14.5 Pre-registration
In the archive.
### 14.6 No paid model calls, and the free rehearsal
How the runs were made: `run.js` spawned `claude -p` through the machine's login, which is claude.ai (`authMethod: claude.ai`, no API key set). Rules now:
- No model call without `--model-calls`, and no session passes it.
- `--handoff <dir> --answered-by "<who>"` writes each prompt to `q_*.txt` and waits for `a_*.json`. Its results are stamped `"mode":"handoff rehearsal"`, `"measurement":false`. This session has read the answers, so it is not an isolated proposer.
- `--briefs` picks a subset.
- Proven by stub H1–H3: a fake `claude` first on `PATH` never runs.
- Rehearse: `node modeller/tests/proposer_test/run.js --handoff <dir> --answered-by "this session" --briefs G4 --reps 1 --out <file>`.

## 15. The stop on outside calls, and the report on first use (owner, 2026-11-08: "go with your take")
### 15.1 The stop
**Issue:** a report alone does not stop a proposer that has decided (§12, G4).
**Where:** `edit_cli` only. **Not** a person's own edits in the Modeller, which still report and offer Revert, with Save blocking on RED. **Not** the Java compile path, which stays report-only, so never on extracted buildings. **Not** `PlacementRequest` yet: no outside order arrives there.
**The rule** (`EditReport.gateVerdict`, pure, reads the report's rows, no new threshold):
- Stop if a red new row counts above 0, known kind or not; if the span-over-limit row is JUDGED and rose; or if it names a bay newly over the limit.
- Not judged never stops, and is listed in the answer's `gate`.
- Orange and left-behind elements are reported, not stopped.
**A stop:** the edit is undone, and a recount must equal Before or the call fails. The answer is `{refused, stopped_by_gate, reason, report}`, exit 3, and later edits in the call start from the restored state. `--report-only` turns it off. The stop runs on the caller's own machine: it is not a security boundary, and the guide says so.
**Proven (#2699):** W-EDIT-CLI 24/0.
- C13: a red edit is stopped, with the page's own report inside.
- C14: the next edit equals that edit made alone, so Before really came back.
- C15: a clean edit passes byte for byte.
- C16: not-judged checks are listed.
W-EDIT-REPORT W0j covers every trigger and non-trigger. **Not measured:** whether a proposer does better with the stop (§14.6).
### 15.2 The report loads on the first committed grid move
`edit_report.js` and `edit_report_panel.js`, 13.6 KB, left the page's script tags; the 46 lines of glue in `modeller.html` stay. W-EDIT-REPORT Z1 (absent at open) and Z2 (loaded by the first grid move).

## STATUS
2026-11-06 spec. 2026-11-07: extracted (§3), fixes (§6), report (§8), CLI (§11), three proposer tests (§12), shift and hinge (§13, §14), public guide (§14.3). 2026-11-08: no paid model calls (§14.6), the stop on outside calls and the report on first use (§15), consolidated.
**The gate, where it stands:** outside calls are stopped on new red (§15.1). The Java compile path stays log-only until its rules are proven against extracted buildings (`CompilationPipeline.java:1536`). When outside orders arrive at `PlacementRequest`, a gate there applies only to them, checks before any snap, and then the §7 measurement runs, at no cost (§14.6).
**Open by design:** every row marked NONE in §3.1 and §3.5; snap cases S2–S5. G4-TAMPER reports 73 older violations (§6.3).
