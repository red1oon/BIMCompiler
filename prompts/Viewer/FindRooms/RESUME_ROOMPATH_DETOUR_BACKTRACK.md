<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# RESUME — Room-pathing: deploy-target correction, live witness, first real fix shipped (2026-08-04)

```
# ⚠ DO NOT REMOVE
SCOPE: continuation of ROOM_PATHING_LANDING.md (2026-08-03 closing doc). That doc's "not yet
deployed" framing was WRONG — read §0 below first, it corrects the record. This session then
built a real witness against LIVE production code + real building DBs (not simulated) and shipped
one real fix (merged). Two open items remain, named in §3. Read this whole file before touching
room_graph.js again — don't re-derive what's already answered here.
```

## §0 CORRECTION — the real deploy target (read this before any future OCI/deploy work here)

`bim-compiler/deploy/live/` + OCI buckets (`bim-ootb-live`/`bim-ootb-dev`/`bim-ootb-full`) are a
**legacy, unused-for-code distribution channel** — already documented in memory
(`reference_oci_deploy.md`, `reference_gh_deploy.md`) before this session, just not checked before
acting. **Real production is `~/bim-ootb`'s own `origin/main`, auto-deployed via its own
`.github/workflows/deploy-pages.yml` to `https://red1oon.github.io/bim-ootb/`.** Room-pathing, the
Find panel, `'f'` key, and the Fly-Tour room-graph routing were ALL already live there before this
session started — the earlier "never deployed" finding only applied to the legacy OCI mirror.
A wasted scoped-patch-then-revert cycle happened before this was caught (see prior session log in
this same file's git history / conversation — not worth re-reading, just don't repeat the mistake).
**Any future "is X live" question on this project: check `~/bim-ootb origin/main` (or the github.io
URL) FIRST, never `bim-compiler/deploy/live`.**

## §1 LIVE WITNESS METHOD (reusable — don't rebuild from scratch)

Real paths, computed against real building DBs, via the actual production code
(`~/bim-ootb/common/room_graph.js` `shortestPath()` — confirmed the ACTUAL function
`viewer/navigate_find.js` `_findRoomPath()` calls, line 1362):

- **Hospital**: use `buildings/Hospital_meta.db`, MUST apply `buildings/patches/Hospital_meta.db.sql`
  first (raw file lacks `storey_walkable_raster`, matches the already-documented §3 rule in
  `ROOM_PATHING_LANDING.md`). 156 rooms in `graph.nodes`.
- **LTU_AHouse**: use `buildings/LTU_AHouse_meta.db` as-is (no patch exists for this building).
  335 rooms in `graph.nodes`.
- Rooms come from `spatial_structure` (type='IfcSpace'), NOT `elements_meta` — storey resolved via
  `parent_guid` self-join (`p.name` where `p.guid = s.parent_guid`), not an `elements_meta.storey`
  join (that join returns empty — room guids are synthetic `RM_*`, not in `elements_meta`).
- **3-check witness** (script was in scratchpad, not committed — rebuild if needed, ~80 lines):
  1. **Node-revisit**: no duplicate guid in `res.path`.
  2. **Same-floor self-intersection**: segment-crossing test, but ONLY within same-Z runs of
     `res.polyline` — a naive all-pairs 2D test false-positives constantly across different
     storeys (a stairwell sits at the same X,Y on every floor, that's not a real crossing; this
     was my own first-draft bug, caught before reporting it as a finding).
  3. **On-floor / not outer space**: `RoomGraph.chordIllegalCount(graph, storey, x1,y1,x2,y2)` on
     every same-storey polyline segment — this IS an exported witness helper the codebase itself
     provides for exactly this check, don't reinvent it.

**Result on 5 real room pairs (3 Hospital, 2 LTU):** 4/5 clean on all 3 checks. 1 failure
(Hospital `L1R2→L4R4`) was a genuine backtrack, root-caused to `§PATH_LEGAL_DETOUR_MID` picking a
far (28m) detour — traced via the `§` log lines, not guessed.

## §2 FIX SHIPPED — bim-ootb PR #1178, MERGED (commit `13ed584`, 2026-08-04)

`_legalizePath`'s existing `§DETOUR-NO-REVISIT` guard (2026-07-26) only checked a new detour
against anchors still AHEAD in the original path — never against waypoints an EARLIER chord's own
detour already placed into `out` this same pass. 2-line widening of the same veto-candidate set
already feeding the existing chainLen-guarded accept/reject logic — no new mechanism, reused what
was already there. Verified zero regression: same 5-path witness re-run node-for-node identical
except the target case (which now correctly ATTEMPTS a fix and honestly rejects it, see §3.1);
fleet-wide `witness_full_connectivity.js` (Clinic/HHS/Duplex) and direct Hospital/LTU
`fullConnectivity()` checks byte-identical before/after.

## §3 OPEN ITEMS (not blocking, named for next session)

**§3.1 Length-guard UX question — ✅ DECIDED (2026-08-05), keep as-is.** `Hospital L1R2→L4R4`: the
no-revisit alternative is 8.7m longer (82.8m → 91.5m, +10.5%) than the backtracking route, and
`§NOREVISIT-LENGTH-GUARD` only ever accepts an alternative that's NOT longer, so this one case
still backtracks. User's call, asked directly: revisiting a room costs zero extra distance here (no
detour needed to revisit — it's already on the way), so "backtracking" is the physically shorter
walk, not a wasteful one; the guard choosing shorter-over-clean is correct as-is. **No threshold
override — leave `§NOREVISIT-LENGTH-GUARD` exactly as shipped 2026-07-26.**

**§3.2 LTU unexplained gap — ✅ DONE (2026-08-05), root-caused + fixed, see
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md §SPINE-BRIDGE-CLUSTER`.** Not a
`§PATH_LEGAL_DETOUR_FAIL` case (that only fires inside `_legalizePath`, after a path is already
found — a pure graph disconnect never reaches it). Real cause: `§ROOM-SPINE-BRIDGE`'s eligibility
test only fired for zero-degree rooms; a 2-room island (door to its one sibling, nothing else) has
degree 1 and was never attempted. Fixed by bridging per connected-component instead of per-node
degree. **Shipped + MERGED**: bim-ootb PR #1200, `origin/main` @ `5a68932` (2026-08-05T03:01:05Z).
Fleet POC gate: 6 such components / 12 rooms, all on LTU_AHouse, zero elsewhere in the checkable
fleet. Full regression: 89,627 existing room pairs 0 lost/0 changed, 3,500 newly connected (LTU
only). §3.2 fully closed, nothing further owed.

**§3.4 (new, found while closing §3.1) — ✅ DONE (2026-08-05), `§PATH_LEGAL_DETOUR_REVISIT_FORCED`.**
User's follow-up on §3.1: "what if there was no alternative route and exists only a revisit?" —
correctly falls back and keeps the revisit (no crash, no lost path), but the fallback logged
nothing, indistinguishable from a clean detour. Fixed with a one-line log addition (behavior
unchanged, spot-verified byte-identical route). Shipped + MERGED: bim-ootb PR #1210, `origin/main` @
`8574e51` (2026-08-05T07:54:33Z). Real occurrence: 437 fleet-wide (318 LTU, 119 Clinic). Full detail
+ the shared-worktree `git stash` caution hit while verifying this: see
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md §PATH_LEGAL_DETOUR_REVISIT_FORCED`.

## SESSION CLOSED 2026-08-06 — all 4 items (§3.1–§3.4) resolved, both fixes merged to origin/main
Nothing left open in this file. A future session picking up room-pathing should start from
`OCCUPANT_PATHFINDER.md`'s own OPEN items (`§G1-EXTERIOR-DOOR-LANE`) or `PROGRESS.md`'s broader
`§ROOM PATHING` entry — not this file, which is now fully DONE.

## DONE — this session, appendix
- §0 corrected the deploy-target confusion (memory hardened: `reference_oci_deploy.md`,
  `feedback_check_status_before_reset_shared_worktree.md` both updated with dated hits).
- §1 live witness built and run against real production code + real DBs — not simulated.
- §2 fix shipped, PR #1178 merged, verified zero regression by re-running the same witness + fleet
  connectivity check before/after.
- §3.1 decided (keep as-is), §3.2 shipped+merged (PR #1200), §3.4 shipped+merged (PR #1210) — all
  three closed with witness numbers, not just narrative. §3.3 was never assigned (numbering gap from
  an earlier draft; §3.1/§3.2 are the only items the prior session actually opened).
