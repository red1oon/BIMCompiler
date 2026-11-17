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
| close | — | last card: prior art (rows read by check P) + credentials (PR numbers + witness verdicts from this build's logs) + key-sound credit | facts.json |

**The honest proof for "no AI, no network" (new check, film-side, `scripts/film_when_ai_dies/offline.js`, read-only over the bim-ootb tree):**
this machine cannot cut one process off the network without root (measured 2026-11-18: `unshare -rn` → *uid_map: Operation not permitted*;
`bwrap --unshare-net` → *RTM_NEWADDR: Operation not permitted*; `kernel.apparmor_restrict_unprivileged_userns = 1`), so the film does NOT claim
"we pulled the plug". Instead `offline.js` parses (espree) every packed X0 source file and lists each network door (`require('http'|'https'|'net'|
'tls'|'dgram')`, `fetch(`, `WebSocket`, `XMLHttpRequest`, `child_process` calls to `gh`/`git push`/`curl`) BY FEATURE, printing
`§X0_OFFLINE files= understanding_features_net=0 ship_features_net=N … verdict=` — the code-understanding features (references, hovers, lens,
purity, context) must have 0; the Run & Ship features (Deploy, Fetch back, PR) are EXPECTED to talk to GitHub and the film says so. Red control: a
planted `fetch()` in a copy of a hover file must be counted. Empty population → INCONCLUSIVE. Plus `§X0_ISOLATION … deps=0` (nothing reaches the
browser, no dependencies) and the shoot profile's `"chat.disableAIFeatures": true`.

## Build plan (each step has its log; CPU only: headless + Xvfb + `--disable-gpu`, `nice -n 19`, never the GPU lock, ONE session at a time)
1. `facts.js <bim-ootb tree>`: runs the witnesses named above on a fresh `origin/main` worktree and writes `out/facts.json` from their `§` lines.
2. `offline.js <tree>` → `§X0_OFFLINE` (with its red control).
3. `shoot.sh <tree>` + `shots_suite.js`: the real VS Code drives each move (references, hover, lens, typed `Date.now()`, Bump, Context) and asks for a
   still at each step; `§FILM_SHOOT stills= errors=0`.
4. `build.sh`: cards, `guard.js` (`§FILM_GUARD`, every spoken digit is a fact, check P on prior art), voice (Kokoro, F/M dialogue), `k2.py`
   (`§K2_VERDICT PASS`), mux; `§FILM_DONE frames= planned=`. Witness: silences ≥ 4 s ≤ ~7 s, ebur128 ≈ −16 LUFS.
Output `~/Videos/When_AI_Dies_CH_EN_AFTER_<date>_v1.mp4`, never committed.

## STATUS
2026-11-18: spec written; build not started.
