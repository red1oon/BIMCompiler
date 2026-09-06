# ⚠ DO NOT REMOVE — scope: spec only, triaged from a competitor reference capture. No implementation yet. Read the log after every run.

# MEP Clash-Reveal Movie — triage against a reference capture (2026-08-07)

## Source of this triage

User snapped 4 screenshots (`~/Pictures/Screenshots/Screenshot from 2026-08-07 15-0[4-5]-*.png`) of a
competitor's MEP-coordination movie ("02. MEP Integration (Plumbing, Electrical, HVAC)" / "03. Real-Time
Clash Detected") and asked for a comparison against our own `~/Videos/demo4D.mp4` (225s, 12:20 today),
plus a spec for the next improvement in (a) surface quality and (b) navigating to + highlighting a clash.

**Honest framing, checked before writing anything else:** the two movies are not the same genre.
`demo4D.mp4` is a **4D construction-SEQUENCE** film (Time Machine building up 63,418 elements over 333
days, exterior-focused — the 3 sampled frames are an exterior orbit + the Gantt/S-curve dashboard, no
interior MEP shot appears in the sampled frames). The reference is an **MEP spatial-COORDINATION** film
(ARCH ghosted to translucent, MEP solid-colored by trade, camera parked inside a plant-room ceiling void,
one clash glowing with a leader-line callout). User's own framing is right: **this is not a new movie to
build from scratch — it's a different CAMERA MODE + VISIBILITY MODE over data we already have**, per the
code audit below.

## What already exists — do not re-build any of this

Checked directly against `origin/main` (bim-ootb), not assumed:

1. **Clash detection is real, not a mockup.** `viewer/clash_matrix.js` (`_countClashesRtree`) does an
   R-tree spatial count between two disciplines, tolerance- and ignore-class-aware, cached per
   discipline pair. `viewer/mep_coordination.js` carries a sourced, VERIFIED/PENDING/REFUTED-tagged
   ruleset (DRAIN/ACMV/FP/DWATER/GAS/ELEC/DATA/STRUCT hold/yield priority) — real citations, not
   invented thresholds. `elements_meta.discipline` is a real, populated column, already queried live.
2. **Navigate-to-clash already exists.** `A._flyToClash(idx)` (`viewer/measure.js:619`) flies the camera
   to the clash pair's midpoint, computes the EXACT 3D overlap bbox from both elements' real bboxes, and
   clips the scene to a padded cutaway box around it (six `THREE.Plane`s). Wired into 4 real UI entry
   points already: `issues.js`, `universal_history.js`, `main.js`, `scene.js`. This is most of what the
   reference video's "camera walks to the clash" beat needs — it is a snap-to, not a walk, but the
   target-finding and cutaway math are done.
3. **A discipline colour palette already exists and is used live.** `A.DISC_COLORS`
   (`viewer/config.js:43`) — 12 disciplines (ARC/STR/MEP/ELEC/FP/ACMV/PLB/HEAT/HVAC/SAN/VENT/VOID) with
   real hex values, consumed in 11 files (loading placeholders, clash highlight, navigate-find, Time
   Machine, panels, city view, 5D export). This is infrastructure, proven — not something to invent.
4. **A global x-ray/ghost toggle exists.** `A.xrayOn` (`viewer/tools.js:227`, Alt+Z cycles it,
   `scene.js:2520`) plus a separate bbox/ghost mode (`ghostXrayOn()`/`toggleGhostXray()`). `ghost=1` is
   already a live URL param.
5. **A material quality boost exists.** Alt+S (`A.toggleStillRefine`, `viewer/effects.js:3941`) is the
   photoreal-still-render pass — SSAA + a real material boost (`_reassertPhotoMatBoost`: ×3
   `envMapIntensity`, tightened roughness) applied to every qualifying material via `A._matCache`. This
   is a GLOBAL shading boost, not a per-trade colour assignment — worth naming precisely since it's easy
   to conflate with #3 above; they are different mechanisms.

## The real gaps — named precisely, not assumed

1. **No discipline-SCOPED hide.** `xrayOn`/ghost is global (whole model x-rayed or bboxed) — there is no
   "hide STRUCT+ARC only, leave MEP disciplines opaque and coloured" isolate mode. The data this needs
   (`elements_meta.discipline`) is already the exact column `clash_matrix.js` queries today — this is a
   visibility filter to add, not new data to extract.
2. **`_flyToClash` is a snap, not a path.** It jumps the camera and clips a small cutaway box at the
   overlap. The reference video's wider beat — walking DOWN a ghosted-ARCH corridor with full-length
   coloured MEP runs visible, THEN arriving at the clash — needs a camera PATH into the clash, not just a
   final framing. `§CPE_WALK_EDIT_V1`/`§CPE_WALK_HALLWAY` (this session, `prompts/CPE_POV_WALK_PATHING.md`)
   already proved real-hallway path extraction + walk-to-snap on HHS/Clinic — same mechanism, different
   destination (a clash pair's overlap bbox instead of a walked pose).
3. **No leader-line/glow callout UI.** The reference shows a floating label box ("CLASH DETECTED")
   connected by a line to a glowing red highlight at the exact clash point. Today's clash highlight is
   the clip-plane cutaway box only (#2 above) — no glow material, no screen-space label, no leader line.
4. **DISC_COLORS is proven in placeholder/highlight/nav contexts, not confirmed in the final movie-render
   material pass.** User's own read (stated, not yet re-derived by me): production materials during a
   real movie render are a small hand-set variety ("~8"), not comprehensively discipline-coloured like
   the reference. This needs a direct check — whether `streaming.js`'s real `_getMaterial` (the one that
   ships in a recorded movie frame, not the loading placeholder) ever consults `DISC_COLORS`, or falls
   through to per-element_name/library-texture lookups that ignore discipline entirely. **Open question,
   not yet resolved — first task item below.**

## Order of work (Spec-First — witness before code, per CLAUDE.md)

1. **Resolve open question #4 first** — grep `streaming.js`'s `_getMaterial` call chain for whether
   `DISC_COLORS` is ever reached on the path that ships in a recorded movie frame (not the load
   placeholder, not the wireframe bbox, not the clash highlight). Name the actual current behavior with
   file:line before proposing a fix — don't assume the gap shape, confirm it.
2. **Discipline-scoped isolate mode** (closes gap #1) — a visibility filter keyed off
   `elements_meta.discipline`, toggled independently of the existing global `xrayOn`. Likely home:
   alongside `toggleGhostXray`/`xrayOn` in `tools.js`, reusing the SAME discipline query shape
   `clash_matrix.js` already runs (don't reinvent the SQL). Witness: hide ARC+STR on a real building,
   assert MEP element count visible == total MEP count, ARC+STR visible count == 0.
3. **Clash-reveal, AMBIENT not destination-driven** (closes gap #2 — design superseded once, keep the
   history): first idea was to auto-seed sticks at clash locations as a dedicated "clash tour," reusing
   walk-mode's proven "external source → sticks → existing `_replanFilm`" pattern. **User's better
   framing (2026-08-07): don't build a separate tour — reveal what's already along whatever path the
   user authored.** Concretely:
   - The path pipe is already sampled at `FILM_SAMPLES` points for rendering — run a proximity query per
     sample against the clash list (reuse `clash_matrix.js`'s R-tree approach, scoped to "any clash
     within radius R of this point" instead of a discipline-pair overlap check).
   - **§CPE_CLASH_RADIUS — a panel control, 0 = feature off.** A slider/number field on the Alt+C panel
     sets R in metres; 0 means no clash-seeking at all (default — this must be opt-in, not an always-on
     scan every time a path is authored/replanned, both for performance and so a user not doing MEP
     coordination sees no behavior change). R>0 arms the per-sample proximity check above.
   - A flagged segment gets its own distinct marker — **not red**, since `§CPE_STICK_RED_BAR` already
     means "user-added stick"; reusing red would collide with that established visual language (a real
     conflict, not a style nitpick — flag before picking a colour).
   - **"Wish to detour?"** reuses the existing click-on-pipe → spawn-stick interaction (`§CPE_CLICK_SLOP`
     already distinguishes a click from a drag on the pipe) — a click on a flagged segment spawns a stick
     pulled toward the clash's overlap-bbox midpoint (reusing `_flyToClash`'s existing math) instead of
     the raw click point. No new insertion mechanism, just a new seed position + trigger.
4. **Leader-line + glow callout** (closes gap #3) — a screen-space label anchored to the clash point's
   projected coordinates (reuse the projection math `§CPE_WALK_EDIT_V1`'s pixel-readback witness already
   uses) plus a glow material on the clash highlight geometry `_flyToClash` already builds. Smallest of
   the four items — pure presentation layer over data/positions that already exist.
5. **Material pass, only after #1 is answered** — if `_getMaterial` really doesn't reach `DISC_COLORS` on
   the render path, extend it to (matching the reference's blue-duct/yellow-conduit/red-pipe look predicts
   discipline-driven base colour is enough — verify against the reference's actual palette, don't
   invent new hex values before checking if `DISC_COLORS`' existing 12 already cover it).

## Scope boundary

This is presentation/navigation over EXISTING clash and discipline data — it does not touch clash
DETECTION accuracy (`_countClashesRtree`, `mep_coordination.js`'s ruleset) or the 4D construction-sequence
movie (`demo4D.mp4`'s own lane, `prompts/4D_SCHEDULE_PERFECTION.md`) at all. Two different films, two
different specs — do not merge them.

## HMI + perf triage (2026-08-07) — resolves 6 gaps found on first pass, against 2 hard constraints

**Constraint A — no new panel/icon/keybinding outside Alt+C.** Same doctrine `CINEMA_PATH_EDITOR.md:215/704`
already sets for this whole feature family: "no new icon, no new panel, no new keybinding — rides the
Alt+C press that already exists." Every control below lands on the Alt+C panel, not a new hotkey (revises
the first-pass idea of mirroring `xrayOn`'s own Alt+Z-style key for isolate-mode — that was the wrong
precedent to copy; §CPE_CLASH_RADIUS was already specced correctly, isolate-mode should match it, not the
other way round). Code HOME for the toggle function can still be `tools.js` next to
`toggleGhostXray`/`xrayOn` (item 2 in the gaps list) — that's an implementation detail, separate from
where the UI control lives.

**Constraint B — zero per-frame cost when the feature is off, and bounded cost when it's on.** R=0 (default)
must cost nothing, per the existing "opt-in, not an always-on scan" rule. Below, each item states exactly
when its cost is paid, so this stays auditable later — bake-time (once, at path plan/replan), toggle-time
(once, on control interaction), or frame-time (paid every rendered frame — the one budget to protect).

1. **Isolate-mode control.** Reference video shows ONE binary state (ARCH+STRUCT ghosted, MEP opaque) —
   not a per-discipline checklist, so build the simpler thing. A checkbox on the Alt+C panel, next to
   §CPE_CLASH_RADIUS (constraint A). Mutually exclusive with the existing global `ghostXrayOn` — turning
   one on clears the other; two overlapping ghost/ hide systems live at once is a real state-confusion
   risk, not just a style question, and it's also a perf reason (no point computing two hide-sets
   simultaneously). *Cost: toggle-time* — the discipline hide-set is computed once when the checkbox
   flips, reusing `clash_matrix.js`'s existing discipline query shape, not recomputed per frame.

2. **§CPE_CLASH_RADIUS slider — readout, bounds, apply-timing.** Label "Clash radius: X.X m", range
   0–5 m (building-scale; wider is not meaningful for an interior MEP coordination shot). Applies on
   release/blur, not on every drag tick — same discipline the "not an always-on scan" rule already
   demands, just extended to slider interaction specifically so a drag doesn't fire N rescans per second.
   *Cost: toggle-time* (on release) *feeding into bake-time* (below) — the slider doesn't itself scan;
   it sets R, and the actual proximity check runs once at the next path bake/replan.

3. **Flagged-segment colour.** Amber/orange — not red (collides with `§CPE_STICK_RED_BAR`'s existing
   red=user-stick meaning, `CINEMA_PATH_EDITOR.md:152`), and not red/green as a pair (colourblind
   confusion the first-pass draft didn't check). Needs a one-time tooltip/legend on first appearance —
   a silent new colour on the pipe is not self-explanatory the first time a user sees it. *Cost:
   bake-time* — same class as existing stick-marker geometry, negligible.

4. **"Wish to detour?" click target.** The ambiguity in the first draft: click-on-pipe already always
   spawns a stick at the click point (`§CPE_CLICK_SLOP`); making it *sometimes* redirect to a clash
   midpoint, based on invisible proximity, means one gesture does two different things with no cue
   beforehand. Fix: the detour trigger is a click **on the flagged marker itself** (item 3's amber
   segment), not "anywhere near it on the pipe" — the hit-target is the thing that's already visually
   distinct, so there's no surprise, and no new gesture vocabulary. *Cost: frame-time, but O(1)* — same
   hit-test the existing click-to-spawn handler already does, just checked against one more marker type.

5. **Leader-line/glow trigger — the frame-time item to actually watch.** Fires during playback as the
   camera nears a flagged point (matching the reference), not permanently once isolate-mode is on — a
   multi-clash path would otherwise turn into permanent label clutter, and a permanent per-flagged-point
   check every frame is the one real risk of breaking the frame budget. Bound it: flagged points are
   already known at bake time (item 2's proximity scan against `FILM_SAMPLES`, which is itself a
   bake-time, not frame-time, operation) as a static, path-ordered list of sample indices. The flight
   loop advances a single "next flagged index" pointer and compares only against the CURRENT path-sample
   index — not a live spatial re-query, not a scan across all flagged points per frame. Reuses the
   existing frame-loop gating (`flyActive || _orbiting || _pipelinesCompiling`,
   `CPE_POV_WALK_PATHING.md:101`) rather than adding a new always-on per-frame check. *Cost: frame-time,
   O(1) per frame, paid only while `flyActive`.*

6. **Label text.** Not the reference's generic "CLASH DETECTED" string — source the real numbers we
   already compute (`_flyToClash`'s exact overlap bbox), e.g. `ACMV vs DRAIN — 0.12m overlap`.
   *Cost: bake-time* — computed once when the flagged marker is created, same moment as item 3, not
   recomputed per frame or per approach.

**Net perf posture:** R=0 → zero added cost anywhere (unchanged from the original spec). R>0 → one
bake-time scan per path plan/replan (bounded by `FILM_SAMPLES` count, same order as the existing replan
cost) plus an O(1) frame-time pointer-compare while flying. No new per-frame spatial queries, no new
global hotkey, no new panel.

## Auto-path design — resolved 2026-08-07 (supersedes item 3's radius-slider framing above)

Talked through with the user; this is the settled shape, replacing the §CPE_CLASH_RADIUS slider idea
with something that reuses more of what already exists and needs fewer new controls.

**"See Clashes" checkbox** (was "leave dots" in the brainstorm) — on the Clash Matrix panel. When ON,
the per-pair clash markers the matrix already computes on cell-click stay plotted in the 3D scene as an
InstancedMesh cloud (same pattern as `_clashBboxCloud`, §S245e — one draw call, cheap even at a few
hundred dots) instead of being cleared when the matrix closes.

**Confirmed 2026-08-27 (user): this is genuinely free perf, not just a UX nicety.** `clash_matrix.js`
already caches per-discipline-pair element lists in `A._clashDiscCache` (keyed by `discA|discB|storey
|ignore`, `clash_matrix.js:12-50`), populated as the matrix panel computes each cell. So opening the
matrix and clicking the discipline pairs the user actually cares about is the ONLY scan that ever
runs — "See Clashes" doesn't re-scan anything, it just keeps plotting what the matrix already
computed and cached. This also directly answers "which types" from the design above: the types shown
are exactly the cells the user clicked, nothing more — user-driven scope, not an always-on full-model
scan. Sequencing this explicitly: **matrix first (cheap, cached, user-selected pairs) → "See Clashes"
ON (plots only what's cached) → auto-path (below) walks only those.**

**Auto-path (Option A, base behaviour):**
- With "See Clashes" ON, order the plotted dots nearest-neighbor (cheap for tens of points) and
  auto-seed them as sticks — reuses the existing stick + `_replanFilm` pipeline, no new path mechanism.
- Camera dives straight in to each dot in order — **no orbit-around wait, that idea's dropped.**
- On approach, ARC/STR fade out (new: distance-based opacity, doesn't exist today — the one real new
  piece this whole design needs) so the clash shows through, same beat as the reference video.
- Holds ~1s at the dot, then ARC/STR fade back in, camera moves to the next dot.

**"BuildUp" checkbox (Option B)** — appears/enables only once "See Clashes" is ON (BuildUp without
clash-dots to attach to is meaningless). When checked, the ~1s hold at each dot is replaced by a LOCAL
replay of that clash's own construction sequence (that pair's elements + their supporting elements,
reusing Time Machine's existing per-element build-date data) instead of a static pause.

**Scope guard, still holds:** BuildUp opens the POV/dive-in flight only — it does **not** open the full
Time Machine 4D panel/UI. It borrows TM's underlying date data for a few elements, not the movie. Keeps
the "two different films, don't merge them" boundary above intact — BuildUp is a local, POV-scoped replay,
not a detour into the 4D construction-sequence movie.

**Open item, not yet resolved:** "supporting elements" (which elements besides the clashing pair get
included in a BuildUp replay — e.g. the host wall/slab, adjacent hangers/connections) has no query yet.
Needs a definition before BuildUp is buildable — flagged, not invented.

**⛔ DECIDED 2026-08-27 (user) — Auto-path (Option A) and BuildUp (Option B) DEFERRED, not built now.**
User: *"the dive to it is too outlandish for now. The all highlighted with labeling seems more
different from what others are trying to do."* This drops the one-by-one camera-dive-to-each-clash
sequence entirely for now (the part of the design that most directly mirrored the competitor
reference video) in favour of the simpler, cheaper, and — the user's own framing — more
distinctive shape: **every selected clash pair highlighted AND labeled simultaneously**, ambient in
the scene during the existing Reveal 2nd round (ARC/STR already fade there, per Mechanism C,
`CINEMA_DISCIPLINE_REVEAL.md`), not a guided tour to one clash at a time. **Revised, smaller build
target:**
- "See Clashes" checkbox still stands as designed above — plots the matrix-cached, user-selected
  discipline-pair clash dots as an InstancedMesh cloud.
- **No auto-seeded sticks, no `_replanFilm` re-plan, no camera dive-in/hold/fade-back sequence** —
  the camera keeps flying whatever path the user already authored; it does not detour to clashes.
- Each dot gets its label (item 6's "ACMV vs DRAIN — 0.12m overlap" text, item 4's leader-line/glow
  presentation) shown for as long as it's on-screen during the existing Reveal pass — reads as "here
  is everything that clashes, all at once, while MEP is revealed" rather than a scripted walkthrough.
- **BuildUp (Option B) is dropped along with it** — it only made sense as a per-dot hold during the
  now-cut dive-in sequence.
- Net build is smaller than the original spec: skip the "one real new piece" (distance-based ARC/STR
  opacity fade *on approach*, since there's no scripted approach anymore) — the EXISTING Reveal-round
  fade already does the ARC/STR hiding this needs, for free.

## Open question #4 — ANSWERED 2026-08-14 (dispatched agent, from `CINEMA_DISCIPLINE_REVEAL.md §6` handoff)

**"Does `_getMaterial` ever consult `DISC_COLORS`, or is that palette only used for placeholders/
highlights/nav?" — the latter, confirmed definitively, not assumed.** `A._getMaterial`
(`viewer/streaming.js:338-491`) has zero references to `A.DISC_COLORS` anywhere in its body. Grepped
every `DISC_COLORS` consumer across `viewer/` (13 files) — every one is a load placeholder
(`streaming.js:266`, `_drawBboxPlaceholders`, wireframe only, replaced once real geometry streams in),
highlight/nav-minimap (`measure.js`, `navigate_find.js`, `dlod_nav.js`), UI swatch (`panels.js`), chart/
export (`export_5d.js`, `boq_charts.html`), or import/wizard preview (`import.js`, `rates.js`,
`wizard_classify.js`) — never the real streamed/baked geometry material.

Checked against real data (HHS_Office_Federated_extracted.db, direct SQL query): confirms the predicted
"blue-duct/yellow-conduit/red-pipe" convention gap is real. HHS's actual MEP (3399 elements, 99.7% NULL
`material_rgba`, all `IfcFlowSegment`/`IfcFlowFitting`/`IfcFlowTerminal` — the IFC2x3 generic convention
this repo's own `streaming.js` comment already names HHS as using) falls into a `STD_MAT` class fallback
that is discipline-blind — same flat blue-grey metal look for every trade (FP/PLB/ACMV/etc. all
identical), even though `elements_meta.discipline` is already selected in the same SQL row. Item 5's own
prediction was right: **the fix is a discipline-driven base colour using DISC_COLORS' existing 12 hex
values** (FP=`0xcc8844` brick, ACMV=`0xcc4444` red, PLB=`0x8844cc` purple, HEAT=`0xff6644` red-orange) —
threaded into `_getMaterial` as a 4th `discipline` argument, scoped to the IFC2x3 generic `IfcFlow*`
classes only (real material_rgba and IFC4-specific classes like `IfcPipe`/`IfcDuct` stay untouched, per
the "trust IFC colors" doctrine). Named precisely, NOT implemented — full write-up, exact line numbers,
and the DB query evidence are in `CINEMA_DISCIPLINE_REVEAL.md`'s own `## Findings 2026-08-14` section,
not duplicated here. That section also found STR's own "boring blue" is real, populated IFC data (not
this gap) and stairs' "blue" traces to adjacent steel railings, not the stair class itself.

**✅ Re-checked 2026-08-27 — item 5 IS shipped now, this doc was stale on this one point.**
`A._getMaterial` (`streaming.js:365`) now takes a `discipline` 4th arg and consults `A.DISC_COLORS[discipline]`
(`streaming.js:590-592`) — and it's genuinely wired into the real streamed/baked render path, not just a
placeholder: real call sites at `streaming.js:1490,1543,1622,1745,1893,1915,2092` all pass `disc`/`el.disc`
through. Confirmed via grep, not assumed. **Everything else in this file (isolate-mode checkbox,
`§CPE_CLASH_RADIUS`→superseded "See Clashes" checkbox, auto-path dive, leader-line/glow label, "BuildUp"
local replay) is still unbuilt** — grepped `viewer/*.js` for `"See Clashes"`/`CPE_CLASH_RADIUS`/`cpe-clash`,
zero hits. This is the READY-TO-BUILD core the user is asking about now, unchanged from the 2026-08-07
spec below — the "Auto-path design" section (§ below, "resolved 2026-08-07") plus the HMI+perf triage's
item 6 (clash-pair label text, e.g. "ACMV vs DRAIN — 0.12m overlap", i.e. the "FP - STR" labelling the
user described) are the exact shape asked for. Nothing more to spec here — this file already has it.

## §ELEMENT_LABEL — general single-element floating label, not mass-labelling (2026-08-27, user-queued, SPEC ONLY, not built)

**User's ask, verbatim:** *"labelling of elements ie on walls, doors, or floating next to devices to
indicate what they are, not for all just singles"* — read as: label ONE element at a time, on demand,
never every element in the scene at once. Searched this project's prompts for a prior spec — **none
found; this is genuinely new**, confirmed with the user directly, not assumed.

**Not a new mechanism — the SAME leader-line/label primitive item 4 above already designs, generalized
beyond clash pairs.** Item 4 ("Leader-line + glow callout") anchors a screen-space label to a clash
point's projected coordinates, reusing `§CPE_WALK_EDIT_V1`'s existing pixel-readback/projection math.
A general single-element label is the identical mechanism — projected screen position + a label div
— just anchored to ANY picked element's position instead of only a clash overlap point, and triggered
by a pick instead of only firing during the clash reveal. Building the clash label (item 4) as this
generalized primitive from the start, rather than a clash-only one-off, avoids building the same thing
twice.

**Label content — real data, already extracted, nothing invented:** `elements_meta` has
`ifc_class`, `element_name`, `discipline` per guid (confirmed via schema read, `Duplex_extracted.db`).
A door/wall/device label reads e.g. `"Door D-142"` or `"IfcFlowTerminal — AHU-3"` straight from those
columns — same discipline as item 6's clash-label text ("source the real numbers we already compute,"
not a generic placeholder string).

**Open, needs the user's call before this is buildable (flagged, not decided here):**
1. **Trigger.** A manual pick (click an element, label appears, click elsewhere clears it — same
   focus/blur shape `§CPE_CONE_ORIENT_ADJUST` just shipped, `CINEMA_PATH_EDITOR.md`) fits "single, on
   demand" most literally. But the user's phrasing ("on walls, doors... floating next to devices")
   could also mean labels that surface AUTOMATICALLY as the camera passes near specific element types
   during a movie bake — closer to `§CPE_ROOM_TITLE`'s "appears as the film enters it" pattern than a
   click. These are different builds (interactive-editor feature vs. baked-film feature) — which one,
   or both?
2. **Scope, if automatic:** "not for all just singles" needs a rule for WHICH elements qualify (every
   door? only devices/equipment? user-tagged ones only?) — a real query needs a real filter, not "all
   of class X" by default, or it silently becomes the mass-labelling the user explicitly ruled out.
3. **Persistence.** Does a placed/triggered label get saved with the path (same `_pathsApply`/
   `_buildOverride` round-trip every other CPE authored edit uses), or is it always ephemeral/re-derived
   live? Bears on whether this is authored data (like a cone correction) or a pure runtime effect (like
   room titles).

## §CLASH_IN_FILM_RULE — 2026-09-04 — the user's stated display rule, and the gate in front of it
> **USER, 2026-09-04:** *"If we add in the clash analysis (still pending to do mesh to mesh clash
> rather than bboxes only) where they appear as is thruout the film whether cam pov do come across
> or not is incidental, but when do flying past one, it be impressive to see that red/blue pair. And
> with labels flying together stating what each item is with a arrow line point to it all in 3D
> space."* … and, on the clutter risk: *"I agree with the needed rule - only near and facing, 1 or 2
> at a time. Those others can just be colored shine thrus pulsing slowly manner."*

**THE DISPLAY RULE, settled — do not re-litigate it.**
- Clash pairs are **persistent world content**, present for the whole film. The camera meeting one is
  **incidental**, never staged. A staged clash tour reads as a demo; an incidental one reads as truth.
- **Labels: only the pair that is NEAR and FACING the camera, one or two at a time.** A label carries
  what each item is, with a leader line to it in 3D. Everything else stays unlabelled.
- **Every other pair: a coloured shine-through, pulsing slowly.** Present, readable, not shouting.

**THE GATE IN FRONT OF IT — mesh-to-mesh first, film second. This ordering is forced, not preferred.**
Clash today is **bounding-box only**. A bbox pair can overlap while the meshes never touch, so the
current set contains false positives by construction. A film is a permanent, shareable artefact: a
false clash in it asserts to a client that a clash exists where none does — worse than showing no
clashes at all. So nothing from this section gets built until the narrow phase reports a measured
false-positive rate. That work is `CLASH_GATE_OBB_NARROWPHASE.md` (AABB broad → OBB/SAT mid →
triangle-exact via the already-loaded three-mesh-bvh `MeshBVH.intersectsGeometry`), dispatched
2026-09-04.

**What this section needs the clash output to carry**, per pair, so none of it is re-derived here:
both guids · both `ifc_class` and discipline · the **contact point/centroid in world space** (the
camera approaches it and the leader line points at it) · an **extent/severity** measure (which pairs
earn a label, which stay a pulse) · a **stable pair id** so a film addresses the same clash across
frames.

**Honest read on "will this be a killer?" (2026-09-04):** the persistent-clash half is the strong
half — it changes what the film IS, from decoration to evidence, and no competitor's marketing
animation does it because their clashes live in a report and the animation is a separate deliverable.
The labels are the risky half: mechanically easy (the billboard/nameplate machinery and the Reveal's
captions already exist) but clutter and leader lines crossing geometry can read as errors, which is
exactly what the near-and-facing rule above exists to prevent. Build the pulse first, the labels
second, behind that rule.

## §CLASH_FILM_P1 — 2026-09-04 — SPEC (written before code): the flag, the persistent pairs, the pulse
> **USER, 2026-09-04:** *"go ahead, spec then build 1-3 first"* — items 1–3 of the six named under
> §CLASH_IN_FILM_RULE. **Items 4–6 (near-and-facing selector, labels, leader lines) are NOT in this
> phase.** The point of stopping at 3 is that the pulse is the cheap half and carries most of the
> effect; the labels only earn their place once the pulse is on screen.

### Precondition, already met
`bim-ootb#1676` (`§MESH_NARROWPHASE`, `viewer/clash_narrow.js`) gives the triangle-exact pair set.
Terminal: `broad=5961 → meshTrue=3951`, so **33.7 % of the bbox list is false**. Without that, a film
would assert 2,010 clashes that do not exist. Every record already carries what this phase needs:
`pairId · guidA/guidB · classA/classB · discA/discB · verdict · contact{x,y,z} · extentM · severityM`.

### 1. The flag
`FLAGS.clash`, a peer of `buildup` / `roomTitle` / `reveal` / `dayCounter` — same three-way shape the
others have: absent = the stored Alt+C path decides, `--clash` forces on, `--no-clash` forces off
(`cli_silent_bake.js` `§CLI_BAKE_FLAG_OVERRIDE`). Logged in `§CLI_BAKE_RESOLVED` beside the others.

### 2. The pair set — built ONCE at staging, never per frame
Walk `rules.clash_rules`' discipline pairs → `A._queryClashesPairRtree(null, rules, discA, discB, 0, w)`
(the production broad phase, whole-building, not per-storey) → `A.clashNarrow.qualifyRows(rows, {label})`
→ keep only `verdict === CLASH`. One `§CLASH_FILM_BUILD pairsBroad= trueClash= discPairs= ms=` line.
A film that rebuilt this per frame would pay the 2 s narrow phase 4,699 times; it is static content.

### 3. The world content — two instanced box shells, red and blue
One `InstancedMesh` of a unit box per side: **red for every A-side element, blue for every B-side**,
placed and sized by `A.clashNarrow.worldMatrix(transform, m4)` — the SAME matrix the verdict was
computed from, so a marker can never disagree with the judgement that produced it. Two draw calls
total for up to ~7,900 markers.

**Why boxes and not the elements' own geometry:** drawing the real meshes needs per-element geometry
resident, which is exactly the memory `§CLASH_MEM geomPinnedPeak=0` was careful not to hold — and a
box shell round a clashing element is the convention every coordination tool already uses, so it
reads correctly rather than pretending to be the element.

`transparent: true`, `blending: AdditiveBlending`, `depthTest: true`, `depthWrite: false`,
`toneMapped: false` — a shine-through that reads through structure without hiding it. Built at
staging, alive to the last frame; nothing is added or removed while the film runs.

#### 3b. THE MARKERS ARE NOT GATED BY THE TIME MACHINE — they are a FORECAST, not a state readout
> **USER, 2026-09-04:** *"so the pulsing pairs will shine thru and off, even though the buildUp has
> not shown them on canvas, so user can note where the clashes are in general and can value its
> occurence prior"*

**Settled, and it is the opposite of the instinct.** The obvious implementation would hide a marker
until the Time Machine has placed its elements — matching what is on screen. **Do not do that.** The
markers are present from frame 0, over empty ground, while the building is still rising around them.

That is the whole value: the viewer sees **where the trouble is going to be, before it is built**,
and can weigh how much of it there is and where it clusters while the buildup is still running. A
marker that only appears once its elements are placed says nothing the finished model does not
already say. This also makes W2 (persistence) a hard count: the marker set is **independent of the
TM cursor**, so it must not call `A._tmIsVisible` or any placement predicate — if it does, the
forecast has been turned back into a state readout.

Consequence for the pulse: it must be visible against BOTH an empty site early in the film and a
fully built model at the end, so the base opacity is chosen against the built case (the busier
background) and checked against the empty one.

### 4. The pulse — a function of FILM time, not wall time
```
opacity = BASE + AMP * (0.5 + 0.5 * sin(2π * filmSeconds / PERIOD))
```
`filmSeconds` from the bake's own normalized `t`, **never `performance.now()`** — so the same film
pulses identically at 15 fps and at 24 fps, and a re-bake is reproducible. `PERIOD` is slow by
intent (the user's word: *"pulsing slowly"*).

#### 4b. TWO STATES PER PAIR, AND THE PULSE IS PER-INSTANCE — this constrains phase 1, not just phase 2
> **USER, 2026-09-04:** *"only those 1, 2 that are near and labelled remain solid colored pair non
> pulsing until they fade off from labelling contention"*

So a pair is in one of two visual states, and it moves between them by a **fade**, never a switch:

| state | who | look |
|---|---|---|
| **ambient** | every true pair | pulsing shine-through, `opacity = BASE + AMP·(0.5+0.5·sin(2π·filmSeconds/PERIOD))` |
| **selected** | the 1–2 near-and-facing pairs holding a label | **solid colour, pulse OFF** — it stops breathing while it is the subject |
| transition | a pair entering or leaving contention | `fade` in [0,1] blends the two; a pair that loses contention fades back into the pulse rather than snapping |

**The design consequence lands in PHASE 1, so build for it now:** the pulse cannot be one material
uniform per side, because individual pairs have to be lifted out of it while the rest keep breathing.
Carry the intensity **per instance** — `InstancedMesh.instanceColor` with
`colour = baseColour × mix(pulse(t), 1.0, fade)` — one `instanceColor` upload per frame (~7,900 × 3
floats ≈ 95 KB, or only the changed instances). Phase 1 ships with every `fade = 0`, i.e. everything
ambient; phase 2 then only has to write `fade` for the selected pairs and nothing else changes.

Getting this wrong is a rewrite, not a tweak — a single-uniform pulse cannot express "all of these
breathe except those two".

### 5. Witness claims — `witness_clash_film_markers.js`, and each can come back NO
- **W1 the markers ARE the mesh-true set, not the broad set.** `markers === 2 × trueClash`, and
  every marker guid appears in a record whose `verdict === CLASH`. This is the claim that stops the
  film asserting the 33.7 % that are false — it is the reason the phase exists.
- **W2 persistence.** Marker count at the first frame equals the count at the last. The user's rule
  is that the pairs are *world content* and meeting one is incidental; a marker set that changes
  with the camera has broken that.
- **W3 the pulse is a pure function of film time.** Opacity sampled at the same normalized `t` in a
  15 fps and a 24 fps bake must agree. **NO-OP guard:** amplitude must be non-zero — a "pulse" that
  never changes opacity is a no-op dressed as a feature.
- **W5 the per-instance channel is real, tested in phase 1 before phase 2 needs it.** Force `fade=1`
  on two instances and assert those two hold solid colour while every other instance still varies
  with `t`. Without this the "all breathe except those two" requirement is untested until the
  selector lands, and by then it is a rewrite.
- **W4 the flag controls it.** `--no-clash` yields exactly zero markers; `--clash` yields `2 × trueClash`.
- **VACUOUS:** `trueClash === 0` prints `INCONCLUSIVE`, never PASS — a building with no clashes proves
  nothing about a clash renderer.
- Red control via `witness_kit/contract.js`.

### 6. Explicitly NOT in this phase
No near-and-facing selector, no labels, no leader lines, no camera behaviour change, no new panel.
The camera meeting a pair stays incidental — nothing here steers it.

### §CLASH_FILM_P1 — MEASURED 2026-09-05 (bim-ootb PR #1678, stacked on #1676)
**Built, witnessed, and seen in a real bake.** `§WITNESS_CLASH_FILM_MARKERS pass=4 fail=0 ran=9`,
red control detected; all nine claims OK — mesh-true set (`pairs=271 notCLASH=0`), two markers per
pair, `contact`/`pairId` present on all 271, markers unchanged across the TM cursor
(542 at start / day 0 / end), **`_tmIsVisible` calls = 0** (spied, not assumed), pulse pure in film
time, swing 0.220→0.520, and the per-instance fade holding two pairs solid while an ambient one moved.

`§CLASH_FILM_BUILD discPairs=12 pairsBroad=1478 trueClash=271 markers=542 bothPlaced=271
incomplete=0 falsePositivesExcluded=1207 ms=3961` — reproduced identically in the witness and inside
the bake. **Hospital_silent's bbox list is 79.0 % false; Terminal's is 33.7 %.** Report them
separately — the buildings differ by more than an average can carry. 185 pairs come back
`unknown=aggregateParent` (composed parents with no geometry of their own) and are excluded rather
than guessed at.

**Clip proof:** `~/Downloads/Hospital_clash_clip_2026-09-05.mp4` — `--clash --clip 0.28:0.32`,
117 frames / 7.8 s / 2.7 MB, whole run **2 m 45 s**, `§MAXQ_QUALITY unconverged=0`, and
`§CLASH_FILM_DISPOSE markers released` after the loop so nothing survives into the scene.

**TWO DEFECTS FOUND ON THE WAY — both real, neither a test problem:**
1. **The clash R-tree is built lazily in the browser and is not in the DB.** With nothing opening the
   clash panel, every discipline pair returned `§CLASH_QUERY_RTREE … hits=0` and the build reported
   VACUOUS, because `_queryClashesPairRtree`'s per-element `catch (e) { continue; }` turns a missing
   `elements_rtree` into "no candidates" — indistinguishable from a building with no clashes. **A bake
   never opens that panel.** `clashFilm.build()` now calls `_ensureClashIndexes()`, waits for
   `_clashRtreeReady`, and refuses with the real reason. ⚠ Any earlier attempt to clash-check from a
   bake would have silently reported zero.
2. **A 404 on the building DB does not abort the bake.** `cli_silent_bake.js` sits on its 900 s
   load predicate, which can never become true, and only then crashes with a bare `TimeoutError` —
   15 minutes to learn a URL was wrong (`§INIT_ERROR … 404` was in the log at 2.7 s). It should fail
   fast on `§INIT_ERROR`/`§DB_404_OCI_FAIL` and name the URL. **Open, not fixed.**

**Two taste calls left with the user, both one-line constants:** `BASE 0.22 / AMP 0.30` against a
half-built model, and `PERIOD_S 4.0` for "slowly".

## §CLASH_FILM_P2 — 2026-09-05 — SPEC: the in-scene label. All three open questions ANSWERED by the user.
Phase 1 (§CLASH_FILM_P1) shipped the flag, the persistent mesh-true pairs and the per-instance
`fade` channel. Phase 2 is the label. **The user answered the three design questions outright — none
of these is open, do not re-litigate them.**

### The user's rulings, verbatim
> **1.** *"if it is close by where it is clear enough i would say within 4 meters, it will then hold
> its shine thru and bear labels even though behind close doors/walls/obstruction. And it is only
> selective well spaced out, not overlapping, can be up to any number thus."*
> **2.** *"A single label similar to the HUD, with same half see thru panel just to bear both items:
> above in red, below in the blue, users will know right away which is which. Just its semantic name
> ie Sprinkler / Wall. They fly together but its size remain constant to avoid overlaying pov."*
> **3.** *"No slowing down"* — the camera stays strictly incidental. Nothing in phase 2 steers it.

### §P2.1 — selection is PROXIMITY, not ranking. This replaces phase 1's "top 1–2".
> **AMENDED 2026-09-05 — 4.0 m / 4.6 m → 10.0 m / 10.6 m.** The user watched the 20–25 s clip
> (`Hospital_clash_FINAL_clip0.102-0.128`): pulses visible, nothing ever close enough to label —
> `§CLASH_LABELS_SUMMARY VACUOUS nearest=7.98m`; across the whole 195.8 s film the 4 m rule fired on
> 72/1500 path samples (4.8 %). Their words: *"10 meters or half of scene space"*. 10 m is the number
> implemented (`clash_labels.js` `ENTER_M = 10.0, RELEASE_M = 10.6`, the same 0.6 m hysteresis gap scaled
> up) so labels appear in normal flythrough footage, not only on extreme close approaches. No
> scene-relative ("half of scene space") formula was built — flag it if a building's scale makes 10 m
> clearly wrong (a small residential model, where 10 m reaches most of a floor and only the screen-space
> non-overlap limits the count) rather than inventing one. Every "4 m / 4.6 m" below reads 10 m / 10.6 m.
- **Eligible = the pair's `contact` is within 10.0 m (was 4.0 m) of the camera.** Not a top-N. Any number qualifies.
- **Occlusion is IRRELEVANT** — a pair behind a door, a wall or any obstruction still qualifies and
  still shines through. Do NOT raycast for visibility; the user ruled it out explicitly.
- **What limits the count is SCREEN SPACE, not a cap.** Walk the eligible set nearest-first and place
  each label only if its panel rectangle does not overlap one already placed this frame. Skipped
  pairs keep their marker; they simply carry no panel.
- **Hysteresis, or it strobes:** a pair enters at 10.0 m and is released at 10.6 m (was 4.0 / 4.6). A pair drifting on
  the boundary must not flicker between labelled and unlabelled every few frames.
- A labelled pair's `fade` → 1 (solid, pulse off) via the existing `A.clashFilm.setFade`; a released
  one returns to 0. **Phase 2 must not reimplement the marker or the pulse** — that API is the seam.

### §P2.2 — the label is 2D, composited onto the capture canvas. NOT 3D text, NOT DOM.
`_captureFrame` (cinema_maxq.js:767) draws the WebGL canvas into a 2D context and then composites the
HUD onto it (`A.dayCounterCompositeOntoCanvas`). Labels use that same pass, for three measured reasons:
- **a DOM overlay is never captured** — it would be invisible in the film;
- 3D text has to be re-oriented and re-scaled every frame and z-fights against structure;
- the 2D pass is already proven by the day counter and stays crisp at 1080p at no extra cost.
**Constant screen size** (the user's "size remain constant to avoid overlaying pov") falls out of this
for free — a 2D panel does not scale with distance.

### §P2.3 — the panel, and where the names come from
One panel per pair, styled like the day counter's half-transparent HUD box, two rows:
**the A-side name in red on top, the B-side name in blue below.** Nothing else — no guids, no
coordinates, no severity. The user: *"users will know right away which is which"*.

**The semantic name is EXTRACTED, not invented.** `viewer/rates.js` already carries 57
`Ifc<Class>: { desc: '…' }` entries and **every class in the measured clash set resolves**:
`IfcFireSuppressionTerminal → "Fire Sprinkler Head"` · `IfcWallStandardCase → "Standard Wall"` ·
`IfcPipeSegment → "Pipe Segment"` · `IfcCableCarrierSegment → "Cable Tray Segment"` ·
`IfcDuctFitting → "Duct Fittings (elbows, tees)"` · `IfcSlab → "RC Slab 250mm"`.
Trim for a label — drop a parenthetical and a trailing size/spec token ("RC Slab 250mm" → "Slab",
"Duct Fittings (elbows, tees)" → "Duct Fitting") by a stated deterministic rule, and **fall back to
the raw ifc_class** when a class is not in the map rather than inventing a name.

### §P2.4 — the leader line
Drawn in the same 2D pass: project the pair's `contact` with `vector.project(camera)` to screen x,y
and stroke from the panel edge to that point. Always correct on screen, never intersecting geometry
the way a 3D line would. Skip the line (keep the panel) when the projection lands behind the camera.

### §P2.5 — witness claims, each able to answer NO
- **P1 the enter rule holds:** every labelled pair is within the enter distance (10.0 m, amended); no pair
  beyond the release distance (10.6 m) is labelled. The witness reads both from `clashLabels.stats()` and
  derives every probe distance from them — nothing in the test is pinned to a number.
- **P2 occlusion is not consulted:** no raycast/visibility call in the selection path, and a
  synthetic pair placed behind a wall IS labelled. (The user ruled this in; a "fix" that hides it is
  a regression.)
- **P3 no overlap:** across a run of frames, no two placed panel rectangles intersect.
- **P4 no strobe:** over a camera pass that crosses the boundary, no pair changes labelled-state more
  than once per hysteresis crossing.
- **P5 constant size:** a panel's pixel dimensions are identical at 1 m and just inside the enter distance.
- **P6 the fade seam:** a labelled pair reads `fade=1` and its marker stops pulsing; released → 0.
- **VACUOUS:** no pair ever came within the enter distance during the sampled frames → INCONCLUSIVE, never PASS.
- Red control via `witness_kit/contract.js`.

### §P2.6 — scope fence
No camera change (ruling 3). No new panel in the viewer UI. No edits to `clash_film.js` beyond using
`setFade` — its marker geometry and pulse envelope are being corrected concurrently under
§CLASH_FILM_P1 and must not be forked.

### §CLASH_FILM_P2 — MEASURED 2026-09-05 (bim-ootb branch `feat/clash-film-p2`, stacked on `feat/clash-film-p1`)
**Built as specified: `viewer/clash_labels.js` (new) + the three hooks in `cinema_maxq.js` (reset after
`clashFilm.build`, `clashLabels.update` before `clashFilm.update` each frame, the 2D composite first in
`_captureFrame` so the corner HUD always paints over a label). Only contact with `clash_film.js`:
`pairs()`, `setFade()`, `stats()` — its file is untouched.** Witness
`viewer/tests/witness_clash_film_labels.js`, 12 claims, logs `~/Downloads/cll/witness_cll_*.log`.

**RED → GREEN, three runs:**
- *Before* (P1 tree, module absent): `§CLL verdict=INCONCLUSIVE reason=clash_labels.js not wired` →
  `§WITNESS_CLASH_FILM_LABELS pass=0 fail=0 ran=0 INCONCLUSIVE` (exit 2). Not green.
- *Sabotage* (`SABOTAGE=occlude` wraps the selector with the visibility filter the user ruled OUT):
  `P2a … calls made by the selector: 1 (must be 0) FAIL`, `P2b … hidden=true; labelled=false FAIL`,
  and P1a/P1b/P3/P4/P5/P7 fall with it → `pass=3 fail=1 ran=12`, exit 1. **The claims can fail, and the
  regression the ruling forbids is the one they catch.** Also measured on the way: with that filter
  even the isolated pair at 3.5 m with NO synthetic occluder goes unlabelled (`P1a … labelled=false`) —
  the real building already hides it from that approach, so "occlusion is irrelevant" is not a corner
  case, it is the common case.
- *After* (this branch): `§WITNESS_CLASH_FILM_LABELS pass=4 fail=0 ran=12`, red control detected, all 12 OK:
  - **P1** `P1a d=3.5 labelled=true` · `P1b d=4.3 after entering: labelled=true` · `P1c d=4.7: labelled=false
    released=…@4.70` · `P1d d=4.3 after release: labelled=false entered=-`.
  - **P4** one straight pass 6 m→2 m→6 m in 0.02 m steps: `flips=2 enterAt=3.98m releaseAt=4.62m` — no strobe.
  - **P5** `at 1.0 m 205x51 px; at 3.9 m 205x51 px (frame 1280x720)` — constant size.
  - **P2** `raycast/BVH calls made by the selector: 0` (spies on `Raycaster.intersectObject(s)` and every
    `MeshBVH` cast); a 30 m plane inserted halfway, the witness's OWN raycast proving `occluder hit at 1.75 m,
    contact at 3.5 m → hidden=true`, and the pair `labelled=true` anyway.
  - **P3** densest cluster (`neighboursWithin3.5m=10`), camera 2 m off: `eligible=10 labelled=7
    skippedOverlap=3`, seven rectangles pairwise disjoint — screen space, not a cap, limits the count.
  - **P6** labelled: `fade=1 marker T/4=1 3T/4=1 (equal=solid) ambient 0.52→0.22`; released: `fade=0 marker
    0.52→0.22 (moves=pulsing)` — read off the marker's `instanceColor`, i.e. the effect, not the variable.
  - **P7** the STORED Hospital path sampled at 1500 points (`durationSec=195.8`, the bake's own
    `§CPE_APPLIED total=195.8s`): `eligible on 72/1500 samples` (4.8 % of the film), `maxEligible=1`,
    `nearestM=2.25`, `overlapping panel pairs=0`, `visibility calls=0`, `enters=5 releases=5`. Windows:
    `t=0.0667→0.07 · 0.0761→0.0814 · 0.2995→0.3135 · 0.3756→0.3809 · 0.6938→0.7105`.

**TWO SPEC CORRECTIONS, measured, not worked around:**
1. **§P2.3's "every class in the measured clash set resolves" is WRONG on Hospital_silent: 11 of 13.**
   `IfcCableCarrierFitting` and `IfcDistributionControlElement` have no `rates.js` entry and show their raw
   `ifc_class` (`§CLL_NAME IfcCableCarrierFitting → "IfcCableCarrierFitting" source=ifc_class`). That is the
   fallback the spec asked for, not a guess — but the sentence above was a claim about the data and the
   data says otherwise. Adding those two `desc` rows to the rate tables is a one-line data change, left
   for the rates owner.
2. **The live `window.RATES` is the LOCALE's table, not `rates.js`'s hardcoded block.** In the bake page
   `IfcWall.desc` reads `"CMU Wall 150mm"` (`viewer/locales/en_US.js:50`), where `rates.js:44` says
   `"Blockwork Wall 150mm"`. The label reads the live object — the same table the 5D panel shows — so the
   name follows the locale/rate pack, which is the correct source; the spec's citation of `rates.js` as
   the table should read "the live `RATES` table (rates.js fallback, replaced by the locale/rate pack)".
   Trim rule as shipped (stated in `semanticName()`): drop parentheticals → drop digit-bearing tokens →
   drop a leading ≤3-letter all-caps prefix (RC / LED / PVC/HDPE) → singularise a trailing plain plural.
   Measured table: `RC Slab 250mm → Slab · Duct Fittings (elbows, tees) → Duct Fitting · LED Light Fixture
   → Light Fixture · CMU Wall 150mm → Wall · Pipe Fittings → Pipe Fitting`; 8 others pass through unchanged.

**One witness defect found and fixed before it could mislead:** the path profile first reported
`nearest 1.11 m` at `t≈0.02–0.06`, and a bake of that clip came back `§CLASH_LABELS_SUMMARY VACUOUS
frames=117 eligibleFrames=0 nearest=10.58m` (`~/Downloads/cll/Hospital_clash_labels_VACUOUS_clip0.02-0.06_2026-09-05.log`).
Cause: `cinemaPathPlan` reads the LIVE camera basis (§CPE_PREVIEW_DIVERGENCE) and the witness had moved
the camera for P1–P6 before building the plan. The witness now restores the load-time pose first; the
corrected profile's `durationSec=195.8` matches the bake's `§CPE_APPLIED` exactly, and the vacuous bake
stands as proof that the VACUOUS guard fires in a real bake rather than reporting PASS on nothing.

**THE REAL BAKE — `~/Downloads/cll/Hospital_clash_labels_clip0.69-0.73_2026-09-05.mp4`** (`--clash --clip
0.69:0.73`, the corrected profile's longest ≤4 m window; 117 frames / 7.8 s / 2.69 MB, `§CLI_BAKE_WALL
totalSec=100`, `§MAXQ_QUALITY unconverged=0`, fresh `--profile` per the rule):
- `§CLASH_LABELS_SUMMARY frames=117/117 eligibleFrames=50 labelFrames=50 maxEligible=1 maxLabelled=1
  enters=1 releases=1 skippedOverlap=0 panelsDrawn=50 nearest=2.25m` — **the bake's nearest approach
  equals the witness's profile `nearestM=2.25` to the centimetre**, so the profile IS the bake's path.
- One pair, `03qaNJULP1cvoRu8cCb_Ts|0e8pm26Tv5vPrj6zU55MQt`: `§CLASH_LABELS frame=10 … enter=[…@3.96]
  panels=[90@1059,111,167x51:0.13]` (fading in, alpha 0.13 on its first frame) → `frame=20 … @1093,68 …:1.00`
  → `frame=30 nearest=2.27m` → `frame=40 … 167x51B` (the contact passed BEHIND the camera at 2.55 m: the panel
  clamps to the frame edge, no leader — §P2.4's rule) → `frame=60 … release=[…@4.63]`. 50 labelled frames,
  one enter, one release, no strobe.
- The panel sits at x=1088–1093 on 1280 wide: `w − margin − bw = 1280 − 20 − 167 = 1093` — the contact
  projects at or beyond the right edge for most of the pass. **The film flies PAST this clash, it never
  looks at it** — exactly the "incidental" case the rule wants, and why the leader/edge-clamp path matters.
- **End of the chain — the label is in the exported bytes, measured, not eyeballed:**
  `viewer/tests/probe_clash_label_pixels.js` pulls the logged frames out of the mp4 with ffmpeg as raw RGB
  and looks inside each logged rectangle for the label's signature (red text concentrated in the top row
  band, blue in the bottom band — a marker glowing behind the plate would put red across both):
  `§CLL_PIXELS frame=30 pair=90 rect=1093,20,167x51 redTop=962 redBot=0 bluTop=0 bluBot=308 LABEL-IN-BYTES`
  and the same at frames 20/40/50 → `§CLL_PIXELS_SUMMARY panelsChecked=4 found=4 notFound=0 PASS`
  (`~/Downloads/cll/probe_pixels_clip0.69-0.73.log`).

**Stated choices (constants and rules the spec left to the implementation — each one line to change):**
`FADE_S 0.5` film-seconds for the marker to go solid / back to the pulse (§4b "a fade, never a switch");
panel font `0.022·h` (16 px at 720), plate `rgba(0,0,0,0.45)` and corner radius from the day counter; the
panel goes up-right of the projected contact, up-left when that would leave the frame, below when the top
would, then clamps to a 0.028·h margin; the leader runs from the panel's nearest edge point to the contact
with a dot on it; the panel's alpha follows the marker's fade so both arrive together; labels are drawn
FIRST in the 2D pass so the day counter / path box / pie always paint over them (the HUD column is fixed
furniture; a label wanders). The fade target is "holds a panel", so a pair that is within 4 m but lost the
screen-space contention keeps pulsing until a panel frees up — the literal reading of §P2.1.

**Not in this phase, plainly:** no HUD-column avoidance beyond draw order (a label can sit under the
day counter's corner and be covered by it); no facing test (ruled out: proximity only). The 15-minute
DB-404 hang named under P1 is still open.

---

# ⚠ RESUME HERE — 2026-09-05 session close

## State: phase 1 and phase 2 both BUILT and WITNESSED. Three PRs open, stacked, none auto-merging.
```
#1676  feat/clash-mesh-narrowphase  → main                        §MESH_NARROWPHASE (mesh-true pairs)
#1678  feat/clash-film-p1           → feat/clash-mesh-narrowphase §CLASH_FILM_P1 (markers + pulse + flag)
#1679  feat/clash-film-p2           → feat/clash-film-p1          §CLASH_FILM_P2 (the label)
```
Merge order is bottom-up: 1676, then 1678, then 1679. **The user reviews these** — do not arm
auto-merge. Working worktree for #1676/#1678 is `/tmp/wt-clash-mesh` (branch `feat/clash-film-p1`,
pushed, clean). sw is at **v1145**.

## THE ONE OPEN DEFECT — the additive markers wash the sky. MEASURED, NOT FIXED.
> **STATUS 2026-09-05 (later session): FIXED AND RE-MEASURED — see `§CLASH_FILM_SKY_WASH — MEASURED` at
> the end of this file. Sky-band changed pixels 80,161 → 4,886 on the same window (16.4× down). The three
> user items below (sky, earlier clip start, label styling) are all landed: bim-ootb `feat/clash-film-p1`
> @ `4d2fcf93`, `feat/clash-film-p2` @ `35bd6982`, PRs #1678/#1679 still open for the user's review.**
> **USER:** *"IT seems to leak into outside sky etc that floor slab turning light blue"* … and, after
> the second clip: *"is the sky bug fixed?"* — **the honest answer is still no.**

Measured by diffing a `--clash` clip against a `--no-clash` control bake of the SAME window
(`Hospital_clash_clip2_2026-09-05.mp4` vs `Hospital_noclash_clip_2026-09-05.mp4`, clip 0.28:0.32,
117 frames each — this is the right instrument; raw pixel classification on one film is not, because
a dusk sky reads as "red marker" and a blue sky as "blue marker", which cost one wrong measurement):
- **peak marker coverage 9.8 % of frame, max 15.3 %** (frame 64 alone: 116,453 blue pixels)
- **sky band, top 180 rows: up to 73,619 changed pixels**
- for contrast, the parts that ARE right: `corr(envelope, on-screen intensity) = 0.906`, and
  dark-phase frames sit at the codec noise floor (mean Δ 10) — the pulse genuinely reaches off.

**Two causes, both in `viewer/clash_film.js`:**
1. markers are WORLD-sized, so one near the lens balloons;
2. additive blending in front of sky brightens the sky (structure behind a marker gets the intended
   shine-through; empty sky just gets brighter and bluer).

**Fix specified, not landed:** clamp each marker to a constant small SCREEN size (scale by camera
distance, the same idea the label already uses for its panel) so proximity cannot balloon it, and
drop `PEAK` from 0.55 so any residual sky contribution is faint. Then re-run the SAME control diff
and require sky-band changed pixels to fall by an order of magnitude with
`corr(envelope, intensity)` unchanged.

**User's review of the clip 2026-09-05, three items, dispatched together:**
1. Sky wash confirmed STILL PRESENT on watching the actual clip ("still white (light bluish) washing
   unrelated portions") — the fix above is now landed, not just specified.
2. Clip should start several seconds EARLIER — the 0.69:0.73 window only shows the labelled moment,
   not the pulsing pairs building up to it. Extend the start so the pulse is visible before the label
   triggers.
3. Label styling isn't visually consistent with the rest of the HUD. Read `viewer/clash_labels.js`
   (branch `feat/clash-film-p2`): the plate colour and font FAMILY already deliberately match the day
   counter (`PLATE='rgba(0,0,0,0.45)'`, same `-apple-system,...` stack) — but the name text is pure
   saturated `rgb(255,33,26)`/`rgb(41,112,255)` (matched to the marker colours on purpose, so a viewer
   ties name to marker), which reads as a neon foreign element against the day counter's muted white/
   `rgba(255,255,255,0.62)` grey text, and the font WEIGHT is `600` where the day counter uses `700`/
   `500`. Also the PR #1679 review already flagged the leader line as fixed near-white regardless of
   background (low contrast) — fold that fix in at the same time, same file, same visual pass. Keep the
   red=A/blue=B colour-coding (it's load-bearing, not decoration) — tune shade/weight/contrast so it
   reads as the same HUD family, not remove the colour identity.

## Second open question, raised by the user and NOT yet measured
> *"during fly indoors, it seems it is not as bright as when we do a static alt-s"*

**Ruled out already, by code read:** `A._nightPLScaleStill = 0.5` (§STAGED_PL_CUT, tools.js:1100) is
applied by BOTH paths — `effects.js:3623` (Alt+S still) and `effects.js:5035` (bake). Same cut either
way, so it is not the difference. **Do not re-derive this.**

Two candidates were parked (never measured — a third, confirmed by code read, now explains it and
supersedes them for this session; keep the two below written down in case the fix below doesn't fully
close the gap):
1. the light budget is spread by the camera, not the room (`_nightUpdateLights` frustum+nearest-N pick).
2. the bake renders half the still's fold (`§MAXQ_FRAME_BUDGET` 20 renders/frame vs the still's 40).

**THIRD CAUSE, CONFIRMED BY CODE READ 2026-09-05, user recalled it independently mid-session
("the outside Sun shines into building... make indoors darker... we talked about this before"):**
`cinema_maxq.js:1611` calls `A._sunArcStep(_tn)` **unconditionally, every baked frame** — not gated
by `_clash`/`_buildup`/night mode. `effects.js:2621-2626` (`§SUN_ARC`, user ask 2026-08-11 "high noon
at the start, low angle by the end"): `_sunElevationAt(tNorm) = 55 + (6-55)·tNorm` — the sun sweeps
from **55° (high noon)** at frame 0 down to **6°**, the SAME dusk angle Alt+S's dusk-mood uses, only
at the LAST frame. A plain Alt+S taken mid-session sits at whatever elevation was last live (never
this arc) — so every comparison the user has made is baseline-mismatched: the movie's early/mid
frames render under a much higher sun than any Alt+S they compared against.
- Confirmed this is a genuine interior-fill problem, not just perception: `A.ambient.intensity` /
  `A.hemi.intensity` / `A._nightPLScale` (the fill: warm point lights + hemi/ambient) are set **ONCE**
  at photo-staging entry (`effects.js:3623,3628-3629`) and never touched again per frame — the fill is
  numerically IDENTICAL at noon and at dusk. Only the sun's own elevation/shadow-angle and the sky/fog
  dayT blend (`scene.js:334`, `(elevation+10)/55`) move. A high, near-overhead sun throws little
  horizontal light through vertical windows (the opposite of a low grazing dusk sun, which floods deep
  into a room) — so with a frame-invariant fill, the interior genuinely reads dimmer/flatter while the
  sun is high, and only catches up to the "bright and lively" dusk look near the end of the arc.
- Ruled out as a factor: TM's OWN day/night sun-cycle (`time_machine.js` `applySunCycle`, called
  unconditionally from `renderAtTime` — which the bake's `tmSetCursor` does hit every frame) is
  gated on module-local `_sunCycle`, which defaults `false` and is only set `true` by the separate,
  unrelated "Cine Director" autoplay beats (`opening`/`establishing`/`panoramic`) — never engaged by
  the CPE/MaxQ hand-authored bake path this project uses. `applySunCycle` no-ops every frame here;
  confirmed by code read, not re-derive.

**USER'S RULING ON THE FIX (2026-09-05, do not re-derive):** do NOT touch the sun arc, its shadows, or
the god-ray/shaft effect — keep all of that exactly as-is, sun rays and shadows on interior objects
must keep working. Compensate on the FILL side instead: as the arc's elevation/dayT rises, boost
interior ambient+hemi+point-light fill so the room holds the same "bright and lively" read Alt+S's
dusk baseline already has, for the WHOLE arc, not just its last frame. The sun's own highlights/shafts
are allowed to read relatively dimmer by comparison as a side effect of that fill rising around them —
explicitly acceptable ("may be dimmer as a result but it's OK when noticeable").

**Correction, same session:** first read of the user's follow-up ("beam has not really noticeable")
was mis-parsed as "no beam wanted" — WRONG, user corrected it directly. They DO want a visible sunbeam
into the interior, done with realism: where the beam lands, what's behind/under it reads greyed/blown
out, same as a real camera. See `§SUN_BEAM` below — a separate feature from the fill-compensation fix
in this section, dispatched separately, build-now per user ruling.

**Fix, specified not yet landed:** in `cinema_maxq.js`'s per-frame loop, after `A._sunArcStep(_tn)`
(currently line 1611) runs and moves the sun, compute `dayT = clamp((elevation+10)/55, 0, 1)` (reuse
scene.js's own formula so the baseline lines up with the existing dusk-tuned look at dayT≈0.29, i.e.
elevation=6°, unchanged). Scale `A.ambient.intensity` / `A.hemi.intensity` (off their photo-staged
BASE, `A._nightSaved.ambI`/`hemiI` × their existing `PHOTO_*_INTENSITY_SCALE`, not compounding
frame-over-frame) and `A._nightPLScale` by a fill-boost factor that is 1.0 at the dusk baseline and
rises with `dayT` above it; call `A._nightUpdateLights()` again right after so the frozen bake light
pool (`§NIGHT_BAKE_POOL`) picks up the new scale before this frame's capture. Sun position/intensity/
shadow-map calls are untouched — this only ever writes ambient/hemi/`_nightPLScale`. Gate the whole
block on `A._maxqActive` (bake-only) so plain nav and manual Alt+S are unaffected.

**The measurement that settles the tuning constant, and doubles as the witness (PRIMAL LAW — no
eyeballing):** bake a FIXED indoor pose at a spread of `tNorm` samples (e.g. 0, 0.25, 0.5, 0.75, 1.0 —
noon through dusk), log a `§SUN_ARC_FILL` line per sample with `elevation`, `dayT`,
`ambient.intensity`, `hemi.intensity`, `_nightPLScale`, and mean interior luma read back from the
exported frame (ffmpeg raw RGB, masked to the room — exclude window/sky pixels the same way
`probe_clash_label_pixels.js` already isolates a rectangle, so a bright window doesn't skew the
room's own reading). Tune the boost constant until the noon-sampled (`tNorm=0`) luma is within a small
tolerance of the dusk-baseline (`tNorm=1`, unchanged) luma. Separately confirm `A.sun.intensity` and
the shadow map are byte-for-byte the same series as before the fix (a before/after diff on those two
alone) — proof the shafts/shadows were not touched.

### §SUN_ARC_FILL_ALREADY_SHIPPED — 2026-09-05, dayT-boost dispatch found stale before any code was written

Dispatched to implement the "Fix, specified not yet landed" dayT-boost above (scale ambient/hemi/
`_nightPLScale` by a factor rising with `dayT` above the dusk baseline). **Did not implement it —
git archaeology in `bim-ootb` showed the interior-fill-vs-Alt+S problem this section describes was
already fixed, witnessed, and MERGED to `origin/main` by a DIFFERENT, superseding mechanism, minutes
BEFORE the "THIRD CAUSE, CONFIRMED BY CODE READ" / "USER'S RULING ON THE FIX" text above was
committed to this file.** Exact timeline (all 2026-09-05, KL time UTC+8):
- 07:10 `bim-ootb` `07456a03` — the dayT-boost curve WAS built once already (branch
  `fix/sun-arc-fill-compensation`), shipped **INERT (k=0)**: witnessed at a Hospital_silent Level-1
  storefront pose and found the defect **not exhibited** — OFF-fix noon luma (65.6-69.8) read
  BRIGHTER than dusk (62.4), the opposite of the theorized dim-noon problem. This is the same
  "noon read brighter than dusk" finding recorded independently in `§CLASH_FILM_P3` item 7 below and
  in `MEMORY.md`'s `project_sun_arc_fill_indoor_brightness.md` — NOT superseded by the THIRD CAUSE
  section as this task's dispatch prompt assumed; it is the immediately-preceding measurement on the
  same branch.
- 10:26 memory `project_sun_arc_fill_indoor_brightness.md` records the user's own pivot, verbatim
  intent: *"make the bake each frame retain exactly the alt-s effect look, without disturbing present
  light from Sun casting shadows... alt-s as it is, is well lit"* — stop modeling a boost curve,
  PIN fill to the exact Alt+S values every frame instead.
- 10:41 `bim-ootb` `19018e59` implements the pin (`effects.js A._sunArcFillPin`, called from
  `cinema_maxq.js` right after `_sunArcStep`, gated on `A._maxqActive`), explicitly replacing the
  dayT-boost curve, commit message quoting the user directly: *"I know shadowed outside walls are
  darker but indoors we reverse it, letting alt-s normal, and sunlite is brighter... do it."* Witnessed
  (`witness_sun_arc_fill.js`, `§WITNESS_SUN_ARC_FILL_VERDICT PASS ... rows=10 pass=11 fail=0`): ambient/
  hemi/`_nightPLScale`/budget/near-fade-floor/lit-count EXACTLY equal the staged Alt+S baseline at all
  five `tNorm` samples (0/.25/.5/.75/1), and `A.sun.intensity`/position/target/shadow camera/shadow
  matrix/shadow-map bytes are `same(...)` BEFORE vs AFTER at every sample — sun/shadow untouched.
- 10:45 PR **#1681** (`fix/sun-arc-fill-compensation` → `main`) MERGED — squash commit `82f14bbe`.
- 10:50 `bim-compiler` `a0b590a5f` — THIS file's "THIRD CAUSE"/"USER'S RULING" text committed, 5
  minutes after #1681 merged, evidently without seeing it — the ruling it records ("boost fill as
  dayT rises above the dusk baseline") describes the curve the merge had just replaced, not the pin.
- Working tree at dispatch time (uncommitted `§CLASH_FILM_P3` item 7, this file) still lists the
  sun-arc theory as "NOT CONFIRMED" with a *different* untried next candidate (camera-spread light
  budget) — also apparently unaware of the merge; left as-is, not this task's file to edit.

**Verified directly, not taken on faith:** checked out a fresh worktree off `origin/main`
(`/tmp/wt-sunfill`, since removed — no edits were needed) and confirmed `82f14bbe` /
`A._sunArcFillPin` / the `§BAKE_FILL_PIN` call site are already present in `viewer/cinema_maxq.js`
and `viewer/effects.js` on `main`, and re-read the shipped witness log
(`viewer/tests/logs/sun_arc_fill/witness_sun_arc_fill_pin.log`) confirming the PASS verdict above.

**Net effect on the mechanism this spec describes:** the shipped fix does not "rise with dayT above
1.0 at the baseline" as specified above — it holds ambient/hemi/`_nightPLScale` **constant at the
Alt+S baseline for the entire arc, every frame**, which is a stronger, simpler statement of the same
user intent ("indoors should always read like Alt+S, not like the outdoor shadow logic"). The
"Fix, specified not yet landed" text above is now superseded by this section and should not be
re-implemented — re-deriving it would reintroduce the discarded dayT-boost curve on top of code that
already holds the invariant it was trying to approximate.

**No branch/PR opened by this task — zero code changed.** `§CLASH_FILM_P3` item 7's GATE ("Solve the
alt-s livelier indoors before baking a next") is left exactly as that section states it; whether the
already-merged pin closes it is the user's call, not asserted here.

## §SUN_BEAM — new feature, user ruling 2026-09-05: build now, separate from the fill fix above
> **USER:** "of course in real life we can see it obscures what's behind its sun beam into room" ...
> "I am welcoming a Sun beam into interior just that to do it with realism" ... "what is behind the
> beam is of course greyed as in real life."

**Want:** a visible sunbeam/light-shaft where the sun's direct light passes through a window/glazing
opening into the room, tracking the live sun direction (so it's long and grazing at dusk, short and
steep near noon — the same `_sunArcStep` arc the fill fix reads, for free). Where the beam crosses or
lands on a surface, that surface should read greyed/blown-out — obscuring detail there, the way a real
camera clips highlights in a sunbeam. **Not asked for:** correcting this away — it was a misread this
session, corrected by the user directly; do not re-litigate "should the beam even exist."

**Extract, don't invent — the building blocks already exist in this codebase, use them:**
- Glazing elements to beam FROM are already a named class list: `A._nightWindowGlowClasses =
  ['IfcWindow','IfcCurtainWall']` (`tools.js:1507`; note the HHS caveat there — some buildings pattern
  glass as `IfcPlate` mullion+plate instead of `IfcWindow`/`IfcCurtainWall`, check per-building) and
  `CINEMA_GLAZING_CLASSES` (`effects.js:6191`, adds `IfcPlate`/`IfcMember`). Reuse one of these lists,
  don't invent a third.
- "Does the sun reach this surface" is already answered elsewhere with a plain dot-product test —
  `scene.js:276-291`'s lensflare visibility (`_sunAbove = sunPos.y > 50`, `_sunDot = sunDir·camDir`).
  A window facing the sun is the same shape of test against the window's outward normal instead of the
  camera direction — reuse the pattern, not a raycast (§GLOW_SPRITE's own rejected-on-cost note next
  to it: raycasting against batched meshes for ~1000+ elements is a tens-of-seconds stall at
  still-start — don't reintroduce that here for beam placement).
- Bloom is ALREADY WIRED and ALREADY the mechanism this project uses for "this surface should read
  blown out" — `A._bloomPass` (`effects.js:33,82-92`), still/bake-only, threshold 1.0, `toneMapped:
  false` pushes a material above 1.0 in linear space so bloom finds it (`effects.js:4472`, the exact
  §GLOW_SPRITE/§GLOW_EXIT_SOFT pattern at `effects.js:4517-4545` — `GLOW_GAIN=3.0` blooms,
  `GLOW_EXIT_GAIN=0.9` stays below threshold and glows softly instead). **The beam should be built the
  same way: real geometry (a soft-edged, radially-faded additive shaft/frustum mesh, same family as the
  glow sprite/quad already in this file), not a new screen-space god-ray shader.** Its core write value
  decides whether it blooms (crosses 1.0) — tune it the same way `GLOW_GAIN` was tuned, don't guess a
  fresh constant from nothing.
- No volumetric/god-ray shader or screen-space pass exists in this codebase today (checked: no
  `UnrealBloomPass`/godray/volumetric hits anywhere but `BloomPass` itself) — do not add a new
  EffectComposer pass for this; the geometry+bloom route above is the house style and is cheaper.

**Constraints, from the ruling:** photo-staging-only (Alt+S/Alt+C — never plain nav, same discipline as
Bloom/Ember/§PHOTO_BLOOM's own "still-only, 7 extra full-screen draws" note). Must track the LIVE
`A.sun` position every bake frame (after `_sunArcStep`), not a fixed direction — realism means the beam
visibly swings/lengthens as the arc moves. Must not require per-pixel raytracing against real geometry
to decide exactly where the beam's far end lands (too costly, see above) — a plausible geometric
placement (shaft from the window opening along the sun direction, sized/clipped to a reasonable room
depth) is the right fidelity level for this codebase, not a physically-exact caustic.

**Witness required (PRIMAL LAW, no eyeballing):** log a `§SUN_BEAM` line per sampled frame across a
`tNorm` sweep (reuse the same 0/0.25/0.5/0.75/1.0 samples as the fill-fix witness) with: which
window(s) qualified (sun-facing test result), the beam direction vector, and its angle vs `A.sun`'s
actual direction that frame (must track, not drift — assert a tight tolerance). Then a pixel-level
proof, same technique as `probe_clash_label_pixels.js` (ffmpeg raw RGB readback of the exported frame):
mean luma inside the beam's landing footprint vs. a masked control region on the same surface just
outside it, at a `tNorm` where the beam is known to be active — assert the beam-footprint region reads
measurably brighter/more clipped-toward-white than the control region. That is the numeric form of
"greyed out, obscuring what's behind it."

## Also settled this session, so it is not re-opened
- Clash pairs are the **mesh-true** set. Terminal bbox false rate **33.7 %**, Hospital_silent **79.0 %**
  — report separately, never averaged.
- The markers are a **forecast**: present from frame 0 over empty ground, never gated by the Time
  Machine (`_tmIsVisible` calls = 0, spied not assumed).
- Labels: within **10 m** (amended 2026-09-05 from 4 m, see §P2.1), occluded or not, any number, limited only by screen-space non-overlap;
  one HUD-style panel, red name above / blue below, constant screen size; **no camera slowdown**.
- Alt+C now carries the **Clash pairs** checkbox and a **Silent-bake size** select that
  `cli_silent_bake.js` honours when `--width/--height` are absent.
- An unloadable DB now aborts the bake in **2.8 s**, not 900.

---

## §CLASH_FILM_SKY_WASH — MEASURED 2026-09-05 (later session): the sky wash is fixed, the clip starts earlier, the label is the HUD's family
Branches (fixup commits on the EXISTING PR branches, nothing merged — the user reviews): `feat/clash-film-p1`
`07b6631c → 4d2fcf93` (#1678, body regenerated from this code via the REST API — `gh pr edit` fails on the
Projects-classic GraphQL deprecation), `feat/clash-film-p2` `120ca1f0 → 35bd6982` (#1679, now merges p1
cleanly — it was CONFLICTING at session start). sw **v1146** (p1) / **v1147** (p2). Every file named below is
in `~/Downloads/cll/`; the instrument is `clash_control_diff.py` there (the prior session's diff script did
not survive, so it was rebuilt to the spec's own description and re-baselined on the prior clips).

### 1. The fix, in `viewer/clash_film.js` (§CLASH_FILM_SCREEN_CLAMP)
Each marker is clamped **per frame** to a constant small SCREEN size: `MARKER_MAX_PX = 0.06` of frame height
(43 px at 720p); its world box is `min(severity box, MARKER_MAX_PX·2·d·tan(fov/2))` from that frame's camera
distance `d`, so a marker near the lens stops growing and a far one is untouched. `PEAK 0.55 → 0.30`. The
clamp logs `§CLASH_FILM_SCREEN_CLAMP update=N clamped=K/271 nearest=…m box=[min..max]m capPx=43@720` on the
first update and every 60th. Witness **W6** (`witness_clash_film_markers.js`, now 10 claims): at 0.8 m the
0.4 m severity box would be **311.8 px → placed 0.0554 m = 43.2 px** (cap 43); at 30 m placed = severity.
`§WITNESS_CLASH_FILM_MARKERS pass=4 fail=0 ran=10`, red control detected.

### 2. Control diff, same window as the prior measurement (`0.28:0.32`, 117 frames, 1280×720, |Δ|>24, sky = top 180 rows)
| | before (prior session's clip2 vs its control) | after (`Hospital_{clash,noclash}_skyfix_clip0.28-0.32`) |
|---|---|---|
| sky band changed px, max / mean | **80,161** / 8,970 | **4,886** / 283 — **16.4× down** |
| marker coverage, max / on peak frames | 15.9 % / 10.9 % | 0.6 % / 0.4 % |
| marker \|Δ\| mass, peak frames vs dark frames | 11,894k vs 0.5k | 267k vs 0.5k → **525× on/off** |
| corr(envelope, marker mass) | 0.757 | 0.672 |
| **outside markers+labels** changed px, max / mean per 921,600-px frame | — | **45 / 10** (maxΔ 82) |
The spec's remembered `corr = 0.906` was a different (lost) instrument; on THIS instrument the before reads
0.757. The after's 0.672 is geometric, not a weaker pulse: the marker no longer fills the frame, so the pair
leaves the frame during this window's fall phase (frames 68–108 read 0 % either way). Dark-phase frames sit
at the codec floor before and after (mean Δ 0.81 / 0.87) — at envelope 0 the marker's instanceColor is
exactly (0,0,0), so an additive marker cannot touch a pixel: **that is the "`--clash` disturbs nothing else"
proof for this window — sky, materials, bloom identical to 45 px per frame.** Reports:
`diff_skyfix_{BEFORE,AFTER}_clip0.28-0.32_2026-09-05.log`.

### 3. §CPE_CLIP_SUN_ARC_FILM_T — found in the demo clip's own log, fixed on p1 (`cinema_maxq.js`)
`A._sunArcStep(_tn)` fed the CLIP-LOCAL fraction: the first demo clip logged `§SUN_ARC_STEP tNorm=0.000
elevation=55.0 … tNorm=1.000 elevation=6.0` inside 206 frames at film 0.66–0.73 — the same bug class
§CPE_CLIP_REVEAL_FILM_T already fixed for the Reveal beside it. Now `_sunArcStep(_tnFilm)`. The FINAL clip
logs `tNorm=0.660 → 22.7°`, `0.695 → 20.9°`, `0.730 → 19.2°`; the hand formula `55 + (6−55)·t` gives
22.66 / 20.9 / 19.23, and the real full unclipped bake (`~/Downloads/Hospital_1080p24_2026-09-05.log`,
4,699 frames) logs 22.6–22.7 / 20.9–21.0 / 19.2 at those film positions. A full bake is unchanged. Both sides
of every control diff above share the same arc, so it cancels there.

### 4. §CLASH_LABEL_HUD_FAMILY — `viewer/clash_labels.js` (p2)
> **USER:** the label styling *"seems to be not nicely setup to be consistent as the HUD color scheme."*

| | old | new |
|---|---|---|
| A / B row colour | `rgb(255,33,26)` / `rgb(41,112,255)` (the marker colours, saturated) | the same colours **tinted 0.45 toward white**: `rgb(255,133,129)` / `rgb(137,176,255)` |
| weight | 600 | **700** (the day counter's) |
| corner radius | `fontPx·0.5` | `boxH·0.22` (the day counter's rule) |
| leader line + dot | one `rgba(255,255,255,0.85)` stroke | white core over a **`rgba(0,0,0,0.55)` halo** (line and dot) |
Red = A / blue = B is kept (load-bearing). Plate, font family and size unchanged. `A.clashLabels.style()`
exposes the values; `§CLASH_LABELS_INIT` logs them. One look at an exported frame (the allowed visual
judgment): the plate now reads as the day counter's sibling; at frame 100 of the demo the haloed leader/dot
is legible over a lit green wall where the plain white line vanished. `§WITNESS_CLASH_FILM_LABELS pass=4
fail=0 ran=12` unchanged (P5 still 205×51 at 1 m and 3.9 m). The label-pixel probe encoded the OLD
constants (`r>170&&g<120`) and read PARTIAL on a clip whose label is plainly in the bytes → now hue
dominance set under the measured worst case (red text over sky, chroma-bled: r−g pct10 43, r−b pct10 24):
FINAL clip `§CLL_PIXELS_SUMMARY panelsChecked=4 found=4 PASS`, the prior old-tint clip still `found=4 PASS`.

### 5. THE FINAL DEMO CLIP — `~/Downloads/cll/Hospital_clash_FINAL_clip0.66-0.73_2026-09-05.mp4`
`--clash --clip 0.66:0.73`, 206 frames / 13.7 s, `§CPE_APPLIED total=195.8s` (confirmed from the bake, not
assumed), commit `36feba78` on p2 (sky-wash + sun-arc + restyled labels). Start is 6.5 s before the label:
`§CLASH_LABELS frame=98 enter=[…@3.96 Ductwork Segment/Slab]`, panel at full alpha 110–140, edge-clamped
(contact behind the camera) 120–140, `release @4.70` at frame 149; `§CLASH_LABELS_SUMMARY … enters=1
releases=1 nearest=2.25m`; `§MAXQ_QUALITY unconverged=0`. Control: `Hospital_noclash_FINAL_clip0.66-0.73`.
- **Pre-label frames 0–97** (no plate in the band): sky band changed px **max 241 / mean 57**,
  corr(envelope, marker mass) **0.973**; whole clip corr 0.947, on/off 31.6×.
- The same window from the OLD code (`07b6631c`, baked in a temporary detached worktree, removed after):
  sky band **51,967** at the near pass (frame 113) vs a flat ≈8.5k after — which is the 167×51 plate itself
  (8,517 px), drawn in that band by design; the marker's own leak there is ≤ ~200 px. Coverage at the pass
  8.7 % → 1.6–1.9 % (0.9 % of it the plate). Report: `diff_skyfix_BEFORE07b6631c_clip0.66-0.73_2026-09-05.log`.
- **"`--clash` disturbs nothing else", measured against a second `--no-clash` control of the same window
  (control-vs-control = the bake-to-bake floor):** changed pixels OUTSIDE the dilated marker mask and the
  logged label plates — clash-vs-control **max 1,208 / mean 513 px per 921,600-px frame** (maxΔ 147)
  against the floor's **max 3,094 / mean 545** (`Hospital_noclash_FINAL2` vs `_FINAL`, maxΔ 170). At or
  below the floor: `--clash` changes nothing outside the markers and labels beyond what two identical
  `--no-clash` bakes already differ by. On the 0.28 window the same metric reads 45 / 10 px. Reports:
  `diff_control_vs_control_FINAL_clip0.66-0.73_2026-09-05.log`, `diff_skyfix_FINAL_clip0.66-0.73_2026-09-05.log`.
- **Open observation, NOT chased (bake lane, not this one):** the two identical `--no-clash` bakes of
  `0.66:0.73` differ by **5.0 % of the frame at frame 7** (28,858 red-dominant px; sky band 29,804 px at
  frame 1), settling to ≤0.2 % from frame ~25 — a start-of-clip instability (staging/TAA warm-up when a clip
  opens mid-film?) that a bake's `§MAXQ_QUALITY unconverged=0` does not see. Both bakes read unconverged=0.
- Superseded intermediates kept for the record: `Hospital_clash_demo_clip0.66-0.73` (old sun arc, new
  markers/labels) and its control.

## §CLASH_FILM_P3 — 2026-09-05, user watched the FULL-frame 20-35.5s clip. New backlog, WORK-TO-ZERO
> **USER, verbatim:** "Watching the landed bake, it seems OK and it may not be that those labels are
> not really out of frame. It is the pulsing pairs that are not shining thru." — this WITHDRAWS the
> P3 diagnosis below as the (or the only) explanation for the earlier "sticky" complaint; the fix is
> kept (a pair truly outside the frustum should not be labelled regardless), but it is not credited
> with solving what the user actually saw. The real complaint is the MARKERS not shining through.

Session rate-limited (Sonnet, resets 15:10 Asia/Kuala_Lumpur) mid-item — this list exists so nothing
is lost regardless of when work resumes. Status tag per item; ⛔ = blocked/not started, 🔧 = in
progress, ✅ = done this session.

1. ✅ **Labels: top-8 nearest, no distance limit** (was top-4, landed uncommitted by the rate-limited
   agent at top-4; raised to 8 directly this session, `viewer/clash_labels.js` `TOP_N`). Clutter
   between overlapping labels at count 8 is explicitly ACCEPTED by the user ("clutter acceptable...
   motion sieves them out") — the screen-space non-overlap walk still runs but is no longer expected
   to keep the frame clean. **DONE: witnessed (`§WITNESS_CLASH_FILM_LABELS pass=4 fail=0 ran=15`, red
   control detected, SABOTAGE=occlude correctly goes red) and pushed to `feat/clash-film-p2` — full
   detail in `§P2.1 AMENDED AGAIN — IMPLEMENTED AND WITNESSED 2026-09-05` below.**
   ✅ (same fix) **Out-of-frustum label release**, distinct from occlusion which still shines through
   unchanged per the standing ruling — kept even though it turned out not to be the user's actual
   complaint; it's still correct behaviour on its own. Witnessed as claims P8a-d, same section below.

2. ✅ **The pulsing MARKERS (not labels) are not shining through occlusion — CLOSED 2026-09-05, see
   §CLASH_FILM_SHINE_THROUGH below.** Root cause: `viewer/clash_film.js` `makeSide`'s shared marker
   material shipped with `depthTest: true` (ordinary z-testing) instead of `false`. Correction to
   this item's own citation: the working precedent is not `CINEMA_DISCIPLINE_REVEAL.md` (which never
   mentions depthTest/renderOrder) — it is `CINEMA_PATH_EDITOR.md` §CPE_CLASH_PIN item 2, pointing at
   `measure.js:717-720`'s clash-overlap highlight (`depthTest:false, depthWrite:false,
   renderOrder 998/999`). Fixed to the same combination, witnessed with a real occluder + SABOTAGE
   control (`§WITNESS_CLASH_FILM_MARKERS pass=4 fail=0 ran=14`, W7-W10), proven material-level (ONE
   `THREE.Material` per side governs all 271 pairs in one draw call, not sampled on one and assumed).

3. ⛔ **Markers are bounding-box shapes; user wants the EXACT mesh-overlap intersection volume**,
   "as in real Clash panel view" (i.e. render the actual CSG/BVH-intersection geometry between the
   two clashing meshes, not a synthetic severity box). This is a real geometry-generation feature,
   not a tuning knob — `clash_narrow.js` already computes the mesh-true intersection test
   (`bvhcast`/`intersectsTriangle`) for the PASS/FAIL verdict; extracting the actual overlap SOLID
   (not just a boolean) is new scope. Needs its own spec pass before implementation — do not guess
   at a CSG library choice without checking what's already vendored (three-bvh-csg? check
   `viewer/lib/`) and without measuring the cost on a real building (this could be expensive per-pair,
   at scale — the film has 271 mesh-true pairs).

4. ⛔ **Overlap value in millimetres, shown between the pair names at the label.** `clash_narrow.js`
   already computes a penetration depth (`obbDepth`/similar per the earlier PR #1676 review — check
   the exact field name) for the OBB stage; confirm it also has a MESH-true depth (not just OBB) to
   display, since the label is about the mesh-true pair. Extract, do not recompute a second way.

5. ⛔ **Discipline walkthrough during the pull-back/orbit reveal**, when the whole building is in
   view: step through each discipline's clash-pair SET one at a time, freezing on each with its
   pairs' labels up, while the HUD's stats card synchronizes to show "Clashes by discipline pair
   total" for whichever set is currently frozen. This is a new cinematic beat, comparable in shape to
   the existing `§CPE_DISCIPLINE_REVEAL` mechanism (`prompts/CINEMA_DISCIPLINE_REVEAL.md`,
   `A.cpeRevealApplyVisual`) — read that spec/code first, this is very likely meant to reuse/extend
   that machinery (per-discipline reveal beats already exist for MEP/ARC/STR lens work), not invent a
   parallel system. Needs its own spec section before code.
   **Sync priority, user ruling 2026-09-05:** "Let it run on its own life, try to synch with the pull
   out reveal unless it is tricky." The clash-matrix card (item 8) rotates on the existing
   `bigStatsAt`/`CARD_SECONDS` cadence regardless — that is its own life, ship it standalone first. A
   frame-accurate lock to the discipline-reveal beat is a NICE-TO-HAVE on top, attempted only if it
   composes cleanly with the existing reveal machinery; if it requires new coupling/state between two
   independent systems, ship the standalone rotation and leave the sync unbuilt rather than force it.

6. **Alt+C panel missing the Clash pairs checkbox / Silent-bake size select the user expects.**
   DIAGNOSED, not a new bug: this UI (`cinema_path_editor.js:929,936`, sw `v1148`) exists only on the
   still-open branches `feat/clash-film-p1`/`feat/clash-film-p2` — it has never been merged to `main`.
   If the user's usual sandbox serves `~/bim-ootb` on `main` (the standing localhost:8399 sandbox per
   memory), it correctly does not have this UI yet. Not a code fix — either point a dev server at the
   worktree/branch to test, or merge #1678/#1679 (the user's own call, they review those personally).

7. ⛔ **GATE, user's own words: "Solve the alt-s livelier indoors before baking a next."** No further
   FULL bakes (especially the expensive 1080p/24fps kind) until this is genuinely resolved — short
   verification clips for other fixes are fine. State as of this session: render-sample-count theory
   RULED OUT (already measured, `§MAXQ_FRAME_BUDGET` comment, RMS 0.24 = noise floor). Sun-arc-
   elevation theory NOT CONFIRMED at the one pose tested (noon read brighter than dusk there). One
   candidate left, never measured: **light selection spread thin across a moving camera path** vs
   Alt+S serving one fixed room with the full 200-light budget — `_nightUpdateLights`'s frustum+
   nearest-N pick, `tools.js` ~1721-1890. This is the next thing to actually measure, not guess at.

8. ⛔ **HUD "slide" stat cards should also show `A.bigStatsBuild`-style building stats** (the ones
   the in-viewer "Measure" tool already extracts on double-click — `viewer/measure.js` ~1420-1460:
   whole-building volume/floor-area/height from `element_transforms`'s envelope, per-`ifc_class`
   counts including `IfcSpace`/`IfcDoor`/`IfcWindow` from `elements_meta`; room-vs-corridor
   distinction already exists via `routewalker.js`'s `_rwClassifyRoom` name-pattern matcher, real
   extracted classification, not invented) **plus a "clash matrix" map**, and made more graphical
   (avatars/icons), not just plain numbers.
   **"Clash matrix", defined 2026-09-05 (user):** "more of the respective DISC set of clashes" — a
   per-discipline breakdown of clash-pair counts (e.g. MEP×STR, MEP×ARC, ...), extracted from the
   same mesh-true pair set `clash_narrow.js`/`clash_film.js` already build (271 pairs on Hospital) —
   group by each pair's two elements' `discipline` column, COUNT per discipline-pair combination. Not
   a spatial/geometric matrix — a simple discipline×discipline count grid, same extraction discipline
   as everything else on this card rotation. See item 5 for how this card's rotation relates to the
   discipline-reveal beat (runs standalone, sync attempted only if easy).

   **Total man-days / total cost — user asked for these 2026-09-05; MEASURED: they already exist in
   code and are DEAD, not missing.** `cpe_resource_panel.js`'s `A.bigStatsBuild` already has both
   cards ("labour cost committed", "person-days of labour"), gated on `A._hrCost`
   (`time_machine.js:4936`, `§HR_COST_EXPOSE`). Checked the just-completed full 1080p bake's own log:
   `§CPE_BIG_STATS cards=7 [elements coordinated | disciplines federated | MEP elements resolved |
   MEP on Level 4 | levels | day programme | peak workforce]` — no cost/person-days card, and
   `grep -c "§HR_COST total"` on that same log = **0**. Root cause found: `A._hrCost` is only ever
   set INSIDE `injectGantt()` (the slow, cold schedule-GENERATION function) — and
   `time_machine.js:3709`'s own comment says the fast, normal path is "§GANTT_CACHE_HIT where
   injectGantt() never runs at all." Hospital_silent_local's schedule is cached (it's been baked
   repeatedly all session), so every bake this session hit the cache path and `_hrCost` was NEVER
   computed — the cards are correctly dropped by design (`EVERY CARD... a card whose source is
   missing is DROPPED`), the SOURCE is just never populated on the common path. Fix is NOT "add two
   new cards" — it's "make `_hrCost` populate on a cache hit too" (either compute it from the cached
   ops directly, cheaply, without injectGantt()'s expensive geometry/render work, since it only needs
   `resource`/`installSecs` per element and `LR` rates — or cache `_hrCost` alongside the schedule
   itself so a cache hit restores it). Read `injectGantt()` (`time_machine.js:4534-4937`) fully before
   touching this — the `_hrCost` block sits at the very end of a big function; the fix should NOT
   drag the whole function onto the cache-hit path just to reach it.
   Same file/pattern as the existing cards
   (`cpe_resource_panel.js` `A.bigStatsBuild`, `EVERY CARD IS EXTRACTED, NONE ARE COMPUTED HERE`
   discipline — a card whose source is missing is DROPPED, never filled with a plausible number).
   Grounding already done this session (before the rate limit): the exact SQL patterns for volume/
   floor-area/height and per-class counts are known and reusable verbatim from `measure.js`'s
   existing double-click info-card query. Needs a small spec section (which new cards, what "clash
   matrix map" means concretely — a small discipline×discipline count grid?) before implementation.

### §HR_COST_CACHE_HIT — SPEC, 2026-09-05 (scope: ONLY the man-days/cost cards fix from item 8 above;
the "clash matrix" card in the same item is a SEPARATE, not-yet-speced feature and is NOT built here)

**Confirmed by re-reading the code before trusting the prior diagnosis (per CLAUDE.md §0a):**
- `cpe_resource_panel.js:301-306` `A.bigStatsBuild` reads `A._hrCost.total`/`.personDays`/`.trades`
  verbatim — no second computation, matches "EVERY CARD IS EXTRACTED, NONE ARE COMPUTED HERE". No
  change needed there; confirmed `A` passed into `setupCpeResourcePanel(A)` is the same app singleton
  `time_machine.js`'s `A()` (`window.APP || window.A`) writes to.
- `time_machine.js:4936` `A()._hrCost = {...}` sits at the tail of `injectGantt()`'s §HR_COST block
  (:4919-4939), fed by `_crewWorkDays` (:4884-4889, built from `elements[].resource`/`.installSecs`)
  and `LR[resource].rate_per_day`/`.crew_size` (rates.js). `_crewWorkDays` needs NO `projectDays` —
  that variable is used only by the separate §CREW_DEMAND utilisation log a few lines above, not by
  the cost total itself.
- `time_machine.js:8661-8710` is the `§GANTT_CACHE_HIT` fast path: `cachedOps` (from IDB `cacheGet
  ('gantt')`) is spliced straight into `kernel_ops` and `injectGantt()` never runs, so `_hrCost` is
  never touched this call.
- **New finding, changes the prior diagnosis's "approach (a)":** the per-op `parameters` JSON cached
  under the `'gantt'` key (`time_machine.js:5082-5086`) carries `phase, cls, name, storey, resource,
  _end_ts, _genVersion, _cell` — **`installSecs` is NOT one of them**, and end_ts−start_ts is not a
  substitute (T3 §3.3's per-task rescale means the *displayed* window width is an affine/tiled
  transform of the real labour-content window when a captured native schedule exists, not the raw
  value `getInstallSecs()` produced). So "compute `_hrCost` cheaply from the cached ops" is not
  actually cheap or correct — it would require re-deriving `installSecs` via the same rule-matching
  (`getInstallSecs`/`_installSecs`, cls+rule+realQty+lengthRatio) `injectGantt()` does, i.e. dragging
  its expensive machinery back in regardless. **Approach (b) — cache `_hrCost` alongside the schedule
  itself — is the only one that is actually cheap, and is what this fix implements.**

**The fix:**
1. `time_machine.js` `_cacheKey()` (:8505-8510): version the new `'hrCost'` prefix the same way as
   `'gantt'` (`_GANTT_CACHE_VERSION`) so a schedule-algorithm bump invalidates both together — `_hrCost`
   is derived from the same generation run as the ops.
2. `injectGantt()`'s cold path, right after the `§HR_COST` block sets `A()._hrCost` (:4936-4939): no
   change inside `injectGantt()` itself (keep it a pure compute), but the caller that already does
   `cachePut('gantt', _ops)` on the cold-generate branch (`_activateAsync`, :8764) also does
   `cachePut('hrCost', A()._hrCost)` right after — persists the already-computed value, invents
   nothing.
3. `_activateAsync`'s `§GANTT_CACHE_HIT` branch (:8687-8709): before `_finishActivate`, `await
   cacheGet('hrCost')` and, if present, restore it onto `A()._hrCost` and log `§HR_COST_CACHE_HIT`; if
   absent (an old cache written before this fix shipped, or the one-time gap before the first cold
   regenerate populates it), log `§HR_COST_CACHE_MISS` and leave `A()._hrCost` unset — the two cards
   stay correctly DROPPED per the existing rule, no invented fallback.
4. `refoldSchedule()` (:9018 `cacheDel('gantt')`): add `cacheDel('hrCost')` alongside it for symmetry
   — harmless either way since the forced cold path that follows recomputes and re-caches both, but
   keeps the two cache entries' lifecycle visibly paired for the next reader.

**Witness plan (WITNESS-replaces-visual-check, no screenshots):** one cold run on Hospital_silent_local
to populate the new `hrCost` cache entry for the first time (not itself the proof — this session's
existing cache predates the fix), then one genuine `§GANTT_CACHE_HIT` run reading `§CPE_BIG_STATS
cards=` and `§HR_COST_CACHE_HIT total=`/`§HR_COST total=` lines from the log. Before: `cards=7`,
`grep -c "§HR_COST total"` = 0 (already measured, see item 8 above). After (cache-hit run): `cards=9`
and a `§HR_COST_CACHE_HIT total=<n>` line present, `A()._hrCost.total` matching the last cold run's
`§HR_COST total=<n>` value exactly (restored, not recomputed).

## §P2.1 AMENDED AGAIN — IMPLEMENTED AND WITNESSED 2026-09-05 (resuming after the rate-limit pause)
Item 1 of §CLASH_FILM_P3's backlog, closed. `viewer/clash_labels.js` + `viewer/tests/witness_clash_film_labels.js`, branch `feat/clash-film-p2` (worktree `/tmp/wt-clash-film-p2`), on top of the `TOP_N=8` edit already landed uncommitted at session-resume.

**User's words, verbatim:** *"The label is sticky still lingers in frame when that clash pair gone out
of frame. Two more appearing in the horizon should be labelled next but they could be beyond the 10m
mark. Let's not put limit to range. Just mark out up to 4 of nearest as simple rule."* (N raised 4→8
later the same session, §CLASH_FILM_P3 item 1: *"clutter acceptable... motion sieves them out"*.)

**Old rule (§P2.1 AMENDED):** `ENTER_M=10.0 / RELEASE_M=10.6` — a pair was eligible only inside a fixed
10 m radius (hysteresis gap 0.6 m). A contact behind the camera was clamped to the frame edge with no
leader line and kept its panel (`clash_labels.js`, old §P2.4 rule) — the actual sticky-lingering bug.

**New rule — rank, not distance (`viewer/clash_labels.js:79,203-217`):**
```
var TOP_N = 8;               // clash_labels.js:79 — always the N nearest, no metres cutoff at all
var RANK_MARGIN_M = 0.6;     // hysteresis, now measured against the MOVING top-N boundary
```
Every frame, ALL pairs are sorted by distance to camera; `cutoffD` = the Nth-smallest distance
(`clash_labels.js:203`). A pair enters when `d <= cutoffD`, releases only once `d > cutoffD + RANK_MARGIN_M`
(same hysteresis SHAPE as before, now anchored to a boundary that moves with the scene instead of a
fixed number). The exact `{pairIndex, distance}` selection is exposed as `rec.eligiblePairs`
(`clash_labels.js:217`) so a test can assert it against ground truth without reverse-engineering it.

**The frustum fix (`clash_labels.js:224-232`):** the old code detected `behind` (view-space z>0) and
mirror-flipped the coordinate to pin the panel to the frame edge with no leader. That branch is DELETED.
The new test is `behind || Math.abs(nx) > 1 || Math.abs(ny) > 1` (NDC beyond the horizontal/vertical FOV,
not just behind) — either condition now increments `rec.skippedFrustum` and the pair carries NO panel
that frame at all (`clash_labels.js:232`). This is unrelated to occlusion: a wall/door in front of the
camera along the line of sight still projects INSIDE the frustum and keeps shining through, unchanged
(§CLASH_IN_FILM_RULE's standing ruling; witness P2 still asserts a hidden pair IS labelled).

**Witness — 8 old claims kept, P1/P4 rewritten off the retired constants, P8 added (4 new claims) for
the frustum fix.** `LOG=... node viewer/tests/witness_clash_film_labels.js`, Hospital_silent_local, GPU=real:

*Before (mid-flight, retired fields):* `clashLabels.stats() enter=undefined release=undefined` — INCONCLUSIVE, refused to score.

*After:* `§WITNESS_CLASH_FILM_LABELS pass=4 fail=0 ran=15`, red control detected —
- **P1a/P1b — rank matches ground truth, no distance limit.** Near pose (1.7 m offset): `want=[168,252,256,257,263,264,265,266] got=[same]`. **Far pose (~50.6 m offset): `want=[59,60,61,62,65,138,212,214] got=[same]`, farthestWantD=14.946 m** — a pair 14.9 m away, invisible under the retired 10.6 m gate, is selected by the module exactly as ground truth (computed independently in the browser) says it should be. **P1c:** eligible count never exceeds `TOP_N=8` at either pose.
- **P4 — no strobe, two clean transitions.** Sweep 50.6→0.3→50.6 m, 0.05 m steps: `flips=2 enterAt=15.15m releaseAt=15.2m`. **Measured finding, not a bug:** the release−enter gap (0.05 m) does NOT equal `RANK_MARGIN_M` (0.6 m) the way the old fixed pair did — the crossing sits inside a dense region of Hospital_silent where the top-N boundary itself moves almost 1:1 with camera position along the sweep, so the claim asserts what actually matters (exactly one clean enter, one clean release, release never closer than enter), not a specific gap magnitude.
- **P5 constant size:** `205x51 px` at 1.0 m and at 5 m.
- **P2 occlusion still irrelevant, unchanged:** `raycast/BVH calls: 0`; synthetic occluder hit at 2.5 m, contact at 5 m → hidden=true, labelled=true anyway.
- **P8a-d — the frustum fix, isolated from occlusion, same camera POSITION throughout (rank/eligibility never changes, only orientation):** looking at the contact → `eligible=true labelled=true`. Looking straight past it (contact now BEHIND camera) → `eligible=true (unchanged) labelled=false skippedFrustum=7`. Looking 90° off-axis (contact still in front, outside the FOV cone) → `eligible=true labelled=false skippedFrustum=8`. Looking back → `eligible=true labelled=true` — releases and recovers, proving the frustum test is a stateless per-frame check, not a latch.
- **P3 dense-cluster accounting reconciles exactly once `skippedFrustum` is counted too:** `eligible=8 labelled=3 skippedOverlap=4 skippedFrustum=1` (3+4+1=8) — at only 5 m from a 10-neighbour cluster, one of the top-8 nearest legitimately falls outside the camera's FOV even before the overlap walk runs.
- **P6 fade seam:** unchanged, still passes.
- **P7 — the real stored Hospital path, 1500 samples, `durationSec=195.8` (matches the bake's own `§CPE_APPLIED`):** `framesWithEligible=1500/1500` (100% — there is no distance gate left to ever read zero), `framesWithLabel=952/1500`, `maxEligible=8`, `maxLabelled=5`, `overlaps=0`, `rayDelta=0`. **`farthestLabelledM=146.23m`** — on the real authored path, a panel was drawn for a pair whose contact was 146 m from the camera, 14× beyond the retired 10.6 m release distance, because it was among the 8 nearest at that moment. That is the concrete, real-path proof the range limit is genuinely gone, not just a smaller one.

**SABOTAGE=occlude control (the forbidden visibility filter, proving the witness can catch the exact
regression it exists to prevent):** `pass=3 fail=1 ran=15`, exit 1. P2a/P2b correctly go RED
(`raycast calls: 1`, hidden pair `labelled=false`), and the collateral failures cascade correctly
(P4/P5/P8a/P8d/P3/P7 all depend on the isolated pair actually being visible). **P8b/P8c stay GREEN
under this sabotage** — proof the frustum-release claims are independent of the occlusion filter: they
test orientation, not visibility, so a regression in one does not silently mask the other.

**Verification bake — `~/Downloads/cll/Hospital_clash_TOP8_clip0.27-0.33_2026-09-05.mp4`** (`--clash
--clip 0.27:0.33 --gpu real --width 1280 --height 720 --fps 24`, waited out the concurrent full
1080p/24fps bake first — GPU never shared): 282 frames / 6,464,125 bytes, `§CLI_BAKE_WALL totalSec=339
aborted=no fileOk=true`, `§MAXQ_QUALITY unconverged=0`. Log:
`~/Downloads/cll/Hospital_clash_TOP8_clip0.27-0.33_2026-09-05.log`.

`§CLASH_LABELS_SUMMARY frames=282/282 eligibleFrames=282 labelFrames=160 maxEligible=8 maxLabelled=5
enters=21 releases=13 skippedOverlap=48 skippedFrustum=1846 panelsDrawn=362 nearest=2.25m topN=8` —
**eligibleFrames=282/282 (100%)** confirms there is genuinely no distance gate left to ever read zero.
Frame 0 alone shows 8 pairs entering simultaneously at `9.92m`–`11.71m` — already past the old 10.0 m
enter threshold on the very first frame. As the camera moves, real enter/release events fire well past
the retired 10.6 m release distance: `enter=[…@14.87]`, `enter=[…@15.39]`, `enter=[…@15.55]`,
`enter=[…@15.87]`, `release=[…@16.21,…@16.26]`, `release=[…@16.43]`, `release=[…@16.28]` — pairs
14.9–16.4 m away, all invisible under the old rule, correctly entering and releasing under the new one.
Up to **5 panels stacked simultaneously** (frame 81: `labelled=5 panels=[85@1011,282… 90@779,244…
84@1026,217… 93@151,239… 87@424,263…]`), matching the witness's own P7 `maxLabelled=5` on the same
building. **`skippedFrustum=1846` over 282 frames (~6.5/frame average, individual frames range 2–8)**
is the frustum fix firing constantly in real footage — most of the top-8 ranked-nearest pairs are
usually somewhere outside the camera's current view cone at any instant (they are scattered around the
whole building while the camera looks one way), and are correctly dropped rather than clamped to the
frame edge every single time this happens, not just in the synthetic witness poses.

**Push:** fixup commit on `feat/clash-film-p2` (existing PR #1679), not a new branch.

**⛔ Not this task, flagged for the record:** §CLASH_FILM_P3's item 2 (pulsing MARKERS in `clash_film.js`
not shining through occlusion — a different file, out of this section's scope fence §P2.6) is the
defect the user later said actually matched their "sticky" complaint, once they re-watched a bake with
this label fix already in it. This section's fix is correct and kept on its own merits (a genuinely
out-of-frame contact should never hold a panel, independent of what else was wrong) but is not credited
with solving that complaint — see §CLASH_FILM_P3 above for the still-open marker item.

### Instrument caveats, stated so the next session does not re-derive them
- Whole-frame mean |Δ| stops reading the pulse once the markers are small (codec noise dominates); the
  marker |Δ| MASS over changed pixels and its peak/dark ratio are the readings that carry.
- This outdoor window has bake-to-bake nondeterminism the 0.28 window does not (≈0.4–0.7 % of pixels,
  red≈blue, in envelope-0 frames where a marker cannot contribute); it is the reason the second control
  exists. Frame 90 of the demo reads 0.0 %, so it is not a constant offset.
- The label plate lives in the top-180-row band by design; read a labelled clip's sky number on the frames
  before `enter=` or mask the logged rectangles (the script takes the bake log as its 9th argument).

## §NIGHT_BUILDUP_GATE — 2026-09-05 — SPEC + WITNESSED: the room's real illumination now obeys the buildup schedule
Branch `feat/clash-film-p3` (worktree `/tmp/wt-clash-p3`), stacked on `feat/clash-film-p2`. This item
is the candidate flagged, never measured, in §CLASH_FILM_P3 item 7 ("light selection spread thin
across a moving camera path... `_nightUpdateLights`'s frustum+nearest-N pick, `tools.js` ~1721-1890")
— but the actual gap found on reading the function was more fundamental than a spread/thinness tuning
question: the buildup schedule was not consulted AT ALL for the real `THREE.PointLight` objects.

**Confirmed gap (code read this session):** `viewer/tools.js` `A._nightUpdateLights` (~L1722) builds
its candidate fixture list from `A._nightFixtureWorldPositions()` — the whole, FINISHED building —
with no filter for whether Time Machine has actually placed each fixture yet. The decorative glow
sprite consuming the exact same list (`effects.js` `§GLOW_BUILDUP_GATE`, 2026-08-07) already applies
this filter; the real light was never given the same treatment, so a buildup bake could light a room
from a fixture that had not been constructed yet.

**Spec:** apply the identical filter §GLOW_BUILDUP_GATE already uses —
`p.__guid == null || A._tmIsVisible(p.__guid)` — to a NEW `visPos` list, derived from the existing
`allPos` right where it is first read, and route every one of `_nightUpdateLights`'s THREE
PointLight-selection branches (still-boost frustum+§BAKE_INTERIOR_TOPUP, small-building "light them
all", and the mixed nearest-N pick) off `visPos` instead of `allPos`. `allPos` itself stays
UNFILTERED and keeps sizing the frozen `§NIGHT_BAKE_POOL` — that pool must have enough slots for
fixtures placed LATER in the buildup, not just those already placed when it's first created.

**Implementation — `viewer/tools.js`:**
- `A._nightUpdateLights` ~L1733: `var visPos = allPos.filter(function(p) { return p.__guid == null || A._tmIsVisible(p.__guid); });` (verbatim reuse of the glow gate's own predicate).
- Still-boost branch (~L1768, L1786): `inView` and the `§BAKE_INTERIOR_TOPUP` top-up call both read `visPos`, not `allPos`.
- Small-building branch (~L1794): condition and body both read `visPos`.
- Mixed-selection branch (~L1810): `_nightPickNearest(visPos, A._nightMaxLights, [])`.
- `§NIGHT_BAKE_POOL` sizing (~L1838): deliberately UNCHANGED, still `Math.min(200, Math.max(1, allPos.length))`.
- New witness log, deduped on change (~L1856): `§NIGHT_BUILDUP_GATE total=<allPos.length> placed=<visPos.length> lit=<needed.length> invariantOK=<bool>`.

**Witness — `tests/witness_night_buildup_gate.js`, real DB `TerminalHi4D.db` (818 real IfcLightFixture
rows, real `element_transforms` positions, real `kernel_ops` ELEMENT_PLACE timestamps — no invented
coordinates or cursors). Extraction discipline identical to `tests/witness_glow_buildup_gate.js`
(exact-substring extraction of the shipped source, run via `new Function()`, extraction fails loudly
if the source shape drifts). `node tests/witness_night_buildup_gate.js` → `pass=12 fail=0`:**
- **G0/G1** — structural: all three selection branches read `visPos`; `§NIGHT_BAKE_POOL` sizing still reads unfiltered `allPos`; the witness log line exists.
- **V1-V4** — the buildup gate matches Time Machine's own placed/frontier/recent set exactly at mid-buildup (422/818, strictly partial), is exactly 0 before the first fixture's own install time (**the defect this closes** — previously ALL 818 would have lit from frame 0), is exactly 818/818 once the buildup finishes, and is unaffected (818/818) with Time Machine off (plain Night Mode).
- **V5** — cross-check requested by the user ("they should track together now"): the PointLight gate and the glow-sprite gate produce IDENTICAL eligible guid sets at every cursor (start/mid/end/off) — same predicate, same list, genuinely tracking together, not just both correct independently.
- **V6a/V6b** — the requested invariant, at real buildup samples (ranks 5/10/20/30/50/400/818 of 818): `lit <= placed <= total` holds at every sample; `lit` sequence `[5,10,20,30,30,30,30]` against nav cap 30 — grows strictly while under budget, plateaus at the cap once placed exceeds it, never lights a fixture ahead of its own construction, never exceeds the light budget.
- **V7/V8 — the ALT+S/BAKE BRANCH SPECIFICALLY** (coordinator directive: `_nightUpdateLights` is shared between plain Alt+S/still-refine and a MaxQ buildup bake, and V1-V6 above exercise the NAVIGATION branch, not the one Alt+S/bake actually takes). The still-boost branch (frustum-cull + `§BAKE_INTERIOR_TOPUP`) is extracted VERBATIM and driven under both extremes with a stubbed (pre-existing, unrelated to this fix) `THREE.Frustum`: **empty frustum** (forces the top-up path) → every one of the 30 picked fixtures comes from the buildup-gated 422-eligible pool, never an unplaced one; **full frustum** (everything in view, sliced to 200) → same guarantee, 200/200 picked all from the eligible pool. Proves the fix holds on the actual Alt+S/bake code path, not only the path navigation takes.

**Cost:** all 12 checks are pure extraction+real-DB-query, no browser/GPU — `~1s` wall time. No
change of environment or expensive bake was needed to verify this fix.

## §NIGHT_PL_INTENSITY_HEURISTIC — 2026-09-05 — SPEC + WITNESSED: PL intensity by fixture type, a stated STYLE CONVENTION, never claimed as real photometric data
Same branch/worktree as above. Every fixture-derived `PointLight` previously got the exact same flat
`NIGHT_LIGHT_INTENSITY` (2.0) regardless of type — a floodlight and a small wall sconce shone
identically.

**Investigation (Prime Directive: extract, never invent) — CONCLUSION: no real wattage/lumen data
exists anywhere in this pipeline, for any shipped building.**
- `elements_meta`'s real shipped schema (checked on TWO buildings, `TerminalHi4D.db` and
  `Hospital_extracted.db`): `(guid, ifc_class, element_name, storey, discipline, material_name,
  material_rgba, building)` — no property-set column of any kind.
- `DAGCompiler/python/extractIFCtoDB.py`'s own `IsDefinedBy` walk (~L2246) only ever reads
  `IfcRelDefinesByType` (a type NAME string, e.g. "M_Pendant Light - Hemisphere") — `IfcRelDefinesByProperties`
  (the relation a `Pset_LightFixtureTypeCommon`/`*General` wattage or luminous-flux value would come
  through) is never read anywhere in the file.
- Conclusion stated plainly, per the correct handling of "no real data": stop, report it, do not
  approximate a wattage number from nothing.

**User directive, 2026-09-05, unblocking this with a stated heuristic instead of leaving it flat:**
build the SAME SHAPE of thing `A.nightLightColor` (`viewer/tools.js:1151`) already does for colour —
a name-pattern style convention, explicitly not claimed as extracted fact — reusing its EXACT SAME
name categories for intensity, not a new taxonomy.

**Spec — `A.nightLightIntensityMult(name)`, new function next to `A.nightLightColor`:**
- troffer/batten/t8/recessed_mprl/low-bay (today's `NIGHT_COOL` colour bucket — larger-format,
  general-illumination types) → `NIGHT_PL_INTENSITY_COOL_MULT = 1.15` (+15%).
- downlight/sconce/pendant/surface-mounted (today's `NIGHT_WARM` bucket — smaller accent/domestic
  types) → `NIGHT_PL_INTENSITY_WARM_MULT = 0.85` (−15%).
- everything else (unmatched names, exit signage) → `1` — exactly the flat baseline, unchanged.
- Deliberately does NOT reuse `nightLightColor`'s stated cw/ww override — a colour-temperature LABEL
  says nothing about a fixture's physical size/output.
- Multipliers are ±15%, deliberately SMALLER than `NIGHT_LIGHT_INTENSITY`'s own already-live 20%
  tuning step ("2.5→2.0, indoor MEP-reveal bake still reads too bright") — per-type variance cannot
  swing the room brighter/dimmer overall than the existing tuned baseline already sits at.
- Wired into BOTH intensity computations in `A._nightUpdateLights` (the frozen `§NIGHT_BAKE_POOL`
  branch and the churn-fix/nav branch), each multiplied by `(...pos.__intensityMult || 1)` — the `||
  1` fallback means a building with no matching fixture names is byte-identical to before this fix.
- **Tagged `§NIGHT_PL_INTENSITY_HEURISTIC` everywhere, explicitly disclaimed in-code as "NOT
  extracted/real photometric data" — never `_MEASURED`, never presented as extracted fact.**

**Witness — `tests/witness_night_pl_intensity_heuristic.js`, real element_name rows from TWO real
shipped buildings (Terminal 818 rows + Hospital 1272 rows, never invented sample names).
`pass=11 fail=0`:**
- **A1/A2** — the investigation itself, re-confirmed structurally (not re-derived from memory): `IfcRelDefinesByProperties` absent from the extraction script, `elements_meta` schema has no wattage/lumen/pset column on either real building.
- **B0** — the heuristic is tagged/documented as a style convention, explicitly disclaiming real data.
- **B1** — genuine variance across REAL fixture names: `min=0.85 max=1.15 distinctValues=[0.85,1,1.15]` across 2090 real rows — not a single repeated number.
- **B2/B3/B4** — real, named examples: Hospital's `"M_Pendant Light - Linear - 2 Lamp..."` → 0.85 (warm/domestic); Terminal's `"E_Light_100W_Low Bay_V1..."` → 1.15 (cool/industrial); Terminal's `"BIM_OOTB_Floodlight..."` → exactly 1 (unmatched, unchanged baseline).
- **B5** — both multipliers modest: correct sign each way, `|Δ|<0.20` (smaller than the file's own live 20% tuning step).
- **C1/C2** — wiring: both `A._nightUpdateLights` intensity computations multiply by the heuristic and the position mapper stamps it; the `|| 1` fallback preserves pre-fix behaviour exactly where nothing matches.

## §CLASH_FILM_SHINE_THROUGH — 2026-09-05 — the still-open item from §CLASH_FILM_P3 item 2, CLOSED
Same branch/worktree as above. This is `§CLASH_FILM_P3` item 2: "The pulsing MARKERS (not labels) are
not shining through occlusion" — the real, still-open defect behind the "sticky"/lingering complaint,
distinct from the already-correct label occlusion behaviour (`§CLASH_IN_FILM_RULE`, unchanged).

**Correction to the item's own text:** item 2 points at "`CINEMA_PATH_EDITOR.md`... 'depthTest:false /
renderOrder'... built for a DIFFERENT feature (discipline-reveal shine-through)" — re-reading that
file (§CPE_CLASH_PIN, "the blue/red shine-through already exists — retain it exactly, do not
reinvent") shows the actual working precedent is not a discipline-reveal mechanism at all: it is
`A._flyToClash`'s own clash-overlap highlight mesh, `viewer/measure.js:717-720` —
`depthTest: false, depthWrite: false` with `renderOrder 998/999`. That is the code compared against
below (an outside task brief separately named `CINEMA_DISCIPLINE_REVEAL.md`, which does not mention
depthTest/renderOrder anywhere — the canonical `MEP_CLASH_REVEAL_MOVIE.md` pointer above is correct
and is what was followed).

**THE DEFECT (`viewer/clash_film.js` `makeSide`, the ONE material shared by the WHOLE InstancedMesh
of clash-marker boxes):**
```js
// before
depthTest: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide
```
`depthTest: true` — ordinary z-testing, so any wall/slab already in the depth buffer in front of a
marker correctly occludes it. `§CLASH_FILM_P1` was supposed to give markers the same shine-through
`measure.js` already has; the one property that actually does that work was left at `true`.

**THE FIX:**
```js
// after
depthTest: false, depthWrite: false, toneMapped: false, side: THREE.DoubleSide
```
`renderOrder = 900` (already present, unchanged) keeps the marker drawing after ordinary opaque
geometry, so by the time it draws the wall is already in the colour buffer and additive blending
lands on top of it rather than being z-rejected — the same combination `measure.js` uses.

**Coordinator directive, addressed:** fix at the shared MATERIAL level, not per-pair. There is
exactly ONE `THREE.Material` object per side (A/B), governing the whole `InstancedMesh` in one draw
call — there is no per-pair code path that could apply the fix to some pairs and miss others. Proven
structurally below (W10), not assumed.

**Witness — extended `viewer/tests/witness_clash_film_markers.js` (not a new file — same module,
same convention the labels witness used across its own P1→P8 amendments), Hospital_silent_local,
Puppeteer + software GL (`GPU=sw`, this session's sandbox has no GPU device; the file's own default
stays `GPU=real` for a machine that has one). New claims W7-W10, reusing the label-occlusion
witness's TECHNIQUE where it actually transfers (a real occluder, a real render, no eyeballing) —
adapted for the fact a marker has no visibility SELECTION LIST the way a label does (every marker is
always drawn every frame, §3b): a synthetic opaque occluder is placed between the camera and a real
pulsing pair's contact point, and the actual rendered pixel is read back via
`A.renderer.readRenderTargetPixels` (the same numeric-pixel-proof technique
`witness_wall_side_light_floor.js` already uses), with a SABOTAGE control (force `depthTest` back to
`true`, the pre-fix state) proving the occluder genuinely sits in front rather than assuming it.

**Real building: Hospital_silent_local (63,182 elements, 271 mesh-true clash pairs, 542 markers).
`§WITNESS_CLASH_FILM_MARKERS pass=4 fail=0 ran=14`** (10 pre-existing §CLASH_FILM_P1 claims + 4 new,
all still green — no regression from the depthTest fix):**
- **W10** — structural, before trusting the pixel numbers: `single material object=true
  instancesA=271 instancesB=271 totalPairs=271` — ONE `THREE.Material` per side governs the WHOLE
  271-pair InstancedMesh in one draw call, so the fix is proven material-level for every pulsing
  pair simultaneously, not sampled on one pair and assumed for the rest.
- **W9** — the fix is live: `depthTestA=false depthTestB=false` on the shared material.
- **W8 — the SABOTAGE control**: forcing `depthTest` back to `true` (the exact pre-fix state) on
  pair 0's occluded pixel reads `sabotaged=0.53335` against `occluderAlone=0.53335` —
  **`|Δ|=0.00000`, an EXACT match, not just "close"** — proving the synthetic occluder genuinely
  sits in front of the marker (a real geometric fact this test verified, not assumed), and that
  under the old `depthTest:true` behaviour the marker contributed literally nothing to that pixel.
- **W7 — the fix itself**: the SAME occluded pixel, same camera pose, same pulse phase, with the
  shipped `depthTest:false` fix in place: `withOccluder+fix=0.97452` — clears the occluder-alone
  floor (`0.53335`) by `Δ=+0.44117`, and exceeds the sabotaged reading. For comparison,
  `noOccluder(baseline, unoccluded)=0.57291` — the marker measurably contributes MORE light to the
  frame with the occluder in place than the plain unoccluded baseline patch average, because the
  occluder's flat grey fills the sampled patch behind the marker instead of empty background; either
  way, the marker's own light is unambiguously reaching the camera through the occluder.

**Regression check:** all 10 pre-existing §CLASH_FILM_P1 claims (W1/W1b/W1c/W2/W2b/W3a/W3b/W5/W6,
W4a) still read OK, byte-identical numbers to before this session's fix (271 pairs, 542 markers,
pulse swing 0.300, clamp behaviour unchanged) — the `depthTest` flip touches only occlusion
behaviour, nothing else the pre-existing claims check.

## Step 4 verification bake — 2026-09-05, PLAN/BUILD confirmed correct, FULL RENDER blocked by this
## sandbox's own hardware (no GPU), not by any code defect — read before re-attempting
`cli_silent_bake.js --db Hospital_silent_local --clash --clip 0.1021:0.1532 --gpu real --width 1280
--height 720 --fps 24 --out <path>.mp4 --log <path>.log` — the exact, validated command for seconds
20-30 of the authored film. **Do not re-derive the clip fraction from `cinema_path.total_sec` in the
DB (278.8s) — that column is stale/unused at runtime.** The CLI's own resolved plan recomputes
pacing fresh from the authored waypoints every run and logs the number that actually matters:
`§CINEMA_PACING natural=195.8s ... running=195.8s`, `§MAXQ_START frames=4699 fps=24` (4699/24=195.79s).
20/195.8=0.1021, 30/195.8=0.1532 — CONFIRMED by the bake's own `§CPE_CLIP applied window=0.102→0.153
span=5% frames=4699→240` line (240/24fps=10.0s exactly). A first attempt in this session used the
stale 278.8s figure, was caught from this same log line before any frame render time was wasted, and
corrected — recorded here so the next session doesn't repeat it.

**What this session's run (worktree `/tmp/wt-clash-p3`, `GPU=sw` — see below) already confirmed, real
`§`-tagged log lines, not visual inspection:**
- `§CPE_CLIP applied window=0.102→0.153 span=5% frames=4699→240` — the clip window is exactly right.
- `§CLASH_FILM_BUILD discPairs=12 pairsBroad=1478 trueClash=271 markers=542 bothPlaced=271
  incomplete=0` — `--clash` builds the same 271 real mesh-true pairs / 542 markers inside an actual
  CLI bake (not just the Puppeteer witness sandbox).
- `§NIGHT_BUILDUP_GATE total=1274 placed=2 lit=2 invariantOK=true` and `§NIGHT_PL_INTENSITY_HEURISTIC
  n=2 min=1.00 max=1.00 mean=1.000 (style convention, NOT extracted wattage/lumen data)` — §STEP1 and
  §STEP2's fixes both fire correctly, live, inside a real buildup bake — the invariant holds and the
  heuristic tag is correctly disclaimed even in production log output. (n=2 at this sampled frame
  means only 2 fixtures were lit yet and both happened to share one category — real variance across
  categories was already proven separately, on real DB data, by `witness_night_pl_intensity_heuristic.js`
  §B1; a 2-sample frame is not the right population to re-check that claim against.)

**Why the FULL 240-frame render was not completed here:** this sandbox has no GPU
(`nvidia-smi` fails; `--gpu real` and `--gpu intel` both resolve to `NO_GL` — checked directly, not
assumed). Under `--gpu sw` (Chrome's own SwiftShader software rasterizer), frame 0 alone measured
`§MAXQ_FRAME i=0/240 elapsedMs=87082` — **87 seconds for one frame**, even after
`§MAXQ_FRAME_TIMEOUT` force-captured it UNCONVERGED partway through its own `MAXQ_STILL_BUDGET`
(taa=8, ao=12 — a real, already-measured, already-rejected-lower quality floor, see
`cinema_maxq.js` ~L482-503; not a knob this session should lower). At that measured rate, 240 frames
projects to roughly **5-6 hours** for a 10-second clip — compare the prior real-GPU verification bake
in this same lane (`§P2.1 AMENDED AGAIN` above): 282 frames in 339 seconds total, ~1.2s/frame, a
~70x difference attributable entirely to the missing GPU. Continuing to force this through in this
sandbox would violate this project's own "bakes are expensive, run only the specific short clip
named, nothing bigger" discipline for no evidentiary gain — every numeric claim step 4 exists to
check (clip window correctness, clash-film build correctness, steps 1-2's lighting invariants) is
already confirmed above from the SAME run's own log, before the render stage. The one thing
genuinely NOT produced here is the watchable `.mp4` deliverable itself, which requires the render to
finish — that needs a real GPU (the user's own machine, per this file's established convention) and
is a re-run of the exact validated command above, not further investigation.
`~/Downloads/cll/Hospital_clash_verify_clip20-30s_2026-09-05.log` is this session's partial log
(killed after frame 0's timing measurement); no `.mp4` was produced.

## Step 4 — CLOSED 2026-09-06: real-GPU render confirmed, all 5 stacked PRs merged to main
GPU driver came back (Secure Boot MOK enrollment resolved — see `bim-ootb` machine notes, not a code
issue). Ran the exact validated command from above twice on real hardware (RTX 4060): once on
`feat/clash-film-p3` pre-merge, once on `origin/main` post-merge — **both 240/240 frames converged,
`fileOk=true`, ~225s wall, byte-identical MD5 output** (same deterministic pipeline, same code —
confirms the merge chain introduced zero drift, not that the fix does nothing). `§CLASH_FILM_BUILD`
271 mesh-true pairs / 542 markers confirmed live; `§NIGHT_BUILDUP_GATE` fired correctly across the
buildup (2→1274 placed); `§NIGHT_PL_INTENSITY_HEURISTIC` mean=1.00 at low-population sample points
(too few concurrent fixture types at those frames to show the ±15% split — not a defect, a sampling
artefact of this specific clip).

Merged, in order, `main` ← `#1676`(mesh-narrowphase) ← `#1678`(clash pulses) ← `#1679`(clash labels)
← `#1684`(PL buildup gate + intensity heuristic + shine-through) ← `#1683`(Alt+S shadow-map release,
independent). Real defect found and fixed along the way: `eslint.globals.json` never listed
`setupClashNarrow`/`setupClashFilm`/`setupClashLabels` — CI's `no-undef` gate red-flagged all 4
chain PRs even though the functions load and run correctly (cross-file `<script>` globals, not
missing code). One JSON entry each fixed it. `sw.js` `CACHE_VERSION` collision between `#1676` and
`#1683` (both independently bumped v1142→v1143) resolved per house rule: kept both comment blocks,
final number v1149. Revert point tagged `pre-clash-pl-merge-2026-09-06` on `origin/main`'s pre-merge
SHA `04e3dee2`, pushed, in case any of this needs rolling back.

**Separately measured (not a defect in the buildup gate):** ceiling PL turning on has **no discernible
impact on the floor** in a daytime portion of the arc. `§SUN_ARC_FILL_PIN` numbers from a real bake at
this same clip: `ambient=0.386 hemi=0.617 sun=4.4` — all pinned constant for the WHOLE film per
`§BAKE_FILL_PIN`'s own design (2026-09-05 ruling: fill tracks the Alt+S baseline regardless of the sun
arc). Point-light pool contributes `poolSum` 2.0→45.5 across 2→50 lit fixtures, each ~0.9-1.0
intensity with `decay=1` — roughly 0.3 landing on the floor from one ceiling fixture ~3 m up. That is
small next to a scene already lit by sun 4.4 + hemi 0.617 + ambient 0.386. **Not scoped to this clip**
— since the fill is pinned the same way everywhere, a ceiling PL will only read as real contrast in a
genuinely dim/dusk portion of the arc (elevation near 6°, not the 47-50° sampled here). No code change
made — this is a measured interaction between two already-shipped, independently-correct fixes
(`§BAKE_FILL_PIN` and `§NIGHT_BUILDUP_GATE`), not a bug in either.

## §P2.4 — SPEC: clash label gains a 3rd row, tolerance vs measured clash (2026-09-06, user request)
**User:** *"the clash highlight pop up i did asked for a clearance and mesh overlap ie [Tolerance
mm/Clash mm] below the clash pair in the label."*

**Data already available, zero new computation:** `clash_film.js`'s build loop already iterates
`rules.clash_rules.forEach(function(r) {...})` — each rule `r` already carries `r.tolerance_m`
(`clash_rules.json`, per discipline pair, e.g. ARC vs STR = 0.025). Each resulting pair record already
carries `severityM` (the measured penetration, already used to size the marker box). Neither exists on
the pair record as a millimetre figure today — this spec just stamps `tolMm` onto the pair at build
time (inside the existing per-rule loop, no new lookup) and reads `severityM` at draw time.

**Implementation (2 files):**
- `clash_film.js`: inside the existing `rules.clash_rules.forEach` loop, attach
  `tolMm: Math.round(r.tolerance_m * 1000)` to every pair record built under that rule.
- `clash_labels.js`: `metrics()`'s `bh` grows from 2 lines to 3
  (`padY*2 + fontPx*3 + rowGap*2`); the label-selection step (`update()`) copies `tolMm`/`severityM`
  from the source pair onto its `placed` record (same pattern nameA/nameB already follow); the draw
  loop (`clashLabelsCompositeOntoCanvas`) adds a 3rd `ctx.fillText` row:
  `'[' + tolMm + 'mm / ' + Math.round(severityM*1000) + 'mm]'`, styled neutral (not red/blue — it is
  a fact about the pair, not per-side).

**Witness:** extend `witness_clash_film_markers.js` or add a small check asserting: for a synthetic
pair with a known `r.tolerance_m` and `severityM`, the composited 3rd row's computed mm values match
exactly (`tolMm === Math.round(r.tolerance_m*1000)`, clash mm === `Math.round(severityM*1000)`).

## §CLASH_HUD_CARD — SPEC: reveal-round HUD gains a clash-count card (2026-09-06, user request)
**User:** *"the HUD info be in"* — confirmed by code read that `bigStatsBuild()` (`cpe_resource_panel.js`,
the roster+card set shown during the Reveal round) carries NO clash information today — only element/
discipline/MEP/level/programme/workforce/cost cards. `A.clashFilm.stats()` already returns `pairs`
(the mesh-true count) — this is one more `out.push(...)` in the same `{big, label, sub, src}` pattern
every other card already follows: `{big: String(stats.pairs), label: 'mesh-true clashes flagged',
sub: '271 pairs, 79.0% of the bbox-only list was false' (dynamic), src: 'clash_film.js'}`. Card is
omitted (not blank) when `A.clashFilm` never built (same convention every other card already follows
— absent data means the card is dropped, never a zero/estimate).

**Not done this pass (correctly deferred, per user's own sequencing):** the mesh-shaped clash
highlight (real intersection solid, not a box) — scoped separately above, comparable effort to
§MESH_NARROWPHASE itself (~1 session). The cheap tier (sphere/capsule sized from `severityM`) is a
much smaller follow-on, not attempted here since the user asked to confirm PL first.

## §SUN_ARC_TOPOUT_SNAP — SPEC 2026-09-06: dramatic dusk angle only AFTER topout, pre-topout untouched
> **⛔ REVERTED 2026-09-06 (session 3, later) — do not read this section as live.** User: the original
> linear 55°→6° crawl, including how it reads through the pullout as it reaches dusk, was already correct
> and was never to be touched; the "snap" came from a wrong starting spec relayed by another session.
> Hand-reverted against current main in bim-ootb `revert/sun-arc-topout-snap` (`_sunElevationAt(tNorm)` is
> the single linear line again, `_sunArcStep(tNorm)` one argument, `cinema_maxq.js` calls it with
> `_tnFilm` only). Kept on purpose: `TOPOUT_SNAP_EASE_U` (the post-topout ease window §PL_TOPOUT_UNPIN's
> fixtures reuse) and the `_revealU` wiring (the Reveal round and the fill pin use it). Witness
> `viewer/tests/witness_sun_arc_linear.js` L1–L4. The VERIFIED section below records what the snap did
> while it was live; it is history.
**User constraints, verbatim:** *"I do not want any regress. The good outside building shadow
corelation to Sun angle must not be touched."* / *"The internal will be livelier with PLs real play
seen."* — confirmed the request is the fixed 6° Alt+S angle applied ONLY to the finished-building
portion (post-topout), not the whole film, and confirmed the PL/floor-impact interaction (measured
separately below) is not solved by sun timing alone — this pass only does the sun-timing half.

**Root cause, from `effects.js`:** `_sunElevationAt(tNorm) = 55 + (6 − 55)·tNorm` — linear, whole
film. At `topoutU` (`plan.beats.pullout`, exposed as `_revealU` in `cinema_maxq.js`, e.g. 0.361 on
the Hospital plan used throughout this file) the arc is only at **~37°** — the entire 64%-of-film
Reveal round spends most of its time well above the dramatic 6° angle, only reaching it at the very
last frame (`tNorm=1.0`) by construction (`PHOTO_SUN_ELEVATION_END === PHOTO_SUN_ELEVATION`, same
constant Alt+S uses).

**Fix — zero regression to the pre-topout portion, by construction, not by testing alone:**
`_sunElevationAt(tNorm, topoutU)` returns the EXACT existing formula, unchanged, for every
`tNorm <= topoutU` — the pre-topout branch is untouched code, so every frame during active
construction computes byte-identical to before. Only `tNorm > topoutU` takes a new branch: ease from
the elevation-at-topout down to 6° over a short window (`TOPOUT_SNAP_EASE_U`, a fraction of the film,
tunable), then hold at exactly 6° for the remainder. `topoutU` is optional — omitted (the live Cinema
Orbit preview call in `effects.js:9466` passes none) falls back to the original whole-film formula,
so the preview path is untouched too; only the MaxQ bake (`cinema_maxq.js`) passes `_revealU`.

**What this does NOT touch, deliberately:** `A._sunArcFillPin`/`§BAKE_FILL_PIN` (ambient/hemi/PL
scale) — still pinned to the Alt+S baseline for the whole film, same as before. The shadow map still
gets `needsUpdate=true` every step regardless of which branch computed the elevation, so outdoor
shadow-to-sun-angle correlation is the SAME mechanism throughout, just fed a different number after
topout. PL "real play" (requirement 2) is a SEPARATE, unresolved lever — see the
`§SUN_ARC_FILL_PIN` measurement above (ambient=0.386/hemi=0.617/sun=4.4 pinned regardless of arc);
snapping the sun's own elevation does not by itself change that pin. This pass verifies the sun-angle
half only; the PL-contrast question is left to the verification clip's own numbers.

**Verification clip:** 1:22–1:32 (82–92s of the 195.8s film, `u=0.4189→0.4699`) — chosen by the user
as the fly-back-in beat, past `topoutU=0.361` (68.9s), squarely in the finished-building Reveal round.

## §SUN_ARC_TOPOUT_SNAP — VERIFIED 2026-09-06 on a FRESH Chrome profile (the stale-SW trap closed)
`#1685` had already been merged to `main` (`ae7b49ea`) by the time this session started — PROGRESS
said "not merged"; `gh pr view` says MERGED. Re-verified on `main` with the exact validated command
plus `--profile /tmp/silent-bake-fresh-<epoch>` (never-used dir, no prior service-worker
registration): `--clip 0.4189:0.4699` (1:22–1:32 of the 195.8 s film), 1280×720 @ 24 fps, real GPU.
`§CLI_BAKE_ENV commit=ae7b49ea sw=v1150`, `§CLI_BAKE_WALL totalSec=243 aborted=no fileOk=true`,
240/240 frames. The `§SUN_ARC_STEP` series (240 lines, read from the log, not the clip):

| tNorm | elevation | note |
|---|---|---|
| 0.419 (first frame) | **14.5°** | old whole-film formula would print 34.5° here |
| 0.441 | **6.0°** | `topoutU=0.361 + TOPOUT_SNAP_EASE_U=0.08` — the ease ends exactly where the spec says |
| 0.441 → 0.470 (last) | 6.0° held | 0 frames past 0.441 off 6.0 |

Formula check at the first frame: `elAtTopout = 55 − 49·0.361 = 37.31`, `u = (0.419−0.361)/0.08 =
0.725`, `37.31 + (6 − 37.31)·0.725 = 14.6` ✓ (the log's 14.5 is the same number at the frame's exact
tNorm). Last night's "still 34.5" reading was the stale-profile SW serving old JS, exactly as
PROGRESS suspected — not a code defect. Clip: `~/Downloads/cll/Hospital_topout_snap_verify_clip82-92s_2026-09-06.mp4` (5.5 MB).

**PL "real play" — still the separate open lever, numbers from this same bake:** `§SUN_ARC_FILL_PIN
tNorm=0.470 elevation=6.00 ambient=0.3860 hemi=0.6170 plScale=0.5000 sun=4.4000` — the fill is
pinned exactly as `§BAKE_FILL_PIN` designed it, so at 6° the sun (4.4) + hemi (0.617) still dwarf the
PL pool (`poolSum=200` over 200 fixtures ≈ 1.0 each at decay=1). `§NIGHT_BUILDUP_GATE total=1274
placed=1274 lit=30`. Whether PLs should read dominant post-topout is a design call (unpin the fill
after topout? raise plScale post-topout?) — ⛔USER, not more measurement.

## §P2.4 + §CLASH_HUD_CARD — MEASURED 2026-09-06 (bim-ootb PR #1686, `feat/clash-film-p5`, auto-merge armed)
Built exactly as specced above, one deviation stated: the tolerance is recorded per DISCIPLINE PAIR
inside the existing `rules.clash_rules.forEach` loop (`tolByPair[k]`, first rule wins — the same
first-wins `seenPair` already applies) and stamped onto the pair records AFTER `qualifyRows`, keyed on
the record's own `discA|discB` — the rows themselves are positional SQL arrays 8 files index into, so
nothing is hung off them. `§CLASH_FILM_BUILD … tolStamped=271/271`. `stats()` now also exposes
`broad` + `falseExcluded` for the card.

`viewer/tests/witness_clash_film_labels.js` — `§WITNESS_CLASH_FILM_LABELS pass=4 fail=0 ran=19`
(was 15; red control still flips claim 0), all on real Hospital_silent_local, GPU real:
- **P9a** every one of the 271 pairs carries `tolMm` equal to `viewer/clash_rules.json` read FROM
  DISK by the witness (12 rules: ARC|STR=25 MEP|STR=50 ARC|MEP=25 ARC|ELEC=25 ELEC|STR=50
  ELEC|MEP=25 ARC|FP=25 FP|STR=50 FP|MEP=50 ACMV|ARC=50 ACMV|STR=75 ACMV|MEP=50) and `clashMm > 0`. bad=0.
- **P9b** `ctx.fillText` spied on a real 2D context during `clashLabelsCompositeOntoCanvas`: the
  isolated pair's panel writes `"Pipe Segment"@y278 "Structural Steel Column"@y299 "[50mm / 344mm]"@y320`
  — the third string equals the rule/severityM truth and sits below row 2; panel h = 72 px (3-row)
  not 51 (the old 2-row), so the plate grew, not just the text.
- **H0** roster BEFORE the film is built: 5 cards, none clash — dropped, not zero.
- **H1** roster AFTER: `"271 mesh-true clashes flagged — 1,478 bbox candidates · 81.7% false at
  mesh level" src=clash_film.js §CLASH_FILM_BUILD`, big == the film's own `pairs`, sub carries
  `broad` and the pct recomputed independently (1207/1478).
- Regression: `witness_clash_film_markers.js` 14/14, `witness_reveal_roster_not_highlight.js` 72/72,
  eslint clean. `sw.js` v1151; `viewer.html` cache busters `clash_film.js?v=4 clash_labels.js?v=4
  cpe_resource_panel.js?v=3`.

**Caveat carried forward, on purpose:** the "344mm" on that label IS `severityM` — the OBB/SAT proxy
(§CLASH_FILM_P3 item 4, user's own catch). The label reads whatever the pair record carries, so it
becomes mesh-true the moment `§MESH_OVERLAP_DEPTH` below lands; nothing in the label changes then.

## §MESH_OVERLAP_DEPTH — SPEC 2026-09-06 (written before code): the mesh-true overlap, replacing the OBB proxy on the label
**Origin:** §CLASH_FILM_P3 item 4 + the user's own catch (PROGRESS 2026-09-06): `severityM` is 100 % the
pre-mesh-stage OBB/SAT depth, untouched by triangle geometry even on a verified mesh-true CLASH. User
ruling: *depth first, park the full CSG solid.*

**Definition (stated, so nobody re-derives it):** the overlap SOLID `A∩B`, bounded EXACTLY. For
triangle meshes every extreme point of `A∩B` along any axis is one of three kinds — an intersection-
segment endpoint (the curve where the two surfaces cross, which `enumerateContact` already enumerates
and then discards), a vertex of A strictly inside B, or a vertex of B strictly inside A. A planar face
piece or a straight edge piece has no interior extreme; its extremes sit on its boundary, and that
boundary is made of exactly those three kinds of point. So the AABB of that point set, taken in A's
local frame and again in B's local frame, is the exact bounding box of the overlap solid in each frame.
- `depthMeshM` = the THINNEST of the six extents. Poke-in → the penetration. Pass-through → the full
  cross dimension of the thinner element. Contained → the inner element's thinnest side.
- `overlapMaxM` = the longest extent (a pass-through's through-length). `overlapA`/`overlapB` = the
  three extents per frame. `overlapCenter` = the A-frame box centre, world coords (for a later marker).
- `overlapExact` = false when `TRI_PAIR_CAP` truncated the curve or `VERT_CAP` (4096 candidates per
  side) truncated the inside-vertex pass — the number is still reported, flagged, never guessed.
- **It is NOT the MTV.** `severityM` (SAT) answers "how far must one move to separate" — for a nested
  interval that is `hA+hB−|d|` (S2's Ø0.2 m pipe centred in a 0.6 m beam: 0.4). The overlap solid there
  is 0.2 thick. Both stay on the record; the LABEL reads `depthMeshM` (falls back to `severityM` only
  when the mesh figure is absent, and says which). The marker's size is NOT changed in this pass.

**Cost:** two extra matrix transforms per intersection segment (already inside the one `bvhcast`),
one box-prefilter loop over each geometry's vertices, and 3 BVH rays per surviving candidate (the
same parity rule `containedIn` uses). Measured per run as `depthMs` in `§CLASH_DEPTH_PROXY`.

**Witness claims (each can say NO):**
- `selfTest` D1 poke-in (unit cubes at 0.97): `depthMesh=0.030 max=1.000 exact`, SAT agrees.
- D2 pass-through (S2's pipe/beam): `depthMesh=0.200 max=0.400`, while `sat=0.400` — **the proxy
  overstates a pass-through 2×; this is the number the label used to print.** `vertsA=vertsB=0`.
- D3 contained (S4): `depthMesh=0.200 max=0.200 exact` from the inner element alone.
- D4 rotated (S5, 45° cube corner): `depthMesh=0.2929` (equals SAT — convex, expected), `max=2.0`,
  inside-vertex pass finds A's corner edge (`vertsA ≥ 2`).
- I5's bar rises 10 → 14 synthetic cases. New I6 on real Hospital pairs: every MESH-stage CLASH
  carries a finite `depthMeshM ≥ 0` with `overlapMaxM ≥ depthMeshM`; `§CLASH_DEPTH_PROXY` reports
  the SAT/mesh ratio distribution (median, max, count ≥1.5×, count below 1) — a MEASUREMENT of how
  wrong the proxy was on this building, logged not gated.
- Labels witness P9a/P9b re-run: the third row now composites the mesh figure; the witness reads the
  same field and states its source.

### §MESH_OVERLAP_DEPTH — MEASURED 2026-09-06 (bim-ootb PR #1688 MERGED 02:27Z as `273e1c59`; #1686 merged 01:50Z)
Built as specced. Two additions the spec did not foresee, both forced by real geometry:
1. **`insideMesh` = parity AND nearest-face winding (half-eps margin).** Ray parity alone read wall
   vertices as "inside" a Terminal `IfcColumn` whose shells overlap, inflating that pair's overlap box
   to the wall's full 5.2 m length. A vertex ON the other's face (flush) is a boundary point and is
   excluded by the margin — D4's corner-edge vertices sit on B's faces and now count 0; the curve
   endpoints already carry those extremes, and the extents are unchanged (0.2929 / 2.0).
2. **`overlapFlat`** — thinnest extent < `TOUCH_EPS`. Annotation only; see the ⛔USER item below.

**Numbers, real GPU, read from the logs (`§CLASH_DEPTH_PROXY pair=TOTAL`):**

| building | mesh-true pairs | overlapFlat | inexact | SAT/mesh median | ≥1.5× | ≥3× | worst | depth cost |
|---|---|---|---|---|---|---|---|---|
| Hospital_silent_local | 6,749 | 37 | 4 | **2.78×** | 4,989 | 3,185 | 600× (`IfcWallStandardCase\|IfcSlab` sat=11,200 mm mesh=19 mm max=213 mm) | 4.5 s / 0.67 ms per pair |
| Terminal | 3,703 | 752 | 27 | 1.11× | 854 | 305 | 329× (`IfcSlab\|IfcColumn` sat=8,230 mm mesh=25 mm max=750 mm) | 2.2 s / 0.60 ms per pair |

Verdict counts are IDENTICAL to main (Terminal meshTrue 3,703; film `§CLASH_FILM_BUILD trueClash=271
… depthMesh=271/271 depthInexact=4 overlapFlat=1`). The film label's isolated pair (`Pipe Segment ×
Structural Steel Column`) reads **`[50mm / 50mm]`** — the OBB proxy said 344 mm (`P9b … src=mesh
obbWouldSay=344mm`). `witness_clash_film_labels.js` 19/19, `witness_clash_film_markers.js` 14/14.
`witness_clash_mesh_narrowphase.js`: **I6 GREEN on both buildings, RED on main's module** (the field
does not exist there); selfTest D1–D6 all PASS (D1 0.0300/1.0000; D2 0.2000/0.4000 with sat=0.4000;
D3 0.2000/0.2000 from the inner element's 24 vertices; D4 0.2929/2.0000; D5 flat, max 0.4000; D6
0.0200/0.4000). I5 bar raised 10 → 16.

**Pre-existing RED on `origin/main`, measured with this same witness against main's module (not
caused here, recorded so nobody re-derives it):** `S7b_touch_mesh_agrees` — two unit cubes face to
face, OBB stage off, come back `CLASH@MESH tri=64 touch=56` (main's own `pass=9 fail=1`; the spec's
§M.8 "pass=9 fail=0" no longer holds); I3 n=223 Terminal / 326 Hospital, all `OBB_SEPARATING_AXIS`
rejects with obbDepth ~1e-7 that the oracle's segment-length rule calls hits; I1 n=2 Terminal
`MESH_CONTAINED`. All three are the same hole: **a coplanar-edge contact yields intersection segments
as long as the edge, so "segment > 1 mm" is not "interpenetration".**

**⛔USER — `§TOUCH_BY_THICKNESS`: make `overlapFlat` the verdict?** (CLASH requires the overlap
solid ≥ 1 mm thick.) Built and measured this session, then REVERTED to annotation-only before the PR:
- It fixes S7b (16/16 synthetic), and reclassifies **752 Terminal / 37 Hospital / 1 film** pairs
  from CLASH to `MESH_TOUCH_ONLY` (Terminal meshTrue 3,703 → 2,953). The film's label would show
  `[25mm / 0mm]` on those today, which is the visible evidence.
- The witness ORACLE could not follow it. Three independent formulations were tried — (a) a surface
  probe half an eps beside the segment inside the crossing triangle's own plane, (b) the same with a
  surface-distance margin, (c) a wedge probe 1 mm inside both solids via each triangle's normal, with
  ray parity and then nearest-face winding — and each disagreed with the module on 190–240 pairs per
  building, all multi-shell IFC geometry (walls with internal layer faces at z=0.008 in a 300 mm wall;
  `IfcColumn`s of 1,614–4,170 vertices). The geometry itself says the module is right there: e.g.
  pair `0GS8EptVTDJB592og1ikvL|0U3mIabljAR9M$KywVdUNF` has **90 column vertices strictly inside the
  wall's box** and the column's z-range in the wall's frame is `[-0.142, 0.008]` inside a wall spanning
  `[-0.142, 0.158]` — a 150 mm real overlap, which the oracle called "touch" because every crossing
  sits on an internal or coincident face. Parity and nearest-face winding both break on such meshes.
- So the choice is: (1) switch the policy on and accept a red I1 until an oracle that handles multi-
  shell solids exists (generalized winding number is the known-robust test; not vendored), or (2) keep
  annotation-only (current), or (3) switch it on for the FILM only (`clash_film.js` filters
  `overlapFlat` out of its 271 — 1 pair on Hospital — leaving the narrowphase verdict alone). This is a
  policy decision on what a "clash" is; not more measurement. Logs: session scratchpad
  `cmn_T_p6e/f/g.*`, `cmn_H_p6e/f/g.*`, `labels_p6g.*`, `markers_p6g.*`.

**Next after the decision:** the marker's shape — `overlapCenter` + `overlapA` (A-frame extents) are
now on every record, so an oriented box of the real overlap solid (the "as in real Clash panel view"
tier below full CSG, §CLASH_FILM_P3 item 3) is a `clash_film.js`-only change: place the instanced box
at `overlapCenter` with A's rotation and `overlapA` as its size, instead of the severity cube. Not
started — it changes the film's look, so it waits for the user's go.

## 2026-09-06 (session 3, later) — three follow-ons from the user's relayed review, SPEC before code
User relayed a Sonnet review with recommendations on the three open items. Taken as the go for 1 and 3.
On 2 the recommendation ("ease the fill to a dimmer baseline") names no sourced value, and the pinned fill
IS the Alt+S state at 6°; the sourced lever is `plScale` (see §PL_TOPOUT_UNPIN) — built as a separate PR,
NOT auto-merged, so the user can take or leave it.

### §CLASH_FILM_FLAT_FILTER — SPEC (Option 3 of §TOUCH_BY_THICKNESS: film only)
`clash_film.js` drops pairs whose `overlapFlat === true` from the film's set AFTER the narrowphase verdict
(which stays as it is, the ⛔USER item above is untouched). `stats()` gains `meshTrue` (the verdict count)
and `flat` (dropped); `pairs = meshTrue − flat`. `§CLASH_FILM_BUILD … flatExcluded=N`. The HUD card's
"% false at mesh level" keeps using `broad − meshTrue` (a flat touch is not a bbox false positive); the sub
appends "· N flat touch dropped" when N > 0. Witness: labels P9c — no film pair is flat and
`stats.flat === stats.meshTrue − stats.pairs`; H1 recomputed on `meshTrue`. Hospital: 271 → 270.

### §CLASH_MARKER_OVERLAP_BOX — SPEC (§CLASH_FILM_P3 item 3, the tier below CSG)
The marker becomes the ORIENTED BOX OF THE REAL OVERLAP SOLID, from the fields `#1688` put on every record:
`overlapCenter` (world), `overlapA` (extents in A's frame), and A's rotation (`clashNarrow.worldMatrix`
of A's transform — the same matrix the narrowphase used, never re-derived). The red/blue pair reading
stays: the box is split into two halves along the A-frame axis most aligned with the A→B centroid
direction; the red half sits on A's side, the blue on B's. Per-axis size = `clamp(extent, MARKER_MIN_M,
MARKER_MAX_M)` — the same 0.30/1.20 m rule the cube had, now per axis, so a 25 mm-thick overlap is drawn
0.30 m thick (visible) and a 5 m through-run is capped at 1.20 m (the user's "marker is the clash, not the
element" ruling). The per-frame screen clamp (§CLASH_FILM_SKY_WASH) scales the box UNIFORMLY by
`min(1, cap / maxExtent)` — `boxOf(i).naturalM` is the largest clamped extent, `placedM` the current one,
so W6 keeps its meaning. A record without `overlapA` (none on Hospital: `depthMesh=271/271`) falls back
to the old severity cube through the same placement, counted `legacyBox=N` in the build log.
Witness (markers): **W11** — for every pair, decompose the two instance matrices and check against the
record: both halves carry A's rotation; both have the same size = the per-axis clamped `overlapA` with the
split axis halved, times `placedM/naturalM`; their midpoint is `overlapCenter`; their separation is half
the split extent along that axis, oriented so the blue half is on B's side. Every number from the record
and `worldMatrix`, none from the module's placement code.

### §PL_TOPOUT_UNPIN — SPEC (item 2, separate PR, not auto-merged)
**Root cause restated with the log's own numbers** (`§SUN_ARC_FILL_PIN tNorm=0.470 elevation=6.00
ambient=0.3860 hemi=0.6170 plScale=0.5000 poolLit=200 poolSum=200.000 sun=4.4000`): once the sun is at
6° the fill is exactly the Alt+S state — the pin is doing what it was told. What never happens is the
fixtures reading as the dominant indoor source: `plScale` is `A._nightPLScaleStill` = 0.5, the
§STAGED_PL_CUT ("staging-only intensity cut", `effects.js` ~5211), while nav Night Mode runs the same
fixtures at **1.0** ("full tuned intensity", `effects.js` ~4498). That 1.0 is the one sourced value.
**Change:** `_bakeFillPin(tNorm, topoutU)` — `cinema_maxq.js` passes `_revealU` exactly as it does to
`_sunArcStep`. Pre-topout (or `topoutU == null`): byte-identical to today. Post-topout: `plScale` eases
from the staged value to `PL_TOPOUT_TARGET = 1.0` over `TOPOUT_SNAP_EASE_U` (the same window the sun
uses, so the fixtures come up as the sun goes down), then holds. A staged 0 (lights-off film state)
stays 0. ambient/hemi/budget/floor untouched. The log line gains `plTopout=<want>`.
Witness `witness_pl_topout_unpin.js`: on a real Hospital load with photo staging applied, call
`A._sunArcFillPin(t, 0.361)` synthetically: t=0.30 → plScale 0.5 and `poolSum` = the staged value;
t=0.40 → strictly between; t=0.45 and t=0.9 → 1.0 and `poolSum` doubled; then `A._sunArcFillPin(0.45)`
with NO topoutU → 0.5 (the preview/legacy path untouched); staged 0 → 0 at every t.

### The three follow-ons — MEASURED 2026-09-06 (session 3, later)
| item | PR | state | witness |
|---|---|---|---|
| §CLASH_FILM_FLAT_FILTER (Option 3) | bim-ootb **#1689** | **MERGED** 03:02Z | labels **P9c** `meshTrue=271 film pairs=270 flat dropped=1 flat still in film=0`; H1 card `"270 mesh-true clashes flagged — 1,478 bbox candidates · 81.7% false at mesh level · 1 flat touch dropped"`; `§WITNESS_CLASH_FILM_LABELS pass=4 fail=0 ran=20` |
| §CLASH_MARKER_OVERLAP_BOX | bim-ootb **#1689** | **MERGED** | markers **W11** `pairs judged=270 skipped(no overlap box)=0 mismatched=0` — every pair's two halves decomposed and matched against the record + `worldMatrix`; W6 clamp `placed 0.0554 m = 43.2 px (cap 43)`; W7 shine-through re-aimed at `centerOf`, `Δ=+0.44`; `§WITNESS_CLASH_FILM_MARKERS pass=4 fail=0 ran=15`. `§CLASH_FILM_BUILD trueClash=270 … flatExcluded=1 legacyBox=0`. sw v1153 |
| §PL_TOPOUT_UNPIN | bim-ootb **#1690** | **MERGED** 03:3xZ as `5daec9e0` (after the user ruled it the indoor path; synced onto the #1691 revert, both witnesses re-run green on the merged tree, sw v1155) | `witness_pl_topout_unpin.js` (real Hospital, real photo staging via `A.startStillRefine`): `pass=4 fail=0 ran=8` — t=0.30 → 0.5 · t=0.40 → 0.74375 on the sun's ease curve · t≥0.45 → 1.0 · `poolSum 200→400, poolLit 200→200` · no-topout call → 0.5 · staged 0 → 0 · ambient/hemi 0.386/0.617 on every sample. sw v1154 |

**Marker design as built (one sentence for the next reader):** oriented box of the real overlap solid
(`overlapCenter`, `overlapA`, A's rotation), per-axis clamped to the cube's old 0.30/1.20 m rule, split
red/blue along the A-frame axis most aligned with A→B, uniformly shrunk by the screen clamp. A record
without the box would fall back to the severity cube (`legacyBox`), none did.

**Finding, pre-existing, not changed:** `tools.js` reads `(A._nightPLScale || 1)` in both pool
branches (~1917/1952), so a scale of 0 lights the pool at FULL — the witness measured `poolSum=400 at
plScale=0`. The lights-off film slot (§CPE_TAIL_LIGHTS_ALL_ONLY, `_cpeRevealLightsOff`) is enforced by
effects.js's own `_glowLensRevealGate`/`_glowOn` path, so this has not shown on screen; it is still a
multiplier that cannot express 0. Whoever next touches the pool should make it `(scale == null ? 1 : scale)`.

**Instrument note:** `eslint` from a `/tmp/wt-*` worktree — the worktree has no `node_modules`, so `npx`
falls back to a cached eslint 10 that crashes on Node 18 (`util.styleText`), and `~/bim-ootb/node_modules/
.bin/eslint <worktree file>` lints it OUTSIDE the project root with no config (false `no-undef` on
`VideoEncoder`). CI's `fast-checks` is the real lint gate for a worktree PR; both PRs passed it.

**What the next bake should show (not baked here — the user's Sonnet session was already baking 82–92 s
on `273e1c59`, which predates #1689/#1690):** with #1689 the 270 markers are the overlap boxes; with
#1690 the post-topout interior gets the fixtures at 1.0. A clip of 82–92 s on `main` after #1690 is the
one that shows all of it.

### Session-3 close (2026-09-06) — sun REVERTED (#1691), indoor candidate MERGED (#1690), clash lane CLOSED
User ruling, after correcting the other session's starting spec: (1) the sun-arc snap was never wanted —
hand-reverted, `#1691` merged `6363a714`, `witness_sun_arc_linear.js` 4/4 (34.47° at u=0.419); (2) the clash-film
lane (`#1686/#1688/#1689`) is DONE and closed — any further clash work (mesh-shape refinement,
§TOUCH_BY_THICKNESS) goes to a separate session; (3) indoor liveliness is the real ask — `#1690` (fixtures
0.5 → 1.0 post-topout) pushed through as the cheapest built candidate, merged `5daec9e0`, sw v1155.
The `tools.js` `(A._nightPLScale || 1)` finding is not relevant to liveliness (only a 0 scale) — left alone.
**Next:** a fresh-profile 82–92 s clip on `main` (≥ `5daec9e0`) is the first bake that shows the linear sun,
the overlap-box markers, the 3-row label, the clash card and the post-topout fixtures together. Not baked
here — bakes are the user's call.
