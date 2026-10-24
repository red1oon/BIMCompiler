<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# BUILDING PARTS TAXONOMY — top-down checklist / bottom-up lookup, same table (2026-07-11)

```
# ⚠ DO NOT REMOVE
SCOPE: implements prompts/MANAGER.md §🚩 THE FLAG ON THE HILL — "a true plan.. stairways, air
wells.. ventilation etc.. so the Find panel and equally the Modeller Outliner is complete." User's
own framing of the mechanism (2026-07-11): "each part of a building must have a taxonomy... a
taxonomy checklist config template that ticks off each part of a qualified building/construction,
sort of top down" — then, clarifying: "or bottom up, as we go thru each part looking up in the
checklist." Both are the SAME config, walked in different directions — not two mechanisms.
NON-INVENT: every part below is either real measured entity data (cited building + count) or an
explicit `none_found` refusal — see the recon report this spec is built from, folded in below.
READ FIRST, before touching anything here: `prompts/ROOM_INTELLIGENCE_SCOREBOARD.md` row 15 (this
lane's current scored state) + this file's own "DONE 2026-07-11" sections below (Find panel +
Modeller Outliner both landed, verified, merged to bim-ootb `main` locally). This work is CLOSED,
user's own verdict "good enough" — do not re-open, re-measure, or re-verify without a new, named
reason. The two live gaps are elsewhere, already spec'd: `prompts/MODELLER_RENDER_MATERIAL_PARITY.md`
(Modeller glass/material) and `prompts/archive/VIEWER_FIND_PANEL_PARTS_VERIFICATION_archived_2026-10-24.md` (Viewer live-shot
evidence gap) — go there, don't restart this file's own work.
```

## The existing prior art this generalizes (reused, not duplicated)
`config/profiles/malaysian_residential.yaml`'s `required_spaces` + `build/check_required_spaces.js`
is already this exact shape — one profile (parent), N typed children, each with a `min_count`
(CLAUDE.md BOM PRINCIPLE), itself ported from `DAGCompiler/.../ProtocolValidatorRegistry.java`
`BaseProtocolValidator.validate()` (count-vs-minCount-shortfall). That mechanism only covers
HABITABLE ROOM TYPES (via `build/room_type_classifier.js`'s Gaussian templates). This spec widens
the SAME shape to every kind of building part — circulation (stairs), vertical transport (lifts),
MEP (plant/ventilation) — sourced from whichever signal is real for that part (room-type
classifier for habitable rooms, direct IFC-entity query for stairs/lifts, MEP-keyword density for
plant), not a single classifier.

**Building-class axis reused, not invented:** `docs/internal/WalkerDoctrine.md` §1 (LOCKED) —
`residential` (SampleHouse, Duplex, SampleCastle) vs `complex` (Terminal, Clinic, Hospital,
large/complex). HHS is `complex` by the same office-scale logic already established in
`ROOM_INTELLIGENCE_SCOREBOARD.md`. Garage is left unclassed (n=1, weakest row, not enough signal
either way per the scoreboard's own caveat) — the taxonomy checklist simply has no class-specific
row for it yet; it still gets checked against whichever parts are class-agnostic (none currently).

## Recon findings this is built from (background survey, 2026-07-11, full report in the session
## that authored this file — summarized here so this doc is self-contained)
Reused query pattern: same `spatial_structure`/`elements_meta`/`element_transforms` tables and the
SAME 8 `*_ARC.db` files (`/tmp/wt-fable-livewire/modeller/{Building}_ARC.db`) every other witness
in this lane already uses.

| Part | Evidence | Real anchor(s) | Class |
|---|---|---|---|
| STAIRWAY | measured | Duplex 4 (2×`IfcStair`+2×`IfcStairFlight`); SampleCastle 9×`IfcStair`; Clinic 9 (3+6); **Hospital 60×`IfcStair`** (strongest); Terminal 33 (32×`IfcStairFlight`+1×`IfcRampFlight`) | both (residential: Duplex+SampleCastle; complex: Hospital/Clinic/Terminal) |
| LIFT_SHAFT | measured | SampleCastle 67 elements (`liftdeur`/`liftputvloer`/`lifttop`/`liftwand`); HHS 3×`"Aufzug 2-flg"`; Clinic 1×`"M_Elevator-Hydraulic"`; Terminal 5×`ElevatorLift_Door` | both (residential: SampleCastle; complex: HHS/Clinic/Terminal) |
| PLANT_ROOM | measured, single-building | Terminal only: 74 MEP-keyword elements (vent/duct/fan/AHU/damper/chiller/fancoil/pump), concentration 10/74 in one room (`"≈ Aras Tanah R11"`) | complex only, n=1 building — report as such, do not generalize |
| STORAGE | **none_found** | zero textual hits (`storage`/`store`/`pantry`/`janitor`/`closet`) in any of the 8 buildings | neither — explicit refusal |
| AIR_LIGHT_WELL | **none_found** | geometric multi-storey-cluster proxy exists (SampleCastle/HHS/Hospital/Terminal) but is ambiguous — indistinguishable from stair/lift/duct-riser stacks with no text corroboration | neither — explicit refusal |

Garage: 1 textual "Stair" hit was a STR footing element (`"SE Stair Footing"`), not a real
`IfcStair`/`IfcRamp` entity — correctly excluded, not a false negative.

**Numbers corrected 2026-07-11, same session, before first commit:** the table above was first
transcribed from a background recon agent's exploratory tally (STAIRWAY 4/9/9/60/32→33 mostly
matched, but Terminal PLANT_ROOM was reported as 117/room "Aras 01 R3" 22/117). Building
`build/building_parts_taxonomy.js`'s witness against the SAME real `*_ARC.db` files reproduced
STAIRWAY/LIFT_SHAFT exactly but NOT PLANT_ROOM (74, room "Aras Tanah R11", 10/74) — the recon
agent's ad-hoc query and this module's committed, reproducible one evidently scoped the keyword
match slightly differently and neither transcript survived to audit which. Per this project's own
"a checker's own ground truth must be verified before trusting it over the code" discipline: the
number every future session can re-run and get again (74/"Aras Tanah R11"/10) is treated as
authoritative here, not the one-off recon prose. See §PARENT-NO-TRANSFORM below for the OTHER real
discrepancy this same verification pass found (STAIRWAY undercounts when a positioned-only join is
used) — a genuine data-shape finding, not a citation typo.

## §PARENT-NO-TRANSFORM — a real finding from building this module's own witness
An assembly parent (`IfcStair`) frequently carries NO transform of its own in `element_transforms`
— only its child geometry (`IfcStairFlight`) does. Confirmed on real data: Duplex has 2×`IfcStair`+
2×`IfcStairFlight` in `elements_meta` (4 real entities) but only the 2 `IfcStairFlight` rows join to
a transform; Hospital has 60 distinct `IfcStair` guids but only 30 carry a transform (verified
distinct, not a duplicate-row artifact). `build/building_parts_taxonomy.js`'s `extractParts()`
reports BOTH counts per part — `.all` (every real `elements_meta` entity, the correct "does this
building have one" existence signal) and `.positioned` (the subset with a real transform, the
correct "where do I draw a marker" subset) — collapsing to one number would silently hide which use
case it actually serves. The checklist's found-count uses `.all` (existence); a future Find-panel/
Outliner marker feature should use `.positioned` and expect it to sometimes be smaller.

## Extraction sources (bottom-up lookup — same constants already used elsewhere, not re-derived)
- **STAIRWAY**: `STAIR_LIKE = ["IfcStair%", "IfcRamp%"]` — the EXACT constant `build/room_walker.js`
  and `scripts/compile_rooms.py` already use to EXCLUDE stair footprints from the room pool (§STAIR-
  EXCLUDE). This spec queries the same `ifc_class LIKE` pattern directly against `elements_meta` /
  `element_transforms` for the POSITIVE extraction — stairs never reach `spatial_structure` as
  `IfcSpace` rows (removed before compilation), so this must read the raw element tables, not the
  room pool.
- **LIFT_SHAFT**: `NON_ROOM_DOOR_NAMES = ["liftdeur","lift","elevator","aufzug","fahrstuhl","hoist"]`
  — same constant, generalized from "door element_name contains one of these" (its original,
  narrower use: excluding a lift door from door-rescue room evidence) to "ANY element_name contains
  one of these" (this spec's positive extraction) — same real observed words, wider match scope,
  not a new invented vocabulary. Covers every real anchor found (Aufzug, liftdeur*, Elevator).
- **PLANT_ROOM**: MEP-equipment keyword list (vent/duct/fan/ahu/damper/chiller/condensing/fancoil/
  pump — the recon's own keyword set) matched against `element_name`, then bucketed by which
  compiled room's bounding box contains the most matches (density, not identity — no single entity
  IS a plant room, the ROOM containing a concentration of MEP equipment is inferred to be one).
  Terminal-only; `min_count` stays 0 (advisory tick, not a hard requirement) given n=1 building.

## Schema — `config/building_taxonomy.yaml`
Same `type` / `min_count` shape as `required_spaces`, plus `source` (which extractor produced it),
`evidence` (`measured` | `none_found`), and `buildings` (citation, same convention as
`room_templates.yaml`'s `examples`). `min_count: 0` = advisory/tick-off (report found vs. not,
never a shortfall failure) — distinct from `required_spaces`' existing `min_count >= 1` (hard
shortfall gate for habitable rooms). Building-part taxonomy entries are ticks, not gates, until a
part has enough real cross-building evidence to promote to a hard requirement (mirrors
`room_templates.yaml`'s own promotion-bar discipline: >=2 real occurrences before anything is
treated as expected-by-default).

## Module — `build/building_parts_taxonomy.js`
- `extractParts(db)` — bottom-up: runs the STAIRWAY/LIFT_SHAFT/PLANT_ROOM queries above against one
  building's `*_ARC.db`, returns real rows (guid, name, ifc_class, position) per part.
- `checklistReport(buildingClass, extracted)` — top-down: walks `config/building_taxonomy.yaml`'s
  entries for that class, ticks ✅ (found, with count) / ⚠ (expected, zero found) / — (advisory,
  n/a) per part. `STORAGE`/`AIR_LIGHT_WELL` are NOT in the config at all — a checklist can only ask
  about parts that have real evidence somewhere; a part with `none_found` everywhere stays a named,
  documented refusal in this doc, not a checklist row that always reads ⚠.

## Witness — `build/witness_building_parts_taxonomy.js`
Re-runs the extraction against all 8 real `*_ARC.db` files, asserts the counts match this doc's
recon table exactly (regression guard against the recon numbers drifting silently), then prints the
top-down checklist report per building. Log-only for PLANT_ROOM's room-concentration number (n=1,
not asserted as a hard pass/fail — reported honestly as a single-building finding).

## Find panel wiring — DONE 2026-07-11 (bim-ootb, separate repo)
`viewer/navigate_find.js` gained a new data-gated `parts` axis (Stairway/Lift Shaft/Plant Room),
mirroring the existing Room/Material/Phase axis pattern exactly (`_probeLenses()`/`_axes()`/
`_buildPartsTree()`/`_isolatePartsGroup()`) — `STAIR_LIKE`/`LIFT_KEYWORDS`/`PLANT_KEYWORDS` ported
verbatim from this repo's `build/building_parts_taxonomy.js`. Verified via Playwright against real
Duplex + SampleCastle data; commit `d04ddd5` on `feat/parts-axis`, local-only (push pause), MANAGER-
verified independently (diff read, not just the report trusted).

**DB-variant nuance found during verification, worth knowing:** bim-ootb's served
`modeller/Duplex_extracted.db` carries only 2×`IfcStairFlight` (no parent `IfcStair` rows) —
DIFFERENT from this repo's witness source `modeller/Duplex_ARC.db` (2×`IfcStair`+2×`IfcStairFlight`
= 4, per §PARENT-NO-TRANSFORM above). Same building, two DB snapshots that have genuinely diverged
across repos — not a bug in either query, but means the Find panel's live Stairway count for a given
building may differ from this repo's own taxonomy witness for the same building name, depending on
which extracted-DB variant is actually live. Not fixed here — flagging so a future session doesn't
mistake it for a regression.

## Modeller Outliner wiring — DONE 2026-07-11 (bim-ootb, same day as the Find panel)
New standalone `modeller/building_parts_outliner.js`, mirroring the existing `dw_instances_outliner.js`
extension-seam pattern (`Bonsai.outliner.addCategory`) — bonsai_outliner.js itself untouched.
Constants/query ported verbatim from the Find-panel commit. Registered in `modeller.html` alongside
the other outliner categories. Verified via Playwright against real Duplex data (6/6 assertions);
caught and fixed a real bug in the process — a `'bp|TYPE|'+guid` compound leaf id silently broke the
existing click-to-frame-camera path (`frameElementByGuid`'s raw `WHERE guid=...` match), switched to
the raw guid per `bom_tree_outliner.js`'s own stated convention. Commit `f10c5295` on
`feat/parts-outliner`, local-only (push pause), MANAGER-verified independently (diff read).

**Third Duplex Stairway count, same session — now a 3-way divergence, not just 2:** bim-compiler
witness (`Duplex_ARC.db`) = 4; Viewer's served DB (`Duplex_extracted.db`) = 2; Modeller's live
substrate (`window.__dwBuf`, this task) = 4 — matching bim-compiler's own witness, not the Viewer's.
Reinforces `project_db_snapshot_divergence_landmine` (memory): the Viewer's specific served copy is
the outlier here, not a universal "every copy disagrees" problem — worth knowing before assuming
any single number is "the" count for a building.

Both UI halves of VISION-LOCK sentence 5 ("one Outliner panel = Find on steroids") now carry the
same building-parts data — Find panel (Viewer) and Outliner (Modeller) are in parity.

## Still out of scope, explicitly (per WORK-TO-ZERO — don't silently drop these, name them)
- `required_spaces`-style HARD gating for STAIRWAY/LIFT_SHAFT/PLANT_ROOM — these stay advisory
  ticks (`min_count: 0`) until cross-building evidence is stronger; promoting them to a shortfall
  gate is a future call, not made here.

## ▶ 2026-10-24 — "Find panel wiring — DONE 2026-07-11" is superseded
The Find panel's standalone **Parts axis** this section wired was retired 2026-07-15 (§ROOM_LENS_TAXONOMY, `nf_trees.js:466`;
`ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md` §RESOLVED 2026-07-15d). The taxonomy table itself is unchanged and still drives the groups,
now listed under **Room → Type** (HHS live: Stairs 11, Lift Shaft 3, Plant Room 1769, Restrooms 2 — `DOCS_GUIDE_REFRESH.md`). The Modeller
Outliner wiring section is not affected by this note.
