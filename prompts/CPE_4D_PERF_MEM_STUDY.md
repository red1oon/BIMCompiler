# ⚠ DO NOT REMOVE — scope: consolidation + perf/mem STUDY only, no code changes without a written
spec section signed off after this study. Read the log after every run you do perform.

# CPE (Alt+C) + 4D Schedule — consolidated perf/memory study

## ▶ RESUME 2026-09-01 — READ THIS FIRST
**R10 and R11 both SHIPPED + LIVE this session. sw v1112. Nothing unpushed.**
| § | what | witness | PR |
|---|---|---|---|
| §R10 §MAXQ_FRAME_BUDGET | a baked frame costs **20 composer renders, not 40** (taa 8 / ao 12). Bake-only — Alt+S keeps all 40. | table below, floor RMS 0.21 | bim-ootb #1588 |
| §R11 §PHOTO_PREWARM | the 8.9 s curve-smoothing + HDRI + ground texture moved OFF the first Alt+S onto idle-after-streaming | 6/6 | bim-ootb #1590 |

**⛔ NEITHER IS CONFIRMED ON A REAL HOSPITAL RUN YET — that is the next thing to do, and it needs
the USER, not a probe.** Both numbers below come from the user's own v1111 Hospital log; the next
real session's `§PHOTO_PREWARM` line and bake wall-clock are what prove they landed:
- expected: first Alt+S **~27 s → ~7-9 s** (§R11)
- expected: Hospital bake **~3 h → ~2 h 10-15 m** (§R10 — only the frame loop shrinks; the ~1 h of
  staging + stitch is unchanged, so this is a ~47 min saving, NOT a halving)

**Next open items, in the order I would take them:**
1. **✅ §R12 memory — MEASURED 2026-09-01.** The Hospital `§MEM_PROBE` breakdown is TAKEN — read
   **§R12_HOSPITAL_MEM** at the end of this file: heap 1,577 MB reproduced headless (user saw
   ~1.57 GB), full table + ranked levers with measured bytes. Nothing was shipped off it — next
   step is the user picking a lever.
2. **✅ CLOSED 2026-09-01 — the section-cut case, by USER ATTRIBUTION, NEVER MEASURED.** The user:
   *"the section cut? Scissors? Is no longer a suspected issue as it seemed to be some other
   sessions hogging."* Closed as a machine-contention artefact (concurrent sessions competing for
   this machine), NOT a rendering defect — and NOT "measured and found fine": the only run on
   record soft-cancelled at 7887 ms and never completed. Do not re-open it as an unmeasured
   mystery; re-measure only if the user re-reports it on a quiet machine.
3. **§MAXQ_BACKGROUND** (spec in `CINEMA_PATH_EDITOR.md`) — facts given, user has NOT approved
   building it. It saves ZERO bake time; it buys back attention. ~270 LOC, 2 new files.
4. R7 / R8 / R9 — still unstarted, still not urgent, and none of them move the bake clock.

**⚠ MEASUREMENT LANDMINES — three methods failed before R10's table existed. Read §R10's
"THREE MEASUREMENT METHODS FAILED FIRST" before designing any image-quality comparison.** Short
version: never let the witness invent its own camera; one-condition-per-page-load is WRONG here
because the scene reseeds (RMS 32 noise vs the effect being measured); one-load-many-folds is also
wrong because only the first fold's AO does real work. Seed `Math.random` and compare per load.


## Goal
Both lanes below have been built incrementally across many separate `prompts/#.md` files, each solving
one feature at a time. Read them ALL TOGETHER (not one at a time) and look for: (a) duplicated or
overlapping machinery that could be one shared piece instead of several near-identical ones, (b) memory/
perf costs that are individually "fine" but stack on large buildings, (c) a concrete plan to make baking/
activation on LTU-scale buildings (LTU_AHouse, 122,667 elements) meaningfully faster. Output is a written
finding + refactor proposal, not code — this is Spec-First like everything else in this repo.

## Files to read (verify this list is still current — `ls prompts/CPE_*.md prompts/CINEMA_*.md
prompts/4D_*.md prompts/TM_*.md prompts/GANTT_*.md` before trusting it, files get added over time)

**Alt+C / Cinema Path Editor (CPE) family:**
- `CINEMA_PATH_EDITOR.md` — the main spec/handoff, largest file, read its §SESSION HANDOFF first
- `CPE_POV_WALK_PATHING.md` — walk finger mode (just shipped + a roll-snap fix 2026-08-11)
- `CPE_WALK_GAMEPAD_NAV.md`
- `CPE_WALK_WEBXR_FINDPANEL.md` / `CPE_WALK_WEBXR_VR.md`
- `CINEMA_DELIGHT_BATCH.md` / `CINEMA_FIND_TO_FILM.md`

**4D Schedule family:**
- `4D_SCHEDULE_PERFECTION.md` — the main lane (auto-schedule/CPM generator), read its §SESSION CLOSEOUT first
- `4D_CAPTURE_AND_FALLBACK.md`
- `GANTT_ACCURACY.md`
- `TM_SCHEDULE_EDITOR.md`
- `TM_INCREMENTAL_RENDER_PERF.md` — already perf-focused, likely the most directly relevant one
- `TM_4D5D_VARIANCE_LANE.md`
- `TM_STREAM_REBUILD_COALESCE.md`
- Skim `TM_S4_SHOPFLOOR_BUILD.md` / `TM_SHOPFLOOR_COSTING_SPEC.md` / `PP_ORDER_ZOOM_TM_SPEC.md` too —
  unclear if they share the same underlying TM/schedule machinery or are a separate ERP-shopfloor
  overlay; figure that out as part of the study, don't assume either way.

## Known numbers already on record — extract these, don't re-derive them from scratch
- CPE replan (`_replanFilm`): 291ms typical, up to 1218ms on Hospital-class buildings
  (`CPE_POV_WALK_PATHING.md` §CPE_REPLAN_SLOW / `CINEMA_PATH_EDITOR.md` §CPE_PANEL_PERF).
- TM cold activation: ~2.1s on first Play (`CINEMA_PATH_EDITOR.md` §CPE_PANEL_PERF item 1) — a
  pre-arm idea is already named there, unstarted.
- DLOD flip-storm during a continuously-moving camera (walk / any non-idle vfCam): flips_mean=2671,
  FPS→53 (`CINEMA_PATH_EDITOR.md` §CPE_PANEL_PERF item 3) — flagged as a known landmine, deliberately
  untouched in every lane so far.
- TM incremental render: ~2ms delta-path vs ~23ms full render at 16k objects
  (`TM_INCREMENTAL_RENDER_PERF.md`) — LTU_AHouse is 122,667 elements, ~7.7x that object count; whether
  the delta-path still holds its advantage at that scale is exactly the kind of question this study
  should answer with a real measurement, not an assumption.
- The big one, NOT CPE/4D-specific but the dominant cost on any large building: `sql.js` loads the
  ENTIRE db file into WASM linear memory, no paging — LTU_AHouse alone is ~440MB permanently resident
  (`meta.db` 43MB + `geo.db` 397MB) for the life of the tab (memory `project_ltu_ahouse_memory_architecture`).
  CPE/4D's own state (film plans, schedule cursors, DLOD culling structures) sits on TOP of that
  baseline — worth measuring how much CPE/4D itself adds vs. how much is just the sql.js floor, since
  a refactor inside CPE/4D can't fix the floor.

## What "study well" means here
- Read every file above fully, not just its closure/handoff section — the perf numbers and landmines
  quoted above are scattered through each file's dated history, not summarized in one place yet.
- Look specifically for: two lanes independently reinventing the same mechanism (e.g. both CPE and TM
  have their own render-triggering / cursor-driving conventions — is there duplicated logic that could
  be one shared primitive?), any per-frame or per-activation cost that scales with element count rather
  than staying flat, and any of the several "known landmine, deliberately untouched" notes across these
  files that keep recurring — a landmine mentioned in 3 different files by 3 different sessions is a
  refactor candidate, not a coincidence.
- Ground every finding in a real measurement (§-log numeric truth, same FUNDAMENTAL LAW as the rest of
  this repo — no screenshots, no "should be faster," a number before and a number after) run against
  LTU_AHouse specifically, not just the small residential buildings (Duplex/SampleHouse) most of these
  lanes were originally witnessed against.

## Deliverable
A new `prompts/CPE_4D_PERF_MEM_FINDINGS.md` (or append here if it stays short) with: a ranked list of
refactor/consolidation opportunities, each citing which files/functions it touches and the measured
before-number; and an explicit list of what was investigated and found to be NOT a lever (so the next
session doesn't re-walk the same ground). No code changes in this pass — hand the findings to a
follow-up session with a written spec once the user picks which lever(s) to act on.

## ✅ EXECUTED same session (user: "proceed to do the fixes") — see FINDINGS §3b for the ledger
R5 merged (#1306, §PERF_INCR_DEFER) · R3 merged (#1305, §CPE_REPLAN_LAZY, equivalence 0.0) ·
R2 auto-merge armed (#1304, chunked kernel_ops writer, 4 witness suites green) · R1 implemented +
A/B-witnessed on `fix/maxq-bake-staging-keep` (§MAXQ_STAGE_KEEP — staging 2× per bake vs 29×,
frontier lines byte-identical) · R4 ⛔ BLOCKED both halves on documented doctrine (G-CPE-SOLE-OWNER;
§Z_STACK_XRAY_STAGING "nothing survives TM off") — user ruling needed, recorded in FINDINGS §3b.

## ✅ DONE 2026-08-12 → `prompts/CPE_4D_PERF_MEM_FINDINGS.md`
Study complete, no code changed. 9 ranked levers (R1 bake staging churn — decomposed to named code;
R2 land `fix/gantt-refold-hang`; R3 §CPE_REPLAN_LAZY; R4 TM activation pre-arm + x-ray cache;
R5 stream-rebuild coalesce; R6 memory/cache-revalidation + a NEW blocker: the re-extracted LTU split
pair is unstreamable on a fresh cache, `elements_meta` lost its `building` column; R7 one support
predicate; R8 one date-layout cursor; R9 DLOD flip-storm, still last). Corrections to this file's
own premises are in the findings §1 — notably the delta path WAS measured at LTU (2.0 ms, holds),
and the 440MB floor is now ~210MB (2026-08-10 re-extract). Live measurement was stopped mid-study on
the user's directive (real Hospital bake running); the bake-heaviness question was answered from
code instead (findings §2: per-frame staging teardown/rebuild + 250 ms settle + 4096² shadow ×~40
renders/frame + per-frame-unique sun + #1300's per-frame traverse).

## ▶ RESUME 2026-08-17 — R1-R5 done since 2026-08-12 (FINDINGS §3b), R6(b) ALSO already done
(PR bim-ootb#1328, `§SINGLE_BLD_FALLBACK` in `streaming.js` — untracked in FINDINGS.md, worth a
one-line correction there next time it's touched). **R6(a) — cache revalidation — is the one
piece of R6 still genuinely unbuilt**, confirmed by direct code read: `scene.js A.cachedFetch`
(:1116) is unconditional cache-first — a cache HIT (:1133) returns the stored blob immediately,
zero network check, ever. This is why R6's own text warned "returning users never fetch a
re-uploaded DB" — that is exactly what's live today, still, for every building.

### §R6a SPEC — cache revalidation, Spec-First before implementing
**Mechanism:** on a `cachedFetch` cache HIT, before returning the stored blob, fire a small
`fetch(url, {method:'HEAD'})` (via a real IndexedDB-stored comparator, not a body download) and
compare against a value stored alongside the blob at write time. If they match (or the HEAD
fails/times out — **fail open**, never block/break offline use), return the cached blob exactly as
today. If they differ, treat it as a genuine cache miss and fall through to the existing
fetch+cache-write path unchanged.

**Comparator: ETag primary, Content-Length secondary.** Verified live (`curl -I` against the OCI
bucket, `Clinic_extracted.db`): `access-control-allow-origin: *` and
`access-control-expose-headers` includes both `etag` and `content-length` — a cross-origin HEAD
from `red1oon.github.io` can read both. ETag is the more precise signal (OCI's etag is tied to
`version-id`, changes on every real re-upload even at identical byte size); Content-Length is the
fallback for any server/path that doesn't set one (e.g. a relative same-origin GH-Pages path,
unverified whether it always sets a custom ETag). **If NEITHER header is present on the HEAD
response, skip revalidation entirely** — same as today, no regression.

**Storage: a NEW `revalidation` IndexedDB object store, not a reuse of `timestamps`.**
`timestamps`' value is a plain number consumed by `_evictOldest`'s numeric sort
(`entries.sort((a,b) => a.ts - b.ts)`) — changing its shape to an object would silently break LRU
eviction (NaN comparisons). `A.openCacheDB` is already versioned (`indexedDB.open(NAME, 2)`,
`onupgradeneeded` already added `timestamps` at v2) — bump to **v3**, add the `revalidation` store
in the SAME `onupgradeneeded` branch, write `{etag, contentLength}` in the SAME transaction as the
existing `dbs`/`timestamps` write in `cachedFetch`'s cache-write path (:1229-1263). Any profile
that falls back to `_openCacheDbUnversioned` (already-higher stored version, `VersionError` path)
never gets the new store — for those, `revalidation.get(key)` returns undefined, which is the same
"skip, trust cache" fail-open branch, so that path is unaffected too.

**Timeout:** `AbortController`, 4s — a hung/offline network must not add latency to a cache hit
beyond a bounded window; on abort, fail open exactly like a HEAD failure.

**Logging (this project's own FUNDAMENTAL LAW: numeric §-tag proof, not assumption):**
`§CACHE_REVALIDATE_OK url=… etag=match|contentLength=match` (cache used, fast path),
`§CACHE_REVALIDATE_STALE url=… old=… new=…` (cache discarded, real re-fetch follows — this is the
line that proves the whole feature works, since it's currently IMPOSSIBLE for this to ever fire),
`§CACHE_REVALIDATE_SKIP reason=no-etag-or-length|network-fail|timeout|no-store` (fail-open path,
expected on older profiles and offline use).

**Witness:** a scripted test that (1) primes the cache with a fake stored ETag that does NOT match
the real server's current ETag, calls `cachedFetch` on a small real file, and asserts
`§CACHE_REVALIDATE_STALE` fires + the blob returned matches a fresh fetch, not the stale cached
one; (2) primes with the CORRECT current ETag and asserts `§CACHE_REVALIDATE_OK` fires + zero
bytes downloaded (network call count for the body fetch = 0, only the HEAD ran); (3) simulates a
HEAD failure (bad URL / offline) and asserts the stale cached blob is still returned (fail-open,
no exception, no user-visible break).

**Explicitly NOT in scope for this pass:** the OPFS/sqlite-wasm paging structural lever (R6's "(b)
THEN" — the 210MB floor itself). This pass only stops SERVING STALE DATA to returning users; it
does not reduce how much memory a fresh load uses.

### ✅ §R6a SHIPPED 2026-08-17 — PR bim-ootb#1418 MERGED+LIVE, R6 fully closed
Implemented exactly as specced above: `openCacheDB` bumped v2→v3 (new `revalidation` store, both
create sites), `cachedFetch`'s cache-hit branch now calls `A._revalidateCache` before returning,
the write path stores `{etag, contentLength}` in the same transaction as the blob, `_evictOldest`
cleans up the comparator on eviction too. `sw.js` `CACHE_VERSION` bumped in the SAME PR this time
(v1054→v1055) — learned from the earlier same-day miss on PR #1409 where forgetting this made a
real fix invisible to every already-installed user.

**Live-verified headless, both comparator paths:**
- Content-Length path (local file, 4-call sequence): call 1 real miss + `§CACHE_WRITE_OK`; call 2
  unchanged server-side → `§CACHE_REVALIDATE_OK contentLength=match`, cache used, no re-download;
  call 3 comparator corrupted to a wrong value directly in IDB → `§CACHE_REVALIDATE_STALE
  old=999999999 new=5675`, real re-fetch (`§CACHE_WRITE_OK` fires again), comparator self-heals to
  the correct value; call 4 `window.fetch` monkey-patched so HEAD throws → `§CACHE_REVALIDATE_SKIP
  reason=network-fail`, did NOT throw, returned the (still valid) cached blob — fail-open confirmed.
- ETag path (real cross-origin OCI object, `Hospital_meta.db.sql`): `§CACHE_REVALIDATE_OK
  etag=match` on the second call — confirms OCI's `access-control-expose-headers` genuinely lets a
  `red1oon.github.io` origin read `etag`/`content-length` off a HEAD, not just a same-origin one.

**R6 is now fully closed, both halves.** No further action needed on this lever; FINDINGS.md §R6
corrected with a pointer here rather than duplicated.

## Lane status: R1-R6 all shipped and live. R7 (support-predicate consolidation), R8
(date-layout-cursor consolidation), R9 (DLOD flip-storm, deliberately last) remain unstarted —
next session picks one if the user wants to continue this lane; none are costed as urgent.

---

## §R10 §MAXQ_FRAME_BUDGET — the only lever that moves the bake clock (SPEC ONLY, 2026-08-30, awaiting user go)

**User:** *"Will rebuild with the new code to see the intended 'Reveal' round on HHS_Office for
speed. Can we still reduce mem and increase frame speed or wait for the background ops?"*
Specs first, **not to be built yet.**

### Where the time actually goes — MEASURED, already on record
Hospital, 3,447 frames, `perFrameMs=1989` (`CINEMA_PATH_EDITOR.md` §SESSION_2026-08-30):
- §STILL_REFINE ~1,200 ms = **62%**
- §PHOTO_AO ~450 ms = **23%**
- everything else = the 15% tail.

Reading the code for what those numbers ARE: `effects.js:4811` folds TAA until `accumulateIndex >= 16`
and `effects.js:3738` sets `STILL_AO_FRAMES = 24`. **So every exported frame costs 16 + 24 = 40 full
composer renders.** 3,447 × 40 = **137,880 composer renders** for one Hospital film.

**This is why the session record already says "do not expect HUD or smoothing work to move the bake
clock."** Nothing outside those two constants is worth touching for speed.

### The proposal — R10, quality-per-second, measured not guessed
Make the two budgets bake-time settings instead of stills constants, then **measure the quality cost
of each step down** rather than picking a number:
- sweep TAA 16 → 12 → 8 → 4 and AO 24 → 16 → 12 → 8 on ONE frame, one page-load per condition
  (**§SESSION_2026-08-30 dead-end 5: same-page A/B is invalid for stills** — the second Alt+S logs
  `avgRenderMs=0.7` against the first's `94.5`, the AO phase does no real work twice);
- score each against the 40-render reference with a numeric image metric (per-pixel RMS + a
  high-frequency/noise term), never by eye;
- ship the lowest pair whose RMS stays under a stated threshold, as a named preset.

**Arithmetic, not a promise:** 40 → 20 renders/frame halves the bake. Hospital 1 h 54 m → ~57 m,
HHS_Office (1,661 frames last bake) proportionally. Whether 20 is visually acceptable is exactly
what the sweep decides — that number is the *ceiling* on the win, not a claim about quality.

### Memory — the honest read for HHS_Office
- **HHS_Office_Federated is 6,839 elements** (cached run), against Hospital's 63,182 — **9.2× smaller**.
  It is the fastest fleet member to iterate on, which is the right call for seeing the Reveal round.
- The measured memory profile is Terminal's, not HHS's: heap 1,226 MB, geometry attributes 469 MB
  (position 198.6, normal 198.6, index 71.8), 17.35M verts / 864 geometries, textures only 4.1 MB.
  **At 6,839 elements HHS is nowhere near that**, so memory is very unlikely to be its limiter — it
  should be measured (`§MEM_PROBE`) before any memory work is aimed at it.
- Two memory routes are already CLOSED and must not be re-walked (§SESSION_2026-08-30): dropping the
  `normal` attribute to save 199 MB is **WITHDRAWN** (it breaks §TRIPLANAR's `vTriWorldNormal` and all
  texturing collapses), and the 129.6 MB "weldable" figure is an **upper bound** that assumes normals
  can merge — flat surfaces need split normals, so the real saving is far smaller.
- The genuine floor is not CPE/4D's: `sql.js` loads the entire DB into WASM linear memory with no
  paging. A refactor inside CPE/4D cannot move it.

### Ordering — the direct answer to "or wait for the background ops?"
**Do not wait.** They are independent and they do different things:
- **§MAXQ_BACKGROUND** does not make a single frame faster. It buys back *your attention*, not time.
- **§R10** is the only thing that shortens the bake, and it is the smaller change — two constants, a
  sweep, and an image metric, versus a new scheduler with two unverified browser behaviours.
- R10 first also makes the background work cheaper to test, because every probe run is shorter.

### Still unstarted in this lane, unchanged
R7 (support-predicate consolidation), R8 (date-layout-cursor consolidation), R9 (DLOD flip-storm,
deliberately last). None are costed as urgent and none of them move the bake clock either.

### ✅ §R10 SHIPPED 2026-08-30 — bim-ootb PR #1588 MERGED + LIVE (sw v1111), verified by fetching back

**`MAXQ_STILL_BUDGET = { taa: 8, ao: 12 }` — 20 composer renders per baked frame, was 40.**
Live check: `CACHE_VERSION = 'v1111'` and `MAXQ_STILL_BUDGET = { taa: 8` both present in the
deployed files. Alt+S stills are UNCHANGED at 40 — the override is bake-only and released on all
5 exit paths.

#### RESULT — HHS_Office_Federated, one SEEDED load per condition, scored against a CONTROL
| taa | ao | renders | RMS vs control | verdict | proj ms/frame | vs 1989 |
|---|---|---|---|---|---|---|
| 12 | 16 | 28 | 0.21 | AT THE FLOOR | 1539 | 77% |
| **8** | **12** | **20** | **0.24** | **AT THE FLOOR — SHIPPED** | **1164** | **59%** |
| 8 | 8 | 16 | 0.37 | AT THE FLOOR | 1089 | 55% |
| 4 | 8 | 12 | 21.33 | **DISTINGUISHABLE** | 789 | 40% |

Noise floor **RMS 0.21** (0-255 luma). 40 renders and 20 renders are the same image to within a
fifth of one luma level; 4/8 sits 100× above the floor, which is what a real difference looks like.
8/8 also measured at the floor — **8/12 shipped anyway for one AO step of margin**, because this is
ONE pose on ONE building and interior corners are what AO carries. Margin costs 75 ms/frame.

#### Hospital projection — the honest arithmetic, NOT a measured bake
The user's observed wall clock was **~3 h** for 3,447 frames. Only the FRAME LOOP shrinks:
- frame loop today: 3,447 × 1.989 s = **1 h 54 m**
- frame loop at 8/12: 3,447 × 1.164 s = **1 h 7 m**
- the remaining ~1 h (staging, stitch, any §MAXQ_HIDDEN_PAUSE) is **unchanged**
→ **~3 h becomes ~2 h 10-15 m.** A ~47-minute saving, not a halving of the wall clock. The 1,164 ms
comes from the user's OWN measured budget (75.0 ms per TAA render, 18.75 per AO render, 339 tail),
never from the headless probe — swiftshader ms mean nothing for an RTX 4060.

#### THREE MEASUREMENT METHODS FAILED FIRST — do NOT re-walk them
1. **Synthetic camera pose → empty frustum.** A bbox-derived interior eye-level pose sees nothing on
   HHS. Five conditions scored `meanRGB 0.00` with an IDENTICAL md5 — a perfect "no quality loss"
   that meant nothing. The tell was in the log all along: `§PHOTO_AO avgRenderMs=23` against
   **2520.8** for a fold that really renders. A witness that invents its own camera can invent its
   own emptiness — use the viewer's own framing and GATE on a non-black pre-fold frame.
2. **One page load per condition → the scene RESEEDS.** A control at IDENTICAL settings across two
   loads differed by **RMS 32.19**, 22.86% of pixels off by >8 — larger than every effect being
   measured. §SESSION_2026-08-30 dead-end 5 ("one condition per page load") is right for
   §PHOTO_GRADE and WRONG here; a documented rule's trade-off must be re-checked for each new
   measurement.
3. **All conditions on one page load → only the FIRST fold does real AO work.** `avgRenderMs` 768.9,
   then 4.8 / 9.6 / 14.9 / 14.2 / 1.1; the same-settings control landed 30 luma from row 1.

**THE FIX:** seed `Math.random` before any page script. `effects.js` makes **13 `Math.random()`
calls** while staging — staffage species and placement, and the 410→200 night-light subset. That is
the ONLY reason two loads differ. Seeded, the warm loads agree to **RMS 0.21-0.37**.

**Known harness artifact:** the FIRST load in a fresh browser is cold-cache and differs by
**RMS 26.24** from a warm load at its OWN settings. The reference row is excluded from scoring.

**Scorer bug worth remembering:** its first cut took the **MAX** warm pair as the noise floor, which
let the 4/8 outlier define the floor and then wave itself through (it recommended 4/8 at RMS 21.33).
The floor must be the **CLOSEST** warm pair — the smallest difference the harness can still resolve.

#### Files
`witness_maxq_frame_budget.js` (states its own verdict, shells out to the scorer) +
`score_frame_budget.py` (RMS + pairwise matrix + floor gate), both in bim-ootb.

---

## §R11 / §R12 — first-Alt+S latency and the real memory picture (SPEC ONLY, 2026-09-01, awaiting go)

**User, on v1111, Hospital:** *"we need to reduce its mem hog, as it seems slow to come on first
time, but also when testing here with X section cut in joint action."*

**Source: the user's OWN pasted console from a real session on their RTX 4060** — better evidence
than any headless probe, and it is what this section is built on. Nothing here is re-derived.

### §R11 — why the FIRST Alt+S is slow, MEASURED
| | first Alt+S | second Alt+S |
|---|---|---|
| `§MEP_SMOOTH_NORMALS` | **8,923.6 ms** | — (once per session, `A._mepSmoothDone`) |
| `§STILL_REFINE done elapsedMs` | **17,933** | **6,868** |
| `§PHOTO_AO done totalMs` | 576 | 625 |
| **total** | **≈ 27 s** | **≈ 7 s** |

**The 20-second gap is ALL one-time work sitting on the Alt+S critical path:**
1. **`§MEP_SMOOTH_NORMALS ms=8923.6`** — the curve smoothing (geoms=1705, ranges=14621,
   vertsSmoothed=23,735,190, vertsKeptHard=8,874,063). Biggest single item, ~45% of the gap.
2. **Assets arriving DURING the fold, which restart it.** Run 1 logs `§STILL_REFINE_RESTART
   cam-moved — accumulation restarted` **twice**, with `§LAYER2_HDRI_READY` and `§GROUND_MAP
   key=earth` landing in between. Every restart throws away the samples accumulated so far.
3. **First-press-only inits:** `§PHOTO_AO_INIT_OK` (lazy N8AO), `§MIRROR_ROOM_PROBE built` (later
   presses log `reused`).

**✅ SHIPPED 2026-09-01 — bim-ootb PR #1590 MERGED + LIVE (sw v1112), witness 6/6.** Verified by
fetching the deployed files back: `CACHE_VERSION = 'v1112'`, `PHOTO_PREWARM` in `effects.js`,
`_photoPrewarm` in `streaming.js`. `A._photoPrewarm()` is called from the point streaming.js's own
comment already calls "the model is fully streamed here", runs at idle (`requestIdleCallback`
timeout 8000), and does mepSmooth + HDRI + ground-texture warm. The staging path KEEPS its own call
as a fallback — degrade, don't disable. §PHOTO_AO deliberately untouched (576 ms of a 27 s press).
Witness order proof: `§MEP_SMOOTH_NORMALS ms=1339.4` at index 0, `§PHOTO_PREWARM did=[mepSmooth,
hdri,groundTex]` at 1, `§STILL_REFINE start` at 3 with nothing left to do. G-PW-2 and G-PW-3 are
load-bearing TOGETHER — "prewarm fired" alone would also pass if the pass simply ran TWICE, which is
worse than the original bug.
**HONEST LIMIT:** the HDRI is STARTED earlier, not guaranteed FINISHED. The witness presses Alt+S
immediately and `§LAYER2_HDRI_READY` still lands after `§STILL_REFINE start` there; a real user
takes seconds so it should resolve first, but the guarantee is "started sooner", not "done".
**NOT YET CONFIRMED ON HOSPITAL** — the 8,923.6 ms figure is from the user's log; the next real
Hospital session's `§PHOTO_PREWARM` line is what proves the saving landed.

**Original proposal (kept for the record):** move all of it off the Alt+S press and onto idle-after-streaming. The smoothing pass
is already once-per-session and idempotent behind its own guard, so this is a scheduling change, not
a behaviour change. Same for pre-warming the HDRI, the ground map, the N8AO pass and the mirror
probe. **Expected: first Alt+S ≈ 27 s → ≈ 7-9 s, matching subsequent presses.** §PHOTO_AO is NOT
worth touching — 576 ms of a 27 s press.

### §R12 — the memory picture, and what it is NOT
`§NIGHT_MEM_WITNESS heapMB` across three full Alt+S cycles: **1565.9 → 1572.0 → 1572.9 → 1578.3 →
1599.8**. So ~**17 MB retained per cycle on a ~1.57 GB baseline — about 1% per press.**

**The staging is NOT the hog, and two suspicions were checked and cleared:**
- **`windowLights` growing 3775 → 4536 → 4755 is NOT a leak.** Skyline box sizes are randomised per
  rebuild (`winCount = floor((bw*bh)/14)` with random `bw`/`bh`), so the count legitimately differs.
  The skyline group and its Points cloud are disposed at `effects.js:632-635`.
- **`§ALTS_MEM_HOG` (2026-08-16) is live, not pending.** `_disposePhotoProps()` really is called on
  the real-exit path (`effects.js:3684`). `glowMatKeys` cycles 98 → 0 → 98 → 0 in the log, which is
  the clean-up working.

**The baseline is the hog, and it is the model, not the still:** 63,182 elements,
`§SPLIT_GEO_LOADED size=229MB` resident in WASM linear memory for the life of the tab,
`§CONTRACT_CHECK batch=38169 instanced=25013`. For scale, the measured Terminal profile is heap
1,226 MB with **geometry attributes 469 MB** (position 198.6, normal 198.6, index 71.8).

**Proposal: MEASURE Hospital before proposing any fix.** Run the same `§MEM_PROBE` breakdown that
Terminal has, so the 1.57 GB is split into geometry attributes / textures / WASM DB / everything
else. Aiming memory work at a 1%-per-press creep while a 229 MB DB and ~470 MB of attributes sit
underneath it would be the square peg this file's own §0a warns about.
**Closed, do not reopen:** dropping the `normal` attribute is WITHDRAWN (it breaks §TRIPLANAR's
`vTriWorldNormal` and all texturing collapses), and the 129.6 MB "weldable" figure is an upper bound.

### ✅ CLOSED 2026-09-01 — section-cut case closed by user attribution, NEVER measured
The third Alt+S, the one taken after `§SECTION ON axis=Y range=[-45.3, 90.5]`, ends with
`§STILL_REFINE soft-cancel (camera move) elapsedMs=7887` — **it was interrupted, so it never
produced a completed timing.** The repeated `[GridScissors] §GRID_SCISSORS skipped — overlay not
active` lines are no-ops and cost nothing.
**CLOSED 2026-09-01 by the user's own attribution:** *"the section cut? Scissors? Is no longer a
suspected issue as it seemed to be some other sessions hogging."* The slowness is attributed to
concurrent sessions competing for this machine, not to the cut or the grid scissors. Read this
closure precisely: it is a machine-contention artefact, NOT "measured and found fine" — no
completed with/without-cut timing ever existed. Do not re-open it as an unmeasured mystery, and do
not cite it as a cleared rendering path either; re-measure only if the user re-reports the symptom
on a quiet machine (a run left alone until `§STILL_REFINE done`, with and without the cut, same pose).

---

## §R12_HOSPITAL_MEM — the Hospital memory breakdown, TAKEN 2026-09-01 (measurement only, nothing shipped)

**Method:** headless `§MEM_PROBE` (extended from bim-ootb `probe_memory.js`) against the live split
pair `Hospital_meta.db` + `Hospital_geo.db` served from the local checkout at bim-ootb `742ea66b`
(#1588, v1111-equivalent — the SAME version the user's 1.57 GB observation came from; nothing
between it and origin/main touches geometry sizes or DB residency). Split mode engaged exactly as
live: `§DB_SPLIT_DETECT found=true`, `§SPLIT_GEO_LOADED size=229MB`, `§CONTRACT_CHECK batch=38171
instanced=25011 merged=0 streamed=63182` (user's on-record line: batch=38169 instanced=25013 — ±2,
entourage-variant jitter). Machine load was checked before every probe launch; ONE headless
instance at a time, three aborted attempts documented below. Probe log:
scratchpad `mem_probe_hospital.log` (session-ephemeral; every number below is copied from it).

**Probe deltas vs the Terminal-era script — needed to reproduce:**
- **§PROBE_RENDER_SKIP** — swiftshader pays 10-14 s per frame on Hospital and `animate()` renders
  EVERY frame while `APP.streaming` (main.js §S286 gate includes streaming), starving `streamTick`
  to ~250 elements/frame → the run projects to HOURS. Monkey-patch `A.renderer.render` to no-op
  during streaming only (page-side, repo untouched), re-enable + let real frames run 45 s before
  sampling. With it, all 63,182 elements stream in **9 s**. Memory numbers are render-independent.
- **§PROBE_WAIT_FIX** — the old completion predicate `!APP.streaming` is TRUE before streaming ever
  starts (declared STREAM_DONE at +10 s, would have sampled a partial scene). The unambiguous
  marker is `APP.buildingsRendered.has(APP.activeBuilding)`, set exactly at stream end.
- **meshCache census** — the Terminal probe only traversed the SCENE; per-element source
  geometries in `A.meshCache` that were COPIED into BatchedMesh buffers are scene-invisible.
  Terminal's 469 MB was therefore an UNDERCOUNT of geometry heap; treat cross-building comparisons
  of the attr table as scene-only.
- The viewer defines a non-function `window.gc` (DOM id collision) — `typeof` guard required; and
  headless-new did not expose a callable gc, so heap figures are un-forced (pre/post shown anyway).

### The table — Hospital, SAMPLE A right after streaming; SAMPLE B (+90 s idle) identical ±6 MB
| component | measured | notes |
|---|---|---|
| **JS heap used** | **1,546-1,577 MB** (A), 1,545-1,583 (B) | matches the user's ~1.57 GB baseline |
| scene position | 338.2 MB | batched 331.1 / instanced 7.2 / plain 0.0 |
| scene normal | 338.2 MB | 100% CPU-derived (`normals_cpu`, no DB column — verified in Hospital_geo.db schema) |
| scene index | 103.0 MB | 69.9 u32 + 33.1 u16 (§IDX16 live and working — 33.1 MB already saved; the u32 rest is BatchedMesh shared buffers ≥65,536 verts, NOT shrinkable) |
| **scene attrs TOTAL** | **779.5 MB** | 29,554,583 verts, 2,821 unique scene geometries, meshes: 1,407 batched + 2,872 instanced + 2 plain |
| **meshCache batch-only DUPLICATES** | **324.8 MB** | 19,197 of 20,609 entries serve ONLY batched elements — their data was copied into BatchedMesh buffers and the source is retained too. The other 1,412 entries are the live shared geometries of InstancedMesh (zero-copy, correct) |
| meshCache BVH | 50.2 MB | `§BVH_DEFERRED built=20609` — BVH on every cache entry; scene-side BVH a further 2.4 MB |
| WASM sqlite images | 253.2 MB | meta.db 24.6 + geo.db 228.6 (PRAGMA page_count×page_size, live handles) — resident for the tab's life |
| instanceMatrix+color | 1.5 MB | not a lever |
| textures decoded | 4.1 MB | not a lever (3 real images; the 2,826 renderer texture count is tiny procedural objects) |
| accounted total | ≈1,412 MB | remainder ≈165 MB = streamQueue (63,182 rows, retained by design for x-ray/TM re-stream), _batchMeta/_instanceMeta/guidMap (63k entries each), kernel_ops persist buffers, DOM |
| renderer RSS | 1,955 MB | headless; GPU process a further 1,198 MB = the GPU copies of the 779.5 MB attrs + targets (on the user's RTX 4060 that sits in VRAM, not RAM) |

For scale, Terminal on record (scene-only): heap 1,226 MB, position 198.6, normal 198.6, index
71.8, attrs 469 MB, 17.35M verts / 864 geoms — Hospital carries 1.7× the verts in 3.3× the scene
geometries, and the batched-era double-copy did not exist in Terminal's numbers because that probe
never looked.

### Ranked levers — measured bytes, what each breaks, confidence
1. **meshCache batch-only duplicates — 324.8 MB (+~47 MB its BVH share).** The single largest
   avoidable block. Consumers of meshCache post-streaming (all verified by code read): DLOD
   promote (`streaming.js:2164`), x-ray/TM re-stream rebuild (`:2300` "rebuild from streamQueue +
   meshCache"), measure.js, tools.js find, navigate_find.js, dlod_nav slot cross-fade via
   `bm.userData.slotGeo` — NOTE `slotGeo[slotId]` keeps a per-slot REFERENCE to the same
   geometry (`streaming.js:~1869`), so deleting cache entries alone frees NOTHING; both must be
   released and consumers re-fetch from the resident geo.db on demand (the blobs are RIGHT THERE
   in WASM; blobToGeometry is ms-scale per hash). Effort MEDIUM (5-6 consumer sites), visible
   change NONE if re-fetch is correct. Confidence in the bytes: HIGH (measured).
2. **Quantized normals (Int16 normalized) — ~169 MB scene + ~77 MB meshCache ≈ 246 MB JS, plus
   ~169 MB off the GPU copy.** This is NOT the withdrawn "drop normals" door: the attribute stays,
   at half width. Verified by code read: §TRIPLANAR reads `objectNormal` (three's standard chunk —
   a normalized Int16 attribute reaches GLSL as float in [-1,1] transparently, and
   `vTriWorldNormal` re-normalizes anyway); `mepSmoothNormals` reads/writes via
   getX/setXYZ accessors — normalized-safe on r184/185. Touch-points that must change: (a)
   `blobToGeometry` convert after `computeVertexNormals()`; (b) merged-path `mergedNorm`; (c)
   BatchedMesh internal buffer type propagation — needs a 20-line witness on r185; (d)
   `§NORMAL_REPAIR` (streaming.js ~:1181) writes RAW float arrays (`narr[vi*3]=…`) and WOULD
   break — currently disabled (`§RED_GREY_MYSTERY`, call commented out) but must be converted in
   the same PR. Ship gate: an R10-style seeded luma-RMS witness at the floor. Confidence:
   MEDIUM-HIGH viable; savings arithmetic exact.
3. **One-BatchedMesh-per-bucket + per-hash dedup — 35.3 MB minimum, ~234 MB ceiling.** Measured
   two ways: (a) exact node arithmetic over the shipped DBs (global ≤3-instance cohort, unique per
   storey|disc|rgba bucket): only **35.3 MB** — most hash reuse is cross-bucket or in the
   instanced cohort; (b) BUT the LIVE batched position is 331.1 MB against 217.3 MB
   unique-per-bucket, because `_flushInstanced` partitions per FLUSH WINDOW (~5,000 elements) and
   builds a NEW BatchedMesh per bucket per flush — multi-use hashes fragment into extra copies and
   the ≤3 rule misclassifies split counts (contract batch=38,171 vs 23,177 by global count). One
   persistent bm per bucket + addGeometry-once/addInstance-many recovers ≈(331.1−217.3)×2+index ≈
   **234 MB** JS + the same off GPU, and cuts draw-call bucket count. Breaks: touches the §S280d
   contract structures (_batchMeta/_registerBatchSlot), TM re-stream, DLOD — the "sacred, do not
   change without testing" line sits exactly here. Effort MEDIUM-HIGH. Confidence in bytes: HIGH
   (both ends measured); in safety: MEDIUM.
4. **Freeing the geo.db WASM image — 228.6 MB, structural.** Post-build readers (verified):
   section-cut/elevation 2D (`grid_overlay.js:613/701` → `section_cut.js lookupGeometry`),
   save-export fold (`scene.js:661-787`), merge, city swaps — and lever 1's re-fetch would ADD
   one. Mechanism matters: all Databases share ONE emscripten Module (`APP._SQL` cache), and an
   emscripten heap NEVER shrinks — `close()` recycles pages but returns nothing to the OS. Real
   reclaim = geo.db in its OWN `initSqlJs` Module (drop every ref → the whole Memory is GC-able)
   or a terminable Worker, reopened on demand from the IDB cache (measured full-load: 1.2-1.8 s).
   The vendored httpvfs range-VFS (`lib/httpvfs.js`, `_useRangeStream`) is DEAD CODE — never
   assigned anywhere — but is the eventual no-resident-DB path R6(b) named. Effort MEDIUM-HIGH.
   Confidence: bytes HIGH; reclaim mechanism needs a small witness first.
5. **NOT levers, measured so the next session doesn't re-walk:** textures 4.1 MB; instance
   matrices 1.5 MB; index u32 remainder 69.9 MB (inherent to big batched buffers, §IDX16 already
   harvested the rest); weldable 226.3 MB re-confirmed an UPPER BOUND (sampled subset, normals
   must split on flat faces — stays closed); Alt+S staging ~17 MB/press (~1%) re-confirmed NOT
   the hog; §R11 prewarm absent at #1588 changes WHEN one-time work runs, not the baseline.

**Shipped off this measurement: NOTHING.** No candidate met the bar of invisible + witnessed +
trivially reversible in one pass; every lever above needs a spec + witness first (Spec-First).

---

## §R13_BAKE_FRAME_MINING — the 2,027-frame Hospital bake, mined past its headline (2026-09-02, READ-ONLY, no run performed)

**Method (and its hard constraint).** Nothing was executed. Every number below is extracted from logs
already on disk from the 2026-09-01 session, plus read-only code reads of `~/bim-ootb` to establish
what a `§` line means. **No bake, no browser, no probe** — the user stopped a running bake and two
other agents were on this machine, so any live timing taken today would be a contention artefact (the
same class of error this file already closed once, §R12's section-cut closure). Where a number can
only come from a live run it is written down as a NAMED FUTURE MEASUREMENT, not estimated.

**Primary source:** `s5_hospital.log` (4.1 MB, 41,705 lines) — Hospital `HospitalAjaibPath`,
`commit=e1369b7a sw=v1120 gpu=real` (RTX 4060 Laptop via ANGLE), 2,027 frames, wall 2,680 s,
`aborted=no fileOk=true`. Contrast arms: `s4b_80.log` (80 frames, `bd8872ac`), `s4_300.log`,
`s3_real24.log`, `mem_probe_hospital.log`, `daybatch_*.log`. Partial/contended arm:
`…/6bdc5d30…/scratchpad/bake/{post,pre,armB_headful}.log` (an A/B killed mid-run — see §R13.11).

### §R13.0 — the parsing fact everything else rests on, and the trap it exposes
Per exported frame the fold emits, in order: `§STILL_REFINE start` → `§STILL_REFINE done
accumulateIndex=8 elapsedMs=X` → `§PHOTO_AO start frames=12` → `§PHOTO_AO done totalMs=Y
avgRenderMs=Z` → `§PHOTO_AO off` → `§STILL_REFINE cancelled (interaction) elapsedMs=T`.
2,028 complete folds (fold #0 is the PRE-BAKE staging fold; folds #1-2027 are the exported frames).

**`§STILL_REFINE cancelled elapsedMs` is the WHOLE fold. `§STILL_REFINE done elapsedMs` is the
TAA-only fold.** `§PHOTO_AO`'s time is INSIDE the `cancelled` figure. **§R10's "§STILL_REFINE
~1,200 ms = 62% / §PHOTO_AO ~450 ms = 23%" double-counted AO** — it read a whole-fold number as the
TAA number. That split is retracted below. (§R10's *shipped change* is unaffected: it was decided on
image RMS and a per-frame projection, not on that split.)

### §R13.1 — where the 1,264 ms frame actually goes — MEASURED, n=2,027
| component | mean | p10 | p50 | p90 | max | total over the bake |
|---|---|---|---|---|---|---|
| `§STILL_REFINE done` — 8 TAA renders | **392.5 ms** | 158 | 362 | 685 | 1,381 | 795.6 s |
|   per TAA render | 49.06 ms | 19.75 | 45.25 | 85.62 | 172.62 | — |
| `§PHOTO_AO done totalMs` — 12 AO renders | **382.5 ms** | 190 | 351 | 641 | 939 | 775.3 s |
|   per AO render (`avgRenderMs`) | 27.26 ms | 9.80 | 25.30 | 49.10 | 73.50 | — |
| **20 composer renders, subtotal** | **775.0 ms** | 352 | 715 | 1,328 | 1,704 | **1,570.9 s** |
| **tail = fold − TAA − AO** | **371.1 ms** | **315** | **370** | **427** | 662 | **752.2 s** |
| `§STILL_REFINE cancelled` — whole fold | 1,146.0 ms | 699 | 1,116 | 1,727 | 2,017 | 2,323.0 s |

- Fold = **90.6%** of the 2,564 s frame loop (`§MAXQ_FRAME i=2026 elapsedMs=2563867`). The other
  241 s (≈119 ms/frame) is the between-frame staging block + capture, outside the fold's own clock.
- **The tail is 32.4% of the fold and 28.1% of the 44m40s wall clock — 12 min 32 s.**
- **The tail is FLAT** (p10 315 → p90 427; r vs visible-mesh count only **+0.391**). It is a fixed
  per-frame overhead, not scene-dependent work.

**§R10's sentence "nothing outside those two constants is worth touching for speed" is measurably
wrong.** §R10's own projection arithmetic already carried a 339 ms tail term (measured here at
371 ms) — it was in the model and never named as a lever.

**INCONCLUSIVE — what is IN the 371 ms.** No `§` line inside the fold carries a millisecond value
except the two above. Candidates present on every frame, from the log's own ordering:
`§SUN_ARC_STEP`, `§PHOTO_SHADOW_FORCE_REASSERT` (a whole-scene traverse, §R13.7),
`§PHOTO_AO off`, `§GLOW_LENS_QUAD`, `§PHOTO_GLOW_SPRITE removed`, plus the untagged canvas
readback/encoder submit. **FUTURE MEASUREMENT (needs a live bake, cannot be answered from disk):**
put a `§FOLD_PHASE` timer around each non-render phase of `_finishStillRefine` and one around the
capture, then re-read one short bake. Until then no sub-item of the tail may be quoted as a cost.

### §R13.2 — the per-render costs §R10 shipped on are both wrong, in opposite directions
| | §R10's figure (user's v1111 log) | measured here, n=2,027 | delta |
|---|---|---|---|
| per TAA render | 75.0 ms | **49.06 ms** | −35% |
| per AO render | 18.75 ms | **27.26 ms** | **+45%** |
| tail | 339 ms | 371.1 ms | +9% |
| **frame total** | **1,164 ms projected** | **1,146.0 ms fold / 1,264.4 ms wall** | **+1.6% / +8.6%** |

**§R10's total was right; its decomposition was not.** The decision-ready consequence:

> §R10 shipped `ao=12` rather than the also-at-the-floor `ao=8` for "one AO step of margin", costed
> at 75 ms/frame. **Measured, that margin costs 4 × 27.26 = 109.0 ms/frame = 221 s = 3 min 41 s per
> Hospital bake (8.2% of the wall clock).** The RMS evidence for 8/8 is already in §R10's table
> (0.37 against a 0.21 floor). This is a user decision, not a defect — but it should be made against
> 3m41s, not against the 75 ms/frame figure now known to be wrong.

### §R13.3 — what distinguishes an expensive frame: VISIBLE MESH COUNT, nothing episodic
Pearson r against fold total (n=2,027): **visible meshes +0.875** (against AO per-render cost:
**+0.920**), sun elevation −0.565, frame index +0.565. visMeshes↔sun r = −0.388, i.e. sun elevation
is a **confound**, not a driver — proved by holding mesh count fixed:

| cohort | n | fold total | TAA | AO | tail |
|---|---|---|---|---|---|
| visMeshes 0-499 | 91 | 630.7 | 172.3 | 176.9 | 281.4 |
| visMeshes 2,500-2,999 | 691 | 1,008.0 | 317.4 | 304.4 | 386.2 |
| visMeshes 4,000-4,499 | 591 | **1,575.8** | 610.7 | 579.1 | 386.0 |
| **visMeshes = 4,318, sun 0-9°** | 164 | 1,735.0 | 695.1 | 651.4 | 388.4 |
| **visMeshes = 4,318, sun 10-19°** | 221 | 1,677.8 | 660.0 | 618.0 | 399.8 |

Same mesh count, 10° of sun apart → **3.4% difference**. Mesh count 0-499 → 4,000-4,499 → **2.5×**.
There is no tag present only in the worst decile, no light-count change (`§NIGHT_STILL_LIGHTS` reads
200 on 2,026/2,028 frames), no staging event, no DLOD signature (§R13.8).

**Where the bake's time is spent, by film decile:**

| decile | frames | fold mean | visMeshes | sun° | seconds |
|---|---|---|---|---|---|
| 0 | 0-202 | 701.4 | 956 | 52.6 | 141.7 |
| 3 | 608-810 | 1,295.7 | 4,033 | 37.9 | 261.7 |
| 7 | 1418-1621 | 809.0 | 1,581 | 18.3 | 164.2 |
| **8** | 1621-1824 | **1,597.3** | 4,153 | 13.4 | **324.3** |
| **9** | 1824-2027 | **1,738.6** | 4,318 | 8.4 | **352.9** |

**The closing 20% of the film — the pull-back and orbit around the finished building — is 29.1% of
all fold time (677.2 s).** It is also the phase in which §R10's own stated reason for holding `ao=12`
("interior corners are what AO carries") does not apply: the camera is outside, looking at facades.
A **phase-aware budget** (full AO inside, reduced AO on the exterior orbit) is the concrete proposal
this measurement supports; it is testable with §R10's existing seeded-RMS harness, per pose.

### §R13.4 — the heap reconciliation: the 133-sample series is an ALIASED SAWTOOTH, not a profile
The brief's question ("133 samples span 229-477 MB but §R12 records 1,577 MB — reconcile") is
settled, and the answer is that **neither bake-time series is a memory measurement.**

Read-only code read: `cli_silent_bake.js:201-203` samples `page.metrics().JSHeapUsedSize` on a
20 s interval. `viewer/tools.js:1474` emits `§NIGHT_MEM_WITNESS` from page-side
`performance.memory.usedJSHeapSize`. Both were live in the SAME run:

| run | page-side `§NIGHT_MEM_WITNESS` (pre-bake / post-bake) | harness `§CLI_BAKE_HEAP` |
|---|---|---|
| `s5_hospital` (2,027 fr, e1369b7a) | 2,296.3 / 2,292.7 / 2,328.5 → **1,806.8** | samples=133 min 229 max **477** last 331 |
| `s4b_80` (80 fr, bd8872ac, 6 min earlier) | 5,170.5 / 5,206.1 / **5,223.0** → 1,727.5 | samples=6 min 224 max **2,388.8** last 312 |
| `post.log` (80 fr headful, d37eb109) | — | samples=12 min 230 max **2,431** last 273 |

Three facts kill the 229-477 MB reading:
1. **The same harness instrument reads 2,388.8 MB and 2,431 MB in the short runs.** In `s4b_80` it
   read 2,388.8 MB right after frame 0 and **224.0 MB eight frames (~14 s) later** — a 2.16 GB drop
   inside one sampling gap. A 20 s sampler over 2,680 s simply never landed on a peak in `s5`.
2. **The page-side witness read 5,223.0 MB and 2,328.5 MB at the SAME pipeline point in two runs of
   the same code six minutes apart** (`bd8872ac` and `e1369b7a` are the pre-/post-rebase pair of the
   *same* §NIGHT_BAKE_POOL commit — verified by `git log -1`; both logs contain
   `§NIGHT_BAKE_POOL created n=200`). A 2.9 GB run-to-run swing at a fixed point is uncollected
   garbage, not retained size.
3. Neither instrument counts WASM linear memory, where `§R12` puts 253.2 MB of resident DB.

**Therefore: §R12_HOSPITAL_MEM's 1,546-1,577 MB (settled, post-stream, reproduced ±6 MB at +90 s
idle) remains the only defensible baseline. §R12 is untouched by this and must not be re-derived.**
Nothing in this bake contradicts it. **Do not quote 229-477 MB as the bake's memory profile.**

**FUTURE MEASUREMENT (harness fix, lands free on the next bake anyone runs):** in
`cli_silent_bake.js`'s sampler, evaluate page-side `performance.memory.usedJSHeapSize` on the SAME
tick as `page.metrics()` and log both, plus `totalJSHeapSize`; raise the rate to ~2 s. Then
`§CLI_BAKE_HEAP` can state min/max/last for both instruments and say when they diverge — today it
silently reports one aliased series as if it were the answer.

**Relative shape (same instrument throughout — MEDIUM confidence, absolute scale unreliable):** the
133-sample series sits at ~261 MB over frames 200-530, rises to **410-463 MB across frames 666-925**,
and falls back to ~261-280 MB by frame 1094. Topout is frame 868. **The bake's peak-memory phase is
the TM buildup, not the still fold, and it is fully released.** Whole-bake slope 13.85 MB per 1,000
frames — no leak trend.

### §R13.5 — `§CINEMA_PLAN_MS` runs SEVEN times per Alt+C open on Hospital, 10,253 ms
`2309.6 · 1717.4 · 1339.7 · 1334.6 · 1210.8 · 1208.6 · 1132.5` ms — all with identical
`fanRays=32 spaceCands=0 exitCands=400`. `§CPE_REPLAN_LAZY` shows `miss=1 prefixMs=1046.1` then
**`hit=1 savedMs=1046.1` six times on a byte-identical key**
(`Hospital|2814|135.7692,181.0256,135.7692`) — R3's prefix cache absorbs 6,276.6 ms; the remaining
~10.25 s is the un-cached suffix, recomputed seven times on the same key.

**Already known as a defect** — `CINEMA_PATH_EDITOR.md §CPE_PANEL_PERF` item 2 — **at 3× and 559 ms**
(`§CINEMA_PLAN_MS 291+133+135`). **NEW: on Hospital it is 7× and 10,253 ms, 18× the recorded cost.**

### §R13.6 — the bake pre-roll, itemised (≈116 s of the 2,680 s wall)
| item | s5_hospital | other runs (n) | note |
|---|---|---|---|
| `§BVH_DEFERRED built=20609` | **ms=26,981** | — (n=1) | 27.0 s of BVH build. **Never on record as a time** — §R12 recorded only its 50.2 MB. |
| `§CLI_BAKE_TM_PRIME ok` | **ms=14,917** | 14,836 / 15,233 / 15,400 / 14,912 (n=5) | very tight across runs |
| `§PHOTO_PREWARM` | **ms=7,965** | 7,993 / 7,999 / 8,026 / 8,039 / 9,391 (n=6) | `did=[mepSmooth,hdri,groundTex]` |
| `§MEP_SMOOTH_NORMALS` | ms=7,963.9 | — | geoms=1,662 ranges=14,617 verts 23.73M smoothed / 8.87M hard — i.e. it IS the whole prewarm |
| `§CLI_BAKE_LOADED` → nav | 12 s | 13 / 12 / 21 / 30 | streaming to `meshes=4287` |

TM prime interior (one run): `§S4_ACTIVATION_TIMING elemQuery=682 computeSchedule=1032
displayTimeline=1966 insertLoop=3236 supportCheck=3726 generativeBranchEnd=3784` then
`_CAP capBranchPreWrite=5069 capBranchWrite=7606`; `§S4_ACTIVATION_TIMING_MID
afterMaterializeNative=5670 afterLoadOps=13896 afterInjectGantt=13277 afterCachePut=13897`;
`§WRITE_LOOP_TIMING rows=63182 ms=2536.4`; `§XRAY_CACHE_BUILD elemMs=288.1 edgeMs=257.8
total_ms=576.3 elemMemo=miss edgeMemo=miss staged=611`.

**§R11 IS CONFIRMED ON A REAL HOSPITAL RUN — six times.** `§PHOTO_PREWARM` fires before the bake in
every run, carrying the full 7,963.9 ms of `§MEP_SMOOTH_NORMALS` off the Alt+S critical path.
**§R10 IS ALSO CONFIRMED**: `§MAXQ_FRAME_BUDGET taa=8 ao=12 renders/frame=20` is present on all
2,028 folds. ⚠ **This file's own ▶RESUME block (lines 13-18) still says "⛔ NEITHER IS CONFIRMED ON A
REAL HOSPITAL RUN YET" — that text is now STALE and should be struck**; the confirmation also sits in
`CINEMA_PATH_EDITOR.md §CLI_SILENT_BAKE` stage 5.

⚠ **Caution the next session must not skip:** the bake path's per-TAA-render cost is **49.06 ms**;
the user's interactive Alt+S log gives 6,868 ms for 16 TAA renders = **429 ms/render**, an 8.7× gap
on the same GPU and building. **Bake-path timings do not transfer to the Alt+S path.** Any first-
Alt+S latency work must be measured on the Alt+S path. Cause of the gap: **INCONCLUSIVE** from disk.

### §R13.7 — `§PHOTO_SHADOW_FORCE_REASSERT`: 1,163 provably-empty whole-scene traverses per bake
Summary line, one bake: **`§PHOTO_SHADOW disabled reassertRuns=2040 reassertSkips=14176
forcedSaves=2027`.** Code read (`effects.js:2781-2807`): `_finishStillRefine` calls the reassert with
`force`, which **bypasses** the `_wouldSkip` gate (idx/kids/vis unchanged) and runs a full
`A.scene.traverse` setting `castShadow` on every visible mesh. `forcedSaves=2027` means **every one
of the 2,027 forced calls bypassed a gate that would have skipped it.**

The bypass is NOT gratuitous — it is load-bearing on 321 frames (15.8%), which really did flip
`castShadow` on 4,201 meshes between them. But:

- **The last frame that ever flips anything is frame 864.** Topout (`§CPE_BUILDUP_TOPOUT
  topoutU=0.428`) is frame 868; `§CPE_BUILDUP` first reads `t=1.000 placed=63417/63417` at frame 900.
- **After frame 864, 1,163 frames (57.4% of the film) traverse 4,300+ visible meshes and flip
  exactly zero** — `flippedOn=0` on every one, in the log.

**Safe, zero-behaviour-change gate: stop forcing once the buildup has topped out.** Proven safe by
this log, not by argument.

**Saving in ms: INCONCLUSIVE.** The traverse carries no timer. Bounded from the one full-traverse
analogue on the same scene (`§PERF_TRAVERSE ms=26.5 objs=4288 mode=full`, frame 0) at
**≤ 30.8 s (1.1% of wall)**; the delta-mode figure on the same scene is 0.77-0.94 ms, so the floor is
~1 s. **FUTURE MEASUREMENT:** one `§` timer around the traverse; needs a live bake. Rank this on its
zero risk, not on its size.

### §R13.8 — the DLOD flip storm IS present in this bake and is NOT a bake-time cost (R9 closes, for bake)
`§DLOD_TICK` fires on 666 of 2,027 frames. Flip distribution: p50 **119**, p90 **829**, p99 **3,421**,
**max 8,626**, total **218,570** flips; **48 ticks at ≥1,000 flips**. `§CPE_PANEL_PERF` item 3
recorded `flips_mean=2671` — so at its peak the storm here is **3.2× worse** than the recorded case.

But it costs nothing measurable in a bake:

| cohort | n frames | fold total mean | max `ms_max` in cohort | visMeshes |
|---|---|---|---|---|
| tick, flips = 0 | 79 | 1,647.5 | 2.50 | 3,907 |
| tick, flips 1-99 | 210 | 1,019.0 | 3.30 | 2,512 |
| tick, flips 100-999 | 328 | 1,166.0 | 4.00 | 3,281 |
| **tick, flips ≥ 1,000** | 48 | **986.9** | **3.60** | 2,333 |
| no tick at all | 1,362 | 1,137.3 | — | — |

`§DLOD_TICK ms_max` **never exceeds 4.0 ms** in any bucket, and the ≥1,000-flip frames are
**faster** than the 1,146.0 ms bake mean (they are the frames where little is on screen — the
correlation with cost runs through visible-mesh count, §R13.3, and it runs the *other* way).

**Verdict: R9 / §CPE_PANEL_PERF item 3 is confirmed PRESENT and confirmed NOT A LEVER for bake
time.** It may still matter for interactive nav FPS, which is where it was originally observed and
which this bake does not test. Do not spend bake-perf effort on it.

### §R13.9 — per-frame work that is vacuous or unguarded (counts exact, ms unmeasured)
All of these sit inside the 371 ms tail of §R13.1. Counts are over 2,027-2,028 folds:

| `§` tag | fires | what the log says every time |
|---|---|---|
| `§GROUP_SPARK_TICK` | 2,027 | `playing=false cand=0 (frontier=0 recent=0) roll=0` — **VACUOUS on every frame of the bake** |
| `§GROUND_WETNESS_OVERRIDE` | 2,028 | `value=0.5 userSet=false` — identical every frame |
| `§NIGHT_STILL_LIGHTS` | 2,026 | `raised to 200 lights` — identical every frame |
| `§PHOTO_GLOW_SPRITE` | 3,502 | `removed 57 sprites` **then** `staged 57/1273 sprites` — a per-frame teardown+rebuild of an unchanged set |
| `§GLOW_LENS_QUAD` | 1,770 | `skip (count unchanged 1273)` on 1,740 of them — **the sibling two lines away HAS the guard the sprite path lacks.** That asymmetry is the finding |
| `§ENVMAP_STOMP_GUARD` | 906 | `skipped procedural regen — HDRI active`, **100% skips**. The guard works; the smell is a caller requesting a procedural envmap regen on 44.7% of bake frames |
| `§IDLE_GATE` | 330 | **165 `park` + 165 `wake`** pairs during a continuously-rendering bake |
| `§SHADOW_FRONTIER` | 33 | `casters=0 receivers=0` — vacuous |
| `§SHADOW_FRONTIER_AT_CAPTURE` | 286 | `singleMesh_matched=0 castShadowTrue=0 castShadowFalse=0` on **every single one** |

`§SHADOW_FRONTIER_AT_CAPTURE` is a **CLAUDE.md rule-4 violation**: it has never matched a single mesh
in 286 firings, so its zeros mean nothing — it must print `INCONCLUSIVE`/`VACUOUS`, not a number.

**Which of these costs the 371 ms: INCONCLUSIVE** — same future measurement as §R13.1.

### §R13.10 — cross-check against what was already on record
| finding | status |
|---|---|
| §R13.1 fold split (⅓/⅓/⅓), 752 s tail | **NEW** — and it retracts §R10's 62/23/15 split |
| §R13.2 per-render costs, 3m41s AO margin | **NEW numbers on a KNOWN decision** (§R10's `ao=12` choice) |
| §R13.3 visible-mesh count is the driver; closing orbit = 29.1% of fold time | **NEW** |
| §R13.4 heap sawtooth / §CLI_BAKE_HEAP unusable | **NEW**; §R12_HOSPITAL_MEM's 1,546-1,577 MB stands unchanged |
| §R13.5 `§CINEMA_PLAN_MS` ×7 / 10,253 ms | **KNOWN defect** (§CPE_PANEL_PERF item 2, 3× / 559 ms); **NEW magnitude, 18×** |
| §R13.6 BVH 27.0 s, TM prime 14.9 s, prewarm 7,965 ms | prewarm/R11 **CONFIRMED** (was "not confirmed"); BVH time **NEW**; TM prime relates to §CPE_PANEL_PERF item 1 (`setupMs=2052`) but is a different, larger measurement |
| §R13.7 1,163 empty forced traverses | **NEW** |
| §R13.8 DLOD storm present, not a bake cost | **KNOWN defect** (§CPE_PANEL_PERF item 3 / R9); **NEW negative result** |
| §R13.9 vacuous per-frame work | **NEW** |
| memory levers 1-4 of §R12_HOSPITAL_MEM | **untouched, not re-derived, still the ranked memory list** |

### §R13.11 — the partial A/B: headful vs headless (NOT A RESULT, do not cite as one)
`…/6bdc5d30…/scratchpad/bake/` holds a §NIGHT_BAKE_POOL isolation A/B that **was killed mid-run**:
ARM A died `EADDRINUSE 127.0.0.1:8561` (exit 1), ARM B was `Killed` (exit 137), and the PRE arm
(`pre.log`) logged **zero** `§MAXQ_FRAME` lines — it never reached the frame loop. Only ARM POST
completed.

The one comparison it permits, and its caveat:
- `post.log` — headful (real window, the Alt+C environment), 80 frames, `d37eb109`:
  `meanMs=2711 p50Ms=1688.4 worstMs=10802.3`
- `s4b_80.log` — headless real-GPU, 80 frames, `e1369b7a`: `meanMs=1359.1 p50Ms=1258.5 worstMs=8664.1`

**2.0× on the mean.** This is INDICATIVE ONLY: the A/B ran 07:47-07:54 today with two other agents
on this machine, and the headless arm ran on a quiet machine yesterday. It matters because **the
number a user experiences is the headful one** — every measurement in §R13.1-§R13.9 is from the
headless arm. **NAMED FUTURE MEASUREMENT: one headful and one headless 80-frame bake, same commit,
back to back, on a quiet machine.** Until then, treat §R13's absolute ms as headless-path figures
and its ratios/shares as the transferable part.

### §R13.12 — handed to the TM/4D schedule lane (buildup pacing, not bake time)
From `daybatch_Hospital.log` / `daybatch_burst.log`, already measured, unmined until now:
- `§DAYBATCH_FRAMES frames=3118 mean=20.3/frame worst=94 at f1250 = 4.6x mean`
- `§DAYBATCH_PULSE_PREDICTION framesPerDay=9.81` — a 1-frame daily pulse would put **399 elements on
  one frame (19.7× mean)**, and `daysWhoseFullCountExceedsCurrentWorstFrame=299/319`
- `§DAYBATCH_BURST_TASKFRAMES TASK_MEP_Rough_in_Level_3 aloneOccupies 629 frames: perFrame p50=14
  p90=23 max=82 mean=15.1` — a **5.4× sub-day swing inside ONE task** whose per-DAY rate is near-flat
  (`CV=0.23`), because tiling is duration-weighted, not calendar-weighted
- `§DAYBATCH_BURST_INSTALLSECS burstRun installSecs p50=114 vs task p50=1920` — the grouping key that
  exists in the data is per-element crew DURATION, not calendar day

Also from the bake: **the TM buildup is the bake's peak-memory phase** (§R13.4 relative series) and
it finishes at frame 868 of 2,027 — after which `§PERF_TRAVERSE` still runs every frame at
`mode=delta span=0h` (0.77-0.94 ms, **not** a lever) and the shadow reassert runs empty (§R13.7,
which **is** one).

### §R13.13 — ranked, with lane
| # | finding | measured | phase | confidence | lane |
|---|---|---|---|---|---|
| 1 | non-render tail = 32.4% of every fold | **371.1 ms/frame · 752.2 s/bake** | Alt+C bake | HIGH (2,027-frame series) | perf → film |
| 2 | AO margin `ao=12` vs `ao=8` | **109.0 ms/frame · 221 s (3m41s)** | Alt+C bake | HIGH | film (user decision) |
| 3 | closing 20% of film = 29.1% of fold time; driver is visible-mesh count r=+0.875 | **677.2 s** | Alt+C bake | HIGH | film |
| 4 | `§CLI_BAKE_HEAP` 229-477 MB is an aliased sawtooth; peaks 2,389/2,431/5,223 MB observed | 5 series compared | bake + harness | HIGH (values), MEDIUM (mechanism) | perf |
| 5 | `§CINEMA_PLAN_MS` ×7 = 10,253 ms per Alt+C open | **10,253 ms** | Alt+C open | HIGH | film |
| 6 | pre-roll: BVH **26,981 ms**, TM prime **14,917 ms**, prewarm **7,965 ms** | as shown | buildup / first-Alt+S | HIGH (n=5-6 on the last two, n=1 on BVH) | TM lane + perf |
| 7 | 1,163 provably-empty forced whole-scene traverses | count exact, ms ≤30.8 s | Alt+C bake | HIGH (count), INCONCLUSIVE (ms) | film |
| 8 | DLOD flip storm real (max 8,626) but **not** a bake cost | tick ≤4.0 ms | Alt+C bake | HIGH | perf (closes R9 for bake) |
| 9 | vacuous/unguarded per-frame work, 9 tags | counts exact, ms unknown | Alt+C bake | HIGH (counts) | film |
| 10 | headful ≈ 2.0× headless per frame | 2,711 vs 1,359 ms | Alt+C bake | **LOW — partial + contended** | perf (re-measure) |

### §R13.14 — the four measurements that genuinely need a live run, with their reason
1. **Decompose the 371 ms tail** — `§FOLD_PHASE` timers around each non-render phase of the fold and
   around the capture. *Reason: no existing `§` line inside the tail carries a millisecond value.*
2. **Cost of one `§PHOTO_SHADOW_FORCE_REASSERT` traverse** — one timer. *Reason: needed to rank
   §R13.7 against the other tail items; bounded today only at 1-30 s.*
3. **Headful vs headless, back to back, quiet machine** — 80 frames each, same commit.
   *Reason: every absolute ms in §R13 is headless; the user's Alt+C is headful and the only
   comparison available is a killed, contended run.*
4. **Dual-instrument heap sampling in `cli_silent_bake.js`** — page-side `performance.memory` on the
   same tick as `page.metrics()`, ~2 s rate. *Reason: today's single 20 s series aliases a quantity
   that moves 2.16 GB inside one sampling gap, and reports the miss as if it were the answer.*
   (This one is a harness edit that then rides free on whatever bake happens next — it needs no
   dedicated run.)

**Nothing was run and no product code was changed in this pass.**

---

## §R14_VACUOUS_TAG_AUDIT — the nine per-frame tags of §R13.9, diagnosed and treated (2026-09-02, queue item A-7)

```
# ⚠ DO NOT REMOVE
SCOPE: CLAUDE.md rule 4 — "a witness that cannot report its own failure is not a witness." The
nine per-frame `§` tags §R13.9 listed fire every frame while judging nothing, or judge something
and repeat the identical verdict thousands of times. Each one gets ONE of: GUARD (say VACUOUS /
name the empty predicate), FIX (the vacuity is an upstream defect, not an empty population), or
REMOVE (provably cannot ever judge, and duplicates another).
EVIDENCE: read-only. `s5_hospital.log` (2,027 frames, 41,705 lines, commit e1369b7a, sw v1120) +
`s4b_80.log`, both already on disk from 2026-09-01. NO BAKE, NO BROWSER, NO PROBE was run for
this item — user directive 2026-09-02. Every count below is `grep -c` on those logs.
READ THE LOG AFTER EVERY RUN. Honour this block until §R14 is DONE.
```

### §R14.0 — the contract the nine are being held to (`§VAC`)

Three rules, applied per tag. They are the operational form of CLAUDE.md rule 4:

- **V1 — VACUOUS must be sayable.** When the population a tag judges is provably empty, the line
  says the word `VACUOUS` and **names the empty predicate**. A bare `0` is banned, because it is
  indistinguishable from "judged a real population, found nothing wrong."
- **V2 — a repeated verdict is reported once, with its repeat count.** A per-frame line that emits
  an identical verdict N times prints it on the first firing, suppresses the rest, and emits
  `repeats=N` when the verdict changes. **The signal is never dropped, only compressed** — the
  count is the signal.
- **V3 — a guard that logs only its skip path must count the other path too.** "100% skips" with no
  denominator cannot distinguish "the guard saved us 906 times" from "the guarded branch was never
  reachable."

### §R14.1 — the decisive question: empty population, or broken matcher?

The item's own warning is that quietly stamping `VACUOUS` on a **broken lookup** hides a live
defect behind a compliant-looking log line. Each of the nine was tested against that distinction
before treatment. **Two came back FIX, seven came back GUARD, none REMOVE.**

#### `§SHADOW_FRONTIER_AT_CAPTURE` — **EMPTY POPULATION, not a broken matcher. Settled.**

The tag fires 286 times, every one `singleMesh_matched=0 castShadowTrue=0 castShadowFalse=0`.
Three independent facts settle it as a genuinely empty population:

1. **The index the matcher queries is itself empty, and says so.** `s5_hospital.log`:
   `§SHADOW_FRONTIER_IDX built gen=2814 meshGuids=0 groupGuids=63182 ms=8.6` — one firing, whole
   bake. All 63,182 streamed guids landed in the **group** (batched/instanced) index; the
   single-mesh index has zero entries. Identical in `s4b_80.log`: `meshGuids=0 groupGuids=63182`.
   The matcher (`cinema_maxq.js:1632-1636`) is a `Map.get` against a Map of size 0 — it cannot
   match, and nothing is wrong with it.
2. **The single-mesh population is a FALLBACK that did not fire.** `viewer/streaming.js` writes
   `userData.guid` onto an individual `THREE.Mesh` in exactly three places — `:2069-2075` (the
   `new THREE.BatchedMesh(...)` constructor threw, `§BATCHED_FAIL`), `:2143-2146` (BatchedMesh
   unavailable on the device), `:2438-2445` (oversized / over-budget elements spilled out of the
   slot reservation). In this run: `§RENDERER_CAPS multi_draw=on (fast batched path)`,
   `§UPGRADE_API_CHECK BatchedMesh=function`, and **`grep -c BATCHED_FAIL` = 0**. None of the
   three fallbacks fired, so `meshGuids=0` is the CORRECT answer on this device for this building.
3. **The other half of the same line is answering normally.** `batchObjsContainingFrontier` is
   non-zero on **every one of the 286 firings** and `batchCastShadowTrue` equals it every time
   (e.g. `frontierGuids=30 … batchObjsContainingFrontier=7 batchCastShadowTrue=7`). The check is
   working; the single-mesh half is the empty half.

> **Verdict: GUARD, not fix.** The `singleMesh_*` triplet must print `VACUOUS (no individually-
> meshed elements in this scene: §SHADOW_FRONTIER_IDX meshGuids=0)`, not three zeros.

**But the same read found a REAL reporting hole in this tag, and that half is a FIX.** The
forEach at `cinema_maxq.js:1632-1636` has three outcomes — mesh hit, group hit, **and a silent
`return`-less fall-through when the guid is in NEITHER index** — and only the first two are
counted. A frontier guid that is missing from both indexes is today indistinguishable from one
that was deduped into an already-seen batch object, because `batchObjsContainingFrontier` is
deduplicated by object (`frontierGuids=10 → batchObjs=4` is normal dedup, or four hits and six
misses — the line cannot say which). **Fix: add `unmatched=`.** It is a counter on an existing
else-branch, not a new measurement. Standing evidence it will earn its keep on the next bake
anyone runs: `§SHADOW_FRONTIER_IDX groupGuids=63182` against `§CPE_BUILDUP … placed=63417/63417`
— a **235-guid** difference between the streamed set and the set TM places. Whether any of those
235 ever appear in a frontier set is exactly what `unmatched=` answers, and nothing on disk today
can.

#### `§GROUP_SPARK_TICK` — **FIX: its throttle is DEAD in the bake path.**

`time_machine.js:1017` gates the log on `_gspRoll % 10 === 0`, intending a 1-in-10 sample.
`_gspRoll++` happens in **exactly one place**: `time_machine.js:3386`, inside `playTick()`, behind
`if (!_playing) return;` — "one re-roll per playback tick." A bake never calls `playTick()`; it
drives `renderAtTime()` directly. So during a bake **`_gspRoll` is frozen at 0, `0 % 10 === 0` is
always true, and the 1-in-10 throttle degrades to 1-in-1.** The log proves it: all 2,027 firings
carry `roll=0`, and the count is 2,027 = one per frame, not ~203.

**The same dead expression gates `§PERF_TRAVERSE` (`time_machine.js:1613`)** — also exactly 2,027
firings in the same log. That is **4,054 log lines emitted where ~406 were intended.**
`§PERF_TRAVERSE` is out of A-7's scope (it is a real per-frame measurement someone may still be
mining, and §R13.12 quotes it) and is **left alone, named here**, not silently re-cadenced.

On top of the dead throttle the tag is also vacuous: 1,681 of 2,027 firings read
`playing=false cand=0 (frontier=0 recent=0)` — no candidates, no playback, nothing judged.

#### The other seven — GUARD, population genuinely empty or verdict genuinely repeated

| tag | site | why its zeros/repeats are honest | treatment |
|---|---|---|---|
| `§SHADOW_FRONTIER` | `time_machine.js:1665` | `casters=0 receivers=0` ×33 is **structurally forced twice over**: `_shadowCasters++` (`:1463`) sits behind `if (app._shadowOn)`, and the log says `§TM_SHADOW_INHERIT shadowOn=false` / `§TM_SUN_INHERIT shadowOn=false` for this run; and the counter lives in the **single-mesh branch**, which the comment at `:1342` names explicitly — the same empty population as §SHADOW_FRONTIER_AT_CAPTURE. The log line sits OUTSIDE the `if (app._shadowOn …)` block at `:1645`, so it fires either way and names neither reason. | **V1** — print `VACUOUS` and which of the two predicates is empty |
| `§GROUND_WETNESS_OVERRIDE` | `effects.js:3186` | 2,028 firings, **one distinct line**: `value=0.5 userSet=false`. `A._setGroundWetness` logs unconditionally, including when it re-sets the value it already holds (staging is torn down and rebuilt every bake frame). | **V2** |
| `§NIGHT_STILL_LIGHTS` | `effects.js:4814` | 2,026 firings, **one distinct line**: `raised to 200 lights, near-fade floor 1 …`. | **V2** |
| `§PHOTO_GLOW_SPRITE` | `effects.js:4538` + `:4553` | 1,730 `staged`/`removed` pairs but only **11 count-runs** across the whole film (57→9→19→21→24→26→35→36→46→55→57). ⚠ §R13.9's phrase "an unchanged set" is imprecise and is corrected here: the staged COUNT does change, 11 times. And the WORK is not redundant — sprite positions carry a camera-dependent `GLOW_EYE_OFFSET` nudge (`effects.js:4387,4495`), which is precisely why `§GLOW_LENS_QUAD` was given a stage-keep guard and this was not (`0d80b03b`). **The work is correct; the log is the defect.** | **V2** on both lines |
| `§GLOW_LENS_QUAD` | `effects.js:4177` | 1,740 of 1,770 firings are the identical `skip (count unchanged 1273)`. The guard is doing its job — it just says so 1,740 times. | **V2** |
| `§ENVMAP_STOMP_GUARD` | `scene.js:305` | 906 firings, **100% skips**, and the `_setEnvMap(...)` arm two lines up logs nothing at all, so the ratio has no denominator (V3). At 906 over a 2,680 s bake this is the 2,000 ms `A._envMapThrottle` timer firing ~every 3 s, not per frame — so the count is honest; what is missing is the other arm. | **V2 + V3** |
| `§IDLE_GATE` | `main.js:876` / `:937` | **NOT a rule-4 violation — the only one of the nine that is already compliant.** Its 165 park + 165 wake lines are the existing `_idleCycles % 25` sample reporting **4,050+ real park/wake cycles** (`§IDLE_GATE wake cycles=4050` is the largest in the log), and 162 of the 165 park lines already say `(throttled: every 25th)`. The unthrottled sibling at `main.js:941` fired **0 times** (`grep -c "desktop loop idle"` = 0). ⚠ §R13.9 read "165 park + 165 wake pairs" as the EVENT count; the event count is 4,050+. That misreading is the one real defect — a line that invites it. | **wording only** — state the sample rate and running total on the line itself; **no mechanism change** |

### §R14.2 — implementation rule: compress, never drop

Every V2 site uses the same shape, written locally in each file (no new shared script — a new
file would need a `viewer.html` tag, a `sw.js` `PRECACHE_ASSETS` entry, and a load-order guarantee
before `effects.js`, which is the 8th script tag; that is more risk than five six-line closures):

```
if (line !== _lastLine) {
  if (_repeats > 0) console.log(TAG + ' repeats=' + _repeats + ' (identical, suppressed)');
  console.log(line); _lastLine = line; _repeats = 0;
} else _repeats++;
```

The suppressed count is emitted **before** the next distinct line, so the log reads as a run-length
encoding of the same series. Nothing is lost; a reader can still reconstruct the exact per-frame
count. Where a run never ends (the bake exits mid-run), the pending `repeats` is flushed by the
tag's own teardown/summary path where one exists.

### §R14.3 — what this item did NOT do

- **No bake, no browser, no probe.** The treatments are logging-shape changes verified by reading
  the code and the two logs already on disk. **The next bake anyone runs is the confirmation** —
  it rides free, exactly like §A-8's heap fix.
- **`§PERF_TRAVERSE`'s dead throttle is named, not fixed** (§R14.1) — out of scope, and it is a
  real per-frame measurement other sections quote.
- **No behaviour changed.** Not one of the nine treatments alters what is rendered, staged, torn
  down, or scheduled. Only what is printed.

### §R14.4 — MEASURED result of the treatments (bim-ootb PR #1608, `fix/vacuous-tag-audit`)

**W-VACUOUS-TAG-GUARDS 10/10 PASS, redControl green** (`viewer/tests/witness_vacuous_tag_guards.js`,
auto-discovered by `tests/run_witness_suite.js` headless class, `§SUITE_SUMMARY green=1 new_red=0`).
The archived series is replayed through the **SHIPPED `_vacLog`** — extracted out of `effects.js`
and **executed**, not modelled, because a reimplementation would only prove the witness is lossless.

| tag | fired before | lines after | reconstructed | lossless |
|---|---|---|---|---|
| `§GROUND_WETNESS_OVERRIDE` | 2,028 | **10** | 2,028 | ✅ |
| `§NIGHT_STILL_LIGHTS` | 2,026 | **10** | 2,026 | ✅ |
| `§PHOTO_GLOW_SPRITE staged` | 1,751 | **24** | 1,751 | ✅ |
| `§PHOTO_GLOW_SPRITE removed` | 1,751 | **24** | 1,751 | ✅ |
| `§GLOW_LENS_QUAD skip` | 1,740 | **29** | 1,740 | ✅ |
| `§GROUP_SPARK_TICK` | 2,027 | **467** | 2,027 | ✅ (rule simulated — inline, not callable) |
| `§SHADOW_FRONTIER_AT_CAPTURE` | 286 | 286 | — | volume unchanged BY DESIGN; the CONTENT was the defect |
| `§SHADOW_FRONTIER` | 33 | 33 | — | already a 1-in-60 sample; CONTENT was the defect |
| `§ENVMAP_STOMP_GUARD` | 906 | **10** | exact totals via `A._envmapStompStats()` | ✅ |
| `§IDLE_GATE` | 330 | 330 | — | already compliant; wording only |

**Two things this pass got WRONG first, both caught by the witness rather than by review — recorded
because they are the exact failure modes §R14.0 was written to prevent:**

1. **A scope-blind witness.** C2 ("can this tag say VACUOUS?") originally grepped a ±2,500-char
   window around the emit site. The falsification arm deleted `VACUOUS` from the *emit statement*
   and **C2 still passed** — it was reading the explanatory comment block above it. The region check
   now strips comments first. A witness that passes because the defect sits inside the window it
   inspects is the same rule-4 defect it was written to close (CLAUDE.md rule 4, third mode).
2. **A silent DROP dressed as compression.** `§GROUND_WETNESS_OVERRIDE`'s first guard was its own
   inline change-only rule with no heartbeat and no flush. On this series — one distinct line,
   2,028 firings, a run that never ends — it would have emitted **1** line and never reported the
   2,027 repeats. C3 (losslessness) caught it. It is routed through the shared `_vacLog` now, which
   carries a bounded heartbeat and a flush at real still exit.

**Compatibility, checked by reading the consumers (not by running them — no-bake directive):**
`witness_glow_lens_stage_keep.js` asserts `ft.skip > 0` and reads `§GLOW_LENS_QUAD staged rect=` /
`removed`, all still emitted verbatim; `witness_tour_wake.js` and `tests/probe_idle_blank.js` match
the `§IDLE_GATE park` prefix, unchanged. `sw.js` `CACHE_VERSION` v1122 → **v1123**.

**Two items handed on, deliberately not done here:**
- **`§PERF_TRAVERSE` carries the same dead `_gspRoll % 10` throttle** (2,027 firings in the same
  log, where ~203 were intended). Out of A-7's scope — it is a real per-frame measurement §R13.12
  quotes. Fixing it is a one-line change to the same counter; someone should take it deliberately.
- **`unmatched=` will attribute the 235-guid gap** between `§SHADOW_FRONTIER_IDX groupGuids=63182`
  (streamed) and `§CPE_BUILDUP placed=63417` (TM). Nothing on disk can answer that today. **It rides
  free on the next bake anyone runs** — no dedicated run needed, same as §A-8's heap fix.
