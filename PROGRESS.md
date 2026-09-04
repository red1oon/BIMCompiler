# PROGRESS — Current Development State

## ⚡ §RESUME_PROTOCOL — when an agent dies on a rate limit (one point, mandatory)
A 429 **terminates** the agent but still fires a task-notification to the live session, and the error
text carries the reset time (`resets 2:50am (Asia/Kuala_Lumpur)`). So: **parse that time → record the
agent + its last finding in `prompts/AGENT_QUEUE.md` §MID-FLIGHT → schedule a wakeup just past the
reset → resume by `SendMessage` to the agent id** (its transcript survives; never re-dispatch fresh,
that discards what it found) → tell the user. If the SESSION ends, the agent id dies with it —
§MID-FLIGHT is what lets a new session re-dispatch from the written brief. **Never defer writing this
kind of rule until "after the current agent finishes"** — that is how it gets lost. Full text:
`prompts/AGENT_QUEUE.md` §RESUME_PROTOCOL.

## 📋 The live worklist is `prompts/AGENT_QUEUE.md` — not this file
It carries §LIVE (which agent owns which files), the waves, the ⛔USER decisions, and the standing
constraints. A session picking up work reads that; PROGRESS.md is state, not queue.

## Current State — 2026-09-04

### ERP lane — §CLOSE.4's five open items are CLOSED; 6 PRs merged, live at sw v789 (full detail: `prompts/AGENT_QUEUE.md` §ERP-SESSION-CLOSE-2)
bim-ootb **#1661-#1666**. Six new witnesses, every one RED on plain `origin/main` before its fix and
GREEN after: `W-KIND2-READBACK` · `W-DICT-LAZY` 10/10 · `W-INOUT-CALLOUT-ATOMS` 9/9 ·
`W-ADFORM-VMATCH` 16/16 · `§DIGEST`/`§DIGEST-CHECK` 46 rows.
- **A KIND-2 generator's committed document is finally READABLE** — `readableDocs 0 → 1` with the line
  linked; 11-signed-verified-unreadable-rows was the whole defect class (#1661).
- **A second dictionary's renderer left the boot path** — `odoo_descriptor.js` fetches 1 → 0 on the
  default boot (#1662).
- **The two named `CalloutInOut` atoms** ship, and E-1's campaign is now PLANNED by measured usage:
  78 callout bindings on the nine document tables the app drives, 28 dispatch = **36%** (#1663).
- **The AD_Form spine + AD_Form 108 (VMatch) end to end**, rows oracle-checked against the Java's own
  SQL (#1664). 48 of 49 forms still have no renderer, and the honest card says so.
- **Hygiene E-6/E-7/E-8/E-14/E-15 all closed** (#1665, #1666 + bim-compiler): CI now runs **39 of the 46**
  ledger witnesses, not 1; the gitignored evidence base has a tracked digest; the 52/53 headline is
  resolved and the extra row named (`#26 W-FOLD-INOUTGL`).
**Five defects nobody had asked for**, all found by measuring rather than reading — see §C2.2. The
sharpest: filling a mandatory field on the Sales Order form disabled the only seam that set `IsSOTrx`,
so both KIND-2 generators refused the order.
**⛔ Next:** §C2.3 — the E-1 campaign (the 37-binding gap is listed in full), form #2 of 49, and **four
stale live witnesses that are RED on plain `main`** (`poc_odoo_descriptor`, `poc_wh_pos_pick_live`,
`poc_wh_walk_live`, `poc_pos_live`) — instruments judging retired DOMs, not product defects.

## Previous State — 2026-09-03

### ERP lane, 2026-09-02/03 — 5 PRs, sw v777 (superseded above; full detail `prompts/AGENT_QUEUE.md` §ERP-SESSION-CLOSE)
The five document windows render their own AD tab (c_order 8→56 fields, c_payment 4→78, DisplayLogic
0→28/61, val-rule-filtered FK pickers); three shipped defects found by the new instruments; `W-ERP-TWIN`,
`W-MULTIHOST-SYNC` and `W-RELAY-AUTH` became standing gates. Its ⛔ list is settled: `W-SCALE-FORECAST`'s
0.8× batch was fixed at #1638 (3.53× median) and `W-AD-DISPLAYLOGIC-LIVE` was a stale witness, not a
product failure. **S-2 (no relay deployed) is still the real barrier to multi-writer, not S-1.**

### 4D / viewer lane — 23 PRs merged 2026-09-02/03, release v1.58.0 (detail: the spec docs below)
- **§TM_REVEAL_TILED** #1605 — the movie never played `remapSolveToTasks`; dead air 44-71% → **0.0%**,
  Hospital pile-up 77.0% → 5.6%. Every reveal-spread number predating it measured a map nobody plays
  (struck by #1610). · **§CACHE_PLAYED_LAYER** #1607 — cache carries both layers, judges print `layer=`.
  → `prompts/4D_GANTT_TM_REFACTOR.md`, `prompts/4D_MODEL_INTEGRITY.md`
- **DAY-0 `PASS=5 FAIL=8` → `PASS=8 FAIL=5`** (#1551/#1615/#1625) — all 8 attributed (3 witness defects,
  3 modelling facts, 1 scope, 1 real); the "regression" premise was retired. → `4D_MODEL_INTEGRITY.md`
- **§SUN_FILL_RATIO** #1622 (away÷sun 1.0453 → **0.2388**) · **§MEP_COLOR_SURVIVES_PHOTOREAL** #1621
  (3→8 hues, 40,634 colourless MEP → 0) · **§DUCT_SILHOUETTE** #1631 (sagitta 21.3 → 3.4 mm)
  → `prompts/PHOTOREAL_STILL_RENDER.md`, `prompts/CINEMA_DISCIPLINE_REVEAL.md`
- **§CPE_AIM_DEPTH RETIRED** #1619 — gaze-vs-chord 90.657° → **0.000°**. → `prompts/CINEMA_PATH_EDITOR.md`
- **Clinic landing fixed + deployed.** ⚠ The earlier §AD diagnosis was partly wrong — the stale
  `bim-ootb-live` base was in the REPO copy, not the live object. Local/live still diverge 105 lines
  both ways: **do NOT upload `SYSNOVA/index.html` wholesale.**
- Also: 5D constants → JSON #1616 · dead `4D_policy.json` deleted #1617 · CPM-clamp toast #1618 ·
  nine vacuous `§` tags guarded #1608 · witness progress logging #1623 · B-2 support consolidation
  #1627-#1630 (**keep the AND** — giving copy 1 the §S64 bound flips 0/32 lock verdicts).

## ⛔ OPEN
- **Interior lighting / liveliness** — running. **"Lively" is variance, not brightness** (user: *"it
  should be lively, so far it has never been though lighting has been bright"*). Measured on two real
  bakes bracketing #1622: CV **0.344 → 0.430**, spread 42.9 → 59.1 — but the **bright register
  drained** (brightest fifth 140.7 → 79.2). Lead: *the still's near-field boost never fires.*
- **§Z.3 Clinic ground-slab appears late, then persists on scrub-back** — untouched; two named hypotheses in `LTU_TERMINAL_CLINIC_RENDER_CORRUPTION.md` §Z.
- **A-28 §CPE_REVEAL_ARCH_HOLD overshoot (TOP of the queue, user-set 2026-09-03)** — #1633 shipped, user
  sees the ARCH strip at the LAST stick of round 2, not the first. **Suspect 1 (two reveal clocks) is
  DISPROVEN by code read:** `beats.flyback` IS `tF` (`effects.js:8656`/`:7624`) and both callers pass the
  same film fraction (`cinema_maxq.js:1511`, `cinema_path_editor.js:2532`). Next: `_flyBackPose` direction,
  then whether `cpeRevealApplyVisual`'s write survives the per-frame staging rebuild. Detail in `AGENT_QUEUE.md` A-28.
- **§FILM_UNSUPPORTED** — not started; take the short `--frames` re-scope, not a full bake.
- **§LIGHT_SHAFT (D-5)** — specced, queued behind the lighting lane (shares `effects.js`).
- ⛔USER decisions (12 open) in `AGENT_QUEUE.md`: calibration lever (Hospital 318→940 d), LFS 8.53 GB pay-vs-rewrite, sub-element slab splitting, Terminal's 673 `Ceiling Level NN` elements.

## Standing constraints added 2026-09-02/03
- **Bakes are a proven, expensive facility, NOT a measurement tool.** Never launch a film to settle a number — ask first. Keep every `§` line on the bake path intact.
- **4D generation is building-independent.** No per-building constants or name-branching. Audited clean:
  every building name in the scheduling files sits in a comment; the only non-comment hits are the IFC
  classes `IfcFlowTerminal`/`IfcAirTerminal`/`IfcFireSuppressionTerminal`.
- **DBs stay on OCI, GH Pages serves the app.** Settled: GitHub hard-rejects any file >100 MB; every major DB exceeds it.
- **Beware checks that cannot fail.** Five now: `eslint | tail` returning tail's exit code, a witness
  reading its own comment block, a 0-byte log from a buffered `page.evaluate`, a `(none above = clean)`
  line printed unconditionally — and A-28's 6/6-green witness that never judged a caller.

## Older session log
Archived to `prompts/archive/PROGRESS_sessions_archived_2026-09-01.md` (2026-08-29 → 2026-08-14); the
2026-09-01/02 entries are superseded above. Per-lane detail lives in each lane's own `prompts/*.md`.
