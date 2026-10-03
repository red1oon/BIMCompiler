# ⚠ DO NOT REMOVE — FILM NARRATION (voice-over for the baked Alt+C films)
SCOPE: plan, then (only after red1 approves the plan) build, a spoken narration track for the films that
`cli_silent_bake.js` bakes (Alt+C). Every spoken word traces to a `§` line the bake already logs. No invented
numbers, no invented claims. Spec before code; a witness proves the track, not a listen-through.
**Read the page log after every run** — exit code is not evidence. Honour this block until the lane is DONE.

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


## RESUME HERE (2026-10-03 ~10:20, machine closed by red1 — read this first)
**State:** 3 narrated Hospital films delivered in `~/Downloads` (original `Hospital_silent_full_…_0049.mp4` untouched):
`Hospital_narrated_full_…` (Piper Jenny, monologue v1), `Hospital_narrated_lively_…` (Kokoro af_heart, gaps filled),
`Hospital_narrated_dialogue_…` (Kokoro af_heart + am_michael, conversation). red1: "it is already amazing".
**Waiting on red1:** which voice route for the MALAY version (options in §4 V2 entry: own voice via prompter /
Edge ms-MY Yasmin+Osman (cloud) / ElevenLabs (paid, can clone red1) / MMS zlm (local, non-commercial)). Then write the
Malay dialogue from the same log facts. Also open: confirm "Boston" (IFC site = likely Revit default location).
**What survives a reboot:** tools in `~/.local/share/film_narration/` (venv: piper-tts, kokoro-onnx, faster-whisper;
voices/; kokoro/ models). Page log copy `~/Downloads/Hospital_silent_full_…_0049_page.log`. Scripts + fitters in
`prompts/film_narration_*` . **Lost on reboot:** scratchpad clips/plans/.ass — regenerate (Kokoro is deterministic):
```
mkdir -p W && cd W && cp ~/bim-compiler/prompts/film_narration_ass_head.txt ass_head.txt
P=~/.local/share/film_narration/venv/bin/python
$P ~/bim-compiler/prompts/film_narration_fit_kokoro.py ~/bim-compiler/prompts/film_narration_hospital_0049_dialogue.tsv dlg 1.15
#  -> dlg_*.wav, dlg.ass, dlg_plan.tsv ; mux = adelay each clip at its cue + amix + loudnorm -16 LUFS + ass burn-in,
#     libx264 crf 17, -t 206.79 (see §4 entries). Never write over an existing output name.
```
**Rules kept:** every number from a `§` line (PRIME); GPU never used (CPU only, never take gpu.lock); new output names only.

## 4. STATUS
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
