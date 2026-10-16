# RESUME — Modeller UX: Outliner-as-Find + disc-click-walks + pill redesign (NEW SESSION spec)

```
# ⚠ DO NOT REMOVE
SCOPE: Re-shape the MODELLER's UX around ONE coherent surface — the Outliner is the PRIMARY drop surface,
following the Find-panel strategy, with ARC leading (bom-graph-derived Storey/Room) and each Discipline a
WALKER (click a disc → RouteWalk it). Remove the redundant old drop panel. Redesign the bottom-right pill
rail with the right verbs (Open/Save/World-History/UserGuide/3D-Grid…). This is UX/wiring over engines that
are ALREADY built + witnessed (rooms/storeys qualify, cross_edges, STR walk). Do NOT rebuild the engines.
INVARIANTS: modeller stays ISOLATED from the viewer (§101 Drift Law — modeller-only files + ../modeller/ GH
hosting, never OCI/viewer). WITNESS-FIRST (§-log + a node/headless witness per claim). NON-INVENT. Reuse the
viewer's Find pattern + DLOD, don't rebuild. Read the §-log after every run. prompts/ is gitignored (local).
⚠ ORPHAN-TRAP: the repo AUTO-MERGES PRs (bot) on CI green. Push EVERYTHING before opening the PR; NEVER push a
2nd commit to an auto-merge-armed branch (it gets squashed-out → orphaned; happened on #542, recovered in #543).
ANCHORS: Modeller/DISC_Walker/RESUME_MODELLER_WALK_SUBSTRATE.md (the substrate/engines handoff) · SPATIAL_DEPENDENCY_GRAPH.md ·
memory project_modeller_vision_lock + project_walker_guards_rosettastone + feedback_no_admin_questions.
```

## ✅ STATUS (session 2026-06-26/27 — bim-ootb, merged to main)
- **W-UX-1/2/3 ✅ DONE — PR #546 MERGED** (sw n/a, modeller scripts ?v-bumped). Pill **Open** (chooser of the
  4 residents + local-.db door → shipped `openResident`/`openStrDb`; `window.SQL` now inited at boot for the
  Open path). Old top-left drop panels REMOVED (str_walker ▾/🏗 + bom_tree 📂). ARC LEADS by default (bomtree+
  strwalk register on every load, no flag; TREE cats render above flat op-log groups). Witness W-UX-PILL 12/12.
- **W-UX-4 ✅ DONE — PR #546.** Disc = walker: discipline node clickable (data-disc + ▶), `window.discWalk`
  dispatch — STR surfaces the real walk + expands STR tab; MEP/etc → RouteWalker when anchored else HONEST
  refusal (SampleCastle MEP → no anchors → refuse, 0 fabricated). Witness W-UX-DISC 8/8.
- **W-UX-5 ✅ DONE — PR #546.** NEW **Guide** pill (#b-guide) = self-contained modeller user-guide overlay.
  Grid (#b-grid)/Export-IFC (#b-ifc)/History (#hist) ALREADY shipped as pills/surfaces; Save = auto-persisted
  signed op-log. Witness W-UX-VERBS 9/9.
- **W-UX-6 Phase 1 ✅ DONE — PR #547 MERGED.** ⇄ adjacency lens (engine fork = **JS-derive on-the-fly**, user
  chose). #bo-adj toggle → select element highlights its derived `abuts` neighbours, reads window.swXEdges
  (pristine, not baked). Witness W-UX-XEDGE (parity: highlight set == derived map).
- **W-UX-6 Phase 2 ✅ DONE — PR #548 MERGED.** Full SDG JS-derived: cross_edges `deriveDatumsAnchored`/
  `deriveSpans` (JS ports of extractIFCtoDB) + `readFillsHost`/`readAggregates` (recovered IFC reads) +
  `deriveAll`. Lens now multi-edge: element↔element **⇄ abuts · ⌂ fills · ⧉ aggregates** highlight + per-kind
  badges; element↔datum **⊥ anchored · ↕ spans** annotate the selected row. **W-SDG-JS-PARITY 18/18** (JS ==
  Python at float64; edge set/datum ids/spans EXACT, anchored offsets ≤1µm — sub-µm float-accum + datum-centered
  sign only). Oracle = `tests/fixtures/sdg_oracle_float64.json.gz` (Python on a float64 elements_rtree; the
  residents' baked rel_* use the SQLite rtree's **float32** coords → NOT a valid float64 oracle). W-UX-XEDGE 10/10.
  ⚠ KEY LESSON: the modeller renders from `element_transforms` (center±bbox/2, float64); the baked rel_* tables
  used the rtree (float32) → they differ; derive from element_transforms for parity with what's rendered.
- **W-VIEWER-BOM-DEPRECATE ✅ DONE (user-confirmed 2026-06-27)** — the Red Pill is GONE from the viewer's main
  pill rail; BOM relegated to the Modeller. Non-issue, no further action.
- **✅ THIS RESUME IS FULLY DRAINED — W-UX 1–6 + viewer-BOM-deprecate all DONE.** Merged: bim-ootb PR #546
  (W-UX-1..5), #547 (W-UX-6 P1), #548 (W-UX-6 P2). All witness-first, shared main fast-forwarded, 0 unpushed.

## ▶ 2026-07-30 — ARCH CALL (b) MADE (Sonnet, dispatched per MODELLER_MASTER.md §OPEN LIST row 5):
## 3-SURFACE UNIFICATION = UNIFY INCREMENTALLY, six slices, via the already-proven §ONE-DISC-TAB wrap
**Verdict: the ONE-PANEL doctrine (VISION-LOCK sentence 5) stands — it is already ~80% structurally true
(one `#bonsai-outliner`, one `_categories` registry, one shared eye/filter/virtualization/group-select
engine). The real violation is STR being represented TWICE (bomtree's own STR disc node AND the separate
`strwalk` dashboard category), plus `disctrunk` still un-merged. Do NOT attempt a single rewrite.**
- What the STR tab renders that the tree can't yet express: a live diagnostic dashboard
  (`str_walker_outliner.js:71-122` — grid/columns, girders + RED/ORANGE/GREEN, confidence mean + top-6
  low-confidence, geomap audit top-6, live exceptions log fed by the `GM.commit` wrap `:693-741`).
- The proof the merge is absorbable already SHIPPED: `modeller.html:4560-4605` `§ONE-DISC-TAB` spliced the
  disc roster into `bomtree.tree()` via a non-invasive `origTree`/`origOnWalk` wrap with dedup — zero
  edits to `bom_tree_outliner.js`.
- **Ordered slices (each independently shippable + witnessed):** 1 merge `disctrunk` (W-ONE-DISC-TRUNK) →
  2 merge STR static summary rows under the STR disc node (W-STR-SUMMARY-MERGE; ⚠ repoint
  `discWalk('STR')`'s hardcoded `tcat|strwalk` at `modeller.html:3475` or it dead-ends) → 3 confidence
  rows (NaN-guard `bonsai_outliner.js:739`; §OLGROUPSELECT must not zoom non-fid rows) → 4 geomap-audit
  rows → 5 live exceptions log (⚠ highest risk: re-folded with the FULL tree on every grid-drag
  `refresh()` — witness must measure grid-drag→refresh ms at Terminal scale, not just correctness) →
  6 retire the `strwalk` registration, keep the engine (mirror W-UX-2's keep-engine/drop-registration).
- Risks named: disc-click double-binding (slice 2), §V3 auto-expand of deeper diagnostic rows,
  §V4a windowing budget competition at Terminal scale.
- **User decision: none load-bearing** — only a sequencing option (defer slices 3-5's Terminal perf risk
  until after the 🟥 grid-lock crux below, if preferred). Slices 1-2 can start today.

## 🟥 NEXT SESSION — SERIOUS-WEIGHT HARD PROBLEM: GRID-LOCK TO ARC/STR (user-flagged 2026-06-27)
**This is the load-bearing crux — treat it as HEAVY, not a tidy-up.** Evidence (re-run `node scripts/witness_walkback_str.js`, W-WALKBACK-STR 5/5):
- The Terminal STR walk's **column RMSE = 0.104 m IS the grid-lock RESIDUAL**, and it is the **BASELINE / PRE-EDIT walk** (swbInit fresh; NO `GEOM_GRID_MOVE`/`swbReplay` in the witness). So ~10 cm of looseness exists *before* any user edit — every grid drag inherits it.
- WHY HEAVY: the grid **EMERGES from face cadence** (datum clustering tol 0.05 m), it is a **statistical fit, NOT the authored grid**. Columns are *snapped to* that emergent grid (`provenance: derived:grid`), so the snap residual = the RMSE. Only ~**71.5% of real beams lie on the emergent grid** (separate measure in the witness). Real ARC/STR carry offsets/tolerances/non-orthogonality the cadence fit can't perfectly recover.
- WHY IT MATTERS DOWNSTREAM: the grid is the **primary editing handle** (VISION-LOCK: stretch≠scale). A 10 cm-loose base grid means: (a) the pristine-drop RosettaStone (item #1) can't hit 0.000 mm *through the grid*; (b) the forward fold (item #3, move-datum→anchored-ride/spans-stretch) propagates that residual into every cascaded element. **Tightening grid-lock is a PREREQUISITE for both, not parallel to them.**
- THE ASK (user): give this serious weight in a NEW session — scope it as its own hard investigation, not a quick pass. Likely threads: emergent-datum vs authored-grid reconciliation; per-axis tol/cadence tuning measured (don't whitelist); separating "grid residual" from "element-off-grid by design"; deciding whether columns should snap-to-grid at all vs carry a measured offset (rel_anchored already stores the signed offset — the residual is RECOVERABLE, not lost). Validate against exact-landing (RosettaStone), never assume the grid is the answer (it's a HYPOTHESIS — main-mission landmine).

### 🟧 ROOF PLATES — decision (user 2026-06-27)
Today plates are GENERATIVE/count-only in W-WALKBACK-STR (predicted 33753 vs extracted 33324 = 1.29% count-err;
positions explicitly NOT claimed bit-exact, spec §5). User lean (agreed): the plate **markers are a CLEAR repeating
pattern**, so **WALK THEM PER-ELEMENT on the measured pattern** (lands toward pristine; RosettaStone-able to the real
33 324) rather than collapse to a single 'roof' piece (= lossy, can't round-trip). Keep **'roof-as-single-piece' as the
explicit FALLBACK** only when a building's plates are irregular/non-arrayed (then REFUSE per-element + represent as one
roof surface, never fabricate a fake array). **ACCEPTANCE (user 2026-06-27): the 1.3% plate count-err is FINE —
the gate is POSITIONAL CORRECTNESS (each plate in the right location, NOT metres away), not exact count.** So the
per-element walker's pass-bar = position-RMSE small (sub-bay / sub-metre), count within a few % is acceptable.
KEY TIE-IN: 33 324 plate faces on a clean pattern are a large regular
**cadence source → they can TIGHTEN grid-lock**, not fight it — plates-as-pattern and the grid-lock crux are the SAME
measurement. NOT yet verified numerically (one-shot: measure plate-centre spacing for array-uniformity before building
the per-element walker). "more tooling later" (user). Don't whitelist 'roof' by class — MEASURE the pattern.

### 🟦 APPROVED BIG PROGRAM (own prompt): Terminal rule-mining en masse → `prompts/Modeller/DISC_Walker/RESUME_TERMINAL_RULE_MINING.md`
User approved (2026-06-27) a multi-agent workflow to MINE measured placement+routing+place-order/avoidance rules
from Terminal (all disciplines: PLB/ACMV/FP/ELEC/STR/roof) into `terminal_rules.db`, feeding ALL discipline
walkers (supersedes #2 below — the MEP walker gets its recipes from this). Scope=all en masse; ~14 agents.
Launch via the Workflow tool next session (opt-in given). This is the headline NEW build.

Other open items: #1 ARC geometric drop + RosettaStone · #2 MEP walker on any building (now FED BY the Terminal
rule-mining program above) · #3 forward fold over live cross-edges · #4 STR confidence 3D render · #5 backprop/
ORANGE gate · 🟥 grid-lock-to-ARC/STR (hard crux above). This UX prompt is closed.

### 🟦 WORLD HISTORY wiring (low-pri, 4 steps, handed off 2026-06-27)
The scope block listed **World-History** as a desired pill verb but W-UX-5 only shipped the local op-log scrubber.
Design settled (user-confirmed):
- **Canvas edits → NOT new dots.** `bonsai_oplog.js` signed op-log steps ARE the modeller's Z equivalent — no
  separate dot-bar needed. The existing scrubber covers it.
- **Building open → ONE W card.** Each `openResident`/`openStrDb` call fires ONE `WholeHistory.record(...)`,
  `kind:'op'`, `ref:{building, db}` — same pattern as viewer's `BUILDING_OPEN` mirror. W stays sparse.
  The dedup fix (PR #554, `whole_history.js`) means same-building reopens within a day advance `ts` not stack.
Four wiring steps when prioritised:
1. Add `<script src="../common/whole_history.js?v=4" onerror="...">` to `modeller.html`
2. `WholeHistory.mount({ page:'modeller', rootPrefix:'../', launcher:false })` at boot
3. `WholeHistory.record({ page:'modeller', kind:'op', label:'Opened '+name, ref:{building, db} })` inside
   `openResident`/`openStrDb` on success
4. Wire a **W pill** in the pill rail to `WholeHistory.open()`
Read before starting: `prompts/RESUME_WORLD_HISTORY_DEDUP_RESTORE.md` (dedup contract) +
`prompts/HISTORY_SESSION_EVENTS.md §LANE PARTITION` (modeller follows viewer lane — W only, no fork/refold).
- Witness runner: `cd ~/bim-ootb/tests && NODE_PATH=~/bim-ootb/tests/node_modules node witness_modeller_*.js`
  (serve viewer/ + map /modeller/ → repo modeller/ for the resident DBs). audit_specs.js exits 1 on PRE-EXISTING
  unrelated `38-sh-dx-2d-runtime.spec.js` debt (identical on origin/main) — this work added zero new violations.

## THE VISION (user, 2026-06-26 — verbatim intent, structured)
> "See the Outliner following the Find panel strategy with ARC leading the way with bomgraph-derived
> Storey/Room. Disc of course is our walker (a click on it will RouteWalk respectively). The old drop panel
> is thus redundant, should be removed. Pill should have Open (load the 4), Save/Export, World/History,
> (Modeller)UserGuide, 3D Grid, etc icons."

Decoded into the target UX:
1. **The Outliner IS the surface** — one panel, Find-panel faceted-lens strategy (like the viewer's
   `navigate_find.js`, but the modeller's own `bonsai_outliner.js`). The 3D canvas is the spatial mirror.
2. **ARC leads** — the lead view is the bom-graph CONTAINMENT TREE: Building → **Storey → Room** (now REAL,
   door+AABB-qualified) → disc → class → element. This is the default/primary category.
3. **Disc = walker** — each Discipline node is an ACTION: click STR → STR walk (swbInit); click MEP → RouteWalk
   (RouteWalker); etc. "A click on it will RouteWalk respectively." The disc is not just a group — it's the
   entry point to that discipline's walker.
4. **Remove the old drop panel** — the fixed top-left `▾ resident` picker + `🏗` local-file button (built in
   `str_walker_outliner.js mountButton`) is redundant once the pill's **Open** loads the 4 residents.
5. **Pill rail verbs** — the bottom-right glass pill rail (`#m-help-panel` registry already exists) gets:
   **Open** (load the 4 residents = SampleHouse/Duplex/SampleCastle/Terminal), **Save/Export**, **World/History**,
   **(Modeller) UserGuide**, **3D Grid**, … (icon-only glass pills, name in the ? Help registry).

## ALREADY SHIPPED (engines done — this spec is UX OVER them; don't rebuild)
- **Residents on isolated GH** (PR #542 merged): loader reads `../modeller/<db>?v=N` (zero OCI); Terminal via LFS
  (meta = Pages blob, geo = LFS media endpoint). `_modellerBase()`, RESIDENTS[] with `v` cache-bust.
- **Rooms/storeys SOLVED** (PR #543): `bom_tree.seedFromDb` qualifies by **door-opening + habitable-AABB** —
  storey w/ ≥1 door = habitable, door-less = LAYER ("· layer"); room = IfcSpace on a habitable storey, height
  ≥1.8m; empty-but-real rooms materialized. Extractor enhanced (IfcSpace footprint AABB + native element bbox).
  REAL rooms: SH 3 / DX 20 / SC ~99, foundation+roof = layers. W-ROOM-STOREY-QUALIFY 6/6.
- **Cross-edges slice 1** (PR #543): `cross_edges.js deriveAdjacency` — typed `abuts` (face-touch) derived
  on-the-fly from the bbox substrate (sweep-and-prune, scales 48k); JS == witnessed Python edge-for-edge
  (W-CROSS-EDGES-ABUTS 5/5). Derived on Open → `window.swXEdges` + §-logged. **NOT YET RENDERED** on the backbone.
- **STR walk** (live): `swbInit` auto-picks column-framed vs wall-bearing; guards + calibrated confidence; the
  STR Walker category renders grid/cols/girders + RED/ORANGE/GREEN + low-confidence highlight.

## CURRENT UI — GROUNDING (what exists, exact files/ids; verify before editing)
- `viewer/modeller.html` — the page. Has: bottom-right **wrapping pill rail** (CSS ~line 25, the toolbar
  buttons `#b-home/b-fit/b-view/b-grid/b-gridmove/b-move/b-sketch/b-cut/b-route/b-insert/b-ifc/b-del…`),
  the **? Help pill registry** `#m-help-panel` (built from the live toolbar — every tool's icon+name),
  the collapsible **Outliner** `#bonsai-outliner` (left), the **Insert panel** `#ins-panel` (BOM catalog).
- `viewer/bonsai_outliner.js` — the modeller's "richer Find". CATEGORY-DRIVEN + REGISTERED (`addCategory(cat)`),
  has a **find box** (`#bo-find`) filtering across categories, FLAT categories (op-log groups: Walls/Openings)
  + **TREE categories** (`cat.tree()` → deep seeded editable nodes — the BOM-graph path). `_paint()` renders.
  ⇒ The Find-panel strategy is ALREADY the architecture; this spec leans into it (ARC tree as lead category).
- `viewer/bom_tree.js` + `bom_tree_outliner.js` — the bom-graph engine + its outliner category. `seedFromDb`
  builds Building→Storey→Room→disc→class→element with the door/AABB qualification. Registered as a tree category.
- `viewer/str_walker_outliner.js` — STR Walker category + **the OLD DROP PANEL** (`mountButton`: the fixed
  `▾ strwalk-resident` picker @ top:8px left:336px + `🏗 strwalk-open` @ left:486px + hidden file input). ALSO
  holds `openResident(res)` (fetch ../modeller/<db>?v → IDB cache → walk) + `_openBuffer` (swbInit + bom-graph
  seed + cross-edge derive). **Keep `openResident`/`_openBuffer`; REMOVE `mountButton`'s DOM; re-home Open to pill.**
- `viewer/routewalker.js` — the MEP RouteWalker (anchor-dependent; works on mined buildings, 0 on Terminal —
  see substrate handoff §0; the fix is ARC-derived anchors, a SEPARATE engine task, NOT this UX spec).
- `viewer/sw.js` — precache list + CACHE_VERSION (bump on every deploy; conflict magnet, KEEP-BOTH on merge).

## WORK ITEMS (bounded, one per session-slice, witness-first; rough order)
**W-UX-1 — Pill: Open (load the 4).** Add a pill button **Open** → opens a small chooser of the 4 residents
(reuse RESIDENTS[] from `str_walker_outliner.js` — export it / move to a shared const) → calls the existing
`openResident(res)`. Icon-only glass pill + ? Help registry row. Witness: headless click Open → pick SampleHouse
→ `§STRWALK-OPEN` + bom-graph seeded + walk ready (§-log assert). KEEP local-file open reachable (drag-drop or a
secondary "Open file"), since the 🏗 path is the dev/arbitrary-DB door.

**W-UX-2 — Remove the old drop panel.** Delete `mountButton`'s `▾`/`🏗` DOM (and its top-left CSS). Ensure
nothing else references `#strwalk-resident`/`#strwalk-open`. Witness: modeller loads with NO top-left controls;
Open (pill) still loads residents; `audit_specs.js` exits 0; no console LOAD_FAIL.

**W-UX-3 — ARC leads: bom-graph as the primary/default Outliner view.** Make the containment tree (Storey→Room
→disc→class→element) the LEAD category (top, expanded by default on Open). Confirm Storey/Room come from the
qualified `seedFromDb` (real rooms, layers labelled "· layer"). Find box filters across it (Find-panel strategy).
Witness: open SampleHouse → Outliner shows Ground Floor ▸ 3 rooms (Living/Bedroom/Entrance) + Roof "· layer";
Duplex → Level 1/2 + foundation/roof layers; find "bed" narrows. (Reuse W-BOM-GRAPH / W-ROOM-STOREY-QUALIFY.)

**W-UX-4 — Disc = walker (click a disc → RouteWalk respectively).** A discipline node under a storey/room is an
ACTION: click **STR** → STR walk (swbInit already wired); click **MEP/FP/SP/…** → RouteWalk that disc
(RouteWalker) over the substrate; surface the walked result (segments/skeleton + guards/confidence) back into
the Outliner under that disc + mirror in 3D. ⚠ RouteWalker is anchor-dependent (0 on Terminal) — scope this to
the disciplines/buildings where it walks (Duplex/Revit_MEP); for a disc that can't walk yet, show an honest
"no walk (no anchors)" instead of fabricating. Witness: click STR on SampleCastle → column-framed walk renders;
click a MEP disc on Duplex → RouteWalk segments §-logged; a no-anchor disc → honest refusal, no invented run.

**W-UX-5 — Pill: Save/Export, World/History, UserGuide, 3D Grid.**
- **Save/Export** — export the signed op-log / edited mo_<key> instance (+ optionally an IFC via `bonsai_ifc.js`).
  Reuse the existing op-log (`bonsai_oplog.js`) + IFC export; don't invent a format.
- **World/History** — the op-log history view (undo/redo timeline — "both folds of one log"); likely reuse the
  ERP/TM history pattern. Decide: in-pill toggle vs a panel.
- **(Modeller) UserGuide** — a modeller-specific guide surface (the ERPUserGuide/docs pattern); link or overlay.
- **3D Grid** — surface the construction grid toggle (`bonsai_grid.js` / `#b-grid` is currently disabled) as a
  pill icon: show/hide the 3D grid datums (the grid is the PRIMARY handle per VISION-LOCK; stretch≠scale).
Witness each: §-log + headless click asserts the action fires (export produces bytes; history toggles; guide
opens; grid toggles visible datums).

**W-UX-6 (render, the graph half) — cross-edges Find-style ON the backbone.** Render `window.swXEdges.abuts`
(+ later edges) on the containment tree like Find (e.g. select an element → highlight its abuts neighbours;
a "⇄ adjacency" lens). Engine + derive already done; this is the VISUAL half. ⚖ STRATEGY FORK for the user:
**derive the other 4 edges on-the-fly in JS (pristine substrate, like abuts) vs consume the edge tables now
BAKED into the re-extracted residents (rel_adjacency/anchored/spans/fills_host/aggregates).** Ask before building.

## W-VIEWER-BOM-DEPRECATE — make the VIEWER truly BOM-free (user decision 2026-06-26: "deprecate Doc-pill BOM use too")
**Doctrine (user):** the viewer carries NO BOM — all BOM/modelling lives on the Modeller side. "Red Pill is
retired, relegated to Modeller.3DGrid." The viewer's BOM stack is OLD effort — learn from it (patterns for the
Modeller), then remove it from the viewer.

**Exact surface (audited 2026-06-26, all PRE-EXISTING, none from the rooms/cross-edge work):**
- `viewer/viewer.html` loads **9 BOM scripts** (lines ~861-871): `bom_extract.js`, `bom_walker.js`,
  `bom_engine/{bom_strategies,bom_constraints,bom_diff,bom_node,bom_tree,bom_grid,bom_rules}.js`.
  ⚠ `viewer/bom_engine/bom_tree.js` is the VIEWER's own copy — DISTINCT from `viewer/bom_tree.js` (the modeller's,
  which the rooms work changed). Don't confuse them.
- **SOLE consumer = the Doc pill** (`viewer/doc_canvas.js`, loaded by viewer.html:875 — "envelope wireframe +
  fresh 2D grid + Gantt stepper"). Nothing in main.js/scene.js/navigate_find touches BOM.
- **The Doc pill is BOM-FOUNDED, not BOM-decorated** — the catch that makes this bigger than deleting scripts:
  - `activate()` returns early if `!A._bom` (doc_canvas:85); `A._bom` is produced by `bom_extract.js`.
  - Envelope has 2 sources, BOTH BOM: primary = BOM-root AABB (`BOMWalker.listBoms` + `m_bom` query,
    doc_canvas:509-535); fallback = `A._bom.envelope` (bom_extract, doc_canvas:537-539).
  - Gantt "Next" calls `_GR.materializeBomLevel(A)` (doc_canvas:296, §S272) to reveal deeper BOM levels.
  - `_GR` (`grid_recompose.js`) is MIXED: doc_canvas uses BOM fns (`materializeBomLevel`/`resetBomDepth`/
    `dematerializeBomLevel`) AND non-BOM grid fns (`init`/`applyDrag`/`rebuild`/`markDirty`) on the same object.
  - The Modeller's 3D grid is ALREADY separate (`bonsai_grid.js`+`bonsai_gridmove.js`, NOT grid_recompose) — so
    "relegated to Modeller.3DGrid" is architecturally already true; this task only removes the viewer's orphan.

**Deprecation plan (its OWN session — touches a LIVE viewer feature, needs a witness; do NOT rush at session-end):**
1. Re-source the Doc-pill envelope from a NON-BOM scene-geometry AABB (the scene already has every element bbox /
   a world bounding box) → kill the `BOMWalker`/`m_bom` path + the `A._bom.envelope` dependency.
2. Make the Gantt stepper reveal phases WITHOUT `materializeBomLevel` (step by phase/storey, not BOM level) →
   remove the 3 `_GR` BOM calls.
3. Split `grid_recompose.js`: keep the non-BOM grid fns the Doc pill still needs (`init`/`applyDrag`/…), drop the
   BOM-governed recompose path (the retired Red Pill).
4. Remove the 9 BOM `<script>` loads from viewer.html + the now-dead files (`bom_extract.js`, `bom_walker.js`,
   `bom_engine/*`). Bump viewer sw CACHE_VERSION; drop them from precache.
5. WITNESS: viewer loads with ZERO BOM scripts + no console BOM ref; Doc pill still activates, draws its envelope
   (now from scene AABB), 2D grid + Gantt stepper still step; `audit_specs.js` exits 0; `grep -rE "Bom|bom_|m_bom"
   viewer/*.js viewer/viewer.html` (excluding the modeller-only files) → ZERO viewer-BOM references.
⚖ If step 1-2 prove the Doc pill has no meaningful non-BOM form, the alternative is to RETIRE the Doc pill outright
  (it's old effort superseded by the Modeller) — confirm with the user at that fork.

## DON'T
- Don't touch the viewer or its OCI hosting from MODELLER work — modeller-only files, `../modeller/` GH, `_modellerBase()`.
  (The viewer-BOM-deprecate task above is the ONE sanctioned viewer edit — a cleanup that REMOVES drift, witnessed separately.)
- Don't rebuild the Find panel / DLOD / op-log / walkers — WIRE them into this UX.
- Don't fabricate a walk where anchors are missing — REFUSE + honest "no walk" (non-invent).
- Don't push a 2nd commit to an auto-merge-armed branch (orphan trap — #542 lesson).
- Don't ask the user admin/operational questions; DO reserve the W-UX-6 edge-source choice (it's architecture).
```
