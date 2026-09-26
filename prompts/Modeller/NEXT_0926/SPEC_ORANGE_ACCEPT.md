<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §ORANGE-ACCEPT: accept an ORANGE suggestion at edit time (MODELLER_MASTER §OPEN LIST row 9)
SCOPE: bim-ootb `modeller/modeller.html` (`_runGate`, `runSave`, `toast`) + a new witness. Read the log after every run.
Spec written 2026-09-26 before any code.

## State (read from code, main 9bc2d3c8)
- Row 9's claim "applying not built" is half stale: **Save** already applies healable ORANGE — `runSave` →
  `SdgSave.planHeal` → `SdgSave.healOp` (+ hosted riders via `SdgCascade.ridersFor`) → ONE `commitGesture`, then a
  per-finding re-verify and ONE whole-scene re-evaluate (one hop, never chased) (`modeller.html:2821-2870`).
- At **edit time** `_runGate` (`modeller.html:2720`) toasts "⚠ N suggestion(s): … — accept or ignore", but nothing
  accepts: the toast has no control, the finding list is dropped. That is the missing half.

## Change
1. `_healOps(healable)` — the op-building block lifted out of `runSave` unchanged (heal op + hosted-by riders, deduped),
   returning `{ ops, riders, movedFids }`. `runSave` calls it; its behaviour and § lines are unchanged.
2. `_runGate`: keep `window.__gateOrange = SdgSave.planHeal(res.orange).healable` for the edit just made (cleared by the
   next gate run). When it is non-empty the ORANGE toast carries an **Accept** button (`toast` gains an optional
   `{ action: { label, fn }, ms }`; old calls unchanged). Ignore = let the toast go (no op).
3. `acceptOrange()`: `_healOps(__gateOrange)` → ONE `commitGesture` (one history node → one Ctrl+Z), per-finding
   `SdgSave.reverifyGap`, ONE `SdgGate.evaluate` over the result (new findings reported, never auto-applied). Logs
   `§ORANGE-ACCEPT fixed=N riders=M closed=[…] red=R orange=O`. RED is never applied (planHeal already excludes it).

## Witness W-ORANGE-ACCEPT (`modeller/tests/witness_e2e_orange_accept.js`, Duplex, real DOM click)
Fixture = the W-SAVE-BLOCKED-HEAL-INDUCED recipe without the swept third element: a real wall + a small unrelated
neighbour placed flush, a registered abuts edge, then the neighbour pulled 0.5 m away through `__commitMove` (the move
tool's commit path, so `_runGate` runs).
- A1 PRE — the edit raised exactly 1 healable `abuts-realign` and the toast shows an Accept button (else VOID).
- A2 ONE-OP — clicking Accept adds exactly ONE history node and one signed gesture group; chain verifies.
- A3 CLOSED — the pair's gap re-verifies closed (`§ORANGE-ACCEPT closed=[true]`).
- A4 ONE-UNDO — one Ctrl+Z restores the pre-accept boxes (±1 mm) and leaves the edit itself in place.
- A5 NO-ERROR.
Regression: W-SAVE-COMPLETEIT, W-SAVE-BLOCKED-HEAL-INDUCED, W-SAVE-BLOCKED-FOCUS, witness_sdg_gate (base vs fix).
