# BIM Intent Compiler — Documentation Index

Single-page entry point. All active docs by tier.

---

## BIM5D

| Doc | What |
|-----|------|
| [4D5DAnalysis.md](4D5DAnalysis.md) | **4D/5D from extracted DB in 2 seconds.** LTU: 224 tasks + RM 67M costed. Industry value tiers, bankable finance model path |
| [LTUAHouseAnalysis.md](LTUAHouseAnalysis.md) | **Largest reference building.** 125,997 elements, 8 disciplines, 232MB DB. Smooth in Bonsai |
| [Enterprise.md](Enterprise.md) | FederatedModel Enterprise Platform: nD dimensions (4D-8D), Preview Mode, competitive comparison |
| [RevitParity.md](RevitParity.md) | **The long tail the big tools over-serve.** Witness-claim-first specs: Find-as-filter, room color-fill, solar hours, MEP trace, egress code-check, cited-coefficient heat loss, gbXML export. Geometric/graph = own it; solver-class = export |

## T0 Governing — Read First

| Doc | What |
|-----|------|
| [MANIFESTO.md](MANIFESTO.md) | **READ FIRST:** The ERP world view — why construction is manufacturing, iDempiere pattern, three concerns |
| [ProjectOrderBlueprint.md](ProjectOrderBlueprint.md) | FRONTIER: §1-§14 future features, §2.1 CTFL test plan, §2.2 site layout, §14 implementation sessions |

## Last Mile — Proof & Gap Closure

| Doc | What |
|-----|------|
| [MigrateComparisonPaper.md #status](MigrateComparisonPaper.md#status) | **The migration honesty panel** — 4 states at a glance: 🟢 folds-to-the-cent today · 🟠 extraction gap (fold proven, data unwired) · 🔴 fold gap (capability unbuilt) · 🔵 deleted-by-architecture (ZK/ORM/server — no counterpart). The prominent answer to "what's NOT in the new iDempiere experience?" |
| [ERPRosettaStone.md](ERPRosettaStone.md) | **iDempiere Java → Fold Engine dictionary** — for the legacy dev: `PO.get/set/save`, `Query`, `MOrder.completeIt()`, `Doc_Order` mapped one-to-one to the op-log + AD-as-data fold. The "how the code works" home so the paper can link out instead of inlining mechanism. |
| [GapClosureSpec.md](GapClosureSpec.md) | **How a coverage gap becomes oracle-equivalent** — the method that governs `prompts/GAP_CLOSURE_LANE.md`: oracle protocol, §FALSIFIER law, gap taxonomy, per-gap Definition-of-Done. A row flips ⛔/🟡→✅ only on a real `maxDiff=0c` diff. |
| [ShipYard.md](ShipYard.md) | **Domain-agnostic treatise:** marine hulls, tunnels, earthworks, industrial plant — same engine, different data |
| [TestArchitecture.md](TestArchitecture.md) | G1-G6 gates, tamper seal, traceability matrix, 35 Rosetta Stones |

## T1 Foundation — Master References

| Doc | What |
|-----|------|
| [BOMBasedCompilation.md](BOMBasedCompilation.md) | MASTER SPEC: tack, walker, BUFFER, compilation model |
| [DATA_MODEL.md](DATA_MODEL.md) | Schema reference, tack columns, 4-DB architecture |
| [BIM_COBOL.md](BIM_COBOL.md) | Verb grammar, 77 verbs, TILE/CLUSTER/ROUTE/FRAME/FORGE |
| [ACTION_ROADMAP.md](ACTION_ROADMAP.md) | Navigation hub: "I need to..." → spec pointer. Known debt. Go-to-market |
| [SourceCodeGuide.md](SourceCodeGuide.md) | Code navigation, entry points, DAO patterns, glossary |

## T2 SRS — Requirement Specifications

| Doc | What |
|-----|------|
| [BIM_Designer_Browser.md](BIM_Designer_Browser.md) | **BIM OOTB — Browser Edition.** Zero-install viewer + nD analytics. Two DBs, one HTML, no server. Proven at 126K elements (S200) |
| [G4_SRS.md](G4_SRS.md) | output.db (compile DB), master-detail DocStatus, AP gate |
| [DocAction_SRS.md](DocAction_SRS.md) | processIt() lifecycle (DR→IP→CO→AP), discipline routing |
| [DocValidate.md](DocValidate.md) | **Spatial + regulatory rule symbiosis** (§0), AD_Val_Rule, 3-tier validation, jurisdiction packs (9 countries), mining pipeline |
| [DISC_VALIDATE_SRS.md](DISC_VALIDATE_SRS.md) | Multi-discipline BOM tree, LOD resolution, handlers H1-H6 |
| [ASSEMBLY_BUILDER_SRS.md](ASSEMBLY_BUILDER_SRS.md) | G-7 SRS: layer-by-layer TACK, U-value calc, 17 witnesses |
| [CALIBRATION_SRS.md](CALIBRATION_SRS.md) | DocEvent generic vs Terminal, density/spacing comparison |
| [DISC_VALIDATION_DB_SRS.md](DISC_VALIDATION_DB_SRS.md) | ERP.db: schema, cross-DB references, AD_Org disciplines, 3-stage validation, discipline recipes, routing architecture |
| [INFRA_DESIGNER_SRS.md](INFRA_DESIGNER_SRS.md) | Infra Designer: terrain, alignment, 5 phases I-1..I-5 |
| [TIER1_SRS.md](TIER1_SRS.md) | 6D carbon, 7D FM, audit trail, 3D native |
| [BACK_OFFICE_SRS.md](BACK_OFFICE_SRS.md) | BackOffice HTTP server, SessionManager, portfolio |
| [EYES_SRS.md](EYES_SRS.md) | BIMEyes geometric comprehension engine, 26 proofs, shape/compare/diff |
| [FORGE_SUITE_SRS.md](FORGE_SUITE_SRS.md) | **Forge Suite:** parametric computation (6 parts), proprietary gap analysis, fabrication data, compliance-as-you-design |
| [GEOMETRY_FORGE_SRS.md](GEOMETRY_FORGE_SRS.md) | ForgeEngine detail: interface, 6 engines (5 starter + RebarCageForge), formula-as-metadata |
| [GENERATIVE_HOUSE_SRS.md](GENERATIVE_HOUSE_SRS.md) | Generative compilation: BOM explosion, selection cascade, DemoHouse |
| [REPORTING_ENGINE_SRS.md](REPORTING_ENGINE_SRS.md) | Report templates: BOM schedule, cost summary, schedule, compliance |
| [STANDARDS_COMPLIANCE_SRS.md](STANDARDS_COMPLIANCE_SRS.md) | Regulatory proof engine: SC certificates, jurisdiction compliance |

## T3 Analysis — Rosetta Stone Guardrails

| Doc | What |
|-----|------|
| [SampleHouseAnalysis.md](SampleHouseAnalysis.md) | SH guardrails, hello-world proof |
| [DuplexAnalysis.md](DuplexAnalysis.md) | DX mirror algorithm, partition, MEP symmetry |
| [TerminalAnalysis.md](TerminalAnalysis.md) | 48K-element TE, verb factorization, guardrails |
| [FZKHausAnalysis.md](FZKHausAnalysis.md) | FK (FZK Haus) 82-element residential |
| [ACInstituteAnalysis.md](ACInstituteAnalysis.md) | IN (AC Institute) 699-element institutional |
| [DemoHouseAnalysis.md](DemoHouseAnalysis.md) | DM guardrails: 3-OrderLine compilation, SH base + FK roof + FP discipline |
| [InfrastructureAnalysis.md](InfrastructureAnalysis.md) | Infrastructure IFC4X3, FACILITY/SEGMENT mapping |
| [LTUAHouseAnalysis.md](LTUAHouseAnalysis.md) | **LTU A-House — largest reference building.** 125,997 elements, 8 disciplines, 232MB DB. Smooth in Bonsai (13.6GB RAM, 3s select). Extraction, verification, performance, MEP outlier analysis |

## T4 Guides — User-Facing

| Doc | What |
|-----|------|
| [USER_GUIDE.md](USER_GUIDE.md) | Unified landing — two doors (BIM viewer / ERP) |
| [BIMUserGuide.md](BIMUserGuide.md) | Browser BIM viewer — quick start, controls, DSL reference, keyboard cheat-sheet |
| [ERPUserGuide.md](ERPUserGuide.md) | iDempiere browser ERP — login → install → POS → reporting |
| [BackOfficeUserGuide.md](BackOfficeUserGuide.md) | BackOffice user guide |
| [BIM_Designer_UserGuide.md](BIM_Designer_UserGuide.md) | BIM Designer GUI user guide (deprecated — §15 keyboard ref absorbed into BIMUserGuide) |
| [SYSTEMS_INSTALLER_GUIDE.md](SYSTEMS_INSTALLER_GUIDE.md) | Full platform setup for sysadmins and developers |
| [Localization.md](Localization.md) | **Localization:** iDempiere-style `_TRL` locale system — 15 country locales, project-level rate book override, developer guide for new locales |

## Spatial ERP — Beyond Buildings

| Doc | What |
|-----|------|
| [SpatialERP_OOTB.md](SpatialERP_OOTB.md) | **Spatial ERP OOTB:** Every record has a place. WMS, POS, MFG, logistics, back-office — same engine, same five tables, swipe UX, zero install |
| [SpatialERP_POC.md](SpatialERP_POC.md) | **Construction ERP POC:** First build. Land lead → FAR → BOQ → Approval. Real requirement (Sysnova/Kazi Farms). IFC = spatial view. 6 roles. erp.html standalone. |

## Standalone — Market / Academic

| Doc | What |
|-----|------|
| [BIMERPPaper.md](BIMERPPaper.md) | Academic paper: BIM as ERP |
| [EnablingTechTimeline.md](EnablingTechTimeline.md) | Dated, cited enabling-tech record: what moved when (sql.js 2014, three.js r166 Jul 2024, OPFS layer routed-around), two compasses (BIM tech-gated vs ERP idea-gated), first-mover margin |
| [LocalFirstPriorArt.md](LocalFirstPriorArt.md) | How Replicache/ElectricSQL/PowerSync/LiveStore/CRDTs do sync+security, their documented weaknesses, and our workarounds (deterministic verbs = one kernel both sides). Companion to ERP.md §0.20 |
| [DistributedERP.md](DistributedERP.md) | Tested contention map: physics-partitions-data (branch→van→box), guard set, 90/10 + one-way-circle, the one customer-entitlement op-class (URL-issue→phone-carry→touch/reconcile→ledger), determinism-as-infrastructure, accounting-as-reconciler. Backbone of the secured phase |
| [SPATIAL_COMPILATION_PAPER.md](SPATIAL_COMPILATION_PAPER.md) | Academic paper: Deterministic spatial compilation — 0.002mm verified, cross-domain (protein/robotics). *Along the way, we wrote to the Nobel Prize Committee for Physics.* |
| [StrategicIndustryPositioning.md](StrategicIndustryPositioning.md) | Market positioning, 4 moats, IFC scorecard |
| [BIM_Compiler_Market_Impact_Report.pdf](BIM_Compiler_Market_Impact_Report.pdf) | Market impact: USD 10B BIM market, MY mandate, go-to-market timeline, risk assessment |
| [TheRosettaStoneStrategy.md](TheRosettaStoneStrategy.md) | Why real buildings are ground truth: deterministic proofs, no AI in gates |

## Companion Projects — Spatial Extensions

| Doc | What |
|-----|------|
| [PDF_TERRAIN.md](PDF_TERRAIN.md) | Survey to 3D terrain: PDF → elevation points → IFC. Site topology for plot placement |
| [2D_LAYOUT.md](2D_LAYOUT.md) | Architectural drawings from compiled BOM: floor plans, elevations, sections as SVG |

## Operational — Reference

| Doc | What |
|-----|------|
| [BIMLogger.md](BIMLogger.md) | Levelled pipeline logging spec, grep patterns |
| [WorkOrderGuide.md](WorkOrderGuide.md) | Pipeline config, discipline mapping |
| [BlenderBridge.md](BlenderBridge.md) | Java-smart/Python-dumb pipe |
| [PREFAB_ARCHITECTURE.md](PREFAB_ARCHITECTURE.md) | 6-level assembly hierarchy, MRP BOM drop |
| [BIM_Designer.md](BIM_Designer.md) | GUI, ASI, 4-action persistence, Design Mode |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment procedures |
| [IFC_ONBOARDING_RUNBOOK.md](IFC_ONBOARDING_RUNBOOK.md) | Self-service IFC onboarding: 8-step pipeline, template generator |

## Database — Schema & ERDs (`database/`)

| Doc | What |
|-----|------|
| [DATABASE_SCHEMA.md](https://github.com/red1oon/BIMCompiler/blob/master/database/DATABASE_SCHEMA.md) | Full table inventory: purpose, Java access, review status |
| [bim_architecture_viz.html](https://github.com/red1oon/BIMCompiler/blob/master/database/bim_architecture_viz.html) | Interactive ERD: clickable 4-DB tables, compilation pipeline, BOM tree |

## Archived

Superseded docs live in `docs/archive/`. Key archived docs:

| Doc | Superseded by |
|-----|---------------|
| `DEVELOPER_GUIDE.md` | [SourceCodeGuide.md](SourceCodeGuide.md) (DAO patterns merged) |
| `BIMasBOMConcept.md` | [BBC.md](BOMBasedCompilation.md) §1 (dimension model merged) |
| `ConstructionAsERP.md` | Content distributed: [MANIFESTO.md](MANIFESTO.md) §2 (entity registry) + [BBC.md](BOMBasedCompilation.md) §1 (iDempiere mapping) + [DATA_MODEL.md](DATA_MODEL.md) §1 (4-DB) + [ACTION_ROADMAP.md](ACTION_ROADMAP.md) (gaps) |
| `VerbPatternArchitecture.md` | [BIM_COBOL.md](BIM_COBOL.md) §19 (verb detection, formats, results merged) |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
