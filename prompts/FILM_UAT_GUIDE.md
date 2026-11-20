# ⚠ DO NOT REMOVE
SCOPE: the film that walks through the CAPEX UAT Guide (`docs/CapexUATGuide.md`, live at /BIMCompiler/CapexUATGuide/). Pipeline: `scripts/film_uat_guide/` (CPU only, no GPU, voices local Kokoro: no cloud call).
Every number spoken or shown is a fact read from the guide, the saved PDF or a § log line. **Read `build.log` after every run (`§FILM_*`); the exit code is not evidence.** The film file is NEVER pushed
(owner 2026-11-14: only scripts, logs and specs go to GitHub); it stays in `~/Videos/`. Layout rules: `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C.

> ## ▶ RESUME HERE — UAT films (rewritten 2026-11-20; read §5.12 → §5.13, then §5.10–§5.11 for the pipeline)
> **Film 1 DONE and published by the owner:** rc3 (`~/Videos/UAT_Hands_On_Where_To_Click_EN_rc3.mp4`) = https://youtu.be/PBp4qfV4mIo, linked in the guide's *See how* (item 1).
> **Part II BUILT 2026-11-20: rc4 `~/Videos/UAT_Hands_On_Part2_Raw_Sheets_EN_rc4.mp4`, every bar PASS, 610.7 s (§5.15 RESULT). Next: the owner reviews and uploads; then put its link in the guide's *See how* item 2 and change-list item 8, and drop the :8108 backup `idempiere_film_packin_bak`. After that, Part III (below).** (Plan as was:) A3.1 Pack In + the raw-sheet path.
> - Scene **s13 Pack In is RECORDED and PASSES** (§5.12 RESULT, folder `f2/full_s13_t5` in session scratchpad a0008b42…; may be cleaned: a re-take is about 3 min). Back up :8108 first, restore after; the backup `idempiere_film_packin_bak` is still there.
> - **The raw-sheet scenes are SPECCED (§5.14, from the shipped witness W-UAT-B0).** Next: measure the two open points of p7, write p1–p10 in `scenes.js`, take, then build Part II. The plan:
>   - open the pack's `sheets/` (no marks), B0.1–B0.8 marking by hand, B0.9 Save marked copies;
>   - B2.3 **Arrange** (watch them move into place);
>   - B5 with box 2 given (the run reads PASS, not PARTIAL PASS).
> - Use the guide's own B0 texts and the Dry Run's M.js selectors.
> **Part III (owner asked 2026-11-20 "Will Part II follow thru till the end? Or we need a part III?"; answer given: yes, a Part III), to plan after Part II:** B4 (send the model to the ERP as a Project Order), chapter **C** (C1 purchase order, C2 receipt, C3 vendor invoice + payment, C4 issue to project, C5 tick a phase), chapter **D** (the dashboard checks), and B3.2–B3.6 (rate and lag edits) if the owner wants them. A2 (install the dashboard scripts) is server work: Developer Guide, unless the owner asks. Goal (owner): the UAT completely human; Parts I–III together show every guide step done by hand.
> **Take rules learnt:** Chrome shows *Change your password* after the GardenAdmin login (press its OK); the role window is optional; ZK icon buttons are found by tooltip. After `cp -al` give each copy its own `scenes.log`. Start a take a few minutes after a Pages deploy.

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

## 4 MANDARIN zh rc1 (2026-11-14; owner: *"Need not fix film which is well done. Do a Mandarin version."*)
`FILM_LANG=zh python3 scripts/film_uat_guide/build.py <work>` → `~/Videos/CAPEX_UAT_Guide_film_ZH_2026-11-14_rc1.mp4` (not pushed). Same order and pictures as EN rc3.
- **Everything the film draws is translated** from one table (`STR[LANG]` in `build.py`; a missing key stops the build): the chapter card, the owner's sentence, every heading, the page labels, the note card, the standards' descriptions, the contact labels, the four look labels. The product's own pages (the guide, the PDF, the dashboard) stay as they are. Chinese text is drawn with Noto Sans CJK SC (PIL), never through ffmpeg `drawtext`.
- **Voices:** Microsoft Edge zh-CN Xiaoxiao / Yunxi (cloud: the script text is sent there; the contact address is not in it). The credit line says so in Chinese.
- **RESULT (`build_zh_rc1.log` read):** **189.08 s, 4,538 frames = the picture's 4,538**, 14 of 14 beats DETAIL, 0 tone WRONG, −17.2 LUFS, silences ≥ 4 s: 4.11 / 4.72 / 6.75 / 6.27 s. Captions split at Chinese punctuation: 25 lines → 49 pieces, longest 23 characters (`§ZH_CAPTIONS`; the bar is 20, the splitter cuts only at punctuation). The dashboard's numbers are the same in all four looks.
- Mandarin runs longer than English (189 s against 168 s): the build measures every beat's voice first and sizes its picture from that, so nothing was trimmed.
- **Not re-run:** the English build after the table refactor (the EN strings are the same literals moved into `STR['en']`; the unused floor-plan preamble still was removed).
- The translation was not reviewed by a native speaker.

## 5 SPEC — FILM 2 "UAT, hands on: where to click" (2026-11-19; PLAN, not built; nothing recorded until the owner's go)
**Owner's brief (verbatim, 2026-11-19):** *"Plan a film that truly is more than the last one about UAT Guide. This time it is to show users how to actually do the steps. ie Show where to click, and open what page, and download - all the actions shown. Answering need not go to each one as too lengthy. Just a few that maybe unfamiliar. Thus it is less talk but action that shows how."* · *"Priority is the starter baby steps aimed for newbies. They will not know where to fetch, or what to do with a link"* · *"thus animated pointer movements are important"*
**What film 1 already covers (do not repeat):** what UAT is, the printed PDF tour, the dashboard as the prize, the looks, the standards. Film 1 stays final (owner 2026-11-14).
**Film 2's one job:** a newbie with only a browser gets from "I have a link" to the files in the right place and opened in the right app. Every action is SEEN: the pointer travels to the thing, clicks it, and the effect appears (page opens, file lands, list fills). Talk is one short line per scene, after the action.

### 5.1 Picture method (the pointer is the star)
- **A real desktop, recorded whole:** Xvfb 1920×1080 (`env -u DBUS_SESSION_BUS_ADDRESS`, never the owner's screen: [[feedback_headed_browser_portal_dbus]]), headed `google-chrome` with a fresh profile, `nautilus` for the Downloads folder and Extract. `ffmpeg -f x11grab -draw_mouse 1` records the real OS pointer, the real file-open dialog, the real download bubble. Headless Playwright cannot show any of these three, and they are exactly what a newbie does not know.
- **Animated pointer:** moved by XTest (python-xlib in the film venv, pip, no sudo; or `xdotool` if the owner installs it), along an eased arc (ease-in-out, 0.6 to 0.9 s per move, ~60 steps), a short rest on the target, then the click. A ring pulses at the click point (drawn in post from the logged click time and point). Real click and key samples (`keys_eklee`, CC BY 3.0, credited), as the house style asks.
- **Every target point is read, never typed:** web elements from the DOM box via CDP (`§FILM_PTR target="⬇ Download the PDF" box=x,y,w,h aim=cx,cy`); native windows (file dialog, nautilus) from their X window geometry plus the GTK widget located by its accessible name (AT-SPI) or, failing that, typing the path (Ctrl+L in the dialog, a real shortcut a newbie can use too).
- **House style kept, adapted for a click film:** split screen. TOP strip = the guide's own step text for that action, typed character by character with real key sounds (step id first, e.g. `B0.1 Open 2D drawings…`); BOTTOM = the real desktop. Typed parts that ARE typing (the address bar, a menu search box) are typed on the desktop itself.
- **Zoom-follow:** the bottom frame is a 1920×1080 capture shown cropped and eased toward the pointer (1.0× travel, 1.6× on a small target such as the GitHub raw button), so a phone viewer can see what is clicked. Crop rectangle per frame from the logged pointer path.

### 5.2 Storyboard (baby steps first; target 3 to 4 min; F asks, M answers, one line each)
| # | scene (guide step) | what the pointer does, in order | line (after the action) |
|---|---|---|---|
| 0 | card | CHAPTER 1 · Where to click · *the first steps, shown* (silent 3.6 s, sponsor logo) | — |
| 1 | the guide (cover) | types the guide address in Chrome's address bar, Enter · the page opens · moves to **⬇ Download the PDF**, click · the download bubble shows the file · opens the bubble's folder icon: `CapexUATGuide.pdf` in **Downloads** | F: Where did it go? M: Your Downloads folder. |
| 2 | *What you need*: a link that downloads | scrolls to the table · test-data pack link, click · the zip lands in Downloads | M: This link is a file. Keep it zipped: Pack In takes the zip as it is (A3.1). |
| 3 | *What you need*: a link that is a page | the products-script link, click · a GitHub page opens, NOT a download · pointer to the **Download raw file** button (zoom 1.6×), click · the `.sql` lands | F: It opened a page? M: The file is behind this button. |
| 4 | the reference pack | its link, click · zip lands · in Downloads, right-click it ▸ **Extract** · the folder opens: `sheets/` and the nine `.dxf` | M: This one you unzip. Your sheets are inside. |
| 5 | B0.1 open the drawings | the Modeller link, click · **📂 Open ▸ Open 2D drawings (.dxf)…** · the file window: into the extracted `sheets` folder · **Ctrl+A** · **Open** · the panel lists nine sheets | F: All nine at once? M: Select all, then Open. |
| 6 | B0.9 save the marked copies | **Save marked copies** · nine downloads (if Chrome asks *download multiple files*, the pointer clicks **Allow**: shown only if measured) · Downloads lists the nine `_marked.dxf` | M: Nine new files. You use these from now on. |
| 7 | B2.8 export | **Export ▸ Viewer database (.db)** · the `.db` lands | — (caption only) |
| 8 | B2.9 open it in the Viewer | front-door link · the picture with two pills: the **red** pill · **Buildings / IFC** · card **Blank Viewer** · **Ctrl+O** · file window ▸ the `.db` · the model opens · select the status line, **Ctrl+C** | F: Why copy that line? M: The Run Checker asks for it. |
| 9 | B5 mark your run | Run Checker link · box 1 ▸ the pack zip · box 2 ▸ the nine marked files · box 3 ▸ the `.db` · box 4 **Ctrl+V** · box 5 the total-cost line · **Mark my run** · PASS rows · **Download result** · `uat_result.json` in Downloads | M: Attach this file to your sign-off. |
| 10 | iDempiere, finding a window (A3.1) | log in as GardenWorld Admin · menu **Search** box: types `Pack In` · click the entry · choose the zip from Downloads · run · *Successful application* | M: Any window: type its name in the menu search. |
| 11 | closing | one card: *the rest of the guide works the same way: do, confirm, tick* · contact as film 1 (on screen, not spoken) | — |
**Left out on purpose (lengthy or familiar):** B00 BricsCAD export, B0.2 to B0.8 marking, B3 rate edits, chapter C forms (iDempiere users know them), chapter D (film 1). Scene 4 serves testers given the pack; B0.9 in scene 6 is shown on the pack's own sheets.

### 5.3 Facts to MEASURE before any voice (never from this file)
Every file name and size that lands (`§FILM_DL name= bytes= sha256=`), each link's kind (download vs page: HTTP `Content-Disposition`/content type), whether Chrome shows the multiple-downloads prompt in scene 6, whether each link opens in the same tab or a new one, the Modeller's sheet count after Open, the Viewer status line text, the Run Checker's rows. Scene 10 needs the shared test instance :8108 (stops nothing, only logs in and runs Pack In on a copy, restored after, as `UATDryRun.js` P/T does): **ask before using it.**

### 5.4 Witness (numbers, not looks)
- **Pointer truth:** for every click, the pointer position at the click frame (`§FILM_PTR click at=x,y`) lies inside the target's box; 0 clicks outside. Every move eased (no jump > 40 px between frames except inside a declared cut).
- **Cause → effect:** every click has its logged effect within 5 s (download file exists, URL changed, list count) or the scene FAILS and is re-taken, never cut around.
- **Honest screen:** the recorded desktop is Linux GNOME (Chrome, Files). The first scene's caption says once: *your computer's windows may look different; the buttons are the same.* No Windows/Mac screen is faked.
- Audio and layout as film 1 (§1 witness, PLAYBOOK C): frames = sum of segments, −16 ±1 LUFS, silences ≤ ~7 s, bottom 230 px of the top/bottom composite kept for captions, real key and click samples (check K2 of `film_cli_in_action`).
- Pipeline: `scripts/film_uat_howto/` (new; reuse `film_uat_guide/build.py` audio/caption code). Film file stays in `~/Videos/`, never pushed.

### 5.5 SPEC REVISION before recording (2026-11-19; owner: *"Proceed to the film"* · *"U may narrate but it is an instructor"* · *"u may proceed to install whatever that is workable"*)
- **Voice:** ONE instructor (Kokoro `am_michael`, local), talking the viewer through it in the imperative ("Click … Now open …"). No F/M questions. One or two short sentences per scene, spoken after the action they describe.
- **Path a tester given the pack takes (guide: "a tester given the `…_marked.dxf` copies skips B00 and B0"):** the reference pack's `marked/` folder (measured: `manifest.json`, `sheets/` 9, `marked/` 9, `reference/SHED_extracted.db`). So scene 5 is **B2.1** (open the nine `_marked.dxf`), scene 6 is **B2.5 + B2.6 + B2.8** (tick Complete, Convert, Export the `.db`); "Save marked copies" (B0.9) is not filmed.
- **Links measured (curl -I, 2026-11-19):** guide PDF `application/pdf` 4,795,915 B (the button carries `download`); test-data zip `application/zip` 14,144 B; products script link = `text/html` (a GitHub PAGE: the trap scene 3 shows); reference pack `application/zip` 567,159 B; Run Checker and Modeller are pages.
- **Desktop:** Xvfb :97 + openbox + headed Chrome 155 (fresh profile, a fake HOME whose `Downloads/` starts empty) + Nautilus in its own `dbus-run-session` (never the owner's bus). Pointer, clicks and keys are real X events (`xdotool`, installed with openbox 2026-11-19). Capture `ffmpeg -f x11grab -draw_mouse 1 -copyts`: every frame carries wall-clock time (measured: first pts 1795053643.967 for a start logged at …643.889), so the driver's event log maps onto frames exactly.
- **Archive on Linux:** Nautilus extracts an archive when it is opened (double-click). The caption says the Windows way in words (right-click ▸ Extract All); no Windows screen is drawn.
- **Selectors and ready-states are the UAT Dry Run's own** (`~/Projects/SYSNOVA/UAT/instruments/M.js`, `V.js`): `#b-open` → `#m-open-panel .mo-row[data-key="__dxf"]`, `#dxf-complete`, `#dxf-convert`, `DxfImportUI.state.last.nInserts`, Viewer `APP.status` /DONE/, `#find-name` + `#nlp-toast`, checker `#pack #marked #db #vline #cline #go #rows #dl`. The difference: the dry run fed the file chooser by script (declared bypass); the film uses the real OS file window.

### 5.6 What the desktop taught (2026-11-19; each one cost a take, each is now in the code with its reason)
| Found | Fix (file) |
|---|---|
| Playwright's CDP attach sends downloads to its own temp folder under a random name (`e2012214-…`) | `Browser.setDownloadBehavior {behavior:'default'}`: Chrome's own Downloads, names and bubble (`drv.js init`) |
| A click on the address bar put the cursor after the old address (it appended) | click, then **Ctrl+A**, then type (`scenes.js s1`) |
| Headed Chrome on Xvfb: WebGL blocklisted, the Modeller never boots | `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` (CPU, no GPU) (`desk.sh`) |
| Chrome's download bubble swallows the next click outside it (Back did nothing) | **Esc** first (`s3`) |
| A Back restores the page from the page cache: no load event | poll the URL of the SHOWN tab (`D.waitUrl`) |
| Every attached tab reports `visibilityState 'visible'` (two at once, measured), so the driver measured one tab while the wheel scrolled another | the shown tab = the Chrome window's X title (`D.shownTitle`); the driver acts on that page |
| Nautilus starts slowly (> 20 s: portals boot first) and its private session leaves gvfs/doc FUSE mounts in the fake HOME | started before the take and minimised; `desk.sh stop` stops every process carrying the fake HOME and unmounts |
| OCR misses white text on GTK's orange selected row; reads `SHED_extracted.db` as `SHER extracted.db` | four reads merged (1x colour, 2x grey, 2x inverted, 2x near-white only); match `extracted.db$` |
| The OS file window remembers the last folder, so the first folder row may be absent | `D.pick` always starts from **Home** in its left pane |
| The Viewer's Ctrl+O window is titled *Select files this site can read* (File System Access), the Modeller's *Open Files* | `D.pick` accepts both |
| The front door shows the pill picture only on a first visit | a fresh profile per build; a re-take clears that site's storage (set-up, not filmed) |
| The Viewer's status line changes once Find runs (*Loading Find…*) | the DONE line is copied at once (B2.9), pasted into box 4 before B3.1 |
| Smooth scrolling still moves after the last wheel notch | notches by distance, settle 450 ms before measuring |
**Measured in the takes (§FILM_DL / §FILM_CHECK):** `CapexUATGuide.pdf` 4,795,915 B · test-data zip 14,144 B · products script 60,803 B (only via *Download raw file*; the link itself opens a page) · pack 567,159 B, extracted by opening it: `marked/` 9 · panel `2D DRAWINGS · 9 SHEETS` · `Converted: 511 elements (0 door/window fills), 2 openings cut.` · `SHED_extracted.db` 1,257,472 B (= the pack's `reference/SHED_extracted.db`) · `DONE — SHED 511 elements (37 instanced groups). 1 building(s) rendered.` · `USD 96,839 (RM 372,457) — total building cost`.
**Left out of rc1, and why:** the iDempiere scene (A3.1 Pack In + the menu Search box) writes to the shared test instance :8108 (Pack In imports a pack; a copy-and-restore of its database stops and restarts the server). The standing rule asks before that; it waits for the owner's go.

### 5.7 State at session end (2026-11-19)
Scripts in `scripts/film_uat_howto/`: `desk.sh` (the private desktop), `drv.js` (pointer, keys, OCR, file window, shown tab), `scenes.js` (12 scenes, each with its checks), `plan.py` (strips + the instructor's 31 lines), `compose.py` (picture, holds, rings, zoom, TSV, sounds.json), `sounds.py` (real keys + click), `build.sh` (measure voice → render → fit → mux → sounds → checks), `ass_head.txt` (captions on a dark box). Installed 2026-11-19 for this lane: `openbox`, `xdotool`, `tesseract-ocr` (apt), `python-xlib` + `pillow` (film venv). Takes and cuts live in the session scratchpad only; nothing of the film is pushed.

### 5.8 MOCK of the s5 fix on the failed take's own frames (2026-11-19, owner: *"just theoretical mock"*; no desktop, no re-take)
**Issue proved:** the `/Home$/` fix would fail again. Frames +18/+30/+60 s of `full1/s5.mkv` OCR'd with the same 4 reads as `D.findText`: no read contains `Home`. The Home row is the SELECTED row
(pixel 232,84,31 orange) and only the near-white read sees it, as **`Some`** (conf 84, at 436,194) on all 3 frames. Recent (conf 93, y 154) and Desktop (conf 94, y 229) read reliably.
**Fix (`drv.js` `D.pick`):** try exact `Home` quietly (3 tries, new `quiet` arg on `findText` = a miss is not a FAIL); else take the one word row between Recent and Desktop, logged
`§FILM_CHECK home_row_derived` + `§FILM_OCR_DERIVED Home`. **Mock:** the real `D.pick` run on each frame (screen grab stubbed with the frame, window box = the take's `§FILM_DIALOG`, aim/click stubbed):
3 of 3 `§FILM_CHECK PASS home_row_derived read="Some" between Recent y=154 and Desktop y=229`, click box 411,188,85,20 (covers the orange row). Not yet proved: the full take itself, and s6–s8.

### 5.9 Derived, not re-taken: why s6–s12 failed (2026-11-19, owner: *"mock up where needed, when going thru to each item"*)
**Correction to the RESUME:** "all 12 scenes PASSED in separate takes" is not what the logs say. Per-scene from every `scenes.log` on disk: s1–s4 ok (full1), s5–s7 ok (take7), s8–s9 ok (take8);
**s10, s11, s12 never passed**: their only run is take9, after its s8 failed.
- **full1 s6, s7** = knock-on of s5: OCR of their frames shows the same Modeller + open file window (`Recent · Desktop · Other Locations · Downloads · Cancel · Open`, page mean 140 on every frame from s5 +15 s to s7 +30 s). s5's fix (§5.8) removes the cause.
- **full1 s8** = the display went away: `chrome.log` `X connection error received` at 11:41:20, ffmpeg `Failed to query xcb pointer`, `xdotool click 5` failed.
- **take9 s8** = Chrome stopped painting: page area (y ≥ 95) mean 11 / std 22.7, unchanged from +3 s to +130 s (take8 s8 at +3 s: mean 235 / std 52.5, page text read). 480 wheel notches
  (60 tries × 8) moved nothing. Same guide deploy for both takes (gh-pages 05:21, takes 11:09 / 11:33); every scene link is on the live page (`a[href]` counts: front door 2, Run Checker 2, Modeller 2).
  Chrome on this desktop selects the NVIDIA GPU (Vulkan, `chrome.log`): suspect a GPU stall; run the take when no bake is running ([[feedback_gpu_vram_contention_crashes_user_tab]]).
- take9's s10/s9/s11/s12 then fail on s8's state (viewer never reached, check tab never opened).
**Runner change (`scenes.js`):** after a scene with a new FAIL: close a file window left open (Escape), log `§FILM_STOP first failed scene=<s>`, stop. **Mock** (fake driver, only s5's Home step
failing): `s1…s5 begin · FAIL ocr_find Home · KEY Escape · §FILM_STOP first failed scene=s5 · verdict FAIL`, s6+ not run.
**Pack In scene (A3.1, open question):** advice to the owner = add it in rc2, not rc1: rc1 first proves s10–s12 without the one scene that writes to the shared :8108 (copy-restore = the dry run's
P/T, restored clean in the handover run; Pack In uuid error seen ~1 in 8 dry runs = a likely re-take). Waits for the owner's go.
**Next (unchanged):** the real full take is still the only way to the film; on a failure, derive from its log as here and re-take from the named scene.


### 5.10 Full take 1 of the new session (2026-11-19): s1–s10 PASS in one go, s11 FAIL; cause derived on the live page, fixed (owner: *"you may use Chrome and GPU, as no other session running"*)
**Take** (`scenes.js … s1 s2 s3 s4 s5 s6 s7 s8 s10 s9 s11 s12`, `scenes.log` read): s1, s2, s3, s4, s5, s6, s7, s8, s10, s9 all PASS in ONE take (first time s5–s8 and s10 pass after one another; the §5.8 Home fix held on the real desktop). s11: `box5_pasted` PASS, then `§FILM_CHECK FAIL s11_threw could not scroll to #pack`, `§FILM_STOP first failed scene=s11`.
**Issue (derived from the still-open desktop, CDP read of the Run Checker tab, no re-take):** the page does not scroll at all: `scrollY 0, innerHeight 982, scrollHeight 982`. Box 1 `#pack` is at page y 129 (screen ≈ 221); `D.scrollInto(sel, 200)` asks for screen y ≥ 92 + 200 = 292. No wheel notch can move a page that has no scroll, so the 60 tries ran out. Box 4 (`#vline`, page y 357) in s10 met the margin, which is why s10 passed with the same function.
**Spec of the fix (`drv.js D.scrollInto`):** the margin is a wish, not a demand. When the target is fully on screen (screen y ≥ 92 and bottom ≤ 1075) and the page cannot scroll further in the direction it would need (at its top when the target is above the margin, at its end when below), take the target where it is and log `§FILM_SCROLL <sel> page_at=top|end y=<screen y> (margin not reachable)`. A target off screen still FAILS after the tries. Still never a script scroll: only the wheel moves the page.
**Test (names the issue):** the fixed function run against the live Run Checker tab as the take left it (`scrollY 0`): `#pack` must return at once with `page_at=top` and no wheel notch; the OLD margin rule must still be shown to fail on the same page (the issue is real, not a probe artefact).
**Take 2 (fix in): s1–s11 PASS in one take** (`§FILM_SCROLL #pack page_at=top y=221`, `pack_intact_19` PASS). **s12: two FAILs.**
- **(a) `could not scroll to #rows` = a second bug in the same function, found by measuring each try on the live page:** `#rows` top 800 (inside the window), bottom 1054 (below 915), page `scroll 0/66`; the old direction test `b.y > bot` was false, so the wheel turned **up** 60 times. Fix: the edge that is out sets the direction (top above → up, else down). Re-test on the same page: 1 down-notch, `§FILM_SCROLL #rows page_at=end y=734`, returned; the `#pack` test still PASSES (0 notches).
- **(b) `run_partial_pass_b09_not_given run=FAIL` is a REAL find in the product, not the film:** the Run Checker's B2.8 row reads `tables differ: project_metadata 4 vs 5`. The tester's export lacks the row `building_type|General`; the other 4 rows and all 513 element rows match. Cause, read in the code: guide **B2.2c** says *Accept all* is **optional** ("Either way … Convert gives the same result"), but the pack's reference `.db` was made by W-UAT-CHAIN's P run **with** *Accept all* (`capex/tests/witness_uat_chain.js:122 acceptAll`), which turns the `building.type` default into a choice; the export writes `building_type` only for a stated type (`dxf_import_ui.js statedBuildingType`: source file|sheet|choice; T13.5, #2447). So the guide's "do nothing" path always fails B2.8 at B5.3. **Why the UAT Dry Run did not see it:** at B5 it gave the checker the pack's reference `.db` itself (declared bypass, the UAT Dry Run's `instruments/V.js:298`), never a tester's own export; the film is the first real comparison. **Owner decision 2026-11-19: fix the checker, keep the guide and the film as they are** (the guide sha stays, so the signed report stays valid): bim-ootb `prompts/CAPEX_DASHBOARD.md` §5.90, #3345, W-UAT-COMPARE-OPTIONAL 5/0 (the real pair from this take: 513 = 513, `tables:[]`). Ledger row 13 in `prompts/SQLiteIDEMPIERE.md` §UAT-LEDGER.
**Take 3 (checker fix live, `uat_compare.js` last-modified 12:54:59 GMT): s1 FAIL, a server flake, not the film.** `§FILM_CHECK FAIL download /^CapexUATGuide.*\.pdf$/ nothing landed`. The download item (chrome://downloads, read by CDP): url `…/BIMCompiler/CapexUATGuide.pdf`, saved as `CapexUATGuide.html`, total 54,887 B, *"Failed - Unknown server error"*: GitHub Pages answered with an HTML error body ~35 s after the bim-ootb Pages deploy (same github.io host). Re-checked at once: HTTP 200 `application/pdf` 4,795,915 B, the button still `href="../CapexUATGuide.pdf" download`. Re-taken whole (take 4), as §5.4 says (a failed effect is re-taken, never cut around). Lesson: start a take a few minutes after a Pages deploy, not right after it.
**Take 4: ALL 12 SCENES PASS IN ONE TAKE** (`§FILM_SCENES_VERDICT PASS`, 85 checks; s12 `run_partial_pass_b09_not_given run=PARTIAL PASS`, B2.8 *513 element rows, every table equal PASS* on the live checker after #3345; `§FILM_SCROLL #rows page_at=end`, `#dl page_at=end`). Take folder: session scratchpad `f2/full` (not pushed).
**rc1 built, NOT accepted:** `~/Videos/UAT_Hands_On_Where_To_Click_EN_rc1.mp4` (not pushed), `§FILM_CHECKS_VERDICT PASS` but the same line breaks §5.4's own bars, which `build.sh` did not gate: **572.2 s** (target 3–4 min), silences up to **63.8 / 41.3 / 34.2 s** (bar ≤ ~7 s), **−17.8 LUFS** (bar −16 ±1). frames 17,165 = picture 17,165; 31 of 31 lines DETAIL, 0 tone WRONG; sounds keys 535/535, clicks 62/62. (`comp.log`'s ffmpeg "Broken pipe" lines are the frame readers closed at a piece's end: frame count equal.)
**Cause (measured from the takes' `events.json`):** the scenes play in real time; only the 6 driver-declared waits (`§FILM_FAST`) are sped (×3). Idle time (no pointer move, click, key or wheel notch for > 2 s) is 369 of 561 s; the biggest are the driver's own think time with the pointer at rest (s5 45.1 s while OCR reads the file window; s8 33.4 s; s4 15.8 s).

### 5.11 SPEC — idle time is sped, shown, and the bars are gated (2026-11-19; written before code; no re-take)
- **Idle spans (`compose.py`):** in each scene, a gap between actions (a pointer move, a click ±0.3 s, a typed key ±0.12 s; a WHEEL NOTCH is travel, not an action: rc2 showed s10 scrolling the guide 212 notches in 59.0 s as one 63.2 s silence) longer than 2.0 s plays at **×8**, keeping 0.8 s real time at each end so every action is seen arriving and landing. A declared `§FILM_FAST` span keeps ×3 and wins where they overlap. The badge `>> x8` shows on every sped frame (as `>> x3` already does): nothing is cut, only sped, and the viewer is told. Logged `§COMP_IDLE <scene> spans=<n> src_s=<idle seconds> out_s=<seconds on screen>`.
- **Estimate before building (from the same events):** picture 560.7 s → ~310 s before voice holds.
- **Gates (`build.sh`, the §5.4 bars, until now only printed):** max silence ≤ 8.0 s (the "~7 s" bar), loudness −16 ±1 LUFS, film ≤ 300 s (the 3–4 min target with one minute of room). Any one out → `§FILM_CHECKS_VERDICT FAIL` naming it.
- **Test (names the issue):** the rebuilt rc2 from the SAME take 4 must print the three numbers inside their bars; the old rc1 numbers (572.2 s, 63.8 s, −17.8) are the RED before.
**RESULT 2026-11-19 (all three built from the SAME take 4, no re-take; `checks.log` read each time):**
| build | film s | max silence s | LUFS | gate |
|---|---|---|---|---|
| rc1 (before §5.11) | 572.2 | 63.8 | −17.8 | printed PASS: the bars were not gated (the RED before) |
| rc2 (idle ×8 + loudnorm + gates) | 362.5 | 63.2 (s10: 212 wheel notches in 59.0 s, counted as action) | −16.6 ✓ | FAIL silence, length |
| rc3 (a wheel notch is travel) | **310.4** | **11.9** (one; the rest ≤ 6.4) | **−16.6 ✓** | FAIL `silence_max=11.9>8.0 film_s=310.4>300` |
Every build: frames = picture (9,313 in rc3), 31 of 31 lines DETAIL, 0 tone WRONG, keys 535/535, clicks 62/62. `§COMP_IDLE` rc3: 384.3 s of idle/scroll source shown in 48.0 s, each sped frame badged `>> x8`. Films in `~/Videos/` (rc1, rc2, rc3), never pushed.
**What is left is an EDIT decision, not a pipeline fault (owner's call):** the 11.9 s is s10's guide scroll sped ×8 with no line over it; the 310 s is 10 s over the gate (the storyboard target is 3–4 min = 180–240 s). Options: accept ~5 min and set the gate to the measured film; or cut (e.g. s4's Extract, 44 s of idle source, or s3's GitHub page) and/or put a line over the s10 scroll. No contact-sheet look done yet (step 3 waits for a build inside its bars).

### 5.12 SPEC — scene s13, iDempiere Pack In through its window (A3.1, second option) on :8108 (2026-11-20; written before code)
**Owner, 2026-11-20:** *"Yes u may copy and restore later."* · *"Indeed we want this UAT to be completely human"* · *"So, is it really not mocked up but real human user like experience been recorded?"* (answer given: yes, a real desktop and real input events; the pointer is moved by script; idle time is sped and badged).
**Database (around the take, not filmed):**
- Before: stop :8108, run `CREATE DATABASE idempiere_film_packin_bak TEMPLATE idempiere_bimdoc`, start (done 2026-11-20, `§FILM_DB backup made`).
- After the take: stop, drop, recreate `idempiere_bimdoc` from the backup, start, check `TD_` projects = 0 and `ad_package_imp_proc` = 1 (as found), then drop the backup.
- This is the same pattern as the UAT Dry Run's P2–P4 and T2–T4.
**Measured by a headless exploration on the backed-up instance (2026-11-20, restored after: `TD_`=0, imp_proc=1):** the window path works for GardenWorld Admin:
1. Menu search `Pack In`.
2. New (`a.toolbar-button` title *New Alt+N*); Organization defaults to `*`; type in the Name field (red, mandatory).
3. Save: *Record saved*.
4. The paperclip *Attachment* opens a window with **Load** (the OS file window) and **OK**.
5. The **PackIn** button opens a process dialog (*PackIn · Import Package · Run as Job · OK · Cancel*).
6. OK runs it; Process Message: **`Processed=225 Un-Resolved=0`** plus the pack's description; the database then has **12** `TD_` projects (guide A3.2).
**Guide find (ledger row 14):** A3.1's Confirm column states only the folder script's output (*Successful application … Error=false … Done*). The window option shows `Processed=225 Un-Resolved=0` instead. The owner's rule: the signed report stays as signed; a guide correction after sign-off goes to an appendix.
**Scene s13 (one take, after s12; chip A3.1; strip = the guide's own words "use the **Pack In** window logged in as GardenWorld Admin (choose the zip, then run it)"):**
1. Ctrl+T opens a new tab; type `localhost:8108/webui/` in the address bar, Enter.
2. Click the user box and type; click the password box and type; OK; OK on the role window.
3. Click the search box, type `Pack In`, click the entry.
4. New, click Name, type `CAPEX test data`, Save.
5. The paperclip, Load: the real OS file window, Home ▸ Downloads ▸ the zip, Open; OK.
6. PackIn, OK; read the message.
**Checks (cause → effect, each within its wait):**
- The login form has 2 boxes.
- The role window's OK is shown; the search box is shown.
- The entry `Pack In` is listed; the window's PackIn button is shown.
- The Name box is mandatory and empty after New; *Record saved* after Save.
- The file window opened; the attachment window names the zip.
- The process dialog is shown; the Process Message matches `Processed=\d+ Un-Resolved=0`.
**Instructor (3 lines, after their action):** "In iDempiere, any window opens from the search box. Type its name: Pack In." · "Press New, give it a name, and save. The paper clip attaches the test-data zip." · "Press Pack In, then OK. The message counts what was processed, and nothing is left unresolved."
**PREP (not filmed):** the test-data zip is downloaded to the fresh `Downloads/`, as scene s2 shows. The take is s13 alone, in take 4's folder (each scene is its own recording; `scenes.log` gets s13's lines and its own verdict line). The film is rebuilt from take 4 + s13.

### 5.13 APPENDIX LIST — steps the films do not yet show (owner's review; do not redo the film, appendix later)
- **2026-11-20, owner (verbatim):** *"I viewed back carefully the film, i noticed we jumped a step to Marked DXF. We supposed to load unmarked raw DXF 2Ds to prove the arrange works. It is OK, we can make this as appendix UAT when we review the rest of the films. Need not redo. Just note."*
  - What film 2 does: s4 to s6 open the pack's `marked/` copies (the guide's path for "a tester given the `…_marked.dxf` copies", §5.5).
  - What is missing: the RAW, unmarked sheets (the pack's `sheets/`) loaded and marked by hand, B0.1 to B0.9. That is the step that proves Arrange places them, from the tester's own marks.
  - Status: APPENDIX, to be filmed when the rest of the films are reviewed. Film 2 stays as it is.
**s13 take 1 (2026-11-20): FAIL, cause not found yet.**
- `scenes.log` (folder `f2/full_s13_t1`): PREP zip 14,144 B; address bar, `login_form boxes=2`, User, Password, OK (log in), `role_window_shown Select Role`, OK (role) clicked inside its box 1167,815,80,30. Then `s13_threw page.waitForSelector: Timeout 90000ms` (no search box).
- Derived on the live desk (no re-take):
  - The tab still shows **Select Role**, values GardenWorld / GardenWorld Admin / `*` / (warehouse empty) / English.
  - The button is the top element at its centre; the screen box matches the click.
  - A second real click on the settled window: nothing. A Playwright click: nothing.
  - Opening the Org and Warehouse dropdowns: **0 items** (the window is dead on the client).
  - A reload plus a filled login in the SAME desk Chrome: the role window never appears (60 s).
  - A fresh **headless** Chromium login at the same minute passes the role window (search box shown).
  - Time zone and language are the same in both (Asia/Kuala_Lumpur, en-US). The server log has nothing at the time.
- **So the fault is in the desk Chrome's session with ZK, not in the instance.** Next: compare that Chrome's ZK requests (zkau responses) with headless; try a fresh desk profile with s13 first.
- :8108 restored after each attempt (`TD_`=0, imp_proc=1); the backup `idempiere_film_packin_bak` is KEPT until s13 passes, then dropped.
**s13 take-1 CAUSE FOUND (2026-11-20, derived, not guessed):**
- A diagnostic login with every ZK request logged: the login OK posts (`POST /webui/zkau` returns the role window); the role OK posts NOTHING.
- Not the browser build: headless Chrome 155, and a headed Playwright-launched Chrome on :97 with the desk's flags, both pass.
- Driving the desk Chrome by X input only (no debugging connection) and reading the screen: Chrome's own window **"Change your password — The password you just used was found in a data breach. Google Password Manager recommends changing your password now. [OK]"** covers the page. The demo password GardenAdmin is in the known breach lists; Playwright-launched browsers switch that warning off, which is why every headless login passed.
**Fix (`scenes.js` `chromePwWarn`):** the film SHOWS it, as a tester will meet it. OCR finds the window's heading; the pointer clicks its OK (checks `chrome_password_window_ok_found`, `chrome_password_window_closed`). It is called after the login OK and after the role OK.
**Tester note (for the change list):** after logging in with GardenAdmin, Chrome may show *Change your password*. It is Chrome's warning about the well-known demo password, not an iDempiere error: press OK.
**s13 RESULT 2026-11-20: PASS in one take** (take 5, folder `f2/full_s13_t5`, s13.mkv 161.7 s; `§FILM_SCENES_VERDICT PASS scenes=s13`). The path:
1. Login; Chrome's *Change your password* window: OK placed from its heading (`§FILM_OCR_DERIVED`), `chrome_password_window_closed`. No role window this time (`§FILM_NOTE after log in: home`).
2. Search box ▸ `Pack In` ▸ New ▸ Name ▸ Save (*Record saved*).
3. Paperclip ▸ **Load** (icon-only: its word is the tooltip) ▸ the real file window, Home ▸ Downloads ▸ the zip ▸ Open; `attachment_names_zip`; OK.
4. PackIn ▸ OK; **`Processed=225 Un-Resolved=0`**. The database then had 12 `TD_` projects (guide A3.2).
:8108 restored after (`TD_`=0, imp_proc=1); the backup `idempiere_film_packin_bak` is KEPT for Part II re-takes.
**Takes 2–4 each taught one thing, now in the code:**
- the OK on Chrome's window is not read by OCR (white on orange): it is placed from the heading;
- the role window is optional: wait for whichever comes;
- the attachment window's buttons are icons: select them by tooltip.
**Own mistake, fixed:** `cp -al` copies share `scenes.log`, so s13 attempts appended into take 4's log. Take 4's log was cut back to its original 408 lines, ending with its PASS verdict. The copies now get their own `scenes.log` (`rm` + `cp` after `cp -al`).
**Owner, 2026-11-20:** film 1 (rc3) is uploaded as https://youtu.be/PBp4qfV4mIo (guide, *See how* 1). **Part II** (guide, *See how* 2, pending) is to cover A3.1 Pack In (this scene, s13, recorded) and the raw-sheet path: the pack's `sheets/` (as drawn, no marks), marked by hand in B0.1–B0.9, then Arrange (§5.13). The raw-sheet scenes are not specced or recorded yet.

### 5.14 SPEC — Part II, the raw-sheet path (2026-11-20; written before code; owner: *"proceed"*)
**Source of every step, value and ready-state: the shipped witness W-UAT-B0** (bim-ootb `capex/tests/witness_uat_b0_raw_to_marked.js`, "a tester holding the nine RAW Shed sheets cannot reach the guide's marked set by the steps of UAT Guide B0 in the real Modeller"). It drives the panel's own controls: `[data-act="sec"]`, `card`, `layer` + `laysplit`, `bodyzadd`, `add` (`data-group="Z"`), `exsheet`, `tool` (`data-tool="exclude"`), `acceptsr` / `acceptall`, the `#dm-f-<i>-SET` field and the `#dm-chip` badge. The ready-state is `DxfMetaEditor.state` (not busy, has a verdict).
- The tables `LAYERS`, `BODYZ`, `DATUMS` and `EX_AIM` are COPIED from that file at build time, not retyped here.
- Input for the film: the reference pack's `sheets/` (the nine raw drawings, no marks); the pack is downloaded in Part I.
**Part II scenes, guide order (A3.1 comes before B), one instructor line after each action:**
| # | step | what the pointer does | checked (the guide's own Confirm) |
|---|---|---|---|
| p0 | A3.1 | (= s13, recorded) Pack In through the window | `Processed=… Un-Resolved=0` |
| p1 | B0.1 | Modeller ▸ 📂 Open ▸ Open 2D drawings ▸ the file window: Downloads ▸ the extracted pack ▸ `sheets` ▸ Ctrl+A ▸ Open | panel lists 9 sheets, none with a role; badge **Blocked**; **All defaults 34** yellow |
| p2 | B0.2, B0.2b | *Accept stated + read*, then *Accept all* | 113 → 0 yellow; roles 3 PLAN, 4 ELEV, 1 SECTION |
| p3 | B0.3 | open a card, click **Set**, Ctrl+A, type `SHED`, Enter | all nine Set = SHED |
| p4 | B0.4, B0.4b | **Layers**: each of the ten selects (the split arrow where the table says *one sheet only*), then *Accept all* | *Blocked · 1* after PLAN·Col, **Qualifies** after ELEV·Wall; 14 → 0 yellow |
| p5 | B0.5 | **Body heights**: type footing z0/z1, Add; beam z0/z1, Add | the two `@BODYZ=` rows |
| p6 | B0.6 | each elevation and section card: type `0.6096` and its y, Add | five new `@Z=0.6096` rows; Qualifies |
| p7 | B0.7 | **Exclude areas** ▸ 3_BEAM_LAYOUT ▸ *Exclude area*; zoom with the WHEEL to the bay between grids 06 and 35; DRAG the box round the joint (real button down, move, up) | an `@EXCLUDE` mark inside the §5.84 tolerance (`uat_compare` rule) |
| p8 | B0.8, B0.9 | read the badge; **Save marked copies** (if Chrome asks to download several files, the pointer clicks **Allow**: filmed only if it shows) | Qualifies, 0 yellow; nine `…_marked.dxf` land in Downloads |
| p9 | B2.1, B2.3 | open the nine saved copies; **Arrange** | status counts **Step 1/46 … Step 46/46** |
| p10 | B5 | Run Checker with box 2 = the nine saved copies | B0.9 **PASS**; the run reads **PASS** (not PARTIAL PASS) |
**Open, to measure before p7 is taken (not guessed):**
1. Whether choosing the sheet in *Exclude areas* already zooms the canvas to it (the witness says it pans "as highlight() does"). If not, the zoom is wheel notches over the joint, the number measured from the camera distance.
2. The screen points of the drag come from the drawing coordinates `EX_AIM` through the camera, the same way every other click's target comes from a measured box. Logged `§FILM_PTR drag from=… to=…`.
**Witness (numbers):** each row's Confirm checked as `§FILM_CHECK`; p10's checker result is the end of the chain (B0.9 PASS = the tester's marks equal the answer key's, mark for mark). The audio and layout bars are §5.11's (gated in build.sh).

### 5.15 SPEC — Part II take plan, the two open points measured (2026-11-20; written before code; owner: *"proceed. As long as leave the present UATReport sign off alone and append change version list in the UAT Guide"*)
**Owner's limits for this lane:** the signed report (`runs/handover-2026-11-18/UAT_REPORT_NOV_19.pdf`) is not touched. Anything Part II finds goes into the UAT Guide's change list (*Changes since the signed UAT report*) as a new row, and into `NOTICES_since_report.md`.
**Pack sheets proven first (not the private set):** W-UAT-B0 run with `SHED_SHEETS` = the reference pack's `sheets/` (OCI `uat/Shed_UAT_pack_20261115.zip`, 567,159 B): `§UATB0_VERDICT PASS judged=4 fails=0`. Measured on the way: 34 yellow, Blocked · 99; Accept stated + read 34 → 113; Accept all 113 → 0, Blocked · 89, 8 roles; Blocked · 1 after PLAN·Col; Qualifies after ELEV·Wall; 14 yellow after the ten layers, then 0; saved nine equal the guide set mark for mark; Convert 511 on both.
**Open point 1, answered by reading the code:** choosing the sheet does NOT zoom. `exsheet` only stores the choice (`dxf_meta_editor.js:1178`), and `setTool('exclude')` only binds the pointer handlers and sets the crosshair (`:313-319`). The camera is OrbitControls with its defaults (`modeller.html:472`; `zoomToCursor` not set; RIGHT = pan, wheel = dolly to the target). So the tester zooms with the WHEEL and pans with a RIGHT-drag. The film does the same, in a closed loop: read where the joint is on screen (B:READ: the camera projection of `EX_AIM` through the sheet's own `toWorld`, as W-UAT-B0 does), right-drag it to the middle of the free canvas, one wheel notch, read again. It stops when the joint box is ≥ 400 px tall and inside the free canvas. Each move is logged as `§FILM_VIEW notch|pan joint=x0,y0,x1,y1`.
**Open point 2:** the drag runs from the screen point of (`EX_AIM` x0, y1) to that of (x1, y0), as a real button down, an eased move and a button up (`D.dragFromTo`), logged `§FILM_PTR drag from=… to=…`. The check reads the row the panel writes (`3_BEAM_LAYOUT @EXCLUDE=…`) against W-UAT-B0's `EX_TOL`.
**The panel scrolls inside itself** (`#dm-body`, measured 719 px shown of 6,285 px with all nine cards open). The wheel over the panel scrolls it. New `D.scrollIn(target, scroller)` does what `D.scrollInto` does, with the scroller's own scrollTop limits (§5.10's rule: the margin is a wish).
**Lists (`<select>`):** clicked, then the option's first letters typed and Enter, as a keyboard user picks from a list. The check reads the select's value after.
**The take, in guide order** (p0 = s13, already recorded):
- **PREP (not filmed):** a fresh desk; the pack zip in `Downloads/` and extracted there (Part I films that); the guide page open.
- **p1 to p8** as §5.14.
- **p9:** reload; Open; in the file window, click `0_FLOOR_PLAN_marked.dxf`, then Shift+click `8_SECTION_AA_TRUSS_marked.dxf`. `Downloads/` also holds the zip and its folder, so not Ctrl+A. Then 9 SHEETS; **Arrange**; the status line reaches `Step 46/46`.
- **To make p10 a full PASS, the run's own B2.5 to B3.1 are needed** (box 3 the run's `.db`, boxes 4 and 5 its lines). The take replays Part I's s6, s7, s8, s10, s9 on the tester's own copies, then s11 with box 2 added and s12 judged PASS. In the film these parts are sped and badged: Part I already teaches them.
**Bars:** §5.11's silence and loudness bars hold. The 300 s length bar was set for film 2; Part II is a new film and its length is MEASURED and reported. It is not gated until the owner sets a target.
**Witness:** every Confirm of p1 to p10 is a `§FILM_CHECK` (counts read from the panel's own text). The end of the chain is p10: B0.9 PASS and the run PASS on the live Run Checker.
**RESULT 2026-11-20: Part II rc4 built, every bar PASS** (no re-take after take 1; `checks.log` read):
- **Take 1, ONE take, 16 of 16 scenes PASS** (`§FILM_SCENES_VERDICT PASS scenes=p1,…,p12`), fresh desk + profile, PREP = the pack zip + its extracted folder in `Downloads/`. Measured: Blocked · 99, 34 yellow, roles 0 → 113 → 0, Blocked · 89, 3 PLAN 4 ELEV 1 SECTION · nine Set = SHED · ten layers (two by the split arrow, `plan Rod` pooled: on the floor plan only), Blocked · 1 after PLAN·Col, Qualifies after ELEV·Wall, 14 → 0 · two `@BODYZ` · five `@Z=0.6096` · exclude: 13 wheel notches + 5 right-drag pans to a 421 px joint, the drag wrote `@EXCLUDE=-20884.566,-5609.25,-20845.786,-4938.864` (inside `EX_TOL`) · Qualifies, 0 yellow; nine `_marked.dxf` landed, **equal to the pack's `marked/` mark for mark (0 diffs)**; Chrome did NOT ask about multiple downloads · reload, click + Shift+click, `9 SHEETS`, Arrange `Step 1/46` → `Step 46/46` (46 distinct, 35.5 s) · Convert 511, `.db` 1,257,472 B, `DONE — SHED 511 elements`, `USD 96,839 (RM 372,457)` · Run Checker: box 2 = 9 files, **B0.9 "9 of 9 sheets compared; every mark equal; exclude box inside the tolerance … PASS"**, **`Your run: PASS`**, `uat_result.json` verdict PASS.
- s13 (A3.1 Pack In) is take 5 of §5.12, copied in as its own passing scene. Part II is `FILM_PLAN=plan2` (`plan2.py`), A3.1 first as in the guide.
- **Found and fixed while making it:** `xdotool type` read a leading `-` (`-1.4478`) as an option (now `--`); a set layer the template can name shows `<type> · stated` in place of its list (read-back fixed); OCR misreads the first and selected file-window rows (`0.FAQOR PLAN. marked. dxt`, `Shep UAT pack.20261115.zip`): the first row is placed from the rows below it, as §5.8 did for Home; a cue extra keyed `name` overwrote the cue's name (build rc1 KeyError; repaired from `scenes.log`, code fixed).
- **Builds (same take):**

| build | film s | max silence s | LUFS | lines | gate |
|---|---|---|---|---|---|
| rc1 | 606.4 | 13.4 | −17.1 | 29 | FAIL silence, LUFS |
| rc2 (+4 lines on the silent spans) | 612.8 | 13.4 | −17.0 | 34 | FAIL silence (s10: Back, contents, an 82 s scroll with one cue) |
| rc3 (+1 line at s10 start) | 610.7 | 13.0 | −17.0 | 35 | FAIL silence |
| **rc4** (a beat may hang on a logged click, `click:<label>`; the guide's B5 words over the scroll) | **610.7** | **6.9** | **−16.9** | **36/36 DETAIL** | **PASS** |

  frames 18,321 = picture; tone wrong 0; keys 1177/1177, clicks 139/139. Film: `~/Videos/UAT_Hands_On_Part2_Raw_Sheets_EN_rc4.mp4` (never pushed). Length 10 min 11 s: not gated (no target yet, owner's call).
- Guide (owner's rule: the signed report untouched, changes appended): revision **2026-11-20 (b)**, change list item **8**, *See how* item 2 "made; link when uploaded". `NOTICES_since_report.md` row 8.
- `idempiere_film_packin_bak` is still on :8108. Part II did not need it (s13 not re-taken). Drop it once the owner accepts Part II.
