# BIM OOTB / BIMCompiler — Outside Assessment

**Date:** 6 August 2026
**Subject:** red1oon/BIMCompiler, red1oon/bim-ootb
**Basis:** USER_GUIDE, ModellerGuide, both repo READMEs, seven screenshots of the running app, and comparison against pascalorg/editor.
**Nature:** an adversarial-but-fair outside read. Where I revised an earlier judgement during the review, the revision is recorded rather than the original quietly dropped.

**Filed:** moved from `~/Downloads/` into `docs/internal/` 2026-08-06. §0 below is an editorial pass applying the same
"revise on record, don't quietly drop" discipline the author states above — verified against the live repos, not
re-guessed. It does not rewrite the author's voice or arguments; it corrects specific numbers and one technical
recommendation that don't match current code, and flags where the author's own strategic framing conflicts with
things this project already knows and has written down. Read §0 first, then the body with its corrections in mind.

---

## 0. Editorial corrections (2026-08-06, verified against live repo + project memory)

**§1 Standing — commit/module/LOC counts were undercounted, not overcounted.** Checked directly:

| Metric | Assessment said | Actual (`git rev-list --count`, `find`/`wc -l`, 2026-08-06) |
|---|---|---|
| bim-ootb commits | 419 | **1,489** (origin/main) |
| bim-compiler commits | 2,417 | **2,418** (origin/master) — this one was right |
| Vanilla JS modules (viewer+erp+modeller+common) | 80+ | **331** |
| Browser code | ~90K lines | **~311K lines** |
| Locales | 18 | **18** — confirmed correct |

The 419 figure looks like it was read off a stale clone or a partial `git log`. This *strengthens* §1's own argument
("more surface than most funded BIM startups, produced solo") — it doesn't need correcting downward, it needed
correcting upward. Use the real numbers if this doc is ever quoted externally.

**§3 substrate table — Three.js row was already fixed before this assessment was written.** `~/bim-ootb/README.md`
currently reads `Three.js | r184 ESM` throughout, not r160. Either the assessor read an older README revision or a
cached page; either way this specific "landmine…sitting in the most-read file" is not live. sql.js 1.10.3 vs
OPFS-SAH is still an accurate open item — that one stands.

**§4 "the one blocking defect" — this is the load-bearing correction, and it changes the doc's #1 ranked priority.**
The assessment's central claim is that quantity extraction to trade UOMs is **not done**, evidenced by a screenshot
showing `IfcPipeSegment · 14452 ea · per M`. Checked the actual engine behind both the Find-panel cost readout and
the BIM→Project Order ERP fold (`~/bim-ootb/viewer/analysis_sidecar.js` `compute5D()`/`apply5DRates()`, live since
PR #316 2026-06-14, and `viewer/proj_fold.js`, live since PR #349 2026-06-16):

- `compute5D()` sums `bbox_x/y/z` into `length_m`, `area_m2`, `vol_m3` per IFC class — real dimensional extraction
  from the DB's geometry table, not a count.
- `apply5DRates()` picks which of those to bill by the rate pack's declared unit: `unit==='M' → length_m`,
  `'M2' → area_m2`, `'M3' → vol_m3`, and **only** falls back to `count` for `EA`/unmapped classes. This is the same
  function behind the shipped BOQ (`export_5d.js`, `cost_panel.js`) — it isn't new or partial.
- The ERP-side `C_UOM` table shipped in `erp/ad_seed.db` (committed 2026-07-04) has real `M`/`M2`/`M3` rows
  (`X12DE355` = M/M2/M3, IDs 990000-990002) seeded by the F1–F10 finance lane (`scripts/seed_fin_uom.js`, merged
  PR #349, 2026-06-16) — so `proj_fold.js`'s `C_UOM_ID` lookup resolves to the real unit for pipe/duct/slab classes,
  not the `EA` fallback its own in-code comment (now stale) still describes.

So the quantity-in-trade-UOM extraction the assessment calls "not done" has been live, in the primary cost/ERP path,
for about seven weeks as of this doc's date. What the screenshot shows is real, but it does not follow that the
capability is missing — three more likely explanations, in order of likelihood, none confirmed here: (a) the panel
photographed reads a *different, older* code path than `analysis_sidecar`/`proj_fold` (there are several BOQ-shaped
views in this codebase); (b) it's a stale OPFS-cached sidecar baked before the 2026-07-04 seed rebuild — `get5D()`
serves from cache first and only recomputes on a miss; (c) a genuine display bug in one specific grid that hardcodes
an "ea" unit label independent of the computed qty. **Before treating this as a priority, the owner should open the
Kernel-ERP Project Task Line panel fresh (clear OPFS/hard-reload) and read the `§5D_SIDECAR` / `§QTO_UNIT`-style
console line for that exact grid** — that tells you which of (a)/(b)/(c) it is in about a minute, versus guessing.
Either way this is a much smaller, much more local fix than "extraction was never built" — it's real UOM-aware
extraction that possibly isn't reaching one panel, not a missing subsystem. Demoted accordingly in §11 below.

**§5 Occlusion DLOD — the recommended fix (hysteresis + opacity ramp) has already been tried and retracted, four
times, in this exact codebase.** Project memory (`project_dlod_geometry_swap_landmine.md`) records the sequence
directly: S258 (disabled after wrong-angle flicker + a fight with Time Machine's visibility control), S259
(BatchedMesh `setGeometryIdAt` proposed), **S261 — "fully built distance-threshold geometry swap… INCLUDING a
hysteresis band (promote 50m / demote 80m) specifically to prevent boundary flicker. Still retracted — hysteresis
alone did not fix the edge-on flicker or the TM-visibility-fight problem"** — and S262 (re-enable attempt, still
reverted). The geometry-swap path (`_useDlodPath`) is hard-set `false` in `viewer/streaming.js` today, guarded by a
whitebox test that asserts it stays that way. What actually shipped this week and produced the "flies and scrubs
effortlessly" result the assessor likely observed is `§DLOD_VF_CAMGUARD` (PR #1199/#1206) — a camera-pose guard on
the separate frustum-culling mechanism, fixing a stutter/pop during camera motion, not a reopening of the
geometry-swap question. Recommending hysteresis+ramp here reads, from inside this project, as re-proposing a
specifically-falsified fix without the history — worth the owner knowing that before spending time on it. The
disjoint-sets pattern that *did* ship successfully (`TM_DLOD_SCALE.md` Phase 3 — two permanently separate draw sets,
never a swap on the same slot) is the citable precedent if this is revisited.

**§5 Room graph / pathfinding — critique is technically still valid, but "make the doors the nodes instead" is a
bigger rewrite than the framing suggests, and work in this exact area is active, not stalled.** The graph is
confirmed still room-centroid-based (`common/room_graph.js` `shortestPath()`), not portal-based — so the criss-cross
diagnosis holds. But this is a live area: PR #1178 (merged 2026-08-04) fixed a detour-revisit bug found via a
5-real-path witness against Hospital/LTU_AHouse; a follow-up (2026-08-05, not yet PR'd) bridged 6 disconnected
2-room islands on LTU_AHouse, regression-tested against all 89,627 existing room pairs (0 lost/0 changed, 3,500
newly connected). A portal-node rewrite is a legitimate, still-open next step, but it's not an untouched corner of
the code — say so if this recommendation reaches the owner, so it reads as "here's the next increment" rather than
"nobody has looked at this."

**§8 pascalorg/editor — the numbers have moved, and one is wrong regardless of when it was read.** Live via
`gh api repos/pascalorg/editor` today: **21,147 stars** (was 17,500), **2,699 forks** (was 2,400), **14 releases**
(was 13) — all just growth since the assessment was written, expected for a two-month-old snapshot, update if
quoting externally. **"Three contributors" does not check out at any snapshot** — `gh api
repos/pascalorg/editor/contributors --paginate` returns **35** distinct contributors today. If this was meant as
"three core maintainers" that's a different, unverified claim; as written it undercounts by an order of magnitude
and should not be repeated. This makes §8's own "reach without depth" argument stronger, not weaker — worth noting
in case the correction reads as deflating the point; it doesn't.

**§9 Distribution — bim-ootb's own fork count, for symmetry with the BIMCompiler figure the assessment already
gives.** Live: bim-ootb 11 stars / **6 forks**, BIMCompiler 7 stars / 4 forks (this second pair matches the
assessment exactly — "Parent: 4 forks against 7 stars" was accurate at time of reading and still is). Roughly 1:1.6
star:fork on bim-ootb reads the same way the doc already argues for BIMCompiler — practitioners, not scrollers.

**§9 "No releases published on bim-ootb" is also wrong — this one matters.** `gh api repos/red1oon/bim-ootb/releases`
returns **30 releases**, semantic-release-automated from conventional commits, latest `v1.38.0` dated 2026-08-05 (one
day before this assessment), tracking `main` essentially in real time. So "tag a release, an afternoon's work" was
already being done automatically, daily, the whole time this assessment was written — and it hasn't moved the
distribution needle the assessment expects it to. That's a sharper finding than "do this cheap thing": the tagging
itself was never the bottleneck, discovery was (same conclusion §9 reaches for stars, just not connected to its own
release recommendation). The real gap in the release surface is that these are raw auto-generated changelogs with
no curated framing and no assets — not that releases don't exist.

**Not independently checked, left as written:** the XER/MSProject importer's existence is confirmed live
(`erp/tests/real_xer_witness.js`, `xer_pmxml_writer_witness.js`, bound `.xer`/MSProject fixtures for Hospital) so
§3's "Shipped" status is accurate, but whether its CPM recompute matches P6's own float/critical-path output was not
re-derived here — that question in §3 is still open and still worth asking. The "30 preloaded buildings" and "155
Playwright tests" figures were not cheaply falsifiable from a static read (buildings ship partly via OCI, not all
locally cached; Playwright counts individual `test()` cases, and there are 53 spec *files* which is consistent with
155 cases but wasn't fully enumerated) — plausible, not verified, don't cite as hard-checked.

---

## 1. Standing

Roughly four months from browser pivot (S200, April 2026) to the current surface:

- 419 commits on `bim-ootb`, 2,417 on the parent — **see §0: actual is 1,489 / 2,418**
- 80+ vanilla JS modules, ~90K lines browser code, no framework and no build step — **see §0: actual is 331 modules / ~311K lines**
- three shipped surfaces — Viewer, DAGeVu Modeller, Kernel-ERP
- 30 preloaded buildings, largest 40,086 elements; 1M+ elements federated
- PWA, offline, 18 locales, 155 Playwright tests

This is more surface area than most funded BIM startups hold, produced solo. That is the fact the rest of the assessment sits on.

---

## 2. What is genuinely defensible

### 2.1 The BIM↔ERP fold

No one else has it in one kernel. ThatOpen does components, Speckle does interop, IfcOpenShell does native IFC, Autodesk does the platform. The one thing none of them does is fold a building into a procurement order over the same log.

The thesis is not unproven — it has been validated at billion-dollar prices. RIB's iTWO sold "5D BIM plus ERP" for two decades and went to Schneider Electric for ~€1.4B. Trimble paid ~$1.2B for Viewpoint to bolt construction ERP onto Tekla. Nemetschek owns Allplan and Nevaris; Oracle owns Primavera, Aconex, Textura.

Every one of those is **two products with an integration layer**, server-hosted, six-figure seats. None is one kernel. None is a URL. None is MIT. That gap is real and currently unoccupied.

### 2.2 Domain knowledge that predates the tooling

The AI-native cohort — Togal, Kreo, Trunk Tools, nPlan, ALICE — is funded, focused, and talks to customers daily. What almost none of them has is a model of construction older than their codebase. They ship fast against a domain they learned last year.

The inversion here is the actual asset: **their code is fast and their model is guessed; this model is twenty years old and the code got fast.** Nobody at ThatOpen can reduce an Application Dictionary to five relations plus verbs, because nobody there spent two decades inside one. That is not replicable by hiring.

### 2.3 Evidence that already exists (correcting an earlier judgement)

I initially wrote that the project had positioning documents and no oracle-backed proof, and separately advised hiding the Modeller behind a Labs flag. **Both were wrong**, and the ModellerGuide is why:

- Generalization to held-out buildings: precision 0.839 in-domain (LTU_AHouse, 32,138 segments), degrading gracefully to 0.620 out-of-domain (HHS_Office)
- **0 fabricated joins on every building tested; 0 exceeding the gap bound**
- Clash collapse under the correct standard: 94% on Duplex, 99.4% on SampleCastle, every residual flagged
- Honest RED/WEAK verdicts where a building genuinely has no ductwork, rather than fabricated output
- Containment bug independently verified fixed five separate ways
- BCF 2.1 export carrying real `IfcGuid`s — opens correctly in Navisworks, Solibri, BIMcollab, Trimble Connect

That is oracle-backed evidence of exactly the kind I claimed was missing. It is simply filed under a user guide instead of a paper.

**Consequence:** the USER_GUIDE describing DAGeVu as "Early/WIP" is undercutting the strongest evidence page on the site. Fix that line.

### 2.4 Coherence that a team could not have produced

A committee does not fuse BIM and ERP, because no committee holds both domains in one head — it holds them in two heads that schedule a meeting, and what emerges is an integration layer, not a fold.

Build velocity itself is commoditized: pascalorg/editor is built with the same agentic tooling. What did not commoditize is the composition.

---

## 3. The substrate that is expensive to reverse

The distinction that should govern where the next months go: **spend on what is expensive to reverse, not on what is cheap to add later.** Another app surface, more locales, more doc pages — all cheap in month twelve. Substrate is not.

| Item | Status | Why it is expensive later |
|---|---|---|
| `sql.js 1.10.3` vs SQLite WASM / OPFS | README says sql.js; architecture docs pitch OPFS-SAH in a Worker | Every month deferred, more of the 80 modules bake in the whole-DB-in-RAM memory model |
| Op-log schema and signature format | Live, unversioned | The moment one external party holds a `.db` they care about, the format is frozen. It is free to change today |
| XER / MSProject → CPM → op-log binding | Shipped | Horrible under-documented format; correct parsing is the reason schedulers stay locked into Primavera. This is the 4D leg of the fold |
| Quantity extraction to trade UOMs | ~~Not done~~ **See §0 — live since 2026-06-16, likely a one-panel display gap, not a missing subsystem** | See §4 |
| Three.js version | ~~README cites r160; BatchedMesh requires r166~~ **See §0 — README already reads r184, this is resolved** | — |

### On the XER importer specifically

It was mentioned third in a list, behind a rendering feature. It is the largest item on that list by a distance, and it belongs in the expensive-to-reverse class. Two questions decide how strong it actually is:

1. **Does the CPM recompute match P6's own float and critical path on the same XER?** That is a free oracle — P6 will simply tell you the answer.
2. **Does the activity→element binding persist as ops in the log, or as a side table?** If it is in the log, 4D and procurement are already the same mechanism.

---

## 4. The quantity/UOM question — corrected priority (was "the one blocking defect")

*Original framing below, kept for the record per this doc's own stated method — read §0 first, which found the
underlying extraction has been live since 2026-06-16.*

From the Kernel-ERP Project Task Line grid:

```
IfcMember       ·  7127 ea · per M
IfcPipeSegment  · 14452 ea · per M
IfcSlab         ·    35 ea · per M2
```

**Counts carrying trade UOMs.** A plumber is paid for linear metres by diameter, not for 14,452 segments.

Everything upstream of this is right — the trade mapping is correct, the UOMs are the correct ones, the document structure is exactly what a Project Order should look like. It is the last step that is missing: extraction of the quantity into the UOM already declared.

A quantity surveyor opening that grid closes the tab. Not because the idea is wrong, but because the number is.

**Corrected assessment (§0):** the extraction step is not missing — `analysis_sidecar.js`/`proj_fold.js` already
compute and bill `length_m`/`area_m2`/`vol_m3` from bbox data, gated on the rate pack's declared unit, and the ERP
seed already carries M/M2/M3 UOM rows. If this exact panel still shows `ea`, it's most likely reading a stale
OPFS-cached sidecar or an older/parallel display path — a one-panel check, not a subsystem build. Still worth fixing
fast (a QS closing the tab on a wrong-looking number is real either way), but it does not carry the "single
highest-leverage item in the whole system" weight the original ranking gave it. Demoted in §11.

**Related, same panel:** `Unknown (2120)` — roughly 30% of elements carry no storey, which means Level 1's RM 4,350,060 cannot be a complete level cost. Worth determining whether those are legitimately site/external elements or an extraction gap. *(Not checked in §0 — no repo evidence gathered either way; treat as open.)*

---

## 5. Smaller technical notes

**Room graph / pathfinding.** The criss-cross in the Find Panel route is the signature of a centroid graph — rooms as nodes, edges between room centres, so the path detours into the middle of each room and back out. Make the **doors** the nodes instead: portal-to-portal within a room, with the room supplying only traversability. Paths straighten and the metres become truthful, which matters downstream for egress distance. **See §0 — diagnosis confirmed still accurate; area is under active work (PR #1178, 2026-08-04) with a full connectivity regression harness already in place, not untouched.**

**Occlusion DLOD.** The premature-hiding-as-reveal effect is a genuine happy accident, but what makes an artifact keepable is that it becomes *deterministic and controllable*. In a fly-through it reads as reveal; parked and inspecting, a coordinator reads it as a defect and stops trusting the geometry. Same pixels, opposite verdict, depending on whether they believe it was chosen.

Fix that keeps the delight: ~~hysteresis on the cull threshold plus a short opacity ramp instead of a binary flip~~
**see §0 — this exact mechanism was built and retracted as S261, twice more attempted (S259/S262) and still
disabled; do not re-propose it without addressing why it failed those four rounds (wrong-angle/edge-on flicker,
fighting with Time Machine's own visibility control).** The pattern that *did* ship (`TM_DLOD_SCALE.md` Phase 3) uses
two permanently disjoint draw sets instead of swapping one slot's geometry — that's the citable precedent for
"deterministic and controllable" here, **bound to mode** — Fly Tour and Film Maker get the reveal; Clash Matrix and section-cut inspection get full residency, no culling, no exceptions.

**Film Maker.** 745 frames over 49.7s is 15 fps and will strobe on lateral pans; 24 if the bake time allows. A small deceleration at each band and doorway would read as human, since walkers slow at thresholds.

**Palette.** Solibri and Navisworks use muted palettes because coordinators stare at them for six hours. The current saturation is beautiful in a screenshot and may be fatiguing in a session. Worth a "coordination" palette alongside the current one.

**Life safety.** Emergency routing and crowd control are regulated — travel distance, egress width, occupancy load. Different category from a wrong BOQ. Decide now, while it is cheap, whether that feature is scoped as *visualization of a route* or as *egress compliance*, and label it accordingly. "SAMPLE — NOT OFFICIAL" is sufficient for payslips. It is not sufficient for evacuation.

---

## 6. Positioning

### 6.1 Retire the Twinmotion frame

Four reasons, any one sufficient:

1. It anchors on render quality — the one axis where a browser loses permanently to a workstation GPU.
2. Twinmotion is a **terminal** tool. Pixels out, for a client meeting. It files the project under visualization, which in BIM is downstream, decorative, and first cut from a budget.
3. It renders the ERP fold invisible — the only uncontested asset, hidden.
4. It invites a judgement a passer-by can settle in two seconds from one screenshot, and lose.

"Ideal handoff of any IFC model" is closer but still passive. Handoff implies receiving and passing along. This project authors, generates, costs, and procures.

### 6.2 The frame to use instead

In the industry, **the model dies at handover.** Revit authors it, Navisworks checks it, Twinmotion sells it, and at practical completion it goes into a folder while somebody re-keys the asset register into an ERP by hand. Everyone in BIM knows this and nobody has fixed it, because fixing it requires both halves in one head.

> **BIM OOTB is what happens when the model doesn't stop at handover.** Open the IFC in a browser tab; the same signed log that holds the geometry holds the room graph, the schedule, the asset, and the purchase order. Nothing is re-keyed, because nothing was ever a separate file.

This positions against the **gap** rather than against any incumbent's strongest axis:

| They own | Not contested |
|---|---|
| Revit / Archicad | authoring from blank |
| Navisworks / Solibri | the coordination oracle |
| Twinmotion / Enscape | render quality |
| RIB iTWO / Viewpoint | enterprise procurement at €1.4B scale |

| Nobody owns | Yours |
|---|---|
| the model after handover | one log, geometry through to Project Order |

Say the render is a **byproduct** — "it also makes a film, because a walk through a room graph is already a camera path." Stronger than claiming the category, and true.

### 6.3 The one-liner

> BIM OOTB compiles a building into its Bill of Materials and its room graph, then folds both onto one signed operation log — so the model, the schedule, the walk-through and the procurement order are the same object, in one browser tab, with no server.

---

## 7. Intellectual lineage

Usable as written. Rule: **claim inheritance, never endorsement**, and always follow a name with the departure. A name without a departure reads as borrowed authority; with one, it reads as scholarship.

> Nothing here is a new idea. Hipp put a real database in a single file. Greg Young and Pat Helland established that state is better computed by replaying an immutable log than guarded as a mutable scalar. Kleppmann and van Hardenberg named the local-first doctrine and showed the user's device could be the authoritative copy. Hillier and Hanson showed, forty years ago, that a building is legible as a graph of spaces connected by passable openings, and that this graph predicts how people actually move. Christopher Alexander, earlier still, decomposed design itself into a graph of requirements. Each of these was proven in a forgiving domain — notes, documents, academic analysis. None was ever carried into a domain that punishes error: double-entry accounting, construction procurement, a building that has to be paid for and walked through. That carry is the whole contribution. The doctrines are borrowed; the composition, under ERP semantics and against a real IFC, is not.

**Caution on space syntax:** "Hillier's justified graph, recovered from a compiled model" is defensible. "Space syntax analysis" is not, until the graph is portal-based and the criss-cross is resolved. Same discipline as the code: do not assert what the oracle has not checked.

**Free result available now:** the weighted room graph already exists, so Hillier's **integration** measure — mean depth from each room to every other — falls out almost for nothing. Render the model heated by it and the building reports its own social centres and dead ends.

---

## 8. pascalorg/editor — harvest assessment

**Verdict: harvest ideas, not code.**

### Why the code will not transplant

| Pascal | BIM OOTB |
|---|---|
| React 19 / Next 16 / R3F / Zustand / TypeScript / Turborepo / Bun | 80 vanilla JS modules, no build step, no framework |
| Zundo — a 50-step undo **buffer** | signed op-log; geometry is a pure fold |
| Nodes authored from blank, persisted to IndexedDB | ARC substrate seeded verbatim from a real IFC |
| three-bvh-csg (mesh booleans) | OCCT B-rep — stronger |

The undo row is disqualifying. Their entire state model is mutable nodes plus a bounded history stack — precisely what this architecture exists to reject. Any component pulled across would need rewriting to commit ops, at which point it has been rewritten — in a different language and paradigm.

MIT on both sides, so no legal friction. The friction is total architectural incompatibility.

### Worth taking

1. **Wall mitering.** Their `WallSystem` miters joins where walls meet. Layered-slab walls will need this the moment two authored walls meet at a corner. Read the approach, implement in OCCT.
2. **`canPlaceOnWall(wallId, t, height, dims)`.** Parameterizing wall-hosted placement by *t* along the wall is a clean primitive — the authoring-side complement to hosted-filling rides.
3. **The plugin manifest — the real prize.** One `Plugin` shape, no separate internal API, so `plugin-trees` is a standalone repo anyone can clone. The walkers are already this shape: a discipline is "just a data filter," `duplex_rules.db` vs `terminal_rules.db`. A published **rule-pack format** would let a Malaysian contractor mine their own MEP cadence and share it. That is the diffusion strategy with an actual mechanism attached.
4. **Level modes** — stacked / exploded / solo. Cheap, and exploded axonometric is a drawing type architects want.

### The uncomfortable comparison

~~17,500 stars. 2,400 forks. 13 releases. Trendshift badge. Three contributors.~~ **See §0 — live 2026-08-06:
21,147 stars, 2,699 forks, 14 releases, 35 contributors (not three).**

They have a fraction of the depth — no IFC ingest of real production models, no evidence tables, no BCF, no ERP, no rule mining, no proofs. They draw walls from blank. And they have a thousand times the reach.

The difference is not quality. It is npm packages, a docs site, versioned releases, a Discord, a plugin example repo, and a stack the JS world already knows. Every one of those is distribution machinery, and they built it **before** the depth.

Which is the worse order — depth cannot be retrofitted, machinery can. But their v0.9.1 tag alone probably earns more inbound than the entire mkdocs site here.

---

## 9. Distribution

I over-weighted GitHub stars early in this review and was right to be corrected: 11 stars in two months on a four-month-old project is up and to the right, and star count is below noise floor either way.

The better early signal is the **fork-to-star ratio**. Parent: 4 forks against 7 stars at time of reading. Stars are cheap — collectors and bookmarkers. Forks cost intent: someone pulled the code down to run it. A ratio near 1:1 means the few people arriving are practitioners, not scrollers. That is a better signal than a Hacker News spike would be. *(§0: bim-ootb itself is 11 stars / 6 forks live today — same read, roughly 1:1.6.)*

The honest early scoreboard is not GitHub at all:

- **SYSNOVA** — paying deal or still a conversation?
- **The white-paper co-author** with Thames Tideway / Palace of Westminster credentials — a named practitioner staking reputation on the architecture. Worth more than the entire star count.
- **The Dion Moult meeting** — follow-up thread or gone quiet?
- **Who forked bim-ootb**, and did they open anything?

Those four distinguish *early* from *wrong*. Stars will not, for another year.

### Cheap structural fixes

- **Three front doors** — docs at `github.io/BIMCompiler`, code at `/bim-ootb`, live demo on an OCI bucket URL. Attention never pools. Consolidate.
- **No releases published on bim-ootb.** Enterprise evaluators look for tags. An afternoon's work.
- **~30 doc pages for ~0 users.** Freeze the doc surface; write nothing new until someone asks a question the site cannot already answer.

### Deals vs. oracles

Deferring commercial pursuit while focused on deep development is defensible. But two things should not be bundled:

- **Pursuing deals** — contracts, sales cycles, distraction. Right to defer.
- **Acquiring an oracle** — one practitioner saying whether the BOM fold matches how they actually procure. Costs an afternoon, involves no commercial commitment, does not interrupt deep development.

Right now the code has an oracle and the design does not.

---

## 10. Prior art

*Prior art* is a term with teeth: it requires public, timestamped, findable disclosure, and its strength scales with **enablement** — whether the disclosure teaches a skilled person to build the thing.

The git history, MIT license, mkdocs site and the film already do that work, largely without it having been planned. Which means **the record is itself an asset**, and dated screenshots are part of it.

But: a mockup panel teaches nothing and plants a weak flag. The XER→CPM→op-log binding, written up and dated, plants a strong one. If being first is the point of pride, the flags are worth more driven deep than spread wide.

---

## 11. Ranked next moves — reordered per §0

Original ranking is struck through where §0 changed the priority; unchanged items keep their reasoning.

1. ~~Quantity extraction to trade UOMs (§4). Small, blocking, converts the fold from demonstration to money.~~
   **Demoted — §0 found this is already live in the primary cost/ERP path. Replace with: verify why the Kernel-ERP
   Project Task Line panel specifically still shows `ea` (stale OPFS cache vs. a display bug vs. a different code
   path) — a same-day check, not a build.**
2. **Portal-based room graph** (§5). Straightens routes, makes metres truthful, unlocks Hillier integration for free.
   Confirmed still open; build on the connectivity regression harness already in place (89,627 pairs) rather than
   from scratch.
3. **CPM verified against P6's own float and critical path** on the same XER. Free oracle. Still open, not checked in §0.
4. ~~Tag a release. Consolidate to one URL. An afternoon.~~ **Already automated (§0) — 30 releases, daily,
   tracking main. Replace with: curate the release page (landing framing + a "try it live" link to the pinned
   commit), and still consolidate the three front doors.**
5. ~~Resolve sql.js vs OPFS, and the r160/r166 inconsistency in the README.~~ **The r160/r166 half is already
   resolved (README reads r184). sql.js vs OPFS is still open — keep that half.**
6. **Publish the rule-pack format** as a plugin-style contract — diffusion with a mechanism.
7. **One named case study** with real numbers. Outranks every doc page that could be written.
8. **New, from §0:** before touching Occlusion DLOD again, read `project_dlod_geometry_swap_landmine.md` in full —
   the obvious next fix (hysteresis/opacity ramp) is the specific thing already tried and retracted twice in that
   history.

---

## Closing

The engineering is well ahead of the distribution. That is a much better problem than the reverse — depth cannot be retrofitted and machinery can — but it does not fix itself, and it is the one thing an agentic coding tool cannot ship on your behalf.

The window is open. What makes it *yours* is not build velocity, which commoditized the day it arrived, but that you may be the only person carrying both an Application Dictionary's internals and construction BIM in one head. Spend the window on what is expensive to reverse.
