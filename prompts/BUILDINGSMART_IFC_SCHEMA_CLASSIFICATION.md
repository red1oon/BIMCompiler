# ⚠ DO NOT REMOVE — LANE: schema-aware classification fallback (self-heal against real IFC4 hierarchy)
# Opened 2026-08-05, spun out of the §CLASS_UNMATCHED_FALLBACK fix (bim-ootb PR #1186) — see
# prompts/4D_SCHEDULE_PERFECTION.md for that fix's own history. This lane does NOT touch PR #1186 or
# any explicit SEQUENCE_RULES entry already shipped — it is a fallback layer BELOW them, additive only.
# PRIME RULE: EXTRACT ONLY. Every ancestor relationship here traces to buildingSMART's own published
#   IFC4 EXPRESS schema, byte-grepped from the raw file — never guessed, never taken from an AI
#   summary of the file. Read §THE WEBFETCH LESSON before trusting any "I checked the schema" claim.

## §WHY THIS LANE EXISTS
`§CLASS_UNMATCHED_FALLBACK` (PR #1186, merged 2026-08-04) found 3 real IFC classes silently defaulting
to the generic phase/resource because `matchRule()` (`viewer/schedule_author.js` + 2 copies in
`viewer/time_machine.js`) matches on **substring-containment of the class NAME**, not real schema
inheritance — `"IfcSwitchingDevice"` doesn't contain `"IfcFlowController"` as a substring even though
it's a direct schema subtype. The fix added 3 explicit `SEQUENCE_RULES` entries.

Immediately after merge, widening the same witness from its 4-building default to all 7 real fixtures
found **2 more** (`IfcSensorType`, `IfcFlowInstrumentType` in `HHS_Office_Federated`) — same root cause,
different building. This is the pattern worth naming: **coverage was bounded by which buildings
happened to get tested, not by how complete the rule table is.** The real, finite, authoritative space
of possible classes is the IFC4 schema itself, not our building fixture set — testing against buildings
will keep finding "one more" indefinitely; testing against the schema finds all of them at once.

## §GROUND TRUTH — verified 2026-08-05, direct from buildingSMART, not from a library's opinion of it
Downloaded `https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/EXPRESS/IFC4.exp` (the
official IFC4 EXPRESS schema, buildingSMART International copyright header confirmed) and grepped it
directly:
```
ENTITY IfcSwitchingDevice    SUBTYPE OF (IfcFlowController)
ENTITY IfcSensorType         SUBTYPE OF (IfcDistributionControlElementType)
ENTITY IfcFlowInstrumentType SUBTYPE OF (IfcDistributionControlElementType)
ENTITY IfcSpace              SUBTYPE OF (IfcSpatialStructureElement)
```
Cross-checked against `ifcopenshell` (already a project dependency — `DAGCompiler/python/extractIFCtoDB.py`
et al., v0.8.4.post1 confirmed installed) walking the same 4 classes via its compiled schema —
**matches exactly.** `ifcopenshell`'s schema is a faithful, queryable compiled copy of buildingSMART's
own EXPRESS text, safe to build against instead of re-parsing the raw `.exp` file every run.

**`IfcSpace` not passing through `IfcElement`** in its ancestor chain (it's an `IfcSpatialStructureElement`
instead) is itself the extractable, non-invented signal that distinguishes "physical, buildable" from
"spatial/zone" — the exact distinction PR #1186 had to hand-notice and hand-code as an exclusion. A
schema-walk gets this for free, for every future spatial class too, not just `IfcSpace`.

### §THE WEBFETCH LESSON — read before trusting any schema claim, including future ones in this file
First attempt used `WebFetch` (fetches a page, has a small AI model summarize it, returns the summary).
It reported `IfcSwitchingDevice SUBTYPE OF (IfcDistributionControlElement)` — **wrong**. Re-verified by
downloading the raw `.exp` and `grep`-ing it directly (no AI paraphrase step) — real answer is
`IfcFlowController`, confirmed independently by `ifcopenshell` and by PR #1186's own shipped commit
message reasoning (2-of-3 agreement caught the outlier). **Rule for this lane: schema facts must come
from a direct grep/parse of the primary file or a verified-faithful compiled library
(`ifcopenshell`), never from an AI's summary of a fetched page — even when the page itself is the
legitimate authoritative source.** The summarization step is where invention can sneak in undetected.

## §DOES NOT IMPACT WORK ALREADY SHIPPED
- PR #1186 (merged) and the in-flight follow-up entries (`IfcSensorType`/`IfcFlowInstrumentType`,
  worktree `fix/class-unmatched-fallback-2` at time of writing) stay exactly as they are. Explicit
  `SEQUENCE_RULES` entries are the reviewed, human-confirmed ground truth and always take precedence —
  this lane only adds a fallback layer BELOW them, for classes nobody has written an entry for yet.
- No existing entry gets removed, reordered, or reinterpreted. This is additive-only, same discipline
  as `§GEO_SUPPORT_LEAK`'s "additive clause, can only push later, never earlier."

## §PROPOSED MECHANISM (spec only — not yet implemented, not yet approved)
Three-tier resolution in `matchRule()`, in order:
1. **Explicit `SEQUENCE_RULES` entry** (today's substring-containment lookup) — unchanged, still wins.
2. **NEW: schema-ancestor walk** — if no explicit entry, walk the class's real IFC4 supertype chain
   (from a pre-built `{class: [ancestor1, ancestor2, ...]}` table, generated once from `ifcopenshell`,
   not re-parsed live) until an ancestor IS explicitly classified; inherit that ancestor's
   `{phase,sequence,resource}`. Still logs `§CLASS_UNMATCHED_INHERITED cls=X via=Y` (loud, visible,
   distinct tag from today's `§CLASS_UNMATCHED` so an inherited classification is distinguishable from
   a genuinely-unclassified one) — a human can promote it to its own explicit entry later, this does
   not silently stay invisible forever.
3. **Generic default** (today's `SEQUENCE_DEFAULT`) — only reached if the ENTIRE ancestor chain to
   `IfcRoot` has no classified member anywhere. Still logs today's `§CLASS_UNMATCHED` unchanged.

**Type/Occurrence pairing, must not be skipped:** IFC4 splits every buildable entity into an Occurrence
class (`IfcSwitchingDevice`) and a parallel Type class (`IfcSwitchingDeviceType`). Their ancestor chains
run in PARALLEL Type-suffixed branches (confirmed above: `IfcSensorType SUBTYPE OF
IfcDistributionControlElementType`, not `IfcDistributionControlElement`). The walker must resolve
Type-suffixed classes against the Type-suffixed ancestor chain, not silently strip "Type" and hope.

## §BUILD PLAN
- **P1** — one-time offline script (`ifcopenshell`, Python, `DAGCompiler/python/` or a new
  `tools/dump_ifc_schema_hierarchy.py`) that walks the FULL IFC4 (and whichever other schema versions
  the pipeline actually ingests — confirm which, don't assume IFC4-only) entity list and emits
  `viewer/rates/ifc_schema_hierarchy.json` — every class → its real ancestor chain. Committed as data,
  regenerate-on-demand (same pattern as `DV_<prefix>_rules.sql`, not a ledger migration).
- **P2** — wire the 3-tier `matchRule()` above into all 3 known copies (`schedule_author.js` +
  `time_machine.js` ×2) — same "N independent copies" discipline as every prior fix in this file's
  parent doc; grep-verify there isn't a 4th before calling it done.
- **P3** — witness: for EVERY class in the generated hierarchy JSON (not just ones seen in current
  building fixtures), confirm it resolves via tier 1 or 2 to a non-generic classification, or is a
  legitimate tier-3 case with a human-reviewable `§CLASS_UNMATCHED` log line. This is the proactive
  version of the class-fallback witness — schema-exhaustive, not building-sample-bounded.
- **P4** — full existing regression suite green (same named set §CLASS_UNMATCHED_FALLBACK already
  proved clean against), zero live-browser touch until headless is fully green, per this project's
  standing math-not-screenshots rule.

## §OPEN QUESTIONS — do not guess these, resolve before/during P1
- Which IFC schema version(s) does the extraction pipeline actually parse in production — IFC4 only, or
  also IFC2X3/IFC4X3? The hierarchy table must match what's actually ingested, not just IFC4 by default.
- What's the right behavior when a Type-suffixed class's Occurrence counterpart IS classified but the
  Type class itself has no explicit entry and no classified Type-ancestor — inherit across the
  Type/Occurrence boundary, or treat as a separate unmatched case? Needs a real decision, not an
  assumption, before P2.

## §RELATED
- `prompts/4D_SCHEDULE_PERFECTION.md` §CLASS_UNMATCHED_FALLBACK — the fix this lane extends
- `prompts/BUILDINGSMART_IFC_CERTIFICATION.md` — different lane, same publisher (data-exchange
  certification viability, not classification) — do not merge these, different scope

## Sources — primary, verified 2026-08-05
- https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/EXPRESS/IFC4.exp (downloaded, grepped
  directly — the actual verification, not the WebFetch summary of the HTML docs)
- `ifcopenshell` v0.8.4.post1 (installed, cross-checked, matches the raw file exactly on all 4 classes)
