# ⚠ DO NOT REMOVE
**Scope:** reusable OUTWARD-FACING technical descriptions of what this FOSS project is and what a
user gets from it. Written for posts, README intros, conference blurbs and demo captions.
**Every claim here must be traceable to a measured number or a named file** — no marketing adjectives
that a technical reader can test and disprove. When a number changes, update it here in the same
session. §NOT-CLAIMS at the bottom is as important as the rest: it is what keeps the whole thing
credible with the audience that actually matters.

---

# §STATEMENT_TERMINAL_FILM (2026-07-28) — compact version, written for sharing

## The one-liner
**A 49-second architectural film, rendered entirely in a web browser, straight from an IFC-derived
database — no game engine, no cloud render farm, no proprietary scene format.** The building in the
film is the same file a quantity surveyor would query.

## What is actually in the frame
| | measured |
|---|---|
| Model | 48,433 elements · 9,395 geometries · one self-contained 280 MB SQLite file |
| Draw calls | **155** for the whole building (BatchedMesh + InstancedMesh consolidation) |
| Output | H.264 1852×960, 15 fps, 731 frames, 48.7 s — baked frame-by-frame in-browser, not screen-captured |
| Hardware | one laptop GPU (RTX 4060), no server-side rendering |
| Lighting | 814 luminaires as **one** additive point cloud = 1 draw call |
| Materials | 37 live triplanar PBR materials (IFC carries **no UVs** — triplanar removes the blocker) |
| Per frame | 16-sample TAA accumulation + 24-frame ambient occlusion + real photographed HDRI |

## What you actually get from it
- **Open a real IFC-derived model in a browser and fly it.** No install, no licence, no upload to
  someone's cloud. The database is the deliverable and it is portable.
- **Cinematic output without authoring.** The camera path is *computed* from the building's own
  ARC bounding box and sun angle — the same code produces a different film for a different building
  with zero keyframing.
- **The model's meaning drives the picture.** Which facade is lit warm follows the sun; which floor
  could be reflective is read from the model's own finish names (`Procelain` yes, `nonslip` never);
  which fittings glow is resolved from IFC class and family naming. **A general 3D engine cannot do
  this — it does not know what a duct is.**
- **Additions are real BIM data, not compositing.** The billboard in this film is a physical panel
  injected as four database rows plus a geometry blob, mounted on a wall chosen by clicking it; its
  four floodlights are genuine `IfcLightFixture` elements, adopted by the building's existing
  night-lighting system with no new rendering code. It is pickable, quantifiable and casts shadows.
- **Everything is CC0 or ours.** Textures, HDRI and staffage are public-domain with a `NOTICE.txt`;
  the vehicle mesh is re-used from the project's own IFC entourage rather than a stock library.

## §NOT-CLAIMS — do not say these, a technical audience will test them
- **Not "first with real reflections/realism".** Enscape, Twinmotion and Lumion have had these for
  years. The defensible claim is **"in a browser, straight from IFC, on one laptop"**.
- **Not "photorealistic".** This is high-quality real-time archviz. It is not path-traced.
- **Not "free rendering".** The selection is free — a semantic query against the loaded SQLite runs
  in milliseconds. The pixels are still the GPU's, and every effect is budgeted and measured.

## Provenance of the numbers above
All from `§`-tagged logs and file metadata on 2026-07-28, not estimates: `§CONTRACT_CHECK` /
`§BATCHED_FLUSH` (element and draw-call counts), `ffprobe` (container), `§PHOTO_GLOW_SPRITE`
(luminaire count), `§STILL_REFINE` + `§PHOTO_AO` (accumulation), `§TRIPLANAR_INIT` (material count).
Full engineering detail: `PHOTOREAL_STILL_RENDER.md` §11–§14 and its `▶▶ NEXT SESSION` handover.

---

# §COMPETITIVE_POSITION (2026-07-29) — the claim, and the survey behind it
Asked by the user, twice: *"You agree this is a novel art been able to achieve on a mere browser tab?
Is anyone doing the same?"* and then *"we can pursue those other roadmap gaps with the big players
more easily now."* Written down so the next session does not re-derive it, and so the claim that goes
public is the one that survives being challenged.

## THE SENTENCE — use this one, verbatim
> **A model-derived cinematic path you edit by dragging the flight itself, baked to photoreal video
> entirely in the browser, with the construction reveal following the camera.**

Every clause is witnessed, and this is why each one is in there:
| clause | what backs it |
|---|---|
| *model-derived* | dive target from the room graph (`§CINEMA_SPACE`/`§CINEMA_DIVE`), exit door scored from `db-doors` (`§CINEMA_EXIT candidates=135`), pacing from measured bbox change (`§CPE_NOISE_LAW`) |
| *edit by dragging the flight itself* | §CPE_HOSE arc-length falloff + §CPE_STICK spawn-a-band-anywhere, PR #1074 |
| *baked to photoreal video* | full Alt+S fold per frame (16-sample TAA + 24-frame N8AO), H.264 via WebCodecs + `lib/mp4_mux.js` |
| *entirely in the browser* | static file host, no server render, no install, no seat |
| *construction reveal following the camera* | §MAXQ_TIME mode D / §CPE_BUILDUP, PR #1074 + #1078 |

## The survey, as far as it is honestly known (knowledge to May 2026 — NOT a verified sweep)
**Every ingredient exists somewhere. None of the adjacent products combines them.**
| field | who | what they have | what they do not |
|---|---|---|---|
| browser BIM viewers | APS/Forge, Speckle, That Open (web-ifc), Trimble Connect, Revizto | web 3D, extensions, collaboration | camera work is manual keyframes; no photoreal bake in-tab |
| camera-path tools | Sketchfab, Matterport, Google Earth Studio | keyframed flights, guided tours | no building semantics — they do not know what a room or a door IS |
| 4D sequencing | Synchro, Navisworks TimeLiner, Fuzor | real programme playback, CPM | desktop; reveal ordered by schedule, never by the camera |
| photoreal | Enscape, Twinmotion, Lumion | far better images than this | desktop/GPU-bound, install + seat, not model-derived paths |

**The differentiator is the INVERSION, not the pixels.** Everyone else makes you author the shot. Here
the model proposes it and you override — the same compile-not-model stance as the rest of the project.
The pixels are not the argument and should never be the argument: Enscape and Lumion win that outright.

## ⛔ DO NOT SAY
- **"first", "only", "nobody else does this"** — no verified sweep has been run. One counterexample
  makes an otherwise good post look sloppy to exactly the audience worth having.
- **"it ranks against Revit/Navisworks"** — BIM app ranking is decided by import fidelity, model scale,
  collaboration/permissions, clash and quantity workflows, and ecosystem. **This work touches none of
  them.** It makes ONE capability distinctive; it does not move the league table, and claiming it does
  invites a comparison this loses.
- **"4D schedule playback"** for the buildup — it is a DERIVED build order unless the DB genuinely has
  populated `tasks`/`task_elements` (Terminal_Hi: none; Hospital: empty; TerminalHi4D: authored by
  `materializeDefault()`, CPM columns empty). See §CPE_BUILDUP.

## Why this matters for the roadmap gaps (the user's own framing)
The strategic value is not the film. It is that a browser tab now demonstrably does derivation +
direct manipulation + photoreal output on a 48,433-element model, which is the credibility needed to
argue the HARDER gaps against the big players — federation, quantities, clash, programme integration —
without first having to prove the platform can do anything visually serious. **Use the film to buy the
hearing; do not let it become the pitch.**

## ⚠ If this is ever going public as a comparison, do the sweep first
One targeted survey, once: Speckle + APS extension marketplaces, That Open's ecosystem, Sketchfab and
Matterport animation features, and anything new since. Half a session. Do it BEFORE the post, not after
someone replies with a link. Until then the honest phrasing is *"I am not aware of another tool that
does this"* — which is true, testable, and costs nothing if someone knows one.
