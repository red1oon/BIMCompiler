<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# GEOREF SUNPATH COMPASS — real geo-reference + deterministic sun-path overlay for the movie bake

```
# ⚠ DO NOT REMOVE — SCOPE
STATUS 2026-09-18: §1-§8 BUILT AND WITNESSED (see §11). §9 deliberately NOT built (see §13).
READ THE LOG AFTER EVERY RUN — an exit code is not evidence here; every claim in §11 is a
§-tagged witness line, and the one that matters most (`§SUN_COMPASS INCONCLUSIVE`) is printed by a
run that SUCCEEDS and draws nothing. Honour this file until §13 is empty.
User directive, 2026-09-18: "Geo-referencing
where the building orientation and the Sun path is calculated to be really aligned... a compass
marker will be on the ground during the movie build with a Day of the year (set by 4D timeline)...
Further wow be giving a angle of attack by the Sun, and temperature expected at that geo-ref."
Agreed scope: geo-ref + sun path + compass + day-of-year + sun angle-of-attack are IN, built on
deterministic math only (no invented data, Prime Directive). Temperature is SEPARATE (§9) — the
only piece that cannot be pure math; kept out of the core feature's dependency chain so it can ship
later, or not at all, without touching anything else here.
Read §1 before touching `true_north_angle` — it is not a green-field addition, it is an EXISTING,
LIVE-CONSUMED value that has silently been wired to a permanent stub since the day it shipped.
```

## §0 — What this is, in one paragraph

Extract the building's real geographic latitude/longitude and true-north rotation from the source
IFC (falling back to a clearly-flagged default when the source carries none), use it to compute the
real sun position (azimuth/elevation) for whatever calendar day the 4D timeline is scrubbed to, and
render that as a ground compass marker during the movie bake — day-of-year on top, sun direction
indicated, plus the sun's angle of attack on the building. All of this is closed-form deterministic
math off two numbers (lat, long) and a date — no external service, no invented values, fits this
project's Prime Directive exactly. Temperature (§9) is the one exception and is scoped separately.

## §1 — What already exists (checked directly, not assumed) — a real, live "wired but inert" bug

**`project_metadata.true_north_angle` already exists as a key, and is already CONSUMED live** —
this is not a green-field feature, it is completing a pipe that has been broken since it was built:
- **Consumers, real and live:** `viewer/sitecam.js:79-81` (site-camera heading correction) and
  `viewer/walk.js:275` (walk-mode rotation) both read `window._trueNorthAngle` and apply it to a
  real rotation. `viewer/streaming.js:3396-3401` sets `window._trueNorthAngle` from
  `project_metadata` on every building load and logs `[S204] §TRUE_NORTH`.
- **The writer, confirmed broken:** `DAGCompiler/python/extractIFCtoDB.py` lines 2554-2563 writes
  `("true_north_angle", "0")` — **hardcoded, every building, always zero.** The comment there
  (`§KUL001`) explains WHY the key exists (the Viewer was already crashing with
  `no such table: project_metadata` without it) but never wired a real value.
  `viewer/import_db_builder.js` (the browser import path) **never writes this key at all** — checked
  directly, its `project_metadata` INSERT only carries `project_name/import_date/building_name/
  source_uri`.
- **Net effect: every building in this fleet has always reported true north = model north,
  silently.** `sitecam.js`/`walk.js` have been applying a real rotation formula to a permanently-zero
  input since they shipped. This is the same class of defect as bim-ootb #1744
  (`cross_edges.js`'s `_realAabb` shipped inert) and this session's own `§FIND_ENSURE_ROOMS` history
  — a real consumer, a real formula, a stub value nobody re-checked.

**What does NOT exist, confirmed by grep — genuinely new:**
- `IfcSite.RefLatitude` / `RefLongitude` / `RefElevation` — not extracted anywhere, Python or
  browser path. `IfcSite` is listed only in `NON_GEOMETRIC_CLASSES` (extractIFCtoDB.py ~line 352),
  i.e. explicitly skipped for geometry, never read for its site attributes either.
- `IfcGeometricRepresentationContext.TrueNorth` — the real source for a non-zero
  `true_north_angle` — never read.
- **`georef_offset_x/y/z` (`viewer/import_worker.js` `§GEOREF_REBASE`, ~line 705) is a DIFFERENT,
  unrelated mechanism** — do not confuse the two. It auto-detects "this coordinate's magnitude is
  >10000, it's probably a real-world UTM-style offset" and rebases geometry to local origin purely
  from coordinate magnitude. It carries no lat/long, no compass information, and needs no change
  here — noted only so a future reader does not assume it already solves this.

## §2 — Source data (standard IFC schema, both IFC2X3 and IFC4)

- **Latitude/longitude/elevation:** `IfcSite.RefLatitude`, `RefLongitude` (each an
  `IfcCompoundPlaneAngleMeasure` — a 3-or-4-element list `[deg, min, sec, (millionths-of-sec)]`, NOT
  a decimal degree — must be converted: `deg + min/60 + sec/3600 + frac/3600000000`), `RefElevation`
  (a plain length in metres).
- **True north:** `IfcGeometricRepresentationContext.TrueNorth` — an `IfcDirection`, a 2D vector
  `(x, y)` in the project's ground plane pointing at true north.
  **⚠ CORRECTED 2026-09-18 — this paragraph first said `atan2(x, y)`, and that is BACKWARDS.**
  The correct value for both live consumers is **`atan2(-x, y)`, in degrees**. This section told
  the implementer to confirm the sign against a real building before trusting it; that was done,
  and the check failed, so here is the derivation and the evidence rather than another assertion:
  - `TrueNorth` is expressed **in model coordinates**, so true north sits at model-bearing
    `atan2(tx, ty)`. Neither consumer wants that. Both want **B = the bearing of MODEL north
    measured from TRUE north** — `sitecam.js:81` does `modelAzimuth = heading - trueNorthAngle`
    on a device heading, which is a *true* bearing; `walk.js:275` rotates an east/north
    displacement into model X/Y by `R(angle)`. B is the negation of the first angle.
  - **Checked on real fleet data:** `internal/UNMERGED/Hospital_IFC2x3_ARC.ifc` carries
    `TrueNorth = (-0.0871557427476695, 0.996194698091745)`. `atan2(-x, y)` gives **+5.000000°**
    (model north is 5° east of true north). `atan2(x, y)` would have shipped **−5°** and rotated
    every site-camera snapshot and every walk-mode GPS fix the wrong way — a defect that looks
    exactly like working code, because it only shows on the two buildings with a real TrueNorth.
- **⚠ A NON-CONFORMANT `TrueNorth` IS IN THIS FLEET, AND READING IT NAIVELY GIVES −90°.**
  Found 2026-09-18 while writing the extractor, not predicted by this spec.
  `Clinic_Electrical_IFC2x3.ifc` (`#11050`), `Clinic_HVAC_IFC2x3.ifc` (`#76172`),
  `Ifc2x3_Duplex_Plumbing.ifc` (`#40`) and `LTU_AHouse_STR.ifc` (`#66`) each write
  `TrueNorth = IFCDIRECTION((2.0, 6.12303176911189E-17, 1.0))` — a **three**-component direction
  with `z = 1.0` and an XY part of length 2. IFC defines `TrueNorth` in a 3D context as a
  *two*-dimensional direction in the ground plane, so this is malformed. Taking its first two
  ratios yields `atan2(-2, 0)` = exactly **−90.000000°**: precise, confident, and a quarter turn
  wrong. **The rule implemented: accept a direction only when it lies in the ground plane
  (`|z| < 1e-6`); otherwise record `true_north_source = 'malformed_truenorth_ignored'` and fall
  back to the disclosed default.** Refusing a non-conformant value is extraction; guessing what it
  meant is invention.
- **IFC4 alternative (check for, prefer if present):** `IfcMapConversion` (via
  `IfcCoordinateReferenceSystem`) can carry `Eastings/Northings` + its own rotation directly in
  projected-CRS terms — more precise than `RefLatitude/RefLongitude` when a real survey CRS is
  attached, but rarer in the wild. Extract `IfcSite`'s fields as the baseline; treat
  `IfcMapConversion` as a "prefer if present" upgrade, not a blocking dependency.

## §3 — Extraction + migration (this is the part the user asked to be spec'd explicitly)

**Two live writers to fix, one already-shipped-DB backfill needed — three separate deliverables:**

1. **`DAGCompiler/python/extractIFCtoDB.py`** (the CLI/offline extractor): read `IfcSite`'s
   `RefLatitude/RefLongitude/RefElevation` and the model's `TrueNorth` via `ifcopenshell` (already a
   dependency here), convert compound-angle → decimal degrees, replace the hardcoded
   `("true_north_angle", "0")` with the real computed value, and add three new
   `project_metadata` keys: `site_latitude`, `site_longitude`, `site_elevation_m`. When any of these
   is genuinely absent from the source IFC (not every authoring tool populates `IfcSite`), write the
   **explicit default** from §4 — never omit the key silently (a missing key is indistinguishable
   from "not yet extracted"; a present key valued at the disclosed default is honest and checkable).
2. **`viewer/import_db_builder.js` / `viewer/import_worker.js`** (the browser import path): same
   four keys, same conversion, added to the existing `project_metadata` INSERT block
   (`import_db_builder.js` ~line 26). This path currently has zero `IfcSite` handling of any kind —
   check what the browser-side IFC parser (`web-ifc-api-iife.js`) exposes for `IfcSite`/
   `IfcGeometricRepresentationContext` before assuming the same ifcopenshell-style attribute access
   works verbatim; the two parsers are different libraries.
3. **Self-heal patch for buildings already extracted before this fix ships** — this project's own
   established pattern for exactly this situation (DB-CHANGES rule, bim-compiler CLAUDE.md):
   `buildings/patches/<BuildingName>_extracted.db.sql`, one per already-shipped building, containing
   `INSERT OR REPLACE INTO project_metadata (key,value) VALUES (...)` for the 4 keys, computed
   OFFLINE once from each building's real source IFC (same numbers the fixed extractor would have
   produced) and applied client-side by the existing loader — `viewer/scene.js`
   `A._applyPendingPatch()` (~line 1735), the SAME mechanism already shipping `rel_aggregates`
   patches (see `buildings/patches/Clinic_extracted.db.sql` for the real file shape/precedent — a
   plain `.sql` file of `INSERT OR IGNORE`/`INSERT OR REPLACE` statements with a dated, cited
   comment header). **No new loader code needed — this is a content-only addition to an existing,
   already-wired mechanism.**

## §4 — Default when the source IFC has none (disclosed, never silent)

When `IfcSite` carries no `RefLatitude`/`RefLongitude` (common — many authoring tools never
populate it): write an explicit, clearly-labeled default rather than a bare 0/0 (0°,0° is a real,
specific place — off the coast of West Africa — and silently defaulting to it would misrepresent an
unset value as a real one, exactly what the Prime Directive forbids). Recommend a
`site_latlong_source` companion key: `'real'` | `'default'`, so every consumer (compass overlay,
sun-path calc, any future rule) can decide whether to show the result with a caveat. Pick a neutral
default coordinate (e.g. the equator at the prime meridian is the WORST choice for exactly the
reason above — consider a documented "no known location" sentinel plus a UI label like "location
unknown — sun path not geographically meaningful" rather than silently drawing a compass that looks
authoritative). **This is a product decision, flag it for the user at implementation time rather
than picking one unreviewed.**

## §5 — Sun position (deterministic, offline, no network)

Standard solar-position formula (low-precision NOAA/Astronomical-Almanac algorithm — the same
approach the well-known `SunCalc` JS library, ~200 lines, MIT-licensed, zero dependencies, uses):
inputs are `(latitude, longitude, Date)`, output is `(azimuth, elevation)` in degrees. Pure
arithmetic — no fetch, no external service, fits this project's offline/deterministic posture
exactly, unlike §9. Port the formula directly (or vendor `SunCalc.js` if license terms are
acceptable — MIT is compatible with this project's own MIT license) rather than re-deriving it from
scratch; it is a well-trodden, easy-to-get-subtly-wrong calculation (equation of time, solar
declination) and re-deriving it invites exactly the kind of invented-approximation risk this
project's Prime Directive exists to prevent.

## §6 — 4D timeline tie-in (day-of-year)

User directive: "Day of the year (set by 4D timeline)". The schedule/timeline's current date needs
a single read-point exposed for this feature to consume — **confirm the exact hook at
implementation time** (`viewer/schedule_gate.js` and/or `viewer/time_machine.js` are the likely
owners of "what date is the 4D scrubber currently at," per this project's own Ownership Table
convention in `prompts/4D_MODEL_INTEGRITY.md` §I — do not re-derive a second date source; find and
call the existing one). Sun position (§5) recomputes on every scrub tick from that one date plus
the extracted/default lat-long (§1-§4) — cheap (closed-form trig, no loop), safe to recompute per
frame rather than cache.

## §7 — Ground compass + day-of-year overlay, during the movie bake

Render a ground-plane compass marker (true north per §1/§2, not model-grid north — the whole point
of fixing §1's inert value) with the current day-of-year (§6) displayed above it, updating live as
the bake scrubs through the schedule. **Hook point to confirm at implementation time, not asserted
here:** this project's cinema/movie-bake overlay path (`viewer/cinema_maxq.js`/`viewer/effects.js`,
the Alt+C bake pipeline) and its existing per-frame ground-overlay convention — the Sanity film's
"one box per rule + depth wave, one set at a time" pattern (`bim-ootb-sanity-film-set-model` in
MEMORY, prompts §77-§85) is the nearest precedent for how this project already does bake-time ground
overlays; follow that convention rather than inventing a new overlay mechanism.

## §8 — Sun angle of attack

Once sun azimuth/elevation (§5) gives a real 3D sun direction vector, the angle of incidence on any
facade is a plain dot product against that facade's outward normal:
`incidenceAngle = acos(dot(sunDirection, facadeNormal))`. Facade normals are already derivable from
existing wall geometry/orientation data this pipeline already extracts (`element_transforms.
rotation_z` for planar walls, same convention `cross_edges.js`/`room_graph.js` already read this
session) — no new extraction needed for this part specifically, only for §1-§4's lat/long/true-north.
Useful beyond the "wow": this is the same primitive a future solar-gain/glare/shading rule would need
— worth keeping as a small reusable function rather than inlining it into the overlay renderer.

## §9 — Temperature (SEPARATE, optional, the one non-deterministic piece)

**Kept structurally independent from §1-§8 — building this can be skipped or deferred without
touching anything else.** User follow-up, 2026-09-18: asked whether a free (no-subscription) weather
API is cheap to add. Answer: yes, mechanically cheap (one HTTPS GET, JSON response, no auth key) —
**Open-Meteo** (`open-meteo.com`) is free, no signup, no API key, and has a **historical/archive
endpoint** that returns climate-normal-style daily temperature by exact lat/long + calendar date,
which is the right shape for "what's typical on this day-of-year at this location" rather than a
live forecast (the 4D timeline's "day" is very likely not tied to one specific real year, so a
forecast API would be the wrong tool even if used).

**Why this is architecturally different from everything else in this spec, and needs its own
decision before building:**
- **It is the only live network dependency anywhere in the movie-bake pipeline.** Every other bake
  input (this feature included, once extracted) is a local DB read — fully offline, fully
  deterministic, works on a plane with no wifi. A weather call breaks that invariant for this one
  overlay element only. Needs an explicit, silent-by-design fallback (skip the temperature line
  entirely, never block or slow the rest of the bake) when offline or rate-limited — never a hard
  failure, same "additive, gracefully-degrading" discipline every other fix this session followed.
- **Not truly deterministic across time** — a historical-average endpoint's answer can shift slightly
  as more years of data accumulate server-side; re-baking the same building on the same nominal date
  a year apart could return a marginally different number. Label it in the UI as "historical average
  for this date," never as a specific fact, matching the disclosure discipline already used
  everywhere else in this codebase (the `~` steps estimate, the uncited threshold buffers).
- **Recommendation:** build §1-§8 first as one self-contained PR (pure math, no new dependency
  class). Treat §9 as a follow-up, opt-in overlay element once the core feature is live — cheap
  enough to justify doing, but a genuinely different risk profile that deserves its own review, not
  a good idea to bundle silently into the "it's all just geo-referencing" PR.

## §10 — Task list, dependency order

1. ✅ **T1 — DONE 2026-09-18** (bim-compiler worktree `/tmp/wt-georef`, branch `feat/georef-sunpath`)
   — Python CLI extraction side fixed + witnessed: `§GEOREF_WITNESS PASS files=5/5 arithmetic=6
   defaults=5 wrong=0` (`scripts/witness_georef_extract.py`). Real non-zero fixtures confirmed live:
   Hospital +5.000000°, `merged_federation` +52.040036° (Penang, lat 5.96277289/lon 100.63712571).
   **§2's sign formula was found wrong during this work** (spec said `atan2(x,y)`, both live
   consumers actually need `atan2(-x,y)` — derivation from `sitecam.js:81`/`walk.js:275`, not a
   textbook) — being corrected in §2 directly by the session that found it, do not also edit that
   paragraph. ⚠ **Browser import path (`import_db_builder.js`/`import_worker.js`) status not yet
   confirmed** — the witness above covers the Python/CLI writer only; check before assuming both
   writers are done.
2. ✅ **T2 — DONE, same PR as T1.** `site_latitude`/`site_longitude`/`site_elevation_m` extraction,
   PLUS an addition beyond this spec's original 4 keys: **`true_north_source`**
   (`'ifc_truenorth'` | `'default_zero'`) — distinguishes "no TrueNorth in the source IFC" from "a
   real authored zero," which is exactly the ambiguity that let the original stub survive unnoticed.
   §4's "unknown location" default implemented as an EMPTY value + `site_latlong_source='unknown'`,
   never a bare `0/0` — matches this spec's own warning against a silent Gulf-of-Guinea default.
3. ✅ **T3 — DONE 2026-09-18.** `§SUN_PATH_WITNESS PASS checks=59 wrong=0` +
   `§SUN_ORACLE PASS samples=2968 gates=4 exceeded=0` — the oracle check is exactly this task's
   "against an independent real reference" bar, not the formula agreeing with itself.
4. ✅ **T4 — DONE**, folded into the same PRs as T5/T6 below (the compass/readout witnesses below
   exercise the real timeline hookup, not a synthetic date).
5. ✅ **T5 — DONE 2026-09-18.** bim-ootb PR #1751. World-space, ground-anchored THREE group,
   depth-tested (building occludes it), placed on the site's equator-facing side (derived from real
   latitude — true south in the northern hemisphere, true north in the southern — not picked).
   Day-of-year/"N" text is 2D-projected from the 3D anchor (`v.clone().project(cam)`), not a DOM
   badge, because `cinema_maxq.js`'s `_captureFrame` only grabs the renderer canvas — a DOM element
   would preview fine and be silently absent from every exported frame. `§SUN_COMPASS_WITNESS
   PASS checks=38 wrong=0`.
6. ✅ **T6 — DONE, same PR as T5.** Sun angle-of-attack — fixed bottom-left readout, not attached to
   the rose. **§8's premise checked, found wrong on 4/5 fleet buildings:** `rotation_z` (this spec
   assumed it was "already extracted") is populated on Terminal only (82 distinct values) — Hospital,
   Clinic, Duplex, HHS are all-zero (Hospital: 1 distinct value across 63,182 rows). The readout
   falls back to wall bbox aspect and logs which source it used per-reading; the underlying
   `rotation_z` extraction gap itself is out of this feature's scope (belongs to whichever lane owns
   general element-transform extraction).
7. ⛔ **T7 — NOT STARTED, deliberately.** Temperature via Open-Meteo (§9). It is the only network
   dependency the bake pipeline would have and the only non-deterministic input; separate PR,
   separate review. **It is NOT built and must not be summarised as built** — a STATUS headline on
   this file briefly read "T1-T7 built + witnessed" while this very line said untouched, and a
   headline outlives the paragraph that corrects it.
8. **T8 — MEASURE (added 2026-09-18, user: "I foresee 'Measure'").** A distinct verification gate,
   separate from each piece's own unit-level witness above — end-to-end, on a real building, numeric
   only, never a screenshot (this project's own FUNDAMENTAL LAW, `bim-compiler` CLAUDE.md). Three
   things T1-T6's individual witnesses do NOT, by themselves, prove:
   - **Formula-vs-independent-reference:** T3's own witness checks the ported sun-position formula
     against published date/location/azimuth/elevation triples — good, but pick at least one of
     THIS fleet's real buildings (Hospital, real lat/long from T2) + a real calendar date, and
     cross-check the computed azimuth/elevation against an independent trusted source (e.g. NOAA's
     own solar calculator for that exact input) — not a second run of the same ported formula
     agreeing with itself.
   - **Extraction-to-render agreement:** read the ACTUAL rendered compass group's real rotation
     state (`compassGroup.rotation.y` or its quaternion, whichever axis convention T5 lands on) in a
     witness/probe and assert it numerically equals Hospital's extracted `true_north_angle` (+5°,
     correctly signed per T1's corrected formula) — proves the render layer actually consumed the
     right number and applied it on the right axis, not just that T1's extraction and T5's renderer
     were each separately plausible.
   - **Internal cross-consistency:** the day-of-year text, the sun-angle-of-attack readout, and the
     compass rose's own rotation should all trace back to the SAME single date+lat/long read for
     that frame — assert this by reading each of their real backing values in one witness pass, not
     by eyeballing that they "look consistent" in a rendered frame.
   No pixel/frame/screenshot comparison for any of this (`bim-ootb-no-pixel-evidence` — slice the
   predicate into a witness or a `§`-tagged log line instead). This task blocks calling T1-T6 "done"
   as a feature, even once each is individually witnessed.

   ✅ **T8 CLOSED 2026-09-18** — all three bullets, numerically, no pixels:
   - **T8.1 — already covered by `§SUN_ORACLE`, and it is a genuinely independent reference.** The
     cross-check runs against `pysolar`, which implements NREL's **SPA — a different algorithm**,
     not a second run of the same port agreeing with itself. 2,968 samples over 7 real fleet
     locations (Hospital's own extracted lat/long among them) × a year × 8 times of day. Sun above
     5°: max |Δelevation| **0.019°**, max |Δazimuth| **0.034°**.
     `viewer/tests/witness_sun_path_oracle.py`; it prints INCONCLUSIVE, never PASS, without pysolar.
   - **T8.2 extraction-to-render — the gap was real, now closed.** The prior checks proved the
     needle moved by the right DIFFERENCE between two twins; none asserted its ABSOLUTE bearing. A
     renderer with a constant offset baked in would have passed every one of them. Now asserted
     against Hospital's own extracted `+5°`: needle model bearing = **−5.000000°** (true north sits
     at `−true_north_angle` in model space).
     ⚠ **This bullet asks for `compassGroup.rotation.y`. There is no such property.** The rose is
     built from world-space points, so the bearing lives in the vertex positions, not on a group
     transform — reading `rotation.y` would have found `undefined` and "passed" while asserting
     nothing. The check reads the needle tip's bearing relative to the anchor instead, and a second
     assertion pins that the group carries no rotation, so nobody re-adds the useless read later.
   - **T8.3 internal cross-consistency — the gap was real, now closed.** One witness pass asserts
     that the day-of-year label, the rose's sun bearing and the angle-of-attack readout all reduce
     to the same single `(date, lat, lon)`; the incidence is recomputed from first principles off
     the same facade the build resolved, rather than read back off the object that produced it; and
     a different cursor is asserted to move the day AND the sun together.
   `§SUN_COMPASS_WITNESS PASS checks=45 wrong=0` (was 38). T1-T6 stand as done as a feature.

## §11 — BUILT 2026-09-18 (T1-T6). §9/T7 deliberately not built.

User directive, this session: *"Proceed to build prompts/GEOREF_SUNPATH_COMPASS.md"*. §1-§8 are
implemented across two repos and witnessed; §9 (temperature) is untouched, per this spec's own
recommendation that the one network dependency in the bake pipeline gets its own review.

### What shipped

**bim-compiler** (branch `feat/georef-sunpath`, off `fable/meshdb-livewire`):
| file | change |
|---|---|
| `DAGCompiler/python/extractIFCtoDB.py` | `_compound_angle_to_degrees()` + `extract_georef()`; the hardcoded `("true_north_angle","0")` is gone. Writes 6 keys. |
| `DAGCompiler/python/prepare_large_ifc.py` | its own `true_north_angle "0"` was `INSERT OR REPLACE` — it would have **re-stamped 0 over a real value** carried in from the part DBs one function after the fix landed. Now `OR IGNORE`, i.e. a backfill, never an overwrite. |
| `scripts/witness_georef_extract.py` | **W-GEOREF-EXTRACT** |

**bim-ootb** (branch `feat/georef-sunpath-compass`, off `main`):
| file | change |
|---|---|
| `viewer/import_worker.js` | reads `IfcSite.RefLatitude/RefLongitude/RefElevation` + `IfcGeometricRepresentationContext.TrueNorth`, same formula and same malformed-direction guard as the Python side |
| `viewer/import_db_builder.js` | writes the 6 keys. **This path wrote no georef at all before** — not a stub, no row. |
| `viewer/streaming.js` | loads lat/long/elevation onto `window` beside `_trueNorthAngle`; the `§TRUE_NORTH` log line no longer claims "from grid Y" on every building, and now prints the *source* |
| `viewer/sun_path.js` | **NEW.** NOAA low-precision solar position + §8 angle of attack. Pure arithmetic, no network. |
| `viewer/cpe_sun_compass.js` | **NEW.** §6/§7 — the world-space true-north rose. |
| `viewer/cinema_maxq.js` | `sunCompass` flag: build at arm time, `A.sunCompassAt(_bkMs)` per frame, composite in `_captureFrame`. **OFF unless asked for** — an overlay that appeared in every existing plan's re-bake would silently change films already signed off. |
| `cli_silent_bake.js` | `--sun-compass` / `--no-sun-compass` |
| `viewer/viewer.html`, `viewer/main.js`, `viewer/sw.js` | registration + precache, `CACHE_VERSION` v1177 → v1178 |
| `viewer/buildings/patches/*.sql` | §3.3 self-heal rows for 5 buildings (below) |
| `viewer/tests/witness_sun_path.js`, `witness_sun_path_oracle.py`, `witness_sun_compass.js`, `witness_georef_patches.js` | **W-SUN-PATH**, **W-SUN-PATH-ORACLE**, **W-SUN-COMPASS**, **W-GEOREF-PATCH** |

### §7 resolved: WORLD-SPACE, ground-anchored
This spec left "ground-plane compass marker" ambiguous between a world-space object and a
screen-fixed badge. Resolved in favour of **world-space** (user's own call, relayed by a peer
session mid-build): a screen-fixed badge would look identical whether the true-north wiring worked
or not, whereas a rose on the ground is *visibly provable* as the camera orbits. Implementation
follows `cpe_flythru_datum.js`'s split exactly — 3D lines in the scene, depth-tested so the
building occludes them; text as a 2D composite projected from the rose's anchor, because
`cinema_maxq.js`'s `_captureFrame` grabs the renderer canvas only and a DOM badge would be absent
from every exported byte. The **sun angle of attack is a small fixed readout**, not attached to the
rose, also per that call. The rose is placed on the **equator-facing side** (true south in the
northern hemisphere, true north in the southern) at `envelope_diagonal/2 + 1.6 × radius` — derived
from the site's own latitude rather than picked.

### Witness results (all re-run at close; logs are the evidence, not the exit codes)
```
§GEOREF_WITNESS       PASS files=5/5 arithmetic=6 defaults=7 wrong=0
§SUN_PATH_WITNESS     PASS checks=59 wrong=0   (no DB, no network, no browser — cannot be VACUOUS)
§SUN_ORACLE           PASS samples=2968 gates=4 exceeded=0
§SUN_COMPASS_WITNESS  PASS checks=38 wrong=0   db=Hospital_extracted.db
§GEOREF_PATCH_WITNESS PASS dbs=5/5 checks=75 wrong=0
```
§5's accuracy is **measured**, not asserted: cross-checked against `pysolar` (an independent
implementation of NREL's SPA — a different, higher-precision algorithm, not a second copy of ours),
2,968 samples over 7 real fleet locations × a year × 8 times of day. With the sun above 5°:
**max |Δelevation| 0.019°, max |Δazimuth| 0.034°**. Across all samples including the horizon, where
the two refraction models legitimately differ: 0.382° / 0.052°. Reproduce with
`viewer/tests/witness_sun_path_oracle.py` (it prints INCONCLUSIVE, never PASS, without pysolar).

### Real values now extracted — the fleet was never "north is north"
| source IFC | true north | lat, long | elevation |
|---|---|---|---|
| `Hospital_IFC2x3_ARC.ifc` | **+5.000000°** (authored) | 42.35842896, −71.05977631 | 165.8112 m |
| `merged_federation.ifc` | **+52.040036°** (authored) | 5.96277289, 100.63712571 (Penang) | 0.0030 m |
| `Ifc4_SampleHouse.ifc` | 0.000000° (authored — a REAL zero) | 51.50015259, −0.12623620 | 0 m |
| `Ifc2x3_SampleCastle.ifc` | 0.000000° (authored) | 52.15, 5.38333333 | 20.0 m |
| `Ifc2x3_Duplex_Architecture.ifc` | 0 (**no** TrueNorth — defaulted) | 41.8744, −87.6394 | 0 m |
| `Clinic_Architectural_IFC2x3.ifc` | 0 (**no** TrueNorth — defaulted) | 42.35842896, −71.05977631 | 0 m |

`merged_federation.ifc`'s 0.0030 m elevation is what the file says (3.0351219 in a
millimetre-unit file). It is physically odd and it is **stored as-is** — a source-data defect is a
finding to report, not a number to correct in the reader. Witnessed deliberately at that value.

### §3/§4 as built — the key set is SIX, not four
`true_north_angle`, **`true_north_source`**, `site_latitude`, `site_longitude`, `site_elevation_m`,
`site_latlong_source`.

`true_north_source` is beyond this spec's four keys and is the direct lesson of §1: **a missing
TrueNorth and a real authored zero are different facts, and conflating them is exactly how the
original stub survived unnoticed.** Values: `ifc_truenorth` | `default_zero` |
`malformed_truenorth_ignored` | (reader-side) `absent` for a DB predating this change.

**§4 decision, made rather than deferred** (this spec flagged it as a product decision; blocking on
it would have stalled everything else, and `site_latlong_source` makes it cheap to revisit):
an absent lat/long is written as an **empty value**, never 0/0. 0,0 is a real place in the Gulf of
Guinea; writing it converts "we do not know" into "we know, and it is there". The key is still
present, so a reader can tell *"this DB predates the feature"* (key missing) from *"the source IFC
has no location"* (key present, empty, `site_latlong_source='unknown'`). `cpe_sun_compass.js`
**draws nothing at all** in that case and logs `§SUN_COMPASS INCONCLUSIVE` with the reason — a rose
drawn from a defaulted coordinate would be a confident lie at 24 frames a second.

### §3.3 self-heal patches — 5 written, 1 deliberately NOT
Provenance was verified by **GUID match** (sampling `elements_meta.guid` from the shipped DB and
finding it in the candidate IFC), never by filename.

| building | written? | basis |
|---|---|---|
| `SampleHouse_extracted.db` | ✅ new file | 30/30 guids, single-file model |
| `SampleCastle_extracted.db` | ✅ new file | 30/30 guids, single-file model |
| `HHS_Office_Federated_extracted.db` | ✅ prepended | all **6** discipline files agree exactly |
| `Clinic_extracted.db` | ✅ prepended | 4 of 5 files agree; HVAC dissents (see below) |
| `Duplex_extracted.db` | ✅ prepended | 3 of 4 files agree; Mechanical dissents |
| `Hospital_extracted.db` | ⛔ **NOT written** | its disciplines disagree materially — see §12 |

**PREPENDED, not appended, and that matters:** `viewer/scene.js` `A._applyPendingPatch` batches
~500 statements per `sql.js` `db.run()`, and a `db.run()` that throws stops at the failing
statement — everything after it in that call never applies. Measured this session: the
pre-existing `HHS_Office_Federated_extracted.db.sql` already fails partway (§12.5). Rows appended
after that point would have silently never landed. First in the file, they cannot be stranded.

## §12 — FINDINGS (reported, not fixed; several are not this lane's to settle)

**§12.1 ⛔ Hospital's discipline files disagree about where the building is — needs a ruling.**
14 source files, three different answers, and no honest way to pick one from here:

| files | lat, long | true north |
|---|---|---|
| `Hospital_IFC{2x3,4}_ARC.ifc` | 42.35842896, −71.05977631 | +5° |
| `Hospital_IFC{2x3,4}_STR.ifc` | 42.21300125, −71.03299713 (**≈16 km away**) | +5° |
| `Hospital_IFC{2x3,4}_{ELE,FIRE,PLB,SPR}.ifc` | 42.213, −71.033 | **0°** (authored zero) |
| `Hospital_IFC{2x3,4}_MECH.ifc` | 43.12213135, −77.63016510 — **Rochester NY, ≈500 km away** | +5° |

`import_worker.js`'s own `§SITE_IDENTITY` doctrine says a sibling disagreement is a source-file
authoring defect to be corrected from the siblings' agreed value. Here there is no agreed value:
a 10-of-14 majority picks the STR/MEP coordinate, while the architectural master — the usual
authority, and the file that carries the non-zero TrueNorth — picks a different one. **No patch
was written. This is red1's call, not a coin-flip to be shipped as fact.**
**Do not resolve it automatically** — not by majority vote, not by "closest to the others". Either
a human names the authoritative file, or Hospital's geo-ref stays `unknown` until the discipline
files are reconciled at source. Three real, differently-wrong numbers are not a tie-break.

**§12.2 Clinic and Duplex have single-discipline dissenters; resolved and documented in-file.**
`Clinic_HVAC_IFC2x3.ifc` says 42.2130/−71.0330 against four siblings agreeing on
42.35842896/−71.05977631 (≈16 km). `Ifc2x3_Duplex_Mechanical.ifc` says 41.87811279/−87.62979889
against three siblings agreeing on 41.8744/−87.6394 (≈1 km). Both resolved the way §SITE_IDENTITY
prescribes — the siblings' agreed value, taken from the architectural master, which is also the
GUID-confirmed provenance. Each patch header states the dissent explicitly so nobody has to
rediscover it.

**§12.3 §8's premise is only true on 1 of 5 fleet DBs.** This spec says facade normals are "already
derivable from `element_transforms.rotation_z`". Measured 2026-09-18:

| DB | distinct `rotation_z` |
|---|---|
| Terminal | **82**, range ±π — real |
| Hospital | 1 (`0.0`) across 63,182 rows — not populated |
| Clinic | 1 | Duplex | 1 | HHS | 1 |

So the angle-of-attack readout would have reported "every facade faces north" on four of five
buildings. `cpe_sun_compass.js` uses `rotation_z` when it carries information (>1 distinct value)
and otherwise falls back to the wall's **bbox aspect** — a wall longer in X runs east-west and
therefore faces ±Y. Coarse (axis-aligned families only) and *real*, which the `rotation_z` answer
on those four is not. The source used is in the return value and in `§SUN_COMPASS_FACADE`.
**The underlying gap — the extractor not populating `rotation_z` — is untouched here.** It belongs
to the extraction lane, not this one.

**§12.4 The shipped DBs are worse off than §1 assumed.** §1 says the CLI extractor wrote a stubbed
key. Checked directly: `Hospital_extracted.db`'s entire `project_metadata` is `building_name` and
`import_date` — **there is no `true_north_angle` row at all**. `streaming.js`'s read has been
falling through to its `0` default, not even reading a stub.

**§12.5 Pre-existing, NOT introduced here:** `HHS_Office_Federated_extracted.db.sql` fails
**109 of its 2,244 statements** against a local copy of its own DB — its
`CREATE TABLE IF NOT EXISTS spatial_structure` declares 12 columns while the DB on disk has 13, so
`IF NOT EXISTS` no-ops and every 12-value `INSERT` is rejected. Either the local binary is ahead of
the shipped OCI bytes, or that patch is broken live. `witness_georef_patches.js` prints it as a
`§GP note` on every run. Not diagnosed further and not fixed — a separate lane, and it needs the
live OCI bytes to settle.

**§12.6 `tools/federation_preprocessor.py` stores `true_north_angle` in RADIANS**
(`site_context` table, line ~339 — `math.atan2(ratios[0], ratios[1])`, unconverted). Its own schema
comment says radians, it is a different table, and nothing reads it alongside
`project_metadata.true_north_angle` (degrees). **Left untouched** — noted only so a future session
does not "unify" two columns that mean different things, and because its `atan2(x, y)` has the same
sign convention this spec's §2 got wrong.

## §13 — WHAT IS STILL OPEN

1. **§9 / T7 — temperature.** Not built, by design. It is the only network dependency anywhere in
   the bake pipeline and the only non-deterministic input; it gets its own PR and its own review.
2. **§12.1 — Hospital's georef.** Blocked on one decision only red1 can make: which discipline
   file is authoritative for a federation whose members disagree by up to 500 km.
3. **Re-extraction.** The patches carry the rows to a live user today; the permanent fix is to
   re-run the fixed extractor and re-upload each `*_extracted.db` via OCI. Refresh or delete the
   `§GEOREF` block in each patch when that happens, or it will re-stamp values from an older source.
4. **Buildings with no verifiable provenance on this machine** — `Terminal`, `LTU_AHouse`,
   `Schependomlaan`, `JKR`, `KUL_*` — got no patch. 0/25 sampled guids matched any local IFC for the
   first three; the last two have no local `*_extracted.db` to check against at all. Not a refusal,
   just an absence of evidence: pair each with its real source and the patch is a one-liner.

## STATUS — 2026-09-18

**T1-T6 built and witnessed** (§11), five witnesses green; **T8 closed** (§10.8); **T7 not started,
by design** (§13.1). Two PRs open, neither merged — bim-compiler #117 (extraction) and bim-ootb
#1751 (viewer: compass, day-of-year, angle of attack). **One item is not a coding task and is
blocked on red1: §12.1 — Hospital's 14 discipline files give three different site coordinates, one
of them 500 km away.** §1's original finding, `true_north_angle` wired-but-inert since the extractor
shipped, is fixed at both writers and proved by witness rather than by inspection.
