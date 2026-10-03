# ⚠ DO NOT REMOVE — FILM NARRATION (voice-over for the baked Alt+C films)
SCOPE: plan, then (only after red1 approves the plan) build, a spoken narration track for the films that
`cli_silent_bake.js` bakes (Alt+C). Every spoken word traces to a `§` line the bake already logs. No invented
numbers, no invented claims. Spec before code; a witness proves the track, not a listen-through.
**Read the page log after every run** — exit code is not evidence. Honour this block until the lane is DONE.
**→ Making another narrated/dialogue film (any language)? Jump to `## ▶ PLAYBOOK` below — voices, steps, commands, pitfalls.**

## 0. THE ASK (red1, 2026-10-03 — original words kept verbatim, then what it means here)
> *"I am creating a narrated movie from a baked BIM construction model. I have raw construction logs detailing
> what appears on screen at specific timestamps. Before we write any code or call any external APIs, I want you
> to act as my video producer and automation engineer. Please explain your exact step-by-step approach for doing
> the following: 1. Log Analysis: How will you parse my raw BIM logs and map them to film timestamps?
> 2. Script Drafting: What template or format will you use to turn technical logs into professional, spoken
> narration? 3. Audio Automation Plan: How do you plan to automate the creation of the final audio files (e.g.,
> using Python, ElevenLabs, or OpenAI TTS)? Do not execute any code or create files yet. Just provide your
> structural strategy and a brief layout of how you will organize the script so I can review your logic."*

**Intent, in this project's terms:**
- **Goal:** a narrated version of the baked Alt+C films — a **professional, documentary-style voice-over** that tells
  the viewer what they are seeing (the building, its size, how it goes up, the clashes found), in sync with the picture.
- **Input:** the bake's page log ("raw construction logs") — it already says what is on screen and when.
- **Audio:** red1 named **ElevenLabs or OpenAI TTS** (Python or similar) as the expected route. That is the default
  path to plan for, not something to argue against (see §2 for the one note to raise).
- **This step = strategy only, kept brief:** a step-by-step approach for the 3 questions + a short layout of the
  script, for red1 to review. No code, no audio, no API keys, no network calls.

### 0.1 What red1 actually needs (red1, 2026-10-03, follow-up — the core of this lane)
> *"It is AI assisted as the narrative is under my direction … the baked movie ie for Hospital buildup and its
> overlays where i want a voice over to say what each item is about and it has to miss a few in such a way the whole
> narration is balanced, well timed and i cannot do that easily without such assistance. As i have to go to and fro
> marking which part of the film does not allow enough time to say a certain point and have to skip to the right
> ones, and where my script is leaving any gaps as to the features been showcased."*

So the hard part is **not the voice — it is FITTING the script to the film.** red1 writes the points (the narrative
is theirs). The lane builds a **fitter** that does the to-and-fro for them:
- **Film timeline:** every showcased item (each overlay/caption/beat/build-up phase) with its on-screen window
  [start s, end s], read from the bake's page log.
- **red1's script:** one point per item (text + priority). Speaking time = words ÷ a fixed rate.
- **Fitter output (one reviewable table):** ✔ placed (item, start, end, slack) · ✂ skipped — no room in that window
  (by how many seconds) · ⚠ **gap** — item shown on screen with no script line · ✖ orphan — script line for something
  the film never shows. Balance rule: no long silence and no back-to-back crowding (thresholds written in §PLAN).
- **Deterministic arithmetic, no AI needed for the fitting.** red1 edits the script, re-runs, reads the table again.
  AI is only optional help: wording suggestions red1 accepts or not, and the TTS voice.
- **Test film:** `~/Downloads/Hospital_silent_full_AFTER_1920x1080_24fps_2026-10-03_0049.mp4` (206.8 s, 4,963 frames,
  build-up ON) with its page log `/tmp/bake_Hospital_silent_2026-10-03_0049.log` (27 MB; carries §CINEMA_BEATS,
  §FLYTHRU_CUE_PLACE, §FLYTHRU_DIM_DRAW, §STOREY_REVEAL_WINDOW, §CLASH_LABELS, §MEASURE_BUILDING_CARD, §GANTT,
  §NIGHT_BUILDUP_GATE). ⚠ `/tmp` is wiped on reboot — copy the log next to the film before relying on it.
  Several §CINEMA_BEATS lines appear (dur=60/15/195.8/278.8 s): the plan must say which one the film used, from the log.

**Own-voice route (red1, 2026-10-03: *"I can also use my voice where u just prepared the script with timeline
prompters"*):** a first-class option, not a fallback. The fitter's placed lines become a **prompter**: the film plays
silent, each line shows on screen at its start second with a countdown and a bar for its time budget, red1 records
over it in one pass. Outputs: a subtitle-style cue file (e.g. .srt/.vtt — the same rows as the fitter table) and a
prompter view that plays it over the mp4. No AI anywhere in this route.
**Splice step (red1: *"and then help splice it more accurately in"*):** a live read never lands exactly on time.
After recording, the tool finds where each spoken line really starts and ends (silence gaps — e.g. ffmpeg
`silencedetect`, plain signal maths), matches them to the fitter rows in order, cuts the take into one clip per line,
and places each clip at its fitted start second. It reports each line's drift (spoken vs planned, in seconds), any
clip that runs past its window, and any line it could not match — so red1 re-records just that line, not the whole
take. Then the clips are mixed into one track and muxed onto the film (video stream copied, not re-encoded).

**On "No AI inside" (red1 asked if it is a thin line):** the tagline is about the shipped product, which has no AI.
A film whose story is red1's, whose facts come from the log, and whose timing is plain arithmetic does not break it.
The only AI is the voice, and only if TTS is chosen over red1's own voice. A short credit line ("Script: red1 · Voice: synthetic") removes any doubt — red1's call.

**Deliverable of the first session: that plan, appended to this file as §PLAN** (project rule: findings go in the
prompts file, not chat-only). Brief — a reviewable strategy, not a design doc. red1 reviews before anything is built.

## 1. FACTS ALREADY IN HAND (extracted 2026-10-03; re-check before relying on them)
- Films: `~/Downloads/<Building>_silent_full_*_AFTER_1920x1080_24fps_<date>.mp4`. They are silent. They are
  made by `bim-ootb` `cli_silent_bake.js` (branch `fix/fast-bake`), which writes a page log (`--log <file>`).
  Examples: Alt+C session scratchpad `c/HHS_full_page_2026-10-03_0806.log`, `c/LTU_full_page_2026-10-03_0549.log`,
  plus `c/LTU_full_2026-10-03_0549_poses.json` (one row per frame: `[i, cam xyz, target xyz, ms]`).
  Owner of the film lane: `prompts/ALTC_FOUNDATION.md`. Read its §1 before touching a bake.
- **Frame → time:** `§MAXQ_FRAME i=<n>/<N>` and `§FRAME_QA i=<n>` name the frame; film second = i / fps
  (fps from the bake flags, e.g. `--fps 24`). Wall-clock prefixes on the log lines are bake time, NOT film time.
- **Planned on-screen windows are already logged once at setup, in film seconds or fractions:**
  - `§CINEMA_BEATS dive=… out=… rise=… (dur=60.0s) …` — beat starts as fractions of the film duration.
  - `§FLYTHRU_DIM_DRAW … windows=[envelope:0.0-2.2 storey:2.7-4.9 room:14.3-16.5 corridor:42.3-44.5]`.
  - `§FLYTHRU_CUE_PLACE envelope at=0.00s … "Building Envelope — 82.35 × 59.89 × 11.11 m · Ground 4,503 m²"`
    (the on-screen caption text itself).
  - `§STOREY_REVEAL_WINDOW … realWindowSec=14.40 …`.
  - `§MEASURE_BUILDING_CARD vol=97487.5m3 footprint=4931.5m2 height=19.77m`.
  - `§SUN_COMPASS built lat=… lon=… (src=ifc_site)`.
  - `§CLASH_LABELS frame=<n> … enter=[…]` (per-frame: which clash labels appear).
- **The construction story is also logged** (red1's ask is a *construction* film — narrate the build-up, not only
  the fly-through captions). HHS 0806 log, at setup: `§GANTT band <k> z=[a,b] <n> elements: Superstructure:…,
  Architecture Envelope:…, MEP Rough-in:…, MEP Final:…` (what goes up, storey by storey, by trade) and
  `§GANTT storey-bands: … "Level 1" … "Roof Level"`; per-frame `§NIGHT_BUILDUP_GATE total=<N> placed=<n>` (how much
  is built at that frame). Not every film shows the build-up (HHS 2026-10-03 was baked "no-buildup", per
  `ALTC_FOUNDATION.md`) — the plan must check which film does before using these tags.
- **Existing pacing rule for cues** (`viewer/cpe_flythru_cues.js`, spec `MEP_CLASH_REVEAL_MOVIE.md §14`): one cue on
  screen at a time, fade in 0.6 s + hold 1.0 s + fade out 0.6 s, then a 0.5 s gap. A cue's second is derived from the
  real camera path, never hard-coded. Narration must follow the same timeline and never talk over a cue it doesn't describe.
- The viewer tour already has a 0.5x "narration pacing" speed (`viewer/tour.js` §TOUR_TIMELINE_SCRUB). That is a
  different feature (live tour, not the baked film); note it, don't merge it in.

## 2. CONSTRAINTS THE PLAN MUST RESPECT
- **PRIME RULE:** each spoken sentence is a template filled ONLY from named `§` fields of that film's log. If a
  value is not in the log, the sentence is dropped, not guessed. Numbers are rounded by one fixed rule, written down
  in the plan (e.g. metres to 1 decimal, areas to whole m²).
- **Deterministic:** same log in → same script out, byte for byte. The script is a reviewable text file (one row
  per line: start sec, end sec, source `§` tag + field, text) before any audio is made.
- **Voice = red1's named route (ElevenLabs / OpenAI TTS).** Plan for it. Raise ONE note, as an open question,
  not a blocker: the product film carries the 'No AI inside' tagline (`prompts/NO_AI_INSIDE_WITNESS.md` — the
  guarantee is about the shipped runtime, not the film's voice), so ask red1 whether a neural voice needs a
  disclosure line. Alternatives (human reading the script, local TTS) get one line each, no more.
- **Professional, not a log readout:** lines read like a documentary voice-over ("The ground floor goes up first —
  543 structural members, then the envelope."), but every number and name in them still comes from the log.
- **Data leaving the machine:** a cloud TTS call sends the script text out (building names, sizes). Say so in the plan.
- **The film is not re-baked for audio.** Audio is muxed onto the delivered mp4 (e.g. ffmpeg, video stream copied,
  not re-encoded). A re-bake costs ~3 h of GPU and belongs to Alt+C.
- **GPU:** this lane needs none. Never take `/tmp/claude-1000/gpu.lock`.

## 3. WHAT THE PLAN MUST CONTAIN (§PLAN, appended below by the next session)
0. **Keep it brief** — red1 asked for a strategy + a short script layout to review, not a full design.
1. **Event table:** which `§` tags are narration sources (fly-through captions AND the construction sequence) —
   this is the fitter's film timeline (§0.1), which field gives the time, which gives the words. Separate
   setup-time plans (window lines) from per-frame facts (`§CLASH_LABELS`). Say which tags are missing for something
   the film shows (e.g. a beat with no logged caption): that is a gap to log, not to guess.
2. **Script format:** red1's input layout (item id, priority, text) + the fitter's output table (§0.1: placed /
   skipped / gap / orphan), with a worked example on the Hospital 0049 log. Template sentences only as optional
   starters for red1 to rewrite.
3. **Timing rules:** speech starts at a cue's fade-in, must end before the next cue's window; a speaking-rate
   budget (words per second) that decides whether a line fits, and what happens when it doesn't (shorten by a
   rule, or drop).
4. **Audio path:** red1's own voice via the prompter (§0.1) vs ElevenLabs vs OpenAI TTS (cost per minute of film, voice quality, data sent out), how the
   per-line clips are generated and placed on the timeline, then mux + loudness target. Alternatives: one line each.
5. **Witness design (before code):** e.g. `witness_film_narration.js` — every script number matches its source `§`
   value; no two clips overlap; each clip starts within a stated tolerance of its window; total audio ≤ film length;
   prints INCONCLUSIVE when the log has no narration sources (vacuous), never PASS.
6. **Open questions for red1** — one line each.


## ▶ PLAYBOOK — "make a narrated / dialogue film" (read this first; written 2026-10-03 after 7 films shipped)
**What red1 likes (settled, don't re-ask):** a LIVELY two-voice DIALOGUE (F asks/reacts, M explains), not a monologue
readout. Every pause filled where the picture allows. Questions must sound like questions (measured, §NARR_TONE).
Subtitles burned in **in the audio's own language** (red1: Thai→Thai, French→French, Spanish→Spanish; English
captions over native audio were tried and DROPPED). Original silent film is never touched; every output a new name.
Delivered so far (Hospital 0049, `~/Downloads/Hospital_narrated_dialogue_{v3,MALAY,THAI,FRENCH,SPANISH}_AFTER_…mp4`).

**Voices (decided):**
| Lang | Engine | F / M | Where it runs | Pitch fix |
|---|---|---|---|---|
| English | Kokoro v1.0 (`film_narration_fit_kokoro_v3.py`) | af_heart / am_michael | local CPU, deterministic | PSOLA rise on yes/no Qs |
| Malay | Edge TTS (`film_narration_fit_edge.py … ms`) | ms-MY Yasmin / Osman | Microsoft cloud | rise only if voice doesn't |
| Thai | Edge (`… th`) | th-TH Premwadee / Niwat | cloud | NONE (tonal language) |
| French | Edge (`… fr`) | fr-FR Denise / Henri | cloud | rise only if voice doesn't |
| Spanish | Edge (`… es`) | es-ES Elvira / Álvaro | cloud | rise only if voice doesn't |
| Mandarin | Edge (`… zh`) | zh-CN Xiaoxiao / Yunxi | cloud | NONE (tonal) · font Noto Sans CJK SC |
| Cantonese | Edge (`… yue`) | zh-HK HiuMaan / WanLung | cloud | NONE (tonal) · Traditional script, Noto Sans CJK HK |
| German | Edge (`… de`) | de-DE Katja / Conrad | cloud | rise only if voice doesn't |
| Arabic | Edge (`… ar`) | ar-SA Zariyah / Hamed | cloud | NONE · RTL subtitles (libass built with fribidi + harfbuzz) |
| Japanese | Edge (`… ja`) | ja-JP Nanami / Keita | cloud | NONE (pitch accent) · Noto Sans CJK JP |
New language: add a `CFG` entry in `film_narration_fit_edge.py` (voices via `edge-tts --list-voices`, wh-word regex,
`pitch=False` if tonal, font with the script's glyphs — `fc-list :lang=xx`, credit line in that language).
⚠ Edge = script text sent to Microsoft (unofficial, no SLA); clips cached by (text,voice,rate) in
`~/.local/share/film_narration/cache_edge/` so re-runs make no calls. Kokoro has no Malay/Thai (Piper: id_ID only).

**Steps (all CPU; never take the GPU lock; never re-bake the film):**
1. **Facts** — from the bake's page log (copy beside the film, e.g. `~/Downloads/…_page.log`): grep the `§` tags in §1/§4
   (`§FLYTHRU_CUE_PLACE`, `§CPE_DAY_COUNTER`, `§CPE_BUILDUP`, `§MEASURE_BOX*`, `§RULE_FILM*`, `§EGRESS`,
   `§CLASH_NARROWPHASE`, `§CLASH_HUD_HIGHLIGHT frame=` (÷24 fps = film second), `§COST_ODOMETER_FINAL`,
   `§MEASURE_BUILDING_CARD`, `§GEOREF_SITE`). Every number spoken must come from one — PRIME rule.
2. **Script** — TSV, one row per beat: `id  cue_s  end_s  §source  SHORT  DETAIL`; turns as `F: … | M: …`. Numbers
   spelled out in words. Template = `film_narration_hospital_0049_dialogue_v3.tsv` (English); translations keep the
   SAME ids/cues/sources/turn count (`…_ms/_th/_fr/_es.tsv`). Punctuation drives prosody: `?` question, `!` excited,
   `...` hesitation beat.
3. **Fit** — in a scratch dir: `cp prompts/film_narration_ass_head.txt ass_head.txt`, then
   `FILM_SEC=<ffprobe duration> ~/.local/share/film_narration/venv/bin/python prompts/film_narration_fit_edge.py <script.tsv> <tag> <lang>`
   (English: `film_narration_fit_kokoro_v3.py <script.tsv> <tag> 1.15`). Writes `<tag>_*.wav`, `<tag>.ass`, `<tag>_plan.tsv`.
   **Read the log:** `§NARR_FIT … -> DETAIL|DETAIL xN|SHORT|SKIP … detailDur=` and `§NARR_TONE … OK|WRONG`.
   Goal = 18/18 DETAIL, 0 WRONG. A row that falls to SHORT: compare `detailDur` to `room`, trim words (allowed ≤10 %
   speed-up does the rest), re-run (cached clips make it seconds). **Expect Malay/French/Spanish ~30–40 % longer
   than English** — trim open/loadpath/parade/reveal/value first; "the same"/"sama"/"pareil"/"igual" for repeated numbers.
4. **Mux** — same dir: `FILM_SEC=… python3 prompts/film_narration_mux.py <tag> <silent.mp4> <new_out.mp4>`
   (adelay each clip to its cue, amix, loudnorm −16 LUFS, subtitles burned, x264 crf 17; refuses to overwrite).
   ~3–5 min per film; several can run in parallel.
5. **Witness** (numbers, not a listen): frames = source (`ffprobe -count_frames`, 4,963 for Hospital 0049);
   `silencedetect=n=-40dB:d=4` gaps (longest ≤ ~7 s is the bar reached); `ebur128` I ≈ −16 LUFS; mux log font line
   (`fontselect` must pick the script's font, e.g. Noto Sans Thai). Log a dated §4 entry; commit + push the TSVs/logs.
**Tools on disk (survive reboot):** `~/.local/share/film_narration/venv` (kokoro-onnx, piper-tts, faster-whisper,
edge-tts, praat-parselmouth); `kokoro/` models; `cache_edge/`. Scratch clips/plans are lost on reboot — re-run step 3.
**Still open:** confirm "Boston" (IFC site = likely Revit default location); a native Thai listener for question tone.

## ▶ PLAYBOOK B — red1's POLYGLOT TRAILER style (settled 2026-10-03; v1 + v3 kept as POC)
**What it is:** one film that is three things at once — *multilingual demo, setup/feature trailer, advert*
(red1: "a show killing 3 birds at once"). Reference: `~/Downloads/ERP_Polyglot_9languages_v3_…mp4` (v1 kept for contrast).
**Rules (red1's corrections, in order — don't re-ask):**
1. **One continuous take.** The app is driven live by a headless recorder; no cuts, no splicing ("all played out in the
   same film clip"). Language switches happen ON SCREEN (in-app picker, ~0.1 s), data carries straight through.
2. **Open with a greeting round:** Hi · Bonjour · ¡Hola! ¿Cómo está? · Guten Tag · السلام عليكم · 你好 · こんにちは · Apa khabar? ·
   สวัสดี — voices alternating F/M, the login/landing screen re-rendering in each language (Arabic RTL), ~2 s each.
3. **Slices of ~10 s, languages rotate** en→fr→es→de→ar→zh→ja→ms→th→en… ("rotate when we run out").
4. **No language announcements** ("need not reintroduce each other's languages, just intersperse without formality").
   Each stretch of speech is simply in the slice's language; the story is ONE flow across languages.
5. **Narrate the step on screen**, as one coordinated flow ("naturally cover each coordinated step as if a single flow").
6. **Fill the silence:** measure `§POLY_DUR` per slice vs its room, top lines up to ~85–100 % of the slice; target
   silencedetect (−40 dB, ≥ 2 s) ≈ 0 gaps (v3: one 2.2 s gap in 180 s).
7. **Advert register, factual:** short confident lines ("Nothing to install", "Un seul écran suffit…", "马上试试吧！"),
   every number/claim traced to a `§` line or a documented guarantee, written into the TSV's source column.
8. **≈ 3 minutes.** Subtitles in each line's language, font per script (driver handles it).
**Pipeline:** recorder (`scripts/film_erp_polyglot.js` pattern: `BEAT_MIN` per beat, language-proof selectors, `ERP_REPO`
to film a worktree) → dialogue TSV `id lang source SHORT DETAIL` → `prompts/film_narration_poly.py … measure` (durations) →
re-record with BEAT_MIN → `film_narration_poly.py <tsv> <erp_film.log> <dir> <dur>` → `film_narration_mux.py poly …`.
**The recorder doubles as a tester:** a step it cannot do is a real bug (FS-19 toggle/Save was found this way) — fix by
spec + witness + PR, not by a recorder workaround.

## 5. §ERP-FILM — a narrated walkthrough of the ERP guide, recorded by a headless browser (spec 2026-10-03)
**Ask (red1):** "Can AI also do a simulation movie of the ERP side? step by step as in the guide … I would have to do
it manually, calling up the URL, click on.." → "proceed, first part about a minute or so to see how it turns out."
**Source of truth:** `docs/ERP_FirstSetup.md` (the guide) and its witness `bim-ootb/erp/tests/poc_erp_first_setup_live.js`
(W-ERP-FIRST-SETUP, steps S01..S26, spec `prompts/ERP_FIRST_SETUP_GUIDE.md §FS1`). The witness is NOT edited; the film
script copies its selectors and SQL oracles.
**Recorder:** `scripts/film_erp_first_setup.js` (bim-compiler; serves `~/bim-ootb` read-only, Playwright from
`bim-ootb/tests/node_modules`, `--disable-gpu`, CPU only). Human pace: visible cursor (injected overlay) that glides
to each target, typed text at ~12 chars/s, a hold on each result. Frames by CDP screencast (JPEG q90, 1920×1080,
timestamped) → constant 24 fps mp4 via ffmpeg concat — not Playwright's recordVideo (1 Mbit/s VP8 blurs text).
**Log:** `§ERP_FILM_BEAT id=<beat> t=<film s>` at the start of each beat (the narration cue), `§ERP_FILM_FACT k=v`
for every number the voices say (SQL on the live in-browser DB, same oracles as the witness), `§ERP_FILM_DONE
frames= dur=`. Page console lines kept in a page log (§-lines are primary evidence).
**Part 1 (≈1 min) = S01–S07:** cold load (data-file MiB) → login System/System/role → menu → Initial Tenant Setup →
type name + admin, pick MYR → Create → facts (client id, accounts, 12 periods, 42 doc types, currency carried) →
Enter → the new company's login shows its admin user. Then the ▶ PLAYBOOK steps 2–5 (dialogue script → Kokoro fit →
mux, English first). Witness: every spoken number has a §ERP_FILM_FACT; beats in order; film frames = concat output.

## 6. §ERP-POLYGLOT — one 3+ minute ERP film that walks the guide while switching language (spec 2026-10-03)
**Ask (red1):** "a full 3 mins or even beyond (once u clear the path with fixes) but demonstrative of its multi lingual
capability.. even switching the UI to respective locales.. start with English, then French, Spanish, German, Arabic,
Mandarin, Japanese, Malay, Thai, space out each line or so, so the viewers quickly catch the drift. UI reflects each
locale. If not in, set them up first."
**Measured 2026-10-03 (bim-ootb 5f82edfd):** the ERP has NO UI locale support — `ad_seed.db` has no `AD_Language`, no
`AD_Menu_Trl`/`AD_Window_Trl`/`AD_Field_Trl`/`AD_Element_Trl`; only some data `_Trl` tables (e.g. `C_DocType_Trl`
es_CO:51). `idempiere.html` is `lang="en"`. Local iDempiere (docker `idempiere`) has only es_CO loaded (AD_Menu_Trl 826).
**Pre-req (handed to an Opus agent):** UI locales en_US, fr_FR, es_ES, de_DE, ar (RTL), zh_CN, ja_JP, ms_MY, th_TH —
language picked at login like iDempiere (AD_Language), menu/window/tab/field/process/ref-list/message translations
from iDempiere language packs (extracted; source named per locale), chrome strings (toolbar, login, status) via
AD_Message_Trl. Witness by value per locale (translated-label counts, `dir=rtl` for Arabic).
**ONE CONTINUOUS TAKE (red1: "all played out in the same film clip, not going back and splice together").** One
recording session, no cuts, no splicing: each language switch happens live on screen (in-app language switcher in the
header, or log out → log in choosing the language), and the journey's data carries straight through.
**INTRO — a greeting round before the journey** (red1: "make the first intro as a series of greetings, Hi, Bonjour,
Cómo está.. before beginning"): on the login screen, one greeting per language in red1's order, voices alternating F/M,
the LOGIN SCREEN itself re-rendering in that language on each greeting (red1: "the login screen reflects so
respectively"; Arabic flips RTL) (≈1.5–2 s each, ≈15–18 s total), subtitle = the greeting. Then the
journey starts in English. Greetings: Hi! · Bonjour ! · ¡Hola! ¿Cómo está? · Guten Tag! · السلام عليكم (As-salamu alaykum) · 你好！ · こんにちは！ ·
Apa khabar? · สวัสดีค่ะ/ครับ (Thai particle matches the speaker).
**Film design:** the guide journey (part 1 → part 2 → part 3 once the gap agent lands address/price/posting) cut into
**~10 s slices** (red1, 2026-10-03: "make the slices shorter, 10 secs"), languages in red1's order and CYCLING
(9 languages × ~2 rounds ≈ 18+ slices for 3+ min). One or two dialogue lines per slice; the UI switch must take
~1–2 s of the slice, so the in-app header switcher (not a relogin) is the method of choice. Each segment: log in again choosing that language (the switch
is ON SCREEN) → do the next guide step(s) → the F/M pair speak that language, subtitles in it (Arabic RTL). Voices:
Edge en (Kokoro for English), fr-FR Denise/Henri, es-ES Elvira/Álvaro, de-DE Katja/Conrad, ar Zariyah/Hamed (or
ar-AE), zh-CN Xiaoxiao/Yunxi, ja-JP Nanami/Keita, ms-MY Yasmin/Osman, th-TH Premwadee/Niwat. Fitter per segment by
language (CFG entries exist for ms/th/fr/es/zh/yue; add de/ar/ja). Recorder: new PART=poly in
`scripts/film_erp_first_setup.js` with a `LANG_PLAN` of (segment → login language → guide steps).
**PRE-REQ DONE → `prompts/ERP_UI_LOCALES.md`** (bim-ootb PR #1827, W-ERP-I18N 9/9 PASS). Switch method = **IN PLACE, no
relogin** (session, open windows, current record, grid/form mode kept). Selectors for the recorder: login card
`page.selectOption('#idmp-login-lang', code)` (greeting round — re-renders the card before login, carries into the
session); in session `page.selectOption('#idmp-lang', code)`; or `page.evaluate(c => ErpI18n.set(c), code)` (resolves
`{lang,dir,ms}`). Codes: `en_US fr_FR es_ES de_DE ar zh_CN ja_JP ms_MY th_TH`. Measured `§I18N ms=` 7–22 ms (login),
74–99 ms (session, 2 windows) — wait on the console line `§I18N lang=<code> ` before the next action; call
`ErpI18n.preload()` once after load so no switch waits on a fetch. `?lang=<code>` sets the start language.

## 7. §ERP-TECH-TRAILER — second polyglot trailer: the technology (spec 2026-10-03)
**Ask (red1):** "another similar style: a. 9 lingo intro, b. this time explain about the technology that in the system
monitor etc why it no longer needs certain layers, how iDempiere is chosen to be the model for this local first
framework, how key features are still there [= the AD, the Application Dictionary], advanced ops such as timeline,
integration between the Project Order (Hospital sample) with the Viewer (Hospital) similar element set, that part ending
in English as we haven't got the Viewer fully updated its translation. And it stops there. … those 9 lingo switch in same
manner. Make the movie also 3 mins long."
**Style:** PLAYBOOK B, all rules. **Arc:** greeting round → System Monitor (what runs where: in-browser DB, op-log,
service worker — the layers that are gone) → iDempiere as the model (the AD: windows/tabs/fields/callouts/val rules/
processes rendered from AD tables — counts from the live DB) → AD features at work on screen (DocAction buttons, the Graphics tab — red1: "the DocAction.. Graphics tab") → timeline (advanced ops)
→ Hospital Project Order → jump to the Viewer, Hospital, same element set (counts matched by § lines) → ENDS IN ENGLISH
in the Viewer (its translation is incomplete) and stops there. ≈ 180 s. Every claim traced to a § line or a doc quote
(file:line) in the TSV source column.

## 8. §VIEWER-TRAILER — polyglot trailer for the BIM Viewer (DRAFT script, 2026-10-03, not recorded)
**Ask (red1, 2026-10-03):** "think of a good trailer script for the Viewer and also the Modeller". PLAYBOOK B, ≈180 s,
one take. **Gate:** needs the Viewer UI translated (S226 §R2, Fable agent running 2026-10-03) — the language is picked
on the landing page and must carry through; record only after its `§TRL_LEAK` is low on these screens. Needs the GPU
(software GL measured unusable for the Viewer, `§FPS_MODE mean=21783`) → red1's go + `flock gpu.lock`.
Every number below is a DOC QUOTE today (source given); the recorder's own `§` lines replace them at record time.
| # | beat (on screen) | line idea | source |
|---|---|---|---|
| 0 | landing page, flag picker re-renders 9× (ar RTL) | greeting round | PLAYBOOK B |
| 1 | front door → Buildings & IFC hub | "Zero install. Any browser, desktop or mobile." | BIMUserGuide.md:11 |
| 2 | open Hospital card, stream-in | "Download once — the next visit is instant." | BIMUserGuide.md:11-12 |
| 3 | click a wall → Info panel | "Any element: its class, GUID, storey, discipline, material." | BIMUserGuide.md:38 |
| 4 | storey filter, discipline toggle, X-Ray cycle | "Isolate a floor. See through the walls." | BIMUserGuide.md:131-137 |
| 5 | Find → IfcWall | "Ask for walls — get every wall." (count from the run's § line) | recorder § |
| 6 | Section cut + Measure two taps | "Cut through floors. Two taps, a distance in metres." | BIMUserGuide.md:135-136 |
| 7 | Clash Matrix grid | "Clashes by discipline pair — review, resolve, accept." | BIMUserGuide.md:347-348 |
| 8 | Time Machine plays | "The schedule is built from the model itself: nothing appears before what holds it up — 0 violations in 266,954 elements, seven buildings." | BIMUserGuide.md:356-358 |
| 9 | 4D/5D dashboard; switch language → currency + rate book change with it | "Change the language, the cost speaks your currency." | S226 §Current Status (locale = language + currency + rates) |
| 2b | drop own `.ifc` on the hub; same building again → Merge / New prompt | "Your own IFC, parsed right here in the browser. Same building again? Merge the disciplines." | BIMUserGuide.md:26-31 |
| 6b | Night (N) + Shadow & Ground | "Day or night, it is the same model." | BIMUserGuide.md:691-701 |
| 8b | Time Machine What-if slip, then ⏪ Pull Back | "Slip a task, see the knock-on. Pull it back as early as it can go." | BIMUserGuide.md:351, 366 |
| 8c | Fly Tour, scrub bar back and forth | "A guided flight — scrub anywhere, the camera never drifts." | BIMUserGuide.md:119-123 |
| 9b | Share pill (/) preview card with the deep link | "Share the exact view — one link, camera and all." | BIMUserGuide.md:141, 739-744 |
| 10 | Film-Maker Alt+C derives a flight — CLOSING beat | "It even makes its own film — from the building's room graph, recorded in the browser." | BIMUserGuide.md:125-127 |
Length: ≈ 4–5 min allowed (red1, 2026-10-03: "u may extend more mins where comfortable") — beats 2b/6b/8b/8c/9b added.
City-mode aerial beat DROPPED (red1, 2026-10-03: "Drop the City aerial for now") — Film-Maker closes.
Open: the hook beat 9 depends on the 4D/5D page also following the language (in S226 §R2 scope).

## 9. §MODELLER-TRAILER — polyglot trailer for the Modeller (DRAFT script, 2026-10-03, not recorded)
PLAYBOOK B, ≈ 4–5 min (red1 allowed longer), one take. **Gate:** the Modeller has NO language switch (no `locale_loader`/`_TRL` in `modeller/`,
measured on bim-ootb main 2026-10-03) → PLAYBOOK B rule 1 (switch ON SCREEN) can't be met. Either voices rotate over an
English UI (a stated exception), or Modeller i18n is built first. ⛔ red1 to choose. Desktop + GPU, same rule as §8.
| # | beat | line idea | source |
|---|---|---|---|
| 0 | greeting round | — | PLAYBOOK B |
| 1 | 📂 Open a real building's ARC | "Don't draw from a blank grid. Open a real building and edit that." | ModellerGuide.md:22-24 |
| 2 | op-log visible beside the 3D | "Every action is one signed operation. The 3D is the log, folded." | ModellerGuide.md:5-7 |
| 3 | Insert from catalog, Sketch→Extrude wall | "Drop a part. Draw a wall." | ModellerGuide.md §Assemble & draw |
| 4 | Cut an opening, Route→Sweep a duct | "Open a wall. Run a duct." | same |
| 5 | Move / Rotate / Grid-Stretch / Room Move | "Move a whole room — the walls follow." | ModellerGuide.md §Transform |
| 6 | Walk ELEC, X-ray reveal | "Missing a trade? Walk it — 270 fixtures across six storeys, at spacing measured from real buildings." | ModellerGuide.md:567-569 |
| 7 | clash residual shown | "The right standard: Duplex clashes 32 → 2. Castle 501 → 3. None hidden." | ModellerGuide.md:641-646 |
| 8 | drag the history slider back and forth | "Drag back to undo, forward to redo — exact, every time." | ModellerGuide.md:722-726 |
| 9 | Save / BCF export | "Save it, share an issue as BCF." | ModellerGuide.md §Save, §BCF |
| 1b | 📂 Open → FROM IFC with your own file | "Or bring your own .ifc." | ModellerGuide.md:94-99 |
| 2b | zoom on a Duplex party wall, layer list | "A wall is what it's made of — seven real layers, from the file." | ModellerGuide.md:164-168 |
| 2c | windows as glass | "Glass is glass — its real transparency, read from the model." | ModellerGuide.md:155-160 |
| 6b | ▶▶ Walk ALL Disciplines | "Or walk every missing trade at once." | ModellerGuide.md:680-684 |
| 6c | Route trunk from a real entry | "Then route the service trunk from a real door." | ModellerGuide.md:699-703 |
| 6d | generalization table on a held-out building (precision, fabricated count) | "Tested on buildings it never saw — scored against their real pipes." (numbers from `§GC` at record time) | ModellerGuide.md:663-667 |
| 9b | Teams overlay: two branches, merge gate flags a clash, who-dots | "Two people, two branches. The merge gate shows where they collide." | ModellerGuide.md:826-830 |
| 10 | close | "The same signed log runs the ERP." (bridge to the ERP trailers) | ModellerGuide.md:7-8 |

## 4. STATUS
- 2026-10-03 23:30: §ERP-TECH-TRAILER BUILT — `~/Downloads/ERP_TechTrailer_9languages_1920x1080_24fps_2026-10-03.mp4`
  (181.0 s, 4,345 frames, 13.2 MB, −16.4 LUFS). One take, GPU (red1 approved; `--use-angle=gl` → RTX 4060; the run
  waited on `flock /tmp/claude-1000/gpu.lock` behind another session's Hospital bake — never contended). Recorder
  `scripts/film_erp_techtrailer.js`; script `film_narration_erp_tech_dialogue.tsv` (PLAYBOOK B). Arc + § facts:
  greetings → System Monitor from the login card (`§SYSMON-RELEASE v811`, 3× "No longer needed", "SQLite-wasm, in-page —
  no Postgres host", "the signed op-log is the trace") → GardenWorld login → AD live counts (375 windows, 1,135 tabs,
  20,988 fields, 476 processes, 277 callouts) → Sales Order 1500003 form → DocAction DR legal=[CO,PR,VO] → CO
  (`§DOC-COMMIT-LIVE`, after=[CL,VO]) → Dashboard Graph (5 donuts) + Timeline → World History → Project BIM: Hospital
  (64,719,479 planned, 28 lines, 7 phases) → EVM `§DASH-VARIANCE` committed 87,372,995 (+35 %) → Phase Architecture →
  Task MASON → Task Line IfcWall (1,598,552) — **the "trick" (red1): Hospital lines carry a task, so they live in Task
  Line (TabLevel 3), not Project Line/Phase Line (AD_Tab where clauses)** → red Zoom Across pill (`§ZOOM-ACROSS launch
  find=IfcWall`) → Viewer in a new tab, the screencast follows it → `§ZOOM-SCOPE IfcWall matches=50`, `§ZOOM-COST
  linePlanned=1598552` → English to the end (Viewer i18n incomplete). 60/60 clicks, 27 beats, 0 PAGEERR, 0 missing §I18N.
  Fit 26/26 DETAIL, 0 WRONG. Silences ≥ 2 s: 5, each 2.0–2.7 s. Software GL measured unusable for the Viewer (one frame
  per ~22 s, `§FPS_MODE mean=21783`). Logs `prompts/erp_film/tech_*`.
- 2026-10-03 21:40: POLYGLOT v3 (red1: "need not reintroduce each other's languages. Just intersperse without formality.
  Fill up the silence spaces. Naturally cover each coordinated step as if a single flow … a show killing 3 birds:
  multi lingual, setup trailer, and good advertising"). Same 180.2 s take; script rewritten as ONE running ad-style
  voice-over — no "now in X" lines, each speech stretch simply in the slice's language, each line narrating the step on
  screen, slices filled to ~85–100 % (measured `§POLY_DUR` vs room, then topped up). New claims carry their `§` source
  in the TSV (currencies 163, address derived from the BP, signed/chained ops verifyChain=ok, data stays in the browser).
  Fit 24/24 DETAIL, 0 WRONG. silencedetect −40 dB ≥ 2 s: v1 had 13 gaps up to 11.2 s → v3 has ONE, 2.2 s (116.2–118.5).
  `~/Downloads/ERP_Polyglot_9languages_v3_1920x1080_24fps_2026-10-03.mp4` (4,326 frames, 11.9 MB, −16.3 LUFS). v2 deleted
  (intermediate). v1 kept. Fit log `prompts/erp_film/polyglot_v3_fit.log`.
- 2026-10-03 21:00: §ERP-POLYGLOT FILM BUILT — one continuous take, 180.2 s, 9 languages rotating every ~10 s.
  Pre-reqs landed first: UI locales (Opus agent, bim-ootb #1827/#1828, `prompts/ERP_UI_LOCALES.md`, W-ERP-I18N 11/0
  re-run here) and the gap closures (Opus agent, #1820–#1826, journey 34/34 re-run here). The recorder found one more
  real bug — Grid/Form toggle left Save disabled (FS-19, `ERP_FIRST_SETUP_GUIDE.md §FS2q`) — fixed in bim-ootb #1829
  (W-TOGGLE-SAVE 4/4, 2 FAIL without; journey 34/34; W-ERP-I18N 11/0 after a record-counter regression in the first
  version was caught by W-ERP-I18N and fixed). Recorder `scripts/film_erp_polyglot.js` (language-proof selectors:
  menu `data-menu-id`, tabs by tableName title, toolbar `(Alt+x)` titles; `ERP_REPO` env films a worktree);
  driver `prompts/film_narration_poly.py` (per-language fitters → merged plan + per-language subtitle fonts).
  Take: intro greeting round on the login card (9 locales, login card re-rendered each, Arabic RTL) → System login →
  Initial Tenant Setup FirstCo/owner/MYR → Create (rows=530, 311 accounts, 12 periods, 42 doc types) → owner login
  (language carried) → customer Acme → address via the Location editor (Jalan Ampang 1, Kuala Lumpur) → vendor →
  Sales Price list ticked → sales order → line priced (std=1, Each) → Complete → CO → Pills → Help → signed backup
  (ops=8, signed=Y) → closing. §ERP_FILM_CURSOR 89/89 OK, 25 beats, 0 missing §I18N, 0 PAGEERR. Fit 24/24 DETAIL, 0 WRONG.
  `~/Downloads/ERP_Polyglot_9languages_1920x1080_24fps_2026-10-03.mp4` (4,326 frames, 10.2 MB, −16.4 LUFS; per-language
  fontselect: DejaVu / Noto Sans Arabic / CJK SC / CJK JP / Thai). Quiet stretches 4–11 s inside slices (speech ≈5 s
  per 10 s slice; longest 10.9 s address typing, 11.2 s vendor typing). Logs `prompts/erp_film/polyglot_*`.
  Re-run: BEAT_MIN in the recorder log header of this entry's run (greetings 1.8–2.3 s, slices 10 s), then
  `film_narration_poly.py <tsv> <erp_film.log> <dir> <dur>` and `film_narration_mux.py poly …`.
- 2026-10-03 16:20: ERP PART 1 — CANTONESE. Edge zh-HK HiuMaan (F) + WanLung (M); written Cantonese, Traditional
  script, subtitles in Noto Sans CJK HK (fontselect confirmed). `CFG['yue']` (pitch=False, tonal). Script
  `film_narration_erp_part1_dialogue_yue.tsv` (cues from part 1's timed TSV). Fit 7/7 DETAIL (open ×1.096, at the cap;
  facts ×1.004). `~/Downloads/ERP_FirstSetup_narrated_part1_CANTONESE_…mp4` (2.8 MB, 1,476 frames, −16.2 LUFS, no
  silence ≥ 2 s). Log `prompts/erp_film/part1_yue_fit.log`.
- 2026-10-03 16:00: §ERP-FILM PART 2 BUILT (95.4 s, English dialogue) — continues part 1 in FirstCo, ends at the first
  real GAP. Recorder `PART=2` replays part 1 off camera (fast), then films: owner login → Business Partner → customer
  C-001 Acme Retail (own HQ offered, records 1→2, §CRUD validate ok + persist) → its Location tab: the Address field
  (C_Location_ID, AD_Reference 21 "Location (Address)") is a plain text input — no address editor (**GAP**, handed to
  the Opus gap agent) → vendor V-001 Kedai Bekalan (2→3) → Product: 1 tax category, this company's → payment term
  Immediate/0/default → Sales Order: Acme + Standard Order (7 types) → Save REJECTED `c_bpartner_location_id required`
  (UI shows "Partner Location * required"). §ERP_FILM_CURSOR 34/34 OK, 0 PAGEERR. Fit 8/8 DETAIL, 0 WRONG.
  `~/Downloads/ERP_FirstSetup_narrated_part2_1920x1080_24fps_2026-10-03.mp4` (2,290 frames, 5.0 MB, −17.0 LUFS; quiet
  stretches 6–10 s while typing in vendor/order). Script `film_narration_erp_part2_dialogue.tsv`; logs
  `prompts/erp_film/part2_*`. Re-run: `BEAT_MIN='{"login2":8.3,"bpwin":4.3,"customer":10.7,"address":9.9,"vendor":7.9,
  "product":9.7,"order":6.9,"gap":13.0}' PART=2 node scripts/film_erp_first_setup.js <dir>`. Part 3 = after the
  address editor + new-tenant price land: address → order line priced → Complete → shipment/invoice → journal → aging.
- 2026-10-03 15:10: §ERP-FILM PART 1 MANDARIN (zh-CN). `film_narration_fit_edge.py` gained `'zh'` (Xiaoxiao F / Yunxi M,
  pitch=False, Noto Sans CJK SC, Chinese credit). Script `film_narration_erp_part1_dialogue_zh.tsv` (same ids/cues/turns/§sources
  as English). Fit 7/7 DETAIL (login + form first fell SHORT, detailDur 11.20>9.91 / 8.72>7.10; shortened -> 9.25 / 6.56).
  No §NARR_TONE lines are emitted for zh (pitch=False path prints none; not measured). Witness: 1,476 frames 1920x1080;
  silencedetect -40dB d=2 -> no gaps; ebur128 I = -16.2 LUFS; fontselect = Noto Sans CJK SC (NotoSansCJK-Regular.ttc).
  Output `~/Downloads/ERP_FirstSetup_narrated_part1_MANDARIN_1920x1080_24fps_2026-10-03.mp4` (2.8 MB). Fit log `prompts/erp_film/part1_zh_fit.log`.
- 2026-10-03 14:30: §ERP-FILM PART 1 BUILT (≈1 min, English dialogue). Recorder `scripts/film_erp_first_setup.js`
  (first run worked: 35 s, 0 PAGEERR). Then timed to the narration: dialogue `film_narration_erp_part1_dialogue.tsv`
  voiced first (Kokoro v3) to measure each beat's spoken length → `BEAT_MIN` env → recorder holds each beat until its
  lines fit (`§ERP_FILM_HOLD`) → re-cue the TSV from `§ERP_FILM_BEAT` → fit → mux. Facts (all `§ERP_FILM_FACT`,
  live DB): seed 25.9 MiB, 7 demo tenants, menu path System Admin > Tenant Rules > Initial Tenant Setup, 163 currencies,
  created client=17 rows=515, 311 accounts, 12 periods FY2026, 42 doc types, MYR on schema + price list, enter user
  `owner`. §ERP_FILM_CURSOR clicks=11 onTarget=11 OK. Fit 7/7 DETAIL, §NARR_TONE 0 WRONG.
  Output `~/Downloads/ERP_FirstSetup_narrated_part1_1920x1080_24fps_2026-10-03.mp4` (61.5 s, 1,476 frames, 1920×1080,
  3.0 MB — static UI compresses well; −16.9 LUFS; no silence ≥ 2 s). Logs in `prompts/erp_film/part1_*`.
  Re-run: `BEAT_MIN='{"open":12.9,"login":10.2,"menu":5.4,"form":7.4,"create":2.5,"facts":15.3,"enter":7.4}' node
  scripts/film_erp_first_setup.js <dir>` then PLAYBOOK steps 3–4 with FILM_SEC=61.5. Next (if red1 likes it): part 2 =
  guide S08–S16 (customers, vendors, products) in the same recorder.
- 2026-10-03 13:30: FRENCH + SPANISH BUILT (native subtitles). First voicing: FR 13/18, ES 12/18 DETAIL (lines run
  long like Malay; `detailDur` logged) → trimmed open/loadpath/parade/reveal/value (+ ES which); FP|STR said as
  "pareil"/"igual" (= 38, same as MEP|STR). Fit 18/18 DETAIL both, 0 Edge retries. §NARR_TONE 0 WRONG: FR 10 yes/no
  end +0.7…+4.2 st (4 needed the PSOLA rise; one at the 11 st cap only reached +0.7 — rising, under the +1 target),
  ES 12 yes/no end +1.3…+4.9 st (8 needed it). Films `~/Downloads/Hospital_narrated_dialogue_{FRENCH,SPANISH}_AFTER_…
  _0049.mp4` (4,963 frames each, −16.3 LUFS, longest gap 6.4 / 6.5 s at the datum overlay). Logs
  `film_narration_hospital_0049_{fr,es}_fit.txt`.
- 2026-10-03 13:00: SPEC — FRENCH then SPANISH (red1: "do it in French followed by Español"). Same route + rules as
  Malay: Edge fr-FR Denise (F) + Henri (M); es-ES Elvira (F) + Álvaro (M); native subtitles only. Scripts are
  line-for-line translations of v3 (same ids, cues, `§` sources, numbers spelled out). Both languages rise on yes/no
  questions → PSOLA rise only where the voice's own ending is below +1 st; wh-questions (FR que/qu'/quoi/pourquoi/
  comment/combien/où/qui/quel/quand; ES qué/por qué/cómo/cuánto/dónde/quién/cuál/cuándo) left as voiced. Witness as
  Malay: §NARR_FIT 18/18 placed, §NARR_TONE 0 WRONG, 4,963 frames, silencedetect gaps.
- 2026-10-03 12:30: MALAY + THAI BUILT. red1 then: "do the Thai in Thai subtitles" + "drop the English subtitling
  for now" → English-caption encodes stopped and their partial files deleted; only native-caption films delivered.
  The English caption maps + fitter 4th-arg path stay in the repo, unused, for later.
  Scripts `..._dialogue_ms.tsv` / `..._dialogue_th.tsv` (same ids/cues/`§` sources/numbers as v3); English caption
  maps `..._ms_en.tsv` (back-translation of the SHORTER Malay lines, so captions match what is said) and `..._th_en.tsv`
  (= v3 English; Thai is line-for-line). Fitter `film_narration_fit_edge.py` (4th arg = caption tsv; §CAPTION_MISMATCH
  if turn counts differ → 0 on both); mux `film_narration_mux.py` (refuses to overwrite). Edge lead-in silence trimmed
  (~0.1–0.2 s per clip). One transient `NoAudioReceived` on Thai → retry added (§EDGE_RETRY, 3 tries; 1 retry used).
  MALAY: first draft ran ~30–40 % long (13/18 fell to SHORT, `detailDur` logged) → lines trimmed, two numbers kept
  as "sama" (FP|STR = MEP|STR = 38). Fit 18/18 DETAIL. §NARR_TONE: 12 yes/no questions all end rising (+1.0…+5.7 st;
  9 needed the PSOLA rise, 3 already rose on their own), 0 WRONG. Film (Malay captions):
  `~/Downloads/Hospital_narrated_dialogue_MALAY_AFTER_…_0049.mp4` (4,963 frames, −16.1 LUFS, longest gap 5.1 s).
  THAI: fit 18/18 DETAIL first try (only `open` sped ×1.045). No pitch edit (tonal). §NARR_TONE reported only:
  all 17 question chunks end flat-to-falling (−0.2…−12.2 st) — Thai questions are marked by particles (ไหม/เหรอ/คะ),
  not a rise; whether these sound natural is a native-speaker check, not measured here. Thai captions in Noto Sans Thai.
  Fit logs `film_narration_hospital_0049_{ms,th}_fit.txt`.
- 2026-10-03 11:40: SPEC — MALAY then THAI dialogue (red1: "go with what you suggest, Malay, then Thai").
  Route picked: Microsoft Edge neural TTS (`edge-tts` 7.2.8 in the venv) — ms-MY Yasmin (F) + Osman (M), th-TH
  Premwadee (F) + Niwat (M). Reason: only free route with M+F in both languages and natural prosody (Kokoro/Piper
  have neither language; MMS is non-commercial and flat). ⚠ Cloud: script text goes to Microsoft; it is unofficial
  (no SLA). Clips cached on disk by (text, voice, rate) hash so a re-run makes no new call and is stable.
  Scripts translate the v3 English rows line-for-line: same ids, cues, `§` sources, same numbers (spelled out in the
  language). Fitter `film_narration_fit_edge.py` = v3 rules (fit / per-speaker rate / beats / chunks), plus:
  Malay — yes/no questions (ke?/-kah, no apa/kenapa/berapa/bagaimana/di mana/siapa/bila) get the PSOLA rise ONLY if
  the voice's own ending does not already rise ≥ +1 st (measured first). Thai — tonal language: pitch is part of the
  word, so NO pitch edit; questions carry their particle (ไหม / หรือ / อะไร); §NARR_TONE reported, not enforced.
  Captions: Malay DejaVu Sans; Thai Noto Sans Thai. Credit line in each language naming the cloud voice.
  Witness: §NARR_FIT all rows placed; §NARR_TONE Malay YN rise / WH any; output frames = 4,963; silencedetect gaps.
- 2026-10-03 11:20: V3 — DIALOGUE, GAPS FILLED + INTONATION (red1: "yes do it, with proper intonation").
  Spec: (a) fill the two long silences with log-sourced lines; (b) questions must sound like questions, as a
  measured value, not a listen. Gap lines: `which` adds §MEASURE_BOX "Structural — span depth cantilever" (linger
  123.03) + red1's false-alarm point; `reveal` walks the side panel in step with §CLASH_HUD_HIGHLIGHT (FP|MEP 81
  f4116, MEP|STR 38 f4205, FP|STR 38 f4294, ARC|ELEC 29 f4383). FOUND (measured): Kokoro ends EVERY question falling
  (−2…−7 st, voice- and en-us/en-gb-independent, `§QRISE_PROBE`). Fix in fitter v3 `film_narration_fit_kokoro_v3.py`:
  per-speaker speed (F ×1.03, M ×0.97), beat between turns by ending (? 0.40 · … 0.35 · ! 0.28 · . 0.22 s), each
  question sentence voiced alone; yes/no + elliptical questions (no wh-word) get a Praat PSOLA rise on the last 0.6 s
  (praat-parselmouth 0.4.7 added to the venv; formants + duration kept), raised in 3 st steps until the end measurably
  rises ≥ +1 st (cap 11); wh-questions keep the fall. Witness `§NARR_TONE` (autocorrelation F0, self-test
  `§F0_SELFTEST` 3/3 OK): 17 questions, 0 WRONG — 12 rise +1.2…+3.6 st, 5 wh fall −1.8…−5.4 st. Fit 18/18 DETAIL
  (log `film_narration_hospital_0049_v3_fit.txt`, script `..._dialogue_v3.tsv`). Output
  `~/Downloads/Hospital_narrated_dialogue_v3_AFTER_…_0049.mp4` (379 MB, 4,963 frames, −16.7 LUFS). silencedetect
  (−40 dB, ≥4 s): v2 had 11.1 s (122.7–133.8) + 10.5 s (183.4–193.9) + 4 others; v3 longest is 7.4 s (152.5–159.9,
  the datum overlay), 4 gaps total. Previous films untouched.
- 2026-10-03: file created from red1's request (Alt+S session bim-compiler-6d). Nothing built. Next: a session
  writes §PLAN, then stops for red1's review.
- 2026-10-03: V2 — DIALOGUE + LIVELY (red1: fill the pauses, livelier, male/female conversation, compare versions).
  Voice engine Kokoro v1.0 (local ONNX, CPU, deterministic: same text → same samples): af_heart (F) + am_michael (M).
  Fitter v2 `film_narration_fit_kokoro.py` (multi-speaker turns, ≤10% speed-up by re-voicing). New log-sourced facts:
  site = Boston (§GEOREF_SITE 42.358,-71.060 from IFC — likely the Revit default location), clash narrow phase
  (§CLASH_NARROWPHASE broad=1478 → meshTrue=271, falsePositiveRate 79.0%; clash_film.js per-rule tolerance mm),
  rule totals (§RULE_FILM structural 384 / egress 26; isolated_room 1; column_continuity 15; circulation 13),
  §COST_ODOMETER_FINAL 94,880.8 h. Fit: dialogue 18/18 DETAIL, lively 21/21 DETAIL (`..._v2_fit.txt`).
  Outputs (original untouched): `~/Downloads/Hospital_narrated_dialogue_…_0049.mp4` (longest silence 11.1 s at
  122.7–133.8, next 10.5 s at 183.4–193.9) and `~/Downloads/Hospital_narrated_lively_…_0049.mp4` (longest 13.5 s at
  180.4–193.9). Scripts: `film_narration_hospital_0049_dialogue.tsv`, `..._lively.tsv`. Speaker-coloured captions.
  YouTube: per support.google.com/youtube/answer/14328491, disclosure is for realistic content that could mislead
  (real person made to say things, altered real events, realistic invented scenes); AI-assisted scripts and cloning
  one's OWN voice are listed as not requiring it. Generic synthetic voices are not named either way → red1's call.
  MALAY (discussed, not built): no Malay in Kokoro or Piper (Piper has id_ID only); options = red1/native speaker via
  prompter; Edge ms-MY Yasmin/Osman (cloud, unofficial, M+F); ElevenLabs (paid, cloud, can clone red1's voice);
  Meta MMS zlm (local, flat, CC-BY-NC — not for product use). Awaiting red1's pick.
- 2026-10-03: FULL HOSPITAL FILM (red1 "Go"): 19-point storytelling script (`film_narration_hospital_0049_script.tsv`),
  female voice Piper en_GB-jenny_dioco-medium, length-scale 1.4 + 0.5 s between sentences (raw Jenny ≈3.4 w/s; result
  233 words / 98 s spoken = 2.37 w/s). Fitter v1 `film_narration_fit.py`: measures each clip after trimming its silent
  tail; DETAIL if it fits, else speed up ≤10% (atempo, pitch kept), else SHORT, else SKIP. Log `film_narration_hospital_0049_fit.txt`: 19/19
  DETAIL, 3 sped up (day1 ×1.024, parade ×1.007, value ×1.058). ⚠ Piper durations vary a little run to run (noise
  in the model) — the fit is measured on the clips actually used, so placement is consistent, but a re-run is not
  byte-identical. Output `~/Downloads/Hospital_narrated_full_AFTER_1920x1080_24fps_2026-10-03_0049.mp4` (377 MB, 4,963
  frames, original untouched). Witness: silencedetect speech onsets at 9.16 13.00 18.52 30.40 43.86 56.90 72.55 82.81
  95.00 115.00 148.71 159.80 172.65 194.00 s = the planned cues; captions present (bottom-band PSNR vs original
  19.8–22.9 dB at 20/100/202 s vs 32.5 dB at 140 s, none); credit at top in last 8 s (23.2 vs 36.5 dB).
- 2026-10-03: CAPTIONED SAMPLE + TONE. red1: captions at the bottom matching the script; script kept GENERAL (detail
  only where the gap allows). Fitter v0 (scratchpad `narr/fit.py`): each point has SHORT + DETAIL text; room = next
  cue − cue − 0.3 s; DETAIL if it fits, else SHORT, else SKIP (`§NARR_FIT` lines). Result: envelope room 2.40 s →
  SHORT (1.71 s); storey room 10.05 → DETAIL (4.23); corridor → DETAIL (2.95). Burned-in captions + end credit
  "Voice: AI-generated (Piper, local) · Script directed by red1" →
  `~/Downloads/Hospital_narrated_captioned_SAMPLE_AFTER_1920x1080_24fps_2026-10-03_0049.mp4` (re-encoded x264 crf 17,
  4,963 frames, 370 MB; caption witness: bottom-band PSNR vs original 19.6–23.9 dB where a caption is on, 39.9 dB where
  none). First encode hit a transient "No space left on device" (disk had 59 GB free after) — re-run clean, rc=0.
  TONE SOURCE: red1's own narration `~/Videos/HospitalNarrative.mp4` (196 s), transcribed locally (faster-whisper
  small.en, CPU) → `prompts/film_narration_red1_HospitalNarrative_transcript.tsv`. Measured: 346 words / 186.9 s of
  speech = **1.85 words/s** → use as the fitter's speaking-rate budget for red1's own voice. Style: first-person tour
  guide, present tense ("as you can see", "now we're on the return path", "as we approach the end"), says WHY a feature
  is there ("so that the user can easily pick out…"), closes on the value line (air-gapped, no AI call, no installer).
  Channel: https://www.youtube.com/@redhuanoon/videos (342 videos listed; ~25 film-related, e.g. "Full Movie Clash
  Analysis 4D 5D from BIM IFC" 7EJ-uFCuOLQ) — captions not yet pulled.
- 2026-10-03: SAMPLE (red1 go): Piper local TTS installed (`~/.local/share/film_narration/venv`, voice en_GB-alan-medium,
  offline, CPU). 3 lines from §FLYTHRU_CUE_PLACE → `~/Downloads/Hospital_narrated_SAMPLE_AFTER_1920x1080_24fps_2026-10-03_0049.mp4`
  (video copied: 4,963 frames, original untouched). Placed start=max(cue, prevEnd+0.3): envelope 0.00→7.11 s, storey
  planned 2.70 → spoken 7.41 (+4.71 s late, envelope line 7.1 s vs 2.2 s on-screen window), corridor 13.05→16.00.
  silencedetect on the output confirms speech edges at 7.46 / 13.10 s. Finding: cue windows (2.2 s) are far shorter
  than a spoken line — the fitter must fit to the GAP until the next cue, not the caption window. Log copied beside the film.
- 2026-10-03: splice step added (red1) — cut the take per line by silence gaps, place each at its fitted second, report drift.
- 2026-10-03: own-voice prompter route added (red1) — fitter rows → cue file + prompter view over the film.
- 2026-10-03: §0.1 added from red1's follow-up — the lane's core is the script-to-film FITTER (placed / skipped /
  gap / orphan), red1 writes the narrative; test film switched to Hospital 0049 (build-up ON).
- 2026-10-03: §0 realigned to red1's original words (kept verbatim): professional documentary voice-over of a
  *construction* film; ElevenLabs/OpenAI TTS is the planned route (the 'No AI inside' point demoted from a forced
  decision to one open question); construction-sequence tags (`§GANTT`, `§NIGHT_BUILDUP_GATE`) added as sources;
  plan kept brief.
