# ⚠ DO NOT REMOVE — SCOPE: the film "Vibe Coding, Honestly" (working title): what is unique about BIM OOTB + Kernel-ERP, its pros AND cons, and why it fits vibe coding, with the "When AI Dies" film folded in as one chapter. ENGLISH only (VOCAB rule 2026-11-17: films EN only, other languages ad hoc). Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line this build produces (`out/facts.json`); a number that does not match FAILS the build (`§FILM_GUARD`). The film file is never committed, only the scripts, logs and this spec. Honour this block until STATUS says DONE.

**Asked 2026-11-18** (owner): *"Can we make a film that highlights the software uniqueness, pros and cons, on how it also fit vibe coding? Another session just did a film that depicts what if AI dies, how the VSC is equipped to carry on work. You may fold that in too."*
**Source text:** `docs/VibeProgramming.md` §"2026-11: An Outside Assessment, Fact-Checked" (PRs #905, #925; bim-ootb README fix #3229). The film voices only what that section kept or rephrased, never what it rejected.
**House style:** `prompts/FILM_NARRATION.md` HOUSE STYLE 1–6 (split screen, real key sounds, typing first and voice after the return key, two-colour cover, the part that changes shown large, one terminal font) + LAST CARD + GUIDE LINK + PLAYBOOK C (before/after in the first 25 s, show then prove, honest limits in the voice, roadmap card "not built yet", silent 3.6 s chapter cards). Mechanics: copy `scripts/film_when_ai_dies/` to `scripts/film_vibe_ledger/` (`facts.js` → shoot → `guard.js` with check P → `cards.js` → voice → `k2.py` → mux).

## The message (one line per chapter)
1. **Unique:** one browser tab runs a BIM viewer, a modeller and a full ERP, from one signed log, with no server.
2. **Why vibe coding fits it:** the AI is good where there is a pattern to copy (twenty years of iDempiere, the BOM), poor where there is none (geometry). So every claim gets a witness script that checks it as numbers.
3. **The cons, said plainly:** the collapse happens here too, and gets caught; the checks are a habit, not CI; the numbers in our own README drifted; it is hard to learn; "no server" makes the attack surface smaller, not zero.
4. **When the AI dies** (folded in): the editor still answers from what the repo generates.
5. **Not built yet:** the witness suite in CI; the When AI Dies roadmap items.

## Beats (top = typed strip with real key sounds, the command really run in a clean `origin/main` worktree; bottom = its real output or the real app)
| id | top (typed, then return) | bottom | numbers from |
|---|---|---|---|
| cover | — | two-colour card: kicker `VIBE CODING · THE HONEST LEDGER` · title "One person, a machine, an AI" / "and the checks that keep it honest" | — |
| before | `# the industry, 2025` | card: churn 3.1 % → 7.1 % (GitClear), 45 % of AI samples fail security tests (Veracode), trust 40 % → 29 % (Stack Overflow) — each with its source line, as already cited in VibeProgramming.md | the doc's table rows, read by check P |
| after | `git log --oneline \| wc -l` | the count in the terminal, then the live app's landing page | `§VL_COMMITS` |
| u1 one tab | `cat package.json` | the "static browser app (no build)" line and its one runtime dependency, large | `§VL_DEPS runtime=` |
| u2 one log | the chain witness (choose at build: `erp/tests/witness_replay_clock.js` or a kernel_ops chain check) | its verdict line; then the ERP page with the same record | the witness's own `§` verdict |
| u3 building → order | — (reuse) | 2 labelled stills: the building, the procurement order it became (from an existing film's frames; source frame + film named in the log) | that film's `§` facts |
| v1 pattern vs none | `# where did the AI do well?` | two-lane card: ERP (pattern → fold → ship) vs GEOMETRY (no pattern → drift → witness); ERP commit counts by month | `git log -- erp` counts → `§VL_ERP_MONTHS` |
| v2 the witnesses | `git ls-files \| grep -c witness` | the count, then one witness log that says `INCONCLUSIVE` on an empty population (a witness that can report its own failure) | `§VL_WITNESS_FILES`, the witness's line |
| c1 collapse, caught | `# did it collapse here too?` | card: three dated failures (2026-08-25 witnesses passing on nothing · 2026-08-26 three retractions · 2026-10-04 master→detail broken on every window) → each became a written rule | the prompts files' dated sections, read by check P |
| c2 habit, not CI | `grep 'run:' .github/workflows/ci.yml` | the CI steps, large: syntax, lint, wiring audits; no witness suite | `§VL_CI_STEPS witness_suite=N` |
| c3 our own drift | the app-file count command from #3229 | before/after: README said ~2,600 "app" files; measured ~1,050; fixed the same day (#3229) | `§VL_APPFILES` |
| c4 hard to learn | — | card: B-rep kernel · the iDempiere dictionary as JavaScript folds · our own verbs (the honest learning-curve line) | — |
| c5 smaller, not zero | `# what does it still talk to?` | card: OCI storage, a CDN fallback, the GitHub + Gmail relay, the iDempiere web services; risk moves into the tab | VibeProgramming.md rows, check P |
| aid (folded) | `# and if the AI goes away?` | ~40 s cut from `~/Videos/When_AI_Dies_CH_EN_AFTER_2026-11-18_v1.mp4` (its q1 "where is this used" + "why it cannot be wrong" beats), source in/out seconds in the log | that film's `out/facts.json` |
| roadmap | — | card "not built yet": witness suite in CI · the X0 module manifest (B1) and its named parts | — |
| close | — | LAST CARD: prior art (rows read by check P) · credentials (#905 #925 #3229 #923, verdicts from this build's logs) · guide link · key-sound credit | facts.json, `§FILM_GUIDE` |

**Guide link:** `https://red1oon.github.io/BIMCompiler/VibeProgramming/#2026-11-an-outside-assessment-fact-checked`. **Gap:** that section is merged on master but NOT yet on the live site — the docs deploy (`scripts/safe_gh_deploy.sh`) must run before the film is posted; `§FILM_GUIDE … anchor=Y` fails until then.

## Build plan (CPU only: headless + `--disable-gpu`, `nice -n 19`, never the GPU lock)
1. `facts.js <bim-ootb tree>` on a fresh `origin/main` worktree pinned to one commit: every `§VL_*` line above → `out/facts.json`.
2. Shoot: terminal stills from the real commands; page stills headless (CPU). Viewer/large page captures wait until the peer session's GPU film is done (asked 2026-11-18, ~3 h).
3. `build.sh`: cards, guard (every spoken digit is a fact; check P; planted-number red control), Kokoro F/M voice, k2, mux. Witness: silences ≥ 4 s ≤ ~7 s, ebur128 ≈ −16 LUFS, `§FILM_DONE frames= planned=`.
Output `~/Videos/Vibe_Coding_Honest_Ledger_EN_AFTER_<date>_v1.mp4` (+ `_mobile`), never committed. Target ~3 min.

## Open (owner)
1. The fold-in: splice ~40 s of the finished When AI Dies film as it is (same voices, cheap), or re-voice those beats inside this film's dialogue.
2. Title.

## STATUS
2026-11-18: spec + storyboard written, awaiting the owner's go. Nothing built.
