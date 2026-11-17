---
description: Browser-nativer IFC-Viewer und lokal-zuerst-ERP-Kernel — IFC-Datei ablegen, ein BIM-Modell in 3D ansehen, ein serverloses, ereignisbasiertes ERP betreiben. Keine Installation, kein Server, MIT-lizenziert.
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: de
---

# BIM Intent Compiler

**Bauen = BOM + (x, y, z).** Eine Formel, die Geometrie, Beschaffung, Terminplanung, Compliance und Kosten vereint — so wie E=mc² Masse und Energie vereint hat. Fünf Bereiche, die die Branche als getrennte Werkzeuge, getrennte Anbieter und getrennte Budgets behandelt — vereint in einer Formel von einem Zoll Länge.

Er liest eine BOM und erzeugt geprüfte 3D-Koordinaten — so, wie ein [ERP-System](MANIFESTO.md) eine Fertigungs-BOM in Arbeitsaufträge auflöst. Das Ergebnis wird live im [BIM-OOTB-Browser-Viewer](https://red1oon.github.io/bim-ootb/) dargestellt — keine Installation, kein Server, zwei DBs, ein Browser. [Branchenunabhängig](ShipYard.md) — Gebäude, Brücken, [Schiffe](ShipYard.md), Tunnel. **Nichts erfunden. Keine KI, kein LLM darin. Reine Arithmetik. Deterministisch.**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 Neu hier? Beginnen Sie mit dem Benutzerhandbuch.</div>
<div style="margin-top: 8px; color: #455a64;">Ein Browser — ein Gebäude <b>ansehen</b> · Geometrie <b>erstellen</b> · das ERP <b>betreiben</b>.</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 Benutzerhandbuch öffnen →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">"Was <b style="color: #ff9800;">AUTODESK</b>, <b style="color: #ff9800;">PRIMAVERA</b> und <b style="color: #ff9800;">SAP</b> längst gemeinsam<br>hätten tun sollen — <i>aber ich konnte nicht warten.</i>"</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

Jedes bestehende Werkzeug beginnt mit der Geometrie und entnimmt die Mengen später — erst zeichnen, dann zählen. Dieser Compiler kehrt die Richtung um: Die Stückliste (Bill of Materials) ist die Quelle der Wahrheit, und die Geometrie ist das kompilierte Ergebnis. Die Beschaffung folgt nicht dem Entwurf. Der Entwurf folgt der Beschaffung.

| | Erst zeichnen, dann zählen | Erst zählen, dann zeichnen |
|---|---|---|
| **Quelle der Wahrheit** | 3D-Modell (Revit, ArchiCAD) | Stückliste (BOM) |
| **Mengen** | Nach dem Entwurf entnommen | Von vornherein enthalten — die BOM IST die Menge |
| **Eine Wand ändern** | Neu zeichnen → Mengenermittlung neu entnehmen → neu kalkulieren | Eine BOM-Zeile ändern → neu kompilieren |
| **Compliance** | Eigener Prüfer (Solibri) | Dieselbe Regel-Engine |
| **Kosten** | Eigener Kalkulator | Dieselbe BOM × Preisliste |
| **Terminplan** | Eigenes Werkzeug (Primavera) | Topologische Sortierung des BOM-Baums |
| **Nachweis** | Sichtprüfung | Deterministisch — jedes Element lässt sich auf eine Quelle zurückführen |

Aufgebaut auf den Konventionen des [iDempiere](https://idempiere.org/)-ERP und auf [SQLite](https://www.sqlite.org/), browser-nativ mit Three.js dargestellt. Aus Kuala Lumpur, Malaysia — wo BIM ab Juli 2025 für alle Projekte ab RM10M [verpflichtend](StrategicIndustryPositioning.md) ist. Es ist das Geschenk des Schöpfers, [Redhuan D. Oon](mailto:red1org@gmail.com), an die Welt.

---

## Die drei Apps, die Sie tatsächlich öffnen

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    Legen Sie Ihre eigene IFC ab → sie wird direkt im Browser nach SQLite extrahiert; Disziplinen zusammenführen, Durchflug, Kollisionsmatrix, 4D/5D-Zeitmaschine — alles an derselben Datei. Desktop und Mobilgerät, funktioniert offline.

    [:octicons-arrow-right-24: Viewer-Handbuch](BIMUserGuide.md) · [Öffnen](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    B-Rep-Geometrie erstellen — Bibliotheksteile einfügen, skizzieren, extrudieren, entlangführen, das **3D-Raster** bearbeiten — wo das signierte Op-Log *der* Feature-Baum ist.

    [:octicons-arrow-right-24: Modeller-Handbuch](ModellerGuide.md) · [Öffnen](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    Echtes iDempiere im Browser — POS, Finanzberichte, das vollständige Application Dictionary aus SQLite. Kein Java, kein Server, keine Installation.

    [:octicons-arrow-right-24: Kernel-ERP-Handbuch](ERPUserGuide.md) · [Kasse & Küche (uniCenta-Zwilling)](TillUserGuide.md) · [Alle Linsen](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Öffnen](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## Die Leitideen

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="Aus der BOM kompiliertes mehrgeschossiges Gebäude — 6 Disziplinen farbcodiert" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">Aus der BOM kompiliert. Farbe = Disziplin (STR, ARC, ELEC, FP, ACMV, SP).</figcaption>
</figure>

<div class="grid cards" markdown>

-   **Kollisionserkennung — im Browser**

    ---

    Regeln für Disziplinpaare, Anflug-Visualisierung, Live-Toleranzregler, Prüf-Workflow im Viewer. Zehntausende Elemente, null Server.

    [:octicons-arrow-right-24: Kollisionserkennung](CLASH_DETECTION.md)

-   **Kernel-ERP — ein Fold über ein signiertes Op-Log**

    ---

    C_Order, C_OrderLine, M_Product, M_BOM — gefaltet aus dem [iDempiere](https://idempiere.org/)-Orakel. Der Zustand ist ein deterministischer Fold über ein signiertes Operationsprotokoll; sogar ein `AD_Process` wird als Wiedergabe neu abgeleitet, nicht als Methode.

    [:octicons-arrow-right-24: Black Book](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: Cross-ERP-Rosetta (inkl. SAP / ACDOCA)](ERPConceptRosetta.html) · [:octicons-arrow-right-24: ERP-Weltbild](MANIFESTO.md)

-   **Unternehmenssicherheit — ohne Server**

    ---

    Kryptografische Prüfung ohne zentralen Server: HMAC-Attestierung, Ed25519-Identitätssignatur, SHA-256-Transportintegrität. Ihre Daten verlassen Ihren Browser nie.

    [:octicons-arrow-right-24: Sicherheitsarchitektur](EnterpriseAuthentication.md)

-   **Bearbeitbare Geschäftsregeln, live**

    ---

    Der Heilige Gral — eine Regel ändern und zusehen, wie sich Modell und ERP neu falten. Räumliches ERP, in dem [jeder Datensatz einen Ort hat](SpatialERP_OOTB.md).

    [:octicons-arrow-right-24: Der Heilige Gral](HolyGrail.md) · [:octicons-arrow-right-24: Räumliches ERP](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## Dokumentationsübersicht

| Ich möchte… | Hier beginnen |
|------------|-----------|
| **Loslegen (alle beginnen hier)** | [📖 **Benutzerhandbuch**](USER_GUIDE.md) |
| Ein Gebäude im Browser ansehen | [BIM-Viewer-Handbuch](BIMUserGuide.md) |
| Geometrie erstellen | [DAGeVu-Modeller-Handbuch](ModellerGuide.md) |
| 2D-Zeichnungen (DXF) in ein 3D-BIM-Modell verwandeln | [2D-Zeichnungen → BIM (DXF2BIM)](DXF2BIMGuide.md) |
| Tiefbau-Berichte aus einem Straßen-IFC-Satz erhalten | [Tiefbau — Schritt für Schritt](CivilWorksGuide.md) |
| Auf einer Oberfläche zusammenarbeiten (wer hat was getan, Chat) | [Team-Overlay](TeamsOverlayGuide.md) |
| Sehen, was zuletzt ausgeliefert wurde | [Neuigkeiten](WhatsNew.md) |
| Das Browser-ERP betreiben | [Kernel-ERP-Benutzerhandbuch](ERPUserGuide.md) |
| Die Apps mit Einzeilen-Befehlen steuern (Sie oder eine KI) | [Fast-Script-Handbuch](FastScriptGuide.md) |
| Ein Unternehmen aus Odoo, Business Central oder SAP Business One übernehmen | [Migrationshandbuch](MigrationGuide.md) · [wie die Odoo-Übernahme funktioniert](OdooMigration.md) |
| Eine Kasse und einen Küchenbildschirm betreiben | [Kasse-&-Küche-Benutzerhandbuch](TillUserGuide.md) |
| Sehen, wie aus einem Gebäude ein Projektauftrag und ein CAPEX-Dashboard wird | [BIM → ERP und das CAPEX-Dashboard](CapexDashboardGuide.md) · [CAPEX-UAT-Handbuch](CapexUATGuide.md) |
| Eine externe KI Änderungen am Modeller vorschlagen lassen | [Handbuch für KI-Vorschläge](ProposerGuide.md) · [Defensive Offenlegung](AIProposerDefensiveDisclosure.md) |
| Den Code lesen oder ändern | [Entwicklerhandbuch](DeveloperGuide.md) |
| Die Prototypen ausprobieren (Machbarkeitsnachweise, nur Beispieldaten) | [Halal-Rückverfolgung](HalalTrace.md) · [öffnen](halal/index.html) · [Einzelhandel im großen Maßstab](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [Architekturtour](bim_architecture_viz.html) |
| Das ERP-Weltbild verstehen | [MANIFESTO — zuerst lesen](MANIFESTO.md) |
| Mit anderen Werkzeugen vergleichen | [Funktionsvergleich](FeatureComparison.md) · [Migrieren & Vergleichen (ERP)](MigrateComparisonPaper.md) |
| Sehen, wo dies in der Branche steht | [Strategische Positionierung](StrategicIndustryPositioning.md) |
| Verstehen, wie es gebaut wurde | [Vibe Programming — KI + Fachwissen](VibeProgramming.md) |
| Geometrie als Fold erstellen | [DAGeVu Modeller — Geometrie als Fold](ModellerKernelFold.md) |
| Zu jedem Element in einem Gebäude gehen | [Finden & Navigieren — Wegführung in Gebäuden](RouteTemplate.md) |
| Verteiltes / Offline-ERP | [Verteiltes ERP](DistributedERP.md) |
| Über Gebäude hinausgehen | [Jenseits von Gebäuden — ShipYard](ShipYard.md) |
| Mitwirken | [Mitwirken — hier beginnen](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
