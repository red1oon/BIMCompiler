# ⚠ DO NOT REMOVE — Benchmark & Clash-Resolution Lane
**Scope:** (A) honest competitive benchmarks (ERP vs iDempiere, BIM vs Bonsai/IfcClash/Navisworks) and
(B) the clash → depth → resolution → cost pipeline that goes past Navisworks on *meaning*, not just geometry.
**Prime rule of this lane:** CREDIBILITY FIRST. Others can run our code; a single inflated number discredits the whole
suite. Every claim is **measured or labelled an estimate**. Where a competitor wins or ties, we SAY SO.
**Read the log after every run** (`build/erp/*.log`). Witness-or-it-didn't-happen.
**Target building for all BIM work this lane: `Terminal` (48,428 elements)** — NOT LTU. Disciplines: STR 34356 ·
MEP 9733 · ARC 2222 · FP 995 · ELEC 833 · ACMV 289.

---

## §0 What is already real (measured — do NOT re-derive, only re-target to Terminal)

**Pages built (bim-compiler/build/erp/):**
- `bench_suite.html` — ERP: continuous loop + housekeeping clock + pause/resume + iDempiere overlay. LIVE-capable.
- `bim_bench.html` — BIM: measured (clash, pick) + characterized (render/nav/save) cards, honest badges.

**ERP benchmark — three scenarios decided (educational):** Distributed (remote, network-bound) / Single-station
(localhost iDempiere — the fair fight) / Scale-out (10k tills, no server). NOTE: localhost iDempiere+Postgres exists at
`~/idempiere-dev-setup`; the localhost numbers are NOT yet measured (currently reference figures). Measuring them
SHRINKS our advantage to ~3–10× but makes it unimpeachable. That is the honest trade we chose.

**BIM clash — MEASURED on LTU 122k (re-run on Terminal):**
- Broadphase (SQL R-tree over stored bboxes): 4000 candidate pairs in **91ms**.
- Narrowphase boolean (three-mesh-bvh `intersectsGeometry`): **0.14ms/pair**.
- Rich verdict (+`closestPointToGeometry` for clearance+contact): **1.51ms/pair**.
- Of 4000 raw bbox candidates: **CLASH 2004 · NEAR-MISS(<50mm) 1321 · CLEAR 675**. bbox-only over-reports ~50%.
- Each CLASH/NEAR-MISS carries a **world contact point + measurement** (e.g. NEAR-MISS gap 29.4mm; CLASH sev 35/220mm).
- **Severity is a bbox-overlap PROXY** — NOT true mesh penetration depth. That is the one open accuracy gap.

**BIM pick — MEASURED on LTU 122k:** median **30ms**, min 15, **p100 671ms** (dense-ray tail; R184 BatchedMesh raycast
is unaccelerated). The feared "2s pick" was FALSE. Tail is fixable via bbox-prefilter (reuse the clash R-tree).

**Witness scripts (bim-compiler/scripts/):** `measure_pick.js`, `measure_narrowphase.js`, `measure_clash_rich.js`.
They drive the REAL viewer headless via Playwright (`~/bim-ootb/tests/node_modules/@playwright/test`), server root
`/home/red1`, viewer URL `…/viewer.html?db=…_extracted.db&lib=…_geo.db&bld=…`. **Re-target db/lib to Terminal.**

**Bonsai investigation (DONE — facts, not assumptions; from `~/IfcOpenShell/src`):**
- Their clash = IfcClash: tessellates EVERY element first (the bottleneck), per-element triangle BVH + OBB, then true
  narrowphase (Möller tri-tri, ray-protrusion depth, protrusion/pierce/clearance modes). Multithreaded C++. No
  published large-model timing. Source: `src/ifcclash/ifcclash/ifcclash.py`, `src/ifcgeom/.../IfcGeomTree.h`,
  `clash_utils.cpp`.
- The `federation/clash/detector.py` SQLite-R-tree bbox detector is **OURS** (red1oon), not canonical Bonsai.
- Render = one Blender object per element (depsgraph cost is fundamental; warns+gates >30k; ships `LoadLinkedProject`
  chunked viewing mode = architecturally OUR approach). Save = full SPF `.ifc` rewrite O(model) every save (portable —
  THEY WIN here).

---

## §1 Honest-benchmark doctrine (enforce on every card)
1. **Measured ≠ estimated ≠ characterized.** Green badge = a witness script produced it on this machine. Yellow =
   read both codebases, described honestly, no number shown. Never dress an estimate as a measurement.
2. **Fair baseline.** Compare against the path the competitor RECOMMENDS for the size (Bonsai's `LoadLinkedProject`
   for 48k, not the default it refuses >30k). Localhost iDempiere, not a remote strawman.
3. **Facts, not verdicts (user decree).** DROP win/lose/tie tags from the pages. Present our-number / their-number /
   what-each-computes side by side; the reader judges. A page that scores itself reads as marketing.
4. **Name every loss.** Save portability (Bonsai), exact penetration depth (IfcClash, until §3 lands), federated
   scale + workflow maturity (Navisworks). Stated plainly = the thing that makes the wins believable.
5. **Re-runnable.** Every measured number traces to a named repo script. Footer: "run it yourself; correct us."

---

## §2 Phase A — finish the benchmarks (measure what's still estimated)
- **A1 — IfcClash head-to-head on Terminal.** We HAVE ifcclash (`~/IfcOpenShell/src/ifcclash`). Run a real 2-discipline
  clash (e.g. MEP vs STR) on Terminal's IFC, time it end-to-end (incl. tessellation, which they pay every run).
  Witness `W-IFCCLASH-TERMINAL`: real seconds. Replaces the "tens of seconds" estimate. **This is the most important
  missing number** — it's the apples-to-apples that proves "same verdict, less work."
- **A2 — localhost iDempiere throughput.** Boot `~/idempiere-dev-setup` + Postgres, measure interactive ops/sec and a
  10k-record batch. Witness `W-IDMP-LOCALHOST`. Feed real numbers into `bench_suite.html` Single-station scenario.
- **A3 — re-run BIM measures on Terminal** (pick, clash rich) so `bim_bench.html` shows Terminal not LTU. Re-target
  the three `measure_*.js` scripts' db/lib URLs.
- **A4 — facts-only restyle** of both pages per §1.3 (drop verdict tags).

## §3 Phase B — true penetration depth + classification (close the one gap)
Spec: for an intersecting pair, compute real overlap, not the bbox proxy.
- **Method:** collect penetrating vertices of A inside B (point-in-mesh via raycast parity check), closest-point each
  to B's surface → max = protrusion depth + its direction (the contact normal). If A-in-B AND B-in-A → **pierce**;
  one-sided → **protrusion**. (three-mesh-bvh `shapecast`/`bvhcast` to collect intersecting tris; `closestPointToGeometry`
  for the per-vertex distance.)
- **Output per clash:** `{depth_mm, type: protrusion|pierce, normal:[x,y,z], contactPoint:[world]}` — MATCHES IfcClash.
- **Witness `W-PENETRATION-DEPTH`:** on Terminal, N intersecting pairs → depth+type+normal, sample logged; cross-check a
  few against IfcClash's reported depth (from A1) to within tolerance — **this is the parity proof.**
- **Measure `per-pair depth cost`** (est. 10–50ms) — `W-DEPTH-COST`. Grounds the lazy-reveal budget below.
- **NON-INVENT:** if a pair's geometry won't load, report honestly (skip), never fabricate a depth.

## §4 Phase C — mid-flight correction (the honesty made visible — centerpiece)
The clash LIST uses the cheap proxy (bbox severity), which can be wrong. On TAP:
- camera flies toward the clash (existing `focusElement`, ~500ms);
- DURING the flight, compute true depth (§3) in the background (~10–50ms, finishes first);
- **if exact disagrees with proxy** (proxy said clash, geometry says ≥clearance) → **interrupt the flight, flash
  `NOT A CLASH · Nmm clear`**, demote the row. If confirmed → land + show `pierce/protrusion · Nmm`.
- **Witness `W-MIDFLIGHT-CORRECT`:** a seeded proxy-false-positive on Terminal triggers the live demotion; §-log the
  interrupt + the corrected verdict. (This feature EXISTS to show we correct ourselves — no competitor does.)

### §4a — two user-directed additions (2026-07-26, not yet built, fold into whichever session lands §4)
1. **Persist the qualified verdict, not just correct it in the moment.** §4 as written re-derives the true-depth
   verdict live every time a pair is tapped — nothing carries it forward. Once a pair is qualified (exact depth
   computed, `CLASH`/`CLEAR`/`pierce`/`protrusion` decided), cache it keyed on the pair (both element GUIDs +
   their transform state, so a later MOVE correctly invalidates a stale verdict — don't cache on GUID pair alone).
   On Save, persist that cache into the saved `.db` (new table, e.g. `clash_verdicts(guid_a, guid_b, transform_hash,
   verdict, depth_mm, type, checked_at)`) so a **future re-open of the same building starts pre-qualified** — the
   list can show the true verdict immediately for any pair whose transforms haven't changed since last qualified,
   without re-flying/re-computing. Falls back to the cheap bbox proxy for any pair not yet in the cache (new
   pairs, or pairs whose `transform_hash` changed since caching — moved elements ARE genuinely stale and must
   re-qualify, never trust an invalidated cache entry). This is the natural next step after §7's in-session
   incremental reclash — same idea, extended across sessions via the DB instead of just across edits in one.
2. **An explicit "Fine Mesh" button, alongside the implicit tap-and-fly trigger.** §4's mechanism is opportunistic
   (the depth compute rides inside camera-fly time the user is already spending) — good for browsing one clash at
   a time, but there's no way to deliberately run the deep check without flying to each candidate individually.
   Add a button that runs §3's true-depth pass **on demand** — over the current filtered list, or a selection —
   without requiring a camera fly per pair. Reuses the exact same §3 depth math and §4a-1's cache (a button-run
   qualification should write to the SAME cache table, not a separate path) — this is a second trigger for the
   same underlying computation, not a new feature to design from scratch.

## §5 Phase D — edit-impact resolution + play-button alternatives
The depth normal (§3) IS the minimum translation vector to clear. So resolution is free:
- **Auto-calc** the clearing move: translate A by `(depth+clearance)` along the contact normal. Enumerate alternatives:
  move-A / move-B / along each principal axis / shift+small-rotate. Each is a known vector.
- **`>` play button** animates the affected element incrementally to the resolved pose (physical demonstration);
  **press again → next alternative** (different direction/angle), cycling all options to "play around" solutions.
- **Affected-join coloring:** elements rigidly connected to the moved one recolor/shift (reuse incremental reclash §7).
- **Witness `W-EDIT-RESOLVE-PLAY`:** tap clash → N alternatives computed (vectors logged) → play animates pose 0→1 →
  replay cycles to alt 2; affected joins recolored. §-log the alternative vectors + the post-move re-clash (should be 0).
- **Practicality CONFIRMED:** resolution vectors derive from depth math (§3) — no separate solver needed.

## §6 Phase E — semantic "practical clash" rules (the real Navisworks-beater)
Generic geometric clash over-reports things engineers don't care about (a switch embedded in a wall is FINE). Our data
model (discipline + IFC class + R-tree proximity) expresses domain exemptions naturally:
- Rule shape: `{a: ELEC/IfcOutlet, b: ARC/IfcWall, verdict: OK}` UNLESS `{within: Xmm of FP/water-pipe}` → flag.
- This is a SOFT/RULE clash layer on top of the geometric verdict — extract meaning, don't just compute geometry
  (the same thesis as the ERP side: the rules live in data, folded, not hardcoded).
- Terminal has ELEC (833) + FP (995) — the switch-near-water example is REAL on this building.
- **Witness `W-PRACTICAL-CLASH`:** ELEC-in-ARC pairs auto-exempted; an ELEC element within Xmm of an FP pipe re-flagged.
  §-log the exemption count + the re-flagged proximity cases.
- **NON-INVENT:** rules are explicit + user-editable, never silently invented; show the rule that fired.

## §7 Phase F — incremental reclash + 4D/5D workmanship costing (where we pass Navisworks on consequence)
- **Incremental reclash:** the SQL R-tree persists, so after an edit re-test ONLY the moved element's neighbours
  (not the whole model). Witness `W-RECLASH-INCREMENTAL`: move 1 element → only K neighbours retested, ms ≪ full run.
- **4D/5D workmanship cost:** clash/resolution → affected joins → shift labour + material → schedule delta, reusing the
  existing timeline (TM lane) + finance fold. Witness `W-CLASH-COST-4D5D`: a resolved clash emits a cost+schedule delta.
- **Honest scope:** to our knowledge the integrated clash→cost→4D loop is rare/unique (Navisworks does 4D TimeLiner,
  NOT 5D workmanship cost — that's a separate tool). State "to our knowledge", not "nobody has."

## §8 Landing into the live viewer (worktree discipline)
The measure scripts PROVE the logic; production code goes into `~/bim-ootb/viewer/` (`clash_matrix.js`, `measure.js`,
`picking.js`) via a **worktree** (shared-tree hook blocks direct edits — `/tmp/wt-*`, PR to main, witness, verify live).
- **Integration design (decided):** matrix overview stays BROADPHASE (instant, labelled "potential"); the LIST runs the
  rich verdict per-cell on click; penetration depth + resolution computed lazily ON TAP (§4). Never compute depth for
  all pairs up front. Pick tail fix = bbox-prefilter reusing the clash R-tree.
- Modeller serves from bim-ootb main + GH-Pages → branch work isn't live until merged.

## §9 Witness ledger (prove before claiming)
`W-IFCCLASH-TERMINAL` · `W-IDMP-LOCALHOST` · `W-PENETRATION-DEPTH` (+parity-vs-IfcClash) · `W-DEPTH-COST` ·
`W-MIDFLIGHT-CORRECT` · `W-EDIT-RESOLVE-PLAY` · `W-PRACTICAL-CLASH` · `W-RECLASH-INCREMENTAL` · `W-CLASH-COST-4D5D`.

## §10 File map
- Pages: `build/erp/bench_suite.html`, `build/erp/bim_bench.html`
- Measure scripts: `scripts/measure_pick.js`, `scripts/measure_narrowphase.js`, `scripts/measure_clash_rich.js`
- Logs: `build/erp/measure_*.log`
- Viewer (land via worktree): `~/bim-ootb/viewer/{clash_matrix,measure,picking,streaming,scene,dlod}.js`
- Geometry data: `element_instances`(guid→geometry_hash), `element_transforms`(center+rotation Euler+bbox),
  `component_geometries`(hash→vertices/faces/normals blobs). World transform: `ifc2three(center)` +
  euler`(rotX,rotZ,-rotY)` + unit scale (see `streaming.js:835-840`). BVH: three-mesh-bvh@0.8.0, `geo.boundsTree`.
- Bonsai/IfcClash source: `~/IfcOpenShell/src/{bonsai,ifcclash,ifcgeom}`. iDempiere: `~/idempiere-dev-setup`.
- Button placement (when pages final): "Benchmark Comparison" in Cross-ERP HTML + MigrateComparison.

## §11 Open questions to RESOLVE BY MEASURING (not guessing)
1. Real IfcClash time on Terminal 2-disc (A1) — the headline head-to-head number.
2. Real per-pair penetration-depth cost (B/`W-DEPTH-COST`) — confirms the ~500ms flight hides it (C).
3. Does our depth match IfcClash's depth within tolerance? (B parity proof) — if not, investigate before claiming parity.
4. Localhost iDempiere ops/sec + 10k batch (A2) — sets the honest Single-station ratio.


---

## §BROWSER_SCALE_AND_CLAIMS — one-tab local-first: claims we can cite, how big we are, how we grow (moved from CIVIL_HIGHWAY_JELAPANG.md, 2026-10-06)
Same lane rule: CREDIBILITY FIRST — measured or labelled estimate; research-agent findings marked UNVERIFIED where so. Feeds the planned
public developer doc (scale chart) and the film's Chapter 0 claim card (FILM_NARRATION.md §11.next).

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

