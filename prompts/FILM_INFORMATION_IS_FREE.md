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
2026-11-16: spec written; mantra extracted from two sources; build next.
