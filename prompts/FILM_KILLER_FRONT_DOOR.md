# ⚠ DO NOT REMOVE — FILM "START FROM YOUR OWN FILE" (the killer front door): PLAN ONLY
# Scope: storyboard + shot list for a short film on `prompts/SHEET_FRONT_DOOR.md` + `prompts/PDF_EDITOR.md` ("resume killer").
# Show only what exists; every shot is READY (on bim-ootb main) or `NEEDS: <feature>`. Every number on screen or in the voice comes from a
# `§` line of the take. READ THE LOG after every run (facts, guard, record, k2); an exit code is not evidence. No render, GPU, paid call.
# House rules followed: `prompts/FILM_NARRATION.md` HOUSE STYLE (split screen + real key sounds, two-colour cover, last card, guide link);
# films are never pushed, only scripts (`~/Videos/` holds the output); no private client names; no other product named on screen.

## ▶ RESUME HERE (2026-11-27)
**State: PLAN ONLY. Nothing recorded, no script written.** Read this file, answer the 3 questions in §5, then build per §4.
Read first when building: `SHEET_FRONT_DOOR.md` ▶▶ block + §5 §6.4 §7.4 §7.5 (facts), `PDF_EDITOR.md` §4.2-§4.4 (page + write-back results),
`FILM_NARRATION.md` PLAYBOOK C. Before shooting, re-check each `NEEDS` tag against bim-ootb `origin/main` (the in-flight work may have merged).

## 1. Promise and audience
**Promise (one sentence):** *Open the PDF or spreadsheet you already have, find out in seconds whether it adds up, and go on into the ERP only if you choose.*
**For:** a lay user of PDF and Excel (an owner, bookkeeper or site clerk) who gets reports as PDFs and keeps their own sheets. No ERP, BIM or code
words anywhere: "report", "sheet", "adds up", "history", "file it". Principle first, then the example (owner rule 2026-11-24).

## 2. Look and sound (owner's standing rules, applied exactly)
- **Split screen, top and bottom.** Top strip: a line TYPED character by character with REAL key sounds (eklee/qubodup samples, credited on the end card),
  voice starts after the return key, check K2 must pass. Bottom: the REAL page, captured, cropped to the part that changes, large (check Z: each
  step differs from the last by a measured share of pixels, else NO-OP in the log). One font size in the strip all film (check T).
- **What is typed:** where the user really types (the Find word, the changed digit), those very keystrokes. Elsewhere the strip types the step in plain
  words (`open my report`, `read it as a sheet`) - a film device, stated on the last card, never shown as a command that exists.
- **Cards:** cover = two-colour chapter card (red kicker, white title, grey line); one plain dark chapter card (3.6 s, no voice) between stages;
  last card = prior art, credentials (PR numbers, witness verdicts from the logs), key-sound credit, the guide link.
- **No other product named or compared on screen** (the clean-room source of the editor lane is not mentioned).

## 3. Storyboard (8 beats; times = voice + typing, to be re-measured; narration is one short line, spoken numbers in words)
| # | Beat (stage) | On screen (real page / file / click) | Narration (plain) | Proof number on screen | s | Status |
|---|---|---|---|---|---|---|
| 0 | Cover | card: `YOUR OWN FILE · CH 1` / "Start from your own file" / "No ERP window needed" | none | - | 4 | READY |
| 1 | **Stage 1** Your report, opened on your own computer | `pdf/index.html`: Open a PDF (real file chooser) on `trial_balance_th.pdf`; the line "Nothing is uploaded: the file stays on this device." | "A report in a PDF is a picture of a sheet. Here is one, opened on this computer. Nothing is sent anywhere." | page 1, 21 accounts; requests made after the file is chosen, counted by the take (claim only if the count is 0) | 16 | READY |
| 2 | It is a normal reader first | `market_impact_report.pdf`: type `market` in Find (real keystrokes), click an outline entry | "First it is just a good reader. Search the words. Jump by the outline." | 12 pages, 23 outline entries, 45 hits | 12 | READY |
| 3 | Read it as a sheet | back to the trial balance; click **Read as sheet**; the grid fills; hover D28, its box lights on the page | "Now read it as a sheet. Every figure lands in the cell it was printed from, and the page checks the columns add up." | `Page 1 adds up`, 144 of 144 cells, debit = credit = 40,392.44 | 26 | READY |
| 4 | One changed digit is caught | same read on a copy with one digit changed (498.09 to 499.09), said aloud as "a copy where I changed one digit" | "Change one digit and it does not add up. It names the cell and both figures." | `does NOT add up: D28 printed 40392.44 != rows sum 40393.44` | 16 | READY (prep: the altered copy, §4) |
| 5 | Take it away, offline | click **Download .xlsx** (status line shows the file); hover D28 shows `=SUM(D6:D26)`; network switched off, page reloaded, report still read | "Keep it as a spreadsheet file, totals as real sums. Switch the network off and it still works." | 144 cells, `=SUM(D6:D26)`, offline ready | 20 | READY |
| 6 | Change a number, get the same PDF back, with a memory | edit one figure in the sheet; save; the same PDF reopens with the new figure in the old one's place, nothing else moved; the change listed in its history | "Change a figure and the same PDF comes back, with the new figure where the old one was. The change is written down." | from the take's own write-back log (old figure gone, no other text moved, one history entry); never before it exists | 26 | NEEDS: numbers-only write-back (`PDF_EDITOR.md` §4.3/§4.4) |
| 7 | Your own Excel gets the same memory | the user's workbook, ribbon menu: **Stamp**, **Cell history** (a cell's story), a hand-edited past refused, two emailed copies merged with the clash shown | "Your own spreadsheet keeps its own history. Edit the past and it is caught. Two copies merge and show where they disagree." | witness figures only: one clash shown with both values (11 and 22), tamper caught at the exact entry | 30 | NEEDS: Excel ribbon menu (Stamp, Cell history) AND a real run in Excel (none yet; a fake-host run is not shot) |
| - | Chapter card (plain, no voice) | `YOUR CHOICE` / "Take it into the ERP, if you want" | none | - | 3.6 | READY |
| 8 | **Stage 2** File it | same ribbon: **File it** on the user's own invoice layout (Oak 2 x 61.75, Elm 3 x 10.00); the ERP window shows the real invoice; then the same sheet with the printed subtotal made 153.51 is refused | "When you choose, the sheet files a real invoice through the ERP's own import. If a printed total is wrong, it stops and says which." | subtotal 153.50, grand total 153.5, refusal `lines 153.50 != printed 153.51` | 30 | NEEDS: Excel ribbon menu (File it) + `sheet_door.js` wired to a page/menu |
| - | Last card | prior art (what was read, what was taken), PRs #3470 #3472 #3466 #3467 + witness verdicts, key-sound credit, guide link, honest limits | none | W-SHEET-READER 37 judged 0 failed (re-read the log) | 12 | READY |
Stage 1 = beats 1-7 (standalone, no ERP in sight). The arc ends on the choice: "Your file first. The ERP when you want it." (spoken over the last card's lead line).
**Limits said on the last card, in plain words:** 3 of 5 report layouts tried are rebuilt; scans are not read; the same-PDF write-back covers
numbers only; real Excel not yet run (drop this line the day it has been); no many-users or speed claim; no e-invoice compliance claim.

## 4. Cuts and what must be scripted
**A. Cut that can be shot today (READY beats only): beats 0, 1, 2, 3, 4, 5 + last card ≈ 1:45.** No Excel and no stage 2, so the last beat before
the card is a plain "not built yet" card (PLAYBOOK C rule 4) listing: same PDF back with the change, your own Excel menu, File it. It sells stage 1 honestly.
**B. Fuller cut when the in-flight work lands: all 8 beats + both cards ≈ 3:20.** Each NEEDS beat is shot only when `origin/main` has the feature and its
witness is green; a beat whose feature is not there is cut, never faked. Beat 6 may ship before 7-8 as cut A + 6 (≈ 2:15).
**Scripted take (copy `scripts/film_cli_in_action/`, new dir `scripts/film_killer_front_door/`; `FILM_LANG=en|zh|th`, one `out_<lang>/` each):**
- `facts.js`: serve a `bim-ootb` worktree at `origin/main` with `python3 -m http.server` (never the shared checkout); headless Chrome `--disable-gpu`,
  device scale 2, puppeteer from `~/bim-compiler/node_modules`. Drive the real `pdf/index.html`: `#b-open` + `waitForFileChooser` (as `pdf/tests/witness_pdfed_page.js`
  does), `#q` typed, `#outline a` click, `#b-sheet`, hover `td[data-a="D28"]` (box lights), `#b-xlsx` (download event), CDP offline + reload for beat 5. Each
  step logs its `§` line (`§PDFED-OPEN`, `§PDFED-FIND`, `§SHEET_READER`, `§PDFED-XLSX`, `§PDFED-OFFLINE`) and a crop of `#verdict`+`#grid`, `#hits`, or `#stat`.
- **Files** (`pdf/corpus/`): `trial_balance_th.pdf` (beats 1, 3, 4, 5), `market_impact_report.pdf` (beat 2). Beat 4 needs one prepared file made at run time,
  never committed (like the V4 copies): the trial balance with one digit changed, checked with `pdftotext -raw` that it reads 499.09 and nothing else differs.
  Beat 6: the page's own write-back output on the same file. Beats 7-8: the workbook and `ninja_sample.xlsx`-style sample the Excel menu ships with; the
  invoice layout from `erp/tests/witness_sheet_door.js` (GardenWorld seed).
- `guard.js`: every digit on a card or in the voice is a fact of `facts.json` (planted-number control); the on-screen numbers above are re-read from the
  take, not from this table. `cards.js` checks card overflow and the 230 px empty caption band. `record.js`, `beatlen.js`, fit (Kokoro EN; zh/th Edge TTS as in the
  CLI film), two-pass loudnorm mux, `keys.py`, `k2.py` as in `build.sh`. Frames measured equal the plan; silences ≤ about 7 s; `§FILM_GUIDE url= http= anchor=`.
- **Guide gap to close before posting (checked 2026-11-27):** no page under `docs/` mentions "Read as sheet" or the PDF page; add a guide section, then link
  `https://red1oon.github.io/BIMCompiler/<page>/#<anchor>` on the last card. Do not link a page that does not cover it.
- Never push the mp4/wav/stills; commit the scripts, logs and this spec only. Output name e.g. `~/Videos/Start_From_Your_Own_File_<LANG>_rc1.mp4`.

## 5. Open questions for the owner (a real decision each)
1. **One film or two?** Shoot cut A (≈ 1:45, PDF only) now as Part 1 and cut B's extra beats later as Part 2 - or wait and make one ≈ 3:20 film once write-back and the Excel menu are merged? (Recommendation: Part 1 now; stage 2 is the film's point and needs the menu.)
2. **Languages:** English only first, or EN + ZH + TH like the CLI film (zh/th narration text goes to the free Edge voice service, cached by text; English stays local)?
3. **Title and cover:** "Start from your own file" (working), or a hook line such as "Does your report really add up?"; and the series kicker (`YOUR OWN FILE · CH 1`).
