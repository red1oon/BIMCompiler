# ⚠ DO NOT REMOVE — Hospital 4D Superstructure duration anomaly + share-button correction
# SCOPE: Items 0-8 (duration/rate bugs, mini-Gantt cascade, share-button removal, IDB cache
#   fallback) are CLOSED — all fixes shipped and merged, see the status block below. Item 9
#   ("glowing thru each element appearance and closeup burned red") is OPEN — read it below
#   before touching code. Read the log after every run.

## 🏁 Items 0-8 CLOSED 2026-07-19 — full history archived verbatim, nothing lost
`prompts/archive/HOSPITAL_4D_SUPERSTRUCTURE_DURATION_ANOMALY_full_history_2026-07-18_to_2026-07-19.md`

What shipped (all bim-ootb, merged, user-confirmed live where the archive says so):
- **Item 0** — verified the session's own `BatchedMesh` frontier-visibility edit was NOT the cause
  of a reported appearance regression (A/B identical counts at the same TM cursor).
- **Item 1** — dropped the unrequested `#tm-share` button, PR #852.
- **Item 2** — root-caused + fixed `locale_loader.js` silently dropping productivity classes not
  listed in the active locale (collapsing them to a 120s generic fallback), PR bim-ootb#853
  (`fix/locale-productivity-deep-merge`) + a `_GANTT_CACHE_VERSION` bump for the stale-cache case.
- **Item 3** — fixed the scene not clearing at 0Hr on large buildings (streaming/TM desync), PR
  bim-ootb#856 (`fix/tm-stream-resweep`), with a follow-up `sw.js` cache-version bump PR #862 and
  an orphaned-PR relanding as PR #859 (re-verified live on production, not just via `gh pr view`).
- **Item 4** — fixed every Level's Superstructure building "at once" (uncapped per-Z-band crew
  concurrency), PR bim-ootb#864 (`fix/schedule-crew-cap-cascade`) + `_GANTT_CACHE_VERSION` v2→v3.
- **Item 5** — shipped the frontier "shine thru" halo glow feature, PR bim-ootb#866
  (`feat/frontier-halo-glow`) — **then REVERTED** in the same investigation arc after it caused a
  "yellow cubes hell" wash (root-caused: uncapped additive sprite stacking + render-on-demand
  sprites outliving the idle-parked render loop). Superseded by the `§GROUP_SPARK` design under
  Item 9 below.
- **Item 6** — root-caused + fixed the mini-Gantt drawer showing "still all at once" through THREE
  distinct layers, found one at a time by real user pushback each round: `§STOREY-Z` storey
  reassignment for elements tagged `storey='Unknown'` (PR bim-ootb#869), an IndexedDB gantt-cache
  version bump the first fix needed but initially missed (PR #871), and a percentile trim (2nd-98th
  instead of true min/max) for outlier-skewed bar spans (`§GANTT_MINI_TRIM`, PR #873).
- **Item 7** — fixed `A.openCacheDB()` throwing `VersionError` forever on a browser profile whose
  `bim_ootb_cache` IndexedDB was already past version 2 (no self-heal existed), PR bim-ootb#878
  (`fix/idb-cache-version-fallback`).
- **Item 8** — fixed a FOURTH distinct root cause: once ANY captured/authored schedule exists via
  the Schedule Author wizard, every element in a phase got the phase's verbatim start/end dates
  instead of being distributed by real Z-order within that window, PR bim-ootb#882
  (`fix/captured-schedule-per-element-stagger`). User confirmed "working" live.

Also on record in the archive: the standing `/tmp/wt-sandbox` test-server note (see
`reference_bim_ootb_sandbox.md` in memory for the canonical version) and the two witness scripts
used for Item 2 (`witness_superstructure_duration.js`, `witness_hospital_tm_live.js`, both
scratchpad-only and may not have survived past their session).

---

## Item 9 — ⛔ OPEN, handoff for a fresh session (2026-07-19) — "glowing thru each element
## appearance and closeup burned red"
User, after confirming Item 8's staircase fix is "working" live: new report, verbatim — "the
glowing thru each element appearance and closeup burned red." **Explicitly deferred — user asked
to update this file so a fresh session solves it, not fix it in this session.** Not yet
investigated live (no screenshot/log captured for THIS specific report) — the lead below is a
grounded code-reading finding, not a confirmed diagnosis. Verify against a real screenshot/log
before assuming it's the cause.

### ➜ PERF SPIN-OFF: `prompts/TM_INCREMENTAL_RENDER_PERF.md` (2026-07-19)
Measured during the §GROUP_SPARK work: `renderAtTime()` runs TWO O(n) passes per tick — an ops scan
(~16,115 ops, rebuilding ~16k-key dicts every tick) and a full `scene.traverse()` (10,841 objects,
`§PERF_TRAVERSE ms=15.6–22.4` of a ~31ms tick) — to service single-digit actual changes. Spec for
the incremental-update fix lives in that file. Also records three RETRACTED perf hypotheses so they
are not re-derived: `§RENDER_LOOP total` is not a violated invariant (self-parking by design, the
`main.js:699` witness is stale), per-tick `ad_seed.db` refetch was NOT reproducible on Hospital
(exactly 2 fetches in 40s), and the spark-side micro-optimisations benchmarked as no-ops.

### SPEC — §GROUP_SPARK (2026-07-19, user-directed, rig-validated before any production code)
**Scope: eye candy only.** User, verbatim: *"sparkling is just an animation eye candy."* It reads
NOTHING from the schedule and means nothing — it decorates whatever is mid-install. Consequence,
and this is load-bearing for the port: **group composition does not need real task data.** Any
grouping that is roughly "pieces being worked together" is sufficient, because nobody reads
information off it. This retires the "measure real frontier counts first" pass proposed earlier.

**The animation model** (user-designed, verbatim): *"if it is a group of pieces, then they
randomize among themselves repeatedly until their duration is reached. If the group is small say
only single or 2 pieces then it is those only. This is irrespective the piece ar big or small. Now
small sparks will shine thru and be viewable."*
- Group of ≥3 pieces → a random subset (`frac`) sparks, re-rolled every `reroll` frames, for the
  whole duration of the group's window.
- Group of 1–2 pieces → those pieces spark continuously (nothing to randomize among).
- Spark size scales with the PIECE, but additive + `depthTest:false` keeps every spark visible
  regardless of piece size ("irrespective the piece ar big or small").
- Each spark runs its own short white→yellow→red→out flash inside its re-roll interval, phases
  staggered so they don't pulse in lockstep.
- Randomization is a SEEDED HASH of `(groupId, rollIndex, slot)` — never `Math.random()` — so
  frames are reproducible and captures are comparable across tuning rounds.

**Three playback states (this is the anti-lingering design, not a cleanup step):**
| state | sparks | why |
|---|---|---|
| **Playing** | animate | ticks are producing frames |
| **Scrubbing** | NONE | user: *"i dont mind if scrubbing no sparks.. as it is showing timeline state"* / *"because scrubbing the appreciation is in the quick diff in states"* — flashing VFX competes with the state-diff read that scrubbing exists for |
| **Stopped** | stop re-rolling, in-flight flashes cool out over ~15 frames, park at ZERO | the field dies on its own; the only state that can persist is zero |

**Why this structurally kills the Item 5 failure** (see the root-cause finding below): the old halo
could be left frozen on screen because sprites outlived the render loop. Here sparks exist ONLY
while playback produces frames, and stop always decays to zero — so there is nothing that *can*
linger even if the port is imperfect. Safety-net `GLOBAL_CAP` remains, but the model is already
self-limiting: sprite count is driven by *active groups × frac*, not by frontier size (1600
elements → 40–85 sparks, never near the 140 cap).

**Rig-validated params (`/tmp/wt-sandbox/glow_halo_v3.html`, untracked):** `frac=0.16`,
`reroll=2` frames, `size=2.6`, `GLOBAL_CAP=140`, `decayf=15`. User picked "fast sharp" over molten:
*"should be fast sharp because the time machine is just a demo player simulator where user can
scrub."* Witness clips (in `~/Pictures/Screenshots/`): `spark_C_fastsharp.mp4`,
`spark_D_stopdecay.mp4`; wash reproduction + v2 comparison: `halo_OLD_wash.mp4`,
`halo_NEW_fixed.mp4`, `frontier_glow_current_2026-07-19.mp4`.

**⚠ Known-unverified at spec time:** all tuning is against a SYNTHETIC 1600-cube grid at a fixed
camera distance, with invented group sizes. Real Hospital members vary far more than the rig's
0.8/2.2m cubes, and drone-fly gets much closer than the rig framing. Expect ONE tuning round
against real geometry — a clean first hit would be luck, not evidence.

### ROOT CAUSE of the Item 5 "yellow cubes hell" — FOUND 2026-07-19 (two independent causes)
Both found by rig reproduction, not code-reading speculation. The reverted #866's sweep logic was
CORRECT — the wash was never a missing-cleanup bug, which is why nobody could point at a broken line.
1. **Uncapped additive stacking.** `applyFrontierHalo()` was called per BatchedMesh slot AND per
   InstancedMesh instance with NO pool cap. Additive blending is unbounded — N overlapping sprites
   SUM toward white. Reproduced deterministically: 414 simultaneous frontier elements → a solid
   yellow-orange field (`halo_OLD_wash.mp4`). It is a property of the design, not a glitch.
2. **Sprites outliving the render loop.** The viewer is RENDER-ON-DEMAND with idle-park
   (`viewer/main.js:654-660, 808-852` — `_needsRender`/`§IDLE-PARK`), NOT a continuous rAF loop.
   When rendering parks, whatever sprites were visible in the last drawn frame stay frozen on
   screen indefinitely, with nothing to advance or clear them. **This is the "it just lingers"
   the user could never pin down.** Any future always-on VFX in this viewer hits the same trap.

### ✅ ANSWERED 2026-07-19 (isolated-rig capture + VFX research) — "is the glow burning impressive?" NO
User asked to check whether the effect is impressive BEFORE treating it as a bug. Answered with an
ISOLATED test rig (`/tmp/wt-sandbox/glow_isolated.html`, untracked) that mirrors production exactly:
real `viewer/lib/three.module.min.js`, `ACESFilmicToneMapping` @ `toneMappingExposure = 0.45`
(`viewer/scene.js:64-65`), NO bloom pass, and a VERBATIM port of `applyHighlight()` + the
`ft < 0.15 ? 0x44ffff : 0xff8c00` rule. 5s / 75-frame deterministic capture at 15fps
(`scratchpad/glow_current.mp4`, frames in `scratchpad/frames/`). **Verdict: not impressive — three
concrete defects, all confirmed from RENDERED PIXELS, not hex constants** (the Item 5 lesson honoured):

1. **"Burned red" is REAL and the user is measurably right.** Source constant is ORANGE `0xff8c00` =
   (255,140,0); the actual sampled on-screen pixel is **(153, 81, 14)** — a dark, muddy burnt
   red-brown. Item 9's earlier speculation was that HIGH exposure might shift orange toward red;
   the truth is the opposite — LOW exposure (0.45) under ACES crushes the orange into dark red.
   Do not "correct the user's perception"; the pixels agree with them.
2. **There is NO glow at all — it's paint, not light.** `emissiveIntensity = 0.4` is BELOW 1.0, so it
   is LDR-clamped, and the viewer runs no `UnrealBloomPass` (the `_tmBloomActive` path,
   `time_machine.js:1666-1723`, only bumps `emissiveIntensity` to 0.2 at night — it is not a bloom
   pass). Capture shows flat matte orange cubes with zero halo/bleed. This is the textbook failure
   mode: emission is `[0,∞]` lighting data, and glow requires HDR emissive (5–50+, 100+ for a
   beacon) rendered to a half-float target THEN selective bloom, with `OutputPass` (ACES) LAST.
3. **`depthTest = false` reads as a z-sorting BUG, not as VFX.** Capture shows solid opaque cubes
   punched flat over the occluding wall. Known three.js pitfall (mrdoob/three.js#12737): with
   `depthTest:false` opaque sorting falls back to `program.id`/`material.id` before z, and
   `renderOrder` does not reliably rescue it; the mesh also self-intersects (back faces over front).
4. **The colour never cools.** `0x44ffff → 0xff8c00` is a hard SNAP at t=0.15 then a constant for the
   remaining 85% — there is no yellow→orange→reddish-brown progression at all, i.e. the thing the
   user actually asked for in Item 5 ("yellow burn glow turning to reddish brown cool") is not
   implemented in the surviving code path. (It WAS in the reverted `_haloColorFor()` sprite.)

**The correct implementation shape, if this is picked up** (researched, sourced — do NOT re-derive):
separate additive BEACON PROXY, never mutate the real element's material. Clone/shell the geometry
at ~1.02 scale; `transparent:true`, `AdditiveBlending`, `depthTest:false`, `depthWrite:false`,
`renderOrder=999`; drive alpha by a fresnel/rim term (`pow(1-dot(viewDir,normal), 2..3)`) so
silhouette edges glow and the centre stays sparse; put it on a dedicated bloom LAYER and use the
two-composer selective-bloom setup (bloomComposer `renderToScreen=false` + non-bloom objects blacked
out → finalComposer combines → `OutputPass` last). Additive can only brighten, never occlude, so the
wall stays visible through it — that is what makes it read as light leaking through geometry instead
of a sorting failure. Optional stencil mask so the beacon only draws where actually occluded (stops
the near face double-brightening). Params to start from: bloom `strength 0.6–1.0, radius 0.3–0.5,
threshold 0.85–1.0`; note red-dominant hot colours are weighted only 0.2126 in the bloom luminance
test so they need proportionally HIGHER intensity than a yellow-green of equal apparent brightness.
Colour: use a MULTI-STOP blackbody ramp, lerping only between adjacent stops — `#ffb46b` (3000K) →
`#ffa54f` → `#ff932c` → `#ff7e00` → `#ff6500` → `#ff3800` (1000K) → fade to `#3d0a00`. A two-point
`THREE.Color.lerp()` desaturates through the midpoint and loses the orange band (use `lerpHSL()` if
two stops are unavoidable). Critically, cooling reads through INTENSITY, not hue — drive
`emissiveIntensity` down alongside the hue shift (~`(T/Tmax)^2.5` over a 100→2 range; literal
Stefan-Boltzmann `T⁴` crashes so fast the glow appears to blink off).
Sources: donmccurdy.com/2024/04/27/emission-and-bloom/ · discourse.threejs.org/t/57843 ·
github.com/mrdoob/three.js/issues/12737 · github.com/mrdoob/three.js/pull/26371 ·
temperature.m15y.com · blog.mmacklin.com/2010/12/29/blackbody-rendering/

**Still NOT established:** which building/mesh-type the user was actually looking at. The rig proves
what `applyHighlight()` LOOKS like, and it matches the report word-for-word — but on Hospital/Terminal
(`sceneMeshGUIDs=0`, all Batched/Instanced) this path barely fires, and there is still NO
`setColorAt`/`instanceColor` anywhere in `viewer/*.js` outside `hba_lens.js`, so batched/instanced
frontier elements get no tint from this file. If the user was on Hospital, the red they saw comes
from a mechanism not yet located. Confirm the building before fixing.

**Confirmed still-active mechanism that matches the symptom description** (found by reading
`viewer/time_machine.js`, not guessed): `applyHighlight()` (~line 1420) is the per-element frontier
glow that survived the Item 5 halo-sprite revert (a SEPARATE mechanism — the reverted sprite pool
was `applyFrontierHalo()`/`_haloColorFor()`, fully gone; `applyHighlight()` is older, unrelated,
still shipping). It explicitly sets:
- `mat.depthTest = false` — comment at the call site literally says "shines through ground for
  underground elements" — this IS a "glows thru" mechanism by design, not a bug in the sense of
  being accidental, but may now read as unwanted/wrong given the user's report.
- Color: `fColor = ft < 0.15 ? 0x44ffff : 0xff8c00` (cyan for the first 15% of an element's install
  progress, then ORANGE `0xff8c00` — not literally red — for the remaining 85%), `emissiveIntensity
  = 0.4`, `opacity = 0.85`, `renderOrder = 10`.
- **Only applies to SINGLE-mesh objects** (`obj.userData.guid` path, ~line 749) — confirmed
  elsewhere in this file that Hospital/Terminal stream almost entirely as BatchedMesh/InstancedMesh
  (`sceneMeshGUIDs=0` all session), so this exact code barely engages for THOSE buildings. If the
  user is testing on a building with substantial single-mesh content, this would fire constantly;
  if still on Hospital/Terminal, this specific code path is NOT the explanation and the real cause
  is elsewhere (check the `INSTANCED_FRONTIER`/`BATCHED` §WB_MAT log lines' own color values instead
  — no `setColorAt`/`instanceColor` call was found anywhere in this file, meaning Instanced/Batched
  frontier elements currently get NO per-instance color tint at all from this file; if they're
  showing red up close anyway, the source is a DIFFERENT file/mechanism, not `applyHighlight()`).

**What NOT to assume:** don't assume `applyHighlight()` is guilty without a live repro + screenshot
confirming (a) which building/mesh-type the user is on, and (b) that orange-not-actually-red is
what's being perceived up close (tone-mapping/emissive-intensity/bloom could shift 0xff8c00 toward
red-looking at high exposure — check the ACTUAL rendered pixel color, don't assume from the hex
constant alone — this project's own Item 5 lesson: verify visual claims with a screenshot, not
object/property inspection).

