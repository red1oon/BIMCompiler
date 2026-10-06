# Credibility signals and interoperability features for a new open BIM tool (research as of 2026-10-02)

## buildingSMART certification and Validation Service

### Takeaway
buildingSMART runs IFC import and export certification (IFC2x3, IFC4, IFC4.3), with export largely automated through the Validation Service and import based on public test files plus human-judged checks. Published cost figures conflict, and the only primary-looking evidence (OSArch 2020) says open-source tools skipped it on cost and perceived value. The free Validation Service is the cheap, self-serve credibility signal.

### Cited Findings
- Certification is split into export and import and covers IFC 2x3, IFC 4 and IFC 4.3. Export is largely automated via the Validation Service; import uses public test files and answered quality questions. — [buildingSMART IFC certification (via search summary; page returned 403 on fetch)](https://www.buildingsmart.org/compliance/software-certification/ifc/)
- Import certification has 15 minimum test criteria (numbered 0-14), run on a minimal set of 9 IFC models: visualization/geometry, geo-positioning, spatial hierarchy, materials, properties, quantities, classifications, assemblies/groups/systems/spaces, and road surfaces/markings (IFC4.3 only). Every criterion must be Pass or Partial Pass; any Fail disqualifies. Partial Passes are named in the certificate report. — [buildingSMART Sample-Test-Files import-certification.md](https://github.com/buildingSMART/Sample-Test-Files/blob/main/import-certification.md)
- Import tests are not secret. Anyone can run them on the public files, and import needs human judgment, unlike automated export testing. (Léon van Berlo, 2025-05-16; the article gives no costs or vendor list.) — [Léon van Berlo, IFC import certification](https://leonvanberlo.substack.com/p/ifc-import-certification)
- The public test files are in buildingSMART/Sample-Test-Files (IFC 2x3 TC1, IFC4 ADD2 TC1, IFC4.3 ADD2). A separate community repository exists, but its files are NOT official, and most fail the Validation Service. — [Sample-Test-Files repo](https://github.com/buildingSMART/Sample-Test-Files); [Community-Sample-Test-Files](https://github.com/buildingsmart-community/Community-Sample-Test-Files)
- Costs, 2020 (OSArch): about 11,000 EUR for platform access, 25,000 EUR to begin import plus 3,000 EUR per test run, 27,000 EUR for export. Moult estimated about 50,000 EUR for a few tries at one MVD. Neither FreeCAD nor BlenderBIM pursued certification, citing cost. Several participants called certification "poor value". The alternative was community MicroMVDs and test suites. — [OSArch: BlenderBIM IFC Certification (Aug 2020)](https://community.osarch.org/discussion/152/blenderbim-ifc-certification)
- A search-engine summary quoted import 1,500 EUR and export 2,500 EUR per IFC version per tool. I could not trace it to a fetchable primary page, and it conflicts with the 2020 figures. Treat it as UNVERIFIED. — [search summary referencing buildingSMART programme page](https://www.buildingsmart.org/compliance/software-certification/); contradicted in scale by [OSArch 2020](https://community.osarch.org/discussion/152/blenderbim-ifc-certification)
- Validation Service (validate.buildingsmart.org) is free and online. It checks:
  - STEP syntax (ISO 10303-21);
  - IFC schema for IFC2X3, IFC4 and IFC4X3_ADD2 (attributes, cardinality, inverses, WHERE and global rules);
  - normative Implementer Agreements and Informal Propositions;
  - non-normative Industry Practices (warnings only);
  - bSDD compliance (disabled as of v0.6.6).
  It accepts non-zipped .ifc files up to 256 MB. It does NOT check project-, national- or organisation-specific rules. — [Validation Service user guide](https://buildingsmart.github.io/validate/user/index.html); [buildingSMART Validation Service page](https://www.buildingsmart.org/users/services/validation-service/)
- The Validation Service guide mentions no certificate or badge. — [user guide](https://buildingsmart.github.io/validate/user/index.html)
- Export certification submits IFC through the Validation Service, and buildingSMART collects anonymous quality data from uploaded files. — [IFC certification page (search summary)](https://www.buildingsmart.org/compliance/software-certification/ifc/)
- Weight with professionals: IfcOpenShell/Bonsai is widely used but is not on the certified list, and the OSArch thread attributes that to cost. — [OSArch](https://community.osarch.org/discussion/152/blenderbim-ifc-certification)

### Inferences
- A solo, low-budget project should skip paid certification for now. Instead it should publish Validation Service results for every IFC it exports (inference).
- It should also publish its own results against the 15 public import criteria and the 9 test models, labelled "self-assessed, not certified" (inference).
- The public import criteria are an unusually good fit as a credibility checklist, because the tests are open and the scoring is Pass/Partial/Fail.

### Gaps
- Current (2026) fees and any open-source or academic waiver could not be verified. buildingSMART pages returned 403, and the sources conflict (2020 figures vs the unverified 1,500/2,500 EUR figures).
- Whether certification requires buildingSMART membership: not confirmed.
- No data found on how many professionals actually weigh certification. Only the anecdotal OSArch "poor value" opinion.

## Interoperability standards: table stakes vs nice-to-have

### Takeaway
IFC import/export validity, IDS and BCF are the standards with explicit buildingSMART status and community demand, so they are the most defensible for a viewer/checker. 4D interchange with P6/MS Project is feasible via IFC (IfcWorkSchedule/IfcTask) and exists in open-source tooling, so it is a differentiator rather than table stakes.

### Cited Findings
- IDS v1.0 became a final buildingSMART standard on 2024-06-04. It is strictly tied to the IFC schema, aims at identical results in all checking software, and is designed for ISO 19650 delivery checks. — [buildingSMART IDS v1.0 final](https://www.buildingsmart.org/information-delivery-specification-ids-v1-0-is-approved-as-a-final-standard/); [IDS standard page](https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/)
- IDS survey 2026: 70% of respondents want some form of IDS software certification (59% for authoring, 59% for checking, 48% both). — [IDS survey results](https://www.buildingsmart.org/ids-survey-results-2026/) (via search summary)
- IfcOpenShell's IfcTester creates IDS files and validates IFC against them. Its reports link to IfcOpenShell's BCF package. — [IDS standard page / search summary](https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/); [IfcOpenShell BCF docs](https://docs.ifcopenshell.org/bcf.html)
- BCF has two forms: BCF-XML (file-based) and BCF-API (RESTful, part of the OpenCDE API family, v3.0 based on v2.1). — [buildingSMART/BCF-API](https://github.com/buildingSMART/BCF-API); [BCF-XML](https://github.com/buildingSMART/BCF-XML)
- Open-source 4D: ifc4d (IfcOpenShell) converts MS Project and Primavera P6 XML/XER to IFC, and IFC back to these formats. Vendor schemas differ from IFC and need per-vendor tweaking. — [ifc4d on PyPI](https://pypi.org/project/ifc4d/); [OSArch 4D thread](https://community.osarch.org/discussion/160/construction-project-planning-and-cost-scheduling-blenderbim-and-charonifc/p3)
- IfcWorkSchedule controls tasks and resources via IfcRelAssignsToControl, and carries start/finish and total float. — [IFC4.3 IfcWorkSchedule](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcWorkSchedule.htm)
- Quantities are carried by IfcElementQuantity, assigned through IfcRelDefinesByProperties. A "Quantity Take-off add-on" view exists for base quantities. — [IFC4.3 IfcElementQuantity](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcElementQuantity.htm); [IFC4 MVD quantity sets](https://standards.buildingsmart.org/MVD/RELEASE/IFC4/ADD2_TC1/RV1_2/HTML/schema/templates/quantity-sets.htm)
- COBie is an MVD based on IFC2x3 and IFC4. — [Wikipedia: COBie](https://en.wikipedia.org/wiki/COBie)
- IFC4.3 import certification includes road surfaces/markings. — [import-certification.md](https://github.com/buildingSMART/Sample-Test-Files/blob/main/import-certification.md)
- The 2026 openBIM Hackathon (Porto) used IFC, BCF, bSDD and IDS as its standards set. — [openBIM Hackathon Porto 2026](https://www.buildingsmart.org/openbim-hackathon-porto-2026/)

### Inferences
- Table stakes for a viewer/checker: valid IFC read, no silent data loss, IDS check, and BCF in/out. This is my judgement from the standards' status and the IDS survey; no source ranks the standards.
- Nice-to-have: bSDD (the validation check is itself disabled), COBie, IFC4.3 infrastructure (unless targeting roads/rail), and the OpenCDE BCF-API.
- Differentiators for this tool: 4D export to P6/MSP via IfcWorkSchedule/IfcTask, plus IfcElementQuantity round-trip for the live cost projection. I found no source on how well IfcCostSchedule is supported in practice.

### Gaps
- No source ranking which standards BIM professionals treat as mandatory in a viewer. The ranking above is inference.
- No evidence found on IfcCostSchedule adoption.
- Whether BCF has a buildingSMART certification programme: not found.

## Browser performance on large IFC

### Takeaway
web-ifc is bounded by the 32-bit WASM memory ceiling, with files of about 2.5 GB crashing the importer. The proven pattern for large models is convert once to a compact binary (xeokit XKT, That Open Fragments, Speckle server-side) rather than parse raw IFC per session.

### Cited Findings
- web-ifc/Fragments `IfcImporter.process()` crashes on a ~2.5 GB Revit hospital IFC. WASM32 memory cannot grow beyond 4,294,901,760 bytes, and chunked input and a higher MEMORY_LIMIT did not help (web-ifc 0.0.77, fragments 3.4.6). I saw no maintainer response in the excerpt. — [ThatOpen/engine_fragment#258](https://github.com/ThatOpen/engine_fragment/issues/258)
- The web-ifc benchmark (Apple M1, 8 GB) covers 32 files. The largest is a 34 MB ifczip that opens in 1,134 ms (7,623 ms total). Peak 60,285 meshes in one file, 3.36M+ entities, zero errors. The benchmark gives no date or version. — [web-ifc benchmark.md](https://github.com/ThatOpen/engine_web-ifc/blob/main/benchmark.md)
- That Open docs: loading raw IFC at runtime is too slow for production, so convert once to Fragments. A 2 GB IFC becomes an 80 MB Fragments file, and Fragments claim 60 fps on millions of objects. These are vendor claims. — [That Open docs](https://docs.thatopen.com/fragments/getting-started) (via search summary)
- xeokit: a 49 MB IFC (Schependomlaan) converts to a 1.5 MB XKT that loads in about 2-3 s. The SDK has chunked streaming and caching modules. These are vendor claims. — [xeokit.io](https://xeokit.io/); [xeokit SDK](https://xeokit.github.io/sdk/docs/api/)
- Speckle raised its IFC importer limit from 100 MB to 1 GB, processing server-side. Instancing optimisation cut a 4.7 GB model to 624 MB. — [Speckle: increased file size limit](https://speckle.systems/updates/new-file-importers-and-increased-file-size-limit/); [Speckle: optimized IFC models](https://speckle.systems/updates/optimized-ifc-models-for-faster-loading/)
- The buildingSMART Validation Service caps uploads at 256 MB. — [Validation Service page](https://www.buildingsmart.org/users/services/validation-service/)
- Third-party claim that models up to ~300 MB work well on desktop with a warning above 150 MB. This is a commercial viewer blog, low-quality. — [ifcfiles.com](https://ifcfiles.com/blog/best-free-ifc-viewers)

### Inferences
- Publishing a measured size/time/RAM table for the tool's own buildings, plus its own stated ceiling, would match how the leading viewers disclose limits.
- Because the tool compiles from IFC metadata to a database, a pre-processed-artefact story is credible, but only if the cost of the initial conversion is stated.

### Gaps
- No independent head-to-head benchmark (xeokit vs web-ifc vs Speckle) found. All numbers are vendor- or issue-reported on different hardware.

## Trust and validation features pros expect

### Takeaway
The strongest cited trust mechanisms are: public test files, third-party validation of exported IFC, and explicit partial-pass/limitation reporting, which is what buildingSMART's own scheme does.

### Cited Findings
- buildingSMART's own scheme reports Partial Passes explicitly, with notes explaining each. — [import-certification.md](https://github.com/buildingSMART/Sample-Test-Files/blob/main/import-certification.md)
- The Validation Service separates errors (normative) from warnings (industry practice) and hides passes by default. — [user guide](https://buildingsmart.github.io/validate/user/index.html)
- IfcOpenShell/Bonsai's alternative to certification is community MicroMVDs and test suites. — [OSArch](https://community.osarch.org/discussion/152/blenderbim-ifc-certification)
- The Léon van Berlo piece argues that import is "often the first real interaction a user has with openBIM". — [van Berlo](https://leonvanberlo.substack.com/p/ifc-import-certification)

### Inferences
- Pros would expect (inference, no source ranks these): an import report listing skipped or unsupported entities, a stated tolerance on computed quantities and costs, reproducible runs with a deterministic hash, and an audit trail. The tool's deterministic compile and §-logs map onto this directly.
- The tool should run buildingSMART sample files through itself and publish the pass/partial/fail table.

### Gaps
- No academic IFC interoperability study was fetched in this pass. Data-loss and round-trip fidelity findings are therefore uncited.

## Community and adoption mechanics

### Takeaway
buildingSMART offers low-cost visibility venues (hackathon, annual openBIM Awards with Technology and Research categories), and OSArch is the main open-source community. Open-source credibility there rests on public code and valid IFC rather than paid stickers.

### Cited Findings
- openBIM Hackathon, Porto, 22-24 March 2026. 48 hours, using IFC, BCF, bSDD and IDS, with a 1,000 EUR overall prize. The "BCF Time Machine" team built an open-source bSDD material-matching tool. — [buildingSMART Porto 2026](https://www.buildingsmart.org/openbim-hackathon-porto-2026/); [first Porto hackathon complete](https://www.buildingsmart.org/the-first-buildingsmart-openbim-hackathon-in-porto-is-complete/)
- The openBIM Awards 2026 have 9 categories including Technology, Professional Research and Student Research. 22 finalists were announced across seven categories. — [openBIM Awards program](https://www.buildingsmart.org/openbim-awards-program/); [2026 finalists](https://www.buildingsmart.org/buildingsmart-international-announces-finalists-for-the-2026-openbim-awards/)
- OSArch is an umbrella community of Blender, FreeCAD and openBIM users and developers. It names poor UI and compatibility as the adoption obstacles, and says publicly available source code is itself proof of seriousness. — [OSArch community](https://community.osarch.org/); [AEC Magazine](https://aecmag.com/collaboration/native-openbim-and-the-rise-of-open-source-in-aec/)
- The OSArch thread "Towards 100% support of all OpenBIM standards" exists and is relevant to how the community frames standards coverage. — [OSArch thread](https://community.osarch.org/discussion/567/towards-100-support-of-all-openbim-standards)

### Inferences
- A solo tool can gain credibility by:
  - posting on OSArch and the buildingSMART forums;
  - entering the openBIM Awards Technology category;
  - submitting to the next hackathon.
  These venues are cited, but the effect on trust is not measured by any source.
- Generic OSS signals (CHANGELOG, CI badge, SECURITY.md, licence clarity, contributor list, docs) are standard practice. I found no BIM-specific source ranking them. They are inference.

### Gaps
- No source on university/chapter adoption mechanics for individual tools.
- No data on the effect of the awards or hackathon on tool adoption.

## Prioritized credibility checklist (synthesis; ranking is inference)
1. Run the tool's exported IFC through the Validation Service and publish the reports. (Free; cited.)
2. Self-assess against the 15 public import criteria on the 9 official test files, with an honest pass/partial/fail table (cited process, self-assessment is inference).
3. Import report: list skipped/unsupported entities and any data loss on every load.
4. IDS import and check, plus BCF export (standards with final status and survey demand).
5. A published size/time/RAM table and stated file-size ceiling, noting the web-ifc 32-bit WASM ceiling.
6. 4D export via IfcWorkSchedule/IfcTask, with P6/MSP converters (ifc4d prior art), disclosed as a differentiator.
7. Community: OSArch post, hackathon, openBIM Awards Technology category.
8. OSS hygiene: CI, changelog, security policy, licence (inference).
9. Paid buildingSMART certification: defer. Cost is unverified and OSArch judged it poor value.
