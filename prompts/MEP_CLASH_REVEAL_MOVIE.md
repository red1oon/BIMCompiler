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

## CURRENT STATE — hardened summary, read this first (2026-09-06, end of session)
Three lanes are in flight, all dispatched off the same set of user requests this session, all real
work in real worktrees, none merged yet. This section is the one place to check status — read it
before re-walking the archaeology above.

| Lane | Worktree / branch | Request it answers | Status |
|---|---|---|---|
| §PENDING.2/.3/.4 | `/tmp/wt-clash-pending` · `fix/clash-pending-items` | Clash-list depth display, cross-caller narrowphase cache, tolerance sourcing + JSON editor reachability | Code + live real-GPU verification DONE (see §PENDING.2/.3/.4 CLOSED above). Item 1 (bake-time-estimate UI): 1080p (5,476s) and 720p (3,095s, confirmed clean this session — `fileOk=true`) both measured; UI display in `cinema_path_editor.js` not yet built. 1440p measurement bake user has EXPLICITLY HELD — **do not launch without a go-ahead**. Branch not pushed yet — holding for one combined PR. |
| §STOREY_HIGHLIGHT_REVEAL | `/tmp/wt-storey-reveal` · `feat/storey-highlight-reveal` | Final 5 real seconds before `orbit` begins: per-storey blue→green→yellow→orange tint + HUD card + caption, reusing the Find panel's landed storey semantic — confirmed NO Find-panel UI is ever opened (grep, zero hits) | Code + window correction + offline logic test (33/33) DONE. Waiting for GPU to run its own real-bake verification (self-polling `pgrep -af cli_silent_bake`) — not yet run, not yet pushed. |
| §PENDING.5b | `/tmp/wt-hud-stats` · `fix/hud-clash-measure-stats` | Fix the Clash HUD card; per-discipline-pair clash count cards; pullback-window highlight-by-discipline-pair synced to its own HUD card (same clock, never independent); "Measure tool saved measurements" HUD card | **DONE — PR [#1693](https://github.com/red1oon/bim-ootb/pull/1693), open and mergeable.** Real-GPU `--clip` verification, both bakes clean (`fileOk=true`). Root cause of the missing clash card: `bigStatsBuild()` ran BEFORE `clashFilm.build()` on every fresh bake, so `built:false` always dropped the card — reordered, fixed. `§CLASH_HUD_PAIR_CARDS pairs=7 [FP\|MEP=81 ARC\|STR=66 MEP\|STR=38 FP\|STR=38 ARC\|ELEC=29 ELEC\|MEP=14 ELEC\|STR=4]` sums exactly to `trueClash=270`. `§CLASH_HUD_HIGHLIGHT` fires 5 correct sync transitions. Measure card confirmed correctly absent (empty `A.measureLabels` on a fresh headless profile) — real, correctly-gated, narrow (see D's caveat in the body). Found-not-fixed: this plan's actual `riseSec=30.8s` (a seconds-override run), not the natural-duration `17.6s` quoted elsewhere in this file — the FRACTIONAL logic is duration-independent so this doesn't change any conclusion, just the absolute-seconds examples; also found `_inReveal`'s clip-local-vs-full-film fraction compare delays Reveal-round start on `--clip` runs — pre-existing, unrelated, flagged not fixed. |

**Boundary all three lanes now agree on, independently derived, cross-checked (not just asserted):**
`pullback` beat runs the discipline-pair clash highlight + its HUD cards; the last 5 real seconds of
`pullback` (ending exactly at `orbit`'s start, i.e. `beats.rise`) belongs to the storey reveal; `orbit`
itself is untouched by either feature (existing closing shot, no HUD override during it).

**The narrative hand-off, stated explicitly (user, confirming end-to-end coherence): the disc-by-disc
cycling ends by showing the FULL building back — every discipline's clash markers restored to plain
ambient (`highlightDiscPair(null)`, already wired as the transition-out call, "so no stale highlight
survives into the orbit/storey-reveal window") — and it is exactly THAT moment, full building visible
with nothing new happening, that is the 5-second lull the storey-by-storey reveal fills.** The three
lanes are one continuous shot, not three independent effects sharing a clock by coincidence: disc
clashes cycle → clash highlight releases to the whole building → storey colors cycle through that same
whole building → orbit. Each lane's own code already implements its half of this (confirmed above, not
re-derived here) — recorded together in one place because the individual specs were written separately
and this end-to-end read only became obvious once assembled.

**Sequencing note (user, mid-session): the 1440p resolution-timing bake is explicitly ON HOLD pending a
go-ahead.** Everything else (both agents' code, the 720p bench) may proceed/finish on its own schedule;
only that one specific bake needs the user's word before it launches.
