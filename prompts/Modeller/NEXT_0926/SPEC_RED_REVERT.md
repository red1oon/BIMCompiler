<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §RED-REVERT: one-click revert of an edit the gate flags RED (MODELLER_MASTER row 22, part 1)
SCOPE: bim-ootb `modeller/modeller.html` `_runGate` RED branch + a witness. Read the log after every run. Spec 2026-09-26 before code.

## State (main b93384cf)
`_runGate` REPORTS a RED ("⛔ N conformity violation(s): clash…") and the signed op stands (RESUME_MODELLER_CONFORMITY_GATE
§NEXT: "one-click REVERT of a RED edit (today: reports, op stands)"). Every gated edit (move, grid-move, room-move,
item-drag) is ONE history node, so the revert IS one Ctrl+Z — no new op type.

## Change
The RED toast carries a **Revert** button (the `toast` action slot from §ORANGE-ACCEPT). It calls `doUndo()` (the real
Ctrl+Z path: history tree + walk-layer redraw) ONLY if that edit is still the latest state — token = op-log length +
active-row count captured when the gate ran. Anything changed since → no undo, toast "already changed — use Ctrl+Z".
Log `§RED-REVERT reverted=<bool> reason=…`. Ignore = let the toast go (op stands, today's behaviour).

## Witness W-RED-REVERT (`modeller/tests/witness_e2e_red_revert.js`, Duplex, real click)
§GATE-SMOKE's recipe: drive element A onto the most-separated B through `__commitMove` → RED.
- V1 PRE — `__lastGate` RED and the toast has a Revert button (else VOID).
- V2 REVERT — click Revert: A's box back to pre-edit (±1 mm), the edit's row undone, op-log verifies.
- V3 STALE-GUARD — make a RED edit, then another edit, then click that RED toast's Revert: nothing undone (active count
  unchanged), `§RED-REVERT reverted=false`.
- V4 NO-ERROR. Regression: §GATE-SMOKE, W-SDG-GATE, W-ORANGE-ACCEPT (base vs fix).
