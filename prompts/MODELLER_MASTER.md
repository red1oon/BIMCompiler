<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — MODELLER MASTER: the single entry point for "make the Modeller work"

```
SCOPE: the DAGeVu Modeller (bim-ootb `modeller/*`) as a WHOLE — every objective below must be met, not
a subset. This file is the INDEX + CONTRACT; the 15 per-topic files it triages stay authoritative for
their own detail. Read the log after every run (Log Mandate). Read the §PRIME LESSON before any
diagnosis. Created 2026-07-30 at the user's instruction: "triage the modeller prompts/# consolidate
them to some master prompts/# ... so that with that prompt we be launching a dedicated session to
study deeply how to make the Modeller work", and "all the objectives of the Modeller must be met.. as
i have no time to sight, i rely on a good vibe coder to do so."
```

## ▶ §RESUME 2026-09-26b — START HERE (session 2, same day). Then §RESUME 2026-09-26 below, then §STRATEGY 2026-09-24.
## Every number was measured on the combined branch bim-ootb `feat/modeller-next-0926`. Specs: `prompts/Modeller/NEXT_0926/`.

**▶ "resume Modeller session" (red1's trigger phrase) — do exactly this, in order:**
1. Read this block, then the §RESUME 2026-09-26 block and §STRATEGY 2026-09-24 below (method rules + traps).
2. State of the world at the 2026-09-26 reboot: **everything is merged** — bim-ootb main `b0826a5a` (#1769, sw v50),
   BIMCompiler master (#125 + this note). No Modeller work lives in any `/tmp/wt-*` worktree; nothing is unpushed.
3. ⏸ 2026-09-26c: red1 said HOLD on headless runs (Alt+S testing on :8624); still not re-run. First task: run the five witnesses NOT yet re-run on merged main (held so red1's Alt+S on :8624 stayed light) in a
   fresh worktree off origin/main, with `NODE_PATH=~/bim-ootb/tests/node_modules:~/bim-compiler/node_modules` and the
   gitignored `Terminal_arcstr_proof.db` + `Terminal_plates_proof.db` copied from `~/bim-ootb/modeller/`:
   `witness_e2e_walk_all_disciplines.js` · `witness_e2e_walk.js` (5/3 on the pre-#1769 base) · `witness_e2e_save.js` ·
   `witness_route_pattern_bridge.js` (6/4 red since #846 — expected, it is NEXT 1 below) · `witness_e2e_walkall_terminal_scale.js`.
   Compare each red against origin/main `1069c70c` before calling it a regression. **Ask the photoreal session / red1
   before a heavy headless run if red1 is testing Alt+S** (headless Chrome slows the look port).
4. Then work the NEXT list below in order. Data calls: decide them yourself (simplest sourced option, checked against
   the `*_silent.db` references) — red1 wants "simple and workable … visually and generally correct".
5. Merge convention: one combined branch, one PR at session end (bim-ootb auto-merges on green checks); update this block.

**§WITNESS RE-RUN 2026-09-26c (merged main `b0826a5a`, logs in session scratchpad/wit/):** W-E2E-WALK-ALL 13/0 (63 s) ·
W-E2E-WALK 8/0 (9 s) · W-SAVE-COMPLETEIT 11/0 (11 s) · W-TERMINAL-WALKALL-PERF 6/0 (100 s; Walk-ALL 73.6 s, PLB 2,915/2,915 +
FP 623/623 + ACMV 807/807 signed, 1 group each) · W-ROUTE-PATTERN-BRIDGE 6/4 (P3-P6, the known NEXT #1 retarget).
**🔴 NEW FINDING (scope-blind green):** the Modeller's catalog has been EMPTY since #550 (2026-06-27, modeller/ split).
`modeller/bonsai_library.js:34` fetches `modeller/dagevu_catalog.json`; the file stayed at `viewer/dagevu_catalog.json`
(live: modeller URL 404, viewer URL 200 / 274,212 B). Log: `§LIBRARY catalog loaded products=0`. Effect measured on Terminal:
every bend fitting fails to fold — 726× `GEOM_INSERT unknown component FITTING_ELBOW_GENERIC` + 468× `…TEE_GENERIC`
(= 2 × the 597 in `§BEND disc=PLB joints=597`). So §PRODUCTIVITY's "597 fittings" are signed rows that never render, and
W-TERMINAL-WALKALL-PERF T6 NO-ERROR does not see it. Any catalog insert (picker, assemblies) is likewise unresolvable.
**→ FIXED, bim-ootb PR #1770 (`fix/modeller-catalog-path` @ 22c123fa, auto-merge on; spec SPEC_CATALOG_PATH.md):** catalog +
geometries fetched from `../viewer/`; sw v51; a 2nd latent bug it exposed — `_dwUpgradeFitMeshes`'s scrubTo wiped the dwRoot tube
layer (Duplex tubes 33 → 0) — now redraws like every other re-fold. New T7 FOLD-CLEAN: base 1,194 unknown / 0 products → 0 / 837.
9-witness sweep base = fix (only T7 moved); Duplex fittings real mesh 3/3 (was 0/3). Cost: W-WALK-GESTURE 7 → 47 s, W-MEP-REROUTE 16 → 46 s.

**NEXT #1-#5 DONE; #6 handed over.** One combined bim-ootb branch (row 7 + #2/#3 + #4 + #5).
| item | result (base → fix) | spec |
|---|---|---|
| Row 7 grid | red1 picked **0.1039 (true centres)**, then **"on the beams"** (median line fit). The bridge reads true mesh centres via `CrossEdges.readBoxes` (#1744's reader, not re-derived) and re-inits after the geo fetch (§STRWALK-GEO — without it the fix never fires on split residents). Terminal: facade gridlines on the beam lines (0 mm, were 107/161 mm off), 131/158 columns exact (was 92), grid 18×10 and membership unchanged, skeleton column z fixed (63 off, max 3.944 m). Headline RMS 0.0939 → **0.1323**: it now measures only by-design facade eccentricity; **no estimator lowers it without minting fake lines** (measured). Wall-bearing semi-grid unchanged (mean). | SPEC_ROW7.md |
| #2 re-route signed | 1 m Duplex move: 0 new signed rows → keep 16 / new 5 / retire 6, bend fittings re-derived (3 kept / 2 new / 2 retired); one Ctrl+Z / Ctrl+Y, no new rows. `bonsai_oplog.undo/redo` skip rows a re-route owns (`_treeOwned`). W-MEP-REROUTE 5/3 → 9/0 | SPEC_MEP_SIGN.md |
| #3 sign all | `DW_CHAIN_COMMIT_CAP` 60 → Infinity. The old "1.6-2 s per sweep" was the per-sweep-commit era. Terminal PLB 60 → 2,915 signed, walk 16.5 → 24.0 s. **Hospital 60 → 19,331, PLB walk 69.6 → 123.2 s, +19k solids — kept (every step signed), red1 may re-cap big buildings.** | SPEC_MEP_SIGN.md |
| #4 ACMV/ELEC/FP | `_RW_PATTERN_DISC` covers all four; 10 sourced rows added to `mep_rw.db` ad_mep_pattern (FP_TERMINAL_01 ×4, ACMV_TERMINAL_01 ×3 from SJTII_Terminal; ELEC_DUPLEX_01 ×3 from Ifc2x3_Duplex); products FP_Drop_Pipe 21.3 mm · Terminal_Rect_Duct_150x150 · Duplex_EMT_Conduit_29. Combined: Terminal runs signed **4,345/4,345** (PLB 2,915 + FP + ACMV). Engine-measured zeros kept as EXPECTED 0 gates (SampleCastle FP/ACMV, ELEC on Duplex/Terminal). | SPEC_MEP_ROUTE_DISC.md |
| #5 NNCHAIN | N4/N6 retargeted to the routePattern bridge's identity (rule/kinds/product/path) and id-targeted setUndone. 6/2 → 8/0. Test-only. | SPEC_NNCHAIN.md |
| #6 viewer routewalker | **Handed over to the Viewer lane, not taken**: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites that §RW-RUNBOX (L2) fixed in `modeller/routewalker.js`. | — |

**§PRODUCTIVITY now (one Walk ALL Services, combined branch):** Duplex 221 generated (185 fixtures + 33 runs signed + 3 fittings) / 29 flagged · SampleCastle 525 / 9 · Terminal 9,284 (4,342 + 4,345 signed + 597) / 60.

**Combined-branch witnesses:** W-ROW7-TRUE-CENTRE 6/0 · W-ROW7-GRID-BASELINE 5/0 (pinned to the mean fit it recorded) · W-E2E-ROW7-GEO-REINIT 6/0 · W-MEP-REROUTE 9/0 · W-WALK-GESTURE 4/0 · W-ROUTER-NNCHAIN 8/0 · W-MEP-OPENPATH 33/0 (M5-M7 per discipline, M8 all-signed). STR/grid: STR-REWALK-COMMIT 9/0 · GRIDMOVE-REAL 8/0 · STR-INTO-ARC 11/0 · STRWALK-SMOKE 9/0 (row 7 branch).

**DATA CALLS — DECIDED (red1 2026-09-26: "keep things simple and workable and not worry about the finer points as long
bigger issues are resolved ie visually and generally correct. The silent DBs are references u can work with").** All five
stay at the shipped default: FP starts at the seed door (as CW) · ACMV one product 150×150 (the mode in Terminal 53/420 AND in
the Hospital_silent reference, 437 of 4,816 IfcDuctSegment) · ACMV mains + drops, no plant step · ELEC mains only · Hospital
signs every run. Rule going forward: take the simplest sourced option, check it against the `*_silent.db` references
(Hospital_silent, HHS_Office_Federated_silent), ask red1 only when something is visibly or generally wrong.

**NEXT, ranked:** 1. ✅ DONE 2026-09-26c — bim-ootb PR #1771 (test-only): W-ROUTE-PATTERN-BRIDGE 6/4 → 10/0 ×2 (engine seam now uses the production `{schedule:true, geoDb}` opts; P6 = coverage honesty on unmapped STR; waits for the ARC seed). Found on the way → **FIXED, PR #1779 (§WALK-AFTER-SEED)**: the Walk row is usable 4.4 s (Duplex) / 24.0 s (Terminal) before the ARC seed commits; a Walk in that window signed its rows before the seed's and lost its layer. Walks now await `window.__arcSeedReady`; W-WALK-AFTER-SEED base 1/3 → 4/0; W-E2E-WALK's early op-log read fixed (8/0 ×2) · 2. ✖ RETIRED 2026-09-26c (red1: the Java backend is deprecated — OOTB is a JS PWA with no Java; memory java-bridge SUPERSEDED 2026-08-06). The 10 rows live in bim-ootb `modeller/mep_rw.db`, which is the source of truth; nothing to carry into `IFCtoERP.java` · 3. HospitalGarage grid (140 columns off-lattice: 15×102, colRMS 1.20 m — the 1D axis clustering doesn't describe it; its own row) — ✅ DONE 2026-09-26c (Fable agent) — bim-ootb PR #1774: ONE lattice rotated −2.000° (= the IfcSite placement, 0 IfcGrid in the IFC); `swDetectRotation` (all-pairs mod-90 mode + support gate) → 15×103 / 1.193 m / 6 exact → **17×29 / 0.0607 m / 132 of 140 exact**; Terminal unchanged; Hospital refused by the support gate (wings at −5°/+10°). Open: the authoring grid still drags world-axis lines (fine at 2°; a rotated authoring grid is its own row). Spec SPEC_ROW7_HGARAGE.md · 4. ✅ DONE 2026-09-26c — bim-ootb PR #1772: a plain Ctrl+Y resurrected the lowest-id undone row (an undone walk's row, or a deleted row) instead of the edit. Rows a history node leaves undone now sit in `oplog._treeUndone`, skipped by redo(). W-UNDO-RESURRECT base 3/2 → 5/0; 7-witness sweep base = fix (spec SPEC_UNDO_RESURRECT.md) · 5. then the older rows from §RESUME 2026-09-26. **Row 9 ✅ 2026-09-26c — bim-ootb PR #1773:** edit-time ORANGE toast gets an Accept
button → one signed gesture (Save's own heal ops, shared `_healOps`), one hop, re-checked; W-ORANGE-ACCEPT base 1/1 → 5/0, Save/gate
witnesses base = fix. Accept follows Save's heal rule (moves the UNMOVED partner) — in the witness it moved a wall 0.5 m and raised 2
new RED, reported not applied; red1 may want the heal to move the pulled element instead (not changed). **Stale witness found:**
W-SAVE-BLOCKED-HEAL-INDUCED 0/2 on main — its fixture needs "unrelated" neighbours, none exist since §XEDGE-3AXIS (every Duplex element
has edges) → **fixed PR #1778** (fixture found by simulating the real gate; 7/0). **Row 22:** part 1 ✅ PR #1775 (RED toast → one-click Revert = one Ctrl+Z, only while the edit is still latest; W-RED-REVERT base 1/1 → 4/0) ·
part 3 ✅ PR #1776 (§GATE-SCALE: the gate's `seen` map threw RangeError past ~300 moved on Terminal; spatial grid → identical results,
100 moved 3,119 → 10 ms, 1,000 moved 40 ms; W-GATE-SCALE base 4/1 → 5/0) · part 2 ⛔ BLOCKED: *which gazetted UBBL clause + value for corridor width and door swing?* UBBL_RULES_GATE.md §1b verified only By-Laws 39/42; its corridor/stair/dead-end figures have conflicting sources and no door-swing clause is cited — building a named check on them would invent the number. **Row 11 ✅ PR #1777** (§COLOR-PARITY: the element's authored `material_rgba`
r,g,b, the Viewer's rule; palette only for NULL — W-COLOR-PARITY base 3/1 (all 196 Duplex + 1,077 HHS on the palette) → 4/0, fallback
leg INCONCLUSIVE: no NULL rgba in either). Stale/red witnesses seen, not touched: W-E2E-CUT C6 (pixel, red on main). **Row 8** — Fable agent measured it; parent review changed the outcome (spec SPEC_ROW8_ROOF_PERELEMENT.md §REVIEW). Today's roof walk is a
BULK FILL (Terminal 10,584 of 33,324 plates at the flat band-mid z, RMS 2.627 m) and FABRICATES arrays elsewhere (Clinic 331 on glazing,
Hospital 47,526). But Terminal's 33,324 real plates are `discipline='ARC'` — the seed already puts them on screen, so a "per-element walk"
would only re-place them (RMS 0 by identity, 33k duplicate rows). Fix: a tessellating row (fill ≥ 0.5, derived) measures the array and
reports `§ROOF-PATTERN-PRESENT … nothing to generate` (0 placed) or REFUSES — never the fill. W-ROW8-ROOF-PATTERN (node) base 1/6/1 →
7/0. Branch feat/row8-roof-perelement (/tmp/wt-row8-roof), committed locally, NOT pushed — its browser regression runs wait on the GPU
(paused 2026-09-26 for the photoreal lane's Alt+S runs). Also **W-E2E-CUT C6 → PR #1780** (it compared pixels after a re-select click
that hit another element; now the cut element's own mesh fingerprint: changed by the cut, restored exactly by the undo). **Rows 13/25** stay deferred by design (§OPEN LIST).
**Row 14 ⛔ BLOCKED — re-sourced 2026-09-26c, the row's premise is wrong.** Measured over `viewer/dagevu_catalog.json` × `dagevu_geometries.json`
(794 products with a real mesh; `§ROW14-CATALOG`): 201 mesh extents == declared w/d/h (Z-up) · 52 same numbers, axes permuted · 14
placeholder dims (d=h=1) · 527 no match. The permuted ones are mostly the METADATA's order, not the mesh (SLAB_SH_SIMPLE whd 0.165/13.97/5.77,
mesh 13.97×5.77×0.17 Z-up — correct slab); Dining_Chair h=0.45 but its mesh is 1.227 m tall and ROLE__CHAIR_A (same mesh) says h=1.227.
So "bake an axis permutation into the vertices, witness tallest-axis==h" would bake BAD METADATA into good meshes. The measured fix is the
other way: for mesh-bearing products take w/d/h FROM the mesh extents (non-invent; changes LOD-200 proxy box sizes). The catalog files are the
Viewer's (`viewer/`), so it is cross-lane. *Question for red1: OK to derive the shared catalog's w/d/h from the real mesh extents (Modeller +
Viewer proxy sizes change), instead of the row's vertex bake?*

**NEW TRAPS:**
- **sql.js: two `new SQL.Database(sameBuffer)` share storage** — a DROP on one showed in the other (measured). Always pass a fresh `new Uint8Array(fs.readFileSync(...))` per db in node witnesses.
- **Signing everything makes walks commit later.** W-WALK-GESTURE went 1/3 once under load, snapshotting before the walk's history node existed. Wait on `__dwRowsByDisc[disc].walk` + `ModellerHistory.pending()`, not `__dwWalks`.
- **A Terminal-scale commit blocks the page > 180 s** — puppeteer `protocolTimeout` 900 s in W-MEP-OPENPATH, or a finished walk reads as walked=false.

## ▶ §RESUME 2026-09-26 — (superseded as entry point by 2026-09-26b above). Then read §STRATEGY 2026-09-24 (the thesis + lanes) and §RESUME 2026-09-21
## (method rules + traps). Written at session close; every number was measured on merged main.

**WHERE IT STANDS.** The generate-then-edit loop runs end to end on the real Open path. A bare ARC building → "Walk ALL
Services" places fixtures, routes plumbing, and SIGNS it at measured Duplex pipe sizes. One Ctrl+Z undoes the whole walk.
Moving a fixture re-routes its pipes. Merged + live: bim-ootb **#1762** (§STRATEGY L0-L7 + §XEDGE-3AXIS) and **#1768**
(§GATE-STOREY-FLOOR + §PRODUCTIVITY + cut-layers witness aim); BIMCompiler **#121 #122 #123**; docs site deployed.

**MEASURED §PRODUCTIVITY** (one Walk ALL Services, generated / flagged for review): Duplex 206/29 · SampleCastle 514/9 ·
Hospital 39,979/22 · Terminal 7,854/60 · HHS/Clinic/HospitalGarage/SampleHouse 0 flagged. This proves "little left to fix",
NOT "X times faster" (there is no hand-modelling baseline).

**CLOSED THIS STRETCH (don't re-open):** next-list #1 residual 11 (the rx/ry guard, 11 → 0) · #4 datums 802→657→643 =
CORRECTIONS (138 → 0 not-real planes on the live render) · row 6 re-framed + routed · L6 PLB stays unattached (red1) ·
Cut on a layered wall PROVEN (W-E2E-CUT-LAYERS 10/0; the old L3 red was the witness's aim, not the pick).

**NEXT, ranked (my recommendation; red1 had not picked one at close):**
1. **Row 7 — grid residual** (the "drag and the building follows" handle). ⚠ DECISION OUTSTANDING: chase **0.1039 m**
   (true mesh centres, the honest number) or 0.0939 m (what ships, flattered by the anchor defect in
   `str_walker_bridge.js:22/38/50`). Recommended: 0.1039. Confirm with red1, then run it as ONE Fable session (tough).
2. Re-routed runs are unsigned and bend fittings are not re-derived after a move (§MEP-REROUTE scope note).
3. Terminal signs 60 of 2,915 runs (DW_CHAIN_COMMIT_CAP, occt-bounded).
4. Route ACMV / ELEC / FP. They are placed but not routed; the pattern bridge covers CW/SP only.
5. Retarget W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs).
6. `viewer/routewalker.js`: same vertical-post clash box at 3 sites. VIEWER scope, not the Modeller's; hand it over, don't take it.
Then the older rows: 9 (apply ORANGE suggestions) · 22 (one-click revert, UBBL checks, rtree at scale) · 11 (real colours) ·
8 (roof per-element) · 13/25 (SSAO/outline, PBR, BCF import) · 14 (re-source its example first).
Blocked on red1: 15 (220 MB component_library.db: GH or OCI?) · 27 · 29 · 21/26/31 (never requested).

**DISPATCH (red1):** Opus by default; Fable agents for genuinely tough items (red1, 2026-09-25). A Fable agent WILL hit the
usage limit mid-run: resume it with its own context after the reset, never restart it.

**NEW TRAPS / METHOD (each cost a wrong answer first):**
- **An all-zero count is a claim, not a result.** "0 flagged" on 8 residents was the gate sinking fixtures underground.
  Cross-check any all-green number against the app's own per-step log before reporting it.
- **A same-line `// comment` can swallow object keys.** A scripted edit silently dropped 4 DiscWalker API exports and
  `node --check` passed. After any scripted edit to an object literal, grep the diff for mid-line `//` and check exports with
  `node -e "require(...)"`.
- **Snapshot after the ASYNC re-fold, not at the row flip.** With signed GEOM_SWEEP rows, undo/redo finish later. Wait on
  `ModellerHistory.pending()` + two macrotasks (W-WALK-GESTURE).
- **Witnesses that read the op-log length early race the seed** (read 0) under load. W-E2E-WALK and W-E2E-WALK-IFCOPEN do
  this. A base red with "oplog 0→N" is that race, not a regression.
- **A walk also commits routed-network rows** (sweeps + bend fittings). Any "op-log grew by placed count" assertion must count
  them from the op-log.
- **Do not "improve" routewalker pairing to next-nearest.** Measured: Duplex 18 fixtures → 110 runs, reaching 50 m targets.

## ▶ §STRATEGY 2026-09-24 — read SECOND (after §RESUME 2026-09-26). How the Modeller closes the gap: GENERATE, then EDIT MINIMALLY.
## The §RESUME 2026-09-21 block below is still current for its method rules and traps, so read it second.
## Every number here was measured on bim-ootb origin/main b8f844fb on the REAL user open path.

**THE THESIS (user, 2026-09-24):** *"start with blank ARC and walk route, edit minimally, making this more
productive than normal work."* We do not try to out-draw Revit or ArchiCAD by hand. The user opens an
ARC-only building. The walkers GENERATE the structure and services from measured rules. The user corrects
the result with a few handles (grid, seed, drag), and every step is a signed op. So **an ARC-only
substrate is the INPUT, not a defect.** A gap matters only if it BREAKS THIS LOOP:

```
1 Open ARC → 2 Walk (place) → 3 Route → 4 Sign → 5 Review (gate) → 6 Edit minimally → 7 Re-walk / re-route → 8 Save / Export
```

### Where the loop stands (measured; the evidence is in "§MEP EVIDENCE" below)
| step | state | evidence |
|---|---|---|
| 1 Open | ✅ all 8 residents | Terminal opens in 20.0 s, Hospital 17.8 s, the rest < 3 s; 0 pageerror |
| 2 Walk / place | ✅ works, at scale | Terminal Walk-ALL 66 s → 4,342 MEP fixtures (774 host-bound); Duplex reproduces W-E2E-WALK-ALL exactly (185) |
| 3 Route | 🔴 **BROKEN on 7 of 8** | chainSegs 0 on every resident except SampleCastle (32, and only via a fallback) |
| 4 Sign | 🟧 fixtures yes, networks never | fixtures are signed GEOM_INSERTs, verifyChain true; SampleCastle's 32 runs are refused 32/32 (no real cross-section product, WalkerDoctrine §8) |
| 5 Review | 🟧 partial | the gate runs before commit; no "accept this walk" step (it commits at once, `modeller.html:3805/3807`) |
| 6 Edit minimally | 🟧 | move works and is signed; **undo removes ONE fixture, then the whole generated layer vanishes from the canvas** |
| 7 Re-walk / re-route | 🔴 MEP none | a grid move moves generated fixtures like plain elements; no MEP re-route hook. STR does re-walk (W-E2E-STR-REWALK-COMMIT 9/9) |
| 8 Save / Export | ✅ young | IFC export full-building since #1747; no materials, property sets, storeys or openings yet |

**Read the table as the plan.** Steps 3, 4, 6 and 7 are where "more productive than normal work" is lost
today. Everything else is either working or polish.

### ▶ LANE STATUS 2026-09-24 (executed the same day; bim-ootb branch `feat/mep-loop`, NOT pushed yet, merges at session end)
| lane | state | evidence (baseline → fix, side by side on the same tree) |
|---|---|---|
| L0 | ✅ `2e52451d` | W-MEP-OPENPATH on main: 8/5, M0 control reproduces Walk-ALL 185 |
| L1+L2 | ✅ `30f51c20` | PLB runs on the real walk: Duplex 0 → 18 · Terminal 0 → 2,893 · SampleCastle 32 → 18 (a pairing-order effect; both variants pass the correct box). Run length median 2.2–3 m, max 24.9 m. A "try next-nearest on clash" variant was MEASURED and REJECTED (Duplex 18 fixtures → 110 runs). W-MEP-OPENPATH 8/5 → 10/3 |
| L4 | ✅ `54c7cf5a` | The real Ctrl+Z after a walk used to do NOTHING to the walk (not in the history tree). Now one node "Walk PLB (23)": Ctrl+Z → 0/23 rows, layer off; Ctrl+Y → all back. W-WALK-GESTURE 2/2 → 4/0 |
| L5 | ✅ `b78f2b4c` | a 1 m move of a routed fixture re-routes 22 → 21 runs ending at its new spot; Ctrl+Z routes back (±1 mm). W-MEP-REROUTE 3/2 → 5/0. Re-routed runs unsigned (waits on L3); bend fittings not re-derived (follow-up) |
| L3 | ✅ `2ec5f1b7` (red1: "Use measured Duplex pipes") | CW = Duplex "Pipe Types:Cold Water" 25.4 mm (mains size; ½" branches nearly as common — stated simplification), SP = "Pipe Types:Waste" 48.3 mm (41/43). Runs now SIGN: Duplex 18/18, SampleCastle 18/18, Terminal 60/2,915 (existing commit cap). W-MEP-OPENPATH 13/0 | Needs ONE named CW and ONE SP pipe product. The July audit in `routewalker.js` (RW_REAL_CROSSSECTION comment) found none clean; picking one extracted Duplex pipe as "the" cold-water pipe is a data call |
| L6 | ✅ **CLOSED by red1 2026-09-24: keep PLB unattached.** | PLB → CW+SP shims agree on host (IfcWall, SIDE) but not height (CW 1000, SP 600). No change; bim-compiler W-DWWALK-HOSTBIND W4 (PLB stays unbound) remains the contract. Do not re-open without red1. |
| L7 | ✅ `2ec5f1b7` (red1: "MEP only in Walk ALL") | Walk ALL skips STR/roof (own rows stay), row reads "Walk ALL Services"; Terminal Walk ALL 81 s → 61 s |
Every lane was regression-swept against its own pre-change commit (12–15 witnesses each): no witness moved except the one the lane targets.
Recorded, not fixed: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites (Viewer scope).

### THE LANES — in order. Each one closes one break, and is proven on the real open path, not a fixture.
Rule for every lane: spec first, run the baseline on unmodified main, wait on a condition, prove it FIRES on
merged main (see the 09-21 method rules).

**L0 — Land the instrument (small, do first).** Turn this session's open-path probe into a committed witness,
`W-MEP-OPENPATH`: per resident × discipline, placed / host-bound / chainSegs (and their source) / tubes / signed
GEOM_SWEEP. Instrument control built in: Duplex must reproduce W-E2E-WALK-ALL's 185. Without it, every lane
below is judged by hand. *Done when:* it runs on 8 residents and prints today's table (below) as its baseline.

**L1 — Route on the production path (the #1 break).** `_discWalkOne` always calls `dwWalk(…,{schedule:true})`
(`modeller.html:3769`). The schedule branch and the measured-band branch return early
(`disc_walker.js:~2185/~2195`), calling only `route`+`routeChains`, so the §CAMPAIGN M1 `routePattern` bridge
(`:~2281`) is never reached. Smallest step: give both early returns the same bridge fallback, and log the
empty-but-not-refused case (`§WALK-PATTERN EMPTY` — today it is silent). *Done when:* W-MEP-OPENPATH shows
chainSegs > 0 for PLB on Duplex and Terminal, and W-ROUTE-PATTERN-BRIDGE is re-run.

**L2 — Repair the bridge (decayed 55 → 0 on Duplex, July).** Bisect: #683 = 55 → #684 = 34 → 670bf0f3 (§LIVEWIRE,
07-10) = 1 → #846 = 0. Cause measured: routewalker's OWN clash-skip (`routewalker.js:~539/~687 → _rwClashesWithArc
~820`) drops ~95% of pairs (Duplex 141 with an empty envelope vs 6 with the ARC; SampleCastle 316 vs 32). It is the
mis-oriented clash box that `disc_walker.js:1474-1487` already describes and fixes only in its post-filter.
Smallest step: orient routewalker's clash box along the run axis, the same AABB `_envelopeClash` uses, then
re-measure 141 → N. W-ROUTE-PATTERN-BRIDGE (6/4, red since ≤ #846) is the witness. **L1 without L2 routes almost nothing.**

**L3 — Make a generated network signable.** `RW_REAL_CROSSSECTION` (`routewalker.js:54-60`) holds only
FP_Drop_Pipe, so every CW/SP run is refused and never enters the op-log. `component_library.db` has 3,788 Pipe and
555 Duct rows, but they are all per-instance Terminal dumps, not a reusable product. Smallest step (DATA): register
ONE measured CW and ONE measured SP pipe product, sourced from a real IFC (non-invent; name the source row).
⚠ If no clean source exists, stop and ask red1 which product to use. Do not synthesize one.
*Done when:* a user walk writes ≥ 1 GEOM_SWEEP that verifies.

**L4 — A walk is ONE gesture.** Today `Bonsai.oplog.undo()` pops one fixture ('dwwalk-<disc>-N' gids are not gesture
gids), and `doUndo`/`doRedo` (`modeller.html:3554/3565`) never call `_redrawAllDiscWalks`, so after one Ctrl+Z the
generated layer disappears (SampleCastle tubes 32 → 0, still 0 after redo). The comment at `modeller.html:586-588`
claiming undo/redo re-applies it is STALE. Smallest step: redraw on undo/redo, and treat dwwalk/dwchain/dwfit gids
as one gesture group in `_isGestureGid`. *Done when:* Walk → Ctrl+Z removes the whole walk, Ctrl+Y restores it,
tubes visible both times. (W-E2E-WALK W6 stays green only because it uses scrubTo.)

**L5 — Re-route after an edit (the O15/O16 end-state for services).** Mirror the STR wrapper around
`gridmove.commit` (`str_walker_outliner.js:918-968`): after a grid move or GEOM_MOVE touches `_dw` fids, re-run the
bridge for that discipline from the moved placements, and sign the result. Measured today: `gridmove.commit('gx0',
0.3)` on Duplex moves 18 generated fixtures, `__dwWalks`/`__dwChains` go stale, no re-route. *Done when:* a
gridline drag on Duplex moves a PLB run and its new route is in the op-log. This is also the first piece of O16's
"drag in plan → services re-route". **O15 and O16 are one mechanism; L5 is its MEP leg.**

**L6 — Host-binding holes.** PLB host-binds 0 on all 8 residents: `rule_shim` keys CW/SP, never PLB, in both rules
DBs. Smallest step: resolve PLB → CW/SP shims through the same `_RW_PATTERN_DISC` mapping the bridge uses.
Separately, schedule-path placements record no host guid (`disc_walker.js:553-563`), so Duplex's fixtures cannot be
audited bound-vs-floating. Record it; fix it only if the audit is needed.

**L7 — ⛔ NEEDS red1's OK: what "Walk-ALL" means on big buildings.** On the terminal_rules residents, Walk-ALL
includes `roof` (IfcPlate, n_measured 33,324) and STR. HHS 42,960 plates, Hospital 47,526, so 46k–67k signed rows and
90–160 s walks, mostly not MEP. Taking roof/STR out of the MEP roster CHANGES existing behaviour, so it is red1's
call, not a lane to start alone.

**NEXT after the lanes (2026-09-24):** the productivity number (generated vs edits needed), re-deriving bend fittings on a
re-route, retarget/retire W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs), the Terminal chain commit cap
(60 of 2,915 runs signed), and the Viewer copy of routewalker.js (same clash-box bug, 3 sites).

**Engine-ready but not wired (after L1-L5, not before):** space-scoped walk (pick a room → walk it;
`_discWalkOne` passes only {schedule, geoDb, avoid}, `modeller.html:3769`) and the walker guards (they exist only in
bim-compiler `deploy/dev/walker_guards.js`, 0 hits in bim-ootb's `disc_walker.js`).

### The non-MEP gaps, placed on the same loop
- **Step 6, grid residual (row 7).** Unchanged, still its own heavy session, and it must first pick 0.0939 or 0.1039 (see 09-21).
- **Step 6, what touches what.** The residual 11 is FIXED on branch `fix/xedge-3axis` @ 511c1ca1 (bim-ootb, not
  pushed yet): 11 → 0, it was the rx/ry guard 11 of 11, and the "1,301 no-blob" suspect was a hash-vs-guid unit
  error. It merges at session end. Side effect: datums 657 → 643, which bears on next-list #4 and is not claimed as a correction.
- **Step 6, Cut on a layered wall is NOT proven.** W-E2E-CUT-LAYERS is 4/1 at L3: the click selects nothing
  (fid=null), twice. It could be the witness's aim or a real defect. Measure it before the guide ever claims it works.
- **Step 8, export depth.** IFC carries shapes and classes only. The status line reads `walls=0` for an opened building
  (`modeller.html:~3042`). Small, honest next items; they don't block the loop.
- **2D drawings.** 2D/PDF sheets are a deliberate deferral (§2D-AND-PDF), not a gap. The 2D value is O16's round-trip,
  which is L5 seen in plan.
- **Hand solid-modelling (fillet, push/pull, exact booleans).** Deliberately NOT pursued. It is the "normal work" the
  thesis replaces. The kernel stays `ops → mesh` (FeatureComparison.md).
- **Test net.** CI is never green (09-21 trap). Retarget or retire W-ROUTER-NNCHAIN (3/5): it expects a real nn-network
  from an MEP-bearing Terminal, which is the wrong test for an ARC-only strategy, and W-MEP-ROUTE-RENDER already covers
  that render seam, 12/12.

**§PRODUCTIVITY — measured 2026-09-25 (one "Walk ALL Services", W-MEP-OPENPATH ALL):** generated / flagged for review
(an unresolved clash, ≤1 edit each): SampleHouse 60/0 · Duplex 206/29 (15.7%) · SampleCastle 514/9 (1.8%) · HHS 3,415/0 ·
Clinic 5,140/0 · Hospital 39,979/22 (0.1%) · HospitalGarage 13,965/0 · Terminal 7,854/60 (1.4%). This is "little left to fix", NOT
"X times faster": there is no measured hand-modelling baseline. ⚠ The first run read 0 flagged EVERYWHERE. That was a gate
defect, not a result: the clash gate's global yield floor let FP's foundation-level sprinklers drag it to -1.257 m, and 20 Duplex
fixtures were "resolved" by sinking them ~1 m underground. Fixed as §GATE-STOREY-FLOOR (bim-ootb, W-GATE-STOREY-FLOOR: sunk 30/9/60 → 0).
Lesson: a "zero problems" measurement gets an instrument check against the app's own per-step log before it is believed.

The productivity claim needs its own number (original note below). "More productive than normal work" is so far a thesis, not a
measurement. Once L1-L5 hold, record per resident: fixtures + runs generated vs user edits needed to reach a network
the gate accepts. Until then, do not state it as a result.

**Dispatch (red1, 2026-09-24: "stick to Opus").** Every lane runs in Opus, in order L0 → L1+L2 → L4 → L6 → L5.
L1+L2 go together. L3 is data plus a possible red1 question. L7 is red1.

### §MEP EVIDENCE — the real open path, Walk-ALL (2026-09-24, bim-ootb b8f844fb)
Instrument control first: Duplex reproduced W-E2E-WALK-ALL (ACMV 19 / ELEC 102 / PLB 18 / FP 46 = 185) and W-E2E-WALK
(ELEC 102). bim-compiler W-BORROW-FP 6/6 reproduced SampleCastle's 247 FP. The fleet ELEC counts in
RESUME_DISC_WALKER_ENVELOPE_BOUND.md reproduce to the unit. Rules DBs match WalkerDoctrine §1/§2 on every resident.

| resident (rules) | ACMV | ELEC | PLB | FP | chainSegs | tubes |
|---|---|---|---|---|---|---|
| SampleHouse (duplex) | 4 / 4 bound | 28 / 17 | 11 / 0 | 17 / 16 | 0 (bridge silently empty) | 0 |
| Duplex (duplex, schedule path) | 19 | 102 | 18 | 46 / 29 | 0 (bridge never reached) | 0 |
| SampleCastle (duplex) | 12 / 12 | 270 / 269 | 84 / 0 | 126 / 125 | **32** (routePattern, CW 10 + SP 22), refused 32/32 for signing | 32 |
| HHS (terminal) | 1368 / 196 | 722 / 12 | 426 / 0 | 721 / 118 | 0 | 0 |
| Clinic (terminal) | 938 / 771 | 406 / 140 | 605 / 0 | 751 / 236 | 0 | 0 |
| HospitalGarage (terminal) | 4007 / 0 | 2756 / 49 | 3226 / 0 | 3310 / 143 | 0 | 0 |
| Hospital (terminal) | 5126 / 1510 | 3190 / 192 | 4036 / 0 | 4428 / 662 | 0 | 0 |
| Terminal (terminal) | 1375 / 407 | 896 / 110 | 969 / 0 | 1102 / 257 | 0 | 0 |

(Cells are placed / host-bound. The complex residents also walk STR 264–2,252 and roof 10,584–47,526 — see L7.)
Existing witnesses on origin/main: W-E2E-WALK 8/8 · W-E2E-WALK-ALL 13/13 · W-E2E-STR-REWALK-COMMIT 9/9 ·
W-MODELLER-DISC-WALK 8/8 · W-MEP-ROUTE-RENDER 12/12 · W-DISC-DENSITY 8/8 (needs the gitignored
`Terminal_arcstr_proof.db`; ELEC still 2.11× over, row 23) · W-ROUTE-PATTERN-BRIDGE **6/4** · W-ROUTER-NNCHAIN **3/5**.
The probe scripts were session scratch, not committed. That is why L0 exists.

### Corrections this evidence makes elsewhere (made here; the other files are left as-is, pointed to)
- **Row 6 is re-framed.** It is not "Terminal serves 0 MEP": that 0 is the input. It is now "generated routing is
  unreachable on the production walk path, and no generated network is ever signed" = lanes L1-L3. *Done when:* a real
  user Walk on Terminal AND Duplex renders ≥ 1 routed PLB run that is also in the signed op-log.
- **09-21 trap "playwright is NOT installed" is WRONG.** It is at `~/bim-ootb/tests/node_modules/playwright` (1.59.1).
  Witnesses with a bare `require('playwright')` need `NODE_PATH=~/bim-ootb/tests/node_modules`.
- **`prompts/Modeller/DISC_Walker/` (26 files) is now harvested.** Stale claims found: RESUME_MODELLER_WALK_SUBSTRATE
  "Duplex 0→55, chainSegs unchanged after M2" (bisect: 55→34→0); RESUME_MEP_SAMPLECASTLE "SC 2372 ARC envelopes baked in
  mep_rw.db" (it has 0; the 2,372 come from the building db); RESUME_TERMINAL_RULE_MINING's "124 rows / 47 avoidance"
  (now 37 / 10) and its Terminal-rules-on-houses model (contradicted by WalkerDoctrine, and the doctrine wins);
  SPEC_MESH_FIT_GRAFT / SPEC_SEAM_HEALING code lives only on unmerged feature branches.

## ▶ §RESUME 2026-09-21 — read THIRD (after §RESUME 2026-09-26 and §STRATEGY 2026-09-24 above). Supersedes the 2026-09-15 block below, which is kept for its
## history but is NO LONGER the entry point. Written at session close; every number below was measured.

**WHAT THIS SESSION DID.** The 2026-09-15 block ordered a re-verify sweep of the 34-row §OPEN LIST. That
sweep ran, and then four of the rows it surfaced were actually fixed. Merged: bim-ootb **#1738 #1744
#1747 #1749 #1750 #1753**; bim-compiler **#105-#118**.

| row | was | now |
|---|---|---|
| 36 | IFC export emitted an **empty file** for every resident (592 bytes, 0 products) | ✅ #1747 — Duplex 196→196, SampleCastle 3,225→3,225, round-tripped through re-import |
| 12 | `rel_fills_host` on 3 of 8 residents → **#1706's anchor/ride engine inert on 5** | ✅ #1749/#1750 — 943 new rideable edges; ride now works on **7 of 8** |
| 35 | the LIVE guide contradicted shipped behaviour for a week | ✅ site consolidated onto master (#106) + published; verified live |
| 28 | "293 tilted elements render with IDENTITY" | ✅ does NOT reproduce — 230 genuinely rotated, **0 dropped** (#1738) |
| 24 | `smoke_arc_only.js` silently ran 1 of 2 buildings | ✅ root cause `e2e_harness.js:349` `process.exit()` (#1738) |
| 19 · 23 · 32 | verified-open | ✅ closed / re-pointed — see §SWEEP |
| 7 | "0.104 m residual, needs a heavy session" | **re-measured** (#1753) — baseline not stale, the shipped path under-reports it. See the row. |

**THE ONE PATTERN WORTH INHERITING: `element_transforms.center_xyz` is the IFC placement ANCHOR, not the
volumetric centre.** Any consumer treating `[center ± bbox/2]` as a world box is displaced — measured
median 78 mm, up to 425 mm. **Three consumers found:**
1. `cross_edges.js` — **FIXED** (#1744). 843 of 9,817 abuts edges were wrong; now 11.
2. `str_walker_bridge.js:22/38/50` — row 7's grid. Re-measured, **not** fixed (see row 7).
3. `scripts/compile_rooms.py` — Viewer room injection. **Recorded, unmeasured.** Its exposure is NOT
   uniform: `door_dims` reads extents only and is safe (934/934 correct); the position readers are not.
   `SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. **Measure before touching.**

**WHAT TO CHASE NEXT, ranked.** Detail in §SWEEP FOLLOW-THROUGH and the rows themselves.
1. ✅ **DONE 2026-09-24 on branch `fix/xedge-3axis` (§STRATEGY, non-MEP gaps): the rx/ry guard, 11 of 11.** **The residual 11** (#1744's honest RED). Two suspects, never measured apart: `_readBoxes`' `rx/ry`
   guard — whose stated premise is the same false claim corrected in #1738, so it fires on real data and
   the 3-axis path it distrusts is now itself witnessed, making it probably liftable — and the 1,301 of
   3,225 elements with no resolvable blob. **Measure which, before changing either.**
2. **Row 7's heavy session** — now has what it lacked: it must decide WHETHER it chases 0.0939 m (what
   ships) or 0.1039 m (the honest number). Starting without that decision is how it stalls again.
3. **Row 6** — Terminal serves 0 MEP on the real open path.
4. ✅ **CLOSED 2026-09-25 — CORRECTIONS, 0 box-caused artifacts** (802 → 657 → 643). Method: independent
   re-derivation of the datum definition (cross_edges.js deriveDatumsAnchored: ≥3 faces within 50 mm, greedy window),
   instrument-checked (reproduces 802/657/643 exactly from the shipped boxes; live mesh boxes == current boxes within
   1.2 µm on 3,225/3,225), then each datum tested on the LIVE render (≥3 supports within 50 mm of its plane):
   OLD 802 → **138 not real**; #1744's 657 → 5 not real (all its tilted-guard boxes); current **643 → 0 not real**, 2 unclear
   (held only by aggregate ghost rows, no mesh), 3 real alignments not emitted because the greedy window cuts them (a
   property of the definition, identical in the Python oracle — a spec note for red1, not a defect). #1744 also lost 6
   real planes and made 1 spurious one through the rx/ry guard; #1762 restored/removed all 7. 76 count changes are
   re-clusterings (plane kept, merged with a neighbour ≤ 97 mm). Row 7 stays un-linked. Evidence: session scratch
   probe_datums.js + analyze_run2-4.log (two runs, identical). The original line read: Datums 802 → 657 (SampleCastle, from #1744). Still unverified as a *correction* rather than a new
   artifact. ⚠ It does NOT bear on row 7 — I claimed it did and that is retracted (#118).
5. Rows 8 · 9 · 11 · 13 · 14 · 22 · 25. **Row 14's cited example does not reproduce** — re-source it or
   its witness is green on arrival.
6. Blocked on the user, nothing built: 15 · 21 · 26 · 27 · 29 · 31.

**METHOD RULES THIS SESSION PAID FOR. Each one cost a wrong answer first.**
- **Diff against a BASELINE before claiming — or clearing — a regression.** Running 11 witnesses on the
  fix AND on unmodified `origin/main`, side by side, is what caught `witness_e2e_save` breaking (green →
  3/2) *and* proved four other failures were pre-existing. Without the baseline both conclusions were
  unavailable.
- **Never re-derive a transform you can read.** `cross_edges.js` re-implemented "world = centre + R·vert"
  and called it "the same final numbers, fewer steps". It was wrong for 798 of 934 elements. #1747's IFC
  export instead reads the renderer's own baked world vertices, so parity is structural.
- **Wait on a CONDITION, not a duration.** My own witness lied twice: a fixed sleep, then "name matches
  and the bridge stopped changing" — which the PREVIOUS building's untouched bridge satisfies, because
  `__dwName` flips at open START while `__arcFidByGuid` is rebuilt later. Null the globals, wait for
  repopulation (#1750). **Any witness opening more than one resident needs this.**
- **The instrument check comes FIRST, and it is not a formality.** Two probes measured the wrong quantity
  and looked conclusive: comparing a rendered AABB to `element_transforms.bbox_*` proves nothing, because
  `extractIFCtoDB.py:181` defines those columns AS the world AABB. Both W-ARC-3AXIS and
  W-ROW7-GRID-BASELINE now open with a control that voids the run if the decode is wrong.
- **Prove a fix FIRES on merged main, not that it shipped.** A sibling session had two commits stranded
  by auto-merge in one night. Every fix here was re-run against `origin/main` after merging.
- **Docs publish ONLY via `scripts/safe_gh_deploy.sh`.** CLAUDE.md bans bare `mkdocs gh-deploy`; I
  reached for it twice before reading that, and was blocked both times — correctly. The guard caught a
  real deletion (`glassbowl_data.db`) that I had also found by hand.

**TRAPS — state of the world, so nobody re-discovers these.**
- **CI `system-is-real` has NEVER been green — 198 of its last 200 runs failed, back to 2026-07-05.**
  A red X on a bim-compiler PR is **no signal**; check whether the failure is new before believing it.
  87% of it is unpassable by construction. Fully diagnosed in `LFS_QUOTA_AUDIT.md` (#107).
- ~~**`playwright` is NOT installed**~~ ⚠ WRONG, corrected 2026-09-24: it is at `~/bim-ootb/tests/node_modules` (1.59.1); set `NODE_PATH` for bare requires (§STRATEGY). Original: `witness_str_into_arc`, `witness_green_report`,
  `witness_modeller_xedge_lens`, `witness_arc_editable_smoke`, `sdg_gate/cascade_smoke` crash on
  `Cannot find module 'playwright'`. Pre-existing, unrelated to any change here. `puppeteer` IS available
  (resolved from `~/bim-compiler/node_modules`), which is how every witness here ran headless.
- **Gitignored local fixtures.** `modeller/Terminal_arcstr_proof.db` (.gitignore:49) and
  `docs/glassbowl_data.db` exist on the primary checkout's DISK but not in git, so a fresh `/tmp/wt-*`
  has a 0-byte placeholder. That is why W-ROW7-GRID-BASELINE prints INCONCLUSIVE rather than passing over
  an empty population, and why a docs deploy from a fresh worktree aborts. Not a bug — know it.
  `glassbowl_data.db` now also has a durable OCI copy (`§GLASSBOWL-OCI`).
- **Terminal declares ZERO void/fill relations in its source IFC.** Its ride gap is a SOURCE DATA gap,
  asserted in W-RFH-RESIDENTS F4. **Do not "fix" it by fabricating edges.**

**HYGIENE.** This session created and pruned **21** worktrees; **0** of mine remain. 33 `/tmp/wt-*`
survive from other sessions — not mine to prune, and several hold unpushed work (see the 2026-09-15
block's table). `.claude/worktrees/agent-*` are harness-managed; never remove those by hand.

## ▶ §RESUME 2026-09-15 — ⚠ SUPERSEDED by §RESUME 2026-09-21 above. Kept for its history (the worktree
## table is still the current one); it is NOT the entry point. Written by the session that did NOT touch
## the Modeller, so you inherit facts, not a handover story.

**WHAT THE LAST SESSION DID, AND WHY IT MATTERS TO YOU: nothing in `modeller/`.** It ran the Viewer 4D/5D
lane (`TM_4D5D_VARIANCE_LANE.md` §S7 — the construction window on an element). Merged to bim-ootb `main`:
#1731 #1732 #1733 #1735 #1736 #1737; to bim-compiler `master`: #101 #102. Touched `viewer/*` and
`tests/audit_sw_precache.js` only. **No `modeller/` file was edited, so nothing below is stale because of
it** — but two of its by-products are yours to know:
- `viewer/sw.js` is at **`CACHE_VERSION` v1177**. Bump from there, never from a remembered number.
- `tests/audit_sw_precache.js` was hardened (#1737): it now strips comments before pairing quotes, so an
  apostrophe or a `]` in a `PRECACHE_ASSETS` comment no longer silently drops every later entry. Before
  that fix it reported files unchanged for months as "unlisted" and said nothing about the real cause. If
  you add a modeller asset to a precache list, that gate is trustworthy again.

**VERIFIED NOW, not carried forward from prose (2026-09-15):**
- `modeller/tests/` holds **216 witnesses**. Last `modeller/*` work landed **2026-09-11**: the §DAGEVU
  relationship-edge engine and the cut-move arc (`#171x` series — GEOM_CUT_MOVE, GEOM_CUT_RESIZE, cut
  frame under a 90°-multiple GEOM_ROTATE, §DAGEVU-SLIDE).
- **Nothing is in flight.** Both modeller worktrees (`/tmp/wt-dagevu-engine` `feat/dagevu-slide`,
  `/tmp/wt-dagevu-resume-doc` `docs/resume-dagevu-engine`) are `ahead=0 dirty=0` — fully pushed, clean,
  prunable. No one is mid-edit.

**⚠ THE §OPEN LIST BELOW WAS HARVESTED 2026-07-30 AND IS ~6 WEEKS STALE.** Its 34 rows predate the entire
DAGeVu engine arc. **That sweep has now been DONE — see §SWEEP 2026-09-15 immediately below this block.**
All 34 rows were re-marked against `origin/main` @ `3e8c6be2`; 8 moved, 2 new rows were found, and 4
witnesses were actually run. **Read §SWEEP's verdict column, not the 2026-07-30 status column** — where
they disagree, §SWEEP is the measurement and the old column is prose. Do not trust row ordering as
priority. Row 34's "NEXT SESSION START HERE" is spent: it is answered in §SWEEP (and it split in two).

**Row 34 ("anchor export/save leak") — ANSWERED 2026-09-15, both code paths read. Full verdict in
§SWEEP.** Short form: the IFC path cannot leak an anchor because it never handles `GEOM_INSERT` at all —
but that also means it exports NONE of the ARC seed (now row 36, the bigger finding). The Save / Native
`.db` path DOES carry the anchors, because `exportDb` is a raw byte dump of the whole signed op-log with
zero filtering; whether that is a leak or correct behaviour is a call, and it is unwitnessed either way.
`saveModelDb` named in the row does not exist — the real path is `runSave() → Bonsai.exportDb()`.

**HYGIENE — swept 2026-09-15, partly done, and the remainder is NOT yours to prune.** The sweep ran over
all 22 outstanding `/tmp/wt-*` worktrees: **14 pruned** (the 5 this session created, plus 9 verified
`ahead=0 dirty=0` — including both dagevu ones). **13 remain, and every one of them holds real work:**

| state | worktrees | why it stays |
|---|---|---|
| unpushed commits (`no-remote` branch) | `wt-bake-perf` · `wt-batch-class-paint` · `wt-idb-cache-timeout` · `wt-krn-persist-race` · `wt-rule-findings-film` · `wt-storey-cut` · `wt-storey-reveal-list` | the branch was never pushed — pruning DESTROYS the commits |
| merged but dirty | `wt-bake-schedguard` (3) · `wt-buildup-placed` (27) · `wt-scrapbook` (1) | uncommitted changes on top of a merged branch |
| ahead and dirty | `wt-88-ab` (56 ahead, 4 dirty) · `wt-v87` (2 ahead, 17 dirty) · `wt-storey-reveal` (73 dirty) | someone's live in-progress work |

**Do not prune any of the 13 without the owner's word.** `wt-storey-cut` alone carries 359 dirty files.
If you add worktrees, prune YOUR OWN at close (`ahead=0` AND `dirty=0`), and leave these alone.

**METHOD RULES THIS LANE EARNED THE HARD WAY LAST SESSION — they apply here unchanged:**
- **A number that decides scope gets measured before it decides anything.** Three times in one session a
  plausible figure stood in for a measurement: a timing taken from the wrong function, a code comment's
  cap turned into a prediction, and a cross-file diff read as code drift. All three were wrong, all three
  were caught only because something forced a re-check.
- **A diff that decides scope must hold every variable but one.** The third of those varied two — the file
  AND the code version — then blamed the code. In THIS lane that trap is live: `*_extracted.db` and
  `*_silent.db` are different files with different completeness (Hospital: 64,150 transforms vs 63,917).
  Never diff across two building DBs and attribute the difference to code.
- **Prove a fix FIRES, not just that it shipped** — grep a real log line, never "code changed".

## ▶ §SWEEP 2026-09-15 — the re-verify sweep §RESUME ordered, DONE. All 34 rows re-marked against
## bim-ootb `origin/main` @ `3e8c6be2` by grep/sqlite, plus 4 witnesses actually RUN. **Rows 24 and 28 were
## then CLOSED the same day by bim-ootb #1738 — see their rows.** Read this table,
## not the 2026-07-30 status column below it — where they disagree, this one is the measurement.

**Method, so the next session can falsify any line here:** every verdict below names either a file:line on
`origin/main`, a `sqlite3` count off the SHIPPED resident DB, a live `curl` + content-hash, or a witness
run with its own PASS/FAIL line. No verdict rests on a code comment (two comments turned out to be wrong —
rows 28 and 35). Witnesses run through `modeller/tests/e2e_harness.js`, which resolves puppeteer 24.42.0
out of `~/bim-compiler/node_modules` — no install needed, and **"needs a browser" was not a reason to skip
any of this.**

### CHANGED ROWS — the 8 that moved. Everything not listed here is unchanged from 2026-07-30.

| # | 2026-07-30 | 2026-09-15 verdict | the evidence |
|---|---|---|---|
| 19 | verified-open | ✅ **CLOSED** | `move-gizmo.png` was recaptured in bim-compiler **#73** (2026-08-07). Verified where the user sees it, not on master: `GET https://red1oon.github.io/BIMCompiler/img/modeller/move-gizmo.png` → HTTP 200, **423,928 B**, content sha1 **`22a794f4df215ec50231aa642b904303f72d4006`** == the `origin/master` blob. A 200 alone would not have been evidence (§PRIME LESSON) — the hash is. |
| 32 | verified-open (RED on main) | ✅ **CLOSED** | **#1704** (2026-09-10) routed soft-delete through `modeller_history.js`'s tree. RAN it: `W-E2E-DELETE: 8 PASS / 0 FAIL`, **D4 green** (`len 195→195 meshFid175=0`). The witness's own D4 header now records the supersession. |
| 23 | verified-open (D3 drift) | ✅ **the named defect is FIXED — RE-POINT the row** | RAN `witness_disc_density.js`: `§DW-DENSITY-TE: 8 PASS / 0 FAIL`, **D3 ENVELOPE = 100% on all four** (PLB 26/26, ELEC 1754/1754, FP 996/996, ACMV 1444/1444) against the row's 94.3 / 92.0 / 94.8. **But the witness prints a DIFFERENT live finding it does not fail on:** `⚠ FINDING ELEC over-count 1754 vs real 833 = 2.11× — density-transfer drift (ARC footprint ≠ disc coverage area)`. That is the open item now; the D3 wording is dead. |
| 24 | ✅ **CLOSED 2026-09-18 — see §SWEEP.** Root cause `e2e_harness.js:349` `process.exit()`; fixed in bim-ootb #1738 (§MULTIRUN). `§SMOKE-ALL runs=2/2`, SampleCastle was never broken | ✅ **ROOT-CAUSED AND FIXED** — bim-ootb **#1738** | Reproduced exactly: `smoke_arc_only.js` prints Duplex (`meshCount=196`, 2 PASS / 0 FAIL) and **exits 0** with the SampleCastle iteration never running. Cause: **`modeller/tests/e2e_harness.js:349`** — `runE2E` ends with `process.exit(fail ? 1 : 0)`, so the first `await runE2E(...)` never returns. Nothing is wrong with SampleCastle. **Generalised trap: ANY witness file that calls `runE2E` more than once is silently single-run and still exits 0.** `smoke_arc_only.js` is the only such caller today. **FIXED in #1738 (§MULTIRUN):** additive `opts.noExit` makes `runE2E` resolve with `{name, pass, fail}`; the exit stays the default so every single-run witness is byte-unchanged (regression-checked: green still exits 0, red still exits 1). `smoke_arc_only.js` now tallies both runs and refuses with exit 1 if one was skipped — `§SMOKE-ALL runs=2/2 4 PASS / 0 FAIL`. **SampleCastle was never broken**: `meshCount=3290`, 2/0. |
| 34 | verified-open ("NEXT SESSION START HERE") | ⛔ **ANSWERED — and it splits in two, one of them bigger than the question** | **(a) IFC export CANNOT leak an anchor.** `bonsai_ifc.js` `build()` handles exactly three op types — `GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142). Anchors are `GEOM_INSERT` (`arc_editable.js:227`) → never reached. **(b) …but so is EVERY ARC-seeded element** (`arc_editable.js:342` is also `GEOM_INSERT`), so an IFC export of an opened resident exports **none of the seed**. That is a far larger finding than the anchor question and it is now row 36. **(c) Save / Native .db DOES carry anchors, by construction.** `modeller.html:3068` — `exportDb` = `await O.db.export()`, a raw byte dump of the whole signed op-log DB, zero filtering; `runSave()` calls that same writer (`modeller.html:2908`). Grep for `anchor` across `sdg_save.js` + `save_catalog.js` + the save path: **zero hits**. `saveModelDb` named in the row **does not exist** — the path is `runSave() → Bonsai.exportDb()`. Whether (c) is a leak is a real call, not a bug report: the anchors are signed ops tagged `anchorOnly:true` / `provenance:'void_anchor'` and re-open as invisible anchors, so a "full-fidelity" dump arguably SHOULD carry them. **Either way it is unwitnessed.** |
| 28 | verified-open (contradiction) | ✅ **DOES NOT REPRODUCE — CLOSED with a guard** (bim-ootb **#1738**) | New witness `witness_arc_3axis_rotation.js` (W-ARC-3AXIS), run on the FULL population of the shipped `SampleCastle_ARC.db`: `§ARC3AXIS-TILTED {n:293, real:293, seeded:293, pre:63, applied:230, dropped:0, other:0}` against a control of `§ARC3AXIS-FLAT {n:2405, real:2354, seeded:0, pre:2354, dropped:0}`. All 293 carry `placement.rotX/rotY` in their `GEOM_INSERT`; **230 genuinely need the rotation and get it** (their pre-placement mesh extent differs from their authored world AABB); 63 are already world-aligned; **0 dropped**. The 2026-07-10 finding predates **§GEO-SERVED (#1090)** — before that the Modeller drew bounding boxes, and a box has no orientation to lose. RED-first: neutering `place()`'s `pl.rotX \|\| pl.rotY` branch flips exactly 230 to dropped and takes R4+R5 RED (exit 1), control untouched. ⚠ **A WRONG TEST WAS TRIED FIRST AND LOOKED CONCLUSIVE** — comparing the rendered world AABB against `element_transforms.bbox_*` proves nothing, because `extractIFCtoDB.py:181` defines those columns AS the world AABB; the discriminating quantity is the PRE-PLACEMENT mesh bbox. That near-miss is written into the witness header so it is not repeated. `arc_editable.js`'s false comment ("0 non-zero rotation_x/rotation_y rows") corrected in the same PR: it is 293, all `rotation_y = ±π/2` exactly, across IfcCovering 125 · IfcWindow 80 · IfcWall 32 · IfcDoor 28 · IfcWallStandardCase 21 · IfcRailing 7. |
| 12 | verified-open | verified-open — **and its blast radius grew** | `rel_fills_host` ships as a SQL patch, never in the binary (so sqlite on `*_ARC.db` says "no table" for all 8 — that is the wrong instrument). Real census of `modeller/patches/*_ARC.db.sql`: **Duplex 54 · SampleCastle 83 · SampleHouse 11 mentions; Clinic, Garage, HHS, Hospital, Terminal = 0.** Exactly the five the row named. **New consequence the row predates:** `dagevu_engine.js:62` builds every `HostFillEdge` from a REAL `rel_fills_host` row, so **#1706's anchor-by-default engine — the headline of the whole DAGeVu arc — is inert on 5 of the 8 residents.** |
| 10 | re-measure | **RE-MEASURED (local only)** | RAN `witness_e2e_terminal_open.js`: `7 PASS / 0 FAIL`, **`§OPEN openMs=20592`**, 35,552 ARC elements seeded exactly, `verifyChain ok len=35552` in 1,176 ms. Signing is still a visible phase — 3 of the 8 distinct status lines are `signing 3000/13500/25500 of 35552`. ⚠ **This is headless-swiftshader on localhost. Do NOT set it against the old 14 s profile and call it a regression — different rig, and that is exactly the "hold every variable but one" trap §RESUME warns about. The LIVE number is still unmeasured**, and §RESUME's own rule says the live URL is where this has to be proven. |


### §ROW-12 FOLLOW-THROUGH — two things worth carrying forward (2026-09-18)

**Garage's source was ambiguous and the ambiguity was RESOLVED BY MEASUREMENT, not by picking.** Its
recorded `source_file` (`HospitalGarage_ARC.ifc`) is not on disk. Two candidates matched 5/5 GUIDs —
`HospitalGarage_IFC4.ifc` and `HospitalGarage_IFC2x3.ifc` — and they produce DIFFERENT `opening_guid`s, so
picking one blind would have been a coin flip presented as a fact. The 36 FILLED `host|filling` pairs, the
only ones the engine rides, are byte-identical across both schemas, so the choice is immaterial *for the
ride*. If anything ever needs `opening_guid` itself, this is unresolved and must be settled first.

**The witness raced, and it took two wrong conditions to get right — worth knowing before writing the next
multi-building witness.** `__dwName` flips at the START of an open, but `__arcFidByGuid` is rebuilt LATER,
in the geo-fetch continuation. So "the name matches and the bridge stopped changing" is satisfied by the
PREVIOUS building's untouched bridge, silently: the first re-run against merged main reported Hospital
`rideable=0` against an expected 506, with `bridge=1950` — Clinic's size. The data was correct the whole
time. The fix is to NULL `__arcFidByGuid`/`swXEdges` before opening and wait for repopulation, so a
non-empty bridge is necessarily this building's (bim-ootb #1750). **Any witness that opens more than one
resident needs this; a fixed sleep will pass locally and lie later.**

### §SWEEP FOLLOW-THROUGH 2026-09-18 — what is actually left, ranked

Rows 19, 23, 24, 28, 32 and 35 are now marked closed IN THE TABLE ITSELF, not just here — a row that
still reads `verified-open` after being closed is the same stale-claim trap this file exists to kill.

**The largest genuinely-open item is row 36, and it was found by accident.** IFC export handles only
`GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY`; every ARC-seeded element is a `GEOM_INSERT`, so exporting an
opened resident emits **none of the building**. Nobody has ever reported it, which suggests nobody has
tried the feature on a resident. Ranked above the rest because it is a headline capability that silently
produces an empty file.

**Row 12 is the second, and its blast radius grew:** `rel_fills_host` ships for Duplex/SampleCastle/
SampleHouse only, and `dagevu_engine.js:62` builds every `HostFillEdge` from a real row — so **#1706's
anchor-by-default engine, the headline of the whole DAGeVu arc, is inert on 5 of the 8 residents.**

**Two threads §XEDGE-GEOWIRE (bim-ootb #1744) opened and did not close:**
- **The residual 11.** G4 is honestly RED at 11 of 12,983 on SampleCastle, deliberately not relaxed.
  Two suspects, unmeasured apart: `_readBoxes`' `rx/ry` guard (whose stated premise is the same false
  claim corrected in #1738 — 293 such rows exist, so the guard fires on real data and the 3-axis path it
  distrusts is now itself witnessed, making it probably liftable), and the 1,301 of 3,225 elements with
  no resolvable blob.
- **Datums 802 → 657 on SampleCastle.** Plausibly correct — anchor-displaced faces were manufacturing
  false alignment clusters — but still UNVERIFIED as a *correction* rather than a new artifact.
  ⚠ **RETRACTED 2026-09-21, the row-7 half of this claim was WRONG.** I wrote that it "bears directly on
  row 7 because that grid is built from these datums". It is not: `str_walker.js` derives its OWN emergent
  grid by 1D-clustering column centres and has ZERO references to `CrossEdges`/`swXEdges`. The two
  derivations are unrelated and #1744 did not move row 7's baseline. Row 7 was re-measured anyway
  (bim-ootb #1753) and the real finding is different — see row 7. The datum question itself stays open.

**A sibling consumer of the same substrate defect is on record but unmeasured:** `scripts/compile_rooms.py`
(Viewer room injection) reads `center_*`/`bbox_*` straight off `element_transforms` with no rotation and no
blob resolution. Exposure is NOT uniform — `door_dims` reads extents only and is safe (934/934 correct);
`storey_doors`/`storey_z_anchors`/stair footprints read positions and are exposed. See
`SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. Measure before touching it.

**Unchanged and still open:** 6 (Terminal 0 MEP), 7, 8, 9, 11, 13, 14, 22, 25. **Row 10 half-answered** —
re-measured at `openMs=20592` on 35,552 elements, but LOCAL headless only; the live number §RESUME asks
for is still unmeasured, and the old 14 s figure must not be diffed against it (different rig).
**Blocked on the user, nothing built:** 15, 21, 26, 27, 29, 31. **Deferred by design:** 30.

⚠ **Row 14's cited example does not reproduce** — Dining_Chair measures 0.443/0.427/**1.227** m, upright,
not "z=0.14 lying on its side". The item stands; re-source the example or its witness is green on arrival.

### NEW ROWS found by the sweep

| # | obj | item | proof required | status |
|---|---|---|---|---|
| 35 | O13 | **The LIVE guide contradicts shipped behaviour — and the fix is NOT a plain deploy.** The published ModellerGuide says *"Hosted doors and windows **ride**, never distort"* (1 hit live; **0** hits of "ANCHORED by default") — but **#1706** (2026-09-11) made openings **anchor by default with ride opt-in**, the exact reverse. Master fixed the text in `2c232661c`. ⚠ **DO NOT just run `mkdocs gh-deploy` from master — it would take live pages OFFLINE.** Measured 2026-09-15: the site was deployed from **`fable/meshdb-livewire` @ `58e7f344a`**, NOT from master, and `58e7f344a` is **not an ancestor of master** — they are two partly-overlapping doc trees, not old-vs-new. Deploying master would delete **11** published files, including two public pages that are live and in the fable branch's `mkdocs.yml` nav today (both HTTP 200): `docs/SpatialCompilationPaper.md` (the academic paper, 735 lines) and `docs/4DGenerator.md` — neither has ever existed on master. Master would add 4 files (`internal/LAST_MILE_PROBLEM.md`, `internal/PROJECT_CHRONOLOGY.md`, `internal/VibeProgramming.md`, `glassbowl_data.db`). This is the same two-production-paths shape `LFS_QUOTA_AUDIT §6.1` already recorded | **a decision first — which branch owns the published site** — then reconcile the two doc trees onto it, deploy, and re-curl: assert "ANCHORED by default" present, "ride, never distort" gone, and `SpatialCompilationPaper`/`4DGenerator` still HTTP 200 | ✅ **DONE 2026-09-18.** Site consolidated onto master (BIMCompiler #106 — 3-way against the merge-base, zero conflicts, 11 fable-only files ported) and published via `scripts/safe_gh_deploy.sh` (NOT bare `mkdocs gh-deploy`, which CLAUDE.md bans). Guard PASS live=290 → new=292 superset; all 7 canaries 200. Verified live: "ANCHORED by default" 1 hit, "ride, never distort" 0 hits, `SpatialCompilationPaper`+`4DGenerator` still 200 |
| 36 | O1/O8 | **IFC export ignores `GEOM_INSERT` entirely**, so exporting an opened resident emits nothing from the ARC seed (see row 34b). `bonsai_ifc.js` `build()` covers `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY` only; every seeded element is `GEOM_INSERT` (`arc_editable.js:342`) | open Duplex → Export ▸ IFC → count products in the emitted file vs the 196 seeded meshes; RED-first against current main | verified-open — found by the row-34 read, never previously stated |

### ROWS RE-CONFIRMED UNCHANGED (spot-checked, no movement)

- **✅ still shipped:** row 2 (`docs/ModellerGuide.md:164` "What a wall is made of" — **and live**: HTTP 200, 128,351 B, 3 hits) · rows 3 + 33 (Duplex `geoV: 6`, `str_walker_outliner.js:52`) · row 4 (§ANCHOR, 7 hits in `arc_editable.js`) · row 16 (`bonsai:refold`/`_paintSel`, 11 hits) · row 17 (`__ALL__`, 5 hits) · row 18 (`modeller.html:4095/4146/4150`).
- **verified-open, unmoved:** row 5 (one §ONE-DISC-TAB hit at `modeller.html:4811`; no unification slice built) · row 6 (`Terminal_ARC.db` still served — 35,552 elements across 13 classes, **0** Pipe/Duct/Cable/Flow rows) · row 7 (`witness_str_into_arc.js:5` still cites RMSE 0.104 m) · row 8 (#1245's `witness_e2e_gridmove_roof.js` is roof grid RECOMPOSE — not the per-element plate walk this row asks for) · row 9 (`sdg_gate.js:106` still calls apply "a future accept-gated op") · row 11 (`arc_editable.js:27-31` — colour stays the cosmetic PALETTE, only alpha recovered) · row 13 (`modeller.html:424` and `:1036` still name the un-vendored EffectComposer) · row 25 (no BCF import, no PBR texture code).
- **row 15** — the figures check out: `library/component_library.db` is **220 MB** with `component_definitions` = `component_geometries` = **23,888** rows, and there is still no `createDbWorker` anywhere in `modeller/`. ⛔ still the user's hosting call (GH vs OCI).
- **row 22 splits three ways:** one-click revert of a RED — not found, open. UBBL named checks — **partially shipped**, `sdg_gate.js:139-154` implements By-Law 42 (area ≥ 6.5 m², headroom ≥ 2.5 m) but the file itself marks it `STATIC, not part of evaluate()'s delta contract`. rtree prune — `cross_edges.js:38` replaced the Python rtree query, but `disc_walker.js:929` still records that Terminal has no `elements_rtree` and falls back to the raw unverified centre; open.
- **row 30** — still dead code (`bonsai_gridmove.js:166` hardcodes `ifcClass: 'IfcWall'`, so `isRoof` is always false). ⚠ **but it is now a one-liner**: `classByFid` is computed and used as a filter nine lines earlier (`:157`) — the real class is in hand at the emit site and thrown away. Still needs its own design pass; noting only that the blocker named in `GRID_ROTATION_GUARD.md §8` has dissolved.
- **⛔ still blocked on the user, nothing built:** rows 21, 26, 27, 29, 31. Greps for `siblingCluster` / external-IFC import / `DUAL_MODEL` return zero hits in `modeller/`.
- **row 14** — the item is real (no axis-permutation bake in `scripts/extract_dagevu_catalog.py`) but ⚠ **its cited example no longer reproduces**: Dining_Chair (hash `5e4c8c071b267e91`) measures **0.443 / 0.427 / 1.227 m** in `viewer/dagevu_geometries.json` — tallest axis IS z, upright. The row's "z=0.14, lying on its side" is stale. Re-source the example from a part that still fails before writing the `tallest-axis == h` witness, or the witness will be green on arrival and prove nothing.

## ⚖ THE USER IS NOT REVIEWING. YOU ARE THE ONLY CHECK.
The user has explicitly said they have no time to inspect this work. That REMOVES the safety net; it
does not lower the bar. Therefore, in this lane:
- **Every claim carries its own `§`-tagged log line or it is not done.** No exceptions, no "should work".
- **No screenshot, no "looks right", ever, as proof of anything** — that is FUNDAMENTAL LAW in
  `CLAUDE.md`. Numbers computed from real object state, read programmatically.
- **Prove it where the USER will see it — the live URL — not only on localhost.** See §PRIME LESSON.
- **A witness that cannot fail is not a witness.** Every test names the issue it proves, and must be
  shown failing on the pre-fix code.
- **Report only finished, verified outcomes.** One line each. Not plans, not progress.

## 🔴 §PRIME LESSON — read before diagnosing ANYTHING (learned the hard way, 2026-07-29/30)
The Modeller rendered every element as a bounding box on the LIVE site for months while every local
measurement said "real geometry, 215/215". Cause was two faults stacked:
1. **Hosting** — `modeller/mesh.db` is Git-LFS-tracked and **GitHub Pages does not resolve LFS**. The
   browser got HTTP **200** with a **134-byte** text stub (`version https://git-lfs.github.com/spec/v1`).
2. **Silent substitution** — with no mesh store at all, `arc_editable.js`'s hard-fail guard was SKIPPED
   (it only fires when a store exists but one element's link is broken), so every element fell back to
   `boxArrays(rawBox)`, its measured bounding box. The only log line was a `console.warn`, which
   DevTools hides by default.

**The diagnostic order this burns in — apply it to every "the Modeller looks/behaves wrong" report:**
1. `curl` every asset the live page needs. Check real size and magic header. **A 200 is not evidence.**
2. Read what the code does when an asset is missing or junk. **If it substitutes anything — a box, a
   default, a placeholder — that silent substitution IS a bug in its own right,** worse than the missing
   file. Fix both; fixing only the file leaves the trap armed.
3. Check the service-worker `CACHE_VERSION` and whether the file is precached. A landed fix that a
   cached script overrides reads to the user as "still broken".
4. Only then explain — one line, naming the asset and the substitution.

**Do NOT start with:** local DB queries, triangle counts, part-count comparisons, material/lighting
audits, or LOD definitions. None of those can see a deployment fault, so none of them can answer.

**Fixed 2026-07-30, both faults** (bim-ootb PR #1090 merged + #1091 cache bump): each resident now has
its own small geo file on object storage (Duplex 1.3MB instead of a shared 120MB; all 8 residents
resolve 100% of their element hashes, verified), and `_assertRealGeoDb()` refuses non-SQLite bytes,
names an LFS stub explicitly, and logs as `console.error`. Guard witnessed 4/4 against real live bytes.
⚠ **`modeller/mesh.db` is now DEAD WEIGHT in git** — nothing fetches it. Do not re-point anything at it.

## 🎯 THE OBJECTIVES — "the Modeller works" means ALL of these, measured
Derived from the 15 files below + `[[project_modeller_vision_lock]]`. Each line: the objective, then
where its detail lives. **None of these may be quietly dropped to make a report look finished.**

| # | objective | authoritative file |
|---|---|---|
| O1 | **Real authored geometry renders — never a substitute**, on the LIVE site, for every resident | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` |
| O2 | **LOD400 means fabrication level** — an authored multi-layer wall is not one block (see §LOD400-ENVELOPE) | same, §LOD400-ENVELOPE + §LOD400-DISPATCH |
| O3 | **ONE coherent surface** — the Outliner leads (Building▸Storey▸Room▸disc▸class▸element), not 3 unlabelled tabs | `RESUME_MODELLER_UX_OUTLINER_PILL.md` |
| O4 | **Direct manipulation** — select · hover · move-on-axis · multi-select · snap · rotate | `MODELLER_DIRECT_MANIPULATION.md`, `RESUME_MODELLER_P3.md`, `RESUME_MODELLER_POLISH.md` |
| O5 | **Material at Viewer standard** — glass reads as glass; reflection/grain/roughness/light rig parity | `MODELLER_RENDER_MATERIAL_PARITY.md` |
| O6 | **Placement anchor semantics correct** — elements seat where the source says, not where a box implies | `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` |
| O7 | **Insert from the REAL BOM catalog**, not a hardcoded 3-component fixture | `MODELLER_BOM_CATALOG_SPEC.md` |
| O8 | **Save = validated snapshot promotion** (CompleteIt-shaped), not a raw dump | `MODELLER_SAVE_COMPLETEIT.md` |
| O9 | **Conformity gate** — RED/ORANGE planner's gate on edits | `RESUME_MODELLER_CONFORMITY_GATE.md` |
| O10 | **Spatial Dependency Graph as authoring truth** — typed cross-edges, host/filling rides its wall | `RESUME_GRAPH_MODELLER_INTEGRATION.md` |
| O11 | **Opens at Terminal scale** without a signing stall; roof/IfcPlate fast placement | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` |
| O12 | **Zoom-to-selection parity** with the Viewer Find panel | `MODELLER_ZOOM_TO_SELECTION.md` |
| O13 | **Guide-worthy** — the public guide's screenshots are honest and current | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` |
| O14 | **Competitive polish** — outline-pass selection, shadows/AO, BCF/IFC interop | `RESUME_MODELLER_COMPETITIVE_POLISH.md` |
| O15 | **3D Grid editing is the primary handle** — drag a gridline and the building RECOMPOSES (stretch, not scale); openings stay host-bound; rotated bays stay square; no state leaks between clears | the 9 `GRID_*.md` files + `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` — triaged below |
| O16 | **2D views ARE the drawings, and they are an INPUT surface** — orthographic elevations F/B/L/R + sections flatten ALL geometry, storey markers at real Z; end-state: drag a gridline in plan → write Δ to DB → recompile → services re-route | `[[project_2d_views_roadmap]]`; ⛔ **PDF/DXF sheet export is NOT yet an objective** — see §2D-AND-PDF below |

## 📋 TRIAGE — the 15 files, 3,742 lines total. Consolidation rule: this MASTER owns the OPEN LIST and
## the objectives; each file keeps its own history and detail. **Do not delete any of them.**

| file | lines | owns | first action for the study session |
|---|---|---|---|
| `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` | 599 | O1, O2 — geometry truth, the envelope defect, §GEO-SERVED history | its `§START HERE` + `§LOD400-ENVELOPE` are current; harvest OPEN items 1–6 |
| `RESUME_GRAPH_MODELLER_INTEGRATION.md` | 398 | O10 — graph/cross-edges into authoring | harvest open items |
| `MODELLER_BOM_CATALOG_SPEC.md` | 393 | O7 — real catalog INSERT | check whether the 3-component fixture still ships |
| `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` | 376 | O13 — guide screenshots + the old "geometry hell" thread | ⚠ its geometry-hell verdict is SUPERSEDED by §LOD400-ENVELOPE |
| `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` | 309 | O11 — open speed, roof/IfcPlate | re-measure at real Terminal scale, live |
| `RESUME_MODELLER_UX_OUTLINER_PILL.md` | 236 | O3 — one-surface UX | the 3-surface unification was DESCOPED, not shipped — decide |
| `MODELLER_RENDER_MATERIAL_PARITY.md` | 229 | O5 — material | glass opacity DONE; reflection/grain/roughness/lights NOT ported |
| `RESUME_MODELLER_COMPETITIVE_POLISH.md` | 208 | O14 — polish research (design only, no code) | ~11 quick wins already identified; rank them |
| `MODELLER_DIRECT_MANIPULATION.md` | 184 | O4 — the manipulation core | spine reported DONE; verify on the LIVE site |
| `MODELLER_ZOOM_TO_SELECTION.md` | 148 | O12 — camera parity | small, well-specified |
| `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` | 139 | O6 — anchor semantics | verify the flip actually shipped |
| `RESUME_MODELLER_POLISH.md` | 98 | O4 follow-ups | harvest |
| `RESUME_MODELLER_P3.md` | 87 | O4 multi-select | reported fully ✅ — confirm, then retire to a pointer |
| `RESUME_MODELLER_CONFORMITY_GATE.md` | 77 | O9 — RED/ORANGE gate | harvest |
| `MODELLER_SAVE_COMPLETEIT.md` | 61 | O8 — Save semantics | harvest |
| dir `prompts/Modeller/` | — | `COMPETITIVE_FREECAD_INTEROP.md`, `DISC_Walker/` | read, fold pointers in here |

### O15 — the GRID family, added 2026-07-30 (reviewer gap: the first harvest swept only `MODELLER_*`/
### `RESUME_MODELLER_*` filenames, so 10 files / 1,613 lines covering the Modeller's PRIMARY HANDLE were
### never triaged. The grid is how a user edits the building; it cannot be a single row in the queue.)

| file | lines | owns | first action |
|---|---|---|---|
| `GRID_ROTATION_GUARD.md` | 445 | rotated-bay correctness — the deepest of the family (20 done-marks) | verify the guard shipped, then harvest its 5 remaining |
| `GRID_ROTATED_SCALE_HARDENING.md` | 260 | scale hardening in `bonsai_kernel_worker.js` + its own witness | mostly ✅ — confirm, retire to a pointer if so |
| `GRID_KINEMATICS_SANDBOX_PROOF.md` | 233 | the 3D authoring-grid system proof (`bonsai_grid.js`, `grid_kinematics.js`) | this is the doctrine file for O15 — read FIRST |
| `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` | 162 | **grid ⊗ BOM as ONE authoring substrate** — 6 open, 0 done | spec-only, never built; decide if it is still the intended architecture |
| `GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md` | 151 | master design dialogue (reference only) — feeds O8 + pre-drag preview | reference; do not build from it directly |
| `GRID_SMART_ELEMENT_SCOPE.md` | 136 | which elements a drag legitimately takes with it | harvest — 10 open |
| `GRID_CLEAR_STATE_LEAK_FIX_ROUND2.md` | 100 | state leaking across a grid clear, round 2 | claims ✅ 2026-07-04 with "PR TBD" — **verify it actually landed** |
| `GRID_CLEAR_STATE_LEAK_FIX.md` | 72 | round 1 of the same | superseded by round 2 — confirm, then pointer |
| `GRID_PREDRAG_GREENORANGE_PREVIEW.md` | 54 | green/orange pre-drag preview | states shipped — confirm |
| plus queue row 7 | — | 🟥 the grid-lock crux, 0.104 m residual | already ranked; its own heavy session |

**Harvest rule for these, same as before:** verify against shipped code before listing anything as open —
two of these files claim DONE with no PR reference, which is exactly the stale-claim shape the first pass
found 11 of. Add the surviving rows to §OPEN LIST tagged `O15`.
**✅ HARVESTED 2026-07-30 (same day):** surviving rows = **28–31** in §OPEN LIST. Everything else in this
table verified SHIPPED against origin/main — including both suspect ✅s ("PR TBD" landed; tilt-guard merged
as PR #722 squash) — see the O15 stale-claims block. The one contradiction finding: row 28 (code present,
live measurement says inert).

### §2D-AND-PDF — the vision question, answered 2026-07-30 (user: *"Vision from there on can we do 2D
### professional drawing exporting to PDF?"*)

**Recorded position (`[[project_2d_views_roadmap]]`), unchanged:** *"The 2D views ARE the architectural
drawings. Full-screen + print-screen replaces export for now… No DXF/PDF export needed yet."* So PDF is a
**deliberate deferral, not a missing capability**, and the roadmap deliberately aims PAST export:

> *"End state: drag grid lines → write Δ to DB (like DXFSyncVerb) → recompile building → RouteWalker
> recomputes MEP. This is the BIM Designer Browser round-trip: 2D view is both output AND input surface."*

That is the same handle as O15 seen in plan. **O15 and O16 are one mechanism, two views — do not build
them as separate features.**

**Substrate that already exists** (verify each before assuming, per §PRIME LESSON): orthographic
elevations F/B/L/R, cross-sections showing slab/ceiling/roof heights, storey markers from
`detectStoreys()` at real Z, subtle gridlines with click-a-bay highlight (`viewer/elevation.js`).
Requirements already fixed by the roadmap: an elevation must flatten **ALL** geometry onto the view plane
(no empty spaces), and stairs must read from every side like a real drawing.

**⛔ NOT an objective until the user says so.** Professional PDF sheets = sheet frame + titleblock + real
scale + dimension strings + line-weight hierarchy — a genuinely new lane, not a small addition, and it
would be the first thing this product exports for print. Do NOT start it off this file. If greenlit it
becomes O17 with its own spec; until then the answer to "can we?" is **yes, and the 2D substrate is
already there — but the recorded priority is the round-trip, not the printout.**

## 🚚 THE DISPATCH — model allocation, stated honestly
Per `[[feedback_model_allocation_mastermind_vs_execution]]`:
- **Fable5 — YES for the wide mechanical pass, and it is the right tool for it.** Reading 3,742 lines
  across 15 files, extracting every open item verbatim with its file + section, de-duplicating,
  detecting claims that contradict shipped code, and filling in §OPEN LIST below. Long-context,
  mechanical, high-volume, fully specified. Fable5 does NOT write memory files.
- **Sonnet — required for the architecture calls**, of which at least three are already known and
  cannot be delegated to a mechanical pass: (a) §LOD400-ENVELOPE's one-mesh-per-element vs N-sub-instances
  decision; (b) whether the descoped 3-surface Outliner unification is still wanted; (c) whether a
  void-consumed host becomes a non-rendered logical anchor.
- **The user's own call** on anything that changes what the product IS, not how it is built.

**Sequence:** Fable5 harvest → §OPEN LIST filled and ranked → Sonnet takes the 3 calls → Fable5 builds
the mechanical items to zero → each item marked `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>`.

## 📌 §OPEN LIST — FILLED 2026-07-30 (Fable5 harvest, all 15 files + `prompts/Modeller/`, every row
## verified against bim-ootb `origin/main` by grep/sqlite — not carried forward from prose)
Format, one row per item, ranked most-blocking first:

`| # | objective | item, in one plain line | source file §section | proof required | status |`

| # | obj | item | source | proof required | status |
|---|---|---|---|---|---|
| 1 | O2 | ⛔ ARCH CALL (a): layered-wall representation — N sub-instances per layer vs ONE layered mesh + per-layer index (file recommends b) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-DISPATCH` step 2 | the choice stated in one line, recorded in that file | ✅ CALL MADE 2026-07-30 — **(b) one layered mesh + `component_geometry_layers` index**, recorded in the source file §LOD400-DISPATCH; row 3 unblocked |
| 2 | O2 | the plain-English "what a wall is made of" guide subsection — the user's PRIMARY asked-for deliverable, [[feedback_terse]] binding | same, step 1 | subsection in `docs/ModellerGuide.md` (zero "layer" hits there today) | ✅ DONE 2026-07-30 — "What a wall is made of" committed after §Realistic glass; deploy via `safe_gh_deploy.sh` post-merge |
| 3 | O2 | §LOD400-LAYERS-REAL: slice the authored envelope at authored layer thicknesses; ship layers+`surface_styles` to residents (patch + self-heal loader); then the Modeller half of the gate refuses envelopes | same, §THE FIX items 2–3 | `witness_lod400_envelope.py` gate GREEN; 7-layer wall `2O2Fr$t4X7Zf8NOew3FNbT` renders 7 slabs summing to authored total; falsified by removing one layer row | ✅ extractor half DONE 2026-07-30 (PR #57 merged; W-LOD400-ENVELOPE **12/12 exit 0 on Duplex, independently re-run by the orchestrator**, refusals: DX 0, SC 1 honest `sporenkap` pitched-roof → SC still exits 1 by design). ✅ **FULLY DONE 2026-07-30 — residents half shipped (bim-compiler PR #59 + bim-ootb PR #1096, both MERGED):** layer tables → `patches/Duplex_ARC.db.sql` self-heal; rebuilt `Duplex_geo.db` (layered buffers under the EXISTING hashes via per-guid measured change-of-basis — fresh hashes match 0/155 shipped, see the §LOD400-LAYERS-RESIDENTS record) uploaded to OCI + byte-verified live; `arc_editable.js` §LAYER-GATE refusal armed (schema-detected, Duplex only; SC untouched by design); geoV 3→4, sw v40→v41; W-E2E-LAYERS-RESIDENTS **8/8 against the LIVE geo URL** (party wall 124 tris / 7 rows Σ0.550 m / slabs 16-41-193-50-193 mm; falsification fires; unpatched residents byte-identical). Per-layer render COLOR deliberately not wired (needs face-group materials through the fold payload — own slice; data already ships). ⚠ **WATCHDOG CORRECTION 2026-07-30 (live-queried): the party wall renders 5 slabs, NOT 7** — layers 5-6 (Metal Stud 41mm, outer Plasterboard 16mm) have `face_count=0`, `face_start=124` = past the buffer end. 4 empty rows / 229 total, on 2 of 71 walls (both 7-layer, both opening-cut). The witness was BLIND BY CONSTRUCTION: thickness-sum (0.550) and face-count-sum (124) both reconcile while two layers are missing — a green computed over the wrong quantity, the same shape as §PRIME LESSON. → row 33 |
| 4 | O1 | ⛔ ARCH CALL (c): should a VOID-CONSUMED host become a non-rendered logical anchor (SC `stretchRide` reach 9/74 because 65/71 hosts are void-consumed) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE` OPEN 1 | doctrine analysis + recommendation recorded; **user's word before any build** | ✅ DONE (witness) 2026-07-30 — BOTH halves merged. Extractor: PR #58 (W-VOID-ANCHOR-EXTRACT 7/7, RED-falsified; SC patch independently verified: 65 anchors, instances unchanged 3225). bim-ootb: PR #1095 (W-E2E-VOID-ANCHOR 19/19, RED-first baseline committed; **reach 9/74 → 74/74**, rider dx == host delta exactly, filling mesh moved rigidly; guardrail proven surface-by-surface: visible 3225=3225, Outliner 3342/3418 identical, pick rays hit-for-hit identical through 8 anchor meshes, gmAudit/§SAVE_BASELINE/§XEDGE-ALL identical; one honest non-masked count: commitSeedGroup ops=3290, anchors named by §ANCHOR lines; CACHE_VERSION v39→v40) |
| 5 | O3 | ⛔ ARCH CALL (b): the descoped 3-surface Outliner unification — ARC tree + STR Walker tab still separate on main | `RESUME_MODELLER_UX_OUTLINER_PILL.md` + LOD400 §NIGHT 3 | re-scope verdict recorded (still wanted? safe incremental path?) | ✅ CALL MADE 2026-07-30 — unify INCREMENTALLY, 6 slices via the proven §ONE-DISC-TAB wrap, recorded in `RESUME_MODELLER_UX_OUTLINER_PILL.md`; slices 1-2 buildable now, no user decision load-bearing |
| 6 | O10 | ⚠ RE-FRAMED 2026-09-24 → §STRATEGY L1-L3 (the 0 MEP is the INPUT; the gap is routing + signing). Original: §8E-3 substrate gap: the shipped "Open Terminal" resident (`Terminal_ARC.db`) is ARC-only, 0 MEP — a real user's walk renders no routed network; the witness sidesteps via `Terminal_meta.db` | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §DONE 2026-07-11 finding 1 | routed tubes render on the REAL user open path (or the gap recorded as accepted) | verified-open — RESIDENTS still serve `Terminal_ARC.db` |
| 7 | O10/O3 | grid-lock-to-ARC/STR crux — 0.104 m RMSE baseline residual on the emergent grid; prerequisite for RosettaStone-through-grid + clean fold | `RESUME_MODELLER_UX_OUTLINER_PILL.md` 🟥 | its own HEAVY investigation session, per-axis measured findings | **RE-MEASURED 2026-09-21 — bim-ootb #1753, W-ROW7-GRID-BASELINE 5/5.** The baseline is NOT stale, but the shipped measurement path UNDER-REPORTS it. On `Terminal_arcstr_proof.db` (158 columns, geometry 158/158, same metric as `witness_green_report.js:57-61`): **anchor centres → colRMS 0.0939 m; true mesh centres → 0.1039 m.** The recorded 0.104 matches the CORRECTED figure to 3 dp, not the shipped path's 0.0939 — correcting the substrate makes the residual **worse by 10.0 mm**, i.e. the anchor defect was FLATTERING it. Grid topology is unaffected (18×10 either way), so this is a residual story, not a grid-shape one. Cause: `str_walker_bridge.js:22/38/50` reads `center_x/y` = the placement ANCHOR; the offset VARIES per column (p50 19.7 mm, p90 148.1 mm, max 225.6 mm on 0.75 m columns), so it does not cancel even though the grid is derived from the same centres it measures. **Before the heavy session starts it must decide WHICH number it is chasing.** Still verified-open as a defect; the baseline question is closed |
| 8 | O10 | roof plates walked PER-ELEMENT on the measured pattern (user accepted 1.3% count err; gate = positional) — also the cadence source that tightens #7 | same 🟧 | plate-centre spacing uniformity measured; per-element pass-bar RMS sub-metre | verified-open |
| 9 | O10 | backprop APPLY: accept-gated hop-by-hop application of ORANGE suggestions (flagging shipped #647; applying not built) | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §USEFUL-DIFF 2 + `sdg_gate.js:106` | one accepted ORANGE fires one signed op, one hop, witnessed | verified-open (partially shipped) |
| 10 | O11 | Terminal open speed: staged pre-sealed rows + incremental `sealFrom` HAVE shipped since the 14 s profile — re-measure on the LIVE URL, then decide if Candidate C (batch-sign bulk classes) is still needed | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` ⛔ signing | live `§STAT-TRACE` numbers on the real URL | re-measure — `kernel_ops.js:210/404` supersedes the old profile |
| 11 | O5 | full colour-parity: Modeller still paints the cosmetic PALETTE; real `material_rgba` RGB unused (only alpha recovered) | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | real per-element colour, before/after on Duplex + HHS glazing, witness | verified-open — `arc_editable.js:30-31` says so in its own comment |
| 12 | O1 | `rel_fills_host` missing on ALL five new residents (Clinic/Hospital/HHS/Garage/Terminal); the fresh `Clinic_extracted.db` ALSO lacks the table | LOD400 §START HERE OPEN 2 | `gen_rel_fills_host_patch.py` per building once its source IFC is locatable; guide Grid-Stretch sentence extended | ✅ **DONE 2026-09-18 — bim-ootb #1749 + #1750.** All five sources WERE locatable, each identified by the DB's own `project_metadata.source_file` rather than a filename guess. Recovered verbatim via the existing `gen_rel_fills_host_patch.py`: **HHS 218 edges / 99 rideable · Clinic 403 / 302 · Hospital 665 / 506 · Garage 220 / 36** — 943 new rideable host↔filling edges, every one matching its generator-predicted reach EXACTLY on the live scene (Duplex, for scale, is 36/38). **Terminal is deliberately NOT patched:** its source `TerminalMerged.ifc` (567 MB, identified by 5/5 GUID match) declares ZERO `IfcRelVoidsElement`/`IfcRelFillsElement` — the author never authored a void/fill chain, so the generator refused to write a file rather than invent one. That is a SOURCE DATA GAP, asserted in W-RFH-RESIDENTS F4 so nobody 'fixes' it by fabricating edges. So §DAGEVU's anchor/ride now works on **7 of 8 residents**, with the 8th explained by its own data. Witness W-RFH-RESIDENTS 15/15, RED-first |
| 13 | O14 | SSAO + OutlinePass selection — blocked on vendoring EffectComposer (own slice) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` §NEEDS-DESIGN 6/7 | vendored composer + witness | verified-open — `modeller.html:411/1022` name the gap |
| 14 | O7 | per-mesh furniture orientation normalize-at-extraction (metadata lies: Dining_Chair z=0.14, FURN_DESK z=2.0) | `MODELLER_BOM_CATALOG_SPEC.md` §ALSO QUEUED | bake axis-permutation into vertices; witness tallest-axis==h | verified-open — no bake code in `extract_dagevu_catalog.py` |
| 15 | O7 | full 23,888-part library via httpvfs range-load — ⛔ BLOCKED: **where does the 220 MB `component_library.db` live (GH vs OCI)? user's call** | same §BUILD LEGS L1–L3 + §OPEN | W-LIBDB-RANGE: bytes-read ≪ 220 MB | verified-open — no `createDbWorker` anywhere in `modeller/` |
| 16 | O1 | §SEL-TINT-REFOLD: an authoritative re-fold drops the selection tint while `_selSet` still holds the mesh | LOD400 §START HERE OPEN 4 | tint survives cut/undo re-fold, witnessed | ✅ DONE 2026-07-30 (bim-ootb PR #1094, MERGED + LIVE-verified): `bonsai:refold` event + `_paintSel` repaint at the true choke point (+ shadow-flag re-apply, same root cause); witness `witness_e2e_sel_tint_refold.js` proven RED on unmodified main first, 9/9 with fix; W-E2E-CUT C6 now pixel-EXACT |
| 17 | O1 | Walk-ALL row reuses the singular tooltip | LOD400 §START HERE OPEN 3 | one string | ✅ DONE 2026-07-30 (PR #1094, LIVE-verified byte-fetch): conditional on `__ALL__` row; W-E2E-WALK-ALL A9 asserts both rendered titles |
| 18 | O1 | Terminal-scale proxy-mode downgrade silent to the user | LOD400 §START HERE OPEN 5 | toast/badge on the batch-hold fallback | ✅ DONE 2026-07-30 (PR #1094): once-per-run toast via existing `toast()`; B3 asserts n=1 where per-disc would be 4; A10 negative control 0 below threshold; walk-all suite 13/13. CACHE_VERSION v38→v39 same commit |
| 19 | O13 | `move-gizmo.png` recapture (wide shot amid close-up neighbors) — parked in the retired `GUIDE_VISUAL_QUALITY.md` lane | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` §NIGHT 1 | recaptured close-up, opened + live-verified | ✅ **CLOSED 2026-09-15 — see §SWEEP** (recaptured bim-compiler #73; live bytes sha `22a794f4`, 423,928 B) |
| 20 | O13 | one live-bytes sweep: guide screenshots + claims vs the LIVE site (all captures were localhost) | master §KNOWN TRAPS | content-hash/curl pass against live gh-pages | ✅ DONE 2026-07-30: `§GUIDE-LIVE-SWEEP imgs=33 bad=0` + `§GUIDE-LIVE-HASH checked=33 mismatch=0` — every live guide image byte-identical to origin/master; live page carries the new wall section (3 hits) |
| 21 | O1/O7 | multi-part window sibling-clustering as a BOM — creates NEW relations (an authoring act, not recovery) | LOD400 §NEW ARCHITECTURE QUESTION | design call | ⛔ BLOCKED: user's design call, unscoped |
| 22 | O9 | gate residuals: one-click revert of a RED · UBBL named checks · rtree prune at Terminal scale | `RESUME_MODELLER_CONFORMITY_GATE.md` §NEXT | each its own witness | verified-open (door-crush + abuts-realign + Save-gating SHIPPED — see stale-claims) |
| 23 | O10 | W-DW-DENSITY-TE D3 density drift (ELEC 94.3 / FP 92.0 / ACMV 94.8 vs ≥99%) — find what shifted, decide the band | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §RESOLVED note | re-run + named cause | ✅ **the named D3 drift is FIXED — see §SWEEP** (D3 ENVELOPE 100% on all four discs). Row re-pointed at the live finding the witness still prints: ELEC over-count 1754 vs oracle 833 = 2.11× |
| 24 | O5 | `smoke_arc_only.js` SampleCastle iteration produced no output/screenshot — flagged, never chased | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | root-caused or cleared | verified-open (flag only) |
| 25 | O14 | PBR texture maps (biggest lift) · per-instance hide + full virtualization · BCF IMPORT (export MVP shipped #620) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` items 9, §DECISIONS 2, §COMPETITIVE | — | verified-open (deferred by design, in this order) |
| 26 | O4 | solid-scale B-rep (occt `Copy=true` recompile or shape-lifecycle rework) | `RESUME_MODELLER_POLISH.md` 3b | — | ⛔ user-gated deferred ("only if authored-wall scaling becomes a real need") |
| 27 | O14 | accept an EXTERNAL (FreeCAD/neutral) IFC → snap to substrate → walkers complete it | `prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §4 | — | ⛔ BLOCKED: future feature, user greenlight |
| 28 | O15 | render-layer tilt gap: **293** tilted elements in the shipped `SampleCastle_ARC.db` (post-embed-8) measured rendering with IDENTITY transforms live 2026-07-10 — yet `§ARC-3AXIS` code exists on main (`arc_editable.js:231` passes rotX/rotY, `bonsai_library.js:78` applies the Euler); the branch is not firing on this data and nobody knows why | `GRID_ROTATION_GUARD.md` §5 | re-measure fids 933/1291/2514 on today's main; if still identity, trace why the tilt branch never fires; witness vs analytic 3-axis AABB | ✅ **DOES NOT REPRODUCE — CLOSED 2026-09-18, see §SWEEP.** W-ARC-3AXIS on all 293: seeded 293, genuinely rotated 230, **0 dropped**, against a 2,354-element control. The 2026-07-10 finding predates §GEO-SERVED (#1090), when the Modeller still drew boxes. Guarded by W-ARC-3AXIS (bim-ootb #1738) |
| 29 | O15 | ⛔ `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`: grid ⊗ BOM as ONE authoring substrate — spec-only, 3-stage build plan + 5 witnesses, 0 built (except W-TYPICAL-N 26/26 which already exists via `bom_extract`) | that file §STATUS/NEXT | — | ⛔ BLOCKED: user — is this still the intended architecture? (Watchdog-flagged 2026-07-30) |
| 30 | O15 | `WALL_HEIGHT_SCALE` cascade hardcodes `axis:'y'` as vertical (Y-up assumption, wrong for the Z-up Modeller) — dead code today (`isRoof` always false) but armed the day roof/ifcClass support arrives | `GRID_ROTATION_GUARD.md` §8 note | own design pass when roofs become grid-governed | deferred — documented in-code, in-file, and here |
| 32 | O1 | `witness_e2e_delete` D4 is RED on unmodified bim-ootb main — found (not caused) by the rows-16-18 session, diagnosed pre-existing, left untouched | rows-16-18 report 2026-07-30 (PR #1094 findings) | root-cause + fix or re-point the witness, RED-first discipline | ✅ **CLOSED — see §SWEEP.** bim-ootb #1704 (2026-09-10) routed soft-delete through the history tree; W-E2E-DELETE re-run 8 PASS / 0 FAIL, D4 green |
| 33 | O2 | **empty-slab refusal (Watchdog directive):** an empty layer slab must be a REFUSAL, not an announced row. Extractor: per-layer assertion `face_count > 0` in `compile_layer_geometry()`/witness — any empty slab ⇒ loud refuse (element stays gated RED), never ship partial; then re-slice the 2 affected 7-layer walls — root-cause first: the shipped diagnosis says the authored body spans 0.493 m of the 0.550 m set (§LAYER-PARTIAL, "layers belong to the neighbour wall"), the Watchdog hypothesizes opening-boolean-cut leaves last slices outside remaining material — MEASURE which is true on `2O2Fr$t4X7Zf8NOew3FNbT` before fixing; if the source genuinely doesn't author those layers' material there, the refusal stands and the wall is honestly RED until resolved | Watchdog live-query 2026-07-30 + `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §ROW33-EMPTY-SLAB-REFUSAL | witness gains per-row `face_count>0`; the 2 walls either 7 real slabs or loud RED; falsify by re-introducing an empty row | ✅ DONE 2026-07-30 (extractor half; W-LOD400-ENVELOPE **16/16**, RED-first: pre-fix code fails exactly the 4 new checks): root cause MEASURED — the Watchdog's opening-cut hypothesis is **FALSE** (both walls carry ZERO openings; an authored `IfcPolygonalBoundedHalfSpace` clip at the layer-4/5 boundary trims the neighbour-side stud+plasterboard — Revit unit-demising, material genuinely absent) → refusal stands per the directive; empty slab now raises `LayerRefusal`, `verify_layer_geometry` refuses `face_count<=0` rows, Duplex gate honestly RED 2/80 exit 1 BY DESIGN (like sporenkap — do not soften). Residents half ✅ SHIPPED same day (bim-ootb PR #1099): live `Duplex_geo.db` partial ship withdrawn — trimmed hashes reverted to original envelopes, geoV 4→5, sw v41→v42, W-E2E-LAYERS-RESIDENTS **8/8 vs LIVE** RED-first; the live Modeller refuses both walls loudly (`§LAYER-ENVELOPE-REFUSE` ×2, ops 196→194, hardfail 0/194). FULLY DONE**⚖ EXCEPTION RULING 2026-07-31 (user + Watchdog, supersedes the refusal end-state):** an honest whole-layer subset IS LOD400 ("legit material part of the wall… not a blocky fall back") — kept `face_count>0` per row, DROPPED count==layer_count; the two walls came BACK as 5 real slabs (bim-compiler #62: gate GREEN 0/80, W-LOD400-ENVELOPE 15/15 RED-first; bim-ootb #1102: geo v6, 196 meshes refused=0, W-E2E-LAYERS-RESIDENTS 8/8 vs LIVE). See §ROW33-EXCEPTION |
| 34 | O1/O8 | **NEXT SESSION START HERE — anchor export/save leak — the guardrail's unchecked surface (Watchdog directive):** anchors are proven invisible to render/Outliner/picks/audits, but NOTHING checked whether the 65 phantom ops leave in an EXPORT — `bonsai_ifc.js` IFC export and `sdg_save.js`/`saveModelDb` physical snapshot both fold from the op-log where `commitSeedGroup ops=3290` includes them | Watchdog 2026-07-30; guardrail spec in `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §START HERE OPEN 1 (✅ APPROVED block — "every count" includes exports) | witness: IFC export + Save snapshot with anchors present are element-identical to pre-anchor baseline (or anchors explicitly excluded + §ANCHOR-tagged in both paths); RED-first against current main | verified-open (gap confirmed unchecked by PR #1095's own witness list) |
| 31 | O15 | oblique (non-orthogonal) grids — the scale-hardening lane's one genuinely open question; a NEW feature never requested | `GRID_ROTATED_SCALE_HARDENING.md` §3 | — | ⛔ BLOCKED: user interest; do not build unasked |

### STALE-CLAIMS — verified SHIPPED on origin/main; do NOT re-open (grep-verified 2026-07-30)
- **O12 zoom-to-selection**: SHIPPED — `§ZOOM-SEL` (#711), `modeller.html:1057`, `witness_e2e_zoom_to_selection.js` exists. The triage's "small, well-specified" read was stale.
- **O8 Save = CompleteIt-shaped**: SHIPPED — `sdg_save.js` + `modeller.html:2539-2690` (auto-heal, RED block, heal-induced clarity, 'Clean, saving…'), witnesses `witness_e2e_save.js`/`witness_e2e_save_blocked_focus.js`. DocAction question ANSWERED in code: Save does NOT call `erp/ad_docfsm.js` (mirrors its Error/Clean contract only) — `sdg_save.js:8`.
- **O11 op-log autosave quota**: SHIPPED — IndexedDB fallback (`§AUTOSAVE_FIX`, `bonsai_oplog.js:25-26`, `witness_e2e_autosave_idb_fallback.js`).
- **door width/crush RED**: SHIPPED — `sdg_gate.js:99` + witness A7 (the GRAPH file's "still missing" is stale).
- **backprop first slice**: abuts-realign ORANGE flags SHIPPED (#647) — only the accept-gated APPLY remains (row 9).
- **World History wiring**: SHIPPED — mount at `modeller.html:221` + `witness_modeller_worldhist_pill.js`.
- **disc-walker envelope-bound + yaw render**: SHIPPED — envelope-bound cells + `§DW-CAP` (`disc_walker.js:644-673`), `§DW-ROT-UNIT` yaw fix (`modeller.html:4053-4058`); guide Walk-ALL section re-landed (`docs/ModellerGuide.md:493`).
- **O6 anchor semantics**: DONE (PR #613, W-ANCHOR-SWEEP 15/15). Its parked "viewer can't stream a raw modeller extraction (`elements_meta.building` missing)" note: fixed at source, bim-compiler `dcd5260e9`/`74e0e3551` (§KUL001).
- **§LODHELL-FIX-2 dead no-boolean tier**: DELETED (`extractIFCtoDB.py:1179` records the deletion).
- **O4 direct-manipulation spine + H1 top-view Z-drag + polish batch**: all shipped (PRs #423-#631 arc) — the 2026-07-07 correction in `MODELLER_DIRECT_MANIPULATION.md` already said so; re-confirmed.
- **Resident roster changed under the triage**: RESIDENTS is now EIGHT per-building split entries (SH/DX/SC/HHS/Clinic/Hospital/Garage/Terminal, each `geoDb` on object storage, `str_walker_outliner.js:51-58`) — any older "4 residents"/"mesh.db" wording in the 15 files is historical.

**O15 stale-claims (grid family, verified 2026-07-30 — grep/sqlite against origin/main, do NOT re-open):**
- **Smart element scope**: SHIPPED — `_STRUCTURAL_CLASSES`/`_localityRadius` (`bonsai_gridmove.js:64/109`) + `witness_gridmove_smart_scope.js` on main. The triage's "harvest — 10 open" was stale; the file's own §4 records DONE 2026-07-09.
- **Green/orange pre-drag preview**: SHIPPED — `toggleOverride`/`applyOverrides` in `bonsai_gridmove.js` + `witness_e2e_grid_greenorange.js`.
- **Clear-state-leak rounds 1+2**: SHIPPED — all three `onClear()` wires live in `bClear.onclick` (`modeller.html:516`) + `witness_grid_clear_leak_round2.js`. The round-2 file's "PR TBD" resolved: it landed. Its cross_edges anchor-correction fork was ALSO resolved separately — PR #650 (real per-element AABB).
- **Tilt-guard + axis-scope**: MERGED as PR #722 (squash `3252d50`) — `_hasTilt`/`tiltXRad` + the x/y/z skip are on main, `witness_grid_tilt_guard.js` shipped, `W-GRID-SCALE-YAW-HARDENING` 21/21. The file's own §6-§9 "not merged, per instruction" is stale (it predated the push-pause lift). The remote branch `fix/grid-tilt-guard` is now redundant.
- **Kinematics sandbox**: all four tiers + the §3 worker-fold gap DONE 2026-07-09 per its own §5; `witness_grid_rotation_guard.js`/kinematics witnesses on main.
- **Scale hardening**: MERGED PR #721; only its §3 (oblique grids, row 31) stays open.

Rules that produced this list (keep for the next harvest):
- **Verbatim, with its home.** Never paraphrase an open item away from its file/section pointer.
- **Verify before listing.** A file claiming something is open may be stale — check the shipped code
  first (that mistake has already been made here: a 21-commit-stale checkout made shipped code read as
  missing). Mark each row `verified-open` or `stale-claim`.
- **Contradictions are findings.** Where two files disagree, list both and say which the code supports.
- **Live-vs-local is a first-class check** for anything user-visible — see §PRIME LESSON.
- **WORK-TO-ZERO** (`CLAUDE.md`): work top-to-bottom, never stop to report "parked", never loop on a
  blocked item — mark it `⛔` with the ONE question and move to the next.

## 🚧 KNOWN TRAPS — do not rediscover these
- **`console.warn` is invisible** in DevTools' default filter. Failure paths use `console.error`.
- **A 12-triangle mesh is not proof of a fake box.** A plain extruded rectangle IS 12 triangles. But a
  fake box CANNOT carry a door/window cut — that is the real discriminator.
- **Both a fake proxy box and a plain wall's real shape are 12 triangles**, so the 2026-07-02 fake-box
  fix looked dramatic on SampleCastle and invisible on Duplex. Neither observation is a regression.
- **Guide screenshots were taken on localhost.** They are not evidence about the live site.
- **`disc_walker.dwInit` defaults to `terminal_rules.db`** — a residential caller must pass
  `duplex_rules.db` (Walker Doctrine, `CLAUDE.md`).
- **Never edit the shared `~/bim-ootb` checkout** — a PreToolUse hook blocks it. Work in a `/tmp/wt-*`
  worktree, and reuse an existing one (`git worktree list`) before creating another.
- **DB changes ship as a SQL patch + self-heal loader, never a committed binary** (`CLAUDE.md`).

## ▶ §IFC-EXPORT-SEED — SPEC for row 36 (2026-09-18). Written before any code.

**MEASURED DEFECT, not inferred.** Open Duplex — 196 elements on screen — then call `Bonsai.ifc.build()`:

```
§OPLOG      {"GEOM_INSERT":196}  total=196
§ON-SCREEN  meshes=196
§EXPORTED   {"walls":0,"openings":0,"rels":0,"arrays":0,"bytes":592}
```

**592 bytes. Zero products.** A user who opens a resident and picks Export ▸ IFC gets an empty IFC4 file
with a header and nothing else. `bonsai_ifc.js build()` branches on exactly three op types —
`GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142) — and **every ARC-seeded element is a
`GEOM_INSERT`** (`arc_editable.js:342`). The three handled types match zero ops in a real resident.

### What to build
Handle `GEOM_INSERT` in `build()`. Per element, emit one IFC product typed from `params.ifc_class`.

**Geometry: reuse the RENDERER'S OWN vertices — do not re-derive the transform.** This is the direct
lesson of §XEDGE-GEOWIRE, learned today at the cost of 843 wrong edges: `cross_edges.js` re-implemented
"world = centre + R·vert", called it "the same final numbers, fewer steps", and was wrong for 798 of 934
elements. The folded scene meshes already carry **world-space positions baked into the geometry** —
measured: every mesh's `matrixWorld` is identity and `geometry.boundingBox` equals
`Box3.setFromObject`, max delta `0.000e+0` over 3,290 meshes. So the export reads
`mesh.geometry.attributes.position` for the fid and emits those coordinates verbatim. Byte-parity with
what the user sees is then structural, not something a witness has to chase.

**Encoding:** `IfcTriangulatedFaceSet` over an `IfcCartesianPointList3D` — both confirmed present in the
vendored web-ifc build, along with every class below. This is IFC4's native triangle-mesh form; no
tessellation, no approximation.

**Class map** (`params.ifc_class` → entity), extracted from the resident, never invented. Duplex's real
census: `IfcWallStandardCase` 56 · `IfcFurnishingElement` 61 · `IfcSlab` 21 · `IfcWindow` 24 · `IfcDoor`
14 · `IfcCovering` 13 · `IfcRailing` 4 · `IfcStairFlight` 2 · `IfcWall` 1. An unmapped class falls to
`IfcBuildingElementProxy` — the honest IFC answer for "a real product whose specific type this exporter
does not model", and it is COUNTED and `§`-logged, never silent.

### Binding constraints
1. **Anchors are excluded.** `params.anchorOnly` elements are invisible ride anchors; the user's binding
   condition is that they stay out of EVERY count, pick, audit — and an export is an audit. Duplex has 0,
   SampleCastle has 65, so this is not theoretical. Skipped and counted separately.
2. **No silent substitution.** An element whose mesh cannot be resolved is NOT quietly emitted as a
   bounding box. It is counted and named in the `§IFC-SEED` line. A box standing in for authored geometry
   is the §PRIME LESSON fault this file opens with.
3. **The three existing op types keep working byte-identically.** `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/
   `GEOM_ARRAY` and their witness (`W-IFC-ROUNDTRIP` via `reimport()`) are untouched.

### The witness — W-IFC-EXPORT-SEED
Claims, each naming the issue it proves:
- **E1 NOT-EMPTY** — exporting Duplex yields > 0 products. RED today at exactly 0/592 bytes.
- **E2 COUNT-EXACT** — products == non-anchor `GEOM_INSERT` ops. Not "> 0": the exact number, so a
  partial export cannot pass.
- **E3 REAL-GEOMETRY** — re-import the emitted bytes and assert the triangle count of a named element
  matches the scene mesh's. Proves shapes, not just product rows.
- **E4 ANCHORS-EXCLUDED** — on SampleCastle (65 anchors), products == ops − 65.
- **E5 NO-BOX-SUBSTITUTION** — the `§IFC-SEED` line's fallback count is 0 on Duplex (196/196 resolve), and
  any non-zero value is reported, never hidden.

### Out of scope, stated so it is not mistaken for done
Materials/colours, property sets, spatial hierarchy (`IfcRelContainedInSpatialStructure`), and re-cutting
openings as `IfcOpeningElement` against seeded hosts. This slice makes the export carry the building's
real shape; it does not make it a fully-furnished IFC. Row 36 stays open until that is stated in the row.
