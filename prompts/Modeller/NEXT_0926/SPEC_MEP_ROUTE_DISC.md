<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §MEP-ROUTE-DISC: route + sign ACMV / FP / ELEC on the real Walk path
SCOPE: MODELLER_MASTER §RESUME 2026-09-26 NEXT #4. Today a Walk places all four disciplines but only PLB is
routed and signed: `_RW_PATTERN_DISC = { PLB: ['CW','SP'] }` (disc_walker.js:1448) and `ad_mep_pattern`
(mep_rw.db) holds CW/SP rows only; `RW_REAL_CROSSSECTION` (routewalker.js) holds CW/SP/FP. Non-invent: every
pattern step and every cross-section below is EXTRACTED from a real IFC and cites its source rows, the same
way CW/SP were (IFCtoERP.java seedMepPatterns, mined counts off Terminal; L3 measured Duplex pipes).
Read the log after every run. Uncommitted scratch; the commit messages carry the same provenance.

## Method (fixed before any code)
- Pattern rows are authored the way CW_TERMINAL_01/SP_TERMINAL_01 were: axis-dominance counts of the
  discipline's REAL straight segments in the Terminal (bim-ootb `buildings/Terminal_extracted.db`, SJTII_Terminal,
  all 568 ducts and 3,821 pipes have rotation_z = 0, so the AABB long axis IS the run axis), node roles from
  measured adjacency (nearest real element), never from domain guesswork.
- A step is written only when the source shows it. A step the source does not show is a GAP, listed for red1.
- Cross-section = the MODE of the two short AABB extents over all straight segments of the cited type (L3's
  method), registered as ONE product per discipline (stated simplification), cited by guid.
- The pairing engine (`_rwPairSegments`) is NOT touched (09-26 trap: no next-nearest). The bridge's post-filter
  half-width becomes max(existing 0.0375 m, real half-section) so PLB's numbers cannot move.
- One discipline per commit, order = best data first: FP → ACMV → ELEC.

## Baseline (unmodified origin/main 1069c70c, same tree) — MEASURED 2026-09-26 00:39–00:43, scratchpad/base/witnesses.log
W-MEP-OPENPATH 13/0 (Duplex, SampleCastle, Terminal): PLB runs 18 / 18 / 2,915, signed 18 / 18 / 60; ACMV/ELEC/FP
segs 0 everywhere. Bridge log: ACMV/ELEC `REFUSE … pattern table not loaded (call rwInit first)` (Walk-ALL walks
them BEFORE PLB, and modeller.html awaited rwInit for PLB only), FP `REFUSE no ad_mep_pattern coverage`.
W-MEP-REROUTE 5/0 · W-WALK-GESTURE 4/0 · W-E2E-WALK-ALL 13/0 (A6 oplog 196→402, +21 fittings/sweeps).
Walk-ALL wall time: Duplex 9.2 s · SampleCastle 25.6 s · Terminal 73.3 s.

## D1 RESULT (measured 2026-09-26 00:47–00:53, scratchpad/d1/) — FP routes and signs
| resident | FP placed | FP runs | FP signed | PLB runs/signed (held) | walk s |
|---|---|---|---|---|---|
| Duplex | 46 | 7 (14 survivors, 7 post-filtered) | 7/7 | 18/18 | 7.2 |
| SampleCastle | 126 | **0** (381 attempts, 373 killed by routewalker's own clash-skip, survivors post-filtered) | 0 | 18/18 | 21.6 |
| Terminal | 1,102 | 623 (run median 4.0 m, p95 14.0, max 36.6) | 60 (DW_CHAIN_COMMIT_CAP) | 2,915/60 | **142.0** |
W-MEP-REROUTE 5/0 · W-WALK-GESTURE 4/0 · W-E2E-WALK-ALL 13/0 (A6 +28 = the 7 FP sweeps, intended).
- SampleCastle FP 0 is the engine's own clash-skip (the L2 note: routewalker drops ~95% of pairs on SampleCastle;
  PLB gets 18 there the same way). NOT "improved" (09-26 trap). Gate M5 encodes it as EXPECTED 0 with the bridge's
  new `kept/survivors@anchors` log figure, so it flips red if the engine's behaviour changes.
- Terminal +69 s is NOT the bridge (probe: routePattern FP 786 ms, PLB 1,499 ms, ARC+STR envelope 5,432 anchors); it
  is a SECOND occt-bounded signed chain commit (60 sweeps + fold + verify at 38k rows). NEXT #3's lane
  (DW_CHAIN_COMMIT_CAP, other agent), recorded here, not tuned. W-E2E-WALKALL-TERMINAL-SCALE has no wall gate
  (T3 = completes within 1,140 s; T5 = "(1 signed group)", which FP's commit line carries).

## D1 — FP (sprinkler): product EXISTS, pattern mined from Terminal
**Product (already registered):** `FP_Drop_Pipe`, 21.33 × 21.34 mm, component_library.db component_definitions
id 17673 (verified 2026-07-07). Cross-check today: Terminal `Pipe Types:jkrME_pipe_Poly Steel` 2,672 straight
segments, section mode 21.3 mm (849 = 445 + 404) then 33.4 mm (743) — the registered product IS the mode.
**Which Terminal pipes are FP (measured, not assumed):** for all 909 IfcFireSuppressionTerminal the nearest
IfcPipeSegment is Poly Steel (909/909, median gap 0.053 m, p95 0.106 m). For the 256 IfcFlowTerminal (PLB
fixtures) it is UPVC 237 / HDPE 13 / ABS 3 / VCP 2 / Poly Steel 1. UPVC+HDPE+ABS+VCP = 1,075 ≈ the 1,074
(CW 619 + SP 455) IFCtoERP.java attributed to CW/SP. bim-compiler migration_phase_B1_placement_terminal.sql
also labels Poly Steel fittings discipline='FP'.
**Pattern FP_TERMINAL_01 (source_building SJTII_Terminal, building_type TERMINAL):**
| seq | from → to | axis | source count |
|---|---|---|---|
| 10 | METER → JUNCTION | X | 17 valves whose nearest pipe is Poly Steel: 12 IfcFlowController `jkrME_pip-ac_gate valve_25mm - 50mm` (7 × 2", 5 × 1") + 5 IfcValve `gate valve_ flanged_3''-6''` |
| 20 | JUNCTION → JUNCTION | X | 1,092 X-dominant Poly Steel segments (e.g. T0_Terminal_2OkdVb6dv6$8Mij3nPAUBV, 6.509 m, 33.4 mm) |
| 30 | JUNCTION → JUNCTION | Y | 380 Y-dominant Poly Steel segments |
| 40 | JUNCTION → FIXTURE | Z | 1,205 Z-dominant Poly Steel drops (median 0.103 m, p95 0.491 m; e.g. T0_Terminal_3vd2r0Uuv9WPbLeq8saPPE 1.18 m, 21.3 mm) to 909 heads |
METER role on a resident = the seed door (service-entry proxy, same heuristic CW uses; human-confirmable).
**Change:** `_RW_PATTERN_DISC.FP = ['FP']`; 4 rows in mep_rw.db; `MEP_RW_DB_URL` ?v=2 → ?v=3 (IDB key);
modeller.html `_discWalkOne` awaits `_rwReadyOnce()` for every pattern-covered disc (today PLB only).
**Done when:** W-MEP-OPENPATH shows FP segs > 0 on Duplex, SampleCastle, Terminal, tubes == segs, and ≥ 1
GEOM_SWEEP with `_dw.disc = 'FP'` in the signed op-log (crossSection FP_Drop_Pipe). PLB numbers unchanged.
**Regression risk:** Terminal Walk-ALL time (one more bridged discipline, 1,102 FP fixtures); FP on residents
is BORROWED (dwBorrow) — placements carry Terminal storey names, `_bridgeIfEmpty` re-keys them (logged).

## D2 — ACMV (ducted air): pattern + product mined from Terminal ducts
**Product:** `Rectangular Duct:jkrME_duct_Radius Elbows / Taps` (420 straight segments; the other duct types
are Flex Duct Round 129, Mitered 18, Round 1). Section mode 150 × 150 mm (53; then 300 × 200 = 29, 300 × 250 =
21, 400 × 300 = 21). Cited instance: T0_Terminal_2xYwS5_$XEdxC3K5YP8DZ9 `…Radius Elbows / Taps:2502617`, Aras 02,
2.9935 × 0.15 × 0.15 m. ⚠ 150 × 150 is the branch/tap size (X 19 / Y 4 / Z 30 of the 53); mains run 300 × 200 up
to 1500 × 550. ONE product per discipline is the stated simplification (L3 precedent) — red1 question Q2.
**Pattern ACMV_TERMINAL_01:**
| seq | from → to | axis | source count |
|---|---|---|---|
| 10 | JUNCTION → JUNCTION | X | 204 X-dominant rectangular ducts; 713 IfcDuctFitting are the junction nodes (547 nearest a rectangular duct, median gap 0.578 m) |
| 20 | JUNCTION → JUNCTION | Y | 156 Y-dominant rectangular ducts |
| 30 | JUNCTION → FIXTURE | Y | 289 IfcAirTerminal fed by Flex Duct Round (157 nearest a flex, 111 of 129 flex are Y-dominant) or a rectangular tap (128 + 4; 60 Z-dominant rect taps) |
No METER step: the Terminal has no modelled AHU/plant element (no IfcUnitaryEquipment/IfcFan; ACMV = 289
IfcAirTerminal only), so a plant → main step has no source. GAP Q3.
**Change:** `_RW_PATTERN_DISC.ACMV = ['ACMV']`; 3 rows; `RW_REAL_CROSSSECTION.ACMV` = 0.15 × 0.15, product
`Terminal_Rect_Duct_150x150`, source cited. `_rwPairSegments`' clash margin uses the real 0.15 m for ACMV
(rwCrossSectionFor), the bridge post-filter half-width 0.075 m.
**Done when:** ACMV segs > 0 and ≥ 1 signed GEOM_SWEEP `_dw.disc='ACMV'` on the 3 residents; PLB/FP unchanged.
**Regression risk:** a 150 mm clash box refuses more runs than a pipe would (honest); Hospital ACMV = 5,126
fixtures — pairing is per storey, O(junctions × fixtures).

## D2 RESULT (measured 2026-09-26 01:02–01:08, scratchpad/d2/) — ACMV routes and signs
| resident | ACMV placed | ACMV runs | ACMV signed | FP (held) | PLB (held) | walk s |
|---|---|---|---|---|---|---|
| Duplex | 19 | 8 (8/8@82) | 8/8 | 7/7 | 18/18 | 21.3 |
| SampleCastle | 12 (all window-bound) | **0** (0/0@48: 0 survivors of routewalker's clash-skip at the 150 mm section) | 0 | 0 | 18/18 | 52.7 |
| Terminal | 1,375 | 807 (807/811@4,723; median 3.2 m, p95 10.3, max 17.0) | 60 (cap) | 623/60 | 2,915/60 | >182 (see below) |
- Terminal `walked=false` in this run was the INSTRUMENT: puppeteer's 180 s protocolTimeout fired while the page sat in a
  signed chain commit (walk 182.5 s at the reject; every §ROUTER-CHAIN-COMMIT line is present, 0 pageerror, chain OK).
  Fixed in the witness (protocolTimeout 900 s, __dwAllDone wait 600 s, [+s] stamps on captured lines) and re-run (d2b/).
- MEASURED with [+s] stamps (d2b, 01:10): Terminal Walk-ALL = 129.9 s (base 73.3 s). Bridge ≈ 3 s per discipline; each
  SIGNED chain commit 17–27 s (ACMV route +3.2 s → commit done +22.3 s · FP +41.7 → +68.1 · PLB +75.6 → +102.6). The
  142 s (D1) and 182 s (D2 first run) figures were inflated by the instrument stall. Cost driver = the occt-bounded
  signed chain commit (DW_CHAIN_COMMIT_CAP = 60 per discipline) — NEXT #3's lane. For red1 / the cap owner: keep 60
  signed per discipline (~2.5 min Terminal Walk-ALL with 4 signed networks) or lower the cap.

## D3 — ELEC (conduit): product from Duplex EMT; pattern = feeder/mains ONLY (no fixture step in any source)
**Product:** Duplex federated MEP (`build/Duplex_mep_extracted.db` ← reference/residential/Ifc2x3_Duplex_Federated.ifc,
build/logs/extract_duplex_mep.log): 10 straight `Conduit with Fittings:Electrical Metallic Tubing (EMT)`
IfcFlowSegment, section 29.5 × 29.5 mm on 10/10 (1" EMT OD). Cited instance: guid 3qI03Xhmj12QySDYgBoGRD
`…(EMT):575511`, 9.0962 m run. Product `Duplex_EMT_Conduit_29`.
**Pattern ELEC_DUPLEX_01 (source_building Ifc2x3_Duplex, building_type DUPLEX):** the 10 conduits + 8 `Conduit
Elbow - Steel` + 2 IfcFlowTerminal `400 A` panels (0dJKPQcDL7OOA9T2YsJr1q, 1K7eM1Qof1dOc9$mY9I4DR) form a
feeder: panel → 0.79 m rise (2 Z-dominant at z 1.83, one beside each panel) → ceiling runs at z 2.774
(Y-dominant 9.10 / 3.50 / 2.90 m, X-dominant 6.22 m) → 2.82 m risers (2 Z-dominant) → sub-slab runs at z −0.37
(X-dominant 0.64 / 1.60 m).
| seq | from → to | axis | source count |
|---|---|---|---|
| 10 | METER → JUNCTION | Z | 2 panels (400 A) each with a 0.79 m Z-dominant rise |
| 20 | JUNCTION → JUNCTION | Y | 3 Y-dominant ceiling runs at z 2.774 |
| 30 | JUNCTION → JUNCTION | X | 3 X-dominant runs (6.22 ceiling; 0.64, 1.60 sub-slab) |
**No JUNCTION → FIXTURE step:** the Duplex IFC wires no branch circuit to its 47 receptacles / 14 switches /
lights, and the Terminal has no cable containment at all (ELEC = 814 IfcLightFixture + 19 appliances). So ELEC
routes and signs its MAINS only; fixture drops are a GAP (Q4), not a step I may author.
**Change:** `_RW_PATTERN_DISC.ELEC = ['ELEC']`; 3 rows; `RW_REAL_CROSSSECTION.ELEC` = 0.0295 × 0.0295.
**Done when:** ELEC segs > 0 (mains) and ≥ 1 signed GEOM_SWEEP `_dw.disc='ELEC'`; others unchanged.
**Regression risk:** none beyond walk time; n = 10 is a small sample — disclosed in the row notes.

## D3 RESULT (measured 2026-09-26 05:47–05:56, scratchpad/d3/) — ELEC routes + signs MAINS where junction hops survive
| resident | ELEC placed | ELEC runs | ELEC signed | ACMV / FP / PLB (held) | walk s |
|---|---|---|---|---|---|
| Duplex | 102 | **0** (0/0@283 — no junction→junction hop survives routewalker's clash-skip; CW's same steps give 2/2 here) | 0 | 8/8 · 7/7 · 18/18 | 27.9 |
| SampleCastle | 270 | 7 (7/7@868; median 0.30 m, max 1.03 — short corridor hops) + 4 bend fittings | 7/7 | 0 · 0 · 18/18 | 30.1 |
| Terminal | 896 | **0** (0/0@4,231) | 0 | 807/60 · 623/60 · 2,915/60 | 119.3 |
W-MEP-REROUTE 5/0 · W-WALK-GESTURE 4/0 · W-E2E-WALK-ALL 13/0 (A6 +36 = 7 FP + 8 ACMV sweeps + fittings). sw.js v48 → v49.
**Where the walk time goes ([+s] stamps, two runs of the final tree, d3/ and d3b/):** every bridge is 0.2–1.3 s (PLB's own
routePattern on Terminal 13–20 s, as before); each SIGNED chain commit is the only added cost — Terminal ACMV 10–15 s,
FP 12–25 s, PLB 13–20 s; Duplex ≤ 1–9 s each. Wall time on the SAME tree varied 2× with machine load (Terminal 69.8 s vs
119.3 s; Duplex 7.9 vs 27.9 s; base single run 73.3 / 9.2 s), so no regression is claimed. The commit cost is
DW_CHAIN_COMMIT_CAP's lane (NEXT #3), recorded, not tuned here. Final gate run (d3b): W-MEP-OPENPATH 30/0.

## Witness — W-MEP-OPENPATH extension (modeller/tests/witness_mep_openpath.js)
New gates, each naming the issue it proves (per resident × disc ∈ FP, ACMV, ELEC):
- `M5 ROUTED-<disc> <resident>` — a user Walk routes ≥ 1 <disc> run through the pattern bridge (NEXT #4;
  RED on main: `REFUSE no ad_mep_pattern coverage`).
- `M6 SIGNED-<disc> <resident>` — ≥ 1 <disc> run is a GEOM_SWEEP in the signed op-log carrying that
  discipline's cited product (RED on main: nothing to sign).
- `M7 PLB-HELD <resident>` — PLB segs / sweeps equal the recorded baseline (18/18, 18/18, 2915/60): proves the
  new disciplines did not move PLB (the 09-26 pairing trap, the half-width guard).
M0–M4 unchanged. Printed lines now include `§WALK disc=<every disc>` and `§WALK-PATTERN` for all discs.

## Regression set (run on base and on each commit)
W-MEP-OPENPATH (3 residents) · W-MEP-REROUTE · W-WALK-GESTURE · W-E2E-WALK-ALL. Numbers may move only where
this spec says (new disciplines' segs/sweeps; W-E2E-WALK-ALL A6 counts op-log rows, so its total may rise).

## Out of scope (recorded, not done)
Re-route signing / DW_CHAIN_COMMIT_CAP (another agent's branch) · str_walker_bridge.js · IFCtoERP.java seed
(bim-compiler; the same rows should be added there so a re-extract does not drop them — follow-up) ·
viewer/routewalker.js copy.

## Questions for red1
Q1 FP METER = seed door (as CW). The Terminal's FP control valves are 17 real elements; on an ARC-only resident
   there is no such element, so the door proxy stands in. Confirm or name a better proxy.
Q2 ACMV product: the mode is 150 × 150 mm (branch size). Keep the mode, or choose a mains size (300 × 200, 2nd)?
Q3 ACMV has no plant → main step (no AHU in the Terminal). Accept mains + drops only?
Q4 ELEC has no fixture step in any real source. Accept mains only, or authorise a JUNCTION → FIXTURE step
   as a data decision (it would be an authored step, not a mined one)?
