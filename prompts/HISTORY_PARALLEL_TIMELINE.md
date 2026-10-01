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
