# Fast Script User Guide

**One short command at a time, for BIM and ERP, with the app's own answer back. The same words work for you at a terminal and for an AI.**

Think of it as SQL on steroids: one line reads or changes records, but every line goes through the same rules the windows use, and prints what it did. You type short words at one prompt, `red1`. Each word prints the full line it runs (after `→`), so you learn the long form as you go. There is no AI in it.

!!! warning "What a good answer does not mean"
    An answer with no problem **never means safe, compliant or good**. Each answer lists what was not checked, and [What is not checked](#what-is-not-checked) says so again. A structural engineer has the last word.

## How to install

You need Node 18 or newer (these steps ran on Node 18.19). There are two ways in.

**The full checkout** gives you red1, BIM, ERP, the Viewer and everything below. Clone it, then start red1 from its top folder:

```bash
git clone https://github.com/red1oon/bim-ootb
cd bim-ootb
node common/door/red1.js
```

Type `exit` to leave. To type just `red1` from anywhere, run `npm link` once in that folder. To check that it works, ask for its version line:

<!-- run: red1_version -->
```text
$ node common/door/red1.js --version | sed -e 's/^Copyright[^·]*· //' -e 's/ · [0-9a-f]\{8\}$//'
red1 1.0.0 · 78 verbs · 30 words
```

**The six-file download** is for the door alone with the Modeller verbs, no checkout. Make an empty folder, install the browser engine the Modeller needs, and fetch the six files:

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

Keep all six in one folder. `door.js` reads the verb list from `verbs.json` and its messages from `messages.json` (through `msg_core.js`), and runs `edit_cli.js`, which opens the live Modeller page with no window. If a file is missing the door says which one and prints its `curl` line. Everything else on this page needs the checkout; the [verb table](#the-verbs) says which verb needs which.

## Start with red1

On a terminal `red1` greets you once, then waits at its prompt. This is exactly what it prints (the commit at the end of the version line is cut off, because it changes with every commit):

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

**How to read the blocks on this page.** The line after `$` is how the page's test runs the command: it uses scratch files (emptied first, so a run never touches your own data), cuts the timings and hides the log. At your own prompt you type only the words, such as `cd Duplex`. Under it is exactly what red1 printed.

Read it as a map. The version line says how many door verbs (the long form) and short words red1 has. `help` shows the short words in three groups; `help bim`, `help mis` or `help erp` shows one group:

| Group | What it is for | Start with |
|---|---|---|
| **bim** | buildings and models: count, clash, cost, schedule, the Modeller | `cd Duplex` |
| **mis** | records, tables, files and Ninja workbooks: list, create, change, load | `cd Order` |
| **erp** | documents and processes: complete, void, close, run a process, post a building to its order | `cd Order` |

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

One group lists its words, each with an example you can type. `erp` is the shortest:

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

A group's name typed alone (`bim`, `mis` or `erp`) prints the same list and takes you into the group: the prompt reads `red1 erp>`, and help, Tab and the grey suggestions offer only that group's words. It never stops a line from running: a full door line still runs from any group. `cd ..` backs out one step (out of a place, then out of the group), and Shift+Tab does the same (red1 prints `→ cd ..`, so the session reads as text).

`help` prints no door verbs, only the words. `help verbs` lists every door verb with its full line. For fuller help on one word, switch to the Student level: `level student` in a session, or `--level student` on one line, then `help <word>` tells you what the word does, what you type, what red1 takes from where you are, and an example. The text is the verb's own description, so it cannot drift from the table at the end:

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

**Help in your own language.** `ask "<question>"` puts a question to the same help as the browser ERP's question box, in plain words, and works in an ERP kind (`cd Order`). The answer names the window, a process or report of your menu when one matches (as the browser's box does), the document action and the statuses it is allowed from, the command line that does it, and the guide section. It is read from the dictionary and the published iDempiere language packs; there is no AI inside, and it only reads. The language is the one you chose with `lang=zh_CN`, else your saved preference when you are logged in (`login`), else your terminal's `LANG`, else the system's. A text the pack does not cover stays in English, as in legacy (the action's description below). Here the terminal is Chinese:

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

The browser ERP has the same help on every field, the How To steps and the question box, in the language you choose in its header: see [Help on every field, and a question box](ERPUserGuide.md#help-on-every-field-and-a-question-box-live) in the ERP User Guide.

Now one word. `cd` says where you are, so you do not repeat it. After `cd Duplex` and `cd Element`, a `count` needs only the one thing that is new. The `→` line is what red1 sent to the door; that line is the long form of the word:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Grey text appears after your cursor while you type a word, a place or a column: a suggestion from the dictionary. **Tab** or **→** takes it; **Return always runs what you typed**, never the suggestion. A misspelling gets a hint, never a silent fix (`ls Valu=…` is refused and names `Value`).

## The words you use most

Each part below says what you are about to do and why, then shows a real run and what to look at in it.

### bim: buildings and models

**Count, by a column.** `cd Duplex` then `cd Element` goes to the building's elements; `group storey` counts them by a column. Look at the groups and their counts, and at the `→` lines that show the door verbs behind the words:

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

**Find, with wildcards.** `ls` lists what is here; add `column=value` to narrow it. `*` is any run of characters, `?` one character, `[abc]` one of them; capitals do not matter. Look at `shown 6 of 6`: red1 says how many rows matched and how many it shows.

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

**Clashes.** `clash ARC MEP` asks the Viewer for the overlaps between two disciplines and draws the answer's own numbers as a funnel. Typed alone, `clash` opens a menu of the building's disciplines. `ls` then lists the 393 rows from the same answer, without asking again. Look at how the parts add up: 393 = 291 + 102.

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

**Cost.** `cost discipline` prices the building's elements the way the Viewer's Find panel does: quantities from the model times the rate pack. Its run is in [From a building to its order](#from-a-building-to-its-order-cost-the-offer-post), where it leads on to the order.

### mis: records, tables, files

**Look for records.** In an ERP kind such as `Business Partner` the same words work as in a building: `ls`, `count`, `cat`, with the same wildcards. `cd` takes a kind's name, quoted when it has a space.

**Make one and change one.** `new` creates a record the way the window does: you give the columns you know, the engine fills the rest (defaults, the sequence number), and a column the dictionary does not have is refused with the real ones listed. `set <id> Column=value` changes one. Look at the `id` in the `new` answer, which is what `set` uses next, at `changed` in the second answer, and at the list at the end. (An answer also lists every column it filled and the changes it made; those lines are left out here.)

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

`rm <id>` deletes one, and `load <file.csv>` and `diff <file.csv>` load rows from a file and compare a file with the records. [The reference](FastScriptReference.md) shows each with its output.

### erp: documents and processes

**Make a document and complete it.** `new` in `Order` makes a draft order and prints its number. A full door line works at the prompt too, so the order's line is added with `mis.new` (a product and a quantity). `next <number>` draws what the document may do now, and points each action that has a word at the line that runs it. `do CO <number>` completes it; the legacy DocAction codes are `CO` complete, `PR` prepare, `VO` void, `CL` close, `RC` reverse, `RE` re-activate (`do complete`, `do void` … work too). Look at the number `new` prints, at the status in each `next` tree, and at the actions that moved on after `CO`. (The `grep` keeps only those lines; the full answers also list every column filled.)

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

**Run a process.** `run "<process>"` runs one process of the ERP dictionary, as its window button does. A parameter you do not type is asked, one at a time, in the order of the process's own parameter rows (Return keeps the default; a lookup opens a pick list narrowed by the column's validation rule; `(leave it out)` skips an optional one). Then red1 prints the full `→ erp.process …` line and runs it. The summary names the documents made and the process log, as the legacy process dialog does. Here the project is typed and the three other questions are answered with Return. (On a terminal each question draws its pick list; the `grep` keeps the questions and answers only.) Look at the honest answer: the seed's Hospital project has no vendor prices, so **no purchase order is made**, and the log says why for each line:

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

In a one-shot line, or for an AI, nothing is asked: a missing mandatory parameter is a refusal that names it. A process the twin has no port for yet is refused with the name of its class, and red1 says so.

**The menu, and records as places.** `menu` shows the ERP menu as places: `cd <folder>` goes in (the start of its name is enough when only one entry starts that way), a window entry takes you to its kind, and `cd ..` (or Shift+Tab) goes back up one folder. The prompt shows the path. Each entry is marked: ▸ a folder (how many entries it holds), W a window (and its table), P a process, R a report, X a form, F a workflow. `red1 menu` on its own still opens the menu on a full screen.

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

In a kind, `cd <number>` enters that record and the prompt keeps the menu path; `cd ..` steps back out (from anywhere, `cd Order 100` does the same). Inside a record, what red1 offers is that record's, read from the dictionary for its window: after `do`, only the actions it may take now, for your role, in the order of the window's own buttons; after `cd`, its tabs; after `run`, its own process buttons (`run Co` completes to `"Copy Lines"`); and its fields as `Column=` keys. `do` and `next` name the record by its id, so a number that two records share (here 80000) is never a problem. An action prints what it did: the status change, the documents it touched, how many changes it kept, and what the record may do now; Tab after `do ` then offers those new codes. The folder listings are left out of the block below:

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

**`#` finds a document by its number.** `#80000` is iDempiere's Document Search (its Global Search box takes `/80000`; here `/` is the path, so it is `#`). It works from any place. The number matches as a prefix, in your login's client, and only in the windows your role may open. One document found is opened. When several are found, each one is listed under its window with the line that opens it, so a sales and a purchase order are never confused. A code in front picks another search: `#O 80000` orders, `#BP Joe` business partners. `@` is reserved. In bash, quote the line: `#` starts a comment there.

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

**Report a gap.** Some answers say that red1 lacks something, as opposed to you having mistyped. The engine marks those, and in a session red1 prints one line after the answer. A typo or a legacy refusal is not a gap and prints nothing extra. `report` then shows a draft (the line, the reason, the red1 version, the platform, the last log lines, your paths masked) and offers a GitHub issue or an email; red1 sends nothing itself, your own browser or mail program does:

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

### From a building to its order: cost, the offer, post

This is the chain that carries a building into its ERP Project Order. `cost discipline` prints the groups first, then the count and total; `ls` lists the priced rows, and a cost can also be grouped by `phase`, `task`, `storey` or `class`. Because the building has no ERP order yet, it ends with an offer, `Ready to post to ERP Project Order? y/N`, followed by the exact line it would run. The offer is the engine's own next step, never typed by hand. In a session `y` runs exactly that line, and `n` or an empty Return runs nothing; in a one-shot line or for an AI nothing is asked and the line is in the answer's `next`. Answering `y` is `post`: it folds the building's priced selection into a Project Order, with its phases and tasks taken from the building's 4D programme and the project lines, as one group of changes or none. Look at what was made, and at the second offer, which is `cd project`:

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

The posted amount, 1054482.08284, is the order's own line rule (price times quantity, unrounded). `cost` prices on the same lines and shows the figure to the cent of the order's currency (1054482.08), so what you see before `post` is what the order holds. The word `post` does the same without the `cost` before it and asks `run it? y/N` first; posting a building that is already in its order changes nothing. From the new project, `run "Generate PO from Project"` is the purchase side, and answers as the Hospital project did above: the products the post created carry no vendor price. Those steps, with their output, are in [the reference](FastScriptReference.md).

## All the words

The words above are the ones to learn first. The rest, each a short form of a door verb (`help <word>` shows its line):

| Word | What it does |
|---|---|
| `pwd` · `cd ..` · `history` · `!!` · `!3` · `role <id>` · `login <user>` | where you are; back; the lines typed (earlier sessions too, numbered); run the last line again; run line 3; act as a role; say who you are (asked only in a client with more than one user with an email; new records carry your user) |
| `sum <column>` · `cat <id>` · `rm <id>` | add a column; show one record; delete one |
| `ninja <file>` · `load <file.csv>` · `diff <file.csv>` | stage a Ninja workbook or CSV; load rows from a file; compare a file with the records |
| `bim` · `mis` · `erp` | go into a group: help, Tab and the suggestions offer only its words (`cd ..` or Shift+Tab backs out) |
| `menu` | the ERP menu, walked like folders with `cd`; `red1 menu` opens it on a full screen |
| `cd Project 990000` · `cd 100` · `ls` · `cd Phase` | enter a record as a place (`cd <number>` inside its kind, also from the menu walk): `ls` lists its tabs with their record counts, `cd <tab>` opens one, `cd ..` goes back up |
| `status` | in a project: its earned value (PV, EV, AC, SPI and CPI per phase) |
| `vo` | in a building: the change between the model and its Project Order, issued as a Variation Order (asks y/N; approve it with `do CO <number>`) |
| `claim` | in a project: bill the completed phases not yet billed, a draft invoice and the preview of its accounting (asks y/N) |
| `grid` · `walk FP` · `day 5` · `compare 24` | the building's grid lines; walk a discipline; the schedule on a day; two days compared |
| `open marked` · `bay high` · `undo` · `save shed.db` · `close` | the Modeller kept open between lines |
| `help <word>` · `help verbs` · `level student` · `report` · `exit` | help; every door verb; fuller help; a gap to the owner; leave |

## What is not checked

A reply lists what its check did not cover. The same words apply to any answer: overlaps are bounding boxes first, a check covers only what moved, and **load capacity is never checked**. A reply with no red never means safe. The full list for the Modeller's edit report is in [the reference](FastScriptReference.md#what-is-not-checked).

## Troubleshooting

| What you see | What to do |
|---|---|
| `edit_cli is not at …` | One of the six files is missing. The message prints the `curl` line |
| `puppeteer not found` | Run `npm install puppeteer@24` in the same folder |
| `unknown verb` | The message lists every verb. Check the spelling against the [table](#the-verbs) |
| `missing input: …` | The verb needs that key. The table lists the inputs |
| `The Viewer tools need a bim-ootb checkout` | Run it as `node common/door/door.js` from a full checkout |
| `exit 1` with a Chrome message | Chrome's system libraries are missing on Linux. Puppeteer's troubleshooting page lists them |

**Limits to plan for.** Each Modeller call opens the whole building: about 10 to 40 seconds on the HospitalGarage. This is a measuring tool, not a service with uptime. A script with several Modeller lines opens the building once per line. **What you make at `red1>` stays in red1's own change log for now:** an order made at the prompt does not show in the browser ERP window, and one made in the window is not seen at the prompt. Joining the two is the next step.


## For developers

**The door line.** Every word becomes one door line, `app.verb key=value key=value`, and red1 prints it after `→`. You can type a door line straight at the prompt, or one-shot: `red1 'object.count building=Duplex kind=Element'` prints the answer, and `--json` prints the whole envelope. Several words in one shot are separated by `;` (`red1 'cd Duplex; count'`); `red1 -f FILE` runs a file of lines, a line that starts with `--` is a comment, and `--dry` tries it first. The door checks every line against a fixed list of verbs, calls the app's own code, and hands the answer back with what was not checked. A line that matches no verb is never guessed at; it comes back as a question.

![One door. Actors on the left speak the same verbs; the door parses, checks, binds, calls and replies; the app's own checks decide.](figs/one_door.svg)

Read the picture from left to right: the **actor** (a person at a terminal, or an AI through a tool connection); the **channel**, one list of verbs, each with a plain description, its inputs and a *harm* class; the **door**, which parses, checks, binds the line to who is asking, calls and replies; the **app**, whose own checks decide, and a change that adds a new problem is undone with the reason. Connecting an AI is in the [AI Proposer Guide](ProposerGuide.md#connect-your-ai).

Each verb has a **harm class**: `read` (changes nothing), `trial` (a change made on a throwaway copy, judged, never saved), `writes`, `posts` or `sends`. The class is written once, in the verb list, so no actor can talk its way around it. A person at the terminal is trusted for every class; an AI for `read` and `trial` only, so a `writes` or `posts` line from an AI is held as a claim for a person to confirm ([the reference](FastScriptReference.md) shows one).

**From JavaScript** the same verbs are one object, generated from the vocabulary (a new verb needs no new code):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Limits.** Object words (`cd Element`, `ls`, `group`) need a model that carries the object dictionary; of the buildings here, only Duplex does. A list taller than the terminal stops each page (Space, q); a pipe gets every row.

**The reference.** Every command with its real output, the Modeller story (a 13 m bay refused with the app's own reason), scripts with named results, Ninja workbooks, the MIS terminal, the legacy comparison and the claim and confirm flow are in the [Fast Script Reference](FastScriptReference.md).

## The verbs

This table is **generated from the vocabulary file** (`common/door/verbs.json`) and a test checks that it matches, verb for verb. It is the same list the AI's tool menu is built from. *Harm* is explained above; *Needs* says which of the two downloads runs the verb.

<!-- GEN:verbs -->
| Verb | What it does | Inputs | Harm | Who may use it | Needs |
|---|---|---|---|---|---|
| `modeller.lines` | Read the grid | `building` | read | human, ai | the 6-file download |
| `modeller.try_shift` | Try shifting a grid line | `building`, `line`, `move` (metres) | trial | human, ai | the 6-file download |
| `viewer.counts` | Count elements | `building`, `by` (optional) | read | human, ai | the 6 files + the 2 Viewer files |
| `viewer.clashes` | List clashes between two disciplines | `building`, `discA`, `discB`, `rows` (optional) | read | human, ai | the 6 files + the 2 Viewer files |
| `viewer.film_path` | Film path visibility | `db`, `path` (optional) | read | human, ai | a bim-ootb checkout |
| `viewer.schedule_at` | Schedule state at a day | `building`, `day` (day number) | read | human, ai | a bim-ootb checkout |
| `viewer.schedule_compare` | Schedule engine against its reference | `building`, `shift_hours` (hours) (optional) | read | human, ai | a bim-ootb checkout |
| `modeller.widen_bay` | Widen a bay to a target width | `building`, `from`, `to`, `target` (metres) | trial | human, ai | the 6-file download |
| `modeller.walk` | What the walker would place | `building`, `discipline` | read | human, ai | a bim-ootb checkout |
| `object.describe` | Describe an object kind | `building`, `kind`, `uu` (optional) | read | human, ai | a bim-ootb checkout |
| `object.read` | Read an object | `building`, `kind`, `uu` | read | human, ai | a bim-ootb checkout |
| `object.history` | History of an object | `building`, `kind`, `uu` | read | human, ai | a bim-ootb checkout |
| `object.update` | Change one property of an object | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | a bim-ootb checkout |
| `object.attach` | Attach a file or note to an object | `building`, `kind`, `uu`, `file` (optional), `text` (optional) | writes | human, ai | a bim-ootb checkout |
| `object.count` | Count the records of a kind | `building`, `kind`, further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `object.list` | List records of a kind | `building`, `kind`, `columns` (optional), `sort` (optional), `limit` (optional), `offset` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `object.sum` | Add up a column | `building`, `kind`, `column`, further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `object.group` | Count by a column | `building`, `kind`, `by`, further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `witness.run` | Run a witness and read its verdict | `name` | trial | human, ai | a bim-ootb checkout |
| `witness.last` | Read the last recorded witness run | `name` | read | human, ai | a bim-ootb checkout |
| `legacy.status` | Is the legacy test stack up | none | read | human, ai | a bim-ootb checkout |
| `legacy.query` | Read rows of a legacy table | `table`, `columns` (optional), `sort` (optional), `limit` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `mis.column` | Who fills a column: twin and legacy side by side | `kind`, `column` | read | human, ai | a bim-ootb checkout |
| `legacy.compare` | Compare one record on the twin and on legacy | `kind`, `number`, `legacy` (optional) | read | human, ai | a bim-ootb checkout |
| `idempiere.where` | Find a name in the iDempiere source | `symbol`, `in` (optional), `limit` (optional) | read | human, ai | a bim-ootb checkout |
| `mis.pack` | Make the 2Pack zip from a data-model workbook | `book`, `version`, `out` (optional), `java` (optional), `package` (optional) | writes | human, ai | a bim-ootb checkout |
| `legacy.up` | Start the shared docker Postgres for the legacy test stack | none | writes | human, ai | a bim-ootb checkout |
| `legacy.refresh` | Refresh the legacy test instance from the base seed | none | writes | human, ai | a bim-ootb checkout |
| `legacy.witness` | Run the in-server witness on the legacy test instance | none | trial | human, ai | a bim-ootb checkout |
| `legacy.check` | Check a workbook's rows in the legacy test database | `book`, `version` (optional) | read | human, ai | a bim-ootb checkout |
| `legacy.plugin` | Put a data-model plugin on the legacy test instance and check it there | `book`, `version` | writes | human, ai | a bim-ootb checkout |
| `model.open` | Open 2D sheets in the Modeller | `sheets`, `type` (optional), `file` (optional) | trial | human, ai | a bim-ootb checkout |
| `model.convert` | Convert the open sheets to a 3D model | none | trial | human, ai | a bim-ootb checkout |
| `model.addbay` | Add a bay to the model | `end` | trial | human, ai | a bim-ootb checkout |
| `model.undo` | Undo the last model change | none | trial | human, ai | a bim-ootb checkout |
| `model.save` | Save the open model | `file` (optional) | writes | human, ai | a bim-ootb checkout |
| `model.close` | Close the Modeller session | `discard` (optional) | trial | human, ai | a bim-ootb checkout |
| `erp.process` | Run a dictionary process | `name`, `record` (optional), `kind` (optional), `dry` (optional), `role` (optional), further `column=value` filters (optional) | writes | human, ai | a bim-ootb checkout |
| `erp.order_state` | What the ERP holds for a building's selection, and what is legal next | `building`, further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `erp.project_status` | The earned-value status of a Project | `id` (optional), `number` (optional), `asof` (optional) | read | human, ai | a bim-ootb checkout |
| `erp.ask` | Ask the help a question | `question`, `lang` (optional), `role` (optional) | read | human, ai | a bim-ootb checkout |
| `mis.lookup` | The legal values of a column or a process parameter | `column`, `kind` (optional), `process` (optional), `id` (optional), `limit` (optional), `role` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `viewer.cost` | The cost of a selection of a building | `building`, `by` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `erp.find` | Find a document | `kind`, `number` | read | human, ai | a bim-ootb checkout |
| `erp.search` | Search documents by number | `text`, `role` (optional) | read | human, ai | a bim-ootb checkout |
| `erp.actions` | What can be done to a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | a bim-ootb checkout |
| `erp.complete` | Complete a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | a bim-ootb checkout |
| `erp.void` | Void a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | a bim-ootb checkout |
| `erp.close` | Close a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | a bim-ootb checkout |
| `erp.reverse` | Reverse - Correct a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | posts | human, ai | a bim-ootb checkout |
| `erp.prepare` | Prepare a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | a bim-ootb checkout |
| `erp.reactivate` | Re-activate a document | `kind`, `id` (optional), `number` (optional), `role` (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.describe` | Describe a kind of ERP record | `kind`, `role` (optional) | read | human, ai | a bim-ootb checkout |
| `mis.read` | Read an ERP record | `kind`, `id` (optional), `number` (optional), `role` (optional) | read | human, ai | a bim-ootb checkout |
| `mis.list` | List records | `kind`, `columns` (optional), `sort` (optional), `limit` (optional), `offset` (optional), `names` (optional), `role` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `mis.sum` | Add up a column | `kind`, `column`, `role` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `mis.group` | Count by a column | `kind`, `by`, `role` (optional), `window` (optional), further `column=value` filters (optional) | read | human, ai | a bim-ootb checkout |
| `mis.new` | Create a record | `kind`, `dry` (optional), `role` (optional), `window` (optional), further `column=value` filters (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.update` | Change a record | `kind`, `id` (optional), `number` (optional), `role` (optional), `window` (optional), further `column=value` filters (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.delete` | Delete a record | `kind`, `id` (optional), `number` (optional), `role` (optional), `window` (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.load` | Load records from a CSV | `kind`, `file`, `dry` (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.add_window` | Add a window from a CSV | `file`, `table` (optional), `workflow` (optional), `dry` (optional), `master` (optional) | writes | human, ai | a bim-ootb checkout |
| `ninja.exec` | Run a Ninja workbook | `file`, `dry` (optional), `data` (optional), `table` (optional) | writes | human, ai | a bim-ootb checkout |
| `ninja.workflow` | Give a table the document columns | `table`, `dry` (optional) | writes | human, ai | a bim-ootb checkout |
| `mis.diff` | Compare a CSV with the table | `kind`, `file`, `key` (optional) | read | human, ai | a bim-ootb checkout |
| `mis.menu` | Read the menu | `role` (optional), `find` (optional) | read | human, ai | a bim-ootb checkout |
| `ninja.rollback` | Undo a Ninja bundle | `bundle`, `dry` (optional) | writes | human, ai | a bim-ootb checkout |
| `ninja.export` | Write a Ninja bundle back as a workbook | `bundle` (optional), `window` (optional), `table` (optional), `file` | writes | human, ai | a bim-ootb checkout |

Old names that still run, each the same as the verb it points at: `erp.column` → `mis.column` · `erp.compare` → `legacy.compare` · `erp.pack` → `mis.pack` · `erp.legacy_plugin` → `legacy.plugin` · `erp.describe` → `mis.describe` · `erp.read` → `mis.read` · `erp.list` → `mis.list` · `erp.sum` → `mis.sum` · `erp.group` → `mis.group` · `erp.new` → `mis.new`
<!-- /GEN:verbs -->

**Coverage today.** The list is small on purpose: 68 verbs cover the Modeller's grid edits, its walker and a Modeller kept open between lines, a few Viewer questions, the schedule, generic object reading, counting and writing, the cost of a selection, the ERP document verbs, and any process of the ERP dictionary that has a port. The Viewer has 64 actions a person can press, and the door offers 6 Viewer verbs. The ERP has 1158 documents and processes, and the door offers 13 ERP verbs for a document's life and 15 MIS verbs that work on any table, and keeps 10 old names so earlier lines still run (the version line's count includes them). So this is a start, not the whole menu.


## How this page stays true

Every command in a grey block on this page and on the [reference](FastScriptReference.md) was run, and the output under it is what the command printed. A test, **W-FAST-SCRIPT-GUIDE** in the `bim-ootb` repository, runs them again from the download and the checkout, checks every number on this page against the runs, and checks that the verb table equals `verbs.json`. If a number here goes stale, that test fails.

Related: the [AI Proposer Guide](ProposerGuide.md) (connect an AI to the same door, and what an AI did with the checks), and the [Modeller guide](ModellerGuide.md).
