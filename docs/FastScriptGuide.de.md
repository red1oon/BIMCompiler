---
review: machine
source_sha: 276f5bede717d2ac
lang: de
---

# Fast Script Benutzerhandbuch

**Geben Sie den BIM- und ERP-Apps jeweils einen kurzen Befehl, oder ein paar Zeilen in einer Datei, und erhalten Sie die eigene Antwort der App zurück. Dieselben Zeilen funktionieren für Sie am Terminal und für eine KI.**

Dies ist das Handbuch zur **einen Tür**: einer kleinen Skript-Engine, die vor den Apps sitzt. Sie schreiben eine Zeile wie `modeller.lines building=HospitalGarage`. Die Tür liest sie, prüft sie gegen eine feste Liste von Verben, ruft den eigenen Code der App auf und gibt die Antwort zurück, zusammen mit dem, was nicht geprüft wurde. In der Tür steckt keine KI.

![Eine Tür. Die Akteure links sprechen dieselben Verben; die Tür analysiert, prüft, bindet, ruft auf und antwortet; die eigenen Prüfungen der App entscheiden.](figs/one_door.svg)

Lesen Sie das Bild von links nach rechts.

1. **Akteur.** Wer die Zeile sendet, und der Weg, auf dem sie ankommt. Heute ist das eine KI über eine Werkzeugverbindung oder eine Person am Terminal. Ein Postfach, ein Telefon und ein Gerät sind geplant und **noch nicht gebaut**.
2. **Kanal: die Verben.** Eine Liste von allem, was ein Akteur sagen darf. Jedes Verb hat eine einfache Beschreibung, seine Eingaben und eine *Schadensklasse*. Die ganze Liste finden Sie [weiter unten](#the-verbs).
3. **Eine Tür: die Skript-Engine.** Sie analysiert die Zeile, prüft die Eingaben, bindet die Zeile an den, der fragt, ruft die App auf und antwortet. Jeder Akteur geht durch dieselbe Tür, darum ergibt dieselbe Zeile dieselbe Antwort.
4. **Engine: die App.** Die eigenen Prüfungen der App entscheiden. Eine Änderung, die ein neues Problem hinzufügt, wird rückgängig gemacht, und der Grund kommt zurück.

!!! warning "Was eine gute Antwort nicht bedeutet"
    Eine Antwort ohne Problem bedeutet **nie sicher, regelkonform oder gut**. Jede Antwort listet auf, was nicht geprüft wurde, und [Was nicht geprüft wird](#what-is-not-checked) führt es noch einmal auf. Ein Statiker hat das letzte Wort.

**Neu hier, mit einer KI?** Wie Sie eine KI an die Tür anschließen, steht im [Handbuch für KI-Vorschläge](ProposerGuide.md#connect-your-ai). Diese Seite ist für Befehle und Skripte, die Sie selbst schreiben, und für das Lesen dessen, was zurückkommt.

## `red1` auf einen Blick

`red1` ist der kurze Weg hinein: ein Prompt für die BIM- und ERP-Apps. Jedes Kurzwort gibt die vollständige Türzeile aus, die es ausführt (nach `→`), sodass Sie die lange Form nebenbei lernen. Der [vollständige red1-Abschnitt](#the-red1-shell-short-words-at-one-prompt) steht gegen Ende dieser Seite.

| Eingabe | Was es tut |
|---|---|
| `red1` | den `red1>`-Prompt öffnen (`node common/door/red1.js`, oder `red1` nach einmaligem `npm link`) |
| `cd Duplex` · `cd Element` · `cd Order` · `cd ..` · `pwd` | zu einem Gebäude, einer seiner Arten oder einer ERP-Art wechseln; zurück; wo Sie sind |
| `count` · `ls` · `group storey` · `sum <column>` · `cat <id>` | hier zählen, auflisten, gruppieren, addieren, einen Datensatz zeigen |
| `ls element_name=*bath*` | Mit Platzhaltern suchen: `*` eine beliebige Zeichenfolge, `?` ein Zeichen, `[abc]` eines davon |
| `clash ARC MEP` · dann `ls` · `ls *Bath*` | Kollisionen als Trichter gezeichnet; ihre Zeilen; die passenden Zeilen |
| `clash` | ein Menü der Disziplinen des Gebäudes öffnet sich: Pfeiltasten oder eine Ziffer, dann Eingabe |
| `next <number>` · `do complete <number>` | was ein Dokument jetzt tun darf; es tun |
| `menu` · `help` · `help verbs` · `exit` | das ERP-Menü; die Wörter; jedes Verb der Tür; beenden |
| `red1 'cd Duplex; count'` | dieselben Wörter aus einem Skript, in einem Zug |

## Die Tür besorgen

Sie brauchen Node 18 oder neuer. Diese Schritte wurden mit Node 18.19 ausgeführt.

**Die Modeller-Verben brauchen sechs Dateien.** Legen Sie einen leeren Ordner an, installieren Sie die Browser-Engine und laden Sie die Dateien herunter:

```bash
mkdir fastscript && cd fastscript
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
curl -O https://red1oon.github.io/bim-ootb/common/door/door.js
curl -O https://red1oon.github.io/bim-ootb/common/door/verbs.json
curl -O https://red1oon.github.io/bim-ootb/common/door/msg_core.js
curl -O https://red1oon.github.io/bim-ootb/common/door/vocab/messages.json
```

Behalten Sie alle sechs im selben Ordner. `door.js` liest die Verbliste aus `verbs.json` und seine Meldungen aus `messages.json` (über `msg_core.js`) und startet `edit_cli.js`, das die laufende Modeller-Seite ohne Fenster öffnet. Fehlt eine Datei, sagt die Tür, welche, und gibt ihre `curl`-Zeile aus. `bim_mcp.js` dient nur dem Anschluss einer KI; die Befehle auf dieser Seite brauchen es nicht.

**Die Verben für Viewer, Objekte und Zeitplan brauchen einen vollständigen Checkout.** Sie sind nicht in den sechs Dateien enthalten. Holen Sie sich das ganze `bim-ootb`-Repository (`git clone https://github.com/red1oon/bim-ootb`) und führen Sie `node common/door/door.js` statt `node door.js` aus dessen oberstem Ordner aus. Die [Verbtabelle](#the-verbs) nennt zu jedem Verb, welche der beiden Möglichkeiten es braucht. Ein Download aus einer einzigen Datei für den Viewer ist noch nicht gebaut.

## Ihr erster Befehl

Eine Zeile, ein Verb, `key=value`-Paare ohne Leerzeichen um das `=`. Fragen Sie die HospitalGarage nach ihrem Raster:

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwhmmeq9-2276636-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":16010,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

Das öffnet den Modeller und das Gebäude und dauert daher 10 bis 40 Sekunden. Sie sehen eine Zeile JSON, einen **Umschlag** (envelope). Hier ist nur der Anfang gezeigt; das Raster hat mehr Linien, als hineinpassen. Die Antwort steht unverändert, als die eigene Antwort der App, in `answer`. Hier liegt `gx5` bei 145.987 m und `gx6` bei 157.163 m auf dem eigenen Raster des Gebäudes. `status` ist `ok`.

!!! note "Woher kommt die „request“?"
    Jede Zeile erhält eine Anfrage-ID (`"request":"d-…"`) und wird vor der Ausführung in ein Journal geschrieben, in `~/.cache/bim_door/journal.jsonl`. Senden Sie dieselbe ID zweimal, erhalten Sie die erste Antwort zurück, sodass eine Wiederholung nie eine Änderung doppelt ausführt. Die Tür gibt außerdem eine `§DOOR …`-Zeile auf dem Fehlerstrom aus; dieses Handbuch zeigt nur die Standardausgabe.

## Ein Verb für eine ganze Anfrage

Eine Anfrage wie *„Mach das Feld zwischen gx5 und gx6 13 m breit“* besteht aus mehreren Schritten: das Raster lesen, die Verschiebung berechnen, die Verschiebung versuchen. Das Verb `modeller.widen_bay` erledigt alle drei. Seine Eingaben sind die beiden Linien und die gewünschte Breite:

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

Der Exit-Code ist die erste Antwort: `0` bedeutet ok, `3` bedeutet, dass die App eine Antwort gab, die kein einfaches Ja ist (refused, zurückgehalten oder inconclusive), `1` bedeutet einen Fehler und `2` einen falschen Befehl. Sehen Sie jetzt in die Datei. Zuerst kommt die ganze Anfrage, dann ihre zwei Schritte, jeder mit eigenem Umschlag:

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwhmmrdh-2276921-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwhmmrdh-2276921-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmmrdh-2276921-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

Der erste Schritt las das Raster. Er fand das Feld, wie es jetzt ist:

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

Das Feld ist also 157.163 − 145.987 = **11.176 m** breit. Um 13 m zu erreichen, muss die Linie `gx6` samt allen folgenden Linien um **1.824 m** verschoben werden. Die Tür hat das ausgerechnet, und der zweite Schritt hat es weitergegeben:

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

Die App versuchte die Verschiebung, prüfte sie und **hielt sie an**:

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

Die Änderung wurde gemacht, beurteilt und rückgängig gemacht. Es wird nie etwas gespeichert. Die Zahlen hinter dem Stopp stehen im Bericht der App:

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

Das Feld wuchs von 11.176 m auf 13 m und liegt damit über der Grenze von 12 m dieses Gebäudes für einen Betonträger (`limit` und `material` kommen vom Gebäude selbst). Das ist die ganze Geschichte der Garagen-Anfrage: Ein 13-m-Feld braucht eine weitere Stützenlinie.

## Ein Skript: mehrere Zeilen, ein benanntes Ergebnis {#a-script-several-lines-a-named-result}

Ein Skript ist eine Textdatei mit einem Befehl pro Zeile. Eine Zeile darf mit einem **Namen** und einem `=` beginnen, wodurch ihre Antwort für die Zeilen darunter erhalten bleibt. Alles nach `--` ist ein Kommentar. Speichern Sie dies als `bay.door`:

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

Führen Sie es mit `--script` aus:

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

Text in `{ }` ist Arithmetik. Erlaubt sind Zahlen, `+ - * /`, Klammern und Felder eines benannten Ergebnisses. `lines.model.lines[gx6].pos` bedeutet: in der Antwort namens `lines`, unter `model`, der Eintrag von `lines`, dessen id `gx6` ist, davon `pos`. Nur Felder, die das Verb deklariert, können gelesen werden; jeder andere Name ist ein Fehler, der das sagt.

Die Arithmetik ist **exakt dezimal**, nicht Gleitkomma. Ein Computer mit Gleitkomma erhält `12 - 11.176 = 0.8239999999999998`. Die Tür erhält dies:

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

Ein Skript läuft von oben nach unten und **hält an der ersten Zeile an, die nicht ok ist**. Hier antworten beide mit `ok`:

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwhmni28-2277438-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmntjy-2277438-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

Bei genau 12 m findet die App kein neues Problem: Die Anzahl der Trägerspannweiten über der Grenze bleibt, wo sie war.

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

Dasselbe Gebäude wird also bei 13 m angehalten und besteht bei 12 m. Ein `ok` ist kein Versprechen, dass das Gebäude gut ist: Es gilt dieselbe [Liste dessen, was nicht geprüft wird](#what-is-not-checked).

### Die Zeilengrammatik

| Teil | Regel |
|---|---|
| Ein Befehl | `app.verb key=value key=value`, einer pro Zeile |
| Ein Wert mit Leerzeichen | in doppelte Anführungszeichen setzen: `text="a note"` |
| Ein benanntes Ergebnis | `name = app.verb …`; spätere Zeilen lesen `name.field` |
| Arithmetik | `{ … }` mit Zahlen, `+ - * /`, Klammern und Ergebnisfeldern; exakte Dezimalzahlen |
| Ein Kommentar | `--` und der Rest der Zeile |
| Einheiten | werden nie in die Zeile geschrieben; das Verb legt Meter, Stunden oder Tage fest |
| Alles andere | kein Befehl: Es kommt als Frage zurück, nicht als Aktion |

Die letzte Zeile ist Absicht. Text, der zu keinem Verb passt, wird **nie erraten**:

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwhmo809-2277927-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.find","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":0}
```

## Die Antwort lesen

Jede Zeile von jedem Akteur erhält denselben Umschlag. Lesen Sie diese Felder der Reihe nach.

| Feld | Bedeutung |
|---|---|
| `status` | `ok`, `refused`, `claim`, `error` oder `inconclusive`. Lesen Sie dieses zuerst |
| `why` | der Grund, wenn der Status nicht `ok` ist |
| `answer` | die eigene Antwort der App, unverändert |
| `notChecked` | was die Prüfung nicht abgedeckt hat. Immer weitergeben |
| `request`, `verb`, `actor` | welche Zeile, welches Verb, wer gefragt hat |
| `ops` | was geschrieben wurde, bei einem Verb, das schreibt |
| `next` | reserviert; heute leer |
| `ms` | wie lange es gedauert hat |

Die fünf Status, jeder aus einem echten Lauf:

**ok.** Die App antwortete und nichts wurde zurückgehalten. Der erste Befehl auf dieser Seite ist einer. Lesen Sie auch dann `notChecked`.

**refused.** Die App gab eine Antwort, die kein Ja ist. Die 13-m-Anfrage oben ist eine: Sie wurde versucht, beurteilt und rückgängig gemacht, und `why` sagt, warum. Eine Ablehnung ist eine Antwort, kein Versagen. Auch Text, der kein Befehl ist, wird mit `refused` beantwortet (die Frage oben).

**error.** Die Zeile selbst ist falsch: eine fehlende Eingabe, ein unbekanntes Verb, ein Wert der falschen Art. Es lief nichts.

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwhmo856-2277937-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":2}
```

**claim.** Die Zeile ist verstanden, aber der Akteur hat keinen Nachweis, der sie erlaubt, darum **hält die Tür sie zurück und führt sie nicht aus**. Das ist die Sicherheitsregel für eine KI, und sie kommt vom Verb, nicht vom Akteur. Siehe [Was ist ein Claim](#what-is-a-claim).

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":5}
```

**inconclusive.** Die App konnte nicht urteilen und sagt das. Es wird nie zu einem `ok` gemacht. Hier hat der Viewer keine Kollisionsregel für das Paar ARC und ZZZ. Dieses Beispiel braucht einen Checkout:

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwhmo8hh-2277957-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":24342}
```

### Was ist ein Claim {#what-is-a-claim}

Jedes Verb hat eine **Schadensklasse**: `read` (ändert nichts), `trial` (eine Änderung an einer Wegwerfkopie, beurteilt, nie gespeichert), `writes`, `posts` oder `sends`. Die Klasse steht einmal in der Verbliste, sodass kein Akteur sie umgehen kann.

Jeder Akteur hat einen Nachweis. Einer Person am Terminal wird für jede Klasse vertraut. Einer **KI** wird nur für `read` und `trial` vertraut: Sie darf schauen und versuchen, aber ein `writes`-, `posts`- oder `sends`-Verb von einer KI wird als Claim zurückgehalten, wie die `object.update`-Zeile oben. Ein Akteur ganz ohne Nachweis, etwa eine Mail von einem unbekannten Absender, darf lesen und sonst nichts:

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":2}
```

Ein zurückgehaltener Claim wird nicht ausgeführt, nicht in eine Warteschlange gestellt und nicht verloren: Er steht im Journal, unter seiner Anfrage-ID. Die Tür bestätigt nichts im Namen von jemandem.

### Einen Claim bestätigen

Eine Person lässt einen zurückgehaltenen Claim **über seine Anfrage-ID** durch, sodass genau die Zeile läuft, die vorgeschlagen wurde. Niemand tippt sie neu. Hier bittet eine Mail um eine Probeverschiebung und wird zurückgehalten:

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":2}
```

`--claims` listet auf, was zurückgehalten wird:

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm` führt die aufgezeichnete Zeile einmal aus, als Sie:

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

Die Antwort ist die gewöhnliche und nennt den Claim, den sie bestätigt hat. Erneutes Fragen führt nichts aus: Die Tür antwortet aus ihrer Aufzeichnung.

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

Drei Regeln gelten. Nur eine Person am Terminal darf bestätigen: `--actor ai --confirm …` wird abgelehnt, und der Claim bleibt zurückgehalten. Die App entscheidet im Moment der Bestätigung noch einmal, sodass eine Zeile, die seit dem Vorschlag falsch geworden ist, mit dem Grund der App abgelehnt wird. Und die Werkzeugverbindung einer KI hat gar keinen Bestätigungsbefehl.

**Was dies nicht beweist.** Die Tür vertraut jedem, der am lokalen Terminal sitzt. Eine KI, die Shell-Befehle auf Ihrem Rechner ausführen darf, könnte `--confirm` selbst eintippen, so wie sie eine Zeile als Sie eintippen könnte. Beschränken Sie den Zugriff einer KI auf ihre Werkzeugverbindung, wenn das wichtig ist.

## Die Tür aus einem eigenen Skript nutzen

Alles oben ist `door.js`, dieselbe Datei, die auch die KI-Verbindung nutzt. Rufen Sie sie aus Ihrem eigenen Programm als Befehl auf und lesen Sie ihr JSON: Der Exit-Code (`0`, `3`, `1`, `2`) sagt, ob Sie eine Antwort oder ein Problem lesen, und `status` sagt, welches. `--actor human` ist die Vorgabe; `--actor ai` lässt die Tür die Zeile als die einer KI behandeln.

## Fragen, was etwas ist: `object.describe`

Ein Verb kann das Modell auch selbst fragen, was es enthält. `object.describe` ist **Reflexion**: Es liest das eigene Wörterbuch des Modells und sagt, welche Eigenschaften eine Objektart hat, welche untergeordneten Reiter und welche generischen Methoden für sie erlaubt sind. Es liest nur Wörterbuchzeilen; kein Element wird geöffnet. Es braucht einen Checkout und ein Gebäude, dessen Modell ein eigenes Wörterbuch mitbringt (das Duplex tut es).

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwhmp6f0-2278556-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"…
```

Welche Methoden darf ein `Element` benutzen?

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

Eine unbekannte Art ist ein Fehler, der die Arten auflistet, die das Modell hat, sodass ein falscher Tipp den richtigen Namen lehrt.

## Dinge zählen: `object.count`

`object.count` beantwortet „wie viele“: wie viele Datensätze einer Art das Modell enthält. Das Duplex nennt seine Räume die Art `Room`. Es braucht einen Checkout.

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwhmp7mf-2278599-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":594}
```

Fügen Sie `column=value` hinzu, um die Zählung einzugrenzen. Die Spalte muss eine Eigenschaft der Art sein (`object.describe` listet sie auf), und die Antwort behält die **Grundgesamtheit**, die Zahl vor der Eingrenzung:

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwhmp87z-2278619-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":569}
```

Eine Spalte, die die Art nicht hat, ist ein Fehler, der sie nennt und die echten auflistet. Sie wird nie als „kein Treffer“ gelesen:

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwhmp8u8-2278641-1","verb":"object.count","actor":"human","status":"error","answer":null,"why":"the object engine could not answer (exit 1): kind Room has no property \"floor\" (its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_gu…
```

Ein Modell ganz ohne Räume antwortet nicht mit `0`. Es antwortet mit `inconclusive`, weil nichts gezählt wurde. Eine Null, der Sie vertrauen können, ist eine eingegrenzte Zählung innerhalb einer Grundgesamtheit, die nicht leer ist.

## Was der Walker platzieren würde: `modeller.walk`

Der Modeller hat einen *Walker*, der die Einbauteile einer Disziplin (Sprinkler, Leuchten, Steckdosen) nach Regeln platziert, die an echten Gebäuden gemessen wurden. `modeller.walk` ist ein **Probelauf** davon: Er sagt, was der Walker platzieren würde, und ändert nichts. Die Modelldatei ist danach Byte für Byte dieselbe, und die Antwort sagt das auch. Er braucht einen Checkout. Die vollständige Antwort ist lang, darum zeigt dies ihre Hauptzahlen:

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count` ist alles, was der Walker platzieren würde. `provisional` sind Positionen, die der Walker selbst als nicht endgültig kennzeichnet, zum Beispiel ein Einbauteil, über dem keine Decke gefunden wurde. `rules` ist der Regelsatz, den die Klasse des Gebäudes verwendet: Ein Haus durchläuft die Wohnbau-Regeln. Ein Walk, der nichts platziert, antwortet mit `inconclusive` und dem Grund des Walkers.

## Einen Modeller zwischen den Zeilen offen halten: `model.open`, `model.convert`, `model.addbay`, `model.undo`, `model.save`, `model.close`

Diese Zeilen steuern EINE Modeller-Seite, die im Hintergrund offen gehalten wird (ohne Fenster, auf der CPU, ohne Grafikkarte), sodass jede Zeile auf dem aufbaut, was die Zeile davor hinterlassen hat. `model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"` öffnet die 2D-Blätter, `model.convert` erstellt das 3D-Modell (das eigene Convert der Seite), `model.addbay end=high|low` fügt an diesem Ende eines Gebäudes mit sich wiederholenden Feldern ein Feld hinzu, `model.undo` nimmt die letzte Änderung zurück, und `model.close` beendet die Seite. Die Seite erledigt die ganze Arbeit mit ihren eigenen Funktionen; die Zeile drückt, was eine Person drückt, und gibt die eigene Antwort der Seite aus. Das Modell lebt in dieser Seite, bis Sie es speichern: `model.save` schreibt es in eine `.db`-Datei in diesem Ordner, und `model.close` speichert vorher, wenn sich das Modell geändert hat und eine Speicherdatei bekannt ist. Sie brauchen einen `bim-ootb`-Checkout, und der Ordner, aus dem Sie sie ausführen, enthält die Sitzung (eine Datei `.model_session.json`; der Port lauscht nur auf diesem Rechner, und jede Anfrage trägt ein Einmal-Token).

Regeln, die Ihnen begegnen werden: Eine Zeile vor `model.open` wird abgelehnt („no session: model.open first“), ebenso ein zweites `model.open`, ein zweites `model.convert` und `model.addbay` vor Convert. Ein Feld wird nur angeboten, wenn der Gebäudetyp eines deklariert (Farming Shed [Stallgebäude] tut es); ohne `type=` wird das Feld abgelehnt, mit dem Hinweis, dass der Typ keine Regel deklariert. Die Blätter müssen ihre Markierungen tragen: Einfache Zeichnungsblätter bestehen die Schranke nicht. Jede Zeile braucht einige Sekunden (hier: Öffnen etwa 6 s, Convert 3 s, ein Feld 3 s; bei einem größeren Satz von Blättern brauchte Convert bis zu 15 s). **Speichern:** Benennen Sie die Datei einmal, bei `model.open … file=shed.db` oder beim ersten `model.save file=shed.db`. Ein Speichern führt das eigene Save der Seite aus: zuerst die Kollisionsprüfung (eine ROTE Kollision blockiert das Speichern, wie auf dem Bildschirm, und nichts wird geschrieben), dann wird das Modell als native `.db` geschrieben. Bei diesem Stallgebäude dauert ein Speichern etwa eine halbe Sekunde, und die Antwort nennt die Zeit jedes Schritts. `model.close` mit ungespeicherten Änderungen und ohne Datei wird abgelehnt, und die Sitzung bleibt offen: speichern, oder `model.close discard=Y`, um die Änderungen bewusst zu verwerfen. Ein Speichern, bevor etwas erstellt wurde, wird abgelehnt, mit den Worten der Seite.

Der Block unten kopiert einen Ordner mit 9 markierten Blättern eines Stallgebäudes, benannt durch `SHED_SHEETS`, nach `shed/` und führt die Zeilen nacheinander aus; setzen Sie `SHED_SHEETS` auf Ihren eigenen Ordner mit markierten `.dxf`-Blättern.

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low` fügt das Feld am anderen Ende hinzu (ein anderes Gelenk, dieselben 29 Kopien). Nicht geprüft von diesen Zeilen: die Kosten gegen eine unabhängige Zählung (das macht ein eigener Test) und mehr als eine Sitzung in einem Ordner.

## Listen, Summen und Gruppen: `erp.list`, `erp.sum`, `erp.group`

`count` beantwortet „wie viele“. Drei weitere reine Lese-Verben beantworten „welche“, „wie viel“ und „wie viele von jeder“. Sie nehmen jede Art aus dem Wörterbuch des ERP (und dieselben drei gibt es für das Modell eines Gebäudes als `object.list`, `object.sum`, `object.group`). Sie brauchen einen Checkout.

`erp.list` zeigt Zeilen. Jede Spalte, jeder Filter und jede Sortierung wird gegen das Wörterbuch geprüft, sodass ein falscher Name ein Fehler ist, der die echten auflistet. Fügen Sie `column=value` hinzu, um die Liste einzugrenzen. Die Liste zeigt höchstens 50 Zeilen, wenn `limit` nichts anderes sagt (bis zu 1000), und die Antwort trägt immer die **Gesamtzahl**, sodass eine kurze Liste nie für das Ganze gehalten wird. Mit `offset` blättern Sie durch eine lange:

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`erp.sum` addiert eine Zahlenspalte exakt. Dezimalzahlen werden als Dezimalzahlen addiert, nie als Gleitkomma, damit Geldbeträge nicht abdriften. `erp.group` zählt die Datensätze für jeden Wert einer Spalte, den häufigsten zuerst:

<!-- run: sum_orders -->
```text
$ node common/door/door.js --list 'erp.sum kind=Order column=GrandTotal docstatus=CO'
kind: Order
table: C_Order
column: GrandTotal
filters: [{"column":"DocStatus","value":"CO"}]
n: 14
sum: 19505.9
population: 44
verdict: OK
summary: 19505.9 = sum of GrandTotal over 14 Order
```

<!-- run: group_orders -->
```text
$ node common/door/door.js --list 'erp.group kind=Order by=DocStatus'
DocStatus  count
IP         22
CO         14
DR         6
CL         2
shown 4 of 4
```

Eine Art ganz ohne Datensätze antwortet nicht mit `0` oder einer leeren Liste. Sie antwortet mit `inconclusive`, weil nichts beurteilt wurde.

## Einen Datensatz anlegen: `erp.new`

`erp.new` legt einen Datensatz so an, wie ihn das eigene Fenster des ERP anlegt. Sie nennen die Art und die Spalten, die Sie kennen; die Engine füllt den Rest so, wie es das Fenster tut (Vorgaben, die Auswahl, die ein Partner mitbringt, die Belegnummer aus der Sequenz). Eine Spalte, die das Wörterbuch nicht hat, wird abgelehnt, und die Antwort listet die echten auf. Eine Pflichtspalte, die danach noch leer ist, wird mit Namen abgelehnt, und nichts wird geschrieben. Die Antwort beginnt mit `number`: der Belegnummer, die Sie als Nächstes verwenden.

Ein Verkaufs- oder Einkaufsbeleg braucht `issotrx=Y` oder `N`. Ein Partner oder Produkt darf mit Namen angegeben werden; ein Name, der auf keinen Datensatz oder auf mehr als einen passt, wird abgelehnt. Eine Zeile nennt ihren Beleg über die Nummer:

<!-- run: new_order -->
```text
$ rm -f /tmp/fast_guide_new.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'
{"request":"d-mwhmq2lp-2280086-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":"50000","kind":"Order","table":"c_order","id":1500004,"docStatus":"DR","given":["IsSOTrx","C_DocTypeTarget_ID","C_BPartner_ID","SalesRep_ID"],"defaulted":52,"filled":["ad_client_id","ad_org_id","documentno","isselfservice","dateordered","datepromised","bill_bpartner_id","c_bpartner_location_id","bill_location_id","deliveryrule","priorityrule","m_warehouse_id","isdropship","deliveryviarule","freightcostrule","freightamt","ispriviledgedrate","shippingrateinquiry","invoicerule","m_pricelist_id","c_currency_id","c_conversiontype_id","isdiscountprinted","chargeamt","paymentrule","c_paymentterm_id","totallines","grandtotal","docstatus","c_doctype_id","ispayschedulevalid","copyfrom","docaction","posted","isdelivered","dateacct","amountrefunded","isapproved","processed","processing","istaxincluded","isinvoiced","isselected","isprinted","sendemail","istransferred","iscreditapproved","isactive","processedon","amounttendered","volume","weight"],"record":{"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":0,"grandtotal":0,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}],"next":[],"ms":6973}
```

<!-- run: new_line -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2'
{"request":"d-mwhmq849-2280142-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":null,"kind":"Sales Order Line","table":"c_orderline","id":120002710,"docStatus":null,"given":["M_Product_ID","QtyEntered","C_Order_ID"],"defaulted":31,"filled":["ad_client_id","ad_org_id","c_bpartner_id","c_bpartner_location_id","datepromised","dateordered","line","m_warehouse_id","m_attributesetinstance_id","c_uom_id","qtyordered","qtydelivered","qtyreserved","qtyinvoiced","priceentered","priceactual","pricelist","freightamt","c_tax_id","discount","linenetamt","qtylostsales","processed","createshipment","createproduction","rramt","pricecost","pricelimit","c_currency_id","isactive","isdescription"],"record":{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}],"next":[],"ms":7403}
```

Der Auftrag ist ein Entwurf, bis jemand ihn abschließt. Weil die Zeile die Nummer des Auftrags erhielt, folgen die Summen des Auftrags ohne weiteren Schritt: `totallines` und `grandtotal` im Datensatz unten sind der Betrag der Zeile (6). Die Liste der eigenen Zeilen des Auftrags wird von `erp.read` nicht gefüllt.

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'erp.read kind=Order number=50000'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`erp.new` ist ein `writes`-Verb. Eine Person am Terminal führt es aus. Das `erp.new` einer KI wird als Claim zurückgehalten, und nichts wird geschrieben, bis eine Person es bestätigt (siehe „Was ist ein Claim“). Diese Blöcke verwenden ein Wegwerf-Op-Log (`/tmp/fast_guide_new.ops`, vorher geleert), sodass ihre Ausführung Ihre eigenen Daten nicht berührt.

## Mit jeder Tabelle arbeiten: die `mis.*`-Verben

**MIS ist die Basis. ERP ist MIS plus das Leben eines Belegs.** Auflisten, Lesen, Anlegen, Ändern, Löschen und Laden von Datensätzen ist auf jeder Tabelle des Wörterbuchs gleich, bei einem Kunden, einem Produkt, einer Tabelle, die Sie selbst gemacht haben. Diese Verben heißen `mis.*`. Was nur ein Beleg hat (abschließen, stornieren, schließen, umkehren), bleibt `erp.*`. Die älteren Namen `erp.list`, `erp.read`, `erp.describe`, `erp.sum`, `erp.group` und `erp.new` funktionieren weiter: Jeder ist ein alter Name für sein `mis.*`-Verb und gibt dieselbe Antwort, sodass sich ein früher geschriebenes Skript nicht ändert.

Jedes schreibende `mis.*`-Verb tut, was das eigene Fenster des ERP tut. Es bearbeitet nicht die Datenbank darunter. Vorgaben und Callouts laufen, die Prüfungen laufen, eine Ablehnung sagt, warum, und nichts wird geschrieben, wenn irgendetwas abgelehnt wird.

**Was fehlt noch?** `mis.new … dry=Y` führt alles außer dem Speichern aus und schreibt nichts. Es antwortet, welche Pflichtspalten nach den Vorgaben noch leer sind, sodass Sie wissen, was Sie angeben müssen:

<!-- run: mis_dry cut=330 -->
```text
$ rm -f /tmp/fast_guide_mis.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner dry=Y'
dry: true
kind: Business Partner
table: c_bpartner
mandatory: ["Value","Name"]
needs: []
given: []
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
ops: []
```

**Anlegen, ändern, lesen.** Eine Spalte, die einen anderen Datensatz enthält, darf mit seinem Namen angegeben werden. `mis.list … names=Y` zeigt solche Spalten als Namen, wie es das Raster des Fensters tut:

<!-- run: mis_new cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner Value=GD100 Name="Guide Partner One"'
number: Guide Partner One
kind: Business Partner
table: c_bpartner
id: 1600010
docStatus: 
given: ["Value","Name"]
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
record: {"c_bpartner_id":1600010,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:26:07","createdby":101,"updated":"2026-11-15 17:26:07","updatedby":101,"value":"GD100","name":"Guide Partner One","name2":null,"description":null,"issummary":"N","c_bp_group_id":103,"isonetime":"N","isprospect":"N","isvendor…
ops: [{"op_type":"CRUD_CREATE","table":"c_bpartner"},{"op_type":"CRUD_CREATE","table":"ad_treenodebp"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"}]
```

<!-- run: mis_update cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.update kind=C_BPartner number="Guide Partner One" description="first supplier"' | grep -E '^(noop|given|changed|derived):'
noop: false
given: ["Description"]
changed: ["description"]
derived: []
```

<!-- run: mis_list -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_BPartner value=GD100 columns=Value,Name,Description,C_BP_Group_ID names=Y'
Value  Name               Description     C_BP_Group_ID
GD100  Guide Partner One  first supplier  Standard Customers
shown 1 of 1
```

`mis.update` sendet nur die Spalten, die Sie angeben; die Werte anzugeben, die ein Datensatz schon hat, ändert nichts, und die Antwort sagt `noop`. Eine Spalte, die das Fenster einer Person nicht ändern ließe (ein schreibgeschütztes Feld oder jede Spalte eines abgeschlossenen Belegs), wird abgelehnt, und die Antwort nennt die Regel. Leeren Sie eine Spalte mit dem Wert `<null>`.

**Eine Spalte, die auf einen anderen Datensatz zeigt** (ein Geschäftspartner, ein Produkt, ein Lager), muss einen Datensatz nennen, der existiert und den Ihre Firma verwenden darf. `mis.new` prüft jede solche Spalte und `mis.update` die, die Sie ändern, und eine falsche wird mit den eigenen Worten des Legacy-ERP abgelehnt, zum Beispiel `Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`, oder `Cross tenant ID … not allowed in …` für einen Datensatz einer anderen Firma. Ein Wert außerhalb der Gültigkeitsregel einer Nachschlageliste (die Liste, die ein Fenster anbieten würde) wird NICHT abgelehnt: Das Legacy-ERP speichert ihn ebenfalls, denn die Regel bestimmt nur, was das Fenster anbietet.

**Löschen.** `mis.delete` ist das Löschen des Fensters. Es lehnt ab, was das Fenster ablehnt, mit den eigenen Worten der Engine, und schreibt nichts. Der Standardpartner wird von anderen Datensätzen verwendet:

<!-- run: mis_refuse cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner id=112'
refused: true
reason: Business Partner Standard is not deleted: Record not deleted - dependent record found; nothing was written
```

<!-- run: mis_delete cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner number="Guide Partner One"' | grep -E '^(gone|opSummary):'
gone: true
opSummary: {"delete:c_bp_customer_acct":2,"delete:c_bp_vendor_acct":2,"delete:c_bpartner":1,"delete:ad_treenodebp":1}
```

**Viele aus einer CSV laden.** `mis.load` liest eine `.csv` (die erste Zeile enthält die Spaltennamen, ein Datensatz pro Zeile) und führt darauf den eigenen Prozess Migrate Excel Data (Excel-Daten migrieren) des ERP aus. Dieser Prozess gilt ganz oder gar nicht, darum **prüft** `mis.load` zuerst (`dry=Y`, die Vorgabe) und schreibt nichts: Es zählt die Zeilen und benennt jede fehlerhafte. Neben Ihre Datei schreibt es `….rejected.csv` (die fehlerhaften Zeilen und warum) und `….ok.csv` (die guten):

<!-- run: mis_load cut=330 -->
```text
$ printf 'Value,Name,C_BP_Group_ID\nGD201,Guide Two,Standard Customers\nGD202,Guide Three,Nowhere\n' > /tmp/fast_guide_mis.csv; rm -f /tmp/fast_guide_mis.rejected.csv /tmp/fast_guide_mis.ok.csv; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner file=/tmp/fast_guide_mis.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.csv
rows: 2
ok: 1
rejected: [{"row":2,"why":["C_BP_Group_ID: no C_BP_Group with Name=\"Nowhere\""]}]
unplaced: []
dry: true
loaded: false
files: {"rejected":"/tmp/fast_guide_mis.rejected.csv","ok":"/tmp/fast_guide_mis.ok.csv"}
summary: Nothing migrated: 1 row error(s). c_bpartner row 3 C_BP_Group_ID: no C_BP_Group with Name="Nowhere"
```

<!-- run: mis_rejected -->
```text
$ cat /tmp/fast_guide_mis.rejected.csv
Value,Name,C_BP_Group_ID,rejected_because
GD202,Guide Three,Nowhere,"C_BP_Group_ID: no C_BP_Group with Name=""Nowhere"""
```

Das Laden der Originaldatei mit `dry=N` wird abgelehnt, solange eine Zeile fehlerhaft ist. Beheben Sie die fehlerhaften Zeilen, oder laden Sie die guten, was ein eigener Alles-oder-nichts-Ladevorgang ist:

<!-- run: mis_load_ok cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner dry=N file=/tmp/fast_guide_mis.ok.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.ok.csv
rows: 1
ok: 1
rejected: []
unplaced: []
dry: false
loaded: true
files: {}
summary: No worksheets : 1(C_BPartner = 1 records) 
ops: 6
opSummary: {"create:c_bpartner":1,"create:ad_treenodebp":1,"create:c_bp_customer_acct":2,"create:c_bp_vendor_acct":2}
keys: [1600010]
```

Das `mis.new`, `mis.update`, `mis.delete` oder `mis.load` einer KI wird wie `erp.new` als Claim zurückgehalten: Nichts wird geschrieben, bis eine Person es bestätigt. Das massenhafte Aktualisieren bestehender Datensätze wird nicht angeboten; nehmen Sie `mis.update` für jeden einzeln, sodass die Prüfungen des Fensters laufen.

### Datensätze als Rolle sehen und ändern

Jedes `mis.*`-Verb nimmt `role=`, die ID einer Rolle des ERP. **Ohne Rolle wird nichts gefiltert:** Sie sehen jeden Datensatz jedes Mandanten. Mit einer Rolle erhalten Sie, was diese Rolle in dem Fenster erhält, für das sie freigegeben ist: die Datensätze ihres eigenen Mandanten und ihrer Organisationen, und nur die Datensätze und Spalten, die ihre Zugriffszeilen erlauben. Die Summen zählen nur diese Datensätze. Die Rolle wird in der Zeile angegeben. Sie ist keine Anmeldung.

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^(n|sum):' | tr '\n' ' '; echo; done
n: 43 sum: 74936.76 
n: 8 sum: 9914.07 
n: 27 sum: 55108.62
```

Ein Datensatz außerhalb der Datensätze der Rolle wird genau so beantwortet wie ein Datensatz, den es nicht gibt. Eine Spalte, die die Rolle nur lesen darf, kann nicht geändert werden. Eine Art, für die die Rolle kein Fenster hat, wird abgelehnt; Rolle 103 hat kein Fenster, das Tax (Steuer) zeigt:

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

Fünf Regeln werden noch nicht beurteilt, und eine Rolle, die eine davon verwendet, wird abgelehnt, statt halb geprüft zu werden: eine persönliche Sperre auf einem Datensatz, eine Tabellen-Gültigkeitsregel, eine Rolle, deren Organisationen vom Benutzer kommen, eine Rolle mit einer Sammelorganisation in einem Organisationsbaum und der Datensatzzugriff „abhängige Entitäten“. `mis.load` nimmt keine Rolle.

## Eine eigene Tabelle anlegen: `mis.add_window`

Eine Tabelle, die Sie in einer Tabellenkalkulation führen, kann ein echtes Fenster werden: eine Tabelle, ein Formular, ein Menüeintrag und Rollenzugriff, ohne dass dafür Code geschrieben wird. Beschreiben Sie ihre Spalten in einer kleinen `.csv`, eine Zeile pro Spalte. Nur `Column` ist erforderlich. Der Schlüssel, der Mandant und die Organisation, das Aktiv-Kennzeichen und die Audit-Spalten werden für Sie ergänzt:

<!-- run: win_sheet -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; cat AST_Asset.csv
Column,Type,Length,Mandatory,Default,List,Help
Name,String,60,Y,,,Its name
PurchaseDate,Date,,,,,When it was bought
Cost,Amount,,,,,
Condition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",
IsInsured,,,,,,
```

Eine Zeile erstellt das Fenster (das Blatt wird hier erneut geschrieben, damit die Zeile für sich allein ausgeführt werden kann, aus dem Ordner, der `common/` enthält). Die Tabelle wird nach der Datei benannt. `dry=Y` prüft das Blatt und schreibt nichts. Ein fehlerhaftes Blatt wird mit jedem Fehler und seiner Zeile abgelehnt, und nichts wird geschrieben:

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

Die neue Art funktioniert sofort mit jedem `mis.*`-Verb und mit `mis.js`. Eine Pflichtspalte wird verlangt, eine Vorgabe wird gefüllt, und ein Wert außerhalb der Liste des Blatts wird abgelehnt:

<!-- run: win_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list'; eval "$D 'mis.new kind=AST_Asset Name=Tractor Cost=1200.50'" | grep -E '^(number|filled):'; eval "$D 'mis.new kind=AST_Asset Cost=5'" | grep reason; eval "$D 'mis.new kind=AST_Asset Name=Plough Condition=BAD'" | grep reason; eval "$D 'mis.list kind=AST_Asset columns=Name,Cost,Condition'"; rm -f AST_Asset.csv
number: Tractor
filled: ["ad_client_id","ad_org_id","isactive","condition","isinsured"]
reason: mandatory and still empty after the defaults and callouts: Name (give them as column=value)
reason: Condition Invalid value - BAD - Reference_ID=200277 - FAIR - GOOD - POOR; nothing was written
Name     Cost    Condition
Tractor  1200.5  GOOD
shown 1 of 1
```

Die Typen sind String, Quantity, Amount, YesNo, Date, DateTime, Text und List. Eine Spalte, deren Name auf `_ID` endet, ist ein Nachschlagen in dieser Tabelle, und eine, die mit `Is` beginnt, ist ein Ja/Nein. Eine Detailtabelle unter einem Master kommt mit einer Arbeitsmappe: der nächste Abschnitt.

## Eine ganze Arbeitsmappe in einer Zeile: `ninja.exec`

Eine Tabelle aus einer `.csv` ist der kleine Fall. Eine **Ninja-Arbeitsmappe** enthält viele Tabellen auf einmal, sagt, welche Tabelle unter welcher liegt, und kann ihre ersten Zeilen mitführen. Eine Zeile erstellt alles.

Die Arbeitsmappe ist eine gewöhnliche Tabellenkalkulationsdatei (`.xlsx` oder `.xls`):

| Blatt | Was es enthält |
|---|---|
| `1_RO_ModelHeader` | der Name der ganzen Menge, in der ersten Zelle unter `Name` |
| `2_RO_ModelMaker` | eine Zeile pro Tabelle: `Master` (die Tabelle, unter der sie liegt, oder leer), `Name` (die Tabelle), `ColumnSet` (ihre Spalten, durch Kommas getrennt) |
| ein Blatt, das genau nach einer Tabelle benannt ist | zu ladende Zeilen: Zeile 1 enthält die Spaltennamen |

In `ColumnSet` ist ein einfacher Name Text. Ein Präfix gibt einen anderen Typ an: `D#` ein Datum, `A#` ein Betrag, `Q#` eine Menge, `T#` ein langer Text, `Y#` ein Ja/Nein und `L#Name=a/b/c` eine Liste fester Werte. Eine Tabelle, deren `Master` eine andere Tabelle der Arbeitsmappe ist, wird ein Reiter des Fensters dieser Tabelle.

Eine Übungsarbeitsmappe wird mit der Tür geliefert: `common/door/samples/Ninja_Practice.xlsx` (ein Patient, die Besuche des Patienten, die Medikamente eines Besuchs, ein Raum und eine Überweisung, die unter Business Partner (Geschäftspartner) liegt). `dry=Y` liest sie, sagt, was sie erstellen würde, und schreibt nichts:

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

Ohne `dry=Y` erstellt dieselbe Zeile es: die Fenster, die Reiter, die Liste, die Menüeinträge, den Rollenzugriff und dann die Zeilen der Datenblätter. Führen Sie sie ein zweites Mal aus, und sie schreibt nichts:

<!-- run: nx_run cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(windows|detailTabs|dataSheets|ops):'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(alreadyStaged|ops|summary):'
dataSheets: [{"sheet":"PR_Patient","rows":3,"loaded":3,"ops":3},{"sheet":"PR_Room","rows":2,"loaded":2,"ops":2}]
windows: [{"id":7100001,"name":"PR Patient"},{"id":7100004,"name":"PR Room"}]
detailTabs: 3
ops: 151
alreadyStaged: true
ops: 0
summary: this workbook is already staged (5 tables); nothing was written
```

Jede Tabelle funktioniert sofort mit den `mis.*`-Verben. Ein Datensatz unter einem Master nennt die ID des Masters (`mis.read` des Masters zeigt dann, was darunter liegt), und ein Wert außerhalb einer Liste wird abgelehnt:

<!-- run: nx_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'mis.list kind=PR_Patient'"; eval "$D 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'" | grep -E '^(number|id):'; eval "$D 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Visit columns=Name,Fee,PR_Patient_ID'"; eval "$D 'mis.update kind=PR_Patient id=1 BloodGroup=Z'" | grep reason; rm -f Ninja_Practice.xlsx
PR_Patient_ID  Name
1              Aminah
2              Boon
3              Chandra
shown 3 of 3
number: Checkup
id: 1
number: Paracetamol
id: 1
Name     Fee  PR_Patient_ID
Checkup  50   1
shown 1 of 1
reason: BloodGroup Invalid value - Z - Reference_ID=200277 - A - AB - B - O; nothing was written
```

**Eine Tabelle, die schon da ist.** Nennt die Arbeitsmappe eine Tabelle, die das System schon hat, wird nichts doppelt erstellt. Gibt das Blatt dieser Tabelle einen `Master`, wird die Tabelle wiederverwendet: Die Spalten des Blatts werden ihr hinzugefügt, und sie wird ein Reiter unter diesem Master. Gibt das Blatt ihr keinen `Master`, bleibt die Zeile unberührt. Die Antwort listet beides auf (`reused`, `leftAlone`). Das ist es, was das Ninja von iDempiere tut. Eine wiederverwendete Tabelle behält ihre eigenen Regeln, sodass ein Datensatz von ihr weiterhin die eigenen Pflichtspalten dieser Tabelle füllen muss.

Eine Tabelle, die in zwei Fenstern gezeigt wird, wird über ihr eigenes Fenster geschrieben, außer Sie nennen das andere mit `window=` (sein Name oder seine ID). Eine Ablehnung für eine Spalte, die zum anderen Fenster gehört, sagt Ihnen, welches Fenster Sie nennen müssen.

**Ein Reiter an einem Fenster, das schon da ist.** Ein `Master` muss keine Tabelle der Arbeitsmappe sein. Nennen Sie eine Tabelle, die das System schon hat, und Ihre Tabelle wird ein Reiter des Fensters DIESER Tabelle, hinter den vorhandenen Reitern, ohne eigenes Fenster oder eigenen Menüeintrag. Die Übungsarbeitsmappe macht das mit einer Zeile: `PR_Referral`, deren `Master` `C_BPartner` ist, sodass eine Überweisung ein Reiter des Fensters Business Partner ist. Das ist auch die Regel des Ninja von iDempiere:

<!-- run: nx_att cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_att.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_att.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(attached|detailTabs):'; eval "$D 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Referral columns=Name,C_BPartner_ID names=Y'"; rm -f Ninja_Practice.xlsx
attached: [{"table":"PR_Referral","master":"C_BPartner","window":"Business Partner","windowId":123}]
detailTabs: 3
number: Checkup
id: 1
Name     C_BPartner_ID
Checkup  Standard
shown 1 of 1
```

Was abgelehnt wird, ohne dass etwas geschrieben wird: eine zweite Arbeitsmappe, die Tabellen nennt, die eine andere Arbeitsmappe angelegt hat, eine Arbeitsmappe, deren Tabellen alle schon da sind und keinen Master haben, ein `Master`, der weder in der Arbeitsmappe steht noch eine Tabelle mit einem Fenster hier ist, und ein `ColumnSet` mit einem Präfix, das es nicht kennt. Ein Blatt, dessen Name nicht genau der Name einer Tabelle ist, wird übersprungen und in der Antwort genannt. Das `notChecked` der Antwort listet auf, was nicht beurteilt wurde.

### Eine Tabelle aus einer einfachen CSV: `ninja.exec file=<Table>.csv`

Eine `.csv` statt einer Arbeitsmappe ist EINE Tabelle, deren Kopfzeile das Modell ist, gelesen so, wie das ältere Ninja eine liest. Die Tabelle ist der Name der Datei (`table=` nennt eine andere). Jede Kopfzelle erhält ihren Typ aus ihrem Namen, nach der ersten Regel, die passt: Enthält sie `Date` → ein Datum; `Qty` → eine Menge; `Amount` → ein Betrag; beginnt sie mit `Is` oder `In` → Ja/Nein (also ist auch `Income` Ja/Nein, wie im älteren Ninja); endet sie auf `_ID` → ein Nachschlagen, dessen Zellen der Name des Datensatzes sind; enthält sie `=` und `/` (`Plan=Basic/Gold`) → eine Liste; alles andere → Text. Eine Zelle wie `C_BPartner_ID>Value` oder `Code=X` erstellt die Spalte vor dem `>` oder `=`. Die Zeilen sind die Datensätze. Die Tabelle und ihre Datensätze werden zusammen erstellt: Lässt sich eine Zeile nicht laden, wird nichts erstellt, und die Antwort nennt die Zeile. Eine Zeile, deren erste zwei Spalten schon vorhanden sind, wird übersprungen, sodass dieselbe Datei beim erneuten Lauf nichts schreibt und eine Datei mit mehr Zeilen nur die neuen hinzufügt. Bei einer Tabelle, die schon da ist, fügt die Datei nur Zeilen hinzu, und eine Kopfzelle, die keine Spalte von ihr ist, wird abgelehnt.

<!-- run: nx_csv cut=200 -->
```text
$ printf 'Name,Join Date,Visits Qty,Fee Amount,IsMember,Plan=Basic/Gold\nAmir,2026-01-05,2,50,Y,Ba\nBea,2026-01-06,1,80,N,Go\n' > CL_Client.csv; rm -f /tmp/fast_guide_csv.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_csv.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(tables|dataSheets):'; eval "$D 'mis.list kind=CL_Client columns=Name,JoinDate,VisitsQty,FeeAmount,IsMember,Plan'"; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(ops|summary):'; printf 'Cara,2026-01-07,3,50,N,Ba\n' >> CL_Client.csv; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^summary:'; rm -f CL_Client.csv
tables: [{"table":"CL_Client","master":null,"columns":6,"lists":["Plan"]}]
dataSheets: [{"sheet":"CL_Client","rows":2,"loaded":2,"ops":2}]
Name  JoinDate             VisitsQty  FeeAmount  IsMember  Plan
Amir  2026-01-05 00:00:00  2          50         Y         Ba
Bea   2026-01-06 00:00:00  1          80         N         Go
shown 2 of 2
ops: 0
summary: every line of CL_Client.csv is there already (2 skipped); nothing was written
summary: 1 line loaded into CL_Client, 2 skipped (already there)
```

### Einer Tabelle die Belegspalten geben: `ninja.workflow`

Eine Funktion kann später für eine Tabelle eingeschaltet werden, ohne die Arbeitsmappe anzufassen. `ninja.workflow` gibt einer Tabelle die fünf Belegspalten (`DocStatus`, `DocAction`, `Processed`, `DocumentNo`, `IsApproved`) mit ihren Listen und Vorgaben, zeigt sie auf ihren Reitern und füllt die Datensätze, die schon da sind. Es sieht zuerst nach und fügt nur hinzu, was fehlt, sodass ein zweiter Lauf nichts schreibt:

<!-- run: nx_wf cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_wf.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_wf.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.new kind=PR_Visit Name=Before PR_Patient_ID=1'" | grep -E '^number:'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(added|fields|rowsFilled|ops):'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(alreadyDone|ops):'; eval "$D 'mis.new kind=PR_Visit Name=After PR_Patient_ID=1'" | grep -E '^docStatus:'; eval "$D 'mis.list kind=PR_Visit columns=Name,DocStatus,DocAction,Processed'"; eval "$D 'erp.complete kind=PR_Visit id=1'" | grep reason; rm -f Ninja_Practice.xlsx
ops: 151
number: Before
added: ["DocStatus","DocAction","Processed","DocumentNo","IsApproved"]
fields: 5
rowsFilled: 1
ops: 11
alreadyDone: true
ops: 0
docStatus: DR
Name    DocStatus  DocAction  Processed
Before  DR         CO         N
After   DR         CO         N
shown 2 of 2
reason: Complete was not done: PR Visit has the document columns but no document class yet, so nothing says what Complete does on it (DocStatus stays DR)
```

Es sagt noch nicht, was *Complete* (Abschließen) auf einer solchen Tabelle tut: Das `notMade` der Antwort nennt, was noch fehlt, und `erp.complete` wird bis dahin in einfachen Worten abgelehnt. Eine Tabelle, die mit dem System kam, wird abgelehnt.

### Ein Bundle rückgängig machen und als Arbeitsmappe zurückschreiben: `ninja.rollback`, `ninja.export`

Zwei Zeilen schließen den Kreis um eine Arbeitsmappe. `ninja.rollback bundle=<name>` schaltet alles ab, was eine Arbeitsmappe erstellt hat (ihre Fenster, Reiter, Felder, Spalten, Tabellen und Menüeinträge sowie den eigenen Menüknoten des Bundles), in einer Gruppe des Logs. Wie im älteren Ninja blockiert eine Tabelle, die Datensätze enthält, den Vorgang, und er nennt die Tabelle und die Zahl ihrer Datensätze; `dry=Y` sagt, was abgeschaltet würde. Eine Tabelle, die mit dem System kam, behält sich und verliert nur, was das Bundle ihr hinzugefügt hat (ein Reiter an Business Partner geht, Business Partner bleibt). Zweimal ausgeführt, schreibt der zweite Lauf nichts; `ninja.exec` auf derselben Arbeitsmappe bringt das Bundle danach zurück. `ninja.export` schreibt ein Bundle, ein Fenster oder eine Tabelle als Arbeitsmappe zurück, die `ninja.exec` liest: Tabellen, `Master`-Verknüpfungen, Spalten mit ihren Typen und die Werte jeder Liste. Bearbeiten Sie das Blatt und führen Sie es erneut aus, oder tragen Sie das Modell als Datei auf einen anderen Rechner. Es schreibt nur das Modell, nie Zeilen; eine Datei, die existiert, wird nie überschrieben; ein Selektor (`bundle=`, `window=` oder `table=`) ist erforderlich.

<!-- run: nx_rb cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_rb.ops Practice_out.xlsx; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_rb.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx data=N'" | grep -E '^ops:'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep -E '^(file|lists|summary):'; eval "$D 'ninja.rollback bundle=Practice dry=Y'" | grep -E '^(dry|wouldSwitchOff):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(ops|summary):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(alreadyDone|ops):'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep reason; rm -f Ninja_Practice.xlsx Practice_out.xlsx
ops: 151
file: Practice_out.xlsx
lists: 1
summary: wrote the model of 5 tables to Practice_out.xlsx
dry: true
wouldSwitchOff: 119
ops: 119
summary: Practice is rolled back: 119 dictionary rows switched off
ops: 0
alreadyDone: true
reason: Practice_out.xlsx exists already and is never overwritten. Nothing was written
```

Vom Export nicht übernommen: Gültigkeitsregeln und Callouts (der Stager hat sie nie ins Modell geschrieben). Ein Rollback schaltet Zeilen ab, es löscht sie nicht, sodass das Log seinen Verlauf behält.

## Die Datensätze unter einem Datensatz und ein Blatt gegen die Tabelle: `master=`, `mis.diff`

`master=Table/record` bei `mis.list`, `mis.sum` oder `mis.group` behält nur die Zeilen unter diesem Datensatz, die Zeilen, die ein Reiter darunter zeigt: `mis.list kind=PR_Visit master=PR_Patient/Aminah` sind die Besuche von Aminah. Der Datensatz nach dem Schrägstrich ist eine ID oder eine Belegnummer, ein Name oder ein Wert, gelesen so, wie `mis.update number=` ihn liest. Die Antwort ist dieselbe wie beim einfachen Filter `PR_Patient_ID=1`. Eine Tabelle, die kein Reiter unter dem Master ist, wird mit dem Grund abgelehnt, ebenso ein Datensatz, den es nicht gibt, oder ein Name, den sich zwei Datensätze teilen (geben Sie dann die ID an). Ein Datensatz, unter dem nichts liegt, ist eine echte Null, keine leere Frage.

`mis.diff kind=<table> file=<sheet.csv>` vergleicht ein Blatt mit der Tabelle, bevor Sie laden, und schreibt nichts. Jede Zeile des Blatts wird über ihre Belegnummer zugeordnet, sonst über den Namen, sonst über den Wert (`key=` nennt eine andere Spalte), und die Antwort sortiert sie: `new` (kein Datensatz hat diesen Schlüssel), `changed` (eine Spalte weicht ab; der gespeicherte Wert und der des Blatts werden beide gezeigt), `same` und `missing` (aktive Datensätze, die das Blatt nicht erwähnt). Ein im Blatt wiederholter Schlüssel, ein Schlüssel, der auf mehrere Datensätze passt, und eine Zeile ohne Schlüssel werden getrennt genannt und nicht verglichen. Eine Zahl ist als Zahl gleich (`1200.50` und `1200.5`), ein Datum entspricht dem gespeicherten Datum, und eine Nachschlagezelle wird über den Namen des Datensatzes verglichen, auf den die gespeicherte ID zeigt. Ob `mis.load` diesen Namen finden würde, wird hier nicht gefragt: Das macht `mis.load dry=Y`.

<!-- run: mis_md cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf 'Name,BloodGroup\nAminah,A\nBoon,B\nDevi,O\n' > patients.csv; rm -f /tmp/fast_guide_md.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_md.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.update kind=PR_Patient number=Aminah BloodGroup=A'" | grep -E '^changed:'; for v in 'Name=Checkup PR_Patient_ID=1 Fee=50' 'Name=Follow-up PR_Patient_ID=1 Fee=30' 'Name=Checkup PR_Patient_ID=2 Fee=50'; do eval "$D 'mis.new kind=PR_Visit $v'" | grep -E '^id:'; done; eval "$D 'mis.list kind=PR_Visit master=PR_Patient/Aminah columns=Name,Fee'"; eval "$D 'mis.sum kind=PR_Visit column=Fee master=PR_Patient/1'" | grep -E '^summary:'; eval "$D 'mis.group kind=PR_Visit by=Name master=PR_Patient/2'"; eval "$D 'mis.list kind=PR_Visit master=PR_Room/1'" | grep -E '^reason:'; eval "$D 'mis.diff kind=PR_Patient file=patients.csv'" | grep -E '^(new|changed|missing|ops|summary):'; rm -f Ninja_Practice.xlsx patients.csv
ops: 151
changed: ["bloodgroup"]
id: 1
id: 2
id: 3
Name       Fee
Checkup    50
Follow-up  30
shown 2 of 2
summary: 80 = sum of Fee over 2 PR Visit
Name     count
Checkup  1
shown 1 of 1
reason: PR Visit is not a detail of PR Room: it has no link column PR_Room_ID (the parent link of a tab). Nothing was listed
new: [{"row":3,"key":"Devi"}]
changed: [{"row":2,"key":"Boon","changes":[{"column":"BloodGroup","table":"","sheet":"B"}]}]
missing: ["Chandra"]
ops: 0
summary: 1 new, 1 changed, 1 the same, 1 in the table and not in the file; nothing was written
```

Nicht verglichen von `mis.diff`: eine Spalte der Tabelle, die das Blatt nicht nennt. Der Schlüssel ist eine Spalte. Ein Master zwei Ebenen höher (der Patient eines Medikaments) wird abgelehnt: Er ist nicht der Reiter-Elternteil des Medikaments.

### Eine Datei mit MIS-Zeilen, zuerst versucht: `--script … --dry`

Eine Einrichtung, die Sie wiederholen möchten (eine Arbeitsmappe, ihre ersten Datensätze, eine Prüfung), ist eine Datei mit Zeilen, die mit `--script` ausgeführt wird, wie in [Ein Skript](#a-script-several-lines-a-named-result): Sie hält an der ersten Zeile an, die nicht ok ist, und die Zeilen danach werden nicht ausgeführt. Fügen Sie `--dry` hinzu, um die ganze Datei zuerst zu versuchen. Die Datei läuft dann auf einer Wegwerfkopie Ihres Op-Logs (`BIM_OBJECT_OPLOG` muss es nennen) und der Dateien dieses Ordners, sodass eine spätere Zeile sieht, was eine frühere gemacht hat, genau wie im echten Lauf, und die Antwort des echten Laufs erhält. Am Ende wird die Kopie gelöscht: Ihr Op-Log, Ihre Dateien und das Journal sind wie vorher. Dateien in Unterordnern werden nicht kopiert. Eine Zeile, die außerhalb des Op-Logs wirkt (eine Modeller-Sitzung, ein Legacy-Server, ein Pack), kann nicht zurückgehalten werden und wird in einem Probelauf abgelehnt, und die Datei hält dort an.

<!-- run: script_dry cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf -- '-- the tables, a patient, a visit of hers, and the fees under her\nninja.exec file=Ninja_Practice.xlsx data=N\nmis.new kind=PR_Patient Name=Devi BloodGroup=O\nmis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50\nmis.sum kind=PR_Visit column=Fee master=PR_Patient/Devi\n' > setup.door; rm -f /tmp/fast_guide_dry.ops; export BIM_OBJECT_OPLOG=/tmp/fast_guide_dry.ops; node common/door/door.js --list --script setup.door --dry | grep -E '^(tablesMade|id|summary):'; test -e /tmp/fast_guide_dry.ops && echo 'op-log: written' || echo 'op-log: not written'; node common/door/door.js --list --script setup.door | grep -E '^summary:'; echo "op-log: $(wc -l < /tmp/fast_guide_dry.ops) ops"; rm -f Ninja_Practice.xlsx setup.door
tablesMade: 5
id: 1
id: 1
summary: 50 = sum of Fee over 1 PR Visit
op-log: not written
summary: 50 = sum of Fee over 1 PR Visit
op-log: 153 ops
```

## Spickzettel: die MIS-Zeilen üben

Alles hier ist Übung auf **Ihrer eigenen Kopie**: Die erste Zeile nennt eine Datei, die behält, was Sie tun, und nichts erreicht die Bücher einer echten Firma. Löschen Sie diese Datei, um wieder bei null zu beginnen. Führen Sie die Zeilen aus dem Ordner aus, der `common/` enthält (ein `bim-ootb`-Checkout).

| Schritt | Tippen Sie dies | Was Sie erhalten |
|---|---|---|
| Einrichten | `export BIM_OBJECT_OPLOG=~/practice.ops` | jede Zeile unten behält ihre Arbeit nun in dieser Datei |
| Neu anfangen | `rm -f ~/practice.ops` | wieder eine leere Übung |
| Tipparbeit verkürzen | `alias d='node common/door/door.js --list'` | dann ist eine Zeile `d '<verb> <inputs>'` |
| Fragen, was es gibt | `d 'help all'` | jedes Verb mit seinen Eingaben |
| Fünf Tabellen anlegen | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | Patienten, Besuche, Medikamente, Räume und Überweisungen, mit 3 geladenen Patienten und 2 Räumen |
| Vor dem Anlegen versuchen | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | was es anlegen würde; nichts geschrieben |
| Eine Tabelle anlegen | `d 'mis.add_window file=AST_Asset.csv'` | ein Fenster aus einer `.csv` seiner Spalten (Abschnitt oben) |
| Auflisten | `d 'mis.list kind=PR_Patient'` | die Zeilen |
| Einige Spalten auflisten | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | nur diese Spalten |
| Was sie enthalten kann | `d 'mis.describe kind=PR_Patient'` | ihre Spalten, Typen und Listen |
| Hinzufügen | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | ein neuer Datensatz und seine ID |
| Unter einem Master hinzufügen | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | ein Besuch von Patient 1 |
| Eine Ebene weiter hinzufügen | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | ein Medikament von Besuch 1 |
| Einen mit dem lesen, was darunter liegt | `d 'mis.read kind=PR_Patient id=1'` | der Patient und die Besuche |
| Ändern | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | der geänderte Datensatz |
| Eine Ablehnung sehen | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | refused: `Z` steht nicht in der Liste |
| Löschen | `d 'mis.delete kind=PR_Room id=2'` | der Datensatz ist weg |
| Addieren | `d 'mis.sum kind=PR_Visit column=Fee'` | die Summe |
| Nach einer Spalte zählen | `d 'mis.group kind=PR_Patient by=BloodGroup'` | eine Zahl pro Wert |
| Viele Zeilen laden | `d 'mis.load kind=PR_Room file=rooms.csv'` | eine Vorschau; mit `dry=N` laden |
| Am Bildschirm arbeiten | `node common/door/mis.js kind=PR_Patient` | eine Liste, in der Sie sich mit den Tasten bewegen; `+` fügt hinzu, Eingabe bearbeitet |
| Als andere Rolle | `role=102` zu einer Zeile hinzufügen | was diese Rolle sehen und tun darf |
| Unter einer Tabelle des Systems hinzufügen | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | eine Überweisung bei Geschäftspartner 112 (ein Reiter des Fensters Business Partner) |
| Einer Tabelle die Belegspalten geben | `d 'ninja.workflow table=PR_Visit'` | ein Status bei jedem Besuch (`DR`), alt und neu |
| Das Bundle einer Arbeitsmappe rückgängig machen | `d 'ninja.rollback bundle=Practice'` | alles, was sie angelegt hat, ist abgeschaltet (blockiert, solange eine Tabelle Datensätze enthält); zuerst `dry=Y` |
| Ein Bundle als Arbeitsmappe zurückschreiben | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | das Modell, zum Bearbeiten und erneuten Ausführen |
| Unter einem Datensatz | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | nur die Besuche von Patient 1; auch bei `mis.sum` und `mis.group` |
| Ein Blatt vor dem Laden vergleichen | `d 'mis.diff kind=PR_Patient file=patients.csv'` | neue, geänderte, gleiche und fehlende Zeilen; nichts geschrieben |
| Einen Modeller offen halten | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'` dann `d model.convert`, `d 'model.addbay end=high'`, `d model.undo`, `d model.close` | die 2D-Blätter in 3D gemacht, ein Feld hinzugefügt und zurückgenommen; jede Zeile einige Sekunden; Schließen speichert in shed.db |
| Das Modell jetzt speichern | `d model.save` (oder `d 'model.save file=shed.db'` beim ersten Mal) | die Kollisionsprüfung, dann wird shed.db geschrieben; abgelehnt, solange eine ROTE Kollision besteht |
| Ohne Speichern schließen | `d 'model.close discard=Y'` | die Änderungen bewusst verworfen (ein einfaches Schließen wird abgelehnt, wenn es keine Speicherdatei gibt) |
| Eine ganze Datei zuerst versuchen | `node common/door/door.js --list --script setup.door --dry` | die echte Antwort jeder Zeile; nichts behalten (braucht `BIM_OBJECT_OPLOG`) |
| Eine Tabelle aus einer CSV | `d 'ninja.exec file=CL_Client.csv'` | die Tabelle aus der Kopfzeile, ihre Zeilen geladen; erneut ausgeführt, werden nur neue Zeilen geladen |
| Das Menü am Bildschirm | `d menu` (oder `d 'menu role=102'`) | das ERP-Menü; Eingabe öffnet die Liste eines Fensters, Esc geht zurück, `/` sucht |
| Einen Menüeintrag finden | `d 'mis.menu role=102 find=partner'` | die Einträge, deren Name „partner“ enthält, mit ihren Ordnern |
| In einem anderen Fenster arbeiten | `window=<name or id>` zu `mis.new`, `mis.update` oder `mis.delete` hinzufügen | die Felder des Reiters dieses Fensters, für eine Tabelle, die in zwei Fenstern gezeigt wird |

**Geschwindigkeit.** Nach einer großen Arbeitsmappe behält die Tür ein Abbild dessen, was das Op-Log erstellt hat, sodass eine spätere Zeile nicht jede Op erneut anwendet; es wird nur verwendet, solange Ihre Op-Log-Datei noch genau so beginnt wie zuvor, und `ERP_OPIMAGE=off` schaltet es ab.

Eine eigene Arbeitsmappe: Kopieren Sie die Übungsdatei, ändern Sie die Zeilen von `2_RO_ModelMaker` auf Ihre Tabellen (ein eigenes Präfix, etwa `MY_`, hält sie von den schon vorhandenen Tabellen getrennt; ein Name, den das System schon hat, wird wiederverwendet, nicht doppelt angelegt), und führen Sie `ninja.exec` darauf zuerst mit `dry=Y` aus. Die Zeilen dieser Tabelle sind die Verben, die in den Abschnitten oben ausgeführt gezeigt wurden; die Tabelle selbst wird vom Test dieser Seite nicht erneut ausgeführt, die grauen Blöcke schon.

## Am Terminal arbeiten: `mis.js`

Wenn Sie lieber auswählen als tippen, zeigt `mis.js` eine Liste mit einem Zeiger. Es ist nur eine Oberfläche: Jede Taste wird zu **einer** der Türzeilen oben übersetzt, läuft durch dieselbe Tür (im Journal erfasst, auf Claims geprüft), und der Bildschirm gibt die Zeile aus, bevor sie läuft. Auf und Ab bewegen den Zeiger. Links und Rechts bewegen sich entlang der Schaltflächen der markierten Zeile (`[U Edit] [D Delete] [C Copy]` für einen Datensatz; für einen Beleg die Aktionen, die die Engine jetzt erlaubt, etwa `[C Complete] [V Void]`, und kein Delete mehr, sobald er abgeschlossen ist). Eingabe führt die hervorgehobene Schaltfläche aus. `+` beginnt einen neuen Datensatz, Entf fragt `y/N`, und Esc geht zurück und schreibt nichts.

An einem Terminal zeichnet es mit Pfeiltasten. Mit `--plain` liest es Tastennamen aus einer Pipe, sodass ein Skript, ein Screenreader und eine KI genau das sehen, was eine Person sieht:

<!-- run: mis_screen cut=150 -->
```text
$ printf 'Down Right Esc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner name=Standard limit=3 --plain 2>/dev/null
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=3 offset=0 name=Standard
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
 > 112            Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
   1300112        Standard  Standard           Standard Customers
the line it will run: mis.read kind=C_BPartner id=112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Down
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
the line it will run: mis.read kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Right
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Esc
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
```

Fügen Sie dem Befehl `role=103` hinzu, und jede Zeile, die der Bildschirm sendet, trägt diese Rolle; die Kopfzeile nennt sie. Ohne Rolle sagt die Kopfzeile, dass nichts gefiltert wird.

Ein Formular fragt nur nach dem, was die Engine nicht füllen kann (der Probelauf oben). Tippen füllt das Feld, Tab oder Eingabe geht weiter, und Eingabe im letzten Feld zeigt die eine Zeile, die es ausführen wird. Eine Zeile, die mit `=` beginnt, ist getippter Text. Hier die ganze Sitzung, reduziert auf die Türzeilen, die sie ausgeführt hat:

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

Bearbeiten funktioniert genauso: Es zeigt nur die Spalten, die das Fenster einer Person zu bearbeiten erlaubt, mit Nachschlagewerten als Namen, und sendet nur, was Sie geändert haben. Kopieren beginnt einen neuen Datensatz aus dem markierten, sodass Sie ändern müssen, was eindeutig sein muss (ein Duplikat wird abgelehnt, und Ihre Eingabe bleibt erhalten). Setzen Sie `MIS_SESSION_FILE=session.door`, und eine Terminalsitzung zeichnet die ausgeführten Zeilen auf, eine pro Zeile, als Skript, das Sie lesen und erneut ausführen können.

### Das Menü am Bildschirm: `menu` und `mis.menu`

`node common/door/door.js menu` (mit dem Alias aus dem Spickzettel `d menu`; in der red1-Shell `menu`) öffnet das ERP-Menü im Terminal, dasselbe Menü, das das ERP im Browser zeigt, mit denselben Ordnern in derselben Reihenfolge. Fügen Sie eine Rolle hinzu (`d 'menu role=102'`), und Sie sehen nur, was diese Rolle öffnen darf. Auf und Ab, oder eine Zahl, wählen einen Eintrag; Eingabe öffnet einen Ordner oder den Listenbildschirm eines Fensters (der `mis.js`-Bildschirm oben, auf der Tabelle des ersten Reiters des Fensters); Esc geht eine Ebene nach oben und beendet von ganz oben; `/` sucht einen Eintrag nach Namen; `?` zeigt die Tasten. Ein Prozess, Bericht oder Formular sagt, dass es im Browser-ERP öffnet, und führt nichts aus. Wie überall auf dieser Seite tippt der Bildschirm nur Türzeilen für Sie und gibt jede aus, bevor er sie ausführt (die `->`-Zeilen), sodass Sie, was Sie am Bildschirm tun, auch tippen oder in ein Skript schreiben können.

Das Menü selbst ist eine Türzeile, `mis.menu [role=] [find=]`. Hier wird der Bildschirm mit getippten Tasten gesteuert (`--plain` liest sie aus der Eingabe), sucht „partner“ und öffnet den dritten Treffer:

<!-- run: menu_screen cut=200 -->
```text
$ rm -f /tmp/fast_guide_menu.ops; printf '/\n=partner\nEnter\n3\nEsc\nEsc\nq\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_menu.ops node common/door/door.js 'menu role=102' --plain | grep -E '^(-> |key |Menu|find|> )'
-> mis.menu role=102
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key /
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: _   (Enter search, Esc cancel)
key =partner
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: partner_   (Enter search, Esc cancel)
key Enter
-> mis.menu find=partner role=102
find "partner"   (role 102)   294 windows
> 1    System Admin > Data > Data Import > Import Business Partner
key 3
-> (open Business Partner Group: the list screen on C_BP_Group)
-> mis.describe kind=C_BP_Group role=102
-> mis.list kind=C_BP_Group columns=C_BP_Group_ID,Value,Name,Description names=Y limit=10 offset=0 role=102
key Esc
find "partner"   (role 102)   294 windows
> 3    Partner Relations > Business Partner Rules > Business Partner Group
key Esc
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key q
Menu   (role 102)   294 windows
> 1  ▸ System Admin
```

## Wählen, wie die Antwort gezeigt wird, und sie aufbewahren

Die Antwort ist der JSON-Umschlag, sofern Sie nichts anderes verlangen. Drei Schalter zeigen die Zeilen einer Antwort so, dass eine Person oder eine Tabellenkalkulation sie lesen kann; der Umschlag ist weiterhin das, was die Tür aufzeichnet:

- `--list`: eine ausgerichtete Tabelle, die mit `shown N of TOTAL` endet. Eine Antwort, die ein einzelner Datensatz ist, zeigt `field: value`-Zeilen.
- `--csv`: die Zeilen als CSV (RFC 4180: Eine Zelle mit einem Komma, einem Anführungszeichen oder einem Zeilenumbruch wird in Anführungszeichen gesetzt; Zahlen stehen genau so, wie die Engine sie zurückgegeben hat).
- `--out FILE` schreibt die gewählte Form in eine Datei im aktuellen Ordner statt auf den Bildschirm. Eine Zeile, die abgelehnt, zurückgehalten oder inconclusive ist, schreibt keine Datei und sagt das.

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

In einem Skript beenden Sie eine Zeile mit `> file`, um die Antwort dieser Zeile in eine Datei im Ordner des Skripts zu senden (`>> file` hängt an). Die Form folgt dem Namen: `.csv` ist CSV, `.json` ist der Umschlag, alles andere ist die Liste. Ein Pfad, der den Ordner des Skripts verlässt, wird abgelehnt.

Diese Schalter leben in einer fünften Datei, `render.js`; legen Sie sie neben `door.js`, wenn Sie sie aus einem Download nutzen:

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

## Die Tür fragen: `help`

Tippen Sie `help`, um die gebräuchlichen Befehle zu sehen, jeweils als Zeile, die Sie ausführen können. `help erp` listet jedes Verb einer App auf, `help erp.find` zeigt ein Verb vollständig (was es tut, jede Eingabe, was es ändern darf, wer es ausführen darf), und `help all` listet alles auf. Die Hilfe wird aus derselben Verbliste erzeugt wie die Tabelle unten, liest nichts, führt nichts aus und wird nicht im Journal aufgezeichnet.

<!-- run: help_verb -->
```text
$ node common/door/door.js 'help erp.find'
erp.find — Find a document

Find a document by its number, the way a window's Find does (DocumentNo, else Name or Value). Returns every match with its key, DocStatus and DocAction. Nothing is changed. Kinds: any document table of the dictionary (34).

Inputs:
  kind (required, string) e.g. Order — The kind of document, as the dictionary names it (an AD_Table with a DocAction column), e.g. "Order". 34 kinds exist; an unknown kind or a table that is not a document is refused naming the reason.
  number (required, string) e.g. 50000 — The document number (DocumentNo) as shown in the window; if two documents carry it, name one with id.

Harm: read (reads only)
Who may run it: human, ai
Example: erp.find kind=Order number=50000
```

## Für Entwickler: den Zwilling gegen Legacy prüfen

Diese Verben sind für die Person, die den ERP-Zwilling gleich dem echten iDempiere hält. Sie brauchen einen bim-ootb-Checkout, und für die ersten vier den laufenden Legacy-Teststack (ein Docker-Postgres und den Pilot-Server) mit dem iDempiere-Quellcode daneben. Fehlt ein Teil, antworten sie mit `inconclusive` und sagen, welcher: Sie antworten nie mit einer leeren Liste oder „gleich“ für etwas, das sie nicht ansehen konnten.

`legacy.status` fragt, ob der Stack läuft. Es startet nichts; ist etwas ausgefallen, gibt es die Befehle aus, die es starten:

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column` beantwortet „wer füllt diese Spalte“, aus dem Wörterbuch des Zwillings und dem von Legacy nebeneinander: die Spaltenvorgabe, die Gültigkeitsregel, die Feldvorgabe und die Anmeldevorgabe (iDempiere legt beim Anmelden die `IsDefault`-Zeile einer referenzierten Tabelle in den Kontext). Wenn die beiden Seiten abweichen, sagt es `DIFFERENT` und welcher Teil:

<!-- run: column_docaction -->
```text
$ node common/door/door.js --list 'erp.column kind=Order column=DocAction'
kind: Order
table: C_Order
column: DocAction
twin: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
legacy: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
differs: []
verdict: SAME
notChecked: []
summary: C_Order.DocAction: SAME; twin fills it by the column default CO; legacy by the column default CO
```

`idempiere.where` sucht einen Namen im iDempiere-Quellcode und antwortet mit Datei, Zeile und dem Text der Zeile, sodass eine Behauptung über das Legacy-Verhalten zitieren kann, woher sie stammt. Es zeigt 25 Zeilen, wenn `limit` nichts anderes sagt, und gibt immer die Gesamtzahl an; `in=callout` behält nur Dateien, deren Pfad diesen Text enthält:

<!-- run: where_invoicerule -->
```text
$ node common/door/door.js --list 'idempiere.where symbol=InvoiceRule in=CalloutOrder limit=2'
symbol: InvoiceRule
hits: [{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":50,"text":"*\t\t- InvoiceRule/DeliveryRule/PaymentRule"},{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":131,"text":"mTab.setValue (\"InvoiceRule\", X_C_Order.INVOICERULE_Immediate);"}]
shown: 2
total: 20
files: 1
verdict: OK
summary: InvoiceRule: 20 lines in 1 files (showing 2)
```

Drei weitere Verben stehen neben diesen. `legacy.query table=c_order ad_client_id=11 limit=5` liest Zeilen aus einer Legacy-Tabelle (nur lesend; die Tabelle und jede Spalte werden gegen das Wörterbuch von Legacy geprüft, und die Gesamtzahl wird immer angegeben). `erp.compare kind=Order number=50000 legacy=50981` liest einen Datensatz auf dem Zwilling und den passenden auf Legacy und vergleicht sie Zelle für Zelle; eine Zelle, in der Legacy leer ist und der Zwilling eine Vorgabe enthält, wird mit `NULL-VS-DEFAULT` bezeichnet, und über den Grund wird nichts gesagt. `witness.run name=erp_new` führt einen Witness aus dem Baum aus, behält sein ganzes Log und antwortet mit seiner eigenen Urteilszeile (PASS, FAIL oder INCONCLUSIVE); ein Witness, der keine Urteilszeile ausgibt, ist ein Fehler, denn ein Exit-Code ist kein Beweis, und `witness.last` liest den zuletzt aufgezeichneten Lauf, ohne ihn erneut auszuführen.

### Ein Plugin für ein Legacy-iDempiere erstellen (OSGi und 2Pack)

Für die Person, die ein ERP-Datenmodell auf einen echten iDempiere-Server bringt. Das Datenmodell ist eine Arbeitsmappe (Excel): ein Blatt pro Tabelle des Application Dictionary (Anwendungswörterbuch) (`AD_Table`, `AD_Column`, `AD_Window`, `AD_Tab`, `AD_Field`, `AD_Menu` und so weiter), eine Zeile pro Datensatz, die erste Zeile die AD-Spaltennamen, und eine Spalte `Key`, die jede Zeile benennt. Eine Zelle, die auf eine andere Zeile der Arbeitsmappe zeigt, lautet `ref:<Key>`; eine, die auf eine Zeile zeigt, die der Server schon hat, lautet `existing:AD_Table:C_ProjectTask`. Ein Blatt `Plugin` trägt die Plugin-ID, die Version und die Beschreibung. Das ausgearbeitete Beispiel ist das BIM-Document-Modell, `erp/plugins/models/BIM_Document.xlsx` im `bim-ootb`-Repository.

Aus der einen Arbeitsmappe werden zwei Dinge erzeugt, und sie werden getrennt gehalten:

| Erzeugt | Was es enthält | Wohin es kommt |
|---|---|---|
| **Das 2Pack-Zip** | Nur Metadaten: die Wörterbuchzeilen und die Klassen*namen* eines Prozesses. Kein Programmcode. Eine Pack-Version wird einmal angewendet und nie geändert, sodass dieselbe Version mit anderen Zeilen abgelehnt wird | Der `META-INF`-Ordner des Plugins, wo der eigene Pack-Aktivator von iDempiere es beim Start des Plugins aufnimmt |
| **Die Java-Modellklassen** | `I_<Table>` und `X_<Table>` für jede Tabelle, die die Arbeitsmappe anlegt, in der Form, die der eigene Generator von iDempiere schreibt | Der `src`-Ordner des Plugins |

Was die Arbeitsmappe nicht erzeugen kann, sind die Regeln: die Belegaktion der Tabelle und der Code eines Prozesses. Diese werden von Hand im `src`-Ordner des Plugins geschrieben, wie bei jedem iDempiere-Plugin.

Das Türverb `erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF` schreibt nur das Zip und antwortet mit seinem sha256, den Zeilen pro Wörterbuchtabelle und den Namen der Prozessklassen, auf die es zeigt. Mit derselben Version und denselben Zeilen erneut ausgeführt, antwortet es `unchanged`; dieselbe Version mit einer bearbeiteten Arbeitsmappe wird abgelehnt, denn ein freigegebenes Pack wird nie geändert. Fügen Sie `java=<plugin>/src package=<java package>` hinzu, und die Java-Modellklassen werden ebenfalls geschrieben. Eine Person führt es aus; der Aufruf einer KI wird als Claim zurückgehalten, bis eine Person ihn bestätigt. Das Skript darunter ist weiterhin `node erp/tools/xlsx_pack.js`, das für jede geschriebene Datei eine `§XLSX-PACK`-Zeile ausgibt. Das zweite Verb, `erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`, ist die ganze Route auf der lokalen Legacy-Testinstanz in einer Zeile. Es führt fünf Zeilen aus, und die erste, die nicht ok ist, hält es an: `legacy.up` (den gemeinsamen Docker-Postgres starten, wenn er gestoppt ist), `erp.pack` (das Zip erzeugen), `legacy.refresh` (die Testdatenbank aus dem Basis-Seed neu aufbauen, das Plugin installieren, den Server starten und warten, bis das Pack installiert ist, etwa zwei Minuten), `legacy.check` (jede Zeile der Arbeitsmappe per SQL aus der Testdatenbank zurücklesen) und `legacy.witness` (die Prüfung im Server über die Konsole des Servers ausführen und ihr Urteil und ihre Zahlen beantworten). Jeder Schritt kann einzeln ausgeführt werden. Die Instanz, ihre Datenbank und die Skripte sind fest: Vom Aufrufer wird nichts übernommen, und die Datenbanken des Piloten werden abgelehnt. Eine Person führt es aus; der Aufruf einer KI wird als Claim zurückgehalten, bis eine Person ihn bestätigt.

`legacy.check` ist das rein lesende und antwortet, wie viele Zeilen jeder Art gefunden wurden gegenüber den Zeilen, die die Arbeitsmappe enthält:

<!-- run: legacy_check -->
```text
$ node common/door/door.js --list 'legacy.check book=erp/plugins/models/BIM_Document.xlsx'
database: idempiere_bimdoc
book: erp/plugins/models/BIM_Document.xlsx
checks: [{"what":"AD_Table rows","expected":1,"found":1,"ok":true},{"what":"physical tables","expected":1,"found":1,"ok":true},{"what":"AD_Column rows","expected":34,"found":34,"ok":true},{"what":"AD_Window rows","expected":1,"found":1,"ok":true},{"what":"AD_Tab rows","expected":3,"found":3,"ok":true},{"what":"AD_Menu rows","expected":1,"found":1,"ok":true},{"what":"AD_Process rows with the same class name","expected":2,"found":2,"ok":true},{"what":"AD_Reference rows","expected":4,"found":4,"ok":true}]
pack: {"compared":false,"note":"no version given: the installed pack was not compared with a fresh one"}
missing: []
verdict: ALL-FOUND
summary: test DB idempiere_bimdoc: ALL-FOUND (8/8 kinds of row); no version given: the installed pack was not compared with a fresh one
```

Geben Sie zusätzlich `version=<x.y.z>` an, und es vergleicht das im Plugin installierte 2Pack mit dem Pack, das gerade aus der Arbeitsmappe erzeugt wurde, und sagt deutlich, wenn sie sich unterscheiden: Das Refresh installiert das Plugin-Bundle so, wie es eingecheckt ist, sodass beide auseinanderlaufen können, bis das Bundle neu gebaut wird.

## Viewer-Fragen aus einem einfachen Download

Zwei Viewer-Verben, `viewer.counts` und `viewer.clashes`, funktionieren auch ohne Checkout. Legen Sie zwei weitere Dateien neben die sechs:

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

Ohne Seitendateien auf Ihrer Platte öffnet das Werkzeug die laufende Viewer-Seite mit dem Gebäude, das die Website bereitstellt, in einem versteckten Browser auf dem Prozessor und fragt das eigene Find-Panel des Viewers. `page` in der Antwort sagt, welche Seite verwendet wurde:

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

Es dauert etwa eine halbe Minute. Die Zahlen sind die des bereitgestellten Gebäudes, sodass sie von einer älteren Kopie in einem Checkout abweichen können. Die Zeitplan-Verben, `viewer.film_path`, die Objekt-Verben und `modeller.walk` brauchen weiterhin einen Checkout; die Tabelle sagt, welche.

## Die red1-Shell: Kurzwörter an einem Prompt {#the-red1-shell-short-words-at-one-prompt}

`red1` ist die Tür für eine Person an der Tastatur. Tippen Sie `node common/door/red1.js` (oder `red1`, nach einmaligem `npm link` im Checkout), und Sie erhalten einen `red1>`-Prompt. Jedes Kurzwort wird zu EINER Türzeile, und diese Zeile wird nach `→` ausgegeben, bevor sie läuft. So lehrt die Shell die vollständige Zeile nebenbei, und ein Skript oder eine KI kann dieselbe Zeile ganz ohne Shell ausführen. Eine vollständige Türzeile, die am Prompt getippt wird, funktioniert weiterhin unverändert.

`cd` sagt, wo Sie sind, sodass Sie es nicht wiederholen: ein Gebäude (`cd Duplex`), eine seiner Arten (`cd Element`) oder eine ERP-Art (`cd Order`). Der Prompt zeigt es (`red1 Duplex/Element>`), und `pwd` gibt es als Türschlüssel aus. In einem einmaligen Lauf trennt `;` die Wörter:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Dieselben Wörter, am Prompt getippt (hier aus einer Pipe gespeist, sodass die Antwort ausgegeben statt gezeichnet wird):

<!-- run: red1_group -->
```text
$ printf 'cd Duplex\ncd Element\ngroup storey\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.group building=Duplex kind=Element by=storey
ok · object.group
5 groups over 1193 Element
storey   count
Unknown  1026
Level 2  83
Level 1  62
T/FDN    14
Roof     8
```

**Suchen, mit Platzhaltern.** `*` ist eine beliebige Zeichenfolge, `?` ein Zeichen, `[abc]` eines davon; Groß- und Kleinschreibung spielen keine Rolle. Nennen Sie in einer Art die Spalte: `ls element_name=*bath*`. Derselbe Filter funktioniert bei jedem Listenverb (`mis.list`, `object.list`, `object.count`), für ERP-Tabellen wie für Gebäude. Ein Wert ohne Platzhalter ist weiterhin ein exakter Treffer.

<!-- run: red1_find -->
```text
$ printf 'cd Duplex\ncd Element\nls element_name=*bath*\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.list building=Duplex kind=Element columns=elements_meta_uu,guid,ifc_class,element_name limit=20 element_name=*bath*
ok · object.list
shown 6 of 6 Element
elements_meta_uu        guid                    ifc_class        element_name
0BTBFw6f90Nfh9rP1dlXre  0BTBFw6f90Nfh9rP1dlXre  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dlXru  0BTBFw6f90Nfh9rP1dlXru  IfcSpace         Bathroom 1
0BTBFw6f90Nfh9rP1dl_3C  0BTBFw6f90Nfh9rP1dl_3C  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dl_3P  0BTBFw6f90Nfh9rP1dl_3P  IfcSpace         Bathroom 1
1YLPoi73z0fvdanmaXQreg  1YLPoi73z0fvdanmaXQreg  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582924
2h405XijT83A$BX7w5ki4b  2h405XijT83A$BX7w5ki4b  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582931
```

**Kollisionen, gezeichnet.** `clash ARC MEP` in einem Gebäude fragt den Viewer und zeichnet die eigenen Zahlen der Antwort als Trichter (nur gezeichnet, wenn sich ihre Teile zusammenzählen). `ls` listet dann die Kollisionszeilen aus derselben Antwort auf, ohne erneut zu fragen, und `ls *Bath*` behält die Zeilen, in denen irgendeine Zelle passt. Allein getippt, öffnet `clash` ein Menü der Disziplinen des Gebäudes (Pfeiltasten oder eine Ziffer, dann Eingabe; Esc bricht ab). In einer Sitzung bleibt die Viewer-Seite offen, sodass eine Kollision nach der ersten Zeile in etwa einer Sekunde antwortet.

<!-- run: red1_clash -->
```text
$ printf 'cd Duplex\nclash ARC MEP\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.clashes building=Duplex discA=ARC discB=MEP rows=all
ok · viewer.clashes
393 box overlaps  ARC x MEP  (at 25 mm)
├─ 291 clash at mesh level
│    └─ 156 of them one inside the other
├─ 102 cleared by the shape tests
│    ├─  76 turned boxes do not touch
│    └─  26 triangles do not touch
└─   0 not judged
ls lists the 393 rows
```

**Was ein Beleg als Nächstes tun darf.** In einer ERP-Art zeichnet `next <number>` die Aktionen, die die Engine jetzt erlaubt, und weist bei jeder, für die es ein Wort gibt, auf die Zeile, die sie ausführt:

<!-- run: red1_next -->
```text
$ printf 'cd Order\nnext S00002\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ erp.actions kind=Order number=S00002
ok · erp.actions
Order S00002  status DR
├─ CO  → do complete S00002
├─ PR  (no red1 word for it yet)
└─ VO  → do void S00002
```

`help` listet die Wörter auf; `help verbs` listet jedes Türverb auf. **Aus JavaScript** sind dieselben Verben ein einziges Objekt, aus dem Vokabular erzeugt (ein neues Verb braucht keinen neuen Code):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Grenzen.** Objektwörter (`cd Element`, `ls`, `group`) brauchen ein Modell, das das Objektwörterbuch mitbringt; von den Gebäuden hier hat nur das Duplex eines. Eine Liste, die höher ist als das Terminal, hält nach jeder Seite an (Leertaste, q); eine Pipe erhält jede Zeile.

## Die Verben {#the-verbs}

Diese Tabelle wird **aus der Vokabeldatei erzeugt** (`common/door/verbs.json`), und ein Test prüft, dass sie übereinstimmt, Verb für Verb. Es ist dieselbe Liste, aus der das Werkzeugmenü der KI gebaut wird. Die *Schadensklasse* ist oben erklärt; *Braucht* sagt, welcher der beiden Downloads das Verb ausführt.

<!-- GEN:verbs -->
| Verb | Was es tut | Eingaben | Schadensklasse | Wer es nutzen darf | Braucht |
|---|---|---|---|---|---|
| `modeller.lines` | Das Raster lesen | `building` | read | human, ai | der Download aus 6 Dateien |
| `modeller.try_shift` | Eine Rasterlinie probeweise verschieben | `building`, `line`, `move` (Meter) | trial | human, ai | der Download aus 6 Dateien |
| `viewer.counts` | Elemente zählen | `building`, `by` (optional) | read | human, ai | die 6 Dateien + die 2 Viewer-Dateien |
| `viewer.clashes` | Kollisionen zwischen zwei Disziplinen auflisten | `building`, `discA`, `discB`, `rows` (optional) | read | human, ai | die 6 Dateien + die 2 Viewer-Dateien |
| `viewer.film_path` | Sichtbarkeit des Filmpfads | `db`, `path` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `viewer.schedule_at` | Zeitplanstand an einem Tag | `building`, `day` (Tagesnummer) | read | human, ai | ein bim-ootb-Checkout |
| `viewer.schedule_compare` | Zeitplan-Engine gegen ihre Referenz | `building`, `shift_hours` (Stunden) (optional) | read | human, ai | ein bim-ootb-Checkout |
| `modeller.widen_bay` | Ein Feld auf eine Zielbreite verbreitern | `building`, `from`, `to`, `target` (Meter) | trial | human, ai | der Download aus 6 Dateien |
| `modeller.walk` | Was der Walker platzieren würde | `building`, `discipline` | read | human, ai | ein bim-ootb-Checkout |
| `object.describe` | Eine Objektart beschreiben | `building`, `kind`, `uu` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `object.read` | Ein Objekt lesen | `building`, `kind`, `uu` | read | human, ai | ein bim-ootb-Checkout |
| `object.history` | Verlauf eines Objekts | `building`, `kind`, `uu` | read | human, ai | ein bim-ootb-Checkout |
| `object.update` | Eine Eigenschaft eines Objekts ändern | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | ein bim-ootb-Checkout |
| `object.attach` | Eine Datei oder Notiz an ein Objekt anhängen | `building`, `kind`, `uu`, `file` (optional), `text` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `object.count` | Die Datensätze einer Art zählen | `building`, `kind`, weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `object.list` | Datensätze einer Art auflisten | `building`, `kind`, `columns` (optional), `sort` (optional), `limit` (optional), `offset` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `object.sum` | Eine Spalte addieren | `building`, `kind`, `column`, weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `object.group` | Nach einer Spalte zählen | `building`, `kind`, `by`, weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `witness.run` | Einen Witness ausführen und sein Urteil lesen | `name` | trial | human, ai | ein bim-ootb-Checkout |
| `witness.last` | Den zuletzt aufgezeichneten Witness-Lauf lesen | `name` | read | human, ai | ein bim-ootb-Checkout |
| `legacy.status` | Läuft der Legacy-Teststack | keine | read | human, ai | ein bim-ootb-Checkout |
| `legacy.query` | Zeilen einer Legacy-Tabelle lesen | `table`, `columns` (optional), `sort` (optional), `limit` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.column` | Wer eine Spalte füllt: Zwilling und Legacy nebeneinander | `kind`, `column` | read | human, ai | ein bim-ootb-Checkout |
| `legacy.compare` | Einen Datensatz auf dem Zwilling und auf Legacy vergleichen | `kind`, `number`, `legacy` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `idempiere.where` | Einen Namen im iDempiere-Quellcode finden | `symbol`, `in` (optional), `limit` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.pack` | Das 2Pack-Zip aus einer Datenmodell-Arbeitsmappe erzeugen | `book`, `version`, `out` (optional), `java` (optional), `package` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `legacy.up` | Den gemeinsamen Docker-Postgres für den Legacy-Teststack starten | keine | writes | human, ai | ein bim-ootb-Checkout |
| `legacy.refresh` | Die Legacy-Testinstanz aus dem Basis-Seed auffrischen | keine | writes | human, ai | ein bim-ootb-Checkout |
| `legacy.witness` | Den Witness im Server auf der Legacy-Testinstanz ausführen | keine | trial | human, ai | ein bim-ootb-Checkout |
| `legacy.check` | Die Zeilen einer Arbeitsmappe in der Legacy-Testdatenbank prüfen | `book`, `version` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `legacy.plugin` | Ein Datenmodell-Plugin auf die Legacy-Testinstanz bringen und dort prüfen | `book`, `version` | writes | human, ai | ein bim-ootb-Checkout |
| `model.open` | 2D-Blätter im Modeller öffnen | `sheets`, `type` (optional), `file` (optional) | trial | human, ai | ein bim-ootb-Checkout |
| `model.convert` | Die offenen Blätter in ein 3D-Modell umwandeln | keine | trial | human, ai | ein bim-ootb-Checkout |
| `model.addbay` | Ein Feld zum Modell hinzufügen | `end` | trial | human, ai | ein bim-ootb-Checkout |
| `model.undo` | Die letzte Modelländerung rückgängig machen | keine | trial | human, ai | ein bim-ootb-Checkout |
| `model.save` | Das offene Modell speichern | `file` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `model.close` | Die Modeller-Sitzung schließen | `discard` (optional) | trial | human, ai | ein bim-ootb-Checkout |
| `erp.find` | Einen Beleg finden | `kind`, `number` | read | human, ai | ein bim-ootb-Checkout |
| `erp.actions` | Was mit einem Beleg getan werden kann | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.complete` | Einen Beleg abschließen | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | ein bim-ootb-Checkout |
| `erp.void` | Einen Beleg stornieren | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.close` | Einen Beleg schließen | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.reverse` | Einen Beleg umkehren - korrigieren | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | ein bim-ootb-Checkout |
| `mis.describe` | Eine Art von ERP-Datensatz beschreiben | `kind`, `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.read` | Einen ERP-Datensatz lesen | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.list` | Datensätze auflisten | `kind`, `columns` (optional), `sort` (optional), `limit` (optional), `offset` (optional), `names` (optional), `role` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.sum` | Eine Spalte addieren | `kind`, `column`, `role` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.group` | Nach einer Spalte zählen | `kind`, `by`, `role` (optional), `window` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.new` | Einen Datensatz anlegen | `kind`, `dry` (optional), `role` (optional), `window` (optional), weitere `column=value`-Filter (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `mis.update` | Einen Datensatz ändern | `kind`, `id` (optional), `number` (optional), `role` (optional), `window` (optional), weitere `column=value`-Filter (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `mis.delete` | Einen Datensatz löschen | `kind`, `id` (optional), `number` (optional), `role` (optional), `window` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `mis.load` | Datensätze aus einer CSV laden | `kind`, `file`, `dry` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `mis.add_window` | Ein Fenster aus einer CSV hinzufügen | `file`, `table` (optional), `workflow` (optional), `dry` (optional), `master` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `ninja.exec` | Eine Ninja-Arbeitsmappe ausführen | `file`, `dry` (optional), `data` (optional), `table` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `ninja.workflow` | Einer Tabelle die Belegspalten geben | `table`, `dry` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `mis.diff` | Eine CSV mit der Tabelle vergleichen | `kind`, `file`, `key` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.menu` | Das Menü lesen | `role` (optional), `find` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `ninja.rollback` | Ein Ninja-Bundle rückgängig machen | `bundle`, `dry` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `ninja.export` | Ein Ninja-Bundle als Arbeitsmappe zurückschreiben | `bundle` (optional), `window` (optional), `table` (optional), `file` | writes | human, ai | ein bim-ootb-Checkout |
| `erp.column` | Wer eine Spalte füllt: Zwilling und Legacy nebeneinander (alter Name von mis.column) | `kind`, `column` | read | human, ai | ein bim-ootb-Checkout |
| `erp.compare` | Einen Datensatz auf dem Zwilling und auf Legacy vergleichen (alter Name von legacy.compare) | `kind`, `number`, `legacy` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.pack` | Das 2Pack-Zip aus einer Datenmodell-Arbeitsmappe erzeugen (alter Name von mis.pack) | `book`, `version`, `out` (optional), `java` (optional), `package` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.legacy_plugin` | Ein Datenmodell-Plugin auf die Legacy-Testinstanz bringen und dort prüfen (alter Name von legacy.plugin) | `book`, `version` | writes | human, ai | ein bim-ootb-Checkout |
| `erp.describe` | Eine Art von ERP-Datensatz beschreiben (alter Name von mis.describe) | `kind`, `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.read` | Einen ERP-Datensatz lesen (alter Name von mis.read) | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.list` | Datensätze auflisten (alter Name von mis.list) | `kind`, `columns` (optional), `sort` (optional), `limit` (optional), `offset` (optional), `names` (optional), `role` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.sum` | Eine Spalte addieren (alter Name von mis.sum) | `kind`, `column`, `role` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.group` | Nach einer Spalte zählen (alter Name von mis.group) | `kind`, `by`, `role` (optional), `window` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.new` | Einen Datensatz anlegen (alter Name von mis.new) | `kind`, `dry` (optional), `role` (optional), `window` (optional), weitere `column=value`-Filter (optional) | writes | human, ai | ein bim-ootb-Checkout |
<!-- /GEN:verbs -->

**Abdeckung heute.** Die Liste ist mit Absicht klein: 59 Verben decken die Rasterbearbeitungen des Modellers, seinen Walker und einen zwischen den Zeilen offen gehaltenen Modeller ab, einige Viewer-Fragen, den Zeitplan, das generische Lesen, Zählen und Schreiben von Objekten und die ersten ERP-Belegverben. Der Viewer hat 64 Aktionen, die eine Person drücken kann, und die Tür bietet 5 Viewer-Verben. Das ERP hat 1157 Belege und Prozesse, und die Tür bietet 6 ERP-Verben für das Leben eines Belegs und 14 MIS-Verben, die auf jeder Tabelle arbeiten, und behält 10 alte Namen, damit frühere Zeilen weiter laufen. Dies ist also ein Anfang, nicht das ganze Menü.

## Was nicht geprüft wird {#what-is-not-checked}

Eine Antwort listet auf, was ihre Prüfung nicht abgedeckt hat. Für den Änderungsbericht des Modellers lautet die Liste:

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

Dieselben Worte gelten für jede Antwort: Überlappungen sind zunächst Bounding Boxes, eine Prüfung deckt nur ab, was sich bewegt hat, und **die Tragfähigkeit wird nie geprüft**. Eine Antwort ohne Rot bedeutet nie sicher.

## Fehlerbehebung

| Was Sie sehen | Was zu tun ist |
|---|---|
| `edit_cli is not at …` | Eine der sechs Dateien fehlt. Die Meldung gibt die `curl`-Zeile aus |
| `puppeteer not found` | Führen Sie `npm install puppeteer@24` im selben Ordner aus |
| `unknown verb` | Die Meldung listet jedes Verb auf. Prüfen Sie die Schreibweise anhand der [Tabelle](#the-verbs) |
| `missing input: …` | Das Verb braucht diesen Schlüssel. Die Tabelle listet die Eingaben auf |
| `The Viewer tools need a bim-ootb checkout` | Führen Sie es als `node common/door/door.js` aus einem vollständigen Checkout aus |
| `exit 1` mit einer Chrome-Meldung | Die Systembibliotheken von Chrome fehlen unter Linux. Die Fehlerbehebungsseite von Puppeteer listet sie auf |

**Grenzen, mit denen Sie rechnen sollten.** Jeder Modeller-Aufruf öffnet das ganze Gebäude: etwa 10 bis 40 Sekunden bei der HospitalGarage. Dies ist ein Messwerkzeug, kein Dienst mit Verfügbarkeitszusage. Ein Skript mit mehreren Modeller-Zeilen öffnet das Gebäude einmal pro Zeile.

## Wie diese Seite wahr bleibt

Jeder Befehl in einem grauen Block oben wurde ausgeführt, und die Ausgabe darunter ist das, was der Befehl ausgegeben hat. Ein Test, **W-FAST-SCRIPT-GUIDE** im `bim-ootb`-Repository, führt sie erneut aus einem sauberen Vier-Dateien-Download aus, prüft jede Zahl dieser Seite gegen die Läufe und prüft, dass die Verbtabelle `verbs.json` entspricht. Wenn eine Zahl hier veraltet, schlägt dieser Test fehl.

Siehe auch: das [Handbuch für KI-Vorschläge](ProposerGuide.md) (eine KI an dieselbe Tür anschließen und was eine KI mit den Prüfungen gemacht hat) und das [Modeller-Handbuch](ModellerGuide.md).
