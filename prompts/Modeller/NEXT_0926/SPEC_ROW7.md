<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE
SCOPE: MODELLER_MASTER row 7 — the emergent-grid residual (the "drag and the building follows" handle).
Decision already made by red1: chase 0.1039 m (true mesh centres). Read the log after every run; exit code
is not evidence. Scratch spec — folded into MODELLER_MASTER by the watcher, never committed here.

# SPEC_ROW7 — grid residual on TRUE centres (Step A) + measured cause breakdown (Step B)

Branch `fix/row7-grid-true-centre` off origin/main `1069c70c`, worktree `/tmp/wt-row7-grid`.
Fixture `modeller/Terminal_arcstr_proof.db` (gitignored, copied from the main checkout; 158 IfcColumn,
158/158 blobs resolve, rotation_x/y/z = 0 on every column, 432 IfcBeam, 333 IfcWall).

## Measured baseline (unmodified origin/main, W-ROW7-GRID-BASELINE 5/5, scratchpad/base_row7.log)
| substrate | colRMS | grid |
|---|---|---|
| anchor centres (`element_transforms.center_x/y`, what ships) | **0.0939 m** | 18×10 |
| true mesh centres (blob AABB centre + anchor) | **0.1039 m** | 18×10 |
Anchor→true offset in plan per column: p50 19.7 mm, p90 148.1 mm, max 225.6 mm.
Also measured (probe_z.log): the column **z** anchor is not the centre for 63/158 columns (max 3.944 m).

## Step A — the bridge reads TRUE centres (read, never re-derive)
### What changes
1. `modeller/cross_edges.js` — export `readBoxes(db, geoDb)` = the existing `_readBoxes` (§REAL-AABB path
   that #1744 wired: real blob → `_realAabb`/`place()`; coarse anchor box only as fallback). Each box gains an
   additive `real: true|false` flag so a consumer can tell a real box from the fallback. No existing consumer
   reads that field; `deriveAdjacency/deriveDatumsAnchored/deriveSpans` are untouched.
2. `modeller/str_walker_bridge.js`
   - `_readColumns(db, opts)` — centre x/y/z from `CrossEdges.readBoxes(db, opts.geoDb)` when `real`; the
     anchor otherwise (today's behaviour, not silent: counted). bbox stays `bbox_x/y/z` (extents; safe).
   - `_readArcWalls(db, opts)` — cx/cy/lx/ly from the same boxes when `real`; anchor otherwise.
   - `_readBeamSection` (line 38) reads EXTENTS only → untouched (same reasoning as compile_rooms' door_dims).
   - `swbInit(db, opts)` takes `opts.geoDb`; `§STRWALK-INIT` logs `centres=true:N anchor:M` so a run where the
     fix did not fire is visible in the log.
3. `modeller/str_walker_outliner.js` — the #1744 precedent. `swbInit` runs at `_openBuffer` BEFORE the
   geometry file is fetched (every resident's meshes live in a separate `*_geo.db`), so without wiring the
   fix would ship and never fire. In `_forkEditable`'s geo continuation, before `_seedArcEditable`: re-open
   `__dwBuf`, replay the two substrate-parity steps (`composeGhostsFromAggregates` + §ANCHOR-BLIND), call
   `swbInit(db, { geoDb })`, then `_replayEdits()` again so recorded STR_WALK_EDIT ops re-fold onto the
   re-inited base. `_seedStrWalk` then renders the true-centre walk. Logged `§STRWALK-GEO`.
   Local single-file `.db` opens resolve on the sync path already (`geoDb` defaults to `db`).
4. Cache-bust: `?v=` bumps for the three scripts in `modeller.html`; `sw.js` CACHE_VERSION bump.

### Done-criterion (Step A) — new witness `modeller/tests/witness_row7_true_centre.js` (W-ROW7-TRUE-CENTRE,
pure node over sql.js + the REAL bridge/cross_edges modules). Each claim names the issue it proves:
- **T0 INSTRUMENT** — `CrossEdges.readBoxes` real box centre == an independent sqlite3+hex blob decode
  (anchor + raw AABB centre) on 158/158, max delta ≤ 1 mm. Fails ⇒ believe nothing below.
- **T1 BRIDGE-FIRES** — `swbInit(db)` on the fixture: centres=true:158 anchor:0, grid 18×10, walked
  colRMS = 0.1039 ± 0.002 (the honest number is now what ships — the anchor 0.0939 is gone from this path).
- **T2 FALLBACK-LOUD** — same db with its geometry table dropped: centres=anchor:158, colRMS 0.0939; the
  fallback is today's behaviour and is COUNTED in the log, never silent.
- **T3 RENDER-Z** — `swbRenderOps()` column boxes are centred on the real mesh z on 158/158 (issue: the
  orange skeleton column was centred on the anchor z, 63 columns off, max 3.944 m).
- **T4 TOPOLOGY-HELD** — 18×10, 108 girders, 0 columns change their (xLine,yLine) membership anchor→true
  (measured in probe_gird); line VALUES shift ≤ 153 mm (that IS the correction).
- Browser (puppeteer, e2e harness): after `_openBuffer(fixture)` + the geo continuation with the fixture's own
  bytes as `geoBuf`, the log carries `§STRWALK-GEO … centres=true:158` and the rendered skeleton's column
  z-centres match T3. Proves the continuation fires in the page, not only in node.

### What could regress (run on base AND fix, same tree)
`witness_row7_grid_baseline` (node) · `witness_str_into_arc` (playwright; its oracle reads anchors — G1
compares production girder count 108 to its own, held by T4) · `witness_e2e_str_rewalk_commit` (puppeteer,
synthetic fixture with NO geometry → exercises the fallback path) · `witness_green_report` (playwright) ·
`witness_e2e_gridmove_real` · `witness_modeller_ux_pill` · `smoke_strwalk_modeller` · `witness_e2e_walk_ifcopen`
· the cross_edges consumers (`witness_xedge_*`, W-SDG-JS-PARITY) because `_readBoxes` gains a field.
Wall-bearing residents: measured on SampleHouse/Duplex_extracted.db — the wall anchor offset is ALONG the
wall (p50 1.8–2.9 m) so the semi-grid (perpendicular coordinate) shifts ≤ 5 mm, topology unchanged.

## Step B — WHY the true residual is 0.1039 m (all measured; probe_row7.log, probe_row7b.log)
Per axis: **RMS dx = 0.0104 m, RMS dy = 0.1034 m** — the residual is a Y story. 16 of 18 X lines and 6 of 10
Y lines have member span ≤ 2 mm (the 8 m cadence Y = −40.157 + 8k is exact: −32.157/−24.157/−16.157/−8.157
with n = 25–29 each). Four Y clusters carry 99 % of the sum of squares:
| cluster | mean | members | what they are |
|---|---|---|---|
| Y0 | −40.050 | 12 @ −40.157 · 4 @ −40.007 · 2 @ −39.932 · 3 @ −39.758 | south facade |
| Y9 | −0.318 | 12 @ −0.157 · 2 @ −0.307 · 1 @ −0.382 · 6 @ −0.633 | north facade |
| Y1 | −37.799 | −38.057 · −37.684 · −37.657 | observatory/roof tower, own layout |
| Y3 | −34.411 | −34.656 · −34.649 · −34.257 · −34.082 | tower + one GF column at x=114.48 |

The structural line is proven by the beams: all 34 south-facade IfcBeam sit at y = −40.157 and all 33 north
at −0.157 (10 mm bins, none elsewhere); the 20 south facade walls have their outer face at −40.157 and the
16 north ones at −0.157. So the cluster MEAN (−40.050 / −0.318) is **107 mm / 161 mm off the real structural
line**, and the 24 columns that sit exactly on that line are charged a residual they do not have.
Every off-cadence facade column has a FACE on the line or on the facade wall's inner face (line ± 0.150):
0.6×0.3 at −40.007 / −0.307 (outer face ON the line), 0.6×0.15 at −39.932 / −0.382 and 0.45×0.65 at −0.633
(face on the wall's inner face), 0.45×0.8 at −39.758 (face ON the line, 1 mm). These are eccentric BY DESIGN
(the "Aras" STR model's rectangular columns hug the facade), not scatter.

Sum-of-squares split on the shipped mean estimator (SS = 1.706 m², RMS 0.1039):
- 26 % — the 24 on-line facade columns measured against a polluted mean (estimator artefact);
- 52 % — 18 face-flush facade columns (design eccentricity 150–475 mm from the line);
- 20 % — 7 tower columns + 1 lone GF column (own local layout, not on the 8 m cadence);
- 1 % — X.

**The mean is the least-squares optimum for a fixed membership, so NO line estimator lowers 0.1039 at
18×10.** Finer gapTol lowers the number only by minting the eccentric positions as extra gridlines
(0.25 → 18×12 / 0.0932; 0.1 → 18×17 / 0.0135) — fake lines with n = 1–3, rejected.
A robust line value (median: zero new constants, the line IS a real column coordinate) puts Y0/Y9 exactly on
the beam line (−40.157 / −0.157, 0 mm), makes 131/158 columns exact (< 5 mm) instead of 92/158, and the
residual then measures ONLY design eccentricity — but the headline RMS RISES to 0.1323. That is a handle
decision for red1, not a metric to chase: implemented as opt-in `opts.lineFit: 'median'` in `str_walker.js`
(default `'mean'`, shipped behaviour byte-identical), pinned both ways by **T5 LINE-ON-BEAMS** in the witness.

## Out of scope / not touched
`disc_walker.js`, `routewalker.js` (other agents). No push, PR or merge. The recorded 0.104 in row 7 matches
the true 0.1039 to 3 dp — provenance unknown, not claimed.

## RESULTS (2026-09-26, branch fix/row7-grid-true-centre, commits 2eda9def (Step A) · f37c755f (Step B))
| claim | number |
|---|---|
| shipped-path residual before → after | 0.0939 → **0.1039 m** (bridge §STRWALK-INIT `centres=mesh:158 anchor:0 colRMS=0.1039m`) |
| grid topology | 18×10 both, 108 girders both, 0 columns change line membership; line values move ≤ 153 mm |
| rendered skeleton column z | centred on the real mesh 158/158 (was 63 off, max 3.944 m) |
| fires on the real Open path | HospitalGarage resident (140 STR columns, 2.4 MB geo from OCI): Open-time INIT `mesh:0 anchor:140` → `§STRWALK-GEO mesh:140 anchor:0` → render after it (W-E2E-ROW7-GEO-REINIT 6/6) |
| fallback | no geometry table → `mesh:0 anchor:158 colRMS=0.0939m`, counted in the log |
| wall-bearing | semi-grid shift ≤ 5 mm (SampleHouse/Duplex), 34 mm (SampleCastle_ARC_extracted), topology unchanged |
| cost | swbInit 25 → 206 ms on the fixture (readBoxes decodes every blob; the xedge derive already does this ×3 per open) |
| W-ROW7-TRUE-CENTRE | 6/6 (T0 instrument 0.000 mm, T1, T2, T3, T4, T5) |
| green report | GR2 colRMSE line 0.094 → 0.104; GR3 red on base AND fix (0 real MEP in local Terminal_ARC.db, row 6); TE_GREEN_REPORT.md left as committed (its MEP rows regenerate degraded on this substrate — not this change) |

Base vs fix, same tree, identical verdicts: W-ROW7-GRID-BASELINE 5/5 · W-XEDGE-REAL-AABB 13/13 · §GATE-SMOKE 6/6 ·
§STR-INTO-ARC 11/11 · W-E2E-STR-REWALK-COMMIT 9/9 · §GREEN-REPORT-TE 6/1 · W-E2E-GRIDMOVE-REAL 8/8 ·
W-UX-PILL 10/2 (A5 "4 residents" vs 11, A8 rooms=0 — same two on base) · §STRWALK-SMOKE 9/9 · (walk_ifcopen,
stretch_ride: see the final report).

Step B decision for red1 (not taken here): flip `lineFit` to 'median' so the grid handle sits on the beam line
(131/158 exact, facade lines 0 mm from the beams, RMS 0.1323) — or keep 'mean' (RMS 0.1039, facade lines 107/161 mm
off the structure). The remaining residual on either fit is design eccentricity + the tower's own layout, with numbers.
Incidental (recorded, not acted on): HospitalGarage walks to a 15×102 grid with colRMS 1.20 m — its columns are not on
an axis-aligned lattice, so the 1D axis clustering does not describe that building; a separate row.
