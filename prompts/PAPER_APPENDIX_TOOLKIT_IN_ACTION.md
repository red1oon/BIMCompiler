# ⚠ DO NOT REMOVE — DRAFT appendix: the Readiness Toolkit evaluating sample IFCs (2026-10-02)
SCOPE: a report (not a screenshot) of the Dubai OpenBIM Readiness Toolkit's Track-B metrics worker run on sample IFC files, for use as an appendix in the paper.
Every value below is copied from /home/red1/bim-compiler/prompts/IFC_COMPLIANCE_SELFCHECK.md §8.2-§8.3 (logs L3/L5/L6 in the 2026-10-02 session scratchpad). Read those logs before changing a number here. Nothing was uploaded to any online service; no GPU.
STATUS: this is the "BEFORE" half. Exporter fixes are in progress (§EXPORTER_FIX in the same selfcheck file). Publish the appendix only as BEFORE/AFTER once the fix lands, otherwise it shows the Compiler's own exporter failing without the remedy.

## A.1 What was run
- Tool: the unmodified `plan/readiness/metrics_worker.js` (metrics M1-M15) in a headless-Chrome Worker. It returns counts only — no per-check PASS/FAIL and no feedback sentence (selfcheck §1, §8.2 note i).
- Samples: one public buildingSMART file (`Building-Architecture.ifc`, IFC4 ADD2 TC1 Simple-Scene, 142,325 B) and three IFCs exported by the Compiler: `modeller_Duplex` and `modeller_SampleHouse` (modeller exporter A), `viewer_Duplex` (viewer exporter B).
- Controls: a truncated copy, an empty-DATA copy, and a garbage text file, so a tool that accepts everything is caught.

## A.2 Results (verbatim keys, selfcheck §8.2)
| file | worker verdict | elements | spatial chain (proj/site/bldg/storey) | chain complete | spaces | psets | orphans | duplicate GUIDs |
|---|---|---|---|---|---|---|---|---|
| public buildingSMART file | done | 20 | 1/2/1/1 | true | 2 | 35% | 8 (40%) | 0 |
| modeller_Duplex (A) | done | 196 | 0/0/0/0 | false | 0 | 0 | 196 (100%) | 64 |
| modeller_SampleHouse (A) | done | 40 | 0/0/0/0 | false | 0 | 0 | 40 (100%) | 0 |
| viewer_Duplex (B) | done | 1126 | 1/1/1/5 | true | 0 | 0 | 7 (0.6%) | 0 |
What it shows: the toolkit separates a rich IFC from a sparse one on its measurable dimensions (spatial chain, orphans, duplicate GUIDs, spaces/psets).

## A.3 Limits, stated up front (selfcheck §8.2 iii, §8.3)
- Controls: empty-DATA -> error "contains no IFC elements"; garbage -> error "could not be parsed as IFC". The truncated copy returned `done` with 18 elements instead of 20 and NO error: the toolkit does not detect corruption. It is a readiness census, not a validity check.
- It cannot see schema-validity defects. An independent stand-in, `ifcopenshell.validate` (express rules off — `_pytest` not installed, so WHERE/global rules were NOT run), reports: public file 0 statements; modeller_Duplex 682; modeller_SampleHouse 134; viewer_Duplex 329.
- buildingSMART Validation Service layers (V4-V7), IDS and BCF were NOT run (no upload permitted). Results above are a local stand-in, not a certification.

## A.4 How to finish this appendix
1. Exporter fix lands (agent running; §EXPORTER_FIX) -> rerun the same files -> add an AFTER column to A.2 and the ifcopenshell counts to A.3.
2. Owner runs the free buildingSMART Validation Service manually on the fixed exports (selfcheck §7) and the report links go into A.3.
3. Screenshot (optional, illustration only, never evidence): of the toolkit's results page for the public file next to the modeller export, taken from a headless run — the table above is the evidence.

## A.5 BEFORE / AFTER with the validity layer (added 2026-10-02, log /tmp/dubai_patched_check.log, json /tmp/dubai_patched_check.json)
Toolkit = Dubai `plan/readiness/metrics_worker.js` PATCHED with the validity layer (spec: prompts/TOOLKIT_VALIDITY_LAYER.md; patch applied locally 2026-10-02, backup plan/readiness.bak-2026-10-02; version.json NOT bumped). Headline = `P of J error-severity checks passed` (formula printed in the output; INCONCLUSIVE excluded; warnings never lower it). Indicative first pass, not a certification.
| file | validity headline | independent `ifcopenshell.validate` (express rules off) |
|---|---|---|
| public buildingSMART file | PASS 7 of 7 | 0 |
| truncated copy of it | FAIL 5 of 7 (the old worker said `done`) | crash (SIGSEGV) |
| modeller export BEFORE fix | FAIL 4 of 7 (+1 warning) | 682 |
| modeller export AFTER fix (A_Duplex) | PASS 7 of 7 | 0 |
| modeller SampleHouse AFTER fix | PASS 7 of 7 | 0 (was 134) |
| viewer export AFTER fix (B_Duplex) | PASS 7 of 7 | 0 (was 329) |
Exporter fix: branch fix/ifc-export-schema @05b1ac4f (local), witness modeller/tests/witness_ifc_export_schema.js. Not run: EXPRESS WHERE/global rules, buildingSMART Validation Service (manual step). Disclosure: the exports are the Compiler's own — the benchmark platform of the grant — so if this appendix goes in the grant paper, state it under competing interests.
