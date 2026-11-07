# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES + the proposer test. No reject gate may be built from this file without the owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an external proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the details were invented. This file keeps only the part that survives, and refuses the rest.

## ▶ RESUME HERE (session close 2026-11-07, third test and public guide; for the next working session, an outside reader can skip to START HERE)
**Read in this order:** this block → §14 RESULT → §14.1 → §13 RESULT only for its limits 3 to 5.

**Waiting on the owner, one decision:** the reject gate (§14 RESULT, Decision). Asked, not yet answered. **Do not un-park it without their go.**

**⛔ No paid model calls (owner, 2026-11-08):** `run.js` refuses without `--model-calls`, and no session passes it. Rehearse with `--handoff` (§14.6). The §12 to §14 runs used the owner's claude.ai plan login; their `$` figures are Claude Code estimates, not charges.

**How the test runs:** `NODE_PATH=~/bim-compiler/node_modules node modeller/tests/proposer_test/run.js --stub`, which must pass first, then `--handoff <dir> --answered-by "<who>"` (§14.6). The last model run (§14, before the directive): 54 attempts. **Re-check the instrument before quoting numbers:** across §13 and §14 that found a live bug, a meaningless overlap count, floors left behind, and a broken install path, all before they reached a result.

**Public guide:** https://red1oon.github.io/BIMCompiler/ProposerGuide/ , source `docs/ProposerGuide.md`. **Change a number there and W-PROPOSER-GUIDE must change with it** (bim-ootb `modeller/tests/witness_proposer_guide.js`; it runs the published commands on the live site and checks the published page). Publish only through `scripts/safe_gh_deploy.sh`; from a worktree, copy `docs/glassbowl_data.db` in first or the guard aborts (`DOCS_DEPLOY_POLICY.md`).

**Shipped:**
| What | Where |
|---|---|
| Block shift first form, limit and bay in the report, own grids, lattice boxes, 3-axis move fix | bim-ootb #2685 (sw v238) |
| A shift hinges at one plane, LEFT_BEHIND, `edit_cli` standalone with `--url` | bim-ootb #2688 (sw v239) |
| W-PROPOSER-GUIDE, third test's raw results, puppeteer load message | bim-ootb #2689 |
| Specs, pre-registrations, results, the guide | BIMCompiler #394, #395, #396, and this one |

**Known and open. Do not re-derive; do not claim otherwise:**
- **Fixed:** a shift reading CLEAN with the floors left behind (§13 RESULT, limit 1). §14.1 hinges them, and LEFT_BEHIND scores what still stays.
- **Measured once, not re-run by a witness:** the guide's "116 of 122 lines refuse a shift" and "16 of 16 single moves red" on the Hospital.
- **Copy-paste of a HINGE keeps its plane.** Unreachable while a shift has no button. Fix it before adding one.
- **The walker's STR tab is not re-walked by a shift** (§13.1). Same condition.
- **Owner's question:** the live Save gate on a rotated building still uses world boxes, so it can block on phantom overlaps (§13.6).
- **Stale labels, not changed:** the Open list calls SampleCastle, Clinic, HHS and Terminal column-framed; their `_ARC.db` files hold 0 IfcColumn rows (§13.2).
- **Not run:** the report panel on a phone-sized screen; "Add one more" end to end through the report.
- **Observed, not investigated:** a real +1.2 m mouse drag of gy8 after an undo recomposed 0 elements, a scripted +1.5 m on a fresh Open recomposed 1.
- **Inferred, not reproduced:** the one 112 s CLI run that returned "not judged".
- **Still failing, unrelated:** G4-TAMPER, 73 old violations (§6.3); `witness_clipboard_keys` K1; two `playwright` smokes.
- **Not started:** report for bay add and other gestures, a session total at Save, beam and column rules on a live edit (each needs a go); a shift in the Modeller's UI; the report in a user guide; a film of it.
- **The CLI:** grid moves and shifts only, one file plus puppeteer 24. About 40 to 75 s per call on the Hospital, 6 to 38 s in the test. Only the app's own buildings can be opened.

**Landmines:**
- **The primary checkout is on `fable/meshdb-livewire`, another lane's branch.** Do not commit there; work in a `/tmp/wt-*` worktree off `origin/master`. It holds an untracked copy of this file: delete it before merging master into that branch, or git refuses the merge.
- **Shed witnesses:** the 2026-11-06 cleanup moved their input to `~/.cleanup_holding_2026-11-06/videos/dxf2bim_film_work`. Set `SHED_MARKED_DIR`, `SHED_MARKED` and `SHED_RAW_DIR` to `…/why/cli/marked` and `…/why/raw`, or they print MISSING. **Deleting that folder removes the only copy found. Raise it with the owner before anyone clears it.**
- **`library/validation.db` is gitignored.** `V016` was applied by hand here, and no script applies V-series migrations. Without it `V1_legal_kitchen` fails.
- **Test fixtures:** never symlink a primary checkout's `library/` into a worktree for a full suite run. It wrote to `library/work_sh.db`.
- **Public repos:** before every commit and PR body, grep the diff for the private client names (`feedback_private_project_no_names_in_public.md`).
- **Sealed files:** a change to one needs a `[SEAL]` commit that explains why.

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
| Did it help a real proposer? | Third test (§14): right outcome 15 of 30 alone, 24 of 30 with the report, on a shift that now takes the floors along. Six runs finished RED, 3 of them knowingly over the span limit. **Small test, briefs we wrote, about 10 real decisions: see §14 RESULT** |
| Can an outsider try it? | **Yes:** one file, the live site, the Hospital. [Guide](https://red1oon.github.io/BIMCompiler/ProposerGuide/) |
| What did an outside review say? | DeepSeek: "appealing in direction but immature in execution". Claims checked in §10 |

**What has NOT been measured:**
- **Three proposer tests have run, with limits (§12, §13, §14).** The direction supports the idea; the size of the gain is not established, and the tests are not comparable.
- Speed against working without us has not been measured. The call itself took 6 to 38 s in §14.
- Nothing here checks structural capacity, and a pass never means safe (§5).

**Questions still open, where a second opinion is useful:**
1. Is a closed vocabulary (choose from the catalog, §7) too narrow? It is safer, but it gives up much of what makes AI useful.
2. Is `PlacementRequest` the right place for a reject gate, if one is ever built (STATUS)?
3. Is the §14 test a fair measure of "better than without"? What should its next run change?

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
- **"Better than without": first measured in §12, with flaws.** The method: run the same prompts through a real proposer and count defects raw, after the gates, and with a repair loop feeding `§ORDER_REJECT` back. That needs a real proposer and a gate that stops output. Filtering cannot make a proposal good: a valid but poor design passes, and so does anything in the NONE rows of §3.1.
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

## 12. First proposer test — PRE-REGISTERED 2026-11-07 (owner: "Go, run the first proposer test")
Fixed before any model call, at bim-ootb commit `1fa3901fa2765795c03ca4482b1d9e8168a3983d`: `modeller/tests/proposer_test/briefs.json` and `run.js`.
**Issue:** "better than the AI alone" has never been measured.
**Proposer:** `claude-sonnet-5-5`, isolated: no tools, no files, no project instructions. It sees the system, the material, the grid lines and one request. It is **not** told the span limit, the walls or the openings.
**Runs:** 10 briefs × 3 repeats = 30. **Arm A, the proposer alone:** its first proposal and its own forecast of problems. **Arm B, the same run continued:** the report goes back, up to 2 revisions, and it may decline. So B is paired with A, and any gain in B comes from the feedback.
**Briefs:** 5 traps chosen with outcomes partly known: over the span limit, an engine refusal, a neighbour constraint, a line past its neighbour, a known wall-through-wall. Plus 1 unit trap and 4 ordinary. I wrote them, so they are not a sample of real requests.
**Each attempt is scored from a fresh Open:**
| Class | Meaning |
|---|---|
| CLEAN | not refused, spans over limit did not rise, no new clash, `abuts-clash`, door-out or door-crush, overlap row judged |
| PARTLY_JUDGED | as CLEAN, but no scene element moved, so only spans were judged |
| RED | span over limit rose, or any of those new reds |
| REFUSED | the engine or CLI refused an edit |
| DECLINED | the proposer said no |
| INVALID / FAILED | no usable JSON / the call failed |
Clearance and gap ORANGE do not count as RED. **Checked here, independently of the report:** goal met (arithmetic on the grid lines) and lines crossed. **Right outcome:** goal met, CLEAN or PARTLY_JUDGED, nothing crossed; or DECLINED on the 2 briefs marked impossible (G4, G5).
**Reported whatever they show:** classes for A and B · bad first proposals, and how many the proposer forecast as fine · goal met A and B · right outcome A and B · passed the report but crossed lines · passed the report but missed the goal.
**What this can and cannot show:** counts, no significance claim, n=30 on 10 briefs, one model, grid moves only. CLEAN means only "nothing the report checks went wrong", not a good design. The report's own blind spots stay blind except the two checked here. A revision may stop being what was asked for, which is why goal met is reported beside the classes.

### §12 RESULT 2026-11-07 (bim-ootb #2679, raw: `modeller/tests/proposer_test/results_2026-11-07.json`)
30 runs, 83 attempts, `claude-sonnet-5-5`, $1.42. **Pre-registered numbers, unchanged:**
| | A: alone, first proposal | B: with the report, final |
|---|---|---|
| CLEAN | 0 | 3 |
| PARTLY_JUDGED | 3 | 4 |
| RED | 13 | 10 |
| REFUSED | 14 | 4 |
| DECLINED | 0 | 9 |
| Goal met (arithmetic) | 30 | 21 |
| **Right outcome** | **3** | **10** |
Passed the report but lines crossed: 0. Passed the report but goal missed: 0. So those two blind spots were not exercised; this is no evidence either way.

**What it shows:**
1. **The arithmetic was never the problem.** Every first proposal met its goal; only 3 of 30 first proposals avoided RED or refusal, and none was fully CLEAN.
2. **Against what I expected: the model did not falsely self-certify.** It forecast problems on 28 of 30, so only 2 of 27 bad proposals were forecast as fine. But it also forecast problems on all 3 that came out fine, so the forecast does not tell good from bad. It hedges in general terms: none of the 3 G4 runs named the 12 m limit.
3. **The report moved outcomes:** right outcome 3 → 10. The 7 gained are 3 CLEAN edits on G1 (all three found `gy8` −1.51), 1 edit on S3, and 3 correct declines on G5. On the Garage alone, 0 → 6 of 21.
4. **The cost:** goal met fell 30 → 21, all 9 from declines. The 6 on G7 and S2 look reasonable, but the rule counts only G4 and G5 as declines that are right, so they do not score.
5. **A report alone does not stop a proposer: 14 of 30 finals are still RED or REFUSED** (G2, G3, G4, G6, two of S3), after being shown the result. No G4 run declined: the report says the over-limit count rose but not what the limit is.
6. **A point to the AI:** on G7 it forecast the line crossing, for which the report has no rule.

**Flaws, found after the run. They limit the numbers above; nothing was re-scored:**
- **⚠ Multi-line shifts are judged one line at a time.** 14 of 30 first proposals moved several lines, usually a whole block, and 13 scored bad. A probe confirms mid-shift refusals: gy9 to gy14 each +1.51 m, in order, gives refusals at gy11, gy12, gy13. A rigid block shift may be fine, and neither the CLI nor the Modeller can express it. **So A's REFUSED count, and possibly its RED count, overstate bad proposals, and "3 → 10" may overstate the gain.** Single-line first proposals, 16: 11 RED, 3 REFUSED, 2 PARTLY_JUDGED.
- **⚠ SampleHouse's 9 runs used the app's default grid** (`bonsai_grid.js:28`, 0/4/8/12), not lines derived from the building. The proposer was told they were the building's. Trust the Garage's 21 runs over these.
- **The revision prompt pushes change.** It says "not kept" even after a PARTLY_JUDGED, so 2 S3 runs reached a right outcome and then lost it (right on any attempt, post hoc: 12).
- **Limits as registered:** I wrote the briefs, half are traps, one model, n=30 on 10 briefs. CLEAN is not a good design.

**Verdict.** The direction supports the deterministic layer: the model alone could not tell which edits were bad, and the report let it find some real fixes. **The size of the gain is not established.** "Better results" is now evidence-backed for this narrow case, not proven. And it is evidence that a report is not enough without a stop.

**Next, needing the owner's go, same briefs and rules:** a block-shift edit, judged as one; only grids derived from the building; stop at a judged-fine result; the report names the limit and the bay. Then decide the reject gate on those numbers.

## 13. Second proposer test — SPEC 2026-11-07 (owner: "continue", read as yes to the question in RESUME; the reject gate stays parked)
**Issue:** §12's number cannot be trusted. A rigid shift was judged line by line, 9 runs used a grid that was not the building's, 2 runs lost a right answer, and the report never said what the limit was. This spec removes those four, keeps everything else, and measures again.

### 13.1 One edit for a block shift
**Issue:** moving gy9 to gy14 one line at a time stretches each wall between neighbours, and the engine refuses mid-way (§12 probe). A rigid shift never stretches those walls, so those refusals are artefacts.
**The edit:** `edit_cli --shift <line> --move <metres>`: that line and every later line on its axis move together. Only the bay before the line changes width.
**Read first (bim-ootb):** `bay_add.js` `plan` moves everything beyond a hinge, carries hosted fillings through `SdgCascade.ridersFor`, stretches what crosses, and commits one gesture. The shift is `BayAdd.shift` in the same file, sharing those helpers, so `plan` loses its inline copies. No second mover, no new op type.
**Ops, one gesture, one undo:**
1. One `GEOM_GRID_MOVE {gridId, delta, commands: [], induced: 'block-shift'}` per line. `Grid.foldFromOplog` and `GridSpanGate.fold` already read these; the fold ignores empty commands (`bonsai_kernel_worker.js:555`, `bonsai_kernel.js:349`).
2. `GEOM_MOVE` for each element at or beyond the line; riders for their hosted fillings.
3. `GEOM_SCALE` for each element crossing the line.
**Classifying, from the mesh vertices projected on the lattice axis (`lo`, `hi`), against line position `X` and band `b`:**
| Test | Result |
|---|---|
| Has a fills edge to a host | rides its host, never classified itself |
| `lo >= X - b` | moves rigidly |
| `hi <= X - b` | stays |
| otherwise, a class the grid governs (`_STRUCTURAL_CLASSES`) and aligned | stretches by the move |
| otherwise | stays, and is **named in the report** as crossing and not following |
`b` = max(`ON_LINE` 0.3 m, the largest half-width of a column centred on the line + `EDGE_TOL`): the engine's own band (`grid_kinematics.js:111`). **No new threshold:** aligned = the local axis nearest the lattice axis is within `|theta| + YAW_TOL` of it. A 3-axis placement is not aligned.
**Direction:** along the lattice axis, not the world axis (Garage's lattice is at −2°). `GEOM_SCALE` anchors at the local minimum, so a member whose local axis points against the lattice axis also gets the move, as `plan` does for `dir < 0`.
**Refusals, an answer and not a crash:** a filling hosted by an element that would stretch (same reason as `plan`); a stretch that would shrink a member to nothing; unknown line.
**Reach:** a hook and the CLI only. No button, because this exists to measure a proposer. It does not call `gridmove.commit`, so the walker's STR tab is not re-walked; the span rows read the op log and are unaffected.
**Known limits, stated now:** a member aligned to the world on a rotated lattice stretches on the world axis, off by `d·sin|theta|` sideways (2° and 1.5 m: 52 mm). A stretch reads scale from `GEOM_SCALE` ops only, so a member already scaled by an earlier single-line move in the same call gets an inexact factor.

### 13.2 Only grids derived from the building
**Measured 2026-11-07, real Open of each resident:**
| Resident | Label in the app | Measured | Own lines |
|---|---|---|---|
| HospitalGarage | column-framed | 140 columns, RC, 17×29, theta −2° | column-derived |
| Hospital | column-framed | 349 columns, **material unreadable, so spans refuse**; 69×55 lines, most gaps under 2 m | column-derived |
| SampleCastle, Clinic, HHS | column-framed | **0 IfcColumn rows in the `_ARC.db`**, walks as wall-bearing | none laid |
| Terminal | column-framed (oracle) | 0 IfcColumn rows in `Terminal_ARC.db`, not opened | not read |
| SampleHouse | wall-bearing | `swDeriveSemiGrid`: x 1.62, 6.265; y −1.246, 0.899, 4.554 | wall-derived |
| Duplex | wall-bearing | `swDeriveSemiGrid`: 9×6 | wall-derived |
**Decision:** Hospital cannot judge a span, and the Garage is already in the test. So SampleHouse stays, on `swDeriveSemiGrid`'s lines. The labels above are stale and are reported here, not changed here.
**The edit:** `edit_cli --own-grid` lays `swbSemiGridSpec()` on a wall-bearing building. The app's Move Grid is unchanged: a person still gets the default grid there, and W-EDIT-CLI's default-grid comparison must stay byte-identical. `--lines` states `grid_source`. The runner refuses a brief whose source is `app-default`, and the prompt says where the lines came from.
**Briefs:** the old gx2 does not exist, so S1 becomes gx0–gx1 at 5 m (now 4.645). S2 and S3 keep their text; S3 goes 2.145 → 3.5. **S2's trap is gone:** it was the wall-through-wall move on the default grid, and gx1 is now a different line.

### 13.3 Stop at a judged-fine result
CLEAN and PARTLY_JUDGED end the run. "Not kept" is then said only after a bad result. Nothing else about the loop changes.

### 13.4 The report names the limit and the bay
**Issue:** no G4 run declined, because the row says the count rose and not what the limit is.
`GridSpanGate.tally` adds `limit` and the bays it already computes. The span-over-limit row gains `limit`, `material` and `over_limit_changed`: each bay that is over the limit after the edit and whose span changed, `{bay, before, after}`, newly over first, then longest, at most 8, with the total. The panel prints them. No new threshold, and the proposer prompt still does not state the limit.

### 13.5 Witnesses, written first
**W-BLOCK-SHIFT** (`modeller/tests/witness_block_shift.js`, real Garage):
| Claim | Proves or disproves |
|---|---|
| Hand rows: moves, stays, crosses, rider, not-governed crossing, refusals | The classifier is wrong |
| `gy9` +1.51: gy8–gy9 = 7.00; every other bay on the axis unchanged; all lines beyond moved by exactly that | A block shift is not rigid |
| Every moved element keeps its size and travels the same vector; every stayed element is unchanged; a stretched member keeps its low end and its high end travels with the block | Elements do not follow the lines |
| Span rows equal an independent recount from the fold; the overlap row judged more than 100 moved elements | The report is vacuous or wrong |
| The same goal line by line refuses, gy9 to gy14; the shift does not | **The §12 flaw is real, and this edit removes it** |
| One Ctrl+Z restores every box and line; Ctrl+Y returns After; the chain verifies | It is not one gesture |
| Narrowing past a stayed element reports RED | The shift hides a real conflict |
| Falsifier `SHIFT_BREAK=1` (the elements travel a different distance) fails it | The witness cannot fail |
**W-EDIT-CLI adds:** a shift through the CLI = the page, byte for byte; twice = identical; `--own-grid` reports the derived lines and refuses on a column-framed building's absence of a semi-grid; default-grid bytes unchanged.
**W-EDIT-REPORT adds:** `gx6` +1.817 on the Garage names `gx5-gx6`, 11.18 → 13.00, limit 12, RC, equal to a recount; a move that puts nothing new over names no new bay; a refused span has no limit and no bay; the panel prints the same.
**Regression:** W-BAY-RIDE, W-DXF-ADD-BAY (`plan` was refactored), W-EDIT-REPORT, W-EDIT-CLI, W-EDIT-REPORT-COVERAGE.

### 13.6 Found while building, before any model call
Probing the new edit through the CLI turned up two more problems. Neither was in the spec above.
**1. A live bug, fixed: any move reshaped a 3-axis element.** `bonsai_library.js` rebuilt the placement with yaw only after a `GEOM_MOVE`, so `place()` fell to its yaw branch. Measured: Garage wall 22, moved +1 m in y, also rose 10.03 m and turned; SampleHouse furniture rose 0.614 m. It hits the plain Move tool, not only a shift: 24 of 864 elements on the Garage, 3 of 38 on SampleHouse. The fix keeps the 3-axis placement; a rotate keeps its old path. W-BLOCK-SHIFT A1, A2. §12's code had this bug. Whether its runs hit it is not measured: a grid move uses `GEOM_MOVE` only for hosted riders.
**2. On a rotated building, world boxes make the overlap numbers meaningless.** A 0.2 m beam 120 m long at −2° has a 4.38 m wide world box. The Garage's overlap row read about 1,900 before any edit, and a rigid +1.51 m widening read 7 to 10 new clashes (lattice travel 7, world travel 10), every one from long members growing a few centimetres sideways in their boxes. A stretched member also really does end `|d|·sin|theta|` off the lattice, the known limit in §13.1, which is 5 to 10 cm against a 20 mm tolerance. Either way the test would have scored every Garage shift RED, the same unfairness §12 is being fixed for.
**The instrument:** `edit_cli --lattice-boxes` judges on boxes in the lattice frame, with tolerance 20 mm + `|d|·sin|theta|`, stated in the row label ("Box overlap over 73 mm"). Computed, no new constant. No effect at theta 0. **The live app and its Save gate are untouched, and stay on world boxes.** It applies to single-line moves and shifts alike, so the two are judged by one instrument.
**What it costs:** a penetration shallower than that tolerance (72 mm at 1.51 m, 125 mm at 3 m) goes unreported on these runs. W-BLOCK-SHIFT F2, N1: the widening goes clean and a real narrowing stays RED (44 clashes).
**Owner's question, not acted on:** the live Save gate on a rotated building still uses world boxes, so it can block on phantom overlaps. Whether to move it to lattice boxes is a separate decision, because it changes what blocks a Save.
**Measured on this instrument, one edit each, no model:**
| Edit | Result |
|---|---|
| G1 shift gy9 +1.51 | clean; 508 moved, 8 stretched, 14 crossing left behind |
| G1 gy9 +1.51, single line | RED: 2 clash, 1 driven into a wall |
| G2 shift gy11 −1.49 | RED: 44 clash, 1 driven into a wall |
| G3 shift gx8 +1.5 | clean |
| G4 shift gx6 +1.817 | RED: spans 91 → 92, names `gx5-gx6`, limit 12 |
| G5 shift gy12 +0.6 | REFUSED: 3 fillings on an element that would stretch |
| G5 gy12 +0.6, single line | REFUSED: §DAGEVU |
| G6 shift gy5 +2 | clean |
| G7 shift gy20 +3 | clean |
| S1 gx1 +0.355 (own grid), single line | clean, 5 recomposed |
| S1 shift gx1 +0.355 | REFUSED: 5 fillings on an element that would stretch |
| S3 gy1 +1.355, single line | REFUSED: §DAGEVU |
| S3 shift gy1 +1.355 | REFUSED: 2 fillings on an element that would stretch |
So G1, G3, G6 and G7 have a right answer by shift, and a proposer that finds it scores it. **This table tells the reader what is available, not what a model will do.**

### 13.7 PRE-REGISTERED, fixed before any model call
At bim-ootb branch `feat/proposer-test-v2`, commit **`4a1e82f5e4955bd6dae0f10a22535f654c5d7b02`**: `modeller/tests/proposer_test/briefs.json`, `run.js`.
**Same as §12:** `claude-sonnet-5-5`, isolated; not told the limit, the walls or the openings; 10 briefs × 3 = 30; Arm A the first proposal and forecast, Arm B the same run with the report fed back, up to 2 revisions; the classes; the rule for a right outcome; every number listed in §12 is reported.
**Different, all five named:**
1. The proposer may use `shift`, and is told what it does.
2. S1–S3 are on SampleHouse's wall-derived lines, and the prompt says so. S1 is now gx0–gx1. S2 no longer carries its known trap.
3. CLEAN or PARTLY_JUDGED ends a run.
4. The report names the limit and the changed over-limit bays.
5. Overlaps are judged on lattice boxes with the stated tolerance (§13.6).
**Also reported:** how many first and final proposals used a shift.
**What I expect, written down so it can be wrong:** A's right outcome rises well above 3 of 30, because a shift is now easy to choose and four briefs have a clean one. The gain from the report (A to B) may then shrink. G4 is the check on change 4: at least one G4 run should now decline. If none does, naming the limit did not help.
**What this can and cannot show:** as §12. Counts, n=30 on 10 briefs, one model, briefs I wrote, half of them traps. **§12's numbers are not directly comparable:** the edit set, the grid, the stop rule, the report and the boxes all changed. Do not quote "3 → X" as an improvement over the first test.

### §13 RESULT 2026-11-07 (bim-ootb #2685, raw: `modeller/tests/proposer_test/results_v2_2026-11-07.json`)
30 runs, 51 attempts, `claude-sonnet-5-5`, $0.41, run at the pre-registered commit. **Pre-registered numbers, unchanged:**
| | A: alone, first proposal | B: with the report, final |
|---|---|---|
| CLEAN | 15 | 21 |
| PARTLY_JUDGED | 0 | 0 |
| RED | 6 | 6 |
| REFUSED | 9 | 0 |
| DECLINED | 0 | 3 |
| Goal met (arithmetic) | 30 | 27 |
| **Right outcome** | **15** | **24** |
| Used a shift | 24 | 15 |
Passed the report but lines crossed: 0. Passed the report but goal missed: 0. Bad first proposals: 15, of which 2 were forecast as fine.
**By brief, the same in all 3 repeats unless noted:**
| Brief | First | Final | Right |
|---|---|---|---|
| G1, G3, G6, G7 | shift, CLEAN | same | A and B |
| S2 | single move, CLEAN | same | A and B |
| S1, S3 | shift, REFUSED (fillings on a wall that would stretch) | single move, CLEAN | B |
| G5 | single move, REFUSED | DECLINED | B |
| G2 | shift, RED | single or two-line move, RED | neither |
| G4 | shift, RED | the same shift, RED | neither |

**What I expected, against what happened (§13.7):**
- A rises well above 3: **yes**, 15. Not separable from the other four changes.
- The gain from the report may shrink: **no**, +9 against §12's +7, on a different test.
- At least one G4 run declines: **no**, 0 of 3. The expectation was wrong, and the reason is the useful part. Every G4 revision named the 12 m limit and `gx5-gx6` (6 of 6, and 0 of the 3 first proposals; none of §12's G4 runs named the limit), then kept the edit: "the request fixes the width at 13 m, so I can't avoid this", and left it to the engineer. Naming the limit changed what it knew and said, not what it did.

**What it shows:**
1. **A shift was the missing word.** Asked to widen one bay, the model chose it on 24 of 30 first proposals. On G7 it chose it to avoid the line crossing, and said so.
2. **The report turned 9 runs right.** On S1 and S3 a refusal's reason led it to a move that worked; on G5 it read the refusal and declined, with the reason. These are real, and all three are refusals, not red ink.
3. **A report does not stop a proposer that has decided.** 6 of 30 finals are RED after being shown the result. On G2 it tried three different edits, never declined, and ended RED. On G4 it knowingly kept an over-limit span, with an honest note.
4. **The forecast still does not separate good from bad:** problems forecast on 13 of 15 bad first proposals and on 11 of 15 good ones.

**Limits. They come before any headline:**
1. **⚠ CLEAN does not count what a shift leaves behind.** On G1, 14 crossing elements did not follow. **12 of them are `IfcBuildingElementProxy` rows that the building's own names call its floors and ramps:** 11 about 60 × 33 m, 3.5 to 4 m deep, 27 m beyond the line, and one 83 × 33 m (matched to `elements_meta.element_name` by size). G3 left 25, G6 14, G7 7. So the columns and beams moved, the floors did not, and the row says CLEAN. The report names them, and one model revision noticed, but the scoring fixed in §12 does not read that field. **All 12 clean Garage results, G1, G3, G6 and G7, carry this.** Without them: A 3, B 12, of which 6 on S1 and S3.
2. **Two briefs depend on the wider tolerance.** On lattice boxes at a plain 20 mm, G3 reads 7 new clashes and G7 74, so both would be RED, and right outcome would be A 9, B 18. §13.6 attributes those to stretched members, from pairs read on G3 and G7, not from all of them.
3. **The 30 runs are not 30 decisions.** Only 16 different brief-and-edit pairs appeared in 51 attempts, and the repeats nearly match. This model at this prompt is close to deterministic, so read it as about 10 decisions.
4. **ORANGE does not count**, as registered. S1 and S2 each open 6 gaps at touching elements and score CLEAN.
5. **As registered:** I wrote the briefs, half are traps, one model, CLEAN is not a good design. §12's numbers are not comparable, because five things changed.

**Verdict.** The report helps most when it reports a refusal with its reason, and a shift removes a real obstacle. **The size of the gain is still not established:** limit 1 alone takes the first number from 15 to 3. There is now direct evidence that a report does not stop a proposer that has decided, and also that the current "clean" is too generous to gate on.

**Decision for the owner.** Recommended: keep the gate parked, because a gate on today's CLEAN would pass a shift that leaves the floors behind. Next, either make those floors follow or make a shift that leaves elements behind score as not clean, then run once more. If a stop is wanted sooner, the narrowest honest one is refusing a *new* over-limit span on an external call: that row has an independent recount, and it is the only thing that would have changed G4. It would not touch G2.

## 14. Third proposer test and the public guide — SPEC 2026-11-07 (owner: "proceed"; "prepare also a user guide for external AI proposer to use it - at our present github.io URL with landed Hospital as test case")
The reject gate stays parked.

### 14.1 Everything crossing the line follows, by one rule
**Issue:** §13 limit 1. A shift moved the columns and left the floors behind, and scored CLEAN. Stretching a 60 m floor uniformly would be wrong too: its far part must travel rigidly, and only the widened bay may stretch. A uniform stretch also causes §13.1's sideways error, and it is why §13.6 needed a wider tolerance.
**The rule:** a shift has one plane, `at = X - b` on the lattice axis. **Every vertex at or beyond it travels the block's vector; every vertex before it stays.** An element wholly beyond moves; wholly before stays; crossing, only the bay stretches. No proportional scale, no anchor, no local axis, so no sideways error, on any yaw or 3-axis placement.
**How:** a new action on the existing `GEOM_GRID_MOVE` commands, `{featureId, action: 'HINGE', n, at, dx, dy}`, folded in `foldInsert` with TRANSLATE and SCALE, in op order. `BayAdd.shift` drops `GEOM_SCALE` for crossing elements. Wholly-beyond elements stay plain `GEOM_MOVE` with their riders. One exception: an element that already carries a HINGE gets `at: null`, because a later `GEOM_MOVE` would fold before the earlier hinge and test the wrong coordinates.
**What follows when crossing:** the classes the grid governs (`_STRUCTURAL_CLASSES`), `bay_repeat`'s stretch classes (`IfcMember`, `IfcCovering`), and `IfcBuildingElementProxy`, because that is what this building's floors are, by its own element names. Everything else crossing (furniture, a door with no host, plates) stays and is named.
**Fillings on a crossing host:** wholly beyond rides by `GEOM_MOVE`; wholly before stays; **straddling the plane is refused**, since a door has a fixed shape.
**Refused:** a crossing element carrying a `GEOM_CUT` or other parent-mutating op: the worker folds those as solids, and has no HINGE. 1 host on SampleHouse, 0 on the Garage.
**Tolerance:** a shift is judged at the plain 20 mm on lattice boxes. `--lattice-boxes` keeps its wider tolerance only for a single-line move, which really does travel on the world axis.
**Limit, stated now:** copy-paste of an element carrying a HINGE keeps the plane, so the copy would hinge in the wrong place. A shift has no button, so no person can reach this.
**Scoring, one new class:** LEFT_BEHIND: nothing red, but a shift left crossing elements behind. Not a right outcome, and it counts as bad. The report goes back as usual. CLEAN can no longer hide it.

### 14.2 The CLI needs one file and a browser, and can drive the live site
**Issue:** an outside proposer cannot use `edit_cli`: it requires the test harness, which loads puppeteer from a path on this machine.
`edit_cli.js` stops using the harness: its own small puppeteer launch and static server, same settle logic, same output. `--url <modeller.html>` drives that page. With no `--url` it serves its own repo when it stands in one, and otherwise uses `https://red1oon.github.io/bim-ootb/modeller/modeller.html`. Puppeteer resolves normally, then through `NODE_PATH`.
**W-EDIT-CLI must stay byte-identical:** C1a, C1b and C8a pin it against the page.

### 14.3 The guide
**Issue:** nobody outside can tell how to propose an edit, what comes back, or what the report does not check.
`docs/ProposerGuide.md`, in the site's nav, published only through `scripts/safe_gh_deploy.sh`. Shape: getting started, common tasks, under the hood, troubleshooting. **Test case: the Hospital**, on the live URL. Every command in it is run against the live site and every number is what came back.
**W-PROPOSER-GUIDE** (`modeller/tests/witness_proposer_guide.js`): the guide's commands, as published, against the live URL. Each named number must match. **Proves or disproves:** the guide's commands do not work for an outsider, or its numbers are stale. INCONCLUSIVE if the site cannot be reached, never a pass.
**The guide must say:** the report checks little and a pass never means safe (§5); the NOT-checked list; spans are "not judged" on the Hospital because its material cannot be read, and why that is an answer and not a zero; nothing is saved; it is a measuring tool with limits, not an endpoint with uptime; do not send private models.

### 14.4 Witnesses
**W-BLOCK-SHIFT revised:** E3 checks a crossing element vertex by vertex, before the plane unchanged, beyond it moved by exactly the vector, with no tolerance. New: floors follow on the Garage (`left` = 0 on G1); a straddling door is refused; F2 clean at the plain 20 mm. **P-tests** rewritten for the hinge.
**W-EDIT-CLI adds:** `--url` against a served copy = the local answer, byte for byte. **Stub adds:** LEFT_BEHIND scores bad and is not right.
**Regression:** as §13.5, plus W-E2E-CUT-MOVE, because `cut_move.js` reads these commands.

### 14.5 Measured before any model call, and PRE-REGISTERED
Fixed at bim-ootb branch `feat/proposer-test-v3`, commit **`d28e886b2933041b328126d15cdca70ab1bd31b1`**: `modeller/tests/proposer_test/briefs.json`, `run.js`. **Same as §13.7**, with two changes: the shift follows §14.1, and LEFT_BEHIND is a class. Every number listed there is reported again.
**What the shift does now, one edit each, no model:**
| Edit | Result |
|---|---|
| G1 shift gy9 +1.51 | clean; 508 moved, 22 crossing followed, 0 left; overlap 1565 → 1565 |
| G2 shift gy11 −1.49 | RED: 2 clash, 2 driven into a wall. **It read 44 under the uniform stretch: most were false** |
| G3 shift gx8 +1.5 | clean |
| G4 shift gx6 +1.817 | RED: spans 91 → 92, `gx5-gx6`, limit 12 |
| G5 shift gy12 +0.6 | **clean, no longer refused**: its openings ride. A decline and this edit both count as right |
| G6 shift gy5 +2 | clean |
| G7 shift gy20 +3 | clean |
| S1 shift gx1 +0.355 | LEFT_BEHIND: 2 elements |
| S3 shift gy1 +1.355 | REFUSED: a crossing wall carries a cut |
**So §13's limits 1 and 2 are gone by construction:** all four clean Garage shifts now take their floors along, at the plain 20 mm. Limits 3 to 5 of §13 still stand.
**What I expect, written down so it can be wrong:** first proposals barely change, because the prompt barely changed, so A stays near 15 and B near 24. If so, the numbers stay the same and **mean more**. G5 may move, since a shift works there now and none of §13's G5 runs tried one. *(Corrected after the run: this sentence first said "only 3", a slip; it decides nothing.)* G4 still does not decline, unless the wording helps.
**Not comparable, again:** the rule behind every shift changed. Read this test on its own.

### §14 RESULT 2026-11-07 (bim-ootb #2688, #2689; raw: `modeller/tests/proposer_test/results_v3_2026-11-07.json`)
30 runs, 54 attempts, `claude-sonnet-5-5`, $0.45, run at the pre-registered commit. **Pre-registered numbers, unchanged:**
| | A: alone, first proposal | B: with the report, final |
|---|---|---|
| CLEAN | 15 | 21 |
| RED | 6 | 6 |
| REFUSED | 6 | 0 |
| LEFT_BEHIND | 3 | 0 |
| DECLINED | 0 | 3 |
| Goal met (arithmetic) | 30 | 27 |
| **Right outcome** | **15** | **24** |
| Used a shift | 24 | 15 |
Passed the report but lines crossed: 0. Passed but goal missed: 0. Bad first proposals: 15, of which 1 was forecast as fine.
**By brief:** G1, G3, G6, G7 shift, CLEAN at once. S2 single move, CLEAN at once. S1 shift LEFT_BEHIND, then the other side RED, then single move CLEAN. S3 shift REFUSED, then single move CLEAN. G5 single move REFUSED, then DECLINED. G2 RED throughout. G4 the same shift, RED, three times.
**Expected against what happened (§14.5):**
- A stays near 15 and B near 24: **yes, exactly.** The prompt barely changed, so the model's choices barely did. The same numbers now mean more: **§13's limits 1 and 2 are gone,** the floors go along, and every shift is judged at 20 mm.
- G5 may move to a shift: **no.** A shift works there, and all 3 runs still tried the single move and then declined. Counts as right; it does show the model not finding an available answer.
- G4 does not decline: **correct,** 0 of 3. It named the 12 m limit in all 6 revisions, and kept the edit.

**What it shows, now without the §13 caveat on CLEAN:**
1. A shift was the missing word: chosen on 24 of 30 first proposals, and the four clean Garage shifts take their floors along.
2. The report turned 9 runs right, all through a refusal or left-behind notice and its reason. S1 is the best case: it read "2 furniture items left behind", tried elsewhere, read the red, and found the working edit.
3. **A report does not stop a proposer that has decided.** G2 and G4: 6 of 30 finals RED.
4. **The forecast still does not separate good from bad:** problems forecast on 14 of 15 bad first proposals, and on 10 of 15 good ones.
**Limits still standing:** the 30 runs are about 10 decisions (17 different brief-and-edit pairs in 54 attempts); ORANGE does not count (S1, S2 open gaps and score CLEAN); I wrote the briefs and half are traps; one model; a single-line move on the Garage still uses the wider tolerance; CLEAN means nothing the report checks went wrong, not a good design. **The size of the gain is not established. Tests §12, §13 and §14 are not comparable.**

### The guide, 2026-11-07
**Published:** https://red1oon.github.io/BIMCompiler/ProposerGuide/ . Guard: 496 live, 497 new, PASS; canaries 200.
**W-PROPOSER-GUIDE:** `pass=14 fail=0`: 7 commands, as printed, from one `edit_cli.js` downloaded from the live site, in an empty folder, against the live Modeller; and the published page prints each command and number. Falsifier `GUIDE_BREAK=1`: fails. A plain `npm install puppeteer@24` on Node 18.19 with nothing borrowed from this machine: works, same bytes.
**Found by doing it as an outsider:** the newest puppeteer needs Node 22 and is ESM-only, so the first install failed, behind a CLI message that blamed the wrong thing. Fixed (#2689), and the guide pins version 24. **Not tested:** Node 22 with puppeteer 25; another operating system; the guide's suggested prompt, which the guide says plainly.
**On the Hospital:** a shift is refused on 116 of 122 lines (a door straddles the plane), the other 6 each leave something behind, and 16 of 16 single moves at +0.5 m on lines with at least 1 m each side came back red. `gx0` −0.5 m outward is the no-red example. Spans are never judged here, because the material cannot be read. The guide says all of this rather than choosing a flattering example.

**Decision for the owner: the reject gate.** CLEAN is now honest enough to gate on, which §13 said it was not. The evidence says a report alone will not stop a proposer that has decided: G4 knowingly kept an over-limit span in all 3 runs. **Recommended:** a stop on external calls only, for a *new* over-limit span and for new RED rows, with a recount behind each and never on extracted buildings (STATUS). Alternative, cheaper first: run the guide's stricter prompt ($0.45) to see whether words alone fix G2 and G4. Parked until the owner says.

### 14.6 No paid model calls; a rehearsal mode; lazy loading — SPEC 2026-11-08
**Owner, 2026-11-08:** *"prepare best effort product without incurring any API call costs unless it is a 3rd party free one or in a sandbox here where you mock or mimick such a AI proposal."*
**How §12 to §14 were run, checked 2026-11-08:** `run.js` spawned `claude -p` on this machine. That uses the machine's login, which is **claude.ai** (`claude auth status`: `authMethod: claude.ai`, `apiProvider: firstParty`; no `ANTHROPIC_API_KEY` in the shell or settings). So the runs drew on the owner's plan allowance, with no per-token API bill. **The `$` figures in §12 to §14 are Claude Code's `total_cost_usd` estimates, not charges.** They were started on "continue" and "proceed", without the owner being asked about spending; that is not repeated.
**1. The model mode is gated.** `run.js` makes no model call unless it is given `--model-calls`. Without it, it refuses and names the hand-off mode. **No session passes that flag** (`feedback_no_paid_model_calls.md`).
**2. Hand-off mode, the free path:** `run.js --handoff <dir>`. For each proposal it writes `<dir>/q_<brief>_<rep>_<n>.txt` (the system line and the prompt, exactly as a model would get them) and waits for `<dir>/a_<same>.json`. Anyone may answer: this session, a person, or a free outside service. Scoring, the CLI and the stop rules are unchanged. **The results file is stamped `"mode":"handoff rehearsal"`, `"measurement":false`, with who answered.** This session is not an isolated proposer, because it has read the briefs, the answers and the limits, so a hand-off run is never quoted as a measurement.
**3. `bay_add.js` loads on first use again.** #2685 added a script tag for the block shift, so 15.8 KB parsed on every open for an edit no person can reach. The shift now loads it on its first call, the same way DXF2BIM does.
**Witness:** the stub gains H1, a hand-off brief answered by an in-process answerer, which must score the same class as the CLI gives; H2, no `--model-calls` means a refusal and no `claude` process; H3, the results file carries the stamp. W-BLOCK-SHIFT must pass with no `bay_add.js` tag in the page.
**RESULT 2026-11-08 (bim-ootb #2697, sw v243):** stub green with H1, H1b, H2 (a fake `claude` placed first on `PATH` never ran) and H3. W-BLOCK-SHIFT 46/0, with Z1 (`bay_add.js` absent at open) and Z2 (loaded on the first shift). W-DXF-ADD-BAY 18/0, W-EDIT-CLI 20/0. Live `modeller.html` = main, no `bay_add.js` tag. W-PROPOSER-GUIDE re-run on the live site after it: 14/0. **No model was called.** Wider load weight, measured the same day: `prompts/BROWSER_BOOT_WEIGHT.md`; the edit report's own lazy loading is listed there as the owner's call.
**How to rehearse here at no cost:** `node modeller/tests/proposer_test/run.js --handoff <dir> --answered-by "this session" --briefs G4 --reps 1 --out <file>`, then answer each `q_*.txt` with an `a_*.json` in the reply shape. The result is a rehearsal, never a measurement.


## STATUS
2026-11-06 spec drafted. 2026-11-07: §3 extracted, §4 witnesses committed, §6 fixes shipped, live checks measured (§3.5), gate fix and report shipped (§8), DeepSeek's review checked (§10), CLI shipped (§11), first proposer test run (§12), its flaws fixed and second test run (§13), the floors made to follow and third test run, public guide published (§14).
⏸ **Reject gate PARKED by owner 2026-11-07.** Three proposer tests have run. 6 of 30 finals stay RED after the report, and CLEAN no longer hides what a shift leaves behind, so the decision is ready for the owner (§14 RESULT). When un-parked: apply only to external orders, at `PlacementRequest`, checking before any snap; then run the §7 measurement. A gate must not apply to extracted buildings: the compile path stays log-only until its rules are proven against them (`CompilationPipeline.java:1536`).
Still open, by design: every row marked NONE in §3.1 and §3.5, snap cases S2–S5. G4-TAMPER still reports 73 older violations (§6.3).
