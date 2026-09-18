<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# GEOREF SUNPATH COMPASS — real geo-reference + deterministic sun-path overlay for the movie bake

```
# ⚠ DO NOT REMOVE — SCOPE
This is a FOUND-NOT-BUILT spec, not approved code. User directive, 2026-09-18: "Geo-referencing
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
  `(x, y)` in the project's ground plane pointing at true north. Angle from model-grid-north =
  `atan2(TrueNorth.x, TrueNorth.y)` (NOT `atan2(y,x)` — that formula measures bearing from north,
  matching `sitecam.js`'s existing `(heading - trueNorthAngle)` convention, confirm sign against a
  real building with a known non-zero `TrueNorth` before trusting it blind).
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

1. **T1** — Fix `true_north_angle`'s writer (both Python + browser import paths, §3.1-3.2):
   real `TrueNorth` extraction, replacing the hardcoded `"0"`. Witness against a real building with
   a known non-zero `TrueNorth` if one exists in the fleet (check first — may need a synthetic test
   fixture if none does).
2. **T2** — Add `site_latitude`/`site_longitude`/`site_elevation_m`/`site_latlong_source`
   extraction (§3, §4), same two writers, plus the self-heal patch (§3.3) for already-shipped
   buildings.
3. **T3** — Port/vendor the sun-position formula (§5), witness it against a few known
   date/location/expected-azimuth-elevation triples (there are published reference values for this —
   verify against a real published test case, don't just trust the port compiles).
4. **T4** — Wire §6's date hookup to the 4D timeline — find the real owner function first (Ownership
   Table discipline), don't add a second date-reading path.
5. **T5** — Ground compass + day-of-year render in the movie bake (§7) — follow the existing
   cinema/Sanity-film overlay convention, confirm the exact hook point in `cinema_maxq.js`/
   `effects.js` before writing render code.
6. **T6** — Sun angle-of-attack (§8) — small, reuses existing facade-orientation data, no new
   extraction.
7. **T7 (separate PR, optional)** — Temperature via Open-Meteo (§9), only after T1-T6 are live and
   reviewed.

## STATUS — spec only, nothing built

§1's finding (`true_north_angle` wired-but-inert since the extractor shipped) is real and verified
directly against the extraction script and both live consumers — worth fixing on its own merits even
independent of the rest of this feature. Everything else here is new, additive, deterministic math
with no invented data (§9 excepted and deliberately isolated). No code written, no migration/patch
files created yet.
