# Adoption paths of comparable open-source / indie BIM projects (as of 2026-10-02)

Method note: ~17 tool calls (web search + fetch). Some "Cited Findings" come from search-engine summaries of the linked page rather than a full page read; those are tagged (search-summary). GitHub star counts were read live from the GitHub REST API on 2026-10-02 (https://api.github.com/repos/<owner>/<repo>). No star/funding number appears here without a source.

## 1. Origin, licence, funding model and documented adoption signals per project

### Takeaway
The two projects with the widest community pull (IfcOpenShell/Bonsai, IFC.js/That Open) started from one person's side project and were funded by a mix of small donations, one-off grants and (later) a company layer. Speckle and xeokit took the company/dual-licence route. None of the open-source-only projects found has donation income that replaces a salary-scale team. Bonsai's own page states it is "primarily volunteer-driven".

### Cited Findings
**IfcOpenShell / Bonsai (BlenderBIM)**
- IfcOpenShell was started in 2011 by Thomas Krijnen; the BlenderBIM Add-on was launched in 2019 by Dion Moult — [opensource.construction/projects/bonsai](https://opensource.construction/projects/bonsai/)
- BlenderBIM began 29 Aug 2019 with 83 lines of code showing Blender geometry exported to IFC (search-summary) — [Dion Moult LinkedIn](https://www.linkedin.com/posts/dion-moult-3517651a_openbim-opensource-ifcopenshell-activity-6972331582489604096-X4e0)
- Licences: IfcOpenShell repo LGPL-3.0 (GitHub API: https://api.github.com/repos/IfcOpenShell/IfcOpenShell); Bonsai extension listing says GPL-3.0-or-later — [Blender Extensions](https://extensions.blender.org/add-ons/bonsai/)
- GitHub: IfcOpenShell 2,822 stars, repo created 2015-08-10 (a 2011 project moved to GitHub later) — https://api.github.com/repos/IfcOpenShell/IfcOpenShell
- Blender Extensions page shows 152,220 downloads and 58 five-star reviews. CAUTION: the fetched text was internally inconsistent (says Blender 5.1+, "published August 13th 2024"), so treat as approximate and date-unverified — [Blender Extensions](https://extensions.blender.org/add-ons/bonsai/)
- Project lists "over 150 contributors"; $1,300/month donations from 100+ contributors; Epic Megagrants and Cesium Ecosystem Grants; first full-time sponsored developer (Andrej) — [opensource.construction](https://opensource.construction/projects/bonsai/)
- Open Collective: $96,330.31 raised in total, $70,728.46 disbursed, 309 contributors, goal "$50,000 per year" for a 2nd sponsored developer, invites corporate sponsors to move "from a spare-time gig into a sustainable foundation" — [OpenCollective IfcOpenShell](https://opencollective.com/opensourcebim)
- May 2021: $15,000 Epic MegaGrant split across Johan Luttun, Thomas Krijnen, Dion Moult (search-summary of the OSArch wiki) — [Wiki.OSArch roadmap](https://wiki.osarch.org/index.php?title=BlenderBIM_Add-on_Roadmap)
- March 2021: first Google Summer of Code via OpenCAx umbrella (search-summary) — same wiki link above.
- Later bounty-style funding: per-feature "projects" on OSArch's Open Collective (e.g. "Bonsai: Saveable view - clipping box equivalent") — [OpenCollective OSArch](https://opencollective.com/osarch)

**That Open Company (IFC.js, web-ifc, engine_components)**
- Evolved from IFC.js, a browser-based open-source IFC toolkit; now SDKs claimed by the company to be used by 1,000+ companies (incl. RIB, Bosch, Ferrovial) and a 10,000+ developer community (company claims, relayed by trade press) — [AEC Magazine](https://aecmag.com/features/that-open-company-raises-the-stakes/)
- Licences/stars (GitHub API): web-ifc MPL-2.0, 1,054 stars (created 2020-12-05); engine_components MIT, 708 stars (created 2022-07-01) — https://api.github.com/repos/ThatOpen/engine_web-ifc , https://api.github.com/repos/ThatOpen/engine_components
- 2022: community-funded bounty model via Open Collective: "$40,000 and going up", $17,000 paid out in one week, plan of $160,000 more within a year (search-summary) — [IFC.js bounties post](https://discourse.threejs.org/t/paid-remote-ifc-js-bounties/38371) and [OpenCollective IFC.js](https://opencollective.com/ifcjs)
- By July 2023 the bounty programme "no longer exists"; revenue from paid courses (That Open University) and services to fund the free tech; some OSArch members accused it of "openwashing" — [OSArch thread](https://community.osarch.org/discussion/1551/that-open-company)
- 2026: commercial That Open Platform previewed at NXT BLD May 2026, "founding membership" 22–28 June 2026; Viegas frames it as "a BIM operating system" and says AI shifts constraints "from engineering effort to domain knowledge" — [AEC Magazine](https://aecmag.com/features/that-open-company-raises-the-stakes/)
- One search summary says the company reached "final stages on the financing side, but it did not close" — only a search-engine snippet attributed to a LinkedIn post; unverified, do not rely on it — [search result](https://www.linkedin.com/posts/antonio-gonz%C3%A1lez-viegas-8b2326151_is-ifcjs-wanting-to-be-an-open-bim-framework-activity-7076194473919098880-oWGT) (fetching that post did not confirm any financing text).

**xeokit**
- SDK released 21 Jan 2019 by Lindsay Kay, successor to SceneJS (c. 2011) and xeogl — [Wikipedia](https://en.wikipedia.org/wiki/Xeokit)
- Dual licence AGPL-3.0 or proprietary; Creoox AG became business partner in 2020 and now maintains it (search-summary) — [Wikipedia](https://en.wikipedia.org/wiki/Xeokit); GitHub: 942 stars, AGPL-3.0 — https://api.github.com/repos/xeokit/xeokit-sdk
- Adoption: OpenProject, Campo, Fonn, bimspot, CMDBuild; AEC hackathon awards 2024–25 — [Wikipedia](https://en.wikipedia.org/wiki/Xeokit)
- OpenProject BIM 10.4 shipped with the xeokit viewer; Lindsay Kay integrated it — [OpenProject blog](https://www.openproject.org/blog/openproject-bim-10-4/)

**Speckle**
- Began as a Grasshopper plugin during Dimitrie Stefanescu's UCL Marie Curie fellowship; later 2 years at Arup; incorporated 2020 — [Foundamental masterclass](https://university.foundamental.com/masterclass/dimitrie-stefanescu/), [Speckle blog](https://speckle.systems/blog/growing-the-speckle-seed/)
- $1M pre-seed in 2020 (search-summary) and $5.5M seed led by Frontline Ventures and Matrix Partners — [Speckle blog](https://speckle.systems/blog/growing-the-speckle-seed/), [AEC Business](https://aec-business.com/speckle-the-open-source-platform-for-3d-data-raised-a-5-5-m-seed-round/)
- GitHub: speckle-server 845 stars, licence reported as NOASSERTION (custom) — https://api.github.com/repos/specklesystems/speckle-server
- Contributors/users from McNeel, Foster + Partners, Buro Happold; Jacobs enterprise adoption started with a forum user asking about self-hosting who turned out to be their CTO — [Foundamental](https://university.foundamental.com/masterclass/dimitrie-stefanescu/)

**FreeCAD BIM workbench**
- FreeCAD repo: 33,882 stars, LGPL-2.1, created 2012 — https://api.github.com/repos/FreeCAD/FreeCAD
- Yorik van Havre (core dev since 2008) funded the Arch/BIM work through Patreon, goal $2,000/month for full-time work, plus Liberapay/GitHub Sponsors (search-summary) — [Patreon](https://www.patreon.com/posts/patreon-and-more-6701520), [GitHub Sponsors](https://github.com/sponsors/yorikvanhavre)
- BIM workbench merged into FreeCAD core from 1.0 (search-summary) — [BIM_Workbench Codeberg](https://codeberg.org/yorikvanhavre/BIM_Workbench)
- FreeCAD Project Association grants: fund launched Aug 2022, 40,000 EUR reserved for 2026 (search-summary) — [FPA](https://fpa.freecad.org/), [FreeCAD blog](https://blog.freecad.org/2022/11/23/freecad-project-association-development-fund/)

**OpenProject BIM**
- OpenProject repo: 16,278 stars, GPL-3.0, created 2012 — https://api.github.com/repos/opf/openproject. BIM edition (10.4 added IFC viewer, 10.5/10.6 BCF) — [OpenProject blog](https://www.openproject.org/blog/openproject-bim-10-6/). Funding model (company + enterprise edition) not verified here.

**OSArch**
- Community born 2020, founded by Dion Moult among others; early members included Ryan Schultz (OpeningDesign) and Bruno Postle — [OSArch welcome thread](https://community.osarch.org/discussion/6/welcome-to-the-osarch-community)
- 2022: +500 new users (~50% growth), ~5,200 posts, ~1,000 unique daily visitors (search-summary) — [OSArch governance thread](https://community.osarch.org/discussion/182/organizational-structure-and-governance-of-osarch)
- Has its own Open Collective with per-feature Bonsai bounties — [OpenCollective OSArch](https://opencollective.com/osarch)

**BIMserver / BIMsurfer (older opensourceBIM)**
- BIMserver ~1.8k stars, BIMsurfer ~431 stars (search-summary, undated) — [GitHub opensourceBIM](https://github.com/opensourceBIM); older BIMsurfer v1/v2 repo flagged "not maintained anymore" — [BIMsurfer-before2019](https://github.com/opensourceBIM/BIMsurfer-before2019)

### Inferences
- Stars understate adoption for infrastructure libraries (IfcOpenShell, 2.8k stars, underpins Bonsai and many tools); user counts for Bonsai are better read from the Blender extension download count, but that figure is date-ambiguous.
- The pattern "one maintainer + GPL/LGPL + donation/grant mix" plateaus at roughly the scale of one or two part-time salaries (Bonsai: $1,300/month; Open Collective total ~$96k over its life).

### Gaps
- Bonsai/IfcOpenShell PyPI download totals and exact release-by-release history not retrieved.
- That Open Company's real revenue, funding rounds and headcount not found (AEC Magazine article gave none).
- OpenProject BIM revenue/adoption split not found; Speckle user counts not found.
- Stars for Bonsai alone: it lives in the IfcOpenShell monorepo, so no separate figure.

## 2. What triggered growth

### Takeaway
Documented triggers are mostly: a working, shareable thing in a familiar tool (Speckle's Grasshopper plugin; Bonsai inside Blender), a deliberate open-sourcing decision, a community forum as the home base, and a bigger host project adopting the component (xeokit into OpenProject). Grants helped but were small ($15k Epic).

### Cited Findings
- Speckle "wasn't open source at first, but then ... that's when it really took off" (search-summary) — [Bricks & Bytes](https://bricks-bytes.com/technology/how-speckle-used-open-source-to-crack-aec/) (direct fetch failed). Stefanescu says he open-sourced partly to sidestep IP-ownership politics at UCL and that the community acted like "the village that helps you raise a child" — [Foundamental](https://university.foundamental.com/masterclass/dimitrie-stefanescu/)
- Speckle's forum (Discourse) replaced Slack so answers "stay" and are searchable — [Foundamental](https://university.foundamental.com/masterclass/dimitrie-stefanescu/)
- Stefanescu: "It's very easy to iterate on product ... most difficult thing to iterate on is business model." — [Foundamental](https://university.foundamental.com/masterclass/dimitrie-stefanescu/)
- Bonsai: Epic MegaGrant (May 2021) and Google Summer of Code (2021) — [Wiki.OSArch](https://wiki.osarch.org/index.php?title=BlenderBIM_Add-on_Roadmap) (search-summary). OSArch itself (2020) provided the forum and the Open Collective for funding features — [OSArch](https://community.osarch.org/discussion/6/welcome-to-the-osarch-community)
- IFC.js: bounties turned donations into contributor pay and contributions quickly (2022) — [threejs forum](https://discourse.threejs.org/t/paid-remote-ifc-js-bounties/38371) (search-summary)
- xeokit: embedded in OpenProject BIM 10.4 — [OpenProject blog](https://www.openproject.org/blog/openproject-bim-10-4/); the March 2021 licence clarification removed friction because OpenProject depends on it — [OSArch xeokit AGPL thread](https://community.osarch.org/discussion/289/xeokit-agpl-not-quite-free-and-not-really-free-software)
- That Open: conference/launch events (NXT BLD, May 2026) and paid memberships — [AEC Magazine](https://aecmag.com/features/that-open-company-raises-the-stakes/)

### Inferences
- No source found for a buildingSMART endorsement as a growth trigger for any of these; Dion Moult's posts hint at IFC4.3/IDS work tied to buildingSMART but I did not read them (inference only).
- Education/university use: only That Open University (paid courses) and Speckle's UCL origin evidenced; no university-adoption data found.
- For a solo project: a forum presence (osArch) and a "drop-in" form factor inside a tool users already own match what worked; a dated paper is not evidenced as a trigger for any comparable project.

### Gaps
- No documented single "killer demo" moment found for Bonsai or IFC.js; searches for a 2021 Bonsai growth inflection returned nothing citable.
- No buildingSMART-endorsement effect measured anywhere.

## 3. What stalled or failed, and why

### Takeaway
Evidence of outright failures is thin. Documented tensions are: licence ambiguity (xeokit), trust loss from changing funding model (IFC.js bounties ended, "openwashing" claims), spending exceeding donations (Bonsai), and older viewer/server repos becoming unmaintained.

### Cited Findings
- xeokit's 2021 wording ("AGPL ... with option to buy a licence for commercial use") was read as removing AGPL's commercial rights; Moult said it was not truly free software; Kay clarified in March 2021 it would "always be free and open source" and became a genuine dual licence — [OSArch thread](https://community.osarch.org/discussion/289/xeokit-agpl-not-quite-free-and-not-really-free-software)
- IFC.js bounty programme "no longer exists" by 2023; moderators called the new commercial approach "a little hypocritical"/"openwashing" — [OSArch thread](https://community.osarch.org/discussion/1551/that-open-company)
- Bonsai spending more than it earns, eating savings, so sponsored development (Bruno Perdigão) temporarily scaled back (search-summary; the original OSArch release thread page numbers p8/p9/p14 were not read in full) — [OSArch Bonsai release thread](https://community.osarch.org/discussion/26/bonsai-new-release/p14), [OpenCollective expense](https://opencollective.com/opensourcebim/expenses/237848)
- BIMsurfer v1/v2 repo flagged "not maintained anymore", succeeded by a rewrite — [BIMsurfer-before2019](https://github.com/opensourceBIM/BIMsurfer-before2019)

### Inferences
- A funding-model change (donations/bounties to company) can cost goodwill in this niche community if not explained openly (IFC.js case).
- Bonsai's gap between hitting a $2,500/month target and sustaining paid developers shows targets are not stable income.

### Gaps
- No documented abandoned project with a post-mortem found; forks (e.g. of xeokit, BIMsurfer) are not analysed. Did not find an IFC.js-funding-cliff source beyond the unverified snippet above.

## 4. Solo/indie maintainer statements on burnout, funding, sustainability

### Takeaway
Sourced statements are about structure rather than personal burnout: Bonsai/IfcOpenShell describe a "spare-time gig" and seek sponsored developers; Yorik van Havre set a $2,000/month full-time threshold; Stefanescu stresses business-model iteration. I did not find a first-person burnout quote from Moult, Krijnen, Viegas or Kay.

### Cited Findings
- "From a spare-time gig into a sustainable foundation" — [OpenCollective IfcOpenShell](https://opencollective.com/opensourcebim)
- Project is "primarily volunteer-driven"; Krijnen writes most C++ and Moult most Python — [opensource.construction](https://opensource.construction/projects/bonsai/)
- van Havre: Patreon goal $2,000/month so he can work full time on FreeCAD (maintenance, releases, docs, advocacy) (search-summary) — [Patreon](https://www.patreon.com/posts/patreon-and-more-6701520)
- Viegas: monetising enables faster development; "to dedicate resources, we have to generate income" (forum paraphrase/quote) — [OSArch thread](https://community.osarch.org/discussion/1551/that-open-company)
- Generic maintainer-burnout interview (not BIM) — [SoftAid](https://www.softaid.net/blog/open-source-maintainer-burnout-interview-2026/) (low-quality aggregator; do not lean on it)

### Inferences
- A solo founder should expect donations to cover a fraction of effort; plan for grant/consulting/company layers early.

### Gaps
- No BIM-specific first-person burnout accounts retrieved; Moult's blog (thinkmoult.com) and mastodon posts not read in full (fetch returned only a title).

## 5. Long-tail "sudden L-curve" after years of slow growth

### Takeaway
Candidates exist but none is documented as a clean trigger: FreeCAD (2002 origin, 33.9k stars) and Bonsai (2019 start, large 2021–25 growth) both show late acceleration, but I found no source that names a single trigger.

### Cited Findings
- Speckle: PhD-era plugin (2015-ish per the founders) to pre-seed in 2020 and seed round later; growth said to take off once repos were opened — [Speckle blog](https://speckle.systems/blog/growing-the-speckle-seed/), [Bricks & Bytes](https://bricks-bytes.com/technology/how-speckle-used-open-source-to-crack-aec/) (search-summary)
- xeokit lineage: SceneJS (~2011) to xeogl to xeokit (2019) to Creoox partnership (2020) to OpenProject integration — [Wikipedia](https://en.wikipedia.org/wiki/Xeokit)
- BlenderBIM: 83-line prototype (Aug 2019) to $15k MegaGrant and GSoC (2021) to rename/rebrand to Bonsai with Blender Extensions distribution (152k downloads, date-ambiguous) — sources above.

### Inferences
- The common pre-inflection ingredient is long accumulated groundwork (a lineage of earlier projects, or a decade of a core library) that a new front-end could ride (xeokit lineage; Bonsai on IfcOpenShell's 2011 core). Relevant to BIMCompiler only as analogy.
- Triggers that coincide with acceleration: host-platform integration (OpenProject), distribution channel (Blender Extensions), grant plus community forum (2020–21). These are coincidence-based, not proven causes.

### Gaps
- No time-series (stars/downloads over time) retrieved for any project, so "L-curve" shape is not demonstrated; Star History or PyPI stats would be the next source.
