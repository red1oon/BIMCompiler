---
description: Browser-native IFC viewer and local-first ERP kernel — drop an IFC file, view a BIM model in 3D, run a serverless event-sourced ERP. No install, no server, MIT-licensed.
hide:
  - navigation
  - toc
---

# BIM Intent Compiler

**Construction = BOM + (x, y, z).** One formula that unifies geometry, procurement, scheduling, compliance, and cost — the way E=mc² unified mass and energy. Five domains that the industry treats as separate tools, separate vendors, separate budgets — unified in a formula an inch long.

It reads a BOM and produces verified 3D coordinates — the same way an [ERP system](MANIFESTO.md) explodes a manufacturing BOM into work orders. The output renders live in the [BIM OOTB browser viewer](https://red1oon.github.io/bim-ootb/) — no install, no server, two DBs, one browser. [Domain-agnostic](ShipYard.md) — buildings, bridges, [ships](ShipYard.md), tunnels. **Nothing invented. No AI, no LLM inside. Pure arithmetic. Deterministic.**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 New here? Start with the User Guide.</div>
<div style="margin-top: 8px; color: #455a64;">One browser — <b>view</b> a building · <b>author</b> geometry · <b>run</b> the ERP.</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 Open the User Guide →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">"What <b style="color: #ff9800;">AUTODESK</b>, <b style="color: #ff9800;">PRIMAVERA</b> and <b style="color: #ff9800;">SAP</b> should have done<br>together long ago — <i>but I couldn't wait.</i>"</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

Every existing tool starts with geometry and extracts quantities downstream — draw first, count second. This compiler inverts the direction: the Bill of Materials is the source of truth, and geometry is the compiled output. Procurement doesn't follow design. Design follows procurement.

| | Draw first, count second | Count first, draw second |
|---|---|---|
| **Source of truth** | 3D model (Revit, ArchiCAD) | Bill of Materials |
| **Quantities** | Extracted after design | Inherent — the BOM IS the quantity |
| **Change a wall** | Redraw → re-extract QTO → re-estimate | Change one BOM line → recompile |
| **Compliance** | Separate checker (Solibri) | Same rule engine |
| **Cost** | Separate estimator | Same BOM × price list |
| **Schedule** | Separate tool (Primavera) | BOM tree topological sort |
| **Proof** | Visual inspection | Deterministic — every element traces to a source |

Built on [iDempiere](https://idempiere.org/) ERP conventions and [SQLite](https://www.sqlite.org/), rendered browser-native with Three.js. From Kuala Lumpur, Malaysia — where BIM is [mandated](StrategicIndustryPositioning.md) for all projects ≥ RM10M from July 2025. It is the Creator, [Redhuan D. Oon](mailto:red1org@gmail.com)'s gift to the world.

---

## The three apps you actually open

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    Drop your own IFC → extracted to SQLite right in the browser; merge disciplines, fly-through, clash matrix, 4D/5D time-machine — all on the same file. Desktop and mobile, works offline.

    [:octicons-arrow-right-24: Viewer Guide](BIMUserGuide.md) · [Open](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    Author B-rep geometry — insert library parts, sketch, extrude, sweep, edit the **3D Grid** — where the signed op-log *is* the feature tree.

    [:octicons-arrow-right-24: Modeller Guide](ModellerGuide.md) · [Open](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    Real iDempiere in the browser — POS, financial statements, the full Application Dictionary from SQLite. No Java, no server, no install.

    [:octicons-arrow-right-24: Kernel-ERP Guide](ERPUserGuide.md) · [Open](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## The headline ideas

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="Multi-storey building compiled from BOM — 6 disciplines colour-coded" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">Compiled from BOM. Colour = discipline (STR, ARC, ELEC, FP, ACMV, SP).</figcaption>
</figure>

<div class="grid cards" markdown>

-   **Clash Detection — In the Browser**

    ---

    Discipline-pair rules, fly-to visualization, live tolerance slider, in-viewer review workflow. Tens of thousands of elements, zero server.

    [:octicons-arrow-right-24: Clash Detection](CLASH_DETECTION.md)

-   **Kernel-ERP — a Fold over a Signed Op-Log**

    ---

    C_Order, C_OrderLine, M_Product, M_BOM — folded from the [iDempiere](https://idempiere.org/) oracle. State is a deterministic fold over a signed operation log; even an `AD_Process` is re-derived as a replay, not a method.

    [:octicons-arrow-right-24: Black Book](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: Cross-ERP Rosetta (incl. SAP / ACDOCA)](ERPConceptRosetta.html) · [:octicons-arrow-right-24: ERP world view](MANIFESTO.md)

-   **Enterprise Security — No Server Required**

    ---

    Cryptographic verification with no central server: HMAC attestation, Ed25519 identity signing, SHA-256 transport integrity. Your data never leaves your browser.

    [:octicons-arrow-right-24: Security Architecture](EnterpriseAuthentication.md)

-   **Editable Business Rules, Live**

    ---

    The Holy Grail — change a rule, watch the model and the ERP re-fold. Spatial ERP where [every record has a place](SpatialERP_OOTB.md).

    [:octicons-arrow-right-24: The Holy Grail](HolyGrail.md) · [:octicons-arrow-right-24: Spatial ERP](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## Documentation map

| I want to… | Start here |
|------------|-----------|
| **Get going (everyone starts here)** | [📖 **User Guide**](USER_GUIDE.md) |
| View a building in the browser | [BIM Viewer Guide](BIMUserGuide.md) |
| Author geometry | [DAGeVu Modeller Guide](ModellerGuide.md) |
| Run the browser ERP | [Kernel-ERP User Guide](ERPUserGuide.md) |
| Understand the ERP world view | [MANIFESTO — read first](MANIFESTO.md) |
| Compare to other tools | [Feature Comparison](FeatureComparison.md) · [Migrate & Compare (ERP)](MigrateComparisonPaper.md) |
| See where this sits in the industry | [Strategic Positioning](StrategicIndustryPositioning.md) |
| Understand how it was built | [Vibe Programming — AI + Domain Expertise](VibeProgramming.md) |
| Author geometry as a fold | [DAGeVu Modeller — Geometry as a Fold](ModellerKernelFold.md) |
| Walk to any element indoors | [Find & Navigate — Indoor Wayfinding](RouteTemplate.md) |
| Distributed / offline ERP | [Distributed ERP](DistributedERP.md) |
| Go beyond buildings | [Beyond Buildings — ShipYard](ShipYard.md) |
| Contribute | [Contribute — start here](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
