<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM WALKER — retire offline compile_rooms.py, port to JS, run compute-once (not on every open)

```
# ⚠ DO NOT REMOVE
SCOPE: a NEW JS module (grid rasterize + flood-fill + §DOOR-RESCUE + §DOOR-PARTITION, ported
verbatim from scripts/compile_rooms.py's Python/numpy) usable in TWO modes — offline via Node CLI
(replacing compile_rooms.py for the 8 shipped residents) and in-browser via a new Modeller Outliner
"Room Walker" action (for a user's own dropped IFC, and any future re-walk). Read
ROOM_INJECTION_HYBRID.md + VIEWER_FIND_PANEL_ROOM_ACCURACY.md (§2 Task 5) in full first — this task
is the actual fix for the gap Task 5 named (live IFC import gets zero room data), reframed with
the user's own architectural call: don't run this live on every open, run it ONCE on demand/import
and persist, same principle as the existing offline bake just moved to whichever moment needs it.
ANCHORS: scripts/compile_rooms.py (the Python source of truth to port, byte-for-byte logic — NOT
re-derived from scratch) · prompts/Modeller/DISC_Walker/ROOM_INJECTION_HYBRID.md (§DOOR-RESCUE/
§DOOR-PARTITION, the algorithm; Task 3 "New Modeller Outliner 'Rooms' category," still NOT
STARTED — this doc gives that task its concrete trigger mechanism) ·
prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md (§2 Task 5, the live-import gap
this closes) · bim-ootb modeller/disc_walker.js `dwWalk()` (the EXISTING walk-trigger convention to
match — verify HOW it's actually invoked today, automatic-on-load vs explicit UI action, before
assuming a button pattern; not confirmed either way this session, grep found no obvious caller
outside disc_walker.js itself) · modeller/bom_tree_outliner.js / dw_instances_outliner.js /
str_walker_outliner.js (the existing Outliner category shape to follow for "Rooms").
```

## §0 — The decision (this session, user-confirmed)

Two separate problems get ONE unified fix:
1. **Two parallel implementations is a code-drift risk.** Python (`compile_rooms.py`, offline-only)
   can never run for a live user IFC import — no server, no Python in the browser (confirmed:
   `viewer/import_db_builder.js` never creates `spatial_structure`, this is 100% client-side
   `web-ifc` WASM). A JS port is REQUIRED for that gap regardless of anything else. Once it exists,
   maintaining a SEPARATE, also-correct Python copy purely for the 8 shipped residents is redundant
   — one JS implementation should serve both.
2. **"On the fly" must mean compute-ONCE, not compute-on-every-open.** User's own point: checking/
   running this on every Modeller open "costs time" (HHS's grid alone is ~90k cells/floor — real,
   measurable compute, not free). The fix is the same shape as the existing offline bake: run once,
   persist the result into `spatial_structure`, and reuse it on every subsequent open — just move
   WHEN "once" happens (our build time for known residents; the user's import moment, or an
   explicit re-walk, for their own buildings) instead of forcing it into either "always baked ahead
   of time" or "always recomputed live."

The natural UI expression of "compute once, on demand" in this Modeller is an explicit action, not
a silent background job — hence **"Room Walker,"** parallel to the existing Disc Walker
(`dwWalk()`) convention already in this codebase, surfaced in the Outliner (this also completes
`ROOM_INJECTION_HYBRID.md`'s Task 3, "New Modeller Outliner 'Rooms' category," which was specced as
a passive display category with no concrete trigger — Room Walker gives it one).

## §1 — Task list (work top-to-bottom, same WORK-TO-ZERO discipline as every prompts/#.md file)

### Task 1 — Verify the actual Disc Walker trigger mechanism before designing Room Walker's UI
**Status: ✅ DONE 2026-07-11 (Sonnet).** Prior grep of `modeller/*.js` alone missed the real call
site — it's in `modeller.html`'s inline `<script>`, not a `.js` file. Traced directly (identical on
`main` and `fable/modeller-lod400-livewire`):

- **`dwWalk()` is explicit-user-action only, never automatic-on-load.** Definition
  `disc_walker.js:2005`, exported `API.dwWalk` (`:2208`). Both real call sites are inside
  `window._discWalkOne(disc, ctx, opts)` in `modeller.html` (`:3459` schedule-first path per
  §LIVEWIRE DEFAULT-FLIP, `:3462` fallback) — reached only via `window.discWalk()` (single building)
  or `window.discWalkAll()` (loop over disciplines), both of which fire from Outliner tree-row
  clicks: `bonsai_outliner.js:691` is the SINGLE dispatch chokepoint (`if (cat.onWalk)
  cat.onWalk(disc)`), wired to `bom_tree_outliner.js:91`'s `onWalk: function(disc){
  window.discWalk(disc, …) }`. "Walk ALL Disciplines" (`modeller.html:4478`) is a synthetic roster
  row whose click is intercepted through the SAME `onWalk` override (`:4486-4489`) — not a separate
  mechanism.
- **Building-open does NOT call `dwWalk`.** `str_walker_outliner.js`'s `_openBuffer` only stashes
  `window.__dwBuf`/`__dwName` and calls `window.__ensureDiscWalker()` (`dwInit`, engine init — not a
  walk). No inconsistency to flag: Disc Walker already matches the pattern Room Walker needs.
- **The convention to copy, confirmed:** register an `onWalk(disc)` callback on the category object
  passed to `Bonsai.outliner.addCategory` (as `bom_tree_outliner.js`/STR's category both do) — the
  `bonsai_outliner.js:691` chokepoint dispatches it on a tree-row click, no new wiring mechanism
  needed. `dw_instances_outliner.js` is the WRONG pattern to copy — it's a passive per-instance
  display category with no `onWalk`, only for folding already-computed results.
- **No standalone button/menu exists today** for Disc Walk either — only Outliner tree rows. Room
  Walker should follow suit (an Outliner "Rooms" category row with `onWalk`), not invent a toolbar
  button.

**Unblocks Task 2** (the JS port itself) with a settled UI target: Task 4's "Room Walker" action is
just another `onWalk`-bearing category, identical shape to `bom_tree_outliner.js:91`.

### Task 2 — Port `compile_rooms.py`'s algorithm to a shared JS module
**Status: ✅ DONE 2026-07-11 (Sonnet).** `build/room_walker.js` (bim-compiler source-of-truth
location, matching `disc_walker.js`'s own "source copy in `bim-compiler/build/`, deployed copy in
`bim-ootb/modeller/`" convention). Ported verbatim: `storeyWalls`/`storeyStairs`/`storeyDoors`/
`doorAdjacent`/`stairOverlapFrac`/`floodRooms`/`partitionByDoors`/the `main()` orchestration loop
(as `compileRooms`+`writeRooms`+`walk`), every constant (`DOOR_SHORTFALL_RATIO`, `NOISE_FLOOR_DIM`,
`DOOR_BUFFER_SLACK`, `NON_ROOM_DOOR_NAMES`, `RES`/`MIN_AREA`/`MAX_AREA_ABS`/`MAX_AREA_FRAC`/`SEAL`/
`STAIR_OVERLAP_REJECT`) and its justifying comment carried over unchanged. NumPy boolean masks →
`Uint8Array`/`Int32Array` with flat `i*ny+j` indexing; NumPy's `d[1:,:] |= b[:-1,:]`-style
dilation-by-shift → an explicit per-cell 4-neighbor OR loop (verified equivalent — see witness);
`np.argwhere(owner==di)` per-door scan → a single-pass per-owner bucket collection (same O(cells)
total work, no numpy vectorization needed at this grid size). Same `db.exec()`/`_rows()` sql.js
interface `disc_walker.js` and `finalize_all_8.js` already use — genuinely ONE implementation for
both Node (`require`, IIFE + `module.exports`, same pattern as `disc_walker.js`'s tail) and browser
(`ROOT.RoomWalker`), no dual-implementation split needed.

**Witness `build/witness_room_walker_parity.js` (W-ROOM-WALKER-PARITY, 6/6) — this doubles as Task
3's "test bar" (bar 1):** for every real building with compiled (non-`IfcSpace`) room data —
SampleCastle/HHS/Clinic/Garage/Hospital/Terminal — runs the REAL `compile_rooms.py --write` and the
JS port's `walk({write:true})` against separate scratch copies of the same real source
(`fable/modeller-lod400-livewire`'s shipped `_ARC.db`), then diffs the FULL resulting
`spatial_structure` (guid/name/parent/object_type/predefined_type/all 6 coord columns, rounded) AND
`rel_contained_in_space` tables — not just aggregate counts. **Byte-identical on all 6**, door-rescue
path (SampleCastle/Clinic/Hospital) and door-partition path (HHS/Clinic) both exercised and both
exact. Log: `/tmp/claude-1000/-home-red1-bim-compiler/885d136b-04e3-4b17-8666-279c6b28f522/
scratchpad/w_room_walker_parity.log`.

**Resolved 2026-07-11 (user decision): ship 53, not 43** — display-only data (never feeds schedule
placement, `spacesOf()` already excludes `COMPILED`/`RM_` rows), more precision has no downside.
Closed via `embed8_scripts/ROOM008_Terminal_correction_43_to_53.sql` (same SQL-migration convention
as `ROOM001-007`, not a binary commit) — full replace is safe because Terminal's ENTIRE
`spatial_structure` table is synthetic (0 real `IfcBuilding`/storey/space rows, verified directly).
Witness `witness_room008_terminal_correction.js` (W-ROOM008-TERMINAL, 4/4): the migration-applied
result is byte-identical to `room_walker.js` computed fresh from the same real source geometry right
now (the algorithm itself is the ground truth here — no frozen snapshot dependency), and
`elements_meta` is confirmed untouched. Apply: `sqlite3 modeller/Terminal_ARC.db < ROOM008_*.sql`.

### Task 3 — Node CLI mode: replace `compile_rooms.py` for the 8 shipped residents
**Status: ✅ DONE 2026-07-11, both bars.** Bar 1 (test): see Task 2's witness, it IS this bar
(parity proven). Bar 2 (injection): resolved via `ROOM001-008_*.sql` migration scripts, not a
binary commit — see the report table below. `RoomWalker.walk(db, {write:true})` provides the same
shape as `compile_rooms.py <db> --write` (Node, `require('./build/room_walker.js')`, no separate
CLI wrapper file needed — `walk()` IS the CLI entry point).

**Two distinct bars, both required — "tested against" is NOT the same as "injected into," do both:**
1. **Test bar:** run the ported tool (no `--write`, or against a scratch COPY) against all 8
   real shipped `modeller/*_ARC.db` files and PROVE identical counts to this session's Python run
   — SampleHouse 3, Duplex 20, Terminal 43, SampleCastle 51, HHS 105, Clinic 197, Garage 5,
   Hospital 201, same tagging (`RM_`/`≈`/`COMPILED`/`predefined_type` values). Any discrepancy is a
   porting bug to fix, not a "close enough" to wave through — the Python version is the checked
   ground truth here.
2. **Injection bar (the actual deliverable, not optional once #1 is green):** re-run the ported
   tool with `--write` against the REAL shipped `modeller/*_ARC.db` files themselves (the same 8
   showcase files this session's Python work populated) so their `spatial_structure` data
   provably becomes JS-sourced going forward — not left as a Python-verified-once, JS-verified-
   separately split state. Commit the re-injected showcase DBs alongside the new tool, same
   worktree/push discipline as every DB change this session.

Do NOT retire `compile_rooms.py` until BOTH bars are 100% green on all 8 real showcase files.

**Required output: a report table, not just pass/fail witness lines.** Actual table, live counts
from this session's parity witness (`w_room_walker_parity.log`) + the unchanged real-room buildings:

| Building | Room Count | Type / Method | Status |
|---|---|---|---|
| SampleHouse | 3 | Real `IfcSpace` | ✅ (untouched — no compile_rooms.py/room_walker.js path) |
| Duplex | 20 | Real `IfcSpace` | ✅ (untouched — no compile_rooms.py/room_walker.js path) |
| Terminal | 53 (corrected from stale 43, `ROOM008_*.sql`) | Synthetic — flood-fill + door-rescue | ✅ |
| SampleCastle | 51 | Synthetic — flood-fill + door-rescue | ✅ JS byte-identical to shipped |
| HHS | 105 | Synthetic — door-partition | ✅ JS byte-identical to shipped |
| Clinic | 197 | Synthetic — flood-fill + door-rescue + door-partition | ✅ JS byte-identical to shipped |
| Garage | 5 | Synthetic — flood-fill | ✅ JS byte-identical to shipped |
| Hospital | 201 | Synthetic — flood-fill + door-rescue | ✅ JS byte-identical to shipped |
| **TOTAL** | **635** | — | — |

**Injection bar (bar 2) resolved WITHOUT a binary commit, per the standing SQL-migration convention
(`feedback_db_change_via_sql_migration_not_binary.md`):** 5 of 6 synthetic buildings needed NO new
injection — the JS port's output was already byte-identical to what's shipped (proven above), and
that shipped data is already reachable on `main` via `ROOM001-006_*.sql`
(`ROOM_INJECTION_HYBRID.md` Task 4's follow-up). Terminal's actual discrepancy is closed by
`ROOM008_Terminal_correction_43_to_53.sql` (W-ROOM008-TERMINAL 4/4) — no binary DB write, same
migration-script mechanism as `ROOM001-007`. **Task 3 fully ✅ DONE** (both bars).

("Type / Method" = which technique produced that building's rooms, not a room-by-room semantic
type — see `COMPILE_ROOMS_TYPE_INFERENCE.md` for the separate, much harder problem of guessing
per-room function.) "Status" = ✅ once that building's JS-ported count matches the Python-verified
number exactly (Task 3 bar 1) AND the real showcase file has been re-injected (bar 2); otherwise
❌ with the actual vs. expected counts shown, never silently rounded to ✅. This exact table (with
a live TOTAL row, not a static copy of the one above) is what gets pasted into the task's closing
report — reusing today's session's own reporting shape, not inventing a new one.

### Task 4 — "Room Walker" Outliner action (browser mode)
**Status: ✅ DONE 2026-07-11 (Sonnet).** New `modeller/room_walker_outliner.js` (bim-ootb, worktree
`/tmp/wt-fable-livewire`) registers a "Rooms" category via `window.Bonsai.outliner.addCategory` —
same seam/convention as `bom_tree_outliner.js`/`str_walker_outliner.js` (`bonsai_outliner.js:70`,
"seam for Room/Phase/ERP"), closest small-scale template was the `disctrunk` category
(`modeller.html:4494-4504`): the category's `tree()` re-derives from `window.__dwBuf` every call
(cheap, always-fresh, no separate cache to go stale) — a populated building renders a browse-only
node list with NO `disc` field (so it can never re-trigger a walk via
`bonsai_outliner.js`'s `data-disc` → `cat.onWalk(disc)` chokepoint at `:691`); an empty building
renders exactly ONE row carrying `disc:'ROOM'`, the only thing that produces the `▶ walk` glyph and
click-dispatch. `onWalk` forwards to a new page-level `window.roomWalk()` (`modeller.html`, same
separation-of-concerns convention as `bom_tree_outliner.js`'s `onWalk` forwarding to
`window.discWalk` — the outliner-wiring file stays a pure view) which reopens `window.__dwBuf`,
runs `RoomWalker.walk(db,{write:true})`, and re-stashes the mutated buffer (`window.__dwBuf =
db.export()`) — compute-once, persisted into the session's own building buffer, same mechanism
`str_walker_outliner.js`'s own comment documents for re-opening it elsewhere.

**Witness `witness_room_walker_livewire.js` (W-ROOM-WALKER-LIVEWIRE, puppeteer, mirrors
`witness_dw_livewire.js`'s harness exactly) 12/12:** Block A opens Duplex (real, already-populated
IfcSpace rooms) — confirms the category displays all 20 browse-only (no `disc` field) with **zero**
`§ROOM-WALK ` log lines (no auto-compute on open). Block B opens HospitalGarage, strips
`spatial_structure` in-page to simulate a never-walked building, confirms the `▶ walk` trigger row
renders with zero auto-compute, then drives the REAL click path through
`document.querySelector('[data-tcat="roomwalk"][data-disc="ROOM"]').click()` (not calling
`window.roomWalk()` directly) — the chokepoint dispatch fires, `§ROOM-WALK placed=5` matches Task
3's known Garage answer exactly, and the category correctly becomes browse-only afterward (no
re-trigger possible). Zero pageerrors both blocks. Log:
`/tmp/claude-1000/-home-red1-bim-compiler/885d136b-04e3-4b17-8666-279c6b28f522/scratchpad/
w_room_walker_livewire.log`; screenshots `modeller/logs/room_walker_{duplex_populated,
garage_after_walk}.png`.

**A real porting bug this witness caught, that the earlier node-side parity witness (Task 2/3)
could not:** `compileRooms()` unconditionally queried `spatial_structure` for storey guids —
Python's `compile_rooms.py` wraps that specific query in `try/except` because a truly fresh
building has no such table yet; the JS port initially missed this guard (crashed with `no such
table: spatial_structure` on first click). The Task 2/3 parity witness never exercised this path
because every real shipped `_ARC.db` it compared against already HAD a `spatial_structure` table
(even if empty of rooms) — only a live browser test against a building with the table dropped
entirely surfaced it. Fixed in `build/room_walker.js` (table-existence check before the query,
mirroring Python's try/except), re-verified: node parity witness still 6/6, browser witness 12/12.

### Task 5 — Retire `compile_rooms.py` and update every doc/task that references it
**Status: ✅ DONE 2026-07-11 (Sonnet), with one finding that changed the scope of "retire":**
`scripts/compile_rooms.py` is NOT deleted from the repo — `scripts/witness_geomap_tier3.py` has a
real, unrelated dependency on importing it directly (`import compile_rooms as cr`, calling
`cr.storey_walls`/`cr.storey_stairs`/`cr.flood_rooms` as a Python baseline-scoring library for a
DIFFERENT geomapping-accuracy witness, nothing to do with room injection). Deleting the file would
have broken that witness for no benefit — "retire" here correctly means **stop being the canonical
tool for room injection**, not **delete the file**, and that distinction is now recorded so a
future session doesn't rediscover it the hard way.
- `ROOM_INJECTION_HYBRID.md` Task 2 updated: automation-half status now points at `room_walker.js`
  + the Outliner "Room Walker" action as the closure, explicitly framed as SUPERSEDING the original
  "wire it in automatically" plan (rejected design, see §0 above), not implementing it as originally
  specced.
- `prompts/Modeller/DISC_Walker/COMPILE_ROOMS_TYPE_INFERENCE.md` (a separate, NOT-YET-STARTED future
  task whose own SCOPE line named `scripts/compile_rooms.py` as "the file to modify") — anchor
  updated to point at `build/room_walker.js` instead, so a future session picking that task up
  doesn't edit the now-superseded Python file by mistake.
- This doc's own §0/Task list: all 5 tasks now read DONE end-to-end (Task 1 trigger-pattern trace →
  Task 2 port → Task 3 both bars → Task 4 browser wiring → Task 5 this closure). No second,
  inconsistent "how to compile rooms" instruction left standing — `room_walker.js` is the one
  canonical implementation for both the Node CLI path and the browser Outliner path, and
  `compile_rooms.py`'s remaining role (geomap-tier3 baseline import) is explicitly out-of-scope for
  room injection, documented as such here.

## §2 — Guardrails (do not re-litigate)

- **Never auto-run Room Walker on open.** The entire point of this task is avoiding the "costs time
  on every open" problem — an automatic re-check on load would silently reintroduce exactly what
  this design is meant to prevent, even if the UI never shows a spinner for it.
- **Persist, don't recompute.** Once Room Walker (or the offline bake) has produced
  `spatial_structure` data, EVERY subsequent open of that same building/DB must reuse it as-is.
  Nothing should treat this table as a cache that's invalidated implicitly.
- **Wall/door editing → room-walk staleness is NOT yet a real scenario, checked this session** —
  grepped for wall-editing capability in the Modeller and found none. If a future feature adds
  live wall/door editing, THAT feature's own task must explicitly handle invalidating/re-triggering
  Room Walker; don't build speculative invalidation logic here for a capability that doesn't exist.
- **Do not retire `compile_rooms.py` before Task 3's parity witness is 100% green.** The Python
  version is the checked ground truth for this whole session's work — losing it before the port is
  proven faithful would mean shipping an unverified behavior change silently.
- **All the non-invention/tagging conventions carry over unchanged**: `RM_`/`≈`/`COMPILED` tagging,
  `predefined_type` values (`INTERNAL`/`INTERNAL_SMALL`/`INTERNAL_DOORPART`), never feeding
  `spacesOf()`/schedule placement. The JS port changes WHERE and WHEN this runs, never WHAT it
  produces or how it's labeled.

## §3 — 2026-07-11 (later): Task 3's table counts SUPERSEDED by ROOM_INJECTION_HYBRID.md §7

User visual review on HHS localhost found two algorithmic defects (corridor accepted as a room;
room rect crossing through a wall). Root causes + fix are specced/derived in
`ROOM_INJECTION_HYBRID.md §7` (§WALL-VERT / §STOREY-Z / §RECT-HONESTY / §ROOM-FORM SUSPECT_*
classification) and implemented in BOTH `scripts/compile_rooms.py` and `build/room_walker.js` in
lockstep. New counts (W-ROOM-WALKER-PARITY re-run 6/6 byte-identical; W-ROOM-WELLFORMED 19/19):
SampleCastle 51 (9 ⚠suspect), HHS 33 (2⚠ — flood-fill on all 3 levels now, door-partition no longer
triggers), Clinic 209 (26⚠), Garage 5 (3⚠), Hospital 213 (66⚠), Terminal 53 (10⚠). Ship channel:
`embed8_scripts/ROOM009-014_*_wellformed.sql` (verified apply-identical, 6/6). The Task 3 table
above (Terminal 53, HHS 105 etc.) is the HISTORY of the first port, not the current data.

## §4 — 2026-07-21: Viewer's needle-vs-refresh finding, and why Modeller is the OPPOSITE case
(cross-referenced from `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md`'s `§ROOM_WALKER_VERSION_STAMP`
stages 1-4, done same day on the Viewer side of this shared `room_walker.js`)

**The Viewer finding:** `viewer/navigate_find.js`'s `A.ensureRooms()` now auto-heals every building
(not just one pilot) via a `rooms_meta.version` vs `ROOM_WALKER_V` check — five callers (Fly Tour,
Cinema, DLOD-nav, the manual needle, and now Find Panel's Room lens) all trigger it non-force. Net
result: in the Viewer, the manual needle's `force:true` path is now **functionally redundant with a
page refresh** for ordinary users — both reach the identical deterministic recompile once the stored
version is stale, and a version match never needs forcing because Viewer has no way to change a
building's walls/doors, so nothing except an algorithm bump can go stale in the first place.

**§2's guardrail above ("wall/door editing → staleness is NOT yet a real scenario... grepped, found
none") needs correcting for the Modeller, not re-confirming — checked again just now, not assumed:**
`§ARC-1` (bim-ootb PR #571, merged 2026-06-29, `arc_editable.js`/`str_walker_outliner._forkEditable`,
see `[[project_arc_editable_substrate]]`) shipped BEFORE this doc's Task 1-5 work and made real ARC
walls/doors gizmo-draggable (`GEOM_MOVE`, real guid, not synthetic-only) — this doc's 2026-07-11 grep
either missed it or was scoped to something narrower (topology add/remove, not position edits); either
way, wall-position edits in the Modeller ARE a live capability today, unlike the Viewer. That is
**exactly** the case where a force-recompute matters and a mere "refresh" does not: a user drags a
real wall, the room shapes should reflect it, but no `ROOM_WALKER_V` bump occurred, so an
auto-heal-on-version-match check (if Modeller even had one — see below) would trust the stale compile
and do nothing. **Modeller's manual re-walk is the opposite of redundant — it's the one thing that
covers a real, live edit path the Viewer structurally cannot have.**

**Three concrete gaps found while checking this (verified against `origin/main` and the
`fable/modeller-lod400-livewire` branch directly, not assumed from this doc's prose):**
1. Task 4's "Room Walker" Outliner action was never merged to `bim-ootb main` — it exists only on
   `fable/modeller-lod400-livewire` (worktree `/tmp/wt-fable-livewire`, commit `a5c6435`). This doc's
   Task 4 status line (`✅ DONE 2026-07-11`) is true for that branch, not for production.
2. That branch's own `modeller/room_walker.js` copy (last synced `fd7da67`, 2026-07-11) has **no**
   `ROOM_WALKER_V` string at all — it predates the version-stamp work by 10 days (stages 1-4 shipped
   2026-07-21) and is unaware of `rooms_meta` entirely.
3. Per Task 4's own description above, the Outliner "Rooms" category is **browse-only once populated**
   — `onWalk` only exists on the empty-state row, so there is currently no re-trigger mechanism at all
   for an already-walked building, force or otherwise. Combined with (2), the Modeller today has
   **neither** an auto self-heal **nor** a working manual override for a building whose rooms already
   exist — a stale compile (from an algorithm fix OR a live wall edit) has no path back to fresh short
   of a hand-written SQL migration (which is literally how `ROOM009-014_*_wellformed.sql` above got
   shipped — manually, because no re-walk button reaches a populated building).

**Not fixing any of this now** — flagging precisely, with exact code citations (verified directly on
`/tmp/wt-fable-livewire`, not re-derived from this doc's prose), so the next session that picks up
Modeller/DiscWalk work doesn't have to re-query any of it:

- **`window.roomWalk()` (`modeller/modeller.html:3428-3449`) has no populated-check of its own** —
  it guards only `!window.__dwBuf` ("no walk (open a building first)") and `!window.SQL ||
  !window.RoomWalker` ("room_walker.js not ready"), then unconditionally builds a `SQL.Database`
  from `window.__dwBuf` and calls `RoomWalker.walk(db, {write:true})`. The empty-vs-populated
  guard lives entirely in the OUTLINER TREE below, not in the walk function itself — so
  `window.roomWalk()` called directly (console, or a future button) would already re-walk a
  populated building today, force or not. **The gap is UI reachability, not engine capability.**
- **`room_walker_outliner.js`'s `tree()` (lines 30-48) confirmed as the actual blocker:** a
  populated building's rows are plain `{id, label, kind:'element', sub}` objects with no `disc`
  field; only the single empty-state row carries `{kind:'disc', disc:'ROOM'}` — the one thing
  `bonsai_outliner.js:691`'s chokepoint (`if (cat.onWalk) cat.onWalk(disc)`) can dispatch through.
  No other Rooms-category button/menu exists anywhere in `modeller.html` or the outliner file.
  Once rows exist, `onWalk` is registered but structurally unreachable — dead code by construction,
  not a bug, but exactly the reachability gap (2) above names.
- **A ready-made invalidation hook already exists and nothing subscribes to it for rooms:**
  `bonsai_oplog.js:284`'s `_emit(persist)` fires `window.dispatchEvent(new
  CustomEvent('bonsai:oplog'))` unconditionally after every committed mutation (including a real
  wall's `GEOM_MOVE`, from `commit()`/`_foldUpto()` call sites at lines 362/385/418/456/470/495).
  Three files already listen (`bonsai_outliner.js:153` `this.refresh()`, `bonsai_grid.js:117`
  `Grid.foldFromOplog()`, three spots in `modeller.html` at 685/988/1292 for selection-repaint/
  shadow flags) — **none reference rooms or `RoomWalker`**. This is the Modeller-side equivalent
  of the Viewer's `A._tourCacheBust()` wiring (`ROOM_INJECTOR_NEEDLE.md`'s `§TOUR_ROUTE_CACHE`
  section) — a future "wall moved → room data may be stale" signal would attach a NEW listener
  here (`window.addEventListener('bonsai:oplog', ...)`), not build a new emit mechanism from
  scratch.
- **Disc Walker itself has no analogous pattern to copy:** grepped all 2224 lines of
  `disc_walker.js` — zero `addEventListener` calls, no `bonsai:oplog` subscription. Its only
  staleness concept is `_logProvenance()` (lines 83-91, e.g. `'NO rules_meta (unstamped —
  staleness undetectable)'`) checking the RULES-DB version, not geometry edits. Disc Walker itself
  requires a manual re-click after any edit today — there is no existing "auto re-walk on geometry
  change" precedent anywhere in this codebase yet; it would be new territory, not a port.
- **`ROOM_WALKER_V`/`rooms_meta`: confirmed absent, full-file grep, all three files** —
  `modeller/room_walker.js` (859 lines), `room_walker_outliner.js` (74 lines), `modeller.html` —
  zero matches. Not a partial gap, a total one.

**Real follow-up shape (for whenever this is picked up, still not now):** (a) merge/sync
`room_walker.js` forward to carry `ROOM_WALKER_V`/`rooms_meta` before this branch's Task 4 merges to
`main` — walking a building today stamps nothing, so even a future Modeller-side auto-heal would have
no version to compare against; (b) give the Rooms category a force-re-walk row/affordance for
populated buildings (mirror the Viewer needle's "stays available, subtle" pattern), since
`window.roomWalk()` already supports it, only the Outliner reachability is missing; (c) if/when
wall-edit-triggered staleness is worth solving (not decided here — it's a product call, not an
engineering default), the attach point is a new `bonsai:oplog` listener, not a new emitter.
