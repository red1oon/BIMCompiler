# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES + the proposer test + the stop on outside calls. **No paid model calls** (owner, 2026-11-08). No gate beyond §15.1 without the owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an outside proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the details were invented. This file keeps only the part that survives. **Consolidated 2026-11-08;** the full earlier text, with every superseded spec and run note, is in `prompts/archive/NEURO_SYMBOLIC_ORDER_CONTRACT_full_2026-11-06_to_2026-11-08.md`.

## ▶ RESUME HERE (2026-11-08)
**State:** everything specified here is shipped and witnessed. **Nothing is waiting on the owner.** Next work, each needing its own go:
1. ✅ Done 2026-11-08: a free hand-off rehearsal of the stop (§15.1). A wider one is possible on the same terms.
2. The Java `PlacementRequest` gate, once an outside order really arrives there (STATUS).
3. Browser boot weight, its own file: `prompts/BROWSER_BOOT_WEIGHT.md`.
4. Not started, each its own go: the report for bay add and other gestures, a session total at Save, beam and column rules on a live edit, a shift in the Modeller's UI.
5. **The film "Think Global, Act Local": English rc3 BUILT 2026-11-08** (`~/Videos/Think_Global_Act_Local_EN_rc3.mp4`, 221.6 s; §16.7). Waiting on the owner: a look and a listen. Other languages only on a later ask. Found on the way, its own go: `edit_cli --lines` overstates bays by 1/cos θ on a rotated building (§16.1).

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
**Hand-off rehearsal, 2026-11-08** (G1, G2, G4, one repeat; answered by this session, which knows every answer, so **not a measurement**; `$0`, 4 CLI calls, no model). It checks the loop and the stop, not a proposer:
| Brief | Attempts | What came back |
|---|---|---|
| G1 | shift gy9 +1.51 | CLEAN, run ends |
| G2 | shift gy11 −1.49; then gy10 +1.49; then decline | **STOPPED** "New or deeper box overlap: 2; Driven into a wall it touches: 2"; **STOPPED** "…overlap: 2; Driven into a wall it touches: 1"; DECLINED with both reasons |
| G4 | shift gx6 +1.817; then decline | **STOPPED** "Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 12.993 m"; DECLINED, naming an extra column line as the way to a 13 m bay |
**What it shows:** each stop undid the edit and passed the reason and the full report back through the revision prompt, so the next proposal started from the restored building. The results file stamps itself `"mode":"handoff rehearsal","measurement":false`. **What it cannot show:** whether an isolated model, given the same stop, declines G4 instead of retrying. In §14 the model kept that edit three times; under the stop, keeping it is no longer possible, but whether the model then declines or keeps trying is unmeasured.

### 15.2 The report loads on the first committed grid move
`edit_report.js` and `edit_report_panel.js`, 13.6 KB, left the page's script tags; the 46 lines of glue in `modeller.html` stay. W-EDIT-REPORT Z1 (absent at open) and Z2 (loaded by the first grid move).

## 16. FILM "Think Global, Act Local" (plan, 2026-11-08; spec only, nothing recorded)
**Owner's ask, verbatim:** *"plan a film to demonstrate it. Title, "Think Gloval, Act Local', AI creates much slop if there is no symbolic ground truth to refer to. Thus our BIM-OOTB opens up a layer for any AI to propose upon it and it can analyse how far is the result from 00mm accuracy"* (title spelled "Global" on screen).
**Gates:** no capture, voice or cut without the owner's go. **No model call to make footage** (§14.6): every AI line on screen is quoted verbatim from a recorded results file, with its date and model name; a hand-off rehearsal line is labelled "rehearsal, answered by us, not a model's result".
**Opener (owner, 2026-11-08):** pose the problem first: *"Say u ask this question and u get a beautiful render, but is it accurate?"* (beat 0b).
**Layout:** `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C (explainer: before/after in the first 25 s, show then prove, one real event, roadmap card "not built yet") + its COMPARISON/PROOF addendum (layman words, a chart for every comparison, honest limits in the voice). **Pipeline:** copy `scripts/film_network_erp/` (resolve → guard → record → fit → mux), so every digit on a card or in the voice resolves to a named row in this file or a `§` line. English first (Kokoro, local); other languages on the owner's say.

### 16.1 The thesis, in what this lane can prove
- **Think global = the AI.** Imagination, any proposal, outside the compiler, untrusted (§1). Its arithmetic can be right and still break a rule it was never told.
- **The closing line (owner, 2026-11-08):** *"Let your AI do the beautiful rendering, but let its data be grounded."* Beats 0b to 0d pose the problem; everything after is the grounding; 10b says it.
- **Act local = the compiler,** on the caller's own machine, no AI inside: it judges one edit against the building it was given, reports, and stops new red (§11, §15.1).
- **The slop beat, from our own measured run, not stock images** (`FILM_VS_AI_SLOP.md` already made the AI-image film; do not remake it). G4, `results_v3_2026-11-07.json`, rep 0, attempt 0, `claude-sonnet-5-5`: *"Bay gx5 to gx6 is currently 161.234 − 150.051 = 11.183 m. To reach 13 m it must widen by 1.817 m."* It even forecast *"Girders … will stretch by 1.817 m, which may overstress them"*, and the result was RED. In §14 it named the 12 m limit in all 6 revisions and kept the 13 m bay. Its forecast did not separate good from bad (problems forecast on 14 of 15 bad first proposals, 10 of 15 good). The point: **without the symbolic ground truth, a fluent answer and a right answer look the same.**
- **"How far from 0 mm": what the film may say.** There is **no single "distance from 0 mm" number** in the product; the film must not show one. It shows each measure as its own row:

| On screen | Measured as | Source |
|---|---|---|
| The edit lands exactly | a shift's crossing vertices: 68,336 checked, 0 off, no tolerance | §14.1, W-BLOCK-SHIFT |
| Undo lands exactly | after a stop, a recount equals Before; the next edit equals that edit made alone | §15.1 C13, C14 |
| Same question, same answer | two fresh Opens give byte-identical report JSON | §8, W-EDIT-REPORT |
| How far over a rule | bay gx5-gx6 12.993 m against the 12 m RC limit | §15.1 rehearsal, G4 |
| New overlaps | count before → after, at a stated 20 mm tolerance | §13.6, §14.1 |
| What was NOT checked | the report's own list | §8 |

- **The 7 mm, SETTLED 2026-11-08 (measured, `scripts/film_neuro/evidence/probe_7mm.log`):** `§NEURO_FILM_7MM building=HospitalGarage theta_deg=-2.0000 lattice_bay=11.1760 lines_bay=11.1828 lattice_over_cos=11.1828 diff_mm=6.81 lattice_plus_1817=12.9930`. On the −2° Garage, `edit_cli --lines` prints where each grid line crosses the world axis (`Bonsai.gridmove.gridLines()`, laid by `swbGridSpec`, `str_walker_bridge.js:362-370`: `xs = (u − c0.y·sinθ)/cosθ`), while the span check measures across the lines in the building's own frame (`grid_span_gate.js` `fold`, lattice `u`). So any bay read from `--lines` is the true bay ÷ cos θ: 11.1760 / cos 2° = 11.1828. The shift itself moved the lattice line by exactly +1.817 (11.1760 + 1.817 = 12.9930, 0 mm off). **A real defect in what a proposer is handed, not a film beat** (PLAYBOOK C: a bug found while preparing is not a story): on a rotated building `--lines` overstates every bay by 1/cos θ, 0.06 % at 2°. Fix, its own go: `--lines` also prints `rotation_deg` and each line's position across the lattice. The film says only "the move landed exactly; 12.993 m against a 12 m limit".

### 16.1a How others pair AI with a check (searched 2026-11-08; re-fetch each source before voicing it, as `FILM_VS_AI_SLOP.md` requires)
| Who | What the AI proposes | What checks it | Is "how far off" reported? | Source |
|---|---|---|---|---|
| Free AI video, on our Hospital frame | a fly-through clip (pixels) | nothing | no: a picture has no parts list | our ledger, `FILM_VS_AI_SLOP.md` §DUEL_LEDGER |
| Veras-class rendering | an image over the model | the person looking | no: output is an image, not geometry | dancumberlandlabs.com/blog/revit-construction (A3 there) |
| Autodesk Assistant (in InfoWorks WS Pro) | answers and changes | the person: *"AI-generated responses may not always be complete or accurate."* *"If the Assistant makes changes to your work, review them before saving or sharing."* (re-fetched 2026-11-08; the earlier wording "cannot guarantee accuracy" is no longer on the page) | not stated | help.autodesk.com …GUID-9017743B… |
| Autodesk, as trade press reads it | probabilistic geometry | a deterministic parametric engine that "heals, constrains, brings into tolerance" | not published in that source | develop3d.com/cad/autodesks-ai-blueprint-for-cad (A2 there; interpretation, not Autodesk's words) |
| TestFit | no outside AI: its own rules generate | the rules themselves (unit mix, zoning, setbacks) | not published | testfit.io/news/aecbytes-ai-in-aec-updates-2022 (vendor page: "does not rely on" trained ML) |
| ~~Snaptrude AI agents~~ | — | — | — | **removed 2026-11-08:** the help page returned HTTP 404 |
| Madireddy et al. 2025 | Python checking scripts written by GPT, Claude, Gemini, Llama, run in Revit | "semi-automated"; who checks the scripts is not stated in the abstract | not stated | arXiv:2506.20551 |
| Claude + Blender connector (published April 28, 2026, built by the Blender developers, MCP) | Python commands in Blender (`bpy`); with the Bonsai add-on, an IFC model, including Bonsai's own work and cost schedules | the person | **repeat not measured here** | anthropic.com/news/claude-for-creative-work (primary, fetched 2026-11-08): *"The Blender developers have created an MCP connector, which is now officially available for Claude."* |
| AlphaGeometry (maths, not buildings) | an extra construction line | a symbolic deduction engine proves or fails | yes: a proof or no proof; *"AlphaGeometry solved 25 problems under competition time limits"* (of 30) | deepmind.google AlphaGeometry blog (fetched 2026-11-08; nature.com redirected to a login); paper Trinh et al., Nature 625, 476–482 (2024) |
| **This lane** | one edit from **any** outside AI | a compiler with no AI inside, **on the user's own machine**, stops new red | **yes, per row:** before → after, the limit, the bay, the NOT-checked list | §8, §11, §15.1 |
**What the table may claim:** AlphaGeometry is the closest pattern (a model proposes, a symbolic engine decides); in AEC, the sources found either make the person the checker or do not publish how the check reports. **What it may not:** that nobody else measures the gap (absence in our search is not absence), or anything about accuracy for a vendor row. Seen, not used: an MDPI *Buildings* 15(19) 3465 bridge-checking paper (the page returned 403; its precision figure is unverified).

### 16.2 Storyboard (about 150 s; cues set from the first fit, PLAYBOOK C §4)
| # | Picture | Dialogue (F asks as a newcomer, M answers in one or two plain sentences) | Source |
|---|---|---|---|
| 0 | Title card: kicker "AI proposes · the compiler judges"; line 1 "Think Global," line 2 (coral) "Act Local"; plain line "an open layer any AI can propose on" | none, silent 3.6 s | — |
| 0b PROBLEM | Owner's opener (2026-11-08): *"Say u ask this question and u get a beautiful render, but is it accurate?"* A typed question to an AI ("a slow cinematic fly-through of this hospital building") → the **free Wan 2.2 clip of our own Hospital** already recorded (`build/film_vs_ai/duel_clips/wan22_run1.mp4`, 62–65 s wait, 832×544, `FILM_VS_AI_SLOP.md` §DUEL_LEDGER rows 3-4) → hold on its frame, then the question as text | F: "Say you ask this, and you get a beautiful render. But is it accurate?" M: "Nobody can say. A picture has no list of parts to check against." | §DUEL_LEDGER finding 4: no element-aware measure exists for AI frames, so **the film says "cannot be measured", never "wrong"** |
| 0c REPEAT? | Owner's second question (2026-11-08): *"even though Claude takes your IFC to Blender, but can the 4D/5D schedules with overlays be repeated?"* A text card (names only, no logos): "Claude → Blender connector → Bonsai opens the IFC". Then our own existing Hospital film clip with the 4D day counter and the cost overlay; then a card "same run twice: 0 lines differ" | F: "But Claude can take my IFC into Blender now." M: "It can. Bonsai even has schedules. Ask it twice: is it the same schedule, the same cost, the same overlays?" | §16.1a Claude + Blender row; our side only after W-FILM-NEURO-4D5D-REPEAT (§16.4) |
| 0d CLASH GUESS | Owner (2026-11-08): *"and there maybe guesswork on a certain clash pair without mesh overlap fine tune?"* The existing Hospital film's clash beat: box pairs 1,478 → real mesh overlap 271; card "79 of every 100 box clashes were not real" | F: "And clashes? The boxes touch, so it's a clash?" M: "Boxes said 1,478. The real shapes overlap in 271. The rest is guesswork." | `§CLASH_NARROWPHASE broad=1478 meshTrue=271 falsePositiveRate=79.0%` (Hospital 0049 bake, `prompts/film_narration_hospital_0049_dialogue_v3.tsv` row `clash`; `FILM_NARRATION.md` L1323) |
| 1 BEFORE | The model's G4 words as a quote card: the arithmetic, the forecast, "decline: false" | F: "It did the maths. So it's right?" M: "The maths is right. It doesn't know this building's rule." | §16.1 slop beat |
| 2 IDEA | One plain card (icons per §16.2a): **stick figure** (the outside user) → **globe, "$"** (their AI, called over the internet) → one edit → **laptop, "$0"** (the compiler on their own machine, no AI inside) → the report back to the AI | F: "So who pays for what?" M: "The AI call costs money. The check runs on your own computer, free." | §1, §10, §15.1 rehearsal "$0" |
| 3 AFTER | The same edit through `edit_cli` on HospitalGarage: **STOPPED** "bay gx5-gx6 newly over the limit: 12.993 m (limit 12 m, RC)"; the building restored | F: "Stopped? By whom?" M: "By the building's own rule. Undone, recounted, back to where it was." | §15.1 |
| ch | Chapter card "Think global" | — | — |
| 4 | Globe icon with the run's cost tag "about $0.45, estimate" over a chart: right outcome first proposal vs with the report, 15 → 24 of 30 (the value the call is expected to add) | F: "So the report helps?" M: "In our small test, yes. Our briefs, one model, about ten real decisions. Not proven yet." | §12, §14 |
| ch | Chapter card "Act local" | — | — |
| 5 | Terminal: one downloaded file, `edit_cli --lines` against the live Hospital; the JSON | M: "One file. The live site. Your own computer. About a minute a call." | §11, §14.2, §14.3 |
| 6 | Shift close-up: one plane; everything beyond it moves, everything before it stays; card "68,336 points checked · 0 off" | F: "Zero? Not roughly?" M: "Every point moved exactly, or stayed exactly." | §14.1 |
| 7 | The report panel: red before → after, the limit, the bay, the NOT-checked list | F: "And what didn't it check?" M reads the list | §8 |
| ch | Chapter card "How far from the rule" | — | — |
| 8 | G2: stopped twice (overlaps, driven into a wall), then declined; label "rehearsal, answered by us" | M: "Each stop says why, so the next try starts from a clean building." | §15.1 table |
| 8b OTHERS | The comparison card (§16.1a), short labels; unmeasured cells say "not published in the source" | F: "Isn't everyone doing this?" M: "Some pair AI with a checker. The difference here: any AI, a check on your own computer, and a report that says how far off." | §16.1a, each row's citation |
| 9 | Honest-limits card: **the edit report's overlap row counts boxes, not meshes** (§8; on a rotated building, lattice-frame boxes, §13.6), so it can over-count the way 0d shows; no structural capacity; floating members and wrong units clear of the building are not caught; in the compile path 8 of 17 planted defects fire nothing; **a pass never means safe** | M says it plainly | §3.1, §3.5, §5 |
| 10 | Roadmap card, "not built yet": the mesh check behind the edit report's overlap row; a gate on the compile path when outside orders arrive; a real measured run with the stop; the report for adding a bay | — | RESUME, §15.1 |
| 10b PROMISE | Plain card, two lines in the title style: "Let your AI do the beautiful rendering," / (coral) "but let its data be grounded." | M says it once, nothing after it | owner, 2026-11-08: *"thus let your AI do the beautiful rendering but let its data be grounded"* |
| 11 HOW TO USE | Stick figure at a laptop; the guide URL large on screen: **https://red1oon.github.io/BIMCompiler/ProposerGuide/**; the four steps as on-screen text, copied from the guide's "Getting started", never retyped from memory: (1) `npm install puppeteer@24` (2) `curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js` (3) `node edit_cli.js --building Hospital --lines` (4) give your AI the guide's "Instructions to give your AI", run the edit it proposes, send it the report | F: "Can I try it with my own AI?" M: "Yes. Three commands, then paste the guide's instructions into your AI." | `docs/ProposerGuide.md` Getting started, Instructions to give your AI |
| 12 | End card (contacts, "No AI inside") | — | — |

### 16.2a Icons (owner, 2026-11-08: *"u may use a human stick figure to signify an outside user"* · *"shwo globe flaticon to indicate AI API calls with $$ costs and value added results expected"*)
| Icon | Means | Tag beside it, and its source |
|---|---|---|
| Stick figure | the outside user: whoever brings their own AI | none |
| Globe | an AI API call: over the internet, paid | **cost:** the recorded runs' `cost_usd` (`results_2026-11-07` $1.42, `results_v2` $0.41, `results_v3` $0.45, 30 proposals each with revisions); on screen "estimate", because they are Claude Code estimates under a claude.ai login, not charges (§14.6). **Value expected:** right outcome 15 → 24 of 30 (§14), with the small-test caveat in the voice |
| Laptop | the compiler on the user's own machine, no AI inside | "$0": the rehearsal made 4 CLI calls and no model call (§15.1) |
- **Licence:** a Flaticon icon needs attribution in the credits under its free licence; check the icon's own page before use and record the URL and author here. Default, to avoid the dependency: draw the stick figure, globe and laptop as plain SVG in the house colours (each is a few lines).
- **No new spend for the film:** the globe shows recorded figures only; no model is called to make a beat (§14.6).

### 16.3 Pictures: where each comes from
- **Report panel, Modeller:** the real page, headless, software GL, no GPU lock, device scale 1.5 (PLAYBOOK C §3), every value also printed as a `§` line beside the still (pattern: bim-ootb `capex/tools/film_shots.js`).
- **Terminal:** the real stdout of a fresh `edit_cli` run, rendered, never retyped; its log kept beside the film.
- **Chart (beat 4):** dataviz skill, from `results_v3_2026-11-07.json` `summary`.
- **Quote cards (beats 1, 8):** verbatim from the results file, with run date, model and "mode" on the card.

### 16.4 Witnesses (each names its issue; written before any cut)
- **W-FILM-NEURO-FACTS:** the copied `guard.js`; every digit on a card or in the voice maps to a row in this file; a planted number must fail it. Issue: a number in the film that the repo cannot back.
- **W-FILM-NEURO-LIVE:** the values on the report stills equal a fresh `edit_cli` JSON for the same edit; INCONCLUSIVE if any row is "not judged". Issue: the film showing a report the product no longer gives.
- **W-FILM-NEURO-QUOTE:** every quote card is a byte-exact substring of its results file. Issue: a paraphrased AI turned into a strawman.
- **W-FILM-NEURO-4D5D-REPEAT:** run the shipped 4D pipeline (`cache_4d_run.js` path, cache cleared) twice on the Hospital and compare the schedule (task, element, day), the 5D total and each overlay's `§` values (day counter, cost) byte for byte; INCONCLUSIVE if either run is empty. Issue: the film claiming "same every time" for 4D/5D with overlays. **What exists today is narrower:** the Duplex, Hospital and Terminal 4D run logs were byte-identical across two runs, 0 differing lines (`4D_MODEL_INTEGRITY.md` L2035, a before/after run around a change that did not touch them), and the edit report is byte-identical over two fresh Opens (§8). Neither covers 5D or the overlays, so beat 0c waits for this witness.
  **RESULT 2026-11-08: PASS** (`scripts/film_neuro/w_film_neuro_4d5d_repeat.js`, log `scripts/film_neuro/evidence/w_repeat.log`). Two runs of `cache_4d_run.js Hospital --force` into two empty `CACHE_4D_DIR` roots (11 s and 17 s, `Hospital_meta.db`, codeKey `1adc56735190` both): `4D.els` 63,182 · `4D.tasks` 36 · `4D.sched` 63,182 · `4D.play` 63,182 · `4D.playStats` · `4D.storeys` 63, all byte-identical; the pipeline log 61/61 lines identical once its 3 elapsed-time fields (`orderMs`, `compileMs`, `ms={…}`) are masked; 5D `§HR_COST` total 1,763,131 over 8 trades both (⚠ a formula copy of `tm_gantt_build.js:451-506`, which runs inside `injectGantt`); the overlay, the **shipped** `A.costOdometerAt` (`cpe_resource_panel.js:168-181`) at each of 341 days, identical. Falsifier `REPEAT_BREAK=1` (one played instant +1 ms) → FAIL, as it must. **Limits:** the overlay's numbers, not its pixels (a bake is GPU); one building. **Found on the way:** the 2026-10-03 Hospital film's own overlay reads `§COST_ODOMETER_FINAL cost=5124799` over 321 days; today's code gives 1,763,131 over 341 days. Same building, different code since: the film therefore shows today's two runs, never the October readout.
- PLAYBOOK step 5: frame count, silences ≤ about 7 s, about −16 LUFS, subtitle band empty.

### 16.5 Not in this film
Any claim that Blender or Bonsai cannot do 4D/5D (Bonsai has schedules; the question is repeatability only), Anthropic or Blender logos, structural safety, certification, JEPA, any "AI is bad" claim beyond our own measured run, any speed claim against working without us (not measured, ▶ START HERE).

### 16.6 Decided by the owner (2026-11-08: *"Agree with u, English only first"*)
1. **"0 mm" wording:** "the edit lands exactly; the report says how far it is from each rule". Never "0 mm accurate" as a whole-result claim.
2. **Building:** HospitalGarage for beats 3 and 8 (spans judged, RC); the Hospital for beat 5; both names on screen.
3. **Languages:** English only first (Kokoro, local). Others only on a later ask.
**Before any cut, done 2026-11-08:** the 7 mm (§16.1, settled), W-FILM-NEURO-4D5D-REPEAT (§16.4, PASS), the source re-fetch (§16.1a: Autodesk quote corrected, Snaptrude removed, Blender and AlphaGeometry from fetched pages). Owner's go to build: 2026-11-08 (*"Go"*).

### 16.7 English rc3, built 2026-11-08 (owner: *"Go"*)
**Deliverable:** `~/Videos/Think_Global_Act_Local_EN_rc3.mp4` (1920×1080, 24 fps, 221.6 s, 8.8 MB) + `…_rc3_narration.txt`. Pipeline `scripts/film_neuro/` (copied from `scripts/film_network_erp/`; `./build.sh`, CPU only), storyboard `scripts/film_neuro/script_en.md`, 21 beats, two voices (Kokoro af_heart / am_michael). Logs: `scripts/film_neuro/logs_rc3/`.
**Every number is a fact:** `resolve.js` 52 facts, 0 missing, from `scripts/film_neuro/evidence/` (copies of today's runs: `edit_cli` G4/G2/`--lines`, the panel report, W-BLOCK-SHIFT 35/0, W-FILM-NEURO-4D5D-REPEAT, the 7 mm probe, the proposer-test results file, the Hospital clash line, the free-demo ledger, the web sources). `guard.js` PASS: 66 numbers on the cards and 16 spoken, all facts; planted card number and changed spoken number both caught; the stills' sha256 unchanged since capture.
**Witnesses of the cut:** W-FILM-NEURO-LIVE SAME (the report panel in the film = `edit_cli`'s report, 2,355 bytes); recorder layout probe 75/75 images clean, 0 console errors; fit 16/16 DETAIL, tone 0 WRONG; frames 5,319 = the silent picture; longest silence 7.5 s (the end card), others ≤ 5.2 s; −16.5 LUFS.
**Defects found and fixed between cuts (not story beats):** rc1, a "how" question rose (reworded as yes/no) and a 9.5 s end silence (end hold 3 → 1 s); rc1/rc2, captions of 3–4 lines, then stacked overlapping captions, rose over the cards' source lines → turns cut into ≤ 2-line pieces (`tsv.js`), and each caption now ends where the next begins (`ass_noverlap.py`, 18 clamped, 0 left). rc1 and rc2 stay in `~/Videos` as superseded.
**Not done:** nobody has watched or listened; the 3D still of the Garage could not be used (the headless page draws no building), so the stop beats show the report panel and the terminal; the cost overlay is shown as today's two runs, not a baked HUD (§16.4).

## STATUS
2026-11-06 spec. 2026-11-07: extracted (§3), fixes (§6), report (§8), CLI (§11), three proposer tests (§12), shift and hinge (§13, §14), public guide (§14.3). 2026-11-08: no paid model calls (§14.6), the stop on outside calls and the report on first use (§15), consolidated; film "Think Global, Act Local": plan (§16), the three pre-cut checks, English rc3 built (§16.7).
**The gate, where it stands:** outside calls are stopped on new red (§15.1). The Java compile path stays log-only until its rules are proven against extracted buildings (`CompilationPipeline.java:1536`). When outside orders arrive at `PlacementRequest`, a gate there applies only to them, checks before any snap, and then the §7 measurement runs, at no cost (§14.6).
**Open by design:** every row marked NONE in §3.1 and §3.5; snap cases S2–S5. G4-TAMPER reports 73 older violations (§6.3).
