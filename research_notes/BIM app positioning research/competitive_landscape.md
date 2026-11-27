# Competitive landscape: single-kernel, local-first, deterministic (no-AI) browser BIM tool (as of 2026-10-02)

Search effort: about 20 web searches/fetches (2026-10-02). Third-party price aggregators (Capterra, SaaSworthy, pricing blogs) were used where vendor pages were not retrievable; all such prices are flagged as third-party estimates, not list prices.

## Big vendors: coverage, pricing, licensing, what they leave to small users

### Takeaway
Incumbents sell separate products per job (author, coordinate/4D, check, construction management, ERP-ish). Prices are subscription based and run from a few hundred to several thousand USD per user per year, with construction-management suites (Procore, ACC) quoted opaquely and scaled to company size. A DIY or small-firm user would need several licences to cover what the BIM Intent Compiler does in one tab. Bentley, Nemetschek dTwin and Trimble Connect 4D were not verified (see Gaps).

### Cited Findings
- Revit standalone subscription: $380/month, $3,005/year, $9,020 for 3 years (third-party aggregator quoting Autodesk list prices); Flex pay-as-you-go also exists — [myarchitectai.com](https://www.myarchitectai.com/blog/revit-pricing); [Autodesk Revit subscription FAQ](https://www.autodesk.com/solutions/revit-subscription-faq)
- AEC Collection (Revit, Navisworks Manage, AutoCAD, 3ds Max, etc.): $460/month or $3,675/year (same aggregator) — [myarchitectai.com](https://www.myarchitectai.com/blog/revit-pricing)
- Autodesk Construction Cloud: pricing not published; typically requires consultants to set up (third-party) — [Constructable](https://constructable.ai/blog/autodesk-construction-cloud-reviews-pricing-alternatives)
- Navisworks Manage: $2,835/year, $355/month, $8,500/3-year (third-party); includes Clash Detective, TimeLiner 4D, quantification; TimeLiner imports MS Project and Primavera P6 schedules — [BIM Tools Hub](https://bimtoolshub.com/autodesk-navisworks); [Autodesk Navisworks help](https://help.autodesk.com/cloudhelp/2026/ENU/Navisworks-Timeliner/files/GUID-D0D36E3D-F1D0-43B6-AB4E-2E7799B340A3.htm); [Bluent CAD](https://www.bluentcad.com/blog/navisworks-simulate-vs-manage)
- Archicad Studio from $201/month ($2,414 upfront 1-year); Collaborate from $237/month ($2,840 upfront); no month-to-month rate; perpetual licences stopped for new customers end of 2024 — [Graphisoft pricing](https://www.graphisoft.com/en-us/pricing/); [renderahouse](https://www.renderahouse.com/blog/archicad-pricing)
- Solibri: Starter from EUR 99/year/licence; Essential from EUR 1,428/year; Advanced from EUR 2,109/year; Solibri Office EUR 1,962/year single user (+VAT) — [Vendr](https://www.vendr.com/marketplace/solibri); Solibri Inside is bundled free in Allplan, Archicad, Vectorworks — [Nemetschek](https://www.nemetschek.com/en/news-media/nemetschek-group-takes-quality-assurance-new-level-release-solibri-inside)
- Tekla Structures: from about $250/month single user (aggregator), includes Trimble Connect Business Premium — [Tekla](https://www.tekla.com/products/trimble-connect/included-with-tekla-structures); [zoftwarehub](https://zoftwarehub.com/products/tekla-structures/pricing)
- Trimble Connect: Business $12.99/user/month, Business Premium $23.95/user/month (aggregator) — [Trimble Connect Australia pricing](https://trimbleconnectaustralia.com.au/pricing/); [Saasworthy](https://www.saasworthy.com/product/trimble-connect/pricing)
- Synchro 4D (Bentley): about $4,280-$4,980/year per licence via resellers; UK GBP 3,571; EUR 4,375 — [Virtuosity](https://in.virtuosity.com/synchro-4d); [Techjockey](https://www.techjockey.com/detail/bentley-synchro); [Bentley product page](https://www.bentley.com/en/products/synchro-4d/)
- Asta Powerproject from about $1,675/user/year (BIM-integrated tier est. about $4,000); Primavera P6 about $2,150-$5,000/user/year; Powerproject noted for 4D BIM integration — [Software Advice](https://www.softwareadvice.com/project-management/powerproject-profile/); [ITQlick](https://www.itqlick.com/compare/asta-powerproject/primavera-p6)
- Procore: priced on Annual Construction Volume; third-party estimates $15k-$80k/year for small to mid GCs — [scanmanifold](https://www.scanmanifold.com/blog-posts/procore-pricing-2026-contractors); [getonecrew](https://www.getonecrew.com/post/procore-pricing)
- Buildertrend: about $339 / $499 / $829 per month across three plans (aggregator) — [costbench](https://costbench.com/software/construction-management/buildertrend/)
- Revit IFC support: import IFC2x3/2x2/2x; IFC4 link only; export IFC4/2x3/2x2 — [Autodesk help](https://help.autodesk.com/cloudhelp/2025/ENU/Revit-DocumentPresent/files/GUID-6708CFD6-0AD7-461F-ADE8-6527423EC895.htm)
- buildingSMART: its implementations list is self-reported and NOT a certified list; Graphisoft holds IFC4 export certification — [buildingSMART technical](https://technical.buildingsmart.org/resources/software-implementations/); [nordicbim](https://www.nordicbim.com/en/insights/best-openbim-software-for-architects-2026-guide)

### Inferences
- Replicating the one-tab feature set with incumbents (author + Navisworks 4D/clash + construction ERP) would cost several thousand USD per user per year plus a setup burden. Inference from the above prices; no vendor publishes a bundled equivalent.
- Incumbents leave to small users: price and licence complexity, opaque quotes, and integration work between separate tools (inference).

### Gaps
- No primary-source pricing for Bentley (other than reseller quotes), Nemetschek dTwin, Allplan, Tekla list price, or ACC. dTwin not found in any result.
- Aggregator prices may differ by region and date; none is a verified vendor list price except where Graphisoft/Autodesk pages were cited.
- Whether Trimble Connect or ACC offer native 4D was not verified.

## Free / cheap / browser viewers and checkers

### Takeaway
Free viewers (BIMcollab Zoom, Dalux, BIM Vision, usBIM, Autodesk Viewer, Bimlyte) cover viewing, measure, sections and BCF issues. Most paid clash and 4D lives in paid tiers or desktop tools. None of the free viewers found offers 4D plus costing plus ERP link. Solibri Anywhere is legacy.

### Cited Findings
- Solibri Anywhere: free IFC viewer with navigation, sections, measurements, property inspection, BCF; limited rule sets in free tier; labelled legacy on 2026-04-13 and no longer developed — [Revizto top viewers](https://revizto.com/resources/blog/top-10-bim-viewers); [ifcnavigator](https://ifcnavigator.com/compare/solibri-anywhere-alternative/)
- BIMcollab Zoom: free viewer opens/federates IFC, BCF, Smart Views; paid adds rule-based clash detection and Smart Issues; paid price EUR 720/year (single licence) per one review; BIMcollab cloud plans EUR 12.50/19/25 per user/month (Capterra) — [BIMcollab free IFC viewer](https://www.bimcollab.com/en/go/free-ifc-viewer/); [Capterra](https://www.capterra.com/p/219241/BIMcollab-Cloud/); [bimsmarter](https://bimsmarter.eu/bimcollab-zoom-gratuit-limites-et-tarifs-2026)
- Dalux BIM Viewer: free; free Field tier limited to 3 active projects; imports clashes from Solibri/Navisworks; 4D/5D not listed among features — [Dalux](https://www.dalux.com/products/bim-viewer/); [Capterra](https://www.capterra.co.il/software/203573/dalux-bim-viewer)
- BIM Vision: freeware (personal and commercial), Windows desktop viewer, IFC2x3/IFC4 — [bimvision.eu](https://bimvision.eu/)
- usBIM.platform (ACCA): viewer free with account, 10 GB cloud storage — [BibLus](https://biblus.accasoftware.com/en/viewing-and-managing-your-project-online-with-the-usbim-viewer/); [Capterra](https://www.capterra.com/p/203088/usBIM-platform/)
- Autodesk Viewer: free browser tool (RVT, DWG, NWD, IFC), 1 GB file limit, needs an Autodesk account — [Autodesk support](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/File-size-limits-of-Autodesk-Viewer.html)
- Bimlyte: free, local-first IFC viewer + BCF manager (WASM, "zero uploads", "no AI"); no automated clash, 4D or cost — [bimlyte.com](https://www.bimlyte.com/)
- xeokit: open source SDK (AGPL-3.0) with measure and plugins; That Open Components: modular open-source client-side IFC; neither is a finished 4D/ERP product — [xeokit.io](https://xeokit.io/); [npm xeokit-sdk](https://www.npmjs.com/package/@xeokit/xeokit-sdk); [That Open overview](https://checktobuild.com/bim-software-with-ifc-js/)
- Speckle: open-source data platform; free tier 1 project/5 models; Starter $39/month; Business from $500/month; viewers free; self-host possible — [Speckle blog](https://speckle.systems/blog/projects-get-a-new-home-and-pricing-plans/); [aecplustech](https://www.aecplustech.com/tools/speckle)
- BEXEL Manager (Slovenia): 3D/4D/5D/6D, clash, QTO, cost, scheduling; starting price EUR 480/year per Capterra, indicative EUR 1,000-2,000 — [BEXEL](https://bexelmanager.com/bexel-manager/); [Capterra](https://www.capterra.com/p/185992/BEXEL-Manager/)

### Inferences
- Free viewers monetize via paid clash/issue tiers and cloud storage, so a free in-browser clash + 4D + measure is a gap in that tier (inference; Bimlyte and IFC Viewer Online claim some client-side tooling, see next section).

### Gaps
- Not verified: Revizto, Trimble Connect, ACC for 4D/clash feature detail; Autodesk Viewer measure/clash capability; usBIM paid-tier detail. A Capterra "from EUR 0.01" price for usBIM looked like a placeholder and was not used.

## Does any product combine viewing + editing + 4D + cost + ERP in one local-first kernel?

### Takeaway
No exact match found, but three adjacent products overlap heavily. The nearest is the user's own bim-ootb project (same author). The strongest independent rival is OpenConstructionERP (self-hosted, 4D/5D, ERP-like, BIM takeoff, clash) but it is a Python/Postgres server stack with LLM features, not a deterministic no-AI single browser kernel. Bonsai (Blender) covers authoring, scheduling, cost on the desktop. Search effort: about 8 queries across product directories and GitHub; "none found" is a limited-effort claim, not proof of absence.

### Cited Findings
- OpenConstructionERP: open source (AGPL-3.0, commercial licence available), BOQ editor, 120k+ cost items, CAD/BIM takeoff (RVT, IFC, DWG, DGN), 4D scheduling, 5D cost, 3D viewer with clash detection, offline-capable, desktop/pip/Docker installs, Python/FastAPI + React + PostgreSQL, 885 stars, supports 20+ LLM providers for AI estimation — [GitHub](https://github.com/datadrivenconstruction/OpenConstructionERP); [site](https://openconstructionerp.com/)
- Bonsai (Blender add-on, free/open source): native IFC authoring, drawings, auditing, cost planning, construction scheduling, plus web interface for gantt charts and cost plans (v0.8.0); "Bonsai Web" view-and-share listed as "coming soon" — [BlenderNation](https://www.blendernation.com/2024/09/01/bonsai-previously-blenderbim-add-on-v0-8-0-adds-blender-4-2-and-much-more/); [bonsaibim.org](https://bonsaibim.org/); [IfcOpenShell docs](https://docs.ifcopenshell.org/bonsai.html)
- That Open Company: announced a browser-based IFC-native modeler (Clay) in March 2024 targeted for summer 2024; no shipped-status confirmation found — [Blender 3D Architect](https://www.blender3darchitect.com/bim/ifc-native-web-based-modeler-free-and-open-source/)
- BIMROCKET: open-source platform to view, analyze and edit IFC in the browser — [bimrocket.org](https://bimrocket.org/) (via search snippet)
- BIMCompiler repo: MIT, browser viewer with clash detection, offline via service worker, op-log ERP kernel, SQLite, Java compiler pipeline — [GitHub BIMCompiler](https://github.com/red1oon/BIMCompiler)
- bim-ootb independent summary: described as browser-native IFC viewer + local-first ERP kernel; 4D time machine, 5D with 17 country rate templates; "alpha, not for production" — [GitHub bim-ootb](https://github.com/red1oon/bim-ootb) (search snippet; same author as the project under study, so not independent)

### Inferences
- Differentiators that survived this search: (a) deterministic no-AI as an explicit position (only Bimlyte also states "no AI", but it has no 4D/cost; OpenConstructionERP leans on LLMs); (b) one browser tab with no server (OpenConstructionERP needs a local Postgres/FastAPI process); (c) the same operation log feeding BIM and ERP. Inference from the sources above.
- Where it does NOT differ: Bonsai and OpenConstructionERP already offer free/open 4D + 5D; BEXEL offers mature 4D/5D at about EUR 1-2k/year; Navisworks already has TimeLiner/clash.

### Gaps
- Could not verify OpenConstructionERP, Bonsai or That Open feature depth beyond their own pages (no independent reviews found).
- Did not exhaustively search Chinese, Japanese or Korean markets, or niche 5D tools (CostX, Vico, Kreo).

## Browser, no-install tool vs desktop incumbents

### Takeaway
Browser tools win on zero install, zero upload (privacy), and cost; they lose on large federated models (browser memory), authoring depth, native format fidelity and enterprise support. Sources are mostly vendor/blog commentary, so treat the numbers as indicative.

### Cited Findings
- Browser viewers are RAM-bound and workable to roughly 300 MB on a typical desktop; heavier federated models suit desktop viewers (vendor blog) — [Revizto top viewers](https://revizto.com/resources/blog/top-10-bim-viewers); [Resolve](https://www.resolvebim.com/blog/large-bim-model-lag-causes)
- Loading large IFC in a browser can need over 4.5 GB with naive methods (about 1.7 GB optimised); JS string limit 1 GB; culling/tiling can make 1 GB IFC usable — [Springer VCIBA](https://vciba.springeropen.com/articles/10.1186/s42492-019-0011-z); [AlterSquare](https://altersquare.io/1gb-ifc-files-usable-browser-culling-tiling-compression/)
- Autodesk Viewer caps files at 1 GB — [Autodesk support](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/File-size-limits-of-Autodesk-Viewer.html)
- Revit imports IFC2x3 but IFC4 only as link, so IFC round-trip into Revit is lossy by design — [Autodesk help](https://help.autodesk.com/cloudhelp/2025/ENU/Revit-DocumentPresent/files/GUID-6708CFD6-0AD7-461F-ADE8-6527423EC895.htm)
- BIMCompiler's own claims (not independently verified): 126K-element buildings, 2-3 s render, 95% mesh deduplication — [GitHub BIMCompiler](https://github.com/red1oon/BIMCompiler)

### Inferences
- Native Revit/ArchiCAD fidelity (families, parametrics, worksharing) cannot be matched via IFC metadata alone; the tool is best as an IFC-in assembler/checker/estimator, consistent with its "authoring stays in Revit/ArchiCAD" strategy (inference).
- Enterprise trust gaps: no vendor SLA, no SOC2-type attestation was found for any open tool surveyed; MIT licence and local-first processing partly offset this for privacy-sensitive users (inference). Both open rivals and this project are flagged alpha/unproven by their own pages or third-party summaries.
- Best-effort output with a margin of error is a trust cost versus Navisworks/Synchro, which are accepted in contracts (inference).

### Gaps
- No independent benchmark of browser vs desktop on the same IFC was found.
- No sourced market-share data; none is claimed here.
- No reviewer data (G2, AEC Magazine, BIMplus) specifically on small-firm adoption of browser BIM tools was retrieved.
