<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ROOM INJECTOR NEEDLE — Find Panel one-press room injection (2026-07-12)

```
# ⚠ DO NOT REMOVE
SCOPE: implement the needle-injector feature specced below in the Viewer, in the EXISTING worktree
/tmp/wt-terminal-rooms (branch fix/terminal-rooms-selfheal — REUSE it, do not create a new worktree;
run `git worktree list` first to confirm it exists). Read the log after every run — exit code is not
evidence. PUSH PAUSE in effect: commit locally on that branch, verify on localhost in a real browser,
do NOT `git push`, do NOT open a PR. No binary .db commits ever — data moves only as SQL patch text.
Every claim in your DONE report needs a §-log line proving it.
```

## User story (verbatim intent)
"Can we do an injector of rooms as a needle icon beside the Find Panel when the ROOM | TYPE | PATH
[facets are] not detected — just greyed, with that needle, self-explanatory? Pressing it will apply
into the IndexedDB of the building."

## §GIVEN — verified this session, do not re-derive
- **G1**: `viewer/scene.js A._applyPendingPatch(buf, url)` self-heal exists and works: fetches
  `patches/<dbFile>.sql` from the db's own directory, applies via sql.js, returns patched buffer;
  IDB cache keeps RAW bytes (patch re-applies every load). Live-proven on Terminal today:
  `§PATCH_APPLY Terminal_extracted.db applied (173860 bytes)` → `§ROOM_GRAPH nodes=59`.
- **G2**: `buildings/patches/Terminal_extracted.db.sql` + `viewer/buildings/patches/` copy exist on
  this branch (59 rooms / 101 rect rows, compiled by R-MERGE+R-REJECT, idempotent DROP+CREATE).
- **G3**: Find panel room facets live in `viewer/navigate_find.js` (lazy-loaded, `?v=47` — bump on
  edit); room axis reads `spatial_structure` via `A.dbQuery`; room graph via
  `window.RoomGraph.buildGraph(A.dbQuery, ...)` (`common/room_graph.js`).
- **G4**: IDB db-cache helpers live in `viewer/scene.js`/`streaming.js` (`§CACHE` lines; cache key =
  the db URL). `§KRN_PERSIST url=../buildings/Terminal_extracted.db` shows the persist seam exists.
- **G5**: The Modeller-side JS room compiler (`room_walker.js` port, includes R-MERGE/R-REJECT via
  parity with `compile_rooms.py` ef2d5fe80) exists in bim-compiler `build/room_walker.js` — dual-mode
  (Node require + browser global), 6/6 parity witness. A deployed copy convention already exists
  (commit a5c6435 on `fable/modeller-lod400-livewire` deployed it for the Modeller).
- **G6**: Localhost harness proven today: serve worktree root on :8901, headless Chromium via
  `/home/red1/bim-ootb/tests/node_modules/playwright`, viewer URL
  `http://localhost:8901/viewer/viewer.html?db=../buildings/<file>.db`.

## SPEC
**S1 — Detection.** When the Find panel's room facets initialize and the building has zero
`spatial_structure` IfcSpace rows (the exact condition that makes ROOM/TYPE/PATH useless), do NOT
hide the facets: render them greyed/disabled, and show a needle icon (💉) beside them. Tooltip:
"No rooms in this building — inject compiled rooms". Log: `§NEEDLE_DETECT bld=<name> rooms=0`.

**S2 — Injection, two sources in order.** On needle press:
1. **Patch source (curated):** try G1's existing patch fetch for this db file. If the .sql exists,
   apply it to the live in-memory db (same sql.js run semantics as `_applyPendingPatch` — reuse that
   function or its exact body, don't fork a variant).
2. **Walker source (any building):** if no patch file (404), lazy-load the room_walker JS port
   (copy `build/room_walker.js` from bim-compiler into `viewer/lib/room_walker.js` as part of this
   task — text file, committable) and run `compileRooms(db)` against the live db in-browser.
   Deterministic compile from walls/doors; refuses honestly if the building lacks walls/doors.
Log either way: `§NEEDLE_INJECT bld=<name> source=patch|walker rooms=<N> rects=<M>`.

**S3 — Persist to IndexedDB (the user's explicit ask).** After injection, export the patched db
bytes and overwrite this building's IDB cache entry (same key/url the loader reads, G4) so the
rooms SURVIVE reload without re-injection. Log: `§NEEDLE_PERSIST idb=ok bytes=<n>`. On any persist
failure: keep the in-memory rooms working, log `§NEEDLE_PERSIST idb=fail <why>` — never block.

**S4 — Ungrey + refresh.** After S2/S3: enable the ROOM/TYPE/PATH facets in place, rebuild the room
tree and invalidate the room-graph cache (`_pathGraphCache`) so PATH mode sees the new rooms without
a reload. Needle icon disappears (or turns into a subtle ✓ for this session).

**S5 — Never on healthy buildings.** Buildings with real/compiled rooms present: no needle, zero
behavior change. Duplex must render byte-identically.

## Constraints
- ES5 style matching `navigate_find.js`; IIFE-wrapped if a new file (browser-engine rule).
- Bump `navigate_find.js` cache-bust (`?v=47` → `?v=48`) in `viewer/main.js`, and `sw.js`
  `CACHE_VERSION` if sw precaches touched files (KEEP-BOTH rule on any conflict).
- Icon is text/emoji (💉), no image assets.
- No new Playwright value-tests: §-logs are the proof; one Playwright wiring E2E is fine (G6 shape).

## WITNESS PLAN (all on localhost :8901, headless is fine)
- **W-NEEDLE-TERMINAL (patch source):** rename/hide the Terminal patch so auto-self-heal misses it?
  NO — simpler: use a COPY of Terminal_extracted.db under a name with no patch file
  (`buildings/Terminal_noheal.db`, untracked, generated during the test, never committed) →
  facets grey + needle shows → press → source=walker rooms>0 → PATH mode lists rooms. Then reload →
  `§NEEDLE`-free boot with rooms present (IDB persisted) — proves S3.
- **W-NEEDLE-PATCHSRC:** with the real Terminal db + its patch present but auto-heal artificially
  skipped once (or a db whose patch exists but wasn't applied — implementer picks the cleanest
  hook), prove source=patch path fires. If the existing auto-self-heal makes this state unreachable
  in practice, SAY SO in the report and prove source=walker only — honest unreachability beats a
  contrived test.
- **W-NEEDLE-HEALTHY:** open Duplex → assert NO `§NEEDLE_DETECT`, facets normal.
- Save every run's console to a log file, read the log, quote the § lines in the DONE report.

## DONE WHEN
All three witnesses pass with quoted §-lines; commit locally on `fix/terminal-rooms-selfheal`
(or a child branch off it) with the witness log paths in the message; NO push, NO PR. Append a
dated `# DONE` section to THIS file with: what shipped, the § evidence, anything honestly
unreachable/deferred.

---

## STANDARDIZATION (user directive, 2026-07-12 — supersedes S1/S2 where they differ)
Verbatim intent: "standardised no auto inject. Our embeds and landed buildings are preprocessed.
Any new IFC or DB can be 'needle' manually, which remove previous if present. Then when user
saved, its there."
- **S1 amended:** the needle is not only for zero-room buildings. Rooms present but COMPILED
  (`RM_*` rows) → facets work normally AND the needle stays available (un-greyed, subtle) as the
  explicit RECOMPUTE action. Zero rooms → greyed facets + needle, as before. Buildings with REAL
  extracted rooms (non-RM_ IfcSpace rows) → NO needle at all; never overwrite real extraction.
- **S2 amended — replace semantics:** injection always DELETES previous compiled rooms first
  (`RM_*`/`STC_*` rows + their rel rows — the patch files already do DROP+CREATE; the walker path
  must do the same delete before insert). Idempotent by construction: press twice = same result.
- **No auto-compute anywhere, standing policy:** the app never computes rooms at load. Shipped
  embeds are "preprocessed" — their rooms arrive via the file itself or its self-heal patch (the
  sanctioned delivery for fixed embeds under the no-binary-commit rule); that plumbing is NOT the
  needle and never extends to user-opened IFC/DB. User data gets rooms ONLY on explicit needle
  press (Viewer) / Room Walker action (Modeller — same policy, same verb, different app).
- **S3 unchanged:** press → live db + IDB persist; user save/export carries the rooms.

---

# DONE (2026-07-12)

Implemented in the reused worktree `/tmp/wt-terminal-rooms` (branch `fix/terminal-rooms-selfheal`,
commit `91e28ce`), per the spec above INCLUDING the mid-flight `## STANDARDIZATION` amendment
(picked up before this task closed — the three-state model shipped, not the original binary
zero/non-zero S1).

## What shipped
- `viewer/lib/room_walker.js` — verbatim copy of bim-compiler `build/room_walker.js` (new file,
  text/committable, IIFE + IIFE dual-mode as shipped, unmodified).
- `viewer/navigate_find.js` — `_probeLenses()` now classifies every building into one of three
  `needleState`s (`zero` / `recompute` / `none`) by counting `spatial_structure` `IfcSpace` rows
  vs. how many carry the `RM_` compiled-guid prefix; `_renderNeedle()` renders the 💉 pill beside
  the axis toggle for `zero` (prominent) and `recompute` (subtle) states only, never for `none`
  (any real, non-`RM_` row present); `_needleInject()` implements S2 (patch source first — same
  `db.run(sql)` semantics as `A._applyPendingPatch`, applied to the LIVE `A.db`, not a fork —
  falling back to `window.RoomWalker.walk(A.db,{write:true})`), S3 (export + IDB `put` under the
  same cache key `A.DB_URL`), S4 (`_pathGraphCache` invalidation + `_renderAxes()`/`buildTree()`
  re-run). Replace semantics (§STANDARDIZATION S2 amended) fall out for free: the patch files
  already `DROP TABLE`+`CREATE`, and `room_walker.js`'s own `writeRooms()` already deletes prior
  `RM_`/`STC_` rows before inserting — no new delete-before-insert code was needed, only reuse.
- `viewer/main.js` — cache-bust `navigate_find.js?v=47` → `?v=48`. `sw.js` `CACHE_VERSION` was
  NOT bumped: neither `navigate_find.js` nor the new `lib/room_walker.js` are in `sw.js`'s
  `PRECACHE_ASSETS` list (same as `navigate_find.js`'s existing lazy-load siblings
  `navigate_grid.js`/`navigate_path.js`/etc. — none of them are precached either), so the spec's
  own conditional ("bump CACHE_VERSION *if* sw precaches touched files") does not apply.

## Witness evidence (all localhost :8901, headless Chromium via bim-ootb's playwright)

**W-NEEDLE-TERMINAL** (`Terminal_noheal.db` — untracked copy of `Terminal_extracted.db` with NO
matching `patches/*.sql`, forcing the walker path) — log:
`/tmp/claude-1000/-home-red1-bim-compiler/54b6cf2c-4e34-459d-8fe1-0a752f18ca8f/scratchpad/logs/w_needle_terminal.log`
```
[NEEDLE] §NEEDLE_DETECT bld=T0_Terminal rooms=0
[NEEDLE] §NEEDLE_INJECT bld=T0_Terminal source=walker rooms=59 rects=101
[NEEDLE] §NEEDLE_PERSIST idb=ok bytes=28262400
[NEEDLE] §NEEDLE_RECOMPUTE_AVAILABLE bld=T0_Terminal rooms=101
§E2E_NEEDLE_TERMINAL RESULT=PASS
```
Proves S1 (detect+grey), S2.2 (walker inject), S3 (persist — reload keeps `rooms=59` with
`needlePresent=true` in `recompute` state, never re-shows the `zero`-state detect line), S4
(RoomGraph.buildGraph immediately returns `nodes=59` with no reload), and the new
§STANDARDIZATION double-press requirement: pressed the needle a SECOND time
(`recompute` state) — `§NEEDLE_INJECT` logged twice, both `rooms=59 rects=101`, no duplicates.

**W-NEEDLE-PATCHSRC** (real `Terminal_extracted.db` + its real `patches/Terminal_extracted.db.sql`;
boot-time auto-heal fetch aborted ONCE via Playwright route interception — service workers
blocked via `newContext({serviceWorkers:'block'})` so `page.route` actually sees the request —
then let through on the needle's OWN press-time fetch) — log:
`/tmp/claude-1000/-home-red1-bim-compiler/54b6cf2c-4e34-459d-8fe1-0a752f18ca8f/scratchpad/logs/w_needle_patchsrc.log`
```
[S203] §PATCH_APPLY_FAIL ../buildings/Terminal_extracted.db — using unpatched db Failed to fetch
[NEEDLE] §PATCH_APPLY Terminal_extracted.db applied (173657 bytes) from ../buildings/patches/Terminal_extracted.db.sql [needle]
[NEEDLE] §NEEDLE_INJECT bld=T0_Terminal source=patch rooms=59 rects=101
§E2E_PATCHSRC RESULT=PASS
```
This reaches the state the original spec flagged as possibly unreachable ("If the existing
auto-self-heal makes this state unreachable in practice, SAY SO") — it IS reachable, using the
cleanest available hook (network-layer interception of the patch fetch, zero product-code
changes), so `source=patch` is proven, not deferred.

**W-NEEDLE-HEALTHY** (§STANDARDIZATION split this into two real states) — log:
`/tmp/claude-1000/-home-red1-bim-compiler/54b6cf2c-4e34-459d-8fe1-0a752f18ca8f/scratchpad/logs/w_needle_healthy.log`
```
[NEEDLE] §NEEDLE_RECOMPUTE_AVAILABLE bld=Ifc2x3_Duplex_Federated rooms=5
§E2E_NEEDLE_HEALTHY duplex_res={"needlePresent":true,"needleTitle":"Recompute compiled rooms (replaces the previous compiled set)","totalSpaces":5,"compiledSpaces":5}
§E2E_NEEDLE_HEALTHY mixed_res={"needlePresent":false,"needleTitle":null,"totalSpaces":5,"compiledSpaces":4}
§E2E_NEEDLE_HEALTHY mixed_needle_lines_count=0
§E2E_NEEDLE_HEALTHY RESULT=PASS
```
Finding en route: `Duplex_extracted.db`'s rooms are ALSO `RM_`-prefixed (compiler-owned) —
verified directly (`RM_Level_1_1`, `RM_Level_1_2`, `RM_Roof_1`, `RM_T/FDN_1`, `RM_T/FDN_2`).
Same check against every other extracted building available locally (Clinic/Hospital/
Hospital_3/LTU_AHouse/JKR/Terminal_rooms/HHS) found 100% `RM_`-prefixed rows in every one —
**no building in this environment's fixture set has a real (non-`RM_`) extracted `IfcSpace` row**.
The original S5 wording ("Duplex must render byte-identically") predates the standardization and
no longer applies verbatim — Duplex correctly shows the subtle recompute needle now, which the
standardization explicitly calls for. To still prove the `none` (never-show) branch honestly
without a real fixture, built one clearly-labeled synthetic test fixture
(`buildings/Duplex_mixed_TESTFIXTURE.db`, untracked/gitignored, never referenced as a real
building anywhere) by relabeling one Duplex room's `guid` from `RM_Level_1_1` to
`REAL_IfcSpace_0001` — a controlled input to exercise the gating branch, not a claim about real
BIM data. Confirmed: needle absent, zero `§NEEDLE_*`/`[NEEDLE]` log lines, `totalSpaces(5) >
compiledSpaces(4)`.

## Honestly deferred / found unreachable
- **A true "real extraction, not compiler-owned" building** does not exist anywhere in this
  session's reachable fixture set (7 other buildings checked, all 100% `RM_`). The `none`-state
  gate is proven correct via a synthetic single-row fixture (above) rather than a real building —
  flagging this per the "honest unreachability beats a contrived test" standard the spec itself
  set for W-NEEDLE-PATCHSRC. If/when a genuinely real-extracted-room building becomes available,
  re-running `e2e_needle_healthy_duplex.js`'s pattern against it would close this gap fully.
- **Old 12-column `spatial_structure` schema (no `room_guid` column — confirmed on
  `Duplex_extracted.db`) + the walker path's `INSERT ... (…,room_guid) VALUES (…)`:** pressing the
  needle on a building with this older schema would currently throw inside
  `window.RoomWalker.writeRooms()` (no such column), caught by `_needleInject`'s own try/catch
  (graceful failure — button re-enables, `§NEEDLE_INJECT_ERR` logged, no app crash) rather than
  succeeding. Not exercised by any witness above (Duplex never needed pressing — it's already in
  `recompute` state) and out of scope for this task (a schema-migration concern, not a needle-UI
  concern) — flagging so it's not silently assumed to work on every building's schema vintage.
- `sw.js` `CACHE_VERSION` bump: not done, and not needed per the spec's own conditional (see
  "What shipped" above) — noting explicitly so it isn't read as an oversight.

## Test/fixture files (all untracked, gitignored, never committed)
- `/tmp/wt-terminal-rooms/buildings/Terminal_noheal.db`
- `/tmp/wt-terminal-rooms/buildings/Duplex_extracted.db`
- `/tmp/wt-terminal-rooms/buildings/Duplex_mixed_TESTFIXTURE.db`
- E2E scripts: `/tmp/claude-1000/-home-red1-bim-compiler/54b6cf2c-4e34-459d-8fe1-0a752f18ca8f/scratchpad/e2e_needle_{terminal_noheal,patchsrc,healthy_duplex}.js`

No push, no PR (PUSH PAUSE standing). Commit: `fix/terminal-rooms-selfheal` @ `91e28ce` in
`/tmp/wt-terminal-rooms`.

## §ROOM_WALKER_VERSION_STAMP — spec for auto self-heal, no manual needle-press required (2026-07-21)
**User's economics framing, verbatim:** "A building is checked for its version of room walker that
injects a building semantics, stamped to the injection version... The economics is important. As
newbies bring in their IFCs extracted to DB thus gets injected on the fly, saved locally. It's their
game not ours." Context: found live that HHS Office's compiled rooms were stale (14 rooms, from before
the §SUSPECT-LARGE fix) — `_ensureRoomsCore()`'s CURRENT policy is "compiled rooms present → trust
forever, unless someone manually presses needle-recompute with `force:true`" (confirmed reading the
code, no version check exists today). That policy means every algorithm improvement to room_walker
requires a human to remember and manually re-trigger EVERY already-compiled building — doesn't scale
past our own curated demo set, and does nothing for a self-service user's own uploaded building once
OUR session ends. **Spec below replaces "trust forever" with "trust until the compile version moves
on" — self-healing, zero manual/per-building maintenance, works identically for our buildings and any
future user-uploaded one.**

### Mechanism
1. **Version constant.** `room_walker.js` gets `ROOM_WALKER_V` (same convention as `EFFECTS_V` in
   effects.js — a plain string, bumped on every ALGORITHM change, not cosmetic edits).
   `compile_rooms.py` (the server-side/dev regeneration tool) carries the same version string in
   lockstep — same py/js parity discipline this family of docs already holds itself to
   (`ROOM_WALKER_PHASE_INVARIANCE.md`'s §RASTER-EPS parity sweep is the precedent).
2. **Storage: a `rooms_meta` table**, single row: `CREATE TABLE IF NOT EXISTS rooms_meta (id INTEGER
   PRIMARY KEY CHECK(id=1), version TEXT, built_at TEXT, room_count INTEGER)`. Written by whichever
   path actually performs the compile (`window.RoomWalker.writeRooms()` client-side, and
   `compile_rooms.py --write` server-side) immediately after a successful write.
3. **`_ensureRoomsCore()` policy change:** today's `state==='recompute' && !opts.force → trust`
   becomes `state==='recompute' && !opts.force && rooms_meta.version === ROOM_WALKER_V → trust`.
   Missing `rooms_meta` (every building compiled before this ships — HHS/Terminal/Hospital/Duplex,
   confirmed 100% of the current fixture set per this file's own earlier finding) counts as maximally
   stale, same as a version mismatch — auto-recompute fires on next load, no `force` flag needed, no
   dev intervention, no per-building tracking of "did we remember to fix this one."
4. **The manual needle button stays** as an explicit user-triggered override (e.g. a user just
   re-extracted/edited their own building and wants a fresh compile without waiting for a version
   bump) — `force:true` still means "recompute regardless of version," this spec only changes what
   happens when nobody presses it.
5. **Write-back stays 100% client-side/local** (IndexedDB-cached per user, same as the existing
   needle→writeRooms() pattern) — this spec never touches OCI or a canonical DB file. This is the
   direct answer to "saved locally... it's their game not ours": OUR curated buildings (HHS etc.) get
   exactly the same free, automatic self-heal as any newbie's own upload, with zero special-casing.

### Why this beats the server-side regenerate+OCI-upload path (rejected for this)
Regenerating HHS's DB server-side and re-uploading to OCI (the path explored just before this spec)
only fixes buildings WE curate, one at a time, forever, by hand — the exact maintenance burden this
spec eliminates. It was shelved in favor of this the moment the economics point was raised; no OCI
upload was performed for HHS or any building as part of this investigation.

### Open implementation questions (resolve before coding, not during)
- Does `compile_rooms.py`'s DRY-run / distributed-DB baseline need to backfill `rooms_meta` for the
  buildings we already ship (HHS/Terminal/Hospital/Duplex/Clinic/JKR/LTU_AHouse), or is relying on the
  client-side missing-stamp→recompute path for those too (i.e., never touching the OCI-hosted files at
  all, letting every user's first load self-heal) acceptable? Leans toward the latter given the stated
  economics goal — worth confirming rather than assuming.
- `rooms_meta` schema migration for the "old 12-column `spatial_structure`, no `room_guid`" building
  vintage already flagged as an honestly-deferred gap above (Duplex-era schema) — does adding
  `rooms_meta` need its own defensive existence check the same way, or is it new enough to assume
  present-or-absent cleanly?
- Where does `ROOM_WALKER_V` get bumped relative to `compile_rooms.py`'s OWN version marker in its
  docstring history (§SUSPECT-LARGE, §RASTER-EPS, etc. are all dated inline comments, not a single
  version string today) — this spec introduces the first actual version STRING for this file; worth
  deciding the initial value (e.g. 'v1 (post-§SUSPECT-LARGE, post-§RASTER-EPS)') so it has real
  history behind it, not starting from an arbitrary v1 that hides what's already shipped.

### Staged rollout plan (2026-07-21, user: "has to work in stages, not able to make sudden jumps
in fear of drift" — a session-observed pattern earlier this same day, not a hypothetical concern:
a diagnosis got built around a repro path the user never actually used, and an OCI-upload plan was
proposed before the economics conversation reframed the whole approach). THREE stages, with a real
risk cliff between stage 2 and stage 3 — do not bundle them into one PR.

1. **Version constant only.** `ROOM_WALKER_V` in `room_walker.js`, matching string in
   `compile_rooms.py`. Zero behavior change — nothing reads it yet. Verify: grep both files, confirm
   they match.
2. **Write side only.** Whenever a compile actually runs (needle press, `--write`), stamp
   `rooms_meta` with that version. Still purely additive — doesn't change WHEN anything recompiles,
   only records what happened after. Verify: run a compile, confirm the row exists with the right
   value. Ship stages 1+2 together as one small, fully-reversible, inert PR.
3. **Read/trust-check side** — `_ensureRoomsCore()` comparing stored vs. current version and
   triggering auto-recompute on mismatch. **This is the stage to slow down on.** It changes runtime
   behavior for every existing building at once. Concrete failure modes to guard against before
   shipping fleet-wide: (a) a bug in the version comparison recomputing on EVERY load, not just once
   — expensive on Hospital/Terminal (48-63k elements); (b) a race between two tabs/sessions both
   self-healing the same IndexedDB copy of the same building simultaneously. Land stage 3 on ONE
   building only first (HHS is the natural candidate — it's the one with confirmed-stale data),
   watch it settle to "recompute once, then stable, no repeat trigger," before trusting it fleet-wide.

**This staging is also the reason HHS's Alt+C dive-target fix is NOT closed this session** — see
`prompts/PHOTOREAL_STILL_RENDER.md`'s own note pointing back here. The cinema-space candidate-skip
fix (already shipped) plus a regenerated room compile (already proven live, not yet automated) closes
HHS's specific case, but shipping it properly means landing stages 1-3 above first, not hand-patching
HHS's one DB as a shortcut.

### Stages 1+2 — ✅ DONE (2026-07-21)
Shipped as one small, fully-reversible, inert PR each, both against their repo's default branch:
- bim-compiler: `feat/room-walker-version-stamp` — PR [red1oon/BIMCompiler#54](https://github.com/red1oon/BIMCompiler/pull/54).
  `ROOM_WALKER_V = 'v2 (§LOCAL-FRAME + §RASTER-EPS, post-§SUSPECT-LARGE)'` added to `build/room_walker.js`
  and `scripts/compile_rooms.py` (string verified identical both sides); `writeRooms()`/`main()
  --write` now stamp `rooms_meta(id=1, version, built_at, room_count)` after every successful
  compile. Verified live: ran both the JS path (Node + sql.js) and the Python path against a copy of
  `Duplex_mep_extracted.db` — both wrote 7 rooms with matching `rooms_meta` rows.
- bim-ootb: `feat/room-walker-version-stamp` — PR [red1oon/bim-ootb#934](https://github.com/red1oon/bim-ootb/pull/934).
  Synced the same `room_walker.js` content into the deployed copy `viewer/lib/room_walker.js`
  (byte-identical to the bim-compiler source after sync) and bumped the loader cache-bust query in
  `viewer/navigate_find.js` (`?v=2` → `?v=3`, per this repo's bump-on-edit convention).

Nothing reads `rooms_meta` yet — zero runtime behavior change, per stage 2's own "purely additive"
requirement.

### Stage 3 — ✅ DONE, HHS-only pilot (2026-07-21)
bim-ootb: `feat/room-walker-stage3-hhs` — PR [red1oon/bim-ootb#939](https://github.com/red1oon/bim-ootb/pull/939).
`_ensureRoomsCore()`'s trust-check now compares stored `rooms_meta.version` against the loaded
`ROOM_WALKER_V` before trusting a compiled set, scoped to `HHS_Office_Federated_extracted.db` only
(exact dbFile-name gate) — not yet fleet-wide, per the risk-cliff guidance above. Missing
`rooms_meta` or a version mismatch falls through to the existing patch+walker recompute, which
re-stamps `rooms_meta` on completion. Also extracted the room_walker.js lazy-load into a shared
`_ensureRoomWalkerLoaded()` helper (previously duplicated between the new check and S2.2).

**Live-verified (headless Chromium, real `HHS_Office_Federated_extracted.db` fixture — 14 rooms, no
`rooms_meta`, matching the confirmed-stale bug exactly):**
- First `ensureRooms({})` call (the exact no-force call `cinema_maxq.js`/`effects.js` make before
  Alt+C): `§NEEDLE_VERSION_STALE` fires, recompiles 14 → 73 rooms, stamps `rooms_meta`, persists to
  IDB (75.7MB).
- 3 full page reloads against the SAME browser IndexedDB: reload 1 recompiles (fresh cache), reloads
  2 and 3 both trust with zero recompute — **"recompute once, then stable, no repeat trigger,"**
  exactly the acceptance bar this section's failure-mode (a) named.
- Recompiled set carries current-algorithm classifications (SUSPECT_OPEN/SUSPECT_LARGE/INTERNAL)
  the stale compile predates, including a 281.6m² Level 3 room the pre-fix compile never saw — the
  class of room the already-shipped §CINEMA_SPACE_ENCLOSED_SKIP filter (PR bim-ootb#933) needs
  present to pick a real dive target instead of bbox-centre.

**Residual risk, named not solved:** no cross-tab lock on the shared IDB cache slot (failure-mode
(b) above) — pre-existing for the manual needle button, stage 3 only changes WHEN the same path
triggers. Left unaddressed per this pilot's "watch it settle" framing — worth monitoring, not a
blocker to closing HHS's dive fix now.

**This closes the blocker** noted in `PHOTOREAL_STILL_RENDER.md`'s "⚠ NEXT SESSION — HHS Office's
dive fix is BLOCKED on a sub-task" note — HHS's Alt+C dive should now self-heal on next load with
zero building-specific code in that file. **Not yet done: fleet-wide widening** (removing the
HHS-only dbFile gate so every building gets the same self-heal) — deliberately deferred until the
HHS pilot has run long enough in real use to confirm the settle behavior holds outside a synthetic
test, per the risk-cliff guidance.

### Stage 4 — SPEC: widen stage 3 past the HHS-only pilot (2026-07-21, folded in from a
scratchpad session recovering the risk-cliff plan's own named next step)
**GIVEN (confirmed against `origin/main` before writing this section):** PR #939 (stage 3, HHS-only
gate) is merged; no fleet-wide widening commit exists yet — `_ensureRoomsCore()` in
`viewer/navigate_find.js` still gates the version-check to the exact string
`HHS_Office_Federated_extracted.db`. A separate PR, #942 (`'o' DLOD-nav warms rooms via the existing
ensureRooms path, idle-deferred`), landed since stage 3 and also calls `ensureRooms()` — worth
checking it doesn't change the trust-check's call frequency assumptions before widening.

1. Remove/generalize the exact-dbFile-match gate so the version-check applies to every building, not
   HHS only.
2. **Stress-test failure-mode (a) directly before shipping wide:** a witness that loads the SAME
   large building (Hospital or Terminal, 48k+ elements — not HHS-scale) through 3+ fresh page
   reloads on the same IndexedDB and asserts the version-check recompute fires **exactly once**, not
   on every load. This is the one concrete regression the widening could introduce silently, and the
   risk-cliff plan named this building class specifically because a bug that's cheap on HHS could be
   expensive there.
3. **Failure-mode (b) (cross-tab race, no lock exists):** the HHS pilot explicitly left this
   unaddressed as an acceptable pre-existing risk for a single building. Widening fleet-wide raises
   the odds of hitting it (more buildings × more tabs). Decide here — build a lock now, or explicitly
   re-affirm deferring it — and write the decision down. Do not let it go unaddressed silently a
   second time.
4. Verify per building class (small/HHS-scale, mid/Duplex-Clinic-scale, large/Hospital-Terminal-
   scale): same 3-reload settle-check already proven on HHS, repeated on all three; report recompute
   count across the 3 reloads per building (must be exactly 1).

**Not in scope:** building a cross-tab lock mechanism outright, unless step 3 concludes it's actually
required for this widening.

#### Stage 4 — ✅ DONE, fleet-wide (2026-07-21)
bim-ootb: `feat/room-walker-stage4-fleet-wide` — PR [red1oon/bim-ootb#947](https://github.com/red1oon/bim-ootb/pull/947).
The exact-dbFile gate is gone: `_ensureRoomsCore()`'s trust-check now compares stored `rooms_meta.version`
against the loaded `ROOM_WALKER_V` for **every** building (was `_dbFileNow === 'HHS_Office_Federated_extracted.db'`
only). `§NEEDLE_VERSION_STALE`'s log line is building-generic (`bld=' + (_dbFileNow || A.activeBuilding)`).
`versionStale`'s declaration/scope was left untouched (a concurrent branch `fix/tour-cache-bust-on-recompile`
reads it to bust the Fly-Tour route cache on recompile — complementary, noted in the PR).

**Regression found + fixed en route (risk-cliff failure-mode (a)):** the patch source (S2.1) never wrote
`rooms_meta`. Fleet-wide, a patch-carrying building (Terminal/Hospital/JKR) therefore recompiled on EVERY
load — `§NEEDLE_VERSION_STALE` never cleared, ~7s each on 48k elements. Reproduced on Terminal as a baseline
(`§STAGE4_RELOAD3 db=Terminal_extracted.db RESULT=FAIL recompute_loads=[1,2,3] l1ms=7376`), then fixed with an
idempotent `rooms_meta` stamp after ANY inject source (new `§NEEDLE_STAMP` line; the walker's `writeRooms()`
already stamped, the patch path now does too). This is the concrete silent regression the stress test existed
to catch — it was real, and it's fixed, not deferred.

**Live-verified (headless Chromium, 3 fresh reloads on the SAME IndexedDB, recompute must fire on load 1 only):**

*Large — Terminal (48428 elements, source=patch):*
```
[NEEDLE] §NEEDLE_VERSION_STALE bld=Terminal_extracted.db stored=null current=v2 (§LOCAL-FRAME + §RASTER-EPS, post-§SUSPECT-LARGE) — recompiling
[NEEDLE] §NEEDLE_INJECT bld=T0_Terminal source=patch rooms=51 rects=79
[NEEDLE] §NEEDLE_STAMP rooms_meta version=v2 (§LOCAL-FRAME + §RASTER-EPS, post-§SUSPECT-LARGE) rooms=51 source=patch
§STAGE4_RELOAD3 db=Terminal_extracted.db RESULT=PASS recompute_loads=[1] l1ms=6937
```
Load-1 wall-clock recompile: **6937ms** (the "expensive on Hospital/Terminal" cost the spec named — quantified,
and now paid ONCE not every load). Loads 2 & 3: `rooms_meta` reads back `v2`, `ensureRooms` returns
`status=present`, `VERSION_STALE=0 NEEDLE_INJECT=0`, ~2s each (boot + trust check, no recompile).

*Small — HHS (6839 elements, source=patch+walker, 14→73 rooms) — regression of the stage-3 pilot via the generalized gate:*
```
[NEEDLE] §NEEDLE_INJECT bld=HHS_Office_Federated source=patch+walker rooms=73 rects=96
§STAGE4_RELOAD3 db=HHS_Office_Federated_extracted.db RESULT=PASS recompute_loads=[1] l1ms=2228
```
Loads 2 & 3 trust in **9ms** each — identical settle behavior to the stage-3 HHS-only proof, now through the fleet-wide code path.

*Mid — Duplex (1119 elements, source=walker, 7 rooms):*
```
[NEEDLE] §NEEDLE_INJECT bld=Ifc2x3_Duplex_Federated source=walker rooms=7 rects=11
§STAGE4_RELOAD3 db=Duplex_extracted.db RESULT=PASS recompute_loads=[1] l1ms=60
```
Load-1 recompile **60ms**, loads 2 & 3 trust in ~4ms. Wall-clock scales cleanly with element count
(Duplex 60ms → HHS 2228ms → Terminal 6937ms), confirming the version-check itself is O(1) and the cost is
purely the one-time compile.

**Cross-tab-lock decision (failure-mode (b)) — DEFERRED, re-affirmed, reasoning recorded:** no lock built.
Read the S3 persist seam directly: it exports `A.db` and `put(outBuf, url)` into the IDB cache under the same
key the loader reads. Two tabs both self-healing the same building would both recompute and both write — but
the walker is deterministic and the version stamp is fixed, so both writes are byte-equivalent (same rooms,
same `rooms_meta` version); IDB `put` is atomic per transaction (no torn write); and `A.ensureRooms` is already
single-flight *within* a tab (`A._ensureRoomsInflight`). The worst case is redundant CPU, never incorrect
room/path data. The race pre-dates stage 4 entirely (the manual needle button has always exposed it on every
building); widening the auto-check changes only WHEN the same path can fire without a click, not the race
mechanics or its (benign, idempotent) outcome. Per the task's own bar — build a lock only if needed for
reliable pathfinding/room-data correctness, not as speculative/defensive engineering — a `navigator.locks`
wrap would be a pure CPU-saving optimization, not a correctness fix. Deferred deliberately, with this written
rationale (not silently dropped).

**Cache-bust:** `navigate_find.js?v=53 → ?v=54` (main.js). `sw.js` `CACHE_VERSION` NOT bumped — `navigate_find.js`
is not in `PRECACHE_ASSETS` (same as its lazy-load siblings, same finding as stages 3 and the original needle).

**Honestly deferred / notes:**
- Local `viewer/buildings/*.db` symlinks 404 under `python -m http.server` (it won't serve symlinks pointing
  outside the doc root); the harness fell through to the viewer's own OCI fallback (`§DB_404_OCI_OK`), which
  serves the identical deployed DBs — `§CENTRES_RESULT ...T0_Terminal,48428...` confirms the 48k-element
  building actually loaded. Not a product issue; a test-serving detail.
- No true "real extraction, non-`RM_`" fixture was reachable to re-prove the `none`-branch here (same gap the
  original DONE flagged); the `none` branch is unchanged by this widening (it returns before the version-check).

### §CONTAINMENT-ALIAS rides Stage 4 — LIVE-confirmed on Hospital (2026-07-21, real user trace, not headless)

`CONTAINMENT_LTU_STOREY_ALIAS.md` (bim-compiler PR #55, ported to `room_walker.js` v2→v3 by
bim-ootb PR #950) needed Stage 4's fleet-wide gate to ever reach a building other than HHS —
confirmed live, not just in a headless witness. User pressed **'o'** (nav-scope DLOD toggle) on a
freshly-loaded Hospital; `dlod_nav.js`'s idle-deferred `app.ensureRooms({})` (§DLOD_NAV_ROOMS,
same shared call as Fly/Cinema, "reuses that exact call, not a fork") fired the full chain:

```
§ROOM-WALKER module loaded, version=v3 (§LOCAL-FRAME + §RASTER-EPS + §CONTAINMENT-ALIAS, post-§SUSPECT-LARGE)
[NEEDLE] §NEEDLE_VERSION_STALE bld=Hospital_extracted.db stored=null current=v3 (...) — recompiling
[NEEDLE] §PATCH_NONE Hospital_extracted.db (404) [needle]
§ROOM-WALKER §ROOMS_META stamped version=v3 (...) room_count=214
[NEEDLE] §NEEDLE_INJECT bld=Hospital source=walker rooms=214 rects=317
[NEEDLE] §NEEDLE_STAMP rooms_meta version=v3 (...) rooms=214 source=walker
[NEEDLE] §NEEDLE_PERSIST idb=ok bytes=22482944
§DLOD_NAV_ROOMS status=injected source=walker rooms=214
[TOUR] §TOUR_CACHE_BUST idb removed=1
```

The last line is `TOUR_ROUTE_CACHE.md` §6 (bim-ootb PR #946) firing in the SAME breath — direct
live proof the two fixes shipped today compose correctly on a real building, not just in isolated
witnesses: version-stale recompile → fresh rooms → any previously-cached Fly route for this
building gets busted too, matching the spec's intended chain exactly.

**Log-clarity finding from the same session:** `§NEEDLE_VERSION_STALE`/`§NEEDLE_FRAME_STALE` were
`console.warn` while every other step of this same pipeline (`§NEEDLE_INJECT`/`§NEEDLE_STAMP`/
`§NEEDLE_PERSIST`) is `console.log` — a real recompile looked "silent"/absent in a console view
with DevTools' "Warnings" filter unchecked, costing a full round of "did it even run" back-and-
forth before the user re-checked with F12's console filter. Fixed, bim-ootb PR (this session,
`fix/needle-log-warn-to-log`): both lines downgraded to `console.log`, matching their siblings —
they're expected/normal events on this path (every building compiled before the version stamp
shipped hits this once), not warnings.

**Corrected framing — Find Panel does NOT independently trigger this (checked `panels.js`
directly, not assumed):** `A.isolateRoom`/`A.filterByGuids` never call `A.ensureRooms()` — Find
Panel is a **passive reader** of whatever `rel_contained_in_space` already happens to be in `A.db`
at the moment the user isolates a room. It only sees fresh (post-§CONTAINMENT-ALIAS) data if some
OTHER feature already warmed it first in the same session — Fly Tour, Cinema MaxQ, the manual
needle button, or (as in tonight's trace) the 'o' nav-DLOD toggle, exactly per `dlod_nav.js`'s own
comment: "this only warms rooms up opportunistically once the main thread is actually free, for
whatever Find/Fly/Cinema feature runs next." If a user opens Find and isolates a room as their
FIRST action, before touching Fly/Cinema/DLOD-nav, they'd still see stale/pre-fix containment.
Not fixed here (out of scope for today) — flagged as a real follow-up: Find Panel's isolate path
could call `A.ensureRooms()` itself before isolating, same one-line pattern as the other four
callers, to stop depending on order-of-operations luck.

**"One-time check" — precise framing (user asked to confirm):** the version check itself
(`SELECT version FROM rooms_meta`) runs on EVERY `ensureRooms()` call, from any caller — it is not
skipped or cached across calls. What makes it cheap and effectively "one-time" is that after the
first real recompile, `rooms_meta.version` matches the loaded `ROOM_WALKER_V`, so every later call
(same page load OR a future page load, since the compiled bytes are persisted into IndexedDB via
`§NEEDLE_PERSIST`) reads a matching version and returns `{status:'present'}` immediately — no
flood-fill, no walker re-run. "Recompute once, then stable" (Stage 4's own measured claim above)
means once per **algorithm-version bump**, not once per session — exactly the mechanism that let
today's v2→v3 bump self-heal Hospital, HHS, LTU, etc. without any manual action or DB redistribution.

### Mobile perf, Time Machine, and needle-sharing — user's direct question, answered plainly

**Does today's containment fix improve mobile perf?** No, and it's important not to overclaim
this. `rel_contained_in_space` being wider is a DATA prerequisite, not a rendering change — nothing
reads that wider data to skip drawing anything yet. The actual mobile-perf lever is room-level
occlusion (hide elements in rooms the camera isn't currently in, ~9 elements/room vs ~44k/floor) —
named in `FLY_TOUR_DLOD_SCALE.md` §5 track 2, **unblocked by today's fix, but still not built**.
That remains the next real step on this lane, and it's the one that would actually move frame time
on mobile once shipped and profiled on real hardware.

**Will Time Machine get this improvement too, and should it share the exact same needle
(`A.ensureRooms()`) rather than a separate mechanism, for consistency?** Checked `time_machine.js`
directly: it does NOT currently do any room-level occlusion — its only DLOD today is the
distance/frustum box-proxy scheme in `TM_DLOD_SCALE.md` (the same prior-art Fly Tour's own
distance-based DLOD borrowed). It has a SEPARATE, independently-written storey-Z-band reassignment
(`assignStoreyByZ`, mirrors `storeyZAnchors`/`_assignByZ`'s technique for its OWN unrelated purpose
— grouping elements into the mini-Gantt chart's storey bars) — this is duplicated TECHNIQUE, not
duplicated DATA, and isn't a bug, just a pre-existing precedent of TM solving a similar problem in
parallel rather than sharing a call.

**Recommendation: yes, share, don't fork — there is no technical reason it can't.** `A.ensureRooms()`
is explicitly designed as "the ONE shared injection core" (its own doc comment,
`FLY_TOUR_CORRIDOR_GRAPH.md` §S1) precisely so any feature operating on the currently-loaded
building — Fly Tour, Cinema, DLOD-nav, the needle button, and (if built) Time Machine — gets
identical, single-flight, version-checked, IndexedDB-persisted room data from one place. It is not
tour-specific: it keys off `A.db`/`A.activeBuilding`/`A.DB_URL`, nothing Fly-Tour-only. If/when
Time Machine wants room-level occlusion for its own interior 4D playback, the correct shape is:
call `A.ensureRooms()` (same as `dlod_nav.js`'s one-liner) before doing any room-based hide/show
logic, exactly like the four existing callers — NOT a fifth, parallel room-compile path. Building a
second injection mechanism would only reintroduce the exact bug this whole Stage 1-4 + containment-
alias effort just closed (two engines silently drifting out of sync, one fixed and one not) for no
benefit. This is a recommendation for WHEN Time Machine room-occlusion gets built, not a task to
do now — no code changed for Time Machine in this session.

**Live user follow-up:** Fly Tour on Hospital immediately after this recompile is "a more
meaningful tour" per direct user testing. Worth attributing correctly rather than over-crediting
§CONTAINMENT-ALIAS specifically: Hospital had **no `rooms_meta` row at all** (confirmed above),
meaning its 142 compiled rooms pre-date not just this fix but every `ROOM_WALKER_V` improvement
that ever shipped (`§LOCAL-FRAME`, `§RASTER-EPS`, `§SUSPECT-LARGE` — all bundled into v3, same as
§CONTAINMENT-ALIAS). The v3 recompile (142→214 rooms) is the FIRST time Stage 3/4's self-heal has
reached a building that was this stale, so the tour improvement is most plausibly the accumulated
effect of every algorithm fix since Hospital's rooms were last compiled, not this session's join
fix in isolation — the join fix's own contribution (room CONTAINMENT, not room DETECTION count)
isn't yet consumed by anything Fly Tour renders differently. Flagging this so a future session
doesn't mis-attribute "Fly Tour got better" solely to §CONTAINMENT-ALIAS.

### §FIND_ENSURE_ROOMS — Find Panel Room lens now self-heals (2026-07-21) — ✅ DONE, closes the follow-up flagged above
bim-ootb: `fix/find-panel-ensure-rooms` — PR [red1oon/bim-ootb#954](https://github.com/red1oon/bim-ootb/pull/954).
This implements exactly the "real follow-up" flagged in the "Corrected framing — Find Panel does NOT
independently trigger this" note above (~line 499): Find Panel was a **passive reader** of
`rel_contained_in_space`, so its Room facet only saw fresh/self-healed data if Fly Tour / Cinema-MaxQ /
DLOD-nav ('o') / the manual needle happened to warm it FIRST in the same page session. Open Find + Room
lens as the first action on a fresh load → stale rooms. Now the Room lens calls the same shared
`A.ensureRooms()` core itself — becoming its **fifth caller**, not a parallel path (exactly the "NOT a
fifth parallel room-compile path" discipline this doc argued for Time Machine two paragraphs up; here the
fix is to ADD the missing call to the existing core, which is the same principle).

**Hook points (traced the live click path on `origin/main`, not assumed):**
- `_buildRoomTree()` top — `A.ensureRooms({})` **non-force** (respects the Stage-4 version-check trust
  path: ~9ms when already fresh, pays the real recompile only once), guarded per-building
  (`_roomsEnsuredBld`) so filter keystrokes / Storey↔Type↔Path sub-toggle switches don't re-fire it. A
  real self-heal (`status==='injected'`) rebuilds the tree (`§FIND_ENSURE_ROOMS self-heal … — rebuilding
  room tree`) so the user sees current rooms, not the stale set that first painted.
- `_isolateLensGroup()` made `async` — awaits `A._ensureRoomsInflight` before reading `rel_contained_in_space`,
  covering the race where a user taps a group on the pre-recompile tree before it rebuilt. Only call site
  is the tree-row `onTap` (fire-and-forget), so async is safe. Both hooks were needed: the tree hook makes
  the list current; the isolate await makes a fast tap during a ~7s Terminal recompile isolate against
  current rows.

**Witnessed headless (Chromium — Room lens opened via the real `#find-axis-toggle` cycle as the FIRST
action on a fresh page load, NO Fly/Cinema/DLOD before it; fresh IndexedDB so `rooms_meta` starts absent):**

*Small — HHS (the dramatic stale→fresh flip):*
```
[RP-T3] §LENS_GROUPS lens=room mode=volume groupBy=storey groups=4 rooms=14     <- stale tree first paint
[NEEDLE] §NEEDLE_VERSION_STALE bld=HHS_Office_Federated_extracted.db stored=null current=v3 (…) — recompiling
[NEEDLE] §NEEDLE_INJECT bld=HHS_Office_Federated source=patch+walker rooms=73 rects=96
[NEEDLE] §NEEDLE_STAMP rooms_meta version=v3 (…) rooms=73 source=patch+walker
[RP-T3] §FIND_ENSURE_ROOMS self-heal bld=HHS_Office_Federated source=patch+walker rooms=73 — rebuilding room tree
[RP-T3] §LENS_GROUPS lens=room mode=volume groupBy=storey groups=4 rooms=96     <- fresh tree, rebuilt
§FIND_ENSURE_WITNESS db=HHS_Office_Federated_extracted.db RESULT=PASS ensureFired=true selfHeal=true rooms_meta null->v3 ifcspace 14->96 rel 88->1464
```
*Large — Terminal:* `§FIND_ENSURE_ROOMS self-heal … source=patch`, `rooms_meta null->v3`, tree rebuilt.
`RESULT=PASS ensureFired=true selfHeal=true`.
*Mid — Duplex:* stale `rooms=5` → `§FIND_ENSURE_ROOMS self-heal … source=walker rooms=7` → tree rebuilt
`rooms=11`; `rooms_meta null->v3`. `RESULT=PASS`.

All three: the Room lens as the first action fired the self-heal and rebuilt the tree to current data —
the order-of-operations dependency is gone. `ROOM_WALKER_V` is now `v3` (§CONTAINMENT-ALIAS, PR #950), so
the recompiled sets carry that fix too.

**Cache-bust:** `navigate_find.js?v=54 → ?v=55` (main.js). `sw.js` `CACHE_VERSION` NOT bumped
(`navigate_find.js` not in `PRECACHE_ASSETS`). Builds on #947 (Stage 4).

## ⚠ OPEN 2026-07-25 — §NEEDLE-NO-ACCUMULATE: every load recompiles from scratch (filed by the Fly Tour lane)
From the user's live GH Pages console, Hospital, two consecutive runs. Run 1 wrote the full cache
(meta 21.4MB, geo 228.6MB, ad_seed 25.8MB) and `§NEEDLE_PERSIST idb=ok bytes=22482944`. Run 2 opened
at `§QUOTA used=3MB` and MISSED all three (`§CACHE_MISS_READ url=Hospital_meta.db — not in IDB`),
re-downloaded ~275MB, and hit `§NEEDLE_VERSION_STALE stored=null` → recompiled all 214 rooms again.
**So the version stamp's self-heal is working as designed; what is not working is persistence.**

**Already ruled out before filing:** the obvious suspect — the needle persisting under the
`_extracted.db` url while the split loader reads `_meta.db` — is NOT it. The misses are UNIFORM
across files the needle never touches, so this is whole-cache eviction, not a key mismatch.
`navigator.storage.persist()` is the first thing to check on the shared `github.io` origin.
**Honest caveat:** a manual "clear browsing data" between the two runs produces an identical log —
confirm with the user before treating it as a bug.

Full context, and the three room-GRAPH gaps this sits beside, in
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md` §GRAPH-FOUNDATION (G5).


## ~~OPEN — §NEEDLE-OVERWRITES-AUTHORED~~ WITHDRAWN 2026-07-25 (same day it was filed)
This entry claimed the needle's recompile of Hospital's 142 authored IfcSpaces collapsed the room
graph from 500 edges to 61, and asked whether the needle should skip/merge instead of replace.
**The measurement was invalid** — it compared `graph.edges.length` (TOTAL, E1–E5) against the
`§ROOM_GRAPH` console line's `edges=`, which counts **E1 door↔room edges only** (`room_graph.js:737`).
Like-for-like the walker set has **61** E1 edges against the authored set's **17**: on door binding the
recompile is BETTER, not worse. No needle policy change is justified by this data, and
`stored=null → recompile` is not shown to be harmful. Full corrected table:
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md` §G3-RETRACTED. Left in place rather than deleted
so the next session does not re-derive the same wrong conclusion from the same two log lines.

### §META-GEO-SPLIT — standing pre-flight, this keeps costing sessions time (user 2026-07-25:
### "Hospital meta/geo exists. Always a headache to miss it")
Hospital is a SPLIT building: the viewer loads `Hospital_meta.db` (22MB) + `Hospital_geo.db` (229MB),
confirmed live by `§DB_SPLIT_DETECT … found=true`. A 252MB `Hospital_extracted.db` monolith ALSO exists
on disk, and the split path wins whenever it is detected. Consequences that have already bitten:
- **Patches are named per DB FILE.** The boot loader requests `patches/<meta-db-name>.sql`
  (`streaming.js:1787`, `metaUrl`) while the needle requests `patches/<DB_URL-name>.sql`
  (`navigate_find.js`). Live Hospital 404s on BOTH — `Hospital_meta.db.sql` exists nowhere, and
  `Hospital_extracted.db.sql` exists in-repo but not on OCI. Terminal ships BOTH variants; copy that.
- **A browser "Save DB" produces a MERGED monolith**, which the split path will then ignore in favour of
  the meta+geo pair. Save-DB is an excellent persistence DEMO, but it is not automatically the upload
  artifact — shipping it means either replacing the meta+geo pair or retiring the split for that building.
- **Anything targeting the raster/rooms should target `_meta`**, which is where `elements_meta` /
  `spatial_structure` live and is 22MB rather than 252MB — geo (229MB) never needs to move.
**Pre-flight, every session, before choosing a Hospital-like building for testing or deployment:**
`ls buildings/<Name>_{extracted,meta,geo}.db` and state WHICH artifact your claim covers. See
[[project_db_snapshot_divergence_landmine]] and [[feedback_dont_suggest_incomplete_split_db_for_testing]].