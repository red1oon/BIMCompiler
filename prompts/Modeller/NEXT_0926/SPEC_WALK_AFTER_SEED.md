<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §WALK-AFTER-SEED: a Walk never runs before the building's ARC seed is committed
SCOPE: bim-ootb `modeller/str_walker_outliner.js` (_forkEditable/_seedArcEditable) + `modeller/modeller.html` (discWalk,
discWalkAll). Found while retargeting W-ROUTE-PATTERN-BRIDGE (NEXT #1). Read the log after every run. Spec 2026-09-26.

## Measured (main 9325eb6d, probe scratchpad/probe_walkrace.js — real Open, 50 ms polling)
| resident | Walk row + walker ready | ARC seed committed | window |
|---|---|---|---|
| Duplex | 234 ms | 4,663 ms | **4.4 s** |
| Terminal | 2,125 ms | 26,084 ms | **24.0 s** |
A Walk in that window signs its rows BEFORE the building's own seed rows, and the seed's re-fold then drops the walk layer
(W-ROUTE-PATTERN-BRIDGE: tubes 1 at T+400 ms, seed fold at T+589 ms, layer gone, `before.oplogLen=0`).

## Change
- `_forkEditable` (an Open) sets `window.__arcSeedReady` = a pending promise, resolved when `_seedArcEditable` finishes —
  success, failure or early return (a failed seed must not hang the walk forever). §WALK-AFTER-SEED logged.
- `discWalk` / `discWalkAll` await it first; while pending the status says "waiting for <building> to finish loading…" and
  `§WALK-AFTER-SEED waited=<ms>` is logged. No open in flight → no wait (resolved promise), today's behaviour.

## Witness W-WALK-AFTER-SEED (`modeller/tests/witness_e2e_walk_after_seed.js`, Duplex)
- W1 EARLY — click Walk PLB as soon as the walker is ready (before the seed): the seed's rows come BEFORE every walk row in the
  op-log (min walk id > max arcseed id). Base must be RED.
- W2 LAYER — after both settle, the PLB tubes are on screen (dwRoot has PLB chain tubes > 0).
- W3 WAITED — `§WALK-AFTER-SEED waited=` > 0 logged (the early click really hit the window; else VOID).
- W4 NO-ERROR. Regression: W-WALK-GESTURE, W-E2E-WALK-ALL, W-ROUTE-PATTERN-BRIDGE, W-MEP-OPENPATH (base vs fix).
