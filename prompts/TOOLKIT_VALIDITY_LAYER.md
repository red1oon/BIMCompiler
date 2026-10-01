# ⚠ DO NOT REMOVE — TOOLKIT_VALIDITY_LAYER (spec-first, 2026-10-02)

**SCOPE.** An ADDITIVE, LOCAL-FIRST, HONEST "validity layer" for the owner's OpenBIM Readiness Toolkit Track-B worker
(`/home/red1/Projects/Dubai/plan/readiness/metrics_worker.js`, M1-M15). It closes the gap found in
`prompts/IFC_COMPLIANCE_SELFCHECK.md` §8.2/§8.3: the census is VACUOUS for corruption (truncated K2 returned `done`, 18 of 20 elements,
no error) and blind to schema-validity defects (null `IfcShapeRepresentation.ContextOfItems`, invalid/duplicate `GlobalId`).
**HARD CONSTRAINTS:** `/home/red1/Projects/Dubai` is NOT a git repo and holds a live scoring+submission system — NOTHING under it is edited;
all work is in `prompts/dubai_validity_layer/` (patch + new files for the owner to apply). No Dubai endpoint is called, no IFC is uploaded anywhere,
no GPU, no git write. Every claim traces to a file:line, a command log or a cited URL. **READ THE LOG AFTER EVERY RUN** (logs:
`$S/vl_logs/`, `S=/tmp/claude-1000/-home-red1-bim-compiler/ab4a76a3-ccfc-4a13-8385-05e280b7ee04/scratchpad`). A check that judged nothing prints
`INCONCLUSIVE`, never `PASS`. Exit code is not evidence.

## 0. Positioning (owner steer, 2026-10-02)
We do NOT replace or certify against buildingSMART's Validation Service. We are **the fast, private, actionable first pass that precedes
the formal service.** The toolkit must add value the service does not centre on: per-finding *why it matters / how to fix*, a *downstream-impact*
line tied to what the Compiler/toolkit actually does with the defect, a *prioritised fix list*, and a *transparent headline*. Beside it, plainly,
what the service gives that this does not (§6). Every output carries: "Indicative, not a certification — for the full schema check use the
buildingSMART Validation Service."

## 1. OWNER QUESTION — is a duplicate GlobalId a standard to flag against?  (sources read 2026-10-02)

**Answer: YES, as a schema-level (normative) violation — not an industry-practice warning. One sub-claim stays UNVERIFIED (§1.4).**

1.1 **The IFC4 schema itself forbids it.** EXPRESS of IFC4 ADD2 TC1 (`reference_schemas/IFC4_ADD2_TC1.exp` in
`https://github.com/buildingSMART/IFC4.3.x-development`, master @ `9b01a271ad04ad321b800568e4744527960750ac`, fetched 2026-10-02; lines 8885-8896 of that file), verbatim:
```
ENTITY IfcRoot
 ABSTRACT SUPERTYPE OF (ONEOF (IfcObjectDefinition ,IfcPropertyDefinition ,IfcRelationship));
	GlobalId : IfcGloballyUniqueId;
	...
 UNIQUE
	UR1 : GlobalId;
END_ENTITY;
```
and `TYPE IfcGloballyUniqueId = STRING(22) FIXED;` (same file, line 162). EXPRESS `UNIQUE` means no two instances of the entity population may share the value.
Docs text, `docs/schemas/core/IfcKernel/Entities/IfcRoot.md` (same repo/commit): "GlobalId — Assignment of a globally unique identifier within the entire software world." and a `## UniqueRules / ### UR1` section.
(The rendered pages `standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcroot.htm` and `ifc43-docs.standards.buildingsmart.org/.../IfcRoot.htm` returned HTTP 403 to this session — the GitHub source of the same specification was read instead.)

1.2 **The 22-char encoding** (`docs/schemas/resource/IfcUtilityResource/Types/IfcGloballyUniqueId.md`, same repo/commit), verbatim: "An IfcGloballyUniqueId holds an encoded string identifier that is used to uniquely identify an IFC object. ... The encoding of the base 64 character set is shown below: `"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";` The resulting string is a fixed 22 character length string ... As a result, the first character must be either a 0, 1, 2, or 3."

1.3 **buildingSMART Validation Service — what is normative and where GUIDs sit.**
- User Guide, `https://buildingsmart.github.io/validate/user/index.html` (v0.8.4): Schema Compliance "checks the following aspects that are defined in the EXPRESS schema: Entity attributes are correctly populated ... Inverse attributes ... Entity-scoped WHERE rules / Global rules"; Normative Checks = "Implementer Agreements ... ratified as official agreements amongst software implementers" and "Informal Propositions ... not ratified ... but are still considered mandatory for a file to be considered valid"; Industry Practices: "None of these checks render the IFC file invalid. Therefore, any issues identified result in warnings rather than errors."
- Rule catalog (`https://buildingsmart.github.io/validate/rule_catalog/index.html` → `https://buildingsmart.github.io/ifc-gherkin-rules/branches/main/features/index.html`; repo `https://github.com/buildingSMART/ifc-gherkin-rules` @ `893f8275049b8960c3ce0c7379b4b57aefeaa8f9`, 2026-07-29) lists **PJS003 "Globally Unique Identifiers" — v1**, file `features/rules/PJS/PJS003_Globally-Unique-Identifiers.feature`, tagged `@implementer-agreement`, verbatim: "The rule verifies that the GUID of each element adheres to the Global Unique Identifier format ... the characters must be within the official encoding character set "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$" , the resulting string must be exactly 22 characters in length, and the first character must be either 0, 1, 2, or 3." => **GUID SYNTAX is an Implementer Agreement (normative, error class).**
- IFC101 `@critical`: "The Schema Identifier of the model must be 'IFC2X3' or 'IFC4' or 'IFC4X3_ADD2'" (accepted set verified; same file `features/rules/IFC/IFC101_Only-official-ifc-versions-allowed.feature`).
- PJS101 (exactly one IfcProject) is `@industry-practice`: "While this is a common industry practice, it does not make the IFC model invalid." => warnings class (used for V-REQ).

1.4 **UNVERIFIED:** no `.feature` rule in the catalog mentions GlobalId uniqueness (grep of all `features/rules` and `features/steps`: only PJS003 syntax; GEM003 is representation-identifier uniqueness, a different rule). The User Guide enumerates WHERE and global rules but does not name EXPRESS `UNIQUE` rules, so **whether the hosted service reports `IfcRoot.UR1` is not readable from public docs.** What IS verified: the schema declares UR1; `ifcopenshell.validate` reports it as an error (`ifcopenshell/validate.py` L484, message "Rule IfcRoot.UR1: The attribute GlobalId should be unique" — and it registers only syntactically-valid GUIDs for the uniqueness test, L497-499). **Verdict for this toolkit:** duplicates are flagged as severity `error` (schema UNIQUE rule UR1), with this UNVERIFIED sub-claim printed in the spec, not hidden. Dubai M15 (duplicate count) is therefore a legitimate metric.

## 2. Design principles
1. **ADDITIVE** — M1-M15 keys/messages unchanged; one new key `validity` on `done` and (new) on `error` messages. The page ignores unknown keys (`done` handler reads `metrics`; `error` handler reads `message`).
2. **LOCAL-FIRST** — pure JS over the bytes the worker already holds; no network, no web-ifc dependency for the validity pass; outputs counts/verdicts/fixed English only — **no GUID, name or free text leaves** (same promise as `metrics_worker.js` L19-24). Entity numbers (`#n`, integers) are returned for locating up to 3 examples.
3. **HONEST** — each check: `PASS | FAIL | INCONCLUSIVE`, `severity` (`error` | `warning`), one-sentence `feedback`, `evidence` counts. INCONCLUSIVE when the population judged is empty or the precondition fails. Roll-up PASS requires V-STEP, V-REF and V-ARITY all PASS (so an empty-DATA file is INCONCLUSIVE/FAIL, never PASS).
4. **Streaming/bounded memory** — byte scanner, one statement decoded at a time; state = two 1-byte-per-id bitmaps (ceiling `MAX_ID` = 100,000,000 ids, above → V-REF INCONCLUSIVE) + one `Set` of GlobalId strings. Ceiling TESTED: see §8.

## 3. Checks (each names the issue it proves/disproves and the buildingSMART layer it approximates)
| id | proves / disproves | approximates | sev |
|---|---|---|---|
| V-STEP | truncated/garbage file: ISO-10303-21 start, HEADER closed, DATA open+closed, `END-ISO-10303-21`, no unterminated statement | Validation Service "STEP Syntax" | error |
| V-SCHEMA | FILE_SCHEMA ∈ {IFC2X3, IFC4, IFC4X3_ADD2} (§1.3 IFC101) | "Schema Version" | error |
| V-REF | no dangling `#id`; no entity number defined twice | EXPRESS referential integrity (inside Schema Compliance) | error |
| V-GUID | every IfcRoot-subtype GlobalId: 22 chars, alphabet, first char 0-3 (PJS003); unique (IfcRoot.UR1, §1.4) | PJS003 (implementer agreement) + schema UNIQUE | error |
| V-CTX | every IfcRepresentation (and subtypes) has non-null `ContextOfItems` | Schema Compliance "attribute not optional" | error |
| V-ARITY | entity name exists in the declared schema; STEP arg count = EXPRESS attribute count (incl. supertypes); abstract entities not instantiated | Schema Compliance "entity attributes ... correct number" + "entity types not included in a schema / abstract instantiated" | error |
| V-ATTR | mandatory attribute not `$`; `*` only in derived slots (excl. GlobalId→V-GUID, ContextOfItems→V-CTX) | Schema Compliance "attributes correctly populated" | error |
| V-REQ | exactly 1 IfcProject (PJS101), ≥1 IfcBuilding, ≥1 IfcBuildingStorey (toolkit M4 convention, not a bSI rule), IfcProject has units | industry practice (warnings) | warning |
Schema tables (`validity_tables.js`) are GENERATED by `gen_validity_tables.py` from ifcopenshell 0.8.4.post1's EXPRESS schema objects (IFC2X3 653 / IFC4 776 / IFC4X3_ADD2 876 entities) — extracted, not hand-written.
**OUT OF SCOPE (stated, not hidden):** EXPRESS WHERE rules, global rules, inverse-attribute cardinalities, attribute TYPE / ENUM / SELECT value validity, aggregate bounds, Implementer Agreements and Informal Propositions other than PJS003, bSDD, geometry. Point users to the Validation Service / ifcopenshell.

## 4. Value-add fields (owner steer) — new keys inside `validity`
Per check (FAIL and warnings): `why` (plain English, BIM-author register), `fix` (what to do in the authoring tool/exporter), `impact` (what the user loses downstream; ONLY impacts justified from code/docs) + `impact_ref` (file:line / doc). Where no Compiler/toolkit code consumes the defect, `impact` says so ("conformance defect; no known app failure") rather than invent a consequence.
| check | impact (basis) | ref |
|---|---|---|
| V-STEP/V-REF | the web-ifc census silently under-counts a truncated file (K2: 18 of 20 elements, verdict `done`) | `IFC_COMPLIANCE_SELFCHECK.md` §8.2 |
| V-GUID | the viewer uses GlobalId as element identity; edits are stored per guid, so elements sharing an id share one edit record | `bim-ootb/viewer/import_worker.js:421`; `viewer/edit_delta_viewer.js:49-50` |
| V-REQ (no storey/containment) | element storey becomes `'Unknown'`; the 4D author must reassign storey by median Z (69.9 % of Terminal) instead of reading the model's own storeys; the toolkit M14 counts these as orphans | `import_worker.js:300,424`; `viewer/schedule_author.js:320-326`; `metrics_worker.js:255-263` |
| V-CTX / V-ARITY / V-ATTR / V-SCHEMA | schema-conformance defects reported by `ifcopenshell.validate` and by the service's Schema Compliance layer; no Compiler/toolkit code path found that consumes them | `IFC_COMPLIANCE_SELFCHECK.md` §8.3; User Guide (§1.3) |
**Prioritised fix list** `validity.fix_list`: only FAIL checks, ordered by a fixed, published tier then by affected share (evidence count / judged): tier 1 file integrity (V-STEP, V-REF) → tier 2 schema (V-SCHEMA, V-ARITY, V-ATTR, V-CTX) → tier 3 identity (V-GUID) → tier 4 warnings (V-REQ). Rationale: later checks are meaningless on a broken envelope; identity next because it breaks cross-references. No hidden weights.
**Headline** `validity.headline`: `readiness = P / J` where P = error-severity checks PASS and J = error-severity checks judged (PASS+FAIL); INCONCLUSIVE excluded and counted separately; warnings never lower it. Shown as `"5 of 7 checks passed (1 not judged, 1 warning)"` with `formula` string in the object. J=0 → headline `INCONCLUSIVE`.
**`validity.vs_buildingsmart`** (static, plain): what the service gives that this does not — EXPRESS WHERE/global rules, inverse attributes, attribute-type/enum/select value checks, the full Implementer-Agreement/Informal-Proposition catalogue (this layer implements only the PJS003 GUID syntax and parts of IFC101/PJS101), a formal citable report; and what this layer adds — runs offline in the browser, nothing uploaded, instant, plain-English why/fix/impact, a prioritised fix order.

## 5. Delivery (owner applies; nothing under Dubai is touched by this work)
Files in `prompts/dubai_validity_layer/`: `validity_core.js`, `validity_tables.js`, `gen_validity_tables.py`, `metrics_worker.js` (copy + 3 additive hunks), `metrics_worker.validity.patch` (diff vs Dubai original), harness `run_validity.js` (headless Chrome, runs the REAL new worker), `run_core.js` (node, core only), `make_controls.py` (negative controls). Run command in §8.

## 6. What the buildingSMART service gives that this does not (verbatim basis §1.3)
EXPRESS entity WHERE rules + global rules; inverse-attribute checks; type/enum/select value checks; Implementer Agreements / Informal Propositions beyond PJS003; industry-practice warnings beyond PJS101; a formal, citable report; (bSDD currently disabled upstream, v0.6.6). This layer is the first pass, not the verdict.

## 7. Witness claims (each names the issue it proves)
W1 K1 (public good) → no FAIL (disproves false positives). W2 K2 truncated → V-STEP FAIL and V-REF FAIL (proves the vacuous-on-corruption gap is closed). W3 K3 empty DATA → never PASS (disproves vacuous pass). W4 K4 garbage → V-STEP FAIL, rest INCONCLUSIVE. W5 one mutated K1 per check class → exactly that check FAILs (proves each check is live, not vacuous) and no other error check changes. W6 Compiler exports: every reported class is real vs `ifcopenshell.validate` (cross-tab in §8).

## 8. Results
(appended after runs — see below)

### 8.0 Provenance
Logs under `$S/vl_logs/`: `new7.log`/`new7.json` (real new worker, headless Chrome, `--disable-gpu`, software GL, 7 files), `orig7.json` (owner's UNMODIFIED worker, read-only), `additive.log`, `neg.log`/`neg_verdict.log`/`neg_ifcopenshell.log`, `guid_crosscheck.log`, `ios_*.log` (ifcopenshell classes), `big_time.log`, `core4.log`, `table7_full.log`. Command: `node run_validity.js --json out.json file.ifc ...` (in `prompts/dubai_validity_layer/`).

### 8.1 Witnesses (read from the logs)
- **W-ADDITIVE** `§VL_ADDITIVE_VERDICT PASS files=7 different=0`: `{type, metrics, message}` of the new worker equals the unmodified worker for all 7 files; the only difference is the new key `validity`. Patch re-applied to a scratch copy of the Dubai `readiness/` with `patch -p1` → byte-identical to the delivered worker.
- **W2 vacuous-on-corruption CLOSED**: K2 (truncated) — old worker: `done`, 18 elements, no error; new: V-STEP FAIL ("DATA section never closed ... ends in the middle of a statement") + V-REF FAIL (3 dangling references).
- **W-NEG** `§VL_NEGCONTROL_VERDICT PASS controls=10 wrong=0`: one mutated copy of K1 per check class (STEP footer, schema id, dangling ref, GUID first char, GUID duplicate, null context, missing arg, mandatory null, `*` in explicit slot, second IfcProject): target check FAILs, no other error-severity check FAILs. `ifcopenshell` independently flags 7 of the 10 mutations (ARITY, ATTR x2, CTX, GUID x2, SCHEMA); it reports **nothing** for the missing footer, the dangling reference and the second project (`neg_ifcopenshell.log`) — the layer sees those, ifcopenshell does not (the second project is a warning only).
- **Memory/size**: 252 MB synthetic (8x viewer_Duplex, ids renumbered; the service cap is 256 MB) — core in node 3.9 s, max RSS 318 MB (file itself 252 MB resident) (`big_time.log`). Real worker (browser) tested to 31 MB (viewer_Duplex: 3.4 s incl. web-ifc). Bitmap ceiling 100,000,000 entity numbers.

### 8.2 Compiler exports vs `ifcopenshell.validate` (express_rules off)
| class | layer | ifcopenshell | match |
|---|---|---|---|
| modeller_Duplex null ContextOfItems | V-CTX 196 | "Attribute not optional" IfcShapeRepresentation 196 | exact |
| modeller_Duplex GlobalId syntax | V-GUID 184 invalid / 64 duplicate | `validate_guid` over every instance: 184 invalid / 64 dup (guidx.py); validate() reports only dups among *valid* ids (4) | exact vs the function; UR1 counts differ by design (we register invalid ids too) |
| modeller_Duplex `*` in explicit slot | V-ATTR 295 (WINDOW 120, DOOR 70, WALL 57, SLAB 21, COVERING 13, STAIRFLIGHT 10, RAILING 4) | "With attribute" rows: same per-type numbers | exact |
| modeller_SampleHouse | V-CTX 40, V-GUID 37, V-ATTR 52 | 40 / 37 / per-type same | exact |
| viewer_Duplex GlobalId | V-GUID 15 of 1135 judged | 15 (5+5+2+1+1+1) of 1135 | exact |
| viewer_Duplex wrong attribute count | V-ARITY 154 entities (WALLSTANDARDCASE 56, WINDOW 24, SLAB 21, DOOR 14, COVERING 13, BEAM 8, FOOTING 7, MEMBER 4, RAILING 4, STAIRFLIGHT 2, WALL 1) | "Invalid attribute value" 314 statements (WINDOW 120 = 24x5, DOOR 70 = 14x5, WALLSTANDARDCASE 56, SLAB 21, COVERING 13, BEAM 8, FOOTING 7, MEMBER 4, RAILING 4, STAIRFLIGHT 10, WALL 1) | entity classes match; ifcopenshell counts statements per missing attribute, we count entities |
Totals 682 / 134 / 329 are NOT reproduced as one number (we count different units); every class we report is confirmed real above.

### 8.3 Still invisible to this layer (compare the service / ifcopenshell)
EXPRESS WHERE + global rules (`express_rules=True` could not run here); inverse-attribute cardinalities; attribute TYPE/ENUM/SELECT value validity (none appeared in the ifcopenshell output of the three exports, so not exercised here); aggregate bounds; the Implementer Agreements / Informal Propositions other than GUID syntax, schema id and project presence; `IfcMapConversion`/CRS rules (GRF*), geometry; bSDD; schemas outside IFC2X3/IFC4/IFC4X3_ADD2 (those get V-SCHEMA FAIL and every table check INCONCLUSIVE); complex (`#n=(...)`) instances are only reference-scanned.
Note on viewer_Duplex: the 314 vs 154 gap is per-attribute vs per-entity counting (IfcWindow/IfcDoor 5 missing attributes each, IfcStairFlight 5 each = 2 entities), not an unseen class.
