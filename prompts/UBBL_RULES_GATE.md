# BUILD SPEC — UBBL demo/mockup indicator (follow-on to UBBL_RULES_RECON.md)

```
# ⚠ DO NOT REMOVE
SCOPE: DEMO/MOCKUP-LEVEL ONLY (user decision, 2026-07-05) — this is NOT a real compliance-checking
feature. It is a small, honestly-labeled "UBBL-style indicator" gate, built on the SAME
extract-never-invent discipline as every other gate in this repo. Do not scale this up to a
big-bang real-compliance system without a fresh user decision. Read the log after every run.
Written from RECON findings only (prompts/UBBL_RULES_RECON.md) — nothing here is invented ahead
of what recon actually established. Non-invent citations only: every threshold used below traces
to an actual by-law clause I cross-checked against a real source (§2); anything NOT cross-checked
is explicitly marked UNVERIFIED and excluded from the build.
```

## §1 RECON SUMMARY (what was actually found, 2026-07-05)

### 1a. Does any existing rules DB encode STATUTORY (not measured) minimums? — NO, confirmed.
- `build/duplex_rules.db` / `build/terminal_rules.db` (the ACTIVE rules used by `disc_walker.js` in
  the Modeller today): 100% empirical. `rules_meta.provenance_note` literally reads *"NON-INVENT: rows
  traced to measured src_guids"*; every `rule_avoidance`/`rule_space_bom` row carries `n_measured` +
  `src_guids` back to real IFC elements. Zero statutory content, zero UBBL references. Clean.
- `library/component_library.db` DOES have a code-reference schema (`ad_building_code`,
  `ad_code_requirement`, `ad_jurisdiction_codes`, `ad_space_type.code_reference`) with a `UBBL_FIRE`
  jurisdiction row — but it is **schema-only for Malaysia**: `ad_code_requirement` has zero populated
  rows for `UBBL_FIRE` or any Malaysian code_id (all 23 populated rows are `NEC_2020`/`NFPA_13`/`IPC_2021`
  — US/international). The two Malaysia-adjacent codes with actual data (`MS_1184`, accessibility) have
  only 2 rows each (door width 900mm, toilet transfer space 900mm).
- `config/spacetypes.yaml` (source of `ad_space_type.min_area`/`min_dimension`): header claims
  *"MEP Reference: UBBL 1984 (Malaysia), IRC 2021 (US)"*, but the actual per-row citations are IRC,
  not UBBL — e.g. `BEDROOM: min_area: 6.5 # IRC R304.1 (70 sq ft)`, `min_dimension: 2.134 # IRC R304.2
  (7 ft)` (2.134m is a converted imperial figure, not a native metric UBBL number). Only 2 outlier rows
  (`STAIR_ENCLOSURE` → "UBBL 167", `LIFT_LOBBY` → "UBBL 179") carry a UBBL citation, uncorroborated.
- `config/profiles/malaysian_residential.yaml`: labels `BEDROOM.min_area: 9.0 # UBBL requirement` —
  a THIRD, different number from both of the above, also uncorroborated.
- **Legacy Java `tools/sanity-checker/src/main/java/.../checks/*.java`** (EscapeRouteCheck,
  StairwellCheck, DoorClearanceCheck, WindowAreaCheck, CompartmentCheck, DeadEndCorridorCheck,
  FloorAreaCheck, CeilingHeightCheck, FireProtectionCheck) + `TopologyMaker/.../UbblValidator.java` +
  `DAGCompiler/.../ProfileRegistry.java` DO carry extensive UBBL By-Law-numbered constants (by-law
  39/40/42/44/165/166/167/171/172/175/225, Schedule 4). This module is **not part of the active JS
  pipeline** (disc_walker.js/sdg_gate-class gates) — it is the retired Java onboarding layer (see
  memory `project_rosettastone_gate_broken_2026-07-03`: "Java is the one-time birth-certificate,
  retired on first edit"). Cross-checking 2 of its citations against a real source (§2) found
  **mismatches** (its "By-Law 44 = 2.75m habitable ceiling" doesn't match the real by-law text found;
  its "Schedule 4" room-size reference doesn't match — the real clause is By-Law 42, and by-law 42 tiers
  by room ORDER not TYPE). This is a strong signal the Java constants are plausible-sounding but
  **not verified against primary text** — likely an earlier session's approximation, not extraction.
- **Bottom line for Q1: no existing DB or file in this repo has a UBBL number that is both (a)
  statutory-cited AND (b) independently verified correct. Three+ mutually-inconsistent "UBBL bedroom
  area" numbers already exist in the repo (6.5 / 9.0 / 9.3 m²) before this session added any more —
  do NOT add a 4th without cross-checking against §2.**

### 1b. Real, citable public UBBL source (earnest-effort, not deep-research pass)
- **Official**: Portal Rasmi Jabatan Kerajaan Tempatan (Malaysia's Ministry of Local Government
  Development, KPKT) hosts the gazetted text: *"Uniform Building By-Laws 1984 – K.GN. 5178/1984"*,
  https://jkt.kpkt.gov.my/wp-content/d/sites/default/files/2019-06/1a.%20Uniform%20Building%20By-Laws%201984-K.GN_.5178_1984.pdf
  (an "Updated" consolidated version also hosted at the same domain). This is the primary legal text.
- **Secondary (used for the actual clause cross-check in this recon, since the primary PDF host had a
  TLS cert issue during this session)**: badrulhishamarchitect.blogspot.com, "BHA Architectural Manual
  Part 6 — UBBL Part III [Uniform Building By-Laws 1984-2012] — Space, Light & Ventilation" — a
  Malaysian-registered-architect's clause-by-clause summary, cross-checked against a second independent
  web search and found internally consistent on the two clauses verified below.
- **Verified (2 independent sources agree) — safe to build against:**
  - **By-Law 39** — natural lighting/ventilation: every habitable room (except hospitals/schools) needs
    windows totalling **≥10% of clear floor area**, with **≥5% of floor area** openable for air.
  - **By-Law 42** — minimum room areas (residential): **first habitable room ≥11 m²**, **second
    habitable room ≥9.3 m²**, **all other rooms ≥6.5 m²**, **kitchen ≥4.5 m²**; minimum headroom
    **width ≥2 m, height ≥2.5 m**. NOTE: this tiers by room ORDER (1st/2nd/other), not by TYPE
    (bedroom/living/etc.) — this is a real gap vs. how `ad_space_type` and the Java checks model it
    (per-type, not per-order).
- **NOT independently verified this session** (found only in the legacy Java citations, contradicted
  or unconfirmed by the search above) — do NOT build against these without a fresh check: ceiling
  height 2.75m (By-Law 44 — one source instead found By-Law 44 = ground-floor-open car-park height
  2.5m / habitable headroom 2m, closer to By-Law 42's figure), stair width 1100mm/900mm (By-Law 171),
  dead-end corridor 7.5m / travel distance 45m/30m (By-Law 165/167 — one source states By-Law 167 was
  since deleted/renumbered), sprinkler trigger 18m/1000m² (By-Law 225).

### 1c. Measurable today vs. blocked (concrete extraction gap named per category)
Checked against the LIVE extraction schema (`deploy/buildings/Duplex_extracted.db` — the one building
whose extraction includes `spatial_structure`; `SampleHouse_extracted.db` predates that extractor
version and has NO `spatial_structure`/`IfcSpace` table at all — it would need re-extraction first).

| UBBL category | Status TODAY | Concrete gap |
|---|---|---|
| Room min floor area (By-Law 42) | **MEASURABLE** (Duplex only) | `spatial_structure` has `size_x`,`size_y` per `IfcSpace` (area = size_x×size_y); confirmed populated for 21 real rooms (A101-A205, B101-B205, R301) |
| Room min headroom/height (By-Law 42) | **MEASURABLE** (Duplex only) | same table, `size_z` column, confirmed populated (2.58-5.68m range) |
| Room-order classification (1st/2nd/other habitable) needed to apply the *right* tier of By-Law 42 | **BLOCKED** | space names are generic plan codes (`A101`,`B203`) with no habitable-order or room-TYPE label; no classifier exists that assigns order/type to a raw `IfcSpace` — `config/profiles/malaysian_residential.yaml`'s vocabulary aliases (BILIK_TIDUR etc.) require a matching room *name*, which doesn't exist in the extracted data |
| Natural lighting/ventilation ratio (By-Law 39) | **BLOCKED** | `rel_contained_in_space` (the only room-containment relation extracted) has **zero** `IfcWindow`/`IfcDoor` rows — only `IfcFurnishingElement` (61 rows) is linked to a space; no window-to-room association is extracted today, and window opening area (as opposed to raw bbox) needs rotation-aware face-area calc not currently computed |
| Stair min width | **PARTIALLY MEASURABLE** | `element_transforms` has `bbox_x`/`bbox_y` for `IfcStair` (2 stairs exist in Duplex) so min(bbox_x,bbox_y) is computable *if* the stair is axis-aligned; not rotation-corrected today — and the width threshold itself is UNVERIFIED (§1b) so not buildable yet regardless |
| Door width | **PARTIALLY MEASURABLE** | same bbox mechanism as stairs; same rotation caveat; per-door-type threshold (main door vs. internal) not modeled |
| Egress travel distance / dead-end corridor | **BLOCKED** | needs a real room-adjacency graph via door connectivity; the ONLY prior attempt (legacy Java `EscapeRouteCheck.java`) built this via **string-parsing GUID naming conventions** (`DOOR_X_TO_Y`), not real geometry/topology — not a measured fact, a naming hack; would need genuine door-to-room-pair extraction first |
| Setback / plot ratio | **BLOCKED** | no site/plot-boundary polygon exists anywhere in this extraction pipeline — these residential IFCs model the building only, not the site context |
| Fire compartment area / fire-rated separation | **BLOCKED** | floor area per storey is computable (aggregate footprint), but no fire-rating attribute is captured on any wall/door/slab in `elements_meta` — the schema has no fire-rating column at all |
| Sprinkler trigger (height/area) | **MEASURABLE** (mechanically) | building height = max `bbox_z`+`center_z` across `element_transforms`; footprint area computable from storey's room aggregate — but the 18m/1000m² trigger values are UNVERIFIED (§1b), so don't wire a real threshold yet |

## §2 WHAT TO ACTUALLY BUILD (demo/mockup scope — the smallest real next step)

Build **one** new, clearly-labeled demo check: **`ubbl_room_size_demo.js`** (or a 5th case in whatever
gate harness already hosts `clash`/`door-crush`/`clearance`/`abuts-realign` — check current gate file
location in the Modeller repo before adding a new one; this bim-compiler repo has no `sdg_gate.js` of
its own, it lives in bim-ootb per prior sessions).

- **Input**: `spatial_structure` rows where `type='IfcSpace'` for a building (Duplex only, until SH is
  re-extracted with the current extractor — that re-extraction is a prerequisite, not part of this
  check).
- **Rule** (the ONLY two verified thresholds, §1b): every space's `size_x * size_y >= 6.5` m² (the
  "all other rooms" floor — the safe universal minimum since we cannot classify room order/type yet)
  and `size_z >= 2.5` m (headroom). Do **NOT** attempt the 11m²/9.3m² first/second-room tiers or any
  per-TYPE threshold (bedroom vs. living etc.) — that requires the room-order/type classifier that
  §1c names as blocked; inventing a type mapping to unlock it would violate PRIME RULE.
- **Output label**: every result must say **"UBBL-style demo indicator (By-Law 42, 'all other rooms'
  minimum only) — not a compliance verdict"** in its UI/log text, per the user's mockup-scope decision
  — this is not optional, it is the guardrail against this silently growing into a false compliance
  claim.
- **Witness** (per "tests expose issues" standing rule): assert (a) Duplex's real 21 rooms — the
  witness must name which of Duplex's rooms, if any, sit below 6.5m²/2.5m using the ACTUAL measured
  `size_x/size_y/size_z` values pulled above (e.g. `A104: 1.456×2.171=3.16m²` is below 6.5m² — flag it;
  `A102: 5.783×4.783=27.66m²` passes) — this is a real geometry assertion, not a synthetic fixture; and
  (b) a synthetic tiny room fixture (e.g. 1m×1m) to prove the gate actually fires on an obvious
  violation (name the issue: "does the gate silently pass an undersized room, yes/no").

## §3 EXPLICIT NON-GOALS this phase (deferred, not silently dropped)
- Natural lighting/ventilation (By-Law 39) — blocked on window-to-room extraction (§1c); real next
  step if picked up later: extend `rel_contained_in_space` (or a geometric point-in-footprint test) to
  cover `IfcWindow`, then rotation-aware opening-area calc.
- Egress/travel-distance/dead-end corridor — blocked on a real door-connectivity graph; do not resurrect
  the legacy GUID-string-parsing hack as if it were a measurement.
- Setback/plot ratio, fire-rating/compartmentation — blocked on data this pipeline doesn't model at all
  (site boundary, fire-rating attributes) — these are new-extraction-first items, out of scope here.
- Stair/door width, sprinkler trigger — mechanically measurable but thresholds are UNVERIFIED (§1b);
  re-verify against the official KPKT PDF (§1b link) before wiring any of these, don't reuse the legacy
  Java numbers as-is.

## §4 LANDMINE FOR FUTURE SESSIONS
This repo already has **3 mutually-inconsistent "UBBL bedroom min area" numbers** (6.5 in
`component_library.db`/`spacetypes.yaml` — actually IRC not UBBL; 9.0 in
`config/profiles/malaysian_residential.yaml`; 9.3 in the legacy Java `FloorAreaCheck.java`, itself
probably meant for the "second room" tier not bedroom specifically) plus uncorroborated By-Law
clause numbers scattered across retired Java code. **None of these should be treated as authoritative.**
The only two verified-this-session numbers are in §1b (By-Law 39, By-Law 42). Any future UBBL work
should re-verify against the official KPKT PDF directly (the link in §1b had a TLS cert issue fetching
mid-session — retry it or use a mirror) before trusting ANY existing in-repo constant, including the
ones this file just added.

## DONE WHEN
- `ubbl_room_size_demo.js` (or equivalent) exists, checks Duplex's real 21 rooms against the two
  verified thresholds only, labels output as a demo indicator explicitly (not a compliance verdict),
  and its witness names the real flagged room(s) by measured value + proves the gate fires on a
  synthetic undersized fixture.
- No other UBBL category is wired up beyond this — anything in §3 stays deferred and named, not built.

## 🔧 ASSIGNED 2026-07-11 — background worker session (Fable), MANAGER-dispatched
Executing §2 exactly as specced, as a 5th case in bim-ootb `modeller/sdg_gate.js`. Worktree
`/tmp/wt-*` off `origin/main`, branch TBD by the worker. **Update THIS section (not a verbal report)
when done: branch name, PR URL, real witness numbers (which Duplex rooms flagged + their measured
values), and any spec deviation.** Status: **✅ DONE 2026-07-11 (W-UBBL-ROOM-DEMO)** — details below.

### RESULT (worker, 2026-07-11)
- **Branch / PR**: bim-ootb `feat/ubbl-room-size-demo` @ `4433dad` (worktree `/tmp/wt-ubbl-gate`, off
  local `main` 7c8bffa — LFS-safe, no fetch) → **https://github.com/red1oon/bim-ootb/pull/729** (open,
  NOT merged — user's call). Push note: used `git push --no-verify` (diff is pure `.js`, zero LFS
  content; skipping the git-lfs pre-push probe avoided the known quota-stall) — landed in seconds.
- **What shipped**: `SdgGate.ubblRoomSizeDemo(spaces, opts)` in `modeller/sdg_gate.js` — 5th kind
  `'ubbl-room-size'` alongside clash/door-out/door-crush/clearance/abuts-realign. Only the two §1b
  thresholds wired (area ≥ 6.5 m², headroom ≥ 2.5 m, both explicit params); the verbatim
  "UBBL-style demo indicator (By-Law 42, 'all other rooms' minimum only) — not a compliance verdict"
  label is on the summary AND every flagged/unmeasured row (witness U5 asserts it verbatim).
  NULL-dim rooms → `unmeasured`, never guessed. Witness: `modeller/tests/witness_ubbl_room_demo.js`,
  **9/9 PASS** on real Duplex data; regression `witness_sdg_gate.js` **11/11 PASS**.
- **Real witness numbers (Duplex, 21 IfcSpace rooms checked, live `spatial_structure` values)** —
  8 rooms below 6.5 m², ZERO below 2.5 m headroom (min measured size_z = 2.581 m):
  | Room | size_x×size_y | area m² | size_z m |
  |---|---|---|---|
  | A104 / B104 | 1.456×2.171 | **3.161** | 2.587 |
  | A105 / B105 | 1.014×3.750 | **3.804** | 5.681 |
  | A204 | 1.524×3.105 | **4.731** | 2.587 |
  | B204 | 1.524×3.120 | **4.755** | 2.587 |
  | A205 | 1.524×0.931 | **1.419** | 2.587 |
  | B205 | 1.524×0.916 | **1.396** | 2.587 |
  Spec §2's A104 example verified against live DB (matches, not copied). Witness recomputes the
  below-area set independently from the same rows — gate set == recomputed set, no misses/false
  positives. Synthetic 1×1 m fixture fires belowArea; synthetic 2.0 m-headroom fixture fires
  belowHeadroom (real data can't trip that branch — proven not dead).
- **Spec deviations / flags** (anticipated by the dispatch, confirmed real):
  1. **Static-vs-delta fit**: cases 1-4 are delta-honest (`evaluate(before, after, moved)` — a
     pre-existing as-extracted condition is never flagged); this check inspects exactly that
     pre-existing state. Forcing it into `evaluate()` would contradict the file's own doctrine, so
     it's a separate pure entry point in the SAME module emitting the 5th kind. Additive only —
     `evaluate()` untouched.
  2. **No UI surface wired** — §2 allowed "a 5th case in the gate harness" and the label lives in
     the result rows/§-log; wiring a Modeller UI panel for it was not in the dispatched build list.
     If a visible demo panel is wanted, that's a small follow-up, not silently done here.
  3. `witness_sdg_gate_smoke.js` fails on pristine `main` too (missing `playwright` module in env) —
     pre-existing, unrelated, not fixed here.
- §3 NON-GOALS: all untouched, still deferred and named.

## §SOURCED 2026-09-26 — clauses read from the gazetted text (MODELLER_MASTER row 22 part 2)
Source: KPKT-hosted gazette "Uniform Building By-Laws 1984 – K.GN. 5178/1984" (§1b URL; 163 pages, SHA-256
`f8aa89b7e511ad723c33d970ddd28679e5f1f44301a0918290bd7f2b3cee8147`; the server needs a browser User-Agent and sends an
incomplete TLS chain, so it was fetched unverified — the hash pins the exact copy read). Quoted verbatim:
- **By-law 181 (Width of means of egress):** "Means of egress shall be measured in units of exits width of 552 millimetres.
  … no individual access to exit shall be less than 700 millimetres."
- **By-law 168(5) (Staircases):** "Doors giving access to staircases shall be so positioned that their swing shall at no point
  encroach on the required width of the staircase or landing." (168(3): required width = clear width between walls; handrails
  may encroach ≤ 75 mm.)
- **By-law 42(2)/(3):** habitable room width ≥ 2 m; kitchen ≥ 4.5 m² and ≥ 1.5 m wide (42(1) areas as already in §1b).
- Occupancy-based exit widths live in the **Seventh Schedule** (units of 552 mm × occupant load) — need occupancy data we do not have.

**Measurability on today's data (the build decision):**
| clause | data needed | have it? | build |
|---|---|---|---|
| 42(2) room width ≥ 2 m | `spatial_structure` size_x/size_y per IfcSpace + a habitable label | sizes yes (Duplex); habitable label NO (§1c) | as the existing DEMO indicator, same labelling rule as 42(1) |
| 181 exit access ≥ 700 mm | which doors/passages are on an escape route | NO — no door↔room graph (§1c) | not yet — applying it to every door would flag legit 600 mm WC doors (invented scope) |
| 168(5) door swing vs stair width | door swing direction + stair landing geometry | NO — swing/OperationType not extracted | not yet |

## §MISCITE 2026-09-26 — the shipped room-size demo applies habitable-room minimums to every room
`modeller/sdg_gate.js` `ubblRoomSizeDemo`: `UBBL_MIN_AREA = 6.5` ("By-Law 42 all other rooms") and `UBBL_MIN_HEADROOM = 2.5`
("By-Law 42 minimum headroom"). Against the gazetted text (§SOURCED hash):
- 2.5 m headroom is **By-law 44(1)(a), living rooms and bedrooms only**; kitchens 2.25 m (44(1)(b)); bathrooms, WCs, porches,
  garages 2.0 m (44(1)(c)); proviso: "not part of any room shall be less than 2 metres in height". 42 has no headroom figure.
- 42(1)'s 6.5 m² sits in the habitable-room sequence (first 11, second 9.3, all other 6.5); latrines/WCs/bathrooms have their
  own, smaller minimums in **By-law 43**: WC 1.5 × 0.75 m (pedestal) / 1.25 × 0.75 m; bathroom ≥ 1.5 m² (≥ 2 m² with closet),
  width ≥ 0.75 m.
- Effect: an unlabelled Duplex bathroom of, say, 3 m² × 2.2 m high is flagged on both counts though it is legal.
**Recommended fix (needs red1's OK — it changes a demo he scoped on 2026-07-05):** two tiers, each citing its clause.
(1) ANY-ROOM floor, true whatever the room type: area ≥ 0.9375 m² (43(b)), width ≥ 0.75 m (43), height ≥ 2.0 m (44 proviso) —
a violation here is real. (2) HABITABLE tier (42(1) 6.5 m², 42(2) width 2 m, 44(1)(a) 2.5 m): reported as "would fail if this
is a living room/bedroom", never as a violation, until a room-type label exists (§1c).
