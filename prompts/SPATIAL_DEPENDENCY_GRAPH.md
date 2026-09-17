# The Spatial Dependency Graph — Spatial MRP for the Modeller (spec spine, opened 2026-06-25)

## ⚠ DO NOT REMOVE — scope + standing rules
The **engine spec** under the Modeller's editing layer: a building's editable structure is a **typed directed
dependency graph** over the extracted substrate — i.e. **MRP with geometry on its edges and a planner's gate on its
propagation.** Forward fold = BOM explosion; backward propagation = pegging; the user-facing "you may need to change
this — accept/ignore" = an **MRP exception/action message** for geometry. This doc is the spine; the editing trunk
([[BOM_AS_OVERLAY_IDEA]]) is its Phase 1–2 surface, the Z-layering ([[CONSTRUCTION_GRID_BOM_DUAL_MODEL]] §SHELL-N-ZSPAN)
supplies its `instanced-by`/Z edges, and the long-range authoring vision ([[MODELLING_FROM_BOM_CASCADE]]) sits above it.
- **NON-INVENT (PRIME RULE):** every EDGE is **recovered from the source IFC** (e.g. `IfcRelFillsElement`,
  `IfcRelAggregates`) **or DERIVED from a MEASURED property** (face-touch, bbox-spans-two-datums, Z-span, gridline
  snap). **Never a proximity guess, never a name/role whitelist, never a hand-authored template.** A wrong graph
  back-propagates *confidently wrong* (ML lesson #1) — so edge correctness is the substrate of correctness.
- **Two propagation regimes, both honest:** **forward fold is LIVE** (transform captured geometry on every frame —
  cheap, GIGO-proof, no verbs); **backward propagation is EXPLICIT + ORACLE'D** (user-triggered, each proposed Δ
  verified against the **pristine `extracted.db` / raw IFC extraction** — the frame-invariant rosetta truth — before
  it is trusted). Re-derivation is allowed *only because* it is never silent.
- **The accept-gate is load-bearing, not UI polish:** the backward pass *proposes*; the user *signs*. Auto-applying a
  propagated Δ = inventing changes (ML non-convexity: many valid resolutions, no unique fixed point). Each accept =
  one signed `kernel_ops` op = the wedge. Read the log after every run; the §-log/rosetta is the proof.

## ORACLE — the pristine `extracted.db` / raw extraction, NOT the cooked `output.db`
Geometry truth = **raw IFC extraction** (frame-invariant rosetta proof: real SH/DX round-trip 0.000 mm in JS).
`extracted.db` is **more pristine than `output.db`**: `output.db` is the COOKED output of the Java compiler's BOM
exercise and carries compile-introduced perturbations (proven DX ~2 mm on 3/644) that are absent from both the BOM
and the extraction. Since this whole layer **transforms captured geometry verbatim**, its oracle MUST be the captured
substrate, not a cooked rebuild.
- **Edge correctness** is oracle'd against the **source-authored relations read INDEPENDENTLY** (`IfcRelFillsElement`
  counts/links, `IfcRelAggregates`) + raw extraction geometry — never transcribed from the engine's own intermediate
  (the anti-tautology guard: the deprecated `witness_drop_vs_java.js` self-collided by transcribing the same catalog
  into its oracle → false 0.000 mm).
- **Forward-fold correctness** is the rosetta: `transform(extracted)` vs raw extraction, frame-invariant, 0.000 mm.
- **`output.db` keeps ONE narrow role:** a *secondary* cross-check that the editable BOM RECIPE reconstructs the
  compiler (the "BOM layers suffice" proof) — useful for the recipe path, but it is the COOKED reference, never the
  geometry-truth oracle for a transform. A RED vs `output.db` may be Java-cooking, not a defect — localise & trace,
  never loosen tol.

## WHY THIS ISN'T FOREIGN TO BOM/ERP — it's MRP, drawn as a graph
ERP/MRP has propagated over BOM graphs for sixty years; we are naming the structure and adding geometry + a gate.
| ERP / MRP (the BOM world) | Graph / ML (the same math) |
|---|---|
| BOM explosion (parent demand → component demand) | **forward pass** over a DAG, top-down |
| **Pegging / where-used** (component change → which parents are hit) | **backward propagation** — credit assignment |
| Low-level coding (process in dependency order) | **topological sort** |
| Net-change MRP (re-plan only what changed) | **sparse / incremental backprop** |
| **MRP exception / action messages** (reschedule-in, expedite, cancel) | the gradient signal, made human-readable = **the orange suggestion** |
The orange "accept/ignore" highlight **is** an MRP action message for geometry: MRP never silently re-plans, it
raises a message a planner approves. We apply that to walls instead of work orders.

## WHAT THE GRAPH ADDS TO THE BOM TREE
A BOM is a **tree** (one parent per child: building→floor→room→set→leaf) — perfect for containment, but it
**structurally cannot hold sideways, many-to-many dependencies**, which is exactly what editing needs:
- an opening is a *child of a room* (tree) **but also hosted-by a wall** (cross-edge);
- a slab is *in a floor* (tree) **but spans grid C and D** (two anchors);
- a riser is *in a shaft* (tree) **but its length depends on n** (the storey count — another branch).
The graph **G = BOM tree + typed cross-edges**. The tree says *what contains what*; the cross-edges say *who is
affected when something moves*. **Backprop runs on the cross-edges.**

## THE FORMAL OBJECT — G = (N, E)
- **N = the BOM nodes + leaves** (your M_Products / assemblies / instances — nothing new).
- **E = typed directed edges, each a "spatial BOM line" carrying a FOLD RULE + a CONSTRAINT.** This table is the
  **CONTRACT**:

| edge type | ERP analogue | provenance (how the edge is known) | forward fold (source moves →) | backward signal (target violated →) |
|---|---|---|---|---|
| `contains` | BOM line | `IfcRelAggregates` / spatial containment (recovered) | child rides parent, rigid en-bloc | — |
| `hosted-by` | option on a config'd product | **`IfcRelFillsElement`/`Voids` — Path B (recovered)** | opening rides wall surface (1–2 DOF) | host moved → door no longer fits → **RED** |
| `spans` | part consuming 2 inputs | bbox crosses two datums (derived) | element stretches between datums, sizes held | datums diverged past tol → flag |
| `instanced-by n` | **M_AttributeSetInstance / qty** | typical-storey × n + Z-span (derived) | extent = f(n) (riser len = n×h; flights = n−1) | n changed → re-issue extent → **ORANGE** |
| `abuts` | *(new — no classic analogue)* | face-touch within tol (derived) | neighbor realigns to shared face | neighbor pulled away → gap → **ORANGE** |
| `anchored-to` | routing to a work-center | nearest gridline / storey-plane snap (derived) | element follows its datum | datum moved → re-anchor |
| `port-connects` (proposed, see §PORT-CONNECTS-RECOVERY below) | MRP routing (operation sequence, directed) | `IfcRelConnectsPorts` — **schema exists (`port_elements`/`port_connections`), never populated** | flow continues along the connected chain, topology-preserving | downstream port disconnected/flow-mismatched → orphaned segment → **ORANGE** |

Each edge has **both directions built in** — a forward fold (explosion) and a backward signal (pegging). The fold
rule is the **ASI attribute transform** (how the instance attribute recomputes). Every edge stamps provenance
(`ifc:recovered` | `derived:<measure>`), never `invented`.

## TWO THINGS THE SPATIAL GRAPH HAS THAT CLASSIC MRP DOES NOT
1. **Geometry + constraints on the edges.** A classic BOM edge is a scalar (1 table → 4 legs). A spatial edge carries
   a *geometric fold* (position/extent transform) **and a feasibility constraint**. So backprop carries a *measured
   Δ* **and** a *red/orange verdict* — the "loss" is geometric infeasibility, not a material shortage.
2. **Cycles.** A material BOM is strictly acyclic (low-level coding sweeps it once). **Adjacency is cyclic**: room A
   abuts B abuts C abuts A — un-topological-sortable. The AI world hits this in recurrent nets (backprop-through-time)
   and *iterates*; we resolve it the safe way — **user-gated, hop-by-hop** (each accept may reveal the next node's
   exception; we never run an autonomous relaxation chasing a global fixed point). The cycle is *why* the human gate
   is not optional: there is no unique settle-point to auto-converge into.

## THE SIGNAL TAXONOMY (all measured)
- **RED = hard stop** — a constraint that *cannot* be satisfied by adjustment: door-crush (from the real `hosted-by`
  door width), UBBL min-dim (from the AD rule tables), clash. The drag halts.
- **ORANGE = soft, accept/ignore** — a dependent that *can* be fixed by a proposed Δ (your opening may move). Signable.
- **GREEN = coherent**, no action.
Red = "you can't"; Orange = "you may want to, here's how." Constraints are measured (real door, real AD table) — a
guessed constraint = a GIGO loss (ML lesson #2).

## §ABUTS-ATTRIBUTE-PRIOR — SUPERSEDED: the real cause was a wiring bug, not ambiguity (2026-09-18)
> **Update, same day, from a separate Modeller session's scrutiny — reproduced and verified before
> writing this.** The proposal below is kept for the record but its premise turned out wrong. Read
> this box first.
>
> **The real cause of G4's 843/9,817 disagreement: the §REAL-AABB fix never executes in production.**
> `modeller/str_walker_outliner.js:179` calls `CrossEdges.deriveAll(db)` — one argument, no `geoDb`,
> no `opts` (verified directly, this file). Since `§GEO-SERVED` (#1090) moved geometry into separate
> `*_geo.db` files, `deriveAdjacency`'s `opts.geoDb` is always `undefined` in production, so
> `_buildRealVerts` → `RealGeometry.buildGeometryIndex(db, undefined)` resolves 0 elements, and
> **every element silently takes the coarse `[center_xyz ± bbox/2]` fallback** — `cross_edges.js` has
> zero log statements anywhere, so this has never been visible. That box is centred on the placement
> anchor, not the volumetric centre: measured, size matches authored `bbox_*` on 934/934 elements, but
> the CENTRE is wrong on 798/934, median 78mm off — a pure translation error, exactly the
> recenter/anchorOffset correction this file's own header (§REAL-AABB above) dismissed as "same final
> numbers, fewer steps." It is not the same numbers; it never ran.
>
> **The attribute-prior idea below was tested, not just reasoned about, and it does not work — for a
> good reason.** `SampleCastle_ARC.db` has no `componenttype` column, so the check ran on `ifc_class`
> instead (the nearest available attribute): ifc_class mismatch correlates only weakly (75.7%
> disagreeing vs 58.0% agreeing — not a clean split), and decisively, **`IfcCovering↔IfcWall` is BOTH
> the #1 disagreeing pair (139) AND the #2 agreeing pair (1,094)** — the same class pair on both sides
> means a type prior cannot separate them. This makes sense in hindsight: an attribute prior can only
> ever filter/flag geometrically-wrong edges, it cannot fix wrong geometry — and wrong geometry
> (wiring, not ambiguity) is what's actually happening here.
>
> **So the idea's "proposed, not built" status was lucky timing, not foresight.** Building it on top of
> mis-wired geometry would have shipped a mechanism to paper over a bug that should just be fixed —
> pass `geoDb` through at the `str_walker_outliner.js:179` call site, re-run G4, and the 843 may
> largely disappear on their own. **The attribute-prior idea itself isn't dead** — it may still have
> genuine value on whatever real disagreement remains AFTER the wiring fix, where the disagreement
> would be true geometric ambiguity rather than a missing geoDb — but that is now unverified and
> should not be assumed either way until the wiring fix actually lands and G4 is re-run.

## §ABUTS-ATTRIBUTE-PRIOR (original text below, superseded above) — a semantic co-signal for `abuts`, proposed not built (2026-09-18)
red1, cross-checking whether the Viewer's `room_graph.js` and the Modeller's `cross_edges.js` have any
ERP analogue: *"I wonder if Product Attribute or a common child in a Product BOM be the connector... to
give it more spatial semantics."*

**Why a BOM-line connector doesn't fit `abuts` specifically — this doc already says why, above:**
"Adjacency is cyclic: room A abuts B abuts C abuts A — un-topological-sortable." A BOM line is a
directed parent→child edge (`contains`'s own analogue); two products can't be mutually "child of" each
other, so a cyclic lateral relation cannot be expressed as a BOM-tree edge. That is WHY the table marks
`abuts` `(new — no classic analogue)` — a real structural mismatch, not an oversight.

**Why a Product ATTRIBUTE is a different, better fit:** an attribute is a property ON one product
(`M_AttributeSetInstance`, already this doc's own named analogue for `instanced-by n`), not a relation
BETWEEN two — no cyclic-relation problem. Real data already exists to hang it on: `pp_product_bomline.
componenttype` (bim-ootb `hr_bim_asset/ad_bom.js`) and `conn_points` (extracted in bim-ootb `modeller/
real_placement_resolver.js` from `library/component_library.db`). A "componenttype X expects to abut
componenttype Y" prior would CROSS-CHECK the geometric face-touch test, not replace it, and not store
the pairwise edge itself (that would just reinvent `rel_adjacency` by hand) — stays inside this doc's
own DOCTRINE line above: derive from a measured property, never the class name.

**Why this isn't just architecturally tidy — it's pointed at a real open gap:** bim-ootb's own witness
(`modeller/tests/witness_cross_edges_real_aabb.js`, gate G4 LIVE-AGREEMENT), re-run live 2026-09-18:
**843/9,817 (8.6%) of SampleCastle's derived `abuts` edges disagree with the live-rendered mesh.** A
type-compatibility co-signal MIGHT explain some share of those — a hypothesis, not tested against the
actual 843 disagreeing pairs this session.

**Status: proposed, not designed, not built.** No code written, no schema change made. Next step if
picked up: pull the 843 SampleCastle disagreement pairs' `componenttype` values and check whether a
type-incompatibility pattern explains a meaningful share of them, before building anything on top.

## §PORT-CONNECTS-RECOVERY — real MEP topology IFC already carries, currently discarded (proposed 2026-09-18)
red1: *"I reckoned we already have some DAG capability and this will enrich it further by pasting what
IFC inherited during its birth in an Autodesk project?"* — checked directly against
`DAGCompiler/python/extractIFCtoDB.py` rather than assumed.

**`port_elements`/`port_connections` are declared in the schema and never populated.** Lines 198-209:
both tables exist (`port_guid`/`element_guid`/`flow_direction`/`local_x,y,z` for the first,
`port_a_guid`/`port_b_guid` for the second) — grepped the whole file for `INSERT INTO port_`: zero
matches. `IfcDistributionPort` is correctly recognised as non-geometric (line 340, "logical connection
points, no mesh") — the schema was clearly designed with intent — but the actual `IfcRelConnectsPorts`
relationship read + INSERT was never finished. This is IFC's *native* mechanism for "this fitting really
connects to that pipe," authored at the point of origin (Revit or whatever tool modelled the MEP run) —
recovered, not invented, same category as Path B's `rel_fills_host` above, just unfinished.

**Same finding, different shape, for semantic richness:** arbitrary IFC property sets (`Pset_*` —
manufacturer data, fire ratings, Uniclass/Omniclass classification) have **no table at all** — not
unfinished, never started. `componenttype` (`hr_bim_asset/ad_bom.js`) is caller-supplied, not
IFC-derived.

**Why this matters beyond "one more table":** `disc_walker.js`'s own header already names a "Router —
rule_routing → from_kind→to_kind chains" concept, but today it builds those chains by NEAREST-NEIGHBOUR
distance heuristic over a fresh building (`_rwPairSegments`), because no real connectivity source
exists to read instead. A populated `port_connections` table, read from a SOURCE building that was
already MEP-routed in its authoring tool, would let the Router (and `cross_edges.js`'s `abuts`/
`port-connects`) use REAL authored topology instead of re-inferring it — strictly better evidence,
already sitting in every IFC export, currently thrown away at the door.

**Explicitly not what this is:** synthetic inference (guessing `componenttype`/connectivity from
`ifc_class` + geometry when a source file genuinely has no Psets) is the WRONG move, by this project's
own standard, demonstrated repeatedly tonight — the door-orientation name-guess, the hardcoded pipe
cross-section, `real_placement_resolver.js`'s `WalkerGapError` all exist specifically to kill that
shortcut. Where real IFC data is genuinely absent, refuse-and-flag, per doctrine — never fabricate a
constraint (ML lesson #2, GIGO is in the loss).

**Status: proposed, not designed, not built.** Next step if picked up: (1) find/write the
`IfcRelConnectsPorts` read in `extractIFCtoDB.py`, populate `port_elements`/`port_connections` on a
real building that has MEP routing authored (Hospital/Terminal are the known-rich candidates), (2) check
row counts are non-zero and spot-check a handful against the source IFC by hand before trusting them,
(3) only then wire a consumer (`cross_edges.js` new `port-connects` edge, or `disc_walker.js`'s Router)
— extraction and consumption are separate steps, don't build the consumer against an unverified source.

## TWO PROPAGATION ENGINES — continuous vs discrete (ML lesson #5)
Backprop needs local gradients → it is for **continuous** edits. Discrete choices are non-differentiable.
- **Continuous (move / stretch / change-n):** a measured Δ flows through the graph — true backprop. ✅
- **Discrete (swap roof type / add a storey):** **cannot** be gradient'd → **enumerate options → score each by fit →
  human chooses.** The flat-Hospital-roof swap is discrete (forward-fit + combinatorial choose); the dome-move is
  continuous (Δ-propagate). They are different machines; keep them distinct in the UI and the engine.

## ML LESSONS AS DESIGN DEFENCES (the four failure modes to defend)
1. **Wrong graph → confidently wrong.** Edges recovered/measured, never proximity. (Path B + adjacency are correctness, not features.)
2. **GIGO is in the loss.** Constraints must be real/measured (door width, AD tables) — not invented.
3. **Vanish / explode.** Threshold-prune the ripple (no re-align for 0.3 mm); clamp/refuse runaway (a 2 m nudge must not cascade into a 40 m shift — that's a RED).
4. **Non-convexity → human gate.** Many valid resolutions (move wall vs resize opening vs shift neighbor); the user picks. Never auto-apply.
Plus: **stop-gradient** (a user-**pinned** element / fixed datum halts propagation — "don't ripple through this");
**gradient-checking** (never trust a propagated Δ blindly — verify by re-measuring against the pristine `extracted.db` / raw extraction, the rosetta truth — NOT the cooked `output.db`).

## DOCTRINE — one rule, three axes (carried from the orientation lane)
**Derive the relation from a MEASURED property, never from the IFC class name.** Facing = captured yaw (not
`hasFront`); vertical layer = measured Z-span (not `IfcStair`); adjacency = face-touch (not "rooms"); sequence =
datum order (not a prefab template). Acceptance: the edge-builders grep-clean of class/role names. [[RESUME_GIGO_FACING_TEST]]

## PATH B IS QUADRUPLY LOAD-BEARING
Recovering `IfcRelFillsElement → rel_fills_host` (authored & complete in source: 7 for SH, 371 for Terminal; dropped
at extraction) is the prerequisite for: **(1)** facing (orientation lane), **(2)** host-ride (`hosted-by` forward
fold), **(3)** the door-fit RED constraint, **(4)** the "your openings may need to change" ORANGE signal. One
extraction recovery unlocks all four. It is the single highest-leverage build item.

## SYNTHESIS (2026-06-25) — BOM→Graph, Modeller impact, construct-generality (the three questions)
Captured after the orientation-abstraction proof landed (door = last RED → GREEN across three oracles). The door
bug was the spine's thesis in miniature: a missing edge + a discarded transform, fixed by recovery + subtraction.

**1. Is BOM the way to go — now that it's the Graph? What changed and why it helped.**
The BOM was never wrong, only *incomplete*: it is a **tree** (one parent per child) and editing needs a **graph**.
G = **BOM tree (the trunk, unchanged) + typed cross-edges** the tree structurally cannot hold (opening hosted-by a
wall; slab spans two grids; riser length = f(n)). This is **not a pivot away from BOM — it's BOM drawn with its real
edges**, and it is literally **MRP**: BOM-explosion = forward pass, pegging = backprop, MRP exception = the orange
suggestion. *How it helped, concretely:* the door faced wrong because the door↔wall `hosted-by` edge was **severed at
extraction** — with no edge the only recourse was a proximity GUESS (`_inheritHostRotation`). The fix was two graph
moves: **recover the edge** (Path B `rel_fills_host`) + **use the captured transform** (yaw was discarded, not
missing). Deepest payoff: **the graph made the BOM checkable** — the recovered edge is an *independent* oracle (source
IFC relations), defeating the self-collusion that a tree-only check falls into (the deprecated `witness_drop_vs_java`).
Result = **three non-colluding oracles agree**: raw extraction (0°), compiler `output.db` (0.07 mm), source relations
(7/7, zero invented). That triangulation is impossible with a tree alone.

**2. Modeller impact — does whole-building drop + Find-clarity select/edit + the 3-way grid still hold?** YES, sharper.
- **Whole-building drop IS the graph's forward fold.** `dropLeaves`/`expandAssembly` = BOM-explosion = forward pass;
  this session proved drop == compiler == extraction (0.07 mm / 0°). The drop got *more honest* (de-factorization
  recovered 3 leaves the old over-collapse hid).
- **Find → select set → edit** is where the graph pays off: Find pinpoints (facet), the **cross-edges say what is
  affected when you move it** → edit → forward fold (live, cheap) → orange exceptions (gated). The opening proves it:
  before, moving a wall left its door behind (link severed); now `host_element_ref` is the real link → the door can
  ride the wall **en-bloc** (link unlocked this session; the ride itself is the Phase-2 forward fold).
- **The 3-way grid = three families of typed edges**: `anchored-to` (gridline/storey-plane snap), `spans` (bbox
  crosses two datums), `instanced-by n` (Z-span/typical-storey, extent=f(n)). Not built yet (the derived edges, next),
  but the doctrine that makes them safe (**measure, don't whitelist**) is now proven, and one key grid behavior is
  *already* enabled: "walls stretch but openings can't divorce their wall" **IS** the `hosted-by` edge — Path B is what
  stops a window sliding off its wall during a grid pull. Continuous *stretch* (backprop, gated) vs discrete
  *add-a-storey* (enumerate→choose) stay two engines.

**3. Will it resolve abstract constructs — a bridge, a shopfloor?** Doctrinally YES, and the orientation work was the
first proof. Killing `hasFront`/`DIRECTIONAL_ROLE_TOKENS` made the orientation path **grep-clean of every IFC class
name** — a bridge girder or a shopfloor jig carries a captured yaw exactly like a door, read with no new rule. And the
**six edge types name nothing building-specific** — they are spatial/topological: a bridge has `spans` (deck→piers),
`anchored-to` (bearings), `instanced-by n` (n spans); a shopfloor has `contains` (cell→machines), `abuts` (conveyor
segments), `anchored-to` (machines on a floor grid) — and a manufacturing process *is* the original MRP + geometry, so
it's the most natural fit. The door was the right stress test *because* building semantics were most tempting there.
**Honest boundary:** proven so far = orientation-abstract + one recovered edge (`hosted-by`) on real buildings; NOT yet
the derived measured edges nor a run on a non-building source. The real generality proof = build `abuts`/`spans`/
`instanced-by`/`anchored-to` then run W-SDG-GRAPH on a bridge IFC with zero invented edges + grep-clean builders.

**One-line synthesis:** the BOM investment was right; the Graph is the BOM with its real edges drawn in = MRP-with-
geometry. The door fix proved the load-bearing claim — **correctness comes from recovering/measuring edges and deleting
guessers** — and that is exactly what makes it portable from a house to a bridge to a factory floor.

## §INVERT-TWIN-EDITING — the product inversion (user fresh-eyes framing, 2026-06-25)
The significant reframe of **what the Modeller IS**. **Don't author from scratch — OPEN a ready-made ARC twin and EDIT
it.** Traditional modellers (Revit/SketchUp/Bonsai) compete on from-scratch authoring UX (draw/gizmo/snap) — a polish
race we can't win. The inversion changes the game: **start COMPLETE** (a real building's ARC, opened from `extracted.db`)
and gain what *we* are strong at:
- **Speed** — you don't draw; you begin from a faithful real building.
- **RouteWalk COMPLETION** — STR/MEP/4D/5D/ERP **auto-complete** by crawling RouteWalk against the ARC (open a bare ARC
  → it completes itself). Auto-completion, not manual buildup. The killer demo.
- **Reuse** — the ARC twin is the reused substrate; edit batches, don't reconstruct.
- **Trust** — the ARC twin is RosettaStone-faithful (`output.db==extracted.db`); editing starts from truth, non-invent.

**THE UNDERLYING PRINCIPLE: Open `extracted.db` = ARC ONLY.** What you OPEN and EDIT is the **ARC** (the architectural
twin = the sole edited substrate, per §OUTLINER-COHERENCE consolidation). Even though `extracted.db` carries other
disciplines, the **editable scope is ARC**; STR/MEP/… are **followers** (crawl RouteWalk, regenerate) — shown, not
transform-edited. So the BOM Tree's editable nodes = ARC; the rest are follower-views/regenerated. This makes the
**digital twin EDITABLE + GENERATIVE (it completes itself)**, not a read-only mirror — that *is* the inversion.
- **Primary, not only:** twin-editing (brownfield) is the PRIMARY mode; from-scratch/greenfield stays a fallback (seed
  from a template/typical, then the SAME edit + RouteWalk).
- **Edit-scope precision:** the BOM editor must scope editable nodes to the ARC discipline and present STR/MEP as
  follower-views, or the principle leaks.
- **Rests on the RosettaStone:** editing starts from truth *because* the ARC twin is faithfully reconstructable.
- **First slice SHIPPED:** bim-ootb PR #530 (📂 Open icon → BOM Tree editor) — open an ARC `extracted.db`, edit its BOM.

## §OUTLINER-COHERENCE — the one model behind the facets (design, 2026-06-25)
Figured out in the "grand vision / Outliner POV" dialogue. **The Modeller's value is not a better geometry editor — it
is that the Outliner IS the BOM-graph, and every node is a pickable, editable, replaceable BATCH** (a whole room +
its furniture + openings; higher up a whole roof structure or a typical floor × n) — *versatility traditional
authoring lacks, where you move each element by hand.* This section is the coherent model that makes the three views
(ARC/STR spatial · DISC/MEP system · 3D grid) ONE thing. [[project_modeller_rosettastone_mission]] [[BOM_AS_OVERLAY_IDEA]]

**THE ONE-LINE MODEL (user landed it 2026-06-25): a Project EXPLORER / Outliner panel with CROSSING facets.** "Files" =
building elements, "folders" = facets — but an element lives under MANY facets at once (storey ∧ room ∧ disc ∧ phase ∧
material ∧ grid-cell ∧ host). **The crossings ARE the graph** (a tree can't hold many-to-many — the crossings are the
typed cross-edges). TWO KINDS of facet, built & navigated differently:
- **Classification facets** (storey · room · disc · phase · material) = a **group-by on an element attribute**
  (many-to-one). Cheap; the Find panel ALREADY builds each as a tree (`navigate_find.js` `_build{Storey,Disc,Room,
  Material,Phase}Tree`, recursive `_treeNode`, `:368-733`), data-gated. Navigated **facet-IN** (pick facet → drill).
- **Relational facets** (`hosted-by`/`abuts`/`anchored-to`/`spans`/`instanced-by n`/`depends-on`) = typed **edges**
  between elements (many-to-many) = the real derivation work. Navigated **element-OUT** (touch element → reveal relations).
- **Composition facet = the BOM TREE tab (user 2026-06-25)** = the editable counterpart of `contains`. The other facets
  are read-only group-bys; THIS one's *structure itself is authored by drag* — re-parent an element, grab an upper node to
  operate on a whole branch. It is the BOM PRINCIPLE made live (arbitrary recursive parent→children, user-composed) and
  the natural home of "pick a branch/bunch, edit/replace." **TWO DRAGS = TWO LAYERS = TWO SIGNED OPS:** drag element →
  new parent = **RE-POINT** (L0b pointer edit; geometry untouched — "land the thread, then re-point it out"); drag an
  *upper node* spatially = **FOLD** (L0a geometry rides the subtree via GEOM_MOVE). Drop offers a choice (ride new parent
  → fold, or regroup-only → metadata), each signed. **It RESOLVES the node-derivation gap:** where rooms aren't authored
  (`IfcSpace=0`, the weak handle), the user *authors* the grouping by drag instead of us deriving it — derived facets and
  human composition are complements. Seed the initial tree from a DERIVED/compiler BOM with provenance (`derived-seed` vs
  `user-authored`) so authoring stays non-invent; a spatial drag must stay a FOLD (never re-derive); re-grouping is INERT
  to the geometry RS (changes the recipe, not the positions). Reuses `_treeNode` + `kernel_ops`; new `_treeMode='bom'`.
Classification facets give the *folders*; relational facets give the *coherence* (move a wall → its hosted openings ride);
the BOM Tree gives the *authored composition* (compose the bunch, then act on it).
**DIMENSIONAL-EDIT MATRIX (the precise gap):** editors already ship for **phase/4D** (`time_machine.js`) and
**material/5D** (`cost_panel.js`) over `kernel_ops.js` (signed log) + `grid_kinematics.js` (fold); disc is partial
(RouteWalk). The GAP = the **spatial column** (storey/room/grid geometry): Find already *navigates* it; **"merely extend
to be spatial editable" = wire those facet nodes to the fold+log that already power the 4D/5D columns**, with
§DIMENSION-HANDLERS as their edit verbs. The paradigm (grab facet node → signed fold → lens re-resolves) is proven on
phase & cost; the spatial dimensions inherit it.

**CONSOLIDATION — the BOM editor MERGES INTO ARC/STR (user 2026-06-25; set out in [[BOM_AS_OVERLAY_IDEA]]
§discipline-seam + [[CONSTRUCTION_GRID_BOM_DUAL_MODEL]] §two-models).** The Outliner **SHOWS** construction elements by
ALL dimensions (the crossing-facet lens), but **EDITING is ARC ONLY** — it is *the only part that does the grid +
the graph/BOM-compose + individual ARC change*, because **ARC is the SOLE transform substrate** (dropped verbatim,
edited by handles). The other dimensions are NOT peer editable BOM-trees. **EVOLUTION (user 2026-06-25 c — SUPERSEDES the
earlier "ARC/STR transform *together*" seam): ARC is the SOLE edited substrate; STR is a WALKER like MEP — it crawls the
ARC and regenerates to STRENGTHEN it (columns/beams/reinforcement), MEP/CW/SP walk to SERVICE it, 4D/5D/ERP walk to
ENTERPRISE-ify it. Every non-ARC discipline FOLLOWS by "crawling RouteWalk in the ARC."** RouteWalk generalizes from "route MEP
pipes" to **"re-derive ANY dependent by walking the dependency edges (`anchored`/`spans`/`hosted-by`/`instanced-by n`/
`depends-on`) from the ARC change and regenerating"** (STR re-places members, MEP re-routes, …). So: **DISC + STR + every
non-ARC discipline = FOLLOWERS** (edge-crawl regenerate, never directly transform-edited); **phase / material = ENTERPRISE
dims** (own editors `time_machine.js` / `cost_panel.js`). Two gates on every follow: it is a **signed op** (deterministic
replay) and **non-invent** (re-derive against the MEASURED edges, never a guess). So there is **NO separate "BOM editor"
tab distinct from ARC — the ARC facet IS the BOM editor** (grid + graph + individual change); everything else crawls it. This REFINES the "three facet kinds":
editability lives in ARC; the **composition facet (BOM Tree, `bom_tree.js`) is the ARC tree made editable**, and
the classification facets storey/room are **LEVELS within it**, not separate editable stores; STR/DISC walk-then-regenerate;
phase/material are enterprise-edited. The PoC `bom_tree.js` is therefore the ARC BOM-editor model, correctly placed.

**THE ROSETTASTONE = `output.db == extracted.db` OF A BUILDING — the COMPILER's reconstruction, ALREADY PROVEN in the
Java era (user clarification 2026-06-25). Re-running an RS proof is MOOT — it is a settled GIVEN, not work here.**
Conceptually it is the model's *birth certificate*: the compiler faithfully reconstructs the building. It is an
**import-time** fact; the moment the model is **edited it intends to diverge** → RS can no longer match and is
**retired**, and the invariant becomes **"deterministically fold the signed op-log over the admitted base."**
**THE ACTUAL CHALLENGE IS A CODING ONE: bring the Java reconstruction (`IFCtoBOM` + the compiler) to JS, WITH the
folding (editing / op-log) benefit** — the facets/Outliner are the NEW value layered on the ported, already-proven
reconstruction. RS guards the front door (proven, Java); the **op-log + folding run the house (this is the build)**.
Division of labour: the user drives the grand vision on paper; this lane owns the Java→JS+folding port.

**THE ONE MODEL = five layers, one substrate** (everything else is a projection):
```
L4  Enterprise folds     4D / 5D / ERP            ── fold the SAME op-log
L3  Outliner facets      spatial · system · grid  ── lazy facet LENS (element-out, resolved on touch) for select / edit
L2  Fold engine          GEOM_GRID_MOVE etc.      ── geometry = fold(base, op-log)   [ALREADY SHIPS — do not rebuild]
L1  Op-log (signed)      kernel_ops               ── the ONLY mutable thing post-import
L0  Admitted substrate   enriched BOM store        ── existing faithful *_BOM.db/ERP.db + graph G + grid + spine (enrichment);
                                                      RosettaStone-proven AT IMPORT, then frozen as base
```
The one model is **L0a (verbatim geometry) + L0b (metadata pointers) + L1 (op-log)**; a facet view = resolve L0b
pointers against L0a, then `fold(·, L1)`. L0b is the OLD pipeline's structure *enriched in place* as GUID references,
never a parallel geometry rebuild.

**LAND THE THREAD, THEN POINT IT OUT (user 2026-06-25) — the canonical framing.** Split **geometry (L0a, verbatim,
already landed = `extracted.db` dropped EXACTLY, RS-trivial identity)** from **layer-metadata (L0b: edges · facets ·
handlers as pure GUID POINTERS, no geometry of their own)**. The Outliner is a **lazy lens**: touch any element → it
*points out* its facets (child of this floor, hosted by that wall, member of this Z-stack, anchored to that datum),
element-OUT, resolved on demand — graceful ("no room facet here" is an honest answer, not a failed tree).
- **Match by reference, not reconstruction:** metadata matches geometry by a **GUID join** (trivial, drift-proof),
  never by threading geometry *through* the BOM layers (the needle the Java compiler threaded — proven, but NOT needed
  again because the geometry is already landed).
- **Structural non-invent:** L0b has NO geometry → a bad edge can only **mis-point** (checkable mis-label), never
  fabricate a position. The GIGO scars (re-derived rotations, scrambled boxes) become *structurally impossible*, not merely guarded.
- **Port payoff:** the JS port does NOT re-implement geometry-reconstruction-through-BOM; geometry lands verbatim, only
  the **metadata derivation (edges) + the fold engine** are ported. The hard Java reconstruction stays the proven RS given.

**THE LENS ALREADY SHIPS = the Find panel (`deploy/dev/navigate_find.js`).** It resolves verbatim `extracted.db` into
facets `_treeMode = storey | disc | room | material | phase` (:217), **data-gated** (Room enabled only with
IfcSpace/volume; Material/Phase only when present — :262-292) = exactly the graceful degradation above; its own comment
says **"the toggle IS the lens"** (§RP-T3, :211). It already reaches the **enterprise dimensions** (PHASE = 4D,
MATERIAL → 5D), so ONE lens already spans geometry facets AND the extra dimensions — the L3↔L4 unification is
half-built. **THE GRAND DESIGN = PROMOTE Find from NAVIGATE to EDIT**, adding the three things it lacks:
1. the typed **CROSS-EDGES** (`hosted-by`/`anchored-to`/`spans`/`abuts`/`instanced-by n`/`depends-on`) — Find *groups*
   (room/storey) but can't yet say "this opening is hosted by that wall" or "these are a Z-stack of n"; the edges are
   what make a grabbed bunch COHERE under an edit;
2. **element-OUT** selection (touch element → reveal facets → escalate to the bunch) on top of Find's facet-IN drill;
3. the **handlers + fold + signed op-log** (read-only navigate → signed edit). [[BOM_AS_OVERLAY_IDEA]] (promote, don't replace).

**THE OUTLINER = SPANNING-TREE PROJECTIONS over the one graph** (reuse Find's `navigate_find.js` `_treeMode`, already
data-gated). Same nodes, re-parented by which edge-type you tree on:
| Facet | Spanning edge | Shape | Edit modality |
|---|---|---|---|
| **Spatial (ARC, default)** | `contains`/aggregates | building → {spine · storey-stack} → room → element | **transform** (move/stretch/swap) — ARC is the SOLE transform substrate |
| **Walkers (STR · DISC/MEP)** | ports / route topology | system → run → segment (lateral; crosses rooms & storeys) | **regenerate** (RouteWalk) — STR strengthens, MEP/CW/SP service |
| **Grid (datum)** | `anchored-to`/`spans` | axis → gridline/level → bound set (the edit-handle view) | **drive** (the editor) |

**DECISIONS (called as asked):**
1. **The Z-spine is a first-class BRANCH inside the Spatial facet, NOT a fourth facet.** A stair/riser physically
   occupies the building's space beside the storeys — forcing a facet-switch to grab something visible in 3D is wrong.
   The Spatial tree therefore has two structural directions under the building root:
   ```
   Building
   ├─ SHELL / spine     (VERTICAL: SHELL envelope + circulation core + risers)   ← Z-spanning, extent = f(n)
   │   └─ stair · riser · lift · facade   (instanced-by n on the spine)
   └─ Storey stack      (HORIZONTAL: typical-floor × n  +  per-floor residuals)
       └─ storey → room → element                                                ← contains
   ```
   The storey stack and the spine **share the same `n`** (the level lattice): collapse n→1 ⇒ typical floors *and* their
   spine risers vanish together. The Grid facet remains the *editor* for both; the spine is *content* in the spatial view.
2. **Two edit modalities = the discipline seam.** Spatial **ARC** node → **transform** (pure geometry fold of captured
   placements — ARC is the SOLE transform substrate); **WALKER node (STR · MEP/CW/SP)** → **regenerate** (RouteWalk
   re-walks against the moved ARC — STR re-places strengthening members, MEP re-routes); Grid datum → **drive** (a
   grid edit emits ONE signed op that transforms the ARC spine+storeys and triggers every walker's regeneration).
   STR AND DISC are space-dependent, so they WALK/regenerate — they never transform captured geometry. (Evolution
   2026-06-25 c: STR moved from the transform camp into the walker camp; see §CONSOLIDATION above.)
3. **The grid edit is the one operation; the cross-edges are its fold-or-flag rules** — `anchored` ride, `spans`
   stretch-not-scale (cross-section held), `hosted-by` openings ride + door-fit **RED** (no squash), `instanced-by n`
   re-extent, `abuts` **ORANGE**. "Reshape ARC, the rest aligns without breaking walls / squashing openings" = this
   rule set folding once.
4. **Per-facet, GRACEFUL admission.** Each spanning tree reconstructs independently. Spatial may land 0.000 mm while
   the MEP route topology is incomplete → admit with the spatial facet editable and the system facet flagged "not
   faithful — RouteWalk to rebuild." Honest, not all-or-nothing — this is where the `building_BOM.db`/IFC2BOM landmines
   get caught instead of silently admitted. [[project_modeller_rosettastone_mission]]
5. **instanced-by-n in the Outliner:** one editable node + an `n` badge; expand → the n instances are **derived /
   read-only**; edit the rep → all re-fold; "break out" one instance → a signed op turns it into its own residual node.
   Residuals (measured ~82 % on SampleCastle — real but modest) are ordinary n=1 nodes, not failures.

**PRIOR ART & THE NECESSARY-BUT-NOT-SUFFICIENT LESSON (user 2026-06-25).** The ERP/Mfg path historically used
`IFCtoBOM → *_BOM.db` + `ERP.db` as the **DISC (MEP) BOM template** — precisely *because DISC is not structural but
**space-dependent*** (routed through/around the spatial structure, not contained by it). That pipeline **already
faithfully restores `output.db == extracted.db`** (a reconstruction round-trip in its own right) — **yet it LACKS the
facets above.** So faithful reconstruction is **necessary but NOT sufficient**: the Java/ERP era nailed the
*reconstruction*; the new, load-bearing delta is the **facet/Outliner/batch-edit structure** (spanning trees + the
Z-spine + grid-driven folds + signed editability). The lesson the spec must hold: a RosettaStone pass alone does not
make a model editable — it only earns the right to *attach* the facets. **REFINEMENT (user 2026-06-25): the ERP/Mfg
pipeline is not WRONG — it is CORRECT as far as it goes; the work is to bring the FACET MODELS *into* the same
`*_BOM.db`/`ERP.db`, ADDITIVELY** (the typed cross-edges + the grid/datum lattice + the Z-spine + `instanced-by n`,
stamped as enrichment layers with honest provenance — the overlay doctrine *"promote, don't replace; not a new store"*
[[BOM_AS_OVERLAY_IDEA]], the enrichment-property table of [[CONSTRUCTION_GRID_BOM_DUAL_MODEL]]). So **L0's admitted
substrate IS the existing faithful BOM store ENRICHED with the facet models**, never a parallel rebuild — the
reconstruction the old pipeline already proves is *kept*, and the facets ride on top of it in the same DB. DISC's
"space-dependent BOM template that regenerates" is the prior art for the System facet's **regenerate (RouteWalk)**
modality; **ARC's** "transform captured placements" is the Spatial facet's modality (STR moved to the walker/regenerate
side — evolution 2026-06-25 c); the seam between them is decision #2.

**WITNESSES (JS-port correctness for the NEW facets + folding — NOT a re-run of the compiler RS, which is the Java-era
given).**
- **W-TYPICAL-N** — proves the JS `instanced-by n` FACET percept is a *lossless decomposition*: `factorizeInstancedZ`
  (measured Z translational symmetry, grep-clean) splits elements into reps ∪ instances(=rep+k·p) ∪ residuals and the
  facet reconstructs the captured placements with zero loss; coveredFraction = the honest MEASURED typicality (report,
  don't threshold); SH single-storey control → zero instances (honest n=1). Validates the FACET port, not the compiler
  RS. `scripts/witness_typical_n.js`, engine in `bom_extract.js`.
- **W-FOLD-* / W-OUTLINER (next, the real port deliverables)** — a signed edit on a facet node FOLDS deterministically
  via the op-log (the Java→JS + *folding* benefit the Java era lacked); thereafter the model is no longer expected to
  match extraction. The reconstruction is the Java-proven given; the FOLD is the new build.

### §BUILD-DECOMPOSITION — three separable parts + op-log-driven (user 2026-06-25)
The editor splits into THREE independently-buildable, independently-witnessable parts (each maps to shipping code):
1. **Outliner BOM editor** — owns SELECTION (en-bloc → highlight in canvas) + COMPOSITION (re-parent). **⚠ TRACK: build
   in the MODELLER's Outliner `deploy/dev/bom_tree.js` model + `bonsai_outliner.js` panel** (modeller.html:184 — "the
   richer Find", ALREADY a feature-tree over the op-log), reuse `Bonsai.select` + `kernel_ops.commitOp`. **PORT the
   per-dimension tree PATTERN from the viewer's `navigate_find.js` (reference only) — NEVER build in / deploy to the
   viewer.** A blank facet (e.g. no-MEP) is populated by **RouteWalker** (signed op).
2. **Axis handler** — drag the selected bloc along its ALLOWED axis (constrained DOF). Reuse `grid_kinematics.js`/GEOM_MOVE;
   emits one move op on release.
3. **Align handler** — on release, run cascade + alignment rules (contains ride, anchored/abuts realign, the
   §DIMENSION-HANDLER thresholds), ORANGE-gated; emits the resulting signed ops.

**OP-LOG-DRIVEN, NOT `extracted.db`-TRAVERSAL (the user's framing, correct — and the *why* is crisp).** `extracted.db`
is **immutable** → re-traversing it only ever re-derives the SAME seed (pointless after once); **all change lives in the
op-log.** So:
- `extracted.db` (+ derived edges) = the immutable one-time **SEED**, resolved lazily on first touch. This is "IFC2BOM
  **on the fly**" — but it organizes **POINTERS over already-landed geometry** (land-the-thread), NOT a geometry
  reconstruction → cheap, and it converses with a canvas op-log instead of traversing the DB.
- the **op-log (`kernel_ops`: `commitOp`/`replayOps`/`undoOp`/`redoOp` — SHIPS) is the conversation.** The BOM editor and
  the visual canvas are **two folds of ONE log**, synced bidirectionally over the BroadcastChannel rail — exactly the
  pattern proven on 4D (`schedule_sync`, "both folds of one log"). Edit in tree → canvas re-folds; drag on canvas → tree
  re-resolves the touched branch. Fresh session = re-seed from substrate + replay the log = deterministic.
- **DETERMINISM GATE (carries gap #3):** RouteWalker populating the blank tab — and ANY regeneration — MUST emit a SIGNED
  op (`commitOp`), never a silent side effect, or two replays diverge and "both folds of one log" breaks. Regeneration
  output is a signed fact. This is the one hard rule the whole op-log conversation rests on.

## §DIMENSION-HANDLERS — the active, anticipatory grid (design + what-sticks analysis, 2026-06-25)
Captured from the "anticipatory grid" dialogue. This is the **mortar** for §OUTLINER-COHERENCE: that section laid the
*static* structure (the `instanced-by n` edge, the Z-spine, `spans` stretch-not-scale, `hosted-by`); this one is the
**edit-time behaviour** that makes the grid *obedient and anticipatory*. It also closes a seam the spine left open —
earlier we said keep the **continuous** engine (stretch) and the **discrete** engine (add/remove) *separate*; the
dimension handler is exactly how they **couple**: a continuous drag that, on crossing a threshold, fires a discrete
add/subtract. [[CONSTRUCTION_GRID_BOM_DUAL_MODEL]] [[MODELLING_FROM_BOM_CASCADE]]

**THE DIMENSION HANDLER (first-class object).** Binds a **count `n` + an instance TEMPLATE** to a **governing
dimension** (a span length `L`, or a Z extent `H`) controlled by a datum. It carries: `pitch p`, `min/max` constraints
(min spacing, UBBL, door-crush — from the real AD rule tables, never guessed), the **template** (the thing copy/pasted),
and an **anchor rule** (what holds vs. what stretches). It runs **both directions of the `instanced-by n` edge**:
- **Static / forward fold:** `extent = f(n)` (riser length = n·h; openings span = f(n)) — already in the edge contract.
- **Active / edit-time (NEW):** `n = f(extent)` with **thresholds** — drag the datum and `n` re-derives.

**MECHANICS on a datum drag:**
1. **Continuous (below threshold):** the span stretches; **point-anchored instances HOLD absolute position** (openings
   do NOT scale); only the *fill between them* stretches. An opening is a **point-anchor inside a span**, not a fraction
   of its length. Decision: openings hold their offset from the span's **fixed (un-dragged) end**; new space accrues at
   the **dragged end** (deterministic, measurable).
2. **Threshold (the bridge):** `L` grows past `k·p + margins` → **anticipate** an added instance (ghost it = the
   "anticipatory" grid); `L` shrinks so spacing `< min` → **squash → subtract**. Each add/subtract/paste = **one signed
   op**, **ORANGE-gated** ("room for another window — add?"), **RED-blocked** when it would crush (door-crush / < min).

**THE UNIFICATION (the part worth banking): one handler, any axis, any granularity.** Wall openings and roof-lift
floors are the SAME machine on different axes:
| Drag | Governing dim | Template instanced | Holds invariant |
|---|---|---|---|
| Gridline ⟂ wall | wall length `L` | window/door along the wall | each opening's anchor point |
| Roof datum ↑ | building height `H` | typical floor × n (+ its rooms) | floor internal layout |
| Grid column line | bay length | column at pitch | column section |
"Roof lifted → adds floors, stairs/lifts/restroom flow seamless" = the **Z handler** doing horizontally what the
**wall handler** does: add typical-floor instances; the **spine** runners (stairs/lifts/risers/restroom stacks)
re-extent by `f(n)` because they are `instanced-by n` on the spine; a restroom *stack* is a room-bunch instanced along Z.

**"GRID OBEDIENCE" = THE CASCADE SCHEDULER** (this answers the open gap #6). The obedience chain IS the topological
fold order:
```
datum drag → anchored walls (ride/stretch) → hosted openings (re-count via handler) → spine runners (re-extent f(n))
           → MEP (regenerate, incl. Z risers via depends-on) → 4D/5D (re-roll quantity)
```
Acyclic *downward* (clean order); only `abuts` is the cyclic, user-gated case. MEP "walks Z too" = `depends-on` firing
**regenerate** at the tail after the Z extent changed.

**LAYER PLACEMENT / PORT (fits cleanly, reuse not rebuild):** L0 = the handler binding (n ↔ datum/dim, pitch,
constraints, template, anchor rule) enriched into the BOM store; L1 = each add/subtract/paste a signed op; **L2 =
EXTEND `grid_kinematics.js`/`GridKinematicEngine`** (already does drag→translate/stretch) with threshold add/subtract +
opening-hold; L3 = Outliner node shows the handler (n badge, pitch, template), grid view draws the anticipatory ghost;
L4 = 4D/5D fold the quantity delta. **It also subsumes gap #5 (swap-by-interface):** the handler is the *constrained,
automatable* discrete case ("add another of the SAME at the pitch"); full swap ("choose ANY roof") is the harder cousin.

### WHAT STICKS — graded analysis (the curation)
**🟢 SOLID (well-grounded, build on these):**
- Handler = the *active* form of `instanced-by n` (`extent=f(n)` ↔ `n=f(extent)`). Grounded in an existing edge + existing `GridKinematicEngine`.
- Point-anchored openings HOLD, fill stretches (stretch≠scale). Grounded in the overlay's "point-owned invariant" + `spans` doctrine.
- Axis/granularity generality (one handler: Z floors · wall openings · grid columns). Strong, low-risk unification — the genuinely *grand* claim.
- Obedience chain = the cascade order. It is just the topological order of the downward edges; it resolves gap #6.
- Reuse/extend `GridKinematicEngine` (don't rebuild the fold — it ships).

**🟡 PROVISIONAL (right idea, needs MEASURED grounding before trusting):**
- **Pitch `p` and template must be DERIVED from the wall's real openings, never assumed.** Most real walls have
  *irregular* openings — so the DEFAULT is each opening point-anchored individually; **pitch-instancing applies ONLY
  where a regular pattern is MEASURED** (same non-invent rule that gave instanced-by-n only ~18% on SampleCastle). A
  wall with 0/irregular openings has no template to paste → "add a window" is undefined there (honest, not a failure).
- The add/subtract THRESHOLD constants (min spacing, margins) must come from **real AD/UBBL tables**, not tuned to taste.

**🔴 RISKY (could be the thrash — gate hard / prove first):**
- **Auto add/subtract must NEVER be automatic and NEVER run at import.** Adding a window the source never had = inventing
  an element — allowed ONLY post-import (editing intends to diverge), ONLY user-gated (ORANGE), as a NEW signed authored
  fact. During the RosettaStone admission the handler is INERT. State this as a hard rule or it corrupts the birth certificate.
- **Z-instancing of ROOMS / "restroom flows" is blocked on node-derivation (gap #4):** `IfcSpace=0` ⇒ no room nodes to
  instance. Until rooms are derived (seeded min-cut), Z-instancing works for *elements/spine runners*, not *room bunches*.
- **Live anticipatory ghost during drag** is UX-heavy; correctness-secondary. Defer behind the headless fold proof.

**⏸ PARKED (later, depends on prerequisites):** full MEP Z-regen (needs `depends-on` edge + RouteWalk-Z); full
swap-by-interface (the discrete cousin); the ghost-preview UX.

**WITNESS (when built):** **W-DIM-HANDLER** — on a real wall with measured-regular openings, drag the bounding datum:
openings hold absolute position (0.000 mm) through the continuous range; at the measured threshold exactly ONE signed
add/subtract fires (ORANGE), RED when it would breach min-spacing; the template + pitch are DERIVED from the wall's own
openings (grep-clean, zero invented); re-fold is deterministic via the op-log. Inert during import (no op at admission).

## BUILD ORDER — three phases, each oracle'd against the pristine extracted.db / raw extraction
1. **MATERIALIZE THE GRAPH.** Recover source edges (`contains`, `hosted-by` — Path B) + derive measured edges
   (`abuts` face-touch, `spans` bbox-two-datums, `instanced-by` Z-span/typical-n, `anchored-to` gridline snap).
   Stamp provenance. Reuse: `clash_matrix.js` (spatial-overlap machinery → adjacency twin), `bom_extract.js`
   (envelope/cadence/Z-data), Find facets ([[BOM_AS_OVERLAY_IDEA]]).
   - **W-SDG-GRAPH** — the graph reproduces KNOWN relations on a real building (the 7 SH host edges; the curtain-wall
     aggregates; column-cadence gridlines) with ZERO invented edges; edge-builders grep-clean of class names.
2. **FORWARD FOLD (the overlay MVP).** Edge fold-rules make a handle-drag cascade — pure transform, live, no verbs.
   - **W-SDG-FORWARD** — drag a grid/storey/room handle → owned + forward set re-folds; `transform(extracted)`
     reproduces the real building's geometry, ARC/STR rosetta still 0.000 mm against RAW extraction (frame-invariant);
     the edit is a pure transform of captured geometry, not a re-derive.
3. **BACKWARD PROPAGATE (the exception engine).** Reverse edges raise Δ as orange action messages — thresholded,
   clamped, continuous-Δ vs discrete-choose, halting at pinned stop-gradient nodes, each accept = one signed op.
   - **W-SDG-BACKPROP** — a change surfaces **exactly** the affected nodes (no false ripple, no missed dependent)
     vs a measured oracle; RED/ORANGE verdicts match measured infeasibility; every accepted Δ verified by re-measuring
     against the pristine extracted geometry (rosetta), never the cooked `output.db`.

## PHASE 1 — PATH B SPEC (§PATHB, the concrete first build)
**Goal:** recover the void/fill chain dropped at extraction into a new `rel_fills_host` relation table, so the
`hosted-by` edge (door/window → opening → host wall) is a RECOVERED fact, not a proximity guess.
- **Source relations (verified in real IFC, both IFC4 & IFC2x3):**
  - `IfcRelVoidsElement`: `RelatingBuildingElement` (host wall) → `RelatedOpeningElement` (the `IfcOpeningElement`).
  - `IfcRelFillsElement`: `RelatingOpeningElement` (the opening) → `RelatedBuildingElement` (the door/window filling).
  - Compose on the shared opening GUID: **`filling → opening → host`**. SH(IFC4)=7 voids/7 fills (4 win+3 door);
    DX(IFC2x3)=50 voids/38 fills.
- **Table `rel_fills_host`** (one row per opening that voids a host; mirrors the `rel_aggregates` extraction pattern):
  `opening_guid` PK · `host_guid` · `filling_guid` (NULL = open void, no door/window) · `host_class` · `filling_class`
  · `provenance` (always `'ifc:recovered'` — NON-INVENT; we copy authored relations, derive nothing here).
- **NON-INVENT discipline:** zero proximity, zero class whitelist, zero relative-transform synthesis. The relative
  transform for en-bloc host-ride is DERIVABLE LATER from the already-extracted absolute `element_transforms`
  (filling center vs host center); Phase 1 only recovers the *link*. Grep-clean of role/class names by construction
  (we read IFC relation objects, not element names).
- **Witness `W-SDG-PATHB`** (`scripts/witness_pathb_rel_fills_host.py`): run extraction on real SH + DX, assert
  recovered host-edge count == independent `len(IfcRelVoidsElement∩filled)` from a SECOND read of the source IFC
  (anti-tautology: oracle reads the IFC directly, not the extractor's table), assert SH==7 filled host edges with
  classes {IfcDoor:3, IfcWindow:4}, assert every row `provenance='ifc:recovered'`, assert ZERO rows whose
  filling/host GUID was invented (every GUID must exist in the source IFC). [[RESUME_GIGO_FACING_TEST]]

## PHASE 2 — FORWARD-FOLD SPEC (§FORWARD, the continuous-Δ engine)
**Goal:** the graph stops *describing* and starts *editing*. Grab one handle (a datum plane, or a node), drag it by a
measured Δ, and the **owned set + the forward set re-fold** by applying each edge's fold rule — a PURE TRANSFORM of the
captured `element_transforms`, never a re-derive of the building. This is the continuous machine only (move / stretch);
discrete enumerate-choose (swap roof, add storey) is a different engine and out of scope here.

**Why the datum drag is the MVP handle.** It exercises the three grid edge families at once and is the cleanest pure
transform: `anchored-to` (rigid follow), `spans` (one-end stretch, cross-section held), `contains` (children ride the
parent en-bloc). `hosted-by` rides for free when a host wall is the moved node (opening follows). `abuts` is a backward
ORANGE signal, not a forward fold — deferred to Phase 3.

**Engine `deploy/dev/sdg_fold.js`** — a new PURE module (no DB writes, no verbs, no proximity, no class names):
- `foldDatumDrag(graph, datumId, deltaMm, opts)` → returns a `FoldResult`: `{ moved:[{guid,dx,dy,dz}],
  stretched:[{guid,axis,d_lo_mm,d_hi_mm,new_span_m}], pinned:[guid], unchanged_count }`. It does NOT mutate
  `element_transforms`; it returns the Δ-set a caller (or the witness) applies. `graph` = the five edge tables +
  `element_transforms` read into memory.
- **Fold rules (each is the contract-table row, nothing invented):**
  - `anchored-to(datum d)` → every element with `rel_anchored.datum_id=d` translates by `delta` along `d.axis`
    (rigid, all other axes 0). The offset_mm to the datum is HELD (it rides the datum).
  - `spans(d_lo|d_hi = d)` → the spanning element's end AT the dragged datum moves by `delta`; the OTHER end is held →
    center shifts `delta/2` on the axis, extent (span_m) changes by `±delta`. Cross-section (other two axes) untouched.
  - `contains(parent moved)` → children ride rigid en-bloc: a translated parent propagates its full Δ to every
    `rel_aggregates` descendant (recurse; reuses the `expandAssembly` en-bloc semantics).
  - `hosted-by(host moved)` → when a moved node is a `rel_fills_host.host_guid`, its opening + filling translate with
    it (the wall-stretch case "openings can't divorce their wall"). MVP: rigid follow on translate.
- **Defences wired in (ML lessons #3, stop-gradient):** `opts.pinnedGuids` HALTS propagation through a pinned node
  (stop-gradient); a Δ below `opts.thresholdMm` (default 0.3 mm) prunes that ripple (vanish); a single-handle Δ that
  would move any element more than `opts.clampMm` (default a large multiple of the drag) returns that element under a
  `clamped:[]` list rather than applying — surfaced, never silently exploded. (RED/ORANGE *verdicts* are Phase 3; here
  we only prune/clamp/stop the transform.)
- **Provenance / non-invent:** every entry in `moved`/`stretched` traces to an edge row (`anchored`/`spans`/`contains`/
  `hosted-by`) by id — an element with NO edge to the dragged datum is NOT touched. Grep-clean of IFC class/role names
  by construction (the engine reads edge tables + transforms, never element names).

**Witness `W-SDG-FORWARD` (`scripts/witness_sdg_forward.js`)** — oracle = RAW extraction (the pristine `extracted.db`
geometry), NEVER the cooked `output.db`. Frame-invariant by construction (all checks are Δ-relative). Asserts:
1. **Identity round-trip rosetta (the keystone):** `foldDatumDrag(d, +Δ)` then `foldDatumDrag(d, −Δ)` returns EVERY
   moved/stretched element to its raw-extraction geometry — **0.000 mm** worst offset. Proves the fold is a pure
   invertible transform with zero drift / zero re-derive / zero invention. No ground-truth answer needed.
2. **Analytic-Δ rosetta (independent oracle):** for a `+Δ` drag, recompute the EXPECTED post-fold geometry directly
   from raw extraction + the drag (anchored: `center + Δ·axis`; spans: near-end `+Δ`, far end held, `span += Δ`;
   contains: child `+`parent Δ) and assert the engine's `FoldResult` matches to ≤1e-6 m. The oracle is computed in the
   witness from `element_transforms`, NOT read back from the engine (anti-tautology).
3. **Zero-drag invariance:** `Δ=0` ⇒ empty `moved`/`stretched` (fold of identity = identity).
4. **Zero-invented coverage:** every moved/stretched guid has an edge row to the dragged datum; conversely every
   `rel_anchored.datum_id=d` element (minus pinned/threshold-pruned) appears in `moved` — no false ripple, no missed
   dependent.
5. **Stop-gradient:** a pinned element and everything reachable ONLY through it is absent from the result.
6. **Construct-generality:** run the SAME engine on SH **and** the Infra-Bridge IFC (datums emerged with grid=0) — a
   datum drag folds bridge spans/anchors identically; zero invented, identity round-trip 0.000 mm on both.

**Boundary (honest):** this MVP is the *engine + rosetta*, headless (node, against real `extracted.db`), mirroring how
each edge shipped before its UI. The handle-drag *UI* (grab a datum line in the viewer → live re-fold on the canvas)
is the follow-on slice once the engine is rosetta-GREEN. RED/ORANGE exception messages, cyclic `abuts` realignment, and
discrete swaps are Phase 3 (W-SDG-BACKPROP), deliberately excluded here.

## STATUS / NEXT
Spec spine written 2026-06-25 (no code yet; spec-first). Grounded this session in real source IFC (SH/Terminal/Bridge)
+ Terminal extraction + the Find/grid/clash/bom_extract code. **First concrete step = Phase 1 Path B** (recover
`rel_fills_host` in `extractIFCtoDB.py`) — it is the prerequisite for the orientation lane AND three graph edges, so
it is built once and serves both. Then materialize the remaining derived edges + W-SDG-GRAPH.
- **§PATHB DONE 2026-06-25** (branch lane/benchmark-clash-resolution): `rel_fills_host` table + extraction block added
  to `extractIFCtoDB.py` (mirrors `rel_aggregates`, §-logged `§PATHB`). W-SDG-PATHB GREEN on real SH(7/7)+DX(38/38).
  Commit `51c5f298`.
- **ORIENTATION ABSTRACTION DONE 2026-06-25** (the doctrine half — RESUME_GIGO_FACING_TEST mandate CLOSED). Commit
  `42cfbd6b`. Killed `hasFront`/`DIRECTIONAL_ROLE_TOKENS` (Java `ExtractionPopulator`) + `_inheritHostRotation` (JS
  `bonsai_library`); orientation = captured world yaw for EVERY class, uncaptured → honest null + `§ORIENT-UNCAPTURED`
  (never a fabricated 0). `readFillsHost` reconciled to `filling_guid` → R21 loads 7 SH host edges, `host_element_ref`
  populates. **Door (the only RED class) → GREEN**: `W-ROTATION-ROSETTA-ALL` 10/10 (drop{0,90,270}==extraction),
  `W-DROP-VS-COMPILER` §POS-CONGRUENCE ≤0.07 mm (DOOR 3=3 WINDOW 4=4 OpeningElement 7=7 FURN 14=14),
  `W-ROTATION-ROSETTA-SH` Δ-spread 0°. Orientation path grep-clean of class names (Java+JS). Tests rewritten to the
  new doctrine (FacingGateV2 5/5, FacingCapture 4/4); SHPipelineTest G1 counts RAISED 37/11/48/9→47/14/61/12 (captured
  yaw correctly de-factorizes rotation-varying groups; proven compiler-faithful, not inflation) 21/21. *(DXPipelineTest
  RED 3F/2E is PRE-EXISTING structural breakage on this WIP branch — DUPLEX_SINGLE_UNIT_STD 73 vs ~487 lines — NOT
  orientation.)*
- **§ABUTS DONE 2026-06-25** (`bb1b7a2e`): `rel_adjacency` (face-touch, `derived:face-touch`) — `_face_touch` +
  `derive_adjacency` pure geometry, grep-clean, rtree-pruned. W-SDG-ABUTS 16/16 (builder == independent brute-force,
  every edge physically touches, zero invented; SH 159 / DX 771).
- **§ANCHORED DONE 2026-06-25** (`9c91be9a`): `datum_plane` + `rel_anchored` (`anchored-to`, `derived:cadence`).
  Datums EMERGE from face cadence (≥min_support faces align within tol) — no IfcGrid/storey needed. W-SDG-ANCHORED
  18/18 (physical, support-honest, crisp, deterministic; SH 32 datums / DX 139 — **DX both storey planes Z=0,3.1
  emerged with zero IfcBuildingStorey recovery**).
- **W-SDG-GRAPH DONE 2026-06-25** (`ce7e030a`) = THE construct-generality proof. Same builders on a house
  (Ifc4_SampleHouse) AND a bridge (Infra-Bridge IFC4X3, NO grid/storey/voids): contains 34/27 == IFC exactly,
  hosted-by 7/**0** (bridge fabricates nothing — 0 voids → 0 edges), abuts 159/66, datums 32/**21 emerged with
  grid=0 storey=0**, anchored 263/115. Zero invented across every edge, every derived edge physically true. 13/13.
  **The graph is construct-agnostic — a house and a bridge run identical grep-clean builders.**
- **§SPANS DONE 2026-06-25** (`1ee465a1`): `rel_spans` (`derived:bbox-spans-datums`) — element bbox reaches from
  one datum to a different datum on an axis; reuses datum_plane (almost no new machinery). `derive_spans` grep-clean.
  W-SDG-SPANS 18/18 on SH(100)/DX(680)/**Bridge(45)** — every edge re-measured (2 distinct datums, span_m==datum
  separation), zero invented, deterministic.
- **Phase 1 MATERIALIZE = 5 of 6 edges shipped & witnessed on a building AND a bridge, zero invented:** recovered
  (`contains`, `hosted-by`) + derived (`abuts`, `anchored-to`, `spans`). **Remaining: `instanced-by n`** (typical-
  storey × n + Z-span; extent=f(n) — the repetition edge, ties to [[CONSTRUCTION_GRID_BOM_DUAL_MODEL]] §SHELL-N-ZSPAN).
- **§FORWARD DONE 2026-06-25** (the graph stops describing, starts EDITING — continuous-Δ engine). Pure module
  `deploy/dev/sdg_fold.js` `foldDatumDrag(graph, datumId, deltaMm, opts)`: drag a datum handle → `anchored-to` rigid-
  follows, `spans` stretches one end (sizes held), `contains` cascades en-bloc, `hosted-by` rides; defences wired
  (pinned=stop-gradient, thresholdMm=vanish-prune, clampMm=explode-guard). No DB writes, no verbs, no class names.
  **W-SDG-FORWARD 30/30 GREEN** (`scripts/witness_sdg_forward.js`, oracle=RAW extraction): identity round-trip
  `fold(+Δ)+fold(−Δ)` = **0.000 mm** worst offset on SH/DX/Bridge; every move = exactly |Δ| on the datum axis;
  every stretch = old±Δ between real datums; Δ=0 no-op; zero-invented + no-missed/no-false ripple; stop-gradient
  halts a pinned seed. SH datum-21(Z) moved 18/stretched 32; DX 10/68; **Bridge datum-17(Z) stretched 20 with
  grid=0** (same engine, construct-agnostic). The fold is pure & linear ⇒ invertibility is exact.
- **§FORWARD UI-WIRING DONE 2026-06-25** (`ae20ba6d`): `deploy/dev/sdg_fold_ui.js` bridges the engine to the live
  scene — `buildGraph(query)` loads the 5 edge tables+transforms from the in-mem DB; `sceneDelta(foldResult,graph)`
  → per-mesh three.js deltas (moved = IFC(dx,dy,dz)→three(x,z,−y) translate; stretched = center-shift translate +
  axis scale new/old, held end fixed); `applyFold`/`reset` move meshes by GUID (individual+batched+instanced),
  exact restore; `enableDatumDrag` draws draggable datum-plane handles + pointer glue (smoke shell). Engine
  refined: **moved/stretched DISJOINT** (a span on the dragged axis is governed by its 2 datums, never also rigid-
  moved via cascade/host) → W-SDG-FORWARD **33/33** (+disjoint guard). **W-SDG-FOLD-UI 30/30** (`scripts/witness_
  sdg_fold_ui.js`): graph counts==DB, deltas match IFC→three map+span scale, translate round-trips 0.000mm,
  applyFold→reset exact. index.html loads both modules after verb_expand.
- **§FORWARD LIVE DEMO DONE 2026-06-25** (`ee404041`): datum-fold runnable in the live viewer on SampleHouse.
  `scripts/bake_sdg_edges.py` derives datum/anchored/spans **in the SERVED (library) frame** from the DB's own
  center±bbox (the library DB is a DIFFERENT per-element frame than the raw `*_extracted.db` fixture — measured,
  not a constant offset — so fixture datums can't be reused), via the same shipped `derive_*` (zero drift),
  idempotent, zero-invented (SH 31 datums/202 anchors/76 spans). `SDGFoldUI.toggle` + a ◫ toolbar button.
  **`scripts/smoke_sdg_fold_live.js` headless-Chromium WIRING smoke ALL GREEN**: scripts load, button exists,
  baked DB returns 31 datums, toggle enables 31 handles, a live fold moves **25 real scene meshes by GUID**;
  screenshot confirms house renders + handles draw. ⚠ live edges are LIBRARY-FRAME (self-consistent for the demo),
  NOT the extraction-frame rosetta-witnessed edges. ⚠ on the library DB `rel_aggregates`/`rel_fills_host` are
  absent → live fold = anchored-to + spans; contains/hosted-by are honest no-ops. ⚠ datum handles are fixed
  40×40m (dwarf the ~10m house) = cosmetic polish (size to model bbox). Public OCI/GH deploy NOT done (user's call;
  deploy guards apply).
- **NEXT (Phase-1 closeout + reconciliation):**
  1. **Carry extraction-frame edges through the library blend** (`bake_library_blend.py` + a frame map) so the live
     fold runs the EXACT rosetta-witnessed edges + restores contains/hosted-by — the proper fix for the frame
     divergence (chosen path (a) shipped the demo; (b) is this). Plus handle-sizing polish + public deploy.
  2. **`instanced-by n`** — the last Phase-1 edge (typical-storey × n, extent=f(n)); now safe to build against the
     proven fold-rule contract (ties [[CONSTRUCTION_GRID_BOM_DUAL_MODEL]] §SHELL-N-ZSPAN).
  3. **Phase 3 backprop** (W-SDG-BACKPROP) — reverse edges → RED/ORANGE exceptions, cyclic `abuts` realign, gated.
  4. **§GEODB-WIRING-BUG** (found 2026-09-18, superseded item 4's own premise — see the box above):
     `str_walker_outliner.js:179` calls `CrossEdges.deriveAll(db)` with no `geoDb` — the §REAL-AABB
     fix never executes in production; every abuts edge silently uses the coarse anchor-centred box
     (median 78mm off-centre on 798/934 elements). Pass `geoDb` through at that call site, re-run
     `witness_cross_edges_real_aabb.js` G4, expect most of the 843 SampleCastle disagreements to
     disappear. Not started.
  5. **§ABUTS-ATTRIBUTE-PRIOR** (proposed 2026-09-18, SUPERSEDED — see the box above): tested via
     `ifc_class` as a componenttype proxy and found NOT discriminating (`IfcCovering↔IfcWall` is both
     the #1 disagreeing pair and the #2 agreeing pair). Do not build this against the current 843 —
     re-evaluate only after item 4 lands and G4 is re-run on real geometry.
  6. **§PORT-CONNECTS-RECOVERY** (proposed 2026-09-18, see above) — `port_elements`/`port_connections`
     are schema-declared, never populated; `IfcRelConnectsPorts` real MEP topology is sitting in every
     IFC export, currently discarded at extraction. Would give `cross_edges.js`/`disc_walker.js`'s
     Router real authored connectivity instead of nearest-neighbour inference. Not started — extract
     + verify first, wire a consumer only after row counts are confirmed non-zero and spot-checked.
**Separate, already-decided lane:** the orientation abstraction (kill `hasFront`/`_inheritHostRotation`) — doctrinally
one with this (measure-don't-whitelist); its Path B half is shared with Phase 1 here.
