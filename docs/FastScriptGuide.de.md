---
review: machine
source_sha: b6044f3db00e8cee
lang: de
---

# Fast Script Benutzerhandbuch

**Ein kurzer Befehl nach dem anderen, für BIM und ERP, mit der eigenen Antwort der App zurück. Dieselben Wörter funktionieren für Sie am Terminal und für eine KI.**

Stellen Sie es sich als SQL auf Steroiden vor: eine Zeile liest oder ändert Datensätze, aber jede Zeile durchläuft dieselben Regeln wie die Fenster und gibt aus, was sie getan hat. Sie tippen kurze Wörter an einem einzigen Prompt, `red1`. Jedes Wort gibt die vollständige Zeile aus, die es ausführt (hinter `→`), sodass Sie die lange Form nebenbei lernen. Es steckt keine KI darin.

!!! warning "Was eine gute Antwort nicht bedeutet"
    Eine Antwort ohne Problem bedeutet **nie sicher, konform oder gut**. Jede Antwort listet auf, was nicht geprüft wurde, und [Was nicht geprüft wird](#what-is-not-checked) sagt es noch einmal. Das letzte Wort hat ein Tragwerksplaner.

## So installieren Sie es

Sie brauchen Node 18 oder neuer (diese Schritte liefen auf Node 18.19). Es gibt zwei Wege hinein.

**Der vollständige Checkout** gibt Ihnen red1, BIM, ERP, den Viewer und alles Folgende. Klonen Sie ihn und starten Sie red1 dann aus seinem obersten Ordner:

```bash
git clone https://github.com/red1oon/bim-ootb
cd bim-ootb
node common/door/red1.js
```

Tippen Sie `exit`, um zu beenden. Um nur `red1` von überall zu tippen, führen Sie einmal `npm link` in diesem Ordner aus. Um zu prüfen, ob es funktioniert, fragen Sie nach seiner Versionszeile:

<!-- run: red1_version -->
```text
$ node common/door/red1.js --version | sed -e 's/^Copyright[^·]*· //' -e 's/ · [0-9a-f]\{8\}$//'
red1 1.0.0 · 78 verbs · 30 words
```

**Der Sechs-Dateien-Download** ist für die Tür allein mit den Modeller-Verben, ohne Checkout. Legen Sie einen leeren Ordner an, installieren Sie die Browser-Engine, die der Modeller braucht, und laden Sie die sechs Dateien:

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

Halten Sie alle sechs in einem Ordner. `door.js` liest die Verbliste aus `verbs.json` und seine Meldungen aus `messages.json` (über `msg_core.js`) und startet `edit_cli.js`, das die Live-Modeller-Seite ohne Fenster öffnet. Fehlt eine Datei, sagt die Tür, welche, und gibt ihre `curl`-Zeile aus. Alles andere auf dieser Seite braucht den Checkout; die [Verbtabelle](#the-verbs) sagt, welches Verb was braucht.

## Beginnen Sie mit red1

An einem Terminal begrüßt Sie `red1` einmal und wartet dann an seinem Prompt. Genau das gibt es aus (der Commit am Ende der Versionszeile ist abgeschnitten, weil er sich mit jedem Commit ändert):

<!-- run: greet -->
```text
$ (sleep 4; printf 'exit\r') | RED1_LOG=/tmp/fast_guide_greet.log RED1_HISTORY=/tmp/fast_guide_greet.hist BIM_DOOR_JOURNAL=/tmp/fast_guide_greet.journal script -qec 'node common/door/red1.js' /dev/null | tr -d '\r' | sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' -e 's/ · [0-9a-f]\{8\}$//'
Welcome to red1, the scripting door into BIM and ERP, stored in SQLite.
REMEMBER THE NAME.
Copyright (c) 2026 Redhuan D. OON · red1 1.0.0 · 78 verbs · 30 words
Type help for the list of commands (or bim, mis, erp for one group).
Tip: type level student for fuller help on each word (red1 --fast opens without tips).

red1> exit
```

**So lesen Sie die Blöcke auf dieser Seite.** Die Zeile nach `$` zeigt, wie der Test der Seite den Befehl ausführt: Er nutzt Wegwerf-Dateien (vorher geleert, damit ein Lauf nie Ihre eigenen Daten berührt), schneidet die Laufzeiten ab und blendet das Protokoll aus. An Ihrer eigenen Eingabeaufforderung tippen Sie nur die Wörter, etwa `cd Duplex`. Darunter steht genau, was red1 ausgegeben hat.

Lesen Sie es als Landkarte. Die Versionszeile sagt, wie viele Tür-Verben (die lange Form) und kurze Wörter red1 hat. `help` zeigt die kurzen Wörter in drei Gruppen; `help bim`, `help mis` oder `help erp` zeigt eine Gruppe:

| Gruppe | Wofür sie da ist | Beginnen mit |
|---|---|---|
| **bim** | Gebäude und Modelle: zählen, Kollisionen, Kosten, Zeitplan, der Modeller | `cd Duplex` |
| **mis** | Datensätze, Tabellen, Dateien und Ninja-Arbeitsmappen: auflisten, anlegen, ändern, laden | `cd Order` |
| **erp** | Belege und Prozesse: abschließen, stornieren, schließen, einen Prozess ausführen, ein Gebäude in seinen Auftrag buchen | `cd Order` |

<!-- run: red1_help -->
```text
$ node common/door/red1.js help 2>/dev/null
red1: type a short word; red1 prints the full line it runs (→ …), then runs it.
  bim   buildings and models            start with: cd Duplex   (16 words)
  mis   records, tables, files, Ninja   start with: cd Order   (11 words)
  erp   documents and processes         start with: cd Order   (8 words)
  everywhere: cd <place> · #<number> · pwd · role <id> · login <user> · history [N] · report · exit
Type bim, mis or erp for its words · help <word> for one word (level student first for the full explanation) · help verbs for the full door lines.
```

Eine Gruppe listet ihre Wörter, jedes mit einem Beispiel zum Eintippen. `erp` ist die kürzeste:

<!-- run: red1_help_erp -->
```text
$ node common/door/red1.js 'help erp' 2>/dev/null
erp: documents and processes (start with: cd Order)
 in a building:
  post discipline=ARC  post the building's priced selection to its ERP Project Order
  vo discipline=ARC    issue the change between the model and the Project Order as a Variation Order
 in an ERP kind:
  status                                              a Project's earned value (PV, EV, AC, SPI, CPI per phase)
  claim                                               bill the project's completed phases not yet billed
  do CO 50000                                         a document action
  run "Set Project Type" 990000 C_ProjectType_ID=103  run a process of the dictionary
  next 50000                                          what a document may do next
  ask "How do I close a Sales Order?"                 ask the help a question, in your language
```

Der Name einer Gruppe allein getippt (`bim`, `mis` oder `erp`) zeigt dieselbe Liste und bringt Sie in die Gruppe: Die Eingabezeile lautet `red1 erp>`, und Hilfe, Tab und die grauen Vorschläge bieten nur die Wörter dieser Gruppe an. Sie hält nie eine Zeile vom Laufen ab: Eine volle Tür-Zeile läuft weiterhin aus jeder Gruppe. `cd ..` geht einen Schritt zurück (aus einem Ort, dann aus der Gruppe), und Shift+Tab tut dasselbe (red1 druckt `→ cd ..`, so liest sich die Sitzung als Text).

`help` gibt keine Tür-Verben aus, nur die Wörter. `help verbs` listet jedes Tür-Verb mit seiner vollständigen Zeile. Für ausführlichere Hilfe zu einem Wort wechseln Sie in die Student-Stufe: `level student` in einer Sitzung oder `--level student` in einer Zeile, dann sagt `help <word>`, was das Wort tut, was Sie tippen, was red1 aus Ihrem aktuellen Ort übernimmt, und ein Beispiel. Der Text ist die eigene Beschreibung des Verbs, sodass er nicht von der Tabelle am Ende abweichen kann:

<!-- run: red1_help_student cut=170 -->
```text
$ node common/door/red1.js --level student 'help cost' 2>/dev/null
cost: the cost of a selection: cost [phase|task|storey|discipline|class] [column=value …]
  in a building: cost discipline   → viewer.cost
    what it does: Price a selection of a building's elements as the Viewer's Find panel does: quantities from the model × the rate pack, grouped by 4D phase, task, storey…
    you type: by (phase (default), task, storey, discipline or class.)
    taken from where you are: building
    e.g. in Duplex: viewer.cost building=Duplex by=discipline
```

**Hilfe in Ihrer eigenen Sprache.** `ask "<question>"` stellt eine Frage an dieselbe Hilfe wie das Fragefeld des Browser-ERP, in einfachen Worten, und funktioniert in einer ERP-Art (`cd Order`). Die Antwort nennt das Fenster, einen Prozess oder Bericht Ihres Menüs, wenn einer passt (wie das Feld im Browser), die Belegaktion und die Status, aus denen sie erlaubt ist, die Befehlszeile, die sie ausführt, und den Abschnitt des Handbuchs. Sie wird aus dem Wörterbuch und den veröffentlichten iDempiere-Sprachpaketen gelesen; es steckt keine KI darin, und sie liest nur. Die Sprache ist die mit `lang=zh_CN` gewählte, sonst Ihre gespeicherte Einstellung, wenn Sie angemeldet sind (`login`), sonst das `LANG` Ihres Terminals, sonst die des Systems. Ein Text, den das Paket nicht abdeckt, bleibt Englisch, wie in Legacy (die Beschreibung der Aktion unten). Hier ist das Terminal chinesisch:

<!-- run: red1_ask_zh -->
```text
$ printf 'cd Order\nask "如何关闭销售订单？"\n' | LANG=zh_CN.UTF-8 node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ erp.ask question=如何关闭销售订单？
ok · erp.ask
窗口: 销售订单
进程: 由费用产生销售订单
文档动作: 结束 — Finally close this transaction. It cannot be re-activated.
  单据处于以下状态时可用: 完成, 等候付款
CLI: erp.close kind=Order number=<Document No>
指南: 1 · 销售订单 https://red1oon.github.io/BIMCompiler/ERPUserGuide/#1-sales-order

从菜单（⌂ → 销售）打开销售订单，建一两行，然后按处理按钮（§6）→ 完成。完成不只是改变状态：completeIt 会在同一个已签名的操作组里，接着生成后面的出货单和发票。
(由构建会话翻译，未经母语者审校)
```

Das Browser-ERP hat dieselbe Hilfe an jedem Feld, die How-To-Schritte und das Fragefeld, in der Sprache, die Sie in seiner Kopfzeile wählen: siehe [Help on every field, and a question box](ERPUserGuide.md#help-on-every-field-and-a-question-box-live) im ERP-Benutzerhandbuch.

Nun ein Wort. `cd` sagt, wo Sie sind, sodass Sie es nicht wiederholen müssen. Nach `cd Duplex` und `cd Element` braucht ein `count` nur noch das eine, was neu ist. Die `→`-Zeile ist das, was red1 an die Tür geschickt hat; diese Zeile ist die lange Form des Wortes:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Grauer Text erscheint hinter Ihrem Cursor, während Sie ein Wort, einen Ort oder eine Spalte tippen: ein Vorschlag aus dem Wörterbuch. **Tab** oder **→** übernimmt ihn; **Return führt immer aus, was Sie getippt haben**, nie den Vorschlag. Eine falsche Schreibweise bekommt einen Hinweis, nie eine stille Korrektur (`ls Valu=…` wird abgelehnt und nennt `Value`).

## Die Wörter, die Sie am meisten brauchen

Jeder Teil unten sagt, was Sie gleich tun und warum, zeigt dann einen echten Lauf und worauf Sie darin achten sollten.

### bim: Gebäude und Modelle

**Zählen, nach einer Spalte.** `cd Duplex` und dann `cd Element` führt zu den Elementen des Gebäudes; `group storey` zählt sie nach einer Spalte. Achten Sie auf die Gruppen und ihre Anzahl sowie auf die `→`-Zeilen, die die Tür-Verben hinter den Wörtern zeigen:

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

**Suchen, mit Platzhaltern.** `ls` listet auf, was hier ist; mit `column=value` schränken Sie ein. `*` ist eine beliebige Zeichenfolge, `?` ein Zeichen, `[abc]` eines davon; Groß- und Kleinschreibung spielt keine Rolle. Achten Sie auf `shown 6 of 6`: red1 sagt, wie viele Zeilen passten und wie viele es zeigt.

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

**Kollisionen.** `clash ARC MEP` fragt den Viewer nach den Überschneidungen zwischen zwei Disziplinen und zeichnet die eigenen Zahlen der Antwort als Trichter. Allein getippt, öffnet `clash` ein Menü der Disziplinen des Gebäudes. `ls` listet dann die 393 Zeilen aus derselben Antwort auf, ohne erneut zu fragen. Achten Sie darauf, wie die Teile sich summieren: 393 = 291 + 102.

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

**Kosten.** `cost discipline` bepreist die Elemente des Gebäudes so, wie es das Find-Panel des Viewers tut: Mengen aus dem Modell mal das Tarifpaket. Sein Lauf steht in [Vom Gebäude zum Auftrag](#from-a-building-to-its-order-cost-the-offer-post), wo er weiter zum Auftrag führt.

### mis: Datensätze, Tabellen, Dateien

**Datensätze suchen.** In einer ERP-Art wie `Business Partner` funktionieren dieselben Wörter wie in einem Gebäude: `ls`, `count`, `cat`, mit denselben Platzhaltern. `cd` nimmt den Namen einer Art, in Anführungszeichen, wenn er ein Leerzeichen enthält.

**Einen anlegen und einen ändern.** `new` legt einen Datensatz an, wie es das Fenster tut: Sie nennen die Spalten, die Sie kennen, die Engine füllt den Rest (Vorgaben, die laufende Nummer), und eine Spalte, die das Wörterbuch nicht hat, wird mit den echten aufgelistet abgelehnt. `set <id> Column=value` ändert einen. Achten Sie auf die `id` in der Antwort von `new`, die `set` als Nächstes nutzt, auf `changed` in der zweiten Antwort und auf die Liste am Ende. (Eine Antwort listet auch jede gefüllte Spalte und die gemachten Änderungen auf; diese Zeilen sind hier weggelassen.)

<!-- run: mis_edit -->
```text
$ printf 'cd "Business Partner"\nnew Value=GD100 Name="Guide Partner One"\nset 1600010 Description="first supplier"\nls Value=GD*\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|id|changed|shown|C_BPartner_ID|[0-9]{7} )'
→ mis.describe kind="Business Partner"
→ mis.new kind="Business Partner" Value=GD100 Name="Guide Partner One"
ok · mis.new
id: 1600010
→ mis.update kind="Business Partner" id=1600010 Description="first supplier"
ok · mis.update
id: 1600010
changed: ["description"]
→ mis.list kind="Business Partner" columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID limit=20 names=Y Value=GD*
ok · mis.list
shown 1 of 1 Business Partner
C_BPartner_ID  Value  Name               Logo_ID  C_BP_Group_ID
1600010        GD100  Guide Partner One           Standard Customers
```

`rm <id>` löscht einen, und `load <file.csv>` und `diff <file.csv>` laden Zeilen aus einer Datei und vergleichen eine Datei mit den Datensätzen. [Die Referenz](FastScriptReference.md) zeigt jedes mit seiner Ausgabe.

### erp: Belege und Prozesse

**Einen Beleg anlegen und fertigstellen.** `new` in `Order` legt einen Auftragsentwurf an und gibt seine Nummer aus. Eine vollständige Tür-Zeile funktioniert an der Eingabeaufforderung ebenso, daher wird die Zeile des Auftrags mit `mis.new` hinzugefügt (ein Produkt und eine Menge). `next <number>` zeichnet, was der Beleg jetzt tun darf, und verweist jede Aktion, die ein Wort hat, auf die Zeile, die sie ausführt. `do CO <number>` stellt ihn fertig; die DocAction-Codes von Legacy sind `CO` fertigstellen, `PR` vorbereiten, `VO` stornieren, `CL` schließen, `RC` umkehren, `RE` reaktivieren (`do complete`, `do void` … gehen auch). Achten Sie auf die Nummer, die `new` ausgibt, auf den Status in jedem `next`-Baum und auf die Aktionen, die sich nach `CO` geändert haben. (Das `grep` behält nur diese Zeilen; die vollständigen Antworten listen auch jede gefüllte Spalte auf.)

<!-- run: erp_order -->
```text
$ printf 'cd Order\nnew issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101\nmis.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2\nnext 50000\ndo CO 50000\nnext 50000\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|number|Order [0-9]|[├└])'
→ mis.describe kind=Order
→ mis.new kind=Order issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101
ok · mis.new
number: 50000
→ mis.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2
ok · mis.new
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status DR
├─ CO  → do complete 50000
├─ PR  → do prepare 50000
└─ VO  → do void 50000
→ erp.complete kind=Order number=50000
ok · erp.complete
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status CO
├─ CL  → do close 50000
├─ VO  → do void 50000
└─ RE  → do reactivate 50000
```

**Einen Prozess ausführen.** `run "<process>"` führt einen Prozess des ERP-Wörterbuchs aus, wie es seine Fensterschaltfläche tut. Ein Parameter, den Sie nicht tippen, wird einzeln erfragt, in der Reihenfolge der eigenen Parameterzeilen des Prozesses (Return behält den Vorgabewert; eine Nachschlageliste öffnet eine Auswahl, eingeschränkt durch die Gültigkeitsregel der Spalte; `(leave it out)` überspringt einen optionalen). Dann gibt red1 die vollständige Zeile `→ erp.process …` aus und führt sie aus. Die Zusammenfassung nennt die erzeugten Belege und das Prozessprotokoll, wie es der Legacy-Prozessdialog tut. Hier ist das Projekt getippt, und die drei anderen Fragen sind mit Return beantwortet. (An einem Terminal zeichnet jede Frage ihre Auswahlliste; das `grep` behält nur Fragen und Antworten.) Achten Sie auf die ehrliche Antwort: Das Hospital-Projekt des Seeds hat keine Lieferantenpreise, also wird **keine Bestellung erzeugt**, und das Protokoll sagt für jede Zeile, warum:

<!-- run: erp_po -->
```text
$ printf 'cd Project\nrun "Generate PO from Project" C_Project_ID=990000\n\n\n\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|run:|C_|Consolidate|ok|refused|Generate|  Product)'
→ mis.describe kind=Project
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master="Process/Generate PO from Project"
→ mis.lookup column=C_ProjectPhase_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Phase (C_ProjectPhase_ID, 7)
C_ProjectPhase_ID: left out
→ mis.lookup column=C_ProjectLine_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Line (C_ProjectLine_ID, 28)
C_ProjectLine_ID: left out
Consolidate to one Document (ConsolidateDocument)? [Y]
→ erp.process name="Generate PO from Project" kind=Project C_Project_ID=990000 ConsolidateDocument=Y
ok · erp.process
Generate PO from Project: done · no document made
  Product has no PO record  (×28)
```

In einer Einzelzeile oder für eine KI wird nichts erfragt: Ein fehlender Pflichtparameter ist eine Ablehnung, die ihn nennt. Ein Prozess, für den der Zwilling noch keinen Port hat, wird mit dem Namen seiner Klasse abgelehnt, und red1 sagt es.

**Das Menü und Datensätze als Orte.** `menu` zeigt das ERP-Menü als Orte: `cd <folder>` geht hinein (der Anfang des Namens genügt, wenn nur ein Eintrag so beginnt), ein Fenster-Eintrag führt Sie zu seiner Art, und `cd ..` (oder Umschalt+Tab) geht einen Ordner zurück nach oben. Die Eingabeaufforderung zeigt den Pfad. Jeder Eintrag ist markiert: ▸ ein Ordner (wie viele Einträge er enthält), W ein Fenster (und seine Tabelle), P ein Prozess, R ein Bericht, X ein Formular, F ein Workflow. `red1 menu` allein öffnet das Menü weiterhin auf einem ganzen Bildschirm.

<!-- run: red1_menu_walk -->
```text
$ printf 'menu\ncd Quote\ncd "Sales Orders"\ncd "Sales Order"\npwd\n' | node common/door/red1.js 2>/dev/null
→ mis.menu
menu: 15 entries; cd <name> goes in, cd .. goes back
  ▸ System Admin (6)
  ▸ Application Dictionary (40)
  ▸ Partner Relations (7)
  ▸ Quote-to-Invoice (Sales) (6)
  ▸ Requisition-to-Invoice (Purchasing) (16)
  ▸ Returns (5)
  ▸ Open Items (Financial Movements and Aging) (32)
  ▸ Material Management and Pricing (22)
  ▸ Project Management (14)
  ▸ Performance Analysis and Accounting (17)
  ▸ Assets (6)
  ▸ Manufacturing (10)
  ▸ Maintenance Request (3)
  W Cost Center · C_CostCenter
  W Department · C_Department
Quote-to-Invoice (Sales): 6 entries; cd <name> goes in, cd .. goes back
  ▸ Sales and Marketing (9)
  ▸ Sales Orders (13)
  ▸ Shipments (7)
  ▸ Sales Invoices (5)
  ▸ Invoice Inquiry (13)
  ▸ Sales Management (6)
Quote-to-Invoice (Sales)/Sales Orders: 13 entries; cd <name> goes in, cd .. goes back
  W Sales Order · C_Order
  R Order Detail
  R Open Orders
  R Order Transactions
  P Quote convert
  P RePrice Order/Invoice
  P Generate PO from Sales Order
  P Reopen Order
  P Order Batch Process
  W POS Key Layout · C_POSKeyLayout
  P POS Key Generate
  W POS Terminal · C_POS
  W POS Payment · C_POSPayment
→ mis.describe kind=C_Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
menu="Quote-to-Invoice (Sales)/Sales Orders" kind=Order
```

In einer Art betritt `cd <number>` diesen Datensatz, und die Eingabeaufforderung behält den Menüpfad; `cd ..` geht wieder hinaus (von überall tut `cd Order 100` dasselbe). In einem Datensatz ist das, was red1 anbietet, das des Datensatzes, aus dem Wörterbuch für sein Fenster gelesen: nach `do` nur die Aktionen, die er jetzt ausführen darf, für Ihre Rolle, in der Reihenfolge der eigenen Schaltflächen des Fensters; nach `cd` seine Registerkarten; nach `run` seine eigenen Prozess-Schaltflächen (`run Co` ergänzt zu `"Copy Lines"`); und seine Felder als `Column=`-Schlüssel. `do` und `next` benennen den Datensatz über seine ID, sodass eine Nummer, die zwei Datensätze teilen (hier 80000), nie ein Problem ist. Eine Aktion gibt aus, was sie getan hat: die Statusänderung, die berührten Belege, wie viele Änderungen sie behalten hat und was der Datensatz jetzt tun darf; Tab nach `do ` bietet dann diese neuen Codes an. Die Ordnerlisten sind im Block unten weggelassen:

<!-- run: red1_walk_record -->
```text
$ rm -f /tmp/fast_guide_walkrec.ops; printf 'menu\ncd Quote\ncd "Sales Orders"\ncd "Sales Order"\ncd 100\npwd\ndo RE\ndo CO\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_walkrec.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_walkrec.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -vE '^  [▸WRPXF] '
→ mis.menu
menu: 15 entries; cd <name> goes in, cd .. goes back
Quote-to-Invoice (Sales): 6 entries; cd <name> goes in, cd .. goes back
Quote-to-Invoice (Sales)/Sales Orders: 13 entries; cd <name> goes in, cd .. goes back
→ mis.describe kind=C_Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ mis.read kind=Order id=100
Order 80000: 4 tabs (Order Line, Order Tax, Payment Schedule, POS Payment); ls shows them, cd <tab> opens one, cat reads the record
→ erp.actions kind=Order id=100
it may do: CL, VO, RE (do <code>; next shows the tree)
menu="Quote-to-Invoice (Sales)/Sales Orders" kind=Order id=100
→ erp.reactivate kind=Order id=100
ok · erp.reactivate
Re-activate: done · Order 80000 CO → IP (In Progress) · grand total 50.35
  related: Invoice 2 (RE 2) · Shipment/Receipt 2 (RE 2)
86 change(s) kept · it may do: CO, PR, VO
→ erp.complete kind=Order id=100
ok · erp.complete
Complete: done · Order 80000 IP → CO (Completed) · grand total 50.35
  related: Invoice 3 (RE 2, CO 1) · Shipment/Receipt 3 (RE 2, CO 1)
59 change(s) kept · it may do: CL, VO, RE
```

**`#` findet einen Beleg über seine Nummer.** `#80000` ist die Belegsuche von iDempiere (in ihrem globalen Suchfeld tippt man `/80000`; hier ist `/` der Pfad, deshalb `#`). Sie funktioniert von jedem Ort aus. Die Nummer passt als Anfang, im Mandanten Ihrer Anmeldung und nur in den Fenstern, die Ihre Rolle öffnen darf. Wird ein Beleg gefunden, wird er geöffnet. Werden mehrere gefunden, steht jeder unter seinem Fenster mit der Zeile, die ihn öffnet, so werden Verkaufs- und Einkaufsauftrag nie verwechselt. Ein Code davor wählt eine andere Suche: `#O 80000` Aufträge, `#BP Joe` Geschäftspartner. `@` ist reserviert. In bash setzen Sie die Zeile in Anführungszeichen: dort beginnt `#` einen Kommentar.

<!-- run: red1_hash -->
```text
$ rm -f /tmp/fast_guide_hash.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_hash.ops node common/door/red1.js '#80000' 2>&1 | grep -v '^§'
→ erp.search text=80000
#80000: 4 documents in 2 window(s); none is opened, enter one with its line:
  Sales Order window (Order, Order Search):
    Order 80000  →  cd Order 100
  Purchase Order window (Order, Order Search):
    Order 800000  →  cd Order 104
    Order 800001  →  cd Order 105
    Order 800002  →  cd Order 106
```

**Eine Lücke melden.** Manche Antworten sagen, dass red1 etwas fehlt, im Gegensatz dazu, dass Sie sich vertippt haben. Die Engine markiert diese, und in einer Sitzung gibt red1 nach der Antwort eine Zeile aus. Ein Tippfehler oder eine Legacy-Ablehnung ist keine Lücke und gibt nichts Zusätzliches aus. `report` zeigt dann einen Entwurf (die Zeile, den Grund, die red1-Version, die Plattform, die letzten Protokollzeilen, Ihre Pfade maskiert) und bietet ein GitHub-Issue oder eine E-Mail an; red1 sendet nichts selbst, Ihr eigener Browser oder Ihr Mailprogramm tut es:

<!-- run: red1_gap -->
```text
$ printf 'cd Project\nrun "Renumber"\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Project
Project: 48 properties; ls shows C_Project_ID, Value, Name, Processed, SalesRep_ID
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master=Process/Renumber
run: Renumber has no parameter to ask (none in the dictionary)
→ erp.process name=Renumber kind=Project
refused · erp.process · Renumber was not run: it has no JS port yet (class org.compiere.process.DiscountSchemaReSeq)
This is a gap in red1, not your mistake. Type report to send it to us (email or GitHub issue).
```

### Vom Gebäude zum Auftrag: Kosten, das Angebot, buchen {#from-a-building-to-its-order-cost-the-offer-post}

Das ist die Kette, die ein Gebäude in seinen ERP-Projektauftrag trägt. `cost discipline` gibt zuerst die Gruppen aus, dann die Anzahl und die Summe; `ls` listet die bepreisten Zeilen auf, und Kosten lassen sich auch nach `phase`, `task`, `storey` oder `class` gruppieren. Weil das Gebäude noch keinen ERP-Auftrag hat, endet es mit einem Angebot, `Ready to post to ERP Project Order? y/N`, gefolgt von der genauen Zeile, die es ausführen würde. Das Angebot ist der eigene nächste Schritt der Engine, nie von Hand getippt. In einer Sitzung führt `y` genau diese Zeile aus, und `n` oder ein leeres Return führt nichts aus; in einer Einzelzeile oder für eine KI wird nichts gefragt, und die Zeile steht im `next` der Antwort. `y` zu antworten ist `post`: Es faltet die bepreiste Auswahl des Gebäudes in einen Projektauftrag, mit seinen Phasen und Aufgaben aus dem 4D-Programm des Gebäudes und den Projektzeilen, als eine Gruppe von Änderungen oder keine. Achten Sie darauf, was entstanden ist, und auf das zweite Angebot, das `cd project` ist:

<!-- run: chain_post -->
```text
$ rm -f /tmp/fast_guide_chain.ops; printf 'cd Duplex\ncost discipline\ny\nn\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.cost building=Duplex by=discipline
ok · viewer.cost
1190 elements · 1054482.08 total (71 with no rate); 3 with no size, not priced
discipline  elements  cost
ARC         267       532431.14
ELEC        81        283500.00
MEP         809       153825.40
PLB         14        49000.00
STR         19        35725.55
ls lists the 49 priced rows
Ready to post to ERP Project Order? y/N → erp.process name="Fold from BIM" Building=Duplex
→ erp.process name="Fold from BIM" Building=Duplex
ok · erp.process
Posted Duplex: Project 990001, PlannedAmt 1054482.08284, 81 change(s) · no document made
81 change(s) kept: create:c_project 1, create:c_projectphase 8, create:c_projecttask 19, create:c_projectline 43, create:m_product 7, create:m_product_category 1, create:m_product_category_acct 2
Open the project? y/N → cd project
not done: cd project
```

Der gebuchte Betrag, 1054482.08284, ist die eigene Zeilenregel des Auftrags (Preis mal Menge, ungerundet). `cost` rechnet mit denselben Zeilen und zeigt die Zahl auf den Cent der Auftragswährung (1054482.08), sodass Sie vor `post` sehen, was der Auftrag enthält. Das Wort `post` tut dasselbe ohne das `cost` davor und fragt zuerst `run it? y/N`; ein Gebäude zu buchen, das schon in seinem Auftrag ist, ändert nichts. Vom neuen Projekt aus ist `run "Generate PO from Project"` die Einkaufsseite und antwortet wie das Hospital-Projekt oben: Die Produkte, die das Buchen angelegt hat, tragen keinen Lieferantenpreis. Diese Schritte mit ihrer Ausgabe stehen in [der Referenz](FastScriptReference.md).

## Alle Wörter

Die Wörter oben sind die, die Sie zuerst lernen sollten. Die übrigen, jedes eine Kurzform eines Tür-Verbs (`help <word>` zeigt seine Zeile):

| Wort | Was es tut |
|---|---|
| `pwd` · `cd ..` · `history` · `!!` · `!3` · `role <id>` · `login <user>` | wo Sie sind; zurück; die getippten Zeilen (auch aus früheren Sitzungen, nummeriert); die letzte Zeile noch einmal ausführen; Zeile 3 ausführen; als Rolle handeln; sagen, wer Sie sind (nur gefragt in einem Mandanten mit mehr als einem Benutzer mit E-Mail; neue Datensätze tragen Ihren Benutzer) |
| `sum <column>` · `cat <id>` · `rm <id>` | eine Spalte addieren; einen Datensatz zeigen; einen löschen |
| `ninja <file>` · `load <file.csv>` · `diff <file.csv>` | eine Ninja-Arbeitsmappe oder CSV bereitstellen; Zeilen aus einer Datei laden; eine Datei mit den Datensätzen vergleichen |
| `bim` · `mis` · `erp` | in eine Gruppe gehen: Hilfe, Tab und die Vorschläge bieten nur ihre Wörter an (`cd ..` oder Shift+Tab geht zurück) |
| `menu` | das ERP-Menü, wie Ordner mit `cd` durchgegangen; `red1 menu` öffnet es auf einem ganzen Bildschirm |
| `cd Project 990000` · `cd 100` · `ls` · `cd Phase` | einen Datensatz als Ort betreten (`cd <number>` innerhalb seiner Art, auch aus dem Menü-Rundgang): `ls` listet seine Reiter mit ihrer Datensatzzahl, `cd <tab>` öffnet einen, `cd ..` geht wieder hoch |
| `status` | in einem Projekt: sein Earned Value (PV, EV, AC, SPI und CPI je Phase) |
| `vo` | in einem Gebäude: die Änderung zwischen dem Modell und seinem Projektauftrag, ausgestellt als Nachtragsauftrag (Variation Order; fragt y/N; genehmigen mit `do CO <number>`) |
| `claim` | in einem Projekt: die abgeschlossenen, noch nicht abgerechneten Phasen abrechnen, ein Rechnungsentwurf und die Vorschau seiner Buchung (fragt y/N) |
| `grid` · `walk FP` · `day 5` · `compare 24` | die Rasterlinien des Gebäudes; eine Disziplin ablaufen; der Zeitplan an einem Tag; zwei Tage verglichen |
| `open marked` · `bay high` · `undo` · `save shed.db` · `close` | der zwischen den Zeilen offen gehaltene Modeller |
| `help <word>` · `help verbs` · `level student` · `report` · `exit` | Hilfe; jedes Tür-Verb; ausführlichere Hilfe; eine Lücke an den Eigentümer; beenden |

## Was nicht geprüft wird {#what-is-not-checked}

Eine Antwort listet auf, was ihre Prüfung nicht abgedeckt hat. Dieselben Worte gelten für jede Antwort: Überlappungen sind zuerst Begrenzungsboxen, eine Prüfung deckt nur ab, was sich bewegt hat, und **die Tragfähigkeit wird nie geprüft**. Eine Antwort ohne Rot bedeutet nie sicher. Die vollständige Liste für den Änderungsbericht des Modellers steht in [der Referenz](FastScriptReference.md#what-is-not-checked).

## Fehlerbehebung

| Was Sie sehen | Was zu tun ist |
|---|---|
| `edit_cli is not at …` | Eine der sechs Dateien fehlt. Die Meldung gibt die `curl`-Zeile aus |
| `puppeteer not found` | Führen Sie `npm install puppeteer@24` im selben Ordner aus |
| `unknown verb` | Die Meldung listet jedes Verb auf. Prüfen Sie die Schreibweise anhand der [Tabelle](#the-verbs) |
| `missing input: …` | Das Verb braucht diesen Schlüssel. Die Tabelle listet die Eingaben auf |
| `The Viewer tools need a bim-ootb checkout` | Führen Sie es als `node common/door/door.js` aus einem vollständigen Checkout aus |
| `exit 1` mit einer Chrome-Meldung | Die Systembibliotheken von Chrome fehlen unter Linux. Die Fehlerbehebungsseite von Puppeteer listet sie auf |

**Grenzen, mit denen Sie rechnen sollten.** Jeder Modeller-Aufruf öffnet das ganze Gebäude: etwa 10 bis 40 Sekunden bei der HospitalGarage. Dies ist ein Messwerkzeug, kein Dienst mit Verfügbarkeitszusage. Ein Skript mit mehreren Modeller-Zeilen öffnet das Gebäude einmal pro Zeile. **Was Sie an `red1>` anlegen, bleibt vorerst in red1s eigenem Änderungsprotokoll:** ein an der Eingabeaufforderung angelegter Auftrag erscheint nicht im ERP-Fenster des Browsers, und einer aus dem Fenster ist an der Eingabeaufforderung nicht zu sehen. Beide zusammenzuführen ist der nächste Schritt.


## Für Entwickler

**Die Tür-Zeile.** Jedes Wort wird zu einer Tür-Zeile, `app.verb key=value key=value`, und red1 gibt sie hinter `→` aus. Sie können eine Tür-Zeile direkt am Prompt tippen oder einzeln ausführen: `red1 'object.count building=Duplex kind=Element'` gibt die Antwort aus, und `--json` gibt den ganzen Umschlag aus. Mehrere Wörter in einer Einzelzeile werden durch `;` getrennt (`red1 'cd Duplex; count'`); `red1 -f FILE` führt eine Datei mit Zeilen aus, eine Zeile, die mit `--` beginnt, ist ein Kommentar, und `--dry` probiert sie zuerst. Die Tür prüft jede Zeile gegen eine feste Verbliste, ruft den eigenen Code der App auf und gibt die Antwort mit dem zurück, was nicht geprüft wurde. Eine Zeile, die zu keinem Verb passt, wird nie geraten; sie kommt als Frage zurück.

![Eine Tür. Akteure links sprechen dieselben Verben; die Tür parst, prüft, bindet, ruft auf und antwortet; die eigenen Prüfungen der App entscheiden.](figs/one_door.svg)

Lesen Sie das Bild von links nach rechts: der **Akteur** (eine Person am Terminal oder eine KI über eine Werkzeugverbindung); der **Kanal**, eine Liste von Verben, jedes mit einer einfachen Beschreibung, seinen Eingaben und einer *Schadensklasse*; die **Tür**, die parst, prüft, die Zeile an den Fragenden bindet, aufruft und antwortet; die **App**, deren eigene Prüfungen entscheiden, und eine Änderung, die ein neues Problem hinzufügt, wird mit der Begründung rückgängig gemacht. Das Anbinden einer KI steht im [KI-Vorschlagshandbuch](ProposerGuide.md#connect-your-ai).

Jedes Verb hat eine **Schadensklasse** (harm class): `read` (ändert nichts), `trial` (eine Änderung auf einer Wegwerfkopie, beurteilt, nie gespeichert), `writes`, `posts` oder `sends`. Die Klasse steht einmal, in der Verbliste, sodass kein Akteur sich um sie herumreden kann. Eine Person am Terminal ist für jede Klasse vertrauenswürdig; eine KI nur für `read` und `trial`, daher wird eine `writes`- oder `posts`-Zeile einer KI als Antrag festgehalten, den eine Person bestätigt ([die Referenz](FastScriptReference.md) zeigt einen).

**Aus JavaScript** sind dieselben Verben ein Objekt, aus dem Vokabular erzeugt (ein neues Verb braucht keinen neuen Code):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Grenzen.** Objektwörter (`cd Element`, `ls`, `group`) brauchen ein Modell, das das Objektwörterbuch mitbringt; von den Gebäuden hier hat nur das Duplex eines. Eine Liste, die höher ist als das Terminal, hält nach jeder Seite an (Leertaste, q); eine Pipe erhält jede Zeile.

**Die Referenz.** Jeder Befehl mit seiner echten Ausgabe, die Modeller-Geschichte (ein 13-m-Feld, abgelehnt mit dem eigenen Grund der App), Skripte mit benannten Ergebnissen, Ninja-Arbeitsmappen, das MIS-Terminal, der Legacy-Vergleich und der Ablauf von Anspruch und Bestätigung stehen in der [Fast-Script-Referenz](FastScriptReference.md).

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
| `erp.process` | Einen Prozess aus dem Wörterbuch ausführen | `name`, `record` (optional), `kind` (optional), `dry` (optional), `role` (optional), weitere `column=value`-Filter (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.order_state` | Was das ERP für die Auswahl eines Gebäudes hält und was als Nächstes erlaubt ist | `building`, weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.project_status` | Der Earned-Value-Status eines Projekts | `id` (optional), `number` (optional), `asof` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.ask` | Der Hilfe eine Frage stellen | `question`, `lang` (optional), `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `mis.lookup` | Die zulässigen Werte einer Spalte oder eines Prozessparameters | `column`, `kind` (optional), `process` (optional), `id` (optional), `limit` (optional), `role` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `viewer.cost` | Die Kosten einer Auswahl aus einem Gebäude | `building`, `by` (optional), weitere `column=value`-Filter (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.find` | Einen Beleg finden | `kind`, `number` | read | human, ai | ein bim-ootb-Checkout |
| `erp.search` | Belege über die Nummer suchen | `text`, `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.actions` | Was mit einem Beleg getan werden kann | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | ein bim-ootb-Checkout |
| `erp.complete` | Einen Beleg abschließen | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | ein bim-ootb-Checkout |
| `erp.void` | Einen Beleg stornieren | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.close` | Einen Beleg schließen | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.reverse` | Einen Beleg umkehren - korrigieren | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | ein bim-ootb-Checkout |
| `erp.prepare` | Einen Beleg vorbereiten | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
| `erp.reactivate` | Einen Beleg reaktivieren | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | ein bim-ootb-Checkout |
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

Alte Namen, die weiter laufen, jeder gleich dem Verb, auf das er zeigt: `erp.column` → `mis.column` · `erp.compare` → `legacy.compare` · `erp.pack` → `mis.pack` · `erp.legacy_plugin` → `legacy.plugin` · `erp.describe` → `mis.describe` · `erp.read` → `mis.read` · `erp.list` → `mis.list` · `erp.sum` → `mis.sum` · `erp.group` → `mis.group` · `erp.new` → `mis.new`
<!-- /GEN:verbs -->

**Abdeckung heute.** Die Liste ist mit Absicht klein: 68 Verben decken die Rasteränderungen des Modellers ab, seinen Walker und einen zwischen Zeilen offen gehaltenen Modeller, einige Fragen an den Viewer, den Zeitplan, generisches Lesen, Zählen und Schreiben von Objekten, die Kosten einer Auswahl, die ERP-Belegverben und jeden Prozess des ERP-Wörterbuchs, der eine Portierung hat. Der Viewer hat 64 Aktionen, die eine Person drücken kann, und die Tür bietet 6 Viewer-Verben. Das ERP hat 1158 Belege und Prozesse, und die Tür bietet 13 ERP-Verben für das Leben eines Belegs und 15 MIS-Verben, die auf jeder Tabelle arbeiten, und behält 10 alte Namen, damit frühere Zeilen weiter laufen (die Zahl in der Versionszeile schließt sie ein). Das ist also ein Anfang, nicht das ganze Menü.


## Wie diese Seite wahr bleibt

Jeder Befehl in einem grauen Block auf dieser Seite und in der [Referenz](FastScriptReference.md) wurde ausgeführt, und die Ausgabe darunter ist das, was der Befehl ausgegeben hat. Ein Test, **W-FAST-SCRIPT-GUIDE** im `bim-ootb`-Repository, führt sie erneut aus dem Download und dem Checkout aus, prüft jede Zahl dieser Seite gegen die Läufe und prüft, dass die Verbtabelle `verbs.json` entspricht. Wenn eine Zahl hier veraltet, schlägt dieser Test fehl.

Siehe auch: das [Handbuch für KI-Vorschläge](ProposerGuide.md) (eine KI an dieselbe Tür anschließen und was eine KI mit den Prüfungen gemacht hat) und das [Modeller-Handbuch](ModellerGuide.md).
