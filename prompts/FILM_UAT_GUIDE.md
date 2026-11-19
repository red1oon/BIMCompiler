# ⚠ DO NOT REMOVE
SCOPE: the film that walks through the CAPEX UAT Guide (`docs/CapexUATGuide.md`, live at /BIMCompiler/CapexUATGuide/). Pipeline: `scripts/film_uat_guide/` (CPU only, no GPU, voices local Kokoro: no cloud call).
Every number spoken or shown is a fact read from the guide, the saved PDF or a § log line. **Read `build.log` after every run (`§FILM_*`); the exit code is not evidence.** The film file is NEVER pushed
(owner 2026-11-14: only scripts, logs and specs go to GitHub); it stays in `~/Videos/`. Layout rules: `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C.

> ## ▶ RESUME HERE — FILM 2 "UAT, hands on: where to click" (written 2026-11-19 at session end; read §5 → §5.5 → §5.6 → §5.7)
> **State:** pipeline BUILT and proven on a 4-scene cut (101.5 s, every check PASS: frames = picture, 11/11 lines DETAIL, 0 tone wrong, keys 197/197, clicks 10/10, −17.5 LUFS, silences ≤ 5.6 s). All 12 scenes PASSED in separate takes (§5.6 measured values). The one full take (s1→s12 in film order, fresh desktop) failed at **s5**: `ocr_find t === 'Home'` in the Modeller's *Open Files* window (the selected row reads with its icon glyph); first fixed to `/Home$/` — **that fix was wrong** (§5.8 mock: the row is read `Some`, not with a glyph); now derived from the sidebar order, **mock PASS on 3 recorded frames, full take not yet re-run**. Also open: s6–s8 also failed in that take (likely knock-on of s5's dialog left open; s8 lost the X display) — read their logs on the re-take. No film file exists yet.
> **Next, in order:** (1) `bash scripts/film_uat_howto/desk.sh start <work>` then `node scripts/film_uat_howto/scenes.js <work>/full <work>/home s1 s2 s3 s4 s5 s6 s7 s8 s10 s9 s11 s12` (~20 min; run in the background; READ `<work>/full/scenes.log`, every line §FILM_CHECK PASS, verdict PASS); if a scene fails, DERIVE from its log + events.json (owner 2026-11-19: *"u can theoretically infer and derive, need not physically catch it"*), fix, re-take that scene with its PREP. (2) `bash scripts/film_uat_howto/build.sh <work>/full <work>/build ~/Videos/UAT_Hands_On_Where_To_Click_EN_rc1.mp4` (refuses unless the takes all passed); read `checks.log`. (3) One contact-sheet look, then the result into §5.8. (4) Ask the owner about the iDempiere Pack In scene (§5.6 last line). `desk.sh stop <work>` at the end.
> **Open question for the owner:** add the iDempiere scene (A3.1 Pack In + menu Search) on the shared test instance :8108 (copy-and-restore its database: stops/restarts the server)?

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

