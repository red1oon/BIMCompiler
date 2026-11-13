# ⚠ DO NOT REMOVE
SCOPE: the film that walks through the CAPEX UAT Guide (`docs/CapexUATGuide.md`, live at /BIMCompiler/CapexUATGuide/). Pipeline: `scripts/film_uat_guide/` (CPU only, no GPU, voices local Kokoro: no cloud call).
Every number spoken or shown is a fact read from the guide, the saved PDF or a § log line. **Read `build.log` after every run (`§FILM_*`); the exit code is not evidence.** The film file is NEVER pushed
(owner 2026-11-14: only scripts, logs and specs go to GitHub); it stays in `~/Videos/`. Layout rules: `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C.

## 1 SPEC (2026-11-14; owner's brief, verbatim)
> *"make a film to go thru the UAT guide, linger right away at the 2D illustration as a preamble, CH 0 'UAT or it doesn't work' - Part of any software project completion is a User Acceptance Test done
> independently. Not by AI but by qualified CTFL company, audited and signed.. Then click the Print PDF button, scroll thru it, but cut to my already done saved PDF in Dowloads/ and go thru its important
> parts the user should check. Point out what the user company should note. Closing card portray the software stds that such software has to comply with. Bottom line contact me Redhuan D. OON, CTFL,
> red1org@gmail SYSNOVA (UK/Bangladesh) for further information."* · then: *"Use /Pictures/SYSNOVALogo.png for last page"* · *"and opening too as it is sponsored by them"*

**Storyboard (one beat = one picture; chapter card silent 3.6 s, plain dark, no voice over it):**
| beat | picture (source) | what is said (two voices, F asks, M answers) |
|---|---|---|
| b01 preamble | the Shed floor plan, the guide's own picture B1-b (`docs/img/uat/uat_b1_sheet_0_floor_plan.png`), held 2.5 s before any voice; "Sponsored by" + the sponsor's logo | it is the client's own drawing; the software must be tested on it |
| card | CHAPTER 0 · UAT / or it doesn't work | (silent) |
| b02 | plain card with the owner's sentence | acceptance testing is independent: not by the AI, by a qualified CTFL company, audited and signed |
| b03 | the live guide page, the Print button ringed (ring placed from the button's DOM box) | the guide: do, confirm, tick; one button prints it |
| b04 | the page's own print layout (Chrome `page.pdf()` of the live page), scrolled | prints as a plain document |
| b05 | the owner's saved PDF, page 1: What you need / Who does what | 22 pages (pdfinfo); check page 1 first |
| b06 | saved PDF: the Shed floor plan page | chapter B uses your own drawings, labelled |
| b07 | saved PDF: a step table, the Pass / Fail boxes marked | do, confirm, tick by hand |
| b08 | saved PDF: a Notes line and Known limits | differences go on the notes line; do not fail a known limit |
| b09 | saved PDF: the Sign-off page | tester, date, passed / total, signature per chapter |
| b10 | card: what the user company should note (each line from the guide's own text) | independent; test client not live data; fixed test dates; keep the signed sheets |
| b11 | closing card: the standards, the sponsor's logo, the contact line | standards named; the contact is on screen (the address is NOT spoken) |
**Facts and their sources:** 22 pages = `pdfinfo` of the saved PDF · "dates set for 13 November 2026, colours drift" = guide p.1 · "GardenWorld test client" = guide A2/A3 · page numbers of each PDF picture =
found by text search in the PDF at build time (logged `§FILM_PDF`), never typed.
**Standards on the closing card (names only; the card claims no certificate):** ISO/IEC/IEEE 29119 Software testing · ISO/IEC 25010 Product quality · ISO/IEC/IEEE 12207 Software life cycle processes ·
ISTQB CTFL (acceptance testing) · ISO 19650 Information management using BIM · ISO 16739 IFC, open BIM data · ISO/IEC 27001 Information security · ISO 9001 Quality management. The heading is the owner's
wording ("has to comply with").
**Witness (numbers):** frames = sum of the segments; every beat DETAIL, 0 WRONG tone; silences ≥ 4 s listed (≤ ~7 s); ebur128 ≈ −16 LUFS; the bottom 230 px of every composed still is background only (the
caption band); the highlight boxes come from `pdftotext -bbox` word boxes. One contact sheet for a single layout look.

## 2 RESULT rc2 (2026-11-14; `scripts/film_uat_guide/build_rc2.log` read)
`~/Videos/CAPEX_UAT_Guide_film_EN_2026-11-14_rc2.mp4` (not pushed). **125.29 s, 3,007 frames = the picture's 3,007**; 13 segments (11 beats, the chapter card, the Notes / Known limits beat as two stills).
- **Voice:** 11 of 11 beats DETAIL, 0 tone WRONG (Kokoro local, F af_heart / M am_michael, base 1.15). Loudness −17.0 LUFS. Silences ≥ 4 s: 5.34 s and 6.23 s (the chapter card and the closing hold; bar ≤ ~7 s).
- **Facts shown:** the saved PDF has 22 pages (pdfinfo); pages found by text search: first page 1, floor plan 7, step table 9, Notes line 15, Known limits 21, Sign-off 22. The Print button's box is read from the live page's DOM (`§FILM_SHOT button=…`, 0 page errors). The print scroll is Chrome's own print layout of the live page (6 pages stacked, 3,400 px travelled in 9.33 s).
- **Layout numbers:** the caption band (bottom 230 px) is background only on all 11 composed stills; the closing contact's right edge is 1,662 of 1,920 px; marks are whole phrases located by `pdftotext -bbox` (2 / 1 / 6 / 1 / 1 / 5 boxes on the six PDF stills).
- **rc1 → rc2 (one layout look each, then numbers):** rc1 marked loose words ("what", "not") anywhere on the page, put the page label inside the caption band, let the contact line run 300 px past the frame and the voice credit over the closing heading. rc2: phrase marks, label moved, contact in three lines beside the logo, heading at y = 96. rc1 deleted.
- **Sponsor:** the logo `~/Pictures/SYSNOVALogo.png` (300 × 80, on a white plate) on the opening still ("Sponsored by") and on the closing card.
- **Stated limits:** the closing card NAMES standards (the heading is the owner's wording); it claims no certificate for this software. The contact address is on screen only, never spoken. English only.
- **Found while filming:** the guide's caption B2-d printed a stray `**` in the saved PDF; fixed in `docs/CapexUATGuide.md` (the saved PDF in Downloads predates the fix).

## 3 EDIT rc3 (2026-11-14; owner, verbatim: *"1. Its zero second begins with CH 0. Then in that site, opens, scrolls quickly to the 2D screen, and quickly to the intersting 2Ds, reaches 3D formation, pausing half sec each diagram to get a glimpse. 2. Then the rest but linger on the illustrated parts, this time more longer on the Dashboard to show the prize of the testing. 3. Since we done themes, append in the impressive theme changes."* · then *"Yes u may have the save as PDF right after CH 0"*)
**New order:** chapter card at 0.0 s (it carries "Sponsored by" + the logo; the floor-plan preamble still is gone) → the owner's sentence → the live guide page, the Save-as-PDF button ringed → **the quick scroll**: the guide page at each of its 8 diagrams, 0.5 s held on each, joined by 0.28 s upward slides, ending held on the 3D Shed → the print layout scroll → the saved PDF (first page; floor plan page +2 s; **new** the arranged-sheets page and the 3D page, +3 s; step table; Notes / Known limits) → **the dashboard, the prize**: the saved PDF's chapter D step rows marked (4.5 s), then the LIVE dashboard on the guide's sample data held to the end of the beat (+5 s) → sign-off → the note card → **the looks**: Classic · Light, Classic · Dark, Executive · Light, Executive · Dark (2.2 s each, cross-faded) → closing.
**RESULT rc3 (`scripts/film_uat_guide/build_rc3.log` read):** `~/Videos/CAPEX_UAT_Guide_film_EN_2026-11-14_rc3.mp4` (not pushed), **168.42 s, 4,042 frames = the picture's 4,042**, 18 segments, 14 of 14 beats DETAIL, 0 tone WRONG, −17.2 LUFS, silences ≥ 4 s: 4.12 / 4.79 / 6.75 / 6.22 s.
- **The quick scroll is the real page:** each diagram is a screenshot of the live guide scrolled to that picture (`§FILM_SHOT site_diagrams=8 of 8`, scroll offsets logged), not the image file.
- **The dashboard's numbers are the same in all four looks** (`§FILM_SHOT dashboard looks=4 numbers_same_in_all=true`): every look read `judged=41 errors=[]`, Total Projects 13, Health `green=0 amber=2 red=1 none=6`. This is what the voice says ("The look changes. The numbers do not.") and what guide step D8 asks the tester to confirm.
- **One reword from the log:** "And at the end of all that ticking?" ended falling where a yes/no question must rise (`§NARR_TONE … WRONG`); it is now "And what is at the end of all that ticking?".
- **Two instrument slips, each stopped by its own FAIL line:** the dashboard chapter was looked up by its heading, which also appears in page 1's who-does-what table (now looked up by its first step); a three-word mark spanned a wrapped table cell (the step numbers are marked instead).
- rc2 is kept beside rc3 (the earlier order, with the floor-plan preamble).
