# ⚠ DO NOT REMOVE — PDF2BIM resume prompt (paste the block below into a NEW session)
# Scope: finish the ONE low-cost single-storey house (TB-LKTN) from vector PDF -> DXF -> a coherent model that Converts in the Modeller. Findings live in `prompts/PDF2BIM_VECTOR_PROBE.md` (▶ RESUME HERE) and `bim-ootb prompts/DXF2BIM_MODELLER_LANE.md` (§L32-§L36); this file only STARTS a session.
# Read the log after every run (`<outdir>/logs/*.log`); exit code is not evidence. Honour this block until the prompt is DONE. Written 2026-11-04, branch `feat/pdf2bim-vector`. Replaces the session-2 prompt.

```
Resume the PDF→BIM lane on the low-cost house. Read prompts/PDF2BIM_VECTOR_PROBE.md on branch feat/pdf2bim-vector: ▶ RESUME HERE, then §29 to §32. Then bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L36. The owner said: consolidate on this one house first.

WHERE THE FILES ARE
- Two repos. bim-compiler branch feat/pdf2bim-vector (pushed, no PR, not merged): the PDF -> DXF chain, scripts/pdf2bim/. bim-ootb main: the importer and the Modeller, modeller/.
- Run `git worktree list` in each first. Use /tmp/wt-pdf2bim for this branch (reuse it, else `git worktree add /tmp/wt-pdf2bim feat/pdf2bim-vector`). For bim-ootb, a fresh /tmp/wt-* from origin/main.
- Do NOT edit the shared ~/bim-compiler or ~/bim-ootb checkouts: other sessions use them.
- Another session's commit 0f50a6fa8 holds an OLDER copy of the spec on fable/meshdb-livewire: expect an add/add conflict if both merge.

REPRODUCE FIRST (verify before building)
`PDF2BIM_OOTB=<bim-ootb worktree at or after #2631> scripts/pdf2bim/run_p1.sh <outdir>`, then read logs/01..16. Expect:
- `§LIB els 72` = 50 IfcWall (47 + 3 gable-end) + 2 IfcSlab + 2 IfcColumn + 7 IfcDoor + 7 IfcWindow + 4 IfcRoof
- `§LIB blocking 76`; `§WC RESULT fails 0`; `§R RESULT fails 0`
- typed sheets byte-identical between two clean runs; geometry hash of the IFC's triangles a4c986f267f69a56 (measured 2026-11-04, bim-ootb c80b286f). The IFC FILE bytes do differ between runs, cause not checked.
- TBKLTN_House.pdf is git-ignored and library/component_library.db is not in git: the script finds both in ~/bim-compiler. It migrates a COPY of the library only.
- Run ifc_check.py, gap_register.py, witness_house_roof.py WITHOUT `python -I` (IfcOpenShell is in the user site).

RULINGS (do not re-litigate)
- No OCR, no raster or learned shape recognition. A building TYPE is an editable JSON prior read once in hindsight; the owner accepts that as a template source.
- Extract only: never invent geometry. Every value is read from a sheet, or stated YELLOW / default. The plan gives footprints, the elevation gives heights. A disagreement in the drawing is a FINDING, recorded, never adjusted to fit.
- PoC ruling (owner 2026-11-04, "i can accept as this is p-o-c to get to the end of gaps discovery"): 23 stand-in rows accepted, 43 dimension rows waived, 10 grid-label rows a stated finding. It is recorded in the dictionary only and does NOT reach the Modeller.
- DB changes ship as migration scripts, never binary DB commits. bim-ootb owns modeller/dxf2bim/ (edit there, never sync.sh). Spec before code. A witness must be able to say NO-OP, VACUOUS or WRONG. Never ask the owner to look at anything; a picture is an illustration, never evidence.
- Push and merge your own verified PRs (auto-merge), then fetch the live URL to confirm: green CI is not deployed.

STATE IN ONE LINE
The house has walls, doors, windows, slab, pitched roof with valleys, porch, columns and gable ends, deterministically, but the Modeller refuses to Convert it, and the window stand-ins do not fit their holes.

OPEN OWNER DECISIONS (asked, not yet answered; do not assume them)
1. Windows: author meshes to the p8 schedule sizes and types (my recommendation, marked as generated from the schedule), or the owner supplies families.
2. A recorded owner acceptance that the Modeller honours, so Convert runs on this set, with the accepted rows still listed on screen (my recommendation).
3. Publish the library with CL006 to OCI (outward-facing, shared): until then all 7 house doors report no_lod400_geometry in the Modeller.
4. Fold arrow on the 2D panel: kept for now (owner's own request, §D39; film scripts click it).

NEXT, needing no decision (the owner's test is "determined by code"): TAKE THE TYPED NUMBERS OUT OF THE CODE. See the RESUME block's list: read them from the sheets, or move them to the type JSON with a numeric witness. First roof_emit.py (EAVE 750, ridge 4872, ox/beam, the porch gable's x, the floor z, @BODYZ), then elev_emit.py views, then the page regions. Same geometry hash after the move = proof nothing changed; a changed hash must be explained.

THEN, once decided: 3, then 2, then 1, so the house Converts in the Modeller first. Then the rest of the register (`15_gap_register.log`): interior doors floating 38 mm, porch beam, wet-room step, IfcSpace, the opening relation, marks, finishes. A user-facing PDF -> DXF step. Only then a second drawing (⛔ needs a PDF from the owner), then raster.

LANDMINES (each cost time on 2026-11-04)
- Before merging an importer or Convert change, run EVERY witness that clicks Convert: `grep -ln "dxf-convert\|DxfImportUI.convert" modeller/tests/*.js`, not a chosen few. #2628 broke two witnesses this way. Not runnable here (generated inputs absent): witness_dxf_convert, witness_dxf_meta_editor, witness_e2e_dxf_wing: say so, do not imply they passed.
- A pass can be false: a dropdown check passed with nothing focused because an even number of toggles restored the end state. Prove the action happened (real focus, counted events).
- Selectors on PDF sheets pick up neighbours: the notes table beside the plan, title-block lines, hatch rows in tiled walls, ribs split by the ridge cap. Bound them to the building and let a witness catch the rest. Never widen a tolerance to pass.
- page.setOfflineMode does not reach a service worker: witness_dxf_airgap.js cuts the whole browser with a dead proxy and witnesses the cut.
- Headless runs use CPU GL (swiftshader) only: the owner may be baking on the GPU.

AT SESSION END
Update the RESUME block in PDF2BIM_VECTOR_PROBE.md and this prompt, commit and push, and prune your worktrees if clean and fully pushed.
```
