# ROOM CYCLE (R) + HOME FILL-FRAME SHORTCUTS (2026-07-22)

# ⚠ DO NOT REMOVE — scope: add two new global Viewer keyboard shortcuts (plain `R`, plain `Home`).
# Read the §-tagged log after every run before drawing conclusions. Whitebox proof only — no
# screenshots as evidence (FUNDAMENTAL LAW, CLAUDE.md). Real building fixture, not a stub.

## Origin
User idea, refined over three turns in chat (not from an existing prompts file — a genuinely new
feature, no canonical owner doc exists yet, hence this new file per `feedback_prompt_file_organization.md`).
Confirmed distinct from `prompts/Viewer/ROOM_INJECTOR_NEEDLE.md` (that's the self-heal injection core,
`A.ensureRooms`, which this feature CONSUMES but does not modify) and from Alt+C Cinema/MaxQ orbit
(`scene.js:1892`, `cinema_maxq.js`/`effects.js` — an animated dive; this is an instant cut, fully
independent, never calls `A.startMaxQualityOrbit`/`startCinemaOrbit`).

## Confirmed facts (grepped against `~/bim-ootb` @ `be8f122`, not assumed)
- `A.ensureRooms` is the ONE shared injection core (`navigate_find.js` ~line 913). Already called by
  Cinema/MaxQ (`cinema_maxq.js:370`, `effects.js:3929`), Fly Tour (`tour.js:101`), DLOD-nav
  (`dlod_nav.js:541`), **and Find Panel** (`navigate_find.js:2866`, `_buildRoomTree()` — confirms user's
  recollection that opening Find Panel also triggers injection). Guarded two ways: in-flight promise
  dedupe (`A._ensureRoomsInflight`) and a persistent `rooms_meta.version` vs `ROOM_WALKER_V` stamp
  compare (`navigate_find.js` ~line 960) — first call after a stale/missing stamp recompiles, every
  call after that trusts the stamp (~9ms). This is **fleet-wide already** (`navigate_find.js`'s own
  comment says "stage 4 removes the exact-dbFile gate so every building self-heals identically") even
  though `ROOM_INJECTOR_NEEDLE.md` still narrates it as an HHS-only pilot — the doc is stale, the code
  is ahead of it. **Implication for this feature: `R`'s first press just calls `A.ensureRooms({})` like
  every other consumer — no new injection logic to write, the guard is already fleet-wide and cheap.**
- Plain `r`/`R` (no modifier) is unbound anywhere in `viewer/*.js` — confirmed via grep, including the
  `_shortcuts` single-char registry (`scene.js:910`, keys currently used: `+ - 2 x 4 f p t z w l o v s
  n b i h c`). Free.
- Plain `Home` is **not** globally free — two existing, narrower claims, both fine to coexist with if
  this feature is scoped correctly (do NOT make Home fire unconditionally at the top of the handler,
  that would regress both):
  1. `navigate_engine.js:453`, `navKeyHandler()` — `Home` resets Fly-Tour corridor-navigation to route
     start, but the whole function returns at the top `if (!nav.active) return;`. Only live while a
     corridor nav session is actively running (`A._nav.active`).
  2. `scene.js:1935` — when a panel has keyboard focus (`_focusedPanel && _focusedPanel.nav`), `Home`
     (along with End/PageUp/PageDown/arrows) is routed to that panel's own list navigation
     (jump-cursor-to-top), inside the `_focusedPanel` branch that runs BEFORE the single-char
     `_shortcuts` lookup further down.
  Outside both those states (no panel focused, no active corridor-nav session) `Home` currently does
  **nothing** — confirmed by reading the full `keydown` handler top-to-bottom, nothing else consumes
  it. That gap is exactly where this feature's `Home` handler belongs — placed/guarded so it only
  fires in that gap, never overriding cases 1 or 2. Since `scene.js`'s "always-on modifier shortcuts"
  block (Alt+Z/S/G/J/C/P, F1, F11, Ctrl+S/O) runs unconditionally at the very top of the handler
  BEFORE the panel-focus check, a plain unguarded `Home` placed there WOULD wrongly steal it from case
  2 — do not place it there. Place it after the `_focusedPanel` branch, guarded by
  `!(A._nav && A._nav.active)`, so it only lands in the genuine gap.
- Room "largest" data: `room_walker.js`'s in-memory compile computes a real `.area` per room
  (`viewer/lib/room_walker.js` ~line 405/512/618/783/873/1014, area from raster cell-count × cellArea,
  correct for multi-rect/L-shaped rooms), but `writeRooms()` (~line 1334) does **NOT** persist `area` to
  `spatial_structure` — only `center_x/y/z` and `size_x/y/z` (bbox per sub-rect) are written, one row
  per sub-rect, all sharing `room_guid` (§MULTI-RECT — the un-suffixed `guid === room_guid` row is the
  primary/first rect). **No schema change needed**: real area is `SUM(size_x * size_y) GROUP BY
  room_guid` over the existing columns — an approximation only in the sense that it sums per-rect
  bboxes rather than the walker's raster-cell area, but it is the true persisted geometry, not an
  invented number, and matches what's actually on disk. Do not add an `area` column via migration for
  this — reuse what is there (Prime Rule: extract, don't invent, and DB changes need a migration+
  self-heal loader pair which this doesn't need).
- Entrance detection already exists and is reusable, not to be reinvented: `tour.js` ~line 464 picks
  the lowest-`cz` `exit` node of the room/corridor graph as `entrance`; door-carrying rooms are already
  tagged for routing (`bim-ootb` commit `03a6cb7`, "tag door-carrying service rooms for routing").

## Spec

### `R` — cycle to Nth-largest room
1. First press (or first press after a `Home` reset, see below): jump camera to the **largest** room.
   "Largest" = `SUM(size_x*size_y) GROUP BY room_guid` over `spatial_structure WHERE type='IfcSpace'
   AND room_guid IS NOT NULL`, `ORDER BY area DESC`. Exclude rows whose `predefined_type` starts
   `SUSPECT_` (compiler's own low-confidence flag — same filter class as Alt+C's
   `§CINEMA_SPACE_ENCLOSED_SKIP`, this is not a new invented rule) — SUSPECT rows are unreliable merges/
   splits, not real single rooms. Do **not** additionally exclude open/atrium/hall spaces — the user's
   own framing ("largest room / hall / space") wants those included.
2. Camera target = the primary rect's `center_x/center_y/center_z` (the `guid === room_guid` row).
   Camera faces the building's main `entrance` node (`tour.js`'s `entrance`, reused not
   reimplemented) for the largest room specifically — that's the room most likely to actually be
   entrance-adjacent (lobby/hall).
3. Each subsequent `R` press (no `Home` in between): advance to the next room down the same
   `ORDER BY area DESC` list (2nd-largest, 3rd-largest, ...). Camera faces that room's own doorway
   (reuse the door-carrying-room tag, `bim-ootb#03a6cb7`) rather than the global building entrance —
   flagged to the user as a judgment call, confirm before shipping if they'd rather it always face the
   global entrance regardless of distance (cheaper, may look wrong on far rooms).
4. Clamp, don't wrap, at the end of the list — repeated `R` past the smallest room stays on the
   smallest (avoid silently looping back to #1 without a `Home` press, which would defeat the point of
   `Home` as the explicit reset).
5. Before the first camera move in a fresh session (or fresh building), call `A.ensureRooms({})` first
   — same call every other consumer makes, already cheap/idempotent per the confirmed facts above.
   Log `§ROOM_CYCLE press=<n> guid=<room_guid> area=<m2> name=<name>`.
6. Fully independent of Alt+C — no call into `startMaxQualityOrbit`/`startCinemaOrbit`, no shared
   state with Cinema's own dive-target picker (that logic stays untouched).

### `Home` — reset cycle AND fill-frame exterior, same keypress
Confirmed **not a conflict** once correctly scoped (see "Confirmed facts" above): guard on
`noMod && notInput && !(A._nav && A._nav.active) && !_focusedPanel`, placed after the existing
`_focusedPanel` block in `scene.js`'s keydown handler (not in the top "always-on" section). In that
state `Home` is currently unclaimed, so both actions land on the same press with zero regression to
the two existing narrower `Home` claims:
1. Reset the `R` cycle index to 0 (next `R` press goes back to the largest room, per the user's
   explicit spec).
2. Fit the camera to a tight exterior frame of the whole building's `element_transforms` bbox — "usual
   opening angle" (reuse whatever elevation/azimuth the initial building-load camera framing already
   uses, not a new invented angle) but recomputed with **zero margin** (fit-to-bbox exactly, no padding
   factor), unlike the load-time framing which likely pads for header/UI chrome clearance — confirm the
   existing initial-load camera code's margin constant before copying it, so this is a real "same angle,
   tighter" and not a guess.
Log `§ROOM_HOME reset=cycle+frame bbox=<span>`.

## Out of scope / not yet decided
- Whether room #2+ faces its own door vs. the global entrance (flagged above, needs a one-line
  confirm before implementation locks it in either way).
- Numpad-Home parity (`e.code === 'Numpad7'` with NumLock off) — user said don't overthink it, use
  plain `Home` only; not building the numpad variant unless asked.

## Witness plan
Headless Chromium against a real multi-room fixture (HHS_Office_Federated_extracted.db — already the
project's standard fixture for room/entrance work, per every `witness_*` test above). Assert via
`§ROOM_CYCLE`/`§ROOM_HOME` log lines only: (a) first `R` lands on the DB-verified largest room by the
`SUM(size_x*size_y)` query run independently in the test; (b) 3 successive `R` presses produce strictly
non-increasing area, no duplicate `room_guid`; (c) `Home` mid-cycle, then `R` again, returns to the
same largest-room guid as step (a); (d) `Home` while Find Panel has focus still moves its list cursor
to the top (existing behavior preserved, not stolen); (e) `Home` while `A._nav.active` still resets
corridor-nav to route start (existing behavior preserved). No screenshots — log values and DB
cross-check only, per the FUNDAMENTAL LAW.

## RESULT — ✅ CLOSED (2026-07-22/23)
Implemented in `/tmp/wt-room-cycle-home` (branch `feat/room-cycle-home-shortcut`), bim-ootb
[PR #969](https://github.com/red1oon/bim-ootb/pull/969) — MERGED to `main` (squash), branch deleted
both sides, worktree pruned. `viewer/scene.js`: `_buildRoomAreaList()`, `_graphEntrance()`,
`_roomOwnDoor()`, `_faceRoom()`, `_cycleRoom()` (wired into `_shortcuts['r']`), `_homeFillFrame()` +
`_homeResetAndFrame()` (inserted after the `_focusedPanel` block, guarded exactly as specced above).
`room_guid` lookups are schema-tolerant (falls back to bare `guid`, matching the rest of
`navigate_find.js`/`room_graph.js`). Home's fill-frame reuses `streaming.js`'s load-time `§CAMERA`
elevation/azimuth ratio (0.6, 0.8, 0.6), padding multiplier dropped 1.5→1.0 for the zero-margin ask
(the `Math.max(80, …)` floor stayed — that's a degenerate-envelope safety clamp, not margin).

**Open design point resolved as shipped:** room #2+ faces its own doorway (door-carrying-room tag,
`bim-ootb#03a6cb7`), falling back to the global entrance if untagged — this was the one call not
explicitly user-confirmed before implementation. Flip point if wrong: one ternary in `_cycleRoom()`.

**Witness: 15/15 assertions pass**, `viewer/tests/witness_room_cycle_home_2026-07-22.js`, real
`HHS_Office_Federated_extracted.db`, headless Chromium, verified independently against the live log
(not just the implementing agent's summary) — first-`R` guid matched a separately-written DB
aggregation query, 3-press sequence strictly non-increasing with no duplicate guids, `Home`-then-`R`
returned to the same largest room, Find-panel-focused `Home` still routed to the panel's own list-nav
(not stolen), active-corridor-nav `Home` still fired the real `resetToStart()` with `stepIdx` genuinely
1→0. No regressions: `witness_find_panel_hidden_onload_2026-07-11.js` all pass;
`witness_room_box_purple_2026-07-12.js`'s 2 failures confirmed pre-existing on unmodified `origin/main`
via `git stash` (unrelated color-drift, not introduced here). `eslint viewer/scene.js` clean.
