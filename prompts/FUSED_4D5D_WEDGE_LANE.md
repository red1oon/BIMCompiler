# FUSED 4D/5D WEDGE LANE — the visual editor whose every drag is a signed fact

# ⚠ DO NOT REMOVE

## ▶ LATEST (2026-07-14): §SE-7c FOUND + FIXED + MERGED — the REAL Generate/Apply hang. User corrected
the framing mid-session (TM never hangs, only Generate/Apply, "a pure SQL write of schedule") — right
call, and it led straight to it: `injectGantt()`'s T3 overlay pass ran one
`UPDATE kernel_ops WHERE output_guid=?` PER ELEMENT (up to 122,667×) against an UNINDEXED column —
O(n²) full-table-scan, measured **34,000–123,000ms**. One index (`idx_kernel_ops_guid`) → **1,273ms**
for the same work (25–100x). **PR #791 → main, CI-gated auto-merge.** §SE-7 (TM's own
`saveVisibility` matrix-clone dedupe, real but only ~13% of block time) and §SE-8 (Editor ⚙ Generate +
⤒ MS Project export) also shipped this session — **PR #789 → main, MERGED.** Remaining, smaller, not
this session's scope: ambient per-frame render cost when TM is ALREADY active while Apply fires still
compounds on top of the now-fixed O(n²) bug (§SE-7's own candidate directions still apply there).

## ▶ PRIOR (2026-07-13): §SE-5 freeze-fix + MSP-polish MERGED (bim-ootb PR #769 → main `e644b1a`, CI green). §SE-6 persistence fix MERGED (bim-ootb PR #770 → main). Neither ✎ Author nor ↗ Editor discards schedule edits anymore; both write back to the shared IndexedDB building cache, witnessed with a REAL close+reopen (not mocked). NEXT UP: fold the authored schedule into ERP `C_Project`, real-Hospital blank-authoring demo, kernel_ops signed-op mirror, resource column/baseline bars/print/export, single-pane WBS+Gantt merge.

## ★ REVIEW CARD (2026-06-23) + ▶ RESUME HERE (2026-06-23) — ARCHIVED (superseded: stale resume pointer)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** A `★ REVIEW CARD` + `▶ RESUME HERE` dated 2026-06-23 that had ended up BELOW the newer `▶ LATEST (2026-07-14)` and `▶ PRIOR (2026-07-13)` blocks above, so a linear read hit a three-week-stale "RESUME HERE" for arcs that had already shipped (PR #495–#506, sw v704→v714, all ✅ MERGED); its "NEXT (open sibling arcs)" list is carried forward verbatim by the 2026-07-13 block above. Full per-slice shipped detail: `prompts/archive/FUSED_4D5D_WEDGE_LANE_archived_2026-08-27.md`. The §SE-1..§SE-4 specs it points to, the lane charter below, and the §SE-5/§SE-6/§SE-7 chain all stay in this file.

**Scope:** Plan + build "our own 4D/5D + IFC editor that is better than the field" by going
all-in on the ONE unfair advantage no incumbent has: a single signed, immutable, replayable
op-log (`kernel_ops`) that geometry + 4D schedule + 5D cost + ERP postings all fold from.
**Strategic target (user, 2026-06-22):** pick the unfair-advantage wedge, all four axes
(IFC authoring, 4D sim, 5D/EVM, integration). **Design law (user, 2026-06-22):** edit in ONE
spot; the **front visual is dominant** (drag the bar / move the wall / drag the cost grid =
the gesture); the schedule/cost **JSON editor is a backstage power/audit tool**, never the
primary authoring path.
**Honour until DONE:** read the §-log after every run (exit code is not evidence). Spec before
code, spec before tests. Non-invent — every claim traces to a `§` log line on REAL data.

---

## §MAIN-INTENT (user, 2026-06-23 — read BEFORE §0; this anchors WHAT we build)
The editor's PRIMARY job is to **build the 4D/5D/IFC information UP, organized, FROM THE START** —
ORIGINATE and ORGANIZE the project plan, not merely edit a pre-existing one. "Organized" = the
BOM/WBS recipe (building→storey→element; project→phase→task→cost), recursive + atomic per level
(CLAUDE.md BOM PRINCIPLE). "From start" = greenfield: a user builds the schedule + cost + model up
from the model (or from nothing), each authoring action a signed `kernel_ops` op.
- ⚠ DRIFT WE CAUGHT: every surface so far operates on AUTO-GENERATED (`injectGantt` rules) or
  PRE-BAKED (Hospital 990000 seed) data. There is NO front-visual surface to *construct* the
  WBS/phases/cost from the model up. P1.b drag-to-slip edits a FIXTURE; the main intent is the
  AUTHORING of the organizing structure itself.
- So "Finish the 4D/5D front-visual" (user pick) RE-SCOPED = build the surface that AUTHORS the
  WBS/phases (organized) + ASSIGNS elements to them (the assignment IS the P2 identity-link) +
  builds the cost breakdown — drag-to-slip becomes one verb on an AUTHORED structure, not a seed.

### §MI-FLOW (user, 2026-06-23 — the canonical greenfield path to build):
1. Load the **Hospital MODEL** — real IFC elements present, but **ZERO 4D/5D metadata** (no
   `kernel_ops` schedule, no `C_ProjectPhase`, no cost). A blank 4D/5D slate ON a real model.
2. **See the default elements** in the visual editor (geometry/list visible — the raw material).
3. **Start crafting** — author the 4D/5D UP: create phases (organized WBS), assign elements to
   them (binds element GUID→phase = the P2 identity-link), give dates/cost. Each = a signed op.
- ⚠ "Blank Hospital" = the model WITHOUT the pre-baked 990000 schedule. Today loading a building
  AUTO-runs `injectGantt` (rules) → never blank. The build must support a TRUE blank start (no
  auto-schedule) so the USER originates it; auto-generate becomes an optional "suggest a start".
- New signed op types this implies (design): `PHASE_CREATE` (a WBS node) + `ELEMENT_ASSIGN`
  (guid→phase, the link) — alongside existing `ELEMENT_PLACE`/`SCHEDULE_SLIP`. All on `kernel_ops`.

## §ARCH-OWNERSHIP (user, 2026-06-23 — TM is the hub)
**Time Machine OWNS the 4D/5D. Find and Project Order are SATELLITES.**
- TM = the hub: the authoring wizard + what-if + 4D/5D playback are all TM-owned surfaces.
- Find = satellite: *pinpoints what to contract out* → hands a selection to a Project Order.
- Project Order (ERP) = satellite: *takes a stake in the TM* — its cost/dates fold FROM TM.
- ⇒ **What-if MOVES OUT of the Find box** → launched from TM (the clock pill / long-press), NOT Find.
  (navigate_find §S6 `WhatIfPanel.open()` is the OLD satellite-owns-it wiring — re-home it to TM.)
- **ZoomAcross consumer routing (nuance + RATIONALE, user 2026-06-23):** ZoomAcross calls **Find
  FIRST BY DEFAULT** — and that default is intentional: many users care about **COSTING and WHERE
  things are, NOT scheduling**; Find serves them (shows what the PO item IS + cost/location).
  **TM-as-consumer is the ADVANCED opt-in** — the scheduling-minded user deliberately opens TM
  BEFORE ZoomAcross, then TM consumes (shows the item at its moment). Mechanism = **TM-if-open,
  else Find**; but do NOT force the timeline on cost/location users — Find-first is the floor.

## §0 DOCTRINE — the wedge (read first, every session)

**The op-log IS the link.** Where Synchro/Navisworks re-match a schedule task to an element by
*name every time*, in our model the element and its schedule/cost edits are the **same signed
row**. The link is identity by construction — immutable, signed, replayable, branchable.

This single stance collapses the three documented incumbent weaknesses at once:
- kills the **#1 4D pain** (manual, re-resolving task↔element linking — cited as the most
  time-consuming, non-automatable part of 4D BIM);
- kills the **5D actual-cost gap** (line-to-line AC is named "unsolved/future work" — ours folds
  from the same log as ERP postings);
- delivers **git-for-data on a building** (diff / blame / branch) that no separate-store
  architecture can retrofit.

**The visual editor is NOT the wedge — it is table stakes.** (Synchro Pro, Bexel Manager, Bonsai
all have visual editors; Synchro's 4D visuals are arguably ahead of ours today.) The wedge is
what the visual gesture *produces*: in theirs the visual is a front-end onto a separate store;
in ours **the visual gesture and the system-of-record are the same `kernel_ops` row.** Their
visual is a *window onto* a model; ours *is* the model. The headline is therefore:
**"the only visual editor where every drag is a signed fact the whole enterprise folds from."**

### How the field actually works (verified — deep-research wf_b7165700-3cc, 20/25 claims confirmed)
| Tool | Edit/link mechanism | Structural weakness |
|---|---|---|
| Bonsai + IfcOpenShell | 3 *separate* in-memory undo systems bracketed at runtime | session-scoped, **not immutable, not signed**; close app → history gone |
| web-ifc / That Open | native-speed IFC read/write in browser | **zero history/undo/versioning** at library layer; fragment-history lossy on IFC round-trip; writes pre-alpha |
| Navisworks TimeLiner / Synchro | schedule imported from P6/MSP; task→element by **name / selection-set / layer matching** | link is a **re-resolved derived match, not stored identity**; rename → rebind/break; manual linking = most time-consuming part of 4D |
| iTWO / Vico / CostX / Bexel / COST-BIM | quantity→cost fold semi-manual; AC + %-complete **typed by hand per activity** | automated **line-to-line AC tracking named as unsolved gap** (ITcon 2024); integration is xlsx/csv/txt |
| BCF / blockchain-BIM frontier | issue metadata + GUID refs over *separately-shared* IFC; blockchain = provenance/payments/handover | **no tool fuses model edits + 4D + 5D + ERP postings into one ledger** (confirmed vs BIMSSoT, BIM Ledger, 5D-payment frameworks) |

### CLAIM WORDING (use exactly this — P0 sharpened it)
✅ Claim: **No tool fuses model edits + 4D + 5D + ERP postings into a single signed/immutable
op-log.** ❌ Do NOT claim "no CDE has an immutable log" — **Oracle Aconex genuinely does** (an
"unalterable audit trail"), so that phrasing is false. The survivable, true claim is the *fusion
across all four domains in one signed op-log*, which none of them do.

### Honest caveats
- Named commercial 5D tools (iTWO/Vico/CostX/Bexel) were **not** confirmed by vendor docs — those
  findings rest on workflow literature. Synchro's internal data model is an **open question**.
- web-ifc/fragments history is evolving and could narrow the "no history" gap over time (still not
  signed/immutable, still lossy IFC round-trip).

### P0 RESULT — CDE blind spot CLOSED ✅ (focused research, agent afe08c13a7e6, 19 sources)
Every major CDE family is **separate modules/products glued by iPaaS/API sync + IFC/BCF exchange**,
with two-store cost mirroring — NOT a unified signed store:
- **Autodesk Construction Cloud** — Cost / Model Coordination / Schedule are distinct API services;
  actuals arrive from external ERP (Sage/Vista/SAP/CMiC…) via ACC Connect (Boomi) iPaaS. No signed log.
- **Trimble Connect + ProjectSight + Vista** — three separate products over App Xchange; Vista↔
  ProjectSight job-cost sync is **explicitly periodic (every 60 min), maintained in BOTH systems**.
- **Catenda Hub** — an openBIM *exchange* hub (IFC + BCF + version history), no native 5D/cost store;
  "connect your existing tools via open API."
- **Oracle Aconex / Primavera / Procore** — Aconex (docs/correspondence) ↔ P6 (schedule) ↔ Connected
  Cost/Unifier (cost) tied by CBS→WBS mapping + API; Procore↔CMiC = budgets export / **posted actuals
  import**, two databases, BIM "does not sync into accounting…without altering the ledger."
- **Strongest counterexample (and why it fails):** Aconex's *unalterable audit trail* is a real
  immutable, legally-defensible record — but scoped to **documents/approvals/correspondence only**
  (Oracle's own Apr-2026 announcement makes no mention of model/schedule/cost/postings), and the
  postings live in a separate ERP synced by API. → **Our wedge claim survives.**

### What our code already proves (grounding, not aspiration)
- `deploy/dev/kernel_ops.js` — the signed log: `commitOp` append, `undone` flag (undo-as-data),
  `replayOps`, branch overlay, OPFS persist. Schema is invariant.
- `deploy/dev/time_machine.js:56-67` — every op row carries `output_guid` (element identity) AND
  `start_ts`/`end_ts` (schedule) on the **same row**; mesh bound by `userData.guid === output_guid`
  (`:421`, `:591`). **No name-matching step exists** → identity binding is already real.
- `viewer/whatif.js` (W-WHATIF 13/13) — schedule edits land as `SCHEDULE_SLIP` ops, ripple in blue.
- `erp/tests/earn_gw_hospital_actual.js` (W-PC-EARN 8/8) — AC emerges from atomic `PP_Order_Cost`
  rows, not a ×factor hash.
- `deploy/dev/bonsai_kernel.js` — geometry authoring as `GEOM_*` ops → mesh fold (occt-wasm).

---

## §1 PHASES (spine = P0→P1→P2; P3 = highest-value wow; P4 = headline; P5 = interop insurance)

- **P0 — Doctrine + close the CDE blind spot. ✅ DONE** (see §0 P0 RESULT). Claim survives,
  sharpened to "fusion across all four domains in one signed op-log." Do NOT claim "no CDE has an
  immutable log" (Aconex does, for documents).
- **P1 — One edit gesture, front-visual dominant.** Every direct-manipulation lands as a
  `kernel_ops` row; JSON editor demoted to a "backstage log inspector" that renders the op for the
  selected bar/wall/cell. Have: `GEOM_MOVE/ROTATE`, `SCHEDULE_SLIP`. **Gaps:** Gantt-bar *direct
  drag* → `SCHEDULE_SLIP` (today stepper-driven); cost-grid edit → a `COST_*` op (today
  `cost_panel.js` is read-only QTO). Witness: one inspector shows the op-log row for the selection.
  - **P1.a gesture math ✅ DONE** (§LOG W-GANTT-DRAG-SLIP 5/5) — drag→slip mapping proven WYSIWYG +
    dpr-safe on real Gantt geometry.
  - **P1.b live UI wiring ✅ DONE — PR red1oon/bim-ootb#495** (`lane/p1b-gantt-drag-slip` off
    origin/main; worktree `/tmp/wt-p1b-gantt-drag`). Phase bars in `viewer/whatif_panel.js` are now
    directly draggable → `WhatIf.pxToDays` → same `_slips` path as the ± steppers (kept as fine tool)
    → live blue ripple. Witness W-WHATIF-DRAG 8/8 (§LOG). sw v702→v703, whatif `?v=1→?v=2`.
    fast-checks ✅; e2e in progress; auto-merge squash armed. ⚠ sw.js is the conflict magnet + a
    concurrent session is on `feat/mfg-shopfloor-seed` — if PR goes BEHIND/DIRTY, sync (keep BOTH
    precache adds, higher CACHE_VERSION), do NOT drop the other hunk.
  - **P1.c backstage inspector** — one panel renders the op-log row for the selected bar/wall/cell.
- **P2 — Link-by-identity (kill the 4D #1 pain).** Prove schedule↔element is `output_guid`
  identity, not a name match. **Witness `W-LINK-SURVIVES-RENAME`** — see §2. *First buildable cut.*
- **P3 — Live actuals fold (kill the 5D AC gap).** Make `W-PC-EARN` *live*: an ERP posting moves
  the 5D S-curve in `time_machine.js` with no import step (both fold one log). Witness: post in ERP
  → S-curve + EVM variance shift, §-logged to the cent.
- **P4 — Git-for-data as headline demo.** Surface `replayOps`/`undone`/branch as **diff / blame /
  branch on a building**: "who moved this wall, when, what did the slip cost." Mostly a viewer over
  existing substrate.
- **P5 — IFC round-trip honesty.** Modeller authors to `kernel_ops`/our DB, **not back to IFC**.
  Add IFC *export* of the authored chain with a **fidelity gate** (do not claim full bidirectional
  IFC editing — web-ifc writes are pre-alpha). Last, scoped tight.

---

## §2 P2 SPEC — `W-LINK-SURVIVES-RENAME` (FIRST CUT)

### Issue this witness proves or disproves
> **Is our 4D schedule↔element link identity-bound (survives an element rename) or name-bound
> (breaks on rename)?** Incumbents (Navisworks/Synchro) bind task→element by matching task name to
> item name / selection set / layer — so a rename re-resolves or breaks the link. We claim ours is
> bound on the immutable `output_guid` carried by the same signed op as the schedule window, so a
> rename CANNOT break it. This test names that claim and either proves it on real data or kills it.

### Pre-flight citation
`// Implementing FUSED_4D5D_WEDGE_LANE.md §2 — Witness: W-LINK-SURVIVES-RENAME`
Grounded in `time_machine.js:56-67` (op row carries `output_guid` + `start_ts`/`end_ts`) and
`:421`/`:591` (mesh bound by `userData.guid === output_guid`). VERIFY these line refs still hold
before coding (file drifts).

### Data (REAL, non-invent)
- Real SampleHouse (or Duplex) `kernel_ops` rows from a re-extracted `*_extracted.db` — the same
  canonical DBs used by `scripts/witness_drop_facing.js`. NO synthetic ops.
- Pick a real element with a 4D window: an op with `output_guid = G`, `start_ts = S`, `end_ts = E`.
- A display label for that element (`elements_meta.ifc_class` / name) — the thing a name-matcher
  would key on.

### Procedure (whitebox §-log, per `feedback_whitebox_deduce_not_browser`)
1. **Baseline bind.** Load ops; pick cursor `T` with `S ≤ T < E`. Assert element `G` is in the
   *frontier* set at `T` (`renderAtTime`/`_frontierAt` logic). `§LINK-BASELINE guid=G frontier@T=1`.
2. **Rename.** Change `G`'s display label (`elements_meta.ifc_class` / name) to a new string.
   **Do NOT touch `output_guid`.** `§LINK-RENAME old=<x> new=<y> guid-unchanged=G`.
3. **Re-fold (ours).** Recompute frontier at `T`. **Assert `G` still frontier** → identity binding
   held. `§LINK-OURS guid=G frontier@T=1 PASS`.
4. **Simulate incumbent (control arm in the same test).** Build a name-keyed task map
   `{ name → window }` from the *pre-rename* labels; after the rename, look up `G`'s window by its
   *new* name. **Assert the lookup MISSES** (binding broken) → reproduces the documented failure.
   `§LINK-NAMEMATCH lookup(new-name)=MISS broken=1`.
5. **Contrast line.** `§LINK-VERDICT ours=HELD namematch=BROKEN` — the one line that proves the
   wedge on real data.

### Pass criteria (binary; names the issue)
- Ours: rename → frontier binding at `T` **unchanged** (GUID identity held).
- Control: name-match lookup after rename **misses** (reproduces incumbent breakage).
- Both arms run on the **same real element**, in one test, so the contrast is apples-to-apples.
- If ours ever breaks on rename → the wedge claim is FALSE; stop and fix the binding, not the test.

### File
`scripts/witness_link_survives_rename.js` (JS, real DB via sql.js — mirrors
`scripts/witness_drop_facing.js` harness). Run, save log, read the §-lines before concluding.

### Out of scope for P2 (do NOT build here)
- Gantt-bar drag UI (that is P1), cost ops (P1), live ERP posting (P3), IFC export (P5).
- No browser/Playwright run — §-log is the proof.

---

## §SCHEDULE-EDITOR — the MSP-grade Gantt arc (STRATEGY, user direction 2026-06-23)
The user wants to know if the schedule editor can become "powerful like MS Project" (expand items,
create dependencies, allow/forbid parallel tasks). Verdict from the discussion below: **yes, and we
already own the hard half** — the IFC scheduling DATA MODEL is extracted and in our tables; the gap
is UI + a bounded compute. Capture of the whole discussion so a new session resumes with full context.

### §SE-A — the 5-step path (each step its own "wow", all on data we ALREADY extract)
1. **Expandable WBS outline** — render `tasks.wbs_parent` + `is_summary` as a collapsible tree. DATA
   READY; pure UI.
2. **Show + edit dependencies** — draw `task_sequences(predecessor_id, successor_id, sequence_type,
   lag_days)` (real `IfcRelSequence`, FS/SS/FF/SF + lag) as links; let the user add/retype/lag one.
   DATA READY (we extract it; nothing reads/edits it yet — the what-if ripple is currently LINEAR
   by SeqNo, NOT the real graph).
3. **Bounded CPM forward-pass** — replace the linear assumption with a forward/backward pass over the
   real dependency DAG → early/late dates, then float. A few hundred lines of JS over a DAG; NOT
   research (Bonsai/IfcOpenShell prove it's tractable on exactly our IFC data). Schema already has
   `early_start/late_start/free_float/total_float/is_critical` (extracted verbatim today).
4. **Critical-path highlight** — compute + show `is_critical`/float. Falls out of step 3.
5. **Interactive Gantt** — drag bars, drag-to-link, indent/outdent (the MS-Project feel). UI
   engineering; we already shipped the hardest gesture (P1.b drag-to-slip).

### §SE-B — Bonsai mapping + the RABBIT-HOLE boundary (verified via web search 2026-06-23)
Bonsai/IfcOpenShell ALREADY has **1,2,3,4** ("create construction schedules, perform critical path
analysis, generate sequence animations" — extensions.blender.org/add-ons/bonsai; IfcOpenShell API has
critical-path analysis). Bonsai LACKS **5** — its Gantt is a generated *visualization/animation*; you
edit via Blender property-panels, not on the chart. ⇒ The differentiator is NOT reinventing CPM (open-
source proves it tractable) — it is **#5 (a real interactive web editor) on our SIGNED op-log + ERP
fold**, which neither Bonsai (session-based, not signed) nor MS Project (no model/cost/ERP) has.
**RABBIT HOLE = everything PAST 5: resource leveling + schedule OPTIMIZATION** (auto-reschedule to
resolve resource over-allocation, auto-crash CP). Resource-constrained scheduling is NP-hard; it's
where MSP/Primavera sink decades; it is NOT the wedge. The line: deterministic forward-pass (compute
from a graph the USER authored) = bounded, DO IT. Auto-optimize/level (machine rearranges the plan) =
REFUSE. **Target 5, stop at 5.** (Matches the lane's standing `TRAP=don't build CPM/leveling` caution.)

### §SE-C — TWO-SURFACE architecture (user's "new tab" idea — ENDORSED)
- **TM / what-if** stays the present **intuitive front-visual** (drag a bar → blue ripple). Light, the
  showpiece. Do NOT bloat it with the serious editor.
- **MSP-grade Gantt editor = a SEPARATE SURFACE (new tab/window)** — WBS + dependencies + CPM, where
  you want screen real estate + focus. This honors the **Design law** (front visual dominant; the
  power tool is separate/backstage).

### §SE-D — REALTIME cross-tab broadcast (user's idea — feasible, rails EXIST)
We already have the bus: the **Connect Scene broker** over the ONE signed op-log (P0–P3 shipped:
one-log-two-folds, live cross-surface re-fold, witnessed; see [[project_connect_scene]]). Mechanism:
an edit in the **Gantt tab** → a **signed op** → `BroadcastChannel` (same-origin tabs) → the **Viewer
TM tab, IF open**, re-folds the affected phases LIVE. One-way (edit→watch) is the clean MVP; because
both are folds of the same log, bidirectional comes for free later. (Connect uses postMessage for
iframes; cross-TAB transport = `BroadcastChannel`/storage events.)

### §SE-E — "Gantt ↔ actual-geometry tagging — has anyone done it?" (user Q 2026-06-23)
YES — that IS 4D BIM (Synchro Pro, Navisworks TimeLiner, Bexel, Bonsai via `IfcRelAssignsToProcess`
all tag tasks→geometry). BUT in every one the link is a **re-resolved derived match (by name/selection-
set/layer)** → rename rebinds/breaks; manual re-linking is the cited **#1 4D pain** (deep-research
wf_b7165700-3cc). **OUR wedge: the tag is a SIGNED `task_elements` row (guid identity), rename-proof**
(W-LINK-SURVIVES-RENAME 8/8) — and it's LIVE today (wizard: click element→3D light; reassign→5D cost
moves; TM plays each element at its task moment). The correlation is old hat; doing it as a **signed,
rename-proof fact on one log the model+4D+5D+ERP fold from** is what nobody has. A drag-to-link Gantt
(#5) where every link is that signed tag, broadcasting live into the 4D viewer, is the genuinely new thing.

### §SE-NEXT — recommended first slice
**Step 1+2** (expandable WBS outline + view/edit dependencies from `task_sequences`) — low-risk, all
data exists, visibly "wow", and it de-risks the new-tab Gantt before any CPM. Spec it, then build.

### §SE-1 SPEC — step 1+2 = WBS outline + view/EDIT dependencies, on a NEW TAB (user dir 2026-06-23)
User chose: **new tab + view AND edit deps** (the bigger of the offered scopes). Spec-First.

**Issue this slice proves/disproves**
> Can a user, on a SEPARATE surface (new tab — §SE-C), see the schedule's WBS as a collapsible
> outline AND author its dependencies (add / retype FS·SS·FF·SF / set lag / remove a link) — with the
> graph written to the IFC-native `task_sequences` table (the source of truth, exactly how
> `assignElement` writes `task_elements`), and an invalid CYCLE refused deterministically (data
> integrity, NOT optimisation — §SE-B boundary)?

**Engine (pure, DOM-free, node-testable — added to `viewer/schedule_author.js`)**
- `wbsTree(db, scheduleId)` — fold `tasks.wbs_parent`/`is_summary` into a nested tree (roots = rows
  whose `wbs_parent` is null/absent from the id set). Each node: `{id,name,isSummary,start,finish,
  guidCount,children[]}`. Pure read; the collapsible UI renders this. DATA READY.
- `listDependencies(db, scheduleId)` — read `task_sequences` (pred→succ, type, lag) joined to task
  names, scoped to the schedule via `predecessor_id`'s `tasks.schedule_id`. Returns
  `[{predId,predName,succId,succName,type,lag}]`.
- `addDependency(db, predId, succId, type, lag)` — INSERT one IfcRelSequence edge. Refuses: self-loop;
  unknown task id; and any edge that would create a **cycle** (`wouldCycle` DFS from `succ` reaching
  `pred`). `type` ∈ {FS,SS,FF,SF} (default FS), `lag` days (default 0). Returns `{ok, reason}`.
- `removeDependency(db, predId, succId)` / `updateDependency(db, predId, succId, {type?, lag?})` — the
  retype + lag verbs. All four mutate `task_sequences` DIRECTLY (kernel_ops signing still DEFERRED,
  consistent with `assignElement`; the §SE-D signed-broadcast is a later slice).

**Source-of-truth note (NON-DRIFT):** `task_sequences` IS the 4D dependency truth (per
import_db_builder DDL). The "signed op-log" framing from the scope question is the §SE-D follow-up;
this slice matches the shipped engine — direct table writes, witnessed by §-log.

**UI (the new surface — `viewer/schedule_editor.html` + `viewer/schedule_editor_ui.js`)**
- Standalone page; resolves a building DB the same way `config.js` does (`?db=` param → OCI base →
  `buildings/Duplex_extracted.db`), loads it via sql.js, picks `activeSchedule(db)` (or materialises a
  default if blank), renders: LEFT = collapsible WBS outline (▸/▾ expand, indent by depth, element
  count per leaf); RIGHT = dependency list with add (pred▸succ + type + lag), retype, lag-edit, delete.
- Cycle-refusal surfaces as an inline error (no silent drop). Each successful edit posts on the
  ALREADY-LIVE `BroadcastChannel('bim_4d')` (main.js S240 listens) a `{type:'4D_SCHED_EDIT', ...}`
  message — the §SE-D rail riding an existing rail (an open viewer clears stale 4D highlights on it;
  a later slice teaches it to re-fold). One-way edit→watch MVP.

**Witness — `erp/tests/schedule_editor_witness.js` = `W-SCHED-EDIT` (node, REAL SampleHouse)**
Whitebox §-log only (CLAUDE.md: prove the engine, don't boot a browser). On real
`SampleHouse_extracted.db`: materialise default → `wbsTree` shape (1 summary root, N leaves nested) →
`addDependency` an FS chain across the phase leaves → `listDependencies` returns the chain with names →
`wouldCycle`/`addDependency` REFUSES a back-edge (last→first) → `updateDependency` retypes SS + sets
lag → `removeDependency` drops one and the count falls. Each assertion names its issue.

### §SE-2 SPEC — step 3 = bounded CPM forward/backward pass (the deterministic compute, NOT leveling)
With the dependency DAG now authored (§SE-1), replace the LINEAR-by-SeqNo assumption with a real
**critical-path forward/backward pass**. This is the §SE-B "DO IT" half — a deterministic compute over
a graph the USER authored. It STOPS before resource leveling / auto-optimisation (the NP-hard refuse).

**Issue this slice proves/disproves**
> Given leaf tasks with durations + an authored `task_sequences` DAG, can the engine compute, by exact
> CPM, each task's early/late dates, total + free float, and `is_critical` — honouring all four
> sequence types (FS/SS/FF/SF) and lag — and write them to the columns the schema already carries
> (`early_start/early_finish/late_start/late_finish/free_float/total_float/is_critical`), so the editor
> can highlight the critical path? (Today nothing computes CPM; the what-if ripple is linear.)

**Engine — `computeCpm(db, scheduleId, opts)` in `viewer/schedule_author.js` (pure, node-testable)**
- INPUT: leaf tasks (`is_summary=0`) with duration = parse(`schedule_duration` `P{n}D`/`P{n}W`) else
  `(schedule_finish − schedule_start)` days else 1; edges from `task_sequences` among those tasks.
- TOPO sort (Kahn). The §SE-1 cycle guard already forbids cycles → a clean DAG (bail + log if not).
- FORWARD pass → ES/EF (day offsets, ES of a no-predecessor task = 0). Per edge the candidate succ ES:
  FS `pred.EF+lag` · SS `pred.ES+lag` · FF `pred.EF+lag−succ.dur` · SF `pred.ES+lag−succ.dur`;
  `succ.ES = max(0, max candidates)`, `EF = ES+dur`.
- BACKWARD pass → LS/LF (project finish PF = max EF; no-successor task LF = PF). Per edge candidate
  pred LF mirrors the forward formula; `pred.LF = min candidates`, `LS = LF−dur`.
- `total_float = LS−ES`; `is_critical = total_float ≤ 0`. `free_float` = min over successor edges of
  `(succ.ES − thisPredContribution)`, clamped ≥0 (slip without delaying any successor's ES).
- WRITE-BACK: `early_*`/`late_*` as ISO dates off a project-start (`opts.start` || min existing
  `schedule_start` || `2026-01-01`); `free_float`/`total_float` as day counts (TEXT cols); `is_critical`
  0/1. Leaves `schedule_start/finish` (the baseline) UNTOUCHED. Returns
  `{projectDuration, tasks:[{id,es,ef,ls,lf,totalFloat,freeFloat,critical}], criticalIds[]}`.

**UI follow-on (`schedule_editor_ui.js`)**: a "Compute CPM" action → run `computeCpm`, then mark
critical leaves in the WBS outline (red rail) + show each leaf's total float; the dependency rows on a
critical link render bold. No drag yet (that is step 5).

**Witness — `erp/tests/schedule_cpm_witness.js` = `W-SCHED-CPM` (node)**
TWO graphs, §-log only: (1) a HAND-COMPUTED diamond `A→B,A→C,B→D,C→D` with known durations + a lag +
one non-FS edge → assert EXACT ES/EF/LS/LF/float/critical against the by-hand numbers (the proof the
maths is right, not just runs). (2) REAL SampleHouse: materialise default → author an FS chain → run
CPM → assert the whole chain is critical (linear ⇒ zero float) and `projectDuration = Σ durations`.

### §SE-3 SPEC — step 5 = the INTERACTIVE drag-Gantt (the MS-Project feel; THE wedge surface)
The differentiator (§SE-B): Bonsai/IfcOpenShell have steps 1–4 but their Gantt is a generated
*visualisation* you edit via property panels — they LACK #5. A real **drag-on-the-chart** web editor on
our signed log + ERP fold is the genuinely new thing. RABBIT-HOLE GUARD unchanged: drag = the user
moving a bar they authored (deterministic); NO auto-reschedule/leveling.

**Issue this slice proves/disproves**
> Can a user drag a task BAR on a time-axis to RESCHEDULE it (duration preserved, snapped to whole
> days), with the move written to `schedule_start/finish` as a signed edit — and drag from one bar to
> another to LINK them (= `addDependency`, cycle-guarded) — the chart re-rendering with the critical
> path coloured? (Today the editor lists WBS + deps + CPM but draws no bars; nothing is draggable.)

**Engine — `moveTask(db, taskId, newStart)` in `viewer/schedule_author.js` (pure, node-testable)**
- Reschedule one leaf: `schedule_start = newStart`, `schedule_finish = newStart + duration` (duration
  PRESERVED, parsed from `schedule_duration` else old finish−start). Returns `{ok, start, finish, days}`.
  Refuses unknown/summary task. The ONLY new verb; drag-to-link REUSES the shipped `addDependency`
  (cycle guard intact). (CPM invalidation on a move stays the UI's `refreshFold` concern, as for deps.)

**Surface — Gantt strip in `schedule_editor.html` + `schedule_editor_ui.js`**
- A full-width **timeline** below the WBS/Deps panes: one row per leaf, a bar from `schedule_start` to
  `schedule_finish` on a shared day-axis (pxPerDay = width/Σspan); month/week ticks; critical bars red
  (post-CPM), else blue; the bar label = task name.
- **Drag-to-reschedule:** mousedown on a bar → track dx → on release `deltaDays = round(dx/pxPerDay)`,
  `moveTask(start+deltaDays)` → re-render + `refreshFold` (invalidate stale CPM) + broadcast
  `4D_SCHED_EDIT{op:'move'}`. Day-snapped, duration-locked.
- **Drag-to-link:** drag from a bar's right handle onto another bar → `addDependency(FS)` (inline cycle
  refusal). Bounded extra; if the gesture risks scope, ship reschedule first + note link as the micro
  follow-up.

**Witness — `erp/tests/schedule_move_witness.js` = `W-SCHED-MOVE` (node) + §SE-GANTT-SMOKE (headless)**
W-SCHED-MOVE: real SampleHouse default → `moveTask` a phase +7 days → assert start/finish both shifted
+7, duration UNCHANGED, summary/unknown refused. §SE-GANTT-SMOKE: bars render (≥3), simulate a
mouse-drag on a bar → its `schedule_start` advanced by the dragged days, chart re-rendered; drag-to-link
creates a dep (and a cycle-making drag is refused inline).

### §SE-4 SPEC — the §SE-D payoff: LIVE cross-tab re-fold ("both are folds of ONE log")
Steps 1–5 shipped. The §SE-D promise: an edit in the editor tab propagates LIVE to any other open
surface. Architectural truth: each tab has its OWN in-memory sql.js db (no shared store). So the clean
mechanism is **REPLAY THE OP on the receiver's db via the SAME ScheduleAuthor verb** — the broadcast IS
the signed op, re-folded on the receiver. One-way edit→watch MVP; bidirectional comes for free (both are
symmetric folds). RABBIT-HOLE guard unchanged (no leveling).

**Issue this slice proves/disproves**
> Does broadcasting each editor op (`move`/`add`/`remove`/`retype`/`lag`/`cpm`) on `BroadcastChannel
> ('bim_4d')` and REPLAYING it on a second surface's db (via `moveTask`/`addDependency`/… — the exact
> verbs the sender used) make the two surfaces CONVERGE to identical schedule state — so a drag in
> editor-tab-A is mirrored live in tab-B (and, when wired, the Viewer's 4D Time Machine)?

**Module — `viewer/schedule_sync.js` (pure replay core, node-testable + browser bus)**
- `applyOp(db, op)` — PURE: dispatch one op to the matching ScheduleAuthor verb (`move`→moveTask,
  `add`→addDependency, `remove`→removeDependency, `retype`/`lag`→updateDependency, `cpm`→computeCpm).
  Returns the verb's result. THIS is the witnessed core — replay = convergence.
- `create({tabId?})` → `{tabId, emit(op), listen(db,onApplied), close()}` over `BroadcastChannel('bim_4d')`
  with `type:'4D_SCHED_EDIT'`. `emit` tags `from:tabId`; `listen` IGNORES own ops (echo guard) and
  replays inbound ops on `db`, then calls `onApplied(op,result)` for the surface to re-render.

**Wiring**
- Editor (`schedule_editor_ui.js`): route the existing `broadcast()` through `sync.emit`; add
  `sync.listen(db, onApplied)` so a SECOND editor tab re-folds live (graph op → refreshFold; `cpm` op →
  adopt the synced critical set). Same surface, real cross-tab proof.
- Viewer (`viewer.html` + a small listener): load `schedule_sync.js`; `sync.listen(APP.db, …)` replays
  inbound ops on the viewer's db and, if Time Machine is open, RE-FOLDS via the SHIPPED
  `toggleTimeMachine()` off→on (same path the authoring wizard's "Apply to 4D" uses). Safe-additive:
  an op whose task isn't in the viewer db is a no-op (graceful), never throws.

**Witness — `erp/tests/schedule_sync_witness.js` = `W-SCHED-SYNC` (node) + §SE-SYNC-SMOKE (2-tab headless)**
W-SCHED-SYNC: TWO dbs from the SAME SampleHouse default; replay each op (move/add/remove/retype/lag) from
sender→receiver via `applyOp` → assert the receiver CONVERGES to the sender's exact rows; `cpm` replays to
the same critical set; echo-guard drops own ops; unknown op → `{ok:false}`. §SE-SYNC-SMOKE: open the editor
in TWO headless tabs on the same building → drag a bar in tab-A → tab-B's matching bar/`schedule_start`
updates live (BroadcastChannel across tabs).

---

## §SE-5 — Freeze fix + MS-Project-grade polish (user direction 2026-07-13)
User compared the two 4D surfaces (✎ Author wizard vs ↗ Editor tab), picked the **Editor as the surface to
invest in** (more organized: WBS+deps+CPM+Gantt vs Author's lighter first-draft wizard), reported the
generate/materialize path "crashes the browser", and asked for (a) a fix so Generate never holds the tab,
(b) a more MS-Project-like professional design for the Editor. Diagnosed BEFORE this section (this session):
reproduced via headless Chromium against real building DBs (Duplex/Hospital/LTU_AHouse) — no memory blowup,
no infinite loop; the real cause is `materializeDefault` (`viewer/schedule_author.js`) running one INSERT/
DELETE statement per element with NO explicit SQL transaction — sql.js pays per-statement commit overhead
per call. Measured in-page (`performance.now()` around the real engine call, not a guess):
`materializeDefault` alone = **4.0s on Hospital (63,415 els)**, **7.2s on LTU_AHouse (122,667 els)**; the
full button click (incl. `foldCost`+render) = **4.3s / 10.4s** of unbroken main-thread block — long enough
for Chrome's own "Page Unresponsive" prompt, and exactly what a user would describe as a crash, especially
if they click Regenerate again mid-freeze (queues a second block on top). Same unwrapped function is called
by the Editor's own auto-seed-on-blank path (`schedule_editor_ui.js:421-426`), so it inherits the freeze too.

### §SE-5a SPEC — wrap the bulk writes in one transaction (the actual fix)
**Issue this proves/disproves:** does wrapping `materializeDefault`'s idempotent-rebuild delete loop +
per-element insert loop in a single `BEGIN`/`COMMIT` eliminate the multi-second main-thread block on a
real large building, with byte-identical output to the unwrapped version?
- Engine: `viewer/schedule_author.js` `materializeDefault` — add `db.run('BEGIN TRANSACTION')` right after
  the idempotent-delete block, `db.run('COMMIT')` right before the `return`. No logic change — same rows,
  same order, same `§AUTHOR_MATERIALIZE` log line. Standard SQLite bulk-write practice (sql.js pays
  transaction/journal overhead per implicit statement-commit; batching amortizes it — this is *why* 63k
  single-row inserts took seconds instead of the tens-of-ms SQLite bulk inserts are known for).
- Also fixes `scheduleContiguous`'s per-task UPDATE loop (§MI-FLOW "Schedule now") and `foldCost`'s query
  path stays read-only (no write cost there — leave as is).
- **Witness (this session, real DBs, `performance.now()` before/after, headless Chromium) — DONE, PASS:**
  re-ran the exact in-page timing probe used to diagnose this, pre/post the transaction wrap:
  `materializeDefault` Hospital 63,415 els **4040ms → 467ms** (8.6x); LTU_AHouse 122,667 els
  **7174ms → 1131ms** (6.3x); full click-equivalent (materialize+foldCost) LTU_AHouse **10.4s → ~1.7s**.
  Assignment/phase counts UNCHANGED (63,415/6 and 122,667/6 both runs) = no data-correctness regression.
  Re-running `materializeDefault` a 2nd time (the idempotent-rebuild/"Regenerate" path, which now also
  runs its delete-loop under the same transaction) showed NO further slowdown (601ms, same order as the
  1st run) — ruling out unbounded DB-bloat-from-repeated-regenerate as a compounding risk.
  **Honest correction to the pre-implementation estimate above:** actual post-fix times are ~500ms-1.1s
  on the two largest local buildings, not "<200ms" — still a decisive fix (crossed from "trips Chrome's
  Page-Unresponsive prompt" to "sub-2s, no freeze risk"), just not as dramatic as a bare SQLite-transaction
  napkin estimate suggested; the remaining cost is per-element JS work (`matchRule`'s O(rules) substring
  scan × elements, plus WASM/JS marshalling), not transaction overhead — a smaller, separate optimization
  if ever needed, out of scope for this fix.
- **Also added (this session, not in the original spec, cheap + real UX win):** the Editor's own
  auto-seed-on-blank-load path (`schedule_editor_ui.js init()`) now paints a "Materializing default
  schedule… please wait" status BEFORE running the heavy call (a `setTimeout` yield lets the status text
  render first) — so even the residual ~1-2s on a huge building visibly acknowledges the load instead of
  looking frozen, and a user can't stack up repeat clicks against an apparently-dead tab.
- Non-invent: this is the standard, well-known SQLite fix for "many small writes are slow" — not a novel
  algorithm, not a guess.

### §SE-5b SPEC — MS-Project-style Editor polish (first slice, scoped)
Full MSP parity is out of scope for one slice (per §SE-B rabbit-hole discipline — polish, not leveling).
First slice picks the highest-visible-value, lowest-risk affordances, all on data the schema ALREADY
carries (no invented columns):
1. **Indent/Outdent** — WBS rows get ⇥/⇤ buttons that reparent a task (`wbs_parent`) up/down one level.
   New engine verb `reparentTask(db, taskId, newParentId)` (validates: not self, not a cycle in the WBS
   tree, target exists or null=root) in `schedule_author.js`, wired the same signed-op way as `addTask`/
   `breakdownByAttribute` (broadcasts `{op:'reparent', taskId, wbsParent}` on the existing §SE-D rail).
2. **Gantt zoom** — Day/Week/Month scale toggle (changes `pxPerDay`/tick granularity in `renderGantt`;
   pure UI, no engine change — the existing day-axis math already parameterizes on `stepDays`).
3. **Today marker** — a vertical line on the Gantt at the current date (if inside the project span);
   pure UI/CSS, no engine change.
4. **Milestone diamonds** — a task with `schedule_start === schedule_finish` (0-day duration) renders as
   a ◆ marker instead of a bar; pure UI branch in `renderGantt`, no engine/schema change (0-day tasks
   already possible via `moveTask`/manual dates).
5. **Toolbar/chrome polish** — group existing buttons into a ribbon-style header (View: zoom controls ·
   Edit: add/indent/outdent/import · Compute: CPM), consistent icon sizing, row striping + sticky
   WBS/Gantt row alignment (visual only, `schedule_editor.html` CSS + minor DOM restructuring).
- Out of scope this slice (next, lower priority, no user fact needed): resource histogram/leveling view
  (§SE-B rabbit-hole — refuse leveling, a READ-ONLY resource column is fine later), baseline-vs-actual
  comparison bars, print/export, single-pane WBS+Gantt merge (MSP's actual split-view — bigger
  rearchitecture, flag as the natural NEXT slice once this one is live).
- Witness: headless Chromium smoke on real SampleHouse — indent/outdent changes `wbs_parent` + WBS
  re-nests correctly + cycle refused; zoom toggle changes rendered tick count/spacing; today-line present
  when today falls in span; a 0-day task renders `.g-milestone` not `.g-bar`.

**§SE-5b IMPLEMENTED + WITNESSED (this session).** New engine verb `reparentTask(db, scheduleId, taskId,
newParentId)` in `schedule_author.js` (self/cycle/unknown-task/unknown-parent guards, DFS ancestor-walk
cycle check mirroring `wouldCycle`'s style) + `reparent` case added to `schedule_sync.js applyOp` (so
indent/outdent converges cross-tab like every other edit). UI: `schedule_editor_ui.js` renders ⇤/⇥
buttons per WBS row (`_findNode`/`_siblingsAndIndex` locate a node + its ordered siblings from the
already-fetched `wbsTree`), wired to `doIndent`/`doOutdent`; Gantt `renderGantt` gained zoom-aware tick
density (`_zoom` day/week/month via `ZOOM_MIN_STEP`, `setZoom()`), a today-line (`.g-today-line`, drawn
when "now" falls inside the rendered span), and milestone-diamond rendering (`.g-milestone` for any
`start===finish` leaf, in place of a bar). `schedule_editor.html` restructured into a grouped ribbon
toolbar (Import / Compute / Zoom clusters) + row striping + moved the lone CPM button out of the
Dependencies pane into the ribbon (was duplicated, now singular).
- **W-SCHED-REPARENT 11/11** (node, real SampleHouse, whitebox §-log): materialize → indent (reparent
  onto a real sibling) → wbs_parent updated correctly → outdent back to root → re-nest → cycle attempt
  (parent onto its own child) REFUSED + tree left unchanged → self-parent refused → unknown task/parent
  refused → outdent-to-root (null parent) works.
- **Headless Chromium smoke (real Duplex_extracted.db, this session), 10/10 checks green:** "please wait"
  status paints before the heavy call resolves; editor loads+seeds with no crash/page-error; total
  load+seed time <8s; WBS rows + indent/outdent buttons render; a live indent click fires `§SE_REPARENT`
  and re-renders; all 3 zoom buttons present, clicking one applies `.active` + emits `§SE_ZOOM`; Gantt
  renders non-empty. Today-line correctly ABSENT for this schedule's span (Jan-Jun 2026, ends before the
  session's "now") — asserted as the correct negative, not a false claim of presence.
- **Full Editor-tab end-to-end on the largest local building** (LTU_AHouse, 122,667 elements): open →
  fetch+parse the 71MB DB → auto-seed the default schedule → WBS/Gantt rendered, **total elapsed 2.0s**,
  no crash, no page error — down from the original bug's projected 10s+ freeze on this same building.
- All new/changed files syntax-checked (`node -c`); `sw.js` `CACHE_VERSION` bumped v746→v747 and the 3
  changed script tags in `schedule_editor.html` version-bumped (author v8→v9, sync v2→v3, editor_ui
  v6→v7) so a real deployed tab actually picks up the fix instead of serving a stale SW-cached copy.
- **Work done in `/tmp/wt-schedule-editor-mspro` (branch `fix/schedule-editor-mspro`, off fresh
  origin/main)** per the shared-tree worktree hook + hygiene rule — `~/bim-ootb` itself untouched.
  **MERGED same session** (user explicit go-ahead) — bim-ootb PR #769 → main `e644b1a`, CI green
  (fast-checks + e2e-tests both pass). Worktree pruned after clean push.
- **Next (open, lower priority, no user fact needed):** resource column (read-only), baseline-vs-actual
  bars, print/export, the single-pane WBS+Gantt merge (MSP's real split-view — bigger rearchitecture).

## §SE-6 — persist authored schedule edits (user, 2026-07-13: "discarding edits... is no accomplishment")
**Issue this proves/disproves:** does an authored/edited schedule (phases, dependencies, dates, WBS
reparenting) survive a REAL tab close + reopen, from EITHER surface?
- **Root cause (verified by reading kernel_ops.js, not assumed):** `_persistToIdb(db)` — the ONLY
  existing IDB-persistence path for the building db — fires exclusively from `commitOp()` (a signed
  kernel_ops row). Schedule-table writes (`materializeDefault`/`assignElement`/`addDependency`/
  `moveTask`/`reparentTask`/…) never call `commitOp` (kernel_ops mirroring is explicitly deferred, per
  this file's own §AUTHOR-1 header) — so NEITHER surface persisted anything, including ✎ Author even
  though it edits `APP.db` directly inside the main viewer tab.
- **Fix:** one shared `ScheduleAuthor.persistDb(db, url, opts)` (debounced 1.2s, or `{immediate:true}`)
  in `schedule_author.js` — ONE implementation, not two divergent per-UI copies. Writes `db.export()`
  back to the exact IndexedDB slot (`bim_ootb_cache`/`dbs`, keyed by the building URL) that
  `cachedFetch`/`_idbGetDb` already read from, so a reopened tab (Editor OR a fresh viewer load) picks
  up the edited bytes automatically — no new read-path needed.
  - Editor (`schedule_editor_ui.js`): hooked into `refreshFold()` + `onComputeCpm()` (the two mutation
    choke points essentially every edit already funnels through) + the initial auto-seed + P6 import +
    a `visibilitychange`-triggered immediate flush (safety net alongside the debounce).
  - Author (`schedule_author_ui.js`): hooked into `render()`'s end (the wizard's own single choke
    point — generateDraft/reassign/renamePhase/duration-steppers/scheduleNow ALL call render()) + an
    immediate flush in `applyTo4D()` (a deliberate "commit" action) + the same `visibilitychange` flush.
- **Second bug FOUND AND FIXED while proving this (not assumed, caught by the first witness run
  failing):** the ↗ Editor tab never loads `scene.js`, so it has no `APP.openCacheDB()`. The naive
  fallback — a bare unversioned `indexedDB.open('bim_ootb_cache')` — silently creates a STORE-LESS
  database if the Editor is the FIRST surface to ever touch that IDB in a fresh profile (worse than
  the landmine `kernel_ops.js`'s own comment already documents: at least that one just skipped a
  mismatched version; this one creates a permanently broken v1 db with zero object stores). New
  `ScheduleAuthor.openBuildingCache()` self-heals: version-opens at 2 with the SAME `onupgradeneeded`
  schema as scene.js `A.openCacheDB` (`dbs` + `timestamps` stores) — usable from ANY surface, whichever
  one runs first now creates a schema fully compatible with the other. `_idbGetDb` (the Editor's read
  path) was routed through the same opener for consistency.
- **Witness — REAL close+reopen, Playwright `launchPersistentContext` (NOT a mocked IndexedDB) —
  DONE, PASS:**
  - **Editor 7/7:** page A seeds Duplex, indents a task (a real edit, not just the pristine default),
    `§SCHED_PERSIST` fires within the debounce window, page A closes. Page B (fresh page, same
    profile) opens the SAME url → `§SE_DB_CACHE_HIT` (no re-download) → finds the EXISTING schedule
    (no `§AUTHOR_MATERIALIZE` re-seed) → the specific indent survives (WBS row renders at the nested
    depth, not root).
  - **Author-in-viewer 5/5:** page A opens the viewer, opens ✎ Author, Generate first draft, `§SCHED_
    PERSIST` fires. Page A closes. Page B — a FRESH viewer load, same url — `§CACHE_HIT` (not a fresh
    fetch) and `ScheduleAuthor.activeSchedule(APP.db)` immediately finds `SCH_AUTHORED` with 6 tasks
    (survived the reload it would previously NOT have survived).
  - **All prior regressions re-run green** on the same build: W-SCHED-REPARENT 11/11, MSP-polish
    headless smoke 10/10, LTU_AHouse (122,667 elements) end-to-end 1.58s total, no crash.
- Work done in `/tmp/wt-schedule-persist` (branch `fix/schedule-persist`, off fresh origin/main).

## §SE-7 — Generate/Apply/TM STILL hangs after §SE-5+§SE-6 (user report 2026-07-14; root-caused, not yet fixed)
**Issue this proves/disproves:** §SE-5 claimed the freeze was fixed (materializeDefault SQL-write
transaction wrap, merged PR #769) and §SE-6 shipped persistence (PR #770) — both confirmed MERGED on
`main` (bim-ootb HEAD `3f7386d`, 2026-07-14). User reports the tab still hangs on Generate/Apply and on
Time Machine itself. Is this a regression, a stale-deploy issue, or a DIFFERENT bug §SE-5 never touched?

**Method (per `feedback_diagnose_in_session_fix_in_other_session`'s companion technique — instrument the
REAL code path, don't theorize):** headless Playwright against the real localhost server (bim-ootb repo
root, `python3 -m http.server 8080`), driving the ACTUAL buttons (`toggleTimeMachine()`,
`#sa-draft`/`#sa-apply` clicks) on the real `LTU_AHouse_extracted.db` (122,667 elements, the largest
local building). A "heartbeat prober" — a tight loop of trivial `page.evaluate(() => 1)` CDP calls
running concurrently — measures ACTUAL main-thread block duration: if the renderer's JS thread is busy,
the evaluate() round-trip queues behind it, so its latency IS the block time (the same mechanism behind
Chrome's real "Page Unresponsive" prompt). Scripts: `/tmp/claude-.../scratchpad/repro_hang2.js` (this
session's scratchpad, not repo-committed — reproducible from the description above if needed again).

**Finding — §SE-5's fix is NOT regressed** (materializeDefault alone still ~1s on LTU_AHouse, matching
the prior claim) **but a SEPARATE, un-fixed hang dominates**, in a DIFFERENT file `§SE-5` never touched:
- Isolating cold-cache noise first (waited for `§SPLIT_GEO_LOADED` before touching TM/Author, so the
  379MB geo-db first-load fetch — a real but unrelated one-time cost — doesn't get misattributed):
  Time Machine toggle-ON alone blocked the main thread for **~29s total** across 6 stalls (max single
  stall 12.9s) before `_tmOn` actually flipped true. Generate (`#sa-draft`) added another **~10.3s**
  (2 stalls). Apply (`#sa-apply`, with `_tmOn` true so it chains into `tmRefoldSchedule()`) added
  **~17s** (2 stalls, the second one 11.8s). **Caveat, stated plainly:** this headless Chromium runs
  WebGL through **SwiftShader software rendering** (`§RENDERER_CAPS ... SwiftShader Device (Subzero)`)
  — a real user's GPU-accelerated browser will NOT see these exact absolute numbers, they are inflated.
  The QUALITATIVE finding — multi-second continuous blocks survive on a 122k-element building, well past
  Chrome's unresponsive threshold — is not an artifact of that caveat; it reproduced identically in
  shape (not magnitude) across 3 separate runs.
- **Root cause, file:line:** `viewer/time_machine.js` `saveVisibility()` (~line 1744) and
  `restoreVisibility()` (~line 1777) — called from `_finishActivate()` (~3693, every TM activate/toggle)
  and from `deactivate()` (~3754, every TM close, including the deactivate-half of `refoldSchedule()`'s
  cycle). `saveVisibility()` does `app.scene.traverse(...)` over the WHOLE Three.js scene graph, and for
  EVERY `InstancedMesh` loops `for (i=0;i<metas.length;i++) { obj.getMatrixAt(i,tmpM); matrices[i] =
  tmpM.clone(); }` — one `THREE.Matrix4` read + allocation PER INSTANCE, synchronously, no yielding.
  `restoreVisibility()` does the mirror-image `setMatrixAt` loop. On a 122,330-element building rendered
  substantially via InstancedMesh/BatchedMesh, this is O(elements) real allocation+copy work with no
  chunking — and it fires on EVERY toggle, EVERY Apply (which cycles deactivate→activate), confirmed via
  `§MOBILE_TM_TOGGLE method=setVisibleAt|setMatrixAt` in the log at exactly the block boundaries.
  Verified this IS necessary work in general (not a redundant-call bug to just skip): TM hides
  not-yet-built elements by zeroing their instance matrix (`_zeroMatrix`, line ~810) during playback, so
  it genuinely needs the real matrix saved somewhere to restore later — this is real, unavoidable-as-
  currently-designed O(n) cost, not a silly duplicate call.
- **Why §SE-5 didn't catch this:** that fix's whole scope was `schedule_author.js`'s SQL bulk-write
  overhead (`materializeDefault`/`scheduleContiguous`) — a DIFFERENT file, DIFFERENT layer (sql.js
  per-statement commit cost vs. this session's finding, which is pure JS/Three.js scene-graph traversal
  cost in `time_machine.js`, never instrumented before now). §SE-5a's own write-up even flagged the gap
  and scoped it out: *"the remaining cost is per-element JS work ... plus WASM/JS marshalling, not
  transaction overhead — a smaller, separate optimization if ever needed, out of scope for this fix."*
  That "if ever needed" is now confirmed needed — this session's finding.
- **NOT YET IMPLEMENTED.** This is real perf-surgery on a shared, stateful subsystem (TM's
  save/restore pairing is genuinely load-bearing for playback correctness, not a redundant call to
  delete) — needs its own Spec-First session, not a rushed patch. Candidate directions, none built yet:
  (a) chunk the traversal/clone loop across `requestAnimationFrame` slices so the MAIN THREAD stays
  responsive even if total wall-clock work is similar (turns "one 15s freeze" into "many sub-frame
  slices, no browser Page-Unresponsive prompt, no PERCEIVED hang") — directly answers the user's actual
  complaint (the tab freezing), independent of raw speed; (b) avoid the defensive per-instance
  Matrix4 clone by reading base positions from an already-in-memory authoritative source
  (`element_transforms` table / instance meta) instead of round-tripping through live Three.js objects;
  (c) extend the existing `§S259_TM_LITE`/`_isLargeBuilding` (>50K elements) principle — which already
  disables "sparks" for big buildings — to also skip/cheapen the full-fidelity matrix snapshot above
  that same threshold.
- **Handoff:** per `feedback_diagnose_in_session_fix_in_other_session` — diagnosed fully, root-caused
  to exact file:line, proposed fix directions, NOT implemented this session (scope/risk on shared TM
  state machinery warrants its own dedicated session). Pick up here: implement direction (a) first
  (lowest risk — doesn't change what gets saved, only WHEN, so playback correctness can't regress),
  witness on LTU_AHouse with the same heartbeat-prober methodology (script pattern documented above),
  confirm max single stall drops to sub-1s (below the ~1s where the tab visually reads as "hung" even
  without hitting Chrome's own dialog threshold).
- **Fix committed + PR'd** (see §SE-8's PR #789, same commit): removed the ONE confirmed-redundant
  cost — `saveVisibility()`'s duplicate `THREE.Matrix4` clone (`restoreVisibility()` now reads
  `renderAtTime()`'s already-built lazy cache instead). Measured effect: total block time on
  LTU_AHouse 60.9s → 52.8s (~13%). **This was real but NOT the dominant cost** — see §SE-7b below,
  found later the SAME session after the user corrected the framing.

### §SE-7b — CORRECTED root cause (user correction 2026-07-14, same session): it's Generate+Apply only, TM is fine, and it's the SQL/save path — not scene rendering
User, after §SE-7's TM-rendering-cost fix was pushed: *"Time Machine has no hang issue ever. It is
only the 4D generate and during Apply it hangs. Again, it is a pure SQL write of schedule."* This
was right to push back on — re-tested with TM **never touched at all** (Author wizard only) and found
the TRUE mechanism, which is neither of the two things §SE-7 chased (not TM's Matrix4 clone, and NOT
a slow SQL/export call either — both measured genuinely fast):

- **`materializeDefault`** (Generate's actual SQL work): 591ms-3s on LTU_AHouse (122,667 elements),
  confirmed fast in Node AND in an isolated direct browser call — consistent with §SE-5's fix holding.
- **`ScheduleAuthor.persistDb`** (`db.export()` + IndexedDB `put()` — the "save"): called DIRECTLY
  and in isolation, resolves in **543ms** for a 42MB export. Also genuinely fast.
- **But wired through the real UI (`schedule_author_ui.js`'s `persist()` wrapper, called from
  `render()`'s end for Generate, and `applyTo4D()` with `{immediate:true}` for Apply), the SAME
  `persistDb` call took 15,000-20,000+ ms to actually fire** — confirmed by monkey-patching
  `ScheduleAuthor.persistDb` to log on ENTRY (fires immediately, correctly wired) vs. its own internal
  `§SCHED_PERSIST` success log (didn't appear for 15-20+ seconds). This held even after a **45-second
  idle settle** before ever touching Generate — ruling out "still catching up from initial load."
- **Root cause: `persistDb` schedules its real work via `setTimeout`** (1200ms debounced for Generate,
  0ms/"immediate" for Apply) — **a low-priority macrotask that must wait its turn behind LTU_AHouse's
  continuous per-frame rendering cost** (the SAME ambient main-thread saturation §SE-7's idle-baseline
  test proved exists independent of Time Machine — 8.7s blocked out of 8s idle on this building, 0ms
  on a 1.1K-element building). The scheduled save isn't slow; it's **starved** — queued behind dozens
  of seconds of unrelated per-frame work before the JS engine ever gives it a turn. Zero UI feedback
  during that wait (`applyTo4D` shows "Applied." synchronously, then the ACTUAL save silently pends for
  up to 20s with no indicator) — exactly what reads as "it hung."
- **Reconciles §SE-7's finding, doesn't contradict it:** it's the SAME ambient per-frame rendering cost
  (proportional to building size) — §SE-7 measured it blocking TM's OWN activation; this shows it ALSO
  starves an unrelated background `setTimeout` (the schedule save), which is what the user actually
  experiences as Generate/Apply hanging, while TM itself (once a building has settled and the user is
  just scrubbing/viewing) genuinely doesn't hit this path the same way — explaining why the user sees
  "TM is fine, only Generate/Apply hang" even though both symptoms trace to the same underlying cause.
- **NOT YET FIXED.** Two directions, neither built this session:
  (a) **Cheap, ships now, doesn't fix the delay:** show an explicit "Saving…" acknowledgment when
  `persist()` is pending and confirm when `§SCHED_PERSIST` resolves, so a 15-20s wait is visibly a
  save-in-progress, not silence that reads as a freeze — same idiom §SE-5a already used for
  `materializeDefault`'s "please wait" status. Low risk, but honest: does not make the save faster.
  (b) **Real fix, bigger scope:** reduce the ambient per-frame main-thread cost for 100K+-element
  buildings so a scheduled macrotask doesn't have to wait 15-20s for a turn — this is the SAME
  rendering-cost investigation §SE-7 already opened (candidate directions listed there), now confirmed
  to matter for more than just TM's own responsiveness.
- **Which building matters:** this entire mechanism is building-size-proportional (confirmed:
  LTU_AHouse 122K elements — severe; Duplex 1.1K elements — zero idle blocking in the same test). If
  the user's real hang is on a smaller/mid building, this diagnosis does NOT apply and the search
  should restart on THAT building specifically, not assume it's the same cause.

### §SE-7c — THE ACTUAL BUG: `kernel_ops.output_guid` had no index → O(n²) in the T3 overlay pass (FOUND + FIXED + MERGED, 2026-07-14)
§SE-7b measured `persistDb` (materializeDefault + `db.export()`) as genuinely fast, but the DELAY was
real (15-20s) and unexplained. Traced it one level further: `applyTo4D()` (when `_tmOn` is true, the
realistic case — a user authoring a schedule usually has Time Machine open to see it) calls
`tmRefoldSchedule()`, which `deactivate()`s then `activate()`s TM — and `activate()` → `_activateAsync`
→ (cache invalidated by the refold itself) → `injectGantt()`, the SAME full recompute §SE-7 already
profiled as fast in isolation (~1.6s for query+sort+`ScheduleGate.computeSchedule`+the batched INSERT).
**But that profiling stopped short of the LAST stage** — the T3 overlay pass (`time_machine.js` ~2701,
`if (_cap) {...}`) that patches the just-computed generic schedule with the REAL authored task dates.
This is the "smart resolved routine" the user recalled (the `_cap` JSON built from 2 cheap `tasks`/
`task_elements` queries) — but APPLYING it runs:
```
UPDATE kernel_ops SET timestamp=?, parameters=? WHERE op_type='ELEMENT_PLACE' AND output_guid=?
```
**once per element** — up to 122,667 times on LTU_AHouse (Author's `materializeDefault` assigns
100% of elements to a phase, so `_cap` covers everything → every single `ELEMENT_PLACE` op gets
patched). `kernel_ops` (`CREATE TABLE ... id INTEGER PRIMARY KEY, ..., output_guid TEXT, ...`) had
**no index on `output_guid`** — so every one of those 122,667 UPDATEs did a full table scan of
`kernel_ops` itself (also up to 122,667 rows). O(n²): up to ~1.5×10¹⁰ row comparisons.
- **Measured (real browser, isolated stage timing via `performance.now()` brackets around each of
  injectGantt's stages, LTU_AHouse, `_cap` covering 122,667/122,667 = 100%):** query+bands 582ms,
  map+sort 163ms, `ScheduleGate.computeSchedule` 146ms, the batched INSERT 832ms, `auditFloating`
  126ms, scene-guid-count traverse 14ms — **all fast, summing to ~1.9s** — then the overlay pass:
  **34,205ms one run, 123,072ms a second run** (highly variable — consistent with O(n²) contending
  for CPU against everything else running concurrently, not a fixed cost).
- **Fix:** `db.run('CREATE INDEX IF NOT EXISTS idx_kernel_ops_guid ON kernel_ops(output_guid)')`
  added right after `injectGantt()`'s own `CREATE TABLE IF NOT EXISTS kernel_ops` (its one entry
  point — the OTHER `CREATE TABLE kernel_ops` call site, in `_activateAsync`'s cache-HIT fast path,
  never runs the vulnerable UPDATE loop, so doesn't need its own copy). **Re-measured with the index:
  the SAME overlay pass, SAME 122,667 rows: 1,273ms.** 25-100x, turning an O(n²) bug into a normal
  indexed O(n log n) operation.
- **Correctness (non-invent — an index cannot change query results, only performance, per SQLite
  semantics; verified anyway):** re-ran with the index in place — `§GANTT_SOURCE captured tasks=6
  covered=122667 generated=0 total=122667 pct=100`, byte-identical coverage to what the unindexed
  version produced (just 25-100x faster to get there). `W-AUTHOR-4D-BLANK` 16/16 and
  `test_schedule_gate.js` PASS unchanged (neither touches this code path, both still green as a
  broader regression check).
- **Honest reconciliation with §SE-7/§SE-7b, not a retraction:** this was the DOMINANT, previously-
  unmeasured cost specifically in the "schedule was just authored/changed, now Time Machine must
  reflect it" step — exactly the user's own "1. schedule change, 2. regenerate Time Machine" framing.
  It compounds with (doesn't replace) §SE-7's separate ambient per-frame render-cost finding: re-timed
  the FULL user flow (TM already ON → author a schedule → Apply) with the index fix in place — the
  overlay piece itself is now ~1.3s, but the end-to-end Apply-to-refold-complete time was still ~31s
  in that specific TM-already-rendering scenario, because §SE-7's ambient cost (main thread saturated
  by continuous per-frame rendering of 122K elements) still delays this (now-fast) work from getting a
  turn — the SAME mechanism §SE-7b already documented delaying `persistDb`'s `setTimeout`. §SE-7's own
  candidate fix directions (chunk the render loop, reduce per-frame cost above the 50K threshold)
  remain the next lever if that residual delay still matters in practice.
- **Shipped:** worktree `/tmp/wt-kernel-ops-index` (cherry-picked off fresh `origin/main`, per the
  squash-merge branch-reuse hazard — the original `fix/tm-hang-diagnosis-editor-gen-export` branch was
  already squash-merged as PR #789 and can't be reused). **bim-ootb PR #791, CI-gated auto-merge
  enabled** (`gh pr merge --auto --squash`) — `fast-checks` green at time of writing, `e2e-tests`
  pending; no action needed, lands on green. `sw.js` CACHE_VERSION v750→v751, `time_machine.js`
  v59→v60.

### §SE-7d — CORRECTION to §SE-7's "ambient render cost": it's NOT Time Machine, it's `streaming.js`'s initial mesh-load queue (user challenge 2026-07-14, same session)
User, on being told the residual delay was "ambient per-frame rendering cost while TM is active":
*"But why must it be rendering when it has stopped or not in play? User usually focus on the 4D first
before playing."* Right challenge — checked `main.js`'s render-loop gate directly rather than assuming,
and the codebase agrees with the user, not with §SE-7's framing:
```
// §S286: ... No TM exception: Time Machine self-renders via its own setTimeout timer →
// renderAtTime() (markDirty + direct render), so the loop is redundant even for TM.
var _awake = _needsRender || APP.streaming || APP.walkModeActive || ... ;
if (!_awake) { _rafId = null; /* §IDLE_GATE park */ return; }
```
The main render loop (`animate()`) is EXPLICITLY self-parking and has NO Time-Machine-specific
exception — a stopped/non-playing TM costs genuinely nothing, exactly as the user expected.
- **What §SE-7's "idle baseline" test actually measured (mis-attributed):** `APP.streaming` — the
  ONE-TIME initial mesh-geometry load queue in `streaming.js`, entirely separate from
  `time_machine.js` — was still `true` during that "idle" window, which is ITSELF one of `_awake`'s
  conditions, keeping the render loop from ever parking. Re-tested by polling `APP.streaming`/
  `APP.streamedCount` directly every 5s on LTU_AHouse (headless, same environment): **after 116
  seconds, only 40,500 of 122,330 elements (33%) had streamed** — genuinely still loading (network +
  IndexedDB blob fetches, 500-element batches), not stuck, but slow enough on a building this large
  that it can run for MULTIPLE MINUTES. `SPLIT_GEO_LOADED` (the 379MB geo.db FILE finishing download)
  — which §SE-7's "settled" tests waited for — is NOT the same thing as streaming completing; the geo
  DATA existing locally and the STREAMING QUEUE actually converting it into rendered meshes are two
  different stages, and the second one is much slower for 100K+-element buildings.
- **Correction, not a new bug:** this is a real, known, expected cost of loading a building this large
  over the network for the FIRST time in a session (matches `§S192 §DS_QUEUED`'s own
  "elements=122330" log already being explicit about the scale) — not a defect in Generate/Apply/TM
  code. If a user acts on Author/Generate soon after opening a 100K+-element building (a very
  reasonable workflow — "focus on 4D first, before playing"), that ongoing streaming is genuinely
  still competing for the main thread, independent of anything §SE-7c's index fix or §SE-7's own
  matrix-clone dedupe touch. **§SE-7's "chunk the render loop" candidate direction was aimed at the
  wrong file (`time_machine.js`) — if this residual delay ever needs a real fix, the target is
  `streaming.js`'s batch-fetch/flush pipeline, not Time Machine.** No code change made this session —
  this is a corrected diagnosis, recorded so a future session doesn't re-chase TM code for it.

## §SE-8 — Editor tab: ⚙ Generate button + ⤒ MS Project (MSPDI) export (user ask 2026-07-14, mid-session)
User, while §SE-7 was in progress: *"the separate Editor tab, also should have its Generate process
button? Can u make it export to MSProject format? It already has P6 import."*

- **Generate button:** the Editor (`schedule_editor_ui.js`) only ever auto-seeded the rule-based default
  schedule ONCE, silently, on first load of a truly blank model (`init()`'s fallback branch) — there was
  no user-facing way to (re)trigger it. New `doGenerate()` mirrors the ✎ Author wizard's "Generate first
  draft"/"Regenerate" button exactly: same captured-schedule guard (never overwrites an imported P6/
  Bonsai/Revit programme — offers a status message instead), same `materializeDefault` call (§SE-5a's
  idempotent-rebuild transaction wrap already makes it safe to re-run). New `⚙ Generate` ribbon button in
  `schedule_editor.html`.
- **MS Project export:** new `⤒ MS Project` button, `exportMSProject()` builds an MSPDI XML file — the
  write-side counterpart to the EXISTING P6/MSPDI import (`foreign_schedule.js` `parseMSPDI`, merged PR
  #519). **Non-invent:** the XML schema/units were not assumed from general MSPDI knowledge — read
  DIRECTLY off our own parser's comments+code (`foreign_schedule.js:165-176`) so export and import agree:
  OutlineLevel-encoded hierarchy (MSPDI has no parent-id field — hierarchy is walked pre-order from
  `ScheduleAuthor.wbsTree()` and re-derived from OutlineLevel nesting on read), `Duration` =
  `PT{hours}H0M0S`, `LinkLag` = integer TENTHS OF A MINUTE, `PredecessorLink/Type` = 0=FF/1=FS/2=SF/3=SS
  (exact reverse of the importer's own `MSP_TYPE` map), `MinutesPerDay`=480 (8h/day, the importer's own
  fallback default).
- **Witness — round-trip through OUR OWN parser (not just "looks like XML"):** node script
  (`/tmp/claude-.../scratchpad/test_msp_export.js`) materializes a real default schedule on
  `SampleHouse_extracted.db` (60 elements, 3 phases), adds 2 real `FS` dependencies via
  `ScheduleAuthor.addDependency`, builds the export XML with the SAME logic now in
  `schedule_editor_ui.js`, feeds it back through `ForeignSchedule.parseForeign`/`parseMSPDI` — **PASS**:
  detected format=MSPDI, WBS+activity count matches emitted row count exactly (4=4), relationship count
  matches (2=2), and a spot-checked leaf's start/finish dates round-trip byte-identical
  (`2026-01-01`/`2026-01-31` in, same out). XML also validated well-formed via `xml.dom.minidom`.
- **Witness — real browser, real DOM, real file download** (`/tmp/claude-.../scratchpad/test_editor_ui.js`,
  Playwright against a worktree-local server on `Duplex_extracted.db`, 1,119 elements): loads → auto-seeds
  → click `⚙ Generate` → regenerates (6 phases, 1,119 elements, status updates, no error) → click
  `⤒ MS Project` → a REAL `download` event fires, saved file is well-formed XML with the `Tasks` tag and
  `schemas.microsoft.com/project` namespace present, named `Duplex_extracted_schedule.xml`.
- **Implemented, NOT pushed** (PUSH PAUSE standing, 2026-07-11 — localhost/commit-only): worktree
  `/tmp/wt-tm-hang-fix`, branch `fix/tm-hang-diagnosis-editor-gen-export`, commit `ab06f0d` off fresh
  `origin/main`. `schedule_editor_ui.js` v8→v9, `sw.js` CACHE_VERSION v749→v750 (bump applied now per
  deploy convention even though not deploying yet, so it's correct whenever this does ship).
- **Out of scope, not built:** exporting an ALREADY-imported P6 schedule back to MSPDI is the same code
  path (works on `tasks`/`task_sequences` regardless of origin) — not separately tested this session,
  should be a quick follow-up witness before shipping, not a design change.

---

## §AUTHOR-1 SPEC — "Build the 4D up from a blank Hospital" (FIRST authoring slice; §MAIN-INTENT)
The keystone of the main intent: originate the schedule on a real-but-bare model. Spec BEFORE code.

### Issue this slice proves/disproves
> Can a user start from the Hospital MODEL with ZERO 4D metadata, SEE its elements, and BUILD a
> schedule UP — organized as phases (WBS) with elements assigned — entirely from signed ops, with
> NO rule-based auto-generation? (Today `injectGantt` auto-builds from rules → there is no
> user-authored, build-from-blank path. This slice creates it.)

### Data model — REUSE the IFC-native 4D tables (NOT a new kernel_ops op; corrected 2026-06-23)
The repo ALREADY has the right substrate (`viewer/import_db_builder.js`, consumed by injectGantt's
`_cap` overlay) — author into it, don't invent:
- `tasks(task_id, schedule_id, wbs_parent, name, predefined_type, is_summary, schedule_start,
  schedule_finish, schedule_duration, …, resource, status)` — IfcTask. `wbs_parent`+`is_summary`
  = the ORGANIZED WBS tree. A "phase" = a task row.
- `task_elements(task_id, guid, PK(task_id,guid))` — the assignment. `task→guid` IS the P2
  identity-link (survives rename).
- READ PATH UNCHANGED: injectGantt `_cap` (time_machine.js:2405) reads dated leaf `tasks` + maps
  `guidTask`, overlays real task window+name onto covered ELEMENT_PLACE; uncovered → generative.
- WEDGE follow-up (later): mirror each authoring write as a signed `kernel_ops` op (the git-for-data
  layer); slice-1 keeps the IFC-native tables as the 4D source of truth.

### SMART WIZARD model (user, 2026-06-23 — resolves blank-vs-autogen)
DON'T suppress the auto-schedule — USE it. The default simple schedule we ALREADY have
(`injectGantt`'s rule-based fold) is the wizard's **prebaked FIRST DRAFT** (fast start). The user
then CRAFTS it up — organized, front-visual. "Smart wizard" = a guided flow with sensible DEFAULTS
the user accepts or overrides at each step; every override is a signed op. So:
- Fast start: `injectGantt` seeds the default schedule from the model (what we have today).
- Craft: the wizard surfaces it ORGANIZED (phases = WBS tree, elements nested), and offers smart
  steps to refine — rename/merge/split phases, REASSIGN elements (`ELEMENT_ASSIGN`), set/drag dates
  (reuse shipped P1.b drag), add cost. Each edit = a signed `kernel_ops` op layered on the default.
- The truly-blank manual path is a corner case, NOT the default — speed first, then craft.

### Front-visual wizard (the surface — front dominant, per design law)
Stepped, with smart defaults pre-filled: ① Phases (auto-suggested from rules; rename/merge/split)
② Assign elements (default by rule; multi-select in 3D/list → reassign → `ELEMENT_ASSIGN`)
③ Dates (default contiguous; drag bars — P1.b) ④ Cost (later). User can accept defaults and finish
fast, or refine any step. Organized = phases are the WBS tree; elements nest under.

### Witness `W-AUTHOR-4D-BLANK` (headless §-log, real elements)
Real SampleHouse (local; has elements, NO `tasks`/`task_elements` = genuinely blank 4D; Hospital is
the demo target but its DB is git-LFS). Chain via the REAL injectGantt + `_cap` overlay:
1. Blank: `tasks=0` → injectGantt → `§GANTT_SOURCE generated` (the smart default we have).
2. Materialize the default: fold the generative ELEMENT_PLACE rows → one `tasks` row per phase
   (name, min/max dates) + `task_elements` per element. Now native 4D exists, editable.
3. Craft: REASSIGN one element's `task_elements` row to a different phase-task (the user override).
4. Re-fold: injectGantt → `_cap` active → `§GANTT_SOURCE captured` — reassigned element now carries
   the TARGET task's window+name, bound by `output_guid` (P2); other elements keep their phases.
- Asserts: blank→default→materialized tasks>0→reassign honored on re-fold→binding by guid.

### ⚠ Decision / checkpoint before I implement (lands in bim-ootb deploy repo)
NEW subsystem (1 new op `ELEMENT_ASSIGN` + a wizard panel reading `injectGantt`'s default), so it's
a green-light checkpoint. Smallest meaningful first slice = the CRAFT verb on the smart default:
load model → `injectGantt` default → wizard shows phases organized → user REASSIGNS an element to a
different phase (`ELEMENT_ASSIGN`) → 4D re-folds. Witness `W-AUTHOR-4D-BLANK` proves: default seeded,
reassign overrides it (signed op), fold reflects the override, binding by `output_guid` (P2).

### §AUTHOR-1 IMPLEMENTATION SPEC (slice-1 build, 2026-06-23 — traces the code below)
Two pure functions in `viewer/schedule_author.js` (no DOM, node-testable; dual export
`window.ScheduleAuthor` + `module.exports`). Source of truth = the IFC-native 4D tables ONLY
(per §AUTHOR-1 "NOT a new kernel_ops op; corrected 2026-06-23"); kernel_ops mirroring deferred.
- `matchRule(cls, rules, dflt)` — longest-substring containment, REPLICATES `time_machine.js`
  `matchRule` exactly (so authored phases == what injectGantt's `_cap` would group). Returns the rule.
- `materializeDefault(db, rules, opts)` — read `elements_meta(guid,ifc_class)` → group by phase via
  matchRule → order phases by min `sequence`. Writes one IFC-native `schedules` row (`SCH_AUTHORED`),
  one `is_summary=1` ROOT task spanning all, one `is_summary=0` dated LEAF task per phase
  (`task_id=TASK_<slug>`, `wbs_parent=ROOT`, contiguous windows from `opts.start` default `2026-01-01`,
  `opts.phaseDays` default 30), `wbs_parent`/`is_summary` = the ORGANIZED WBS tree. `task_elements`:
  every element guid → its phase task (the assignment = P2 identity-link). Idempotent: clears the
  `SCH_AUTHORED` schedule's rows first, then rebuilds. Returns `{scheduleId, rootId, phases[], taskCount, assignmentCount}`.
- `assignElement(db, guid, taskId)` — the CRAFT verb (reassign/override): guard `taskId` exists →
  `DELETE FROM task_elements WHERE guid=?` → `INSERT (taskId, guid)`. One element re-homed to a
  different phase. Returns `{ok, guid, taskId}`.
Witness `erp/tests/author_4d_witness.js` extracts the REAL `_cap` IIFE VERBATIM from
`time_machine.js` (string-slice → `new Function('db', src+'return _cap')`) so the consumer under test
is the shipped code, not a re-type. Real `SampleHouse_extracted.db` (60 elements, `tasks=0` blank).

### §AUTHOR-1 COST-STEP SPEC (slice-3 = step ④ 5D, 2026-06-23 — traces the code below)
The cost breakdown is a **FOLD, not hand-entry** (Holy-Grail declarative-fold law + §0 5D wedge):
phase cost = Σ of its assigned elements' 5D cost, so reassigning an element (step ②) MOVES its cost
between phases — the WBS the user authored organizes the cost. NON-INVENT: reuses the shipped 5D
model verbatim (`analysis_sidecar.js compute5D` quantity expressions + `rates.js` `RATES`/`RATES_DEFAULT`,
unit EA/M/M2/M3). New pure fn `foldCost(db, scheduleId, RATES, ratesDefault, currency)` in
`viewer/schedule_author.js`: one join `task_elements→tasks(schedule, leaf)→elements_meta→element_transforms`
(same bbox filter `bbox_x>0` as compute5D), per element `rt=RATES[cls]||ratesDefault`,
`qty=byUnit(rt.unit)` (M→length, M2→dominant-face area, M3→bbox vol, else→1), `cost=rt.rate*qty`,
accumulate per task → roll up `total`. Seeds every leaf phase (cost 0 if its elements lack bbox) and
reports `unmappedClasses` (classes that fell to `ratesDefault` = honesty, no silent fabrication).
Returns `{currency, total, phases:[{taskId,name,cost,elements}], unmappedClasses}`. UI: wizard render
shows per-phase cost + a project total footer (recomputed after draft/reassign); `window.RATES` pack.
Witness `erp/tests/author_5d_cost_witness.js` (W-AUTHOR-5D-COST): real SampleHouse → total>0 ==
Σ phase costs == independent per-element apply5DRates sum (fold == direct compute); reassign moves
exactly one element's cost A→B, total INVARIANT.

## §LOG (append witness results here as built)
- (user 2026-06-23, Bonsai/Revit IFC) **W-AUTHOR-CAPTURED ✅ 11/11 LIVE** (PR #502 → main `b195103`,
  sw v710). Dropped IFC can carry a schedule crafted in **Bonsai/Revit** — `import_worker` already
  captures `IfcWorkSchedule`/`IfcTask`/`IfcRelSequence`/`IfcRelAssignsToProcess` into the same tables
  (GlobalId-keyed, dates verbatim, `§4D_FOUND`). The wizard was `SCH_AUTHORED`-only → wrongly said
  "no schedule" + would create a COMPETING schedule (and `_cap` reads ALL schedule_ids → doubled
  timeline). Fix: new `ScheduleAuthor.activeSchedule(db)` (authored-draft-else-imported); wizard
  ADOPTS + edits the active schedule in place; `generateDraft` bails on a captured one (Generate/blank
  controls hidden). Live-confirmed: adopts "Bonsai Programme", Generate hidden, 0 errs.
  - ⚠ **Data model ALREADY supports dependencies + WBS** (next-step relevance): `task_sequences`
    (predecessor_id, successor_id, sequence_type, lag_days) from `IfcRelSequence` + `wbs_parent`/
    `is_summary` tree — the future "schedule editor" EXPOSES these, doesn't invent them.
- (UX, user 2026-06-23) **W-PANEL-DRAG ✅ 8/8 LIVE** (PR #501 → main `8b767bf`, sw v709). Author 4D +
  What-if panels now **draggable by their header** (pointer-events; What-if by its `<h3>`, separate
  from the `.wi-track` slip-drag; TM panel was already draggable). Live-proven on real SampleHouse
  (Author moved exactly −260,+120; What-if −200,−150; 0 page errors). **Also fixed the misleading
  "No schedule yet"**: on a building with a *playing* timeline (Hospital), the wizard correctly had
  nothing to edit because the TM timeline is **generative** (`injectGantt`, computed on the fly) and
  the what-if reads the **baked ERP project phases** — NEITHER is an editable authored IFC `tasks`
  schedule (`SCH_AUTHORED`, the only thing the wizard edits). Reworded to say exactly that.
- (§MI-FLOW true-blank) **W-AUTHOR-BLANK-START ✅ 11/11** + (§ARCH-OWNERSHIP) **W-ZOOM-TM-ROUTE ✅ 9/9**
  (`bim-ootb erp/tests/author_blank_start_witness.js` + `zoom_tm_route_witness.js`, **PR #500**, sw v708).
  - **True-blank start:** `materializeDefault opts.blank` organizes phases (WBS) + assignments but
    leaves dates NULL → the VERBATIM `_cap` sees nothing (TM stays blank) until the user clicks
    "Schedule now" → `scheduleContiguous` dates them → same `_cap` maps all 60 guids, user's start
    honored. UI: "Start blank" checkbox + "unscheduled" phases + "Schedule now ▶". The auto-schedule
    becomes an optional "suggest a start" (the §SMART-WIZARD corner case, now supported).
  - **ZoomAcross routing:** `applyFindScope` checks `tmGetState().active` → TM-open CONSUMES the
    pinpoint (`tmJumpToElement` → the element's construction moment, guid + class scopes), else Find
    is the default floor. `§ZOOM-SCOPE route=tm|route=find` logs it. Witness = wiring + the
    `tmJumpToElement`/`tmGetState` consumer API; value proof = live `§ZOOM-SCOPE route=` (deploy).
  - Regressions green (16/16 · 10/10 · 14/14). Live browser smoke deferred to deploy.
- (§AUTHOR-1 step ④ / slice-3) **W-AUTHOR-5D-COST ✅ 10/10** (`bim-ootb erp/tests/author_5d_cost_witness.js`,
  log `/tmp/author5d.log`, **PR #499 MERGED→main `15eac54`, LIVE sw v707** — viewer serves the cost
  step; verified live foldCost=1 + sw v707 + viewer.html `schedule_author.js?v=2`). The cost
  step is a **FOLD, not hand-entry**: new `ScheduleAuthor.foldCost(db, scheduleId, RATES, ratesDefault,
  currency)` rolls each leaf phase's cost = Σ its assigned elements' 5D cost (NON-INVENT: shipped
  `compute5D` bbox-quantity exprs + `rates.js` `RATES`/`RATES_DEFAULT`, unit EA/M/M2/M3). Wizard shows
  per-phase cost + project-total footer (recomputed after draft/reassign).
  - `§AUTHOR_COST total=172327` on real SampleHouse == Σ phase costs == an INDEPENDENT per-element sum
    computed in the witness (fold == direct compute).
  - **Reassign moves cost**: IfcWall (cost 5074) Architecture→Superstructure → src −5074, dst +5074,
    **total INVARIANT** — the authored WBS organizes the 5D cost (the §0 wedge in miniature).
  - `unmappedClasses` surfaced (=0 for SampleHouse's bbox'd classes) = honest default-rate reporting.
  - Live browser smoke deferred to deploy (no sandbox browser), as with #496.
- (§AUTHOR-1 slice-1) **W-AUTHOR-4D-BLANK ✅ 16/16** (`bim-ootb erp/tests/author_4d_witness.js`,
  log `/tmp/author4d.log`, branch `lane/author-4d-wizard` @ `05fcad9`, pushed; not yet PR'd/deployed
  — node-engine slice, no UI). Real `SampleHouse_extracted.db` (60 elements, `tasks=0` = genuinely
  blank 4D). New `viewer/schedule_author.js` (`materializeDefault` + `assignElement` + `matchRule`,
  pure/DOM-free). The `_cap` consumer is **extracted VERBATIM** from `time_machine.js`
  (1615-byte slice → `new Function`); `SEQUENCE_RULES`=49 extracted verbatim from `rates.js`.
  - `§AUTHOR_MATERIALIZE` blank → 3 ORGANIZED phases `[Superstructure:28, Architecture:15,
    Finishes:17]`, one summary ROOT + 3 dated leaves (WBS tree, 0 orphan leaves), all 60 elements
    assigned (`task→guid` = P2 link).
  - `§AUTHOR_MIGRATE tasks→widened` — shipped building DBs carry a LEGACY-thin `tasks` table the
    read-path can't consume (why they read as blank-4D today); materialize migrates it forward
    (0 data loss) to the widened import_db_builder DDL.
  - shipped `_cap` reads the authored schedule: `taskCount=3`, all 60 guids mapped,
    `IfcFurniture guid→TASK_Finishes` (rule-correct binding).
  - **CRAFT**: reassign one `IfcMember` `TASK_Superstructure→TASK_Architecture` → re-fold honours
    it (`guidTask` flips), control element unchanged, moved element carries the TARGET task window
    — bound by guid (survives, P2). Whitebox §-log only.
- (§AUTHOR-1 slice-2) **W-AUTHOR-WIZARD-WIRE ✅ 14/14** (`bim-ootb erp/tests/author_wizard_wiring.js`,
  log `/tmp/authorwire.log`, branch `lane/author-4d-wizard` @ `d9d55d3`, **PR #496** open). New
  `viewer/schedule_author_ui.js` = the TM-owned front-visual wizard (launched from the TM clock-pill
  surface): ① Generate first draft (`materializeDefault`) ② rename phases + expand/assign elements
  (click=3D `focusElement` highlight, dropdown=`assignElement` reassign) ③ tune dates (per-phase
  duration steppers + project start) ④ Apply to 4D (toggles TM off/on → `_cap` overlays authored
  windows). TM panel gains `tm-author`(✎)+`tm-whatif`(⑂) buttons (panel widened 340→376px for the
  extra toolbar items). **What-if RE-HOMED off Find → TM** (§ARCH-OWNERSHIP): `find-whatif-btn` +
  handler removed from `navigate_find.js`; pill `tm` children updated. `viewer.html` loads both
  scripts (`time_machine.js?v=57`); `sw.js` precache + `v703→v704`.
  - Witness asserts: UI module exposes `openScheduleAuthorWizard`/`ScheduleAuthorUI.toggle`;
    `tm-author`→ScheduleAuthorUI + `tm-whatif`→WhatIfPanel.open wired; Find what-if fully removed;
    both scripts registered; the engine calls the handlers make (`materializeDefault`→`assignElement`)
    fold a valid schedule + bind a reassign on real SampleHouse (value-correctness = slice-1 16/16).
  - Live browser smoke (click→panel renders→draft) DEFERRED to deploy (no browser/jsdom in sandbox).
    ⚠ VERIFY ON DEPLOY: TM header layout with the 2 new buttons (counter not truncated); wizard
    renders + draft/reassign/dates round-trip in the live viewer; what-if still opens from TM.
  - NEXT after merge/deploy = §MI-FLOW true-blank toggle (load model WITHOUT auto-injectGantt, then
    "materialize default" as the FIRST DRAFT the user crafts up) + ZoomAcross TM-if-open-else-Find.
- (P1.b) **W-WHATIF-DRAG ✅ 8/8** (`bim-ootb erp/tests/whatif_drag_witness.js`, log `/tmp/wdragui.log`,
  PR #495). Real `C_Project 990000` (Hospital, 7 F-S phases, span 1080d). New front-visual edit:
  drag a phase track → `WhatIf.pxToDays(Δpx, trackPx, spanDays)` → whole-day `_slips.startDelta`.
  - `§DRAG-PX` 100px→262d deterministic; `§DRAG-GRAIN` 2.62 d/px (drag=fast/coarse, ±=fine, both kept).
  - `§DRAG-PARITY` drag-delta & equal stepper-delta → IDENTICAL blue schedule = ONE `_slips` path
    (the "edit in one spot" law).
  - `§DRAG-RIPPLE` drag +105d on seq=2 → finish +105d, official UNTOUCHED, BAC Δ=0 (dates/PV only).
  - `§DRAG-DPR` device-px under-slips (131d vs 262d) — `pxToDays` takes `clientWidth` (CSS px) = dpr-safe.
  Whitebox §-log only; engine path (commit/accept) already covered by shipped W-WHATIF 13/13.
- (P2) **W-LINK-SURVIVES-RENAME ✅ 8/8** (`scripts/witness_link_survives_rename.js`, log `/tmp/wlink.log`).
  Real SampleHouse (58 ELEMENT_PLACE ops generated by the REAL `injectGantt` sliced verbatim from
  `time_machine.js:2239-2517` + real `rates.js` rules: SEQUENCE_RULES=49, LABOR_RATES=10). Test
  element `3cUkl32yn9qRSPvBJVyWY1` ("Basic Wall:Wall-Partn_12P-70MStd-12P:285846"), frontier at
  cursor mid-install.
  - `§LINK-OURS frontier@T=1 ... HELD` — after renaming `element_name`, the GUID-bound frontier
    binding holds AND the schedule window is **byte-identical** (`[1781558307682,1781570148841]`)
    because sequencing keys `ifc_class`, never the display name.
  - `§LINK-NAMEMATCH lookup(new-name)=MISS broken=1` — the incumbent name-keyed control arm BREAKS
    on the same rename, same element.
  - `§LINK-VERDICT ours=HELD namematch=BROKEN → wedge PROVEN on real SampleHouse`.
  NON-INVENT: real GUIDs, real generator (not reimplemented), real rules; in-memory DB copy so the
  canonical `*_extracted.db` is untouched. Whitebox §-log only (no browser).
- (P1.a) **W-GANTT-DRAG-SLIP ✅ 5/5** (`scripts/witness_gantt_drag_slip.js`, log `/tmp/wdrag.log`).
  Real SampleHouse bars (58, from the real `injectGantt`) + the **real `findBarAtClick`** sliced
  verbatim (`time_machine.js:2686-2705`) confirms our bar geometry matches production.
  - `§DRAG-WYSIWYG dPx=90 Δt=140278259ms drift=0.0000px` — a 90px drag slips the bar so it lands
    EXACTLY under the drop point (CSS-px mapping Δt = Δpx·range/barW).
  - `§DRAG-DPR-TRAP device-px ... drift=47.4px` — the control (device-px / `canvas.width`=CSS×dpr)
    drifts 47px on a 2× display = the retina bug the CSS-px path kills.
  - `§DRAG-VERDICT css-px=WYSIWYG device-px=DRIFTS → gesture math PROVEN dpr-safe`.
  Scope: proves the gesture→slip-delta math ONLY; the `SCHEDULE_SLIP` op + ripple is consumed by
  bim-ootb `whatif.js` (P1.b, not asserted here). Whitebox §-log only.
