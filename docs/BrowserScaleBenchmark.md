# Browser-Scale Benchmark — one tab, local first, how big and how fast

**Status:** working draft (2026-10-06). Numbers are our own measurements from shipped code and bake logs unless marked otherwise; outside
research is marked UNVERIFIED where it was not confirmed from a primary source. Rule for this page: credibility first — every number is
measured or labelled an estimate, and where others win or the comparison is unfair, we say so.

**What this covers:** BIM OOTB runs a whole construction workflow in one browser tab with no server — IFC import into SQLite (WASM),
three.js rendering, a 4D schedule, 5D quantities, clash, road checks, ERP and in-browser film baking. This page records how large that is
today, where it breaks, how it can grow, and what we can and cannot claim against other projects.

**Companion page:** [Local-First Prior Art](LocalFirstPriorArt.md) (researched 2026-05/06) already covers the SYNC systems (Replicache,
ElectricSQL, PowerSync, LiveStore, CRDTs, SQLSync, cr-sqlite) and the storage axis — notably **Notion**, the at-scale production example of
SQLite-WASM in the browser (Web Worker + OPFS SAHPool), which keeps Postgres as the source of truth (a server-backed projection, not
local-first). Rows below that say "not checked" for those systems defer to that page.

**Contents:** §PRIOR_ART (claims we can cite) · §SCALE (size today, what breaks) · measured render + heap numbers · THRESHOLD (fitted from
48 bake logs) · §IFC43 (the IFC4.3 path and code-size reality).

Same lane rule: CREDIBILITY FIRST — measured or labelled estimate; research-agent findings marked UNVERIFIED where so. Feeds the film's Chapter 0 claim card (§11.next) and the published scale chart
for developers (this doc owns it).

### §PRIOR_ART — citable claim wording (Sonnet research agent, 2026-10-06; ~20 searches + 5 page fetches — SHALLOW for several tools)
**Defensible (state the scope with it):** "In a search of web, vendor docs and academic indexes (Oct 2026), we found no published or
commercial single browser application that runs local-first with no server and combines ERP document flow, BIM parsing, an auto-generated
4D schedule, 5D quantities, mesh clash, a road-standards check and film baking." Also defensible: the parts exist separately — the claim is
about the COMBINATION and the proxy-only inference path (file names + property sets).
**NOT defensible:** "first" · "only" · "no one has attempted" · "no ERP works offline" (Odoo has an offline mode, short-term only) ·
"proxy-only IFC2X3 civil is a known industry problem" (no source found) · "Figma is not local-first" (unverified) · any claim that That Open,
xeokit, Speckle, Trimble, Dalux, Catenda or iTwin LACK 4D/5D/clash (their docs were not checked — absence of evidence only).
**Closest prior art:** (1) IFClite — fully client-side WASM, IFC2X3/4/4X3/5, clash, IDS validation; no 4D/5D/ERP/film per its docs
(https://docs.rs/crate/ifc-lite-wasm/4.1.1). (2) MI ERP BIM Suite for Odoo 19 — ERP + BIM + 4D/5D + clash in one product, but IFC parsed
server-side, Odoo-hosted, xeokit viewer; no film / road checks found (https://apps.odoo.com/apps/modules/19.0/mierp_bim_suite).
(3) SYNCHRO 4D / Navisworks / Fuzor — mature 4D (SYNCHRO imports IFC2x3 + OpenRoads) but desktop, schedule-driven, no ERP
(https://www.bentley.com/software/synchro-4d/).
**Other cited facts:** local-first definition — Kleppmann et al., Onward! 2019, DOI 10.1145/3359591.3359737 (its ideals include multi-device
sync, so a no-server tab meets only some: offline, privacy, longevity, control) · SQLite WASM + OPFS https://sqlite.org/wasm/doc/trunk/index.md ·
Odoo offline "not intended to offer full or long-term offline capabilities" https://www.odoo.com/documentation/saas-19.1/applications/general/offline_mode.html ·
IFC 4.3.2.0 = ISO 16739-1:2024 (road, rail, bridge, tunnel, ports) https://www.buildingsmart.org/ifc-4-3-approved-as-a-final-standard/ ·
Civil 3D IFC 4.3 extension https://www.autodesk.com/blogs/aec/2023/05/12/whats-new-in-openbim-and-infrastructure-ifc-4-3-for-civil-3d/ ·
Civil 3D objects must be 3D solids before IFC export (Autodesk help 2025) · auto-4D from IFC without a schedule exists in literature
(ASCE 2009 https://ascelibrary.com/doi/10.1061/41052%28346%2966 ; 2012 spatial reasoning https://repository.lsu.edu/mechanical_engineering_pubs/1482) ·
proxy-only models acknowledged (IFCNet arXiv 2106.09712 — class from geometry); none seen uses file names + psets.
**Priority note:** an OSArch forum post describes web-ifc WASM → in-memory SQLite → three.js, no backend
(https://community.osarch.org/discussion/comment/29036/) — possibly the user's own; check before citing priority for that stack.
**Before publishing:** verify the UNVERIFIED rows (APS/Forge, iTwin.js, Trimble Connect, Dalux, Catenda, PGlite/ElectricSQL/PowerSync,
DuckDB-WASM, JupyterLite, Figma/Linear architecture) from primary docs.


### §SCALE — how large we are, and what breaks as we grow (recorded 2026-10-06, from §LOAD / §J / §MESH_SLIM measurements)
**Today (road + bridge, before the partner set):** 10,413 elements · DB 661 MB (605 MB = component_geometries; 396 MB after §MESH_SLIM) ·
22.0 M vertices / 8.5 M triangles · heaviest: 227 lamp poles = 204 MB / 7.6 M verts (~33k verts per pole, flat-shaded facet soup, dup
ratio 4.8) · load to COMPLETE 36.5 s headless (46.6 s before the roof fix #1867). Partner set adds 9,145 geotech pieces but ~0.26 M verts
(IfcOpenShell tessellation — a different count basis from the DB).
**What breaks as we grow, worst first:**
1. MEMORY CEILING — geometry is never disposed (DLOD saves draw work, not memory: dlod_nav.js :475/:1397); estimate 100 km ≈ ~21 GB →
   chainage tiles / section streaming (§J). The DB lives whole in the sql.js WASM heap — 32-bit WebAssembly caps at 4 GB (Memory64 lifts it on Chrome/Firefox desktop);
   the tighter real limit is mobile/Safari per-tab memory (see benchmark context below).
2. SAVE COST — §KRN_PERSIST rewrites the whole 646 MB DB per op; URL loads > 400 MB skip the IDB cache (§CACHE_WRITE_SKIP_TOO_LARGE) → every
   reload re-downloads. Grows with size → incremental / delta saves.
3. LATENT GRID — light_zones 0.5 m grid ≈ 2.8e9 cells / 5.5 GB at this extent if a road model ever carries IfcSlab/IfcWall.
4. GPU VRAM — 8 GB card; three GPU tenants (user Chrome + bake + headless) crashed the user's tab once (memory feedback).
5. HEAVY MESH — lamp poles: crease-angle smooth + weld would cut most of their 7.6 M verts (needs spec + look ruling).
Helps already: §MESH_SLIM (661 → 396 MB), roof layer 10.1 s → 33 ms. IFC4.3 alignment/stations make tiling by station natural (§IFC43).
Suggested order: section streaming + incremental save BEFORE more features.
**Benchmark context (Sonnet research agent, 2026-10-06 — partial; anecdotes are NOT benchmarks):**
- Wasm memory: DuckDB-WASM docs "WebAssembly limits … to 4 GB and browsers may impose even stricter limits"
  (https://duckdb.org/docs/current/clients/wasm/overview.html). Memory64 ships in Chrome 133+ / Firefox 134+, practical JS cap 16 GB,
  10 %–100 %+ slower than 32-bit (https://caniuse.com/wf-wasm-memory64 ; https://spidermonkey.dev/blog/2025/01/15/is-memory64-actually-worth-using.html);
  Safari status UNVERIFIED. → OUR REAL CEILING IS SAFARI/iOS AND CHROME MOBILE (old third-party figures: Chrome mobile ~500–700 MB per tab,
  Firefox 2 GB, Safari kills the tab instead of failing memory.grow — UNVERIFIED as current), not Chrome desktop.
- Storage quotas (web.dev, may be dated): Chrome up to 60 % of disk per origin · Firefox 2 GB per eTLD+1 · Safari ~1 GB per origin.
- xeokit published sample: 5,512 objects / 283,238 triangles, ~2 s over the network from a pre-converted XKT
  (https://xeokit.io/blog/automatically-splitting-large-models-for-better-performance). Ours: 8.5 M triangles (~30×), 36.5 s full local DB
  load — load times NOT comparable (compressed network fetch vs whole local DB).
- Potree streams 597 B points (~1.6 TB) server-backed — a different class (streamed); never on the same axis without labelling it.
- No published sql.js / SQLite-WASM database as large as our 661 MB was found; no published fps for any viewer → no frame-rate comparison.
- Chart axes proposed: (1) resident client data MB (log) × triangles rendered (log), hollow markers for streamed; (2) memory-ceiling ladder
  bars (kvvfs 5 MB · Safari ~1 GB · Firefox 2 GB · Wasm32 4 GB · Memory64 16 GB) with our 661 / 396 MB overlaid; (3) whole-in-memory vs
  streamed, colour = server needed. Gaps before charting: ThatOpen/xeokit large-model numbers, APS guidance, Photopea app size, official
  Chrome/Safari per-tab limits, Safari Memory64.
**How much can we grow (2026-10-06 — ESTIMATES from our own numbers, not measured limits):**
- GPU: 22 M verts × (12 B position + 12 B normal) ≈ 530 MB + 8.5 M tris × 12 B indices ≈ 100 MB → ~0.6 GB VRAM if everything is uploaded.
- Desktop (Chrome, 8 GB card): whole-model headroom roughly 5–8× today before VRAM/heap trouble; DB alone up to the 4 GB Wasm cap ≈ 10× the
  slimmed 396 MB. Mobile (~0.5–0.7 GB per tab, unverified): today's road is ALREADY too big as a whole model.
- What exists for streaming: `viewer/lib/httpvfs.js` + streaming.js §S260 (`A._useRangeStream`) fetch geometry by HTTP range requests from a
  URL-served DB — the DB is NOT loaded whole. Gaps: (a) imported/local DBs (IndexedDB) still open whole in the sql.js heap → needs an
  OPFS-paged SQLite VFS; (b) fetched geometry is never evicted (DLOD disposes nothing) → needs evict-behind; (c) chainage tiles (§J).
  With (a)+(b)+(c) memory follows the visible WINDOW, not road length → length bounded by storage quota, not RAM. That is the growth path.
**Developer doc (user 2026-10-06):** the scale chart + these numbers go into a separate doc published for the dev community (§SCALE
benchmark axes; fill the listed gaps first). Where to publish: OPEN (public docs site via scripts/safe_gh_deploy.sh vs a shared page).

**MEASURED from the v3c bake log (2026-10-06, `~/Downloads/BIM_JELAPANG_v3c.log`, 1,419 frames at 1852×960, machine = NVIDIA GeForce RTX 4060
LAPTOP GPU, 8 GB):**
- 3D draw per captured frame (`§CAPTURE_PARTS draw3d`): p50 93 ms · p90 113 ms (first frame 884 ms). Each capture = 16 renders
  (`§MAXQ_FRAME_BUDGET taa=8 ao=8`) → ≈ 5.8 ms p50 / 7.1 ms p90 per render ≈ 170 / 140 fps-equivalent — an ESTIMATE of interactive headroom
  (assumes the 16 renders cost the same; AO/TAA passes differ; interactive navigation fps itself is still unmeasured).
- Drawn per frame (`§RENDER_INFO`, 60 samples): p50 1.03 M triangles, max 4.65 M; 135–210 draw calls.
- JS heap (`§NIGHT_MEM_WITNESS heapMB`): 3,462–3,808 MB ← high (see THRESHOLD below: the 4 GB figure is not a hard wall here). This is the real ceiling today, before
  GPU or speed — confirms streaming + eviction as the growth path.
- Whole bake frame incl. capture + encode (`§FRAME_COST`): p50 766 ms, p90 1,893 ms (offline film quality, not interactive).

**THRESHOLD — fitted from our own bake logs (2026-10-06; machine RTX 4060 laptop, 31 GB RAM, headless Chrome; heap = performance.memory
.usedJSHeapSize from §NIGHT_MEM_WITNESS):**
| building | elements | DB MB | geometry M verts | typical peak heap GB | logs |
|---|---|---|---|---|---|
| HHS_Office_Federated | 6,880 | 73 | 4.13 | 0.39–0.69 | 16 hhs_* bakes |
| Hospital | 63,415 | 251 | 13.5 | 2.10–2.64 (5.4–5.6 with clash / load-path films) | 23 Hospital_* bakes |
| JELAPANG road+bridge | 10,413 | 631 | 21.96 | 3.43–3.81 | 9 BIM_JELAPANG_* bakes |
Fit: **heap ≈ 0.173 GB per million vertices** (≈ 173 bytes/vertex resident; r = 0.997 over 3 buildings — few points, treat as indicative).
Heap tracks GEOMETRY, not element count (Hospital has 6× JELAPANG's elements but 60 % of its vertices and of its heap).
Thresholds (base model, before feature overhead): mobile ~0.6 GB (unverified per-tab figure) → ~4 M verts (≈ HHS size) · 4 GB → ~24 M
verts (≈ JELAPANG today) · 5.6 GB (highest seen here, no crash) → ~33 M verts. Feature overhead seen: up to +3 GB (Hospital clash /
load-path films). ⚠ Correction: the "~4 GB tab limit" is NOT a hard wall on this setup — Hospital bakes ran at 5.4–5.6 GB; the true
V8 ceiling here is unmeasured. Occlusion (dlod_nav OCCL, >20k elements) cuts DRAW cost, not memory → does not move this threshold; on an
open road little is occluded. What moves it: fewer vertices (weld/smooth the lamp poles — 7.6 M verts in 227 poles), and streaming +
eviction (memory follows the visible window). The partner set adds ~0.26 M verts (IfcOpenShell count) → negligible against the threshold.

### §IFC43 — what the partner set gives, the novel-art claim, and the IFC4.3 path (recorded 2026-10-06)
**What the files give:** the whole highway as a construction model — what is underneath (7,575 embankment piles 350 mm / 18 m / 750 kN,
1,338 soil nails, 228 horizontal drains, 4 RC walls), the earthworks body, slope protection (gabions), setting-out references (332 chainage
labels, right-of-way line) — one coordinate frame with road, bridge, drainage, lighting, signs. 4D can follow real road-building order,
clash can test piles/nails against drains, the film can show ground works normally never seen.
**Novel art (our claim, worded as a claim):** the data is poor — IFC2X3, every object IfcBuildingElementProxy, no alignment, no schedule;
meaning only in file names, psets and geometry. The compiler INFERS discipline (file name), route + chainage (geometry), phases and trade
order, junctions (signal psets), JKR sign codes, per-stretch quantities — and produces 4D, 5D quantities, clash, road checks and a narrated
film, local-first in one browser tab, no server, nothing hand-drawn, each step witnessed, uncertain items tagged SPECULATIVE. Positioning
line on record (FILM_NARRATION §10 Tier-1): incumbents create IFC but do not decompose / compile / verify the round trip. NOT measured:
no other product has been run on these files — state it as positioning, never as a test result. "No one has attempted this" is NOT a
claim we can make — see §PRIOR_ART for the citable wording.
**IFC4.3 (backward compatible) — less inference, more extraction.** MEASURED: the shipped parser (viewer/lib/web-ifc-api-iife.js, 6 MB)
carries the IFC4X3 ADD2 schema incl. IfcAlignment, IfcReferent, IfcRoad, IfcCourse, IfcKerb, IfcEarthworksFill, IfcPile,
IfcGeotechnicalStratum, IfcSign. NOT measured: an IFC4.3 road file through our importer (first test when one is in hand).
| inferred today (IFC2X3 proxies) | read directly in IFC4.3 |
|---|---|
| discipline from the file name (CIVIL_DISCS) | object class (IfcPile, IfcCourse, IfcKerb, IfcSign, IfcEarthworksFill) |
| route by principal axis of ROAD pieces; chainage = nearest route point / drawn-box start | IfcAlignment + IfcReferent stations — exact chainage |
| build order by inferred section (drive-order corr 0.30) | linear placement along the alignment — order by station |
| ground treatment from pset text ("PILE EMBANKMENT") | IfcPile attributes; geotechnical strata as objects |
| road / bridge / earthworks split by file | IfcRoad / IfcBridge / earthworks spatial structure |
Design rule when it lands: IFC4.3 classes/alignment FIRST, the IFC2X3 inference stays as the fallback (same owners: civilRoutePath,
civilDriveRoute, discFromFilename, SEQUENCE_CIVIL) — one route owner, two sources, never two pipelines.
**Lean-code reality (measured 2026-10-06, bim-ootb main):** viewer = 237 JS files, 157,098 lines (excl. lib/ and tests), 256 witnesses;
largest: effects.js 11,128 · time_machine.js 10,549 · cinema_maxq.js 5,339 · navigate_find.js 5,302 · cpe_load_path.js 4,675. It is NOT lean
today. The IFC4.3 path is a deletion opportunity (route inference, section filing, file-name discipline become thin fallbacks) — any refactor
must state lines +/− and keep every witness green (deletion budget, CLAUDE.md AD-LAYER rule 4 applies in spirit).
**Film script note (next version):** the narration names the achievement honestly — "this film was compiled from the messiest kind of IFC:
IFC2X3, every piece a generic proxy, meaning only in file names and properties; IFC4.3 brings alignment and real road classes — the same
compiler then reads instead of infers" — tag: [VALID] for the 2X3 facts, [SPECULATIVE] for 4.3 until a 4.3 file has been run.

