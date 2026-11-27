# ⚠ DO NOT REMOVE — LOAD-PATH / 4D-5D FILM BEATS: REVIEWER RESUME (written 2026-09-16 by the Fable reviewer session).
Scope: you are the REVIEWER, not the executor, of MEP_CLASH_REVEAL_MOVIE.md §129 (load path, ledger ticker, cost
odometer, info card — all under the Measure/4D-5D toggles). Read the log after every run (CLAUDE.md Log Mandate).
Findings are yours to report; fixes go to a builder agent; bakes go to the bake session; red1 rules on looks.

## ROLE AND STANDING RULES (red1's, verbatim in spirit)
- Reviewer: for whatever the builder or bake session reports, open the .log it names under /tmp/wt-loadpath/out/ and
  check each witness line as the spec defines it. A witness that never failed proves nothing: every witness has a control
  tap that must FAIL on its own line only. Never judge from frames; every claim traces to a § line you read. The user's
  eyes are the final arbiter of LOOK rulings — when a witness PASSes and red1 sees otherwise, the WITNESS is wrong
  (happened three times: it read a flag, not the frame).
- One bake at a time on this machine; bakes run under /tmp/wt-bake-perf/bake_scope.sh; fresh --port per run; rm the
  profile dir after; never put a kill pattern in a command that contains it literally.
- Commit only when red1 says. Update LARGE_DB_BAKE.md's ONE-LINE STATE at the end of each turn, nothing else in it.
- Builder agents (Sonnet, Agent tool, model "sonnet") die of context at ~900k tokens: brief them LEAN (grep/sed ranges,
  no log pasting), give them ONE round at a time, spawn a fresh one when a report gets long. They never bake, never
  commit, never touch /tmp/wt-storey-cut or ~/bim-ootb. They must NOT edit the worktree while bakes read it — hand them
  spec+dry-run work and say "GO" after the bakes.
- Bake session = the peer Claude session "red1-a8" (ListAgents; SendMessage to `red1-a8 [ref]`). It runs the exact
  command you send, points you at logs, copies to ~/Downloads only on your word. red1 sometimes assigns it directly.

## WHERE THINGS ARE
- Spec: /home/red1/bim-compiler/prompts/MEP_CLASH_REVEAL_MOVIE.md §129 (§129.1 load path incl. CHAIN MUST DESCEND and
  LOOK v10; §129.2 ledger; §129.5 cost; §129.6 sighting round 2; §129.7 round 3 rulings + item 8 pie panel; §129.8
  shine-through, unoccluded visibility, two stacks far→near, ladders beside stacks, 4b HUD off/faded, item 6 info card;
  §129.9 round 16: disentangled hud.fiveD box, draw-call fade witness, black backdrop in shine mode). §129.4 holds every
  builder round's notes ("ROUND 3" … "ROUND 16 IMPLEMENTED").
- State: /home/red1/bim-compiler/prompts/LARGE_DB_BAKE.md ONE-LINE STATE (REVIEW clauses, latest first).
- Code: worktree /tmp/wt-loadpath, branch feat/loadpath-ledger, base e26336d0 (feat/storey-section-cut, which carries
  L1–L4 + storey reveal + items 15/16, committed, no remote). UNCOMMITTED there: viewer/cpe_load_path.js (new),
  viewer/cpe_ledger_ticker.js (new), scripts/loadpath_ledger_preflight.js (new), viewer/cpe_resource_panel.js,
  viewer/cinema_maxq.js, viewer/main.js, viewer/viewer.html, viewer/cinema_path_editor.js, viewer/cpe_flythru_cues.js,
  erp/kernel_ops.js (sealFrom full mode), cli_silent_bake.js. Building DBs: buildings/*_silent.db → ~/Downloads copies.
- Taps: /tmp/tap_*.js (27 files; the 18 the spec names: __coFreeze __hudForceOverlap __hudRowsFloat
  __lpBackdropNoRestore __lpBreakSupport __lpCardWrongStack __lpClipAll __lpFrameOff __lpHideRest __lpHudNoFade
  __lpLabelsNaive __lpLookGhost __lpNoClockFreeze __lpNoFocusHold __lpOneStack __lpPickOccluded __lpPickThinnest
  __lpTopDown). Dry-run harnesses: the scratchpad of the old session (may be gone) — the builder rebuilds them.
- Clips in ~/Downloads: HHS_loadpath_clip_0.2432-0.2770_480p10.mp4 (R14 sighting, to be replaced by R16 after the
  control sweep), Terminal_loadpath_clip_0.1508-0.2032_480p10.mp4 (R9), HHS_ledger_clip_0.00-0.32_480p10.mp4,
  LTU_AHouse_loadpath_clip_0.42-0.50_480p10.mp4 (v8b, pre-descend rule), plus the delivery films.

## THE BAKE COMMAND (HHS; swap --db/--clip per building)
cd /tmp/wt-loadpath && bash /tmp/wt-bake-perf/bake_scope.sh node cli_silent_bake.js --db HHS_Office_Federated_silent \
  --out /tmp/wt-loadpath/out/<tag>.mp4 --gpu real --width 854 --height 480 --fps 10 --clash --storey-reveal --buildup \
  --label --reveal --measure --clip 0.2432:0.2770 --port <fresh 98xx> [--tap /tmp/tap_<name>.js]
Tight clips (2.2 s either side of the arm): HHS 0.2432:0.2770 (film 130.4 s, arm 33.9 s); Hospital 0.3498:0.3722
(195.8 s, arm 70.7 s); Terminal 0.1508:0.2032 (84.0 s, arm 14.9 s); LTU 0.4225:0.4507 (156.1 s, arm 68.2 s).
ffprobe frames must equal clip frames (44) + framesInserted (§LOADPATH_HOLD_INSERT). No --log flag exists.

## THE 25 LINES TO SCORE ON A NORMAL RUN (all must PASS; INCONCLUSIVE must say why)
§LOADPATH_SHOT · §LOADPATH_PICK (raysCast/hitsTotal/selfHits/universe, pickSource=live|frustum-fallback|probe-fallback —
NEVER none with a stack drawn — visibleHops, memberVis, hop0Occluder) · §LOADPATH_CHAIN (monotone=true ascents=0,
hopsDrawn==hopsSweep, re-printed with pickSource=live after a live re-pick) · §LOADPATH_STACK (bottom-up j/K) ·
§LOADPATH_VISIBLE · §LOADPATH_FRAMING (hopsIntersecting≥1, memberPx non-empty) · §LOADPATH_LABELS (overlaps=0
hudClear=true) · §LOADPATH_CARD (lines=N inFrame=true near=guid) · §LOADPATH_HUD_FADE (compositeAlpha all 0.00 at
mid-hold) · §LOADPATH_FOCUS (painted=0 unwrappedDraws=0) · §LOADPATH_BACKDROP (black=true restored=true) ·
§LOADPATH_LOOK (mode=shine backdropFaded=true) · §LOADPATH_HOLD (armTnMatch=true cameraMoved=false) ·
§LOADPATH_HOLD_INSERT · §LOADPATH_RESUME (tFilmArm==tFilmRelease, stepAtResume ≤ maxStepElsewhere) ·
§LOADPATH_RESTORE (clonesReverted=N/N) · §LOADPATH_CLONES (maxOffset≈0) · §HUD_LAYOUT (overlaps=0 overflow=0,
pie.band h=114@480p, hud.fiveD rect) · §HUD_LAYOUT_STABLE (fiveDY min==max) · §LEDGER_TICKER (sealedBy=bake … final=N/N)
· §KRN_CHAIN · §KRN_SEAL_FROM mode=full · §COST_ODOMETER_FINAL (INCONCLUSIVE no-final-frame is honest on tight clips) ·
§LOADPATH_VISIBILITY (only when blind).

## STATE AT HAND-OFF (2026-09-16 ~16:00)
- HHS R16 normal run (`out/HHS_loadpath_r16.log`): ALL 25 PASS. pickSource=frustum-fallback (no column line is
  unoccluded from that outside shot; shine-through is why it still shows). The 18-control sweep was RUNNING at red1-a8
  (`out/HHS_loadpath_r16_ctrl_<name>.log`), then Terminal (`Terminal_loadpath_r16.log`) and Hospital
  (`Hospital_loadpath_r16.log`) normal runs. Score them; copy passing normal runs to ~/Downloads as
  <Name>_loadpath_clip_<in>-<out>_480p10.mp4 (HHS overwrites the R14 file).
- Prepared, not applied (builder holds edits until the sweep is done): `§HUD_LAYOUT_ARM` — the HUD layout witness is
  vacuous at mid-hold (HUD faded, no rects); sample it at the ARM frame too. Then one more HHS bake.
- Open: LTU on the current code (its 21-hop zigzag is rejected by the descend rule; expect a shorter chain);
  ledger tip is bake-specific (bake re-injects the schedule and re-seals — durable seal = at save time, data lane);
  the hold-point search never reached 80 % of the building on any path (holds at topout); commit of both branches
  when red1 says; the 118/18/12 zero-scale rows on full LTU/Terminal/Hospital runs (unattributed, MEP item 9 class).

## LESSONS THAT COST ROUNDS (do not repeat)
- A witness that reads a flag/variable is not a witness of the frame: the HUD fade "passed" three times while the HUD
  was on screen (composite functions overwrote alpha; drawers outside the wrapper; a variable the compositor never read).
  Only `compositeAlpha` at the composite call and `unwrappedDraws` counted on the capture context were real.
- When two witnesses disagree about "the same" pose/frame, instrument both on ONE bake before fixing anything
  (Terminal FRAMING 0/7 for five rounds: the hold armed at armTn×(clipFrames−1), ignoring the clip's in/out).
- The support sweep's chain is placement order, not gravity (LTU zigzag) → CHAIN MUST DESCEND.
- Box-face sampling counts empty box space as occlusion → unoccluded = nothing between camera and the near face.
- Terminal's DB carries a stale sealed BUILDING_OPEN mid-table → bake-mode seal must be a FULL re-seal from id 1.
- Read every count on a new witness line against the spec (clipped=456 of 475 was missed once).

## ADDENDUM AT HAND-OFF (16:10)
- Sweep progress at hand-off: lp_break_support and lp_skip_restore FAIL on cue; controls 3–18, then Terminal and
  Hospital normal runs, still queued. The bake session itself is being handed to a fresh session by red1 with its own
  resume prompt; find it with ListAgents (it may no longer be "red1-a8") and continue the same order.
- ROUND 17 is PREPARED by the builder (spec in §129.4 "ROUND 17 SPEC", dry-run in the old scratchpad, worktree
  untouched): `§HUD_LAYOUT_ARM` sampled at the arm frame with the full HUD; mid-hold panel fields print
  `INCONCLUSIVE reason=hud-faded`. The builder also disclosed the same vacuous-default defect in `pieExclusive`,
  `rowsFullWidth`, `orderOk`/`costAboveLedger` — include them in Round 17 (any field whose backing rect is absent must
  read INCONCLUSIVE, never true). Implement AFTER the sweep + Terminal/Hospital bakes (a builder edit while bakes read the
  tree corrupts them), then one more HHS normal run. Spawn a fresh Sonnet builder for it (the last one is at ~650k tokens).
- Then: LTU normal run on this code; red1's sighting of the three clips; commit on red1's word (two branches:
  feat/storey-section-cut then feat/loadpath-ledger); the delivery films (480p, all three beats on) on red1's word.
