# ⚠ DO NOT REMOVE — SCOPE: film 3, "The invoice dated yesterday" (working title): VS Code above, the real ERP page below, ENGLISH ONLY. The whole film is one real bug found and fixed in the editor, with the result shown in the ERP page. Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line; a number that no longer matches FAILS the build (`§FILM_GUARD`). The film file is never committed, only these scripts.

**Written 2026-11-14**, owner: *"Will it be good to make a film that splits upper is VSC and lower is the canvas showing the effect of code onto browser? We can show something that debugs ERP first."* → *"Yes, and do English only for now"* → *"Go"*. Other scenarios kept for later: `prompts/CODE_ARCHITECTURE_DESIGN.md` ▶▶ 4b (Scenario 2 "Replay can't lie", Scenario 3 "A posting that won't balance").
House style: `prompts/FILM_NARRATION.md` "HOUSE STYLE FOR ALL FUTURE FILMS" (split screen, REAL key sounds from `~/.local/share/film_narration/keys_eklee/`, typing first, voice after the return key, credit on the end card). Mechanics to copy: `scripts/film_cli_in_action/` (lower frame, tsv, keys, k2 check, build) and `scripts/film_ide_x0_2/` (real VS Code on a private virtual display, `plan.js`/`shoot.sh`/`shots_suite.js`, `build.py`).

## The bug (all facts re-derivable)
bim-ootb **#2996**, fixed by **#3010** (merge commit `614bb121`; OLD tree = `614bb121^`, NEW tree = `614bb121`). The headless web-service kernel `erp/ws_kernel.js` `env()` cut the session day from `toISOString()`, the UTC day. At 00:30 local in `Asia/Kuala_Lumpur` an invoice made through it was dated the 12th. Legacy dates by the local day (`CompiereService.java:281-283`, a reference only, never shown as code on screen unless the owner says so). Witness line, already shipped: `§REPLAY_CLOCK_SESSION_DAY tz=Asia/Kuala_Lumpur local_clock=2026-11-13 00:30 session_day=2026-11-12 same=N` (OLD) → `same=Y` (NEW), from `erp/tests/witness_replay_clock.js`.
**Honest framing (must be on screen):** the bug is in the kernel the web services use, not in the page. The lower frame is the real ERP page (`erp/idempiere.html`, Invoice window) **opened again on the kernel's database after each step**, not a live link (same statement as CLI in Action).

## Beats (the beat ids are the tsv ids)
| id | top (VS Code, real) | bottom (ERP page, real, on the data of that step) | numbers from |
|---|---|---|---|
| open | title card, one line | nothing | — |
| wrong | terminal strip: the witness run, the `§REPLAY_CLOCK_SESSION_DAY … same=N` line | Invoice window, the new invoice: Date Invoiced = 12th, Created = 13th 00:30 | `facts.json` from the OLD run (DOM text of the page, checked against the kernel's own row) |
| hover | hover on the `§REPLAY_CLOCK_SESSION_DAY` tag: the add-on shows the last value (§F.15) | same | add-on hover text captured by `shots_suite.js` |
| find | F12 on `env` in `erp/ws_kernel.js` → line 80 (OLD): `toISOString().slice(0, 10)` | same | the file's own line, read by `plan.js` |
| why | built-in Search for `toISOString` in `erp/` (real hit list, count read from VS Code) | same | `shots.log` |
| fix | the line TYPED (real key sounds, 6 real stills at typing checkpoints), save | same | the NEW line is read from `614bb121`, not typed by hand into the script |
| proof | Run local: `§REPLAY_CLOCK_SESSION_DAY … same=Y`, then `§WITNESS_ENV_VIEWS pass=7 fail=0` | Invoice window re-opened on the NEW run's data: Date Invoiced = 13th | `facts.json` NEW run |
| close | end card: what changed (one line, +2/-2), the three witnesses, key-sound credit | — | the PR (#3010) numbers |
Voice after each return key; English; the PLAYBOOK dialogue style is NOT used here (one narrator, measured, plain). Order of work is this table's order.

## Build plan (each step has its log)
1. `scripts/film_ide_erp_debug/` copied from the two house-style folders. Two bim-ootb worktrees (OLD, NEW) reused if present (`git worktree list` first). 2. `facts.js`: runs the witness twice with the clock fixed at 2026-11-13 00:30 `TZ=Asia/Kuala_Lumpur` (the child-process method of `witness_replay_clock.js`), writes the kernel DB of each run, opens the ERP page on it headless on the CPU (puppeteer, as CLI in Action does) and reads the Invoice grid text. 3. `shoot.sh`: real VS Code, virtual display, `--disable-gpu`. 4. `build.py`/`guard.js`: `§FILM_GUARD` fails on any spoken number that is not in `facts.json`/`shots.log`; `k2.py` key-sound check must pass. 5. Output `~/Videos/Invoice_Dated_Yesterday_EN_AFTER_<date>_v1.mp4`, never committed.
**Not claimed:** nothing is live-linked; the ERP page shows data the kernel wrote earlier. No model is called (no paid calls). No GPU. The local-day rule is what the ERP page already did; only the kernel was wrong.

## STATUS
2026-11-14: spec written. Not built. Next: step 1 and 2 (facts first, since every later step reads them).
