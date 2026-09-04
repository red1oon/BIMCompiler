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
intent (the user's word: *"pulsing slowly"*). One material colour per side, so the pulse costs a
uniform write per frame, not a buffer upload.

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
- **W4 the flag controls it.** `--no-clash` yields exactly zero markers; `--clash` yields `2 × trueClash`.
- **VACUOUS:** `trueClash === 0` prints `INCONCLUSIVE`, never PASS — a building with no clashes proves
  nothing about a clash renderer.
- Red control via `witness_kit/contract.js`.

### 6. Explicitly NOT in this phase
No near-and-facing selector, no labels, no leader lines, no camera behaviour change, no new panel.
The camera meeting a pair stays incidental — nothing here steers it.
