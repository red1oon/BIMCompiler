# What Exists Today, What's Missing, and Where We Sit
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">We BIM living the <b style="color: #ff9800;">GAP</b> between<br><b style="color: #ff9800;">DESIGN</b> and our <b style="color: #ff9800;">SPREADSHEET</b></span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">The industry designs buildings. Who compiles them?</span>
</div>

---

## How to read this — the honest frame

This project is broad. To keep it honest, everything below is sorted into three tiers,
and the line between them is never blurred:

- **Tier 1 — Landed.** Works today, **use-as-is-where-is**, and every claim carries a
  witness (a `§`-logged, falsifiable test you can run). This is real commercial value now.
- **Tier 2 — Wedges.** Small hardening or a short build away — the commercial on-ramps.
  Stated as *targets*, never as done.
- **Tier 3 — Frontier.** The demonstrated promise — proven in architecture, not yet
  finished. Shown to be *possible*, labelled as *unfinished*.

If you grep the repo, the Tier-1 claims must hold and the Tier-2/3 ones must read as
runway. That discipline is the point.

---

## The core problem: geometry is not intent

Most BIM tools store **geometry as the source of truth**. An IFC file carries the
building — 51,000+ elements of geometry, relationships, properties — in one monolithic
file. Lose the IFC, lose the building. But a 200 MB IFC captures *what was drawn*, not
*what was meant*. You cannot ask it "give me a building like this but with 4 m ceilings,"
because the intent was never separated from the output.

**Autodesk solved it behind a proprietary wall.** Revit's `.rvt` keeps full spatial
fidelity internally, but is editable only in Revit with a shelf-life tied to Autodesk's
support cycle [[6]](#ref6). Leave via IFC and "there's always loss of data... all
constraints are lost and component parametrics are gone" [[7]](#ref7).

**The openBIM world has no equivalent.** Bonsai/BlenderBIM is IFC-native [[8]](#ref8), but
IFC is an exchange format, not a compilation target — it does not decompose a building
into a reusable BOM recipe, compile from it, and verify the round-trip [[9]](#ref9).

**The compilation challenge:** extract a building's intent from its geometry, express it
as a reusable recipe (BOM), recompile the recipe back into spatially correct geometry —
and *prove* the recipe is faithful. Construction is
[industrialised manufacturing](https://www.autodesk.com/design-make/emerging-tech/industrialized-construction) [[11]](#ref11),
yet architecture is drawn as art; the compiler gives determinism to art. A beam is either
at (3200, 0, 2700) or it isn't — no probabilistic guessing [[12]](#ref12).

That is what the BIM Intent Compiler does, in two databases — and it is the **proven core**
that makes Tier 1 real.

### The proven core (why the rest can be believed)

1. **Input DB** — an IFC (or OBJ/STL/DAE/GLB) is extracted into a normalised SQLite DB.
   Geometry hell is resolved here: origin divergence, unit mismatch (the 1000× metres-vs-mm
   error), axis ambiguity, and GUID identity — documented industry problems
   [[1]](#ref1)[[2]](#ref2)[[3]](#ref3)[[4]](#ref4)[[5]](#ref5). Every element becomes a row;
   every spatial relationship a foreign key. The building is SQL-queryable.
2. **BOM abstraction** — 51,000 elements decompose into ~700 BOM lines (73× compression)
   via formula verbs (TILE, ROUTE, FRAME, CLUSTER). This is the *intent*: not "12 wall
   meshes at these coordinates" but "12 of product W-EXT-200, tiled at 2.5 m along the
   north facade."
3. **Output DB** — the BOM + shared library recompiles into spatially placed geometry,
   each element carrying its original GUID. A 200 MB IFC becomes a ~10 KB semantic
   definition. The output is disposable — delete it, recompile, the geometry reproduces.
4. **Rosetta Stone** — Input vs Output across verification gates (counts, volumes, geometry
   hashes, spatial digests, GUID provenance, transforms, materials). **21 buildings from 9
   authoring tools; 116/157 gates PASS, 4 ALL GREEN; worst-case positional error 0.002 mm.**
   See `SPATIAL_COMPILATION_PAPER.md`.

The hard problem was always the spatial compilation. Everything downstream — 4D, 5D, cost,
ERP — is a projection of the same verified BOM.

---

## Tier 1 — Landed: use-as-is, where-is (witnessed today)

These work now, in a browser tab, no install. Each carries a witness you can run.

**Currency note, 2026-09-27:** re-verified three rows, corrected one, left the rest as before —
stated plainly so the table isn't read as freshly confirmed where it wasn't touched this pass.
**Verified merged and live:** the ERP UX-parity row above — bim-ootb `main` carries PR #1613,
#1626, #1636 (field sets, AD_Ref_List/Yes-No, AD_Val_Rule, all read from `erp/ad_seed.db` at run
time, not asserted from a lane doc); the Viewer's clash + narrated fly-through row — PR
#1697/#1699 merged (`viewer/sw.js` was `v1168` at merge, currently `v1449` on `origin/main`,
confirming nothing since has reverted it); and the 4D Gantt editor's own flagship witness — it had
been silently judging a dead scheduling model since before this file's Tier-1 claim was written;
`witness_gantt_edit_coherence` now builds its fixture from the canonical model and a live editor
test confirmed drag/clamp/cascade/persist all work off real `§`-logs (bim-ootb PR #1553, 7 PRs
total merged 2026-08-27). **One caveat carried honestly, not the editor's fault:** a fleet-wide
construction-sequencing check still fails on 6 of 7 test buildings on floor-ordering grounds,
re-verified 2026-09-15 (`§CPM_FLEET_VERDICT buildings=7 fails=6`) — the schedules themselves are not
yet fleet-clean, independent of the editor fix above. **Corrected, not carried forward:** the prior note here
cited `W-MV-PARITY` (Modeller ≡ Viewer geometry agreement) at 12/12 — that no longer holds. The
Modeller now renders each building from its own per-resident `_geo.db`, while the witness still
checks it against `Duplex_extracted.db`; the two disagree on triangle count for 82 of 203 shared
geometry hashes. Parked, not fixed — full detail in Tier 3 below. **Two more items verified merged and live, not in
the table above but bearing on it:** a photoreal-still defect that silently dropped whole element
classes (glazing, furniture) from Alt+S bakes mid-playback — root-caused to a camera-culler/
Time-Machine matrix-ownership conflict, fixed on a full re-bake (bim-ootb PR #1660, sw v1141 at
merge); and a 2026-09-04 audit that found three things believed live on bim-ootb's GitHub Pages
were actually 404 despite green CI and a green deploy workflow — a version stamp, JS minification,
and both ERP agent-download zips — caught only by fetching the live URL, fixed and re-verified by
`curl`, not by trusting the pipeline (`§PAGES-SERVES-THE-BRANCH`, bim-ootb PR #1680). **Not
independently re-verified this pass, carried forward as before:** the BIM↔ERP fold row, EVM, POS,
iDempiere extraction, and the 5D cost row.

| Capability | What it does | Witness |
|---|---|---|
| **IFC handoff** | Drop IFC/OBJ/STL/DAE/GLB/glTF/3DS/FBX → queryable DB → view, classify, export back to IFC. Geometry hell resolved at import. | Rosetta gates; `import.js` round-trip |
| **4D Time Machine** | Construction-sequence playback from BOM depth; stacked S-curve folded from real orders (Σ == PlannedAmt). The Gantt editor's own edit path (drag/resize/lock/undo a bar) is now witnessed end to end, not just the playback. Click any element in the 3D view to see its scheduled task, dates and derived cost — closing a slice of the Navisworks TimeLiner/Synchro object-to-schedule gap. | `W-SHOP-SCURVE`; `witness_gantt_edit_coherence`, `witness_gantt_lock_integrity`; `W-S7-CANVAS-PICK` 14/14 |
| **5D cost (editable)** | BOQ + cost rollup with **editable** per-jurisdiction rate templates; Variation Order Excel (FIDIC Clause 12). | `4D5DAnalysis.md`; VO demo [[10]](#ref10) |
| **BIM↔ERP — to the cent** | A BIM-pushed building folds into a real procurement/project order and ERP documents, reproducing iDempiere/Odoo output at **`maxDiff=0c`**. **No other tool connects BIM to ERP over one signed log.** | `W-PROJ-FOLD`, `W-GW-HOSP-FOLD`, `W-FOLD-COMPLETE` |
| **ERP screens — AD-driven, not a hand-list** | The five core document screens (Sales Order, Shipment, Invoice, Payment, Allocation Line) now render iDempiere's own AD field set per window instead of a curated shortlist — `c_order` 8→56 fields, `c_payment` 4→78, 139 DisplayLogic-bearing fields now evaluated live off the same AD metadata iDempiere reads, plus live AD_Ref_List/Yes-No editors and AD_Val_Rule-filtered FK pickers. | `W-PARITY-FIELDSET`, `W-PARITY-REFLIST`, `W-PARITY-VALRULE`, `W-AD-DISPLAYLOGIC-LIVE` |
| **MEP clash + narrated fly-through** | A camera-directed tour of the building (Cinema Path Editor) surfaces real, triangle-exact clashes (not bounding-box proxies) as persistent world markers, reveals disciplines one at a time (finest-detail discipline first, MEP always last) as it passes, and overlays live measurements (spans, clear heights, room areas) — an automated clash-and-measure narration, not a static report. | `witness_clash_mesh_narrowphase`, `witness_clash_film_labels`/`_markers`, `witness_datum_stability`, `witness_indoor_beats`, `witness_linear_beat`, `witness_storey_walkable_card` |
| **Budget vs Actual (EVM)** | Planned vs Committed at project + phase + task grain; CV/SV/CPI/SPI in BigDecimal; cost overrun surfaced on the 4D S-curve. | `W-GW-HOSP-COSTVAR`; `proj_control.js` |
| **What-If (cost)** | Speculative VO branch — revised = original + approved + pending — kept separate from the official ledger, reversible. | `W-FIN-BLUE-SPEC` (5/5) |
| **Dashboard / analytics** | Generic multi-view over **any** data model: donut grid, "By-X" group-by chips that fill the grid, pivot lens, scrubbable timeline filmstrip, CSV/SVG/PNG export. Field-driven, not hardcoded per table. | `W-DASHBOARD`; `pivot_lens.html` |
| **POS sale loop** | Ring → complete → backflush BOM → hold/recall → deliver-later → register, all over the signed op-log; the signed orderline doubles as the buyer's receipt artifact. WAN bench **to 10,000 stations** with idempotent retry + email-backup recovery. | `W-POS`; `poc_pos_wan_scale.js` (B1–B7) |
| **iDempiere DB extraction** | Connect a live iDempiere PostgreSQL → raw, non-inventive PG→SQLite extraction (`--list-clients`, `--masters`). | `migrate_agent.js`; `ERP_RAW_MIGRATION.md` |

**The standout no one else has:** *building → procurement order, in one browser, tied to
the cent.* The Dashboard is the answer to "where's your Odoo kanban / SAP analytics" — and
because it's AD-field-driven, it's one dashboard for *every* data model, not a bespoke
screen per report.

---

## Tier 2 — Wedges: small hardening, the commercial on-ramps

Real markets, short runway. Stated as targets — not yet shipped.

- **POS → Malaysian e-invoicing + personal accounting (the long tail).** The LHDN/MyInvois
  mandate forces every business onto e-invoicing, and the government's own central service
  has buckled under server-side load — a structural opening for a **serverless, local-first**
  POS that each merchant runs themselves. The sale loop is landed; the wedge is hardening it
  against real-world bugs and adding the compliance surface. The signed orderline is already
  a receipt artifact — evolving it into a MyInvois-format submission is the build. *(Not yet
  in code; this is the target.)*
- **Touch-kitchen + self-order tabs + QR payment.** A self-order surface (URL-fetched remote
  ordering, QR payment display, payment-status fold returned by email) sits naturally on the
  same op-log. *(Not yet in code; the POS loop it rides is.)*
- **iDempiere DB health-check report — "the diagnosis; the diet is optional."** A read-only
  analysis pass over the *already-working* extraction: scan a user's DB for dirty data,
  orphans, GL imbalances, and a migration-gap score. Sold as a **health check + migration
  plan** — standalone value even if they never migrate. Low lift (the extraction plumbing
  exists), high value (migration paralysis is real). *(Analysis pass not yet built; extraction
  is.)*
- **What-If (schedule ripple).** Finish-to-start cascade on the timeline. Engine done; browser
  drive pending.

---

## Tier 3 — Frontier: the demonstrated promise (the dragon's head)

**DAGeVu modeller** — a browser-native BIM authoring tool whose endgame is to **sever the
Revit-license tether**. The *hard* part is shipped and witnessed: an occt-wasm B-rep kernel
as a pure `ops → mesh` fold, the signed op-log **as the feature tree** (scrub, undo, tamper-
evident), and **IFC4 export that round-trips** (`IfcWall` + profile + `IfcOpeningElement`,
re-imports exact). A user can *today* author a few walls, a door, an opening, and MEP runs,
and export usable IFC — without Revit.

**Update 2026-09-27 — the working thesis changed (generate, then edit minimally), real generation
now lands end-to-end, a real defect was found by finally auditing the witnesses themselves, and one
claim in this section needs correcting.**

Since 2026-09-24 the strategy is no longer "hand-author a wall at a time." It is **generate, then
edit minimally**: open an ARC-only (architecture-only) building, let walkers generate the structure
and MEP from measured rules, correct the result with a few signed edits — Open → Walk → Route →
Sign → Review → Edit → Re-walk/re-route → Save/Export. Merged and measured on real buildings
(bim-ootb #1762/#1768 plus the PRs below): routing now reaches the production walk path (it was
silently dead on 7 of 8 sample buildings) and a generated network can be signed — Terminal's
plumbing runs went 0 → 2,915 signed sweeps; a walk is one undo-able gesture (Ctrl+Z removes the
whole generated layer, Ctrl+Y restores it); moving a fixture re-routes its pipes. One measured "Walk
ALL Services" pass, generated / flagged-for-review per building: SampleHouse 60/0, Duplex 206/29,
SampleCastle 514/9, HHS 3,415/0, Clinic 5,140/0, Hospital 39,979/22, HospitalGarage 13,965/0,
Terminal 7,854/60 — read as "little is left to fix," not as an "N× faster" claim, since there is
still no hand-modelling baseline to compare against.

**That same push found a 3-month-old defect no witness had caught: the product catalog was silently
loading 0 products** (a path typo after a June refactor), so every bend fitting failed to render
while every witness stayed green (fixed, bim-ootb #1770). That is the direct reason a systematic
audit of the Modeller's own witness suite was run next — and it is still open: **19 of 58 browser
witnesses came back red on `main`**, nothing in CI catches this today. Four real product bugs (not
test bugs) were found and fixed this way: the Outliner's adjacency lens was dead on every
ARC-seeded pick, eye-toggles never repainted after opening a building, x-ray silently reverted to
opaque after any re-fold, and a route-walk's tag was dropped at commit (so x-ray treated its pipes
as structure). Separately, 6 of 8 sample buildings were opening with **zero rooms**, because the
Modeller never called the room walker the Viewer already runs — fixed, `W-MODELLER-ROOM-INJECT`
25/0. **All of this lives on bim-ootb branch `test/modeller-net-audit`, pushed, no PR yet — found,
fixed, and witnessed, but not merged and not live.**

- **Kernel breadth** — 6 more occt shoulders wired in one session (`GEOM_REVOLVE`/`SHELL`/
  `OFFSET`/`FILLET_VARIABLE`/`CHAMFER_DIST_ANGLE`/`DRAFT`, `W-BONSAI-TIER1` 20/20), plus
  `GEOM_ARRAY`/`GEOM_LOFT` (formula-driven instancing, real curve-following). `GEOM_REVOLVE` is
  the first axisymmetric-solid authoring path this tool has ever had.
- **MEP domain fidelity, the harder half** — fitting rotation and pipe/duct cross-section are
  now EXTRACTED from real IFC/catalog data (RosettaStone mini-BOM method), not computed — a
  same-day audit found and fixed a bisector-computed rotation that was ~135° wrong on real data,
  and an invented pipe diameter that was 2.3× oversized and the wrong shape. A shared
  `resolveRealPlacement()` gate now HARD-FAILS rather than silently substituting invented
  geometry anywhere in the leaf-placement path — a structural fix, not a point patch. Full
  detail: `docs/internal/WalkerDoctrine.md §7-§10`.
- **Cross-app trust — correcting the prior claim, not carrying it forward.** `W-MV-PARITY`
  (Modeller ≡ Viewer on the same real building) is **no longer 12/12.** The Modeller now renders
  each building from its own per-resident `_geo.db`, while the witness still checks it against
  `Duplex_extracted.db` — the two geometry sources disagree on triangle count for 82 of 203 shared
  geometry hashes (121 agree, 12 missing). Parked, not fixed, pending a call on which geometry
  source is canonical (`test/modeller-net-audit`, 2026-09-27). Stated plainly because the Tier-1
  currency note above previously cited this witness's old 12/12 result as current.
- **Dimension-driven parametric edit — first real increment, not yet the whole gap.** `p2p_distance`
  (width) is wired and PROVEN by exact numeric position assertion (not a screenshot) — real
  Playwright interaction, hand-computed expected geometry, `witness_e2e_sketch_dims.js` 10/10.
  Only ~5 of ~60 real planegcs constraints are wired; this is genuinely the gap between
  "constraint-solving on fixed hand-drawn geometry" and Grasshopper/Dynamo-class "geometry as a
  function of parameters" — most of it still open.

**Honest distance to the mountain top: ~40-45%**, carried forward from the 2026-07-25 estimate —
no source read this pass gives a revised figure, so the number is not re-rounded. What moved since
then is breadth of what generates automatically (the loop above) and the discovery of how much of
the existing witness net was not actually checking what it claimed to; neither is the same axis as
"kernel/constraint completeness," so it does not by itself move this %. The still-open gap remains
constraint-solving depth and the direct-manipulation UI, per `prompts/BONSAI_KERNEL_RESEARCH.md
§GAP-TO-COMPETITIVE`. Read: **weeks-to-months, not years**, unchanged.

Witnesses: `W-BONSAI-*` (`bonsai_signed_live.js`, `bonsai_ifc_live.js`, `bonsai_sweep_live.js`,
`bonsai_fillet_live.js`, `bonsai_move_live.js`, `bonsai_tier1_live.js`), `W-MV-PARITY`
(`witness_e2e_mv_parity.js`), `W-BONSAI-ROSETTASTONE`/`witness_mep_rosettastone_lookup.js`. See
[`ModellerKernelFold.md`](ModellerKernelFold.md) and `docs/internal/WalkerDoctrine.md`.

**Occupant/topology graph — one substrate, three consumers (update 2026-07-25).** A second
frontier piece sits underneath the editing kernel: a typed graph over the same building where every
edge is `recovered` (from IFC relations) or `derived` (pure geometry — face-touch, cadence, bbox-
span), never invented, oracle'd to a **0.000mm** fold round-trip and proven construct-agnostic —
the same builders run unmodified on a house and on a bridge (no grid, no storeys, zero fabricated
edges either way). Three separate features consume the same graph rather than each growing its own
pathfinding: the Spatial Dependency Graph's edit-time fold/cascade engine, an occupant-navigation
graph (room ↔ corridor ↔ stair ↔ exit — a real hospital's room pathability raised 56%→86%, an
isolated 315 m² atrium reconnected), and the Viewer's Fly Tour, which routes its camera through the
identical compiled vocabulary instead of inventing its own waypoints (highlight-first routing
shipped, PR #989).

What keeps this in Frontier rather than the Moats list below: a provenance gate now checks every
deploy of this data on two axes — the exact bytes of the building DB actually being served, and the
exact commit of the code that measured it — refusing to run against a stale checkout or a mismatched
snapshot. It replaced a manual discipline that had already let two real defects reach
near-publication (a raster built for one room count silently judged against another; a stale engine
checkout nearly reported a fix as a regression), and its own first run caught a third: an uploaded
patch with no reconstructable source in the repository. **Stated plainly, what's still open:** on
5 of a real building's 7 storeys, the occupant graph's walkability today is a room/corridor-rectangle
network, not independently measured floor geometry — real connectivity under that definition, not yet
demonstrated against slab-level geometry there. No incumbent or open-source BIM tool surveyed below
treats occupant navigation, camera-tour routing, and parametric editing as three consumers of one
zero-invented, snapshot-verified graph; this is architecture proven on a real multi-storey building,
not yet a finished capability. See `prompts/SPATIAL_DEPENDENCY_GRAPH.md`,
`prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md`, `prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`.

---

## The landscape — nobody else compiles, nobody else connects

### Tier 1 — Incumbents (geometry authoring)

| Tool | Role |
|------|------|
| **Autodesk Revit** | Full BIM authoring. Industry standard. |
| **ArchiCAD** (Graphisoft) | Architectural BIM. Strong in EU/Asia. |
| **Tekla Structures** (Trimble) | Steel/concrete detailing, fabrication-grade. |

They create IFC. They model geometry. They do not decompose it into a BOM recipe, compile
from intent, or verify the round-trip.

### Tier 2 — Visual newcomers

| Tool | What it does |
|------|-------------|
| [**Snaptrude**](https://www.snaptrude.com/) | Browser sketch-to-BIM |
| [**TestFit**](https://www.testfit.io/) | AI generative site planning |
| [**Arkio**](https://www.arkio.is/) | VR/AR collaborative design |

Design exploration. No BOM, no compilation, no verification.

### Tier 3 — Open source (IFC-native)

| Tool | What it does |
|------|-------------|
| [**Bonsai/BlenderBIM**](https://bonsaibim.org/) | IFC-native authoring inside Blender |
| [**IfcOpenShell**](https://ifcopenshell.org/) | IFC parsing/generation library |
| [**ThatOpen (IFC.js)**](https://thatopen.com/) | Web IFC viewer/editor |

They parse and display IFC. They do not abstract intent, compile from recipes, or prove
round-trip fidelity — and **none connect BIM to a transaction ERP over one signed log.**

### Adjacent layers — interop and governance (not authoring, not competing directly)

| Layer | Example | What it does | What it doesn't |
|---|---|---|---|
| Geometry interop | [Speckle](https://speckle.systems/) | Git-like versioning for geometry across tools | Needs a server; stops at geometry — no cost/schedule/ERP |
| Governance/CDE | AWARO, Trimble Connect, ACC | WIP→Shared→Published workflow, roles, sign-off | Manages artifacts, not derived data — computes nothing |

Neither is a competitor — both could sit upstream or downstream of this pipeline. The
versioning half (Speckle's job) is already native here as the signed op-log (Moat #6, no
server needed); the governance half (AWARO's job) is a state machine that could ride on top
of this pipeline's merge gate rather than replace it.

---

## Moats

1. **Spatial compilation is solved — and hard to replicate.** Intent extraction, recompile,
   and a 0.002 mm round-trip across 21 buildings from 9 tools. Years of domain work.
2. **BIM↔ERP over one signed op-log — unique.** Building → procurement order, ERP documents
   reproduced to the cent. Requires rare BIM *and* manufacturing-ERP knowledge in one head.
3. **One generic dashboard for every data model.** AD-field-driven group-by/pivot/timeline —
   not a bespoke report per table.
4. **Serverless / local-first by construction.** Each browser is its own server; the only
   shared resource is a stateless signature gatekeeper. Scales to 10,000 POS stations with no
   central database to overload — the exact failure mode that sank the national e-invoicing
   rollout.
5. **Domain-agnostic pipeline.** Houses, terminals, bridges, rail (93% BOM compression) — one
   pipeline, a YAML mapping per domain. See `INFRA_DESIGNER_SRS.md`.
6. **Op-log = git-for-data.** Every state is a deterministic, reversible fold of a signed log
   — what makes What-If branches, audit, and crash-replay fall out for free.

**The asymmetry:** adding a GUI to a compilation foundation takes weeks. Adding spatial
compilation — or a to-the-cent ERP fold — to a GUI-first tool takes years.

---

## Honest risks (kept current, not just moats)

1. **Adoption is structurally harder for an intersection than a point solution.** Needs a
   modeler, a scheduler, and a cost/ERP owner to all find it worthwhile at once.
2. **Generality is claimed, not yet proven externally.** Every capability measured so far
   was built and tuned in-house; a genuinely foreign file is still an open test.
3. **Distribution is currently bespoke, not repeatable.** Real signal so far has cost real
   founder-hours per contact — not yet a growth motion.
4. **Credibility currently rests on one person** across communities that don't normally
   talk to each other (BIM, ERP, open-source/local-first) — coherent, but earned per
   conversation, not yet institutional.

None of these block using or trying the project — they're the risks worth tracking as it
scales, stated plainly rather than smoothed over.

---

## Who uses this, and what they'd pay for

| Role | Workflow | Value | Tier |
|------|----------|-------|------|
| **Quantity Surveyor** | Drop IFC → BOQ + Variation Order Excel | Automated takeoff, no Navisworks | 1 |
| **Contractor (tender)** | Import architect's IFC → classify → costed BOM | Quantities tied to verified geometry | 1 |
| **Project Manager** | Push building → ERP project; track Planned vs Committed + EVM | Budget/actual + cost What-If in one place | 1 |
| **Developer / Investor** | Share a URL → browse the model, no install | Instant stakeholder view | 1 |
| **SME merchant (Malaysia)** | Run a local POS that does e-invoicing + accounting | Mandate compliance without a server to crash | 2 (target) |
| **ERP owner (migration)** | Run a DB health-check → dirty-data + migration-gap report | Knows what they're sitting on before committing | 2 (target) |
| **Architect / small practice** | Author basic geometry in-browser, export IFC | A path off per-seat license fees | 3 (frontier) |

---

## Get involved

The project is **open source (MIT)** and actively developed. Roadmap:
`ACTION_ROADMAP.md`. For the journey from the IfcOpenShell Federation
branch (Oct 2025) to today, see `PROJECT_CHRONOLOGY.md`.

If you work with IFC models, run an ERP you're afraid to migrate, or just want verified
spatial compilation — try it, break it, tell us what's missing. Contributions welcome:
product catalogs, jurisdiction rules, format importers, test buildings.

---

*Cross-references:*
*`SPATIAL_COMPILATION_PAPER.md` — academic paper (0.002 mm proof),*
*[`MigrateComparisonPaper.md`](MigrateComparisonPaper.md) — ERP fold, to the cent,*
*`BOMBasedCompilation.md` — compilation pipeline spec,*
*`DATA_MODEL.md` — 4-database schema,*
*`TestArchitecture.md` — Rosetta Stone gates and traceability,*
*[`ModellerKernelFold.md`](ModellerKernelFold.md) — modeller as signed-log fold,*
*`PROJECT_CHRONOLOGY.md` — dated history + commit ledger,*
*`ACTION_ROADMAP.md` — project roadmap*

---

## References

<span id="ref1">[1]</span> Muller, M.F. *et al.* "On BIM Interoperability via the IFC Standard: An Assessment from the Structural Engineering and Design Viewpoint." *Applied Sciences* 11(23), 2021. — Documents geometry loss and property loss across IFC exchanges between Revit, ArchiCAD, Tekla, and others. [doi:10.3390/app112311430](https://www.mdpi.com/2076-3417/11/23/11430)

<span id="ref2">[2]</span> Pazlar, T. & Turk, Z. "Interoperability in practice: Geometric data exchange using the IFC standard." *ITcon* 13, 2008. — Early benchmark showing "distortion or loss of information related to the geometry of the elements" and "incorrect connection between elements" across five IFC-certified tools. [ResearchGate](https://www.researchgate.net/publication/281596020_Interoperability_in_practice_Geometric_data_exchange_using_the_IFC_standard)

<span id="ref3">[3]</span> Diakite, A. & Zlatanova, S. "About the Geo-referencing of BIM models." TU Delft, 2018. — Analysis of coordinate system divergence in IFC georeferencing, origin offset problems, and IfcMapConversion limitations. [PDF](https://3d.bk.tudelft.nl/pdfs/18_georeferencing.pdf)

<span id="ref4">[4]</span> BIMcollab. "Coordinating IFC Models with World Coordinate System information." — Documents how models without IfcMapConversion "will be shown somewhere far away from the already loaded model." [BIMcollab Help](https://helpcenter.bimcollab.com/en/articles/326917-coordinating-ifc-models-with-world-coordinate-system-information)

<span id="ref5">[5]</span> Autodesk. "Revit 2024: Enhancements to IFC Geometric Fidelity." 2023. — Autodesk's own acknowledgement that IFC geometric fidelity required improvement, with fixes for "complex families (parametric railings, helical stairs) which may generate fragmented geometries." [Autodesk Blog](https://www.autodesk.com/blogs/aec/2023/07/24/revit-2024-enhancements-to-ifc-geometric-fidelity/)

<span id="ref6">[6]</span> CAD Interop. "Revit File Formats: BIM Interoperability, IFC Conversion." — Notes that .rvt files are "editable only in Revit" with "a shelf-life of 3 years (the lifespan of Autodesk support)." [CAD Interop](https://www.cadinterop.com/en/formats/cad-systems/revit.html)

<span id="ref7">[7]</span> Moult, D. "How to create better IFC files with Revit." thinkmoult.com. — Documents that "even when you manage to export your geometry through IFC, there's always loss of data" and "importing that into Revit makes it utterly useless." [thinkmoult](https://thinkmoult.com/how-to-create-better-ifc-files-with-revit.html)

<span id="ref8">[8]</span> Bonsai BIM. "Beautiful, detailed, and data-rich OpenBIM." — Bonsai is IFC-native: "you're not creating geometry that gets converted to IFC later. You're working directly in IFC." [bonsaibim.org](https://bonsaibim.org/)

<span id="ref9">[9]</span> OSArch Community. "How to import IFC with large coordinates?" — Documents floating-point precision limits with georeferenced files requiring local origin offsets, and that "horizontal construction where distances frequently exceed 1km presents challenges." [OSArch](https://community.osarch.org/discussion/1099/blenderbim-how-to-import-ifc-with-large-coordinates)

<span id="ref10">[10]</span> Oon, R.D. "BIM OOTB — Browser Variation Order from IFC Import." 2026. — Demonstrates what becomes possible when BIM data lives in a queryable DB rather than a file: geometry stored as hash-keyed BLOBs (identical meshes instanced, not duplicated), revision diff as SQL `EXCEPT` on GUID sets, cost impact as `GROUP BY` on diff × rates template. IFC import, 4D/5D variance, and costed Variation Order Excel — entirely in the browser, no server. [YouTube](https://youtu.be/hv0kcc_TKvY)

<span id="ref11">[11]</span> Autodesk. "Industrialized Construction." — "Applies the discipline and systematized fabrication process of manufacturing to the design and build process... as consistent and replicable as widgets rolling off a factory assembly line." [Autodesk Emerging Tech](https://www.autodesk.com/design-make/emerging-tech/industrialized-construction)

<span id="ref12">[12]</span> Olanrewaju, O.I. *et al.* "Quantifying the influence of BIM adoption." *Automation in Construction* 161, 2024. — Notes "a significant gap between research and industry practice" and that the industry "still lacks its own quantification methodology for BIM benefits." [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2590123024008107)

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
