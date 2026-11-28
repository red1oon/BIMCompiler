# FILM-M2 (working title) — the site mission loop — script + shot list, DRAFT

# ⚠ DO NOT REMOVE — scope: a WRITTEN script and shot list only. Nothing recorded, baked, or published. No recording until (a) no shot below is
# left in a NEEDS state and (b) the owner says go (MOBILE_PERF.md ▶ REVIEW LOG "FILM": *"no bake or recording without the owner's go"*).
# Read the log after every run when it is recorded; every number and on-screen value below is `TBD at recording — read from the product`
# unless a source line is given. Written 2026-11-28 against bim-compiler `origin/master` (FILM_NARRATION.md, MOBILE_PERF.md, the archive).

---

## 1. Premise, length, languages

**For whom:** the owner's own audience for the phone lane (site managers, project offices, ERP people) — people who run work that has to be done in a
building and want to know where each job stands. **The one idea a viewer leaves with:** one loop, told once — the office issues the work from the
Project Order, a person on site walks it with a phone and reports, and the office sees the progress in the model; and the phone can do this lightly
because it is now a site-mission tool, not a copy of the desktop (it no longer loads the film, photoreal and 4D schedule tools — and, as the remaining
orders land, the rest of the desktop-only groups). The "lighter phone" is ONE short beat inside the loop (scene 5, where the phone first opens the
model on site), not a second story.

**Shape (PLAYBOOK C, §"The screenplay shape"):** the honest "before" first (every Request still New, nothing on the phone), the loop, one real event at
the end (the same Request screen, after), then the last card. Dialogue, not monologue (PLAYBOOK "What red1 likes": two voices, F asks what a newcomer
would ask, M answers in one or two plain sentences).

**Target length: about 126 s (12 scenes), derived — not taste:**
- cover = 3.6 s (PLAYBOOK C "Chapter cards": *each card is its OWN silent segment of 3.6 s*), last card = 10.0 s (the FILM-M1 rc3 last card, archive "FILM-M1 rc3 BUILT": *house last card 10.0*);
- every other scene = its speech + 1–3 s (PLAYBOOK C §4 Timing: *cut each beat to its speech + 1–3 s (slack > 4 s left 7–9 s silences)*), never a silence over about 7 s;
- the 12 scenes (table in §3) sum to 125.6 s on estimated speech; **the final length is the measured speech plus slack after the first fit, not this estimate.** FILM-M1 rc4 was 79.0 s for a smaller story (no issue, no return trip); this one has two more legs (issue and prepare; the report back and the model colour).

**Language(s):** English only, like FILM-M1 rc4 (MOBILE_PERF.md State: *"No other languages"*). Voices per PLAYBOOK "Voices (decided)": English = Kokoro v1.0, F = af_heart, M = am_michael, local CPU, deterministic. Other languages only on the owner's word (a translated cut also needs the last-card line "translated by the build session, not reviewed by a native speaker").

**Layout:** split screen, LEFT = the office (desktop), RIGHT = the phone (portrait, the real phone layout at 456 x 933 as FILM-M1's R1 recorder, headless, CPU only). Rule wording vs the brief: HOUSE STYLE point 1 says "Split screen, top and bottom" (terminal strip above, application below); the brief asks LEFT desktop / RIGHT phone. I used left/right because a portrait phone body (456 x 933) does not fit a top/bottom strip; the typed-line-plus-key-sounds beat structure of the house style is kept (scene 5 types its command on the left). The owner's word on this is the one thing I am unsure of; it is not one of the five questions.

**Output name (plain words, no internal code):** `Office_site_missions_EN_rc1.mp4` in `~/Videos/`; scripts and logs committed, never media (memory: "Films are never pushed to GitHub, only their scripts"). The sample is shown as "Office" (one name table, as FILM-M1 rc4 point 5), never the db name.

---

## 2. The cover card and the last card

### Cover card (scene 1, 3.6 s, silent)
Rule applied — FILM_NARRATION.md ▶ HOUSE STYLE FOR ALL FUTURE FILMS, point 4: *"The cover is the two-colour chapter card (owner, 2026-11-18: "Opening card is nice 2 color CH"): a red kicker `COMMAND LINE ERP  ·  CH <n>` (`#FF6B78`, letter-spaced) over a large white title and a grey sub-line, as CH 0 and CH 2 (`scripts/film_mis_menu/cards.js` `cover`)."* and PLAYBOOK C "Chapter cards": *plain dark background (#0b0f17, no still, no footage), house typography (kicker coral #FF6B78 34 px, title line 1 off-white #F3EEE8 120 px, line 2 coral, one plain line 40 px — DejaVu Sans), NO voice over the card … and NO persistent chapter / series tags anywhere in the film.* Same kicker pattern as FILM-M1 rc3/rc4 (`CH 0 · OFFLINE MOBILITY`).

| element | text (the lead's wording; the owner may reword) |
|---|---|
| red kicker | `SITE MISSIONS  ·  CH 0` |
| large white title | `From the Project Order to the site, and back` |
| grey sub-line | `The office issues the work. A person on site walks it with a phone. The office sees it in the model.` |

The "lighter phone" is NOT on the cover (no number on a cover; a card number must be a fact the card guard checks, and the claim is shown in scene 5 or it is not made). Lesson applied, archive rc2 owner note: *"the house cover and last-card rules in FILM_NARRATION.md apply to EVERY film brief; rc2's brief did not cite them and the owner had to ask."* Card check: width and height measured by the cards builder, no overflow (`§GUARD_CARDS`).

### Last card (scene 12, 10.0 s)
Rule applied — FILM_NARRATION.md ▶ HOUSE STYLE — THE LAST CARD OF EVERY FILM: *"Every film ends on ONE last card with what the "Immersive Software" films' last card carries … 1. Prior art, "what this learned from": only sources this lane READ, each with what was taken from it … "Not found in this search" where nothing was found; never "first" or "novel". 2. Credentials: the PR numbers the film shows and the witness verdicts that prove its claims … read from the build's own logs. 3. Measured cost where it applies … never estimated; and the key-sound credit; and "translated by the build session, not reviewed by a native speaker" on a translated cut."* plus ▶ HOUSE STYLE — ALWAYS GIVE A GUIDE LINK: *"(1) on its last card, beside the credentials; (2) in the hand-over message to the owner … the build checks it: HTTP 200 and the anchor id present in the fetched page, logged as `§FILM_GUIDE url= http= anchor=Y|N`. A feature the film shows that the guide does not describe yet is a gap to close in the guide before the film is posted."*

| block | content (all `TBD at recording — read from the product` where a number) |
|---|---|
| What you saw | issue from the Project Order · prepare · open on the phone · walk the path · card on arrival · the form · report · Reported / Verified at the office · the model colour — only what the recording really showed (a beat whose evidence line is missing is not in the film, so not on the card) |
| Prior art, what this learned from | candidates from MOBILE_PERF.md that this lane READ, each to be put on the card ONLY with a dated read in this build's log (the guard's check P): iDempiere `MWFProcess.java:126-134`, `RequestEventHandler.java:186-192`, `MStatus.java:268-282`, `CalloutRequest.java:88-103` (Request status, History row, standard response — read by the design lane 2026-11-28, "DESIGN REVIEW" and "WO-25/WO-31 ruling"); the FILM-M1 card's dated web reads (RAIL, Popover API, Navigator.share) go on ONLY if this film shows panels or the share sheet — it does not, so they are dropped. Anything not read: "Not found in this search". |
| Credentials | PR numbers the film shows and their verdict lines, copied from the logs at recording, e.g. phone mission #3512 (`§W-TASK-MISSION … verdict=`), processor #3519 + #3522 (`§W-MISSION-PREPARE … verdict=`), the phone gates #3513 / #3514 / WO-6's PR (`§W-PHONE-AXE group=… verdict=`), WO-31's, WO-26's, WO-15's, WO-28's PRs `TBD`. Counts change as work orders land (WO-31 raises W-TASK-MISSION from 10 to 14 checks): never copy a count from this file. |
| Measured cost | the phone's start-up weight, `§BOOT_WEIGHT eager_MB=<N>` read at recording, with "what was left out of the phone" (the gated groups, by name). The card prints the number it measured; it never prints the 3 MB target as if reached. |
| Credits | key sounds: eklee / qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 |
| Guide link | github.io BIM User Guide section for site missions — **the guide has no site-mission section today (as far as MOBILE_PERF.md and the archive say; re-check)**; the Send to HQ report path is covered by `https://red1oon.github.io/BIMCompiler/BIMUserGuide/#send-to-hq` (FILM-M1 rc4). The mission section must be written and `§FILM_GUIDE … http=200 anchor=Y` PASS before the film is posted; a gap is reported, never linked around. |

---

## 3. Scene table

Dependency tags: `READY` = merged and witnessed today · `NEEDS WO-31` (fixed form, in progress) · `NEEDS WO-26` (delivery by role) · `NEEDS WO-15` (report back as Updates + Reported / Verified) · `NEEDS WO-28` (done / open / can't-proceed colour per element) · `NEEDS WO-6..9` (see scene 5). The film is recorded only when no row is in a NEEDS state; no row is written around a missing feature.

Key sounds: real recorded presses (eklee / qubodup), only where text is typed, on either screen; the voice starts AFTER the return key (check K2). Mouse clicks and taps are silent. Voices: F = af_heart, M = am_michael. Numbers are spoken in words, rounded in words, exact on screen (PLAYBOOK C "Dialogue rules"). `<…>` = a value read from the log at recording.

| # | sec (est.) | LEFT — office (desktop) | RIGHT — site (phone, portrait) | User action; key sounds | Narration (voice starts after the cue) | What must be TRUE on screen (proof) | Dependency |
|---|---|---|---|---|---|---|---|
| 1 | 3.6 | cover card, full frame (see §2) | (the card spans both; nothing else) | none; silent card, no voice | none | card width/height check, `§GUARD_CARDS … verdict=PASS` | READY |
| 2 | 9 | Request window of the Office Project Order: the list of Requests, every status `New`, no Updates, no History (the honest "before") | the phone frame, idle (the stick-figure zoom's last frame, as FILM-M1; no app open) | click Find › ERP › Project Order (the existing push), then open the Request list; no typing, no key sound | F: "A job on site. Where does it start?" · M: "In the Project Order, and the requests under it." | the push's own § line from the page log (not named in the work orders: read it, do not invent a tag); the grid's row count = the number of Requests the recorder created; every status cell reads New; Updates and History tabs empty | READY |
| 3 | 9 | click "Prepare site mission" beside the push; the counts (prepared, skipped with reasons) show, the file is offered as a download `mission_<DocumentNo>_<n tasks>.json`; the grid refreshes: statuses `Prepared`; History tab shows one new row per Request holding the previous status New | phone frame idle | click "Prepare site mission"; no key sound | F: "And then?" · M: "One click prepares the mission. Every request now says Prepared." | `§MISSION_PREPARE project= requests= prepared= skipped= tasks= routed= straight= start=`; `routed` > 0 on the Office (real room routes; `straight` counted, never hidden); status cells Prepared; History rows = prepared count | READY |
| 4 | 8 | grid: the same Requests move `Prepared` → `On site` once the phone picks the mission up | the phone lists the missions for its role and opens this one: the strip says "task 1 of `<m>`" | on the phone: tap the mission in its list; no key sound | F: "How does the person on site get it?" · M: "It goes to their role. They open it. Now it says On site." | WO-26 defines the delivery log line (`TBD`); then `§MISSION_LOAD tasks=<m> refused=0 model_match=true`; grid statuses On site | NEEDS WO-26 |
| 5 | 11 | a terminal strip: the line `node scripts/boot_weight.js` is TYPED, then its output `§BOOT_WEIGHT eager_bytes=<> eager_MB=<N> tags=<> desk_bytes=<>`; the number is held and framed large | the phone opens the Office model on site (the model arrives; same recording run as the recorder's own network log of the scripts the phone page really requested) | LEFT: type the command, Enter (key sounds); the voice starts after Enter. RIGHT: opens the model | M: "The phone loads about `<N in words>` megabytes to open the model." · F: "Where did the rest go?" · M: "It stays at the office: the film, photoreal and schedule tools `<only the groups gated at recording>`." | `§BOOT_WEIGHT eager_MB=` value on screen AND the recorder's count of script bytes the phone page really fetched at boot agree within the tool's rounding (a number from a tool that measures the wrong thing is scope-blind, guard §5); the named groups each have a merged gate: `§W-PHONE-AXE group=<name> … verdict=PASS` (today film + film sound, 4D tools, rule checks; photoreal still in progress); a "before" figure only if produced the same way (staging §4.6) | NEEDS WO-6..9 (reduced wording naming only gated groups is READY today; see below) |
| 6 | 14 | grid unchanged (On site) — office waits; a small log strip beneath shows the `§MISSION_STEP` line scrolling | phone: the strip "task 1 of `<m>` — `<summary>`", the path drawn to the first spot; Walk (steps simulated, labelled); the task card opens on arrival with the distance; tap "I'm here" | tap Start walk; walk samples driven to the spot; tap the card; no key sound | F: "How do I find the spot?" · M: "The path shows the way." … "Arrive, and the card opens." | `§MISSION_STEP n=1 of=<m> task=<id> path_pts=<k>`; `§TASK_ARRIVE` (name as it appears in the page log) with `d_m=` and arrival kind; path points read from the drawer's state = the file's path (not pixels); on a routed task `path_kind` is not "straight" | READY |
| 7 | 16 | the grid, still On site (the office has not heard yet) | the form: outcome picked from the Resolutions list; "what I found" typed; time on task shown (card opened → Done); material used picked (product + quantity); photo (simulated camera, labelled); checklist ticks (from the Standard Response chosen on the Request) → Done | tap outcome; TYPE the found text, Enter or tap Done (key sounds on the typing; voice after); tap ticks, photo, Done | M: "One form for every task." … "Pick the outcome. Say what you found. Tick the list. Photo. Done." | `§TASK_FORM type= builtin=true resolutions=<> checklist=<> materials=<>` equal to what the sheet shows (counts and texts, not pixels); typed text in the report equals the sheet's | NEEDS WO-31 |
| 8 | 14 | grid unchanged | the report is queued ("kept on the phone, sent when online" as shown by the app); the strip becomes "task 2 of `<m>`" with ITS path; at task 2 tap "Can't proceed", TYPE the reason (key sounds), confirm | tap Done→queue; tap "Can't proceed"; type reason; voice after Enter | F: "And if it can't be done?" · M: "Say so, with the reason." | `§TASK_REPORT task= outcome=done photos=<> queued=true` then `§TASK_REPORT task= outcome=cannot … queued=true`; `§MISSION_STEP n=2 of=<m>` after the first report; the reason typed = the reason in the queued report | READY |
| 9 | 16 | back at the office: the Request of task 1 now shows an Updates row (the text, time, material) and status `Reported`; the can't-proceed Request stays open with its reason; the office ticks Verify → task 1 `Verified` (closed); History rows for each move | phone: the mission summary "mission complete, `<n>` done, `<m>` can't proceed" | office: click Get from team / open the Request, click Verify; no key sound | F: "And back at the office?" · M: "Each report is an update on the request. It says Reported." · "Check it, and it says Verified." · "The one that couldn't be done stays open, with its reason." | WO-15 defines the apply log line (`TBD`); Updates row `Result` text = the text typed in scene 7; status cells; History row holds previous status; the phone summary counts equal the grid's | NEEDS WO-15 |
| 10 | 9 | the model: each task's element coloured done / open / can't proceed, per element | phone: the same mission summary held (nothing new claimed on the phone) | office: switch the model on; no key sound | M: "And the model shows it. Done, open, can't proceed." | WO-28 defines the colour log line (`TBD`); the colour of each task element read from the scene state, equal to its Request's status | NEEDS WO-28 |
| 11 | 6 | the Request grid shown twice, labelled A (scene 2's recorded frame, "Before") and B (now, "After") — real captures of the same grid, same crop | phone held on the summary | none | M: "Issued, walked, reported, and seen. One loop." | A is the scene-2 frame by its frame number in the manifest; B is the scene-9 grid; the pixel crop is equal (§5 guard "one subject, one set of numbers") | NEEDS WO-15 |
| 12 | 10 | last card (see §2) | (spans both) | none; silent | none | `§GUARD_CARDS … verdict=PASS`; `§FILM_GUIDE … http=200 anchor=Y`; every PR and verdict on the card read from logs | READY |

**Scene 5 wording rule (tag `NEEDS WO-6..9`).** The tag exists because the beat's claim ("the film, photoreal and schedule tools stay at the office, and the rest as the orders land") names groups by their gate. Gated and merged today (MOBILE_PERF.md): rule checks (WO-2), film + film sound (WO-4, #3513), 4D tools (WO-5, #3514); photoreal still = WO-6 IN PROGRESS; WO-7 (2D grid + section cut), WO-8 (civil + rule reports), WO-9 (import + export) OPEN. The spoken and on-screen list is built from the gates actually merged at recording time, one group named only if its `§W-PHONE-AXE group=<name> … verdict=PASS` exists. A reduced wording naming only film, 4D tools and rule checks is READY today; naming photoreal needs WO-6; naming the 2D grid, section cut, civil, rule reports, import or export needs WO-7..9. The shot is counted as `NEEDS WO-6..9` until the owner picks the wording.

**Variants of the scene 5 voice (pick at recording from what the numbers allow; each number from `§BOOT_WEIGHT`):**
- *Single "now" figure (default, always honest):* "The phone loads about `<N>` megabytes to open the model. The film, photoreal and schedule tools stay at the office."
- *Before / after (only if staging §4.6 holds):* "It used to load about `<N0>` megabytes. Now about `<N>`." — both from the same tool on the two commits. Never "three megabytes" and never "it is light now" without the number.
- Not allowed: "the phone never downloads these tools" (the phone's service worker still precaches the gated files in the background; WO-10, OPEN, only measures it); "the model opens faster" (see §4.6, FILM-M1's own table: the model appeared at the same time after the shader fix).

**Shots per tag (12 scenes):** READY 6 (1, 2, 3, 6, 8, 12) · NEEDS WO-26 1 (4) · NEEDS WO-6..9 1 (5) · NEEDS WO-31 1 (7) · NEEDS WO-15 2 (9, 11) · NEEDS WO-28 1 (10). Scene 12 is READY as a shell; its PR/verdict lines and guide link are filled from the logs at recording.

---

## 4. Staging list

1. **Building:** the Office sample, `HHS_Office_Federated_extracted` is the db that WO-25's witness judged ("the processor found real routes on the office sample": `§W-MISSION-PREPARE building=HHS_Office_Federated_extracted … inconclusive=0 verdict=PASS`), shown everywhere as "Office". **Not the Duplex:** its doors sit in no compiled room (0 of 15 routed; only straight lines). Not the Hospital (cannot be filmed on CPU; FILM-M1 finding 3). Public-sample status of the Office: FILM-M1 already showed it as "Office" (open question 3). The model file is named by path AND hash in the recording log (the two-Duplex-files lesson, REVIEW LOG: a different file gives a different room path).
2. **Project Order:** `TBD at recording — read from the product` (created in the Kernel ERP through the Find › ERP push on the Office model; its DocumentNo is read from the grid, not typed from this file). Pushed set kept small (a class Request is narrowed to the pushed set; the Find list pushes at most 50).
3. **Requests and tasks:** proposed shape, a film choice not a product value — one Request on a single element (product Value = that element's GUID) and one on a class of a few elements (product Value = the class, e.g. doors), so the processor returns a short mission; the real number of tasks `<m>` is whatever `§MISSION_PREPARE tasks=` prints (proposed: 3). How the Requests get created in the Request window is open question 1. Type = "Site Task", status category with New, Prepared, On site, Reported, Verified.
4. **Which task shows "can't proceed":** task 2 of the mission (so the path to the next task still shows afterwards, and the reason is typed on screen with key sounds). Task 1 is done in full through the form (scene 7). The remaining task(s) are not shown beyond "task 3 of `<m>`" if the count allows; no task is invented for the film.
5. **Request screen, before and after:** *Before* (scene 2): every Request `New`, Updates and History tabs empty. *After* (scenes 9, 11): task 1 `Verified`; the can't-proceed task open (status as the product sets it, `TBD`), its reason visible; an Updates row with the typed text and the time/material from the form; History rows for each status move; untouched Requests, if any, still New. Same crop, same columns, A / B labelled.
6. **The "lighter phone" figure (scene 5) and the honest before/after test.** Method reused from FILM-M1 (archive "§2026-11-27 LEVELS OF IMPROVEMENT"; rc4 captions): bytes come from the repo's own ratchet tool, `node scripts/boot_weight.js` (`§BOOT_WEIGHT eager_bytes= eager_MB= tags= lazy_bytes=`; after the gate its `eager_bytes` is the phone number and `desk_bytes` is what the desktop adds, MOBILE_PERF "DESIGN REVIEW" point 1). Time figures are only the FILM-M1 kind: measured in the Lighthouse-calibrated phone emulation (Moto G Power user agent, CPU 4x slower, network 1.6 Mbit/s (x 1024 x 1024) / 150 ms round trip) and captioned "measured on a phone profile", or *computed* (bytes x 8 / 1,677,722 bits per second, gzip sizes as GitHub Pages serves them) and captioned "computed".
   - **A before/after is supported only for bytes:** run the same tool on the page before any gate (`424473b0^`, the commit MOBILE_PERF.md WO-5 names as the pre-gate page; reuse an existing worktree, `git worktree list` first, never a second one) and on the recorded commit; the lane's own numbers are 9.78 MB at the start of the gating and 6.02 MB after WO-5, `TBD at recording — read from the product` for both. A "now" figure alone is the default.
   - **Not supported:** a before/after of "the model appears". FILM-M1's table recorded the model arriving at the same time before and after the shader fix (7.8 s then 7.7–8.2 s). A first-open time claim is allowed only as medians of repeated runs with the range, both sides produced the same way (PLAYBOOK C addendum: *"show medians of repeated runs with the range"*; before any comparison *"list the asymmetries … and remove each"*), else omitted. Default: omitted.
   - The target (3 MB or less) is never promised: MOBILE_PERF.md says *"After WO-9 the target is `§BOOT_WEIGHT eager_MB` ≤ 3.0; print the number, do not tune toward it."* Today 6.02 MB.
7. **Recording set-up:** headless, CPU only, never beside the owner's live tab (no GPU; if a GPU run were ever needed: `nvidia-smi` VRAM check + `flock /tmp/claude-1000/gpu.lock`); desktop 1920 x 1080 context for LEFT, phone context for RIGHT at 456 x 933 with the FILM-M1 Moto G Power profile; a freshly started browser profile with the service worker cleared so no stale cached script runs; the recording commit (bim-ootb sha) is named in the log and on the card. Camera feed: the viewer's own render, labelled "simulated camera" (FILM-M1 R2); steps labelled "simulated"; GPS not mentioned (headless gives none). The two screens are recorded in sequence and captioned so ("recorded in sequence"); never claimed live-linked (HOUSE STYLE point 1: *"never claimed to be live-linked"*).
8. **Reuse:** copy `scripts/film_phone_fast/` (R1 recorder pattern, `render_stage.js`, `assemble.sh`, `make_film.sh` with `FILM_TAG`, `guard_cards.js`, `witness_stage.js`) and `scripts/film_cli_in_action/` for the typed-line strip and key sounds; one stage with LEFT 16:9 desktop + RIGHT phone body (the FILM-M1 "two phones + desktop" beat is the layout precedent). The cover and last card via `cards_m1.js` pattern (the film-specific card builder), tested by the card guard.

---

## 5. Guard list for the recording session

*Derived from FILM-M1's corrections (archive: rc1 owner note, rc2 note, the six rc3 points, rc4 "Defects found and fixed on the way") and PLAYBOOK C addendum.*

**Before recording (all must be true, each logged):**
1. Every shot's tag is READY: grep this file's table for `NEEDS`; each WO it names is `✅ DONE` in MOBILE_PERF.md AND its PR is merged on bim-ootb `origin/main` (verify the merge, not the claim). If WO-26, WO-15 or WO-28 changes a feature this script describes, re-read the work order and edit the shot first.
2. The cover and last card follow §2 of this file and cite the rules; the card guard (`guard_cards.js` pattern: width/height, name table, order of evidence lines, each with a red control) is run and its verdict read.
3. One name table for the site ("Office" on the card and in captions); the building's own name on screen is checked: no private client, team or project name, no "HHS", no civil-works sample name (use "Civil Works" if ever needed); a still of the UI's building label is scanned for those strings.
4. The recording commit is a clean `origin/main` checkout in a `/tmp/wt-*` worktree (`git worktree list` first, reuse); `git rev-parse` printed; model file path + md5 printed; service worker cleared; page errors counted (target 0).
5. Staging §4 values are read from the product, none typed from this file; the Requests and the Project Order exist in the Kernel as the product creates them, not seeded by a test shortcut that the product does not offer (a witness fixture is not a film).
6. **Scene 5 numbers:** `§BOOT_WEIGHT` printed from the recorded commit; the phone page's own network log of script bytes at boot recorded in the same run and compared (scope-blind guard: a tool that counts static tags must agree with what the phone fetched). If they disagree, the shot is not used. The groups named in the voice each have a `§W-PHONE-AXE group=<name> … PASS` line.
7. Guide section for site missions exists and `§FILM_GUIDE url= http=200 anchor=Y`; otherwise the film is built but not posted, and the gap is reported.
8. Narration fit: every line DETAIL, none SHORT/SKIP (rc4: a 1.97 s line in a 1.36 s slot skipped its voice), every question rises where it should (`§NARR_TONE`), `§NARR_TONE … WRONG` = 0; keys-before-voice check K2 PASS (no voice over typing, key track audible).

**What makes a take INVALID (do not use it, re-record, report why in the log):**
- A beat whose evidence line is missing prints `ok=false` and is not in the film (FILM-M1 R1). Exit code is not evidence; read the log (CLAUDE.md Log Mandate).
- A shot that depended on a bug fixed while preparing: *"show the product AS SHIPPED; a bug found and fixed while preparing is NOT a story beat (it reads as staged)"* (PLAYBOOK C addendum). A step the recorder cannot do is a real bug: fix by spec + witness + PR, never a recorder workaround.
- Anything staged: a seeded status change, a hand-edited Updates row, a mission file made by hand instead of "Prepare site mission", a path drawn by the recorder, a colour set by the recorder.
- A claim made but never shown (FILM-M1 rc3 point 2: "offline" was claimed, never shown, so a real offline scene was added). Here: every phrase on the cards and in the voice must have a scene; "lighter" is claimed only with the scene 5 number on screen.
- A number on a card or in the voice that no `§` line gives (PLAYBOOK C pipeline: *"every digit on cards and in the voice is a fact"*); the 3 MB target stated as achieved; "never downloaded" for the gated groups; "faster to open" without the same-method before/after.
- A duplicate caption right after the chapter card (rc3 point 1); a chapter tag persisting through the film (PLAYBOOK C: none).
- Two names for one site, or the db name leaking through a caption or the card (rc3 point 5).
- Voice starting before the return key, or any typing without the real key sound (HOUSE STYLE point 2); synthesised key sounds.
- A dated prior-art read missing for any source on the last card (rc3 point 3: a source whose page returned no readable text was dropped).
- Guide link not 200 or anchor missing (rc3 point 4; `§FILM_GUIDE`).
- A screenshot offered as proof to the owner: the owner's eyes are never the test instrument (PRIMAL LAW point 1); the proof is the `§` lines and `§WITNESS_STAGE`-type numbers, a contact sheet only for layout.
- Logs written under the wrong cut's folder (rc4 "make_film.sh wrote its logs to logs/rc3": use `FILM_TAG`).
- The owner's live Alt+S/Alt+C bake running at the same time (GPU contention): recording is CPU-only and not started beside it.

---

## 6. Open questions for the owner (five at most)

1. How does a Project Order's Request get created in the product today (is there a Request button on the Project Order line, or is it created in the Request window by hand), so that scene 2 shows only what the product offers?
2. If WO-26 (delivery by role) is not built when the rest is, may scene 4 show the phone opening the mission from a link (real today, "opens a mission file from a link") with the voice saying "a link", or must the film wait for the delivery?
3. May the Office sample be shown publicly as "Office" (FILM-M1 already did)?
4. Is English only enough for this film, as for rc4?
5. Do the cover's kicker `SITE MISSIONS · CH 0`, title and sub-line (my wording) and the output name `Office_site_missions_EN_rc1.mp4` stand?

---

## Appendix — house rules applied, quoted with their headings

**A1. FILM_NARRATION.md ▶ HOUSE STYLE FOR ALL FUTURE FILMS (owner, 2026-11-14)** — points 1–2 and 4–5 (split screen, key sounds, cover, large changing part):
> 1. **Split screen, top and bottom:** the terminal strip above, each line TYPED character by character; the real application window below, captured on the data that line produced (never a drawing; never claimed to be live-linked). No long opening explanation: cover card, then the first line is typed.
> 2. **Real keyboard sounds on the typing** (real recorded presses, never synthesised … credited on the end card): the line is typed first with only the key sounds, the voice starts after the return key. Check **K2** (`k2.py`) must PASS: no voice over the typing, key track audible.
> 4. **The cover is the two-colour chapter card** … a red kicker `COMMAND LINE ERP  ·  CH <n>` (`#FF6B78`, letter-spaced) over a large white title and a grey sub-line … The end card is the LAST CARD rule below (prior art · costs · credentials).
> 5. **The lower frame shows the part that changes, large** … cropped to a named DOM region per step … Check **Z**: the cropped picture of each step differs from the step before by a measured share of pixels; a step that changes nothing says NO-OP in the log.
> 6. **The terminal strip keeps ONE large font for the whole film** … Check **T** …

**A2. FILM_NARRATION.md ▶ HOUSE STYLE — THE LAST CARD OF EVERY FILM (owner, 2026-11-16)** — quoted in §2 above. **A3. ▶ HOUSE STYLE — ALWAYS GIVE A GUIDE LINK (owner, 2026-11-18)** — quoted in §2 above.

**A4. FILM_NARRATION.md ▶ PLAYBOOK — "make a narrated / dialogue film"**: *"a LIVELY two-voice DIALOGUE (F asks/reacts, M explains), not a monologue readout. Every pause filled where the picture allows."* · Voices table: English = Kokoro v1.0 `film_narration_fit_kokoro_v3.py`, af_heart / am_michael, local CPU. · Step 3: *"Goal = 18/18 DETAIL, 0 WRONG."* · Step 5: *"Witness (numbers, not a listen): frames = source … `silencedetect=n=-40dB:d=4` gaps (longest ≤ ~7 s is the bar reached); `ebur128` I ≈ −16 LUFS."* · Step 1: *"Every number spoken must come from one [§ line] — PRIME rule."*

**A5. FILM_NARRATION.md ▶ PLAYBOOK C — the EXPLAINER layout** (screenplay shape: before/after first, show then prove, one real event at the end, roadmap labelled; dialogue rules: *"Say the honest limits in the voice … No jargon"*; chapter cards: *"each card is its OWN silent segment of 3.6 s … NO voice over the card … NO persistent chapter / series tags anywhere in the film"*; §4 Timing: *"cut each beat to its speech + 1–3 s"*; §5 Witness: *"frames = the silent picture's; silences ≥ 4 s ≤ ~7 s; ebur128 ≈ −16 LUFS"*).

**A6. PLAYBOOK C addendum — comparison / proof film**: *"show the product AS SHIPPED; a bug found and fixed while preparing is NOT a story beat"* · *"before any us-vs-them number, list the asymmetries … show medians of repeated runs with the range"* · *"Use more layman lingo"*.

**A7. MOBILE_PERF.md ▶ REVIEW LOG "FILM" (2026-11-28):** *"the film script is drafted meanwhile against `prompts/FILM_NARRATION.md` (house cover + last-card rules); no bake or recording without the owner's go."* · **Archive "FILM-M1 rc2 note":** *"Lesson: the house cover and last-card rules in FILM_NARRATION.md apply to EVERY film brief."*

**A8. Standing rules for films on this project (as given in the brief; memory index entries: "Films are never pushed to GitHub, only their scripts", "ALL future films: split screen + REAL key sounds, voice after return key", "Deliverable names: Building_segment_BEFORE/AFTER, no jargon", "No 'JELAPANG' in user-facing output — say 'Civil Works'", "PRIVATE client sets vs PUBLIC repos"):** applied in §1 (output name, never pushed), §3 (key sounds, voice after return), §4 and §5 (no private names, "Civil Works"), and the product-truth rule (every on-screen claim real at recording time, nothing staged).

**A9. CLAUDE.md PRIMAL LAW (witness replaces every human visual check) and FUNDAMENTAL LAW:** *"The user's eyes are never the test instrument."* · proof is `§`-tagged values read programmatically; a contact sheet is for layout only.
