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

## Current State — 2026-09-03

### ERP lane — 5 PRs merged 2026-09-02/03, live at sw v777 (full detail: `prompts/AGENT_QUEUE.md` §ERP-SESSION-CLOSE)
The five document windows now render their own AD tab, not a hand-written list: **c_order 8→56 fields,
c_payment 4→78**, DisplayLogic live **28/28/21/61/0 (was 0 everywhere)**; List/Yes-No are real controls;
`AD_Val_Rule` filters the FK pickers (`c_bpartner_id` 113→42). #1611/#1613/#1626/#1632/#1636.
**Three shipped defects found by the new instruments, not by inspection:** `ad_evaluator` matched record
keys case-sensitively so every AD logic expression naming a CamelCase column evaluated against `""`;
the val-rule token feed emitted `''Y''` for 25 of 332 rules, so those filters never ran; `crud_core`
broke #968's own audit-column casing on two adjacent lines.
**New standing instruments:** `W-ERP-TWIN` (94 witness refs were judging copies that are not what ships →
now 64 pairs / 0 unreviewed, and it fires on merge); `W-MULTIHOST-SYNC` + its content-keyed gate (6 arms,
3 real hosts — already fired once in production and was re-earned, epoch 7); `W-RELAY-AUTH` 32/32.
**⛔ Next:** `W-SCALE-FORECAST` fails 1 of 3 — batch commit is **0.8×**, i.e. slower than per-op.
`W-AD-DISPLAYLOGIC-LIVE` fails, unattributed, matrix NOT re-scored on it. **S-2** (relay still
`http.createServer`, nothing deployed) is the real barrier to multi-writer, not S-1.
5 user decisions parked in §ERP-SESSION-CLOSE.

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
- **§Z.3 Clinic ground-slab appears late, then persists on scrub-back** — untouched. Two named
  hypotheses in `LTU_TERMINAL_CLINIC_RENDER_CORRUPTION.md` §Z.
- **§FILM_UNSUPPORTED** — not started; take the short `--frames` re-scope, not a full bake.
- **§LIGHT_SHAFT (D-5)** — specced, queued behind the lighting lane (shares `effects.js`).
- ⛔USER decisions (12 open) live in `AGENT_QUEUE.md`: calibration lever (Hospital 318→940 d), LFS
  8.53 GB pay-vs-rewrite, sub-element slab splitting, Terminal's 673 `Ceiling Level NN` elements.

## Standing constraints added 2026-09-02/03
- **Bakes are a proven, expensive facility, NOT a measurement tool.** Do not launch a film to settle a
  number — ask first. Keep every `§` line on the bake path intact.
- **4D generation is building-independent.** No per-building constants, no branching on a building
  name. Audited clean: every building name in the scheduling files sits in a comment; the only
  non-comment hits are the IFC classes `IfcFlowTerminal`/`IfcAirTerminal`/`IfcFireSuppressionTerminal`.
- **DBs stay on OCI, GH Pages serves the app.** Settled with measurements — GitHub hard-rejects any
  file >100 MB and every major DB exceeds it.
- **Beware checks that cannot fail.** Four hit in one day: `eslint | tail` returning tail's exit code,
  a witness reading its own comment block, a 0-byte log from a buffered `page.evaluate`, and a
  `(none above = clean)` line printed unconditionally.

## Older session log
Archived to `prompts/archive/PROGRESS_sessions_archived_2026-09-01.md` (2026-08-29 → 2026-08-14).
The 2026-09-01/02 entries this file used to carry are superseded by the state above; per-lane detail
lives in each lane's own `prompts/*.md`.
