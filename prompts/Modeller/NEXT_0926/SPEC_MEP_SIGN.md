<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC_MEP_SIGN (scratch, uncommitted). MODELLER_MASTER NEXT #2 + #3.
Scope: bim-ootb Modeller re-route/sign path only (modeller.html §MEP-REROUTE + _commitDiscChains/_commitDiscFittings,
modeller_history.js restore, bonsai_oplog.js undo/redo pick). Read the log after every run.

## Baseline (origin/main 1069c70c, measured 2026-09-26, this tree unmodified)
- W-MEP-REROUTE 5/0 · W-WALK-GESTURE 4/0 · W-GESTURE-UNDO 9/0 · W-MEP-OPENPATH 13/0.
- #2: a 1 m move of a routed Duplex PLB fixture re-routes 22 → 21 runs, drawn only. The op-log gets 0 new GEOM_SWEEP
  rows, 0 bend-fitting rows; the walk's 22 signed sweeps + 5 fittings stay active at the OLD route
  (log: "§MEP-REROUTE … unsigned runs").
- #3: Terminal PLB walk: 2,915 runs, 60 signed (cap). The task premise "occt 1.6-2 s per sweep" is STALE: that was the
  pre-batching per-commit loop; _commitDiscChains is already ONE signed group. Measured with a phase probe
  (scratch probe_terminal_sign.js, discWalk('PLB') alone):
  | building | cap | PLB walk wall | commitGroup | verifyChain | fold (occt) | signed |
  |---|---|---|---|---|---|---|
  | Terminal | 60  | 16.5 s | 0.19 s | 4.3 s | 8.0 s | 60 |
  | Terminal | all | 24.0 s | 0.44 s | 6.5 s | 12.4 s (2,915 sweeps built 3.4 s) | 2,915 |
  | Hospital | 60  | 69.6 s | 2.5 s | 15.1 s | 7.1 s | 60 |
  | Hospital | all | 123.2 s | 15.2 s | 27.1 s | 50.5 s (19,331 sweeps built ~43 s) | 19,331 |
  A later edit after signing all: Terminal move commit 4.3 → 5.3 s; later folds hit the op_hash cache (rebuilt=0).
  So the time is occt building each new sweep once (~1.2-2.3 ms each) plus hashing/verify that scales with rows.
  Nothing per-sweep is ~2 s any more.

## Change
### #3 — sign every run
- `DW_CHAIN_COMMIT_CAP` default 60 → Infinity (knob kept, window-scoped, so a witness can still shrink it).
- The proof is unchanged: every row is hashed into the chain and signed exactly as the 60 were; verifyChain unchanged.
  No batching trick that skips per-row hashing, signing or verify. (commitSeedGroup's verify:false was considered and
  NOT used: it would drop a check.)
### #2 — a re-route writes signed rows and re-derives bend fittings, as one gesture with the move
- After a re-route, the new network is DIFFED against the disc's active route rows (sweeps + fittings), matched within
  1 mm (op-log positions are rounded to 4 dp, so exact keys would re-sign the whole network on undo):
  unchanged rows stay; new runs + new fittings are committed as ONE signed group (gid `dwrr-<disc>-<n>`, same
  GEOM_SWEEP / GEOM_INSERT payload builders the walk uses — `_dwChainOp`, `_dwFitOp`); runs/fittings no longer in the
  route are superseded (`undone=1`, soft, the chain stays valid). Bend fittings come from the same
  `DiscWalker.bendFittings(disc, segs)` the walk calls.
- Undo/redo as one gesture: the rows are attached to the history node of the edit that caused the re-route (the move
  node): `onRows` (active on forward) + `offRows` (undone on forward); that node becomes id-targeted (its own ids in
  `rows`). No such node at the tip → the re-route gets its own "Re-route <disc>" node. After Ctrl+Z the diff finds the
  restored old rows already matching → no new commit.
- Kernel boundary undo()/redo() skip rows in `oplog._treeOwned` (the re-route's added + superseded rows), so a LATER
  plain edit's Ctrl+Z/Ctrl+Y cannot pop a re-route row or resurrect a superseded one. Walk rows are NOT added (witnesses
  W-DW-OPLOG / W-ROUTER-NNCHAIN pop them with oplog.undo() directly).
- No re-route while a walk gesture is open (a re-walk resets the disc's rows).

## Done-criterion (witness gates, each names its issue)
- W-MEP-REROUTE new gates: R6 SIGNED (after the move, every route run is an active signed GEOM_SWEEP matching the new
  route ±1 mm, ≥1 new row, verifyChain true) · R7 FITTINGS (active bend fittings == bendFittings(new route) count,
  re-derived) · R8 ONE-GESTURE (Ctrl+Z → exactly the walk's original sweep+fitting row set active, 0 re-route rows
  active; Ctrl+Y → the re-route set back; no extra rows committed by either).
- W-MEP-OPENPATH new gate M5 ALL-SIGNED: signed GEOM_SWEEP == routed runs on every resident (Terminal 60 → 2,915).
- Existing: W-MEP-REROUTE R1-R5, W-WALK-GESTURE 4/0, W-GESTURE-UNDO 9/0, W-MEP-OPENPATH M0-M4 unchanged.

## Regression risk
- History restore for nodes that carry onRows/offRows (only re-route-amended nodes; plain nodes untouched).
- Kernel undo()/redo() pick: filter is a no-op when `_treeOwned` is empty (every path before a re-route).
- Hospital: signing all 19,331 runs costs +54 s per PLB walk and ~19k extra folded solids in the scene — a time and
  draw-call cost, not a proof change. Reported to red1.
- Known, not fixed: superseded/undone state is not persisted across reload for the history tree (the tree is not
  persisted in the Modeller at all); after reload a plain redo could pick a superseded row. Pre-existing class
  (same for an undone walk).
