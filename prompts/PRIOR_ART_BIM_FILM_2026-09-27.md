# Prior Art Search — Browser 4D BIM Auto-Schedule + Physically-Based Construction Film (2026-09-27)

**Method:** Web research only (WebSearch/WebFetch via 5 parallel research agents), no code changes. Every
claim below carries a URL from the agent that found it. Where an agent found nothing, that is stated
explicitly as "no source found in this search" — never inferred as proof of non-existence, and never
invented. Matrix cells are Y(es)/P(artial)/N(o); full URLs are in the per-player notes directly under each
table, not crammed into cells, for readability. This document is a snapshot of one search pass, not a legal
freedom-to-operate opinion.

## System under assessment (bim-ootb), restated as 6 testable features

1. **F1 — Browser-only, zero setup.** Runs entirely in-browser (three.js/WebGL/WebGPU), input = IFC-derived
   data, no desktop install, no manual model-import/phasing setup.
2. **F2 — Auto 4D schedule + one-key film.** (2a) Auto-generates a 4D construction schedule from the model
   with no hand-linking of tasks to elements. (2b) Bakes a construction build-up FILM from it in-browser,
   one key.
3. **F3 — Bake-time overlay checkboxes**, computed from model data at bake time: (3a) clash boxes, (3b)
   measurements, (3c) labels, (3d) storey reveal, (3e) escape routes, (3f) structural load path, (3g)
   discipline reveal.
4. **F4 — One shared physically-based light law** for stills and film: (4a) photometric units (sun/sky lux,
   lamp lumens from data), (4b) EN 12464-1 lux for lampless rooms, (4c) camera exposure from metered
   luminance (EV100, K=12.5), (4d) interior lighting switches on only once a space is enclosed
   (walls+roof) during 4D build-up, (4e) zone-based sky-view factor on a voxel grid.
5. **F5 — Per-shot precompute** along the known camera path: (5a) exposure track, (5b) visible sets, (5c)
   lamp pool, (5d) baked light volumes per build-up stage.
6. **F6 — Automated witness gate** that rejects garbage before release: (6a) instrument sanity, (6b)
   no-op/vacuous detection.

Players researched (grouped): **Commercial 4D/CDE** — Synchro 4D/Bentley iTwin, Navisworks TimeLiner,
Autodesk Tandem/APS Viewer, BIMcollab, Solibri, Trimble Connect, Dalux. **Real-time viz** — Fuzor,
Twinmotion, Lumion, Enscape, Unreal Engine+Datasmith. **Open-source web-native** — Bonsai (BlenderBIM),
xeokit-sdk, That Open Company (web-ifc/Fragments/@thatopen/components), Speckle. **4D-automation
startups** — ALICE Technologies, Buildots, OpenSpace. Plus **academic literature** and **patents**.

---

## (a) Feature matrix

### Table 1 — F1 (browser/no-install/IFC-direct/no setup), F2a (auto schedule, no linking), F2b (auto film bake)

| Player | F1 | F2a | F2b |
|---|---|---|---|
| Synchro 4D / Bentley iTwin | P | N | Y (manual multi-step export) |
| Navisworks TimeLiner | N | N | Y (manual multi-step export) |
| Autodesk Tandem / APS Viewer | Y (Tandem); Y w/ translation step (APS) | N | N |
| BIMcollab (Zoom + WebViewer) | P | N | N |
| Solibri (WebChecker vs legacy Office/Anywhere) | Y (WebChecker only) | N | N |
| Trimble Connect (+Planner/Visualizer) | Y (core viewer), P overall | N | N (screen-record only) |
| Dalux | P | N | N |
| Fuzor | N (desktop) | P (AI-assisted linking to an imported schedule) | Y (Cinematic/MP4 export) |
| Twinmotion | N (desktop, no direct IFC) | N (manual Phasing timeline) | Y (rendered phased video) |
| Lumion | N (desktop, no native IFC) | N | P (manual layer/clip-plane fake time-lapse) |
| Enscape / Chaos Envision | N (plugin, needs host app) | N (manual timeline) | P (manual keyframed phasing video) |
| Unreal Engine + Datasmith | N (desktop editor; Pixel Streaming ≠ client-side) | N (relies on 3rd-party SYNCHRO) | P (Sequencer, generic, needs custom setup) |
| Bonsai (BlenderBIM) | N (Blender plugin) | N (explicit `assign_product`/`assign_process` API calls) | P (weakly documented, WIP docs) |
| xeokit-sdk | Y (own WebGL engine, not three.js) | N | N |
| That Open (web-ifc/Fragments) | Y (three.js-based, WASM parser) | N | N |
| Speckle | Y (IFC direct-upload path) | N (3rd-party add-ons need a hand-authored schedule) | N |
| ALICE Technologies | P (cloud web app, but not IFC-direct; needs Revit/Navisworks + "recipes") | P (AI-assisted optimization over human rules/schedule, not from bare model) | Unconfirmed (timelapse-playback mentioned in secondary sources only) |
| Buildots | N (needs 360° hardhat camera + BIM prep) | N (consumes/updates external P6/Asta/MSP schedule) | Unconfirmed/likely N |
| OpenSpace | P (browser dashboard, but input = photo capture, not IFC) | N (compares captures to external BIM+schedule) | Y, but for **real-photo timelapse**, not simulated/rendered BIM geometry |

**Notes/citations (Table 1):**
- Synchro: desktop Synchro Pro + web SYNCHRO Control/iTwin Experience layer — https://www.bentley.com/wp-content/uploads/Why-upgrade-to-SYNCHRO-4D-Pro.pdf , https://www.bentley.com/products/itwin-experience . "Model Based Scheduling" auto-creates tasks from a human-ordered element selection, still linking-assistance not generation — https://www.linkedin.com/learning/synchro-essential-training/model-based-scheduling . Export Animation (AVI) — https://bentleysystems.service-now.com/community?id=kb_article&sysparm_article=KB0017476
- Navisworks TimeLiner: desktop-only system requirements — https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/System-requirements-for-Autodesk-Navisworks-2026-products.html ; "Auto-Attach Using Rules" still requires an imported external schedule — https://help.autodesk.com/cloudhelp/2026/ENU/Navisworks-Timeliner/files/GUID-69067DF6-E23D-449A-8178-D0B8F509F957.htm ; manual Export Animation — https://help.autodesk.com/cloudhelp/2022/ENU/Navisworks/files/GUID-6C7F480F-65EB-426C-85B6-D1FA3ED4DB64.htm
- Tandem: "100 percent cloud-based... any browser" — https://intandem.autodesk.com/ . APS Viewer: WebGL/three.js-based but requires Model Derivative translation first — https://aps.autodesk.com/en/docs/viewer/v3/tutorials/basic-viewer , https://aps.autodesk.com/en/docs/model-derivative/v2/developers_guide/basics/preperation . No 4D-scheduling feature found for either — https://www.autodesk.com/blogs/construction/why-you-should-make-4d-construction-sequencing-business-as-usual-and-how-to-do-it/
- BIMcollab: Zoom is desktop-downloaded, WebViewer is browser-based and syncs — https://www.bimcollab.com/en/products/bimcollab-zoom/ . Direct WebFetch of the Zoom product page confirmed no mention of 4D scheduling or automatic video export.
- Solibri: WebChecker is genuinely browser-based, no install, IFC upload — https://www.solibri.com/solutions/webchecker . Legacy Office (EOL 2026-04-13) / Anywhere (phase-out Q4 2026) are Windows/macOS desktop — https://help.solibri.com/hc/en-us/articles/39899281429911-Solibri-Anywhere-Availability-and-Next-Steps . No 4D/scheduling feature anywhere in product materials — https://www.solibri.com/articles/construction-managers-embrace-4d-bim-safety
- Trimble Connect: browser 3D Viewer is genuinely no-install — https://help.trimble.com/doc/trimble-connect/trimble-connect/connect-for-browsers-3d-viewer/getting-started-in-the-3d-viewer . Planner sequencing is fully manual click-to-assign — https://nordics.construsoft.com/blog/trimble-connect-planner-extension . Visualizer animation requires an external screen recorder to save video — https://support.tekla.com/video/visualizer_rendering
- Dalux: BIM Viewer is browser-based but "Active checks require the Dalux desktop app" — https://support.dalux.com/hc/en-us/articles/9738978248604-How-to-perform-checks-in-Model-validation . No 4D-scheduling page/feature found anywhere in Dalux materials (extensive search) — https://www.dalux.com/solutions/sitewalk/
- Fuzor: standalone Windows desktop app, IFC is an import format — https://www.oreilly.com/library/view/mastering-autodesk-revit/9780470937495/ch025-sec010.html . "Expert AI" auto-links objects to an already-imported P6/MSP/Asta/Navisworks schedule — https://aecmag.com/project-management/fuzor-2024-uses-ai-for-4d-automation/ . Cinematic export to MP4/`.fmp` — https://www.kalloctech.com/comm_cinematics.jsp
- Twinmotion: desktop, no direct IFC (must go through Datasmith from a host BIM app); direct IFC import is still an open Epic roadmap request — https://portal.productboard.com/epicgames/3-twinmotion-public-roadmap/c/2253-import-ifc . Phasing tool is a manual multi-track timeline — https://dev.epicgames.com/documentation/en-us/twinmotion/working-with-the-phasing-tool ; exports a "phased video" once set up — https://resources.imaginit.com/twinmotion-tips-and-tricks/simulating-construction-sequences-and-phasing
- Lumion: no native IFC import (workaround via SketchUp) — https://grabcad.com/questions/dwg-import-into-lumion . "4D phasing" is a manual Layers/Clip-Plane/Move-effects fake time-lapse — https://support.lumion.com/hc/en-us/articles/360003457134-Construction-4D-phasing-in-Lumion-using-Layers-June-28-2016-
- Enscape/Envision: plugin requiring a host desktop BIM app — https://apps.autodesk.com/RVT/en/Detail/HelpDoc?appId=2629595860167800202&appLang=en&os=Win64 . Envision "construction phasing" is manual timeline/keyframe authoring — https://www.chaos.com/enscape/envision
- Unreal+Datasmith: full desktop install, no browser editor (Pixel Streaming only streams a server-rendered session) — https://forums.unrealengine.com/t/unreal-engine-web-based-editor/840233 . 4D relies on third-party SYNCHRO rendered through Unreal — https://www.bentley.com/en/products/synchro-4d/
- Bonsai: Blender add-on, not browser — https://docs.ifcopenshell.org/bonsai.html . `ifcopenshell.api.sequence` exposes explicit `assign_product`/`assign_process` calls — https://docs.ifcopenshell.org/autoapi/ifcopenshell/api/sequence/index.html ; "4D Bonsai" fork proposes (not-yet-shipped) auto element-selection — https://github.com/IfcOpenShell/IfcOpenShell/issues/7682 . Official "Costing and Scheduling" guide is explicitly marked "🚧 Work in Progress" — https://docs.bonsaibim.org/guides/costing_and_scheduling/index.html
- xeokit-sdk: pure WebGL, own engine (NOT three.js), loads IFC/CityJSON/glTF/LAS directly — https://xeokit.io/ , https://en.wikipedia.org/wiki/Xeokit . BEXEL Manager integrates xeokit for schedule-driven (not inferred) 4D coloring — https://xeokit.io/success-stories/revolutionizing-bim-visualization-through-high-performance-xeokit-sdk-implementation-in-bexel-manager/
- That Open: `web-ifc` WASM parser at native speed in-browser — https://github.com/ThatOpen/engine_web-ifc ; Fragments viewer built on three.js — https://github.com/ThatOpen/engine_fragment . No 4D/scheduling feature found anywhere in the ecosystem (targeted search).
- Speckle: viewer is a three.js extension, direct browser IFC upload with "no desktop software or connector needed" — https://docs.speckle.systems/connectors/direct-uploads/introduction , https://speckle.systems/integrations/ifc/ . Community "bim_ai" project needs a human-uploaded schedule, AI only maps it — https://github.com/nakulp2024/bim_ai
- ALICE: cloud web app, "nothing to install" — https://www.alicetechnologies.com/faqs — but recommends Revit/Navisworks formats, not IFC-direct, and requires human-authored "recipes" — https://www.alicetechnologies.com/alice-model . P6/MSP import mode optimizes an existing human schedule — https://support.alicetechnologies.com/hc/en-us/articles/21237989571863-Import-P6 , https://www.constructiondive.com/news/mckinsey-alice-technologies-partner-generative-ai-schedule/817580/
- Buildots: hardhat 360° camera site walk required; consumes P6/Asta/MSP schedule, doesn't generate one — https://buildots.com/blog/scheduling/ , https://buildots.com/blog/ai-and-data-in-project-scheduling/
- OpenSpace: photo/360/drone capture platform; "Timelapse Video" auto-compiles a video from real photos on one click, not simulated BIM geometry — https://www.openspace.ai/resources/data-sheets/grow-your-business-with-timelapse-videos-in-openspace-capture/ , https://support.openspace.ai/hc/en-us/articles/41888516023827-Timelapse-Videos

### Table 2 — F3 overlay checkboxes computed at bake/render time

| Player | 3a Clash | 3b Measure | 3c Labels | 3d Storey reveal | 3e Escape routes | 3f Load path | 3g Discipline reveal |
|---|---|---|---|---|---|---|---|
| Synchro/Bentley | Y | no src found | — | no src found | no src found | no src found | no src found |
| Navisworks | Y (Clash Detective) | Y | — | no src found | no src found | no src found | no src found |
| Tandem/APS (via ACC Model Coord.) | Y | — | — | no src found | no src found | no src found | no src found |
| BIMcollab | Y (Smart Views/rule-based) | — | — | no src found | no src found | no src found | no src found |
| Solibri | Y (Model Health) | Y | — | rule-based (not visual reveal) | no src found | no src found | P (custom "Discipline" property, used in clash rules) |
| Trimble Connect | Y (Clash module) | Y | — | no src found | no src found | no src found | no src found |
| Dalux (Box) | Y (hard/soft) | Y | — | no src found | no src found | no src found | no src found |
| Fuzor | Y + clearance | 2D/3D viewsheet | — | no src found | no src found | no src found | no src found |
| Twinmotion | N (native) | Y (added ~2025.x, generic) | — | manual "View sets" only | no src found | no src found | no src found |
| Enscape | N (users request it) | — | — | — | no src found | no src found | no src found |
| xeokit-sdk | N (explicitly absent from plugin list) | Y (Distance/Angle plugins) | Y (Annotations) | Y (StoreyViewsPlugin) | no src found | no src found | no src found |
| That Open | N (BCFTopics is issue-labels only, not geometric clash) | Y (LengthMeasurement) | — | (Clipper for section cuts) | no src found | no src found | no src found |
| Speckle | N native (3rd-party "converge", unverified) | Y (MeasurementsExtension) | (Overlay layer exists) | (SectionTool box) | no src found | no src found | no src found |

**Cross-cutting finding (Table 2):** clash detection + measurement are near-universal across mature
commercial tools. **Storey-by-storey reveal exists only as a plugin feature (xeokit StoreyViewsPlugin).
Escape-route visualization and structural load-path visualization were not found as a named/marketed
feature in ANY of the ~19 players searched** — both agents (commercial cluster and real-time-viz cluster)
independently returned "no source found" on these two. Discipline-reveal exists only in a weak form
(Solibri's custom classification property used inside clash rules).

### Table 3 — F4 physically-based light law (A1–A5, restated from feature list 4a–4e)

| Sub-feature | Found where | Verdict |
|---|---|---|
| 4a. Photometric units (sun/sky in lux; lamps in lumens from real fixture data) | Enscape (IES files) — https://novedge.com/blogs/design-news/illuminating-design-5-enscape-features-that-revolutionize-real-time-lighting-simulations ; Corona (candela/lux/lumen + IES) — https://documentation.chaos.com/space/CRMAX/124393836/Corona+Light ; Unreal Engine Physical Light Units — https://dev.epicgames.com/documentation/en-us/unreal-engine/using-physical-lighting-units-in-unreal-engine ; Navisworks (candela/lumen/lux "Lamp Intensity" dialog) — https://knowledge.autodesk.com/support/navisworks-products/learn-explore/caas/CloudHelp/cloudhelp/2021/ENU/Navisworks/files/GUID-032C78F6-6FD0-49F5-8653-0D2D79130C3B-htm.html | **Found individually, multiple tools** — but no source found of any tool enforcing a hard "no artist slider, data-only" rule; all expose a manual override alongside. |
| 4b. EN 12464-1 auto-applied to lampless rooms | DIALux/Relux/AGi32 require fixtures already placed, check *against* the standard, don't retro-assign targets to empty rooms — https://community.dialux.com/project-showroom/post/en-12464-1-minimum-illuminance-levels-for-hotel-guest-rooms-oL8cD4rwOHaLQdY . Closest: **Light Planner** (Light Solutions ApS) auto-loads EN 12464-1 targets by room-type before fixture placement — https://www.lightsolutions.dk/light-planner/ | **No source found** of any tool auto-scanning a WHOLE building model and assigning EN 12464-1 targets to every unfitted space as an unattended batch pass. |
| 4c. Camera exposure from metered luminance, EV100 formalism, K=12.5 | Formula/constant confirmed as a real photographic convention (Canon/Nikon/Sekonic use K=12.5) — https://www.scantips.com/lights/evchart.html , https://en.wikipedia.org/wiki/Exposure_value . Frostbite (EA/DICE) SIGGRAPH 2014 explicitly uses K=12.5 in auto-exposure from metered scene luminance — https://cgvr.cs.uni-bremen.de/teaching/cg_literatur/Moving%20Frostbite%20to%20Physically%20Based%20Rendering%203.0,%202014,%20Sebastien%20Lagarde.pdf . Unreal Engine Auto Exposure documented in EV100 — https://dev.epicgames.com/documentation/en-us/unreal-engine/auto-exposure-in-unreal-engine | **Found in game-engine/VFX literature (Frostbite, Unreal) — not found as a named, documented feature in any AEC/BIM-facing viewer** (Enscape/Lumion/Twinmotion docs searched, none name EV100/K=12.5). |
| 4d. Interior lighting switches on only once a space is enclosed (walls+roof) during 4D build-up | Searched general 4D BIM literature, digital-twin literature, and a relevant automatic-lighting patent (US12282995B2 — confirmed by direct fetch to have NO construction/enclosure trigger) | **No source found anywhere, in any domain.** Cleanest "nothing found" result of the whole search. |
| 4e. Zone-based sky-view factor on a voxel grid of the building | SVF itself is well established at urban/terrain scale (UMEP, QGIS) — https://umep-docs.readthedocs.io/en/latest/pre-processor/Urban%20Geometry%20Sky%20View%20Factor%20Calculator.html . Voxel daylighting exists academically at interior scale (Honeybee/Grasshopper dataset) — https://openreview.net/pdf/43e0dc0569e5342bf7ed2c87959ac6604ad9a13f.pdf . VoxCity voxelizes buildings+terrain for SVF/solar-radiation at city scale — https://github.com/kunifujiwara/VoxCity | **No source found** combining "sky view factor" + "voxel grid" + "per-zone of a single building's interior," and especially none tied to a building's own progressive self-construction (all found SVF work is finished-building/urban-scale). |
| Shared law between still renderer and film baker | — | **No source found** of any tool explicitly documenting one light/exposure law reused identically between a "stills" mode and an "animation/film" mode — every tool researched treats these as separate rendering paths with independently tunable settings. |

A 2026 review of BIM+game-engine integration explicitly names daylighting/energy/sustainability as among the
**"least explored themes"** in that integration space — direct evidence 4d/4e sit in an acknowledged research
gap, not just an unsearched corner: https://academic.oup.com/jcde/article/12/4/26/8071981

### Table 4 — F5 per-shot precompute (5a–5d)

No player, academic paper, or patent was found describing this exact bundle (exposure track + visible-object
set + lamp pool, precomputed per shot along a fixed camera path, plus baked light volumes per construction
stage) for a BIM/4D context. Adjacent, generic (non-BIM) prior art exists only at the game-engine level:
Unreal Engine's Sequencer (cinematic tool) and its general lightmap-baking pipeline provide the *primitives*
(camera tracks, precomputed lighting) but neither is documented as bundled this way, nor tied to construction
stages — https://dev.epicgames.com/documentation/unreal-engine/datasmith-plugins-overview , general Sequencer
docs. **No source found** of a construction-stage-keyed baked-light-volume technique anywhere.

### Table 5 — F6 automated witness/QA gate (6a instrument sanity, 6b no-op/vacuous)

| Player | Automated gate found? | Scope |
|---|---|---|
| Solibri | **Yes — strongest model-QA match found.** 50+ built-in rule templates auto-validate a model; described as "a quality gateway that operates around the clock," failing models held in "checking/rejected" status — https://www.adyantrix.com/blogs/automating-model-health-checks-solibri-rules , https://www.solibri.com/solutions/bim-quality-assurance/data-validation | **Model/data QA only** — no source found applying this to a rendered image/video/export. |
| Dalux (Model Validation) | Yes — auto-reprocesses checks whenever new/updated model files are linked — https://support.dalux.com/hc/en-us/articles/13790781626140-How-to-set-up-Model-validation | **Model/data QA only** (clashes, clearances, metadata) — not render/frame QA. |
| BIMcollab | Partial — "Smart Issues" auto-checks linked-clash status without a rerun trigger — https://www.bimcollab.com/en/products/bimcollab-zoom/clash-management/ | Model/clash data only. |
| Speckle Automate | Yes, clearest CI/CD-style architecture — "Model Checker" + "Data Standards Checker" (IDS/bsDD) run on every new model version — https://speckle.systems/automated-model-validation/ , https://github.com/specklesystems/speckle-automate-checker | **Data/schema validity only** — no source found for render-validity checking (blank frame, false-pass, etc.). |
| Fuzor / Synchro / Navisworks / Twinmotion / Lumion / Enscape / Unreal / Bonsai / xeokit / That Open / ALICE / Buildots / OpenSpace | **No source found** for any automated pre-release render/export validity gate. | — |

**Patents (B4 category, from patent-focused agent):** strong prior art exists, but entirely **outside** BIM/AEC:
- **US11496231B2** (Nielsen, filed 2018, pub. 2022) — detects blank/uniform-brightness video frames via
  compressed-luminance DC analysis, for broadcast ad-break detection — https://patents.google.com/patent/US11496231B2 (lineage traces to earlier US7,984,462).
- **US11275846B2** (Intel, filed 2019, pub. 2022) — ML no-reference detection of corrupted rendered frames
  via pixel-gradient analysis, in a GPU-driver/DRM validation context — confirmed by direct fetch.
- **No patent found** applying blank/invalid-frame or no-op/vacuous detection specifically to a BIM/AEC or
  4D-construction-visualization render pipeline.

**Academic (F6 / witness-testing concept):** No academic or industry precedent found specific to
rendering/BIM/construction-visualization pipelines. The only generic analog is UI/web-app "golden image"
visual-regression testing (e.g. https://docs.widgetbook.io/glossary/golden-tests,
https://www.checklyhq.com/blog/visual-regression-testing-with-playwright/) — never described in a BIM, 3D,
or construction-visualization context in anything found.

---

## Academic literature (F2 — automatic 4D schedule generation) and patents (F1/F2 relevant)

- Wu & Ma (2023), *Engineering, Construction and Architectural Management* 30(10) — ontology-rule + genetic-
  algorithm pipeline generating a schedule directly from BIM data with no manual element-to-task linking; the
  closest academic match found, though pre-authored ontology rules still encode domain sequencing logic.
  https://doi.org/10.1108/ECAM-12-2021-1105
- Kim, Anderson, Lee & Hildreth (2013), *Automation in Construction* 35 — foundational open-BIM data-
  extraction framework for schedule generation. https://www.sciencedirect.com/science/article/abs/pii/S0926580513000873
- Altun & Akçamete Güngör (2018), CIB W78 — automates the *linking* step specifically (auto-assigns "4D Task
  IDs" then auto-maps to schedule tasks). https://itc.scix.net/pdfs/w78-2018-paper-057.pdf
- Doukari, Seck & Greenwood (2022), *Frontiers in Built Environment* 8 — explicit counterpoint: 4D generation
  "requires considerable manual effort" in current practice; proposes reducing, not eliminating, it.
  https://www.frontiersin.org/journals/built-environment/articles/10.3389/fbuil.2022.998309/full
- Amarkhil & Elwakil (2026), *ITcon* 31 — Dynamo-scripted schedule-ready-data extraction; explicitly flags
  manual enrichment still required, calls AI-assisted scheduling "future work." https://www.itcon.org/paper/2026/29
- Eftekharirad & Boton (2026), ECPPM — AI-driven 4D BIM-VR conceptual framework only, not implemented/tested.
  https://zenodo.org/records/22679862
- Park, Cai, Dunston & Ghasemkhani (2017), *J. Construction Engineering & Management* 143(10) — database-
  backed, web-served real-time 4D visualization (predates but doesn't name three.js/WebGL).
  https://ascelibrary.org/doi/full/10.1061/(ASCE)CO.1943-7862.0001392
- Open-source precedent (not peer-reviewed): ZeaInc `4d-schedule-viewer` — binds a schedule to multi-IFC
  models rendered via WebGL Zea Engine in-browser. https://github.com/ZeaInc/4d-schedule-viewer

**Patents (B1/B2 — schedule inference / build-up video generation):**
- US9070216B2, US9852238B2, US20190325089A1, CN103440600A, CN105023201A, CN112446937A, CN118779973B,
  US9019269B1 — all link an *externally supplied* schedule to a 3D/BIM model for progress monitoring or
  visualization; none infer sequence purely from model geometry. Full list with URLs in agent transcript;
  representative: https://patents.google.com/patent/US9852238B2
- US20250245588A1 (Xactware, 2025) — ML schedule/cost prediction, but from insurance-claim/tabular data, not
  BIM geometry.
- **US7979251B2 (LEGO A/S, 2007/2011)** — generates step-by-step assembly instructions for LEGO models by
  computing and reversing a disassembly sequence, fully automatic, zero manual input. Structurally the
  closest "pure geometry → automatic build order" pattern found anywhere — but for toy bricks, not a
  full-scale building/IFC context. https://patents.google.com/patent/US7979251B2
- **CN111161390A** (Beijing Forever Technology, 2019/2020) — server pre-converts BIM/IFC to WebGL-optimized
  triangle data for no-install browser rendering with LOD/frustum culling — the strongest direct patent match
  for "browser-based WebGL BIM rendering" (F1). https://patents.google.com/patent/CN111161390A/zh

---

## (b) Closest prior art — top 3

1. **Fuzor (Kalloc Studios)** — closest on the *content* side of the pipeline: AI-assisted schedule-to-model
   linking ("Expert AI," 2024), one-click Cinematic/MP4 export of the resulting 4D sequence, clash detection
   with clearance checks, 2D/3D viewsheets, and an IES-photometric "Light Report." **Lacks:** browser
   delivery (Windows desktop only), a model-inferred schedule (still needs an imported P6/MSP/Asta/Navisworks
   schedule), true EV100/metered auto-exposure, EN 12464-1 auto-assignment, enclosure-triggered lighting, and
   any automated render-validity gate. Sources: https://aecmag.com/project-management/fuzor-2024-uses-ai-for-4d-automation/ , https://www.kalloctech.com/comm_cinematics.jsp , https://kalloctech.com/analysis_light_rep_IES.jsp

2. **Synchro 4D / Bentley iTwin** — closest on the *scheduling-automation* side: "Model Based Scheduling"
   auto-creates tasks from an ordered element selection, integrated clash detection, and animation export to
   4K video. **Lacks:** browser-native operation (desktop-first; web layer is a companion, not the authoring
   tool), any model-inferred (as opposed to human-selected) schedule, any photometric/EV100 lighting, storey/
   escape-route/load-path overlays, and any automated QA gate. Sources: https://www.bentley.com/software/synchro/ , https://www.linkedin.com/learning/synchro-essential-training/model-based-scheduling , https://bentleysystems.service-now.com/community?id=kb_article&sysparm_article=KB0017476

3. **The open-source web-native cluster (xeokit-sdk + That Open Company's web-ifc/Fragments + Speckle)** —
   closest on the *browser-delivery* side: genuinely zero-install, direct client-side IFC parsing (WASM/own
   WebGL engines), live-computed overlay plugins (measurements, storey isolation, section clipping,
   annotations, BCF viewpoints). **Lacks:** any scheduling feature at all (F2 is a clean "no source found"
   across this whole cluster), any film-bake feature, any photometric/EV100 lighting law, and any
   render-validity gate — Speckle Automate is the partial exception, but it gates model *data* (IDS/bsDD
   schema), not rendered output. Sources: https://xeokit.io/ , https://github.com/ThatOpen/engine_fragment , https://speckle.systems/automated-model-validation/

*(Honorable mentions on single dimensions, not close overall: Unreal Engine has by far the strongest
documented EV100/photometric-units implementation of anything found, but zero native BIM scheduling and no
browser delivery; ALICE Technologies has the most "generative" schedule marketing but still needs
human-authored recipes or an imported schedule and is not IFC-direct; Solibri/Dalux have the most mature
automated-gate architecture but only for model data, never for a rendered frame/film.)*

---

## (c) Candidate novel elements (no source found in this search)

Stated cautiously — absence of a hit in this search pass is not proof no one has built it, only that nothing
turned up across ~19 commercial/open-source players, the academic venues searched, and Google Patents.

- **The full 6-feature combination in one system.** No source found combining browser-only delivery,
  model-inferred (zero-linking) 4D scheduling, one-key film baking, bake-time computed overlays, a single
  shared photometric/EV100 light law, and an automated render-validity gate.
- **Fully automatic 4D schedule generation with literally zero manual task-to-element linking or
  human-authored construction-method rules.** Every commercial tool found (Synchro, Navisworks, Trimble
  Connect, Fuzor, ALICE) requires either an imported human-authored schedule, human-selected element order,
  or human-defined "recipes"/rules; the closest academic work (Wu & Ma 2023) still relies on pre-authored
  ontology rules.
- **Escape-route visualization and structural load-path visualization as bake-time overlay toggles.** Not
  found as a named/marketed feature in any of the ~19 players researched, independently confirmed by two
  separate research passes.
- **Interior lighting that switches on automatically only once a space becomes enclosed (walls+roof
  complete) during a 4D construction sequence** — i.e., lighting state derived from construction progress
  rather than manually keyframed. No source found anywhere, in any domain (BIM, digital twin, game engine,
  or patent literature) — the cleanest "nothing found" result of the entire search.
- **EN 12464-1 lux targets auto-assigned to every lampless room across a whole building model as an
  unattended batch pass.** Existing tools (DIALux, Relux, Light Planner) apply the standard as part of a
  human-run, per-room lighting-design workflow, not as an automatic whole-model sweep.
- **Zone-based sky-view factor computed on a voxel grid of a building's own interior, tied to that
  building's progressive self-construction.** Voxel-grid SVF is documented at urban/terrain scale (VoxCity)
  and interior daylighting is documented academically at a static/finished-building scale; the combination
  (voxelized, per-interior-zone, tracking a building's own construction progress) was not found.
  Independently flagged by a 2026 review as one of the "least explored" BIM+game-engine integration themes.
  https://academic.oup.com/jcde/article/12/4/26/8071981
  ⚠ Note: this same combination is also the subject of an existing internal spec in this repo
  (`prompts/PHOTOREAL_STILL_RENDER.md`) — the search found no external prior art for it, but it is not a
  fresh idea within this codebase's own history.
- **A camera-exposure law using the EV100/K=12.5 metered-luminance formalism, named/documented as a feature
  of a BIM or AEC viewer.** The formalism itself is well established in game engines/VFX (Frostbite, Unreal)
  but was not found named in any AEC-facing product's own documentation (Enscape, Lumion, Twinmotion,
  Navisworks all searched).
- **One explicitly shared light/exposure law reused identically between a "stills" render mode and an
  "animation/film" bake mode of the same tool.** No tool researched documents this as a single shared law;
  every tool treats stills and animation as separately tunable rendering paths.
- **Per-shot precompute bundling {exposure track, visible-object set, lamp pool} plus baked light volumes
  keyed to construction stage, along a fixed camera path.** No BIM-context source found; the underlying
  engine primitives (Sequencer, lightmap baking) exist generically in Unreal but are not documented bundled
  this way or tied to construction stages.
- **An automated "witness" gate that rejects a baked render/film specifically (not model data) for
  no-op/vacuous/garbage-input conditions before release.** Automated model-*data* QA is a solved, common
  category (Solibri, Dalux, BIMcollab, Speckle Automate). Automated blank/invalid-*frame* detection exists,
  but only in broadcast (Nielsen patent lineage, ad-break detection) and GPU-driver/DRM (Intel patent)
  domains. No source found applying either concept to a BIM/AEC or 4D-construction-visualization render
  pipeline specifically — independently confirmed as a gap by both the academic/patent-focused agents.

---

## (d) Search log

Research was dispatched as 5 parallel agents, each given the 6-feature checklist above and told to cite a
URL for every claim or say "no source found." Exact literal query strings run inside each agent are not
retained by this orchestrating session (only each agent's cited findings were returned) — logged here are
the **topics/targets** each agent was dispatched to search, which is the traceable record of what was
covered:

1. **Commercial 4D/CDE cluster** — Synchro 4D / Bentley iTwin (Synchro Pro, SYNCHRO Control, iTwin
   Experience), Autodesk Navisworks TimeLiner, Autodesk Tandem / Autodesk Platform Services (Forge APS)
   viewer, BIMcollab (Zoom/Cloud/WebViewer), Solibri (Office/Anywhere/WebChecker), Trimble Connect
   (+Planner/Visualizer), Dalux (Build/Field/BIM Viewer/Box) — each checked against F1/F2a/F2b/F3(a–g)/F5/F6.
2. **Real-time visualization cluster** — Fuzor, Twinmotion (+Phasing tool, Datasmith), Lumion, Enscape
   (+Chaos Envision), Unreal Engine + Datasmith 4D workflows — same checklist, plus specific searches on
   PBR-materials-vs-true-photometric-lighting distinctions.
3. **Open-source web-native cluster** — Bonsai (BlenderBIM, IfcOpenShell `sequence` API), xeokit / xeokit-sdk
   (+xeokit-bim-viewer, plugin wiki), That Open Company (web-ifc, Fragments, @thatopen/components, BCFTopics),
   Speckle (speckle-server, @speckle/viewer, Speckle Automate) — same checklist.
4. **4D-automation startups + academic literature** — ALICE Technologies (ALICE Model, P6 import, generative
   scheduling), Buildots (360° hardhat capture, scheduling integration), OpenSpace (reality capture, Timelapse
   Video feature); academic search across Automation in Construction, ITcon, ECPPM 2026, CIB W78, Frontiers
   in Built Environment, and arXiv for "automatic 4D schedule generation," "web-based 4D BIM visualization,"
   "physically based lighting tied to construction progress," "automated visual quality gate / witness
   testing / no-op detection" for rendering/BIM, and "sky view factor voxel grid" daylight/building context.
5. **Physically-based light law + patents** — targeted searches on photometric units (Enscape/Corona/V-Ray/
   Unreal IES + lux/lumen), EN 12464-1 auto-application (DIALux/Relux/AGi32/Light Planner), EV100 + K=12.5
   auto-exposure formalism (Frostbite SIGGRAPH 2014, Unreal Auto Exposure, 3ds Max Automatic Exposure
   Control), enclosure-triggered lighting (general 4D BIM + digital-twin literature + patent
   US12282995B2), voxel sky-view-factor (VoxCity, UMEP, Tregenza method); Google Patents searches for B1
   (auto 4D sequence generation), B2 (auto build-up video generation), B3 (browser/WebGL BIM rendering
   patents), B4 (automated render/frame QA gates — broadcast/GPU-driver domains), B5 (camera
   auto-exposure patents in 3D/BIM context).

---

*Compiled 2026-09-27 from 5 parallel research-agent reports. No code was changed to produce this document.*
