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
- **Eligible = the pair's `contact` is within 4.0 m of the camera.** Not a top-N. Any number qualifies.
- **Occlusion is IRRELEVANT** — a pair behind a door, a wall or any obstruction still qualifies and
  still shines through. Do NOT raycast for visibility; the user ruled it out explicitly.
- **What limits the count is SCREEN SPACE, not a cap.** Walk the eligible set nearest-first and place
  each label only if its panel rectangle does not overlap one already placed this frame. Skipped
  pairs keep their marker; they simply carry no panel.
- **Hysteresis, or it strobes:** a pair enters at 4.0 m and is released at 4.6 m. A pair drifting on
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
- **P1 the 4 m rule holds:** every labelled pair is within 4.0 m; no pair beyond 4.6 m is labelled.
- **P2 occlusion is not consulted:** no raycast/visibility call in the selection path, and a
  synthetic pair placed behind a wall IS labelled. (The user ruled this in; a "fix" that hides it is
  a regression.)
- **P3 no overlap:** across a run of frames, no two placed panel rectangles intersect.
- **P4 no strobe:** over a camera pass that crosses the boundary, no pair changes labelled-state more
  than once per hysteresis crossing.
- **P5 constant size:** a panel's pixel dimensions are identical at 1 m and at 4 m.
- **P6 the fade seam:** a labelled pair reads `fade=1` and its marker stops pulsing; released → 0.
- **VACUOUS:** no pair ever came within 4 m during the sampled frames → INCONCLUSIVE, never PASS.
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
- Labels: within **4 m**, occluded or not, any number, limited only by screen-space non-overlap;
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

### Instrument caveats, stated so the next session does not re-derive them
- Whole-frame mean |Δ| stops reading the pulse once the markers are small (codec noise dominates); the
  marker |Δ| MASS over changed pixels and its peak/dark ratio are the readings that carry.
- This outdoor window has bake-to-bake nondeterminism the 0.28 window does not (≈0.4–0.7 % of pixels,
  red≈blue, in envelope-0 frames where a marker cannot contribute); it is the reason the second control
  exists. Frame 90 of the demo reads 0.0 %, so it is not a constant offset.
- The label plate lives in the top-180-row band by design; read a labelled clip's sky number on the frames
  before `enter=` or mask the logged rectangles (the script takes the bake log as its 9th argument).
