# ⚠ DO NOT REMOVE — PDF2BIM session-2 prompt (paste into a NEW session)
# Scope: continue the vector-PDF -> DXF -> IFC lane (TB-LKTN page 1). The evidence trail and the ▶ RESUME HERE block live in `prompts/PDF2BIM_VECTOR_PROBE.md` — this file only STARTS a session; it holds no findings.
# Read the log after every run (`<outdir>/logs/*.log`); exit code is not evidence. Honour this block until the prompt is DONE. Written 2026-11-04, branch `feat/pdf2bim-vector` @ f2330892c.

```
Resume the PDF→BIM lane. Read prompts/PDF2BIM_VECTOR_PROBE.md ▶ RESUME HERE first, then §27b and §28. The lane is on branch feat/pdf2bim-vector (pushed, not yet merged to master; no PR opened).

WHERE THE FILES ARE
- Run `git worktree list`. If /tmp/wt-pdf2bim exists, reuse it. Otherwise `git fetch origin feat/pdf2bim-vector` and `git worktree add /tmp/wt-pdf2bim feat/pdf2bim-vector`. Never create a second worktree for it.
- Do NOT edit the shared ~/bim-compiler checkout or ~/bim-ootb: other sessions use them (one is working Jebel Masjid DWG/DXF in ~/Projects/Jebel). Read bim-ootb only.
- Another session's commit 0f50a6fa8 put an OLDER copy of the spec on fable/meshdb-livewire. The current spec is only on feat/pdf2bim-vector: expect an add/add conflict if both merge.

REPRODUCE FIRST (verify before building)
Run `scripts/pdf2bim/run_p1.sh /tmp/pdf2bim_run`, read logs/01..12. Expect: `§LIB els 58` = 44 IfcWall + 6 IfcDoor + 7 IfcWindow + 1 IfcRoof; `§LIB blocking 82`; `ifc_check.py` DIRECT wall bbox x -0.05..9.95, y -6.25..0.05, z 0.15..3.15.
- TBKLTN_House.pdf is git-ignored: put it at 2D_Layout/input/ or set PDF2BIM_PDF.
- library/component_library.db is not in git: set PDF2BIM_LIBDB or use the ~/bim-compiler copy. The script applies migration CL006 to a COPY; the original is never modified.
- Run ifc_check.py WITHOUT `python -I` (IfcOpenShell is in the user site).

RULINGS (do not re-litigate)
- No OCR, no raster or learned shape recognition.
- A building TYPE is an editable JSON prior (scripts/pdf2bim/types/*.json) read once in hindsight by a multimodal read; the owner accepts that as a valid template source.
- Every dictionary entry needs a numeric witness; unclear items stay YELLOW. Never invent geometry or dimensions: extract only.
- DB changes ship as append-only migration scripts (migration/*.sql, e.g. CL006), never as binary DB commits.
- Spec first: write the claim before the code. A witness must be able to say NO-OP, VACUOUS or WRONG. Never ask the user to look at anything.

STATE IN ONE LINE
Emission and fidelity are DONE for page 1. Lane acceptance is blocked by 82 stated rows: 6 reader gaps + 22 library stand-in rows (windows are Duplex/UK stand-ins; no 600x500, 1200x1000 or 1800x1000 window exists in any of 30 local buildings) + 54 drawing-quality rows (the PDF is under-dimensioned against the lane's standard; do not fill by invention).

PICK UP ONE (ask the owner first only for C)
A. HITOS window migration for closer W2/W3 stand-ins (nearest 1090x1091 and 565x582): confirm mesh orientation first, then write the migration (§28). W1 has no local match.
B. The remaining 16 emission-fixable rows: 10 QF:grid_unlabelled (read dxf2qualify.js for the accepted label form); the unfilled D3 and the unbounded D2 gap (read dxf2shell.js placeFills); the 559 mm arc that is not a door (drop it or classify it as a fixture); the single-storey slab default.
C. OWNER DECISION: accept the stand-ins and waive the dimension rows for a PDF-sourced set, or supply families and dimensions.

THEN
1. Other sheets: p2 electrical, p3 roof/G-notes, p7 plumbing.
2. Generalise: run the SAME chain on a second drawing of the type with only the JSON edited.
3. Only then PNG/raster input, as a new spec with its own witnesses.

OPEN DEFECTS (diagnose, don't fix here)
- The importer IFC writer puts IfcWall.PredefinedType = * on all walls (41 schema errors): belongs to the bim-ootb DXF2BIM lane.
- IfcOpenShell create_shape bbox is non-deterministic on this file: use the DIRECT bbox.

AT SESSION END
Update the RESUME block in PDF2BIM_VECTOR_PROBE.md, commit and push, and prune /tmp/wt-pdf2bim only if it is clean and fully pushed.
```
