# ⚠ DO NOT REMOVE
**✅ DONE 2026-08-02 — sweep complete (72/72 cells), STOP CONDITION fired: no (W, pierce) cell
reaches baseline with §O3 passing. Nothing shipped, engine byte-unchanged. See §6.2–§6.4.**

**SCOPE — one job, nothing else.** Re-sweep the two tuned constants (`voidMode` width cap W, and the
door `pierce` depth) on the CORRECTED void axes, and report the matrix. This lane's constants were
both fitted against a transposed carve (§21.43), so neither is meaningful until the axes are right.
**This is a MEASUREMENT job.** You may ship a new default ONLY if a cell beats baseline on all five
gates; otherwise you report and stop. Do not redesign the substrate.

**READ THE LOG AFTER EVERY RUN.** Exit code is not evidence — every witness here prints `§`-tagged
numbers and a VERDICT line, and a run can exit 0 with a FAIL verdict inside. Save each run to a log
file and read it before drawing any conclusion. Honour this preamble until the file is marked DONE.

**Model note:** written for a Fable-class execution session. Do not write to `MEMORY.md`. All
findings, status and proof go into THIS file as dated sections (project rule — a session working a
`prompts/*.md` file updates only that file).

---

## §0 READ FIRST, then do not re-derive any of it

1. `prompts/Viewer/FindRooms/ROOM_PATHING_SUBSTRATE.md` — the concept doc. §5 trials, §6 method
   rules, §9 the gate suite.
2. `prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` **§21.43 → §21.44** only.
   Everything before §21.29 is superseded.

**SETTLED 2026-08-02 — these are closed. Re-deriving any of them is the failure this section exists
to prevent:**
- §21.41's doorway-merge fix: **falsified before coding.** It separates cleanly (0.0% of >10 m²
  pockets misclassify) but reaches 1 of 8 far-end groups. **Do not implement it.**
- §21.41's root cause ("the graph terminates inside the doorway"): **retracted.** Those pockets carry
  2–5 door-matched openings each.
- `rel_contained_in_space` as an oracle: **retracted, it is circular** — written by our own
  `scripts/compile_rooms.py:1295`, and every door names exactly ONE space so it cannot express an
  adjacency. This lane has no independent oracle. Do not go looking for one in this job.

## §1 Setup

```bash
cd ~/bim-ootb && git worktree list          # FIRST. Reuse /tmp/wt-roompath if it exists.
# only if it does not:
GIT_LFS_SKIP_SMUDGE=1 git worktree add /tmp/wt-roompath review/roompath-redundancy
```
Fixtures are `~/bim-ootb/buildings/{Clinic,LTU_AHouse}_extracted.db` — never OCI, never the
bim-compiler copy. Engine is `viewer/lib/room_walker.js`. `RES = 0.20`, `SEAL = 2`.

Apply the axis fix, which is already written and measured, just not shipped:
```bash
cd /tmp/wt-roompath && git apply roompath_diagnostics/patch_21_43_transpose.diff
```
It changes `_rasterizeSpine`'s carve from `max/min`-normalised (always long-along-world-x) to each
void's own axes. Output is identical wherever `bbox_x >= bbox_y`, so half the fleet is untouched by
construction.

## §2 The sweep

`pierce` is currently hardcoded (`var pierce = v[5] ? 10 * RES : RES`). **Add a knob, do not edit the
constant per run** — an env var read once (`ROOMPATH_PIERCE`, default `10`, in CELLS) or an `opts`
field threaded through `spineMap`/`storeySpine`. Default behaviour must be unchanged when the knob is
unset; prove that with one run before sweeping.

Matrix, both fixtures, every cell:
```
W       ∈  B, 1.5, 2.0, 3.0, 6.0, cur      (voidMode; B = door-hosted openings only)
pierce  ∈  4, 6, 8, 10, 12, 14  cells      (0.80m .. 2.80m)
```
Record per cell: `unroutable%`, `stranded n/total`, `§O3 phantom share + verdict`, `§T5 retention`,
`wall m²`, `enclosed m²`. 36 cells × 2 fixtures — batch it, write one CSV/TSV plus the logs, and
stream progress; do not run 72 silent invocations.

## §3 The gate — all five, no exceptions

| Witness | Asserts | Baseline to beat |
|---|---|---|
| `witness_room_path_aperture_tier.js` | §T1–§T5, retention ≥90% | 100% / 100% |
| `witness_room_path_overlink.js` | §O2 sweep, **§O3 phantom share** | LTU 20% PASS |
| `witness_room_path_stranded_cause.js` | §SC3 independent breaks | Clinic 9 · LTU 14 |
| `witness_room_path_cluster_boundary.js` | §CB5 sealed suites | Clinic 7/9 · LTU 8/14 |
| `roompath_diagnostics/doorprov6.js` | §DP9 stranded area · §DP10 blindness control | see §21.43b |

Baseline on the UNPATCHED tree, reproduced 2026-08-02 on this machine:
```
Clinic  50/186  unroutable 49.3%      LTU (W:3.0, live default)  18/277  unroutable 18.4%
                                      LTU (cur)                  15/263  unroutable 16.4%
```

**§O3 is the gate that decides.** It is the one that reads 20% PASS on the transposed carve and 94%
FAIL on the corrected one at the current constants. A cell is only a candidate if §O3 PASSES.

## §4 Acceptance, and the stop condition

- **Ship a new default** only if some cell has §O3 PASS, §T5 ≥90%, and unroutable at or below
  baseline on BOTH fixtures. Then: change the defaults, re-run all five gates once more on the final
  values, log them, commit, push, and record the numbers here.
- **If no cell qualifies — say so plainly and STOP.** That is a real result about this substrate, not
  a failure to try hard enough. Report the best cell per fixture with its §O3 verdict, and state
  explicitly that the corrected geometry cannot reach 18.4% at any (W, pierce). **Do not invent a
  third constant, a per-building value, or an area threshold to close the gap** — the standing
  constraint is that a rule must hold for any IFC a user imports (§7 of the concept doc).
- Report the MATRIX, not just the winning cell. A single number from a sweep hides whether the
  optimum is a plateau or a spike; a spike is a fitted constant and this lane does not accept one.

## §5 Rules that bind this job

- **Spec before code.** Any engine change gets a dated section here first, with its prediction, before
  it is written. §21.43 is the worked example: its prediction failed and the change was withdrawn.
- **Whitebox `§` logs are the proof.** No screenshots, no Playwright for value verification.
- **Push before you finish.** `git rev-list --count origin/<branch>..HEAD` must be 0 at session end.
- Nothing from this lane is deployed and nothing should be deployed by this job. `common/room_graph.js`
  and `viewer/navigate_find.js` stay byte-unchanged.
- If a run needs more than ~30s of `git push` it may be the LFS pre-push probe hanging — stop and
  report, do not retry in a loop.

## §6 Status log — append a dated section per run

### 2026-08-02 §6.1 SPEC (written before the code) — pierce knob + sweep runner

Worktree `/tmp/wt-roompath` reused (clean, at `4339cd7`). Engine change, specced here first per §5:

**Knob.** Module-scope in `viewer/lib/room_walker.js`, next to the carve:
```js
var PIERCE_CELLS = (typeof process !== 'undefined' && process.env &&
                    +process.env.ROOMPATH_PIERCE > 0) ? +process.env.ROOMPATH_PIERCE : 10;
```
and the carve line becomes `var pierce = v[5] ? PIERCE_CELLS * RES : RES;`. Read once per process
(so one node process per pierce value); `typeof process` guard because this lib also loads in the
browser, where the knob must not exist. Applied ON TOP of `patch_21_43_transpose.diff`.

**Prediction (the identity proof, one run before any sweep):** with `ROOMPATH_PIERCE` unset, the
patched+knobbed tree must reproduce §21.43b's "with fix" numbers exactly — Clinic 50.4% (53/184),
LTU cur 18.8% (17/261), LTU W:3.0 23.0% (26/276), §O3 94% FAIL. Any deviation = the knob is not
neutral, stop and fix before sweeping.

**Runner.** New `roompath_diagnostics/resweep_w_pierce.js`: for one `ROOMPATH_PIERCE` value, both
fixtures, runs `spineMap` for W ∈ {B, W:1.5, W:2.0, W:3.0, W:6.0, cur} plus one uncarved run
(§T5 denominator), prints per cell `§SW <fixture> pierce=<p> W=<w> unroutable stranded/rooms
wall encl retention` + a `§SW_O3` line (B vs W:2.0 vs cur contrast — same arithmetic as
`witness_room_path_overlink.js` §O3, so pierce-row constant across W by construction) + TSV lines.
Driver: 6 sequential invocations `ROOMPATH_PIERCE=<4|6|8|10|12|14>`, each tee'd to
`roompath_diagnostics/w_sweep_p<p>.log`, read after every run.

### 2026-08-02 §6.2 IDENTITY PROOF — knob is neutral, patch reproduces §21.43b exactly

Patch applied clean (`git apply`, 18 insertions), knob added, `node --check` OK. One run of
`witness_room_path_overlink.js` with `ROOMPATH_PIERCE` **unset**, log
`roompath_diagnostics/w_overlink_knob_identity.log`, read in full:
```
§O2 cur    Clinic  stranded=53/184  unroutable=50.4%       (§21.43b: 50.4% 53/184  ✓)
§O2 cur    LTU     stranded=17/261  unroutable=18.8%       (§21.43b: 18.8% 17/261  ✓)
§O2 W:3.0  LTU     stranded=26/276  unroutable=23.0%       (§21.43b: 23.0% 26/276  ✓)
§O3 LTU    phantom share=94%  VERDICT FAIL                 (§21.43b: 94% FAIL      ✓)
```
§6.1's prediction HELD — all four anchors byte-identical to §21.43b. Sweep licensed.

### 2026-08-02 §6.3 THE SWEEP — full 6×6 matrix, both fixtures. **STOP CONDITION FIRES.**

Runner `roompath_diagnostics/resweep_w_pierce.js`, 6 processes (`w_sweep_p{4,6,8,10,12,14}.log`,
each read after its run; all 12 `§SW_DONE`/TSV-complete), matrix committed as
`roompath_diagnostics/w_sweep_matrix_2026-08-02.tsv` (72 rows). Second identity anchor: the p10 row
equals §6.2's run exactly. §SW_UNCARVED Clinic 1980 m², LTU 22311 m².

**Clinic — zero opening geometry, so all six W modes are identical by construction; the sweep is
effectively 1-D in pierce** (per-cell: `unroutable% · stranded/rooms · wall m²`, encl = 1980 m² and
§T5 = 100.0% PASS in every cell):
```
pierce      4            6            8            10           12           14
unroutable  78.5%        49.8%        49.6%        50.4%        56.3%        54.0%
stranded    107/214      56/207       57/208       53/184       42/143       32/118
wall m²     840          824          809          793          779          763
§O3         N/A (no gain to explain — no openings) at every pierce
```
Baseline to beat: **49.3% (50/186)**. Best corrected cell **49.6% @ p8** — the response is U-shaped
(shallow pierce fails to cut through walls; deep pierce merges room pockets into each other, rooms
214→118) and its minimum sits ABOVE the transposed-carve baseline. **No Clinic cell reaches 49.3%.**

**LTU** (`unroutable%`, with `stranded/rooms`; §T5 = 100.0% PASS in every cell; encl = 22311 m² flat):
```
W \ pierce   4              6              8              10             12             14
B            56.8 (305/540) 40.9 (294/531) 38.0 (292/519) 25.2 (276/489) 24.1 (262/457) 20.3 (257/431)
W:1.5        58.8 (168/387) 37.8 (150/378) 34.5 (143/368) 30.2 (124/344) 26.9 (113/323) 21.0 (113/302)
W:2.0        50.0 (141/345) 30.7 (133/336) 28.5 (127/326) 24.8 (111/302) 23.3 (106/285) 21.2 (106/264)
W:3.0        34.6 (49/315)  29.1 (41/309)  26.4 (35/301)  23.0 (26/276)  20.6 (23/266)  17.9 (23/245)
W:6.0        32.7 (44/303)  25.3 (34/297)  22.4 (28/290)  18.7 (20/265)  18.7 (20/255)  15.6 (20/234)
cur          33.0 (41/299)  25.6 (31/293)  22.6 (25/286)  18.8 (17/261)  18.8 (17/251)  15.6 (17/230)
wall m² (cur) 2431          2394           2363           2336           2309           2281

§O3 (B vs W:2.0 vs cur, pierce-row constant):
pierce       4              6              8              10             12             14
gain         23.7pts        15.4pts        15.4pts        6.4pts         5.3pts         4.7pts
kept@2m      6.7pts         10.3pts        9.5pts         0.4pts         0.8pts         -0.8pts
phantom      72% FAIL       33% FAIL       38% FAIL       94% FAIL       85% FAIL       118% FAIL
```
Baseline to beat: **18.4% (18/277) @ W:3.0**. Cells at/below it: **p14×{W:3.0 17.9, W:6.0 15.6,
cur 15.6}** only — and p14 is the grid edge with §O3 phantom at **118%** (`kept@2m` NEGATIVE: cap
the unhosted voids at 2 m and the result is worse than tier B — 100%+ of the gain rides on >2 m
non-doorway voids). The closest §O3 ever gets to passing is p6: kept/gain = 10.3/15.4 = **0.67**,
just under the 0.70 bar, at 25–29% unroutable. Deeper pierce trades §O3 integrity for unroutable —
the exact "buying connectivity with wall removal" mechanism §21.43b named (wall m² falls
monotonically with pierce, 2431→2281 on cur).

### 2026-08-02 §6.4 VERDICT AGAINST §4 — no cell qualifies. Reported, nothing shipped.

Per-gate, over all 72 cells:
- **§T5 retention ≥90%**: PASS in 72/72 (100.0% everywhere — the carve never breaches the envelope
  at any (W, pierce); §PRECARVE makes retention pierce-invariant by construction).
- **§O3 phantom**: **PASS in 0/72.** LTU FAIL on all six pierce rows (72/33/38/94/85/118%); Clinic
  N/A (no gain to explain — no opening geometry, `gain = 0.0` at every pierce).
- **unroutable ≤ baseline on BOTH fixtures**: no cell. Clinic never reaches 49.3% (min 49.6% @ p8);
  LTU's three sub-18.4% cells are all p14 with §O3 at its worst.

**STOP CONDITION (§4) — stated plainly: the corrected geometry cannot reach the transposed-carve
baselines at any (W, pierce) in the grid with §O3 passing.** Best cell per fixture: Clinic
**p8, 49.6%** (§O3 N/A, §T5 100%) — 0.3pt short of 49.3%; LTU **p14/cur, 15.6%** (§O3 118% FAIL,
§T5 100%) — beats 18.4% only by phantom fusions. The optimum is not a plateau: LTU's sub-baseline
cells sit on the grid edge (p14) with a monotone §O3 degradation behind them, i.e. a fitted spike
of exactly the kind §4 refuses. No third constant, no per-building value, no area threshold — per
the §7 generality rule those are not on the table, and the honest finding stands as §21.43b
predicted it might: **the transposed carve's 18.4%/49.3% numbers are partly bought by wall the
carve should not remove, and the corrected substrate cannot buy them back with W and pierce alone.**

**State of the tree (nothing ships, per §4/§5):** `viewer/lib/room_walker.js` reverted to
byte-baseline (`git diff` empty); the applied-and-measured combination is preserved as
`roompath_diagnostics/patch_21_44_transpose_plus_pierce_knob.diff` (50 lines, `git apply --check`
clean against baseline) alongside the original `patch_21_43_transpose.diff`. Committed: the runner,
the combined diff, the TSV matrix. Logs regenerable (`*.log` gitignored, deterministic).
`common/room_graph.js` + `viewer/navigate_find.js` byte-unchanged, nothing deployed.

# DONE 2026-08-02 — sweep complete, stop condition recorded

| Claim | Proof |
|---|---|
| Knob neutral when unset; patch reproduces §21.43b | `w_overlink_knob_identity.log` §O2/§O3 lines == §21.43b table (§6.2) |
| 72/72 cells measured, matrix complete | `w_sweep_p{4..14}.log` `§SW`/`§SW_O3`/`§SW_DONE` lines; `w_sweep_matrix_2026-08-02.tsv` 72 rows (§6.3) |
| p10 column re-anchors to §21.43b | `w_sweep_p10.log` `§SW` lines == §6.2 anchors |
| §O3 PASS in 0/72 cells | `§SW_O3` VERDICT lines, all six pierce rows both fixtures (§6.3) |
| §T5 ≥90% in 72/72 cells | `§SW ... §T5retention=100.0% PASS` in every cell (§6.3) |
| No cell ≤ baseline on both fixtures | §6.3 matrices vs 49.3%/18.4% (§6.4) |
| Engine byte-unchanged at close | `git status` clean on `viewer/`, `git apply --check` of combined diff passes (§6.4) |

---

### 2026-08-02 §7 POST-DONE FLEET SNAPSHOT (measurement only, user-requested; engine untouched)

First fleet-wide run of the §O2 pair-connectivity metric (identical formula + engine as
`witness_room_path_overlink.js`; runner: scratchpad `fleet_room_path_stats.js`, log
`fleet_room_path.log`). Anchors verified against §21.43b before trusting the rest: Clinic 49.3%
50/186 ✓, LTU W:3.0 18.4% 18/277 ✓, LTU cur 16.4% 15/263 ✓. Live default W:3.0 shown; `cur`
differs ONLY on LTU (every other DB has no unhosted-void geometry the mode gates — same reason the
Clinic sweep collapsed to one row in §6.3).

| building | storeys | rooms | stranded | unroutable (pair) | fusions |
|---|---|---|---|---|---|
| LTU_AHouse | 4 | 277 | 18 | **18.4%** | 314 |
| Terminal / TermRooms | 6 | 74 | 11 | **19.2%** | 20 |
| Clinic | 2 | 186 | 50 | **49.3%** | 52 |
| Duplex | 4 | 7 | 3 | 69.2% | 0 |
| JKR | 5 | 36 | 17 | 92.7% | 12 |
| HHS_Office_Federated | 3 | 37 | 14 | 94.8% | 4 |
| Hospital_3 | 5 | 175 | 88 | 96.1% | 42 |
| Hospital | 7 | 282 | 163 | 96.9% | 56 |

Reading: the two tuned fixtures (LTU, Terminal) are the only healthy ones. The pair metric is
quadratic in fragmentation, so the hospitals' ~50–58% stranded-room share compounds to ~96–97%
of room-pairs unroutable. Duplex is 3/7 rooms stranded on a tiny denominator. No conclusions
drawn beyond the numbers — no fixes attempted, per this file's stop condition and DONE state.

### 2026-08-02 §8 FLEET UNROUTABLE ATTRIBUTION — it is an EXTRACTION gap, not the engine, not a class dictionary

User hypothesis: "a dictionary set of meta-data mapping." Probed at three layers (scratchpad
`fleet_door_probe.js` / `fleet_void_probe.js`, logs read):

1. **ifc_class/discipline dictionary: CLEAN, refuted as the cause.** In all 9 DBs,
   `doorsAll == doorsWalkerSees` (walker's exact WHERE: `ifc_class LIKE 'IfcDoor%' AND
   discipline='ARC' AND center_x NOT NULL`) — Clinic 254/254, Hospital 440/440, JKR 65/65,
   LTU 606/606, Terminal 135/135; zero doors lack transforms; all doors are ARC. §DPROBE lines.
2. **Aperture provenance: THE split.** `IfcOpeningElement` rows: **LTU 3,368 — every other DB 0**
   (§VPROBE). This is why `voidMode`/`pierce` are inert outside LTU (§7: cur==W:3.0 on 8/9
   buildings; §6.3: Clinic sweep collapsed to one row) and why the carve machinery §21.31→§21.43
   tuned on LTU cannot transfer.
3. **Source vs extractor: the openings EXIST in source.** `IFC/Duplex_ARC.ifc` contains **50
   IFCOPENINGELEMENT** entities; `Duplex_extracted.db` has 0. The extraction pipeline used for
   these 8 DBs drops IfcOpeningElement; whatever pipeline produced LTU_AHouse kept them.

**Consequence for the §6.4 stop-condition finding:** unchanged — no constant fixes this. The
fleet's unroutable% is dominated by missing aperture rows upstream of the walker. Next lane (a
DATA job, no engine change): re-extract the fleet with the openings-preserving path (diff the LTU
extraction path vs the others' to find where IfcOpeningElement is dropped), redistribute
`*_extracted.db` via OCI per policy (never git), then re-run the §FLEET witness — the delta per
building is the measure of how much was data vs how much remains sealed-suite scope limit (§21.38).
