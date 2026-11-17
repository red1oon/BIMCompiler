---
description: Visionneuse IFC native du navigateur et noyau ERP local d'abord — déposez un fichier IFC, voyez un modèle BIM en 3D, exécutez un ERP sans serveur fondé sur les événements. Sans installation, sans serveur, sous licence MIT.
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: fr
---

# BIM Intent Compiler

**Construction = BOM + (x, y, z).** Une formule qui unifie la géométrie, les achats, le planning, la conformité et le coût — comme E=mc² a unifié la masse et l'énergie. Cinq domaines que l'industrie traite comme des outils séparés, des fournisseurs séparés, des budgets séparés — unifiés dans une formule longue d'un pouce.

Il lit une BOM et produit des coordonnées 3D vérifiées — comme un [système ERP](MANIFESTO.md) éclate une BOM de fabrication en ordres de travail. Le résultat s'affiche en direct dans la [visionneuse de navigateur BIM OOTB](https://red1oon.github.io/bim-ootb/) — sans installation, sans serveur, deux bases de données, un seul navigateur. [Indépendant du domaine](ShipYard.md) — bâtiments, ponts, [navires](ShipYard.md), tunnels. **Rien d'inventé. Aucune IA, aucun LLM à l'intérieur. De l'arithmétique pure. Déterministe.**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 Nouveau ici ? Commencez par le Guide de l'utilisateur.</div>
<div style="margin-top: 8px; color: #455a64;">Un seul navigateur — <b>voir</b> un bâtiment · <b>créer</b> de la géométrie · <b>exécuter</b> l'ERP.</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 Ouvrir le Guide de l'utilisateur →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">« Ce qu'<b style="color: #ff9800;">AUTODESK</b>, <b style="color: #ff9800;">PRIMAVERA</b> et <b style="color: #ff9800;">SAP</b> auraient dû faire<br>ensemble depuis longtemps — <i>mais je n'ai pas pu attendre.</i> »</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

Tous les outils existants partent de la géométrie et en extraient les quantités ensuite — on dessine d'abord, on compte après. Ce compilateur inverse le sens : la nomenclature (Bill of Materials) est la source de vérité, et la géométrie est le résultat compilé. Les achats ne suivent pas la conception. C'est la conception qui suit les achats.

| | Dessiner d'abord, compter ensuite | Compter d'abord, dessiner ensuite |
|---|---|---|
| **Source de vérité** | Modèle 3D (Revit, ArchiCAD) | Bill of Materials |
| **Quantités** | Extraites après la conception | Inhérentes — la BOM EST la quantité |
| **Modifier un mur** | Redessiner → ré-extraire le QTO → ré-estimer | Modifier une ligne de BOM → recompiler |
| **Conformité** | Vérificateur séparé (Solibri) | Le même moteur de règles |
| **Coût** | Estimateur séparé | La même BOM × liste de prix |
| **Planning** | Outil séparé (Primavera) | Tri topologique de l'arbre de BOM |
| **Preuve** | Inspection visuelle | Déterministe — chaque élément remonte à une source |

Construit sur les conventions de l'ERP [iDempiere](https://idempiere.org/) et sur [SQLite](https://www.sqlite.org/), rendu nativement dans le navigateur avec Three.js. De Kuala Lumpur, en Malaisie — où le BIM est [obligatoire](StrategicIndustryPositioning.md) pour tous les projets ≥ RM10M depuis juillet 2025. C'est le cadeau de son Créateur, [Redhuan D. Oon](mailto:red1org@gmail.com), au monde.

---

## Les trois applications que vous ouvrez vraiment

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    Déposez votre propre IFC → extrait vers SQLite directement dans le navigateur ; fusion des disciplines, visite en vol, matrice de conflits, machine à remonter le temps 4D/5D — le tout sur le même fichier. Sur ordinateur et sur mobile, fonctionne hors ligne.

    [:octicons-arrow-right-24: Guide du Viewer](BIMUserGuide.md) · [Ouvrir](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    Créez de la géométrie B-rep — insérez des pièces de bibliothèque, esquissez, extrudez, balayez, modifiez la **grille 3D** — où l'op-log signé *est* l'arbre des fonctionnalités.

    [:octicons-arrow-right-24: Guide du Modeller](ModellerGuide.md) · [Ouvrir](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    Le vrai iDempiere dans le navigateur — caisse, états financiers, le Dictionnaire d'applications complet depuis SQLite. Sans Java, sans serveur, sans installation.

    [:octicons-arrow-right-24: Guide du Kernel-ERP](ERPUserGuide.md) · [Caisse et cuisine (jumeau d'uniCenta)](TillUserGuide.md) · [Toutes les vues](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Ouvrir](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## Les idées maîtresses

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="Immeuble à étages compilé à partir d'une BOM — 6 disciplines codées par couleur" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">Compilé à partir d'une BOM. Couleur = discipline (STR, ARC, ELEC, FP, ACMV, SP).</figcaption>
</figure>

<div class="grid cards" markdown>

-   **Détection de conflits — dans le navigateur**

    ---

    Règles par paire de disciplines, visualisation par vol vers le conflit, curseur de tolérance en direct, flux de revue dans la visionneuse. Des dizaines de milliers d'éléments, zéro serveur.

    [:octicons-arrow-right-24: Détection de conflits](CLASH_DETECTION.md)

-   **Kernel-ERP — un pli sur un journal d'opérations signé**

    ---

    C_Order, C_OrderLine, M_Product, M_BOM — repliés à partir de l'oracle [iDempiere](https://idempiere.org/). L'état est un pli déterministe sur un journal d'opérations signé ; même un `AD_Process` est redérivé comme un rejeu, et non comme une méthode.

    [:octicons-arrow-right-24: Black Book](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: Rosetta inter-ERP (dont SAP / ACDOCA)](ERPConceptRosetta.html) · [:octicons-arrow-right-24: Vision de l'ERP](MANIFESTO.md)

-   **Sécurité d'entreprise — sans serveur**

    ---

    Vérification cryptographique sans serveur central : attestation HMAC, signature d'identité Ed25519, intégrité du transport SHA-256. Vos données ne quittent jamais votre navigateur.

    [:octicons-arrow-right-24: Architecture de sécurité](EnterpriseAuthentication.md)

-   **Règles métier modifiables, en direct**

    ---

    Le Saint Graal — changez une règle, regardez le modèle et l'ERP se replier. Un ERP spatial où [chaque enregistrement a un lieu](SpatialERP_OOTB.md).

    [:octicons-arrow-right-24: Le Saint Graal](HolyGrail.md) · [:octicons-arrow-right-24: ERP spatial](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## Carte de la documentation

| Je veux… | Commencez ici |
|------------|-----------|
| **Démarrer (tout le monde commence ici)** | [📖 **Guide de l'utilisateur**](USER_GUIDE.md) |
| Voir un bâtiment dans le navigateur | [Guide du BIM Viewer](BIMUserGuide.md) |
| Créer de la géométrie | [Guide du DAGeVu Modeller](ModellerGuide.md) |
| Transformer des dessins 2D (DXF) en modèle BIM 3D | [Dessins 2D → BIM (DXF2BIM)](DXF2BIMGuide.md) |
| Obtenir des rapports de travaux de génie civil à partir d'un jeu IFC de route | [Travaux de génie civil — pas à pas](CivilWorksGuide.md) |
| Collaborer sur une surface (qui a fait quoi, discussion) | [Teams Overlay](TeamsOverlayGuide.md) |
| Voir ce qui a été livré récemment | [Nouveautés](WhatsNew.md) |
| Exécuter l'ERP dans le navigateur | [Guide de l'utilisateur du Kernel-ERP](ERPUserGuide.md) |
| Piloter les applications avec des commandes d'une ligne (vous ou une IA) | [Guide Fast Script](FastScriptGuide.md) |
| Faire migrer une entreprise depuis Odoo, Business Central ou SAP Business One | [Guide de migration](MigrationGuide.md) · [comment fonctionne la migration depuis Odoo](OdooMigration.md) |
| Exécuter une caisse et un écran de cuisine | [Guide de l'utilisateur Caisse et cuisine](TillUserGuide.md) |
| Voir un bâtiment devenir un ordre de projet et un tableau de bord CAPEX | [BIM → ERP et le tableau de bord CAPEX](CapexDashboardGuide.md) · [Guide UAT CAPEX](CapexUATGuide.md) |
| Laisser une IA extérieure proposer des changements au Modeller | [Guide du proposeur d'IA](ProposerGuide.md) · [Divulgation défensive](AIProposerDefensiveDisclosure.md) |
| Lire ou modifier le code | [Guide du développeur](DeveloperGuide.md) |
| Essayer les prototypes (preuves de concept, données d'exemple uniquement) | [Suivi et traçabilité halal](HalalTrace.md) · [ouvrir](halal/index.html) · [Commerce de détail à grande échelle](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [Visite de l'architecture](bim_architecture_viz.html) |
| Comprendre la vision de l'ERP | [MANIFESTO — à lire d'abord](MANIFESTO.md) |
| Comparer avec d'autres outils | [Comparaison des fonctionnalités](FeatureComparison.md) · [Migrer et comparer (ERP)](MigrateComparisonPaper.md) |
| Voir où cela se situe dans l'industrie | [Positionnement stratégique](StrategicIndustryPositioning.md) |
| Comprendre comment cela a été construit | [Vibe Programming — IA + expertise métier](VibeProgramming.md) |
| Créer de la géométrie comme un pli | [DAGeVu Modeller — la géométrie comme un pli](ModellerKernelFold.md) |
| Aller jusqu'à n'importe quel élément à l'intérieur | [Trouver et naviguer — guidage en intérieur](RouteTemplate.md) |
| ERP distribué / hors ligne | [ERP distribué](DistributedERP.md) |
| Aller au-delà des bâtiments | [Au-delà des bâtiments — ShipYard](ShipYard.md) |
| Contribuer | [Contribuer — commencez ici](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. Licence MIT.*
