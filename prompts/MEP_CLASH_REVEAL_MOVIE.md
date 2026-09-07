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

### 10. ⛔ OPEN — what a new session must do first
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

## CURRENT STATE — corrected 2026-09-06 session 5 (supersedes the table that was here)
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
