# Walker Doctrine — disc_walker fundamentals (ANTI-DRIFT CORE DOC)

> ⚠ **CORE / LOAD-BEARING.** These are SETTLED fundamentals (established 2026-06-27 → 2026-06-30, user-confirmed),
> hardened here because they were scattered across memory + `prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md` and that
> invited cross-session drift. Read this BEFORE any disc-walker / MEP-walk / rules-DB work. If a session's behaviour
> contradicts a LOCKED rule below, the session has drifted — stop and reconcile, do not "fix" by overriding the rule.
> Companion (the working spec, mutable): `prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md`.

## §1 — LOCKED: building-class → rules-DB mapping
**The walk axis is BUILDING-CLASS, never per-building. Discipline is a `WHERE` column, never a file.**

| Building | Class | Rules DB | Why |
|----------|-------|----------|-----|
| SampleHouse, Duplex, **SampleCastle (SC)** | residential | **`duplex_rules.db`** | small/residential — DX cadence + clearances |
| Terminal, Clinic, Hospital, large/complex | complex | `terminal_rules.db` | LOD400, tightest trades |

- **SMALL/RESIDENTIAL BUILDINGS USE `duplex_rules.db`. They do NOT walk Terminal rules in production.** (prompt §SC L253:
  "SC … uses DX rules, no new file"; memory `project_dx_mep_residential_standard`: deployed `window._dwRules` auto-select
  `house/SH/DX/SC → duplex_rules.db, else terminal_rules.db`.)
- **NEVER make a per-building rules file** (no `SC_disc.db`). SC vent cadence, if mined, goes in as **ACMV rows in
  `duplex_rules.db`** with `provenance=measured:samplecastle/*` + src_guids. Fragmenting the discipline axis is the wrong cut.
- Cross-disc tables (`rule_avoidance` = disc-PAIRS, `rule_place_order`) stay WHOLE — never split by discipline.

### ⚠ Known fragility (the drift trap — guard it)
`disc_walker.dwInit(SQL, baseUrl, rulesFile)` **defaults `rulesFile='terminal_rules.db'`** (back-compat). "Small→DX" is
therefore enforced only by the CALLER (`window._dwRules` in bim-ootb). **Any new caller MUST pass `'duplex_rules.db'` for a
residential building** — relying on the default silently walks a house with Terminal LOD400 cadence (wrong, dense). Candidate
hardening (not yet done; flag before relying on the default): make the engine require an explicit class or auto-select.

## §2 — Terminal's role: LOD400 reference + BORROW source (not a small-building ruleset)
Terminal is the **densest/tightest LOD400 model** (measured cross-disc p05 FP|ELEC = 0.155m = the reference clearance;
memory `project_dx_mep_class_boundary`). Its job for small buildings is **NOT** to be their ruleset. It is:
1. The **LOD400 clearance/mesh reference**.
2. A **BORROW source for disciplines ABSENT from the residential set.** `duplex_rules.db` covers ELEC/ACMV/PLB only — it has
   **no FP** (fire/sprinkler) and no rich STR. When a small-building demo wants FP/sprinkler devices, **borrow the Terminal FP
   rules** (`IfcFireSuppressionTerminal`→IfcCovering ceiling, `IfcAlarm`→IfcWall — both MEASURED, see §SHIM-SELECT) as a
   **SEPARATE class**, rendered with **LOD400 mesh priority** (a fine sprinkler/alarm component), not lumped into the residential
   walk. (User-established, re-confirmed 2026-06-30.)
3. The mining ground for measured cadence/clearance/host rules (it has the real fixtures).

**Borrow = reuse the measured Terminal rule rows for that one discipline; it is NOT "switch the building to Terminal rules".**

**Implemented (`W-BORROW-FP` 6/6, `scripts/witness_borrow_fp.js`):** `disc_walker.dwBorrow(disc, db)` registers a
per-discipline source. Per-discipline reads (`repRules`/`countPer`/`route`/`routeChains`/`_loadRuleShims`) route to
`_dbFor(disc) = _borrow[disc] || _db`; cross-disc tables (`clearance`/`order`/`gate`) stay on the PRIMARY `_db`. Proven on
SampleCastle (residential, primary=duplex_rules): FP absent from duplex → `dwBorrow('FP', terminalDb)` → 247 FP placed
(151 sprinklers host-bound to real `IfcCovering` ceilings), classes from Terminal while ELEC stays on duplex, count
bounded by `density×area∩envelope` (not an explosion), Terminal MEASURED bbox carried, gate clearance still the duplex
pair-set (3, not Terminal's 10). Each placement carries a `prim` semantic-kind tag (`_primFor`, §5 LOD seam).

## §3 — MEP relationship taxonomy (route MEP work by which class a device is)
1. **Networked** (route→join→shim at PORTS): supply/waste plumbing, ducted HVAC. Needs `IfcPort`/connectors.
   Oracle = Duplex-MEP (`W-WALKBACK-MEP`).
   - **FACE-SURFACE measurement note (`W-FACE-SURFACE`, 2026-06-30):** when scoring routed touch for a BULKY discipline
     (ducts), measure SURFACE-to-surface — node-centre→run-LINE gap MINUS both elements' MEASURED perpendicular
     half-sections (clamp ≥0). Centre-to-line over-states a duct's gap by ~its half-section, so the ACMV "ducts are
     genuinely harder" precision (0.269 centre / 0.332 face-by-line @0.15m) is substantially a SCORING ARTIFACT: surface
     touch lifts ACMV nearest-run 0.518→0.996 while thin PLB is INVARIANT (0.998→0.999). It is a correction, not free
     leniency — guarded by PLB-invariance (bulk-proportional) + rank-discrimination (far runs still rejected, 0.000).
     `routeChains{toFace}` carries `gapSurface` (additive; pairing/guids/`gap` unchanged). GENERALIZES held-out: duplex_rules→LTU_AHouse (never mined, bulky run) lifts 0.938→0.995 (FS6).
2. **Host-bound standalone** (host-bind + size, **NO join**): vent grilles (`host=IfcWindow, mount=TOP`), ELEC outlets
   (`host=IfcWall, SIDE`), ceiling lights / sprinklers / air terminals (`host=IfcCovering, BOTTOM`), wall alarms (`IfcWall`).
   Governed by host (`rule_shim`) + count/size rule. Oracle = SC's 13 grilles + Terminal fixtures (`§SHIM-SELECT`).
3. **Run without recorded joins** (segments, no ports): reconstructed by PROXIMITY (nn route). E.g. SC's 60 `hwa afvoer`
   rainwater downpipes.

## §4 — Non-invent boundaries (the prime rule, walker edition)
- **LANDED** (real→real, e.g. routed endpoints on real elements): land EXACTLY (1e-6, guid-matched). May be trusted.
- **GENERATED** (fills an ABSENT discipline): position is PLAUSIBLE, never landed → the ONE confirmable property is COUNT →
  make COUNT exact; NEVER print rmse/cover as fidelity. SIZE is measurable (per-class median bbox, §PRIM) — size only.
- **Host-bind** snaps a floating fixture onto its MEASURED host **only when one exists in reach, else REFUSE (stays floating,
  counted)** — never fabricated onto a host. Count is always preserved (bound ∪ refused = input).
- **No fabricated networks.** If the IFC has no ports/connectors, do not synthesise a duct/pipe network (SC vent-extraction
  was REFUTED at source and dropped for exactly this reason — prompt §ADDENDUM).

## §5 — LOD / mesh (POC vs finish state)
- **POC (now):** GENERATED fixtures render as a per-ifc_class representative primitive BOX sized to the class's MEASURED median
  bbox (`§PRIM`, `W-DW-PRIM`). Goal = visually impressive + working, **without cheating** (size measured, count exact, position
  plausible/host-bound).
- **Finish state (future):** the modeller swaps a high/fine **component library** (LOD400 sprinkler/grille/outlet meshes) for the
  primitive — same placement, richer mesh. Keep the seam: a borrowed device is a SEPARATE class so its mesh can be upgraded
  independently.

## §6 — What the witnesses test (so a TEST is not mistaken for production)
- `witness_disc_walk_generalize.js` (**§DWG**) walks **terminal_rules on SH/DX/SC** — this is a **GENERALIZATION TEST** (proves
  Terminal-mined density transfers to a building it was never mined from). It is **NOT the production path** (production = §1
  mapping). Do not read §DWG as "we walk Terminal on small buildings."
- `witness_disc_walk_duplex_generalize.js` (**§DXG**) = the residential-rules clash-gate generalization.
- `witness_shim_select.js` (**W-SHIM-SELECT**), `witness_dwwalk_hostbind.js` (**W-DWWALK-HOSTBIND**),
  `witness_hostbind_agnostic.js`, `witness_elec_hostbind.js`, `witness_walkback_mep.js` = the host-bind / selection-key /
  walk-back layers. Host-bind is **DEFAULT-ON** since §SHIM-SELECT (2026-06-30); `{noHostBind:true}` restores raw floating.

## §7 — MEP joint (elbow/tee) rotation: EXTRACT via mini-BOM RosettaStone, never compute (2026-07-07)

**This section is additive, not a rewrite of §1-§6** — it closes a DIFFERENT gap: none of §1-§6 above compute a
FITTING's own rotation (they route/host-bind/generate WHOLE fixtures or networks; a fitting's orientation at a
bend was, until this session, computed from scratch via bisector trigonometry on the JS Modeller side —
`bim-ootb/modeller/disc_walker.js`'s `bendFinder`/`fittingOrientation`, built same-day as this doc entry). That
computed-not-extracted approach is now **proven wrong on real data** (below) and should be treated as a
fallback of last resort, not the primary path.

**The real mechanism to extract from instead — code that already exists and is tested, not aspirational:**

| Concept | Real code | What it does |
|---|---|---|
| Tack accumulation | `DAGCompiler/src/main/java/com/bim/compiler/bom/walker/PlacementCollectorVisitor.java` | `child_abs = parent_abs + rotated(dx,dy,dz) + bomOrigin` — O(1) per node, reads the ancestor stack, never recomputes from root |
| Shim (phantom host anchor) | `docs/archive/DISC_VALIDATION_DB_SRS.md §6.12.2 pt.2` | Zero-offset placeholder; its position *is* the host surface position — melts into the host, no geometry of its own |
| Joint-piece rotation | `X_M_BOMLine.java` (`rotation_rule` column) + `DAGCompiler/.../coordinate/LocalCoord.java` + `library/BOMTierResolver.java` | A tee/elbow's rotation is a value **extracted once from a real IFC**, stored on the BOM line, replayed — never derived from two direction vectors |
| Real fitting catalog | `library/component_library.db` — `component_types`/`component_definitions` | 4,200 real `PIPE_FITTING` + 683 `DUCT_FITTING` + 291 `FLOW_FITTING` rows, each with a real `geometry_hash`, `attachment_face`, `up_axis`/`forward_axis`, `orientation` (PENDANT/UPRIGHT/HORIZONTAL/VERTICAL/MIXED) |

**The recursive mini-BOM shape (not a whole-building compile — see `prompts/Modeller/DISC_Walker/DISC_ROSETTASTONE_MEP_MINISET.md` for the full spec):**

```
COMPLETE_MEP_RUN  (parent BOM — abstract pattern, reusable across any route length)
  ├── START        shim @ meter/mainline entry + first joint piece      qty=1  FIXED
  ├── MID  × n      joint piece + straight run to the next joint         qty=VARIABLE (n = however many real junctions the actual route has)
  └── END          last joint piece + terminal device                   qty=1  FIXED
```
MID's `qty_type=VARIABLE` reuses the existing InterimWorkshop/UOM mechanism (`§6.12.2 pt.6`) — not new
invention. START/END are always exactly one each; only MID's count varies with the real route.

**Proof this matters — real numbers, not a hypothetical (`prompts/Modeller/DISC_Walker/mep_rosettastone_miniset.db`,
extracted from `SJTII_Terminal`, a real fire-suppression sprinkler branch, GUIDs re-queryable in that artifact's
`provenance_log` table):**

- **Tee fitting:** naive bisector of the incoming/outgoing pipe direction vectors predicts roughly a −45° turn.
  The real extracted rotation is a clean **π/2 axis-aligned turn — ~135° off.** A tee is a rigid 3-port casting,
  not a continuously-bending 2-port elbow; bisecting two path vectors is a category error for it.
- **Reducer/transition:** incoming and outgoing path directions are coaxial (straight through), so bisector
  predicts **zero rotation**. The real value is a compound `(−π/2, π/2, 0)` turn — the piece re-orients its own
  authored local mesh axes, something a path-direction bisector has no way to see at all.

**Non-invent boundary, this section's own addition to §4's list:** a fitting's rotation is **LANDED** (§4's
first bullet — real→real) when a matching real mini-BOM fragment exists for that joint's discipline/topology
shape (2-way vs 3-way) — replay its extracted `rotation_rule`. Only fall back to computed bisector geometry
when genuinely no real mini-BOM match exists, and if so, **flag it low-confidence** — do not present a computed
rotation with the same weight as an extracted one. This is the same LANDED/GENERATED distinction §4 already
makes for position; it applies to fitting rotation exactly the same way.

## §8 — Pipe/duct CROSS-SECTION: EXTRACT, never a flat constant — HARD FAIL, no fallback (2026-07-07)

**✅ DONE, PR #692 (`feat/mep-real-crosssection`, `ddbafc5`), merged. Result — a REAL behavior change, not
just a size fix, read this before assuming the walked network still "looks the same":** only **FP** has a
real, clean, reusable product to extract from (`FP_Drop_Pipe`, ≈21.3mm, real). **CW, SP, ACMV, and ELEC do
NOT** — `component_library.db` has no clean per-discipline product for them, only raw per-instance IFC
dumps (thousands of individually-GUID-named rows, not a reusable catalog entry) — and a candidate second
source (`dagevu_catalog.json`'s generic `PIPE_COLD_WATER_25MM`/`DUCT_ROUND_250MM` entries) was checked and
REJECTED: its declared dimensions don't match the real geometry its own `geometry_hash` actually links to
(`DUCT_ROUND_250MM` measures 48×70mm for real, not round/250mm). Per the hard-fail rule, these disciplines
are now **honestly refused** rather than rendered wrong. Measured on real Duplex production data: 204 real
CW+SP segments → **0 emitted**, all refused. **This means the walked network today shows LESS than before
(FP only), not a same-looking-but-corrected one** — that is the doctrine working as intended (refuse beats
fabricate), but it is a real, visible drop in coverage until CW/SP/ACMV/ELEC get real catalog products
added, not a regression to "fix back." Round pipes are also approximated as a square sweep profile
(the kernel has no circular option) — disclosed, not silently picked, flagged as a known approximation.

**Found and confirmed, not hypothetical:** `routewalker.js`'s `RW_PIPE_NOMINAL_MM = 50` is a bare literal —
no product, no BOM line, no IFC element behind it. `rwSweepOps()` feeds it as `profile:{w:pw,h:pw}` to every
`GEOM_SWEEP`, meaning **every pipe/duct segment, every discipline, renders as an identical 50mm SQUARE
prism** regardless of the real building's real pipe shape or size. Checked against `FP_Drop_Pipe` (the real
product already extracted in `§7`'s mini-BOM proof, real bbox cross-section ≈21.3mm): today's render is
**~2.3× oversized and the wrong shape family** (square prism vs. a real pipe's round-ish cross-section) —
this is not "close enough," it fails on both axes at once.

**The real mechanism to port — `DAGCompiler/.../bom/walker/InterimWorkshop.java` (`§6.12.2 §6`), already
tested, not aspirational:**
```java
// The library product provides the cross-section dimensions (diameter, wall thickness).
// Only the forward-axis half-extent is replaced by targetLengthM / 2.0.
// Cross-section axes are unchanged.
case "X" -> new double[]{ targetLengthM / 2.0, d / 2.0, h / 2.0 };
```
Rule: pull the REAL cross-section (width/depth/height) from a matching real product in
`library/component_library.db`; replace ONLY the forward-axis half-extent with the real computed length
(from real anchor-to-anchor distance — the walker already gets this part right). Two dimensions stay real
and fixed per-product; one varies per-instance. Never the reverse (a flat constant for the fixed dimensions).

**HARD FAIL, NO FALLBACK — this is the actual rule, not a recommendation:** if no real matching product
exists in `component_library.db` for a given discipline/class, the walker must **REFUSE** that segment
(flag it, low-confidence/`WALKER_GAP`, same pattern as every other refuse-over-fabricate case in this doc) —
it must NOT fall back to any invented constant, `RW_PIPE_NOMINAL_MM` or otherwise. A wrong-but-present
number is worse than an honest gap, because it silently misrepresents every dimension check, every clash
gate, and every visual review downstream. This generalizes §4's LANDED/GENERATED distinction to
cross-section the same way `§7` already generalized it to rotation — do not re-introduce a flat constant
here or anywhere else in this walker family; check for one before adding new segment-generation code.

**Scope note (2026-07-07):** the constant taints SIX call sites, not one — `rwSweepOps`'s profile default
(the visual sweep), the clash-detection cross-section vs. the ARC envelope (3 call sites), the actual
DB-inserted pipe `bbox_x/y/z` for both the pattern-walk and fixture-connect paths (2 more), and the
FP/structure clearance-enforcement cross-section (`rwClearStructure`). A fix that only patches the visual
sweep leaves clash gates and clearance checks running against the wrong geometry while the render looks
right — worse than before, because it now LOOKS fixed. Any fix here must cover all six.

## §9 — Full-codebase drift audit (2026-07-07) — the same violation exists elsewhere, ranked

A read-only sweep of every `modeller/*.js` rendering-relevant file, checked against real source tables
(`component_library.db`, `terminal_rules.db`, `duplex_rules.db`, `mep_rw.db`), for the SAME class of bug
§8 found. Findings, ranked by real-world impact — **not fixed yet, this is the scouting report**:

1. **HIGH, bigger blast radius than the pipe bug — `routewalker.js:1084`, `_rwPlaceFromBOM` ("Path B",
   the path most non-Terminal buildings actually use).** Every MEP fixture (toilet, sink, light, switch,
   outlet, sprinkler, diffuser, fan, aircon, fridge, data point) gets an identical hardcoded
   `0.15×0.15×0.15m` box, regardless of the real product's real size. A real source exists and is
   completely unused: `library/component_library.db`'s `ad_product_dim` table has real measured
   width/depth/height per product category (e.g. `FIXTURE_TOILET` real ≈0.4×0.7×0.4m — the hardcoded box
   renders it at roughly 1/3 to 1/5 size per axis; `ELEC_OUTLET` real ≈0.085×0.04×0.085m — the hardcoded
   box renders it ~2× oversized). `grep -rn "ad_product_dim" modeller/*.js` → zero hits. The
   doctrine-compliant version of this exact pattern already exists in the sibling engine `disc_walker.js`
   (`_placer`, reads real `rule_placement.bbox_dx/dy/dz`) — proving the fix pattern is already proven
   elsewhere in this codebase, just not ported to `routewalker.js`'s BOM path.
2. **The `RW_PIPE_CROSS`/`RW_PIPE_NOMINAL_MM` scope-widening note above** — same finding, folded in.
3. **MEDIUM — `routewalker.js` room-detection fallback** (~lines 969/976, 1101/1109): when a storey's ARC
   bbox data is missing/null, a room footprint is silently invented (`v[4] || 10`, `room.bx || 4`, etc.)
   with no log/flag — unlike this same file's OWN STR "line-proxy" fallback pattern
   (`str_walker_bridge.js`), which explicitly logs "non-invent" when it substitutes. Fix = disclose when
   it fires, matching the file's own existing convention, not necessarily remove the fallback itself.
4. **LOW-MEDIUM, latent risk not an active bug — `str_walker_bridge.js:161`**: a column-bbox fallback
   (`{bx:0.4, by:0.4, bz:3}`) appears currently unreachable (the real `colBbox` map is built from the same
   source `srcGuid`s), but has no disclosure/log unlike the sibling fallback three lines below it. Flag
   for removal or explicit logging if the column-collection logic ever changes.
5. **Reviewed and judged NOT violations** (legitimate, disclosed, or precedented — do not re-flag): ARC
   palette colors (explicitly "COSMETIC ONLY, non-invent geometry holds"), STR legend colors (same
   pattern), `RW_IFC_MAP.*.rgba` (a fixed per-discipline legend color — worth a quick disambiguation check
   that it never clobbers a real per-element material-color read path, since it writes to the same
   `elements_meta.material_rgba` column real material data would occupy, but not itself a violation),
   Bonsai's own authoring-tool UI defaults (mesh color, fillet radius — no possible "real" source for
   freehand-authored geometry), `bonsai_library.js`'s CATALOG (already doctrine-compliant, cited as the
   reference implementation), algorithmic tolerances/clamps applied to real data (`grid_kinematics.js`,
   `sdg_gate.js`, `cross_edges.js`, `disc_walker.js`'s `reach_m`), and `walker_confidence.js`'s calibration
   blocks (explicitly disclosed as derived-and-witnessed, not invented).

**Priority for the follow-up session:** (1) wire `_rwPlaceFromBOM` to `ad_product_dim` — highest impact,
affects nearly every fixture in nearly every building; (2) extend the pipe cross-section fix to all six
usages, not just the sweep; (3) log the room-bbox fallback when it fires; (4) low-priority disclosure fix
in `str_walker_bridge.js`.

## §10 — ONE shared gate, not N point-fixes (user directive, 2026-07-07)

§8/§9 found the SAME violation at six-plus call sites, in two independent walker files, and predicted the
same shape will recur ("check for one before adding new segment-generation code" — i.e. relying on every
future author remembering the rule by hand). **User correction: stop patching individual call sites —
build ONE shared gate every leaf placement (pipe, fixture, future component) is FORCED through**, so a
future violation hard-fails loudly (a missing real source propagates a visible debug error) instead of
silently rendering a wrong-but-plausible number. This supersedes treating §8/§9's findings as N separate
point-fixes.

**Real data confirmed sufficient to build this now, not a blocker:**
- `ad_product_dim` (`library/component_library.db`) — real `width/depth/height` per product AND real
  connection points: `conn_points` = JSON `[{"face":"BACK","type":"PLUMB"},...]` — this IS a real
  shim/anchor record, same shape as `ad_assembly_connector` (`face`/`connector_type`/`position`/
  `diameter_mm`/`connects_to`, §GEOM_LOFT follow-up spec in `BONSAI_ARRAY_PATTERN_SPEC.md` already cited
  this table for fittings). Fixtures and fittings share the same real anchor-record shape.
- `component_library.db`'s real `PIPE_FITTING`/`FLOW_FITTING` catalog (already wired via `GEOM_INSERT`,
  §7) is the reference implementation of "leaf placement goes through the real mesh component."

**The gate, one shared module (name TBD by the build session, e.g. `real_placement_resolver.js`):**
```
resolveRealPlacement({discipline, category, ifc_class, ...context})
  → looks up ad_product_dim (dims) + conn_points/ad_assembly_connector (anchor) for a real match
  → MATCH: returns {width, depth, height, anchor} — real, sourced, citable
  → NO MATCH: THROWS / hard-fails — logs WALKER_GAP with full context (discipline, category, what was
    searched), propagates to caller — caller MUST surface this (console error + a visible flagged/refused
    state), never catch-and-substitute a constant
```
Every leaf placement path (`_rwPlaceFromBOM`'s fixtures, `rwSweepOps`'s pipes, any future `GEOM_INSERT`
caller) calls this ONE function instead of reading `ad_product_dim`/inventing a box independently. This
is the mechanism that makes §8/§9's rule structurally hard to violate again, not just documented harder
to violate.

**✅ DONE, PR #693 (`feat/real-placement-gate`, merged), same day.** `modeller/real_placement_resolver.js`
— `resolveRealPlacement({discipline, category, ifc_class, productHint})`, real lookup against
`ad_product_dim` via a curated `PRODUCT_ALIAS` map; **throws `WalkerGapError` (`WALKER_GAP`) with full
context on no match** — caller must catch, log (`§RPR-HARDFAIL`), count as refused, never substitute a
constant. Wired into `_rwPlaceFromBOM`: real dims replace the old `0.15×0.15×0.15` box (TOILET
0.4×0.7×0.4, SINK 0.5×0.45×0.2, OUTLET/SWITCH 0.085×0.04×0.085, LIGHT 0.3×0.3×0.1, SPRINKLER
0.1×0.1×0.15). Hard-fail path proven reachable on real data: 6 genuinely-absent products (AIRCON_POINT,
CEILING_FAN, EXHAUST_FAN, FLOOR_TRAP, OUTLET_GFCI, SUPPLY_DIFFUSER) honestly refused in a real
`mep_rw.db` recipe, counted in `result.fixturesRefused`, never written. Witness `witness_real_placement_
resolver.js` 15/15. Regression: `witness_route_pattern_bridge.js` 10/10, `witness_mep_rosettastone_
lookup.js` 26/26 clean; `witness_bend_fitting.js` 21/22 — the one failure (`sweepRows=0`) is a CORRECT,
EXPECTED consequence of `§8`'s own fix (CW/SP now honestly refused on Duplex, 0 tube sweeps), not a
regression — re-verified directly against merged `main`. **The witness itself is now stale** (its own
assertion "M4 tube rendering unaffected" tests an assumption `§8` intentionally invalidated) — needs
updating to assert the new correct behavior, not reverted toward the old one.

**Disclosed, out-of-scope findings from the build session, not yet fixed:** `viewer/routewalker.js` has
an identical stale copy of the same fixture-box bug (a separate file, untouched); the repo's resident
`.db` building files lack an `elements_meta.building` column, independently breaking room-detection on
those exact files (pre-existing, unrelated to this fix).

## §11 — FIRST PRINCIPLE, MANDATORY, UNBREAKABLE, NO EXCEPTION: no non-LOD400 content may be presented
## as an element's real geometry, in the Viewer OR the Modeller — for ANY building (user directive, 2026-07-08)

**This section broadens §4/§8/§9/§10's non-invent rule beyond its original scope.** Everything above this
line governs WALKER-GENERATED content (fixtures/pipes/fittings the walker itself places). This section
states the SAME principle applies to the base ARC-EXTRACTED geometry too — the walls/windows/doors/
furniture that come straight from a building's own IFC extraction, not from a walker at all. Investigated
2026-07-08 after the public `ModellerGuide.md`'s screenshots were found visually plain (flat walls, no
window-frame/glass detail, blocky furniture) — the investigation confirmed this specific instance is
**honest** (Duplex's real source IFC genuinely only contains this much detail — verified both by `M3`
witness `boxFallback=0 triExact=253/253` AND by direct IFC-content inspection, `IFCEXTRUDEDAREASOLID`/
`IFCMAPPEDITEM` swept-profile geometry, zero `IFCFACETEDBREP`), not a pipeline bug. But that same
investigation surfaced the actual gap this section is written to close:

**Scope, stated precisely (user correction, 2026-07-08 — GIGO is not this rule's concern):** this rule
governs PIPELINE FIDELITY ONLY — does the pipeline render what it actually extracted, or does it invent/
substitute something else when a real match is missing? It does NOT police how rich or plain a building's
OWN source IFC happens to be. A plain source file honestly rendered plain is GIGO, not a violation, and
needs no guard, no threshold, no design pass. **The guard is binary, not graduated:** either the pipeline
shows real extracted content, or it honestly refuses/blocks — there is no third state where it is allowed
to quietly substitute invented content and call it real. `witness_e2e_mv_parity.js` M3 (`boxFallback===0`)
already proves faithful DISPLAY of whatever is in the DB; `extractIFCtoDB.py`'s `§ILLEGAL_PARAMETRIC_FALLBACK`
already hard-fails on total tessellation failure rather than inventing a substitute. The concrete gap this
section closes is narrower than a first draft of it implied: individual code paths that DO have a real vs.
no-match branch (e.g. a walker or fixture-placement routine picking a catalog box) must resolve the
no-match case the SAME way — refuse, count, log — never a flat invented stand-in. First fix under this
rule: `modeller.html`'s MEP fixture placement (`fix/mep-fixture-no-invented-box`, bim-ootb) — an unmatched
fixture used to fall back to a hardcoded generic box; now it refuses and logs instead, matching the
cross-section check right next to it in the same function (§8, already correct).

**The rule, stated plainly:** neither app may present non-LOD400 geometry to the user AS IF it were the
real, finished representation of an element — not silently, not by default. If real LOD400 detail isn't
available, the element must be shown in a way that is HONESTLY DISTINGUISHABLE as not-real-detail (or the
code path refuses outright), never dressed up as finished geometry.

**The proof this is achievable without a performance/practicality tradeoff already exists — in the
Viewer, not yet in the Modeller.** Alt+X ghost/X-ray mode (`viewer/navigate_find.js`,
`toggleGhostXray`/`_buildMergedGhost`, memory `project_altx_ghost`) already demonstrates the correct
pattern: real elements render as real mesh; when the Viewer needs a cheap, honest way to represent
presence/position WITHOUT claiming detail, it uses an EXPLICITLY SEPARATE, clearly-distinguished
representation — instanced bbox WIREFRAMES, sourced directly from `element_transforms.bbox_*` (free,
instant, no invented detail), discipline-colored, never conflated visually with "this is the real
building." **Selection, hit-testing, and interaction do not need or use full detailed mesh either** — an
RTree/bbox-based spatial index is the proven, already-available mechanism for that, fully decoupled from
what gets rendered as "the building." **Conclusion: there is no valid performance or practicality excuse
for the PRIMARY render to compromise on this** — the tools that make selection/interaction cheap
(RTree + bbox) are separate from, and do not require, compromising the primary visual representation.
The Modeller must inherit this SAME standard the Viewer already has. There is no exception class for "this
particular building's IFC happened to be simple" — the rule governs what is ALLOWED to be presented as
real, not what any given source file happens to contain.

**Status (corrected 2026-07-08 — no design pass needed, the guard is simple):** an earlier draft of this
section called for "a real design pass" to draw an LOD400 detail-floor threshold before anything could be
built. That overstated it — there is no threshold to calibrate. The guard is just: at any code path with a
real-match-or-not branch, resolve "not" by refusing + counting + logging, never by substituting invented
content. `§8`'s cross-section refusal already does this; the fixture-placement fix above (`fix/mep-
fixture-no-invented-box`) is the same pattern applied a second time. **Enforcement is per-site, added as
each real-vs-invented branch is found** (grep for fallback/default/placeholder patterns near catalog or
geometry lookups), not a single central gate to design in advance. Cite `WalkerDoctrine.md §11` rather than
re-deriving or re-litigating the principle; do not re-open the "needs a design pass" framing.

## §12 — ARC is Viewer-equivalent (no separate gate); every walked DISC needs a POST-WALK,
## INDEPENDENTLY-CODED oracle — never the engine grading itself (user directive, 2026-07-09)

**Two different disciplines, two different correctness questions — do not conflate them.**

**ARC:** the base extracted mesh (walls/windows/doors/furniture straight from the building's own IFC) is
rendered by the SAME method as the Viewer — both `real_geometry.js` (Modeller) and `viewer/streaming.js`
(Viewer) read the identical tables (`component_geometries`/`base_geometries`) and do the identical decode
(`vertices`/`faces` BLOB → `Float32Array` → `THREE.BufferGeometry`). If the Viewer is trusted — and it is,
it's the baseline everything else is checked against — then ARC rendered through this same method needs NO
separate correctness gate. Parsing/extraction happens TO the data beforehand; it does not touch the render
method itself. This is §VISION-LOCK sentence 1 (`RESUME_GRAPH_MODELLER_INTEGRATION.md` — "ARC is the SOLE
edited substrate") stated as a testable claim, not a new rule.

**Every non-ARC discipline (§VISION-LOCK sentence 4 — "EVERY non-ARC discipline is a WALKER that FILLS the
ARC space") is different: it has no real captured mesh of its own to compare against** — it's PLACED by
`disc_walker.js` from mined rules. The only honest correctness check is: did the walk's OUTPUT match an
INDEPENDENTLY-DERIVED ground truth (real geometric touch, real measured host positions, an independently
re-implemented count formula) — computed by code that shares NO state with the walk itself, run AFTER the
walk completes, never during it. **This is a hard boundary, not a style preference: the walk (browser-side
JS, `disc_walker.js`) and the compiler's own RosettaStone/RSS gate (`RosettaStoneGateTest.java`, a completely
separate Java system) must never share a data path or a self-report — a gate that reads a number the system
under test wrote about itself is not independent, it's the system grading its own homework.** ⚠ A concrete
instance of this failure mode was found 2026-07-09 in RSS's own G1-COUNT gate (`readGenerativeCount()` reads
`MAX(GenerativeCount) FROM c_order` — a self-reported count written by the SAME generator run being tested,
from the SAME output database) — **noted here as a known gap, NOT to be fixed by touching Java.** The
approach for disc_walker/Modeller-side discipline correctness is, and stays, a SEPARATE JS witness layer with
independently-coded oracles — never patching the Java gate to close this shape of hole.

**Proof this is already the live, working pattern (not a new proposal) — three independent-oracle mirrors,
found and kept in sync 2026-07-09 while fixing the `occupancy()` true-midpoint defect:**
`witness_disc_walk_generalize.js`'s G2 `occCells`, `witness_disc_walk_density.js`'s D-ENVELOPE `occCells`, and
`witness_hostbind_agnostic.js`'s H1 hardcoded bound-count all deliberately RE-DERIVE the engine's own logic
locally instead of calling `disc_walker.js`'s functions directly — each carries a comment to that effect
("computed HERE so the count check is a genuine oracle, not the engine grading itself"). When `occupancy()`
changed, all three had to be updated by hand to stay in sync — that friction is the PROOF the independence is
real (a witness that silently auto-tracked the engine would never have needed re-baselining). Cite
`WalkerDoctrine.md §12` for this principle rather than re-deriving it.

## §13 — an oracle's VERDICT is only as trustworthy as its own reference data being real: verify the
## oracle BEFORE trusting what it reports, every time, not just once (user directive, 2026-07-09 PM)

**§12 established that every walked discipline needs an independent, post-walk oracle. This section closes
the gap §12 didn't cover: an "independent" oracle can still be WRONG in a way that never shows up as a code
bug — its own REFERENCE DATA can be empty, vacuous, or not the ground truth it claims to be, and the oracle
will keep reporting a verdict (pass or fail) that reads as meaningful when it structurally can't be.** This
is a DIFFERENT failure mode than the self-grading problem §12 fixes: the oracle can be genuinely independent
(different code, computed after the walk, sharing no state with the engine) and STILL be measuring nothing,
if what it's comparing against isn't real for the case under test.

**Concrete, real instance found 2026-07-09 (not hypothetical — this is why the rule exists):**
`modeller/tests/witness_disc_density.js`'s D4/D4b checks compare each discipline's walked COUNT against
`realCount(disc)`, queried from `Terminal_meta.db`. That file is confirmed (direct query, this session)
**100% `discipline='ARC'`** — zero rows for ELEC/PLB/FP/ACMV, by design (it's the ARC-only substrate the
walker fills). So `realCount('ELEC')` etc. are ALWAYS 0 for this building, making the walked/real ratio
Infinity or NaN — the check will FAIL (or divide-by-zero) regardless of whether the walker's generated count
is good or garbage. A "3 pre-existing fails, unchanged before/after a port" report is TECHNICALLY true and
STILL misleading — it confirms a broken oracle stayed equally broken, not that the walker's count-fidelity
was validated. Nobody would notice this from the pass/fail numbers alone; it only surfaces by asking "does
this reference file actually contain what the oracle assumes it contains" and checking directly.

**The rule, stated plainly: before trusting ANY oracle-based witness's verdict — pass or fail — verify the
oracle's OWN reference data is non-trivial for the specific case being tested.** Concretely, for a
count-vs-real-data oracle: assert the reference count is `> 0` (or otherwise meaningfully populated) BEFORE
computing the comparison ratio, and FAIL LOUD with a distinct, named signal (e.g. `§ORACLE-VACUOUS`) if it
isn't — never let a vacuous reference silently produce a pass, a fail, or an Infinity/NaN that then gets
counted as if it were a real result. This mirrors the project's own "refuse beats fabricate" doctrine (§4,
§8, §11) applied one layer up: to the TEST layer, not just the generation layer. A witness that can't tell
the difference between "the walker got it wrong" and "there was nothing real to compare against" is not
foolproof, no matter how many times it's re-run.

**Concrete requirement for ANY future mesh-to-mesh or count-vs-oracle comparison work (the actual "true RSS"
mechanism this section was requested for, 2026-07-09 PM foresight discussion):** before building or trusting
a geometry/mesh-fidelity comparison for a discipline on a specific building, first confirm — and assert,
not assume — that a REAL, populated reference exists for that exact (building, discipline) pair. Where it
doesn't (Terminal's MEP/STR today: no real MEP/STR mesh payload exists anywhere in this project's data,
confirmed exhaustively across every DB checked), the correct outcome is an HONEST REFUSAL to claim
mesh-fidelity was tested — falling back to the GENERATED-class bar (§4: count-exact, envelope-plausible,
never claimed landed) — not a silently-vacuous "pass." Where a real reference DOES exist (SampleCastle's
real 23 columns/174 beams/9 members, Duplex's real MEP network via the already-proven `W-WALKBACK-MEP`
geometric-touch oracle), build the mesh/geometry-level comparison there FIRST — that is where "true RSS"
(mesh-to-mesh, not just count/position) is actually achievable, and where it should be proven before ever
being assumed to generalize to a building (like Terminal) that has no such reference at all.

## §14 — Rooms are auto-infused into every ARC, always (2026-07-10)

**Rule:** every building we extract (embedded/"ready-made") or a user imports must get real room data
(`spatial_structure`/`IfcSpace`) baked in automatically, as a normal step of extraction — not a manual
follow-up script, not optional.

- If the source IFC has real `IfcSpace` entities: extract them for real (`extractIFC2DB.js` already reads
  `IfcSpace` into `elements_meta` — the gap is downstream steps like the ARC-only strip dropping them before
  shipping). Fix: carry `spatial_structure` through every strip/consolidate step, same as any other ARC table.
- If the source IFC has none: fall back to `compile_rooms.py` (wall-enclosure flood-fill, already built,
  currently a manual script) and label those rooms `≈`/approximate — never presented as real, never fed to
  `disc_walker.js`'s schedule-mode `spacesOf()` (which already correctly excludes `≈` rows).
- Applies to every building, no exceptions: 7 of today's 8 embedded `_ARC.db` have zero rooms (only Terminal
  has real ones baked in) — this rule closes that gap going forward, for extraction and import alike.

## §15 — Room/space compile is VERSIONED and self-healing, not "automatic once" (2026-07-21, extends §14)

**§14 established rooms must be auto-infused, always, no manual follow-up.** This section adds the part
§14 didn't cover: what happens when the COMPILE ALGORITHM itself improves after a building already has
rooms baked in. Found live (Viewer session, HHS_Office_Federated): a building's compiled rooms can be
correct-for-their-time and still go stale — HHS's spatial_structure held 14 rooms from before the
§SUSPECT-LARGE fix (this doc's own compile_rooms.py history); the CURRENT compiler produces 73-96 real
rooms (including a genuine 150-280m² hall) for the exact same building. Nothing re-ran it, because
nothing WAS SUPPOSED to — the only trigger was a manual, per-building "needle" press.

**Rule:** every compiled room/space artifact carries a VERSION STAMP (the compiler's own version string
at the moment it ran), and every consumer checks that stamp against the CURRENT compiler version before
trusting it — a missing or stale stamp means self-heal (recompute), automatically, no human needing to
remember which of N buildings needs re-running after an algorithm change. Full mechanism spec:
`prompts/Viewer/ROOM_INJECTOR_NEEDLE.md` §ROOM_WALKER_VERSION_STAMP (Viewer/JS side — `room_walker.js`'s
`ROOM_WALKER_V` + a `rooms_meta` stamp row, `_ensureRoomsCore()`'s trust check). `compile_rooms.py` (this
repo's server-side/dev counterpart) should carry the same version string in lockstep, same py/js parity
discipline §7's mini-BOM RosettaStone precedent already holds this project to elsewhere.

**Why this belongs in doctrine, not just a Viewer prompt file (user's own framing, 2026-07-21):** "As
newbies bring in their IFCs extracted to DB thus gets injected on the fly, saved locally. It's their
game not ours." A self-service user's own uploaded building must get the CURRENT compile quality
automatically, forever, without a dev ever touching that specific building — the version-stamp mechanism
is what makes "auto-infused, always" (§14) actually hold up over TIME, not just at first extraction.

**Extends to DiscWalk / MEP-walk work directly:** the same staleness risk applies to anything
disc_walker.js compiles and caches (walked MEP routes, room-derived classification, any future
occupant/graph artifact) — if the walk algorithm improves, a previously-walked building should not
silently keep serving the OLD walk forever. Same fix shape: version-stamp whatever gets compiled/cached,
check-and-self-heal on load, never rely on a human remembering to re-walk a specific building.

**Companion principle — vocabulary, not real-time work (user, same session):** "when we plan a route it
is less realtime work but prepared vocabulary to work on." Routing/path-finding features (Fly tour,
future "walk like a human to accomplish a task" navigation) should stay thin CONSUMERS of a compiled,
versioned vocabulary (room graph, corridor graph, door adjacency, stair groups — §10's "ONE shared gate"
applied to occupant-graph data, not just disc-walk placement) — never grow their own real-time
geometry-interpretation logic per feature. When a routing feature needs something the vocabulary doesn't
have yet, the correct move is extending the compiled vocabulary (versioned, self-healing, shared by every
future consumer) — not bolting one-off real-time logic onto whichever feature asked for it first.

**Re-verified against current code, 2026-07-25 — the two tracks are still deliberately separate, not a
gap.** Same-day Viewer-side session hardened the occupant-graph track further: `room_walker.js` v3
(`§LOCAL-FRAME + §RASTER-EPS + §CONTAINMENT-ALIAS, post-§SUSPECT-LARGE`) self-heals fast and correctly
(measured, not assumed — Hospital 444ms→214 rooms, LTU_AHouse worst-case 760ms→422 rooms, `rooms_meta`
stamp confirmed written), and is confirmed the single shared trigger behind the Viewer's Find-panel
Room-Path feature, Fly Tour, and Cinema/MaxQ orbit prep (`navigate_find.js`'s own comment names it "the
ONE shared injection core"). **Checked whether this now-verified walker output ever reaches
`disc_walker.js`'s placement substrate — it does not, exactly as §14 already prescribed**: current
`disc_walker.js` (`spacesOf()`, ~line 249-265) reads real `IfcSpace` rows first, falls back to
`spatial_structure` only when needed, and explicitly filters out `compile_rooms.py`/`room_walker.js`
synthetic rows (`guid NOT LIKE 'RM\_%'`, `name NOT LIKE '%≈%'`) with its own comment calling them
"guesses, not extraction." No dependency exists in either direction — Modeller/DiscWalker never calls
`ensureRooms()`/`RoomWalker`, and the Viewer's self-heal never feeds DiscWalk. An algorithm quality
improvement on the Viewer side (however well-benchmarked) does not change this epistemic boundary, by
design — worth a session not assuming the two have converged just because the Viewer-side walker got
measurably better.
