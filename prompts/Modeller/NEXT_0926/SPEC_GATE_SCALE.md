<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §GATE-SCALE: the edit gate must survive a Terminal-scale multi-element edit (row 22 part 3)
SCOPE: bim-ootb `modeller/sdg_gate.js` evaluate() clash/clearance loop. Read the log after every run. Spec 2026-09-26 before code.

## Measured (main 9325eb6d, real Terminal open, 35,552 gate boxes, 72,280 abuts; probe scratchpad/probe_gatecost.js)
| moved | evaluate() |
|---|---|
| 1 | 29–56 ms |
| 10 | 288 ms |
| 100 | 2,898 ms (50 RED / 140 ORANGE) |
| 300, 1000 | **throws `RangeError: Too many properties to enumerate` at `sdg_gate.js:58`** |
Cause: `seen[key] = 1` records EVERY visited (moved, other) pair as a string key — moved × all = 10.7 M keys at 300.
`_runGate` runs inside the edit's `try` (`commitMove`, grid-move, room-move, item-drag), so a big edit on Terminal commits
and then reports FAIL with no gate result. Duplex (196 boxes) is 1–5 ms — never hits it.

## Change (same results, fewer comparisons)
- Every RED (`penetration(after) > clashTol`) and ORANGE clearance (`faceGap(after) < clearance`) needs the two AFTER
  boxes within `pad = max(clearance, clashTol)` on every axis. So candidates for moved `m` = boxes whose after-AABB
  intersects `after[m]` grown by `pad` — found through a uniform XY grid over `after` (built once per call; boxes spanning
  more than 256 cells go to an always-checked list). Z and the exact tests run unchanged on the candidates.
- Candidates are visited in `Object.keys(after)` order (sorted by position), so red[]/orange[] come out in the SAME order.
- Pair dedup without `seen`: a pair where both ends moved is evaluated only from the one that comes first in `moved`
  (a repeated fid in `moved` is processed once) — exactly the pairs the old `seen` let through.
- `opts.bruteForce = true` keeps the old loop, for the witness's parity check only.

## Witness W-GATE-SCALE (`modeller/tests/witness_gate_scale.js`, real Terminal + Duplex open)
- S1 PARITY — Duplex: all boxes moved +0.3 m, 1 / 10 / all moved: indexed result deep-equals brute force.
- S2 PARITY-TERMINAL — 1 / 10 / 100 moved: indexed deep-equals brute force (same red/orange, same order).
- S3 SCALE — Terminal 1,000 moved: no throw, under 5 s (base: RangeError).
- S4 NOT-VACUOUS — S2's 100-moved case has ≥1 RED and ≥1 ORANGE (else INCONCLUSIVE).
Regression: W-SDG-GATE, §GATE-SMOKE, W-ORANGE-ACCEPT, W-RED-REVERT, W-SAVE-COMPLETEIT (base vs fix).
