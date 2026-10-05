# ⚠ DO NOT REMOVE — FILM NARRATION (voice-over for the baked Alt+C films)
SCOPE: plan, then (only after red1 approves the plan) build, a spoken narration track for the films that
`cli_silent_bake.js` bakes (Alt+C). Every spoken word traces to a `§` line the bake already logs. No invented
numbers, no invented claims. Spec before code; a witness proves the track, not a listen-through.
**Read the page log after every run** — exit code is not evidence. Honour this block until the lane is DONE.
**→ Making another narrated/dialogue film (any language)? Jump to `## ▶ PLAYBOOK` below — voices, steps, commands, pitfalls.**

## ▶ RESUME HERE — VIEWER TRAILER v4 (written 2026-10-04 for a NEW session; read this, then §8 STORYBOARD v3 + §8 RUN LOG)
**UPDATE 2026-10-04 13:30: v4 is BUILT and in red1's hands — see §4 STATUS top entry. The items below are DONE; next = red1's notes on v4, then (only on his go) §9 Modeller.**
**State:** Viewer trailer v2 is built and in red1's hands (`~/Downloads/BIM_Viewer_Trailer_v2_13languages_…mp4`, 220.9 s).
red1 reviewed it and gave the v4 notes below. **⛔ DO NOT RECORD until red1 OKs the v4 storyboard** (red1: "dont bake yet,
until we get the storyboard right"). The Modeller trailer (§9) and the documentary (§10) stay parked (⏸ standing order).
**Next session, in order:** (1) implement the ⏳ items below in `scripts/film_viewer_trailer.js` + the TSV; (2) regenerate
the storyboard (same generator style as §8 STORYBOARD v3) and show red1 the delta; (3) on his OK, record → align page audio →
fit → cards → mix (commands in §8 PIPELINE below); (4) measure (silences, LUFS, fonts) and report.

**red1's v4 decisions (2026-10-04, verbatim where quoted):**
1. ✅ Info panel pick is fine. **Wireframe must never show** — "If it accidentally comes on it is a bug, just keep those
   frames out after refresh or mesh back on". (`solid()` already cuts ghost/x-ray toggles; ⏳ extend: if a ghost/bbox frame
   is detected anywhere, cut until refresh or mesh back.)
2. ✅ Language switches happen (UI translated) but the **picker action is cut** (`quietLang()`, done) — only the one g_pick
   demo shows the picker. ⏳ The cost page's RM→$→RM flip still opens the picker on screen → use the same cut.
3. ⏳ **Cost page: linger longer** — "so user sinks in the BIM 5D full suite feature" (pan/scroll the 4D/5D charts).
4. ⏳ **V sounds ONLY during the Fly**, made elaborate with the scrub — "V only in Fly as u wana make it elaborate with
   scrub"; "let it fly thru, not cut jump.. stop frame hasten it to the action part" (trim the dead start; no jump-cuts
   inside the fly). Remove V from the Time Machine (currently `key('v','sfxOn')` there — move it to s09).
5. ⏳ **Time Machine** — "just a focussed build up then fast forward to near end where the drawers showed completion";
   "show the Sun follow shadow with the drawers 4D 5D opened.. arrange them to be balance on frame not overlap each other".
   → sun on with shadows during the build; open the dashboard (`#tm-dash`) and Gantt (`#tm-gantt`) drawers, place every
   panel so nothing overlaps (drag panels; log each panel's rect, assert no intersections — a § line, not a look);
   fast-forward near the end (slider ~95 % or `#tm-end-btn`) so the drawers read complete. The separate HR-mode sunset
   beat (s11sun) is replaced by this fast-forward beat (rewrite its line).
6. ⏳ **Section cut deeper + second axis** — "not deep enough, we cannot see the HHS been cut.. quickly jump to the other
   axis to show it is been cut from the front inwards" → slide well below mid-height, then `#sec-axis-x` and cut from the
   front inwards.
7. ✅ Done in v3 code (not yet filmed): refresh+cut after the clash list (red1: "Refresh is the best way"), list ✕ clears the
   dots, full chapter titles spoken, page audio captured from a private PulseAudio sink and aligned (`prompts/film_page_audio.py`,
   `SFX_WAV` in `film_narration_mux.py`), fly-timeline scrub by a real slider drag, quips spoken + subtitled.
**Open from red1 (not yet answered):** a soft music bed under the 2–6 s quiet visual moments, or leave them silent?

**§8 PIPELINE (one take, all CPU except the record step):**
`flock -w 7200 /tmp/claude-1000/gpu.lock env BEAT_MIN="$(cat beat_min.json)" timeout 1500 node scripts/film_viewer_trailer.js <O>`
→ `python3 prompts/film_page_audio.py <O>/viewer_film.log <O>/page_audio.wav <dur> <O>/page_audio_aligned.wav`
→ `FIT_PAD=0.12 POLY_CREDIT=… python3 prompts/film_narration_poly.py prompts/film_narration_viewer_trailer_dialogue.tsv <O>/viewer_film.log <O>/fit <dur>`
→ `python3 prompts/film_title_cards.py <O>/viewer_film.log card_backdrops.txt <O>/fit/poly.ass <O>/viewer_film.mp4 <O>/fit`
→ in `<O>/fit`: `cp carded.ass final.ass; cp poly_plan.tsv final_plan.tsv; SFX_WAV=… FILM_SEC=<dur> python3 prompts/film_narration_mux.py final carded.mp4 <out>`.
BEAT_MIN = per-beat speech + 0.7 s (greetings + 0.15 s with FIT_PAD=0.12), from `film_narration_poly.py <tsv> measure <dir>`.
Card backdrops = 6 Alt+S stills (paths in §8 TITLE CARDS). **GPU etiquette:** always `flock gpu.lock`; other sessions
give way on request (SendMessage) — never kill their jobs. **pkill/pgrep pitfall:** use `grep "[f]ilm_…"` patterns — a bare
`pkill -f film_viewer_trailer` matches its own shell and kills the command. Live bugs this lane found + fixed: bim-ootb #1833,
#1834, #1835 (see §8 RUN LOG).

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
**Languages — REVISED 2026-10-04 (red1: "Drop exotic languages.. Banglish.. any others?"):** Banglish (bl_BD) and
Afrikaans (af_ZA, ~7 M native speakers, SA business runs in English) DROPPED from the film. Bengali kept (~270 M
speakers; the Bangladesh client, `project_sysnova_kazifarms_bim_scoping`). **13 spoken languages**:
en→fr→es→de→ar→zh→ja→ms→th→ko→pt→id→bn→en… The Viewer itself still ships all 18 locales. Every non-English line also
carries a smaller **English subtitle** under it (red1, 2026-10-04: "English translation for the others as a second
subtitle") — TSV columns 6/7 = EN_SHORT/EN_DETAIL, paired turn-for-turn by `film_narration_poly.py` (`§POLY_GLOSS`).
(Superseded text follows.) **Languages (red1, 2026-10-03: "Keep to the same language switching style, but this Viewer supposed to have many more
languages so take them all on"):** all 18 Viewer locales, same PLAYBOOK B switching. 15 spoken languages rotate
en→fr→es→de→ar→zh→ja→ms→th→ko→pt→id→bn→af→(Banglish)→en…; greeting round = 15 × ~2 s ≈ 30 s
(+ 안녕하세요 · Olá · Halo · নমস্কার · Hallo). New Edge voices (listed live via `edge_tts.list_voices()` 2026-10-03), F / M:
ko-KR SunHi / InJoon · pt-BR Francisca / Antonio · id-ID Gadis / Ardi · bn-BD Nabanita / Pradeep · af-ZA Adri / Willem —
each needs a `CFG` entry in `film_narration_fit_edge.py` (ko: pitch=False not needed — Korean isn't tonal; check rise).
Fonts present: Noto Sans CJK KR (via the CJK family), Noto Sans Bengali (`fc-list`).
- **Banglish (`bl_BD`)** is romanized Bengali, a UI variant with no voice of its own: its slice shows the Banglish UI,
  speaks the line with the bn-BD voice from the Bengali-script text, subtitle in the Banglish (Latin) spelling.
- **The 4 English locales** (en_MY, en_US, en_GB, en_AU) are one language, different currency + rate book → they carry
  hook beat 9: flip en_MY → en_US → en_GB → en_AU on the 4D/5D page and the cost changes RM → $ → £ → A$, with the
  page's rate source (CIDB / RS Means / Spon's / Rawlinsons, `docs/internal/Localization.md` §Available Locales).
- Gate unchanged: record only after the Fable agent's S226 §R2 lands all 18 locales with low `§TRL_LEAK`.
Length: ≈ 4–5 min allowed (red1, 2026-10-03: "u may extend more mins where comfortable") — beats 2b/6b/8b/8c/9b added.
City-mode aerial beat DROPPED (red1, 2026-10-03: "Drop the City aerial for now") — Film-Maker closes.
Open: the hook beat 9 depends on the 4D/5D page also following the language (in S226 §R2 scope).

### §8 TITLE CARDS — chapter format (red1, 2026-10-04: "put into the script some good titling such as in the latest
screenshot example. So we can have say chapters format")
**Reference:** `~/Pictures/Screenshots/Screenshot from 2026-10-04 04-37-58.png`. Its anatomy, copied:
the live footage keeps running underneath, dimmed to ~35 % · a small letter-spaced coral kicker ("CAPABILITY 1") · a huge
two-line bold title, line 1 off-white, line 2 coral · one plain sentence under it · a persistent boxed chapter tag at
top-left ("CAPABILITY 1 · EMOTION", coral on dark) for the rest of the chapter · a series tag at top-right.
**Applied here:** ~2.5 s card at each chapter start, fade 0.4 s; the boxed tag stays top-left until the next card.
Colours: off-white #F3EEE8, coral #FF6B78, dim layer black 65 %. Font: a heavy sans with the script's glyphs (Noto Sans
Black/Bold family + the CJK/Arabic/Thai/Bengali Noto per language — `fc-list` before use; no new font downloads without
a check). Burned by the same ASS pass as the subtitles (new styles `CardKicker`, `CardTitle1`, `CardTitle2`, `CardLine`,
`ChapterTag`, `SeriesTag`) + an ffmpeg `drawbox` dim — deterministic, no editor.
Card language = the slice's language; the kicker carries the English ("CHAPTER 2 · INSPECT") so every card reads in both.
**Backdrops (red1, 2026-10-04: "u may use latest nice stills as backdrop"):** each chapter card sits on a recent Alt+S photoreal still from ~/Downloads, dimmed ~35 %, instead of the live footage, for the card's ~2.6 s: 1 OPEN bounce_still_1791066758986.png (campus aerial) · 2 SEE bounce_still_1791059434614.png (glass office corner) · 3 INSPECT bounce_still_1791059526209.png (atrium stair, structure) · 4 TIME bounce_still_1791066612170.png (layered facade) · 5 COST bounce_still_1791059388656.png (courtyard from above) · 6 SHARE bounce_still_1791059545568.png (atrium walkway). Backdrop only — these are other buildings than the one filmed, never narrated as it.
Series tag: "BIM OOTB · VIEWER" / "· MODELLER". Chapters for §8: 1 OPEN (beats 1–2b) · 2 SEE (3–5) · 3 INSPECT (6–7)
· 4 TIME (8–8c) · 5 COST (9) · 6 SHARE (9b–10). §9 Modeller: 1 OPEN · 2 BUILD · 3 GENERATE · 4 UNDO ANYTHING · 5 SHARE.

### §8 RECORDER MAP (selectors + § waits, read from bim-ootb origin/main 01f38710 on 2026-10-04 — file:line in each)
- Desktop context, non-touch (key handler returns on `_isMobile`, `viewer/scene.js:3257`); every key logs `§SHORTCUT_FIRE key=`.
- Landing: skip the Morpheus gate with `localStorage mx_entered=1` or film `takeRed()` (`index.html:276`); icons `#por-<id>`
  (`§ICON_DROP`); flags `#por-flag` → `openFlags()` `§FLAGS picker opened`, popup `#ootb-flag-popup` buttons `title="Name (code)"`
  — TODAY reloads (`locale_loader.js:363`) → needs S226 §R2c `setLocale` (in place). Hub: `#por-gps` → `#hub.active`
  (`§HUB opened`), Hospital card `#hub .hub-card[data-bld="Hospital"]` (`§BUILDING_OPEN`, opens a popup tab `bim_Hospital`;
  local form `viewer/viewer.html?db=/buildings/Hospital_extracted.db`).
- Loaded: no `§STREAM_DONE` exists — poll `APP.streaming===false && !(APP._bboxPlaceholders||[]).length`; `§KERNEL_OP
  committed … type=BUILDING_OPEN`; `#status` "DONE — …". Budget 180 s db + 60 s stream (`tests/probe_history_bar.js`).
- IFC drop: `setInputFiles('#m-import-file')`; Merge/New = native `confirm()` (`import_own.js:508`) → page.on('dialog');
  `§VERSION_MERGE_ACCEPT` / `§IMPORT_AUTO_OPEN`.
- Pick: canvas click at a projected element centre (`viewer/tests/witness_s7_canvas_pick.js:90-118`) until `§PICK <cls>`;
  panel `#info-panel` (`#info-class/-storey/-disc/-material`).
- Floors/disciplines: bottom-left panels REMOVED (§S280) → Find panel tree `#find-axis-toggle` (`§LENS_AXES`), `#find-tree`;
  API `A.filterStorey()` `§STOREY_FILTER`. Beat 4 uses this.
- X-Ray Alt+Z `§XRAY_CYCLE`; Night `n` `§NIGHT_MODE on`; Shadow+Ground `h` `§SHADOW_GROUND cycle=`.
- Find `f` → `#find-name`, `§NAV_FIND_SEARCH query="IfcWall" results=N` (LIMIT 50 — say "every wall" only if N<50).
- Section `x` `#section-slider` (input event; no slider log); Measure `m`, two taps → `§MEASURE <dist> from … to …`.
- Clash `c` → `§CLASH_MATRIX shown`, cells `[data-pair="A|B"]`. Time Machine `t` → `§TIME_MACHINE ON`, `#tm-fwd-btn`,
  `#tm-big-counter`; Pull Back `#tm-reschedule-asap` → `§GANTT_RESCHEDULE_ASAP_COMMIT … daysCompressed=N`;
  What-if `#tm-whatif` needs an ERP-folded project (`§WHATIF-UI no-folded-project` otherwise) — film it ONLY if the run
  can fold Hospital first for real; else beat 8b = Pull Back alone.
- Fly Tour `l` → `§SCRUB_UI show`, `#tour-scrub-slider`, `A.tourSeek(T)` `§SCRUB_SEEK`. Share `/` → `#share-preview-overlay`
  `§SHARE_PREVIEW shown`. 4D/5D `4` → popup `boq_charts.html` (`§S254_STRIP_DONE` last; `#info` not "Loading").
- Film-Maker Alt+C → `#cpe-ok` appears (path editor), `§MAXQ_DURATION_DERIVED`, `§MAXQ_START` — film the derived path, then
  `APP.cancelMaxQualityOrbit()` (a full bake is ~10 min). Needs `APP._composer`.
- ⋯ `#mobile-trigger`; drawers `#pill-navigate|inspect|camview`, rows `#drawer-row-<id>` (`§DRAWER toggle=`); panels sit at
  x=928 → viewport ≥1158 wide.
- `trl-ready` listeners today: landing relabel, `panels.js` pill relabel, the three report pages (init once) — nothing else.

### §8 RUN LOG + STRUCTURE v2 (2026-10-04)
- **Building → HHS_Office_Federated** (red1: "Perhaps use HHS, lighter"). Hospital (265 MB): the recorder's Viewer tab
  closed mid-load (after `ROUTE Hospital_geo.db`, no PAGEERR) while another process held ~2.6 GB of GPU memory. HHS
  (75 MB, served from GitHub Pages on the live site → routed to the local file): loads in 5.9 s.
- **Full path filmed on HHS** (run vtrail6, 239 s, 0 PAGEERR): 6,839 elements · pick IfcWallStandardCase "Basic
  Wall:STB 30.0:573321" (Info panel in Spanish) · Find IfcWall = 50 (LIMIT 50) · measure 66.25 m · night fixtures=410 ·
  clash ARC/MEP/STR · Time Machine 6,882 ops, 56 days (generated) · Pull Back "nothing to compress — already at earliest
  float" · fly tour 34 stops / 895 s · 4D/5D 6 charts · share url · Film-Maker 24.0 s → 25.7 s derived.
- **Bugs the recorder found + fixed (bim-ootb #1833):** landing ⋯ rail flag opened-and-closed the picker; 4D pill title
  stuck in the boot language. Recorder bug fixed: the OCI route regex matched the Viewer page's own URL (?db= query).
- **FINDING (not fixed, not filmed):** What-if opens the ERP seed's project 990000 "BIM: Hospital" whatever building is
  open (`§WHATIF-UI open project=990000` on HHS) — dropped from the HHS take; owner lane: TM/What-if.
- **Structure v2 (red1: "have more English so that it does not need to switch at crucial bottleneck"):** ≈ 70 % English.
  UI language flips only on light beats as quips — s04 es · s06 ar · s07 zh · s09 ms · s10 th · s14 ja · s16 ko;
  load, Time Machine, Pull Back, cost, Film-Maker stay English. Greeting round + closing thank-you round in all 13.
  Cost chapter: 2 flips (RM → $ → RM) instead of 4 (each reloads that page).

### §8 NEXT VERSION — noted, NOT in the current take (red1, 2026-10-04: "dont stop what is already embarked in the movie...
just take note perhaps next version")
- **"o" — nav LOD boxes** (red1: "the 'O'cclusion impact when u open up Hospital and just press 'o' it hides the rest";
  "or u bring it up from the pill icons tray"): key `o` → `toggleDlodNav()` (viewer/scene.js:2310; tray: ⋯ → Navigate →
  row `dlodnav` "Nav LOD (large bldgs)", panels.js:1489). Slight on HHS → cut ~2 s to docs/img/viewer/
  time-machine-dlod-wireframe.png (Hospital: full LOD in view, wireframe boxes outside, "63419 elements").
- **Help → run it yourself / air-gapped** (red1: "show also the Help panel with install to local for airgapped ops"):
  Help pill (F1) → command palette → corner badge `#cmd-install-badge` → shared About/DIY modal (common/about_diy.js)
  → tab `[data-tab="diy"]` "Run it yourself (DIY)": "Download install script" `#adq-dl-viewer` + "Save an offline copy"
  `#adq-save-offline`. Line idea: "No internet on site? Install it locally — it runs air-gapped."

### §8 STORYBOARD v3 — for red1's review (2026-10-04, NOT filmed yet: "dont bake yet, until we get the storyboard right")

- **OPEN ** — Red pill → portal; 13 greetings spoken back to back (no UI switching)
  · [en] F: Hi!
- **· g_pick** — ONE on-screen demo: flag picker → French UI (switch shown)
  · [en] M: Your language — one click, and it switches in place.
- **CH1 c1** — Card “OPEN ANY BUILDING” on Alt+S still
  · [en] M: Chapter one. Open any building.
- **· s01** — Rail → Buildings & IFC hub
  · [en] F: The front door. Nothing to install — any browser, desktop or mobile. / M: Twenty-five ready-made buildings, right here.
- **· s02** — Hover the drop zone
  · [en] M: Got your own IFC? Drop it here — it's read right in the browser.
- **· s03** — HHS card → Viewer streams in (6 s) → drag + zoom in  ★NOVEL ART: IFC→SQLite in browser
  · [en] F: Open one — an office, six thousand eight hundred and thirty-nine elements. / M: Streamed straight from a database, in the browser — about six seconds. No server.
- **CH2 c2** — Card “SEE EVERYTHING”
  · [en] F: Chapter two. See everything.
- **· s04** — UI→Spanish (switch cut) · click a wall → Info panel; ghost/x-ray toggles cut
  · [es] M: ¡Mira! Un muro: su clase, su planta, su material.  ⟶ EN: M: Look! A wall: its class, its storey, its material.
- **· s05** — Find “IfcWall” → 50 found
  · [en] F: Ask for walls. / M: Fifty found, and listed — click one, and you fly straight to it.
- **· s05b** — Ask: largest rooms (14, 11.44 m²) + element counts (6,880)  ★NOVEL ART
  · [en] M: Or just ask — the largest rooms, the element counts. / F: Every answer from the engines, with its evidence.
- **· s05c** — Cutaway 4.6 s: Terminal escape route (same engine as Ask)
  · [en] F: Ask for the way out — here on the Terminal: the worst-case route, step by step, timed.
- **· s06** — UI→Arabic RTL (cut) · floor via storey filter (no wireframe) · X-Ray on/off
  · [ar] F: طابق واحد… ثم نرى من خلال الجدران، مثل الأشعة السينية.  ⟶ EN: F: One floor… then we see through the walls, like an X-ray.
- **CH3 c3** — Card “INSPECT IN DEPTH”
  · [en] M: Chapter three. Inspect in depth.
- **· s07** — UI→Chinese (cut) · section cut slider
  · [zh] F: 一刀切开，逐层查看，每一层楼板一目了然。  ⟶ EN: F: One cut, floor by floor — every slab in plain sight.
- **· s08** — Measure: two taps → 66.25 m
  · [en] M: Measure? Two taps. / F: Sixty-six metres, end to end. / M: Tap the same dot again, and you get an area.
- **· s09** — UI→Malay (cut) · Night on (410 lights) → Fly tour → drag its timeline slider → Alt+G denoise → refresh CUT  ★BIM KILLER
  · [ms] M: Malam pun boleh — empat ratus sepuluh lampu menyala. Jom terbang, dan tarik garis masanya.  ⟶ EN: M: Night works too — four hundred and ten lights come on. Let's fly in, and drag its timeline.
- **· s10** — Clash matrix → busiest pair ARC|STR (4,992) → list → tap one (fly to) → shift-select 12 (red dots, zoom out) → list ✕ → refresh CUT  ★BIM KILLER
  · [en] F: Clashes by discipline pair. / M: Tap one — and fly straight to it. / F: Select a range — every clash a red dot, zoomed out for the overview.
- **CH4 c4** — Card “BUILD OVER TIME”
  · [en] F: Chapter four. Build over time.
- **· s11** — Time Machine: drag to ¾ perspective → V sounds ON (only sample) → play 55-day build  ★NOVEL ART
  · [en] M: The Time Machine. The schedule comes from the model itself — / F: fifty-five days, and nothing appears before what holds it up. / M: Listen — every trade has its own sound.
- **· s11sun** — Sun on → HR mode → play → sunset (~20:00) → V off
  · [en] F: Turn on the sun, and the day runs down to sunset.
- **· s13** — Pull Back → “nothing to compress”
  · [en] M: Pull it back as early as it can go? / F: It's already there. Nothing to compress. / M: An honest answer — it won't invent a gain.
- **CH5 c5** — Card “COUNT THE COST”
  · [en] M: Chapter five. Count the cost.
- **· s15** — 4D/5D page: 6 charts
  · [en] F: Four-D and five-D — six charts, straight from the model. / M: Cost by discipline, and the schedule, side by side.
- **· s15_en_US** — Flag → US English: $ + RS Means  ★BIM KILLER
  · [en] M: Switch to US English — dollars, and RS Means rates.
- **· s15_en_MY** — Back to RM + CIDB
  · [en] F: Back home — ringgit, and CIDB rates. Language is a cost context.
- **CH6 c6** — Card “SHARE THE VIEW”
  · [en] F: Chapter six. Share the view.
- **· s16** — Share card (one link; clash share; phone, no install)  ★BIM KILLER
  · [en] F: Share the exact view — one link, camera and all. / M: Got a clash open? The share is about that clash. / F: Send it to a phone — it opens in the browser. Nothing to install.
- **· s17** — Alt+C Film-Maker → tick clashes/measures/floors/sun
  · [en] M: And it makes its own film — from the building's rooms. / F: Tick what to show: clashes, measures, floors, the sun.
- **· s17prev** — Eye → preview plays
  · [en] M: Preview it — and drag the flight itself to change it.
- **· s17clip** — Cutaway 5 s: finished Hospital film  ★NOVEL ART
  · [en] F: And here is one, finished — the Hospital, baked in the browser.
- **END ** — Thank-you round: 13 languages, UI switches (picker cut), ends English + “Free, open…”
  · [en] M: Thank you! / F: Free, open, and right in your browser.

### §8 STORYBOARD v4 — DELTA vs v3, for red1's review (2026-10-04, NOT filmed: "dont bake yet, until we get the storyboard right")
Code: `scripts/film_viewer_trailer.js` + `prompts/film_narration_viewer_trailer_dialogue.tsv` (62 rows). Recorder NOT run (no take
until red1 OKs this) — `node --check` only; every new step prints a `§FILM_FACT`/verdict line so the first take proves or disproves it.
Unchanged beats are not repeated here (see v3 above).
- **WHOLE FILM — wire guard** (v4 #1). Polls ghost/bbox shell · Nav-LOD boxes · load placeholders · X-ray every 150 ms after load; any
  hit outside an allowed X-ray beat is CUT until the mesh is back (`§FILM_WIRE_GUARD hit/clear`, `LONG` if > 3 s; total + verdict at end).
  s06's X-ray now turns off straight from X-ray — the old 2nd Alt+Z went xray→**bbox** (tools.js cycle), i.e. the wireframe itself.
- **· s05** — Find "IfcWall" → 50 found → **3 result picks**, each flies to its wall (v4: "only showed one selection")
  · [en] F: Ask for walls. / M: Fifty found, and listed — click one, and you fly straight to it.
- **· s05cat NEW** — clear the query → tap categories in the Find tree on two axes (storey, then the next axis); X-ray dims the rest
  · [en] M: Or browse by category — storey, discipline — / F: one tap, and the rest steps back.  ⚠ line checked against the take's findCat facts
- **· s05c REPLACED** — was the Terminal escape-route cutaway → now **live door-to-door path on HHS**: Find → Room → Path; room pairs
  searched inside a cut (failed pairs never show), a route with ≥ 3 doors clicked on screen, camera swung round it
  · [en] F: Door to door — pick two rooms, and the shortest route is drawn through the building. / M: Swing round it — every door it passes, in order.
- **· s07 + s07b NEW** — section cut to 35 % of the elements' real height (v3 stopped above mid — "not deep enough"), then the other
  axis (X or Z, whichever faces the camera) cut from the front inwards
  · [zh] (unchanged) · [en] s07b F: Now the other axis — cut from the front, straight in.
- **· s09 + s09v NEW** — **V on only here**; the fly's dead lead-in (key → camera first moves) is CUT, nothing cut inside the fly;
  timeline drag; Alt+G; refresh cut. V removed from the Time Machine.
  · [ms] (unchanged) · [en] s09v M: Sound on — the flight plays out loud, and the timeline drags.
- **· s11 REWRITTEN** — TM → ¾ drag → shadows on (H) + Sun on → Gantt + Dashboard drawers open → panel group dragged bottom-left, view
  panned right; **witness `§FILM_TM_LAYOUT … overlaps=0 offFrame=0 verdict=PASS`** (every visible panel's rect, no pair intersects)
  → play ~6.5 s build-up
  · [en] M: The Time Machine. The schedule comes from the model itself — / F: fifty-five days, and nothing appears before what holds it up. / M: Sun on — the shadows follow it. Gantt and dashboard, side by side.
- **· s11ff REPLACES s11sun** — day slider dragged on screen to ~95 % → drawers read complete (`§FILM_FACT tmEnd` = day + phases)
  · [en] F: Fast-forward to near the end — every phase in the drawers, filling to complete.
- **· s15tour NEW** — the 4D/5D page scrolled top to bottom (every section title logged `boqSections`) and back (v4 #3 "linger")
  · [en] M: Scroll on — cost components, workload, the S-curve, milestones, the Gantt — / F: and the full bill of quantities, priced.
- **· s15_en_US / s15_en_MY** — the RM→$→RM flips now happen inside a cut (picker never on screen, v4 #2)
- **· s16** — BUG FIXED: v3's share keypress sat inside a `//` comment, so the share card never opened in the take
- **END REWRITTEN** (red1: "just hover each while saying its lingo version of ending" + "show the lingo chosen on the UI pill icon tray
  (at the Help screen)… jump frames if need") — picker shown, cursor rests on a flag → CUT → that language's Help palette fills the
  screen while its thank-you plays → CUT → next flag. `closingHelp` fact checks each palette's placeholder is that locale's text.
  **Help palette translated** (red1: "translate the Help panel if haven't") — bim-ootb `fix/help-palette-i18n`, see S226 §R2d.
- **Still open from red1:** a soft music bed under the 2–6 s quiet visual moments, or leave them silent?

### §8 MUSIC BED + NARRATION-FOLLOWS-ACTION — SPEC (red1, 2026-10-04: "Narrations to follow animation of each task. Make jumps
where it's time consuming. Proceed with your soft music bed")
1. **Lines follow the action.** A multi-turn line that describes steps done one after another is split into sub-beats, each logged
   at the moment its step starts: s05p (first pick), s05c2 (orbit), s08a (same-dot area — now filmed, measure.js:1287), s09s
   (timeline drag), s10a/s10b (tap one / range), s11d/s11p (sun+drawers / play), s17t (ticks). Lines that described something not
   on screen are dropped (s16 "clash open → share is about that clash"). 68 rows.
2. **Jumps.** A wait that shows only a spinner is CUT via `jump()` (`§FILM_JUMP <why> waited=`): Time Machine schedule build,
   clash matrix compute, 4D/5D page open + charts, Film-Maker path derive (plus the existing fly lead-in, refreshes, language
   switches, room-pair search).
3. **Music bed** `prompts/film_music_bed.py <wav> <sec>`: synthesised pad, Cmaj7→Am7→Fmaj7→G6, 8 s per chord, 2 s cross-fades,
   detuned sines + octave-down root, slow swell, 3 s fade in/out, no drums/melody, no samples (no licence question).
   `film_narration_mux.py` `MUSIC_WAV` (+ `MUSIC_VOL`, default 0.16): the voices are the sidechain key, the bed is ducked under
   every line (ratio 10, attack 40 ms, release 600 ms). **Witness (numbers, not a listen):** `MUSIC_STEM` writes the ducked bed
   alone; its RMS inside spoken intervals (from final_plan.tsv) vs in the gaps must differ by ≥ 6 dB (`§MUSIC_DUCK`), else WRONG.

### ⏸ STANDING ORDER (red1, 2026-10-04): "After viewer, wait for my go ahead on the next, Modeller." / "BUt do the first
one we agreed on first. This big story is to rest a while" — finish §8 (Viewer trailer) end to end, then STOP. Do not
start §9 (Modeller) or §10 (documentary) without red1's explicit go.

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

### §9 STORYBOARD v1 + RECORDER SPEC (2026-10-04 — red1: "Go" on the Modeller; gate answered: "Translate the Modeller first" → done, S226 §R3, bim-ootb #1839)
One continuous take of `modeller/modeller.html` on the **Duplex** resident, GPU (`flock gpu.lock`), same pipeline as §8
(recorder → page audio → fit → cards → music bed → mix). Recorder `scripts/film_modeller_trailer.js`: the §8 helpers (cuts,
settle-before-cut, jump(), quietLang via the REAL flag button `#header-flag-btn`), and the Modeller e2e harness's OWN aiming code
(`modeller/tests/e2e_harness.js` `window.__e2e` — proj / candidates / clickPointFor / clearGround / overhead / frame, injected
verbatim from that file at run time, never re-implemented) so every canvas click lands on a raycast-verified point. Beat map:
selectors + success `§` lines from a read-only sweep of the Modeller code/tests (2026-10-04). Every number spoken comes from the
take's `§FILM_FACT` lines; lines are written number-free where the value is per-take.
DROPPED (not drivable / not on screen in the Modeller): "Duplex clashes 32 → 2" (no such counter in the app — offline witness
only), the §GC generalization table (bim-compiler node script), the 7-layer readout (no panel), the two-branch merge gate
(`teams/teams.html`, a separate page), glass (no log line to witness). Kept honest: the walk's own `gated=`/`clash=` counts.
| beat | on screen | line (lang) | success § |
|---|---|---|---|
| g_* + g_pick | boot; 13 greetings; ONE flag-picker demo → French UI | greetings · "Your language — one click." | §TRL_SWITCH / §TRL_DICT_PAGE |
| c1 m01 | card OPEN A REAL BUILDING · Open chooser (resident + FROM IFC rows hovered) | "Don't draw from a blank grid — open a real building, and edit that." · "Or bring your own IFC." | §MODELLER-OPEN chooser open=true |
| m02 | Duplex picked (load JUMPED) → Fit → outliner BOM tree + footer | "Every element is one signed operation, in a hash chain." | §ARC-SEED-WIRE … / §WALK-AFTER-SEED |
| c2 m03 | card ASSEMBLE AND DRAW · Insert: catalog → item → placed | (es) "Insertar: se ensambla desde el catálogo." | §OPLOG commit … op=GEOM_INSERT |
| m04 | Sketch 4 points on clear ground → Extrude | (zh) quip "画个轮廓，拉伸成墙。" | op=GEOM_EXTRUDE_POLY |
| m05 | pick a cuttable wall → Cut | (ar) quip "نفتح فتحة في جدار حقيقي." | op=GEOM_CUT |
| m06 | Route 3 points → Sweep Run | "Route a run — and sweep it." | op=GEOM_SWEEP |
| c3 m07 | card MOVE IT — EVERYTHING FOLLOWS · select wall → Move gizmo drag | "Move a wall — what it hosts moves with it." | §MOVE commit (+ §SDG-CASCADE if hosted) |
| m08 | outliner ⛶ room glyph → drag | (ms) "Atau alihkan sebuah bilik." | §ROOMMOVE commit |
| c4 m09 | card IT FILLS ITSELF IN · Walk ELEC | "Missing a trade? Walk it — at the spacing mined from a real house." | §DISC-WALK ELEC placed= / §DISC-WALK-COMMIT |
| m09x | X-ray on | "X-ray: the structure turns to glass, the fixtures glow through." | §MODELLER xray on |
| m10 | Route trunk · ELEC → modal → Route ▶ (animated) | "Then route the trunk, from a real entry." | §SEED-TRUNK ELEC / -ANIM |
| m11 | ▶▶ Walk ALL Services | "Or walk every missing trade at once." | §DISCWALK-ALL done |
| c5 m12 | card THE LOG IS THE TIMELINE · #hist-slider dragged back, then forward | "Drag back — every edit undone, exactly. Drag forward — all back." | §OPLOG scrub upto= |
| c6 m13 | card SAVE AND SHARE · Save | "Save checks the clashes first — then writes the snapshot." | §SAVE_GATE / §SAVE_SNAPSHOT or §SAVE_BLOCKED (said as shown) |
| m14 | Export → BCF | "Share an issue as BCF — it opens in the other BIM tools." | §BCF export |
| END | picker shown, hover each flag → cut → the Help panel in that language during its thank-you | thank-you round | per-locale placeholder/label check |

## 10. §DOCUMENTARY — Film 2: "who is building this, and why" (SPEC ONLY, 2026-10-04 — after §8 and §9 ship)
**Ask (red1, 2026-10-04, verbatim — the narration source; keep his words, fix only spelling):**
> Chapter 1. Who is building this and why. The narrative beasically begins with I am Redhuan D. Oon.. has been a fierce
> advocate of Information is Free, Yuo have to know, Contributors are Pricess, You have to be. I debut as the founding
> leader of ADempiere ERP back in 2006, but ERP and Java is so boring and i love art. And AI been evolving so fast it
> literally helped me do everything i specify right up to this movie.
> Chapter 2. When and How i started. It was just middle of last year, when a BIM engineer friend suggested to me the
> challenge of BIM. At first I tried to do a graphical UI on my own, even with Claude Code's help, it was daunting, until
> Claude suggested using Bonsai, Blender BIM back in October. It was a short blast because large IFCs crashed the app. Then
> Claude suggested extracting the IFC into an SQLite database. But we hit geometry hell due to AI been a language model thus
> physically limited. I then came out with the Roseeta Stone strategy but the greatest trick is to build layers of
> foundation meticolously where AI stitch the phyiscal reality upon. Each further hell we go thru where its past learning
> has never encountered and there are lots as many parts are prior or novel art.
> Chapter 3. What am i trying to build. WIth my vast background in ERP modelling and coding, I want to make a Spatial ERP.
> BIM is thus the best way to build a emperical 3D reality where a warehouse can be in 3D. But the AEC industry by itself is
> an ERP. A building is a Build of Material or BOM. The SQLite lets it scale alot and no more crashing but the features i
> tried to add on from 4D to 5D and sophisticated Find and Time Machine or animation is a steep learning curve trying to
> retrofit ideas at the speed of thought into a legacy though Blender which i must admit is a good stack. But the
> bottleneck is me as the AI can code at many times my speed. I have to vet and redirect the drifts that happends and
> context limits do not allow the AI to remember anything past a new session with 200 thousand token limit. Then Claude
> suggested the biggest breakthru - why not switch to entirely new model of WASM on ThreeJS and Canvas2D? That was a blast
> as we speed up many times more.
> Chapter 4. The Triolgy Vision. Now I am able to tackle my long dream of refactoring iDempiere, a legacy inherited from
> Compiere that debuted in 1999, its old Java hell which though we upgraded to the OSGi plugin GIT model is still steep with
> the new Maven hell and too much moving parts such as the Postgres Docker, 3 million lines of code and the complex Java
> monsters such as the Persistent Object Jaba. I spend since 3 years ago using ChatGPT but can not unravel it into a modern
> stack. With BIM securely wired into a foundation layer of SQLite WASM on a kernel ops PWA (Progressive Web Application),
> ERP conversion happens within days. I then set my sight onto the Modeller or authoring tool which is the domain and
> hardest moat surrounding the SAP of 3D design which is Autodesk Revit. Using the most important layer out of this journey
> namely the WITNESS debug logging wired into the codebase, Claude is able to rumble thru each novel art and prior gap.
> Thus what you are witnessing is a fast speed train rushing thru. You probably not been noticing it at human speed.
> Been the sole human author, I placed this under the most promiscous MIT License. I have trouble giving it the right
> names - OOTB, out of the box, Kernel ERP and DAGeVU and probably changed my mind. But it has been a blast, a fitting hobby
> in my retired days, but i wana leave the world with a legacy for what i been struggling for. It is my invitation to the
> rebels and misfits. Do help me continue the conversation after I am gone. At AI speeds, the conversation may end very
> soon as i lay down the final layer of deterministic, non AI inside code that has become so intelligent that it can
> update itself from obselescene.
> … make this a 2nd film documentary … Discuss the breakdown, what snapshots, clips, parts, animation recording of BIM and
> Modeller in action that is needed coherently. But let what we set out earlier to go first. Just spec this only.

**Order:** §8 Viewer trailer → §9 Modeller trailer → this. Their recordings are this film's main B-roll, so nothing is
recorded twice.
**Form:** first-person narration in red1's words, ~900 words ≈ 6 min spoken → ≈ 8–10 min with breathing room. Four
chapters + a coda, each opened by a §8-style title card (kicker "CHAPTER n", two-tone title, one line). Visuals never
illustrate a claim they can't show; where there is no footage, a title/text card carries it.
**Facts:** his story is testimony — kept as he says it. Every DATE / NUMBER on screen gets a source column like the
trailers' TSV: git history, the repos, a doc quote, or "red1's account". Found so far (2026-10-04): earliest BIM repo
`~/Projects/2Dto3D` first commit 2025-11-16 (116 commits to 2026-01-16); `bim-compiler` first commit 2026-01-25, 4,754
commits; `bim-ootb` first commit 2026-05-23, 2,185 commits on main. "Middle of last year" and "Bonsai in October" predate
those repos → shown as red1's account unless older evidence (GitHub, Bonsai sandbox, chats) is found.

| Ch | Title card (line1 / line2 · line) | Narration (his) | Footage needed — source |
|---|---|---|---|
| 1 | WHO IS / BUILDING THIS · "Information is free — you have to know." | Redhuan D. Oon; the motto; ADempiere 2006; "ERP and Java is so boring and I love art"; AI helped "right up to this movie" | ADempiere-era material (**red1 to supply**: photos, 2006 site/forum, logo use OK?) · his art, if he wants it shown (**red1**) · this very session: the recorder driving the Viewer, git log of the last 24 h scrolling (real) |
| 2 | WHEN / AND HOW · "It began with a challenge from a friend." | the BIM friend; daunting own UI; Bonsai/Blender in October; large IFCs crash; IFC → SQLite; "geometry hell"; Rosetta Stone; layers of foundation | early UI / Blender-Bonsai screenshots (**search** `~/Projects/bonsai-sandbox`, `2Dto3D`, `docs/archive`, ~/Pictures; else red1) · a crash = text card, never faked · SQL query on a real `_extracted.db` (live terminal recording) · broken-geometry frames from the archives (only real ones) · `run_RosettaStones.sh` gate table run (G1–G6 lines) · a layered diagram animating up (ffmpeg/Canvas, drawn from docs) |
| 3 | WHAT / I AM BUILDING · "A building is a bill of materials." | Spatial ERP; warehouse in 3D; AEC is an ERP; building = BOM; SQLite scales; 4D/5D, Find, Time Machine; the bottleneck is me; drift, 200K-token sessions; WASM + Three.js + Canvas2D breakthrough | Pick Walk warehouse building in the Viewer · BOM tree building→floor→room→furniture (Modeller Outliner) · reuse §8 beats: Find, Time Machine, 4D/5D · City mode 786 buildings for "scale" (dropped from §8 — fits here) · side by side: Blender-era vs browser Viewer, same building |
| 4 | THE TRILOGY / VISION · "ERP, BIM, Modeller — one kernel." | iDempiere legacy (Compiere 1999, OSGi, Maven, Postgres Docker, 3 M lines, PO); 3 years with ChatGPT; SQLite-WASM kernel-ops PWA → ERP in days; Modeller vs Revit's moat; WITNESS logging; the speed train | stack layers falling away → ERP System Monitor "No longer needed" badges (reuse the ERP tech trailer, `~/Downloads/ERP_TechTrailer_…mp4`) · `erp/` commit history by day (git, real) · Modeller walkers + history slider (reuse §9) · `§`-witness PASS lines scrolling (real logs) · "speed train": a gource-style animation of both repos' history (gource NOT installed — install needs red1's ok, else a Canvas render from `git log`) |
| coda | REBELS / AND MISFITS · "MIT. Take it further." | sole human author; MIT; the names OOTB / Kernel ERP / DAGeVu; retired-days hobby; legacy; "continue the conversation after I am gone"; deterministic, no AI inside | MIT licence text card · the three names as cards · the "No AI inside" witness line (`project_positioning_no_ai_inside`) · last shot: the front door, flag picker cycling the 18 languages |

**Open — only red1 can answer (ask when this film starts, not now):**
1. Voice: his own recorded voice (authentic; we time the footage to it), or an AI voice reading his words, labelled
   "Voice: AI · Words: Redhuan D. Oon"? A synthetic voice speaking as a real person must be labelled either way.
2. Spelling of the motto — "Contributors are **Princes**, you have to be"? (written "Pricess").
3. Personal material for Ch 1–2 (photos, ADempiere 2006 era, art) — what he can supply.
4. Language: English narration with the 13 trailer languages as subtitles, or English only?

### §10 REVISION 1 — 2026-10-04 (red1's answers to the 4 open questions; SUPERSEDES the open list and the table's narration column)
**red1, verbatim:** "1. No need to say AI voice, just 'The Three Body Problem of IT by Red1'. You may readjust the whole
narrative to make it even more flowing as i written this on the spur and may have missed important bits of the big
picture. This is a big picture film. 2. Typo. Contributors are PRICELESS.. it is from my famous 3 line mantra back in
ADempiere days - Information is Free, u have to be, Ppl are not, u have to pay, Contributors.. 3. Gather from public
resources abit, but the iDempiere snapshots can be a good backdrop about the ERP journey down memory lane as it is still
pristine similar. 4. I am thinking of the same hellos, and lingo style but weigh 70% content to English only and quirps
in other languages that listeners do not lost track but yet it usher in the communcal global spirit that i have always
been. You may even intersperce more, but giving low key phrases to other lingos. Subtitles remain throuout, mostly
English thus, but when quirps comes in both subtitles."

- **Title:** *The Three-Body Problem of IT* — by Red1. Opening credit only; no voice label (red1's decision for his own
  words and story).
- **The mantra** (red1's account; not found in public sources 2026-10-04): *"Information is free — you have to know.
  People are not — you have to pay. Contributors are priceless — you have to be."* ⛔ confirm line 1's ending: he wrote
  "you have to know" the first time and "u have to be" the second; the draft uses "know" (line 3 already ends "be").
  **Sources (2026-10-04):** red1: "it was on the red1.org website which is now in archive. And in the ADempiere wiki" /
  "in my User:red1 page there has it but the www.red1.org domain was lost but there was an archive project that stores
  everything". Found: (a) local copy `~/Projects/red1org/From Flames To Fork, Comes Freedom • View topic - Future of
  IDEMPIERE.html` — red1's own words "Information is Free, always" and "I honor and look up to contributors to call them
  'priceless'" (partial, not the 3-line form); (b) the ADempiere wiki page "Red1.org" (mirror adempierebr.com/Red1.org,
  search snippet): "Information Is Free People Are Not Contributors Are Priceless", and "on September 1st 2006 in the
  forums of Red1.org the idea of a fork was brought to the compiere community" (mirror refused connection; adempiere.com
  now 301 → idempiere.org). TO FETCH when the Internet Archive is back (it returned "Temporarily Offline" 2026-10-04):
  web.archive.org copies of red1.org and of the ADempiere wiki `User:Red1` and `Red1.org` pages — exact mantra wording +
  red1.org screenshots as Ch 1 backdrop (the forum where the fork began).
- **Public facts used** (Wikipedia "ADempiere", fetched 2026-10-04): ADempiere forked from Compiere 1 Sept 2006 after the
  community split with Compiere Inc.; SourceForge project opened 9 Sept 2006; red1 = project manager, voted leader by the
  founding council; stepped down 24 June 2010; joined Carlos Ruiz's GlobalQSS 361 / iDempiere fork May 2011.
  Compiere 1999 and "3 million lines" = red1's account (no source checked yet).
- **Backdrop for the ERP years:** real iDempiere screens (first choice: record the public iDempiere demo/test server with
  the headless recorder; else idempiere.org / wiki screenshots, credited "iDempiere — idempiere.org, GPLv2"), cross-faded
  into the Kernel-ERP clone of the same window ("still pristine similar") — the memory-lane device of Ch 1 and Ch 4.
- **Language mix:** ≈ 70 % of speaking time English (one narrator voice, red1's first person, male); ≈ 30 % short
  low-key quips in the 12 other trailer languages, each a different F/M voice — greetings, "let's go", "no problem",
  "thank you", "keep going" — never carrying a fact the listener needs. Subtitles all the way: English lines English
  only; a quip shows its native line + the English gloss under it (the `§POLY_GLOSS` path already built).
- **Why the title fits (the big picture the narration now carries):** IT has three bodies that each orbit their own
  giant and never settle together — **the business record (ERP)**, **the physical space (BIM)** and **the design act
  (the Modeller)**. Classically, three bodies have no closed-form solution; the film's claim is that one small
  deterministic kernel — one signed op-log, folded into all three — is the solution, and that a lone retired author plus
  AI, kept honest by witnesses, got there.

**§10 VOICE RULE (red1, 2026-10-04: "both narrrators talking about red1 as the 3rd person"):** BOTH F and M narrators speak
ABOUT red1 in the third person ("he", "red1", "his"), in every segment, always. red1's own first-person words appear ONLY
on QUOTE cards (on screen, signed "— red1", never voiced). A narrator's own aside ("Sounds like my family") is the
narrator speaking, not red1. Checked 2026-10-04: no narrator line in §10 speaks as red1.

**§10 PACE + REGISTER (red1, 2026-10-04: "it may run slowly this documentary.. rather technical, it is a good testimony from
me.. as we already got the earlier more trailer style"):** the trailers (§7, §8, §9) carry the fast advert register; THIS
film is the slow, technical TESTIMONY. Let lines breathe; give each NOVEL ART explainer the time it needs (40–90 s, not
20–30 s); hold red1's QUOTE cards longer (~5 s); the F/M narrators stay warm with his humour but stop chasing a beat. No
hard length cap — the earlier "≈ 9–10 min" estimate is lifted; expect ~15–25 min. Quips in other languages stay sparse.
The "fast — and furious" style lines in the segments below are softened to the slower register when the script is fitted.

**§10 DIRECTION 2026-10-04 (red1, brainstorm — "suggest technical details that are novel art.. such as in the Find panel how
it tries to analyse 3D metadata IFC to derive room dimensions towards which is a corridor, room, isolated leading to the
difficult path finding. Relate abit on its initial difficulty of things. We got the git history to remind back. The film
may replay certain parts thus saving film work while the listeners focus more on the story which the overlay titling
follows a more advertising like as the screenshot hinted"):**
- A **NOVEL ART** strand runs through Ch 2–4: each idea gets ~20–30 s — what it is, why it was hard at first, what
  finally worked — sourced from the git history + spec files (dates, commit hashes, before/after numbers).
- **Replay, don't re-film:** footage reuses the §8/§9 trailer takes and the ERP films; the story carries the attention.
- **Overlay titles are the advert layer** (§8 TITLE CARDS style, ref screenshot): per idea a kicker ("NOVEL ART 3"),
  a two-tone title, one plain line — plus a small source tag (e.g. "git · 2026-06-26") so the claim is checkable.
- **EXPLAINER DIAGRAMS (red1, 2026-10-04: "giving another screenshot to give an idea how this particular video i am
  watching does it. It animates to highlight the learning point"; ref `~/Pictures/Screenshots/Screenshot from 2026-10-04
  06-20-22.png`).** Anatomy, copied: full-frame dark plum (#160E12-ish) background, no footage · coral letter-spaced
  heading centred above ("STREAMING SPEECH GENERATION") · one row of 3–5 rounded boxes (dark fill, thin grey border),
  each = bold off-white name + one small grey line, joined by coral arrows · the box being EXPLAINED lights up (coral
  border + tinted fill) while the rest stay dim; the highlight steps along in time with the narration · persistent
  boxed chapter tag top-left, series tag top-right (as §8 cards).
  **Build:** a small HTML page per diagram (steps as data: name, sub-line, highlight cue in seconds) rendered headless
  frame by frame (deterministic, CPU — no GPU), cues taken from the fitted narration plan so the highlight lands on the
  spoken word. Used for each NOVEL ART item, e.g. *IFC file → SQLite extract → room graph from IfcSpace metadata →
  corridor / room / isolated → path through doors* (red1's Find-panel example). Box text = the idea's own terms; every
  number on a box carries its source (§ line or commit) in the spec's TSV.
- Idea list: being mined from the three repos (2Dto3D Nov 2025 → bim-compiler Jan 2026 → bim-ootb May 2026) → §10 NOVEL ART.

**§10 SCRIPT v3 — two narrators, F and M** (2026-10-04; SUPERSEDES v2's single narrator. red1: "it can retain the lively
and my often humour in same female/male dialog style"). Same F/M dialogue style as the Hospital narrated films: two
English voices telling red1's story to each other, warm, quick, a bit cheeky — his humour, never sneering. His own words
stay on screen only, as **QUOTE cards** (narrators silent ~3 s; centred off-white text, coral "— red1", dimmed footage).
**Tone (red1, 2026-10-04: "in documentary style need not be formal, 'in his own words'.. just 'his famous 3 line
mantra..'"):** casual, plain; lead into a quote naturally, never announce it.
Rows: `F:` / `M:` English narrators · `QUOTE:` on-screen only · `lang:` quip — gloss (other-language voice, low key).
≈ 1,050 EN words ≈ 7 min + cards/quotes/quips ≈ 9–10 min.

*Cold open — greetings round over the front door, flags cycling (same as §8):* en Hi · fr Bonjour · es ¡Hola! · de Guten
Tag · ar السلام عليكم · zh 你好 · ja こんにちは · ms Apa khabar? · th สวัสดี · ko 안녕하세요 · pt Olá · id Halo · bn নমস্কার
**Card:** THE THREE-BODY / PROBLEM OF IT · "by Red1"

**Prologue — card: THREE / BODIES**
F: In physics, three bodies pulling on each other never settle down.
M: Sounds like my family.
F: Information technology has three of them. The business record — that's ERP. The building — that's BIM. And design —
the modeller.
M: Each one orbiting its own giant, and never sharing a centre.
F: This is the story of the man who decided that was a solvable problem.
M: Retired, by the way. Supposedly.

**Ch 1 — card: WHO / IS BUILDING THIS · "Information is free — you have to know."**
F: His name is Redhuan D. Oon.
M: red1, to just about everyone.
F: Back in the ADempiere days, his famous three-line mantra went like this.
QUOTE: "Information is free — you have to know. People are not — you have to pay. Contributors are priceless — you have
to be." — red1
M: September 2006. A community of volunteers forks Compiere, an open-source ERP, to keep it open — and the idea is
first raised on his own forum, red1.org.
F: They call it ADempiere, and they vote him leader. Later, with Carlos Ruiz, it becomes iDempiere.
ms: *Terima kasih, kawan-kawan* — thank you, friends.
M: So, twenty years of enterprise software. Must have loved it.
F: Not exactly.
QUOTE: "ERP and Java is so boring. I love art." — red1
M: Fair.
F: Then AI showed up, and kept getting better — until it could build almost anything he could describe.
M: Including, apparently, this film.
ja: *本当です* — it's true.

**Ch 2 — card: WHEN / AND HOW · "It began with a dare."**
F: Middle of last year, a friend — a BIM engineer — dares him: try buildings.
M: And he says yes, because of course he does.
F: First he tries writing a 3D interface himself, even with Claude Code beside him.
M: Daunting. Very daunting.
fr: *Pas facile* — not easy.
F: In October, Claude suggests Bonsai — BIM inside Blender.
M: Great fun — right up until a big IFC file walks in and the whole thing falls over.
F: So Claude suggests pulling each IFC model out into a SQLite database.
M: Which works! And leads them straight into… geometry hell.
F: A language model thinks in words. Walls, pipes and slabs live in physics.
de: *Na gut* — all right then.
M: So he builds a Rosetta Stone — real buildings, decoded and checked — to translate between the two.
F: And he finds the real trick.
QUOTE: "Build layers of foundation meticulously, where AI stitches the physical reality upon." — red1
M: Every new hell is somewhere the AI's training had never been.
F: Because much of it is prior art nobody had connected — or new art nobody had made yet.
es: *¡Seguimos!* — we keep going.

**Ch 3 — card: WHAT / HE IS BUILDING · "A building is a bill of materials."**
M: So what is he actually building?
F: A spatial ERP. A warehouse you can walk through, not rows in a table.
M: Then the penny drops. The building industry already is an ERP.
F: A building is a bill of materials — building, floor, room, fixture, part — each one a recipe for the next.
th: *ใช่เลย* — exactly.
M: SQLite lets it scale. The crashes stop.
F: Then the features pile up: time in 4D, cost in 5D, a proper Find, a Time Machine, films.
M: All bolted onto Blender at the speed of thought. Good stack, mind you — he'll tell you that himself.
F: But there's a catch.
QUOTE: "The bottleneck is me. The AI can code at many times my speed." — red1
M: The AI drifts, he steers. And every new session forgets the last one.
F: Two hundred thousand tokens — then a blank page. Like a goldfish with a PhD.
ko: *괜찮아요* — it's okay.
M: Then Claude makes its biggest suggestion yet: leave the old stack. Go to the browser — WebAssembly, Three.js, Canvas.
F: And everything speeds up. Many times over.
pt: *Que maravilha* — how wonderful.

**Ch 4 — card: THE THREE / BODIES, ONE KERNEL · "ERP, BIM, Modeller."**
F: Which frees him for his oldest dream: rebuilding iDempiere itself.
M: Inherited from Compiere, 1999. Java, OSGi plugins, Maven, a Postgres server in Docker, millions of lines —
F: — and a Persistent Object layer the size of a small moon.
M: Three years he tried with ChatGPT. It would not untangle.
F: This time, the building came first. BIM on a foundation of SQLite in the browser — a kernel of signed operations, an
app that installs from a web page.
M: And the ERP conversion? Days.
id: *Cepat sekali* — so fast.
F: Then the third body: the modeller. The design tool.
M: The deepest moat in the industry — guarded by the SAP of 3D design, Autodesk Revit.
F: Bold.
M: Very.
F: What makes it possible is the most important layer of all — the witness. Logging wired right through the code, so
every claim is checked by numbers, not by eye.
M: So Claude can push through every gap, old art and new, without either of them fooling the other.
zh: *稳稳的* — steady.
QUOTE: "What you are witnessing is a fast speed train rushing through. You probably have not been noticing it at human
speed." — red1
ar: *هيا بنا* — let's go.

**Coda — card: REBELS / AND MISFITS · "MIT. Take it further."**
F: One human author. And he's put the whole thing under the most permissive licence there is — MIT.
M: He still can't settle on a name. Out of the Box. Kernel ERP. DAGeVu.
F: Ask again next week.
M: A hobby for his retirement, he says.
F: A legacy, really — for everything he's fought for.
QUOTE: "It is my invitation to the rebels and misfits. Do help me continue the conversation after I am gone." — red1
bn: *ধন্যবাদ* — thank you.
M: At AI speed, that conversation may close sooner than anyone thinks —
F: — as he lays the final layer: deterministic code, no AI inside, clever enough to keep itself from going obsolete.
QUOTE: "Information is free. People are not. Contributors are priceless — you have to be." — red1
*Closing round — every language, one word each:* thank you · merci · gracias · danke · شكراً · 谢谢 · ありがとう ·
terima kasih · ขอบคุณ · 감사합니다 · obrigado · terima kasih · ধন্যবাদ

**Edits to red1's draft, for his review (none change meaning):** told by two narrators (F/M) in third person, with
light humour lines of our own ("Sounds like my family", "goldfish with a PhD", "size of a small moon") — red1 to cut any; (his words kept as QUOTE cards,
lightly cleaned of typos only); added the Prologue to carry the title; "debut as the founding leader" → the public record
(forked Sept 2006, idea first raised on red1.org, voted leader); "3 million lines" → "millions of lines" until sourced;
"Persistent Object Jaba" → "Persistent Object layer"; "SQLite WASM on a kernel ops PWA" → plain words; "update itself
from obsolescence" → "keep itself from going obsolete"; the closing quote reprises the mantra.

### §10 DOCUMENTATION ROLL (red1, 2026-10-04: "talk abit abot the documentation - that Server is dead doc is nice to snap
and roll with a few more graphically upbeat types.. just slide roll them quickly also can to fit the general script,
'Claude helps out with fast and clear documentation on Red1's deep ERP software experience..'")
- **Where:** a ~15–20 s bridge in Ch 4, right after "the ERP conversion? Days." — the docs are the visible trail of it.
- **Hero snap (held ~2 s):** "The Server Is Dead" — docs/MigrateComparisonPaper.md (docs-site nav "Migrate & Compare (ERP)").
- **Quick roll (~1–1.5 s each, slide/pan, upbeat cut on the beat):** "Two Apps, One Kernel" one-page infographic
  (TwoAppsOneKernelInfographicLandscape.html) · "SQLite-WASM — The Trick Behind Zero Servers" (SQLiteWasmArchitectureActual.html)
  · "Times Have Changed — And So Must ISO for ERP" (AssuranceControlMap.html) · "Does your ERP age? — 20-year side-by-side"
  (age_demo.html) · "Cross-ERP Rosetta Stone" (ERPConceptRosetta.html) · "The Fold Engine Black Book" (FoldEngineBlackBook.html)
  · "Retail at Scale — Two Messages a Day" (RetailScaleStory.html) · "Glassbowl — your business, mapped" (glassbowl.html)
  · "Time Machine — 4D Competitive Position" (tm_competitive_brief.html). 58 doc pages in docs/ (md + html) today.
- **Capture:** headless CPU screenshots of the LIVE docs pages (1920×1080, top of page / hero block), rolled with ffmpeg
  pans — deterministic, no GPU. Page titles above are read from each file's `<title>` / H1 (2026-10-04).
- **Lines (F/M, same register):** F: And the paperwork? | M: Claude writes it — fast and clear, from red1's twenty years
  of ERP. | F: Comparisons, architecture, audits… | M: …one page each, every claim with a source.
  (Source column: the doc titles above; "twenty years" = ADempiere 2006 → today, public record.)

### §10 VIBE PROGRAMMING — the speed, where it drifted, where it sailed (red1, 2026-10-04: "online in github.io it is laid
out well.. also on the Vibe Programming, say abit the time multipliers range and on which was drifting bad and the one on
ERP was smooth sailing as it is out of the geometry blindspot")
- **Capture:** the LIVE docs site (red1oon.github.io/BIMCompiler, laid out well) — the doc rolls use the published pages,
  not the markdown. Page: docs/VibeProgramming.md, nav "Vibe Programming — AI + Domain Expertise".
- **The multiplier (doc's own table):** Bonsai RTree federation viewer, ~13,000 lines, 1,063,911 elements — "~3 weeks"
  Claude-assisted vs "6–9 months" expert team / "12–18 months" single senior / "9–12 months" outsourced
  → **≈ 9× to 26×** (derived: 6 mo ≈ 26 wk ÷ 3 wk ≈ 9; 18 mo ≈ 78 wk ÷ 3 = 26 — say "about ten to twenty-five times",
  name it as our arithmetic on the doc's estimates). Second ruler: the ERP fold's code ratio "89×, 76×, 51×, now ~26×"
  (TwoAppsOneKernel.md — falls as real coverage grows; "not feature parity").
- **Where it drifted badly — geometry:** the doc's rule: "LLMs extrapolate well from established patterns. They
  hallucinate when there is no pattern to follow" — spatial reasoning (does a wall sit on a slab, do two columns
  overlap) has no framework precedent → the drift points (LAST_MILE_PROBLEM.md). Live example: a 4D lane "produced three
  retractions of the same finding in one session" (VibeProgramming.md Capability Snapshot 2026-08-27; 4D_MODEL_INTEGRITY.md).
- **Where it sailed — ERP:** iDempiere's tables, AD_Val_Rule and BOM explosion are "20 years of open-source ERP code in
  training data" (VibeProgramming.md table) — out of the geometry blind spot. Evidence: the Kernel ERP got its own
  `erp/` home in bim-ootb on 2026-06-02 (#88); June 2026 = 243 ERP commits (Jul 37 · Aug 6 · Sep 27 · Oct 19, git log
  origin/main -- erp, counted 2026-10-04); and four months on, ten ERP PRs in one day (bim-ootb #1820–#1829, 2026-10-03,
  FS-12…FS-19 + 9 UI languages). Say it as: "built in June — and still shipping ten features in a single day."
- **Lines (F/M):** F: How fast is fast? | M: One viewer — three weeks. The estimate for a hired team: six months to a
  year and a half. | F: Ten to twenty-five times. | M: But not everywhere. Ask a language model whether a wall sits on a
  slab… | F: …and it guesses. No pattern to copy. | M: Geometry drifted — the same finding retracted three times in one
  session. | F: The ERP? Smooth sailing. Twenty years of iDempiere it had already read. | M: Built in June — and still shipping ten features in a single day.
- **Visual:** an explainer diagram (§10 EXPLAINER) — two lanes side by side, GEOMETRY (no precedent → drift → witness)
  vs ERP (pattern → fold → ship), highlight moving with the lines; then the live VibeProgramming page rolled.

### §10 TWO ENGINES OF SPEED — model leaps + the WITNESS layers (red1, 2026-10-04: "yes this recent spate was fast and
furious" / "it is growing faster.. and the key was both Anthropic AI leaps in models and user ingrained WITNESS layers")
- **Model leaps, dated from the repos' own "Co-Authored-By: Claude …" lines (first appearance · commits carrying it,
  bim-compiler / bim-ootb, counted 2026-10-04):** Opus 4.5 2026-01-25 (81/–) · Opus 4.6 2026-02-06 (1,540/297) ·
  Sonnet 4.6 2026-02-20 (307/171) · Opus 4.8 2026-05-29 (869/794) · Fable 5 2026-06-11 (506/126) · Sonnet 5 2026-07-02
  (1,248/424) · Opus 5 2026-07-25 (1,130/807) · Fable 5.1 2026-09-04 (40/76) · Opus 5.5 2026-09-23 (566/512) ·
  Sonnet 5.5 2026-09-30 (27/25).
- **Commits per month (bim-compiler + bim-ootb main):** Jan 27 · Feb 308 · Mar 796 · Apr 528 · May 988 · Jun 1,324 ·
  Jul 1,535 · Aug 1,193 · Sep 1,255.
- **WITNESS layers:** the Witness System began 2026-01-30 (BC `df1ea1953`, 7 claims); today 766 witness files
  (bim-ootb 647, bim-compiler 119). The VibeProgramming Capability Snapshot (2026-08-27) is the honest counterweight:
  "What changed was the working pattern, not the model" — both engines matter, neither alone.
- **Outside credence (red1, 2026-10-04: "yes to give credence to the vibe assistance that red1 taking advantage of"):**
  METR, "Measuring AI Ability to Complete Long Software Tasks", 2025-03-19 (Thomas Kwa, Ben West, Joel Becker + 21;
  metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/, fetched 2026-10-04). Verbatim: the length of
  tasks "that generalist frontier model agents can complete autonomously with 50% reliability" — "has been doubling
  approximately every 7 months for the last 6 years"; 2024-2025 data alone "shortens the estimate of when AI can
  complete month-long tasks with 50% reliability by about 2.5 years". ⚠ Do NOT say "every 4 months" (not in the source
  text). Line: F: One independent study measured how long a task an AI agent can finish on its own. | M: It has been
  doubling about every seven months — for six years. | F: That curve is what red1 is riding. Source tag on screen:
  "METR · 2025-03-19". Our own repo numbers show the effect, not the exponential (commits plateaued ~1,200–1,500/month
  since June) — never present them as proof of the curve.
  **Citation snapshot (red1, 2026-10-04: "and u can snapshot those citation if it has nice graphics.. with overlay
  quotes"):** capture the METR page's headline chart (task length on a log axis vs model release date) with a headless
  CPU screenshot of the LIVE page at production time — the chart region only, uncropped labels, unaltered. On screen
  ~5 s, dimmed ~20 %, with the overlay quote in the §8 card style ("has been doubling approximately every 7 months for
  the last 6 years") and a permanent credit line bottom-left: "Chart: METR, 'Measuring AI Ability to Complete Long
  Software Tasks', 2025-03-19 · metr.org". Same treatment for any other cited source that has a strong graphic
  (one image per source, credit always visible, no edits to the figure). Record the capture date + URL in the TSV.
  **Correlation callouts (red1, 2026-10-04: "corelate with a pointed bullet to show 'this is where a sudden jump in
  red1's project happens.. thanks to this.. he could then figure out..'"):** NOT drawn on METR's figure (that would alter
  a cited source) — on OUR timeline (the two-engines chart), shown right after METR's. Each callout = a pointer bullet on
  the date + one line; wording "right after <model> arrived, red1 could…" — correlation, never "because" (the record
  shows timing, not cause). Callouts (all dates from git; see the lists above):
  · 2026-02-06 Opus 4.6 → commits 27 (Jan) → 308 (Feb) → 796 (Mar); Rosetta Stones 100 % positional 2026-02-15.
  · 2026-04-18/20 browser pivot (Opus 4.6 / Sonnet 4.6 era) — no .blend, sql.js WASM in a tab.
  · 2026-05-29 Opus 4.8, 2026-06-11 Fable 5 → signed op-log live 06-01, Kernel ERP home 06-02, 243 ERP commits in June.
  · 2026-07-02 Sonnet 5, 2026-07-25 Opus 5 → July commit peak 1,535; 276 new witness files in July.
  · 2026-09-23 Opus 5.5 → ten ERP PRs on 2026-10-03; in-place 13-language Viewer + this film (2026-10-04).
- **Visual:** an animated timeline — monthly commit bars rising left to right, model names dropping in as pins on their
  first-commit dates, and a witness-file counter ticking up underneath (rendered headless from the numbers above, CPU).
- **Lines (F/M):** F: Why did it keep getting faster? | M: Two engines. The models kept leaping — ten Claude versions
  across these repos since January. | F: And the witnesses. Seven-hundred-and-sixty-six of them now, one per claim. |
  M: The model brings speed. | F: The witness keeps it honest. | M: Fast — and furious.

### §10 THE PLAYING FIELD — "the dinosaurs and the writing on the wall" (red1, 2026-10-04: "even taking spats from the
industry plating field.. how the giants dinosaurs not aware of this writing on the wall")
- **Register rule:** this is red1's VIEW, told as testimony — the "dinosaurs / writing on the wall" line is a QUOTE card
  signed red1, never a narrator fact. Narrators state only facts already sourced in red1's own docs, with their refs.
- **Sourced material (quote, don't paraphrase upward):**
  · StrategicIndustryPositioning.md:36-39 — "Autodesk solved it behind a proprietary wall. Revit's .rvt keeps full spatial
    fidelity internally, but is editable only in Revit with a shelf-life tied to Autodesk's support cycle [6]. Leave via
    IFC and 'there's always loss of data… all constraints are lost and component parametrics are gone' [7]."
  · StrategicIndustryPositioning.md §landscape — Tier 1 incumbents (Revit, ArchiCAD, Tekla) "create IFC… They do not
    decompose it into a BOM recipe, compile from intent, or verify the round-trip."
  · MANIFESTO.md:683-687 — Autodesk SVF/SVF2 internally; buildingSMART–AOUSD liaison Oct 2024; and the gap "neither side
    addresses": "a construction budget is separated from a 3D model by a human with a spreadsheet."
  · MigrateComparisonPaper.md — "The Server Is Dead" (the ERP side: the server stack no longer needed).
- **Lines (F/M, slow register):** F: Meanwhile, the giants. | M: The design side lives behind a proprietary wall — leave
  it, and the constraints are lost. | F: The ERP side still assumes a server room. | M: And between the budget and the
  model… a person with a spreadsheet. | QUOTE: "The dinosaurs can't see the writing on the wall." — red1 (⛔ red1 to
  word his own line) | F: Here, the model and the money are one database, in one browser tab.
- **THE THESIS (red1, 2026-10-04: "yes the strongest FOSS spirit if to open up from info hiding which makes the industry
  slow rather than a guestion of fee or free lunch.. it is always the freedom to innovate that happens elsewhere"):** the
  segment's point is NOT price — it is information hiding. QUOTE card (his words, typos only): "The strongest FOSS spirit
  is opening up from information hiding — that is what makes the industry slow. It was never a question of fee or free
  lunch. The freedom to innovate always happens elsewhere." — red1. Echo, same man ~16 years earlier, from red1.org
  (local copy `~/Projects/red1org/From Flames To Fork, Comes Freedom • View topic - Future of IDEMPIERE.html`):
  "Information is Free, always, and thus no information hiding has and will occur." → closes on the mantra's first line.
  Narrator bridge (F/M): F: So is it about price? | M: Not really. It's about what's hidden. | (quote card) | F: And the
  innovation goes where the information is open.
- **Visual:** the positioning doc's tier table rolled from the live docs site; an explainer diagram: three islands
  (DESIGN · BIM · ERP) with a "spreadsheet person" bridge → collapsing into one box (the kernel).
- **Care:** no claim about any company beyond what the cited refs say; no logos/branding on screen (names in text only).

### §10 NOVEL ART — candidate list (mined 2026-10-04 from 2Dto3D + bim-compiler + bim-ootb history; read-only research)
Each: idea · the first struggle · the breakthrough (source) · what to show. Pick ~7 for the film; each = one explainer diagram.
1. **Rooms + paths from walls and doors** — "An IFC file says where the walls and doors are. It does not say how to walk
   from one room to another." First: BC `92c6a716f` 2026-04-29 [S233] (2 m grid + A*). Trials (ROOM_PATHING_SUBSTRATE §5
   "every way we got it wrong"): doors claiming 3–4 rooms, 16–38 corridor fragments, outdoors flooding in (1,094 m² vs a
   134 m² spine), a "best result" that was 104 % phantom atrium voids, rotation read as degrees. Breakthrough: spine +
   attachment, BC `3cdd378aa` 2026-08-02 — unroutable 45.3 % → 18.4 %. Room-type classifier (size + aspect + doors)
   `41e1347de` 2026-07-11: 21/23 on labelled rooms, 62.8 % of 602 unseen rooms honestly "unclassified". Sparse walls:
   HHS 14 → 105 rooms (PR #732). SHOW: Find rooms → A* polyline, spine raster, before/after %.
2. **IFC → SQLite + geometry hell** — TRUE ORIGIN in the Bonsai days: red1's IfcOpenShell fork `~/IfcOpenShell`
   (github.com/red1oon/IfcOpenShell, branch `feature/IFC4_DB`, the Federation module inside Bonsai/Blender; 415 commits
   by red1, 2025-10-21 → 2026-04-20): `c6e50b64c` 2025-10-21 "Add Federation module - multi-model spatial indexing" →
   `c861f61f5` 2025-10-25 "Fix critical scale bug (1000x error)" → `f410e32a1` 2025-10-30 "Full IFC4 database extraction
   and loading - MILESTONE". Then the 2D repo 2025-11-16: "Fix Blender viewport blank — coordinate normalization",
   a terminal that became 5.4 km × 3.3 km (mm vs m), R-tree unit flips; BC `9b431a243` 2026-06-23 an 8.6 m-tall slab +
   a witness that was a tautology. Browser pivot: BC `66fc9413` 2026-04-18 (no .blend) → `7a19d6e2` 2026-04-20 (sql.js
   WASM). SHOW: the km-scale building, a load, the schema diagram.
3. **Rosetta Stones** — BC `f970f1477` 2026-02-12: 14 rules from 3 real buildings, SampleHouse 26 % / Duplex 36 %,
   766 pipe-in-wall overlaps → `355c87deb` 2026-02-15 all 3 at 100 % positional (< 50 mm) via float32-exact extraction.
   SHOW: G1–G6 gate run, the 26 % → 100 % ladder.
4. **A building is a BOM** — BC `eb0ddb9f5` 2026-02-11; "51,000 elements → ~700 BOM lines (73× compression)"
   (unified_mathematical_formulation.txt). SHOW: BOM tree beside the model.
5. **Walkers fill missing trades from measured rules** — docs/ModellerGuide.md "Why the right standard matters";
   gated irreducible clash residual, large-complex → residential standard: SampleHouse 9 → 4, Duplex 32 → 2,
   SampleCastle 501 → 3 (`build/logs/witness_disc_walk_duplex_generalize.log` §DXG-GATED, 2026-06-28 02:31 — the
   ACCURATE figures, red1 2026-10-04: "Use the more accurate stats"); unseen buildings 0 fabricated joins (precision
   Duplex 0.969 … HHS 0.620). Pre-history 2D `a8a0fb1` 2025-11-16 "5,282 automatic adjustments on Terminal 1".
   **⏳ RECONCILE LATER (red1: "make note … to reconcile later"):** a different table — SampleHouse 2,235 → 11, Duplex
   3,172 → 37, SampleCastle 360 → 1, "99.5/98.8/99.7 %" — sits in docs/ModellerGuide.md on the UNMERGED branch
   `lane/benchmark-clash-resolution` (BC `5afdf00e6`, 2026-06-28 00:42, two hours BEFORE the log run that master's
   numbers match; that branch's RESUME_DX_MEP_RESIDENTIAL_STANDARD.md mentions a §DXG-CAP 6000/disc stride cap, so it
   may be a different run). Never narrate the 2,235/3,172 set; if that branch is ever merged, its table must be re-derived
   from a fresh §DXG run first.
6. **4D: nothing before what holds it up** — bim-ootb `bcec6706` 2026-08-12 §MIDAIR_REPAIR 5,561 → 0 across 7
   buildings / 266,954 elements (HHS 156 → 0). Struggle (4D_MODEL_INTEGRITY.md): "S supports T" implemented three
   ways (1,961 vs 95), "63 uncountable was really 10", a template path "shipped, witnessed and NEVER CALLED". SHOW:
   Time Machine + the 7-row table.
7. **Time Machine** — BC `866bceb60` 2026-05-11. SHOW: scrub/reverse.
8. **One signed log for ERP + BIM + Modeller** — kernel_ops BC `afed96c59` 2026-05-09; signed ops live bim-ootb
   #79 2026-06-01; prior-art record docs/ModellerKernelFold.md 2026-06-18. TwoAppsOneKernel: 1,662,512 → 107,550 LOC
   (~15.5×; "not feature parity"). SHOW: Verify-ledger pill, undo/branch, the LOC infographic.
9. **Find → film** — "find to film… will also validate the path" (CINEMA_FIND_TO_FILM.md 2026-07-29). SHOW: Film-Maker.
10. **Escape routes from the same room graph** — room_graph.js: "every one of its 9 edge kinds exists because a
    specific real building broke the previous assumption". SHOW: Escape Route Reveal (2026-09-20).
11. **WITNESS** — BC `df1ea1953` 2026-01-30 "[PHASE 31] Witness System"; NO_AI_INSIDE_WITNESS 2026-10-02. SHOW: § log,
    red → green.
12. **Honest refusal** — REFUSE / UNCLASSIFIED / 972 orphans printed, never guessed. SHOW: a refusal line.
13. Red Pill (design from a trusted building's grammar) · 14. hash-addressed two-DB split (85 % draw-call cut,
    `9cca45a3` 2026-04-27) — secondary.
**Timeline:** Oct 2025 IfcOpenShell fork — Federation module in Bonsai, the 1000× scale bug, IFC4 → SQLite milestone · Nov 2025 2Dto3D (DXF→3D, unit saga) · Jan–Feb 2026 compiler, Witness, Rosetta 100 % · Apr 2026 browser
pivot, Find & Navigate · May 2026 kernel_ops, Time Machine, bim-ootb · Jun signed log, fold prior art, walkers ·
Jul–Sep room classifier, spine 45.3 → 18.4 %, MIDAIR 5,561 → 0, Escape Route · Oct 2026 this film.
Repos in order (red1 2026-10-04: "IfcOpenShell fork was during the Bonsai days. It is in the earliest repo before
BIM-compiler, BOM-OOTB, as it is under IfcOpenShell clone as a Federation feature"): ~/IfcOpenShell (Oct 2025) →
~/Projects/2Dto3D (Nov 2025) → bim-compiler (Jan 2026) → bim-ootb (May 2026).

## 4. STATUS
- 2026-10-04 16:40: §MODELLER-TRAILER v1 BUILT — `~/Downloads/BIM_Modeller_Trailer_v1_13languages_1920x1080_24fps_2026-10-04.mp4`
  (144.8 s, 20.9 MB, −17.4 LUFS; mobile copy `…_v1_mobile_720p.mp4`). Gate first: Modeller i18n (S226 §R3, bim-ootb #1839) +
  picker-in-viewport fix found by take 1 (§R3a, #1841). Take2 (`scripts/film_modeller_trailer.js`, Duplex, GPU): 9/9 language
  switches (§TRL_DICT_PAGE each), signed edits GEOM_INSERT/EXTRUDE_POLY/CUT/SWEEP + §MOVE + §ROOMMOVE (members=4), ELEC walk
  placed=102 → trunk served=94/refused=8, Walk ALL placedTotal=177 (4 trades), slider 80 scrub steps (514 ops ↔ 129), Save
  BLOCKED red=463 (said as shown), BCF exported (Duplex.bcfzip), closingHelp 13/13 ALL TRANSLATED, 0 PAGEERR. Fit 49/49 DETAIL,
  0 wrong tones, gloss 29/29; 6 cards + 5 badges (FILM_SET=modeller); §MUSIC_DUCK 12.1 dB PASS; silences ≥ 2 s: 0.
  Known gap (not witnessed): panels the i18n harvest never opened (Insert catalog `#ins-panel`, Seed-Trunk modal) may show
  English under a quip language — second batch through W-MODELLER-I18N when red1 reviews. Dropped beats + reasons: §9 STORYBOARD v1.
- 2026-10-04 13:30: §VIEWER-TRAILER v4 BUILT — `~/Downloads/BIM_Viewer_Trailer_v4_13languages_1920x1080_24fps_2026-10-04.mp4`
  (278.0 s, 84.7 MB, −17.9 LUFS). red1 go: "Narrations to follow animation of each task. Make jumps where it's time consuming.
  Proceed with your soft music bed". Take8 (8 takes; each fixed a real recorder fault found in its log): 52/52 clicks on target,
  0 PAGEERR, wire guard 4 hits / 6.7 s cut, `§FILM_TM_LAYOUT overlaps=0 offFrame=0 PASS`, closingHelp 13/13 ALL TRANSLATED,
  wall picked on screen (Info panel, Spanish UI), room path 7 doors, 416 lights, 55 days, 6 charts. Fit 68/68 DETAIL, 0 wrong
  tones, gloss 28/28; 6 cards + 8 badges + 1 cutaway (Hospital). Music bed `film_music_bed.py` (Cmaj7→Am7→Fmaj7→G6 pad)
  ducked: `§MUSIC_DUCK duck=11.3dB PASS`. Silences −40 dB ≥ 2 s: 0 (v2: 10). Take faults fixed on the way: Malay UI after F5
  (locale restored), result list collapses after a pick, legacy Find accordions are hidden, empty storey tree, X-ray left on
  into Ask, TM panel over #tm-pinpoint, wrong canvas for drags, 55 s wall-pick search (now a cut), 2nd click deselects,
  jumps/refreshes before the previous line's hold, wall-clock holds shortened by guard cuts. Line changes from the takes:
  measure/area numbers vary per take → not spoken; lights 410→416; load 6–14 s → no seconds spoken; s04 "one click" (any element).
- 2026-10-04 08:55: §VIEWER-TRAILER v2 BUILT — `~/Downloads/BIM_Viewer_Trailer_v2_13languages_1920x1080_24fps_2026-10-04.mp4`
  (220.9 s, 58.7 MB, −16.9 LUFS). red1's v2 notes applied: greetings voiced back to back at the start (no red-pill line,
  no per-greeting UI switch) + ONE picker demo; building kept SOLID (pick's shell ghost turned off via toggleGhostXray —
  Alt+X was merged into Alt+Z), orbit drag + zoom after load, floor via a Find category tap; Night + Fly live with Alt+G
  denoise then F5 (6.3 s cut out cleanly, clock + capture re-armed); clash pair from §CLASH_MATRIX_COUNT (ARC|STR 4,992)
  → tap one (fly-to) → shift-range 12 (red dots + zoom out); Time Machine scrub + sun on, HR mode 08:00→20:04 sunset;
  Ask (largest rooms 14 / counts 6,880) + Terminal escape-route cutaway (HHS room graph has 0 exits); Film-Maker ticks
  (clash/measure/floors/sun) + Eye preview, then the finished Hospital clip. Take vv6: 53/53 clicks, 0 PAGEERR; fit 55/55,
  0 WRONG, gloss 28/28; 6 cards + 8 badges + 2 cutaways. Silences ≥ 2 s: 10, max 6.5 s — all on visual payoffs (Ask
  answers, X-ray, fly, sunset, preview, Hospital clip). Recorder bug fixed: Playwright's 30 s auto-wait on the share card.
- 2026-10-04 07:43: §VIEWER-TRAILER v1 BUILT — `~/Downloads/BIM_Viewer_Trailer_13languages_1920x1080_24fps_2026-10-04.mp4`
  (237.75 s, 5,706 frames @24, 42.5 MB, −16.8 LUFS). One take, HHS_Office_Federated, GPU (`flock gpu.lock`; the other
  sessions gave way on request). Recorder `scripts/film_viewer_trailer.js` (take vfinal2: 66/66 clicks on target,
  0 PAGEERR), script `prompts/film_narration_viewer_trailer_dialogue.tsv` (52 rows, 13 languages, ~70 % English),
  fit 52/52 DETAIL, 0 WRONG tones, English gloss 30/30, cards `prompts/film_title_cards.py` (6 chapter cards on Alt+S
  stills + 8 NOVEL ART / BIM KILLER badges). Fonts: every script found its Noto face (fontselect lines). Silences
  −40 dB ≥ 2 s: 14, max 5.0 s (most in the greeting round 4–38 s = flag-picker clicks) — tighten in v2.
  Bugs the recorder found + FIXED live on the way: bim-ootb #1833 (in-place switch; 4D pill title), #1834 (rail flag
  picker closed itself), #1835 (highlight threw arr.map — §R10-MAP-SHADOW). Next version notes: §8 NEXT VERSION.
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

## 11. §HIGHWAY-FILM — narrated JELAPANG highway film (DRAFT script, 2026-10-05; film lands ~3 h later)
**The ask (red1, 2026-10-05, verbatim):** *"we did audio narration with main chapters over a selected movie … in 3 hrs the
highway movie will land and u can prepare a script to narrate it well. Same female/male dialog, with about 5 languages greet
and end only. In between full english with transcribed captions. Explaining how Civil works is reuse fully the same BIM
compiler model that is used for buildings successfully. Talk about the 4D 5D, clash analysis.. and anything important we have
gone thru. Note to audience that this IFC set is less the actual terrain coming soon. Relate the difference in disciplines and
some technical explanation how delicate our SQLite WASM on ThreeJS local first is proving itself. Touch on the pending roadmap
and the playing field still lacking in such good one stop app that Red1 here will be overcoming easily it seems. IT is exciting
to overcome those challenges."*
**Script:** `prompts/film_narration_jelapang_highway_dialogue.tsv` — 25 rows (6 greet + 13 English body + 6 farewell),
PLAYBOOK A format (`id cue_s end_s §source SHORT DETAIL`), F asks / M explains; greet/bye rows carry `lang=` in the source
column (en, ms, zh, th, ar, fr — Malaysia's languages + two neighbours/reach; swap freely). Body = 501 words over 186 s
(2.7 w/s — dense: the fit will drop some rows to SHORT; trim DETAIL first, PLAYBOOK step 3).
**Cues are a PLAN, not measured:** written against the §ALTC_HIGHWAY natural plan (JELAPANG, 206 s: approach 0–57 · junction
spin 57–63 · drive 63–164 · pull-back 164–198 · orbit 198–206; `§CINEMA_PACING` in witness_altc_highway). When the film lands:
1. Copy the bake's page log beside the film; read `§CINEMA_BEATS` (fractions) × `ffprobe` duration → re-time every row so
   approach rows sit in dive, `junction` on the spin, body rows on the drive, `roadmap`/`field` on the pull-back, bye on orbit.
2. RE-CHECK every number against THAT log/DB (sources column names the § line): lamp heads/strays (`§NIGHT_CIVIL_LAMPS`),
   junctions (`§CIVIL_ROUTE_JUNCTION`), route length (`§ALTC_HIGHWAY lenM`), element counts (baked DB), any 4D day count
   (`§CREW_DAY_CLOCK`/`§CPM_RUN`) — only speak a 4D/5D number the bake log prints.
3. **Mixed-language gap:** `film_narration_fit_edge.py` voices ONE language per run and `film_narration_mux.py` muxes ONE tag.
   Plan: body rows → Kokoro (`fit_kokoro_v3.py`, tag `hw_en`); greet/bye rows → one Edge run per language on a 2-row TSV
   each (tags `hw_ms`, `hw_zh` …); then extend mux to take several `<tag>_plan.tsv` (concatenate plans + .ass dialogue lines,
   each clip keeps its own cue) — small change, witness = frames == source, silencedetect gaps, ebur128 −16 LUFS, the .ass
   carries every row's own-language caption (Noto CJK / Thai / Arabic RTL fonts per PLAYBOOK table).
4. Register: `field` row = sourced fact (§10 Tier-1 line) + red1's own ambition in his words; no claim about any company.
8. **Framing (red1 2026-10-05):** *"On the narrative explain that this is civil works making its debut and a test that the BIM
   Compiler concept can work for any construction discipline. There are quirks due to category changes but once aligned they fall
   in reusing the proven track for buildings."* → `open` (debut + test of "any construction discipline") and `proxies` (quirks =
   category changes → once aligned, the proven building track). Same rows, same cues; the "buildings don't notice" line gave way.
9. `fourD` row (red1 2026-10-05: *"So this explains away any mishap in the early part of buildup"*): says it openly — lamps up first
   = debut quirk (merged bridge → building Z-band rule, CIVIL_HIGHWAY_JELAPANG.md 2e), road order comes next. Keep ONLY if the
   bake's own §GANTT/§CIVIL_PHASE lines show the same (a road-only bake takes the civil order and this line must go).
10. `fourD` row, JSON templates (red1 2026-10-05: *"And how the JSON template can be edited by users to correct them later"*):
   MEASURED in code — Settings › Edit Project JSON registry (panels.js:2217) = Corporate, Grid Rules, Clash Rules, Civil Labels,
   ERP Globe Bubbles, Sound Effects (editable) + 4D Schedule (read-only). 4D_template.json and sequence_rules.json are READ with a
   Settings override key (json_4d_template / json_sequence_rules) but are NOT in the registry, so no user can open them there;
   4D_template_civil.json is a plain fetch with no override. Narration says: road labels + clash rules editable today, "the 4D
   templates join them next". To make it present tense: 3 registry rows + route the civil template through
   loadJsonWithOverrides('json_4d_template_civil') — not done (needs user go; touches Settings for every model).
6. `field` row (red1 2026-10-05: *"say a line that we be expanding our Modeller concept to civil works construction too! That
   is said to be very difficult. Put this before that last line of red1 welcoming the challenge"*): Modeller → civil works line
   sits just before the closing "Red1 set out to close… welcomes the challenge" line; it is red1's stated PLAN, voiced as a plan.
   Row widened to 181–198 s (roadmap 164–181).
7. **Chapter cards (red1: "use the beautiful Chapter by chapter theme nice font layout as in the last movie"):** same anatomy as
   §8 TITLE CARDS via `FILM_SET=highway prompts/film_title_cards.py` — 6 chapters (ONE COMPILER / ROADS TOO · READ THE /
   DISCIPLINES · DRIVE / THE ROAD · CHECK / THE CLASHES · TIME AND COST / ON THE FLY · LOCAL FIRST / AND WHAT NEXT), series tag
   "BIM OOTB · CIVIL", 4 badges keyed to rows proxies/clash/onthefly/tech. Inputs from `prompts/film_highway_chapters.py
   <tsv> <film.mp4> <dir> [still ...]` (chapter log from the TSV cues; backdrops = red1's two road Alt+S stills cycled — red1:
   "u may use 2 stills back i saved as backdrop for the chapter paging": c1/c3/c5 bounce_still_1791178512975.png (13:35,
   2776×1440), c2/c4/c6 bounce_still_1791175762627.png (12:49, 1482×768); no stills → frames of the film itself). DRY RUN on a 206 s placeholder: §HW_CHAPTERS chapters=6 · §CARDS video rc=0 ·
   badges 4/4 · 35 ass events · output 206.0 s. Then film_narration_mux.py burns carded.ass (PLAYBOOK §8 PIPELINE).
5. `onthefly` row (red1 2026-10-05: *"say also how most of the tasks and analysis here are on the fly including this movie.. it is
   just a minute to setup due to computed data"*): the "about a minute" is red1's statement, voiced as his ("says Red1"); the
   on-the-fly facts behind it are § lines (4D generated at open, film path derived, lamps from mesh). RE-CHECK in the bake log
   that the film's plan came from §ALTC_HIGHWAY (derived, not hand-authored) before keeping "even this film's path".
**Facts used (all from this session's § lines / DB reads, CIVIL_HIGHWAY_JELAPANG.md):** 7 IFCs Civil 3D 2024 IFC2X3, all
IfcBuildingElementProxy · discipline from file name (§CIVIL_DISC) · JELAPANG 5,674 (ROAD 4,008 · FURNITURE 1,011 · LIGHTING 227
· DRAINAGE 200 · SIGNAGE 138 · MARKING 90) + bridge VBC 4,739 = 10,413 · EARTHWORK IFC 0 elements (terrain TIN skipped) ·
lamps 227 → 172 columns / 223 heads / 9 buried strays · signals 5 stops → 2 junctions · clash DRAINAGE×ROAD 23,288 box →
1,852 mesh-true · civil 4D phases (SEQUENCE_CIVIL) + civil crews · 5D rates pending (never invented) · 21,957,746 verts;
661,573,632 → 395,710,464 bytes after §MESH_SLIM (user's own save) · roof pass 16,132 → 22 ms.

### §11.v2 — v2 road film baked + narrated (2026-10-06; user: "Complete a film and then apply your probable script")
- **Film:** `~/Downloads/BIM_JELAPANG_v2.mp4` — cli_silent_bake.js, bim-ootb main @ #1882 (sw v1573), JELAPANG_AFTER.db,
  override = `A.civilDriveRoute()` (29 waypoints, the film's own seed — the DB has no saved path), `--buildup --reveal --label
  --clash --measure --gpu real --fps 15 1852×960`. Log beside it: `BIM_JELAPANG_v2.log`. 1,740 frames, all converged, 74 MB,
  1,596 s wall (0.64–0.70 s/frame). Plan 112.0 s + a 4.0 s load-path freeze at 56.0 s (`§LOADPATH_HOLD_INSERT framesInserted=60`)
  = 116.0 s. Log confirms the session's work live: §ALTC_V2 (reversed seed, junction pivot r 67.5 m), §CHAINAGE_LEVELS,
  §ROAD_PANELS 3 cards (counts / check / planned at 29.5 / 37.5 / 48.5 s), §ROAD_CHECK_FILM 302 rows (20 valid / 282 speculative),
  §RULE_FILM VACUOUS (road), §CIVIL_LAMP_GLOW_DAY visible=0 (ghost fix).
- **Script:** `prompts/film_narration_jelapang_highway_v2_dialogue.tsv` — 24 rows (6 greet · 12 English · 6 bye), body 2.2 words/s
  (v1 2.7–3.2). Numbers re-checked against THIS bake log: lamp heads 223 (§NIGHT_CIVIL_LAMPS), clash = the film's own set
  `§CLASH_NARROWPHASE pair=film broad=1011 meshTrue=138` (v1's 1,852 was the whole-model count — replaced), junction 5 heads
  (§ALTC_V2), route 2,110 m (§ROAD_PANELS routeLenM). Dropped: v1 `fourD` "lamps up first = debut quirk" (lamps-before-pavement is 0).
- **Mixed languages solved:** `prompts/film_narration_merge.py` merges the Kokoro English run + one Edge run per language into
  one plan + one .ass (per-run F/M styles keep their fonts). Fit: 24/24 DETAIL, 0 WRONG tones.
- **Cards:** `FILM_SET=highway2` (film_title_cards.py) + v2 map in film_highway_chapters.py — chapters at 0.0 / 9.6 / 60.0 / 73.6 /
  87.2 / 100.7 s (clear of the data cards), backdrops = red1's two road stills; 5/5 badges (adds "Road checks shown as formulas —
  valid or speculative").
- **Output:** `~/Downloads/BIM_JELAPANG_v2_narrated_AFTER.mp4` — witness: frames 1,740 = source · longest silence 7.5 s ·
  −16.9 LUFS · fontselect Noto Sans Arabic / CJK SC / Thai + DejaVu.

### §11.v3 — assembled clip-series highway film, narration extols what compilation gives (2026-10-06)
User: *"narrative this time extols what the compilation can give, at least in theory"* · no load-path freeze · show the 4D5D page and
the compliance mock-up · *"Show the underpass bridge works"* · *"More such cinematic clips of respective parts to assemble"* · *"need
not do Reveal, just remain full build all the way"* · *"replace the words Jalan Jelapang, with 'A Malaysian Highway'"*.
- **Bakes** (bim-ootb #1883 code, sw v1574): main `~/Downloads/BIM_JELAPANG_v3.mp4` (94.6 s, 1,419 frames, `--no-reveal`, grass ground,
  no freeze, 8.2 s approach, 7 data cards at 12.1/19.1/32.6/43.1/55.6/63.1/74.6 s, build 0 → 10,417 pieces steadily over 88 s) ·
  bridge close-up `BIM_JELAPANG_v3_bridge.mp4` (35.4 s, side pass along the 2,148-piece structure; bridge pieces 6,094 → 10,417 over
  frames 240–420). Page clips (`prompts/film_page_clip.js`): 4D/5D page (§RENDER_CHARTS 6 charts, 8 s), compliance report
  (§MC_REPORT rows=302, 6 s).
- **Assembly** (`prompts/film_assemble.py`): main 0–26 · bridge 15–25 · main 26–86.2 · 4D/5D · compliance · main 86.2–94.6 (junction
  orbit) = `BIM_HIGHWAY_v3_assembled.mp4`, 118.6 s, 1,779 frames. The path map (top right) stays the timeline inside film segments.
- **Script** `prompts/film_narration_highway_v3_dialogue.tsv` — 28 rows, 2.2 w/s, every source tagged [VALID] / [SPECULATIVE]
  (speculative: sign-height method, full route order, prices, flood check). "A Malaysian highway" replaces the road's name in all
  spoken/caption text. Fit 28/28 DETAIL, 0 WRONG. Cards FILM_SET=highway3 (6 chapters in card-free gaps, 4/4 badges).
- **Output** `~/Downloads/BIM_HIGHWAY_v3_narrated_AFTER.mp4` — witness: frames 1,779 = source · longest silence 5.4 s · −16.9 LUFS ·
  fontselect Noto Arabic / CJK SC / Thai + DejaVu.

### §11.v3c — re-bake after the bug fixes + far-orbit intro (2026-10-06)
Bakes from bim-ootb main after #1884 (mirror ghost: no room probe on roads; Chainage row) + #1885 (day counter epoch): main
`BIM_JELAPANG_v3c.mp4` (log: §MIRROR_ROOM_PROBE skipped, day counter 60 of 60, window 2026-10-04..2026-12-03, status box
Chainage="… m (inferred)", 0 rows naming the model) · bridge `BIM_JELAPANG_v3c_bridge.mp4` · intro `BIM_JELAPANG_v3c_intro.mp4`
(9 s far orbit, _arcPlan sweep 80°, r 1,245 m, finished model). The x-ray (ghost) intro via a `--tap` translucency script STALLED the
bake at frame 0 (only 12 shared materials touched; aborted after 10 min) — not used; ghost x-ray intro stays an idea (needs a supported
mode, not a tap). Assembly 7 segments = 127.6 s; script `film_narration_highway_v3c_dialogue.tsv` (v3 rows +9.0 s, new `xray` row
worded for the plain far orbit), 29/29 DETAIL, 0 WRONG. Output `~/Downloads/BIM_HIGHWAY_v3c_narrated_AFTER.mp4` — frames 1,914 = source ·
longest silence 5.4 s · −16.9 LUFS.
**User notes for the NEXT bake:** after the build-up, the finished highway in night-lit mode — sunset → dusk / nightfall. (The
"Alt+S can learn from the screenshots" note and the screenshot backdrops were withdrawn by the user.)

### §11.next — script note for the next highway film (2026-10-06)
Add one beat (closing third): our IFC2X3 mastery before IFC4.3 — "compiled from the messiest IFC there is: IFC2X3, every piece a generic
proxy, meaning only in file names and properties. IFC4.3 brings alignment and real road classes; the same compiler will read what it now
infers." Sources/tags in docs/BrowserScaleBenchmark.md §IFC43 ([VALID] 2X3 facts · [SPECULATIVE] 4.3 until a 4.3 file runs). Also new in the
model for that film: the partner's ground works (7,575 piles, 1,338 soil nails, earthworks body, gabions, chainage labels, ROW) — §PARTNER_DISCS.
Never say "no one has attempted this" (no survey done).

### §11.next CHAPTER 0 — the claim card (user 2026-10-06: "intro our film with your above cite quote as Chapter 0 … tone down")
Card text (opening, before greetings), tone per the user:
> "In our search of the web, vendor documentation and academic indexes (October 2026), we have yet to find a prior art to learn from:
> one browser tab, local-first, no server — BIM parsing, a 4D schedule, 5D quantities, clash, road-standards checks, ERP and this film.
> We share it as an MIT-licensed project with the long tail of users."
Sources + scope: docs/BrowserScaleBenchmark.md §PRIOR_ART (closest: IFClite, MI ERP BIM Suite for Odoo, SYNCHRO/Navisworks). Priority for the
browser stack (web-ifc → SQLite WASM → three.js, no backend): the user's own dated OSArch post, https://community.osarch.org/discussion/comment/29036/.
DO NOT SAY: "first", "only", "no one has attempted", "the largest local-first app" / "no other local-first of this size" (not surveyed —
large one-tab apps exist, e.g. Photopea). Instead, state OUR measured numbers and let the viewer judge (re-check each in the bake log/DB
before baking): this model 10,413 elements (5,674 road + 4,739 bridge) + the partner set (9,145 geotech …) · DB 661 MB (JELAPANG_AFTER.db,
396 MB after §MESH_SLIM) · ~22 M vertices · viewer 157,098 lines / 237 files, 256 witnesses (bim-ootb main 2026-10-06).

---

### §11.v4 — "IFC Extraction Program": the owner's report film (DRAFT storyboard 2026-10-06, NOT baked — bake only on the user's go)
User 2026-10-06: *"make the movie script more of reporting for the user's POV, reporting on their works, stats.. no more about red1 as
that film is done. 6 lingo greetings stay"* · title chosen: **"IFC Extraction Program — everything your model already knows, at no
extra cost"** · *"your narrative explains how it can deal with messy poor IFCs, infer by default, editable std rates, publish now,
update later reporting"*.
**Model:** `~/Downloads/JALAN JELAPANG IFC/Merged.db` (19,903 elements = road 15,164 incl. the partner's ground works + bridge 4,739).
**Register:** second person — "your model", "your piles"; F asks what an owner would ask, M answers with the model's own number.
No project story, no author. Every number from the DB / a § line; [VALID] / [SPECULATIVE] tag per row as in v3.
| beat | what is on screen | lines (gist, F/M) | source |
|---|---|---|---|
| greet ×6 | finished road, far orbit | Hello · Selamat petang · 大家好 · สวัสดีครับ · السلام عليكم · Bonjour (en ms zh th ar fr, as v3c) | [VALID] v3c rows |
| title | card: IFC Extraction Program — everything your model already knows, at no extra cost | M reads the title | user 2026-10-06 |
| messy | file list → model loading | F: "These are plain IFC2X3 exports — will it even read them?" M: every object a generic proxy, no georeference, half the property fields empty; meaning comes from file names and the properties that ARE filled | [VALID] §0 (IfcBuildingElementProxy, true_north default, psets mostly `$`) |
| infer | discipline colours appear | M: eleven road disciplines, each inferred from its file name — road, drainage, lighting, signage, marking, furniture, earthworks, and the new ground treatment, gabions, chainage, right-of-way. Inferred values are labelled "inferred" on screen | [VALID] Merged.db: 11 civil discipline codes · import_worker CIVIL_DISCS; status box "Chainage … (inferred)" |
| yourworks | earthworks see-through, piles visible | F: "What's under the embankment?" M: nine thousand one hundred forty-five ground-treatment pieces — seven thousand five hundred seventy-five piles, eighteen metres, one point nine metres apart; one thousand three hundred thirty-eight soil nails; two hundred twenty-eight horizontal drains; four retaining walls | [VALID] §PARTNER_DISCS (psets); [VALID] §CIVIL_REF_LOOK |
| counts | road cards | four thousand and eight pavement pieces, two hundred drainage items, two hundred twenty-seven lighting columns, one hundred thirty-eight signs, eleven gabion mattresses — and the bridge, four thousand seven hundred thirty-nine pieces | [VALID] Merged.db per-discipline counts |
| programme | Gantt / Time Machine | M: one programme, road and bridge together — ground treatment first, the bridge alongside earthworks and pavement, finishing last: one hundred sixty-three days at round-the-clock crews | [VALID] witness_civil_mixed_programme §MP_MAKESPAN (PR #1890) · ⛔ build-up order on screen only after the played-layer gap is fixed (§MIXED_PROGRAMME status) |
| rates | 4D rates panel | F: "Where do those days come from?" M: standard crew rates, marked uncalibrated — change any rate and every bar recomputes. Earthworks is one solid here, so it shows one day: add its volume and a rate, and it becomes real | [VALID] rates.js LABOR_RATES "uncalibrated"; [VALID] EW 1 element 102→103 |
| money | 4D/5D page | quantities counted per discipline; prices left empty until a schedule of rates is given — no invented ringgit | [VALID] CIVIL_RATES rate null (§R) |
| checks | compliance report | road checks shown as formulas with their status — valid or speculative, never hidden | [VALID] §MC_REPORT valid/speculative split (RE-CHECK on bake) |
| publish | share / save | M: publish today from what you have — when the partner sends more files, merge them in; the report updates itself | [VALID] this session: 6 partner files merged into the saved DB, Find + canvas refresh (PR #1888) |
| close | night-lit road (user's next-bake note) | F: "So — everything my model already knows?" M: at no extra cost. Goodbyes ×6 | user notes §11.v3c |
**Before baking (blocking):** PRs #1887/#1888/#1890 on main; the played-layer gap (TM generate with no stored tasks ignores the
template) fixed or the build-up beat reworded to the Gantt only; re-check every number against the bake log.

## §BROWSER_SCALE_AND_CLAIMS — MOVED to `docs/BrowserScaleBenchmark.md` (2026-10-06). The Chapter 0 claim card (§11.next) cites it.
