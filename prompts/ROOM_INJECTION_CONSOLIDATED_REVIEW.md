<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM INJECTION — consolidated lane review (2026-07-17, prepared for Opus refactor session)

```
# ⚠ DO NOT REMOVE
SCOPE: this is a READING GUIDE + gap list, not a spec of new work. It consolidates 8 scattered
prompts/*.md files (~2,700 lines total) that all touch the "Room Injection" mechanism — how
compiled room geometry (compile_rooms.py / room_walker.js flood-fill) gets computed and injected
into a building's DB and/or the live Viewer/Modeller. Goal: review the accumulated lane for
overlap/simplification opportunities, then pick up the real open items listed in §GAPS below.
Read docs/internal/WalkerDoctrine.md §14 FIRST (the canonical doctrine, settled, do not
re-litigate) — everything else in this lane builds on top of it. PUSH PAUSE in effect unless
lifted for your session: commit locally, verify on localhost, do not push/open a PR. No .db
binaries in any commit — DB changes are migration/*.sql or self-heal patches only. Read the log
after every run — exit code is not evidence.
```

## The lane, in dependency order

1. **`docs/internal/WalkerDoctrine.md` §14`** — canonical rule: every extracted/imported building
   gets real room data auto-infused, never a manual follow-up. Real `IfcSpace` data is EXTRACTED
   as-is; where none exists, `compile_rooms.py`'s wall-enclosure flood-fill COMPUTES it and labels
   the result `≈`/approximate, never presented as real, always excluded from `disc_walker.js`'s
   `spacesOf()` schedule-mode. This split (real vs synthetic) is the doctrine every file below
   restates — don't re-derive it, cite it.

2. **`prompts/Modeller/DISC_Walker/ROOM_INJECTION_HYBRID.md`** (761 ln) — master standing-rule +
   task tracker for the Modeller side. Tasks 1,2,4,5,6 DONE (2026-07-10/11); §7 well-formedness
   and §8 multi-rect appear shipped (witness numbers present, no explicit closeout banner); §9
   (Room Lens volume box) DONE + PR #733.

3. **`prompts/Modeller/DISC_Walker/ROOM_WALKER_JS_PORT.md`** (267 ln) — DONE. Ported
   `compile_rooms.py` to `build/room_walker.js` (byte-identical parity, W-ROOM-WALKER-PARITY
   6/6), compute-once via a Modeller Outliner action, never on every open. `compile_rooms.py`
   itself NOT deleted — still ground truth for `witness_geomap_tier3.py`.

4. **`prompts/Viewer/ROOM_INJECTOR_NEEDLE.md`** (226 ln) — DONE. The Viewer-side 💉 needle beside
   the Find Panel: three-state (zero/recompute/none), manual-only, DELETE-then-INSERT idempotent,
   never overwrites real (non-`RM_`) extraction. `_needleInject()` is the body later reused as
   `A.ensureRooms()` (item 8 below).

5. **`prompts/TERMINAL_COORDINATE_FRAME_MISMATCH.md`** (175 ln) — DONE (patched in place). Root
   cause: `extract_per_building.py` carved Terminal's DB out of a multi-building sandbox tile
   without subtracting the tile offset. Fixed via a one-off SQL `UPDATE`, NOT at the pipeline
   source — see §GAPS.

6. **`prompts/ROOM_WALKER_PHASE_INVARIANCE.md`** (81 ln) — spec only in this file (no DONE
   section here), but **shipped** as PR #832 (confirmed via file 8's "cure chain" record) —
   translation-invariant rasterization, canonical py+js fix, door binding improved fleet-wide
   (Terminal E1 26→28, Clinic 174→175, HHS 27→29). This file itself was never updated with that
   closeout — a doc-sync gap, see §GAPS.

7. **`prompts/Modeller/DISC_Walker/COMPILE_ROOMS_TYPE_INFERENCE.md`** (218 ln) — MOSTLY NOT
   STARTED. Only the furniture-fixture classifier signal is built
   (`classifyRoomWithFixtures()`, 18/18 on Duplex). Wall/door keyword inference, area-band
   inference, and shape-clustering are all unbuilt. Real unsolved gap: Terminal's 4 real
   `Asian_Toilet` fixtures sit ~4m outside every currently-compiled room — that restroom was
   never captured as a room at all.

8. **`prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md`** (582 ln) — MIXED. Tasks
   0-2 DONE (PR #728, #732). Task 3 (plain-language labels) and Task 4 (end-to-end whitebox
   witness) NOT STARTED. §7 (corridor pathfinding, `common/room_graph.js`) DONE, later confirmed
   merged via file 9. §8 (room-highlight box-vs-fragment fix) has spec + DONE-WHEN criteria but
   **no closeout recorded in this file** — status unknown, needs verification.

9. **`prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`** (259 ln, room-injection-relevant excerpt) —
   DONE for the injection-touching parts. Ships shared `A.ensureRooms()` (reused from item 4),
   then the 2026-07-17 "cure chain" (PRs #832-#835): #832 = item 6's fix landed here too; #833 =
   `§PATCH-FRAME-GUARD` (needle was applying a wrong-frame patch onto imported content, 550m off
   — fixed with an extent-intersection guard); #834 = `§THIN-GRAPH-RECURE` (stale weak compiles
   get one re-cure); #835 = `§MAJORITY-LEGAL` gate (rejects mostly-illegal routes). All merged +
   Pages-deployed.

## §GAPS — real open items across the lane (not urgent to assign yet, listed for the review)
- **`_roomSelect()`/`_buildRoomTree()` still not `room_guid`-aware** (item 2, §9 follow-up) — a
  tapped multi-rect room zooms/highlights only ONE of its sub-rects. Flagged as "very plausibly
  the actual source of the ORIGINAL 'hugs the border' user report." No shipped DB carries
  `room_guid` yet, so this is latent-but-unfixed on production data.
- **`extract_per_building.py` pipeline source still unfixed** (item 5) — the Terminal coordinate
  bug was patched in the shipped DB, not at the extraction source. Next full regen of
  `deploy/buildings/` will reintroduce it (Hospital/HospitalGarage/LTU_AHouse share the same
  `CBD_BUILDINGS` tile row and are at the same risk, unverified).
- **Doc-sync gap**: `ROOM_WALKER_PHASE_INVARIANCE.md` (item 6) needs its own DONE section written
  — it currently reads as open/unshipped when the work actually landed as PR #832.
- **Stale anchor note**: `ROOM_INJECTION_HYBRID.md`'s ANCHORS line claims
  `SAMPLECASTLE_REAL_ROOMS_RECONCILE.md` "lives only on an unmerged branch, don't expect to open
  it here" — false on `fable/meshdb-livewire`, the file is present in this tree (merged via
  `docs/session-closeout-2026-07-10`). Needs a one-line correction.
- **Room-type inference (item 7) is ~80% unbuilt** — wall/door keyword signal, area-band signal,
  shape-clustering signal all unstarted; Task 0's calibration harness (hard precondition per the
  file's own EXTRACT-FIRST rule) also not started.
- **Terminal room-compile coverage gap** (item 7) — real toilet fixtures outside any compiled
  room; the flood-fill/door-partition never captured that space. Separate from the type-inference
  problem, needs its own investigation.
- **`VIEWER_FIND_PANEL_ROOM_ACCURACY.md` Task 3/4 not started**, and §8's actual shipped state is
  unknown (spec present, no closeout) — needs a status check before being called done or open.
- **`deploy/dev` (bim-compiler's own viewer copy) has NONE of this stack** (item 9) — no
  `room_graph.js`, no `hallway_backbone.js`, no needle in its `navigate_find.js`. Flagged
  repeatedly across sessions as a separate, un-started port.
- **Browser-importer wall-transform parity — ROOT-CAUSED 2026-07-17, fix spec written** (item 9):
  imported vs extracted room counts disagree (45 vs 54) because element `center_x/y/z` is the
  **vertex-MEAN** (tessellation-density-dependent, non-deterministic across wasm builds) in BOTH
  `extractIFC2DB.js:422` and `import_worker.js:515`; bbox is invariant but center drifts up to
  ±1.31 m (31/333 walls > 0.5 m → broken enclosure). NOT coordinate-phase (that was a separate,
  already-#832-fixed bug). Fix = bbox-center `(min+max)/2` in both paths. Full diagnosis + fix +
  regression plan: **`prompts/CENTROID_DETERMINISM_FIX.md`**. Pipeline-wide blast radius (re-extract
  all DBs) → dedicated fix+regression session + architect sign-off, not a drive-by.

## Landmines — do NOT re-attempt (all previously tried and reverted/disproven)
- `origin/feat/samplecastle-real-rooms` branch — mislabeled Schependomlaan data, never re-adopt.
- HHS `SEAL=1` fix — tested, rejected (fragmented real rooms elsewhere); stays at `SEAL=2`.
- MEP-fixture (`IfcFlowTerminal`) as a general room-type signal — rejected, Clinic-only data.
- Fixed `DOOR_RESCUE_MIN_AREA` buffer in §DOOR-RESCUE — superseded, user wants rules-based not
  hardcoded thresholds.
- Generic/textbook room-size tables for area-band calibration — always calibrate from this
  repo's own real data (Duplex's 20 ground-truth rooms) only.
- Auto-run Room Walker on every open — the whole point of the JS port was avoiding recompute
  cost on open; persist once, reuse until data changes.

## Reading order for the Opus session
`docs/internal/WalkerDoctrine.md` §14 → `ROOM_INJECTION_HYBRID.md` → `ROOM_WALKER_JS_PORT.md` →
`ROOM_INJECTOR_NEEDLE.md` → `FLY_TOUR_CORRIDOR_GRAPH.md` (injection sections) →
`ROOM_WALKER_PHASE_INVARIANCE.md` + `TERMINAL_COORDINATE_FRAME_MISMATCH.md` (the two coordinate
bugs) → `VIEWER_FIND_PANEL_ROOM_ACCURACY.md` → `COMPILE_ROOMS_TYPE_INFERENCE.md` (least mature,
most greenfield work remaining).
