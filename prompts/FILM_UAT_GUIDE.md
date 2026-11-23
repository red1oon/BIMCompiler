# ⚠ DO NOT REMOVE
SCOPE: the film that walks through the CAPEX UAT Guide (`docs/CapexUATGuide.md`, live at /BIMCompiler/CapexUATGuide/). Pipeline: `scripts/film_uat_guide/` (CPU only, no GPU, voices local Kokoro: no cloud call).
Every number spoken or shown is a fact read from the guide, the saved PDF or a § log line. **Read `build.log` after every run (`§FILM_*`); the exit code is not evidence.** The film file is NEVER pushed
(owner 2026-11-14: only scripts, logs and specs go to GitHub); it stays in `~/Videos/`. Layout rules: `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C.

> ## ▶▶ RESUME HERE FIRST (2026-11-22, night) — Part III rc9 PUBLISHED (https://youtu.be/g7FTNnbbybA), guide rev (f) live
> **State:** film part 3 = rc9 (880.4 s, every bar PASS), linked in *See how* 3 + item 20. Guide revisions (c)–(f) today: the change-list finds 9–19 now live in their step rows (§5.19), then two more independent checks fixed (§5.20, §5.21: items 23, 24); the 80 step ids are unchanged but 11+ rows read differently from the text the signed report proved (the report stays as signed, the change list is its appendix).
> **Independent checks (fresh read-only agents, film vs recording vs step rows):** rc6 1 BLOCKER/8 MISMATCH → rc7 0/6 → rc8 0/3 → rc9 not yet checked (its fixes: §5.21).
> **Open, owner's call:** (1) a Dry Run rerun against the corrected rows (≈30 min, stops/restarts :8108); (2) the Home goals' targets are the pilot's fixed plan (`202611041000_CAPEX-G7.sql`: USD 39,971,166.17, 9 projects), so Actual Cost reads 0 % on a tester's data: the fix belongs in the dashboard module (bim-ootb capex); (3) the C5.1 list-and-pencil route and the no-Phase-tab branch were not recorded (only the form route); (4) the plugin has no published download (LA1 builds it).
> **Take rules:** systemd-inhibit for every take and build; never `pkill -f` your own pattern; `prepL.sh up|ready|reset|down`; compose closes each decoder after its scene (L9).

> ## ▶ RESUME HERE — UAT films (rewritten 2026-11-20; read §5.12 → §5.13, then §5.10–§5.11 for the pipeline)
> **2026-11-22 (c): Part III CUT to 14:04 as rc4 (`~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc4.mp4`, every bar PASS, §5.17): D9 without the refresh, waits ×24, repeats ×16. If the owner uploads it, re-link *See how* 3 and change-list item 20.**
> **2026-11-22 (b): Part III PUBLISHED by the owner: https://youtu.be/stnbV8nygqs, linked in the guide's *See how* 3 + change list item 20 (rev 2026-11-22, #1126). All three films are published. Cover limit: every revision row costs cover space, and P6 failed twice in two days. Each time the fix was to cut older history rows to their items. The next revision will need the same, or a cover that keeps only the latest revisions (owner's call).**
> **2026-11-22: Part III DONE: rc3 `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc3.mp4`, every bar PASS (§5.16 PROGRESS (4) + RESULT rc3). Guide change list 9–19 live (#1119). Next: the owner uploads it, then link it in *See how* item 3.**
> **Film 1 DONE and published by the owner:** rc3 (`~/Videos/UAT_Hands_On_Where_To_Click_EN_rc3.mp4`) = https://youtu.be/PBp4qfV4mIo, linked in the guide's *See how* (item 1).
> **Part II PUBLISHED 2026-11-20 by the owner: https://youtu.be/WvPgjcMbSwo (rc4, every bar PASS, 610.7 s, §5.15 RESULT); linked in the guide's *See how* item 2 and change-list item 8. Next: Part III (below).** (Plan as was:) A3.1 Pack In + the raw-sheet path.
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
- **2026-11-20, after the owner published Part II (https://youtu.be/WvPgjcMbSwo, guide #1096 live):** `idempiere_bimdoc` checked as found (`TD_`=0, `ad_package_imp_proc`=1, 0 connections to the backup), then `idempiere_film_packin_bak` DROPPED. A future s13 re-take makes its own copy first, as §5.12 says.

### 5.16 SPEC — Part III: B4, chapter C (every document by hand), chapter D (2026-11-20; written before code)
**Owner, 2026-11-20:** *"Proceed"* (after Part II was published), then two choices. Chapter C: **"All by hand, repeats sped"**: every document goes through the iDempiere windows in one take; the first of each kind plays at normal speed with a line; the repeats are sped ×8 and badged. B3.2–B3.6: **"Start at B4"** (the B3 edits can be an appendix later).
**Why every document:** chapter D's figures hold only when all of chapter C is made: Within 7 / Over 2 / Not started 5, USD 2,020.45 spent (43 %), USD 6,738.39 in the 5 Drafted orders. The dry run made C through web services (`C.js`, declared programmatic), so no hand path through these windows has been proven yet. This film is the first.
**Source of every value:** the guide's chapter C tables (projects, products, quantities, *How far*), parsed from `docs/CapexUATGuide.md` at take time as `UATDryRun`'s `lib/guide.js` does, never retyped. Window names, field labels and expected messages are the guide's own words.
**:8108, around the take (not filmed; the owner allowed copy and restore, 2026-11-20):**
- Stop the instance; `CREATE DATABASE idempiere_film_p3_bak TEMPLATE idempiere_bimdoc`; start it.
- A2: `setup_test_instance.sh` (must print `§SETUP_VERDICT PASS`), then a restart.
- A3.1: Pack In from a folder (`RUN_ApplyPackInFromFolder.sh`; Part II films the window way); A3.6: the products script, then a restart.
- Check `TD_`=12 and the 10 `PWD-` products (the guide's *10 materials*; chapter C uses 5 of them) before the take; any other count stops the take.
- After the take: stop, restore `idempiere_bimdoc` from the backup, check `TD_`=0, `ad_package_imp_proc`=1 and the setup verdict as found, start, drop the backup.
**The take (scenes in guide order; each one checked against the guide's Confirm column):**
- **r0, B2.9 (sped, no new line):** the Viewer opens the Shed `.db`. PREP puts the pack's `reference/SHED_extracted.db` in `Downloads/`; it has the same bytes size as the tester's export, 1,257,472 B, measured in Parts I and II.
- **r1–r3, B4.1–B4.4:**
  - Find panel ▸ a column group ▸ **› ERP**: the status line reads `Project Order: 1 lines · contract … (saved)` and **open ↗** appears.
  - Press it again: `0 lines`.
  - **open ↗**, the Kernel ERP sign-in, **GardenAdmin**, Log In: project SHED with the group's planned amount; Phase 1 and Task 1 record; Task Line holds the line; Project Line and Phase Line read 0 records.
  - The Kernel ERP keeps its data in the browser, so a fresh profile starts it empty.
- **c1, C1.1 + C1.2:** per purchase-order row, the Purchase Order window: New, header fields, Save, PO Line, New, Product, Quantity, Save. The check is the line price = standard cost, and Total Lines = Grand Total = qty × price. Then Complete where the table says so. Ten orders, six Completed.
- **c2, C2.1:** four receipts by *Create lines from*.
- **c3, C3.1 + C3.2:** three invoices and three payments; half for *Half paid*.
- **c4, C4.1 + C4.2:** nine *Set Project Type* and nine *Issue to Project*.
  - C4.3 and C4.4 are shown for the three projects whose figures the guide gives (204.35, 577.63, 191.35).
  - The other six are checked by the witness, from the tables.
- **c5, C5.1:** TD_DEPOT, the next phase ticked.
- In every kind, the first document plays at normal speed with a line; each repeat is its own scene, played ×8 and badged `>> x8` (new plan key `speed`; no key or click sounds inside a sped scene).
- **d0, chapter D's read job (System Setup):**
  - A terminal on the desk, in the served bim-ootb copy (PREP: a worktree of origin/main served by `python3 -m http.server 8080`, as A1.1/A1.2 say).
  - Type `BRIDGE_BASE=http://localhost:8108 node capex/tools/legacy_snapshot.js`; the line `§DASH_LEGACY_SNAPSHOT … projects=14 … unavailable=[]` is read off the screen.
- **d1–d9, D1–D9:** `localhost:8080/capex/index.html?source=legacy`; tiles, drill panel, Procurement, project pages, ƒ formula, Layout/Skin. Each figure is checked against the guide's Confirm text.
  - D9: if the Home tab was last opened more than 30 minutes before (measured from the take's own log), just log in again. Otherwise, the System Configurator path the guide gives.
**Witness:**
- Each Confirm is a `§FILM_CHECK`. The screen is read from the window's own text; a table read (B:READ) is declared in the check's name.
- The end of the chain is D: every dashboard figure in the guide's D1–D8 equals the tile after the film's own chapter C. 0 FAIL, or a re-take from the failed scene.
**Not shown:** A2 and A3 (server work, Developer Guide §3 / the dry run; Part II films A3.1 by window), B3.2–B3.6 (owner).
**PROGRESS 2026-11-20 (Part III; desk runs, logs read; NOT a take yet):**
- **Proven by hand on the desk:**
  - **B4 r0–r3 PASS:** *Column below grade USD 594.360*; *Project Order: 1 lines · contract USD 594 (saved)*, then *0 lines*; Kernel ERP SHED *BIM: SHED* 594.36, Phase 1, Task 1, the line under Task Line only.
  - **c0 login PASS**, with Select Role ticked and HQ / HQ Warehouse chosen; Chrome's *Change your password* OK and *Save password?* No thanks.
  - **C1, all 10 orders PASS** (6 Completed, 4 Drafted).
  - **C2.1** TD_RIVERSIDE receipt PASS (the line entered by hand); **C3.1** TD_RIVERSIDE invoice PASS (the guide's Create lines from works there); **C3.2** TD_RIVERSIDE payment PASS (Paid, open 0).
- **FINDS for the guide's change list** (owner: append; the signed report untouched). Each is logged `§FILM_FIND`:
  1. **Log in:** the guide names no organization. With the default `*` an order refuses to save: *Fill mandatory fields: Organization, Warehouse*. Tick **Select Role** and choose **HQ** / **HQ Warehouse**.
  2. **C1.1:** the order window prices a line at the *Purchase* list's precision (2 decimals): 68.1167 → 68.12, total 1,975.48, not the guide's 1,975.38. Every order total is logged.
     Knock-on: D4's open orders come to **6,741.25**, not the guide's 6,738.39 (476.84 + 836.64 + 3,581.43 + 1,205.28 + 641.06). D2b and D3 are unaffected (issues use the standard cost).
  3. **C2.1 (owner 2026-11-20: "Enter the line by hand"):** *Create lines from* lists no lines on this iDempiere 13 build. Measured by a statement log: its Info Window binds the Locator's id to the Order criterion (`v.C_Order_ID = 101`, 101 the locator), because the Locator criterion's select clause holds `@M_Locator_ID@`.
     Way that works: on the header set **Order**; on Receipt Line, New, pick the **Order Line** (product, quantity and Default HQ Locator fill in); Save; Complete.
  4. **C3.2:** the Payment window is sales-side. Its Business Partner lookup goes straight to the BP Info with **Vendor = No** (`bp.IsVendor = 'N'`, by the statement log), so no vendor is listed. Set the Info's Vendor to **Yes** and ReQuery. The vendor is found by its search key (`SeedFarm`).
  5. **Chrome:** *Save password?* stays open after the login and takes the keys meant for the page. Press **No thanks**.
- **Driver lessons, now in the code:**
  - A ZK form scrolls inside its own panel: `reveal` wheels it into view before each click.
  - Long lists: Down until the value matches, then Enter. List items carry non-breaking spaces.
  - `xdotool type --`.
  - SQL reads run with `ON_ERROR_STOP` (an error once read as 0).
  - A cue extra must not be keyed `name`.
- **:8108 now:** `idempiere_bimdoc` holds development documents. `idempiere_film_p3_bak` (as found) and `idempiere_film_p3_ready` (prepared) exist.
  - Before the take: `prep3.sh reset`.
  - After the take: `prep3.sh down` (restores as found and drops both copies).
- **NEXT:**
  - Scenes still to write and prove: C4.1 Set Project Type (×9), C4.2 Issue to Project (×9), C4.3/C4.4 (3 shown), C5.1, D0 read job + D1–D9.
  - Then `plan3.py` (strips and lines; repeats `speed: 8`), `prep3.sh reset`, ONE take, build, the change-list rows above, `prep3.sh down`.
**PROGRESS 2026-11-20 (2) — session closed here; read this first to resume Part III:**
- **Also proven on the desk since (1):**
  - **C4.1** Set Project Type PASS (TD_RIVERSIDE, TD_DEPOT, TD_BRIDGE): *OK* read, category W, phases kept.
  - **C4.2** Issue to Project PASS (TD_RIVERSIDE, TD_DEPOT, TD_BRIDGE): *Created 1*; one issue line; balance += qty × standard cost (204.35, 76.66, 577.63).
  - **C4.3 + C4.4** window scenes PASS (TD_RIVERSIDE, TD_BRIDGE): the Issues tab row; Project Balance.
- **More finds** (logged `§FILM_FIND`; for the change list with (1)'s five):
  6. **C4.1 / C5.1 / D6 (owner 2026-11-20: "Set Line Level first"):** the pack's 12 projects carry **Line Level = Project**, and the Project window shows the Phase tab only for Line Level Phase or Task (AD_Tab display logic). Set **Line Level = Phase** and Save, then the Phase tab lists the phases.
  7. **C4.4:** Project Balance shows the exact product with 4 decimals (204.3501, 577.625). The guide prints it rounded (204.35, 577.63).
- **Observation** (not a guide step): TD_BRIDGE's issue line reads **Posting Error**; TD_RIVERSIDE's reads *Posted*. Look at the accounting of PWD-07.2.2 before chapter D.
- **Open at close:**
  - `c5` (C5.1) fails after the TD_DEPOT lookup: `no field C_Project.Value on screen`. The window was left on its Phase tab, grid view.
  - Next try: in `lookup`, come back to the header (tab *Project* / Grid Toggle to form) before reading Value. The rest of `c5` is written: phase row by name, then Grid Toggle, then Complete, then Save.
  - **Not written yet:** D0 read job (terminal) and D1–D9; `plan3.py`; the full take; the build.
- **Selectors and steps that work** (all in `scenes3.js`):
  - `[instancename="<Table><n><Column>"]` + `zk.inst`; `reveal` before every click; long lists by Down/Enter.
  - The Locator field by its dialog's first list.
  - Lookup Record (`[instancename="Value"]`); process OK then the `**` result line.
  - Info windows: Vendor → Yes, Sales Transaction unticked.
- **:8108 restored at close** (`prep3.sh down`: as found, backups dropped). To resume, from the branch worktree:
  1. `prep3.sh up <dir>` then `prep3.sh ready <dir>`.
  2. Desk: `desk.sh start <dir>`.
  3. Scenes: `SHED_DB=<pack>/reference/SHED_extracted.db node scenes.js <out> <dir>/desk/home r0 r1 r2 r3 c0 <c1_*> <c2_*> <c31_*> <c32_*> <c41_*> <c42_*> <c43_*> c5 …`.
  The order numbers are kept in `<home>/p3_state.json`, written by the scenes themselves.
**PROGRESS 2026-11-20 (3) — EVERY Part III scene is proven on the desk; the full take was started and stopped at the owner's "pause to exit"; read this first to resume:**
- **Proven (logs read; rehearsals `reh1`–`reh10`, 62 scenes in all):**
  - **One run, r0 → c42 (43 scenes, 769 checks PASS, 0 FAIL):** B4, the log in, all 10 orders, 4 receipts, 3 invoices, 3 payments, 9 Set Project Type, 9 Issue to Project.
  - **C4.3 + C4.4** for the three named projects; **C5.1** (TD_DEPOT 1 → 2 of 4).
  - **Chapter D, the end of the chain, after chapter C made wholly by hand:**
    - d0: the read job typed in a terminal, `projects=14` read off the screen.
    - D1: 14 / 14, panel rows 14. D2: USD 4,667.80; **ERP ↗** opens TD_RIVERSIDE, Planned Amount 371.25.
    - D2b: Within 7 / Over 2 / Not started 5; TD_CARPARK 457.59 against 330.00, TD_DATAHALL 191.35 against 181.50.
    - D3: USD 2,020.45, 43 %. D4: 5 open orders; the five Supply chain stages as the guide says.
    - D5/D6: TD_RIVERSIDE 371.25, 5 phases, 5 bars, first 3 complete. D7: formula shown. D8: Executive / Dark and back, same figures.
    - D9: Log Out, log in, Home reads *CAPEX Total Projects: 14*, *CAPEX Active Projects: 14*.
- **New finds** (logged `§FILM_FIND`; for the change list with finds 1–7):
  8. **C5.1:** after ticking **Complete**, Save is refused: *Fill mandatory fields: Invoice Rule*. The pack's phases carry no Invoice Rule. The film chooses the project's own rule (*None*), which is iDempiere's default for a phase (`AD_Column C_ProjectPhase.ProjInvoiceRule` DefaultValue `@ProjInvoiceRule@`). A fix in the test-data pack would spare the tester this step: owner's call.
  9. **C5.1:** the Phase tab sits under the header as a list. Click the phase's name, then its pencil (**Edit Record**). The window's Grid Toggle acts on the header, not on the list.
  10. **D3:** adding the panel's **Spent** column gives 2,020.46; the tile reads 2,020.45 (each row is rounded to the cent, Project Balance holds 4 decimals).
  11. **D4:** *Open purchase orders* reads **USD 6,741.25**, not 6,738.39 (the knock-on of find 2, now read on the page).
  12. **C4.2:** each Issue to Project opens its own tab; nine of them push the first window tabs off the strip. Close each one when done.
- **New code** (branch `film/uat-part3`, pushed):
  - `scenes3d.js`: d0 (GNOME Terminal in its own private session bus), d1–d9. Figures parsed from the guide's chapter D rows.
  - `scenes3.js`: `loginForm` (c0 and D9), `onHeader`, `openWin` (cut tab titles matched, old tabs closed), the C5.1 steps, the Issue tab closed.
  - `plan3.py`: 62 scenes, 96 lines, 39 repeats at x8; every strip found in the guide (`python3 plan3.py` prints `§PLAN3`).
- **Not done:** the ONE full take, the build, the change-list rows (finds 1–12), the guide's *See how* link.
- **:8108 restored as found at close** (`§P3_RESTORE_CHECK PASS`, `§P3_DOWN_VERDICT PASS`, both copies dropped). The bim-ootb copy `/tmp/wt-film-uat-ootb` is removed.
- **To resume** (about 15 min of set-up, then a take of about 75 min, then the build):
  1. `git -C ~/bim-ootb worktree add --detach /tmp/wt-film-uat-ootb origin/main`; in it `python3 -m http.server 8080` (A1.1/A1.2); no `capex/legacy_snapshot.json` there.
  2. Unzip `Shed_UAT_pack_20261115.zip` (SYSNOVA `DXF2BIM/ShedDrawing/model/`) for `reference/SHED_extracted.db`.
  3. `prep3.sh up <dir>`, `prep3.sh ready <dir>`; `desk.sh start <dir>/desk < /dev/null > log` (never pipe it: Chrome keeps the pipe open).
  4. Check no bim-ootb Pages deploy is in flight (r0–r3 use the live Viewer and Kernel ERP).
  5. `SHED_DB=… node scenes.js <dir>/take1 <dir>/desk/home $(python3 plan3.py | tail -1)`; read `scenes.log`; 0 FAIL or re-take from the failed scene after `prep3.sh reset`.
  6. `FILM_PLAN=plan3 bash build.sh <dir>/take1 <dir>/wk ~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc1.mp4`; read every log. A sped scene longer than about 64 s of source may breach the 8 s silence bar: add a second line on its mid cue.
  7. `prep3.sh down <dir>`; remove the bim-ootb copy.
- **Take rules learnt this session:** two tabs titled *iDempiere* exist after **ERP ↗** (the new one is known by `Action=Zoom`); the browser's page list is not in tab-strip order (the tab is read off the strip); never press an **OK** after Log Out (it is the log in form's own).

**PROGRESS 2026-11-22 (4) — the take is RECORDED, 62 of 62 scenes PASS; rc1 built, its silence bar FAILED; read this first:**
- **Take 1 (2026-11-21 17:24):** 22 scenes PASS, then the laptop SUSPENDED at 17:47:13 (journal: *The system will suspend now!*; on battery, `sleep-inactive-battery-timeout 900`, the last input about 17:32). The scene broke the same second (`Target page … closed`). **Take rule:** every take and build now runs under `systemd-inhibit --what=idle:sleep:handle-lid-switch`.
- **Take 2:** r0 FAIL `home_row_derived no row between Recent and Desktop`: OCR read no word on the selected Home row (take 1 read *Some*). **Fix (`drv.js` `D.pick`):** when no word is read, Home is the row in the middle of the gap (take 1: Recent 152, Home 194, Desktop 229). A wrong click cannot pass: the next folder must still be found by OCR. Take 3 `§FILM_CHECK PASS home_row_derived read="(gap middle)"`.
- **Take 3:** r0 → c43 PASS (46 scenes, 818 checks), then c5 FAIL `c51_row_is_next_phase "Substructure" next=Superstructure`: the Phase tab was left as a form by c41 and opened on the FIRST phase. Probed on the live page: the breadcrumb's **Next record** (Alt+Right) was enabled. **Fix (`scenes3.js` c5):** in form view, press Next record until the phase is the next unticked one (`§FILM_NOTE c51 form now on "Superstructure"`).
- **Take 3b** (`cp -al take3`, its own `scenes.log`; the first part kept as `scenes_r0_to_c43.log`): c5 → d9 `§FILM_SCENES_VERDICT PASS`, 131 checks, 0 FAIL. Chapter D after chapter C wholly by hand: 14/14, USD 4,667.80, Within 7 / Over 2 / Not started 5, USD 2,020.45 = 43 %, D4 **6,741.25** (find 2), D9 Home *CAPEX Total Projects: 14* = tile.
- **rc1 built** (`~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc1.mp4`, 1131.4 s, LUFS −16.9, 96 lines): `§FILM_CHECKS_BARS FAIL silence_max=39.2296>8.0`. Silences over 8 s (silencedetect −40 dB): r0 10.8 s (the file window, sped), c0 29.3 s (OK role → Chrome's *Save password?*, about 220 s of the driver's OCR wait, idle ×8), d9 8.4 + 39.2 + 10.3 s (the same wait, 296 s). c0 and d9 have NO logged event inside the wait to hang a line on.
- **SPEC (before code): a line at a point BETWEEN two logged events.** `compose.py`: a beat's cue may be `at:<a>|<b>|<f>`, the time `cue[a] + f × (cue[b] − cue[a])`, where `a` and `b` are cues or `click:<label>` names of the same scene and 0 < f < 1; an unknown name or an f outside (0, 1) stops the build (no silent fallback). It only places a line; the picture is unchanged. New lines (each a fact of the take's log or the guide's text): r0 on `click:Home`; c0 three in the wait; d9 on the log in, Chrome's warning, the role window, three in the wait, *Save password?*, and one before the goals. **Witness:** the same build bars; rc2 must read `§FILM_CHECKS_BARS PASS` (silence_max ≤ 8 s), or the fit is moved, never the bar.
- **rc2** (`at:` lines in, `§COMP_AT` 8): `silence_max=8.26454>8.0`, one gap left, d9 between d10b6 and d10b7. The three wait lines were evenly spaced but unequal in length (gaps 7.6 / 5.3 / 4.4 / 8.3 s). Measured film rate in that wait: 37.0 s per unit of f, so they move to f = 0.15 / 0.45 / 0.77 (planned gaps about 6.3 s each) → rc3.
- **RESULT rc3 — Part III DONE (2026-11-22 04:12):** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc3.mp4` (1131.5 s, 458.7 MB), `§FILM_CHECKS_BARS PASS silence_max=6.85625 LUFS=-16.7`, `§FILM_CHECKS_VERDICT PASS`. 108 lines, keys 3469/3469, clicks 168/168. The D9 wait gaps came out at 6.5 / 6.4 / 6.2 / 6.4 s, as planned. The take: 62 of 62 scenes, 949 checks, 0 FAIL (take3 r0–c43 + take3b c5–d9). rc1 and rc2 (bars FAIL) are kept in `~/Videos` beside it.
- **Guide:** the change list items 9 to 19 (finds 1–12) are LIVE: BIMCompiler #1119, rev 2026-11-21, W-GUIDE-PRINT 13/0, deploy guard PASS 992/992, live PDF == checked (4,990,761 B). No step changed (`§STEPS_SAME identical=true` vs master). The signed report is untouched. The same rows are in SYSNOVA `UAT/NOTICES_since_report.md`.
- **Teardown:** `§P3_RESTORE_CHECK PASS` (as found: TD_=0, PWD-=0, imp_proc=1, setup verdict as found), `§P3_DOWN_VERDICT PASS`. :8108 stopped (found stopped). Postgres stopped (this session started it). The bim-ootb copy is removed, and nothing of the run is listening.
- **NEXT (owner):** upload rc3, then link it in the guide's *See how* item 3, plus a change-list row (as #1096 did for Part II). Open: find 8 (C5.1 Invoice Rule) could be fixed in the test-data pack instead of by the tester (owner's call).

### 5.17 SPEC — Part III cut to under 15 minutes (2026-11-22; written before code; owner: *"can u cut down the film to less than 15 mins long. Perhaps need no refresh and there are much gaps of slience in between"*)
**Measured on rc3** (`comp.log`): film 1131.5 s. Idle waits 1,287 s of source → 161 s of film (×8, plus 0.8 s real time at each end of every wait). The 39 repeats 1,821 s → 228 s (×8). Holds for lines 75 s. D9 (log out, log in, the 30-minute refresh) 91 s. 143 silences of 1.5 s or more, 397 s in all.
**Sized before any render:** a timeline-only run of `compose.py` stops at `§COMP_TIMELINE` (rc3's settings reproduce 1131.52 s):

| Settings | film_s |
|---|---|
| rc3 | 1131.5 |
| D9 without the refresh | 1060.2 |
| + 0.4 s kept at each end of a wait | 966.2 |
| + waits ×16 | 935.4 |
| + repeats ×16 | 877.7 |
| + waits ×24, 0.3 s kept | **844.4** |

**Change:**
1. `compose.py` reads the wait speed and the real time kept at each end from the plan: `IDLE_X` (default 8.0) and `IDLE_KEEP` (default 0.8). Parts I and II are unchanged.
2. `plan3.py`: `IDLE_X = 24`, `IDLE_KEEP = 0.3`, `SP = 16`.
3. D9 starts on the Home tab after the new log in (`span=('click:No thanks', 'd9_end')`), with three lines: Home after a new log in, the chapter C summary, and the goals equal the tiles. The log out, log in, Chrome's windows and the refresh explanation are not shown. The guide's D9 Do/Confirm text is unchanged.

Nothing is re-taken, and every document, Confirm check and line of chapter C stays.
**Witness:** the build's own bars (silence ≤ 8 s, LUFS, keys/clicks, lines) PASS and `film_s < 900`, read from `checks.log`. rc4 goes to `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc4.mp4`. The published rc3 stays as it is; the owner decides whether to re-upload.
**RESULT rc4 (2026-11-22 06:58):** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc4.mp4`, **843.8 s (14:04)**, was 1131.5 s. `§FILM_CHECKS_BARS PASS silence_max=5.32819 LUFS=-16.8`, `§FILM_CHECKS_VERDICT PASS`. Silences of 4 s or more: 1 (was 18). 100 lines, keys 3445/3445, clicks 160/160. The timeline-only estimate was 844.44 s. Same take (take3b), nothing re-taken. The published film is rc3 (https://youtu.be/stnbV8nygqs). If the owner uploads rc4 instead, the guide's *See how* 3 and change-list item 20 take the new link.

### 5.18 SPEC — B4 to a LEGACY iDempiere, smooth motion, titles that fit (2026-11-22; written before code; WORK LIST, worked top to bottom)
**Owner, 2026-11-22:** *"Can the click on the Viewer switches to the legacy iDempiere, which by design supposedly able to call by URL when the service is up. If not do the workaround that maybe longer. Show the workings on film and UATGuide with a note if the ERP side is legacy. The jerking movements during zoom or mouse clicks has to stop and smooth."* Also, earlier: *"The opening screen chapter the title is too long until it got chopped off on the sides."*
- **L1 ✅ MEASURED — the call by URL is refused by the browser.** `viewer/erp_push_plan.js legacyTarget` accepts `?erp=<https or localhost>`, and `erp_rest_push.js` POSTs `Content-Type: application/xml`, so the browser sends a CORS preflight first. On :8108 (stock iDempiere 13 web services): `OPTIONS …/ADInterface/services/rest/model_adservice/query_data` with `Origin: https://red1oon.github.io` → `HTTP/1.1 200 OK`, `Allow: POST,OPTIONS`, and **no `Access-Control-Allow-Origin`** (nor `-Private-Network`). So the page cannot read the reply: blocked. This is as `BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md` §8 found in the source ("No CORS support anywhere in `org.idempiere.webservices`").
- **L2 the workaround (the designed one, §8): the plugin serves the Viewer from iDempiere itself (`/bimootb`), so the push is same-origin.** The renewed plugin (MANIFEST, `BIMTabPanel.java`, `META-INF/2Pack_13.1.0.zip`, `tools/`, and the `org.idempiere.bimootb.viewer` web bundle) existed ONLY untracked in `~/.cache/bim_ops_compiler_wt/iDempiereOOTB/`; it goes into git first (`iDempiereOOTB/`). Bundles are rebuilt from today's bim-ootb `origin/main` (`tools/build_bundle_poc.sh`). They are installed on :8108 around a backup, with 2 `bundles.info` lines and a restart; then "BIM OOTB Push" is included in role 102 and the server restarted. **Witness:** the 2Pack row "Completed successfully"; `GET /bimootb/viewer/viewer.html` 200; `APP.LEGACY_ERP.via=served`; **› ERP** → `§PROJ_PUSH_LEGACY … projectId=… created=…`; in iDempiere the Project window holds SHED with the group's planned amount. :8108 is restored as found afterwards (DB from the backup, the bundles.info lines and folders removed).
- **L3** **open ↗** after a legacy push opens THEIR Project window on SHED (the §4.1 deep link): read the code; if absent, spec it before code.
- **L4 film:** after B4 (Kernel ERP) a short section, *"If your ERP is a legacy iDempiere"*: the Viewer opened at `/bimootb`, **› ERP**, the password window, the status line, then SHED in the iDempiere Project window. A new take of those scenes only; the rest of Part III is reused (take3b).
- **L5 guide:** a note at B4, *If your ERP is a legacy iDempiere*, with what to open, what to type, and what to confirm. The steps are unchanged. Plus a change-list row and a revision row (the cover is kept on one page, W-GUIDE-PRINT P6).
- **L6 smooth motion:** measure first. Per output frame, compose's camera (zoom and view centre) and the drawn pointer: their speed and acceleration, the largest per-frame step, and steps at the start and end of a piece. Then a fix that keeps speed continuous: no zoom step at a cut, ease in and out, and the pointer eased between recorded samples. **Witness:** a §-line per build with the max per-frame zoom step and acceleration, and the pointer's max step, against a bar (bars set from the measured rc4 numbers, written here before the fix).
- **L7 titles fit:** measured on rc4 by PIL `textlength`: the title line *From the model to the money* is 2,006 px at 120 pt (frame 1,920), the closing line about 1,945 px at 64 pt, and the strips of `c1_TD_RIVERSIDE_dr` (to x=2,202) and `d8` (to x=1,943) overrun. Fix: a card line shrinks to fit (W − 160 px), and a strip wraps to two lines or shrinks. **Witness:** `§COMP_FIT` per text, all within the frame, else the build refuses.
- **L6 MEASURED before the fix** (`camera.py measure`, the 66-scene Part III timeline, in OUTPUT px per frame). Old path (the one rc4 drew): zoom accel max 0.0805, pan accel max 218, p99 79.6, 2,711 frames with pan accel > 5, **54 zoom pops at cuts**. Causes, read in `compose.py`: a first-order 0.30 s pull toward a target that STEPS (a velocity step at every click window); click windows inside sped playback last a fraction of a film second (a zoom pop); clicks close together pump in, out, in; the crop is rounded to whole pixels. **Bars for the new path, set from these numbers:** zoom accel max ≤ 0.005, pan accel max ≤ 10, pan accel p99 ≤ 5, cut pops = 0. The build refuses otherwise (`§COMP_CAMERA_VERDICT`). Smooth path, measured: 0.0031 / 6.5 / 3.2 / 19 frames > 5 / 0 pops. `CAMERA` is a plan setting (default `old`, so Parts I and II rebuild unchanged; plan3 `smooth`).
- **Length (owner's < 15 min holds with the legacy scenes):** the four legacy scenes added about 100 s (943.6 s). l0 and l1 (B2.9 and B4.1 again) are sped ×16, and l3 (the iDempiere log in again) ×8. Inside a sped scene, a wait plays at the faster of the two speeds; before, a sped scene played its waits SLOWER than a normal one. A strip with the same words as the scene before is shown whole, not typed again (36 repeats). Timeline: **827.3 s**.
- **STATE 2026-11-22 late (session closed):** L1–L7 built and checked (commit 96f28af41). The rc5 build was killed for low memory before writing the mp4; it needs only a rebuild from `~/.cache/uat_film_part3/take5`. Steps: ▶▶ RESUME HERE FIRST at the top of this file.
- **RESULT rc5 (2026-11-22 12:33): FAIL on one bar, a rebuild is needed.** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc5.mp4`, 827.3 s. `§COMP_CAMERA_VERDICT PASS all bars met` (zoom accel max 0.0031, pan accel max 6.51, p99 3.16, cut pops 0), `§COMP_TIMELINE film_s=827.34`, no `§COMP_FIT` FAIL, LUFS −16.6, keys 2211/2211, clicks 165/165. **`§FILM_CHECKS_BARS FAIL silence_max=8.02294>8.0`**: the silence is 124.8 → 132.8 s, inside scene l3 (sped ×8): line l3a (*Open it, and log in to iDempiere.*, about 2 s) holds a 10 s slot over the whole login.
- **L8 SPEC — the silence in l3 (fix the lines, never the bar):** two lines at cues the take recorded (`l3.events.json` cues: `l3_login` = iDempiere's login page, clicks *User*, *Password*, *Select Role*, *OK (log in)*; `l3_role` = the role window): `l3a2` at `l3_login` *"Your user and password, and tick Select Role."*, `l3a3` at `l3_role` *"Then the role window: choose HQ, and press OK."* (clicks *Organization (list)*, *HQ*, *OK (role)*) Each says only what the take shows. **Witness:** the rebuild's `§FILM_CHECKS_BARS PASS` (silence ≤ 8 s) with the other rc5 numbers unchanged in kind.
- **L9 SPEC — a scene's decoder is closed after its last frame (measured during the rc5 build):** `compose.py` opens one `ffmpeg` decoder per scene (`frame_at`) and never closes it. At frame 19,200 of 24,820 there were 52 open decoders, 19.1 GB resident, 5 GB free: the cause of the first rc5 build being killed for low memory. (That build was carried to its end by killing the 51 decoders of the scenes before d0, safe because the pieces play in scene order; no frame changed.) Fix: before the render, the last output frame of each scene is computed with the same piece lookup the render uses; after that frame the decoder is killed and reaped. **Witness:** `§COMP_DECODERS opened=N closed=N max_open=M` at the end of the render, with closed = opened and max_open small (scenes that interleave), and the build's peak free memory read during it.
- **L10 guide — A5 for the administrator (owner 2026-11-22: *"It should be under 'Adminstrator Role' section so he knows"*):** the B4 note only said *your administrator installs the BIM OOTB plugin*. Now chapter A (System Setup = the iDempiere administrator) has **A5 · The BIM OOTB plugin (only if your ERP is a legacy iDempiere)**, rows LA1–LA4, each from what was run and measured: LA1 `tools/build_bundle_poc.sh` (its `§BIMOOTB_BUNDLE` line), LA2 the two folders + two `bundles.info` lines in the exact form `prepL.sh up` writes, then the 2Pack's role *BIM OOTB Push* (prepL waits up to 180 s for it), LA3 the Role window's tab **Included role templates** (name read from the dictionary, `ad_seed.db`) + restart, with the refusal text measured in `BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md` §8.4, LA4 `GET /bimootb/viewer/viewer.html` 200. Checklist row A5, B4 *Needs first* `legacy iDempiere: A5`, Contents, change-list row 21 and the revision row name A5. Step ids LA* are outside the Dry Run's `STEP_ID` (`/^[A-D]\d+/`): `§STEPS master=80 branch=80 identical=true`, the signed report stays valid.
- **RESULT rc6 (2026-11-22): every bar PASS.** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc6.mp4`, **830.3 s (13:50)**, same take (take5), nothing re-taken. `§FILM_CHECKS_BARS PASS silence_max=5.34744 LUFS=-16.6`, `§FILM_CHECKS_VERDICT PASS`; silences of 4 s or more: 4.17, 5.35 (the 8.02 s in l3 is gone: l3a 122.68–125.33, l3a2 125.43–128.47, l3a3 128.57–135.69). Lines 110/110 fitted, keys 2211/2211, clicks 165/165, frames 24910 = picture. `§COMP_CAMERA_VERDICT PASS all bars met`. **L9 witnessed:** `§COMP_DECODERS opened=66 closed=66 max_open=1 still_open=0` (rc5: 52 open, 19 GB). The published film is still rc3 (https://youtu.be/stnbV8nygqs); when the owner uploads rc6, *See how* 3 and change-list item 20 take the new link.

### 5.19 SPEC — the steps say what works, and the film says what it shows (2026-11-22; owner: *"Yes we have to get it perfectly correct"*; written before code)
**Why:** an independent read-only check of rc6 against the guide (scenes, recorded events, logs; no visual) found the film WORKS WITH ISSUES: 1 BLOCKER, 8 MISMATCH, 5 MINOR. Root cause for most: the step rows were kept frozen to the text the signed report proved, and every later find (change list 9–19) was written ONLY in the change list. The film shows what works (the change-list way), so film and step rows disagree, and a tester reading only a step row gets stuck (C5.1: *Fill mandatory fields: Invoice Rule*). Each claim below was re-read in the source before it entered this spec.
**Guide (the step rows carry their finds; each new text is the change-list item's own words or a recorded event):**
- G1 chapter C intro: log in as GardenAdmin, tick **Select Role**, choose **HQ** and **HQ Warehouse** (item 9); Chrome *Change your password* → OK (7), *Save password?* → No thanks (13). The price sentence: the price list's price, rounded to the cent (10).
- G2 C1.1 Confirm: 68.12 for PWD-04.2, 29 × 68.12 = **1,975.48** (item 10; `§FILM_CHECK … saved order line … 1,975.48`).
- G3 C2.1 Do: **Order** on the receipt header; tab **Receipt Line**, **New**, choose the **Order Line**; Save; Complete (item 11; `c2_TD_RIVERSIDE.events.json` clicks *Order*, *tab Receipt Line*, *New (line)*, *Order Line (list)*).
- G4 C3.2 Do: in the Business Partner search set **Vendor** to **Yes**, **ReQuery**, search key *SeedFarm* (item 12; `c32_*` clicks *Vendor (Info) (list)*, *Yes*, *ReQuery (Info)*, *SeedFarm (Info row)*).
- G5 C4.1 Do: then in the header **Line Level** = **Phase**, Save (item 14; `c41_*` clicks *Line Level (list)*, *Phase*, *Save*, *tab Phase*). C4.2 Do: close the Issue tab when done (item 19).
- G6 C4.4 Confirm: the window shows 4 decimals (204.3501, 577.625), pass on the rounded figure (item 15).
- G7 C5.1 Do: open the next phase that is not ticked (in the list: its name, then the pencil **Edit Record**; if the tab shows one phase as a form: **Next record**), set **Invoice Rule** to *None* (the project's own rule), tick **Complete**, **Save** (items 16, 17; `c5.events.json` clicks *tab Phase*, *Next record*, *Invoice Rule (list)*, *None*, *Complete*, *Save*; `§FILM_NOTE the Phase tab opened as a form`).
- G8 D read job: it ends with `§DASH_LEGACY_READ_VERDICT PASS` (bim-ootb `capex/tools/legacy_snapshot.js:31-32`, after the `§DASH_LEGACY_SNAPSHOT` line at :27); on a server that is not `localhost`, `BRIDGE_USER` and `BRIDGE_PASS` are required (:7, else exit 2).
- G9 D3 Confirm: adding up the Spent column gives 2,020.46 (each row rounded to the cent); pass at the tile's 2,020.45 (item 18).
- G10 D4 Confirm: **USD 6,741.25** (item 10; `§FILM_CHECK PASS d4_open_orders_amount… 6,741.25`).
- G11 D9 Confirm, said as it is: the counts equal the tiles (*Total Projects* 14, *Active* 14). A goal with a target shows a percent of the target that A2 installs, which is the pilot's own plan (`202611041000_CAPEX-G7.sql`: Approved Budget USD 39,971,166.17 for Actual/Committed/Invoiced, 9 active projects for Health Green/Schedule On Time/Budget Within, *"a site puts its own plan here"*). Recorded on the test data (`§FILM_D9_GOALS`): Actual Cost 0 %, Health Green 55 % (5 of 9), Schedule On Time 66 %, Budget Within 77 %. **A dashboard-module question goes to the owner** (targets from the site's own plan); the guide says what the tester sees today.
- G12 L3 Do: log in with **Select Role**, **HQ** (as chapter C; `l3.events.json` clicks *Select Role*, *Organization (list)*, *HQ*).
- G13 change list: items 9–19 → *Corrected in the step* (rev 2026-11-22 (c)); new item 22 (the steps now carry them; D9's percents; D's last line); revision row (c). Mirrored in `NOTICES_since_report.md`.
- **Signed report:** steps C1.1 C2.1 C3.2 C4.1 C4.2 C4.4 C5.1 D3 D4 D9 L3 change text. The Dry Run's `§STEPS_SAME` will now read false for them: the report stays as signed (owner 2026-11-20) and the change list is its appendix; a Dry Run rerun against the new text needs the owner's go (it stops and restarts :8108).
**Film (narration and strips; no re-take):** N1 c1f *sixteen times* (`SP = 16`). N2 c5: three lines at the recorded cues `c5_TD_DEPOT_phase`, `_rule`, `_tick` (open the next phase; Invoice Rule None, else Save is refused; tick, save, 2 of 4); strip = G7's new words. N3 l0: the administrator installs the BIM OOTB plugin first (A5). N4 d0: *a line counts what it read … and the last line says PASS*; on another server add user and password. N5 C3.2 repeats: the line points to where the guide's check is read (the invoice's **Paid**), as the take did not open it. N6 d9: the counts equal the tiles; the percents are of the targets A2 installed. Every strip still a substring of the guide (`§COMP_STRIP FOUND`).
**Witness:** `§COMP_STRIP` all FOUND; `§FILM_CHECKS_VERDICT PASS` on rc7; then the same independent check re-run on rc7: verdict WORKS, 0 BLOCKER, 0 MISMATCH between film, recording and step rows (any remaining item named as such).

### 5.20 SPEC — second independent check (rc7): 0 BLOCKER, 6 MISMATCH, 9 MINOR → fixed in the rows and the narration (2026-11-22; written before code)
**rc7 RESULT:** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc7.mp4`, 866.3 s, `§FILM_CHECKS_VERDICT PASS` (silence_max 5.33, LUFS −16.5, 113/113 lines), `§COMP_DECODERS opened=66 closed=66 max_open=1`. Guide rev (c) live (#1142, `§PRINT_VERDICT PASS judged=13`). A fresh read-only check: **WORKS WITH ISSUES, 0 BLOCKER** (C5.1 and D9 now pass), 6 MISMATCH, ~9 MINOR. Each item re-read in the source:
**Guide rows:**
- H1 legacy order: `QueryCProject` reads every `C_Project` of the client (bim-ootb `capex/adapters.js:7,45`), so the SHED that L2 creates is one more project for chapter D, whose figures (D2, D2b, D9) are for the 14. The L-note says: do L1–L3 after chapter D, or on a copy of your iDempiere.
- H2 L3 Do: Chrome's windows at the log in (*OK*, then *No thanks*; `l3.events.json` clicks *OK (Chrome)*, *No thanks*).
- H3 C5.1 Do: a project that had no C4.1 still has *Line Level = Project* (item 14): set **Line Level** to **Phase** first.
- H4 C3.2 Do: half rounded to the cent (TD_BRIDGE 2,426.13 → pay 1,213.07, 1,213.06 stays open: `§FILM_CHECK PASS c32_invoice_paid_state TD_BRIDGE paid=N open=1213.06`).
- H5 C3.1 Do: the dialog runs with its **Create lines from** button, not *OK* (`scenes3.js:225`, `button.txt-btn` hasText *Create lines from*).
- H6 chapter C log-in note: user and password *GardenAdmin* on a fresh GardenWorld; close a document's tab when done (the recording closes them: `× (close Purchase Order: …)`).
- H7 D9 Confirm: money goals are rounded to the unit (*Approved Budget* 4,668 for the tile's 4,667.80; `§FILM_D9_GOALS`).
- H8 D8: the duplicated *☐ Pass ☐ Fail* cell removed.
- H9 B4.1 Do: the list shows parts as soon as the panel opens (`viewer/nf_panel_search.js runSearch`, empty name → `WHERE 1=1 … LIMIT 50`); typing *column* lists the column types (the film's way, `r1.events.json`).
**Narration:** M1 c2a: the project fills in from the order (no Project click in `c2_*`). M2 l3a2: Chrome's windows. M3 C3.2 repeats: *Check it on the invoice: …* (the take read it, did not open it). M4 c4b: the search opens with *Vendor = No* (not "lists customers"). M5 c1f: *sixteen times or more* (waits inside a sped scene play faster, §5.18 Length; measured ≈ 18×). M6 d8a: *under a tile* (d7 opened one). M7 l0b: do this part after chapter D, or on a copy.
**Witness:** `§COMP_STRIP` 66 FOUND, rc8 `§FILM_CHECKS_VERDICT PASS`, a third fresh independent check: WORKS, 0 BLOCKER, 0 MISMATCH.

### 5.21 SPEC — third independent check (rc8): 0 BLOCKER, 3 MISMATCH, 6 MINOR → fixed (2026-11-22; written before code)
**rc8 RESULT:** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc8.mp4`, 876.0 s, `§FILM_CHECKS_VERDICT PASS` (silence_max 5.37, LUFS −16.5, 113/113), 66/66 `§COMP_STRIP FOUND`. Guide rev (d) live (#1145). Fresh check: WORKS WITH ISSUES, 0 BLOCKER, 3 MISMATCH, 6 MINOR.
- K1 **the legacy scenes move after chapter D** (the guide and the film both say L1–L3 come after D; the film showed them before C). `plan3.py` puts l0–l3 after d9 (a plan order, no re-take; the take itself ran L at 08:02, after D at 02:16). l0b says why.
- K2 C3.1 Do in the recorded order: header, **Save**, then **Create lines from** … the window's own button, then Complete (no second Save): `c31_TD_RIVERSIDE.events.json` *Business Partner, Project (list), Save, Create lines from, Order (list), …, tick the line, Create lines from (run), Document Action, OK (Complete)*. Narration c3a/c3b the same.
- K3 C3.2 repeats say what the film shows (the payment), not the invoice it did not open: *half paid: the payment is half the invoice* / *paid in full*.
- K4 D9 Do: **Log Out**, log in again with Select Role and HQ (`scenes_c5_to_d9.log` Log Out click; `scenes3d.js:193-196`). D9 Confirm: Health Green 55 % *on the day it was proven* (2026-11-22; colours drift with the calendar, guide intro). d10c: *Total and Active* (the two compared, `d9_home_total/active_projects_equals_tile`).
- K5 B4.1 Do names the key **F** (`r1.events.json`). D2: **ERP ↗** opens your iDempiere, log in if it asks. Checklist B4 and sign-off A, B name the legacy-only steps (A5: 4, L1–L3: 3).
- K6 narration: r0a *with the Shed open in the Viewer, as at the end of B2* (not "where part one ended"); `say()` speaks *R C one two four column* for PWD-07.2.2 (the guide's *RC 1:2:4 column*).
- Not fixable without a re-take (named, not hidden): the C5.1 list-and-pencil route and the no-Phase-tab branch were not recorded (only the form route); the long log-in waits (220–300 s) are not separated from the harness's polling in the log, so the guide gives no wait figure.
- **RESULT rc8 (§5.21) and rc9 (2026-11-22):** rc8 876.0 s PASS (uploaded first as https://youtu.be/Z8f6O50sqaI, 876 s, then superseded). **rc9** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc9.mp4`, **880.4 s (14:40)**, `§FILM_CHECKS_BARS PASS silence_max=5.38425 LUFS=-16.5`, `§FILM_CHECKS_VERDICT PASS`, `§COMP_CAMERA_VERDICT PASS`, `§COMP_DECODERS opened=66 closed=66 max_open=1`, 66/66 `§COMP_STRIP FOUND` in rev (e); the legacy scenes l0–l3 after d9. **Published by the owner: https://youtu.be/g7FTNnbbybA (881 s = rc9)**, linked in *See how* 3 and change-list item 20 (guide rev (f)).

### 5.22 Fourth independent check (rc9, published): 0 BLOCKER, 2 MISMATCH, 9 MINOR → item 25 (2026-11-22)
- **My own error, retracted:** §5.20 H9 wrote into B4.1 *"the list shows parts as soon as the panel opens"*, citing `runSearch` (its body) but not its call site. `openFindPanel` clears the results and builds only the axis tree (bim-ootb `viewer/nf_panel_search.js`, *"§S281: Defer item queries — only build tree … on open"*); `runSearch` runs on typing. Live in rev (d)/(e). B4.1 now: click the model, **F**, type a word (*column*), **Enter** (`r1.events.json`: *the model area (focus)*, F, the Find box, `column`, Return; `b41_groups_listed groups=50`).
- **C3.2:** the Payment window finds a partner by its search key, not its name (`scenes3.js:273`, `§FILM_FIND C3.2_bp_by_search_key`): the row says type *SeedFarm*.
- C3.1: the dialog's **Create lines from**, not the header's. D: the job's last line is `§DASH_LEGACY_READ_VERDICT PASS optional_missing=[…]` (`legacy_snapshot.js:32`). Cover status names items 22–25; change list back to newest first.
- The published rc9 (https://youtu.be/g7FTNnbbybA) already does all of these on screen; its 66 strips stay FOUND in the corrected guide. Left as MINOR (film wording, no rebuild): l3a2 says Chrome's windows before the role window (recorded: Chrome OK, role, then No thanks); price list, warehouse, bank account and tender type were already filled in the take (`§FILM_NOTE … already reads`), the narration names them.

### 5.23 SPEC — rc10: a card before the legacy section; chapter C says which projects (owner 2026-11-22: *"At 13:08, it seems to go thru a same process again … with earlier 0:34 for B4?"*, *"i thot it already switched to legacy … at Chapter C during 1:15?"*)
- **Measured in rc9 (not guessed):** the D9 voice ends at 789.21 s (`fit.log` `§NARR_FIT d10d … dur=7.91`; `voice.mp4` silence 789.21 → 794.85). The picture cuts to l0 at about 789.5 (`§COMP_HOLD d9 d10d +8.14s`). Then 5.6 s with no voice, only the l0 strip's key sounds (`sounds.wav` 789.84 → 794.23), until l0a at 794.85. Nothing marks the switch: the B4 at 0:34 (Kernel ERP) and the B4 at 13:09 (legacy iDempiere) look the same.
- **The film has two ERPs, and says it in neither place:** B4 (0:34) sends the Shed to the Kernel ERP; chapters C and D (1:15 →) run in the tester's iDempiere on the 12 test projects (guide chapter C intro, change-list item 4), not the Shed; L1–L3 (end) send the Shed into that iDempiere.
- **Fix (no re-take):** (1) `compose.py`: a scene may carry `card=[lines]`, a silent 3.6 s card before it (the chapter-card rule: plain dark, no voice; `§COMP_FIT card` per line). l0's card: *If your ERP is a legacy iDempiere* / *B4 again: the Shed into your iDempiere* / *steps L1 to L3, after chapter D*. (2) c0a: *Chapter C is done in your iDempiere, on the twelve test projects, not the Shed.* **Witness:** `§COMP_CARD l0` logged, `§FILM_CHECKS_VERDICT PASS` (silence ≤ 8 s with the card), 66/66 strips FOUND.
- **RESULT rc10 (2026-11-22):** `~/Videos/UAT_Hands_On_Part3_ERP_Dashboard_EN_rc10.mp4`, 884.0 s, `§FILM_CHECKS_VERDICT PASS` (silence_max 5.39), `§COMP_CARD l0 at 789.57s`, 66/66 strips FOUND. **Not for upload:** the owner then decided the Shed goes on the dashboard by the legacy route before chapter D (bim-compiler `prompts/SQLiteIDEMPIERE.md` §INTERNAL-UAT), so B4 and D will be re-taken; rc10 is the fallback.

### 5.24 SPEC — Part III redone in the guide's rev (h) flow (owner 2026-11-23: *"since it is different steps flow from UATGuide, it should be redone"*; written before code)
**Why:** rc9 (published) shows B4 with ONE column group (*1 lines*, 1 phase / 1 task), the legacy L1–L3 AFTER chapter D, and D's 14-project figures. Guide rev (h): B4.1 = F, **Level 1 (511)**, the whole Shed (USD 355,097.98); B4.2 *11 lines* (12 with the schedule); B4.4 Phase *1 of 6*; legacy L1–L3 **before chapter C**; D = 15 / USD 359,765.78 / Within 7 Over 2 Not started 6 / 1 % / Home 15 & 359,766. Chapter C unchanged (every C check PASSED in the new order, 2026-11-23).
**Scene order (the guide's document order):** r0 r1 r2 r3 (Kernel B4, whole Shed) → l0 l1 l2 l3 (legacy B4, card "IF YOUR ERP IS A LEGACY iDEMPIERE … before chapter C") → c0 … c5 → d0 … d9. `plan3.py` line 183-184 (§5.21 K1: legacy after D) is REVERSED; its l0 card/beat wording ("after chapter D … one more project") rewritten from the rev (h) note.
**Script changes:** `scenes3.js` r1 = the whole-Shed l1 (tree Level 1 label, waits for the cents); r2 checks `Project Order: 11 lines` (or 12 with the schedule); r3: Phase *1 of 6*, Task Line 1,023.22458 — read off the record navigator, not `tabRows` (which returns 1 for any form view, scope-blind, found 2026-11-23); `plan3.py` strips for r1/l1 from the rev (h) rows (today `strips_missing=['r1','l1']`), narration figures from the guide (D lines parsed, never retyped). Already in: the late Chrome *Save password?* dismissal before each C/D scene; `FILM_MEASURE` (not used for the take).
**Take:** prep3 up → prepL up (bundles from bim-ootb origin/main) → desk → one take of all scenes, 0 FAIL, under systemd-inhibit → prepL down → prep3 down → :8108 stopped (as found). Build rc11 with the plan3 bars (silence, LUFS, decoders, camera, fit); then the independent read-only check (film vs recording vs rows) as in §5.20–5.22. The owner uploads; re-link *See how* 3 + change-list rows. Reference recording of the new order (12 FAILs = old figures only): `~/.cache/uat_film_part3/take_h_measure/` (62 scenes).
**Witness:** the take's `§FILM_SCENES_VERDICT PASS` against guide rev (h) (figures parsed from the guide) + `§PLAN3 strips_missing=[]` + the build's `§FILM_CHECKS_VERDICT PASS`.

### 5.25 NOTE — CH 0 "BIM to ERP Variance Order" film (owner 2026-11-23), direction so far
Owner: the film covers **Project Issue phase-dates variance**, on the **Shed** (UAT continuity), incl. ERP re-pushing; not the Gantt-edit path. Facts (trace in `prompts/SQLiteIDEMPIERE.md` 2026-11-23 CH 0 section; dashboard rule `capex/tiles.js:20`): Delayed = an incomplete phase past its EndDate; At Risk = SPI < 0.9; No schedule data = no dated phase. **Conditions:** SHED's phases need dates (a push from a fresh Viewer carries none: open Time Machine first); a legacy re-push never updates dates (find-or-create). **No report compares an issue's date with its phase window** (variance shows only as Delayed / SPI). Next: measure the sequence on :8108 (push with dates → issues → phase overruns → dashboard *Delayed N days* on SHED) before any script.
