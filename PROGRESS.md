# PROGRESS — Current Development State

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.

## Current State

**▶ MODELLER USER GUIDE — ✅ INTEGRATED 2026-07-01 (bim-compiler PR #10, `docs/modeller-guide-integrate`).** The
screenshot-rich per-tool `ModellerGuide.md` revamp (20 real E2E frames under `docs/img/modeller/`, `mkdocs build
--strict`=0) integrated onto the live docs tip `0967ebcdd`. Closed the 3 handoff coherence gates: stale-base fixed,
Teams cross-link restored, orphan `ModellerUserGuide.md` deleted + nav collapsed to ONE entry. **OUTWARD STEP LEFT TO
USER:** merge PR #10, then deploy via `ALLOW_SHRINK=1 paths="ModellerUserGuide/" scripts/safe_gh_deploy.sh` (orphan
deletion removes a live gh-pages page → seatbelt aborts unless blessed). Deferred polish (non-gating): live-app 2× frame
recapture, Getting-started→Troubleshooting scaffold. Handoff record: bim-ootb `modeller/tests/E2E_SUITE_RESUME.md
§HANDOFF-RESOLVED`.

**▶ MODELLER FIRST-CLASS: real-user E2E gates + Walk-tool fixes — ✅ DONE+LIVE 2026-07-01 (bim-ootb #584, sw v25).**
User standard: tests must emulate a real USER SERIES OF ACTIONS through the PRODUCTION path and confirm complete/
perfect/atomic by MATHS — engine-seam witnesses gave FALSE confidence. Built the E2E pattern (real `pg.mouse`/
`#hist-slider`/`window.discWalk`, asserted by op-log + scene-graph + readPixels): **W-E2E-MOVE 9/9** (open→pick→drag
X gizmo→commit→undo; atomic to 2.4e-8m, X-only, reversible to 0.00m — MOVE is genuinely first-class; also proved the
conformity GATE fires in the real move path) and **W-E2E-WALK 8/8**. Checking the REAL path exposed the Walk tool was
BROKEN two ways the seams hid: (1) `_dwEnsureBorrow`'s shared-IDB rules cache HUNG under transaction contention →
rendered nothing (FIX: timeout-guarded `_loadDbBuf` in disc_walker.js → bare-fetch fallback); (2) `_commitDiscWalk`
did N serial sealed commits → 112s UI FREEZE on a 267-fixture ELEC walk (FIX: one batched `commitSeedGroup` → 2.5s,
kernel_ops orders by rowid so the shared baseTs is safe). Real Duplex ELEC now: 2.5s, 267 rendered, verifyChain ok,
undo reverses. Regressions green (W-DW-PIXELPROBE 6/6, W-SEED-TRUNK-RENDER 8/8). Lesson banked
[[feedback_test_real_user_path_not_seams]]. **▷ FULL SUITE IN PROGRESS (WIP branch `lane/modeller-e2e-suite`, NOT
merged — 2 active lane sessions):** shared harness `modeller/tests/e2e_harness.js` (real pg.mouse/toolbar/history-slider,
asserts by op-log+scene-graph+readPixels, auto-screenshots → tests/e2e_shots/ for the guide) validated by
`witness_e2e_cut.js` — which already caught a 3rd real finding: **undo after GEOM_CUT collapses the cursor 254→0** (vs
MOVE undo works → CUT-specific; investigate). Roster + guide plan + cadence in `modeller/tests/E2E_SUITE_RESUME.md`
(DO NOT REMOVE). NEXT (fresh session, off origin/main): diagnose CUT-C5, then INSERT/SCALE/ROTATE/SKETCH→EXTRUDE/
ROUTE→SWEEP/FILLET/OPENING/GRID-STRETCH/DELETE/SEED-TRUNK each to a green real-user E2E, then build world-class
`docs/ModellerUserGuide.md` from the captured real screenshots. [[project_modeller_vision_lock]]

**▶ SEED→3D CORRIDOR TRUNK — ✅ DONE + LIVE 2026-06-30 (engine, render GATE, animation ALL shipped).** Human-in-the-loop
service entry → corridor-aware trunk (around real walls, through real doors) → 3D multi-riser (real stairs) → reusable
engine module → **deployed live in the modeller** (bim-ootb #580 sw v23; render gate + animation **#582 sw v24**;
held-out **#583**; all MERGED, GH-Pages verified). All witnessed, all non-invent. Engine witnesses (bim-compiler):
**W-SEED-TRUNK 6/6**, **W-SEED-DEFAULT 6/6**, **W-CORRIDOR-TRUNK 6/6**, **W-RISER-TRUNK 7/7**, **W-SEEDTRUNK-ENGINE 6/6**.
**▷ T1 RENDER GATE + T2 ANIMATION — ✅ DONE+LIVE 2026-06-30** (`prompts/RESUME_SEED_TRUNK.md`, bim-ootb #582 sw v24):
**W-SEED-TRUNK-RENDER 8/8** (`modeller/tests/witness_seed_trunk_render.js`, headless swiftshader, IDB-free engine API).
T1 = `window.__seedTrunkProbe` scene-graph census proves the rendered LineSegments == `planTrunk` net (vertices==2×data
segs, vertical risers, corridor segs, order-independent no-drift maxDrift 5e-7m, canvas litPct 64%) → the eyeball gap is
CLOSED by a machine gate. **The gate caught a real bug:** `_renderSeedTrunk`/`seedTrunk` guarded on `net.refused` truthy,
but on a SUCCESS net `refused` is the integer COUNT of unreachable fixtures (only the early-return is `refused===true`) →
any building with a refused fixture rendered an EMPTY trunk (Duplex ELEC refuses 112/267); fixed to `=== true`. T2 =
construction animation: segments keyed by graph-path distance from the seed (derived from the engine's own coords —
invents no order), banded ground→riser→upper, revealed via `geometry.setDrawRange` over ~2s easeOutCubic; RENDER-only
(data unchanged); `prefers-reduced-motion`→instant; `§SEED-TRUNK-ANIM` gate-asserts the animation ends EXACTLY on net
(animated 32 frames/2033ms finalSegs==5936; reduced-motion instant). **HELD-OUT generalization GREEN** (#583): SampleCastle
7-storey column-framed, multi-riser (3 risers), 208415 segs rendered exactly==net, maxDrift 1.13e-6m. W-DW-PIXELPROBE
regression green. SEED-TRUNK is now FULLY GATED (engine + render + animation). docs/internal/WalkerMaturity.md SEED-TRUNK
row → L4 (LIVE) + RENDER GATED. [[project_terminal_rule_mining]]

**(b) route-to-FACE ACMV — ✅ §FACE-SURFACE DONE 2026-06-30** (user-picked the residual thread; bim-compiler,
**W-FACE-SURFACE 6/6**, `scripts/witness_route_face_surface.js`). FINDING: the ACMV duct-routing "ducts are genuinely
harder" precision (0.269 centre / 0.332 M7 face-by-line @0.15m) is SUBSTANTIALLY a **centre-to-line SCORING ARTIFACT**
on bulky elements, not a real disconnection. A face/surface-aware touch — node-centre→run-LINE gap MINUS both elements'
MEASURED perpendicular half-sections (clamp ≥0) — shows ducts genuinely connect: ACMV nearest-run touch **0.518→0.996**,
while thin PLB is INVARIANT (TE 0.998→0.999, DX 0.978→0.980). GENERALIZES held-out (FS6): duplex_rules routed onto LTU_AHouse (never mined, bulky run) lifts 0.938→0.995, oracle still discriminative. A correction of a known bias, NOT goalpost-moving — guarded
by two falsifiers: PLB-INVARIANCE (bulk-proportional — thin pipes don't move) + RANK-DISCRIMINATION (nearest 0.996, 2nd
0.698 [a fitting is a junction joining ≥2 ducts], 5th 0.014, farthest 0.000 → far runs still rejected). Engine:
`routeChains(disc,bdb,{toFace:true})` now carries `gapSurface` (additive; `gap`/guids/pairing UNCHANGED → W-WALKBACK-MEP
8/8 incl M7 + §DWG 49 / §DXG 12 / nnchain 6 all invariant). Thread (c) is SUBSUMED by §SHIM-SELECT (default-on
rule_shim-driven host-bind = the "promote to mining" intent); (a) stays substrate-BLOCKED. Bim-compiler witness, no
deploy (`gapSurface` opt-in, live dwWalk unchanged). [[project_terminal_rule_mining]]

**§5 cross-building generalization — ✅ DONE 2026-06-30** (bim-compiler `a97978cf`, **W-GENERALIZE-XBUILD 7/7**,
`scripts/witness_generalize_xbuild.js`). The doctrine-central upgrade from SELF-CONSISTENCY (mined-then-applied-to-SAME)
to HELD-OUT: route `duplex_rules` (mined from Duplex) onto **LTU_AHouse** — a house with a real 32k-fitting generic
`IfcFlow*` network NEVER used in mining — scored vs LTU's OWN geometric-touch oracle. **32138 segs, precision 0.839
@0.15m (0.945 @0.30m), 0 fabricated, 0 over the Duplex-measured 3.298m bound** (the measured bound generalizes without
widening). Self-consistency baseline (Duplex-on-Duplex) 0.969; gap 0.130 = the honest measured cost of generalization.
SUBSTRATE FINDING: no held-out MEP target inside SH/DX/SC (SH ARC-only, DX mined-from, SC rainwater-only) — LTU_AHouse
is the genuine residential-domain held-out target. **CURVE extension (W-GENERALIZE-CURVE 6/6, `scripts/witness_generalize_curve.js`):**
the residential rules degrade gracefully across a held-out spectrum — self 0.969 ≥ in-domain house LTU 0.839 >
out-of-domain WBDG_Office 0.749 / Clinic 0.705 / HHS_Office 0.620 @0.15m, 0 fabricated + 0 over the Duplex-mined
3.298m bound on EVERY building. Bim-compiler witnesses, no deploy. **Roadmap #1–#5 now DRAINED;**
residual threads are substrate-gated (placement-cadence generalization has no held-out fixtures) or thin (route-to-FACE
ACMV / ELEC host-bind mining promotion). [[project_terminal_rule_mining]]

**§4 `__dwPixelProbe` render gate — ✅ DONE+LIVE 2026-06-30** (bim-ootb **#579 MERGED, sw v22**). Closes the §3c
verification gap (the connector-edge + assemble render shipped with only §-log/node proof). Added
`window.__dwPixelProbe(disc)` (dwRoot scene-graph census: fixture box InstancedMesh + §3c connector-edge LineSegments
+ tubes + parts, plus a one-frame readPixels litPct) + a render-only witness seam `window.__dwRender`.
**W-DW-PIXELPROBE 6/6** (`modeller/tests/witness_dw_pixelprobe.js`, puppeteer): FP walk on SampleCastle → 759 fixture
instances (2 classes), 1 connector-edge LineSegments covering all 663 enriched sprinklers, §DW-CONNECT hookups==enriched
(count is a node-witnessed value — gate asserts log==render, not a magic number), canvas non-blank, assemble
honest-REFUSE (no network, 0 parts), no pageerror. ⚠ The witness drives the render via the IDB-free engine API
(`dwOpen`/`dwBorrow`) + seam — production `discWalk()` caches rules in `bim_ootb_cache` IndexedDB which hangs under
puppeteer+swiftshader (real browsers fine, curl-verified). sw v21→v22. **NEXT = roadmap #5** (cross-building PLACEMENT
generalization — held-out, the doctrine-central honesty gap). [[project_terminal_rule_mining]]

**§3c ASSEMBLE render + first-class rule_connector — ✅ DONE+LIVE 2026-06-30** (bim-compiler `e74742ad`; bim-ootb
**#578 MERGED, sw v21**, GH-Pages live). NEW `build/project_rule_connector.py` projects `disc_patterns.ad_assembly_connector`
(+manifest) → `rule_connector` per `*_rules.db` (keyed (disc,ifc_class), DECISIVE-only, face/Ø/connects_to verbatim +
standoff): terminal = SPRINKLER+LIGHT (2 rows), duplex = 0 (honest). Applied standalone (zero drift) + wired into both
bake scripts. `disc_walker.connectorEnrich` falls back to `_loadConnectors(disc)` with no caller percept → the modeller
enriches from the deployed DB alone (**W-RULE-CONNECTOR 4/4**: projected == caller path on 151 live SC sprinklers).
Modeller `_renderDiscWalk` draws each fixture's FIXTURE→SERVICE hookup as a pale-cyan edge (§DW-CONNECT);
`_renderDiscAssembly` instantiates catalog parts at routed nodes via the `_dwPrimGeo` seam (§DW-ASSEMBLE, honest-REFUSE
when no network). Full disc-walker suite green; live-verified. **NEXT = roadmap #4** (wire `routeChains` into the modeller
§8E-3 render + `__dwPixelProbe`). [[project_terminal_rule_mining]]

**ELEC host-bind anti-float SPIKE — ✅ WITNESSED 2026-06-29** (bim-compiler `scripts/witness_elec_hostbind.js`,
**W-ELEC-HOSTBIND 5/5**). Confirms the long-standing SH defect (ELEC outlets floating mid-room) is REAL and the
host-bind assumption fixes it. Root: residential ELEC rules mined as `ref_kind='storey'` (density) → `place('ELEC',SH)`
scatters at footprint-cell centres (BEFORE: 26/38 float, median 2.00m off any wall). New additive engine fn
`disc_walker.hostBind(placements,bdb,shim)` snaps each to the nearest REAL wall (project to centreline → push to face),
driven by the shim percept READ FROM `library/ERP.db._shim_attributes` (ELEC_WALL_SHIM | IfcWall | SIDE | 1200mm) —
NOT invented. AFTER: 0/36 float, median 0.145m = exactly wall half-thickness (on the face); 2 honestly REFUSED (no wall
≤6m); every bound point carries a real wall guid. hostBind is OPT-IN (not in dwWalk) → live walkers byte-identical
(nnchain + W-WALKBACK-MEP 8/8 regression-clean). **NEXT (review next session): promote host-bind into the mining
pipeline** — residential ELEC (+ FP alarms) should be `ref_kind='host'` sourced from ERP.db `_shim_attributes`, so the
fix is data-driven not a post-step. Also: ELEC splits wall (outlets/switches) vs ceiling (lights, ELEC_CEILING_SHIM).
[[project_terminal_rule_mining]]

**§8E-3 routed MEP network — ✅ UNBLOCKED+WITNESSED 2026-06-29** (bim-compiler `scripts/witness_walkback_mep.js`,
**W-WALKBACK-MEP 8/8**; spec WALKER_GUARDS §5 + §8E-3). The ⛔ was a SUBSTRATE gap, not an engine fault: `build/disc_walker.js`
`routeChains` reads endpoints DIRECTLY from a real MEP-bearing extracted.db → candidates+oracle share ONE frame by
construction (the §5 local↔site split cannot arise) + endpoint classes present; §8E emitted 0 only because the modeller
passed the LAID ARC-ONLY fixture as bdb. **0→N:** Terminal 5317 segs (PLB+ACMV), Duplex MEP `build/Duplex_mep_extracted.db`
358 segs (PLB), ARC-only SampleHouse 0. NON-INVENT: 5675 segs, 0 fabricated, every gap ≤ measured bound. Walk-back vs a
GEOMETRIC touch oracle (fitting↔pipe-run point-to-3D-seg; IFCs carry NO IfcRelConnectsPorts → geometric touch IS ground
truth): precision (per-rule) PLB 0.896(TE)/0.969(DX) @0.15m; recall ~0.40 = junction-degree coverage. FINDING: ACMV ducts
looser (0.269, nn-to-CENTRE vs face); **M7 opt-in route-to-FACE** (`routeChains(disc,bdb,{toFace:true})`, default OFF → live
`dwWalk` byte-identical) lifts 0.269→0.332 (partial). **NEXT = wire routeChains MEP net into modeller §8E-3 render** (engine
proven, only render+`__dwPixelProbe`+deploy remain). [[project_modeller_vision_lock]]

**§8E-5 GREEN report (the §8D capstone) — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb `lane/arc-mesh-readpixels` b7553ef;
spec §8E-5). ONE harness runs the WHOLE TE walk (ARC→STR→canopy→4 MEP→gate) → emits the inspectable artifact
`modeller/tests/TE_GREEN_REPORT.md`. Per-layer roll-up: ARC EXACT 0.000 / STR col RMSE 0.094m (8 over-span RED) /
canopy 1.38% / MEP ACMV +7% FP +13% tight, ELEC 2.39× finding, PLB routed ⛔ / clash 170→3. **Red-on-theirs (auditing
the as-built): 994 real cross-disc pairs <0.10m, 57 <0.05m** = real coordination clashes Terminal contains
(green-on-ours residual 0.06% + red-on-theirs = the defensible "more correct"). Confidence ECE 0.034 cited.
**W-GREEN-REPORT-TE 7/7. §8E TE SUITE COMPLETE** (§8E-0/1/1b/2a/2b/4/5) except **§8E-3 routed MEP ⛔** (needs a
MEP-bearing substrate / §5 unblock). DEFERRED: 261MB verbatim plate range-stream. [[project_modeller_vision_lock]]

**§8E-4 Stage-2 clash (clash-ON) — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb `lane/arc-mesh-readpixels` 6b9b8b6; spec
§8E-4). The two-stage ablation (§8B): `rule_avoidance` was already MINED (10 pairs, `measured:terminal/global-p05`) and
the gate already iterate-yields + flags-RED — so this is the Δ proof. Walk all 4 MEP discs into the laid ARC as ONE set,
gate OFF→ON. **Δ-TABLE: clashes 170→3 (−98.2%)** · 164 yields · 5 iter · count Δ=0 (4813) · **xy-drift=0** (envelope
preserved) · below-floor=0 · 3 flagged RED · ACMV (top priority) never yields. **W-DW-CLASH-TE 10/10**: S8 oracle —
residual rate **0.06% ≤ real-TE p05 tail 2.17%** (no worse than the engineer); position GENERATED → judged by clash
RATE, not per-element NN. **NEXT = §8E-5 GREEN report + red-on-theirs** over the whole TE walk; §8E-3 routed MEP network
⛔ (needs endpoints / MEP-bearing substrate); DEFERRED 261MB plate stream. [[project_modeller_vision_lock]]

**§8E-2b MEP-family density trades — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb `lane/arc-mesh-readpixels` 6879595 +
bim-compiler cb49ca8f, PUSHED; spec §8E-2b). The 4 MEP discs (PLB/ELEC/FP/ACMV) walk via the shared `disc_walker.js`
engine + render (`_renderDiscWalk`) into the laid TE ARC = "disciplines FILL the ARC" (VISION-LOCK §4). New probe
`__dwPixelProbe` (A/B-isolates the disc-walk layer). **W-DW-DENSITY-TE 8/8**: render+in-frustum; readPixels MEP paints;
100% envelope; count same-order; **ACMV +7% / FP +13% tight**; PLB routed → honest no-network refusal (no fabricated
8175); no fidelity field (measurement doctrine). FINDING (not hidden): ELEC 2.4× over = density-transfer drift (ARC
footprint ≠ disc coverage area). Engine fix: single-placement now envelope-bound (build §DWD 43/§DWG 49/§DXG 12 green).
**NEXT = §8E-4 Stage-2 clash** (mine `rule_avoidance`, re-walk in tandem, before/after interim Δ); §8E-3 MEP routed
network ⛔ (needs endpoints / a MEP-bearing substrate). [[project_modeller_vision_lock]]

**§8E-2a STR space-frame canopy — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb `lane/arc-mesh-readpixels` 01c9312, PUSHED,
not yet PR'd; spec=`prompts/WALKER_GUARDS_ROSETTASTONE_SPEC.md §8E-2a`). The §8E-2 generative tolerance layer: the
33,324-IfcPlate roof = one measured unit `instanced-by n`. New bridge verb `swbCanopyOps` measures the tessellation +
renders a BOUNDED representative canopy into the laid ARC — **count proven NUMERICALLY** (predictedN 33784 vs
extractedN 33324 = 1.38%), never by drawing 33K boxes (verbatim mesh = deferred 261MB stream). **W-STR-CANOPY 8/8**
(unit==measured modal 0.5×0.1×0.11m 0-tol; domain x/y match; NN cadence gen 0.082m vs real 0.150m within band;
readPixels 8511px; §DW-CAP placed=2374 of 33232; empty→0 ops falsifier). Fixture `Terminal_plates_proof.db`.
**NEXT = §8E-2b MEP-family density trades** (PLB/ELEC/FP/ACMV via the separate `disc_walker.js` + `terminal_rules.db`,
rendered into the laid ARC) → then §8E-4 Stage-2 clash. [[project_modeller_vision_lock]]

**§8E-1b STR girder render — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb `lane/arc-mesh-readpixels` b5302cc, PUSHED, not
yet PR'd; spec=`prompts/WALKER_GUARDS_ROSETTASTONE_SPEC.md §8E-1b`). Finished the STR skeleton render: columns rendered
only in the witness — production seeded ARC alone. Lifted the render into reusable bridge verb `swbRenderOps` +
production `_seedStrWalk` (overlays laid ARC, idempotent), and rendered the **girders** `swWalkGirders` computes.
NON-INVENT: column size = measured bbox; girder length = derived bay span; girder section = MEASURED IfcBeam median
0.500×0.750m (n=432). Single-level bay lattice at mean column-top z. **W-STR-INTO-ARC now 11/11** (G1 108 girders
rendered; G2 108/108 endpoints on a walked-column intersection; G3 section==measured 0-tol; G4 readPixels 7281px; G5
bay span within band of beam length). Regulatory handler honestly flags 8 over-span (>18m) girders RED. Fixture rebuilt
with STR IfcBeam. **NEXT = §8E-2 density trades clash-OFF** (PLB/ELEC/FP/ACMV + the GENERATIVE space-frame plate
tessellation render — count/cadence/NN vs oracle, tolerance bar; verbatim 33K-plate 261MB stream stays DEFERRED). Then
§8E-4 Stage-2 clash. Execute progressively (study the §-log, never big-bang). [[project_modeller_vision_lock]]

**§STRETCH-1 ARC grid-STRETCHABLE + gated — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb PR #575, sw v18→v19,
auto-merge armed; spec=`prompts/RESUME_ARC_STRETCHABLE.md`). The vision's PRIMARY handle (3D grid, stretch≠scale)
now works on the REAL seeded building: `foldInsert(op,mv,gridCmds)` applies GEOM_GRID_MOVE to box-proxy WORLD
positions (mirrors the worker's translate/scale); `foldChainToScene` routes commands via `gridBy`; `commitGridMove`
runs the §GATE-1 conformity gate. Was a no-op (inserts fold host-side, grid folds worker-side). **W-GRID-INSERT 6/6
+ §STRETCH-GATE-SMOKE 5/5** + full regression green (ARC/CASCADE/GATE/insert + 3 smokes — core-fold change clean).
**Modeller-vision roadmap: slice 4/N** (substrate → ride → gate → stretchable+gated). [[project_arc_editable_substrate]]

**§GATE-1 RED/ORANGE conformity gate — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb PR #574, sw v17→v18, auto-merge
armed; spec=`prompts/RESUME_MODELLER_CONFORMITY_GATE.md`). The SDG spine's **planner's gate**: after a move/ride,
`commitMove` runs `sdg_gate.evaluate` → **RED** (wall clash / door-out-of-host) + **ORANGE** (tight clearance) →
toast + highlight + §GATE log. DELTA-based (pre-existing as-extracted overlaps ignored), REPORTS-only (op stands,
user-gated), NON-INVENT (pure geometry + recovered edges, CLEARANCE a param). **W-SDG-GATE 6/6** (node) **+
§GATE-SMOKE 6/6** (headless) + cascade regression 6/6. Turns the modeller from a *mover* into a *planner*.
**Modeller-vision roadmap: slice 3 of N done** (§ARC-1 substrate → §SDG-CASCADE ride → §GATE conformity). Next:
revert-RED / gate the stretch engine / ORANGE backprop / enterprise fold. [[project_arc_editable_substrate]]

**§SDG-CASCADE hosted-by ride — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb PR #573, sw v16→v17, auto-merge armed;
spec=`prompts/RESUME_ARC_EDITABLE_SUBSTRATE.md` slice 2). **Drag wall → door/window rides** (the SDG forward fold
on the §ARC-1 substrate): `sdg_cascade.js ridersFor` resolves hosted fillings via the featureId↔guid bridge over
real `rel_fills_host` edges; `commitMove` emits induced GEOM_MOVE per rider (same delta, directional, one-hop).
Pure rigid translation → rosetta-invertible. **W-SDG-CASCADE-MODELLER 7/7** (node: rigid ride, offset-invariant,
−delta recovers original 7e-8mm, non-invent) **+ §SDG-CASCADE-SMOKE 6/6** (headless: wall→door rides +1m). contains
half DROPPED by design (0 ARC element↔element aggregates in SH/Duplex/SampleCastle). [[project_arc_editable_substrate]]

**§ARC-1 editable-ARC substrate — ✅ DONE+WITNESSED 2026-06-29** (bim-ootb PR #571, sw v15→v16, auto-merge armed;
spec=`prompts/RESUME_ARC_EDITABLE_SUBSTRATE.md`). Real ARC building now loads as gizmo-EDITABLE, guid-carrying
`GEOM_INSERT` meshes (was synthetic-only) — the PREREQUISITE substrate for the SDG forward-fold cascade. NON-INVENT
(box world-centre==measured center_xyz <1e-6). featureId↔guid bridge live (`window.__arc{Fid,Guid}*` + persisted
`kernel_ops.output_guid`). **W-ARC-EDITABLE 8/8 + §ARC-SEED-SMOKE 8/8 + §ARC-1 REGRESSION 5/5.** Finding: SampleHouse
hosted-by = 7/7 ARC↔ARC (cascade-ready); aggregates parents non-element STR-assembly → contains needs other data.
NEXT = slice (2) W-SDG-CASCADE-MODELLER (hosted-by drag→ride; contains pending a building w/ element-level aggregates).

**Gate:** `./scripts/run_RosettaStones.sh` — S190 fleet: 116/157 PASS, 4 ALL GREEN (BR,MO,RL,WI). 21 buildings. 9-gate system.

| PFX | EL | GATES | Notes |
|-----|----|-------|-------|
| BR | 33 | 9/9 | ALL GREEN |
| MO | 2791 | 9/9 | ALL GREEN |
| RL | 1 | 9/9 | ALL GREEN |
| WI | 1 | 9/9 | ALL GREEN |
| DX | 1169 | 8/9 | MetadataMissing (IfcOpeningElement) |
| SH | 65 | 8/9 | MetadataMissing (generative MEP) |
| TE | 48428 | 8/10 | C8 mesh diversity, GEO no pairs (federated) |

**Pipeline:** 11 stages. 77 verbs. 7403 products (ERP.db). 4-DB architecture.

## disc-walker density-fix (area-scaled n_measured) — SHIPPED+LIVE 2026-06-28 (lane/benchmark-clash-resolution)
**Done:** placer 708k explosion root-caused + fixed, RouteWalker-aligned (count bounded by measured quantity ×
real ARC occupancy envelope, NOT bbox area). `bake_duplex_rules.py` stamps measured `src_storey_area_m2`;
`disc_walker.js` area-scales fixture counts + places on `occupancy()` cells (fixtures only — network routes).
SampleCastle PLB **708158→752** (×940). Deployed bim-ootb **#558 MERGED**, sw v5, duplex_rules.db content_sha
7551d63b7f57 — live-verified. Docs clash-collapse table corrected (SC 501 vs 3) + redeployed.
**Witnesses:** `witness_disc_walk_density` 43/0 (D-COUNT EXACT, D-ENVELOPE void=0); terminal §DWG 49/0 UNCHANGED;
§DXG 12/0; nnchain landed R2 5315 segs posDrift=0 (1e-6); round-trip PLB GREEN/ELEC WEAK/ACMV RED.
**Doctrine (user, load-bearing):** fidelity needs a ground truth — LANDED routed-endpoints exact 1e-6;
GENERATED fixtures = plausible position, EXACT count, no rmse-as-fidelity. ERP.db-along-route = generated layer,
exact-landing UNCONFIRMED (next audit). Spec=`prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md`.
**Also this session:** ModellerGuide §Walk·Disciplines doc + review arc (prior, deployed). 
**ERP ground-truth audit DONE 2026-06-28** (`build/erp/AUDIT_WALK_GROUNDTRUTH.md`, 3 witnesses re-run 63/0): walk
produces 2 honestly-labelled classes — **LANDED** routed segs (Terminal PLB 4314+ACMV 1001, real→real, posDrift=0
≤1e-6, over-bound=0 → exact-landing CONFIRMED for the routing layer) + **GENERATED** count-exact density fixtures
(PLB/ELEC, count==Σround(density×area)|envelope, position explicitly no-fidelity).
**F-WALK-1 ✅ CLOSED 2026-06-28** (`witness_disc_walk_erp_landed.js` W-TRM-WALK-LANDED 4/0): walked MEP-rich Terminal
thru ERP.db TRM001 views → 5315 landed segs IDENTICAL to terminal_rules.db (L2 from_guid/to_guid/xyz/gap/bound),
non-vacuous (L1 segs>0), 28174 placements ≡ (L3), all on real geometry ≤1e-6 (L4). LANDED-layer ERP-consume path
proven, not asserted.
**F-WALK-2 ✅ CLOSED 2026-06-28** (`witness_disc_walk_roof_bound.js` W-TRM-ROOF-BOUND 10/0): `stamp_terminal_src_area.py`
stamps MEASURED src_storey_area_m2 (z-band footprint from Terminal) on all 37 terminal placement rules; reconcile
carries it into ERP.db ad_placement_measured + rule_placement view (TRM001 regenerated, diff = placement layer ONLY,
both DBs 0-mismatch). Roof now AREA-SCALED not bbox-tile-capped: SC roof 233374→15273 (×15, envelope-bound,
count-exact B2 0-tol, prov=placed:array-density, rules≡erp); DX 3659. Uniform model w/ duplex. Full disc-walker
suite **77/0** (nnchain6+density43+erp-equiv14+erp-landed4+roof-bound10); F-WALK-1 equivalence PRESERVED.
**Engine honesty contract: every walked set now LANDED (real→real 1e-6) or count-exact GENERATED w/ measured density.**
**F-WALK-3 ✅ CLOSED 2026-06-28** (`stamp_routing_src_guids.py`): 4 empty PLB routing src_guids backfilled w/ REAL
Terminal elements (nn rows=actual nn-pair from_guids, main/riser=real IfcPipeSegment); 20/20 real, 0 empty in both
DBs; params untouched (nnchain still 6/0). **AUDIT NOW ZERO open findings — all 3 RESOLVED** (`AUDIT_WALK_GROUNDTRUTH.md
§STATUS`). **DEPLOYED LIVE 2026-06-28** (bim-ootb PR #559 MERGED, sw v6): terminal_rules.db content_sha b72cf8d5b487
on red1oon.github.io/bim-ootb/modeller — curl-verified (src_area present, roof 2785.46, 0 empty routing guids). Drift
cleared; the already-live area-scale engine (#558) now activated for the Terminal-rules Walk roster.
**NB (scope):** F-WALK-1/2/3 + deploy (#559) + LANDED-tube LOD render (#560) ALL DONE this session — see the
"LOD-mesh render" section appended below. Walk now shows LANDED routes as exact tubes + GENERATED fixtures as
marker cubes (the honest visual split).
**✅ W-DW-PRIM CLOSED + LIVE 2026-06-28** (GENERATED-fixture representative primitives): the uniform 0.18³
marker cube in modeller `_renderDiscWalk` is now a per-ifc_class BOX sized to that class's MEASURED median bbox.
NON-INVENT: SIZE only (count+position UNCHANGED, P4); SHAPE stays a box (no fake catalog mesh — only the DIMS
are measured); absent class → honest 0.18 fallback. `build/stamp_src_bbox.py <rules.db> <meta.db>` stamps
bbox_dx/dy/dz (median per class off the meta DB, col-guard+idempotent) → terminal_rules (13 cls/Terminal_meta) +
duplex_rules (4 cls/Duplex_mep_meta). `disc_walker.js` repRules+place carry bx/by/bz; `modeller.html`
_renderDiscWalk groups by ifc_class → BoxGeometry(bx,by,bz), 3-material split preserved, logs §DW-PRIM real dims.
**Witnesses:** `witness_disc_prim.js` W-DW-PRIM **10/10** (P1 stamped==independent meta median 0-tol · P2
IfcNope→null→0.18 fallback · P3 carried · P4 count+xyz≡bbox-stripped walk · P5 box transform exact) +
`smoke_disc_prim.js` 3/3. **§DWG repaired to 49/0** (was pre-existing-RED 39/10 — the card's "49" baseline; F-WALK-2
made fixtures area-density placed but G1 still asserted bbox±1e-6 [occupancy cell-centres sit ≤½-cell past the
footprint] and G2 the old tile cadence [density STRIDES → local NN≠pitch by design]; WITNESS fixed to assert the
right invariant: G1 tol=½ occupancy cell, G2=DENSITY-TRANSFERS count==Σround(density×area)|envelope EXACT). Full
suite: density43·nnchain6·erp-equiv14·erp-landed4·roof10·§DWG49·§DXG12·tube5·shim6·prim10.
**Also §DW_IDB (OFFLINE TODO, same PR):** `dwInit` rules-DB load now routes through the shared bim_ootb_cache/'dbs'
store (IDB hit→miss fetch+put→bare-fetch fallback) → terminal_rules.db/duplex_rules.db open w/ NO network on
revisit (makes sw.js "cached in IndexedDB" true). **DEPLOYED LIVE** (bim-ootb PR #562 MERGED, sw v8): live
red1oon.github.io/bim-ootb/modeller curl-verified — §DW-PRIM render + §DW_IDB present, both live rules DBs
byte-identical to canonical w/ bbox cols. bim-compiler 28b47e01 pushed (lane/benchmark-clash-resolution).
Spec=`prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md §PRIM + §OFFLINE TODO`.

## SC IFC2BOM onboarding + Modelling-from-cascade vision — 2026-06-23 (branch lane/benchmark-clash-resolution)
Cards: `prompts/RESUME_DROP_OUTLINER_ROADMAP.md` §1, `prompts/MODELLING_FROM_BOM_CASCADE.md`, `prompts/ONTOLOGICAL_BOM_EXTRACTION.md`.
- **SC (IFC2x3 residential; files historically named schependomlaan) now compiles: 2/4 → 7/10 gates, oracle minted.** Done in IFC2BOM (4 Java files + classify_sc.yaml):
  - 362-drop fixed — root was a `Unknown` storey-container silently dropped (NOT type-coverage). `IFCtoBOMPipeline` now RECOVERS unmapped containers via `SpatialContainerConfig.discover` instead of dropping.
  - New per-building `reconciliation_tolerance` (yaml, mirrors geometry_fail_threshold) for genuine source catalog-identity duplicate-collapses; SC=6 → delta −6 within tol = PASS.
  - **MEP routed out of BOM by authoritative `elements_meta.discipline`** (`StructuralBomBuilder.isSpatialDiscipline` keeps ARC/STR, routes rest → DISC/RouteWalker). Generalizes the per-building MEP class-list that leaked SC's 60 IfcFlowSegment. REB already filtered.
  - `expected_elements` now = actual placeable (`leafSUM(qty)+composition`) → compiler count gate reconciles (3516==3516).
  - Regression-checked: SH 65/65, DX 192+73=265 UNCHANGED. No compiler/spatial code touched.
- **Remaining SC gates (3, SC's first compile, deeper/separate):** 1 critical placement proof (hard threshold 0 for EXTRACTED), C8 mesh diversity (5 window/door variants = catalog geometry gap), geo_verify drift (known-stale harness — don't hand-roll).
- **Vision banked:** the BOM cascade IS the modelling grammar (subtree move/delete/swap re-folds; 2D×3D grid stretch≠scale w/ host-constrained openings + roof pitch invariant; cascade-derived LOD; signed-foldable-portable BOM = the novelty). SC cascade proven walkable: BUILDING→11 FLOOR→99 SET+52 ASSEMBLY→3516 leaves.
- **Next:** spec construction-verb BOM grammar (WALL/SLAB/ROOF/OPENING = the unlock) OR drop re-measure vs oracle OR SC fidelity gates. Prompt edits are local (prompts/ gitignored); Java+yaml committed this session.

## Benchmark & Clash-Resolution lane (branch lane/benchmark-clash-resolution) — 2026-06-21
Spec `prompts/BENCHMARK_AND_CLASH_RESOLUTION_LANE.md`. Phase A in progress (re-targeting all BIM measures LTU→Terminal 48k).
- ✅ **A3** measure scripts re-targeted to Terminal + re-run (witness logs in `build/erp/measure_*.log`):
  - Pick (W-PICK-MEASURE): median **3.5ms** (min 1.8 / p100 455.5), 2441 draw objects (672 BatchedMesh + 1769 InstancedMesh).
  - Rich clash (W-CLASH-NARROWPHASE): broadphase 4000 pairs in **47ms**, rich verdict **5.14ms/pair**; CLASH **2220** · NEAR-MISS(<50mm) **737** · CLEAR 1043.
- ✅ **A1** IfcClash STR-vs-MEP on 594MB Terminal IFC (`scripts/measure_ifcclash.py`, W-IFCCLASH-TERMINAL): **184.76s end-to-end** (parse 40.4s + tessellate STR 1032 @1.6s + MEP 2419 @138.3s + clash), **77 clashes** with TRUE depth/type (pierce 150mm, protrusion 281.7mm). Replaces "tens of seconds" estimate. NB: counts NOT comparable to our 2220 (different scope — IfcClash=2-disc intersection on IFC-class sets; ours=4000 cross-disc capped candidates). The comparable thing = WORK: 185s tessellate-every-run vs our 47ms SQL broadphase over pre-stored boxes.
- 📌 FACT CORRECTION: Terminal_meta `elements_meta` discipline split is **ARC 35552 · PLB 8175 · ACMV 1570 · STR 1032 · FP 989 · ELEC 833 · MEP 277** (sums to 48428), NOT the lane-header labels. STR selector=IfcBeam/IfcColumn/IfcMember, MEP=IfcFlowTerminal/IfcFlowController.
- ✅ **ERP bench page (`bench_suite.html`) PUBLISHED + LIVE** at https://red1oon.github.io/BIMCompiler/bench_suite.html, linked from MigrateComparison paper + Cross-ERP Rosetta Stone + docs nav. Evolved heavily this session:
  - Dynamic code/size chips from `bench_facts.json` (`scripts/measure_codebase.js`, W-CODEBASE-FACTS, both sides measured): **50.7× LOC · 25.8× MB · 132× tables**; live same-origin recount on the app host, baked off docs.
  - Single-station dial `[ON NETWORK] <> [LOCALHOST]` → network-type chips (LOCALHOST/LAN/OFFICE/CLOUD/WAN, greyed→lit) from `bench_localhost.json` (`scripts/measure_localhost_bench.js`, W-IDMP-LOCALHOST = real `bench_oplog_pg.log` storage primitive). Drives ONLY ⑤ Peer Sync (pure network round-trips: LOCALHOST 1× → WAN ~3571×); other cards network-independent (honest).
  - Card ② repurposed → **Daily 10K + EOD Backup** (live: ~488ms batch + 28.9MB backup ~12ms). ⑤ verifyChain moved to last. Short "What this checks" hint on all 5 cards. Pause now freezes housekeeping (`sleepPausable`).
- ⏳ **A2 iDempiere full-stack 10K = pending.** Booted the real server OK (Release 13 on :8088, DB `idempiere` 1076 tables, `scripts`/env via console-setup) but **this build has NO REST plugin** (404 /api/v1) and ZK-webui automation is impractical → can't script a full-stack batch here. DB-layer 10K already covered by the storage primitive. Server shut down, env restored. To get the real number: add/build the REST plugin or a standalone iDempiere Java client.
- NEXT: A2 full-stack iDempiere (needs REST) · Phase B penetration depth · Phase C-F (mid-flight correct, resolution, semantic clash, incremental reclash, 4D/5D cost).

## TM 4D/5D variance + 360 loop — MERGED+LIVE 2026-06-21
- ✅ 360 loop + kanban/pivot + shopfloor S-curve LIVE (bim-ootb PR #462 sw v684) → `prompts/TM_4D5D_VARIANCE_LANE.md` (+ `prompts/RESUME_360_KANBAN_PIVOT.md`)

## Ninja Create (PackOut/PackIn) — 2026-06-14
- ✅ **SHIPPED** Create face on the Plugin Engine pill (bim-ootb PR #301, erp sw v673): drop .xlsx model sheet →
  preview → Emit & Install through the writable `window.__idmpDb`. Witness `§NINJA-DOM-WITNESS PASS`
  (headless-chrome on the real deploy scripts). Card `prompts/NINJA_MODE_PILL.md` (done).
- ✅ **Witnessed** behaviour teaching sample: `build/erp/fixtures/plugins/asset_status_callout.mjs` +
  `scripts/poc_asset_status.js` → **W-ASSET-STATUS PASS** (callout fires via the `AD_Column.Callout` seam; both
  falsifiers hold). Doctrine documented `docs/ERPUserGuide.md §9` (one .foldbundle = structure+behaviour ≡ 2Pack+JAR).
- ✅ **TWO-WAY ENGINE DONE 2026-06-14** (Opus, feat/erp-substrate-phase012): (1) `NinjaStage.extractModel(db,AD_Window_ID)
  →model` reverse-export — **W-NINJA-EXTRACT** `roundtrip=MATCH` (72285fee) · (2) `Col@class.method` grammar token
  → `AD_Column.Callout` auto-wire — **W-NINJA-CALLOUT** dispatch fires `derived={Description:'Ready'}` (82320be6) ·
  (3) structural-only round-trip caveat documented (3b6b590a).
- ✅ **W-NINJA-EXPORT DONE 2026-06-14** (Opus, 95d0136a) — the workbook-serialize leg: `build/erp/ninja_export.js`
  (`modelToRows`/`modelToWorkbook`/`exportWindow`/`exportBlob`, inverse of `parseRomo`). Full round-trip
  **DB→extractModel→workbook→XLSX bytes→re-read→parseSheet == original**, 21/21 tables MATCH (starter + 19-table
  HRMIS), §FALSIFIER ghost→null. Hardened `extractModel` master-FK detection (LAST *_ID col, not first — fixed
  HRMIS tables with a user `_ID` col before the real FK; W-NINJA-EXTRACT still PASS).
- ✅ **W-NINJA-EXPORT-LIVE SHIPPED 2026-06-14** (bim-ootb PR #309, erp sw v681): Create face "Export an existing
  window" picker (live AD `<select>` → `exportBlob` → `.xlsx` download); `ninja_stage.js?v=2` (extractModel now
  deployed) + `plugin_overlay.js?v=4` + new `ninja_export.js`. Live DOM smoke in headless chrome on the deploy
  bundle: pill→Create→picker 370 windows→stage Ninja window→Export→`AST_Asset.xlsx` re-parses EXACT to
  extractModel (6 grammar cols). **`§W-NINJA-EXPORT-LIVE PASS`.** Item 1 of §OUTSTANDING = DONE.

## Reflexive AD self-edit — engine legs DONE (2026-06-14, Opus)
- ✅ **W-AD-OPLOG-DISTRIB** (`scripts/poc_ad_oplog_distrib.js`, e3e677cd) — dictionary edit → signed append-log →
  re-folds to the SAME dictionary on a 2nd node (verifyChain ok both sides; §FALSIFIER load-bearing). "Mail the append log."
- ✅ **W-AD-SELFEDIT** (`scripts/poc_ad_selfedit.js`) — edit `AD_Field` → form's displayed set re-folds 26→25→26
  = rebuild is re-read, not recompile.
- ✅ **W-AD-SELFEDIT-LIVE SHIPPED 2026-06-14** (bim-ootb PR #312, erp sw v683) — a signed dictionary edit
  repaints the form on the spot, no reload. 3 legs: `ad_parser.js?v=23` `setTipSource` (AD_Field/AD_Window
  reads overlay the sidecar edit via `CrudOverlay.listTip(window.__crud.kernelDb(),…)`); `crud_overlay.js?v=7`
  emits `overlay:committed`; `idempiere.html` wires the tip-source + a refold hook (AD_* commit → invalidate
  `_openWins` + re-`openWindow`/`buildMenu`). Live witness (headless chrome on the bundle): M_MatchInv
  "Organization" grid column vanishes on `IsDisplayed Y→N`, returns on `N→Y`; commit sealed+verifyChain=ok.
  **`§W-AD-SELFEDIT-LIVE PASS`.** Reflexive-AD loop now proven engine + distribution + LIVE DOM.

## Odoo red-band fold-gap — RE-AUDITED (2026-06-14, Opus)
- ✅ **W-ODOO-QWEB** (`scripts/poc_fold_qweb.js`, 852dea16) — `CORE.foldQWeb` folds Odoo invoice line-loop to the cent
  (`price_subtotal=4350.00 maxDiff=0c`); 41/41 QWeb defs extracted → `build/erp/odoo_extras.db`.
- ✅ **Server actions = NOT a code gap** — `§SRVACT-CLASSIFY code=64` all Python, no declarative subset; honestly deferred.
- Panel re-published: https://red1oon.github.io/BIMCompiler/migrate_status_panel.html (44 surfaces, live-verified).

## AD_Process FOLD lane — P1 GeneratePO + P2-leg1 GenShipment DONE/LIVE (2026-06-17, Opus)
- ✅ **P1 ProjectGenOrder (AD_Process 164) KIND-2 fold** — bim-ootb PR #352, erp sw v704, ad_process.js?v=2.
  Folds C_Project → C_Order via `erp_engine.buildDoc` (newVerbs=0). Source-corrected: **Sales** order (not PO),
  Qty=PlannedQty−InvoicedQty; getProject gate → honest `project-not-ready` rejection. **W-PROC-GENPO** +
  **W-PROC-GENPO-LIVE** (poc_proc_genorder.js / poc_genpo_live.js, both EXIT 0).
- ✅ **P2-leg1 InOutGenerate (AD_Process 118) KIND-2 fold** — bim-ootb PR #355, sw v706, ad_process.js?v=3.
  Folds a CO Sales Order → M_InOut shipment via the createShipment archetype (newVerbs=0). Source-extracted:
  toDeliver=QtyOrdered−QtyDelivered; DeliveryRule 'A'→min(toDeliver,onHand) (Availability cap), others
  named-deferred; gate CO+SO. **W-PROC-SHIP** (fold==independent re-derivation, cap load-bearing, falsifier) +
  **W-PROC-SHIP-LIVE** (poc_proc_inout.js / poc_genship_live.js, both EXIT 0). Demand audit: 451 used procs =
  148 KIND-1 / 16 KIND-2 / 287 KIND-3. NEXT: C_Invoice_Generate (119, KIND-2 order→invoice), report procs.

## Archive — DONE/shipped (one-line pointers; detail in cards + memory topic files)
- POS gap-close banked — `prompts/POS_GAP_CLOSE.md # DONE` (2026-06-12g2)
- WH×POS pick lane BUILT, live-verified — `prompts/WH_POS_PICK_LANE.md # DONE` (2026-06-13)
- Multi-lane WAVE 3 — `prompts/MULTI_LANE_WAVE3.md # DONE` (2026-06-12e)
- Multi-lane WAVE 2 — `prompts/MULTI_LANE_LAUNCH.md # DONE` (2026-06-12)
- MIGRATE_POSTING_CONFIG — bim-ootb PR #271 sw v653, IDB ad_seed_v15 (2026-06-12b)
- POS lens addon §P-1..§P-4 — `prompts/POS_LENS_SESSION.md # DONE` LIVE (2026-06-12)
- ERP backend-gap arc — `prompts/ERP_BACKEND_GAP.md` (feat/erp-substrate-phase012, 2026-06-09)
- Backend lane DATA + ENGINE-SEAM half — D2/D3/R2 + C0 + readPostings (2026-06-03)
- Lens-family doctrine — published docs (2026-06-03)
- FRONTEND Item C Accts-Posted lens — bim-ootb PR #94 sw v565 LIVE (2026-06-03)
- iDempiere Renderer #1 (I1) + master-detail drill — sw v560, PR #82/#83/#84 (2026-06-02)
- LENS family lane-3 chrome fleet — PR #92 gh-pages LIVE (2026-06-03)
- STEP-0 §SEAM-FROZEN host conformance — record-panel deliverable (2026-06-03)
- Migrate ShowMe + ERP folder home — LIVE (2026-06-02)
- Lens family phone∥desktop one engine — SPEC hardened + 2 witnesses (2026-06-03)
- Engine POST plugin §13.1 — accounting genome PROVEN (2026-06-02) → [[project_glassbowl]]
- ERPMaker/AnyAppMaker docs + Odoo fold source (2026-06-02) → [[project_erpmaker]]
- Holy Grail doc + falsifier POC prompts + MIT license sweep (2026-06-01)
- ERP Secured/Distributed doctrine + 6-witness POC suite + W-CHAIN live (2026-06-01) → [[project_erp_secured_phase]]
- Glassbowl engine-as-data explorer + lifecycle chain + orbit viz — `docs/GLASSBOWL{,_DOSSIER}.md`, LIVE → [[project_glassbowl]]
- Viewer S-series (S188–S286): browser viewer, DLOD, mobile perf, find/nav, multi-format import, cinematic — see MEMORY.md "Project — Shipped"

## OCI Deployment

- Live: `bim-ootb-live` (SYSNOVA landing + viewer + single DBs). Always upload here.
- Single DB per building: `buildings/{Name}_extracted.db` (metadata + geometry + bbox).
- `deploy/sandbox/` stale (last ~S225) — not used for deploy. `deploy/dev/` is canonical.
- Deploy SOP: `deploy/OCI_UPLOAD.md`

## Earlier Work (compressed)

- **S200-S210:** BIM OOTB browser viewer, OCI deployment, BOQ charts, health checks
- **S195-S198:** Direct DB streaming (replaced Blender .blend pipeline)
- **S188-S193:** RTree, nD engine, DLOD — all Blender-era, superseded by browser viewer
- **S165-S186:** GN instances, chunked loading, cockpit UI — GN HALTED, RTree won
- **2D Layout:** Phase A closed, Java pipeline 5/5, 13/13 conformity. Browser DXF viewer (S236).
- **DAGCompiler:** S190 fleet 21 buildings. S104 IFCtoERP complete.

## Reference

- Docs site: https://red1oon.github.io/BIMCompiler/
- Academic paper: `docs/SPATIAL_COMPILATION_PAPER.md`
- OCI setup: `internal/OCI_SETUP.md`

## LOD-mesh render: LANDED routed network as tubes — SHIPPED 2026-06-28 (lane/benchmark-clash-resolution + bim-ootb)
**Done:** the disc-walker's LANDED routed segments (proven real→real ≤1e-6) now render as cylinder TUBES (LOD mesh)
between the real endpoints instead of flat 1px lines — the disc-walker analogue of the Java compiler placing catalog
geometry AT real positions. GENERATED fixtures stay LOD marker cubes (plausible, no ground truth): the visual split
tube-vs-cube IS the LANDED-vs-GENERATED honesty made visible. `modeller.html:_renderDiscChains` rewritten
(CylinderGeometry + InstancedMesh, per-disc LOD radius DW_TUBE_R, compose mid/quat(up→dir)/scale.y=len).
**Witnesses:** `witness_disc_tube_render.js` W-DW-TUBE 5/5 — T1 1:1 tube/seg (5315), T2 endpoint-exact (all 5315
reconstruct to maxDrift 4e-9m ≤1e-6, faithful THREE quaternion math replicated VERBATIM in node), T3 LOD radius map,
T4 vertical-singularity exact, T5 resident→0 tubes (LANDED-only, fixtures stay cubes). Browser smoke
`smoke_disc_tube.js` 3/3 (module parses, THREE/DiscWalker ready, tube code served). Deployed bim-ootb (sw v7).
**Note:** this is the render of the LANDED layer (toward-Java placement, for the layer that HAS ground truth).
GENERATED-fixture catalog meshes (vs cubes) deliberately NOT done — no source geometry for an absent discipline;
cubes stay the honest "plausible marker."

## Modeller polish backlog → ZERO (except user-gated #3b) — SHIPPED 2026-06-28 (bim-ootb, spec=prompts/RESUME_MODELLER_POLISH.md)
Final three polish legs all LIVE, witness-first, each a fresh worktree off origin/main → PR → auto-merge squash →
live-verified (sw v12→v15). Backlog now at ZERO except the user-gated #3b solid-scale kernel leg.
- **#7 M8 Outliner incremental rebuild** (PR #568, sw v13, W-BONSAI-OUTLINER-INCR 5/5): the Outliner rebuilt BOTH
  the seeded BOM-tree (whole building, 1000s of nodes) AND the flat op-log groups on every `bonsai:oplog` change →
  jank at 100+ features. Now each section renders to its own persistent container; freshly-built HTML is string-diffed
  vs the last render → an unchanged section is left untouched (no innerHTML reparse / no querySelectorAll re-wire). A
  geometry commit changes only the flat HTML → seeded tree DOM reused (node identity preserved); active-blue no longer
  baked — setActive() paints it over the surviving DOM for flat AND tree-leaf rows. Original W-BONSAI-OUTLINER still PASS.
- **#9 H1 Z-drag in pure top view** (PR #569, sw v14, W-BONSAI-ZTOP 4/4): in top view `moveDragPlane('z')` degenerates
  (ray ∥ the vertical plane) → Z-drag was a no-op. `_camTopDown()` detects it; the Z handle maps vertical SCREEN motion
  → world-Z (drag up = +Z, magnitude = px × `_zWorldPerPixel`), through the SAME snappedMoveDelta/commitMoveDrag path.
  Non-top views byte-identical.
- **#6 M7 rich assembly-drop preview** (PR #570, sw v15, W-BONSAI-ASM-PREVIEW 4/4): preview now shows the N CHILD boxes
  at their real landing positions (SAME dropLeaves transform the commit uses), not just one aabb footprint. Gate cleared
  (W-BOM-DROP-CENTER shipped). `bonsai_library.previewLeafBoxes` merges the N box-proxies (capped 2000 → whole-building
  drop falls back to the TRUE footprint box, logged); `showGhost` caches per (hash,yaw,elev) + rigidly translates per
  move. Drop/commit path untouched.
- **⛔ #3b solid-scale on B-rep SOLIDS = DEFERRED by user direction** ("only if authored-wall scaling becomes a real
  need"). occt-wasm generalTransform Copy=false aliases the cached base under a history-scrub re-fold; a real fix =
  recompile occt-wasm Copy=true OR rework the worker shape-release lifecycle (a dedicated kernel session, NOT polish).
  Inserts (the common case) scale fine (#563). The one open question for the user = is authored-wall solid scaling wanted?

## Modeller editor polish + W-DW-PRIM — SHIPPED 2026-06-28 (bim-ootb modeller, spec=prompts/RESUME_MODELLER_POLISH.md)
This session's bim-ootb modeller arc (all LIVE, witness-first, regression-clean; bim-compiler side = build/disc_walker.js + stamps + witnesses, committed `ae063761`):
- **W-DW-PRIM** (PR #562, sw v8): GENERATED disc-walk fixtures render a per-ifc_class BOX of the class's MEASURED median bbox (`stamp_src_bbox.py`→bbox_dx/dy/dz on both rules DBs; size-only, count/pos unchanged). W-DW-PRIM 10/10 + §DWG repaired 39/10→49/0 + §DW_IDB offline rules cache.
- **Gizmo SCALE on inserts** (PR #563, sw v9): edge-anchored cube handles, W-BONSAI-SCALE 10/10. ⛔ solid-scale DEFERRED — occt-wasm generalTransform Copy=false aliases base under history-scrub (kernel rebuild/lifecycle rework, not a polish leg; cheap bake-via-cut tested + FAILS).
- **#5 cursor-per-mode** (PR #564, sw v10, W-BONSAI-CURSOR 12/12) · **#8 error toast** (PR #566, sw v11, W-BONSAI-TOAST 6/6) · **#4 sketch/route point-recovery** (PR #567, sw v12, W-BONSAI-POINTS-RECOVERY 4/4).
- **NEXT polish:** #7 Outliner incremental rebuild (jank 100+ features) · #6 assembly-drop preview (after BOM-drop anchor lane) · #9 Z-drag top-view · #3b solid-scale kernel leg. **DX-MEP residential standard = already DONE/LIVE (#557), NOT a todo** (stale memory corrected).
