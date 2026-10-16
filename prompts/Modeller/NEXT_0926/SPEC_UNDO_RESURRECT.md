<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §UNDO-RESURRECT: a plain Ctrl+Y must never bring back a row a history node undid
SCOPE: MODELLER_MASTER §RESUME 2026-09-26b NEXT #4 ("undo a whole walk, new edit, Ctrl+Z/Ctrl+Y can resurrect one walk
row"). bim-ootb `modeller/bonsai_oplog.js` redo() + `modeller/modeller_history.js` _restore(). Read the log after every run.
Spec written 2026-09-26 before any code.

## Mechanism (read from code, main 9bc2d3c8)
- `oplog.redo()` (`bonsai_oplog.js:500`) reactivates the LOWEST-id undone row not in `_treeOwned`.
- A walk is ONE history node carrying its rows (§WALK-GESTURE); Ctrl+Z flips them `undone=1` by id (`setUndone`). They
  are not in `_treeOwned` (SPEC_MEP_SIGN kept walk rows out: W-DW-OPLOG / W-ROUTER-NNCHAIN pop ACTIVE walk rows with
  `oplog.undo()`).
- A plain edit (move = `oplog.commit(GEOM_MOVE)`, `modeller.html:2740`) is a node with NO rows → its Ctrl+Y calls
  `oplog.redo()` → the lowest undone row is the undone walk's first row, not the edit. Same class for a delete: rows a
  GEOM_DELETE node flagged undone sit below any later edit (the `_restore` comment at `modeller_history.js:113` names
  this case; the delete node itself was fixed, a later plain edit's redo was not).

## Change
Rows that an id-targeted history node has left UNDONE belong to that node until it re-applies them. `_restore` records
them in `O._treeUndone` (a Set) when its flip leaves them undone, and removes them when its flip makes them active.
`redo()` skips `_treeUndone` (same filter shape as `_treeOwned`). `undo()` is unchanged (those rows are already undone),
so W-DW-OPLOG / W-ROUTER-NNCHAIN's `oplog.undo()` on active walk rows is unaffected. Empty set = old pick, unchanged.

## Witness W-UNDO-RESURRECT (`modeller/tests/witness_undo_resurrect.js`, real keypress, Duplex)
- R1 walk PLB → Ctrl+Z: 0 walk rows active (precondition, = W-WALK-GESTURE G2).
- R2 move an ARC element (oplog.commit GEOM_MOVE, the move tool's call) → Ctrl+Z: the move row undone.
- R3 Ctrl+Y: the MOVE row is active again AND 0 walk rows active. **Base must be RED** (a walk row comes back).
- R4 delete an ARC element → move another → Ctrl+Z → Ctrl+Y: the move is active, the deleted row stays undone.
- R5 0 pageerror, op-log verifies.
Regression sweep base vs fix: W-WALK-GESTURE, W-MEP-REROUTE, W-GESTURE-UNDO, witness_e2e_delete, witness_e2e_dm_gridundo,
W-E2E-WALK-ALL, W-MEP-OPENPATH.
Known, not fixed: `_treeUndone` is not persisted across reload (same as the tree itself, SPEC_MEP_SIGN).
