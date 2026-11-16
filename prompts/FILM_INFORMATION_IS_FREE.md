# ⚠ DO NOT REMOVE
Scope: **SPEC and build ledger** for the film CH 0 *"Information is Free, You have to Know"*.
- Read every build log after every run; an exit code is not evidence. Spec first, then the build.
- The film itself is NEVER pushed: only its scripts, logs and this file are committed (owner, 2026-11-14).
- House style: `prompts/FILM_NARRATION.md` "HOUSE STYLE FOR ALL FUTURE FILMS", built from a copy of `scripts/film_cli_in_action/`.

## 0. The ask (owner, 2026-11-16, verbatim)
> *"Do a film, CH 0 'Information is Free, You have to Know' - narrate that no other project is more than open source, giving out all information in its github, including its specs and prompts, with well written user guides, translated to major languages. Show also the main screen login with some language change without going into details just focus on the theme. Last card is the 3 mine red1 mantra. If u cannot recall from learned memory of the original red1.org archived site, you should find it elsewhere as it was my well published mantra. Include credentials my email and MIT License and repo links"*

## 1. The mantra, EXTRACTED (never retyped from memory)
**Primary source:** the archived red1.org, page title "red1 open source empire". Web Archive captures `20080404030204` and `20090129032601` were both fetched 2026-11-16 with the same text. Under "A NEW CONSTITUTION":
```
Information Is Free ... U HAVE 2 KNOW
People Are Not ... U HAVE 2 PAY
Contributors Are Priceless ... U HAVE 2 BE
```
**Second source:** the ADempiere community wiki, page "Information is free" (`adempiere.io/community/wiki/preface/joining-the-adempiere-community/information-is-free.html`): "This is part of the 3-line mantra propounded by R. Oon. Information Is Free / People Are Not / Contributors Are Priceless".
**The last card shows the three lines exactly as the primary source writes them**, with its own capitalisation and `U HAVE 2 …` tails, and the source named in small type.

## 2. Facts the voice may say (measured 2026-11-16 on `origin/master` / `origin/main`; re-measure at build time in `facts.js`, and a number that changed is spoken as measured)
| Fact | Value | How measured |
|---|---|---|
| BIMCompiler: public, licence | PUBLIC, MIT License, "Copyright (c) 2025-2026 Redhuan D. Oon" | `gh repo view`, `LICENSE` |
| bim-ootb: public, licence | PUBLIC, MIT License, "Copyright (c) 2026 Redhuan D. Oon" | same |
| specs and prompts in the open | 369 `prompts/*.md` in BIMCompiler + 70 in bim-ootb | `git ls-tree` |
| witnesses (the checks, in the open too) | 251 + 1,416 `witness_*` files | `git ls-tree` |
| guide pages | 323 `docs/*.md` in BIMCompiler | `git ls-tree` |
| guide languages | English + 6: Spanish (Latin America), French, German, Indonesian, Japanese, Simplified Chinese | `mkdocs.yml` i18n block; live `/<lang>/` pages, DOCS_I18N.md §6e |
| translated so far | the home page, the User Guide and the CLI guide, in all six | `docs/*.<lang>.md` |
**Honest framing of "no other project is more open":** that is the owner's claim and it cannot be measured. The voice says it as a claim, e.g. *"We know of no other project that gives out more: not only the code, but the specs, the prompts that built it, and the checks that prove it."* Every count on screen comes from the table.

## 3. Storyboard (house style: two frames, the terminal typed above with real key sounds, the real page below; voice after the return key; F asks, M answers)
Each beat: a line typed in the top frame, and the REAL page it refers to in the lower frame (a headless capture, software GL, never a drawing).
| # | Typed line (top) | Lower frame (real capture) | Voice (F/M, idea) |
|---|---|---|---|
| card | — | cover card: CH 0 · "Information is Free" / "You have to Know" | none |
| 1 | `git clone https://github.com/red1oon/BIMCompiler` | the BIMCompiler GitHub page | F: Is this the whole project? M: All of it, in the open, MIT licensed. |
| 2 | `ls prompts/ \| wc -l` (shows 369) | a spec file rendered on GitHub (e.g. `prompts/DOCS_I18N.md`) | F: Even the prompts? M: 369 specs and prompts here, 70 more in bim-ootb: how it was built, not just what. |
| 3 | `ls docs/ \| wc -l` | the docs site home page | the guides, written for people |
| 4 | `ls docs/FastScriptGuide.*.md` | the CLI guide, switching language with the chooser (en → es → ja → de) | translated to major languages |
| 5 | (no command; one short card line: "the login screen") | the ERP login card re-rendered by `#idmp-login-lang` in 3 to 4 languages, ~1.5 s each | the same openness in the product; no detail (owner: "just focus on the theme") |
| 6 | `head -1 LICENSE` (shows MIT License) | the LICENSE page on GitHub | free to read, copy and build on |
| card | — | THE MANTRA: the three lines of §1, exact | none, held 6-8 s |
| card | — | credits: Redhuan D. Oon · red1org@gmail.com (owner asked for it in the film) · MIT License · github.com/red1oon/BIMCompiler · github.com/red1oon/bim-ootb · red1oon.github.io/BIMCompiler · key sounds eklee CC BY 3.0 · voices Kokoro (local) | none |
- **Length:** ~90-120 s.
- **Language:** English first (Kokoro, local, no cloud). Other languages only on the owner's word.

## 4. Witness (numbers, not a listen)
- K2 (`k2.py`) PASS: no voice over the typing, and the key track is audible.
- Frames equal the planned sum.
- Silences ≥ 4 s are ≤ ~7 s.
- ebur128 ≈ −16 LUFS.
- Every spoken number is in `facts.json`, re-measured that run.
- The mantra card's text equals §1 byte for byte (`guard.js`).
- The bottom 230 px is empty for captions.

## STATUS
2026-11-16: spec written; mantra extracted from two sources. BUILD rc1/rc2 done the same day (see BUILD rc1 RESULT below); final = `~/Videos/Information_is_Free_CH0_EN_rc2.mp4`.

## BUILD rc1 RESULT (2026-11-16, English, CPU only, local Kokoro; pipeline `scripts/film_info_is_free/`, copied from `scripts/film_cli_in_action/`; logs `scripts/film_info_is_free/logs_rc1/`, `logs_rc2/`)
**Output:** `~/Videos/Information_is_Free_CH0_EN_rc2.mp4` (1920x1080, 24 fps, **87.333 s**, 2096 frames). `..._rc1.mp4` (88.125 s) was built first and is kept, never overwritten; rc2 differs only in a 0.4 s tail on the licence beat, to bring the longest silence under 7 s (rc1: 7.58 s). Film not committed (media stays out of git).
**Run:** `OUTMP4=… SKIP_CAPTURE=1 ./build.sh` (capture.js once, then reuse `out/shots/`); every `out/*.log` was read after the run.
**Witness (spec §4, each with its log line, rc2):**
| Check | Measured | Log line |
|---|---|---|
| K2 (no voice over typing, keys audible) | PASS, 5 typed beats, voice-only track in typing windows -180 dB vs about -16 dB in voice; keys 15.9 dB under voice rms, peak -9.3 dBFS | `k2.log §K2_VERDICT PASS beats=5 bad=0 audible=True` |
| Frames = planned | 2096 = 2096 (ffprobe `-count_frames` on the .mp4 also 2096) | `record.log §FILM_DONE dur=87.333 frames=2096 planned=2096`; `keysmix.log §KEYSMIX frames=2096` |
| Silences >= 4 s (-40 dB) | 0 - 4.17 s (cover, by design) and 73.9 - 80.67 s = **6.79 s** (rc1 was 7.58 s) | `witness_silence.log` |
| Loudness | **-16.7 LUFS** integrated (LRA 10.9) | `witness_ebur128.log` |
| Mantra card = spec §1 byte for byte | 3 lines, bytes 37/31/42, textContent and innerText of the rendered DOM both equal the fresh parse of §1 | `guard.log §GUARD_MANTRA OK ... byte_equal=true/true/true` |
| Credits card has every §3 item | 9 of 9 | `guard.log §GUARD_CREDITS OK` |
| Bottom 230 px empty | stills: exactly 1 colour in the band on all 170 (`cards.log bottom230_dirty=0`); 175 frames sampled from the encoded silent film: worst gray range 9.6/255 (encoder noise), nothing drawn | `witness_bottom230.log` |
| Every spoken number in facts.json, re-measured this run | 6 `says` entries all OK; no digit in the voice text; claim worded as a claim | `guard.log §GUARD_VERDICT PASS judged=10 bad=0` |
| Voice fit | 7 of 7 beats DETAIL, 0 WRONG tone (one reworded after WRONG, below) | `fit.log §NARR_FIT`, `§NARR_TONE` |
**Facts re-measured at build time (`facts.log`, origin/master `bd245ef4a`, origin/main `8c3f0af6`):** BIMCompiler PUBLIC, MIT License, "Copyright (c) 2025-2026 Redhuan D. Oon"; bim-ootb PUBLIC, MIT License, "Copyright (c) 2026 Redhuan D. Oon"; `prompts/*.md` 369 + 70; `docs/**/*.md` 323; guide languages besides English 6 (mkdocs i18n = `docs/FastScriptGuide.<lang>.md` = de,es,fr,id,ja,zh). **Spoken:** 369, 70, 323, six languages, M I T. **Changed from the spec table:** `witness_*` files are now 358 + 1,424 (spec said 251 + 1,416); not spoken, not on screen.
**Beats as built** (cue = film second; the voice starts 0.63 s after the return key in every typed beat):
| # | Typed line | Lower frame (real capture, 1280x358 at 1.5, Playwright, `--disable-gpu`) | Dialogue |
|---|---|---|---|
| cover | - | cover card 3.6 s | none |
| 1 (3.6 s) | `git clone https://github.com/red1oon/BIMCompiler` -> answer `Cloning into 'BIMCompiler'...` | github.com/red1oon/BIMCompiler | F: Is this the whole project? M: All of it. In the open, and M I T licensed. |
| 2 (12.6 s) | `ls prompts/*.md \| wc -l` -> `369` | github.com/.../blob/master/prompts/DOCS_I18N.md | F: Even the prompts? M: Three hundred sixty-nine specs and prompts here, and seventy more in the second repository. How it was built, not just what. F: Does anyone give more? M: We know of no other project that gives out more: not only the code, but the specs, the prompts that built it, and the checks that prove it. |
| 3 (34.4 s) | `find docs -name '*.md' \| wc -l` -> `323` | red1oon.github.io/BIMCompiler/ (home) | F: Is there help for newcomers? M: Guides, written for people. Three hundred twenty-three pages in the docs. |
| 4 (44.0 s) | `ls docs/FastScriptGuide.*.md` -> the six file names | /FastScriptGuide/ English, the chooser opened (7 choices read from the DOM), then es, ja, de reached by clicking each chooser link | F: Only in English? M: No. The command line guide comes in six more languages: Spanish, French, German, Indonesian, Japanese and Chinese. Here it is in Spanish, in Japanese, in German. |
| 5 (60.0 s) | none (a dim comment line, no key sounds) | bim-ootb `erp/idempiere.html` login card re-rendered through `#idmp-login-lang`: English, Spanish, Japanese, Chinese, 1.8 s each; no login | F: And the product itself? M: The same openness. Here is its login screen, in four languages. |
| 6 (67.2 s) | `head -1 LICENSE` -> `MIT License` | github.com/.../blob/master/LICENSE | F: Can I use it? M: Read it, copy it, build on it. It is M I T licensed. |
| mantra (74.3 s) | - | the 3 lines of §1 + source in small type, held 6.0 s | none |
| credits (80.3 s) | - | the §3 credits card, held 7.0 s | M: That is the project. The links are on this card. |
**Deviations from the spec (each deliberate):**
1. **One short M line on the credits card** (spec: no voice). Without it the licence tail plus the silent mantra card plus the silent credits card is a 13 s silence; with it the longest silence is 6.79 s.
2. **Beat 2 typed `ls prompts/*.md | wc -l`, beat 3 `find docs -name '*.md' | wc -l`** (spec: `ls prompts/ | wc -l`, `ls docs/ | wc -l`): the spec's literal lines would print other numbers (`ls docs/ | wc -l` is 137, not 323). The shown numbers are the counts of those exact commands on the remote head (`git ls-tree`), the same values `facts.json` carries.
3. **The `git clone` answer is its real first line only** (`Cloning into 'BIMCompiler'...`), taken from a real shallow blob-less no-checkout clone into a temp folder (`facts.log`: exit 0). The full clone was not run.
4. **Beat 5 uses a dim comment line `# the product itself: its login screen (nothing is typed, nobody logs in)`** as its "one short card line", and the languages are en, es, ja, zh (the picker also has fr, de, ar, ms, th).
5. The cover/mantra/credits cards add: kicker "CH 0"; mantra kicker "A NEW CONSTITUTION" (the source's own heading); the credits card names qubodup beside eklee, as the licence page requires.
**Did not work / caveats:** the first fit left "And for people who just want to use it?" classed WH (tone WRONG); reworded to "Is there help for newcomers?" (now YN OK). `tsv.js`/`beatlen.js` of the original pipeline counted fixed answer stills as typing, which pushed the voice of the language-switch beat past its pictures; fixed here by marking typing stills (`typing:true` in `plan.json`). The language pictures in beat 4 are timed to the voice by estimate (130/80/56/44 frames), not by word timestamps. The lower frames are real pages captured 2026-11-16 (the bar above each says so); the terminal and the browser are not linked live. Playwright lives in `/home/red1/bim-ootb/tests/node_modules` (not `node_modules/`).
