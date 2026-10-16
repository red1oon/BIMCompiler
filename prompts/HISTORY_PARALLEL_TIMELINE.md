# ⚠ DO NOT REMOVE — Parallel-universe history: fork-don't-wipe TREE + switch=restore (PR #5)
# Scope: BUILD. Turn the LINEAR undo timeline into a branching TREE so going back + acting forks a sibling
#        universe instead of wiping the forward trail. Bar shows the siblings; clicking a branch tip RESTORES
#        its stamped look (already proven). This is the demo the user wants to film. Whitebox §-log is the
#        witness — drive a real sequence, READ the §-lines, the log IS the proof. Edit shipping code ONLY in a
#        `/tmp/wt-*` worktree off `bim-ootb` (editing ~/bim-ootb is hook-blocked). Honour until ✅ DONE.

## ▶ STATE AT HANDOFF (2026-06-09)
SHIPPED/OPEN (bim-ootb PRs):
- **#205 MERGED** — sink `S()` + knob-net + view-stamp + restore mechanism (`common/history_tap.js`).
- **#207 MERGING** — restore-the-LOOK in the real bar (re-apply x-ray/bbox/camera on entry click; `universal_history.js`).
- **#213 OPEN, STACKED on #207** — `field(name,read,write)` primitive + section-cut FIX + **log-sniffer** (zero-wire
  total recording) + `combineViews`. Branch `feat/history-field-sniffer`. **once #207 squash-merges to main, rebase
  #213 onto fresh `origin/main`** (squash-stack housekeeping — its history collides otherwise).
- **#215 OPEN, STACKED on #213 — THIS PROMPT's PR #5 ✅ DONE (witnessed).** Branch `feat/history-branch-tree`.
  Branch TREE in `common/history_bar.js`: fork-don't-wipe (`§HIST_FORK`) + sibling ⑂ ticks in the bar + switch=restore
  (`switchToId`/`_switchToNode`) + per-building persist (`serialize`/`hydrate`/`setTreeKey`, key from `?db=`). Witness
  `/tmp/wt-field/drive_fork.js`→`fork.log`: `§PROOF tree=*A-base(A-tip | *B-tip) nodes=3 tips=2` (both universes
  survive, no wipe); switch→A palette=22/section cut=9, switch→B palette=0/section off (both restore); serialize→
  clear→hydrate identical (`§HIST_HYDRATE`); DOM sibling tick renders+clicks. **NEXT once stack lands: rebase #215
  onto fresh main; then PR #4 (KNOB) + PR #6 (combine) below.**

WORKTREE + LIVE TEST (still on disk):
- Worktree `/tmp/wt-field` (branch `feat/history-field-sniffer`) has all the #213 code.
- Localhost: `python3 -m http.server 8126` serving `/tmp/wt-field`; Hospital = `viewer/viewer.html?db=buildings/
  Hospital_extracted.db` (local DBs symlinked from `bim-ootb/viewer/buildings/`, split meta+geo).
- Whitebox driver template: `/tmp/wt-field/drive_whitebox.js`. Puppeteer chrome at
  `/home/red1/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome` (set PUPPETEER_EXECUTABLE_PATH,
  `--use-gl=swiftshader --enable-unsafe-swiftshader --no-sandbox`).

## ▶ PRIMITIVES ALREADY BUILT (reuse — do NOT re-invent)
- `HistoryTap.currentView()` — stamp a moment's full look (ghost/xray/cam/section/palette via `field()`s).
- `HistoryTap.applyView(view, label)` — restore a look (RESTORE round-trip proven, W-SECTION-RT / W-BAR-RESTORE).
- `HistoryTap.combineViews(a,b,…)` — vector UNION (orthogonal fields never collide → the color⊕section combine, PR #6).
- `HistoryTap.field(name, read, write)` — one symmetric line per restorable act.
- `HistoryTap.sniff(true)` — total zero-wire recording from the §-stream (deny + lifecycle filtered).

## ▶ THE TASK — branch TREE in `common/history_bar.js` (VIEWER-scoped; ERP uses its OWN idmp_history.js)
Today the bar is LINEAR: `_stream[]` + `_cursor`; `push()` after an undo TRUNCATES the forward tail (the wipe).
Turn that into a tree, minimal + reversible:
1. **Fork-don't-wipe.** In `push()`, when `_cursor < _stream.length-1` (you went back, then acted), DON'T truncate —
   record the abandoned tail as a SIBLING branch hanging off the fork node. Model: each node keeps `children[]`;
   the "current line" is the path from root → active tip. Rides the same idea as the signed hash-chain (chain → DAG).
   Keep it cheap: a branch forks a PARENT POINTER, it does not copy entries (~159 B/node, see §LOCKED #4).
2. **Bar shows siblings.** At a fork, render the sibling branches (a small tick/label off the main line; double-tap
   bloom can label them "universe B"). Mobile = linear default, expand on demand. Reuse existing dot/chip/bloom render.
3. **Switch = restore.** Clicking a branch tip walks to it and `applyView(tip.view)` → the scene returns as that
   universe looked (works today — restore is proven). Switching universes is just restore down a different path.
4. **Persist** the tree shape into the existing per-building persisted log (HISTORY_PERSIST_RECALL spine) so universes
   survive reload — additive to the current serialization.

## ▶ INVARIANTS
- **NO merge in the bar.** Branch + switch + (later) cherry-pick/combine ONLY. True conflict-merge stays the SUBSTRATE's
  job (signed op-log + sync-FSM). See HISTORY_KNOB_SIGNAL_TAP.md §LOCKED-BRANCH (the Pareto case is settled).
- **VIEW restores, MODEL replays.** View-state (the stamp) re-applies; signed kernel ops (GRID_MOVE) still go through
  `KernelOps` undo/redo. Don't snapshot geometry.
- **Shared-bar caution.** `common/history_bar.js` is shared in principle, but ERP runs its OWN `idmp_history.js` — so
  the tree change is effectively viewer-scoped. Still: keep `push/undo/redo/jumpTo` signatures intact (scene.js,
  navigate_find.js, panels.js depend on them).

## ▶ WITNESS (whitebox §-log — the user's REQUIRED proof style; mirror drive_whitebox.js)
On live Hospital, drive a REAL fork: open → pick A → (go back) → pick B (forks universe) → confirm the §-log shows
BOTH tips survive (no wipe), then switch to universe-A tip → `§EVT RESTORE keys=…` re-fires + the scene matches A.
Dump the tree shape (`§PROOF tree=…`). Save to a log, READ it, present the §-lines. PASS = both universes exist +
switching restores each. NO boolean-only asserts — the §-lines are the evidence.

## ▶ AFTER THIS (queued)
- **PR #4 — the KNOB UI ✅ DONE (witnessed, commit 54afaeb on `feat/history-branch-tree`/PR #215).** 5-stop dial
  Off·Low·Mid·High·Max (default High): TURN=breadth (drag/tap, per-stop §-net ladder low⊂mid⊂high⊂max), PRESS=richness
  (long-press → dot→chip, unified w/ bloom), SOUND=pitched detent (∝ breadth, mute-aware). Legacy all/doc/off→
  high/mid/off. Witness `drive_knob.js`→`knob.log`. **REMAINING for a follow-up:** thumbnail (3rd richness level,
  desktop-only) is deferred/stubbed; max≈high+picks (genuine "firehose" = the sniffer, separate); EXPAND the breadth
  vocab to SECTION/PALETTE/SUNGLASS/STOREY_SELECT/CLASH_* as those start emitting through the gate.
- **PR #6 — combine across branches ✅ DONE (witnessed, commit c434e9b on PR #215).** Cross-branch "bring into
  current ⤵": VIEW combine = union the donor's delta-vs-fork view-fields into the current look (`combineViews`,
  delegated to `_cfg.combine`); MODEL cherry-pick = replay the donor's signed op (`_cfg.cherryPick` → KernelOps).
  Gesture on a sibling ⑂ tick: tap=switch · long-press/right-click=bring-into-current. Witness `drive_combine_branch.js`
  →`combine_branch.log`: `after-combine palette=18 section.on=true` (BOTH land), tree=`*base(A-color | *B-section(*⊕
  A-color))`, A & B intact. **REMAINING:** model cherry-pick wired but NOT live-witnessed (needs real grid ops);
  conflict-resolution UI deliberately deferred (substrate's job, NO 3-way merge in the bar).
- **iDempiere port** — `prompts/HISTORY_TAP_TO_IDEMPIERE.md` (held until the ERP UI surface unfreezes).

## ▶ MASTER SPEC
`prompts/HISTORY_KNOB_SIGNAL_TAP.md` — all §LOCKED decisions (FIELD/SNIFFER/KNOB/BRANCH) + build order. Read it first.

## §THREADS — category / element threads on the dotline, scoped undo, ERP document threads (SPEC, red1 2026-10-02)
red1's words: *"history of a particular category? Ie user may do many things at same time, but does not want to undo
the others. Just that particular wall adjustment with col/beam shaping"* · *"double click a '+' expands its timeline
according to type"* · *"touch one category line, hiliting it blue glowing thread and then UNDO/REDO will travel along
that which is hilited"* · *"Wouldn't this be a killer even in the ERP part? Where we traverse a document instead of
another that was in between?"* Status 2026-10-02: SPEC ONLY. Nothing built. Verified first: no per-feature revert
exists in `modeller/` or `common/` (grep `deleteFeature|revertFeature` = 0 hits), and history is linear apart from the
fork-don't-wipe tree above.

**Doctrine: ONE log, many VIEWS.** A thread is a filter over the one signed op-log, never a second log. A scoped undo
APPENDS a reverting step (like `git revert`) and never erases anything, so `verifyChain` stays ok.

**Abstraction:** `common/history_bar.js` stays app-agnostic. Each host passes ONE function, `categorize(entry) →
[category, …]` (and optionally `elementOf(entry) → id`). Modeller maps its op types (`modeller_history.js` OP_TYPES:
GEOM_GRID_MOVE/STR_WALK_EDIT → Grid/Structure, DISC_WALK/MEP_REROUTE → MEP, GEOM_OPENING/CUT* → Openings, …), Viewer maps
view/pick/schedule, ERP maps document types. Keep it to 5–7 categories. A gesture touching several categories (a wall
move + its riding door + re-routed pipes) is tagged in EVERY one it touched; reverting it from any thread reverts the
whole gesture.

**UI:** the main line stays chronological. Beside it go chips `+ Walls (4)` etc. Double-click a chip (tap on touch;
long-press is already taken by cherry-pick) to expand that category's strip under the line. A second level,
`+ Wall #110`, shows one element's thread. Tap a strip and it GLOWS blue, and the badge **"Undo: Walls only"** shows. While
the badge shows, Ctrl+Z / Ctrl+Y travel along the glowing thread only. Exit by tapping it again, pressing Esc, or
starting any new edit (auto-exit, so the user can't forget the mode is on).

**Dependents (the hard part):** a scoped revert may leave later work leaning on it (a door slid on that wall,
pipes re-routed around it, a column added for its span). Use the existing relationship links (host/rider,
GEOM_CUT_MOVE, grid span, re-route source) to list them. The user then either reverts them too, or gets a refusal
that names them. Never a silent break.

**ERP (pointer in `AGENT_QUEUE.md`):** tap a document (e.g. a Sales Order) and its own thread glows: created → lines
→ completed → invoiced → paid, skipping the documents touched in between. VIEW first. Scoped undo maps to the
BUSINESS action, never deletion: Draft → revert field changes; Completed/Posted → **Void / Reverse-Correct**, creating
the reversal document, which becomes the thread's next step. Dependents too (invoice→order, payment→invoice):
cascade or a named refusal. Cross-app: a Modeller edit → its VO on the Project Order (§S9) → that PO's purchase
orders, shown as ONE thread, because it is one signed log.

**Build order (safest first), each RED-first with `§THREAD` lines:**
1. Category + element threads as READ-ONLY filters (chips, strips, glow, jump-to-view). No log change.
   Witness: chip counts == entries per category in the log; expanding a strip lists exactly those, in log order;
   a multi-category gesture appears in each.
2. Scoped undo/redo along a thread in the Modeller, with the badge, auto-exit and dependency check. Witness: an
   interleaved session (wall A, MEP walk, wall B, insert) → scoped undo on Walls reverts B, then A, and the walk
   and insert stay byte-identical; a dependent is refused by name or cascaded; verifyChain ok; global undo still
   works after exit.
3. ERP document threads: view first, then scoped undo mapped to Void/Reverse-Correct for completed documents.

### §THREADS-IMPL — 2026-10-02 (build notes for steps 1+2, written BEFORE the code; bim-ootb `feat/history-threads`)
**Measured first:** the Modeller never MOUNTS the shared dotline. `modeller_history.js` configures `HistoryBar` but nothing
calls `HB.open()`; the only visible history is `#hist-slider` (`modeller.html` `#hist` row). So "chips beside the dotline"
starts by mounting the bar in a new `#hist-dots` host just above the slider row (pointer-events only on the bar itself).
The Viewer mounts it already; ERP does NOT include `common/history_bar.js` at all (`grep -rl history_bar erp/` = 0 files;
ERP runs `idmp_history.js`), so "ERP unchanged" is structural, and the ERP history witnesses are run as a control.

**Hook contract (`common/history_bar.js`, all optional):** `configure({ categorize(entry) → [cat…], elementOf(entry) →
id | [id…], elementLabel(id) → string })`. Absent `categorize` ⇒ no thread code path runs: no container, no listener, no
`_render` change (proved by rendering the OLD and NEW file side by side with the same entries and comparing the bar's
`outerHTML` hash). Read API: `threads()` → `{cat: [seq…]}` over the ACTIVE LINE in log order; `threadEntries(cat, el)`;
`setScope(cat, el) / getScope() / clearScope(reason)`. Scope exits on: tap the glowing strip again, Esc (capture listener,
installed only when `categorize` is configured), or any `push()` not flagged `scoped:true` (auto-exit).

**Category map (Modeller, from `modeller_history.js` OP_TYPES + the element's own class in the signed log — 7 categories).**
Each op of a node is classed separately and the node is tagged with the UNION, so a multi-op gesture lands in every thread
it touched. The class of a transformed element is read at push time from its own `GEOM_INSERT` row (`params.ifc_class`, or
`params._dw` ⇒ walked MEP), never guessed:
| category | ops / element classes |
|---|---|
| Grid/Structure | `GEOM_GRID_MOVE`, `STR_WALK_EDIT`, `GEOM_INSERT` with `spanSplit`; transforms/deletes of Column/Beam/Slab/Roof/Stair/Member/Footing/Plate/Railing/Ramp/Pile |
| Walls | transforms/deletes of `Ifc*Wall*` |
| Openings | `GEOM_OPENING`, `GEOM_CUT`, `GEOM_CUT_MOVE`, `GEOM_CUT_RESIZE`; transforms/deletes of Door/Window/Opening |
| MEP | `DISC_WALK`, `MEP_REROUTE`, any node a re-route rode (`onRows/offRows`); transforms of `_dw` fixtures or Flow/Pipe/Duct/Cable/Sanitary/Light/… classes |
| Inserts | a fresh catalog `GEOM_INSERT`; transforms of Furnishing or catalog inserts (no `ifc_class`) |
| Shapes | `GEOM_EXTRUDE(_POLY)`, `GEOM_SWEEP`, `GEOM_LOFT`, `GEOM_REVOLVE`, `GEOM_FILLET*`, … and transforms of those solids |
| Other | anything not above (logged `§THREAD_CAT_OTHER`) — `BUILDING_OPEN` has no category |
`elementOf` = the `parent` of every NON-induced row (the user's own targets); a fresh insert/solid = its new row id.

**Step 2 — scoped undo = an APPENDED inverse (git revert), through `commitGesture`.** Only ops the fold composes
additively are invertible by appending (`bonsai_kernel.js` foldChainToScene `moveBy`: GEOM_MOVE dx/dy/dz SUMMED, GEOM_ROTATE
drot SUMMED, GEOM_SCALE fx/fy/fz MULTIPLIED; `cut_move.js netOverrides`: GEOM_CUT_MOVE summed, GEOM_CUT_RESIZE multiplied).
Inverse = negate / reciprocal, all rows of the gesture in ONE `commitGesture` (one gesture = one step; the revert node carries
`revertOf`). Every other op type (INSERT, DISC_WALK, CUT, EXTRUDE, GRID_MOVE, STR_WALK_EDIT, DELETE, a node a re-route rode)
⇒ REFUSED, logged `§THREAD_UNDO_REFUSE reason=not-invertible-by-append type=…` — no flag flip is used as a substitute.
Scoped redo = append the original rows again (another gesture). The log is only ever appended; `verifyChain` must stay ok.

**Dependents — ONLY relations the code already records** (a LATER, still-applied, not-yet-reverted node on the active line
that touches any of these is a dependent of target T):
- R1 host/filling — `swXEdges.fills` (the `SdgCascade.ridersFor` source): elements linked by a fills edge to any T element.
- R2 cut — `GEOM_CUT` rows whose `parent` is a T element: a later `GEOM_CUT_MOVE/RESIZE` on that `cutId`, or a later `GEOM_CUT` on a T element.
- R3 cascade rider — a later row with `params.induced` whose `parent` is a T element (a later gesture dragged T's element).
- R4 grid-span column add — a later `GEOM_INSERT.params.spanSplit` whose `girder`/`srcGuid` is the guid of a T element.
- R5 MEP re-route source — a later node whose `offRows` supersede rows T wrote (`ids ∪ rows ∪ onRows`).
Not tracked in the log: a disc walk's route vs the walls it walked past (`§THREAD_DEP_UNTRACKED kind=walk-vs-host`, logged,
not invented into a rule). Dependents present ⇒ refused with every dependent NAMED (`§THREAD_UNDO_REFUSE dependents=…`) and
a Cascade button; Cascade = inverses of the dependents + T in ONE gesture. Falsifier: `window.__threadsSkipDepCheck=true`.

### §THREADS-STEP1 — RESULT 2026-10-02 (bim-ootb #1807 + follow-up; red1 scope cut the same day)
**red1, 2026-10-02:** *"I think we scope just that category scrubber will do. The rest allow time to ponder a better shape."*
So step 1 is the whole shipped feature: a READ-ONLY category scrubber. The glow badge reads **"Viewing: <Category>"** (the
first ship, #1807, said "Undo: Walls only" — a step-2 promise on a read-only surface; replaced in the follow-up). While a strip
glows, **‹ ›** (and ←/→ on the focused bar) step the view cursor through that thread's entries only (`§THREAD_SCRUB`).
Also shipped: Modeller `restoreView` = jump-to-view (a dot / ‹ › step selects that moment's own targets and frames them,
`§THREAD_VIEW`, selection + camera only). Two defects the witness caught on the way: an empty strips row (flex-basis 100%)
widened the bar across the canvas and ate wall clicks; the §S8 Δ pin (fixed, z 9998) covered ‹ › once a jump selected an
element → bar host z 9999 + opaque backing. PRs bim-ootb **#1807** (step 1), **#1812** (Viewing/scrub/jump), **#1815** (backing),
all squash-merged; LIVE sw modeller **v76**, viewer **v1458**. **W-HISTORY-THREADS 10/0 vs LIVE** (Duplex: wall #112 + 2 riders,
wall #81, ELEC walk 102 rows, door insert #303 → chips Walls 2 · Openings 2 · MEP 1 · Inserts 1 == independent kernel_ops count;
scrub visited line idx [2,1,2] skipping walk + insert; jump |target−centre| = 0). Witness `bim-ootb
modeller/tests/witness_history_threads.js` (RED-first on LIVE main: no chips; then on LIVE #1807: H5/H5b RED on the old badge). Numbers are in the PR bodies and the run logs; the H8 control proves the Viewer bar is byte-identical
without the hook (outerHTML sha1 `7a37d4469bd7` old = new, §-line sequence `07e3e970f6dc` old = new). ERP does not load
`common/history_bar.js`.

### §THREADS-STEP2-HOLD — 2026-10-02 (⏸ red1: ponder a better shape)
Branch `bim-ootb wip/history-threads-scoped-undo` @ `034999b7` — pushed, NO PR, NOT merged. Contains: appended-inverse scoped
undo/redo (MOVE/CUT_MOVE/ROTATE negated, SCALE/CUT_RESIZE reciprocal, one `commitGesture` per step, nodes tagged
`scoped/scopedKind/members`, reverted-ness derived from the line), R1–R5 dependents with refuse-by-name + "Undo all" cascade,
`doUndo/doRedo` routing while a thread glows, witness `witness_history_scoped_undo.js`.
**Proven (local only, never LIVE):** W-HISTORY-SCOPED-UNDO 7/0 — Duplex A move → ELEC walk → B move → insert → door-on-B move:
Ctrl+Z on Walls refused `dependents=1 ["Move Door #74" (seq 6) ← R1 host/filling (rides Wall #111)]`, 0 rows added; Undo all
→ one gesture of 4 rows, B + riders + door at pre-B residual 0.00e+0; walk+insert 103 rows/meshes hash unchanged; A reverted
residual 0; every pre-existing row byte-identical (306→313 appended only); verifyChain ok; Ctrl+Y re-applies; Esc + global
Ctrl+Z undoes the last gesture. Falsifier `THREADS_SKIP_DEPCHECK=1` → S1/S2 RED (door left 0.2 m off).
**Unproven / known open:** (1) regression on that code: W-MODELLER-GIT-HISTORY **6/2** (G5/G6 branch switch leaves extra rows
active) — cause not found; (2) only additive ops are revertible, so the MEP/Inserts/Grid threads always refuse; (3) a walk's
route vs walls is not a logged relation (`§THREAD_DEP_UNTRACKED`), so a scoped wall undo after a walk does not re-route;
(4) the shape question red1 is pondering — append-inverse vs flag-flip vs a branch — is not settled.
