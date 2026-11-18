# ⚠ DO NOT REMOVE — SCOPE: one read-only architecture + roadmap review of bim-ootb (origin/main), done by ONE Fable 5.2 session.
# Output = the §RESULT section of THIS file + a merged PR. No code changes in bim-ootb, no bakes/GPU/browser runs. Read every log you produce
# before you conclude. Honour this block until §RESULT is marked DONE.

**Written 2026-11-18.** Origin: a DeepSeek-drafted review prompt that the owner asked to have checked. Several of its "fixed constraints" were
false against bim-ootb `origin/main` @ `6cd994b5` (said 50K lines, CDN loading, three r184, sql.js 1.10.3, "no npm", "adopt an import map" as
future work). Those were corrected in §FACTS below.

**One-liner for the owner:** `Read prompts/ARCHITECTURE_ROADMAP.md from origin/master and run ▶ TASK.`

---

## ▶ TASK (Fable session starts here)

You are the design brain of this review, not its search engine. Spend your own tokens on **judgment** (what is the real liability, what order,
what to rule out, what the trade-offs are). Hand **mechanical work** (counting, grepping versions, listing duplicates, checking paths) to Sonnet
agents or to one script. Owner rule (`prompts/CODE_ARCHITECTURE_DESIGN.md` §Standing rules): workers run on Sonnet. Fable does code-design and
spec problems.

### Step 0 — Setup (cheap)
- `git -C ~/bim-ootb fetch origin`. Read bim-ootb with `git show origin/main:<path>` / `git grep … origin/main`. You don't need a bim-ootb
  checkout. Record the SHA you reviewed.
- For writing this file, use a bim-compiler worktree off fresh `origin/master`. Run `git worktree list` first and reuse one if it fits.
  Never `--force` remove a worktree.

### Step 1 — Read what already exists (YOU, do not delegate; this is what stops you repeating settled work)
1. `prompts/CODE_ARCHITECTURE_DESIGN.md`: the ▶▶ RESUME block plus the part headings A–F. That lane already owns "higher-level code design".
   This review must **build on it and say what it adds**, never re-propose a part already there.
2. `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13: the owner's minimalism guard (nothing reaches the browser; no TypeScript, bundler or fork).
3. `docs/BrowserScaleBenchmark.md` and CLAUDE.md §PERF BUDGET: the measured limit is memory, not draw speed.
4. `docs/DeveloperGuide.md` §9 (breakers) and §11 (refactors).

### Step 2 — Fact inventory (DELEGATE: 2 Sonnet agents in parallel, `model: sonnet`, read-only, return a table)
- **Agent A, dependencies:** every vendored third-party file under `viewer/lib`, `modeller/lib`, `common/lib` (and any other `lib/`). For each:
  library, version (read from the file's own header/REVISION), every path it's copied to, and every import map / `<script>` that loads it.
  Flag version splits (e.g. Three.js r186 viewer vs r184 modeller) and duplicate copies.
- **Agent B, size and shape:** line counts per top-level app dir from `git ls-files` (excluding `lib/`, `tests/`, `*.min.js`, `.claude/`),
  the 20 largest app files, and the files most-imported or most-loaded by the HTML entry points.
- Tell both agents: bim-ootb only via `git show/grep origin/main`, no checkout, no worktree creation, cite file:line for every row.
- **You then spot-check every row you will lean on** (CLAUDE.md "verify a code claim before it's load-bearing"). An agent's table is a lead,
  not evidence.

### Step 3 — Audit (YOU)
1. Where the no-build approach is stretched: hard-to-update vendored files, version drift between apps, duplicate copies, hand-kept load orders.
2. **The single largest architectural liability** for the next 12 months. Cite file:line. Say why it beats the two runners-up.
3. Custom code that a vendored library's *current* version now provides natively (Three.js r186, three-mesh-bvh). Name the exact API and the
   code it would delete.

### Step 4 — Roadmap (YOU)
Each item: effort S/M/L · risk Low/Med/High · dependencies · a **measurable success criterion** a script or `§` witness log can check
(e.g. "one Three.js version across apps", "heap at JELAPANG peak from X GB to Y GB", "delete file Z, −N lines"). Not "improve performance".
- **H1 (4–6 weeks):** highest ROI, inside every constraint in §FACTS.
- **H2 (3–6 months):** may bend a constraint **only inside the §13 guard**. Name the constraint bent and how to reverse it.
- **H3 (6–12 months):** one breakthrough bet, with its trade-offs stated.

### Step 5 — Write §RESULT into THIS file (YOU write; spec-first)
- **Every H1 item gets a dispatchable spec block:** goal · files touched · witness claim (`W-…` name + the `§` line that proves it) ·
  deletion budget (lines +/−) · which model executes it (default Sonnet). This is the hand-off. Sonnet sessions implement from it later.
  **You implement nothing.**
- Owner decisions you can't extract go in a `⛔ QUESTIONS` list at the end (one line each, with your recommendation). Don't ask the owner
  mid-run.

### Step 6 — Check and close
- Run one script that checks every `file:line` cited in §RESULT exists at the reviewed SHA. Save its output to a log, read the log, and fix or
  strike any cite that fails. Put the final `cites=N ok=N` line in §RESULT.
- Commit on a fresh branch, open a PR, merge it after verifying (owner allows merging your own verified PRs), and confirm it landed on master.
  Leave nothing unpushed.
- Add one line to `prompts/CODE_ARCHITECTURE_DESIGN.md` RESUME block pointing here (no copy of the content).

### Stop rule (token discipline)
When you have the liability, the roadmap table and the H1 specs, stop and write up. Don't chase exhaustive coverage of 200K lines. If something
needs a measurement nobody has run (heap, timings), write it as an H1 item that measures it. Don't run it yourself.

---

## §FACTS — corrected constraints (verify each; if code disagrees, that is a finding)
- About **207K lines** of app JS (viewer ~163K, modeller ~44K) at `6cd994b5`. Vanilla JS, no framework, no bundler, no transpile.
- Third-party libraries are **vendored** (`viewer/lib`, `modeller/lib`, `common/lib`) and loaded through **import maps** (`viewer/viewer.html:846`,
  `modeller/modeller.html`), not from CDNs.
- Three.js: **viewer r186, modeller r184** (split). sql.js: mixed (`sql.js@1.7.0` referenced in code, `^1.14.1` in `package.json`). web-ifc 0.0.77.
- `package.json` is **dev-only** (eslint, witness runner, `red1` bin). Owner rule: nothing from npm reaches the browser.
- Core idea: SQLite BLOB → Float32Array → BufferGeometry with no intermediate format (`viewer/streaming.js`). BatchedMesh is used widely.
- Hosting: GitHub Pages + OCI object storage for building DBs. No server code.
- Measured limit: heap ≈ 0.17 GB per million vertices; memory runs out before draw speed does (`docs/BrowserScaleBenchmark.md`).

## §RULES
- Findings first, no opening summary. Every codebase claim cites file:line and is tagged `[read]` or `[inferred]`.
- Uncertain → "unsure" plus what you'd need to see.
- Nothing in H1 may break §FACTS constraints. Nothing anywhere may break the §13 guard.
- Fix history and reasoning go in this file, not in code comments.

## §EXPECTED DELIVERABLE (what the owner should get back)
1. A merged PR adding **§RESULT** to this file, containing:
   - Current State (one paragraph, cited) · Constraint Ledger (each constraint and its cost)
   - **The #1 liability** with file:line and why it beats the runners-up
   - Native-replacement list (custom code → library API, lines it deletes)
   - Roadmap table: Horizon | Item | Effort | Risk | Success Criterion | Dependencies
   - **H1 dispatch specs**, each ready to give a Sonnet session with a one-liner
   - Ruled Out (one line each, reason from the code) · Overlap with CODE_ARCHITECTURE_DESIGN
   - `⛔ QUESTIONS` for the owner · the `cites=N ok=N` check line
2. A short chat report: PR link, the #1 liability in one sentence, H1 item count, question count.
3. **Not delivered, by design:** no code changes, no measurements run, no new docs page.

---

## §RESULT
_(empty — the Fable session writes here)_
