# ARCHIVE — MEP Clash-Reveal Movie, closed band retired 2026-09-14
Everything here is CLOSED. The live file keeps only the compact recap plus §97 onward.
Read a section here only when you need the original derivation behind a bullet in the live file.

**New session, in this order:** §128 FIRST — everything below it is context for a beat that is still
wrong on frames. Then:
1. **§91.4 BEFORE running any bake** — every bake goes through `./bake_scope.sh` or it kills your
   session (§91: three consecutive deaths on 2026-09-13; §91.7: a scope also OUTLIVES a killed
   launcher, so reap stale ones).
2. **§94.7 before choosing a `--clip`** — the reveal window fraction is PER BUILDING. Hospital
   `0.9077..0.9590`, Terminal `0.7252..0.8390`, HHS `0.6877..0.7674` (§95.1).
3. **§98, §99, §100 — the live work.** The storey reveal is now a per-storey SECTION CUT (storey =
   outer loop, sweep = inner loop), not a tint. §100's rake is the newest and is UNJUDGED on frames.
   Code: worktree `/tmp/wt-storey-cut`, branch `feat/storey-section-cut`, based at `7833b639`;
   commits `f3d36dda` then `9a02db1c`; the rake itself was still uncommitted at hand-off. All local,
   nothing pushed, no PR.
4. **§93** for why the tint was abandoned (measured, at 1080p), **§97** for the user's standing
   rulings — no darkening, no gating of the clash/Sanity layers, no lit edge (§99.4).
5. STILL OPEN, none started: a hi-res bake of the finished beat; widening Hospital's window to
   `n x 2.0 s` (it uses 10.04 s of a 30.8 s pullback, §92.4, which would buy the full 1.5s+0.5s);
   the per-storey floor-slab card (§92.7/§96.5 — reuse `cpe_slab_beat.js`'s `footprintArea` and the
   §MEASURE_BOX, awaiting a yes); §99.6's XY-under-overhead A/B; and the blank `Reveal` HUD row
   (§93.8). Older closed work: §59 (end of the 2026-09-06 band). DONE + shipped, all verified on real bakes: §57.1
(combine), §57.4/§58.4/§58.4b/§58.4c (ARCH fade), §57.5 (camera-jump gaze smoothing), §58.5 (facade
highlight raster-boundary classifier), §59 (Structural Sanity + Egress findings baked into the film,
§59.5). TWO ITEMS STILL OPEN from §58: §57.3 (HHS cruise-beat flicker, ~74-76s) — read §58.2b FIRST,
it rules out the entire interior point-light system as the cause and names what to check next; §58.3
(storey darkening) has a verified live reproduction but the live probe ran on software rendering —
next step is verifying against the real hardware-GPU bake path. **§59.6 is a standing PRACTICE note
(not tied to any one bug) — read it before any future quick-check bake in this lane**: the canonical
silent-bake DB is `~/Downloads/<Name>_silent.db` (verify by `md5sum`, never substitute a same-named
file from a worktree's own `buildings/`), the canonical invocation is bare `--db --out --gpu real`
(the saved path already restores every feature flag — forcing them is redundant, not wrong), and the
established quick-check resolution is `854×480@15fps`, not an invented lower one.**

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

### §38-§56 RECAP (2026-09-08 to 2026-09-09 sessions, consolidated 2026-09-11 — full derivation in
`prompts/archive/MEP_CLASH_REVEAL_MOVIE_archive_2026-09-11.md`)
**Screen furniture + two new Measure beats, all shipped and witnessed:**
- **Three fixed boxes** (`viewer/cpe_film_boxes.js`) — HUD column, a Status box directly below it
  (Storey/Room/Build-up rows, never resized), and the Measure info panel, diagonally opposite the
  HUD. Nothing else writes 2D text to a frame except these three plus the clash-label exception.
  `witness_film_boxes.js` 12/12 at multiple resolutions/corners, including an anti-scope-blind guard
  that reads `_captureFrame`'s own source and fails on any unregistered composite call.
- **Plate area** (`cpe_slab_beat.js`) — the floor-plate beat's info panel states the real mesh
  footprint area (up-facing triangles, BatchedMesh-slot-aware), falling back to the walkable-raster
  area then the bbox product, always labelled by source. `witness_slab_beat.js` 18/18 nostream +
  streamed.
- **Fly-out beats** (`cpe_flyout_beats.js`, new) — wing spans + roof-edge-to-sill dimensions on the
  pull-out/pull-back's clean exterior canvas. `witness_flyout_beats.js` 12/12 Hospital, correctly
  VACUOUS on HHS (zero-length fly-out window there).

**The flicker saga (§42-§54) — FIXED, root cause confirmed by numeric instrumentation, not guessed.**
Five mechanisms were implemented, baked and measured-DISPROVED in sequence before the real cause was
found — recorded here so none of them is ever re-tried:
1. Plate's X-diagonal z-fight (§38.1a) — refuted, the collapse happened identically outside the plate.
2. The plate tint's per-frame `setColorAt` re-lerp (§38.1b/§44) — refuted, removing the tint changed nothing.
3. `depthWrite:true` on the datum's transparent ribbons (§42) — set false, zero effect on the real bug.
4. AO-pass (N8AOPass) writing the datum into its depth prepass (§46-§48) — excluded, only 42→36, not 0.
5. The datum's 3D ribbon group vs its 2D compositor — bisected (§50-§52): the 3D group is innocent
   (branch A only 42→36); the 2D canvas compositor is the whole cause (branch B: 42→0).
**Root cause (§54.2):** `cpe_flythru_datum.js`'s `plane()` transform had a depth guard (in front of
camera) but no LATERAL EXTENT guard — an anchor point close to the camera but off to the side produced
an affine basis 10x-300x the canvas width, scaling one mark into a giant colour blob for that single
frame. **Fix (§54.3):** `plane()` rejects any transform whose basis exceeds `4x` the canvas's largest
dimension (same skip-draw path as the existing behind-camera guard). Verified 0 jumps / max|ΔY|≈9 on
both a decoupled diagnostic bake and the real live-GPU production path — bit-identical to the
zero-flicker controls. **Process lesson earned here (§49.5), now standing practice:** bisect to the
LAYER (one-variable A/B) before theorising about the MECHANISM — a plausible code path is not a cause,
only a real A/B is; four of the five wrong mechanisms above were plausible code reads that were never
actually isolated with an A/B before being "fixed."

**§56's two items** (Measure box linger past a marker's own on-screen life; storey highlight still not
recognisable) were both carried forward and CLOSED in §58.1 (generalized linger) and §58.5 (raster-
boundary facade classifier) — see those sections for current state, not this recap.

### 55. 🏁 RESUME HERE — session close 2026-09-10. Storey-reveal reworked THREE times, ground shine-thru
added, datum shadow bug fixed, dimension labels fixed. TWO ITEMS STILL OPEN, read §55.6 first.
bim-ootb `feat/measure-boxes` @ **`7e4fa316`**, pushed, no PR. Worktree `/tmp/wt-storey-reveal`.

**55.1 STOREY-REVEAL'S THREE MECHANISMS, IN ORDER, TWO ABANDONED — do not re-try either.**
1. **x-ray** (original, shipped before this session) — whole building at `opacity=0.3` while a storey
   glows. Visually correct but expensive: DoubleSide+transparency during the ~10s window MEASURED at
   ~3.7-4.0s/frame vs a ~1.3-1.7s/frame baseline (clean isolated A/B, same clip, only x-ray toggled).
   Also went dark at the very end (last storey's own tint ceased before the window closed) — that
   ONE fix (§STOREY_REVEAL_LAST_STAYS_LIT, still live) is independent of which mechanism lights the
   storey and should NOT be reverted regardless of what happens to x-ray/facade.
2. **darken-above** (tried as a cheaper x-ray substitute — true per-storey x-ray is infeasible:
   `A._matCache`'s cache key has no storey component, so instanced/batched materials are shared
   across every storey using them) — colour-only darken/lite-transparency on storeys above the
   current highlight. **ABANDONED after two tuning passes** (0.12/0x14171c "too dark", then
   0.45/0x4a5162 "still very dark, not restoring, only near-camera side evident"). Root cause found
   by reasoning, not a third guess: instanced/batched tint is a per-instance ALBEDO colour via
   `setColorAt`, not emissive — still subject to normal diffuse lighting, so a face turned from the
   sun stays dark almost regardless of tint colour. **Structural limitation, not a tuning knob** —
   do not revisit darken-above without a per-instance emissive channel this codebase does not have.
3. **facade-only tint** (§FACADE_ONLY_TINT, SHIPPED) — the user's actual original ask, confirmed
   explicitly ("Yes. My original request prior"): tint only the storey's exterior-wall elements,
   touch nothing else. No x-ray, no darkening, no transparency, no per-pixel cost — an orbiting
   exterior camera already sees a facade directly, nothing needs to become see-through for that.
   Verified: 0 `§STOREY_REVEAL_XRAY` lines, speed back to baseline (~1.26-1.3s/frame) on both
   Hospital and HHS.

**55.2 FACADE MEMBERSHIP — a live geometric test, two real bugs found and fixed by MEASURING, not
guessing** (`_facadeGuidsFor` in `cpe_storey_reveal.js`). No `IsExternal` IFC property exists in
either building's DB (checked: 0 hits anywhere in the viewer) — facade is "does a wall's bbox touch
its own storey's wall-only footprint edge within 0.5m":
- **Bug 1**: footprint was pooled across the WHOLE BUILDING. Hospital has real setbacks (Level 1
  X-span 112.5m vs Level 7's 23.8m — a tapering hospital tower, MEASURED via direct SQL, confirmed
  real geometry not a data artifact) — only Level 1 ever touched that global edge; Level 2-5 read
  `facadeWalls=0 VACUOUS`. Fixed: footprint now computed from elements on THAT STOREY ONLY.
- **Bug 2**: even per-storey, the footprint still pooled columns/slabs/beams, whose overhangs sit
  past where walls actually are — Level 3's closest wall measured 1.67m off that footprint, Level
  7's (a small penthouse) 4.54m off. Fixed: footprint now derived from **WALLS ONLY** — by
  construction the outermost walls then sit at exactly 0.0m (VERIFIED by direct SQL on every one of
  Hospital's 8 storeys AND HHS's 3 real storeys before ever baking it).
- Final state, both buildings, all real storeys have `facadeWalls > 0`; the one correct `VACUOUS`
  left is HHS's Roof Level (0 walls — a roof genuinely has no walls, that is the right answer).
- **Abstractness checked explicitly** (this session's own ask): grepped every touched file for
  hardcoded building/storey names — every hit is a COMMENT citing a past measurement ("MEASURED on
  Hospital..."), zero hits in actual code paths. The query uses only generic IFC classes
  (`IfcWall`/`IfcWallStandardCase`/`IfcCurtainWall`) and a `?`-parameterised storey name. Cross-
  building validation ran on Hospital (8 storeys) and HHS (3 storeys + a vacuous roof) — see §55.5
  for the exact films.

**55.3 OTHER FIXES THIS SESSION (unrelated to the x-ray/facade question, all still live):**
- **§DATUM_NO_SHADOW** (`effects.js` + `cpe_flythru_datum.js`) — the datum's ground/upright ribbons
  had NO exclusion from either of effects.js's two shadow-forcing sweeps
  (`_reassertPhotoShadowCoverage`'s per-tick reassert, and the one-time `_shadowList` sweep), unlike
  the AO pass which already has `userData.excludeFromAO`. They were casting real shadows onto the
  building — a plausible mechanism for "dark grid lines"/"rogue" sightings. Both ribbons now carry
  `userData.excludeFromShadow`, respected by both sweeps. MEASURED: `visMeshes` count dropped ~2-3
  (the ground+2 upright meshes) after the fix, same clip, before/after.
- **§GROUND_SHINE_THRU** — the ground ribbon's `depthTest` was left `true` (deliberate, §17.5 —
  "occlusion reading is the point of the opening"), but a raycast witness
  (`out/tap_ground_raycast.js`, 142 checks across filmSec 0.0-179.6s, camera position varying wildly)
  measured it **100% occluded by the building's own walls from every exterior angle tested**,
  including the OPENING's own saved view previously logged as "FULL — legible from the saved view"
  (that log only ever checked "behind camera", never real occlusion by other scene geometry — a
  genuine blind spot, now known). User's call, since it fades within seconds anyway: `depthTest:
  false` on the ground ribbon ONLY (upright plane keeps `true` — never measured as a problem there),
  same "shine through walls" technique `clash_film.js` already uses for its markers.
  ⚠ **A 2x width boost was tried first, then FULLY REVERTED** once shine-thru made the ORIGINAL
  width actually visible for the first time and the user judged it correct as-is ("it was OK before,
  need no fix"). The "thin" complaint the whole investigation started from was never actually about
  width — it was about the ribbon being invisible. Do not re-apply a width multiplier without new
  evidence.
- **Z-plane near/far** (`cpe_flythru_datum.js`) — `zNearX`/`zNearY` used `>` (picking FAR) despite
  the "near" name. Fixing `zNearX` alone (the within-plane X-extreme axis, which end of the ribbon
  labels cluster toward) is safe. **A first attempt also flipped `_camNear` and `zNearY`, which
  relocated the WHOLE visible upright ribbon plane to the other side of the building** ("moved the
  whole Z plane to the left front, hard to view") — reverted; only `zNearX` stays changed. Added
  **`§Z_PLANE_WITNESS`** — a `MATCH`/`MISMATCH` log line comparing the 3D ribbon's actual visible
  Y-face (from `_camNear`, decided in `flythruDatumAt`) against the 2D label's target Y (decided
  independently in the compositor) — these are two separate calculations that happen to need to
  agree, and silently disagreeing is exactly the bug class that shipped once already. Check this
  witness before ever touching either near/far decision again.
- **Dimension labels** — figures were a bare number with no unit and no way to tell an X bay from a
  Y bay from a storey height ("gridlines? then why not just label as such"). Now read
  `"<axis> <value>mm"` e.g. `"X 9,144mm"` (`axisKind` parameter threaded through `axis()`, spacing
  budget widened `digits` 6→9 to keep the existing collision-avoidance math honest against the wider
  text).
- **Clash pulse** (`clash_film.js`) — visible portion (rise+hold+fall) halved 6.0s→3.0s, same 2:1:3
  shape ratio, `REST_S` deliberately UNCHANGED per "same pause, shorter appearance". Duty cycle was
  75% visible/25% dark, now 60%/40%. User chose this over dropping clash pulsing entirely — it is
  the one thing on screen that visually says "these are the flagged clashes" in a clash-reveal film.

**55.4 A REAL METHODOLOGY LESSON FROM THIS SESSION, worth keeping**: a naive full-frame pixel diff
between TWO SEPARATE bake processes is NOT reliable evidence for a subtle single-element question —
MEASURED 12-25% of the frame differing between two bakes that should have been identical except for
one tiny ribbon's visibility, because AO/TAA rendering is not perfectly deterministic run-to-run.
Geometric tests (raycasting from the live camera to known world points, run inside ONE page/process)
are the reliable tool for "is X actually visible/occluded" — they are unaffected by render noise.
Reach for a raycast witness before a cross-process pixel diff for this class of question.

**55.5 STATE — films, all in `/tmp/wt-storey-reveal/out/` and copied to `~/Downloads/`:**
`Hospital_last20s_facade_2026-09-10.mp4` (facade-only tint, all 8 storeys, wall-only footprint fix —
the CURRENT shipped mechanism), `Hospital_opening20s_2026-09-10.mp4` (ground shine-thru + new
dimension labels + shorter clash pulse, real first 20s via `--clip`, not `--seconds` — that flag
re-paces the WHOLE plan rather than clipping the real timeline, confirmed by mismatched datum
life-cycle timing when tried once), `HHS_storeyreveal_facade_2026-09-10.mp4` (cross-building
validation, clean). Older films from the abandoned x-ray/darken-above attempts are NOT worth
re-watching — §55.1 already tells you why each was dropped.

**55.6 ⛔ TWO ITEMS STILL OPEN, straight from the user after watching the CURRENT (facade-only) films
— resume here:**
1. **"The storey reveal is still not highlighting much to be seen."** Facade-only tint touches only
   3-16 wall elements per storey (MEASURED, §55.2's counts) — a much smaller lit area than the old
   whole-storey tint by design, and apparently too subtle to read clearly on screen. NOT YET
   INVESTIGATED: whether this needs a stronger/brighter colour, a thicker apparent highlight (e.g.
   an outline or edge-glow on the facade elements rather than a flat tint), or genuinely more
   surface area (curtain wall mullions/panels, window frames — currently only
   `IfcWall`/`IfcWallStandardCase`/`IfcCurtainWall` are queried, `IfcWindow`/`IfcDoor`/curtain-wall
   sub-elements are NOT included and may be worth adding). Do not guess a fix — extract a witness
   first (e.g. count total facade surface area vs total storey surface area, or sample actual
   on-screen pixel coverage of the tint) before picking a direction.
2. **"The others get blackened that confuses."** ⚠ Per code review, THIS SHOULD NOT BE HAPPENING —
   facade-only tint (§FACADE_ONLY_TINT / `_applyTint` as shipped) touches ONLY the current storey's
   facade GUIDs; nothing else in the scene is modified, no darkening, no dimming, no x-ray call
   exists anywhere in `cpe_storey_reveal.js` as of `7e4fa316` (grepped clean, see §55.2). Three
   possibilities, UNRESOLVED, in the order to check first:
   (a) the user was looking at a STALE/wrong film (an x-ray or darken-above era film, several of
       which are still sitting in Downloads from earlier this session — see §55.5's "not worth
       re-watching" list);
   (b) this is the building's own NATURAL night-time base lighting (weak pool-light ambient,
       `poolLit=200`, MEASURED as genuinely dark even in fully untouched pre-Measure bakes earlier
       this session) being misread as something the storey-reveal code did — if so the fix is a
       lighting/exposure question for that beat, NOT a storey-reveal code question at all;
   (c) a genuine bug not yet found. **FIRST TASK for the next session:** confirm the user is viewing
       `Hospital_last20s_facade_2026-09-10.mp4` specifically (re-send if any doubt), then if the
       "blackening" is still visible THERE, extract actual frame luma/colour samples from OTHER
       (non-highlighted) storeys at that exact timestamp and compare against the SAME storeys'
       appearance BEFORE the reveal window starts in the SAME film — a real code-caused blackening
       would show a measurable, localized difference; natural night lighting would not, since it
       would look the same before and during the window. Do not add code changes for this until
       that comparison exists.

**55.7 ⛔ NEW, UNINVESTIGATED — a real flicker burst on HHS, NOT the same bug as §46-§54.** Both
buildings' full 1080p/24fps all-on bakes ran clean end to end (`unconverged=0`, no errors) and both
passed `probe_film_flicker.py` on reveal round / storey reveal / orbit (0-1 jumps each — §46-§54's
fix and today's facade-only tint are confirmed NOT regressed). But HHS's own run
(`out/HHS_FULL_1080p_2026-09-10.mp4`, also copied to `~/Downloads/HHS_FULL_1080p_2026-09-10.mp4`)
measured **25 jumps tightly clustered at filmSec 74.38-76.38s in the "cruise" beat, max|dY|=111.1**
— higher than the ORIGINAL §42-§54 bug's own worst measurement (59.6-63.6) ever was. Hospital's
equivalent full bake shows nothing like this (one isolated 31.4 jump at a beat boundary, not a
cluster). **Not investigated at all yet** — no hypothesis, no bisect, nothing ruled out. This is a
DIFFERENT defect from the datum-ribbon flicker §46-§54 solved (that fix demonstrably holds on both
buildings) — treat it as a fresh investigation, starting the same way §46-§54 eventually succeeded:
bisect the LAYER first (which Measure/cinema layer, if any, is even active in that window — check
the log for what's actually drawing at 74-76s on HHS) before theorising about a mechanism. First
command to run: `python3 scripts/probe_film_flicker.py out/HHS_FULL_1080p_2026-09-10.mp4 --win
"cruise:70:80"` for a closer look, then read the raw log around filmSec 74-76 for whatever is live.

### 57. ⛔ RESUME HERE (2026-09-11) — user watched `HHS_lowres_storeyreveal_2026-09-10.mp4` (854×480@15fps,
worktree `/tmp/wt-storey-reveal`, branch `feat/measure-boxes`) and reported §56.1/§56.2 UNCHANGED, plus
3 new items. **User's own words: "DO not fix, just update the prompts/# firsts to review as this has
been tricky for first two."** Nothing below is implemented — every item is spec/evidence only, same as
§56 was. Do not re-derive what's already measured here; extend it.

**57.1 §56.1's combine fix was INCOMPLETE — it only combined height into hall's box, not stair or door.**
User: *"Seconds 17th there is a length been measured but does not appear below the present Measure in
the info box together."* MEASURED on this exact session's own HHS bake (`out/HHS_lowres_storeyreveal_
2026-09-10.log`) — hall and stair draw the SAME frames, exactly the collision §56.1 was supposed to
close:
```
§INDOOR_BEAT_DRAW key=hall  filmSec=17.01 op=1.00 area=2,100m2
§INDOOR_BEAT_DRAW key=stair filmSec=17.01 op=1.00 going 8,944 mm
```
(`§INDOOR_BEAT_PLAN beats=3/4 [hall@9.46 stair@16.21 door@28.46]` — hall's own §29.6 persistence runs
9.46→25.28s, far longer than its own 2.7s §14 reservation, so ANY later beat scheduled just outside
that reservation — stair, door, or height — still lands inside hall's real on-screen life. This is
structural, not a fluke: whichever of stair/door/height fires next while hall is still up will hit
the same collision height did.)
**The fix shipped in `cpe_indoor_beats.js`'s `indoorBeatsCompositeOntoCanvas` only special-cased
`b.key==='height'`** (`heightCombinedByHall` flag, hall's own branch appends `heightBeat.label` when
`envAt(filmSec-heightBeat.sec)>0`). **Generalize it**: loop `_beats` for ALL non-hall beats concurrently
live (`envAt(filmSec-b.sec)>0`), append EACH's own row to hall's post (title stays `'Hall-Corridor'`),
cap at `MEASURE_ROWS=4` total rows (hall's own 2 + up to 2 more — stair/door/height are mutually
exclusive in practice since §14 rarely schedules two of them inside the same instant, but code
defensively for >2 anyway: take the earliest-scheduled extras that fit, name the rest the same way
the box's own "ALSO_POSTED" convention already does for a genuine same-frame collision). Suppress each
combined beat's own solo post the same way (`combinedByHall[b.key]=true`, checked before the generic
branch's own `A.flythruDrawPanel` call) — keep the existing FALLBACK (solo post) for whichever
beat(s) hall does NOT cover (hall already off, or `_beats` order edge cases). Re-run `witness_indoor_
beats.js` after — its own invariants only check the `drawn` COUNT (never row content), so this should
stay green untouched, but run it for real proof, not by this same reasoning alone.

**57.2 Facade highlight "still disturbs ie darken black some other storey wall" — THIRD report of the
same symptom** (§55.6 item 2 → §56.2's own restatement → now this). Two SEPARATE, both-real issues are
in play here, do not conflate them:
- **Weak/small highlight** (§56.2's own measurement, unchanged, still true): facade tint covers only
  1.8-8.4% of a Hospital main floor's own total wall area (bbox-edge classifier under-selects on a
  non-rectangular/tapering footprint) — a legibility problem with WHICH walls get selected, separate
  from the point below.
- **Something ACTIVELY going dark** — this is the part re-reported three times now, and code review
  (§55.6(c), and re-confirmed this session) still finds NO code path that writes a dark/negative tint
  anywhere in `cpe_storey_reveal.js`: `storeyRevealApplyVisual` only ever calls `_applyTint(vis.storey,
  vis.color)` (never a "darken" call) and `vis.dark` (the §STOREY_REVEAL_PULSE cease-phase) means
  "don't tint this instant" — `_restoreTint()` puts the ORIGINAL material/colour back, it never paints
  black. **RULED OUT this session, verified from source, don't re-propose**: a plausible-looking
  candidate was that `InstancedMesh.setColorAt`/`BatchedMesh.setColorAt`'s FIRST-EVER call on a mesh
  lazily allocates its colour buffer and could default every untouched instance in that shared mesh
  (i.e. every OTHER storey sharing the same batched geometry) to black. Checked directly against this
  project's own vendored build, `viewer/lib/three.core.min.js`:
  ```
  setColorAt(t,e){return null===this.instanceColor&&(this.instanceColor=new $a(new
    Float32Array(3*this.instanceMatrix.count).fill(1),3)), ...}          // InstancedMesh
  _initColorsTexture(){... new Float32Array(t*t*4).fill(1) ...}          // BatchedMesh
  ```
  Both lazy-init to **`.fill(1)` — white**, not zero. This theory is dead; do not spend time on it again.
  **STILL NOT DONE, three reports in a row now — this is the actual next step, not another theory**:
  §55.6(c)'s own diagnostic was never run. Extract real frame luma/colour samples from an UN-highlighted
  storey's walls at the exact timestamp the user is watching, and compare against the SAME storeys'
  appearance BEFORE the reveal window opens in the SAME film (`probe_film_flicker.py`'s own luma-sampling
  approach is the right shape of instrument, adapted to sample specific screen regions rather than
  whole-frame mean). A real code-caused blackening shows a measurable, localized, TIME-CORRELATED
  darkening; natural night-scene base lighting would look the same before and during the window. Do not
  add another code theory before this measurement exists.
  **One genuinely new, UNVERIFIED lead worth checking if the luma test confirms a real localized
  darkening**: whether `A._instanceMeta[mesh.id]`/`A._batchMeta[mesh.id]`'s per-index `{storey, guid}`
  metadata can ever be stale or mis-mapped relative to the actual instance/slot index `_applyTint`
  writes to — i.e. tinting (or later mis-restoring) the WRONG instance because the index-to-storey
  table disagrees with the mesh's real instance order. Not traced this session (would need to read
  wherever `_instanceMeta`/`_batchMeta` gets built, likely scene.js) — named here so it isn't
  rediscovered from zero, not because it's confirmed.

**57.3 Flicker still present (user, 2026-09-11): "There is still slight flicker as reported before but
it has to be solved."** This is §55.7, still fully unresolved (no hypothesis, no bisect, as of that
entry) — REINFORCED this session with a second, independent measurement. Ran `probe_film_flicker.py`
on this session's own fresh HHS bake (854×480@15fps — note the probe defaults to `--fps 24`; re-run
with `--fps 15` for this file or every printed timestamp is wrong):
```
python3 scripts/probe_film_flicker.py out/HHS_lowres_storeyreveal_2026-09-10.mp4 --fps 15
§FILM_FLICKER_WIN cruise  60.01- 97.85s jumps>15=25 (0.66/s) max|dY|=125.0  74.27 74.33 74.40 74.53 74.60 74.67 74.80 76.27
```
**25 jumps clustered at filmSec 74.27-76.27s** — essentially the SAME count and the SAME absolute
film-second window §55.7 already measured on a completely different HHS bake (1080p/24fps, full-length
run: **25 jumps at 74.38-76.38s**). Same building, but different resolution/fps/duration/settings —
the cluster's absolute timing barely moved. That is strong evidence this is deterministic and tied to
the CRUISE BEAT'S OWN internal structure (a sub-beat boundary, a fixed-timed effect inside cruise) more
than to frame rate, resolution, or anything render-load-dependent — a real lead for the bisect §55.7
already prescribes and nobody has started: check the log for what layer is actually drawing/active at
74-76s in the cruise beat on either bake, before theorising about a mechanism.

**57.4 NEW — user wants a 2s FADE, not a cut, when a Reveal round drops a discipline (their example:
ARCH).** User: *"When going to Reveal without ARCH, the ARCH elements should fade off rather than cut
off. Give me a 2 sec fade be good to give impression it is not arupt or a new cut in the movie."*
MECHANISM, traced this session: `A.cpeRevealVisualAt` (`effects.js:5919`) is what puts a discipline
into its 'ghost' phase (ARC/STR drop out once round 2 reaches `b.flyback`, per §CPE_REVEAL_ARCH_HOLD);
the actual show/hide happens in `A._applyDiscVisibility` / `A.filterInstancedMesh` / `A.filterBatchedMesh`
(`panels.js:816+`), which is a **pure boolean `.visible` toggle** across regular/Instanced/BatchedMesh
alike — there is no opacity ramp anywhere in that path today. This is a KNOWN, already-documented
architectural limit, not an oversight: effects.js's own comment right above `CPE_REVEAL_FADE_SEC`
(~line 5653, §CPE_DISCIPLINE_REVEAL_FADE, 2026-08-16) says it outright — *"no per-element opacity
channel exists in this pipeline (Instanced/BatchedMesh share ONE material per batch, so animating
opacity would fade the WHOLE batch, not just the disc entering/leaving). This is the closest honest
approximation to a fade with that real constraint."* The existing MEP-to-MEP parade transitions already
hit this exact wall and settled for `CPE_REVEAL_FADE_SEC=0.4` — both disciplines visible together for
0.4s at a slot boundary, explicitly documented as NOT a literal dissolve. A true 2s alpha fade needs
NEW plumbing this pipeline doesn't have yet, and the right approach likely differs by mesh
representation: a REGULAR (non-instanced) mesh can get a real per-object opacity animation today
(Three.js supports it natively, nothing stops it); an Instanced/BatchedMesh cannot the same way —
`instanceColor` is RGB only, no alpha channel, so a per-instance fade would need either a shader change
or the same "dual-visible overlap" approximation already in use. **Before implementing: measure what
fraction of ARCH's own elements are regular vs Instanced/BatchedMesh** (same kind of count this session
already ran for facade walls, §56.2/§57.2 — reuse that method) — that number decides whether a real
2s fade is fully achievable, partially achievable (real fade on regular meshes, 0.4s-style overlap on
the rest, which will look inconsistent between element types on the SAME discipline), or needs a
different technique (e.g. a 2D compositor-side cross-fade between two captured states, if that's even
feasible inside `_captureFrame`'s single-pass-per-frame design — not checked this session).

**57.5 NEW — a camera-path jump/stick somewhere in some bakes.** User: *"Some part of the movies at a
stick in the path, there seems to be a jump or cut. Make in between frames to be smoother perhaps few
frames between camera jumps."* No specific timestamp or building given — get one if possible, it
narrows the search enormously. The RIGHT instrument already exists and matches this project's own
hardened law (camera motion is judged by real position/tilt/rate numbers, never by eye — CLAUDE.md
"FUNDAMENTAL LAW", 2026-07-21): every bake already writes a `<out>_poses.json` sidecar, one row per
frame `[frame, x, y, z, tx, ty, tz, wallMs]`. **Tried this session, and it's the wrong shape of test —
say so plainly so it isn't re-tried the same way**: a naive global "frame-to-frame step size vs the
whole film's median" pass on this session's own HHS poses.json flagged 208 "outliers," ALL of them in
the dive beat — a false-positive class, not a finding, because dive is *supposed* to move fast (~2m at
15fps by design) and a flat global threshold cannot tell "this beat is just fast" from "this frame
actually jumped." **The real test needs a PER-BEAT baseline** — compare each frame's step (or better,
heading/acceleration) against THAT BEAT's own local expected rate, the same class of check
`witness_cpe_even_turn.js`'s jerk-cap (`1.5 * PACE_SWING`) already does for turn rate elsewhere in this
exact pipeline (§CPE_PACE_SWING_SOFTEN, above) — adapt that math, or extend `probe_film_flicker.py`'s
own per-window approach, rather than a flat global-threshold pass on raw position deltas. `poseAt`
(`effects.js:8197`) is a heavily hand-tuned analytic function per beat (dive/spin/walk/orbit each have
their own easing, plus `_cinemaGazeBlend`'s slerp-like look-at blend at beat handoffs) — if there IS a
real kink, it is most likely at a BEAT BOUNDARY handoff (where one analytic segment hands off to the
next), not mid-beat, so a per-beat-relative jerk/heading-rate check at those specific seams is the
highest-value place to look first once a candidate timestamp exists.

### 58. RESUME HERE (2026-09-11, later same session) — user said "solve as many listed here." Worktree
`/tmp/wt-storey-reveal`, branch `feat/measure-boxes`, uncommitted. One item shipped and verified, two
got real progress with an honest verified-negative on the first attempted fix for one of them — read
§58.2 before touching the flicker again, it saves re-discovering a dead end.

**58.1 ✅ DONE, VERIFIED — §57.1's combine generalized to any concurrent beat.** `cpe_indoor_beats.js`'s
`indoorBeatsCompositeOntoCanvas`: hall's branch now loops all of `_beats` for whichever of
stair/door/height is concurrently live (`envAt(filmSec-bb.sec)>0`) and appends each's row, capped at
`A.filmBoxesMeasureRowCap` (new export, `cpe_film_boxes.js`, = `MEASURE_ROWS`). Each combined beat's own
solo post is skipped (`combinedByHall[key]`); falls back to solo when hall isn't concurrently active
(off, or not yet started) — same robustness §56.1's height-only version had, just generalized.
**Verified**: `witness_indoor_beats.js` 11/11 PASS on HHS (real puppeteer run, real DB) — no regression.
`witness_slab_beat.js` 18/18, `witness_flyout_beats.js` 12/12 — also clean (these exercise
`filmBoxesMeasurePost`/queue behaviour §57.1 touches indirectly). `witness_film_boxes.js` extended
with 2 new invariants proving §56.1's own linger claim (holds up to `LINGER_S`=2.2s past a marker's own
post, clears after) — 14/14 PASS.

**58.2 ⚠ FLICKER (§55.7/§57.3) — REAL MECHANISM FOUND, first fix attempt VERIFIED INSUFFICIENT, do not
re-try the same one.** Traced via the real HHS bake's own log (`out/HHS_lowres_storeyreveal_
2026-09-10.log`): `§NIGHT_BUILDUP_GATE ... lit=30` immediately followed by `lit=50` at the SAME logged
instant, repeating every frame. Root mechanism, confirmed by reading the actual source (not guessed):
`A._nightUpdateLights()` (`tools.js`) is called from **at least three** places inside one baked frame's
own cycle — `_teardownStillRefine` (`effects.js` ~L4551, NAV light budget, right before
`A.controls.update()` moves the camera for the next pose) → `A.startStillRefine` (`effects.js` ~L5273,
STILL/bake budget, once refine restarts for the new pose) → `_bakeFillPin`'s own deliberate per-frame
call (`effects.js` ~L2750, gated on `A._maxqActive`, this one already instruments its own before/after
`poolLit` drift). The first two are BY DESIGN (stop with the nav budget, restart with the bake budget)
— not a leak — which is exactly why a narrow fix is hard: this is architecture, not a stray call.
**Also found and independently patched**: `tools.js`'s `A._nightControlsListener` (a NAV-only reactive
`A.controls` 'change' listener, 5m-movement debounced) ALSO fires during a bake, since
`A.controls.update()` runs every baked frame — guarded it behind `if (A._maxqActive) return;` (same
anti-pattern class as §19's markDirty rule). **MEASURED, re-baked HHS at identical settings
(`out/HHS_lowres_v2_2026-09-11.mp4`/`.log`) to check it, and the honest result is a PARTIAL, not full,
fix**: same-frame `lit=X` disagreements dropped 1079→935 (real, ~13%, this listener WAS contributing
something) but `probe_film_flicker.py --fps 15` on the cruise beat is UNCHANGED — 24-25 jumps, same
~74-76s cluster, before and after. **Kept the guard** (real measured improvement, zero regression,
matches established doctrine) but do NOT report it as "the fix" — it isn't. The ~935 remaining
disagreements are the `_teardownStillRefine`/`startStillRefine` round-trip itself. **Next step, not yet
done**: trace exactly when `_captureFrame` grabs the canvas relative to those two calls — does the
captured frame consistently land on the SETTLED (post-restart, topped-up) state, or does it sometimes
catch the torn-down NAV-budget one? That timing relationship, not another guess at a third caller, is
what decides whether this is fixable by re-ordering vs. needs the capture itself to wait for settle.

**58.2b ⛔ SECOND ATTEMPT ALSO VERIFIED INSUFFICIENT (2026-09-11, later same session) — user asked to
"resolve right away," pursued a second real lead, it did not work either. Read this BEFORE proposing a
third theory — it rules out an entire mechanism, not just one fix.** New finding while investigating:
`§BAKE_INTERIOR_TOPUP`'s own `inFrustum` count sweeps SMOOTHLY through the flagged window (measured:
49→48→47→…→21→22→23→…→44, a clean monotonic dip-and-recover as the camera pans) while `toppedUpTo`
stays pinned at the budget (50) throughout — the TOTAL lit count is stable. But the fixture→pool-slot
assignment in `A._nightUpdateLights`'s bake-only branch (`tools.js`) was **raw positional index**
(`_pool[_pi] = needed[_pi]`), and `needed` is rebuilt fresh every frame — so even with a stable total
count, INDIVIDUAL PointLight objects were teleporting between different physical fixture positions
every frame, because `needed[3]` this frame is rarely the same fixture as `needed[3]` last frame. Fixed
by giving each fixture's position object (stable references, confirmed via
`A._nightFixtureWorldPositions`'s own memoization) a FIXED pool slot via a `Map` (`A._nightBakeSlotByPos`),
reassigning a slot only once its fixture actually drops out — the exact same technique
`§NIGHT_LIGHT_CHURN_FIX`'s `A._nightLightByPos` already ships for the INTERACTIVE/nav path, just never
applied to the bake-only frozen pool. Mechanically sound, zero regression risk (only changes which slot
holds a fixture's data, never which fixtures light or the total count).
**MEASURED, re-baked HHS a third time** (`out/HHS_lightfix_2026-09-11.mp4`/`.log`, identical settings):
`probe_film_flicker.py --fps 15` cruise-beat jump count went 25→24→23 across the three bakes (baseline →
listener-guard → slot-fix) — statistically flat, and **the flagged frame TIMESTAMPS ARE IDENTICAL across
all three independently-built bakes**: 74.27, 74.33, 74.40, 74.53, 74.60, 74.67, 74.80, 76.27s, every
time. **This identical-timestamp fact is the important finding, more than either fix's own failure**: a
real race/nondeterminism (either theory's own mechanism) would shift WHICH frame wins between separate
runs with different code — getting the exact same frame list three times in a row means this is fully
DETERMINISTIC, tied to camera pose/geometry at those specific instants, and is almost certainly **not a
lighting-selection race at all**. Also checked and ruled out in this same pass: `§PHOTO_SHADOW_
FORCE_REASSERT` (`visMeshes=183 flippedOn=0`, dead flat through the whole window) and `§TRIPLANAR_PERF`
(`materials=17`, dead flat) — neither shadow-casting mesh count nor triplanar material count does
anything unusual there either. **Kept the slot-assignment fix anyway** (it is objectively more correct
regardless — stable-slot assignment is never worse than positional teleporting — and the user chose to
ship rather than revert it), but it is NOT the flicker's cause and must not be re-reported as fixing it.
**For whoever picks this up next**: stop looking at the interior point-light system entirely — two
independent, code-verified mechanisms in it have now been ruled out by direct measurement. The
determinism is the lead: something ELSE, tied deterministically to camera pose at filmSec≈74.3-76.3s in
this specific plan (not lighting, not shadow-mesh-count, not triplanar-material-count), causes a real
luma jump there. Candidates not yet checked: AO/GI sample convergence at a specific camera distance/
angle, LOD or streaming-tier switches, a specific mesh's `renderOrder`/depth-sort flipping at a camera
crossing point, or the clash-marker/label system (`CLASH_LABELS` also fires busily in this window, not
yet inspected). Bisect by ELIMINATING SYSTEMS ONE AT A TIME on a `--clip` window around 70-80s (checking
§55.5's own caveat: `--clip` re-paces the whole plan, so a direct clip won't reproduce the SAME absolute
filmSec — confirm the re-paced window's own log timestamps before trusting a clipped bake's flicker
probe output) rather than theorising about a specific mechanism again.
**Incidental finding, unrelated to the flicker but worth a line**: `viewer/tests/witness_bake_interior_
topup.js` (the one witness that DOES cover the code touched this session) is currently STALE — its own
mock `A` object never defines `A._tmIsVisible`, and the shipped `_nightUpdateLights` now calls it
unconditionally in its `visPos` filter; confirmed via `git stash` that this throws identically on the
pre-session code too, so it predates this session and is not something introduced here. Needs a
one-line mock fix (`_tmIsVisible: () => true`) before it can prove anything about future changes to this
function — flagging it so nobody assumes this witness is currently green when it cannot even run.

**58.3 ⚠ STOREY DARKENING (§55.6/§56.2/§57.2) — REPRODUCED LIVE for the first time, with an important
caveat on the rendering backend.** User: "There should be no darken at all, just highlight the facade of
each." §57.2's own mandated diagnostic (frame luma vs. real timing, never eyeballing alone) finally ran:
extracted real frames from `out/HHS_lowres_storeyreveal_2026-09-10.mp4` around the ACTUAL storey-reveal
window (found via the real `§STOREY_REVEAL_TIMING`/`§STOREY_REVEAL_WINDOW` log lines — **not** the
generic beat-fraction windows `probe_film_flicker.py` prints, which do NOT match this plan's own real
`plan.beats` and gave a badly wrong window estimate at first — a real methodology trap, noted so it
isn't repeated: always derive the window from THIS run's own §-tagged values, never from the probe's
generic labels). Frame-diffing two consecutive frames (t=115.267→115.333, 66ms apart) at the real
storey-transition instant shows an actual facade panel — light gray/beige — turn **solid black** in one
frame, dead centre between the two glazed sections (`§57.2`'s hotspot-grid method located it; the
before/after pair is saved for the record). This is a REAL, code-caused, timing-coincident defect, not
a stale-film misread and not natural night lighting (§55.6 possibilities a/b both ruled out by this
measurement) — three user reports were right.
Built a live, no-full-bake reproduction (`A.cinemaPathPlan`/`plan.poseAt`/`A.storeyRevealApplyVisual`
called directly in a puppeteer page, same trick `witness_indoor_beats.js` uses) to raycast the exact
dark spot and read its live material — took real iteration to get right, both traps worth recording so
they aren't re-hit: (1) `A.cinemaPathPlan` must be primed with a THROWAWAY call before reading
`A._getCinemaPathEdit()` (`cinema_maxq.js`'s own `__maxqBake` 'db:cinema_path' branch does this —
skipping it silently builds the plan from an empty/default override, nowhere near the real authored
path); (2) build the plan EXACTLY ONCE and never again after the camera has moved — a second
`cinemaPathPlan()` call re-derives pivot/orbit radius from the CURRENT (already-relocated) camera and
each call then disagrees with the last, never converging. With both fixed, the reconstruction's
`plan.beats.rise`/`plan.storeyReveal.windowFrac` matched the real bake's own settled log values exactly
(0.9099/0.0309) — proof the reconstruction is faithful pose-for-pose.
**Found**: at tn≈0.8883 (right at the Level 1→Level 2 transition), the darkest on-screen cell —
darker than the night sky itself — is a **`BatchedMesh` belonging to Level 3** (`MeshStandardMaterial,
emissive=000000, color=808080`, a plain unlit gray), NOT the storey currently being tinted (Level 2) and
NOT one of `_facadeGuidsFor`'s own touched GUIDs. The dip is momentary — the same screen cell is normal
(not in the top-3 darkest) one sample before and one sample after. This is consistent with — but does
NOT prove — a DIFFERENT storey's BatchedMesh being transiently disturbed by the tint transition.
**⚠ HONEST CAVEAT, read before trusting this as gospel**: this live reproduction necessarily runs on
`--use-gl=angle --use-angle=swiftshader` (software rendering — the only option available to a headless
puppeteer probe here), while the REAL bake that produced the visually-confirmed black patch ran
`--gpu real` (hardware). The TIMING/existence of SOME defect is proven from the real bake's own frames;
the SPECIFIC mesh identified by the live probe is a strong, plausible, well-corroborated LEAD, not a
confirmed root cause — software and hardware GPU paths can differ in exactly the kind of texture-upload/
timing edge case this smells like (§AO_EXCLUDE/§DATUM_DECOUPLE's whole saga was this same class of
discrepancy). **Already ruled out this session** (checked directly against the vendored
`viewer/lib/three.core.min.js` source, not assumed): `InstancedMesh.setColorAt`'s and
`BatchedMesh._initColorsTexture`'s lazy buffer-init both `.fill(1)` (white) — a "defaults to black"
theory is dead, don't re-propose it. **Next step, not yet done**: reproduce the SAME live-probe method
with `--gpu real` if this environment can run headed/real-GPU puppeteer at all (check first — may not be
possible headless), or, failing that, extract the actual real-bake frame's mesh under the black patch by
a different route (e.g. a `--tap` script per `cli_silent_bake.js`'s own `--tap file.js` mechanism,
installed into a REAL `--gpu real` bake, that raycasts and logs the hit at the known frame/pose — this
runs on the real rendering path the user actually watches, closing the caveat above). No fix attempted
yet — do not patch `_applyTint`'s BatchedMesh branch speculatively; this codebase has a documented
history (§44) of a confident-but-wrong flicker fix that cost a full bake to discover was wrong.

**58.4 ✅ DONE, VERIFIED (corrected after user caught a real gap) — §57.4 ARCH fade.** The FIRST version
(`A.cpeRevealVisualAt`'s ghost-phase branch keeping `ARC`/`STR` in `visDiscs` for `ARCH_DROP_FADE_SEC=
2.0s`, same "both visible together" technique the MEP-to-MEP parade uses at 0.4s) was reported "done,
verified" — WRONGLY. Its own timing logic WAS correct (confirmed both by standalone replay and by the
real bake's own log: `§DISC_FILTER [MEP,ARC,STR]` then `§DISC_FILTER [MEP]` exactly 2.0s of film-time
apart, `out/HHS_lightfix_2026-09-11.log` lines 17311/17878) — but the user watched the actual bake and
correctly reported no visible fade, because `A._applyDiscVisibility` is a PURE BOOLEAN `.visible`
toggle with no opacity concept anywhere in it. What shipped was "stay fully, normally visible for 2 more
seconds, then vanish instantly" — a delayed cut, not a dissolve. Verifying the TIMING logic in isolation
is not the same claim as verifying the VISUAL EFFECT, and this session's own "done, verified" language
did not distinguish them — a real process gap, noted so it isn't repeated.
**Real fix, per user direction ("real fade for what can fade")**: measured the ARC/STR mesh population
on HHS first — `regularARC=112 regularSTR=127` (real per-object meshes, CAN take a genuine opacity ramp)
vs `instARC=991 instSTR=1299 batchARC=742 batchSTR=408` (Instanced/BatchedMesh, confirmed via the
vendored three.js source that neither has an alpha channel in its per-instance colour data — same check
§57.2 already ran for a different reason). Only 239/3679 (6.5%) of ARC/STR is regular geometry — the
fade below is genuinely partial, not a full dissolve, and is reported as such.
New `A.cpeArchFadeApplyVisual(plan, tNorm)` (`effects.js`), called every frame alongside
`A.cpeRevealApplyVisual` (`cinema_maxq.js`, plus both cleanup/abort sites): on entering the same
`(tF, tF+ARCH_DROP_FADE_SEC]` window, clones the material of every REGULAR ARC/STR mesh (deduped per
distinct original — same discipline `_applyTint`'s `§STOREY_REVEAL_TINT_SHARED_MATERIAL` fix already
established, since materials here are shared/cached via `A._matCache`), then ramps `opacity` 1.0→0.0
linearly across the window every frame; Instanced/BatchedMesh ARC/STR stays on the original delayed-cut
path, unchanged. **MEASURED on a real re-bake** (`out/HHS_realfade_2026-09-11.mp4`/`.log`): `§CPE_ARCH_
FADE start meshesTouched=239 clonedMaterials=13` — the EXACT count predicted from the mesh-population
measurement, confirming the mechanism touches precisely the regular-mesh population it targets and
nothing else. Bake ran clean (`unconverged=0`, `fileOk=true`, zero JS errors).
`witness_reveal_arch_hold.js` 6/6 and `witness_tail_lights_all_discs.js` 8/8 still pass (the ghost-phase
ENTRY boundary itself is untouched by either version of this fix).
**Honest residual**: the other 93.5% of ARC/STR (Instanced/BatchedMesh) still cuts — no shader-level fix
attempted here (a real alpha channel for instanced/batched geometry, or a screen-space compositor
cross-fade, are the two real options, neither checked for feasibility). A full technical fix for that
population is still the next step, not solved here.

**58.4c ✅ DONE, VERIFIED (2026-09-11, same session) — timing refinement, per user direction.** User,
after watching the real-fade bake and being told plainly that the 93.5% majority's "delayed cut" gives
NO visual impression of anything happening for the whole 2s (fully solid, then instant vanish — no
better than the original bug, arguably worse since the pop no longer lines up with any on-screen cue):
*"That is a good idea, or even 1 sec as it can be expensive. Make it go from 70% to 30% so the cutover
gives impression of carry over fade, same as before unbatching."* Two changes:
1. `ARCH_DROP_FADE_SEC` 2.0 → **1.0s** (cheaper — shorter window of transparent-material rendering for
   the regular-mesh fade).
2. New `ARCH_BULK_CUT_FRAC = 0.5` — the Instanced/BatchedMesh boolean cut (via `visDiscs` narrowing in
   `A.cpeRevealVisualAt`'s ghost branch) now fires at the **midpoint** of the window (opacity ≈50%,
   inside the user's named 70%-30% band) instead of at its end. `A.cpeArchFadeApplyVisual`'s own
   regular-mesh opacity ramp is UNCHANGED in shape — it still runs 1.0→0.0 across the FULL window — so
   the visible dissolve is already half-done when the bulk pops, and keeps visibly running for the
   second half of the window AFTER the pop, carrying the transition forward instead of the cut standing
   alone as its own event.
**Verified**: standalone replay of the real function against a synthetic plan — bulk narrows from
`[MEP,ARC,STR]` to `[MEP]` at exactly the window's own midpoint (40.50s of a 40.0-41.0s window), not
early, not late. **Re-baked HHS for real** (`out/HHS_archfade2_2026-09-11.mp4`/`.log`): `§CPE_ARCH_FADE
start meshesTouched=239 clonedMaterials=13` — identical scope to the previous version, confirming only
the TIMING changed, not which meshes are touched. The `§DISC_FILTER [MEP,ARC,STR]`→`[MEP]` gap measured
4.7 wall-clock seconds here vs. 13.3s on the previous (full-window, 2.0s) bake — proportionally about
HALF, consistent with a 1.0s window cut at its own midpoint rather than its end. Bake ran clean
(`unconverged=0`, `fileOk=true`, zero JS errors).

**58.5 ✅ DONE, VERIFIED — §57.5 camera-jump smoothing, implemented as gaze-direction blending, NOT a
duration floor.** Root cause (confirmed by reading `poseAt`'s actual source): Beat 1 (dive)'s end-of-
beat target formula and Beat 2 (spin)'s start-of-beat formula are mathematically IDENTICAL at `tD` —
verified by hand, there is no discontinuity in the model. The defect is pure SAMPLING: HHS's own
"spin in place" turn (dive→spin handoff, `diveSec≈2.71s` per `§SLAB_BEAT_CLOCK`) has a real-seconds
span shorter than one frame's own tNorm step at 15fps, so its entire ~87° turn falls in the gap between
frame 40 and frame 41 — no frame's tNorm ever lands inside that beat's own window, so the motion never
appears at all, anywhere, and reads as an instant snap. **Deliberately did NOT re-introduce a beat-
duration floor** — `§CPE_SETTLE_HOLD` (2026-08-04) already settled that ruling explicitly ("i never
asked for that... so no hard coded"; a beat with nothing to turn through stays zero-length) and this
leaves it untouched. Instead: `cinema_maxq.js`'s local `poseAt` wrapper (the ONE place the bake/preview
both read pose) now has `_blendedGazeTarget(tn, pos, origDist)` — blends `GAZE_BLEND_N=5` samples' gaze
DIRECTION (yaw/pitch, wrap-safe shortest-way unwrap) across ±1.5 frame-widths of `tn`, and applies the
blended direction to the frame's own UNCHANGED analytic position. Position is never touched (measured:
it was already continuous everywhere this was found) — only which way the camera looks. Reuses the same
"blend angles, never raw target points" lesson `_cinemaGazeBlend`/§CINEMA_TURN_SLERP already learned at
a different seam in this exact file (averaging raw look-at points can walk THROUGH the camera).
**MEASURED before/after on a real re-bake** (`out/HHS_lowres_v2_2026-09-11.mp4` vs.
`out/HHS_gazeblend_2026-09-11.mp4`, identical settings): the single-frame 86.84° snap at frame 40→41 is
now four frames of 34.72°/17.25°/17.16°/17.04° — peak per-frame angular velocity cut by ~60% (86.84°→
34.72°) and spread over 4 frames (0.27s) instead of 1 (0.067s). Same result at the OTHER measured snap
(frame 573, 89.69°→ now 35.82°/17.11°/19.36°/22.02° across frames 572-575). Bake ran clean both times
(`unconverged=0`, `fileOk=true`, zero JS errors in either log). This only touches the CAPTURE step
inside `cinema_maxq.js` — `plan.poseAt` itself (what the witnesses call directly) is unmodified, so no
existing witness exercises this change; the real-bake pose comparison above is the actual proof.
**Not fully eliminated, by design** — a genuinely fast real turn (§CPE_TURN_DPS-paced) still shows as a
fast turn, now smoothed across a handful of frames instead of erased into one; this is the honest,
correct outcome for "add in-between frames," not a claim that every fast turn now reads as slow.

**58.5 ✅ DONE, VERIFIED (2026-09-11, same session) — §56.2/§57.2 weak-highlight fix: facade
classification now uses the storey's own walkable-raster boundary, not a bounding-box edge test.**
User chose this over the darkening lead ("weak highlight, recommended") after being told the two were
separate problems. `_facadeGuidsFor` (`cpe_storey_reveal.js`) is REFACTORED, not replaced:
`_facadeAabbEdgeGuids` is the ORIGINAL AABB-edge query extracted verbatim (kept as the fallback and as
one half of a union, never removed); NEW `_facadeRasterGuids` reuses `storey_walkable_raster` (§29's
own hall raster — EXTRACT, don't invent a second geometry pass) via `window.StoreyRaster.getBit`:
flood-fills the raster's non-walkable cells from the GRID'S OWN BORDER (standard "outside vs. enclosed
hole" technique, distinguishing genuine exterior void from interior voids/wall cores) — a wall is
facade if a small neighbourhood (`FACADE_RASTER_MARGIN=2` cells, ~0.5m) around its centre touches BOTH
a walkable cell and a border-reached "outside" cell. **The two methods are UNIONED, never one replacing
the other** — this can only ADD coverage the AABB test misses, never lose coverage it already had,
which matters because of what MEASURING the new method alone turned up: on Hospital's tiny Level 7
penthouse the raster-only result REGRESSED (78.3%→19.7% by area) — that storey's raster reads ~60%
"walkable" over a grid far larger than the room itself, a data quality quirk in that one storey's
`storey_walkable_raster` row, not a bug in this algorithm — and the union absorbs it for free (Level 7's
union total stays at the AABB method's own 6, no loss). No raster for a storey (or `window.StoreyRaster`
not loaded) falls back to the AABB method alone, byte-identical to before (DEGRADE, DON'T DISABLE).
**Offline-measured before shipping** (Python replay of the exact same algorithm against the raw DB, no
browser): Level 1 facade-wall AREA coverage 1.8%→18.7% (3→27 raster-found walls), Level 3 8.4%→7.7%
(same order, MORE of the true perimeter across more/smaller real segments — the tapering footprint's
actual shape, not a bounding-box artifact), Level 6 34.2%→78.1%.
**Verified on a real bake** (`out/Hospital_facaderaster_clip_2026-09-11.mp4`/`.log`, `--clip 0.88:1.0`
for a fast ~9-minute closing-orbit-only run rather than the full ~50-minute Hospital bake — the storey-
reveal window only exists there anyway): zero JS errors, and every storey's reported `aabb=` count
EXACTLY matches the pre-refactor baseline (3,5,10,11,9,6,6,2), confirming the extraction changed
nothing about the original method's own behaviour. Union counts, all real, all measured:

| Storey | old (aabb only) | new aabb | new raster | **new union** |
|---|---|---|---|---|
| Level 1 | 3 | 3 | 27 | **28** |
| Level 2 | 5 | 5 | 20 | **20** |
| Level 3 | 10 | 10 | 23 | **29** |
| Level 4 | 11 | 11 | 85 | **88** |
| Level 5 | 9 | 9 | 72 | **76** |
| Level 6 | 6 | 6 | 29 | **31** |
| Level 7 | 6 | 6 | 1 (raster's own known quirk) | **6** (union masks it — zero loss) |
| Level 7A | 2 | 2 | 0 (no raster row) | **2** (clean fallback) |

4-9x more facade wall elements light up on every main floor, with the two known edge cases (Level 7's
raster quirk, Level 7A's missing raster) provably costing nothing thanks to the union design.

### 59. NEW SPEC (2026-09-11) — Structural Sanity + Egress findings baked into the film, gated on
`cpe-measure`. User's own suggestion, refined across several rounds of discussion this session. NOT
IMPLEMENTED YET — this is the written spec required before any code, per this project's Spec-First
rule. Depends on `feat/structural-sanity` (PR #1715/#1709, open/unmerged — `viewer/structural_sanity.js`,
`viewer/egress_sanity.js`, `viewer/rule_checklist.js`), which is a SIBLING branch of `feat/measure-boxes`
(16 commits unique to one, 15 to the other, off a common ancestor `f1ac7ce1`) — implementation needs
both merged into one worktree, not a straight continuation of either.

**59.1 Why "Measure"**: `_measure` (`cinema_maxq.js:1189` at time of writing) already gates 5 other
Build()/At(filmSeconds) module pairs (flythruDatum, slabBeat, linearBeat, indoorBeats, flyoutBeats) —
floating members / unsupported columns / isolated rooms / narrow doors are the same class of "real
measured fact about this building" as those, so they ride the SAME checkbox as a 6th pair, not a new
one. Real Hospital numbers already measured by `StructuralSanity.evaluate`: 43/1970 floating beams,
24/255 unsupported columns — cited here as the DB-backed source, nothing invented.

**59.2 Engine reuse — zero duplicated rule logic.** One new module, `rule_findings_film.js` (singular,
not split per-discipline — both categories share 100% of the scheduling/render code below, only the
data source and the category colour differ). `Build(dbQuery)` calls `StructuralSanity.evaluate` and
`EgressSanity.evaluate` exactly once each, same "call the shared evaluate(), never re-derive" rule
`clash_narrow.js`/`clash_film.js` already established for clash pairs. Each returned row
(`{guid, ifc_class, name, storey, rule, severity, ratio}`) is tagged with its category
(`structural` or `egress`) at collection time.

**59.3 Selection — reuses the existing "readable dwell" convention, invents no new dwell metric.**
Earlier in this discussion a per-GUID screen-time/raycast dwell computation was considered and
rejected — there is no existing utility for it anywhere in this codebase (checked: `dwell` elsewhere
means slider/gesture pauses or scrub-hold seconds, unrelated), and building one would be a second,
separate feature. Instead: each selected finding gets ONE beat, scheduled while its own storey is the
one currently reveal-active (same storey-sequencing every other Measure beat rides on), using the
SAME envelope every other Measure cue already uses — `fadeIn 0.6 + hold 1.0 + fadeOut 0.6 = 2.2s`
(`§14`'s envelope, shared byte-for-byte by `cpe_slab_beat.js`/`cpe_linear_beat.js`/
`cpe_flythru_cues.js`/`cpe_flyout_beats.js`/`cpe_indoor_beats.js`). This satisfies the user's own
"chase only clear opportunities, that can stay for >2s" requirement BY CONSTRUCTION — 2.2s is already
this project's own measured "long enough to read one cue" span, not a new number picked for this
feature. Per-storey candidates: prefer higher severity first (CRITICAL over WARNING), one beat slot
per storey visit. **One-of-each guarantee**: if both categories have at least one finding anywhere in
the building, the selection MUST include at least one `structural` and at least one `egress` beat
across the whole film — never silently drop a whole category to fit a cap. If a category is genuinely
empty (`evaluate()` returns zero rows), no card/beat/banner for it — vacuous, not faked (same rule
`bigStatsBuild` already holds every card to, `§CPE_BIG_STATS`).

**59.4 Visual treatment — solid colour, NOT pulsing.** Considered and explicitly rejected: a "rapid
pulse" on the marked-out finding, to read as more urgent than a static highlight. Rejected because (a)
there is no existing pulse-rate constant anywhere in this codebase to extract — `clash_film.js`'s own
`envelope()` is a slow 5s breathe (1.0/0.5/1.5/2.0s), the only precedent, and a "rapid" rate would be a
brand-new invented tuning number with no source; (b) the user offered static solid colour as an
explicitly sufficient fallback once told this. **Decision: static solid colour per category, no
animation, on all three surfaces below.** `STRUCTURAL = '#ffaa33'` (orange), `EGRESS = '#cc4444'`
(red) — these are CATEGORY colours, a different axis from `rule_checklist.js`'s existing SEVERITY
colorMap (`CRITICAL:'#cc4444', WARNING:'#ffaa33', OPTIMIZED:'#44cc44'`); reusing those exact two hex
values for the category axis instead of inventing new swatches, on the coincidence that "egress/safety
critical" and "structural warning" already happen to be red/orange in the existing map.
**Explicit divergence, noted so it is not "corrected" back later**: `clash_film.js`'s convention is the
OPPOSITE of what's wanted here — there, every unselected pair breathes together and the ONE selected
pair goes solid to stand out. Here, the requirement is the reverse: the active finding is the
attention-getter (solid saturated colour) and every OTHER flagged-but-not-currently-active GUID stays
static too (dim/desaturated, never animated) — the user's own words: "there won't be similar all
pulsing on/off for them in background as that be too noisy." No shared global phase is needed at all
once pulsing is dropped, which also removes the "multiple findings pulsing out of sync" concern raised
earlier — it's moot without animation.

Three surfaces, one colour source (`CATEGORY_COLOR[cat]`):
- **(a) Measure info box** (`cpe_film_boxes.js`) — `A.filmBoxesMeasurePost(title, rows, ink)` ALREADY
  threads an `ink` parameter through to the queue, but `drawMeasureEntry` currently ignores it and
  hardcodes `ctx.fillStyle = '#ffd600'` (`§7`'s cue ink) for every title, and `plate()` is a fixed
  `rgba(0,0,0,0.45)` background shared by all three boxes (HUD/status/Measure). Two small, additive
  changes: `drawMeasureEntry` uses `head.ink` for the title colour when present (falls back to the
  existing yellow when absent — every other Measure caller is unaffected); `plate()` gains an optional
  tint argument so the Measure box's background can be filled with a translucent version of the same
  category colour when the queued entry carries one (HUD/status boxes keep the untouched black plate).
- **(b) 3D wireframe tint** — `rule_checklist.js`'s existing `showRuleModeTint(guidSeverityMap,
  colorMap)`, called with a colour map keyed by CATEGORY instead of severity for this feature's guids,
  static (no per-frame colour update needed since nothing animates).
- **(c) Closing-stage summary cards** — mirrors `§CLASH_HUD_CARD` exactly (`cpe_resource_panel.js`
  `bigStatsBuild`, ~L308-319: pull a `.stats()` summary from the film module, push ONE card per
  non-empty category, dropped entirely — never a fabricated zero — when a category found nothing).
  New: `bigStatsBuild` pushes `{big: <count>, label: '<category> issues flagged', sub: '<top rule
  breakdown>', src: 'rule_findings_film.js', ink: CATEGORY_COLOR[cat]}` for each non-empty category.
  `bigStatsCompositeOntoCanvas` today hardcodes `ctx.fillStyle = '#fff'`/fixed greys for every card's
  number/label/sub — no per-card colour exists anywhere in that renderer yet. Additive fix: read
  `c.ink` when present for the big-number fillStyle (falls back to the existing white for every
  pre-existing card, which never sets `ink`).
  **User addition (2026-09-11): the EGRESS card's `sub` also carries "longest distance to exit —
  Xs / Ysteps".** Source: the real graph-measured `ratio` (metres) already on every
  `circulation_distance` row (`RoomGraph.escapeRoute()`/`shortestPath()` distance, not fabricated) —
  take `Math.max` across the selected egress rows. Two conversions, honesty-labelled differently:
  - **Seconds** = `distance_m / A.WALK_SPEED`. `A.WALK_SPEED = 1.2` (`config.js`) already exists in
    this codebase — EXTRACTED, not invented — though its current real use is tour-camera walkthrough
    pacing (`tour.js`), not evacuation modelling; repurposing it here for a time estimate, not a new
    number. (The OTHER walk constant in this codebase, `cpe_walk.js`'s `WALK_SPEED_MPS=6`, is
    explicitly a fly-navigation speed, not a walking pace — wrong one to reuse here.)
  - **Steps** = `Math.round(distance_m / 0.75)`. No stride-length constant exists anywhere in this
    codebase to extract — 0.75m/step is a standard adult-stride ergonomic convention from OUTSIDE
    this project. Labelled explicitly as an estimate in the sub-text (e.g. "~62 steps"), same honesty
    convention `§NIGHT_PL_INTENSITY_HEURISTIC` already established for this project's one other
    unavoidably-external style constant ("fixture PL intensity is an explicitly-labeled style
    convention, not real photometric data") — never presented as a measured fact.
  Dropped (not shown as "0s / 0 steps") when no `circulation_distance` row exists in the selection —
  pre-existing card, which never sets `ink` — zero behaviour change for them).

**59.5 ✅ IMPLEMENTED (2026-09-11, bim-ootb `feat/rule-findings-film` @ `e517edc9`, worktree
`/tmp/wt-rule-findings-film` — merges `feat/measure-boxes` + `feat/structural-sanity`, both siblings
still unmerged to main).** `viewer/rule_findings_film.js` (new), wired as a 6th Build/CompositeOntoCanvas
pair in `cinema_maxq.js`'s `_measure` branch. The three additive renderer hooks from §59.4 shipped:
`cpe_film_boxes.js` (`drawMeasureEntry`/`plate()` now honour a queued `ink`), `cpe_resource_panel.js`
(two new closing cards + `c.ink` read in `bigStatsCompositeOntoCanvas`), and a real gap
`viewer/tests/witness_film_boxes.js` caught in its own anti-scope-blind registry (the new composite
call was unregistered — fixed, back to 14/14).
**Witness:** `witness_rule_findings_film.js`, 20/20 — real `StructuralSanity.evaluate()` against a real
in-memory sql.js DB, stubbed `EgressSanity` for a controlled `circulation_distance` figure. Proves
one-of-each across distinct storeys, NOFIT when a storey's slot is under 2.2s (real totals still
reported, never silently swallowed), per-window posting gating, category ink, and the distance-to-exit
arithmetic.
**Real-bake verification, §59.6 below — read it before assuming "NOFIT" is a bug on a real building.**

### 59.6 REAL-BUILDING VERIFICATION + THE SILENT-BAKE PRACTICE LESSON (2026-09-11) — read this before
ANY future quick-check bake in this lane, not just for §59.
**59.6a THE CANONICAL SCRIPT — `docs/BIMUserGuide.md` §"Baking without the browser" (lines ~593-673 at
time of writing), NOT anything reconstructed from `cli_silent_bake.js`'s own header comment alone (the
header lists `--measure`/`--storey-reveal` as togglable flags but does not say what's saved by default;
the guide's prose does, and even the guide's own wording turned out to need checking against a REAL log
rather than trusted at face value — see the correction below).
```
node cli_silent_bake.js --db <Name>_silent --out /path/to/out.mp4 --gpu real [--width W --height H --fps N]
```
**⚠ CORRECTED (same session, after being wrong once): do NOT assume `--measure`/`--storey-reveal` are on
by default from the saved path — verify with the bake's own `§CLI_BAKE_RESOLVED`/`§STOREY_REVEAL_WINDOW`
lines, or just force them explicitly.** The guide's own prose ("the buildup, the room titles, the Reveal
round and the day-counter corner... are all restored") never actually lists Measure or storey-reveal
among the restored settings — this session first mis-read that sentence as covering them too, then
proved it wrong on a REAL bake: a bare `--db Hospital_silent --out ...` (no flags) resolved
`§CLI_BAKE_RESOLVED ... storeyReveal=0` — OFF — and produced zero `§RULE_FILM`/`§STOREY_REVEAL_WINDOW`
lines at all, because `A.ruleFindingsFilmBuild` never even ran. A second Hospital bake with
`--measure --storey-reveal` forced resolved `storeyReveal=1` and DID fire the feature (§59.6c). **For
any Measure/storey-reveal-gated feature check, force both flags explicitly — never trust "the saved path
decides" for these two specifically**, even though it holds for buildup/label/reveal/day-counter.
**Established low-res convention for a quick check, extracted from this lane's own prior bakes (§57:
`HHS_lowres_storeyreveal_2026-09-10.mp4`), not invented:** `--width 854 --height 480 --fps 15`. Don't
pick an arbitrary lower resolution/fps — use this one unless a specific reason needs something else.
**Read the bake's actual `--log FILE` on disk for `[con]`-tagged lines, never the harness's own stdout
capture of a backgrounded shell command** — this session also mis-diagnosed a second Hospital bake as
having failed to load the module at all, purely from grepping the wrong file; the real `--log` file had
every line, the terminal-capture file was missing all browser-console output for reasons unrelated to
the bake itself. Always `grep` the file named by `--log` (or its default, `<out-stem>.log`).

**59.6b THE CANONICAL DB IS `~/Downloads/<Name>_silent.db` — NOT a same-ish-named file from a sibling
worktree's `buildings/` folder, even if one exists and even if it looks equivalent.** This session
initially grabbed `Hospital_extracted.db` from `/tmp/wt-storey-reveal/buildings/` when asked for
Hospital's silent-bake DB — a DIFFERENT file (confirmed by md5), missing the authored `cinema_path` row
`docs/BIMUserGuide.md` describes. The real, in-use files, per the user directly: `~/Downloads/
Hospital_silent.db` and `~/Downloads/HHS_Office_Federated_silent.db`. **Verify with `md5sum` against the
Downloads copy before trusting any worktree-local `buildings/*.db` for a real verification bake** — a
same-shaped filename is not proof of the same file. **Practice going forward: symlink, don't copy** —
`ln -s ~/Downloads/<Name>_silent.db buildings/<Name>_silent.db` inside whichever worktree needs it, so
the served file is always the canonical one, byte-for-byte, with no drift and no wasted disk (these
files run 80-315MB).

**59.6c REAL RESULT ON THIS FEATURE, HONESTLY REPORTED — NOFIT ON BOTH REAL BUILDINGS TESTED.**
| building | real window | storeys shown | slot/storey | vs 2.2s floor |
|---|---|---|---|---|
| HHS (`--clip 0.85:0.95` and full-length, 4 runs) | 4.0-6.1s | 4 | 1.0-1.5s | NOFIT |
| Hospital (full 278.8s film, `--measure --storey-reveal` forced, 46 min real-GPU bake) | 10.04s | 8 | **1.25s** | NOFIT |
**This is a genuine, twice-confirmed fact about both buildings' current storey-reveal window sizing —
NOT a bug in `rule_findings_film.js`, not caused by resolution/fps/flag choices.** The NOFIT branch is
doing exactly its job (§58.1's "chase only clear opportunities" rule: report the real totals, schedule
nothing when nothing can be shown legibly) — Hospital has twice HHS's window (10.04 vs ~5s) but also
twice the storeys (8 vs 4), so the ratio lands in the same place; a bigger building does not
automatically clear the 2.2s bar just by having a longer film. **The storey-reveal window itself (a
pre-existing feature, §55/§58.5 — not part of §59) is what needs lengthening to ever demonstrate this
feature live on either real building** — the picker logic is not the thing to change. A synthetic
witness proving the mechanism (§59.5, 20/20) is not the same claim as a real building clearing the real
threshold — keep both honest and don't conflate them. **Not yet done, if this is ever prioritized:**
either widen `plan.storeyReveal.windowFrac`/lower `MIN_SLOT_SEC` (both existing storey-reveal knobs,
`cpe_storey_reveal.js`) enough to clear 2.2s/storey on a real building, or lower the picker's own 2.2s
floor with an explicit user ruling first (it is currently this project's one universal "readable dwell"
constant — changing it for this feature alone would be a deliberate, stated exception, not a quiet
tweak).

### 59.7 SPEC (2026-09-11) — §ROOM_INJECTION_PATH_GAP: why the egress distance-to-exit card never
### appears on a real bake, and the two independent defects behind it
**User: "Was discussed to complete that in last session on the Room Injection path gap."** §59.4's
"longest distance to exit — Xs / ~Ysteps" sub-text IS implemented and witnessed (§59.5, 20/20) but has
never once rendered on a real building. Cause established from the real HHS bake log
(`/tmp/wt-rule-findings-film/out/HHS_allon_mobile.log`, `feat/rule-findings-film` @ `e517edc9`), not
inferred:
```
§EGRESS rule=door_clear_width severity=12 critical=0
§EGRESS_NO_ROOMGRAPH RoomGraph module not available — rules 2/3 skipped
[RP-PATH] §PATH_LEGAL_RASTER storeys=Level 1,Level 2,Level 3,Unknown
[RP-PATH] §ROOM_GRAPH_EXITS exits=0 noRaster=133 of 133 doors
[RP-PATH] §ROOM_GRAPH nodes=77 doors=133 ... circ=3 stairs=2 exits=0 e2=74
```
**NOT a missing-room-injection problem — injection ran and persisted.** Verified with `sqlite3` against
the canonical `~/Downloads/HHS_Office_Federated_silent.db` (§59.6b): 100 `spatial_structure` rows with
`type='IfcSpace'` and guid prefix `RM_`, `rooms_meta.room_count=75` (Hospital's same query: 8 / 7). The
rooms are there; the graph never gets to use them for egress. Two independent defects, stacked — fixing
either one alone still yields no card.

**D1 §EGRESS_ROOMGRAPH_LATE_BIND — `viewer/egress_sanity.js:25` binds `RoomGraph` at FACTORY time.**
```js
var RoomGraph = (typeof module !== 'undefined' && module.exports) ? require('../common/room_graph.js') : ROOT.RoomGraph;
```
`egress_sanity.js` is a static `<script>` in `viewer/viewer.html` (~L895) that runs at page boot, while
`common/room_graph.js` is lazy-loaded on demand by `APP.loadNavigate()` (`viewer/main.js`'s `modules`
list, `viewer/scene.js:2091`). So the IIFE captures `undefined` **permanently**; a later `loadNavigate()`
populates `window.RoomGraph` but can never reach the already-frozen binding. `viewer/viewer.html`'s own
comment above that tag ("in the browser it reads window.RoomGraph, which is lazy-loaded on demand") is
what the code was INTENDED to do and does not do. `viewer/rule_findings_film.js:202-206` already awaits
`A.loadNavigate()` before calling — correct, and wasted, because of this bind.
**Fix:** read `ROOT.RoomGraph` at CALL time inside `evaluate()` (Node `require` branch unchanged, so
`witness_rule_findings_film.js`'s stubbed `EgressSanity` and every Node caller are unaffected).

**D2 §STOREY_FOOTPRINT_NOT_LOADED — `common/storey_footprint.js` was never added to the browser load
list.** `common/room_graph.js:84` binds `StoreyFootprint` the same factory-time way, and E4 exit
detection gates on it: `_footprintFor()` returns `null` when `!StoreyFootprint`, so
`if (!raster || !footprint) { exitsNoRaster++; return; }` (`common/room_graph.js:858`) skips EVERY door.
That is exactly the `noRaster=133 of 133` above — and it is NOT a raster gap: `§PATH_LEGAL_RASTER`
proves rasters were built for Level 1/2/3/Unknown on the same run. `storey_footprint.js` is new this
session; it is `require`d by `witness_exit_detection.js` (which passes, in Node) but appears in no
`<script>` tag and in no `main.js` module entry, so `window.StoreyFootprint` is undefined in every
browser and every silent bake.
**This is a verbatim repeat of `§HALLWAY-BACKBONE-NOT-LOADED`** (documented in `viewer/main.js:163-170`:
"every corridor/spine/Hall-Corridor-label feature built this session had been silently no-oping in the
browser, despite passing every Node-based witness, because this line never existed"). A Node witness
passing is not evidence the browser path runs.
**Fix:** add `'../common/storey_footprint.js?v=1'` to `viewer/main.js`'s `modules` array immediately
BEFORE `'../common/room_graph.js'`, for the same stated reason `storey_raster.js` is already ordered
there ("must load BEFORE room_graph.js — buildGraph() references window.StoreyRaster").

**Expected result after both fixes, stated BEFORE the run so it can be falsified:** `§ROOM_GRAPH_EXITS`
should report `exits=3 noRaster=0 of 133 doors` on HHS — the figure `§EXIT-SAMPLE-CLEARANCE`
(`common/room_graph.js:838-846`) already cites as HHS's calibrated count at the 1.0m margin. Egress
rules 2/3 then run, `circulation_distance` rows appear, and §59.4's distance-to-exit sub-text has real
`ratio` metres to take `Math.max` over. **If `exits` comes back 0 with `noRaster=0`, D2 is fixed and the
exterior test itself is the next thing to look at — do not call that success.**

**59.7a TESTS — `witness_room_injection_path_gap.js` (new, Node).** Per the standing "every test must
name the issue it proves or disproves" rule:
- **P1 D1-LATE-BIND** — construct `EgressSanity` with `window.RoomGraph` UNSET at factory time, set it
  afterwards, then call `evaluate()`: rules 2/3 must run. Proves the bind moved to call time. Fails
  against the pre-fix file.
- **P2 D1-STILL-HONEST-WHEN-ABSENT** — `window.RoomGraph` never set: `§EGRESS_NO_ROOMGRAPH` must still
  be logged and rule-1 rows still returned. Proves the fix did not replace an honest skip with a throw.
- **P3 D2-LOAD-ORDER** — assert `viewer/main.js`'s `modules` array contains `storey_footprint.js` at an
  index BEFORE `room_graph.js`. A string/order assertion, not a mock: the defect IS the missing line.
- **P4 D2-REAL-EXITS** — real `buildings/HHS_Office_Federated_silent.db` (symlinked canonical, §59.6b)
  through `RoomGraph.buildGraph()` with `StoreyFootprint` present: `exits > 0` and `noRaster === 0`.
  Disproves "HHS has no derivable exits" as an inherent property of the building.
- **P5 DISTANCE-IS-MEASURED-NOT-FABRICATED** — every `circulation_distance` row's `ratio` must be a
  finite positive number originating from `escapeRoute()`/`shortestPath()`; assert no row is emitted
  when the graph yields no path (the §59.4 "dropped, never 0s / 0 steps" contract).

**59.7b ✅ IMPLEMENTED (2026-09-11, bim-ootb `feat/rule-findings-film`, worktree
`/tmp/wt-rule-findings-film`).** Both defects fixed, 24 insertions across two files:
- **D1** — `viewer/egress_sanity.js`: factory-time `var RoomGraph = ... : ROOT.RoomGraph` replaced by
  `_resolveRoomGraph()`, called at the top of the rules-2/3 block. The Node `require` branch keeps its
  eager bind (no lazy-loading exists there; every Node caller and `witness_rule_findings_film.js`'s
  stubbed `EgressSanity` are untouched).
- **D2** — `viewer/main.js`: `'../common/storey_footprint.js?v=1'` added to the lazy-load `modules`
  array immediately before `'../common/room_graph.js?v=12'`.

**Witness: `witness_room_injection_path_gap.js` (new), 13/13.** P1/P2 load `egress_sanity.js` in a `vm`
with `module` absent and a fake `window` — the BROWSER branch, which is the only place D1 ever existed
and precisely why §59.5's 20/20 could pass while the feature never once ran.
**Falsified against the pre-fix files** (`git show HEAD:` both, re-run, restore): **9/13, with exactly
P1a, P1b, P3a, P3b failing** — `❌ still logged §EGRESS_NO_ROOMGRAPH — binding still frozen` and
`❌ storey_footprint.js is in viewer/main.js's load list at all  index=-1`. The tests fail on the bug
and pass on the fix; they are not passing vacuously.

**The §59.7 prediction held exactly.** Real `buildings/HHS_Office_Federated_silent.db` (symlinked
canonical) now reports `§ROOM_GRAPH_EXITS exits=3 noRaster=0 of 133 doors` — the 3/133 figure
`§EXIT-SAMPLE-CLEARANCE` calibrated at the 1.0m margin, reached independently here. Egress rules 2/3
run and produce real rows:
```
§EGRESS rule=door_clear_width severity=12 critical=0
§EGRESS rule=circulation_distance severity=71 uncapped_critical=68 viaExit=76 viaFallback=0
§EGRESS rule=isolated_room severity=1
§INJECTED_ROOMS n=100
```
`viaExit=76 viaFallback=0` — every room now escapes via a REAL measured exterior door, never the
`CIRC::` fallback. **§59.4's distance-to-exit sub-text now has a real `Math.max` to take: 112.77 m**
→ `112.77 / 1.2 = 94.0s` and `Math.round(112.77 / 0.75) = ~150 steps`, both from the measured
`escapeRoute()` metres. The one `isolated_room` row carries `ratio: null`, never a fabricated 0.

**59.7c ⛔ WHAT THIS DOES *NOT* FIX — the card still will not appear on an HHS bake.** §59.7 removed the
data gap; the §59.6c **legibility** gap is untouched and independent. The 5th real HHS bake
(`out/HHS_allon_mobile.mp4`, 640x360@15, 1957 frames, 905s wall, every frame converged, `fileOk=true`
— note this run used 640x360, NOT §59.6a's canonical 854x480@15; per §59.6c that changes nothing about
NOFIT, but the canonical resolution is what a rebake should use) logged again:
```
§RULE_FILM_WINDOW winSec=4.03 storeys=4 slotSec=1.01 eligible(>=2.2s)=false
§RULE_FILM NOFIT slotSec=1.01s < 2.2s — no storey stays on screen long enough, nothing scheduled
```
That run predates the fix, so it would still NOFIT after it: NOFIT is decided by the storey-reveal
window, before any finding is consulted. **Next step is therefore §59.6c's own conclusion, now with one
fewer confound: lengthen the storey-reveal window itself (a pre-existing §55/§58.5 feature, not part of
§59), or bake a building whose window clears 2.2s/storey.** A post-fix rebake is worth doing to confirm
`§ROOM_GRAPH_EXITS exits=3 noRaster=0` in a real bake log rather than only in the witness — but do not
expect the card until the window question is settled.

**59.7d PRACTICE NOTE, same lesson as §59.6a and `§HALLWAY-BACKBONE-NOT-LOADED` before it.** `common/
storey_footprint.js` was written, required by a Node witness, and passed — while being unreachable from
every browser and every bake for its entire life. **A new file under `common/` is not wired until it is
in `viewer/main.js`'s `modules` list or a `viewer.html` `<script>` tag; a passing Node witness is not
evidence that the browser path executes it.** Cheap standing check after adding any `common/*.js`:
`grep -n '<new file>' viewer/main.js viewer/viewer.html` — if that returns nothing, the browser never
sees it. Equally: a UMD/dual-mode module that reads a lazily-loaded global must resolve it at CALL time,
never at factory time.

### 59.8 SPEC (2026-09-11) — §RULE_FILM_LINGER_FIT: the NOFIT gate measures the wrong span
**User, after watching `HHS_allon_mobile.mp4`: "Even if 1.1s, let the message linger 3 secs etc.
Outlier edge cases."** Granted, with the cost stated below.

**The gate was comparing the wrong number, and the linger it ignores already exists.**
`viewer/cpe_film_boxes.js:239` `var LINGER_S = 2.2;`, exposed at `:241` as `A.filmBoxesMeasureLingerS`.
`A.filmBoxesDrawMeasure` holds the last posted entry on screen for a further `LINGER_S` after its beat
marker is gone (`§MEASURE_BOX_LINGER start/end`, 9 of them in the real HHS bake log). So a finding
posted inside HHS's 1.01s slot is ALREADY visible for ~3.21s. `rule_findings_film.js:145`'s
`if (slotSec < ENV_SPAN)` tests the slot alone, as though the box cleared the instant the storey's slot
ended. It does not. No new dwell constant is invented here — the 3s the user asked for is what the
existing linger already delivers.

**Fix:** `var lingerSec = (typeof A.filmBoxesMeasureLingerS === 'number') ? A.filmBoxesMeasureLingerS : 0;`
and gate on `slotSec + lingerSec < ENV_SPAN`. Reading the live value (never a second hardcoded 2.2)
keeps this from drifting if `cpe_film_boxes.js` ever retunes its linger.

**THE HONEST COST, which §59.3 must be read against.** §59.3 scheduled each beat "while its own storey
is the one currently reveal-active". That is now RELAXED, not deleted: with `slotSec=1.01` and
`ENV_SPAN=2.2` the caption outlives its own storey tint by **1.19s**, so for that time the Measure box
names a finding on storey N while storey N+1 is the one tinted. Logged every time as
`§RULE_FILM_LINGER_FIT ... overrunSec=...`, never silently. This is the trade the user authorised as an
edge-case allowance; §58.1's "chase only clear opportunities" now means "clear enough to READ", not
"perfectly aligned to the tint".

**And state plainly what the gate becomes.** With the Measure box present, the effective floor is
`ENV_SPAN - LINGER_S = 2.2 - 2.2 = 0`, so NOFIT can no longer fire on window size at all. The branch
survives only for the case where no Measure box is wired (`A.filmBoxesMeasureLingerS` absent ⇒
`lingerSec = 0` ⇒ the original `slotSec < 2.2` test). Do not describe the floor as still guarding
legibility on a real bake — it does not.

**59.8a TESTS — extend `witness_rule_findings_film.js` (do not fork a second file).**
- **L1 LINGER-ADMITS-SHORT-SLOT** — the existing scenario-2 plan (`slotSec=0.25`) plus
  `filmBoxesMeasureLingerS: 2.2` must now reach BEAT and pick both categories. Fails pre-fix.
- **L2 NO-LINGER-STILL-NOFITS** — scenario 2 unchanged (mock `A` sets no `filmBoxesMeasureLingerS`)
  must STILL be NOFIT with both totals reported. Proves the honest branch survives and that the fix
  reads the live value rather than assuming 2.2.
- **L3 OVERRUN-IS-REPORTED** — the admitted case logs `§RULE_FILM_LINGER_FIT` naming `overrunSec`,
  so how far a caption outlives its storey is never hidden.
- **L4 HHS-REAL-NUMBERS** — `slotSec=1.01 + lingerSec=2.2 = 3.21 >= 2.2` admits, `overrunSec=1.19`.
  The real building that motivated this must be shown clearing it, with its own figures.

**59.8b REBAKE — Hospital needs `--measure` FORCED, an exception to §59.6a.** The 2026-09-11 Hospital
bake (`out/Hospital_allon_854x480.mp4`, 2937 frames, 48.6MB, 2853s wall) logged `§RULE_FILM_INIT` and
then nothing: its saved `cinema_path` is `bands=4 hoseOps=0 buildup=1 roomTitle=1 reveal=1` — **no
measure** — and Sanity rides Measure, so §59 never evaluated (`§CPE_BIG_STATS cards=7`, no clash or
sanity cards). §59.6a's "with no flags at all, the saved path decides" holds, but for Hospital the
saved path decides AGAINST Measure. Hospital's window is `windowSec=10.0` (vs HHS's 4.03) over 8 real
levels (Level 1..7A; `Ceiling`/`TOS`/`Unknown` are not storeys) ≈ 1.25s/storey — predicted NOFIT
pre-fix, `1.25 + 2.2 = 3.45s` admitted post-fix. That prediction is stated here BEFORE the bake.

### 59.9 ⛔ CORRECTION to §59.6a (2026-09-11) — "the saved path decides" is FALSE for HHS, and the
### "byte-identical, forced flags were redundant" claim in §59.6a is WRONG
§59.6a told a future session that `--measure`/`--storey-reveal`/`--buildup` are "redundant, not wrong"
because the saved `cinema_path` restores them, and that forcing them "produced byte-identical NOFIT
results on the same building". **Acting on that advice broke a real verification bake.** The canonical
bare invocation on HHS at 854x480@15 produced:
```
§CINEMA_PATH_RESTORE bands=4 total=61.0s holdCol=true holds=0 flagCol=false — §CPE_FLAGS_PORTABLE:
  this .db predates the flag columns, so every film flag stays at its consumer default (all off)
§MAXQ_OVERRIDE_IN source=db:cinema_path bands=4 hoseOps=0 buildup=0 roomTitle=0 reveal=0 durationSec=72.3
§RULE_FILM_INIT wired ... (and then NOTHING — no §RULE_FILM_WINDOW, no §EGRESS, no §ROOM_GRAPH_EXITS)
1085 frames, 467s wall, 17.8MB
```
against the same worktree's forced-flag run on the same DB:
```
§MAXQ_OVERRIDE_IN source=db:cinema_path bands=4 hoseOps=0 buildup=1 roomTitle=1 reveal=1 durationSec=130.4
1957 frames, 905s wall
```
**`flagCol=false` is the load-bearing fact.** `~/Downloads/HHS_Office_Federated_silent.db` PREDATES the
`cinema_path` flag columns, so `§CPE_FLAGS_PORTABLE` leaves every film flag at its consumer default —
**all off**. Only the path SHAPE is restored, never the flags. On that DB the forced flags are not
redundant: they are the only thing that turns Measure on, and §59 rides Measure, so without them §59
never evaluates at all. The two runs are not byte-identical; they are 72.3s vs 130.4s of film.

**Why §59.6a got it wrong:** it generalised `docs/BIMUserGuide.md`'s wording across the fleet without
checking `flagCol` per DB. Both readings are true, of different buildings — `~/Downloads/
Hospital_silent.db` DOES carry the columns (`buildup=1 roomTitle=1 reveal=1` restored from its own
`cinema_path`), HHS does not.

**RULE GOING FORWARD — check the DB, do not trust either blanket statement.** Before any verification
bake, read the first `§CINEMA_PATH_RESTORE` line:
- `flagCol=true` → the saved path decides; pass no flags (Hospital; still pass `--measure` when the
  saved path has it off, per §59.8b).
- `flagCol=false` → **every flag is off**; pass explicitly whatever the feature needs
  (`--buildup --label --reveal --clash --measure --storey-reveal` for a §59 check). HHS.
Cheapest pre-check, no GPU: `node cli_silent_bake.js --db <Name>_silent --opening-only` and read the
restore line. **§59.6a's "passing the flags is redundant" sentence is retracted; do not follow it.**

### 60. ⛔ RESUME HERE (2026-09-11, session close) — STOREY-REVEAL HIGHLIGHTS "still not satisfactory",
### turned into MEASURED defects on the freshest bake. Two shipped (both data/reporting), five left
### for the user (all visual). Worktree `/tmp/wt-storey-reveal-list`, branch `fix/storey-reveal-list`
### off `feat/rule-findings-film` @ `79696797`.
**Source of every number below:** `/tmp/wt-rule-findings-film/out/HHS_lingerfit2_854x480.mp4` +
`.log` (854×480@15fps, 130.47s, 1957 frames, `--gpu real`), and `~/Downloads/HHS_Office_Federated_
silent.db` by direct `sqlite3`. The real window, from that run's OWN §-lines (never the probe's generic
beat labels — §58.3's trap): `windowFrac=0.0309`, `orbitStartFrac=0.9099` ⇒ **114.69s → 118.72s, 4.03s,
4 slots of 1.01s**, matching `§STOREY_REVEAL_FIT windowSec=4.03 ... slotSec=1.01`.

**60.0 THE MEASUREMENT INSTRUMENT, reusable — per-frame tint-hue pixel coverage.** Classify every
below-horizon, non-HUD pixel by hue against the four cycle colours and count per frame. This is the
instrument §57.2/§58.3 kept asking for, in its cheapest form (no puppeteer, no GPU, ~10s to run):
| storey | slot (film s) | peak tinted px on screen | measured band RGB | luma |
|---|---|---|---|---|
| Level 1 `#2979ff` blue | 114.69-115.70 | **≈228** (at sky-noise level) | (73,97,121) | 95 |
| Level 2 `#00c853` green | 115.70-116.71 | **8,967** | **(0,33,13)** | **24** |
| Level 3 `#ffd600` yellow | 116.71-117.72 | **7,203** | **(73,55,12)→(45,37,0)** | **56→38** |
| Roof Level `#ff6d00` orange | 117.72-118.72 | **0, every frame** | — | — |
Un-highlighted facade panels beside them measure ~200 luma. **So the "highlight" is, in every
measured case, DARKER than the facade it is supposed to highlight.** That single fact is the honest
answer to three sessions of "still not highlighting much to be seen" — the read is INVERTED, not weak.

**60.1 ✅ SHIPPED — `A.storeyRevealList` admits a storey that is not a storey (OBJECTIVE DATA BUG).**
`~/Downloads/HHS_Office_Federated_silent.db`: `spatial_structure` holds exactly **3** `IfcBuildingStorey`
rows — `Level 1`, `Level 2`, `Level 3`. **`Roof Level` is not one of them.** It exists only as an
`elements_meta.storey` string on 45 elements: 22 `IfcFlowSegment`, 10 `IfcFlowFitting`, 7 `IfcSlab`,
5 `IfcBuildingElementProxy`, 1 `IfcEnergyConversionDevice` — **zero walls, zero doors, zero IfcSpace,
no `storey_walkable_raster` row**. It is rooftop MEP, not an occupiable storey. §55.2's "the one correct
VACUOUS left is HHS's Roof Level (0 walls — a roof genuinely has no walls, that is the right answer)"
was half right: the 0 is correct, but the row should never have been a reveal slot at all.
The bake's own agreeing lines: `§STOREY_REVEAL_LIST n=4 storeys=[Level 1,Level 2,Level 3,Roof Level]`
· `§FACADE_ONLY_TINT storey="Roof Level" facadeWalls=0 (aabb=0 raster=0) — VACUOUS` ·
`§STOREY_REVEAL_TINT storey="Roof Level" meshesTouched=0` · `§STOREY_REVEAL_STATS storey="Roof Level"
doors=0 walkable=n/a rooms=0 (0 — VACUOUS)`. On screen, frames 117.72-118.72s: **zero tinted pixels,
every frame**, under a card reading "0 · doors · Roof Level".
**What it costs:** (a) 1.01s of a 4.03s window — **25%** — is a dead slot; (b) the three real storeys
get 1.01s each instead of 1.34s (+33% dwell, free); (c) **§STOREY_REVEAL_LAST_STAYS_LIT is reduced to a
no-op** — that fix exists precisely so the window does not end dark, and the storey it keeps lit lights
nothing; (d) `rule_findings_film.js:118`'s `slotSec = winSec/list.length` rises 1.01→1.34s, so §59.8's
`overrunSec = ENV_SPAN - slotSec` falls **1.19s → 0.86s** (-28% caption/tint desync, also free).
**FIX (shipped):** intersect the list with the names `spatial_structure` itself calls
`IfcBuildingStorey`. **DEGRADE, DON'T DISABLE** — a DB with no `IfcBuildingStorey` row at all keeps the
pre-fix list byte-for-byte. The drop is logged, never silent.
**Cross-building safety, checked before writing it:** `~/Downloads/Hospital_silent.db`'s
`spatial_structure` carries 64 `IfcBuildingStorey` rows covering Level 1..7A (plus its own
`Ceiling`/`TOS` pseudo-rows, which the existing `NOT LIKE '% Ceiling'/'% TOS'` filters already remove).
Every storey Hospital shows today survives — **zero change on Hospital**, witnessed (S3).

**60.2 ✅ SHIPPED — `§STOREY_REVEAL_WINDOW` reports a window 33% shorter than the one the film plays.**
Same bake, two lines that disagree: `effects.js:8081` prints `windowSec=2.7 ... — last 2.7s of
pullback`, `cpe_storey_reveal.js:144` prints `§STOREY_REVEAL_FIT windowSec=4.03`. `windowSec` there is
in SHAPE seconds (`_useSec.rise`, denominator `_shapeTotal`≈87.4s); the film plays `windowFrac ×
durationSec = 0.0309 × 130.47 = 4.03s`. The frames settle it: the on-screen slots measure 1.01s each
(green 115.67-116.33, yellow 116.67-117.33) — 4.04s, not 2.7s. Under this project's Log Mandate that is
a real defect: it is the first line a future session reads, and §59.6c already had to go find the FIT
number instead. **FIX (shipped):** also print `realWindowSec` (and `realSlotSec` guidance) from
`durationSec`, which is already in scope on the very next `console.log` (`effects.js:8096`).

**60.3 ⛔ LEFT FOR THE USER — THE HEADLINE. The tint is emissive-only on a night facade whose albedo
contributes nothing, so it renders at ~17-27% of nominal and always DARKER than what it highlights.**
`cpe_storey_reveal.js:_applyTint` sets `cl.emissive.setHex(hex)` and nothing else — the clone's `color`/
albedo is untouched. Measured proof it is emissive-only and linearly scaled: Level 2's band renders
**(0,33,13)** against `#00c853 = (0,200,83)` — R exactly 0, G:B = 2.54 vs the source's 2.41, i.e. **the
emissive colour at ≈0.165×**, with zero albedo contribution. Level 3: **(73,55,12)** against
`#ffd600 = (255,214,0)` ⇒ ≈0.27×. At that scale `#2979ff = (41,121,255)` lands at ≈(8,24,51) — which is
why **Level 1's blue is invisible (≈228px, sky-noise level) while green and yellow read at ~8,000px**:
blue is the darkest of the four cycle colours and the night exposure crushes it below the facade it sits
on. **This is arithmetic, not taste — but every available remedy is a visual retune, so NONE was
applied.** Options, with the one recommendation:
- **RECOMMENDED — raise `emissiveIntensity` on the clone** (one line, `cl.emissiveIntensity = N`), the
  only knob that brightens the tint without changing the model's own colours. Start at 3-4 and bake one
  854×480@15 HHS check; the measured 0.165-0.27× says ~4× is the order needed to clear the pale panels.
- Also set `cl.color.setHex(hex)` (albedo + emissive) — brighter still, but it repaints the material,
  and §55.1(2) already found albedo tinting hostage to lighting direction (`setColorAt` is albedo, "a
  face turned from the sun stays dark almost regardless of tint colour"). Second choice, not first.
- Swap `#2979ff` for a brighter blue. Cheapest, but it fixes one storey of four and leaves the
  mechanism; and the blue/green/yellow/orange cycle is the user's own words (§55, header line 35).
**Do not "fix" this by re-tuning colours or opacity on your own judgement — this feature has been
reworked three times (§55.1) and a fourth unrequested reinterpretation is the thing to avoid.**

**60.4 ⛔ LEFT FOR THE USER — the window opens on a hard camera cut; HHS gets NO lead-in.**
`effects.js:8079` `_storeyRevealWindowSec = Math.min(_useSec.rise, STOREY_REVEAL_WINDOW_SEC=10)`. On
HHS `_useSec.rise = 2.7` ⇒ the clamp binds ⇒ **the window is the WHOLE pullback beat**, so the design's
own "the LAST N seconds of pullback" degenerates to "all of it". Measured: at 114.60s the frame is the
aerial clash-marker shot (green marker pixels 13,155); at 114.67s it is a low ground-level exterior
(green 8) — a hard cut, and `windowStartFrac×durationSec = 114.69s` falls inside that same frame pair.
So Level 1's entire 1.01s slot is spent in the first second after a cut, while the viewer is still
parsing a brand-new shot. That compounds 60.3: the least visible colour gets the least attentive
second. **Recommendation: reserve a lead-in** — e.g. `Math.min(_useSec.rise - LEAD_IN_SEC, 10)` with
`LEAD_IN_SEC ≈ 0.8`, floored so a short pullback still yields a usable window. This is a PACING change;
it needs the user's ruling, not ours. (Note §55/§57's own history here: the window was already widened
5s→10s once for "seems to wait too long" — the opposite complaint. Do not widen; add a lead-in.)

**60.5 ⛔ LEFT FOR THE USER — the finding plate names a different storey than the highlight, for
100% of the window after slot 1** (§59.8's authorised relaxation, now seen on screen). Frames:
114.67-116.80s the bottom-left plate reads `Structural — column continuity / Level 1 / CRITICAL`
while the stat card and tint move to **Level 2** at 115.70; 116.87-119.0s the plate reads
`Safety — door clear width / Level 2` while the tint is **Level 3** and then **Roof Level**. Two
different storey names on screen simultaneously, continuously, from 115.70s to the window's end.
§59.8 predicted exactly this (`overrunSec=1.19s`) and the user authorised it for HHS's 1.01s slot —
but it was authorised in the abstract, before anyone watched it. **Recommendation: keep the linger,
drop the storey name from the plate's own line while it is overrunning** (the finding's category +
element is the content; the storey label is what collides). 60.1 already cuts the overrun 1.19→0.86s.

**60.6 ⛔ STILL UNRESOLVED — §58.3's black patch is STILL PRESENT on the freshest real-GPU bake.**
New, independent confirmation on `HHS_lingerfit2`, measured not eyeballed: near-black pixels
(`r,g,b < 25`) below the horizon jump **6,821 → 17,483 in ONE frame (115.33s → 115.40s)** and the
region's mean darkens **(17,13,12) → (7,5,5)**, i.e. ~10,600px of near-pure black appear and then
persist **1.27s**, clearing only at 116.67s when Level 3's own tint lands on that same band. 115.35s is
exactly Level 1's `u = LIT_FRAC(0.72)` lit→dark boundary. §58.3 saw this on the 2026-09-10 bake at
t=115.267→115.333 and called it momentary; on this bake it is a second-long event. **No new theory is
offered here and none should be invented** — §58.3's own prescribed next step (a `--tap` raycast
installed into a REAL `--gpu real` bake, closing the swiftshader caveat) is still the step to take, and
§57.2's dead theories (lazy `setColorAt` buffers defaulting to black) stay dead.

**60.7 ⛔ NOT PROVEN, named so it isn't rediscovered — Level 1 loses most of its facade to the
regular-mesh guard.** `§STOREY_REVEAL_TINT` vs `§FACADE_ONLY_TINT`, same bake: Level 1 **15 facade
GUIDs → 7 meshes touched**; Level 2 15 → 13; Level 3 18 → 17. Only Level 1 loses more than half. By
direct SQL on the canonical DB, Level 1's AABB-selected facade is **1,013 m² of 1,122 m² (90%) from 5
`IfcCurtainWall`** (Level 2: 23 of 244 m²; Level 3: 8 of 373 m²) — so Level 1 is the one storey whose
facade is mostly curtain wall. `_applyTint`'s regular-mesh branch skips any mesh with
`Array.isArray(o.material) || !o.material.emissive || !o.material.clone`. **Hypothesis, UNVERIFIED:
curtain-wall meshes are multi-material (glass + mullion) and are being skipped, costing Level 1 ~90%
of its selected facade area.** Cheapest next step, no GPU: add a counter to that branch logging how
many facade GUIDs were skipped and by which clause, then read it off the next bake's log — do NOT
patch the branch before that number exists.

**60.8 CHECKED AND CLEAN — do not re-investigate these.** Storey ORDER is correct (ascending mean
element Z; on screen Level 2's green band sits one band BELOW Level 3's yellow band — no off-by-one,
no wrong storey lit). The `' Ceiling'`/`' TOS'`/`'Unknown'` exclusions work (HHS's `Unknown`, 2,120
elements at mean z 5.16, is correctly absent from `§STOREY_REVEAL_LIST`). No tint bleeds onto a
neighbouring storey. `§STOREY_REVEAL_MARKERS_OFF` fires once at window open and restores at bake exit,
as designed.

### 61. ⛔ RETIRED — §MEASURE_TITLE_INK. The diagnosis was WRONG: it blamed the hue when the
### fault was contrast (§64), and the fallback it changed is reached by almost nothing. What SURVIVES
### is §61.0's two standing rules, restated by §73.0: **never touch scene lighting**, and **the HUD is
### an isolated colour schema**. Full story in §76.5 RECAP.

### 62. SPEC (2026-09-11) — §RULE_TINT_SHINE_THROUGH: the Sanity 3D marker is occluded, opt-in fix
**User: "hard to pick out Sanity occurrences, one was late show when storey reveal ended, but no
highlight in the building where it's located. is it shine thru premeditated as it may be blocked by
others? Similar to Clash marking, let it shine thru prior?" → "Yes Sanity shine thru if it's cheap."**

**62.1 NOT premeditated — missed. Sanity is the one film marker that never got the treatment.**
`§RULE_TINT_ENTER elements=2 colors=2` in the real HHS bake (`out/HHS_lingerfit2_854x480.log`) — it
ran and marked both picks. It is invisible because of two lines in `viewer/rule_checklist.js`:
- `:30` `RULE_TINT_MATERIAL_OPTS = { wireframe: true, transparent: true, opacity: 0.2, depthWrite: false }`
  — **no `depthTest: false`**, so ordinary z-testing hides it behind any wall in front.
- `:285` `iMesh.renderOrder = -1` — it draws BEFORE ordinary opaque geometry, so the building paints
  over it even where it is not occluded. That is WORSE than plain depth-testing.

**The working precedent is `clash_film.js:145-166` `§CLASH_FILM_SHINE_THROUGH`**, whose own comment
describes this exact bug being fixed for clash markers: *"THE DEFECT: this material shipped with
depthTest: true … the one line that actually does that work — depthTest — was left at its
MeshBasicMaterial default-looking true instead."* Its fix, itself inherited from `measure.js:717-720`
under the standing rule *"the blue/red shine-through already exists — retain it exactly, do not
reinvent"*: `depthTest: false, depthWrite: false, toneMapped: false`, `renderOrder = 900`.

**62.2 WHY THE BASE CONSTANT MUST NOT BE EDITED.** `tests/test_rule_mode_tint.js` (11/11, passing) is
`prompts/STRUCTURAL_SANITY.md` T5's witness and asserts `RULE_TINT_MATERIAL_OPTS` **deep-equals Clash
MODE's** material config (`measure.js A._enterClashMode`) — it even re-reads the literal out of
`measure.js`. Clash MODE is the interactive browsing mode, where depth-testing is correct; clash FILM
deliberately diverged. So this must be **opt-in at call time, not a change to the shared constant**:
- `A.showRuleModeTint(guidSeverityMap, colorMap, opts)` gains a third argument. With
  `opts.shineThrough` truthy it layers `depthTest: false, toneMapped: false` over the base opts and
  uses `renderOrder = 900` (clash_film's exact value); otherwise behaviour is byte-identical to today,
  `renderOrder = -1` included.
- `viewer/rule_findings_film.js` — the ONLY caller in the repo — passes `{ shineThrough: true }`.
  Interactive Rule Mode keeps Clash Mode's look and T5's contract holds untouched.
- Expose the layering as a pure exported helper so Node can test it without THREE.

**62.3 COST — the user's condition was "if it's cheap". It is: zero added cost.** No extra geometry,
no extra instances, no extra draw calls, no new material per element — the same one
`MeshBasicMaterial` per colour group gains two boolean flags, and an integer changes. Rendering with
`depthTest:false` is not more expensive than with it on.

**62.4 EXPLICITLY NOT IN SCOPE.** `opacity: 0.2` stays — raising it is a taste call and was not asked
for; judge it on the next bake now that the marker is actually visible. `showRuleModeTint`'s hiding of
the real mesh (`:250-251` `o.visible = false`) also stays: it is shared with interactive Rule Mode and
changing it would alter an existing working feature. Neither is touched here.

**62.5 TESTS.**
- **T1 BASE-CONSTANT-UNTOUCHED** — extend `tests/test_rule_mode_tint.js`: with no opts, the layered
  result still deep-equals Clash Mode's config and `renderOrder` is still `-1`. Proves T5 survives.
- **T2 SHINE-THROUGH-LAYERS-DEPTHTEST** — with `{shineThrough:true}`: `depthTest === false`,
  `toneMapped === false`, `renderOrder === 900`, and `wireframe/transparent/opacity/depthWrite` are
  unchanged from the base. Fails pre-change.
- **T3 FILM-ASKS-FOR-IT** — extend `witness_rule_findings_film.js`: the film's `showRuleModeTint` call
  passes a third argument with `shineThrough: true`. Proves the caller opted in, not just that the
  capability exists.

### 63. SPEC (2026-09-11) — §RULE_FILM_MESSAGING: the Measure box says the wrong thing about its own numbers
**User: "Focus on the HUD optics and messaging."** Optics is done (§61 title blue, §62 marker shines
through). This is the messaging half. Two defects, both read straight off the real HHS bake log
(`out/HHS_lingerfit2_854x480.log`), both objective — neither is a taste call:
```
§MEASURE_BOX title="Safety — door clear width" rows=3/3
  [Drehflügel 1-flg - Stahlzarge:76 x 2.26:76 x 2.26:578641 · Level 2 · ratio 0.8]
§MEASURE_BOX title="Structural — column continuity" rows=3/3
  [STB Stütze - rund:STB d=30:STB d=30:573295 · Level 1 · CRITICAL]
```

**63.1 D1 — "ratio" is printed for three different quantities, two of which are metres.**
`rule_findings_film.js:181` builds the value row as `'ratio ' + p.ratio.toFixed(1)` for every rule.
But `ratio` is an overloaded field on the evaluator rows:
- `egress_sanity.js:80` `ratio: width` — **metres** (door clear width)
- `egress_sanity.js:116` `ratio: distance` — **metres** (circulation distance)
- `structural_sanity.js:219` `ratio: ratio` — a genuine dimensionless span/depth **ratio**
So the film told the viewer `ratio 0.8` about a door that is **0.80 m** of clear width. A reader has no
way to recover the unit. It also misdescribes an extracted value, which the Prime Directive forbids
just as much as inventing one.
**The unit is already IN the rule definition and must be read from there, never from a hardcoded list
of rule names:** `warning_m`/`critical_m` ⇒ metres, `warning_ratio`/`critical_ratio` ⇒ ratio. A rule
carrying neither gets the bare number and NO unit word — never a guessed label.
Format: metres `toFixed(2) + ' m'`, ratio `'ratio ' + toFixed(1)`. The quantity is already named by the
title ("door clear width", "circulation distance"), so no new phrasing is invented here — only the unit.
`ratio == null` keeps falling back to the severity word, unchanged: the box ink is the CATEGORY colour,
not severity, so `CRITICAL` is the only place severity is stated and must stay.

**63.2 D2 — the name row is mostly duplicated noise, and the box truncates away the useful half.**
`element_name` follows the Revit export convention `family:type:type:id` — **5,303 of 6,880 rows (77%)**
in `~/Downloads/HHS_Office_Federated_silent.db` match `%:%:%:%`, with the type segment repeated and a
raw element id appended. At the Measure box's width that renders as
`STB Stütze - rund:STB d=30:STB d...` — the reader sees one real word and then noise.
**Deterministic trim, no lookup table, nothing invented:** split on `:`; drop any segment identical to
the one before it; drop a trailing all-digits segment (only when something remains); join with ` · `.
```
Drehflügel 1-flg - Stahlzarge:76 x 2.26:76 x 2.26:578641  ->  Drehflügel 1-flg - Stahlzarge · 76 x 2.26
STB Stütze - rund:STB d=30:STB d=30:573295                ->  STB Stütze - rund · STB d=30
```
Nothing identifying is lost: the guid is the identity and is already carried on the pick and logged.
A name with no `:` is returned unchanged.

**63.3 NOT IN SCOPE.** No re-wording of titles, no new rows, no reordering, no colour change. The three
rows stay `name · storey · value`.

**63.4 TESTS — extend `witness_rule_findings_film.js`.**
- **G1 METRE-RULE-SAYS-METRES** — a `door_clear_width` pick (rule def carries `critical_m`) renders
  `0.80 m`, not `ratio 0.8`. Fails pre-change.
- **G2 RATIO-RULE-STILL-SAYS-RATIO** — a `span_depth_*` pick (`critical_ratio`) still renders
  `ratio N.N`. Proves the fix did not simply relabel everything to metres.
- **G3 UNKNOWN-UNIT-GETS-NO-LABEL** — a rule def carrying neither key renders the bare number with no
  unit word. Proves the unit is read from the definition, not guessed.
- **G4 NULL-RATIO-STILL-SHOWS-SEVERITY** — `column_continuity` still renders `CRITICAL` (§63.1).
- **G5 NAME-TRIM-IS-LOSSLESS-AND-DETERMINISTIC** — the two real HHS strings above trim exactly as
  shown; a name without `:` is unchanged; a name that is ONLY digits is not emptied.

### 64. ⛔ RETIRED — §MEASURE_PLATE_SAME_HUE. Found the real defect: the plate was filled with the
### title's OWN ink, so every entry was hue-on-hue. Fixed, then superseded by §73.3, which made the
### plate see-through again. See §76.5 RECAP.

### 65. ⛔ RETIRED — §MEASURE_PLATE_MATCHES_HUD. Superseded by §73.3: the plate matches
### `cpe_path_overview.js:208` (0.28 frosted), not the opaque value set here. The rule that SURVIVES:
### **share the implementation, never copy the values** — `A.cpePanelPlate`. See §76.5 RECAP.

### 66. SPEC (2026-09-11) — §CLASH_WINDOW_DIAGNOSTIC: an inverted window was reported as a short one
**Found while auditing this session's messages at the user's request ("important to check perf and
messages"). Perf came back clean** — §65's three extra 9px blur passes per frame measured
0.467 s/frame against 0.512-0.531 for the earlier bakes on the same building, i.e. inside run-to-run
noise. The message audit found one real defect.

**66.1 THE FACT.** All three HHS bakes this session logged:
```
§CLASH_HUD_PULLBACK_WINDOW INCONCLUSIVE reason=window-too-short start=0.879 end=0.872
```
`start` is AFTER `end` — the window is not short, it is **inverted**. `cinema_maxq.js:1741` reserves a
fixed five seconds before orbit (`_pbEnd = _tR - (5 / plan.durationSec)`) for the sibling storey-reveal
lane. On HHS that reservation (5.00s) is wider than the entire pullback sub-phase (4.03s, from
`_pbStart=0.879` to `_tR=0.9099` across a 130.4s film), so the end lands before the start and the
disc-pair highlight and its cards are skipped for the whole film. Hospital on the same code is healthy:
`start=0.801 end=0.933 (tV=0.750 tR=0.959 tailSec=10.0 riseSec=30.8 durationSec=195.8)`.
**Same family as §60.4** — a constant tuned on long films degenerating on a short one.

**66.2 THE BEHAVIOUR IS CORRECT; DO NOT "FIX" IT BY CLAMPING.** Clamping the reservation to fit was
considered and rejected on the arithmetic: HHS's whole pullback is 4.03s for `pairCards=8`, so even
surrendering the entire reservation gives **0.50s per card**, and halving it gives 0.25s — far under
the 2.2s §59.3 legibility floor this project already settled. Skipping is the right call and is exactly
§58.1's "chase only clear opportunities". **What was wrong is only the message.**

**66.3 THE FIX — say which failure it is, and show the numbers.** The reason is now
`reservation-exceeds-span` when `_pbEnd < _pbStart`, and `window-too-short` is kept for the only input
that still reaches it, an exactly-zero-width window. The line also carries `pullbackSpanSec`,
`reservedSec`, `shortBySec`, `pairCards`, `durationSec`, and the per-card seconds a clamped window
would have given — so a reader can see this is a fact about the film's beat geometry rather than a
defect, without re-deriving anything.

**66.4 TESTS — `witness_clash_pullback_window.js` (new, Node).** `cinema_maxq.js` cannot be required
(DOM/THREE throughout), so every expression under test is **sliced out of the source text and
evaluated**, never re-typed — the same technique `witness_batch_bucket_class_paint.js` used, and the
reason a slice-failure aborts the run loudly.
- **C1 FORMULA-MATCHES-A-REAL-BAKE** — the sliced `_pbStart`/`_pbEnd`/`_tailShare` reproduce
  Hospital's own logged `0.801` / `0.933` / `0.245` from its logged inputs. Anchors the slice to real
  data: if C1 fails the slice grabbed the wrong expression and nothing below it means anything.
- **C2 INVERSION-IS-NAMED-AS-SUCH** — HHS's real inverted case reads `reservation-exceeds-span`.
- **C3 ZERO-WIDTH-KEEPS-THE-OLD-REASON** — proves C2 did not rename every failure.
- **C4 THE-NUMBERS-ARE-REPORTED** — `pullbackSpanSec` 4.03s and `shortBySec` = 5.00 − span.
**10/10. Falsified against the pre-change file: the slice for `_spanSec` is absent there and the run
aborts — the witness cannot pass against code that does not report the numbers.**
**A NOTE ON C3, because it caught itself:** its first draft used an approximate short case that turned
out to produce a VALID window, which never reaches the message at all — the check passed while proving
nothing. The else branch runs on `_pbEnd <= _pbStart` while the ternary tests `_pbEnd < _pbStart`, so
the only input that still reads `window-too-short` is an exactly-zero-width window, and C3 now
constructs that precisely. A test that passes without reaching the code under test is not a test.

### 67. SPEC (2026-09-11) — §RULE_TINT_ROOM_GEOM: room-based Safety findings were never marked in 3D
**User, watching the Hospital film: "important is the Sanity feature but I can't pick out any item
singled out on scene in hospital mp4."** Two independent causes, both confirmed from that bake's log.

**67.1 CAUSE A — §62 is not in that film.** `out/Hospital_lingerfit2_854x480.mp4` began baking 15:20;
§62 committed 15:29. Its log reads `§RULE_TINT_ENTER elements=1 colors=1` with no `shineThrough=`
field, i.e. the pre-§62 material: `depthTest` on, `renderOrder -1`. Whatever marker was drawn was
painted over by the building. Nothing to fix — that film simply predates the fix, and a rebake carries
it.

**67.2 CAUSE B — the egress marker was never drawn at all, and nothing said so. NEW DEFECT.**
`§RULE_TINT_ENTER elements=1` against `§RULE_FILM picks=2`: one of the two picks produced no marker.
`showRuleModeTint` resolved bboxes from `element_transforms` ONLY, and Hospital's egress pick was
`Safety — isolated room ⚠ Level 2 R3`. Measured on `~/Downloads/Hospital_silent.db`:
```
spatial_structure WHERE guid LIKE 'RM_%'   -> 8
element_transforms WHERE guid LIKE 'RM_%'  -> 0
```
Injected rooms (§ROOM_INJECTOR_NEEDLE, guid prefix `RM_`) live only in `spatial_structure`. **Both of
egress's graph rules pick ROOMS** — `isolated_room` and `circulation_distance` — so every room-based
Safety finding has always been dropped from the 3-D tint, and dropped SILENTLY: the resolver did
`if (!row) return;` with no log. The count mismatch was the only trace and nothing drew attention to
it. `door_clear_width` is the only egress rule that picks a real element, which is why HHS (12 door
findings) appeared to work and Hospital (`door_clear_width severity=0`) did not.

**67.3 THE FIX — look in both tables; name anything found in neither.** `spatial_structure` carries
`center_x/y/z` + `size_x/y/z`, the same shape as `element_transforms`' `center_*` + `bbox_*`, so the
room geometry is real and extracted — nothing is synthesised to fill a gap. Resolution is now:
`element_transforms` first, then `spatial_structure` for whatever is still missing, logging
`§RULE_TINT_ROOM_GEOM n=…`; anything resolving in neither is named in `§RULE_TINT_NO_GEOM` with its
guids rather than vanishing. Extracted into the pure `ruleTintRowsFor(dbQuery, guids)` so Node can test
it without THREE.

**67.4 TESTS — extend `tests/test_rule_mode_tint.js` against the REAL `~/Downloads/Hospital_silent.db`.**
- **R1-setup** — the chosen room guid really has zero `element_transforms` rows. States the premise
  rather than assuming it; if this ever fails the rest proves nothing.
- **R1 / R1b** — that room resolves a 7-column bbox row, with non-zero extents (geometry, not a
  placeholder). Fails pre-change.
- **R2** — a real IFC element still resolves from `element_transforms`; the main path is intact.
- **R3** — a guid in neither table resolves nothing AND is reported.
**23/23 (was 18/18). Falsified against the pre-change file: `ruleTintRowsFor` does not exist there and
the run aborts.** Sibling suites unchanged: `witness_rule_findings_film.js` 35/35,
`witness_film_boxes.js` 14/14.

### 68. ⛔ RETIRED — §HUD_LEGIBLE. Its WCAG 4.5 bar was deliberately overridden by §73.0 and its
### opaque plate reverted by §73.3. What SURVIVES: legibility is MEASURED, never argued — and the
### measurement now runs against the text shadow, not the plate (§76). See §76.5 RECAP.

### 69. AUDIT (2026-09-11) — §RULE_TINT_NO_COLLATERAL: does the Sanity tint mark anything incidental?
**User: "During movie are there any incidental element marked for the Sanity occurrence?"**
**Answer: no — one marker per finding, and no neighbour is hidden.** Established from code and the
real bake log, not assumed:
- **What is DRAWN** is one wireframe bbox per picked guid, built from that guid's own row
  (`ruleTintRowsFor`, §67). `out/HHS_hud_854x480.log`: `§RULE_TINT_ENTER elements=2 colors=2` against
  `§RULE_FILM picks=2` — two findings, two boxes, nothing else.
- **What is HIDDEN** is matched on a single `o.userData.guid`. `BatchedMesh`/`InstancedMesh` never
  carry one — stated at `time_machine.js:1439` ("BatchedMesh/InstancedMesh, which never carry a single
  userData.guid") and again at `hba_lens.js:604` ("misses every instanced/batched target — HHS's 716
  instanced groups"). So a picked element sitting inside a batch cannot drag its bucket-mates
  invisible, which is the one collateral mechanism that could plausibly exist here.

**69.1 THE GAP THAT DID EXIST — it was true but UNCOUNTED.** Nothing logged how many meshes were
hidden. If a batch ever did carry a single guid (one plausible route: a one-element bucket), its whole
bucket would vanish and no line would say so — the same silent-drop shape §67 had just fixed on the
other side of the same function. `§RULE_TINT_ENTER` now also reports `guidsAsked`, `meshesHidden`, and,
only when non-zero, a flagged `batchedHidden=N` naming the condition explicitly. A future bake can be
checked against one number instead of re-deriving this audit.

**69.2 NOT CHANGED.** The hiding behaviour itself is untouched — it is shared with interactive Rule
Mode (§62.4 already ruled that out of scope). This section adds counting, not a behaviour change.

### 70. ⛔ RETIRED by §77 — §RULE_FILM_CLASH_MODEL: per-element labels ranked TOP_N=8. Cutting the
### storey tie was right; labelling per ELEMENT was not. §77 replaced it with one box per RULE.
### See §76.5 RECAP.

### 71. ⛔ RETIRED by §77 — §RULE_FILM_VISIBLE_FIRST + §RULE_TINT_ROOM_ANCHOR. The room-anchor half
### STILL STANDS (a room is marked by a POINT, not by its extent); the ranking half went with §70.
### See §76.5 RECAP.

### 72. ⛔ RETIRED by §77 — §RULE_FILM_MEASURE_ECHO. Its LESSON survives, restated in §81.5: a
### wholesale rewrite drops requirements that no test names. See §76.5 RECAP.

### 73. SPEC (2026-09-12) — §HUD_MEDIA_SCHEMA: translucency back, a palette that separates at a glance,
### smaller Sanity labels with a 3s TTL
**User, after watching `Hospital_FULL_1080p_2026-09-11.mp4`: "it looks good. Suggestions: 1. Restore
back the info panels translucence see thru and colour scheme to differentiate at one glance. Yes they
may not be that legible but user can pause and the scene movement helps contrast... 2. Sanity messages
... they are too many and thus spawn all over the screen. Make them a bit smaller in print to not
obscure scene too much and TTL max 3 secs."**

**73.0 §68 IS DELIBERATELY OVERRIDDEN, and the scope is the BOXES.** The user's clarification when an
earlier draft of this section started re-deriving 3-D marker colours: *"i mean the pop up boxes
containing the messages, not the markings on scene itself."* This section is about the label plates and
info panels only. §68 made every plate opaque (`rgba(0,0,0,0.85)`) to clear WCAG 4.5:1 against a bright
facade; the user has weighed that and chosen the other side, with a reason — a film is not a web page,
the viewer can pause, and the background is moving, so a still-frame contrast ratio is the wrong
acceptance test for box text in this medium. **The bar is waived, not forgotten:**
`witness_hud_legibility.js` still measures and PRINTS every ratio, and still enforces a floor of
**1.5:1** — low enough to honour the waiver, high enough that an ink within a hair of its own plate
fails the build instead of shipping invisible. Real ratios after this change: title 1.79, structural
2.00, safety 1.54, body rows 3.59, card label 3.18, card sub 2.85.

**73.1 THE COLLISION THAT MADE "AT A GLANCE" IMPOSSIBLE.** Clash owns red and blue:
`clash_labels.js:93` `COL_A = tint(255,33,26,0.45)` → `rgb(255,133,129)`, `COL_B` → light blue.
Sanity's egress ink is `#e57373` = `rgb(229,115,115)` — **the same salmon as clash's A-side**, so a
Safety finding and a clash A-element read as the same thing. §68 chose `#e57373` purely on contrast
maths and never checked it against the palette already on screen. A colour is not just a contrast
value; it is an identity, and two features cannot share one.

**73.2 THE SCHEMA.** Four identities, each unambiguous against the others AND against the scene (night
sky, brown ground, green MEP, grey-white facade):
- **Clash A — red** `rgb(255,133,129)`, **Clash B — blue** — unchanged, not this feature's to move.
- **Structural — amber `#ffb300`.** Warm, reads as load/caution, far from clash red in hue.
- **Safety/egress — violet `#ea80fc`.** Deliberately NOT red, and CHOSEN BY MEASUREMENT: of ten
  candidates scored in CIE-Lab against everything already on screen, it keeps dE 50.9 from the nearest
  (clash A) while staying light enough to read as box text. **`#e57373` scored dE 8.1 from clash A —
  perceptually the same colour**, which is precisely why nothing separated at a glance. RGB distance
  hides this (it reported 35); the witness now uses CIE-Lab for that reason.
- **A 3px category edge bar down the left of every Sanity plate**, in the category ink. Hue alone is
  unreliable at small sizes on a moving background; an edge bar is a shape cue that survives both.

**73.3 TRANSLUCENCY RESTORED.** `A.cpePanelPlate` returns to the frosted treatment — 9px blurred
backdrop, `rgba(0,0,0,0.42)` (0.52 on the no-blur fallback), 1px `rgba(255,255,255,0.20)` edge. All
three film boxes and the main HUD share it, as §65 established.

**73.4 SANITY LABELS — smaller, and a hard 3s life.** Font `h*0.016` → `h*0.013`. Each label lives at
most `LABEL_TTL_S = 3.0` film seconds, then retires and yields its slot; a retired finding is not
re-shown until every other candidate has had a turn, at which point the rotation resets. With 509
findings on Hospital and 8 slots, that turns a static crowd into a rotation — the user's "too many,
spawn all over the screen" is a throughput problem, not a count problem.

**73.5 TESTS.**
- **S1 PALETTE-IS-DISTINCT** — Sanity's inks differ from clash's `COL_A`/`COL_B` by a stated minimum
  hue distance. Fails against `#e57373`, which is the defect §73.1 names.
- **S2 TRANSLUCENT-AGAIN** — the plate alpha is back under 0.5.
- **S3 STILL-ABOVE-THE-FLOOR** — every ink clears the waived 1.5:1 floor, with all real ratios printed.
- **S4 TTL-RETIRES** — a label shown for 3.0s stops being drawn.
- **S5 ROTATION** — after retirement a different finding takes the slot, and the set resets only once
  every candidate has had a turn.
- **S6 SMALLER** — the label font is strictly smaller than before at the same frame height.

### 76.5 RECAP — §61-§76 in one page (consolidated 2026-09-12). Seven sections were RETIRED to stubs
### above because their blow-by-blow obscured the live design. This is everything that still matters.
**Read this instead of §61-§76. The live sections in that range are §62, §63, §66, §67, §69, §73, §76.**

**WHAT THE HUD LOOKS LIKE NOW (the settled answers).**
| | |
|---|---|
| Plate | `cpe_path_overview.js:208`'s own — 9px blurred backdrop, `rgba(0,0,0,0.28)`, 1px white hairline. 72% see-through. Shared via `A.cpePanelPlate`, never copied. |
| Text | carries its own dark shadow (§76), so legibility does not depend on the plate. Measured against the shadow: 8-11:1. Against the plate alone it is 1.0-1.3:1, and that is FINE and deliberate. |
| Structural ink | amber `#ffb300` |
| Safety ink | violet `#ea80fc` — chosen by CIE-Lab distance from everything already on screen. `#e57373` scored dE 8.1 from clash A: the same colour. |
| Clash | red / blue, untouched — not this feature's to move |
| Category cue | the ink PLUS a 3px edge bar down the box's left |

**FIVE STANDING RULES, each bought with a mistake.**
1. **Never touch scene lighting** (§61.0). §60.3's `emissiveIntensity` remedy is withdrawn under it.
2. **The HUD is an isolated colour schema** (§61.0) — not coupled to the 3D palette; they may differ on purpose.
3. **A colour is an IDENTITY, not a contrast value** (§73.1). Safety was picked on contrast maths alone and landed on clash's exact salmon. Check any new ink against what is already on screen, in Lab, not RGB — RGB reported 35 and hid it.
4. **Share the implementation, never copy the values** (§65) — `A.cpePanelPlate`, `ruleTintMaterialOpts`. Two copies drift the moment either is retuned.
5. **Film-only behaviour is an OPT-IN, never an edit to a shared constant** (§62.2, §78.4). `RULE_TINT_MATERIAL_OPTS` is T5's contract that interactive Rule Mode equals Clash MODE; `shineThrough` and `filled` are opt-ins precisely so that holds. Two separate attempts edited it directly and broke `tests/test_rule_mode_tint.js`.

**THE ARC, and why it went the way it did.** §61 read "the yellow HUD is not helping optics" as a HUE
problem and changed a fallback almost nothing reaches. §64 found the actual defect — the plate was
filled with the title's own ink, so every entry was hue-on-hue. §65 then matched the plate to the main
HUD, §68 made it opaque to clear WCAG 4.5, and §73.0 reversed that on the user's call (a film is not a
web page; the viewer can pause and the scene is moving), with §76 moving legibility onto the glyph
where it belongs. **Three sections in a row each fixed something real and still left the HUD
unreadable, because the question being answered was never the one asked.**

§70-§72 are the same shape one level up: §70 correctly cut the storey tie but labelled per ELEMENT,
§71 fixed its ranking, §72 restored what §70 had silently dropped — and §77 then removed the entire
layer, because 509 findings are six rules and were never 509 stories.

### 77. NEW SPEC (2026-09-12) — §RULE_FILM_SET_PULSE: one box per RULE, a depth wave per set
**The user's own design, arrived at by watching the Hospital 1080p bake.** Their words, in order:
*"the structural sanity checks seems to cover a slate of items of similar nature right? If so, perhaps
a single message box is enough?"* … *"i do not mean sweeping by storey but by set"* … *"the set also
pulse from near outwards to afar effect. So they don't all pulse at once. The wave outwards gives a
good perception of depth."*

**77.1 THE INSIGHT, CONFIRMED BY THE DATA.** 509 findings on Hospital are not 509 stories — they are
**six**:
```
span_depth_cantilever 217 · span_depth_steel 204 · floating_member 43 · column_continuity 24
circulation_distance   13 · isolated_room        8 · door_clear_width 0 (nothing to say)
```
HHS's 215 are **three**: column_continuity 131, circulation_distance 71, door_clear_width 12. §70's
per-element labels were therefore repeating five or six sentences hundreds of times, which is why the
film read as spam — it WAS spam. One box per RULE loses nothing: "217 cantilevers over span/depth"
says everything the 217 separate labels said, and says it once.

**77.2 THE MODEL.**
- **A SET is one rule's flagged elements.** The unit is the set, explicitly NOT the storey — a set may
  happen to cluster by storey, but that is incidental and must not drive anything.
- **One box per set**, stating the **set TOTAL outright** — `span/depth cantilever · 217 flagged`.
  NOT the visible share: the user ruled directly on this, *"a grasp of total outright is more important
  than to await whole film revealing the total."* The box appears with the wave and **lingers 2s** after it.
- **The pulse is a WAVE in view-direction depth** — near members first, far members last, so the set
  reads as occupying space rather than blinking as one flat mass. Per-element delay comes from depth
  along the camera's forward axis, not straight-line distance: down a corridor or a long span, view
  depth is what reads as depth. Each element then decays on its own.
- **RE-PULSE ON ANY NEW ≥2s-DWELL MEMBER — the dwell is the gate, not turnover.** The user corrected an
  earlier draft of this section that made a 3/4-turnover fraction the trigger: *"The glow pulse >2secs
  renew means the scene may not wait for 3/4 gone off frame. This ensures the anew even though few gets
  noticed. The old remain in frame may enjoy a faster renew but that won't hurt perception."* So a set
  re-pulses the moment it gains ANY newly-visible member that will stay ≥2s; members already on screen
  pulse again alongside it, and that repetition is the FEATURE — the viewer sees the same set recur
  across the building and grasps that the problem is everywhere, rather than reading each instance as a
  separate incident.
- **The only rate limit is structural:** a set cannot start a pulse while its own is still running
  (wave + 2s linger), giving a floor of ~3s between pulses. No tuned cooldown constant.
- **Overlap:** with 3-6 sets, collisions are rare. When two boxes do collide, reposition into free
  space — never suppress one, which would make the film lie by omission.

**77.3 THE ≥2s DWELL IS EXACT, NOT ESTIMATED — and this is only possible in a bake.** The pose list for
the whole film exists before the first frame is rendered (`cinema_maxq.js` builds it up front), so for
any element the intervals in which it is in frustum are COMPUTABLE, not guessed. "Will this member stay
in frame 2 seconds?" is a lookup. An element that would flash and vanish inside 2s never triggers a
pulse and never wastes one. A live viewer could not do this; the film can, and should.

**77.4 WHAT THIS RETIRES.** §70's per-element floating labels, §70.2's TOP_N=8 ranking with
RANK_MARGIN_M hysteresis, §71's visible-first re-ranking, §73.4/§74's label TTL and 30% ageing, and
§72's Measure-box echo of a single rotating finding. All of it existed to manage crowding that this
design does not create. **Retired WITH their cause recorded here**, not silently deleted — the witness
keeps checks asserting the retirement so a later reader sees it was deliberate. §69's hide counting,
§67's two-table geometry, §62's shine-through material and §73's palette/plate/shadow all stay.

**77.5 TESTS.**
- **P1 ONE-BOX-PER-RULE** — N findings across R rules yield at most R boxes, never N.
- **P2 TOTAL-NOT-VISIBLE** — the box states the set's full count even when only a few members are in
  frame. Fails any implementation that counts what is on screen.
- **P3 DWELL-GATE-IS-EXACT** — a member visible for 1.5s never triggers; one visible for 2.5s does.
  Driven from a synthetic pose list, so the assertion is about the computation, not about a bake.
- **P4 ANY-NEW-MEMBER-TRIGGERS** — one new qualifying member re-pulses the set; no turnover fraction is
  required. This is the correction the user made, asserted directly.
- **P5 NO-RESTART-MID-PULSE** — a set already pulsing does not restart, giving the ~3s floor.
- **P6 WAVE-IS-VIEW-DEPTH** — per-element delay orders by depth along the camera forward axis; the
  nearest member starts first and the farthest last.
- **P7 LINGER** — the box is still drawn 2s after the wave ends, and gone after that.

### 78. (2026-09-12) — §RULE_FILM_SET_PULSE, three corrections from the first real clip
**HHS clip baked (`~/Downloads/HHS_setpulse_clip_2026-09-12.mp4`, 854x480, 294 frames).** §77 read
correctly on screen — `Structural — column continuity · 131 flagged` as ONE amber box where §70 drew
131 labels. Three things the clip exposed:

**78.1 THE WAVE WAS COMPUTED AND NEVER DRAWN.** User: *"don't notice the pulse outward effect."* It was
not there to notice. The composite calculated a per-member `glow` and then called
`A.ruleTintShowOnly(set)`, which took a BOOLEAN — so every member of a pulsing set appeared at once
and the glow was discarded. `ruleTintShowOnly` now takes an INTENSITY 0..1 per guid, driving
`instanceColor` (which multiplies the shared material, so one material still serves the whole bucket)
plus a 1.0→1.35 scale pop. A computed value with no consumer is worth exactly nothing; the witness
could not catch it because it only ever asserted the numbers, never that anything read them.

**78.2 THE ENVELOPE WAS A BLIP, NOT A WAVE.** User: *"Hope the pulse out is dramatic, not pops, but
wave out, remaining in pulse, before fade out."* The first cut faded each member as soon as the front
passed it (`glow = 1 - lit/decay`), so the near end was dark before the far end lit — a travelling
blip. Four phases now: **travel** (`WAVE_S 1.4s`, front nearest→farthest), **attack** (`0.18s` swell
per member as the front arrives, not a switch), **hold** (`1.2s` — everything the front has reached
stays lit while the wave completes), **release** (`0.9s`, the whole set together). 3.5s total.
Measured on the shipped code:
```
t=0.3 near lit          t=1.1 p2 swelling 0.93     t=2.0 ALL lit, holding
t=0.7 near + p1         t=1.5 far beginning 0.56   t=3.0 all 0.56 together   t=3.6 dark
```
The set reads as one body filling and releasing, which is the point — these are 131 instances of ONE
finding, and the animation should say so.

**78.3 THE BOX MUST NOT BLINK.** User: *"the same Sanity message box need not renew while they remain
or repulse on screen. Keeping the same box until end of pulsing helps eyeballing it well."* Box and
pulse are now separate lifetimes: the PULSE is the wave and re-fires on a new qualifying member; the
BOX is held for as long as the set has any member on screen, fading only once the set leaves frame
(+`BOX_LINGER_S`). With pop-ups already down from hundreds to a handful, a held box costs nothing and
a blinking one costs the read.

**78.4 FILLED MARKERS — opt-in, NOT a change to the shared constant.** User: *"I thought it be more
filled bboxes see thru."* It costs nothing — same geometry, same instanced draw, one flag. **A first
attempt edited `RULE_TINT_MATERIAL_OPTS` directly and broke `tests/test_rule_mode_tint.js`**, because
that constant is T5's contract that interactive Rule Mode must equal Clash MODE's material — which
§62.2 had already ruled out of scope. Correct shape is the one §62 established: a film-only opt-in,
`{filled:true}` → `wireframe:false, opacity:0.22`. F1 now asserts the shared constant is untouched.

**78.5 TESTS.** `witness_rule_findings_film.js` 16/16, `tests/test_rule_mode_tint.js` 26/26.
P7 ("box gone after linger") was RETIRED — §78.3 makes it wrong — and replaced by **P8** (box held at
t=3.5/4.5/8/20/60s while the set is visible). **P4 had to be rewritten twice**: once because §78.3
means the box no longer disappears, so the observable moved to the wave restarting; and again because
it sampled at exactly `since=0`, where every glow is legitimately 0 and the check read a pass as a
fail. Sample after the attack begins, or the assertion proves nothing.

**78.6 §79 THE RELEASE TRAVELS TOO.** User: *"the release should also directional wave out, so the
optics gives cognition."* §78.2's release let the whole set go at once, which threw the direction away
at the end and left the eye with half a motion — the fill said "outward", the release said nothing.
Both fronts now run the same axis: `RELEASE_S 0.9s` travel, then `FADE_OUT_S 0.6s` per member once the
release front reaches it. Nearest lights first AND lets go first; farthest lights last and holds
longest. Total 4.1s (fill 1.4 · hold 1.2 · release travel 0.9 · fade 0.6). Measured on the shipped
code, near→far across the four members:
```
FILL     t=0.7 ■□□□   t=1.1 ■■□□   t=1.5 ■■■□   t=2.0 ■■■■
HOLD     t=2.8 ■■■■
RELEASE  t=3.1 ▓■■■   t=3.4 ░▓■■   t=3.7 □░▓■   t=4.0 □□░▓
```
**P9/P9b** assert it: mid-release the nearest is dimmer than the farthest, and the glow is monotonic in
depth — a clean front rather than scattered fades. 18/18.

### 80. (2026-09-12) — two fixes the wave clip exposed
**80.1 THE STOREY ROW — §75 WAS PLUMBING WITHOUT AN EFFECT.** §75 split the storey out of the room
line, but only when ONE storey was announced (`stSame`). Measured on the real clip
(`out/HHS_wave_clip.log`): **filled=0, blank=112** — the camera almost always sees more than one
storey, so the condition never held and the row stayed empty while the Room row truncated under both
halves. The user: *"It is just a split of the 'Level..' part of now in Room string so the Room is not
truncated and has space."* `_lineFrom` now also collects each GROUP's storey header, so several
storeys give `Level 1, Level 4` in the Storey row and the Room row keeps only the bare room names.
Still split where the line is COMPOSED — never by re-parsing the joined string — so `parts` is
unchanged and every existing caller and witness sees exactly what it did.
**The lesson: "the fix is in" is not the same claim as "the fix fires."** §75 was reported as done on
the strength of the code change; one grep of a real log would have shown 0/112.

**80.2 THE BOX WAS DRAWN EVERY FRAME AND STILL LOOKED LIKE IT RENEWED.** User: *"The pop up Sanity
message box still renew instead of staying."* §78.3 made the box persist — and it did: `boxes=1`
every frame. But it was ANCHORED to the set's nearest visible member, which changes as the camera
moves, so it hopped around the frame. Persisting and staying put are different properties, and only
the first was implemented. The position is now PINNED when the box first appears, held while the set
is on screen, re-placed only on a frame-size change, and unpinned once the set has been gone for
`BOX_LINGER_S`. A collision nudge writes back to the pin so it does not re-nudge every frame.
**P10** drives the camera so the projected anchor jumps corner to corner and asserts the box does not
move with it. 19/19.

### 81. 🏁 RESUME HERE — session close 2026-09-12. Sanity went from 2 findings shown to one box per
### rule with a directional wave. Storey-reveal and bake memory are the open work.
**Branch:** bim-ootb `feat/rule-findings-film` @ `2aa71262`, 42 commits this session. `feat/measure-boxes`,
`fix/storey-reveal-list` and `fix/batch-bucket-class-paint` are all merged into it. **`feat/structural-
sanity` is still NOT an ancestor** — check before assuming the tree is whole.

**81.0 START HERE, in order.** ⚠ REVISED 2026-09-12 — **§82 is DONE (§83), shipped and proven on the
Terminal bake that found it: 8 boxes peak down to 2.** The order is now: (1) **§84 §SANITY_EXIT_STAT** —
the only open item with a finished spec: the `Longest path to exit — ~## steps` line on the flashing
Sanity box. Buildable today from `_stats.maxExitDistSteps`; only §84.4's shared-helper extraction waits
on PR #1715. (2) **§60.3/§60.4/§60.6/§60.7** — storey-reveal, already measured, four defects still open.
(3) **§81.3** — bake memory at model load. Also open and smaller: §83.4's `boxes=0` on 9 of 53 seconds,
and §83.5's transition fade, which the user parked pending an eyeball of `out/Terminal_lowres_v82.mp4`.
**§76.5 RECAP** replaces §61-§76: read it rather than those sections, seven of which are now stubs.

**81.1 WHAT LANDED, in order.** §59.7 room-injection path gap (two silent defects: a factory-time
`RoomGraph` bind, and `storey_footprint.js` never added to the browser load list — `exits=0
noRaster=133/133` became `exits=3 noRaster=0`). §59.8 linger-fit. §61-§66 HUD optics. §67 room geometry
from `spatial_structure` (71 HHS / 6 Hospital egress findings had NO marker at all, silently). §69 hide
counting. §70-§72 the clash model. §73-§76 media schema. §77-§80 **the design the user arrived at
himself**: one box per RULE stating the set total, a wave that fills outward, holds, then releases
outward, filled see-through markers, pinned boxes. Hospital's 509 findings are six rules; HHS's 215 are
three — §70's per-element labels had been repeating six sentences hundreds of times.

**81.2 OPEN — STOREY-REVEAL, the user's own words: "the storey reveal still need work".** §60 measured
it and only two of seven findings were fixed (§60.1 Roof Level, §60.2 window seconds). Still open, all
with evidence in §60:
- **§60.3 the highlight is DARKER than the facade it highlights** — tint luma 24-95 against ~200 on
  adjacent panels. The obvious remedy (`emissiveIntensity`) is **withdrawn under §61.0's standing rule:
  never touch scene lighting.** A non-lighting remedy is needed, or ask.
- **§60.4 the window opens on a hard camera cut** — HHS's `rise=2.7` makes the window the whole
  pullback, so Level 1's slot is spent in the first second after a cut.
- **§60.6 §58.3's black patch** — 6,821→17,483 near-black px in one frame, persisting 1.27s. Needs
  §58.3's own `--tap` raycast inside a real-GPU bake.
- **§60.7 Level 1 loses ~90% of its facade** — 1,013 m² of 1,122 m² is `IfcCurtainWall`, skipped by
  `_applyTint`'s regular-mesh guard. Add a skip counter and read it off a bake before patching.

**81.3 OPEN — BAKE MEMORY, the user's second named item.** Hospital at 720p and again at 1080p was
**killed twice by the system during MODEL LOAD**, before the first frame — puppeteer threw from
`FrameManager` both times, and `dmesg` showed no OOM kill, so it was the harness watchdog reacting to a
spike, not the kernel. Both retries then succeeded with no other change, and the eventual 1080p
Hospital bake ran 98 min clean. So it is a load-time spike, not a leak. **Facts for whoever picks this
up:** Hospital is a 300MB DB / 64,150 elements; the spike is at load, not during frames; 24GB was free
immediately after each kill; HHS (80MB) never triggered it. Worth measuring peak RSS across the load
phase before changing anything.

**81.3b ✅ DONE (§83) — §82 SET QUEUEING, found after §81 was written.** Baking a third building
(`Terminal_silent.db`) put **7-8 set boxes on screen for 29 of ~53 seconds** — §77 solved per-element
crowding and hit set-level crowding. §82 specs the fix (queue and stagger, 5s slots, earnest effort
not a guarantee); **§83 records it shipped at `f135a63f`, witness 26/26, and re-baked on the same
building: peak boxes 8 → 2, all eight rules still shown.**

**81.4 ALSO OPEN, smaller.** §66 HHS's clash pullback window is inverted (`reservation-exceeds-span`)
so its disc-pair cards never draw — behaviour is correct, the film just loses that content on short
films. §O.3 the HHS ceiling panel still appears ~49 project-days early (cause unattributed; the
`§PERF_INCR` delta skip at `time_machine.js:1535/1597` is the prime suspect, and **must be chased with
a witness plus §-tagged logging, never by looking at frames** — see §O and the user's "it's GIGO").
`§RULE_TINT_NO_GEOM` names 1 HHS / 15 Hospital synthetic `CORRIDOR_ROOM::` nodes with no geometry;
correctly reported, nothing to draw.

**81.5 THREE PROCESS LESSONS THIS SESSION KEEPS RE-LEARNING — read before the next change.**
1. **"The fix is in" ≠ "the fix fires."** §75 shipped a storey split that never fired: the real log said
   `filled=0 blank=112` twice, once after the fix and once after the "fix to the fix", because the
   split was attached to one of TWO composers while this file's own comment says "ONE composer, TWO
   callers". Grep a real log before reporting anything done.
2. **A test that passes without reaching its subject is not a test.** Four times: §66's C3 (a valid
   window that never reached the message), §70.7's K7 (5 findings against a cap of 8), §77's P1 (5
   findings across 5 rules, grouping nothing) and P4 (sampled at `since=0` where every glow is 0).
3. **A computed value with no consumer is worth nothing.** §78.1 — the depth wave was calculated
   per-member for a whole day and then discarded, because `ruleTintShowOnly` took a boolean. The
   witness asserted the numbers and never that anything read them.

### 82. SPEC (2026-09-12) — §RULE_FILM_SET_QUEUE: stagger the sets, do not fire them all at once
**Found by baking a THIRD building.** `Terminal_silent.db` (302MB, 48,428 elements, 6 storeys, 75
injected rooms) was baked at 854x480 as a deliberate change of subject — and it is the first building
where every structural rule fires:
```
column_continuity 108 · floating_member 26 · span_depth_concrete 17 · span_depth_cantilever 6 · span_depth_steel 1
circulation_distance 19 · door_clear_width 25 · isolated_room 3        = 158 structural + 47 egress, EIGHT sets
§ROOM_GRAPH_EXITS exits=11 noRaster=0 of 135 doors · maxExitDistM=96.4 · 791 frames, 449s, unconverged=0
```
**The defect §77 did not anticipate: nothing caps how many SETS pulse at once.** Measured on that bake:
```
boxes=7 on 20 seconds · boxes=8 on 9 · boxes=6 on 7 · boxes=5 on 7 · boxes=4 on 7
```
**Seven or eight boxes on screen for 29 of ~53 seconds.** §77 cut hundreds of per-element labels down
to a handful of set boxes and then hit crowding again from the other direction. HHS never exceeded 2
sets and Hospital 6, so this could not appear until a building with all eight rules live was baked —
which is the argument for baking an unfamiliar building on purpose.

**82.1 THE FIX, in the user's own words:** *"it is simply a matter of sequencing what comes on the
scene, require a simple routine of which can be delayed to later or if all seems equal appearance
slots, just stagger along consecutively with a 5 sec slot each. This is for earnest effort, some maybe
missed."* So:
- **Sets QUEUE rather than fire together.** When several become eligible in the same window, one takes
  the scene and the rest are DEFERRED, not dropped.
- **Order by opportunity where there is one to judge** — a set whose members will be on screen only
  briefly should go first, because the one with a long dwell can still be shown later. §77.3's exact
  dwell (from `plan.poseAt`, known before rendering) is what makes that judgement possible rather than
  guessed.
- **When they look equal, just take turns: `SET_SLOT_S = 5` each, consecutively.** No cleverness.
- **EARNEST EFFORT, NOT A GUARANTEE.** The user said it plainly — *"some maybe missed"*. A set whose
  members never come back into frame simply does not get shown, and that is acceptable. Do NOT bend
  the camera or hold a shot to fit a set in, and do NOT fabricate a slot: the closing summary cards
  already carry every set's total, so nothing is hidden even when a set never pulses.

**82.2 WHAT MUST NOT CHANGE.** The §78/§79 envelope (fill 1.4 · hold 1.2 · release travel 0.9 · fade
0.6 = 4.1s) is settled and the user has seen it; a 5s slot holds one 4.1s pulse with room to breathe,
which is why 5 fits. The box stays PINNED (§80.2) and states the set TOTAL (§77.2). Queueing changes
WHEN a set pulses, nothing about how it looks.

**82.3 TESTS.**
- **Q1 CONCURRENCY-CAP** — eight eligible sets in one window yield ONE pulsing at a time, not eight.
  Fails against today's code, which is the defect.
- **Q2 QUEUE-NOT-DROP** — the deferred sets still pulse later, in order; none is silently discarded.
- **Q3 SHORT-DWELL-FIRST** — given two sets, the one whose members leave sooner is scheduled first.
- **Q4 EQUAL-MEANS-STAGGER** — with equal dwell, sets take consecutive 5s slots.
- **Q5 MISSED-IS-HONEST** — a set whose members never return is never shown AND its total still
  appears on the closing card, so the film under-shows without ever under-reporting.

**82.4 NOTED IN PASSING — the storey split survives non-English storey names.** Terminal's storeys are
`Aras 01`/`Aras 02`/`Aras Tanah`, and §80's split produced `Storey="Aras 04, Aras 02, Aras 01, Aras
Tanah"` with `Room="≈ R3, ⚠ R1, ≈ R5…"`, filled=71 blank=3. Nothing assumed a `Level N` pattern —
`Aras Tanah` carries no digit at all. That is luck rather than design (the prefix comes from the
model's own ladder), and deserves an explicit test before anyone "tidies" `_storeyPrefixOf`.

### 83. ✅ DONE (2026-09-12) — §82 §RULE_FILM_SET_QUEUE shipped and PROVEN ON THE BAKE THAT FOUND IT
**bim-ootb `feat/rule-findings-film` @ `f135a63f`.** `viewer/rule_findings_film.js` only; no other file
touched. `witness_rule_findings_film.js` **26/26** (was 19/19), `tests/test_rule_mode_tint.js` 26/26.

**83.1 THE TEST NAMES THE DEFECT, not just the fix.** Run against the PRE-§82 file (`git show
HEAD:viewer/rule_findings_film.js` into a scratch tree), the six new checks fail with `boxes=8` and
`peak=8 over 81 samples` — the exact Terminal defect, reproduced by the witness rather than described
by it. Q1 CONCURRENCY-CAP · Q2 QUEUE-NOT-DROP · Q2b HANDOVER-BOUNDED · Q3 SHORT-DWELL-FIRST ·
Q4 EQUAL-MEANS-STAGGER · Q5/Q5b MISSED-IS-HONEST.
Q3 is the one worth reading: it drives a plan whose camera turns 90° across the film so the two sets
have genuinely different remaining dwell (13.25s vs 33.25s from `plan.poseAt`), and declares the
LONG-dwell rule FIRST — so a FIFO queue would pick the wrong one. It asserts the judgement, not the
plumbing.

**83.2 THE ONE DESIGN CALL, and the user endorsed it — THE SLOT ONLY EXPIRES WHEN SOMEONE IS WAITING.**
Queueing exists to cut crowding; with an empty queue there is no crowding to cut, and §78.3's held box
is a direct user instruction. So a lone set keeps the scene and behaves exactly as it did before §82 —
**P8 is unchanged, not weakened.** Without this rule §82 would have silently retired §78.3 on every
building that only ever shows one or two sets, which is HHS and Hospital both.

**83.3 THE REAL BAKE — `out/Terminal_lowres_v82.mp4`, the same building and settings that found the
defect.** `Terminal_silent` 854x480@15 `--gpu real`, all flags forced. 791 frames, 449s wall,
`aborted=no fileOk=true`. Identical inputs to the v80 baseline (`sets=8 marked=205
structuralTotal=158 egressTotal=47 maxExitDistM=96.4`, `§ROOM_GRAPH_EXITS exits=11 noRaster=0 of 135
doors`), so it is like-for-like and not a different film:
```
boxes on screen, per film-second (53 logged, from §RULE_FILM_SETS)
v80 pre-§82    2:1  3:2  4:7  5:7  6:7  7:20  8:9        peak 8
v82 post-§82   0:9  1:31  2:13                            peak 2
```
**All EIGHT rules held the scene**, in ten slots across 52.1s — `isolated_room → span_depth_steel →
span_depth_concrete → circulation_distance → floating_member → span_depth_concrete →
span_depth_cantilever → column_continuity → door_clear_width → span_depth_cantilever`. Two rules got a
second turn; the queue REFILLED at t=21 and t=38 (`queued=3→4`, `1→2`) when sets came back into frame,
which is §77.2's re-pulse gate still doing its job through the queue rather than around it.

**83.4 TWO HONEST NUMBERS THE BAKE PRODUCED, neither hidden.**
- **`boxes=0` on 9 of 53 seconds.** The scene-holder is off screen for part of its own slot, so the
  slot is partly spent on a set nobody can see. This is §82.1's accepted cost stated plainly ("some
  maybe missed"), and the `abandoned` rule only frees the slot after the holder has been gone
  `BOX_LINGER_S` (2s). 17% of the film. **Recorded, not fixed** — fixing it means either a shorter
  abandon threshold (flicker risk on brief occlusion) or re-selecting mid-slot, and neither should be
  chosen before the user has seen the clip.
- **`boxes=2` on 13 of 53 seconds.** The handover: the outgoing box fading across `BOX_LINGER_S` over
  the newcomer. This is the ONLY moment two boxes coexist, and it is the §77.2 collision nudge's
  remaining live use.

**83.5 OPEN, RAISED BY THE USER, DELIBERATELY NOT ACTED ON.** User, on seeing §83.4: *"The pulse or
wave fade off should also be earnest during the transition. But if not it is OK, let's eyeball first."*
So it waits for the eyeball. **The fact to check it against:** in a NORMAL handover nothing is cut —
the §78/§79 envelope is 4.1s inside a 5.0s slot, so the wave has released and gone dark ~0.9s before
the next set takes the scene. The only thing crossing a handover is the outgoing BOX. A pulse can be
cut mid-flight only on the `abandoned` path, and there its members are already off screen.

**83.6 REPRODUCING THE BAKE.** Terminal's DB carries the flag columns (`§CINEMA_PATH_RESTORE ...
flagCol=true buildup=1 roomTitle=1 reveal=1`, so §59.9's `flagCol=true` branch applies and the saved
path decides), but the flags were forced anyway — they resolve to the same values, and forcing removes
the ambiguity §59.6a got wrong once already:
```
node cli_silent_bake.js --db Terminal_silent --out out/Terminal_lowres_v82.mp4 --gpu real \
  --width 854 --height 480 --fps 15 --buildup --label --reveal --clash --measure --storey-reveal \
  --log out/Terminal_lowres_v82.log
```
`buildings/*_silent.db` are SYMLINKS to `~/Downloads/` (§59.6b's practice), verified before the run.
The per-second evidence line now carries the queue: `§RULE_FILM_SETS ... active=<rule> queued=<n>
waiting=<rules>` — grep that, never the frames.

### 84. SPEC (2026-09-12) — §SANITY_EXIT_STAT: the longest-path-to-exit figure on the FLASHING Sanity
### box, in the live panel's own wording
**Origin: the user.** *"The main BIM View session has taken on the 'Longest path to exit - ## steps'
which originated in specs here, so put that in also for next task when Sanity HUD is flashing
messages."* It did originate here — `viewer/rule_checklist.js`'s own comment on `feat/structural-sanity`
cites `prompts/MEP_CLASH_REVEAL_MOVIE.md §59.4` as the model it was built from.

**84.1 THREE SURFACES, TWO STRINGS — the ruling.** The viewer session flagged, correctly, that its
live-panel string is a strict SUBSET of the film's closing card and asked which way to converge. The
user ruled on the closing card directly — *"So it be in the closing HUD cards? OK keep that rich."* So:
| surface | string | status |
|---|---|---|
| closing HUD card (`cpe_resource_panel.js:352`) | `longest distance to exit — 80s / ~107 steps (96.4m @ 1.2 m/s est.)` | **unchanged, stays rich** |
| live panel status bar (`rule_checklist.js:_rcShowLongestExitStatus`, `feat/structural-sanity`) | `Longest path to exit — ~107 steps` | shipped there, unchanged |
| **in-film Sanity set box (THIS SPEC)** | `Longest path to exit — ~107 steps` | **to build** |
**Why the film box takes the SHORT string and not the rich one:** the closing card is a held still the
viewer can read at leisure; the set box flashes for one 5s slot on a moving frame. §73.0 already ruled
this axis once — *a film is not a web page* — and the same logic decides the budget here. Rich where
there is time to read, short where there is not. **This is not the live panel growing or the film
shrinking; it is two different surfaces each carrying what it can hold**, which is why the viewer
session was right not to assume a direction.

**84.2 WHERE IT GOES — the `circulation_distance` box only, as a THIRD LINE.**
- **That rule OWNS the number.** It is the worst `ratio` across `circulation_distance` rows —
  `RoomGraph.escapeRoute()/shortestPath()` metres, `egress_sanity.js`'s own field. On a
  `door_clear_width` or structural box it would be a true number attached to the wrong finding.
- **A line, never a ninth box.** §82 has just spent a whole session cutting the box count from 8 to 2;
  a new box would hand it straight back. The box already renders `lines[]` in a loop and sizes to the
  widest, so a third line costs one array entry.
- **Its own line, under `19 flagged`.** The total is a COUNT and the exit figure is a MAX. On one line
  they read as one quantity.
- The number is already computed — `_stats.maxExitDistSteps` (`rule_findings_film.js:281`), built once
  at evaluate time. Nothing is re-measured per frame.

**84.3 THE `~` IS MANDATORY, not decoration.** `STEP_M = 0.75` has no precedent anywhere in this
codebase — this file's own header says so, and `rule_checklist.js`'s comment says it independently
("a standard adult-stride ergonomic convention from OUTSIDE this project"). Both surfaces already
write `~`. **A HUD line that drops it states an estimate as a measurement**, which is the one thing
the Prime Directive forbids outright. Null, never `0 steps`, when no `circulation_distance` row
exists — both existing implementations already hold that contract.

**84.4 ⚠ THE §65 HAZARD, CONCRETE AND ALREADY REAL.** `0.75` and the `Math.round(metres / 0.75)`
conversion are now written TWICE, on two branches that have not met: `STEP_M` in
`rule_findings_film.js` and an inline `0.75` in `_rcLongestExitSteps` on `feat/structural-sanity`. The
arithmetic is identical TODAY — both round the same way, so the two surfaces agree — and that is
exactly the state §65 warns about: *share the implementation, never copy the values; two copies drift
the moment either is retuned.* **When PR #1715 lands and `feat/structural-sanity` merges into this
branch, extract ONE helper (constant + conversion + string) and have all three surfaces call it.** Do
not build a third copy for the film box in the meantime — read `_stats.maxExitDistSteps`, which is the
film's single existing source.

**84.5 BRANCH STATE — do NOT look for this on main.** `_rcShowLongestExitStatus` lives on bim-ootb
`feat/structural-sanity` (**PR #1715**, in CI as of 2026-09-12, user mid-merge). Verified today:
`git merge-base --is-ancestor origin/feat/structural-sanity feat/rule-findings-film` → **NOT an
ancestor**, and the string is absent from `origin/main`. §81's warning that `feat/structural-sanity`
is still not in the tree is the same fact; this spec is the second thing now waiting on it.

**84.6 TESTS.**
- **E1 RIGHT-BOX-ONLY** — the exit line appears on the `circulation_distance` box and on NO other set's
  box, structural or egress. Fails any implementation that puts a true number on the wrong finding.
- **E2 ESTIMATE-MARKED** — the rendered line contains `~`. Assert the drawn text, not the constant.
- **E3 DROPPED-NEVER-ZERO** — with no `circulation_distance` row the box has two lines, not a third
  reading `0 steps`.
- **E4 SAME-NUMBER-AS-THE-CARD** — the box's step count equals `_stats.maxExitDistSteps`, i.e. the
  closing card and the flashing box cannot disagree about the same building.
- **E5 STILL-ONE-BOX** — adding the line does not add a box: §82's Q1 concurrency cap still holds with
  the exit line present. The check that stops §84 from quietly undoing §82.

### 87. SPEC (2026-09-12) — §RULE_REPORT: the findings WITHOUT the film, and a Report button on the
### Sanity panels. One builder, three surfaces.
**⚠ OWNED BY ANOTHER SESSION (user, 2026-09-12): the compliance-integrity session is implementing this.
Do not start it from this lane.** The spec below is the handover; §87.3's "must not ride
`ruleFindingsFilmBuild`" and §87.5's "a zero IS a result here" are the two things easiest to get wrong.
**Origin: the user.** *"What is next to disrupt the BIM playing field of fast hassle free usage?"* —
then, on the answer: *"spec the findings-only run, and where can we pin it? In the Sanity panels as a
'Report' export?"* Yes, and in the GENERIC chassis so both panels get it from one edit.

**87.1 THE MEASURED CASE. The model already knows everything, then spends an hour and a half drawing
it.** From the two bakes run this session:
| building | findings complete | film complete | analysis share |
|---|---|---|---|
| Terminal (316MB, 48,428 elems) | **+42s** | +1,194s | 3.5% |
| Hospital (315MB, 64,150 elems) | **+101s** | ~+6,000s | 1.7% |

Hospital's own milestones, read off `out/Hospital_FULL_1080p_v86.log`:
```
 +71.3s  §CLI_BAKE_LOADED building=Hospital meshes=4907      ← model load
 +73-88s §CINEMA_* path planning, twice                       ← SKIPPABLE
 +88-100s glow staging, §RENDER_LOOP, §PHOTO_SHADOW_*         ← SKIPPABLE
+100.1s  §ROOM_GRAPH_EXITS exits=8 noRaster=7 of 440 doors
+101.3s  §RULE_FILM sets=6 marked=509 ... maxExitDistM=106.9  ← 509 findings, ~1s of evaluation
```
**The rules cost about a second.** ~29s of the 101s is cinema planning and render staging a report does
not need, and **71.3s of it is model load, which a report cannot go below** (§87.10). `cli_silent_bake.js`
has `--opening-only` but nothing that stops at the knowing.

**87.2 THE SHAPE — ONE PURE BUILDER, THREE SURFACES.** `viewer/rule_report.js` exports
`buildRuleReport(rowsS, rowsE, ruleDefs, meta)` → a plain object. No DOM, no THREE, no camera, no
`plan`. Then:
| surface | how it gets there |
|---|---|
| CLI | `cli_silent_bake.js --findings-only` → writes `<out>.json`, exits before the first frame |
| Sanity/Egress panels | a **Report** button → the same object → Blob download |
| the film's closing card | `rule_findings_film.js` `_stats` reads the SAME builder |
**All three must be unable to disagree about one building.** This is §84.4's lesson applied BEFORE the
drift rather than after it: `0.75` m/step is currently written twice across two branches precisely
because two surfaces each grew their own copy. One builder, or this repeats.

**87.3 ⚠ THE REPORT MUST NOT RIDE `A.ruleFindingsFilmBuild`.** That function needs a `plan` (§77.3's
dwell precompute calls `plan.poseAt`), `A.showRuleModeTint` (to populate `A._ruleTintAt`) and later a
camera. A findings-only path that calls it inherits every dependency it exists to skip. Call
`StructuralSanity.evaluate(dbQuery, rules)` and `EgressSanity.evaluate(dbQuery, rules)` DIRECTLY — the
same evaluators the panels and the film already share, with zero duplicated rule logic (this file's
own founding constraint). RoomGraph still loads, because egress genuinely needs it.

**87.4 WHAT IS IN IT — only what already exists, nothing composed.**
- **Provenance header**: db name + bytes, commit, sw version, timestamp, and **`rulesSource` per file:
  `fetched` or `fallback`.** `§RULE_FILM_RULES_JSON` already draws that distinction and a report that
  hides it would present this file's hardcoded fallback thresholds as the project's authored ones.
- **Per-rule set totals** — the §77 unit, the same grouping the film boxes state.
- **Per-finding rows**: guid, ifc_class, `shortName()`, storey, rule, severity, and the value through
  §63.1's `valueRow` — never a bare `ratio`, which is metres for `door_clear_width` and a real
  dimensionless ratio for `span_depth_*`.
- **Egress stats**: `maxExitDistM/Sec/Steps`, carrying §84.3's `~` and the `est.` disclosure.
- **Room-graph facts**: `exits`, `noRaster`, `doors` — §ROOM_GRAPH_EXITS's own numbers. §59.7's two
  silent defects (`exits=0 noRaster=133/133`) are exactly the shape this surfaces without a bake.

**87.5 A ZERO IS A RESULT HERE — a deliberate divergence from the film, stated so nobody "fixes" it.**
The film DROPS a vacuous card (§59: one per non-empty category, "never a fabricated zero"). A report
must list a rule with **0 findings explicitly**. "We checked `door_clear_width` and found none" is
information on a page and noise on a moving card. Same data, different surface, different right answer.

**87.6 DETERMINISM IS THE POINT.** Same DB → byte-identical report but for the timestamp. That is what
makes it diffable across builds and across rule changes — and **that is the actual disruption**: today
sharpening any of the eight rules costs a full bake to see on a real model, so nobody sharpens them.
At ~80s a rule change can be tried against a fleet of buildings in an afternoon.

**87.7 FORMAT — one JSON object.** The CLI writes `<out>.json`; the panel downloads the same bytes
through the convention already in the tree at `variation_order.js:267` (Blob → `a.download` →
`URL.revokeObjectURL`, plus a `§`-tagged console line). **NOT xlsx now** — `exceljs` is already here for
Variation Orders and can be layered on the same builder later; putting a spreadsheet library in a
headless CLI path buys nothing today.

**87.8 THE PIN — where the button goes.** `viewer/rule_checklist.js` `_buildRuleChecklistHtml(config)`
is a GENERIC chassis: it already renders a button row ("All" + one per `config.categories`) and a Close
button, and both `A.showStructuralSanity` and `A.showEgressSanity` call it with their own config.
**The Report button joins that row, once.** Do not add it per panel. `A._ruleChecklistOpeners` is
already a registry for the deep-link feature, so a third rule panel added later inherits Report for
free. The button reports what the panel is currently showing — `config.rows` — so the category filter
the user has applied is honoured rather than silently ignored.

**87.9 TESTS (R-series).**
- **R1 PURE** — the builder runs in Node with no DOM, no THREE, no camera, no plan. Fails any version
  that reaches for film state.
- **R2 SAME-NUMBERS** — builder totals equal `A.ruleFindingsFilm.stats()` for the same rows. The film's
  closing card and the report cannot disagree.
- **R3 ZERO-IS-LISTED** — a rule with 0 findings appears with 0, where the film drops it. Asserts §87.5
  is deliberate.
- **R4 PROVENANCE** — with the fetch failing, `rulesSource` says `fallback`. Fails a report that
  presents fallback thresholds as authored.
- **R5 UNIT-NOT-BARE** — `door_clear_width` reports `0.80 m` and `span_depth_steel` reports
  `ratio 27.3`. §63.1's overloaded field never printed bare.
- **R6 DETERMINISTIC** — the same rows twice give identical JSON but for the timestamp.
- **R7 NO-FILM-DEPS** — a `--findings-only` run emits no `§MAXQ_*` line and no frames, and exits
  non-zero only on a real failure. Grep the log, per §80.1.

**87.10 OPEN, AND NOT SOLVED BY THIS — THE LOAD.** 71.3s of Hospital's 101.3s is model load, and the
report cannot go below it; §81.3's twice-observed load-time kill sits on exactly this path. Findings-only
makes that cost the WHOLE cost instead of 1.7% of it, which is what makes it worth attacking — but
§81.3's own advice stands: measure peak RSS across the load phase before changing anything.

### 88. RESOLVED (2026-09-13) — §BUILDUP_GROUND_SLAB: Hospital's 8,899 m² ground floor read as
### bare earth for a whole film. Two independent defects, one regression and one latent.
**Origin: the user, on the recovered Hospital v86 film** — *"indeed it has gone missing during initial
seconds, not built."* Four sessions chased the ghost-ground plane. It was neither the plane nor the
renderer.

**88.1 THE REGRESSION — `7af3fd64`, 2026-09-11 15:29:10 +0800, `viewer/streaming.js`, two lines.**
§BATCH_BUCKET_CLASS_PAINT appended `+ '|' + (el.ifcClass || '')` to the BatchedMesh bucket key (and
the matching consolidate key). An ancestor of `8e53455b`, the commit v86 was baked from.
**Proved against its own parent** — `42340b46` vs `7af3fd64`, same DB, same `--clip 0:0.02`, same
1920×1080 frame 38, Day 13:
```
42340b46 (parent)   frame=23 placedOps=1008 visible=TRUE   frame=24 placedOps=1042 visible=TRUE
7af3fd64 (+1 line)  frame=23 placedOps=1008 visible=FALSE  frame=24 placedOps=1042 visible=FALSE
```
Identical guid, `placedOps`, `groundY`, `host=BM`. Only `visible` flips; the frames agree — concrete
deck in the parent, bare earth in the child.

**88.2 THE MECHANISM — the line did not break anything, it REMOVED AN ACCIDENT.**
`§XRAY_STAGING_REMOVED` had been holding that slab back on **every one of the 18 Hospital bakes on
record** (`§GANTT_SOURCE` appears in none of them), because its schedule said 20 in-extent foundation
walls finish 13.47 h AFTER the slab they carry. With the slab sharing a 13-slot BatchedMesh
(`id=2990 slot=3`), a stale `setVisibleAt(true)` survived the `_incrOK` delta skip and it drew anyway.
The class term isolated it into a 1-slot batch (`id=3304 n=1`), the gate applied in full, and the
floor vanished. The staging map is byte-identical either way
(`solidifyTsForGuid=1789798254510`) — only whether the verdict reached a pixel changed.

**88.3 BOTH ARE NOW FIXED, and the second fix retired the first.**
- The schedule defect is `prompts/4D_SCHEDULE_PERFECTION.md` §SCHED_TASK_BUCKET_SPLIT_BRAIN —
  28 Level 1 "Foundation" walls filed under the wrong task. **Fixed by §KERNEL_OPS_SCHED_AGREE
  (#1727)**: Hospital re-derives, the walls land 11.8 days BEFORE the slab, `staged 544 → 498-501`,
  the slab leaves the staging map entirely.
- With the hold gone the 1-slot batch is harmless, so the class term was **restored** — the
  foreign-class paint it fixed (~5,998 Hospital elements) stays fixed. The temporary revert is dead.

**88.4 REFUTED — do not re-open any of these.**
| suspect | why it is dead |
|---|---|
| §GHOST_GROUND coplanar plane | the plane sits at the slab's UNDERSIDE (`z=165.36`), 0.45 m BELOW its top face. A downward raycast hits the slab at `y=-15.427` BEFORE the ground at `y=-15.877`. |
| §STOREY_REVEAL_XRAY (#1696) | **0 lines** in the v86 log — §55.1 replaced it with §FACADE_ONLY_TINT. |
| DLOD (#1660) | `§DLOD_DISABLE reason=time-machine` at +72.5 s, before frame 0. |
| §BM_BOUNDS_CULL | the stored sphere IS 4.583 m short (`r=62.251` vs `66.834`) but `storedSphereInFrustum=true` at every pose sampled. |
| Triplanar paint | `§TRIPLANAR_INIT class=IfcSlab tex=concrete_color_1k.jpg` — a slab that draws, draws as concrete. |
| The bake "inventing a setting" | browser and CLI call the identical verbs and took the identical branch, measured in four headful-GPU runs. |
| A ground-bearing exemption in the gate | **WRONG FIX.** The gate is correct: it refuses to draw an element whose support is unfinished. Exempting ground-bearing slabs teaches it to ignore the exact case it exists for. |

**88.5 STILL OPEN — the `_incrOK` stale-visibility hole.** A slot's `setVisibleAt` can survive a tick
where the delta path skipped its BatchedMesh. That stale `true` is what hid a real 13.47 h schedule
inversion for however long it was in the data. A gate that only applies when the batch happens to be
touched is not a gate. Note the direction: fixing this WITHOUT the schedule fix makes more floors
vanish, not fewer.

**88.6 TECHNIQUES THIS COST US, WORTH KEEPING.**
- **`--clip 0:0.02`** bakes the first 2 % of the SAME film — real pacing, real camera path — in ~2 min
  instead of ~98. Every A/B above used it.
- **§CPE_BUILDUP_PLACED** (#1723) names a guid and the frame its state changed, in all three render
  branches. Measured on Hospital: **0 single meshes carry a guid** — 38,169 BatchedMesh slots and
  25,013 InstancedMesh slots — so any "is it drawn?" question must be asked of the batched branches.
- **`§CLI_BAKE_FAIL_NO_TIMELINE`** (#1725/#1726): a bake that resolved buildup ON and armed no
  timeline now aborts non-zero instead of delivering a silent, exit-0 film without it.
- **Never re-type a shipped predicate in a test.** A re-typed carrier predicate (wrong `seq` map,
  missing `SEQUENCE_NAME_OVERRIDES`) produced a confidently wrong "not staged" answer that cost a
  whole round. Slice it from source or call it.


## §89 THE TINT CONTRACT IS A CROSS-FILE DEPENDENCY AND NOTHING WAS GUARDING IT (2026-09-13, `fix/bucket-key-floor` @ `ee7666ac`, worktree `/tmp/wt-v87`)

**89.1 WHAT HAPPENED.** The v87 merge of `origin/main` into the rule-findings film branch took main's
`viewer/rule_checklist.js` wholesale. Main's copy never had the film-facing half of the tint API, so
the merge DELETED, in one file, everything §62/§67/§70/§70.6/§71/§78 had added there:
`A._ruleTintAt` (the per-guid world-position map), `A.ruleTintShowOnly` (the §78 intensity driver of
the depth wave), the `opts` third argument (`shineThrough`/`filled`), `ruleTintRowsFor`'s SECOND
table (`spatial_structure`, i.e. every injected ROOM), and the `userData.ruleTintGuids/ruleTintMats`
the wave writes through. The 1080p v87 bake then logged `§RULE_FILM sets=5 marked=398` — findings
produced, hardened counts correct — next to `§RULE_FILM_DWELL members=0 everVisible=0 ms=1` and ZERO
`§RULE_FILM_SETS` lines: no box drew for the whole film.

**89.2 THE ENGINES WERE NOT THE CAUSE — measured, not assumed.** Both `evaluate()` returns were run
side by side against `buildings/Hospital_meta.db` in one node harness before anything was edited.
Branch: `{guid, ifc_class, name, storey, rule, severity, ratio}` (+`target` on egress). Main: the
same seven keys plus an ADDITIVE `witness` (#1718 T8). `guid` is a non-empty string on 100% of rows
on both sides (488/488 and 384/384 structural, 145/145 and 142/142 egress). The return shape is
backward-compatible; `st.guids` was never the broken link. Always measure both shapes before
adapting one to the other — the obvious suspect here was innocent.

**89.3 THE REAL LINK.** `rule_findings_film.js` reads `A._ruleTintAt` TWICE — the §77.3 dwell
precompute (`_allGuids` only admits a guid that has an entry) and the per-frame composite
(`if (!ctx || !_sets.length || !cam || !at ...) return 0`, which is ABOVE the `§RULE_FILM_SETS` log).
One missing producer therefore silenced the members count AND the whole per-frame log in one stroke.
§87.3 already names this dependency in prose; nothing enforced it.

**89.4 THE FIX — restore the producer, in the rules-presentation lane.** The film-facing tint code
was re-applied onto main's `rule_checklist.js` (145+/19-), NOT reverted file-wise: main's #1718 T8
report/sufficiency/witness work and `_rcShowLongestExitStatus` are untouched, and the panel's own
call `A.showRuleModeTint(map, colorMap)` keeps main's exact material and `renderOrder = -1` because
every film-only behaviour hangs off the absent third argument. Re-deriving the positions inside the
film was rejected: §70's "these are the SAME points the boxes were placed at" is the invariant, and a
film-side copy would have anchored room labels at rooms that main's element_transforms-only query
draws no marker for at all.

**89.5 MEASURED AFTER (clip bake `--clip 0:0.05 --measure --fps 24 --gpu real`, `out/rf_test.log`).**
`§RULE_FILM sets=5 marked=398 structuralTotal=384 egressTotal=14` (hardened counts survive the fix)
· `§RULE_TINT_ROOM_GEOM n=6 resolved from spatial_structure` · `§RULE_TINT_NO_GEOM n=8` (synthetic
`CORRIDOR_ROOM::*` guids, in neither table — named, never silent) · `§RULE_TINT_ENTER elements=390
colors=2 guidsAsked=398 shineThrough=true renderOrder=900` · `§RULE_FILM_DWELL members=390
everVisible=390 ms=18` (was `members=0 ... ms=1`) · 10 `§RULE_FILM_SETS` lines with a populated
`visible={...}` · `§CLI_BAKE_WALL totalSec=171 aborted=no fileOk=true`. 398 asked − 8 geometry-less
corridor guids = 390: the gap is explained by a log line, not by a guess.

**89.6 WHY EVERY TEST STAYED GREEN — and the check that earns its place.** `witness_rule_findings_film.js`
STUBS `showRuleModeTint` and assigns `_ruleTintAt` itself (`A: { showRuleModeTint: function () { this._ruleTintAt = AT; } }`),
which is right for the film's own logic but means the witness cannot see the real producer vanish;
`tests/test_rule_mode_tint.js` only guards the material constant. So 37 + 11 + 26 + 108 checks passed
against a film that drew nothing. New check **C1 CONTRACT** in the film witness asserts, against the
real `viewer/rule_checklist.js` SOURCE, that both `A._ruleTintAt =` and `A.ruleTintShowOnly =` are
still defined there — the cheapest possible guard on a dependency that only a merge can break, and
the one that disproves this exact regression. A witness that mocks a collaborator must also assert
the collaborator still exists.

## §90 THE CLOSING STOREY REVEAL — NOT BROKEN, NEVER SWITCHED ON, AND ITS REAL PROBLEM IS THAT
## NOBODY CAN SEE IT (2026-09-13, brief for a NEW session)

**90.1 FIRST, THE BORING PART — v87 baked with the reveal OFF.** Not a code defect:
```
v86  storeyReveal=1   STOREY_REVEAL_LIST=1  TINT=8  TIMING=8  STATS=8
v87  storeyReveal=0   STOREY_REVEAL_LIST=0  TINT=0  TIMING=0  STATS=0   (FIT=8 WINDOW=8 — the
                                                                         window still computes)
```
`cpe_storey_reveal.js` loads, `§STOREY_REVEAL_FIT`/`_WINDOW` compute normally; the visual simply never
arms because the flag was off. `Hospital_FULL_1080p_v87c.mp4` was baked `--measure --fps 24` with no
`--storey-reveal`, and the stored path has it off. **Re-bake with `--storey-reveal` and expect v86's
`LIST=1 TINT=8 TIMING=8 STATS=8` back.** Do that before touching anything — it costs one bake and it
is the whole of this symptom.

**90.2 THE REAL PROBLEM, MEASURED ON v86 — the reveal happens where nothing can see it.**
v86 DID run the reveal, and it still reads as nothing. From its own log the beat is real:
```
§STOREY_REVEAL_LIST n=8 storeys=[Level 1..Level 7]
§STOREY_REVEAL_FIT windowSec=10.04 minSlotSec=1 storeysAvailable=8 shown=8 slotSec=1.25 (all storeys fit)
§STOREY_REVEAL_TINT storey="Level 1" color=#2979ff meshesTouched=19 clonedMaterials=0
§STOREY_REVEAL_STATS storey="Level 1" doors=114 walkable=6481m2 footprint=98.6x90.3m rooms=4 compiled
```
but the frame at that exact moment (v86 frame 4276, `tNorm=0.9078`) shows **a solid building from
outside, with no blue anywhere**. Level 1 is the GROUND floor: its 19 tinted meshes are behind the
facade and under six storeys of roof. The stat card lands, the tint does not. Same for every lower
storey; only the top one or two can possibly show.

**90.3 WHY THE OBVIOUS FIX IS ALREADY RULED OUT.** Do not reach for x-ray — §55.1/§55.2 tried and
retired it: `A._matCache`'s key has no storey component, so instanced/batched materials are SHARED
across storeys and true per-storey x-ray is infeasible; darken-above was abandoned after two tuning
passes because instanced tint is per-instance ALBEDO, not emissive, so a face turned from the sun
stays dark regardless. §FACADE_ONLY_TINT shipped instead — tint only that storey's exterior walls —
which is why an orbiting camera sees anything at all. **The unsolved half is the storeys whose facade
is small or occluded, and the interior the stat card is describing.**

**90.4 WHAT TO PURSUE, IN THE ORDER THAT COSTS LEAST.**
1. **Re-bake with `--storey-reveal` and LOOK.** Decide from real frames how much of each storey's
   facade tint actually reads at the reveal camera's distance. Quote frames, not adjectives.
2. **The camera, not the material.** The reveal currently plays during the pull-out orbit
   (`windowStartFrac=0.9077`, `orbitStartFrac=0.9590`) — one fixed exterior arc for all 8 storeys.
   A section cut, a per-storey camera that drops to that floor, or an exploded/offset lift are all
   things the codebase can already express and none of them need the shared-material problem solved.
3. **1.25 s per storey is the real budget.** 8 storeys in a 10.04 s window of a 195.8 s film. Whatever
   is designed has to be legible in 1.25 s — that constraint, not the tint colour, is what makes this
   a wow beat or a blink.
4. **The stat card already works and STAYS — it is not the fallback.** `doors=114 walkable=6481m2
   footprint=98.6x90.3m rooms=4` lands every time; the HUD half of this beat is sound and the user
   wants it kept alongside the geometry, not instead of it.

**90.4a THE USER'S OWN DIRECTION FOR THE NEW SESSION (2026-09-13, verbatim intent):** *"repair it to
truly show the facade of each storey well, with the HUD info, and continue creating more wow
moments."* So the goal is NOT to decide the geometry cannot read and retreat to the card. **Each
storey's facade must genuinely be shown**, legibly, with its stat card riding along — and the closing
sequence is expected to grow more such moments, not fewer. Read §90.3's retired approaches as
constraints on HOW, never as evidence that it cannot be done: the camera and the beat structure are
untouched ground, and §FACADE_ONLY_TINT already proves the per-storey facade SET is computable
(`meshesTouched` is non-zero for all 8). The unsolved problem is making that set fill the frame.

**90.5 DO NOT RE-TEST.** §STOREY_REVEAL_XRAY is dead code in this build (0 lines, §55.1). The reveal
window arithmetic is correct (`realWindowSec=10.04 = windowFrac 0.0513 × 195.8 s`). `meshesTouched`
is non-zero for every storey, so the tint is finding its geometry — the problem is sightline, not
selection.

## §91 THE BAKE KILLS THE SESSION — systemd-oomd, NOT the kernel, NOT Claude (2026-09-13,
## diagnosed after three consecutive session deaths in the bake-perf lane)

**91.1 THE EVIDENCE.** Three sessions in this lane died within eight minutes. All three are in
`/var/log/syslog`, and all three are the same event — `systemd-oomd` SIGKILLing the whole
gnome-terminal tab cgroup that the bake was launched from:
```
09:42:18  vte-spawn-3cf6ddad….scope  oom-kill  26.4G memory peak, 214.9M swap peak  (session 10865afa)
09:45:56  vte-spawn-c51ca5ac….scope  oom-kill  26.6G memory peak, 861.9M swap peak  (session 3d1433d7)
09:49:32  vte-spawn-d37d3840….scope  oom-kill  25.7G memory peak,   1.1G swap peak  (session 1fa10b25)
          "systemd-oomd killed 31 process(es) in this unit"
Killed …/vte-spawn-d37d3840….scope due to memory pressure for /user.slice/user-1000.slice/
user@1000.service being 77.37% > 50.00% for > 20s with reclaim activity
```
The same storm also killed Firefox at 09:38 (19 procs), so this is not Claude-specific — oomd kills
whichever child scope is the worst offender, and the bake tab always is.

**91.2 THE MECHANISM — and why the usual evidence is empty.** Policy on this box is
`ManagedOOMMemoryPressure=kill`, `ManagedOOMMemoryPressureLimit=50%`,
`DefaultMemoryPressureDurationSec=20s` on `user@1000.service`. oomd is PSI-based and kills a whole
cgroup unit; it is NOT the kernel OOM killer. Therefore **`dmesg` is empty, `/proc/vmstat oom_kill`
is 0, and the user slice's `memory.events oom_kill` is 0** — do not conclude "no OOM happened" from
those three. `grep -a 'systemd-oomd killed' /var/log/syslog` is the only place it shows.
Because `claude` and the bake are children of the SAME vte scope, killing the offender kills the
session. Sibling sessions (~200 MB each, SQL/log work) are never selected — which is exactly why
only this lane died and the other two lanes ran through it untouched.

**91.3 THE FOOTPRINT IS REAL, NOT A LEAK.** In-flight sampling of the bake tree (PSS, not RSS —
headless Chrome shares large mappings and summing RSS double-counts):
```
ts_s  tree_pss_mb  nproc  sys_avail_mb  swap_used_mb  top_proc
 0        28         2      27793          2227       node:28MB
 6      6910        25      19637          2227       type=renderer:1041MB
13     17170        26       9952          2227       type=renderer:3465MB
23     27317        26       1264          3128       type=renderer:4183MB   ← 23 s from idle to death
48     27221        26       1127          3335       type=renderer:4152MB
```
One `cli_silent_bake.js --width 1920 --height 1080 --gpu real` on `Hospital_silent` = ~26 GB on a
31.8 GB box, reached in 23 seconds. `cli_silent_bake.js` opens a single `newPage()` (line 187) — there
is no concurrency knob to turn down; the 26 processes are one Chrome's own process tree.

**91.4 MANDATORY FROM NOW ON — launch every bake through `./bake_scope.sh`.** It puts the bake in its
own transient systemd scope, a sibling of the terminal's scope rather than a child. oomd then selects
the BAKE scope as the offender and the session survives. Never call `node cli_silent_bake.js`
directly from a session again:
```
./bake_scope.sh node cli_silent_bake.js --db Hospital_silent --out out/x.mp4 --gpu real ...
```
The wrapper prints the scope name on entry and the cgroup's own `memory.peak` on exit
(`§BAKE_SCOPE_PEAK rc=… memPeak=… swapPeak=…`) — that number is the honest per-bake footprint and
belongs in any perf claim made in this lane. If the scope is killed there is no `§BAKE_SCOPE_PEAK`
line at all, only `§BAKE_SCOPE_KILLED rc=137|143`; that absence is the signal.
**No cap is applied by default, deliberately** — a hard cap distorts the very wall-clock this lane
measures. Caps are opt-in, and one measured caveat matters: `BAKE_MEM_MAX` **alone does not stop
anything** (verified 2026-09-13 — a cgroup at `memory.max` spills to swap and only OOMs once swap is
gone too; a 400 MB allocation under `MemoryMax=200M` completed, `swapPeak=0.2G`). Set
`BAKE_SWAP_MAX=0` alongside it to get a real hard stop (verified: same allocation then dies, session
untouched). `BAKE_MEM_HIGH` is the soft brake — it throttles by reclaim and never kills.

**91.5 THE PERF LANE'S MEASUREMENTS, RESCUED FROM THE THREE DEAD SESSIONS.** All real-GPU,
1920×1080, `Hospital_silent`, `--clip 0.20:0.215`, 70 frames. Nothing here is merged yet; the
worktree is `/tmp/wt-bake-perf` on `perf/bake-frame-cost` with `viewer/cinema_maxq.js` +
`viewer/effects.js` still dirty.
- **Where the per-frame second goes** (`§MAXQ_FRAME_PHASE`, steady state i=20..60):
  `totalMs≈1000 = setupMs≈72 + foldMs≈700 + captureMs≈190 (webp≈180) + idbMs≈6`. The fold is 70 %
  of the frame; the encode is 19 % and is **pure throwaway** — every frame is decoded again and
  re-encoded to H.264 by the mp4 muxer afterwards.
- **Encoder A/B on identical frames** (`§MAXQ_ENCODE_AB`, 13 samples): `jpeg q0.95 = 21–35 ms`,
  `webp q0.92 = 148–206 ms`, `png = 60–75 ms`. JPEG is **~6.4× faster than the WebP in use**
  (27 ms vs 173 ms median) at ~2.4× the intermediate bytes, which never reach the deliverable.
- **Is the swap visible?** §R10's RMS instrument, 38 frames: noise floor (webp A vs webp B)
  `rms_mean=0.706, max=1.884`; treatment (webp vs jpeg q0.95) `rms_mean=1.471, max=2.917`. **Real but
  tiny — and NOT yet under the floor.** The session died mid-way through re-running the treatment at
  `jpeg q=1.0` to get it under the noise floor. That run is the first thing to redo.
- **A second, independent lever, found and not yet acted on:** the fold-completion poll sleeps 100 ms,
  so every frame overshoots by ~50 ms after the render is already finished. Worth ~5 % of the frame on
  its own and it is orthogonal to the encoder question.

**91.6 WHAT IS STILL OPEN IN THE PERF LANE.** (a) the `jpeg q=1.0` RMS re-run of 91.5; (b) the 100 ms
fold poll; (c) the fold itself at 700 ms/frame — untouched and by far the biggest term, no root cause
yet. Do NOT claim a speed-up in this lane from an encode number alone: the deliverable is wall-clock
per frame from `§CLI_BAKE_WALL`, on a bake launched through §91.4's wrapper so the figure is not
polluted by swap thrash.

## §92 THE STOREY REVEAL, SETTLED WITH THE USER — SECTION CUT, NOT TINT, NOT FADE
## (2026-09-13, design agreed in session; supersedes nothing in §90, it answers §90.4)

**92.1 THE RULING.** The closing reveal becomes a **rising section cut**: a horizontal clip plane
sweeps bottom-up, pausing at each floor slab, so each storey's facade is exposed as the plane passes
it. The user's words: *"section cut reveals each storey is already powerful optics and fade is
counter art."* The stat card rides along exactly as it does now (§90.4.4). This answers §90.4.2 —
"the camera, not the material" — from the geometry side instead.

**92.2 WHY FADE IS NOT AN OPTION HERE — it is unbuildable on Hospital, not merely disliked.**
A per-storey fade needs per-storey opacity. It does not exist in this build:
- The per-storey material-clone path IS implemented (`cpe_storey_reveal.js:424-440`, the
  `§STOREY_REVEAL_TINT_SHARED_MATERIAL` fix of 2026-09-06) but it only catches
  `o.isMesh && o.userData.storey === storeyName`. On Hospital that set is empty — v86's own log reads
  `§STOREY_REVEAL_TINT storey="Level 1" meshesTouched=19 clonedMaterials=0`, and
  `§SHADOW_FRONTIER_AT_CAPTURE` states it outright: "no individually-meshed elements in this scene —
  all geometry is batched/instanced".
- The tint therefore survives only because `setColorAt` writes per-instance DIFFUSE. There is no
  per-instance alpha on InstancedMesh or BatchedMesh, so opacity stays on the SHARED material and
  fading one storey repaints the building — the exact 2026-09-06 bug, re-entered by a new door.
- What IS per-instance is **visibility** (`bm.setVisibleAt`, `grid_views.js:245`, `dlod.js`) — a hard
  pop-in, not a fade. And what is immune to the whole shared-material problem is the **clip plane**,
  because a world-space cut is geometry, not a material property. That is why §90.3's retirement of
  x-ray and darken-above does NOT extend to this: it is not the same class of mechanism.

**92.3 THE MECHANISM ALREADY EXISTS AND IS ALREADY LOADED ON THE BAKE PAGE.** Nothing new to build:
- `GridViews.applyFloorClip(A, env, viewMode, cutZOverride, hideSet)` — `grid_views.js:191`, exported
  at `:390`. Takes an arbitrary cut Z. Applies to plain meshes AND `BatchedMesh` (`:217/:237`) with
  `clipShadows = true`. `clearFloorClip` at `:260`.
- `renderer.localClippingEnabled = true` is already set at `scene.js:119`.
- `viewer.html:946` loads `grid_views.js` on the same page the bake drives.
- `material.clippingPlanes` is an ARRAY; the shipped code passes one plane. Two planes (a storey's
  floor and its ceiling) isolate a single storey band — that was the "sandwich" option; the user chose
  the rising single-plane cut instead, but the two-plane form costs the same and stays available.

**92.4 THE BUDGET — and a correction made in-session.** The reveal window is sized against
`_useSec.rise`, the UN-folded pullback. `effects.js:8073` records it **measured at 30.8 s on
Hospital**, and the clash pair-card rotation independently measures its own pullback window at
**25.9 s** (`cinema_maxq.js:2315` — "7 cards x 4.5 s overran the 25.9 s window"). The 17.6 s that
appears in `cpe_storey_reveal.js`'s header §CINEMA_PACING breakdown is the NATURAL/folded pacing and
is the wrong number for this purpose — it was quoted in session and corrected. Today the reveal uses
10 shape-seconds of that (`STOREY_REVEAL_WINDOW_SEC = 10`, `effects.js:8078`), measured as
`§STOREY_REVEAL_FIT windowSec=10.04 slotSec=1.25 shown=8`. **So there is ~16-21 s of spare inside
pullback**, and the cut fits at either sizing discussed (1.5 s sweep + 0.5 s hold per level x 8 =
16.0 s; or a 1.5 s whole sweep + 8 x 0.5 s = 5.5 s). The single number to trust on any re-bake is what
`§STOREY_REVEAL_WINDOW pullbackSec=` prints, not either figure above.

**92.5 PLACEMENT — the user's reasoning, kept because it is the argument, not the conclusion.**
*"The process best begins while scene about to slow down near halt as that is boring without event."*
The window is currently the LAST 10 s of pullback, which leaves the earlier part of the beat playing
a decelerating camera with nothing happening. Open the window earlier so the cut occupies the dead
stretch. This is the same instinct that §STOREY_REVEAL_WINDOW_SEC's own 5→10 widening acted on
(2026-09-10, *"seems to wait too long... rather uneventful or redundant repeat"*) — the budget above
says it can go further.

**92.6 STILL OPEN — the one sizing question the user has not settled.** Is 1.5 s the cut time PER
LEVEL, or the whole bottom-to-top sweep? It no longer changes whether it fits (§92.4), but it changes
the beat entirely: 16.0 s of deliberate storey-by-storey ascent versus a 1.5 s sweep punctuated by
eight half-second holds. Ask before building.

**92.7 THE SECOND HUD SLOT IS EMPTY BY CONSTRUCTION — the user's own catch.** *"The Reveal line in
the 2nd HUD is not used mostly until last storey level display."* Confirmed in code: during the
reveal window the storey card takes the panel slot and `cinema_maxq.js:2371-2377` states
`_resInfo` "is already null here by construction ... so no second corner panel can appear alongside
it". The slot is dark for the WHOLE reveal, not just until the last storey. The user's proposal is to
fill it with the most prominent/nearest MEP + discipline sets on screen. Data exists:
`A.cpeRevealDiscQtyCost` (`effects.js:5995`) already computes discipline qty/cost for the Reveal
round's roster, and there is precedent for a facing/nearest query in `cpe_flyout_beats.js:138`
("nearest this side"). NOTE when building it: that `null` is deliberate anti-collision, so filling the
slot is an explicit reversal and needs its own § log line, not a silent change.

**92.8 USER RULING — do NOT suppress the clash or Sanity/Egress layers during the reveal.** It was
raised in session (*"should we halt all Sanity and Clash highlights during pull back when Storey
reveal feature ON? This is to avoid clutter"*) and then ruled the other way by the user: *"cut out the
clutter complaint, i think it will come out right."* **Do not re-propose without a new user ask** —
same standing as §SUN_ARC_TOPOUT_SNAP's revert. Two observations were made before the ruling and are
kept here as facts to CHECK on frames, not as arguments to re-run: (a) `cinema_maxq.js:2313` runs the
discipline-pair highlight across the whole pullback and drives `A.clashFilm.highlightDiscPair(key)`
in 3D, while the reveal at `:2371` overrides only `_statInfo` — so the last-lit pair stays lit through
the reveal today; (b) `rule_findings_film.js:271/:406` (§70) deliberately made findings world content
for the whole film with "no window, no storey slot", and they composite in SCREEN space with leaders
to world positions, so a clip plane can remove the geometry a leader points at. Both are things to
LOOK for in §92.9's frames and report; neither is a reason to gate the layers.

**92.9 NEXT ACTION — §90.4.1, unchanged.** Nobody has yet seen the reveal ON at 1080p (v87 baked
`storeyReveal=0`). Re-bake the reveal window with `--storey-reveal` and decide from real frames,
quoting frames not adjectives. Run it through `./bake_scope.sh` (§91.4). Two wow candidates to judge
on those same frames, both reusing shipped code and neither needing new derivation:
- **Light the cut edge.** `section_cut.js` already computes the exact slice at an arbitrary Z
  (`sliceMesh(verts, faces, cutZ)`, tags `§SC_SLICE`/`§SC_CUT_PLANE`, 5 mm endpoint matching). Feed it
  the clip plane's own Z and the cut becomes a moving line of light instead of an absence.
- **Sun into the opened storey.** `clipShadows: true` is already set alongside the clip plane
  (`grid_views.js:218/230/238`), so the film's own sun should land on the exposed floor plate with
  real shadows at zero lighting cost. Verify on frames; do not design for it before then.

## §93 THE REVEAL ON AT 1080p — FIRST FRAMES EVER SEEN, AND WHAT THEY SETTLE
## (2026-09-13, `/tmp/wt-v87` @ `fix/bucket-key-floor`, `out/v88_reveal_window.mp4`)

**93.1 THE BAKE.** `bake_scope.sh node cli_silent_bake.js --db Hospital_silent --gpu real --width 1920
--height 1080 --fps 24 --measure --storey-reveal --clip 0.900:0.962 --port 8623`. Clean:
`§CLI_BAKE_WALL totalSec=500 aborted=no fileOk=true`, `§CLI_BAKE_FFPROBE codec=h264 1920x1080
frames=291 fps=24/1 durationSec=12.125`. Wrapper reported `§BAKE_SCOPE_PEAK rc=0 memPeak=7.8G
swapPeak=0.0G` — so §91's 26 GB was the back-to-back double bake, and a single clip of this length
costs 7.8 G. The session was never at risk; §91.4 works.

**93.2 §90.1 IS CLOSED.** With the flag on: `storeyReveal=1`, `§STOREY_REVEAL_LIST n=8
storeys=[Level 1..Level 7]`, `§STOREY_REVEAL_FIT windowSec=10.04 minSlotSec=1 storeysAvailable=8
shown=8 slotSec=1.25 (all storeys fit)`, and TINT/TIMING/STATS fire for all eight. Exactly as §90.1
predicted — it was never a code defect, only the flag. Do not re-investigate.

**93.3 §92.2 RE-CONFIRMED ON v87, not just v86.** `clonedMaterials=0` on ALL EIGHT storeys. The
material-clone path catches nothing on Hospital; every tint is per-instance `setColorAt`. The no-fade
argument in §92.2 stands on fresh evidence.

**93.4 THE FINDING: LEGIBILITY TRACKS THE FACADE SET, AND THE SET IS TINY AND WILDLY UNEVEN.** Frames
quoted are clip frames of `v88_reveal_window.mp4` (`tNorm = 0.900 + f/291 x 0.062`):
```
slot storey    colour   meshesTouched  frame  what the frame actually shows
 1   Level 1   #2979ff      19          f51   NO blue anywhere            <- §90.2 reproduced
 4   Level 4   #ff6d00      51          f141  READS — broad bands down the left facade, centre strip
 5   Level 5   #2979ff      44          f171  FAINT — thin parapet/roof-edge LINES only, no surface
 7   Level 7A  #ffd600       2          f231  NO yellow anywhere; card also reads "0 doors"
 8   Level 7   #ff6d00       6          f261  NO orange anywhere; card reads "1 doors"
```
Two things follow, and they are not what §90 assumed:
- **Count alone does not predict legibility.** 51 meshes (L4) reads as broad surface; 44 meshes (L5)
  reads only as slender edge lines, because L5's facade members are parapet strips while L4's are
  tall wall panels. The predictor is the projected AREA of the set, which nothing currently measures.
- **The reveal's last two slots are dead in both halves.** L7A (2 meshes, card "0 doors") and L7
  (6 meshes, card "1 doors") are 2.5 s of the 10.04 s window — a quarter of the beat — with no visible
  tint AND no meaningful number. The film currently ENDS the reveal on its weakest slot, immediately
  before the orbit. Any "restore everything on the last storey" payoff (§94 idea) has nothing to pay
  off from as the slots stand.

**93.5 A CORRECTION TO THE IN-SESSION CAMERA CLAIM.** From the v87c pose track the reveal rig is real
and constant: camera->target 20.0 m, pitch 45.7deg->47.2deg DOWN, horizontal offset ~13.7 m, the whole
rig lifting 16 m (camY 80.1->96.0, tgtY 65.8->81.3), while the building occupies scene Y -9.2..+37.8
(DB Z 156.61..203.65 less `offset=165.81`; `§CAMERA envelope=101x151x43m` agrees). That does put the
aim point 28-43 m above the roof — but the conclusion drawn from it in session, that the reveal is
"aimed at sky", is WRONG and the frames disprove it: the building is well centred and fills roughly
45% of frame width in every slot. Level 1 fails because it is the GROUND floor seen from 46deg above,
where its facade is the most occluded strip in the picture. **The camera is not the defect. The set
is.**

**93.6 THIS IS THE STRONGEST ARGUMENT FOR §92's SECTION CUT.** From a 46deg-overhead camera the
surface that is genuinely visible is the FLOOR PLATE, not the facade. A rising cut hands this camera
exactly what it can already see, and it is immune to §93.4's area problem because a cut plate is the
whole storey footprint (L1 = 98.6x90.3 m) rather than a 2-to-51-mesh facade subset.

**93.7 THE STALL DOES NOT EXIST — measured, and it retires an idea raised in session.** Over all 4,699
frames of the v87c pose track the median camera speed is 0.1101 m/frame and there is **no contiguous
run of even 1 s below half that anywhere in the film**. The reveal window runs at 0.0995 m/frame,
**90% of the film's median**. The pullback is not slow; it is empty. Do not design against a "stall"
— there is none to use. (Camera travel inside the window is 24.0 m total, 3.0 m per storey.)

**93.8 §92.7 CORRECTED — the empty HUD row is a different panel than stated.** §92.7 attributed the
user's "Reveal line in the 2nd HUD" to the corner roster (`_resInfo`). Wrong. The frames show a
labelled status panel at lower-left with four rows — `Storey / Room / Build-up / Reveal` — and the
**Reveal row is blank in all eight slot frames** while `Storey` reads "Level 4, Level 1" and `Room`
lists corridors. That row is the target for the user's proposal to show the nearest/most prominent
MEP + discipline sets. Find it by its label, not via `_resInfo`.

**93.9 THE USER'S §92.8 RULING IS SUPPORTED BY THE FRAMES.** The Structural "span depth steel,
327 flagged" set covers the entire roof in translucent yellow at slot 1 and is genuinely heavy there —
but it has largely cleared by slot 5 and is gone by slot 8. It is TRANSIENT, not a permanent layer.
The ruling to leave the clash/Sanity layers un-gated holds; this note exists only so the next session
does not re-open it on seeing frame f51 alone.

## §94 SECTION CUT — IMPLEMENTATION SPEC (2026-09-13, worktree `/tmp/wt-storey-cut`,
## branch `feat/storey-section-cut`, based at `7833b639` — the exact commit §93's frames were baked from)

**94.1 IT LIVES IN `cpe_storey_reveal.js`, NOT A NEW MODULE.** Same window, same `_fitList` slots,
same "ONE PURE FUNCTION, TWO CALLERS" discipline the file's own header sets out, and `viewer.html`
already loads it — no new script tag, no new load-order question.

**94.2 THE CUT ELEVATION NEEDS NO NEW QUERY.** `A.storeyRevealList()` (line 86) already returns
`{name, z}` per storey with `z = AVG(COALESCE(t.center_z,0))`, sorted ascending, already cross-checked
against `spatial_structure` (§60.1). Scene conversion is the one `grid_views.js:193` already uses:
`cutY = cutZ - A.modelOffset.z`. Verified on Hospital: DB Z 156.61..203.65 with `offset=165.81` gives
scene Y -9.2..+37.8, which agrees with `§CINEMA_DIVE floorY=-9.43` and `§CAMERA envelope=...x43m`.

**94.3 REUSE THE CLIP PATTERN, DO NOT CALL `applyFloorClip`.** `GridViews.applyFloorClip` does far
more than clip: it hides roof meshes by IFC class, fades slabs to `opacity=0.08`, and consults
`GridConfig.retainSet(viewMode)` (`grid_views.js:205-245`). That is the plan-view treatment and it
would strip geometry the film needs. Take only the clip half, which is four lines there and is already
proven against both `isMesh` and `isBatchedMesh` with `clipShadows`:
- on window ENTRY: assign `material.clippingPlanes = [plane]`, `clipShadows = true`, one
  `needsUpdate` per distinct material;
- per FRAME: mutate `plane.constant` only — no material walk, no `needsUpdate`, so the cut costs
  nothing per frame;
- on window EXIT: `clippingPlanes = null` on the same set, restored exactly like `clearFloorClip`.
`renderer.localClippingEnabled` is already `true` (`scene.js:119`) — do not touch it.

**94.4 THE AXIS IS DERIVED FROM THE CAMERA, NOT FLAGGED.** §93.5 measured Hospital's reveal rig at
45.7deg-47.2deg DOWN, where a horizontal cut exposes floor plates — the surface that camera can
actually see. A building whose reveal plays at eye level gets nothing from a horizontal cut. So pick
the plane from the view direction each frame:
- pitch steeper than the threshold -> horizontal plane, normal `(0,-1,0)`, the §92 rising cut;
- pitch shallower -> VERTICAL plane whose normal is the camera forward vector flattened to horizontal
  and normalised — the "X/Y cut onto cam POV", sweeping toward the viewer.
Log the choice per slot as `§STOREY_CUT_AXIS` with the measured pitch, so the decision is always
readable from the log rather than inferred. The user nominated **Terminal** as the eye-level test case
("its pull off is at eye level and up close to the wall filling up whole frame").

**94.5 WHAT MUST NOT CHANGE.** The stat card (§90.4.4 — it works and stays), the caption, the
per-slot pulse (§STOREY_REVEAL_PULSE), §STOREY_REVEAL_LAST_STAYS_LIT, and the clash + Sanity layers
(§92.8, the user's ruling). The cut is added alongside the tint, not in place of the card.

**94.6 §93.4 EXPOSES A DEFECT IN AN EXISTING FIX — record it, the cut resolves it incidentally.**
§STOREY_REVEAL_LAST_STAYS_LIT (2026-09-10) exists so the final storey never enters its dark phase and
the beat ends lit rather than on a dark building. On Hospital the final storey is `Level 7` with
`meshesTouched=6`, and §93.4's frame f261 shows **no orange anywhere** — so that fix is defeated by
set size: the window still ends on a storey nobody can see. A cut plate is the storey's whole
footprint rather than a 2-to-51-mesh facade subset, so the cut removes the failure mode rather than
tuning around it. Do not "fix" LAST_STAYS_LIT separately.

**94.7 TEST MATRIX — all three silent DBs, low res for quick optics (user's instruction).**
**THE REVEAL WINDOW FRACTION IS PER-BUILDING — READ IT BEFORE CHOOSING A CLIP.** This cost a wasted
bake on 2026-09-13: `--clip 0.900:0.962` is Hospital's window
(`windowStartFrac=0.9077 orbitStartFrac=0.9590`, windowFrac 0.0513) and on Terminal it baked the
ORBIT instead — Terminal's own line reads `windowFrac=0.1139 orbitStartFrac(rise)=0.8390
windowStartFrac=0.7252`, more than twice as wide and 18 points earlier. The window is derived from
each building's own beat pacing, so the procedure is: run any short clip first, read
`§STOREY_REVEAL_WINDOW ... windowStartFrac=/orbitStartFrac=` out of the log, THEN clip to that.
Known so far: Hospital `0.9077..0.9590`, Terminal `0.7252..0.8390`.
Otherwise `--storey-reveal --gpu real --width 854 --height 480`, each through
`./bake_scope.sh` (§91.4), each DB symlinked into the worktree's `buildings/` from the canonical
`~/Downloads/<Name>_silent.db` (§59.6 — a bare `--db Terminal_silent` 404s otherwise, the OCI bucket
does not publish the silent DBs; verified md5 Hospital `09e52e5d...`, Terminal `908f998d...`).
Hospital additionally has the 1920x1080 baseline from §93, which is the one to judge final optics on.

## §95 THE THREE FLEET REVEAL WINDOWS, MEASURED — AND TERMINAL CONFIRMS THE EYE-LEVEL CASE
## (2026-09-13, `/tmp/wt-storey-cut`, low-res probes per §94.7)

**95.1 THE WINDOWS. They differ by more than 2x and they are NOT interchangeable** (this is the §94.7
correction, stated once with all three so nobody has to re-derive it):
```
building                    windowStartFrac  orbitStartFrac  windowFrac  realWindowSec  storeys  slotSec
Hospital_silent                  0.9077          0.9590        0.0513       10.04          8      1.25
Terminal_silent                  0.7252          0.8390        0.1139        6.01          6      1.00
HHS_Office_Federated_silent      0.6877          0.7674        0.0797        5.76          ?      ?
```
Read `§STOREY_REVEAL_WINDOW` from a short clip before choosing a `--clip`; do not reuse another
building's figures. Terminal drops 2 storeys to §60.1's spatial_structure cross-check
(`storeysAvailable=6 shown=6`).

**95.2 TERMINAL IS THE EYE-LEVEL CASE — the user called it before it was measured.** The user's claim
was *"The Terminal will get the X/Y cut as its pull off is at eye level and up close to the wall
filling up whole frame."* Measured from `term_reveal_poses.json` across all six slots:
```
slot  camY    tgtY    cam->tgt(m)   pitch_down_deg
 1   -11.1   -10.4       20.0           -1.8
 3   -10.5   -10.2       20.0           -0.9
 6    -9.8    -9.8       20.0           -0.0
```
**Dead level — pitch −1.8deg to 0.0deg, 20 m from subject, for the whole window.** Against Hospital's
45.7deg-47.2deg down at the same 20 m (§93.5). So the two fleet buildings sit on opposite sides of
§94.4's axis threshold with a wide margin (25deg), and the derived-axis rule resolves them correctly
without a per-building flag: Hospital -> horizontal cut onto floor plates, Terminal -> vertical cut
sweeping onto the camera POV. A horizontal cut on Terminal would be viewed edge-on and show nothing,
which is exactly what the user predicted.

**95.3 TERMINAL BASELINE (tint only, for before/after).** `out/term_reveal.mp4`, 152 frames 854x480,
`§CLI_BAKE_WALL totalSec=111 aborted=no fileOk=true`, `§BAKE_SCOPE_PEAK memPeak=5.2G`. Verified to be
the PRE-cut build: its page JS was fetched 8 s before the §STOREY_SECTION_CUT edit landed and the log
carries 0 `§STOREY_CUT` lines. Terminal's model spans DB Z -30.69..28.59 (59.3 m).

## §96 THE SECTION CUT ON ALL THREE FLEET BUILDINGS — IT WORKS, WITH ONE HONEST CAVEAT
## (2026-09-13, `/tmp/wt-storey-cut` @ `f3d36dda`, frames in `out/cutframes/`)

**96.1 ALL THREE BAKED CLEAN AND THE DERIVED AXIS RULE RESOLVED CORRECTLY WITHOUT A FLAG.**
```
Hospital  §STOREY_CUT_AXIS axis=Z  pitchDeg=45.7  §CLI_BAKE_WALL totalSec=414  8 slots
Terminal  §STOREY_CUT_AXIS axis=XY pitchDeg=-2.0  §CLI_BAKE_WALL totalSec=121  6 slots
HHS       §STOREY_CUT_AXIS axis=XY pitchDeg=10.4  §CLI_BAKE_WALL totalSec= 70  3 slots
```
All `aborted=no fileOk=true`, 854x480, each through `bake_scope.sh`.

**96.2 HOSPITAL (Z axis) — the §93.4 failure is gone.** `hosp_cut_s1_f27.png`: the frame that showed
**no blue anywhere** with the tint (§93.4, 19 meshes) now shows Level 1's entire 98.6x90.3 m floor
plate, internal partitions and corridors legible from the 46deg camera. The storey that was the least
visible thing in the picture is now the whole picture. `hosp_cut_s8_f238.png`: the building is WHOLE
again at the last slot — the sweep really does finish at the queried model top (203.65), so the beat
ends on a complete building rather than a sliced one. That is the "restore everything at the end"
payoff, obtained geometrically rather than by repainting ~46k instances.

**96.3 TERMINAL AND HHS (XY axis) — the eye-level case reads better than the overhead one.**
`term_cut_s3_f66.png` is an architectural section brought to life: at eye level 20 m out, the near
facade peels away and the concourse interior — columns, roof trusses, ceiling grid, counters, the
yellow band — fills the frame. `hhs_cut_s2_f74.png` is the strongest frame of the whole exercise:
three floors opened at once with rooms, partitions and furniture all legible. The user's X/Y proposal
is vindicated on its own nominated test case.

**96.4 THE CAVEAT, AND IT IS REAL: on the XY axis the card and the visual disagree.** The vertical cut
sweeps along the camera's forward axis, so it reveals DEPTH layers, not storeys — `hhs_cut_s2` shows
all three floors simultaneously while the stat card reads "39 doors · Level 2". On the Z axis there is
no such gap: the plane rests on the named storey's own slab and the card matches what is on screen.
So the XY cut is currently a superb SECTION beat but not a STOREY reveal. Options, in order of
honesty, for whoever picks this up:
1. On the XY axis, retitle the card for what is actually shown (a section through the building), not
   a storey it is not isolating.
2. Sweep the XY plane per storey band instead of per depth — i.e. pair the vertical cut with a
   horizontal sandwich so only the named storey's depth is peeled. Costs a second plane; the
   `clippingPlanes` array already takes N.
3. Accept it as a section beat on eye-level paths and drop the per-storey card there.
Do NOT ship the XY axis with the current card wording — it asserts something the frame does not show.

**96.5 WHAT IS STILL UNANSWERED.** §92.6's sizing question (1.5 s per level vs whole sweep) is still
the user's to settle; `CUT_RISE_FRAC=0.75` is a placeholder that makes each 1.25 s slot 0.94 s rising
and 0.31 s held. And §93.8's blank `Reveal` HUD row is still blank in every frame of all three bakes.



# --- retired from the live file 2026-09-14 (condensed there) ---
## §100 THE RAKE — the stagger, expressed as a tilt instead of a second plane (2026-09-13, user idea,
## implemented, first bake in flight at the time of writing)

**100.1 THE ASK.** *"to ensure more time per sweep, it can stagger with the upper floors following even
before the lower completes as they do not obscure ... as 80% done, the next storey begins"*, and
*"this may give good continuity effect"* — the real argument, which a time-budget analysis misses:
sequential sweeps with a hold stop the picture once per storey, overlap means something is always
moving.

**100.2 WHY IT IS NOT A SECOND PLANE.** Two storeys mid-sweep means the reveal threshold varies with
HEIGHT. Treated as a step function it needs per-storey planes, and materials are SHARED across storeys
via `A._matCache` (§90.3, and why `clonedMaterials=0` in every log) — the same wall that killed the
fade in §92.2. But a threshold that varies with height is just a TILTED plane: `f.p - k*y >= c`. One
plane, one extra term, no per-storey materials.

**100.3 THE RAKE IS DERIVED, NOT TUNED.** `k = (1 - overlap) * (n - 1) * D / H`, with D the model's
span along the snapped axis and H the band height, both measured from the model's own bbox via
`A.ifc2three`. Predicted: Hospital (D~100, H~47, n=8) k~11.9, a plane **5deg off horizontal**; HHS
(D~68, H~20, n=3) k~5.4, about **10deg**. `§STOREY_CUT_RAKE` logs k, the tilt in degrees, and the
measured D/H/n so the prediction is checkable against what the bake computes.

**100.4 THE CONSEQUENCE WORTH SITTING WITH.** At those rakes the staggered horizontal sweep converges
on a NEAR-HORIZONTAL cut with a slight tilt — geometrically the Z cut raked a few degrees, not the
vertical X/Y sweep. Which means §99.6's axis question may answer itself: at these tilts the two axes
are the same plane with different rake, and there is nothing left to choose between.

**100.6 VERDICT — MEASURED, THEN DROPPED BY THE USER. LOCKED, do not re-propose.** Baked on HHS:
`§STOREY_CUT_RAKE k=7.14 tiltFromHorizontalDeg=8.0 overlap=0.2 D=68.2 H=15.3 n=3`, sweeping
continuously (prog 0.002 -> 0.336 -> 0.670). The prediction in §100.3 held in shape (8.0deg against
~10deg predicted; the gap was H, estimated 20 m against a real band height of 15.3 m). It still FAILS
on frames, exactly as §100.5 warned: at prog 0.34 the stat card reads "Level 2" while the picture is
ONE DIAGONAL SLICE through the whole building — no storey is being revealed; the opening frames are
near-empty because a single sweep spread across the window takes most of the beat to arrive; and the
plane slices the context city diagonally too. The tilt IS what removes the discreteness, so one plane
cannot give overlap AND storey identity. The user's words: *"The rake seems ugly and cheap or done the
way i meant. Drop that for simplicity."* `CUT_RAKE_OVERLAP = null` (`d51362c3`). The code path stays
only so the finding is reproducible.

**100.5 WITH THE RAKE ON THERE ARE NO BANDS AND NO PAUSES.** One plane, `clipIntersection` off, global
array empty — the tilt alone gives every storey its turn, so the motion never stops. The slab still
leads (its plane runs slightly ahead). `CUT_RAKE_OVERLAP = null` restores §98's banded behaviour with
its 1.5s/0.5s slots. **UNJUDGED: nobody has seen the rake on frames yet.** The risk to look for is that
a continuous creep blurs the storey identity the stat card is naming.


## §101 OPEN — THE SUN APPEARS TO HALT DURING THE REVEAL (user observation 2026-09-13, measured but
## NOT diagnosed; recorded so the next session does not chase the wrong thing)

**101.1 THE REPORT.** *"seems to be halt on the Sun smooth movement, as seen on the shadow play."*

**101.2 THE SUN ARC IS NOT THE CAUSE — ruled out on the Hospital `hosp_v12` log, do not re-investigate
it.** `§SUN_ARC_STEP` fires 289 times across 289 frames, i.e. once per frame. `_sunArcStep`
(`effects.js:2673`) sets `shadowMap.needsUpdate` itself every frame, deliberately, because
`shadowMap.autoUpdate` is OFF for perf (`tools.js:949`, `A.renderer.shadowMap.autoUpdate =
(window._shadowAutoUpdate === true)`) — its own comment says a frozen shadow under a moving sky
"reads as a bug rather than a static look". The underlying values are continuous, not quantised: the
1-decimal `§SUN_ARC_STEP` print is log rounding, while `§SUN_ARC_FILL_PIN` shows elevation moving
0.01deg per frame and `sunPos` about 0.9 units in Y per frame.

**101.3 WHAT IS MEASURABLY TRUE, and the most likely reading.** The arc is LINEAR in tNorm
(`_sunElevationAt`: 55deg -> 6deg across the film) = **0.25deg/s**, constant everywhere — it does not
slow down for this beat. Across the 10.04 s reveal window that is **2.51deg of total travel**. And the
reveal is the one beat where the CAMERA nearly stops: 24.0 m over the whole window, against a film
median of 0.11 m/frame (§93.7). In earlier beats the shadow play is dominated by camera motion; here
that contribution vanishes and only 0.25deg/s of real sun motion is left. So the likely answer is that
nothing is broken and the beat simply exposes how slow the arc is — but this is a HYPOTHESIS, not a
measurement, and it has not been checked against frames.

**101.4 THE OTHER CANDIDATE, if frames disprove §101.3.** The section cut sets `clipShadows = true` on
every material it touches (§94.3), so shadow geometry changes as the cut advances. During the reveal
the dominant change in the shadow image may be the CUT, not the sun — which could read as the sun
having stopped while something else moves the shadows. Check by baking the window with
`--no-storey-reveal` and comparing the shadow play; if it looks equally static, §101.3 is the answer.

**101.5 DO NOT "FIX" BY SPEEDING THE ARC.** §SUN_ARC_TOPOUT_SNAP was shipped and then REVERTED on the
user's own ruling that the linear 55deg->6deg formula is correct (see the shipped/closed recap at the
top of this file). Any change to the arc needs a new user ask.

## §101.6 THE SUN HALT — CAUSE FOUND, IT IS THE CUT'S OWN HOLD (2026-09-13, closes §101)

The sun is not the cause and neither is its speed. **`effects.js:2681` passes a CONSTANT
`PHOTO_SUN_AZIMUTH` to `updateSky` every frame** — measured across all 289 frames of `hosp_HR.log`,
azimuth is `-110.0000deg` with ZERO change while elevation moves -3.01deg. So shadows never rotate
anywhere in the film; they only lengthen along one fixed bearing. §101.2 measured elevation and never
checked azimuth; §101.3's "the arc is simply slow" is superseded — it is not slow, it is
one-dimensional.
**But the halt is REVEAL-SPECIFIC, which the azimuth alone does not explain.** `_armCut` sets
`clipShadows = true` on every material, so during the reveal the shadow-casting geometry IS the cut —
clipped-away storeys cast nothing. The slot holds for its last quarter (`phase:'hold'`, `k` pinned at
1), which on Hospital is **27 frames of sweep then 9 frames where the cut does not move, eight
times**. Each revealed storey (~5m) adds ~26m of cast shadow at 10.8deg elevation, so the shadow leaps
then dead-stops. The sun's own contribution across a hold is 0.094deg — invisible. The shadow play
inherits the slot's stop-start rhythm and reads as the sun halting.
**The camera is NOT the cause** — it runs 0.11 m/frame straight through, holds included (measured off
`hosp_HR_poses.json`; §93.7's 24m figure was a narrower window). §101.5 still stands: do not touch the
arc without a new user ask. User verdict after §110's longer sweeps: *"Shadow flow smooth."*

## §114 BAKES THAT LANDED (2026-09-13)
- `HHS_ALLON_480p.mp4` — full 76.1s film, ALL FEATURES ON, 854x480@15, 1,141 frames, 507s wall,
  `unconverged=0`, peak 2.1G, `§CLASH_FILM_BUILD discPairs=12 pairsBroad=442 trueClash=233
  markers=466 bothPlaced=233 incomplete=0`. Reveal: 4 passes, `scale=1.000`, `baseSweepSec=3.00`.
  **CAVEAT the user noted: HHS has BUILDUP OFF**, so this film does not exercise the Time Machine.
- Hospital reveal-window check, 854x480@15: 6 groups, all PASS, `stolenSec=28.62 pullbackGrewBy=0.00`,
  window 24.38s, `scale=1.000`.
- `Hospital_ALLON_1080p24.mp4` — full 195.8s, all on, 4,699 frames, buildup ON
  (`§CLI_BAKE_BUILDUP_RESOLVED on=1 source=stored-path`). IN FLIGHT at hand-off; prior runs at this
  size took 5,476-5,630s.

**PORT GOTCHA (cost one restart):** killing a bake can leave its `--port` bound, and the next launch
dies with `EADDRINUSE` before any §-line prints — the stdout shows only `§BAKE_SCOPE` then a Node
stack. Move to a fresh port and reap, per §91.7.

