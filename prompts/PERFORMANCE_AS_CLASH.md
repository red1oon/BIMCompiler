<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# PERFORMANCE AS CLASH — room performance failures as clash rows, sensed through Alt+S and Alt+C

> ⏸ **PARKED 2026-09-30 (red1: "keep this park for future session").** SPEC ONLY, zero code. RESUME ORDER: (1) triage the room-injection/pathing specs (`prompts/Viewer/FindRooms/*` + ESCAPE_ROUTE_REVEAL §8/§15): walk metres not cost, `stairBaseKey` collapse; (2) M0 room-use key; (3) answer §8 questions; then build per §P/§Q/§N/§13-§18. Doctrine names: Build Map (headline) / Build Statement (cards) / Flashpoint list (canvas) — §16.

```
# ⚠ DO NOT REMOVE — SCOPE
HIGH-LEVEL LANE SPEC (2026-09-29). NO CODE YET. Every module below opens with its own spec section
+ witness claim before any implementation (Spec-First).
Scope: treat room PERFORMANCE failures (lighting, acoustics, clinical placement, surveillance
coverage) exactly like geometric clashes — same list → click → zoom/isolate → tint → resolve loop —
and make each one SENSED in the two outputs we already ship: the Alt+S still (see it) and the Alt+C
film (see + hear it).
PRIME RULE applies in full: every threshold, coefficient, and adjacency budget traces to a NAMED
published source row. No source → ⛔ BLOCKED, never a default. Read the log after every run.
Proof = § lines (PRIMAL LAW) — never "does it look/sound right".
Origin: user-supplied idea draft + a DeepSeek prior-art opinion (2026-09-29); both were checked against
the code before this file was written. §7 lists what they got wrong.
```

## §0 — One line
The same room data that drives the light law also drives how a room SOUNDS, what it can SEE, and which
use it SUITS. Any room that fails its target becomes a clash row, and the fix writes back.

**Scope is GENERAL building quality (red1, 2026-09-29): "the hospital is just an example".** The engine is
building-type-agnostic. Each standard is a **rule pack**: a sourced table keyed on room use. Examples:
- lux → prEN 12464-1
- RT → BB93 (schools), later others
- adjacency tiers → AusHFG (healthcare) as ONE pack
- glazing → FGI
- camera DORI → IEC 62676-4
A building type gets a check only when a sourced pack covers its uses. Hospital/clinical wording below is
one pack, not the lane.

## §1 — Why it fits Alt+S and Alt+C (and not something bolted on)
| Existing | What this lane adds on top |
|---|---|
| Alt+S light law: `EN_ROWS` room-use → lux (`viewer/sourced_light.js:712`, prEN 12464-1 2019 draft) | room-use is the ONE key that also selects the acoustic target and the clinical rule |
| Alt+C overlay toggles (`cinema_path_editor.js:987-1052`: clash, measure, escape-route, load-path …) | new toggles: **Echo** (RT60 beat + ping) and **Coverage** (camera cones), same icon-button idiom |
| Escape-route beat (`ESCAPE_ROUTE_REVEAL.md`) over `room_graph.js` `escapeRoute` | room-to-room `shortestPath` (already exported) → clinical travel distances |
| Rule checklist chassis `A.showRuleChecklist(config)` (`rule_checklist.js:496`), consumers structural + egress | two more consumers: acoustic audit, programme audit — no new panel |
| `sfx.js` ConvolverNode (`cinBus`, `_makeIR`, line 108-110) — synthetic IR already exists | the IR's decay is driven by the room's computed RT60 instead of a fixed cinematic value |
| red1's standing goal (2026-09-28): *"predict real-life optics … with standard expected settings"* | extends "optics" to "acoustics + use", with the same sourced-standard discipline |

## §P — POC SHAPE (red1, 2026-09-29) — GOVERNS. Where §3 says "simulate / optimise / write back", §P wins.
*"We use the same approach as for Freeze Stack and Escape Route in Alt+C: we lay out and give info panels,
rather than advanced simulation, which can be later. Idea is to POC."*

**⚠ SUPERSEDED (red1, 2026-09-29, later the same day): Alt+C = ONE HUD CARD OF STATS, NO MARKERS.** *"On film we avoid clutter so just a HUD card giving the stats will do enough wow."* A checked box adds ONE HUD card to the film. It uses the existing HUD panel component of the escape/load-path cards, and shows the group's headline stats: e.g. Access "82 % of floor within 40 m of a WC · worst 57 m · AD M §5.9(h)"; Comfort "RT 0.9 s vs ≤0.8 s · 3 rooms over · BB93". Nothing is drawn in the scene. Every "marker" below reads as "a line on the card". Spatial detail lives only in the canvas list (§Q).

**PASS-BY HIGHLIGHT (red1, 2026-09-29):** *"On rare occasion the film path passes such a marker, it is highlighted through."* The camera path is NOT changed to visit flashpoints. When the existing path happens to bring a flashpoint room into frame, that room shines through with the existing storey/discipline-reveal shine-through (the escape beat's room glow). Its HUD card line pulses in step, so the viewer links the stat to the place. The card is unchanged otherwise, and it adds no label, line or marker.
- **Trigger:** the room box is inside the view frustum AND within a stated distance of the camera. That distance is a `~`design parameter, logged, not a standard. It uses a short fade in/out, and at most one room glows at a time (the worst verdict wins).
- **Precompute:** along the known camera path, like the per-shot exposure/visible-set precompute. The bake knows its pass-by windows before it renders.
- **§ line per bake:** `§FLASH_PASSBY group= rooms_in_path= windows= total_s=`. `rooms_in_path=0` is a normal outcome and prints NONE, not a failure. "Rare" is expected.

**Alt+C = MARKERS ONLY (red1, 2026-09-29):** *"The alt-c when checked for those only give markers similar to
what is done now for other overlays."* A checked box adds in-film MARKERS in the same idiom as the existing
cpe-clash / cpe-measure overlays (label + leader + short value, composited in `_captureFrame`). There is:
- no new beat choreography
- no camera ease
- no worst-case room pick
- no audio in the film

The rich interaction (zoom, listen, POV, blind spot) lives ONLY in the canvas list (§Q).

What an Alt+C checkbox does:
1. **Toggle:** one icon-button entry beside cpe-clash / cpe-measure (`cinema_path_editor.js:987-1052`), default OFF.
2. **Markers:** one per flashpoint, drawn like the clash/measure labels. The colour is the verdict (legend
   required, ESCAPE §13.3), and the text is the one number + its source tag (cited or `~`).
3. **Same computation as §Q:** the film reads the canvas list's rows. There is no second calculation.
4. **A § line per bake:** markers drawn, rows, and INCONCLUSIVE when there are 0 rows.

**Deferred past the POC:** ghost placement optimisation, suitability heatmaps, click-to-fix DB writes,
ERP order lines, BCF/IDS export, and exact wave/ray acoustics.

| Checkbox | Marker in the film | Marker text (cited / `~`) |
|---|---|---|
| **Light** (M1) | at the room's working-plane spot | measured lux / EN_ROWS target (prEN 12464-1 2019) |
| **Echo** (M2) | at the listener spot | RT s / BB93 Tmf target |
| **Coverage** (M4) | at the camera mount | best DORI level + blind m² |
| **Relations** (M3) | at the room pair | AusHFG tier + walk m |

## §N — NUMBERS FIRST (red1, 2026-09-29) — the audit is the product; audio and canvas are aids
*"Stats reverb is even more important as experts look at numbers. Audio and canvas is only simulation and
audio-visual aiding."*

The expert reads the card, not the ping. So for Echo, the card/row must show the full working, not one number:
- **Inputs:**
  - V (m³) and how it was derived (area × height, or boundary geometry)
  - each surface: S (m²) × α per octave band 125 Hz-4 kHz, with the α source row named
  - total absorption A (m² Sabine)
- **Results:**
  - RT by **Sabine AND Eyring**, per octave band
  - Tmf (mean of the 500 Hz, 1 kHz and 2 kHz bands)
  - the target with its source clause (BB93 Table 6), and the margin
- **Method caption:**
  - statistical diffuse-field model
  - furnishings/occupants included or not (BB93 = "finished, furnished, unoccupied")
  - what inflates error: non-diffuse, coupled, or very absorbent rooms, where Sabine over-reads, hence Eyring
    alongside
- **Fix number:** additional absorption ΔA (m²) needed to reach target, expressed as m² of a stated
  EN ISO 11654 class. This is arithmetic, not a product claim.
- **Traceability:** the row exports as plain numbers (CSV/JSON) so an acoustician can re-run the sums.
  Witness: a hand-worked reference room (BB93 worked example if one exists, else a textbook Sabine example
  with a citation) reproduces to ±1 %.

The same rule applies to every module. Light shows lux + target + meter method. Coverage shows the px/m working
per DORI ring. Relations shows tier wording + metres.

The ping and the camera POV are illustrations of the number, captioned as such, and they never replace it.

## §Q — CANVAS MODE: the flashpoint list (red1, 2026-09-29) — the live twin of each Alt+C beat
*"As the canvas features such as Measure, Clash, Find individually highlight each featured task, the extra can
also likewise do so, ie list the audio/visual flashpoints. Clicking on one can zoom to it and a button appears at
the spot where a person should be to hear it, the ping is issued, and its calibrated response is played safely.
Same with visual: zoom to a spot and angle, with an indicator of blind spot or ideal CCTV POV."*

Each beat has TWO faces over ONE computation:
- **Film face:** Alt+C HUD stats card only (§P).
- **Canvas face:** a list of EVERY flashpoint, like the Clash / Measure / Find panels.

The list reuses the checklist chassis (`A.showRuleChecklist`), list keys (`makeListKeyNav`, as in `clashListNav`
`scene.js:2342`), and zoom (`A.zoomToGuid(s)`, `diff.js:187/241`). No new panel.

**Q.1 Audio flashpoint (Echo)**
1. The row shows: room, RT vs target, pass/over, and source tags.
2. Click → zoom to the room.
3. A **listen button** appears in the canvas at the listener spot. The spot is the room centroid on the floor
   + the receiver height (ISO 3382-1 uses 1.2 m seated — ⛔ verify the clause). The marker reuses an existing
   in-canvas bubble/pin idiom; confirm which one at implementation time.
4. Tap → the camera moves to that spot → **ping** through `sfx.js` `_makeIR` → ConvolverNode, with the IR decay
   set to the room's computed RT.
5. Card shows RT, target, and "what you hear = statistical RT, not this exact seat".

**SAFE PLAYBACK contract (non-negotiable, witness-asserted):**
- plays only on a user gesture
- obeys the sfx master mute (default OFF)
- the ping is a single short transient
- output passes a DynamicsCompressor/limiter with a fixed gain ceiling
- fade in/out, no loop
- tail length capped at the computed RT × a fixed factor, with a hard cap
- one ping at a time (a new tap cancels the last)

The browser cannot know the user's SPL, so the card says so. Proof = § line `§ECHO_PING rt= tail= peak= limited=`
read from the audio graph (OfflineAudioContext render of the same chain → peak/RMS numbers), never "it sounded fine".

**Q.2 Visual flashpoint (Coverage)**
1. The row shows: room or door target, covered/blind, and the best D/O/R/I level reached.
2. Click → zoom, then **the view snaps to the camera's own POV**: mount point, aim, and FOV. The FOV is 103° H;
   V comes from the 16:9 sensor (a stated assumption, §8 Q4).
3. The overlay draws the covered area tinted by DORI ring, and the **blind spot** as the room-floor area
   outside the cone.
4. **"Ideal POV" toggle:** in the POC, candidates are the room's ceiling corners, aimed at the room centroid.
   Each candidate is scored by floor area inside the Recognise ring, and the best one is shown as a ghost
   cone. This is a layout pick, not an optimiser.
5. Caption: "plan-level; walls clip by room box, not exact rays".
6. § line `§COVERAGE room= cam= covered%= blind_m2= best_corner= dori=`.

**Q.3 The same list mode applies to Light (lux spot at the working plane), Relations (click → the path draws)
and every §10 beat.** One row = one place you can go to see or hear the finding.

## §2 — Assets already in the code (measured 2026-09-29, bim-ootb origin/main)
- **Room graph:** `common/room_graph.js` exports `shortestPath(graph, from, to)` → `{path, doors, distance, polyline}`,
  plan metres. Stair edges are converted to equivalent corridor metres. `escapeRoute`, `escapeRoutes`, and
  `escapeRouteViaProtectedStair` are also exported. The graph is 2D.
- **Rooms:** `spatial_structure` holds only centre + size (a bounding box). There is NO area, net volume, LongName,
  or window-per-room link. `object_type` is mostly `COMPILED`. Real labels exist only for Duplex and SampleHouse
  (`ROOM_TYPE_TEMPLATE_CLASSIFIER.md`).
- **Click loop:** `A.zoomToGuid(s)` (`viewer/diff.js:187/241`), `A.ruleTintShowOnly`, `A.isolateRoom` (`panels.js:897`).
- **Ray/visibility:** three-mesh-bvh is loaded (`loader.js:185`). The look branch `light_zones.js:905-946` has exact
  BVH `exact()`/`raycastFirst`, but as closures that are not exported.
- **ERP write:** order-line inserts exist only in `vo_fold.js:166` (variation-order fold). The IoT
  `toOrderLineRow` only shapes rows and inserts nothing.
- **NOT FOUND:** any acoustic absorption data, any isovist or camera field-of-view code, and any clinical adjacency
  rules. `hr_bim_asset/iot.js` CAMERAS is a 6-tile mockup.

## §3 — Modules, in build order

### M0 — Room-use as the single key (prerequisite for all)
One owner function answers "what is this room used for" → `{use, source: ifc_name | classifier | user, confidence}`.
Today `EN_ROWS` regex-matches names, and `room_type_classifier.js` is not wired to it. Unify them, show the source
of each answer, and let the user confirm a use (a DB write, via the self-heal patch pattern). **This is already in
red1's approved Alt+S queue** ("room-use → EN 12464-1 lamp targets"), so the lane starts there.
Witness: `§ROOM_USE` per building — counts by source; rooms left without a use are reported, not defaulted.

### M1 — Lighting clash (Alt+S)
Measured lux on the working plane vs the `EN_ROWS` target → a clash row where a room is below its target.
The fix direction is the same lamp targets. This depends on the open Alt+S light defects (§6) being closed
first; otherwise the audit measures artefacts.

### M2 — Acoustic clash + Echo ping (Alt+C)
Sabine/Eyring RT60 from room volume + surface areas × absorption α → compared with the target RT60 for the use →
a clash row plus "needs X m² of absorber class Y". Echo ping: feed the computed RT60 into the existing `_makeIR`
→ ConvolverNode, played on click and as an Alt+C beat (default-OFF, per `VIEWER_SFX_AUDIO.md`).
- ⛔ **SOURCE NEEDED:** an α table per material/finish class (e.g. an ISO 354 / EN ISO 11654 published table)
  and a target-RT60 table per room use. Without both, M2 does not start.
- ⚠ Volume is only a bounding box today. The spec must say whether that is acceptable, or whether it needs
  boundary-derived net volume.

### M3 — Programme clash (use suitability; clinical placement is the first example pack)
Score each room for a use with three terms: `escapeRoute` distance, `shortestPath` travel to its dependent uses,
and a daylight proxy. Flag rooms whose assigned use fails the score. "Suggest" shows a heatmap over candidate
rooms. Confirming a suggestion rewrites the use (M0), which cascades to the M1 lux and M2 RT60 targets.
- ⛔ **SOURCE NEEDED:** the clinical adjacency / travel-budget rules (a named healthcare planning guideline).
  Daylight also needs the missing window→room link.

### M4 — Coverage clash (surveillance)
Candidate ceiling nodes, camera cones checked by exact BVH line-of-sight → blind-spot volumes → a ghost camera at
the best node → (+) writes an order line through the vo_fold pattern.
- ⛔ **SOURCE NEEDED:** camera field-of-view and range from a real catalog product. The
  `CCTV_Paxton10MiniBulletCamera_CORE.ifc` component is a candidate — check what it carries, and read
  `RESUME_HR_BIM_ASSET.md` first.
- Needs the look-branch exact-ray machinery exported first.

## §4 — Shared UX contract (all modules)
Colour per clash kind. Each colour is explained in words (the §14.1 rule from `ESCAPE_ROUTE_REVEAL.md`). A ghost
suggestion is always shown translucent and never written until the user confirms it. Every resolve is one DB write
with an undo, and the judge re-scores after it.

## §5 — Witness shape (every module)
A § line per run: population judged, clash count, sources cited, **INCONCLUSIVE when the population is empty**
(PRIMAL LAW 4). A resolve witness edits one room and asserts that the clash cleared and that the downstream
targets changed by the stated amount.

## §6 — Prerequisites from the Alt+S lane (read `PHOTOREAL_STILL_RENDER.md` §DEV RESUME 2026-09-30)
1. Sky-view field false-bright patches (Hospital: 23 points).
2. Under-furniture floor too bright: 0.745 vs raycast truth 0.18. `fix/lamp-shadow`; screen-space AO cannot reach it.
3. Omni lamps → cosine/IES distribution per fixture type (audit row #40).

## §7 — Corrections to the source drafts
- The draft's "two-sided shadow fixes the slab leak" is **wrong**: two-sided shadowSide on 107 materials still gave
  23 points. The cause is the sky-view field lattice.
- The draft's "infer α from room name" is invention under the PRIME RULE. It is replaced by the ⛔ source gate in M2.
- DeepSeek's "nobody does this" came from one search pass. Treble already does browser auralization (cloud-computed),
  and Solibri already does escape-route rules. The claim to test is narrower: browser-only + extracted DB +
  clash-style UX + ERP write-back. Run a `PRIOR_ART_BIM_FILM_2026-09-27.md`-style search before any public claim.

## §8 — Open questions for red1 (the only ⛔ items) — narrowed by §9
1. Hospital/office/canteen target RT has no open source (§9.2). Buy DIN 18041, or limit M2 targets to BB93 rooms?
2. Accept the pyroomacoustics α table (MIT) with Vorländer 2008 cited as its upstream (§9.1)?
3. Accept M3 as a TIER check (AusHFG wording) with no numeric distance budget, since none is published (§9.3)?
4. Vertical FOV for the Paxton camera: derive it from the 16:9 sensor aspect (a stated assumption), or wait for datasheet TDS-0038?

## §9 — Blocker research (2026-09-29, 3 Sonnet agents, web + local; URLs in their reports)

### §9.1 α (absorption) — SOURCED, one licence caveat
- `pyroomacoustics/data/materials.json` gives 7 octave bands (125 Hz-8 kHz) per described material. Repo licence
  is MIT. Its docs attribute the values to Vorländer, *Auralization* (Springer 2008) annex. Cite both, and
  spot-check against a second source.
- EN ISO 11654 αw classes A-E are published boundary numbers, usable as the "absorber class" in the fix text.
- HTM 08-01 ceiling values: Crown copyright, NOT under Click-Use → do not reuse.
- IFC carries no α (`AcousticRating` is a sound-insulation index). So α = a lookup keyed on
  `material_name` / covering type, reusing the §CPE_MATERIAL_KEY idea.

### §9.2 Target RT — SCHOOLS ONLY
- BB93 (2014), Open Government Licence v3.0, Table 6: Tmf (mean of 500 Hz-2 kHz) per room type. Covers
  classrooms, library, halls, circulation (≤1.5 s new build), meeting rooms and more.
- Hospital (HTM 08-01) gives NO per-room RT, only "Class C over ≥80 % of floor area". Crown copyright.
- DIN 18041 is paywalled. The web values for "ward ≤0.8 s" do NOT match the HTM text → not encoded.
- ⇒ M2's first honest target set = BB93 rooms. Every other use prints `§RT_TARGET UNSOURCED`, no clash.

### §9.3 Clinical adjacency — QUALITATIVE ONLY
- No source found gives numeric department-to-department travel budgets (HBN, FGI, AusHFG, DIN 13080 checked).
- AusHFG HPU "Functional Relationships" is free to read (© AHIA, not an open licence). It gives tiers:
  direct / rapid non-public / ready / easy access. Example, HPU 300 §2.5.1: ED is direct to imaging, and
  rapid non-public to OR, ICU and cath lab. ED on ground with a dedicated ambulance entry is §2.3.2 / §2.4.4.
- FGI: patient-room glazing ≥ 8 % of minimum floor area, sill ≤ 0.9 m. This is the one numeric layout rule.
  Confirm the edition and section before encoding it.
- "OR needs no windows" has NO source → removed from M3.
- Malaysia MOH *Hospital Planning Norms & Guidelines* 2023 exists, but is unread (the file is over 10 MB).
  Read it next; it is the local jurisdiction.
- ⇒ M3 is reshaped: the check is "does the room-graph path cross the forbidden kind of space" (e.g.
  "rapid non-public" = the path uses no public circulation). `shortestPath` distance is a shown measurement,
  not a pass/fail budget.

### §9.4 Camera coverage — SOURCED (strongest module on data)
- The IFC we already hold, `IFC/LOD/CCTV_Paxton10MiniBulletCamera_CORE.ifc`, gives `LensAngleOfView` 103°
  horizontal, 2.8 mm focal length, and 2560×1440.
- IEC 62676-4 DORI thresholds: Detect 25 / Observe 62.5 / Recognise 125 / Identify 250 px/m. Cite the Axis
  whitepaper; the standard itself is paid.
- ⇒ The range for each DORI level is COMPUTED from those sources: d = 2560 / (2·ppm·tan(51.5°)). No invented
  range.
- IFC `Pset_AudioVisualApplianceTypeCamera` has no FOV or range, so the `Lens*` props are vendor-custom. Read
  them by name.

### §9.5 Room volume — COMPUTE IT, the sources don't carry it
- Space data by building, from the source IFCs:
  - Hospital and Terminal: 0 IFCSPACE. Their rooms are COMPILED.
  - Clinic: 269 spaces with area and 3124 space boundaries.
  - Duplex: 21 spaces with area and 265 space boundaries.
  - HHS: 33 spaces with GrossFloorArea and 237 space boundaries.
- `Qto_SpaceBaseQuantities` appears in none of them.
- ⇒ Volume is area × storey height, or comes from the boundary geometry. Space boundaries also give the
  window→room link that M3 daylight needs.
- ⇒ **The first test buildings for M2/M3 are Clinic, HHS and Duplex, not Hospital.** Hospital results would be
  inference on compiled rooms, and must say so.

### §9.6 Does the shape hold? — YES, with three changes
The common skeleton survives every module: room-use key → sourced target → clash row → sensed in
Alt+S/Alt+C → confirmed write-back. What changed:
1. **Build order:** M0 → M1 → **M4** (best sourced) → M2 (BB93 rooms) → M3 (tiers).
2. **M3** is a relationship-tier check, not a numeric score. It is generic: any pack that states "use A needs
   direct / rapid / ready access to use B" plugs in. AusHFG is the first such pack.
3. **M2/M3 demo on Clinic, HHS and Duplex**, since those buildings have real rooms and boundaries.
Extraction must keep IfcSpace area and IfcRelSpaceBoundary. That is a pipeline step these modules depend on,
and it is not built.

## §10 — More beats, same §P shape (proposed 2026-09-29; licences UNVERIFIED until checked)
| Beat | Layout + card | Source (status) | Reuses |
|---|---|---|---|
| **Access** | a seated-eye-height walk, 1.5 m turning circles drawn at doors, door clear widths labelled | ADA 2010 Standards (US gov, likely public domain) / UK Approved Doc M (likely OGL) — ⛔ verify | egress `door_clear_width`, CPE walk |
| **Glare** | the glare source ringed in the still; card gives the index vs limit | UGR (CIE 117) / DGP (Wienold 2006) formulas — ⛔ verify text + licence | Alt+S per-pixel luminance meter |
| **Daylight** | the window→room glazing ratio drawn per room | FGI 8 %, UBBL window rule — ⛔ confirm clause in `UBBL_RULES_RECON.md` | needs the §9.5 space-boundary link |
| **Wall sound** | the shared wall between a noisy and a quiet room tinted by its `AcousticRating` | UK Approved Doc E (likely OGL) — ⛔ verify | room graph adjacency, Pset_WallCommon |
Later (not POC): BCF export of every beat's finding, IDS "can this check run" gate, and embodied carbon per room.

## §11 — Quick prior art (2026-09-29, one Sonnet pass, SNIPPETS ONLY — no page verified; not a "first" claim)
| Feature | Done well elsewhere | How theirs differs |
|---|---|---|
| F1 RT + auralization | Treble (cloud solvers, web viewer), Odeon (desktop, imports IFC), CATT/EASE | dedicated simulators; no clickable per-room target list found |
| F2 lux vs EN 12464 | DIALux evo, ElumTools (Revit) | desktop / Revit add-in |
| F3 CCTV FOV / DORI / blind spot | JVSG (IEC 62676-4 DORI, has online version), Axis Site Designer, Genetec, RV CameraPlanner, CCTVplanner | plan-based or Revit; not IFC rooms |
| F4 adjacency tiers + walk path | nothing found (Hypar does healthcare space planning, no tier check seen) | — |
| F5 browser, client-side, IFC | xeokit / That Open are viewers with no analyses; Forma / cove.tool are browser front-ends over cloud compute | — |
| Click-to-zoom issue list | Solibri, BIMcollab (UX only, no such analyses) | — |
Verdict: every single feature except F4 exists, done more deeply. No player matched more than one F. The claim that
survives is the COMBINATION: per-room, standard-cited numbers for all four, in one client-side IFC viewer, with the
same issue list and in-film markers. Before any public claim: page-verify, and directly check Pascal, BIMvision,
Speckle Automate and That Open. Positioning consequence (§N): we do not beat Odeon/Treble on acoustics; we put the
standard-cited statistical number in front of the whole team, and hand the room to them when it fails.

## §12 — Forum demand scout (2026-09-29, one Sonnet pass; Autodesk/revitforum returned 403, Reddit/OSArch/IPVM/LinkedIn gave nothing — thin sample)
| Need | Demand signal | Evidence (seen) |
|---|---|---|
| **Relations / walk distance** | STRONGEST, recurring, people hand-roll Dynamo scripts | forum.dynamobim.com: "Exit Access Travel Distance" (2026-09-02, /115179); "Finding the distance between rooms" (2026-01-05, /113576: every toilet within 40 m walk); "Measure travel distances" (2017, /17103); GitHub CuninghamDev/DynamoAdjacencyAnalysis |
| **Light (lux per room)** | steady | Dynamo forum "Lighting calculation & place lights without using dialux or relux" (2024-08-22, /103741); Autodesk "How to calculate room lux level" (~2015, snippet); DIAL built a "DIALux Bridge for Revit" (IFC round trip) |
| **Coverage (CCTV)** | niche served by plugins | RV CameraPlanner, AXIS Plugin for Revit; revitforum 2011 wish-list: Revit camera "pretty well useless as a design tool" (snippet) |
| **Echo (RT)** | quiet in forums, latent | only academic papers: ITcon 2021 BIM-based RT via Dynamo; the usual flow is exporting geometry, then applying acoustic data by hand (snippet paraphrase) |
| **One issue list for all** | NOT evidenced, do not claim | no Solibri/BIMcollab request found |
Consequences:
1. Relations is the most-asked need, and a code-limit shape exists: the toilet thread wants "every toilet ≤ 40 m walk"
   = a room-to-room distance with a cited limit. It must use the DRAWN walk metres, not `escapeRoute().distance`
   (ESCAPE §8: that is a penalty cost). Consider promoting Relations above Echo in build order, once a cited
   distance-limit pack exists.
2. The Light pain phrase "without DIALux" fits: the lux check lives inside the viewer.
3. Echo's value is latent: lead with the numbers card (§N), not a claimed market pull.

## §13 — GROUPING + the TOILET ACCESS INDEX (red1, 2026-09-29)
**Group by the question answered**, as new entries in the Inspect drawer beside Sanity/Egress (`viewer/panels.js`
~1396). Each entry = one `A.showRuleChecklist` consumer + one `viewer/rates/<x>_rules.json` with a `_cite` per row
(the `egress_rules.json` convention). Alt+C = one checkbox per entry → one HUD stats card, no scene markers (§P).
| Entry | Question | Rules file | First rows |
|---|---|---|---|
| Egress (exists) | can I get OUT? | egress_rules.json | common path, remoteness, door width |
| **Access** | can I get TO what I need? | access_rules.json | toilet walk distance, WC size, turning circle |
| **Comfort** | is the room fit for its use? | comfort_rules.json | lux, RT, glare, daylight |
| **Security** | can it be seen? | security_rules.json | camera coverage / DORI |

**Toilet Access Index** (the escape-route shape, pointed at the nearest WC instead of the nearest exit):
- **Film:** HUD card only (no drawn path). **Card:** walk m vs the cited limit
  (+ time via SFPE 1.19 m/s, shown).
- **Index:** % of occupied floor area within the limit + the worst room.
- **Canvas list:** every room over the limit.
- **Prerequisites, from the room-injection lane (triage it first):**
  - walk metres, not routing cost (ESCAPE §8)
  - the `stairBaseKey` stair collapse (ESCAPE §15)
  - "nearest of many targets" from the most remote point of a space, not the room centre
  - WC room identification (M0)

### §13.1 Standards map (one Sonnet pass 2026-09-29; "read" = page text read, else snippet)
| Rule | Source | Value | Access |
|---|---|---|---|
| WC travel, wheelchair user | UK Approved Doc M vol 2 **§5.9(h)** (read) | ≤ 40 m same floor; ≤ 40 m combined horizontal if another floor by lift | FREE |
| Toilet location | IBC 2021 §2902.3.2 (snippet; clause no. varies by edition) | ≤ 1 storey away, path ≤ 500 ft (152 m); malls 300 ft | free (ICC/UpCodes) |
| WC fixture count | IBC/IPC Table 2902.1; BS 6465-1 | per occupancy; NOT extracted | ICC free / BS paid |
| Accessible WC size | AD M §5.10; BCA Code on Accessibility 2019/2025; MS 1184:2014 + UBBL 34A | 1.5 m wide unisex (2 m if only WC) — rest NOT extracted | all FREE |
| Paths / turning | ISO 21542:2021 §6.3.3, §7.1.3-4 | values NOT extracted | paid |
| Lux, U0, UGR | EN 12464-1:2021 | e.g. office 500 lx, U0 ≥ 0.6, UGR ≤ 19 (snippet) | paid (we hold prEN 2019 draft rows) |
| Daylight | EN 17037:2018 | 300 lx over 50 % / 100 lx over 95 % of plane, > half daylight hours (snippet) — needs climate sim, NOT a layout check | paid |
| RT | DIN 18041 (paid) / BB93 (OGL) | see §9.2 | — |
| Camera | IEC 62676-4 **2014** (pin edition; 2025 has 7 levels) | 25/62.5/125/250 px/m | paid; Axis whitepapers free |
| Sign size | ISO 3864-1 h = L/Z | Z 200/100/50 by lighting (one snippet, unverified) | paid |
Measurement methods, not design rules: ISO 3382, ISO 12354. Not geometry: ISO 7730.
**Malaysia-first note:** MS 1184 is free from JKR, and UBBL 34A is the local accessibility law. Read both before
choosing AD M's 40 m as the default pack. It's a per-jurisdiction pack, the same as `rates/*_my.json` vs `*_uk.json`.

## §14 — THE COMPILED BUILD STATEMENT (red1, 2026-09-29)
*"All those standards counts, disability access in HUD cards, adds to the BIM as compiled build statement."*

The framing ties the lane to the project's core thesis (IFC → compiled building; Spatial Compilation paper). A software
compiler ends with a build report: N passed, warnings, errors, each pointing at a line. The building compiler ends
the same way.
- **Each group card = one section of the statement.** Access includes disability access (WC ≤ 40 m, accessible WC
  size, turning space) and fixture counts (WCs per occupant load, once Table 2902.1 / BS 6465-1 values are extracted).
- **Each line has five parts:** the rule, measured vs limit, a verdict (PASS / WARN / FAIL / INCONCLUSIVE / UNSOURCED),
  the cited clause, and the room count.
- **One statement per building:** the same rows in three places.
  1. The HUD cards in the Alt+C film.
  2. The canvas lists (§Q).
  3. An exportable text/CSV "build statement" (later: BCF).
- **Honesty rules, as a compiler would:**
  - A check with no rooms of that use prints INCONCLUSIVE, never PASS.
  - A use with no sourced pack prints UNSOURCED.
  - A distance built on a known-defective input (§13 prerequisites) carries a warning flag until the fix lands.
- **Header line:** building, compile date, packs loaded with their jurisdiction (e.g. UK AD M 2024 / MY MS 1184 /
  BB93 / IEC 62676-4:2014), and counts of pass/warn/fail/inconclusive.

## §15 — COMPLIANCE WEB on the Freeze-stack background (red1, 2026-09-29)
*"A spider web graphic to indicate how much it is in compliance or not during the Freeze stack, as its black ample
background can be made more useful … a simple graph with flaticon and indicators, as long as legible in an instant."*

**Goal:** read in under a second. It sits on the Freeze-stack beat's black background (LOADPATH_FREEZE_POLISH_RESUME)
and is fed by the same rows as the §14 build statement. There is no second calculation.
- **One unit on every axis:** % of judged rooms that PASS, 0-100. Raw metres/lux/seconds are never plotted; they
  stay on the HUD card.
- **Few axes, one per GROUP** (not per rule), in a fixed order so buildings compare: Egress · Access · Comfort ·
  Security · Structure. Each group's % is its rules' judged-room pass rate. The drill-down lives in the canvas list.
- **An icon at each axis tip.** Reuse the in-repo icon set first (`viewer/panels.js` `I.*`, e.g. `I.doorOpen` Egress,
  `I.shieldAlert` Sanity/Structure). Flaticon only where no in-repo icon fits, with its licence and attribution
  recorded (Flaticon's free tier requires attribution).
- **Indicators, instantly legible:**
  - a 100 % reference ring, and the filled shape inside it
  - the % printed at each vertex, large
  - a colour dot per axis: green PASS / amber WARN / red FAIL
  - grey dashed axis = INCONCLUSIVE or UNSOURCED, never drawn as 0
  - a red notch on the axis if ANY life-safety rule in the group FAILs (egress, accessible WC), whatever the %
  - hatched = built on a known-defective input (§13 prerequisites)
- **Motion:** it grows with the freeze beat's existing counter-while-drawing idiom (§129.x), then holds. No new
  animation mechanics.
- **Legibility witness (numbers, not eyes):**
  - at the bake resolution, each vertex label ≥ the HUD card's minimum text height
  - contrast vs the black background ≥ WCAG AA 4.5:1 for text and 3:1 for icons/marks
  - no two labels overlap (bbox test)
  - § line `§COMPLIANCE_WEB axes= pass%=[…] inconclusive= notches= hatched= minTextPx= minContrast= overlaps=0`
- **Deliberately not:** per-rule axes (too many to read at once), and area-as-score claims (the card's numbers are the
  score; the web is the glance).

## §16 — NAME: "BUILD MAP" (red1, 2026-09-29) — the doctrine term
*"Build Map? It is easy to catch, and elevates our doctrine: when we say it we are speaking about high-level
stuff."* On sitting beside Buildup: *"Build Up jives, as it is all in the 4D-onwards flow or feature pool of our BIM
as a Compiler."*

- **Build Map** = the Freeze-stack beat's new user-facing name. It shows the §15 compliance web plus the §14 build
  statement, with the load-path stack as its Structure section.
- **Paired with Buildup** on purpose: Buildup = the 4D build-up (how it is built); Build Map = the compiled result
  (how well it compiled). Both belong to the 4D-onwards pool of BIM-as-a-Compiler.
- **Doctrine levels (use these words consistently):**
  1. **Build Map:** headline. Five group % + life-safety notches, legible in an instant.
  2. **Build Statement:** the per-group HUD cards; rule · measured vs limit · verdict · clause · rooms.
  3. **Flashpoint list:** the canvas list, one row per room/spot (zoom, listen, POV).
- **Label only:** checkbox label + HUD title change. Internal id `cpe-load-path` and existing § tags stay, so saved
  paths and witnesses don't break. The tooltip/subtitle reads "Build Map — compliance at a glance".
- **Collision check (2026-09-29):** the only existing "buildMap" is `erp/user_names.js`, an internal function, not
  user-facing.

### §16.1 — The building's short name on the Build Map title (red1, 2026-09-29)
*"Put the building short name, as it is not really shown or highlighted in the film."* The title reads
**"Build Map · <short name>"**, e.g. "Build Map · Clinic". This gives ownership without renaming the doctrine term;
"Building Map" was weighed and declined because it reads as a floor-plan / wayfinding directory.
- **Source (existing, not invented):** `A.activeBuilding || A.currentBuilding`. That is the same expression
  `cpe_room_title.js:607` and `cpe_storey_reveal.js` already use. Today the name appears in the film only as the
  room-title FALLBACK, when no room is sighted (`cpe_room_title.js:605`), which is why red1 rarely sees it.
- **Empty name → title is plain "Build Map"** plus a § note. Never a placeholder like "bld" (the key-fallback string
  those files use for caching).
- § line: `§BUILD_MAP_TITLE name= source=activeBuilding|currentBuilding|none`.
- Open (not decided): whether the export/statement header (§14) uses the same short name or the IfcBuilding long
  name. Default = the same short name, for one identity.

## §17 — CAPACITY on the Build Map (red1, 2026-09-29)
*"Should we add 'capacity' and a human graph where each avatar indicates # of pax"* … *"it is calculated by a
standard and that standard is published."*

**Capacity = design occupant load from the PUBLISHED standard, and the card NAMES that standard.**
- **Formula:** room area ÷ the standard's occupant-load factor for that room use, summed. The card prints the
  standard, table, row and factor, e.g. "IBC 2021 Table 1004.5 · Business 13.94 m²/person".
- **Existing code:** `viewer/egress_sanity.js:325` `OCCUPANT_LOAD_FACTOR_M2 = 13.94` (IBC 2021 Table 1004.5
  "Business areas"). It is applied to EVERY room today; its own comment (~312-315) admits denser uses are
  under-counted. Per-use rows need room use (M0). Until then the card is captioned "Business factor, all rooms".
- **Per-jurisdiction pack**, like the rates files:
  - IBC 2021 Table 1004.5 (have)
  - UK Approved Document B floor-space factors (⛔ verify the table number and values)
  - Malaysia UBBL occupant-load provisions (⛔ locate the clause)
- **Seated count (secondary, EXTRACTED):** chairs/seats counted from IFC furniture. Labelled "seats counted in
  model". Omitted when the model has no seating.
- **Person-icon graph:** a header strip beside the compliance web (a size, not an axis).
  - One icon = a fixed round N, stated in the legend.
  - Filled = design load; outlined = seats counted.
  - Exact numbers printed.
  - Icons beyond what the exits can clear turn red. This uses the egress exit-width capacity (IBC §1005.3.2, already
    in `door_occupant_capacity`), so the one red cue ties Capacity to Egress.
- § line: `§CAPACITY std= factorRows= rooms= designLoad= seats= exitCapacity= overflow=`.

## §18 — POC CONTRACT: computed on the fly, every number carries a stated MARGIN OF ERROR (red1, 2026-09-29)
*"Again, this is a POC of computed-on-the-fly capability where we also state a margin of error."*

**Applies to every number in §13-§17** (HUD cards, Build Map, flashpoint list, statement export).
- **On the fly:** computed in the browser at load/bake from the extracted DB + rule packs. Nothing is precomputed
  offline, and there are no stored verdicts. Cost is logged per group: `§PERF_CLASH_TIMING group= rooms= ms=`.
- **Margin shown as a range or ±** beside the value, e.g. "RT 0.82 s (0.74-0.91)", "walk 38 m ±4 m",
  "load 210 (170-260)". The verdict is taken on the WHOLE range:
  - PASS only if the whole range passes
  - FAIL only if the whole range fails
  - otherwise **MARGINAL**, a new verdict between WARN and INCONCLUSIVE
- **The margin is DERIVED, never guessed.** Each comes from two independent estimates, or from a known input tolerance:

| Number | Margin from | Source of the bound |
|---|---|---|
| Room area / volume | bbox vs space-boundary / IfcSpace area where both exist | the two extracted values; bbox-only rooms say "upper bound" |
| RT | Sabine vs Eyring spread × α band spread (min/max α of the matched material row) | §N inputs |
| Walk distance | drawn 3D walk vs plan-projected walk; + door-to-point spread for "most remote point" | room_graph polyline |
| Occupant load | area range ÷ factor | area row above |
| Lux | metered value vs the zone-lattice value at the same point (Alt+S has both) | light_zones / meter |
| Camera range | FOV 103° (stated) vs FOV ± vendor tolerance, if the datasheet gives one; else "FOV as stated, no tolerance" | IFC `LensAngleOfView` |

- **No basis for a bound → print "± unknown"**, and the verdict cannot exceed MARGINAL. Never invent a percentage.
- **Build Map:** axis % counts PASS rooms only; MARGINAL rooms are drawn as a lighter band between the PASS shape
  and the ring, so the uncertainty is visible at a glance.
- **Statement header line:**
  `POC — computed on the fly <date>; values ± derived per row; MARGINAL = verdict depends on the error band.`
- **Witness:** every row has `lo ≤ value ≤ hi`, and `§MARGIN rows= derived= unknown= marginal=`. An empty population
  prints INCONCLUSIVE.

## §19 — AUDIO + VISUAL PANELS IN THE LOAD-PATH FREEZE (red1, 2026-10-01) — UNPARKS M2 + M4 for this one surface
*"Let's work on future features already spec'd about acoustics audio test and visual blindspot with best CCTV locations.
These can appear as special info panel during loadpath stack as the black is largely empty and can be filled when
audio/visual box is checked"* … *"it is to appear in conjunction with loadpath"*.

**Where (code read 2026-10-01, bim-ootb fix/fast-bake v1534):** the load-path FREEZE is now stack-only — the building is hidden
and the frame is black except the stack clones + the 2D info panel (`§LOADPATH_STACK_ONLY`, `cpe_load_path.js:3419`). The freeze's
2D work is composited by `A.loadPathCompositeOntoCanvas` (`cpe_load_path.js:4519`, called from `cinema_maxq.js:1637`):
stack info panel `_drawStackInfoPanel` (:4113), ladder `_drawStackLadder` (:4245), info card `_infoCardLayout/_drawInfoCard`
(:4437/:4469). The two new panels are drawn by that same composite, AFTER those three, in the free black area, avoiding their rects.
Theme = the freeze's own reversed plate (`_freezePlateDraw` :4094) and body size (`_freezeBodyPx` :4085, 22 px at 1080, the §129.58
HUD standard). No new panel component.

**Gate — in conjunction with load path, never alone:**
- Two new Alt+C toggles, default OFF, beside `cpe-load-path` in the CPE toggle row: **Audio** (M2 Echo) and **Visual** (M4 Coverage).
  CLI: `--audio-panel` / `--visual-panel` (+ `--no-…`), the `triState` idiom of `cli_silent_bake.js`.
- A checked box draws its panel ONLY on freeze frames of a load-path bake. Load path off → nothing, and the bake logs
  `§FREEZE_PERF_PANEL group=… skipped reason=load-path-off`.
- For these two groups this SUPERSEDES §P's film markers / HUD card: in the film they live only in the freeze. The canvas
  flashpoint list (§Q) is unchanged and remains the place for zoom / listen / POV.
- Relation to §15/§16: these are the first two Build Statement sections to reach the freeze (Comfort-Echo, Security). The
  compliance web (Build Map headline) stays spec'd and is not built by this item.

**Panel content (numbers first, §N; margins, §18):**
- **Visual (Security / CCTV)** — fully sourced today:
  - Camera = the catalog product we hold, `IFC/LOD/CCTV_Paxton10MiniBulletCamera_CORE.ifc`: `LensAngleOfView` = "Horizontal 103°;
    Vertical 55°; Diagonal 123°", `LensFocalLength` 2.8 mm, 2560 × 1440. **§8 Q4 is RESOLVED by extraction: V = 55° is in the
    IFC** — no 16:9 assumption.
  - DORI ranges COMPUTED (IEC 62676-4:2014 px/m via the Axis whitepaper), d = 2560 / (2·ppm·tan 51.5°):
    Detect 40.7 m · Observe 16.3 m · Recognise 8.1 m · Identify 4.1 m.
  - Per room (POC = Q.2 item 4): candidates = the room box's 4 ceiling corners aimed at the floor centroid; score = floor area inside
    the Recognise ring AND inside the H 103° / V 55° frustum, walls clipped by the room box (plan-level caption, not exact rays).
    Best corner = "best CCTV location"; blind m² = floor area outside it.
  - Panel lines: rooms judged · % floor area Recognise-covered (building, from each room's best corner) · total blind m² ·
    the 3 worst rooms (blind m², best corner) · the four DORI distances · caption "1 camera per room at its best ceiling corner;
    room-box plan check". No pass/fail: no sourced rule says which rooms MUST be covered → verdict column reads "no target"
    (never PASS).
- **Audio (Comfort / Echo)**:
  - RT per room by Sabine AND Eyring, octave bands 125 Hz-4 kHz, Tmf = mean(500, 1k, 2k); V = room box volume (§18: upper bound
    where no IfcSpace/boundary exists — Hospital and Terminal are compiled rooms, §9.5); S per surface from the room box faces;
    α per surface from the material lookup.
  - Panel lines: rooms judged · Tmf range (Sabine-Eyring) of the median and the worst room · count over target where a target is
    sourced · rooms whose use has no sourced target, counted as UNSOURCED (never a clash) · ΔA m² of EN ISO 11654 class A to reach
    target for the worst sourced room · caption "statistical diffuse-field RT, finished-unoccupied, room-box volume".
  - No audio in the film (§P). The ping stays a canvas-only gesture (§Q.1, SAFE PLAYBACK contract).
  - ⛔ Still gated by §8 Q1 (targets) and Q2 (α table). Until answered, the Audio panel is not built.

**Cost model (BUILD + DECIDE, ALTC_FOUNDATION rule):** both groups are computed ONCE per bake before frame 0 from the extracted DB
(room boxes, materials) — `§PERF_CLASH_TIMING group= rooms= ms=`; the freeze frames only draw. Nothing per frame but the panel.

**Witnesses (numbers, not eyes):**
- `§FREEZE_PERF_PANEL group=visual|audio drawn=1 rows= minTextPx= inFrame=1 overlaps=0 (vs stack panel / ladder / card rects)` on the
  first freeze frame; INCONCLUSIVE when rooms judged = 0; `skipped reason=` when gated off.
- `§COVERAGE room= cam=corner<k> covered%= blind_m2= dori=` per room (Q.2 item 6) + a hand-worked unit case: a 6 × 4 × 3 m box,
  corner camera, coverage area checked against the closed-form frustum ∩ disc ∩ rectangle to ±1 %.
- Audio: §N's reference-room witness (±1 % Sabine) before any panel line is drawn.

**Build order for this item:** Visual first (no open question) → Audio after §8 Q1/Q2.

### §19.1 — red1's answers to §8 Q1/Q2 (2026-10-01)
- **Q2 α table: ACCEPTED — pyroomacoustics `materials.json` (MIT), values attributed to Vorländer, *Auralization* (Springer 2008).**
  Cite both on the panel/statement; spot-check against a second source.
- **Q1 targets: Show RT for every room, mark non-BB93 uses UNSOURCED.** Only BB93 Table 6 room uses get a verdict; Hospital rooms
  read "target unsourced" with their RT numbers. No DIN 18041 purchase, no BB93-as-proxy.
- §8 Q4 resolved by extraction (§19). Q3 (M3 tiers) not asked — out of this item's scope.
