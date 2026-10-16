<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# SAVE-AS-DB — also persist scene/view state (2026-07-25)

```
# ⚠ DO NOT REMOVE
SCOPE: IDEA / SPEC ONLY — not started, not scoped in detail, no code written. Recorded here so it
isn't lost, not authorized for implementation. Read the log after every run once this moves to build.
```

## ▶ ORIGIN (verbatim sense, 2026-07-25)
While verifying today's Hospital room-topology self-heal (saved via **Save Building**, `Ctrl+S`,
`~/Projects/BIM_DB/Hospital.db`), the user noticed the saved `.db` captures building DATA but not
the SCENE the user was looking at — camera position, active display mode (e.g. Alt-Z x-ray), which
panel was open. User's reaction: *"also prepare or recall the prompts/# on Save As DB feature to
also persist the state the scene was in (wow feature there!)"* — i.e. reopening a saved `.db` should
resume the exact view, not just the building.

## ▶ WHAT EXISTS TODAY (don't re-derive)
- **Save Building** (`Ctrl+S`) / **Open Building** (`Ctrl+O`) pills, `A.saveModelDb()`/`A.openModelDb()`,
  documented `docs/BIMUserGuide.md:393-403`. Save captures "the currently open building, including any
  session edits (clash resolutions, captured 4D schedule, etc.)" — **data and edit-log state, not
  camera/view state.**
- Origin/history of this mechanism: `prompts/LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md` — `A._exportBuildingDb`
  folds a SPLIT (meta+geo) building into one monolith `.db`, zero geometry loss (`W-SAVE-FOLD`). That
  spec's scope was strictly reconciling a stale branch's data/geometry fold onto main — it never touched
  scene/camera state, so this is a genuinely new gap, not something dropped from that work.
- **A related but DISTINCT mechanism already exists and already discussed camera state — and deferred
  it.** `prompts/HISTORY_PERSIST_RECALL.md` (§LOCKED, 2026-06-08) persists the edit/undo timeline in
  IndexedDB, keyed by `A.activeBuilding`, surviving tab-close/page-leave *for the same building URL*.
  Its own text: *"camera-stops with no selection are NOT recorded (by design — §6b IGNORE bucket). If
  'record where I parked the camera' comes up, decide it here too."* That question was raised and left
  open for the IndexedDB-persist mechanism specifically. **This spec is about the EXPORTED FILE
  mechanism instead** (portable `.db`, can move between machines/sessions, not tied to a live IndexedDB
  entry) — a different persistence layer, same underlying question. If either gets designed, check
  whether the camera/view-state shape can be shared rather than invented twice.

## ▶ OPEN QUESTIONS (not decided — do not implement from assumption)
1. **What counts as "scene state"?** Candidates named by the origin conversation: camera
   position/target, active display mode (normal/x-ray/shadow), DLOD on/off. Not yet asked: orbit vs.
   walk mode, which panel was open (Find/Inspect/etc.), active Find query or Room-Path selection,
   Time Machine playhead position. Needs the user's own scoping before building — this file only
   records that the idea exists, not its boundaries.
2. **Where does it live in the `.db`?** A new small metadata table (same shape as `rooms_meta`) is the
   obvious candidate, consistent with this project's existing convention — not decided.
3. **Does Open Building (`Ctrl+O`) always restore it, or only optionally** (e.g. a checkbox/toggle,
   since "just give me the building, not the old camera spot" is a legitimate alternate want)?
4. **Interaction with History Persist/Recall** — if a saved `.db` is reopened on the SAME machine where
   an IndexedDB history entry for that building already exists, which view state wins, or do they merge?

## ▶ ADDENDUM — Tour EDL, versioned, with Loop; video export explicitly OUT of scope (2026-07-25)
Same session, later in the discussion (Auto Tour Scrubber naming thread). Three refinements to the
scope above, not yet decided in detail — recorded so they aren't lost, not authorized to build:

1. **The scrubber's cut/join/heal control is an EDL (Edit Decision List)** — the real film-editing
   term for a plain data file recording cuts/joins/transitions over a source sequence. It sits
   *upstream* of `§TOUR_TIMELINE_SCRUB`'s own "pose = f(T)" build-time mechanism: the EDL edits which
   stops/actions exist and in what order; the scrubber just consumes whatever action list results,
   curated or not. No new pose logic needed for this half.
2. **"Save As Tour" should be VERSIONED, reusing an existing shape rather than inventing one** —
   `LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md` already names a `versions[]` array + `latestVersion`
   index in the landing page's per-project record. A saved building could carry multiple named tour
   EDLs (cuts) the same way, picking one as current — check that shape before designing a new one.
3. **Loop is cheap given the pose=f(T) decision already made** — looping is `T mod duration`, no new
   camera grammar. Open question, not decided: does a loop restart from the highlight-first opening
   (main hall → stairs) every cycle, or only play that opening once and loop just the remainder?
4. **Video/movie export is explicitly OUT of scope here.** The viewer already has a real `.webm`
   export/Record feature (`r` keybinding, per `project_precision_pivot.md`'s taken-keys list;
   referenced directly in `FLY_TOUR_CORRIDOR_GRAPH.md` as something the scrubber's cyan marker must
   not collide with). User's own call: leave video capture to the user's own screencast tool rather
   than building a second in-app path — the existing Record feature stays untouched, unexpanded, and
   is the natural render step downstream of an edited EDL if anyone wants a final video later. Nothing
   in this spec should grow new video-export machinery.

## ▶ §1-4 DECIDED (2026-07-25, user reviewed, proceed) — held back until §TOUR_TIMELINE_SCRUB landed
1. **Scene state = the full candidate list**, not a trimmed subset: camera position/target, display
   mode (x-ray/shadow/DLOD on-off), orbit-vs-walk mode, which panel was open (Find/Inspect/etc.),
   active Find query + selection (GUIDs), Time Machine playhead. **Cost check requested by the user
   before committing to this** — spot-checked against real code (`bim-ootb` `viewer/scene.js`):
   camera position/target are two `THREE.Vector3` (6 floats), display/nav-mode flags are scalars/short
   strings, `_focusedPanel` is a panel id string. The one open-ended field is the Find selection (an
   array of GUIDs, ~22 chars each) — even a few hundred selected elements is low single-digit KB, next
   to a `.db` that runs tens of MB. **Verdict: every candidate is cheap; nothing here needs trimming
   for size.** No further profiling needed before implementation.
2. **New metadata table**, same shape/convention as `rooms_meta` — one row per building, columns for
   each state field above (or a single JSON blob column, implementer's call at code-review time — not
   a decision that needs re-litigating here).
3. **Open Building always restores scene state.** No checkbox/toggle in v1 — simplest behavior, matches
   "wow feature there!" from the origin conversation. (An opt-out can be added later if it turns out to
   be wanted; not blocking v1.)
4. **The `.db`'s saved scene state wins over an existing IndexedDB History-Persist entry** for the same
   building, if both exist on reopen. Explicit/portable/deliberately-saved beats incidental session
   state.

**Addendum's Loop question (§50-65 above) — NOT decided here, still open.** Whoever implements the
Loop refinement asks the user directly: restart from the highlight-first opening every cycle, or play
that once and loop only the remainder. Everything else in the addendum (EDL shape, versioned "Save As
Tour", video export staying out of scope) stands as written above, unchanged.

## ▶ ADDENDUM — fold in Movie Maker (Alt+C) + staffage (Alt+P) as ONE combined save (2026-08-03)
User request: Alt+C Movie Maker panel settings + camera position + Alt+P inserted staffage (pax,
trees, cars) — "and this also goes for scene and opened panels in general" — should all be saved
together into the `.db` and restored exact-as-was on reopen. This is not a new feature: §1-4 above
already scoped "which panel was open" and camera/display/nav state generically (line 75-77); this
addendum is about UNIFYING that with two sibling mechanisms that already exist independently:

1. **Staffage (Alt+P) → DB: already shipped, already on the right choke point.** A `staffage_instances`
   table is written by `_writeStaffageTable()` inside `A._exportBuildingDb()` (`scene.js`), the same
   function `Ctrl+S`/`A.saveModelDb()` calls — see `prompts/STAFFAGE_WALKABLE_PLACEMENT.md:265,297-301`.
   Restore is `A._restoreStaffageInstances()` (same file, `:897-913`). **Nothing to build here** — this
   already round-trips exact-as-saved.
2. **Movie Maker / cinema path (Alt+C) → DB: intended on the same choke point, currently BROKEN.**
   `prompts/CINEMA_PATH_EDITOR.md:4492-4497` documents `_writeCinemaPathTable(db)` at `scene.js:663`,
   meant to write a `cinema_path` table "exactly the way `staffage_instances` already round-trips" — same
   `Ctrl+S` → `_exportBuildingDb()` path. But `:4470-4519` documents an open bug: a plan reopened from
   IndexedDB and then re-saved silently DROPS the `cinema_path` table. **This must be fixed before "exact
   as is" can be claimed** — right now a save→reopen→save cycle loses the Movie Maker state, which is the
   exact failure mode this whole feature request is asking to eliminate.
3. **Scene/camera/panel state → DB: not built yet.** This is §1-4 above, still idea-only per this file's
   own `SCOPE` tag — a new small metadata table (§2, line 84-86), one row per building, written in the
   same `_exportBuildingDb()` call as the other two.

**Combined implementation spec (file layout, no code yet — still Spec-First / not authorized to build):**
- One `Ctrl+S` save writes THREE tables in the same `_exportBuildingDb()` pass: `staffage_instances`
  (existing, untouched), `cinema_path` (existing, once the drop-on-resave bug is fixed), and a new
  scene-state table per §2 above (camera/display/nav/panel/Find-selection/Time-Machine fields).
- One `Ctrl+O`/`A.openModelDb()` restores all three in sequence: staffage instances, cinema path, then
  scene/camera/panel state last (so the final camera pose shown on reopen is the saved view, not wherever
  staffage/cinema-path restoration left the camera mid-process).
- Order matters for a clean "exact as was" reopen — restoring scene/camera state LAST avoids any of the
  other two restore steps clobbering the final camera position.
- Blocking dependency: fix `cinema_path`'s drop-on-resave bug (`CINEMA_PATH_EDITOR.md:4470-4519`) before
  or alongside building the new scene-state table — shipping the new table without that fix still leaves
  the combined save incomplete for Alt+C specifically.
- Code lives in the sibling repo `~/bim-ootb` (`scene.js`, `cinema_path_editor.js`), not in this repo —
  this file documents the spec only.

## ▶ ✅ BUILT 2026-08-03 — scene_state table shipped, witnessed 8/8 + 1 targeted check
**Correction first:** the "fix `cinema_path` drop-on-resave bug first" instruction below was based on
a stale read of `CINEMA_PATH_EDITOR.md`'s dated bug section — that bug (`§CPE_PATH_NOT_PORTABLE`) was
already fixed and merged as PR #1122 (`viewer sw v906`) before this build started. Verified in code
(`cinema_path_editor.js:1210` re-stages on named-plan open, `scene.js:667` guard logs loudly, `effects.js:
6997-7040 _cpeLoadFromDb()` lazily restores from the DB table itself). Nothing to fix — confirmed live,
not re-derived from the doc.

**What shipped** (bim-ootb branch `feat/save-db-scene-state-combined`, worktree `/tmp/wt-scene-save-combined`):
1. `viewer/scene.js` — new `_writeSceneStateTable(db)`, called from `_exportBuildingDb()` in both the
   monolith and split→monolith branches, alongside the existing `_writeStaffageTable`/`_writeCinemaPathTable`
   calls. One-row `scene_state` table: camera pos/target (IFC space, via `A.three2ifc` — same convention
   as `cinema_path`, since `A.modelOffset` is only meaningful to the session that wrote it), `xray_on`
   (`A.xrayOn`), `dlod_on` (`A._dlodEnabled`), `walk_mode` (`A.walkModeActive`), `focused_panel` (id string
   from `window._getFocusedPanel()`), `find_guids` (comma-joined `A.activeGuidFilter`), `tm_on` (`A._tmOn`).
   Every field reads a real, pre-existing public flag — none invented.
2. `viewer/panels.js` — added `A.runPanelAction(id)`, the ONE new public hook this needed: fires an
   `_actions[]` entry's own `fn()` by id (the same call its pill/drawer row makes on tap). No new open
   logic, just exposing what `_actionById` already resolves internally.
3. `viewer/main.js` — new `§SCENE_STATE_RESTORE` block, structurally mirroring the existing `§SHARE_PARSE`
   (S265) hash-restore block but keyed off the DB's own `scene_state` table and running on EVERY load
   (not gated on a URL hash). A hash field wins over the DB's saved default per-field, since an explicit
   share link is a more deliberate ask than the reopener's own last-saved view.
4. Time Machine exact playhead position was scoped OUT — only `tm_on` (on/off) is captured, matching the
   precedent already set by the existing `§SHARE_PARSE` hash mechanism (`hashParams.tm` also only
   toggles on/off, no position). No exposed "current playhead ms" accessor was found in `time_machine.js`
   to restore an exact position without inventing one — named here as an open gap, not silently dropped.

**Witness — `witness_scene_state_combined.js`, run against a local server on the worktree under test
(not the standing sandbox, since this worktree has the code changes):** 8/8 PASS —
`/tmp/wt-scene-save-combined/witness_scene_state_combined.log`. Camera IFC round-trip `maxErr=8.88e-16`.
Confirms: export creates the table with the exact authored camera/xray/find-selection; a FRESH
navigation (in-memory state wiped, not just re-reading the same page) restores camera position/target,
xray, and Find selection; staffage placed before save still restores after reload (no regression from
adding scene_state alongside it). A separate targeted check (not folded into the witness file) confirmed
`focused_panel` specifically: opening Find via `A.runPanelAction('find')` → saved as `focused_panel=find`
→ fresh reload logs `§SCENE_STATE_RESTORE camera panel=find` → `window._getFocusedPanel().id === 'find'`.

**Shipped:** committed `bb7ae97` on `feat/save-db-scene-state-combined`, pushed, PR
[bim-ootb#1152](https://github.com/red1oon/bim-ootb/pull/1152) — not yet merged. No opt-out toggle
(per §3, v1 intentionally has none). Loop's remaining question (addendum, line ~94) stays open until
asked live.

## ▶ FOLLOW-UP 2026-08-03 (LATER) — scene_state also carries the Time Machine cursor position
User asked whether 4D-generated data persists too, in Alt+C and the DB. Answer, precisely: the 4D
schedule DATA itself (`schedules`/`tasks` tables, `schedule_author.js`) already persisted independent
of this feature — unrelated, pre-existing. What did NOT travel was the Movie Maker's own 4D *context*
(which day the camera path was recorded against) — that lives in `cinema_path_editor.js`'s
`panelState` (`tmCursor`/`tmSpanMs`/`dayCounter`), written only to **IndexedDB**
(`bim_ootb_cinema_paths`), never into the portable `cinema_path` SQL table. Still true — NOT closed
by this follow-up (that would mean moving the whole `panelState` object into `cinema_path`, a
separate, larger change, not requested).

What WAS built: `scene_state` (the generic one, §1-4) now also carries the CURRENT Time Machine
cursor position at save time, not just `tm_on`. Commit `0f7dac4`, same PR/branch as above.
- `scene.js` `_writeSceneStateTable`: added `tm_cursor`/`tm_span` columns, read via
  `window.tmGetState()` when TM is active. `tm_span` is drift-detection only — TM re-derives its
  project span from `kernel_ops` on every load (cannot be force-set), same convention as
  `cinema_path_editor.js`'s own `§CPE_PANEL_STATE` span-drift warn.
- `main.js` restore block: after enabling TM, `window.tmSetCursor()` fires ~600ms later (TM's
  `activate()` can inject the derived timeline asynchronously — same reason `tmActivateForBake`
  polls). A span mismatch logs `§SCENE_STATE_RESTORE_TM span drift` but the cursor is still applied,
  clamped to the current project range — never a hard failure.
- Witness extended in place (not a new file): `witness_scene_state_combined.js` now 11/11 PASS —
  added G-SS-2b (write-side: saved `tm_cursor`/`tm_span` match the parked ground truth) and G-SS-6
  (fresh-reload restore: cursor matches within 2ms after a real navigation, TM active). Log:
  `/tmp/wt-scene-save-combined/witness_scene_state_combined.log`.
- Effort/impact assessed before building: additive-only (2 new columns, no back-compat guard needed
  since this table hasn't shipped/merged yet), no impact to any existing saved `.db` or other users.

**Named gap, not built, not asked for:** moving Movie Maker's per-plan `panelState` (checkboxes,
`dayCounter`, its own `tmCursor`/`tmSpanMs`) out of IndexedDB and into the portable `cinema_path`
table — same additive pattern (`cinema_path`'s own `hold_sec` precedent already proves it's safe),
just more fields. Pick up if/when asked.

## ▶ FOLLOW-UP 2026-08-03 (LATE) — Alt+C Movie Maker panel itself now restorable too
User asked why the Alt+C panel couldn't persist. Real reason: `cinemaBtn` in `panels.js` is a
bespoke `onClick` handler, never registered in the `_actions[]` array `A.runPanelAction`/`focused_panel`
capture relies on — invisible to the mechanism, not excluded on purpose.

**Correction to my own earlier claim, made before reading `cinema_maxq.js` closely:** I told the user
"`A.startMaxQualityOrbit()` with no args starts an ~8-minute render bake" — overstated. Reading
`cinema_maxq.js:951` (`if (A.cinemaPathEditor && plan && plan.waypoints && opts.editor !== false)`):
the DEFAULT behaviour (no `opts.editor` at all) already opens the editor UI first, same as a real
Alt+C press — the bake only proceeds after the user clicks OK inside that editor. The real risk case
is the separate `opts.editor === false` shape (scripted/witness bakes only), not the plain no-arg call.
Passing `{editor:true}` explicitly is still the right defensive choice (unambiguous intent, immune to
a future default flip), just not fixing the exact danger I originally described — noted here rather
than left silently wrong.

**What shipped** (commit `74a3fd0`, same branch/PR #1152):
- `panels.js` — new `_actions[]` entry `{ id: 'cinema', ..., fn: function() { A.startMaxQualityOrbit({ editor: true }); } }`. Restore path (`A.runPanelAction('cinema')`) now resolves to this, always explicit.
- `scene.js` — capture side special-cased: the CPE editor is a bare modal (`#cpe-panel`, torn down via `removeChild` in `cinema_path_editor.js`'s `finish()`), never wired into `_registerPanel`/`_focusedPanel`, so `_writeSceneStateTable` checks `document.getElementById('cpe-panel')` directly and treats it as authoritative over the background panel-focus model (a modal on top wins).
- Witness extended in place: **14/14 PASS** — G-SS-7a (write side: `focused_panel='cinema'` while editor open) + G-SS-7 (fresh reload reopens the editor, confirmed via `#cpe-panel` presence, and **no** `§MAXQ_FRAME` bake-progress line ever fires — proof the restore only reopens the UI, never the render).
