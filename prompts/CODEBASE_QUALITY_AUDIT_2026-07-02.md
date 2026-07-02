# ⚠ DO NOT REMOVE — Scope guard
# Read-only findings doc from an 18-agent parallel quality/slop/security audit across bim-compiler + bim-ootb
# (dispatched 2026-07-02 night, session interrupted by a system crash 2026-07-03 ~02:38 during the last agent).
# 5 of the ~13 completed sub-reviews already fed prompts/RESUME_MODELLER_COMPETITIVE_POLISH.md,
# prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md, and prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md — don't
# re-run those. This doc captures the 4 reports that were never synthesized before the crash, plus the security
# sweep (interrupted mid-flight — the watchdog session completed the final open thread manually and verified
# it live, see §5). Nothing here is implemented yet; these are findings, not a spec. Triage before building.

## 1. bim-compiler pipeline architecture rigor
- `BuildingCompiler.java` `compile()`/`compileWithSession()` (132-230) and `compileWithValidation()` (266-344)
  are ~100 lines of near-verbatim duplicated pipeline logic — a real DRY violation, not stylistic.
- `StoreyCompiler.java` is 3004 lines / ~31 methods (~97 lines/method avg) — a God-class, consistent with
  organic accretion over "Phase 1...120+" commits, not a designed architecture. Patterns ARE at least
  consistent across stages (same Phase-comment convention, same StoreySpec/registry style throughout).
- `RosettaStoneGateTest.java` gates are genuinely substantive, not rubber-stamped: G2-VOLUME real ±0.1%
  tolerance; G3-DIGEST exact SHA256 spatial-digest equality w/ per-element diagnostic diffing; G4-TAMPER
  (269-449) is unusually rigorous — 21 regex rules scanning git diffs + current source for `@Disabled`
  additions, `assertNotNull`-only tests, raw-SQL bypassing the verb layer, hardcoded coordinates, genuinely
  adversarial against its own doctrine. A real log (`logs/run_RosettaStones_20260623_072905.txt`) shows an
  actual FAIL with a concrete 42,620mm drift — gates do catch real regressions.

## 2. bim-compiler repo hygiene + doc accuracy (richest report)
- **Dead code:** `DAGCompiler/scripts/` completely empty. `FloorAssemblyBuilder.java`,
  `FloorStructuralAssembler.java`, `solver/SpaceSolverPrototype.java` each have a `main()`, never referenced
  by anything else — standalone CLI utilities sitting in the production package tree, not wired into
  `BuildingCompiler`/`CompilationPipeline`. Last real edit Feb 2026.
- **Doc-vs-code drift, 3 spot-checks:** `docs/CLASH_DETECTION.md` "12 discipline-pair rules" — **accurate**
  (verified against `deploy/live/clash_rules.json`). `docs/SYSTEMS_INSTALLER_GUIDE.md` "9 modules" — actual
  `pom.xml` has 10, missing `BIMEyes` (added 2026-03-21, commit 7c8ae21c); doc last touched 2026-06-30 despite
  being stale. `docs/BIMtoProject.md` claims fold engine `proj_fold.js`/`history_bar.js` BUILT/LIVE — neither
  file exists anywhere in this repo's git history (not even deploy/dev|live, which do mirror siblings like
  nlp.js/navigate_find.js) — likely lives only in bim-ootb, a real cross-repo verifiability gap.
- **README self-disagreement:** 11 vs 12 pipeline stages, 64 vs 77 BIM_COBOL verbs, "106 migration scripts"
  (actual 179), "392 GREEN" badge vs the documented real baseline (382 PASS / 94 intentional RED / 1 SKIP).
- **⚠ Most concerning: migration append-only violation.** `DV_<discipline>_rules.sql` "mined rule" files are
  wholesale regenerated in place across dozens of commits — violates CLAUDE.md's stated append-only hard rule
  for `migration/*.sql`. (Note: the agent's own commit that same session was genuinely append-only — the
  file's BROADER history isn't.) Worth a decision: is this file family actually exempt from the append-only
  rule (regenerated mined data, not a migration ledger), or does the rule need enforcing here?

## 3. Shallow-witness-pattern hunt (bim-ootb)
Confirmed the grid-alignment shallow-check gap (30/31-*.spec.js, 57-60% `src.toContain(...)` checks) is
**not isolated** but also **not systemic**. Broader scan of ~20 files across erp/viewer/modeller/hr_bim_asset/
teams/geomapping/common: most sampled files are REAL (computed-value/numeric assertions — e.g.
`witness_payslip.js`, `bonsai_grid_live.js` checks exact grid-corner refs + triangle counts,
`geomapping/tests/witness_geomap.js` measured confidence values). Two MORE shallow files found:
- `tests/specs/27-print-section-dims.spec.js` — 94% source-string checks (18/19). Claims section-cut
  save/restore + stair/window-opening generation but never runs `preview()`/`capture()` to check real output.
- `tests/specs/29-3d-grid-kernel.spec.js` — 86% (45/52) source-string checks.
Note: `1e5713f` (same-day commit, PR #616) already added `modeller/tests/witness_grid_numeric.js` as a REAL
fix for the original grid-alignment gap — it supplements, doesn't replace, specs 30/31.

## 4. ERP data-discipline sweep beyond POS/HBA (bim-ootb) — clean bill of health
Sampled `erp/erp_search.js`, `erp/kanban_lens.js`, `erp/crud_overlay.js` (2487 lines, largest sampled) —
all verdict **real**: erp_search.js's SEARCHABLE list is real AD tables/columns, unresolvable tables logged
not faked; kanban_lens.js explicitly documents "NOT hand-authored" columns with an honest `sparse` flag
instead of inventing filler; crud_overlay.js writes go through the actual production kernel
(`commitOp→sealChain→verifyChain`), same ENGINE_CONTRACT.md §1 path as chat SEND. No fabricated data found
in this sample.

## 5. Security/robustness sweep — interrupted by the crash, completed by the watchdog session
Agent got through: no hardcoded secrets/credentials (real check, clean). Was mid-way into SQL-injection +
unsafe-DOM-pattern checks when interrupted with one open thread: confirmed the same `innerHTML = '...' + f.name`
pattern in BOTH repos, about to check whether flagged `.name` sites trace back to untrusted IFC-extracted data
before the session got cut off. **Follow-up verification done live (watchdog, 2026-07-03):**
- **Real, low-severity finding (2 sites, same bug duplicated across repos):** `erp/ninja_pill.js:164`
  (bim-ootb) and `build/erp/ninja_pill.js:159` (bim-compiler mirror) — `_onFile(f)`: `out.innerHTML =
  '<span...>reading ' + f.name + '…</span>'` where `f` is a native `<input type=file>` File object. A
  maliciously-named local file (e.g. `<img src=x onerror=alert(1)>.xlsx`) would render as HTML. Same pattern
  in `erp/migrate_showme.js:182`. **Self-XSS-shaped, low real-world severity** (no server anywhere —
  grep-confirmed — attacker needs the victim to open a file THEY chose with a crafted filename), but a real
  discipline gap: this codebase already has `_escHtml`/`escHtml` helpers used correctly elsewhere
  (`erp/ad_ui.js:945,2053`, `viewer/navigate_find.js:3009`) — just not applied here. **1-line fix each, 3 sites
  total** (2 files × the pattern, mirrored into bim-compiler too).
- **3 flagged sites checked and cleared as false positives:** `erp/erp_picker.js:133` (`e.name` from the
  hardcoded local `ERPS` array, not user input), `viewer/scene.js:1226` (`c.name`/`entry.name` from a
  hardcoded command-palette array — "Zoom In" etc, not IFC data), `viewer/hba_avatars.js:78` (`card.name` —
  not traced to IFC-extracted data in this pass, but same fixture-driven pattern as the others; lower
  confidence than the other two, worth a quick re-check if this file changes).
- **SQL injection:** spot-checked `erp/ad_graph.js`, `erp/ad_data.js`, `erp/ad_parser.js` — VALUES are
  consistently parameterized (`?` + params array); table/column NAMES are string-concatenated (unavoidable in
  SQLite — can't parameterize identifiers) but sourced from the internal AD dictionary schema, not raw user
  input. No server/API endpoint exists anywhere in either repo (grep-confirmed) — even a real SQLi here would
  be client-local-only, same blast radius as direct DB access an attacker would already have. **Low risk,
  no action needed**, but not exhaustively swept (agent sampled 8-10 candidate files by design, not all).

## TRIAGE — 2026-07-03 session (all facts re-verified against source before acting)
- **§5 XSS → ✅ DONE.** bim-ootb **PR #618 MERGED** (erp/ninja_pill.js + erp/migrate_showme.js, erp sw v758,
  W-XSS-FILENAME 10/10) + bim-compiler **PR #20 MERGED** (build/erp/ninja_pill.js mirror, W-XSS-FILENAME 5/5).
  Fix also covers the `download()` link sink (`a.innerHTML = ... + fname`) the audit missed — same untrusted
  value, 4 sinks total. `_escHtml` copied verbatim from erp/ad_ui.js; exposed on each module's witness seam.
- **§2 doc drift → ✅ DONE** (bim-compiler PR #20): README badge/stats → real baseline 382 PASS / 94
  intentional RED / 1 SKIP (run_tests.sh header); verbs 64→77 (77 *Verb.java); stages 12→11
  (CompilationPipeline STAGES.size()=11 — step labels run 1-12 with Step 3/ParseStage retired, which explains
  the 11-vs-12 confusion, now noted inline); migrations 106→178; modules 12→10 (parent pom reactor);
  SYSTEMS_INSTALLER_GUIDE 9→10 modules + BIMEyes in both lists; BIMtoProject.md cross-repo note
  (proj_fold.js/history_bar.js verified present in bim-ootb viewer/ + common/ — doc was TRUE, just repo-silent).
- **§2 append-only violation → ⛔ BLOCKED (user decision):** are `migration/DV_<disc>_rules.sql` mined-rule
  files EXEMPT from the append-only rule (regenerated data, not a ledger — then say so in CLAUDE.md §Sacred
  Files), or does the rule need enforcing (then regeneration must move to new files)? One-line answer needed.
- **§2 dead code → OPEN (recommend, not done):** delete empty `DAGCompiler/scripts/` + move the 3 unreferenced
  standalone-main utilities (FloorAssemblyBuilder, FloorStructuralAssembler, solver/SpaceSolverPrototype) out of
  the production package tree (git preserves them). Not done this pass: Java-tree change → spec-first.
- **§1 refactors → OPEN (needs a spec + green G1-G6 harness before touching):** compile()/compileWithValidation()
  ~100-line duplication is the cheap one; StoreyCompiler god-class split is a lane of its own. BuildingCompiler
  is a Sacred file — don't do this as a drive-by.
- **§3 shallow specs 27/29 → OPEN (bim-ootb):** supplement with numeric witnesses on the pattern of
  modeller/tests/witness_grid_numeric.js (1e5713f). Witness work, no product code change.
- **§4 → no action** (clean bill).

## Non-invent / process notes
Findings 1-4 are the exact final-report text each Explore/general-purpose agent returned (2026-07-02 night
session, task-ids af83453691c2bcd1f / aa8d504843e82bb2e / a324afa07d0cf461f / afaa44ca5905b07dc — recoverable
from `~/.claude/projects/-home-red1-bim-compiler/997725ee-.../subagents/` if deeper detail is needed). Finding
5's follow-up was independently re-verified live by the watchdog session (file:line reads, not re-trusted from
the interrupted agent's partial claim). Re-verify anything here before trusting if picked up more than a few
sessions later (fast-moving repo).
