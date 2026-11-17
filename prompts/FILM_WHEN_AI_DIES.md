# ⚠ DO NOT REMOVE — SCOPE: the film "When AI Dies" (a new chapter, CH "When AI Dies"): why the X0 VS Code tooling of `prompts/CODE_ARCHITECTURE_DESIGN.md` Part F matters when there is no AI assistant, shown on the REAL VS Code with AI features switched off and the real bim-ootb tree. ENGLISH first. Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line produced by this build (`out/facts.json`); a number that does not match FAILS the build (`§FILM_GUARD`). The film file is never committed, only the scripts, logs and this spec. Honour this block until STATUS says DONE.

**Asked 2026-11-18** (owner, closing a "resume VSC" session): *"make a film why the VSC stands out and is important in case, CH 'When AI Dies' - your vibe
coding days may be over, unless you setup your IDE to be .."*, with a Gemini summary of the lane attached and *"u may give your own better one"*.
House style: `prompts/FILM_NARRATION.md` HOUSE STYLE (split screen, REAL key sounds, typing first and voice after the return key, the last card with prior
art + credentials) and PLAYBOOK C (before/after in the first 25 s, show then prove, roadmap card "not built yet", plain words, chapter cards silent
3.6 s on a plain dark background). Mechanics: copy `scripts/film_immersive_software/` (real VS Code on a private virtual display via `shoot.sh` +
an extension-tests suite, `facts.js` → `shoot.sh` → `build.sh`, `guard.js` with check P, `k2.py`, `cards.js`) to `scripts/film_when_ai_dies/`.

## The message (this lane's own take, checked against the code; it replaces the Gemini summary)
What the Gemini summary got right: structure over magic, the extension holds no knowledge of the codebase, AI as an optional passenger.
What it got wrong, and the film must NOT say: Parts C, D and E are **not built** (designed only); there are no "typed parts" (no TypeScript in the app,
by rule); "300k lines" and "54+ files" are numbers to re-measure, not quote (§M of the design file). The film shows only what is built and merged.
1. **An assistant guesses from text. When it is gone** (an outage, the price, a policy, a site with no signal), **what is left is what your tools KNOW.**
2. **X0 knows only what the repo itself generates and checks.** Every answer is a lookup in a generated file, or it says it does not know. It never guesses.
3. **Five questions every developer asks, each answered in one keystroke, with no AI:** where is this used · what runs when this field changes ·
   what did this line print last time · am I breaking replay · did I ship it right.
4. **When the AI comes back, it rides as a passenger:** *Context for this file* and the local facts server hand it the same facts (OFF by default).
5. **Not built yet** (one card): the module manifest (B0 check built, B1 next), named parts, the owner table, the proof map.

## Beats (ids = the tsv ids; top = typed strip with real key sounds; bottom = the real VS Code, AI features off, unless said)
| id | top (typed, then return) | bottom | numbers from |
|---|---|---|---|
| cover | — | card: kicker "When AI Dies" · title "Your vibe-coding days may be over" / "unless your editor knows your code" | — |
| before | `# the assistant is gone. ask the editor instead.` | VS Code with the setting `"chat.disableAIFeatures": true` visible in settings.json (the real setting the shoot profile uses) | — |
| q1 "Where is this used?" | `# where is APP.<field> used?` then `Shift+F12` | Find All References on a shared-object field (§F.19), the reference count in the panel | `§X0_REFS` / the suite's own count line |
| q2 "What runs when this field changes?" | `# what runs when I change this field?` | the ERP field hover with its layers in firing order (§F.22); Alt+N opens one layer at its line | `§ERP_HOVER_W` (`fields=`, `wrong_line=0`) |
| q3 "What did it print last time?" | `# what did this line print last time?` | the `§TAG` hover with the last provable value and its stamp (§F.4/§F.15) | `§LENS` line |
| q4 "Am I breaking replay?" | `Date.now()` typed into a core file | the core-purity warning on that line, with the reason and what to call instead (§F.35) | `§X0_CORE_PURE_W` |
| q5 "Did I ship it right?" | `# done. bump it.` | the Bump button: checking → solid → one press writes (§F.34), the parity gate inside | `§X0_BUMP_BUTTON`, `§BUMP_PARITY_W_VERDICT` |
| why | — | card: "It cannot drift: X0 holds no knowledge of the code; it reads what the repo generates" + the honest proof below | `§X0_OFFLINE` (below) |
| passenger | `# the AI is back. give it facts, not guesses.` | *Context for this file* output beside the code (§F.16) | `§X0_CONTEXT` |
| roadmap | — | card "not built yet": B1 manifest (next), C named parts, D owner table, E proof map | — |
| close | — | last card: prior art (rows read by check P) + credentials (PR numbers + witness verdicts from this build's logs) + the guide link (below) + key-sound credit | facts.json, `§FILM_GUIDE` |

**The honest proof for "no AI, no network" (new check, film-side, `scripts/film_when_ai_dies/offline.js`, read-only over the bim-ootb tree):**
this machine cannot cut one process off the network without root (measured 2026-11-18: `unshare -rn` → *uid_map: Operation not permitted*;
`bwrap --unshare-net` → *RTM_NEWADDR: Operation not permitted*; `kernel.apparmor_restrict_unprivileged_userns = 1`), so the film does NOT claim
"we pulled the plug". Instead `offline.js` parses (espree) every packed X0 source file and lists each network door (`require('http'|'https'|'net'|
'tls'|'dgram')`, `fetch(`, `WebSocket`, `XMLHttpRequest`, `child_process` calls to `gh`/`git push`/`curl`) BY FEATURE, printing
`§X0_OFFLINE files= understanding_features_net=0 ship_features_net=N … verdict=` — the code-understanding features (references, hovers, lens,
purity, context) must have 0; the Run & Ship features (Deploy, Fetch back, PR) are EXPECTED to talk to GitHub and the film says so. Red control: a
planted `fetch()` in a copy of a hover file must be counted. Empty population → INCONCLUSIVE. Plus `§X0_ISOLATION … deps=0` (nothing reaches the
browser, no dependencies) and the shoot profile's `"chat.disableAIFeatures": true`.

**Guide link (FILM_NARRATION house style, owner 2026-11-18):** `https://red1oon.github.io/BIMCompiler/DeveloperGuide/#41-x0-navigator-the-repos-own-vs-code-extension`
(HTTP 200 and anchor present, checked 2026-11-18). **Gap found the same day, CLOSED the same day:** the live guide (= `docs/DeveloperGuide.md` on master) now describes the Bump button (§F.34, row *Status bar ▸ Bump*) and the core-purity warning (§F.35, row *A yellow underline on a clock, random or network call in a core file*), deployed 2026-11-18. The build checks it: `§FILM_GUIDE url=… http=200 anchor=Y bump_described=Y core_pure_described=Y`.

## Build plan (each step has its log; CPU only: headless + Xvfb + `--disable-gpu`, `nice -n 19`, never the GPU lock, ONE session at a time)
1. `facts.js <bim-ootb tree>`: runs the witnesses named above on a fresh `origin/main` worktree and writes `out/facts.json` from their `§` lines.
2. `offline.js <tree>` → `§X0_OFFLINE` (with its red control).
3. `shoot.sh <tree>` + `shots_suite.js`: the real VS Code drives each move (references, hover, lens, typed `Date.now()`, Bump, Context) and asks for a
   still at each step; `§FILM_SHOOT stills= errors=0`.
4. `build.sh`: cards, `guard.js` (`§FILM_GUARD`, every spoken digit is a fact, check P on prior art), voice (Kokoro, F/M dialogue), `k2.py`
   (`§K2_VERDICT PASS`), mux; `§FILM_DONE frames= planned=`. Witness: silences ≥ 4 s ≤ ~7 s, ebur128 ≈ −16 LUFS.
Output `~/Videos/When_AI_Dies_CH_EN_AFTER_<date>_v1.mp4`, never committed.

## STATUS
2026-11-18: spec written. 2026-11-18 (later): **BUILT, English v1 and Thai v1, awaiting the owner's review; never committed (media), not posted.**
- `~/Videos/When_AI_Dies_CH_EN_AFTER_2026-11-18_v1.mp4` (1920x1080, 180.17 s, 4324 frames, -16.5 LUFS) and `~/Videos/When_AI_Dies_CH_TH_AFTER_2026-11-18_v1.mp4` (173.04 s, 4153 frames, -16.2 LUFS). Scripts `scripts/film_when_ai_dies/` (copy of `film_bim_layers`; `FILM_LANG=th` = Edge TTS th-TH Premwadee / Niwat, no pitch rise; texts `i18n.js`, `i18n_th.js`, `narr.js`, `narr_th.js`).
- Source of every number: bim-ootb `origin/main` @ `560b3541` (clean worktree; origin/main has since moved), the real VS Code 1.146.0 (AI features off: the editor itself reports `chat.disableAIFeatures=true`, ONE extension that is not built in), the real ERP page (headless Chromium, CPU), the witnesses' own logs in `out/`.
- Verdicts: `§FACTS VERDICT PASS` (refs, core-pure, isolation, lens, context, taghover, bump-button, bump-parity, erp-hover, realvsc all PASS) · `§X0_OFFLINE files=16 parsed=16 understanding_features=6 understanding_features_net=0 ship_features=3 ship_features_net=6 glue_net=0 red_control=DETECTED verdict=PASS` · `§FILM_SHOOT stills=10 errors=0` (tree started clean, every edit taken back, ended clean) · `§FILM_GUARD VERDICT PASS` EN 46 OK / TH 47 OK (incl. check P on 4 prior-art rows, a planted-number red control, `§FILM_GUIDE … http=200 anchor=Y`, Thai: no English left on a card) · `§CARDS_DONE … too_tall=0` · voice 10/10 `DETAIL`, 0 `WRONG` tone · `§KEYS_VERDICT PASS` · `§K2_VERDICT PASS beats=7 bad=0 audible=True` · `§FILM_DONE frames=4324 planned=4324` (TH 4153/4153) · longest silence 4.8 s (the silent cover card) · `ebur128` I -16.5 / -16.2 LUFS.
- What the build found: (1) the Bump button's "checking" state lasts ~0.7 s on a viewer file (the parity gate that makes it minutes runs only for `erp/` files and writes to the legacy test server, so it is NOT run here); it was caught honestly by a still taken 511 ms after the press, proven by the status-bar pixels differing between idle / checking / ready / written (`§FILM_GUARD`). (2) Real VS Code needs Do-Not-Disturb and a notification clear before each still (a JavaScript-features toast and a workspace-file toast appeared). (3) **X0 defect, not fixed:** `devtools/mcp/x0-facts/tests/witness_x0_mcp.js` is RED on main: `§X0_MCP … network_modules=1 verdict=FAIL`, because `lib/heap_impact.js` (F.31) does `require('http')` for a local 127.0.0.1 server (`http.createServer`, no outbound call) and the witness counts any module import; the film does not cite that witness (offline.js classifies the listener as local). (4) `§BUMP_PARITY_W` real-bridge row is `SKIPPED` (opt-in, writes to the pilot); the last card says so.
- Prior art on the last card (all READ, fetched 2026-11-18 into `out/prior/`): LSIF, Universal Ctags, Temporal Workflow Definition, Quokka.js. Credentials: bim-ootb #2966 #2970 #2985 #3055 #3162 #3209, all MERGED (read from GitHub). Thai: "translated by the build session, not reviewed by a native speaker" on the last card; the guide is English and the card says so.
- Rebuild: `node erp_shot.js <tree>`, `./shoot.sh <tree> <bim-compiler tree>`, `node facts.js <tree> <bim-compiler tree>`, `./build.sh`, `FILM_LANG=th ./build.sh`.
- **Mandarin cut (owner 2026-11-18, "Dropping a Mandarin version on my phone?"):** `~/Videos/When_AI_Dies_CH_ZH_AFTER_2026-11-18_v1.mp4` (1920x1080, 191.67 s, 4600 frames, 10.3 MB, -16.7 LUFS) and `…_v1_mobile.mp4` (1280x720, 4.5 MB, same 4600 frames). Edge TTS zh-CN Xiaoxiao (F) / Yunxi (M), no pitch rise; the voice says A-I and E-R-P letter by letter, the captions keep AI / ERP (`narration_cap.tsv`, `CAP_NATIVE=1`); captions split by `prompts/film_zh_caption_split.py` (`§ZH_CAPTIONS in=24 out=61 longest_chars=23`), font Noto Sans CJK SC; cards drawn by headless Chrome (no ffmpeg drawtext), texts `i18n_zh.js` (throws on a missing key) and `narr_zh.js`. Same facts and same bim-ootb commit `560b3541` as EN/TH (the worktree was recreated at that commit; origin/main has moved). Verdicts: `§FILM_GUARD VERDICT PASS` (47 OK, incl. no English left on a card, planted-number red control, `§FILM_GUIDE … http=200 anchor=Y`) · `§CARDS_DONE beats=11 stills=123 too_tall=0` · voice 10/10 `DETAIL`, 0 SHORT/WRONG · `§KEYS_VERDICT PASS` · `§K2_VERDICT PASS beats=7 bad=0 audible=True` · `§FILM_DONE dur=191.667 frames=4600 planned=4600` · longest silence 4.8 s (the silent cover). Last card in Chinese: guide link, "the guide is in English", "translated by the build session, not reviewed by a native speaker".
- Rebuilding the evidence on a fresh checkout (found while making the Mandarin cut): the lens value and the Bump warning depend on moving state, so `shoot.sh` now pins them in the shoot profile's own settings: `bimDevtools.extraLogDirs` = the one stamped 4D run folder the EN/TH cuts used (a newer stamped log from another session would otherwise change the §HOSTED_BEFORE_HOST value) and `bimDevtools.costBaseRef` = the pinned tree commit (origin/main had moved to a newer sw.js version, which silenced the bump warning). `guard.js` now checks the stills' tree is an ancestor of origin/main, and the sw.js version against the pinned commit, not the moving ref.

