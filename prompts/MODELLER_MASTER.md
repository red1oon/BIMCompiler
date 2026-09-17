<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — MODELLER MASTER: the single entry point for "make the Modeller work"

```
SCOPE: the DAGeVu Modeller (bim-ootb `modeller/*`) as a WHOLE — every objective below must be met, not
a subset. This file is the INDEX + CONTRACT; the 15 per-topic files it triages stay authoritative for
their own detail. Read the log after every run (Log Mandate). Read the §PRIME LESSON before any
diagnosis. Created 2026-07-30 at the user's instruction: "triage the modeller prompts/# consolidate
them to some master prompts/# ... so that with that prompt we be launching a dedicated session to
study deeply how to make the Modeller work", and "all the objectives of the Modeller must be met.. as
i have no time to sight, i rely on a good vibe coder to do so."
```

## ▶ §RESUME 2026-09-15 — START HERE. Written at session close by the session that did NOT touch the
## Modeller, so you inherit facts, not a handover story.

**WHAT THE LAST SESSION DID, AND WHY IT MATTERS TO YOU: nothing in `modeller/`.** It ran the Viewer 4D/5D
lane (`TM_4D5D_VARIANCE_LANE.md` §S7 — the construction window on an element). Merged to bim-ootb `main`:
#1731 #1732 #1733 #1735 #1736 #1737; to bim-compiler `master`: #101 #102. Touched `viewer/*` and
`tests/audit_sw_precache.js` only. **No `modeller/` file was edited, so nothing below is stale because of
it** — but two of its by-products are yours to know:
- `viewer/sw.js` is at **`CACHE_VERSION` v1177**. Bump from there, never from a remembered number.
- `tests/audit_sw_precache.js` was hardened (#1737): it now strips comments before pairing quotes, so an
  apostrophe or a `]` in a `PRECACHE_ASSETS` comment no longer silently drops every later entry. Before
  that fix it reported files unchanged for months as "unlisted" and said nothing about the real cause. If
  you add a modeller asset to a precache list, that gate is trustworthy again.

**VERIFIED NOW, not carried forward from prose (2026-09-15):**
- `modeller/tests/` holds **216 witnesses**. Last `modeller/*` work landed **2026-09-11**: the §DAGEVU
  relationship-edge engine and the cut-move arc (`#171x` series — GEOM_CUT_MOVE, GEOM_CUT_RESIZE, cut
  frame under a 90°-multiple GEOM_ROTATE, §DAGEVU-SLIDE).
- **Nothing is in flight.** Both modeller worktrees (`/tmp/wt-dagevu-engine` `feat/dagevu-slide`,
  `/tmp/wt-dagevu-resume-doc` `docs/resume-dagevu-engine`) are `ahead=0 dirty=0` — fully pushed, clean,
  prunable. No one is mid-edit.

**⚠ THE §OPEN LIST BELOW WAS HARVESTED 2026-07-30 AND IS ~6 WEEKS STALE.** Its 34 rows predate the entire
DAGeVu engine arc. **Your first job is a re-verify sweep, by this file's own rule** ("a file claiming
something is open may be stale — check the shipped code first; that mistake has already been made here").
Re-mark every row `verified-open` or `stale-claim` against `origin/main` by grep/sqlite BEFORE picking
work off it. Do not trust row ordering as priority; do not trust "NEXT SESSION START HERE" on row 34
without checking it first — see immediately below.

**Row 34 ("anchor export/save leak"), spot-checked 2026-09-15: STILL LOOKS OPEN, but confirm it.** The
question is whether the 65 phantom anchor ops leave in an IFC export (`bonsai_ifc.js`) or a Save snapshot
(`sdg_save.js`/`saveModelDb`). `W-ANCHOR-SWEEP` (`witness_residents_anchor_sweep.js`) proves the RENDER and
MATHS side only — its own header says so. Grep found no witness asserting export/save element-identity
with anchors present. That is a grep, not a proof: read the two code paths before you either fix it or
close it.

**HYGIENE — swept 2026-09-15, partly done, and the remainder is NOT yours to prune.** The sweep ran over
all 22 outstanding `/tmp/wt-*` worktrees: **14 pruned** (the 5 this session created, plus 9 verified
`ahead=0 dirty=0` — including both dagevu ones). **13 remain, and every one of them holds real work:**

| state | worktrees | why it stays |
|---|---|---|
| unpushed commits (`no-remote` branch) | `wt-bake-perf` · `wt-batch-class-paint` · `wt-idb-cache-timeout` · `wt-krn-persist-race` · `wt-rule-findings-film` · `wt-storey-cut` · `wt-storey-reveal-list` | the branch was never pushed — pruning DESTROYS the commits |
| merged but dirty | `wt-bake-schedguard` (3) · `wt-buildup-placed` (27) · `wt-scrapbook` (1) | uncommitted changes on top of a merged branch |
| ahead and dirty | `wt-88-ab` (56 ahead, 4 dirty) · `wt-v87` (2 ahead, 17 dirty) · `wt-storey-reveal` (73 dirty) | someone's live in-progress work |

**Do not prune any of the 13 without the owner's word.** `wt-storey-cut` alone carries 359 dirty files.
If you add worktrees, prune YOUR OWN at close (`ahead=0` AND `dirty=0`), and leave these alone.

**METHOD RULES THIS LANE EARNED THE HARD WAY LAST SESSION — they apply here unchanged:**
- **A number that decides scope gets measured before it decides anything.** Three times in one session a
  plausible figure stood in for a measurement: a timing taken from the wrong function, a code comment's
  cap turned into a prediction, and a cross-file diff read as code drift. All three were wrong, all three
  were caught only because something forced a re-check.
- **A diff that decides scope must hold every variable but one.** The third of those varied two — the file
  AND the code version — then blamed the code. In THIS lane that trap is live: `*_extracted.db` and
  `*_silent.db` are different files with different completeness (Hospital: 64,150 transforms vs 63,917).
  Never diff across two building DBs and attribute the difference to code.
- **Prove a fix FIRES, not just that it shipped** — grep a real log line, never "code changed".

## ⚖ THE USER IS NOT REVIEWING. YOU ARE THE ONLY CHECK.
The user has explicitly said they have no time to inspect this work. That REMOVES the safety net; it
does not lower the bar. Therefore, in this lane:
- **Every claim carries its own `§`-tagged log line or it is not done.** No exceptions, no "should work".
- **No screenshot, no "looks right", ever, as proof of anything** — that is FUNDAMENTAL LAW in
  `CLAUDE.md`. Numbers computed from real object state, read programmatically.
- **Prove it where the USER will see it — the live URL — not only on localhost.** See §PRIME LESSON.
- **A witness that cannot fail is not a witness.** Every test names the issue it proves, and must be
  shown failing on the pre-fix code.
- **Report only finished, verified outcomes.** One line each. Not plans, not progress.

## 🔴 §PRIME LESSON — read before diagnosing ANYTHING (learned the hard way, 2026-07-29/30)
The Modeller rendered every element as a bounding box on the LIVE site for months while every local
measurement said "real geometry, 215/215". Cause was two faults stacked:
1. **Hosting** — `modeller/mesh.db` is Git-LFS-tracked and **GitHub Pages does not resolve LFS**. The
   browser got HTTP **200** with a **134-byte** text stub (`version https://git-lfs.github.com/spec/v1`).
2. **Silent substitution** — with no mesh store at all, `arc_editable.js`'s hard-fail guard was SKIPPED
   (it only fires when a store exists but one element's link is broken), so every element fell back to
   `boxArrays(rawBox)`, its measured bounding box. The only log line was a `console.warn`, which
   DevTools hides by default.

**The diagnostic order this burns in — apply it to every "the Modeller looks/behaves wrong" report:**
1. `curl` every asset the live page needs. Check real size and magic header. **A 200 is not evidence.**
2. Read what the code does when an asset is missing or junk. **If it substitutes anything — a box, a
   default, a placeholder — that silent substitution IS a bug in its own right,** worse than the missing
   file. Fix both; fixing only the file leaves the trap armed.
3. Check the service-worker `CACHE_VERSION` and whether the file is precached. A landed fix that a
   cached script overrides reads to the user as "still broken".
4. Only then explain — one line, naming the asset and the substitution.

**Do NOT start with:** local DB queries, triangle counts, part-count comparisons, material/lighting
audits, or LOD definitions. None of those can see a deployment fault, so none of them can answer.

**Fixed 2026-07-30, both faults** (bim-ootb PR #1090 merged + #1091 cache bump): each resident now has
its own small geo file on object storage (Duplex 1.3MB instead of a shared 120MB; all 8 residents
resolve 100% of their element hashes, verified), and `_assertRealGeoDb()` refuses non-SQLite bytes,
names an LFS stub explicitly, and logs as `console.error`. Guard witnessed 4/4 against real live bytes.
⚠ **`modeller/mesh.db` is now DEAD WEIGHT in git** — nothing fetches it. Do not re-point anything at it.

## 🎯 THE OBJECTIVES — "the Modeller works" means ALL of these, measured
Derived from the 15 files below + `[[project_modeller_vision_lock]]`. Each line: the objective, then
where its detail lives. **None of these may be quietly dropped to make a report look finished.**

| # | objective | authoritative file |
|---|---|---|
| O1 | **Real authored geometry renders — never a substitute**, on the LIVE site, for every resident | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` |
| O2 | **LOD400 means fabrication level** — an authored multi-layer wall is not one block (see §LOD400-ENVELOPE) | same, §LOD400-ENVELOPE + §LOD400-DISPATCH |
| O3 | **ONE coherent surface** — the Outliner leads (Building▸Storey▸Room▸disc▸class▸element), not 3 unlabelled tabs | `RESUME_MODELLER_UX_OUTLINER_PILL.md` |
| O4 | **Direct manipulation** — select · hover · move-on-axis · multi-select · snap · rotate | `MODELLER_DIRECT_MANIPULATION.md`, `RESUME_MODELLER_P3.md`, `RESUME_MODELLER_POLISH.md` |
| O5 | **Material at Viewer standard** — glass reads as glass; reflection/grain/roughness/light rig parity | `MODELLER_RENDER_MATERIAL_PARITY.md` |
| O6 | **Placement anchor semantics correct** — elements seat where the source says, not where a box implies | `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` |
| O7 | **Insert from the REAL BOM catalog**, not a hardcoded 3-component fixture | `MODELLER_BOM_CATALOG_SPEC.md` |
| O8 | **Save = validated snapshot promotion** (CompleteIt-shaped), not a raw dump | `MODELLER_SAVE_COMPLETEIT.md` |
| O9 | **Conformity gate** — RED/ORANGE planner's gate on edits | `RESUME_MODELLER_CONFORMITY_GATE.md` |
| O10 | **Spatial Dependency Graph as authoring truth** — typed cross-edges, host/filling rides its wall | `RESUME_GRAPH_MODELLER_INTEGRATION.md` |
| O11 | **Opens at Terminal scale** without a signing stall; roof/IfcPlate fast placement | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` |
| O12 | **Zoom-to-selection parity** with the Viewer Find panel | `MODELLER_ZOOM_TO_SELECTION.md` |
| O13 | **Guide-worthy** — the public guide's screenshots are honest and current | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` |
| O14 | **Competitive polish** — outline-pass selection, shadows/AO, BCF/IFC interop | `RESUME_MODELLER_COMPETITIVE_POLISH.md` |
| O15 | **3D Grid editing is the primary handle** — drag a gridline and the building RECOMPOSES (stretch, not scale); openings stay host-bound; rotated bays stay square; no state leaks between clears | the 9 `GRID_*.md` files + `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` — triaged below |
| O16 | **2D views ARE the drawings, and they are an INPUT surface** — orthographic elevations F/B/L/R + sections flatten ALL geometry, storey markers at real Z; end-state: drag a gridline in plan → write Δ to DB → recompile → services re-route | `[[project_2d_views_roadmap]]`; ⛔ **PDF/DXF sheet export is NOT yet an objective** — see §2D-AND-PDF below |

## 📋 TRIAGE — the 15 files, 3,742 lines total. Consolidation rule: this MASTER owns the OPEN LIST and
## the objectives; each file keeps its own history and detail. **Do not delete any of them.**

| file | lines | owns | first action for the study session |
|---|---|---|---|
| `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` | 599 | O1, O2 — geometry truth, the envelope defect, §GEO-SERVED history | its `§START HERE` + `§LOD400-ENVELOPE` are current; harvest OPEN items 1–6 |
| `RESUME_GRAPH_MODELLER_INTEGRATION.md` | 398 | O10 — graph/cross-edges into authoring | harvest open items |
| `MODELLER_BOM_CATALOG_SPEC.md` | 393 | O7 — real catalog INSERT | check whether the 3-component fixture still ships |
| `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` | 376 | O13 — guide screenshots + the old "geometry hell" thread | ⚠ its geometry-hell verdict is SUPERSEDED by §LOD400-ENVELOPE |
| `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` | 309 | O11 — open speed, roof/IfcPlate | re-measure at real Terminal scale, live |
| `RESUME_MODELLER_UX_OUTLINER_PILL.md` | 236 | O3 — one-surface UX | the 3-surface unification was DESCOPED, not shipped — decide |
| `MODELLER_RENDER_MATERIAL_PARITY.md` | 229 | O5 — material | glass opacity DONE; reflection/grain/roughness/lights NOT ported |
| `RESUME_MODELLER_COMPETITIVE_POLISH.md` | 208 | O14 — polish research (design only, no code) | ~11 quick wins already identified; rank them |
| `MODELLER_DIRECT_MANIPULATION.md` | 184 | O4 — the manipulation core | spine reported DONE; verify on the LIVE site |
| `MODELLER_ZOOM_TO_SELECTION.md` | 148 | O12 — camera parity | small, well-specified |
| `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` | 139 | O6 — anchor semantics | verify the flip actually shipped |
| `RESUME_MODELLER_POLISH.md` | 98 | O4 follow-ups | harvest |
| `RESUME_MODELLER_P3.md` | 87 | O4 multi-select | reported fully ✅ — confirm, then retire to a pointer |
| `RESUME_MODELLER_CONFORMITY_GATE.md` | 77 | O9 — RED/ORANGE gate | harvest |
| `MODELLER_SAVE_COMPLETEIT.md` | 61 | O8 — Save semantics | harvest |
| dir `prompts/Modeller/` | — | `COMPETITIVE_FREECAD_INTEROP.md`, `DISC_Walker/` | read, fold pointers in here |

### O15 — the GRID family, added 2026-07-30 (reviewer gap: the first harvest swept only `MODELLER_*`/
### `RESUME_MODELLER_*` filenames, so 10 files / 1,613 lines covering the Modeller's PRIMARY HANDLE were
### never triaged. The grid is how a user edits the building; it cannot be a single row in the queue.)

| file | lines | owns | first action |
|---|---|---|---|
| `GRID_ROTATION_GUARD.md` | 445 | rotated-bay correctness — the deepest of the family (20 done-marks) | verify the guard shipped, then harvest its 5 remaining |
| `GRID_ROTATED_SCALE_HARDENING.md` | 260 | scale hardening in `bonsai_kernel_worker.js` + its own witness | mostly ✅ — confirm, retire to a pointer if so |
| `GRID_KINEMATICS_SANDBOX_PROOF.md` | 233 | the 3D authoring-grid system proof (`bonsai_grid.js`, `grid_kinematics.js`) | this is the doctrine file for O15 — read FIRST |
| `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` | 162 | **grid ⊗ BOM as ONE authoring substrate** — 6 open, 0 done | spec-only, never built; decide if it is still the intended architecture |
| `GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md` | 151 | master design dialogue (reference only) — feeds O8 + pre-drag preview | reference; do not build from it directly |
| `GRID_SMART_ELEMENT_SCOPE.md` | 136 | which elements a drag legitimately takes with it | harvest — 10 open |
| `GRID_CLEAR_STATE_LEAK_FIX_ROUND2.md` | 100 | state leaking across a grid clear, round 2 | claims ✅ 2026-07-04 with "PR TBD" — **verify it actually landed** |
| `GRID_CLEAR_STATE_LEAK_FIX.md` | 72 | round 1 of the same | superseded by round 2 — confirm, then pointer |
| `GRID_PREDRAG_GREENORANGE_PREVIEW.md` | 54 | green/orange pre-drag preview | states shipped — confirm |
| plus queue row 7 | — | 🟥 the grid-lock crux, 0.104 m residual | already ranked; its own heavy session |

**Harvest rule for these, same as before:** verify against shipped code before listing anything as open —
two of these files claim DONE with no PR reference, which is exactly the stale-claim shape the first pass
found 11 of. Add the surviving rows to §OPEN LIST tagged `O15`.
**✅ HARVESTED 2026-07-30 (same day):** surviving rows = **28–31** in §OPEN LIST. Everything else in this
table verified SHIPPED against origin/main — including both suspect ✅s ("PR TBD" landed; tilt-guard merged
as PR #722 squash) — see the O15 stale-claims block. The one contradiction finding: row 28 (code present,
live measurement says inert).

### §2D-AND-PDF — the vision question, answered 2026-07-30 (user: *"Vision from there on can we do 2D
### professional drawing exporting to PDF?"*)

**Recorded position (`[[project_2d_views_roadmap]]`), unchanged:** *"The 2D views ARE the architectural
drawings. Full-screen + print-screen replaces export for now… No DXF/PDF export needed yet."* So PDF is a
**deliberate deferral, not a missing capability**, and the roadmap deliberately aims PAST export:

> *"End state: drag grid lines → write Δ to DB (like DXFSyncVerb) → recompile building → RouteWalker
> recomputes MEP. This is the BIM Designer Browser round-trip: 2D view is both output AND input surface."*

That is the same handle as O15 seen in plan. **O15 and O16 are one mechanism, two views — do not build
them as separate features.**

**Substrate that already exists** (verify each before assuming, per §PRIME LESSON): orthographic
elevations F/B/L/R, cross-sections showing slab/ceiling/roof heights, storey markers from
`detectStoreys()` at real Z, subtle gridlines with click-a-bay highlight (`viewer/elevation.js`).
Requirements already fixed by the roadmap: an elevation must flatten **ALL** geometry onto the view plane
(no empty spaces), and stairs must read from every side like a real drawing.

**⛔ NOT an objective until the user says so.** Professional PDF sheets = sheet frame + titleblock + real
scale + dimension strings + line-weight hierarchy — a genuinely new lane, not a small addition, and it
would be the first thing this product exports for print. Do NOT start it off this file. If greenlit it
becomes O17 with its own spec; until then the answer to "can we?" is **yes, and the 2D substrate is
already there — but the recorded priority is the round-trip, not the printout.**

## 🚚 THE DISPATCH — model allocation, stated honestly
Per `[[feedback_model_allocation_mastermind_vs_execution]]`:
- **Fable5 — YES for the wide mechanical pass, and it is the right tool for it.** Reading 3,742 lines
  across 15 files, extracting every open item verbatim with its file + section, de-duplicating,
  detecting claims that contradict shipped code, and filling in §OPEN LIST below. Long-context,
  mechanical, high-volume, fully specified. Fable5 does NOT write memory files.
- **Sonnet — required for the architecture calls**, of which at least three are already known and
  cannot be delegated to a mechanical pass: (a) §LOD400-ENVELOPE's one-mesh-per-element vs N-sub-instances
  decision; (b) whether the descoped 3-surface Outliner unification is still wanted; (c) whether a
  void-consumed host becomes a non-rendered logical anchor.
- **The user's own call** on anything that changes what the product IS, not how it is built.

**Sequence:** Fable5 harvest → §OPEN LIST filled and ranked → Sonnet takes the 3 calls → Fable5 builds
the mechanical items to zero → each item marked `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>`.

## 📌 §OPEN LIST — FILLED 2026-07-30 (Fable5 harvest, all 15 files + `prompts/Modeller/`, every row
## verified against bim-ootb `origin/main` by grep/sqlite — not carried forward from prose)
Format, one row per item, ranked most-blocking first:

`| # | objective | item, in one plain line | source file §section | proof required | status |`

| # | obj | item | source | proof required | status |
|---|---|---|---|---|---|
| 1 | O2 | ⛔ ARCH CALL (a): layered-wall representation — N sub-instances per layer vs ONE layered mesh + per-layer index (file recommends b) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-DISPATCH` step 2 | the choice stated in one line, recorded in that file | ✅ CALL MADE 2026-07-30 — **(b) one layered mesh + `component_geometry_layers` index**, recorded in the source file §LOD400-DISPATCH; row 3 unblocked |
| 2 | O2 | the plain-English "what a wall is made of" guide subsection — the user's PRIMARY asked-for deliverable, [[feedback_terse]] binding | same, step 1 | subsection in `docs/ModellerGuide.md` (zero "layer" hits there today) | ✅ DONE 2026-07-30 — "What a wall is made of" committed after §Realistic glass; deploy via `safe_gh_deploy.sh` post-merge |
| 3 | O2 | §LOD400-LAYERS-REAL: slice the authored envelope at authored layer thicknesses; ship layers+`surface_styles` to residents (patch + self-heal loader); then the Modeller half of the gate refuses envelopes | same, §THE FIX items 2–3 | `witness_lod400_envelope.py` gate GREEN; 7-layer wall `2O2Fr$t4X7Zf8NOew3FNbT` renders 7 slabs summing to authored total; falsified by removing one layer row | ✅ extractor half DONE 2026-07-30 (PR #57 merged; W-LOD400-ENVELOPE **12/12 exit 0 on Duplex, independently re-run by the orchestrator**, refusals: DX 0, SC 1 honest `sporenkap` pitched-roof → SC still exits 1 by design). ✅ **FULLY DONE 2026-07-30 — residents half shipped (bim-compiler PR #59 + bim-ootb PR #1096, both MERGED):** layer tables → `patches/Duplex_ARC.db.sql` self-heal; rebuilt `Duplex_geo.db` (layered buffers under the EXISTING hashes via per-guid measured change-of-basis — fresh hashes match 0/155 shipped, see the §LOD400-LAYERS-RESIDENTS record) uploaded to OCI + byte-verified live; `arc_editable.js` §LAYER-GATE refusal armed (schema-detected, Duplex only; SC untouched by design); geoV 3→4, sw v40→v41; W-E2E-LAYERS-RESIDENTS **8/8 against the LIVE geo URL** (party wall 124 tris / 7 rows Σ0.550 m / slabs 16-41-193-50-193 mm; falsification fires; unpatched residents byte-identical). Per-layer render COLOR deliberately not wired (needs face-group materials through the fold payload — own slice; data already ships). ⚠ **WATCHDOG CORRECTION 2026-07-30 (live-queried): the party wall renders 5 slabs, NOT 7** — layers 5-6 (Metal Stud 41mm, outer Plasterboard 16mm) have `face_count=0`, `face_start=124` = past the buffer end. 4 empty rows / 229 total, on 2 of 71 walls (both 7-layer, both opening-cut). The witness was BLIND BY CONSTRUCTION: thickness-sum (0.550) and face-count-sum (124) both reconcile while two layers are missing — a green computed over the wrong quantity, the same shape as §PRIME LESSON. → row 33 |
| 4 | O1 | ⛔ ARCH CALL (c): should a VOID-CONSUMED host become a non-rendered logical anchor (SC `stretchRide` reach 9/74 because 65/71 hosts are void-consumed) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE` OPEN 1 | doctrine analysis + recommendation recorded; **user's word before any build** | ✅ DONE (witness) 2026-07-30 — BOTH halves merged. Extractor: PR #58 (W-VOID-ANCHOR-EXTRACT 7/7, RED-falsified; SC patch independently verified: 65 anchors, instances unchanged 3225). bim-ootb: PR #1095 (W-E2E-VOID-ANCHOR 19/19, RED-first baseline committed; **reach 9/74 → 74/74**, rider dx == host delta exactly, filling mesh moved rigidly; guardrail proven surface-by-surface: visible 3225=3225, Outliner 3342/3418 identical, pick rays hit-for-hit identical through 8 anchor meshes, gmAudit/§SAVE_BASELINE/§XEDGE-ALL identical; one honest non-masked count: commitSeedGroup ops=3290, anchors named by §ANCHOR lines; CACHE_VERSION v39→v40) |
| 5 | O3 | ⛔ ARCH CALL (b): the descoped 3-surface Outliner unification — ARC tree + STR Walker tab still separate on main | `RESUME_MODELLER_UX_OUTLINER_PILL.md` + LOD400 §NIGHT 3 | re-scope verdict recorded (still wanted? safe incremental path?) | ✅ CALL MADE 2026-07-30 — unify INCREMENTALLY, 6 slices via the proven §ONE-DISC-TAB wrap, recorded in `RESUME_MODELLER_UX_OUTLINER_PILL.md`; slices 1-2 buildable now, no user decision load-bearing |
| 6 | O10 | §8E-3 substrate gap: the shipped "Open Terminal" resident (`Terminal_ARC.db`) is ARC-only, 0 MEP — a real user's walk renders no routed network; the witness sidesteps via `Terminal_meta.db` | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §DONE 2026-07-11 finding 1 | routed tubes render on the REAL user open path (or the gap recorded as accepted) | verified-open — RESIDENTS still serve `Terminal_ARC.db` |
| 7 | O10/O3 | grid-lock-to-ARC/STR crux — 0.104 m RMSE baseline residual on the emergent grid; prerequisite for RosettaStone-through-grid + clean fold | `RESUME_MODELLER_UX_OUTLINER_PILL.md` 🟥 | its own HEAVY investigation session, per-axis measured findings | verified-open — user-flagged heavy, untouched since 2026-06-27 |
| 8 | O10 | roof plates walked PER-ELEMENT on the measured pattern (user accepted 1.3% count err; gate = positional) — also the cadence source that tightens #7 | same 🟧 | plate-centre spacing uniformity measured; per-element pass-bar RMS sub-metre | verified-open |
| 9 | O10 | backprop APPLY: accept-gated hop-by-hop application of ORANGE suggestions (flagging shipped #647; applying not built) | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §USEFUL-DIFF 2 + `sdg_gate.js:106` | one accepted ORANGE fires one signed op, one hop, witnessed | verified-open (partially shipped) |
| 10 | O11 | Terminal open speed: staged pre-sealed rows + incremental `sealFrom` HAVE shipped since the 14 s profile — re-measure on the LIVE URL, then decide if Candidate C (batch-sign bulk classes) is still needed | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` ⛔ signing | live `§STAT-TRACE` numbers on the real URL | re-measure — `kernel_ops.js:210/404` supersedes the old profile |
| 11 | O5 | full colour-parity: Modeller still paints the cosmetic PALETTE; real `material_rgba` RGB unused (only alpha recovered) | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | real per-element colour, before/after on Duplex + HHS glazing, witness | verified-open — `arc_editable.js:30-31` says so in its own comment |
| 12 | O1 | `rel_fills_host` missing on ALL five new residents (Clinic/Hospital/HHS/Garage/Terminal); the fresh `Clinic_extracted.db` ALSO lacks the table | LOD400 §START HERE OPEN 2 | `gen_rel_fills_host_patch.py` per building once its source IFC is locatable; guide Grid-Stretch sentence extended | verified-open — sqlite3 confirms no table; sources not in this checkout |
| 13 | O14 | SSAO + OutlinePass selection — blocked on vendoring EffectComposer (own slice) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` §NEEDS-DESIGN 6/7 | vendored composer + witness | verified-open — `modeller.html:411/1022` name the gap |
| 14 | O7 | per-mesh furniture orientation normalize-at-extraction (metadata lies: Dining_Chair z=0.14, FURN_DESK z=2.0) | `MODELLER_BOM_CATALOG_SPEC.md` §ALSO QUEUED | bake axis-permutation into vertices; witness tallest-axis==h | verified-open — no bake code in `extract_dagevu_catalog.py` |
| 15 | O7 | full 23,888-part library via httpvfs range-load — ⛔ BLOCKED: **where does the 220 MB `component_library.db` live (GH vs OCI)? user's call** | same §BUILD LEGS L1–L3 + §OPEN | W-LIBDB-RANGE: bytes-read ≪ 220 MB | verified-open — no `createDbWorker` anywhere in `modeller/` |
| 16 | O1 | §SEL-TINT-REFOLD: an authoritative re-fold drops the selection tint while `_selSet` still holds the mesh | LOD400 §START HERE OPEN 4 | tint survives cut/undo re-fold, witnessed | ✅ DONE 2026-07-30 (bim-ootb PR #1094, MERGED + LIVE-verified): `bonsai:refold` event + `_paintSel` repaint at the true choke point (+ shadow-flag re-apply, same root cause); witness `witness_e2e_sel_tint_refold.js` proven RED on unmodified main first, 9/9 with fix; W-E2E-CUT C6 now pixel-EXACT |
| 17 | O1 | Walk-ALL row reuses the singular tooltip | LOD400 §START HERE OPEN 3 | one string | ✅ DONE 2026-07-30 (PR #1094, LIVE-verified byte-fetch): conditional on `__ALL__` row; W-E2E-WALK-ALL A9 asserts both rendered titles |
| 18 | O1 | Terminal-scale proxy-mode downgrade silent to the user | LOD400 §START HERE OPEN 5 | toast/badge on the batch-hold fallback | ✅ DONE 2026-07-30 (PR #1094): once-per-run toast via existing `toast()`; B3 asserts n=1 where per-disc would be 4; A10 negative control 0 below threshold; walk-all suite 13/13. CACHE_VERSION v38→v39 same commit |
| 19 | O13 | `move-gizmo.png` recapture (wide shot amid close-up neighbors) — parked in the retired `GUIDE_VISUAL_QUALITY.md` lane | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` §NIGHT 1 | recaptured close-up, opened + live-verified | verified-open |
| 20 | O13 | one live-bytes sweep: guide screenshots + claims vs the LIVE site (all captures were localhost) | master §KNOWN TRAPS | content-hash/curl pass against live gh-pages | ✅ DONE 2026-07-30: `§GUIDE-LIVE-SWEEP imgs=33 bad=0` + `§GUIDE-LIVE-HASH checked=33 mismatch=0` — every live guide image byte-identical to origin/master; live page carries the new wall section (3 hits) |
| 21 | O1/O7 | multi-part window sibling-clustering as a BOM — creates NEW relations (an authoring act, not recovery) | LOD400 §NEW ARCHITECTURE QUESTION | design call | ⛔ BLOCKED: user's design call, unscoped |
| 22 | O9 | gate residuals: one-click revert of a RED · UBBL named checks · rtree prune at Terminal scale | `RESUME_MODELLER_CONFORMITY_GATE.md` §NEXT | each its own witness | verified-open (door-crush + abuts-realign + Save-gating SHIPPED — see stale-claims) |
| 23 | O10 | W-DW-DENSITY-TE D3 density drift (ELEC 94.3 / FP 92.0 / ACMV 94.8 vs ≥99%) — find what shifted, decide the band | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §RESOLVED note | re-run + named cause | verified-open (not urgent) |
| 24 | O5 | `smoke_arc_only.js` SampleCastle iteration produced no output/screenshot — flagged, never chased | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | root-caused or cleared | verified-open (flag only) |
| 25 | O14 | PBR texture maps (biggest lift) · per-instance hide + full virtualization · BCF IMPORT (export MVP shipped #620) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` items 9, §DECISIONS 2, §COMPETITIVE | — | verified-open (deferred by design, in this order) |
| 26 | O4 | solid-scale B-rep (occt `Copy=true` recompile or shape-lifecycle rework) | `RESUME_MODELLER_POLISH.md` 3b | — | ⛔ user-gated deferred ("only if authored-wall scaling becomes a real need") |
| 27 | O14 | accept an EXTERNAL (FreeCAD/neutral) IFC → snap to substrate → walkers complete it | `prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §4 | — | ⛔ BLOCKED: future feature, user greenlight |
| 28 | O15 | render-layer tilt gap: **293** tilted elements in the shipped `SampleCastle_ARC.db` (post-embed-8) measured rendering with IDENTITY transforms live 2026-07-10 — yet `§ARC-3AXIS` code exists on main (`arc_editable.js:231` passes rotX/rotY, `bonsai_library.js:78` applies the Euler); the branch is not firing on this data and nobody knows why | `GRID_ROTATION_GUARD.md` §5 | re-measure fids 933/1291/2514 on today's main; if still identity, trace why the tilt branch never fires; witness vs analytic 3-axis AABB | verified-open (code present + live measurement contradict — a contradiction finding) |
| 29 | O15 | ⛔ `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`: grid ⊗ BOM as ONE authoring substrate — spec-only, 3-stage build plan + 5 witnesses, 0 built (except W-TYPICAL-N 26/26 which already exists via `bom_extract`) | that file §STATUS/NEXT | — | ⛔ BLOCKED: user — is this still the intended architecture? (Watchdog-flagged 2026-07-30) |
| 30 | O15 | `WALL_HEIGHT_SCALE` cascade hardcodes `axis:'y'` as vertical (Y-up assumption, wrong for the Z-up Modeller) — dead code today (`isRoof` always false) but armed the day roof/ifcClass support arrives | `GRID_ROTATION_GUARD.md` §8 note | own design pass when roofs become grid-governed | deferred — documented in-code, in-file, and here |
| 32 | O1 | `witness_e2e_delete` D4 is RED on unmodified bim-ootb main — found (not caused) by the rows-16-18 session, diagnosed pre-existing, left untouched | rows-16-18 report 2026-07-30 (PR #1094 findings) | root-cause + fix or re-point the witness, RED-first discipline | verified-open (reproduced on unmodified main) |
| 33 | O2 | **empty-slab refusal (Watchdog directive):** an empty layer slab must be a REFUSAL, not an announced row. Extractor: per-layer assertion `face_count > 0` in `compile_layer_geometry()`/witness — any empty slab ⇒ loud refuse (element stays gated RED), never ship partial; then re-slice the 2 affected 7-layer walls — root-cause first: the shipped diagnosis says the authored body spans 0.493 m of the 0.550 m set (§LAYER-PARTIAL, "layers belong to the neighbour wall"), the Watchdog hypothesizes opening-boolean-cut leaves last slices outside remaining material — MEASURE which is true on `2O2Fr$t4X7Zf8NOew3FNbT` before fixing; if the source genuinely doesn't author those layers' material there, the refusal stands and the wall is honestly RED until resolved | Watchdog live-query 2026-07-30 + `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §ROW33-EMPTY-SLAB-REFUSAL | witness gains per-row `face_count>0`; the 2 walls either 7 real slabs or loud RED; falsify by re-introducing an empty row | ✅ DONE 2026-07-30 (extractor half; W-LOD400-ENVELOPE **16/16**, RED-first: pre-fix code fails exactly the 4 new checks): root cause MEASURED — the Watchdog's opening-cut hypothesis is **FALSE** (both walls carry ZERO openings; an authored `IfcPolygonalBoundedHalfSpace` clip at the layer-4/5 boundary trims the neighbour-side stud+plasterboard — Revit unit-demising, material genuinely absent) → refusal stands per the directive; empty slab now raises `LayerRefusal`, `verify_layer_geometry` refuses `face_count<=0` rows, Duplex gate honestly RED 2/80 exit 1 BY DESIGN (like sporenkap — do not soften). Residents half ✅ SHIPPED same day (bim-ootb PR #1099): live `Duplex_geo.db` partial ship withdrawn — trimmed hashes reverted to original envelopes, geoV 4→5, sw v41→v42, W-E2E-LAYERS-RESIDENTS **8/8 vs LIVE** RED-first; the live Modeller refuses both walls loudly (`§LAYER-ENVELOPE-REFUSE` ×2, ops 196→194, hardfail 0/194). FULLY DONE**⚖ EXCEPTION RULING 2026-07-31 (user + Watchdog, supersedes the refusal end-state):** an honest whole-layer subset IS LOD400 ("legit material part of the wall… not a blocky fall back") — kept `face_count>0` per row, DROPPED count==layer_count; the two walls came BACK as 5 real slabs (bim-compiler #62: gate GREEN 0/80, W-LOD400-ENVELOPE 15/15 RED-first; bim-ootb #1102: geo v6, 196 meshes refused=0, W-E2E-LAYERS-RESIDENTS 8/8 vs LIVE). See §ROW33-EXCEPTION |
| 34 | O1/O8 | **NEXT SESSION START HERE — anchor export/save leak — the guardrail's unchecked surface (Watchdog directive):** anchors are proven invisible to render/Outliner/picks/audits, but NOTHING checked whether the 65 phantom ops leave in an EXPORT — `bonsai_ifc.js` IFC export and `sdg_save.js`/`saveModelDb` physical snapshot both fold from the op-log where `commitSeedGroup ops=3290` includes them | Watchdog 2026-07-30; guardrail spec in `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §START HERE OPEN 1 (✅ APPROVED block — "every count" includes exports) | witness: IFC export + Save snapshot with anchors present are element-identical to pre-anchor baseline (or anchors explicitly excluded + §ANCHOR-tagged in both paths); RED-first against current main | verified-open (gap confirmed unchecked by PR #1095's own witness list) |
| 31 | O15 | oblique (non-orthogonal) grids — the scale-hardening lane's one genuinely open question; a NEW feature never requested | `GRID_ROTATED_SCALE_HARDENING.md` §3 | — | ⛔ BLOCKED: user interest; do not build unasked |

### STALE-CLAIMS — verified SHIPPED on origin/main; do NOT re-open (grep-verified 2026-07-30)
- **O12 zoom-to-selection**: SHIPPED — `§ZOOM-SEL` (#711), `modeller.html:1057`, `witness_e2e_zoom_to_selection.js` exists. The triage's "small, well-specified" read was stale.
- **O8 Save = CompleteIt-shaped**: SHIPPED — `sdg_save.js` + `modeller.html:2539-2690` (auto-heal, RED block, heal-induced clarity, 'Clean, saving…'), witnesses `witness_e2e_save.js`/`witness_e2e_save_blocked_focus.js`. DocAction question ANSWERED in code: Save does NOT call `erp/ad_docfsm.js` (mirrors its Error/Clean contract only) — `sdg_save.js:8`.
- **O11 op-log autosave quota**: SHIPPED — IndexedDB fallback (`§AUTOSAVE_FIX`, `bonsai_oplog.js:25-26`, `witness_e2e_autosave_idb_fallback.js`).
- **door width/crush RED**: SHIPPED — `sdg_gate.js:99` + witness A7 (the GRAPH file's "still missing" is stale).
- **backprop first slice**: abuts-realign ORANGE flags SHIPPED (#647) — only the accept-gated APPLY remains (row 9).
- **World History wiring**: SHIPPED — mount at `modeller.html:221` + `witness_modeller_worldhist_pill.js`.
- **disc-walker envelope-bound + yaw render**: SHIPPED — envelope-bound cells + `§DW-CAP` (`disc_walker.js:644-673`), `§DW-ROT-UNIT` yaw fix (`modeller.html:4053-4058`); guide Walk-ALL section re-landed (`docs/ModellerGuide.md:493`).
- **O6 anchor semantics**: DONE (PR #613, W-ANCHOR-SWEEP 15/15). Its parked "viewer can't stream a raw modeller extraction (`elements_meta.building` missing)" note: fixed at source, bim-compiler `dcd5260e9`/`74e0e3551` (§KUL001).
- **§LODHELL-FIX-2 dead no-boolean tier**: DELETED (`extractIFCtoDB.py:1179` records the deletion).
- **O4 direct-manipulation spine + H1 top-view Z-drag + polish batch**: all shipped (PRs #423-#631 arc) — the 2026-07-07 correction in `MODELLER_DIRECT_MANIPULATION.md` already said so; re-confirmed.
- **Resident roster changed under the triage**: RESIDENTS is now EIGHT per-building split entries (SH/DX/SC/HHS/Clinic/Hospital/Garage/Terminal, each `geoDb` on object storage, `str_walker_outliner.js:51-58`) — any older "4 residents"/"mesh.db" wording in the 15 files is historical.

**O15 stale-claims (grid family, verified 2026-07-30 — grep/sqlite against origin/main, do NOT re-open):**
- **Smart element scope**: SHIPPED — `_STRUCTURAL_CLASSES`/`_localityRadius` (`bonsai_gridmove.js:64/109`) + `witness_gridmove_smart_scope.js` on main. The triage's "harvest — 10 open" was stale; the file's own §4 records DONE 2026-07-09.
- **Green/orange pre-drag preview**: SHIPPED — `toggleOverride`/`applyOverrides` in `bonsai_gridmove.js` + `witness_e2e_grid_greenorange.js`.
- **Clear-state-leak rounds 1+2**: SHIPPED — all three `onClear()` wires live in `bClear.onclick` (`modeller.html:516`) + `witness_grid_clear_leak_round2.js`. The round-2 file's "PR TBD" resolved: it landed. Its cross_edges anchor-correction fork was ALSO resolved separately — PR #650 (real per-element AABB).
- **Tilt-guard + axis-scope**: MERGED as PR #722 (squash `3252d50`) — `_hasTilt`/`tiltXRad` + the x/y/z skip are on main, `witness_grid_tilt_guard.js` shipped, `W-GRID-SCALE-YAW-HARDENING` 21/21. The file's own §6-§9 "not merged, per instruction" is stale (it predated the push-pause lift). The remote branch `fix/grid-tilt-guard` is now redundant.
- **Kinematics sandbox**: all four tiers + the §3 worker-fold gap DONE 2026-07-09 per its own §5; `witness_grid_rotation_guard.js`/kinematics witnesses on main.
- **Scale hardening**: MERGED PR #721; only its §3 (oblique grids, row 31) stays open.

Rules that produced this list (keep for the next harvest):
- **Verbatim, with its home.** Never paraphrase an open item away from its file/section pointer.
- **Verify before listing.** A file claiming something is open may be stale — check the shipped code
  first (that mistake has already been made here: a 21-commit-stale checkout made shipped code read as
  missing). Mark each row `verified-open` or `stale-claim`.
- **Contradictions are findings.** Where two files disagree, list both and say which the code supports.
- **Live-vs-local is a first-class check** for anything user-visible — see §PRIME LESSON.
- **WORK-TO-ZERO** (`CLAUDE.md`): work top-to-bottom, never stop to report "parked", never loop on a
  blocked item — mark it `⛔` with the ONE question and move to the next.

## 🚧 KNOWN TRAPS — do not rediscover these
- **`console.warn` is invisible** in DevTools' default filter. Failure paths use `console.error`.
- **A 12-triangle mesh is not proof of a fake box.** A plain extruded rectangle IS 12 triangles. But a
  fake box CANNOT carry a door/window cut — that is the real discriminator.
- **Both a fake proxy box and a plain wall's real shape are 12 triangles**, so the 2026-07-02 fake-box
  fix looked dramatic on SampleCastle and invisible on Duplex. Neither observation is a regression.
- **Guide screenshots were taken on localhost.** They are not evidence about the live site.
- **`disc_walker.dwInit` defaults to `terminal_rules.db`** — a residential caller must pass
  `duplex_rules.db` (Walker Doctrine, `CLAUDE.md`).
- **Never edit the shared `~/bim-ootb` checkout** — a PreToolUse hook blocks it. Work in a `/tmp/wt-*`
  worktree, and reuse an existing one (`git worktree list`) before creating another.
- **DB changes ship as a SQL patch + self-heal loader, never a committed binary** (`CLAUDE.md`).
