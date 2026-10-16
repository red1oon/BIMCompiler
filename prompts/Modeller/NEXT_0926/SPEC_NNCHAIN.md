<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC for the W-ROUTER-NNCHAIN N4/N6 retarget. Read the log after every run.

## Why retarget, not fix the app

MODELLER_MASTER.md §STRATEGY 2026-09-24 / §RESUME 2026-09-26 (bim-compiler origin/master, `prompts/MODELLER_MASTER.md`):
> "Retarget or retire W-ROUTER-NNCHAIN (3/5): it expects a real nn-network from an MEP-bearing Terminal, which is
> the wrong test for an ARC-only strategy, and W-MEP-ROUTE-RENDER already covers that render seam, 12/12."
> next-list #5: "Retarget W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs)."

Measured on origin/main (bim-ootb 1069c70c) before this change: N4 and N6 fail (6 PASS / 2 FAIL of 8 checks; the
doc's "3/5" is a stale count from an earlier version of this file — re-measured here, current numbering is N0-N7).

## What N4/N6 currently assert, and why it is the wrong test now

- **N4** (old): op-log `GEOM_SWEEP` ops carry `parameters._dw.from_guid` + `.to_guid` — the identity of TWO REAL,
  host-bound MEP elements that a nearest-neighbour walk (`routeChains()` in `disc_walker.js:1356`) connected.
- **N6** (old): a single `oplog.undo()` call removes "the last chain sweep"; `redo()` restores it.

Both assume the chain-commit rows are `routeChains()`'s real element-to-element nn-network. Diagnostic run on
Terminal today (dumped `window.__dwChains['PLB']` and the committed `GEOM_SWEEP` `parameters._dw`) shows neither
holds:

```
__dwChains['PLB'][0] = {"disc":"PLB","rule":"pattern:CW","from_kind":"RW_CW","to_kind":"RW_CW",
  "from":[113.06,...],"to":[113.53,...],"storey":"02 FIRST FLOOR LEVEL","mode":"pattern-bridge","axis":"Z"}
GEOM_SWEEP.parameters._dw = {"disc":"PLB","rule":"pattern:CW","from_kind":"RW_CW","to_kind":"RW_CW",
  "crossSection":"Duplex_CW_Pipe_25"}   // no from_guid / to_guid — never present
```

`mode: "pattern-bridge"` is disc_walker.js's `_bridgeIfEmpty` path (§CAMPAIGN M1): `routeChains()` returns 0 real
segments for Terminal's PLB run under the current generate-then-edit strategy (L6: "PLB host-binds 0 on all 8
residents" — nothing is host-bound, so there is nothing for a real nn-walk to connect), and the routePattern
bridge (PLB→CW/SP shim) synthesizes the run instead. This is not a Terminal-specific gap; it is the strategy: ARC
envelope → generate floating fixtures → route via the pattern bridge. `from_guid`/`to_guid` are a field that
`routeChains()` sets (disc_walker.js:1386/1411) and the bridge path never produces, by construction — N4 as
written can never pass again without either reverting the strategy or inventing fake guids, neither of which is
the fix.

N6's failure is a knock-on of N4's wrong predicate, not an independent finding: it measures
`sweepBefore = sweeps.withDw` (0, per N4), so `sweepAfterUndo === sweepBefore - 1` compares 0 to -1 and fails
by construction. Separately measured (diag): a single `undo()` after a chain commit undoes op id 1578, not any
of the 12 sweep ids 970-981 — because Terminal's PLB walk auto-commits ~597 `GEOM_INSERT` bend/tee fittings
(§CAMPAIGN M5) AFTER the chain sweeps, and `undo()` is row-granular LIFO (bonsai_oplog.js:472-484, "Undo = soft-
delete the most-recent ACTIVE feature"). That is correct, intended behaviour (documented at modeller.html:4499-
4500: "row-granular undo (undo() toggles per ROW, not per gid) — W-ROUTER-NNCHAIN N6 unaffected" — that comment
itself already flagged this witness as needing the fix made here), not a defect to chase.

## What N4/N6 assert now (retargeted, under the current ARC-only + routePattern-bridge strategy)

**N4 — a routed run's signed sweep carries its real routing identity from the routePattern bridge.**
Proves: the chain-commit path (`_commitDiscChains`, modeller.html:4490) signs each folded run with real,
measured identity — not a placeholder — so the render seam W-MEP-ROUTE-RENDER already proves (12/12) is backed
by a correctly-signed op-log row. For every committed `GEOM_SWEEP` op (count == `folded` from N3/N5):
  - `_dw.disc === 'PLB'` (the walked discipline)
  - `_dw.rule` is a non-empty string starting `'pattern:'` (proves it came from the routePattern bridge, the
    documented current path — NOT an invented/default rule)
  - `_dw.from_kind` and `_dw.to_kind` are real `RW_` sub-discipline tags (e.g. `RW_CW`/`RW_SP` — the real
    RouteWalker sub-discipline the bridge resolved, per the modeller.html:4504-4507 comment)
  - `_dw.crossSection` is a non-empty string (WalkerDoctrine §8: a HARD FAIL with no invented constant when no
    real product is verified — a present value means a real component_library.db product was used)
  - `path[0]` and `path[1]` are each a finite 3-tuple and are not equal (real, non-degenerate 3D geometry
    measured from the walk, matching `__dwChains[disc]` — not synthetic placeholder coordinates)
If a future change host-binds real elements and routes them with `routeChains()` instead of the bridge, this
check still holds (rule/from_kind/to_kind/crossSection/path are populated on that path too); it does not
regress to expecting `from_guid`/`to_guid` again, since those are not part of what W-MEP-ROUTE-RENDER or the
signed contract require.

**N6 — a routed run's signed sweep row is individually undoable and redoable in the op-log.**
Proves: reversibility (the Prime Directive-adjacent "every edit is reversible" invariant, bonsai_oplog.js:432-
435) holds for a routePattern-bridged chain row specifically, using the same signed-toggle primitive `undo()`/
`redo()` themselves call (`setUndone`, §MHIST-ROWS, bonsai_oplog.js:464-471) — targeted at a real committed
sweep id instead of assuming it is positionally last (it is not: fittings commit after it under Walk-ALL/PLB).
Steps, using a real id taken from N4's own committed sweeps (no invented id):
  1. Before: the id is present in `_geomOps()`, `sweepCount === folded`.
  2. `oplog.setUndone([id], true)` → id absent from `_geomOps()`, `sweepCount === folded - 1`,
     `oplog.length` (total active ops) drops by exactly 1.
  3. `oplog.setUndone([id], false)` → id present again, `sweepCount === folded`, `oplog.length` restored.
This is a real, measured assertion (verified live on Terminal/PLB before writing the check: 12→11→12,
1578→1577→1578) — not weakened to pass; if `setUndone` ever fails to toggle a routed sweep row, the check goes
red and stays red.

## Checks left unchanged (not in scope for this retarget)
N0, N1, N2, N3, N5, N7 are unaffected — they already measure real, current behaviour (N1: real chainSegs from
the live walk; N3/N5: the real folded/cap count; N2: the tube-render fix already landed). Only N4 and N6 are
edited, per the task and per MODELLER_MASTER next-list #5.
