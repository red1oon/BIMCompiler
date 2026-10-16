# ⚠ DO NOT REMOVE — ✅ RESOLVED 2026-07-18 (PR #877 merged + live, sw v800)
SCOPE: bim-ootb `viewer/streaming.js` (bbox load-placeholder system) — a user-reported visual
anomaly during initial building load: an EXTRA flat, ground-level layer of long parallel bars
("a grating/comb pattern") renders BELOW the normal jumbled cluster of loading-placeholder boxes.
User: "it was not there. This is beginning to happen more and all over... it could be injecting of
some after element not supposed to." (Later also confirmed on Hospital — building-independent.)
STATUS: root cause diagnosed AND fixed — see §ROOT CAUSE + §FIX SHIPPED at bottom. Nothing left
to investigate; kept for the record.

## Evidence
- Screenshot: `~/Pictures/Screenshots/ghost_bbxes.png` (user-renamed from `Screenshot from
  2026-07-18 21-20-34.png`) — Terminal building,
  `Terminal_geo.db` downloading (18%, 11/63MB). Shows the normal multicolor jumbled cluster of
  wireframe loading-placeholder boxes mid-air, PLUS a distinct flat layer of evenly-spaced parallel
  bars near ground level, spanning a rectangular footprint, sitting visually separate/below the
  main cluster.
- User says this is NEW ("was not there") and GROWING ("beginning to happen more and all over" —
  i.e. not a one-building fluke, seems to be spreading/recurring).
- No Time Machine UI is visible in the screenshot (no scrubber/cursor overlay) — this is a PLAIN
  building load, not a TM session, as far as can be told from the image alone.

## Already investigated this session — do not re-walk these, the answers are real
1. **NOT the deliberate `_buildMergedGhost()`/Alt+X ghost mechanism** (`viewer/navigate_find.js`
   `~line 1413`). That system is explicit-trigger-only (Alt+X keypress) or Room-Lens-large-building
   auto-default — neither fires during a plain initial load sequence. Ruled out by reading the call
   sites: nothing in the load path calls `_buildMergedGhost`/`toggleMergedGhost`.
2. **The ONLY load-time placeholder system found**: `viewer/streaming.js` `_drawBboxPlaceholders()`
   (~line 187) — one `THREE.InstancedMesh` per DISCIPLINE, wireframe, built from `elements_meta`'s
   own `bbox_x/y/z` per element, BEFORE real geometry streams in. This is almost certainly "the main
   one" the user refers to (the jumbled multicolor cluster). Structurally unchanged recently — no
   sign of a second call site or duplicate injection in this function itself.
3. **Staffage occupancy grid checked** (`prompts/STAFFAGE_WALKABLE_PLACEMENT.md`, `viewer/effects.js`
   `_buildOccupancyGrid`) — this is a PURE DATA STRUCTURE (a JS array used for placement math), never
   converted into a `THREE.Mesh`/rendered. No visualization code found anywhere for it. Also,
   staffage only runs on explicit Alt+P, never automatically during DB load. Ruled out.
4. **Room-Lens shell-colour commit checked** (`3cfedd7`, `feat/room-lens differentiate colours`) —
   only affects Room Lens MODE's shell palette (restroom/kitchen/bedroom hues), unrelated to the
   load-time bbox placeholder system or any automatic trigger. Ruled out.
5. **NOT ruled out, TOP CANDIDATE — Time Machine re-sweep commit** (`8354c30`,
   `fix(time-machine): streaming re-sweeps TM visibility on new geometry arrival`, PR #859, landed
   TODAY 2026-07-18 10:47am, hours before the screenshot). This commit adds `window.tmResweep()`
   calls into THREE geometry-flush completion points inside `streaming.js` itself:
   `_flushInstanced`, `_flushBboxBatched`, `_consolidateBatched` — i.e. it now runs EXTRA code at
   exactly the moment new placeholder/real geometry batches complete during a load. Its own commit
   message describes it as a no-op when TM isn't active ("zero-cost for normal viewing") — that
   claim is UNVERIFIED for this specific symptom, not re-confirmed in this session. This is the
   single most recently-changed code touching the exact geometry-flush moments where the anomaly
   was observed — start here.

## What's still open — the actual task
1. **Reproduce first, calc-only where possible per this project's law.** Load Terminal (or any
   large building — user says "all over") locally, screen-record or repeatedly screenshot the FIRST
   ~10-20% of the download phase. Confirm the extra flat layer is reproducible, not a one-off
   screenshot artifact.
2. **Identify the extra layer's discipline/color** — `_drawBboxPlaceholders` colors each
   InstancedMesh by `A.DISC_COLORS[disc]`. Log which discipline the flat/grating layer belongs to
   (console `§BBOX_PLACEHOLDERS` line already reports `discs=<n>` — cross-reference against a
   per-discipline row count query). If it's a SINGLE discipline with a large count of long, thin,
   ground-level, grid-arranged real elements (e.g. STR footings/foundation beams), this may be
   HONEST new data becoming visible for the first time (e.g. a discipline whose bbox data was
   previously empty/erroring and recently started populating correctly) — not a rendering bug at
   all. Check `elements_meta`/`element_transforms` directly for that discipline's real row count and
   real bbox shape before assuming a code defect.
3. **Test the `tmResweep()` hypothesis directly**: temporarily no-op `window.tmResweep()` (or check
   `git log -p` on `8354c30` for exactly what it does at each flush point) and reload the SAME
   building/moment — does the extra layer disappear? If yes, that's the confirmed root cause; if no,
   rule it out explicitly and move down the candidate list (git bisect across today's other commits
   touching `streaming.js`/`time_machine.js`: `1f5ca33`, `3cfedd7`, `3bd4d42`, `8354c30` — in that
   chronological order — is the natural bisection range, since the user says "new").
4. **Check "beginning to happen more and all over"** — is the extra layer present on more than one
   building (Terminal only, or also Clinic/Duplex/Hospital)? If it scales with element count or
   discipline mix, that's a strong signal toward the honest-new-data explanation (#2) rather than a
   code defect; if it's uniform/building-independent, that points back toward a code-level regression
   (#5/#3).

## Non-invent boundary (PRIME RULE, this task's own edition)
Do NOT just hide/dispose the extra layer to make the screenshot look clean again without knowing
WHY it's there — if it turns out to be honest real data (a discipline finally rendering that was
silently broken before), removing it would be a regression, not a fix. Diagnose first; only then
decide whether the correct fix is "stop double-injecting" or "this is correct, just unfamiliar."

## Witness plan
- **W-BBOX-GHOST-REPRO**: reproduce the extra layer live, log discipline breakdown + real row counts
  for the suspect discipline(s), screenshot or §-log evidence.
- **W-BBOX-GHOST-TMRESWEEP**: with/without `tmResweep()` wired at the three flush points, same
  building/moment, confirm whether the layer's presence flips.
- **W-BBOX-GHOST-SCOPE**: same repro across Terminal/Clinic/Duplex/Hospital — report which buildings
  show it, to settle the "all over" claim with real numbers, not impression.

## DONE WHEN
Root cause identified and cited with real evidence (not guessed); if a genuine code defect, fixed
and witnessed with a before/after; if honest new data, documented as such (no code change) and this
file's own header updated to say so, so nobody re-investigates the same non-bug later.

## ✅ ROOT CAUSE DIAGNOSED — 2026-07-18 (code-read, cited; NOT yet fixed — fix deliberately deferred)
**Cause: commit `3bd4d42` (PR #839, Photoreal staffage, landed recently) shifted the
`_drawBboxPlaceholders` row layout by one column but only updated 2 of its 5 row producers.**
It inserted `m.element_name` at row index 12 (after `ifc_class`) in BOTH `streamBuilding()`
SELECTs, and moved the bbox reads in `_drawBboxPlaceholders` from `r[12]/r[13]/r[14]` →
`r[13]/r[14]/r[15]` (diff hunks: `viewer/streaming.js` — SELECTs + `var bx = r[13] || 0.3, by =
r[14] || 0.3, bz = r[15] || 0.3;`). Three OTHER call sites still build 15-slot rows with bbox at
indices **12–14** (no element_name slot) and were NOT updated — verified still stale at HEAD
`f052fb0`:
1. **Split-DB `positions.bin` preview** — `posRows` builder, `streaming.js` ~line 1700–1713
   (bbox floats pushed at 12/13/14).
2. **Split-DB `§BBOX_RECOLOR` pass** — `_colorRows` query ~line 1788–1793 selects 15 columns
   ending `t.bbox_x, t.bbox_y, t.bbox_z` (indices 12–14, `element_name` absent). **This is the
   pass whose output is on screen at 18% geo download — the screenshot's state.**
3. **Single-DB `positions.bin` preview (§S281)** — `_posRows` builder ~line 1870–1877, same
   12–14 layout.

**Resulting misread for every placeholder drawn by those 3 paths:** `bx = r[13]` = actual
**bbox_y**, `by = r[14]` = actual **bbox_z**, `bz = r[15]` = **undefined → 0.3 default**. Then
`_scl.set(bx, bz, by)` → three.js scale = (x: bbox_y, y-up: **0.3 always**, z: bbox_z). Every
box is squashed to a 0.3 m-tall slab with its axes rotated: e.g. a ground slab bbox
(60, 40, 0.3) that used to render (60, 0.3, 40) now renders (40, 0.3, 0.3) — a long thin BAR.
A family of evenly-spaced slabs/panels/long elements at ground storey ⇒ the flat parallel-bar
"grating" below the (also distorted, but visually less obvious) jumbled cluster. Single uniform
colour = one discipline's InstancedMesh, consistent with `DISC_COLORS`.

**Why "new" and "all over":** #839 shipped to live days ago; the bug fires on EVERY building
using the positions.bin/split preview paths — building-independent, matches the user's "beginning
to happen more and all over." Not honest new data — it's a rendering regression (open-item #2's
honest-data hypothesis is ruled out: the DB bbox values are fine, the reader indexes are wrong).

**`tmResweep`/`8354c30` EXONERATED** (was the file's top candidate): `window.tmResweep()` is
`function() { if (_active) renderAtTime(_cursor); }` — a no-op unless Time Machine is active, and
it only toggles visibility of existing meshes, never creates geometry. Ruled out by code read.

**Fix when authorized:** make the 3 stale producers emit the 16-slot layout (null/absent
element_name at index 12 is fine — reader only needs bbox at 13–15), or better, have all
producers share one row-shape helper so the next column insert can't desync them. Witnesses
W-BBOX-GHOST-REPRO (before/after screenshot on Terminal split load) still apply; W-BBOX-GHOST-
TMRESWEEP is unnecessary (exonerated above).

## ✅ FIX SHIPPED — 2026-07-18, PR #877 (`6774257` on main), LIVE on GH Pages, sw v799→v800
- The 2 positions.bin producers now emit the 16-slot layout (null element_name at 12); the
  §BBOX_RECOLOR SELECT now includes `m.element_name`. All 5 producers ↔ reader aligned.
- **Anti-recurrence guard** (the "without breaking again" clause): `_drawBboxPlaceholders` now
  counts rows shorter than 16 slots and reports `short_rows=<n>` on the `§BBOX_PLACEHOLDERS`
  line + a `§BBOX_ROW_SHIFT` console.warn when non-zero — a future layout desync warns loudly
  instead of silently distorting geometry.
- **W-BBOX-GHOST-REPRO (localhost, Terminal split load, geo.db held 30 s via Playwright route):**
  BEFORE (main `cdcfdcd`): grating of flat parallel bars reproduced —
  `~/Pictures/Screenshots/ghost_bbxes_before_localhost.png`. AFTER (fix):
  `§BBOX_PLACEHOLDERS total=48428 shown=48428 step=1 discs=7 mobile=false short_rows=0`, true
  element heights, no grating — `~/Pictures/Screenshots/ghost_bbxes_after_fix.png`.
- **W-BBOX-GHOST-TMRESWEEP:** exonerated by code read (see §ROOT CAUSE) — not run, not needed.
- **W-BBOX-GHOST-SCOPE:** settled by mechanism, not per-building repro — the desync is in the
  shared preview path, so every building on the positions.bin/split path showed it (user
  confirmed Hospital too); the fix is equally building-independent.
- Live smoke: `red1oon.github.io/bim-ootb/viewer/streaming.js` contains the guard + fixed
  SELECT; `sw.js` at v800. No other 13–15 index readers affected (line 930 reads streamQueue —
  fed only by the two already-correct 16-col SELECTs; `_positionRows`' other consumers read
  indices 4–6 only).
