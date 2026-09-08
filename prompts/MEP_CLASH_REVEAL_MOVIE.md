# ⚠ DO NOT REMOVE — MEP Clash-Reveal Movie lane. Read the log after every run. Full history behind
every closed item below lives in `prompts/archive/MEP_CLASH_REVEAL_MOVIE_archive_2026-09-06.md`
(1,878 lines, consolidated out of this file 2026-09-06 to stop it growing past 2,400 lines) — this
file keeps only a compact recap of what shipped plus everything still ACTIVE. Read the archive only
when you need the original derivation/measurement behind a bullet below.

## Shipped, closed, merged to main — compact recap (full detail in the archive above)
Started 2026-08-07 as a triage against a competitor MEP-coordination movie capture: the finding was
this needed a new CAMERA MODE + VISIBILITY MODE over data already real (clash detection, navigate-to-
clash, discipline colors, x-ray, material-quality boost all pre-existed — nothing invented from
scratch). Built and merged since, in order:
- **Auto camera-path generation** (dive → walk → flyback → round2 → tail → pullback → orbit beats,
  authored-waypoint driven) — the base film mechanism everything else below rides on.
- **§CLASH_FILM_P1/P2/P3** — mesh-true (triangle-exact, not bbox) clash pairs rendered as persistent
  glowing markers baked into the film from frame 0, with on-screen `[tol/clash mm]` labels
  (§P2.4/§CLASH_LABEL_HUD_FAMILY), sky-wash artifact measured and fixed (§CLASH_FILM_SKY_WASH), the
  additive-marker "disturbs nothing else" claim proven against a control bake.
- **§CLASH_FILM_SHINE_THROUGH**, **§CLASH_FILM_FLAT_FILTER** (flat/touch contacts dropped from the
  film's set), **§CLASH_MARKER_OVERLAP_BOX** (marker = the real overlap solid's oriented box, not a
  fixed severity cube) — all measured, merged (PRs #1686, #1688, #1689).
- **§MESH_OVERLAP_DEPTH** — the label's depth figure is the real mesh-true penetration, not the OBB/SAT
  proxy; `depthMeshM`/`overlapMaxM` now travel on every judged pair record.
- **§CLASH_HUD_CARD** — the Reveal round's big-stats rotation gained a "N mesh-true clashes flagged"
  card, sourced from `A.clashFilm.stats()`.
- **§NIGHT_BUILDUP_GATE** / **§NIGHT_PL_INTENSITY_HEURISTIC** — night-mode room illumination now obeys
  the construction buildup schedule; fixture PL intensity is an explicitly-labeled style convention
  (not real photometric data).
- **§SUN_ARC_TOPOUT_SNAP** — shipped, then **REVERTED** 2026-09-06 (session 3) on the user's own ruling
  that the original linear 55°→6° sun-elevation formula was correct all along, pre- and post-topout;
  do not re-propose the topout snap without a new user ask.
- **§PL_TOPOUT_UNPIN** (#1690) — post-topout interior fixtures ease from the staged Alt+S cut (0.5) to
  nav Night Mode's tuned intensity (1.0); pre-topout output is byte-identical. MERGED.
- **§ELEMENT_LABEL** — spec only, written 2026-08-27, never built. Still open if anyone picks it up,
  but not part of the active work below.
- Full 195.8s/4,699-frame 1920×1080@24 `--clash` real-GPU film delivered twice: 2026-09-05
  (`Hospital_clash_FULL_1080p24_2026-09-05.log`, 5,476s wall-clock) and 2026-09-06
  (`Hospital_FULL_allsystems_2026-09-06.mp4`, 5,630s wall-clock) — the second run is what surfaced
  §PENDING.5 below (missing HUD stats).
- Session-3 close (2026-09-06): sun-arc revert + PL topout-unpin both merged to main, clash lane
  formally CLOSED at that point — everything from §PENDING onward below is NEW work opened the same
  day by the next session's user requests, not a reopening of the closed lane.

## §PENDING — for the next session, not started (2026-09-06)
1. **Silent-bake size selector has no time estimate — 2/3 resolutions now measured, real GPU, `/tmp/wt-clash-pending`.**
   `cinema_path_editor.js` ~L936's resolution chooser (`this window`, `1280x720@15`, `1920x1080@24`,
   `2560x1440@24`) still shows no estimated bake duration next to it — UI display not yet built (see
   below). Measured, full natural-length 195.8s film, `--clash`, real GPU (RTX 4060), same building
   (`Hospital_silent_local`), run from `/home/red1/bim-ootb` (the worktree lacks the gitignored
   `buildings/*.db` symlinks — run resolution benches from the main checkout, not the worktree):
   | Resolution | Frames | Wall-clock | s/frame avg |
   |---|---|---|---|
   | 1280×720 @15fps | 2,937 | **3,095s** (`§CLI_BAKE_WALL totalSec=3095 fileOk=true`, this session) | 1.054 |
   | 1920×1080 @24fps | 4,699 | **5,476s** (prior session) / 5,630s (same-session rerun) | 1.165–1.198 |
   | 2560×1440 @24fps | 4,699 | **NOT MEASURED — user has explicitly HELD this bake, do not launch
     without a go-ahead** | — |
   Sub-linear with pixel count (720p has 44% of 1080p's pixels but took ~55-57% of the time, not 44%) —
   consistent with a real fixed per-frame JS/geometry/`STILL_REFINE` cost that does not scale with
   resolution; do not extrapolate 1440p from this ratio, measure it too once cleared to run.
   **Gotcha hit and fixed this session, worth recording:** a `§CINEMA_PACING ... override=true
   running=60.0s` (or 24.0s, 278.8s) line appears TRANSIENTLY in the first ~5s of every bake's own
   startup log — this is `cinema_maxq.js`'s documented "throwaway plan" probe used only to trigger the
   lazy DB loader (`__maxqBake`'s else-branch, `a.cinemaPathPlan(60)` — see its own code comment). It is
   NOT the bake's real committed duration and must NOT be read as a signal to abort. The real, final
   duration is whatever `§MAXQ_START frames=N fps=F` and `§CPE_APPLIED total=Xs` report a few seconds
   later, once the throwaway probe settles. (First attempt this session was killed prematurely on
   exactly this false alarm — wasted one restart, recorded so it isn't repeated.)
   **What this bake IS and ISN'T, stated so a fresh session doesn't go looking for something that was
   never there (user, watching it: "I am at a lost what did u do extra in it. Nothing... it is just a
   720p version of the 1080p").** Correct, by design — `Hospital_res_bench_720p15.mp4` is a pure
   RESOLUTION-TIMING BENCHMARK, run from pristine `/home/red1/bim-ootb` (main, unmodified) purely to
   measure wall-clock at 720p for this table. It contains NONE of this session's other in-flight work
   (discipline-pair clash highlight, storey-by-storey reveal, the HUD stat fixes) — those live as
   uncommitted code in separate worktrees/branches (`/tmp/wt-storey-reveal`, `/tmp/wt-hud-stats`) that
   were never merged into the checkout this benchmark ran from. Do not treat this file as a preview or
   regression check of those features — it predates them entirely. The first bake that WOULD show any
   of them is whichever session merges those branches and re-bakes.
2. **Clash panel LIST does not show the mesh-true depth figure.** Confirmed by code read: `measure.js`'s
   list renderer never touches `depthMeshM`/`overlapMaxM`, only `verdict`/`reason` from row `c[9]`. The data
   is already there — `A._qualifyClashRows` calls the exact same `A.clashNarrow.qualifyRows()` the film uses,
   so every list row's `c[9]` already carries `depthMeshM` — this is a display-only addition, zero new
   computation, same `[tol/clash mm]` formatting `clash_labels.js` already has.
3. **No cross-caller cache for the narrowphase judgment.** Confirmed by code read: `_boxRun` is reset fresh
   on every `qualifyRows()` call and `A.clashNarrow.lastRun`/`.runs` only LOG past results, never consulted
   to skip recomputation. So if the film builds its 271/270-pair judgment during a bake and the user then
   opens the clash LIST panel in the same session, the list's own `_qualifyClashRows` call re-derives
   everything from scratch — no reuse either direction. A persistent, disk-backed cache (the user's own
   "one time cache" ask, `~/.cache/bim4d/`-style) remains unbuilt.
4. **Tolerance values in `clash_rules.json` have no sourcing.** Checked: no comment, no citation, no
   reference anywhere near the file to an industry standard (Navisworks/Solibri/ISO 19650 or similar) — they
   are bare numbers (25/50/75 mm by discipline pair) with no documented origin. Whether they match an
   industry convention is a knowledge claim, not something this repo can currently prove. User's own plan:
   later expose these in a JSON config the Clash panel can edit — not started.

**Perf review of tonight's code — explicitly CLOSED, not a task.** No measured performance problem exists
to point at (narrowphase build ~4.5s one-time per bake, negligible; the 8/12-sample per-frame budget is a
deliberate, already-understood tradeoff). Do not open a speculative "find savings" investigation — same
shape as the ambient-dimming dead end and the earlier 288K-token inconclusive lane, both closed by finding
there was no sourced target, not by more searching.

## §STOREY_HIGHLIGHT_REVEAL — SPEC (2026-09-06, user idea, not started)
**User:** the closing orbit has an uneventful ~5s slowdown; fill it with each storey shining through in
sequence (blue → green → yellow → orange → blue) while the HUD shows per-storey stats (area, room count,
door count — "anything that delights a BIM user"), storey label on screen during the beat.

**Before building — measure and check, do not assume:**
1. **Confirm the dead window is real and get its actual duration** from real pose/pacing data for the plan
   in question — do not build against the user's impression of "~5s" without measuring it first.
2. **Habitable-room area/count is NOT reliably available.** Checked `Hospital_silent_local.db`: **zero
   `IfcSpace` elements**. `rooms_meta` carries only a building-wide `room_count=7`, no per-storey rows found.
   Do not invent room stats for storeys that have none — same "real data or the card is dropped" rule
   `bigStatsBuild` already holds every other HUD card to.
3. **Door counts per storey ARE real and queryable** — `elements_meta.ifc_class='IfcDoor'` grouped by
   `storey` (measured: Hospital Level 1 = 114, Level 2 = 56, Level 3 = 96, Level 4 = 88, Level 5 = 73).
4. **Floor area per storey is only a slab-bbox footprint proxy** (`element_transforms` bbox_x×bbox_y on
   `IfcSlab`, e.g. Level 1 ≈ 98.6×90.3 m) — not true room area. If shown, label it a footprint estimate,
   never silently presented as "floor area."
5. Reuse whatever per-storey color-tint and on-screen-caption mechanism already exists (discipline palette
   ticks, room-title captions) rather than building a new subsystem — very likely a recombination of
   existing infrastructure, not new code from scratch.

Assessment: good instinct, turns dead time into real content instead of padding, consistent with the
film's existing "real numbers or nothing" discipline. Main risk is inventing room-area figures this
building's data doesn't have — scope to what's genuinely queryable per storey.

## §STOREY_HIGHLIGHT_REVEAL — IMPLEMENTATION (2026-09-06, session 2, branch
`feat/storey-highlight-reveal` in `/tmp/wt-storey-reveal`, bim-ootb). BUILT, verification pending
(see §PROOF below — written before the concurrent full-GPU bake in `/tmp/wt-full-bake` freed the GPU;
this session did all spec/code/static-check work first per the dispatch's own GPU-contention rule).

**⚠ WINDOW SUPERSEDED BY §STOREY_REVEAL_WINDOW_CORRECTION FURTHER DOWN THIS SECTION.** This first
pass filled the whole `orbit` beat (`plan.beats.rise..1`, ≈8.0s). The user corrected this mid-session:
the real ask is "final 5 seconds ending before orbit" — the last 5s of the PRECEDING `pullback` beat,
freeing the rest of `pullback` for a separate discipline-pair clash-highlight feature dispatched to
`fix/hud-clash-measure-stats`. Every `plan.beats.rise..1`/"closing orbit" wording below this line
describes the ORIGINAL (wrong) window; read the correction subsection for the shipped one — the CODE
was updated to match the correction, this prose was not rewritten in place (append-don't-rewrite).

**§CORRECTION to this spec's own item 2 above.** "Zero IfcSpace, do not invent room stats" is
INCOMPLETE, not wrong: `Hospital_silent.db` genuinely has zero *extracted* `IfcSpace` rows, but it
DOES have 8 *compiled* ones — `navigate_find.js`'s §ROOM_INJECTOR_NEEDLE (`A.ensureRooms` /
`_ensureRoomsCore`) ran `room_walker.js` at some earlier session and PERSISTED the result as
`spatial_structure` rows `type='IfcSpace'`, guid prefix `RM_`, plus `rooms_meta.room_count=7`. This is
a real, non-invented, one-time-computed population — same standing as any other derived geometry this
project already trusts (DLOD, room-walker polygons elsewhere) — just a SPARSE one. Verified directly
against the DB (`sqlite3`, not guessed):
```
RM_Level_1_1/_2/_2b/_3   parent_guid=1fOVjSd7T40PyRtVEklS6X (Level 1, z≈0)
RM_Level_2_1/_2/_3       parent_guid=0oRwkC2RfAvvAvj9R4cdde (Level 2, z≈6.1)
RM_Level_4_1             parent_guid=2Tdc5UdArAQ9tMqUtQX16W (Level 4, z≈16.0)
```
8 raw rows, `rooms_meta.room_count=7` (the `_2`/`_2b` pair on Level 1 likely dedupes to one room in
that count — not re-derived here, flagged as a fact for whoever next touches `rooms_meta`). Per-storey
compiled room count used by the card below: **Level 1=4, Level 2=3, Level 3=0, Level 4=1, Level 5=0,
Level 6=0, Level 7A=0, Level 7=0** (join on `spatial_structure.parent_guid` → the storey's own guid →
that guid's `name`, NEVER string-parsed off the room's own `name` field, which only happens to embed
"Level N" as display text). §VACUOUS convention applied: a storey's room-count of 0 here means "no
room was compiled for it", not "measured zero rooms" — the HUD card DROPS the room clause at 0 rather
than printing a fact the data doesn't actually support (same discipline `4D_MODEL_INTEGRITY.md` §E
already holds every other proxy to).

**§STOREY_REVEAL_WINDOW — the dead stretch, measured, not assumed.** Read straight from the
concurrently-running full bake's own log (`/tmp/wt-full-bake/out/Hospital_FULL_allsystems_2026-09-06.log`,
`--db Hospital_silent_local --clash --gpu real`, the SAME stored `cinema_path` this lane's other
features already share):
```
§MAXQ_START frames=4699 fps=24                                          → totalSec = 4699/24 = 195.79s
§CINEMA_BEATS dive=0.094 spin=0.094 out=0.353 pullout=0.361 flyback=0.462
              round2=0.750 rise=0.959 (dur=195.8s) route=authored waypoints=8
```
`beats.rise=0.959` is the boundary "the reveal round's own pacing ends and the plain closing orbit
begins" (effects.js's own "standard ending: one plain orbit… CINEMA_END_DECEL_SEC=3s roll to stop").
`(1-0.959) × 195.8s ≈ 8.02s` of orbit remains after that boundary, of which effects.js's own
`CINEMA_END_DECEL_SEC=3` is a scripted roll-to-stop at the very end — leaving **≈5.0s of the orbit at
full, unchanging pace, circling the already-finished, already-revealed building with nothing new on
screen** — this is the "~5s" the user's own impression named, now with a source. The fix does not
carve out that narrower 5.0s sub-window specially: it fills the WHOLE `[beats.rise, 1]` span (all
≈8.0s) with the storey sequence, because tinting a storey during the final roll-to-stop is harmless
(it is a camera-motion rule, not a "nothing may change on screen" rule) and using the full span gives
a cleaner per-storey time budget (see dwell math below).

**Storey list — real, ordered, queried live (not baked into the plan).** Same exclusion
`cpe_resource_panel.js`'s own `NOT_PLACEHOLDER` guard already applies elsewhere in this file (drop
`''`/`'Unknown'`), plus a new exclusion for the ` Ceiling`/` TOS` pseudo-storeys elements_meta also
carries (verified they are NOT storeys a BIM user would count — Hospital carries duplicate
`elements_meta.storey` values for e.g. `Level 2`, `Level 2 Ceiling`, `Level 2 TOS` all distinct
strings). Ordered by mean element Z (`elements_meta` JOIN `element_transforms`), same real-Z-ladder
`cpe_room_title.js`'s own `_storeyLadderForGroups()` already builds. MEASURED for Hospital — **8
physical levels**, not 5:
```
Level 1 (z≈169) < Level 2 (z≈175) < Level 3 (z≈180) < Level 4 (z≈185) < Level 5 (z≈189)
  < Level 6 (z≈194) < Level 7A (z≈197) < Level 7 (z≈200)
```
(the DB's own local frame offsets these ~169m from the IFC-relative elevations quoted earlier in this
file — same building, same ordering, different datum; not a discrepancy.) The color cycle is therefore
implemented as a REPEATING 4-color table (blue/green/yellow/orange), `idx % 4`, generalizing past the
user's literal "blue→green→yellow→orange→blue" (which is exactly this table read for 5 items) to
however many physical storeys a building actually has — Hospital's 8 read
blue,green,yellow,orange,blue,green,yellow,orange.

**Dwell time — an even FRACTION of the window, not a fixed second count.** The pure function
(`A.storeyRevealVisualAt`, `cpe_storey_reveal.js`) never needs the film's total seconds at all: storey
index and each storey's own progress `u` are both computed purely from `(tNorm - rise) / (1 - rise)`
divided into `1/n` slots, so the per-storey wall-clock dwell falls out as `(1-rise) × totalSec / n`
automatically, whatever `totalSec` a given plan/building has. For Hospital's measured case that is
`8.02s / 8 ≈ 1.0s per storey` — enough to read the caption + card fade (12-15% in/out of the slot) but
a genuinely fast cut, not a lingering dwell like room-titles' 3s `MIN_HOLD`. This is a deliberate,
named design choice (not extracted data): the effect is a rapid sequential "flash-through", not an
explanatory pause on each storey, so no MIN_HOLD-style floor was added — a building with many more
physical storeys than Hospital would get proportionally faster per-storey cuts inside the same-length
orbit rather than losing storeys off the end. Flagged as an open scaling question below, not hidden.

**Data sources — one line per HUD number, per this file's own "extract or drop" rule:**
| HUD fact | Source | Real / estimate |
|---|---|---|
| Door count | `elements_meta` COUNT WHERE `ifc_class='IfcDoor' AND storey=?` | REAL, complete census — 0 shown as a genuine fact (e.g. Level 7A has 0 doors) |
| Footprint | MAX(`element_transforms.bbox_x`), MAX(`bbox_y`) over that storey's `IfcSlab` rows | LABELED ESTIMATE (bbox, not true polygon area) — omitted if the storey has no slab row |
| Room count | COUNT `spatial_structure` `type='IfcSpace'` whose `parent_guid` resolves to that storey's own guid | REAL (compiled/injected), but OMITTED from the card at 0 — §VACUOUS, see correction above |

**Visual mechanism — tint, not isolate.** `A.filterStorey` (panels.js, hide/show via zero-scale
matrix / `setVisibleAt`) was the mechanism this dispatch pointed at first, but isolating one storey at
a time contradicts "shine through IN SEQUENCE" — a viewer would lose the whole building's silhouette
every beat. Built instead on **hba_lens.js's proven MeshPort tint pattern**, applied per-storey instead
of per-guid: regular meshes get an emissive-color save/restore (same as `tools.js`'s night-glow, and
the exact `nlp.js highlightGuids` pattern hba_lens's own header cites); `InstancedMesh`/`BatchedMesh`
get a per-slot diffuse tint via `setColorAt`/`getColorAt`, walking `A._instanceMeta[mesh.id]` /
`A._batchMeta[mesh.id]` filtered on `.storey === name` — the SAME per-instance metadata
`A.filterStorey` itself already reads for its own `.storey` filter, so this is provably the same
partition, not a second one that could disagree. A `touched[]` list + one `_restoreTint()` gives exact
undo on every storey change and at every bake/preview exit path (mirrors `A.cpeRevealApplyVisual`'s
own `plan=null` "force restore" contract verbatim). The whole building therefore stays visible and lit
normally throughout; only the active storey glows the cycle color.

**Confirmed clean of Find-panel UI (user, mid-session: "Find panel is a landed feature that carries
such storey-by-storey semantic after room injection [...] we can thus take from it readily").** The
intent was always to reuse the landed STOREY SEMANTIC (the same per-instance `.storey` partition the
Find panel's own storey axis and `A.filterStorey` already read, itself downstream of the room-injector
needle where a building has no native storeys) — never to open the Find panel's own UI during a silent
film. Grepped `cpe_storey_reveal.js` for `_setTreeMode`/`openFindPanel`/`elTree`-reveal calls: zero
hits. The implementation only ever touches mesh emissive color / instance tint — no panel, no tree,
no DOM the viewer would see on screen. Confirmed, not just intended.

**HUD card — no new draw code.** `A.storeyRevealStatCardAt(plan, tNorm)` returns the exact
`{card:{big,label,sub}, idx, n, opacity}` shape `cpe_resource_panel.js`'s own tail-panel rotation
(`A.tailPanelAt`) already produces, so it composites through the SAME `A.bigStatsCompositeOntoCanvas`
— including that function's own progress dots, which double for free as "storey N of 8". `big` = door
count (always real), `label` = "doors · Level N", `sub` = the footprint estimate and/or room-compiled
clause, each individually omitted when its own source is absent. `cinema_maxq.js`'s per-frame loop
overrides the normal highlight-card rotation with this card for exactly the `[rise,1]` window
(`_resInfo` is already null there by construction — the trade-roster panel only ever populates before
`_inReveal`, which this window is always past).

**Caption — reused draw routine, one new visual cue.** `A.storeyRevealCaptionAt` returns
`{name, opacity}` through the identical override chain `A.cpeRevealCaptionAt` already established
(checked first in both `cinema_maxq.js`'s bake loop and `cpe_room_title.js`'s `roomTitleLiveTick`,
mutually exclusive with the disc-parade caption by construction since that caption's own window closes
at `beats.rise`, exactly where this one opens) — drawn via the SAME `A.roomTitleCompositeOntoCanvas`
the whole caption system already uses, zero new text-rendering code. The one addition: the caption text
is prefixed with a colored circle emoji (🔵/🟢/🟡/🟠 matching the tint index) — a 3D emissive glow may
read subtly from a wide orbit shot, so the color cycle the user asked for is ALSO stated unambiguously
in the HUD text, at zero new drawing code (canvas `fillText` already renders emoji glyphs).

**Wiring — additive, off by default, checkbox parity with the clash lane.** New file
`viewer/cpe_storey_reveal.js` (`setupCpeStoreyReveal`, registered in `main.js`'s `_mods` list and
`sw.js`'s precache list, `sw.js` `CACHE_VERSION` bumped v1155→v1156 per this project's own SW-bump
rule). New `#cpe-storey-reveal` checkbox in `cinema_path_editor.js`'s panel, OFF by default, same
`_markPreviewStale()`-only handler as `#cpe-clash` (this feature does not move a beat boundary — it
reads the existing `plan.beats.rise` — so no `_replanFilm()` is needed, unlike `#cpe-reveal`'s
handler). Persists through the panel's IndexedDB `panelState` round-trip exactly like `clash` does —
**NOT** added to the SQL `cinema_path` table's own flag columns (`rows[0][14..17]`, which only ever
carried `buildup`/`roomTitle`/`reveal`/`dayCounter`) — `clash` itself was never added there either, so
this is parity with the newest sibling feature, not a new gap. New `--storey-reveal`/`--no-storey-reveal`
tri-state flags in `cli_silent_bake.js`, merged into the resolved override the same way
`--clash`/`--no-clash` already are. `effects.js`'s `A.cinemaPathPlan(durationSec, ov)` wrapper gained
one more staged module var (`_cpeStoreyReveal`, save/restore around the call, same pattern as
`_cpeReveal`) and the plan builder's returned object gained `storeyReveal: !!_cpeStoreyReveal` — the
ONLY new field on the plan; the storey list/stats are queried live, never baked in.

**⛔ NOTED, not fixed (shared with `#cpe-clash`, not introduced by this feature):** neither `clash` nor
the new `storeyReveal` flag participates in `_isEdited()`'s dirty-check, so toggling ONLY one of them
on a path that is otherwise byte-identical to its saved version may not register as "edited" and could
be skipped by Save. This is `clash`'s own pre-existing gap (confirmed by reading `_isEdited()` in
full — `clash` is absent from it too); `storeyReveal` was written to match it rather than silently
diverge, but the underlying gap itself was not investigated or fixed in this session — flagged for
whoever next touches `_isEdited()`.

**Files touched:** `viewer/cpe_storey_reveal.js` (new), `viewer/cinema_maxq.js`, `viewer/effects.js`,
`viewer/cinema_path_editor.js`, `viewer/cpe_room_title.js`, `viewer/main.js`, `viewer/viewer.html`,
`viewer/sw.js`, `cli_silent_bake.js`.

### §STOREY_REVEAL_WINDOW_CORRECTION (2026-09-06, mid-session, user relayed via coordinator)
**Everything above this point in the section describes the FIRST-CUT window
(`plan.beats.rise..1`, the `orbit` beat, ≈8.0s) — WRONG, superseded here, code already updated to
match this correction before any verification bake ran.**

**User's exact words** (relayed): *"Then final 5 seconds ending before orbit, use that for storey
info as described in prompts/#"* — following an earlier message assigning a DIFFERENT feature
(clash-pairs-by-discipline highlight + HUD) to "the last pull out part of the movie."

**Real numbers, re-derived from the log, not trusted from the relay verbatim** (own instruction:
"verify the real numbers yourself"). `effects.js`'s `§CINEMA_PACING` line, confirmed present in
multiple real logs this lane already produced (`Hospital_noclash_clip_2026-09-05.log` etc.), byte-for-
byte:
```
§CINEMA_PACING natural=195.8s = dive 7.9 + spin 0.0 + walk 75.0 + pullout 1.5 + flyback 19.8 +
  round2 56.0 + tail 10.0 + pullback 17.6 + orbit 8.0
```
Read against `effects.js`'s own pacing code (`tR = tV + _riseFolded/_shapeTotal`, `_riseFolded =
_useSec.rise + tailSec`, and the comment on `tR` naming it the "orbit start"): **`plan.beats.rise` IS
the pullback→orbit boundary**, confirming the relay's structure was right. `pullback` = `_useSec.rise`
(17.6s, the UNFOLDED pull-back-onto-orbit-band budget, distinct from `_riseFolded` which also contains
the 10.0s disc-parade tail) — so "the last 5 seconds of pullback, ending before orbit" is unambiguous
and does NOT touch the tail's own caption zone.

**Fix, in code, not just in this doc:**
- `effects.js` (`_cinemaPathPlan`'s pacing block, right after `tR` is computed): new
  `§STOREY_REVEAL_WINDOW` log line + `_storeyRevealWindowSec = min(_useSec.rise, 5)` +
  `_storeyRevealWindowFrac = _storeyRevealWindowSec / _shapeTotal` (same denominator `tR` itself is
  computed against, so this stays correct under any user re-timing without this function ever needing
  `durationSec` again downstream). Plan's `storeyReveal` field changed shape from a plain boolean to
  `{ on, windowFrac }`.
- `cpe_storey_reveal.js`'s `A.storeyRevealVisualAt`: window changed from `(b.rise, 1]` to
  `(b.rise - sr.windowFrac, b.rise]` — i.e. ends AT `beats.rise` (inclusive — the last storey's card
  hands off smoothly on the very frame the orbit begins) rather than starting there.
- All "closing orbit" wording in checkbox hints/console logs (`cinema_path_editor.js`,
  `cinema_maxq.js`, `sw.js` changelog) updated to say "final 5 real seconds of pull-back, ending at
  the orbit start" instead.

**Re-verified offline** (no GPU needed for this part — pure-function logic, `THREE` undefined,
`A.dbQuery`/`dbQueryFirst` mocked with the same measured Hospital values as before): rebuilt the
Node `vm`-sandboxed test against the REAL measured numbers (`rise=0.9591`, `windowFrac=5/195.8=
0.02554`, `windowStart=0.93356`) and swept the ENTIRE film (`t=0..1` step `0.0002`) asserting
**zero non-null hits outside `(windowStart, rise]`** — i.e., a direct regression test proving the
feature no longer fires anywhere inside the `orbit` beat itself (the exact mistake being corrected).
`§STOREY_REVEAL_LOGIC_TEST pass=33 fail=0`, `§STOREY_REVEAL_TINT_DEGRADE threw=0`.

**Coordination with the parallel `fix/hud-clash-measure-stats` lane** (not yet dispatched as of this
correction; the coordinator briefs it with this window once it is): that feature owns the REST of
`pullback` (170.2s→182.8s, ≈12.6s) for a discipline-pair clash-highlight + HUD; this feature owns only
the last 5s (182.8s→187.8s). Both append cards into the SAME `cpe_resource_panel.js` rotation
machinery — this session's own cards are added as an independent OVERRIDE of the `_statInfo` slot for
its own narrow window only (see the "Wiring" paragraph above), not a change to `bigStatsBuild()`
itself, so there is no shared array/function body for the two features to collide inside. If the other
lane instead extends `bigStatsBuild()`'s returned array (the append-only pattern the coordinator asked
for), the two remain structurally independent: this feature's window check (`storeyRevealVisualAt`)
is false everywhere the other lane's cards would show, and vice versa by construction (disjoint time
windows), so neither can silently overwrite the other's rotation slot.

### §PROOF (pending GPU) — fill in after `pgrep -af cli_silent_bake` returns empty
Plan: `node cli_silent_bake.js --db Hospital_silent_local --storey-reveal --clash --gpu real --clip
0.928:0.962 --width 1280 --height 720 --fps 24 --out /tmp/.../storey_reveal_verify.mp4 --log
/tmp/.../storey_reveal_verify.log` (reuses the SAME stored path everything else in this file bakes
from — no `--reveal` flag needed, the stored path already has it on; `--no-buildup`/full-length not
needed, a `--clip` straddling the CORRECTED window `[0.93356, 0.9591]` with a little slack on both
sides is enough to exercise all 8 storey transitions plus confirm silence just outside it). Verdict
lines to grep for and quote here once run: `§STOREY_REVEAL_WINDOW` (the exact boundary this bake
computed, to cross-check against the numbers above), `§STOREY_REVEAL_LIST`, `§STOREY_REVEAL_STATS`
(×8), `§STOREY_REVEAL_TIMING` (×8, one per storey entry), `§STOREY_REVEAL_TINT` (meshesTouched>0 on at
least one storey), and a clean exit (no uncaught error, `§CPE_STATS_TAIL`/resource-panel lines
present just OUTSIDE the clip's storey-reveal sub-window but silent DURING it, confirming no
double-draw).

## §PENDING.2/.3/.4 CLOSED — 2026-09-06, verified live, real GPU, worktree `/tmp/wt-clash-pending`
Worked top-to-bottom per the list above (item 1 below, items 2-4 here — order doesn't matter for
independence, GPU availability decided the sequencing: these three are code+log changes, no full
bake needed, so they went first while the already-running full 1080p film bake
(`Hospital_FULL_allsystems_2026-09-06.mp4`, `§CLI_BAKE_WALL totalSec=5630` — the film promised at the
end of the last session, now delivered) had the only GPU. Branch `fix/clash-pending-items` off
main@5daec9e0.

**2. Clash panel LIST depth display — DONE.** `viewer/measure.js` `_renderClashList`'s row loop: a
CLASH-verdict row now appends the same `[tolMm/clashMm]` fact string `clash_labels.js`'s on-screen
markers already draw, via the now-shared `A.clashLabels.factRow` — display-only, `nv.depthMeshM` was
already on the row (§MESH_NARROWPHASE), no new computation.

**3. Cross-caller narrowphase cache — DONE.** `viewer/clash_narrow.js`: `A.clashNarrow.pairCache`,
a session-lifetime (page-boot-scoped) map keyed by `guidA|guidB`. `judge(i)` checks it first; a hit
skips the SAT/triangle-exact test entirely and reuses the prior verdict object, landing in the exact
same `counts` bucket (`obbRejected`/`obbSurvivors`+`meshTrue`/`meshClear`) a fresh judgment would.
Only DEFINITIVE verdicts (not UNKNOWN — geometry-not-resident is retried, never frozen wrong) are
cached. New `§CLASH_NARROW_CACHE pair=... hits=... misses=... cacheSize=...` log line proves reuse
happened (not just that the map exists) — flags `NO-OP` when hits=0 so a cold-run isn't misread as a
working cache.

**4. Tolerance sourcing — RESEARCHED, closed as "no citation exists, values are in-range"; JSON
editor — DONE, already existed, now reachable from the panel.**
- Sourcing: no internal doc or `docs/` reference cites a standard for the 25/50/75mm values (grepped
  the whole repo, zero hits for Navisworks/Solibri/ISO 19650/BIMForum). Web search confirms there is
  no universal mm standard to cite — clash tolerances are project-/team-chosen by convention industry
  -wide; example values commonly cited (5mm structural, 20mm ductwork) are the same order of magnitude
  as this project's 25-75mm range. Conclusion: not sourced from a specific standard, not out of line
  with common practice either — correct to leave as locally-owned defaults, nothing to "fix."
  ([Clash Detection in BIM: Tolerances, Reports, and Issue Resolution](https://designsyncstudio.com/clash-detection-in-bim-tolerances-reports-and-issue-resolution/))
- Editable JSON: `panels.js`'s `_jsonRegistry` already had a `clash_rules` entry wired through the
  generic Settings JSON editor (`§S282c`, `loadJsonWithOverrides`/`_openJsonEditor`) — the user's "later
  expose this" plan was already half-built, just not reachable FROM the Clash panel. Exposed
  `A._jsonRegistry`/`A._openJsonEditor` (were closure-private) and added a ⚙ gear next to the tolerance
  slider in the clash LIST header (`measure.js`, delegated click on `listDiv` so it survives
  `_refreshClashList`'s innerHTML replacement) that opens the SAME editor — download-to-repo-file is
  the existing persistence path (browser can't write repo files; matches this project's own
  patch-file convention for DB changes).

**Verified live** (`probe_clash_pending23.js`, real GPU, `Hospital_silent_local.db`, pair MEP|STR,
broad=200 rows):
```
§CLASH_NARROWPHASE pair=MEP|STR broad=200 ... meshTrue=44 ... ms=121 msPerPair=0.606
§CLASH_NARROW_CACHE pair=MEP|STR hits=0 misses=200 cacheSize=200 NO-OP(first run this session, or all-new pairs)
§CLASH_NARROWPHASE pair=MEP|STR broad=200 ... meshTrue=44 ... ms=5 msPerPair=0.025
§CLASH_NARROW_CACHE pair=MEP|STR hits=200 misses=0 cacheSize=200
§CP23_RESULT broad=200 pass1(hits=0,misses=200,ms=121.2) pass2(hits=200,misses=0,ms=5) depthTagCount1=2 sameVerdicts=true gearPresent=true registryHasClashRules=true
§CP23_VERDICT verdict=PASS
```
24x faster on the cache hit, byte-identical verdicts between the cold and warm pass (item 3's actual
requirement — reuse must not change the answer). Item 2's `[mm/mm]` tag rendered live; item 4's gear
+ registry both present.

**Regression check** (`witness_clash_mesh_narrowphase.js`, real GPU, full building, 68,526 broad-phase
rows): ran on this branch AND on pristine `main`@5daec9e0 for comparison — **identical** on both:
`pass=8 fail=2 ran=68526`, same two pre-existing failures (I3 "every CLEAR is really clear",
I5 case `S7b_touch_mesh_agrees`, n=326 disagree both runs, `meshTrue=6749` TOTAL both runs). These two
failures pre-date this work (confirmed on unmodified main, not introduced here) and are out of this
lane's scope — not touched, not claimed fixed.

Branch not yet pushed/PR'd — holding until item 1 (below) finishes on the same worktree's sibling
bakes, to open one PR covering the whole §PENDING list rather than three small ones.

## §PENDING.5a — ORIGINAL REPORT (superseded below by §PENDING.5b's root-cause + build)
## §PENDING.5 — user feedback on the full 195.8s bake (2026-09-06, `Hospital_FULL_allsystems_2026-09-06.mp4`)
**User, watching the full film:** *"the HUD info left out the Measure and Clash stats."* Not investigated
this session — record precisely, don't guess the fix:
- **Clash stat card** (`"N mesh-true clashes flagged"`, `§CLASH_HUD_CARD`) DOES exist in code and its
  gating condition (`cf.built && cf.broad > 0`) should have been true for this bake (`--clash` was on,
  `CLASH_FILM_BUILD` ran, 270 pairs). Next session: confirm whether it actually rendered during the
  Reveal round's card rotation in this specific film — if the code fires but the rotation window/duration
  just didn't land on it for the viewer to notice, that's a pacing/rotation-share question, not a missing
  feature. Check via the film's own log (`§CPE_BIG_STATS cards=...`) whether the clash card was IN the
  built set at all, first — that settles built-vs-shown before touching rotation logic.
- **"Measure" stats** — no such HUD card exists anywhere in `bigStatsBuild()` today, checked. Unclear
  what the user means by it (the Measure tool's own saved measurements? a building measure like total
  floor area/volume, distinct from the clash/element/programme cards already there?) — **ask before
  building**, don't guess which one and build the wrong card.

## Session closed 2026-09-06 (Sonnet) — handoff to next session
**⚠ STALE — a sibling session's own closeout note, overtaken by the work below it in this same file
(the coordinator kept going past this point in the same running session, dispatching the §PENDING.5
SPEC immediately below). Left in place for the timeline, not a real stopping point — read past it.**
Full film bake (`Hospital_FULL_allsystems_2026-09-06.mp4`, 4,699 frames, 93.8 min wall, `fileOk=true`)
confirms everything shipped tonight together in one real run: reverted linear sun arc, PL topout-unpin,
clash pulses, oriented-box markers, tolerance/mm labels, HUD clash card. `§PENDING` items 1-4 are picked
up by a parallel Sonnet session (`/tmp/wt-clash-pending`, `/tmp/wt-storey-reveal` — both real, checked,
not this session's to touch) — items 2/3/4 coded and read-verified, item 1 blocked on GPU availability
(now free). §PENDING.5 above is new, untouched. Next session: pull the parallel session's status first,
then §PENDING.5.

## §PENDING.5b — IMPLEMENTATION (answers §PENDING.5a's two open questions, see CURRENT STATE at file end)
## §PENDING.5 — SPEC (2026-09-06, session 4, branch `fix/hud-clash-measure-stats`,
`/tmp/wt-hud-stats`). User's 3 clarifying messages resolved: (1) append Measure+Clash stats into the
HUD during reveal; during the pullback beat, highlight clash pairs BY DISCIPLINE SET and flash the
matching disc-vs-disc count in the HUD, in sync. (2) "Measure stats" = the Measure tool's own saved
measurements (distances/areas), not a building-wide area/volume figure. (3) The final 5s before orbit
is OUT OF SCOPE — reserved for the sibling storey-reveal lane (`/tmp/wt-storey-reveal`).

**A. §CLASH_HUD_CARD built-vs-shown — ROOT CAUSE FOUND, ordering bug, not a rotation/pacing bug.**
Read `cinema_maxq.js` directly (not re-derived): `_bigCards = A.bigStatsBuild(...)` (§CPE_BIG_STATS,
was line 1497) ran BEFORE `await A.clashFilm.build()` (§CLASH_FILM_P1, was line 1506) in the bake's
per-bake setup, every single bake. On a fresh page load — exactly the user's one-shot full-film bake —
`A.clashFilm.stats()` therefore always answered `built:false` at the moment `bigStatsBuild()` read it,
so `cf.built && cf.broad>0` was never true and the card was silently dropped, EVERY time, regardless of
`--clash` or pair count. (A second bake in the same tab without reload would have hidden this — a stale
`_built:true` from the prior bake — which is why it read as intermittent/pacing rather than structural.)
**Fix:** reorder — clash film build now runs first; `bigStatsBuild()` moved to run immediately after it,
still inside the same per-bake setup, still gated on `_roomTitle && _bkState` exactly as before. Zero
new state, zero behavior change for `--no-clash` bakes (clash block still no-ops instantly when off).

**B. Per-discipline-pair clash cards — groupby over `clash_film.js`'s own `_pairs`, no new judgment.**
New `A.clashFilm.statsByDiscPair()`: groups the already-judged mesh-true `_pairs` array by
`discA|discB` (same normalize-order convention `clash_film.js` line 214/252 already uses — `a<b?a+'|'+b
:b+'|'+a` — not `clash_narrow.js`'s private `pairIdOf`, which is unexported; same formula, restated
locally, zero drift risk since it's one ternary). Returns `[{key,discA,discB,count,indices}]` sorted by
count desc, logs `§CLASH_HUD_PAIR_CARDS`. `bigStatsBuild()` turns each group with `count>0` into one
card (`{big,label:'A vs B clashes',sub,src,discPairKey}`) — additive to the `out` array, existing
aggregate clash card untouched. A building with one federated MEP|STR pair gets one new card; a
building with zero clashes gets zero (§VACUOUS, no card, not a 0-card) — same `bigStatsBuild()` house
rule the rest of the file already holds every card to.

**C. Pullback-window highlight-by-discipline-pair — reuses `setFade`, no new visual mechanism.**
New `A.clashFilm.highlightDiscPair(key|null)`: loops `_pairs`, `setFade(i,1)` for every index whose
`discA|discB` matches `key`, `setFade(i,0)` (plain ambient pulse — the file's own existing "everyone
breathes" state) for every other index; `null` clears back to all-ambient. Pure reuse of the phase-2
per-instance fade channel the file's own header already documents ("a selected pair must hold solid
while every other pair keeps breathing") — no second highlight mechanism.

**Window derivation — from `plan.beats`/`plan.reveal`/`plan.sec`, not hardcoded, not re-baked to find.**
`effects.js`'s own `cinemaPathPlan()` already returns everything needed on the plan object:
`beats.reveal` (tV, round-2 end) and `beats.rise` (tR, orbit start) bound the combined tail+pullback
span; `reveal.tailSec`/`reveal.riseSec` (== `sec.rise`) are the UNFOLDED seconds of the tail-caption
sub-phase and the true pull-back-camera sub-phase that effects.js's own §CPE_DISCIPLINE_REVEAL_PULLOUT
comment says are blended across that span (tail slows the same pull-back motion, then it "regains its
normal pace"). `tailShare = tailSec/(tailSec+riseSec)` recovers the same ratio the speed-blend already
implies; `pullbackStart = tV + tailShare*(tR-tV)` is where the tail's caption-cycling ends and the true
pull-back begins. Per the dispatch's explicit boundary (not this session's own reading of the sibling
lane's spec, which describes its own window differently — see NOTE below): `pullbackEnd = tR -
5/plan.durationSec`, i.e. stop 5 real seconds before orbit starts. Logged as `§CLASH_HUD_PULLBACK_WINDOW`
with every term that went into it, `INCONCLUSIVE` (not a silent skip) when the plan carries no beats or
the window collapses to ≤0 width.
**NOTE — RESOLVED, was a stale read, not a real conflict.** This session flagged the sibling
storey-reveal lane's PROSE as saying its window is the whole `[beats.rise,1]` orbit beat (≈8.0s) — that
was the FIRST-CUT text, already superseded by `§STOREY_REVEAL_WINDOW_CORRECTION` further up this same
file (added by the coordinator mid-session): the storey lane's shipped window is `(rise - 5s, rise]`,
i.e. the identical "last 5 real seconds before orbit" boundary this session derives independently as
`pullbackEnd = tR - 5s`. **Both lanes agree on the same boundary, computed two different ways — cross-
checked, not just asserted:** this session's `tR - 5/durationSec` and the storey lane's `windowFrac =
5/195.8`, `windowStart = rise - windowFrac`, land on the same instant. Nothing to reconcile.

**Wiring — inside the existing Reveal-round `_inReveal` branch, no new top-level branch.** Since
`pullbackStart > tV > tP = _revealU` (reveal round active), the pullback window is always a SUBSET of
the existing `_inReveal` span. Inside it: when `_tnFilm` falls in `[pullbackStart,pullbackEnd)` AND at
least one disc-pair card exists, the tail rotation is forced to `A.bigStatsAt(pairCardsOnly, filmSec)`
instead of the normal `A.tailPanelAt(allCards,...)`, and `A.clashFilm.highlightDiscPair(shownCard.
discPairKey)` is called the same frame — same card, same highlight, one clock. Outside the window (or
with no disc-pair cards) the normal all-card rotation runs exactly as before, and
`highlightDiscPair(null)` is called once on the transition out, so no stale highlight survives into the
orbit/storey-reveal window. `§CLASH_HUD_HIGHLIGHT` logs on every pair change.

**D. "Measurements saved" card — `A.measureLabels`, per dispatch; a MORE PERSISTENT source exists but
was not wired (out of scope, flagged).** `bigStatsBuild()` gains one more card reading `A.measureLabels`
(`measure.js`) directly: count + up to 3 real `p1.distanceTo(p2)` values for distance-type entries,
dropped entirely when the array is empty (no fabricated "0 measurements" card). Checked further this
session, beyond the dispatch's own grep: `measure.js` DOES call
`UniversalHistory.recordEvent('MEASURE', label, {a,b,dist})` on every completed distance measurement
(measure.js ~1312-1318), which pushes into `common/history_bar.js`'s own `localStorage`-backed
per-building tree (`HB.push` → `_persistSave` → `localStorage.setItem(_cfg.treeKey,...)`) — genuinely
MORE durable than `A.measureLabels` (survives a page reload within the SAME browser profile, where
`A.measureLabels` does not). **Not used as this card's source**: `HistoryBar.list()` — the only public
read API — returns `{i,kind,label,applied}` only, never the stored `ref` (the actual `a`/`b`/`dist`)
that would be needed to build a real number here; exposing it would need a small additive read-only
export on `common/history_bar.js`, a SHARED cross-app module (also used by ERP per its own header
comment) — judged out of scope for a HUD-stats task and NOT built this session. Flagged for whoever
next touches that file.
**Practical caveat, stated plainly (per dispatch instruction):** `cli_silent_bake.js` always launches
Chrome against a fresh, throwaway `--profile` directory (`PROFILE = '/tmp/silent-bake-profile-'+PORT`
unless overridden, and every dispatch/witness invocation seen this session passes its own fresh
`$FRESH`/timestamped dir) — so BOTH `A.measureLabels` and the more-durable localStorage history above
start empty on every unattended scripted bake. This card will realistically never fire in a silent CLI
bake unless a human interactively Alt+M-measures inside that exact same browser profile first, then a
bake is run reusing that SAME `--profile` path. It is real, correctly-gated, and more useful in the
interactive Alt+M live preview than in production silent bakes — not a broken feature, just a narrow
one, and the user should know that going in rather than finding an empty HUD slot and wondering why.

**Files:** `viewer/cinema_maxq.js` (A fix + C window/wiring), `viewer/clash_film.js` (B `statsByDiscPair`
+ C `highlightDiscPair`), `viewer/cpe_resource_panel.js` (B cards + D card in `bigStatsBuild()`).
Verification: fresh short `--clip` bakes, real GPU, `§`-tagged lines only — no PROOF subsection exists
yet, fill one in here when the bake runs (GPU was occupied this session by the sibling
`/tmp/wt-clash-pending` 720p resolution-timing bench; waited rather than running concurrently, per this
lane's own GPU-contention rule).

## §ENDING_CHOREOGRAPHY — the closing beats, settled with the user (2026-09-06, session 5)
The three lanes below are ONE continuous shot. Real seconds are from `§CINEMA_PACING natural=195.8s`;
fractions from `§CINEMA_BEATS` on the shipped Hospital path. **The user watched a 720p bake of this and
ruled on each beat — do not re-open these without a new ask.**

| Window | Beat | What plays |
|---|---|---|
| 160.2–170.2s | `tail` | disc parade; each trade lights ONLY the clashes it brings (§CLASH_DISC_ARRIVAL) |
| 170.2–182.8s | `pullback` | the 7 disc-PAIR sets walked one at a time, starting with the backdrop pair |
| 182.8s | hand-off | markers HIDDEN (not ambient — §STOREY_REVEAL_MARKERS_OFF), building whole |
| 182.8–187.8s | last 5s of `pullback` | storey flash-through under X-RAY, bottom 5 storeys, ~1.0s each |
| 187.8–195.8s | `orbit` | Measure totals, 4 cards, 2.0s each — the WHOLE orbit, no clash cards |

**§CLASH_DISC_ARRIVAL — the assignment rule (the load-bearing idea).** A clash cannot be attributed to a
trade that was already on site: it belongs to whichever of its two disciplines arrived LATER. Every pair
lands in exactly one parade slot; pairs whose BOTH disciplines are backdrop (ARC/STR — `effects.js`'s
`bump()` excludes the shell from the parade by design) go to a `backdrop` bucket fired when the shell
returns solid. MEASURED, Hospital: `PLB=0 FP=38 ELEC=33 MEP=133 backdrop=66 total=270 sumCheck=OK`,
running 0→38→71→204→270. **The naive alternative ("light every pair containing D") double-counts FP|MEP
and ELEC|MEP and orphans ARC|STR entirely — 66 of 270, 24%.** The offline test carries a control
asserting the naive rule really does differ (299 vs 270), so it cannot pass vacuously.
`§CLASH_DISC_ARRIVAL_LOGIC_TEST pass=11 fail=0`.

**USER RULINGS, verbatim, that shaped this — treat as settled:**
- *"HUD cards for the last part is at best effort. Been too fast is fine. Need not add more secs to it.
  We can forego top floors if the time frame does not allow. Qualitative above quantitative."* → the 5s
  window is FIXED and never widened; the storey list TRUNCATES to keep ≥1.0s each (§STOREY_REVEAL_FIT,
  Hospital 8→5, top floors dropped).
- *"0 need not be shown as the idea with HUD is to be best effort and it is abstract, align to what is
  been shown."* → PLB brings no clash, so its slot shows NO card and clears the highlight.
- *"HUD cards has its role which is overall. The clash pair and now these measures are incidental during
  scene fly thru."* → **the standing split.** Overall stats = HUD cards. Anything measuring a specific
  thing the camera is passing = anchored marker. This resolves the earlier "all stats in cards only"
  reading: it governs OVERALL stats, and never applied to the `[tol/clash mm]` marker labels.

### §ENDING_DEFECTS — four found by the user watching the bake, all fixed (2026-09-06)
1. **Pullback opened on the wrong card.** `bigStatsAt` indexes off ABSOLUTE film seconds, so a bounded
   window opens wherever the global rotation happens to be: measured `ELEC|STR` for 0.6s before reaching
   the intended `ARC|STR`, and 7 cards × `CARD_SECONDS`=4.5s (31.5s) overran the 25.9s window, cutting
   the tail and repeating the first. New `A.bigStatsAtSpan(cards, u)` maps a window onto exactly ONE
   pass. VERIFIED live: `ARC|STR` at frame 287 then even 89-frame spacing through all 7.
2. **§STOREY_REVEAL_TINT_SHARED_MATERIAL — the storey glow painted the whole building, and persisted.**
   ROOT CAUSE, and the reason the user's own pointer ("Did u find the logic from Find Panel > Storey?")
   was right: `A.filterStorey` (`panels.js:711`) partitions by PER-OBJECT visibility — `obj.visible`,
   `filterInstancedMesh`, `filterBatchedMesh`. The tint copied that partition but wrote
   `o.material.emissive`, and **materials in this viewer are SHARED and cached** (`A._matCache`, the same
   cache `A.toggleXray` walks), so one storey's meshes repainted every other mesh using those materials.
   The same sharing made the restore a NO-OP: the second mesh sharing a material saved the ALREADY-TINTED
   value as its "original", so restore wrote the tint back. **Fix: clone once per DISTINCT material (not
   per mesh — that would be thousands), assign to that storey's meshes only, dispose on restore, put the
   original material object back.** LESSON, general: emissive/material writes are NOT a per-object
   channel in this codebase; only visibility and per-instance `setColorAt` are.
3. **Markers did not cease.** `highlightDiscPair(null)` only drops to ambient PULSING — still on screen.
   New `A.clashFilm.setVisible(v)` hides the meshes wholesale, from the storey window to end of film,
   restored on the forced-restore exit path so it cannot leak into the next bake.
4. **The closing orbit replayed clash cards.** The Measure card took only the last 3s, so the normal
   all-card rotation owned the rest of the orbit. Window is now the whole `[beats.rise, 1]`.

**§STOREY_REVEAL_XRAY — user asked: "should the whole building go 'O'cclusion or bbx frame or x-ray?"**
Answer taken: **X-RAY**, scoped to the beat and self-restoring. All three modes already exist as the
landed Alt+Z cycle (`A.cycleXrayBboxMode`) — reuse, not new code. Bbox discards the model (too abstract
for a beat whose point is "info-rich BIM model"); isolating the storey contradicts "shine through". The
lit storey's cloned material is forced `opacity=1` while the rest of the building sits at X-Ray's 0.3 —
that contrast is what makes an interior storey read from orbit distance. ⚠ `cinema_maxq`'s own
`§CINEMA_XRAY_RESET` clears x-ray at bake start, so this MUST stay a scoped beat, never a global toggle;
`_xrayByUs` guarantees only an x-ray WE engaged is ever undone.
**§STOREY_REVEAL_PULSE** — *"it should be shine thru and then cease, not persist"*: each storey glows for
the first `LIT_FRAC=0.72` of its slot and the tint comes down for the rest, so the sequence reads as
separate pulses. Card and caption keep running through the dark part.

## §FLYTHRU_DIMENSIONS — CONSOLIDATED 2026-09-07. Everything before this in the FLYTHRU band was
## replaced; this section is the whole current spec. NOTHING IS WIRED INTO A BAKE YET.

**What it is.** During the fly-through, the film measures the building and draws the measurement on
screen: standard architectural dimension cues (extension lines, inward arrow heads, value in mm), plus
a shine-through outline of the box being measured. Purpose, in the user's words: *"show capability not
quantity"* and *"demonstrate right away the other unknown strengths of our BIM project"*.

### 1. THE RULE THAT SHAPES EVERYTHING — one cue per capability
**User: "Again, we need not take on all ie storeys. Just pick one, outline it, shine thru, gives the
labels."** One storey demonstrates that the model understands storeys; eight demonstrate an inventory.
So the film wants ~8 cues total, one per capability: envelope · storey · clear space · hall length ·
duct section · opening · atrium height · room. `A.flythruBestPerClass(cands, classOf)`.
**This retires machinery built earlier the same day** — gap-tuning to hit 30-50 cues, dedupe across
hundreds of repeats, and tier WEIGHTS (tiers are now an order of appearance, not a scoring thumb). It
also rescues a thin model: one-per-class still yields a complete film where a 30-cue target fails.

### 2. CANDIDATE SOURCE — `elements_meta JOIN element_transforms`, never the scene metadata
⚠ **`A._instanceMeta`/`A._batchMeta` carry the BATCH GROUP's `bx/by/bz`, not the element's.** Walking
them measures the bounding box of a COLLECTION and labels it as one thing. MEASURED consequence: a
build pass scheduled `Covering height 22,898 mm` when IfcCovering's real maximum height is **0.20 m**
(114x), and 31 of 41 cues were impossible "heights". One SQL query gives true extents, and is cheaper.
⚠ `A.guidMap` is meshId→guid (the REVERSE of a lookup); `A.zoomToGuid` matches `userData.guid` on PLAIN
meshes only. Neither resolves an instanced/batched element. Three probe runs were lost to this.
⚠ `element_transforms` is in the DB's own Z-up datum, ~169 m off the scene's Y. Use
`A.flythruFrameMap(dbEnv, sceneBox)` — it DERIVES the axis swap and offset by matching extents, and
degrades to identity rather than inventing one.

### 3. THE MEASUREMENT MODEL — two primitives, any building (REWRITTEN 2026-09-07 from the user's storyboard; replaces the class-organized availability table, which was an inventory shrunk to one each)
**The generalization is smaller than it looks.** Every beat the user storyboarded is one of TWO
measurements. Nothing below is class-specific, so a building with unseen classes still measures.

**3.1 Primitive A — the material chord.** `flythruChord(origin, dir, stop) → {dist, p0, p1}`. A segment
from an origin along a direction, ended by a stop predicate. Only the predicate changes:
`solid` (any material) · `surface:horizontal-large` (a ceiling/floor, not a light fitting) ·
`element:self` (one element's own extent) · `system:same` (a run). **Every linear number is this.**

**3.2 Primitive B — the occupancy raster.** `flythruRaster(elements, plane, cell=0.5m) → {area, perimeter,
loop}`. Rasterize element XY extents, count cells for area, trace the boundary for perimeter. Needed
because **a chord cannot give area on a concave plan**, and a bbox product silently lies about one.

**3.3 Why the raster is not optional — the bbox states a WRONG number on most buildings.**
Second-0 wants *Volume* and *Ground area*. Both are bbox products today: envelope
`115.8 x 164.8 x 47.0 m` → `897,404 m³`, ground `19,084 m²`; Level 1 `112.5 x 133.9` = `15,072 m²`.
MEASURED 2026-09-07 (§11): the bbox over-states this Hospital's ground area by **1.18x**, Level 1's
floor by **1.29x**, and Level 7A's by **7.28x**. It is wrong HERE, on a near-rectangular mass — not
only on the L-shape it was feared for. The ask is "works for any building" — so bbox area is
a **generalization failure, not an approximation**.
⚠ Envelope volume from a bbox is AIR, not building. Label it **"envelope volume"**, never "building volume".

**3.4 Three anchors, and there are only three.** `model` (envelope) · `storey base plane` (floor space,
slab width) · `camera` (corridor, height, room). Every beat picks exactly one.

**3.5 THE SEVEN BEATS** — the user's storyboard, resolved to primitives. `t` = narrative intent; the
actual second is ASSIGNED from precomputed path windows (§6/§9), since the camera path is known before
the bake. This is an assignment problem, not a live gate.
| # | Beat | t | Number shown | Primitive | Origin · direction | Stop | Anchor |
|---|---|---|---|---|---|---|---|
| B1 | Building envelope | 0 s | X/Y/Z, envelope volume, ground area | chord x3 + raster | model centre · world X,Y,Z | outermost material | model |
| B2 | Storey floor space | after B1 | area (+perimeter) | raster | that storey's slabs · XY | — | storey base |
| B3 | Room, traversing corridor | on traverse | rect, area, volume | injected rect (a precomputed chord pair) | camera XY inside union | room rect | camera |
| B4 | Slab width across | 8 s | width | chord | camera · perpendicular to forward, in slab plane | slab edge | storey base |
| B5 | Corridor length across | 22 s | length | chord | camera · forward | any solid | camera |
| B6 | Ground → highest ceiling | before the stair | clear height AND total height | chord (two stops) | ground · up | first hit = CLEAR · first large horizontal = CEILING | camera |
| B7 | HVAC duct system | during Reveal | section, run length | chord x2 | duct centre · across, then along | `element:self` · `system:same` | camera |

**3.6 What carries over from the old table** (counts still verified 2026-09-07): storeys 8 · rooms 8
compiled · doors 440 · windows 131 · openings 735 · ducts 4,816 · pipes 14,452 · cable trays 84 ·
duct/pipe sections 1.33 / 0.86 m, runs to 69 m. **Beams, coverings, members, walls stay OUT** — honest
but not spatial; 1,970 beams would flood the film.
⛔ **Storey VOLUME is still not derivable**: the per-storey height column is contaminated by risers and
facade spanning storeys (Level 1 reads 43.9 m). Area is sound — but now via the raster (3.2), not a bbox.

**3.7 Honest degradations — no fabricated nouns.**
- *"before the staircase"* → anchor to the path sample nearest an `IfcStair`. **No stair in the model** →
  fall back to the longest vertical chord and say nothing about stairs.
- *"storey 3"* → never hardcoded. Pick the storey the camera passes through, else the largest by raster area.
- **No room injection ran** → B3 is skipped, not faked. Injection provenance is drawn per §5.

**3.8 RUDIMENT FIRST — the first attempt is B1-B3 only** (user, 2026-09-07: *"This is a first attempt of
the latest leg, let's see something rudiment first. We then iterate from there."* and *"balance complexity
with practicality"*).
**B1, B2, B3 need ZERO raycasts and introduce ZERO stop predicates** — they are pure reads of data already
resident (model bbox, storey slabs, injected room rects) plus the raster. Ship those three, look at them
moving in a real frame, THEN add B4-B7, which is where the chord's directional cases begin.
Do NOT build the chord's predicate family before B1-B3 have drawn once. A cue graphic that has never
survived a real frame is the defect this lane already has (§10.4).

**3.9 Prerequisite, unchanged and blocking.** The DB→scene transform (`flythruFrameMap`) must be verified
against a known mesh first — §10.1. A wrong transform breaks the chord and the raster IDENTICALLY, so no
output from either is trustworthy until that number is in hand.

### 4. THE STRONGEST CUES ARE THE ONES THE IFC DOES NOT CONTAIN
This building has **ZERO extracted `IfcSpace`** — and BIM-OOTB already closes that hole itself: the
compiler INJECTS rooms and the Find Panel consumes them (`navigate_find.js:783-797` needle, `:2171`
`_allRoomVolumes()`; see §5). So "the IFC has no spaces" is not a gap the casts heroically fill — it is a
capability the film should SHOW (§1). Ranked by how unobvious the claim is: **injected rooms >**
hall/clear-space > duct section+run > openings > envelope.
**Three casts from the camera still earn their place** — left-right = breadth, forward = length, up =
height — but for the FREE SPACE around the camera, which no room record describes. ⚠ A column shrinks
it, so it is not the architectural room — label it "clear space", never "room".
**One vertical cast yields TWO cues** (user: *"total height across central hallway right to the highest
ceiling point"*): the first hit is CLEAR HEIGHT (headroom, what you would hit); the first hit whose
surface is large and horizontal is TOTAL HEIGHT (the ceiling proper). A light fixture or hanging duct
must not be mistaken for a ceiling. If they differ dramatically the difference is itself informative.

### 5. ROOMS — real geometry, and the honesty convention already in the codebase
`_allRoomVolumes()` (`navigate_find.js`) returns per-sub-rect boxes `{cx,cy,cz,sx,sy,sz}`; a logical
room is the UNION of its rects, so area = Σ sx·sz and volume = Σ sx·sy·sz. (Querying
`element_transforms` for a room guid returns NULL — wrong table; that is why rooms first looked
unmeasurable.) ⚠ **It is PRIVATE to navigate_find.js — not on `A`. Exposing it is a prerequisite.**
**§SYNTHETIC-HONESTY (WalkerDoctrine §14) already solves the "8 rooms advertises a weakness" worry:** a
compiled room (`RM_` guid or `≈`-prefixed name) is drawn FAINTER than an extracted IfcSpace, so the
wash signals provenance. Do not omit compiled rooms — mark them.

### 6. SELECTION RULES (all witnessed, `viewer/tests/witness_flythru_gate.js`, 24 groups / 178 asserts)
- **HOLD ≥ 2.0 s, not proximity** (`flythruHoldWindow`). Distance never measured readability; hold
  does, and "near enough" falls out of apparent size. Kills flicker structurally.
- **Apparent size ≥ 15% of frame width** to introduce; **≥ 33% to RETURN** (`flythruShouldShow`).
- **One end may leave frame** — a wing span is best when too big to fit. Both ends off is rejected; the
  MIDPOINT must stay well inside, since that is where the value sits.
- **Angle is NOT a veto** — projected length = length × sin(angle), so an end-on span already collapses
  to a tiny screenFrac and is caught by the size test. The veto was redundant and cost real cues.
- **Backdrop is three-state**: clear (one surface or sky) / mixed (tolerated — head clearance under a
  tray lives here) / **mosaic → REJECTED**. Adaptive ink fixes darkness, NOT busy-ness.
- **Occlusion is not a veto** — shine-through draws anyway. Both ends hidden is still rejected.
- **Dedupe** (`flythruDedupe`) — 440 doors at 1,083 mm are ONE measure. Survivor is the best-framed.
- **Ease** (`flythruEaseScore`) — prefer windows where the camera slows; relative to the film's own
  fastest motion, so it is abstract across buildings.
- **Statement cues do not persist**: anything ≥ half the building diagonal is said once (the envelope
  would otherwise shine through every later frame — `dMax` ≈ 950 m).

### 7. RENDERING
- **Standard dimension cue**: extension lines, inward arrow heads, value in **mm** — not blue dots.
- **Ink**: **yellow `#ffd600` on dark**, black on light (Rec.709, flips at 0.45). Interiors are dark and
  pure white reads as a blown highlight. Opposite-colour outline so a cue crossing a boundary survives.
- **Label is an OUTLINED box on a leader** (user, 2026-09-07: *"outlined box, not filled"*) — the same pointer shape as the clash pair label, so the film reads as one language. **NEVER a filled plate**: it blots out the detail the cue exists to highlight. Outline the box AND the glyphs.
- **Label floats free** on a leader, offset to the calmer side, and **avoids other labels** — clash
  `[tol/clash mm]` boxes are live during the walk (they stop at `beats.reveal`). If every position
  collides it DECLINES to draw; overlapping two numbers is worse than showing one.
- **Box cue** (`flythruBoxCorners`, `flythruPerimeterLoop`): draw the box being measured. This is how a
  perimeter stays honest without a roundness test — a bbox cannot tell a round duct from a square one
  (π·d vs 4d is a 21% error), but if the box is DRAWN the viewer sees what was measured.
- **Whole cue shines through** (`FLYTHRU_DRAW_CONTRACT`). Screen-space 2D pass = automatic; any 3D part
  needs `depthTest:false, depthWrite:false, renderOrder ≥ 900` (as `measure.js:717`/`clash_film.js`).
  It also fixes a case the gate CANNOT see: ends visible but the MIDDLE behind a column. No mid-span
  sampling needed.
- **Buildup 0.5 s**, drawn across, value withheld until the line completes. In FILM SECONDS — that is
  7.5 frames at 15 fps and 12 at 24 fps, both true, as `clash_film`'s pulse already does.
- **Persist** (`flythruDrawStateAt(..., {persist:true})`): introduced once, then kept for the film, so a
  re-sighting in the reveal round is recognition. Re-entry needs the higher 33% bar (§6).

**§FLYTHRU_MESH_TINT — THE SUBJECT LAYER (added 2026-09-07, user).** The yellow tint fills the
**MESH, not the bbox** — *"so that its shape is clearly made out"*. The naming case, in the user's words:
the camera travels a corridor and **a hidden room on the side is made out**; and *"similar to MEP reveal,
a HVAC mesh yellow shine thru for some 2 secs fade in/out"*.
- **Two layers, two jobs. Do not merge them.** Mesh tint = **WHAT and WHERE** (shape, existence, that it
  is hidden behind a wall). Outline box + extension lines + label = **HOW BIG** (the numbers). A bbox
  alone on a hidden room is a floating rectangle that says nothing about what is in there.
- **Envelope ≈ 2 s, fade in / hold / fade out — NOT a 0.3 s flash.** A flash is acquisition; this is a
  REVEAL, and a shape needs dwell to be read. Inside the ≥ 2 s hold (§6): fade in ~0.6 s → hold ~1.0 s
  (the 0.5 s dimension buildup runs here and the value lands) → fade out ~0.6 s.
- **The tint fades OUT; the dimension cue PERSISTS.** The subject is revealed once, the measurement stays
  for the film. Fires only on a cue that PASSED the hold gate, never on a candidate; once per subject, on
  first introduction, never on re-sighting (§7 persist makes re-entry recognition).
- ⚠ **MESH where a mesh exists, BOX UNION where it does not.** B2 storey and B7 HVAC have real meshes →
  true mesh tint. **A compiled room has NO mesh** — `_allRoomVolumes()` returns per-sub-rect boxes
  (§5), so B3's "shape" is the UNION of its rects (an L-shaped room reads as an L, which is why the union
  and not a single bbox). B1 envelope has no mesh at all. Do not send a session hunting for a room mesh.
- **FOUNDATION — REUSE `cpe_storey_reveal.js`, do not invent.** It already solved every landmine here:
  - `:249-253` **CLONE the material before setting `emissive`.** Writing `o.material.emissive` in place
    repaints every mesh sharing that cached material — the viewer's material cache is shared.
  - `:211` **Instanced/BatchedMesh needs `setColorAt`/`getColorAt`** for diffuse; the emissive
    save/restore path is for PLAIN meshes only.
  - `:294-323` **X-ray must be a SCOPED beat that restores itself** (`_xrayByUs` guard). `cinema_maxq`'s
    `§CINEMA_XRAY_RESET` turns x-ray OFF at bake start, so a global toggle left on is a defect.
  - `clash_film.js:344,374-387` — per-instance `colour = base × mix(pulse(t), 1.0, fade)` is the existing
    envelope shape to copy for the fade in/out.
- **Emissive tint, not an opacity wash**, so the mesh's own shading survives and it reads as the object
  rather than a silhouette. Yellow `#ffd600`, adaptive flip per §7.
- **No collision with the clash language:** the clash pulse is a slow REPEATING heartbeat
  (`clash_film.js:46-48` — on over 2 s, hold 1 s, off longer, cycling). The mesh tint is a ONE-SHOT 2 s
  fade that never repeats. Different temporal signature, so both can be live in the same frames.
- ⛔ **The x-ray path is UNPROVEN**: §STOREY_REVEAL_XRAY / _MARKERS_OFF / _PULSE are code-complete but
  their on-screen proof lands in the last ~300 frames of the final bake. Label it unverified, never assume.

### 8. SEMANTICS — a SECOND pass, after selection
`flythruSemantics`. Selection stays geometric; naming happens on the handful that survive, so a naming
failure costs a word, not a measure. **Horizontal → "length", vertical → "height"** (user's rule; the
word describes what is DRAWN — a viewer cannot see which extent is longest). No allowlist: an unseen
class labels from its own name. No class → the number alone, never a fabricated noun.

### 9. COST — MEASURED, and the route decided on measurement
- Build pass **2.2-2.9 s** total, inside `clash_film`'s 4.5 s budget.
- `flythruPathWindows` over 64,150 elements × 300 samples = **194 ms**. Two dot products per sample,
  no projection, no rays. `dMax = 5.77 × span` (at 15% floor, 60° fov).
- **R-TREE LOSES — do not use it.** Measured on 64,150 elements, 200 queries, identical hit counts:
  candidate pick **943 ms SQL vs 92 ms in-memory (10.3×)**; obscurity **161 ms vs 74 ms (2.2×)**; plus
  **1,971 ms to build the index**. `dbQuery` round-trips into SQLite-wasm cost more than a linear pass
  over a resident `Float64Array`.
- Order stages cheapest-first: path windows → projection → (rays only if ever needed).
- **Element measures need ZERO raycasts.** Only genuine void discovery (hall, clearance) casts, a few
  rays at a sparse rate.
- ⚠ At walk speed (~0.66 m/s) distance is almost never the binding constraint — frustum, backdrop and
  hold are. The film's SLOW walk is what makes this feasible; a fast fly-through would reject nearly all.

### 10. ✅ CLOSED 2026-09-07 — all five items answered; kept for the trail, see §16 and §19
⚠ Do NOT re-walk this list. 1 (frame map) → §16, root cause was `flythruFrameMap` re-deriving `A.ifc2three`.
2 (`_allRoomVolumes` private) → exposed, and a `spatial_structure` fallback added because `navigate_find.js`
is lazy-loaded. 3 (envelope opener unverified) → fired in a real bake, `§FLYTHRU_CUE_ON key=envelope`.
4/5 (nothing wired, run a clip) → wired, 30 s 720p clip delivered, 3 cues drew. ORIGINAL TEXT:
1. **Build pass v2 regressed and is UNDIAGNOSED**: 16,576 candidates → only **12 passed the gate**, 1
   scheduled (v1 gave 505 unique). The lone survivor is the envelope, whose `dMax` passes from
   anywhere — consistent with the DB→scene transform MISPLACING elements. Verify `flythruFrameMap`
   against a known mesh's real scene position before trusting any output. Probe:
   `/tmp/wt-storey-reveal/probe_buildpass_v2.js`.
2. **`_allRoomVolumes()` is private** — expose it, or rooms stay at 0.
3. **The envelope opener is unverified** — `§FLYTHRU_ENVELOPE` logged 0 times in the last pass (an edit
   lost in a relaunch), so second-0 has never actually been produced.
4. **Nothing is wired into `cinema_maxq`.** No bake has ever drawn one of these cues. The only images
   produced are STAGED stills (camera pointed at a door by hand) — they prove the cue graphic reads,
   nothing about the film.
5. Then: wire the schedule into the bake and run a short `--clip` to see it move.

**Code**: `viewer/cpe_flythru_dims.js` (all pure functions, registered in `main.js`/`viewer.html`/
`sw.js`), witness `viewer/tests/witness_flythru_gate.js` (runs standalone, no GPU, no DB).

### 11. MEASURED CANDIDATES — Hospital, run 2026-09-07 (`probe_flythru_maths.js`, log `out/ft_maths.log`)
Primitives shipped in `viewer/cpe_flythru_maths.js` (self-check: a 10x10 box → area 100.00 m², perimeter
40.00 m, exact). **No GPU, no browser, no scene** — B1-B3 are pure DB reads, so §3.9's unverified
DB→scene transform CANNOT corrupt these numbers. That is precisely why this leg went first.
64,150 elements, whole pass **47 ms**, raster at RES 0.25 (the walkable builder's own constant — the
film introduces NO new tunable).

**B1 ENVELOPE — filmable, and the strongest opener.**
`X 115.75 x Y 164.78 x Z 47.05 m` · ground area **16,170 m²** (raster) vs 19,074 m² (bbox, **1.18x**) ·
perimeter **562 m** · envelope volume 897,404 m³ (AIR — say "envelope volume") vs prism 760,781 m³.

**B2 STOREY — filmable, 8 candidates, and it PROVES why the raster is mandatory.**
| Storey | n | gross raster | bbox | bbox error | walkable (real mesh) |
|---|---|---|---|---|---|
| Level 1 | 8,564 | 11,678 m² | 15,072 m² | **1.29x** | 6,481 m² |
| Level 2 | 8,115 | 9,757 m² | 10,407 m² | 1.07x | 6,224 m² |
| Level 3 | 12,916 | 13,793 m² | 15,246 m² | 1.11x | 6,097 m² |
| Level 4 | 11,827 | 13,087 m² | 14,318 m² | 1.09x | 3,566 m² |
| Level 5 | 9,885 | 12,637 m² | 14,559 m² | 1.15x | 3,418 m² |
| Level 6 | 2,240 | 8,301 m² | 9,905 m² | 1.19x | 3,367 m² |
| Level 7 | 193 | 2,524 m² | 3,912 m² | 1.55x | 1,402 m² |
| Level 7A | 218 | 617 m² | 4,495 m² | **7.28x** | none |
⚠ **Level 7A is the headline**: a bbox floor area on a partial top storey is not an approximation, it is
a fabrication — 4,495 m² claimed for 617 m² of real floor. The old §3 table's "Level 1 = 15,072 m²" was
that same bbox error, 29% high.
**THREE honest numbers exist per storey** — gross footprint (raster), WALKABLE (precomputed from the
building's own triangulated mesh by `scripts/build_storey_walkable_raster.js`, 7 rows present), and bbox
(**never show it**). Walkable is the better capability claim: it is derived from mesh and appears nowhere
in the IFC.

**B3 ROOMS — ⛔ NOT filmable on this building. HOLD the beat.**
7 logical rooms / 8 sub-rects, every one compiled (`RM_` guid, `⚠`/`≈` name). Largest is 23.25 m² but its
span is **15.50 x 1.43 m** — a corridor slice, not a room. `RM_Level_2_3` is 0.53 x 14.62 m; `RM_Level_2_1`
is **0.75 m²**, a broom closet. Only 3 of 7 reach 9 m².
Drawing these would advertise a weakness — the exact inverse of "capability not quantity" (§1). The §5
faintness convention marks provenance honestly, but it cannot make a 0.53 m sliver read as a room.
**Baseline B1+B2. B3 returns when a building has real rooms, or when injection is re-run to yield them.**

**⇒ BASELINE = B1 + B2.** Both are real, both are cheap, neither needs a raycast or the scene transform.

### 12. §FLYTHRU_LEAST_EFFORT — the paramount objective (user, 2026-09-07)
> *"The paramount objective is a cinematic experience with least effort on the part of the user."*

Binding on every default here. Nothing in this feature may ask the user to pick a number, choose a cue,
or tune a threshold. Every constant is either derived from the data or inherited from a constant that
already ships (RES 0.25 = the walkable builder's). Where data is thin the film DEGRADES — it drops the
beat and says nothing — it never asks and never fabricates. A knob added to this lane is a defect.

### 13. §FLYTHRU_ROUTE_AMBITION — where this is going (user, 2026-09-07)
> *"Eventually we look for free application of 'steps up from ground to first level room', 'escape route
> steps from ..' this is the ultimate sophistication of capability of BIM. But for now, the basics has to
> be baselined."*

Recorded as the destination, NOT as current scope. Worth knowing before anyone builds a parallel path
engine: **the foundation already ships.** `storey_walkable_raster` (7 Hospital storeys, mesh-derived,
measured above) exists precisely so `common/room_graph.js` can test chord legality as an O(1) bitset
lookup — that is `prompts/Modeller/DISC_Walker/PATH_LEGAL_SEGMENTS.md` §G3-REVISED. A route measure is a
walk over legal chords on that raster, which is the SAME Primitive A with a `walkable` stop predicate.
So the ultimate capability is an extension of the two primitives, not a new subsystem. Baseline first.

### 14. §FLYTHRU_SEQUENCE — ONE CUE ON SCREEN AT A TIME (user, 2026-09-07)
⚠ **AMENDED BY §20.2 — this rule now governs TYPE B only.** Prominent SPACES persist for their whole
time in frame (a "set overlay"), so two can be live at once and non-overlap becomes a SCREEN-SPACE
problem, not a timing one. Read §20.2 before applying anything below.
> *"they are to play in sequence so as not overlapping the optics"*

**Hard constraint, and it overrides §7's `persist:true` for the baseline.** Two cues alive at once means
two labels, two boxes and two tints competing in the same frame — the optics collide and neither number
reads. So the film runs a SINGLE SLOT: a cue fades in, states its number, clears, and only then may the
next one begin.

**Slot budget** (film seconds, per §7's buildup convention): mesh tint fade in **0.6 s** → hold **1.0 s**
(the 0.5 s dimension buildup runs inside this and the value lands) → fade out **0.6 s** → **0.5 s clear
gap** before the next cue may start. ≈ **2.7 s per cue**, so the four-cue baseline occupies ~11 s of a
195.8 s film.

**Consequences, all simplifications:**
- **No persistence, no re-sighting, no re-entry bar.** §7's persist + the 33% return threshold are for a
  film where cues accumulate. They do not apply here. A cue is said ONCE.
- **No label-collision avoidance needed between cues** (§7's "avoids other labels" still applies against
  the live clash `[tol/clash mm]` boxes, which are a different layer).
- **Scheduling is a sequence assignment, not a gate**: cues are placed in narrative order, each starting
  no earlier than the previous one's slot end. The order is fixed (§11); only the seconds are assigned.
- **A cue that cannot find a legal window is DROPPED, not squeezed.** Least effort (§12) means the film
  quietly shows three instead of four rather than overlapping two.

### 15. §FLYTHRU_VIEWER_SUPPLIES_THE_NOUN (user, 2026-09-07)
> *"yes even a light well, the user will intuitively know what it is if it is in frame, higlited
> momentarily"*

**The cue does not have to identify what it measured.** A highlighted volume in frame plus a number is
complete on its own — the viewer reads the noun off the screen far more reliably than any classifier
reads it off the schema. This is the constructive form of §8's "no fabricated nouns": not merely
*don't guess a name*, but *the name is not needed*.

Consequences:
- A gap cast that finds a **light well** instead of the wing separation is a WIN, not a misfire. Both
  are real voids, both are legible, and the viewer names whichever one is on screen. So gap-finding
  needs no roundness test, no courtyard/well discriminator, and no "is this the right void" veto.
- It removes the main risk from every DERIVED cue (§4), which is the class that cannot be named from
  the schema by construction — that was the reason to be cautious about them, and it is now gone.
- The label may therefore be the **bare measurement** wherever naming is uncertain. §8's ladder stands:
  a confident class name if one exists, otherwise the number alone. Never an invented noun.
- ⚠ It does NOT license drawing something illegible. The cue must still be in frame and hold (§6/§14) —
  "in frame, highlighted momentarily" is the precondition the user attached, not a waiver of it.

### 16. MEASURED PLACEMENT — Hospital, 195.8 s path, 2026-09-07 (`probe_flythru_place.js`, `out/ft_place4.log`)
Built and placed against the REAL camera path in the live viewer (streamed scene, `plan.poseAt` × 300,
`flythruPathWindows`). Build cost **195–216 ms**. Code: `viewer/cpe_flythru_cues.js`,
`common/flythru_maths.js`, sw **v1160**, branch `feat/storey-highlight-reveal`.

| Cue | Placed | Occupies | Candidates | Windows | Label |
|---|---|---|---|---|---|
| envelope | **0.00 s** | 0.00–2.20 s | 1 | 7 | `Building Envelope — 115.75 × 164.78 × 47.05 m · Ground 16,170 m²` |
| storey | **2.70 s** | 2.70–4.90 s | 1 | 8 | `Level 1 — Floor 11,678 m² · Walkable 6,481 m²` |
| room | ⛔ DROPPED | — | 2 | **0 and 0** | both genuine rooms (4.8 m, 3.4 m spans) have ZERO in-range-and-facing windows anywhere in the film |
| corridor | **13.05 s** | 13.05–15.25 s | 2 | 3 | `Corridor — 15.50 m long · 1.43 m wide` |

**⚠ COORDINATION — ANOTHER SESSION IS ADDING A 2D/3D GRID IN THE STARTING SECONDS (user, 2026-09-07).**
The envelope cue occupies **0.00–2.20 s** and the storey cue **2.70–4.90 s** — the same opening window.
**RESOLVED by the user, same day: no conflict.** *"it is just adding a simple non intrusive idea.. have
the whole 2D grids matrix appearance from onset"* — the grid is a NON-INTRUSIVE BACKDROP present from
the onset, not a competing cue. So it composes with the envelope cue rather than displacing it: the grid
is the ground the measurement is drawn on, which is what a dimension actually wants behind it (§7's
backdrop rule prefers a UNIFORM backdrop, and a regular grid is uniform).
Neither side moves. **Do NOT resolve it by deleting the other's hook** — both are additive and guarded.
The one thing to watch is INK: §7 flips yellow/black on a Rec.709 luminance of 0.45, so if the grid ships
a light ground in the opening seconds the envelope cue will correctly flip to black — that is the rule
working, not a regression.
⚠ `sw.js` is the standing conflict magnet: this lane took **v1160** and precached `cpe_flythru_cues.js`,
`../common/flythru_maths.js`, `../common/storey_raster.js`. On conflict KEEP BOTH precache additions and
take the HIGHER `CACHE_VERSION` (CLAUDE.md §Concurrent branches).

**Three defects the probe caught that a bake would have shown only as a plausible frame** — recorded
because each is a general trap, not a one-off:
1. **Envelope understated 115.75 → 102.03 m.** The box was a mesh union filtered on `userData.storey`,
   which silently drops the **10,192** elements whose storey is `'Unknown'`. Geometry now comes from DB
   extents through `A.ifc2three`, so box and label agree by construction.
2. **Rooms always empty.** `navigate_find.js` is LAZY-LOADED (`main.js:137`) — in a headless bake its
   `init()` never runs, so `A.allRoomVolumes` is never assigned. Any bake-time consumer of a
   Find-panel export needs its own fallback; this one re-queries `spatial_structure` through the same
   owner transform.
3. **Placement picked the biggest subject, not the visible one.** The largest room had zero windows.
   Every candidate of a class is now tested and the first with a legal window wins (user: *"the
   algorithm hunts for clear sighted opportunities that is cheapest"*).

⇒ **§10.1 IS ANSWERED.** The build-pass collapse was `A.flythruFrameMap` re-deriving, by extent-matching,
a relation `A.ifc2three` (scene.js:499) already OWNS — degrading to identity when the match fails, which
misplaces every element while leaving the envelope (dMax passes from anywhere) the lone survivor. That is
the ownership-table defect CLAUDE.md §0 warns about. **Use `A.ifc2three`; do not repair `flythruFrameMap`.**

### 17. §FLYTHRU_DATUM_PLANES — the opening setting-out enclosure (user, 2026-09-07)
> *"This can be the abstract opening overlay for any building — a 2D × 3 grid. The back and side
> (Z[X/Y]−) away from camera POV and ground earth [XY], as the buildup covers the gridlines, then when
> goes out of frame can go off."*

⚠ **NUMBERING / COORDINATION.** This section and §18 were written concurrently with the placement
session's **§16 MEASURED PLACEMENT** (line ~979) and renumbered to 17/18 after the merge. Read §16
first — it settles the relationship between the two layers, in the user's own words: *"it is just
adding a simple non intrusive idea.. have the whole 2D grids matrix appearance from onset"*. The datum
planes are a **backdrop present from the onset**, not a cue competing for a slot. They compose with
§16's measured placements (envelope 0.00–2.20 s, storey 2.70–4.90 s, corridor 13.05–15.25 s); neither
side moves and neither side's hook may be deleted to resolve a conflict.

**17.1 Definition.** Three orthographic datum planes are established about the model's section box and
carry a setting-out grid at a derived module:
- **The site datum plane** — horizontal, at the project base level (`env.zMin`), coincident with the
  ground on which the building is set out.
- **Two elevation datum planes** — vertical, on the two section-box faces whose outward normals face
  AWAY from the camera. They read as the back and return of a drafting enclosure, never as an
  obstruction between camera and subject.

The three planes intersect at one corner, giving the viewer an orthogonal reference frame — the same
reading an architect takes from a plan set at ±0.000 with two elevations behind it. It is a **datum**,
not a measurement: the grid states the module the building is set out on, and the building's own
dimension strings (§3, §17) state the measurements.

**17.2 Plane selection is a per-frame back-face test, not an authored choice.** Of the four vertical
section-box faces (X−, X+, Y−, Y+), a plane is ACTIVE when `dot(outwardNormal, cameraForward) > 0`.
Exactly two satisfy this for any general camera azimuth; at a 45° face-on azimuth three may qualify, in
which case the two with the largest `|dot|` are taken, so **never more than two vertical planes are
live**. As the camera orbits, a plane deactivates only once its projected screen area has fallen to
zero — that is, **after** it has left frame, which is the user's "when goes out of frame can go off."
No cross-fade is required and none should be added: a swap executed off-screen is invisible by
construction. The site datum plane is always active while the model's footprint is in frame.

**17.3 The module is derived from the envelope — no knob (binding under §12).**
Take the longest horizontal envelope side and choose the 1-2-5 decade step that yields **10 to 30
gridlines** across it. Hospital: 164.78 m → a **10 m** module → 16 lines on the long axis, 12 on the
short. Duplex: 17.54 m → **1 m** → 18 lines. The rule is scale-free and returns a round, drawable
module on any building without a setting.
⚠ **The datum module is deliberately NOT the detected structural grid.** §17 measures why: on Hospital
`GridDims.detectGrids` returns a bay ladder of `1417 | 99155 | 1611 | 1712 | 1781 | 88668` mm, which is
a correct read of that model's structure but is not a drawable field. Conflating the two would make the
opening overlay hostage to detection quality on an unseen building. **The datum planes state the
module; the dimension chains state the structure. Two layers, two claims, never merged.**

**17.4 Annotation carried by the planes.** All of it is drafting furniture that already exists in the
codebase (§17.8) — nothing new is authored:
- **Grid bubbles** — numerals on one axis, letters on the other, per `grid_dims.js`'s existing sequence
  `A,B,C,D,E,F,G,H,J,…`, which correctly omits **I**. ⚠ It retains **O**; standard practice omits both
  I and O against confusion with 1 and 0. A one-character fix, worth taking while this layer is built.
- **Level datums on the elevation planes** — horizontal rules at each storey with its level tag, from
  `SectionCut.detectStoreys(db)` (`section_cut.js:297`). Hospital has 8. This is the standard section
  annotation and it puts Z on the drawing where a viewer expects to read it.
- **North point and scale bar on the site datum plane** — `print_sheet.js:226` `drawScaleBar`, `:255`
  `drawNorthArrow`. Both already ship for the print sheet; reuse them, do not redraw them.
- **The envelope dimension string (B1) is relocated onto the enclosure edges** — X and Y along the site
  datum edges, Z up an elevation plane. B1 therefore stops being a free-floating cue and becomes the
  enclosure's own annotation, which is where a dimension string belongs on a drawing. This is a
  simplification of §3.5 B1, not an addition to it.

**17.5 DEPTH BEHAVIOUR — this layer INVERTS the draw contract, and that inversion is the effect.**
Every measurement cue in §7 draws with `depthTest:false` so it shines through. **The datum planes must
depth-test NORMALLY and be occluded by the building.** The user's "as the buildup covers the gridlines"
IS the occlusion: as the model rises in the opening, it progressively hides its own setting-out grid,
which is what tells the viewer the grid is behind the building and not painted on the lens. A
shine-through datum plane would destroy the reading entirely.
⚠ Record this explicitly in `FLYTHRU_DRAW_CONTRACT` as the one exempt layer, or a later session will
"fix" it to match the cues.

**17.5a INK — the datum planes must not lighten the opening ground (§16's warning, honoured here).**
§7 flips cue ink yellow→black on a Rec.709 luminance of 0.45. §16 records that a light grid ground in
the opening seconds would correctly flip the envelope cue to black. The datum planes are therefore
drawn as **faint light-on-dark rules over the existing ground, never as a filled light plane** — they
add lines, not luminance. The layer must be measured against the flip threshold before it ships: if the
sampled opening frames cross 0.45, the planes are too heavy, not the ink rule wrong.

**17.6 Lifetime — present from the onset (user, corrected against §16).** The enclosure is established
at second 0 and is **already in appearance when the film opens**, not introduced as a beat. It holds
through the dive (`§CINEMA_BEATS dive=0.094`, the first ~18.4 s of 195.8 s), covering §16's measured
envelope, storey and corridor placements, and fades out as the dive resolves into the walk. Individual
planes extinguish earlier under §17.2 when they leave frame. It does not return: a re-established datum
mid-film would compete with the measurement cues for the same ink.

**17.7 Cost.** Three planes at 10-30 lines each ≈ 90 line segments, drawn as one `LineSegments` per
plane — **3 draw calls**, against Hospital's measured 1,657 (still climbing when that measurement was
stopped, `EXHIBITION_VR_KILLER_DEMO.md`). Bubbles and level tags are sprites on the existing label
path. The module calculation is arithmetic on the envelope. Nothing here queries the DB per frame.

**17.8 REUSE — build nothing that exists.** All paths `~/bim-ootb`, `main` @ `5daec9e0`:
| Need | Existing | Note |
|---|---|---|
| Dimension line + extension + tick + bubble in 3D | `grid_dim_chains.js:59` `addDimSegment` | already mm-labelled, `(dist*1000).toFixed(0)` |
| Label declutter by screen distance | `grid_dim_chains.js:218` `clampScales` + its `minGap` cull | solves §7's collision problem on this layer |
| Storey levels | `section_cut.js:297` `detectStoreys(db)` | Hospital = 8 |
| North point, scale bar | `print_sheet.js:255`, `:226` | title-block data already via `corporate.json` |
| Structural grid + bay/overall dimension strings | `grid_dims.js:768` `GridDims.*` | §17 — a SEPARATE layer, see 16.3 |
| Ground-plane placement convention | `grid_dim_chains.js:113` `groundY = env.zMin − 0.05` | chains already sit on the datum |
| DB → scene transform | `A.ifc2three` (`scene.js:499`) | **the owner** — see note below |

⚠ **TRANSFORM OWNERSHIP — settled by §16, and this layer already complies.** `A.flythruFrameMap` is
retired: it re-derived by extent-matching a relation `A.ifc2three` already owns, and degraded to
identity on a failed match, which is what collapsed the earlier build pass (§10.1, now answered).
`DimChains.build` calls `APP.ifc2three(...)` for every dimension endpoint (`grid_dim_chains.js:118-127`),
so the shipped 2D stack is **already on the owned transform** — inheriting it costs nothing and
introduces no second datum. Do not add one.

**17.9 WITNESS — `witness_flythru_datum_planes.js`, and it must be able to fail.** Per
`WITNESS_INTERFACE_FRAMEWORK.md` and PRIMAL LAW §4, it asserts over sampled camera frames of the real
opening path, and prints `INCONCLUSIVE` — never `PASS` — when the sampled population is empty:
1. **Back-face invariant** — for every sampled frame, every ACTIVE vertical plane satisfies
   `dot(n, camFwd) > 0`. A single violation is a fail: it means a datum plane stood between camera and
   building.
2. **At most two vertical planes active** in any frame (§17.2).
3. **Module legality** — the derived step yields 10 ≤ lines ≤ 30 on the long axis, on all four fleet
   buildings, and is a 1-2-5 decade value.
4. **Occlusion is real** — the plane material reports `depthTest === true` and `renderOrder` below the
   cue layer's 900 (§17.5). This is the assertion that catches a later "consistency" regression.
5. **Extinction** — no datum geometry remains in the scene after the dive window closes; a plane that
   left frame is disposed, not merely hidden (`NO-OP` reported if nothing was removed).
6. **Annotation provenance** — level-datum count equals `detectStoreys(db).length`, so a fabricated
   level can never be drawn.

**17.10 What this layer does NOT claim.** It is a setting-out reference, not a survey. The module is
chosen for legibility, so a gridline is not asserted to coincide with any structural centreline — that
assertion belongs to `GridDims` and is witnessed separately (`witness_grid_numeric.js`). Nothing in
this section may be described as a drawing, a sheet, or an extract; it is drafting furniture
establishing the frame in which the film's measurements are then read.

### 18. §FLYTHRU_2D_INHERITANCE — the shipped 2D dimensioning stack, and what it does on this fleet
**Study run 2026-09-07 to establish what the 2D lane already provides before any of §16 is built.**
`viewer/grid_dims.js` · `grid_dim_chains.js` · `grid_overlay.js` · `grid_scissors.js` · `elevation.js` ·
`section_cut.js` are a complete, shipped structural-grid and dimensioning stack:
- `GridDims.detectGrids(db, tol, rules)` derives gridlines by weighted vote over structural spans and
  opening widths, snaps to a **300 mm module**, and reports the label-versus-raw drift as
  `§GD_SNAP_DELTA` — the position is never moved to suit the label.
- `GridDims.generateDimensions()` already emits **two dimension-string tiers** — tier 1 bay dimensions
  between adjacent gridlines, tier 2 overall per axis — with `fromLabel`/`toLabel` grid references.
- `DimChains.build(APP, group, grids, env, opts)` renders those strings as scene geometry on the site
  datum, tier 1 on both faces, overall on the near face only.
- `GridDims.detectGridsAtPlane(db, cutZ, …)` + `grid_scissors.js:437` already produce **dimension
  strings at an arbitrary cut plane** — the per-storey plan case is built, not pending.
- `cinema_maxq.js` references the grid stack **zero times**. None of it has ever been driven by a bake.

**MEASURED, shipped `GridDims`, no GPU** (`scripts/probe_plan_grid.js`, log `out/plan_grid.log`):
| Building | gridlines X × Y | bay dims | median bay | detect ms |
|---|---|---|---|---|
| **Hospital** | 3 × 5 | 6 | 1,781 mm | 130 |
| HHS_Office_Federated | 9 × 10 | 17 | 3,997 mm | 28 |
| Duplex | 6 × 2 | 6 | 1,235 mm | 1 |
| Clinic | 4 × 8 | 10 | 12,236 mm | 35 |

**Reading.** HHS returns a coherent bay ladder (`2000 | 4000 | 2000 | 5997 | 5994 | 6143 …`) that would
render as a conventional dimension string. **Hospital does not**: `1417 | 99155 | 1611 | 1712 | 1781 |
88668` mm — four sub-2 m bays against two ~90 m spans. Hospital's grid overall also reads
100,572 × 93,772 mm against an envelope of 115.75 × 164.78 m, because gridlines span only detected
structure and **cannot describe the site boundary**.
⚠ `witness_grid_numeric.js` covers Duplex, SampleHouse and SampleCastle only. **Hospital is not under
witness on this stack** — its behaviour above is from this study, not from a standing assertion.

**Consequences for the film, and they are what §17 was written to resolve:**
1. **The site perimeter is not a GridDims product.** It is the traced boundary from `flythruRaster`
   (§3.2) — Hospital 562 m, already measured — drawn on the site datum plane. This is the "outer
   perimeter drawn up as the camera flies in" and it needs no detection work.
2. **The opening must not depend on structural-grid quality.** §17.3's derived module is why the
   enclosure generalises to any dropped model; where a coherent structural grid does exist, the
   `DimChains` strings are laid over the same datum as a second, richer layer.
3. **A per-storey plan beat is available whenever wanted** via `detectGridsAtPlane` + `DimChains` at a
   storey's cut level, on any building whose ladder is coherent. Recorded as available; not scheduled.

### 19. ⚠ A PER-FRAME `markDirty()` STALLS A BAKE DEAD (measured 2026-09-07 — read this before adding ANY per-frame film hook)
**Applies to §17's datum planes and every future film module.** (Renumbered 17→19: the datum-plane
session took 17/18 concurrently. Their §17.2 does a per-frame back-face test and their planes draw
every frame — this section is exactly the trap that work can fall into.)

`viewer/cpe_flythru_cues.js` called `A.markDirty()` each frame while a cue was on screen. The bake
stopped at **frame 12 of 294 and never advanced** — no error, no abort, just a frame counter that stops
moving while the process looks healthy. `out/flythru_clip.log` names the mechanism outright:
```
§STILL_REFINE cancelled (interaction) elapsedMs=462 (staging kept)
§PHOTO_AO off (cancelled (interaction)) — pass disabled, zero cost during normal nav
§STILL_REFINE start samples=8 …            ← restarts, and is cancelled again next frame
```
`markDirty` is read as **USER INTERACTION** (`effects.js:5327`), which tears down the `§STILL_REFINE` /
`§PHOTO_AO` convergence passes the bake is waiting on. They restart, the next frame cancels them again,
and the frame never converges. **Progress lines keep printing the last good rate**, so it reads as a slow
bake rather than a stalled one — the tell is a repeating identical `frame=N/M`.

**Rule: a module that draws during a bake NEVER calls `markDirty`.** `cinema_maxq` drives rendering
itself, so the call buys nothing there. The convention was already unanimous and could have been read
off the neighbours before writing a line: **`cpe_storey_reveal.js` and `clash_film.js` call it ZERO
times.** (Interactive-only lenses still may — `navigate_find.js`'s Room Lens does, correctly, because
the §S286 idle gate parks the loop when nothing is happening. The distinction is bake vs interactive,
not "is it drawing".)

**⚠ CORRECTED 2026-09-07, same session, before this misled anyone.** `cancelled (interaction)` is NOT
the tell. MEASURED: the HEALTHY 1,222-frame ending bake (`out/ending3.log`) contains **2,446** of them —
one pair per frame — because the camera moves every frame and that legitimately restarts the refine
pass. The stalled run had only **50**. Counting that line diagnoses nothing.
**The real tell is a REPEATING IDENTICAL `frame=N/M` in `§CLI_BAKE_PROGRESS`** while the rate/ETA fields
stay frozen at their last good values (`frame=12/294 … rate=0.430s/frame … elapsed=7s` printed three
times, 30 s apart). The bake looks slow, not stuck. Watch the frame counter, not the cancel line.
The fix above stands — removing the per-frame `markDirty` unstalled it, and the cues then drew
(`§FLYTHRU_CUE_ON key=envelope at=0.00s filmSec=0.07`, 30 s preview, 720p).

### 20. §FLYTHRU_SUBJECT_MODEL — the simplification that settles what gets cued (user, 2026-09-07)
**This narrows §3.5's beat list, amends §14 for spaces, and RETIRES a scoring scheme proposed earlier
the same day. Read it before §6.**

**20.1 Two subject types — and the TYPE LIST is the noise filter.**
- **A · PROMINENT SPACES** — halls, rooms. *"They be yellow highlighted and filled grid measuring their
  XYZ."*
- **B · LESSER MEASURES** — flat slabs, openings, ceiling heights, walls, and the small gap between an
  opening edge and a wall edge.
⛔ **A clarity score of `area × scale-separation × arrival` was proposed and is RETIRED. Do not rebuild
it.** Its separation term existed solely to stop 4,816 duct segments dominating, by noticing that a
duct's siblings define its own denominator. That work is done for free once the candidates are a short
list of named types — a duct is never a candidate in the first place. **Restricting the type list is the
noise rejection.** Keep `flythruDedupe` for repeats within a type (440 doors at 1,083 mm are one measure).

**20.2 Type A persists while in frame — a SET OVERLAY, not a slot.**
> *"It remains thruout their apperance in frame till out of frame. It is as if it is a set overlay."*

**This amends §14.** The 2.2 s single slot still governs **type B**. **Type A lives its own visibility
window** — it appears as the space enters frame and goes when the space leaves.
⇒ **Two spaces can be live at once, so non-overlap moves from TIME to SCREEN SPACE.** §14's timing rule
is no longer sufficient on its own; the label register (20.10.2) is what enforces it. That is the
load-bearing consequence of this whole section.

**20.3 The admission rule, complete.** A subject is cued when ALL hold:
1. **Prominent** — projected screen area ≥ the floor (20.4).
2. **In frame ≥ 2 s** — `flythruPathWindows(..., {minHoldSec})`. ⚠ That test measures range and facing
   ONLY; occlusion is deliberately absent, which is why a shine-through cue keeps its window.
3. **Its label collides with no other live label** — including layers this module does not own.
> *"For a room that is behind a wall but is passed by prominently, then it is a target too."*
Occlusion is not a veto (§6), and the viewer names it on sight (§15).

**20.4 PROMINENCE — two-tier, and the one-line proxy MUST NOT be the gate.**
- **Tier 1, shortlist:** `Ã = (r/d)²`, r = half-diagonal, d = distance. It OVER-estimates flat plates,
  and over-inclusion at this stage is safe.
- **Tier 2, decision:** project the 8 box corners, clip at the near plane, convex-hull them, area ÷ (W·H).
- ⛔ **NEVER gate on `d > r`.** A floor slab of 100 × 130 × 0.3 m has `r ≈ 82 m`, so a camera 20 m above
  it fails `d > r` and **the slab is discarded — the exact subject this section exists to catch.** A
  solid-angle proxy assumes a roughly spherical object; a plate is the opposite. The guard is instead
  **"is the camera inside the box on all three axes"**, which a 0.3 m plate essentially never is.
- **Floor inherits §6, no new knob:** 15% of frame width ⇒ a square subject at 2.25% of frame area, so
  `Ã_target = 0.0225`.

**20.5 PLACEMENT lands ON the moment, not at the window's start.** For type B, the earliest legal start
is NOT where the subject reads best. Place so the HOLD phase covers the peak: `at = t_peak − 0.6 − 0.5`,
clamped into the legal window. (Type A has no slot — it runs the visibility window itself.)

**20.6 MEP in the Reveal — SETS, not systems (user).**
> *"it is for sets of MEP likewise that are prominently seen, not the whole HVAC system for example.
> That can be relegated to HUD stats level. This is to show capability of movie cam to pick out items"*
- A **cluster is just another subject** — box, prominence, window, label. **No new selection maths.**
- **Cluster cheaply.** Bucket boxes into a coarse spatial grid, union-find within and between adjacent
  cells. ⛔ Never pairwise: 4,816 ducts + 4,740 fittings is 23 M pairs.
- **The proximity threshold is DERIVED, not chosen** (§12): the median bbox diagonal of that class, so
  ducts cluster at duct scale and trays at tray scale, on a building we have never seen.
- **The cue states the set's own extents and section — NEVER a count.** A count is inventory and belongs
  to the HUD. That is the user's split, and it keeps §15 intact.

**20.7 ONE CLUSTERING PRIMITIVE, THREE USES — build it once.** Enclosure outlier rejection · hall
derivation · MEP sets. **The technique already ships**: `viewer/lib/room_walker.js` rasterizes footprints
into a plan grid, flood-fills the exterior from the border, and treats each connected pocket the exterior
cannot reach as a room. Point it at `storey_walkable_raster` and **the large pockets ARE the halls** —
which matters because §3 measured that this IFC contains no hall as an entity.

**20.8 The opening enclosure is CONDITIONAL.**
> *"If a building envelope so happens is not clear at start, then it misses that first 3x2 overlay."*

Test at second 0: camera outside the envelope AND its projected area clears the floor. If not, §17's
enclosure never establishes. ⚠ **Log it — `§FLYTHRU_ENCLOSURE_SKIP` — never a silent absence**, or a thin
opening on some other building is unexplainable afterwards.

**20.9 ENVELOPE SOURCE — settled, and it is NOT the grid lane's.**
✅ **`BOMExtract.extract(A).envelope`** (`bom_extract.js:46`, exported `:400`). Structural-only AABB via
`ENV_CLASSES` (column/pile/wall/slab/beam/footing/curtainwall/roof, `:72-75`), with an all-elements
fallback. Its own comment: *"outliers (proxy, site, furniture) stretch AABB."* Certified by
`CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` §SHELL + witness **W-SHELL-ENVELOPE**. Logs `§BOM_ENVELOPE`.
⛔ **NEVER `getBuildingEnvelopeIFC`** (`grid_overlay.js:133`) — VERIFIED 2026-09-07, two independent
faults: `MIN(center_x), MAX(center_x)…` is **CENTRES ONLY, element size ignored**, and there is **no
`WHERE` clause at all**. It is simultaneously too small and outlier-inflated. Duplicated verbatim at
`section_cut.js:378` and `print_sheet.js:115`.
⛔ **`GridDims.renderGridEntities` is DEAD CODE** (`grid_dims.js:635`) — its only reference anywhere is
the export at `:773`. Nothing constructs the `bbox` it takes. Do not point a spec at it.
⇒ **§17.8's reuse table names no envelope source. This is that gap**: the datum module (§17.3) and plane
placement (§17.1) must both take `BOMExtract`, or the enclosure sits wrong on any building with site
furniture.

**20.10 THE GAPS — everything else already exists.**
1. **The clustering primitive** (halls + MEP sets). Technique in `room_walker.js`, never applied here.
2. **A cross-layer LABEL REGISTER.** §7 states the rule — avoid other labels, DECLINE to draw if every
   position collides — but no shared screen-occupancy map exists. Cue labels, clash `[tol/clash mm]`
   boxes and captions are drawn by different modules. `grid_dim_chains.js:218` `clampScales` + `minGap`
   solves it WITHIN one layer only. **This is what 20.2 now depends on, and it bites hardest in the
   Reveal**, where MEP sets and the disc parade want the same screen.
3. **Ceiling height.** §4 has the rule (first hit = clear height, first LARGE HORIZONTAL = the ceiling).
   Unbuilt, and the only listed candidate needing a cast or a height field.
4. **Opening → host wall**, for the edge-to-edge gap. The DB has `rel_aggregates` and
   `rel_contained_in_space` but **no `rel_voids`/`rel_fills`**, so the host must be inferred
   geometrically (nearest wall whose box abuts the opening). ⚠ That is a **DATA question, not a maths
   one** — an inference, not an extraction. Say so before building it.


## CURRENT STATE — 2026-09-06 session 5. ⚠ STALE, MOVED HERE 2026-09-07: it was sitting between §10 and §11 and splitting the numbered spec band. Superseded by §16 (measured placement) and the note that PR #1696 MERGED to main as `ed09eab6`. Kept for the branch/bake trail only.
**The previous table said PR #1693 was "open and mergeable" — it MERGED at 08:24Z; `main` is `7ff4384e`.
It also predated everything in §ENDING_CHOREOGRAPHY above. Read that section first.**

| Lane | Branch | Status |
|---|---|---|
| §PENDING.2/.3/.4 | `fix/clash-pending-items` @ `59d6872d` | **PR [#1694](https://github.com/red1oon/bim-ootb/pull/1694) open, auto-merge armed.** Clash-list `[mm/mm]` depth, cross-caller narrowphase cache (24× warm, verdicts byte-identical cold vs warm), `clash_rules` gear. Live-verified real GPU: `§CP23_VERDICT verdict=PASS`; regression identical on this branch and pristine main (`pass=8 fail=2 ran=68526`). ⚠ Was UNCOMMITTED in the worktree for a full session — committed and pushed this session. |
| §PENDING.5b | `fix/hud-clash-measure-stats` | **MERGED — PR #1693.** Clash HUD build-order fix, per-disc-pair cards, pullback highlight sync. |
| §STOREY_HIGHLIGHT_REVEAL + §CLASH_DISC_ARRIVAL + §MEASURE_BUILDING_CARD | `feat/storey-highlight-reveal` @ `3875091d` | Merged onto main `7ff4384e` (sw conflict resolved: both changelogs kept, `CACHE_VERSION` → **v1158**). Carries the whole §ENDING_CHOREOGRAPHY above plus the four §ENDING_DEFECTS fixes. ⚠ Was also UNCOMMITTED for a session — now committed + pushed. **Not yet PR'd.** |

**Bake evidence, 720p `--clip 0.74:1.0`, real GPU, `Hospital_silent_local` (2 runs, `out/ending2.log`,
`out/ending3.log` in `/tmp/wt-storey-reveal`):**
- `§CLASH_DISC_ARRIVAL … PLB=0 FP=38 ELEC=33 MEP=133 backdrop=66 total=270 sumCheck=OK`
- parade slots fire in order: `PARADE:FP`(38) → `PARADE:ELEC`(33) → `PARADE:MEP`(133) → `PARADE:ALL`(204)
- pullback after the fix: `ARC|STR` FIRST at frame 287, then even 89-frame spacing through all 7 pairs
- `§STOREY_REVEAL_FIT windowSec=5.02 storeysAvailable=8 shown=5 slotSec=1.00 TRUNCATED dropped=[Level 6,Level 7A,Level 7]`
- `§MEASURE_BUILDING_CARD window=[0.9590,1] cards=4 (the whole closing orbit, 8.0s, 2.0s per card)`;
  census `doors=440 windows=131 walls=1468`; envelope `897,404 m³`, `115.8 × 164.8 × 47.0 m`
- ⚠ `labour=0` on a silent bake (`A._hrCost` is interactive-only) — the cost card now says "material cost
  estimate", NOT "total estimated cost", so a materials-only figure is never passed off as a total.

**⛔ USER: no further bakes without a new go-ahead** (2026-09-06: *"Need not bake again"*; the 1440p
resolution bench remains separately HELD from an earlier session). §STOREY_REVEAL_XRAY / _MARKERS_OFF /
_PULSE (defects 2 and 3) are CODE-COMPLETE but their on-screen proof lands in the last ~300 frames of the
final bake — if that run did not reach them, they are UNVERIFIED, and must be labelled so, not assumed.


**20.11 LABELLING — share Clash's routine; PANEL for a set of numbers, LINE for a single one (user, 2026-09-07).**
> *"The labelling routine can share the same done by Clash.. should we have that so they are all
> consistent and professional looking?"* … *"where the XYZ / Area/ Vol/ etc is in a panel box rather
> than lining more spaces may look cluttered"*

**Two forms, chosen by how many numbers there are — not by taste:**
- **A SET of numbers → ONE PANEL.** A space carries X, Y, Z, area and volume. Five dimension strings
  around one room is clutter. This also fixes a hole: **a scalar has no edge to sit on**, so area and
  volume could never be arrowed strings. A panel takes all five.
- **A SINGLE number → ONE arrowed dimension line.** A slab width, an opening height, an edge-to-edge
  gap. One value, and the line points at exactly what it measured.
⇒ **§20.1's "filled grid measuring their XYZ" means: highlight + filled grid + ONE PANEL**, not three
dimension strings.

**This also assigns the two visual languages, which were drifting:**
- **Drafting language** — extension lines, arrow heads, bubbles, strings on edges — belongs to the
  OPENING ENCLOSURE, where §17.4 already relocated the envelope's dimensions. That layer *is* a drawing.
- **Panel + leader + highlight** belongs to IN-FILM SUBJECTS. That layer is a camera picking things out.
Two languages, assigned by context, instead of one fighting the other.

**REUSE `viewer/clash_labels.js` — it is further along than it looks (verified 2026-09-07):**
| Need | Existing | Line |
|---|---|---|
| Draw into the BAKE's 2D canvas | `A.clashLabelsCompositeOntoCanvas(ctx, w, h, placed)` | `:309` |
| Style already a published contract | `A.clashLabels.style()` → `colA, colB, tint, weight, plate, leader, leaderHalo` | `:374` |
| Placement already split from drawing | `update()` computes `placed`, compositor consumes it | — |
| Non-overlap, constant screen size, leader + halo, frustum release, rank hysteresis | shipped | — |
| Witness | W-CLASH-LABELS, `witness_clash_film_labels.js`, claims P0–P8 | — |

⚠ **SHARE THE PLACEMENT AND DRAW LAYER, NEVER THE SELECTION LAYER.** Clash selects by RANK — top-N
nearest pairs, no distance cutoff. Measurement cues select by PROMINENCE + ≥2 s hold. A later
"unification" that makes cues rank by distance would reinstate exactly the criterion §6 retired.

⚠ **Style diverges, and `style()` already anticipates it.** Clash uses a half-see-through PLATE. §7 ruled
the measurement label an OUTLINED box. Resolution: **parameterise style, do not fork the module** —
outline for the type-B line label, plate for the type-A panel, since five rows of numbers over a busy
interior need the plate to stay readable where a single `1,083 mm` does not.

✅ **THIS CLOSES GAP 20.10.2 for free.** If one routine places every label, the cross-layer occupancy
register is not a new subsystem — it is that routine's own per-frame state.
⚠ **But it raises a STRONGER constraint the module does not yet meet.** §20.2 allows two spaces live at
once, so two panels can be up together. **Their leaders must not CROSS**, or the viewer cannot tell which
panel belongs to which room. `clash_labels` solves non-OVERLAP, not non-CROSSING. Assert it in the
witness rather than discover it in a bake.

### 21. §FLYTHRU_SNAP — judge a moment without baking, and the BUILDUP facts that invalidate §20's numbers
**Tool:** `scripts/snap_timeline.js` (branch `feat/flythru-cues`). Streams the model ONCE, then writes a
PNG at each second asked for.
```
node scripts/snap_timeline.js --db Hospital_silent_local --dur 195.8 --at 0,5,9
node scripts/snap_timeline.js --db HHS_silent --dur 61.04 --from 0 --to 20 --step 2
```
**Cost:** a 10 s clip bake was **93 s** and 150 encoded frames; the whole film is ~113 min. The snapper
pays the stream once and each frame after is a fraction of a second.
**It is a REAL frame**: it drives the same camera (`cinemaPathPlan(dur).poseAt(u)`) and the same buildup
cursor the bake drives. ⚠ It does NOT run the photoreal passes (`§STILL_REFINE`, `§PHOTO_AO`, staging) —
use it to judge WHAT IS IN FRAME, never final image quality.

**⚠ TWO OPERATIONAL TRAPS, both cost a run each.**
1. **`tmActivateForBake()` MUST be awaited before `tmFollowTimeline()`.** Called cold it returns
   VACUOUS (`reject reason=no-ops`) and the tool wrote two IDENTICAL frames of the FINISHED building at
   0 s and 9 s. They looked perfectly plausible; only the identical mesh count exposed it. The tool now
   prints `§SNAP_WARN` on every unarmed run — keep that guard.
2. **Run it DETACHED (`nohup`).** Streaming Hospital's 64,150 elements spikes hard enough to trip the
   task memory watchdog: **killed three times** as a tracked background task, survived first time
   detached. The bake was never killed because it was already launched detached.

**MEASURED — the buildup, and it CORRECTS §20.**
| | Hospital (dur 195.8 s) | HHS_silent (dur 61.04 s) |
|---|---|---|
| t=0 | cursor 2026-09-10, 2 meshes, cam 70 m up | cursor 2026-09-02, 3 meshes |
| t=5 / t=9 | 437 meshes / 994 meshes, cam 17 m at 9 s | 108 meshes at 9 s |
| t=20 | — | 253 meshes |

⛔ **THE BUILDUP DOES NOT FOLLOW THE `tasks` TABLE.** Its cursor starts **2026-09-10**; the `tasks` rows
span 2026-01-01…11-26. And it is paced by **ELEMENT COUNT, not days** (`§CPE_BUILDUP_WORK_PACED`,
`cinema_maxq.js:1659`), topping out at **`topoutU=0.361`** — all construction inside the first ~70 s of
195.8 s. Any day-linear mapping from `tasks` is wrong on BOTH the calendar and the pacing.
⇒ **§20's probe rankings are INVALID as they stand.** `probe_flythru_subjects.js` scored every slab as
if the building were complete at every frame. At t=9 s only ~a fifth of the model exists, so its top
candidates (Level 5/4/3/6 slabs) are floors **not yet cast**. Existence-at-time must be applied before
any of those numbers drive a cue. The defect is recorded in that probe's own commit message too.
⚠ Live consequence already visible in the shipped bake: `§FLYTHRU_CUE_ON key=storey … filmSec=2.75
"Level 1 — Floor 11,678 m²"` fires at **3.9 % of construction** — a finished floor area stated over a
slab the viewer is watching being poured.

**§20.8 ANSWERED for Hospital — the enclosure DOES establish** (`probe_t0_frame.js`, log `out/t0_frame.log`).
At second 0 the camera is at `(85.5, 70.0, 58.9)`; the structural envelope runs `(-65.2,-24.6,-71.0)` to
`(50.5, 22.4, 62.9)`. **Camera is OUTSIDE it**, 0 corners behind, **7 of 8 corners in frame** — the stray
one ~40 % past the edge. `modelOffset = (46.2, 93.0, 181.2)`, confirming §2's ~169 m datum warning.
⇒ **A strict "all 8 corners" test would delete the whole opening over ONE clipped corner.** So
"fully in frame" (§20.4) belongs to MEASURED SUBJECTS, whose boundary must be whole to be tinted — NOT
to the enclosure, which is a backdrop and may run off the frame as any drawing sheet does. The
enclosure test is: camera outside, nothing behind camera, the great majority in view.
⚠ An earlier answer here said the camera was INSIDE the envelope at t=0. That was read off the stored
`cinema_path` waypoint, not the rendered pose. **The bake starts at t=0 — read `plan.poseAt(0)`.**

**21.1 LAYERS — `--clash` and `--cues` (added 2026-09-07).**
```
node scripts/snap_timeline.js --db Hospital_silent_local --at 9,14,22 --clash --cues
```
⚠ **THE FILM DRAWS IN TWO PLACES, and this is the trap.** The 3D scene (clash markers, storey tints,
cue boxes) is in the WebGL canvas. The **labels, captions and day counter are NOT** — `_captureFrame`
(`cinema_maxq.js:767`) draws the WebGL canvas onto a 2D context and THEN composites them
(`clashLabelsCompositeOntoCanvas`, `roomTitleCompositeOntoCanvas`, `dayCounterCompositeOntoCanvas`, …).
**A page screenshot silently omits every label.** So with any layer on, the snapper renders explicitly,
draws the canvas, composites the same layers in the same order, and saves THAT — not a screenshot.
Reachable API, all already exposed: `A.clashFilm.build()` / `.update(filmSec, camera)` ·
`A.clashLabels.update(camera, filmSec, w, h, frameIdx)` → `.placed` · `A.flythruCuesBuild/ApplyVisual/CueCaptionAt`.

**MEASURED, Hospital, clash+cues on** (`out/snap_layers.log`):
| t | visible meshes | clash labels |
|---|---|---|
| 9 s | 997 | 4 |
| 13 s | 1,438 | 0 |
| 14 s | 1,551 | 0 |
| 22 s | 2,207 | 1 |
**Clash labels thin out early in the film** — they select the nearest pairs per frame and BOTH elements
of a pair must be built, so the buildup starves them at the start. Not a bug; a consequence of §21's
existence rule, and worth remembering before anyone "fixes" a frame with no labels in it.
⚠ **Snap INSIDE a cue's hold, not at its start.** A snap at t=13.00 s missed the corridor cue entirely —
its window is 13.05–15.25 s. Read the placement from `§FLYTHRU_CUE_PLACE` first, then pick the middle.

**20.11a ✅ BUILT 2026-09-07 — the marking ships. Do NOT port it again.**
`viewer/cpe_flythru_cues.js` → `A.flythruCuesCompositeOntoCanvas(ctx, w, h, filmSec)`, composited by
BOTH consumers: `cinema_maxq.js` `_captureFrame` and `scripts/snap_timeline.js`. Branch
`feat/flythru-cues`. The geometry came from `probe_flythru_dims_still.js:197-222`, where it had been
stranded since an earlier session — **that stranding is why the first preview was "a bad job"**.
**MEASURED** (`out/snap_see.log`, Hospital, real path + buildup):
| t | cue | marks | form |
|---|---|---|---|
| 1.0 s | envelope | **4** | 3 arrowed spans `[x,z,y]` + 2-row panel (ground area, volume) |
| 3.5 s | storey | **3** | 2 arrowed spans `[x,z]` + 2-row panel (floor, walkable) |
| 14.0 s | corridor | **1** | 1 arrowed span `[x]`, **no panel** — one number, one line |
Spans are taken on the box edges NEAREST the camera so the triad reads as an orthogonal corner rather
than crossing the model. Pixel constants scale by `h/720`. It DECLINES rather than scribbles: a span
under ~24 px, or either end behind the camera, is skipped **and the reason logged**.

⚠ **TWO SELF-INFLICTED FAULTS, recorded because both are cheap to repeat.**
1. **`§FLYTHRU_DIM_DRAW` was working from the first attempt.** Three runs were spent diagnosing a
   non-existent failure because `scripts/snap_timeline.js`'s console filter matched only `§SNAP_` and
   discarded every `§FLYTHRU_` line. **If a probe forwards browser logs, widen the filter BEFORE
   concluding a feature is dead.**
2. **A stale-service-worker theory was asserted, acted on, and was wrong** — the check returned
   `unregistered=0`: there was no worker. The SW-bypass added to the snapper is worth keeping on its
   own merits, but it fixed nothing here. Verify the mechanism before changing code on a theory.
⇒ The marking pass now prints `§FLYTHRU_DIM_DRAW NOTHING … diag=[…]` with a per-span reason instead of
returning 0 in silence (PRIMAL LAW §4). A pass that draws nothing and says nothing is indistinguishable
from one that worked — that is precisely what happened here.

### 22. §MEASURE_CHARTING — how to use the snapper to work the abstraction list (handover, 2026-09-07)
**The point of the tool is not screenshots. It is that a question about the film costs ~2 minutes
instead of ~113.** Use it to CHART the Measure feature shot by shot, not to admire frames.

**22.1 THE LOOP, per item on the §20/checklist.** Three questions, all answerable from one stream:
1. **Is there a candidate on this building?** → `§FLYTHRU_CUE_PLACE` / `§FLYTHRU_CUE_DROP` name it, with
   candidate count and window count. A DROP line tells you it is absent, not that the code is broken.
2. **Is it on screen long enough?** → the placement line's window, and `§SNAP_FRAME visibleMeshes`.
3. **Does its marking read?** → `§FLYTHRU_DIM_DRAW key=… marks=N spans=[…] panelRows=N`, then the PNG.
⚠ **Snap INSIDE the hold, never at its edge.** Read the window off `§FLYTHRU_CUE_PLACE` first. MEASURED
traps: `t=13.00` missed the corridor (window 13.05–15.25), and `t=0.00` draws NOTHING because the
envelope's window opens at 0.0 but its fade-in leaves opacity 0 at that instant
(`§FLYTHRU_DIM_DRAW INACTIVE … windows=[envelope:0.0-2.2 …]`). Use 0.7 s to see the opening cue.

**22.2 THE ABSTRACTION LIST — the eight shots (user, 2026-09-07), and what each still needs.**
| # | Shot | State | Next question for the snapper |
|---|---|---|---|
| 1 | Ground plane + **ONE** vertical plane | spec only (§17) | does the enclosure read at 0.7 s? |
| 2 | Storey floor plate + area | **draws** (marks=3) | is the plate the one on screen at that second? |
| 3 | Hall or room | rooms draw; **halls not derived** | does a hall exist once §20.7 clustering lands? |
| 4 | Highest point in a hall | not built | — |
| 5 | Corridor length | **draws** (marks=1) | is 13.05 s the best window? |
| 6 | One opening, door or window | not built | ⚠ HHS has **no** `IfcWindow` — accept either |
| 7 | One MEP set, if any | not built | — |
| 8 | Opportune extras | not built | — |
⇒ **2 of 8 shots draw today.** 1 and 3 are the next two, and both are blocked on the same clustering.

**22.3 ⛔ THE DEFECT THAT OUTRANKS THE LIST.** Every number describes the FINISHED building while the
film shows it being built. `§FLYTHRU_CUE_ON key=storey filmSec=2.75 "Level 1 — Floor 11,678 m²"` fires
at **3.9 % of construction**. Existence-at-time (§21) must gate a cue before any more shots are added,
or eight shots will each state a completed figure over a half-built subject.

**22.4 MEASURED TODAY, feeding the list — two settled, two NOT earned.**
✅ **Envelope: drop rogue boxes FIRST, then cluster.** Order is load-bearing — clustering alone returns
ONE component covering everything, because a rogue 48 × 131 m `IfcStair` box physically BRIDGES the
building to the outliers. After dropping: Hospital 164.78 → **126.5 m** on Y, separating a 62 m² island
of railings genuinely sited 29 m out; HHS 82.35 × 59.89 → **67.50 × 58.50 m**, one 2 m² island.
✅ **Grid lines from WELL-SPACED COLUMNS beat the shipped detector.** Cluster column centres at a 6 m
minimum separation: Hospital **15 × 14** lines, median bay 6.44 m; HHS **9 × 8**, median 6.5–7.2 m. Both
coherent — where `GridDims` returns Hospital's incoherent `1417 | 99155 | …` ladder (§18). No rules DB,
no vote weights.
⚠ **NOT EARNED — the 6× class-median rogue threshold.** It also discards 43 `IfcWallStandardCase`
(Hospital) and 4 `IfcCurtainWall` (HHS), which are legitimately long. Hospital's cleaned Y of 126.5 m is
**7.4 m SHORTER than the structural envelope**, so it is cutting real building. Mechanism proven,
constant not.
⚠ **NOT EARNED — the 6 m column separation.** Chosen as a sensible structural minimum, not derived.
Under §12 it must come from the column-spacing distribution itself.
**Storeys for the elevation lines:** HHS clean (3 levels). Hospital stores 23 rows including
`Level 1 Ceiling` / `Level 2 TOS` — **fold the pseudo-levels out** (→ ~8) or lines appear where no floor
is. ⚠ Schema differs: Hospital has `elevation`, HHS has only `center_z`. Needs a fallback, not one query.

**22.5 USER RULINGS this session that change earlier sections.**
- **ONE vertical plane, not two** — the ground carries length and breadth, one plane carries height, the
  second only repeats it. Also removes §17.2's per-frame two-plane back-face test.
- **All dimensions in, and ONLY in, the label box** — L/W/B + area + volume together. This SUPERSEDES
  §20.11's "single number → arrowed line" for these cues.
- **The label box sits OUTSIDE the envelope**, clear of the buildup. Today it anchors at the box centre
  and offsets 26 px, so it lands ON the building by construction.
- **The envelope must hug the ground structure** — see 22.4.

### 23. ✅ SECOND ZERO IS BUILT — `viewer/cpe_flythru_datum.js` (2026-09-07, branch `feat/flythru-cues`)
§17 was spec only. It is now code, and second zero stands a complete setting-out drawing.
**Built from the DB, so it is up at frame one regardless of what is constructed** (user: *"Grids must
be up at zero second no matter what the buildup as the data is at hand"*).

**WHAT IT DRAWS**
- **Ground grid** from REAL column centres, thinned to a 6 m minimum separation. Hospital 604 columns
  → **15 × 14**, median bay 6.48 m; HHS 257 → **9 × 8**, 6.54 m. ⚠ This BEATS the shipped `GridDims`,
  whose opportunity-vote returns Hospital's incoherent `1417 | 99155 | …` ladder (§18).
- **Bubbles** — numerals on X, letters on Y, skipping **both I and O** (`grid_dims.js`'s own sequence
  keeps O).
- **Two-tier strings** (user: *"length between inner lines, then outer"*): tier 1 bay
  gridline-to-gridline nearest the building, tier 2 overall stepped out, its witness lines starting at
  the **bubble edge** so it visibly spans bubble-to-bubble, labelled with the refs — `1 – 9   54,744`.
- **Upright = LEVEL LINES ONLY** (user: *"The upright is simply level lines. That is it"*). Vertical
  gridlines were added here and removed — the ground already states the grid. Each rule carries its
  name and elevation from the DB.

**NEAR-SIDE ANNOTATION, per frame** (user: *"make the ground 2D markings on the near sides of course
unless u dont want anyone to read well"*). The PLANE goes AWAY from the camera (occluded by the build);
the ANNOTATION comes TOWARD it. Same vector, opposite sign.
⚠ **Bottom and left need DIFFERENT tests** — bottom = projects lowest (largest screen y), left =
projects leftmost (smallest screen x). Using the y-test for both put the letter bubbles on whichever
long edge sat lower.

**FIVE DATA FAULTS FOUND AND FIXED — all measured, all would have shipped**
1. **DATUM MISMATCH.** Hospital records storey `elevation` 0..34 m while its elements sit at
   156.61..203.62 — **0 of 56 rules** would land inside the building. Detected and offset; HHS already
   agrees (0.22..7.43 vs −0.21..10.90) and is left alone. `§FLYTHRU_DATUM_ZDATUM` says which.
2. **LABEL vs GEOMETRY datum.** The tag prints the LOCAL figure (`Level 2 +6.000`); only the geometry
   takes the offset. Printing the offset would read `+156-something` on every level.
3. **DUPLICATE LEVELS.** Hospital records `Level 2` at BOTH 6.00 and 6.10 — one floor, 100 mm apart.
   Exact dedupe kept both and drew a doubled rule (12 for ~8 floors). Merged within 300 mm.
4. **BACK FACE hardcoded** to max-Y, which puts the plane between camera and building from one side.
   Both faces built; the far one shows.
5. **NO SPACE.** A sheet is fixed; a moving camera is not. A bubble whose position leaves the frame now
   **slides along its own gridline** to the boundary, keeping the association, and drops only when the
   line is gone. Both counted — silence would look identical to the feature having stopped.

**MEASURED, HHS t=0:** 33 marks · 3 level tags · **10 of 17 bubbles CLAMPED, 1 dropped** — so the plan
does NOT fit the frame even at its widest moment. Consistent with the Hospital envelope check (7 of 8
corners in frame, one 40% past the edge). Frame 98,289 bytes against 49,333 blank.
**CHAIN ASSERTED, not assumed** — the check a drawing is verified by:
`§FLYTHRU_DATUM_CHAIN X bays=54.744m overall=54.744m delta=0.0000 | Y 52.491m = 52.491m → CHAIN ADDS UP`.

⚠ **LIFETIME — read before testing any later second.** The datum holds through the dive then fades:
`max(6, filmSec × 0.094)` plus a 2 s fade. **On HHS it is GONE by 8 s**, so a snap at 8 s or 20 s draws
nothing and logs nothing — that is not a failure. Hospital's window is ~18.4 s and spans all three cues.

**23.1 FINISHED 2026-09-07 — both buildings, and three fixes worth carrying.**
| | Hospital | HHS |
|---|---|---|
| marks at t=0 | **50** | 33 |
| grid | 15 × 14, bay 6.48 m, 604 columns | 9 × 8, bay 6.54 m, 257 columns |
| level tags | **8** (from **56** raw rows) | 3 |
| datum offset | **+156.61 m** applied | none needed |
| bays drawn | 11/27 | 13/15 |
| overalls | **2/2** | 1/2 |
| chain | X 95.915 = 95.915, Y 88.227 = 88.227 | X 54.744 = 54.744, Y 52.491 = 52.491 |
| bytes vs blank | 169,412 vs 17,840 | 98,289 vs 49,333 |

⛔ **THE CLIP TEST WAS WRONG AND IT AFFECTED EVERYTHING.** Points were rejected on NDC `z >= 1`, which
means **beyond the FAR plane — not behind the camera**; such a point still projects to valid screen
coordinates. MEASURED: an overall declined with `z=0.99,1.23` purely because its far end sat past the
far plane. Bubbles and level tags were dropped on the same test. **Test VIEW-SPACE depth, never NDC z.**
⚠ **HHS's 1/2 overall is CORRECT, not a defect** — one end of that axis is genuinely behind the camera,
which a straight dimension cannot reach. A drawing picks a viewpoint where both ends are visible; a
film camera does not. The overall carries its own lower floor (12 px vs the bay's 26 px) so it does not
vanish merely from foreshortening, and logs its reason when it still declines.
⚠ **Hospital draws only 11 of 27 bays at t=0** — a 6.5 m bay on a 116 m building seen from 100 m is a
few pixels wide, so the readability floor drops them. Not a fault; the inner tier fills in as the camera
closes. It does mean the opening frame shows a sparse chain plus both overalls.

**⛔ NEXT SESSION — the snap formula.** Second zero is settled; the open question is which second to
snap next and why. Everything else in §22.2 still stands: 2 of 8 shots draw, and §22.3's defect — every
number describing the FINISHED building while the film shows it being built — outranks adding more.

### 24. §DATUM_LABELLING — the redo brief (user, 2026-09-07). START A NEW SESSION HERE.
> ⛔ **GATE — SOLVE THIS FIRST, AND GET THE USER'S AGREEMENT BEFORE MOVING ON** (user, 2026-09-07:
> *"Tell prompt to solve that first, let user agree before moving to the next"*).
> **Nothing else in this lane proceeds until the labelling is right and the user has said so.** Not the
> snap formula (§22), not the remaining six shots of the abstraction list (§22.2), not the
> existence-at-time defect (§22.3) — however tempting, since that one outranks the shot list on merit.
> **The user's agreement is the gate, not the log lines.** A green `§FLYTHRU_DATUM_MARKS` and an exact
> chain were BOTH true while the annotation looked wrong — that is precisely how this lane got here.
> Iterate on the labelling with the snapper (seconds are cheap now, §21), show the frame, and WAIT.
> *"update prompt to do labelling well. Due to cramming of space, u can always align in parallel to the
> line. Avoid diff coloring as outright well laid out lines bubbles will point to the right picture.
> Font been bold is like shouting and noise. Organise that u need not label every small inner lengths
> simply not smart. Selective, good design."*

**The current annotation is SLOPPY and is not to be patched further — it is to be redone.** What shipped
works arithmetically (the chain adds up on both buildings) and looks wrong, which is the worse failure.

**24.1 THE FOUR RULINGS.**
1. **TEXT RUNS PARALLEL TO ITS LINE.** Rotate the value to the dimension line's own angle. Horizontal
   text on an angled string is what forces the value out into space and causes the cramming.
2. **ONE INK. NO COLOUR CODING.** Bays were near-white and overalls yellow; that was me signalling
   hierarchy with colour. *"outright well laid out lines bubbles will point to the right picture"* —
   position and structure carry the hierarchy, not hue. (§7's yellow stays for MEASUREMENT CUES, which
   are a different layer; the datum is drafting furniture and should read as one quiet system.)
3. **NO BOLD.** *"like shouting and noise"* — regular weight throughout, and rely on the halo for
   legibility over the model.
4. **SELECTIVE, NOT EXHAUSTIVE.** *"u need not label every small inner lengths simply not smart"* — a
   good drawing dimensions what a reader needs, not everything it can. Label the overall always, and a
   sparse, regular sample of the chain. Labelling all 27 Hospital bays was never the goal.

**24.2 NO BOXES ON VALUES — already fixed, keep it that way.** A dimension figure sits in the BREAK in
its own line; a level datum sits on its line with a tick. The earlier "outlined box, not filled" ruling
was about the PANEL (a container for a SET of numbers) and I wrongly applied it to every individual
figure, putting a yellow rectangle round every number. That is what made it ugly.

**24.3 THE STRUCTURAL FAULT UNDERNEATH — there is no layout pass.** Bubbles, bay chain, overalls and
level tags are four independent loops, each deciding alone whether to draw, with nothing coordinating
them. MEASURED consequences: Hospital drew **11 of 27** bays — a chain with 16 random gaps, which reads
as broken rather than thinned; HHS clamped **10 of 17** bubbles onto the frame edge, a row of debris.
**The redo needs ONE pass that:**
- measures the plan's on-screen size FIRST, and scales every offset from it (fixed pixel offsets crowd
  a small plan and scatter a large one);
- picks ONE thinning stride for the chain — `0 → N → 2N → last`, which still spans the full extent so
  the chain sums to the overall exactly;
- treats bubbles as ALL-OR-NONE per axis (a stranded row is worse than none);
- guarantees the overalls, which are the headline figures;
- places every label against a shared occupancy register so nothing lands on anything else.
⚠ A partial version of this landed 2026-09-07 (stride, all-or-none, proportional offsets). Its LOG
improved — Hospital t=0 went from `bays=11/27, clamped=2` to `bays=13 stride=2/2 bubbleSets=XY
scale=0.82 overalls=2/2 clamped=1 levelTags=8`, chain still exact — but **the frame was never judged**.
Treat it as scaffolding for the redo, not as working. The whole point of §24 is that a better log is
not a better drawing.

**24.4 WHAT IS SETTLED AND MUST NOT BE RE-LITIGATED** — §23 measured all of it:
ground grid from real column centres (Hospital 15 × 14 @ 6.48 m, HHS 9 × 8 @ 6.54 m) · bubbles numerals
on X / letters on Y skipping I and O · two-tier bay + overall with the overall spanning bubble-to-bubble
carrying its grid refs · upright = LEVEL LINES ONLY with name + LOCAL elevation · annotation on the near
edges chosen per frame (bottom by lowest projection, left by leftmost — different tests) · the plane on
the FAR side, depth-tested so the build occludes it · **view-space depth for clipping, never NDC z**.

**24.5 ✅ THE REDO IS BUILT — `viewer/cpe_flythru_datum.js`, branch `feat/flythru-cues` @ `401e8519`
(2026-09-07). ⛔ THE GATE STILL STANDS: this is submitted for the user's agreement, not closed.**
The four rulings are each one decision in a single layout pass, and the pass replaces the four
independent loops §24.3 named:
- **measure once** — the plan's on-screen size sets every offset (`scale` clamped 0.6–1.8);
- **ladder outward** — plan edge → tier 1 bay → tier 2 overall → bubbles, each rung stepped along
  that gridline's OWN projected direction, so a bubble sits on the extension of the line it names and
  the overall's witness lines physically reach it. ⚠ The old code put bubbles ON the plan edge and
  offset the strings along an UNSIGNED perpendicular, which dropped the figures INSIDE the plan half
  the time — **that was the cramming**, not the font;
- **one index list** shared by the chain ticks and the bubbles, with a stub shorter than the stride
  absorbed into the bay before it (it was making Hospital's N/P bubbles one gridline apart while
  every other pair was two);
- **a shared occupancy register** — every label claims the AABB of its *rotated* box; what will not
  fit is dropped AND COUNTED (`collisionsDropped=`);
- **level tags on ONE end**, the end picked by a scored dry run against a scratch register.

| | Hospital | HHS |
|---|---|---|
| overalls | **2/2** | **2/2** |
| bay segments drawn | 13/13 | 11/11 |
| bay FIGURES (cap 4/axis) | 4 | 4 |
| bubbles | 15, 2 clamped, 0 dropped | 13, 1 clamped, 0 dropped |
| level tags | **5/8**, far end (scored 3/5) | **2/3**, far end (scored 1/2) |
| chain | X 95.915 = 95.915, Y 88.227 = 88.227 | X 54.744 = 54.744, Y 52.491 = 52.491 |

**A DATA FAULT THE OLD LABELLING WAS PRINTING.** `storeyLevels()` merged near-duplicate storey rows
then kept the **FIRST** row of the cluster. MEASURED on Hospital: **5 of 8 clusters disagree
internally**, and 3 printed the single outlier elevation — `Level 3 +10.973` over six rows at 11.000,
`Level 4 +15.850` over six at 16.000, `Level 5 +20.726` over five at 21.000. Worse, the 31.0 m cluster
printed `Level 7` from one row while **two** rows say `Level 7A`, so the drawing carried **Level 7
twice**, at 31 and at 34. Now the cluster's **MODAL** name and **MODAL** elevation win;
`§FLYTHRU_DATUM_LEVELVOTE clusters=8 needingAVote=5` says how often it mattered.

⚠ **STILL OPEN, stated rather than hidden.** `bayFigures=4` of 8 wanted on each building
(`collisionsDropped` 11 / 6) · Hospital's level sample drops 3, 5 and 7A · Hospital's X-axis string
runs across the top edge of the envelope — harmless at t=0 (the film has 3 meshes then) but
**untested at 8–18 s while the datum still holds and the building is rising**.

**24.6 §SNAP_NOSTREAM — the snapper was the bottleneck, and it is repaired (user, 2026-09-07:
*"snap takes too long. Maybe it needs repair?"*).**
A ONE-frame Hospital run cost **~7 minutes**, essentially all of it streaming 64,150 elements and
waiting for the count to settle. The datum is built from **DB queries and the camera pose alone** — it
reads no mesh — so `--nostream` skips the stream: **~7 min → 16 s.** Two traps found on the way, both
recorded because both are cheap to repeat:
1. **Skipping the stream is NOT skipping the DB.** `window.APP.cinemaPathPlan` exists before the
   SQLite handle is usable, and the first run logged `§FLYTHRU_DATUM VACUOUS — no structural extent`.
   A VACUOUS datum reads exactly like a broken one. It now waits for a real row.
2. **The camera is not free either.** With nothing streamed, `A.controls.target` is still at the
   ORIGIN and **PASSES** `§CINEMA_PIVOT`'s plausibility test (`offCentre 19.7 < boundingR/2 = 45.7`),
   so the whole path orbits (0,0,0): Hospital t=0 came out at `(135.8,181.0,135.8)` against the
   streamed `(85.5,70.0,58.9)`. ⚠ **Parking the target far away is NOT the fix** — it appeared to work
   on Hospital only because Hospital has an AUTHORED `cinema_path` (`bands=4`, absolute coordinates);
   HHS's path is DERIVED and followed the parked target out to `(88452,88455,88452)`. The fix is to
   give the viewer the **same home framing it computes for itself after a stream** —
   `scene.js` `_homeFillFrame`'s formula, from the DB: whole-building `element_transforms` bbox,
   `dist = max(80, envelope)`, camera at `ctr + dist·(0.6, 0.8, 0.6)`, target at `ctr`. **Hospital's
   datum numbers under `--nostream` are then byte-identical to the streamed run.**
⚠ **WHAT `--nostream` IS NOT.** MEASURED 504 visible meshes — the viewer still draws wireframe
placeholders, and the film's own buildup is 3 meshes at t=0. **The camera and every DB-derived layer
are exact; the SCENE is not the film's**, so occlusion, mesh counts and the day cursor are VACUOUS in
such a frame. Drop the flag the moment the question is about the buildup.
⚠ And, for the third time in this lane: the snapper's console filter was hiding the evidence —
`§CINEMA_PATH_RESTORE` and `§CINEMA_PIVOT` were both being discarded while `--nostream` was judged on
its camera. **Widen the filter before concluding anything.** It now passes `§CINEMA_`/`§CPE_` too.

**24.7 THE Z PLANE JOINS THE SAME LADDER, AND THE EDGE IS SCORED (user, 2026-09-07:
*"need consistency - the Z plane has to have same style bubbles and proper. Be pro, no slop."* and
*"the axis bubbles why not use the open space in the foreground?"*). Branch `feat/flythru-cues` @
`63f9606f`. ⛔ THE §24 GATE STILL STANDS — submitted, not closed.**
- **Z was a special case and is not any more.** It was free text tags reading `Level 4   +16.000`,
  staggered into two columns, with their own dry-run side-picker, their own leader, their own tick
  and their own font — **four bespoke mechanisms for one axis, none of them the ones the ground
  uses**. `mkAxis` is now defined by two closures (where a value sits on the annotated edge, where
  the same value sits on the opposite one), so nothing in it knows about X, Y or Z. The storey rules
  carry **bubbles, a tier-1 chain of floor-to-floor heights and a tier-2 overall height spanning
  bubble to bubble** — same offsets, same ink, same weight, same code. MEASURED at t=0: `L1 L3 L5 L7`
  · storey height `11,000` · overall `L1 – L7   34,000`.
- **The Z bubble ref is EXTRACTED**, never invented: the trailing `7A` of the storey's own name, with
  the initial of its leading word as prefix (`Level 4` → `L4`, `Storey 4` → `S4`) so it cannot be
  misread as gridline 4 — the X axis already owns bare numerals.
- **§24.4's "bottom by lowest projection, left by leftmost" is SUPERSEDED.** Each test read ONE
  coordinate of ONE midpoint, which is how Hospital's letter row ended up laid across the building
  with the whole foreground empty. Both candidate edges of every axis are now scored by where their
  OUTERMOST rung actually lands: **fraction inside the frame (weighted ×2 — an off-frame row is
  worthless) plus a clamped 0–1 depth term** as the tie-break.

**24.8 ⛔ THE INSTRUMENT WAS BROKEN AND IT NEARLY DECIDED THE DESIGN — read this before trusting a
`--nostream` frame.** `--nostream` (§24.6) makes a frame in 16 s instead of ~7 min, but **its camera
cannot be made reproducible.** Three fixes were tried and all three are recorded because each looked
right: (a) park `controls.target` far so the planner takes its arc-bbox-centre branch — with the
controls LIVE, OrbitControls repositions the camera to keep its offset and HHS flew to
`(88452,88455,88452)`; (b) imitate `scene.js` `_homeFillFrame` from the DB — **it cannot be
imitated**, it centres on `A.buildingCentres`, which only streaming populates, and the substitute
camera changed the PLAN (`§CINEMA_PIVOT` reads `A.camera.position`), so `poseAt(0)` drifted to
`(83.2,121.0,106.9)` and **THREE IDENTICAL RUNS PRODUCED TWO DIFFERENT FRAMES**; (c) disable the
controls and park — the drawn frame stabilised, but only because the app's own loop overrides the
script. ⇒ `--nostream` now only disables the controls and **STATES the divergence**: `§SNAP_POSE`
prints `poseAt`, the camera actually used, and `AGREE` / `⚠ DISAGREE`. **Iterate with it; confirm on
a streamed run.** A streamed run reports `delta=0.0m AGREE` at every second.

**24.9 WHAT THE FIRST REAL STREAMED SEQUENCE FOUND (Hospital, t=0,3,6,9,12,16,18 — the datum's whole
18.4 s life; `out/real_hosp3.log`).** Two defects that no single t=0 frame could have shown:
1. **Both edge scorers were unbounded** — the depth term is a mean screen y over frame height and
   perspective throws points far outside the frame, so it logged **19.10, 8.93, 7.76**. Clamped.
2. **The ground kept drawing after it stopped meaning anything** — at t=9/16/18, camera INSIDE the
   building, it painted **22–24 bay dimension lines with ZERO bubbles and 1 of 3 overalls**. An axis
   that cannot carry its refs no longer draws its chain, and the withdrawal is named (`axes=XY-`).

| t | axes | bubbles | zBubbles | overalls | baySegs |
|---|---|---|---|---|---|
| 0 | XYZ | 15 | 4 | 3/3 | 16/16 |
| 3 | XYZ | 15 | 4 | 3/3 | 16/16 |
| 6 | XY- | 15 | 0 | 2/3 | 13/13 |
| 9 | X-- | 8 | 0 | 1/3 | 7/7 |
| 12 | X-- | 15 | 0 | 1/3 | 14/14 |
| 16 | --- | 0 | 0 | 0/3 | `NOTHING drawn=0`, and it says so |
| 18 | --- | 0 | 0 | 0/3 | `NOTHING drawn=0`, and it says so |
Chains exact at every second: X 95.915 = 95.915 · Y 88.227 = 88.227 · Z 34.000 = 34.000.

⛔ **RETRACTED — I raised a "design question" here that the spec had already answered, which is the
exact failure §24's gate exists to stop. USER, 2026-09-07: *"IF u do not follow specs which u kept on
doing, i be switching to another LLM. Now be serious. During buildup, they are occluded and fade off.
THeir initial appearance function is to give the user a sense of its BIM capable."*
The datum being occluded by the rising build and then fading is **the designed behaviour** (§17.5 and
this module's own header: the model progressively hiding its own setting-out grid is what tells the
viewer the grid is BEHIND the building and not painted on the lens). **Second zero is the point** —
the opening frame states, in one look, that this is a real BIM model with real setting-out data.
So the later-second frames are a REGRESSION CHECK, never the subject. Do not re-open the lifetime,
do not propose ending it on envelope entry, and do not judge the labelling on a t=9 frame.

**24.10 ✅ THE ANNOTATION MOVED INTO THE MODEL — `feat/flythru-cues` @ `aea1f2a4` (2026-09-07).
This supersedes §24.1's mechanics, §24.3's layout pass and §24.7's scored edges.**
> USER: *"it is in 3D space, do not force it to be readable. Keep it static true to its 2D plane"* ·
> *"Optics will impress."*

**WHY IT WAS HARD, stated once so it is not re-derived.** Every label was a SCREEN-SPACE object —
11 px radii, 13 px fonts, pixel offsets — hung on a WORLD-SPACE anchor. The gridlines are
`THREE.LineSegments` in the model: drawn identically every frame, never re-decided, never flickering.
The labels had a fixed pixel size on an anchor that moves, rotates and rescales, so **every layout
decision had to be re-solved per frame** — and solving each frame independently is what produced the
popping (MEASURED across the streamed sequence: `zEnd` flipping `x@96.8 → x@-19.0 → x@96.8 → x@-19.0`
at 0/3/6/9 s, numerals changing edge between 0 and 3 s, `scale` 0.82 → 1.80, stride 2 → 1). **None of
that was the lines. All of it was the labels.** So the labels join the lines.

**THE PRIMITIVE.** A mark is placed by its plane: origin `O` and two in-plane unit directions, all in
model space. Projecting `O`, `O+U`, `O+V` gives the affine basis that maps model metres to screen
pixels; canvas draws through it. A circle becomes the correct ellipse; text foreshortens, skews and
rotates with the surface it is written on. **Nothing is corrected to face the viewer.**

**WHAT THIS DELETED** — all of it existed only to defend screen-space readability: the shared
occupancy register, the bubble ranks, every stride on the bubbles, the frame clamping, the
all-or-none gate, the edge SCORES, the two-column level stagger. **771 lines → 397.** What survives
is what the user ruled: near side for the ground axes, the level stack at the back, one ink, regular
weight, no boxes.

**THE PLOT SCALE IS DERIVED, AND THE TWO WRONG ANSWERS ARE RECORDED BECAUSE BOTH LOOKED PRINCIPLED.**
1. **A fraction of the measured bay** — `0.20 × B` gave a 1.31 m radius on a 6.54 m bay, a bubble
   **40 % of a bay wide**, with 8.8 m rungs that pushed the numerals off frame.
2. **A flat 1:100 read of the convention** — right in kind, but a few pixels across on a 102 m plan.
3. ✅ **What a draughtsman actually does:** pick the smallest STANDARD scale on which the plan still
   fits the sheet (A1's usable 800 mm), then every size is a fixed number of millimetres AT that
   scale — bubble 10 mm, text 3.5 mm (ISO 3098), first dimension line 10 mm off the outline with
   equal steps per chain. MEASURED, HHS: `planDiag 102 m → 1:200 → bubbleR 1.00 m, textH 0.70 m,
   rungs 2/4/6 m`. Self-adjusting to any building; **no tuned constant left in the layer.**

**MEASURED, HHS second zero, streamed, `delta=0.0m AGREE`:**
`drawn=40 · bubbles=20/20 · figures=17 · overalls=3/3 · figStride=1/1/1` ·
X 54.744 = 54.744 · Y 52.491 = 52.491 · Z 7.210 = 7.210 → CHAIN ADDS UP.
**Every ref on all three axes draws; nothing thinned, nothing dropped** — at 10 mm on the sheet a
bubble cannot reach its neighbour by construction.

**24.11 THE OPENING MUST BE THE BAKE'S OPENING (user: *"Opening has to be set at a distance where
whole building will be as the silent baked mp4. If that can happen, i see why not your snap can't do
same"*).** `§CINEMA_PIVOT` reads `A.camera.position` and `A.controls.target`, so **the framing the
page is left at is part of the plan.** The snapper now presses the viewer's OWN `Home` key
(`scene.js` `_homeResetAndFrame`) — ⚠ `_homeFillFrame` CANNOT be imitated from the DB, it centres on
`A.buildingCentres` which only streaming populates, and imitating it made the plan camera-dependent
and non-reproducible (THREE IDENTICAL RUNS, TWO DIFFERENT FRAMES). MEASURED, HHS second zero:
**14.7 m above base / 48 m out → 70.0 m / 98 m** on a 102 m plan, and the near-side rule then holds on
all three axes by itself. Default on for a streamed run; `--nohome` opts out.

⚠ **A RULING MUST BE A CONSTRAINT, NEVER A TERM IN A SCORE (user: *"I asked that they be in the
forefront, but u placed them in the back. This stumps me"*).** §23 implemented the near-side ruling as
an explicit test; §24 replaced it with `edgeScore()`, and a score is free to trade a ruling away — it
did, because "inside the frame" was weighted ×2 while the near edge's band runs TOWARD the camera and
therefore off the bottom of the frame. **Near side now decides the side outright** (smaller measured
camera distance), with a declared fallback to the far side only when the near one carries nothing —
as an absolute it made HHS second zero draw NOTHING at all.

⚠ **STILL OPEN.** Hospital's stored `cinema_path` total is **278.8 s** and every earlier timeline snap
passed `--dur 195.8`, which rescales the film — **those Hospital seconds are invalid.** Re-snap
against 278.8 before citing any Hospital second.

**24.12 ✅ PROVEN ON A THIRD, UNTUNED BUILDING — Terminal (2026-09-07, `443369ec`).**
Terminal (48,428 elements) exercises four paths HHS and Hospital never did: **no `cinema_path`**
(derived film), **158 columns** against Hospital's 604, **non-English storey names** (`Aras Tanah`,
`Aras 01` … `Aras Bumbung`), and a **federated storey table**. Same code, no per-building tuning.

| second zero, streamed, `delta=0.0m AGREE` | bubbles | figures | overalls | R X/Y/Z | chains |
|---|---|---|---|---|---|
| HHS | 20/20 | 17 | 3/3 | 1.00/1.00/1.00 | X 54.744 · Y 52.491 · Z 7.210 — all exact |
| Hospital | 37/37 | 34 | 3/3 | 0.99/0.99/0.99 | X 95.915 · Y 88.227 · Z 34.000 — all exact |
| Terminal | 37/37 | 23 | 3/3 | 1.21/1.21/**0.16** | X 54.508 · Y 39.481 · Z 46.110 — all exact |

**SIZING HAD TO BECOME PER AXIS.** Each axis is spaced by a different thing — the ground axes by
their bays, the upright by its storey heights — and a coarser building does not make its floors
further apart. MEASURED on Terminal: tightest storey gap **0.40 m** against a **2.42 m** bubble,
**560 % occupancy**, the level column drawn as one solid overlapping stack. Radius is now
`min(0.153 × medianBay, 0.40 × that axis's own minGap)`. ⚠ **Checked across all three buildings
BEFORE shipping** that the cap binds on exactly one axis (Terminal's Z) and leaves both accepted
buildings byte-identical — HHS re-ran at `1.00/1.00/1.00`, unchanged in every field.

**FOUR STABILITY DEFECTS, all general:**
1. **A single-value axis produced `NaN`** — `vals[1]` undefined → stride `NaN` → `j += NaN` exits on
   the first test, so the axis drew nothing AND said nothing. Guarded and reported.
2. **The figure stride measured the FIRST gap, not the smallest** — figures collide wherever an
   irregular grid tightens further along.
3. **The 6 m median-bay fallback was silent** — a building with no usable column grid would be drawn
   at a made-up module with nothing saying so.
4. **The pseudo-level filter was end-anchored** `/\s+(Ceiling|TOS)$/`: it stripped Hospital's
   `Level 2 Ceiling` and caught **0 of 5** of Terminal's `Ceiling Level 01`, where the word leads.
   Matching the word anywhere: **27 rules → 23**.
Also deleted the dead pixel ladder (`BUB_R 11`, `OFF1/2/B 32/80/120`, `MAX_FIG 4`) left behind by the
screen-space layer, which would have silently shadowed the real sizes.

**NEW WITNESS `§FLYTHRU_DATUM_LEVELSPLIT` — NAME THE FEDERATION FAULT, NEVER RESOLVE IT.** When one
storey NAME survives at two or more elevations the table carries two datums and no drawing can be
right. MEASURED on Terminal, **7 names**: `Aras 02` at 12.15 **and** 15.15, `Aras 03` at 16.15 and
19.15, `Aras 04` at 20.15 and 23.15 — a constant **3.00 m** — plus `00 Aras Asas` and
`08 UPPER DOME LEVEL` about **15 m** apart. **That is why a 6-storey terminal yields 23 level rules.**
Choosing between the datums would be invention, so the levels are drawn as recorded and the condition
is reported by name.

⚠ **`§FLYTHRU_DATUM_MARKS` now reports `ofNominal` per axis** (Terminal: `100%/100%/13%`). A bubble
capped far below nominal still counted as "drawn" while being invisible — the vacuous witness §4
forbids. A small ratio points upstream, at refs packed tighter than the grid they belong to.

⛔ **OPEN, for the user — Terminal's upright is drawn but unreadable.** Its 23 Z refs sit at 0.16 m,
13 % of nominal: present in the count, invisible on screen. Two honest paths, differing in what they
claim: **(a)** draw the upright as recorded — every rule shown, refs unreadable, the drawing faithful
to the data including its fault; **(b)** WITHDRAW the upright whenever `LEVELSPLIT` fires — state
that the storey table carries two datums so no level datum can be drawn, and show the ground axes
only. (b) is the recommendation, since an invisible ref is precisely the silent failure this lane
keeps repeating, but it costs Terminal its level annotation entirely — so it waits for the user.

### 25. 🏁 §MEASURE MILESTONE — the datum is a shipped feature, not a lane experiment (2026-09-08)
> **USER:** *"This will be the first Measure milestone for any building. Put that Measure checkbox in
> Alt-C panel too for user to trigger such overlay besides the Clash."* · *"Good to wrap up the
> prompts/#."*

**⚠ READ THIS FIRST, IT INVALIDATES AN ASSUMPTION THE WHOLE LANE RAN ON.** Until `bad6a319`,
`cinema_maxq.js` referenced `flythruDatumBuild` / `flythruDatumAt` /
`flythruDatumCompositeOntoCanvas` **nowhere**. The datum existed only inside
`scripts/snap_timeline.js` — **no Alt-C film has ever carried it**, and every frame judged in §23/§24
came from the snapper, not from a bake. Three call sites now exist (build once from the DB; per-frame
`flythruDatumAt` so the 3D rules fade and depth-test; composite in `_captureFrame` beside the cues),
each on the same never-kills-a-bake try/catch contract as its neighbours, all gated by **Measure**.
⚠ `_captureFrame` is its OWN function, not a closure over the bake body — which is why the adjacent
`_fcFilmSec` is read off `window.APP`. Declaring the flag as a bake-body local **compiles clean and
throws at run time**; it crosses via `A._flythruDatumOn` / `A._flythruFilmSecFull`.
⚠ `sw.js` `CACHE_VERSION` v1161 → **v1162** in the same commit — `viewer.html` loads
`cpe_flythru_datum.js` at a fixed `?v=1`, so without the bump a returning user's worker serves the old
copy and the checkbox does nothing.

**25.1 THE FINAL SHAPE, and the one sentence each rule reduces to.**
| | the rule | why it is not a tuned constant |
|---|---|---|
| where the ink lives | **in the model's own planes** | a mark placed by origin + two in-plane directions; the projected basis drives the canvas. Circles become the right ellipses, text foreshortens. Nothing faces the viewer. |
| size | **`0.153 × medianBay`**, capped at **`0.40 ×` that axis's own smallest gap** | the ratio is read back off the frame the user accepted; the cap guarantees diameter ≤ 0.8 of the gap |
| which edge | **near side decides outright**, far side only as a declared fallback | a stated requirement is a CONSTRAINT, never a term in a score (§24.11) |
| the upright | hangs off the **back** corner, on whichever vertical face is **most face-on** | measured per frame by a dot product, so it follows the dive |
| level density | **a level closer than the bubble this drawing uses is not a storey differentiator** | threshold is `2R` + a quarter for air — the drawing's own bubble |
| figures | **stay in the model, small at distance** | *"They maybe small but at least in real 3Dspace we can make it out legibly at some point in the dive in."* A figure small at 98 m is FAR, not unreadable. |

**25.2 THE THREE-BUILDING RECORD — same code, no per-building handling.**
| second zero, `delta=0.0m AGREE` | bubbles | figures | overalls | model R X/Y/Z | chains |
|---|---|---|---|---|---|
| HHS | 20/20 | 17 | 3/3 | 1.001 IDENTICAL | 54.744 · 52.491 · 7.210 exact |
| Hospital | 37/37 | 34 | 3/3 | 0.99 IDENTICAL | 95.915 · 88.227 · 34.000 exact |
| Terminal | 25/25 | 17 | 3/3 | 1.212 IDENTICAL | 54.508 · 39.481 · 46.110 exact |

**25.3 CONSISTENCY IS ASSERTED, NOT EYEBALLED** (user: *"Consistent has to be on paper ie in the maths
not relying merely on visual to judge"*). `§FLYTHRU_DATUM_CONSISTENCY` prints the model radii AND the
projected semi-axes, because they are two different claims: same size in the DRAWING, different size
on SCREEN. MEASURED, Terminal: `1.212/1.212/1.212m → IDENTICAL | px X 5.0x6.8, Y 8.4x9.6, Z 3.4x3.9`.
⚠ **A retraction this witness forced:** the Z bubbles were called edge-on from looking at the frame.
They are not — aspect 0.87, nowhere near flat. They read smaller because that stack is **further from
the camera**. The face-picking code is right in principle and was not the cause.

**25.4 WHAT THE DRAWING FOUND IN THE MODELS — the part a BIM audience leans in at.**
- Hospital printed **`Level 7` twice**, at 31 m and 34 m, and **3 of 8** elevations took the single
  outlier of their cluster (`+10.973` over six rows at 11.000). Fixed by a modal vote.
- Terminal carries **two datums in one storey table**: `Aras 02/03/04` each duplicated a constant
  **3.00 m** apart, `00 Aras Asas` and `08 UPPER DOME` ~15 m apart. `§FLYTHRU_DATUM_LEVELSPLIT` names
  it; **resolving it would be invention**, so the drawing states the fault instead.

**25.5 ⛔ OPEN FOR THE NEXT SESSION.**
1. **The datum has never been seen in an actual bake.** Every frame in §23–§25 is a snapper frame.
   The first Alt-C run with Measure ticked is the real test.
2. **Second zero reads as capability, not as a deliverable** — the figures are barely legible at ~100 m
   and the layer lasts ~18 s. The dive is where it should land; that sequence is unexamined.
3. **§22.3 still outranks the shot list**: every cue states a FINISHED figure over a half-built model.
4. The abstraction list (§22.2) still stands at 2 of 8 shots.

### 26. §SLAB_BEAT — mark the floor plate AS IT IS LAID. NEXT SPECS, BEFORE INDOORS (user, 2026-09-08)
> *"In Hospital a 3rd level or above slab is one that stays in the movie longer to mark out as a wing
> slab and thus show a tint and an X marking out both diagonals with the middle a label box 'X by Y =
> Area (estimate for [Ifc semantic name])'. … This is for the user to note that this BIM picks out
> arbitrarily rather accurately without AI in the loop."* ·
> *"have a priority to just do 2 at max during fly in and pick the longest visual potential. Without
> such guards, we gonna have a mess to handle."* · *"Put in as 'next specs before indoors'."*

⚠ **NUMBERING.** §25 was taken by the Measure-milestone session while this was being measured. This is
§26 and it is the NEXT work item after §25, before any indoor/hallway beat.

**26.0 WHY THIS BEAT AND NOT ANOTHER — it closes two of §25.5's four open items.**
§25.5.3 records the lane's highest-merit defect: *every cue states a FINISHED figure over a half-built
model*. A plate marked **at the instant it is laid** states the building at the time shown, so the
defect does not arise. §25.5.2 records that the datum reads as capability rather than deliverable and
that *"the dive is where it should land; that sequence is unexamined."* This beat is that sequence.

**26.1 THE USER'S TWO CRITERIA, and both are met before any code draws.**
1. **The IFC semantic must make sense.** `elements_meta.element_name` carries a Revit type string
   `Family:Type:id`; dropping the family and the element id leaves the construction:
   `Concrete-150 mm slab on 300mm base` · `150mm Concrete With 75mm Metal Deck` · `STB 30.0` ·
   `150mm Slab on Grade`. Extracted, never composed. A typo in the source (Terminal's `Procelain`) is
   printed as recorded.
2. **It must be caught as ONE coherent area.** Hospital's floors are **one element each** — 35 planar
   `IfcSlab` over 10 storeys, the Level 1 plate a single 98.57 × 90.29 m element. Not tiles.

**26.2 THE MARK — three layers, and the occlusion split is the whole point.**
| layer | states | depth |
|---|---|---|
| **amber tint on the plate's own mesh** | WHAT and WHERE | **depth-tested** — the construction laid on top progressively buries it |
| **X across both diagonals of the measured box** | WHAT WAS MEASURED | depth-tested, with the tint |
| **label box at the diagonal crossing** | HOW BIG | **`depthTest:false`, `renderOrder ≥ 900`** — shines through and stays readable |

This is §FLYTHRU_MESH_TINT's existing two-layer rule, not a new mechanism: tint = what/where, dimension
= how big. **Nothing moves outside the plate.** The label keeps its association with the crossing, and
the tint being buried by the very construction the film is showing is the same proof second zero makes
with the datum (§17.5) — better here, because the thing occluding it is the subject.
**Envelope 2.0 s** — 0.6 s fade in / 1.0 s hold (the value lands) / 0.6 s out. MEASURED: every slab in
every cached run has `play.s === play.e` to 2 dp, so a plate **pops**; there is no laying animation to
track and the envelope fires on the pop.
**Label lifetime** (user, 2026-09-08): the shine-through label persists until the next beat's label
claims the slot or it leaves frame. The `> 2 s` hold is therefore both the selection rule and the
label's minimum life, which is why intermediate floors drop out without a separate thinning pass.

**26.3 THE LABEL, filled with real data.** `100.83 × 91.16 m = 9,192 m² (est.) — 150mm Concrete With
75mm Metal Deck`.
⚠ **"(est.)" is REQUIRED and it is what makes the X honest.** 9,192 m² is the **bbox product**; the
plate is not rectangular (Level 3's storey walkable is 6,097 m²), so it is an upper bound. §3.3 rules
that a bbox area is a generalisation failure when stated bare — **drawing the two diagonals of the box
that produced the number is what discharges that**, because the viewer sees the rectangle measured.
The diagonals are not decoration; they are the honesty device, and they cross where the label goes.

**26.4 THE SUBROUTINE — `scripts/poc_slab_beat.js`, built and run 2026-09-08, log `out/slab_beat_poc.log`.**
Selection only. It draws nothing, needs **no GPU, no browser and no scene** — DB extents + the
persisted 4D run (`~/.cache/bim4d/<bld>/*/run.json`, PRIMAL LAW §5) + the stored `cinema_path`.
Seven stages, each with the measurement that forced it:
1. **Candidates** — `IfcSlab`/`IfcSlabStandardCase` from `elements_meta ⋈ element_transforms`, kept
   when `bbox_z < 0.5 × min(bbox_x, bbox_y)` (planar relative to its OWN footprint, so no thickness
   constant). Hospital 35, HHS 81, Terminal 469, Clinic 16.
2. **Semantic name** — §26.1.
3. **Film second** — `play.s` normalised over the run's own span. ⚠ **Declared linear and printed as an
   assumption.** Corroborated once: the user read the Hospital plate at ~9 s watching
   `Hospital_FULL_allsystems_2026-09-06.mp4`; the map computes **10.31 s**.
4. **Pool** — a plate is a candidate at **≥ 25 % of that building's largest plate**. Relative, so it
   scales from Clinic's 2,939 m² to Hospital's 9,192 m².
5. **Co-arrival collapse — and the ONE test that decides it is PLAN OVERLAP, not area.**
   ⚠ **MEASURED, and the first version got this wrong: with an area-only test HHS rejected every
   candidate and the beat drew nothing on that building.** HHS lays `STB 30.0` (structural) and
   `FB 15.0 - Fliesen 50 x 50` (tile finish) **0.09 s apart on the same 65.84 × 53.44 m plan** — that
   is one floor in two layers, invisible as a conflict. Hospital's Level 3 is the opposite: **25 grass
   and paver roofs land within 0.06 s at DIFFERENT places**, which genuinely fragments the frame.
   So: a co-arrival overlapping the host by **≥ 50 % of the smaller footprint** is a STACKED LAYER
   (merged, reported); one below that which is **≥ 10 % of the host's area** is a FRAGMENTING
   co-arrival and rejects the event. Within a cluster the **LARGEST plate takes the event, never the
   last** — by arrival order HHS would have picked the tile finish over the structural plate by 0.09 s,
   which is the wrong noun for criterion 1.
6. **Hold** — seconds to the next event. `< 2.0 s` rejects (user's rule).
7. **The guard, and what it actually takes.** The user's *"2 at max during fly in"* is a **CEILING**;
   the number taken is **ONE** (user, 2026-09-08: *"If the 9th second is the first beat, then nothing
   else needs to follow as the cutoff sequences are too short."*). **§1 is what decides it, not
   pacing** — a second floor plate is the same capability said twice, which is an inventory. The
   remaining Hospital holds are 4.69 / 4.10 / 3.71 / 2.47 s, and a mark repeated 3.6 s later reads as
   a list, not as a capability. So: **longest hold inside the dive wins, one beat per film**; everything
   else qualifies and is reported as not taken. The dive window is read
   from the stored path: Hospital `dive_sec = 18.286`, which is `0.094 × 195.8` — i.e. **bake seconds
   of the 195.8 s film** (4,699 frames @ 24 fps, `§MAXQ_START`), not the path's own `total_sec 278.78`.
   Buildings with no stored path fall back to the `0.094` beat fraction and say so.

**26.5 MEASURED — all four buildings, same code, no per-building handling. ONE beat each.**
| | the beat taken | hold | qualified but not taken |
|---|---|---|---|
| **Hospital** | **10.31 s · Level 1 · 8,899 m² · `Concrete-150 mm slab on 300mm base`** | **5.59 s** | 15.91 s L2 (dive) + L3/L4/L5/L6 after it |
| HHS | 8.33 s · Level 2 · 3,529 m² · `STB 30.0` (+1 stacked: `FB 15.0 - Fliesen 50 x 50`) | **61.80 s** | 0.22 s L1 (dive) + 2 after it |
| Terminal | 17.03 s · `Aras 02` · 1,149 m² · `A_Floor_CementRender_V1` | 11.45 s | 13.15 s `Aras 01` + 1 after it |
| Clinic | 5.10 s · First Floor · 2,939 m² · `150mm Slab on Grade` | 18.29 s | 3 after the dive |

⚠ **Longest-hold-first is what makes the single pick the right one, and it is not the earliest.**
HHS's earliest candidate is at **0.22 s** — frame one, colliding with the datum's own opening — while
the pick at 8.33 s holds **61.80 s** and lands just after HHS's datum clears at ~8 s. Terminal likewise
moves from 13.15 s to 17.03 s. **Only Hospital's pick is also its earliest**, which is why the 9th
second reads as obviously right there and would not have on the others.

⇒ **THE 9TH-SECOND PLATE IS CAUGHT, AND IT IS THE PRIZE.** Hospital's Level 1 plate at **10.31 s**
takes the film's ONE beat on the longest hold inside the dive (**5.59 s**), landing on the
quietest frame in the film: seconds 0–10 run **42–97 elements/s, all Level 1**, and **second 11 is the
inflection — 97 → 288 elements/s, and it never drops back.** The 2 s envelope therefore runs
10.31 → 12.31 s: ~0.7 s of clear frame, then the viewer watches the plate begin to be buried while the
number still reads. That is the demonstration, not a compromise.
⚠ **NOTHING BEFORE IT, AND THAT IS MEASURED TOO.** Hospital's only earlier slab is the substructure
plate at **6.52 s, 332 m²** — 3.6 % of the largest, below the 25 % pool floor. At second 4 there is no
slab event at all; seconds 0–10 are Level 1 walls and foundations at 42–97 elements/s. So the beat has
a clean run-up and the film's first measurement of a built thing is the plate itself.
**The 2-beat ceiling is never reached** — the dive holds two qualifying plates on Hospital, HHS and
Terminal and one on Clinic, and §1 takes one. A guard the data does not reach is a guard in the right
place; keep it, because a building with a fragmented schedule could still produce a crowd.

**26.5a A BROADER NET WAS CONSIDERED AND DROPPED — recorded so it is not re-derived.** The idea of
tinting *any* floor area at an arbitrary early second (rather than a named plate) was measured and
retired by the user the same day (*"forget that, as the last HUD does address total storey"*). The
measurement supports it: Hospital's first ten seconds are **footings only** — 168 at t=2, **335 at
t=4** — giving a scattered pad footprint of 118 m² / **227 m²** and **zero planar floor area**. The
first real footprint, 6,220 m², arrives at t=6 with the first walls. There is nothing to tint at
second 4, and the storey total is already carried by the HUD. The beat stays a NAMED PLATE.

**26.6 ⛔ OPEN — what the next session must do, in order.**
1. **THE FRUSTUM TEST IS NOT DONE.** The PoC reports a BOUND from the stored path's 4 waypoints
   (Hospital Level 1: **in front of 1 of 4**, subtending up to **156°** when it is), and prints
   `INCONCLUSIVE` for the three buildings with no stored path. **A waypoint is not a camera pose.**
   The real test is `plan.poseAt` in the viewer — §16's method, `probe_flythru_place.js`. Run it before
   anything is drawn; a plate behind the camera at its own second is the one way this beat fails.
2. **Terminal's semantics are weak and must be reported, not hidden.** Its picks are
   `A_Floor_CementRender_V1` — a render, not a structural plate — because Terminal models floor
   FINISHES as slabs (469 planar, largest 1,245 m²). Criterion 1 is not met there. Report the ratio
   (plate area ÷ that storey's raster area) and let the beat withdraw when the pick is not a floor
   plate, the same shape as §24.12's `LEVELSPLIT` and `ofNominal` rulings. Do not mark a finish patch
   and call it a floor.
3. **The linear day→second map is an assumption with one corroboration.** Verify against the bake's own
   day cursor before citing a second as fact.
4. **Then, and only then, the hallway** (user: *"After this we probably reuse such for a hallway"*).
   §16 already placed a corridor cue at 13.05–15.25 s (`15.50 m long · 1.43 m wide`), so the slot
   exists. The X degrades gracefully on a sliver — it is still the box's true diagonals — but a centre
   label box has nowhere to sit on a 1.43 m width. That is the one thing to solve there, not here.

**26.7 WITNESS — `witness_slab_beat.js`, and it must be able to fail** (PRIMAL LAW §4).
`VACUOUS` when a building has no planar `IfcSlab`; `INCONCLUSIVE` when no camera pose was available to
judge framing; `NOTHING drawn=0` stated out loud when no plate qualifies inside the dive (Clinic
already exercises the 1-of-2 path). Asserts: the label's `X × Y` equals the drawn box's own extents;
the diagonals terminate on that box's corners; `dive beats ≤ 2`; every picked plate's hold `≥ 2.0 s`;
the tint material is depth-tested and the label's is not; and the semantic name is byte-identical to
the substring extracted from `element_name` — never composed.

### 27. §LINEAR_BEAT — a beam and a column, measured as they go up (user, 2026-09-08)
> *"While beams and columns are going up, can we catch any and show their length with arrow line
> cues?"* · *"We work it out for only HHS and Hospital as both has silent.dbs. So specs it along this
> dive in stretch to catch also a good beam and column without overlapping with good label boxes
> [IFCtype semantic, measure mm with arrow line cues]."* · *"But we are after beam/col only."*

**SCOPE: the beam and the column. The floor plate is §26 and is not re-opened here** — it appears
below only as an OCCUPIED SLOT the linear cues must not overlap. Buildings: **Hospital and HHS only**,
the two carrying a stored `cinema_path` in a `*_silent*.db`, so the dive window is READ, never assumed.
**PoC: `scripts/poc_dive_beats.js`, log `out/dive_beats_poc.log`.** Selection only — no GPU, no
browser, no scene: DB extents + the persisted 4D run + the stored path.

**27.1 THE CUE.** A single dimension along the element's own axis — Primitive A with the
`element:self` stop (§3.1), so **zero raycasts and one DB read**. Graphic is §7's existing standard
cue: extension lines, **inward arrow heads**, value in **mm**. Label carries the **IFC type semantic
and the measure**, one line. Column → vertical, so the word is *height*; beam → horizontal, *length*
(§8's rule: the word describes what is DRAWN).

**27.2 MEASURED — Hospital, and it fits comfortably.**
`dive_sec = 18.29` ÷ a 2.5 s slot (§14: 2.0 s envelope + 0.5 s clear) = **7 non-overlapping slots**;
three are used and four stay empty.
| allocated | cue | value | IFC semantic |
|---|---|---|---|
| **6.95 – 8.95 s** | **column** | **26,020 mm** | `475 x 610mm` |
| 10.31 – 12.31 s | *(floor plate — §26, not this section)* | 8,899 m² | `Concrete-150 mm slab on 300mm base` |
| **12.89 – 14.89 s** | **beam** | **15,700 mm** | `457x152x52UB` |

Population: **1,970 beams** (1,967 horizontal, 582 inside the dive, modal type **9,700 mm ×309**) and
**604 columns** (571 vertical, 427 inside the dive, modal type 4,800 mm ×151). Availability is never
the constraint; the slot budget is.

**27.3 ⚠ THE TRICKY PARTS. This is the section to read — the arithmetic is trivial and every one of
these was found by measuring, not by reasoning.**

**a. THE ORDER IS COLUMN → PLATE → BEAM, not plate first.** The best column stands at **6.95 s**,
before §26's plate at 10.31 s. Intuition puts the floor first; the schedule does not.

**b. PLACEMENT CHANGES THE SUBJECT, so the label must be regenerated after allocation, never cached
from the ranking pass.** The best beam in the dive is **18,972 mm `610x229x125UB` at 11.65 s** — which
lands INSIDE the plate's 10.31–12.31 s envelope. Moving to the next free slot does not move that beam;
it selects a **different** one: **15,700 mm `457x152x52UB` at 12.89 s**. A cue whose value was computed
before its slot was known would print 18,972 mm over a 15,700 mm beam.

**c. THE DATUM-RESTATEMENT GUARD BITES HARD, AND IT MUST.** A column's height IS a storey height, and
the datum (§24.7) already draws the storey chain and the overall. MEASURED on Hospital: the datum's own
figures are `6.11 · 5.00 · 4.87 · 5.00 · 5.00 · 5.00 · 3.00 · 34.15 m`, and **181 of 427 in-dive
columns fall within 2 % of one of them** — including the 34,020 mm full-stack column, which restates
the 34.15 m overall to 0.4 %. Worse, the **modal** column type (4,800 mm ×151) is within 2 % of the
4.87 m storey height: **the commonest column in the building is precisely the one that says nothing
new.** Reject on this test and the surviving best is 26,020 mm, which no datum figure states.
⚠ This is why §1 is satisfied by a beam and a column but would NOT be by two columns.

**d. DO NOT RE-DERIVE THE PLATE'S SLOT.** The first allocator picked Level 2 (8,963 m²) over §26's
Level 1 (8,899 m²) because it ranked by area where §26 ranks by hold — a 74 m² difference silently
overriding a settled rule. **Call §26, do not re-solve it** (CLAUDE.md §0, the ownership table).

**e. THE SEMANTIC QUALITY IS UNEVEN AND ONLY THE BEAM IS RELIABLY GOOD.** Beams carry real section
designations — `610x229x125UB`, `457x152x52UB`, `C310X30.8`, `HSS152.4X152.4X7.9`. Columns carry
`475 x 610mm`, which is a **cross-section restated as a name** and sits oddly beside a length cue;
HHS's carry `STB d=30:STB d=30`, a duplicated token. **§15 governs**: a confident class name if one
exists, otherwise the measure alone. Never compose a noun to fill the gap, and never let the label
repeat the number the cue already draws.

**f. THE CLOCK IS PER BUILDING AND ONLY HOSPITAL'S IS VERIFIED.** Hospital's `dive_sec 18.29` is
exactly `0.094 × 195.8`, matching both `§CINEMA_BEATS dive=0.094` and the measured bake (4,699 frames
@ 24 fps), so it is in BAKE seconds. **HHS's `dive_sec 1.85` against `total_sec 61.04` is 0.030, which
matches no beat fraction** — so HHS's film clock is UNVERIFIED and every HHS second must be labelled
so until a bake measures it. Do not assume one film's clock for another.

**g. HHS CANNOT HOLD A CUE IN ITS DIVE AS THE PATH STANDS — and that is a PATH property, not the
building's** (user, 2026-09-08: *"HHS does has room once injected"*). `dive 1.85 s < one 2.5 s slot` →
`§DIVE_BEATS_NOFIT`, nothing squeezed. Its 80 in-dive columns are real and waiting; **once a longer
path is injected for HHS the budget opens and the same code allocates.** Do not read the NOFIT as a
defect in the selection, and do not shrink the slot to make it fit.

**h. HHS HAS ZERO `IfcBeam`, AND THAT SURVIVES ANY PATH CHANGE.** `§DIVE_BEATS_IfcBeam VACUOUS`. So
HHS yields a column cue and never a beam cue, however long its dive becomes. State it; do not
substitute `IfcMember` (7,127 of them, median 1,658 mm — mullions and framing, which §3.6 already
rules out).

**i. THE DEEPEST ONE — APPEARANCE IS NOT VISIBILITY, and it is unsolved here.** §26's plate is a
98.57 × 90.29 m single element that fills the frame; a beam is **one stick among 582 arriving in the
same window**, and a 9.7 m member on a 116 m building seen from ~100 m is a few pixels. §24.12's
`ofNominal` lesson applies exactly: something counted as drawn while being invisible is the silent
failure this lane keeps repeating. **The PoC ranks by TRUE length because it has no camera** — it
reports a 4-waypoint bound and nothing more. A projected-length floor and the in-frame test are
`plan.poseAt` in the viewer (§16, `probe_flythru_place.js`), and they must run before anything draws.
This is the one open item that can invalidate the allocation above.

**27.4 WITNESS — `witness_linear_beat.js`, able to fail** (PRIMAL LAW §4). `VACUOUS` when the class is
absent (HHS beams already exercise it); `§DIVE_BEATS_NOFIT` when the dive cannot hold a slot (HHS
already exercises it); `INCONCLUSIVE` when no camera pose was available to judge framing. Asserts: no
two allocated envelopes overlap; the drawn value equals the placed instance's own extent (defect **b**);
no column within 2 % of a datum figure is drawn (defect **c**); the plate's slot came from §26 and was
not recomputed (defect **d**); the label never repeats the cue's own number (defect **e**); and each
building's clock is reported with its verification state (defect **f**).

### 28. ✅ DONE 2026-09-08 — A 3-SECOND TEST BAKE, CLASH **AND** MEASURE ON (user, 2026-09-08). Result in §28.2
> **USER:** *"note that a test bake for first 3 secs be done for Hospital and HHS with full Clash and
> Measure ON. The other session has updated for next stretch as ensuing task thereafter."*

**This runs BEFORE §26 and §27.** Both of those design on top of a Measure layer that **has never
executed inside a bake** — see §25's opening warning. Until the bake is observed, every number in
§23–§25 is a *snapper* number, and §26/§27 would be built on an unverified floor.

**WHAT TO RUN.** A real Alt-C bake, first **3 seconds only**, on **Hospital** and **HHS**, with both
`Clash pairs` and `Measure` ticked in the panel. The Measure checkbox and its three bake call sites
shipped in `bad6a319`; `sw.js` is at **v1162** — ⚠ if the tab has been open since before that, reload
first or the worker serves the old `cpe_flythru_datum.js` and Measure silently does nothing.

**WHAT IT MUST PROVE — the bake is a different consumer from the snapper, and only these lines can
tell them apart.**
1. `§FLYTHRU_DATUM_BUILT` appears at all — the build call is reached from `cinema_maxq.js`, not just
   from `scripts/snap_timeline.js`.
2. `§FLYTHRU_DATUM_MARKS drawn=N` on the baked frames, with `N` and the chain matching the recorded
   second-zero run for that building (HHS `drawn=40`, Hospital `drawn=74`; chains X 54.744 / 95.915,
   Y 52.491 / 88.227, Z 7.210 / 34.000, all `CHAIN ADDS UP`). **A different N means the bake's camera
   or its buildup is not the snapper's**, which is the single assumption this whole lane rests on.
3. `§FLYTHRU_DATUM_CONSISTENCY … IDENTICAL` — one radius across all three axes.
4. **No `§FLYTHRU_DATUM_DRAW failed` / `§FLYTHRU_DATUM_AT failed`.** ⚠ Both are wrapped in the
   never-kills-a-bake try/catch, so a scope error would let the film finish with the datum simply
   ABSENT and only a `console.warn` to show for it. **TWO runtime scope errors have already slipped
   past `node --check` in this file** (`R_BUB`/`TXT`, then `R_FIT`); this is exactly how a third
   would hide.
5. Clash and Measure both present in the same frame without fighting for the canvas — they are
   separate compositors and have never been composited together (§25.5 item 1).

**AND THE ONE THING A STILL CANNOT ANSWER:** 3 seconds is ~45 frames, so it is the first chance to
see the datum **move** — whether the marks hold steady as the camera descends, or whether anything
still re-decides per frame. §24.10 named per-frame re-deciding as the whole reason three axes were
hard to label; the in-plane rewrite should have ended it, but that has only ever been checked on
single stills. **Watch for popping between consecutive frames**, not just for a good frame.

⇒ **Order of work next session: (1) this bake, (2) then §26 `§SLAB_BEAT`, (3) then §27
`§LINEAR_BEAT`.** If the bake contradicts the recorded numbers, stop and fix that first — §26 and
§27 both allocate slots inside a dive whose Measure layer must already be trustworthy.

**28.1 SPEC — the CLI could not switch Measure on (found 2026-09-08, before the bake).** Two gaps, both
on `feat/flythru-cues`, neither visible from the panel: (a) `cli_silent_bake.js` composed
`--clash`/`--storey-reveal` tri-states into `FLAGS` but had no `--measure`/`--no-measure`; (b)
`cinema_maxq.js`'s flag whitelist (`['buildup','roomTitle','reveal','dayCounter','clash','storeyReveal']`,
the line that merges CLI flags into the override) did not carry `measure`, so even a passed flag would
have been dropped and the bake would run silently without the datum — exactly the failure mode §28.4
warns of. Fix: `--measure`/`--no-measure` tri-state mirroring `--clash`, and `'measure'` added to the
whitelist. The panel path (`_ov.measure` from the saved state) is unchanged. Bake command shape:
`node cli_silent_bake.js --db <silent-db> --clash --measure --gpu real --clip 0:<3s/filmSec> --fps 24
--width 1280 --height 720 --out out/<bld>_3s_cm.mp4 --log out/<bld>_3s_cm.log`. The CLI's fresh
`--profile` makes the sw.js v1162 caveat moot for this run (no worker, no stale copy). Results → §28.2.

**28.2 ✅ RESULT — both bakes ran, real GPU, 2026-09-08 (worktree `/tmp/wt-storey-reveal` @ `49892d0a`
+ §28.1). Logs `out/Hospital_3s_cm.log`, `out/HHS_3s_cm.log`; films `out/*_3s_cm.mp4` (1.66 / 1.95 MB).**
> **USER, mid-run:** *"This test 3s is to confirm the 2D layouts appear. That is all. No need for frame
> adjustment."* — so the camera findings below are RECORDED, not acted on.

| | Hospital | HHS |
|---|---|---|
| clip → frames | `0:0.01532` → **72 f = 3.000 s** @24 of 195.8 s (4,699 f) | `0:0.04915` → **85 f = 3.54 s** @24 of **72.3 s** (1,736 f) |
| `§FLYTHRU_DATUM_BUILT` (from `cinema_maxq.js`) | columns=604 grid=15×14 medianBay=6.48 storeyRules=8 | columns=257 grid=9×8 medianBay=6.54 storeyRules=3 |
| `§FLYTHRU_DATUM_CHAIN` | X 95.915 · Y 88.227 · Z 34.000, delta 0.0000, ADDS UP | X 54.744 · Y 52.491 · Z 7.210, delta 0.0000, ADDS UP |
| `§FLYTHRU_DATUM_MARKS` | **drawn=74 on 72/72 frames** (= the snapper's 74) | drawn=37 @ f0, falling to 8 @ 3.33 s, **23 @ 3.37 s**; >0 on 85/85 |
| `§FLYTHRU_DATUM_CONSISTENCY` | 0.737/0.737/0.737 m IDENTICAL ×72 | 0.524/0.524/0.524 m IDENTICAL ×85 |
| `_DRAW failed` / `_AT failed` / `_BUILD failed` | **0** | **0** |
| Clash in the same frame | `§CLASH_FILM_BUILD trueClash=270 markers=540`; `§CLASH_LABELS labelled=1` at f0/10/20/30 | `trueClash=233 markers=466`; `labelled=3` @ f0, `2` @ f80 |
| frame-to-frame (projected semi-axes) | max step **0.2 px** over 72 frames — no popping | steps up to 10⁵ px — plane through the camera |
| frame-0 camera vs the snapper's recorded one | **(85.5, 70.0, 58.9) = (85.5, 70, 58.9)** — like-for-like | (41.4, 8.7, −27.7) vs (48, 64, 48) — DIFFERENT |
| wall | 51 s | 50 s |

**Verdict against §28's five items.** 1, 3, 4, 5 PASS on both buildings. **2 PASSES on Hospital** and
the agreement is a camera agreement, not luck: the bake's frame-0 pose is byte-equal to the snapper's.
**2 FAILS on HHS for the reason §28 predicted — the bake's camera is not the snapper's.** The snapper
plans from the viewer's Home frame (`--home` is default-on, `snap_timeline.js`: *"70.0 m above base and
98 m out"*), whereas the bake flies the STORED `cinema_path` — HHS's is a 49.8 m-radius, 8.7 m-high
path whose camera **crosses ground level at frame 75 (3.1 s) and ends at −1.09 m**, so the 8→23 pop at
3.37 s happens with the camera underground. That is §27g's path property (*"once a longer path is
injected for HHS"*), not a Measure-layer defect; the layer itself built, chained, stayed IDENTICAL and
never threw on HHS. The §25.2 radii (0.99 / 1.001) predate `49892d0a`'s one-radius rule; 0.737 / 0.524
are that rule's output and are not a regression.

**Two measurements §27 must re-read before it allocates HHS slots** (it is the next-but-one task):
- **HHS's film clock is now MEASURED: 72.3 s** (`§CPE_APPLIED total=72.3s frames=1736` @24), not the
  path's `total_sec 61.04`. §27f's UNVERIFIED label is lifted.
- **HHS's dive in bake seconds is `0.054 × 72.3 = 3.90 s`** (`§CINEMA_BEATS dive=0.054`), not §27g's
  `1.85 s` (that was the path's own `dive_sec`, a different clock). 3.90 s holds ONE 2.5 s slot, so
  §27g's `§DIVE_BEATS_NOFIT` is a stale verdict — but the camera under that dive is the underground one
  above, so a slot that fits in time may still have nothing legible in frame. Hospital's clock is
  unchanged: `0.094 × 195.8 = 18.4 s`.

### 29. §INDOOR_BEATS — the hall, the stair, the opening, the clear height (user, 2026-09-08)
> *"Once indoors i reckoned we pursue the hall area which most bakes will land first also due to its
> default path."* · *"So it label 'Hall-Corridor, Walkable area: #m²'. The tint remains until frame
> out. Remove tint. On the return flight during Reveal, it would have faded off."* · *"It wont take
> 75s as the movie leaves the floor at the end of the run probably 10s the most. Along the way we can
> catch the stairs as the next prize. This is only for buildings with stairs. Otherwise catch a door
> or window gives its XY and area dims. A tallest point height in middle of hallway will be also a
> killer."*

**Runs AFTER §26 and §27.** Buildings: **Hospital and HHS**, both carrying a stored `cinema_path` in a
`*_silent*.db`. **PoC: `scripts/poc_indoor_beats.js`, log `out/indoor_beats_poc.log`** — selection
only, no GPU, no browser, no ray.

**29.1 THE BUDGET IS EXACTLY FOUR SLOTS, AND THERE ARE EXACTLY FOUR CAPABILITIES.** The indoor run is
**~10 s**, not the walk's 75 s — the film leaves the floor at the end of the run. At §14's 2.5 s slot
(2.0 s envelope + 0.5 s clear) that is **4 non-overlapping slots**: hall area · stair going · opening
type · clear height. §1 is satisfied because no two repeat each other. **There is no room for a fifth**
— a useful ceiling to know before the list grows.

**29.2 THE HALL — `Hall-Corridor, Walkable area: N m²`.**
Source is the **`storey_walkable_raster` table, and it is already in the bake's own DB** — MEASURED:
`Hospital_silent_local.db` carries **7 storeys** and `HHS_Office_Federated_silent.db` **4**, all at
**res 0.25 m** with origin + packed bitset (Hospital Level 1 is 403 × 372 cells). Mesh-derived, and it
appears nowhere in the IFC — that is the capability claim. No new extraction.
- **m², never m³.** A walkable VOLUME is not honestly derivable: §3.6 already ruled the per-storey
  height column out (contaminated by risers and facade spanning storeys — Hospital's Level 1 reads
  43.9 m). A volume would need a ceiling chord per cell. Say area, and mean it.
- **Do NOT source it from the compiled rooms.** §11 measured them: Hospital's largest is 23.25 m² but
  spans **15.50 × 1.43 m**, a corridor slice; `RM_Level_2_3` is 0.53 × 14.62 m. §16 dropped the room
  beat outright — both genuine rooms had **zero** in-range-and-facing windows anywhere in the film.
- **No X diagonals.** A hall is concave, and §3.3 rules a bbox area on a concave plan a fabrication.
  Tint the region, label the area. The X belongs to §26's rectangular plate and nowhere else.

**⚠ 29.2a THE ONE DESIGN DECISION THIS BEAT NEEDS — an unbounded flood fill returns the FLOOR, not the
hall.** Level 1's walkable is **6,481 m²** as ONE connected component, because doorways link
everything. A camera standing in a 1.43 m corridor would be labelled `Hall-Corridor, 6,481 m²`, which
reads as a mistake and destroys the effect it exists to create. Something must bound the fill. **The
mechanism already ships:** `common/room_graph.js` has `isRoomDoor()` and `buildGraph()`; cutting the
fill at door thresholds is what turns "the floor" into "the hall you are standing in". Settle this
before writing the beat — everything else in §29.2 follows from it.

**29.3 THE STAIR — cue the GOING, never the rise. Both buildings have stairs, so the fallback never
fires.**
| | `IfcStair` | rise median | going median |
|---|---|---|---|
| Hospital | 30 (+1 flight) | **5,050 mm ⛔** | **6,049 mm** |
| HHS | 4 (+8 flights) | 3,856 mm | **4,241 mm** |
| HHS `IfcStairFlight` | 8 | **3,620 mm ⛔** | 7,062 mm |

⚠ **A stair's rise IS the storey height by construction**, so §27.3c's datum-restatement guard applies
unchanged. MEASURED: Hospital's stair rise 5,050 mm against the datum figure **5.00 m**; HHS's
stair-flight rise 3,620 mm against **3.60 m**. The guard fires on a DIFFERENT class in each building —
which is why it must be a test, not a per-building exception. The **going** is stated by no datum, no
storey table and no schedule, and it is the dimension a stair is actually criticised for.

**29.4 THE OPENING — the door is the portable one; the window is not.**
| | `IfcDoor` | dominant type | `IfcWindow` |
|---|---|---|---|
| Hospital | 440 | **2,108 × 1,078 mm ×198** (45 %) | 131, 4,100 × 2,000 mm ×33 |
| HHS | 133 | **2,134 × 934 mm ×81** (61 %) | **VACUOUS — none** |

**HHS has zero `IfcWindow`**, so a window cue cannot generalise across the two buildings; the door can.
§6's dedupe governs: 440 doors at one leaf size are **ONE** measure, and "2,108 × 1,078 mm — 198 of
them" is an honest statement standing for the population. State height × width and say which is which;
leaf AREA (2.27 m²) is the weaker number and should not lead.

**29.5 THE CLEAR HEIGHT — the killer, and the only raycast in the whole indoor set.**
§3.5's B6 and §4 already carry the mechanism: **one vertical cast, two stops** — first hit is CLEAR
HEIGHT (headroom, what you would walk into), first *large horizontal* surface is TOTAL HEIGHT (the
ceiling proper), so a light fitting or a hanging duct is never mistaken for a ceiling.
⚠ **Cue the CLEAR height only. TOTAL height restates a datum figure by construction** — it is the
storey height, which §24.7's Z chain already draws; that would be the third restatement in this lane
(§27.3c column, §29.3 stair rise, this). **Clear height under a tray or a duct is in no datum, no
schedule and no drawing** — it is the number that gets discovered on site. Where the two differ
sharply, the gap is itself the finding (§4 already says so).
⚠ **This is the one beat the PoC cannot resolve** — it prints `INCONCLUSIVE` because it casts no ray.

**29.6 TINT LIFETIMES ARE NOW THREE, AND THAT IS DELIBERATE.** Recorded so a later session does not
"unify" them on consistency grounds and break this one:
| layer | lifetime |
|---|---|
| datum planes (§17.5) | occluded by the rising build, then fades |
| floor plate (§26.2) | a 2.0 s envelope on the pop |
| **hall (§29.2)** | **persists until frame-out, then removed; gone by the Reveal return flight** |

The hall's persistence is a considered exception to §14's no-persist baseline, and §7's `persist:true`
already exists to carry it. The user set it deliberately: the hall is the space the viewer is moving
through, so it holds while they are in it.

**29.7 ⛔ OPEN.**
1. **Bound the flood fill (§29.2a).** Nothing else can be written until this is settled.
2. **The clear-height cast is unimplemented** and is the only ray in the set.
3. **HHS's indoor stretch is in doubt for a camera reason, not a data one.** §28.2 measured HHS's baked
   path crossing ground level at frame 75 (3.1 s) and ending at **−1.09 m** — underground. Its film
   clock is now MEASURED at **72.3 s** with a **3.90 s** dive (§28.2 lifts §27f's UNVERIFIED label and
   supersedes §27g's `NOFIT`), but a slot that fits in TIME may still have nothing legible in frame.
   Verify the indoor camera before allocating HHS slots.
4. **The premise that "most bakes land in the hall first" is a claim about the PATH GENERATOR, not the
   building.** Hospital's path is authored; HHS's and Terminal's are derived. Check it with
   `plan.poseAt` in the same probe §26/§27 already owe — do not assume it across buildings.

### 32. §ENVELOPE_BOX_DEPRECATED (renumbered from 29 — the other session's §29 §INDOOR_BEATS was inserted first) — the opening envelope tint goes; the 2D dims and the panel stay (user, 2026-09-08)
> **USER:** *"Remove the whole starting envelope tint as it is not needed. The whole envelope box
> supposed to be deprecated. Just the 2Ds and the box label is good enough. But make the box label
> persist 2 more secs."* (said after watching `Hospital_3s_clash_measure_2026-09-08.mp4`, whose first
> 2.2 s carry the B1 envelope cue: a 3D fill+outline box round the building PLUS the 2D arrowed
> X/Y/Z dimension lines and the Ground m² / Envelope m³ panel.)

**Ruling → code (`viewer/cpe_flythru_cues.js`):** (a) `flythruCuesApplyVisual` never shows the 3D
group for `key === 'envelope'` — no fill, no outline — and says so once (`§FLYTHRU_ENVELOPE_BOX
deprecated`). The other cues (storey/room/corridor) are untouched by this ruling. (b) the 2D arrowed
dimension lines keep the §14 slot (0.0–2.2 s). (c) the PANEL ("box label") persists **2.0 s** past the
slot: full for 1.4 s, then the same 0.6 s fade — `§FLYTHRU_DIM_DRAW key=envelope panel-hold`. Storey's
window opens at 5.8 s on Hospital, so nothing overlaps. Witness: `witness_flythru_gate.js` (§6) plus
the next bake's `§FLYTHRU_DIM_DRAW` lines.

### 33. §CLI_BAKE_HOME (renumbered from 30) — a bake opens from the viewer's Home frame, like the snapper (user, 2026-09-08)
> **USER:** *"The HHS opening frame has to be some distance away to let the dive in catch the 2D Z
> plane. Trust your surgical judgement in the code and WITNESS log debugging."*

**Measured cause (§28.2):** the plan's opening station is the LIVE camera (`§CINEMA_PIVOT`), and a
headless page is left wherever the load put it — HHS opened at **8.7 m up, 49.8 m out** and dived
underground by 3.1 s; Hospital's load camera happened to equal its Home frame, which is why its frame 0
matched the snapper. `scripts/snap_timeline.js` already presses the viewer's own Home key before
planning (default on; MEASURED there on HHS: 70.0 m above base, 98 m out, whole building in frame).
**Ruling → code (`cli_silent_bake.js`):** press Home (the real key, dispatched on document + window,
exactly the snapper's mechanism — not a copy of `_homeFillFrame`'s formula) after `§CLI_BAKE_LOADED`
and BEFORE any `cinemaPathPlan` call; log `§CLI_BAKE_HOME camera=… (was …, moved=0|1)`. `--nohome`
opts out. Expected: Hospital `moved=0` (film byte-identical), HHS `moved=1`. Not a path edit — the
stored waypoints are untouched; only the opening station moves.

### 26.8 §SLAB_BEAT — IMPLEMENTATION (2026-09-08, branch `feat/flythru-cues`, bake HELD by the user)
> **USER:** *"Hold on the bake until u done present dive in slab catch. Then we can have 12 seconds."*

- **`viewer/cpe_slab_beat.js`** (new, wired in `viewer.html` / `main.js` / `cinema_maxq.js` beside the
  datum; `sw.js` v1162→**v1163**). Rides the Alt-C **Measure** checkbox. Build once, per-frame apply,
  dispose, `A.slabBeatReport()` for the witness. Never-kills-a-bake try/catch at all three call sites.
- **The clock is the owner's, not the PoC's.** §26.6.3 is answered: the pop second is found by
  bisection over `A.buildupTAt` + `A.buildupCursorAt` (with the bake's own `nFrames/fps`), and a plate
  POPS when its op's `end_ts <= cursor` (`renderAtTime`). `§SLAB_BEAT_CLOCK` prints filmSec, diveSec,
  topoutU and a monotonicity check (INCONCLUSIVE if the clock is not monotone). §26.5's **10.31 s** was
  the linear day map — the witness below records the owner's number.
- **Frustum (§26.6.1)** is `plan.poseAt` at the plate's OWN second, a cloned perspective camera, the
  crossing must be in front and inside NDC; `§SLAB_BEAT_FRUSTUM` prints corners in front/inside, the
  projected diagonal in px and camera distance. Ranking is longest hold first; the first in-frame,
  floor-plate pick wins; the rest are reported as not taken.
- **Semantic withdrawal (§26.6.2)** is geometric, not a constant: walkable ⊆ plate ⊆ bbox, so a pick
  whose bbox area is smaller than its storey's `storey_walkable_raster` area cannot be that storey's
  floor plate → `§SLAB_BEAT_SEMANTIC … NOT-A-FLOOR-PLATE`, beat withdraws. No raster → INCONCLUSIVE, drawn.
- **Layers (§26.2):** tint by GUID (clone-per-material emissive, instanced/batched `setColorAt`, exact
  restore — the `cpe_storey_reveal.js:249` pattern); X = `LineSegments` on the top face, depth-tested;
  label = a textured plane **in the plate's plane** (§25.1), `depthTest:false renderOrder 900`, width a
  third of the shorter side, reading direction chosen ONCE from the pose at the pop. Envelope
  0.6/1.0/0.6 (2.2 s, = §14's slot); label persists while its crossing is in frame. Tint that touches
  0 meshes says `NO-MESH` and retries quietly on later frames (the pop can land a frame after the
  bisected second); it reports how many frames late.
- **Witness `viewer/tests/witness_slab_beat.js`** — real page, real stored path, Time Machine primed the
  way the bake primes it, cursor driven by the same two owners; population = the build's event rows;
  asserts §26.7's list; red control breaks the label/box agreement. Log → `out/witness_slab_beat.log`.

**26.9 MEASURED — the witness's first runs (2026-09-08, `out/witness_slab_beat_nostream2.log`,
`out/witness_slab_beat_hhs_nostream2.log`; 16/16 PASS each, no-stream, so the tint invariant is
INCONCLUSIVE there and says so).**

| | Hospital (`--dur 195.8`) | HHS (`--dur 72.3`, Home-framed) |
|---|---|---|
| pool under the BAKE's clock | L1 **1.06 s** · L2 3.84 · L3 5.92 · L4 7.07 · L5 8.43 · L6 9.34 … | L1 **0.00 s** (already placed at frame 0) · L2 12.31 · L3 23.16 · Roof 27.23 |
| dive | 18.28 s (0.093) | 3.88 s (0.054) |
| pick | **Level 1 @ 1.06 s, hold 4.86 s**, 8,899 m², `Concrete-150 mm slab on 300mm base`, ratio 1.37 FLOOR-PLATE, frustum 3/4 corners in, 125 m | **Level 1 @ 0.00 s, hold 12.31 s**, 3,518 m² `STB 30.0` (+ `FB 15.0 - Fliesen 50 x 50` stacked, in vertical contact), ratio 1.68, frustum **4/4**, 94 m |
| rejected | L3 (L2 @3.84 and L4 @7.07 within 2.2 s, dz ±5.00 — not in contact), L5 (L6 @9.34) | none in the dive; L2/L3/Roof after it |
| label | `98.57 × 90.29 m = 8,899 m² (est.)` 30.1 × 7.5 m in-plane, yaw 90° | `65.84 × 53.44 m = 3,518 m² (est.)` 17.8 × 4.5 m |

**Three findings, each a correction to something written above.**
1. **§26.5's 10.31 s was the PoC's linear day map; the bake's clock lays Hospital's Level 1 at
   1.06 s** and a floor every 1–3 s after it (§CPE_BUILDUP_ONSET_BLEND pulls the early schedule
   forward). The "9th-second plate" the user read in the full film was therefore NOT Level 1 popping —
   at 9 s five plates are already down. §26.5's placement table is superseded by the witness's
   `§SLAB_BEAT_POOL` line; the selection rules themselves (hold ≥ 2 s, no uncontacted co-arrival within
   the envelope, one per film) stand and now pick Level 1 at 1.06 s.
2. **§26.4.5's stacked-layer test needed vertical contact.** Plan overlap alone merged Level 2 into
   Level 3 (100 % overlap, 5.00 m apart) as "one floor in two layers". Now a stacked layer must also
   touch (|Δz| ≤ half-thicknesses + 0.05 m); HHS's structural+finish pair still merges, Hospital's
   storeys no longer do — they become the fragmenting co-arrivals that reject L3 and L5.
3. **§CPE_CLIP_BUILDUP_FILM_T — a clip laid the building on a different clock from the film.** The
   loop passed `nFrames/fps` (the CLIP's length) as the onset-blend's film total: `onsetU = min(0.5,
   10/3.0)` on the 3 s bake vs `10/195.8` on the film. The 3 s bake showed `placed=2620` at 3.0 s; the
   full film's clock (witness cursor line) says **1,881**. Third instance of the class
   (§CPE_CLIP_REVEAL_FILM_T, §CPE_CLIP_SUN_ARC_FILM_T); fixed to `_filmSecFull` for the cursor and the
   ghost-ground fade. **Prediction for the 12 s bake: `§CPE_BUILDUP placed≈1881` at 3.0 s and ≈7488
   at 8.5 s.** If it prints otherwise, the clocks still differ.

**§33 correction.** The Home key must be dispatched ONCE, on `document`. The snapper's double dispatch
(document + window) fired `§ROOM_HOME` twice and left the plan opening from the load camera
(41.4, 8.7, −27.7); a single dispatch opened HHS at (48, 64, 48) with the plate 4/4 in frame at 94 m.
`cli_silent_bake.js` does the single dispatch and prints `moved=`.

**§33 CORRECTED (same day) — the opening is the SAVED VIEW, and the DATUM is the gate, not Home.**
MEASURED: both silent DBs carry a `scene_state` row and `main.js §SCENE_STATE_RESTORE` sets the camera
from it at load. So a bake opens from the user's own saved view: Hospital's (85.5, 70.0, 58.9) — where
the datum draws 37/37 bubbles + 3/3 overalls — and HHS's (41.4, 8.7, −27.7), 4/8 envelope corners in
frame, 47 m from the centre, where it draws 37 of 40. Pressing Home unconditionally would have MOVED
Hospital: with the model streamed, Home frames from `A.buildingCentres` → (90.5, 120.7, 90.5), not the
film the user knows. **Rule shipped in `cli_silent_bake.js` as `§CLI_BAKE_OPENING`:** the film opens
from the saved view; if Measure is on and the datum's own layout pass at filmSec 0 reports the drawing
NOT wholly in frame (`bubbles < total` or `overalls < 3`, read off `A._flythruDatumLast`), Home is
pressed once and the datum re-judged. No distance threshold anywhere: the owner of "is my drawing in
frame" decides (§17: the datum must be up at second 0). Measure off → the saved view stands, and the
log says the gate did not apply. `--nohome` skips the gate; `--opening-only` judges and exits (no GPU).

**§28.2 addendum — item 2 now closes on HHS too.** Under §33's gate (`--opening-only`, 2026-09-08)
HHS's bake opening is Home (48, 64, 48) and the datum reports **drawn=40, 20/20 bubbles, 3/3
overalls** — the snapper's recorded number. The two consumers agree on both buildings once the bake
opens where the snapper opened. Hospital is untouched (saved view kept, drawn=74).

**26.10 ✅ THE SLAB BEAT IN A REAL BAKE — Hospital 12 s, real GPU, 2026-09-08 (`out/Hospital_12s_cm.log`,
film `~/Downloads/Hospital_12s_clash_measure_slab_2026-09-08.mp4`, 288 f = 12.000 s, wall 176 s, 0 failures).**
- `§CLI_BAKE_OPENING kept=saved-view (85.5, 70.0, 58.9) 37/37 3/3 drawn=74 FULL` — Hospital's film opens
  exactly where it always has.
- `§SLAB_BEAT_PICK sec=1.07 hold=4.88 Level 1` → `§SLAB_BEAT_TINT meshesTouched=1` (an instanced mesh, colour
  path) → `§SLAB_BEAT_LABEL on filmSec=1.09 ndc=(-0.08,-0.20)` → `§SLAB_BEAT_ENVELOPE done filmSec=3.30`,
  label kept. Label text `98.57 × 90.29 m = 8,899 m² (est.) — Concrete-150 mm slab on 300mm base`.
- **§26.6.3 CLOSED — the clock is the bake's.** The bake logs `§CPE_BUILDUP placed=` every 120 frames; the
  witness's owner-clock at the same seconds: 5.00 s **3149 vs 3148**, 10.00 s **9678 vs 9671**, 11.96 s
  **12079 vs 12072**. Frame-quantisation apart, identical. §CPE_CLIP_BUILDUP_FILM_T is in force.
- `§FLYTHRU_ENVELOPE_BOX deprecated` printed once; `§FLYTHRU_DIM_DRAW key=envelope` at 0.04/0.50/1.51 s,
  `panel-hold` at 2.51 s, then `key=storey` from 2.72 s. **The panel hold yields to the next cue**: the
  compositor draws the hold only while no cue is active, so §14's one-cue rule still holds; on this bake the
  storey cue opened at 2.7 s (its window was 5.8 s on the 3 s bake — the cues module's own placement, not
  touched here) and the panel got 0.5 s of its 2.0 s. Clash: `trueClash=270 markers=540`, same frames.
- Datum on the dive: `drawn` 58 → 54 as the camera descends and marks leave frame; chain adds up, 0 failures.

**26.11 HHS 12 s bake (same session; `out/HHS_12s_cm.log`, film `~/Downloads/HHS_12s_clash_measure_2026-09-08.mp4`,
303 f = 12.6 s of a 76.0 s film — the Home opening lengthened the plan from 72.3 s; wall 151 s; 0 failures).**
- `§CLI_BAKE_OPENING moved=Home load[(41.4, 8.7, −27.7) 18/20 2/3 drawn=37 PARTIAL] → home[(48, 64, 48) 20/20
  3/3 drawn=40 FULL]` — §33 did what the user asked: the film now opens at distance with the whole datum,
  the Z plane included; `drawn=40` on the first 51 frames, then 22/16/18 as the dive proceeds, never 0
  while the layer is live (221 frames to its fade).
- **`§SLAB_BEAT INCONCLUSIVE — buildup off — nothing is laid, so there is no pop to mark`.** HHS's stored
  `cinema_path` predates the buildup column, so `§CLI_BAKE_BUILDUP_RESOLVED on=0 source=stored-path`: the
  HHS film shows the finished building throughout and a "plate as it is laid" cannot exist in it. The beat
  declined by name (PRIMAL LAW §4), it did not draw a finished plate. **To see the HHS slab catch: bake with
  `--buildup` (the CLI flag composes it onto the stored path) or re-save the HHS path with Buildup on.**
- **The HHS path still goes underground.** Even from the Home opening the camera's Y crosses 0 at 3.96 s (frame 95) and
  bottoms at −1.82 m; the datum's projected semi-axes explode there as before. §27g's ruling stands: this is
  the stored PATH (its dive target), not the opening and not the datum. A longer/higher HHS path is the
  user's injection.

**⛔ OPEN after this session:** (a) HHS 12 s bake with `--buildup` — one GPU run, user's go; (b) §27
`§LINEAR_BEAT` next, reading §28.2's HHS clock (76.0 s film after §33, dive 0.054) and §26.9's real
Hospital pool; (c) the cues module's storey window moved 5.8 → 2.7 s between the 3 s and 12 s Hospital
bakes (its own placement, not touched here) — worth a `§FLYTHRU_CUE_PLACE` line naming why.

**26.12 THE MP4 ITSELF — what has and has not been proven (2026-09-08, user: *"Have you checked the mp4 for
proof the Measure is working well?"*).** Honest state: the §-log proves the layers were COMPOSITED (drawn
counts, tint touched, label on/off, 0 failures) and ffprobe proves 288 frames / 12.000 s. The PIXELS were
then measured, not eyeballed (`out/frames_h12/`, `out/frames_h12q/`, numpy):
- Hue-band counts move the right way at the pop (amber 8 → 627 → 684 px over 0.8 → 1.5 → 2.2 s; yellow up
  when the label appears) but the bands are CONFOUNDED by the sunset arc and the storey cue — not proof.
- Whole-frame mean V falls 0.86 → 0.54 between 0.75 and 1.5 s and stays ~0.5; dark fraction (V<0.12)
  never exceeds 0.05 — so the plate popping darkens the frame (concrete over bright ground), and the
  tint's instance-colour path did NOT black out sibling instances. Not a defect.
- The datum's exact-ink count (#c9d3df ±14) collapses 3,487 → 29 px at 1.5 s while `drawn` stays 54–58:
  the 2D marks are drawn with `globalAlpha=op` over a changing background, so an exact-colour proxy is
  meaningless once the plate is under them. Not a defect; a bad proxy.
- The label's world rectangle projected through each frame's recorded pose (fov 60): inside-box saturated
  fraction 0.107 vs 0.006 control at 2.2 s (the yellow text/border), but ~0 at 1.5 and 3.0 s → INCONCLUSIVE.
**The one measurement that would be proof: an A/B bake** — the same 12 s clip with `--no-measure`, then a
per-frame |on − off| pixel mask: its count must be 0 where no Measure element exists, and its footprint
must sit on the datum planes, the plate's X and the label box. One 3-minute GPU run, user's go.

### 26.14 §SLAB_BURIAL — a later plate directly above inherits the event (user, 2026-09-08: *"Hospital 9th second clear slab didn't get caught? … Yes fix that"*)
**Measured cause (`out/Hospital_12s_cm.log`):** L5 pops 8.47 s, L6 9.38 s, 0.91 s later, dz +5.00 m, full
plan overlap. §26.4.5 knew two cases — same place in contact (merge, HHS structure+finish) and elsewhere
(fragments, reject) — so L6 was folded into L5's event as "the larger takes it" and thrown away with it.
L6 is the plate that stays clear for the rest of the dive; the event is the UPPER plate's, not the larger's.
**Rule:** within the envelope, a plate overlapping the host ≥ 50 % in plan, NOT in vertical contact and
ABOVE it is a BURIAL: it becomes the event at its own pop second, the host is recorded as buried, and the
chain's `claimSec` stays the FIRST pop of the chain (that is when the previous plate's mark was covered).
Hold of the previous event = next event's `claimSec` − its own pop. Under it, Hospital: L1 hold 2.78 s (to
L2 @3.85), chain L2→L3→L4→L5→L6 survives as **L6 @9.38 s, hold ∞ inside the dive** → longest hold wins →
the 9th-second plate. A later plate hidden UNDERNEATH the host (overlap ≥ 50 %, below) is recorded as
`under`, neither buries nor fragments. HHS's contact case is unchanged. Witness gains: a buried plate is
never the pick; every event's `claimSec ≤ sec`.
**MEASURED after the fix (`out/wsb_h_burial.log`, `out/wsb_hhs_burial.log`, 17/17 each):** Hospital events
are now L1 @1.06 s hold 2.77 s and **L6 @9.34 s hold ∞, buried=[L2@3.84, L3@5.92, L4@7.07, L5@8.43],
claimSec 3.83** → L6 is the beat: `87.56 × 86.62 m = 7,585 m² (est.) — 150mm Concrete With 75mm Metal
Deck`, ratio 2.25 FLOOR-PLATE, crossing in frame at 62.8 m (2/4 corners in — the plate is larger than the
frame by then, the label carries it). HHS unchanged: L1 @0.00 s with its finish layer merged. Not yet
seen in a bake; the 12 s Hospital film in Downloads predates this fix.

### 34. 🏁 RESUME HERE — session close 2026-09-08 (Fable). Read this, then §26.14, §32, §33, §29 §INDOOR_BEATS.
**State.** bim-ootb branch `feat/flythru-cues` @ `90241bd2` (+ a comment-only renumber commit), pushed, no PR,
~14 commits ahead of `main`; `sw.js` v1163. Spec branch `fable/meshdb-livewire`, pushed. Worktree
`/tmp/wt-storey-reveal` holds every log cited here under `out/`. Films in `~/Downloads/*_2026-09-08.mp4`.
Shipped and witnessed this session: §28 bakes · §26 slab beat (+§26.14 burial) · §32 envelope box · §33 opening
gate · §CPE_CLIP_BUILDUP_FILM_T · CLI `--measure`. **Nothing here is merged to main.**

**USER, on the 12 s Hospital film (2026-09-08 close): *"I am satisfied the visual graphics treatment."* Then
three corrections — these are the FIRST tasks, in this order, each one small:**
1. **"The whole envelope tint is still there."** §32 skipped the 3D box only for `key === 'envelope'`; the
   STOREY cue (window 2.7–4.9 s on the 12 s bake) draws the same 0.13-opacity fill + outline around the
   storey's extents, which reads as the building tint. Evidence: amber-band pixels 1,689 @3.0 s and 5,389
   @4.5 s vs 274 @8.0 s (`out/frames_h12/`), `§FLYTHRU_DIM_DRAW key=storey` 2.72–4.52 s. **Ruling extends to
   ALL cues: no 3D box for any cue; 2D dims + panel only.** Fix = `flythruCuesApplyVisual` never shows
   `ensureGroup()`'s fill/outline (one branch, `viewer/cpe_flythru_cues.js` ~line 345); log
   `§FLYTHRU_CUE_BOX deprecated`; `witness_flythru_gate.js` must stay 0 FAIL. Confirm in the next bake's log.
2. **"The outer perimeter still does not ignore rogue elements (a single hanging staircase off the main
   building) — asked to be a rule in any building — and it may influence the total/walkable areas."** The
   rule already exists: **§20.9** (envelope = `BOMExtract.extract(A).envelope`, structural classes only,
   *"outliers stretch AABB"*) and **§20.7** (the clustering primitive for outlier rejection). Neither was
   adopted: `cpe_flythru_cues.js dbMeasures()` builds `ext` and `ground` from ALL `element_transforms`
   (`FM.ftExtents(all)`, `ftRasterizeBoxes(all)`), and `cpe_flythru_datum.js` derives its grid from columns
   (robust) but its ground/upright plane extents from the same all-element box. Task: envelope dims,
   Ground m², Envelope m³ and the datum plane extents take the §20.9 structural envelope; a stair
   (`IfcStair`, not in `ENV_CLASSES`) is then outside by construction. Print BOTH numbers once
   (`§FLYTHRU_ENVELOPE all=… structural=… dropped=[class:count]`) so the correction is witnessed, not assumed.
   `storey_walkable_raster` (walkable m², §29.2) is mesh-derived per storey — check whether the stair's
   footprint is in it before claiming it is unaffected.
3. **"Make the grid lines more pts thicker."** The datum's 3D ground grid and storey rules are
   `LineBasicMaterial` (`cpe_flythru_datum.js:160`) — WebGL draws them 1 px whatever `linewidth` says, and
   the bundle has no `LineSegments2`/`LineMaterial` (grep: 0 hits in `viewer/lib/three*.min.js`). §17.5
   requires these lines to DEPTH-TEST and be occluded, so they cannot move to the 2D canvas. Options, pick
   by measurement: thin ribbon quads (world width derived from the bubble radius, e.g. 0.06 × R — state
   the ratio) or a `MeshLine`-style strip; the 2D annotation strokes (`ctx.lineWidth = 1.1 * (h/720)`,
   line 416; bubbles `r * 0.10`, line 401) can simply scale. Witness: `§FLYTHRU_DATUM_LINES widthM=… px@100m=…`.

**§27 §LINEAR_BEAT — corrections before anyone allocates a slot (all measured this session):**
- Its PoC `scripts/poc_dive_beats.js` still maps day→second LINEARLY (lines 89–93). §26 replaced that with the
  owner clock (`A.buildupTAt` + `A.buildupCursorAt`, bisected — `cpe_slab_beat.js makeClock`); §27 must do the
  same or its seconds are fiction. Hospital's real early pops: L1 1.07 · L2 3.85 · L3 5.94 · L4 7.09 · L5
  8.47 · L6 9.38 (§26.9), and the buildup runs ~1,200 elements/s after 10 s.
- **The plate's slot is now 9.34–11.54 s (Level 6, §26.14), not 10.31–12.31.** §27.2's column/beam
  allocations were computed around the old slot on the linear clock — recompute; §27.3d's "call §26" now
  means `A.slabBeatReport().beat.sec`.
- HHS: film **76.1 s** after §33 moved its opening (72.3 s before), dive 0.054 → **4.1 s** (one 2.5 s slot),
  camera underground from **3.96 s** (frame 95), stored path has **buildup OFF** (`§CLI_BAKE_RESOLVED
  buildup=0 reveal=0`) — pass `--buildup --reveal --label` or re-save the path, or nothing pops. §27f/g and
  §29.7 item 3 carry the older numbers.

**Bakes.** GPU bakes are user-gated, one at a time. Standing offers not yet taken: (a) HHS 12 s with
`--buildup --reveal --label`; (b) Hospital 12 s to see §26.14's Level 6 beat; (c) an A/B `--no-measure`
diff bake as the pixel-level proof of Measure (§26.12). `--opening-only` judges the opening with no GPU.

**Commands.** `node cli_silent_bake.js --db Hospital_silent_local --clash --measure --gpu real --clip
0:0.06129 --fps 24 --width 1280 --height 720 --port 8561 --out out/X.mp4 --log out/X.log` (12 s);
`node viewer/tests/witness_slab_beat.js --db Hospital_silent_local --dur 195.79 [--nostream]` (streamed run
≈ 8 min under swiftshader, no-stream ≈ 1 min; `--nostream` marks the tint invariant INCONCLUSIVE);
`node viewer/tests/witness_flythru_gate.js`. Read the log after every run.

**Do not redo.** §26.5's placement table (linear clock) — superseded by §26.9/§26.14. §28's item 2 on HHS —
closed by §33. The PoC numbers in §26.4/§27.2 — the owner clock replaces them. The 2D-vs-3D question for
the datum lines — §17.5 settles it (3D, occluded).

### 35. ✅ §34's three corrections — DONE (2026-09-08, worktree `/tmp/wt-storey-reveal`, branch `feat/flythru-cues`)
All three of §34's items done in order, each witnessed; no bake run (none was asked for this pass).

**1. No 3D box for ANY cue.** `flythruCuesApplyVisual` (`viewer/cpe_flythru_cues.js`) no longer branches on
`key === 'envelope'` — it hides `ensureGroup()`'s fill/outline unconditionally and returns
`box:'deprecated'` for every cue. Logs `§FLYTHRU_CUE_BOX deprecated` once (was `§FLYTHRU_ENVELOPE_BOX`).
`witness_flythru_gate.js` unaffected (pure logic simulation, never touches this function) — reran, still
17/17-per-section, 0 FAIL total.

**2. §20.9 structural envelope adopted, not re-derived.** `bom_extract.js`'s `ENV_CLASSES` was a
function-local object; hoisted to module scope and exported as `window.BOMExtract.ENV_CLASSES` so
`cpe_flythru_cues.js` references the ONE definition instead of keeping a second, driftable copy.
`dbMeasures()` now builds `struct` (ENV_CLASSES-filtered) alongside `all`, and the building-level
`out.ext`/`out.ground` (envelope dims, Ground m², Envelope m³) take `struct`, falling back to `all` if
no structural class is found. Logs once: `§FLYTHRU_ENVELOPE all=… structural=… dropped=[class:count,…]`.
MEASURED (real page, `Hospital_silent_local`): `all=115.75x164.78x47.05 structural=115.75x133.94x47.02
dropped=[…IfcStair:61,IfcStairFlight:1…]` — the Y-axis alone shrank **30.84 m** once the stair (and every
other non-structural class) stopped stretching the AABB, confirming the user's "rogue hanging staircase"
complaint by name. HHS: `19.77m → 11.11m` on Z (height) for the same reason.
⚠ `cpe_flythru_datum.js`'s ground/upright plane extents were checked and are **already** ENV_CLASSES-only
(`git blame`: written 2026-09-07, unrelated to this session) — §34's claim that this file used the
all-element box was stale; no change made there for this item.
`storey_walkable_raster` was also checked (not just assumed): `scripts/build_storey_walkable_raster.js`
builds it from `IfcSlab%` mesh triangles only — a hanging stair contributes nothing to it, so the
walkable-area figures are genuinely unaffected, not unaffected by luck.

**3. Datum lines are now depth-tested ribbon quads, not 1px `LineBasicMaterial`.** `cpe_flythru_datum.js`'s
ground grid and level rules are built as flat `MeshBasicMaterial` quads (one merged `BufferGeometry` per
group — still 3 draw calls, §17.7 unchanged), each quad lying IN the plane its segment already occupies
(`along × planeNormal` gives the in-plane widen direction — ground widens in X/Z, the elevation plane
widens vertically — so nothing pokes out of the face). depthTest left at its default TRUE (§17.5 unchanged:
occluded by the building). ⚠ **The spec's own example ratio (0.06 × R_BUB, R_BUB = grid bubble radius) was
tried first and MEASURED to fail**: Hospital's opening camera is ~287 m from the grid centre, and
0.06×R_BUB gave a 0.059 m wide line — 0.37 px on screen, thinner than the 1px hairline it was meant to
fix. Replaced with a width derived from THIS BUILD'S OWN opening-camera distance to hit a stated pixel
target (2.5 px), degrading to the bubble ratio only when no camera/viewport exists yet. Witness:
`§FLYTHRU_DATUM_LINES widthM=… src=[camera d=…m fov=… h=…px] px@…m=2.50`. MEASURED: Hospital
`widthM=1.1505 d=286.9m → 2.50px`; HHS `widthM=0.1927 d=48.1m → 2.50px` — same on-screen thickness, correct
absolute size on both buildings.

**Verification (no bake — a headless page exercising the real functions directly, same class of proof as
`snap_timeline.js`; not a GPU bake, no mp4, no cost gated by the bake permission):** loaded
`Hospital_silent_local` and `HHS_silent` for real, called `A.flythruDatumBuild()` / `A.flythruCuesBuild()`
/ `A.flythruCuesApplyVisual()` directly, captured console + `pageerror` — **zero errors on either
building**, all three `§FLYTHRU_*` witness lines fired as expected. Then reran the two named witnesses:
`witness_flythru_gate.js` (0 FAIL) and `witness_slab_beat.js --nostream` on both DBs (`pass=17 fail=0`
each). `sw.js` bumped v1163→**v1164**.

### 36. 🎯 TAKE-OVER WORKLIST — resolve the open issues, then extend Measure to the end of the film (user, 2026-09-08 evening: *"take over, resolve issues, and extend the Measure coverage all till the end"*)
Worked top to bottom to zero (CLAUDE.md WORK-TO-ZERO). Each item flips to ✅ (witness) or ⛔ (the one question).
GPU bakes stay user-gated; everything below is proven on the page harness and the persisted logs first.
| # | item | owner file(s) | witness |
|---|---|---|---|
| W1 ✅ | **Opening flicker** (HHS full bake, `§FLYTHRU_DATUM_MARKS` 40→6→22 in 1 s; reviewer's drop-ledger ask). Cause read from the code: the compositor re-decides near sides / upright plane / face EVERY frame (`nearY/nearX/zNearX/_zPlane`, lines 376–398) and `flythruDatumAt` re-picks `camFar`; when the dive crosses a mid-plane the drawing jumps to the other edge. Fix = decide ONCE per datum life (first composite), cache, reset on dispose; add `dropped=[behind:N]`, `dDrawn=`, `sidesChanged=` to the MARKS line; cues lock their drawn span set per cue window (`drawDim` declined per frame → 1→2→1); clash labels log `leave=`. Witness: `witness_datum_stability.js` — drives 0–15 s at 24 fps, asserts `sidesChanged=0`, `dDrawn ≤ 0` after frame 0, per-cue span set constant; HHS and Hospital. | `cpe_flythru_datum.js`, `cpe_flythru_cues.js`, `clash_labels.js` | new |
| W2 ✅ (no code) | **Envelope still stretched** after §35: Hospital structural Y = 133.94 m vs column grid 88.2 m / plate 90.3 m. MEASURED: `IfcWallStandardCase` spans y 30.1–164.0 (a foundation wall at cy 69.3, by 78.5), `IfcSlab` 37.5–163.3 — structural classes, far outside the main mass. Class filtering cannot decide this; **§20.7's clustering can**: rasterize the structural footprint, take the LARGEST CONNECTED COMPONENT, its bbox is the envelope, its cells the ground area. Measure offline first (`scripts/probe_envelope_cluster.js`), then adopt in `dbMeasures()`; `§FLYTHRU_ENVELOPE … cluster=WxD dropped=[…]`. | `common/flythru_maths.js`, `cpe_flythru_cues.js` | `witness_flythru_gate.js` + new asserts |
| W3 ✅ | **Ribbon width / gate order.** §35 derives the ribbon width from the camera at BUILD; the §33 gate builds the datum at the saved view and THEN presses Home, so HHS's ribbons (0.19 m at 48 m) render 1.2 px from the 94 m opening. Fix = gate disposes + rebuilds the datum after Home; log `widthM` after. | `cli_silent_bake.js` | `--opening-only` log |
| W4 ✅ | **§27 §LINEAR_BEAT** on the owner clock (column + beam during the dive, slots clear of the plate's 9.34–11.54 s), §27.3c datum-restatement guard, §27.3i projected-length floor via `plan.poseAt`. | new `cpe_linear_beat.js` | new `witness_linear_beat.js` |
| W5 ✅ | **§29 §INDOOR_BEATS**: hall walkable m² bounded at door thresholds (§29.2a), stair going, door type, clear height cast. | new `cpe_indoor_beats.js` | new `witness_indoor_beats.js` |
| W6 ✅ | **Measure to the end.** After the indoor run nothing measures until the film ends (HHS: last cue window closes 15.7 s of 130 s). Extend: per-storey walkable m² on the §STOREY_HIGHLIGHT_REVEAL cards, and the datum re-established over the FINISHED building on the pull-back (the setting-out drawing vs the built form — §25.5.3 is satisfied there because the model is complete). Spec first, then build. | `cpe_storey_reveal.js`, `cpe_flythru_datum.js` | extend existing |
| W7 ◐ | Bakes, user's go (Hospital full 720p ✅ §37.5; HHS + 1080p pending): Hospital 12 s (§26.14 + W1–W3), HHS 12 s, A/B `--no-measure` diff. | — | logs |

**W2 ✅ RESOLVED BY MEASUREMENT, no code (`scripts/probe_envelope_cluster.js`, `out/envelope_cluster_probe.log`).**
The §20.7 rule was run offline: structural footprint (ENV_CLASSES) rasterised at 0.5 m, connected components.
| | AABB all | AABB structural (§35) | largest connected component | components |
|---|---|---|---|---|
| Hospital | 115.75 × 164.78 | 115.75 × 133.94 | **116.0 × 134.0 m, 100 % of the structural raster** | 1 |
| HHS | 82.35 × 59.89 | 82.24 × 59.89 | 82.0 × 60.0, 100 % | 1 |
| Terminal | 73.67 × 59.12 | 73.67 × 56.12 | 69.5 × 56.0 (one `IfcWall` outside) | 1 |
So the residual Hospital Y of 134 m is not a rogue: it is `IfcWallStandardCase` "Basic Wall:Foundation - 375mm
Concrete w_step" (y 30.0–108.6) and the Level 1 base slab, joined to the main mass. §35's stair removal was the
whole correction the user asked for; the column grid's 88.2 m and the plate's 90.3 m are different, also true,
statements. Clustering stays available for a building whose structure IS detached; none of the three is.

**W1 ✅ / W3 ✅ (bim-ootb `feat/flythru-cues`, sw v1165; `viewer/tests/witness_datum_stability.js` HHS 8/8, Hospital 8/8;
logs `out/wds_hhs4.log`, `out/wds_hosp4.log`).** Cause confirmed by the witness's own field `distinctSidesIfPerFrame=2`
on both buildings: the per-frame near-side/plane rule WOULD have flipped once during each dive. Fixes: (1) sides,
upright plane and far-upright decided ONCE per datum life (first composite), reported per frame, reset on dispose;
(2) drop ledger `dropped=[behindCam …] dDrawn= sidesChanged= decidedAt=` on `§FLYTHRU_DATUM_MARKS`; (3) **§20.8 entry
latch** — one lifetime rule for the 3D planes and the 2D marks: gone 0.6 s after the camera enters the plan footprint
BELOW the top storey rule the drawing itself marks (`§FLYTHRU_DATUM_ENTRY`). MEASURED: HHS enters at **6.58 s**; Hospital
never enters inside its 20.4 s hold, so the accepted Hospital opening is unchanged; (4) cue span sets decided on the
cue's first frame and locked for its window (`§FLYTHRU_DIM_DRAW … window= lockedAxes=`); (5) the §33 gate disposes and
rebuilds the datum after Home, so §35's ribbon width and the side decisions read the real opening. Measured on the
witness: rises(dDrawn>0)=0 on both, usedSideDecisions=1, cue drawn sets ⊆ locked sets. `clash_labels.js` already logs
`release=[…]` per change (the reviewer's grep looked for "leave"); no change there.

**27.5 IMPLEMENTATION DECISIONS (2026-09-08, before code — deviations from the PoC, each measured or ruled):**
1. **Clock = the owner's** (§26.8): `A.slabBeatClock` (exported `makeClock`), pop = `end_ts`. The PoC's linear map is retired.
2. **Rank by PROJECTED length at the element's own pop second** (`plan.poseAt`, both ends in front and inside the
   frame), not by true length — that is §27.3i's floor made the ranking itself, and it is the user's "longest visual
   potential". The label prints the TRUE length in mm of the placed instance (§27.3b: label regenerated after placement).
3. **Datum-restatement guard covers BOTH classes**: columns against the storey heights + overall (§27.3c); beams against
   the datum's BAY figures (the bay chain prints every bay — a 6,480 mm beam restates it). Figures come from the datum's
   own build (`A.flythruDatumFigures()`), never re-derived from slabs.
4. **Linear test**: an element is a stick when its long bbox side ≥ 4× the other two; diagonal beams (bbox aspect < 4)
   are skipped — a bbox axis is not their axis.
5. **Slots** (§14): 2.5 s each; the plate's slot is READ from `A.slabBeatReport().beat.sec` (§27.3d); a cue must complete
   inside the dive (`sec + 2.2 ≤ diveSec`); the best candidate across both classes claims first, then the other class.
6. **Graphic**: 2D only — the cues' own `drawDim` (extension lines, inward arrows, mm value) along the element's axis,
   with a small plate naming the IFC semantic (§27.3e: dropped when it repeats the cue's number); envelope 0.6/1.0/0.6;
   the span is decided at allocation and force-drawn for its window (W1's lock rule).
7. Rides Measure. Composited in `_captureFrame` after the cues; no per-frame 3D work, no raycast.

**27.6 ✅ W4 BUILT + WITNESSED (2026-09-08; `viewer/cpe_linear_beat.js`, `witness_linear_beat.js` Hospital 12/12, HHS 12/12;
logs `out/wlb_hosp4.log`, `out/wlb_hhs4.log`; sw v1166).** Measured on the owner clock with §14 enforced ACROSS layers
(the 2D cues publish their windows via `A.flythruCuesWindows`; both beats treat them as taken):
| | Hospital (195.8 s, dive 18.28 s) | HHS (130.4 s, dive 7.00 s) |
|---|---|---|
| taken before the beats | envelope 0–4.2 · storey 2.7–4.9 · corridor 13.05–15.25 | envelope 0–4.2 · storey 2.7–4.9 · room 12.6 · corridor 15.3 |
| plate (§26) | **L6 @9.34–12.04 s** (L1 @1.06 now rejected: under the envelope cue) | **NOTHING** — L1 pops at 0.00 s under the envelope cue |
| beam | **9,605 mm `406x178x60UB` @6.51–9.21 s**, 136 px at 52.8 m (best-px beam 9,749 mm @8.87 s collided with the plate) | VACUOUS (no IfcBeam) |
| column | **NOFIT** — 358 legible in frame, none pops in a free slot | NOFIT — 2 legible (3,406 mm @3.26 s, 33 px) collide with the storey cue |
| guard | 31 columns + 210 beams rejected as datum restatements | 36 columns |
§27.2's "7 slots, three used" was the linear clock without the cue layer; the real dive is packed. The allocator tries both
class orders and keeps the assignment with more picks. **HHS's dive carries datum + 2D cues only** — its short dive and
its opening plate are path facts (§27g); the beats say so by name rather than squeezing.

### 29.8 §INDOOR_BEATS — IMPLEMENTATION DECISIONS (2026-09-08, W5, before code; resolves §29.7's three open items)
1. **The indoor window is READ, not assumed** (§29.7 item 4): `[plan.beats.dive, plan.beats.out] × filmSecFull`, sampled
   every 0.25 s through `plan.poseAt`. The camera's storey per sample = the highest datum level rule at or below its IFC
   z (`A.three2ifc`, `A.flythruDatumFigures().levels/levelNames`). Hospital 18.3–69.1 s; HHS 7.0–89.7 s.
2. **§29.2a bound = door thresholds, on the raster itself.** Take the storey's `storey_walkable_raster`, BLOCK every cell
   under an `IfcDoor` footprint on that storey (bbox grown by one cell), then flood-fill 4-neighbour from the camera's
   cell (or the nearest walkable cell within 2 m). The component is the hall; area = cells × 0.0625 m². Room_graph is not
   needed for this — the raster + the doors are the two real things. Label `Hall-Corridor · Walkable area: N m²`; tint =
   the component's cells as ONE merged, depth-tested floor mesh (row-run quads); label + tint persist until the hall's
   projected bbox leaves the frame or the camera changes storey (§29.6), then removed.
3. **§29.7 item 3 (HHS underground)**: at every sample the camera's IFC z is compared with its storey floor; a sample more
   than 1.0 m BELOW the floor is `§INDOOR_BEAT_CAMERA_BELOW_FLOOR` and cannot host any beat (you cannot stand in a hall
   from under it). Reported per building; the hall beat takes the first sample that is on walkable floor.
4. **Stair (§29.3)**: `IfcStairFlight` preferred, else `IfcStair` with rise > 1 m; cue = the GOING (long horizontal bbox
   side) as a dimension line at the stair's base z; the rise is never cued; the going runs the §27.3c guard against the
   datum's BAY figures too (Hospital: an 8.66 m going against an 8.69 m bay restates it — reported).
5. **Opening (§29.4)**: the modal `IfcDoor` leaf at 10 mm buckets (w = long horizontal side, h = bbox_z); cue = ONE placed
   instance of that type, two dimension lines (width across the leaf at mid-height, height), panel
   `IfcDoor · w × h mm · N of this type`. Windows are not cued (HHS has none — cannot generalise).
6. **Clear height (§29.5)**: the only cast, done on the DB (numbers from the DB, §2): at a point 2–10 m ahead of the camera
   along its heading INSIDE the hall component, the first element bottom above floor + 0.5 m among elements whose XY bbox
   contains the point = CLEAR height (its class reported); the first `IfcSlab/IfcCovering/IfcRoof` bottom = TOTAL height,
   logged, never cued (restates the storey datum). If clear == total (nothing hangs there) the point is skipped; if no
   point in reach has something hanging, the beat WITHDRAWS by name.
7. **Slots (§29.1 = 4, §14 across layers)**: hall first (first standing sample), then stair, door, clear height — each takes
   the (instance, sample) with the largest projected size (px ≥ 24, in frame) whose 2.7 s slot is free of every other
   layer's window (cues, plate, column, beam, hall). No fifth.
8. Rides Measure; 2D via the cues' exported drawers; never-kills-a-bake at every call site.

**29.9 ✅ W5 BUILT + WITNESSED (2026-09-08; `viewer/cpe_indoor_beats.js`, `witness_indoor_beats.js` Hospital 11/11, HHS 11/11;
logs `out/wib_hosp3.log`, `out/wib_hhs3.log`; sw v1167).** All four beats on both buildings, every slot free of every other
layer (§14 across layers), scored by legibility HELD over the envelope (indoors the camera walks past things):
| | Hospital (window 18.28–68.84 s) | HHS (window 7.00–89.68 s) |
|---|---|---|
| hall (§29.2/29.2a) | **18.28 s · Level 1 · 6,239 m²** of 6,481 storey walkable, **3,870 door cells blocked**, camera 1.75 m above floor; persisted 14.0 s, off at frame-out | **7.00 s · Level 2 · 2,100 m²** of 2,173, 1,044 door cells blocked, camera **0.04 m** above floor (the path skims the floor); persisted 59 s |
| clear height (§29.5) | **21.53 s · 5,498 mm under IfcBeam** (ceiling 5,850 mm logged, not cued), 9 m ahead | **40.99 s · 2,802 mm under IfcFlowTerminal** (ceiling 3,060) |
| stair going (§29.3) | **30.78 s · 9,723 mm** (rise 9,241, not cued) `180mm max riser 280mm going` | **9.74 s · 10,285 mm** (rise 5,334) `Massiv - Stufen Naturstein` |
| door (§29.4) | **62.78 s · 1,080 × 2,110 mm, 121 of this type** (instance 1,076 × 2,108) | **76.50 s · 930 × 2,130 mm, 81 of this type** |
| below-floor samples (§29.7.3) | 0 of 203 | 0 of 331 |
**Rules the runs forced (each measured first):** a stair's run ≤ 3× its rise or it is not a flight (Hospital offered a
99,896 mm "going" from a multi-storey stair group's box); the cast ignores railings/stairs/mullions/walls/openings
(the first hit was a balustrade box at 3,848 mm); a cue is scored by its minimum legibility over (t, t+1.1, t+2.1).
**⚠ §25 ADDENDUM — the datum's storey rules were 9.2 m too low on Hospital until this fix.** `§FLYTHRU_DATUM_ZDATUM`
anchored the local elevations (0–34 m) to the LOWEST element (a footing at 156.61 m); every storey's largest slab says
165.81 m (9/9 storeys, spread 0.08 m). Now anchored to the slabs. The Z chain (relative) was right all along; the
absolute placement of L1…L7 on the upright was not. HHS was already in the element datum. This is in the merged build
(PR #1697) and ships with W5's PR.

### 37. §MEASURE_TO_THE_END — W6 spec (2026-09-08). What measures after the indoor run, and what deliberately does not.
**Measured film structure, Hospital 195.8 s** (`§CINEMA_BEATS dive=0.094 out=0.353 pullout=0.361 flyback=0.462 round2=0.750
rise=0.959`, `§STOREY_REVEAL_WINDOW 0.9334–0.959`): datum + 2D cues + plate/beam 0–20 s · indoor beats 18–69 s (hall persists
to 32 s) · **pull-out/flyback 69–90 s: nothing** · cruise + discipline reveal 90–183 s: clash pair cards 157–183 s, no Measure ·
storey reveal 183–188 s: cards say doors/footprint · orbit 188–196 s. HHS (130.4 s): `out=pullout=flyback=round2=0.688`, so it has
NO pull-out stretch; its storey reveal runs 0.74–0.767.
**37.1 Storey cards carry the walkable area.** `A.storeyRevealStatsFor` adds `walk` = `storey_walkable_raster` area for the storey
(the same table §29.2 uses — mesh-derived, absent from the IFC); the card's first sub-clause becomes `walkable N m²`, the footprint
estimate follows. `§STOREY_REVEAL_STATS … walkable=N m²`. Witness: for every raster storey the card's figure equals the raster's own
`ftRasterArea`; a storey without a raster says so and omits the clause (never 0).
**37.2 The datum's second life — the setting-out sheet over the FINISHED building.** Window `[out, flyback]` in film seconds
(Hospital 69.1–90.5 s), only while the camera is OUTSIDE the structural envelope (§20.8, the same test as the entry latch, inverted).
Ramps in over 1 s, holds, fades over the last 2 s of the window. Sides/upright/plane are decided ONCE for THIS life at its first frame
(the camera is elsewhere now); the drop ledger and stability rules apply unchanged. §25.5.3 is satisfied here by construction — the
model is complete, so every figure states a finished thing. A zero-length window (HHS) prints `§FLYTHRU_DATUM_LIFE2 VACUOUS`.
**37.3 Deliberately NOT measured:** the discipline-reveal round (its subject is the MEP colour parade), the closing orbit (the
envelope figures were said at second 0 — again is inventory, §1), and the 90–147 s cruise (nothing is in frame long enough; a
future slot allocator may use it). After W6 the Measure-silent stretch on Hospital is 90–183 s, stated.

**37.4 ✅ W6 BUILT + WITNESSED (2026-09-08; branch `feat/measure-indoor` = squashed main + W5 + W6; sw v1168).**
- **Storey cards** (`witness_storey_walkable_card.js` 6/6 ×2): Hospital `doors · Level 1 | walkable 6,481 m² · 98.6×90.3 m footprint
  (estimate) · 4 rooms compiled`, L2 6,224, L3 6,097, L4 3,566; HHS L3 2,188; `Roof Level` omits the clause (no raster). Every
  figure equals the raster's own `ftRasterArea`.
- **The datum's second life** (`witness_datum_stability.js --life2` 8/8 ×2). MEASURED FIRST, and it moved the design: Hospital's
  camera is inside the building's plan (below the roof) for the entire pull-out and pull-back, 69 → 148.6 s; the first exterior
  frame is **148.6 s**, at the start of the reveal round. §37.2's "out→flyback" window holds no exterior frame at all. The life is
  therefore defined by measurement: it starts at the first exterior frame after flyback, holds as long as the opening did, fades 2 s,
  stops before the storey-reveal window. **Hospital 148.59–168.99 s** (over the reveal round — §37.3's exclusion is withdrawn by the
  measurement; the sheet is quiet drafting furniture around a colour parade), **HHS 89.72–100.07 s**. During the orbit marks come back
  in front of the camera: all 29 (Hospital) / 14 (HHS) rises are paid by the behind-camera ledger, one side decision per life.
- **⚠ ONE building box for both lives, and a behaviour change to rule on.** "Inside the building" is now the COLUMN GRID's plan
  below the top storey rule for the entry latch AND the second life (the structural box reaches 30 m past the grid on Hospital).
  Consequence: the opening datum on Hospital ends at **10.75 s** (camera reaches the roof line inside the plan) instead of the
  20.4 s hold the accepted 12 s film showed. HHS unchanged (6.58 s). If the user prefers the sheet to stay through the dive on
  Hospital, the entry test can add "below the top storey by one storey" — one line, witnessed by the same file.
**Measure-silent stretches after W6 (Hospital):** 12–18 s (dive after the datum ends; beam 6.5–9.2, plate 9.3–12.0 before it),
32–68 s except the indoor beats' 2.7 s slots, 90–148 s (pull-back), 169–183 s. Stated, not hidden.

**37.5 ✅ THE FULL HOSPITAL BAKE — all five boxes on, real GPU, 720p, 2026-09-08 (`out/Hospital_FULL_measure_2026-09-08.log`, film
`~/Downloads/Hospital_FULL_measure_720p_2026-09-08.mp4`, 4,699 f = 195.79 s, 107.7 MB, wall 5,122 s ≈ 85 min, 0 failures).**
Branch `feat/measure-indoor` @ `e4d16a24` (W1–W6). What the log says, layer by layer:
| layer | evidence |
|---|---|
| datum, opening | `§CLI_BAKE_OPENING kept=saved-view … 37/37 3/3 drawn=74`; `§FLYTHRU_DATUM_ZDATUM offset=165.81m (anchored to slabs, spread 0.00m)`; life 1 = 274 frames 0–11.34 s, drawn 74→58, **0 rises, one decision**; `§FLYTHRU_DATUM_ENTRY filmSec=10.75` |
| datum, second life | `§FLYTHRU_DATUM_LIFE2 start=148.70 end=169.10`; 489 frames, drawn 40→74, 31 rises **all paid by the behind-camera ledger (0 unpaid)**, one decision |
| slab beat | Level 6 @9.38 s, `meshesTouched=1`, label on 9.42 s, envelope done 11.59 s, label off 14.84 s (crossing left the frame) |
| linear beat | beam `9,605 mm 406x178x60UB` drawn 6.54–9.2 s; column NOFIT (stated) |
| indoor beats | hall tint 1,020 quads on Level 1 18.38–32.17 s (13.8 s, frame-out); clear height from 21.63 s; stair 30.38 s; door 62.89 s — all composited |
| 2D cues | `§FLYTHRU_CUE_BOX deprecated` for all; envelope/storey/corridor windows + `lockedAxes` printed; structural envelope 115.75 × 133.94 m |
| storey cards | `walkable=6481/6224/6097/3566/3418 m²` for L1–L5 in the reveal window |
| clash | `trueClash=270 markers=540` in the same frames |
| buildup clock | `placed=3142 @5.00 s, 9627 @10.00 s` vs the witness's 3149 / 9678 (≤0.5 %) |
Not pixel-measured (§26.12 still stands); this is the §-log of the shipped compositors. HHS full bake and 1080p await the user's go.
