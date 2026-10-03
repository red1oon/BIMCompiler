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

## 4. STATUS
- 2026-10-03: file created from red1's request (Alt+S session bim-compiler-6d). Nothing built. Next: a session
  writes §PLAN, then stops for red1's review.
- 2026-10-03: splice step added (red1) — cut the take per line by silence gaps, place each at its fitted second, report drift.
- 2026-10-03: own-voice prompter route added (red1) — fitter rows → cue file + prompter view over the film.
- 2026-10-03: §0.1 added from red1's follow-up — the lane's core is the script-to-film FITTER (placed / skipped /
  gap / orphan), red1 writes the narrative; test film switched to Hospital 0049 (build-up ON).
- 2026-10-03: §0 realigned to red1's original words (kept verbatim): professional documentary voice-over of a
  *construction* film; ElevenLabs/OpenAI TTS is the planned route (the 'No AI inside' point demoted from a forced
  decision to one open question); construction-sequence tags (`§GANTT`, `§NIGHT_BUILDUP_GATE`) added as sources;
  plan kept brief.
