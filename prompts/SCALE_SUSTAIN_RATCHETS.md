# ⚠ DO NOT REMOVE — SCOPE: design the RATCHETS that keep bim-ootb scalable and sustainable, done by ONE Fable 5.2 session.
# Output = §RESULT of this file + a merged PR. Static measurement only: no browser, bake or GPU runs, and no bim-ootb code changes.
# Read every log you produce before concluding.

**One-liner:** `Read prompts/SCALE_SUSTAIN_RATCHETS.md from origin/master and run ▶ TASK.`

**Goal (owner):** scalable, sustainable software. **Method:** a ratchet = a measured number + a check that fails when it gets worse.
Improvements lower the baseline. No one-off roadmap: every claim stays checkable after this session ends.
- **Scalable** = the app keeps working as buildings grow: heap and verts per building, the largest building that loads (laptop, phone),
  geometry released when off screen.
- **Sustainable** = a change stays cheap and safe as the code grows: one implementation per job, every file covered by a witness,
  one version per vendored library, files a session can read whole, files touched per typical change.

## ▶ TASK
Fable designs. Sonnet agents (`model: sonnet`) measure. Spot-check every number you rely on.

0. **Setup.** bim-ootb: `git fetch origin`, then a `/tmp/wt-*` worktree at `origin/main` (run `git worktree list` first and reuse; never
   `--force`). Record the SHA. Run anything heavier than a grep under `nice -n 19 ionice -c3`. For writing this file, use a bim-compiler
   worktree off `origin/master`.
1. **Read (you), before proposing anything.** `prompts/CODE_ARCHITECTURE_DESIGN.md`: RESUME, THE PROBLEM (P1–P5), parts A–F, F.3 + DECIDED F-2
   (size/cost ceilings are set from observed levels after 2026-11-30, so don't pick those numbers), and §M (the measuring commands; reuse them,
   don't write new ones for the same number). Also `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13 (the guard: nothing reaches the browser,
   no TS/bundler/fork) · `docs/BrowserScaleBenchmark.md` + CLAUDE.md §PERF BUDGET · `prompts/4D_MODEL_INTEGRITY.md` §I (owner table,
   known duplicates).
2. **Measure (3 Sonnet agents, parallel, read-only; each returns `metric | value | command | file:line`).**
   - A: run every §M command, plus vendored-lib versions per copy (read from each file's own header), and files over N lines.
   - B: git history over 90 days: files touched per commit (median, p90), files that are co-changed most often, churn hot spots.
   - C: harvest existing `§` heap/verts/timing lines from saved logs (bake logs, `~/.cache/bim4d/`, `deploy/dev/tests` logs). Report what
     exists and what's missing. Run nothing new.
3. **Scorecard (you).** For each candidate metric: value at SHA · is it already measured (§M)? · already guarded (witness/CI)? · which
   CODE_ARCHITECTURE part owns it. Keep only metrics that predict scale or change-cost. Drop vanity counts.
4. **Ratchet design (you).** One baseline file + one plain-node checker + CI wiring, inside §13. It must report NO-OP, VACUOUS and WRONG, not
   only PASS (CLAUDE.md PRIMAL LAW 4). It has a red control: a planted regression must fail. Fit it to F-2 rather than competing with it.
5. **Levers (you).** The top 3 changes that move the worst numbers. Each one gets a dispatch spec: goal · files · witness `W-…` + its proving
   `§` line · lines +/− · executor (default Sonnet). Implement nothing.
6. **Close.** A script checks every cited file:line at the SHA → log → read it → `cites=N ok=N`. Branch, PR, merge, confirm it's on master.
   Add a one-line pointer in the CODE_ARCHITECTURE_DESIGN RESUME block.

**4D fence:** another Fable session owns the 4D schedule lane (`prompts/4D_MODEL_INTEGRITY.md`; `schedule_*`, `support_sweep`, `cpm_schedule`,
`rates`, `4D_template.json`, the Gantt/`tm_*` editor). Measure those files, but write no levers on them. List what you find there under
`⛔ QUESTIONS` as `→ 4D lane`.

**Stop rule:** once you have the scorecard, the ratchet spec and 3 levers, write up. A number that needs a browser or bake run becomes a
lever that measures it. Don't run it.

## §RULES
Findings first. Every claim: file:line or command + `[measured]`/`[read]`/`[inferred]`. Uncertain → "unsure" + what's needed.
Don't re-propose a CODE_ARCHITECTURE part; say what this adds. Owner decisions go in `⛔ QUESTIONS`, one line each with a recommendation,
asked at the end, not mid-run.

## §DELIVERABLE
§RESULT: scorecard table (metric | scalable/sustainable | baseline@SHA | command | measured? guarded? | owner part) · ratchet spec
(`W-RATCHET`, baseline format, checker, CI job, red control) · 3 lever specs · what this adds over CODE_ARCHITECTURE_DESIGN ·
⛔ QUESTIONS · `cites=N ok=N`.
Chat report: PR link, the worst number in one line, question count. No code, no new runtime measurements, no docs page.

## §RESULT
_(empty)_
