# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** make `viewer/time_machine.js` `renderAtTime()` cost proportional to WHAT CHANGED at the
cursor, instead of O(total elements) per tick. Nothing else. This is a pure performance refactor —
it must not change a single rendered pixel, and that is the acceptance bar.
**Read the log after every run.** Exit code is not evidence. The witness for this work is a NUMBER
(`§PERF_TRAVERSE`) plus a zero-mismatch equivalence check (`§INCR_VERIFY`), not "it looks fine."
**Status:** Phase 1 SHIPPED live (v821, 2026-07-20). **Phase 2 SHIPPED live (v824, 2026-07-20,
bim-ootb PR #909 + hotfix PR #912 — read §0a before touching this file further.)** **Phase 3 (DLOD)
SHIPPED + RETIRED (2026-07-20): landed as bim-ootb #918, then redesigned VIEW-BASED at the user's
ask (#919 wireframe, #920 view-based redesign, #922 box tagging) — live and user-accepted on real
LTU hardware. ALL THREE PHASES DONE — this file is now history, not a work queue. The spec, with
§9 recording the shipped view-based truth (it supersedes the time-based design this file's §0
sketch describes), is retired to `prompts/done/TM_DLOD_SCALE.md`.** **§0c CLOSED
(2026-07-20): the "lethargy" resolved into three concrete, separately-handled things — (1) Fly-tour
freeze = missing §IDLE-PARK wake, fixed PR #914 v825 (`TOUR_WALKMODE_IDLE_PARK_STUCK.md` §9, A/B
confirmed); (2) ▶-at-Hour-0 stale canvas = startPlayback's silent cursor warps, the last #912-family
call sites, fixed PR #916 v826 — USER-CONFIRMED live "Hour 0 clears"; (3) "heavy near end" = GPU cost
of the fully-built scene (user's own live log: traverse ms=2.0 delta — JS is NOT the cost), which is
exactly Phase 3's target. User's live verdict same day: "LTU TM speed seems ok".** Read §4 Risks and §0 (the shipped lessons) before touching code — several risks silently
corrupt the scene, and one already shipped a net regression that had to be reverted-in-effect; Phase 2
itself shipped a real live regression that needed an immediate follow-up hotfix (§0a) — read it before
assuming "equivalence witness passed" is the whole story for a delta-skip change.

---

## 0c. HANDOVER (2026-07-20) — unconfirmed "lethargy" report, compare against git history first
**This is a REVIEW task, not an implementation task, until the comparison below says otherwise.**
**Also unresolved from the same handover:** a separate live report ("start 0hr doesn't clear the
canvas until the user scrubs a bit") triggered an attempt at a Puppeteer witness
(`witness_jump_to_start_clear.js`, scratch worktree `/tmp/wt-tm-hotfix` on this machine, port 8412) —
it never got a real answer; TM activation itself timed out (240s) before the actual test ran, the same
shared-machine contention pattern seen repeatedly this session (load average 10-14). **This is
INCONCLUSIVE, not evidence the bug is real or fixed** — don't cite it either way. If picked up: the
witness script's logic is written and ready (scrub via the real `#tm-slider` input event → click the
real `#tm-start-btn` → snapshot visible-guid count → compare against a forced full-path re-render at
the same cursor), it just needs a run that doesn't hit environment timeouts — try on a less-loaded
machine or with a much longer activation timeout before concluding anything about the underlying report.
User's own words: "Feeling still slight lethargy, but not sure" — explicitly flagged as uncertain, not
a confirmed regression, no specific action/building/log attached (unlike §0a's playback-freeze report,
which came with an exact reproducing log). Do not invent a root cause to match a vague feeling — that
is exactly the kind of thing this project's Prime Directive (extract, don't invent) exists to prevent.

**The comparison to run, precisely:** this repo's `viewer/time_machine.js` git history has an ALREADY
CONFIRMED, user-verified speed fix — Phase 1 (commits `fa7b4ef`/#905 + `eab9248`/#906, 2026-07-19/20),
after which "a user on real LTU (125k) confirmed 'much faster'" (§0, this file). Since then, THIS
session shipped two more commits on the same file: `98416d9`/#909 (Phase 2 — delta skip under shadows)
and `58a9f2a`/#912 (hotfix — the playback-freeze fix, §0a). The question to answer: **does the
CURRENT tip (`58a9f2a`) still feel as fast as the Phase-1 confirmed-fast state, or has something in
#909/#912 regressed it?**
- Diff `eab9248..58a9f2a` on `viewer/time_machine.js` (and `viewer/tour.js` if the Tour handoff in
  `prompts/TOUR_WALKMODE_IDLE_PARK_STUCK.md` is also in play) — read every change for anything that
  could add PER-TICK or PER-FRAME cost beyond what Phase 1 already established as the accepted
  baseline. §0a's own `§PERF_TRAVERSE` numbers (ms=2.0, skipped=15833/15872, mode=delta) are FAST on
  their face — if the diff shows nothing that should slow things down, the next hypothesis is
  perception/environment, not code.
- Cross-check against §0a's OWN already-documented, NOT-yet-fixed finding: repeated full TM
  index-rebuild cycles (`§PERF_INCR_INDEX ... ms=50-159`) while a building is still streaming in, one
  per streaming batch. This is a REAL, KNOWN cost this session already found and explicitly left
  unfixed (§0a, cited again in `TOUR_WALKMODE_IDLE_PARK_STUCK.md` §5) — "lethargy" during/shortly after
  a big building's initial load is very plausibly THIS, not a new bug. Rule this in or out by timing:
  does the sluggish feeling correlate with early-session streaming, or does it persist deep into a
  session with a fully-streamed building and TM paused/idle?
- Also check whether the "lethargy" might correlate with the Tour investigation happening in the SAME
  browser tab/session (`§SFX_SUSPEND idle`, `§BVH_DEFERRED` 17s builds, multiple heavy subsystems
  competing for the same thread) rather than Time Machine itself — don't assume TM is the source just
  because this file is open.

**What NOT to do:** don't add a new perf "fix" speculatively to chase a feeling with no number attached.
If the diff-review above finds nothing suspicious and the streaming-cost/environment explanations don't
fit either, the correct output is "measured X, Y, Z, found no regression — here's what to ask the user
to reproduce with a number attached" (a `window.__tmTrav` reading, a specific action + timestamp), not
a guessed code change.

**Fable-model pass, findings (2026-07-20) — ran exactly the comparison above, made no code changes:**
- Diffed `eab9248..origin/main` on `viewer/time_machine.js`: every hunk sits inside `renderAtTime` call
  sites, the shadow-toggle edge detector, or diagnostic-only test hooks (`__tmSetCursor`,
  `__tmSnapshotVisible`). TM code doesn't execute when TM isn't ticking, so a *general* (non-TM,
  non-tour) slowdown is very unlikely to be the Phase 2/hotfix diff itself. Also checked the full
  commit window since Phase 1's confirmed-fast state: only 5 commits landed (#907 cinema/staffage,
  #908 modeller-only, #909+#912 TM, #911 schedule writers/no render path) — nothing touched
  `main.js`/`scene.js`/`tour.js`/`staffage.js` in that window. #912 is cost-neutral (moves a cursor
  assignment, doesn't add work); #909 REDUCES BatchedMesh cost (one check per tick, not more).
- Ranked hypothesis for the "lethargy" report, most to least likely: **(1) §IDLE-PARK wake-coverage
  gaps** — the Tour freeze (`TOUR_WALKMODE_IDLE_PARK_STUCK.md`) proves at least one path exists where
  the render loop stays parked when it shouldn't; if that shipped, sibling gaps (streaming-settle,
  SFX-resume, TM idle→interaction) may exist too, and a viewer that only renders on `markDirty()` calls
  presents to a user as general lethargy (missing frames), not slow frames — this is the one hypothesis
  that would explain "normal render AND tour" with a single mechanism. **(2)** the already-documented,
  not-yet-fixed streaming×TM full-rebuild cost (§0a) — explains EARLY-session sluggishness only.
  **(3)** same-tab thread contention (17.4s `§BVH_DEFERRED`, SFX, shadows all on one thread).
  **(4)** the GPU/memory floor Phase 3/DLOD exists to fix — unchanged, not a regression.
- **The discriminating question, still unanswered, needs the user's own testing, not more code
  reading:** does the lethargy persist after streaming completes, with TM off and no tour running? If
  yes AND `§IDLE_GATE` shows the loop parked/thrashing during ordinary interaction — hypothesis 1, and
  the wake-gap audit should widen beyond just `_startFlyTour`. If it clears once streaming settles —
  hypothesis 2, already specced (coalesce/debounce the metaGen-triggered TM rebuild).

**Reviewer note (updated 2026-07-20): Fable's pass is in and reviewed above — it's methodologically
sound, made no unjustified code changes, and correctly stopped at a diagnostic question rather than
guessing a fix.** Still nothing to implement here until that discriminating question gets a real
answer from the user's own testing. The Tour fix (separate file) is a different matter — see
`TOUR_WALKMODE_IDLE_PARK_STUCK.md` §8: two independent readings of the code now agree on its root
cause, so it's reasonable for the next session to implement + verify that one specifically (on
LTU_AHouse, not a substitute building), while this file's §0c question stays open pending the user.

## 0c-CLOSURE (2026-07-20, Fable session) — how the lethargy report resolved
The §0c comparison was run as specced: full diff read of `eab9248..origin/main` found NO per-frame
cost added by #909/#912 (all changes inside renderAtTime call sites + diagnostics-only hooks). The
"lethargy" decomposed into three real items, each now closed or specced:
1. **Fly-tour freeze** (missing `markDirty()` wake in `_startFlyTour`) — fixed PR #914, live v825,
   A/B-witnessed (fix absent = frozen after one 0.2-unit twitch). `TOUR_WALKMODE_IDLE_PARK_STUCK.md` §9.
2. **▶ pressed at project end left the end-state on canvas at Hour 0** (startPlayback's three silent
   `_cursor` warps — the LAST remaining #912-family call sites, found by the §0a-mandated audit) —
   fixed PR #916, live v826. **USER-CONFIRMED live: "Hour 0 clears."** Witness caveat recorded in the
   #916 commit: headless Hospital self-heals (streaming re-flush), so the failing control was not
   reproducible headless; the live confirmation is the closing evidence.
3. **"Heavy near end" is GPU, not JS** — user's live log at the Finishes phase: `§PERF_TRAVERSE
   ms=2.0 skipped=16019/16092 mode=delta` (Phase 2 working) while the full built scene renders with
   shadows. That is Phase 3's exact target; spec authored: `TM_DLOD_SCALE.md`. Secondary observed
   churn in the same log: `§SFX_PLAY` flood + `§PILL_SYNC synced=6` per event in the Finishes phase —
   noted, unmeasured, park it unless it survives Phase 3.
Also shipped en route: Fly-Tour route cache — repeat activation 15.7s → 0.4s witnessed (41×), merged
bim-ootb PR #917, live v827; spec retired to `prompts/done/TOUR_ROUTE_CACHE.md`.

## 0a. PHASE 2 SHIPPED + THE HOTFIX IT NEEDED (2026-07-20) — read this before Phase 3
**PR #909** did exactly what §2-§3 below describe: removed the blanket `!app._shadowOn` gate on
`_incrOK` (replaced with a toggle-EDGE-only force-full via `_lastShadowOn`), and wired the
already-existing event index into the BatchedMesh branch (only InstancedMesh had the skip before —
LTU's BatchedMesh-consolidated geometry, "8 draw calls", got ZERO benefit from Phase 1 until this).
**W-INCR-EQUIV passed cleanly**: 19 cursors each on Hospital + LTU_AHouse (forward/backward playback,
random scrubs, forced full-path jumps), `mismatch=0`, WITH shadows on.

**The equivalence witness was not the whole story.** Minutes after deploy, the user hit a real,
user-visible regression: continuous playback (▶ button) would build correctly for a moment, then
visibly STOP updating ("ceases as the timeline continues on"); jump-to-start/end wouldn't refresh the
canvas until a manual scrub. Root cause (**PR #912**, hotfix): several call sites — most importantly
`playTick()`, the real playback loop — mutated the global `_cursor` to the NEW value BEFORE calling
`renderAtTime(_cursor)`. Inside `renderAtTime`, `_prevCursor = _cursor` then reads that
ALREADY-mutated value, making `_prevCursor == cursorMs` on every tick (a zero-width delta window).
`_tmHasEventIn(arr, X, X)` is mathematically always false (needs `> lo && <= hi` with `lo==hi`), so
the delta path saw "no event for any mesh" and skipped the ENTIRE scene, every tick.

**Why the equivalence witness didn't catch it:** the witness (and the `__tmStep`/`__tmSetCursor` test
hooks) compute the target cursor as a local value and pass it straight to `renderAtTime` — exactly the
CORRECT pattern, same as the one real call site that was never buggy (`onSlide()`, the slider drag
handler — which is exactly why scrubbing always "fixed" the frozen scene). The bug lived entirely in
the OTHER call sites' calling CONVENTION, not in the traverse/skip logic the witness was built to
check. **Lesson for Phase 3 and any future `_incrOK`-adjacent change: an equivalence witness that
re-renders at a cursor it computed itself does not prove the REAL UI call sites feed `renderAtTime`
correctly — audit every call site that mutates the global cursor before calling `renderAtTime`, not
just the render logic in isolation.**

**Also found, pre-existing:** this exact bug predates this session (the buggy call sites were
unchanged code) but was invisible until now, because `_incrOK` required shadows OFF before PR #909 —
and PR #909's own real-hardware tester ran with shadows ON, so delta mode had literally never been
exercised during continuous playback in the field until PR #909 shipped and immediately hit it.

**Separate, NOT-yet-actioned finding from the same live LTU_AHouse retest** (shadow+TM together, while
the 122k-element building was still progressively streaming in): ten-plus repeated cycles of
`§PERF_INCR_INDEX built meshes=<growing> ... ms=50-159` → `§PERF_TRAVERSE ... mode=full` — each
streaming batch bumps `A._metaGen`, correctly invalidating the event index (by design), but that means
every one of ~10+ streaming batches on a big building costs a real 50-160ms rebuild + a full traverse,
specifically because Time Machine was turned on WHILE streaming was still in progress. This is the
SAME class of risk already named in §4 Risk area for Phase 3 (metaGen bump → 108ms rebuild), just
triggered by streaming instead of a DLOD bbox↔mesh swap. Not fixed this session — documented in
`prompts/TOUR_WALKMODE_IDLE_PARK_STUCK.md` §5 (found during the same testing pass, a different file
because the primary bug that prompted that file was a Tour freeze, not this). If picked up: the shape
is "coalesce/debounce the metaGen-triggered TM rebuild, or defer it until streaming completes" — cite
this section, don't rediscover it.

## 🎯 NEXT-SESSION BENCHMARK (LTU, one sentence)
**Phase 2 (shadow-engaged delta skip) is shipped and equivalence-clean; get a real-hardware
`window.__tmTrav` frame profile from the user's own machine (the headless witness in this repo's dev
environment was unreliable — heavy shared-machine contention, load average 10-14, made activation
routinely time out) to finally set the Phase-3 (DLOD) target instead of estimating it.**

## 0. SHIPPED + WHAT'S NEXT (2026-07-20) — read this first
**Phase 1 (DONE, live v821):** §PERF_INCR event-index skip + the waste-removal that actually moved
the needle. A user on real LTU (125k) confirmed "much faster." The honest post-mortem of WHAT helped:
- **Index thrash removed** — the biggest win, and it was fixing MY OWN regression. `_tmSceneSig()`
  first folded `scene.children.length` into the staleness key; that count changes every tick (spark
  sprites, SFX, stars, bloom add/remove children), so the 108ms event index rebuilt EVERY tick AND
  reset `_incrPrimed` → forced `mode=full` forever → ~158ms/tick, slower than no optimisation.
  Fixed by keying only on `A._metaGen`. **Lesson: never validate a perf change only headless — a
  software-WebGL rig showed a flat 60fps for both 6.9k and 125k and was blind to all of this.**
- **§WB_MAT logging gated** behind `window.__TM_WBDEBUG` (was ~40 console.logs/sec, real cost even
  console-closed; catastrophic with Firefox devtools open). Full traverse 50ms→23ms just from this.
- **25.8MB ad_seed.db reread** cached as a miss (`§PERF_NEG_CACHE`) — was re-deserialised from IDB
  EVERY tick on non-folded buildings (LTU). Verified: per-tick (30+) → 2 total.
- **The incremental SKIP itself contributed ~nothing** for this user, because it is gated OFF under
  shadows (`_incrOK = ... && !app._shadowOn`) and they run Shadow + Alt-G. `mode=full skipped=0` in
  their live log. Be honest about this: the felt win was waste-removal, not the headline skip.
- Diagnostic hooks shipped for real-hardware profiling: `window.__tmTrav` (last-traverse stats),
  `window.__tmStep(dms)` (drive a playback-like tick without the cinema UI).

**Phase 2 (NEXT, JS lever) — make the delta skip work UNDER SHADOWS.** Currently `_incrOK` forces
full whenever `app._shadowOn`, because the shadow-caster promotion pass needs the complete
`_placedMeshes` list each tick. Maintain that list incrementally (or decouple the shadow pass from
the traverse) so delta engages with Shadow/Alt-G on. **Expected: ~74% off the per-tick traverse
(23ms → ~6ms), high confidence** (identical path skips 9901/10841 on Hospital). JS-only; it does NOT
touch GPU cost. Gate remains equivalence (§INCR_VERIFY mismatch=0) WITH shadows on.

**Phase 3 (NEXT, the REAL scale lever) — DLOD / bbox-proxy in TM. See `TM_DLOD_SCALE.md` (AUTHORED
2026-07-20 — full Sonnet-implementable spec; it supersedes the sketch below and corrects two claims
in this file: "8 draw calls" is uncorroborated, measured healthy state is ~15-16K (S280c/S263), and
"eviction (shipped)" in §0b overstates — only dispose-on-building-switch exists).**
The per-tick JS is now ~23ms and not the bottleneck. What still renders every frame is all ~16k LTU
meshes at full geometry — GPU cost my JS work cannot touch. The proxy already exists and is proven
>50k in the Find Panel (`navigate_find.js _buildMergedGhost()` — per-discipline InstancedMesh unit
boxes from the DB `center_*`/`bbox_*` columns). Wire it in as TM's INACTIVE-SET renderer: real mesh
only on the active construction layer, boxes for the rest. **⚠ interaction with Phase 1:** a
bbox↔mesh swap bumps `A._metaGen` → rebuilds the event index (108ms). Fine for a user-driven layer
switch, fatal if it happens per playback tick — needs targeted per-mesh invalidation, not a global
`_metaGen` bump.

**MEASURE BEFORE ESTIMATING (hard rule this session learned twice).** The headless rig cannot see
GPU cost. Before quoting any Phase-3 %, get a real-hardware frame profile via `__tmTrav` + a
frame-time capture on the user's machine. The only number currently defensible is Phase 2's ~74%
traverse cut. Total-lag % is UNKNOWN until the GPU baseline exists — do not invent it.

## 0b. FOOTPRINT STRATEGY TO 1M — ingredients yes, proof no
Coherent on paper, unproven at 1M. Pieces: batching/instancing (LTU 125k = 8 draw calls, shipped) +
streaming/eviction (shipped) + O(changed) event index (shipped) + **DLOD bbox proxy (Phase 3, the
load-bearing piece)**. **Binding constraint = the ~2GB browser tab memory ceiling** (Autodesk's own
figure). At 1M the strategy only holds if the bbox proxy is the DEFAULT resident representation and
real mesh is streamed for the active window then evicted — memory is the wall nobody has measured.
Honest external phrasing: "architected for 1M via Pareto DLOD, demonstrated at 125k" — NOT "handles
1M." Next-session task: build Phase 3, then measure real memory + frame footprint at 250k/500k/1M to
find where the wall actually is.

---

## 1. The measured problem

Live on Hospital (63,416 elements scheduled, 16,115 ops), during playback:

```
§PERF_TRAVERSE ms=15.6–22.4  objs=10841  cand=3
```

16–22 ms of a ~31 ms tick is spent walking the entire scene graph to service 3 spark candidates.
Scrub benchmark, n=63 slider commits: mean **31.6 ms**, median 29.6 ms, p90 42 ms.

**There are TWO O(n) passes per tick, not one.** Both must be fixed or the win is halved:

| # | Pass | Cost driver | Location |
|---|---|---|---|
| A | **Ops scan** — rebuilds `placed{}` / `frontier{}` / `recent{}` / `arrival{}` from scratch | scans `_ops[0..cursor]`; near project end that is ~16,115 ops, and `placed{}` alone grows to ~16k keys **allocated fresh every tick** | `renderAtTime()`, the `for (var i = 0; i < _ops.length; i++)` loop |
| B | **Scene traverse** — `app.scene.traverse()` over every object | 10,841 objects on Hospital, independent of how many changed | `renderAtTime()`, `app.scene.traverse(function(obj) {...})` |

Pass A is pure allocation/GC churn; pass B is the measured 16–22 ms. A cursor step of one tick
typically changes the state of **single-digit** elements, so both passes are doing ~10⁴ work for
~10⁰ of change.

## 2. Target design — event-driven state with a full-rebuild fallback

### 2.1 Build once, on activate (not per tick)
- **`_evts`** — a flat, timestamp-sorted array of state transitions derived from `_ops`. Each element
  contributes at most three: `start_ts` → FRONTIER, `end_ts` → RECENT, `end_ts + lingerMs` → PLACED.
  (`lingerMs = tickMs() * 3` is cursor-independent, so the events are static once built.)
- **`_target`** — `guid → { obj, kind, slot }` where `kind ∈ {MESH, BATCHED, INSTANCED}`. This is the
  index that removes pass B entirely: given a changed guid, write directly to its mesh/slot instead
  of searching the graph for it. Build it in ONE traverse at activate, reusing the same branch
  structure the current per-tick traverse already has.
- Invalidate both when `_ops` is regenerated (schedule regen, cache-version bump, building switch).

### 2.2 Per tick — apply only the delta
Maintain live `placed` / `frontier` / `recent` sets ACROSS ticks. Moving the cursor `A → B`:
- **Forward:** apply every event in `(A, B]`.
- **Backward:** apply the inverse of every event in `(B, A]`. Scrubbing back is a first-class case,
  not an afterthought — the Time Machine is a scrub-driven player.
- **Frontier `t` values still update every tick** for elements already in the frontier set (progress
  is continuous, not an event). That set is small — this is the one unavoidable per-tick loop, and
  it is O(frontier), not O(total).

### 2.3 Fallback — this is a requirement, not a safety net
If `|events in the delta window| > _INCR_MAX_DELTA` (start at ~2,000, tune), do a FULL rebuild
instead. A scrub from 0% to 90% legitimately changes tens of thousands of elements, and applying
those one at a time is slower than the current code. The fallback is what makes the common case
(playback tick, small delta) fast without making the worst case (long jump) worse.
**`§PERF_INCR mode=delta|full n=<events>` on every tick** — if `mode=full` dominates in practice,
the refactor has failed and must be reported as such, not tuned until the log looks good.

## 3. What the traverse currently produces — every consumer must be preserved
The traverse is not just visibility. Anything below that regresses is a bug, and several are
invisible in a screenshot:

| Product | Consumer | Incremental equivalent |
|---|---|---|
| `obj.visible` / `setVisibleAt(slot)` / `setMatrixAt(zero)` | the actual render | write per changed guid via `_target` |
| `instanceMatrix.needsUpdate` | InstancedMesh upload | mark only meshes with ≥1 changed instance — **must not** be set blindly |
| `_frontierCentroids` | shadow promotion pass | maintain alongside the frontier set |
| `_frontierPositions`, `_guidPosMap` | camera follow / look-ahead | same; `_previewGuids` stays a bounded forward scan |
| `_placedMeshes` | shadow promotion (cap 500) | keep a maintained list, or leave this pass full-scan while `app._shadowOn` |
| `applyHighlight()` / `clearHighlight()` | single-mesh frontier tint | drive off frontier-set enter/exit |
| `_gspCollect()` | §GROUP_SPARK | already playback-gated; feed from the frontier/recent sets |
| `_wbMat()` counters | whitebox logging | cosmetic; may legitimately change frequency |
| `_sfxPhases` | sfx.js seam | rebuild from the frontier set, not the ops scan |

## 4. Risks — read before writing code
1. **Silent divergence.** Incremental state can drift from truth and the scene will look *plausible*
   while being wrong. This is the central risk and the reason §5's equivalence harness is mandatory.
2. **Backward scrub asymmetry.** Inverting a transition is not always the mirror of applying it
   (`recent` carries a fade computed from `cursor - end_ts`). Derive fades from the cursor, never
   from accumulated state.
3. **BatchedMesh/InstancedMesh slot aliasing.** `_target` assumes a stable guid→slot mapping. If
   streaming reassigns slots after activate, the index goes stale and writes hit the WRONG element.
   Confirm slot stability before relying on it — if it is not stable, `_target` needs invalidation
   hooks on the streaming path.
4. **`_ops` regeneration mid-session.** Schedule Author's "Apply to 4D" rewrites `_ops` while TM is
   active. Both caches must invalidate or the timeline silently renders the old schedule.
5. **Do NOT fold §IDLE-PARK into this.** Adding TM-playing to `_awake` in `main.js` was already
   investigated and REJECTED — the wake/park-per-tick pattern is correct; a continuous rAF chain
   between ~2/sec ticks reintroduces exactly the idle cost §IDLE-PARK removed. The stale
   "must stay 1" witness at `main.js:699` predates self-parking; fix the comment, not the loop.

## 5. Verification — equivalence first, speed second
**W-INCR-EQUIV (blocking).** A debug mode runs BOTH paths on the same cursor and diffs the resulting
visible-guid set plus per-slot visibility. `§INCR_VERIFY cursor=<t> mismatch=0` across a scripted
sweep — forward playback, backward playback, random scrubs, and jump-to-start/end — is the gate.
Any non-zero mismatch blocks the change. Speed is irrelevant until this is clean.

**W-INCR-PERF.** `§PERF_TRAVERSE` before/after on Hospital, same method as the baseline above
(n=63 slider commits, report mean/median/p90). Baseline to beat: **mean 31.6 ms, traverse 15.6–22.4 ms.**
Also capture a large building (Terminal) — Hospital may be too small to show the real win.

**W-INCR-PIXEL.** Rendered screenshots at matched cursors before/after must be visually identical.
The bar is "not a single changed pixel"; this is a perf refactor, so any visual delta is a defect.

**Non-witness:** "it feels smoother." Not evidence. Numbers or nothing.

## 6. Scope boundaries
- **In:** the two O(n) passes and the indices needed to remove them.
- **Out:** §GROUP_SPARK tuning, `_awake`/§IDLE-PARK, the ERP negative cache, console-log volume
  (all already handled or explicitly rejected in PR bim-ootb#891).
- **Out:** changing what the Time Machine *shows*. Zero behavioural change is the whole contract.

## 7. Provenance
Findings measured 2026-07-19 during PR bim-ootb#891 (§GROUP_SPARK). Full measurement record,
including three retracted perf hypotheses (`§RENDER_LOOP total`, per-tick `ad_seed.db` refetch, and
the spark-side micro-optimisations that benchmarked as no-ops), is in that PR's second commit
message and in `HOSPITAL_4D_SUPERSTRUCTURE_DURATION_ANOMALY.md` §GROUP_SPARK.

## §POINTER 2026-08-08
This file is retired (see header: "ALL THREE PHASES DONE — history, not a work queue"), so new
active work doesn't belong here. Its own still-unresolved "17.4s `§BVH_DEFERRED` thread contention"
hypothesis got re-measured at 41-54s on LTU_AHouse (worse on a WARM cache, ruling out cold-cache as
the driver) — full numbers, the ruled-out theories, and the priority "chase to zero" directive are
in `prompts/Viewer/FLY_TOUR_DLOD_SCALE.md` §26/§27, not here.
