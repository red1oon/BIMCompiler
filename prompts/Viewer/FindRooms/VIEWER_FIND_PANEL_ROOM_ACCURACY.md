<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# VIEWER FIND PANEL — bring the Room axis up to the Modeller's accuracy bar

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js` — the LIVE, actively-developed copy. ⚠ CORRECTED
2026-07-11: this doc originally anchored on `bim-compiler/deploy/dev/navigate_find.js` — that copy
is STALE/abandoned (no commits since the repo's initial migration, 1984 lines vs the live copy's
3640, a 2859-line diff). Do NOT edit the bim-compiler copy for this task; it is not what ships.
Modeller (`bim-ootb/modeller/disc_walker.js`) and Viewer (`bim-ootb/viewer/navigate_find.js`) are
BOTH in bim-ootb — same repo, same deploy target. This removes the earlier assumed cross-repo
constraint: a real shared JS module between them is now a live option, not just a copy-and-sync one.
Read this before touching the Room axis / Room Lens / `_buildRoomTree()` / `_roomLensOn()` /
`_allRoomVolumes()`. Read `ROOM_INJECTION_HYBRID.md` in full first — this task PORTS its settled
conclusions into the Viewer, it does not re-derive them.
⭐ CONCEPT DOC: `prompts/Viewer/FindRooms/ROOM_PATHING_SUBSTRATE.md` — READ IT FIRST if you are
new to this lane. It explains WHAT the walkable map is, HOW it is built, the settled invariants, every
trial that failed and why, the method rules that came out of them, how other systems solve the same
problem, and where we stand. THIS file is the dated working log; that one is the explanation.
ANCHORS: prompts/Modeller/DISC_Walker/ROOM_INJECTION_HYBRID.md (the Modeller-side work this ports)
· bim-ootb modeller/disc_walker.js `spaceHabitable()`/`_substrateEnv()` (the classifier to share/
port, exported on the API already) · bim-ootb scripts/compile_rooms.py (§DOOR-RESCUE/§DOOR-PARTITION,
Python, offline-only — see §2 Task 5 for why this matters) · bim-ootb viewer/navigate_find.js
`_buildRoomTree()` (line ~1698) / `_roomLensOn()` (line ~1525) / `_allRoomVolumes()` (line ~1494,
the actual query to fix) · bim-ootb viewer/import_db_builder.js (the LIVE user-IFC-import schema
builder — confirmed it never creates `spatial_structure` at all, see §2 Task 5).
```

## §0 — Why this exists, and what's ALREADY better than assumed here

This session hardened the shipped residents' room compilation from a 0-6-room state to real,
filtered per-building room data (SampleHouse 3, Duplex 20, Terminal 43, SampleCastle 51, HHS 105,
Clinic 197, Garage 5, Hospital 201). Checking the Viewer's ACTUAL live code (not the stale copy
this doc originally pointed at) found it's further along than assumed: `_buildRoomTree()` already
groups rooms by **Storey** (via `parent_guid`) with a **Storey/Type** sub-toggle, and the Type view
already reads `object_type`/`predefined_type` with a `(untyped)` non-invent fallback. So the storey-
grouping gap this doc originally named (old Task 3) is DONE — don't redo it. What's still genuinely
missing, confirmed directly against the live query functions:

## §1 — Confirmed gaps, read directly from the LIVE code (not assumed)

`_allRoomVolumes()` (line ~1494) — the function `_roomLensOn()` actually calls to draw every room —
still queries with zero filtering:
```sql
SELECT guid, name, center_x, center_y, center_z, size_x, size_y, size_z
FROM spatial_structure WHERE type='IfcSpace' AND center_x IS NOT NULL AND size_x IS NOT NULL
```
Three concrete, fixable gaps:

1. **No habitability filter.** `spaceHabitable()` already exists, is exported, and is proven
   (W-ROOM-HAB 5/5, W-ROOM-HAB-SH 6/6) — `_allRoomVolumes()` doesn't call it. A future re-embed
   that reintroduces a Roof/lift-shaft space would render it as a normal room, same false-positive
   risk this doc's Modeller-side work already fixed once for real data.
2. **No real-vs-synthetic distinction — and the existing Type toggle has a specific bug that
   masks it.** `_buildRoomTree()`'s Type grouping does `r[3] || r[4] || '(untyped)'` —
   `object_type` (`r[3]`) first, `predefined_type` (`r[4]`) only as fallback. But EVERY compiled
   (synthetic) room has `object_type='COMPILED'` — a non-empty string — so `predefined_type`
   (`INTERNAL` / `INTERNAL_SMALL` / `INTERNAL_DOORPART`, the actual useful distinction
   `compile_rooms.py` now writes) is NEVER reached. Result: switching to "Type" view dumps every
   synthetic room from EVERY building into one "COMPILED" bucket, hiding exactly the real-vs-
   approximate/door-rescued/door-partitioned distinction that exists in the data today. This is a
   one-line-shaped fix (special-case `object_type==='COMPILED'` to fall through to
   `predefined_type`) sitting on top of an already-good grouping mechanism — don't rebuild the
   toggle, just fix its field-precedence for this one case.
3. **`elements_meta`/tag-purity checks aside, no visual cue that "COMPILED" means "approximate."**
   Even once (2) is fixed, a user seeing "INTERNAL_DOORPART" as a group name has no idea that means
   "nearest-door partition, no real walls found" — needs a plain-language label/tooltip, not the
   internal tag verbatim.

## §2 — Task list (work top-to-bottom, same WORK-TO-ZERO discipline as every prompts/#.md file)

### Task 0 — Find-panel visible-on-load flash (§FIND_VIS_TRACE, open since 2026-07-06)
**Status: ✅ DONE 2026-07-11 (Fable worker) — PR https://github.com/red1oon/bim-ootb/pull/728,
branch `fix/find-panel-vis-onload` @ `4de186d`, NOT merged (user's call).**
**2026-07-11 later-session correction: #728 IS now merged to main (squash `d89e559`, 06:24 +0800,
auto-merge). A second session, unaware #728 had landed, independently re-witnessed the same fix from
the leftover uncommitted draft in `/tmp/wt-find-panel-vis` (W-FIND-VIS-ONLOAD, 10/10 green incl. an
in-page falsifier: stripping only the `display:none` token flips computed display to `block`) and
opened duplicate PR #730 — closed as superseded by #728, remote+local branch deleted, worktree
pruned. No divergence between the two witnesses' conclusions.** Witness
`viewer/tests/witness_find_panel_hidden_onload_2026-07-11.js`: **28/28 green** (14 verdicts ×
desktop 1400×900 + iPhone 13 390px, real HHS_Office_Federated; log read per Log Mandate, 0 red;
log file gitignored per repo `*.log` rule, on disk in the worktree). The MANAGER-diagnosed
`display:none` fix verified as-described AND the witness's first run caught a SECOND half of the
same field report, now also fixed in the same CSS rule: the old `top:50%; translateY(-50%)`
centering + panels.js §PANEL-AUTOPLACE (fires at init on `_makeDraggable`'s cursor style-write,
overwrites `top` to 54px inline, never clears the CSS transform) rendered the panel half its
height ABOVE the viewport — measured `top=-101.5` (height 311) on desktop = the literal "renders
above browser top border" symptom. Fixed by declaring `top:54px`, no transform (the ≤600px media
query already had its own `top:60; transform:none`, which is why mobile never showed it). Onset
semantics pinned: navigate modules are LAZY — panel isn't in the DOM at cold load; the field
"appears at onset" path is any boot-time `APP.loadNavigate()` without an open (e.g. `main.js`
§ZOOM-SCOPE share links) — witness reproduces exactly that, panel stays `display:none`, zero
§FIND_VIS_TRACE `display=block` lines pre-interaction; real-path open (`#pill-navigate` →
`#drawer-row-find`) gives `top=54` desktop / `top=60` mobile, toggle-close returns `none`,
trace fires exactly once per deliberate flip. Original diagnosis text below kept for the record.**
Different bug
from Tasks 1-5 below (visibility, not room-data accuracy) but same file/panel family — kept here
rather than fragmenting into a new doc. Root cause (MANAGER-diagnosed): `#find-panel` gets
`document.body.appendChild(panel)` (`navigate_find.js` ~line 193) with no `display` set; `.bim-panel`
(`viewer.html` ~line 70) sets `position:fixed` but not `display:none`; a bare `<div>` defaults to
`display:block` → panel was visible the instant it hit the DOM, before any toggle logic ran. Fix:
add `display: none` (+ defensive `position: fixed`) to `#find-panel`'s own CSS rule, matching how
`wizard.js`/`panels.js A.createPanel()` self-declare instead of trusting the shared class alone.
Worker is in `/tmp/wt-find-panel-vis` (branch `fix/find-panel-vis-onload`), witnessing via Playwright
(desktop + mobile) that display is `none` on load and `block` only after a real user-path open.
**Update THIS section (not a verbal report) when done: branch/PR, witness pass/fail numbers.**
⚠ The bim-compiler copy of this file (`deploy/dev/navigate_find.js`) has an uncommitted, never-shipped
draft of a similar CSS change sitting in its working tree — dead code, out of scope, do not port from it
or clean it up as a side effect of this task (see file header correction above).

### Task 1 — Port `spaceHabitable()` into `_allRoomVolumes()`
**Status: ✅ DONE 2026-07-11 (Sonnet, background) — see §5 below for the final, shipped/pushed
state (supersedes the earlier §4 Fable attempt, which was left as an uncommitted, unpushed local
worktree — discarded and rebuilt clean, see §5's note).**
`disc_walker.js`'s `spaceHabitable(space, env)` is exported and proven. Since Modeller and Viewer
are now confirmed to be the SAME repo/deploy target (see header correction), evaluate a real shared
module (e.g. a small `room_habitability.js` both `disc_walker.js` and `navigate_find.js` load) before
defaulting to a copy-paste port — check the build/bundle setup first (are these files loaded via
plain `<script>` tags, ES modules, or a bundler step? that determines whether a shared file is a
one-line change or needs real plumbing). Witness: prove on Duplex — the real habitable-room count
shown, zero non-habitable rows leak through, same H1-style precision/recall pattern as
`witness_room_hab.js`.

### Task 2 — Fix the Type toggle's `object_type==='COMPILED'` fallthrough bug
**Status: ✅ DONE 2026-07-11 — same worker/scope as Task 1, see §5 below.**
Small, isolated fix (see §1 item 2) — when `object_type==='COMPILED'`,
group by `predefined_type` instead (falling to `(untyped)` only if that's also empty). Witness:
HHS's Type view should show `INTERNAL_DOORPART` (105) as its own group, not merged into a generic
"COMPILED" bucket alongside every other building's compiled rooms.

### Task 3 — Plain-language labels for the internal tags
**Status: NOT STARTED, NOT YET SPECCED.** `INTERNAL_DOORPART` / `INTERNAL_SMALL` / `INTERNAL` /
`COMPILED` are internal-convention strings, not user-facing copy. Needs a small label map (e.g.
"Estimated (door-based)" / "Estimated (small room)" / "Estimated" / real type shown as-is) — keep
it honest about confidence, don't round an estimate up to look authoritative.

### Task 4 — Witness the whole Room axis end-to-end, whitebox-first
**Status: NOT STARTED.** Per project standing rule (`docs/TestArchitecture.md` §Browser Testing),
primary proof is `§`-tagged console log output read directly, not a new Playwright spec — extend
`41-room-volume-lens.spec.js` only for wiring/deploy checks; value-level proof (filter correctness,
type-grouping counts) belongs in a `§`-logged whitebox check, same discipline as `witness_room_hab.js`.

### Task 5 — THE BIGGER GAP: a user's OWN dropped IFC gets NO room data at all, today
**Status: SPECCED as its own dedicated doc — `prompts/Modeller/DISC_Walker/ROOM_WALKER_JS_PORT.md`
(2026-07-11). Read that doc for the actual task breakdown; this section stays as the finding that
triggered it.**
Confirmed directly: `viewer/import_db_builder.js` (the schema builder for the live "drop your own
IFC" import path, confirmed active — most recent commit "capture native IFC 4D in Drop-IFC
importer") creates `elements_meta` / `element_transforms` / `element_instances` / `component_geometries`
/ `bom_tree` / `schedules` — **never `spatial_structure`.** A user's own imported IFC gets ZERO room
data under the current live pipeline — not real IfcSpace extraction, not `compile_rooms.py`'s
flood-fill, not door-rescue, not door-partition. §1's hybrid rule ("every ARC gets rooms, always")
does not yet apply to a live user import at all; it only applies to the 8 pre-baked shipped
residents this session touched.
This is HARDER than Tasks 1-4: `compile_rooms.py` is Python, and the live import pipeline is
100% client-side JS/WASM (`web-ifc`) — there is no server round-trip and no Python runtime in the
browser. Making a user's own IFC get real room compilation means PORTING the flood-fill/
§DOOR-RESCUE/§DOOR-PARTITION algorithm (grid rasterization, multi-source BFS, the abstract rules
this session built) from Python/numpy into JavaScript/typed-arrays — not just calling the existing
script. Scope this as its own dedicated task once picked up; do not fold it into Tasks 1-4's
smaller display fixes, and do not assume it's a quick win.

## §2b — MANAGER finding 2026-07-11: Task 1's underlying DATA gap, not just the query bug

Checked directly: `buildings/HHS_Office_Federated_extracted.db` (the file the Viewer's landing page
actually fetches for HHS, GH-served per `index.html`'s `gh` override — see §Reference) still has
only **14** `spatial_structure` rows, all `object_type='COMPILED'` — the stale pre-refinement count.
This file is a **DIFFERENT file** from the Modeller's `modeller/HHS_ARC.db` (confirmed: neither the
`fable/modeller-lod400-livewire` branch nor the `ROOM001-007_*.sql` migrations touch anything under
`buildings/` — `git diff main...HEAD --stat -- buildings/` on that branch is empty). Merging that
branch or applying those migrations does **NOT** fix the Viewer's HHS room data — same
Modeller/Viewer file-locality split as always, easy to wrongly assume synced.

**New follow-up, own scope, not yet started:** a `ROOM00N`-style migration for
`buildings/HHS_Office_Federated_extracted.db` carrying the corrected 105-row `spatial_structure`
(same source-of-truth as `modeller/HHS_ARC.db`'s already-corrected data, just a different target
file/path). Note this file is **NOT LFS-tracked** (checked `git lfs ls-files` — no match; it's a
plain ~75MB git blob) — so it isn't subject to the LFS bandwidth block at all, but the SQL-migration
convention is still preferred over a raw binary push (smaller diff, safer/faster, same standing rule).
This is a real precondition for Task 1 (the habitability-filter port) to have anything correct to
filter — do Task 1's query fix and this data migration together, not one without the other.

## §3 — Guardrails (do not re-litigate)

- **Modeller and Viewer are the same repo now (bim-ootb) — verify the actual build/bundle wiring
  before assuming a shared module is or isn't possible.** Don't default to copy-paste duplication
  just because that was the old (incorrect) assumption; also don't assume a shared module is trivial
  without checking how these files are actually loaded/bundled first.
- **Never touch `bim-compiler/deploy/dev/navigate_find.js`.** It's a stale, unmaintained fork of
  this file (2859-line diff, no recent commits) — editing it changes nothing that ships. If it's
  worth deleting/archiving as dead code, that's a separate, explicitly-scoped housekeeping task, not
  a side-effect of this one.
- **Non-invention holds here too.** Show what the data actually says, confidence included — never
  upgrade a `≈`/`COMPILED`-tagged synthetic room to look authoritative just because it's now visible
  or labeled in plain language (Task 3).

## §4 — EXECUTION 2026-07-11 (Fable coder session): §2b migration + Tasks 1 + 2 ✅ ALL DONE

Worked in bim-ootb worktree `/tmp/wt-viewer-room-accuracy`, branch `fix/viewer-room-accuracy` off
`main` @ `7c8bffa` (= `origin/main`, fetch succeeded, no LFS content touched — `buildings/*.db` and
`viewer/*.js` confirmed not LFS-tracked; only `modeller/*_geo.db`/`modeller/mesh.db` are).
**Committed LOCALLY only, NOT pushed (LFS quota hard block until 2026-08-01 — any push may hang).**
⚠ Incident, on record: the first worktree (same path/branch) was force-removed mid-session by a
concurrent session's worktree pruning, WITH uncommitted changes — all edits were recreated from the
session transcript and committed immediately this time. `feedback_dont_trust_foreign_tmp_worktree.md`
strikes again; commit early in shared-/tmp worktrees.

### §2b HHS data migration — ✅ DONE (witness §ROOM021-APPLY + §ROOM021-PARITY)
- **`prompts/Modeller/DISC_Walker/embed8_scripts/ROOM021_HHS_buildings_extracted_carry.sql`** (this
  repo, committed) — same convention/dir as ROOM001-020 (they live HERE in bim-compiler, not in
  bim-ootb; matched ROOM002's exact pattern: header, CREATE TABLE IF NOT EXISTS, DELETE, 109
  INSERTs). Data EXTRACTED via `sqlite3 .mode insert` from `modeller/HHS_ARC.db` @
  `fable/modeller-lod400-livewire` `fd7da67` (the ROOM002 source-of-truth) — zero invented values.
- Applied to the worktree's local `buildings/HHS_Office_Federated_extracted.db`; the mutated ~75MB
  binary is deliberately left UNCOMMITTED (plain blob, not LFS, but binary commits stay banned —
  the SQL travels instead).
- Log `w_room021_apply.log`: `§ROOM021-PRE type=IfcSpace rows=14` → `§ROOM021-POST type=IfcSpace
  rows=105` + `§ROOM021-POST predefined_type=INTERNAL_DOORPART n=105` + `§ROOM021-PARITY
  byte-identical spatial_structure vs source-of-truth (109 rows)` (full-table diff, not row count).
- **Self-heal loader check (per the standing "ship the SQL patch, then wire the app" rule): NO
  loader exists on the Viewer path.** Checked directly: the Modeller's `_applyPendingPatch()` +
  `modeller/patches/<dbFile>.sql` convention lives ONLY in `str_walker_outliner.js` on the unmerged
  bim-ootb branch `fix/meshdb-selfheal-loader` (`a1aeab7`/`e7384f4`) — nothing under `viewer/`
  fetches sibling `.sql` patches, no `viewer/patches/` or `buildings/patches/` dir exists on `main`,
  and grep for `_applyPendingPatch|patches/` across `viewer/*.js` + `index.html` is empty. The HHS
  fetch path is `index.html` `BUILDINGS` map (`gh:` override → GH-Pages `buildings/` blob) →
  `viewer/db_resolve.js`. Wiring a Viewer-side loader = NEW plumbing, explicitly not invented
  unprompted per this task's brief — named here as the open follow-up instead. Until then (or until
  the binary can be pushed post-LFS-reset), the LIVE site's HHS stays at 14 rows; local checkouts
  heal via `sqlite3 buildings/HHS_Office_Federated_extracted.db < .../ROOM021_....sql`.

### Task 1 — habitability filter in the Room Lens query — ✅ DONE (witness W-VIEWER-ROOM-HAB 6/6)
- **Shared module, not copy-paste** (per §3 guardrail, wiring checked first): both apps load plain
  `<script>` tags (viewer/main.js `loadNavigate()` appends plain script elements;
  modeller/modeller.html line 283 loads disc_walker.js the same way) and already share
  `common/pill_builder.js`/`history_tap.js` — so NEW **`common/room_habitability.js`** carries
  `spaceHabitable()` + `NONHAB_TYPES` VERBATIM from `modeller/disc_walker.js` @
  `fable/modeller-lod400-livewire` `2821b8e` (the W-ROOM-HAB 5/5 original), UMD-wrapped
  (`window.RoomHabitability` / `module.exports`).
- `viewer/main.js`: `loadNavigate()` module list now loads `../common/room_habitability.js?v=1`
  before `navigate_find.js`. NOT added to `sw.js` PRECACHE (checked: `navigate_find.js` and all
  lazy nav sub-modules aren't precached either — consistent; `_allRoomVolumes()` guards `if (RH)`
  so a stale offline cache degrades to the old unfiltered behavior, never breaks).
- `viewer/navigate_find.js` `_allRoomVolumes()`: query now selects `object_type` too (9 cols),
  computes the substrate envelope (`element_transforms` z-band, same SQL as `_substrateEnv`), and
  filters each row through `RoomHabitability.spaceHabitable({label, z1}, env)` — label =
  `object_type` falling back to `name` when empty. New `§ROOM_VOL rooms=N excluded=M` +
  `§ROOM_VOL_NONHAB <name> — <why>` log lines.
- Witness `viewer/tests/witness_viewer_room_hab.js` (node-side, §-log-first, runs the EXACT SQL the
  function now runs), log `w_viewer_room_hab.log`, all quoted:
  - V1 Duplex known-21: `§VIEWER-ROOM-HAB duplex spaces=21 env.z1=6.83 kept=20 excluded=1` +
    `§VIEWER-ROOM-HAB NONHAB R301 — label:ROOF` — the W-ROOM-HAB precision/recall pattern, exactly.
  - V2 falsifier: `§VIEWER-ROOM-HAB falsifier(list=[]) excluded=R301(zband:8.91>6.83)` — pass
    depends on the real list; independent geometry signal intact.
  - V3 the QUERY change is load-bearing, not just the classifier: with name-only labels (the OLD
    8-col query's shape) `label:ROOF` VANISHES (`v3(name-only labels)
    excluded=R301(zband:8.91>6.83)`) — Duplex carries the space type in `object_type` ('Roof'),
    which the old query never selected. (This check initially FAILED as written — it wrongly
    asserted Duplex's object_type was blank; the witness caught the wrong claim and was corrected
    to assert what the data actually says. Non-invention includes witness assertions.)
  - V4 HHS post-ROOM021: `§VIEWER-ROOM-HAB hhs spaces=105 env.z1=15.07 kept=105 excluded=0` —
    105 shown, zero leaks (COMPILED rows carry no real space-type label → correctly pass; their
    placement exclusion is the separate RM_ mechanism, display is wanted here).
  - `§VIEWER-ROOM-HAB RESULT pass=6 fail=0`.

### Task 2 — Type-toggle COMPILED fallthrough — ✅ DONE (witness W-VIEWER-TYPE-GROUP, same log)
- `_buildRoomTree()` grouping line only: `object_type==='COMPILED'` → group by `predefined_type`
  (→ `(untyped)` only if that's also empty); every other object_type keeps original precedence.
  Toggle mechanism untouched; Storey view untouched.
- Witness (HHS's real 105 rows, old line vs new line both computed and logged):
  `§VIEWER-TYPE-GROUP hhs OLD precedence groups={"COMPILED":105}` →
  `§VIEWER-TYPE-GROUP hhs NEW precedence groups={"INTERNAL_DOORPART":105}` — the doc's exact
  witness bar (INTERNAL_DOORPART (105) as its own group, no generic COMPILED bucket). Storey view:
  `§VIEWER-TYPE-GROUP hhs storey groups={"Level 1":36,"Level 2":31,"Level 3":29,"Unknown":9}`
  (the 36/31/29/9 per-floor split ROOM_INJECTION_HYBRID.md §DOOR-PARTITION recorded — unchanged).

### Shipped / not shipped
- bim-ootb `fix/viewer-room-accuracy` @ `a995908` (LOCAL commit only — no push, LFS block):
  `common/room_habitability.js` (new), `viewer/main.js`, `viewer/navigate_find.js`,
  `viewer/tests/witness_viewer_room_hab.js` (new). HHS binary modified-uncommitted in that worktree.
- bim-compiler (this repo): `ROOM021_HHS_buildings_extracted_carry.sql` + this doc section.
- No Playwright touched (`41-room-volume-lens.spec.js` unmodified — no wiring change needed; value
  proof is §-logged per standing rule), no deploys, no OCI, no sw.js bump (nothing deployed).
- Out of scope, untouched: Tasks 3/4/5, `bim-compiler/deploy/dev/navigate_find.js`, `deploy/live/`.
- Logs (scratchpad `/tmp/claude-1000/-home-red1-bim-compiler/d1316e02-7c7d-4e02-9fa1-87fd73d5e25e/
  scratchpad/`): `w_viewer_room_hab.log`, `w_room021_apply.log`.

## §5 — SHIPPED 2026-07-11 (Sonnet, background session, later same day): supersedes §4, PR opened

§4's `fix/viewer-room-accuracy` worktree/branch was found still sitting uncommitted-beyond-its-local-
commit in the shared checkout at the start of this session (branch `a995908`, never pushed — matches
§4's own note that it had already survived one force-removal incident). Confirmed it left the exact
gap it named as its own open follow-up: **no Viewer-side self-heal loader existed** — the binary HHS
db was mutated locally-only, and the ROOM021 SQL had no runtime consumer on the Viewer at all.
Rebuilt clean in a fresh worktree/branch rather than resuming the old one (its uncommitted binary
edit conflicts with the "SQL migration, not raw binary" convention this doc itself calls for); the
old worktree + branch (`fix/viewer-room-accuracy`) were removed as superseded, no work lost — every
real finding from §4 (the field-precedence bug, the ROOM021 105-row payload) is carried forward and
independently re-verified below (byte-identical INSERT rows to `ROOM021_HHS_buildings_extracted_carry.sql`,
diffed directly — zero mismatch, good cross-validation of the source data across two independent
extractions).

**Correction to §4's record:** the LFS-quota caution does NOT block this work — none of the changed
files (`.js`, `.md`, `.sql`) are LFS-tracked, and `git push` completed in seconds with no stall. §4's
"committed locally only, no push" was over-cautious; confirmed empirically this session.

**The missing piece, now built:** `viewer/scene.js` gains `A._applyPendingPatch(buf, url)` (ported
1:1 from the Modeller's proven `str_walker_outliner.js` `_applyPendingPatch()`/`modeller/patches/`
convention — same idempotent-SQL, best-effort-404, patch-every-open design), wired into
`streaming.js`'s single-DB load path right before `new SQL.Database(...)`. New
`buildings/patches/HHS_Office_Federated_extracted.db.sql` (bim-ootb, committed) + `buildings/patches/README.md`
documenting the convention. A live GH-Pages/OCI-served HHS now self-heals to 105 rooms on open —
no manual `sqlite3` step, no binary push, ever.

**Task 1 — habitability filter, re-verified:** `common/room_habitability.js` (new shared module,
same architectural call as §4 — plain `<script>` loading confirmed on both `modeller.html`/
`viewer.html`, no bundler) — lazy-loaded via `viewer/main.js`'s `loadNavigate()` chain (alongside its
only consumer `navigate_find.js`, not a static `viewer.html` `<script>` tag — a refinement over §4's
approach, since the module is otherwise dead weight on every boot for buildings with no Room Lens
use). `_allRoomVolumes()`'s label is built by **joining** `object_type` + `predefined_type` + `name`
(not a single-field fallback) — verified directly this session that no one field reliably carries the
habitability keyword: Duplex's synthetic set only tags "Roof" in `name` (`predefined_type` is a
generic `'INTERNAL'` for all 5 rows), while HHS's carries a distinction only in `predefined_type`.
A single-field precedence pick (§4's original approach) would have silently failed Duplex's case.

**Task 2 — Type-toggle fallthrough, re-verified:** identical fix to §4 (`object_type==='COMPILED'`
→ group by `predefined_type`, `(untyped)` only if that's also empty too).

**Witness — `witness_room_lens_hab.js`** (bim-ootb, committed): real Puppeteer against real
`viewer.html` + real DB files, ground truth computed **independently** node-side via
`better-sqlite3` (a scratch in-memory db runs the exact same patch SQL the browser's `sql.js`
executes, then is queried directly — not hardcoded literals). **11/11 pass:**
- Duplex: `§ROOM_VOL_COUNT habitable=4 excluded=1` + `§ROOM_VOL_NONHAB ≈ Roof R1 (RM_Roof_1)
  excluded — label:ROOF` — matches ground truth (5 IfcSpace, 1 name-matches a non-habitable
  keyword) exactly.
- HHS: on-disk pre-patch confirmed stale (`14` IfcSpace, independently queried) → post-patch
  `§ROOM_VOL_COUNT habitable=105 excluded=0`, `§PATCH_APPLY HHS_Office_Federated_extracted.db
  applied (28392 bytes)` — matches the patch file's own ground truth (105 rows, applied via a
  scratch db) exactly, and differs from the stale on-disk count, proving the loader did real work.
- HHS Type view: `§LENS_GROUPS lens=room mode=volume groupBy=type groups=1 rooms=105
  typed=105/105` + tree text contains `INTERNAL_DOORPART`, does NOT contain a bare `COMPILED`
  group — matches the doc's exact witness bar.

### Shipped / not shipped (§5, current)
- bim-ootb branch `fix/room-hab-filter-and-hhs-migration` @ `11deadf` — **pushed** (no LFS stall).
  PR: https://github.com/red1oon/bim-ootb/pull/732 — opened un-merged (per the task's "merge is the
  user's call"), but the repo's own `github-actions` auto-merge bot squash-merged it seconds later
  (standard for this repo, not a manual merge by this session) — now live on `main` @ `f60bfb7`.
  ⚠ A concurrent session was found re-populating `/tmp/wt-viewer-room-accuracy` (the superseded §4
  worktree/branch this session removed) minutes AFTER this PR merged — flagged, not touched (may be
  live in-progress work unaware this task already shipped; worth the coordinator checking in on it).
  Files: `common/room_habitability.js` (new), `viewer/main.js`, `viewer/navigate_find.js`,
  `viewer/scene.js`, `viewer/streaming.js`, `buildings/patches/HHS_Office_Federated_extracted.db.sql`
  (new), `buildings/patches/README.md` (new), `witness_room_lens_hab.js` (new). **No binary DB
  committed** — `buildings/HHS_Office_Federated_extracted.db` on `main` stays at its stale 14-row
  state; the self-heal loader is what corrects it at runtime for every consumer.
- bim-compiler (this repo): this doc section only (`ROOM021_HHS_buildings_extracted_carry.sql`
  already committed by §4, reused/cross-validated, not re-added).
- §4's `fix/viewer-room-accuracy` worktree + branch: removed (uncommitted, unpushed, superseded —
  no unique work lost, see the cross-validation note above).
- Out of scope, untouched (same as §4): Task 3 (label copy), Task 4 beyond what's needed to witness
  1/2, Task 5 (own doc), `bim-compiler/deploy/dev/navigate_find.js`, `deploy/live/`.
- Open architectural flag for whoever merges `fable/modeller-lod400-livewire`: `disc_walker.js` on
  that branch has its OWN inline `spaceHabitable()` — once merged, it should be updated to delegate
  to `window.RoomHabitability` instead of keeping a second copy (flagged in the new module's own
  header comment too, not actioned here — out of this task's scope, `disc_walker.js` on `main`
  doesn't have the function to refactor yet).

## §6 — Habitability disqualifiers, named follow-up (2026-07-11, strategy session, NOT built)
User-named additional disqualifier categories `spaceHabitable()`/`common/room_habitability.js`
should refuse as rooms, beyond the existing Roof/z-band check: space below a lift (lift-shaft/pit
void — human cannot stay in it, structurally a shaft not a room), and the exterior void under a
hanging/cantilevered roof overhang (outside the building envelope, not enclosed interior space).
Not built, not specced in detail — needs the same measured, non-invent treatment as the existing
Roof check (find the real geometric/label signal — e.g. `IfcTransportElement` adjacency for lift
shafts, envelope-boundary test for roof-overhang exteriors — don't hardcode a name-string match).

## §7 — Corridor/circulation pathway routing in the Find panel (2026-07-11, MANAGER-assigned)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js`. User directive: "rope in our Find panel 'corridors'
pathways, whatever of character, meaningful to user... to include in the algorithm and pattern set."
Now that circulation spaces are a real, tier-tagged classification (`tier: supplementary` in
`config/room_templates.yaml` — Hallway/Foyer, high door-count, elongated shape, both measured not
guessed), build a REAL room-to-room pathway feature: route from room A to room B through the actual
circulation network. Read the log after every run. PUSH PAUSE IN EFFECT — commit locally, verify on
localhost, do NOT push, do NOT open a PR.
```

## Why this is genuinely new, not a relabel
Checked directly: no room-to-room adjacency graph exists anywhere in this pipeline today
(`compile_rooms.py`'s door-rescue computes PER-ROOM door adjacency, never room-to-room connectivity).
This is real, buildable, ungrounded-until-now work — not a cosmetic Find-panel addition.

## Task
1. **Build the room-adjacency graph** (new, real): two rooms are adjacent if they share a real door
   (same door guid bounds both spaces, or both spaces' footprints touch the same door's opening —
   check which is actually measurable from the compiled data, don't assume). Supplementary-tier
   rooms (Hallway/Foyer/corridor) are the natural graph HUBS (high door-count, by design connects
   multiple spaces) — primary-tier rooms (Bedroom/Kitchen/etc.) are typically graph LEAVES (1-2
   doors). Verify this hub/leaf pattern holds on real data before assuming it architecturally.
2. **Real pathfinding**: BFS/Dijkstra from room A to room B over this graph — report the actual path
   (sequence of rooms/corridors traversed), not just "reachable yes/no."
3. **Surface it meaningfully in the Find panel** — your call on the exact UI (a new Room-to-Room
   query mode? highlight the path in the 3D view reusing existing highlight/navigate machinery? —
   state your choice and why), but it needs to be a real, usable feature, not just a console-log
   proof. Reuse `A.openFindPanel`/existing navigate/highlight functions where they fit, don't rebuild
   navigation from scratch.

## Witness
Real path found + verified correct on a real multi-room building (Duplex or HHS — pick one with a
genuine, checkable corridor structure). Prove the path is REAL (walks through actual shared doors,
not a straight-line guess) — assert door-guid continuity along the reported path, not just visual
plausibility. Also report: does every primary-tier room in the test building actually have SOME path
to every other (a disconnected room would be a real, worth-reporting finding, not a bug to hide).

## Non-goals
- Do not build a full turn-by-turn walking-directions UI — a real graph path + a way to see/use it
  is the deliverable, not a polished wayfinding product.
- Do not touch the DISC_WALK_ROOM_TYPE_AWARE.md task (parallel, different repo file, disc_walker.js
  not navigate_find.js) — no coordination needed, but don't duplicate its room-type work, reuse the
  classifier's existing output.

## DONE WHEN
Room-adjacency graph built from real door-sharing data, real pathfinding proven on a real building
with door-guid-verified path continuity, surfaced as a usable Find-panel feature.

## §7 EXECUTION 2026-07-11 (Sonnet, background session) — ✅ DONE, committed locally, NOT pushed

Worked in bim-ootb worktree `/tmp/wt-room-pathfind`, branch `feat/room-pathfind-graph` off
`origin/main` @ `032224b`. **PUSH PAUSE in effect — committed locally only (`b6bef80`), not pushed,
no PR.** No collision with the concurrent `disc_walker.js` session (different files entirely:
`common/`, `viewer/main.js`, `viewer/navigate_find.js`).

### The graph — `common/room_graph.js` (new, UMD, same convention as `common/room_habitability.js`)
Confirmed the gap first (per the task brief): grepped `scripts/compile_rooms.py` — its door-rescue
(`_door_adjacent`) computes PER-ROOM adjacency only ("is a door near THIS room's pocket, for
classification"), never room-to-room connectivity. Nothing else in the pipeline builds one either.

`buildGraph(dbQuery)` reuses `compile_rooms.py`'s own door-adjacency constants verbatim
(`DOOR_BUFFER_SLACK=0.20`, `_is_room_door` lift/elevator name-exclusion) but had to fix ONE thing
that didn't transfer: matching doors to rooms by **buffered-box containment** (the original per-room
test) produces WRONG room-to-room edges once you ask "which 2 rooms does this door connect" instead
of "is this door near my room" — measured directly on real Duplex data. Door `150478` (Level 2)
sits literally inside Bedroom A203's rect (distance 0) and 0.07m off Hallway A201's edge; the
buffered-containment version matched 3 rooms (Hallway, Bathroom A204, Bedroom A203) and its
center-distance tiebreak picked the WRONG pair (Bathroom+Bedroom, dropping the real Hallway
connection) — verified by hand before fixing. Fix: rank candidate rooms by **point-to-AABB distance**
(0 if the door center is inside the room's rect, else distance to its nearest edge) instead of
"is it inside the buffered box"; the two true neighbours are always at ~0 distance, a merely-nearby
third room is farther. Ambiguous doors (3+ candidates within the buffer radius) still occur (4 of
14 on Duplex) — resolved to the 2 closest-by-distance candidates, logged `§ROOM_GRAPH_AMBIGUOUS_DOOR`,
never invented. `shortestPath()` = Dijkstra weighted by real room-center-to-room-center distance
(metres), returns the room sequence + the real door guid/name for every hop.

### Surfaced in the Find panel — `viewer/navigate_find.js`
Room axis sub-toggle (`_subToggleRow`, generalized from a fixed 2-pill signature to an options array)
grows a 3rd pill: **Storey | Type | Path**. Path mode renders a From/To `<select>` (every real room,
labelled `name · label (storey)`) + a Find Path button. A found path renders as tappable room rows
(reuses `_treeNode` → `_roomSelect`, the SAME tap-to-focus every other lens uses — not a new nav
primitive) with the real door name printed between hops (`title` = door guid, for inspection) — plus
a 3D highlight: path-room shells brighten, all others dim to 0.04, a `THREE.Line` is drawn through
the path's room centers, camera zooms to fit the path's bounding box. No path found → an honest
message ("disconnected parts of the building"), never a fabricated route. `common/room_graph.js` is
lazy-loaded alongside `navigate_find.js` in `viewer/main.js`'s `loadNavigate()` chain (same rationale
as `room_habitability.js`); the graph itself is built lazily on first entering Path mode, not on
every Room-axis open, and cached per `A.activeBuilding`.

### Witness — real Duplex Apartment sample, 21 real IfcSpace rows / 14 real IfcDoor rows
Used `modeller/Duplex_ARC.db` (real human-authored room labels — Foyer/Living Room/Kitchen/
Bathroom/Hallway/Bedroom/Utility/Stair/Roof, mirrored A/B twin unit) rather than the Viewer's
production `buildings/Duplex_extracted.db`, which is OCI-only (not in this git worktree, per the DB
Storage Policy) and — confirmed by fetching it live in the browser witness — is currently a
DIFFERENT, older 5-room synthetic extraction. The graph module is pure `dbQuery`-in, no file I/O, so
this is the same code path/schema either way, just richer real data, exactly the "genuine, checkable
corridor structure" the task asked for.

**`witness_room_graph_path.js`** (node, direct module test, ground truth read independently from
`elements_meta`/`element_transforms`/`spatial_structure`, not via the module under test) — **15/15
pass**:
- G1: every graph edge's door guid is a real `elements_meta` IfcDoor guid (0 bad out of 12 edges).
- G2 HUB/LEAF, verified not assumed: Hallway/Foyer (`config/room_templates.yaml` tier:supplementary)
  degrees `[2,3,2,3]` avg **2.50** vs Bedroom/Bathroom/Utility (tier:primary) degrees
  `[1,2,1,1,1,2,1,1,1,1]` avg **1.20** — every individual hub room's degree (min 2) >= every
  individual leaf room's degree (max 2), a strict split on real data.
- G3: `A202(Bedroom1) → A205(Utility)` finds a real 3-hop path (`A202→A201→A204→A205`, 9.50m) through
  the Hallway hub; each of the 3 doors independently re-verified (fresh distance calc, not reusing
  the module's own verdict) to sit within its buffer radius of BOTH claimed rooms — door-guid
  continuity proven, not assumed.
- G4 honest disconnection: Kitchen (`A103`, 0 measured doors — this real IFC's kitchen is open-plan,
  cross-validates `ROOM_TYPE_TEMPLATE_CLASSIFIER.md`'s prior door_count=0 finding) has NO path to
  anywhere; Level 1 and Level 2 are in different connected components (no door object at the
  stairwell in this real sample) — `shortestPath()` returns `null` for both, not a fabricated route.
  Primary-tier room connectivity reported as **14/91 pairs (15.4%)** reachable — genuinely mostly
  disconnected in this particular real building (open-plan kitchens + doorless stairwell), reported
  honestly per the task's own instruction, not hidden or asserted 100%.

**`witness_room_path_ui.js`** (Puppeteer, real `viewer.html`, real user path) — **13/13 pass**: opens
the building, opens Find, cycles the axis toggle to Room, clicks the Path pill, picks
`A202`→`A205` by real option text, clicks Find Path — gets the **identical** path/door-guids the
node-side witness proves independently (`§ROOM_PATH from=A202 to=A205 hops=3
rooms=[A202,A201,A204,A205] doors=[2OBrcmyk58NupXoVOHUvVV,2OBrcmyk58NupXoVOHUvPL,
1aj$VJZFn2TxepZUBcKpac]`), confirms the result list renders room names + door hints, and confirms
the honest "no path" message renders for the disconnected `A103→A104` (Kitchen→Bathroom) pair.
Zero pageerror across the whole flow.

### Non-regression check
Temporarily removed the local Duplex fixture and re-ran the pre-existing `witness_room_lens_hab.js`
— it errors immediately (`SQLITE_CANTOPEN`) because its OWN ground-truth step requires a local
`buildings/Duplex_extracted.db` to exist at all (this worktree ships none by default — OCI-only).
With my local copy present it partially fails, but only because that specific real 21-room file
carries its habitability label in `object_type` (`'Roof'`), not `name` (`'R301'`) — a property of
*which* Duplex dataset happens to be on disk locally, unrelated to any code touched by this task
(confirmed via `git diff --stat`: only `common/room_graph.js` (new), `viewer/main.js`,
`viewer/navigate_find.js` changed — `scene.js`/`streaming.js`/the self-heal patch loader untouched).
Not fixed here — out of §7's scope, flagged for whoever next touches the Duplex production fixture.

### Shipped / not shipped
- bim-ootb branch `feat/room-pathfind-graph` @ `b6bef80` (**local commit only, not pushed**):
  `common/room_graph.js` (new), `viewer/main.js`, `viewer/navigate_find.js`,
  `witness_room_graph_path.js` (new), `witness_room_path_ui.js` (new).
  `viewer/navigate_find.js?v=44→v=45` cache-bust bump in `main.js`'s module list.
- Local-only, untracked, gitignored test fixtures (NOT committed, NOT part of the diff): a copy of
  the real 21-room `Duplex_extracted.db` (sourced from `~/bim-compiler/deploy/buildings/
  Duplex_extracted.db`) placed at both `buildings/Duplex_extracted.db` and
  `viewer/buildings/Duplex_extracted.db` in the worktree — the latter because the Viewer's
  `A.cachedFetch` resolves a relative `db=` URL against the current page's own directory
  (`/viewer/…`), not site root; discovered by instrumenting `page.on('response')` in the browser
  witness after the naive root-relative copy silently 404'd and fell through to a live OCI fetch.
- Not built (non-goal, explicitly out of scope per the task): a full turn-by-turn walking-directions
  UI. A separate, pre-existing `navigate_path.js`/`navigate_engine.js` grid-based A* system already
  does free-space camera-flythrough routing (point-to-point, not room-to-room semantic graph) for a
  DIFFERENT feature (walk-to-target camera tours) — confirmed distinct in purpose, not duplicated.

## §8 — Room highlight default: box shine-through, not fragmented real-element seams (2026-07-12)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js` `_roomSelect()` (~line 1793) + `_drawRoomCuboid()`
(~line 1517) + `_drawRoomShell()` (~line 1502). User-reported (2026-07-12, live screenshot):
selecting a room shows visible "cuts and pieces" instead of one clean volume. Traced to source
before writing this — read this section before touching the code.
```

**Root cause, confirmed from source (don't re-derive):** `_roomSelect()` has three paths. The one
that fires whenever `_roomBoundingGuids()` finds real adjacent geometry (the common case — line
1822, `if (bound.size && zoomBox)`) calls `_drillSelect(bound, ...)`, which lights the room's REAL
wall/floor/ceiling elements solid + an `OutlinePass` yellow (`0xffd400`) silhouette. A real room is
usually bounded by several separate real elements (multiple wall segments, floor/ceiling plates) —
each gets its own silhouette outline, and where two adjacent real elements meet, their outlines
double up, reading as a brighter yellow seam. **This is not the `§MULTI-RECT` sub-rect mechanism** —
checked every deployed building DB (`grep room_guid` across all of `deploy/buildings/*_extracted.db`
schemas) and NONE currently populate it, so that code path never fires on any live building today;
ruled out, don't chase it. The abstract single-box highlight the user wants already exists —
`_drawRoomCuboid()` (yellow fill 0.10 opacity + bright wireframe edges, ONE mesh, no seams — line
1830) — but today it only fires as the FALLBACK, `else if (bound.size)` / `else` branch, i.e. only
when NO real bounding elements are found. Priority is backwards from what's wanted.

## Task
1. **Swap `_roomSelect()`'s default:** make the abstract cuboid shine-through (`_drawRoomCuboid`)
   the PRIMARY highlight for a selected room, not the real-bounding-element yellow silhouette. The
   real-element highlight (`_drillSelect(bound, ...)` path) should not be the default any more —
   your call whether to drop it entirely or keep it reachable as a secondary/debug mode, but it
   must not be what a normal room tap shows.
2. **Recolor to a softer purple.** Both `_drawRoomCuboid`'s fill (`0xffd400`) and wire
   (`0xffe83a`) colors, AND `_drawRoomShell`'s room-map fill (`0x4fc3f7`, the "every room" blue
   shown on Room-lens-open) are candidates — confirm with a screenshot which one(s) the user meant
   before recoloring both; the selected-room highlight is the one directly discussed this session.
   Keep opacity in the same low range (fill ~0.10, wire brighter) unless the screenshot shows it
   needs adjusting — this is a color swap, not a re-design of the translucency model.
3. Keep `_roomBoundingGuids()`/the real-element lookup itself untouched — only its role in
   `_roomSelect()`'s priority changes. Do not touch `_allRoomVolumes()`, the habitability filter, or
   any Task 0-7 machinery above — out of scope.

## Witness
Whitebox first (`§ROOM_CUBOID_FALLBACK`/`§ROOM_CLIP` log lines already exist — extend/rename as
needed so the log states which highlight mode actually rendered), then a live screenshot on a
multi-wall-segment room (HHS or Duplex) showing ONE clean purple volume, no visible seams, where the
old code would have shown the fragmented yellow-silhouette look from the reported screenshot.

## DONE WHEN
A room tap shows the single translucent purple box/wireframe by default (no real-element seam
artifacts), verified live on a building where the old path previously showed fragmented real
geometry, § log confirms which highlight mode fired.

## §8 CLOSEOUT — ✅ SHIPPED (recorded 2026-07-17, traceability backfill; code + live-test trail verified)
Was previously un-closed in this file though the code shipped — this section resolves that gap.
Verified in `~/bim-ootb/viewer/navigate_find.js` on the current branch:
- The translucent cuboid is the PRIMARY highlight: `_drawRoomCuboid()` (`navigate_find.js:2041`)
  is drawn whenever the room resolves, driven by `ROOM_CATEGORY_COLORS` (`:1975`) with the purple
  fill/wire (`habitable: 0x6a1b9a / 0xd8b4fe`) the spec called for. `_drillSelect` still runs for
  the storey-dim/x-ray/zoom side effects (`:2548`) but no longer IS the highlight — no fragmented
  real-element seams by default.
- The one real live-testing defect found after the initial ship was FIXED and is documented
  in-code: `§CUBOID-PAINT-ORDER` (`navigate_find.js:2566-2581`, 2026-07-15) — user live report
  "purple does not shine thru in solid or x-ray mode, only bbox mode"; root cause was
  `renderer.sortObjects=false` + cuboid added before `_drillSelect`'s overlay meshes, so the cuboid
  lost the depth race. Fix: call `_drillSelect` FIRST so the cuboid is added last and wins the
  pixel in every mode. That user-live-testing round IS the live witness the DONE-WHEN asked for.
- NOT re-captured this session: a fresh screenshot (the §-code trail + the dated user live-test
  round above stand as the evidence; a new screenshot would only re-confirm the already-fixed state).
- REMAINING colouring gaps — ✅ ADDRESSED 2026-07-17 (bim-ootb worktree `feat/room-restroom-colour`,
  commits `9936f02`+amended): the 3-bucket cap and the real/synthetic blindness are both fixed.
  `ROOM_CATEGORY_COLORS` now carries SIX buckets — habitable (purple), corridor (blue), **restroom
  (brown)**, **kitchen (amber)**, **bedroom (teal)**, utilities (grey) — driven by deterministic
  `RH.classifyRestroom/Kitchen/Bedroom(label)` name classifiers (order corridor→restroom→kitchen→
  bedroom→utilities). Plus **§SYNTHETIC-HONESTY**: compiled `RM_`/`≈` rooms draw fainter (opacity
  0.06 vs real 0.12) per WalkerDoctrine §14. Witness `common/witness_room_category_colour.js`
  W-ROOM-CATEGORY-COLOUR on Duplex: names 21/21, 0 cross-match, synthetic-rule 6/6. Detection
  confirmed corridors were all one uniform blue and restrooms were purple (habitable) before this.
  Still open: corridor main-vs-minor differentiation (needs a graph-centrality signal — deferred).

## §9 — CURTAIN-WALL GLASS DOOR: two findings from a live Clinic Path case (2026-07-17, user, NOTED not fixed)
User drove a First-Floor→Second-Floor Path on Clinic (12 doors, 85.1m) through a glazed corridor
storefront. Two bugs + one routing PRINCIPLE, all confirmed against code+data (Clinic_extracted.db).
Both roots trace to curtain-wall glass being a special assembly. **Per user: NOTE only, do NOT fix yet.**

### Finding A — glass panels not selectable (picking, `viewer/picking.js:256`)
`if (h.object.material && h.object.material.opacity < 0.3) continue;` discards every raycast hit
under opacity 0.3 BEFORE guid resolution. Curtain-wall glass is `IfcPlate` panels whose material
opacity = the IFC colour alpha (`streaming.js:405`) = **0.10 / 0.25** in Clinic → thrown away → the
click falls through to the opaque wall behind (or nothing). Solid `IfcDoor` = alpha 1.0 → picks fine.
Live proof: the user COULD click one curtain-wall glass door — because that specific `IfcDoor`
(`M_Curtain Wall Sgl Glass:…:283068`, GUID `0bpfxAz3XBrAx$RjFuHvgA`) happens to have material alpha
`1.000`; the 0.10-alpha IfcPlate glazing beside it stays unpickable. Fix when prioritized: make the
skip INTENT-based (skip `_isOutline`/ghost/bbox via userData flags), not a blanket opacity threshold —
because the 0.3 gate is also what lets you pick THROUGH x-ray-dimmed geometry (all drops to ~0.3 under
x-ray, `streaming.js:594`), so glass and dimmed background are indistinguishable by opacity alone.
This is the design fork to resolve before touching it.

### Finding B — Path avoids the glass door → threads room→room instead (`common/room_graph.js:309`)
The door query binds doors to a PER-STOREY corridor spine (`SPINE::<storey>`/`CIRC::<storey>`), reading
`m.storey` RAW. Curtain-wall glass doors carry **`storey='Unknown'`** (placement is relative to the
null-transform `IfcCurtainWall` parent, so extraction never assigned a storey — confirmed: Clinic has
6 `M_Curtain Wall *Glass` IfcDoors, 3 First Floor + **3 Unknown**; the live card above showed
`Storey: Unknown`). An Unknown-storey door binds to NO spine → no edge → the router cannot cross the
glazed opening and detours through the solid-door rooms. `room_graph.js` does NOT apply the room-walker's
`§STOREY-Z` z-reassignment (assign Unknown→storey by `center_z`) that would rescue these. Fix when
prioritized: reassign Unknown-storey doors by `center_z` before binding (reuse the walker convention).

### PRINCIPLE (user, the real point) — corridor-preference is a routing-quality invariant
Walking through ROWS OF DOORS room→room→room is illogical when a glass door / corridor sits between the
endpoints — the path should PREFER corridor circulation over cutting through adjoining rooms. A
room→adjoining-room transition WHEN a corridor is next to it is a **RED FLAG** (route smell), not a valid
leg. Finding B is the enabling bug (the corridor route is literally absent from the graph, so the router
has no choice), but even with all doors present the cost model should penalise room↔room transitions where
a corridor edge is available, so circulation is the default spine and rooms are leaves off it. This is the
design target for the eventual fix, beyond just rescuing the Unknown-storey doors.

## §10 — UTILITY/CABLING ROOMS routed as normal circulation nodes (2026-07-22, user, from live
screenshots `MIssBehindCutThruAir.png`/`MissCOback2doors.png` — same PRINCIPLE as §9, a second
enabling bug — NOTED, confirmed against live code, NOT fixed yet)

**User's framing, verbatim shape:** internal cabling/service rooms without real openings/doors are
being listed and path-found through like ordinary rooms, breaking the "room-to-room is thru a door"
circulation rule (which is real but was never written down as an explicit graph-building guardrail).
Access to such utility spaces for servicing is fine at an advanced/maintenance stage — but ordinary
room-to-room pathing should not treat them as equal-weight circulation hops.

**Screenshot evidence:** a `Level 1 Hall/Corridor 1 → Level 3 R6` Path result (10 doors, 107.9m)
renders with a straight `THREE.Line` segment cutting diagonally through open atrium air to a floating
destination box, and the room list includes **`≈ Level 1 R7 · COMPILED INTE...`** (step 6) and
**`≈ Level 1 R13 · COMPILED INT...`** (step 8) as ordinary path hops — plus the corridor is revisited
4 times (`Corridor — Level 1` at steps 2/5/7/11) for what should be a much more direct route.

**Confirmed against live code (`bim-ootb origin/main`), not assumed:**
1. **`common/room_graph.js buildGraph()`'s `spaceRows` query (~line 208)** pulls every `IfcSpace` row
   into the pathfinding graph with **zero filter on `predefined_type`** — no habitability/utility
   exclusion of any kind before a room becomes a full graph node.
2. **`viewer/lib/room_walker.js:1290`** confirms what "COMPILED INTE..." means: `predefined_type` is
   stamped `'INTERNAL_DOORPART'` / `'INTERNAL_SMALL'` / `'INTERNAL'` — the walker's generic tag for
   any synthetically flood-filled space (cabling/service voids included, but not exclusively — some
   `INTERNAL` rooms are ordinary unlabeled real rooms too; the tag alone isn't a utility signal).
3. **The actual utility signal already exists and is already used elsewhere, just not here:**
   `common/room_habitability.js`'s `classifyUtilityRooms()`/`utilityContentClass()` (added
   2026-07-15, `ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md §10`) classifies a room "Utilities" by real element
   COMPOSITION (ACMV `IfcFlowSegment` duct-routing dominance, or pure `IfcFooting`) — batched for perf
   (`§UTILITY-CONTENT-BATCH`, Hospital 600+-room regression fix). It's wired into the Type-lens
   display (`navigate_find.js:2941-2950`, `:2340-2352`) but **`room_graph.js`'s `buildGraph()` never
   calls it** — a room correctly labelled "Utilities" in the Type view is still a full, unweighted
   Path-mode node today.
4. **Not a fabricated/doorless edge — checked the E1/E2 binding loop (~lines 388-460):** every edge in
   the graph traces to a real door (E1 two-room binding, E2 lone-door circulation rescue, E9 ambiguous-
   residual rescue) — there is no synthetic "nearest room" shortcut. `utilityContentClass()` itself
   already says "a room with a genuine nearby door is NEVER classified Utilities" — reasonable for its
   original DISPLAY purpose (a serviced room with its own door isn't a sealed void), but **wrong for
   pathfinding**: a cabling closet's genuine maintenance-access door still shouldn't make it an
   equal-weight room-to-room hop next to a corridor. This is precisely **§9's own PRINCIPLE**
   (corridor-preference is a routing-quality invariant) surfacing through a SECOND enabling bug —
   not Unknown-storey doors dropping the corridor edge, but a real-but-service door letting Dijkstra's
   plain center-to-center distance treat a utility void as a legitimate shortcut.

**Not fixed here, per user's own framing (advanced-stage access is wanted, not exclusion):** the
right shape is a **cost penalty in `shortestPath()`'s Dijkstra weighting for room↔room legs through a
utility-classified room, not a hard exclusion from the graph** — utility rooms should stay reachable
(a maintenance-access "find path to the cabling closet" query should still work) but should never win
against an available corridor/spine route on a normal room→room query. Concretely: wire
`RoomHabitability.classifyUtilityRooms()` into `buildGraph()` (same batched call shape already proven
safe on Hospital's 311 rooms), tag utility nodes, then apply a weight multiplier (not removal) on any
edge touching one, same "penalise, prefer circulation" design target §9 already named. Left as a
follow-up, same discipline as §9 — flagged with exact citations so it doesn't need re-deriving.

### §10 EXECUTION 2026-07-22 (Opus coder session) — ✅ MECHANISM SHIPPED, PR #959, with an honest limitation

Worked in bim-ootb worktree `/tmp/wt-room-path-utility`, branch `fix/room-path-utility-penalty` off
`origin/main` @ `0269cec`. **SCOPE held: `common/room_graph.js` `buildGraph()`/`_buildAdjacency()`
only** (+ the `viewer/main.js` cache-bump + a new node witness). No `room_habitability.js` edit, no
`fullConnectivity()` touch, no Playwright.

**What shipped (`common/room_graph.js`):**
- `RoomHabitability.classifyUtilityRooms()` wired into `buildGraph()` via the dual-mode require
  pattern (mirrors `HallwayBackbone`/`StoreyRaster`). Descriptor `{cx,cy,sx,sy,storey}` built from
  each logical room's **union rect bbox** (§MULTI-RECT aware — single-rect degenerates to its own
  rect), self-consistent center+extent for the classifier's range-scan. Utility rooms tagged
  `node.isUtility` (+ `node.utilityWhy`). Batched — 2 SQL queries total regardless of room count.
- `_buildAdjacency()`: after computing edge weight `w`, `if (na.isUtility || nb.isUtility) w *=
  UTILITY_EDGE_PENALTY`. Both `shortestPath()` and `escapeRoute()` share this adjacency → both inherit
  the preference (confirmed sensible for escape routing too — an exit route also shouldn't thread a
  service room when a corridor exists).
- **Penalty constant `UTILITY_EDGE_PENALTY = 8`** (documented in-code like `DOOR_BUFFER_SLACK`).
  Reasoning, not fixture-tuned: real room-center edges run ~3–12 m; a corridor alternative a few hops
  longer adds ~10–40 m; ×8 makes even a single ~5 m utility hop cost ~40 m and a *through*-route (two
  touching edges, entry+exit, both penalised) ~80 m — reliably losing to any realistic detour, while
  **finite** (a multiplier, never `Infinity`/removal, so reachability is preserved per §10's "do NOT
  hard-exclude"). A destination-IS-utility query pays the penalty on its single arrival edge only.
- `viewer/main.js`: `room_graph.js?v=5→v=6` cache-bust.

**⚠ HONEST LIMITATION (measured, not hidden — the key finding of this session):** on **every** current
real fixture the rooms `classifyUtilityRooms()` flags are **doorless sealed voids that already carry
ZERO routing edges** — because the classifier excludes any room with a nearby door (§10 point 4) and a
graph edge *requires* a nearby door, so "utility-classified" and "has a routing edge" are mutually
exclusive today. Measured: Clinic 7 utility rooms / 0 with edges, Hospital 15 / 0, Duplex 2 / 0,
Hospital_3·JKR·Terminal 0 utility. **So the penalty, wired exactly as §10 specified, is a present-day
NO-OP on real data** — it cannot yet bite the screenshot's `COMPILED INTERNAL` through-hops, because
those rooms HAVE doors and are therefore never flagged by `classifyUtilityRooms`. This ships the
correct, in-scope mechanism (it bites the moment a utility-tagged room has an edge — e.g. once the
door-exclusion is relaxed, or a building shares a door with a service void). **Named follow-up (out of
this task's SCOPE = room_graph only):** a pathfinding-specific utility signal that relaxes
`classifyUtilityRooms`'s door-exclusion for the routing call, so door-carrying cabling closets get
tagged too. The task brief anticipated exactly this ("if no real fixture reproduces it cleanly, say so
honestly").

**Witness — `witness_room_graph_utility_penalty.js` (bim-ootb, committed), 12/12 green** (real
Clinic/Duplex/JKR `_extracted.db`, `better-sqlite3`, §-log-first, self-contained — regenerates the
`origin/main` "before" module from pinned SHA `0269cec`; log `w_util_penalty.log` read per Log Mandate):
- `§ROOM_GRAPH_UTILITY utilityRooms=7 (routing penalty x8 on touching edges, not removed)` — A1
  buildGraph tags the 7 real Clinic utility rooms; A1b matches `classifyUtilityRooms` output exactly.
- `§UTIL_EDGELESS RM_First_Floor_26(edges=0,utility:ACMV) … RM_TOF_Footing_1(edges=0,utility:footing)`
  → A2 `utilityRoomsWithEdges=0/7` (the honest structural finding above, asserted).
- `§MULTIPLIER pair=RM_First_Floor_20->RM_First_Floor_29 d_before=9.4626 d_after=75.7005 ratio=8.0000`
  → B1 the touching-edge weight multiplies by **exactly** ×8.
- Real through-hop reroute (force-tag on the real graph — the "clearest available real-data
  reproduction" §10 asks for): `§REROUTE_EXAMPLE RM_First_Floor_1->RM_First_Floor_2
  before=[…,RM_First_Floor_20,RM_First_Floor_9,RM_First_Floor_2](d=24.14)
  after=[…,RM_First_Floor_20,RM_First_Floor_2](d=24.76) avoids RM_First_Floor_9=true` — B2c the route
  now AVOIDS the tagged room for a slightly-longer direct hop, and still resolves. B2b (a cut-vertex
  hub, only route): `§THRUHOP … tagged … d=76.26` stays reachable at ×~8 cost, never null.
- `§DEST_REACHABLE RM_First_Floor_29->RM_First_Floor_20(tagged) d=75.70 vs untagged d=9.46` — B3 a
  destination-IS-utility query still returns a valid non-null path.
- No regression vs `origin/main`: `§NOREG_DUPLEX compared=10 identical=10` +
  `§NOREG_JKR compared=190 identical=190` — byte-identical path arrays + distances (Duplex's 2 utility
  rooms are edgeless → penalty branch inert; JKR has none).

**PR:** https://github.com/red1oon/bim-ootb/pull/959 (`fix/room-path-utility-penalty` @ `24a4d52`,
pushed, opened un-merged — merge is the user's call). Files: `common/room_graph.js`, `viewer/main.js`,
`witness_room_graph_utility_penalty.js` (new), `.gitignore` (ignores the regenerated before-module).
**#959 is now MERGED to `origin/main` (squash `6209f54`).**

### §10 EXECUTION 2026-07-22 (Opus, follow-up) — ✅ GAP CLOSED, PR #961 (door-exemption opt)

#959 shipped the correct penalty mechanism but was a **no-op against the actual reported bug**, and
that's exactly what its own §10 EXECUTION honestly flagged: `classifyUtilityRooms()`'s door-exemption
(`room_habitability.js` `utilityContentClass()` line ~124 / batched `classifyUtilityRooms()` line
~179 — "a room with a nearby door is a serviced space, not a void") is CORRECT for the Type-lens
DISPLAY but WRONG for ROUTING preference, and since a graph edge REQUIRES a nearby door, every room
that could ever be a through-hop was door-exempted out and never tagged. Coordinator-directed fix (the
design fork resolved as an additive opt, NOT a forked classifier — the codebase's "one shared signal"
discipline):

**What shipped:**
- **`common/room_habitability.js`** — `utilityContentClass(room, dbQueryFn, opts)` and batched
  `classifyUtilityRooms(rooms, dbQueryFn, opts)` gain **`opts.ignoreDoorExemption`** (§DOOR-EXEMPTION-
  POLICY). Default `false` = today's exact door-exempting behavior, byte-identical for every existing
  caller; when `true`, the `_hasNearbyDoor`/`nearDoor` check is skipped and the room is classified by
  element COMPOSITION alone (ACMV `IfcFlowSegment` / `IfcFooting`). Additive opt-in only — no existing
  call signature's meaning changes.
- **`common/room_graph.js` `buildGraph()`** — passes `{ignoreDoorExemption: true}` on the routing
  classification call (the one-line gap-closer), AND excludes synthetic `CORRIDOR_ROOM::*` circulation
  nodes from utility classification outright (**§NEVER-PENALISE-A-CORRIDOR** — a footing under a
  corridor slab would otherwise tag the very corridor routing should PREFER; measured: Hospital_3
  tagged all 8 of its corridor nodes before this guard, penalising the circulation spine — exactly
  backwards).
- Cache-bust: `room_habitability.js?v=1→v2` (a stale v1 would ignore the new opts arg),
  `room_graph.js?v=6→v7`.

**Real-data proof — the screenshot building is Hospital** (Level 1/2/3, R6/R7/R13 — matched directly).
Witness `witness_room_graph_utility_penalty.js` rewritten, **9/9 green** (real Clinic/Duplex/JKR/
Hospital `_extracted.db`, `better-sqlite3`, §-log-first, self-contained via pinned SHA `6209f54`; log
`w_util_penalty2.log` read per Log Mandate):
- **A DISPLAY-REGRESSION (verified, not asserted):** `classifyUtilityRooms` with default opts (and
  `{}`, and `{ignoreDoorExemption:false}`) byte-identical to the origin/main "before" module —
  `§A_DISPLAY Clinic before=7 newDefault=7`, `Duplex 2==2`, `JKR 0==0`. navigate_find.js's two
  display call sites (which pass no opts) provably unaffected.
- **B ROUTING-TAG-FIRES:** `§B_SCREENSHOT RM_Level_1_7(nowTagged=true,deg=4,beforeTagged=false)
  RM_Level_1_13(nowTagged=true,deg=6,beforeTagged=false)` — the two real screenshot rooms now tagged
  utility WITH edges, where the door-exempt default tagged neither. `§ROOM_GRAPH_UTILITY
  utilityRooms=23`, `corridorTagged=0 of 23` (guard holds).
- **C** `§MULTIPLIER … ratio=8.0000`. **E** `§E_REACHABLE RM_Level_1_16->RM_Level_1_13 tagged=true
  d=24.50` (destination-IS-utility still resolves). **F** `§F_NOREG JKR … compared=190 identical=190`.
- **D REAL-REROUTE (real tags, not forced):** `§REAL_REROUTE RM_Level_1_16->CORRIDOR_ROOM::Level 1|y|8.18`
  — before(unpenalised) `[RM_Level_1_16,RM_Level_1_13,RM_Level_1_7,Corridor…12.84,Corridor…8.18]` d=33.62
  (cutting through BOTH screenshot rooms); after(penalised) `[RM_Level_1_16,Corridor…8.18]` d=44.77,
  `avoids RM_Level_1_13=true`. The route now takes the corridor instead of threading R13+R7 — §9's
  "prefer circulation over cutting through rooms" principle, closing on the real building.

**⚠ HONEST LIMITATION (logged `§OVERTAG`, doc-named follow-up):** the composition signal is
PRESENCE-based (any ACMV `IfcFlowSegment` in the room's bbox), and HVAC ducts traverse most ceilings —
so on duct-dense buildings it over-tags (`§OVERTAG Clinic tagged=110/119 rooms`). With corridors
exempt, the net routing effect there is *general* corridor-preference (rooms penalised, circulation
not — which aligns with §9's broader principle) rather than *cabling-only* targeting. Sharpening to a
duct-**DOMINANCE** threshold (room is utility only if MEP is its PRIMARY content, not merely
overhead-transited) is the named follow-up — not invented here, needs the same measured treatment as
the existing signal. On sparser-signal buildings (Hospital: `utility:footing`, 23 rooms incl. the
exact screenshot R7/R13) it targets precisely.

**PR:** https://github.com/red1oon/bim-ootb/pull/961 (`fix/room-utility-routing-door-exemption` @
`d23846a`, off merged `origin/main` `6209f54`, pushed, un-merged — merge is the user's call). Files:
`common/room_habitability.js`, `common/room_graph.js`, `viewer/main.js`,
`witness_room_graph_utility_penalty.js`, `.gitignore`. **MERGED to `origin/main` (`03a6cb7`).**

## §11 — HARD-FAIL illegal chords (Task 1) + corridor-avoidance zigzag (Task 2): 2026-07-22
## INVESTIGATION — NEITHER SHIPPED (Task 1's requested fix measured HARMFUL; Task 2 report-only)

```
# ⚠ DO NOT REMOVE
SCOPE: common/room_graph.js _legalizePath()/_detourForChord() (Task 1) + routing-quality
investigation (Task 2). Both investigated against real data on a fresh branch off origin/main
@ e84a079 (includes #959/#961). OUTCOME: Task 1's "hard fail with no fallback" was CODED and
MEASURED, found to null 93–100% of multi-hop paths INCLUDING with an accurate raster, and would
break LIVE routing (JKR/Hospital/HHS self-heal rasters) — so it was REVERTED, NOT shipped. Task 2
root-caused to the SAME layer. No PR for either — this is the honest finding, per "tests expose
issues" + "never ship a fabricated/broken route".
```

### Task 1 — hard-fail illegal chords: CODED, MEASURED, REVERTED (not shipped)
Implemented exactly as asked: `_legalizePath()` returns `null` (→ `shortestPath()` null, honest "no
path") when a same-storey chord is `_chordIllegalCount>0` and `_detourForChord` finds no legal detour.
Then measured on real data — three findings that together make it unshippable as specified:
1. **Cross-storey layer is NOT the bug (investigation answer).** Traced a real Hospital Level 1→Level 2
   path: every different-storey adjacency in the returned `path` has a real `stairwp`/`circ` endpoint
   (`crossStoreyHops=1 bareRoomToRoom=0`) — a genuine vertical stair hop, never a bare
   `room[A]->room[B]` cross-storey adjacency. So the `storey!==storey` guard correctly skips them; the
   screenshot's diagonal is NOT an untested cross-storey chord. The screenshot's actual illegal chord
   is a SAME-storey `stairwp->SPINE` chord on the destination floor (measured 129–131 illegal sample
   points ≈ 33 m through open atrium air) that `_detourForChord` can't detour (`no legal detour among
   62 doors`).
2. **No deployed building's LOCAL `.db` ships a walkable raster** — every legality test falls back to
   the coarse room-rect signal. Blanket-hard-failing on it nulls **JKR 190/190, Duplex 10/10, Hospital
   118/120** pairs — mass FALSE-POSITIVE (the coarse rect test flags legitimate hops to synthetic
   `CIRC`/`SPINE`/`doorwp` waypoints as "illegal" because those points aren't inside a room rectangle,
   even though the route through real doors is fine).
3. **An accurate raster does NOT rescue it.** The live viewer self-heals real rasters onto JKR/Hospital/
   HHS via `buildings/patches/*.db.sql` (`A._applyPendingPatch`). Applying Hospital's real patch (7
   storeys) and re-running: the screenshot repro `RM_Level_1_5->RM_Level_2_7` **does** now hard-fail
   (`§PATH_LEGAL_HARDFAIL illegalPts=131 ... path rejected`) — BUT so does **780/780 = 100%** of Hospital
   pairs, and **93%** of JKR. Root cause: the returned `path` is a sequence of graph WAYPOINTS including
   synthetic bookkeeping centroids (`CIRC::<storey>` at a stair centroid, `SPINE` corridor points,
   `stairwp`), and the straight-line polyline between them routinely crosses non-floor even for a valid
   route — because the polyline is a topology representation, not a walked path. So "illegal chord" is
   dominated by representation artifacts, not genuine wall-crossings, and hard-failing on it — with OR
   without a raster — rejects almost every real route. Gating to raster-backed storeys made real
   raster-less buildings byte-identical (Clinic 153/153, Duplex 10/10, JKR 190/190, Hospital 120/120 vs
   pre-change) but would 93–100% break the LIVE rastered ones — the repo auto-merges PRs, so shipping
   this was an active production hazard.
**Decision: REVERTED. Not shipped, no PR.** The screenshot's diagonal-through-air is a RENDERING-layer
problem (straight polyline between graph waypoints, not a walked route), not a routing-validity problem;
hard-failing at the path-legality layer cannot fix it without nulling the feature. (Witness fixture
proving the mechanism DOES fire on an accurate raster — H1 hard-fail/H2 walkable-control/H3 raster-less-
gate, 8/8 green — was built and confirmed, then discarded with the reverted code; findings preserved
here.)

### Task 2 — corridor-avoidance "goes looking for another door" zigzag: ROOT-CAUSED (report only)
Reproduced on real Clinic (`RM_First_Floor_29 -> RM_First_Floor_64`, full hop trace, current shipped
code). Finding: the **Dijkstra room/corridor SELECTION is already corridor-preferring** (post-#961) —
the trace goes `R29 →(door) R20 →(E2) Corridor →(E5) Corridor →(E5) Corridor → … → R65 →(door) R64`,
i.e. it DOES get onto the corridor spine and stay on it. The zigzag is NOT in which rooms/corridors are
chosen. It is in the **polyline LEGALIZATION pass** (`_legalizePath`/`_detourForChord`): to make a
coarse-legality-flagged `spine->spine` (or spine-to-room) chord "legal", the door-waypoint visibility
graph splices in `doorwp` detour points — and when the local pass (`DETOUR_LOCALITY_MARGIN=6 m`) finds
none, it falls back to a WIDER search (`§PATH_LEGAL_DETOUR_NONLOCAL used a wider one`) and picks
**distant** door waypoints, weaving the rendered line spine→doorwp→spine→doorwp along the corridor
(measured: 21.2 m and 13.8 m detour legs to far doors; 1008 nonlocal/fail detour events across the
sampled run). That "hunting for a door" IS the detour visibility graph literally searching door
waypoints — but as a RENDERING legalizer, not as route selection.
- **Same root cause as Task 1**, and as §9's principle discussion: the coarse room-rect legality signal
  vs. straight-line chords between synthetic graph waypoints. It is NOT §9's Unknown-storey-door edge
  drop (single-floor here), NOT the ambiguous-door tie-break (the E1 hops in the trace are clean), and
  NOT the E1 distance weight undervaluing corridors (selection already prefers the corridor).
- **Fixability read (the part the bigger-redesign discussion needs):** this is NOT fixable with one more
  weight/preference signal in the existing single-path Dijkstra — the Dijkstra output is already good;
  the defect is downstream, in a SEPARATE visibility-graph legalization pass operating on a coarse
  signal against synthetic-node positions. It needs one of: (a) an accurate walkable raster on every
  storey so legality is right and detours are minimal/correct (raster already exists for some buildings
  via self-heal; extending coverage is a data/pipeline task), OR (b) a representation redesign so the
  drawn polyline follows the real corridor centerline / door sequence instead of straight lines between
  graph waypoints legalized post-hoc. It is the "multiple competing signals reconciled" class of problem
  (route topology vs. walkable polyline vs. synthetic-waypoint placement), i.e. the bigger redesign — not
  a targeted single-signal tweak. Reported plainly for that decision; nothing implemented.

## §12 — STAGE A: Terminal's 0/174 walkable-raster slab-resolution failure — ROOT-CAUSED + FIXED
## (2026-07-22, Opus session) — ✅ SHIPPED, bim-ootb PR #964

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb scripts/build_storey_walkable_raster.js. Root-cause the ROOM_LENS §24 finding
("component_geometries slab resolution failed entirely — 0/174 slabs resolved across every storey,
unexplored") and fix if a real generalizable bug; else declare an honest data gap. Read the log
after every run. This is Stage A of a two-stage task; Stage B (raster-constrained routing) follows.
```

### Root cause — NOT a data absence; a split-DB plumbing gap (the exact opposite of Hospital's §24 case)
Investigated directly against the real DBs (not guessed). **Terminal is a split-DB building** — the
same 3-file layout the live viewer's own `§S260b` split-DB detection loads (`streaming.js:1667`):
`Terminal_meta.db` (spatial/panels/`element_instances`) + `Terminal_geo.db` (`component_geometries`
meshes) + `Terminal_positions.bin` (instant bboxes). The raster builder, however, read
`Terminal_extracted.db` and called `RealGeometry.buildGeometryIndex(db)` **single-DB**. Measured facts:
- `Terminal_extracted.db` has **no `component_geometries` table at all** (`.tables` confirms it's split
  out to `_geo.db`) → `geometryTable(db)` returns null → `buildGeometryIndex` returns an empty index →
  every slab unresolved → the raster silently degraded to crude full-slab-**bbox** fallback rects (the
  concave-slab overreach `storey_raster.js` exists to prevent). This is why §24's Terminal raster *tied*.
- `Terminal_extracted.db` is also a **divergent §24 snapshot**: 705 IfcSlab guids that share **zero**
  guids with `Terminal_meta.db`'s 705, coordinate frame offset ~(+545,+51,+14.5)m (x∈[635,699] vs
  meta's x∈[89,154]), and `element_instances.geometry_hash` values that match **0 of 9394** rows in
  `_geo.db`. The matching instances live in `Terminal_meta.db` (all 9394 geo hashes resolve there).
- Decisively: **the live viewer never uses `Terminal_extracted.db` for Terminal.** In split mode
  (`streaming.js:1768`) `A.db = Terminal_meta.db` patched by `patches/Terminal_meta.db.sql`; the
  `Terminal_extracted.db.sql` patch (with §24's coord fix + any raster) is dead code for Terminal.
- **The mesh is 100% present** — `buildGeometryIndex(meta.db, geo.db)` resolves **705/705** IfcSlab
  guids (0/705 without geo.db). Genuinely the opposite of Hospital's §24 honest data gap (empty storeys).

### Fix (in SCOPE) — split-DB awareness in `build_storey_walkable_raster.js`
`§SPLIT-DB`: when the primary db carries no `component_geometries`/`base_geometries` table, resolve the
sibling `_geo.db` (`dbPath.replace(/_(meta|extracted|rooms)\.db$/,'_geo.db')`) and pass it to
`buildGeometryIndex` as its second `geoDb` arg — `real_geometry.js`'s two-arg contract already supports
this; `element_instances` stays keyed off the primary db, meshes decode from geo.db. **No-op for
single-file buildings** (guard returns null → original `buildGeometryIndex(db, db)`; verified JKR/HHS/
Hospital carry `component_geometries` inline). Rebuilt Terminal's raster from `Terminal_meta.db` +
`Terminal_geo.db`, shipped into `Terminal_meta.db.sql` (both `buildings/patches/` and the live
`viewer/buildings/patches/` copy, kept in sync per the §22 divergence landmine).

### Witness — `witness_terminal_walkable_raster.js` (bim-ootb, committed), 5/5 green
- `§TERMINAL_SLAB_RES total=705 singleDB=0 splitDB=705` — the root-cause proof, both directions.
- Per-storey rebuild: Aras 01 21/21, Aras 02 89/89, Aras 03 59/59, Aras 04 **0 slabs** (honestly empty,
  tiny storey), Aras Bumbung 1/1, Aras Tanah 4/4 — sum 174/174 (the exact "0/174" §24 measured, now 100%).
- Routing on the **meta.db graph the split-mode viewer actually runs** (43 rooms, 903 pairs):
  `§TERMINAL_BASELINE detourFail=54.6%` → `§TERMINAL_WITH_RASTER detourFail=46.5%` — a real
  chord-legality improvement (unlike §24's tie against the wrong extracted.db). Connectivity **62.1%
  unchanged** (a raster legalizes chords on existing edges; it never adds/removes edges — asserted).
- Regression: JKR raster 4/4, HHS raster 4/4, Hospital raster 3/3 (unchanged, single-file guard no-op),
  `witness_room_graph_path` 15/15.

### Shipped
bim-ootb `fix/terminal-walkable-raster-splitdb`, **PR https://github.com/red1oon/bim-ootb/pull/964**
(pushed, un-merged — merge is the user's call). Files: `scripts/build_storey_walkable_raster.js`,
`buildings/patches/Terminal_meta.db.sql`, `viewer/buildings/patches/Terminal_meta.db.sql`,
`witness_terminal_walkable_raster.js` (new). No binary DB committed (raster travels as the SQL patch).

### For Stage B
Terminal is now a fixed, raster-backed building — fleet raster coverage is Clinic/HHS/JKR/Hospital(tie)/
Terminal. Stage B (raster-constrained A* routing replacing straight-line `_legalizePath` chords)
proceeds using this coverage; it degrades honestly only on storeys with no raster at all.

## §13 — STAGE B: raster-constrained A* routing — the drawn polyline hugs real floor
## (2026-07-22, Opus session) — ✅ SHIPPED, bim-ootb PR #967

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb common/room_graph.js shortestPath() + viewer/navigate_find.js line render. The
redesign §11 converged on: replace straight-line polyline legalization (straight chords between
synthetic waypoints, patched post-hoc by a sparse door-visibility detour that failed 90-100% of
multi-hop paths) with a real A* grid-search over the storey's own walkable raster. Read the log
after every run. Push permission ON — own PR, no bundle with Stage A (#964).
```

### Design — ADDITIVE, zero risk to the logical route (the crucial call)
The room SEQUENCE Dijkstra is correct (§11) and was NOT touched. `shortestPath()` gains **one new
field, `polyline`** — world `{x,y,z}` points from A* over `_pointWalkable` (raster-first via
`storey_raster.js`'s `contains()`, room+corridor-rect fallback, `null`=no-data). **`path`/`doors`/
`distance` and the existing `_legalizePath` door-detour are UNTOUCHED** — this matters because the
Stage-A raster witnesses (`witness_{jkr,hhs,hospital,terminal}_walkable_raster.js`) MEASURE the
`§PATH_LEGAL_DETOUR_FAIL` rate that `_legalizePath`/`_detourForChord` emit; removing that mechanism
would break them. So the polyline is the "additive geometric detail between real hops" the task named,
and the viewer's `THREE.Line` now follows it (markers/room-list/zoom unchanged). Result: every existing
witness is byte-identical, AND the drawn line hugs floor.

### The key finding, proven on real data — §CIRC-NOT-A-WALKPOINT
Root-caused why a naive A* fixed nothing: **every** illegal chord ran to/from the synthetic `circ`
node — a per-storey circulation-hub CENTROID (stair-group average), NOT a walked point. Flood-fill
proved it sits on a **disconnected raster island** (HHS Level 2: 3 walkable components, circ not in the
main one), so A* correctly can't reach it. The polyline **bypasses circ and routes the flanking corridor
spines directly** (HHS spine→spine straight = 61 illegal → A* polyline = 0). circ is never dropped from
`path` (room list/markers keep it); cross-storey never relies on it (`_publicHop` already substitutes
real `stairwp`). This is precisely §11's "synthetic bookkeeping centroids" diagnosis, closed.

### §ON-FLOOR-GUARANTEE + honest degrade
A* returns a route ONLY if it verifies on-floor **end to end** (including the anchor connectors);
otherwise `null` → the caller keeps the original straight/synthetic route. So the polyline is provably
**NEVER worse**, and where the raster connects the endpoints it is **100% on real floor by
construction**. Where a building has no raster (Clinic/Duplex rect fallback), A* runs over the rects and,
where doorway seams aren't rect-covered, verification fails → honest straight fallback (measured: 0
regression, not the old straight-only reversion). Where `_pointWalkable` returns `null` (no floor data at
all), the straight segment is the only non-invented route.

### Witness — `witness_room_path_raster_polyline.js` (bim-ootb, committed), 7/7 green
- **Terminal** (raster, Stage-A split-DB build): OLD straight **1152 illegal pts → polyline 0**
  (`§POLY_LEGALITY reduction=100.0% improvedPairs=48 worsePairs=0`).
- **HHS** (raster): **11866 → 90** illegal pts (`reduction=99.2% improvedPairs=322`) via the circ bypass.
- ON-FLOOR GUARANTEE: `worsePairs T=0 HHS=0 Clinic=0 Duplex=0`.
- Regression `§POLY_NOREG` path/doors/distance byte-identical to origin/main: Terminal 903/903,
  HHS 5460/5460, JKR 2145/2145, Duplex 210/210.
- Honest degrade: Clinic/Duplex `reduction=0.0%` (never worse, doorway seams genuinely uncrossable).
- **Timing** `§POLY_TIMING Hospital` (largest, 156 rooms/7 storeys): **avg 34.9ms / max 126ms** per path
  (real `process.hrtime`, connected pairs only) — well within an interactive Find-Panel click. Bounded
  coarser widen pass (vs full-storey) brought max from 205ms → 126ms with zero correctness loss (the
  §ON-FLOOR-GUARANTEE verification re-tests at fine res regardless).
- Full existing suite green: `room_graph_path` 15/15, `room_graph_utility_penalty` 9/9,
  `backbone_routing` 10/10, `corridor_room_backprop` 5/5, `full_connectivity` 6/6, `hallway_backbone`
  7/7, `corridor_type_label` 5/5, `stair_flight_assembly_merge` 4/4, JKR/HHS/Terminal rasters all green.

### Honest gaps / deferred
- `witness_terminal_room_coordinate_fix` fails 2/5 — confirmed **pre-existing on origin/main** (verified by
  stashing this change), a drifted §24 "before" fixture whose stale-patch baseline no longer reproduces the
  old broken state. Unrelated to Stage B (this change doesn't touch `buildGraph`/`fullConnectivity`); named
  here, not fixed (out of scope, own housekeeping task).
- HHS's residual **90** illegal pts (of 11866) are the genuinely raster-disconnected chains — the same
  upstream raster-coverage gap §21/§24 tracks; a routing pass can't bridge them, honest degrade applies.
- `escapeRoute()` was intentionally left without a polyline (out of Find-Panel scope; it degrades to the
  old room-center line via the viewer's fallback) — a clean follow-up if wanted.

### Shipped
bim-ootb `feat/room-path-raster-astar`, **PR https://github.com/red1oon/bim-ootb/pull/967** (pushed,
un-merged — merge is the user's call). Files: `common/room_graph.js`, `viewer/navigate_find.js`,
`viewer/main.js` (cache-bust v7→8 / v55→56), `witness_room_path_raster_polyline.js` (new).

## §14 — LOG PRECISION FIRST: two real console-log findings show the gap directly (2026-07-22)
**User's standing directive, this session:** logging needs to be precise enough to pinpoint an issue
from the log text ALONE — live-browser + human checking every time is expensive and should be the
LAST resort, not the first move. Read this section before dispatching any live-browser diagnostic
session on a Find-Panel/room-lens symptom — check whether the existing `§`-log lines already answer
it first; if they don't (as below), FIX THE LOGGING before spending a browser session on it.

**The contrast that makes the case, from this session's own two real questions:**
1. **Hospital's corridor-coloring gap WAS pinpointed from log text alone, zero browser needed** —
   `§CORRIDOR_TYPE_LABEL classifiedRooms=0 / 142`, `§ROOM_LENS_CATEGORY ... corridor=0 ...`, and
   `§CATEGORY_REVEAL on gk="Hall / Corridor" rooms=0 doors=59` together prove, in plain log text, that
   zero real compiled rooms are ever classified "corridor" even though 59 corridor-adjacent doors exist
   — root cause (label-keyword classifier has nothing to match on 100%-synthetic unlabeled rooms) was
   derivable on sight. This is the log-precision BAR to hold every other axis to.
2. **Terminal's "disciplines disappeared except Air-Conditioning" could NOT be answered from the same
   log** — every discipline-related log line in the whole session's Terminal capture prints a bare
   COUNT, never the actual codes/labels:
   - `viewer/streaming.js:216` — `§BBOX_PLACEHOLDERS ... discs=${discEntries.length}`
   - `viewer/streaming.js:1808` — `§BBOX_RECOLOR discs=' + new Set(_colorRows.map(r=>r[3])).size`
   - `viewer/navigate_find.js:4127` — `§FIND_TREE mode=disc discs=' + discs[0].values.length` (inside
     `_buildDiscTree()`, `:4085-4127` — the raw `[discipline, count]` rows ARE sitting right there in
     `discs[0].values` at the exact line that logs only `.length`; not logging them is the whole gap)
   - `viewer/dlod_nav.js:150`, `viewer/measure.js:1721`, `viewer/time_machine.js:585` — same
     count-only pattern, three more call sites.
   Both Hospital and Terminal booted with the SAME `discs=7` count at BOTH boot-recolor and
   Find-panel-disc-tree time — the count survives, but nothing says WHICH 7, so a real bug (a
   discipline code present but its `friendlyDisc()` translation failing/blank — plausible given
   `en_MY` locale + Terminal's Malay storey names, `§TRL_LOADED cached locale=en_MY keys=334`) and a
   non-bug (7 real disciplines, correctly labeled, user simply misread the panel) are INDISTINGUISHABLE
   from this log. That ambiguity is exactly what forces a live-browser check — avoidable.

### Task — fix the logging with a SUMMARY-first, DETAIL-on-mismatch pattern (not unconditional dumps)
**User's refinement (2026-07-22):** don't just dump full lists everywhere — that trades "can't
diagnose" for "spammy, still hard to read." The right shape, applied consistently: always log one
CHEAP compact assertion (two numbers, or a small coverage count); only expand to the full
breakdown/list when those two numbers actually disagree. Same principle as this codebase's own
`§CONTRACT_CHECK batch=... instanced=... guidMap=... streamed=... orphans=0` line elsewhere in this
file's own captured log (already exactly this pattern — a one-line reconciliation of several counts,
present every load, cheap, and `orphans=0` is the signal to watch, not a list to read) — extend that
SAME shape to the two gaps this session found, don't invent a new logging idiom:

1. **Computed-vs-rendered count check, generalized past just disc** — every `_build*Tree()` function
   (`_buildDiscTree`, and the room/type/material/storey equivalents) computes a count from SQL
   (`discs[0].values.length` etc.) and separately renders N tree nodes via `elTree.appendChild()` in a
   loop that can silently skip rows (a falsy `disc`/filter continue, same as the `if (!disc) return`
   guard already in `_buildDiscTree` at `:4094`). Change each tree-builder's existing summary log
   (`§FIND_TREE mode=disc discs=7` etc.) to a **reconciliation line**: computed vs. actually-appended
   count, e.g. `§FIND_TREE mode=disc computed=7 rendered=7` (still one line, no spam) — and ONLY when
   `computed !== rendered`, append the specific skipped code(s)/reason on that SAME line (e.g.
   `computed=7 rendered=6 skipped=[null-disc:1]`). Healthy case stays a single terse number pair;
   broken case is self-diagnosing without a second log line or a browser.
2. **"Black-box" coverage metric for space/color assignment** — a single compact count, not a list:
   how many real doors/elements got NO room/space color classification at all, alongside the existing
   `§ROOM_LENS_CATEGORY` breakdown (e.g. append `unassignedDoors=N` to that same existing line — do
   not add a new separate log call). This is the general form of what `§CORRIDOR_TYPE_LABEL
   classifiedRooms=0/142` already showed for corridors specifically — generalize it to "how many
   real doors sit in a space that got no category at all," which would have flagged the Hospital
   finding in ONE number instead of needing three correlated lines to reconstruct it.

**Where:** `viewer/navigate_find.js` — `_buildDiscTree()` (`:4085-4127`) first (the live question),
`§ROOM_LENS_CATEGORY`'s existing log call (search for that exact tag) second. Apply the same
reconciliation shape to the other tree-builders (room/type/material/storey) and the other 5 count-only
disc sites (`dlod_nav.js:150`, `measure.js:1721`, `streaming.js:216`/`:1808`, `time_machine.js:585`)
only if/when a real question is blocked on one of them — don't blanket-rewrite speculatively.

### Non-goal
Do NOT use this task to go diagnose Terminal's actual discipline-list symptom yet — that's still a
live-browser question, deliberately deferred until the logging fix above lands and can be read from a
fresh capture first. Log fix → re-capture → read the (now self-diagnosing) summary line → only open a
browser if it genuinely still can't resolve it.

## §15 — RE-REVIEW 2026-07-26 (user doubts §10-§13 actually closed the loop on the original
## screenshots) — REVIEW ONLY, no fix, no code touched this session

```
# ⚠ DO NOT REMOVE
User re-raised `MIssBehindCutThruAir.png`/`MissCOback2doors.png` (2026-07-22, §10's own evidence),
skeptical that §10-§13's shipped fixes actually resolved what those two screenshots show. This
section is a re-audit of the FULL §9-§13 trail plus live PR-merge state (checked via `gh api`, not
assumed from this file's own prior claims) — conclusion: the doubt is well-founded, not paranoia.
Read this before dispatching anyone to re-fix anything — the mechanism is real and merged; what's
missing is closing the loop on the two SPECIFIC reported cases, which nobody has done yet.
```

**Confirmed MERGED to `bim-ootb` `main`** (`gh pr view <n> --json state,mergedAt`, live-checked
2026-07-26, not re-derived from this file's text):
- **#959** (utility-room Dijkstra penalty, §10) — merged 2026-07-21 20:31 UTC
- **#961** (§10 door-exemption gap closed) — merged 2026-07-21 21:05 UTC
- **#964** (§12 Stage A — Terminal split-DB raster fix) — merged 2026-07-21 23:46 UTC
- **#967** (§13 Stage B — A* raster-constrained polyline) — merged 2026-07-22 01:03 UTC — this is the
  mechanism that directly targets "straight chord cuts through open air" (MIssBehindCutThruAir) AND
  replaces the door-visibility-detour splice §11 Task 2 root-caused as the zigzag's mechanism
  (MissCOback2doors) — not a partial/abandoned fix, a real shipped redesign.

So the underlying claim in §12/§13 is real: not vaporware, not still-open PRs, not reverted like
§11 Task 1 was. Aggregate witnesses are substantial — Terminal illegal-points 1152→0 (100%
reduction), HHS 11866→90 (99.2%), zero regression on path/doors/distance across Terminal/HHS/JKR/
Duplex (§13's own `witness_room_path_raster_polyline.js`, 7/7 green).

**What is NOT actually closed — why the user's doubt survives this audit:**
1. **Neither §11 nor §13 ever re-ran the two SPECIFIC screenshot cases end-to-end against the
   shipped fix.** Every number in §12/§13 is an aggregate statistic (illegal-point reduction %,
   byte-identical pair counts) over batch test pairs — nobody took the EXACT route from either
   screenshot (`Level 1 Hall/Corridor 1 → Level 3 R6`, 10 doors, 107.9m; and the door-zigzag case)
   and confirmed it now renders clean. The loop was closed on an aggregate proxy, never on the
   literal reported repro.
2. **The screenshot building was never identified/recorded anywhere in §10-§13.** §10 says
   "Screenshot evidence" but names no building. This session tried to pin it down and could not
   confirm: HHS's base `spatial_structure` (checked locally, `buildings/HHS_Office_Federated_extracted.db`)
   has no room literally named `Hall/Corridor` or `R6`/`R7`/`R13` — those are runtime-compiled
   labels assembled by `navigate_find.js`/`room_walker.js`, not stored strings, so a static grep
   can't confirm or rule out HHS this way. Searched the exact door family
   (`M_Single-Flush:0915 x 2134mm_Wood`) across the only two building DBs available in the local
   worktree (HHS, warehouse_gardenworld) — no match, inconclusive. Terminal/Hospital/HITOS/
   WBDG_Office and the other ~25 gallery buildings aren't downloaded locally to check further.
3. **Raster coverage is only 5 buildings** (Clinic/HHS/JKR/Hospital-tie/Terminal, per §12's own
   "For Stage B" line). If the screenshot building isn't one of these five, it has NO raster today,
   and §11 Task 2's diagnosed zigzag mechanism (`_legalizePath`/`_detourForChord`'s door-visibility
   fallback) is completely UNCHANGED for it — §13's A* polyline is explicitly additive and degrades
   honestly back to that same old mechanism whenever there's no raster or A* verification fails.
4. **MissCOback2doors' specific symptom — the route revisiting the same door pair — was never
   explicitly re-tested as its own check.** §13's witnesses measure illegal-point counts and
   path/doors/distance regression, not "does the rendered route double back through a door pair,"
   which is a qualitative shape §11 Task 2 described but §13 never re-measured directly.

**Bottom line:** the mechanism fix is genuine, substantial, and live in production for 5 buildings —
this is not a stalled or abandoned task. But whether THESE TWO REPORTED CASES are actually clean now
is UNVERIFIED, not proven. That gap is real and explains the doubt precisely — no code claim in this
section should be read as "still broken," only as "never confirmed fixed."

**Next task for whoever picks this up (investigation first, per this project's Spec-First rule —
not authorized to change `room_graph.js`/`navigate_find.js` from this section alone):**
1. Identify the exact building — ask the user directly which building/route the two screenshots are
   from, or mechanically fetch each of the 5 raster-covered buildings' extracted DBs from OCI and
   grep for the visible room/door-family signatures until one matches.
2. Re-run that EXACT Room→Room Find-Panel path against current `origin/main` (§-log + real computed
   numbers, no screenshots — this project's FUNDAMENTAL LAW) and report: the rendered polyline's
   illegal-point count (should be 0 or near-0 if the building has raster coverage), and whether the
   door sequence still backtracks through the same pair.
3. If the building turns out to have NO raster coverage: that is the honest, complete answer — the
   void-cut/zigzag bug is still open for it BY DESIGN (documented, not a new finding), and extending
   raster coverage to it is the real next task (a data/pipeline job, not a routing-logic change).

## §16 — LIVE REPRO, 2026-07-26 (user, real screenshots + real console log) — DOCUMENTATION ONLY,
## not assigned as a task here (a separate Opus session already owns the Fly Tour/room-pathing lane)

**Evidence:** `~/Pictures/Screenshots/RoomsPathTopView.png` (aerial X-ray) / `RoomsPathFrontView.png`
(straight-on facade) / `RoomsPathSideView.png` (angled along the building's length) — renamed from
the three most recent captures, 2026-07-25 05:32-05:35 — + the
real browser console log for the same session, saved to
`~/Pictures/Screenshots/logs/RoomsPath_2026-07-25_console.log`.

**Building CONFIRMED Hospital** (not assumed — all 4 door guids in the log's `§ROOM_PATH` line were
verified present in `Hospital_extracted.db`'s `elements_meta`, and the storey list — `Level 1`
through `Level 7` — matches exactly). This directly answers §15's open item 1 (building was
previously unidentified).

**Route:** `≈ Level 1 R35 → ≈ Level 4 R8`, 6 hops, 124.69m, real `§ROOM_PATH` line:
```
§ROOM_PATH from=≈ Level 1 R35 to=≈ Level 4 R8 hops=6
  rooms=[≈ Level 1 R35, Corridor — Level 1, Corridor — Level 1, M_Single-Flush:0915x2134mm_Wood:668663,
         Corridor — Level 1, Corridor — Level 1, Stair(upper)×3, Corridor — Level 4, ≈ Level 4 R9, ≈ Level 4 R8]
  doors=[3O_8dIhBP9AxIGElgUmdrE,1wrNt7GW19tOpUaBLGwvsc,1wrNt7GW19tOpUaBLGwvsc,1wrNt7GW19tOpUaBLGwvsc,
         1ftA4aHx9FbOC5jIIu_g57,0X5AvQ9gP4TRYnhNSEodzV] distance=124.69m
```
Preceded by, same console session:
```
§PATH_LEGAL_DETOUR_FAIL storey=Level 1 no legal detour among 128 doors   (×2)
§PATH_LEGAL_DETOUR_FAIL storey=Level 4 no legal detour among 97 doors    (×3)
§PATH_LEGAL legalized=7 detoured=1
```

**Reading the numbers against §15's prediction:** §15 flagged Hospital as a "tie" building in §12's
raster-coverage summary (unlike Terminal/HHS's 99-100% illegal-point reduction) and predicted that,
if the screenshot building turned out to be one of the tie/no-raster cases, the zigzag/void-cut bug
would still be open by design, not a new regression. This log is consistent with exactly that: **5 of
6 same-storey legality checks on this route's own storeys FAILED to find a legal detour** (`legalized=7
detoured=1` against 5 logged `DETOUR_FAIL` events) — i.e. the A* raster-constrained polyline fix
(§13, PR #967) is not rescuing this route on Hospital, which lines up with what the three screenshots
show visually: `RoomsPathTopView`/`RoomsPathSideView` both show the yellow line crossing open
rooftop/atrium space rather than hugging real floor, and `RoomsPathFrontView` shows the same
vertical-then-horizontal zigzag shape §11 Task 2 originally described.

**Not concluded here, left for whoever picks up this lane next (explicitly NOT this session — Opus
already owns Fly Tour/room-pathing):** whether Hospital's raster genuinely has no usable coverage on
Level 1/Level 4 specifically, or whether (like Terminal's §12 Stage A case) there's a fixable
plumbing gap behind the "tie" result that was never root-caused the way Terminal's split-DB issue
was. That root-cause work was never done for Hospital — §12 only ever explains Terminal's gap.

### §15 CROSS-REF 2026-07-25 — a live contradiction to settle FIRST (from the Fly Tour lane)
§15 records raster coverage for 5 of ~29 buildings, **Hospital among them**. But the LIVE served
`Hospital_extracted.db` logs `§HELPERS_QUERY_ERR no such table: storey_walkable_raster` on every
load, followed by sixteen `§PATH_LEGAL_DETOUR_FAIL … no legal detour among 128 doors` and
`illegalChords=18/74` on the shipped route. So either the coverage claim refers to a different DB
snapshot, or the raster never made it into the served artifact.

That is a `project_db_snapshot_divergence_landmine.md` shape and it is cheap to settle — and it
matters beyond Find, because `_legalizePath` is shared: the same missing raster is degrading the Fly
Tour's routes on the same building right now. **Settle WHICH DB has the raster before re-running the
screenshot cases**, or the re-test will measure the wrong artifact. See
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION (G2).

## §17 — §16's REPRO ROOT-CAUSED AND FIXED (2026-07-25) — "did the rooms injection improve the
## pathing?" answered with measured numbers; bim-ootb `fix/roompath-node-logic`

```
# ⚠ DO NOT REMOVE
SCOPE: the user's question on §16's evidence — has the client-side room injection (142→214 rooms,
ROOM_INJECTOR_NEEDLE.md) improved Find-Panel pathing, how, and what is still lacking. Answered by
re-running the EXACT route from the screenshots headlessly against real fixtures (no screenshot
judgment — this project's FUNDAMENTAL LAW), then fixing what the numbers exposed. Read the §-log
lines quoted here before re-deriving anything. The `storey_walkable_raster` patch REGENERATED here
must reach OCI for the live viewer to see the fix — that upload runs through
`scripts/oci_patch_gate.js` from a CLEAN fresh-origin/main worktree AFTER the PR merges (the gate
refuses a dirty/behind engine by design), so a merged PR alone does NOT close this.
```

### The answer, in one line each
- **Injection IMPROVED reachability and made the reported route possible at all.** Both endpoints in
  the screenshots (`≈ Level 1 R35`, `≈ Level 4 R8`) are injector-produced rooms — the served DB
  compiles 142 spaces, the client self-heal takes it to 214. Route topology was already sound: 4
  distinct portals, a real 3-flight stair Level 1→4, 124.69m, reproduced byte-for-byte headlessly.
- **Injection also silently BROKE the drawn geometry, and that is what the screenshots show.** The
  walkable raster is a build-time snapshot; `_pointWalkable` consulted it EXCLUSIVELY
  (`if (raster) return raster.contains(...)`), so rooms compiled after the raster was built had no
  floor under them: `≈ Level 1 R35` measured **0/110 of its own footprint walkable, no walkable cell
  within 12m**. Every legality test starting there fails at its first sample, which is why the log
  said `§PATH_LEGAL_DETOUR_FAIL … no legal detour among 128 doors` — the doors were never the
  problem, the endpoint was off-floor.
- **A second, bigger data defect was behind the rest** — and it is the "fixable plumbing gap" §16
  left open. The raster builder selected slabs in a HARDCODED window `[storeyZ−2, storeyZ+1]` around
  the average ROOM-CENTRE z (mid-height of the occupied volume). On Hospital that missed the real
  floor plate by **5cm**: `Level 4 window [181.79,184.79]`, floor slab `z=181.74`, **area 8270 m²**,
  excluded. Same on Level 5 (`186.74`, 8343 m²) and Level 1 (`165.59/165.74`, 8899 m²). So this
  building's raster was rooms-and-corridors only, its walkable cells were islands, and A* honestly
  reported "no on-floor route" — the straight chords in `RoomsPathTopView/SideView` are that degrade.

### Measured, real fixtures (`buildings/Hospital_meta.db` = served bytes; `~/Projects/BIM_DB/HospitalV2.db` = post-injector save)
Route `≈ Level 1 R35 → ≈ Level 4 R8`, per-leg illegal samples @0.25m (`RG.chordIllegalCount`) and
`RG.astarHop` verdict per leg:

| state | DETOUR_FAIL | legs A*-clean | illegal samples on the drawn legs |
|---|---|---|---|
| as captured 2026-07-25 05:32 (production) | 5 | 5/8 | **312** |
| + engine fixes (this PR), old shipped raster | 3 | 8/11 | 265 |
| + regenerated raster (this PR) | **0** | **15/15** | **0** |

Room-pair pathability on the SERVED 156-room set (`pathab.js`, 12090 pairs) — a clean 2x2 showing
which half of the fix does what:

| engine | raster patch | deg-0 rooms | pathable |
|---|---|---|---|
| origin/main | shipped | 26 | 69.4% |
| this PR | shipped | 24 | 71.5% |
| origin/main | regenerated | 7 | 91.2% |
| this PR | regenerated | **7** | **91.2%** |

Provenance gate (`poc_raster_cover.js`, the same invariant the 2026-07-25 deploy used): regenerated
raster is **100.0% own-footprint median AND mean for every one of the 156 rooms** (149 connected +
7 deg-0, `connected_rooms_below_30pct=0/149`).

### What was actually wrong in the logic (all in this PR, each with its own § comment in-code)
1. **`§RASTER-UNION-NOT-EXCLUSIVE** (`common/room_graph.js`) — raster is a union MEMBER again, not a
   short-circuit. §G3-REVISED's own words were "this revision only replaces how the SLAB half of the
   union is computed"; the implementation made it "raster INSTEAD of rooms", which breaks under any
   room-set change. Monotone (illegal→legal only); HHS's courtyard still fails correctly (no room
   rect covers it — 156/194 on this file's own rooms-only diagnostic).
2. **`§DOOR-THRESHOLD-WALKABLE`** — a door's own measured footprint (`bbox_x/bbox_y` + the existing
   `DOOR_BUFFER_SLACK`) is walkable. A doorway is the only place you can cross a wall, yet neither
   slab triangles nor room rects cover it: real doors `737178`/`775497` read `walkable=false` at
   their own centres, which is ALSO why A* found no route between two rooms that share a doorway.
3. **`§STAIR-FOOTPRINT-WALKABLE`** — same for each real stair FLIGHT ROW's footprint. All three
   `stairwp` anchors on this route were off-floor (nearest walkable 2.25–5.25m, far outside
   `_astarGrid`'s 1.2m snap). ⚠ Per-ROW, never the name-keyed group bbox: on Hospital 61 assembly
   rows share one key and the group box is **84.1 × 63.9m (5368 m², the whole building)** — using it
   blanketed every storey and declared every chord legal. Caught by measuring, not by review.
4. **`§HOP-DOOR-WAYPOINT`** — an E2 edge is literally `{a: room, b: spine, doorGuid: g, wpB: g}`
   ("leave this room through THIS door"), but `_publicHop` only substituted waypoints for `circ`
   nodes, so a room→spine hop drew room-centre → corridor-point as ONE 32.6m line and skipped the
   door it is named after. Now inserted (never substituted — the spine point is real too).
   `doors[]`/`distance` untouched, per PATH_LEGAL_SEGMENTS.md's scope fence.
5. **`§ANCHOR-DEDUPE`** — two distinct spine guids at the SAME point (`Corridor — Level 1` at
   (48.6,110.2) twice) produced a zero-length hop and a duplicated Find-panel row.
6. **`§PATH_PANEL_KINDS`** (`viewer/navigate_find.js`) — the panel rendered every `res.path` entry as
   a numbered ROOM stop and zipped it POSITIONALLY with `res.doors[i]`. The two arrays differ in
   length AND sequence, which is exactly why the screenshots show a DOOR as stop 4,
   `└─ door: Stair:180mm max riser 280mm going` under corridor rows, the same corridor listed twice,
   and a "6 doors" header for a route crossing **4 distinct portals, one of them a stair counted once
   per storey hop**. Now rendered by node KIND (stop / through door / via stair / along corridor) and
   headed with distinct counts (`3 doors · 1 stair · 124.7m`).
7. **`§ROOM_PATH_PRECISION` + `§DETOUR_FAIL_CAUSE`** (§14's rule, applied): `§ROOM_PATH` now carries
   `portals=`, `anchors={room:4 doorwp:8 spine:3 stairwp:3}`, `polyPts=` and `repeatedPortals=[…]`,
   and a failed detour states `cause=ENDPOINT_OFF_FLOOR|WALKABLE_ISLANDS aWalkable= bWalkable= len=
   illegal= candidates=` instead of the door-blaming `no legal detour among 128 doors`.
8. **`§FLOOR-PLANE-NOT-FIXED-WINDOW`** (`scripts/build_storey_walkable_raster.js`) — derive the floor
   plane (highest slab at/below the occupied centre, 4m lookdown, then everything coplanar within
   0.35m) instead of guessing a 2m window. Coverage, same building, same source data: Level 1
   39.8%→**69.3%**, L2 20.9%→**63.5%**, L3 46.2%→63.5%, L4 20.5%→**41.2%**, L5 19.6%→39.1%,
   L6 27.3%→42.4%.
9. **`§RECT-INDEX`** (perf) — one lazily-built 4m bucket grid per storey over all rect sources. The
   union change means off-raster samples no longer short-circuit, and A* calls this predicate millions
   of times per click: measured 0.01→0.03ms per 5–30m chord with linear scans, back to **0.01ms**
   with the index. `buildGraph` 171→216ms on Hospital (one-off per load).

### Blast radius, checked not assumed
`fixedWindowWouldStartAt` in the new `§RASTER_FLOOR_PLANE` log shows HHS (all storeys), JKR (all) and
Terminal (Aras 01/02/Tanah/Bumbung) already had their floor plane INSIDE the old window — their
rasters are unchanged by fix 8, so only **Hospital's patch is regenerated in this PR**. Terminal's
`Aras 03`/`Aras 04` windows widen slightly (15.82→15.75, 20.63→19.75); its raster lives inside a
1000-statement rooms patch, so regenerating it is left as a separate, small follow-up rather than
churning that artifact here.

### Still open after this (named, not silently dropped)
- **The OCI upload of the regenerated Hospital patch** (both filenames — the loader keys on the
  served `_meta` name). Gate-then-upload, post-merge, from a clean worktree.
- **Terminal Aras 03/04 raster refresh** (above).
- **`MissCOback2doors`' door-revisit question is now ANSWERABLE from the log alone** rather than
  needing a re-shoot: `repeatedPortals=` on `§ROOM_PATH` distinguishes a real double-back from one
  stair counted per flight — on this route it was always the latter.

### §17 WITNESS PASS — fleet numbers, two self-caught defects, and honest red-attribution
Everything below is from the real witness suite in the `fix/roompath-node-logic` worktree, not from
the reported route alone.

**Fleet effect (all measured, all in the improving direction):**
| building | metric | before | after |
|---|---|---|---|
| Hospital | DETOUR_FAIL sweep, 3023 real pairs | 63.3% (1914) | **0.0% (0)**, newlyBroken=0 |
| Hospital | room-pair pathability / deg-0 rooms | 69.4% / 26 | **91.2% / 7** |
| Terminal | polyline illegal pts (raster, split-DB) | 352 | **0** (100%), worsePairs=0 |
| Terminal | DETOUR_FAIL | 55.8% | **52.5%** |
| HHS | straight-chord illegal pts | 90 | **0 at source** (doorway/stair gaps now covered) |
| HHS | DETOUR_FAIL (true 105-room set) | 28.7% | **19.3%** |
| Clinic | polyline illegal pts (rect fallback) | 49 | **0** (100%) |
| Duplex | route + polyline | unchanged | unchanged (no raster, rect fallback) |

**Route-vs-geometry fence, measured over 436k+ pairs:** `doors[]` and the room-stop sequence are
**100% identical** to origin/main on Duplex/JKR/HHS/Hospital, zero lost connections, zero newly
connected, **zero longer** routes. Distance is identical except 50/1281 JKR pairs that got SHORTER —
same doors, same stops: §BRIDGE-ROUTED-LEGAL (#997) weights a room→circulation bridge by its ROUTED
walk length, so better floor evidence straightens a bridge that previously needed a 2-turn detour.

**Perf:** `§POLY_TIMING Hospital connectedPathsTimed=300 avgMsPerPath=8.89 maxMsPerPath=63.09
avgPolyPts=13.1`; one route on the injected 214-room set 45→66ms; predicate held at 0.01ms/chord by
§RECT-INDEX; `buildGraph` 171→216ms.

**Two real defects this pass caught in MY OWN change before it reached a PR** (both by
`compare_routes_ab.js`, which is why that harness is now committed next to this file):
1. `_dedupeAnchors` dropped a real ROOM stop when it sat within 5cm of a corridor waypoint — on HHS
   (where §CORRIDOR-ROOM-BACKPROP synthesises corridor ROOMS on the spine point) that silently
   changed the room sequence of 78/210 sampled pairs while doors/distance stayed identical. Now
   waypoint-only.
2. Folding door/stair rects into the "is this storey judgeable" test flipped the `null` (cannot
   judge) contract: a storey with no rooms and no corridors but some doors went from never-penalised
   to judged against ~1m² slivers. JKR's no-raster baseline went 34.2%→49.6% — a straight regression
   from a change that is only supposed to turn illegal into legal. Now additive-only
   (§NULL-CONTRACT-UNCHANGED).

**Witness reds — attribution checked against an UNMODIFIED origin/main worktree, not assumed:**
- `witness_room_path_ui.js` **6/13 → 13/13**. Its 7 reds pre-existed on origin/main: it picked Duplex
  rooms by the names `A202/A205/A103/A104`, and the browser's room set no longer contains them — the
  live picker shows 7 rooms, all injector-compiled (`≈ Level 1 R1 · COMPILED INTERNAL`,
  `⚠ Roof R1 · COMPILED SUSPECT_NO_DOOR`), while the SAME `Duplex_extracted.db` read in node still
  yields the real named IFC spaces. **Open item, injector lane not Find lane: the client-side
  recompile REPLACES named IFC spaces with synthetic `≈ Level N Rk` ones, so real room names are lost
  from the Find picker on a building that HAS them.** Picks are dynamic now, and the panel is asserted
  against the engine's own `§ROOM_PATH from=/to=` names.
- `witness_jkr_walkable_raster.js` (G2/G4) and `witness_terminal_walkable_raster.js` (G2) were
  **already red on origin/main with identical numbers** — drift from #995-#997's walkability-gated
  bridges, not from §17. Renumbered/re-specified with that attribution recorded in-file.
- `witness_room_graph_utility_penalty.js` F compares against a **#959-pinned** engine; origin/main
  itself scores 178/190 there, so §17 adds zero divergence. Pinned to the measured floor.
- `witness_hospital_walkable_raster.js` G3 asserted a permanent TIE and now fails BY SUCCEEDING;
  premise rewritten per its own closing instruction (re-derive, don't bump the floor).
- `witness_room_path_raster_polyline.js` G1b asserted a ">=95% reduction" that cannot be met once the
  baseline is 0 (HHS); guarded. G2 sharpened from byte-identical `path` to route identity.
- Green throughout, unchanged: `witness_room_graph_path.js` 15/15, `witness_backbone_routing.js`,
  `witness_corridor_room_backprop.js`, `witness_occupant_pathfinder.js`.

### §17 SHIPPED + DEPLOYED (2026-07-25) — nothing left pending for this route
- **bim-ootb #1006 MERGED** (`8356978`) — engine + panel + log + raster builder + regenerated Hospital
  patch. CI `fast-checks`/`e2e-tests` green.
- **bim-ootb #1007 MERGED** (`491413f`) — `§ROOM_PATH` `stops=[]`/`via=[]` split. ⚠ This commit was
  pushed to #1006's branch moments before auto-merge fired and was **orphaned by the squash** (exactly
  the trap `CLAUDE.md` §Concurrent branches names); caught by grepping `origin/main` for the change
  rather than trusting the merge, then re-landed off fresh `origin/main`. Verify, don't assume.
- **OCI DEPLOYED, both filenames** (the loader keys on the served `_meta` name): `bim-ootb`
  `buildings/patches/Hospital_meta.db.sql` + `…/Hospital_extracted.db.sql`, 226962 bytes,
  md5 `7e97413cd546d4065de67a8565a17b22`, `Content-Type: application/sql`. Through
  `scripts/oci_patch_gate.js` (§RULES 6) from a CLEAN worktree at `origin/main` `491413f`
  (`behind_origin_main=0`, `clean=true`) with the provenance check as `--verify`
  (`connected_rooms_below_30pct=0/149`) → `§GATE_VERDICT PASS` → `UPLOAD_VERIFIED`. Re-fetched over
  HTTPS: `http=200`, 226962 bytes, md5 matches the repo file, 7 raster rows.
  **This was an OVERWRITE** of the 144960-byte raster uploaded earlier the same day (00:49) — the
  previous bytes are saved (md5 `b78752414fbaaf06d27373bb802dedde`, also recoverable from
  `git show 8356978~1:buildings/patches/Hospital_meta.db.sql`), so a rollback is one gated upload.

### §17 CONFIRMED LIVE IN THE BROWSER (2026-07-26 00:0x, user's own session) + the two residuals
The user reloaded after #1009 and captured the route again. The live `§ROOM_PATH` line matches, field
for field, the fingerprint predicted from `Hospitalv3.db` + the live patch — this is the end-to-end
proof, from the real app, that both halves (engine AND raster) are delivered:
```
§PATH_LEGAL_DETOUR_NONLOCAL storey=Level 4 no local detour within 6m margin, used a wider one   (x2)
§PATH_LEGAL legalized=9 detoured=3
§ROOM_PATH from=≈ Level 1 R35 to=≈ Level 4 R8 hops=6 portals=4
  anchors={room:3 doorwp:9 spine:4 stairwp:3} polyPts=19
  stops=[≈ Level 1 R35,≈ Level 4 R9,≈ Level 4 R8]
  via=[…737178, …646876, Corridor L1 x3, Stair (upper) x3, …529900, …580257, Corridor L4,
       …582380, …528097, …531444, …775497, …531444]  distance=124.69m
  repeatedPortals=[1wrNt7GW19tOpUaBLGwvsc x3]
```
**Zero `§PATH_LEGAL_DETOUR_FAIL`** (was 5 at the 05:32 baseline, 3 after the engine landed but before
the raster reached the browser). `doorwp` 5→9, `polyPts` 15→19, `distance` unchanged at 124.69m — the
anchor sequence is byte-identical to the fixture measured at **legs=15 illegal=0** (was 265 illegal
across 3 unroutable legs). Panel reads `3 doors · 1 stair · 124.7m`, three numbered stops, every hop
labelled by kind.

⚠ **A note on what "improved" looks like here, because it is counter-intuitive and was misread once:**
MORE waypoints and an UNCHANGED distance is the success signal. The scope fence freezes which rooms
and doors a route uses (`doors[]`/`distance` untouched); the fix only adds turn points so the drawn
line follows real floor. Fewer waypoints on this route would mean the raster had gone stale again.

#### Two residuals — cosmetic, NOT correctness, both visible in the log above. Not fixed, not urgent.
1. **`§PATH_LEGAL_DETOUR_NONLOCAL x2` on Level 4** — `_detourForChord`'s local pass
   (`DETOUR_LOCALITY_MARGIN = 6.0m`) found nothing for two chords, so the unrestricted storey-wide
   Dijkstra supplied the waypoints. Legal by measurement (those legs sample 0 illegal), but a
   storey-wide pick has no sense of overall direction — the exact failure mode §DETOUR-LOCALITY was
   written to bound (2026-07-14: a route walked to the far end of a 13m room before doubling back).
   Worth a look ONLY as line-tidiness: which two chords, and would a slightly larger local margin (or
   a direction-biased candidate order) find a nearer legal detour? Do NOT widen the margin without
   re-measuring — the 6m value was chosen against real Clinic data.
2. **`…531444` appears twice in `via=`** (positions 14 and 17) — the legalizer inserts that door as a
   detour waypoint for the `spine → 775497` chord, then the logical route leaves R9 through the SAME
   door into R8. A real ~3m back-step: geometrically honest (0 illegal), but it renders as a wiggle
   and it is the shape once reported as `MissCOback2doors`. Note `repeatedPortals=` correctly
   attributes the OTHER repeat (the stair, x3) to three flights of one stair rather than a revisit —
   that distinction is now readable from the log alone, which was §15's open item 4.
   Possible fix, unproven: when a detour waypoint equals an anchor that appears later in the same
   path, prefer a different legal waypoint. Must be measured, not assumed — collapsing the span is
   NOT allowed (R9 is a real intermediate room stop).

### §18 (2026-07-26 evening) — residual #2 above is RESOLVED on Hospital; user now reports the SAME
### crossing shape on a SECOND building (JKR) — generalize the check before touching any code
**Residual #2 closed, `#1010` (`34c0286`, already merged):** `§DETOUR-NO-REVISIT`/`§NOREVISIT-LENGTH-GUARD`
does exactly the "possible fix" above — retries with the revisit-causing waypoint vetoed, but only
swaps to it when the alternative is NO LONGER (measured on Hospital: reject would cost 229.4m→230.9m
drawn-line-wide, 42.3m→43.8m on the local chord). Independently RE-VERIFIED live this session (not
just re-reading the commit), via a direct `RoomGraph.shortestPath()` call against the real browser
state — `viewer/tests/witness_detour_revisit_shortest_2026-07-26.js` — reproducing
`§PATH_LEGAL_DETOUR_REVISIT_KEPT storey=Level 4 ... (42.3m -> 43.8m)` fresh and confirming `kept <
rejected`. Both candidates come only from `_detourForChord`'s own Dijkstra over real `doorwp`/`spine`/
`circ` nodes, so this is a straight shorter-of-two-already-legal-routes comparison — the visible
crossing on Hospital is what the genuinely shortest real walking path looks like there, not a bug.

**New user report, same evening, DIFFERENT building — JKR, NOT Hospital:** a fresh Path query
`≈ VÅNING 1 R1 → ≈ VÅNING 2 R68` (6 doors · 1 stair · 183.6m, `hops=7 portals=7 anchors={room:6
doorwp:8 spine:7 circ:1 stairwp:1} distance=183.57m`) shows a visually similar criss-crossing yellow
line near a corridor in the user's own screenshot. **Not investigated this session — user explicitly
said "don't look at this building [now]," this is a filed handoff, not a finding.** Two things worth
checking next session, in order:
1. Re-run the SAME verification methodology (§-log first, never the screenshot alone — the FUNDAMENTAL
   LAW this project already runs on) against JKR's actual route: does it also print a
   `§PATH_LEGAL_DETOUR_REVISIT_KEPT` or `§PATH_LEGAL_DETOUR_NOREVISIT` line, and if so, do the two
   compared lengths confirm `kept <= rejected` the same way Hospital's did? If yes, JKR's crossing is
   ALSO the genuine shortest path and this closes as "confirmed pattern, not a bug, twice."
2. If JKR's case does NOT reduce to the same log line (e.g., a crossing with no detour-retry log at
   all, or one where the "kept" side is actually LONGER), that would be a genuinely new failure mode
   this file hasn't seen yet — investigate `_detourForChord`/`_legalizePath` fresh against JKR's own
   data, don't assume it's the same mechanism just because it looks the same in a screenshot.
3. `viewer/tests/witness_detour_revisit_shortest_2026-07-26.js` is currently hardcoded to Hospital's
   `R35`/`R8` room-name regexes — generalize it to take building file + two room-name substrings as
   parameters (env vars, same convention `witness_corridor_reveal_shell_2026-07-26.js` already uses
   for `WITNESS_DB`) so re-running it against JKR is a one-line change, not a rewrite.

**Also unexamined, filed not fixed:** JKR's route stop 5 renders as `⚠ VÅNING 2 R61` — a warning-
triangle prefix, unlike every other stop's `≈` (compiled-approximate) prefix on this same route. Not
yet traced to which classifier emits `⚠` vs `≈` (possibly a `SUSPECT_OPEN`/low-enclosure flag, per
this file's own §ROOM-HAB filtering elsewhere — not confirmed, don't assume) or whether it affects
routing/legality at all. Check `room_habitability.js`/`room_walker.js`'s naming convention for the
`⚠` prefix before drawing any conclusion.

**Unrelated fix landed same session, for completeness (not part of the above):** `bim-ootb` PR #1019
— Hall/Corridor category-reveal drew ZERO shells when the group was entirely
`§CORRIDOR-ROOM-BACKPROP` synthetic guids (`rooms=0 doors=59` on Hospital, user's own live capture),
plus every Room-Lens category color (habitable/corridor/restroom/kitchen/bedroom/utilities) failed to
shine through in X-Ray mode (`_drawRoomShell` never set `depthTest`, same root cause
`§FILL-SHINE-THROUGH` fixed for the single-room cuboid 11 days earlier). Both fixed, witnessed,
merged into that PR. Orthogonal to the path-crossing question above — different function
(`_revealCategoryGroup`/`_drawRoomShell` vs `_detourForChord`/`_legalizePath`), noted here only so a
future session doesn't conflate "the corridor color is wrong" with "the path line crosses itself" —
they were two separate reports from the same evening, already resolved separately.

### §19 (2026-07-26, session close) — "it also switches scenes abruptly. It should animate between
### such jumps" — FILED, UN-TRIAGED, ask the clarifying question FIRST next session
User raised this immediately after the JKR path-crossing discussion above (§18), in the same session,
but the session ended (unrelated reason) before the clarifying question below got an answer — next
session's FIRST move on this item should be asking it, not guessing.

**Already checked, so don't re-derive:** the Room-select and Find-Path camera moves in THIS file
already animate — `_zoomToBoxFill()`/`_lerpCam()` (`viewer/navigate_find.js:2490-2546`) is a real
RAF-driven eased lerp (`camera.position.lerpVectors(start, end, ease)`, cubic ease-out, cancels
cleanly if the user grabs the controls mid-flight), not an instant snap. So whatever the user means by
"switches scenes abruptly," it is very unlikely to be the ordinary Room-tap or Find-Path zoom inside
this panel — those are already smooth. **Do not spend time re-verifying that fact; it's confirmed.**

**Candidate mechanisms, none investigated yet** (this is the clarifying question that needs asking):
1. **Switching buildings** — opening a different building (e.g. Hospital → JKR, via Open Building /
   the building picker, `A._openDbBytes` / the `?db=` reload path in `main.js`/`scene.js`). A full
   dataset swap — plausibly the most likely candidate given the user's own JKR-right-after-Hospital
   testing flow this session — but also the hardest to meaningfully "animate" (different coordinate
   space, different geometry entirely; a cross-fade/loading-transition is a different kind of fix than
   a camera lerp).
2. **History Bar jumps** — tapping a dot/session in the shared History Bar (`§HIST_TAP_WIRED` logs
   list `camera` as one of the fields a tap restores, alongside ghost/xray/section/palette/clash) —
   plausibly an instant camera restore with no easing.
3. **Fly Tour room-to-room** — the automated tour (`tour.js`) moving between stops.
4. Something else in Find/Path not yet named.

**Next session:** ask the user which of these (or something else) they meant, using their own words
about what they were doing right when they saw the jump — then trace ONLY that mechanism's camera-set
code (does it write `camera.position`/`controls.target` directly with no lerp, the way the FIXED
Room/Path case above used to before `_lerpCam` existed?) before proposing an animate-in fix. Reuse
`_lerpCam`'s existing pattern (RAF, cubic ease-out, controls-grab cancellation) rather than inventing a
second easing implementation if the target turns out to be another camera-set call site in the same
file or a sibling one (`tour.js`, `history_tap.js`).

## SESSION STATUS (2026-07-26 close-out, for whoever picks this up next)
- **DONE, merged, live:** `bim-ootb` PR #1019 — Find-panel close-leak fix (category-reveal doors +
  Path highlight surviving `closeFindPanel()`), Hall/Corridor category-reveal shell fix (§CATEGORY_REVEAL
  `rooms=0`→correct), Room-Lens category-color shine-through-in-X-Ray fix. All witnessed, all merged.
- **DONE, verification-only, no code changed:** the Level-4 door-revisit shortest-path trade-off
  (§17/§18 residual #2) re-confirmed live and correct on Hospital.
- **OPEN, handed to §18 above:** does the JKR path-crossing reduce to the same benign
  detour-revisit-kept mechanism, or is it a new failure mode? Not investigated — filed only.
- **OPEN, handed to §19 above:** "scenes switch abruptly, should animate" — mechanism not identified,
  clarifying question not yet answered.
- **OPEN, filed in `prompts/STAFFAGE_WALKABLE_PLACEMENT.md` §STAFFAGE_PERSIST:** Alt+P staffage
  placement not surviving a save+reopen — traced the save/reopen code paths, leading hypothesis is a
  workflow mismatch (reopening the same URL instead of the exact saved file via Ctrl+O) rather than an
  engine bug, but unconfirmed — needs the user's exact steps before any fix.
- Branch/worktree cleanup for this session's work is being handled by a separate concurrent session —
  not part of this file's scope.

## §20 — REDUNDANT PATHING, MEASURED (2026-07-30) — the cabling lane's blocking precondition
## Spec written BEFORE any code, per project Spec-First. Witness: `W-ROOM-PATH-REDUNDANCY`

```
# ⚠ DO NOT REMOVE — W-ROOM-PATH-REDUNDANCY scope (READ THE LOG after every run)
SCOPE: characterise the user's long-standing "redundant pathing errors" NUMERICALLY on Clinic
(118 spaces, 254 doors) and Duplex (5 spaces, 14 doors). Measure only — this section authorises
no engine change; fixes are specified separately once the numbers say which defect is real.
Evidence is §-tagged values and computed numbers ONLY. Screenshots are not evidence here, not
even as a supplement (project FUNDAMENTAL LAW). Read the saved log before any conclusion.
```

### Why this section exists (the precondition, not a suggestion)
`prompts/datacentre_cabling.md` §NEXT_SESSION blocks the whole cable-pathing lane on this:
*"similar to what we done for rooms path even though i still find redundant pathing errors, but it
is a substrate to walk further on … put a precondition to review rooms pathing first."* Cable
pathing inherits the SAME A*, the SAME polyline builder and the SAME highlight layer
(§PATH_THEN_PLACE: *one engine, two graph sources*). Ship on top of an engine with unmeasured
redundancy and every future cable complaint is ambiguous — is the route wrong, or the router?
**Nobody has ever measured the redundancy.** Every number in §11-§18 is a *legality* statistic
(illegal sample points, DETOUR_FAIL counts) — legality asks "does the line stay on real floor",
redundancy asks "does the line waste the walk". A route can be 100% legal and still double back.
That is exactly the gap the user keeps seeing and this file has never quantified.

### §20.1 Regime fidelity — measure what the BROWSER routes, not what node happens to read
Non-negotiable, and it is the trap [[feedback_witness_headless_regime_gap]] names:
- Clinic and Duplex both carry **only `RM_`-prefixed compiled rooms and no `room_guid` column**
  (verified: `SELECT ... spatial_structure WHERE type='IfcSpace'` → Clinic 118/118 `RM_`,
  Duplex 5/5 `RM_`). So `A.ensureRooms` reaches state `recompute`, finds no `rooms_meta`, scores
  `versionStale=true` and **recompiles with `RoomWalker.walk()` on every load**. A witness that
  calls `RG.buildGraph()` on the raw file measures a room set the browser never routes.
  → the witness MUST run `RoomWalker.walk(db, {write:true})` first, sql.js in node, exactly as
  `witness_containment_alias_js.js` already does.
- Neither building has a `storey_walkable_raster` table and neither has a
  `viewer/buildings/patches/*.sql` — both are the **rect-fallback** regime (`_pointWalkable`'s
  room-rect + corridor-rect + §DOOR-THRESHOLD/§STAIR-FOOTPRINT union). That is deliberate: it is
  the WEAKER evidence regime, where redundancy should be worst and most visible.
- Engine under test = **`origin/main`**, read from a fresh worktree. The shared `~/bim-ootb`
  checkout was 119 commits behind on 2026-07-30 and its `common/room_graph.js` genuinely differs
  (no §DOOR-THRESHOLD-WALKABLE, no §STAIR-FOOTPRINT-WALKABLE, no §DETOUR-NO-REVISIT). Measuring
  there would have reported already-fixed defects as live.

### §20.2 The six metrics — exact definitions, so a re-run is comparable
Per room-pair route, from `RG.shortestPath(g, a, b)` → `{path, doors, distance, polyline}`.
`path` = logical anchors; `polyline` = the DRAWN line (what the user sees and calls redundant).

| id | metric | definition |
|---|---|---|
| **R1** | **anchor revisit** | a guid appearing ≥2× in `path`. Split into BENIGN (`stairwp` hops sharing one `stairBaseKey` — one stair counted per flight, §17 proved this is not a revisit) and REAL (any other repeat). Report `excess = path.length − distinct`. |
| **R2** | **point revisit** | polyline vertices within **0.05 m** of an EARLIER non-adjacent vertex — the line physically returns to a spot it already occupied. |
| **R3** | **doubled-back segment** | interior turn angle **> 150°** between consecutive polyline segments (unit-dot < −0.866). Report count AND the metres inside those reversal pairs. |
| **R4** | **detour ratio** | `polylineLength / straightLineDistance(endpoints)`, 2D, **same-storey pairs only** (a stair climb is not a detour). Report median / p90 / max and the counts over 1.5× / 2× / 3×. |
| **R5** | **room re-entry** | classify every polyline vertex by which compiled room rect contains it; a room occupying ≥2 **non-contiguous** runs = one re-entry. This is the user's own words — "detours through a room the route already left". |
| **R6** | **detour-quality events** | counts of the engine's existing `§PATH_LEGAL_DETOUR_FAIL` / `_NONLOCAL` / `_REVISIT_KEPT` / `_NOREVISIT` log lines over the sweep. Free instrumentation, already shipped; it attributes R2/R3 to a mechanism instead of leaving them anonymous. |

**Headline number** = `excessMetres = polylineLength − straightLine`, summed and per-route, because
that is the one an engineer can picture and the one that becomes cable cost downstream.

### §20.3 Sweep
All room→room pairs on each building (Clinic ≈ n(n−1)/2 after the walker's own room count; Duplex
trivially small). Skip null (disconnected) pairs and report their count separately — an unreachable
pair is a connectivity fact, not a redundancy fact, and conflating them is how "41%" happened in the
cabling lane. Perf budget is not a concern at this scale (§17 measured 8.89 ms/path on Hospital).

### §20.4 DONE WHEN
1. `witness_room_path_redundancy.js` runs green on both buildings, output saved to a log file, log
   read before any conclusion is written here.
2. Each of R1-R6 has a real number for Clinic AND Duplex recorded in a §20.5 results table.
3. Every defect the numbers expose is either FIXED (own spec section, own witness) or DOCUMENTED
   here with the number that proves it — then the cable lane's precondition is lifted explicitly in
   `prompts/datacentre_cabling.md` §NEXT_SESSION, citing this section.

### §20.5 RESULTS — the redundancy, measured (2026-07-30). Engine `origin/main` `8bf6035`.
Witness `witness_room_path_redundancy.js`, log `/tmp/w_roompath_redundancy.log`, read before writing
this. Every building here is the **rect-fallback** regime (no `storey_walkable_raster`, no patch) and
every room set is the browser's own `RoomWalker.walk()` recompile, per §20.1.

| | Clinic | Duplex | LTU_AHouse |
|---|---|---|---|
| rooms after walker recompile | 208 (from 118 `RM_` spaces) | 7 (from 5) | 425 (from 369) |
| graph nodes / edges | 500 / 468 | 20 / 9 | 1103 / 790 |
| pairs / routed | 21,528 / 16,195 (75.2%) | 21 / 2 (9.5%) | *see §20.5b* |
| **R1** real anchor revisits | **9,121** on 6,697 routes (**41.4%**) | 0 | |
| **R2** point revisits (≤0.05 m) | 8,827 on 6,698 routes (41.4%) | 0 | |
| **R3** doubled-back segments (>150°) | **29,064**, 119,076 m, on **83.2%** of routes | 2 on 1 of 2 | |
| **R4** detour ratio median / p90 / max | **2.29** / 4.54 / 41.29 | 2.73 | |
| **R5** room re-entries | 168 on 2.0% of same-storey routes | 0 | |
| **R6** `DETOUR_FAIL` / `REVISIT_KEPT` / `MID` | 358 / 1,066 / 464 | 2 / 0 / 0 | |
| **headline** drawn vs straight | 532,260 m vs 216,443 m = **+145.9%** | +153.3% | |

**The redundancy the user has been reporting for weeks is real and it is large.** 83.2% of Clinic
routes contain at least one >150° reversal; the drawn line is on average 2.3× the straight line.
**Zero stair-flight repeats were miscounted as redundancy** (`benignStairFlights=0` — §17's
`repeatedPortals` distinction is preserved), so R1's 9,121 are all genuine anchor revisits.

**R4 is not an adjacent-room artifact — checked, not assumed** (`/tmp/ratio_buckets.js`, strided
representative sample, ratio bucketed by straight-line distance):
| straight-line | Clinic median / p90 | LTU median / p90 |
|---|---|---|
| 0-5 m | 3.82 / 14.42 | 5.24 / 11.71 |
| 5-15 m | 2.52 / 8.35 | 3.09 / 8.04 |
| 15-40 m | 2.40 / 3.91 | 2.60 / 4.27 |
| **40 m+** | **1.88** / 2.43 | **2.00** / 2.68 |
Even on long same-floor trips, where the straight-line baseline is robust and a real building's
walked/straight ratio should sit near 1.2-1.4, the drawn line is ~2×.

### §20.5a The probed route — one case, dumped end to end (`probe_redundancy_route.js`)
`Clinic ≈ Second Floor R4 → ≈ Second Floor R8`, two rooms **2.57 m apart**:
```
§PROBE_LOGICAL distance=251.32m anchors=17 doors=6
   A0 room R4 (-44.14,20.33) → A1 door 238171 → A2 room R3 → A3 door 241616 → A4 room ⚠R12
   → A5 door 250602 → A6 room R39 → A7 door 241351 → A8 spine (-17.76,16.56)
   → A9 spine (-13.53,22.91) → A10 door (-19.28,22.91) → A11 door (-18.62,37.14)
   → A12 circ (-16.66,39.28) → A13 spine (-33.43,30.12) → A14 spine (-39.27,18.23)
   → A15 door 238316 → A16 room R8 (-41.57,20.14)
   P12 seg=2.90m turn=161°  <<< REVERSAL
§PROBE_TOTAL drawn=106.25m straight=2.57m ratio=41.29 logicalDistance=251.32m
```
Three separate things are visible in that one dump:
1. **A8→A9→A10**: 7.63 m east to a corridor spine, then 5.75 m straight back west past where it
   started. A pure excursion.
2. **A12 `circ`**: the per-storey circulation hub at (-16.66,39.28). The route climbs 14 m north to
   reach it and immediately turns 161° back south-west — the reversal R3 counts.
3. **`distance=251.32m` for a 106.25 m line.** See §20.6.

### §20.6 ATTRIBUTION — what is actually causing it (`witness_room_path_redundancy_attrib.js`)
Log `/tmp/w_roompath_attrib.log`. A/B = the same engine file with **one constant** changed.

**FINDING 1 — `res.distance` is not a distance, and the Find panel prints it as metres. CONFIRMED.**
`_dijkstraCore` accumulates EDGE WEIGHTS, and `_buildAdjacency` multiplies any edge touching a
utility-tagged room by `UTILITY_EDGE_PENALTY = 8`. `viewer/navigate_find.js:3358` renders
`res.distance.toFixed(1) + 'm'` in the panel header and `:1398` puts it in `§ROOM_PATH`.
```
§ATTRIB_R7 Clinic     costVsDrawn median=3.20x mean=3.49x max=6.77x over1.05x=400/400
§ATTRIB_R7 LTU_AHouse costVsDrawn median=0.71x mean=0.72x max=0.98x over1.05x=0/400
```
On Clinic every one of 400 sampled routes reports a number **3.2× larger** than the line drawn. On
LTU (no utility rooms → penalty never fires) it goes the other way and reports **29% short**, because
the cost sums node-to-node Euclidean hops while the drawn polyline is the longer legalized/A* route.
Two different signs, one defect: **the number labelled "m" is not the length of the line on screen.**
This is precisely what `datacentre_cabling.md` §SLACK forbids downstream — a figure presented as
calculated that silently contains a policy factor — and the cable lane would inherit it verbatim.

**FINDING 2 — the utility penalty fires on 95.7% of Clinic's rooms. CONFIRMED, and it no longer
steers anything.** (`/tmp/util_breakdown.js`)
```
§UTIL Clinic     rooms=208 utility=199 (95.7%)   196 x "utility:ACMV"  ·  3 x "utility:footing"
§UTIL LTU_AHouse rooms=425 utility=0   (0.0%)
```
§10's `ignoreDoorExemption:true` classifies by element composition alone — and in a clinic, every
room has ceiling diffusers, so nearly every room reads as a plant room. An ×8 penalty meant to steer
around a few service closets is applied to almost every edge, where it is close to a no-op as a
*selector* but is the whole of FINDING 1 as a *number*. Measured:
```
§ATTRIB_R8 Clinic penalty8 vs penalty1, 400 identical pairs:
   drawnMetres 28642 -> 27745 (-3.1%)   medianRatio 2.20 -> 2.18   reversals 630 -> 854
```
**Removing the penalty is NOT the fix** — it changes drawn length by 3.1% and makes reversals *worse*
(630→854). Report the honest conclusion: the penalty is the distance-label corruptor, not the
redundancy driver. LTU is the control that proves it — penalty never fires there, A/B is byte-identical
(`drawnMetres 49385 -> 49385`, `reversals 587 -> 587`), and LTU still shows the same ~2× redundancy.

**FINDING 3 — the per-storey `circ` hub correlates with the worst detours on LTU. NOT YET ROOT-CAUSED.**
```
§ATTRIB_R9 Clinic     routesThroughCircHub=150/400 (37.5%) medianRatio withCirc=2.07 withoutCirc=2.30
§ATTRIB_R9 LTU_AHouse routesThroughCircHub=36/400  (9.0%)  medianRatio withCirc=2.32 withoutCirc=1.66
```
On LTU — **the building the user named as where the criss-crossing was seen** (2026-07-30) — a route
through the circulation hub is **40% more wasteful** than one that avoids it, and §20.5a shows the
mechanism shape: two corridor spine chains that physically meet are bridged only via one hub point, so
a chain-to-chain transfer detours to the hub and turns straight back. Clinic shows the opposite sign,
so this is **correlation with a plausible mechanism, not a proven cause** — it needs its own probe on a
real LTU route before anyone changes `circNode`/§CIRC-SPINE-BRIDGE. Do not treat it as diagnosed.

### §20.5b LTU_AHouse — the building the user named (2026-07-30, mid-session: *"the redundancy
### criss-crossing i encountered was in LTU-AHouse"*). Full sweep, 90,100 pairs, 22 min.
```
§REDUN_REGIME  LTU_AHouse walkerRooms=422 rects=529 suspect=121 raster=NO(rect-fallback)
§REDUN_GRAPH   LTU_AHouse rooms=425 nodes=1103 edges=790 storeys=4
§REDUN_SWEEP   pairs=90100 routed=80684 (89.5%) unreachable=9416 sameStoreyMeasured=25707
               noPolylineFallback=0 msPerRoute=16.60
§REDUN_R1  anchorRevisit excess=11636 benignStairFlights=0 REAL=11636 on 8882 routes (11.0%)
§REDUN_R2  pointRevisits=12617 on 9744 routes (12.1%)
§REDUN_R3  doubledBackSegments=191498  metresInReversals=2098100.6  on 73690 routes (91.3%)
§REDUN_R4  detourRatio median=2.09 p90=3.57 max=42.41  over1.5x=22179 over2x=14187 over3x=4405 of 25707
§REDUN_R5  roomReentries=624 on 624 routes (2.4% of same-storey)
§REDUN_R6  DETOUR_FAIL=1955 NONLOCAL=401 REVISIT_KEPT=2727 NOREVISIT=2 MID=17115 legalizeCalls=80684
§REDUN_HEADLINE drawnMetres=2836008 straightMetres=1336535 excessMetres=1499474 (+112.2%)
                avgExcessPerRoute=58.3m
```
**91.3% of LTU routes contain at least one >150° reversal** — the highest of the three, and it is the
building the user reported the criss-crossing on. The drawn line runs **2.09× the straight line at the
median**, and **58.3 m of pure excess per route** on average. Worst offenders are again adjacent-room
pairs: `≈ VÅNING 3 R90 → ⚠ VÅNING 3 R91`, 3.7 m apart, **158.8 m drawn** (ratio 42.41).

### §20.5c SUSPECT rooms are NOT the cause — a negative result, recorded so nobody re-chases it
Four of LTU's worst-eight routes end at a `⚠` (walker-flagged SUSPECT) room, which looks like a lead
and also closes §18's filed-but-unexamined question about the `⚠` prefix. Split by endpoint
(`/tmp/suspect_split.js`, strided sample):
```
§SUSPECT_SPLIT LTU_AHouse suspectRooms=121/425 (28.5%) | withSuspectEndpoint median=2.09 p90=3.84
                                                       | cleanBothEnds       median=2.02 p90=3.57
§SUSPECT_SPLIT Clinic     suspectRooms=26/208 (12.5%)  | withSuspectEndpoint median=2.12 p90=5.47
                                                       | cleanBothEnds       median=2.33 p90=4.62
```
**No effect.** LTU 2.09 vs 2.02; on Clinic a SUSPECT endpoint is marginally *better* (2.12 vs 2.33).
`⚠` rooms appear in the worst-eight simply because 28.5% of LTU's rooms carry the flag. **§18's `⚠`
question is answered: the SUSPECT classification does not degrade routing.** Do not re-open it.

### §20.7 VERDICT — what is proven, what is not, and why the cable precondition STAYS UP
**Proven, with numbers, on three buildings:**
- The redundancy the user reports is real, large and fleet-wide: **83.2% (Clinic) / 91.3% (LTU) of
  routes double back**, drawn line **+145.9% / +112.2%** over straight line, and the effect survives
  the obvious objection (40 m+ pairs still run 1.88×/2.00× — §20.5's bucket table).
- **`res.distance` is not metres** and the Find panel prints it as metres (FINDING 1, §20.6) — 3.20×
  over on Clinic, 0.71× under on LTU, 400/400 sampled routes affected on Clinic.
- **The ×8 utility penalty fires on 95.7% of Clinic's rooms** (FINDING 2) and is NOT the redundancy
  driver — removing it moves drawn metres 3.1% and makes reversals worse.
- **SUSPECT rooms are not a factor** (§20.5c).

**NOT proven — and this is the honest gap:** what actually causes the ~2× detour. Two of three
candidate mechanisms are now eliminated by measurement, not by argument. The surviving candidate is
FINDING 3 (per-storey `circ` hub transfers: on LTU, routes through the hub run 2.32 vs 1.66), and it
is **correlation with a plausible shape**, not a root cause — Clinic's sign is opposite.

**Therefore `datacentre_cabling.md` §NEXT_SESSION's precondition is NOT lifted.** Step 0 asked for the
redundancy to be characterised numerically and it now is; the engine is not yet clean. Handing cable
pathing an engine that reports a penalty-weighted cost as metres would put the same defect straight
into a cable schedule — the one thing §SLACK exists to prevent.

**The next two tasks, in order, each needing its own spec section before any code:**
1. **Root-cause the 2× detour.** Take one real LTU route with a high ratio (`probe_redundancy_route.js
   LTU_AHouse_extracted.db "VÅNING 3 R90" "VÅNING 3 R91"` reproduces a 42.41× case) and dump it the way
   §20.5a dumped Clinic's. The question to answer: are the corridor spine chains bridged ONLY through
   the single per-storey `circ` node, forcing every chain-to-chain transfer through one point? If yes
   that is the mechanism, it is testable by adding chain-to-chain edges where two chains physically
   meet, and it is measurable with the exact R3/R4 metrics above as the before/after.
2. **Make the reported distance the drawn distance** (FINDING 1). Cheap, self-contained, already
   root-caused: either report the polyline's own length, or keep the penalised value strictly as a
   routing cost and never render it with a `m` suffix. Needs a witness asserting
   `|reported − drawnLength| < ε` on all three buildings.

**Reusable assets committed with this section** (bim-ootb branch `review/roompath-redundancy`):
`witness_room_path_redundancy.js` (R1-R6 sweep), `witness_room_path_redundancy_attrib.js` (R7-R9
attribution + the penalty A/B), `probe_redundancy_route.js` (single-route end-to-end dump). All three
are building-parameterised; re-running any of them after a fix is a one-line change, not a rewrite.

## §21 — "IS THE PATHING FORMULA ABSTRACT AND GENERAL?" (user, 2026-07-31) — ANSWERED: NO, with the
## reason measured. Plus one PROTOTYPE THAT FAILED, recorded as a failure.

```
# ⚠ DO NOT REMOVE — W-ROOM-PATH-GRAPHLESS / W-ROOM-PATH-WALLAWARE scope (READ THE LOG)
SCOPE: answer the generality question with numbers, not architecture opinion. Measure only — no
engine file was modified in this section; both A/B variants are temp module copies deleted on exit.
Logs: /tmp/w_roompath_graphless.log · /tmp/w_roompath_wallaware.log · /tmp/wall_model_check.js output.
```

### §21.1 How it actually works (the user's own question: "all possible routes, or a central map?")
**It is a central map, precomputed once per building** — `RG.buildGraph()` runs once and is cached in
`navigate_find.js` `_pathGraphCache` (shared with the Fly tour via `A.getRoomGraph`); every query is
Dijkstra over that cached graph. The per-query cost is not the problem. **What the map is MADE OF is.**
Nodes: room centroids · door waypoints · corridor `spine` points (`hallway_backbone.js`, derived by
bucketing doors + rects) · **one synthetic `circ` hub per storey** · `stairwp` flight ends.
Edges: room↔room through a door (E1), room↔spine (E2), spine↔spine along one chain, **chain↔chain
only via the storey's single `circ` hub**, stair chains across storeys (E3).
So a "most dense walkway" skeleton ALREADY EXISTS — `hallway_backbone.js` is exactly that idea. It
wanders because the spine is inferred from door/rect clustering rather than from real free space, and
because two corridors that physically meet are still bridged through one hub point (§20.5a: 14 m north
to the hub, then a 161° turn straight back).

### §21.2 THE ANSWER: it is general in the wrong layer and specific in the wrong layer
The engine is **two layers optimising different objectives**:
- **L1** Dijkstra over node centroids, weighted by edge length × `UTILITY_EDGE_PENALTY` — decides
  WHICH rooms/doors.
- **L2** A* over `_pointWalkable` + the door-visibility legalizer — decides HOW the line is drawn.
L1 minimises a graph cost that is not walked metres; L2 then draws something else. That single split
explains all three §20 findings at once (2× detour · distance ≠ drawn length · circ-hub correlation).

**And the load-bearing discovery — `_pointWalkable` IS NOT WALL-AWARE.** Measured directly against
real `IfcWall` footprints (`/tmp/wall_model_check.js`, segment sampled at 0.05 m):
```
§WALLCHK Clinic "First Floor R7"->"First Floor R17" straight=10.7m chordIllegalCount=0
         realWallsCrossed=2  realDoorsOnSegment=0
         => PREDICATE SAYS WALKABLE THROUGH 2 WALL(S), NO DOOR
§WALLCHK LTU_AHouse "VÅNING 1 R27"->"VÅNING 1 R29" straight=4.5m chordIllegalCount=0
         realWallsCrossed=1  realDoorsOnSegment=0  => same verdict
```
The raster is slab-mesh-derived (a floor slab physically continues under interior walls) and the rect
fallback inflates every room rect by `DOOR_BUFFER_SLACK`, so **interior walls are invisible to the
geometry layer either way**. Every "illegal chord" number in §11-§17 measures OFF-FLOOR, never
THROUGH-WALL — that test has never existed.

**Therefore:** wall-legality comes ONLY from L1's door topology. The geometry layer is fully general
but blind; the wall knowledge lives entirely in a hand-tuned topological graph carrying ~12 constants,
several documented in-code as calibrated to one building (`DETOUR_LOCALITY_MARGIN = 6.0` — *"chosen
against real Clinic data"*). **That is why it does not transfer to a new building, and it is why the
graph cannot simply be dropped.**

### §21.3 Graphless A* — 2.19× shorter, and CONFOUNDED. Do not cite this as "the graph is waste."
`witness_room_path_graphless_astar.js` runs the engine's OWN exported `astarHop` room-centre to
room-centre with no graph (widened search window only — a temp copy, nothing else changed):
```
§GRAPHLESS_G1 Clinic     engineDrawn=10858m graphlessAstar=4639m straight=4581m
              engine/astar median=2.19x p90=3.84x max=11.62x | engineLonger=150 astarLonger=0 of 150
§GRAPHLESS_G1 LTU_AHouse engineDrawn=16217m graphlessAstar=8099m straight=7765m
              engine/astar median=1.96x p90=4.73x max=18.50x | engineLonger=148 astarLonger=0 of 150
§GRAPHLESS_RATIO Clinic vsStraight engine=2.37x graphlessAstar=1.01x
```
`graphlessAstar = 1.01× straight` is the tell: it is drawing the straight line — **through walls**,
per §21.2. The comparison is not evidence the graph is wasteful. It is evidence of how much of the
engine's length is topology the geometry layer cannot see.

### §21.4 PROTOTYPE THAT FAILED — wall-aware occupancy grid. Recorded so nobody re-runs it blind.
`witness_room_path_wallaware_astar.js`. Premise (still believed sound): `RoomWalker` ALREADY
rasterises wall + door footprints at its own `RES = 0.20 m` to flood-fill rooms, then DISCARDS that
grid — reuse it as the router's field instead of inventing an artifact. Prototype: walls from
`RoomWalker.storeyWalls()` blocked (1-cell seal), doors from `RoomWalker.storeyDoors()` cleared after
dilation, 8-connected A*, string-pulled against the same grid.
```
§WALLAWARE_W3 Clinic     pairs=42 noRoute=635 (93.8%) avgMsPerQuery=81.9
§WALLAWARE_W3 LTU_AHouse pairs=3  noRoute=549 (99.5%) avgMsPerQuery=1779.7
§WALLAWARE_W4 Clinic     throughWallViolations=49 on 31/42 routes (must be 0)
  ❌ W4 ZERO through-wall violations   ❌ W3 routes the great majority of pairs
```
**FAILED, and the failure is mine, not the idea's.** Two causes, both identifiable from the numbers:
1. `WALL_LIKE` includes `IfcWindow%`/`IfcCurtainWall%`/`IfcColumn%`, and a 1-cell seal on top of that
   closes the building into isolated pockets — hence 94-99.5% unroutable. `RoomWalker` succeeds on the
   SAME inputs because it has `§DOOR-RESCUE`/`§DOOR-PARTITION`/`doorAdjacent` handling the openings;
   this prototype re-implemented the rasterisation and NOT that logic.
2. The 49 violations are the endpoint `snap()` (up to 1.2 m) crossing a wall before the first
   segment, plus sub-cell clipping between a cell-centre test and a raw wall box.
**The one salvageable signal:** on the 12 Clinic pairs where the straight chord looks legal but a
wall-aware route must go round, the shipped engine ALSO goes round on 9 — **75% topology agreement**.
Small sample, but consistent with §21.2: the graph knows the right way round; its geometry is what wastes.

### §21.5 NEXT — the corrected experiment, and why the user's skeleton idea is the right shape
The user's proposal (2026-07-31): *"a main most dense walkway that has the most common paths possible …
a preprocess will obtain this or stored as one time process where all paths then depend on … merely
querying the shortest distance out of a path."* **That is the right architecture and it is one step
beyond §21.4's prototype:** derive the walkway skeleton from the wall-aware free space (medial
axis / distance-transform ridge), once per building, cached exactly where `_pathGraphCache` is cached
today — instead of inferring a spine from door/rect buckets. Then the drawn line IS the skeleton
polyline, so `distance` and drawn length cannot diverge (kills §20.6 FINDING 1 structurally), and no
`circ` hub / utility penalty / locality margin is needed to make it behave.
**Do this before any of it:** redo §21.4 by calling `RoomWalker.floodRooms()` / `partitionByDoors()` /
`doorAdjacent()` — the exported functions that already solve the door-opening problem — rather than
re-rasterising by hand. If the free-space grid from the walker's own pipeline routes >90% of pairs
with 0 through-wall violations, the skeleton is buildable on top of it and §21.5 becomes a real spec.
If it does not, the honest answer is that this building data cannot support a wall-aware router at all
and the graph stays, with §20.7's task 2 (make the reported distance the drawn distance) as the fix.

### §21.6 THE USER'S FORMULATION, TESTED — and it beats the shipped engine on every measured axis
User, 2026-07-31, verbatim: *"u got a common dense map that covers all doors, and its walkable area is
marked out … thus this walkable map simply return the shortest possible length between 2 doors."*

**The correction that made it work:** §21.4 built the field from WALLS (block + dilate) and sealed the
building shut. This builds it from WALKABLE AREA — the room pockets `RoomWalker` already compiled.
A compiled pocket **stops at a wall by construction** (it is the flood-fill of space the exterior
cannot reach), so the field is wall-aware without ever rasterising a wall; doors are the only
connectors between pockets. Room rects are taken RAW — **no `DOOR_BUFFER_SLACK` inflation**, which is
exactly what makes today's `_pointWalkable` blind to walls thinner than 0.4 m (§21.2).
Witness: `witness_room_path_freespace_map.js`, log `/tmp/w_roompath_freespace.log`.

```
§FREESPACE_MAP Clinic     storeys=3 cells=158130 walkableCells=93377 (59.1%) buildMs=4
§FREESPACE_MAP LTU_AHouse storeys=4 cells=935440 walkableCells=553780 (59.2%) buildMs=8
§FREESPACE_F3 Clinic     engineDrawn=9209m  freeSpaceMap=4394m  straight=3799m
              engine/freeSpace median=2.03x p90=3.53x | engineLonger=149 freeSpaceLonger=1 of 150
§FREESPACE_F3 LTU_AHouse engineDrawn=15755m freeSpaceMap=11350m straight=7711m
              engine/freeSpace median=1.54x p90=4.07x | engineLonger=127 freeSpaceLonger=19 of 150
§FREESPACE_DETOUR Clinic     vsStraight engine=2.42x  freeSpaceMap median=1.04x p90=1.44x
§FREESPACE_DETOUR LTU_AHouse vsStraight engine=2.04x  freeSpaceMap median=1.22x p90=2.18x
```
**The detour ratio §20 measured at 2.42× / 2.04× drops to 1.04× / 1.22×** — 1.04 is essentially the
optimal walk. The map is a **one-time 4-8 ms preprocess per building** (the user's own "stored as one
time process"), and a query costs 25-27 ms.

**F2 as written was an INVALID gate — control run first, conclusion corrected.** The test flags a
segment touching any `IfcWall` bbox, but a wall element's bbox spans its own door opening, so every
legitimate doorway crossing scores a hit. Control (`/tmp/viol_control.js`, same test, same pairs):
```
§VIOL_CONTROL Clinic     ENGINE drawn polyline: 1976 violations on 150/150 routes
§VIOL_CONTROL LTU_AHouse ENGINE drawn polyline: 1924 violations on 150/150 routes
   vs free-space map:        Clinic 547 / LTU 612
```
So it cannot say "0 violations". As a RELATIVE measure on identical inputs it is meaningful: the
free-space map touches walls **3.6× less (Clinic) and 3.1× less (LTU)** than the shipped engine.

**The one real cost, stated plainly:** coverage. `noRoute` = **37.0% (Clinic) / 14.8% (LTU)** vs the
engine, which routes those pairs — partly by walking through walls (§21.2), so some of that "coverage"
is not honest. But some is real: pockets that no door connects. **That is the next problem to solve,
and it is a DATA problem (missing/misassigned door→pocket adjacency), not a routing-formula problem.**

### §21.7 WHERE THIS LANDS — the formulation to build, and what it retires
| | shipped (2 layers) | free-space map (1 layer) |
|---|---|---|
| detour vs straight | 2.42× / 2.04× | **1.04× / 1.22×** |
| wall-touching (relative, same test) | 1976 / 1924 | **547 / 612** |
| reported distance vs drawn line | 3.20× over / 0.71× under | **identical by construction** |
| coverage | higher (some of it through walls) | 63% / 85% — the open gap |
| tuned constants needed | ~12 (`UTILITY_EDGE_PENALTY`, `DETOUR_LOCALITY_MARGIN`, 4 A* margins…) | `RES` only |
Retires structurally, not by tuning: §20.6 FINDING 1 (distance ≠ drawn length), FINDING 2 (utility
penalty), FINDING 3 (`circ` hub), §17's `DETOUR_LOCALITY_MARGIN`/`§DETOUR-NO-REVISIT` machinery, and
the R1/R2/R3 revisit classes — a grid A* cannot revisit a cell, so double-backs are impossible by
construction rather than guarded against.

**Next task, spec-first before any engine change:** close the coverage gap. Measure WHY the 37%/14.8%
fail — per unroutable pair, is either endpoint's pocket door-isolated (no door footprint touching it),
or are two pockets adjacent with a door that the per-storey z-assignment put on the wrong storey?
`RoomWalker.doorAdjacent()` already answers the first. **Do not tune `RES` or add slack to paper over
this** — reintroducing inflation is precisely what made the shipped predicate wall-blind.

### §21.8 THE 2-STAGE DECOMPOSITION, MEASURED (user, 2026-07-31: *"1. Get the walkable door to door
### map of the whole building. 2. Placing the dots along the shortest path on door selection.
### 2.1 connect all the dots"*) — structure CONFIRMED, one lossy step found and named
Witness `witness_room_path_doormap.js`, log `/tmp/w_roompath_doormap.log`.
Stage 1 stores a **door-adjacency graph** (doors sharing a pocket; edge weight = the MEASURED
in-pocket walk from §21.6's free-space field), deliberately NOT an all-pairs table.
```
§DOORMAP_STAGE1 Clinic     doors=252 pockets=208 edges=584  orphanDoors=16 buildMs=54
                           (all-pairs table would be 31,626 entries)
§DOORMAP_STAGE1 LTU_AHouse doors=606 pockets=425 edges=2602 orphanDoors=92 buildMs=362
                           (all-pairs table would be 183,315 entries)
§DOORMAP_STAGE2 Clinic     pairs=110 doorGraph=2351m directGridAstar=1902m ratio median=1.206x
                           within5pct=23/110 avgQueryMs=0.7
§DOORMAP_STAGE2 LTU_AHouse pairs=76  doorGraph=3178m directGridAstar=2834m ratio median=1.114x
                           within5pct=13/76  avgQueryMs=1.3
```
**Stage 1 works and is cheap: 54 ms / 362 ms one-time, 54×/70× smaller than all-pairs.**
**Stage 2 queries in 0.7 ms / 1.3 ms — 20-35× faster than the 25-27 ms full grid A* of §21.6.**
So the user's "one time process … merely querying the shortest distance" is confirmed on both counts.

**But stage 2.1 as literally specified is LOSSY: 1.206× / 1.114× longer than the true grid path,
within 5% on only 23/110 and 13/76 pairs.** The cause is structural and well known: connecting DOOR
CENTRES forces every traversal through a point, while the real walk clips the doorway at an angle. A
door is an **aperture (a segment), not a dot**. The standard correction is a funnel / string-pull
across the portal openings — keep each door's measured width as the portal, pull the string through
the sequence. That IS "2.1 connect all the dots", done against apertures instead of points, and it is
what should recover the §21.6 grid-optimal 1.04× while keeping the 0.7 ms query.

**Also surfaced by stage 1, and it is the same gap as §21.6's coverage:** `orphanDoors` = **16 (Clinic)
/ 92 (LTU)** — real doors that touch no compiled pocket, so they carry no edge at all. That is the
door→pocket adjacency data problem already named in §21.6, now with a direct count to fix against.

**Revised task list (supersedes §21.7's single "next task"), spec-first, in order:**
1. **Funnel across door apertures** in stage 2.1, then re-run this witness — target: median ratio
   ≤1.05× against the direct grid A*, query time still ~1 ms.
2. **Close the orphan-door / coverage gap** (16 · 92 doors; 37% · 14.8% unroutable pairs). Data, not
   formula — `RoomWalker.doorAdjacent()` answers half of it. **Do not add rect slack to paper over it.**
3. Only then propose replacing the shipped two-layer router, with §20's R1-R6 as the before/after.

### §21.9 "CAN WE NOW SAY NO PATH EVER CUTS THROUGH EMPTY SPACE?" (user, 2026-07-31) — measured. NO,
### not today; and the user's subdivide-until-inside idea is ALREADY the string-pull guard.
**Status check first, because the question assumed deployment: NOTHING IN §20/§21 IS LIVE.** All of it
sits on `bim-ootb` branch `review/roompath-redundancy` + this spec file. The shipped viewer engine is
byte-unchanged; no OCI upload, no GH Pages deploy. These are measurement witnesses and a prototype.

Direct test (`/tmp/offmap_check.js`): sample every produced polyline at **0.05 m** and count samples
the walkable map itself calls not-free. Same test applied to the SHIPPED engine's drawn line, as the
control — 120 routes per building.
```
§OFFMAP Clinic     prototype (grid A* + string-pull): 36/73204 samples off-map (0.05%) 32/120 routes
                   SHIPPED engine drawn polyline:  15404/139438 samples off-map (11.05%) 91/120 routes
§OFFMAP LTU_AHouse prototype (grid A* + string-pull): 38/197090 samples off-map (0.02%) 32/120 routes
                   SHIPPED engine drawn polyline:  21820/265385 samples off-map (8.22%)  109/120 routes
```
**Today, live: 11.05% / 8.22% of the drawn line is outside walkable space, on 76% / 91% of routes.**
That is the honest answer to the question as asked.
**Prototype: 0.05% / 0.02% — a 200× / 400× reduction — but NOT zero.**

**On the user's proposed helper** (*"keep placing dots … until it is entirely within the walkable
map"*): it is worth separating two things the shipped engine conflates.
- As **post-hoc repair of an arbitrary chord**, this is exactly what `_legalizePath` +
  `_detourForChord` already do — and §20 measured the cost: it is the mechanism behind the 83-91%
  double-backs. Repairing a chord chosen by a different cost function can only add wiggle.
- As a **validation on string-pull simplification**, it is exactly right and it is already implemented
  — `_simplifyLOS` in the shipped engine, and `simplify()`/`clear()` in the prototype, both test the
  collapsed run against the map at sub-cell resolution and keep more points when it fails. **That
  guard is what buys the 200× above.** So: already resolved, and the user's instinct matches the
  mechanism that is doing the work.

**Why it still is not zero — named, so nobody assumes the guard is broken.** 36 and 38 bad samples
spread over 32 routes each ≈ **one sample per affected route**, i.e. boundary residue, not a wandering
line. Two identified causes, neither fixed by more dots:
1. **Endpoint snap.** A* snaps start/goal up to 1.5 m onto a free cell, but the REPORTED polyline
   still begins at the room centre, which can sit marginally outside its own inscribed rect.
2. **Half-cell rounding.** The guard tests at `RES/2` while the audit samples at 0.05 m, so a sample
   can land in a cell the guard never tested.
**Fix for a true zero, when this is built for real:** clamp the reported endpoints to the snapped free
cell (do not report a point the map rejects), and test the guard at the SAME resolution the audit
uses. Both are exactness changes, not new heuristics — and neither is more subdivision.

**Do not restate "no path cuts through empty space" as a property of the product until (a) the
prototype is actually shipped and (b) this witness reads 0/0 on both buildings.**

### §21.10 LOOP-CUT / "arrow ahead, trail of dots behind" (user, 2026-07-31) — the technique is right,
### and in this formulation the redundancy it targets CANNOT OCCUR. Measured.
User: *"if an arrow passes a stored dot, then it merely delete where it has been going to pick up that
dot"* … *"thus it is always an arrow ahead between two dots, leaving the trail of recorded dots behind.
As long that arrow does not cut thru space we are good."*

That is **loop-cutting / path shortcutting**, and the second sentence is a verbatim statement of the
**string-pull invariant** the prototype already runs: hold a current anchor, cast the arrow to the
FURTHEST dot the map says is reachable in a straight run, commit that dot, repeat. The greedy maximal
form subsumes the pairwise "passes a stored dot" version.

Measured with §20.2's own R2/R3 definitions (`/tmp/loopcut.js`, 120 routes per building):
```
§LOOPCUT Clinic     prototype BEFORE string-pull (raw A* cells): R2=0  R3=0
                    prototype AFTER  string-pull:                R2=0  R3=0   routesAffected=0/120
                    SHIPPED engine drawn polyline:               R2=48 R3=136 (489.4m in reversals) 77/120
§LOOPCUT LTU_AHouse prototype BEFORE string-pull (raw A* cells): R2=0  R3=0
                    prototype AFTER  string-pull:                R2=0  R3=0   routesAffected=0/120
                    SHIPPED engine drawn polyline:               R2=26 R3=192 (993.2m in reversals) 103/120
```
**The decisive detail: R2=R3=0 BEFORE string-pull, not just after.** A* with a closed set cannot
re-expand a cell, so a loop or a >150° reversal is not something to clean up — it is **unconstructable**.
So loop-cutting is a REPAIR for a router that can emit loops; this formulation never emits one. The
string-pull is therefore doing length and turn-count reduction, not loop removal.
Contrast with the shipped engine on the identical pairs: **77/120 and 103/120 routes carry a reversal**,
489 m and 993 m of walk inside those reversals. That is the §20 redundancy, seen at route level.

**The one caveat on "as long that arrow does not cut thru space we are good":** correct, and it is
exactly the guard — but §21.9 measured it landing at 0.05% / 0.02% off-map rather than 0, because the
guard tests at `RES/2` while the audit samples at 0.05 m, and the reported endpoint is the room centre
rather than the snapped free cell. **The invariant is only as strong as the resolution you test it at.**
Fixing that is exactness, not more dots (§21.9's two named fixes).

### §21.11 WHERE THIS LANE STANDS (2026-07-31) — nothing live, three things proven, order of work
**LIVE STATUS: nothing from §20 or §21 is deployed.** `bim-ootb` branch `review/roompath-redundancy`
(6 witnesses) + this spec file. Viewer engine byte-unchanged. Do not describe any of this as shipped.
**Proven, on Clinic + LTU_AHouse + Duplex, all measured:**
1. The redundancy is real and large — 83.2%/91.3% of routes double back; drawn line +146%/+112%.
2. Its cause is structural, not tuning — two layers with different objectives, and a geometry layer
   with **no wall model** (`chordIllegalCount=0` across 2 real walls with no door).
3. A one-layer wall-aware formulation, built from the walker's own compiled pockets, measures
   **1.04×/1.22× detour** (vs 2.42×/2.04×), **0.05%/0.02% off-map** (vs 11.05%/8.22%), **R2=R3=0**
   (vs 77/120 and 103/120 routes with reversals), map built in 54/362 ms, queries at 0.7/1.3 ms.
**Open, in order — each spec-first, none started:**
1. Funnel across door apertures (§21.8: door-centre hops cost 1.206×/1.114×).
2. Endpoint/resolution exactness so §21.9 reads 0/0 (§21.9's two named fixes).
3. Coverage: 37%/14.8% unroutable pairs, orphanDoors 16/92 — door→pocket adjacency DATA, not formula.
   **Never by re-adding rect slack** — that is what made the shipped predicate wall-blind.
4. Only then a shipping proposal, with §20's R1-R6 as the before/after gate.

### §21.12 THE PRIOR ART — this is a solved problem; use the named algorithm, do not re-derive one
User, 2026-07-31: *"is there already a maths/algorithm to find a shortest link between 2 dots in a
mapped area?"* Yes. Recorded here so §21.11's task 1 is implemented from the literature, not invented
(this project's Prime Rule applies to algorithms too: extract, don't invent).

**Exact optimum in a polygonal map.** The shortest path bends ONLY at obstacle corners — a theorem,
not a heuristic. Two exact constructions:
- **Visibility graph** — Lozano-Pérez & Wesley, *CACM* 1979. Nodes = obstacle corners, edge iff
  mutually visible, then Dijkstra. O(n²) build. NOTE: `_detourForChord` in the shipped engine is a
  degenerate visibility graph whose node set is door waypoints instead of corners — that is why its
  results are legal but not optimal.
- **Continuous Dijkstra / Shortest Path Map** — Mitchell, Mount & Papadimitriou 1987;
  Hershberger & Suri 1999 at O(n log n) build, O(log n) query. Precomputes a subdivision of the plane
  in which every region shares one combinatorial path structure. **This is the rigorous form of the
  user's own "one time process … merely querying" proposal (§21.1/§21.8).**

**Practical standard, and it maps 1:1 onto the user's 2-stage decomposition:** a **navigation mesh** —
convex decomposition of walkable area, A* over cell adjacency, then the **funnel algorithm**
(Lee & Preparata, *Networks* 1984, "shortest paths in a simple polygon"; the "simple stupid funnel"
variant is the common implementation) to pull the taut string through the shared portal edges. Linear
time, and EXACT for a given cell sequence.
**Our pockets-and-doors map IS a navmesh**: compiled room pockets are the cells, doors are the portals.
So §21.8's 1.206× / 1.114× door-centre penalty is not a new problem needing a new idea — it is the
textbook symptom of treating a portal as a POINT, and the funnel is its named, exact fix.

**A caveat on §21.6's measured 1.04× / 1.22× detour, in our favour:** 8-connected grid A* is optimal
ON THE GRID, but quantises direction to 45° increments — a known digitisation bias up to ~8%, ~4% on
near-straight runs. A good part of the residual 4% is therefore grid artifact, not real detour, and
the true optimum is closer to 1.0 than measured. **Theta\*** (any-angle grid search, Nash et al. 2007)
or the funnel removes it. So implementing the funnel earns twice: it kills the door-centre penalty AND
the quantisation bias, and it makes §21.6's number honest.

**Consequence for §21.11 task 1 — build the funnel, and measure against the visibility-graph exact
answer on a small sample as the correctness oracle** (a slow exact method is a legitimate witness
baseline even if it could never ship). Do not hand-roll a shortening heuristic.

### §21.13 THE "ARROW" ↔ FUNNEL CORRESPONDENCE — for whoever implements §21.11 task 1
The user's arrow conjecture (§21.10) and Lee & Preparata's funnel (§21.12) are the SAME procedure,
reached from opposite directions. Recording the mapping so the implementer can read either language:

| user's terms | funnel algorithm |
|---|---|
| the last committed dot / "trail behind" | **apex** |
| the arrow cast ahead | the **funnel wedge** — two feelers, not one ray, narrowing per portal |
| "arrow passes a stored dot → delete where it has been" | apex advance: next portal endpoint falls OUTSIDE the wedge → apex jumps there, everything between is discarded |
| "as long that arrow does not cut thru space we are good" | guaranteed by construction — the wedge is bounded BY the portal edges |

**The one refinement the formal version adds, and it is exactly §21.8's finding from the other side:**
the arrow is cast between **portal EDGES (segments)**, never between points or grid cells. That is what
makes it exact and O(n) instead of sampled-and-verified — and it is the same statement as "a door is an
aperture, not a dot". Implement it over the door apertures already produced by §21.8's stage-1 map;
do not re-sample the raster inside the funnel.

### §21.14 START HERE — handoff for the implementation session (written 2026-07-31, measurement session)
Read §21.11 (status + task order), §21.12 (the algorithm + citation), §21.13 (arrow↔funnel mapping).
Everything below is verified, not assumed — re-verify anything you are about to depend on.

**Setup.**
```
cd ~/bim-ootb && git worktree list        # reuse an existing wt-* for this branch before adding one
GIT_LFS_SKIP_SMUDGE=1 git worktree add /tmp/wt-roompath review/roompath-redundancy
```
`GIT_LFS_SKIP_SMUDGE=1` is required — mesh/geo LFS blobs are not needed here and pulling them burns
quota (CLAUDE.md §Worktree Hygiene). ⚠ **A /tmp worktree can be removed by another session mid-run**
(happened 2026-07-31). Everything is pushed; recreate and continue, don't re-derive.

**Engine baseline: `origin/main`, NOT the shared `~/bim-ootb` checkout** — it was 119 commits behind on
2026-07-30 and its `common/room_graph.js` genuinely differs (no §DOOR-THRESHOLD-WALKABLE, no
§STAIR-FOOTPRINT-WALKABLE, no §DETOUR-NO-REVISIT). Measuring there reports fixed defects as live.

**Fixtures** (`~/bim-ootb/buildings/`, never OCI, never the bim-compiler copy):
`Clinic_extracted.db` 118 spaces/254 doors · `LTU_AHouse_extracted.db` 369/606 — the user's reported
criss-crossing building · `Duplex_extracted.db` 5/14. All three are the RECT-FALLBACK regime (no
`storey_walkable_raster`, no `patches/*.sql`). ⚠ `bim-compiler/deploy/dev/buildings/LTU_AHouse_extracted.db`
(440 MB) has NO `spatial_structure` table — it cannot be the rooms source; and that folder's
`Clinic_extracted.db` is a 0-byte file.

**Regime fidelity is mandatory (§20.1)** — all three carry only `RM_` rooms with no `rooms_meta`, so
the browser recompiles via `RoomWalker.walk()` on every load. **Any witness MUST run
`RoomWalker.walk(db,{write:true})` before `buildGraph`**, or it measures a room set the browser never
routes ([[feedback_witness_headless_regime_gap]]).

**Witnesses already on the branch** (all building-parameterised, all measure-only):
`witness_room_path_redundancy.js` (R1-R6 sweep — **the before/after gate**) ·
`witness_room_path_redundancy_attrib.js` (R7-R9 + penalty A/B) · `probe_redundancy_route.js`
(single-route dump) · `witness_room_path_graphless_astar.js` · `witness_room_path_wallaware_astar.js`
(FAILED, kept as a record) · `witness_room_path_freespace_map.js` (the free-space map) ·
`witness_room_path_doormap.js` (stage 1+2). Logs: `/tmp/w_roompath_*.log`.

**The task: funnel across door apertures (§21.11 task 1).**
- Implement Lee & Preparata over the door apertures stage 1 already produces. Do NOT re-sample the
  raster inside the funnel, and do NOT hand-roll a shortening heuristic (§21.12).
- **Correctness oracle:** a visibility graph on a small sample — too slow to ship, valid as a witness
  baseline. Assert funnel length == oracle length within float tolerance.
- **Falsification test, write it BEFORE the code:** the funnel must LOWER §21.6's measured
  1.04×/1.22× detour, because it removes the 45° grid-quantisation bias as well as the door-centre
  penalty. **If the number does not move, the MAP is wrong, not the funnel.**
- Re-run `witness_room_path_doormap.js` — target: median ratio ≤1.05× vs direct grid A*, query ~1 ms.
- Nothing here authorises touching `common/room_graph.js` or `viewer/navigate_find.js`. Shipping is
  §21.11 task 4, gated on §20's R1-R6.

### §21.15 FUNNEL ATTEMPT 1 — FAILED ALL THREE FALSIFICATION TESTS (2026-07-31). Not tuned away.
`witness_room_path_funnel.js`, log `/tmp/w_roompath_funnel.log`. The tests in §21.11 task 1 were
written before the code, per §21.14, and all three fired:
```
§FUNNEL_RATIO Clinic     vs reference — doorCentres median=1.213x | FUNNEL median=1.270x  (WORSE)
§FUNNEL_RATIO LTU_AHouse vs reference — doorCentres median=1.131x | FUNNEL median=1.185x  (WORSE)
§FUNNEL_T1 Clinic funnelLongerThanCentres=100/110   LTU 73/76
§FUNNEL_T3 Clinic offMap funnel=4.09% vs reference 0.04%   LTU funnel=11.34% vs reference 0.03%
  ❌ T1  ❌ T2  ❌ T3
```
**The funnel made it worse and pushed the line off the floor.** T1 was written precisely to catch this
class of error, and it did its job on the first run.

**Unit tests on synthetic channels with known answers (`/tmp/funnel_diag.js`):**
```
A1 straight corridor, 3 portals  len=6.000 (expect 6.000) → straight line. PASSES.
A2 same corridor, left/right SWAPPED  len=6.000 → ALSO passes. A1 cannot clear the orientation logic.
A3 L-bend requiring a real corner  len=11.147 (straight 7.211)
   pts=[(0,0),(1,2),(3,0),(4,6)]  ← ZIGZAGS left, then right, then up. A taut path would not.
```
**Two candidate causes remain OPEN. Do not pick one without the discriminating test below.**
- **(A) the left/right portal orientation is wrong.** A1 does not clear it — A2 proves a straight
  corridor passes either way. A3's zigzag is consistent with this.
- **(B) the channel is invalid, so the funnel's precondition is unmet.** The funnel is exact only over
  a sequence of portals that are shared edges of **CONVEX** cells. Our portals are door apertures and
  our cells are compiled pockets — and a pocket is a UNION of rects (§MULTI-RECT: Clinic 304 rects /
  207 rooms, LTU 529 / 422), so corridor and L-shaped pockets are **not convex**. Cutting a taut line
  across a non-convex pocket leaves the floor — which is exactly what T3 measured (0.04% → 4.09%).
  A3's zigzag is equally consistent with a hand-built channel whose two portals share no convex cell.

**The discriminating test, cheap, do this FIRST next session:** re-run
`witness_room_path_funnel.js` restricted to pairs whose entire door sequence passes only through
**single-rect (convex) rooms**. If T1/T3 pass on that subset, the cause is (B) and the missing step is
**convex decomposition of each pocket** — the navmesh construction step this lane skipped, after which
doors are merely a SUBSET of the portals (every shared edge between adjacent convex cells is one).
If T1/T3 still fail on convex-only pairs, the cause is (A) and the orientation logic is the bug.

**Correction to §21.12, made honestly:** that section said part of §21.6's measured 1.04×/1.22× is 45°
grid-quantisation bias that the funnel would remove. That claim is now doubtful — §21.6's reference
ALREADY applies string-pull, which collapses staircase artifacts into straight runs, so most of the
bias is likely gone before the funnel is reached. **Treat the "funnel earns twice" expectation in
§21.12 as unproven.** The reference remains the number to beat: 1.04× / 1.22×.

**Status unchanged: nothing deployed, engine byte-unchanged.** §21.11's task order stands; task 1 is
now "run the convex-subset discriminator, then fix whichever cause it names".

### §21.16 DISCRIMINATOR RUN — cause (B) RULED OUT as the primary fault; cause (A) CONFIRMED
`CONVEX_ONLY=1 node witness_room_path_funnel.js` — restricted to pairs whose entire door sequence
touches only SINGLE-RECT (convex) pockets, which is the funnel's actual precondition.
```
§FUNNEL_MODE Clinic     CONVEX_ONLY=1 convexPockets=145/208 skippedNonConvex=95
§FUNNEL_T1   Clinic     funnelLongerThanCentres=11/15     ← STILL FAILS
§FUNNEL_T3   Clinic     offMap funnel=1.87% (was 4.09%)   reference=0.00%
§FUNNEL_MODE LTU_AHouse CONVEX_ONLY=1 convexPockets=353/425 skippedNonConvex=58
§FUNNEL_T1   LTU_AHouse funnelLongerThanCentres=17/18     ← STILL FAILS
§FUNNEL_T3   LTU_AHouse offMap funnel=0.51% (was 11.34%)  reference=0.11%
  ❌ T1  ❌ T2  ❌ T3
```
**Verdict, and it contradicts the hypothesis §21.15 leaned toward:**
- **(B) non-convex pocketsは NOT the primary fault.** On convex-only pairs T1 still fails 11/15 and
  17/18. Convexity was never the reason the funnel is LONGER than joining centres.
- **(B) IS real for T3 though** — off-map fell 4.09%→1.87% (Clinic) and 11.34%→0.51% (LTU) when
  non-convex pockets were excluded. So non-convexity does cause the taut line to leave the floor; it
  just is not what makes the path long. **Both facts are true and they are separate.**
- **(A) portal orientation is CONFIRMED as the fault.** A funnel that is systematically LONGER than the
  naive centre-joining, on a valid convex channel, is the textbook signature of inconsistent left/right
  assignment.

**Root cause, named for the fix:** `aperture()` orients each portal INDEPENDENTLY, from a local
direction estimate (`nextCentre − prevCentre`). The funnel does not need each portal locally correct —
it needs the whole channel **consistently wound**. Any portal whose local estimate flips (near-collinear
doors, a door whose bbox long axis is perpendicular to travel, a U-turn in the sequence) breaks the
invariant and the funnel then tightens against the wrong feeler.
**Fix for attempt 2:** build the portal list, then enforce winding consistency ACROSS the sequence —
for each consecutive pair, test the sign of `tri2(prevL, prevR, curL)` (and its mate) and swap the
current portal's endpoints when the sign disagrees, rather than trusting a per-portal heuristic. Then
re-run BOTH modes: full and `CONVEX_ONLY=1`. T1 must pass on the convex subset FIRST — that is the
clean-precondition case — before any conclusion is drawn from the full set.
**Then, and separately, (B):** convex decomposition of multi-rect pockets is still required for T3 to
reach the reference's 0.00%/0.11%. It is a second task, not a prerequisite for T1/T2.

**Still nothing deployed; engine byte-unchanged.** Witness carries the `CONVEX_ONLY` env switch now.

### §21.17 SESSION CLOSE (2026-07-31) — everything a future session needs is committed, not in /tmp
The seven one-off probes this file cites (`wall_model_check.js`, `util_breakdown.js`,
`ratio_buckets.js`, `viol_control.js`, `offmap_check.js`, `loopcut.js`, `funnel_diag.js`) were written
as `/tmp/*.js` scratch and **are now committed to `roompath_diagnostics/` on the branch**, with a
README mapping each to the question it answers and the § that cites it. Any `/tmp/...` path in §20-§21.16
should be read as `roompath_diagnostics/...`. ⚠ The `/tmp/wt-roompath` worktree was removed by another
session TWICE mid-run — assume it is gone and recreate per §21.14; nothing lives only in /tmp any more.

**Read before funnel attempt 2:** `roompath_diagnostics/funnel_diag.js` test A2 — a straight corridor
passes with left/right deliberately SWAPPED. It proves nothing about orientation on its own, and
mistaking it for a green light is how attempt 1 reached a full sweep with a broken portal winding.

### §21.18 FUNNEL ATTEMPT 2 — root cause found and fixed (a CONVENTION INVERSION). Large improvement,
### all three thresholds still fail. Residuals named, not tuned away.
`roompath_diagnostics/funnel_unit.js` — hand-computed expected answers over a **valid** channel: three
convex cells `A=[0,2]×[0,2]`, `B=[2,4]×[0,2]`, `C=[2,4]×[2,4]` forming an L with a reflex corner at
(2,2). (§21.15's A3 was a hand-built channel whose consecutive portals shared no convex cell, so it
could not separate an algorithm bug from bad input. These can.)
```
B1 true-LEFT assigned to l, CONSISTENTLY   len=5.1167  expect=3.7025   ❌
B2 one portal flipped                      len=5.1167  expect=3.7025   ❌
B3 true-RIGHT assigned to l                len=3.7025  expect=3.7025   ✅
B4 straight corridor                       len=6.0000  expect=6.0000   ✅
```
**The funnel code was correct all along.** The SSF formulation's `l`/`r` are defined in a CLOCKWISE
frame, so its "left" is the vertex geometrically **right** of travel in a standard y-up/CCW frame.
`aperture()` had the convention inverted — a one-line fix. Note B1 was *consistently* wound and still
failed, so "enforce winding across the channel" (§21.16's proposed fix) was **not** the actual cause;
§21.16's own discriminator had already ruled out convexity. Both prior hypotheses were wrong; the unit
test found it.

**Measured after the fix** (full set, and `CONVEX_ONLY=1` in brackets):
| test | Clinic before → after | LTU before → after |
|---|---|---|
| T1 funnel longer than centres | 100/110 → **7/110** [2/15] | 73/76 → **1/76** [0/18] |
| T2 median vs reference | 1.270× → **1.169×** (centres 1.213×) | 1.185× → **1.088×** (centres 1.131×) |
| T3 off-map | 4.09% → 3.63% [2.23%] | 11.34% → **4.55%** [0.27%] |
The funnel now BEATS centre-joining instead of losing to it, which is the qualitative flip T1 exists
to detect. **But T1, T2 and T3 all still fail their thresholds. Attempt 2 is progress, not a fix.**

**Three residuals, each with a hypothesis and a discriminating test — none of them "tune a constant":**
1. **T1 residual (7/110, 1/76).** `aperture()` still derives travel direction per-portal from
   `nextCentre − prevCentre`. That estimate degenerates on a U-turn or near-collinear door triple, and
   a single flipped portal is enough (B2 proves one flip ruins the result). **Test:** log the pairs
   that fail T1 and check whether their door sequence contains a >90° turn at the flagged portal.
   THIS is where §21.16's "enforce winding across the channel" belongs — as the residual fix, not the
   primary one.
2. **T3 (3.63%/4.55%, and 2.23% even on convex-only).** Non-convexity is a large contributor —
   confirmed twice now (11.34%→0.27% on LTU convex-only). But Clinic still leaks 2.23% on single-rect
   pockets, so there is a second cause. **Leading hypothesis:** door boxes are inflated by `RES` to
   punch the opening through, so an aperture endpoint can sit INSIDE the wall; a taut line hugging
   that endpoint is then off-floor by construction. **Test:** clamp aperture endpoints to the
   intersection of the door box with the two pockets it joins, and re-measure T3.
3. **T2 (1.169×/1.088× vs ≤1.05×).** The funnel is exact *within a channel* — but the channel is
   chosen by stage-2 Dijkstra over **centre-to-centre** edge weights, so a suboptimal door sequence
   caps how good the funnelled path can be. **Test:** re-weight the door graph by funnelled (not
   centre) in-pocket length and re-run; if T2 closes, the channel choice was the cap.

**Status: nothing deployed, engine byte-unchanged.** The reference to beat is unchanged: §21.6's
free-space map at **1.04× / 1.22×**. Order for attempt 3: residual 2 (T3, cheapest and the only one
that is a correctness issue rather than a quality one), then 1, then 3.

### §21.19 BUDGET CHECK — how much of the gap CAN the door-aperture effect explain? (2026-07-31)
Prompted by the user asking whether the door-spot distinction is significant at all. It is a fair
challenge and it should have been the FIRST thing measured — §21.11 ranked the funnel as task 1 because
it had a named algorithm attached, not because anything showed it was the dominant term.
```
§FUNNEL_BUDGET Clinic     avgDoorsPerRoute=4.0 maxDoors=9 | GAP centres-vs-reference=427m
   MOST the door-spot effect could explain=233m (54% of the gap)  actually closed by funnel=84m (20%)
§FUNNEL_BUDGET LTU_AHouse avgDoorsPerRoute=4.0 maxDoors=8 | GAP centres-vs-reference=332m
   MOST the door-spot effect could explain=204m (61% of the gap)  actually closed by funnel=93m (28%)
```
Ceiling computed as Σ(half the door's own measured width) over each route's door sequence — the most
you could ever save by clipping an edge instead of the centre.

**Three facts, and they revise the plan:**
1. **The aperture effect IS material — ~54-61% of the gap** (4 doors per route, not the 1-2 a quick
   mental estimate assumes). A same-session verbal claim that it "cannot account for the gap" was
   wrong arithmetic and is corrected here.
2. **The funnel is collecting only 20-28% of the total gap — under half of the ~57% available to it.**
   So there is real headroom INSIDE the funnel, consistent with §21.18 residual 2 (aperture endpoints
   inflated by `RES` sit inside the wall, so the string bends around a peg in the brickwork).
3. **~40-46% of the gap is NOT the aperture at all.** That is §21.18 residual 3 — the door SEQUENCE is
   chosen by Dijkstra over centre-to-centre weights. **This is the same structural error as the shipped
   engine** (§21.2): choose the route with one measure, draw it with another. It is not a smaller
   version of the funnel problem, it is the original problem again one level down.

**Revised priority for attempt 3 — two roughly equal prizes, do the cheap correctness one first:**
- **(a)** clamp aperture endpoints to the real opening (residual 2). Cheap, fixes a genuine off-floor
  defect, and unlocks the rest of the ~57% the funnel should already be collecting.
- **(b)** re-weight the door graph by the FUNNELLED in-pocket length rather than centre-to-centre
  (residual 3), then re-run. This is the larger structural fix and the one the user's own instinct
  pointed at ("shouldn't the dot be in front of the door?" — i.e. the approach, not the spot).
- Residual 1 (7/110 orientation flips) stays last: smallest term, and (a) may move it anyway.

### §21.21 THE DOOR→POCKET LINK IS A PROXIMITY GUESS, AND THERE IS NO GOOD THRESHOLD (2026-07-31)
Found by dumping real door sequences (`roompath_diagnostics/door_seq_dump.js`) after the user asked
whether routes really cross more than 2 doors. The dump answered that (Clinic: 1 door ×15, 2 ×23,
3 ×15, 4 ×14, 5 ×13, 6 ×11, 7 ×11, 8 ×7, 9 ×1 — 2 is the modal case, but 65% cross 3+, mean 4.0) and
exposed something worse: **every door in the dump claimed to join THREE pockets.** A door joins two.
```
§DOORADJ Clinic tol=0.4m  0 rooms ×14  1 ×52  2 ×97  3 ×85  4 ×6  → joins>2: 91/254 (36%)
§DOORADJ Clinic tol=0.2m  0 ×21  1 ×73  2 ×98  3 ×59  4 ×3       → joins>2: 62/254 (24%)
§DOORADJ Clinic tol=0.0m  0 ×102 1 ×150 2 ×2                     → joins>2: 0/254  (0%)
§DOORADJ LTU   tol=0.4m  → joins>2: 75/606 (12%)   tol=0.0m → only 11/606 join 2 rooms
```
**No threshold works.** At 0 m only 2 of 254 Clinic doors connect two pockets — the graph is empty. At
0.4 m a third of doors claim 3-4 pockets — every extra claim is a SHORTCUT the router can take through
a door that does not open into that room.
**Cause:** the walker's room rects are INSCRIBED inside the flood-filled pocket, so they stop short of
the walls; a door sits IN the wall. At zero tolerance it touches nothing; widen it and it touches
whatever rect is nearby, including rooms on the same side of the wall.
**This is upstream of everything in §21.18/§21.19.** A door sequence cannot be chosen sensibly from a
connectivity map that is wrong a third of the time, and it plausibly also explains the coverage gap
(37%/14.8% unroutable, orphanDoors 16/92 — those are the doors that linked to nothing).
**Fix — do NOT tune the tolerance.** `RoomWalker` already computes the true relation: it PARTITIONS
pockets by doors during the flood fill (§DOOR-PARTITION) and exposes `doorAdjacent()`. This lane
reconstructed that relation by measuring distances instead of asking for it. Same error class as the
shipped engine: a proximity heuristic substituted for a fact that is already computed.

### §21.22 THE MAP HAS NO CORRIDOR/ROOM DISTINCTION — and the prototype threw away something the
### shipped engine got right (user question, 2026-07-31: "does it include also inner rooms?")
Yes — every compiled pocket is equally walkable, with no notion of circulation vs occupied space.
```
§INNER Clinic pockets=208 medianArea=10.2m² medianAspect=1.37 medianLongestSide=3.7m
              corridorLike(aspect>=3 or side>=8m)=36/208 (17%)   largest: 166,146,111,104,76,63 m²
§INNER LTU    pockets=425 medianArea=13.1m² medianAspect=1.41 medianLongestSide=4.4m
              corridorLike=135/425 (32%)                        largest: 1255,935,866,865,832,816 m²
```
The typical pocket is a compact ~3.7 m room, not a corridor; only 17% (Clinic) are corridor-shaped.
With ~3 intermediate pockets per route, **routes thread through INNER ROOMS rather than running along
corridors.** Three consequences, in order of importance:
1. **Implausible routes.** You do not reach a clinic room by walking through three other rooms. The
   geometry can be optimal and the route still wrong.
2. **Some of it is probably invented** — §21.21's false door adjacencies create phantom room↔room
   links that a router will use as shortcuts. Re-measure this AFTER §21.21 is fixed before concluding
   the layout is genuinely enfilade.
3. **Wrong shape for the lane that started this.** Cable trays run in corridors and ceiling voids, not
   through offices (`datacentre_cabling.md`). A cabling substrate built on room-threading routes
   inherits a wrong answer.

**Conclusion — and it is a correction to this lane's own direction, not a new idea:** the answer is NOT
to drop rooms (a route starts and ends in one). It is **rooms as endpoints, corridors as the
through-route** — the user's original "main most dense walkway" framing (§21.1), now supported by
measurement. **The shipped engine ALREADY has this**: `hallway_backbone.js`, corridor labels, `spine`
nodes, §CORRIDOR-ROOM-BACKPROP. §21.6's free-space prototype discarded all of it and treated every
pocket as equal. So: **keep the walkable map for GEOMETRY, restore the corridor/room distinction for
TOPOLOGY.** This lane proved the geometry layer needed rebuilding, then rebuilt it while throwing away
something the old engine had right.

**Revised order (supersedes §21.19's):**
1. **§21.21** — real door↔pocket adjacency from `RoomWalker.doorAdjacent()`/§DOOR-PARTITION, not
   proximity. Upstream of everything; re-run §21.19's budget after it.
2. **§21.22** — restore corridor/room topology on top of the walkable map.
3. Only then revisit the funnel residuals (§21.18) — they are a quality term on a map that is
   currently wrong.

### §21.23 TWO-LAYER MAP (corridor spine + room leaves) — the user's design, feasibility MEASURED but
### the measurement is BUILT ON §21.21's DEFECT. Read the caveat before acting on the numbers.
User, 2026-07-31: *"a 2 layer mapping … the common corridor that stops at first doors and not bother
rooms whether there are connecting rooms in them … then an inner room has to route nearest to that
corridor map."*

**Why the design is right, beyond plausibility:** it DISSOLVES §21.21. Today a door must answer "which
two ROOMS do I join?" — ambiguous against small inscribed rects, wrong 36% of the time, with no valid
threshold. In the two-layer design a door answers "which CORRIDOR do I open onto?" — one big
unambiguous target. That question is robust where the other never can be.
```
§SPINE Clinic  Q1 corridorLike=38/208  components=18  largest=8 (21%)  sizes=8,7,3,3,2,2,2,1
               Q2 rooms with a door onto a corridor = 105/170 (62%)
               Q3 doors joining 2+ rooms with NO corridor = 67/254 (26%)
§SPINE LTU     Q1 corridorLike=135/425 components=33  largest=37 (27%) sizes=37,16,15,8,8,5,4,4
               Q2 205/290 (71%)      Q3 32/606 (5%)
```
**⚠ DO NOT read Q1 as "the design fails."** Both inputs to it are built on the broken foundation:
corridors were identified by a crude SHAPE rule (aspect≥3 / side≥8m / area≥4×median) invented here,
and "do two corridors join?" was tested by rect-touch within 0.5m — and rects are INSCRIBED, so two
halves of one real corridor separated by a door opening read as NOT touching. **§21.21's root cause
almost certainly produces this fragmentation too** — one defect, two symptoms that looked unrelated.
Q3's 26% is provisional for the same reason.

**Forced order (supersedes §21.22's):**
1. **Real door↔pocket adjacency** — `RoomWalker.doorAdjacent()` / §DOOR-PARTITION, never proximity.
2. **Real corridor identification** — the engine's own `common/hallway_backbone.js`, never a shape rule.
3. **Re-measure spine connectivity** (`roompath_diagnostics/spine.js`, re-pointed at 1+2). If the spine
   connects, the two-layer design is buildable and everything downstream simplifies.
4. Expect the end state to be **spine + genuine room-to-room links**, not spine-only — Q3 says some
   adjoining rooms really do connect directly, and forcing those out to a corridor would be its own error.
5. Funnel residuals (§21.18) LAST — a quality term on a map that is currently wrong.

### §21.24 §21.23's FORCED ORDER EXECUTED (2026-08-01). Steps 1+2 BUILT; step 3's go/no-go is
### **NO-GO** — the corridor spine does NOT connect, and §21.23's "one root cause" call is DISPROVEN.
bim-ootb `review/roompath-redundancy` @ `1cf5711`, pushed. Engine still byte-unchanged: nothing
deployed, `common/room_graph.js` and `viewer/navigate_find.js` untouched, cabling precondition up.

**FIRST, a correction to §21.21 itself — its prescribed fix does not exist.** §21.21 said "`RoomWalker`
already computes the true relation: it PARTITIONS pockets by doors during the flood fill
(§DOOR-PARTITION) and exposes `doorAdjacent()`". Verified before depending on it, per §21.14:
- `doorAdjacent()` (`viewer/lib/room_walker.js:242`) is **itself a proximity test** — buffer = the
  door's own half-span + `DOOR_BUFFER_SLACK` — and returns a **boolean**, not a pocket pair.
- `§DOOR-PARTITION` is a **fallback** for storeys where flood-fill structurally fails (`roomsFlood <
  0.15 × doors`, the HHS case). Clinic and LTU never enter it.
So "ask the walker" was not available. What the walker *does* have is the flood-fill **cell sets**,
which reach the wall face, and which it discards after inscribing rects. That is the fix.

**Step 1 — §DOOR-APERTURE, BUILT.** A door is a gap in a wall: march from the door centre along the
wall normal (the door bbox's SHORT axis), both directions, 3 rays offset along the leaf, and take the
first flood component each ray clears into. At most 2 pockets **by construction** — a fact off the
same raster the rooms came from, not a threshold. Additive and opt-in
(`compileRooms(db,{doorAdjacency:true})`); `walk()` untouched.
```
§ADJ2_T1 compileInvariant=PASS  Clinic 207 vs 207   LTU 422 vs 422    ← regression guard first
§ADJ2_T2 joins>2 = 0/252 and 0/606          (proximity guess: 91/254=36%, 75/606=12%)
§ADJ2_T3 interior doors = 192/252 and 404/606   (proximity: 2/254 and 11/606 at tol=0m;
                                                 97 and 275 at tol=0.4m but with 91 and 75 over-claims)
§ADJ2_T4 orphans = 9/252 (3.6%) and 21/606 (3.5%)   single-sided = 51 and 181
§ADJ2_LINKS distinctRoomPairs 183/207 rooms · 385/422 rooms
```
**§21.21 is SOLVED on its own terms.** No threshold, no over-claims, and the door relation went from
unusable (2 interior doors on Clinic) to 192. **Symptom 1 fixed.**

**Step 2 — real corridors, DONE.** `common/hallway_backbone.js` `classifyCorridorRooms()` in place of
the shape rule. It is far more conservative: **Clinic 16/207, LTU 28/422**, vs the shape rule's 38 and
135. §21.23's shape rule is kept as a CONTROL in the probe so corridor-definition and adjacency
changes stay separately attributable.

**Step 3 — spine re-measured. THE ANSWER IS NO.**
```
§SPINE2 Clinic [hallway_backbone] Q1 components=8  largest=5 (31%)   [§21.23 was 18, largest 8 (21%)]
§SPINE2 LTU    [hallway_backbone] Q1 components=17 largest=7 (25%)   [§21.23 was 33, largest 37 (27%)]
   shape-rule CONTROL on the corrected adjacency: Clinic 10/largest 9 · LTU 40/largest 43
§SPINE2_Q4 unroutable same-storey pairs  Clinic 43.3%  LTU 32.4%   [proximity map claimed 37% / 14.8%]
```
**§21.23's central prediction — "§21.21's root cause almost certainly produces this fragmentation
too, one defect two symptoms" — is DISPROVEN.** With the adjacency defect removed the spine is still
in 8 and 17 pieces, largest fragment 31% and 25%. The control shows why the numbers barely moved on
the shape-rule set: the fragmentation was never the adjacency.

**Routability got WORSE, and that is honest, not a regression.** The proximity map's 37%/14.8% was
flattered by phantom edges — a third of its doors claimed 3-4 rooms, and every false claim is a link.
A correct map is a sparser map. The real constraint is arithmetic: **192 door edges cannot connect 207
rooms** (a spanning tree needs 206). The old map hid this behind invented shortcuts.

**NEW FINDING — §OPEN-THRESHOLD, and it is building-dependent.** `SEAL=2` dilates walls 0.4 m to stop
exterior leaks, which also closes any genuine opening narrower than ~0.8 m. So a corridor continuing
through a doorless archway is split by a wall that does not exist in the model, and **no door-based
relation can ever rejoin it — there is no door there to ask about.** Measured exactly (cells blocked
in the dilated mask but free in the raw one, flooded and attributed):
```
§SPINE2_OPEN Clinic doorLinks=192  openThresholdLinks=182   ← about HALF of Clinic's real connectivity
             LTU    doorLinks=404  openThresholdLinks=5
§SPINE2_Q4   Clinic doorsOnly 82.0% -> doors+open 43.3% unroutable
             LTU    doorsOnly 38.9% -> doors+open 32.4%
```
Clinic is a doorless-opening building and LTU is not. **Any design that models circulation purely as
door-to-door is wrong on Clinic by construction** — that is a fact about the map, independent of which
router sits on top, and it applies to §21.23's two-layer design as much as to the shipped engine.

**WHY the map is still shattered — measured, and the obvious suspect is REFUTED.** Hypothesis: a big
region (main corridor/lobby) dropped by `MAX_AREA_FRAC` for being too large.
```
§SHATTER Clinic kept=207 droppedRegions=38   STAIR_EXCLUDE 4 (25m²) · MIN_AREA_no_door 14 (12m²) · NOISE_FLOOR 20 (7m²)
         LTU    kept=422 droppedRegions=134  STAIR_EXCLUDE 17 (124m²) · MIN_AREA_no_door 78 (109m²) · NOISE_FLOOR 39 (11m²)
         largest single dropped region: 8 m² (Clinic), 11 m² (LTU).  MAX_AREA_FRAC never fired.
§SHATTER_DOORS interior single-sided doors = 31/252 (Clinic), 62/606 (LTU)
§SHATTER_MISS  interior rays that found no pocket: Clinic {MASONRY 250, ENCLOSED_UNCLAIMED 35, EXTERIOR 23}
                                                  LTU    {MASONRY 221, ENCLOSED_UNCLAIMED 87, EXTERIOR 8}
```
`ENCLOSED_UNCLAIMED` = the ray cleared into real enclosed floor that **no surviving pocket owns**, and
its count (35 / 87) tracks the small-region drop count (34 / 117). Those regions were dropped by
**§DOOR-RESCUE's `MIN_AREA`-and-no-door gate — and the "has a door" half of that decision is made by
the same broken proximity `doorAdjacent()` §21.21 condemned**, applied to the pocket's BOUNDING BOX.
So §21.21's root cause does have a second victim after all — just not the one §21.23 guessed. It is
not corridor fragmentation; it is **small rooms being deleted from the map for appearing doorless.**

**NEXT — in this order, and note that (1) is now the cheap high-yield one:**
1. **Re-gate §DOOR-RESCUE on §DOOR-APERTURE, not on `doorAdjacent()`.** Compute apertures against ALL
   enclosed components *before* the drop gates, then keep a sub-`MIN_AREA` pocket iff a door aperture
   genuinely reaches it. Directly attacks the 34/117 wrongly-deleted rooms and the 31/62 interior
   one-sided doors. Falsification test: interior single-sided doors must FALL; `ENCLOSED_UNCLAIMED`
   must approach 0; §ADJ2_T1 compile-invariance is now expected to FAIL by design (the room set is
   meant to change) — so re-baseline it against the *count and identity* of newly-kept rooms instead.
2. **Decide §OPEN-THRESHOLD's status as a first-class relation**, not a diagnostic. On Clinic it is
   half the connectivity. Either the router consumes it, or `SEAL` stops inventing the walls that
   create it — the second is riskier (SEAL exists to stop exterior leaks) so prefer the first.
3. **Re-run step 3 only after 1+2.** The two-layer design is NOT refuted — it is UNTESTED, because
   its precondition (a connected spine) has never yet been measured on a complete map. §21.23's own
   caveat now applies to §21.24: these numbers rest on a map that still deletes rooms.
4. Funnel residuals (§21.18) stay LAST, unchanged.

**Method note, worth keeping.** This section's first spine run reported 91.5% unroutable — the probe
had grouped `spatial_structure` by `s.guid` instead of `s.room_guid`, counting §MULTI-RECT sub-rects
(304 rows) as if they were rooms (207). The absurd number is what exposed it. Checker before code
under test, again ([[feedback_verify_checker_before_code_under_test]]); the fix is recorded as a
load-bearing comment in `spine2.js` so the next session does not repeat it.

### §21.25 HOW TO OVERCOME — the three levers §21.24 named are MEASURED, and they are the wrong
### lever. The map is not what is broken any more; **the SPINE DEFINITION is.** Two-layer design: GO.
bim-ootb `review/roompath-redundancy` @ `a9cf261`, pushed. Engine still byte-unchanged, nothing
deployed. The committed §DOOR-APERTURE relation is untouched — every lever below is opt-in via
`compileRooms(db,{doorAdjacency:true,experiment:true})`, and §ADJ2 T1/T2/T3 were re-run to prove it.

**Lever A — §APERTURE-AXIS. ADOPT (correctness).** §DOOR-APERTURE takes the wall normal from the
door bbox's SHORT axis. That is an assumption, and it is the same proxy §21.15's funnel was burned
by. Measure it instead: from the door centre the blocked band is THIN across the wall and LONG along
it, because the wall continues. Take the axis with the shorter crossing — no tolerance, no name
matching, degrades to the bbox answer on a tie.
```
§LEVER_A Clinic doors resolving to 2 sides 192 -> 206/252   orphans 9 -> 3
§LEVER_A LTU                               404 -> 487/606   single-sided 181 -> 110
```
**Lever B — re-gate §DOOR-RESCUE on the aperture. ADOPT (correctness), but it does NOT buy
connectivity.**
```
§LEVER_B Clinic dropped regions=38  reached by a real door aperture=19 (26 m²)
§LEVER_B LTU    dropped regions=134 reached by a real door aperture=81 (140 m²)
```
Those are real rooms §DOOR-RESCUE deleted because the broken proximity test said they had no door.
**Lever C — §OPEN-THRESHOLD as a first-class link. ADOPT, and it is load-bearing on Clinic**
(44.8% unroutable with it, 83.6% without) and nearly irrelevant on LTU. Same split as §21.24 found.

**§OVERCOME — the falsification fired, exactly as written before the run.**
```
Clinic  baseline(§21.24)  spine 8 components  unroutable 43.3%
        +A                       9                       44.2%
        +A+B                    11                       83.6%
        +A+B+C                   9                       44.8%
LTU     baseline                17                       32.4%
        +A+B+C                  17                       35.5%
```
**Correct rooms, correct links, and the spine is no more connected than before.** Adding rooms adds
NODES faster than LINKS. **Relation-level repair is not the way through, and continuing down §21.24's
list would have burned a session to learn that.** Levers A/B/C are still worth taking — they fix real
defects — but not one of them is the thing standing between this lane and a working two-layer map.

**§SPINE_DEF — the actual answer, and it vindicates the user's ORIGINAL framing.** Every corridor
test this lane has tried asks what a pocket *looks like* (§21.23's shape rule) or how its doors *line
up* (`hallway_backbone.js`). Neither asks the only question routing cares about: **does traffic have
to pass through it?** That is betweenness centrality, computed from the room graph itself — no shape
rule, no name matching, nothing invented. Head-to-head on the same graph, same run, inside the
largest component:
```
Clinic  hallway_backbone     size  9  components  4  leaves within 1 hop 65%
        betweenness top 15%  size 15  components  2                      81%
        betweenness top 25%  size 25  components  1                      92%
LTU     hallway_backbone     size 26  components 15  leaves within 1 hop 56%
        betweenness top 10%  size 39  components  1                      79%
        betweenness top 25%  size 97  components  1                     100%
```
**The betweenness spine CONNECTS — one component — where `hallway_backbone` gives 4 and 15.** And
leaf attachment, which is the two-layer design's actual requirement (spine + rooms hanging off it),
goes 65%→92% and 56%→100%. **§21.23's design is buildable. Layer 1 must be derived from the graph,
not from corridor shape.**

This is §21.1's *"main most dense walkway"* — the user's own first formulation — implemented
correctly for the first time. `hallway_backbone.js` was the wrong implementation of the right idea,
and §21.22's "the shipped engine already has this" was too generous to it.

**§CEILING — and a correction to my own first reading of it.** The first pass reported "largest
component = 45% of rooms (Clinic)" as a hard ceiling. That conflated storeys: this relation has **no
vertical links**, so whole floors necessarily land in separate components. Per storey:
```
Clinic  First Floor 129 rooms, largest component 78%   Second Floor 96 rooms, 52% (split 50 + 37)
LTU     VÅNING 1/2/3  128/158/195 rooms, largest 82% / 83% / 77%      VÅNING 4 (22 rooms) 18%
```
So the substrate is healthier than the first number suggested — but **Clinic's Second Floor is
genuinely cut in two** (50 and 37), and that is a real defect still to find, not a storey artefact.

**REVISED ORDER — supersedes §21.24's:**
1. **Build the betweenness spine** as layer 1 of §21.23's design, on the committed §DOOR-APERTURE
   relation + §OPEN-THRESHOLD. Falsification: spine must stay 1 component per storey and leaf
   attachment ≥90% at top-25%, on a THIRD building neither of these two (over-fitting guard — both
   fixtures have now been looked at many times).
2. **Fold in levers A and B** as correctness fixes with their own witnesses. Note §ADJ2_T1
   (compile invariance) is expected to FAIL by design once B lands — the room set is *meant* to
   change — so re-baseline it on the identity of newly-kept rooms instead of on equality.
3. **Add vertical links** (stairs/lifts) before any cross-storey claim is made. Every number in
   §21.24 and §21.25 is same-storey only.
4. **Chase Clinic Second Floor's 50/37 split** — the one remaining map defect with a specific
   address.
5. Funnel residuals (§21.18) LAST, unchanged. They are still a quality term, and now clearly a
   small one next to the spine.

**Known limitation, stated rather than discovered later.** A betweenness spine will sometimes select
a room that is not circulation — an office that happens to be a cut vertex. That is not a bug in the
metric: where the graph forces traffic through an office, either the building does too, or the map is
wrong at that spot. It is self-diagnosing, and it is the reason step 1's witness should report the
spine's membership, not just its component count.

### §21.26 THE SPINE-FIRST DESIGN, BUILT — and the STOPPER, which sits under this whole lane:
### **the raster has no door voids.** 99–100% of doors are solid masonry in the wall raster.
bim-ootb `review/roompath-redundancy` @ `40ab3a0`, pushed. `RoomWalker.spineMap()`/`storeySpine()`
added read-only; the room compile is untouched; nothing deployed.

User, 2026-08-02: *"a corridor walkable spine mapping first which should traverse whole building to
the first layer of doors. And further layer of rooms hidden by the first are resolved separately."*
This is a **better construction than §21.25's betweenness spine** and it was built as specified,
because it defines the corridor as a fact about walkable space — *what you can walk without opening
a door* — instead of picking corridor-ish rooms out of an already-fragmented room graph.

**Three constructions, each failing for its own measured reason. Recorded so none is retried.**
1. `enclosed` + readmitted seal-band groups. **Wrong:** the seal halo is one continuous ribbon
   around the entire wall network, so readmitting a group merges rooms wherever a wall merely ENDS.
   16,594 halo cells came back on Clinic First Floor alone → spine 7% of the floor, 130 fragments.
2. Raw walls, no dilation — every real opening open, which is what the spine wants. **Wrong:** the
   exterior floods in through gaps in the wall extraction and swallows the corridor. Measured
   exterior region **1,094 m² against a 134 m² spine** on the same floor. That leak is exactly what
   `SEAL` exists to prevent.
3. Sealed (leak-free) base + LOCAL gap detection — from each raw-free cell no pocket owns, march
   both ways on x and y; different pockets on opposite sides = a genuine opening; then ask only
   "is there a door in it?". **Correct construction, and it finds nothing to fuse:**
```
§S1 Clinic First Floor  spine 93 m² of 1203 m² interior (8%)   openings: doorless=12 withDoor=5
    Clinic Second Floor spine 206 m² of 777 m² (26%)           openings: doorless=10 withDoor=3
    LTU VÅNING 3        spine 876 m² of 4787 m² (18%)          openings: doorless=0  withDoor=0
```

**THE STOPPER, measured directly, and it explains all three failures at once:**
```
§VOID Clinic  doors=252  door centre cell BLOCKED in the RAW wall raster = 250 (99%)
§VOID LTU     doors=606  door centre cell BLOCKED                        = 606 (100%)
```
`_rasterizeWalls` stamps each wall's **BOUNDING BOX**. A door is a *void in a wall*, and no void is
ever subtracted. **Doorways do not exist in the geometry at all.** Every pocket is sealed by solid
masonry on every side, so "everywhere you can walk without opening a door" has nothing to flood
through — layer 1 cannot be constructed from walkable space on this substrate, no matter how it is
coded.

**This is the root under the whole lane, and it retro-explains everything:** why door↔pocket
adjacency had to be a proximity guess at all (§21.21 — there is no opening to find); why
§DOOR-APERTURE has to march *across* the wall band rather than through a gap; why corridors read as
16–38 fragments (§21.22–§21.24); why levers A+B+C could not connect the map (§21.25). One substrate
fact, six sections of symptoms.

**Second substrate defect, found in the same pass:**
```
§WALLGEOM Clinic 113/1080 (10%) · LTU 495/2617 (19%) walls have bbox aspect < 4 — the axis-aligned
   bbox covers far more floor than the wall does. element_transforms HAS rotation_x/y/z columns;
   _rasterizeWalls ignores them, so a rotated wall is stamped as an oversized solid block.
```

**HOW TO OVERCOME — and the user's own architecture is what makes it tractable.**
User, 2026-08-02: *"during injection, that metadata is laid down. The rest is algorithm that is
abstract for 1. Any room (both origin and target) to reach that spine. 2. Traverse within that spine
where the path issues from and to."* That separation is right, and it **routes around the stopper**:
the router never needs a walkable opening, it needs *metadata*, and the door ELEMENTS carry the
truth even when the raster does not. Concretely, injection lays down and stores:
- **door↔room adjacency** — §DOOR-APERTURE, already built and passing (0 over-claims vs 36%/12%;
  192/252 and 404/606 interior doors vs 2 and 11 under the proximity guess);
- **spine membership** — with no doorless openings in the substrate, the spine must come from the
  door graph; §21.25's betweenness gives ONE component and 92%/100% leaf attachment;
- **per-room attachment**: its spine entry door + depth.
Routing is then the abstract 3-step the user describes, with no geometry in it at all.

**Answering the user's question — "any room has to get to the spine through its connecting room/s.
Is that easy?"** *The traversal is trivial and is not where the difficulty lives.* It is a BFS from
the spine over the door graph; depth 1 = opens onto the spine, depth 2+ = "hidden by the first",
resolved through its parent, exactly as described. **The cost is that every hop inherits the door
relation's error rate, and errors COMPOUND with depth**: at depth 1 a bad link mis-attaches one
room; at depth 3 it orphans a whole subtree. So the entire two-layer design reduces to one
requirement — **every room must have at least one CORRECT door link** — which is why §21.21 was
correctly identified as upstream of everything, and why it must be fixed at injection rather than
patched in the router.

**REVISED ORDER — supersedes §21.25's:**
1. **Carve door voids into the raster** (`_rasterizeWalls` subtracts IfcDoor bboxes) — for the SPINE
   map only, NOT the room compile, which would then leak through carved doorways. This is the one
   change that makes layer 1 constructible as designed. Witness first: re-run §VOID and require the
   blocked-centre rate to fall from 99–100% to ~0.
2. **Honour `rotation_z` in `_rasterizeWalls`** — 10%/19% of walls are currently stamped as
   oversized axis-aligned blocks. Check whether IfcOpeningElement is extracted at all while here;
   doorless archways cannot exist in the map without it.
3. **Move the metadata to injection** per the user's architecture: door↔room adjacency + spine
   membership + per-room attachment/depth, written once, consumed by an abstract router.
4. Re-run §21.26's §S1–§S4 on the carved raster. Only then is the two-layer design's feasibility
   actually testable; every number in §21.23–§21.26 was taken on a substrate with no doorways in it.
5. Funnel residuals (§21.18) LAST, unchanged.

### §21.27 DOOR VOIDS CARVED — §21.26's stopper is REMOVED (99%/100% → 0%). Layer 1 now builds, but
### does not yet beat the room graph. **And §21.26's rotation finding is RETRACTED — it was wrong.**
bim-ootb `review/roompath-redundancy` @ `2d2d069`, pushed. Room compile untouched throughout —
carving is spine-only by design, because carving doorways would let the room flood-fill leak through
them, which is the very thing `SEAL` exists to stop. Nothing deployed.

**Step 1 of §21.26 done, and gated before any spine number was believed.** `§SPINE-RASTER` carves
IfcDoor + floor-level IfcOpeningElement voids out of the wall stamps, so doorways exist in the
geometry for the first time in this lane.
```
§G1 door centres on solid wall   Clinic 99% -> 0%      LTU 100% -> 0%          PASS
§G2 stamped wall area            Clinic 1018 -> 827 m²  LTU 4104 -> 2614 m²
§G3 leak signature (largest enclosed pocket as % of plan)
                                 Clinic 2.5% -> 2.5%   LTU 8.5% -> 8.5%   unchanged => no leak
```
**Three corrections were needed, and every one was caught by a gate rather than by reading the
code** — which is the argument for writing the gate first:
1. **Carving alone let the exterior flood straight in** — 99% of enclosed floor lost on the first
   run. Fixed by `§SEAL-DOORS-FIRST`: the ENCLOSURE is derived from a mask with all doors re-closed,
   while OPENINGS are detected on the carved mask where they are open. Two masks, one raster, each
   question asked of the one that can answer it.
2. **Carving `IfcOpeningElement` indiscriminately removed 55.6% of LTU's wall** — those 3,368
   openings include WINDOWS. Fixed by `§VOID-AT-FLOOR`: test the void's own sill height against its
   storey datum. No name matching. (Clinic carries 0 openings at all; LTU 3,368 — the two fixtures
   differ in kind here, as they did on §OPEN-THRESHOLD.)
3. **The opening→door match reach (`SEAL+1`) was shorter than the re-sealed door stamp it has to
   cross**, giving `withDoor=0` on every storey — i.e. no door links at all, which read as a clean
   100% unroutable rather than as a bug. Reach is now derived from the stamp depth.

**RETRACTION — §21.26's second finding is WITHDRAWN.** It claimed `_rasterizeWalls` ignores
`rotation_z` and therefore stamps 2,051 LTU walls at the wrong orientation. **`rotation_z` is stored
in RADIANS** (measured range ±π); both that check and my first stamp implementation treated it as
degrees, which turned a 180° wall into a 3.14° one and made the knob a no-op. With the unit
corrected and rotation isolated as its own knob, it is measurably a **non-issue**:
```
wall area, rotate-only vs base:  Clinic 1018 -> 1022 m²   LTU 4104 -> 4106 m²   enclosure identical
```
**Step 2 of §21.26's plan is dropped.** The lesson is the one this lane keeps relearning: a
"defect" inferred from a derived statistic (§WALLGEOM's chunky-aspect count) and never confirmed
against the raw value is not a finding. §21.24's §MULTI-RECT grouping bug and this are the same
error twice.

**STATUS — carving removed the stopper but has NOT yet produced a better map. Stated plainly:**
```
Clinic  spine 9% / 31% of interior floor   openings doorless=23/11  withDoor=114/73
        depth chains 1..5 now present (were absent entirely)   unroutable 91.3%  [baseline 43.3%]
LTU     unroutable 87.7%  [baseline 32.4%]        stranded: Clinic 140, LTU 107 rooms
```
Layer 1 is now mechanically correct — real doorways, real door links, real depth — and still loses
to §21.24's room graph on the only number that has decided anything in this lane. **The next thing
to chase is the STRANDED count, not the spine definition.** 140 and 107 rooms with no door path to
the spine is the whole gap; the spine's own share of floor area is a symptom of it, not a separate
problem.

**NEXT:**
1. **Chase the stranded rooms.** For each, why: no door element, a door whose carve did not pierce
   its host wall, or a pocket the sealed flood never formed. Those are three different fixes and the
   count says which dominates.
2. **Explain LTU's enclosed-area drop** (22,311 → 9,696 m² under carving, with NO leak signature).
   Most likely legitimate — floor-level doorless openings to outside on a residential building
   (balcony thresholds) — but "most likely" is not measured, and it is 57% of the floor.
3. **Then, and only then, re-run §S1–§S4** and compare against §21.24 honestly.
4. Move the metadata to injection per the user's architecture (§21.26) once the map earns it.
5. Funnel residuals (§21.18) LAST, unchanged.

### §21.28 START HERE — handoff for the next session (written 2026-08-02 at session close)
Read §21.14 first for setup/fixtures/landmines (still current), then §21.24→§21.27 in order. Below
is only what a fresh session needs that is not obvious from those.

**Setup.** `cd ~/bim-ootb && git worktree list` (reuse before adding), then
`GIT_LFS_SKIP_SMUDGE=1 git worktree add /tmp/wt-roompath review/roompath-redundancy` @ `2d2d069`.
⚠ A /tmp worktree can be removed by another session mid-run — it happened twice in this lane
(2026-07-31 and again 2026-08-01). Everything is pushed; recreate and continue, never re-derive.

**State: nothing is deployed. The viewer engine is byte-unchanged.** `common/room_graph.js` and
`viewer/navigate_find.js` have not been touched by any of §21.20–§21.27. The room compile
(`walk()`/`compileRooms()`) is byte-identical — every addition is opt-in
(`{doorAdjacency:true}`, `{experiment:true}`, `spineMap()`), and §ADJ2_T1 exists to prove it.
The cabling precondition (§20) is still up.

**What is SETTLED — do not re-litigate, do not re-measure:**
- §DOOR-APERTURE replaces proximity for door↔pocket. Over-claims 36%/12% → **0**; interior doors
  2/254 → 192/252 and 11/606 → 404/606. §21.21's *prescribed* fix (`doorAdjacent()`/§DOOR-PARTITION)
  **does not exist** — `doorAdjacent()` is itself a proximity test, §DOOR-PARTITION is an HHS-only
  fallback. Verified, not assumed.
- The raster had **no door voids** (99%/100% of doors on solid masonry). §21.27 carves them; gate
  passes to 0%/0% with no leak signature. This is the root that retro-explains §21.21–§21.25.
- **Corridor identification by shape, by `hallway_backbone.js`, and by betweenness have all been
  tried.** Betweenness is the best of the three (1 component, 92%/100% leaf attachment); the other
  two are dead ends. But all three were measured on the UNCARVED substrate.
- **`rotation_z` is a NON-ISSUE** — §21.26 claimed otherwise and §21.27 retracts it. It is stored in
  RADIANS. Do not re-open this.
- Fixtures differ IN KIND, so never generalise from one: Clinic has 182 doorless openings and 0
  `IfcOpeningElement`; LTU has 5 and 3,368. Any rule that works on one must be checked on the other.
  ⚠ **READ THAT LINE CAREFULLY — it says DOORLESS openings, not doors.** It misled a reader on
  2026-08-02 into "LTU has 5 doors." LTU has **606 real IfcDoor** (median 0.91 m × 2.11 m). See §21.29.

**THE ONE THING TO DO NEXT — the stranded rooms.** Layer 1 now builds correctly (real doorways, real
door links, depth chains 1..5) and still loses to the room graph: unroutable **91.3%/87.7%** vs the
§21.24 baseline **43.3%/32.4%**, with **140 (Clinic) / 107 (LTU)** rooms having no door path to the
spine. That count IS the gap — the spine's small share of floor area is a symptom of it, not a
separate problem. For each stranded room there are exactly three possible causes, and they are three
different fixes:
1. no door element exists for it at all;
2. a door exists but its carve did not pierce the host wall;
3. the sealed flood never formed the pocket (dropped by a §DOOR-RESCUE-class gate).
**Classify all 140/107 first and let the count choose the fix.** Do not guess; this lane has lost two
sessions to plausible-sounding causes that measurement then refuted (§21.23's "one root cause",
§21.26's rotation claim).

**Second open item, unexplained and 57% of the floor:** LTU's enclosed area drops 22,311 → 9,696 m²
under carving with NO leak signature. Probably legitimate (floor-level doorless openings to outside
on a residential building — balcony thresholds) but that is a guess, and it is large enough that a
guess is not good enough.

**Method notes that earned their place this lane:**
- **Write the gate before the fix.** All three carving bugs in §21.27 were caught by gates, not by
  reading code — and one of them (`withDoor=0`) presented as a clean 100% unroutable rather than as
  an error.
- **Verify the checker before the code under test.** Two self-inflicted bugs this lane: grouping
  `spatial_structure` by `s.guid` instead of `s.room_guid` (§MULTI-RECT — read 91.5% unroutable), and
  treating radians as degrees. Both were caught only because the number was absurd.
- **Never infer a defect from a derived statistic without checking the raw value** — that is what
  produced the retracted rotation finding.

### §21.29 APERTURE PROVENANCE — where the doorway hole actually comes from, and the TIER contract
### that makes it general. (2026-08-02, measure-only session. Nothing built, nothing deployed.)
User challenge that started this: *"how the LTU is done then without doors, i tot i saw a lot when
doing fly thru timeline scrub to view. Investigate deeper first if it is really true."* The user was
right on the facts and the investigation found a defect in §21.26's premise, not just a wording bug.
Probes: `scratchpad/probe_ltu_doors.py`, `probe_ltu_openings.py`, `probe_ltu_arch.py`; logs
`ltu_doors.log`, `ltu_openings.log`, `ltu_arch.log`. Fixture `~/bim-ootb/buildings/*_extracted.db`.

**FACT 1 — LTU is door-rich. The §21.28 "5" is doorless ARCHWAYS, not doors.**
```
§LTUDOOR_1 LTU doors=606 openings=3368 windows=976
§LTUDOOR_2 door bbox maxHoriz median=0.91m p10=0.91 p90=1.68 | height median=2.11m
§LTUDOOR_3 doors with maxHoriz<0.6m = 1/606
   storeys VÅNING 3=219 · 2=198 · 1=180 · 4=9   types Basdörr 16=550, Dörr 16=13, Vikdörr=11, Skjutdörr=9
```

**FACT 2 — §21.26's stopper is OVERSTATED, and this is the real finding.** It says *"a door is a void
in a wall, and no void is ever subtracted… doorways do not exist in the geometry at all."* True of the
RASTER everywhere, and true of Clinic's DATA (0 `IfcOpeningElement`). **False of LTU's data:**
```
§LTUDOOR_4 doors with an IfcOpeningElement centre within 0.3m = 601/606 (99.2%)  [0.6m: 604, 1.0m: 604]
§LTUDOOR_5 matched-opening maxHoriz median=0.93m height median=2.11m (n=604)
§LTUDOOR_6 windows with an opening within 1.0m = 956/976
```
The apertures were in `element_transforms` all along, dimensionally matching their doors. §21.27
carved **door bounding boxes** as a proxy for a void LTU already had. Not a wrong fix — a coarser one
than that fixture's data supports, and it is the substrate the 140/107 stranded rooms were measured on.

**FACT 3 — the §21.28 "second open item" guess is off by ~24×, and its unit was wrong.**
```
§ARCH_2 LTU floor-level doorway-sized voids with NO door and NO window = 122
        (VÅNING 1=50 · 2=36 · 3=27 · 4=9)      ← §SPINE2_OPEN reported openThresholdLinks=5
§ARCH_3 unhosted voids >=2.0m wide = 125, widths up to 25.4m and 55.1m
§LTUOPEN_1 openings=3368  door-hosted=715  window-hosted=1438  UNHOSTED=1250
§LTUOPEN_4 unhosted tiny (<0.4m, MEP-penetration shaped) = 406/1250
```
`5` is a RASTER-derived count that survived `SEAL=2`'s 0.4 m dilation; `122` is the element count. Both
are "right", of different things — never compare them. The balcony-threshold story for the
22,311 → 9,696 m² drop is now testable instead of a guess, **but the 20–55 m "openings" are not
archways** (atrium / stair / facade voids) and flooding them would destroy an area figure.

**LANDMINE — every `IfcOpeningElement` carries `storey='Unknown'` (all 3,368).** Attribute openings to
a storey by Z against the door-sill medians (VÅNING 1/2/3/4 = 2.70 / 6.00 / 9.30 / 12.30 m), never by
the `storey` column. §LTUOPEN_5 silently returned `{Unknown: 1250}` before this was caught.

**THE GENERALITY TEST the user imposed** — *"as long as this can generally apply to most IFCs a user
may import."* It does NOT, in the naive form. Fleet, measured:
```
Clinic 254/0 · Duplex 14/0 · HHS 133/0 · Hospital 440/0 · Hospital_3 440/0 · JKR 65/0
Terminal 135/0 · TermRooms 135/0 · LTU 606/3368            (doors / IfcOpeningElement)
```
**1 of 9.** "Use IfcOpeningElement" cannot be the method. But the LIVE USER-IMPORT PATH is richer than
every shipped fixture — `viewer/import_worker.js` already parses, for any IFC a user drops in:
- `IFCRELVOIDSELEMENT` → wall→opening (`relType:'VOIDS'`, ~line 322)
- `IFCRELFILLSELEMENT` → opening→door/window (`relType:'FILLS'`, ~line 334) → `§BOM_TREE_RELS`
- and opens the model `USE_FAST_BOOLS:true` — the wall MESH already has the hole subtracted.
That relation pair is the *authoritative* host-wall↔aperture↔door binding, straight from IFC, with no
proximity guess anywhere in it. ⚠ **It is absent from every shipped fixture** — only `Duplex` has a
`bom_tree` table at all and it holds `AGGREGATES=11`, zero VOIDS, zero FILLS. So it is reachable for
user imports and NOT measurable on the lane's current fixtures without re-extraction.

**§APERTURE_TIER — the design that satisfies both constraints.** One resolver, one output contract,
three sources, best-available wins. Output per doorway, identical shape regardless of tier:
`{ doorGuid, hostWallGuid|null, apertureRect, tier }`.
| tier | source | availability | quality |
|---|---|---|---|
| **A** | `bom_tree` VOIDS+FILLS | any user import; 0/9 fixtures today | exact host wall + exact filling door, no guess |
| **B** | `IfcOpeningElement` geometry | 1/9 fixtures (LTU); user imports whose exporter wrote them | 99.2% door match, real 0.93×2.11 apertures |
| **C** | door-bbox carve (§21.27, shipped) | 9/9 — needs only `IfcDoor` | coarse, universal, the FLOOR |
Rules: **C is never removed** — it is the guarantee that nothing regresses on the 8 fixtures with no
void data. A and B only *raise* precision where the data exists. The resolver logs
`§APERTURE_TIER <building> A=<n> B=<n> C=<n> total=<doors>` so every downstream number states which
substrate produced it — the absence of that line is what let §21.26 generalise Clinic's data gap into
a claim about all geometry.

**Falsification tests, written BEFORE the code (§21.14 discipline, which caught all three §21.27 bugs):**
1. **Tier fidelity.** `§APERTURE_TIER LTU` must report B≥601 and C≤5; `§APERTURE_TIER Clinic` must
   report C=254, A=0, B=0. If Clinic reports any A or B, the resolver is inventing.
2. **Non-regression on tier C.** Clinic's §VOID blocked-centre rate must stay at 0% and its
   §SPINE2_Q4 unroutable must not rise above §21.27's measured value. C is byte-equivalent to §21.27.
3. **B must BEAT C on LTU or the tier is pointless.** Re-run the stranded-room count on LTU under
   tier B: **107 must fall.** If it does not move, the aperture was never the stranded cause and
   §21.28's cause (2) ("carve did not pierce the host wall") is refuted — which is a real result, not
   a failure, but it must be recorded as one and the effort moved to causes (1) and (3).
4. **No new leak.** Enclosed-area and leak signature under tier B must not differ from tier C by more
   than the door apertures account for. The 20–55 m unhosted voids must NOT be carved — tier B admits
   an opening only if it is door-hosted (§LTUDOOR_4) or window-hosted; the 1,250 unhosted stay out.

**ORDER — supersedes §21.28's "one thing to do next", does not replace it:**
1. Build the §APERTURE_TIER resolver behind an opt-in flag, tests 1+2 first (fidelity + non-regression).
2. Re-run the 140/107 stranded-room classification on BOTH regimes — Clinic on C, LTU on B. Only then
   does §21.28's three-cause split mean anything, because it was taken on a bbox-carved substrate.
3. Then §21.28's cause classification proceeds unchanged with the tier recorded against each count.
4. Re-extraction of the 8 fixtures through `import_worker.js` to gain tier A is a SEPARATE, expensive
   question. Flagged, not authorised, not needed for any of the above.

**Still open from §21.28, unchanged:** the LTU enclosed-area drop (now with 122 real candidates to
test against instead of a guess), and the fact that nothing in §21.20–§21.29 is deployed —
`common/room_graph.js` and `viewer/navigate_find.js` remain byte-unchanged.

### §21.30 §APERTURE_TIER RESULTS — T3 REFUTES the aperture hypothesis, and T5 finds the shipped
### carve dissolving 57% of LTU's floor. Every LTU number in §21.26–§21.28 is an artefact.
bim-ootb `review/roompath-redundancy` @ `5387447`, pushed. `witness_room_path_aperture_tier.js`,
log `roompath_diagnostics/w_aperture_tier.log`. Resolver is `storeyVoids(db, anchors, voidMode)` with
`opts.voidMode` on `spineMap` — default `'cur'` is byte-identical to §21.27, so every prior number
reproduces exactly (verified: LTU cur = 107 stranded / 9,696 m² / 87.7%, the §21.28 figures).

**§APERTURE_CENSUS — the fleet fact that settles the design question.**
```
Clinic 254/0 · Duplex 14/0 · HHS 133/0 · Hospital 440/0 · JKR 65/0 · Terminal 135/0 · LTU 606/3368
TOTAL buildings=7  tier B possible=1  tier A possible=0   (bom_tree VOIDS/FILLS: none, anywhere)
```
Tier C is the ONLY source on 6/7. It cannot be removed. Tier A exists solely on the user-import path
(`import_worker.js`), and no fixture can measure it. **This closes the user's generality condition:**
the resolver is general because C is universal, not because opening geometry is.

**RESULTS — 3 of 5 tests pass, and the two failures are the findings.**
```
             doorCentresOnWall  wall    enclosed  spine  stranded   unroutable
Clinic  cur          0%         829m²   1668m²    17%    140/234    91.3%
        B/C          0%         829m²   1668m²    17%    140/234    91.3%     (identical — no openings)
LTU     cur          0%        2614m²   9696m²    66%    107/239    87.7%     ← §21.28's numbers
        B            0%        3553m²  21387m²    31%    319/544    76.3%
        C            0%        3558m²  21395m²    31%    320/544    76.3%
§T1 TIER FIDELITY  PASS both — Clinic admits 0 openings in every tier (would be invention);
                   LTU tier B admits 616 of cur's 2,211, tier C admits 0.
§T2 TIER-C NON-REGRESSION  PASS both.
§T3 TIER-B vs TIER-C  FAIL — LTU stranded 320 -> 319 (0.3%), unroutable 76.3% -> 76.3%.
§T4 NO-LEAK  PASS both — and the pass is worthless, see T5.
§T5 ENCLOSURE RETENTION  FAIL both — LTU cur retains 43% of 22,311m²; B/C retain 96%.
                                     Clinic retains 84% in ALL THREE modes.
```

**FINDING 1 — §21.28's cause (2) is REFUTED, and so is §21.29's own premise.** §21.29 argued §21.27
carved door bounding boxes as a proxy for voids LTU already had. True, but **the proxy is as good as
the real thing**: real apertures on 616 door-hosted openings recover ONE room out of 320 and move
unroutable by 0.0 points. "A door exists but its carve did not pierce the host wall" is not what
strands rooms. The remaining stranded rooms are cause (1) *no door element exists* or cause (3) *the
sealed flood never formed the pocket*, and §21.28's classification should now skip cause (2) entirely.
⚠ Also note `storeyVoids` **already** admitted `IfcOpening%` before this session — §21.29's framing
that §21.27 ignored the openings was wrong, and the correction is recorded here rather than quietly.

**FINDING 2 — the shipped carve destroys 57% of LTU's enclosed floor, and that is the whole of
§21.28's "unexplained second open item."** It is not balcony thresholds and it is not legitimate.
`cur` admits every floor-level ARC opening — 2,211 on LTU, of which **1,595 are not door-hosted**:
the atrium/stair/facade voids measured in §21.29 (125 at ≥2.0 m, up to 25 m and 55 m across). Carving
one along a facade removes a long run of exterior wall and the interior flood escapes. Restricting to
door-hosted openings restores 22,311 → 21,387 m² (96%). **Consequence: LTU's 107 stranded, 66% spine
and 87.7% unroutable in §21.26–§21.28 were all measured on a building missing over half its floor.
The corrected figures are 320 stranded, 31% spine, 76.3% unroutable.** The spine looked good because
the floor it was a share OF had been dissolved.

**FINDING 3 — the door-bbox carve over-cuts on Clinic, on the only tier Clinic has.** Enclosure
retention is 84% in every mode: 254 doors cost 312 m² of the 1,980 m² enclosed. Tier B cannot help —
Clinic has no opening geometry — so this is a defect in the `pierce = 6 * RES` door-bbox rule itself,
not something a better provenance tier can fix. **New, and it was invisible until T5 existed.**

**METHOD — T4 passed while the building dissolved, and that is the lesson.** The leak signature
(largest pocket as a share of plan) was 8.5% in all three LTU modes, including the one retaining 43%.
It cannot see this failure by construction: carving an exterior wall does not merge pockets into one
giant region, it lets the flood ESCAPE, so the floor silently stops being enclosed and the pockets
that remain look normal. §21.27's G3 printed `enclosed=9696m²` next to `22311m²` and accepted it.
**Retention had to be its own gate with its own threshold.** Related: T3's first pass-condition was
"any fall at all" and it PASSED on 320 → 319; it was tightened to a material ≥10% and the change
recorded in the witness header rather than made silently after seeing the number.

**ORDER — supersedes §21.29's:**
1. **Make tier B the default on any fixture that has opening geometry, and fix the unhosted-void
   admission in `cur`** — this is a live defect, not a tuning choice. Retention ≥90% becomes a
   standing gate on every future spine number.
2. **Root-cause Clinic's 16% retention loss** in the `pierce = 6 * RES` rule. It bounds every
   door-only building, which is 6 of 7.
3. **Re-run §21.28's stranded classification on the corrected LTU substrate (320, not 107)** with
   cause (2) removed from the candidate list.
4. Tier A stays unbuildable until a fixture carries `bom_tree` VOIDS/FILLS. Not blocking anything.
Nothing deployed; `common/room_graph.js` and `viewer/navigate_find.js` remain byte-unchanged.

### §21.31 START HERE — handoff for the next session (written 2026-08-02, second session of the day)
Read §21.14 for setup/fixtures/landmines (still current), then §21.29→§21.30. **Skip §21.24–§21.28's
LTU numbers entirely — they are artefacts** (§21.30 FINDING 2). Below is only what is not obvious there.

**Setup.** `/tmp/wt-roompath` EXISTS and is current at `5387447`, clean and fully pushed — **reuse it,
do not `git worktree add` a second one** (`git worktree list` first, always). If it has vanished again
(it has twice in this lane): `cd ~/bim-ootb && GIT_LFS_SKIP_SMUDGE=1 git worktree add /tmp/wt-roompath
review/roompath-redundancy`. Everything is pushed; recreate and continue, never re-derive.

**State: nothing is deployed. The viewer engine is byte-unchanged.** `common/room_graph.js` and
`viewer/navigate_find.js` untouched by §21.20–§21.31. The room compile is byte-identical — the
`§APERTURE_TIER` resolver is opt-in (`spineMap(db,{voidMode:'B'|'C'})`, default `'cur'` reproduces
§21.27 exactly, verified). Run `node witness_room_path_aperture_tier.js` to reproduce every number below.

**What is SETTLED — do not re-litigate, do not re-measure:**
- **Aperture PROVENANCE is not the problem.** T3: real IfcOpeningElement apertures vs door bboxes on
  LTU = 320 → 319 stranded, unroutable unmoved. §21.28's cause (2) is REFUTED. Do not revisit it and
  do not build tier A hoping it helps — it is the same relation, stated exactly instead of measured.
- **Tier C cannot be removed.** 6 of 7 fixtures have zero `IfcOpeningElement`, 7 of 7 have zero
  `bom_tree` VOIDS/FILLS. Any aperture design that assumes opening geometry is wrong on the fleet.
- **LTU's corrected baseline is 320 stranded / 31% spine / 76.3% unroutable**, not 107 / 66% / 87.7%.
- **`rotation_z` is in RADIANS and is a NON-ISSUE** (§21.27 retraction). Still true. Do not re-open.
- Clinic 140/234 stranded and 91.3% unroutable are UNAFFECTED by all of the above — Clinic has only
  tier C, so its §21.24–§21.28 numbers stand.

**THE ONE THING TO DO NEXT — fix the unhosted-void admission.** `cur` admits 2,211 floor-level ARC
openings on LTU, of which **1,595 are not door-hosted** (atrium/stair/facade voids, up to 25 m and
55 m across). Carving them removes exterior wall and the interior flood escapes → 43% enclosure
retention. This is a live defect in shipped `storeyVoids`, not a tuning preference. The fix is already
built and measured — tier B's door-hosted test — so the work is to make it the default where opening
geometry exists and to keep `§T5 ENCLOSURE RETENTION ≥90%` as a standing gate on every future spine
number. **Do not skip the gate**: `§T4`'s leak signature passed at 8.5% on the 43% run, so the
existing leak test cannot see this failure class at all.

**Second item, and it bounds 6 of 7 buildings:** Clinic retains only **84%** of enclosed floor in
EVERY mode — 254 door bboxes cost 312 m² of 1,980 m². Tier B cannot help (no openings). Suspect the
`pierce = 6 * RES` slack in `_rasterizeSpine`. Falsification test before the fix: retention must rise
toward 95%+ WITHOUT `doorCentresOnWall` leaving 0% — those two trade against each other directly.

**Third, only after the two above:** re-run §21.28's stranded classification on the corrected LTU
substrate (320 rooms), with cause (2) struck from the candidate list — so every stranded room is
either (1) no door element exists, or (3) the sealed flood never formed the pocket.

**Method notes that earned their place, on top of §21.28's:**
- **A gate that cannot see a failure class is not coverage.** T4 (largest-pocket leak signature)
  passed on a raster missing 57% of its floor, because carving an exterior wall lets the flood ESCAPE
  rather than merging pockets. §21.27's G3 printed both numbers side by side and accepted them.
  When adding a gate, ask what failure it structurally cannot detect, and add that one too.
- **Set the pass threshold to a MATERIAL effect before running.** T3's first version passed on
  320 → 319. A test that any noise satisfies proves nothing.
- **Check whether the code already does the thing you are about to add.** §21.29 specced admitting
  `IfcOpeningElement` when `storeyVoids` already admitted it — the real defect was that it admitted
  too much, the opposite direction. One `grep` before the spec would have caught it.

### §21.32 §PRECARVE — §21.31 items 1+2 BUILT. Retention 84%/43% → 100%/100%, and Clinic's
### unroutable falls 91.3% → 49.5%. The two fixes INTERACT and that flips item 1's own conclusion.
bim-ootb `review/roompath-redundancy` @ `9e31374`, pushed. Log `roompath_diagnostics/w_aperture_tier2.log`.
Re-run: `node witness_room_path_aperture_tier.js`. **Supersedes §21.30's tables.** Nothing deployed.

**ITEM 2 ROOT CAUSE — found analytically, then confirmed, not searched for.** `§SEAL-DOORS-FIRST`
derived the enclosure from a mask where every door had been carved and then **re-stamped** as a
`thin + 6*RES` rect. That is **+1.2 m of solid across a ~0.2 m wall** — a ~0.5 m spur into the room on
each side, ×254 doors, then dilated by `SEAL`. It could never be tuned out: the plug is thicker than
the wall *by construction*. **§PRECARVE** returns the mask as it stood BEFORE any void was cut, so
"all doors closed" is exact — no plug, no slack constant, no threshold. Enclosure is now identical to
uncarved by construction, which is why T5 reads exactly 100% rather than "within tolerance".

```
                     enclosed        stranded      unroutable   spine
Clinic  before        1668m² (84%)   140/234        91.3%        17%
        after         1980m² (100%)   55/208        49.5%        15%
LTU B/C before        9696m² (43%)   107/239        87.7%        66%   ← the artefact
        after        22311m² (100%)  295/536        46.2%        30%
§T1 PASS both · §T2 PASS both · §T4 PASS both · §T5 PASS both (100%/100%)
§T3 FAIL — LTU B vs C = 295 -> 295 (0.0%). Cause (2) stays REFUTED, now on a correct substrate.
```
Clinic's stranded rooms fell **61%** and its unroutable **nearly halved** — against a §21.24
room-graph baseline of 43.3%, layer 1 is now 49.5% instead of 91.3%. None of that came from aperture
provenance; it came from not plugging the doorways shut with 1.2 m of invented masonry.

**THE INTERACTION — and it reverses §21.31 item 1, so read this before acting on it.** Item 1 made
the door-hosted filter ('B') the default because admitting unhosted voids destroyed 57% of LTU's
floor. **§PRECARVE removes that consequence entirely** — enclosure no longer depends on the carve at
all, so carving an atrium void can no longer open the envelope. With the danger gone, admitting MORE
voids is now strongly better:
```
LTU 'cur' (all floor-level ARC openings, 2,211)  stranded 32/294 (11%)  unroutable 26.1%  spine 45%
LTU 'B'   (door-hosted only, 616)                stranded 295/536 (55%) unroutable 46.2%  spine 30%
```
**`cur` now beats the §21.24 room-graph baseline of 32.4%** — the first construction in this lane
that does. Those 1,595 unhosted voids are largely the genuine doorless archways §OPEN-THRESHOLD named
back in §21.22, which is exactly the connectivity Clinic was shown to need.

**Why it is NOT the default yet — the one test that must run first.** A 55 m facade void is still
admitted by `cur`, and the carved mask is what gap-marching reads to decide two pockets are open to
each other. That is the same shape of failure as §21.21's proximity edges: **a link that exists
because the geometry was cut too generously, not because you can walk there.** §21.24 already showed
once that a flattering unroutable number came from phantom edges, and that a correct map is a sparser
map. So `cur`'s 26.1% is a LEAD, not a result, until an over-linking test says otherwise.

**NEXT — in this order:**
1. **Over-linking test on `cur`, written before any default change.** For each gap-derived link, does
   a walkable path exist through the UNCARVED raster within a sane detour of the straight line? Links
   that only exist post-carve through a >2 m void are the suspects. Falsification: if `cur`'s edge set
   survives, make it the default and the lane's core question is answered; if a material share are
   phantom, tier B stands and the archways need admitting by width, not by presence.
2. Re-classify LTU's 295 (not 107, not 320) and Clinic's 55 (not 140) on causes (1)/(3) only.
3. Tier A remains unbuildable — no fixture carries `bom_tree` VOIDS/FILLS. Not blocking.

**Method note:** item 2 was root-caused by reading `§SEAL-DOORS-FIRST` and doing the arithmetic
(254 × ~1.3 m² of plug ≈ 300 m² ≈ the observed 312 m² loss) BEFORE running anything. The measurement
then confirmed a specific prediction rather than being searched for a cause — which is how §21.26's
rotation claim should have been handled and was not.

### §21.33 OVER-LINKING TEST — §21.32's 26.1% is PHANTOM. Verdict FAIL, and the width sweep
### hands back a real result anyway: W:3.0 cuts LTU's stranded rooms 295 → 60.
bim-ootb `review/roompath-redundancy` @ `b669a59`, pushed. `witness_room_path_overlink.js`, log
`roompath_diagnostics/w_overlink.log`. Tests written before the run, per §21.32 item 1. Nothing deployed.

**§O2 THE SWEEP — and the shape of it is the whole finding.**
```
LTU     fusions  spine  stranded   unroutable
C          24     30%   295/536     46.5%
B          24     30%   295/536     46.2%
W:1.5     180     37%   160/387     54.7%
W:2.0     230     38%   136/340     47.0%
W:3.0     273     43%    60/308     45.3%
W:6.0     287     44%    53/297     42.7%
cur       290     45%    32/294     26.1%      <- §21.32's lead
§O3 gain(cur vs B)=20.1pts · kept under a 2 m cap=-0.8pts · PHANTOM SHARE 104% · VERDICT FAIL
```
**The gain is not gradual — it appears only when the cap is removed entirely.** Every cap up to 6 m
leaves unroutable in the 42–55% band; lifting it drops to 26.1%. So the entire 20-point advantage
comes from voids **wider than 6 m** — the 25 m and 55 m atrium/facade voids §21.29 measured. Fusing
across one asserts "these two spaces are one walkable room" on the strength of a hole that is not an
aperture. Identical in kind to §21.21's proximity edges and §21.24's phantom shortcuts, and it is the
third time in this lane that a flattering connectivity number turned out to be invented adjacency.
**§21.32's lead is dead. Do not resurrect `cur`.**

**§O1 ATTRIBUTION — where the fusions actually come from.**
```
LTU  total=290  doorVoid=0  hostedOpening=0  unhosted<=2m=133  unhosted>2m=56 (19.3%)
                noVoid (pre-existing gap in the wall extraction)=101
     attributed void width: median=1.20m  p90=3.60m  max=25.80m
Clinic total=30  ALL 30 = noVoid — Clinic's fusions are wall-extraction gaps, not carve-induced.
```
`doorVoid=0` and `hostedOpening=0` are correct, not a bug: a void with a door in it produces a
*doorway* opening (`g.doors` non-empty), which links rather than fuses. Only doorless voids fuse.

**THE REAL RESULT — capping is not excluding, and it is worth a lot.** Tier B throws away every
archway; `cur` throws away the distinction. A width cap keeps the genuine ones: **W:3.0 takes LTU's
stranded rooms from 295/536 to 60/308** — 235 rooms recovered *legitimately*, with unroutable
essentially flat (46.2% → 45.3%). That is a bigger structural win than the phantom 26.1% ever was,
and it survives the test that killed the other.

**DEFAULT SET TO `W:3.0`.** Chosen off the sweep, not invented: p90 of attributed void widths is
3.60 m, and the phantom cliff sits far above it at >6 m. **`W:6.0` (53/297 @ 42.7%) is the aggressive
alternative and it is a USER RULING, not a measurement** — it admits genuinely open-plan thresholds
at the cost of moving nearer the cliff. Flagged, not taken.

**Standing invariants after this section** (all four re-verified at the new default): §T1 fidelity,
§T2 tier-C non-regression, §T4 no-leak, §T5 enclosure retention 100%/100%. §T3 still FAIL — aperture
provenance remains refuted as the stranded cause, now measured three times on three substrates.

**NEXT:**
1. **Re-classify the stranded rooms on the W:3.0 substrate — Clinic 55/208, LTU 60/308** — on causes
   (1) *no door element exists* and (3) *the sealed flood never formed the pocket* ONLY. Cause (2) is
   struck for good. These counts are 4× and 5× smaller than the ones §21.28 sent the last session to
   classify, so the job is now tractable.
2. **The 101 LTU / 30 Clinic `noVoid` fusions are a separate, unexamined class** — gaps in the WALL
   EXTRACTION, not in the carve. On Clinic they are 100% of all fusion. Nothing in §21.20–§21.33 has
   ever looked at them, and they are what the spine is currently built from on a door-only building.
3. Ask the user for the `W:3.0` vs `W:6.0` ruling when the stranded classification needs it; it does
   not block item 1.

### §21.34 STRANDED-ROOM CAUSES — the lane has been counting the wrong thing. 55/60 stranded rooms
### are **11 / 34 independent BREAKS**, and a third of them have no cause anyone has looked for yet.
bim-ootb `review/roompath-redundancy` @ `90a45c6`, pushed. `witness_room_path_stranded_cause.js`,
log `roompath_diagnostics/w_stranded_cause.log`. W:3.0 substrate. Nothing deployed.

```
§SC1                        Clinic 55            LTU 60
 (1) NO DOOR ELEMENT AT ALL     5  (9%)   26m²      16 (27%)  1490m²
 (3) DOOR EXISTS, NO OPENING    1  (2%)   44m²      10 (17%)   982m²
 (-) links ONLY to other stranded 49 (89%) 508m²    34 (57%)  1838m²
 (?) unclassified               0            —       0           —
§SC3 INDEPENDENT BREAKS       11 clusters         34 clusters
     largest cluster          31 regions          22 regions
     mean cluster             5.0                 1.8
```

**FINDING — "N stranded rooms" was never the unit of work.** 89% (Clinic) and 57% (LTU) of stranded
regions have a door AND a working door-opening; those openings just reach other stranded regions.
They are not failures, they are *downstream* of one. Collapsing the stranded subgraph into connected
components gives the honest number: **11 breaks on Clinic, 34 on LTU.** Clinic's largest single break
strands 31 rooms by itself. Every count this lane has quoted — 140/107 (§21.28), 320 (§21.30), 295
(§21.32), 55/60 (§21.33) — over-stated the work by the mean cluster size. **The job is 11 and 34.**

**FINDING 2 — and this one is a gap, not a result. Roots found < clusters, on BOTH fixtures.**
Clinic 6 roots for 11 clusters; LTU 26 for 34. So **5 (Clinic) and 8 (LTU) clusters contain no member
with a missing door and no member with a missing opening** — internally they are fully connected by a
working door graph, and yet nothing reaches the spine. The break is therefore on the cluster
**BOUNDARY**: an opening that should exist between the cluster and the rest of the building, and does
not. **Nothing in §21.20–§21.34 has ever examined a boundary.** Every construction so far has asked
"does this region have a door / an aperture / a link", never "is the link that SHOULD leave this
cluster missing". That is a new class and it is roughly a third of all breaks.

**Cause (2) was not tested here and must not be re-added** — tier B vs tier C moved 295 → 295 across
three substrates (§21.30, §21.32, §21.33). It is settled.

**NEXT — the order is now different from §21.33's, because §SC3 changed what the work IS:**
1. **The rootless clusters first — 5 Clinic / 8 LTU, the unexamined class.** For each, walk its
   boundary cells and ask what separates it from the neighbouring group: solid modelled wall (then it
   is genuinely sealed and the model is right), `SEAL` dilation only (an invented wall — the
   §OPEN-THRESHOLD case, and the fix is known), or a carve that reached nothing. Falsification test
   before the code: if most boundaries are `SEAL`-invented, `SEAL` is the last big structural defect
   in the lane; if most are solid wall, these rooms are correctly unreachable and the remaining
   unroutable figure is a property of the BUILDINGS, not of the engine — which would close the lane's
   core question either way.
2. **Then the 6 + 26 named roots**, which are ordinary: 21 of them are "no door element exists",
   fixable only upstream in extraction, and 11 are "door exists, no opening", which is this lane's.
3. The 101/30 `noVoid` fusions (§21.33 item 2) — still unexamined, still 100% of Clinic's fusion.
4. Funnel residuals (§21.18) LAST, unchanged.

**Method note:** the classifier deliberately carried a third bucket for "links only to other
stranded" instead of forcing every region into cause (1) or (3). Had it not, Clinic would have read
as 55 failures with 49 of them unexplained, and the next session would have hunted a defect that does
not exist in 89% of the cases it was handed.

### §21.35 CLUSTER BOUNDARIES — SEAL is EXONERATED. The break is 9 (Clinic) / 23 (LTU) sealed suites
### that no real building has, and "solid modelled wall" turns out to be a claim about the RASTER.
bim-ootb `review/roompath-redundancy` @ `f60b4e9`, pushed. `witness_room_path_cluster_boundary.js`,
log `roompath_diagnostics/w_cluster_boundary.log`. W:3.0 substrate. Nothing deployed.

```
§CB1 stranded clusters      Clinic 11:  S SEAL-INVENTED=1   W SOLID WALL=10  G EXTRACTION GAP=0
                            LTU    34:  S=0                 W=34             G=0
§CB2 rootless (§21.34)      Clinic  5:  S=1  W=4            LTU 8:  S=0  W=8
§CB4 VERTICAL ACCESS        Clinic  2/11 touch a stair      LTU 11/34
§CB5 sealed AND no stair    Clinic  9/11                    LTU 23/34
```

**FINDING 1 — SEAL is not the culprit, and that was the leading hypothesis.** Exactly **one** cluster
across both fixtures is separated by SEAL-invented wall. §OPEN-THRESHOLD is real (§21.24) but it is
not what strands these rooms. That hypothesis is now closed; do not re-open it on this evidence.

**FINDING 2 — vertical access is real and was never accounted for.** 2/11 (Clinic) and 11/34 (LTU)
stranded clusters touch a stair footprint. **These are not defects at all** — a wing reached by its
own stair is normal, and every per-storey number this lane has ever produced counted them as
failures. Any future "unroutable" figure must exclude them or it is inflated by ~18%/32%.

**FINDING 3 — and this is the one that matters. The remaining 9 and 23 clusters are architecturally
impossible.** They are separated by *solid modelled wall*, they contain no stair, and §21.34 already
established every room in the rootless ones has a working door. Clinic's largest is **31 rooms**.
No real building contains a sealed 31-room suite with no way in. Therefore **"solid modelled wall" is
a statement about the RASTER, not about the building** — a door route exists and the raster does not
carry it. The witness reports §CB3's raw W-majority explicitly SUBORDINATED to §CB5 for this reason:
taken alone, "the separations are real walls" reads as *correctly unreachable* and would have closed
this lane on a false negative.

**Why this is NOT cause (2) resurrected.** Cause (2) was tested at ROOM level — does a given door's
carve pierce its host wall — and refuted three times (295→295). This is a different question at
CLUSTER-BOUNDARY level: a door route exists *somewhere* on the boundary and no opening was detected
along it. The distinction is real: the boundary march only ever sees the wall band between two
pockets, and a door that pierces correctly can still fail to produce a boundary opening if the two
sides land in the same pocket, or if the march's 12-cell reach is shorter than the wall is thick.

**NEXT — one bounded question, and the lane's core answer hangs on it:**
1. **Take Clinic's 31-room cluster, alone, and dump its boundary cell by cell**: for every boundary
   cell, the nearest door, its distance, whether that door's carve intersects the boundary, and what
   the march returned. One cluster, one storey, fully enumerated — no aggregate. The three candidate
   mechanisms above are distinguishable by inspection at that scale, and picking between them by
   further aggregate measurement is what cost §21.23 and §21.26 a session each.
2. Then apply the fix to all 32 and re-run §T1–§T5 + §SC3 + §CB5 as the gate.
3. Remaining, unchanged: §21.33's 101/30 `noVoid` fusions; funnel residuals (§21.18) LAST.

**Method note — the confound nearly closed the lane wrongly.** The first run reported W=10/11 and
W=34/34 with a verdict of "correctly unreachable, the engine is not at fault". That verdict was
false, and only the vertical-access check exposed it as incomplete rather than wrong-in-direction.
A per-storey analysis of a multi-storey building must test for vertical connectivity before it is
allowed to call anything unreachable.

### §21.36 CLINIC'S 31-ROOM CLUSTER, FULLY ENUMERATED — the mechanism is PIERCE DEPTH.
### ⚠ AND IT OVERTURNS "cause (2) is refuted", which §21.30, §21.32 and §21.33 all repeated.
bim-ootb `review/roompath-redundancy` @ `5f01fb5`, pushed. `roompath_diagnostics/cluster31_dump.js`,
log `roompath_diagnostics/w_c31.log`. One cluster, one storey, every boundary crossing listed —
per §21.35's own rule that picking between mechanisms by further aggregate measurement is what cost
§21.23 and §21.26 a session each.
```
§C31 storey=Second Floor  cluster groups=31  area=302m²  doors on this storey=96
     boundary crossings (cluster -> outside)              = 195
     nearest-door distance at crossing: min=0.04m  p10=0.62m  median=2.16m
     crossings with a door within 1.5 m                   = 51/195   without = 144
     enclosed-to-enclosed gap AT those crossings: median=1.40m  max=2.60m
     door pierce depth (6 * RES)                          = 1.20m
     MECHANISM = M3
```
**M1 is out: doors are right there** — the closest sits **0.04 m** from a crossing, 51 crossings have
one within 1.5 m. The IFC is not missing them. **The gap the carve has to cross is wider than the
carve.** Median 1.40 m against a 1.20 m pierce, up to 2.60 m.

**⚠ CORRECTION, and it is mine to own: "cause (2) is REFUTED" is WRONG.** §21.30 concluded it from
tier B vs tier C moving 295 → 295, and §21.32/§21.33 repeated it as settled. That test changed which
SOURCE supplies the aperture rect — `IfcOpeningElement` vs `IfcDoor` bbox — and **both tiers use the
same `pierce = 6 * RES` depth**. Clinic, where this cluster lives, has no openings at all, so B == C
there by construction. **The test could not have detected a pierce-depth failure. Cause (2) was never
tested, let alone refuted.** Strike the refutation from §21.30, §21.32, §21.33 and §21.34; what those
sections actually established is narrower and still true: *aperture PROVENANCE does not matter*.

**Read the 1.40 m carefully before fixing it — it is not wall thickness.** The measurement is the gap
between two ENCLOSED cells, and enclosure is derived from the dilated pre-carve mask, so it includes
`SEAL=2`'s 0.4 m band on BOTH sides. 1.40 m ≈ ~0.2–0.6 m of real wall + 0.8 m of seal. So there are
two candidate fixes and they are not the same:
- **(a) deepen the pierce** so the carve clears wall + 2×SEAL. Cheap, but it cuts more masonry and
  §T5 retention + §21.33's over-linking sweep both have to be re-run as the gate — a deeper carve is
  exactly the direction that manufactured phantom fusions before.
- **(b) lengthen the opening-detection march** so it spans the seal band at thick walls, changing
  nothing about the geometry. Safer, and it cannot over-cut by construction.
**Determine which by measuring `_openings`' march reach against the 2.60 m worst case FIRST** — if the
march already spans it, (a) is the only candidate; if it does not, (b) is the fix and (a) is
unnecessary risk. That is a one-number check and it must precede either change.

**NEXT:**
1. Measure `_openings`' march reach vs the 2.60 m worst case. One number, decides (a) vs (b).
2. Apply the winner, then re-run the FULL gate — §T1–§T5, §O2 sweep, §SC3, §CB5 — not just the
   stranded count. A change to carve depth or march reach touches every one of them.
3. Re-classify with cause (2) BACK on the candidate list, correctly this time.
4. Remaining, unchanged: §21.33's 101/30 `noVoid` fusions; funnel residuals (§21.18) LAST.

**Method note — the enumeration paid for itself immediately.** Four aggregate sections (§21.30–§21.34)
carried a false refutation forward because each inherited it rather than re-deriving it. Dumping 195
crossings of ONE cluster exposed it in a single run. When a conclusion is about a MECHANISM, an
aggregate that does not vary that mechanism cannot test it — and will look like confirmation.

### §21.37 THE ONE NUMBER §21.36 ASKED FOR — `_openings` march reach = **2.00 m**, worst case **2.60 m**.
Read directly from `viewer/lib/room_walker.js` `_openings()` (~line 1092), no run needed:
```
var reach = 6 + SEAL + 2;      // SEAL = 2, RES = 0.20  ->  10 cells  =  2.00 m
§C31 measured enclosed-to-enclosed gap at door crossings:  median 1.40 m   MAX 2.60 m
```
**The march is 0.60 m short of the worst case, and comfortably clears the median.** So §21.36's fix
(b) is confirmed as a REAL shortfall — but only at the tail. It cannot by itself explain a cluster
whose typical crossing is 1.40 m, well inside reach. **Both mechanisms are live and neither is yet
sufficient**, which is exactly why §21.36 said to measure before changing anything.

**RESUME HERE — the next step is one cheap count, then the fix:**
1. **Count how many of §C31's 51 door-adjacent crossings exceed 2.00 m.** `cluster31_dump.js` already
   computes `thick` per crossing — add the histogram, do not re-derive. If most exceed 2.00 m, (b)
   alone closes it. If most are ~1.40 m and inside reach, the march is NOT why they fail and the
   remaining suspect is the carve interacting with `raw` vs the dilated mask — instrument that
   crossing directly (dump the `raw` cells along one 1.40 m crossing that has a door 0.04 m away).
2. Apply the winner, then re-run the FULL gate: §T1–§T5, §O2 sweep, §SC3, §CB5. A change to reach or
   pierce touches every one of them, and a deeper carve is the direction that manufactured phantom
   fusions in §21.33.
3. Cause (2) is BACK on the candidate list (§21.36 correction). Cause classification re-runs after
   the fix, not before.
4. Unchanged: §21.33's 101/30 `noVoid` fusions; funnel residuals (§21.18) LAST.

**State at handoff:** nothing deployed, `common/room_graph.js` and `viewer/navigate_find.js`
byte-unchanged across §21.20–§21.37. Default `voidMode` is `W:3.0`. Worktree `/tmp/wt-roompath` @
`5f01fb5` — REUSE it (`git worktree list` first); it has vanished three times in this lane, and
everything is pushed, so recreate rather than re-derive if it is gone again.

### §21.38 THE HISTOGRAM DECIDES: **PIERCE-limited.** Fix (b) would address 1 crossing of 51.
bim-ootb `review/roompath-redundancy` @ `39d5fbb`, pushed. `roompath_diagnostics/cluster31_dump.js`
(§C37 block), log `roompath_diagnostics/w_c31b.log`. Nothing changed in the engine. Nothing deployed.
```
§C37 door-adjacent crossings (n=51)   reach = 2.00 m   pierce = 1.20 m
     <= 1.20 m  (inside BOTH)                = 17   <- neither mechanism explains these
     1.20–2.00 m (beyond pierce, in reach)   = 33   <- PIERCE-limited: the raster is still SOLID
     >  2.00 m  (beyond reach too)           =  1   <- MARCH-limited as well
§C37 VERDICT = PIERCE
```
**Fix (b) — lengthening `_openings`' march — is now off the table as the primary.** It would recover
exactly **one** crossing. For 33 of 51 the march already reaches; there is simply nothing to find,
because the carve never broke through the wall. §21.37 was right to demand this count before changing
a constant: the safer-looking fix was the wrong one, and the tail statistic (max 2.60 m) had made it
look plausible.

**⚠ The 17 sub-1.20 m crossings are a SECOND, separate defect and must not be swept into the fix.**
Those are inside both limits — the carve should have broken through and the march should have found
it, and neither happened. Whatever is wrong there is not a constant. Do not tune `pierce` until these
are explained, or a deeper carve will paper over them and they will resurface as phantom fusions.

**THE CHANGE, specced but deliberately NOT MADE — it is one constant and a four-witness gate.**
`_rasterizeSpine`, `viewer/lib/room_walker.js` ~line 1009:
```js
var pierce = v[5] ? 6 * RES : RES;      // 1.20 m — insufficient for 33/51 measured crossings
```
Sizing it from the measurement rather than by feel: the crossing spans wall + 2×`SEAL`×`RES`
(= 0.80 m of dilation), so clearing a 0.6 m wall needs ~1.40 m and the observed band tops out at
2.00 m for all but one crossing. **`10 * RES` (2.00 m) is the value the data supports.**

**GATE — mandatory, all four, because a deeper carve is exactly the direction that manufactured
phantom adjacency in §21.33 and dissolved 57% of LTU's floor in §21.30:**
1. `witness_room_path_aperture_tier.js` — §T1–§T5. **§T5 retention must stay 100%/100%.** A deeper
   carve removes more wall; if retention drops, the carve is reaching the envelope and it is wrong.
2. `witness_room_path_overlink.js` — §O2 sweep + §O3. **The phantom share must not rise.** A deeper
   carve widens every aperture's effective footprint and can fuse pockets that a 1.20 m carve kept apart.
3. `witness_room_path_stranded_cause.js` — §SC3. Breaks must FALL from 11/34. This is the point of it.
4. `witness_room_path_cluster_boundary.js` — §CB5. Sealed-suite count must fall from 9/23.
**If (1) or (2) regresses, revert — do not tune the constant to satisfy both.** That trade is the
signal that pierce depth is the wrong lever, and the 17 unexplained crossings are where to look next.

**Why this session stopped here rather than making a one-line change:** the change is trivial, the
gate is four full witness runs, and a constant that lands unverified is worse than one not landed —
§21.30 and §21.33 both caught a plausible-looking change doing structural damage that only the full
gate revealed. Everything needed is committed, measured, and named.

### §21.39 PIERCE DEEPENED TO 10*RES — LANDED, all four gates green. LTU unroutable 45.3% → 18.4%,
### beating the room-graph baseline for the first time in this lane AND surviving the phantom test.
bim-ootb `review/roompath-redundancy`, pushed. Logs `roompath_diagnostics/g1..g4.log`. Not deployed.
```
GATE                        before        after
T5 enclosure retention      100%/100%     100%/100%   PASS (unchanged — the deeper carve does not reach the envelope)
T1/T2/T4                    PASS          PASS
O3 phantom share            104%          20%         PASS — the gain now SURVIVES capping
SC3 independent breaks      11 / 34       9 / 14
CB5 sealed suites            9 / 23       7 /  8
RESULT (W:3.0 default)
LTU    stranded             60/308        18/277      unroutable 45.3% -> 18.4%   [baseline 32.4%]
Clinic stranded             55/208        50/186      unroutable 49.5% -> 49.3%
```
**The O3 result is the important one, not the headline number.** §21.33 measured a 104% phantom
share — the whole connectivity gain rested on 25 m/55 m voids. At 10*RES it is **20%**, and the gain
survives the width cap. Same sweep, same test, opposite verdict: **the missing connectivity was never
about admitting more voids, it was about cutting the real ones deep enough.** §21.33's conclusion
("tier B stands, cap the width") was correct given a 1.20 m pierce and is now superseded by depth.

**Clinic barely moved and that is the open item.** 55 → 50 stranded, 49.5% → 49.3%. Its 31-room
cluster is intact. §21.38 predicted this: 17 of its 51 door-adjacent crossings sit INSIDE both the
1.20 m pierce and the 2.00 m march, so no depth change can reach them. **Those 17 are the next
target and they are a different defect** — the carve should have broken through and the march should
have found it, and neither did.

**NEXT:**
1. **Instrument ONE of Clinic's 17 sub-1.20 m crossings cell by cell** — dump the `raw` mask along it
   with the door's carve rect overlaid. Enumeration, not aggregate (§21.35's rule, which has now paid
   twice). Candidate causes: the door's own bbox is too narrow to span the wall's rasterised width;
   the carve rect is rotated off the crossing line; the two sides land in the SAME pocket so no
   opening is emitted.
2. Re-run the full four-witness gate after any change. It caught nothing this time, which is the
   point of running it.
3. Unchanged: §21.33's 101/30 `noVoid` fusions; funnel residuals (§21.18) LAST.

### §21.40 CLINIC'S RESIDUE IS NEITHER THE CARVE NOR THE DETECTION — the openings are all there.
bim-ootb `review/roompath-redundancy` @ `da4cef1`, pushed. `roompath_diagnostics/clinic17_dump.js`,
logs `w_c40.log` / `w_c40b.log`. Second Floor, the 31-group cluster, 96 doors / 96 door-voids.
```
§C40  crossings inside BOTH limits with a door <=1.5 m  = 48
      Q1 raster CLEAR across the crossing               = 35/48   still blocked = 13
      Q2 covered by a door-void carve rect              = 30/48   not covered   = 18
         both sides in the SAME pocket                  =  0/48
§C40b opening record EXISTS at the crossing             = 42/48   none = 6
         of those: door-matched (LINK) = 42   doorless (FUSION) = 0
         with BOTH ends inside the cluster              =  2
      door width median 1.07 m · gap median 1.40 m · nearest door 0.81 m
```
**Both prior suspects are eliminated by measurement.** The carve reached (35/48 clear channel). The
detection fired (42/48 emitted an opening). **40 of 48 boundary crossings carry a door-matched link
that LEAVES the cluster — and the cluster is still depth −1.** So the failure is not in producing
links. It is in **what those links connect to.**

**PRIME SUSPECT, and it is in this lane's own code, not the data.** `strandedIds` is built with
`area >= 2.0`, so sub-2 m² sliver pockets are stranded but never counted, never clustered, and never
reported. A link that lands on a sliver which itself reaches nothing leaves the cluster *looking*
connected while remaining unreachable. Every stranded count in §21.34–§21.39 inherits that filter.
Note the shape of this: three sections of measurement pointed at geometry and detection, and the
suspect is a threshold in the analysis code — the same class of error as §MULTI-RECT (§21.28's method
note) and the false "cause (2) refuted" (§21.36).

**NEXT — one query answers it, do this before anything else:**
1. **Dump the far-end group of those 40 links: id, area, depth.** If they land on sub-2 m² groups
   with depth −1, the filter is the defect and the fix is to route through slivers (or merge them)
   rather than to touch geometry again. If they land on real groups with real depth, the BFS itself
   is wrong and that is a different, larger problem.
2. Re-run the full four-witness gate after any change (§T1–§T5, §O2, §SC3, §CB5).
3. Unchanged: §21.33's 101/30 `noVoid` fusions; funnel residuals (§21.18) LAST.

**Fixture note (user, 2026-08-02):** Terminal's storeys are Malay — `Aras Tanah`, `Aras 01`–`Aras 04`
— AND it carries a second English convention (`GROUND FLOOR LEVEL`, `03 SECOND FLOOR LEVEL`) in the
same file. It is a federated model with two naming schemes, not a badly-labelled one. Its 33,848
`Unknown`-storey elements (70%) are genuinely unassigned, separately from the language issue. Any
storey matching that assumes one convention will silently mis-file half of it.

### §21.41 ROOT CAUSE — the carved doorway becomes its own pocket and TERMINATES the graph.
bim-ootb `review/roompath-redundancy` @ `2bf79d2`, pushed. `roompath_diagnostics/clinic17_dump.js`
§C40c, log `w_c40c.log`.
```
§C40c far-end groups of links leaving the cluster   = 41
      far-end area < 2.0 m² (SLIVER)                = 39/41   area median = 1.08 m²
      far-end depth −1 (also unreachable)           = 41      depth >= 0 = 0
```
**Every door on the cluster boundary opens into a ~1 m² pocket that is itself unreachable.** The
carved doorway is enclosed floor, and `SEAL`'s band separates it from the rooms on BOTH sides, so it
becomes its own pocket with its own id. The room→doorway opening is emitted; the doorway→far-room one
is not. **The graph terminates inside the doorway.** That is why the cluster has 40 outward links and
is still depth −1, and why deepening the pierce (§21.39) could not help Clinic — a deeper carve makes
a *bigger* doorway pocket, not a connected one.

**§21.40's suspect was wrong and this corrects it.** I blamed `strandedIds`' `area >= 2.0` filter in
the analysis. The ENGINE's own `depth` is −1 for all 41 far ends, so the BFS never reaches them
either. The filter hid them from the *reports*; it did not cause the disconnection.

**THE FIX, and it is provenance-based so it carries no per-building constant** (the standing
requirement — a rule has to hold for any IFC a user imports):
> **A pocket whose cells lie ENTIRELY within carved void footprints is a DOORWAY, not a room.** It
> exists only because the carve created it. Merge it into its neighbours, or emit it as a
> pass-through edge, before grouping.

No area threshold, no width cap, no fixture tuning — the test is *where the cells came from*, which
is known exactly (the carve rects are already computed in `_rasterizeSpine`). It applies to any
building with doors, and on a building whose doorways happen not to form separate pockets it is a
no-op by construction. Contrast §21.33's `W:3.0`, which IS a tuned constant and had to be swept to
justify; this needs no sweep because it asks a provenance question, not a size question.

**Falsification test, before the code:** doorway-provenance pockets must be a large share of Clinic's
sub-2 m² pockets and near-zero of its >10 m² ones. If big rooms are being classified as doorways, the
provenance test is wrong and must not be applied.

**GATE after the change — all five, unchanged:** §T1–§T5 (retention must stay 100%/100%), §O2 sweep
+ §O3 (phantom share must not rise — merging pockets is a fusion, exactly the direction that
manufactures phantom adjacency), §SC3 (breaks must fall from 9/14), §CB5 (sealed suites from 7/8),
and §C40c (far-end slivers must fall from 39/41).

**Chain of causes for this lane, now complete and each one measured, not argued:**
raster had no door voids (§21.26) → carve added, but plugged the enclosure shut (§21.30) → §PRECARVE
→ unhosted voids over-admitted (§21.33) → `W:3.0` → pierce too shallow for 33/51 crossings (§21.38)
→ `10*RES` → **doorway pockets terminate the graph (§21.41)** → provenance merge, next.

### §21.42 START HERE — handoff (written 2026-08-02, session close)
**Read `ROOM_PATHING_SUBSTRATE.md` FIRST** (same folder, new this session). It carries the concept,
the architecture, the settled invariants, every failed trial with what killed it, the four method
rules, how other systems solve this, and a §0 READING MAP indexing all 30 docs in the lane. Then read
§21.29→§21.41 here for the dated detail. **Everything before §21.29 is superseded — do not re-derive it.**

**Setup.** `cd ~/bim-ootb && git worktree list` FIRST — reuse `/tmp/wt-roompath` if it is there. If not:
`GIT_LFS_SKIP_SMUDGE=1 git worktree add /tmp/wt-roompath review/roompath-redundancy`. It has vanished
three times in this lane; everything is pushed, so recreate and continue, never re-derive.

**State.** Nothing deployed. `common/room_graph.js` and `viewer/navigate_find.js` byte-unchanged
across §21.20–§21.42. Defaults now: `voidMode = 'W:3.0'`, `pierce = 10 * RES`.
```
LTU     stranded  18/277   unroutable 18.4%   (room-graph baseline 32.4%)  BEATEN, phantom-tested
Clinic  stranded  50/186   unroutable 49.3%   (baseline 43.3%)             still short
```

**THE ONE THING TO DO NEXT — §21.41's fix, and it needs no constant.**
> A pocket whose cells lie ENTIRELY within carved void footprints is a DOORWAY, not a room. Merge it
> into its neighbours, or emit it as a pass-through edge, before grouping.

Why: 39 of 41 links leaving Clinic's largest stranded cluster end in a ~1 m² pocket that is itself
unreachable. `SEAL`'s band cuts the carved doorway off from the rooms on both sides, so it becomes its
own pocket; room→doorway is emitted, doorway→far-room is not, and the graph dies inside the doorway.
The carve rects are already computed in `_rasterizeSpine`, so the provenance test is free.
**Falsification, write it before the code:** doorway-provenance pockets must be a large share of
Clinic's sub-2 m² pockets and near-zero of its >10 m² ones. If real rooms classify as doorways, the
test is wrong and must not ship.

**THEN — the free win, and it closes a hole the lane has had from day one.** `rel_contained_in_space`
already names **208/606 (LTU) and 98/254 (Clinic)** authored door↔space containments. Clinic has them
despite having zero opening geometry. Use them as a **verification ORACLE**: check our derived
door→room links against the ~300 authored ones. Measure-only, cheap, and it is the first independent
check on link correctness this lane has ever had — see `ROOM_PATHING_SUBSTRATE.md` §11.

**GATE after any substrate change — all five, no exceptions:**
`witness_room_path_aperture_tier.js` (§T1–§T5, retention must stay 100%/100%) ·
`witness_room_path_overlink.js` (§O2 sweep, §O3 phantom share must not rise) ·
`witness_room_path_stranded_cause.js` (§SC3 breaks must fall from 9/14) ·
`witness_room_path_cluster_boundary.js` (§CB5 sealed suites from 7/8) ·
`roompath_diagnostics/clinic17_dump.js` (§C40c far-end slivers from 39/41).
Merging pockets is a FUSION — the direction that manufactured phantom adjacency in §21.33 — so §O3
is the gate that matters most for this particular change.

**Still open, unchanged:** §21.33's 101/30 `noVoid` fusions (gaps in the wall EXTRACTION, never
examined; on Clinic they are 100% of all fusion) · funnel residuals (§21.18) LAST.

### §21.43 THE CARVE IS TRANSPOSED FOR EVERY Y-RUNNING DOOR — and §21.41's fix is withdrawn.
Written 2026-08-02. bim-ootb `review/roompath-redundancy`, probes
`roompath_diagnostics/doorprov{,2,3,4,5,6}.js`, logs `w_dp1.log` `w_dp4.log` `w_dp6.log` `w_dp7.log`
`w_dp8.log` `w_dp8_slack8.log` `w_dp9.log`. **Spec written before the code, per the standing rule.**

**§21.41's fix was falsified before it was written, which is what the falsification test was for.**
The rule ("a pocket whose cells lie ENTIRELY within carved void footprints is a DOORWAY") does
separate cleanly — `§DP1`, 0.0% of >10 m² pockets classify as doorway on BOTH fixtures, against
14.7% (Clinic) / 44.7% (LTU) of sub-2 m² ones — so it would not have swallowed a room. But it does
not REACH the failure it was designed for:
```
§DP4  Clinic Second Floor, the 31-group cluster
      far-end link records = 41   ->   UNIQUE far-end groups = 8
      of those 8: ALL pockets pure-carve = 1    SOME = 0    NONE = 7
```
**§C40c's "41 far ends" were 41 crossing records over 8 groups, not 41 groups.** One of the 8 is
pure-carve. The merge would have moved one group.

**§21.41's ROOT CAUSE is also wrong and is retracted.** It said the graph terminates inside the
doorway because the doorway pocket emits room→doorway but not doorway→far-room. `§DP5` dumps all 8:
every one carries 2–5 openings and every one of those is DOOR-MATCHED. The doorway passes traffic.
What is true is that all their neighbours are depth −1 as well — the whole component is cut off,
which is a different statement.

**Where it is actually cut off (`§DP6`).** Taking the layer-2 graph over ALL groups with no area
filter, Clinic Second Floor is 80 groups in 8 components: spine 35 groups / 440 m², and one
unreachable component of 38 groups / 310 m². It touches the spine component at 54 places — and
`raster CLEAR = 0/54`, gap median 1.40 m, `doors within 1.5 m = 0`. Solid wall the whole way.

**Then the instrument failed, and that is worth recording.** `§DP7`/`§DP8` asked "does a door's own
footprint touch both components", with the engine's own window (half-span + 2 cells). Answer: zero of
96 doors, and 100% of stranded area with no door to the spine — verdict SCOPE LIMIT, "reachable only
vertically". **Re-run at a wider window (`SLACK=8`) the same probe said 23.2%, verdict DETECTION.**
A conclusion that inverts with the width of its own window is not a measurement. An isotropic window
around a door centre is simply the wrong instrument: widen it and it reaches past the neighbour into
a third space. Recorded, not hidden — `w_dp8.log` and `w_dp8_slack8.log` are both committed.

**The instrument that holds (`§DP9`), and the control that licenses it (`§DP10`).** A door does not
connect its surroundings; it connects the space in front to the space behind. So march the panel
NORMAL only, and sweep the reach rather than picking one:
```
                       stranded comps joined to the spine by a door normal
reach   0.60  0.80  1.00  1.20  1.60  2.00  2.40 m
Clinic   0/9   0/9   0/9   0/9   0/9   0/9   0/9      flat zero, 595 m² stranded
LTU     0/14  0/14  0/14  0/14  0/14  2/14  2/14      881 m² of 3231 m² appears at 2.00 m
```
The control is what makes the zero readable: the same march over ALL doors finds two sides enclosed
for only 32–39% (Clinic) / 27–37% (LTU) of them. **The instrument is half blind, so the zero above is
not yet proof of absence** — and chasing that blindness is what found the real defect.

**ROOT CAUSE — `_rasterizeSpine` transposes the carve, and the fixtures store WORLD AABBs.**
```
voids=3167 (LTU) with nonzero rotation IN THE RASTER ARRAY = 0
walls=4979 (LTU) with nonzero rotation IN THE RASTER ARRAY = 0
sql.js column names for "COALESCE(t.rotation_z,0)" = ["storey","center_x","COALESCE(t.rotation_z,0)"]
```
`storeyVoids` and `storeyWallsRot` both select `COALESCE(t.rotation_z,0)` **with no alias**, then read
`r.rotation_z` — which is `undefined`, so `|| 0`. Every wall and every void has entered the raster
axis-aligned since the rotation knob was written. LTU has 2,369 walls and 2,780 openings with real
non-zero `rotation_z` in the DB; none of it ever arrived.

That alone would be the bug, except the bboxes are **world AABBs, which already carry the
orientation**, so dropping rotation is harmless:
```
LTU doors  rot 0/180 -> x-long 261 / y-long   4        walls  1274 / 15
           rot ±90   -> x-long   0 / y-long 341               32 / 1709
```
So the wall stamp — `_stampRect(..., w[3], w[4], w[6]||0, 1)`, bbox_x on x, bbox_y on y — is CORRECT
by accident: two bugs that cancel. The void carve is not:
```js
var lng = Math.max(v[2], v[3]), thin = Math.min(v[2], v[3]);
_stampRect(blocked, ext, v[0], v[1], lng + 2*RES, thin + pierce, v[4] || 0, 0);
```
`max`/`min` throws the axes away and re-stamps the void **long-along-world-x, always**. For every
door whose bbox is longer in Y the carve is rotated 90°: it cuts a 2 m slot ALONG the wall face and
pierces the wall by one door-width instead of cutting THROUGH it. That is **118/254 doors on Clinic
(46%) and 345/606 on LTU (57%)** — and it is exactly `§DP6`'s "54 contacts, raster CLEAR = 0".

**THE FIX — one line, no constant, each void's own measured bbox decides its own axes:**
```js
var pierce = v[5] ? 10 * RES : RES;
var xLong = v[2] >= v[3];
_stampRect(blocked, ext, v[0], v[1],
  xLong ? v[2] + 2 * RES : v[2] + pierce,
  xLong ? v[3] + pierce : v[3] + 2 * RES, v[4] || 0, 0);
```
Identical output wherever `bbox_x >= bbox_y`, so half the fleet is unchanged by construction.

**LANDMINE, do not "fix" the alias.** Aliasing `rotation_z` would start applying rotation to a WORLD
AABB — double-counting the orientation and rotating every wall in the building. If the alias is ever
repaired, the bbox must be re-read as a local extent in the same commit. Left explicit in the code.

**PREDICTION, written before the run** (this is what the gates test):
1. `§DP10` control — doors with both sides enclosed must RISE well above 32%/27%; a transposed carve
   is precisely what stops the far side being enclosed.
2. Stranded area must FALL on both fixtures.
3. `§O3` phantom share must NOT rise. A correctly-oriented carve cuts a NARROWER hole than a 2 m
   slot along the wall face, so if anything it should fall — if it rises, the fix is wrong.
4. `§T1–§T5` retention stays 100%/100%.

### §21.43b RESULT — the fix is CORRECT and it makes every metric WORSE. Withdrawn, patch kept.
Same session. Baseline and fix measured back-to-back on the same machine and fixtures; logs
`roompath_diagnostics/w_*_base.log` vs `w_*_after.log` (`*.log` is gitignored — every probe is
deterministic, re-run it to regenerate), patch preserved as
`roompath_diagnostics/patch_21_43_transpose.diff` (37 lines). **Working tree is back at baseline —
`common/room_graph.js` and `viewer/*.js` are byte-unchanged across §21.20–§21.43, still.**

```
gate                          baseline          with the transpose fix     direction
Clinic unroutable             49.3% (50/186)    50.4% (53/184)             worse  +1.1pt
LTU  unroutable (cur)         16.4% (15/263)    18.8% (17/261)             worse  +2.4pt
LTU  unroutable (W:3.0, live) 18.4% (18/277)    23.0% (26/276)             worse  +4.6pt
§O3  LTU phantom share        20%  PASS         94%  FAIL                  DECISIVE
§SC3 breaks Clinic / LTU      9 / 14            10 / 19                    worse
§CB5 sealed suites Clinic     7/9               8/10                       worse
§T5  retention                100% / 100%       100% / 100%                unchanged PASS
§DP10 control, both sides     32-39% / 27-37%   32-39% / 27-37%            UNMOVED
```
Predictions 1–3 from §21.43 all FAILED; prediction 4 (retention) held. Under the standing rule a
change that fails its own stated prediction does not ship, so it did not.

**What the failure MEANS, and it is not comfortable.** The transpose is a real geometric error — 46%
of Clinic's doors and 57% of LTU's are carved 90° wrong, that part is not in doubt. Fixing it makes
routing worse because the wrong carve was doing useful work by accident: stamping the void
long-along-x cuts a ~2 m slot ALONG the wall face, removing far more wall than a correct carve, and
the extra removal is what was merging pockets. The correct carve removes less wall (Clinic wall
779 m² -> 793 m² left standing), fewer pockets merge, more rooms strand.

**Therefore the tuned stack sits on top of the geometric error.** `W:3.0` (§21.33) and `pierce =
10*RES` (§21.38/§21.39) were both swept and fitted against the TRANSPOSED carve. §O3's "20%, the gain
is genuine archways, not giant voids" is measured on it too — and on the corrected geometry that same
gate reads 94% FAIL. The honest reading: **the current 18.4% LTU number is not a clean win over the
32.4% room-graph baseline; part of it is bought by a carve that removes wall it should not remove.**

**NEXT — re-sweep, do not re-tune by hand.** Apply `patch_21_43_transpose.diff`, then re-run §21.33's
width sweep and §21.38's pierce sweep TOGETHER on the corrected geometry; both constants are
entangled with the axis error and neither is meaningful until the axes are right. Only then is the
§O3 phantom number interpretable. If the corrected geometry cannot reach 18.4% at any (W, pierce),
that is the real answer about this substrate and the lane should say so plainly.

### §21.44 START HERE — handoff (written 2026-08-02, session close)
**Read `ROOM_PATHING_SUBSTRATE.md` first, then §21.29→§21.43b here.** Everything before §21.29 is
superseded. Setup unchanged: `cd ~/bim-ootb && git worktree list` FIRST, reuse `/tmp/wt-roompath`.

**State.** Nothing deployed, nothing shipped, engine byte-unchanged. Defaults still `voidMode='W:3.0'`,
`pierce = 10*RES`. Baseline numbers reproduce exactly (Clinic 49.3%, LTU 18.4% at W:3.0).

**Three things this session settled, so none of them get re-derived:**
1. §21.41's doorway-merge fix — falsified before coding. Separates cleanly (0.0% of >10 m² pockets
   misclassify) but reaches 1 of 8 far-end groups. **Do not implement it.**
2. §21.41's root cause — retracted. Doorway pockets carry 2–5 door-matched openings each; the graph
   does not terminate in them.
3. §21.42's "free win" oracle — **retracted, it is circular.** `rel_contained_in_space` is written by
   our own `scripts/compile_rooms.py:1295` (`DELETE ... WHERE space_guid LIKE 'RM_%'` then re-insert
   by point-in-rect). 100% of the IfcSpace rows in both fixtures are `RM_*`-guid, `≈`-prefixed
   compiled rooms, and every door names exactly ONE space (98/98 Clinic, 208/208 LTU) so it cannot
   express an adjacency even in principle. **This lane still has NO independent oracle.**

**THE ONE THING TO DO NEXT:** the joint (W, pierce) re-sweep on the corrected axes, per §21.43b.
**It has its own worker prompt — `RESUME_ROOMPATH_AXIS_RESWEEP.md` (same folder)**, written for a
Fable-class execution session: setup, the 36-cell matrix, the five-gate acceptance, and an explicit
stop condition (if no cell reaches 18.4% with §O3 PASS, that is the answer — do not invent a third
constant). That file is the one the worker updates; this log stays the lane's spec of record.
