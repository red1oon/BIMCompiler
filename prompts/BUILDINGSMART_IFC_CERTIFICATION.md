# ⚠ DO NOT REMOVE — LANE: buildingSMART IFC software certification (viability)
# Opened 2026-07-31, pivoting out of prompts/JKR_SKATA_COMPLIANCE_LANE.md §PIVOT.
# Scope: can BIM OOTB earn a real, checkable data-exchange credential — and what does it take.
# PRIME RULE: EXTRACT ONLY. Certification claims are checked by a third party; nothing here may be
#   asserted without a green validator run behind it. Read the log after every run.

## §WHY THIS LANE EXISTS — the finding that redirected us
While researching Malaysian SKATA compliance we checked how Autodesk Revit satisfies local authorities.
**It doesn't. Revit holds no local-authority compliance certification in any jurisdiction** — not SKATA,
not UBBL, not UK Building Regs. Autodesk makes no such claim.

**What Autodesk actually certifies is data-exchange fidelity, via buildingSMART:**
- IFC4 Architectural Reference Exchange — Export
- IFC4 Structural Reference Exchange — Export
- IFC2x3 Coordination View 2.0 — Architecture, Structure, MEP (Export **and** Import)

buildingSMART's certification verifies an application "can reliably import and export files in accordance
with the relevant IFC standard versions." That is a **losslessness** claim, not a regulatory one.

**The conclusion:** the largest BIM vendor on earth, facing every jurisdiction, chose to certify
*"I don't corrupt your data"* and left "is this building lawful" to the practice. That is the defensible
claim a tool can make about itself — and it is the one we currently CANNOT make. Local-authority
compliance stays with the Appointing Party and the Lead Appointed Party; software is never a legal party
to it. So the credential worth chasing is **buildingSMART IFC certification, not "SKATA certified"** —
the latter probably does not exist as a software category.

## §VIABILITY — researched 2026-07-31 (secondary sources; CONFIRM on the official page before planning)
| question | finding |
|---|---|
| Levels | **Global IFC Software Certification** (run by bSI) and **Use Case-based** (run by bSI-accredited third parties) |
| Cost | **The Global service is stated to be freely available to everyone.** Only the press-release announcement carries a small fee |
| Membership required? | not indicated as a prerequisite in what was found — **VERIFY** |
| How you start | self-service: run your own exported IFC through the **bSI validation service**; when you get only green, email `technical@buildingsmart.org` to begin the procedure |

**Read that again: the gate is technical, not commercial.** There is no large fee or committee to satisfy
before starting — you have to produce an IFC that validates clean. That is entirely within our control
and can be attempted immediately.

⛔ **UNVERIFIED, and material:** whether a primarily-*viewing* tool qualifies at all, and which exchange
(Architectural Reference Exchange / Coordination View / etc.) our capability maps to. Certification is
scoped per exchange and per direction (import / export). Confirm before promising anything.

## §WHERE WE ACTUALLY STAND
- **We can write IFC**: `viewer/ifc_export_worker.js` (bim-ootb). Its fidelity is **unmeasured** — the
  existence of an exporter is not evidence it round-trips.
- **We were LOSING data until 2026-07-30.** The extractor discarded 100% of asset classification. A latent
  variant was caught in the same pass: reading only the IFC4 `.Identification` spelling and not the IFC2x3
  `.ItemReference` would make every 2x3 model report as cleanly uncoded — data loss disguised as
  "nobody coded it". See `JKR_SKATA_COMPLIANCE_LANE.md`.
- **The DB is a lossy projection of the IFC** (same file, §THE DB IS A LOSSY PROJECTION). Five separate
  facts were found dropped in one session. **For a certification lane this is the central risk:** anything
  the extractor drops cannot survive a round trip, by construction.

## §STEP 1 — the round-trip losslessness witness (build this first)
The claim Autodesk pays to certify is the claim we cannot currently make. Make it measurable:

**W-IFC-ROUNDTRIP** — import an IFC → export it back → re-import → compare. Report as NUMBERS:
elements in/out, GUIDs preserved/lost, classification codes preserved/lost, relationships preserved/lost,
property sets preserved/lost. **Must show RED first** — given §WHERE WE ACTUALLY STAND it almost certainly
will, and that RED is the point: it is the gap measured instead of assumed.

Do this BEFORE contacting buildingSMART, and before running their validation service — our own witness is
cheaper, faster, and tells us how far off we are without publishing a failure.

## §PHASING
- **P1** — W-IFC-ROUNDTRIP witness, RED baseline recorded. *(no external dependency)*
- **P2** — close the biggest losses the witness names. Expect this to reopen the "extract every IFC
  relationship wholesale" recommendation, since dropped facts cannot round-trip.
- **P3** — run the real bSI validation service on our export; iterate to green.
- **P4** — only then contact `technical@buildingsmart.org`. Decide scope (which exchange, import/export)
  with their guidance rather than guessing.

## §WHAT THIS IS NOT
Not a compliance claim, not a substitute for the SKATA lane, and not a marketing badge to reference before
P3 is green. Until a third party validates our export, the honest statement stays: *we preserve what we
extract, and we measure what we drop.*

## §RELATED
- `prompts/JKR_SKATA_COMPLIANCE_LANE.md` — the parked asset-classification lane this pivoted out of;
  it remains the facilitation layer and is resumable when a real submission lands
- `docs/JKR_SKATA.md` — the audience-facing page

## Sources (secondary — verify on the official pages)
- https://www.buildingsmart.org/compliance/software-certification/ifc/
- https://technical.buildingsmart.org/services/certification/benefits/
- https://help.autodesk.com/cloudhelp/2023/ENU/Revit-DocumentPresent/files/GUID-6708CFD6-0AD7-461F-ADE8-6527423EC895.htm

## §2026-10-08 — validator + IDS facts (primary sources fetched this date)
- **bSI Validation Service** = https://validate.buildingsmart.org/ — open source (MIT, github.com/buildingSMART/validate);
  runs Syntax, Schema and Gherkin-rules checks; bSDD check currently disabled. This is the P3 tool.
- **buildingsmart.org pages return 403 to automated fetch** — the cost/membership rows in §VIABILITY remain secondary-sourced;
  confirm by hand before P4.
- **IDS checking** = an IDS XML (applicability + requirements; facets: entity/predefined type, attribute, classification,
  property/quantity, material, partOf; values exact, enumeration, regex pattern, bounds) run by a checker against an IFC.
  Free checker: **IfcTester** (part of IfcOpenShell; `specs.validate(model)`; reports Console/JSON/HTML/SQLite/ODS/BCF —
  https://docs.ifcopenshell.org/ifctester.html). .NET: Xbim.IDS.Validator (IFC2x3/IFC4/IFC4.3).
  `ifcopenshell` is NOT importable in this machine's system python (checked 2026-10-08) — install before use.
- Recommended order unchanged: P1 W-IFC-ROUNDTRIP first; IDS then states WHAT must survive, the round trip shows WHETHER it did.
- User context 2026-10-07: IFC set → merge → save → reopen works (SQLite round trip, not IFC export); BCF export witnessed
  (`modeller/tests/witness_e2e_bcf.js`).
