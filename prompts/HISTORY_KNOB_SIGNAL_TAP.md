# ⚠ DO NOT REMOVE — History granularity KNOB via the §-log SIGNAL TAP
# Scope: DISCUSS-FIRST. A lateral re-think of HOW the history bar learns "what the user did".
#        Today it's INSTRUMENTED (each action calls push()) — that's why X/C aren't recorded (they never
#        emit). The idea: don't instrument actions, TAP the one stream that already carries everything —
#        the §-log — and govern it with a continuous granularity KNOB. Investigate + decide BEFORE building.
#        Whitebox §-log is the witness; read the log before concluding. Edit shipping code ONLY in
#        /home/red1/bim-ootb/. Companion to prompts/HISTORY_PERSIST_RECALL.md (the persistence spine, BUILT).

## ▶ THE MOTIVATION (user, 2026-06-08) — separation of concern
"I'm motivated if it can reduce intrusion — reading deeply into other code — whereas just reading the
log is clean classic separation of concern." The history bar should be an **OBSERVER of an existing
event stream**, NOT a thing wired into every feature's internals. Reading the §-log = the seam is already
there; the bar couples to NOTHING.

## ▶ THE INSIGHT (banked from §PARKED in HISTORY_PERSIST_RECALL.md)
- The pipe already exists: the **§-log stream**. The Log Mandate forces every action to emit a `§…` line.
  Confirmed pervasive (extracted this session): `§KBD_ROUTE` (×11, incl. Alt+X envelope, Alt+Z xray),
  `§FOCUS_ELEM`, `§FILTER_*`, `§PHASE_LENS`, `§ROOM`, `§XRAY_*`, `§MAT_SELECT`, `§NAV_FIND_*`, …
- **The granularity KNOB = how WIDE a §-pattern net you cast** over that stream:
  - low  → `§KERNEL_OP` / `§BUILDING_OPEN` only (milestones)
  - mid  → + `§FOCUS_ELEM`, `§FILTER_*`, `§PHASE_LENS` (navigation)
  - high → + `§KBD_ROUTE`, `§XRAY_*`, `§MAT_SELECT` (toggles/aids)
  - max  → nearly every `§`
  Continuous dial over a signal — NOT the brittle allow/deny whitelist.
- **Dissolves the toggle problem:** X (`§KBD_ROUTE Alt+X → ghost-xray`) and C already print §. Tap →
  captured for FREE, zero wiring. Every FUTURE feature too, the moment it logs a §.

## ▶ WHY THIS IS THE CLEANER ARCHITECTURE (the SoC case)
- **Instrument-each-action** (today): N coupling points; the bar must know every feature; new features are
  forgotten (the X/C gap); editing a feature can break history. High intrusion.
- **Tap-the-signal** (proposed): ONE observer on ONE stream; the bar knows NOTHING feature-specific; new
  features appear automatically. The §-log is the published interface; the bar is a subscriber. Classic SoC.

## ▶ THE TWO-TIER MODEL THIS IMPLIES (don't collapse them)
- **Kernel-op channel** (structured `kernel_ops`, has replay data) → the REPLAYABLE / undo spine. KEEP
  (already BUILT + witnessed in HISTORY_PERSIST_RECALL.md — persist, recall, chain-verify).
- **§-stream tap** (broad, zero-instrument) → the READ-ONLY "what did I do" net, governed by the knob.
  A §-scraped entry is a breadcrumb (often no reverse payload) — read-only by nature, which is fine: most
  of the value is remembering, not reversing.

## ▶ HONEST CONS — settle these in the discussion (NON-INVENT: the § line IS the source)
1. **Brittle parse.** § lines are human prose, not an API — reword a log and the net misses it. Labels are
   scraped from text. → Mitigation: a one-line convention `§EVT kind|label[|payload]` that actions opt into
   (still just a console.log, NO event bus, NO intrusion) so the tap parses a STABLE shape. Decide: pure
   prose-scrape (zero change, fragile) vs §EVT convention (tiny per-action change, robust). 
2. **Capture mechanism.** Wrap `console.log`? A dedicated `§`-sink the logger also calls? Decide the tap point.
3. **Perf.** Inspecting every console line — cheap (lines already print), but confirm under stream/idle gate.
4. **Restore.** §-entries are read-only breadcrumbs; clicking → read-only recall (the Q1 display) / open the
   surface. Reversible actions still go through the kernel channel.
5. **Noise floor.** Even "max" needs a tiny deny (render-tick, hover, `§IDLE_GATE`). The knob sets the net;
   a small deny removes pure spam.
6. **The knob UI.** A literal slider? The existing all/doc/off + this/all toggles? JSON-editable net config
   (settings_editor.js, §LOCKED-IV in the persistence spec discussed this)? Decide everyday vs power-user.

## ▶ RELATED, MAYBE BIGGER — restore FIDELITY via a per-step SCENE-STATE SNAPSHOT (user, 2026-06-08)
Observed: replaying a step replays the action but NOT the x-ray / Alt-X view state that was on at the time —
so the scene doesn't come back as it looked. The KNOB does NOT fix this (it only records x-ray as an event
breadcrumb). The fix is the user's "snapshot whole scene" instinct — but snapshot **STATE, not pixels**:
- Attach a tiny state vector to each recorded entry: `{camera:{pos,target}, xray, ghost, isolation, discipline,
  section, …}`. On jump/restore, RE-APPLY the vector → scene returns exactly (x-ray/envelope included).
- Cleaner than feature-replay: no feature needs to be individually reversible — you re-apply a captured snapshot.
- Scope: VIEW state only. MODEL mutations (GRID_MOVE) still use the signed kernel replay (can't snapshot geometry).
- Distinct from THUMBNAIL: the vector RESTORES; the thumbnail (pixels) only helps RECOGNISE. Want both.
- Two orthogonal axes to decide together: KNOB = breadth (which events enter); SNAPSHOT = depth (how faithfully
  a step restores). The snapshot may be the bigger UX win.

## ▶ OPEN QUESTIONS FOR THE DISCUSSION (decide, then build)
0. Add a per-step SCENE-STATE SNAPSHOT (view-state vector) for faithful restore? (likely YES — see above)
1. Pure prose-scrape vs the `§EVT kind|label` convention (fragility vs a tiny opt-in touch per action)?
2. Knob shape: continuous slider, or N named stops mapped to §-pattern sets?
3. Does the §-tap REPLACE the manual emit (push) for the read-only tier, or run ALONGSIDE it?
4. Where does the knob live — the bar, Settings JSON, both?
5. Default knob position per surface (viewer vs ERP vs mobile)?

## ▶ STARTING POINTS (grounded this session)
- § vocabulary census: `grep -rhoE "§[A-Z_]+[A-Za-z_]*" viewer/*.js erp/*.js | sort | uniq -c | sort -rn`.
- The persistence spine + this/all union + day-scrub + footprint are BUILT (PR branch feat/history-persist-recall).
- The 18 kernel-op types + 16 toggles enumeration is in HISTORY_PERSIST_RECALL.md §LOCKED-II/§PARKED.

## ▶ DELIVERABLE
Discuss the open questions → pick the model (lean: §EVT convention + a knob over §-pattern sets, §-tap as a
read-only tier ALONGSIDE the kernel spine) → spec → build → witness. The pitch: history that listens to one
clean signal, casts a dial-able net, and couples to nothing.

## ▶ §LOCKED (decided + PROVEN with user 2026-06-08 — discuss phase closed for the FOUNDATION)
The model is chosen and the mechanism is built+witnessed (PR #205, bim-ootb `common/history_tap.js`):
1. **Sink = ONE function `S(tag,label,payload)`.** It keeps the existing `§…` console line AND feeds the tap.
   "Refactor the logging system" resolved to this: NOT 684 edits — one logger, ~15-20 history-worthy
   call-sites routed through it (the rest stay raw `console.log`; errors/no-ops must NOT enter history).
   Census fact: 684 raw `console.log("§…")`, 0 through any helper → there was no logger to refactor, only to add.
2. **Two ORTHOGONAL axes (don't conflate):**
   - **KNOB = breadth** — named stops `low/mid/high/max` over §-pattern SETS + a tiny noise deny
     (`RENDER_TICK/IDLE_GATE/HOVER/PANEL_BLUR/LOAD_FAIL` + intra-tag `pass-through|no-op|error|blocked`).
     Lossless: every event captured once, knob just re-filters. (Slider rejected — arbitrary §-tags have no
     real ordering; named stops mapped to sets is honest. Config lives in settings_editor.js JSON, §LOCKED-IV.)
   - **STAMP = depth** — every entry carries the AMBIENT view-state at capture, so "selected Door" remembers
     x-ray/bbox was on. Reduced FROM the same stream (the tap already sees Alt+X/Alt+Z fly past → mirrors them),
     zero feature coupling. Camera (NOT a stream event) via ONE optional `setViewProvider()` pull-hook. `seed()`
     primes initial ambient. **This is Q0 — "snapshot STATE not pixels"; a snapshot that omits ambient toggles
     is a label, not a snapshot.** Witnessed: select-while-xray-on → entry.view.ghost=true (W-TAP-KNOB DEPTH).
3. **RESTORE = re-apply, two tiers.** `registerApplier(key,fn)` + `restore(entry)` re-applies the view vector
   (round-trip proven W-TAP-RESTORE: stamp → diverge scene → restore returns xray+camera). VIEW state restores;
   MODEL mutations (GRID_MOVE) still go through the signed kernel replay — you can't snapshot geometry into a
   ~159B vector. §-tap breadcrumbs are read-only (no reverse payload) — they ANNOTATE, the kernel tier REPLAYS.
4. **Resource (measured, not asserted):** entry = 159 B (view, no cam) / 203 B (+camera) / kernel-op 180 B.
   400 entries/day × 30 days ≈ **1.9 MB (no cam) / 2.3 MB (+cam)** — KBs/day, still cheap. The ONLY thing that
   breaks cheap is PIXEL thumbnails (~5-15 KB ea, 50-100×) → which is exactly why thumbnails stay ephemeral/
   memory-only (HISTORY_PERSIST_RECALL §LOCKED-5) and the snapshot is STATE.

## ▶ §LOCKED-BRANCH (decided 2026-06-08 — the NEXT increment, build after the bar consumes the tap)
**Parallel branches WITHOUT merge-back is the Pareto leap. Merge stays the substrate's job — NOT the bar.**
Explored the value structurally; verdict held:
- **Why branch-CAPTURE (undo-TREE, fork-don't-wipe) is the cheap 80%:** the pain = "go back in time, do something
  else → forward history refreshes away" = linear undo DESTROYING the redo path. Fix = fork the abandoned future
  as a SIBLING. Rides the existing hash-chain (chain → DAG is natural; branch = node w/ two children). Still cheap
  (a branch forks a parent POINTER, doesn't copy entries). Composes free with §LOCKED #3: switch universe = restore
  that node's stamped view. Bar EXPANDS to show parallel universes (undotree/undo-tree precedent; mobile = linear
  default, expand on demand).
- **Why MERGE-back has little marginal value (the 3 divergence cases):** (1) exploratory VIEWS → you compare/switch,
  merging two cameras is meaningless; (2) design ALTERNATIVES → mutually exclusive, you pick a winner, and conflict
  is the POINT not a problem (conflict-resolution UI actively fights this dominant case); (3) DISJOINT edits (roof in
  A, basement in B) → the ONLY real merge case, but it's a MULTI-AUTHOR pattern, and your substrate ALREADY merges
  there (signed op-log + sync-FSM + rebase — see DistributedERP). Putting conflict-merge in the history-bar UI
  duplicates the substrate at the wrong tier. Cost/frequency = textbook bad Pareto: highest cost, lowest frequency.
- **CHERRY-PICK = the cheap escape valve for case (3)** (~90% of merge's residual value at ~10% cost): kernel ops
  are signed+replayable, so grafting one op onto another tip is just replay — no 3-way diff, no conflict UI.
  **Gesture (user's roof/porch example, confirmed):** branch A = roof (10 dots), go back to fork, branch B = porch.
  You're "checked out" on ONE branch (the bright line = destination you keep building); siblings are dimmer. To
  accept BOTH: standing on B, **right-click the DONOR tip — branch A's last dot** (the branch you are NOT on) →
  "Bring into current ⤵" = replay A's diverged ops onto B. Disjoint (roof≠porch) → clean. Granularity: right-click
  a TIP = whole branch; right-click a MID dot = just that op. Overlap (same element) → flag colliding op, offer
  skip/keep-mine/take-theirs PER OP (minimal — NO 3-way merge). Default target = current branch; offer "into NEW
  branch C" as a variant. Result keeps A and B intact as visible universes.

## ▶ §OPEN-MULTIUSER (raised 2026-06-08 — defer, but it's the same spine)
"Engineer B passes his history to Engineer A" — branches generalize from time-travel to COLLABORATION: B's branch
is just another universe A imports. Because the kernel ops are SIGNED + replayable and the tap stream is portable
text, handing over a branch = shipping a signed op-segment A cherry-picks/replays — IDENTICAL machinery to the
single-user cross-branch graft above, just authored by someone else. Likely ALREADY covered by the ERP deep-end
substrate (signed op-log + W-BLACKOUT rebuild-from-edges + sync-FSM rebase — see DistributedERP / project_erp_dr_tco,
project_erp_sync_fsm). ACTION when picked up: confirm the substrate's signed-op-segment handover == the bar's
cherry-pick path (it should), then the bar just becomes a VIEW onto a teammate's signed branch. Don't build merge;
build IMPORT-AND-CHERRY-PICK of a signed foreign branch.

## ▶ §LOCKED-FIELD — the elegant restore primitive (decided + PROVEN 2026-06-08/09)
The provider+applier-per-feature pair (PR #2) was per-feature COUPLING creeping back. Collapsed into ONE
symmetric primitive: **`HistoryTap.field(name, read, write)`** — capture = `read()`, restore = `write(v)`.
- Adding any restorable act = ONE line, ideally living IN the feature's own module (history couples to nothing).
- Insight: most view-acts are a COMMAND whose ARGS reproduce them — palette = one `tick` (`A.updateAmbience`),
  section = `{on,axis,cut}` (`toggleSection`/`setSectionAxis`/`updateSectionPlane(cut)`), ghost = `ghostXrayOn`+
  `toggleGhostXray`. The §EVT payload IS the recipe; the feature's own fn IS the interpreter.
- **COMBINE** = `combineViews(a,b,…)` = vector UNION. Orthogonal fields (color vs section) never collide →
  this is why "merge A's color + B's section" is effortless (the user's exact demo). Shared field = last-writer.
- Witnessed: W-TAP-KNOB DEPTH, W-BAR-RESTORE, **W-COMBINE** (color⊕section), **W-SECTION-RT** (cut=12.5 restored
  exactly — the bug where section captured only `axis` + force-applied is FIXED: now `{on,axis,cut}` + real setters).
- Fields wired so far: ghost · xray · cam · section · palette · **clash** (one symmetric line each in `universal_history.js`).
- **CLASH field ✅ DONE/LIVE (#346, viewer sw v666, 2026-06-17):** the clash dot used to restore only camera+ambient
  (no pair, no panel — user). `field('clash')` read()=inspected pair {a,b} by GUID (gated on `_clashRevealActive`
  so a stale idx never re-fires); write()= re-open the list from PERSISTED `_currentClashes` via `_revealClashes`
  (read-only re-render, NO re-detection) then `_flyToClash(idx)` (GUID-matched). `_flyToClash`'s recordEvent
  self-suppresses (applyView holds `isApplying()`). Rides the existing `_tapApply(entry.viewState)` path — no
  dispatch change. Witness `viewer/tests/poc_clash_restore.js` 6/6. **TEST CAVEAT (honest):** the witness proved
  the WIRING (pair stamped → write calls `_flyToClash` w/ matched idx + re-reveal + suppression) against STUBBED
  `_flyToClash`/`_revealClashes` (harness has no clash geometry); the actual mesh/panel RENDER reuses the
  existing live "click-a-clash-row" path (unchanged), NOT visually witnessed headless. COLD-reload (no clash
  detection run) can't reconstruct — `_currentClashes` must be live this session.

## ▶ §LOCKED-SNIFFER — record breadth is FREE; restore depth is one line (clarified with user 2026-06-09)
TWO different costs, never conflate (this was a recurring confusion — settle it):
- **Catch/record an event** = the §-stream ALREADY carries it (Log Mandate forces every act to print `§`). So the
  sniff RADIUS already covers ~ALL events with ZERO per-feature work. The fix to "cover more" is NOT wiring each
  act — it's ONE **log-sniffer**: wrap the logger, regex `§TAG`, early-reject the deny set (RENDER_LOOP/IDLE_GATE/
  SFX_NAV/no-op/error — the firehose seen in the Hospital log), feed a LIGHTWEIGHT breadcrumb (no view-stamp).
  ~20 lines ONCE, then every existing+future `§` is caught automatically. Guard against re-sniffing the tap's own
  `§EVT/§RESTORE` output (recursion).
- **Restore a state** = needs the feature's SETTER; a log string isn't executable → one `field()` line per
  restorable act (only the ~15–20 that hold state; navigation/noise need none). NOT derivable from the log.
- Net: recording = total + free (the sniffer); restoring = a short opt-in line where each feature lives.
  Don't aim for "all restorable" — aim for the significant state-holding set.

## ▶ §LOCKED-KNOB — Full/Half/Off toggle → a real multimodal KNOB (decided 2026-06-09)
The existing `_DEPTH_UI` 3-state cycle (all/doc/off) becomes a **5-stop dial: Off · Low · Mid · High · Max**,
default **High**. Rationale: Off→Max is a genuine MAGNITUDE (monotonic) — a slider/dot is the semantically
correct control; the old 3-way was a cycle precisely because it wasn't a clean magnitude. Three axes on ONE control:
- **TURN (drag the dot) = BREADTH** — how many entries enter history (the §-pattern net width). Tap still cycles
  one step (fast/mobile); drag jumps. Reuse the existing icon-slider row style (section/sunglass sliders, the
  `bim-panel` slider) — no new widget. Keep **Off** a visually distinct greyed end.
- **PRESS (depress the knob) = RICHNESS** — dot → chip → **thumbnail**. Gates the EXPENSIVE layer: thumbnails are
  desktop-only + ephemeral (`HISTORY_PERSIST_RECALL §LOCKED-5`), so press-to-enable is the right gate. UNIFY with
  the existing double-tap `§HIST_BLOOM` (don't make two "more detail" gestures) — press cycles the one richness
  axis. Mobile: press = no-op / just bloom (thumbnails are desktop-only anyway → aligns).
- **SOUND = SFX synth (FREE, already built: `§SFX_INIT sounds=16`)** — a short pitched detent-tick per stop, pitch
  ∝ breadth (encodes the value → eyes-free confirmation; reinforces turn=magnitude). Crisp tick per detent, NOT a
  continuous drone; optional sweep on release. MUST respect the global SFX mute (`v`/`§SFX_TOGGLE`) — silent when off.
- CAVEAT: the bar is SHARED with ERP. Going 3-state → 5-state must map the persisted `all/doc/off` onto the new
  stops and keep ERP working (off→Off; doc→~Mid; all→~High). Real PR with care, not a tweak.

## ▶ BUILD ORDER (sequenced — revised 2026-06-09)
- **PR #1 (#205, SHIPPED):** sink + knob-net + view-stamp + restore mechanism. Witnessed.
- **PR #2 (#207, merging):** restore-the-LOOK in the real bar (re-apply x-ray/bbox/camera on entry click). Witnessed.
- **PR #3 (IN PROGRESS):** `field()` primitive + section/palette fields + section-cut FIX + **log-sniffer**
  (recording goes TOTAL). Witnessed W-COMBINE / W-SECTION-RT. ← commit this now.
- **PR #4:** the multimodal KNOB (§LOCKED-KNOB) — 5-stop drag + press=thumbnail + pitched detents. ERP-mapping care.
- **PR #5:** undo-TREE capture (fork-don't-wipe) + bar expands to siblings + branch-switch = restore.
- **PR #6:** cherry-pick / combine across branches (the color⊕section gesture; combineViews already proven).
- **Deferred:** §OPEN-MULTIUSER import-of-signed-foreign-branch (B→A). NO conflict-merge in the bar, ever.

## ▶ §GAP-BAR-NEVER-CONSUMED-THE-TAP — audit 2026-06-16 (user: "make all follow the sniff log as I put down")
THE SNIFFER WAS BUILT BUT THE VIEWER BAR NEVER CONSUMED IT. The mechanism shipped (PR #205/#207/#213) and
`HistoryTap.sniff(true)` IS on (`universal_history.js:266`), so the §-stream is captured into `HistoryTap.all[]`
— but **nothing displays that list, and the bar still draws dots from the OLD explicit instrumentation.** This is
the exact intrusion the spec set out to delete; it silently regressed. Evidence (verified, not asserted):
- `common/history_bar.js` has **0** references to `HistoryTap` — the bar renders its OWN `_rootKids` tree, fed
  ONLY by 4 explicit `HB.push` calls in `universal_history.js` (`_recordOp` L55 pick+op, `pushView` L94, `recordEvent` L106).
- **TWO independent knobs** exist and disagree: the tap's `level='mid'` (`history_tap.js:39`) vs the bar's
  `_depth='high'` (`history_bar.js:92`). The user dials one, the other ignores it.
- `HistoryTap.history()` (the knob-filtered sniff list) is consumed by **nobody** in the viewer.
- SYMPTOMS this explains (all "wiring forgotten" failures the tap was meant to make impossible): clash dot silently
  bails at a `recordEvent` guard (`measure.js:782`→`universal_history.js:107-110`); X/C (`§KBD_ROUTE`) never recorded;
  the whole mid→high tuning (PR #335/#336) was spent on the explicit profile tier that this work makes vestigial.

### THE WORK — make the bar a SUBSCRIBER of the tap (read-only tier), keep the signed tier explicit
INVARIANT (§LOCKED two-tier — do NOT collapse): the **signed kernel-op channel stays explicit** (`_recordOp` for
GRID_MOVE/ELEMENT_PLACE etc. — they carry reverse payloads you cannot scrape from a log = the REPLAY/undo spine).
Those ops ALSO emit a `§`/`S()` so they appear as breadcrumbs in the one stream. Everything else (picks, Find/storey
nav, measure, clash, section, Alt-X/Alt-Z toggles) becomes a ZERO-WIRE breadcrumb the moment it logs a §.
1. **Bar consumes the tap.** `history_bar` (or the `universal_history` adapter) builds its read-only dots FROM
   `HistoryTap.history()` (knob-filtered), MERGED with the signed kernel-op entries on the same timeline (sorted by
   `t`). The bar stops minting read-only dots from per-feature pushes.
2. **One knob, not two.** Collapse `history_bar._depth` ↔ `HistoryTap.level` into a SINGLE dial (bar `setDepth` →
   `HistoryTap.setKnob`; one persisted key). The 5-stop §LOCKED-KNOB is that one control. Map the recent "default
   high" intent onto the tap's STOP sets, then DELETE the now-duplicate `PROFILES` breadth logic in `universal_history`.
3. **Retire the read-only explicit pushes.** `recordEvent`/`pushView` (and the pick branch of `_recordOp`) stop
   calling `HB.push`; the features just keep their existing `§…`/route through `S(tag,label,payload)`. Net deletion
   of coupling — measure.js/clash/section/navigate_find shed their `UniversalHistory.recordEvent/pushView` lines.
4. **Restore still via `field()`.** Read-only breadcrumbs annotate; clicking one re-applies its stamped view vector
   (`field()` already proven). No per-feature reverse code. Signed ops still replay through the kernel channel.
5. **Coverage falls out for free.** Clash, X/C, and every future feature dot the instant they log a § — no guard to
   bail, no forgotten wiring. Tune the DENY/LIFECYCLE floor against a REAL boot+session log (don't guess noise).

### WITNESS (whitebox §-log — drive a real sequence, the log is the proof)
On the live viewer headless: measure · inspect a clash · cut a section · Find→storey select · Alt-X envelope ·
Alt-Z xray — assert EACH leaves exactly one dot with ZERO per-feature `recordEvent`/`pushView` (grep the source to
prove those calls are GONE), the dot count tracks the SINGLE knob's breadth, and clicking a dot restores its stamped
look. Prove the signed GRID_MOVE still replays (kernel tier intact). Name the issue each assertion proves/disproves.

### §SESSION 2026-06-16 — THE SEAM ✅ DONE/LIVE (#340, sw v664, GH Pages) — bar subscribes to the tap + ONE knob
SHIPPED: `history_tap.historySince`+`onFeed`; `history_bar` one-knob (`_syncTapKnob`) + `fromTap` gate bypass;
viewer adapter `_drainTap` subscriber. X/C (§KBD_ROUTE) + every future § now dots from the stream, zero
per-feature wiring; signed/tree/ERP tiers untouched. Witnessed W-KNOB-ONE/W-DRAIN-XC/W-DRAIN-SKIP 9/9 (node,
`common/tests/witness_tap_subscribe.js`) + W-LIVE 6/6 (browser, `viewer/tests/poc_histbar_tap_subscribe.js`).
e2e GP.2 flake (CI building-db 404, same flake as #335/#336) passed on rerun. NEXT LEG (not this PR): full
retirement of the explicit read-only pushes (recordEvent/pushView) + the ERP leg (HISTORY_TAP_TO_IDEMPIERE.md).
Original spec below.

### §SESSION 2026-06-16 — THE SEAM (bar subscribes to the tap + ONE knob) — SPEC then build
Scope this session = the un-done integration step the audit names, done SAFELY on the shared file (additive,
no existing dot changes, restore/tree/ERP untouched). Full retirement of the explicit read-only pushes (step 3)
+ the ERP leg stay the documented NEXT leg — the seam goes in first, witnessed.
1. **ONE KNOB.** `history_bar.setDepth`/`configure` drive `HistoryTap.setKnob(_depth)` (off keeps tap level, the
   bar suppresses via `_on()`; low/mid/high/max map 1:1). The bar's `depthKey` is the SINGLE persisted source;
   the tap level is derived, never separately persisted. Kills "dial one, the other ignores it".
2. **BAR SUBSCRIBES.** Tap gains `historySince(t, extraDeny)` (knob-filtered crumbs with `e.t>t`, pure) + an
   `onFeed(fn)` observer (fires at the end of `feed`/`feedCrumb`). The viewer adapter registers `_drainTap`:
   on every § act it drains fresh crumbs whose tag is NOT in `_EXPLICIT_TAGS` (the op/pick/nav/detail tags it
   already pushes) into read-only `event` dots stamped with the crumb's view. So X/C (`§KBD_ROUTE`) + every
   FUTURE § dots for free; no double on already-pushed tags. Gated by `isApplying()` (no dots while scrubbing).
3. **GATE BYPASS.** Tap-sourced entries carry `fromTap:true`; `history_bar.push` skips the per-stop `significant()`
   gate for them (the knob ALREADY filtered breadth — this is the duplicate logic the spec retires, now dead for
   the read-only tier). `_on()` (off) still suppresses everything.
4. **Anti-recursion.** `HIST_TAP_DOT` added to the tap DENY set; adapter `_draining` re-entry guard.
WITNESS (node, on the REAL history_tap.js — `build/erp` style whitebox, §-log is the proof):
- **W-KNOB-ONE** — setKnob low vs high → `historySince` breadth differs (proves one dial governs the net).
- **W-DRAIN-XC** — `S('KBD_ROUTE','Alt+X → ghost-xray')` → observer fires, crumb present with `view.ghost=true`,
  re-drain at new HW excludes it (proves X/C dots from the stream, no per-feature wiring, no duplicate).
- **W-DRAIN-SKIP** — `S('PICK'…)`/`KERNEL_OP` excluded by `_EXPLICIT_TAGS` (proves no double + kernel tier intact).

### CAUTION
- Bar is SHARED with ERP (`HISTORY_TAP_TO_IDEMPIERE.md` is the ERP leg of this SAME unification — do them coherently).
- `sw.js` cache-bump + `?v=` on every touched file; sw.js is the conflict magnet (take higher, keep both precache hunks).
- This supersedes the read-only-tier half of `universal_history`'s PROFILES — verify nothing else depends on them
  before deleting (the `event`/`view`/`op` bucket significance moves into the tap STOP sets).

## ▶ BUG — back-arrow snaps forward instead of stepping back (diagnosed 2026-07-12, ✅ FIXED 2026-07-13)
User repro: press the ‹ back arrow once → instead of showing the older view, a NEW dot mints at the tip and
the scrubber ends up pointing at it (looks like "back produces a dot forward"). Manually clicking a specific
OLDER dot "works" — but only because that path masks the same bug, see below. Root-caused from a real
browser log (`§HIST_VIEWNAV`/`§HIST_PUSH`/`§HIST_TAP_DOT` sequence), not reproduced fresh — verify against
live code before landing the fix.

**Root cause — a gate asymmetry between `_drainTap` and `feedCrumb`, plus one missing DENY tag:**
1. `common/history_bar.js` `_viewApply(idx)` (~L275) drives `_cfg.restoreView(entry)` → `universal_history.js`
   `_restoreView` → `_tapApply` → `HistoryTap.applyView(view)`. Inside `applyView` (`common/history_tap.js`
   L136-147), each `field.write()` calls the REAL setter (e.g. `A.toggleXray()`), which itself prints a
   `§XRAY on=… ` line — while `_applyingView` (the `isApplying()` flag) is `true`.
2. That `§XRAY` line passes through the sniffed `console.log` → `feedCrumb()` (`history_tap.js` L105-112).
   **`feedCrumb` never checks `isApplying()`** — it queues the crumb into `all[]` and calls `_notify()`
   regardless of whether a restore is in progress. This is the asymmetry: `recordEvent()` in
   `universal_history.js` L110 explicitly gates on `isApplying()`; the generic sniffer path does not, even
   though the comment at `history_tap.js` L133-134 states the general contract ("must NOT mint a new dot
   during a restore… gate on isApplying()").
3. `_notify()` calls the subscriber `_drainTap()` (`universal_history.js` L315). It DOES check `isApplying()`
   (L317) and bails — correctly refusing to drain WHILE mid-restore. But it bails BEFORE advancing `_tapHW`
   (the high-water mark), so the queued crumb is never marked consumed — it just sits in `all[]`.
4. `applyView()` finishes, `_applyingView` resets to `false`. Back in `_viewApply`, `console.log('§HIST_VIEWNAV
   idx=… ')` fires (`history_bar.js` L282). **`HIST_VIEWNAV` is missing from `DENY_TAG`** in `history_tap.js`
   (L29-38) — every OTHER `HIST_*` control tag is denied (`HIST_PUSH`, `HIST_UNDO`, `HIST_REDO`,
   `HIST_TAP_DOT`, `HIST_DEPTH`) but this one was left out. So this line itself gets sniffed, `_notify()`
   fires again, and THIS TIME `isApplying()` is false → `_drainTap()` proceeds → drains the stuck XRAY crumb
   from step 2 → `HB.push()` mints a genuine new tip dot (`§HIST_PUSH n=110 idx=109`) → `_push()`
   (`history_bar.js` L205) sets `_viewCursor = _cursor` (the NEW tip).
5. Why arrow ≠ dot-click: `viewStepBack()` steps RELATIVE to `_viewCursor`; once step 4 silently snaps
   `_viewCursor` back to the tip, the next back-press steps -1 from the (moved) tip again — net effect looks
   like back-arrow can't make progress / "produces a dot forward". `viewJumpTo(idx)` (dot click) sets
   `_viewCursor` to an ABSOLUTE idx and the scene already shows the correct restored look, so the same
   tip-snap happens invisibly right after — it only *looks* like dot-click is unaffected.

**Fix applied (both in `common/history_tap.js`, bim-ootb branch `fix/history-viewnav-drain-forward-snap` @
`2d4acb4`, committed locally — NOT pushed, PUSH PAUSE standing):**
1. `feedCrumb()` (L105) — added `if (_applyingView) return;` as the first check, alongside DENY_TAG/LIFECYCLE/
   NOISE_LABEL, so restore-driven setter logs never enter `all[]` in the first place (symmetric with
   `recordEvent()`'s existing gate).
2. `DENY_TAG` (L29-38) — added `HIST_VIEWNAV: 1`, closing the one gap in the otherwise-complete `HIST_*`
   control-tag denial (anti-recursion for the sniffer, same intent as the other 5).
Both small, additive, non-invasive — no restructuring of the tap/bar contract.

**Witnessed** — `witness_history_viewnav_backarrow.js` (new, same branch/commit), real `#hist-back` DOM click
+ real `A.toggleXray()`, no fabricated results (only the "long-session filler" is synthetic §-lines, padding
past `feedCrumb`'s unrelated last-3 dedupe window — documented in the script header; without that padding a
short synthetic session masks the bug the same way an early dot-click can). Ran BEFORE (git-stashed back to
the unfixed file) and AFTER, same script:
- **BEFORE (unfixed, `witness_BEFORE.log`):** 1st back-press → correct `§HIST_VIEWNAV idx=4`, but immediately
  followed by `§HIST_PUSH n=7 idx=6` + `§HIST_TAP_DOT tag=XRAY` (the bug). 2nd back-press → `idx=5`, i.e. it
  moved to (new tip − 1), not (1st idx − 1) — the exact "can't make backward progress" symptom reported.
  `RESULT: FAIL`.
- **AFTER (fixed, `witness_AFTER.log`):** 1st back-press → `idx=4`, no push/tap_dot follows. 2nd back-press →
  `idx=3` (monotonic, `idx1-1`), no push/tap_dot follows. `RESULT: PASS`.
Logs: `/tmp/wt-hist-viewnav-fix/witness_{BEFORE,AFTER}.log`. Verified on localhost (`python3 -m http.server
8955`), not CI, per PUSH PAUSE. Worktree not yet pruned (branch has unpushed commits).

**⚠ STATUS CORRECTION 2026-07-20 — still NOT on `main`, one week after "✅ FIXED":** the branch WAS later
pushed (`origin/fix/history-viewnav-drain-forward-snap`, commit `2d4acb4` + a companion cache-bust `4be8cb5`,
2026-07-16) — push pause lifted 2026-07-17 so that part happened — but no PR was ever opened and it was never
merged. `main` has since moved 161 commits ahead of the branch's base; `git merge-base --is-ancestor 2d4acb4
main` → **NOT an ancestor**. `common/history_tap.js` itself hasn't been touched on `main` since before this
branch was cut, so the real fix is still just the same clean 2-line diff (`_applyingView` guard in
`feedCrumb()` + `HIST_VIEWNAV` in `DENY_TAG`) — cherry-picks with zero conflict. This is almost certainly what
the user means by "world/history broken again": the bug was correctly diagnosed and fixed here, but the fix
never reached the code users actually run. See `RESUME_WORLD_HISTORY_DEDUP_RESTORE.md`'s 2026-07-20 section
for the cross-file pattern this is one instance of.
