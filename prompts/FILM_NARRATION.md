# ⚠ DO NOT REMOVE — FILM NARRATION (voice-over for the baked Alt+C films)
SCOPE: plan, then (only after red1 approves the plan) build, a spoken narration track for the films that
`cli_silent_bake.js` bakes (Alt+C). Every spoken word traces to a `§` line the bake already logs. No invented
numbers, no invented claims. Spec before code; a witness proves the track, not a listen-through.
**Read the page log after every run** — exit code is not evidence. Honour this block until the lane is DONE.

## 0. THE ASK (red1, 2026-10-03, reworded for this project)
red1 wants a narrated version of the baked BIM films. The bake already writes a page log that says what is on
screen and when. Before ANY code, file or API call, the session acts as producer + automation engineer and
answers three questions, as a written plan for red1 to review:
1. **Log analysis** — how to read the bake's page log and map each on-screen event to a film timestamp.
2. **Script drafting** — what template turns those `§` values into short spoken lines a viewer can follow.
3. **Audio automation** — how the audio files get made and laid onto the film, and what it costs.

**Deliverable of the first session: the plan only, appended to this file as §PLAN.** No code, no audio,
no API keys, no network calls. red1 reviews the plan before anything is built.

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
- **'No AI inside' positioning** (`prompts/NO_AI_INSIDE_WITNESS.md`, `prompts/BIM_POSITIONING_RESEARCH.md`): the
  guarantee is about the shipped runtime, but the film is the 'door' of the product with the tagline 'No AI inside'.
  A neural or cloud voice (ElevenLabs, OpenAI TTS, even a local neural model like Piper) puts AI in the film itself.
  The plan MUST lay out this conflict and the options (human voice reading the generated script; local non-neural
  TTS; cloud TTS with disclosure) for **red1 to decide**. The session does not pick one.
- **Data leaving the machine:** a cloud TTS call sends the script text out (building names, sizes). Say so in the plan.
- **The film is not re-baked for audio.** Audio is muxed onto the delivered mp4 (e.g. ffmpeg, video stream copied,
  not re-encoded). A re-bake costs ~3 h of GPU and belongs to Alt+C.
- **GPU:** this lane needs none. Never take `/tmp/claude-1000/gpu.lock`.

## 3. WHAT THE PLAN MUST CONTAIN (§PLAN, appended below by the next session)
1. **Event table:** which `§` tags are narration sources, which field gives the time, which gives the words. Separate
   setup-time plans (window lines) from per-frame facts (`§CLASH_LABELS`). Say which tags are missing for something
   the film shows (e.g. a beat with no logged caption): that is a gap to log, not to guess.
2. **Script format:** the row layout (§2 Deterministic) + 3–5 template sentences, each with its source fields,
   and a worked example filled from one real log (HHS 2026-10-03 0806).
3. **Timing rules:** speech starts at a cue's fade-in, must end before the next cue's window; a speaking-rate
   budget (words per second) that decides whether a line fits, and what happens when it doesn't (shorten by a
   rule, or drop).
4. **Audio path:** the options in §2 with what each costs (money, time per minute of film, data sent out, AI or not),
   then mux + loudness target.
5. **Witness design (before code):** e.g. `witness_film_narration.js` — every script number matches its source `§`
   value; no two clips overlap; each clip starts within a stated tolerance of its window; total audio ≤ film length;
   prints INCONCLUSIVE when the log has no narration sources (vacuous), never PASS.
6. **Open questions for red1** — one line each.

## 4. STATUS
- 2026-10-03: file created from red1's request (Alt+S session bim-compiler-6d). Nothing built. Next: a session
  writes §PLAN, then stops for red1's review.
