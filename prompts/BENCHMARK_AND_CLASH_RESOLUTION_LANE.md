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
