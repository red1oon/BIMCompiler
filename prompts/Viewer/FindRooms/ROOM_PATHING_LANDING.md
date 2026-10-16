<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM PATHING LANDING — 2026-08-03 session wrap-up: injection process reviewed, real substrate found, fleet lands within tolerance

```
# ⚠ DO NOT REMOVE
SCOPE: this is a CLOSING doc, not a resumable one. It reviews everything this session did across
RESUME_FLEET_OPENINGS_BACKFILL.md §12+ (vertical circulation, stair-cause, openings-ghost
clarification) and the substrate investigation that followed, classifies what was real vs a red
herring, and records the ERP 5%-tolerance verdict that closes the lane. Read `ROOM_PATHING_SUBSTRATE.md`
§0 first next time — it already named `common/room_graph.js` as "the shipped router" before this
session started; the mid-session pivot below could have been skipped by reading it first.
```

## §1 THE INJECTION PROCESS, REVIEWED (RESUME_FLEET_OPENINGS_BACKFILL.md §4.2–§5.5)

Two paths were used per building to backfill `IfcOpeningElement`, classified by whether the
extraction chain was re-runnable:

| path | buildings | method | verdict |
|---|---|---|---|
| **A — full re-extract** | Duplex, Clinic, Hospital | re-ran `extractIFC2DB.js` (with the §OPENINGS-BACKFILL fix) against the attributed source IFC(s) | clean, gates all green |
| **B — openings injection** | Hospital_3, HHS, JKR, Terminal, TermRooms | chain not re-runnable (unrecorded params, carve/coordinate-correction steps, or a byte-copy source) — injected openings from a fresh Path-A extraction of the closest matching source, frame-fitted and GUID-matched | proven exact-fit per building (§INJ_FIT dx=dy=dz=0.0000), one real bug caught and fixed (§5.5: Hospital_3's discipline split flattened by `--disc ARC`, corrected by GUID join) |

Both paths were then **ghost-stripped** (§5: `element_instances`/blob removed, `elements_meta`+
`element_transforms` kept) per the S185 ruling — full opening geometry corrupted the mesh-library
pipeline months before this session; today's work only applied that existing call at the SQL level.
Equivalence proven once (Duplex, §5.2: fresh ghost extraction vs. installed+stripped, byte-identical
table counts and walker numbers) and reused for the rest — a sound, minimal-repeat-work design.

**Classification of the injection process itself: sound.** Every claim carries a `§` log line
(G-EX1–G-EX3, G-FL, G-VR, G-GHOST); Path B's legitimacy rests on LTU's own S184 shape (dangling
hashes, same as what got injected) rather than an assumption; the one real defect it surfaced
(Hospital_3 discipline flattening) was root-caused and fixed, not patched over. Its actual effect on
routing was ALSO measured, not assumed: §5.3 found adding 735 real Hospital openings changed the
walker's routing number by **zero** — proving this session's later chase of "openings vs doors" was
answering a question the data had already closed.

## §2 THE SUBSTRATE CONFUSION THIS SESSION WALKED THROUGH (own mistakes, named plainly)

Three unrelated room-graph mechanisms exist in this codebase. This session tested them in the WRONG
order — expensive detour, worth recording so it isn't repeated:

1. **`spineMap`** (`room_walker.js`, raster flood-fill + door-carve) — an EXPERIMENTAL substrate,
   the subject of the entire `§21.x` / `§9`–`§12` investigation (two-layer doctrine, vertical
   circulation, pierce-depth sweeps). Real findings, real stop condition (§21.44, 0/72 cells), but
   **never the shipped mechanism** — this was not flagged early enough.
2. **`_doorApertureAdjacency`** (`room_walker.js`, fixed-distance ray march, `APERTURE_MAX_REACH=1.5m`)
   — tested directly on Hospital, only 11% of doors resolved cleanly. Also **not the shipped
   mechanism** — a different, older, also-abandoned-in-practice approach living in the same file.
3. **`common/room_graph.js`** (E1–E9 edge types, corridor backbone, A*-verified spine-bridge) — the
   ACTUAL live mechanism (`viewer/navigate_find.js` `_buildPathPanel()` consumes its `graph.nodes`
   directly). `ROOM_PATHING_SUBSTRATE.md` §0 already named this "the shipped router" before this
   session began — it should have been the first thing read, not the third thing found.

**Lesson, hardened into memory this session** ([[feedback_check_current_doc_before_cross_repo_search]]):
check the canonical concept doc's own reading map before trusting which substrate matters, even when
a resume file's own dated log is compelling — a dated log documents WORK, not necessarily the
SHIPPED path.

## §3 THE DATA MISS THAT INFLATED THE PROBLEM 5x (caught and corrected, same session)

First pass at `common/room_graph.js`'s real numbers used the RAW `Hospital_meta.db` file directly.
This DB does not carry `storey_walkable_raster` — that table is applied **at runtime only**, by the
viewer's `A._applyPendingPatch()` reading `buildings/patches/Hospital_meta.db.sql`. Testing the raw
file produced **23 sealed rooms**; applying the patch first (matching what a real user's browser
actually loads) dropped that to **4**. The same miss would have affected HHS/JKR/Terminal (all three
also ship a raster patch) — re-tested with patches applied, all three landed at **0** sealed, not the
smaller-but-still-wrong numbers reported mid-session.

**Rule for next time:** any connectivity/pathing measurement against a building DB that ships a
`buildings/patches/<db>.sql` file MUST apply that patch first (`sqlite3 <copy> < patch.sql`) — the
raw distributed file and the live-served file are not the same data.

## §4 ROOT-CAUSE, FOR THE REMAINING REAL GAP (Hospital's 4, traced concretely)

Not assumed — measured by flood-fill directly on the raster:

| room | storey | reachable island | floor's total raster |
|---|---|---|---|
| ≈ Level 2 R12 | Level 2 | 8.0 m² | 9,797 m² |
| ≈ Level 3 R7 | Level 3 | 8.0 m² | 9,605 m² |
| ≈ Level 4 R7 | Level 4 | 6.6 m² | 8,650 m² |
| ≈ Level 5 R5 | Level 5 | 8.0 m² | 8,750 m² |

All four: a genuine door exists 1–6m away (checked against real `IfcDoor` positions, not assumed),
but the walkable raster never got carved through it on any of the 4 floors — the SAME shape of gap
(near-identical island size, repeating across floors) suggests one specific room type's door
consistently fails `scripts/build_storey_walkable_raster.js`'s carve, not four unrelated defects.
A* itself is exonerated: window sizing and cell budget were both checked and are nowhere near their
limits for these distances — it correctly reports "no route" because the data has none.

## §5 THE FIX BUILT THIS SESSION (worktree `/tmp/wt-sealed-rooms`, branch `feat/sealed-rooms-find-panel`, NOT YET PUSHED)

Two small, additive changes to live viewer code, both verified against the patched fleet:

1. **`common/room_graph.js`** — `SUB_HUMAN_DOOR_HEIGHT = 1.5m`: any `IfcDoor` shorter than this is
   excluded from E1/E2 matching (a door can't create a room-to-room edge if a human can't fit
   through it). Validated fleet-wide: only 4 doors caught, all genuine non-doors (JKR's
   `Door-Floor_Access-Bilco...` roof hatch at 1.22m; LTU's `SD4A2`/`SD8A2` service doors at
   0.40m/0.80m) — zero real doorways affected.
2. Any room still at zero edges after the FULL graph build (E1–E6, including the A*-verified
   spine-bridge) is marked `sealed: true` on its node — not deleted, just flagged.
3. **`viewer/navigate_find.js`** `_buildPathPanel()` — filters `sealed` rooms out of the From/To
   picker. A room the system already knows it can't route to is no longer offered as a destination.

Verified: fully additive — Hospital's underlying connectivity numbers (399/425 = 93.9%, unchanged)
prove nothing regressed; the fix only affects the picker list and the new flag.

## §6 FLEET-WIDE FINAL NUMBERS (patched DBs where a patch exists; the only trustworthy version)

| building | rooms | sealed | sub-human doors excluded |
|---|---|---|---|
| Clinic | 119 | 0 | 0 |
| HHS | 23 | 0 | 0 |
| JKR | 66 | 0 | 1 |
| Terminal | 55 | 0 | 0 |
| TermRooms | 65 | 0 | 0 |
| Hospital | 156 | 4 | 0 |
| LTU | 371 | 7 | 3 |
| **Fleet total** | **855** | **11 (1.3%)** | **4** |
| Duplex | — | not counted — no room graph exists at all (`spatial_structure` table missing from both its DBs); a pre-existing, separate, unquantified gap | |

**LTU's 7 is the one number in this table not yet re-verified the §3 way** — LTU ships no
`storey_walkable_raster` patch, so there is no patched version to re-test against; its 7 could
plausibly shrink the same way Hospital's 23 did IF a raster patch existed for it, but that is
untested, not claimed.

## §7 ERP 5% TOLERANCE RULE APPLIED — VERDICT

**11 of 855 rooms unreachable = 1.3% — inside the user's stated 5% tolerance. Majority (98.7%)
reachable. GOOD ENOUGH. Landing here.**

This closes the "resolve to zero" line of work from earlier in the session — not because zero
wasn't worth wanting, but because the honest evidence says the fleet is already well inside the
tolerance the user set for exactly this kind of judgment call. The §21.44 stop condition (0/72
pierce-tuning cells passed) is retired as a concern for THIS metric — it applied to the wrong
(experimental) substrate; the real substrate's remaining gap is small, named, and root-caused rather
than open-ended.

## §8 WHAT'S NOT DONE (named, not hidden)

- **Push/deploy:** `feat/sealed-rooms-find-panel` sits in `/tmp/wt-sealed-rooms`, committed nowhere,
  pushed nowhere. A decision to commit+push (or not) is still open.
- **Duplex:** no room graph at all. Not inside the 855-room denominator above — if it needs to be,
  that's a `spatial_structure` data gap to fix first, a different task than anything in this doc.
- **LTU's 7:** unverified against a raster patch (none exists to test with) — see §6 note.
- **Hospital's 4-room root cause:** named (raster carve gap, repeating room-type signature) but not
  fixed — fixing `build_storey_walkable_raster.js`'s carve for this case is a new, separate task if
  ever prioritized. Per §7, not urgent — inside tolerance either way.

## DONE — this session, appendix

- §1 injection process reviewed against its own `§` log lines (RESUME_FLEET_OPENINGS_BACKFILL.md
  §4–§5) — sound, no gaps found in the process itself.
- §2/§3 substrate confusion + data miss — both caught within-session, both corrected, both written
  to memory ([[feedback_check_current_doc_before_cross_repo_search]],
  [[project_openings_ghost_doors_standin]]) so a future session doesn't repeat them.
- §4 root cause — measured by direct flood-fill on the real raster, not inferred.
- §5 fix — built, syntax-checked, fleet-verified, NOT deployed (see §8).
- §7 — tolerance verdict recorded as the closing call for this lane.
