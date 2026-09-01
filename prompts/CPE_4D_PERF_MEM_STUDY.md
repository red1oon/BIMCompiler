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
