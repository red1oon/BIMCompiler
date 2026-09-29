<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# PERFORMANCE AS CLASH — room performance failures as clash rows, sensed through Alt+S and Alt+C

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
- **Film face:** Alt+C markers only (§P).
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
(the `egress_rules.json` convention). Alt+C = one checkbox per entry, markers only (§P).
| Entry | Question | Rules file | First rows |
|---|---|---|---|
| Egress (exists) | can I get OUT? | egress_rules.json | common path, remoteness, door width |
| **Access** | can I get TO what I need? | access_rules.json | toilet walk distance, WC size, turning circle |
| **Comfort** | is the room fit for its use? | comfort_rules.json | lux, RT, glare, daylight |
| **Security** | can it be seen? | security_rules.json | camera coverage / DORI |

**Toilet Access Index** (the escape-route shape, pointed at the nearest WC instead of the nearest exit):
- **Film marker:** worst room + its drawn walk to the nearest (accessible) WC. **Card:** walk m vs the cited limit
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
