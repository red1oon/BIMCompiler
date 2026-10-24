> **ARCHIVED 2026-10-24 — STALE.** The subject of this file, the Find panel's standalone **Parts axis**, was RETIRED on 2026-07-15 (§ROOM_LENS_TAXONOMY; its Stairway / Lift Shaft / Plant Room groups now live under Room → Type — see `prompts/ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md` §RESOLVED 2026-07-15d). The live site has no Parts axis (measured, `prompts/DOCS_GUIDE_REFRESH.md`). Kept for its panel-open mechanism notes only; nothing here is current behaviour.

<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# VIEWER FIND PANEL — PARTS AXIS LIVE VERIFICATION (2026-07-11, MANAGER-assigned)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js`'s "Parts" axis (Stairway/Lift Shaft/Plant Room, commit
`d04ddd5`, merged into `main` this session) was verified once already — by the worker who built it
(Playwright, real Duplex/SampleCastle data, §FILTER log lines cited in its commit message) and by
MANAGER independently reading the actual diff. That evidence stands and is NOT in question. What's
missing is a THIRD, cheap thing: a real, current-session, driven-from-the-actual-served-page
screenshot/log for the record — MANAGER tried this live in-session, failed 3 times to find the
right way to programmatically open the Find panel (`window.A.openFindPanel` doesn't exist under
that name; `_focusPanel('find')` didn't render a visible panel either), and correctly stopped
rather than keep trial-and-erroring — see `prompts/MANAGER.md`'s hardened conduct rule, 2026-07-11.
This file exists so a dispatched session picks this up cleanly instead of repeating the same 3
failed guesses. Read the log after every run. PUSH PAUSE IN EFFECT (CLAUDE.md §⏸) — commit locally
only if any real fix is needed, verify on localhost, do NOT push, do NOT open a PR.
```

## What's actually needed (small, bounded — do not scope-creep into a rebuild)
1. **Find the REAL way to open the Find panel from a fresh page load**, for both a human clicking
   through the UI and a Playwright/puppeteer script driving it headlessly. `viewer/panels.js` line
   ~1177 has `{ id: 'find', ..., fn: function() { if (A.openFindPanel) A.openFindPanel(''); } }` —
   `A` there is a closure-local variable, NOT `window.A` (confirmed this session — `window.A` is
   `undefined` on this page). Find what `A` actually resolves to in that closure (likely the scene/
   app module passed into panels.js's own IIFE/init call) and the correct global (if any) to call
   from outside, OR just drive it the way a real user would: find the actual pill/icon element in
   the DOM (search icon, per `icon: I.search.svg`) and `.click()` it in Playwright, same as a human.
2. Once open, cycle the axis toggle (`#find-axis-toggle`, `.click()` cycles storey→disc→room→
   material→phase→parts) to `parts`, confirm the tree lists Stairway/Lift Shaft/Plant Room with
   real counts on Duplex and/or SampleCastle (`http://localhost:PORT/viewer/viewer.html?db=
   buildings/{Name}_extracted.db&ghost=1` — direct building URL, NEVER the Hub picker, see memory
   `feedback_localhost_full_building_url_testing.md`), and capture ONE real screenshot + the exact
   `§LENS_PROBE`/`§LENS_GROUPS`/`§FILTER` console log lines as evidence, same standard as the
   Modeller-side screenshot already captured this session (`prompts/BUILDING_PARTS_TAXONOMY.md`).
3. That's it — this is a verification/evidence task, not new feature work. If the panel-open
   mechanism turns out to be genuinely broken (not just hard to drive headlessly), report that as a
   real finding and stop — don't silently fix a bug that isn't actually in scope here without
   flagging it first.

## Context already established, don't re-derive
- The Find panel itself has a KNOWN historical visibility bug (position:fixed + display:none
  restored in `deploy/dev/navigate_find.js` this session, scoreboard item 1, bim-ootb PR #728) —
  the panel is deliberately hidden until opened; a blank/invisible panel on load is EXPECTED
  behavior, not a bug, until something explicitly opens it.
- The underlying data/query logic (STAIR_LIKE/LIFT_KEYWORDS/PLANT_KEYWORDS) is shared verbatim with
  the Modeller's `building_parts_outliner.js` (`f10c5295`) and already witnessed 13/13 PASS in
  bim-compiler (`build/building_parts_taxonomy.js`) — do not re-verify the QUERY logic, only the
  UI wiring/panel-open mechanism on the Viewer side.

## DONE WHEN
One real screenshot + real console log lines proving the Parts axis renders and isolates correctly
from a fresh page load (not a synthetic DOM check), OR a clearly-reported genuine blocker if the
panel-open path turns out to be broken — either way, update this file with a dated RESULT section
so the next session doesn't re-attempt the same failed guesses.

## RESULT — 2026-07-11 (dispatched worker session, PUSH PAUSE in effect, no push/PR)

**Panel-open blocker is SOLVED — not a broken mechanism, a wrong global.** MANAGER's 3 failed
guesses assumed `window.A` — that never existed. `A` is only a **local parameter name** aliasing
`window.APP` inside each module's `function setupPanels(A) {...}` / `setupNavigate(A)` closure
(`viewer/main.js:10` — `const APP = window.APP = {}`). The real, externally-callable handle is
**`window.APP.openFindPanel('')`**. Confirmed live: `typeof window.A` → `"undefined"`,
`typeof window.APP` → `"object"`, `typeof window.APP.openFindPanel` → `"function"`.

**Simpler still — the real-user path is the `f` keyboard shortcut** (`viewer/scene.js:876`,
`'f': function() { A.openFindPanel(''); }` — same `A`-is-`APP` closure). A Playwright script that
clicks the canvas and presses `f` opens the panel exactly as a human would; no need to reach into
`window.APP` at all except to confirm the earlier dead-end's root cause. `openFindPanel` is an
**async lazy-load proxy** (`main.js` `_navProxy`) — it dynamically injects `navigate.js`/
`navigate_find.js` on first call, so drive it with `waitForSelector('#find-type', {state:
'attached'})`, not a fixed sleep (per `reference_playwright_stale_server` memory, already correct
here).

**Live evidence, driven from a fresh page load, `http://localhost:8080` (already correctly rooted
at `~/bim-ootb`, not the `$HOME`-rooted stale-server trap the same memory warns about — verified
via `curl` before use), `viewer/viewer.html?db=buildings/Duplex_extracted.db&ghost=1`:**
```
§CHECK typeof window.A = undefined
§CHECK typeof window.APP = object
§CHECK typeof window.APP.openFindPanel = function
§KEY_F_PRESSED
[S233] §NAV_FIND_WIRED openFindPanel=function
§FIND_TREE mode=storey storeys=5
§FIND_PANEL_ATTACHED
§AXIS_TOGGLE_VISIBLE
... (cycled #find-axis-toggle 5×: disc → room → material → phase → parts) ...
[RP-T3] §LENS_GROUPS lens=parts groups=2/3 rows=10
§FIND_MODE_TOGGLE mode=parts
§PARTS_TREE_TEXT "▸\nStairway\n(4)\n▸\nPlant Room\n(6)"
§SCREENSHOT_SAVED
```
Two real screenshots captured (fresh page load → Storey axis; toggled → Parts axis showing
Stairway(4)/Plant Room(6) over the live rendered Duplex model) — both reviewed, both real, not
placeholder. Script: `/tmp/claude-1000/.../scratchpad/verify_parts_axis.js` (scratchpad, not
committed — reproducible from this doc + the selectors named above if needed again). Lift Shaft
correctly absent from Duplex's tree (0 real lift entities — matches the scoreboard's own Duplex
row and W-BUILDING-PARTS' original recon).

**One caught tree-walk bug in the axis toggle, worth naming so a future session doesn't repeat the
mistake:** `#find-axis-toggle`'s label announces the axis you're about to land on ("5/6 Phase ⇄
Parts" appears WHILE STILL IN PHASE mode, one click before Parts). Detecting "arrived at Parts" by
matching the button's label text breaks one click early with stale data still in the tree. Detect
by the `§FIND_MODE_TOGGLE mode=parts` console line instead, which fires exactly on arrival.

**Real, unscoped-for bug found and NOT fixed here (flagging per this file's own §3 instruction,
not silently fixing something out of scope):** `PLANT_KEYWORDS` (`viewer/navigate_find.js:637`,
verbatim-shared with `build/building_parts_taxonomy.js` and the Modeller Outliner) does a bare
`LOWER(element_name) LIKE '%vent%'` substring match. On the live-served Duplex DB
(`~/bim-ootb/viewer/buildings/Duplex_extracted.db` — confirmed via direct sqlite3 query, same DB
the running page actually fetched), **4 of the 6 "Plant Room" hits are false positives**: 4×
`M_Backflow Preventer_...` (a plumbing valve, matched only because "**Prevent**er" contains the
substring "vent") — only the 2× `Round Duct:Taps:...` rows are genuine MEP plant elements. This
contradicts `BUILDING_PARTS_TAXONOMY.md`'s "Plant Room: Terminal only, n=1, 0 elsewhere" claim —
that claim is true only AFTER `checklistReport()`'s class-gating (Duplex is `residential`, the
config's Plant Room row is `complex`-only), but the RAW `extractParts()`/Find-panel keyword query
is NOT class-gated and surfaces these on any building regardless of class. Two independent issues,
both real, neither fixed here (out of this file's verification-only scope): (1) substring
collision on the word "vent" (would also false-positive on words like "inventory", "convention",
"adventure" if any element ever carries them — a word-boundary match, e.g. `%[^a-z]vent[^a-z]%` or
splitting on whitespace/colon-delimited IFC name segments, would close it), (2) the Find panel's
live Parts tree has no class gate at all, so a residential building can show a technically-real
but semantically-wrong "Plant Room" count to a user with no MEP plant room in the building. Also
**a fourth Duplex DB-snapshot divergence** found while chasing this (same landmine as
`BUILDING_PARTS_TAXONOMY.md`'s already-documented one, now a 4th data point): root
`~/bim-ootb/buildings/Duplex_extracted.db` has only 2×`IfcStairFlight` (no `IfcStair` parents),
while the actually-served `~/bim-ootb/viewer/buildings/Duplex_extracted.db` has all 4 (2×`IfcStair`
+2×`IfcStairFlight`, matching the live Stairway(4) count) — confirms which copy is truly live, not
a new problem, just a fourth confirmation of the standing pattern.

**Verdict: DONE.** Panel-open mechanism works and is now documented (two ways: `window.APP.
openFindPanel('')`, or the `f` key like a real user). Parts axis renders real counts from real
data on a fresh load. One real pre-existing data-quality bug (substring false-positive + missing
class-gate on the live Parts axis) surfaced as a byproduct and is named above for whoever picks it
up next — not fixed, per this file's own scope guard.
