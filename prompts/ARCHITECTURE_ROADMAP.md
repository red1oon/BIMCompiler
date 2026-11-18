# ⚠ DO NOT REMOVE — SCOPE: read-only architecture + roadmap review of bim-ootb (origin/main) by ONE Fable 5.2 session.
# Output = §RESULT of this file + a merged PR. No bim-ootb code changes, no bakes/GPU/browser runs. Read every log before concluding.

**One-liner:** `Read prompts/ARCHITECTURE_ROADMAP.md from origin/master and run ▶ TASK.`

## ▶ TASK
Fable does the judgment. Sonnet agents (`model: sonnet`) do the counting and grepping.

0. **Setup.** `git -C ~/bim-ootb fetch origin`. Read through `git show/grep origin/main` with no checkout, and record the SHA. To write this
   file, use a bim-compiler worktree off `origin/master` (check `git worktree list` first, never `--force`).
1. **Read (you).** `prompts/CODE_ARCHITECTURE_DESIGN.md` (RESUME block + parts A–F: build on them, don't repeat them) ·
   `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13 (the guard) · `docs/BrowserScaleBenchmark.md` + CLAUDE.md §PERF BUDGET ·
   `docs/DeveloperGuide.md` §9, §11.
2. **Inventory (2 Sonnet agents, parallel, read-only, cite file:line).**
   A: every vendored lib (library, version from its own header, every copy, every loader), with version splits and duplicate copies flagged.
   B: line counts per app dir (`git ls-files`, excluding `lib/`, `tests/`, `*.min.js`, `.claude/`), the 20 largest files, the most-loaded files.
   Spot-check every row you rely on.
3. **Audit (you).** (a) Where no-build is stretched. (b) The #1 liability for the next 12 months, with file:line and why it beats two
   runners-up. (c) Custom code that current vendored libs now provide (name the API and the lines it deletes).
4. **Roadmap (you).** Per item: effort S/M/L · risk L/M/H · dependencies · a success criterion a script or `§` log can check.
   H1 4–6 wk inside §FACTS · H2 3–6 mo, may bend a constraint only inside §13 (say which, and how to reverse) · H3 6–12 mo, one bet plus its
   trade-offs.
5. **Write §RESULT (you).** Each H1 item gets a dispatch spec: goal · files · witness `W-…` + proving `§` line · lines +/− · executor
   (default Sonnet). Implement nothing. Owner decisions go in `⛔ QUESTIONS` with a recommendation each.
6. **Close.** A script checks every cited file:line at the SHA → log → read it → `cites=N ok=N` in §RESULT. Branch, PR, merge, confirm it's
   on master. Add a one-line pointer in the CODE_ARCHITECTURE_DESIGN RESUME block.

**Stop rule:** once you have the liability, the table and the H1 specs, write up. Unrun measurements become H1 items; don't run them.

## §FACTS (bim-ootb `6cd994b5`; if the code disagrees, that's a finding)
- About 207K lines of app JS (viewer ~163K, modeller ~44K). Vanilla, no framework, no bundler, no transpile.
- Libraries are vendored (`viewer/lib`, `modeller/lib`, `common/lib`) and loaded through import maps (`viewer/viewer.html:846`,
  `modeller/modeller.html`).
- Three.js: viewer r186, modeller r184. sql.js: `1.7.0` in code, `^1.14.1` in `package.json`. web-ifc 0.0.77.
- `package.json` is dev-only. Nothing from npm reaches the browser.
- SQLite BLOB → Float32Array → BufferGeometry, no intermediate format (`viewer/streaming.js`). BatchedMesh is used widely.
- Hosting: GitHub Pages + OCI for building DBs. No server code.
- Limit: heap ≈ 0.17 GB per million vertices; memory runs out before draw speed does.

## §RULES
Findings first. Every claim: file:line + `[read]`/`[inferred]`. Uncertain → "unsure" + what's needed. H1 never breaks §FACTS. Nothing breaks §13.

## §DELIVERABLE
§RESULT: Current State · Constraint Ledger · #1 liability · native replacements · roadmap table · H1 dispatch specs · Ruled Out ·
overlap with CODE_ARCHITECTURE_DESIGN · ⛔ QUESTIONS · `cites=N ok=N`.
Chat report: PR link, the liability in one sentence, H1 count, question count. No code, no measurements, no docs page.

## §RESULT
_(empty)_
