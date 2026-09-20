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

**Panel toggle — SINGLE entry, not one per sub-part (user directive, 2026-09-18: "on the user baking
panel, it should be a single box or icon showing a compass").** Checked the real convention:
`viewer/panels.js`'s toolbar/panel registry is a flat list of `{ id, name, icon, fn }` entries, one
per feature — `sanity`, `egress`, `clash`, `fly`, `night`, `shadow`, etc. (lines ~1319-1531). This
feature gets exactly ONE entry the same way — one `id` (e.g. `'compass'`), one icon, one `fn`
toggling the whole overlay bundle (ground compass + day-of-year label + sun-angle-of-attack readout)
together as a unit. Do not expose compass/day-of-year/sun-angle as three separate panel toggles —
they are one feature with three visual parts, matching how `sanity`/`egress` already bundle their
own multi-rule internals behind a single panel entry. **Icon note:** the icon set already has a
`draftingCompass.svg` (`I.draftingCompass`, currently used for the unrelated `'inspect'` entry,
panels.js ~line 1529) — that is a drafting compass (the drawing tool), not a magnetic/N-S-E-W
compass rose, and is very likely the wrong shape for this feature. Confirm before reusing; a new
icon is probably needed.

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
7. **T7 (separate PR, optional)** — Temperature via Open-Meteo (§9), untouched as recommended —
   still open.
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

## §11 — Two findings beyond this spec's original scope, worth keeping visible

- **Malformed source data, both extractors now refuse it:** four fleet files carry a
  non-conformant `IFCDIRECTION` for `TrueNorth` — `Clinic_Electrical #11050`, `Clinic_HVAC #76172`,
  `Ifc2x3_Duplex_Plumbing #40`, `LTU_AHouse_STR #66` — all write `(2.0, 6.12303176911189E-17, 1.0)`
  (3 components where 2 are expected, z=1.0, XY length 2; naively reading its first two ratios gives
  exactly -90°, a wrong and misleadingly clean-looking number). Both writers now detect and refuse
  this shape, recording `malformed_truenorth_ignored` rather than silently ingesting garbage.
- **§8's premise corrected by measurement, not assumption:** see T6 above — `rotation_z` is real
  data on only 1 of 5 fleet buildings tested. Don't trust this spec's original "no new extraction
  needed" claim for §8 without re-checking per building.

Full derivation/evidence for both, plus the corrected §2 sign formula, is in bim-ootb PR #1751 and
bim-compiler PR #117 (branches `feat/georef-sunpath-compass` / `feat/georef-sunpath`) — not
duplicated here to avoid two sessions maintaining the same paragraph.

## §12 — BLOCKED, needs red1's ruling, not either session's

**Hospital's 14 discipline source files disagree on the building's own site coordinates by up to
~500km:** ARC says `42.3584, -71.0598` (Boston area); STR+MEP say `42.2130, -71.0330` (~16km from
ARC, still Boston area); MECH says `43.1221, -77.6302` — Rochester, NY. Self-heal patches were
written for SampleHouse/SampleCastle/HHS/Clinic/Duplex; **deliberately none for Hospital** — nobody
picked a winner. This needs a human ruling: which file is authoritative (if any), or is this a
source-data defect that should keep Hospital's geo-ref at `'unknown'` until the discipline files are
reconciled at the source. Do not resolve this automatically (majority vote, "closest to the others")
without red1's explicit sign-off — three real, differently-wrong numbers, not a tie-break Claude
should call.

## §13 — OFFLINE PLACE, ELEVATION AND CLIMATE (red1, 2026-09-20). **SUPERSEDES §9's network answer.**
**SPEC ONLY. Nothing below is built.** red1: *"Spec'd for a offline city table to demonstrate its
usefulness. Can we also have the weather info such as temperature range, m above sea level?"*

§9 answered the temperature question with Open-Meteo — one HTTPS GET, and by its own admission
*"the only live network dependency anywhere in the movie-bake pipeline."* An offline table removes
that. Everything below is a local read, exactly like `§SUN_PATH ready — NOAA low-precision solar
position, offline, no network`. **§9 stays on the record as the rejected alternative; it is not
deleted, it is superseded.**

### §13.1 — THREE ANSWERS, THREE SOURCES, NEVER MERGED
| what | source | on Hospital today |
|---|---|---|
| place name | vendored city table, nearest match | **must refuse** — see §13.5 |
| m above sea level | THREE candidates that disagree | `ifc_site` says 165.81 m |
| temperature range | climate dataset, vendored | nothing yet — see §13.4 |

### §13.2 — THE CITY TABLE
**GeoNames `cities15000.txt`** (CC BY 4.0, ~25k settlements over 15,000 people). Ship a trimmed
projection of it — name, lat, lon, country, admin1, `dem`, timezone — sorted and gzipped, under
`rates/` beside `egress_rules.json`, which is this project's existing home for vendored reference
data that the film cites on screen. ⚠ The field list above must be checked against the downloaded
file's own readme at vendoring time, not taken from this spec.

**MATCHING IS NEAREST-WITH-A-BOUND, NEVER NEAREST.** Haversine to every row, take the minimum, and
apply `PLACE_MATCH_MAX_KM = 25`. Beyond that the answer is `NO MATCH` and the line prints the raw
coordinate instead. **The distance is printed every time, match or not** — a 24 km match and a 2 km
match are not the same claim, and a reader must be able to see which they were given. A silent snap
to the nearest city is how a rural site becomes a confident lie.

### §13.3 — ELEVATION: THERE ARE THREE NUMBERS AND THEY DISAGREE
1. `ifc_site` elevation — Hospital: **165.8112 m** (`§GEOREF_SITE`)
2. the matched city's `dem` — terrain height at that point
3. the bake's own datum — Hospital: `groundZ=165.36 bboxMinZ=156.61` (`§SUN_COMPASS`)

On Hospital, 1 and 3 agree at ~165 m while Boston sits near sea level. **That disagreement is the
finding, not noise:** it says the IFC "elevation" is a project datum, not height above sea level.
So the line prints all three and names which one it used. It must never average them or pick
quietly — the same discipline `§SUN_COMPASS` already applies when it prints `src=ifc_site`.

### §13.4 — TEMPERATURE: WHAT CAN BE SAID HONESTLY
There is **no free, compact, per-city normals table in this repo today** — I checked. So:

- **(a) Köppen-Geiger climate zone** (Beck et al. 2018, CC BY 4.0). One small file, deterministic,
  and it yields a *classification* — `Dfa`, "humid continental, hot summer" — not degrees. It cannot
  be wrong by a degree because it states no degrees.
- **(b) Monthly normals**, vendored as a generated subset covering only the cities the fleet actually
  uses, produced by a re-runnable script checked in **beside the data with its source named**.

⚠ **EVERY NUMBER MUST COME OUT OF THE VENDORED FILE.** No temperature may be written from anyone's
recollection of a city's climate — that is exactly the invention the Prime Directive forbids, and a
plausible-looking range is worse than no range because nothing on screen marks it as a guess.
If (b) is not vendored, the film shows (a), or it shows nothing.

**Recommendation: (a) first.** It is one small file and answers "what kind of place is this" without
claiming precision the model never had. (b) only if red1 wants actual degrees on the card.

### §13.5 — IT MUST REFUSE TO DRAW ON A CONTESTED COORDINATE
**§12 is the reason this is not a free feature.** Hospital's 14 discipline files disagree by up to
~500 km: ARC `42.3584,-71.0598` (Boston), STR+MEP `42.2130,-71.0330`, MECH `43.1221,-77.6302`
(Rochester NY). The bake currently uses ARC's. A sun angle off by that much is a subtle error; a
caption reading **"Boston"** is a source-data defect published as a fact.

So the place line is **gated on the georef being uncontested**, and prints `NO PLACE` with the reason
otherwise. §12 stays blocked on red1 and this spec does not resolve it.

**Demonstrate on `merged_federation` instead** — Penang, `5.96277289 / 100.63712571`, a real surveyed
site (§10 T1). That is where the feature shows its usefulness; Hospital is where it shows its
restraint.

### §13.6 — `§PLACE_WITNESS`
ISSUE IT PROVES OR DISPROVES: does the place line ever state something the vendored data does not
say? Claims:
- fixtures at known coordinates resolve to the expected name, and the reported distance is correct
- a coordinate 30 km from every row reports `NO MATCH` — the bound holds, no silent snap
- **no network**: the module's own bytes contain no `fetch`, `XMLHttpRequest`, `import(`, or
  `require('http`. The offline invariant is the whole point of choosing this over §9, so it is
  asserted, not assumed
- the three elevations are all reported and the used one is named; nothing is averaged
- Hospital resolves to `NO PLACE` with §12 as the stated reason — the restraint is tested, not hoped for
- every temperature shown traces to a row in the vendored file (assert the module holds no numeric
  climate literals of its own)

### §13.7 — TASKS, DEPENDENCY ORDER
1. **T1** vendor the city table + a `PROVENANCE` file naming source, licence, version, download date
2. **T2** the lookup module — pure, node + browser, no network, haversine + bound
3. **T3** `§PLACE_WITNESS` (T2 is not done until this fails on a deliberately broken fixture)
4. **T4** the HUD line, gated on an uncontested georef, printing distance and elevation source
5. **T5** optional — Köppen zone
6. **T6** optional, needs red1 — monthly normals, with its generating script

## STATUS — 2026-09-18: T1-T7 built + witnessed (T7/temperature untouched by design); T8 open; one item BLOCKED on red1

§1's finding (`true_north_angle` wired-but-inert since the extractor shipped) is fixed, witnessed,
and live on two open PRs — bim-compiler #117 (extraction) and bim-ootb #1751 (viewer: compass,
day-of-year, sun angle-of-attack). Five witnesses reported passing at close: `§GEOREF_WITNESS`,
`§SUN_PATH_WITNESS`, `§SUN_ORACLE`, `§SUN_COMPASS_WITNESS`, `§GEOREF_PATCH_WITNESS`. T8 (the
end-to-end numeric measurement this doc added per user request — formula-vs-independent-reference,
extraction-to-render agreement, internal cross-consistency) has real coverage via `§SUN_ORACLE` +
`§SUN_COMPASS_WITNESS` but was not run down item-by-item against T8's own checklist — worth a pass
before calling the feature fully closed. Neither PR is merged. §12's Hospital site-coordinate
conflict is the one open item that is not a coding task — it needs red1's decision.
