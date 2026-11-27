# ⚠ DO NOT REMOVE — FILM "AI DRAWS WHAT MIGHT BE / WE DRAW WHAT IS" (spec, 2026-11-02)
Scope: spec only. No clip, card or number goes in the film without a source line below. Read the bake/page log after every capture.
No paid generations (user, 2026-11-02: "don't pay anything"). AI imagery = free, licence-checked images only.

## ▶ RESUME HERE (session closed 2026-11-03; the film lane "I vs AI" — three finished films, nothing running)
**Deliverables (in ~/Videos/, all 1920x1080 24fps, silent-cut frames = narrated frames):** `FilmVsAI_English_narrated_…2026-11-02.mp4` (223 s) · `FilmVsAI_Malay_narrated_v3_…` (316 s, "AI" voiced "A-I" = red1's variant 3) · `FilmVsAI_Mandarin_narrated_…` (273 s, title 我 vs AI). Phone copies (720p) were sent via SendUserFile for Mandarin + Malay v3 (30 MiB upload limit → 720p, ~12-15 MiB); English phone copy not made. Titles: EN "I vs AI", MS "I lwn AI", ZH "我 vs AI" (ZH title was my choice — red1 to confirm).
**What the film is:** chapter card → 7 Alt+S stills with fades + CC0 camera shutter → F/M hook → "JavaScript+ThreeJS+SQLite WASM, no AI model" → concession → Autodesk quote + Cumberland quote → free-demo duel (Wan 2.2, ledger) → ours (Hospital HUD, azimuth + exit path, Time Machine, What-if) → 2D→4D/5D shed (no AI in the code) → BIM Tools kit → "professionals" card → Alt+C panel + prep card → security / MIT / Sora-shutdown cards → local-first + collage → Find Panel stills → capability-matrix graph with 13 citations → end card. Two voices: F af_heart / M am_adam (Kokoro, EN); Edge ms-MY Yasmin/Osman, zh-CN Xiaoxiao/Yunxi. Captions: M coral red, F cream, black outline (prompts/film_narration_ass_head_red.txt).
**To rebuild (all CPU):** `scripts/film_vs_ai_run_en.sh` (English, local Kokoro) · `scripts/film_vs_ai_run_lang.sh ms|zh` (Edge TTS, needs network, text only, ~12 min each). Pieces: `scripts/film_vs_ai_build.py` (picture; FILM_LANG/FILM_OUT env; on-screen text for ms/zh in `film_vs_ai_ms.py` / `film_vs_ai_zh.py`), `film_vs_ai_retime.py` (picture waits for the voice; plan→build→tsv), `film_vs_ai_fit_edge_pron.py` (film-local copy of the shared Edge fitter with the pronunciation hook), `film_vs_ai_sfx.py` (shutter track), `film_vs_ai_asr_review.py` (faster-whisper intended-vs-heard check). Scripts: `prompts/film_narration_vs_ai_dialogue_v1{,_ms,_zh}.tsv` (cues are REWRITTEN by retime.py — rows keep ids/sources/turn counts across languages). Source clips are the originals in ~/Videos, ~/Downloads (Hospital_FULL_HIRES, 4D.mp4, BIM_Tools…, DXF2BIM shed v5, the collage films), stills in ~/Pictures/Screenshots + ~/Downloads/bounce_still_17935*. Media outputs live in `build/film_vs_ai/` (NOT committed; ~340 MB of segment clips regenerate from the scripts).
**Not re-run end-to-end:** the repo-path copies of the run scripts (the session ran scratch versions with the same logic); the 2-row smoke test of `film_vs_ai_fit_edge_pron.py` passed. First thing next time: run `film_vs_ai_run_lang.sh ms` once and read `…/work/narr_ms/fit.log` (goal 34/34 DETAIL, 0 WRONG).
**Open (red1's call):** (1) nobody has watched/listened to any file; no native Malay/Mandarin review of translation or question tone. (2) "seconds of prep" = red1's own timing (Alt+C opens ~3 s) — not yet read from a film log. (3) three atrium stills not confirmed as the Hospital (exterior is). (4) collage labels not checked against each source film. (5) Malay API "A-P-I" not listened to separately. (6) Malay film is 41% longer than English (320 s vs 223 s) — a shorter-DETAIL pass would trim it. (7) A free-tier AI duel on 2D→BIM (Amplify) was never run (needs login/browser; Chrome MCP is banned for this user).
**Lessons (do not relearn):** (a) never `pkill -f <pattern>` where the pattern also appears in your own command line — it kills the shell (happened twice, exit 144). (b) after patching a COPIED script, run a 2-row smoke test: a `s[:a]+new` edit silently truncated the Edge fitter and produced an empty probe. (c) ASR (faster-whisper) is a proxy for pronunciation, not an ear: a respelling can look fine by eye and be heard wrong (zh '诶艾' heard as 悲哀; ms 'Ei Ai' voiced as 3 syllables); A/B the exact sentence, then let red1 pick by ear. (d) source films carry burned-in English subtitles — blur the bottom band (`mask=True`) or they overprint our captions. (e) the mux burns subtitles into the video, so a change to the picture means re-mux, not a video splice. (f) the picture waits for the voice: rebuild the BASE timeline before `retime.py plan`, or an old override pollutes the plan.
**Commit state:** spec + scripts + TSVs committed on branch `film/vs-ai` (own worktree, pushed) — not on `fable/meshdb-livewire`, which is another lane's branch.


## Thesis (user's words, kept)
Open: "AI slop beats my code. But do you want AI to draw what a building might look like, or one piece of code to draw what it is?"
Concession (~0:30): "Let's be honest. We lose the 'who is prettier' contest in five seconds. We can't start from nothing."
Rebuttal (later): "And you think AI does it in five seconds?" — see §SPEED: only the parts we can MEASURE.

## Sourced facts (each must be re-fetched before voicing)
| id | claim | source |
|----|-------|--------|
| A1 | Autodesk's own text: "AI-generated responses are based on patterns and probabilities." / "It cannot guarantee accuracy." / "Review automated changes." | help.autodesk.com/cloudhelp/2027/ENU/WSPro-Help/files/GUID-9017743B-6B2E-41D1-BF66-EF3FEFEFCAB2.htm (fetched 2026-11-02). It is about **Autodesk Assistant**, not Forma/Veras — never say otherwise. |
| A2 | Autodesk pairs probabilistic generation with a deterministic parametric engine to "heal, constrain, bring geometry into tolerance" | develop3d.com/cad/autodesks-ai-blueprint-for-cad (trade press interpretation) |
| A3 | Veras output is an image, not geometry | dancumberlandlabs.com/blog/revit-construction |
| A4 | Documented AI-render faults: floating columns, impossible cantilevers, shifting mullions, Penrose stairs | arxiv.org/pdf/2308.00227 ; architecturelab.net |
| A5 | Video models: clips >10 s accumulate inconsistencies | huggingface post-Sora benchmark thread (forum, weak) |

## Apple-for-apple rule
Same input = **Hospital** (`Hospital_extracted.db`). AI cannot ingest IFC, so the AI half is shown on frames from OUR viewport (what Veras-class tools do). Ground truth = our element list.
Free AI images are NOT of our Hospital, so they appear only in act 1 ("pretty") — never as a fidelity comparison. Fidelity duel needs a free tool run on our frame; user to say if a free tier may be used.

## Graph (capability matrix — binary, sourced rows only; NO invented scores)
Rows: Every pixel traces to a model element · Same input → same frame (re-run) · Edit one element → film re-derives · Schedule (4D) scrub · Clash/quantities from same model · Works offline, zero per-render cost · Starts from a prompt, no model · Beauty per minute of effort.
Columns: AI image/video tools | Veras-class (model-guided) | This pipeline.
The last two rows are ours-LOSE rows on purpose (credibility). Each cell needs a cite or a § witness.

## §SPEED — what is measured vs what is only a hypothesis
MEASURED (repo): Hospital light-field bake 26–49 min (PHOTOREAL_STILL_RENDER.md L126,L638); full max-quality orbit ~10 min (FILM_NARRATION.md L445); heap 2.1–2.6 GB (BrowserScaleBenchmark.md L107).
⚠ So "ours is faster" is **FALSE for first bake** and only TRUE for: (a) interactive viewer after load, (b) re-use of an existing bake (the finished films are files), (c) cost per change after the first, (d) no queue / no network.
NOT YET MEASURED: Hospital cold-load→first interactive frame (s); AI latency (needs a free-tier timed run, or cite vendor-published figure).
Script line must be limited to what is measured, e.g. "Five seconds for a picture. My building loads, and you can walk it, offline." — only after cold-load is a § number.
TODO witness: `§LOAD_TO_INTERACTIVE Hospital t=<s>` from a headless local load. Names the issue it proves: whether the "local-first is faster" claim holds at all.

## Our clips (no new bake needed)
Cut from existing: ~/Downloads/Hospital_narrated_dialogue_v3_AFTER_1920x1080_24fps_2026-10-03_0049.mp4 (206.8 s), Hospital_flyaround_AFTER_*, MEP clash reveal, 4D Gantt edit, DXF2BIM films. Each cut = start/end second + the § line it shows.
Open: pick quips (2–4 s each); candidate beats = clash count, Gantt bar drag → film changes, "same building 5 languages".

## Open decisions (user)
1. Free-tier AI run on our Hospital frame for the fidelity duel? (default: no, cite published failures only)
2. Image sourcing: Wikimedia Commons AI-generated (public-domain in US) vs. vendor galleries (licence unclear).

## §OPENER (decided 2026-11-02, user: combined version; audience already knows AI slop → 1–2 AI reminders only)
Order: AI frame(s) first → our Alt+S Hospital stills → reveal. No labels on the flash; reveal card names them.
Opening dialogue (user's draft, F/M two-voice like the Hospital films):
  F: "Wow, AI is super cool!"
  M: "Wait… are they real? Can they show us the numbers?"
Then: first-act concession ("we lose pretty in five seconds") → our stills → "None of these were AI" card → numbers (matrix).
NB: "are they real?" lands best if our stills follow the AI frame back-to-back.

## §ASSETS — AI reference frames (free, licence-verified 2026-11-02 via Commons API)
| file | licence | status |
|------|---------|--------|
| Illuminated_Valley_in_the_Afternoon_(Imagen_4.0).webp 2816x1536 | Public domain | DOWNLOADED build/film_vs_ai/ai_refs/imagen_valley.webp (+ .sha256). Landscape, not a building — it is the generic "AI is gorgeous" reminder only. |
| Bangunan_Dunia_Langit.png 2048x2048 (Gemini, "fictional building") | CC BY-SA 4.0 | NOT downloaded: needs on-screen attribution + share-alike; use only if user accepts credit card. |
| Seedream 4.5 Canal Town | — | Commons page does not exist (search hit was stale). |
No free AI image of a *hospital* found yet; do not fake one. Second reminder frame = pick after user OKs a CC BY-SA credit, or reuse the valley.
Our frames: pick from Alt+S stills (HospitalFull / Hospital / HospitalWhatIf / level3_terrace_trees) — NOT yet viewed; choose by opening them, one § line each (file, sha256, build/DB hash).

## §OPENER v2 (user, 2026-11-02 — SUPERSEDES the combined AI-first opener above)
"Entirely use ours and say: 'These are not done by AI but pure JavaScript in ThreeJS where the BIM model is SQLite WASM.'"
- NO AI frames in the opener. The valley image (§ASSETS) is demoted to an optional single-frame reminder later; the CC BY-SA question is moot.
- Hook: our Alt+S Hospital stills flash cold; viewers assume AI; F/M beat ("Wow AI is super cool!" / "Wait… are they real? Show us the numbers") then the reveal line.
- Claim wording is VERIFIED against code 2026-11-02: viewer/lib has three.module.min.js + sql-wasm.js/.wasm (+ httpvfs sqlite worker); viewer/scene.js imports Three. 
- Words to guard: say "JavaScript, ThreeJS, SQLite compiled to WebAssembly". Avoid bare "pure" if a GLSL shader/headless-GPU bake is on screen: the stills come from the browser GPU path (Alt+S). One-line honest form: "No AI model anywhere in the pipeline." (matches project_positioning_no_ai_inside).
- Strength: the reveal becomes a claim the viewer can check (open the page, view-source, it's a database file). Weakness: no side-by-side contrast; the AI-slop comparison now lives only in the numbers/matrix act.

## §SCRIPT v1 (draft 2026-11-02; user: keep the earlier witty lines + the tease "AI is nice isn't it. Just that it isn't. This is all from…")
[Beat 1 — flash, our Alt+S Hospital stills, no caption, ~4 s]
 F: Wow. AI is super cool!
 M: Wait… are they real? Can they show us the numbers?
[Beat 2 — tease, stills continue]
 NARR: AI is nice, isn't it? Just that it isn't. This is all from…
[Beat 3 — hard cut to the browser: DevTools/view-source, the .db file]
 NARR: …JavaScript, ThreeJS, and a SQLite database running in WebAssembly. No AI model anywhere in the pipeline.
[Beat 4 — concession, kept from earlier]
 NARR: AI slop beats my code. Let's be honest — we lose "who is prettier" in five seconds. We can't start from nothing.
 NARR: But do you want AI to draw what a building might look like? Or code that draws what it is?
[Beat 5 — Autodesk's own words on a card, verbatim A1]
 CARD: "AI-generated responses are based on patterns and probabilities. It cannot guarantee accuracy." — Autodesk Assistant help page
[Beat 6 — numbers: capability matrix, our clips (clash count, Gantt bar drag → film re-derives, same building five languages)]
[Beat 7 — rebuttal, only if §LOAD_TO_INTERACTIVE is measured]
 NARR: And you think AI does it in five seconds? <measured line; see §SPEED. Until measured: "Five seconds for a picture. My building loads, and you can walk it, offline.">
Guards: every number on screen = a § line; the Autodesk card cites the Assistant page, never "Forma"/"Veras"; the slogan "None of these were AI" only if all flashed stills are Alt+S outputs (hash + DB logged).

## §NEAR_CASES — AI "2D → 3D/BIM" tools (user 2026-11-02: include converting their 2D to BIM). Researched 2026-11-02, ALL vendor/blog sources, no independent benchmark found.
| tool | claim | caveat found |
|------|-------|--------------|
| WiseBIM / Plans2BIM | PDF/DWG → walls, doors, windows, slabs → IFC/Revit | vendor |
| Amplify (free web) | PDF plan → IFC/Revit | reviewer: "not always perfectly accurate, may require adjustments" |
| BIMxAI | "up to 90%+ detection accuracy" | vendor claim, unverified |
| BIMy | Revit plugin, "about a minute" | needs Revit 2025/26 |
| Higharc | hand sketch → BIM (US timber-frame housing, beta) | no accuracy figure; "100x faster" vendor claim |
| Snaptrude | sketch → BIM | "rectilinear limitations"; own page says a knowledgeable user must review |
| Sketch2BIM (arXiv 2510.20838) | works on scaled grid-like plans | "falls short with unscaled, hand-drawn sketches" |
Common thread: accuracy self-reported, human clean-up always, scale detection is a dependency, no one publishes a per-element audit.
Gaps in research: Swapp, Bild AI, Arcol, mnml unverified; no multi-storey/curtain-wall/non-standard-layer data.

## Our side (from bim-ootb prompts/DXF2BIM_ARCHITECT_REVIEW.md + FILM_DXF2BIM_HOSPITAL.md, read 2026-11-02; re-check each number against its log before voicing)
- Deterministic reader: same drawing → same model; every element traces to a DXF entity/handle; round trip split → check → reassemble with scope checks (0 blocking).
- Existing films to cut from: Duplex round trip, shed, Hospital drawing-set (44 sheets → 14, grid 128 → 38×39 primary lines, 8 plans / 1440 walls / 604 columns).
- Honest limits already recorded (the film must keep them, it is the credibility edge): "Hospital to 3D is NOT claimed" (whole-building import refused); all 1440 Hospital walls non-orthogonal so wall-based grid/host rules don't apply; curtain-wall pieces unreadable (374 on HHS); extraction 9 min 24 s / 1.8 GB on Node; generality = one raw outside set (shed) + Duplex; effort = shed 47 actions, Duplex 151, 82% doors/windows.
- Contrast to use: AI tools say "90%+" with no audit; ours prints the failing items ("blocked 166 = lod400_library_unreachable 71 …"). Admitting a limit with a count is the opposite of "probabilistic".
⚠ Do NOT claim DXF2BIM beats these tools on accuracy: no side-by-side exists. The claim we can make is auditability + repeatability, not a higher hit rate. A fair duel needs the same drawing through a free tier (Amplify is free) — user decision, not yet taken.

## §TWO_CLOCKS (user clarification 2026-11-02 — SUPERSEDES the "ours takes secs" reading in §SPEED/§AI_TIMING)
"Seconds, without prompt" = the HUMAN's time to send an Alt+C film to bake. The bake itself is minutes to over an hour and the existing films already show that wait. Do NOT claim the machine time is seconds.
| clock | ours (Alt+C) | AI video tool |
|-------|--------------|---------------|
| human effort to start | seconds: press Alt+C, path already authored, no prompt (MEASURE: count of actions/seconds from a film's own take) | write a prompt, iterate; clip cap 4–8 s (Veo 3.1 base) so a walkthrough = many prompts + stitching |
| machine wait | Hospital light field 26–49 min; orbit ~10 min (PHOTOREAL_STILL_RENDER.md L126; FILM_NARRATION.md L445) — local, unattended, deterministic | ~30 s–10 min per ≤8 s clip, cloud, queued; sources conflict (§AI_TIMING) |
| re-run same input | identical film | different clip each time |
| after an edit | re-bake, no re-prompting; scrub/Time Machine needs no generation | re-roll; no scrubber exists |
Script rule: the rebuttal line is "you type nothing, you press go, then you walk away" — honest about the hour. Never "AI is slower" (one-shot AI clip is faster per clip); say what is true: ours needs no prompt and gives the same film every time.
TODO to make the human-effort clock a number: take it from an existing film's recorder/page log (timestamp of Alt+C press → bake start); cite the log line. Not measured yet.

## §DUEL (user go 2026-11-02: "you may run a duel; show how long preparing a prompt, calling their AI, waiting, and the need to pay; plus dependency, non-repeatability, broken chain, no downstream, need to integrate")
Constraints that bind how it runs:
- NO spend (user 2026-11-02 earlier). The "need to pay" is a FINDING: record the exact step where a free tier stops and what it asks for. Never enter a card.
- NO `mcp__claude-in-chrome__*` for any step (memory feedback_no_interactive_chrome_tool). Driving a third-party site = repo's node+CDP/puppeteer harness, or the user at the keyboard with me logging.
- Accounts/sign-up/captcha = the user's act, not mine. If a tool needs login, the duel row is marked BLOCKED:LOGIN with the screen's wording, not skipped silently.
- Upload of the Hospital/Duplex frame to a third party = the user's call per file (their content leaves the machine).
Stopwatch ledger (one row per attempt; timestamps from a log file, not memory): t0 decide → t1 prompt ready (words, edits) → t2 submit → t3 queue start → t4 result → t5 usable? (Y/N + why) → pay-wall hit? (step, wording) → seed/same-prompt rerun diff (frame hash of the 2 results).
Dependency/risk checklist per tool (filled from observation, each with a note of evidence): needs network · needs login · account/ToS can change · model version retired under you (Sora 2026 shutdown per search sources, dates conflict) · price changes · output ownership/licence terms · same prompt twice = different clip (hash) · no element ids → cannot count what is drawn · no schedule/clash/quantities downstream · export to IFC/BIM = none (image/video only) · integration = manual re-entry.
Ours, same ledger: t0 press Alt+C → bake start (page log timestamps), bake wall-clock (log), rerun frame hash equal (cite), downstream (clash, 4D, quantities from the same .db).
Character-consistency claim (user: Kling/Seedance struggle beyond ~5 s): sources found do NOT support a 5 s threshold (only "multi-shot drift is known", vendor "Visual Drift Killer"); say it only with a clip we saw, on screen, with its settings. Our version of the point: a building is not a character; element ids are the identity, so drift is impossible by construction (witness: same db → same frame hash).
Newer-version cost (sources conflict; check live rate card before use): Veo 3.1 Lite $0.03–0.05/s · Fast $0.10/s · Standard $0.40/s · 4K $0.60/s (≈ $3.20 per 8 s clip at Standard); Kling 3.0 $0.029–0.168/s depending on route/audio; Seedance 2.0 $0.022/s to ~$0.24/s, no official API per one source. A 60 s walkthrough at Veo Standard ≈ $24 per take, before re-rolls (arithmetic from the quoted rate, not a measured bill).
Near-case duel (2D→BIM): Amplify (free) on the Duplex DXF/PDF vs DXF2BIM, same drawing; compare element lists by class counts; same ledger.

## §FAIRNESS (user 2026-11-02: "we may sound biased/one-sided but it is fair comment from general opinion; we expect rebuttals but I doubt it")
Bias is answered by construction, not by tone:
1. Every claim on screen carries its source or its § line; a rebuttal can only attack a checkable fact.
2. Concede what AI wins, in our own voice, FIRST (prettiness, speed per single clip, start-from-nothing, concept stage). Already in §SCRIPT beat 4.
3. Quote the vendors against themselves (Autodesk Assistant page A1) — no adjective of ours needed.
4. Label scope: "free demo tier, one prompt, one seed, date" — never "AI can't". One tool's run is an observation, not a law.
5. Rebuttal-ready table (anticipated reply → our answer): "newer models fix consistency" → show a dated run + say re-test welcome; "Veras/Forma are model-guided" → output still an image, no element ids (A3); "AI 2D→BIM is 90%+" → publish per-element counts or it is a self-report; "you cherry-picked" → ledger lists every attempt incl. failures (Space RUNTIME_ERROR, queue waits).
6. Invite the re-run: publish the ledger + the one-line command so anyone can repeat it.

## §QUOTES (user 2026-11-02: strongest opinion quote) — verbatim, fetched 2026-11-02 from https://dancumberlandlabs.com/blog/architecture-rendering-ai/ (Dan Cumberland, Aug 3 2026; practitioner blog, not a named architect/regulator — label as such on screen)
- STRONGEST (one-liner): "Generative AI lives in latent space. Buildings live in physical space."
- Second: "It is the predictable result of a system optimized for aesthetic plausibility over physical truth."
- Cost angle: "It produces what looks like the right answer. It produces the wrong project." ; "…a developer client can fall in love with a concept the project can't deliver."
Pairing for the film: Autodesk's own admission (A1, "based on patterns and probabilities") + this line = vendor + practitioner, neither ours.
Weaker/unverified (do NOT use verbatim): MDPI Buildings 16(3):534 on LLM hallucination being unacceptable in safety-critical BIM cost work — page returned 403, wording came from a search snippet only; fetch the PDF before quoting.

## §DUEL_LEDGER 2026-11-02 (raw: build/film_vs_ai/duel_ledger_2026-11-02.log) — every attempt listed, failures included
| # | tool (free, anonymous, no login) | input | outcome | wall |
|---|---|---|---|---|
| 0 | HF Space guardiancc/image-to-video-cog | — | RUNTIME_ERROR, Space down ("contact the owner") | 0 s of generation |
| 1 | HF Space Upsampler/wan-2-2-14b-image-to-video (Wan 2.2 14B, ZeroGPU), Hospital.png sha abddc668dc1b, prompt "slow cinematic fly-through of this hospital building", seed 42, 3.5 s clip | same | FAIL: "No GPU was available after 60s. Create a free account to get a higher priority in ZeroGPU queues." | 63.7 s |
| 2 | same, identical params (repeat) | same | FAIL, same message | 64.2 s |
Outcome: 0 videos from 3 attempts. Repeatability hash comparison NOT possible (nothing produced) — do not claim "different each time" from this run; the claim stays sourced to the general non-determinism literature or needs a successful pair.
What this DOES evidence (observation, one demo, one day, anonymous tier): dependency on a third-party GPU queue; pay/sign-up gate = "create an account for priority"; the wait ends in nothing; no way for us to schedule it. Say exactly that, not "AI fails".
Human-effort clock (AI side), measured: prompt = one line, ~1 min to find a working Space + read its API (probe.log), submit→answer 64 s.
Not tried: further Spaces (stop-rule: no retry loops on a failing operation; one different tool = a new row if the user wants it), logged-in tiers, paid tiers, Amplify 2D→BIM.

## §DUEL_LEDGER row 3-4 (2026-11-02 03:31–03:34) — a demo that WORKED, and what it showed (raw: build/film_vs_ai/duel_ledger_b_2026-11-02.log, clips in build/film_vs_ai/duel_clips/)
Space preSalesAIAutomation/imagetovideo (Wan 2.2-family, ZeroGPU, free, anonymous). Input = our Hospital.png (1428x938, sha abddc668dc1b), prompt "slow cinematic fly-through of this hospital building", seed 42, randomize_seed=False.
| run | wait | output | sha |
|-----|------|--------|-----|
| 1 | 64.6 s | 832x544, 16 fps, 57 frames, 3.56 s | 73386c7dd591 |
| 2 | 61.8 s | identical | 73386c7dd591 (ffmpeg PSNR = inf: bit-identical frames) |
⚠ FINDINGS THAT CORRECT OUR CLAIMS (twin of "do not hide failures"):
1. **With a pinned seed this AI demo IS repeatable** (identical hash). So "AI gives a different clip each time" is FALSE as a blanket claim. What is true: the tool's default is randomize_seed=True (default of the API, probe.log); repeatability depends on the user pinning a seed AND the host keeping the same model/hardware/version — none of which the user controls (cf. Sora service retirement). Say it that way, or not at all.
2. Duration: 3.56 s for one clip; a 206 s Hospital film = ~58 such clips + stitching. Wait per clip ~62–65 s → ~1 h of waiting for the same length, by arithmetic from the measured wait (queue-dependent; today's anonymous tier).
3. Output is 832x544 from a 1428x938 input: lower resolution than the source frame.
4. Fidelity (my reading of frames 0/28/56 against the input, NOT a number): structure broadly kept in the first frame; the facade window pattern and the ground plane re-draw between frames, and the overlay text bar at the bottom smears. This is a descriptive note — to be turned into a count (elements visible per frame vs element list) before it is voiced; a witness would need an element-aware metric we do not have for AI frames.
5. Dead-demo census (HF "image-to-video" Spaces by likes, status via API): 1 of 5 running (the one used); 3 BUILD_ERROR, 1 RUNTIME_ERROR → free-demo dependency is itself a data point (n=5, one day).

## §CUT v0 (2026-11-02) — silent rough cut, `python3 -I scripts/film_vs_ai_build.py` → build/film_vs_ai/cut/FilmVsAI_v0_silent_1920x1080_24fps.mp4 (~98 s, 26 segments, deterministic ffmpeg; each flash still's sha printed as §CUT lines)
Sequence: flash (terrace still, Hospital.png, 4 frames of our baked Hospital film) → F/M cards → tease → reveal (JS+ThreeJS+SQLite WASM, no AI model) → concession → Autodesk quote → Cumberland quote → duel (card, AI clip with ledger caption, repeatability+cost card) → ours (3 excerpts of the existing Hospital film: open, clash 1478→271, by-trade 38/33/133) → two-clocks card → Find Panel stills ×3 → ERP-link gap card → end card.
KNOWN GAPS (do not ship before closing) — UPDATE 2026-11-02: flash now = 6 bounce_still_* Alt+S stills (only ...66758986 confirmed Hospital) + red1-picked 1.png (Terminal interior); 2-7.png are UI/road screenshots and left out. Gap 1 below is therefore CLOSED for "pretty", still OPEN for "a Hospital-only flash":
1. **No Alt+S photoreal Hospital still exists on disk** (PHOTOREAL_* stills are HHS/Duplex/etc.). The flash uses viewer shots + frames of the baked film — good, but weaker than "pretty". A real Alt+S Hospital still = a GPU render → needs red1's go (standing rule).
2. ERP-link beat: no Hospital clip found; gap card in the cut. Needs a recorded take.
3. Excerpts carry the original film's burned-in subtitles ("Good morning, from Boston…"); crop or replace when narration is fitted.
4. Narration not made: lines in §SCRIPT v1 go through the film_narration pipeline (PLAYBOOK in FILM_NARRATION.md); numbers on cards come from: duel ledger, bake timings (§SPEED), clash § line of the Hospital TSV (broad=1478 meshTrue=271; FP 38/ELEC 33/MEP 133).
5. "Alt+C bake: Hospital light field 26-49 min" card = light-field bake timing, not an Alt+C film bake (the film bake is ~10 min orbit per FILM_NARRATION L445). Reword the card before ship.
6. Find Panel stills show a path in the panel; no path length/door count is voiced (could not read the text reliably).

## §CUT v0 update (2026-11-02, later): originals used as sources
- Excerpts now from ~/Downloads/Hospital_FULL_HIRES.mp4 (no audio, HUD only; its timeline DIFFERS from the narrated film's TSV — 270 true clashes ≈123 s; ELEC-STR 4 / MEP 133 / ARC-STR 66 ≈156–168 s) and ~/Videos/4D.mp4 (Time Machine: schedule editor ≈14–28 s; What-if schedule ≈46–58 s; audio stripped).
- "Glory" beat (user: azimuth + safety exit path) = narrated 0049 film 52–66 s: HUD shows "Sun 159° az · 52° alt · 34° onto the S facade" and "Safety — circulation distance 13 flagged · Longest path to exit ~217 steps" (§RULE_FILM_EXIT_STAT ~217 steps; §MEASURE_BOX common path of egress). HIRES has the compass but not the sun text. Burned subtitles remain in that excerpt.
- Prep/security cards (user: "prep are mere secs, no prompt haggling, waiting, API costs, backdoor security hole"): sourced to Nomic enterprise-security AEC blog (BIM uploads carry full geometry/MEP/security-sensitive layouts), Stoel (inadvertent disclosure to software/storage companies in BIM+AI workflows), AIA 2026-01 guidance (data privacy among AI-policy areas); our own duel uploaded Hospital.png to a third-party Space. WORDING GUARD: "a door you do not control", NOT "backdoor" — no breach or backdoor in any AI tool is evidenced; do not claim one. Sources: nomic.ai/blog/enterprise-security-ai-aec ; stoel.com/insights/publications/authorship-and-data-disclosure-risks-in-construction-and-design.
- "Ours: the building is a file you hold" rests on local-first / static-site design (docs/ERP.md, positioning); re-check the exact wording against that doc before voicing.

## §CUT v0 update 3 (2026-11-02): "simple kit, fast reuse" beat from ~/Videos/BIM_Tools_narrated_chapters_AFTER.mp4 (209.4 s, Duplex, 8 chapters; original, audio stripped, subtitles stay)
Snips (times in that file; facts = toasts/§ lines listed in prompts/film_narration_bim_tools_dialogue.tsv, re-check against the film's own log before voicing): 31–40.5 s U upgrade (§UPGRADE_REPORT 38,898→38,603 entities, 28 dropped, 110 ms, PASS); 137–146 s K split into 4 storey files (PASS); 180–190 s toolkit zip ("Unsigned scripts, plain text, no network calls", SHA256SUMS.txt). Not used yet: extract (115–133 s, 2 items → 574 entities), health (159–176 s, 230 elements / 0 duplicate GUIDs / 23 orphans / psets 92.6%), chapters 4 search/pick. Point for the film: AI tools hand you an image; a pro's day is upgrade/split/extract/health — deterministic, one key, a PASS line, and a zip you can run offline.

## §OPEN_SOURCE (user 2026-11-02: "calling an unknown API is a clear security risk in any circumstance… my app is MIT… AI is not FOSS, you cannot examine the code")
VERIFIED 2026-11-02: bim-ootb/LICENSE and bim-compiler/LICENSE = MIT (R. D. Oon); bim-ootb README "In the open, or not at all. MIT-licensed, because a tool you can't fork is a tool that owns you."
⚠ CORRECTION TO THE BLANKET CLAIM "AI is not FOSS": the model our own duel used is OPEN-WEIGHT — HF API: Wan-AI/Wan2.2-I2V-A14B license apache-2.0; the Space preSalesAIAutomation/imagetovideo license apache-2.0, public. A rebuttal will point at exactly that. True, defensible wording: (1) the commercial services (Veo, Kling, Runway, Midjourney, Seedance) are closed — NO cite fetched yet; add a source or say "as far as we can see"; (2) calling ANY hosted endpoint = your input goes to code/hardware you do not control, open weights or not (the duel's Space is a third party's code even though the model is Apache-2.0); (3) open weights let you RUN it, not EXPLAIN a given output the way a source line + § log explains ours. Do not say "AI cannot be examined" flat.
Card p3 in the cut uses wording (2)+(3) and names the Apache-2.0 fact itself, so the rebuttal is pre-empted.

## §CUT v0 update 4 (2026-11-02): fast collage + local-first wording
Collage (17 × 1.5 s, audio stripped, one label each) from ~/Videos originals: DXF2BIM_2D_Wand_Hospital (22 s, 67 s), ERP_DepthCycle_POSOrder (10 s, 66 s), ERPSpatial (52 s "ERP linked to the 3D model", 136 s dashboards), TheServerIsDead_ERP_Desktop_v2 (36 s), Chainage_from_model_letters_v2 (60, 82 s), Earthworks_cutfill_SILENT (56, 88 s), Civil_Works_Road_Report (60 s), Terms_You_Can_Check_v3_rc1 (130 s), Shed_SubmissionPack (16, 112 s), DXF2BIM_Viewer_Tour_v5 (58, 90 s). Timecodes picked from 8-frame contact sheets, not from the films' logs → re-verify each label against the source film's own caption before narration.
USER STATEMENT (2026-11-02): "all landed local first air gapped operations". EVIDENCE CHECK (prompts/NO_AI_INSIDE_WITNESS.md §8, 2026-10-02): §NOAI_NETWORK C2 = PASS (viewer boot + IFC import, every non-origin request aborted = air-gapped situation, canary leaks 0, LLM requests 0); overall PASS_WITH_DISCLOSED because: (a) landing page index.html carries a GoatCounter beacon (viewer.html does not); (b) user-triggered features reach out — api.github.com (scene.js), tinyurl.com (share.js), api.qrserver.com (sitecam.js) — PENDING red1 decision, not exercised at runtime. ⇒ WORDING GUARD: say "local-first; the core viewer runs with outside requests blocked" — NOT "air-gapped, no network calls" about the whole app (a rebuttal will find the beacon / share features). The one "no network calls" line in the film is the BIM Tools toolkit zip's own panel text (its scripts), a narrower claim. Witness is from 2026-10-02: rerun before the film ships if the tracker/share code has changed since.

## §NARRATION v1 — red1's voice, first person (user 2026-11-02: "make the narrative persuasive as it is my voice to argue this"; card 2: "Film making takes up to an hour but its preparation is mere seconds — no prompt, no API call, no credit costs, and no security hole anyone can phish")
Target ~2:20 spoken (~330 words at ~2.4 words/s); the cut (222 s) must be trimmed to match. Every number below is from the ledger/§ lines above; lines marked [VERIFY] need the source checked before recording.
1 OPEN (flash + F/M cards, kept as two voices): F: "Wow. AI is super cool!"  M: "Wait… are they real? Can they show us the numbers?"
2 TEASE→REVEAL (red1): "AI is nice, isn't it? Just that it isn't. Every frame you just saw is JavaScript, ThreeJS, and a SQLite database running in WebAssembly. No AI model anywhere."
3 CONCEDE (red1): "Let me be honest. AI beats me on prettiness in five seconds, and it can start from nothing. I can't. So why bother?"
4 WHY (red1): "Because a building is not a picture. Autodesk's own help page says its AI answers 'are based on patterns and probabilities' and that it cannot guarantee accuracy. A practitioner said it better: generative AI lives in latent space. Buildings live in physical space."
5 DUEL (red1): "So I tried one. A free demo. Our Hospital frame in, one prompt. Sixty-four seconds later: three and a half seconds of video, smaller than the picture I gave it. Run it twice with the seed pinned and you get the identical file. I checked, and I'm telling you, because it's fair. But that is one clip. My Hospital film is two hundred and six seconds: about fifty-eight of those. And an earlier demo simply said: no GPU available, create an account."
6 OURS (red1, over Hospital bake + 4D): "Now mine. The same Hospital, baked once. Two hundred and seventy true clashes, by trade, by pair. The sun's azimuth. The longest walk to an exit. All read from the model, not guessed. Move the schedule, and the building follows."
7 KIT (red1, over BIM Tools snips): "And the everyday kit: one key to upgrade, one key to split, a pass line for each, and a zip you can run at home."
8 PREP (red1, c1 card): "Making a film takes up to an hour. Preparing it takes seconds. No prompt to haggle over. No API call. No credits. No key to leak, no account to phish. I press go, and walk away."
9 DOOR (red1, p2/p3 cards): "To ask an AI, your model leaves your machine, to code you cannot read. Mine is MIT licensed: read it, fork it, break it."
10 COLLAGE (red1): "Local first. Drawings, ERP, roads, earthworks, reports, from one kernel."  [VERIFY each collage label against its source film]
11 CLOSE (red1): "AI draws what a building might be. I show what it is. Re-run it yourself. The ledger is public."
GUARDS (rebuttal-proofing, all scoped honestly):
- "No API call / no credit / no key to leak / no account to phish" is about FILM-MAKING (Alt+C bake, local). The bake has not been witnessed with network blocked specifically — [VERIFY: run the bake under the §NOAI_NETWORK-style blocked-origin harness, or word it "needs no API key or account"]. Do not extend to the whole app (landing-page analytics beacon; user-triggered GitHub/tinyurl/QR calls, per §CUT v0 update 4).
- "Seconds" of prep = unmeasured until read from a film log (§TWO_CLOCKS). "Up to an hour": Hospital light-field bake 26–49 min; the Alt+C film orbit ~10 min — wording "up to an hour" stays inside the measured range.
- "Identical file" line is deliberate: it pre-empts the "non-repeatable" rebuttal by conceding it.
- "Code you cannot read": true of closed services; the open-weight Wan 2.2 (Apache-2.0) is the exception we already name on card p3 — keep that card.
- Quotes: Cumberland = practitioner blog (name on screen); Autodesk = Assistant page only.

## §CUT v1 (2026-11-02, trimmed) + user lines added
Cut rebuilt: `python3 -I scripts/film_vs_ai_build.py` → ~162 s silent (was 224 s). Flash = 5 bounce_still Alt+S + 1.png at 0.7 s each (toilet still dropped as weakest). New beat "2D → 4D/5D/reporting, no AI in the code" from ~/Videos/DXF2BIM_Chapter_BricsCAD_Shed_to_Viewer_…_v5_EN.mp4: 5D cost page 240–248 s ("cost by discipline… rate-based estimate about 1.13 million dollars", not a tender), 4D schedule 256–264 s ("a schedule the Viewer generates when the model has none… six phases over 194 calendar days", a default sequence), "WHAT WAS BUILT HERE" card 296–303 s ("Deterministic: the same drawings and markings give the same model, with no AI on your drawings; rebuilt within 1 mm of an answer key (a duplex); shed written back to 2D within 0.02 mm; yellow = a setting with its basis, never a silent default: 43 listed"). Source facts: bim-ootb/prompts/film_narration_dxf2bim_v5_en.tsv (v03, v04, n01, end).
VERIFIED (2026-11-02): grep of modeller/dxf*.js, scripts/extractIFC2DB.js, viewer/dxf*.js in bim-ootb for openai|anthropic|groq|generativelanguage|gpt-N|claude-|llm → only false hits ("wallmin" contains "llm"). Scope = those files only; do not extend to "the whole repo". The film's own card says "no AI on your drawings".
User lines to add (first-person, §NARRATION v1):
- after KIT: "2D to BIM is a big job. We did it without AI in the code — and then the schedule and the cost come from the same model." (4D/5D shown; caveat on screen: default sequence, rate-based estimate.)
- "This is how professionals work: fast, repeatable, sequenced. Skills their learning can wrap around, not out of their control." (card 'pro'; user: "when you know the code, you shortcut right away")
- "And honestly, using AI is counter-intuitive a lot of the time." — OPINION line (user's own; say "in my experience"), not a sourced claim; the sourced support is the duel ledger (prompt, wait, no-GPU, small output) + Cumberland. Keep it labelled as opinion.
Known fix applied: Tools "split" snip moved to 143 s (137 s showed the room view, not the split toast).

## §CUT v1 update 2 (2026-11-02): Alt+C panel + user's experience claim
- red1: "one of the 4,5,6 screenshots shows exactly that Alt+C panel" → in ~/Pictures/Screenshots it is **7.png** (4/5/6 are road/earthworks/Terminal screens). 7.png = the Alt+C cinema-path panel on the Hospital: stick/settle/stop path rows, "build the model as the film plays", room titles, Reveal, Clash pairs, Silent-bake size, Day # counter, saved plan "plan 09-05 05:07 … 4 bands · whole film · buildup · 282s", "total 281.6 s · 4225 frames to bake", "walk 133.0 m · 1.69 m/s", "Saved — Ctrl+S writes it into the building file". Used as a 5 s still before the prep card (it is the evidence that prep = a saved path + tick-boxes, no prompt). It shows a once-authored path; it does NOT itself time the seconds of prep.
- 5.png = Inspect menu (Time Machine · t, "4D / 5D · 4", Clash Matrix, Section Cut) + Earthworks cut&fill (fill 18,916 m³ on screen; cost/duration/plant rows are "PENDING" in the panel — do not voice them as done). Used 3.5 s for the reporting menu.
- "Using AI is counter-intuitive a lot of the time" = red1's stated EXPERIENCE; his evidence is the film archive in ~/Videos (≈60 baked/narrated films made without AI). Voice as "in my experience" and point at the archive; no measured metric is claimed.

## §PREP_CLOCK — red1's own timing (2026-11-02, user statements; NOT from a log)
- "Alt+C … comes on in about 3 secs"; then drag the path and tick the boxes: "seconds to a minute or so based on intent, which is deterministic as you can preview"; "for fast work it is just Alt+C opens, OK."
- ⇒ human prep = ~3 s (fast work: open + OK) up to ~1 min (shaping); machine bake = up to an hour (26–49 min light field; ~10 min orbit). Card c1 now says exactly this and labels the prep figures "red1's own timing". To upgrade to a witnessed number: time Alt+C-open → panel-visible and OK-click in a film recorder/page log (CPU-only read of an existing log, no new bake) — not done.
- The "deterministic, previewable" claim is red1's; the panel shows the path and film length (281.6 s / 4225 frames) before the bake, consistent with it. The bake's identical-output property is the §NOAI_DETERMINISM / frame-hash lane, not re-verified here.
- Narration line 8 (PREP) becomes: "Press Alt+C. It opens in about three seconds. For fast work, press OK. To shape it, drag the path and tick the boxes — seconds to a minute, and I can preview it first. Then the bake runs, up to an hour, and I walk away. No prompt to haggle over. No API call. No credits. Nothing to phish."

## §FLASH v2 (2026-11-02 04:45): red1's fresh Alt+S stills used
~/Downloads/bounce_still_1793565635195 / …667102 / …742688 (atrium: spiral stair, red fire-protection pipe, steel, orange doors) and …907375 (exterior, red base, terrace planting, blue sky), all 2776×1440, saved 04:40–04:45. Visibly stronger than the 2026-10-04 set (real sky, glazing, MEP detail). Provenance: exterior reads as the Hospital (same façade as …66758986, which red1 confirmed as Hospital in ALTC_FOUNDATION.md L82); atria are consistent with the Hospital atrium (PHOTOREAL_STILL_RENDER.md L516) but NOT confirmed — red1 to confirm before any "Hospital" label; until then captions say "Alt+S still" only.
Flash order now: 4 fresh stills → …66758986 (aerial) → glass-office corner → living room, 0.7 s each (the 1.png interior and …67908689 / …67411820 / toilet dropped from the flash).

## §SHUT_OFF (user 2026-11-02: "These are on the fly in browser, no install, MIT licensed examinable code. And as tech improves so will this project. But with AI, it can all be shut off tomorrow.")
Evidence fetched 2026-11-02: The Decoder (28 Mar 2026): "The web and app version goes dark on April 26, 2026, with the Sora API following on September 24, 2026." Reason given there: "OpenAI wants to funnel compute toward coding tools and enterprise customers." Announcement date 24 Mar 2026 per several secondary reports (Engadget, Zilliz FAQ, etc.); one fact-check page says OpenAI later clarified only the app was ending — so say "the Sora app and API", not "the model". Both dates are now in the past (today 2 Nov 2026) — the API shutdown is by schedule, not independently confirmed to have executed (no official page reached): word it "scheduled to close 24 Sep 2026". Our own evidence: duel census — 4 of 5 listed free image-to-video demos dead on the day; one demo "No GPU was available after 60s".
Card 'sh' added to the cut (after the open-source card, before the collage). Narration (red1): "And with AI, it can all be shut off tomorrow. OpenAI announced it was closing Sora: the app on the twenty-sixth of April, the API in September. What I show runs in a browser tab. No install. MIT licensed, examinable, and it gets better as the tech does — mine, not rented."
Caveat for "gets better as tech improves": it is a claim about the project's direction (red1's), not a measured one; keep it first person.

## §VOICE (user 2026-11-02: "is there a 'Morgan Freeman' deep voice to use?")
- NOT doing: a Morgan Freeman voice or sound-alike/clone (a real person's voice, no consent; and this film's whole argument is "what you see is what it is" — an impersonated narrator undercuts it). Say so plainly if asked again; no workaround.
- Existing routes (FILM_NARRATION.md PLAYBOOK): red1's OWN voice via the prompter (§0.1, red1 2026-10-03) — fits "it is my voice to argue this" and "no AI in the film"; or local Kokoro v1.0 TTS (CPU, deterministic, no data leaves the machine; English voices af_heart / am_michael were the settled pair).
- Deep-male Kokoro candidates rendered 2026-11-02 (speed 0.92, the reveal sentence; build/film_vs_ai/voice_samples/*.wav), median F0 measured with parselmouth: am_onyx 84 Hz · bm_lewis 87 Hz · am_adam 114 · am_michael 115 · bm_daniel 124 · am_fenrir 129 · bm_george 140. Lower F0 = deeper; choice of timbre is red1's ear (taste, not a witness). Credit line option per playbook: "Script: red1 · Voice: synthetic".

## §VOICE decision (2026-11-02): male = am_adam (red1: "use adam"). Female part (F in the F/M opening cards and any dialogue lines): candidates rendered to build/film_vs_ai/voice_samples/F_*.wav — af_heart (settled English female in FILM_NARRATION.md; keeps continuity with earlier films), af_nicole, af_bella, bf_emma. Default if red1 does not pick: af_heart.

## §VOICE FINAL (2026-11-02): M = am_adam, F = af_heart (red1: "use adam … sorry I mean heart"; bella dropped). Two-voice dialogue script: prompts/film_narration_vs_ai_dialogue_v1.tsv (id cue end source SHORT DETAIL; cues = segment starts of the cut). Fit: FILM_VOX_F=af_heart FILM_VOX_M=am_adam film_narration_fit_kokoro_v3.py. Credit line: "Script: red1 · Voice: synthetic".

## §CUT v2 (2026-11-02, narrated) — chapter card, camera-snap flash, graph close
Built by scripts/film_vs_ai_build.py + film_vs_ai_retime.py (picture waits for the voice) + film_narration_fit_kokoro_v3.py (F af_heart / M am_adam) + film_narration_mux.py; shutter SFX mixed after. Output: build/film_vs_ai/cut/FilmVsAI_narrated_v2_1920x1080_24fps_2026-11-02.mp4 (223.7 s, 5,369 frames = silent cut's 5,369).
- Opening Chapter 1 "THE CLAIM — WHAT IT MIGHT BE vs WHAT IT IS" (3.2 s), style of the DXF2BIM films (bg #14161c, ink #F3EEE8, coral #FF6B78, DejaVu Sans Bold, letter-spaced). Then 7 Alt+S stills, 0.71 s each, fade-in 0.06 s / fade-out 0.14 s, a CC0 camera shutter (bigsoundbank 2391, ~/Videos/OplogPic_camera_SLRburst2…) on each at t = 3.21, 3.92, 4.62, 5.33, 6.04, 6.75, 7.46 s (§SFX line).
- Closing card 'graph' (12 s, retimed to the voice): capability matrix, AI video tools vs this pipeline, 9 rows, filled/half/ring marks (shape + word, not colour alone), 13 numbered citations on the card. Concession rows (looks gorgeous in seconds; starts from a prompt) go to AI on purpose. Palette contrast on #14161c: coral 6.57, blue-grey 7.54, ink 15.68 (computed; the dataviz validator script is an ES module that printed nothing under node 18 — not used).
- Fix: collage dialogue extended (offline line) — the 191–198 s silence of v1 is gone.
- WITNESS (numbers): fit 34/34 DETAIL, 0 SHORT/SKIP, 0 WRONG-tone; silencedetect (-40 dB, ≥2.5 s) = opening 3.3 s (chapter card, picture-only by design) + 71.1–74.1 s (3.0 s); loudness −17.0 LUFS; frames match.
- NOT done: no listen/watch by red1 or me; credit line "Script: red1 · Voice: synthetic" not confirmed on screen; Alt+C prep seconds = red1's timing, not a log; collage labels unverified vs source films; atria stills' building unconfirmed.

## §CUT v3 (2026-11-02): opening chapter retitled "I vs AI" (red1). Output build/film_vs_ai/cut/FilmVsAI_narrated_v3_1920x1080_24fps_2026-11-02.mp4 (223.7 s). Same voices/timeline/SFX as v2 (cues unchanged, audio reused); picture rebuilt and re-muxed because the mux burns subtitles into the video (so a plain video splice would have dropped them). Card: "CHAPTER 1 · THE CLAIM" / big "I" (ink) "vs" (muted) "AI" (coral) / "What it might be, or what it is. One of them you can check."

## §CUT v4 + MALAY (2026-11-02)
- Captions: M voice now coral red #FF6B78 (ASS &H00786BFF) bold, black outline 3.4; F voice cream unchanged (red1: blue captions did not contrast on blue UI scenes). The shared prompts/film_narration_ass_head.txt is NOT edited; the film-specific head lives in the session scratch (copy of it with those two Style lines changed).
- Caption collision fixed: source excerpts with burned-in subtitles (h_glory, s_5d/s_4d/s_card, k_upg/k_split, all collage clips) get their bottom 170 px band blurred (`mask=True` in scripts/film_vs_ai_build.py) so they no longer overprint our captions. Source on-screen UI labels (e.g. "CHAPTER 5 · THE VIEWER", "BIM OOTB · MODELLER · DXF2BIM") are still English in the Malay film.
- English v4: ~/Videos/FilmVsAI_narrated_v4_1920x1080_24fps_2026-11-02.mp4 (223.7 s, fit 34/34 DETAIL, 0 WRONG, −17.0 LUFS, frames 5,369 = silent). v3 left in place (has the caption collision + blue captions).
- Malay: ~/Videos/FilmVsAI_Malay_narrated_1920x1080_24fps_2026-11-02.mp4 (319.1 s, fit 34/34 DETAIL, 0 WRONG, −16.2 LUFS, frames 7,657 = silent). Script prompts/film_narration_vs_ai_dialogue_v1_ms.tsv (same ids/cues/sources/turn count as English), on-screen text scripts/film_vs_ai_ms.py (FILM_LANG=ms FILM_OUT=build/film_vs_ai/cut_ms), voices Edge TTS ms-MY Yasmin (F) / Osman (M) — narration text goes to Microsoft (playbook), cached; no model data. Title "I lwn AI" (red1: "I lwn AI", lwn = lawan). The credit line is the Edge CFG's ("Suara: dijana AI (Microsoft Edge TTS, awan) · Skrip diarahkan oleh red1") — it is the one shown on screen for Malay.
- Malay is 43% longer than English (319 s vs 224 s; playbook expects 30–40%): the picture waits for the voice, so it stretches. A trim pass (shorter DETAIL lines) is the lever if red1 wants it nearer 4 min.
- NOT done: native-speaker review of the Malay (translation + question tone); nobody has watched/listened to either file.

## §CUT v5 + MALAY v2 + MANDARIN (2026-11-02, final of this session) — in ~/Videos/
- FilmVsAI_English_narrated_… (223 s), FilmVsAI_Malay_narrated_v2_… (320 s), FilmVsAI_Mandarin_narrated_… (273 s). Each: fit 34/34 DETAIL, 0 SHORT/SKIP/WRONG-tone, frames = silent cut, only silence ≥3 s = the opening chapter card (3.3 s, by design), loudness EN −17.0 / MS −16.2 / ZH −16.7 LUFS. Superseded English v3/v4 and the first Malay deleted from ~/Videos.
- Fixes this round: red captions for M (see §CUT v4); source-subtitle band blurred; graph card footnotes moved up (rows 54 px, notes 17 px) so captions no longer overprint them (the v4 English had this overlap); Mandarin chapter title 我 vs AI (Malay: I lwn AI).
- PRONUNCIATION REVIEW (method: faster-whisper small ASR of each fitted line, intended vs heard; ASR is a PROXY, not an ear — confirm by listening). Findings & fixes:
  · ms: "A I" read letter-by-letter → respelled for the voice only: AI→"Ei Ai", API→"Ei Pi Ai" (captions keep AI/API). ASR then heard EII/EIPI. "M I T" was voiced "minit" → "Em Ai Ti"; "I F C" mangled → "Ai Ef Si" (heard IFC). "Alt C" → heard "Al Tsi" (acceptable). Three J S → "3JS", S Q Lite → "SQ Lite" (acceptable).
  · zh: respelling AI→诶艾 was heard as 悲哀 ("sorrow") in A/B on the same sentence → DROPPED; plain "AI" is heard as AI (A/B: plain=AI, mapped=悲哀). API, I F C, M I T, E R P, OpenAI, Sora heard correctly as written. "Alt C" heard "Out C" (English-style 'alt'; left as is). "Three J S" heard "FreeJS" (th→f; left).
  · Edge voices: shared script prompts/film_narration_fit_edge.py untouched; the pronunciation hook lives in a scratch copy (…/scratchpad/film_narration_fit_edge_pron.py — lost on reboot; the two lines are: ms regex AI/API/M I T/I F C respell; zh none). RE-CREATE from this note if a re-run is needed.
- Malay/Mandarin NOT reviewed by a native speaker; no one has listened to any file. Mandarin title "我 vs AI" is my choice (red1 asked for "I lwn AI" only for Malay) — confirm.

## §MALAY v3 (2026-11-02): "AI" pronunciation settled by red1's listening test
Variants rendered (Yasmin, "Tiada model X di mana-mana."): 1 "A I", 2 "A. I.", 3 "A-I", 4 "Ei Ai", 5 "Ey Ai", 6 "Eh Ai", 7 English-voice splice. red1 chose **3 = "A-I"** (hyphen). Earlier attempts: "A I" = Malay letter names ("A pertama"); "Ei Ai" = 3 syllables. API → "A-P-I" by analogy (not separately listened). Mandarin: red1 confirms the voice reads "AI" correctly as written. Hook (scratch copy of film_narration_fit_edge.py, lost on reboot): in tts_base for ms: 'M I T'→'Em Ai Ti', 'I F C'→'Ai Ef Si'; wrapper tts(): ms only, AI→'A-I', API→'A-P-I'. SAMPLE FILES: build/film_vs_ai/voice_samples/ai_variants/.
Malay v3 in ~/Videos/FilmVsAI_Malay_narrated_v3_1920x1080_24fps_2026-11-02.mp4: 316 s, fit 34/34 DETAIL, 0 WRONG, −16.2 LUFS, frames 7,592 = silent cut; only silence ≥3 s = chapter card. Superseded Malay v2 deleted. LESSON: an edit that truncated the scratch fit script (s[:a]+new) silently produced an empty probe — always re-run a 2-row smoke test after patching a copied script.
