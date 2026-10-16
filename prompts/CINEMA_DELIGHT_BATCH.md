# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** SIX delight items for the Cinema Path Editor, agreed with the user 2026-07-29. Nothing else.
Each is specced here with the user's own words, the decision, what it CONSUMES that already exists, the
open questions, its witness claims and an honest cost. **No item may be implemented before its open
questions are answered** — three of them change what gets built.
**Read the log after every run.** Verification on this project is `§`-tagged console output, not
screenshots — and for anything continuous (camera path, angles, rates) it is the NUMBERS, per CLAUDE.md's
FUNDAMENTAL LAW. Honour this block until this file is DONE.
**Canonical parent:** `prompts/CINEMA_PATH_EDITOR.md` (2,400+ lines) owns the editor's settled doctrine —
§CPE_BANDS, §CPE_EVEN_TURN, §CPE_JERK_DEFINITION, §CPE_HOSE, §CPE_STICK, §CPE_IDB_PATH_STORE. **Read its
settled rules before touching anything here.** This file is the forward queue, not a replacement.

## Shipped state this builds on (2026-07-29)
- `bim-ootb` **PR #1074 MERGED** — §CPE_HOSE, §CPE_STICK, §CPE_CLIP, §CPE_BUILDUP, §CPE_AIM_DENSITY,
  §CPE_PREVIEW_BUTTON. **PR #1078 MERGED** — §CPE_BUILDUP_REAL_SCHEDULE (another session; reveals by a
  real schedule when the DB has one, camera-path order otherwise).
- Branch `feat/cpe-hose` @ `b63a0d1` — §CPE_STICK_ANCHOR, §CPE_HOSE_REANCHOR, §CPE_IDB_PATH_STORE.
  CPE **v13**, MAXQ **v15**, sw **v875**.
- Witness `witness_cpe_hose.js` — 29/29 on Duplex, D1 known-limit on Hospital_3 (recorded, not tuned).

## ⚠ THE COST THAT WILL BITE FIRST — read before adding any feature
**`§CPE_REPLAN_SLOW ms=600–1000` on EVERY edit on Terminal** (user's own log, 2026-07-28, 48,433
elements, 4 bands). Every drag re-runs the WHOLE plan — `§CINEMA_PLAN_MS ~550` of which is
`fanRays=32 spaceCands=52 exitCands=135`, i.e. the BVH fan and the exit-door scoring — even though a
band drag changes only the walk geometry and cannot change which door the dive exits through.
**This grows with band count, and §CPE_STICK now lets the user add bands freely.** Every item below
makes the editor more inviting to fiddle with, which makes this worse.

### §CPE_REPLAN_LAZY — the user's diagnosis, confirmed by their own log
> User, 2026-07-29: *"is it tied to the best alt pipe feature? Cant that be lazy only when user press
> that feature?"*

**Yes — and the proof is already in their console.** Across EVERY drag in that session, the expensive
block printed **byte-identical values**:
```
§CINEMA_SPACE cand=CORRIDOR_ROOM::Aras Tanah|y|119.95 area=131.5 enclosed=100% chosen=true
§CINEMA_DIVE  settle=(3.7,-15.7,3.4) floorY=-17.39 nudge=5.93m yaw0=-152.4° diveDist=53.0m
§CINEMA_EXIT  chosen=1hnR05M7n4hAsCinhpv9DL dist=6.4 cost=11.3 candidates=135 runnerUp=…@12.8
```
Identical settle point, identical door, identical cost, identical runner-up — **on eight consecutive
re-plans.** That is ~550 ms of BVH fan raycasts, 52 space candidates and 135 scored doors producing
the same answer every time, because that block depends only on (a) the MODEL and (b) the camera basis
— and §CPE_PREVIEW_DIVERGENCE already **pins the basis to the pose the editor opened with**, precisely
so that orbiting cannot change the film. The cache key is therefore trivially stable for the whole
editor session: *nothing the user can do while editing can change it.*

**The seam is clean.** In `_cinemaPathPlan`, everything from `arcBbox`/`pivot` through §CINEMA_SPACE,
§CINEMA_DIVE and §CINEMA_EXIT runs BEFORE the `if (_cpeBands …)` block that expands bands into the
route. Bands, hose and clip all act after it. So: compute that prefix once on editor open, hand it to
subsequent re-plans, and re-run only the parts that legitimately changed — band flow, hose, pacing,
§CPE_NOISE_LAW probes, `poseAt`.

**Better than lazy: give the user the button they implied.** Re-deriving the entry is a real thing they
may WANT (a different room to dive into, a different door to walk out of) — it just should not happen
eight times by accident while dragging a stick. So: cache by default, plus a **`re-derive entry`**
control that recomputes the prefix on demand. That turns a hidden 550 ms tax into an explicit feature.

**⚠ Gate it on equivalence, not on speed.** The failure mode is a stale cache silently pinning the film
to a settle point or door that no longer applies (e.g. after a building switch or a `_metaGen` bump).
**W-REPLAN-CACHE:** for N random band/hose edits, the cached plan's sampled poses must equal the
uncached plan's within 1e-6 m — same discipline as `§INCR_VERIFY mismatch=0` in the Time Machine work,
where an equivalence witness caught exactly this class of bug. Report `§CPE_REPLAN_LAZY hit=<n>
miss=<n> savedMs=<n> prefixMs=<n>` so the saving is a number, not a hope.
**Cost: MEDIUM, and it pays for every other item in this file.** Do it first.

---

## 1. §CPE_HOVER_SCRUB — scrub the film by moving the mouse along the pipe
> User: *"i reckoned it allows a 1 sec stop to take effect of intent? Or a pop up eye 'see'?"*

**Agreed: hover the tube, the camera flies to that point in the film.** The user already named the
value: *"Corelation with the whole pipe during the journey is great instant feedback."* This makes the
pipe scrubbable without committing to a 10 s preview.

**The intent question is theirs and it is the design decision here.** Two shapes, and they are not
equivalent:
- **(a) DWELL** — hover ~1 s over one spot, THEN the camera goes there. Deliberate, no accidental
  flights while reaching for a band handle, but every look costs a second.
- **(b) EYE BADGE** — a small "👁 see" chip appears at the hovered point; the camera moves only if you
  click it. Zero accidental motion, always instant when wanted, one extra click.
**Recommendation: (a) dwell, with the dwell timer visible as a filling ring on the hover point** — it
answers "is it about to do something?" without a second affordance, and the ring IS the feedback.
⛔ **Ask the user which before building.** They floated both and did not choose.

**Consumes, already exists:** `_hitTestPath` (the pipe hit-test, screen-space, already used by
§CPE_HOSE/§CPE_STICK), `plan.poseAt(t)` (pure function of t), `_state.flowFrac`.
**⚠ Traps:** (i) the camera must return to the editing pose on hover-out, exactly as `_previewFly`
does, or the user loses their working viewpoint; (ii) §CPE_PREVIEW_DIVERGENCE — the plan is pinned to
the pose the editor OPENED with, so hover-flying must NOT re-pin it; (iii) `§IDLE_GATE` parks the rAF
chain — hover motion needs `markDirty()` or it will not render.
**Witness:** `§CPE_HOVER t=<f> dwellMs=<n> flewMs=<n> restored=1` + assert the camera pose after
hover-out equals the pre-hover pose within 1e-3 m.
**Cost: SMALL** — half a session. No re-plan involved (this is why it is first).

## 2. §CPE_ROOM_TITLE — the room name appears as the film enters it
> User: *"2 is a wow but should have a checkbox allowing"*

**Agreed, behind a checkbox, OFF by default.** The plan already knows the space —
`§CINEMA_DIVE src=room-graph space="≈ Aras Tanah Hall/Corridor 1" areaM2=131.5`.

**⚠ THE REAL COST IS NOT THE LOOKUP, IT IS THE COMPOSITE.** A DOM overlay will NOT appear in the baked
film: `cinema_maxq.js` captures the RENDERER CANVAS (`_captureFrame`), not the page. So the title must
be drawn INTO the captured frame — either a canvas texture in the scene, or a 2D composite step
between capture and IDB write. The second is simpler and cannot disturb the Alt+S fold. **Do not
prototype this as a DOM caption and declare it done — it will be invisible in the mp4.**
**Also decide (ask):** name per room the walk PASSES THROUGH (needs per-`t` room lookup along the
path), or only the settle room and the exit? The first is the "narrated tour" the user is imagining;
the second is nearly free. Recommend starting with per-room and a 1.2 s fade, since the room graph
already supports containment queries.
**Witness:** `§CPE_ROOM_TITLE t=<f> room="<name>" src=room-graph composited=1` and a pixel assertion
that the captured frame differs from an uncomposited capture in the title band only.
**Cost: MEDIUM** — a session. Most of it is the composite path and the fade timing.

## 3. §CPE_SUGGEST — ⚠ TWO DIFFERENT FEATURES, AND THE USER'S READING IS THE BETTER ONE
> User: *"3 i need more clarification, is this secondary hoses appearing on canvas too as well as in
> panel, and user just accept it adjust to that? I was thinking same thing ie climb the stairscase
> nearby etc"*

**Clarifying honestly: I meant (3a). The user is describing (3b). They are different features and
(3b) is the more delightful one.**

**3a §CPE_SUGGEST_CLIP — best-N-seconds windows.** `§CPE_NOISE_LAW` already scores every probe along
the walk by how fast the bbox neighbourhood is CHANGING (`probes=33 maxChange=2930`). The
highest-scoring contiguous window IS the most visually eventful stretch of the film. Offer the top 3
as one-click §CPE_CLIP presets. **Panel only, no canvas geometry.** The measurement exists; only the
pick is missing. **Cost: SMALL.**

**3b §CPE_SUGGEST_DETOUR — "there is a staircase nearby, want to climb it?"** THIS is what the user
described: proposals rendered ON THE CANVAS as ghost sticks/branches the user can accept, adjust or
ignore. Source is the room graph, not the noise series: find spaces adjacent to the walk that it does
NOT enter — a stair core, a double-height space, a room the path passes the door of — and draw a
dashed ghost branch into it with an accept affordance. Accepting inserts real §CPE_STICK bands.
- **Why it fits this project:** it is the compile-not-model doctrine applied to authoring — the MODEL
  proposes the shot, the user accepts or overrides. Same inversion that makes the derived path
  interesting in the first place.
- **⚠ Do NOT invent interest.** A suggestion must cite what made it a candidate (room type, area,
  vertical connection, floor change) in its own `§` line. A proposal with no traceable reason is
  exactly the invention this project's Prime Directive forbids.
- **Open:** how many at once (recommend ≤3, or the canvas becomes noise), and does declining one
  suppress it permanently for that building?
**Witness:** `§CPE_SUGGEST_DETOUR n=<k> room="<name>" reason=<stair|volume|adjacency> areaM2=<n>
dGraph=<n>` per proposal, plus: accepting one produces bands whose flown path enters that room's
bbox (assert containment, not appearance).
**Cost: 3a SMALL (half a session) · 3b MEDIUM-LARGE (one to two sessions), mostly the candidate query
and making the ghosts readable without cluttering the pipe.**

## 4. §CPE_FILM_AUDIO — ⛔ DECLINED BY THE USER 2026-07-29. Do not re-propose.
**Re-declined 2026-08-27** — re-surfaced by the assistant during an unrelated brainstorm ("the
cheapest item, not the dearest"), missing that the header two lines below already forbids reviving it
on cost grounds. User: *"Audio is a dropped idea."* Third strike risk — read this whole block, not
just the cost table, before ever mentioning audio again.
> User: *"the reason I asked to drop the audio is because I could dub it in my Facebook with a scorpion
> song the smoke under. I have a knack of finding the right bit."*

**The reason is better than any in the analysis below, and it is a PRODUCT fact, not a preference:** the
distribution channel already supplies the soundtrack, and it supplies it better, because a human with
taste is choosing the track and the cut. In-app film audio would compete with that and lose. **Cost was
never the objection — do not revive this item by arguing it is cheap.**

⚠ **One factual distinction, offered once and then left alone (the user's call, not a re-argument):**
Stage 1 below is **§CPE_AUDIO_CUES — a cue list, not audio.** It emits `film-cues.json`/CSV of the
moments the film already knows are worth scoring (beat boundaries, room transitions, the exit-door
crossing, 4D phase changes) with **no encoder, no muxer, no AudioContext**. That is a marker track FOR
the person doing the dub — i.e. it serves the exact workflow the user described rather than replacing
it. It stays DECLINED unless they ask; it is recorded here only so nobody re-derives it from scratch.

### (Original analysis retained below for that reason only — the item is closed.)
## 4. §CPE_FILM_AUDIO — RE-THOUGHT 2026-07-29, and it is now the CHEAPEST item, not the dearest
> User: *"yes when V is ON it is recorded so user can control not to have it embedded"* → then, on
> reading the cost: *"can we make it like TM machine where it is auto triggered? Or cheaply. And when
> user check the audio box, can we display the cost in Mb? Then user can decide to do it post
> production in better studio. This is just early win stuff."*

**Their re-think is right and it dissolves most of the cost I quoted.** My "LARGE" estimate assumed
the deliverable was an AAC track muxed into the mp4. It does not have to be, and for their own stated
purpose — *"do it post production in better studio"* — a muxed track is actually the WORSE deliverable:
a sound designer wants stems and timings, not a bed already welded into the video.

### THREE STAGES, and stage 1 alone may be the whole win
**Stage 1 · §CPE_AUDIO_CUES — a timed cue list beside the mp4. Nearly free, and the most useful to a
studio.** The film already knows every moment worth scoring, all derived, none invented:
`§CINEMA_BEATS dive/spin/out/rise` (beat boundaries in normalised t → seconds via the known duration),
room transitions (§CPE_ROOM_TITLE's own per-`t` lookup, item 2), the exit-door crossing
(`§CINEMA_EXIT`), and — when §CPE_BUILDUP is on — phase changes, which is exactly the `_sfxPhases`
signal Time Machine already derives per tick. Emit `film-cues.json` (+ a CSV for editors that want
markers) alongside the video. **No encoder, no muxer, no AudioContext.** Cost: HALF A SESSION.

**Stage 2 · §CPE_AUDIO_BED — render those cues to a WAV sidecar, offline.** `viewer/sfx.js` already
holds the 24-voice cinematic set and creates its AudioContext lazily. Render the cue list through an
**`OfflineAudioContext`** — which renders FASTER than real time and does not need a user gesture or a
live context — into a PCM buffer, write a WAV, download it beside the mp4. **Still no muxer change,
still no AAC.** Two files the user drops on a timeline, in sync by construction because both are
derived from the same `t`. Cost: ONE SESSION. ⚠ Check first whether sfx.js SYNTHESISES its voices or
decodes samples — synthesis is trivially re-renderable offline, samples need the buffers loaded first.

**Stage 3 · muxed AAC track — DEFER, and possibly never.** This is the only part that needs
`AudioEncoder` + interleaving in `lib/mp4_mux.js` + the same again on the webm fallback. Do it only if
users actually ask for one self-contained file. Everything above delivers the value without it.

### The MB readout they asked for — build it, but expect it to argue AGAINST their instinct
> *"when user check the audio box, can we display the cost in Mb?"*

Yes, and it is pure arithmetic from numbers already in the code — **but the honest answer is that it
will show audio is nearly free in bytes, so file size is the WRONG reason to skip it.** Worked from
`cinema_maxq.js:284` (`bitrate = min(50e6, max(2e6, w*h*fps*0.2))`) against the user's own 30 s /
1853×961 / 15 fps run:
| stream | rate | 30 s film |
|---|---|---|
| video (their actual settings) | ~5.34 Mbps | **~20 MB** |
| AAC 128 kbps stereo | 16 KB/s | **0.48 MB — 2.3% of the video** |
| WAV 16-bit stereo 48 kHz (stage 2 sidecar) | 192 KB/s | **5.8 MB — 29%, and it is a SEPARATE file** |
So the checkbox should show **both** numbers side by side (video estimate + audio estimate), because
the ratio is the actual information. **And the label must say the real trade-off honestly: the reason
to score in a studio is QUALITY — a browser-generated bed from 24 UI voices is not a sound design —
not megabytes.** A readout that lets the user infer "audio is expensive" would be a true number
telling a false story, which this project's whole logging doctrine exists to prevent.

### "Auto triggered like TM"
Yes — that is stage 1's cue source and it is the right instinct: TM already derives `_sfxPhases` from
the ops at the frontier each tick, and mode D gives the film that same per-frame phase set. So the
cue list is DERIVED from construction state, not authored by hand. Same rule as everywhere else here:
every cue must name what produced it (`beat`, `room`, `door`, `phase`) or it is invention.

**Witness:** `§CPE_AUDIO_CUES n=<k> src=beat|room|door|phase spanSec=<n> firstSec=<n> lastSec=<n>`
(assert cue times are monotone and inside [0, duration]); `§CPE_AUDIO_BED renderedSec=<n> offlineMs=<n>
bytes=<n> sampleRate=<n>`; `§CPE_AUDIO_SIZE videoMB=<n> audioMB=<n> pct=<n>` on checkbox toggle.
**Cost: stage 1 SMALL (half a session) · stage 2 MEDIUM (one) · stage 3 LARGE (defer).**
**This moves item 4 from LAST to EARLY — stage 1 can ship alongside item 1.**

## 5. §CPE_FIND_TO_FILM — pick rooms in Find, get a path, film it
> User: *"that is good reuse, open same time Find get room2room pathing was what i tot shuld be done
> there, thus a alt-s button there besides path to '>' Film?"*

**Agreed, and this is the highest PRODUCT value of the six** — "show me the lobby, the ward, the roof"
is what a client actually asks for, and it turns the film from a demo into a deliverable.
Shape: select rooms in the Find panel → room-to-room route → a **`▶ Film`** button beside it hands
that route to the cinema planner as authored bands (the same override object §CPE_IDB_PATH_STORE
already stores), which opens the editor with the path pre-built.
- **Consumes:** the room graph that already picks the dive target and scores exit doors; the
  `bands`-shaped override the plan already accepts; §CPE_STICK's now-arbitrary band count (a 5-room
  tour is simply 5+ bands — impossible before that shipped).
- **Open (ask):** does `▶ Film` bake immediately, or open the editor pre-loaded? Recommend the editor
  — the user has consistently wanted to see and adjust before committing to a cook.
- **⚠ Trap:** the route between rooms must come from the room graph, NOT from straight lines between
  room centres, or the camera walks through walls. §CPE_BANDS rule 8 ("authored is authored") permits a
  user to drag a path through a wall; it does not license the GENERATOR to do it.
**Witness:** `§CPE_FIND_FILM rooms=<n> routeLen=<m> bands=<n> src=room-graph` plus assert the flown
path enters every selected room's bbox, in the selected order.
**Cost: MEDIUM** — a session, assuming room-to-room routing is reusable as-is. If it is not, this
becomes large and should be re-scoped rather than half-built.

## 6. §CPE_SPEED_RAMP — linger here, hurry there
> User: *"6 agreed"*

Per-section pace multiplier, dragged on the pipe: slow the atrium, hurry the corridor.
**⚠ HIGHEST REGRESSION RISK OF THE SIX — it touches the pacing law.** §CPE_EVEN_TURN's whole guarantee
is that frames advance by equal increments of a blended cost, which BOUNDS turn-per-frame and
distance-per-frame. A raw user multiplier on top of that breaks the bound and the jerk comes back —
that lane cost several sessions and three dead ends to settle. **The ramp must be folded INTO the cost
integrand (a per-section weight before `_paceBuildRemap` consumes it), never applied as a multiplier
after it**, and `PACE_SWING` must still bound the delivered range.
**Gate: the existing peak-deg/frame witness must not regress**, exactly as §CPE_AIM_DENSITY was gated.
**Witness:** `§CPE_SPEED_RAMP sections=<n> factors=[…] deliveredRange=<x> peakTurnDeg=<n> (bound=<n>)`.
**Cost: MEDIUM** — a session, but with the highest chance of needing a second one to re-earn the jerk
gates. Do it LAST of the cheap items, and never in the same PR as another pacing change.

---

## Cost summary, and the build order
| # | item | cost | risk | why this order |
|---|---|---|---|---|
| 0 | **§CPE_REPLAN_LAZY** (cache the dive/exit prefix) | medium | low | user's own log shows ~550 ms producing IDENTICAL output on 8 consecutive drags; pays for every item below |
| 1 | §CPE_HOVER_SCRUB | small | low | biggest felt win per line; no re-plan involved |
| 3a | §CPE_SUGGEST_CLIP | small | low | the ranking already exists, panel-only |
| 4a | §CPE_AUDIO_CUES | small | low | ships alongside item 1; see the re-think in §4 |
| 5 | §CPE_FIND_TO_FILM | medium | medium | highest product value; needs room-graph routing to be reusable |
| 2 | §CPE_ROOM_TITLE | medium | medium | the composite path is the real work, not the lookup |
| 6 | §CPE_SPEED_RAMP | medium | **high** | touches the settled pacing law; gate on peak deg/frame |
| 4b | §CPE_AUDIO_BED (WAV sidecar, OfflineAudioContext) | medium | low | still no muxer change; two files, in sync by construction |
| 3b | §CPE_SUGGEST_DETOUR | medium-large | medium | the most delightful, and the most design-dependent |
| 4c | muxed AAC track | large | medium | **defer, possibly never** — only if users want one self-contained file |

## ⚖ "Does this push us up the world ranking of BIM apps?" — the honest answer
**No, and it is worth being precise about why, because the honest answer is more useful than yes.**
BIM app ranking is decided by import fidelity, model scale, collaboration/permissions, clash and
quantity workflows, and ecosystem — not by film-making. Nothing in this batch moves those.

**What this batch actually does is make ONE capability distinctive rather than comparable.** The
defensible claim is narrow and true: *a model-derived cinematic path you edit by dragging the flight
itself, baked to photoreal video entirely in a browser tab, with the construction reveal following the
camera.* Every word of that is witnessed. Items 1, 3b and 5 strengthen exactly that claim — the model
proposing shots, and a tour assembled from named rooms, are the parts nobody else's camera tool does,
because nobody else's camera tool knows what a room IS.
**Do not claim "first" or "only" without a survey** — see `project_bim5d_outreach_lane`. One
counterexample makes a good post look sloppy to the audience it is aimed at.

## ⛔ Open questions to put to the user BEFORE building (3 of them change the build)
1. **§CPE_HOVER_SCRUB:** dwell-to-fly, or eye badge + click? (recommended: dwell with a filling ring)
2. **§CPE_ROOM_TITLE:** every room the walk passes through, or only settle + exit? (recommended: every)
3. **§CPE_SUGGEST_DETOUR:** how many proposals on canvas at once, and does declining suppress it for
   that building? (recommended: ≤3, and yes, remembered per building)
4. **§CPE_FIND_TO_FILM:** does `▶ Film` bake immediately or open the editor pre-loaded? (recommended:
   the editor)

---

## 7. §CPE_WHEN_HERE — the camera asks the schedule "when is THIS built?" (user, 2026-07-29)
> User: *"will it be standard Z value build or will it take from generated 4D schedule? That will kill
> birds and can be free? Because from there can be creative way to study its construction at certain
> parts along the path of interest."*

### First, the factual answer — it is ALREADY both, and it auto-selects (verified in merged code)
Read from `origin/main:viewer/time_machine.js`, not from the other session's report:
- `window.tmScheduleSource()` decides from the OPS THEMSELVES — dated leaf tasks must exist AND the
  loaded ops must be keyed to them (`parameters._captured`).
- **captured** → `tmOrderBySchedule()`: reveal follows `schedule_start`, **no re-key at all**. The
  `_cap` overlay already keyed every covered op to its task's `[schedule_start, schedule_finish]`, with
  §PLAYBACK-STAGGER spreading each task's guids bottom-up by `center_z` inside that window.
- **derived** → `tmOrderByCameraPath()`: the Z-band + `SEQUENCE_RULES` order, re-keyed to the flight.
- **On `TerminalHi4D.db` all 48,433 ops carry `_captured:1`** spanning a real 2026-01-01..2026-05-30
  window — so the injected schedule IS what drives that building's buildup. #1078's own comment
  records that mode D's re-key was **destroying** it before the fix, caught by the witness.

### ⚠ Which also means the two modes are MUTUALLY EXCLUSIVE by nature
You cannot re-order a real programme by camera path and still call it the programme. So "camera-ordered
buildup" and "real-schedule buildup" can never merge — **and the user's idea is the resolution:** stop
using the camera to re-order, and start using it to ASK.

### The feature: mark a place on the path, get its construction window
1. A point on the flight → nearest elements (`element_transforms`, the same query mode D already runs).
2. Those elements → their task and `[schedule_start, schedule_finish]` (the `_cap` keying, already there).
3. Report it, and offer it as a **§CPE_CLIP preset**: a clip whose TIME window is that location's
   construction window, with the camera parked at that stick.
**That is the two birds.** The camera picks WHERE, the schedule says WHEN, and the clip is the
intersection — "show me this atrium being built, and only that." It turns the film from an output into
a query instrument, which is the same inversion that makes the derived path interesting.
It also composes with everything already shipped: §CPE_STICK marks the place, §CPE_CLIP cuts the
window, §CPE_BUILDUP renders it, §CPE_HOVER_SCRUB (item 1) previews it.

**Consumes, all existing:** `tmScheduleSource()`, the `_cap` op→task keying, `element_transforms`,
`§CPE_CLIP`. **No new data, no new subsystem.**
**Open (ask):** radius around the path point — fixed metres, or the room containing it? (recommend the
ROOM, since the room graph already answers containment and "this space" is what a user means).
**Witness:** `§CPE_WHEN_HERE t=<f> room="<name>" elems=<n> tasks=<n> window=<iso>..<iso> days=<n>`
plus: the derived clip's placed-count at its first frame must be < at its last (it must actually show
construction happening, not a static before/after).
**Cost: SMALL-MEDIUM** — half to one session. **Only meaningful on a building with a real schedule**,
so it is Terminal-4D-first; on derived buildings it must say so rather than invent a window.

### ⚠ WORDING now has THREE tiers, not two — update §NOT-CLAIMS when this ships
| tier | data | honest phrase |
|---|---|---|
| derived | no tasks (Terminal_Hi, Duplex, Hospital) | *"derived build order"* — never "the schedule" |
| authored | real dated tasks, **CPM columns empty** (TerminalHi4D) | *"a linked 4D schedule"* — NOT "critical path", NOT "programme logic" |
| imported | P6/XER with logic + float | **none yet** — do not imply it |
`early_start`/`late_start`/`is_critical`/`total_float` are EMPTY on TerminalHi4D (verified), and
`§CPE_BUILDUP_SOURCE` says so itself: *"no float/logic in this data"*. A 4D audience will ask.

---

# ▶ SESSION CLOSE 2026-07-29 — the tier is a property of the DATA, and the sentence to carry forward

## "But it can, if 4D is generated first, similar to TerminalHi4D.db?" — YES, and for both tiers
**The three tiers are not properties of a BUILDING. They are properties of what is in its DB**, so any
building can be promoted, and neither promotion is a data-import project:
- **tier 1 → tier 2 (real dated tasks):** `materializeDefault()` + the Schedule Author wrote
  TerminalHi4D's schedule — the fingerprint that identified it was `SCH_AUTHORED`,
  `TASK_ROOT="Project"`, 30-day windows, i.e. **authored in-app, not imported from XER**. Run the same
  path on any building and `tmScheduleSource()` starts reporting `source=captured` for it, and
  §CPE_BUILDUP switches to schedule-driven **with no code change at all** — the branch is already there
  and already witnessed.
- **tier 2 → tier 3 (critical path / float):** `computeCpm` **already exists** —
  `viewer/schedule_author.js:508`, wired via `schedule_editor_ui.js:385` + `schedule_sync.js:26`, with
  its own witness `erp/tests/schedule_cpm_witness.js`. It has simply **never been run against
  TerminalHi4D** (its `early_start`/`late_start`/`is_critical`/`total_float` columns are empty —
  verified). So "critical path" is **one function call plus a witness pass away**, not a roadmap item.

**⚠ The nuance that keeps it credible even after CPM runs.** A materialised schedule is DERIVED
durations, not a contractor's programme. So:
- tier 2 stays *"a linked 4D schedule"* — never *"the project schedule"*.
- tier 3, once CPM has run, is *"critical path computed from the derived schedule"* — **not** *"the
  project's critical path"*, unless real durations and logic came from a real programme.
The distinction costs nothing to state and is exactly what a scheduler will probe first. Do not lose it
in the excitement of the columns filling in.

## THE SENTENCE — carry this forward verbatim
> **A model-derived cinematic path you edit by dragging the flight itself, baked to photoreal video
> entirely in the browser, with the construction reveal following the camera.**

Full clause-by-clause backing, the adjacent-field survey and the DO-NOT-SAY list live in
`prompts/PUBLIC_TECH_STATEMENT.md` §COMPETITIVE_POSITION. **Read that before any public claim** — in
particular: no *"first"* / *"only"* without a verified sweep (half a session, not yet run), and no
ranking claims against Revit/Navisworks, because ranking is import fidelity, model scale, collaboration
and ecosystem and this work touches none of them. What it does is make ONE capability distinctive.

## Where the next session starts
1. **§CPE_REPLAN_LAZY (item 0)** — pays for everything else; the diagnosis is already done and proven
   from the user's own log. Gate on equivalence, not speed.
2. Then item **1 §CPE_HOVER_SCRUB** and **4a §CPE_AUDIO_CUES** (both small, both independent).
3. **Answer the five open questions first** — four listed at the end of the item list, plus
   §CPE_WHEN_HERE's radius question. Three of them change what gets built.
**Shipped and pushed as of this close:** `bim-ootb` `feat/cpe-hose` @ `b63a0d1` (CPE v13, MAXQ v15,
sw v875), PRs #1074 and #1078 merged to main. Witness `witness_cpe_hose.js` 29/29 on Duplex.

---

# ▶ OBSERVED 2026-07-29 (user, live on jkr_fixed) — the sticks ARE in the panel; the panel just can't take you to them
> User: *"the added 'bands' does not show up in the film maker panel to reselect so we can get back to
> them easily. Have to find back in canvas."* — **reported, not fixed, at the user's instruction.**

Read from `viewer/cinema_path_editor.js` (now `main`, PR #1080). Three separate things, only one of
which is a cache question:
1. **The row list DOES rebuild.** `_addStick()` calls `_renderRows()`, and every middle band renders as
   a row labelled `stick @ NN%` with x/z/y + length inputs, a `×` remove button, and the whole row is
   click-to-select (`_hold(i, 'mid', true)`). So a spawned stick is not missing from the model or the DOM.
2. **⚠ The panel header is a hardcoded lie.** `_buildPanel()`'s innerHTML contains the literal
   `— 3 bands`, never re-rendered from `_state.bands.length`. After adding a 4th band the panel still
   says three. A label that contradicts the list under it is worse than no label — same species as the
   `§CINEMA_PATH_STAGE waypoints=0` defect §CPE_IDB_PATH_STORE fixed.
3. **⚠ THE REAL GAP, and it is the user's actual complaint.** Clicking a row only sets the selection
   highlight. **Nothing moves the camera to that band.** If the stick is off-screen the panel gives you
   no way to reach it — hence *"have to find back in canvas."* The panel is an editor of bands you can
   already see, not a way of navigating to bands you cannot.
   **This is §CPE_HOVER_SCRUB's machinery pointed the other way** (panel → camera instead of pipe →
   camera), and item 1 should absorb it rather than grow a second flight path: same `plan.poseAt`,
   same return-to-editing-pose rule, same §CPE_PREVIEW_DIVERGENCE no-re-pin trap.

**Diagnosing "do I need a hard reset?" is one log line:** `§CPE_LOADED v13` = the code is current and
the explanation is (2)+(3); `v11` = the SW served a stale bundle and §CPE_STICK is genuinely absent.
Their pasted console carried no `§CPE_` lines, so this was not determined either way.

### Unrelated, also in the same console — an imported building can never be patched
`Fetch API cannot load import://jkr_fixed.db/patches/v0.sql. URL scheme "import" is not supported.`
(twice). The Viewer self-heal loader (`viewer/scene.js` `A._applyPendingPatch()`, the port landed
2026-07-11) derives the patch URL from the db URL, and an IDB-imported building's `import://` URL is not
a fetchable scheme. Harmless today — jkr_fixed has no patch — but it means **the DB-change-via-SQL
architecture in CLAUDE.md has no reach into imported buildings at all.** Named here so it is not
rediscovered; not in this batch's scope.

## ▶ OBSERVED 2026-07-29b — the x-ray film was NOT the buildup code; it is a one-shot guard the bake never re-asserts
> User: *"maybe i accidentally touched an element making the whole model going into x-ray mode which is
> a feature! Dont fix as now user can do that unless u saying this is purposely the code during buildup."*

**Answer: not purposeful — the code actively tries to PREVENT it.** `cinema_maxq.js start()` clears both
shells before a bake: §CINEMA_GHOST_RESET (`resetCinemaGhostLens()`, the Find-lens/Alt+Z bbox shell) and
§CINEMA_XRAY_RESET (`if (A.xrayOn) A.toggleXray()`), reasoned in its own comment as *"equally wrong for a
'photoreal' cinematic film, however it got on."*

**The gap is that both are ONE-SHOT at `start()`, with no hold for the duration.** Anything that engages
x-ray AFTER the bake begins — Alt+Z, or a Find-panel lens auto-engaging when an element is touched —
survives into every remaining frame, and the guard never runs again. The user's own console proves that
is what happened: `§FPS_MODE … disp=xray` interleaved with `§MAXQ_FRAME i=25…51/588`, and `disp=xray`
means `APP.xrayOn === true` (`viewer/main.js:679`) — the real X-ray toggle, **not** the `ghost=1` bbox
shell, which would print `disp=bbox`. No `§CINEMA_XRAY_RESET` line was printed, so x-ray was OFF at bake
start and came on mid-flight.

**Film delivered:** `BIM_MaxQ_jkr_1785263230241.mp4` — 1852×960, 15 fps, **588 frames = 39.20 s**, h264
@ 5.289 Mbps, 25.9 MB. The 588 matches the `i=…/588` in their log exactly.

**Treat as a FEATURE REQUEST, not a defect (user's ruling: do not fix).** Making it deliberate is a
checkbox that suppresses the reset for the run — "x-ray film" as an authored look beside
`build the model as the camera flies`. **⚠ If it is ever built, the honesty rule applies: an x-ray bake
is not a photoreal bake**, and §MAXQ's own comment is the existing statement of that. The accidental
version is also non-reproducible — it depends on when the toggle happened to land — so a deliberate
control is strictly better than the discovery.

## ▶ SETTLED 2026-07-29c — the buildup is DONE; the tools are the feature, not more engine
> User: *"anyway it is okay the buildup… It is up to the user creative skill to use all these tools.
> Need not over-engineer. He can preview the TM first and then plan out his markers. It is more
> realistic and avoid critics saying this is just a nice movie as now it is 4D schedule driven. Also
> the engineer who prepared the 4D knows the buildup. Also the gantt chart is already there in the TM
> drawer to refer."*

**All three shapes I floated for gaze-keyed reveal — (a) first-well-seen keying, (b) true per-region
replay, (c) per-region real-window playback — are CLOSED, not deferred.** The ruling is that authorship
belongs to the user: preview the TM, read the Gantt already in the TM drawer, place §CPE_CLIP markers
accordingly. **Do not reopen this without the user asking.** The reasoning is also the strongest part
of the public claim: a film cut against a real 4D schedule by the engineer who built that schedule is
defensible; a film whose reveal order was invented by a camera heuristic is what invites *"it's just a
nice movie."* `tmOrderByCameraPath` keys on PROXIMITY (nearest path sample), and that stays as-is.

**ACCEPTED, not a defect: lighting is visible from frame 1.** > *"good side effect as it gives a heads
up where the lighting will be. Also double up as construction lighting."* §PHOTO_GLOW_SPRITE stages 189
luminaire sprites before the reveal begins. Ruled a feature. **Do not "fix" it to reveal with its host
element.**

### ⚠ §CPE_CLIP usability finding — why "mark in" cut 98% of the film
> User: *"How do i do the mark in/out, i wana shorten the starting point. I pressed mark in it reduced
> completely 98%"*

`_markClip()` marks the film point **nearest the CURRENT CAMERA POSITION** in 3D — nothing else. Its own
comment claims it marks *"the CENTRE of the current preview window if one is flying, else…"*, but **there
is no preview-time branch in the code**; the nearest-point search is the whole function. So marking from
an orbited-out editing pose lands on whichever part of the film happens to pass closest to the eye —
typically the exterior orbit at the END — giving `clipIn ≈ 0.99` and a 1% window. Working recipe today:
move the camera close to the point ON THE YELLOW PIPE where the cut belongs, then press the button.
**The honest fix is to mark by TIME, not by proximity** — the preview cursor already knows `t`, and
§CPE_HOVER_SCRUB (item 1) introduces exactly that cursor. Fold it there rather than growing a third
notion of "here". The stale comment must go with it: a comment describing a branch that does not exist
is the same class of defect as the `waypoints=0` log §CPE_IDB_PATH_STORE fixed.

## ▶ FILM DELIVERED 2026-07-29 — the first Hospital bake on §CPE_BUILDUP_FOLLOW_TM (user: *"happy with it"*)
`BIM_MaxQ_Hospital_1785273910881.mp4` — 1852×960, h264/yuv420p, 15 fps, **1186 frames = 79.067 s**,
5.31 Mbps, 52.5 MB. `1186/15 = 79.0667` exactly, so **no frames were dropped or starved** by the
recorder at more than double the length of the jkr reference film (588 frames / 39.20 s @ 5.289 Mbps),
whose bitrate it matches in character.

**This is the first film whose construction reveal followed Hospital's OWN 4D timeline** rather than a
camera-path re-key — `§CPE_BUILDUP_SOURCE mode=T reason=generated-timeline ops=63421 placed=63183`,
verified in the user's live console before the bake. The 79.1 s is a derived total that rose from the
`dur=76.1s` in that same console as more hose pulls were added: length is a consequence of the walk,
which is the §CINEMA_PACING model working as specified.

The verdict on the LOOK is the user's and they gave it. Everything recorded here is a number read off
the file with `ffprobe` — per CLAUDE.md's FUNDAMENTAL LAW, a film is never assessed here by watching it.

---

# ▶ PROMOTED 2026-07-29 — §CPE_FIND_TO_FILM is the NEXT BIG POC → moved to its own file
> User: *"The find to film should be the next big POC because it will also validate the path as been
> correct. The Film maker preview can quickly confirm it."* → *"update the prompts/# for that next task
> in a new session."*

**The full plan now lives in `prompts/CINEMA_FIND_TO_FILM.md`** — phases, witness claims, the trap, and
the one blocking question. Item 5 above stays as the original scoping; do not duplicate the plan back
into this file. Everything else in this batch remains queued behind it.
