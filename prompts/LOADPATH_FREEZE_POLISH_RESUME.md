# ⚠ DO NOT REMOVE — THE ONE LIVE HAND-OFF FOR THIS FILM.
Both lanes (load-path/freeze and escape-route) fold into this file. `ESCAPE_ROUTE_REVEAL.md` is the
escape beat's DESIGN RECORD and its measurements — not a session prompt; see its §14/§14.1.
**Read the log after every run** (CLAUDE.md Log Mandate), and the FULL log, not a `=> PASS|FAIL`
grep. Never judge from frames: every claim traces to a `§` line you read yourself — not to a
description of one, and not to what red1 says they see. Their eyes are the final arbiter of a LOOK
ruling, but that is a ruling on a fix's RESULT, never a substitute for tracing the cause first.

**NEXT SESSION STARTS AT §131**, immediately below the archive. Two things are open and red1 has
seen both: the camera veering during the escape beat, and the beams still glowing through the
building. §130/§130.1 are the state; §131 is the job.

## CONSOLIDATED 2026-09-20 — what this file used to be
It ran to 1,907 lines of session narrative from 09-17 to 09-20, §129.11 through §129.63, almost all
of it superseded by the section below. red1: *"consolidate the prompts/# from stale info"*.
**Nothing operational was thrown away.** Every rule those sections earned is carried forward in
§129-ARCHIVE below, one line each with its own `§` tag. The full text of every removed section is in
git — `git log -p prompts/LOADPATH_FREEZE_POLISH_RESUME.md`, or read it at commit `fdd79c024`.

# §129-ARCHIVE — THE RULES THOSE SESSIONS EARNED. The narrative is gone; these still govern.

## On evidence
- **Read the RIGHT log.** `out/<name>.log` is the claim-filtered stdout; the multi-MB firehose is
  written beside the mp4. Counting tags in the wrong one returns 0 for things that ran thousands of
  times. Check the file size before trusting a zero. (§129.53)
- **A saving claimed from READING code is an estimate; only a run is a measurement — say which you
  have.** §129.57 was claimed at 22.9 min and measured at 7.7. Every number taken from a real
  `§FRAME_HASH` held exactly; the one taken from assuming where a call sat was wrong by 3x.
- **A green witness can be covering an unmeasured area.** `emissiveMats 0/8` sat inside a PASS for a
  whole day. (§129.53)
- **A witness that goes INCONCLUSIVE is worse than one that FAILS**, because a sweep reads it as
  "not red". A regex that stops matching when a line grows a term is the usual cause. (§130)
- **A witness should DISCOVER what it judges, not list it.** A list cannot catch the tenth layer,
  and that is exactly how §75 rotted into a half-applied fix. (§130.1)
- **NO PIXEL-DERIVED EVIDENCE.** Slice the predicate out and assert it in Node, or add `§` logging.
  Frame/IoU analysis is GIGO. Looking at a frame to judge a LOOK is fine; deriving a pass/fail from
  one is not.
- **Prove a fix FIRES, not just that it shipped.** Grep a real log. "Code changed" is not
  "behaviour changed", and a shipped-but-never-called fix is this project's most common defect.
- **If the bug is older than about a day, it is not it.** red1's rule killed three theories, each
  time pointing at innocent month-old code. The cause was always something changed that day.
- **A peer's "verified"/"fixed" is a hypothesis.** Re-check it against the code or a real log
  yourself. Check what a peer MEASURED, not just what they concluded — an A/B that proved x-ray was
  dead weight in the ORBIT was read as proving it about the STOREY REVEAL, which it never touched.
- **Run the other lane's witnesses in YOUR tree before consolidating.** Theirs caught a dropped
  `var _tnFilm` assignment that `node --check` passes, because an undeclared READ is valid syntax.
- **`ls` is not recursive.** `grep -r` the whole tree before saying a spec does not exist.

## On merging this file's modules
- **A keep-both resolution eats structure, and the parser lies about where.** Six defects came from
  one merge: three swallowed closing braces (reported at the FILE'S LAST LINE), a duplicated
  `function _captureFrame` that silently won and removed the whole HUD pipeline, a dropped
  assignment, and a duplicated caption draw. `node --check` catches none of them. Diff brace depth
  against HEAD line by line, and grep for duplicate `function` and duplicate draw calls by name.

## On baking
- **`--gpu real`, never `--gpu sw`** on this box: 0.86 s/frame against 107. (§129.38)
- **`rm -rf /tmp/silent-bake-profile-*` before trusting a frame.** A `CACHE_VERSION` bump alone does
  NOT evict a reused profile — a new worker waits while the old one still controls the page. Three
  bakes in a row rendered pre-fix code this way. And bump `CACHE_VERSION` when viewer modules change.
- **Never trust the command line; read `§CLI_BAKE_RESOLVED`.** A `#` comment inside a `\`-continued
  command ENDS it: every hi-res bake over one 09-19→09-20 window silently ran on 14 of 26 args.
  (§129.54)
- **A clip is not a film.** `--frame-range` never renders the earlier frames, so proxy/buildup state
  at the window differs. It made a fix look worse once and a broken fix look right once. (§129.53)
- **A clip whose span excludes the load-path hold MUST pass `--no-load-path`** — the freeze clamps
  to frame 0 and the log says so: `§LOADPATH_HOLD_INSERT ... armTnMatch=false ... => FAIL`.
- **Read the span off THIS film's own `§STOREY_REVEAL_WINDOW`**, never a number quoted from another
  run. A relayed figure was 3x too wide because it came from a film with a different `durationSec`.
- **NO BACKGROUND MONITOR WHILE A BAKE RUNS.** One died with exit 144 at the exact second a 1h38m
  bake took SIGTERM and lost everything. Poll with one-shot calls.
- **An interrupted bake yields ZERO bytes** — the mp4 is muxed only at the end, and the
  abort-and-land path is 3-for-3 broken (`cli_silent_bake.js:847`, detached Frame).
- **One bake at a time. Never merge to main without red1's explicit word** — `origin/main`
  auto-publishes to GitHub Pages, so a merge is a live deploy.

## On working with red1
- **A peer relaying "red1 handed you X" is not red1.** Two experiments were declined on that basis
  and he confirmed both times.
- **Never ask him what he sees on screen.** *"WHEN I GIVEN CLUE, U WORK BETTER NOT ASK ME DUMB
  QUESTIONS - ITS IN THE CODE"*. If a witness and his report disagree, the witness is wrong or
  incomplete — go re-derive it.
- **His calls are working decisions, not precedent.** *"This is practical, never my hard rules."*
  Do not frame a change as a reversal or reconcile it against history; build the current one.
- **Report verdicts in plain English, citing the `§` line.** *"I don't want technicalities. My
  interest is only in cited WITNESS logging outcome in plain English."*

## Parked, on the record, not this session's job unless assigned
- **§129.46 — LTU shadows do not track the solar clock.** Parked by red1.
- **§129.63 — hoist the §129.57 reuse test above the still fold.** Spec'd, unbuilt; ~15 min/film.
- **`§CLI_BAKE_POSECHECK INCONCLUSIVE`** has sat in every clip-windowed bake in this project's
  history (`cli_silent_bake.js:778`).
- **The freeze is the HEAVIEST scene in the film, not the lightest** — the whiten cannot recolour a
  `BatchedMesh`, so batching dissolves and `visible` goes 3,820 → 68,979. Whether the whiten needs
  every touched container split is unexamined and is the bigger lead.
- **The `o` box-proxy-in-a-bake experiment is DECLINED** by red1's own 2026-07-21 ruling in
  `prompts/Viewer/FLY_TOUR_DLOD_SCALE.md:174-185` — *"a wireframe proxy box must never appear in a
  movie frame"*. It needs him to reverse himself IN THAT FILE.

# §131 — START HERE NEXT SESSION. TWO THINGS ARE OPEN, BOTH SEEN BY RED1, NEITHER CLOSED.

**One line to continue:** *bake a clip at `764ca784` or later and judge two things by eye — does the
camera still veer during the escape beat, and do the beams still glow through the building.*

## 1. THE CAMERA VEERS DURING THE ESCAPE BEAT — fix pushed, NEVER SEEN IN A BAKE
red1: *"the scene path seems to veer a bit off during the EscRoute. Check the slowing down that time
did not skew the cam face path."* Then, after the fix was pushed: *"the path still veers"*.

⚠ **HE HAS NOT SEEN THE FIX.** The only 1080p clip on disk,
`~/Downloads/Hospital_storeyreveal_to_end_1920x1080_24fps_1311.mp4`, was baked at `81da0ca6` —
`EASE_K = 0.60`, the value that causes the veer. `764ca784` lowered it to 0.25 and has never been
baked. **The next clip is what decides whether this is fixed or only reduced.**

WHAT WAS MEASURED, over 10,001 samples of both curves on this film's 5.8 s window:

| curve | max camera lead off its nominal pose |
|---|---|
| old symmetric (shipped for weeks, no complaint) | 0.0620 of the window = **0.36 s** |
| `EASE_K = 0.60` — what red1 saw | 0.1500 = **0.87 s**, peaking at w=0.50 |
| `EASE_K = 0.25` — current, unbaked | 0.0625 = **0.36 s** |

**THE TENSION IS INTRINSIC, so read this before reaching for the constant again.** `warp(0)=0` and
`warp(1)=1`, so a rate that ENDS below 1 must have RUN ABOVE 1 earlier — the camera necessarily
LEADS its nominal pose in between. For `warp = w + k·w(1−w)` the lead is exactly `k/4` of the window
and the end rate is exactly `1−k`; they are **the same knob read from opposite ends**. You cannot
slow the ending further without moving the camera further off its path. `W-ESC-4k` bounds the lead
and `W-ESC-4d` asks for the slowest end that bound allows, so the two witnesses hold it from both
sides — a future change that weakens one will fail the other.

**IF IT STILL VEERS AT k=0.25**, the warp is the wrong instrument and the next move is NOT a smaller
k (that just deletes the beat's pacing). It is to stop warping the POSE at all and get the settling
from the beat's own structure instead — the last 30% is already a hold at full progress
(`DRAW_FRAC = 0.70`), and lengthening that hold slows the *reading* without moving the camera one
metre off its path. `escapeRouteEaseFilmT` returning `tFilm` unchanged is a one-line control that
proves whether the warp is the cause at all. **Run that control before tuning anything.**

## 2. THE BEAMS STILL GLOW THROUGH THE BUILDING — cause NOT identified
red1: *"the glow thru beams still persists!"*, watching the 1311 clip — which already contains
`f79f6316`, the 3D cease. So **the four groups that commit hides are not the cause.**

What has been ruled OUT, by reading the code rather than by assuming:
- **Not the four ceased groups.** `§FINDINGS_CEASE_3D` fired in that bake for `flythruDatum`,
  `indoorBeats` and `slabBeat`, and the glow is still there.
- **Not the load path.** The clip runs `--no-load-path`; the census says `loadPath=0`.
- **Probably not the storey tint's restore.** `storeyRevealApplyVisual` is called UNCONDITIONALLY
  every frame (`cinema_maxq.js:3472` — it is not key-gated, despite the neighbouring comment saying
  the section cut is "NOT key-gated like ApplyVisual above"). When `vis` goes null the key becomes
  null, differs from `_curIdx`, and `_restoreTint()` runs. This was read, not assumed — but it was
  NOT proven with a log line, so treat it as a strong lead, not a closed door.

WHERE TO GO NEXT, cheapest first:
1. **Get a `§` line rather than a frame.** Nothing in the bake says "the tint came off". Add one to
   `_restoreTint` naming how many meshes it restored and at what `tNorm`, then bake. If it prints
   0 restored, or never prints, the answer is there in one run.
2. **`STOREY_REVEAL_MODE = 'cut'`** turns the tint off in one word (`cpe_storey_reveal.js`). If the
   glow survives that, it was never the tint — and that is one bake, not a search.
3. Only then look wider: the night relight (§129.41 narrows the interior-lights off-window to
   `[beats.out, topoutU)`, so fixtures come back ON for the whole closing orbit) and
   `emissiveIntensity` left lifted on a shared material.

⚠ **DO NOT CHASE THIS FROM FRAMES.** Two sessions today spent real time reading pixels and reached
three different explanations. The standing rule applies: slice the predicate out, or add `§`
logging, and let a run answer it.

# §130 SINGLE-SESSION HANDOFF (2026-09-20, end of day) — READ THIS FIRST. SUPERSEDES §129.62.
Two sessions ran this film today — the load-path/freeze lane and the escape-route lane. **They are
now one branch and one job.** Everything below is verified in the pushed code, not taken from
either session's own summary.

## State in one line
`feat/loadpath-ledger` in `/tmp/wt-loadpath`, pushed, **126 ahead of origin/main, 0 behind**,
`14226630`. 32 commits today. **Thirteen witnesses, all green.** The film delivers.
⚠ `origin/main` auto-publishes to GitHub Pages, so a merge is a live deploy of all 126.

## The only open item red1 has named
**The building carries a yellow-olive wash during the escape beat**, after the storey reveal has
ended at `beats.rise` 0.9590. Visible in frame 700 of
`~/Downloads/Hospital_storeyreveal_to_end_854x480_24fps_1225.mp4`.
`§STOREY_REVEAL_LAST_STAYS_LIT` did not print in that bake, so **the log cannot say** whether it is
the last storey deliberately staying lit or a tint that never restored. red1 has asked for it to be
cleared up. That is the next job and it is the last one he has named.

## §130.1 — WHAT LANDED AFTER §130 WAS WRITTEN (2026-09-20, same evening)
§130's state line says `14226630`. Two more commits went in after it, both from red1 watching the
12:25 clip, and the first of them ANSWERS most of what §130 lists as the open item.

### `f79f6316` — the beats' SHINE-THROUGH geometry ceases too, not just their chips
red1: *"Make the overlay shine thru of beams cease then. They are showing and disturbing the scene
which now has other new stuff to do ie Storey Reveal and then EscRoute. Even if not, it can just go
on for 2 secs and no more as user has seen enough and wana enjoy the finale of whole landed
building."*

**§FINDINGS_CEASE was half a gate and the log made it look whole.** It covered the 2D draw chain
only. The bake printed `layer=measure.datum ceased` and meant it — while `flythruDatumAt` went on
setting `_grp.visible` from its OWN life curve every frame, so the datum's `depthTest:false`
uprights and storey bands kept shining through the building to the final frame. The chips ceasing
made it WORSE: the geometry was left on screen with nothing to explain it.

Four modules add a named group to `A.scene` and **not one was reachable from the HUD chain**:
`flythruDatum`, `flythruCue`, `indoorBeats`, `slabBeat`. `_cease3D()` (cinema_maxq.js, beside the 2D
gate) hides all four on the same `_findingsHudSuppress` signal — same onset, same 2 s tail. **Hidden,
never disposed**, so each beat's own `.visible` returns the moment the gate lifts; the shape
`clashFilm.setVisible` already used.
Confirmed live: `§FINDINGS_CEASE_3D group="flythruDatum" hidden`, then `indoorBeats`, then
`slabBeat`, relayed through CLAIM_RX so it reaches `out/<db>.log`.

⚠ **THE WITNESS DISCOVERS, IT DOES NOT LIST.** `witness_findings_cease.js` scans every
measure-family module for the group it adds to the scene and asserts each one found is in
`CEASE_3D_GROUPS`. A fifth beat fails the witness the day it lands rather than the next time
somebody watches a clip — the same reason the 2D half became a predicate instead of a list of two.
**17/17.**

### `81da0ca6` — every colour key says what it MEANS
red1: *"the HUD color ie red '..' and grey need explanation such as 'sprinklered zone'"*.
The rows were a colour, a number and a terse fragment; at 854x480 the ladder shed the words
entirely and left `GREY  177 m`, which is a swatch, not a legend. Now:

    RED     183 m         common path — no alternative      limit 30.5 m ¹
    YELLOW   64 m         onward to the nearest exit
    BLUE     7 alternates other exits from that point
    GREY    177 m         sprinklered zone

Each row carries a SHORT form as well, because the plate is 211 px at 854x480: `no alternative`,
`to nearest exit`, `other exits`, `sprinklered`. **The meaning survives every size** — measured
4/4 at 1920x1080, 1280x720 and 854x480.
**The drop order is reversed and that is the substance, not a side effect:** the cited limit goes
before the descriptor now, because the limit is on the card twice over (the disclosure row and
footnote ¹) and the descriptor is nowhere else.

### State
`feat/loadpath-ledger`, pushed, `81da0ca6`, **128 ahead of origin/main, 0 behind**. Nothing merged.
**Fourteen witnesses green**: §ESCAPE_COLOURS 31/31 · §CARDFIT 21/21 · §FINDINGS_CEASE 17/17 ·
§ESCAPE_ROUTE_WITNESS 67/67 · §OVERLAY_LIFETIME 17/17 · §TINT_SCOPE 25/25 · §EGRESS_ALTERNATES ·
witness_storey_cut · witness_storey_reveal_list 13/0 · §FRAME_REUSE_W · §HUD_COVERAGE ·
§FREEZE_THEME. `witness_film_boxes` stays 13/1 on a §40.1 leg that fails identically at `2c487820`.

### What is STILL open, narrowed
§130 said the yellow-olive wash was one unknown. It was **two**, and only one is left:
- **The shine-through half is CLOSED** — it was the `flythruDatum` group, and `f79f6316` ceases it.
- **The storey TINT itself is still painted at the final frame**, after the reveal ends at
  `beats.rise` 0.9590. That is a different mechanism from those four groups — `_applyTint`'s own
  restore — and `§STOREY_REVEAL_LAST_STAYS_LIT` did not print in the 12:25 bake, so the log still
  cannot say whether it is the last storey deliberately staying lit or a restore that never ran.
  **Read `_restoreTint`'s trigger before assuming either.**

### Evidence kept out of /tmp
`prompts/evidence/firehose_Hospital_clip_2026-09-20_1225.log.gz` — the 18,596-line firehose of the
first clip that carried every rule of the day. The 1080p run's own firehose lands beside it as
`firehose_Hospital_clip1080_2026-09-20_<hhmm>.log.gz`.

### In flight at close
A **1920x1080 / 24 fps** clip of the same span (`--clip 0.82:1`, `--no-load-path`), commit
`81da0ca6`, ~40 min. red1 asked for the hi-res bake to judge the legend wording at delivery size.
⚠ A clip over this span MUST pass `--no-load-path`: the freeze arms at tn 0.409, outside
`[0.82, 1]`, and clamps to frame 0 — the bake says so itself with
`§LOADPATH_HOLD_INSERT ... armTnMatch=false ... => FAIL`.

## What the film does now, and where each rule lives
| beat | rule | where |
|---|---|---|
| storey reveal | whole-storey tint, colour + emissive + `emissiveIntensity` 0.35, **no x-ray** | `cpe_storey_reveal.js` `_applyTint` |
| storey reveal onset | **all nine** Measure/clash layers cease, `/^(measure\.\|clash\.)/` | `cinema_maxq.js:1182` |
| reveal off | those layers get a 2 s tail, no more | `FINDINGS_OFF_TAIL_SEC` |
| closing orbit | escape route, RED/YELLOW/BLUE/GREY, back-loaded ease 1.594x→0.400x | `cpe_escape_route.js` |
| 189.0→194.8 s | the route draws; ends **1 s before the film** | `FINALE_SEC = 1` |
| last 1 s | **finale — nothing on the building.** Verified by eye, frames 840/845 | teardown at beat exit |
| to the last frame | the escape panel holds, full opacity, opposing corner | `_cardVisAt` returns `alpha:1` past the window |

## Rules red1 set today, in his words
- *"cease those overlays during ending orbit, as user has seen enough"* — **a hard rule.**
- *"Its last second is like a finale. It should not have any overlay on the building."*
- *"the info is rich and its too little time to let it sink in"* — hence the +1.4 s and the panel hold.
- *"retain the same coloring. Just use that opposing HUD"* — relocate and size, never restyle.
- *"Off as tint is shine thru"* — x-ray stays off.
- *"This is practical, never my hard rules"* — his calls are working decisions. **Do not frame a
  change as a reversal or reconcile it against precedent; just build the current one.**
- *"WHEN I GIVEN CLUE, U WORK BETTER NOT ASK ME DUMB QUESTIONS - ITS IN THE CODE"* — when he points
  at something, go and read the code. Do not ask him to narrow it down.
- *"I don't want technicalities. My interest is only in cited WITNESS logging outcome in plain
  English."* — report verdicts, cite the `§` line, use short everyday words.

## The watchdog role, as he set it
> *"Do not rigress like before is your watchdog role. Not having anything change has always been
> happening. Get all requets done before baking. And WITNESS logging must be present for those big
> request."*

So: **hold a gate before every bake.** List every outstanding request, verify each one **in the
pushed code yourself**, and only then say it is ready. It worked today — the gate caught that the
cease set was 2 layers of 9, and that the one red1 had actually seen was outside it.

## What today cost, and the five rules that came out of it
1. **A saving claimed from READING code is an estimate; only a run is a measurement.** §129.57 was
   claimed at 22.9 min and measured at 7.7. Every number taken from a real `§FRAME_HASH` held
   exactly; the one taken from assuming where a call sat was wrong by 3x. See §129.57c/§129.63.
2. **A keep-both merge resolution eats structure, and the parser lies about where.** Four defects
   from one merge: three swallowed closing braces (reported at the file's last line), a duplicated
   `bigStats` draw, a dropped `var _tnFilm = _tFilm(_tn)` that 40+ call sites read, and a duplicated
   bottom caption bar. Diff brace depth against HEAD line-by-line; grep for duplicated draw calls.
3. **A witness that goes INCONCLUSIVE is worse than one that fails**, because a sweep reads it as
   "not red". `§FREEZE_THEME` stopped judging entirely when a line grew a term and nobody noticed.
4. **Run the other lane's witnesses in YOUR tree before consolidating.** Theirs caught the dropped
   `_tnFilm` that would have killed frame 0 of a 3-hour bake. `node --check` cannot see a deleted
   assignment.
5. **Check what a peer MEASURED, not just what they concluded.** The "x-ray has no effect" A/B was
   the escape beat, not the storey reveal. It proved x-ray is dead weight in the orbit; it did not
   prove the tint reads without it — the tint's real defect was scope.

## Still open, with evidence
- **The yellow wash above** — red1's named next job.
- **`witness_film_boxes.js` §40.1 is 13/1**, pre-existing, verified failing at `2c487820` too:
  loadPath / ledgerTicker / escapeRoute / sunClock / sunCompass composites are unregistered to a box.
- **§129.63 — hoist the reuse test above the fold**, spec'd and unbuilt. Recovers the other ~15 min.
  The two-run same-tree hash diff is the adopted proof; **the stored fixture is dead** (every frame
  differs after this many overlay changes) — take both halves fresh.
- **The abort-and-land path is 3-for-3 broken** (`cli_silent_bake.js:847`). An interrupted bake
  yields ZERO bytes.
- **No background Monitor during a bake.** One died with exit 144 at the exact second a 1h38m bake
  took SIGTERM and lost everything. Poll with one-shot calls.
- **§129.46 LTU shadows do not track the solar clock.** Parked by red1.

## Not ours, declined, on the record
The `o` box-proxy-in-a-bake experiment is forbidden by red1's own 2026-07-21 ruling in
`prompts/Viewer/FLY_TOUR_DLOD_SCALE.md:174-185` — *"a wireframe proxy box must never appear in a
movie frame"*. It needs him to reverse himself **in that file**. Related and checked today: the
finale shows `§DLOD_TM_CENSUS boxed=0/64150` and no wireframe — but only because the camera has
pulled back and nothing is outside the view. On a film ending closer in that could differ, so it is
a census line to check, not a settled fact.

