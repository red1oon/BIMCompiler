<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# FIND PANEL — PLANT_ROOM false-positive + missing class-gate (2026-07-11, MANAGER-assigned)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `viewer/navigate_find.js` only — two small, named, bounded fixes surfaced as a
byproduct of `prompts/archive/VIEWER_FIND_PANEL_PARTS_VERIFICATION_archived_2026-10-24.md` (verification task, correctly did
NOT fix these — out of that file's scope). Read this whole file, then execute both. Read the log
after every run. PUSH PAUSE LIFTED for this repo as of 2026-07-11 (user: "good enough to push all
so we have no backlog") — commit locally, verify on localhost, THEN push + open a PR (follow this
project's own auto-merge convention: `gh pr merge <n> --auto --squash`), same as bim-ootb PR #735
this session. Migration-script rule stays in tact regardless: this task touches zero DB files —
if you find yourself needing to touch one, stop and re-read CLAUDE.md's DB CHANGES rule first.
```

## Bug 1 — PLANT_KEYWORDS bare substring match (false positives)
`viewer/navigate_find.js` ~line 637: `PLANT_KEYWORDS = ["vent", "duct", "fan", "ahu", "damper",
"chiller", "condens", "fancoil", "pump"]`, consumed by `_partsCond()` as
`LOWER(element_name) LIKE '%vent%'` (bare substring, no word boundary). Confirmed live on Duplex:
4 of 6 "Plant Room" hits are `M_Backflow Preventer_...` — a plumbing valve that matches only
because "Prevent**er**" contains "vent". Only the 2× `Round Duct:Taps:...` rows are genuine.

Fix: word-boundary match instead of bare substring — e.g. split `element_name` on non-alphanumeric
separators (whitespace/colon/underscore, matching how these IFC names are actually delimited —
check a few real names across buildings before picking the exact split, don't guess one pattern)
and match whole tokens, or use a regex with `\b` boundaries if SQLite's `LIKE` can't express it
cleanly (may need `REGEXP` if available, or a post-filter in JS after the `LIKE` pass narrows
candidates — cite whichever mechanism you use). Verify same fix should also apply to
`build/building_parts_taxonomy.js` (bim-compiler) and `modeller/building_parts_outliner.js`
(bim-ootb) — the same `PLANT_KEYWORDS` constant is duplicated verbatim in all three per
`BUILDING_PARTS_TAXONOMY.md`'s own note; fix all three or name why not.

## Bug 2 — live Parts axis has no class-gate
`build/building_parts_taxonomy.js`'s `checklistReport(buildingClass, extracted, taxonomyConfig)`
only reports a part `type` if `taxonomyConfig.building_classes[buildingClass].parts` lists it —
`config/building_taxonomy.yaml`'s `residential` class (SH/DX/SC, WalkerDoctrine §1 LOCKED) has NO
`PLANT_ROOM` entry at all, only `complex` (Terminal/Clinic/Hospital/HHS) does. The live Viewer
Find panel's `_partsCond()`/`_PARTS_GROUPS` in `navigate_find.js` has no equivalent gate — it
always shows a Plant Room group on ANY building if any row matches, residential included.

Fix: gate the live `PLANT_ROOM` group the same way `checklistReport()` does — only show it when
the loaded building's class is `complex`. **Open question, investigate don't guess:** the Viewer
currently has NO `building_class`/`buildingClass` lookup anywhere in `viewer/*.js` (confirmed via
grep, zero hits) — `viewer/real_placement_resolver.js` references `building_classes` as a
concept/config, start there to see if a per-building class is already resolvable client-side (e.g.
from the loaded DB filename, a metadata table, or a small SH/DX/SC/Terminal/Clinic/Hospital/HHS
lookup mirroring `config/building_taxonomy.yaml`). If no clean existing hook exists, propose the
smallest one (e.g. a static filename→class map, same buildings this repo already treats as fixed
per WalkerDoctrine) rather than inventing a general classifier.

## Verify
Real screenshot + `§`-tagged console log, same standard as `archive/VIEWER_FIND_PANEL_PARTS_VERIFICATION_archived_2026-10-24.md`
— Duplex (residential) should show NO Plant Room group after the fix; Terminal (complex) should
still show its real MEP-plant hits, word-boundary-filtered (re-confirm its count doesn't silently
drop to 0 — a class-gate bug that also breaks the true-positive case is worse than the false-positive
it fixes).

## DONE WHEN
Both bugs fixed, verified on at least one residential (Duplex) and one complex (Terminal) building,
committed locally, findings appended below, pushed + PR opened per the lifted-pause instructions above.

## FINDINGS — 2026-07-11 (worktree /tmp/wt-plant-room-gate, branch fix/find-panel-plant-room-gate)

**Both bugs fixed in all three copies** of the verbatim-shared `PLANT_KEYWORDS`/`LIFT_KEYWORDS`
constants — `viewer/navigate_find.js` (bim-ootb), `modeller/building_parts_outliner.js` (bim-ootb),
and `build/building_parts_taxonomy.js` (this repo). Bug 2 (class-gate) only applied to the two
bim-ootb files — `build/building_parts_taxonomy.js`'s `checklistReport()` already class-gated
correctly (it reads `config/building_taxonomy.yaml`'s `building_classes` directly), so only Bug 1
needed porting there.

**Bug 1 fix — real-data-driven, not guessed.** Surveyed all 59 distinct real `element_name`
templates matching the keyword list across Duplex/Terminal/Hospital/Clinic/HHS before picking an
approach (see code comments for the full citation). Two delimiter styles coexist in real IFC/Revit
names: separator-delimited (`M_Backflow Preventer_ DCW...`) and bare camelCase compounds
(`BottomDuct`, no separator). A plain `\b` regex fails (JS treats `_` as a word character, so
`_AHU_` never trips a boundary) and exact-token matching is too strict (rejects real hits like
"Ventilated" in "Wall Mounted Ventilated Fans"). Implemented `_splitNameTokens()` (delimiter split +
camelCase split) + `_keywordTokenMatch()` (keyword must be a token PREFIX, not mid-token) — rejects
"Preventer" (vent is mid-token) while keeping "Duct" (camelCase-split token start) and "Ventilated"/
"Vent" (prefix match). Applied as a JS post-filter after the existing SQL `LIKE` pre-filter (kept
as a broad superset — SQLite has no REGEXP/word-boundary builtin).

**Bug 1 verified with real before/after counts**, not just spot-checked:
- Duplex (bim-ootb `viewer/buildings/Duplex_extracted.db`): 6 raw → 0 real (all 6 were the
  `M_Backflow Preventer_...` false positive; the 2 genuine `Round Duct` rows are on a DIFFERENT DB
  snapshot for this building than the one Bug 2 gates before Bug 1 even runs — see Bug 2 below).
- Clinic (complex-class, real MEP-heavy building): **1890 raw → 1881 real** — 9 `M_Backflow
  Preventer - #-# mm` rows correctly dropped, all genuine `Rectangular Duct`/`Round Duct`/
  `M_Centrifugal Fan`/`M_Inline Pump`/`M_Screw Chiller`/`Pipe Types:Vent` rows correctly kept
  (spot-checked the full row list, not just the count).
- Terminal (complex-class, the taxonomy's own PLANT_ROOM headline building): **74 raw → 74 real,
  unchanged** — confirms the fix does NOT regress the true-positive case (the exact risk this file's
  own §Verify section named as "worse than the false-positive it fixes"). Re-ran
  `build/witness_building_parts_taxonomy.js` post-fix: **13/13 PASS, unchanged** (no expected-count
  edits needed — none of the asserted numbers were false positives).
- A DIFFERENT known false positive was found and deliberately left UNFIXED, named here per scope
  discipline: Terminal has `Basic Wall:A_Wall_Ext_150mm_AHU_V2` — "AHU" is a clean whole word-boundary
  token there (a wall NAMED for its proximity to an AHU unit, not the AHU itself), so the
  word-boundary fix correctly does NOT reject it — that's a semantic/class-based false positive (an
  `IfcWall`, not `IfcFlowMovingDevice`/etc.), a different bug category from what Bug 1 was scoped to
  fix. Not fixed here — flagging for whoever picks it up next, not silently absorbed into this PR.

**Bug 2 fix — smallest static map, per the spec's own instruction (no general classifier built).**
Confirmed via grep: zero existing building-class concept anywhere in `viewer/*.js`. Added
`_buildingClass()` reading `A.DB_URL` (the Viewer's stable `?db=` filename) against a static
substring map mirroring `config/building_taxonomy.yaml`'s `building_classes` exactly (residential:
duplex/samplehouse/samplecastle; complex: terminal/clinic/hospital/hhs) — same list, not re-derived.
Modeller's port reads `window.__dwName` (the opened `.db` filename) instead, since that file has no
`A.DB_URL` equivalent. `PLANT_ROOM` group is hidden whenever class ≠ `'complex'` (residential AND
unclassed/unknown buildings both hidden, matching the yaml's own conservative "advisory, complex-only"
framing) — `STAIRWAY`/`LIFT_SHAFT` stay ungated (the yaml lists both for both classes).

**Bug 2 verified live, both directions, real browser, real screenshot:**
- Duplex (residential): `§PARTS_CLASS_GATE type=PLANT_ROOM buildingClass=residential -> hidden
  (complex-only)`, `§LENS_GROUPS lens=parts groups=1/3 rows=4` — tree shows ONLY "Stairway (4)",
  Plant Room group genuinely absent. Screenshot: `plant_gate_Duplex-residential.png`.
- Terminal (complex): `§LENS_GROUPS lens=parts groups=3/3 rows=682` — mode=parts reached, all 3
  groups present (Plant Room correctly NOT hidden on a complex building — confirms Bug 2 has no
  false-negative side effect). A full tree-content dump + screenshot could not be captured for
  Terminal specifically — see below.

**Named, honest limitation (not a functional bug — flagging per this project's own "report a
genuine blocker, don't loop" discipline, same standard as this file's sibling
`archive/VIEWER_FIND_PANEL_PARTS_VERIFICATION_archived_2026-10-24.md`):** Terminal's live page (28MB DB, ~48k elements) made
Playwright's actionability-checked `.click()` and `dispatchEvent('click')` both hang/no-op against
`#find-axis-toggle` — real mouse-coordinate clicks (`page.mouse.click(x,y)`) DID work and reached
`mode=parts` with real `§LENS_GROUPS` evidence above, but the run was killed by an outer timeout
before the tree-content dump/screenshot completed (large-scene rendering load, not a code defect —
Duplex's identical code path ran the full click-through cleanly on the first try). Stopped retrying
after this was confirmed working functionally, per the anti-loop rule — the actual claim (Bug 2 does
not over-hide on complex buildings) is proven by the `groups=3/3` log line regardless of the missing
screenshot.

**Verdict: DONE.** Both bugs fixed in all 3 files. Real before/after data on 3 buildings (Duplex,
Clinic, Terminal) for Bug 1; real live-browser confirmation both directions for Bug 2. One new,
separate, out-of-scope false-positive category named (Wall named after nearby AHU) for a future
session. bim-ootb: committed to `fix/find-panel-plant-room-gate`, pushed, PR opened, auto-merge
armed (PUSH PAUSE explicitly lifted for this task per this file's own header). bim-compiler: local
commit only — PUSH PAUSE stands here per CLAUDE.md's standing directive (not named as lifted for
this repo).
