# ⚠ DO NOT REMOVE — SCOPE: the film "Vibe coding, honestly": what is unique about BIM OOTB + Kernel-ERP, its pros AND cons, whether it scales, how it compares with legacy iDempiere and with Odoo / ERPNext, and why it fits vibe coding; "When AI Dies" is pointed to by one card + link. ENGLISH only (VOCAB rule 2026-11-17: films EN only, other languages ad hoc). Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line this build produces (`out/facts.json`); a number that does not match FAILS the build (`§FILM_GUARD`). The film file is never committed, only the scripts, logs and this spec. Honour this block until STATUS says DONE.

**Asked 2026-11-18** (owner): *"Can we make a film that highlights the software uniqueness, pros and cons, on how it also fit vibe coding? Another session just did a film that depicts what if AI dies, how the VSC is equipped to carry on work. You may fold that in too."*
**Source text:** `docs/VibeProgramming.md` §"2026-11: An Outside Assessment, Fact-Checked" (PRs #905, #925; bim-ootb README fix #3229). The film voices only what that section kept or rephrased, never what it rejected.
**House style:** `prompts/FILM_NARRATION.md` HOUSE STYLE 1–6 (split screen, real key sounds, typing first and voice after the return key, two-colour cover, the part that changes shown large, one terminal font) + LAST CARD + GUIDE LINK + PLAYBOOK C (before/after in the first 25 s, show then prove, honest limits in the voice, roadmap card "not built yet", silent 3.6 s chapter cards). Mechanics: copy `scripts/film_when_ai_dies/` to `scripts/film_vibe_ledger/` (`facts.js` → shoot → `guard.js` with check P → `cards.js` → voice → `k2.py` → mux).

**Added 2026-11-18 (owner, same session):** *"Also about its scalability, from Gemini"* (pasted review) · *"do compare it against its idempiere Java/IDE/PG DB legacy"* · *"and even Odoo/ERPNext in our choice of JS vs Python/Php"* (note: neither is PHP; both are Python servers with a JavaScript screen — said so in the film) · *"Giving graphical tables to illustrate"*. Fact-checked text: `docs/VibeProgramming.md` §"A second outside view: does it scale?" and §"Against the legacy and the peers".
**Decisions (owner, 2026-11-18):** fold-in = **card + link only** (no spliced footage) · title = **"Vibe coding, honestly"** (sub-line: the strengths, the weaknesses, the proof).

## The message (one line per chapter)
1. **Unique:** one browser tab runs a BIM viewer, a modeller and a full ERP, from one signed log, with no server.
2. **Why vibe coding fits:** the AI copies patterns well (twenty years of iDempiere, the BOM) and guesses where there are none (geometry), so every claim gets a witness that checks it as numbers.
3. **Does it scale:** ~316K lines of app JS with no build step, held by a pure core checked in CI and the editor tools; the next guardrails (manifests, named parts, owner table, proof map) are designed, not built; the ERP's precache list is already 411 entries.
4. **Against the legacy and the peers:** iDempiere is 1.43M lines of Java with types, a compiler and a debugger; Odoo and ERPNext already write much of their screen in JavaScript but keep the books on a Python server. Ours keeps the books in the tab, and matches the legacy books on every scenario compared, with 19 of 34 document tables covered.
5. **The weaknesses, said plainly:** the collapse happens here too and gets caught; only ~20 of 1,491 witnesses run in CI; our own README numbers drifted (and an AI review repeated the wrong one); hard to learn; the attack surface is smaller, not zero.

## Beats (top = typed strip, real key sounds, the command really run on the pinned trees; bottom = its real output shown large, a real page, or a graphical table)
Trees: bim-ootb `origin/main` @ `aa427638` (`/tmp/wt-film-ootb`, detached, clean) · bim-compiler `origin/master` · iDempiere local source `87968daa73`.
| id | top (typed) | bottom | facts |
|---|---|---|---|
| cover | — | two-colour card: kicker `VIBE CODING · THE HONEST LEDGER` · "Vibe coding," / "honestly" · "the strengths, the weaknesses, the proof" | — |
| before | `# the industry, 2025` | **chart G1**: three bar pairs (churn 3.1→7.1 %, trust 40→29 %, Veracode 45 % failing), each with its source | VibeProgramming.md rows (check P) |
| after | `git rev-list --count HEAD` | the live landing page (headless, CPU) | `§VL commits` |
| ch1 | — | silent card "1 · What is unique" | — |
| u1 | `node -p "require('./package.json').dependencies"` | package.json, the "no build" line and its one dependency, large | `§VL deps` |
| u2 | `node erp/tests/witness_roster_verify.js` | its § lines large: forged op rejected, verdict | the witness's own lines |
| ch2 | — | silent card "2 · Why vibe coding fits" | — |
| v1 | `git log --since=2026-06-01 --until=2026-07-01 --oneline -- erp \| wc -l` | two-lane card ERP (pattern → ship) vs GEOMETRY (no pattern → drift → witness) | `§VL erp_june` |
| v2 | `git ls-files \| grep -cE 'witness[^/]*\.js$'` | the count, large | `§VL witness_files` |
| ch3 | — | silent card "3 · Does it scale?" | — |
| s1 | `bash size_stack.sh .` | **chart G2**: lines by kind (app JS, HTML, witnesses, third-party) + "core files pure: 125, forbidden 0, in CI" | `§STACK_SIZE`, `§CORE_PURE` |
| s2 | `# what is not there yet?` | graphical table: B1 not built · C, D not started · ERP precache 411 · C7 57 s skipped in CI · boot budgets not set · ~0.17 GB per million vertices | design file lines, size_stack |
| ch4 | — | silent card "4 · Against the legacy and the peers" | — |
| l1 | `find . -name '*.java' \| xargs cat \| wc -l` (iDempiere tree) | **chart G3**: Java lines vs Kernel ERP JS lines; parity 113 of 113 | `§VL idem_lines`, `§VL erp_lines`, run_all log |
| l2 | `gh api repos/odoo/odoo/languages` | **chart G4**: language share, stacked, 4 projects (JavaScript / server language / other) | `§VL langs` |
| l3 | — | **graphical table G5**: where the books live · database · developer tools · stars · proof | VibeProgramming.md table |
| ch5 | — | silent card "5 · The weaknesses, said plainly" | — |
| c1 | `# did it collapse here too?` | card: three dated failures → each became a written rule | VibeProgramming.md (check P) |
| c2 | `grep -ohE 'witness[A-Za-z0-9_]*' .github/workflows/*.yml \| sort -u \| wc -l` | **chart G6**: meter, ~20 of 1,491 in CI | `§VL ci_witness` |
| c3 | the app-file count | before/after: README "about 2,600" → measured; "an AI review repeated our first wrong number" | `§VL appfiles`, README at #3229^ |
| c5 | `# what does it still talk to?` | card: OCI · CDN fallback · GitHub + Gmail relay · iDempiere web services · keys in the tab · + the learning curve | VibeProgramming.md rows |
| aid | `# and if the AI goes away?` | card: the film *When AI Dies* + the Developer Guide X0 link | — |
| roadmap | — | card "not built yet": the full witness suite in CI · B1 manifest · named parts / owner table / proof map | design file §2 |
| close | — | LAST CARD: prior art (rows read by check P) · credentials (#905 #925 #3229 #3234 #923 + verdicts) · guide link · key-sound credit | facts.json, `§FILM_GUIDE` |

**Charts (dataviz skill):** static frames (a film has no hover), dark surface `#0f172a`; series colours dark slots blue `#3987e5` (this project / JavaScript), orange `#d95926` (the server language), aqua `#199e70` (a third series) — validated 2026-11-18: lightness band, chroma floor, CVD ΔE 9.4 (deutan), normal-vision 26.5, contrast ≥ 3:1 all PASS; grey `#64748b` for "other". Text in text colours, never the series colour; every bar direct-labelled with its value; one axis per chart; a legend wherever there are ≥ 2 series.

**Guide link:** `https://red1oon.github.io/BIMCompiler/VibeProgramming/#2026-11-an-outside-assessment-fact-checked` — must be deployed (`scripts/safe_gh_deploy.sh`) before posting; `§FILM_GUIDE … anchor=Y` fails until then.

## Build plan (CPU only: headless + `--disable-gpu`, `nice -n 19`, never the GPU lock)
1. `facts.js`: runs every typed command on its pinned tree, saves its real output as the strip's answer, parses the `§VL` values → `out/facts.json`.
2. `cards.js`: stills (typed strip + bottom), charts as HTML/SVG drawn by headless Chrome; overflow measured.
3. `guard.js`: every digit on a card and every number word in the voice is a recorded fact; check P on the doc rows; planted-number red control.
4. `build.sh` (copied from `scripts/film_when_ai_dies/`): measure voice → beat lengths → silent picture → fit (Kokoro F/M) → mux → key sounds → `k2.py`.
Output `~/Videos/Vibe_Coding_Honestly_EN_AFTER_<date>_v1.mp4` (+ `_mobile`), never committed. Target ~4.5 min.

## STATUS
2026-11-18: spec + storyboard v2 (owner's additions); building.
