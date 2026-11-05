# ⚠ DO NOT REMOVE — PDF2BIM resume prompt (paste the block below into a NEW session)
# Scope: finish the ONE low-cost single-storey house (TB-LKTN) from vector PDF -> DXF -> a coherent model that Converts in the Modeller. Findings live in `prompts/PDF2BIM_VECTOR_PROBE.md` (▶ RESUME HERE) and `bim-ootb prompts/DXF2BIM_MODELLER_LANE.md` (§L32-§L39); this file only STARTS a session.
# Read the log after every run (`<outdir>/logs/*.log`); exit code is not evidence. Honour this block until the prompt is DONE. Written 2026-11-05. The chain is on `master` (PR #369), the Modeller entry on bim-ootb `main` (PR #2647). Replaces the session-4 prompt.

```
Resume the PDF→BIM lane on the low-cost house. Read prompts/PDF2BIM_VECTOR_PROBE.md: ▶ RESUME HERE, then §41, §40, §38, §39, §36, then §33, §35, §34, §29 to §32. Then bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L36 to §L39. The owner said: consolidate on this one house first.

WHERE THE FILES ARE
- Two repos. bim-compiler `master`: the PDF -> DXF chain, scripts/pdf2bim/. bim-ootb main: the importer and the Modeller, modeller/.
- Run `git worktree list` in each first. Work on a fresh branch off `origin/master` in a /tmp/wt-* worktree (feat/pdf2bim-vector was squash-merged and deleted: never revive it). For bim-ootb, a fresh /tmp/wt-* from origin/main.
- Do NOT edit the shared ~/bim-compiler or ~/bim-ootb checkouts: other sessions use them.

REPRODUCE FIRST (verify before building)
`PDF2BIM_OOTB=<bim-ootb worktree> scripts/pdf2bim/run_p1.sh <outdir>`, then read logs/01..16. Expect:
- `§LIB els 72` = 50 IfcWall (47 + 3 gable-end) + 2 IfcSlab + 2 IfcColumn + 7 IfcDoor + 7 IfcWindow + 4 IfcRoof
- `§LIB blocking 0`, `§LIB accepted 57 ... verdict qualifies`; `§WC RESULT fails 0`; `§R RESULT fails 0`; `§W RESULT PASS`; `§D RESULT fails 0` with W-D4 FINDING on the 2 D2; `§A RESULT fails 0` with 10 READ, W-A3 8 judged + 2 UNJUDGEABLE
- `§T RESULT PASS fails 0` in 17_witness_template, W-T1c included; every blank READ
- typed sheets byte-identical between two clean runs; `geom_hash.py` hash 03a3dfef2a0b4342 (18_geom_hash.log, measured 2026-11-05). IFC files differ on one line, the header's timestamp.
- `PDF2BIM_OOTB=<tree> scripts/pdf2bim/witness_ruler.sh <that outdir> <work dir>`: `§T RESULT fails 0` (moved drawing, wrong ruler, stripped sheet, swapped orientation).
- `PDF2BIM_OOTB=<tree> scripts/pdf2bim/witness_variant.sh <that outdir> <work dir>`: every `§V ... RESULT fails 0` (control, wider bay, taller wall, 90% print, swapped tags, other font, new schedule size, 2 falsifiers, the §37 falsifier).
- `PDF2BIM_OOTB=<tree> scripts/pdf2bim/witness_second.sh <that outdir> <work dir>`: `§2D RESULT fails 0`, one DEFAULT (floor_buildup), and the falsifier writes no IFC.
- After changing any rule here: rebuild with `make_port_oracle.sh`, then the port must follow, byte for byte: bim-ootb `modeller/tests/witness_pdf2dxf_rules.js`, `witness_pdf2dxf_reader.js`, `witness_pdf2dxf_page.js`.
- TBKLTN_House.pdf is git-ignored and library/component_library.db is not in git: the script finds both in ~/bim-compiler. It migrates a COPY of the library only.
- Run ifc_check.py, gap_register.py, witness_house_roof.py WITHOUT `python -I` (IfcOpenShell is in the user site).

RULINGS (do not re-litigate)
- THE TYPE IS A PREFAB FACTORY (owner 2026-11-04, §33): template types/low_cost_single_storey_unit.json, 'Low cost single storey unit'. Structure preset (one storey, such a roof, room layout, envelope with openings system), orientation presumed, code fills only the blanks (dims, opening positions) from the 2D drawing. Marking recognition is hard without this ruler: accepted. NO chooser or form input: paper stays the input.
- Fill rule: within tolerance READ (nominal), outside FINDING (the sheet wins, rounded to its module), nothing measurable DEFAULT (stated).
- A similar drawing with different bubbles and dims must be picked out and adjusted: a weak-sighted reader with good rules of thumb, going by what is expected; still no OCR (§35).
- The owner publicly says "Element types from custom template" and "Meshes are from a standard library". Keep them true: see the last line of §33.
- No OCR, no raster or learned shape recognition. A building TYPE is an editable JSON prior read once in hindsight; the owner accepts that as a template source.
- Extract only: never invent geometry. Every value is read from a sheet, or stated YELLOW / default. The plan gives footprints, the elevation gives heights. A disagreement in the drawing is a FINDING, recorded, never adjusted to fit.
- PoC ruling (owner 2026-11-04, "i can accept as this is p-o-c to get to the end of gaps discovery"): 23 stand-in rows accepted, 43 dimension rows waived, 10 grid-label rows a stated finding. It is recorded in the dictionary only and does NOT reach the Modeller.
- DB changes ship as migration scripts, never binary DB commits. bim-ootb owns modeller/dxf2bim/ (edit there, never sync.sh). Spec before code. A witness must be able to say NO-OP, VACUOUS or WRONG. Never ask the owner to look at anything; a picture is an illustration, never evidence.
- Push and merge your own verified PRs (auto-merge), then fetch the live URL to confirm: green CI is not deployed.

STATE IN ONE LINE
A low-cost house PDF reaches Convert from the Modeller's Open panel ("from PDF drawing"), offline, by fixed rules, and builds on the live site: walls, house doors on their floor, windows, slab, pitched roof, porch, columns, gable ends. Library ebcea595bea6 is LIVE (owner's go 2026-11-05); rollback = point latest.json back at f5a308656e73. Tested on TB-LKTN and on a second drawing this lane wrote.

OWNER DECISIONS, ⛔ ASK ONCE, THEN WORK ON WHAT IS LEFT:
A real low-cost PDF from another drafter. Publishing a library again needs its own go: state the change in types/library_next_publish.json BEFORE the run, upload `<sha12>/`, run witness_library_publish.js BEFORE moving latest.json, flip last, fetch back, run the real URL, then move the witness pins.

Owner decided 2026-11-05: the PDF step runs in the Modeller page, row "from PDF drawing" (§42). A second sample PDF may be authored, just to test (§40). Scans are refused by ruling.

⏸ STOPPED 2026-11-05 BY THE OWNER (tokens), MID-FILM. **First job next session: cut the film: `prompts/FILM_PDF2BIM.md` §4 ▶ RESUME HERE.** The owner said go (a narrated English film with the caveats on screen). Shots are in `~/Videos/pdf2bim_film_work/`, the script and facts are in §5, every product fix it needed is live. Say that in one line, then do it; don't re-ask.

Then: NEXT, needing no decision: see the RESUME block. The Revit question matters most: the owner sees this as saving hours in Revit, and the walls are meshes.

LANDMINES (each cost time on 2026-11-04 and -05)
- Puppeteer's request interception stalls the kernel worker's start (2 of 8 runs stuck, 0 of 8 without). It looked like a Convert that did nothing, and two wrong explanations came first. Redirect the fetch inside the page instead, and count before explaining.
- Don't write a result into a doc in the same command that prints it.
- Read first, then write: a commit said "all variants fails 0" while its own sweep said H fails 5, because the text was written in the command that printed the result. Corrected in the next commit.
- A rule is not done until BOTH drawings and every variant have run: four of the second drawing's rules broke TB-LKTN or a variant first.
- A service worker's fetches escape puppeteer's request interception: a "local library" run was really hitting the live one while logging "served from local". Assert the `sha=` that answered (T0, S0); use setBypassServiceWorker.
- At machine load 40 Convert witnesses time out and pass alone: read the FATAL line before calling it a regression, and re-run it alone.
- `witness_second` passing proves less than it seems: the author knows the reader, and it found errors in the drawing as well as the reader; keep them apart in the record.
- Never blame the engine first: `create_shape(st,e).geometry.verts` reads freed memory. Two sessions recorded IfcOpenShell as non-deterministic; it was us. A garbage value such as -7.98e27 is a pointer bug until shown otherwise.
- A log line saying WRONG that no verdict reads is invisible: REAR's W-E1 said WRONG from §35 to §39. W-T1c now fails on any stage's own WRONG (stages 00-11); NOFILL's is expected.
- `INSERT OR IGNORE` hides a key collision as success: `--only D3` dropped its mesh rows silently. Count what landed.
- A check that compares against the schedule loses the door when the schedule changes: a door arc is known by its radius and pen. A verdict of `qualifies` does not mean all doors are there: W-D1 counts them.
- A witness typed for the last publish fails on a better result: state the next one in types/library_next_publish.json BEFORE the run.
- `pkill -f <name>` run from a shell whose own command line holds that name kills the shell (exit 144).
- Before merging an importer or Convert change, run EVERY witness that clicks Convert: `grep -ln "dxf-convert\|DxfImportUI.convert" modeller/tests/*.js`, not a chosen few. #2628 broke two witnesses this way. Not runnable here (generated inputs absent): witness_dxf_convert, witness_dxf_meta_editor, witness_e2e_dxf_wing: say so, do not imply they passed.
- A pass can be false: a dropdown check passed with nothing focused because an even number of toggles restored the end state. Prove the action happened (real focus, counted events).
- Selectors on PDF sheets pick up neighbours: the notes table beside the plan, title-block lines, hatch rows in tiled walls, ribs split by the ridge cap. Bound them to the building and let a witness catch the rest. Never widen a tolerance to pass.
- page.setOfflineMode does not reach a service worker: witness_dxf_airgap.js cuts the whole browser with a dead proxy and witnesses the cut.
- Headless runs use CPU GL (swiftshader) only: the owner may be baking on the GPU.
- A warp seam must clear every door arc and window (7725 in the end bay): a clipped arc loses doors, and that is the instrument, not the chain. The hash cannot see annotation: compare entities too.
- Verdict lines hide things: W-T4 printed PASS over a differing sheet and G1 went WRONG on a moved run with no failure, until each log was read and the witness hardened. Read the logs, and diff them against the reference run.
- `stroke-width` is not a pen width: multiply by the matrix scale (`type_template.pen`). The same characters as grid labels sit in section markers and tables: choose the whole row (`top_row`, `left_col`), never the topmost word.

AT SESSION END
Update the RESUME block in PDF2BIM_VECTOR_PROBE.md and this prompt, commit and push, and prune your worktrees if clean and fully pushed.
```
