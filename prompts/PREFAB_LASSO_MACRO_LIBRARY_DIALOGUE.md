# DESIGN DIALOGUE (reference only, NOT a build spec) — Graph-aware prefab picking, escalating lasso, mineable macro library

```
# ⚠ DO NOT REMOVE
STATUS: pure design-dialogue record, 2026-07-05. NOTHING in this doc is built, and unlike
prompts/GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md this one is deliberately NOT yet split into session-assignable
specs — the ideas need more settling first (user's own call: prove the smallest piece — twig-based macro
capture — useful to one user before deciding anything bigger). This doc SUPERSEDES the original scoping note
for `prompts/UBBL_RULES_RECON.md`'s sibling ("parametric depth recon") — that recon's original framing ("what's
missing for parametric authoring") is now too narrow; see §RESCOPE at the end.
```

## ORIGIN — why "parametric, more differently"
Triggered by a question: given this project's core bet (compile/extract real measured data, never invent —
PRIME RULE), what would a genuinely different, non-Revit-shaped answer to "parametric authoring" look like,
rather than building a smaller version of a family editor? Two seed ideas, both elaborated below:
1. LOD meshes don't need drawing — an editor that touches up REAL measured geometry along axes the corpus
   proves are real variables, not axes a CAD kernel merely permits.
2. Raw authoring can instead be picking real ARC shells out of already-extracted real buildings and continuing
   them 3DGrid-wise — prefab, not freehand drawing.

## §1 — LOD touch-up editor: parametric axes = mined variance, not CAD constraints
Don't expose an editable dimension unless the real corpus shows actual measured variance on it (e.g. if the
mined door-class corpus varies 700–1000mm in width but has constant panel depth across every real instance,
width is a legitimate touch-up axis, depth isn't — that's a measured fact, not a modeling choice). Mechanically
this isn't a new engine: it reuses the SAME stretch machinery already built for grid-drag (`EDGE_STRETCH`,
attach-map classification — see `GRID_PREDRAG_GREENORANGE_PREVIEW.md`), scoped to one component's local frame
instead of the building grid. It also plugs into the calibrated-confidence machinery already shipped for the
walker (`WC_CALIBRATION`, isotonic/PAV, see `project_walker_guards_rosettastone` memory): a touch-up edit that
falls outside the corpus's real measured range isn't blocked, it's flagged low-confidence — same epistemic
honesty already applied to disc-borrowing, now applied to hand-edits.
**Open, unanswered:** does the library mining already capture per-class variance ranges today, or does that
need a new mining pass before any touch-up axis can be trusted as real rather than assumed? Not checked in this
dialogue — first thing a follow-on recon must answer.

## §2 — ARC-shell prefab: generalize BOM recursion + `expandAssembly`, don't build a new insert path
A room/wing/floor-plate from an already-extracted real building is already a BOM sub-tree (BOM PRINCIPLE:
recursive, one parent, N children, each level atomic). `bonsai_library.js`'s `expandAssembly`/`foldInsert`
already places a BOM assembly into a scene with correct placement math, today at furniture/fixture grain.
Treating a whole ARC shell as one pickable, insertable BOM node is the same mechanism at a bigger grain, not a
new one.

### §2a — Pick granularity: DAG-guided lasso, not a fixed BOM-boundary-only pick
Resolved in dialogue: don't force the pick to only ever be a pre-existing BOM node (too rigid) or a fully free
lasso (risks severing a real relationship mid-cut). Instead: a free lasso **guided by the already-live typed
edge graph**. **Verified 2026-07-05 (`modeller/cross_edges.js` header):** the graph (`abuts`/`fills`/etc.) is
explicitly **RUNTIME-derived**, computed once per Open (`window.swXEdges = CrossEdges.deriveAll(db)` in
`str_walker_outliner.js:148`), near-linear (sweep-and-prune, proven at 48k-element Terminal scale), cached in
a browser global for the rest of the session, cleared on Clear — NOT baked into the DB (the file's own comment:
"the modeller's residents stay pristine"). This is a **deliberate divergence from the old Java DAGCompiler
pipeline**, which DID persist a compile-time `system_edges` table (`DAGCompiler/python/output_schema.sql:71`,
`CompilationPipeline.java:1225`) — that pipeline is separately flagged low-urgency/retired elsewhere in memory;
the live Modeller does not read from or extend it. Because the graph is already live in memory the instant a
building is open, a lasso can consult it live, mid-drag, for free — no new persistence or compute model needed:
if the boundary would cut between two elements joined by a real edge, either auto-extend the selection to
include the neighbour, or highlight the specific severed edge (reusing the generic `_emis` highlight already
built for the gate) so severing is a conscious choice, not an accident.

### §2b — Conform paths on drop/paste, three distinct axes
Resolved: offer BOTH default states (green/island = keeps native proportions, orange/conform = adapts to the
target), with the ORANGE side itself splitting into (at least) three sub-paths, each mapping to something real:
1. **Align/snap-to-grid** — most literal; the existing grid-snap mechanism, applied to the whole shell as one
   rigid unit before its internal elements get individually re-classified governed/interior.
2. **Frame likeness** — generalizes `grid_kinematics`' ATTACH/EDGE/SPAN classification to the shell's OWN
   internal structural elements, matched against the target's grid spacing.
3. **Material-wise** — **UNVERIFIED, flagged don't-assume:** BOM PRINCIPLE lists AttributeSets as one of the
   three concerns (WHAT/HOW/WHERE), but this dialogue did NOT confirm material/finish is a real, populated,
   per-element mined fact today vs. an unpopulated schema slot. Do not build this path before checking — if
   material isn't real data yet, "material-wise conform" would be a knob with nothing real behind it.

## §3 — Escalating lasso: room-scoped, data-driven ladder (not a fixed taxonomy)
Repeat-click on the same pick escalates: chair → all chairs (IN THE SAME ROOM — user-confirmed ceiling, never
building-wide by default) → dining set (ONLY if a real BOM-assembly-parent fact exists — i.e. the furniture was
originally placed as one `GEOM_INSERT` of an assembly, table+chairs together) → all furniture in room (the
already-real room-containment fact from the shipped bom-graph TREE, Building→Storey→Room→element, PR #539).
**The ladder must introspect what's actually real for that specific instance and skip any tier that isn't
backed by a fact** — a loose, individually-placed chair with no assembly sibling should skip straight from
"this chair" → "all chairs in room" → "room", never inventing a fake "dining set" tier. Offering a tier with no
real grouping behind it violates the same non-invent discipline that governs the rest of this project.

## §4 — Clipboard, macro capture, and "twig of another tone"
Two escalating capabilities discussed, worth keeping distinct:

### §4a — Static clipboard (smallest, most immediate)
A DAG-guided pick (§2a/§3) held in an in-session buffer (element IDs + the real BOM subtree), pasted with
conform-intent (§2b) re-resolved fresh at each target. This is the natural, well-specified shape for the
copy-paste primitive already flagged as a total gap in `GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md` §B's sibling
research (zero clipboard/copy/paste/duplicate hits anywhere in `modeller/`) — same missing feature, now much
better specified than "just add copy-paste."

### §4b — Macro capture on a lightweight personal "twig" (bigger, genuinely new)
**Checked and corrected in-dialogue:** the Teams overlay's "bundle" concept (`teams/overlay/share_bundle.js`)
is NOT this — it's a review/communication artifact (N post-it comments packaged into a shareable punch-list
with BCF-style deep-links), not a replayable sequence of geometry edits. A macro-recorder would be genuinely
new work. It IS architecturally well-motivated by something that already exists: a grid-stretch already commits
as ONE signed group of ops (not one op per element) — proven pattern for "group atomic ops into one signed
transaction." A macro-recorder generalizes this: start/stop recording a slice of ops as one named group, save
it, and — the part that makes it more than a static clipboard — **replay it with re-resolution, not blind
translation** (if a recorded step was "attach to nearest wall," replay re-runs that host-lookup fresh at the
new target, it doesn't copy the old wall's ID). **Open design question, per-op-type, not answered here:** which
op types replay relative (host lookup, grid-attach — re-resolve) vs. absolute (rare, probably none by default).

The "twig" should be a DIFFERENT branch concept from Teams' Distributed Design Branches (parallel team design
alternatives, gated by a real merge/review process) — a disposable, personal, lightweight fork whose only job is
isolating an edit sequence for capture, not collaborative design exploration. Same underlying signed-op
substrate, deliberately different purpose — keep them conceptually separate so "branch" doesn't grow two
incompatible meanings in the same codebase.

### §4c — The bigger vision: the op-log itself as a mineable corpus of edit behavior
User's framing: the whole signed-op timeline already has "memory of all sorts of edit combos over time" whether
anyone declares interest in them or not. Rather than macros being hand-authored (a human decides "this sequence
is worth saving"), a repeated edit-combo could be **noticed and promoted** — the same extract-don't-invent
discipline that built the component library and the residential clearance standards (`project_dx_mep_
residential_standard`), pointed at BEHAVIOR instead of geometry. A promotable pattern earns trust by real
recurrence across genuine editing sessions, the same way `WC_CALIBRATION` earns disc-borrowing confidence from
real recurrence rather than a single observation — not by a human hand-curating a template library.
**Deliberately NOT scoped further here** — genuinely bigger, harder question (per-user vs. cross-user pattern
sharing, promotion threshold, whether Teams' existing sync/ERP-bridge plumbing is the right transport if
patterns ever get shared across users) that the user explicitly deferred: prove §4b (single-user twig capture)
useful first, before deciding anything about promotion/sharing.

## §5 — RESCOPE NOTE for the parametric-depth recon
The original plan (see earlier session note, before this dialogue) was a single recon item ("what's missing for
parametric authoring"). This dialogue makes clear that's now several distinct, separately-answerable questions,
not one:
1. Does the library mining already capture per-class real-variance ranges (§1), or does new mining work come
   first?
2. What BOM-node granularities already exist as natural shell-pick units across the corpus (§2), and is a
   DAG-guided free lasso (§2a) actually needed, or do existing BOM boundaries already cover the common case?
3. Is material/finish a real, populated per-element fact anywhere in the corpus today (§2b-3), or unbuilt?
4. Does any real BOM-assembly-parent grouping fact exist for library-inserted furniture sets today (§3), to
   confirm the "dining set" escalation tier is ever real, not hypothetical?
Do not dispatch a single "parametric depth" recon session against the old framing — split per the above, or at
minimum brief whoever picks this up with these four sharper questions instead of the original generic one.

## Related design-dialogue context (same conversation, adjacent but not part of this doc's scope)
- Competitive positioning vs. Revit/ArchiCAD/Tekla/Bonsai — signed op-log ledger, REPORTS-ONLY gate/backprop,
  ERP-fused DocAction lifecycle (`MODELLER_SAVE_COMPLETEIT.md`), Compile-not-Model/walker doctrine, and
  browser-native IFC-first are the genuine differentiators; parametric authoring depth, structural analysis
  integration, and (until tested) multi-user collaboration are the honest gaps.
- Teams overlay (Distributed Design Branches) is SHIPPED (suite 18/18, OCI demo live per
  `project_teams_distributed_branches` memory) but NOT tested for a real dual-session live user path — flagged
  as the cheapest, highest-priority item to verify before treating multi-user as either a gap or a strength.
- Clash analysis vs. incumbents (Navisworks/Solibri/Revit interference check): geometric interference is
  commodity/already matched; real-time in-authoring auto-heal is arguably already ahead structurally; real
  engineering-analytical rule-library DEPTH (code-mandated soft-clashes, discipline-pair exclusions beyond
  `fillsPairs`) is the genuinely hard part — a multi-year data-sourcing marathon in the same class as the
  residential-clearance mining already shipped and the UBBL recon now underway, not an algorithmic problem.

## §6 — 2026-08-11 follow-up: what Revit's daily-routine presets already solve, and what's still grunt work
Chat-only session, no code touched. Triggered by: "in the event that we have an equitable modeller, will
their setup albeit all private schema, be more easier thru ours?" Answers the two open questions this
section had been carrying (which building-authoring grunt work is real vs already solved elsewhere) with a
concrete before/after against how a Revit modeller actually works day to day.

**What a Revit user already has (the "measure up" baseline, not a gap):** an office `.rte` template
(preloaded families, view/sheet templates, shared parameters, IFC export mapping already configured once
per firm), a firm content library (thousands of pre-typed families), **type catalogs** (parameter grunt
work done once per type, every instance inherits it free), and groups/assemblies + copy-paste for repeated
units (a typical apartment layout pasted across floors). This independently confirms — same mechanism, from
a different lane — the "type-level leverage" already measured in `JKR_SKATA_COMPLIANCE_LANE.md
§WHERE THE GRUNT WORK ACTUALLY IS`: Hospital's 63,415 instances collapse to 339 distinct types, top 20
covering 61.7%. Revit modellers do not place-and-parameterize per instance; they pick a type once and it
propagates. Any "we're easier than Revit" claim that ignores this baseline is comparing against a strawman.

**Why Revit doesn't bind IFC metadata at that same onset moment (strategic, not an oversight):** IFC is a
competitor-neutral schema, not Autodesk's own — baking it in as the native truth would erode the lock-in
their format provides. The same native object can legitimately need different IFC classes/Psets depending
on the project's Exchange Information Requirements, so a fixed mapping can't be set once. The IFC schema
itself version-drifts (2x3/4/4.3). And a real share of Pset data (fire rating, cost code, O&M) isn't known
at placement time — it's filled by different roles at different project phases. Keeping IFC an export-time
layer is a deliberate, defensible choice on their side, not just unfinished work.

**Residual grunt work Revit users still eat despite all their presets** (the actual target, not placement
mechanics which they've largely solved):
1. **Project-specific IFC/Pset/classification filling** — the firm template only covers firm defaults; each
   client's EIR differs. Concretely traced in `JKR_SKATA_COMPLIANCE_LANE.md`: Assembly Code is a manual
   TYPE-parameter set once in Manage → Additional Settings, and it's a **silent-loss trap** if the IFC
   exporter isn't separately told to write it — present in Revit, absent from the IFC, indistinguishable
   from "nobody coded it."
2. **Matching a real/site condition to the closest existing type** — still a human judgment call per
   instance, even though the same judgment repeats across many buildings of the same class.
3. Clash-driven rework and genuinely irregular one-offs — unavoidable either way, not a target.

**Where we already measure up (checked against live schema today, not asserted):** `build/duplex_rules.db`
`rule_placement` already binds `ifc_class` + geometry pattern (`dx/dy/dz`, `spacing_x_m/y_m`, `z_band_lo/hi`,
`storey_scope`) from measured precedent, so gap #2 is closed for any building class/discipline already
mined — the walker doesn't make a human re-pick a type each time the way even a fast Revit type-catalog
click still does. This is the real, narrow edge: it only covers classes we've mined (SH/DX/SC…), not novel
design — extract-only by PRIME RULE, same boundary already stated two sections up.

**Where we do NOT yet measure up (the honest gap, not the edge):** gap #1 is still open on our side too —
`rule_placement`'s schema (checked 2026-08-11) carries no Pset/classification columns, so within our own
extract-only footprint we close type-selection grunt work but not IFC-metadata-filling grunt work. And the
§4a/§4b clipboard/macro-capture primitive this doc already named as a total gap ("zero clipboard/copy/paste/
duplicate hits anywhere in `modeller/`") is the direct equivalent of Revit's groups+copy-paste — still
unbuilt, still the cheapest literal parity item on this list.

**Positioning, in the user's own words:** not "replace Revit for every user" — "for the long tail of users/
buildings where a rule DB already has measured precedent, skip the grunt work Revit still makes even ITS
own users do by hand." Same shape as `docs/internal/RevitParity.md`'s "long tail the big tools over-serve"
stance, already established there for analysis tools — this extends the identical logic to authoring/
placement instead.

**Two concrete close-the-gap candidates surfaced, neither started:**
- Mine Pset/classification per `ifc_class` into the rules DB (new column set on `rule_placement` or a
  sibling table, new mining pass over source IFCs — not a schema tweak) so placement emits IFC-complete
  metadata directly, closing gap #1.
- Build the §4a static clipboard (smallest, already-specified) — the literal Revit-groups/copy-paste parity
  move, independent of the above.
