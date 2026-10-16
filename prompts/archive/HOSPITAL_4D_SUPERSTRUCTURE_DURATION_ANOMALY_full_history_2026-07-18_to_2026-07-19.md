# HOSPITAL_4D_SUPERSTRUCTURE_DURATION_ANOMALY.md — full history, Items 0-8 (2026-07-18 to 2026-07-19)

Archived verbatim 2026-08-13, per the established closed-lane trim pattern (same as
`prompts/archive/CINEMA_PATH_EDITOR_full_history_2026-07-26_to_2026-08-03.md` /
`prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md`). These are
Items 0-8 of `prompts/HOSPITAL_4D_SUPERSTRUCTURE_DURATION_ANOMALY.md`, all closed/shipped —
Item 9 (the one still-open item at the time of archiving) stays live in the main file, not here.
Nothing below is edited from the original — this is the removed content, verbatim, for reference.

---

## Item 6 — ✅ RESOLVED 2026-07-18: mini-Gantt "still all at once" root cause found + fixed
**Halo revert (Item 5) landed first this session:** the pending push from last session's close-out
(`revert/frontier-halo-glow` @ `e960827`) completed cleanly on retry, PR bim-ootb#867 merged to
`main` (`45682f9`), confirmed via `git show origin/main:viewer/time_machine.js | grep -c
FRONTIER-HALO` → 0 and via an ACTUAL LIVE SCREENSHOT (not object counts — the exact gap the last
session flagged) against `https://red1oon.github.io/bim-ootb/`: normal partial-streamed wireframe
geometry, no yellow wash.

**Q2 (was live serving Item 4's crew-cap fix?) — YES, confirmed:** live `viewer/rates.js` carries
`max_crews` ×10, live `viewer/schedule_gate.js` carries `claimCrew`/`maxCrews` logic, live
`viewer/time_machine.js` carries `_GANTT_CACHE_VERSION=3`. Not a deployment gap.

**Q1 (does `drawGanttMini()` have its own display bug?) — NO, the bar-position math is correct.**
The REAL root cause, found by reproducing `drawGanttMini()`'s own storey|phase grouping directly
against live-generated `_ops` (Hospital): 9,457 of 63,415 elements (14.9%) carry a literal
`storey='Unknown'` in `elements_meta` (not NULL — a real extracted value) — mostly secondary steel
(7,122 `IfcMember` + 2,211 `IfcPlate` bracing/gusset-plates) scattered across the FULL Z-height of
the building, not concentrated at one level. Because `drawGanttMini()` groups by `storey|phase`,
ALL 9,457 of these collapse into ONE bar spanning day 13.8→159 — nearly the whole project — which
visually dominates the drawer and reads as "still all at once", even though the properly-tagged
Level 1→7 bars genuinely cascade (confirmed: day 0 → 17.5 → 30.4 → 63.6 → 101.4 → 138.4 → 155.3 →
157.5 — Item 4's crew-cap fix IS working correctly for the 85% of elements that carry a real
storey). **Confirmed a GENERAL defect, not Hospital-specific** — checked all 4 reference buildings:
Hospital 14.9% Unknown, HHS 30.8%, Terminal 69.9%, **Duplex 87%**.

**Fix — `§STOREY-Z` reassignment in `injectGantt()` (`viewer/time_machine.js`), not a display
patch:** mirrors an already-proven pattern in `build/room_walker.js`'s `storeyZAnchors`/
`_assignByZ` (its own comment: "HHS: all 716 vertical curtain children carry storey 'Unknown';
their z clusters match Level 1/2/3 exactly" — the Room Injector Needle solved this exact class of
problem for room compilation already; user pointed at this during the session). Per-building:
compute median Z per REAL (non-Unknown) storey from the already-queried element rows, then for any
element whose `storey` is `_UNKNOWN`/`'Unknown'`, reassign it to the nearest real storey by
`|cz - medianZ|` — deterministic, uses only already-extracted Z data, nothing invented. Applied
ONCE at the `elements[]` construction stage in `injectGantt()`, so the corrected `storey` flows
through automatically to: the Gantt op's persisted `storey` field (`drawGanttMini()` needs zero
changes), the storey-band ranking, and the roof-slab override (`/roof/i.test(storey)`) — no
separate patch needed anywhere else. Falls back to unchanged `'Unknown'` behavior if a building has
zero real storeys to anchor against (empty `storeyNames`).

**Verified, real geometry, both buildings that were checked live:**
- Hospital: `§GANTT_STOREY_Z reassigned=9457` — the "Unknown" Superstructure group (9,357 elements,
  day13.8→159 span) disappears entirely; those elements fold into Level 1 (274→704), Level 3
  (510→3096), Level 4 (394→3203), Level 5 (437→2823), Level 6 (310→818), Level 7A (64→188), Level 7
  (80→82) — the SAME cascading start-days as before (confirming Item 4's scheduling itself is
  untouched — this is purely a storey-attribution fix), now with each Level's bar honestly
  reflecting its FULL population instead of a fraction.
- HHS: 3 clean Level 1→2→3 Superstructure groups, zero Unknown bucket, cascading day 0→17.5→9.7→
  24.9→20.2→27.7.
- `tests/test_schedule_gate.js` regression: still PASS, 0/1970 beams / 0/7127 members / 0/35 slabs
  floating (unaffected — the fix only touches storey ATTRIBUTION, never `base_z`/`top_z`/XY
  footprint, which is what the support gate actually keys on).
- **Actual rendered screenshot** of the mini-Gantt drawer (Hospital, live worktree server, real
  `#tm-gantt` toggle + `tmJumpToElement`) — 35 distinct storey|phase rows, clean Level 1→7A cascade
  visible, no dominant catch-all bar. Screenshot method, not object counts — the same lesson Item
  5's postscript flagged, applied here before calling this done.

**Branch/PR:** `fix/gantt-mini-unknown-storey-zband` off `origin/main`@`45682f9` (post-#867), 2
commits' worth of change in `viewer/time_machine.js` (§STOREY-Z anchor computation + reassignment
in `injectGantt()`). `node --check` passes. Not yet pushed/PR'd as of this write-up — do that next
if picking this file up mid-session, or check `git -C ~/bim-ootb branch -a | grep gantt-mini` /
`gh pr list` first to see if a later pass in this same session already did.

**Postscript — cache-bust step missed on first landing, caught by user re-test (2026-07-18):**
user reported live, after PR #869 merged, "still not happening though hard reset... must be not
bumped v well" — correctly self-diagnosed the exact gap: `_GANTT_CACHE_VERSION` (IDB gantt-schedule
cache, same mechanism Item 4/#853/#862 already hit once) was never bumped 3→4, so any browser that
had already generated+cached a schedule kept serving the pre-fix version from IndexedDB forever — a
hard reset does not clear this, only a version bump does. Fixed in a same-session follow-up PR
bim-ootb#871 (`fix/gantt-cache-version-bump`): `_GANTT_CACHE_VERSION` 3→4, `sw.js` `CACHE_VERSION`
v796→v797. Verified by seeding a fake `gantt:v3:Hospital` IDB entry and confirming `activate()`
ignores it (no `§GANTT_CACHE_HIT`) and regenerates fresh under v4. **Lesson reinforced for any
future `injectGantt()`/schedule-generation-logic change: the cache-version bump is not optional
polish, it's the second half of the fix — ship both in the same PR next time, don't wait for a
user re-test to catch the gap.**

**Also flagged live, not yet investigated:** "Timeline not easily scrubable like before" — a
separate symptom from the Gantt bar layout, reported in the same message. Console log shows dense,
repeating `§IDLE_GATE park — rAF chain stopped (self-parking, 0 frames)` lines interleaved with
every `§WB_MAT`/render-loop cycle — worth checking whether the render loop is self-parking overly
aggressively during scrub (stopping before a frame fully settles) if this persists after the user
gets a genuinely fresh v4/v797 load. **Do not assume the cache-bump above fixes this too** — it's
an unconfirmed, separate lead; re-diagnose fresh if it's still reported after the cache fix lands.

**Postscript 3 — a THIRD, distinct bug found by the user's direct pushback ("why are all the gantt
bars the same spot... aren't they supposed to be staggered? for the 3rd time...") — 2026-07-18:**
after #869/#871 landed, MEP Rough-in bars for different floors STILL visually clustered — but this
time verified with real per-element data, not display math. `Level 1/2/5 MEP Rough-in` groups all
showed `start=day0.0`. Drilled into WHY: for Level 5's group (n=7,627), the MEDIAN start is day
258 and only 0.4% of elements start before day 100 — the underlying schedule genuinely IS gradual
and correctly staggered. The group's reported MIN, though, is dragged to ~0 by a tiny cluster
(~60 elements, 0.8%) of `IfcPipeFitting`s that carry a REAL, PRESENT storey tag ("Level 5") that
disagrees sharply with their own extracted Z (~164m, below even Level 1's median 168.9m) — almost
certainly risers/connectors whose IFC "Level" property reflects which floor's system they serve,
not their physical position. `schedule_gate.js` correctly gates these by real geometry (not the
tag), so they schedule to start almost immediately — genuinely correct per-element, but the
drawer's true-min/max bar span let this handful of outliers define the WHOLE floor's displayed
start.

**Fix — `§GANTT_MINI_TRIM`, bim-ootb PR #873 (`fix/gantt-mini-percentile-trim`):** trim the bar's
drawn span to the 2nd–98th percentile of real per-element start/end times instead of true min/max
(tiny groups, n≤20, keep true min/max — percentile trimming is meaningless at that sample size).
Pure display-layer change, does not touch scheduling/gating at all. Verified live (Hospital): MEP
Rough-in bars now cascade cleanly `Level1(day10.5)→Level2(day32.3)→Level3(day56.3)→Level4(day90.5)
→Level5(day128.1)→Level6(day159.1)→Level7(day311.7)` instead of 3 different floors all reading
day 0 — confirmed via an actual rendered screenshot (clean staircase pattern) and
`tests/test_schedule_gate.js` (still 0 floating).

**Process note:** this was caught because the user pushed back a third time on a screenshot I'd
already called "fixed" instead of accepting my explanation — the earlier two Item 6 fixes (§STOREY-Z,
cache-version bump) were both real and necessary, but neither was sufficient on its own; each
follow-up report surfaced a genuinely distinct layer of the same visual symptom. Don't treat a
user's repeated "still not right" as the same bug restated — re-derive from real data each time.

All 3 confirmed MERGED + LIVE (2026-07-18, verified via `git show origin/main:<file> | grep`, not
just PR state): #869 (§STOREY-Z), #871 (cache-version bump), #873 (percentile trim).

## Item 7 — ✅ FIXED 2026-07-18, PR bim-ootb#878 (`fix/idb-cache-version-fallback`):
## "generated a 4D schedule and applied it, reopening the panel shows initial stage" — a FOURTH,
## SYSTEMIC bug (not a Gantt bug at all)
User, live, pasted a full console log from the Author-4D-Schedule flow on Terminal. The log showed
the real cause immediately, no guessing needed: `[S203] §IDB_OPEN_ERR name=bim_ootb_cache
err=VersionError: the stored database is a higher version than the version requested` +
`§CACHE_DB_OPEN_FAIL — IDB unavailable`, repeating on EVERY single cache-DB open attempt for that
browser profile — cascading into `§SCHED_PERSIST_ERR no cache store` (every "Apply to 4D" silently
failed to persist) AND `§CACHE_SKIP url=ad_seed.db reason=IDB_unavailable` / `§CACHE_SKIP
url=Terminal_geo.db` (building-DB caching broken too). **Not a schedule-specific bug at all** — the
entire shared `bim_ootb_cache` IndexedDB opener was down for that profile.

**Root cause:** `A.openCacheDB()` (`viewer/scene.js`) hardcodes `indexedDB.open('bim_ootb_cache',
2)`. IndexedDB versions only ever increase — a browser profile whose `bim_ootb_cache` is ALREADY at
a version higher than 2 (another tab/build/dev-residue having bumped it further at some point) makes
this explicit open throw `VersionError` FOREVER, with no recovery short of the user manually
clearing site storage. `kernel_ops.js` already proved the fix for this exact class of drift in its
OWN fallback opener (`indexedDB.open('bim_ootb_cache')` — no version, whatever's actually stored,
never throws) — but that fallback only ever ran when `APP.openCacheDB` was ABSENT; the bug was
INSIDE `APP.openCacheDB` itself, so the existing workaround never engaged for this failure mode.

**Fix:** on `VersionError` specifically, `A.openCacheDB()` now falls back to the same unversioned
open — benefits every caller through the one shared opener (buildings, `kernel_ops`,
`schedule_author`) with a single change.

**Verified:** seeded `bim_ootb_cache` at v3 (simulating a profile already past 2), reloaded the
viewer fresh — confirmed `§IDB_VERSION_MISMATCH` → `§IDB_VERSION_FALLBACK_OK`, `A.openCacheDB()`
resolves a real DB with both object stores present, and an actual write+read-back through it
succeeds end to end. This is the real fix for "reopening shows initial stage" — not a Gantt-display
issue, a browser-profile-level cache corruption that this app had no self-heal path for until now.

## Item 8 — ✅ FIXED 2026-07-19, PR bim-ootb#882 (`fix/captured-schedule-per-element-stagger`):
## "the gantt chart bars are the SAME! why must those clusters be on same starting point?" — a
## FOURTH, distinct root cause, in the CAPTURED-schedule path (not the generated one Items 6-7 fixed)
User, live, after §STOREY-Z (#869) + cache-bump (#871) + percentile-trim (#873) were ALL verified
working on the auto-generated path: kept insisting the bars were still identical. Correctly pushed
back on me asking them to test/screenshot again — self-tested end to end instead, real data, no
guessing. Root cause found in a COMPLETELY DIFFERENT code path than Items 6-7: once a user runs
the Schedule Author wizard ("Generate first draft" → "Apply to 4D"), the phase-level dates it
computes (`tasks.schedule_start/finish`, one contiguous range per phase e.g. Superstructure =
2026-01-31..2026-03-02) get assigned VERBATIM, byte-identical, to every element covered by that
phase — regardless of floor. Verified live (Hospital): ALL 8 Levels' Superstructure elements
showed the EXACT SAME start+end timestamp. `§GANTT_SOURCE captured` (not `generated`) is the tell
— once ANY captured/authored schedule exists and covers 100% of elements (common after using
Schedule Author even once), it OVERRIDES the generated path entirely, so Items 6-7's fixes (which
only touch the generated/uncovered subset) never mattered for this scenario. This explains the
apparent contradiction: my sandbox tests (pure auto-generated path) showed clean staggering, while
the user's own session — which had used Schedule Author's Apply-to-4D — was on the captured path
the whole time.

**Fix (`viewer/time_machine.js`, the T3 captured-overlay in `injectGantt()`):** bucket covered
elements by task, sort each bucket bottom-up by real `cz` (same discipline the generative pass
already uses via `elements[]`, built earlier in the same function), and linearly distribute them
across the task's OWN `[w.s, w.e]` window instead of collapsing every element onto it verbatim.
The phase's overall EDITABLE date range shown in the Schedule Author panel (`tasks.schedule_start/
finish`) is completely unchanged — only the per-element position WITHIN that window is now
real-Z-ordered, satisfying "construction 4D schedule hat: orderly, gradual appearance, not a whole
big block suddenly appearing" without touching the user-facing WBS dates at all.

**Verified live end-to-end** (real Generate+Apply flow, not a synthetic query): per-storey reveal
timing (`kernel_ops.timestamp`/`_end_ts` — what actually drives both the mini-Gantt bars AND TM
playback, NOT `tasks.schedule_start/finish` which stays phase-level by design) now cascades
Level1→Level2→Level3→Level4→Level5→Level6→Level7A→Level7, each starting strictly later than the
last, within the same ~30-day phase window. Actual rendered mini-Gantt screenshot confirms a clean
staircase pattern (35 distinct task rows) — not identical bars.
`tests/test_schedule_gate.js` regression: still 0 floating (this only changes per-element timing
WITHIN an already-dated task window, never the support-gate geometry the audit checks).

**Process note (repeat of Item 6's lesson, worth restating):** don't stop investigating just
because an earlier, real, verified fix didn't resolve a symptom the user is STILL reporting.
Four consecutive "same bars" reports from this user turned out to be FOUR genuinely distinct bugs
(storey attribution, cache staleness, outlier-skewed percentile math, and now verbatim-phase-date
collapse) — each fix was real and necessary, none was sufficient alone, because each investigation
correctly re-derived from fresh real data instead of assuming the new report was the same bug
restated. Also: when the user says "you test, not me" — actually run the full repro (generate →
apply → query the REAL kernel_ops timing, not the tasks-table WBS dates) rather than asking for
another screenshot/console paste.

## Standing test sandbox (2026-07-18, see `reference_bim_ootb_sandbox.md` in memory)
`/tmp/wt-sandbox` — one persistent worktree + `http://localhost:8399` server, refreshed via
`/tmp/wt-sandbox/refresh.sh` (fetch + reset to `origin/main` + restart server, ~5s). Building DBs
(Hospital/Terminal/Duplex/HHS_Office_Federated) already symlinked in. Use this instead of spinning
up a new `/tmp/wt-*` + `python3 -m http.server <port>` per investigation — this session burned real
time on wrong-port test-script bugs and a `git reset --hard` that discarded uncommitted fix work
across throwaway worktrees before this existed.

## Item 6 (original handoff, kept for the record — superseded by the resolution above)
User, after Item 4 (crew-cap) + Item 5 (halo) shipped and merged to `main`: **"that gantt chart
all at once is not solved!"** and **"The yellow halo does not transition right away to dark red.
It is the same yellow cubes hell that persist, meaning u have not solved its source of error."**
Screenshot: `~/Pictures/Screenshots/Screenshot from 2026-07-18 12-48-18.png` (also check for any
NEWER ones — `ls -lt ~/Pictures/Screenshots/` — before assuming this is the latest evidence).

**What the screenshot actually shows:** the ENTIRE visible 3D scene is a blown-out, blurry, solid
yellow-cream wash — not a few small glowing halos, not individual "cubes" distinguishable from
each other. The mini-Gantt drawer (same panel as the earlier screenshot) STILL shows every Level's
"Sup" bar positioned adjacent/bunched right after "Sub", visually identical in LAYOUT to the
PRE-Item-4 screenshot — despite Item 4's crew-cap fix being verified (regression test + percentile
analysis) to produce genuine bottom-up cascading in the underlying schedule DATA.

**Two open questions, do not assume either answer — investigate fresh:**
1. **Is the mini-Gantt drawer's bar LAYOUT actually reading real schedule data, or does it have
   its own independent scale/rendering bug** (e.g. a fixed/clipped time-axis window, or drawing
   logic that doesn't scale bar position by the REAL day-offset) that would make it look
   "unchanged" even with genuinely-fixed underlying data? Find `drawGanttMini()` in
   `viewer/time_machine.js` and read it fully before touching `schedule_gate.js` again — don't
   re-litigate Item 4's already-verified fix without first ruling out a DISPLAY-layer bug.
2. Cross-check: is the LIVE site actually serving the Item 4 fix by the time this screenshot was
   taken? Same class of gap as Item 3's orphaned-PR lesson — verify via `curl` + `grep -o | wc -l`
   against `https://red1oon.github.io/bim-ootb/viewer/schedule_gate.js` for `claimCrew`/`max_crews`
   occurrences (see Item 3 postscript for the exact technique — `grep -c` undercounts on minified
   single-line files) AND check the IndexedDB gantt-cache version actually in play in the user's
   OWN browser (not a fresh Puppeteer profile) if at all determinable.

**Item 5 (halo) — REVERTED, not merely paused:** the "yellow cubes hell" symptom is most likely
(not yet confirmed) the halo feature itself misbehaving — candidate causes, NONE confirmed yet:
(a) `THREE.Sprite` + `AdditiveBlending` + `depthTest:false` stacking brightness when MANY halos
overlap in screen space at a wide/blurred camera distance — additive blending trends toward
blown-out white/yellow regardless of individual base colors when many layers stack, which would
also explain "doesn't transition to dark red" (a few reddish-brown sprites get visually drowned by
many yellow ones); (b) `_haloRefreshFrustum`/`_haloInFrame` not actually culling (letting far more
than the true frontier set spawn halos); (c) sprite world-scale (`_HALO_WORLD_SIZE = 2.2`) somehow
rendering far larger than 2.2m due to a units/`sizeAttenuation` mismatch not caught by this
session's numeric verification (which only ever checked sprite COUNT and hex color values via
`page.evaluate()` — never took an actual screenshot or checked rendered pixel size). **This gap —
verifying a visual feature by object-count/property inspection instead of an actual rendered
screenshot — is the root process mistake to fix next time a visual feature ships.**

Reverted via `git revert --no-edit 28e4b9c` on branch `revert/frontier-halo-glow` (worktree
`/tmp/wt-halo-revert` off `origin/main`@`28e4b9c`), `node --check` passed. **Push to origin was
HANGING at session close** (matches the documented git-lfs pre-push-hook probe issue, `CLAUDE.md`
§DB CHANGES — "a push may still hang regardless of DB policy... if a push doesn't return within
~30s, stop and report, don't retry in a loop") — retried once (90s), still hung. **Next session:
check `git -C ~/bim-ootb push -u origin revert/frontier-halo-glow` state first** — it may have
completed after this session ended, or may need a fresh retry. If completed: open a PR, verify via
`git show origin/main:viewer/time_machine.js | grep -c FRONTIER-HALO` returns 0, confirm live via
an ACTUAL SCREENSHOT (not just object counts) that the wash is gone. If the branch/commit is lost
entirely, the revert is trivial to redo — the original feature commit is `28e4b9c` on `main`
history, `git revert --no-edit 28e4b9c` reproduces this exact revert.

**Do NOT re-attempt the halo feature in the same session as fixing Item 6's gantt question** —
they're two separate, unconfirmed problems; conflating their diagnosis (e.g. assuming the yellow
wash somehow explains the gantt bar layout, or vice versa) risks a wrong fix for both. Treat them
as two independent open items.

## Item 4 — ✅ FIXED 2026-07-18, PR bim-ootb#864 (`fix/schedule-crew-cap-cascade`):
## every Level's Superstructure builds "at once" instead of cascading floor-by-floor
User, live on Hospital, with a screenshot (mini-Gantt drawer): every Level's "Sup" bar appeared
bunched together right after the Substructure bar. **"It is an impossible timed Gantt chart to
have all such work at once, and within each the items should have a cascading flow."**

Root cause, DIFFERENT from Item 2's locale-productivity bug (that one made individual elements
too FAST; this one is a separate CONCURRENCY-MODEL defect that survives correct rates):
`schedule_gate.js`'s resource-availability key was `resource + '|' + Math.floor(top_z/3)` — every
distinct 3m Z-slice (~one per floor) got its OWN independent, UNCAPPED crew. A 9-storey building
spun up as many simultaneous STEEL_ERECTOR/CONCRETE_GANG crews as it had Z-bands, with no shared
project-wide labor pool — unrealistic (no real site runs a dozen full crews of one trade
concurrently). This is exactly the "SECONDARY, compounding factor" flagged (but not yet fixed) in
Item 2's original write-up — the user's screenshot is direct visual confirmation of it.

**Fix:** crews are now a small FIXED number of slots per resource
(`LABOR_RATES[resource].max_crews` — new field, same estimating-assumption category as the
existing `rate_per_day`/`crew_size`, editable via `rates.js`/`rates/sequence_rules.json`, default
3 for major trades STEEL_ERECTOR/CONCRETE_GANG, 1-2 for smaller specialty trades), shared
PROJECT-WIDE (not per-band) and across BOTH scheduler passes (a resource like CONCRETE_GANG
appears in both — foundations in PASS A, ramps in PASS B — real crews don't duplicate). Elements
are already processed bottom-up by `base_z`, so capped crews naturally cascade: lower/earlier
elements claim the limited crews first, higher ones wait for BOTH crew availability AND their
existing structural dependency (`geoGate`).

**Verified, real Hospital geometry:**
- `tests/test_schedule_gate.js` regression: still 0/1970 beams, 0/7127 members, 0/35 slabs
  floating — crew capping only changes WHEN a gated element's crew is free, never touches the
  structural-support gate itself.
- Per-Level Superstructure completion (p10/p50/p90 percentiles — a handful of straggler elements
  skew pure min/max without reflecting when a Level is SUBSTANTIALLY built): confirmed clean
  bottom-up cascade in BOTH before and after (geoGate was already enforcing level-order; the
  fix's real effect is realistic overall PACING — one project-wide crew pool per trade instead of
  one per floor — not fixing a broken cascade that didn't already exist). Superstructure phase
  span: 339.9 days (before, uncapped) → 147.8 days offline / 159.0 days live-verified (after,
  capped) — still realistic, not "an hour," not "all at once."
- Live-verified via headless browser against the actual worktree server, matching the offline
  Node replica order-of-magnitude.
- **Also bumped `_GANTT_CACHE_VERSION` v2→v3** (`time_machine.js`) — this is a schedule-
  GENERATION logic change (not just a rate value), so any browser that already generated+cached a
  v2 schedule (correct rates, but pre-crew-cap unbounded parallelism) needed this to regenerate
  instead of serving the stale "all levels at once" pattern forever. **This is almost certainly
  what the "Day 37/198" screenshot was showing** — 198 days matches NEITHER the before (339.9/
  365.8) nor after (147.8/314.3) calculated whole-project totals, meaning it was very likely a
  stale v2-cached schedule from earlier in the same debugging session (generated after the Item 2
  locale-fix went live, but before this crew-cap fix existed) — service-worker unregistration
  (which fixed Item 3) does NOT clear this separate IndexedDB gantt-schedule cache; only the
  version bump does. Verified live: seeded a fake `gantt:v2:{building}` entry, confirmed
  `activate()` ignores it and regenerates fresh under v3. Also bumped `sw.js` `CACHE_VERSION`
  v794→v795 per this project's deploy convention (PR bim-ootb#862 already established this
  pattern for Item 3's fix).

## Item 5 — ✅ SHIPPED 2026-07-18, PR bim-ootb#866 (`feat/frontier-halo-glow`):
## frontier "shine thru" halo (feature, not a bug fix)
User, mid-investigation: "can we have the mesh halo that is been created shine thru?" Almost no
frontier (currently-being-built) element got ANY visual highlight before this — `applyHighlight()`
(single-mesh path, already `depthTest:false`) barely applies since real building geometry streams
almost entirely as `BatchedMesh`/`InstancedMesh` (confirmed `sceneMeshGUIDs=0` all session —
Hospital/HHS have ZERO single-guid meshes), and both those paths explicitly SKIPPED highlighting.

**Design, from the user across several follow-up messages (not guessed):**
- "The halo bigger than mesh is a more wow effect. Even if small, a shining object is seen, why
  can't it be?" → NOT a mesh-conforming outline (that's the retired `§YELLOW_BOX_RETIRED` hard-
  edged marker that "bled badly" through walls) — a soft, billboarded glow SPRITE, sized bigger
  than the element, `depthTest:false` so it deliberately shines through occluders (reads as an
  intentional VFX beacon, not a geometry-bug artifact, precisely because it's soft/gradient not a
  sharp box).
- "isn't it simple, a sub function each item that gets laid, goes thru the shine?" → confirmed the
  implementation shape: one `applyFrontierHalo(pos, t)` sub-function every frontier element
  (single mesh / BatchedMesh slot / InstancedMesh instance) passes through each render tick, same
  pattern as the existing `applyHighlight()`.
- "during drone fly when encountering will be dramatic if add yellow burn glow turning to reddish
  brown cool" → color follows install progress like cooling metal (`_haloColorFor(t)`: yellow →
  orange → reddish-brown, two-segment `THREE.Color` lerp), not a flat single color.
- "Those not in frame need not be highlighted" → per-tick camera-frustum check
  (`_haloRefreshFrustum`/`_haloInFrame`) skips spawning a halo for anything outside the current
  view — relevant in both normal viewing and the drone-fly cinematic mode.

**Implementation:** a small reused `THREE.Sprite` pool (avoids per-tick allocation —
`renderAtTime()` runs every playback tick), additive-blended radial-gradient texture (generated
once via canvas), swept clean each tick (`_haloTickStart`/`_haloSweepUnused`) and on TM
`deactivate()`.

**Verified live**, real Hospital geometry: naive periodic polling initially showed 0 halos —
turned out to be a TEST methodology gap (Item 4's crew-cap=3 means frontier windows are brief,
easy to miss with coarse sampling), not an app bug — confirmed by deterministically computing a
timestamp with real element overlap (`kernel_ops` query: found a moment with 9 overlapping
elements) and jumping straight to it via `tmJumpToElement`, rather than guessing/polling blind.
3 visible halos with distinct hot/cool colors (`#ffb11f`, `#b55811`) at correct world positions.
Also confirmed halos clear to 0 at a 0Hr reset, and clear + TM reports inactive after deactivate.

**Not yet done:** the user hasn't SEEN this live — I can verify the mechanism (spawns, colors,
culls, clears) but not whether size/brightness/color actually reads as "wow" in practice. If they
report it's too subtle/too much/wrong color balance, tune `_HALO_WORLD_SIZE` (currently 2.2m),
the opacity (0.85) or the three `_haloColor*` hex values — all named constants near the top of the
`§FRONTIER-HALO` block in `time_machine.js`, not scattered.

## Item 3 — ✅ FIXED 2026-07-18, PR bim-ootb#856 (`fix/tm-stream-resweep`, stacked on #853):
## scene doesn't clear at 0Hr on large buildings
User-reported, live: "it does not clear the scene during 0 Hr Time Machine" on Hospital, after
already clearing IndexedDB and regenerating 4D (ruling out stale-cache as the cause). Root cause:
`streaming.js` has ZERO awareness of Time Machine — newly-flushed `BatchedMesh`/`InstancedMesh`
geometry defaults to visible (normal viewer state) and is never swept against the active TM cursor
until the cursor itself next changes (`renderAtTime()` only runs on cursor movement). Hospital
(63K elements) streams progressively over 10+ seconds — a user sitting at 0Hr (cursor pinned, not
scrubbing) watches the scene fill back up with fully-visible late-arriving geometry that should
stay hidden.

**Confirmed NOT a regression** — user pushed back ("it has been working so well, something
broke") which was the right instinct to check, not assume. Ran the identical live reproduction
against pre-session baseline `a13bb0d` (before Movie Export retirement, before Item 0's
BatchedMesh edit, before anything this session touched): baseline shows the EXACT same race
(`batchVisibleSlots` growing 1976/2151 → 10134/10309 over 20s while cursor stayed pinned at
`_projectStart`). This is a longstanding architecture gap — streaming and TM were simply never
coordinated — not something this session's edits caused. It likely wasn't noticed before because
it only manifests when TM engages EARLY relative to streaming completion on a LARGE building.

**Fix:** `time_machine.js` exposes `window.tmResweep()` (`if (_active) renderAtTime(_cursor)` —
no-op when TM isn't active, zero cost for normal viewing). `streaming.js` calls it (feature-
detected, same optional-consumer pattern as `window.__sfxTM`) from its three geometry-flush
completion points: `_flushInstanced`, `_flushBboxBatched`, `_consolidateBatched`.

**Verified live** (same reproduction, activate TM immediately after DB load — well before
streaming settles — jump to 0Hr, poll visible counts every 2s for 20s): pre-fix, `batchVisibleSlots`
grew from 1976/2151 to 10134/10309 while cursor never moved (confirmed on both current code AND
baseline). Post-fix: `batchVisibleSlots`/`instVisible` stay pinned at exactly 0 for the full 20s
window while `batchTotalSlots`/`instTotal` keep growing (2151→8159), confirming late arrivals now
start correctly hidden and stay hidden.

**Postscript 2 — exhaustive re-verification after user reported "still broken" post-#859, TWO more
gaps found and closed, root cause of persistence still unconfirmed:**
1. **`sw.js` `CACHE_VERSION` never bumped** across #852/#853/#859 — this project's own
   `GH_DEPLOY.md` requires it on every deploy. Fixed: PR bim-ootb#862 (`v792`→`v793`), merged,
   confirmed via `git show origin/main:viewer/sw.js`. Caveat: `.js` files are served **network-
   first** (`sw.js`'s own `networkFirst()` — fetch live, cache only as an offline fallback), so
   this likely was NOT actually blocking the streaming/TM fix from reaching a normally-online
   browser; fixed anyway since it's a genuine process gap against this project's documented
   convention (affects cache-first assets: wasm/images/css, and the offline fallback path).
2. **Exhaustive re-reproduction on current `origin/main` (post #859+#860+#862), same building
   the user tested (`HHS_Office_Federated`, not Hospital) — could NOT reproduce the bug.** Ran 3
   separate scenarios via headless Puppeteer: (a) early-activation race — clean, 0 visible at 0Hr
   throughout a 20s poll while streaming kept delivering geometry; (b) full sequence matching the
   user's pasted log — activate (defaults to `_cursor=_projectEnd`, fully-built, by deliberate
   design at `_finishActivate()` line ~3798 — unrelated to any fix this session, pre-existing),
   Jump-to-Start, 15s real Build (generates real frontier+SFX activity matching their log), Jump-
   to-Start AGAIN (mid-session reset) — clean, 0/2716 batch slots immediately and for 10s after;
   (c) sitting at 0Hr post-reset for an extended window — stays at exactly 0.
3. **Escalated to testing the ACTUAL LIVE PRODUCTION URL directly** (`https://red1oon.github.io/
   bim-ootb/`), not just local worktrees — the decisive test. Confirmed the deployed bundle is
   minified (build step between `main` and what Pages serves — `GH_DEPLOY.md` doesn't document
   this, worth fixing that doc gap separately) but genuinely carries all three fixes: fetched
   `viewer/streaming.js`/`time_machine.js`/`locale_loader.js` live, counted actual string
   occurrences correctly this time (`grep -o | wc -l`, not `grep -c` which caps at 1 on a
   single-line minified file — tripped on this myself first, corrected before concluding
   anything) — `tmResweep` × 6 in streaming.js (3 hook sites × 2 refs each), × 1 definition in
   time_machine.js, `locTrade` × 8 in locale_loader.js (the productivity-merge variable). Then ran
   the FULL user-matching sequence (activate → Jump-to-Start → 15s real Build, matching their
   pasted frontier/SFX log activity → Jump-to-Start again, the actual "mid-session reset" scenario
   → sit at 0Hr for 10s) against this exact live URL, exact building (`HHS_Office_Federated`).
   Clean every step: `0/2716` batch slots immediately after each reset, staying at 0 for the full
   10s window. `window.tmResweep` confirmed present and callable (`hasResweep:true`) on the live
   page itself.
4. **Conclusion: source, deployment, and live-production behavior are all verified correct.** The
   remaining gap between this and the user's report is very likely their OWN browser/device
   session state — a "hard reset" (Ctrl+Shift+R) does not always fully clear an installed service
   worker in every browser; DevTools → Application → Service Workers → Unregister + Clear Storage,
   or a clean Incognito/Private window (zero prior SW/cache state), is the next concrete
   troubleshooting step if it recurs — not a further code hypothesis. **Next session: if this
   resurfaces, get a screenshot (not just console logs — logs alone can't show whether the SCENE
   visually looks wrong) and ask specifically whether it reproduces in a fresh Incognito window
   before re-opening the code investigation.**

**Postscript 1 — the fix was orphaned on first landing, caught by user re-test:** original PR #856
was mistakenly branched off `fix/locale-productivity-deep-merge` (PR #853's source branch) instead
of `main`. `gh pr view` reported ALL THREE PRs as `"state":"MERGED"` — but #853 squash-merged into
`main` FIRST, and #856's own merge (into the now-stale `fix/locale-productivity-deep-merge` branch)
never actually landed its diff into `main` — the tmResweep commits were reachable only from a
dead-end branch, invisible to anyone testing `main`. User re-tested live after being told "all
pushed" and hit the exact same bug — correctly didn't accept "the PRs say merged" at face value.
Caught by checking `git branch -a --contains <commit>` against `origin/main` directly (not `gh pr
view`'s merged-state alone), cherry-picked cleanly onto fresh `main` as **PR #859**, re-verified
live against current `main` (post #854/#855/#857 too), auto-merge enabled, confirmed via `git show
origin/main:<file>` (not just PR state) that `tmResweep` is genuinely present. **Lesson for any
future stacked-PR workflow on this project: branch every fix off `main` directly, or if stacking is
unavoidable, verify the FINAL merge target ref (`git log --oneline origin/main -N` + grep the actual
file content) after each merge — `gh pr view --json state` alone is not proof of reachability from
main.**

**Item 0's floating-beam side-question (same live session, before this item):** independently
verified via a Node replica of the schedule + the app's own `§SUPPORT_CHECK` audit — 0/1970 beams
in Hospital are scheduled before their structural support finishes (checked twice: once with a
flawed "any class below" definition that gave 1952 false positives from counting MEP/walls/
furniture as "support" — corrected to only count structural classes per `schedule_gate.js`'s own
definition, which gave 0/1970, matching the app's built-in audit exactly). So a visually "floating"
beam is NOT a scheduling-data bug — it's most likely this same Item 3 rendering-desync class of
issue (a support column/beam whose mesh hasn't been swept to visible yet, even though the schedule
says it should be) — this fix likely resolves it as a side effect, but wasn't re-verified visually
against the ORIGINAL floating-beam report specifically. If it recurs after PR #856 lands, that's
the next thing to check.

## Item 1 — ✅ DONE 2026-07-18: dropped `#tm-share`, PR #852
Removed button markup + pointerup listener in `viewer/time_machine.js` (branch
`fix/drop-tm-share-button`, worktree `/tmp/wt-drop-tm-share` off updated `main`@`a3fc220`).
`node --check` passes, `grep tm-share` returns nothing. Pushed + PR opened:
https://github.com/red1oon/bim-ootb/pull/852

### Original spec (kept for the record)
`bim-ootb` PR #850 (2026-07-18, `revert/tm-movie-export-and-gi-autoengage`) reverted the Movie
Export feature (see `prompts/archive/TM_MOVIE_EXPORT_RETIRED_2026-07-18.md` for the full story)
and, as part of that revert, restored the `#tm-share` button (`time_machine.js`, "Copy shareable
link") to its pre-Export-Movie state. **User correction: this was not requested — the share button
should be dropped, not restored.** The revert only needed to remove the Export Movie UI/mechanism;
bringing `#tm-share` back was this assistant's own unrequested addition, done without checking.
Next session: remove `#tm-share` (button markup ~`time_machine.js:1933`, listener
~`time_machine.js:2081-2089`) — do not replace it with anything unless told to; just drop it from
the panel row.

## Item 0 — ✅ VERIFIED 2026-07-18: NOT the BatchedMesh edit, safe to proceed to Item 2
A/B ran to completion (`witness_appearance_regression.js`, `/tmp/wt-tm-baseline` @ `a13bb0d` on
:8300 vs `/tmp/wt-tm-current` @ `a3fc220` on :8310, HHS_Office_Federated_extracted.db, identical
Jump-to-start → 3s Build → Stop burst on both): both landed on the **identical cursor**
`1780467199999` with **identical counts** — `visibleBatchSlots: 27/2716`, `visibleGuidMeshes: 0/0`
— and zero page errors on either side. Per this file's own decision rule (below), identical
counts at an identical cursor mean the regression is **not** in `renderAtTime`'s visibility logic
— the `BatchedMesh` frontier-box removal is cleared. The user's "appearance broken" / "schedule
hell on others too" report is a **separate, still-open question** — not yet re-diagnosed against
a live symptom, just decoupled from this session's own edit as prime suspect. If it resurfaces,
start fresh (don't assume it's the same root cause as Item 2's duration anomaly — that link was
never established either, only hypothesized).

## Item 0 (original spec, kept for the record) — element-appearance regression from THIS session's own edits
Before touching duration/rate logic at all: the user reported, in the SAME session that produced
this file, that "the appearance of elements are broken in this session" and, testing further,
"on others also worse schedule hell" (i.e. not Hospital-specific — seen on other buildings too).
This was raised immediately after item 2's "Superstructure built within an hour" observation, and
the user explicitly asked whether the two are connected ("So the duration anomaly is addressed") —
**that connection was never confirmed, only hypothesized.** A live A/B diagnostic (baseline
`a13bb0d`, pre-session, vs current `a3fc220`, post-revert PR #850) was set up but stopped
mid-run at the user's request ("just note in the prompts/# for it to verify first, closing") —
not completed, not ruled in or out.

**Prime suspect, if it turns out to be a real code regression and not just a Hospital data
quirk:** this session's own edit to the `BatchedMesh` frontier-visibility loop in `renderAtTime`
(`time_machine.js`, removing the yellow edge-box — see
`prompts/archive/TM_MOVIE_EXPORT_RETIRED_2026-07-18.md`). The edit looked structurally safe on
inspection (only removed box-creation statements inside an existing `if (frontier[bg])` block,
left `setVisibleAt`/`anyVis`/`_bmHasFrontier` untouched) and `node --check` passed, but it was
never verified LIVE against a real construction-reveal sequence, and it's the most invasive touch
to core visibility logic made this session. Do not assume it's guilty — confirm with the actual
A/B test (script scaffolding left at
`/tmp/claude-1000/-home-red1-bim-compiler/7b94e63d-d49b-4448-bcf1-9dc87c2f742e/scratchpad/
witness_appearance_regression.js`, not yet run to completion — that scratchpad may not survive to
a new session; treat it as a starting sketch, not a trusted artifact, and rebuild the comparison
if it's gone).

**How to verify (do this before anything else in this file):**
1. Two worktrees, same building, same op-log: one at `a13bb0d` (last commit before this session's
   PR #849/#850 touched `time_machine.js` at all), one at current `origin/main`.
2. Drive TM to the identical cursor position on both (Jump-to-start, then an identical short
   Build-then-Stop burst, or better — set `_cursor` directly to the same absolute timestamp on
   both if a reliable hook exists).
3. Count visible vs total guid-bearing meshes AND `BatchedMesh` visible-slot counts on both at
   that identical cursor. If current shows dramatically MORE visible/placed than baseline at the
   same cursor, that's the regression, and it directly explains "built within an hour" as a
   visibility bug, not a duration/rate bug — **fix that first, then re-observe whether item 2's
   complaint still exists at all before touching SEQUENCE_RULES/LABOR_RATES.**
4. If baseline and current show IDENTICAL counts at the same cursor, the regression is NOT in
   `renderAtTime`'s visibility logic, and item 2 below is a real, separate duration-generation
   question — proceed to item 2 as originally scoped.

## Item 2 — ✅ DIAGNOSED 2026-07-18 (root cause found, NOT yet fixed — needs a spec decision first)

**PRIMARY root cause — `locale_loader.js:190-192` top-level REPLACES instead of deep-merges
`LABOR_RATES[TRADE]`, silently dropping any IFC class the active locale file doesn't enumerate:**

```js
if (localeData.labor_rates && typeof LABOR_RATES !== 'undefined') {
  for (var key in localeData.labor_rates) {
    if (localeData.labor_rates.hasOwnProperty(key)) LABOR_RATES[key] = localeData.labor_rates[key];
```

Every `viewer/locales/*.js` file ships its OWN hand-authored, **partial** `labor_rates` block (meant
to attribute a display source string like "RS Means 2024", not to be a complete productivity table).
E.g. `en_US.js`'s `STEEL_ERECTOR.productivity` is only `{IfcBeam:6, IfcColumn:5}` — `IfcPlate` and
`IfcMember` are simply absent; `CONCRETE_GANG.productivity` is only `{IfcSlab:30}` — `IfcFooting`,
`IfcPile`, `IfcReinforcingBar`, `IfcRamp`, `IfcRampFlight` are absent. Because the loader does
`LABOR_RATES[key] = localeData.labor_rates[key]` (whole-object replace, not a merge into the nested
`.productivity` map), loading ANY locale wipes out the canonical `rates.js`/`sequence_rules.json`
entries for every class the locale file didn't bother to list. `injectGantt()`'s `getInstallSecs()`
then finds no productivity match for those classes and falls back to the generic **120-second
(2-minute) per-element default** — vs. their real canonical durations (IfcFooting 4800s → 120s =
**40x faster**, IfcPile 7200s → 120s = **60x faster**, IfcPlate 2400s → 120s = 20x, IfcMember 2880s →
120s = 24x). `locale_loader.js` runs **unconditionally** on every `viewer.html` load (`<script
src="locale_loader.js?v=7">`, self-triggering IIFE on `DOMContentLoaded` — not opt-in).

**Live-browser proof** (headless Chrome, `navigator.language=en-US` → `en_US.js` locale auto-loads —
this is Puppeteer's/most real users' default, NOT an edge case):
```
DROP CHECK: STEEL_ERECTOR_productivity: {IfcBeam:6, IfcColumn:5}   ← IfcPlate/IfcMember GONE
            CONCRETE_GANG_productivity: {IfcSlab:30}                ← IfcFooting/IfcPile/... GONE
            installSecs_IfcPlate: 120 (was 2400 canonical)
            installSecs_IfcMember: 120 (was 2880 canonical)
            installSecs_IfcFooting: 120 (was 4800 canonical)
            installSecs_IfcPile: 120 (was 7200 canonical)
```
**Only 4 of 18 locales happen to match the canonical numbers exactly** (`en_MY`, `ms_MY`, `th_TH`,
`zh_CN` — presumably the developer's own test locale + neighbours) — every other locale (`en_US`,
`en_GB`, `de_DE`, `fr_FR`, `es_ES`, `ja_JP`, `ko_KR`, `pt_BR`, `ar_SA`, `en_AU`, `af_ZA`, `id_ID`,
`bn_BD`, `bl_BD`) silently drops classes and collapses them to the 2-minute fallback. This is a
**GENERAL, locale-triggered defect** — confirmed to affect every building via the same shared
`locale_loader.js` code path, matching the user's own "worse on others too" observation exactly, not
a Hospital-specific data quirk.

**SECONDARY, compounding factor (real, smaller effect, independent of the above) — `schedule_gate.js`
has no cap on concurrent crews per trade:** the resource-concurrency key `el.resource + '|' +
Math.floor(el.top_z/3)` gives every distinct 3m Z-slice its OWN independent, uncapped "crew" per
trade — a tall/many-band building effectively gets one full STEEL_ERECTOR/CONCRETE_GANG crew per
floor-slice running in true parallel, with no global limit on how many crews of one trade can exist
at once. Verified via a Node replica of `injectGantt()`+`ScheduleGate.computeSchedule()` against
REAL element data (not synthetic) for 4 buildings, using CORRECT (non-locale-corrupted) canonical
rates:

| Building | Superstructure elements | parallel resource×band "crews" | compression (serial ÷ actual) |
|---|---|---|---|
| Hospital | 11,947 | 21 | 1.2x (whole-project: 1183 naive days → 366 actual, **3.2x**) |
| HHS Office | 2,412 | 7 | 1.5x (whole-project: 80.8 → 69.5 days) |
| Terminal | 35,061 | 20 | 1.0x (buckets so element-dense the queues stay long regardless) |
| Duplex | 33 | 4 | 1.0x (too small to show the effect) |

This alone does not collapse a phase to "an hour" — it's real but modest (1.2–3.2x) — but it
compounds with the locale bug above, and confirms the concurrency model has no realistic total-crew
cap (no real site runs 20+ independent full crews of one trade simultaneously). Worth a separate fix
decision (e.g. a fixed project-wide crew-pool per trade instead of one per Z-band) — but the locale
bug above is the dominant, order-of-magnitude driver of "built within an hour."

**What's NOT the cause (ruled out this session, with evidence — don't re-check):**
- Not Item 0's `BatchedMesh` edit (see Item 0 above — A/B identical, ruled out first as instructed).
- Not a stale `§GANTT_CACHE_HIT` — Hospital's `tasks` table is empty (0 rows, confirmed via direct
  query), so `_cap` is always null and the path is always `§GANTT_SOURCE generated` — no captured-4D
  overlay masking anything.
- Not `rates/sequence_rules.json` itself — its `LABOR_RATES`/`SEQUENCE_RULES` values are byte-for-byte
  identical to the hardcoded `rates.js` fallback (both say IfcColumn:6, IfcBeam:8, IfcSlab:35, etc.).
- Not a `rates/<locale>.json` template mismatch (the `loadRateTemplate()`/`initRateTemplate()` JSON
  pipeline) — that function is **only called from `boq_charts.html`/`mep_report.html`**, never from
  `viewer.html`/`time_machine.js`. `locale_loader.js` (a completely separate code path) is the actual
  culprit, not the rate-template system the doc's original "where to start" hints pointed at.

**✅ FIXED 2026-07-18, PR bim-ootb#853 (`fix/locale-productivity-deep-merge`)** — user decision: locale
files legitimately having different schedule/productivity conditions is correct (real construction
productivity varies by region), so the feature stays; only the silent data-loss is fixed. Two commits:
1. `locale_loader.js` `applyRateOverrides()`: scalar trade fields (rate_per_day/crew_size/trade name)
   still replace wholesale (a locale's day-rate is a legitimate complete override), but `productivity`
   now merges class-by-class — classes a locale doesn't mention keep their canonical value instead of
   falling back to the generic 120s default. Verified live (Hospital, en_US): `IfcPlate`/`IfcMember`/
   `IfcFooting`/`IfcPile` now retain canonical install times; en_US's own `IfcColumn:5`/`IfcBeam:6`
   overrides still apply correctly. Corrected schedule: Superstructure span 145.4 → **370.2 days**;
   whole-project 255.3 → **403.6 days**.
2. **IndexedDB cache-staleness fix (user follow-up ask):** the code fix alone doesn't reach a browser
   that already generated+cached a schedule under the old buggy logic — `§GANTT_CACHE_HIT` would keep
   serving it forever, since nothing invalidates a cache entry just because the generation code changed.
   Added `_GANTT_CACHE_VERSION` (bumped to 2) folded into the IDB key (`gantt:v{N}:{building}`) — a
   pre-fix cached entry lives under the old unversioned key and is now unreachable, so `activate()`
   gets a clean miss and regenerates correctly. Verified live: seeded a fake entry under the old key,
   confirmed `activate()` (via `tmJumpToPhase`) ignored it and regenerated fresh.

### Original diagnosis brief (kept for the record — superseded by the findings above)
User, live-observing Hospital's Time Machine playback: the Superstructure phase appears to
complete in about an hour of simulated time — "built within an hour all of a sudden" — which reads
as wrong for a building this size (Hospital: 63,182 elements, 101×151×43m, irregular multi-wing
footprint per earlier session records in `prompts/PHOTOREAL_STILL_RENDER.md`). Not yet diagnosed —
this file is the handoff, not the fix.

### Where to start (grounded pointers, not a prescribed path)
- Duration generation lives in `SEQUENCE_RULES`/`LABOR_RATES`
  (`viewer/rates/sequence_rules.json`, phases confirmed this session: `Substructure`,
  `Superstructure`, `Architecture`, `MEP Rough-in`, `MEP Final`, `Finishes`) + `injectGantt()` in
  `viewer/time_machine.js` (auto-injects durations from IFC classes + these two rule sources per
  the file's own header comment). Read `injectGantt` fully before assuming where the bug is — do
  not guess at the formula from memory.
- Check the PER-ELEMENT productivity rate the Superstructure phase's classes resolve to in
  `LABOR_RATES` — a single misconfigured/missing rate (e.g. a rate keyed to the wrong unit, or a
  fallback default that's too fast) could make every Superstructure element install near-
  instantly, collapsing the whole phase into a tiny time window regardless of element count.
- Check for a **parallelism/resource-pool** explanation before assuming it's a rate bug: this
  project's own Time Machine doc header says "Parallel trades: multiple elements active
  simultaneously" and "Round-the-clock 24/7, no weekends" — if Superstructure's resource pool is
  effectively unbounded (every steel/concrete element gets its own crew with no contention), a
  large element count could legitimately compress into a short WALL-clock phase even with
  realistic per-element durations. Distinguish "duration-per-element is wrong" from "concurrency
  model has no real limit" — these need different fixes.
- Cross-check the SAME phase logic against at least one OTHER building (the project's own
  discipline throughout this session: never conclude from one building). If another building's
  Superstructure phase paces normally, the bug is likely Hospital-specific data (e.g. an unusual
  `cls`/element-count distribution triggering an edge case), not the general formula.
- §CACHE_HIT / `§GANTT_CACHE_HIT` — TM caches a generated schedule per building
  (`cachePut('gantt', ...)`, `time_machine.js`). If Hospital's cached schedule predates a rate fix
  made elsewhere in the codebase's history, a stale cache could be showing an old, already-fixed
  anomaly. Rule this out early — `cacheDel`/`tmRefoldSchedule` invalidate it — before chasing a
  live bug that may already be fixed and just not regenerated.

### "Examine how 4D logic is generated if affects all others" — scope of the broader check
User wants to know whether whatever's causing this is a **general defect** (would affect every
building's Superstructure phase, or every phase generated by the same code path) or **Hospital-
specific** (a data quirk in this one building's IFC extraction). Don't stop at "found a fix for
Hospital" — confirm which category it is, since a general defect changes the durations shown for
every building's 4D playback, not just this one.

### What NOT to assume
- Don't assume it's a rate-table typo without reading the actual resolved rate for Hospital's real
  Superstructure element classes (query, don't guess — this project's PRIME RULE: extract, don't
  invent).
- Don't assume it's Hospital-specific without checking at least one other building first.
- Don't treat the TM cache as ground truth without confirming it isn't stale.

## Witness / log tags already available
`§GANTT_CACHE_HIT ops=<n>`, `§GANTT injected=<n> dbElements=<n> sceneMeshGUIDs=<n>, bands=<n>,
<n> days`, `§GANTT_SOURCE generated|cached` — all already fire on TM activation per this session's
own captured logs; read them first before adding new ones.

## Item 2 witness scripts (2026-07-18 — scratchpad, may not survive to a new session; rebuild from
this description if gone, same caveat as Item 0's script above)
- `witness_superstructure_duration.js` — Node replica of `injectGantt()` + real `schedule_gate.js`
  against REAL element data (better-sqlite3 direct DB read) for Hospital/HHS/Terminal/Duplex; produces
  the per-building compression-ratio table above. Uses CANONICAL (non-locale-corrupted) rates since it
  loads `rates.js` directly — this is what exposed the SECONDARY (concurrency-cap) finding.
- `witness_hospital_tm_live.js` — headless-Chrome, drives the REAL `viewer.html` + real
  `locale_loader.js`/`time_machine.js`, calls `window.tmGenerateTimeline()` directly (bypasses the
  mesh-streaming gate that made the natural `?tm=1` activation path time out on Hospital's 63K
  elements under headless swiftshader), then queries `kernel_ops` + `window.LABOR_RATES` directly —
  this is what exposed the PRIMARY (locale_loader replace-not-merge) finding and its live proof.
Both at `/tmp/claude-1000/-home-red1-bim-compiler/60d9b00e-e721-4cf2-9be7-2ca7cccba830/scratchpad/`.
