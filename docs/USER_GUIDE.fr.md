---
description: Guide de l'utilisateur de BIM OOTB — voyez des bâtiments IFC en 3D, créez de la géométrie et exécutez le Kernel-ERP, le tout côté client dans un seul onglet de navigateur, sans installation.
review: machine
source_sha: d3494de4a72ae85a
lang: fr
---
# BIM OOTB — Guide de l'utilisateur

Un seul navigateur. **Voir** un bâtiment · **créer** de la géométrie · **exécuter** l'ERP. Sans installation, entièrement côté client.

!!! privacy "🔒 Garantie de sécurité des données"
    **Cette application ne contient ni IA ni LLM. Vos données ne quittent jamais votre navigateur.** Tout fichier que vous déposez
    dans l'application reste dans l'IndexedDB et le noyau propres à votre navigateur, protégés par la sécurité
    standard du navigateur — et vous le réenregistrez sur votre propre machine, quand et où vous le choisissez. Chaque IFC que vous déposez,
    chaque bâtiment que vous ouvrez, chaque modification de l'ERP reste côté client, sur votre propre appareil — rien n'est envoyé
    chez nous, et aucun modèle n'est alimenté avec vos données. La page d'accueil et la page du Viewer exécutent un simple compteur de visites
    (GoatCounter) — il compte les visites de pages (l'adresse de la page peut être incluse), ne lit ni n'envoie jamais le contenu d'un fichier, et ne fait rien hors ligne ; l'ERP n'en a aucun. Quelques fonctions facultatives que vous déclenchez vous-même — liens de partage (TinyURL), codes
    QR (qrserver.com) et vérification des mises à jour (GitHub) — appellent ce service public et ne lui envoient que l'URL
    ou la requête dont cette fonction a besoin, jamais votre fichier. Chaque résultat est déterministe
    et remonte à une ligne de code ouvert que vous pouvez lire.

    [**Lire la garantie complète — comment fonctionne le modèle de confiance →**](EnterpriseAuthentication.md) · vous voulez
    l'exécuter totalement coupé du réseau une fois installé ? [**Guide d'installation entièrement hors ligne / isolée
    →**](OFFLINE_INSTALL_GUIDE.md)

![La page d'accueil Matrix — choisissez votre porte](assets/matrix_landing.png)

Commencez par la **[porte d'entrée → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** — la
page d'accueil Matrix (rouge / bleu → sélecteur rond). Choisissez une porte, ou allez directement à n'importe quelle application par son URL ci-dessous.
**Mettez-les en favoris** ; appuyez sur **Home** sur n'importe quelle surface pour revenir à la porte d'entrée. Lors d'une visite suivante,
la page d'accueil affiche le lanceur compact `⋯` ; **actualisez** pour retrouver le sélecteur rond complet.

**Vous avez juste une petite tâche IFC à faire ?** Passez en IFC4.3, extrayez un élément dans son propre IFC, découpez par niveau, ou vérifiez la santé d'un modèle — déposez un fichier, c'est exécuté. **[BIM Tools — Manuel de l'utilisateur →](BIMToolsGuide.md)**

Vous êtes arrivé récemment ? Consultez **[Nouveautés](WhatsNew.md)** pour un journal continu des changements livrés.

## Choisissez une surface

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **Déposez votre propre IFC** → extrait vers SQLite directement dans le navigateur ; fusion des disciplines, visite en vol, matrice de conflits, machine à remonter le temps 4D/5D, ordre de projet ERP — le tout sur le même fichier. Sur ordinateur et sur mobile, fonctionne hors ligne.

    _Porte d'entrée → l'icône **Buildings / IFC** (ci-dessus)_ · [Ouvrir](https://red1oon.github.io/bim-ootb/#buildings) · [Guide](BIMUserGuide.md) · [Travaux de génie civil (modèles de routes)](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    Créez de la géométrie B-rep — insérez des pièces de bibliothèque, esquissez, extrudez, balayez — où l'op-log signé *est* l'arbre des fonctionnalités. Précoce / en cours ; ordinateur.

    _Porte d'entrée → l'icône **BIM Modeller** (ci-dessus)_ · [Ouvrir](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [Guide](ModellerGuide.md) · [Guide du proposeur d'IA](ProposerGuide.md) · [Dessins 2D → BIM (DXF2BIM)](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    Le vrai iDempiere dans le navigateur — caisse, états financiers, le Dictionnaire d'applications complet depuis SQLite. Sans Java, sans serveur, sans installation.

    _Porte d'entrée → l'icône **ERP** (ci-dessus)_ · [Ouvrir](https://red1oon.github.io/bim-ootb/erp/erp.html) · [Guide](ERPUserGuide.md) · [Caisse et cuisine (POS, jumeau d'uniCenta)](TillUserGuide.md) · [Autres vues](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Migrer depuis Odoo / Business Central](MigrationGuide.md) · [Ligne de commande (Fast Script)](FastScriptGuide.md) · [Teams overlay](TeamsOverlayGuide.md)

</div>

> **Praticiens de l'ERP** — intégrateurs, utilisateurs avancés, développeurs et autres projets ERP — commencez par
> **[Migrer et comparer](MigrateComparisonPaper.md)** : comment le Kernel-ERP replie un tenant iDempiere (et Odoo) en direct
> sur un seul op-log signé, ce qui soutient la comparaison avec une pile existante, et les lacunes, en toute honnêteté.

## Chaque application a sa propre adresse

Chaque application est une page distincte avec sa propre adresse. En ouvrir une ne charge que cette application, pas les autres, si bien qu'une
petite tâche reste petite. La caisse, par exemple, ne charge jamais la visionneuse 3D.

| Application | Adresse | Téléchargé lors d'une première visite |
|---|---|---|
| Porte d'entrée | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | environ 0.1 Mo |
| BIM Viewer | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | environ 3 Mo, plus le bâtiment que vous ouvrez |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | environ 1.3 Mo |
| Page de démarrage de l'ERP (bulles) | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | environ 0.1 Mo |
| Formulaires de l'ERP (l'aspect iDempiere) | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | environ 1.4 Mo, plus environ 7 Mo pour la base de données de l'ERP |
| Caisse · Écran de cuisine | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | environ 0.1 Mo · moins de 0.1 Mo |

La page des formulaires de l'ERP enregistre sa base de données dans votre navigateur après la première visite, si bien que les visites suivantes ne
la téléchargent plus. *Tailles comptées le 2026-11-08 à partir des fichiers publiés (compressés, tels qu'envoyés sur le réseau).*

## Travailler en équipe

Plusieurs personnes — ou plusieurs de vos propres appareils — peuvent travailler sur les mêmes enregistrements (des commandes dans l'ERP, le bâtiment
dans le Modeller) **sans serveur de base de données et sans serveur d'applications**. Appuyez sur la pastille **Team** (les deux têtes ;
dans le Modeller, l'icône Team) et sur **Turn on team mode** ; le premier appareil **Starts a team**, les autres **Join**
et y sont approuvés, et chacun appuie sur **Visit** pour envoyer ses changements et récupérer ceux des autres. Un
lieu d'essai prêt à l'emploi vous permet d'essayer un cycle complet sans rien configurer.

[:octicons-arrow-right-24: Guide d'équipe](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[Comment vérifier les conditions](TermsHowToVerify.md) ·
[Teams overlay (démonstrateur ALPHA : points de qui a fait quoi, discussion, graphes)](TeamsOverlayGuide.md)

## Aussi sur la porte d'entrée

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __À propos et installation__

    Ce qu'est BIM OOTB, et comment le conserver. C'est une **PWA sans friction** — votre navigateur peut l'*installer* (ajout à l'écran d'accueil) pour qu'elle s'exécute **hors ligne, sans serveur**. La même boîte contient un onglet **Run it yourself (DIY)** : téléchargez un script d'installation en une étape et un README pour héberger toute la pile sur votre propre machine.

    _Porte d'entrée → l'icône **About** (ci-dessus)_ · [Guide d'auto-hébergement](SYSTEMS_INSTALLER_GUIDE.md) ·
    [Installation entièrement hors ligne / isolée](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Vider le cache__

    Revient à l'écran de départ. N'efface que les **données de bâtiments dans le navigateur** — les bâtiments en cache et toute scène IFC que vous avez déposée sans jamais l'enregistrer dans un `.db` — et vous ramène à la porte rouge / bleue. **Conserve** l'application installée, ses données hors ligne et tout fichier `.db` que vous avez enregistré vous-même.

    _Porte d'entrée → l'icône **Trash** (ci-dessus)_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. Licence MIT.*
