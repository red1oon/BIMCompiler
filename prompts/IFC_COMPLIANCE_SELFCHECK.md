# ⚠ DO NOT REMOVE — IFC_COMPLIANCE_SELFCHECK (spec-first, 2026-10-02)

**SCOPE.** Self-assessment of the IFC files the BIM Intent Compiler's exporters emit, against what
buildingSMART evaluates, by REUSING the owner's Dubai OpenBIM Readiness Toolkit Track-B measurer
(`metrics_worker.js`) — not rebuilding a validator. Read-only on the Dubai project and on
`~/bim-ootb` / `/tmp/wt-noai`. No GPU. No upload/submit to any live service (Dubai OCI PARs,
buildingSMART Validation Service) — those are proposed manual steps for the owner (§7).
Every claim below traces to a `file:line`, a command log under the scratchpad
`/tmp/claude-1000/-home-red1-bim-compiler/ab4a76a3-ccfc-4a13-8385-05e280b7ee04/scratchpad/logs/`,
or a cited URL. **READ THE LOG AFTER EVERY RUN.** A verdict with an empty population prints
`INCONCLUSIVE`, never PASS. Exit code is not evidence.

This file is written BEFORE any run. §8 Results is appended after the logs are read.

## 1. What the Dubai toolkit actually is (read 2026-10-02)

Sources: `/home/red1/Projects/Dubai/PROMPT.md` §RESUME_2026-09-09 (L1596-1660), §PILOT_OPENED (L1664+);
`/home/red1/Projects/Dubai/plan/readiness/README.md`; `plan/SCORING_SPEC.md` §5.1; `plan/toolkit_mockup.html`.

- It is a **readiness-assessment questionnaire (Track A, self-reported, L0-L5 per ISO/IEC 33020) plus a
  measurement pass over the respondent's IFC (Track B, metrics M1-M15)**. It is NOT a schema/STEP/rule
  validator. `plan/readiness/README.md` says Track B "calls web-ifc directly ... No geometry, no sql.js,
  no storage" and counts only.
- **Track B = `plan/readiness/metrics_worker.js`** (297 lines; identical to `~/bim-ootb/readiness/metrics_worker.js`
  and to `/tmp/wt-noai/readiness/metrics_worker.js` — `diff -q` silent). Input `postMessage({arrayBuffer, filename})`
  (L26); output `{type:'done', metrics}` (L28, L290). Checks, with lines:
  - parse: `api.OpenModel` fail -> "The file could not be parsed as IFC." / "That IFC schema is not supported. This reads IFC2x3, IFC4 and IFC4x3." (L93-103)
  - M1 schema string (L107-110); M2 exporting app via FILE_NAME header / IfcApplication, allowlist else `other` (L112-130; `bim-ootb` is on the allowlist L59)
  - M3 element count by type (L134-157; N=0 -> error "contains no IFC elements" L157)
  - M4 spatial chain: counts of IfcProject/Site/Building/BuildingStorey, `spatial_chain_complete` = all four >0 (L162-168)
  - M5 IfcSpace count + % storeys carrying a space via IfcRelAggregates (L169-183)
  - M6 % elements with IfcRelAssociatesClassification (L187-194); M7 % elements with property sets, `Pset_`/`Qto_` vs vendor (L196-213)
  - M8 % with material association (L217-224); M12 % with IfcRelDefinesByType (L226-233); M11 IfcElementQuantity present + coverage (L235-248)
  - M13 IfcRelSpaceBoundary present (L253); M14 orphans = elements in no IfcRelContainedInSpatialStructure (L255-263)
  - M15 duplicate GlobalIds (L265-278); M9 meaningful-name % heuristic (L267-279); M10 georef boolean: IfcSite RefLatitude/RefLongitude or any IfcMapConversion (L281-287)
- **Feedback it gives**: raw numbers only. The page (`plan/toolkit_mockup.html`) renders 8 cells —
  Schema, Elements, Spatial chain Complete/Incomplete, Spaces, Classified %, Property sets %, Quantities
  Present/Absent, Duplicate GUIDs — with a `flag` style on weak values (L1318-1335) and a fixed explanatory
  note (L1337-1349). There is **no per-check PASS/FAIL verdict and no feedback text per metric**; threshold
  calibration of the 15 metrics is explicitly still open (PROMPT.md L1653, SCORING_SPEC §6.2 L"Exact thresholds are calibrated during KB authoring").
  `computeDims()` (toolkit_mockup.html L1713) scores Track A answers only; Track B is not yet mapped to levels.
- **How invoked locally**: no CLI exists. It runs as a browser Web Worker (`new Worker('metrics_worker.js')`,
  toolkit_mockup.html L1405) loading `../viewer/lib/web-ifc-api-iife.js` + `web-ifc.wasm` (same-origin; CDN unpkg
  fallback only if local fails, L32-39). **Needs: no network for the measurement (fonts only on page load, README L"Privacy"), no server beyond a static file server, no OCI.**
  Submission (OCI PAR write, toolkit_mockup.html ~L1735) is separate and is NOT called here.
- **Local invocation chosen**: puppeteer (from `~/bim-compiler/node_modules`) headless Chrome, static server rooted at
  `/tmp/wt-noai` (read-only), page evaluates `new Worker('/readiness/metrics_worker.js')` with the real worker file
  UNMODIFIED, posts the IFC bytes, records the `done` metrics and the worker's own console lines. No GPU flags beyond
  software GL; the worker needs no GL at all.

## 2. What buildingSMART evaluates (sources)

- Validation Service user guide, fetched 2026-10-02 (`buildingsmart.github.io/validate/user/index.html`, HTTP 200, saved in scratchpad `bsi_pages/validate_user.html`):
  STEP syntax (ISO 10303-21); schema version in {IFC2X3, IFC4, IFC4X3_ADD2}; schema compliance (attributes, cardinality,
  inverses, entity WHERE rules, global rules, abstract instantiation); normative Implementer Agreements; normative Informal
  Propositions; non-normative Industry Practices (warnings only); bSDD (disabled as of v0.6.6). Upload: .ifc non-zipped, <=256 MB; login required.
- Import certification minimal test set: 15 criteria (numbered 0..14 in the list; the file numbers them 0 then "1." repeatedly),
  Pass/Partial Pass required, any Fail disqualifies (`raw.githubusercontent.com/buildingSMART/Sample-Test-Files/main/import-certification.md`, HTTP 200, saved `bsi_pages/import-certification.md`). The 9-model set is cited
  in `research_notes/BIM app positioning research/credibility_interop.md` L10; the individual 9 filenames were NOT enumerated this session (unverified).
- IDS v1.0 final 2024-06-04 and BCF-XML/API: `credibility_interop.md` L42-45 (secondary; not re-fetched).
- NOT READABLE: `buildingsmart.org/users/services/validation-service/` and `.../compliance/software-certification/ifc/` return HTTP 403 to curl (saved bodies are the 403 page). Their fee/ratio claims remain UNVERIFIED (as in credibility_interop.md L32).
- The exact per-rule catalogue (Developer Guide "Rule Catalog") was not fetched: UNVERIFIED which individual IA/IP/IndustryPractice rules exist.

## 3. Mapping table: buildingSMART check -> Dubai coverage -> gap

Legend: **yes** = Dubai measures what the check tests; **partial** = measures presence/proxy only;
**no** = nothing. Import criteria test an *importer*; for an *exporter* self-check they are read as "is the data present for
a conforming importer to import" (proxy, stated as such).

| # | buildingSMART check / criterion | Dubai coverage | Dubai evidence | Gap |
|---|---|---|---|---|
| V1 | STEP syntax (ISO 10303-21) | partial | metrics_worker.js L96-103 (web-ifc parse failure -> error) | web-ifc is a lenient reader; a pass is not a conformance verdict |
| V2 | Schema version in IFC2X3/IFC4/IFC4X3_ADD2 | partial | L107-110, L98-100 | no ADD2 distinction; unsupported -> error, no verdict row |
| V3 | Schema compliance (attrs, cardinality, inverses, WHERE, global rules, abstract) | no | none | the core of the Validation Service is absent |
| V4 | Implementer Agreements (normative) | no | none | absent |
| V5 | Informal Propositions (normative) | no | none | absent |
| V6 | Industry Practices (warnings) | partial | M15 duplicate GUIDs L265-278; M14 orphans L255-263 | which of these buildingSMART files under IA/IP/industry-practice is unverified; the rest of the catalogue absent |
| V7 | bSDD compliance | no | none | disabled upstream (v0.6.6) |
| C0 | Models import (9 models together) | no | none | not a per-file metric |
| C1 | Software version visible | no | M2 reads exporter name only (L112-130) | UI property of the importer |
| C2 | General visual geometry | no | L94 "No geometry is requested anywhere" | by design |
| C3 | Geographic positioning | partial | M10 boolean L281-287 | no plausibility check |
| C4 | Georeferencing (CRS) | partial | IfcMapConversion presence L286 | CRS content not read |
| C5 | Spatial breakdown | partial | M4 L162-168, M5 L172-183 | counts of entities, not that they are linked Project>Site>Building>Storey |
| C6 | Material assignment | partial | M8 L217-224 | association count, not correctness |
| C7 | Colours | no | none | absent |
| C8 | Object type/occurrence/properties + GUID retained | partial | M7 L196-213, M12 L226-233, M15 L265-278 | GUID "retained from source" needs a source file; only uniqueness measured |
| C9 | Quantities and quantity sets | partial | M11 L235-248 | presence/coverage, not values |
| C10 | Classification references (URIs) | partial | M6 L187-194 | URI/validity not checked |
| C11 | Assemblies | no | IfcRelAggregates read only for storey->space (L173-181) | absent |
| C12 | Groups and systems | no | none | absent |
| C13 | Spaces | partial | M5 L169 | placement not checked |
| C14 | Road surface/markings (IFC4.3) | no | none | out of scope for building exporter |
| I1 | IDS v1.0 check | no | none | absent (IfcOpenShell IfcTester is the open prior art, credibility_interop.md L44) |
| B1 | BCF in/out | no | none | absent |

Counts: 25 rows = yes 0 / partial 11 / no 14 (rows V1,V2,V6,C3,C4,C5,C6,C8,C9,C10,C13 partial). **Headline: the Dubai toolkit covers
NONE of buildingSMART's Validation Service normative checks; it is a model-richness census, not a validator.** This is the
principal finding; a validator-equivalent needs a different tool (§7).

## 4. Samples to produce (no GPU)

- **A. Modeller exporter** `modeller/bonsai_ifc.js` `Ifc.build()` (L77; `CreateModel({schema:'IFC4'})` L83): drive the app
  headless with software GL as `witness_ifc_export_seed.js` does (`e2e_harness.js` L50-52: puppeteer, swiftshader), open the
  Duplex resident, call `window.Bonsai.ifc.build()`, write `r.bytes`. Own harness copy in scratchpad (the shipped harness
  `mkdir`s inside the worktree; I do not write there).
  **Hypothesis H1 (from code, to be tested not assumed)**: `grep -c` of IFCPROJECT/SITE/BUILDING/BUILDINGSTOREY/UNITASSIGNMENT/
  RELCONTAINEDINSPATIAL in bonsai_ifc.js = 0 (command output 2026-10-02) -> Dubai M4 should read Incomplete, M14 orphans = N.
- **B. Viewer exporter** `viewer/ifc_export_worker.js` (pure STEP-text builder, no web-ifc, L6-8; writes OWNERHISTORY L114,
  UNITASSIGNMENT L126, PROJECT L148, SITE L152, BUILDINGSTOREY L199, RELCONTAINEDINSPATIALSTRUCTURE L354, `FILE_SCHEMA(('IFC4'))` L363).
  Input assembled in `viewer/import.js` L690-737 from an extracted DB (`elements_meta`, `element_transforms`, `element_instances JOIN component_geometries`).
  Headless: run the worker file UNMODIFIED in Node with a `self`/`postMessage` shim, fed from
  `~/bim-compiler/deploy/buildings/Duplex_extracted.db` read-only (has all 5 tables). **Hypothesis H2**: M4 Complete.
- Both are "own/sample building" outputs (Duplex). No user data.

## 5. Controls (so a validator that passes everything is caught)

- **K1 known-good public IFC**: a buildingSMART public sample (Sample-Test-Files, cited §2) downloaded read-only; if network
  download fails, fall back to a repo-local sample IFC and say so. Expected: schema non-empty, spatial chain Complete, elements > 0.
- **K2 deliberately corrupted copy**: K1 with its STEP structure damaged (truncate mid-DATA and remove `ENDSEC;`/footer). Expected: the toolkit's parse step reports an error
  OR metrics collapse. **If K2 yields the same metrics as K1 -> the measurer is VACUOUS for syntax and is reported as such.**
- **K3 empty-population**: an IFC with zero IfcElement -> expect the worker's "no IFC elements" error (L157), proving the worker can say NO-OP/INCONCLUSIVE.
- Supplementary independent check (NOT the Dubai toolkit, labelled as such, local only): `ifcopenshell.validate` (ifcopenshell 0.8.4.post1 installed) for schema/attribute conformance, because the Dubai toolkit has no equivalent of V3-V5. It is a stand-in for the Validation Service, not the Validation Service.

## 6. Pass/fail definitions (named issue each proves)

| Id | Issue it proves or disproves | Falsifier |
|---|---|---|
| R1 | Dubai worker runs unmodified headless and returns a `done` metrics object on K1 | no `done` message |
| R2 | Worker is not vacuous: K2 differs from K1 | identical metrics K1/K2 -> VACUOUS |
| R3 | Exporter A (modeller) produces spatial chain? (H1) | M4 Complete would falsify H1 |
| R4 | Exporter B (viewer) produces spatial chain? (H2) | M4 Incomplete would falsify H2 |
| R5 | Independent schema validity of A and B (ifcopenshell) | any error is a finding, not a pass |

## 7. Not run — proposed manual steps for the owner (hard constraint: no upload)

1. Upload the saved exported `.ifc` files to https://validate.buildingsmart.org (free, login) and publish the report — covers V1-V6 which the Dubai toolkit cannot.
2. Run the 9 official public test models through the Compiler's IMPORT path and fill the 15-criterion table (self-assessed, not certified).
3. Submitting the Dubai Track-B payload to the OCI PAR is a live write; not done.
4. Extending the Dubai worker with per-metric verdicts and thresholds is the owner's open item 3 (PROMPT.md L1653); do not duplicate it here.

## 8. Results

(appended after runs — see below)

### 8.0 Provenance of this run (2026-10-02)
Scratchpad `S=/tmp/claude-1000/-home-red1-bim-compiler/ab4a76a3-ccfc-4a13-8385-05e280b7ee04/scratchpad`. Logs read after each run:
`S/logs/L1_exportA.log`, `L1b_exportA_SampleHouse.log`, `L2_exportB.log`, `L3_dubai_track_b.log`, `L4_guid_probe.log`,
`L5_ifcopenshell_validate.log`, `L6_ifcopenshell_digest.log`, `L7_viewer_full_examples.log`, `L8_guid_validity.log`.
Scripts (reproducible): `S/exportA.js` (puppeteer, `--disable-gpu`, swiftshader, serves `/tmp/wt-noai` read-only), `S/dumpB.py` + `S/exportB.js`
(`viewer/ifc_export_worker.js` UNMODIFIED in a node `vm` shim, fed read-only from `~/bim-compiler/deploy/buildings/Duplex_extracted.db`),
`S/runDubai.js` (UNMODIFIED Dubai `metrics_worker.js` in a headless Chrome Worker). Nothing was written to Dubai, `~/bim-ootb` or `/tmp/wt-noai`;
nothing uploaded; no GPU; no git.

**Exact validator command**:
`node $S/runDubai.js <file.ifc> ...`  (loads `http://localhost:<port>/readiness/metrics_worker.js` from `/tmp/wt-noai`, byte-identical to `~/Projects/Dubai/plan/readiness/metrics_worker.js`;
`diff -q` silent), posts `{arrayBuffer, filename}`, prints the worker's `done`/`error` message verbatim.

### 8.1 Samples produced (`S/ifc_export_samples/`)
- `modeller_Duplex.ifc` 3,954,906 B, `modeller_SampleHouse.ifc` 3,697,396 B — Exporter A (`Bonsai.ifc.build()`, L1/L1b: Duplex seeded=196 noMeshSkipped=0; SampleHouse seeded=38).
- `viewer_Duplex.ifc` 31,470,574 B — Exporter B (L2: `§EXPORT_BUILD elements=1119/1122`; the 3 skipped are not named in the log). Under the 256 MB Validation Service cap.
- Controls (`S/controls/`): K1 `Building-Architecture.ifc` (buildingSMART Certification-datasets, IFC4 ADD2 TC1 Simple-Scene, downloaded read-only, 142,325 B);
  K2 = K1 truncated at 40% of DATA + one unterminated entity, no footer; K3 = K1 header with empty DATA; K4 = 50 lines of non-STEP text.

### 8.2 Dubai Track-B results, verbatim from `L3_dubai_track_b.log`
| file | worker verdict | key metrics (verbatim keys) |
|---|---|---|
| K1 public good | `done` | schema IFC4, exporter SketchUp, elements 20, spatial_chain {project 1, site 2, building 1, storey 1}, spatial_chain_complete true, spaces 2, classified_pc 5, psets_pc 35, quantities true, orphans 8 (40%), dup_guids 0, georef true |
| K2 corrupted | **`done`** (no error) | elements **18**, otherwise near-identical to K1 (classified_pc 5.6, orphans 8) — **corruption NOT reported** |
| K3 empty DATA | `error`: "The file parsed, but it contains no IFC elements." | worker CAN say no-population (R-control passes) |
| K4 garbage | `error`: "The file could not be parsed as IFC." | parse failure reported |
| modeller_Duplex (A) | `done` | schema IFC4, exporter "Blender / Bonsai" (matched from web-ifc header string `thatopen/web-ifc-api`... see note), elements 196, spatial_chain all 0, **spatial_chain_complete false**, spaces 0, classified 0, psets 0, materials 0, typed 0, quantities false, **orphans 196 (100%)**, **dup_guids 64**, georef false |
| modeller_SampleHouse (A) | `done` | elements 40, spatial_chain all 0, complete false, orphans 40 (100%), dup_guids 0, rest 0 |
| viewer_Duplex (B) | `done` | schema IFC4, exporter "BIM-OOTB", elements 1126, spatial_chain {1,1,1,5}, **complete true**, spaces 0, psets/classified/materials/typed 0, quantities false, orphans 7 (0.6%), dup_guids 0, georef false |

Notes: (i) the Dubai tool prints NO per-check PASS/FAIL or feedback sentence — only these numbers (§1); the only prose it can emit is the three error strings above.
(ii) M2 for Exporter A says "Blender / Bonsai": the FILE_NAME header written by web-ifc is `'thatopen/web-ifc-api'` (see head of `modeller_Duplex.ifc`); the match came from the `bonsai_model.ifc` filename/`bonsai` substring in the joined header (L117-120 joins all header args), not from any application self-identification. Treat M2 as a misattribution for this exporter (observed, cause inferred).
(iii) **R2 verdict: the Dubai worker is VACUOUS for STEP-syntax/corruption** (K2 returns `done`; web-ifc recovers the readable prefix). It is NOT vacuous for population (K3) or parse failure (K4), and it separates exporters A and B sharply (M4, M14, M15), so it is a valid *richness census* but not a validity check.
H1 CONFIRMED (spatial chain absent in A, orphans 100%). H2 CONFIRMED (chain complete in B).

### 8.3 Independent schema check (NOT the Dubai toolkit — stand-in for Validation Service layers V3, partial)
`ifcopenshell.validate(model, json_logger, express_rules=False)` (ifcopenshell 0.8.4.post1; `express_rules=True` could not run: module `_pytest` is not installed, and I did not install packages). Logs L5/L6/L7. WHERE/global rules therefore NOT run (unverified). Per file:
- K1 public: schema IFC4, **0 statements**. K3 empty: 0 statements (so ifcopenshell, too, passes an empty model — it checks only what is present).
- K2 corrupted: **ifcopenshell crashed with SIGSEGV (exit 139)** opening the truncated file; K4: "Unable to parse IFC SPF header". Corruption is detectable only by crash/parse error here, never by a clean verdict.
- modeller_SampleHouse: 134 error statements; modeller_Duplex: **682** error statements. Categories on Duplex (L6, verbatim first lines): `IfcShapeRepresentation` "Attribute not optional" x196 (ContextOfItems is null — `bonsai_ifc.js` `productFromRep` writes `IFCSHAPEREPRESENTATION(null, 'Body', ...)`, L88-90 region of the build); `IfcGloballyUniqueId base64 validation: The attribute GlobalId should be valid base64 encoded 128-bit number ... Guid first character must be ...` on IfcFurnishingElement x58, IfcWall x53, IfcWindow x23, IfcSlab x21, IfcDoor x14, IfcCovering x13 (message truncated in my digest at "first character must be"; the IFC rule is first char 0-3 — from the message's own wording, rest unverified); `PredefinedType` "Not valid" with value `*` on IfcWall/IfcSlab/IfcWindow/IfcCovering; `OverallHeight`/`OverallWidth` "Not valid" with `*` on IfcWindow/IfcDoor.
- **GUID defect root cause (measured)**: `guid(n)` in `modeller/bonsai_ifc.js` L13-17 yields only 132 distinct values for n=0..195 and 863 for n=0..3224 (L4: `n=196 distinct=132`, `n=3225 distinct=863`); the exported Duplex has 196 GlobalIds with 132 distinct = Dubai's `dup_guids 64` (consistent). Cause not proven; the output pattern (`xAAAA4AAAA...`) is consistent with `x*1103515245` exceeding 2^53 so low bits are lost (hypothesis, not tested).
- viewer_Duplex: 329 error statements: `Invalid attribute value` on `PredefinedType` for IfcWindow x120, IfcDoor x70, IfcWallStandardCase x56, IfcSlab x21, IfcCovering x13, IfcStairFlight x10, IfcBeam x8, IfcFooting x7, IfcMember x4, IfcRailing x4 (L7: the written lines, e.g. `IFCDOOR('1hOS...',#5,'M_Single-Flush:...',$,$,#6650,#6659,$);`, carry only the 8 IfcProduct-level attributes while IFC4 IfcDoor/IfcWindow etc. have more); GlobalId base64 errors on IfcRelContainedInSpatialStructure x5, IfcBuildingStorey x5, IfcProject, IfcSite (generated by `newGuid()` using `Math.random()` over all 64 chars, `ifc_export_worker.js` L21-26, so the first char is arbitrary; GUIDs are also non-deterministic run to run).

### 8.4 Verdict table (buildingSMART layer vs our exports; what could be run locally)
| layer | Dubai toolkit | independent local stand-in | result |
|---|---|---|---|
| V1 STEP syntax | partial, VACUOUS on corruption (K2) | ifcopenshell open | A,B open; K2 segfault |
| V2 schema version | M1 = IFC4 for A and B | ifcopenshell | IFC4 (FILE_SCHEMA(('IFC4')) A: web-ifc header; B: `ifc_export_worker.js` L363) — `IFC4` is not `IFC4X3_ADD2`, accepted set per §2 |
| V3 schema compliance | none | ifcopenshell attrs/types only | A FAIL (682), B FAIL (329); WHERE/global rules not run |
| V4/V5/V6/V7 | none | none | NOT RUN locally: requires the buildingSMART Validation Service (login + upload; hard constraint) — INCONCLUSIVE |
| C-criteria (data present) | partial via M-metrics | — | A: spatial/spaces/materials/types/props/quantities all absent; B: spatial chain present, spaces=0, no classification/psets/materials/types/quantities, georef false |
| IDS / BCF | none | none | not run — no IDS file and no BCF writer was located in this session (not searched for in the Compiler repos; UNVERIFIED either way) |

### 8.5 Top gaps vs what buildingSMART evaluates
1. Both exporters emit schema-invalid IFC4 (A 682, B 329 ifcopenshell schema errors) — would fail V3 of the Validation Service (expected, not run there).
2. GlobalId generation is invalid in both: A also collides (64 duplicates of 196); this also fails the Dubai M15 and any importer keyed on GUIDs (C8).
3. Exporter A emits no IfcProject/Site/Building/Storey, no units, no containment (grep count 0; Dubai orphans 100%) — fails C5 spatial breakdown by construction; B has them.
4. Neither exporter writes spaces, materials, type objects, classification, property sets, quantities, georeferencing (all 0 in Dubai metrics) — C6/C8-C10/C13 data absent. (The Duplex source DB may hold some of this data; not measured here.)
5. The Dubai toolkit cannot see gaps 1-2 except M15; it needs an added validity layer (ifcopenshell validate / the Validation Service) — recommended as the owner's call; the toolkit itself was not modified.

### 8.6 Unverified / INCONCLUSIVE
- Validation Service output (V3-V7): not run (no upload permitted). All ifcopenshell numbers are a stand-in, with express (WHERE/global) rules off.
- Two buildingSMART pages (validation-service, software-certification/ifc) returned 403; fee claims remain UNVERIFIED. The 9-model set is not enumerated by the fetched markdown; the `Simple-Scene` folder holds 10 files (Building-Architecture/Hvac/Landscaping/Structural, Infra-Bridge/Electrical/Landscaping/Plumbing/Rail/Road) plus 5 `ISO Spec - ReferenceView_V1.2` files (GitHub API listing 2026-10-02); which 9 form the certification set is unverified.
- Exporter A: Garage resident could not be opened by key `Garage` in the chooser (L1 FATAL: selector `data-key="Garage"` not found, before the reload); only Duplex and SampleHouse exported.
- Exporter B: 3 of 1122 elements skipped, reason not logged; Dubai reports 1126 elements (counts non-product-geometry entities differently) — not reconciled.
- Cause of the GUID defect in A is a hypothesis (§8.3).

## §EXPORTER_FIX — make both IFC exporters schema-valid IFC4 (spec written 2026-10-02, BEFORE any code)

# ⚠ DO NOT REMOVE — scope: fix `modeller/bonsai_ifc.js` (Exporter A) and `viewer/ifc_export_worker.js` (Exporter B) so the
# exported IFC4 passes `ifcopenshell.validate` for the schema / entity-reference classes. Read the `§IFCX_*` log after every run;
# exit code is not evidence. EXTRACT/COMPILE ONLY: every emitted value traces to a source row or a fixed schema fact; no Math.random.
# Code + witness live on bim-ootb branch `fix/ifc-export-schema` (worktree /tmp/wt-noai), witness `modeller/tests/witness_ifc_export_schema.js`.

### Measured facts this spec starts from (pre-fix, §8)
- A Duplex: 682 ifcopenshell errors; A SampleHouse: 134; B Duplex: 329. Public K1 (`Building-Architecture.ifc`): 0.
- GUID defect cause was a HYPOTHESIS ("float overflow in `x*1103515245`"). Tested 2026-10-02 (node, same alphabet/seed as `guid()`):
  `x*1103515245` DOES exceed 2^53 and is inexact (4739561886808912000 vs BigInt exact). BUT replacing it with exact arithmetic
  (`Math.imul` or BigInt) gives only **64** distinct ids for n=196 AND n=3225 — WORSE than the shipped 132/863. Real cause: each of the 22
  chars is `x % 64`, i.e. the LOW 6 BITS of a mod-2^32 LCG; low k bits of such an LCG depend only on the low k bits of the seed, so the whole
  22-char string is a function of 6 seed bits = at most 64 distinct ids. Float overflow only injects accidental extra variety (132/863).
  => `Math.imul`/BigInt alone is NOT the fix; the id must be built from a hashed 128-bit value with the sequence number carried injectively.
- The first character of a valid IFC GlobalId encodes 2 bits (0-3); A's alphabet is also out of the IFC order (`A..Za..z0..9_$`); B's
  `newGuid()` draws all 64 chars at random (first char invalid ~94%, non-deterministic).
- IFC4 STEP arity: IfcDoor/IfcWindow/IfcStairFlight = 13 attributes, IfcSpace 11, most others 9 or 8. Both exporters write only the 8
  IfcProduct attributes; web-ifc writes the missing ones as `*` (derived marker, illegal for a non-derived attribute), B writes nothing
  => ifcopenshell "PredefinedType / OverallHeight / OverallWidth not valid". A also passes 2 extra args to IfcOpeningElement (arity 9).
- Source facts (Duplex_extracted.db, read-only): `elements_meta.guid` = 1122 distinct, all 22-char IFC GUIDs; `elements_meta.storey` + `spatial_structure`
  carry the real storeys (Level 1/Level 2/Roof/T-FDN/Unknown) and their GUIDs; `project_metadata.import_date` exists; `elements_meta.material_name`
  non-null on 98/1122; `spatial_structure`/`rel_contained_in_space` hold spaces (61 containment rows) — none of that reaches either exporter today.

### Fix design (all deterministic, nothing invented)
1. GlobalId: `ifcGuid128(namespace, n)` = four 32-bit words, `w3 = n` (injective in n), `w0..w2` = Math.imul murmur-finalizer mixes of (n, namespace);
   encoded 128 bits -> 22 chars in the true IFC alphabet (`0-9A-Za-z_$`), top char 2 bits. A uses the element's REAL source GUID (`op.outputGuid`) when it is already
   a valid 22-char IFC GUID, else the synthetic one; B keeps the valid source guid, converts a 32-hex UUID exactly, else synthetic. Both guard uniqueness with a Set.
2. A: add Project/Site/Building (+Storeys read from the live building DB `window.__dwBuf` by element guid, only if present), IfcOwnerHistory not required in IFC4 (omitted),
   IfcUnitAssignment, one IfcGeometricRepresentationContext + 'Body' IfcGeometricRepresentationSubContext referenced by EVERY IfcShapeRepresentation, IfcRelAggregates
   chain, IfcRelContainedInSpatialStructure for every product (storey if the source row has one, else the building). Pad each product to its IFC4 arity with null.
3. B: `newGuid()` -> deterministic; pad each product to its IFC4 arity with `$`; timestamps from the source (`project_metadata.import_date`, passed in `meta.importDate`; absent -> fixed epoch,
   logged `§IFCX_B_TIMESTAMP source=none`) instead of `Date.now()`; every skipped element logged with guid/class/reason.
4. UNITS (X3): SI metre for length, m2 area, m3 volume, radian. Source evidence is checked, not assumed: Duplex bbox of the IfcSlab/IfcWall rows are 2-20 (a 16.97 x 0.55 x 2.90 wall)
   which is only plausible in metres; the viewer scene and extracted DBs are metres (B already declares METRE). The witness prints the measured extents as `§IFCX_UNITS_EVIDENCE`.

### Witness claims (each names the issue it proves/disproves) — `witness_ifc_export_schema.js`
| Id | Claim | Issue proved or disproved | Falsifier |
|---|---|---|---|
| X1 | distinct GlobalIds == product count; every id is a valid 22-char IFC GUID (regex + first char 0-3); two independent exports are byte-equal | A: 196 elements/132 distinct (64 dup); B: Math.random ids, invalid first char; non-determinism | any dup, any invalid, any byte diff |
| X2 | exactly 1 IfcProject, >=1 IfcSite/IfcBuilding/IfcBuildingStorey (storey only where the source carries it — A reports `storeys=0 source-has-none` rather than invent one if the DB is unreadable); IfcRelAggregates chain; every product in exactly one IfcRelContainedInSpatialStructure (orphans == 0) | A had none of the chain, 100% orphans | orphans > 0, project != 1 |
| X3 | IfcUnitAssignment on the IfcProject incl. IfcSIUnit LENGTHUNIT METRE (no prefix), AREAUNIT SQUARE_METRE, VOLUMEUNIT CUBIC_METRE | A had no units (lengths unitless) | missing unit or wrong enum |
| X4 | every IfcShapeRepresentation has a non-null ContextOfItems that is an IfcGeometricRepresentationContext/SubContext present in the file | A: 196/196 null ContextOfItems | any null / dangling |
| X5 | `ifcopenshell.validate` (express_rules=False) statement count before -> after for A Duplex, A SampleHouse, B Duplex; target 0; remaining classes listed, not hidden | the headline "schema-invalid IFC4" | count > 0 is reported as the remaining classes, verdict PARTIAL not PASS |
| X6 | emit only what source rows carry: no IfcSpace/material/pset/quantity entity count exceeds what the source has; the witness prints source counts (spaces, material_name) next to emitted counts. THIS CHANGE emits none of spaces/materials/psets/quantities (source has spaces + 98 material names for Duplex — deferred, logged `§IFCX_X6 deferred`); it must not invent any | scope honesty | any such entity present without a source row |
| X7 | `witness_ifc_export_seed.js` still passes (E1-E5) | regression in the product count / face sets | any E red |
| X8 | NEGATIVE CONTROLS: the same validator step run on the PRE-FIX exports (3 fixtures in scratchpad `prefix_fixture/`) must FAIL (errors>0, dups>0, null contexts>0); on a deliberately corrupted copy of a post-fix file (truncated / GlobalId dup injected / ContextOfItems nulled) must FAIL or error; an empty-population file prints INCONCLUSIVE; a validator that returns 0 on all of them prints `VACUOUS` | validator that passes everything | any control passing |

Verdict lines: `§IFCX_X1..X8`, `§IFCX_VERDICT PASS|PARTIAL|FAIL|INCONCLUSIVE|VACUOUS`. PASS only if X1-X4 and X5==0 on all three samples and X8 controls all failed. Nothing judged (0 products) -> INCONCLUSIVE.
ifcopenshell express rules (WHERE/global) stay OFF: module `_pytest` is not installed and nothing is pip-installed; this gap is printed in `§IFCX_X5`.
Not uploaded to any online validator (hard constraint).
