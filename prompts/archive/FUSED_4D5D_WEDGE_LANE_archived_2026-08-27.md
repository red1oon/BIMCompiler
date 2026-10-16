# ARCHIVED 2026-08-27 — the 2026-06-23 closeout/review record from `prompts/FUSED_4D5D_WEDGE_LANE.md`
# Moved verbatim, nothing edited, nothing lost. NOT a live task list and NOT a resume pointer.
#
# Why this block: it was a `★ REVIEW CARD` + `▶ RESUME HERE (next session, opened 2026-06-23)` that had
# come to sit BELOW two newer dated blocks in the same file — `▶ LATEST (2026-07-14)` and
# `▶ PRIOR (2026-07-13)` — so a session reading linearly hit a three-week-stale "RESUME HERE" telling it
# to pick up arcs that had already shipped. Everything it records is `✅ DONE`/`MERGED` (PR #495-#506,
# sw v704->v714), and its "NEXT (open sibling arcs)" list is carried forward verbatim by the 2026-07-13
# block that outranks it (fold authored schedule -> ERP C_Project · real-Hospital blank-authoring demo ·
# kernel_ops signed-op mirror · resource column/baseline bars/print/export · single-pane WBS+Gantt merge).
# So no open work is parked here — only the shipped per-slice detail behind it.
#
# DELIBERATELY LEFT IN THE PARENT FILE: the lane's standing charter (`**Scope:**` / strategic target /
# design law / `Honour until DONE`), §MAIN-INTENT, §ARCH-OWNERSHIP, §0 DOCTRINE, every §SE-1..§SE-4 spec
# (the REVIEW CARD's own words: "Full per-slice detail + specs §SE-1..§SE-4 are below"), §SE-5/§SE-6
# (§SE-6 is cited from `prompts/4D_GANTT_TM_REFACTOR.md`), and the whole §SE-7 -> §SE-7b -> §SE-7c ->
# §SE-7d correction chain (the 2026-07-14 header still cites "§SE-7's own candidate directions" as
# applying to the one remaining ambient-render item).

# ▶ ARCHIVED BLOCK — ★ REVIEW CARD (closeout 2026-06-23 -> review 2026-06-24) + ▶ RESUME HERE (2026-06-23)
# (verbatim from prompts/FUSED_4D5D_WEDGE_LANE.md lines 18-155, 2026-08-27)

## ★ REVIEW CARD — for the next session (closeout 2026-06-23 → review 2026-06-24)
The **§SCHEDULE-EDITOR arc is COMPLETE and LIVE** — this session built the MSP-grade Gantt editor end
to end and shipped its UI entry point + published the User Guide. Nothing is committed-but-unpushed;
every PR is merged to main and verified on the live sites. **What to review:**

- **The shipped surface** — open the live viewer, press the Time Machine clock pill (`t`), then **`↗
  Editor`** (next to ✎ Author / ⑂ What-if) → the full Schedule Editor opens in its own tab on the model.
  Try: expand the WBS, add/retype/lag a dependency, **Compute CPM** (critical path goes red), drag a bar
  to reschedule, drag a bar's ▸ handle onto another to link. Open it in TWO tabs to watch live sync.
- **What merged (bim-ootb, all on main, sw v711→v716):** PR #503 step1+2 (WBS + view/edit deps) · #504
  step3+4 (CPM + critical-path) · #505 step5 (interactive drag-Gantt) · #506 §SE-D live cross-surface
  sync · #508 the `↗ Editor` entry button. Files: `viewer/schedule_editor.html`,
  `viewer/schedule_editor_ui.js`, `viewer/schedule_sync.js`, additions in `viewer/schedule_author.js`,
  `viewer/main.js` (S240 consumes `4D_SCHED_EDIT`), `viewer/time_machine.js` (the button).
- **Witnesses to re-run (node, real SampleHouse; the proof):** `erp/tests/schedule_editor_witness.js`
  (W-SCHED-EDIT 19/19) · `schedule_cpm_witness.js` (W-SCHED-CPM 10/10, hand-computed diamond) ·
  `schedule_move_witness.js` (7/7) · `schedule_sync_witness.js` (W-SCHED-SYNC 11/11 convergence). Plus
  headless smokes §SE-SMOKE/CPM/GANTT/SYNC/BTN all green this session.
- **Docs LIVE:** ERPUserGuide §"Schedule Editor — the advanced Gantt" + fig `figs/sched_editor_gantt.png`
  + the `↗ Editor` how-to-open line — published via `scripts/safe_gh_deploy.sh` (guard PASS; deploy
  MUST run from the main working tree, which is the live-docs superset — a *clean* checkout is THINNER
  than live because `archive/*` + the enlarged `custom.css` live only in the working tree, not git;
  bless `.nojekyll` with `ALLOW_SHRINK=1 paths=".nojekyll"`).
- **NOTE on `is_critical` after edits:** any graph edit nulls the CPM columns (no stale critical path);
  recompute with the button. This is intended, not a bug.

**NEXT after review (open arcs, pick any — no user fact needed):** fold the authored schedule INTO the
ERP `C_Project` (the natural next wedge); real-Hospital blank-authoring demo; `kernel_ops` signed-op
mirror; OPFS cross-reload persistence; a full editor→viewer-TM live re-fold demo on a captured-schedule
building (viewer side is wired via main.js, applyOp-proven). **Refused/out of scope:** resource leveling
/ schedule optimisation (§SE-B rabbit hole). Full per-slice detail + specs §SE-1..§SE-4 are below.

## ▶ RESUME HERE (next session, opened 2026-06-23)
Architecture is LOCKED (read §ARCH-OWNERSHIP + §MAIN-INTENT + §MI-FLOW + §AUTHOR-1 first). Shipped:
P0 ✅, P2 ✅ (W-LINK-SURVIVES-RENAME 8/8), P1.a ✅, **P1.b ✅ LIVE** (PR #495, drag-to-slip),
**§AUTHOR-1 slice-1 ✅ + slice-2 ✅ LIVE** (PR #496 MERGED→main `0c3faae`, sw v704 deployed; viewer
serves the ✎ authoring wizard + ⑂ what-if on the TM clock-pill; W-AUTHOR-4D-BLANK 16/16 +
W-AUTHOR-WIZARD-WIRE 14/14). **+ step ④ 5D cost ✅ LIVE** (W-AUTHOR-5D-COST 10/10,
**PR #499 MERGED→main `15eac54`, deployed sw v707**).
  - engine `viewer/schedule_author.js`: `materializeDefault`+`assignElement`+`matchRule`+`foldCost`.
  - UI `viewer/schedule_author_ui.js`: wizard ① draft ② assign ③ dates ④ 5D cost; what-if re-homed.
**§MI-FLOW true-blank ✅ + ZoomAcross TM-routing ✅** (W-AUTHOR-BLANK-START 11/11 + W-ZOOM-TM-ROUTE 9/9,
PR #500, sw v708) — the two follow-on items DONE. See §LOG.
**DEPLOY-VERIFY ✅ DONE (2026-06-23, live headless Chromium via Playwright `~/bim-ootb/tests/node_modules`,
local server of merged main + real SampleHouse):** ALL FOUR capabilities confirmed end-to-end —
✎ wizard opens from TM; Generate first draft → 3 organized phases (Superstructure 28 / Architecture 15
/ Finishes 17) + per-phase 5D cost + total (sums correctly); **header layout OK** (counter "DAY 10 │
HR 5" 92px readable in the 376px panel — NOT cramped); Start blank → "unscheduled" + amber banner +
"Schedule now ▶" → originates dates; ZoomAcross with TM open → `§ZOOM-SCOPE route=tm` → `§TM_PINPOINT_JUMP`
jumped to the wall's construction moment; **zero page errors**. Screenshots `~/Pictures/Screenshots/
author4d_{draft,blank}_live.png`. ONE honest note: the live 5D total (59,234) < the headless witness
(172,327) because the LIVE `window.RATES` is a different (lower) active rate pack than the rates.js
source literal the witness extracts — the FOLD is correct (sum-of-phases checks), the rates are
whatever pack is loaded. Not snapped: the post-"Apply to 4D" gantt re-fold visual (proven headless by
W-AUTHOR-4D-BLANK).
**ALSO SHIPPED THIS SESSION (2026-06-23, all LIVE):** **#501** draggable Author+What-if panels +
honest "no editable schedule yet" copy (W-PANEL-DRAG 8/8, sw v709); **#502** captured-aware — the
wizard ADOPTS a schedule IMPORTED from Bonsai/Revit instead of clobbering it (W-AUTHOR-CAPTURED 11/11,
sw v710, `b195103`). **ERPUserGuide published** (§"Author the 4D/5D schedule" + 2 live figs, What-if
re-pointed Find→TM, `b796513f`) → LIVE red1oon.github.io/BIMCompiler/ERPUserGuide/.

**§SCHEDULE-EDITOR step 1+2 ✅ DONE (2026-06-23, PR #503 OPEN — branch `lane/schedule-editor` off
fresh origin/main, sw v710→v711).** The MSP-grade Gantt arc's first slice, on a SEPARATE surface
(§SE-C new tab). User chose new-tab + view AND edit deps (§SE-1 SPEC below).
  - engine `viewer/schedule_author.js` (+143 lines): `wbsTree` (collapsible WBS from
    `wbs_parent`/`is_summary` + per-leaf element counts) · `listDependencies`/`addDependency`/
    `removeDependency`/`updateDependency` over IFC-native `task_sequences` (written DIRECTLY, as
    `assignElement` writes `task_elements`; kernel_ops signing still deferred) · `wouldCycle` DFS
    guard — a back-edge closing a directed cycle is REFUSED (data integrity, NOT optimisation = the
    §SE-B rabbit-hole line; self-loop/dup/unknown-task also refused).
  - surface `viewer/schedule_editor.html` + `schedule_editor_ui.js`: standalone tab, resolves DB like
    config.js (`?db=`→OCI→Duplex), `activeSchedule()` or seeds default, LEFT collapsible WBS outline +
    RIGHT dep list with add / retype FS·SS·FF·SF / lag / delete; cycle refusal INLINE (no silent drop);
    each edit → `BroadcastChannel('bim_4d')` `{type:'4D_SCHED_EDIT'}` = §SE-D edit→watch rail (viewer
    already listens; live re-fold = later slice).
  - witnesses: **W-SCHED-EDIT 19/19** (`erp/tests/schedule_editor_witness.js`, node, REAL SampleHouse)
    + **§SE-SMOKE 10/10** (headless Chromium: scripts load, DB opens, WBS root+3 leaves+badges, add-dep
    via UI, cycle refused in status). §-log proof first per CLAUDE.md.
**§SCHEDULE-EDITOR step 3+4 ✅ DONE (2026-06-23, PR #504 auto-merge armed SQUASH off fresh main, sw
v711→v712; spec §SE-2).** Bounded CPM over the authored DAG = the §SE-B "DO IT" half (deterministic
forward/backward pass; STOPS before resource leveling/optimisation = the refuse).
  - engine `computeCpm(db,schedId,opts)`: Kahn topo-sort leaf DAG → forward ES/EF → backward LS/LF →
    total+free float → is_critical, honouring ALL FOUR seq types (FS/SS/FF/SF)+lag via `_fwdES`/`_bwdLF`;
    writes early_*/late_* (ISO dates)+float+is_critical to the columns schema already carries (baseline
    schedule_* untouched). `wbsTree` now surfaces is_critical+total_float.
  - UI: "▶ Compute CPM" → red critical rail on WBS leaves + per-leaf float + bold critical dep links +
    "project Nd · critical k/n" readout; ANY graph edit INVALIDATES (nulls the computed cols) so a stale
    critical path never lingers.
  - witnesses: **W-SCHED-CPM 10/10** (HAND-COMPUTED diamond A→B FS / A→C FS+2lag / B→D FS / C→D SS+1lag,
    dur 2/4/3/2 → EXACT ES/EF/LS/LF/float/critical, CP=A,B,D, C float=1; + real SampleHouse FS chain
    all-critical PF=90=Σdur) + **§SE-CPM-SMOKE 6/6** (headless: rail+bold+float+readout, edit clears
    stale) + W-SCHED-EDIT 19/19 still green.
**§SCHEDULE-EDITOR step 5 ✅ DONE (2026-06-23, PR #505 auto-merge armed SQUASH off fresh main, sw
v712→v713; spec §SE-3) = the INTERACTIVE drag-Gantt = the §SE-B WEDGE SURFACE (Bonsai LACKS #5).**
  - engine `moveTask(db,taskId,newStart)`: reschedule one leaf PRESERVING duration → writes
    schedule_start/finish; refuses summary/unknown. drag-to-link REUSES addDependency (cycle guard).
  - UI: full-width Timeline (Gantt) pane below WBS/Deps — bars on a shared day-axis+ticks, critical=red
    post-CPM; **drag a bar** → snap deltaDays=round(dx/pxPerDay) → moveTask (day-snapped, duration-locked)
    → re-render+invalidate CPM+broadcast; **drag the ▸ handle onto another bar** → addDependency(FS),
    cycle refused inline.
  - witnesses: **W-SCHED-MOVE 7/7** (real SampleHouse: +7d shift, dur preserved, summary/unknown refused)
    + **§SE-GANTT-SMOKE 9/9** (headless Chromium REAL mouse: bars render, drag reschedules+re-renders,
    drag-to-link creates dep, reverse drag refused=cycle) + W-SCHED-EDIT 19/19 + W-SCHED-CPM 10/10 green.

**§SCHEDULE-EDITOR §SE-D LIVE SYNC ✅ DONE (2026-06-23, PR #506 auto-merge armed SQUASH off fresh main,
sw v713→v714; spec §SE-4) = the cross-surface payoff: "both are folds of ONE log".**
  - mechanism: each surface has its OWN in-mem db (no shared store) → REPLAY the broadcast op on the
    receiver's db via the SAME ScheduleAuthor verb the sender used (broadcast IS the signed op).
  - module `viewer/schedule_sync.js`: `applyOp(db,op)` PURE dispatch (move→moveTask, add→addDependency,
    remove→removeDependency, retype/lag→updateDependency, cpm→computeCpm); `create()`→{tabId,emit,listen,
    close} over `BroadcastChannel('bim_4d')` type `4D_SCHED_EDIT`, echo-guarded by tabId.
  - wiring: editor emits+listens (2nd editor tab re-folds live); VIEWER (viewer.html loads sync; main.js
    S240 handles 4D_SCHED_EDIT) replays on APP.db + re-folds TM via shipped `toggleTimeMachine()` off→on
    (wizard Apply-to-4D path), safe-additive no-op if task absent.
  - witnesses: **W-SCHED-SYNC 11/11** (node, 2 real SH dbs → byte-identical CONVERGENCE per op + cpm;
    unknown fails closed) + **§SE-SYNC-SMOKE 5/5** (TWO headless tabs REAL BroadcastChannel: drag bar in
    A → B's bar moves live Jan01→Jan21; drag-to-link in A → dep in B).

**§SE ARC COMPLETE** — steps 1-5 (WBS→deps→CPM→critical-path→interactive Gantt) + §SE-D live cross-
surface sync, ALL SHIPPED+MERGED (PR #503-506, sw v711→v714). A real interactive web Gantt on ONE signed
op-log where every edit folds live across surfaces = what Bonsai (not signed) + MS Project (no model/
cost/ERP) lack. NEXT (open arcs, lower priority): fold authored schedule→ERP C_Project; real-Hospital
blank-authoring demo; kernel_ops signed-op mirror; persistence (OPFS cross-reload for httpvfs builds).
Refused/out-of-scope: resource leveling / schedule optimisation (§SE-B rabbit hole).

**§SCHEDULE-EDITOR (the MSP-grade Gantt arc) — ✅ COMPLETE 2026-06-23** (PR #503-506, sw v711→v714; see
the per-slice blocks above + §SE-1..§SE-4 specs below). ERPUserGuide §"Schedule Editor — the advanced
Gantt" PUBLISHED (source + fig `docs/figs/sched_editor_gantt.png`; deploy via `scripts/safe_gh_deploy.sh`
when ready). **NEXT (open sibling arcs — pick any; lower priority, no user fact needed):**
- Fold the authored BIM schedule INTO the ERP `C_Project` (today they're separate stores) — the natural
  next wedge: the schedule you author here becomes the project the enterprise bills from.
- §0/§MAIN-INTENT: real **Hospital** blank-authoring demo (DB git-LFS) + mirror authoring writes as
  signed `kernel_ops` ops (git-for-data layer, deferred from slice-1).
- Persistence: authored writes land in the in-memory model DB — cross-reload persistence (OPFS save)
  NOT yet verified for httpvfs-loaded buildings (open question, flagged to user 2026-06-23).
- Viewer-side §SE-D live re-fold is WIRED (main.js replays + toggles TM) but only smoke-proven at the
  applyOp + 2-editor-tab level; a full editor→viewer-TM live demo on a captured-schedule building is the
  obvious confirmation step.
