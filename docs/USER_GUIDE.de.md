---
description: BIM-OOTB-Benutzerhandbuch — IFC-Gebäude in 3D ansehen, Geometrie erstellen und das Kernel-ERP betreiben, alles clientseitig in einem Browser-Tab ohne Installation.
review: machine
source_sha: d3494de4a72ae85a
lang: de
---
# BIM OOTB — Benutzerhandbuch

Ein Browser. Ein Gebäude **ansehen** · Geometrie **erstellen** · das ERP **betreiben**. Keine Installation, alles clientseitig.

!!! privacy "🔒 Garantie zur Datensicherheit"
    **In dieser App gibt es keine KI und kein LLM. Ihre Daten verlassen Ihren Browser nie.** Jede Datei, die Sie
    in die App ziehen, bleibt in der eigenen IndexedDB und im Kernel Ihres Browsers, geschützt durch die übliche Browser-Sicherheit —
    und Sie speichern sie wieder auf Ihrem eigenen Rechner, wann und wo Sie möchten. Jede IFC, die Sie ablegen,
    jedes Gebäude, das Sie öffnen, jede ERP-Änderung bleibt clientseitig auf Ihrem eigenen Gerät — nichts wird zu
    uns hochgeladen, und kein Modell wird mit Ihren Daten gespeist. Die Startseite und die Viewer-Seite führen einen einfachen Besucherzähler
    (GoatCounter) — er zählt Seitenbesuche (die Seitenadresse kann enthalten sein), liest oder sendet nie den Inhalt einer Datei und tut offline nichts; das ERP hat keinen. Einige optionale Funktionen, die Sie selbst auslösen — Freigabelinks (TinyURL), QR-Codes
    (qrserver.com) und die Update-Prüfung (GitHub) — rufen diesen öffentlichen Dienst auf und senden ihm nur die URL
    oder die Anfrage, die diese Funktion braucht, nie Ihre Datei. Jedes Ergebnis ist deterministisch
    und lässt sich auf eine Zeile offenen Codes zurückführen, die Sie lesen können.

    [**Die vollständige Garantie lesen — wie das Vertrauensmodell funktioniert →**](EnterpriseAuthentication.md) · Möchten Sie es nach der Installation vollständig vom Netzwerk getrennt
    betreiben? [**Handbuch zur vollständig Offline- / Air-Gap-Installation
    →**](OFFLINE_INSTALL_GUIDE.md)

![Die Matrix-Startseite — wählen Sie Ihre Tür](assets/matrix_landing.png)

Beginnen Sie an der **[Eingangstür → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** — der
Matrix-Startseite (rot / blau → runder Auswähler). Wählen Sie eine Tür oder springen Sie über die URLs unten direkt zu jeder App.
**Setzen Sie ein Lesezeichen auf eine beliebige davon**; drücken Sie auf jeder Oberfläche **Home**, um zur Eingangstür zurückzukehren. Bei einem erneuten Besuch
zeigt die Startseite den kompakten `⋯`-Starter; mit **Aktualisieren** erscheint wieder der volle runde Auswähler.

**Brauchen Sie nur schnell eine IFC-Aufgabe erledigt?** Auf IFC4.3 hochstufen, ein Element in eine eigene IFC herausziehen, nach Geschoss aufteilen oder die Gesundheit eines Modells prüfen — Datei ablegen, und es läuft. **[BIM Tools — Benutzerhandbuch →](BIMToolsGuide.md)**

Neu dabei? In **[Neuigkeiten](WhatsNew.md)** finden Sie ein laufendes Protokoll der ausgelieferten Änderungen.

## Eine Oberfläche wählen

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **Legen Sie Ihre eigene IFC ab** → sie wird direkt im Browser nach SQLite extrahiert; Disziplinen zusammenführen, Durchflug, Kollisionsmatrix, 4D/5D-Zeitmaschine, ERP-Projektauftrag — alles an derselben Datei. Desktop und Mobilgerät, funktioniert offline.

    _Eingangstür → das Symbol **Buildings / IFC** (oben)_ · [Öffnen](https://red1oon.github.io/bim-ootb/#buildings) · [Handbuch](BIMUserGuide.md) · [Tiefbau (Straßenmodelle)](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    B-Rep-Geometrie erstellen — Bibliotheksteile einfügen, skizzieren, extrudieren, entlangführen — wo das signierte Op-Log *der* Feature-Baum ist. Frühe Phase/in Arbeit; Desktop.

    _Eingangstür → das Symbol **BIM Modeller** (oben)_ · [Öffnen](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [Handbuch](ModellerGuide.md) · [Handbuch für KI-Vorschläge](ProposerGuide.md) · [2D-Zeichnungen → BIM (DXF2BIM)](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    Echtes iDempiere im Browser — POS, Finanzberichte, das vollständige Application Dictionary aus SQLite. Kein Java, kein Server, keine Installation.

    _Eingangstür → das Symbol **ERP** (oben)_ · [Öffnen](https://red1oon.github.io/bim-ootb/erp/erp.html) · [Handbuch](ERPUserGuide.md) · [Kasse & Küche (POS, uniCenta-Zwilling)](TillUserGuide.md) · [Weitere Linsen](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Von Odoo / Business Central migrieren](MigrationGuide.md) · [Kommandozeile (Fast Script)](FastScriptGuide.md) · [Team-Overlay](TeamsOverlayGuide.md)

</div>

> **ERP-Praktiker** — Implementierer, Power-User, Entwickler und andere ERP-Projekte — beginnen mit
> **[Migrieren & Vergleichen](MigrateComparisonPaper.md)**: wie Kernel-ERP einen laufenden iDempiere-
> (und Odoo-)Mandanten auf ein signiertes Op-Log faltet, was dem Vergleich mit einem Altsystem standhält und wo die ehrlichen Lücken liegen.

## Jede App hat ihre eigene Adresse

Jede App ist eine eigene Seite mit eigener Adresse. Das Öffnen einer App lädt nur diese App, nicht die anderen, sodass eine
kleine Aufgabe klein bleibt. Die Kasse lädt zum Beispiel nie den 3D-Viewer.

| App | Adresse | Beim ersten Besuch geladen |
|---|---|---|
| Eingangstür | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | etwa 0.1 MB |
| BIM Viewer | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | etwa 3 MB, plus das Gebäude, das Sie öffnen |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | etwa 1.3 MB |
| ERP-Startseite (Blasen) | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | etwa 0.1 MB |
| ERP-Formulare (der iDempiere-Look) | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | etwa 1.4 MB, plus etwa 7 MB für die Datenbank des ERP |
| Kasse · Küchenbildschirm | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | etwa 0.1 MB · unter 0.1 MB |

Die ERP-Formularseite speichert ihre Datenbank nach dem ersten Besuch in Ihrem Browser, sodass spätere Besuche sie nicht erneut
laden. *Größen gezählt am 2026-11-08 aus den veröffentlichten Dateien (komprimiert, wie über das Netzwerk gesendet).*

## Im Team arbeiten

Mehrere Personen — oder mehrere Ihrer eigenen Geräte — können an denselben Datensätzen arbeiten (Aufträge im ERP, das Gebäude
im Modeller), **ohne Datenbankserver und ohne Anwendungsserver**. Drücken Sie die **Team**-Schaltfläche (die zwei Köpfe;
im Modeller das Team-Symbol) und **Turn on team mode**; das erste Gerät **Starts a team**, die anderen **Join**
und werden dort freigegeben, und alle drücken **Visit**, um ihre Änderungen zu senden und die der anderen zu holen. Ein
fertiger Testplatz lässt Sie einen vollständigen Zyklus ausprobieren, ohne etwas einzurichten.

[:octicons-arrow-right-24: Team-Handbuch](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[So prüfen Sie die Bedingungen](TermsHowToVerify.md) ·
[Team-Overlay (ALPHA-Demonstrator: Wer-hat-was-getan-Punkte, Chat, Graphen)](TeamsOverlayGuide.md)

## Außerdem an der Eingangstür

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __Info & Installation__

    Was BIM OOTB ist und wie Sie es behalten. Es ist eine **reibungslose PWA** — Ihr Browser kann sie *installieren* (zum Startbildschirm hinzufügen), sodass sie **offline und ohne Server** läuft. Im selben Feld gibt es den Reiter **Run it yourself (DIY)**: Laden Sie ein Ein-Schritt-Installationsskript samt README herunter, um den ganzen Stack auf Ihrem eigenen Rechner selbst zu betreiben.

    _Eingangstür → das Symbol **About** (oben)_ · [Handbuch zum Selbstbetrieb](SYSTEMS_INSTALLER_GUIDE.md) ·
    [Vollständig offline / Air-Gap-Installation](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Cache leeren__

    Setzt auf den Startbildschirm zurück. Löscht nur die **Gebäudedaten im Browser** — zwischengespeicherte Gebäude und jede IFC-Szene, die Sie abgelegt, aber nie in einer `.db` gespeichert haben — und bringt Sie zurück zum rot / blauen Tor. **Behält** die installierte App, ihre Offline-Daten und jede `.db`-Datei, die Sie selbst gespeichert haben.

    _Eingangstür → das Symbol **Trash** (oben)_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
