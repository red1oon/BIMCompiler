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
**23 bim-ootb PRs merged 2026-09-02/03; release v1.58.0 published.** Headlines:
- **§TM_REVEAL_TILED (#1605 `c8a6df61`)** — the movie **never played `remapSolveToTasks`**; it played
  an outlier-sensitive affine in `_tmRescaleToTaskWindow`. Dead air 44-71% → **0.0%** on four
  buildings; Hospital pile-up 77.0% → 5.6%. **Every reveal-spread number predating this measured a
  map nobody plays** — struck by #1610.
- **§CACHE_PLAYED_LAYER (#1607)** — the cache now carries BOTH layers and every judge prints `layer=`.
- **DAY-0: `PASS=5 FAIL=8` → `PASS=8 FAIL=5`** (#1551 `59736505` + #1615 + #1625). All 8 originals
  attributed: 3 witness defects, 3 modelling facts, 1 scope, 1 real. The old "regression" premise was
  retired — `claims=13` was a 3-building cache artefact, never a regression signature.
- **§SUN_FILL_RATIO (#1622 `85fd0732`)** — Alt+S pushed a photographed HDRI onto matte concrete; IBL
  is non-directional and **not shadow-occluded in three.js**, so it lit away-facing walls as hard as
  sun-facing (85%/83% of all light on the away wall). Away÷sun **1.0453 → 0.2388** (Clinic).
- **§MEP_COLOR_SURVIVES_PHOTOREAL (#1621 `8d8320ee`)** — Hospital 3→8 distinct hues, 40,634
  colourless MEP → 0. Fire-red valve preserved 1300/1300. **Confirmed live by the user in a real bake.**
- **§CPE_AIM_DEPTH RETIRED (#1619 `dfe5a58e`)** — on Hospital's real stored path, gaze-vs-chord
  90.657° → **0.000°**, tangent mean 85.127° → **6.930°** (12× closer to the path).
- **§DUCT_SILHOUETTE (#1631 `da0521c4`)** — sagitta 21.3 → 3.4 mm (6.3×) on Hospital's 1,419
  qualifying elements. The lamps-vs-ducts split is **size, ~50× wide**, not detection.
- **Clinic landing FIXED and deployed** — the live OCI page mapped `Clinic` → `Clinic_extracted.db`.
  Repointed to `Clinic.db`, uploaded, fetched back byte-identical (78,872 B, `text/html`).
  ⚠ The earlier §AD diagnosis was partly wrong: the live object **already** used bucket `bim-ootb`;
  the stale `bim-ootb-live` base was in the **repo copy**. Local/live still diverge 105 lines both
  ways — do NOT upload `SYSNOVA/index.html` wholesale.
- Also: 5D constants → JSON (#1616), dead `4D_policy.json` deleted (#1617), CPM-clamp toast (#1618),
  nine vacuous `§` tags guarded (#1608), witness progress logging (#1623), B-2 support consolidation
  (#1627-#1630 — **keep the AND**, measured: giving copy 1 the §S64 bound flips 0/32 lock verdicts).

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
